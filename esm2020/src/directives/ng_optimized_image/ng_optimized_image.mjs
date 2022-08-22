/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, inject, Injector, Input, NgZone, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
import { imgDirectiveDetails } from './error_helper';
import { IMAGE_LOADER } from './image_loaders/image_loader';
import { LCPImageObserver } from './lcp_image_observer';
import { PreconnectLinkChecker } from './preconnect_link_checker';
import * as i0 from "@angular/core";
/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
/**
 * RegExpr to determine whether a src in a srcset is using width descriptors.
 * Should match something like: "100w, 200w".
 */
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;
/**
 * RegExpr to determine whether a src in a srcset is using density descriptors.
 * Should match something like: "1x, 2x". Also supports decimals like "1.5x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d(\.\d+)?x\s*(,|$)){1,})$/;
/**
 * Srcset values with a density descriptor higher than this value will actively
 * throw an error. Such densities are not permitted as they cause image sizes
 * to be unreasonably large and slow down LCP.
 */
export const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
/**
 * Used only in error message text to communicate best practices, as we will
 * only throw based on the slightly more conservative ABSOLUTE_SRCSET_DENSITY_CAP.
 */
export const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
/**
 * Used to determine whether two aspect ratios are similar in value.
 */
const ASPECT_RATIO_TOLERANCE = .1;
/**
 * Used to determine whether the image has been requested at an overly
 * large size compared to the actual rendered image size (after taking
 * into account a typical device pixel ratio). In pixels.
 */
const OVERSIZED_IMAGE_TOLERANCE = 1000;
/**
 * Directive that improves image loading performance by enforcing best practices.
 *
 * `NgOptimizedImage` ensures that the loading of the Largest Contentful Paint (LCP) image is
 * prioritized by:
 * - Automatically setting the `fetchpriority` attribute on the `<img>` tag
 * - Lazy loading non-priority images by default
 * - Asserting that there is a corresponding preconnect link tag in the document head
 *
 * In addition, the directive:
 * - Generates appropriate asset URLs if a corresponding `ImageLoader` function is provided
 * - Requires that `width` and `height` are set
 * - Warns if `width` or `height` have been set incorrectly
 * - Warns if the image will be visually distorted when rendered
 *
 * @usageNotes
 * The `NgOptimizedImage` directive is marked as [standalone](guide/standalone-components) and can
 * be imported directly.
 *
 * Follow the steps below to enable and use the directive:
 * 1. Import it into the necessary NgModule or a standalone Component.
 * 2. Optionally provide an `ImageLoader` if you use an image hosting service.
 * 3. Update the necessary `<img>` tags in templates and replace `src` attributes with `rawSrc`.
 * Using a `rawSrc` allows the directive to control when the `src` gets set, which triggers an image
 * download.
 *
 * Step 1: import the `NgOptimizedImage` directive.
 *
 * ```typescript
 * import { NgOptimizedImage } from '@angular/common';
 *
 * // Include it into the necessary NgModule
 * @NgModule({
 *   imports: [NgOptimizedImage],
 * })
 * class AppModule {}
 *
 * // ... or a standalone Component
 * @Component({
 *   standalone: true
 *   imports: [NgOptimizedImage],
 * })
 * class MyStandaloneComponent {}
 * ```
 *
 * Step 2: configure a loader.
 *
 * To use the **default loader**: no additional code changes are necessary. The URL returned by the
 * generic loader will always match the value of "src". In other words, this loader applies no
 * transformations to the resource URL and the value of the `rawSrc` attribute will be used as is.
 *
 * To use an existing loader for a **third-party image service**: add the provider factory for your
 * chosen service to the `providers` array. In the example below, the Imgix loader is used:
 *
 * ```typescript
 * import {provideImgixLoader} from '@angular/common';
 *
 * // Call the function and add the result to the `providers` array:
 * providers: [
 *   provideImgixLoader("https://my.base.url/"),
 * ],
 * ```
 *
 * The `NgOptimizedImage` directive provides the following functions:
 * - `provideCloudflareLoader`
 * - `provideCloudinaryLoader`
 * - `provideImageKitLoader`
 * - `provideImgixLoader`
 *
 * If you use a different image provider, you can create a custom loader function as described
 * below.
 *
 * To use a **custom loader**: provide your loader function as a value for the `IMAGE_LOADER` DI
 * token.
 *
 * ```typescript
 * import {IMAGE_LOADER, ImageLoaderConfig} from '@angular/common';
 *
 * // Configure the loader using the `IMAGE_LOADER` token.
 * providers: [
 *   {
 *      provide: IMAGE_LOADER,
 *      useValue: (config: ImageLoaderConfig) => {
 *        return `https://example.com/${config.src}-${config.width}.jpg}`;
 *      }
 *   },
 * ],
 * ```
 *
 * Step 3: update `<img>` tags in templates to use `rawSrc` instead of `src`.
 *
 * ```
 * <img rawSrc="logo.png" width="200" height="100">
 * ```
 *
 * @publicApi
 * @developerPreview
 */
export class NgOptimizedImage {
    constructor() {
        this.imageLoader = inject(IMAGE_LOADER);
        this.renderer = inject(Renderer2);
        this.imgElement = inject(ElementRef).nativeElement;
        this.injector = inject(Injector);
        /**
         * Calculate the rewritten `src` once and store it.
         * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
         * `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
         * instance that might be already destroyed).
         */
        this._renderedSrc = null;
        this._priority = false;
    }
    /**
     * The intrinsic width of the image in pixels.
     */
    set width(value) {
        ngDevMode && assertGreaterThanZero(this, value, 'width');
        this._width = inputToInteger(value);
    }
    get width() {
        return this._width;
    }
    /**
     * The intrinsic height of the image in pixels.
     */
    set height(value) {
        ngDevMode && assertGreaterThanZero(this, value, 'height');
        this._height = inputToInteger(value);
    }
    get height() {
        return this._height;
    }
    /**
     * Indicates whether this image should have a high priority.
     */
    set priority(value) {
        this._priority = inputToBoolean(value);
    }
    get priority() {
        return this._priority;
    }
    ngOnInit() {
        if (ngDevMode) {
            assertNonEmptyInput(this, 'rawSrc', this.rawSrc);
            assertValidRawSrcset(this, this.rawSrcset);
            assertNoConflictingSrc(this);
            assertNoConflictingSrcset(this);
            assertNotBase64Image(this);
            assertNotBlobUrl(this);
            assertNonEmptyWidthAndHeight(this);
            assertValidLoadingInput(this);
            assertNoImageDistortion(this, this.imgElement, this.renderer);
            if (this.priority) {
                const checker = this.injector.get(PreconnectLinkChecker);
                checker.assertPreconnect(this.getRewrittenSrc(), this.rawSrc);
            }
            else {
                // Monitor whether an image is an LCP element only in case
                // the `priority` attribute is missing. Otherwise, an image
                // has the necessary settings and no extra checks are required.
                invokeLCPImageObserverCallback(this.injector, (observer) => observer.registerImage(this.getRewrittenSrc(), this.rawSrc));
            }
        }
        this.setHostAttributes();
    }
    setHostAttributes() {
        // Must set width/height explicitly in case they are bound (in which case they will
        // only be reflected and not found by the browser)
        this.setHostAttribute('width', this.width.toString());
        this.setHostAttribute('height', this.height.toString());
        this.setHostAttribute('loading', this.getLoadingBehavior());
        this.setHostAttribute('fetchpriority', this.getFetchPriority());
        // The `src` and `srcset` attributes should be set last since other attributes
        // could affect the image's loading behavior.
        this.setHostAttribute('src', this.getRewrittenSrc());
        if (this.rawSrcset) {
            this.setHostAttribute('srcset', this.getRewrittenSrcset());
        }
    }
    ngOnChanges(changes) {
        if (ngDevMode) {
            assertNoPostInitInputChange(this, changes, ['rawSrc', 'rawSrcset', 'width', 'height', 'priority']);
        }
    }
    getLoadingBehavior() {
        if (!this.priority && this.loading !== undefined) {
            return this.loading;
        }
        return this.priority ? 'eager' : 'lazy';
    }
    getFetchPriority() {
        return this.priority ? 'high' : 'auto';
    }
    getRewrittenSrc() {
        // ImageLoaderConfig supports setting a width property. However, we're not setting width here
        // because if the developer uses rendered width instead of intrinsic width in the HTML width
        // attribute, the image requested may be too small for 2x+ screens.
        if (!this._renderedSrc) {
            const imgConfig = { src: this.rawSrc };
            // Cache calculated image src to reuse it later in the code.
            this._renderedSrc = this.imageLoader(imgConfig);
        }
        return this._renderedSrc;
    }
    getRewrittenSrcset() {
        const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.rawSrcset);
        const finalSrcs = this.rawSrcset.split(',').filter(src => src !== '').map(srcStr => {
            srcStr = srcStr.trim();
            const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
            return `${this.imageLoader({ src: this.rawSrc, width })} ${srcStr}`;
        });
        return finalSrcs.join(', ');
    }
    ngOnDestroy() {
        if (ngDevMode) {
            if (!this.priority && this._renderedSrc !== null) {
                invokeLCPImageObserverCallback(this.injector, (observer) => observer.unregisterImage(this._renderedSrc));
            }
        }
    }
    setHostAttribute(name, value) {
        this.renderer.setAttribute(this.imgElement, name, value);
    }
}
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0-next.0+sha-b6fbbea", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.3.0-next.0+sha-b6fbbea", type: NgOptimizedImage, isStandalone: true, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", rawSrcset: "rawSrcset", width: "width", height: "height", loading: "loading", priority: "priority", src: "src", srcset: "srcset" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0-next.0+sha-b6fbbea", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[rawSrc]',
                }]
        }], propDecorators: { rawSrc: [{
                type: Input
            }], rawSrcset: [{
                type: Input
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], loading: [{
                type: Input
            }], priority: [{
                type: Input
            }], src: [{
                type: Input
            }], srcset: [{
                type: Input
            }] } });
/***** Helpers *****/
/**
 * Convert input value to integer.
 */
function inputToInteger(value) {
    return typeof value === 'string' ? parseInt(value, 10) : value;
}
/**
 * Convert input value to boolean.
 */
function inputToBoolean(value) {
    return value != null && `${value}` !== 'false';
}
/**
 * Invokes a function, passing an instance of the `LCPImageObserver` as an argument.
 *
 * Notes:
 * - the `LCPImageObserver` is a tree-shakable provider, provided in 'root',
 *   thus it's a singleton within this application
 * - the process of `LCPImageObserver` creation and an actual operation are invoked outside of the
 *   NgZone to make sure none of the calls inside the `LCPImageObserver` class trigger unnecessary
 *   change detection
 */
function invokeLCPImageObserverCallback(injector, operation) {
    const ngZone = injector.get(NgZone);
    return ngZone.runOutsideAngular(() => {
        const observer = injector.get(LCPImageObserver);
        operation(observer);
    });
}
/***** Assert functions *****/
/**
 * Verifies that there is no `src` set on a host element.
 */
function assertNoConflictingSrc(dir) {
    if (dir.src) {
        throw new RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir.rawSrc)} both \`src\` and \`rawSrc\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`src\` itself based on the value of \`rawSrc\`. ` +
            `To fix this, please remove the \`src\` attribute.`);
    }
}
/**
 * Verifies that there is no `srcset` set on a host element.
 */
function assertNoConflictingSrcset(dir) {
    if (dir.srcset) {
        throw new RuntimeError(2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */, `${imgDirectiveDetails(dir.rawSrc)} both \`srcset\` and \`rawSrcset\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`srcset\` itself based on the value of ` +
            `\`rawSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
    }
}
/**
 * Verifies that the `rawSrc` is not a Base64-encoded image.
 */
function assertNotBase64Image(dir) {
    let rawSrc = dir.rawSrc.trim();
    if (rawSrc.startsWith('data:')) {
        if (rawSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
            rawSrc = rawSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
        }
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc, false)} \`rawSrc\` is a Base64-encoded string ` +
            `(${rawSrc}). NgOptimizedImage does not support Base64-encoded strings. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`rawSrc\` and using a standard \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the `rawSrc` is not a Blob URL.
 */
function assertNotBlobUrl(dir) {
    const rawSrc = dir.rawSrc.trim();
    if (rawSrc.startsWith('blob:')) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} \`rawSrc\` was set to a blob URL (${rawSrc}). ` +
            `Blob URLs are not supported by the NgOptimizedImage directive. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`rawSrc\` and using a regular \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the input is set to a non-empty string.
 */
function assertNonEmptyInput(dir, name, value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    if (!isString || isEmptyString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} \`${name}\` has an invalid value ` +
            `(\`${value}\`). To fix this, change the value to a non-empty string.`);
    }
}
/**
 * Verifies that the `rawSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x".
 */
export function assertValidRawSrcset(dir, value) {
    if (value == null)
        return;
    assertNonEmptyInput(dir, 'rawSrcset', value);
    const stringVal = value;
    const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
    const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
    if (isValidDensityDescriptor) {
        assertUnderDensityCap(dir, stringVal);
    }
    const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
    if (!isValidSrcset) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} \`rawSrcset\` has an invalid value (\`${value}\`). ` +
            `To fix this, supply \`rawSrcset\` using a comma-separated list of one or more width ` +
            `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`);
    }
}
function assertUnderDensityCap(dir, value) {
    const underDensityCap = value.split(',').every(num => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
    if (!underDensityCap) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} the \`rawSrcset\` contains an unsupported image density:` +
            `\`${value}\`. NgOptimizedImage generally recommends a max image density of ` +
            `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
            `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
            `most use cases. Images that will be pinch-zoomed are typically the primary use case for` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
    }
}
/**
 * Creates a `RuntimeError` instance to represent a situation when an input is set after
 * the directive has initialized.
 */
function postInitInputChangeError(dir, inputName) {
    return new RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.rawSrc)} \`${inputName}\` was updated after initialization. ` +
        `The NgOptimizedImage directive will not react to this input change. ` +
        `To fix this, switch \`${inputName}\` a static value or wrap the image element ` +
        `in an *ngIf that is gated on the necessary value.`);
}
/**
 * Verify that none of the listed inputs has changed.
 */
function assertNoPostInitInputChange(dir, changes, inputs) {
    inputs.forEach(input => {
        const isUpdated = changes.hasOwnProperty(input);
        if (isUpdated && !changes[input].isFirstChange()) {
            if (input === 'rawSrc') {
                // When the `rawSrc` input changes, we detect that only in the
                // `ngOnChanges` hook, thus the `rawSrc` is already set. We use
                // `rawSrc` in the error message, so we use a previous value, but
                // not the updated one in it.
                dir = { rawSrc: changes[input].previousValue };
            }
            throw postInitInputChangeError(dir, input);
        }
    });
}
/**
 * Verifies that a specified input is a number greater than 0.
 */
function assertGreaterThanZero(dir, inputValue, inputName) {
    const validNumber = typeof inputValue === 'number' && inputValue > 0;
    const validString = typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
    if (!validNumber && !validString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} \`${inputName}\` has an invalid value ` +
            `(\`${inputValue}\`). To fix this, provide \`${inputName}\` ` +
            `as a number greater than 0.`);
    }
}
/**
 * Verifies that the rendered image is not visually distorted. Effectively this is checking:
 * - Whether the "width" and "height" attributes reflect the actual dimensions of the image.
 * - Whether image styling is "correct" (see below for a longer explanation).
 */
function assertNoImageDistortion(dir, img, renderer) {
    const removeListenerFn = renderer.listen(img, 'load', () => {
        removeListenerFn();
        // TODO: `clientWidth`, `clientHeight`, `naturalWidth` and `naturalHeight`
        // are typed as number, but we run `parseFloat` (which accepts strings only).
        // Verify whether `parseFloat` is needed in the cases below.
        const renderedWidth = parseFloat(img.clientWidth);
        const renderedHeight = parseFloat(img.clientHeight);
        const renderedAspectRatio = renderedWidth / renderedHeight;
        const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
        const intrinsicWidth = parseFloat(img.naturalWidth);
        const intrinsicHeight = parseFloat(img.naturalHeight);
        const intrinsicAspectRatio = intrinsicWidth / intrinsicHeight;
        const suppliedWidth = dir.width;
        const suppliedHeight = dir.height;
        const suppliedAspectRatio = suppliedWidth / suppliedHeight;
        // Tolerance is used to account for the impact of subpixel rendering.
        // Due to subpixel rendering, the rendered, intrinsic, and supplied
        // aspect ratios of a correctly configured image may not exactly match.
        // For example, a `width=4030 height=3020` image might have a rendered
        // size of "1062w, 796.48h". (An aspect ratio of 1.334... vs. 1.333...)
        const inaccurateDimensions = Math.abs(suppliedAspectRatio - intrinsicAspectRatio) > ASPECT_RATIO_TOLERANCE;
        const stylingDistortion = nonZeroRenderedDimensions &&
            Math.abs(intrinsicAspectRatio - renderedAspectRatio) > ASPECT_RATIO_TOLERANCE;
        if (inaccurateDimensions) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} the aspect ratio of the image does not match ` +
                `the aspect ratio indicated by the width and height attributes. ` +
                `Intrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${intrinsicAspectRatio}). Supplied width and height attributes: ` +
                `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${suppliedAspectRatio}). ` +
                `To fix this, update the width and height attributes.`));
        }
        else if (stylingDistortion) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} the aspect ratio of the rendered image ` +
                `does not match the image's intrinsic aspect ratio. ` +
                `Intrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${intrinsicAspectRatio}). Rendered image size: ` +
                `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` +
                `${renderedAspectRatio}). This issue can occur if "width" and "height" ` +
                `attributes are added to an image without updating the corresponding ` +
                `image styling. To fix this, adjust image styling. In most cases, ` +
                `adding "height: auto" or "width: auto" to the image styling will fix ` +
                `this issue.`));
        }
        else if (!dir.rawSrcset && nonZeroRenderedDimensions) {
            // If `rawSrcset` hasn't been set, sanity check the intrinsic size.
            const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
            const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
            const oversizedWidth = (intrinsicWidth - recommendedWidth) >= OVERSIZED_IMAGE_TOLERANCE;
            const oversizedHeight = (intrinsicHeight - recommendedHeight) >= OVERSIZED_IMAGE_TOLERANCE;
            if (oversizedWidth || oversizedHeight) {
                console.warn(formatRuntimeError(2960 /* RuntimeErrorCode.OVERSIZED_IMAGE */, `${imgDirectiveDetails(dir.rawSrc)} the intrinsic image is significantly ` +
                    `larger than necessary. ` +
                    `\nRendered image size: ${renderedWidth}w x ${renderedHeight}h. ` +
                    `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. ` +
                    `\nRecommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. ` +
                    `\nNote: Recommended intrinsic image size is calculated assuming a maximum DPR of ` +
                    `${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image ` +
                    `or consider using the "rawSrcset" and "sizes" attributes.`));
            }
        }
    });
}
/**
 * Verifies that a specified input is set.
 */
function assertNonEmptyWidthAndHeight(dir) {
    let missingAttributes = [];
    if (dir.width === undefined)
        missingAttributes.push('width');
    if (dir.height === undefined)
        missingAttributes.push('height');
    if (missingAttributes.length > 0) {
        throw new RuntimeError(2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir.rawSrc)} these required attributes ` +
            `are missing: ${missingAttributes.map(attr => `"${attr}"`).join(', ')}. ` +
            `Including "width" and "height" attributes will prevent image-related layout shifts. ` +
            `To fix this, include "width" and "height" attributes on the image tag.`);
    }
}
/**
 * Verifies that the `loading` attribute is set to a valid input &
 * is not used on priority images.
 */
function assertValidLoadingInput(dir) {
    if (dir.loading && dir.priority) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} the \`loading\` attribute ` +
            `was used on an image that was marked "priority". ` +
            `Setting \`loading\` on priority images is not allowed ` +
            `because these images will always be eagerly loaded. ` +
            `To fix this, remove the “loading” attribute from the priority image.`);
    }
    const validInputs = ['auto', 'eager', 'lazy'];
    if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} the \`loading\` attribute ` +
            `has an invalid value (\`${dir.loading}\`). ` +
            `To fix this, provide a valid value ("lazy", "eager", or "auto").`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFnQyxTQUFTLEVBQWlCLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFJdk4sT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzFELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDOztBQUVoRTs7Ozs7O0dBTUc7QUFDSCxNQUFNLDhCQUE4QixHQUFHLEVBQUUsQ0FBQztBQUUxQzs7O0dBR0c7QUFDSCxNQUFNLDZCQUE2QixHQUFHLDJCQUEyQixDQUFDO0FBRWxFOzs7R0FHRztBQUNILE1BQU0sK0JBQStCLEdBQUcsa0NBQWtDLENBQUM7QUFFM0U7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQztBQUU3Qzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSw4QkFBOEIsR0FBRyxDQUFDLENBQUM7QUFFaEQ7O0dBRUc7QUFDSCxNQUFNLHNCQUFzQixHQUFHLEVBQUUsQ0FBQztBQUVsQzs7OztHQUlHO0FBQ0gsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUM7QUFFdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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bGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIGluamVjdCwgSW5qZWN0b3IsIElucHV0LCBOZ1pvbmUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFJlbmRlcmVyMiwgU2ltcGxlQ2hhbmdlcywgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtJTUFHRV9MT0FERVJ9IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZV9sb2FkZXInO1xuaW1wb3J0IHtMQ1BJbWFnZU9ic2VydmVyfSBmcm9tICcuL2xjcF9pbWFnZV9vYnNlcnZlcic7XG5pbXBvcnQge1ByZWNvbm5lY3RMaW5rQ2hlY2tlcn0gZnJvbSAnLi9wcmVjb25uZWN0X2xpbmtfY2hlY2tlcic7XG5cbi8qKlxuICogV2hlbiBhIEJhc2U2NC1lbmNvZGVkIGltYWdlIGlzIHBhc3NlZCBhcyBhbiBpbnB1dCB0byB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSxcbiAqIGFuIGVycm9yIGlzIHRocm93bi4gVGhlIGltYWdlIGNvbnRlbnQgKGFzIGEgc3RyaW5nKSBtaWdodCBiZSB2ZXJ5IGxvbmcsIHRodXMgbWFraW5nXG4gKiBpdCBoYXJkIHRvIHJlYWQgYW4gZXJyb3IgbWVzc2FnZSBpZiB0aGUgZW50aXJlIHN0cmluZyBpcyBpbmNsdWRlZC4gVGhpcyBjb25zdCBkZWZpbmVzXG4gKiB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW50byB0aGUgZXJyb3IgbWVzc2FnZS4gVGhlIHJlc3RcbiAqIG9mIHRoZSBjb250ZW50IGlzIHRydW5jYXRlZC5cbiAqL1xuY29uc3QgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SID0gNTA7XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyB3aWR0aCBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxMDB3LCAyMDB3XCIuXG4gKi9cbmNvbnN0IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrd1xccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxeCwgMnhcIi4gQWxzbyBzdXBwb3J0cyBkZWNpbWFscyBsaWtlIFwiMS41eFwiLlxuICovXG5jb25zdCBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQoXFwuXFxkKyk/eFxccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFNyY3NldCB2YWx1ZXMgd2l0aCBhIGRlbnNpdHkgZGVzY3JpcHRvciBoaWdoZXIgdGhhbiB0aGlzIHZhbHVlIHdpbGwgYWN0aXZlbHlcbiAqIHRocm93IGFuIGVycm9yLiBTdWNoIGRlbnNpdGllcyBhcmUgbm90IHBlcm1pdHRlZCBhcyB0aGV5IGNhdXNlIGltYWdlIHNpemVzXG4gKiB0byBiZSB1bnJlYXNvbmFibHkgbGFyZ2UgYW5kIHNsb3cgZG93biBMQ1AuXG4gKi9cbmV4cG9ydCBjb25zdCBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAgPSAzO1xuXG4vKipcbiAqIFVzZWQgb25seSBpbiBlcnJvciBtZXNzYWdlIHRleHQgdG8gY29tbXVuaWNhdGUgYmVzdCBwcmFjdGljZXMsIGFzIHdlIHdpbGxcbiAqIG9ubHkgdGhyb3cgYmFzZWQgb24gdGhlIHNsaWdodGx5IG1vcmUgY29uc2VydmF0aXZlIEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUC5cbiAqL1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCA9IDI7XG5cbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYXNwZWN0IHJhdGlvcyBhcmUgc2ltaWxhciBpbiB2YWx1ZS5cbiAqL1xuY29uc3QgQVNQRUNUX1JBVElPX1RPTEVSQU5DRSA9IC4xO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGltYWdlIGhhcyBiZWVuIHJlcXVlc3RlZCBhdCBhbiBvdmVybHlcbiAqIGxhcmdlIHNpemUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCByZW5kZXJlZCBpbWFnZSBzaXplIChhZnRlciB0YWtpbmdcbiAqIGludG8gYWNjb3VudCBhIHR5cGljYWwgZGV2aWNlIHBpeGVsIHJhdGlvKS4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTAwMDtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdGhhdCBpbXByb3ZlcyBpbWFnZSBsb2FkaW5nIHBlcmZvcm1hbmNlIGJ5IGVuZm9yY2luZyBiZXN0IHByYWN0aWNlcy5cbiAqXG4gKiBgTmdPcHRpbWl6ZWRJbWFnZWAgZW5zdXJlcyB0aGF0IHRoZSBsb2FkaW5nIG9mIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgaW1hZ2UgaXNcbiAqIHByaW9yaXRpemVkIGJ5OlxuICogLSBBdXRvbWF0aWNhbGx5IHNldHRpbmcgdGhlIGBmZXRjaHByaW9yaXR5YCBhdHRyaWJ1dGUgb24gdGhlIGA8aW1nPmAgdGFnXG4gKiAtIExhenkgbG9hZGluZyBub24tcHJpb3JpdHkgaW1hZ2VzIGJ5IGRlZmF1bHRcbiAqIC0gQXNzZXJ0aW5nIHRoYXQgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIHByZWNvbm5lY3QgbGluayB0YWcgaW4gdGhlIGRvY3VtZW50IGhlYWRcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIGRpcmVjdGl2ZTpcbiAqIC0gR2VuZXJhdGVzIGFwcHJvcHJpYXRlIGFzc2V0IFVSTHMgaWYgYSBjb3JyZXNwb25kaW5nIGBJbWFnZUxvYWRlcmAgZnVuY3Rpb24gaXMgcHJvdmlkZWRcbiAqIC0gUmVxdWlyZXMgdGhhdCBgd2lkdGhgIGFuZCBgaGVpZ2h0YCBhcmUgc2V0XG4gKiAtIFdhcm5zIGlmIGB3aWR0aGAgb3IgYGhlaWdodGAgaGF2ZSBiZWVuIHNldCBpbmNvcnJlY3RseVxuICogLSBXYXJucyBpZiB0aGUgaW1hZ2Ugd2lsbCBiZSB2aXN1YWxseSBkaXN0b3J0ZWQgd2hlbiByZW5kZXJlZFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBpcyBtYXJrZWQgYXMgW3N0YW5kYWxvbmVdKGd1aWRlL3N0YW5kYWxvbmUtY29tcG9uZW50cykgYW5kIGNhblxuICogYmUgaW1wb3J0ZWQgZGlyZWN0bHkuXG4gKlxuICogRm9sbG93IHRoZSBzdGVwcyBiZWxvdyB0byBlbmFibGUgYW5kIHVzZSB0aGUgZGlyZWN0aXZlOlxuICogMS4gSW1wb3J0IGl0IGludG8gdGhlIG5lY2Vzc2FyeSBOZ01vZHVsZSBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50LlxuICogMi4gT3B0aW9uYWxseSBwcm92aWRlIGFuIGBJbWFnZUxvYWRlcmAgaWYgeW91IHVzZSBhbiBpbWFnZSBob3N0aW5nIHNlcnZpY2UuXG4gKiAzLiBVcGRhdGUgdGhlIG5lY2Vzc2FyeSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIGFuZCByZXBsYWNlIGBzcmNgIGF0dHJpYnV0ZXMgd2l0aCBgcmF3U3JjYC5cbiAqIFVzaW5nIGEgYHJhd1NyY2AgYWxsb3dzIHRoZSBkaXJlY3RpdmUgdG8gY29udHJvbCB3aGVuIHRoZSBgc3JjYCBnZXRzIHNldCwgd2hpY2ggdHJpZ2dlcnMgYW4gaW1hZ2VcbiAqIGRvd25sb2FkLlxuICpcbiAqIFN0ZXAgMTogaW1wb3J0IHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IE5nT3B0aW1pemVkSW1hZ2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIEluY2x1ZGUgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlXG4gKiBATmdNb2R1bGUoe1xuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgQXBwTW9kdWxlIHt9XG4gKlxuICogLy8gLi4uIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnRcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlXG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBNeVN0YW5kYWxvbmVDb21wb25lbnQge31cbiAqIGBgYFxuICpcbiAqIFN0ZXAgMjogY29uZmlndXJlIGEgbG9hZGVyLlxuICpcbiAqIFRvIHVzZSB0aGUgKipkZWZhdWx0IGxvYWRlcioqOiBubyBhZGRpdGlvbmFsIGNvZGUgY2hhbmdlcyBhcmUgbmVjZXNzYXJ5LiBUaGUgVVJMIHJldHVybmVkIGJ5IHRoZVxuICogZ2VuZXJpYyBsb2FkZXIgd2lsbCBhbHdheXMgbWF0Y2ggdGhlIHZhbHVlIG9mIFwic3JjXCIuIEluIG90aGVyIHdvcmRzLCB0aGlzIGxvYWRlciBhcHBsaWVzIG5vXG4gKiB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhlIHJlc291cmNlIFVSTCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBgcmF3U3JjYCBhdHRyaWJ1dGUgd2lsbCBiZSB1c2VkIGFzIGlzLlxuICpcbiAqIFRvIHVzZSBhbiBleGlzdGluZyBsb2FkZXIgZm9yIGEgKip0aGlyZC1wYXJ0eSBpbWFnZSBzZXJ2aWNlKio6IGFkZCB0aGUgcHJvdmlkZXIgZmFjdG9yeSBmb3IgeW91clxuICogY2hvc2VuIHNlcnZpY2UgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5LiBJbiB0aGUgZXhhbXBsZSBiZWxvdywgdGhlIEltZ2l4IGxvYWRlciBpcyB1c2VkOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7cHJvdmlkZUltZ2l4TG9hZGVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENhbGwgdGhlIGZ1bmN0aW9uIGFuZCBhZGQgdGhlIHJlc3VsdCB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXk6XG4gKiBwcm92aWRlcnM6IFtcbiAqICAgcHJvdmlkZUltZ2l4TG9hZGVyKFwiaHR0cHM6Ly9teS5iYXNlLnVybC9cIiksXG4gKiBdLFxuICogYGBgXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgcHJvdmlkZXMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gKiAtIGBwcm92aWRlQ2xvdWRmbGFyZUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVDbG91ZGluYXJ5TG9hZGVyYFxuICogLSBgcHJvdmlkZUltYWdlS2l0TG9hZGVyYFxuICogLSBgcHJvdmlkZUltZ2l4TG9hZGVyYFxuICpcbiAqIElmIHlvdSB1c2UgYSBkaWZmZXJlbnQgaW1hZ2UgcHJvdmlkZXIsIHlvdSBjYW4gY3JlYXRlIGEgY3VzdG9tIGxvYWRlciBmdW5jdGlvbiBhcyBkZXNjcmliZWRcbiAqIGJlbG93LlxuICpcbiAqIFRvIHVzZSBhICoqY3VzdG9tIGxvYWRlcioqOiBwcm92aWRlIHlvdXIgbG9hZGVyIGZ1bmN0aW9uIGFzIGEgdmFsdWUgZm9yIHRoZSBgSU1BR0VfTE9BREVSYCBESVxuICogdG9rZW4uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENvbmZpZ3VyZSB0aGUgbG9hZGVyIHVzaW5nIHRoZSBgSU1BR0VfTE9BREVSYCB0b2tlbi5cbiAqIHByb3ZpZGVyczogW1xuICogICB7XG4gKiAgICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAqICAgICAgdXNlVmFsdWU6IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiB7XG4gKiAgICAgICAgcmV0dXJuIGBodHRwczovL2V4YW1wbGUuY29tLyR7Y29uZmlnLnNyY30tJHtjb25maWcud2lkdGh9LmpwZ31gO1xuICogICAgICB9XG4gKiAgIH0sXG4gKiBdLFxuICogYGBgXG4gKlxuICogU3RlcCAzOiB1cGRhdGUgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyB0byB1c2UgYHJhd1NyY2AgaW5zdGVhZCBvZiBgc3JjYC5cbiAqXG4gKiBgYGBcbiAqIDxpbWcgcmF3U3JjPVwibG9nby5wbmdcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjEwMFwiPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnaW1nW3Jhd1NyY10nLFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaW1hZ2VMb2FkZXIgPSBpbmplY3QoSU1BR0VfTE9BREVSKTtcbiAgcHJpdmF0ZSByZW5kZXJlciA9IGluamVjdChSZW5kZXJlcjIpO1xuICBwcml2YXRlIGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcbiAgcHJpdmF0ZSBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgcmV3cml0dGVuIGBzcmNgIG9uY2UgYW5kIHN0b3JlIGl0LlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCByZXBldGl0aXZlIGNhbGN1bGF0aW9ucyBhbmQgbWFrZSBzdXJlIHRoZSBkaXJlY3RpdmUgY2xlYW51cCBpbiB0aGVcbiAgICogYG5nT25EZXN0cm95YCBkb2VzIG5vdCByZWx5IG9uIHRoZSBgSU1BR0VfTE9BREVSYCBsb2dpYyAod2hpY2ggaW4gdHVybiBjYW4gcmVseSBvbiBzb21lIG90aGVyXG4gICAqIGluc3RhbmNlIHRoYXQgbWlnaHQgYmUgYWxyZWFkeSBkZXN0cm95ZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyZWRTcmM6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgc291cmNlIGltYWdlLlxuICAgKiBJbWFnZSBuYW1lIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgYW5kIHRoZSBmaW5hbCBVUkwgd2lsbCBiZSBhcHBsaWVkIGFzIHRoZSBgc3JjYFxuICAgKiBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoKSByYXdTcmMhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAgICogVGhlIGltYWdlIG5hbWUgd2lsbCBiZSB0YWtlbiBmcm9tIGByYXdTcmNgIGFuZCBjb21iaW5lZCB3aXRoIHRoZSBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHlcbiAgICogZGVzY3JpcHRvcnMgdG8gZ2VuZXJhdGUgdGhlIGZpbmFsIGBzcmNzZXRgIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogYGBgXG4gICAqIDxpbWcgcmF3U3JjPVwiaGVsbG8uanBnXCIgcmF3U3Jjc2V0PVwiMTAwdywgMjAwd1wiIC8+ICA9PlxuICAgKiA8aW1nIHNyYz1cInBhdGgvaGVsbG8uanBnXCIgc3Jjc2V0PVwicGF0aC9oZWxsby5qcGc/dz0xMDAgMTAwdywgcGF0aC9oZWxsby5qcGc/dz0yMDAgMjAwd1wiIC8+XG4gICAqIGBgYFxuICAgKi9cbiAgQElucHV0KCkgcmF3U3Jjc2V0ITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgaW50cmluc2ljIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgd2lkdGgodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydEdyZWF0ZXJUaGFuWmVybyh0aGlzLCB2YWx1ZSwgJ3dpZHRoJyk7XG4gICAgdGhpcy5fd2lkdGggPSBpbnB1dFRvSW50ZWdlcih2YWx1ZSk7XG4gIH1cbiAgZ2V0IHdpZHRoKCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuICBwcml2YXRlIF93aWR0aD86IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBoZWlnaHQodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydEdyZWF0ZXJUaGFuWmVybyh0aGlzLCB2YWx1ZSwgJ2hlaWdodCcpO1xuICAgIHRoaXMuX2hlaWdodCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgaGVpZ2h0KCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cbiAgcHJpdmF0ZSBfaGVpZ2h0PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVzaXJlZCBsb2FkaW5nIGJlaGF2aW9yIChsYXp5LCBlYWdlciwgb3IgYXV0bykuXG4gICAqXG4gICAqIFNldHRpbmcgaW1hZ2VzIGFzIGxvYWRpbmc9J2VhZ2VyJyBvciBsb2FkaW5nPSdhdXRvJyBtYXJrcyB0aGVtXG4gICAqIGFzIG5vbi1wcmlvcml0eSBpbWFnZXMuIEF2b2lkIGNoYW5naW5nIHRoaXMgaW5wdXQgZm9yIHByaW9yaXR5IGltYWdlcy5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRpbmc/OiAnbGF6eSd8J2VhZ2VyJ3wnYXV0byc7XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW1hZ2Ugc2hvdWxkIGhhdmUgYSBoaWdoIHByaW9yaXR5LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHByaW9yaXR5KHZhbHVlOiBzdHJpbmd8Ym9vbGVhbnx1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9wcmlvcml0eSA9IGlucHV0VG9Cb29sZWFuKHZhbHVlKTtcbiAgfVxuICBnZXQgcHJpb3JpdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByaW9yaXR5O1xuICB9XG4gIHByaXZhdGUgX3ByaW9yaXR5ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFZhbHVlIG9mIHRoZSBgc3JjYCBhdHRyaWJ1dGUgaWYgc2V0IG9uIHRoZSBob3N0IGA8aW1nPmAgZWxlbWVudC5cbiAgICogVGhpcyBpbnB1dCBpcyBleGNsdXNpdmVseSByZWFkIHRvIGFzc2VydCB0aGF0IGBzcmNgIGlzIG5vdCBzZXQgaW4gY29uZmxpY3RcbiAgICogd2l0aCBgcmF3U3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYHJhd1NyY3NldGAgYW5kIHRoYXQgaW1hZ2VzIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyY3NldD86IHN0cmluZztcblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb25FbXB0eUlucHV0KHRoaXMsICdyYXdTcmMnLCB0aGlzLnJhd1NyYyk7XG4gICAgICBhc3NlcnRWYWxpZFJhd1NyY3NldCh0aGlzLCB0aGlzLnJhd1NyY3NldCk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldCh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJhc2U2NEltYWdlKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmxvYlVybCh0aGlzKTtcbiAgICAgIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dCh0aGlzKTtcbiAgICAgIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlcik7XG4gICAgICBpZiAodGhpcy5wcmlvcml0eSkge1xuICAgICAgICBjb25zdCBjaGVja2VyID0gdGhpcy5pbmplY3Rvci5nZXQoUHJlY29ubmVjdExpbmtDaGVja2VyKTtcbiAgICAgICAgY2hlY2tlci5hc3NlcnRQcmVjb25uZWN0KHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMucmF3U3JjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE1vbml0b3Igd2hldGhlciBhbiBpbWFnZSBpcyBhbiBMQ1AgZWxlbWVudCBvbmx5IGluIGNhc2VcbiAgICAgICAgLy8gdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGlzIG1pc3NpbmcuIE90aGVyd2lzZSwgYW4gaW1hZ2VcbiAgICAgICAgLy8gaGFzIHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgYW5kIG5vIGV4dHJhIGNoZWNrcyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIGludm9rZUxDUEltYWdlT2JzZXJ2ZXJDYWxsYmFjayhcbiAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IsXG4gICAgICAgICAgICAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLnJhd1NyYykpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGVzKCk7XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGVzKCkge1xuICAgIC8vIE11c3Qgc2V0IHdpZHRoL2hlaWdodCBleHBsaWNpdGx5IGluIGNhc2UgdGhleSBhcmUgYm91bmQgKGluIHdoaWNoIGNhc2UgdGhleSB3aWxsXG4gICAgLy8gb25seSBiZSByZWZsZWN0ZWQgYW5kIG5vdCBmb3VuZCBieSB0aGUgYnJvd3NlcilcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCEudG9TdHJpbmcoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodCEudG9TdHJpbmcoKSk7XG5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG4gICAgLy8gVGhlIGBzcmNgIGFuZCBgc3Jjc2V0YCBhdHRyaWJ1dGVzIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCB0aGlzLmdldFJld3JpdHRlblNyYygpKTtcbiAgICBpZiAodGhpcy5yYXdTcmNzZXQpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3Jjc2V0JywgdGhpcy5nZXRSZXdyaXR0ZW5TcmNzZXQoKSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgICAgICAgICB0aGlzLCBjaGFuZ2VzLCBbJ3Jhd1NyYycsICdyYXdTcmNzZXQnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ3ByaW9yaXR5J10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMubG9hZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgaWYgKCF0aGlzLl9yZW5kZXJlZFNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5yYXdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IHRoaXMuaW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVkU3JjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB3aWR0aFNyY1NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodGhpcy5yYXdTcmNzZXQpO1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IHRoaXMucmF3U3Jjc2V0LnNwbGl0KCcsJykuZmlsdGVyKHNyYyA9PiBzcmMgIT09ICcnKS5tYXAoc3JjU3RyID0+IHtcbiAgICAgIHNyY1N0ciA9IHNyY1N0ci50cmltKCk7XG4gICAgICBjb25zdCB3aWR0aCA9IHdpZHRoU3JjU2V0ID8gcGFyc2VGbG9hdChzcmNTdHIpIDogcGFyc2VGbG9hdChzcmNTdHIpICogdGhpcy53aWR0aCE7XG4gICAgICByZXR1cm4gYCR7dGhpcy5pbWFnZUxvYWRlcih7c3JjOiB0aGlzLnJhd1NyYywgd2lkdGh9KX0gJHtzcmNTdHJ9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5fcmVuZGVyZWRTcmMgIT09IG51bGwpIHtcbiAgICAgICAgaW52b2tlTENQSW1hZ2VPYnNlcnZlckNhbGxiYWNrKFxuICAgICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gb2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3JlbmRlcmVkU3JjISkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmltZ0VsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG4vKioqKiogSGVscGVycyAqKioqKi9cblxuLyoqXG4gKiBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGludGVnZXIuXG4gKi9cbmZ1bmN0aW9uIGlucHV0VG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCk6IG51bWJlcnx1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGJvb2xlYW4uXG4gKi9cbmZ1bmN0aW9uIGlucHV0VG9Cb29sZWFuKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGAke3ZhbHVlfWAgIT09ICdmYWxzZSc7XG59XG5cbi8qKlxuICogSW52b2tlcyBhIGZ1bmN0aW9uLCBwYXNzaW5nIGFuIGluc3RhbmNlIG9mIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgYXMgYW4gYXJndW1lbnQuXG4gKlxuICogTm90ZXM6XG4gKiAtIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgaXMgYSB0cmVlLXNoYWthYmxlIHByb3ZpZGVyLCBwcm92aWRlZCBpbiAncm9vdCcsXG4gKiAgIHRodXMgaXQncyBhIHNpbmdsZXRvbiB3aXRoaW4gdGhpcyBhcHBsaWNhdGlvblxuICogLSB0aGUgcHJvY2VzcyBvZiBgTENQSW1hZ2VPYnNlcnZlcmAgY3JlYXRpb24gYW5kIGFuIGFjdHVhbCBvcGVyYXRpb24gYXJlIGludm9rZWQgb3V0c2lkZSBvZiB0aGVcbiAqICAgTmdab25lIHRvIG1ha2Ugc3VyZSBub25lIG9mIHRoZSBjYWxscyBpbnNpZGUgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBjbGFzcyB0cmlnZ2VyIHVubmVjZXNzYXJ5XG4gKiAgIGNoYW5nZSBkZXRlY3Rpb25cbiAqL1xuZnVuY3Rpb24gaW52b2tlTENQSW1hZ2VPYnNlcnZlckNhbGxiYWNrKFxuICAgIGluamVjdG9yOiBJbmplY3Rvciwgb3BlcmF0aW9uOiAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+IHZvaWQpOiB2b2lkIHtcbiAgY29uc3Qgbmdab25lID0gaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gIHJldHVybiBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgIGNvbnN0IG9ic2VydmVyID0gaW5qZWN0b3IuZ2V0KExDUEltYWdlT2JzZXJ2ZXIpO1xuICAgIG9wZXJhdGlvbihvYnNlcnZlcik7XG4gIH0pO1xufVxuXG4vKioqKiogQXNzZXJ0IGZ1bmN0aW9ucyAqKioqKi9cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmMpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IGJvdGggXFxgc3JjXFxgIGFuZCBcXGByYXdTcmNcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGByYXdTcmNcXGAuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3Jjc2V0YCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBib3RoIFxcYHNyY3NldFxcYCBhbmQgXFxgcmF3U3Jjc2V0XFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3Jjc2V0XFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYCArXG4gICAgICAgICAgICBgXFxgcmF3U3Jjc2V0XFxgLiBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3Jjc2V0XFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAocmF3U3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgcmF3U3JjID0gcmF3U3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjLCBmYWxzZSl9IFxcYHJhd1NyY1xcYCBpcyBhIEJhc2U2NC1lbmNvZGVkIHN0cmluZyBgICtcbiAgICAgICAgICAgIGAoJHtyYXdTcmN9KS4gTmdPcHRpbWl6ZWRJbWFnZSBkb2VzIG5vdCBzdXBwb3J0IEJhc2U2NC1lbmNvZGVkIHN0cmluZ3MuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICAgICAgYGJ5IHJlbW92aW5nIFxcYHJhd1NyY1xcYCBhbmQgdXNpbmcgYSBzdGFuZGFyZCBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgcmF3U3JjID0gZGlyLnJhd1NyYy50cmltKCk7XG4gIGlmIChyYXdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gXFxgcmF3U3JjXFxgIHdhcyBzZXQgdG8gYSBibG9iIFVSTCAoJHtyYXdTcmN9KS4gYCArXG4gICAgICAgICAgICBgQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgcmF3U3JjXFxgIGFuZCB1c2luZyBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgaW5wdXQgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuICBjb25zdCBpc0VtcHR5U3RyaW5nID0gaXNTdHJpbmcgJiYgdmFsdWUudHJpbSgpID09PSAnJztcbiAgaWYgKCFpc1N0cmluZyB8fCBpc0VtcHR5U3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBcXGAke25hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIGAgK1xuICAgICAgICAgICAgYChcXGAke3ZhbHVlfVxcYCkuIFRvIGZpeCB0aGlzLCBjaGFuZ2UgdGhlIHZhbHVlIHRvIGEgbm9uLWVtcHR5IHN0cmluZy5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNzZXRgIGlzIGluIGEgdmFsaWQgZm9ybWF0LCBlLmcuIFwiMTAwdywgMjAwd1wiIG9yIFwiMXgsIDJ4XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZFJhd1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyLCAncmF3U3Jjc2V0JywgdmFsdWUpO1xuICBjb25zdCBzdHJpbmdWYWwgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gIGNvbnN0IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG4gIGNvbnN0IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvciA9IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuXG4gIGlmIChpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IpIHtcbiAgICBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyLCBzdHJpbmdWYWwpO1xuICB9XG5cbiAgY29uc3QgaXNWYWxpZFNyY3NldCA9IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgfHwgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yO1xuICBpZiAoIWlzVmFsaWRTcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IFxcYHJhd1NyY3NldFxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHt2YWx1ZX1cXGApLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgc3VwcGx5IFxcYHJhd1NyY3NldFxcYCB1c2luZyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG9uZSBvciBtb3JlIHdpZHRoIGAgK1xuICAgICAgICAgICAgYGRlc2NyaXB0b3JzIChlLmcuIFwiMTAwdywgMjAwd1wiKSBvciBkZW5zaXR5IGRlc2NyaXB0b3JzIChlLmcuIFwiMXgsIDJ4XCIpLmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiBzdHJpbmcpIHtcbiAgY29uc3QgdW5kZXJEZW5zaXR5Q2FwID1cbiAgICAgIHZhbHVlLnNwbGl0KCcsJykuZXZlcnkobnVtID0+IG51bSA9PT0gJycgfHwgcGFyc2VGbG9hdChudW0pIDw9IEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUCk7XG4gIGlmICghdW5kZXJEZW5zaXR5Q2FwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtcbiAgICAgICAgICAgIGltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICAgICAgZGlyLnJhd1NyYyl9IHRoZSBcXGByYXdTcmNzZXRcXGAgY29udGFpbnMgYW4gdW5zdXBwb3J0ZWQgaW1hZ2UgZGVuc2l0eTpgICtcbiAgICAgICAgICAgIGBcXGAke3ZhbHVlfVxcYC4gTmdPcHRpbWl6ZWRJbWFnZSBnZW5lcmFsbHkgcmVjb21tZW5kcyBhIG1heCBpbWFnZSBkZW5zaXR5IG9mIGAgK1xuICAgICAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggYnV0IHN1cHBvcnRzIGltYWdlIGRlbnNpdGllcyB1cCB0byBgICtcbiAgICAgICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14LiBUaGUgaHVtYW4gZXllIGNhbm5vdCBkaXN0aW5ndWlzaCBiZXR3ZWVuIGltYWdlIGRlbnNpdGllcyBgICtcbiAgICAgICAgICAgIGBncmVhdGVyIHRoYW4gJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCAtIHdoaWNoIG1ha2VzIHRoZW0gdW5uZWNlc3NhcnkgZm9yIGAgK1xuICAgICAgICAgICAgYG1vc3QgdXNlIGNhc2VzLiBJbWFnZXMgdGhhdCB3aWxsIGJlIHBpbmNoLXpvb21lZCBhcmUgdHlwaWNhbGx5IHRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvcmAgK1xuICAgICAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXggaW1hZ2VzLiBQbGVhc2UgcmVtb3ZlIHRoZSBoaWdoIGRlbnNpdHkgZGVzY3JpcHRvciBhbmQgdHJ5IGFnYWluLmApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBSdW50aW1lRXJyb3JgIGluc3RhbmNlIHRvIHJlcHJlc2VudCBhIHNpdHVhdGlvbiB3aGVuIGFuIGlucHV0IGlzIHNldCBhZnRlclxuICogdGhlIGRpcmVjdGl2ZSBoYXMgaW5pdGlhbGl6ZWQuXG4gKi9cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgd2FzIHVwZGF0ZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uIGAgK1xuICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCBhIHN0YXRpYyB2YWx1ZSBvciB3cmFwIHRoZSBpbWFnZSBlbGVtZW50IGAgK1xuICAgICAgICAgIGBpbiBhbiAqbmdJZiB0aGF0IGlzIGdhdGVkIG9uIHRoZSBuZWNlc3NhcnkgdmFsdWUuYCk7XG59XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgbm9uZSBvZiB0aGUgbGlzdGVkIGlucHV0cyBoYXMgY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgY2hhbmdlczogU2ltcGxlQ2hhbmdlcywgaW5wdXRzOiBzdHJpbmdbXSkge1xuICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICdyYXdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGByYXdTcmNgIGlucHV0IGNoYW5nZXMsIHdlIGRldGVjdCB0aGF0IG9ubHkgaW4gdGhlXG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlc2AgaG9vaywgdGh1cyB0aGUgYHJhd1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgcmF3U3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7cmF3U3JjOiBjaGFuZ2VzW2lucHV0XS5wcmV2aW91c1ZhbHVlfSBhcyBOZ09wdGltaXplZEltYWdlO1xuICAgICAgfVxuICAgICAgdGhyb3cgcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpciwgaW5wdXQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0R3JlYXRlclRoYW5aZXJvKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgdmFsaWROdW1iZXIgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgJiYgaW5wdXRWYWx1ZSA+IDA7XG4gIGNvbnN0IHZhbGlkU3RyaW5nID1cbiAgICAgIHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSAmJiBwYXJzZUludChpbnB1dFZhbHVlKSA+IDA7XG4gIGlmICghdmFsaWROdW1iZXIgJiYgIXZhbGlkU3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgICAgICBgKFxcYCR7aW5wdXRWYWx1ZX1cXGApLiBUbyBmaXggdGhpcywgcHJvdmlkZSBcXGAke2lucHV0TmFtZX1cXGAgYCArXG4gICAgICAgICAgICBgYXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IHJlbW92ZUxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMaXN0ZW5lckZuKCk7XG4gICAgLy8gVE9ETzogYGNsaWVudFdpZHRoYCwgYGNsaWVudEhlaWdodGAsIGBuYXR1cmFsV2lkdGhgIGFuZCBgbmF0dXJhbEhlaWdodGBcbiAgICAvLyBhcmUgdHlwZWQgYXMgbnVtYmVyLCBidXQgd2UgcnVuIGBwYXJzZUZsb2F0YCAod2hpY2ggYWNjZXB0cyBzdHJpbmdzIG9ubHkpLlxuICAgIC8vIFZlcmlmeSB3aGV0aGVyIGBwYXJzZUZsb2F0YCBpcyBuZWVkZWQgaW4gdGhlIGNhc2VzIGJlbG93LlxuICAgIGNvbnN0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGltZy5jbGllbnRXaWR0aCBhcyBhbnkpO1xuICAgIGNvbnN0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChpbWcuY2xpZW50SGVpZ2h0IGFzIGFueSk7XG4gICAgY29uc3QgcmVuZGVyZWRBc3BlY3RSYXRpbyA9IHJlbmRlcmVkV2lkdGggLyByZW5kZXJlZEhlaWdodDtcbiAgICBjb25zdCBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zID0gcmVuZGVyZWRXaWR0aCAhPT0gMCAmJiByZW5kZXJlZEhlaWdodCAhPT0gMDtcblxuICAgIGNvbnN0IGludHJpbnNpY1dpZHRoID0gcGFyc2VGbG9hdChpbWcubmF0dXJhbFdpZHRoIGFzIGFueSk7XG4gICAgY29uc3QgaW50cmluc2ljSGVpZ2h0ID0gcGFyc2VGbG9hdChpbWcubmF0dXJhbEhlaWdodCBhcyBhbnkpO1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPSBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuXG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBpbWFnZSBkb2VzIG5vdCBtYXRjaCBgICtcbiAgICAgICAgICAgICAgYHRoZSBhc3BlY3QgcmF0aW8gaW5kaWNhdGVkIGJ5IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuIGAgK1xuICAgICAgICAgICAgICBgSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke2ludHJpbnNpY0FzcGVjdFJhdGlvfSkuIFN1cHBsaWVkIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlczogYCArXG4gICAgICAgICAgICAgIGAke3N1cHBsaWVkV2lkdGh9dyB4ICR7c3VwcGxpZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiAke3N1cHBsaWVkQXNwZWN0UmF0aW99KS4gYCArXG4gICAgICAgICAgICAgIGBUbyBmaXggdGhpcywgdXBkYXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuYCkpO1xuICAgIH0gZWxzZSBpZiAoc3R5bGluZ0Rpc3RvcnRpb24pIHtcbiAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIHJlbmRlcmVkIGltYWdlIGAgK1xuICAgICAgICAgICAgICBgZG9lcyBub3QgbWF0Y2ggdGhlIGltYWdlJ3MgaW50cmluc2ljIGFzcGVjdCByYXRpby4gYCArXG4gICAgICAgICAgICAgIGBJbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7aW50cmluc2ljQXNwZWN0UmF0aW99KS4gUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogYCArXG4gICAgICAgICAgICAgIGAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiBgICtcbiAgICAgICAgICAgICAgYCR7cmVuZGVyZWRBc3BlY3RSYXRpb30pLiBUaGlzIGlzc3VlIGNhbiBvY2N1ciBpZiBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYCArXG4gICAgICAgICAgICAgIGBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhbiBpbWFnZSB3aXRob3V0IHVwZGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nIGAgK1xuICAgICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgICAgYGFkZGluZyBcImhlaWdodDogYXV0b1wiIG9yIFwid2lkdGg6IGF1dG9cIiB0byB0aGUgaW1hZ2Ugc3R5bGluZyB3aWxsIGZpeCBgICtcbiAgICAgICAgICAgICAgYHRoaXMgaXNzdWUuYCkpO1xuICAgIH0gZWxzZSBpZiAoIWRpci5yYXdTcmNzZXQgJiYgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucykge1xuICAgICAgLy8gSWYgYHJhd1NyY3NldGAgaGFzbid0IGJlZW4gc2V0LCBzYW5pdHkgY2hlY2sgdGhlIGludHJpbnNpYyBzaXplLlxuICAgICAgY29uc3QgcmVjb21tZW5kZWRXaWR0aCA9IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCAqIHJlbmRlcmVkV2lkdGg7XG4gICAgICBjb25zdCByZWNvbW1lbmRlZEhlaWdodCA9IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCAqIHJlbmRlcmVkSGVpZ2h0O1xuICAgICAgY29uc3Qgb3ZlcnNpemVkV2lkdGggPSAoaW50cmluc2ljV2lkdGggLSByZWNvbW1lbmRlZFdpZHRoKSA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgY29uc3Qgb3ZlcnNpemVkSGVpZ2h0ID0gKGludHJpbnNpY0hlaWdodCAtIHJlY29tbWVuZGVkSGVpZ2h0KSA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgaWYgKG92ZXJzaXplZFdpZHRoIHx8IG92ZXJzaXplZEhlaWdodCkge1xuICAgICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfSU1BR0UsXG4gICAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSB0aGUgaW50cmluc2ljIGltYWdlIGlzIHNpZ25pZmljYW50bHkgYCArXG4gICAgICAgICAgICAgICAgYGxhcmdlciB0aGFuIG5lY2Vzc2FyeS4gYCArXG4gICAgICAgICAgICAgICAgYFxcblJlbmRlcmVkIGltYWdlIHNpemU6ICR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtyZWNvbW1lbmRlZFdpZHRofXcgeCAke1xuICAgICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuTm90ZTogUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemUgaXMgY2FsY3VsYXRlZCBhc3N1bWluZyBhIG1heGltdW0gRFBSIG9mIGAgK1xuICAgICAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH0uIFRvIGltcHJvdmUgbG9hZGluZyB0aW1lLCByZXNpemUgdGhlIGltYWdlIGAgK1xuICAgICAgICAgICAgICAgIGBvciBjb25zaWRlciB1c2luZyB0aGUgXCJyYXdTcmNzZXRcIiBhbmQgXCJzaXplc1wiIGF0dHJpYnV0ZXMuYCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBtaXNzaW5nQXR0cmlidXRlcyA9IFtdO1xuICBpZiAoZGlyLndpZHRoID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ3dpZHRoJyk7XG4gIGlmIChkaXIuaGVpZ2h0ID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ2hlaWdodCcpO1xuICBpZiAobWlzc2luZ0F0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUkVRVUlSRURfSU5QVVRfTUlTU0lORyxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gdGhlc2UgcmVxdWlyZWQgYXR0cmlidXRlcyBgICtcbiAgICAgICAgICAgIGBhcmUgbWlzc2luZzogJHttaXNzaW5nQXR0cmlidXRlcy5tYXAoYXR0ciA9PiBgXCIke2F0dHJ9XCJgKS5qb2luKCcsICcpfS4gYCArXG4gICAgICAgICAgICBgSW5jbHVkaW5nIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHdpbGwgcHJldmVudCBpbWFnZS1yZWxhdGVkIGxheW91dCBzaGlmdHMuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBpbmNsdWRlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIG9uIHRoZSBpbWFnZSB0YWcuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbG9hZGluZ2AgYXR0cmlidXRlIGlzIHNldCB0byBhIHZhbGlkIGlucHV0ICZcbiAqIGlzIG5vdCB1c2VkIG9uIHByaW9yaXR5IGltYWdlcy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIubG9hZGluZyAmJiBkaXIucHJpb3JpdHkpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBgICtcbiAgICAgICAgICAgIGBTZXR0aW5nIFxcYGxvYWRpbmdcXGAgb24gcHJpb3JpdHkgaW1hZ2VzIGlzIG5vdCBhbGxvd2VkIGAgK1xuICAgICAgICAgICAgYGJlY2F1c2UgdGhlc2UgaW1hZ2VzIHdpbGwgYWx3YXlzIGJlIGVhZ2VybHkgbG9hZGVkLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcmVtb3ZlIHRoZSDigJxsb2FkaW5n4oCdIGF0dHJpYnV0ZSBmcm9tIHRoZSBwcmlvcml0eSBpbWFnZS5gKTtcbiAgfVxuICBjb25zdCB2YWxpZElucHV0cyA9IFsnYXV0bycsICdlYWdlcicsICdsYXp5J107XG4gIGlmICh0eXBlb2YgZGlyLmxvYWRpbmcgPT09ICdzdHJpbmcnICYmICF2YWxpZElucHV0cy5pbmNsdWRlcyhkaXIubG9hZGluZykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHtkaXIubG9hZGluZ31cXGApLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIHZhbGlkIHZhbHVlIChcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIikuYCk7XG4gIH1cbn1cbiJdfQ==