/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, inject, InjectionToken, Injector, Input, NgZone, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
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
 * Should match something like: "1x, 2x, 50x". Also supports decimals like "1.5x, 1.50x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;
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
 * Used in generating automatic density-based srcsets
 */
const DENSITY_SRCSET_MULTIPLIERS = [1, 2];
/**
 * Used to determine which breakpoints to use on full-width images
 */
const VIEWPORT_BREAKPOINT_CUTOFF = 640;
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
const defaultConfig = {
    breakpoints: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
};
/**
 * Injection token that configures the image optimized image functionality.
 *
 * @see `NgOptimizedImage`
 * @publicApi
 * @developerPreview
 */
export const IMAGE_CONFIG = new InjectionToken('ImageConfig', { providedIn: 'root', factory: () => defaultConfig });
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
 * - Automatically generates a srcset
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
 * 3. Update the necessary `<img>` tags in templates and replace `src` attributes with `ngSrc`.
 * Using a `ngSrc` allows the directive to control when the `src` gets set, which triggers an image
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
 * transformations to the resource URL and the value of the `ngSrc` attribute will be used as is.
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
 * Step 3: update `<img>` tags in templates to use `ngSrc` instead of `src`.
 *
 * ```
 * <img ngSrc="logo.png" width="200" height="100">
 * ```
 *
 * @publicApi
 * @developerPreview
 */
export class NgOptimizedImage {
    constructor() {
        this.imageLoader = inject(IMAGE_LOADER);
        this.config = processConfig(inject(IMAGE_CONFIG));
        this.renderer = inject(Renderer2);
        this.imgElement = inject(ElementRef).nativeElement;
        this.injector = inject(Injector);
        // a LCP image observer - should be injected only in the dev mode
        this.lcpObserver = ngDevMode ? this.injector.get(LCPImageObserver) : null;
        /**
         * Calculate the rewritten `src` once and store it.
         * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
         * `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
         * instance that might be already destroyed).
         */
        this._renderedSrc = null;
        this._priority = false;
        this._disableOptimizedSrcset = false;
    }
    /**
     * Previously, the `rawSrc` attribute was used to activate the directive.
     * The attribute was renamed to `ngSrc` and this input just produces an error,
     * suggesting to switch to `ngSrc` instead.
     *
     * This error should be removed in v15.
     *
     * @nodoc
     * @deprecated Use `ngSrc` instead.
     */
    set rawSrc(value) {
        if (ngDevMode) {
            throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(value, false)} the \`rawSrc\` attribute was used ` +
                `to activate the directive. Newer version of the directive uses the \`ngSrc\` ` +
                `attribute instead. Please replace \`rawSrc\` with \`ngSrc\` and ` +
                `\`rawSrcset\` with \`ngSrcset\` attributes in the template to ` +
                `enable image optimizations.`);
        }
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
    /**
     * Disables automatic srcset generation for this image.
     */
    set disableOptimizedSrcset(value) {
        this._disableOptimizedSrcset = inputToBoolean(value);
    }
    get disableOptimizedSrcset() {
        return this._disableOptimizedSrcset;
    }
    ngOnInit() {
        if (ngDevMode) {
            assertNonEmptyInput(this, 'ngSrc', this.ngSrc);
            assertValidNgSrcset(this, this.ngSrcset);
            assertNoConflictingSrc(this);
            if (this.ngSrcset) {
                assertNoConflictingSrcset(this);
            }
            assertNotBase64Image(this);
            assertNotBlobUrl(this);
            assertNonEmptyWidthAndHeight(this);
            assertValidLoadingInput(this);
            assertNoImageDistortion(this, this.imgElement, this.renderer);
            if (!this.ngSrcset) {
                assertNoComplexSizes(this);
            }
            if (this.priority) {
                const checker = this.injector.get(PreconnectLinkChecker);
                checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
            }
            else {
                // Monitor whether an image is an LCP element only in case
                // the `priority` attribute is missing. Otherwise, an image
                // has the necessary settings and no extra checks are required.
                if (this.lcpObserver !== null) {
                    const ngZone = this.injector.get(NgZone);
                    ngZone.runOutsideAngular(() => {
                        this.lcpObserver.registerImage(this.getRewrittenSrc(), this.ngSrc);
                    });
                }
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
        if (this.sizes) {
            this.setHostAttribute('sizes', this.sizes);
        }
        if (this.ngSrcset) {
            this.setHostAttribute('srcset', this.getRewrittenSrcset());
        }
        else if (!this._disableOptimizedSrcset && !this.srcset) {
            this.setHostAttribute('srcset', this.getAutomaticSrcset());
        }
    }
    ngOnChanges(changes) {
        if (ngDevMode) {
            assertNoPostInitInputChange(this, changes, ['ngSrc', 'ngSrcset', 'width', 'height', 'priority']);
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
            const imgConfig = { src: this.ngSrc };
            // Cache calculated image src to reuse it later in the code.
            this._renderedSrc = this.imageLoader(imgConfig);
        }
        return this._renderedSrc;
    }
    getRewrittenSrcset() {
        const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
        const finalSrcs = this.ngSrcset.split(',').filter(src => src !== '').map(srcStr => {
            srcStr = srcStr.trim();
            const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
            return `${this.imageLoader({ src: this.ngSrc, width })} ${srcStr}`;
        });
        return finalSrcs.join(', ');
    }
    getAutomaticSrcset() {
        if (this.sizes) {
            return this.getResponsiveSrcset();
        }
        else {
            return this.getFixedSrcset();
        }
    }
    getResponsiveSrcset() {
        const { breakpoints } = this.config;
        let filteredBreakpoints = breakpoints;
        if (this.sizes?.trim() === '100vw') {
            // Since this is a full-screen-width image, our srcset only needs to include
            // breakpoints with full viewport widths.
            filteredBreakpoints = breakpoints.filter(bp => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
        }
        const finalSrcs = filteredBreakpoints.map(bp => `${this.imageLoader({ src: this.ngSrc, width: bp })} ${bp}w`);
        return finalSrcs.join(', ');
    }
    getFixedSrcset() {
        const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map(multiplier => `${this.imageLoader({ src: this.ngSrc, width: this.width * multiplier })} ${multiplier}x`);
        return finalSrcs.join(', ');
    }
    ngOnDestroy() {
        if (ngDevMode) {
            if (!this.priority && this._renderedSrc !== null && this.lcpObserver !== null) {
                this.lcpObserver.unregisterImage(this._renderedSrc);
            }
        }
    }
    setHostAttribute(name, value) {
        this.renderer.setAttribute(this.imgElement, name, value);
    }
}
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.0-next.5+sha-6bcde0e", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.0.0-next.5+sha-6bcde0e", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc],img[rawSrc]", inputs: { rawSrc: "rawSrc", ngSrc: "ngSrc", ngSrcset: "ngSrcset", sizes: "sizes", width: "width", height: "height", loading: "loading", priority: "priority", disableOptimizedSrcset: "disableOptimizedSrcset", src: "src", srcset: "srcset" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.0-next.5+sha-6bcde0e", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[ngSrc],img[rawSrc]',
                }]
        }], propDecorators: { rawSrc: [{
                type: Input
            }], ngSrc: [{
                type: Input
            }], ngSrcset: [{
                type: Input
            }], sizes: [{
                type: Input
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], loading: [{
                type: Input
            }], priority: [{
                type: Input
            }], disableOptimizedSrcset: [{
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
 * Sorts provided config breakpoints and uses defaults.
 */
function processConfig(config) {
    let sortedBreakpoints = {};
    if (config.breakpoints) {
        sortedBreakpoints.breakpoints = config.breakpoints.sort((a, b) => a - b);
    }
    return Object.assign({}, defaultConfig, config, sortedBreakpoints);
}
/***** Assert functions *****/
/**
 * Verifies that there is no `src` set on a host element.
 */
function assertNoConflictingSrc(dir) {
    if (dir.src) {
        throw new RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`src\` and \`ngSrc\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`src\` itself based on the value of \`ngSrc\`. ` +
            `To fix this, please remove the \`src\` attribute.`);
    }
}
/**
 * Verifies that there is no `srcset` set on a host element.
 */
function assertNoConflictingSrcset(dir) {
    if (dir.srcset) {
        throw new RuntimeError(2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`srcset\` and \`ngSrcset\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`srcset\` itself based on the value of ` +
            `\`ngSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
    }
}
/**
 * Verifies that the `ngSrc` is not a Base64-encoded image.
 */
function assertNotBase64Image(dir) {
    let ngSrc = dir.ngSrc.trim();
    if (ngSrc.startsWith('data:')) {
        if (ngSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
            ngSrc = ngSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
        }
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`ngSrc\` is a Base64-encoded string ` +
            `(${ngSrc}). NgOptimizedImage does not support Base64-encoded strings. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`ngSrc\` and using a standard \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the 'sizes' only includes responsive values.
 */
function assertNoComplexSizes(dir) {
    let sizes = dir.sizes;
    if (sizes?.match(/((\)|,)\s|^)\d+px/)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`sizes\` was set to a string including ` +
            `pixel values. For automatic \`srcset\` generation, \`sizes\` must only include responsive ` +
            `values, such as \`sizes="50vw"\` or \`sizes="(min-width: 768px) 50vw, 100vw"\`. ` +
            `To fix this, modify the \`sizes\` attribute, or provide your own \`ngSrcset\` value directly.`);
    }
}
/**
 * Verifies that the `ngSrc` is not a Blob URL.
 */
function assertNotBlobUrl(dir) {
    const ngSrc = dir.ngSrc.trim();
    if (ngSrc.startsWith('blob:')) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrc\` was set to a blob URL (${ngSrc}). ` +
            `Blob URLs are not supported by the NgOptimizedImage directive. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`ngSrc\` and using a regular \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the input is set to a non-empty string.
 */
function assertNonEmptyInput(dir, name, value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    if (!isString || isEmptyString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${name}\` has an invalid value ` +
            `(\`${value}\`). To fix this, change the value to a non-empty string.`);
    }
}
/**
 * Verifies that the `ngSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x".
 */
export function assertValidNgSrcset(dir, value) {
    if (value == null)
        return;
    assertNonEmptyInput(dir, 'ngSrcset', value);
    const stringVal = value;
    const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
    const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
    if (isValidDensityDescriptor) {
        assertUnderDensityCap(dir, stringVal);
    }
    const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
    if (!isValidSrcset) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrcset\` has an invalid value (\`${value}\`). ` +
            `To fix this, supply \`ngSrcset\` using a comma-separated list of one or more width ` +
            `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`);
    }
}
function assertUnderDensityCap(dir, value) {
    const underDensityCap = value.split(',').every(num => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
    if (!underDensityCap) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` contains an unsupported image density:` +
            `\`${value}\`. NgOptimizedImage generally recommends a max image density of ` +
            `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
            `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
            `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
    }
}
/**
 * Creates a `RuntimeError` instance to represent a situation when an input is set after
 * the directive has initialized.
 */
function postInitInputChangeError(dir, inputName) {
    return new RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. ` +
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
            if (input === 'ngSrc') {
                // When the `ngSrc` input changes, we detect that only in the
                // `ngOnChanges` hook, thus the `ngSrc` is already set. We use
                // `ngSrc` in the error message, so we use a previous value, but
                // not the updated one in it.
                dir = { ngSrc: changes[input].previousValue };
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
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value ` +
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
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the image does not match ` +
                `the aspect ratio indicated by the width and height attributes. ` +
                `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${intrinsicAspectRatio}). \nSupplied width and height attributes: ` +
                `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${suppliedAspectRatio}). ` +
                `\nTo fix this, update the width and height attributes.`));
        }
        else if (stylingDistortion) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image ` +
                `does not match the image's intrinsic aspect ratio. ` +
                `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${intrinsicAspectRatio}). \nRendered image size: ` +
                `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` +
                `${renderedAspectRatio}). \nThis issue can occur if "width" and "height" ` +
                `attributes are added to an image without updating the corresponding ` +
                `image styling. To fix this, adjust image styling. In most cases, ` +
                `adding "height: auto" or "width: auto" to the image styling will fix ` +
                `this issue.`));
        }
        else if (!dir.ngSrcset && nonZeroRenderedDimensions) {
            // If `ngSrcset` hasn't been set, sanity check the intrinsic size.
            const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
            const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
            const oversizedWidth = (intrinsicWidth - recommendedWidth) >= OVERSIZED_IMAGE_TOLERANCE;
            const oversizedHeight = (intrinsicHeight - recommendedHeight) >= OVERSIZED_IMAGE_TOLERANCE;
            if (oversizedWidth || oversizedHeight) {
                console.warn(formatRuntimeError(2960 /* RuntimeErrorCode.OVERSIZED_IMAGE */, `${imgDirectiveDetails(dir.ngSrc)} the intrinsic image is significantly ` +
                    `larger than necessary. ` +
                    `\nRendered image size: ${renderedWidth}w x ${renderedHeight}h. ` +
                    `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. ` +
                    `\nRecommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. ` +
                    `\nNote: Recommended intrinsic image size is calculated assuming a maximum DPR of ` +
                    `${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image ` +
                    `or consider using the "ngSrcset" and "sizes" attributes.`));
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
        throw new RuntimeError(2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir.ngSrc)} these required attributes ` +
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
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
            `was used on an image that was marked "priority". ` +
            `Setting \`loading\` on priority images is not allowed ` +
            `because these images will always be eagerly loaded. ` +
            `To fix this, remove the “loading” attribute from the priority image.`);
    }
    const validInputs = ['auto', 'eager', 'lazy'];
    if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
            `has an invalid value (\`${dir.loading}\`). ` +
            `To fix this, provide a valid value ("lazy", "eager", or "auto").`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBZ0MsU0FBUyxFQUFpQixtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBSXZPLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQzs7QUFFaEU7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRywyQkFBMkIsQ0FBQztBQUVsRTs7O0dBR0c7QUFDSCxNQUFNLCtCQUErQixHQUFHLG1DQUFtQyxDQUFDO0FBRTVFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxDQUFDLENBQUM7QUFFN0M7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxDQUFDO0FBRWhEOztHQUVHO0FBQ0gsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxQzs7R0FFRztBQUNILE1BQU0sMEJBQTBCLEdBQUcsR0FBRyxD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Q0FBQyxDQUFDO0tBQzdFO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgaW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgSW5qZWN0b3IsIElucHV0LCBOZ1pvbmUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFJlbmRlcmVyMiwgU2ltcGxlQ2hhbmdlcywgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtJTUFHRV9MT0FERVJ9IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZV9sb2FkZXInO1xuaW1wb3J0IHtMQ1BJbWFnZU9ic2VydmVyfSBmcm9tICcuL2xjcF9pbWFnZV9vYnNlcnZlcic7XG5pbXBvcnQge1ByZWNvbm5lY3RMaW5rQ2hlY2tlcn0gZnJvbSAnLi9wcmVjb25uZWN0X2xpbmtfY2hlY2tlcic7XG5cbi8qKlxuICogV2hlbiBhIEJhc2U2NC1lbmNvZGVkIGltYWdlIGlzIHBhc3NlZCBhcyBhbiBpbnB1dCB0byB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSxcbiAqIGFuIGVycm9yIGlzIHRocm93bi4gVGhlIGltYWdlIGNvbnRlbnQgKGFzIGEgc3RyaW5nKSBtaWdodCBiZSB2ZXJ5IGxvbmcsIHRodXMgbWFraW5nXG4gKiBpdCBoYXJkIHRvIHJlYWQgYW4gZXJyb3IgbWVzc2FnZSBpZiB0aGUgZW50aXJlIHN0cmluZyBpcyBpbmNsdWRlZC4gVGhpcyBjb25zdCBkZWZpbmVzXG4gKiB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW50byB0aGUgZXJyb3IgbWVzc2FnZS4gVGhlIHJlc3RcbiAqIG9mIHRoZSBjb250ZW50IGlzIHRydW5jYXRlZC5cbiAqL1xuY29uc3QgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SID0gNTA7XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyB3aWR0aCBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxMDB3LCAyMDB3XCIuXG4gKi9cbmNvbnN0IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrd1xccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxeCwgMngsIDUweFwiLiBBbHNvIHN1cHBvcnRzIGRlY2ltYWxzIGxpa2UgXCIxLjV4LCAxLjUweFwiLlxuICovXG5jb25zdCBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrKFxcLlxcZCspP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgaW4gZ2VuZXJhdGluZyBhdXRvbWF0aWMgZGVuc2l0eS1iYXNlZCBzcmNzZXRzXG4gKi9cbmNvbnN0IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTID0gWzEsIDJdO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGJyZWFrcG9pbnRzIHRvIHVzZSBvbiBmdWxsLXdpZHRoIGltYWdlc1xuICovXG5jb25zdCBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRiA9IDY0MDtcbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYXNwZWN0IHJhdGlvcyBhcmUgc2ltaWxhciBpbiB2YWx1ZS5cbiAqL1xuY29uc3QgQVNQRUNUX1JBVElPX1RPTEVSQU5DRSA9IC4xO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGltYWdlIGhhcyBiZWVuIHJlcXVlc3RlZCBhdCBhbiBvdmVybHlcbiAqIGxhcmdlIHNpemUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCByZW5kZXJlZCBpbWFnZSBzaXplIChhZnRlciB0YWtpbmdcbiAqIGludG8gYWNjb3VudCBhIHR5cGljYWwgZGV2aWNlIHBpeGVsIHJhdGlvKS4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTAwMDtcblxuLyoqXG4gKiBBIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGZvciB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIENvbnRhaW5zOlxuICogLSBicmVha3BvaW50czogQW4gYXJyYXkgb2YgaW50ZWdlciBicmVha3BvaW50cyB1c2VkIHRvIGdlbmVyYXRlXG4gKiAgICAgIHNyY3NldHMgZm9yIHJlc3BvbnNpdmUgaW1hZ2VzLlxuICpcbiAqIExlYXJuIG1vcmUgYWJvdXQgdGhlIHJlc3BvbnNpdmUgaW1hZ2UgY29uZmlndXJhdGlvbiBpbiBbdGhlIE5nT3B0aW1pemVkSW1hZ2VcbiAqIGd1aWRlXShndWlkZS9pbWFnZS1kaXJlY3RpdmUpLlxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuZXhwb3J0IHR5cGUgSW1hZ2VDb25maWcgPSB7XG4gIGJyZWFrcG9pbnRzPzogbnVtYmVyW11cbn07XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IEltYWdlQ29uZmlnID0ge1xuICBicmVha3BvaW50czogWzE2LCAzMiwgNDgsIDY0LCA5NiwgMTI4LCAyNTYsIDM4NCwgNjQwLCA3NTAsIDgyOCwgMTA4MCwgMTIwMCwgMTkyMCwgMjA0OCwgMzg0MF0sXG59O1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNvbmZpZ3VyZXMgdGhlIGltYWdlIG9wdGltaXplZCBpbWFnZSBmdW5jdGlvbmFsaXR5LlxuICpcbiAqIEBzZWUgYE5nT3B0aW1pemVkSW1hZ2VgXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5leHBvcnQgY29uc3QgSU1BR0VfQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuPEltYWdlQ29uZmlnPihcbiAgICAnSW1hZ2VDb25maWcnLCB7cHJvdmlkZWRJbjogJ3Jvb3QnLCBmYWN0b3J5OiAoKSA9PiBkZWZhdWx0Q29uZmlnfSk7XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgaW1wcm92ZXMgaW1hZ2UgbG9hZGluZyBwZXJmb3JtYW5jZSBieSBlbmZvcmNpbmcgYmVzdCBwcmFjdGljZXMuXG4gKlxuICogYE5nT3B0aW1pemVkSW1hZ2VgIGVuc3VyZXMgdGhhdCB0aGUgbG9hZGluZyBvZiB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGltYWdlIGlzXG4gKiBwcmlvcml0aXplZCBieTpcbiAqIC0gQXV0b21hdGljYWxseSBzZXR0aW5nIHRoZSBgZmV0Y2hwcmlvcml0eWAgYXR0cmlidXRlIG9uIHRoZSBgPGltZz5gIHRhZ1xuICogLSBMYXp5IGxvYWRpbmcgbm9uLXByaW9yaXR5IGltYWdlcyBieSBkZWZhdWx0XG4gKiAtIEFzc2VydGluZyB0aGF0IHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyBwcmVjb25uZWN0IGxpbmsgdGFnIGluIHRoZSBkb2N1bWVudCBoZWFkXG4gKlxuICogSW4gYWRkaXRpb24sIHRoZSBkaXJlY3RpdmU6XG4gKiAtIEdlbmVyYXRlcyBhcHByb3ByaWF0ZSBhc3NldCBVUkxzIGlmIGEgY29ycmVzcG9uZGluZyBgSW1hZ2VMb2FkZXJgIGZ1bmN0aW9uIGlzIHByb3ZpZGVkXG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVzIGEgc3Jjc2V0XG4gKiAtIFJlcXVpcmVzIHRoYXQgYHdpZHRoYCBhbmQgYGhlaWdodGAgYXJlIHNldFxuICogLSBXYXJucyBpZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGhhdmUgYmVlbiBzZXQgaW5jb3JyZWN0bHlcbiAqIC0gV2FybnMgaWYgdGhlIGltYWdlIHdpbGwgYmUgdmlzdWFsbHkgZGlzdG9ydGVkIHdoZW4gcmVuZGVyZWRcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgaXMgbWFya2VkIGFzIFtzdGFuZGFsb25lXShndWlkZS9zdGFuZGFsb25lLWNvbXBvbmVudHMpIGFuZCBjYW5cbiAqIGJlIGltcG9ydGVkIGRpcmVjdGx5LlxuICpcbiAqIEZvbGxvdyB0aGUgc3RlcHMgYmVsb3cgdG8gZW5hYmxlIGFuZCB1c2UgdGhlIGRpcmVjdGl2ZTpcbiAqIDEuIEltcG9ydCBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGUgb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudC5cbiAqIDIuIE9wdGlvbmFsbHkgcHJvdmlkZSBhbiBgSW1hZ2VMb2FkZXJgIGlmIHlvdSB1c2UgYW4gaW1hZ2UgaG9zdGluZyBzZXJ2aWNlLlxuICogMy4gVXBkYXRlIHRoZSBuZWNlc3NhcnkgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyBhbmQgcmVwbGFjZSBgc3JjYCBhdHRyaWJ1dGVzIHdpdGggYG5nU3JjYC5cbiAqIFVzaW5nIGEgYG5nU3JjYCBhbGxvd3MgdGhlIGRpcmVjdGl2ZSB0byBjb250cm9sIHdoZW4gdGhlIGBzcmNgIGdldHMgc2V0LCB3aGljaCB0cmlnZ2VycyBhbiBpbWFnZVxuICogZG93bmxvYWQuXG4gKlxuICogU3RlcCAxOiBpbXBvcnQgdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgTmdPcHRpbWl6ZWRJbWFnZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gSW5jbHVkZSBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGVcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBBcHBNb2R1bGUge31cbiAqXG4gKiAvLyAuLi4gb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudFxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWVcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIE15U3RhbmRhbG9uZUNvbXBvbmVudCB7fVxuICogYGBgXG4gKlxuICogU3RlcCAyOiBjb25maWd1cmUgYSBsb2FkZXIuXG4gKlxuICogVG8gdXNlIHRoZSAqKmRlZmF1bHQgbG9hZGVyKio6IG5vIGFkZGl0aW9uYWwgY29kZSBjaGFuZ2VzIGFyZSBuZWNlc3NhcnkuIFRoZSBVUkwgcmV0dXJuZWQgYnkgdGhlXG4gKiBnZW5lcmljIGxvYWRlciB3aWxsIGFsd2F5cyBtYXRjaCB0aGUgdmFsdWUgb2YgXCJzcmNcIi4gSW4gb3RoZXIgd29yZHMsIHRoaXMgbG9hZGVyIGFwcGxpZXMgbm9cbiAqIHRyYW5zZm9ybWF0aW9ucyB0byB0aGUgcmVzb3VyY2UgVVJMIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGBuZ1NyY2AgYXR0cmlidXRlIHdpbGwgYmUgdXNlZCBhcyBpcy5cbiAqXG4gKiBUbyB1c2UgYW4gZXhpc3RpbmcgbG9hZGVyIGZvciBhICoqdGhpcmQtcGFydHkgaW1hZ2Ugc2VydmljZSoqOiBhZGQgdGhlIHByb3ZpZGVyIGZhY3RvcnkgZm9yIHlvdXJcbiAqIGNob3NlbiBzZXJ2aWNlIHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheS4gSW4gdGhlIGV4YW1wbGUgYmVsb3csIHRoZSBJbWdpeCBsb2FkZXIgaXMgdXNlZDpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3Byb3ZpZGVJbWdpeExvYWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDYWxsIHRoZSBmdW5jdGlvbiBhbmQgYWRkIHRoZSByZXN1bHQgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5OlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHByb3ZpZGVJbWdpeExvYWRlcihcImh0dHBzOi8vbXkuYmFzZS51cmwvXCIpLFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIHByb3ZpZGVzIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICogLSBgcHJvdmlkZUNsb3VkZmxhcmVMb2FkZXJgXG4gKiAtIGBwcm92aWRlQ2xvdWRpbmFyeUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWFnZUtpdExvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWdpeExvYWRlcmBcbiAqXG4gKiBJZiB5b3UgdXNlIGEgZGlmZmVyZW50IGltYWdlIHByb3ZpZGVyLCB5b3UgY2FuIGNyZWF0ZSBhIGN1c3RvbSBsb2FkZXIgZnVuY3Rpb24gYXMgZGVzY3JpYmVkXG4gKiBiZWxvdy5cbiAqXG4gKiBUbyB1c2UgYSAqKmN1c3RvbSBsb2FkZXIqKjogcHJvdmlkZSB5b3VyIGxvYWRlciBmdW5jdGlvbiBhcyBhIHZhbHVlIGZvciB0aGUgYElNQUdFX0xPQURFUmAgRElcbiAqIHRva2VuLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDb25maWd1cmUgdGhlIGxvYWRlciB1c2luZyB0aGUgYElNQUdFX0xPQURFUmAgdG9rZW4uXG4gKiBwcm92aWRlcnM6IFtcbiAqICAge1xuICogICAgICBwcm92aWRlOiBJTUFHRV9MT0FERVIsXG4gKiAgICAgIHVzZVZhbHVlOiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICogICAgICAgIHJldHVybiBgaHR0cHM6Ly9leGFtcGxlLmNvbS8ke2NvbmZpZy5zcmN9LSR7Y29uZmlnLndpZHRofS5qcGd9YDtcbiAqICAgICAgfVxuICogICB9LFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFN0ZXAgMzogdXBkYXRlIGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgdG8gdXNlIGBuZ1NyY2AgaW5zdGVhZCBvZiBgc3JjYC5cbiAqXG4gKiBgYGBcbiAqIDxpbWcgbmdTcmM9XCJsb2dvLnBuZ1wiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMTAwXCI+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbWdbbmdTcmNdLGltZ1tyYXdTcmNdJyxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGltYWdlTG9hZGVyID0gaW5qZWN0KElNQUdFX0xPQURFUik7XG4gIHByaXZhdGUgY29uZmlnOiBJbWFnZUNvbmZpZyA9IHByb2Nlc3NDb25maWcoaW5qZWN0KElNQUdFX0NPTkZJRykpO1xuICBwcml2YXRlIHJlbmRlcmVyID0gaW5qZWN0KFJlbmRlcmVyMik7XG4gIHByaXZhdGUgaW1nRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuICBwcml2YXRlIGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICAvLyBhIExDUCBpbWFnZSBvYnNlcnZlciAtIHNob3VsZCBiZSBpbmplY3RlZCBvbmx5IGluIHRoZSBkZXYgbW9kZVxuICBwcml2YXRlIGxjcE9ic2VydmVyID0gbmdEZXZNb2RlID8gdGhpcy5pbmplY3Rvci5nZXQoTENQSW1hZ2VPYnNlcnZlcikgOiBudWxsO1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHJld3JpdHRlbiBgc3JjYCBvbmNlIGFuZCBzdG9yZSBpdC5cbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgcmVwZXRpdGl2ZSBjYWxjdWxhdGlvbnMgYW5kIG1ha2Ugc3VyZSB0aGUgZGlyZWN0aXZlIGNsZWFudXAgaW4gdGhlXG4gICAqIGBuZ09uRGVzdHJveWAgZG9lcyBub3QgcmVseSBvbiB0aGUgYElNQUdFX0xPQURFUmAgbG9naWMgKHdoaWNoIGluIHR1cm4gY2FuIHJlbHkgb24gc29tZSBvdGhlclxuICAgKiBpbnN0YW5jZSB0aGF0IG1pZ2h0IGJlIGFscmVhZHkgZGVzdHJveWVkKS5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlcmVkU3JjOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFByZXZpb3VzbHksIHRoZSBgcmF3U3JjYCBhdHRyaWJ1dGUgd2FzIHVzZWQgdG8gYWN0aXZhdGUgdGhlIGRpcmVjdGl2ZS5cbiAgICogVGhlIGF0dHJpYnV0ZSB3YXMgcmVuYW1lZCB0byBgbmdTcmNgIGFuZCB0aGlzIGlucHV0IGp1c3QgcHJvZHVjZXMgYW4gZXJyb3IsXG4gICAqIHN1Z2dlc3RpbmcgdG8gc3dpdGNoIHRvIGBuZ1NyY2AgaW5zdGVhZC5cbiAgICpcbiAgICogVGhpcyBlcnJvciBzaG91bGQgYmUgcmVtb3ZlZCBpbiB2MTUuXG4gICAqXG4gICAqIEBub2RvY1xuICAgKiBAZGVwcmVjYXRlZCBVc2UgYG5nU3JjYCBpbnN0ZWFkLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHJhd1NyYyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyh2YWx1ZSwgZmFsc2UpfSB0aGUgXFxgcmF3U3JjXFxgIGF0dHJpYnV0ZSB3YXMgdXNlZCBgICtcbiAgICAgICAgICAgICAgYHRvIGFjdGl2YXRlIHRoZSBkaXJlY3RpdmUuIE5ld2VyIHZlcnNpb24gb2YgdGhlIGRpcmVjdGl2ZSB1c2VzIHRoZSBcXGBuZ1NyY1xcYCBgICtcbiAgICAgICAgICAgICAgYGF0dHJpYnV0ZSBpbnN0ZWFkLiBQbGVhc2UgcmVwbGFjZSBcXGByYXdTcmNcXGAgd2l0aCBcXGBuZ1NyY1xcYCBhbmQgYCArXG4gICAgICAgICAgICAgIGBcXGByYXdTcmNzZXRcXGAgd2l0aCBcXGBuZ1NyY3NldFxcYCBhdHRyaWJ1dGVzIGluIHRoZSB0ZW1wbGF0ZSB0byBgICtcbiAgICAgICAgICAgICAgYGVuYWJsZSBpbWFnZSBvcHRpbWl6YXRpb25zLmApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCgpIG5nU3JjITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gICAqIFRoZSBpbWFnZSBuYW1lIHdpbGwgYmUgdGFrZW4gZnJvbSBgbmdTcmNgIGFuZCBjb21iaW5lZCB3aXRoIHRoZSBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHlcbiAgICogZGVzY3JpcHRvcnMgdG8gZ2VuZXJhdGUgdGhlIGZpbmFsIGBzcmNzZXRgIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogYGBgXG4gICAqIDxpbWcgbmdTcmM9XCJoZWxsby5qcGdcIiBuZ1NyY3NldD1cIjEwMHcsIDIwMHdcIiAvPiAgPT5cbiAgICogPGltZyBzcmM9XCJwYXRoL2hlbGxvLmpwZ1wiIHNyY3NldD1cInBhdGgvaGVsbG8uanBnP3c9MTAwIDEwMHcsIHBhdGgvaGVsbG8uanBnP3c9MjAwIDIwMHdcIiAvPlxuICAgKiBgYGBcbiAgICovXG4gIEBJbnB1dCgpIG5nU3Jjc2V0ITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBgc2l6ZXNgIGF0dHJpYnV0ZSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBQcm92aWRpbmcgc2l6ZXMgY2F1c2VzIHRoZSBpbWFnZSB0byBjcmVhdGUgYW4gYXV0b21hdGljIHJlc3BvbnNpdmUgc3Jjc2V0LlxuICAgKi9cbiAgQElucHV0KCkgc2l6ZXM/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCB3aWR0aCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHZhbHVlLCAnd2lkdGgnKTtcbiAgICB0aGlzLl93aWR0aCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgd2lkdGgoKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG4gIHByaXZhdGUgX3dpZHRoPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgaW50cmluc2ljIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGhlaWdodCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHZhbHVlLCAnaGVpZ2h0Jyk7XG4gICAgdGhpcy5faGVpZ2h0ID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCBoZWlnaHQoKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuICBwcml2YXRlIF9oZWlnaHQ/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBkZXNpcmVkIGxvYWRpbmcgYmVoYXZpb3IgKGxhenksIGVhZ2VyLCBvciBhdXRvKS5cbiAgICpcbiAgICogU2V0dGluZyBpbWFnZXMgYXMgbG9hZGluZz0nZWFnZXInIG9yIGxvYWRpbmc9J2F1dG8nIG1hcmtzIHRoZW1cbiAgICogYXMgbm9uLXByaW9yaXR5IGltYWdlcy4gQXZvaWQgY2hhbmdpbmcgdGhpcyBpbnB1dCBmb3IgcHJpb3JpdHkgaW1hZ2VzLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGluZz86ICdsYXp5J3wnZWFnZXInfCdhdXRvJztcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbWFnZSBzaG91bGQgaGF2ZSBhIGhpZ2ggcHJpb3JpdHkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgcHJpb3JpdHkodmFsdWU6IHN0cmluZ3xib29sZWFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3ByaW9yaXR5ID0gaW5wdXRUb0Jvb2xlYW4odmFsdWUpO1xuICB9XG4gIGdldCBwcmlvcml0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJpb3JpdHk7XG4gIH1cbiAgcHJpdmF0ZSBfcHJpb3JpdHkgPSBmYWxzZTtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNyY3NldCBnZW5lcmF0aW9uIGZvciB0aGlzIGltYWdlLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGRpc2FibGVPcHRpbWl6ZWRTcmNzZXQodmFsdWU6IHN0cmluZ3xib29sZWFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX2Rpc2FibGVPcHRpbWl6ZWRTcmNzZXQgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IGRpc2FibGVPcHRpbWl6ZWRTcmNzZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVPcHRpbWl6ZWRTcmNzZXQ7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZU9wdGltaXplZFNyY3NldCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY2AgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3JjYCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3Jjc2V0YCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vbkVtcHR5SW5wdXQodGhpcywgJ25nU3JjJywgdGhpcy5uZ1NyYyk7XG4gICAgICBhc3NlcnRWYWxpZE5nU3Jjc2V0KHRoaXMsIHRoaXMubmdTcmNzZXQpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyh0aGlzKTtcbiAgICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQodGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVcmwodGhpcyk7XG4gICAgICBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQodGhpcyk7XG4gICAgICBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbih0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpO1xuICAgICAgaWYgKCF0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29tcGxleFNpemVzKHRoaXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuYXNzZXJ0UHJlY29ubmVjdCh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE1vbml0b3Igd2hldGhlciBhbiBpbWFnZSBpcyBhbiBMQ1AgZWxlbWVudCBvbmx5IGluIGNhc2VcbiAgICAgICAgLy8gdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGlzIG1pc3NpbmcuIE90aGVyd2lzZSwgYW4gaW1hZ2VcbiAgICAgICAgLy8gaGFzIHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgYW5kIG5vIGV4dHJhIGNoZWNrcyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sY3BPYnNlcnZlciEucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGVzKCk7XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGVzKCkge1xuICAgIC8vIE11c3Qgc2V0IHdpZHRoL2hlaWdodCBleHBsaWNpdGx5IGluIGNhc2UgdGhleSBhcmUgYm91bmQgKGluIHdoaWNoIGNhc2UgdGhleSB3aWxsXG4gICAgLy8gb25seSBiZSByZWZsZWN0ZWQgYW5kIG5vdCBmb3VuZCBieSB0aGUgYnJvd3NlcilcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCEudG9TdHJpbmcoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodCEudG9TdHJpbmcoKSk7XG5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG4gICAgLy8gVGhlIGBzcmNgIGFuZCBgc3Jjc2V0YCBhdHRyaWJ1dGVzIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCB0aGlzLmdldFJld3JpdHRlblNyYygpKTtcbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzaXplcycsIHRoaXMuc2l6ZXMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZ1NyY3NldCkge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmNzZXQnLCB0aGlzLmdldFJld3JpdHRlblNyY3NldCgpKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9kaXNhYmxlT3B0aW1pemVkU3Jjc2V0ICYmICF0aGlzLnNyY3NldCkge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmNzZXQnLCB0aGlzLmdldEF1dG9tYXRpY1NyY3NldCgpKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgICAgICAgIHRoaXMsIGNoYW5nZXMsIFsnbmdTcmMnLCAnbmdTcmNzZXQnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ3ByaW9yaXR5J10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMubG9hZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgaWYgKCF0aGlzLl9yZW5kZXJlZFNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5uZ1NyY307XG4gICAgICAvLyBDYWNoZSBjYWxjdWxhdGVkIGltYWdlIHNyYyB0byByZXVzZSBpdCBsYXRlciBpbiB0aGUgY29kZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gdGhpcy5pbWFnZUxvYWRlcihpbWdDb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyZWRTcmM7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHdpZHRoU3JjU2V0ID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdCh0aGlzLm5nU3Jjc2V0KTtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSB0aGlzLm5nU3Jjc2V0LnNwbGl0KCcsJykuZmlsdGVyKHNyYyA9PiBzcmMgIT09ICcnKS5tYXAoc3JjU3RyID0+IHtcbiAgICAgIHNyY1N0ciA9IHNyY1N0ci50cmltKCk7XG4gICAgICBjb25zdCB3aWR0aCA9IHdpZHRoU3JjU2V0ID8gcGFyc2VGbG9hdChzcmNTdHIpIDogcGFyc2VGbG9hdChzcmNTdHIpICogdGhpcy53aWR0aCE7XG4gICAgICByZXR1cm4gYCR7dGhpcy5pbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aH0pfSAke3NyY1N0cn1gO1xuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QXV0b21hdGljU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlc3BvbnNpdmVTcmNzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWRTcmNzZXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFJlc3BvbnNpdmVTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB7YnJlYWtwb2ludHN9ID0gdGhpcy5jb25maWc7XG5cbiAgICBsZXQgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzITtcbiAgICBpZiAodGhpcy5zaXplcz8udHJpbSgpID09PSAnMTAwdncnKSB7XG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgZnVsbC1zY3JlZW4td2lkdGggaW1hZ2UsIG91ciBzcmNzZXQgb25seSBuZWVkcyB0byBpbmNsdWRlXG4gICAgICAvLyBicmVha3BvaW50cyB3aXRoIGZ1bGwgdmlld3BvcnQgd2lkdGhzLlxuICAgICAgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzIS5maWx0ZXIoYnAgPT4gYnAgPj0gVklFV1BPUlRfQlJFQUtQT0lOVF9DVVRPRkYpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmFsU3JjcyA9XG4gICAgICAgIGZpbHRlcmVkQnJlYWtwb2ludHMubWFwKGJwID0+IGAke3RoaXMuaW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGg6IGJwfSl9ICR7YnB9d2ApO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Rml4ZWRTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSBERU5TSVRZX1NSQ1NFVF9NVUxUSVBMSUVSUy5tYXAoXG4gICAgICAgIG11bHRpcGxpZXIgPT4gYCR7dGhpcy5pbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aDogdGhpcy53aWR0aCEgKiBtdWx0aXBsaWVyfSl9ICR7XG4gICAgICAgICAgICBtdWx0aXBsaWVyfXhgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5fcmVuZGVyZWRTcmMgIT09IG51bGwgJiYgdGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxjcE9ic2VydmVyLnVucmVnaXN0ZXJJbWFnZSh0aGlzLl9yZW5kZXJlZFNyYyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuaW1nRWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5cbi8qKioqKiBIZWxwZXJzICoqKioqL1xuXG4vKipcbiAqIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gaW50ZWdlci5cbiAqL1xuZnVuY3Rpb24gaW5wdXRUb0ludGVnZXIodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gcGFyc2VJbnQodmFsdWUsIDEwKSA6IHZhbHVlO1xufVxuXG4vKipcbiAqIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gYm9vbGVhbi5cbiAqL1xuZnVuY3Rpb24gaW5wdXRUb0Jvb2xlYW4odmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgYCR7dmFsdWV9YCAhPT0gJ2ZhbHNlJztcbn1cblxuLyoqXG4gKiBTb3J0cyBwcm92aWRlZCBjb25maWcgYnJlYWtwb2ludHMgYW5kIHVzZXMgZGVmYXVsdHMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NDb25maWcoY29uZmlnOiBJbWFnZUNvbmZpZyk6IEltYWdlQ29uZmlnIHtcbiAgbGV0IHNvcnRlZEJyZWFrcG9pbnRzOiB7YnJlYWtwb2ludHM/OiBudW1iZXJbXX0gPSB7fTtcbiAgaWYgKGNvbmZpZy5icmVha3BvaW50cykge1xuICAgIHNvcnRlZEJyZWFrcG9pbnRzLmJyZWFrcG9pbnRzID0gY29uZmlnLmJyZWFrcG9pbnRzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdENvbmZpZywgY29uZmlnLCBzb3J0ZWRCcmVha3BvaW50cyk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY1xcYCBhbmQgXFxgbmdTcmNcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGBuZ1NyY1xcYC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY1xcYCBhdHRyaWJ1dGUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDU0VUX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gYm90aCBcXGBzcmNzZXRcXGAgYW5kIFxcYG5nU3Jjc2V0XFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3Jjc2V0XFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYCArXG4gICAgICAgICAgICBgXFxgbmdTcmNzZXRcXGAuIFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNzZXRcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCYXNlNjQtZW5jb2RlZCBpbWFnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKG5nU3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgbmdTcmMgPSBuZ1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYG5nU3JjXFxgIGlzIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nIGAgK1xuICAgICAgICAgICAgYCgke25nU3JjfSkuIE5nT3B0aW1pemVkSW1hZ2UgZG9lcyBub3Qgc3VwcG9ydCBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgICAgIGBieSByZW1vdmluZyBcXGBuZ1NyY1xcYCBhbmQgdXNpbmcgYSBzdGFuZGFyZCBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSAnc2l6ZXMnIG9ubHkgaW5jbHVkZXMgcmVzcG9uc2l2ZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29tcGxleFNpemVzKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgc2l6ZXMgPSBkaXIuc2l6ZXM7XG4gIGlmIChzaXplcz8ubWF0Y2goLygoXFwpfCwpXFxzfF4pXFxkK3B4LykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYHNpemVzXFxgIHdhcyBzZXQgdG8gYSBzdHJpbmcgaW5jbHVkaW5nIGAgK1xuICAgICAgICAgICAgYHBpeGVsIHZhbHVlcy4gRm9yIGF1dG9tYXRpYyBcXGBzcmNzZXRcXGAgZ2VuZXJhdGlvbiwgXFxgc2l6ZXNcXGAgbXVzdCBvbmx5IGluY2x1ZGUgcmVzcG9uc2l2ZSBgICtcbiAgICAgICAgICAgIGB2YWx1ZXMsIHN1Y2ggYXMgXFxgc2l6ZXM9XCI1MHZ3XCJcXGAgb3IgXFxgc2l6ZXM9XCIobWluLXdpZHRoOiA3NjhweCkgNTB2dywgMTAwdndcIlxcYC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIG1vZGlmeSB0aGUgXFxgc2l6ZXNcXGAgYXR0cmlidXRlLCBvciBwcm92aWRlIHlvdXIgb3duIFxcYG5nU3Jjc2V0XFxgIHZhbHVlIGRpcmVjdGx5LmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgbmdTcmMgPSBkaXIubmdTcmMudHJpbSgpO1xuICBpZiAobmdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGBuZ1NyY1xcYCB3YXMgc2V0IHRvIGEgYmxvYiBVUkwgKCR7bmdTcmN9KS4gYCArXG4gICAgICAgICAgICBgQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgbmdTcmNcXGAgYW5kIHVzaW5nIGEgcmVndWxhciBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBpbnB1dCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eUlucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICBpZiAoIWlzU3RyaW5nIHx8IGlzRW1wdHlTdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtuYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSBgICtcbiAgICAgICAgICAgIGAoXFxgJHt2YWx1ZX1cXGApLiBUbyBmaXggdGhpcywgY2hhbmdlIHRoZSB2YWx1ZSB0byBhIG5vbi1lbXB0eSBzdHJpbmcuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNzZXRgIGlzIGluIGEgdmFsaWQgZm9ybWF0LCBlLmcuIFwiMTAwdywgMjAwd1wiIG9yIFwiMXgsIDJ4XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZE5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgdmFsdWU6IHVua25vd24pIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybjtcbiAgYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXIsICduZ1NyY3NldCcsIHZhbHVlKTtcbiAgY29uc3Qgc3RyaW5nVmFsID0gdmFsdWUgYXMgc3RyaW5nO1xuICBjb25zdCBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuICBjb25zdCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IgPSBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcblxuICBpZiAoaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yKSB7XG4gICAgYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpciwgc3RyaW5nVmFsKTtcbiAgfVxuXG4gIGNvbnN0IGlzVmFsaWRTcmNzZXQgPSBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yIHx8IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcjtcbiAgaWYgKCFpc1ZhbGlkU3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke3ZhbHVlfVxcYCkuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBzdXBwbHkgXFxgbmdTcmNzZXRcXGAgdXNpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBvbmUgb3IgbW9yZSB3aWR0aCBgICtcbiAgICAgICAgICAgIGBkZXNjcmlwdG9ycyAoZS5nLiBcIjEwMHcsIDIwMHdcIikgb3IgZGVuc2l0eSBkZXNjcmlwdG9ycyAoZS5nLiBcIjF4LCAyeFwiKS5gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGNvbnN0IHVuZGVyRGVuc2l0eUNhcCA9XG4gICAgICB2YWx1ZS5zcGxpdCgnLCcpLmV2ZXJ5KG51bSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBjb250YWlucyBhbiB1bnN1cHBvcnRlZCBpbWFnZSBkZW5zaXR5OmAgK1xuICAgICAgICAgICAgYFxcYCR7dmFsdWV9XFxgLiBOZ09wdGltaXplZEltYWdlIGdlbmVyYWxseSByZWNvbW1lbmRzIGEgbWF4IGltYWdlIGRlbnNpdHkgb2YgYCArXG4gICAgICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCBidXQgc3VwcG9ydHMgaW1hZ2UgZGVuc2l0aWVzIHVwIHRvIGAgK1xuICAgICAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXguIFRoZSBodW1hbiBleWUgY2Fubm90IGRpc3Rpbmd1aXNoIGJldHdlZW4gaW1hZ2UgZGVuc2l0aWVzIGAgK1xuICAgICAgICAgICAgYGdyZWF0ZXIgdGhhbiAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IC0gd2hpY2ggbWFrZXMgdGhlbSB1bm5lY2Vzc2FyeSBmb3IgYCArXG4gICAgICAgICAgICBgbW9zdCB1c2UgY2FzZXMuIEltYWdlcyB0aGF0IHdpbGwgYmUgcGluY2gtem9vbWVkIGFyZSB0eXBpY2FsbHkgdGhlIHByaW1hcnkgdXNlIGNhc2UgZm9yIGAgK1xuICAgICAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXggaW1hZ2VzLiBQbGVhc2UgcmVtb3ZlIHRoZSBoaWdoIGRlbnNpdHkgZGVzY3JpcHRvciBhbmQgdHJ5IGFnYWluLmApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBSdW50aW1lRXJyb3JgIGluc3RhbmNlIHRvIHJlcHJlc2VudCBhIHNpdHVhdGlvbiB3aGVuIGFuIGlucHV0IGlzIHNldCBhZnRlclxuICogdGhlIGRpcmVjdGl2ZSBoYXMgaW5pdGlhbGl6ZWQuXG4gKi9cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7aW5wdXROYW1lfVxcYCB3YXMgdXBkYXRlZCBhZnRlciBpbml0aWFsaXphdGlvbi4gYCArXG4gICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS4gYCArXG4gICAgICAgICAgYFRvIGZpeCB0aGlzLCBzd2l0Y2ggXFxgJHtpbnB1dE5hbWV9XFxgIGEgc3RhdGljIHZhbHVlIG9yIHdyYXAgdGhlIGltYWdlIGVsZW1lbnQgYCArXG4gICAgICAgICAgYGluIGFuICpuZ0lmIHRoYXQgaXMgZ2F0ZWQgb24gdGhlIG5lY2Vzc2FyeSB2YWx1ZS5gKTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgdGhhdCBub25lIG9mIHRoZSBsaXN0ZWQgaW5wdXRzIGhhcyBjaGFuZ2VkLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBpbnB1dHM6IHN0cmluZ1tdKSB7XG4gIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICBjb25zdCBpc1VwZGF0ZWQgPSBjaGFuZ2VzLmhhc093blByb3BlcnR5KGlucHV0KTtcbiAgICBpZiAoaXNVcGRhdGVkICYmICFjaGFuZ2VzW2lucHV0XS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ25nU3JjJykge1xuICAgICAgICAvLyBXaGVuIHRoZSBgbmdTcmNgIGlucHV0IGNoYW5nZXMsIHdlIGRldGVjdCB0aGF0IG9ubHkgaW4gdGhlXG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlc2AgaG9vaywgdGh1cyB0aGUgYG5nU3JjYCBpcyBhbHJlYWR5IHNldC4gV2UgdXNlXG4gICAgICAgIC8vIGBuZ1NyY2AgaW4gdGhlIGVycm9yIG1lc3NhZ2UsIHNvIHdlIHVzZSBhIHByZXZpb3VzIHZhbHVlLCBidXRcbiAgICAgICAgLy8gbm90IHRoZSB1cGRhdGVkIG9uZSBpbiBpdC5cbiAgICAgICAgZGlyID0ge25nU3JjOiBjaGFuZ2VzW2lucHV0XS5wcmV2aW91c1ZhbHVlfSBhcyBOZ09wdGltaXplZEltYWdlO1xuICAgICAgfVxuICAgICAgdGhyb3cgcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpciwgaW5wdXQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0R3JlYXRlclRoYW5aZXJvKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgdmFsaWROdW1iZXIgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgJiYgaW5wdXRWYWx1ZSA+IDA7XG4gIGNvbnN0IHZhbGlkU3RyaW5nID1cbiAgICAgIHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSAmJiBwYXJzZUludChpbnB1dFZhbHVlKSA+IDA7XG4gIGlmICghdmFsaWROdW1iZXIgJiYgIXZhbGlkU3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7aW5wdXROYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSBgICtcbiAgICAgICAgICAgIGAoXFxgJHtpbnB1dFZhbHVlfVxcYCkuIFRvIGZpeCB0aGlzLCBwcm92aWRlIFxcYCR7aW5wdXROYW1lfVxcYCBgICtcbiAgICAgICAgICAgIGBhcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGlzIG5vdCB2aXN1YWxseSBkaXN0b3J0ZWQuIEVmZmVjdGl2ZWx5IHRoaXMgaXMgY2hlY2tpbmc6XG4gKiAtIFdoZXRoZXIgdGhlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHJlZmxlY3QgdGhlIGFjdHVhbCBkaW1lbnNpb25zIG9mIHRoZSBpbWFnZS5cbiAqIC0gV2hldGhlciBpbWFnZSBzdHlsaW5nIGlzIFwiY29ycmVjdFwiIChzZWUgYmVsb3cgZm9yIGEgbG9uZ2VyIGV4cGxhbmF0aW9uKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24oXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHJlbmRlcmVyOiBSZW5kZXJlcjIpIHtcbiAgY29uc3QgcmVtb3ZlTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxpc3RlbmVyRm4oKTtcbiAgICAvLyBUT0RPOiBgY2xpZW50V2lkdGhgLCBgY2xpZW50SGVpZ2h0YCwgYG5hdHVyYWxXaWR0aGAgYW5kIGBuYXR1cmFsSGVpZ2h0YFxuICAgIC8vIGFyZSB0eXBlZCBhcyBudW1iZXIsIGJ1dCB3ZSBydW4gYHBhcnNlRmxvYXRgICh3aGljaCBhY2NlcHRzIHN0cmluZ3Mgb25seSkuXG4gICAgLy8gVmVyaWZ5IHdoZXRoZXIgYHBhcnNlRmxvYXRgIGlzIG5lZWRlZCBpbiB0aGUgY2FzZXMgYmVsb3cuXG4gICAgY29uc3QgcmVuZGVyZWRXaWR0aCA9IHBhcnNlRmxvYXQoaW1nLmNsaWVudFdpZHRoIGFzIGFueSk7XG4gICAgY29uc3QgcmVuZGVyZWRIZWlnaHQgPSBwYXJzZUZsb2F0KGltZy5jbGllbnRIZWlnaHQgYXMgYW55KTtcbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBwYXJzZUZsb2F0KGltZy5uYXR1cmFsV2lkdGggYXMgYW55KTtcbiAgICBjb25zdCBpbnRyaW5zaWNIZWlnaHQgPSBwYXJzZUZsb2F0KGltZy5uYXR1cmFsSGVpZ2h0IGFzIGFueSk7XG4gICAgY29uc3QgaW50cmluc2ljQXNwZWN0UmF0aW8gPSBpbnRyaW5zaWNXaWR0aCAvIGludHJpbnNpY0hlaWdodDtcblxuICAgIGNvbnN0IHN1cHBsaWVkV2lkdGggPSBkaXIud2lkdGghO1xuICAgIGNvbnN0IHN1cHBsaWVkSGVpZ2h0ID0gZGlyLmhlaWdodCE7XG4gICAgY29uc3Qgc3VwcGxpZWRBc3BlY3RSYXRpbyA9IHN1cHBsaWVkV2lkdGggLyBzdXBwbGllZEhlaWdodDtcblxuICAgIC8vIFRvbGVyYW5jZSBpcyB1c2VkIHRvIGFjY291bnQgZm9yIHRoZSBpbXBhY3Qgb2Ygc3VicGl4ZWwgcmVuZGVyaW5nLlxuICAgIC8vIER1ZSB0byBzdWJwaXhlbCByZW5kZXJpbmcsIHRoZSByZW5kZXJlZCwgaW50cmluc2ljLCBhbmQgc3VwcGxpZWRcbiAgICAvLyBhc3BlY3QgcmF0aW9zIG9mIGEgY29ycmVjdGx5IGNvbmZpZ3VyZWQgaW1hZ2UgbWF5IG5vdCBleGFjdGx5IG1hdGNoLlxuICAgIC8vIEZvciBleGFtcGxlLCBhIGB3aWR0aD00MDMwIGhlaWdodD0zMDIwYCBpbWFnZSBtaWdodCBoYXZlIGEgcmVuZGVyZWRcbiAgICAvLyBzaXplIG9mIFwiMTA2MncsIDc5Ni40OGhcIi4gKEFuIGFzcGVjdCByYXRpbyBvZiAxLjMzNC4uLiB2cy4gMS4zMzMuLi4pXG4gICAgY29uc3QgaW5hY2N1cmF0ZURpbWVuc2lvbnMgPVxuICAgICAgICBNYXRoLmFicyhzdXBwbGllZEFzcGVjdFJhdGlvIC0gaW50cmluc2ljQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcbiAgICBjb25zdCBzdHlsaW5nRGlzdG9ydGlvbiA9IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgJiZcbiAgICAgICAgTWF0aC5hYnMoaW50cmluc2ljQXNwZWN0UmF0aW8gLSByZW5kZXJlZEFzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG5cbiAgICBpZiAoaW5hY2N1cmF0ZURpbWVuc2lvbnMpIHtcbiAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgaW1hZ2UgZG9lcyBub3QgbWF0Y2ggYCArXG4gICAgICAgICAgICAgIGB0aGUgYXNwZWN0IHJhdGlvIGluZGljYXRlZCBieSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLiBgICtcbiAgICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtpbnRyaW5zaWNBc3BlY3RSYXRpb30pLiBcXG5TdXBwbGllZCB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXM6IGAgK1xuICAgICAgICAgICAgICBgJHtzdXBwbGllZFdpZHRofXcgeCAke3N1cHBsaWVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtzdXBwbGllZEFzcGVjdFJhdGlvfSkuIGAgK1xuICAgICAgICAgICAgICBgXFxuVG8gZml4IHRoaXMsIHVwZGF0ZSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLmApKTtcbiAgICB9IGVsc2UgaWYgKHN0eWxpbmdEaXN0b3J0aW9uKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIHJlbmRlcmVkIGltYWdlIGAgK1xuICAgICAgICAgICAgICBgZG9lcyBub3QgbWF0Y2ggdGhlIGltYWdlJ3MgaW50cmluc2ljIGFzcGVjdCByYXRpby4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7aW50cmluc2ljQXNwZWN0UmF0aW99KS4gXFxuUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogYCArXG4gICAgICAgICAgICAgIGAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiBgICtcbiAgICAgICAgICAgICAgYCR7cmVuZGVyZWRBc3BlY3RSYXRpb30pLiBcXG5UaGlzIGlzc3VlIGNhbiBvY2N1ciBpZiBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYCArXG4gICAgICAgICAgICAgIGBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhbiBpbWFnZSB3aXRob3V0IHVwZGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nIGAgK1xuICAgICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgICAgYGFkZGluZyBcImhlaWdodDogYXV0b1wiIG9yIFwid2lkdGg6IGF1dG9cIiB0byB0aGUgaW1hZ2Ugc3R5bGluZyB3aWxsIGZpeCBgICtcbiAgICAgICAgICAgICAgYHRoaXMgaXNzdWUuYCkpO1xuICAgIH0gZWxzZSBpZiAoIWRpci5uZ1NyY3NldCAmJiBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zKSB7XG4gICAgICAvLyBJZiBgbmdTcmNzZXRgIGhhc24ndCBiZWVuIHNldCwgc2FuaXR5IGNoZWNrIHRoZSBpbnRyaW5zaWMgc2l6ZS5cbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZFdpZHRoO1xuICAgICAgY29uc3QgcmVjb21tZW5kZWRIZWlnaHQgPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZEhlaWdodDtcbiAgICAgIGNvbnN0IG92ZXJzaXplZFdpZHRoID0gKGludHJpbnNpY1dpZHRoIC0gcmVjb21tZW5kZWRXaWR0aCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGNvbnN0IG92ZXJzaXplZEhlaWdodCA9IChpbnRyaW5zaWNIZWlnaHQgLSByZWNvbW1lbmRlZEhlaWdodCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGlmIChvdmVyc2l6ZWRXaWR0aCB8fCBvdmVyc2l6ZWRIZWlnaHQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX0lNQUdFLFxuICAgICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaW50cmluc2ljIGltYWdlIGlzIHNpZ25pZmljYW50bHkgYCArXG4gICAgICAgICAgICAgICAgYGxhcmdlciB0aGFuIG5lY2Vzc2FyeS4gYCArXG4gICAgICAgICAgICAgICAgYFxcblJlbmRlcmVkIGltYWdlIHNpemU6ICR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtyZWNvbW1lbmRlZFdpZHRofXcgeCAke1xuICAgICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuTm90ZTogUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemUgaXMgY2FsY3VsYXRlZCBhc3N1bWluZyBhIG1heGltdW0gRFBSIG9mIGAgK1xuICAgICAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH0uIFRvIGltcHJvdmUgbG9hZGluZyB0aW1lLCByZXNpemUgdGhlIGltYWdlIGAgK1xuICAgICAgICAgICAgICAgIGBvciBjb25zaWRlciB1c2luZyB0aGUgXCJuZ1NyY3NldFwiIGFuZCBcInNpemVzXCIgYXR0cmlidXRlcy5gKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG1pc3NpbmdBdHRyaWJ1dGVzID0gW107XG4gIGlmIChkaXIud2lkdGggPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnd2lkdGgnKTtcbiAgaWYgKGRpci5oZWlnaHQgPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnaGVpZ2h0Jyk7XG4gIGlmIChtaXNzaW5nQXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZXNlIHJlcXVpcmVkIGF0dHJpYnV0ZXMgYCArXG4gICAgICAgICAgICBgYXJlIG1pc3Npbmc6ICR7bWlzc2luZ0F0dHJpYnV0ZXMubWFwKGF0dHIgPT4gYFwiJHthdHRyfVwiYCkuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgICAgYEluY2x1ZGluZyBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyB3aWxsIHByZXZlbnQgaW1hZ2UtcmVsYXRlZCBsYXlvdXQgc2hpZnRzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgaW5jbHVkZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyBvbiB0aGUgaW1hZ2UgdGFnLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYGxvYWRpbmdgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSB2YWxpZCBpbnB1dCAmXG4gKiBpcyBub3QgdXNlZCBvbiBwcmlvcml0eSBpbWFnZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLmxvYWRpbmcgJiYgZGlyLnByaW9yaXR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBgICtcbiAgICAgICAgICAgIGBTZXR0aW5nIFxcYGxvYWRpbmdcXGAgb24gcHJpb3JpdHkgaW1hZ2VzIGlzIG5vdCBhbGxvd2VkIGAgK1xuICAgICAgICAgICAgYGJlY2F1c2UgdGhlc2UgaW1hZ2VzIHdpbGwgYWx3YXlzIGJlIGVhZ2VybHkgbG9hZGVkLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcmVtb3ZlIHRoZSDigJxsb2FkaW5n4oCdIGF0dHJpYnV0ZSBmcm9tIHRoZSBwcmlvcml0eSBpbWFnZS5gKTtcbiAgfVxuICBjb25zdCB2YWxpZElucHV0cyA9IFsnYXV0bycsICdlYWdlcicsICdsYXp5J107XG4gIGlmICh0eXBlb2YgZGlyLmxvYWRpbmcgPT09ICdzdHJpbmcnICYmICF2YWxpZElucHV0cy5pbmNsdWRlcyhkaXIubG9hZGluZykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke2Rpci5sb2FkaW5nfVxcYCkuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgdmFsaWQgdmFsdWUgKFwibGF6eVwiLCBcImVhZ2VyXCIsIG9yIFwiYXV0b1wiKS5gKTtcbiAgfVxufVxuIl19