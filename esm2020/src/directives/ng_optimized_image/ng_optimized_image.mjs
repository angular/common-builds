/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injector, Input, NgZone, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
import { IMAGE_LOADER } from './image_loaders/image_loader';
import { LCPImageObserver } from './lcp_image_observer';
import { PreconnectLinkChecker } from './preconnect_link_checker';
import { imgDirectiveDetails } from './util';
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
 * Should match something like: "1x, 2x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d(\.\d)?x\s*(,|$)){1,})$/;
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
 * The directive that helps to improve image loading performance by following best practices.
 *
 * The `NgOptimizedImage` ensures that the loading of the LCP image is prioritized by:
 * - Automatically setting the `fetchpriority` attribute on the `<img>` tag
 * - Lazy loading non-priority images by default
 * - Asserting that there is a corresponding preconnect link tag in the document head
 *
 * In addition, the directive:
 * - Generates appropriate asset URLs (if a corresponding loader function is provided)
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
 * 2. Configure a loader that you want to use.
 * 3. Update the necessary `<img>` tags in templates and replace `src` attributes with `rawSrc`.
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
 * transformations to thr resource URL and the value of the `rawSrc` attribute will be used as is.
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
 * Step 3: update `<img>` tags in templates to use `rawSrc` instead of `rawSrc`.
 *
 * ```
 * <img rawSrc="logo.png" width="200" height="100">
 * ```
 *
 * @publicApi
 * @developerPreview
 */
export class NgOptimizedImage {
    constructor(imageLoader, renderer, imgElement, injector) {
        this.imageLoader = imageLoader;
        this.renderer = renderer;
        this.imgElement = imgElement;
        this.injector = injector;
        this._priority = false;
        // Calculate the rewritten `src` once and store it.
        // This is needed to avoid repetitive calculations and make sure the directive cleanup in the
        // `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
        // instance that might be already destroyed).
        this._rewrittenSrc = null;
    }
    /**
     * The intrinsic width of the image in px.
     */
    set width(value) {
        ngDevMode && assertGreaterThanZeroNumber(this, value, 'width');
        this._width = inputToInteger(value);
    }
    get width() {
        return this._width;
    }
    /**
     * The intrinsic height of the image in px.
     */
    set height(value) {
        ngDevMode && assertGreaterThanZeroNumber(this, value, 'height');
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
            assertNotBlobURL(this);
            assertNonEmptyWidthAndHeight(this);
            assertValidLoadingInput(this);
            assertNoImageDistortion(this, this.imgElement, this.renderer);
            if (this.priority) {
                const checker = this.injector.get(PreconnectLinkChecker);
                checker.check(this.getRewrittenSrc(), this.rawSrc);
            }
            else {
                // Monitor whether an image is an LCP element only in case
                // the `priority` attribute is missing. Otherwise, an image
                // has the necessary settings and no extra checks are required.
                withLCPImageObserver(this.injector, (observer) => observer.registerImage(this.getRewrittenSrc(), this.rawSrc));
            }
        }
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
        if (!this.priority && this.loading !== undefined && isNonEmptyString(this.loading)) {
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
        if (!this._rewrittenSrc) {
            const imgConfig = { src: this.rawSrc };
            // Cache calculated image src to reuse it later in the code.
            this._rewrittenSrc = this.imageLoader(imgConfig);
        }
        return this._rewrittenSrc;
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
            if (!this.priority && this._rewrittenSrc !== null) {
                withLCPImageObserver(this.injector, (observer) => observer.unregisterImage(this._rewrittenSrc));
            }
        }
    }
    setHostAttribute(name, value) {
        this.renderer.setAttribute(this.imgElement.nativeElement, name, value);
    }
}
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-28522b2", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.0-next.0+sha-28522b2", type: NgOptimizedImage, isStandalone: true, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", rawSrcset: "rawSrcset", width: "width", height: "height", loading: "loading", priority: "priority", src: "src", srcset: "srcset" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-28522b2", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[rawSrc]',
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [IMAGE_LOADER]
                }] }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i0.Injector }]; }, propDecorators: { rawSrc: [{
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
// Convert input value to integer.
function inputToInteger(value) {
    return typeof value === 'string' ? parseInt(value, 10) : value;
}
// Convert input value to boolean.
function inputToBoolean(value) {
    return value != null && `${value}` !== 'false';
}
function isNonEmptyString(value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    return isString && !isEmptyString;
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
function withLCPImageObserver(injector, operation) {
    const ngZone = injector.get(NgZone);
    return ngZone.runOutsideAngular(() => {
        const observer = injector.get(LCPImageObserver);
        operation(observer);
    });
}
/***** Assert functions *****/
// Verifies that there is no `src` set on a host element.
function assertNoConflictingSrc(dir) {
    if (dir.src) {
        throw new RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir.rawSrc)} both \`src\` and \`rawSrc\` have been set. ` +
            `Supplying both of these attributes is not necessary and will break lazy loading. ` +
            `The NgOptimizedImage directive will set \`src\` itself based on the value of \`rawSrc\`. ` +
            `To fix this, please remove the \`src\` attribute.`);
    }
}
// Verifies that there is no `srcset` set on a host element.
function assertNoConflictingSrcset(dir) {
    if (dir.srcset) {
        throw new RuntimeError(2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */, `${imgDirectiveDetails(dir.rawSrc)} both \`srcset\` and \`rawSrcset\` have been set. ` +
            `Supplying both of these attributes is not necessary and will break lazy loading. ` +
            `The NgOptimizedImage directive will set \`srcset\` itself based on the value of ` +
            `\`rawSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
    }
}
// Verifies that the `rawSrc` is not a Base64-encoded image.
function assertNotBase64Image(dir) {
    let rawSrc = dir.rawSrc.trim();
    if (rawSrc.startsWith('data:')) {
        if (rawSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
            rawSrc = rawSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
        }
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc, false)} \`rawSrc\` is a Base64-encoded string ` +
            `(${rawSrc}). Base64-encoded strings are not supported by the NgOptimizedImage directive. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`rawSrc\` and using a regular \`src\` attribute instead.`);
    }
}
// Verifies that the `rawSrc` is not a Blob URL.
function assertNotBlobURL(dir) {
    const rawSrc = dir.rawSrc.trim();
    if (rawSrc.startsWith('blob:')) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} \`rawSrc\` was set to a blob URL (${rawSrc}). ` +
            `Blob URLs are not supported by the NgOptimizedImage directive. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`rawSrc\` and using a regular \`src\` attribute instead.`);
    }
}
// Verifies that the input is set to a non-empty string.
function assertNonEmptyInput(dir, name, value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    if (!isString || isEmptyString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} \`${name}\` has an invalid value ` +
            `(\`${value}\`). To fix this, change the value to a non-empty string.`);
    }
}
// Verifies that the `rawSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x"
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
// Creates a `RuntimeError` instance to represent a situation when an input is set after
// the directive has initialized.
function postInitInputChangeError(dir, inputName) {
    return new RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.rawSrc)} \`${inputName}\` was updated after initialization. ` +
        `The NgOptimizedImage directive will not react to this input change. ` +
        `To fix this, switch \`${inputName}\` a static value or wrap the image element ` +
        `in an *ngIf that is gated on the necessary value.`);
}
// Verify that none of the listed inputs has changed.
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
// Verifies that a specified input is a number greater than 0.
function assertGreaterThanZeroNumber(dir, inputValue, inputName) {
    const validNumber = typeof inputValue === 'number' && inputValue > 0;
    const validString = typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
    if (!validNumber && !validString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} \`${inputName}\` has an invalid value ` +
            `(\`${inputValue}\`). To fix this, provide \`${inputName}\` ` +
            `as a number greater than 0.`);
    }
}
// Verifies that the rendered image is not visually distorted. Effectively this is checking:
// - Whether the "width" and "height" attributes reflect the actual dimensions of the image.
// - Whether image styling is "correct" (see below for a longer explanation).
function assertNoImageDistortion(dir, element, renderer) {
    const img = element.nativeElement;
    const removeListenerFn = renderer.listen(img, 'load', () => {
        removeListenerFn();
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
        else {
            if (stylingDistortion) {
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
        }
    });
}
// Verifies that a specified input is set.
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
// Verifies that the `loading` attribute is set to a valid input &
// is not used on priority images.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQVksTUFBTSxFQUFnQyxTQUFTLEVBQWlCLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFJak8sT0FBTyxFQUFDLFlBQVksRUFBYyxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFFM0M7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRywyQkFBMkIsQ0FBQztBQUVsRTs7O0dBR0c7QUFDSCxNQUFNLCtCQUErQixHQUFHLGlDQUFpQyxDQUFDO0FBRTFFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxDQUFDLENBQUM7QUFFN0M7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxDQUFDO0FBRWhEOztHQUVHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBRyxFQUFFLENBQUM7QUFFbEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Rkc7QUFLSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ2tDLFdBQXdCLEVBQVUsUUFBbUIsRUFDM0UsVUFBc0IsRUFBVSxRQUFrQjtRQUQ1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDM0UsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7UUFLdEQsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUUxQixtREFBbUQ7UUFDbkQsNkZBQTZGO1FBQzdGLGdHQUFnRztRQUNoRyw2Q0FBNkM7UUFDckMsa0JBQWEsR0FBZ0IsSUFBSSxDQUFDO0lBWHVCLENBQUM7SUFpQ2xFOztPQUVHO0lBQ0gsSUFDSSxLQUFLLENBQUMsS0FBOEI7UUFDdEMsU0FBUyxJQUFJLDJCQUEyQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUNELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUNJLE1BQU0sQ0FBQyxLQUE4QjtRQUN2QyxTQUFTLElBQUksMkJBQTJCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFVRDs7T0FFRztJQUNILElBQ0ksUUFBUSxDQUFDLEtBQStCO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQWFELFFBQVE7UUFDTixJQUFJLFNBQVMsRUFBRTtZQUNiLG1CQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0Msc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDakIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDekQsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3BEO2lCQUFNO2dCQUNMLDBEQUEwRDtnQkFDMUQsMkRBQTJEO2dCQUMzRCwrREFBK0Q7Z0JBQy9ELG9CQUFvQixDQUNoQixJQUFJLENBQUMsUUFBUSxFQUNiLENBQUMsUUFBMEIsRUFBRSxFQUFFLENBQzNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3RFO1NBQ0Y7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLDhFQUE4RTtRQUM5RSw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1NBQzVEO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLFNBQVMsRUFBRTtZQUNiLDJCQUEyQixDQUN2QixJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDNUU7SUFDSCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNsRixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDckI7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN6QyxDQUFDO0lBRU8sZUFBZTtRQUNyQiw2RkFBNkY7UUFDN0YsNEZBQTRGO1FBQzVGLG1FQUFtRTtRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QixNQUFNLFNBQVMsR0FBRyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUM7WUFDckMsNERBQTREO1lBQzVELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNsRDtRQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLE1BQU0sV0FBVyxHQUFHLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNqRixNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQU0sQ0FBQztZQUNsRixPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLFNBQVMsRUFBRTtZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxFQUFFO2dCQUNqRCxvQkFBb0IsQ0FDaEIsSUFBSSxDQUFDLFFBQVEsRUFDYixDQUFDLFFBQTBCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGFBQWMsQ0FBQyxDQUFDLENBQUM7YUFDcEY7U0FDRjtJQUNILENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsS0FBYTtRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekUsQ0FBQzs7d0hBaExVLGdCQUFnQixrQkFFZixZQUFZOzRHQUZiLGdCQUFnQjtzR0FBaEIsZ0JBQWdCO2tCQUo1QixTQUFTO21CQUFDO29CQUNULFVBQVUsRUFBRSxJQUFJO29CQUNoQixRQUFRLEVBQUUsYUFBYTtpQkFDeEI7OzBCQUdNLE1BQU07MkJBQUMsWUFBWTtvSEFtQmYsTUFBTTtzQkFBZCxLQUFLO2dCQWFHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBTUYsS0FBSztzQkFEUixLQUFLO2dCQWFGLE1BQU07c0JBRFQsS0FBSztnQkFlRyxPQUFPO3NCQUFmLEtBQUs7Z0JBTUYsUUFBUTtzQkFEWCxLQUFLO2dCQWdCRyxHQUFHO3NCQUFYLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLOztBQTJGUixxQkFBcUI7QUFFckIsa0NBQWtDO0FBQ2xDLFNBQVMsY0FBYyxDQUFDLEtBQThCO0lBQ3BELE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDakUsQ0FBQztBQUVELGtDQUFrQztBQUNsQyxTQUFTLGNBQWMsQ0FBQyxLQUFjO0lBQ3BDLE9BQU8sS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLEtBQUssRUFBRSxLQUFLLE9BQU8sQ0FBQztBQUNqRCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFjO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztJQUMzQyxNQUFNLGFBQWEsR0FBRyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN0RCxPQUFPLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUNwQyxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDekIsUUFBa0IsRUFBRSxTQUErQztJQUNyRSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtRQUNuQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDaEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELDhCQUE4QjtBQUU5Qix5REFBeUQ7QUFDekQsU0FBUyxzQkFBc0IsQ0FBQyxHQUFxQjtJQUNuRCxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDWCxNQUFNLElBQUksWUFBWSxrREFFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLDhDQUE4QztZQUM1RSxtRkFBbUY7WUFDbkYsMkZBQTJGO1lBQzNGLG1EQUFtRCxDQUFDLENBQUM7S0FDOUQ7QUFDSCxDQUFDO0FBRUQsNERBQTREO0FBQzVELFNBQVMseUJBQXlCLENBQUMsR0FBcUI7SUFDdEQsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2QsTUFBTSxJQUFJLFlBQVkscURBRWxCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxvREFBb0Q7WUFDbEYsbUZBQW1GO1lBQ25GLGtGQUFrRjtZQUNsRixxRUFBcUUsQ0FBQyxDQUFDO0tBQ2hGO0FBQ0gsQ0FBQztBQUVELDREQUE0RDtBQUM1RCxTQUFTLG9CQUFvQixDQUFDLEdBQXFCO0lBQ2pELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzlCLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyw4QkFBOEIsRUFBRTtZQUNsRCxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsOEJBQThCLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDdEU7UUFDRCxNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyx5Q0FBeUM7WUFDOUUsSUFBSSxNQUFNLGlGQUFpRjtZQUMzRix1RUFBdUU7WUFDdkUsdUVBQXVFLENBQUMsQ0FBQztLQUNsRjtBQUNILENBQUM7QUFFRCxnREFBZ0Q7QUFDaEQsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFxQjtJQUM3QyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2pDLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM5QixNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHNDQUFzQyxNQUFNLEtBQUs7WUFDL0UsaUVBQWlFO1lBQ2pFLHVFQUF1RTtZQUN2RSx1RUFBdUUsQ0FBQyxDQUFDO0tBQ2xGO0FBQ0gsQ0FBQztBQUVELHdEQUF3RDtBQUN4RCxTQUFTLG1CQUFtQixDQUFDLEdBQXFCLEVBQUUsSUFBWSxFQUFFLEtBQWM7SUFDOUUsTUFBTSxRQUFRLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDO0lBQzNDLE1BQU0sYUFBYSxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ3RELElBQUksQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFO1FBQzlCLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLDBCQUEwQjtZQUNsRSxNQUFNLEtBQUssMkRBQTJELENBQUMsQ0FBQztLQUNqRjtBQUNILENBQUM7QUFFRCxvRkFBb0Y7QUFDcEYsTUFBTSxVQUFVLG9CQUFvQixDQUFDLEdBQXFCLEVBQUUsS0FBYztJQUN4RSxJQUFJLEtBQUssSUFBSSxJQUFJO1FBQUUsT0FBTztJQUMxQixtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdDLE1BQU0sU0FBUyxHQUFHLEtBQWUsQ0FBQztJQUNsQyxNQUFNLHNCQUFzQixHQUFHLDZCQUE2QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3RSxNQUFNLHdCQUF3QixHQUFHLCtCQUErQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVqRixJQUFJLHdCQUF3QixFQUFFO1FBQzVCLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUN2QztJQUVELE1BQU0sYUFBYSxHQUFHLHNCQUFzQixJQUFJLHdCQUF3QixDQUFDO0lBQ3pFLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDbEIsTUFBTSxJQUFJLFlBQVksNENBRWxCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQywwQ0FBMEMsS0FBSyxPQUFPO1lBQ3BGLHNGQUFzRjtZQUN0Rix5RUFBeUUsQ0FBQyxDQUFDO0tBQ3BGO0FBQ0gsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsR0FBcUIsRUFBRSxLQUFhO0lBQ2pFLE1BQU0sZUFBZSxHQUNqQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDJCQUEyQixDQUFDLENBQUM7SUFDaEcsSUFBSSxDQUFDLGVBQWUsRUFBRTtRQUNwQixNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FDSSxtQkFBbUIsQ0FDZixHQUFHLENBQUMsTUFBTSxDQUFDLDJEQUEyRDtZQUMxRSxLQUFLLEtBQUssbUVBQW1FO1lBQzdFLEdBQUcsOEJBQThCLHVDQUF1QztZQUN4RSxHQUFHLDJCQUEyQiw4REFBOEQ7WUFDNUYsZ0JBQWdCLDhCQUE4Qix1Q0FBdUM7WUFDckYseUZBQXlGO1lBQ3pGLEdBQUcsMkJBQTJCLG9FQUFvRSxDQUFDLENBQUM7S0FDN0c7QUFDSCxDQUFDO0FBRUQsd0ZBQXdGO0FBQ3hGLGlDQUFpQztBQUNqQyxTQUFTLHdCQUF3QixDQUFDLEdBQXFCLEVBQUUsU0FBaUI7SUFDeEUsT0FBTyxJQUFJLFlBQVksc0RBRW5CLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLFNBQVMsdUNBQXVDO1FBQ3BGLHNFQUFzRTtRQUN0RSx5QkFBeUIsU0FBUyw4Q0FBOEM7UUFDaEYsbURBQW1ELENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBRUQscURBQXFEO0FBQ3JELFNBQVMsMkJBQTJCLENBQ2hDLEdBQXFCLEVBQUUsT0FBc0IsRUFBRSxNQUFnQjtJQUNqRSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsSUFBSSxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDaEQsSUFBSSxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUN0Qiw4REFBOEQ7Z0JBQzlELCtEQUErRDtnQkFDL0QsaUVBQWlFO2dCQUNqRSw2QkFBNkI7Z0JBQzdCLEdBQUcsR0FBRyxFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsYUFBYSxFQUFxQixDQUFDO2FBQ2xFO1lBQ0QsTUFBTSx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDNUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCw4REFBOEQ7QUFDOUQsU0FBUywyQkFBMkIsQ0FDaEMsR0FBcUIsRUFBRSxVQUFtQixFQUFFLFNBQWlCO0lBQy9ELE1BQU0sV0FBVyxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVEsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sV0FBVyxHQUNiLE9BQU8sVUFBVSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEcsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNoQyxNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sU0FBUywwQkFBMEI7WUFDdkUsTUFBTSxVQUFVLCtCQUErQixTQUFTLEtBQUs7WUFDN0QsNkJBQTZCLENBQUMsQ0FBQztLQUN4QztBQUNILENBQUM7QUFFRCw0RkFBNEY7QUFDNUYsNEZBQTRGO0FBQzVGLDZFQUE2RTtBQUM3RSxTQUFTLHVCQUF1QixDQUM1QixHQUFxQixFQUFFLE9BQXdCLEVBQUUsUUFBbUI7SUFDdEUsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUNsQyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFDekQsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLEdBQUcsY0FBYyxDQUFDO1FBQzNELE1BQU0seUJBQXlCLEdBQUcsYUFBYSxLQUFLLENBQUMsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDO1FBRTlFLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEQsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RCxNQUFNLG9CQUFvQixHQUFHLGNBQWMsR0FBRyxlQUFlLENBQUM7UUFFOUQsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLEtBQU0sQ0FBQztRQUNqQyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTyxDQUFDO1FBQ25DLE1BQU0sbUJBQW1CLEdBQUcsYUFBYSxHQUFHLGNBQWMsQ0FBQztRQUUzRCxxRUFBcUU7UUFDckUsbUVBQW1FO1FBQ25FLHVFQUF1RTtRQUN2RSxzRUFBc0U7UUFDdEUsdUVBQXVFO1FBQ3ZFLE1BQU0sb0JBQW9CLEdBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxzQkFBc0IsQ0FBQztRQUNsRixNQUFNLGlCQUFpQixHQUFHLHlCQUF5QjtZQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsc0JBQXNCLENBQUM7UUFDbEYsSUFBSSxvQkFBb0IsRUFBRTtZQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQiw0Q0FFM0IsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGdEQUFnRDtnQkFDOUUsaUVBQWlFO2dCQUNqRSx5QkFBeUIsY0FBYyxPQUFPLGVBQWUsSUFBSTtnQkFDakUsa0JBQWtCLG9CQUFvQiwyQ0FBMkM7Z0JBQ2pGLEdBQUcsYUFBYSxPQUFPLGNBQWMsb0JBQW9CLG1CQUFtQixLQUFLO2dCQUNqRixzREFBc0QsQ0FBQyxDQUFDLENBQUM7U0FDbEU7YUFBTTtZQUNMLElBQUksaUJBQWlCLEVBQUU7Z0JBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLDRDQUUzQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsMENBQTBDO29CQUN4RSxxREFBcUQ7b0JBQ3JELHlCQUF5QixjQUFjLE9BQU8sZUFBZSxJQUFJO29CQUNqRSxrQkFBa0Isb0JBQW9CLDBCQUEwQjtvQkFDaEUsR0FBRyxhQUFhLE9BQU8sY0FBYyxtQkFBbUI7b0JBQ3hELEdBQUcsbUJBQW1CLGtEQUFrRDtvQkFDeEUsc0VBQXNFO29CQUN0RSxtRUFBbUU7b0JBQ25FLHVFQUF1RTtvQkFDdkUsYUFBYSxDQUFDLENBQUMsQ0FBQzthQUN6QjtTQUNGO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsMENBQTBDO0FBQzFDLFNBQVMsNEJBQTRCLENBQUMsR0FBcUI7SUFDekQsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDM0IsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLFNBQVM7UUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0QsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLFNBQVM7UUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0QsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2hDLE1BQU0sSUFBSSxZQUFZLHFEQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsNkJBQTZCO1lBQzNELGdCQUFnQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQ3pFLHNGQUFzRjtZQUN0Rix3RUFBd0UsQ0FBQyxDQUFDO0tBQ25GO0FBQ0gsQ0FBQztBQUVELGtFQUFrRTtBQUNsRSxrQ0FBa0M7QUFDbEMsU0FBUyx1QkFBdUIsQ0FBQyxHQUFxQjtJQUNwRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtRQUMvQixNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLDZCQUE2QjtZQUMzRCxtREFBbUQ7WUFDbkQsd0RBQXdEO1lBQ3hELHNEQUFzRDtZQUN0RCxzRUFBc0UsQ0FBQyxDQUFDO0tBQ2pGO0lBQ0QsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLElBQUksT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFFBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pFLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsNkJBQTZCO1lBQzNELDJCQUEyQixHQUFHLENBQUMsT0FBTyxPQUFPO1lBQzdDLGtFQUFrRSxDQUFDLENBQUM7S0FDN0U7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGUsIE5nWm9uZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyLCBTaW1wbGVDaGFuZ2VzLCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7TENQSW1hZ2VPYnNlcnZlcn0gZnJvbSAnLi9sY3BfaW1hZ2Vfb2JzZXJ2ZXInO1xuaW1wb3J0IHtQcmVjb25uZWN0TGlua0NoZWNrZXJ9IGZyb20gJy4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgd2lkdGggZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMTAwdywgMjAwd1wiLlxuICovXG5jb25zdCBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkK3dcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMXgsIDJ4XCIuXG4gKi9cbmNvbnN0IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZChcXC5cXGQpP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFzcGVjdCByYXRpb3MgYXJlIHNpbWlsYXIgaW4gdmFsdWUuXG4gKi9cbmNvbnN0IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0UgPSAuMTtcblxuLyoqXG4gKiBUaGUgZGlyZWN0aXZlIHRoYXQgaGVscHMgdG8gaW1wcm92ZSBpbWFnZSBsb2FkaW5nIHBlcmZvcm1hbmNlIGJ5IGZvbGxvd2luZyBiZXN0IHByYWN0aWNlcy5cbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGVuc3VyZXMgdGhhdCB0aGUgbG9hZGluZyBvZiB0aGUgTENQIGltYWdlIGlzIHByaW9yaXRpemVkIGJ5OlxuICogLSBBdXRvbWF0aWNhbGx5IHNldHRpbmcgdGhlIGBmZXRjaHByaW9yaXR5YCBhdHRyaWJ1dGUgb24gdGhlIGA8aW1nPmAgdGFnXG4gKiAtIExhenkgbG9hZGluZyBub24tcHJpb3JpdHkgaW1hZ2VzIGJ5IGRlZmF1bHRcbiAqIC0gQXNzZXJ0aW5nIHRoYXQgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIHByZWNvbm5lY3QgbGluayB0YWcgaW4gdGhlIGRvY3VtZW50IGhlYWRcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIGRpcmVjdGl2ZTpcbiAqIC0gR2VuZXJhdGVzIGFwcHJvcHJpYXRlIGFzc2V0IFVSTHMgKGlmIGEgY29ycmVzcG9uZGluZyBsb2FkZXIgZnVuY3Rpb24gaXMgcHJvdmlkZWQpXG4gKiAtIFJlcXVpcmVzIHRoYXQgYHdpZHRoYCBhbmQgYGhlaWdodGAgYXJlIHNldFxuICogLSBXYXJucyBpZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGhhdmUgYmVlbiBzZXQgaW5jb3JyZWN0bHlcbiAqIC0gV2FybnMgaWYgdGhlIGltYWdlIHdpbGwgYmUgdmlzdWFsbHkgZGlzdG9ydGVkIHdoZW4gcmVuZGVyZWRcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgaXMgbWFya2VkIGFzIFtzdGFuZGFsb25lXShndWlkZS9zdGFuZGFsb25lLWNvbXBvbmVudHMpIGFuZCBjYW5cbiAqIGJlIGltcG9ydGVkIGRpcmVjdGx5LlxuICpcbiAqIEZvbGxvdyB0aGUgc3RlcHMgYmVsb3cgdG8gZW5hYmxlIGFuZCB1c2UgdGhlIGRpcmVjdGl2ZTpcbiAqIDEuIEltcG9ydCBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGUgb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudC5cbiAqIDIuIENvbmZpZ3VyZSBhIGxvYWRlciB0aGF0IHlvdSB3YW50IHRvIHVzZS5cbiAqIDMuIFVwZGF0ZSB0aGUgbmVjZXNzYXJ5IGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgYW5kIHJlcGxhY2UgYHNyY2AgYXR0cmlidXRlcyB3aXRoIGByYXdTcmNgLlxuICpcbiAqIFN0ZXAgMTogaW1wb3J0IHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IE5nT3B0aW1pemVkSW1hZ2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIEluY2x1ZGUgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlXG4gKiBATmdNb2R1bGUoe1xuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgQXBwTW9kdWxlIHt9XG4gKlxuICogLy8gLi4uIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnRcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlXG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBNeVN0YW5kYWxvbmVDb21wb25lbnQge31cbiAqIGBgYFxuICpcbiAqIFN0ZXAgMjogY29uZmlndXJlIGEgbG9hZGVyLlxuICpcbiAqIFRvIHVzZSB0aGUgKipkZWZhdWx0IGxvYWRlcioqOiBubyBhZGRpdGlvbmFsIGNvZGUgY2hhbmdlcyBhcmUgbmVjZXNzYXJ5LiBUaGUgVVJMIHJldHVybmVkIGJ5IHRoZVxuICogZ2VuZXJpYyBsb2FkZXIgd2lsbCBhbHdheXMgbWF0Y2ggdGhlIHZhbHVlIG9mIFwic3JjXCIuIEluIG90aGVyIHdvcmRzLCB0aGlzIGxvYWRlciBhcHBsaWVzIG5vXG4gKiB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhyIHJlc291cmNlIFVSTCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBgcmF3U3JjYCBhdHRyaWJ1dGUgd2lsbCBiZSB1c2VkIGFzIGlzLlxuICpcbiAqIFRvIHVzZSBhbiBleGlzdGluZyBsb2FkZXIgZm9yIGEgKip0aGlyZC1wYXJ0eSBpbWFnZSBzZXJ2aWNlKio6IGFkZCB0aGUgcHJvdmlkZXIgZmFjdG9yeSBmb3IgeW91clxuICogY2hvc2VuIHNlcnZpY2UgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5LiBJbiB0aGUgZXhhbXBsZSBiZWxvdywgdGhlIEltZ2l4IGxvYWRlciBpcyB1c2VkOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7cHJvdmlkZUltZ2l4TG9hZGVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENhbGwgdGhlIGZ1bmN0aW9uIGFuZCBhZGQgdGhlIHJlc3VsdCB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXk6XG4gKiBwcm92aWRlcnM6IFtcbiAqICAgcHJvdmlkZUltZ2l4TG9hZGVyKFwiaHR0cHM6Ly9teS5iYXNlLnVybC9cIiksXG4gKiBdLFxuICogYGBgXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgcHJvdmlkZXMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gKiAtIGBwcm92aWRlQ2xvdWRmbGFyZUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVDbG91ZGluYXJ5TG9hZGVyYFxuICogLSBgcHJvdmlkZUltYWdlS2l0TG9hZGVyYFxuICogLSBgcHJvdmlkZUltZ2l4TG9hZGVyYFxuICpcbiAqIElmIHlvdSB1c2UgYSBkaWZmZXJlbnQgaW1hZ2UgcHJvdmlkZXIsIHlvdSBjYW4gY3JlYXRlIGEgY3VzdG9tIGxvYWRlciBmdW5jdGlvbiBhcyBkZXNjcmliZWRcbiAqIGJlbG93LlxuICpcbiAqIFRvIHVzZSBhICoqY3VzdG9tIGxvYWRlcioqOiBwcm92aWRlIHlvdXIgbG9hZGVyIGZ1bmN0aW9uIGFzIGEgdmFsdWUgZm9yIHRoZSBgSU1BR0VfTE9BREVSYCBESVxuICogdG9rZW4uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENvbmZpZ3VyZSB0aGUgbG9hZGVyIHVzaW5nIHRoZSBgSU1BR0VfTE9BREVSYCB0b2tlbi5cbiAqIHByb3ZpZGVyczogW1xuICogICB7XG4gKiAgICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAqICAgICAgdXNlVmFsdWU6IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiB7XG4gKiAgICAgICAgcmV0dXJuIGBodHRwczovL2V4YW1wbGUuY29tLyR7Y29uZmlnLnNyY30tJHtjb25maWcud2lkdGh9LmpwZ31gO1xuICogICAgICB9XG4gKiAgIH0sXG4gKiBdLFxuICogYGBgXG4gKlxuICogU3RlcCAzOiB1cGRhdGUgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyB0byB1c2UgYHJhd1NyY2AgaW5zdGVhZCBvZiBgcmF3U3JjYC5cbiAqXG4gKiBgYGBcbiAqIDxpbWcgcmF3U3JjPVwibG9nby5wbmdcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjEwMFwiPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnaW1nW3Jhd1NyY10nLFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEluamVjdChJTUFHRV9MT0FERVIpIHByaXZhdGUgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyLCBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgICBwcml2YXRlIGltZ0VsZW1lbnQ6IEVsZW1lbnRSZWYsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIC8vIFByaXZhdGUgZmllbGRzIHRvIGtlZXAgbm9ybWFsaXplZCBpbnB1dCB2YWx1ZXMuXG4gIHByaXZhdGUgX3dpZHRoPzogbnVtYmVyO1xuICBwcml2YXRlIF9oZWlnaHQ/OiBudW1iZXI7XG4gIHByaXZhdGUgX3ByaW9yaXR5ID0gZmFsc2U7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSByZXdyaXR0ZW4gYHNyY2Agb25jZSBhbmQgc3RvcmUgaXQuXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIHJlcGV0aXRpdmUgY2FsY3VsYXRpb25zIGFuZCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBjbGVhbnVwIGluIHRoZVxuICAvLyBgbmdPbkRlc3Ryb3lgIGRvZXMgbm90IHJlbHkgb24gdGhlIGBJTUFHRV9MT0FERVJgIGxvZ2ljICh3aGljaCBpbiB0dXJuIGNhbiByZWx5IG9uIHNvbWUgb3RoZXJcbiAgLy8gaW5zdGFuY2UgdGhhdCBtaWdodCBiZSBhbHJlYWR5IGRlc3Ryb3llZCkuXG4gIHByaXZhdGUgX3Jld3JpdHRlblNyYzogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCgpIHJhd1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogQSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICAgKiBUaGUgaW1hZ2UgbmFtZSB3aWxsIGJlIHRha2VuIGZyb20gYHJhd1NyY2AgYW5kIGNvbWJpbmVkIHdpdGggdGhlIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eVxuICAgKiBkZXNjcmlwdG9ycyB0byBnZW5lcmF0ZSB0aGUgZmluYWwgYHNyY3NldGAgcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPGltZyByYXdTcmM9XCJoZWxsby5qcGdcIiByYXdTcmNzZXQ9XCIxMDB3LCAyMDB3XCIgLz4gID0+XG4gICAqIDxpbWcgc3JjPVwicGF0aC9oZWxsby5qcGdcIiBzcmNzZXQ9XCJwYXRoL2hlbGxvLmpwZz93PTEwMCAxMDB3LCBwYXRoL2hlbGxvLmpwZz93PTIwMCAyMDB3XCIgLz5cbiAgICogYGBgXG4gICAqL1xuICBASW5wdXQoKSByYXdTcmNzZXQhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHdpZHRoKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRHcmVhdGVyVGhhblplcm9OdW1iZXIodGhpcywgdmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGhlaWdodCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0R3JlYXRlclRoYW5aZXJvTnVtYmVyKHRoaXMsIHZhbHVlLCAnaGVpZ2h0Jyk7XG4gICAgdGhpcy5faGVpZ2h0ID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCBoZWlnaHQoKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZGVzaXJlZCBsb2FkaW5nIGJlaGF2aW9yIChsYXp5LCBlYWdlciwgb3IgYXV0bykuXG4gICAqIFRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciB0aGlzIGlucHV0IGlzIG9wdGluZy1vdXQgbm9uLXByaW9yaXR5IGltYWdlc1xuICAgKiBmcm9tIGxhenkgbG9hZGluZyBieSBtYXJraW5nIHRoZW0gbG9hZGluZz0nZWFnZXInIG9yIGxvYWRpbmc9J2F1dG8nLlxuICAgKiBUaGlzIGlucHV0IHNob3VsZCBub3QgYmUgdXNlZCB3aXRoIHByaW9yaXR5IGltYWdlcy5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRpbmc/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW1hZ2Ugc2hvdWxkIGhhdmUgYSBoaWdoIHByaW9yaXR5LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHByaW9yaXR5KHZhbHVlOiBzdHJpbmd8Ym9vbGVhbnx1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9wcmlvcml0eSA9IGlucHV0VG9Cb29sZWFuKHZhbHVlKTtcbiAgfVxuICBnZXQgcHJpb3JpdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByaW9yaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHZhbHVlIG9mIHRoZSBgc3JjYCBhbmQgYHNyY3NldGAgaWYgdGhleSdyZSBzZXQgb24gYSBob3N0IGA8aW1nPmAgZWxlbWVudC5cbiAgICogVGhlc2UgaW5wdXRzIGFyZSBuZWVkZWQgdG8gdmVyaWZ5IHRoYXQgdGhlcmUgYXJlIG5vIGNvbmZsaWN0aW5nIHNvdXJjZXMgcHJvdmlkZWRcbiAgICogYXQgdGhlIHNhbWUgdGltZSAoZS5nLiBgc3JjYCBhbmQgYHJhd1NyY2AgdG9nZXRoZXIgb3IgYHNyY3NldGAgYW5kIGByYXdTcmNzZXRgLFxuICAgKiB0aHVzIGNhdXNpbmcgYW4gYW1iaWd1aXR5IG9uIHdoaWNoIHNyYyB0byB1c2UpIGFuZCB0aGF0IGltYWdlc1xuICAgKiBkb24ndCBzdGFydCB0byBsb2FkIHVudGlsIGEgbGF6eSBsb2FkaW5nIHN0cmF0ZWd5IGlzIHNldC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBASW5wdXQoKSBzcmM/OiBzdHJpbmc7XG4gIEBJbnB1dCgpIHNyY3NldD86IHN0cmluZztcblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb25FbXB0eUlucHV0KHRoaXMsICdyYXdTcmMnLCB0aGlzLnJhd1NyYyk7XG4gICAgICBhc3NlcnRWYWxpZFJhd1NyY3NldCh0aGlzLCB0aGlzLnJhd1NyY3NldCk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldCh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJhc2U2NEltYWdlKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmxvYlVSTCh0aGlzKTtcbiAgICAgIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dCh0aGlzKTtcbiAgICAgIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlcik7XG4gICAgICBpZiAodGhpcy5wcmlvcml0eSkge1xuICAgICAgICBjb25zdCBjaGVja2VyID0gdGhpcy5pbmplY3Rvci5nZXQoUHJlY29ubmVjdExpbmtDaGVja2VyKTtcbiAgICAgICAgY2hlY2tlci5jaGVjayh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLnJhd1NyYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBNb25pdG9yIHdoZXRoZXIgYW4gaW1hZ2UgaXMgYW4gTENQIGVsZW1lbnQgb25seSBpbiBjYXNlXG4gICAgICAgIC8vIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZSBpcyBtaXNzaW5nLiBPdGhlcndpc2UsIGFuIGltYWdlXG4gICAgICAgIC8vIGhhcyB0aGUgbmVjZXNzYXJ5IHNldHRpbmdzIGFuZCBubyBleHRyYSBjaGVja3MgYXJlIHJlcXVpcmVkLlxuICAgICAgICB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IsXG4gICAgICAgICAgICAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLnJhd1NyYykpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG4gICAgLy8gVGhlIGBzcmNgIGFuZCBgc3Jjc2V0YCBhdHRyaWJ1dGVzIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCB0aGlzLmdldFJld3JpdHRlblNyYygpKTtcbiAgICBpZiAodGhpcy5yYXdTcmNzZXQpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3Jjc2V0JywgdGhpcy5nZXRSZXdyaXR0ZW5TcmNzZXQoKSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgICAgICAgICB0aGlzLCBjaGFuZ2VzLCBbJ3Jhd1NyYycsICdyYXdTcmNzZXQnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ3ByaW9yaXR5J10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMubG9hZGluZyAhPT0gdW5kZWZpbmVkICYmIGlzTm9uRW1wdHlTdHJpbmcodGhpcy5sb2FkaW5nKSkge1xuICAgICAgcmV0dXJuIHRoaXMubG9hZGluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGlmICghdGhpcy5fcmV3cml0dGVuU3JjKSB7XG4gICAgICBjb25zdCBpbWdDb25maWcgPSB7c3JjOiB0aGlzLnJhd1NyY307XG4gICAgICAvLyBDYWNoZSBjYWxjdWxhdGVkIGltYWdlIHNyYyB0byByZXVzZSBpdCBsYXRlciBpbiB0aGUgY29kZS5cbiAgICAgIHRoaXMuX3Jld3JpdHRlblNyYyA9IHRoaXMuaW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Jld3JpdHRlblNyYztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qgd2lkdGhTcmNTZXQgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHRoaXMucmF3U3Jjc2V0KTtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSB0aGlzLnJhd1NyY3NldC5zcGxpdCgnLCcpLmZpbHRlcihzcmMgPT4gc3JjICE9PSAnJykubWFwKHNyY1N0ciA9PiB7XG4gICAgICBzcmNTdHIgPSBzcmNTdHIudHJpbSgpO1xuICAgICAgY29uc3Qgd2lkdGggPSB3aWR0aFNyY1NldCA/IHBhcnNlRmxvYXQoc3JjU3RyKSA6IHBhcnNlRmxvYXQoc3JjU3RyKSAqIHRoaXMud2lkdGghO1xuICAgICAgcmV0dXJuIGAke3RoaXMuaW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5yYXdTcmMsIHdpZHRofSl9ICR7c3JjU3RyfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMuX3Jld3JpdHRlblNyYyAhPT0gbnVsbCkge1xuICAgICAgICB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IsXG4gICAgICAgICAgICAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+IG9ic2VydmVyLnVucmVnaXN0ZXJJbWFnZSh0aGlzLl9yZXdyaXR0ZW5TcmMhKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuaW1nRWxlbWVudC5uYXRpdmVFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8vIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gaW50ZWdlci5cbmZ1bmN0aW9uIGlucHV0VG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCk6IG51bWJlcnx1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB2YWx1ZTtcbn1cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBib29sZWFuLlxuZnVuY3Rpb24gaW5wdXRUb0Jvb2xlYW4odmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgYCR7dmFsdWV9YCAhPT0gJ2ZhbHNlJztcbn1cblxuZnVuY3Rpb24gaXNOb25FbXB0eVN0cmluZyh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICByZXR1cm4gaXNTdHJpbmcgJiYgIWlzRW1wdHlTdHJpbmc7XG59XG5cbi8qKlxuICogSW52b2tlcyBhIGZ1bmN0aW9uLCBwYXNzaW5nIGFuIGluc3RhbmNlIG9mIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgYXMgYW4gYXJndW1lbnQuXG4gKlxuICogTm90ZXM6XG4gKiAtIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgaXMgYSB0cmVlLXNoYWthYmxlIHByb3ZpZGVyLCBwcm92aWRlZCBpbiAncm9vdCcsXG4gKiAgIHRodXMgaXQncyBhIHNpbmdsZXRvbiB3aXRoaW4gdGhpcyBhcHBsaWNhdGlvblxuICogLSB0aGUgcHJvY2VzcyBvZiBgTENQSW1hZ2VPYnNlcnZlcmAgY3JlYXRpb24gYW5kIGFuIGFjdHVhbCBvcGVyYXRpb24gYXJlIGludm9rZWQgb3V0c2lkZSBvZiB0aGVcbiAqICAgTmdab25lIHRvIG1ha2Ugc3VyZSBub25lIG9mIHRoZSBjYWxscyBpbnNpZGUgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBjbGFzcyB0cmlnZ2VyIHVubmVjZXNzYXJ5XG4gKiAgIGNoYW5nZSBkZXRlY3Rpb25cbiAqL1xuZnVuY3Rpb24gd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgaW5qZWN0b3I6IEluamVjdG9yLCBvcGVyYXRpb246IChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gdm9pZCk6IHZvaWQge1xuICBjb25zdCBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgcmV0dXJuIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBpbmplY3Rvci5nZXQoTENQSW1hZ2VPYnNlcnZlcik7XG4gICAgb3BlcmF0aW9uKG9ic2VydmVyKTtcbiAgfSk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vLyBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3JjKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ19BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBib3RoIFxcYHNyY1xcYCBhbmQgXFxgcmF3U3JjXFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgaXMgbm90IG5lY2Vzc2FyeSBhbmQgd2lsbCBicmVhayBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIHNldCBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGByYXdTcmNcXGAuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY3NldGAgc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDU0VUX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IGJvdGggXFxgc3Jjc2V0XFxgIGFuZCBcXGByYXdTcmNzZXRcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBpcyBub3QgbmVjZXNzYXJ5IGFuZCB3aWxsIGJyZWFrIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgc2V0IFxcYHNyY3NldFxcYCBpdHNlbGYgYmFzZWQgb24gdGhlIHZhbHVlIG9mIGAgK1xuICAgICAgICAgICAgYFxcYHJhd1NyY3NldFxcYC4gVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgbm90IGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UuXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAocmF3U3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgcmF3U3JjID0gcmF3U3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjLCBmYWxzZSl9IFxcYHJhd1NyY1xcYCBpcyBhIEJhc2U2NC1lbmNvZGVkIHN0cmluZyBgICtcbiAgICAgICAgICAgIGAoJHtyYXdTcmN9KS4gQmFzZTY0LWVuY29kZWQgc3RyaW5ncyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICAgICAgYGJ5IHJlbW92aW5nIFxcYHJhd1NyY1xcYCBhbmQgdXNpbmcgYSByZWd1bGFyIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVUkwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IFxcYHJhd1NyY1xcYCB3YXMgc2V0IHRvIGEgYmxvYiBVUkwgKCR7cmF3U3JjfSkuIGAgK1xuICAgICAgICAgICAgYEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICAgICAgYGJ5IHJlbW92aW5nIFxcYHJhd1NyY1xcYCBhbmQgdXNpbmcgYSByZWd1bGFyIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBpbnB1dCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuICBjb25zdCBpc0VtcHR5U3RyaW5nID0gaXNTdHJpbmcgJiYgdmFsdWUudHJpbSgpID09PSAnJztcbiAgaWYgKCFpc1N0cmluZyB8fCBpc0VtcHR5U3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBcXGAke25hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIGAgK1xuICAgICAgICAgICAgYChcXGAke3ZhbHVlfVxcYCkuIFRvIGZpeCB0aGlzLCBjaGFuZ2UgdGhlIHZhbHVlIHRvIGEgbm9uLWVtcHR5IHN0cmluZy5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3Jjc2V0YCBpcyBpbiBhIHZhbGlkIGZvcm1hdCwgZS5nLiBcIjEwMHcsIDIwMHdcIiBvciBcIjF4LCAyeFwiXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWRSYXdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogdW5rbm93bikge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuO1xuICBhc3NlcnROb25FbXB0eUlucHV0KGRpciwgJ3Jhd1NyY3NldCcsIHZhbHVlKTtcbiAgY29uc3Qgc3RyaW5nVmFsID0gdmFsdWUgYXMgc3RyaW5nO1xuICBjb25zdCBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuICBjb25zdCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IgPSBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcblxuICBpZiAoaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yKSB7XG4gICAgYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpciwgc3RyaW5nVmFsKTtcbiAgfVxuXG4gIGNvbnN0IGlzVmFsaWRTcmNzZXQgPSBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yIHx8IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcjtcbiAgaWYgKCFpc1ZhbGlkU3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBcXGByYXdTcmNzZXRcXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgKFxcYCR7dmFsdWV9XFxgKS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBcXGByYXdTcmNzZXRcXGAgdXNpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBvbmUgb3IgbW9yZSB3aWR0aCBgICtcbiAgICAgICAgICAgIGBkZXNjcmlwdG9ycyAoZS5nLiBcIjEwMHcsIDIwMHdcIikgb3IgZGVuc2l0eSBkZXNjcmlwdG9ycyAoZS5nLiBcIjF4LCAyeFwiKS5gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGNvbnN0IHVuZGVyRGVuc2l0eUNhcCA9XG4gICAgICB2YWx1ZS5zcGxpdCgnLCcpLmV2ZXJ5KG51bSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5yYXdTcmMpfSB0aGUgXFxgcmF3U3Jjc2V0XFxgIGNvbnRhaW5zIGFuIHVuc3VwcG9ydGVkIGltYWdlIGRlbnNpdHk6YCArXG4gICAgICAgICAgICBgXFxgJHt2YWx1ZX1cXGAuIE5nT3B0aW1pemVkSW1hZ2UgZ2VuZXJhbGx5IHJlY29tbWVuZHMgYSBtYXggaW1hZ2UgZGVuc2l0eSBvZiBgICtcbiAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGJ1dCBzdXBwb3J0cyBpbWFnZSBkZW5zaXRpZXMgdXAgdG8gYCArXG4gICAgICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eC4gVGhlIGh1bWFuIGV5ZSBjYW5ub3QgZGlzdGluZ3Vpc2ggYmV0d2VlbiBpbWFnZSBkZW5zaXRpZXMgYCArXG4gICAgICAgICAgICBgZ3JlYXRlciB0aGFuICR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggLSB3aGljaCBtYWtlcyB0aGVtIHVubmVjZXNzYXJ5IGZvciBgICtcbiAgICAgICAgICAgIGBtb3N0IHVzZSBjYXNlcy4gSW1hZ2VzIHRoYXQgd2lsbCBiZSBwaW5jaC16b29tZWQgYXJlIHR5cGljYWxseSB0aGUgcHJpbWFyeSB1c2UgY2FzZSBmb3JgICtcbiAgICAgICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGltYWdlcy4gUGxlYXNlIHJlbW92ZSB0aGUgaGlnaCBkZW5zaXR5IGRlc2NyaXB0b3IgYW5kIHRyeSBhZ2Fpbi5gKTtcbiAgfVxufVxuXG4vLyBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4vLyB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgd2FzIHVwZGF0ZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uIGAgK1xuICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCBhIHN0YXRpYyB2YWx1ZSBvciB3cmFwIHRoZSBpbWFnZSBlbGVtZW50IGAgK1xuICAgICAgICAgIGBpbiBhbiAqbmdJZiB0aGF0IGlzIGdhdGVkIG9uIHRoZSBuZWNlc3NhcnkgdmFsdWUuYCk7XG59XG5cbi8vIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG5mdW5jdGlvbiBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBpbnB1dHM6IHN0cmluZ1tdKSB7XG4gIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICBjb25zdCBpc1VwZGF0ZWQgPSBjaGFuZ2VzLmhhc093blByb3BlcnR5KGlucHV0KTtcbiAgICBpZiAoaXNVcGRhdGVkICYmICFjaGFuZ2VzW2lucHV0XS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ3Jhd1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYHJhd1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgcmF3U3JjYCBpcyBhbHJlYWR5IHNldC4gV2UgdXNlXG4gICAgICAgIC8vIGByYXdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtyYXdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5cbmZ1bmN0aW9uIGFzc2VydEdyZWF0ZXJUaGFuWmVyb051bWJlcihcbiAgICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHZhbGlkTnVtYmVyID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInICYmIGlucHV0VmFsdWUgPiAwO1xuICBjb25zdCB2YWxpZFN0cmluZyA9XG4gICAgICB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkgJiYgcGFyc2VJbnQoaW5wdXRWYWx1ZSkgPiAwO1xuICBpZiAoIXZhbGlkTnVtYmVyICYmICF2YWxpZFN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIGAgK1xuICAgICAgICAgICAgYChcXGAke2lucHV0VmFsdWV9XFxgKS4gVG8gZml4IHRoaXMsIHByb3ZpZGUgXFxgJHtpbnB1dE5hbWV9XFxgIGAgK1xuICAgICAgICAgICAgYGFzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGlzIG5vdCB2aXN1YWxseSBkaXN0b3J0ZWQuIEVmZmVjdGl2ZWx5IHRoaXMgaXMgY2hlY2tpbmc6XG4vLyAtIFdoZXRoZXIgdGhlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHJlZmxlY3QgdGhlIGFjdHVhbCBkaW1lbnNpb25zIG9mIHRoZSBpbWFnZS5cbi8vIC0gV2hldGhlciBpbWFnZSBzdHlsaW5nIGlzIFwiY29ycmVjdFwiIChzZWUgYmVsb3cgZm9yIGEgbG9uZ2VyIGV4cGxhbmF0aW9uKS5cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgZWxlbWVudDogRWxlbWVudFJlZjxhbnk+LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IGltZyA9IGVsZW1lbnQubmF0aXZlRWxlbWVudDtcbiAgY29uc3QgcmVtb3ZlTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCByZW5kZXJlZFdpZHRoID0gcGFyc2VGbG9hdChpbWcuY2xpZW50V2lkdGgpO1xuICAgIGNvbnN0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChpbWcuY2xpZW50SGVpZ2h0KTtcbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBwYXJzZUZsb2F0KGltZy5uYXR1cmFsV2lkdGgpO1xuICAgIGNvbnN0IGludHJpbnNpY0hlaWdodCA9IHBhcnNlRmxvYXQoaW1nLm5hdHVyYWxIZWlnaHQpO1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPSBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuICAgIGlmIChpbmFjY3VyYXRlRGltZW5zaW9ucykge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgaW1hZ2UgZG9lcyBub3QgbWF0Y2ggYCArXG4gICAgICAgICAgICAgIGB0aGUgYXNwZWN0IHJhdGlvIGluZGljYXRlZCBieSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLiBgICtcbiAgICAgICAgICAgICAgYEludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtpbnRyaW5zaWNBc3BlY3RSYXRpb30pLiBTdXBwbGllZCB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXM6IGAgK1xuICAgICAgICAgICAgICBgJHtzdXBwbGllZFdpZHRofXcgeCAke3N1cHBsaWVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtzdXBwbGllZEFzcGVjdFJhdGlvfSkuIGAgK1xuICAgICAgICAgICAgICBgVG8gZml4IHRoaXMsIHVwZGF0ZSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLmApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0eWxpbmdEaXN0b3J0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBgICtcbiAgICAgICAgICAgICAgICBgZG9lcyBub3QgbWF0Y2ggdGhlIGltYWdlJ3MgaW50cmluc2ljIGFzcGVjdCByYXRpby4gYCArXG4gICAgICAgICAgICAgICAgYEludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke2ludHJpbnNpY0FzcGVjdFJhdGlvfSkuIFJlbmRlcmVkIGltYWdlIHNpemU6IGAgK1xuICAgICAgICAgICAgICAgIGAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiBgICtcbiAgICAgICAgICAgICAgICBgJHtyZW5kZXJlZEFzcGVjdFJhdGlvfSkuIFRoaXMgaXNzdWUgY2FuIG9jY3VyIGlmIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBgICtcbiAgICAgICAgICAgICAgICBgYXR0cmlidXRlcyBhcmUgYWRkZWQgdG8gYW4gaW1hZ2Ugd2l0aG91dCB1cGRhdGluZyB0aGUgY29ycmVzcG9uZGluZyBgICtcbiAgICAgICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgICAgICBgYWRkaW5nIFwiaGVpZ2h0OiBhdXRvXCIgb3IgXCJ3aWR0aDogYXV0b1wiIHRvIHRoZSBpbWFnZSBzdHlsaW5nIHdpbGwgZml4IGAgK1xuICAgICAgICAgICAgICAgIGB0aGlzIGlzc3VlLmApKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vLyBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBtaXNzaW5nQXR0cmlidXRlcyA9IFtdO1xuICBpZiAoZGlyLndpZHRoID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ3dpZHRoJyk7XG4gIGlmIChkaXIuaGVpZ2h0ID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ2hlaWdodCcpO1xuICBpZiAobWlzc2luZ0F0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUkVRVUlSRURfSU5QVVRfTUlTU0lORyxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gdGhlc2UgcmVxdWlyZWQgYXR0cmlidXRlcyBgICtcbiAgICAgICAgICAgIGBhcmUgbWlzc2luZzogJHttaXNzaW5nQXR0cmlidXRlcy5tYXAoYXR0ciA9PiBgXCIke2F0dHJ9XCJgKS5qb2luKCcsICcpfS4gYCArXG4gICAgICAgICAgICBgSW5jbHVkaW5nIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHdpbGwgcHJldmVudCBpbWFnZS1yZWxhdGVkIGxheW91dCBzaGlmdHMuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBpbmNsdWRlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIG9uIHRoZSBpbWFnZSB0YWcuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYGxvYWRpbmdgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSB2YWxpZCBpbnB1dCAmXG4vLyBpcyBub3QgdXNlZCBvbiBwcmlvcml0eSBpbWFnZXMuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5sb2FkaW5nICYmIGRpci5wcmlvcml0eSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYHdhcyB1c2VkIG9uIGFuIGltYWdlIHRoYXQgd2FzIG1hcmtlZCBcInByaW9yaXR5XCIuIGAgK1xuICAgICAgICAgICAgYFNldHRpbmcgXFxgbG9hZGluZ1xcYCBvbiBwcmlvcml0eSBpbWFnZXMgaXMgbm90IGFsbG93ZWQgYCArXG4gICAgICAgICAgICBgYmVjYXVzZSB0aGVzZSBpbWFnZXMgd2lsbCBhbHdheXMgYmUgZWFnZXJseSBsb2FkZWQuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCByZW1vdmUgdGhlIOKAnGxvYWRpbmfigJ0gYXR0cmlidXRlIGZyb20gdGhlIHByaW9yaXR5IGltYWdlLmApO1xuICB9XG4gIGNvbnN0IHZhbGlkSW5wdXRzID0gWydhdXRvJywgJ2VhZ2VyJywgJ2xhenknXTtcbiAgaWYgKHR5cGVvZiBkaXIubG9hZGluZyA9PT0gJ3N0cmluZycgJiYgIXZhbGlkSW5wdXRzLmluY2x1ZGVzKGRpci5sb2FkaW5nKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke2Rpci5sb2FkaW5nfVxcYCkuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgdmFsaWQgdmFsdWUgKFwibGF6eVwiLCBcImVhZ2VyXCIsIG9yIFwiYXV0b1wiKS5gKTtcbiAgfVxufVxuIl19