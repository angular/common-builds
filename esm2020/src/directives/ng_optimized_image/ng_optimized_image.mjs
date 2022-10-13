/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, inject, InjectionToken, Injector, Input, NgZone, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
import { isPlatformServer } from '../../platform_id';
import { imgDirectiveDetails } from './error_helper';
import { IMAGE_LOADER } from './image_loaders/image_loader';
import { LCPImageObserver } from './lcp_image_observer';
import { PreconnectLinkChecker } from './preconnect_link_checker';
import { PreloadLinkCreator } from './preload-link-creator';
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
        this.isServer = isPlatformServer(inject(PLATFORM_ID));
        this.preloadLinkChecker = inject(PreloadLinkCreator);
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
        this._fill = false;
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
    /**
     * Sets the image to "fill mode," which eliminates the height/width requirement and adds
     * styles such that the image fills its containing element.
     */
    set fill(value) {
        this._fill = inputToBoolean(value);
    }
    get fill() {
        return this._fill;
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
            if (this.fill) {
                assertEmptyWidthAndHeight(this);
            }
            else {
                assertNonEmptyWidthAndHeight(this);
            }
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
        if (this.fill) {
            if (!this.sizes) {
                this.sizes = '100vw';
            }
        }
        else {
            this.setHostAttribute('width', this.width.toString());
            this.setHostAttribute('height', this.height.toString());
        }
        this.setHostAttribute('loading', this.getLoadingBehavior());
        this.setHostAttribute('fetchpriority', this.getFetchPriority());
        // The `src` and `srcset` attributes should be set last since other attributes
        // could affect the image's loading behavior.
        const rewrittenSrc = this.getRewrittenSrc();
        this.setHostAttribute('src', rewrittenSrc);
        let rewrittenSrcset = undefined;
        if (this.sizes) {
            this.setHostAttribute('sizes', this.sizes);
        }
        if (this.ngSrcset) {
            rewrittenSrcset = this.getRewrittenSrcset();
        }
        else if (!this._disableOptimizedSrcset && !this.srcset) {
            rewrittenSrcset = this.getAutomaticSrcset();
        }
        if (rewrittenSrcset) {
            this.setHostAttribute('srcset', rewrittenSrcset);
        }
        if (this.isServer && this.priority) {
            this.preloadLinkChecker.createPreloadLinkTag(this.renderer, rewrittenSrc, rewrittenSrcset, this.sizes);
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.0-next.6+sha-0457b58", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.0.0-next.6+sha-0457b58", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc],img[rawSrc]", inputs: { rawSrc: "rawSrc", ngSrc: "ngSrc", ngSrcset: "ngSrcset", sizes: "sizes", width: "width", height: "height", loading: "loading", priority: "priority", disableOptimizedSrcset: "disableOptimizedSrcset", fill: "fill", src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0px\" : null" } }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.0-next.6+sha-0457b58", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[ngSrc],img[rawSrc]',
                    host: {
                        '[style.position]': 'fill ? "absolute" : null',
                        '[style.width]': 'fill ? "100%" : null',
                        '[style.height]': 'fill ? "100%" : null',
                        '[style.inset]': 'fill ? "0px" : null'
                    }
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
            }], fill: [{
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
 * Verifies that width and height are not set. Used in fill mode, where those attributes don't make
 * sense.
 */
function assertEmptyWidthAndHeight(dir) {
    if (dir.width || dir.height) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the attributes \`height\` and/or \`width\` are present ` +
            `along with the \`fill\` attribute. Because \`fill\` mode causes an image to fill its containing ` +
            `element, the size attributes have no effect and should be removed.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBZ0MsV0FBVyxFQUFFLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdwUCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDMUQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7O0FBRTFEOzs7Ozs7R0FNRztBQUNILE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sNkJBQTZCLEdBQUcsMkJBQTJCLENBQUM7QUFFbEU7OztHQUdHO0FBQ0gsTUFBTSwrQkFBK0IsR0FBRyxtQ0FBbUMsQ0FBQztBQUU1RTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxDQUFDO0FBRTdDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixHQUFHLENBQUMsQ0FBQztBQUVo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c0VBQXNFLENBQUMsQ0FBQztLQUNqRjtJQUNELE1BQU0sV0FBVyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QyxJQUFJLE9BQU8sR0FBRyxDQUFDLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN6RSxNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDZCQUE2QjtZQUMxRCwyQkFBMkIsR0FBRyxDQUFDLE9BQU8sT0FBTztZQUM3QyxrRUFBa0UsQ0FBQyxDQUFDO0tBQzdFO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgaW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgSW5qZWN0b3IsIElucHV0LCBOZ1pvbmUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFBMQVRGT1JNX0lELCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXMsIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICcuLi8uLi9wbGF0Zm9ybV9pZCc7XG5cbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtJTUFHRV9MT0FERVJ9IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZV9sb2FkZXInO1xuaW1wb3J0IHtMQ1BJbWFnZU9ic2VydmVyfSBmcm9tICcuL2xjcF9pbWFnZV9vYnNlcnZlcic7XG5pbXBvcnQge1ByZWNvbm5lY3RMaW5rQ2hlY2tlcn0gZnJvbSAnLi9wcmVjb25uZWN0X2xpbmtfY2hlY2tlcic7XG5pbXBvcnQge1ByZWxvYWRMaW5rQ3JlYXRvcn0gZnJvbSAnLi9wcmVsb2FkLWxpbmstY3JlYXRvcic7XG5cbi8qKlxuICogV2hlbiBhIEJhc2U2NC1lbmNvZGVkIGltYWdlIGlzIHBhc3NlZCBhcyBhbiBpbnB1dCB0byB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSxcbiAqIGFuIGVycm9yIGlzIHRocm93bi4gVGhlIGltYWdlIGNvbnRlbnQgKGFzIGEgc3RyaW5nKSBtaWdodCBiZSB2ZXJ5IGxvbmcsIHRodXMgbWFraW5nXG4gKiBpdCBoYXJkIHRvIHJlYWQgYW4gZXJyb3IgbWVzc2FnZSBpZiB0aGUgZW50aXJlIHN0cmluZyBpcyBpbmNsdWRlZC4gVGhpcyBjb25zdCBkZWZpbmVzXG4gKiB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW50byB0aGUgZXJyb3IgbWVzc2FnZS4gVGhlIHJlc3RcbiAqIG9mIHRoZSBjb250ZW50IGlzIHRydW5jYXRlZC5cbiAqL1xuY29uc3QgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SID0gNTA7XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyB3aWR0aCBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxMDB3LCAyMDB3XCIuXG4gKi9cbmNvbnN0IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrd1xccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxeCwgMngsIDUweFwiLiBBbHNvIHN1cHBvcnRzIGRlY2ltYWxzIGxpa2UgXCIxLjV4LCAxLjUweFwiLlxuICovXG5jb25zdCBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrKFxcLlxcZCspP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgaW4gZ2VuZXJhdGluZyBhdXRvbWF0aWMgZGVuc2l0eS1iYXNlZCBzcmNzZXRzXG4gKi9cbmNvbnN0IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTID0gWzEsIDJdO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGJyZWFrcG9pbnRzIHRvIHVzZSBvbiBmdWxsLXdpZHRoIGltYWdlc1xuICovXG5jb25zdCBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRiA9IDY0MDtcbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYXNwZWN0IHJhdGlvcyBhcmUgc2ltaWxhciBpbiB2YWx1ZS5cbiAqL1xuY29uc3QgQVNQRUNUX1JBVElPX1RPTEVSQU5DRSA9IC4xO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGltYWdlIGhhcyBiZWVuIHJlcXVlc3RlZCBhdCBhbiBvdmVybHlcbiAqIGxhcmdlIHNpemUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCByZW5kZXJlZCBpbWFnZSBzaXplIChhZnRlciB0YWtpbmdcbiAqIGludG8gYWNjb3VudCBhIHR5cGljYWwgZGV2aWNlIHBpeGVsIHJhdGlvKS4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTAwMDtcblxuLyoqXG4gKiBBIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGZvciB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIENvbnRhaW5zOlxuICogLSBicmVha3BvaW50czogQW4gYXJyYXkgb2YgaW50ZWdlciBicmVha3BvaW50cyB1c2VkIHRvIGdlbmVyYXRlXG4gKiAgICAgIHNyY3NldHMgZm9yIHJlc3BvbnNpdmUgaW1hZ2VzLlxuICpcbiAqIExlYXJuIG1vcmUgYWJvdXQgdGhlIHJlc3BvbnNpdmUgaW1hZ2UgY29uZmlndXJhdGlvbiBpbiBbdGhlIE5nT3B0aW1pemVkSW1hZ2VcbiAqIGd1aWRlXShndWlkZS9pbWFnZS1kaXJlY3RpdmUpLlxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuZXhwb3J0IHR5cGUgSW1hZ2VDb25maWcgPSB7XG4gIGJyZWFrcG9pbnRzPzogbnVtYmVyW11cbn07XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IEltYWdlQ29uZmlnID0ge1xuICBicmVha3BvaW50czogWzE2LCAzMiwgNDgsIDY0LCA5NiwgMTI4LCAyNTYsIDM4NCwgNjQwLCA3NTAsIDgyOCwgMTA4MCwgMTIwMCwgMTkyMCwgMjA0OCwgMzg0MF0sXG59O1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNvbmZpZ3VyZXMgdGhlIGltYWdlIG9wdGltaXplZCBpbWFnZSBmdW5jdGlvbmFsaXR5LlxuICpcbiAqIEBzZWUgYE5nT3B0aW1pemVkSW1hZ2VgXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5leHBvcnQgY29uc3QgSU1BR0VfQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuPEltYWdlQ29uZmlnPihcbiAgICAnSW1hZ2VDb25maWcnLCB7cHJvdmlkZWRJbjogJ3Jvb3QnLCBmYWN0b3J5OiAoKSA9PiBkZWZhdWx0Q29uZmlnfSk7XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgaW1wcm92ZXMgaW1hZ2UgbG9hZGluZyBwZXJmb3JtYW5jZSBieSBlbmZvcmNpbmcgYmVzdCBwcmFjdGljZXMuXG4gKlxuICogYE5nT3B0aW1pemVkSW1hZ2VgIGVuc3VyZXMgdGhhdCB0aGUgbG9hZGluZyBvZiB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGltYWdlIGlzXG4gKiBwcmlvcml0aXplZCBieTpcbiAqIC0gQXV0b21hdGljYWxseSBzZXR0aW5nIHRoZSBgZmV0Y2hwcmlvcml0eWAgYXR0cmlidXRlIG9uIHRoZSBgPGltZz5gIHRhZ1xuICogLSBMYXp5IGxvYWRpbmcgbm9uLXByaW9yaXR5IGltYWdlcyBieSBkZWZhdWx0XG4gKiAtIEFzc2VydGluZyB0aGF0IHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyBwcmVjb25uZWN0IGxpbmsgdGFnIGluIHRoZSBkb2N1bWVudCBoZWFkXG4gKlxuICogSW4gYWRkaXRpb24sIHRoZSBkaXJlY3RpdmU6XG4gKiAtIEdlbmVyYXRlcyBhcHByb3ByaWF0ZSBhc3NldCBVUkxzIGlmIGEgY29ycmVzcG9uZGluZyBgSW1hZ2VMb2FkZXJgIGZ1bmN0aW9uIGlzIHByb3ZpZGVkXG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVzIGEgc3Jjc2V0XG4gKiAtIFJlcXVpcmVzIHRoYXQgYHdpZHRoYCBhbmQgYGhlaWdodGAgYXJlIHNldFxuICogLSBXYXJucyBpZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGhhdmUgYmVlbiBzZXQgaW5jb3JyZWN0bHlcbiAqIC0gV2FybnMgaWYgdGhlIGltYWdlIHdpbGwgYmUgdmlzdWFsbHkgZGlzdG9ydGVkIHdoZW4gcmVuZGVyZWRcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgaXMgbWFya2VkIGFzIFtzdGFuZGFsb25lXShndWlkZS9zdGFuZGFsb25lLWNvbXBvbmVudHMpIGFuZCBjYW5cbiAqIGJlIGltcG9ydGVkIGRpcmVjdGx5LlxuICpcbiAqIEZvbGxvdyB0aGUgc3RlcHMgYmVsb3cgdG8gZW5hYmxlIGFuZCB1c2UgdGhlIGRpcmVjdGl2ZTpcbiAqIDEuIEltcG9ydCBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGUgb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudC5cbiAqIDIuIE9wdGlvbmFsbHkgcHJvdmlkZSBhbiBgSW1hZ2VMb2FkZXJgIGlmIHlvdSB1c2UgYW4gaW1hZ2UgaG9zdGluZyBzZXJ2aWNlLlxuICogMy4gVXBkYXRlIHRoZSBuZWNlc3NhcnkgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyBhbmQgcmVwbGFjZSBgc3JjYCBhdHRyaWJ1dGVzIHdpdGggYG5nU3JjYC5cbiAqIFVzaW5nIGEgYG5nU3JjYCBhbGxvd3MgdGhlIGRpcmVjdGl2ZSB0byBjb250cm9sIHdoZW4gdGhlIGBzcmNgIGdldHMgc2V0LCB3aGljaCB0cmlnZ2VycyBhbiBpbWFnZVxuICogZG93bmxvYWQuXG4gKlxuICogU3RlcCAxOiBpbXBvcnQgdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgTmdPcHRpbWl6ZWRJbWFnZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gSW5jbHVkZSBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGVcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBBcHBNb2R1bGUge31cbiAqXG4gKiAvLyAuLi4gb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudFxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWVcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIE15U3RhbmRhbG9uZUNvbXBvbmVudCB7fVxuICogYGBgXG4gKlxuICogU3RlcCAyOiBjb25maWd1cmUgYSBsb2FkZXIuXG4gKlxuICogVG8gdXNlIHRoZSAqKmRlZmF1bHQgbG9hZGVyKio6IG5vIGFkZGl0aW9uYWwgY29kZSBjaGFuZ2VzIGFyZSBuZWNlc3NhcnkuIFRoZSBVUkwgcmV0dXJuZWQgYnkgdGhlXG4gKiBnZW5lcmljIGxvYWRlciB3aWxsIGFsd2F5cyBtYXRjaCB0aGUgdmFsdWUgb2YgXCJzcmNcIi4gSW4gb3RoZXIgd29yZHMsIHRoaXMgbG9hZGVyIGFwcGxpZXMgbm9cbiAqIHRyYW5zZm9ybWF0aW9ucyB0byB0aGUgcmVzb3VyY2UgVVJMIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGBuZ1NyY2AgYXR0cmlidXRlIHdpbGwgYmUgdXNlZCBhcyBpcy5cbiAqXG4gKiBUbyB1c2UgYW4gZXhpc3RpbmcgbG9hZGVyIGZvciBhICoqdGhpcmQtcGFydHkgaW1hZ2Ugc2VydmljZSoqOiBhZGQgdGhlIHByb3ZpZGVyIGZhY3RvcnkgZm9yIHlvdXJcbiAqIGNob3NlbiBzZXJ2aWNlIHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheS4gSW4gdGhlIGV4YW1wbGUgYmVsb3csIHRoZSBJbWdpeCBsb2FkZXIgaXMgdXNlZDpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3Byb3ZpZGVJbWdpeExvYWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDYWxsIHRoZSBmdW5jdGlvbiBhbmQgYWRkIHRoZSByZXN1bHQgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5OlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHByb3ZpZGVJbWdpeExvYWRlcihcImh0dHBzOi8vbXkuYmFzZS51cmwvXCIpLFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIHByb3ZpZGVzIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICogLSBgcHJvdmlkZUNsb3VkZmxhcmVMb2FkZXJgXG4gKiAtIGBwcm92aWRlQ2xvdWRpbmFyeUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWFnZUtpdExvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWdpeExvYWRlcmBcbiAqXG4gKiBJZiB5b3UgdXNlIGEgZGlmZmVyZW50IGltYWdlIHByb3ZpZGVyLCB5b3UgY2FuIGNyZWF0ZSBhIGN1c3RvbSBsb2FkZXIgZnVuY3Rpb24gYXMgZGVzY3JpYmVkXG4gKiBiZWxvdy5cbiAqXG4gKiBUbyB1c2UgYSAqKmN1c3RvbSBsb2FkZXIqKjogcHJvdmlkZSB5b3VyIGxvYWRlciBmdW5jdGlvbiBhcyBhIHZhbHVlIGZvciB0aGUgYElNQUdFX0xPQURFUmAgRElcbiAqIHRva2VuLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDb25maWd1cmUgdGhlIGxvYWRlciB1c2luZyB0aGUgYElNQUdFX0xPQURFUmAgdG9rZW4uXG4gKiBwcm92aWRlcnM6IFtcbiAqICAge1xuICogICAgICBwcm92aWRlOiBJTUFHRV9MT0FERVIsXG4gKiAgICAgIHVzZVZhbHVlOiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICogICAgICAgIHJldHVybiBgaHR0cHM6Ly9leGFtcGxlLmNvbS8ke2NvbmZpZy5zcmN9LSR7Y29uZmlnLndpZHRofS5qcGd9YDtcbiAqICAgICAgfVxuICogICB9LFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFN0ZXAgMzogdXBkYXRlIGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgdG8gdXNlIGBuZ1NyY2AgaW5zdGVhZCBvZiBgc3JjYC5cbiAqXG4gKiBgYGBcbiAqIDxpbWcgbmdTcmM9XCJsb2dvLnBuZ1wiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMTAwXCI+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbWdbbmdTcmNdLGltZ1tyYXdTcmNdJyxcbiAgaG9zdDoge1xuICAgICdbc3R5bGUucG9zaXRpb25dJzogJ2ZpbGwgPyBcImFic29sdXRlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLndpZHRoXSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmhlaWdodF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5pbnNldF0nOiAnZmlsbCA/IFwiMHB4XCIgOiBudWxsJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2UgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBpbWFnZUxvYWRlciA9IGluamVjdChJTUFHRV9MT0FERVIpO1xuICBwcml2YXRlIGNvbmZpZzogSW1hZ2VDb25maWcgPSBwcm9jZXNzQ29uZmlnKGluamVjdChJTUFHRV9DT05GSUcpKTtcbiAgcHJpdmF0ZSByZW5kZXJlciA9IGluamVjdChSZW5kZXJlcjIpO1xuICBwcml2YXRlIGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcbiAgcHJpdmF0ZSBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHByaXZhdGUgcmVhZG9ubHkgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdChQTEFURk9STV9JRCkpO1xuICBwcml2YXRlIHJlYWRvbmx5IHByZWxvYWRMaW5rQ2hlY2tlciA9IGluamVjdChQcmVsb2FkTGlua0NyZWF0b3IpO1xuXG4gIC8vIGEgTENQIGltYWdlIG9ic2VydmVyIC0gc2hvdWxkIGJlIGluamVjdGVkIG9ubHkgaW4gdGhlIGRldiBtb2RlXG4gIHByaXZhdGUgbGNwT2JzZXJ2ZXIgPSBuZ0Rldk1vZGUgPyB0aGlzLmluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKSA6IG51bGw7XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgcmV3cml0dGVuIGBzcmNgIG9uY2UgYW5kIHN0b3JlIGl0LlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCByZXBldGl0aXZlIGNhbGN1bGF0aW9ucyBhbmQgbWFrZSBzdXJlIHRoZSBkaXJlY3RpdmUgY2xlYW51cCBpbiB0aGVcbiAgICogYG5nT25EZXN0cm95YCBkb2VzIG5vdCByZWx5IG9uIHRoZSBgSU1BR0VfTE9BREVSYCBsb2dpYyAod2hpY2ggaW4gdHVybiBjYW4gcmVseSBvbiBzb21lIG90aGVyXG4gICAqIGluc3RhbmNlIHRoYXQgbWlnaHQgYmUgYWxyZWFkeSBkZXN0cm95ZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyZWRTcmM6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogUHJldmlvdXNseSwgdGhlIGByYXdTcmNgIGF0dHJpYnV0ZSB3YXMgdXNlZCB0byBhY3RpdmF0ZSB0aGUgZGlyZWN0aXZlLlxuICAgKiBUaGUgYXR0cmlidXRlIHdhcyByZW5hbWVkIHRvIGBuZ1NyY2AgYW5kIHRoaXMgaW5wdXQganVzdCBwcm9kdWNlcyBhbiBlcnJvcixcbiAgICogc3VnZ2VzdGluZyB0byBzd2l0Y2ggdG8gYG5nU3JjYCBpbnN0ZWFkLlxuICAgKlxuICAgKiBUaGlzIGVycm9yIHNob3VsZCBiZSByZW1vdmVkIGluIHYxNS5cbiAgICpcbiAgICogQG5vZG9jXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgbmdTcmNgIGluc3RlYWQuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgcmF3U3JjKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKHZhbHVlLCBmYWxzZSl9IHRoZSBcXGByYXdTcmNcXGAgYXR0cmlidXRlIHdhcyB1c2VkIGAgK1xuICAgICAgICAgICAgICBgdG8gYWN0aXZhdGUgdGhlIGRpcmVjdGl2ZS4gTmV3ZXIgdmVyc2lvbiBvZiB0aGUgZGlyZWN0aXZlIHVzZXMgdGhlIFxcYG5nU3JjXFxgIGAgK1xuICAgICAgICAgICAgICBgYXR0cmlidXRlIGluc3RlYWQuIFBsZWFzZSByZXBsYWNlIFxcYHJhd1NyY1xcYCB3aXRoIFxcYG5nU3JjXFxgIGFuZCBgICtcbiAgICAgICAgICAgICAgYFxcYHJhd1NyY3NldFxcYCB3aXRoIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZXMgaW4gdGhlIHRlbXBsYXRlIHRvIGAgK1xuICAgICAgICAgICAgICBgZW5hYmxlIGltYWdlIG9wdGltaXphdGlvbnMuYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIHNvdXJjZSBpbWFnZS5cbiAgICogSW1hZ2UgbmFtZSB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGFuZCB0aGUgZmluYWwgVVJMIHdpbGwgYmUgYXBwbGllZCBhcyB0aGUgYHNyY2BcbiAgICogcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKi9cbiAgQElucHV0KCkgbmdTcmMhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAgICogVGhlIGltYWdlIG5hbWUgd2lsbCBiZSB0YWtlbiBmcm9tIGBuZ1NyY2AgYW5kIGNvbWJpbmVkIHdpdGggdGhlIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eVxuICAgKiBkZXNjcmlwdG9ycyB0byBnZW5lcmF0ZSB0aGUgZmluYWwgYHNyY3NldGAgcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPGltZyBuZ1NyYz1cImhlbGxvLmpwZ1wiIG5nU3Jjc2V0PVwiMTAwdywgMjAwd1wiIC8+ICA9PlxuICAgKiA8aW1nIHNyYz1cInBhdGgvaGVsbG8uanBnXCIgc3Jjc2V0PVwicGF0aC9oZWxsby5qcGc/dz0xMDAgMTAwdywgcGF0aC9oZWxsby5qcGc/dz0yMDAgMjAwd1wiIC8+XG4gICAqIGBgYFxuICAgKi9cbiAgQElucHV0KCkgbmdTcmNzZXQhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBiYXNlIGBzaXplc2AgYXR0cmlidXRlIHBhc3NlZCB0aHJvdWdoIHRvIHRoZSBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFByb3ZpZGluZyBzaXplcyBjYXVzZXMgdGhlIGltYWdlIHRvIGNyZWF0ZSBhbiBhdXRvbWF0aWMgcmVzcG9uc2l2ZSBzcmNzZXQuXG4gICAqL1xuICBASW5wdXQoKSBzaXplcz86IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHdpZHRoKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cbiAgcHJpdmF0ZSBfd2lkdGg/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRyaW5zaWMgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgaGVpZ2h0KHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdmFsdWUsICdoZWlnaHQnKTtcbiAgICB0aGlzLl9oZWlnaHQgPSBpbnB1dFRvSW50ZWdlcih2YWx1ZSk7XG4gIH1cbiAgZ2V0IGhlaWdodCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG4gIHByaXZhdGUgX2hlaWdodD86IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGRlc2lyZWQgbG9hZGluZyBiZWhhdmlvciAobGF6eSwgZWFnZXIsIG9yIGF1dG8pLlxuICAgKlxuICAgKiBTZXR0aW5nIGltYWdlcyBhcyBsb2FkaW5nPSdlYWdlcicgb3IgbG9hZGluZz0nYXV0bycgbWFya3MgdGhlbVxuICAgKiBhcyBub24tcHJpb3JpdHkgaW1hZ2VzLiBBdm9pZCBjaGFuZ2luZyB0aGlzIGlucHV0IGZvciBwcmlvcml0eSBpbWFnZXMuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkaW5nPzogJ2xhenknfCdlYWdlcid8J2F1dG8nO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBwcmlvcml0eSh2YWx1ZTogc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fcHJpb3JpdHkgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IHByaW9yaXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcmlvcml0eTtcbiAgfVxuICBwcml2YXRlIF9wcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gZm9yIHRoaXMgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgZGlzYWJsZU9wdGltaXplZFNyY3NldCh2YWx1ZTogc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fZGlzYWJsZU9wdGltaXplZFNyY3NldCA9IGlucHV0VG9Cb29sZWFuKHZhbHVlKTtcbiAgfVxuICBnZXQgZGlzYWJsZU9wdGltaXplZFNyY3NldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZU9wdGltaXplZFNyY3NldDtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlT3B0aW1pemVkU3Jjc2V0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGltYWdlIHRvIFwiZmlsbCBtb2RlLFwiIHdoaWNoIGVsaW1pbmF0ZXMgdGhlIGhlaWdodC93aWR0aCByZXF1aXJlbWVudCBhbmQgYWRkc1xuICAgKiBzdHlsZXMgc3VjaCB0aGF0IHRoZSBpbWFnZSBmaWxscyBpdHMgY29udGFpbmluZyBlbGVtZW50LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGZpbGwodmFsdWU6IHN0cmluZ3xib29sZWFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX2ZpbGwgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IGZpbGwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGw7XG4gIH1cbiAgcHJpdmF0ZSBfZmlsbCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY2AgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3JjYCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3Jjc2V0YCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vbkVtcHR5SW5wdXQodGhpcywgJ25nU3JjJywgdGhpcy5uZ1NyYyk7XG4gICAgICBhc3NlcnRWYWxpZE5nU3Jjc2V0KHRoaXMsIHRoaXMubmdTcmNzZXQpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyh0aGlzKTtcbiAgICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQodGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVcmwodGhpcyk7XG4gICAgICBpZiAodGhpcy5maWxsKSB7XG4gICAgICAgIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQodGhpcyk7XG4gICAgICBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbih0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpO1xuICAgICAgaWYgKCF0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29tcGxleFNpemVzKHRoaXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuYXNzZXJ0UHJlY29ubmVjdCh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE1vbml0b3Igd2hldGhlciBhbiBpbWFnZSBpcyBhbiBMQ1AgZWxlbWVudCBvbmx5IGluIGNhc2VcbiAgICAgICAgLy8gdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGlzIG1pc3NpbmcuIE90aGVyd2lzZSwgYW4gaW1hZ2VcbiAgICAgICAgLy8gaGFzIHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgYW5kIG5vIGV4dHJhIGNoZWNrcyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sY3BPYnNlcnZlciEucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGVzKCk7XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGVzKCkge1xuICAgIC8vIE11c3Qgc2V0IHdpZHRoL2hlaWdodCBleHBsaWNpdGx5IGluIGNhc2UgdGhleSBhcmUgYm91bmQgKGluIHdoaWNoIGNhc2UgdGhleSB3aWxsXG4gICAgLy8gb25seSBiZSByZWZsZWN0ZWQgYW5kIG5vdCBmb3VuZCBieSB0aGUgYnJvd3NlcilcbiAgICBpZiAodGhpcy5maWxsKSB7XG4gICAgICBpZiAoIXRoaXMuc2l6ZXMpIHtcbiAgICAgICAgdGhpcy5zaXplcyA9ICcxMDB2dyc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoIS50b1N0cmluZygpKTtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQhLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbG9hZGluZycsIHRoaXMuZ2V0TG9hZGluZ0JlaGF2aW9yKCkpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnZmV0Y2hwcmlvcml0eScsIHRoaXMuZ2V0RmV0Y2hQcmlvcml0eSgpKTtcbiAgICAvLyBUaGUgYHNyY2AgYW5kIGBzcmNzZXRgIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIHNldCBsYXN0IHNpbmNlIG90aGVyIGF0dHJpYnV0ZXNcbiAgICAvLyBjb3VsZCBhZmZlY3QgdGhlIGltYWdlJ3MgbG9hZGluZyBiZWhhdmlvci5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmMgPSB0aGlzLmdldFJld3JpdHRlblNyYygpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgcmV3cml0dGVuU3JjKTtcblxuICAgIGxldCByZXdyaXR0ZW5TcmNzZXQ6IHN0cmluZ3x1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzaXplcycsIHRoaXMuc2l6ZXMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldFJld3JpdHRlblNyY3NldCgpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2Rpc2FibGVPcHRpbWl6ZWRTcmNzZXQgJiYgIXRoaXMuc3Jjc2V0KSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldEF1dG9tYXRpY1NyY3NldCgpO1xuICAgIH1cblxuICAgIGlmIChyZXdyaXR0ZW5TcmNzZXQpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3Jjc2V0JywgcmV3cml0dGVuU3Jjc2V0KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1NlcnZlciAmJiB0aGlzLnByaW9yaXR5KSB7XG4gICAgICB0aGlzLnByZWxvYWRMaW5rQ2hlY2tlci5jcmVhdGVQcmVsb2FkTGlua1RhZyhcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLCByZXdyaXR0ZW5TcmMsIHJld3JpdHRlblNyY3NldCwgdGhpcy5zaXplcyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgICAgICAgICB0aGlzLCBjaGFuZ2VzLCBbJ25nU3JjJywgJ25nU3Jjc2V0JywgJ3dpZHRoJywgJ2hlaWdodCcsICdwcmlvcml0eSddKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLmxvYWRpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9hZGluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGlmICghdGhpcy5fcmVuZGVyZWRTcmMpIHtcbiAgICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMubmdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IHRoaXMuaW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVkU3JjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB3aWR0aFNyY1NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodGhpcy5uZ1NyY3NldCk7XG4gICAgY29uc3QgZmluYWxTcmNzID0gdGhpcy5uZ1NyY3NldC5zcGxpdCgnLCcpLmZpbHRlcihzcmMgPT4gc3JjICE9PSAnJykubWFwKHNyY1N0ciA9PiB7XG4gICAgICBzcmNTdHIgPSBzcmNTdHIudHJpbSgpO1xuICAgICAgY29uc3Qgd2lkdGggPSB3aWR0aFNyY1NldCA/IHBhcnNlRmxvYXQoc3JjU3RyKSA6IHBhcnNlRmxvYXQoc3JjU3RyKSAqIHRoaXMud2lkdGghO1xuICAgICAgcmV0dXJuIGAke3RoaXMuaW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGh9KX0gJHtzcmNTdHJ9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIGdldEF1dG9tYXRpY1NyY3NldCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnNpemVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZXNwb25zaXZlU3Jjc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpeGVkU3Jjc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXNwb25zaXZlU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qge2JyZWFrcG9pbnRzfSA9IHRoaXMuY29uZmlnO1xuXG4gICAgbGV0IGZpbHRlcmVkQnJlYWtwb2ludHMgPSBicmVha3BvaW50cyE7XG4gICAgaWYgKHRoaXMuc2l6ZXM/LnRyaW0oKSA9PT0gJzEwMHZ3Jykge1xuICAgICAgLy8gU2luY2UgdGhpcyBpcyBhIGZ1bGwtc2NyZWVuLXdpZHRoIGltYWdlLCBvdXIgc3Jjc2V0IG9ubHkgbmVlZHMgdG8gaW5jbHVkZVxuICAgICAgLy8gYnJlYWtwb2ludHMgd2l0aCBmdWxsIHZpZXdwb3J0IHdpZHRocy5cbiAgICAgIGZpbHRlcmVkQnJlYWtwb2ludHMgPSBicmVha3BvaW50cyEuZmlsdGVyKGJwID0+IGJwID49IFZJRVdQT1JUX0JSRUFLUE9JTlRfQ1VUT0ZGKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbFNyY3MgPVxuICAgICAgICBmaWx0ZXJlZEJyZWFrcG9pbnRzLm1hcChicCA9PiBgJHt0aGlzLmltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRoOiBicH0pfSAke2JwfXdgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIGdldEZpeGVkU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmluYWxTcmNzID0gREVOU0lUWV9TUkNTRVRfTVVMVElQTElFUlMubWFwKFxuICAgICAgICBtdWx0aXBsaWVyID0+IGAke3RoaXMuaW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGg6IHRoaXMud2lkdGghICogbXVsdGlwbGllcn0pfSAke1xuICAgICAgICAgICAgbXVsdGlwbGllcn14YCk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMuX3JlbmRlcmVkU3JjICE9PSBudWxsICYmIHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5sY3BPYnNlcnZlci51bnJlZ2lzdGVySW1hZ2UodGhpcy5fcmVuZGVyZWRTcmMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmltZ0VsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG4vKioqKiogSGVscGVycyAqKioqKi9cblxuLyoqXG4gKiBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGludGVnZXIuXG4gKi9cbmZ1bmN0aW9uIGlucHV0VG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCk6IG51bWJlcnx1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGJvb2xlYW4uXG4gKi9cbmZ1bmN0aW9uIGlucHV0VG9Cb29sZWFuKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGAke3ZhbHVlfWAgIT09ICdmYWxzZSc7XG59XG5cbi8qKlxuICogU29ydHMgcHJvdmlkZWQgY29uZmlnIGJyZWFrcG9pbnRzIGFuZCB1c2VzIGRlZmF1bHRzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29uZmlnKGNvbmZpZzogSW1hZ2VDb25maWcpOiBJbWFnZUNvbmZpZyB7XG4gIGxldCBzb3J0ZWRCcmVha3BvaW50czoge2JyZWFrcG9pbnRzPzogbnVtYmVyW119ID0ge307XG4gIGlmIChjb25maWcuYnJlYWtwb2ludHMpIHtcbiAgICBzb3J0ZWRCcmVha3BvaW50cy5icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRDb25maWcsIGNvbmZpZywgc29ydGVkQnJlYWtwb2ludHMpO1xufVxuXG4vKioqKiogQXNzZXJ0IGZ1bmN0aW9ucyAqKioqKi9cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmMpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gYm90aCBcXGBzcmNcXGAgYW5kIFxcYG5nU3JjXFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3JjXFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgXFxgbmdTcmNcXGAuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3Jjc2V0YCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3Jjc2V0XFxgIGFuZCBcXGBuZ1NyY3NldFxcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBzZXRzIFxcYHNyY3NldFxcYCBpdHNlbGYgYmFzZWQgb24gdGhlIHZhbHVlIG9mIGAgK1xuICAgICAgICAgICAgYFxcYG5nU3Jjc2V0XFxgLiBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3Jjc2V0XFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY2AgaXMgbm90IGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdEJhc2U2NEltYWdlKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgbmdTcmMgPSBkaXIubmdTcmMudHJpbSgpO1xuICBpZiAobmdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSkge1xuICAgIGlmIChuZ1NyYy5sZW5ndGggPiBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpIHtcbiAgICAgIG5nU3JjID0gbmdTcmMuc3Vic3RyaW5nKDAsIEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikgKyAnLi4uJztcbiAgICB9XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYywgZmFsc2UpfSBcXGBuZ1NyY1xcYCBpcyBhIEJhc2U2NC1lbmNvZGVkIHN0cmluZyBgICtcbiAgICAgICAgICAgIGAoJHtuZ1NyY30pLiBOZ09wdGltaXplZEltYWdlIGRvZXMgbm90IHN1cHBvcnQgQmFzZTY0LWVuY29kZWQgc3RyaW5ncy4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgbmdTcmNcXGAgYW5kIHVzaW5nIGEgc3RhbmRhcmQgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgJ3NpemVzJyBvbmx5IGluY2x1ZGVzIHJlc3BvbnNpdmUgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbXBsZXhTaXplcyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHNpemVzID0gZGlyLnNpemVzO1xuICBpZiAoc2l6ZXM/Lm1hdGNoKC8oKFxcKXwsKVxcc3xeKVxcZCtweC8pKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYywgZmFsc2UpfSBcXGBzaXplc1xcYCB3YXMgc2V0IHRvIGEgc3RyaW5nIGluY2x1ZGluZyBgICtcbiAgICAgICAgICAgIGBwaXhlbCB2YWx1ZXMuIEZvciBhdXRvbWF0aWMgXFxgc3Jjc2V0XFxgIGdlbmVyYXRpb24sIFxcYHNpemVzXFxgIG11c3Qgb25seSBpbmNsdWRlIHJlc3BvbnNpdmUgYCArXG4gICAgICAgICAgICBgdmFsdWVzLCBzdWNoIGFzIFxcYHNpemVzPVwiNTB2d1wiXFxgIG9yIFxcYHNpemVzPVwiKG1pbi13aWR0aDogNzY4cHgpIDUwdncsIDEwMHZ3XCJcXGAuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBtb2RpZnkgdGhlIFxcYHNpemVzXFxgIGF0dHJpYnV0ZSwgb3IgcHJvdmlkZSB5b3VyIG93biBcXGBuZ1NyY3NldFxcYCB2YWx1ZSBkaXJlY3RseS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY2AgaXMgbm90IGEgQmxvYiBVUkwuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVcmwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IG5nU3JjID0gZGlyLm5nU3JjLnRyaW0oKTtcbiAgaWYgKG5nU3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNcXGAgd2FzIHNldCB0byBhIGJsb2IgVVJMICgke25nU3JjfSkuIGAgK1xuICAgICAgICAgICAgYEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgaW5wdXQgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuICBjb25zdCBpc0VtcHR5U3RyaW5nID0gaXNTdHJpbmcgJiYgdmFsdWUudHJpbSgpID09PSAnJztcbiAgaWYgKCFpc1N0cmluZyB8fCBpc0VtcHR5U3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7bmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgICAgICBgKFxcYCR7dmFsdWV9XFxgKS4gVG8gZml4IHRoaXMsIGNoYW5nZSB0aGUgdmFsdWUgdG8gYSBub24tZW1wdHkgc3RyaW5nLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3Jjc2V0YCBpcyBpbiBhIHZhbGlkIGZvcm1hdCwgZS5nLiBcIjEwMHcsIDIwMHdcIiBvciBcIjF4LCAyeFwiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWROZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyLCAnbmdTcmNzZXQnLCB2YWx1ZSk7XG4gIGNvbnN0IHN0cmluZ1ZhbCA9IHZhbHVlIGFzIHN0cmluZztcbiAgY29uc3QgaXNWYWxpZFdpZHRoRGVzY3JpcHRvciA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcbiAgY29uc3QgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yID0gVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG5cbiAgaWYgKGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcikge1xuICAgIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXIsIHN0cmluZ1ZhbCk7XG4gIH1cblxuICBjb25zdCBpc1ZhbGlkU3Jjc2V0ID0gaXNWYWxpZFdpZHRoRGVzY3JpcHRvciB8fCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3I7XG4gIGlmICghaXNWYWxpZFNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGBuZ1NyY3NldFxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHt2YWx1ZX1cXGApLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgc3VwcGx5IFxcYG5nU3Jjc2V0XFxgIHVzaW5nIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2Ygb25lIG9yIG1vcmUgd2lkdGggYCArXG4gICAgICAgICAgICBgZGVzY3JpcHRvcnMgKGUuZy4gXCIxMDB3LCAyMDB3XCIpIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMgKGUuZy4gXCIxeCwgMnhcIikuYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgdmFsdWU6IHN0cmluZykge1xuICBjb25zdCB1bmRlckRlbnNpdHlDYXAgPVxuICAgICAgdmFsdWUuc3BsaXQoJywnKS5ldmVyeShudW0gPT4gbnVtID09PSAnJyB8fCBwYXJzZUZsb2F0KG51bSkgPD0gQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQKTtcbiAgaWYgKCF1bmRlckRlbnNpdHlDYXApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke1xuICAgICAgICAgICAgaW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgICAgICAgICBkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgY29udGFpbnMgYW4gdW5zdXBwb3J0ZWQgaW1hZ2UgZGVuc2l0eTpgICtcbiAgICAgICAgICAgIGBcXGAke3ZhbHVlfVxcYC4gTmdPcHRpbWl6ZWRJbWFnZSBnZW5lcmFsbHkgcmVjb21tZW5kcyBhIG1heCBpbWFnZSBkZW5zaXR5IG9mIGAgK1xuICAgICAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggYnV0IHN1cHBvcnRzIGltYWdlIGRlbnNpdGllcyB1cCB0byBgICtcbiAgICAgICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14LiBUaGUgaHVtYW4gZXllIGNhbm5vdCBkaXN0aW5ndWlzaCBiZXR3ZWVuIGltYWdlIGRlbnNpdGllcyBgICtcbiAgICAgICAgICAgIGBncmVhdGVyIHRoYW4gJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCAtIHdoaWNoIG1ha2VzIHRoZW0gdW5uZWNlc3NhcnkgZm9yIGAgK1xuICAgICAgICAgICAgYG1vc3QgdXNlIGNhc2VzLiBJbWFnZXMgdGhhdCB3aWxsIGJlIHBpbmNoLXpvb21lZCBhcmUgdHlwaWNhbGx5IHRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciBgICtcbiAgICAgICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGltYWdlcy4gUGxlYXNlIHJlbW92ZSB0aGUgaGlnaCBkZW5zaXR5IGRlc2NyaXB0b3IgYW5kIHRyeSBhZ2Fpbi5gKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgUnVudGltZUVycm9yYCBpbnN0YW5jZSB0byByZXByZXNlbnQgYSBzaXR1YXRpb24gd2hlbiBhbiBpbnB1dCBpcyBzZXQgYWZ0ZXJcbiAqIHRoZSBkaXJlY3RpdmUgaGFzIGluaXRpYWxpemVkLlxuICovXG5mdW5jdGlvbiBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dE5hbWU6IHN0cmluZyk6IHt9IHtcbiAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfSU5QVVRfQ0hBTkdFLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgd2FzIHVwZGF0ZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uIGAgK1xuICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCBhIHN0YXRpYyB2YWx1ZSBvciB3cmFwIHRoZSBpbWFnZSBlbGVtZW50IGAgK1xuICAgICAgICAgIGBpbiBhbiAqbmdJZiB0aGF0IGlzIGdhdGVkIG9uIHRoZSBuZWNlc3NhcnkgdmFsdWUuYCk7XG59XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgbm9uZSBvZiB0aGUgbGlzdGVkIGlucHV0cyBoYXMgY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgY2hhbmdlczogU2ltcGxlQ2hhbmdlcywgaW5wdXRzOiBzdHJpbmdbXSkge1xuICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICduZ1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYG5nU3JjYCBpbnB1dCBjaGFuZ2VzLCB3ZSBkZXRlY3QgdGhhdCBvbmx5IGluIHRoZVxuICAgICAgICAvLyBgbmdPbkNoYW5nZXNgIGhvb2ssIHRodXMgdGhlIGBuZ1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgbmdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtuZ1NyYzogY2hhbmdlc1tpbnB1dF0ucHJldmlvdXNWYWx1ZX0gYXMgTmdPcHRpbWl6ZWRJbWFnZTtcbiAgICAgIH1cbiAgICAgIHRocm93IHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXIsIGlucHV0KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEdyZWF0ZXJUaGFuWmVybyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHZhbGlkTnVtYmVyID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInICYmIGlucHV0VmFsdWUgPiAwO1xuICBjb25zdCB2YWxpZFN0cmluZyA9XG4gICAgICB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkgJiYgcGFyc2VJbnQoaW5wdXRWYWx1ZSkgPiAwO1xuICBpZiAoIXZhbGlkTnVtYmVyICYmICF2YWxpZFN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgICAgICBgKFxcYCR7aW5wdXRWYWx1ZX1cXGApLiBUbyBmaXggdGhpcywgcHJvdmlkZSBcXGAke2lucHV0TmFtZX1cXGAgYCArXG4gICAgICAgICAgICBgYXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IHJlbW92ZUxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMaXN0ZW5lckZuKCk7XG4gICAgLy8gVE9ETzogYGNsaWVudFdpZHRoYCwgYGNsaWVudEhlaWdodGAsIGBuYXR1cmFsV2lkdGhgIGFuZCBgbmF0dXJhbEhlaWdodGBcbiAgICAvLyBhcmUgdHlwZWQgYXMgbnVtYmVyLCBidXQgd2UgcnVuIGBwYXJzZUZsb2F0YCAod2hpY2ggYWNjZXB0cyBzdHJpbmdzIG9ubHkpLlxuICAgIC8vIFZlcmlmeSB3aGV0aGVyIGBwYXJzZUZsb2F0YCBpcyBuZWVkZWQgaW4gdGhlIGNhc2VzIGJlbG93LlxuICAgIGNvbnN0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGltZy5jbGllbnRXaWR0aCBhcyBhbnkpO1xuICAgIGNvbnN0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChpbWcuY2xpZW50SGVpZ2h0IGFzIGFueSk7XG4gICAgY29uc3QgcmVuZGVyZWRBc3BlY3RSYXRpbyA9IHJlbmRlcmVkV2lkdGggLyByZW5kZXJlZEhlaWdodDtcbiAgICBjb25zdCBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zID0gcmVuZGVyZWRXaWR0aCAhPT0gMCAmJiByZW5kZXJlZEhlaWdodCAhPT0gMDtcblxuICAgIGNvbnN0IGludHJpbnNpY1dpZHRoID0gcGFyc2VGbG9hdChpbWcubmF0dXJhbFdpZHRoIGFzIGFueSk7XG4gICAgY29uc3QgaW50cmluc2ljSGVpZ2h0ID0gcGFyc2VGbG9hdChpbWcubmF0dXJhbEhlaWdodCBhcyBhbnkpO1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPSBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuXG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIGltYWdlIGRvZXMgbm90IG1hdGNoIGAgK1xuICAgICAgICAgICAgICBgdGhlIGFzcGVjdCByYXRpbyBpbmRpY2F0ZWQgYnkgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7aW50cmluc2ljQXNwZWN0UmF0aW99KS4gXFxuU3VwcGxpZWQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzOiBgICtcbiAgICAgICAgICAgICAgYCR7c3VwcGxpZWRXaWR0aH13IHggJHtzdXBwbGllZEhlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7c3VwcGxpZWRBc3BlY3RSYXRpb30pLiBgICtcbiAgICAgICAgICAgICAgYFxcblRvIGZpeCB0aGlzLCB1cGRhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy5gKSk7XG4gICAgfSBlbHNlIGlmIChzdHlsaW5nRGlzdG9ydGlvbikge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBgICtcbiAgICAgICAgICAgICAgYGRvZXMgbm90IG1hdGNoIHRoZSBpbWFnZSdzIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIGAgK1xuICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke2ludHJpbnNpY0FzcGVjdFJhdGlvfSkuIFxcblJlbmRlcmVkIGltYWdlIHNpemU6IGAgK1xuICAgICAgICAgICAgICBgJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogYCArXG4gICAgICAgICAgICAgIGAke3JlbmRlcmVkQXNwZWN0UmF0aW99KS4gXFxuVGhpcyBpc3N1ZSBjYW4gb2NjdXIgaWYgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGAgK1xuICAgICAgICAgICAgICBgYXR0cmlidXRlcyBhcmUgYWRkZWQgdG8gYW4gaW1hZ2Ugd2l0aG91dCB1cGRhdGluZyB0aGUgY29ycmVzcG9uZGluZyBgICtcbiAgICAgICAgICAgICAgYGltYWdlIHN0eWxpbmcuIFRvIGZpeCB0aGlzLCBhZGp1c3QgaW1hZ2Ugc3R5bGluZy4gSW4gbW9zdCBjYXNlcywgYCArXG4gICAgICAgICAgICAgIGBhZGRpbmcgXCJoZWlnaHQ6IGF1dG9cIiBvciBcIndpZHRoOiBhdXRvXCIgdG8gdGhlIGltYWdlIHN0eWxpbmcgd2lsbCBmaXggYCArXG4gICAgICAgICAgICAgIGB0aGlzIGlzc3VlLmApKTtcbiAgICB9IGVsc2UgaWYgKCFkaXIubmdTcmNzZXQgJiYgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucykge1xuICAgICAgLy8gSWYgYG5nU3Jjc2V0YCBoYXNuJ3QgYmVlbiBzZXQsIHNhbml0eSBjaGVjayB0aGUgaW50cmluc2ljIHNpemUuXG4gICAgICBjb25zdCByZWNvbW1lbmRlZFdpZHRoID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRXaWR0aDtcbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkSGVpZ2h0ID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRIZWlnaHQ7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRXaWR0aCA9IChpbnRyaW5zaWNXaWR0aCAtIHJlY29tbWVuZGVkV2lkdGgpID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRIZWlnaHQgPSAoaW50cmluc2ljSGVpZ2h0IC0gcmVjb21tZW5kZWRIZWlnaHQpID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgICBpZiAob3ZlcnNpemVkV2lkdGggfHwgb3ZlcnNpemVkSGVpZ2h0KSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk9WRVJTSVpFRF9JTUFHRSxcbiAgICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGludHJpbnNpYyBpbWFnZSBpcyBzaWduaWZpY2FudGx5IGAgK1xuICAgICAgICAgICAgICAgIGBsYXJnZXIgdGhhbiBuZWNlc3NhcnkuIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemU6ICR7cmVjb21tZW5kZWRXaWR0aH13IHggJHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb21tZW5kZWRIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgICAgYFxcbk5vdGU6IFJlY29tbWVuZGVkIGludHJpbnNpYyBpbWFnZSBzaXplIGlzIGNhbGN1bGF0ZWQgYXNzdW1pbmcgYSBtYXhpbXVtIERQUiBvZiBgICtcbiAgICAgICAgICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9LiBUbyBpbXByb3ZlIGxvYWRpbmcgdGltZSwgcmVzaXplIHRoZSBpbWFnZSBgICtcbiAgICAgICAgICAgICAgICBgb3IgY29uc2lkZXIgdXNpbmcgdGhlIFwibmdTcmNzZXRcIiBhbmQgXCJzaXplc1wiIGF0dHJpYnV0ZXMuYCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBtaXNzaW5nQXR0cmlidXRlcyA9IFtdO1xuICBpZiAoZGlyLndpZHRoID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ3dpZHRoJyk7XG4gIGlmIChkaXIuaGVpZ2h0ID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ2hlaWdodCcpO1xuICBpZiAobWlzc2luZ0F0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUkVRVUlSRURfSU5QVVRfTUlTU0lORyxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGVzZSByZXF1aXJlZCBhdHRyaWJ1dGVzIGAgK1xuICAgICAgICAgICAgYGFyZSBtaXNzaW5nOiAke21pc3NpbmdBdHRyaWJ1dGVzLm1hcChhdHRyID0+IGBcIiR7YXR0cn1cImApLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICAgICAgIGBJbmNsdWRpbmcgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgd2lsbCBwcmV2ZW50IGltYWdlLXJlbGF0ZWQgbGF5b3V0IHNoaWZ0cy4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGluY2x1ZGUgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgb24gdGhlIGltYWdlIHRhZy5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgd2lkdGggYW5kIGhlaWdodCBhcmUgbm90IHNldC4gVXNlZCBpbiBmaWxsIG1vZGUsIHdoZXJlIHRob3NlIGF0dHJpYnV0ZXMgZG9uJ3QgbWFrZVxuICogc2Vuc2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIud2lkdGggfHwgZGlyLmhlaWdodCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5uZ1NyYyl9IHRoZSBhdHRyaWJ1dGVzIFxcYGhlaWdodFxcYCBhbmQvb3IgXFxgd2lkdGhcXGAgYXJlIHByZXNlbnQgYCArXG4gICAgICAgICAgICBgYWxvbmcgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuIEJlY2F1c2UgXFxgZmlsbFxcYCBtb2RlIGNhdXNlcyBhbiBpbWFnZSB0byBmaWxsIGl0cyBjb250YWluaW5nIGAgK1xuICAgICAgICAgICAgYGVsZW1lbnQsIHRoZSBzaXplIGF0dHJpYnV0ZXMgaGF2ZSBubyBlZmZlY3QgYW5kIHNob3VsZCBiZSByZW1vdmVkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYGxvYWRpbmdgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSB2YWxpZCBpbnB1dCAmXG4gKiBpcyBub3QgdXNlZCBvbiBwcmlvcml0eSBpbWFnZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLmxvYWRpbmcgJiYgZGlyLnByaW9yaXR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBgICtcbiAgICAgICAgICAgIGBTZXR0aW5nIFxcYGxvYWRpbmdcXGAgb24gcHJpb3JpdHkgaW1hZ2VzIGlzIG5vdCBhbGxvd2VkIGAgK1xuICAgICAgICAgICAgYGJlY2F1c2UgdGhlc2UgaW1hZ2VzIHdpbGwgYWx3YXlzIGJlIGVhZ2VybHkgbG9hZGVkLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcmVtb3ZlIHRoZSDigJxsb2FkaW5n4oCdIGF0dHJpYnV0ZSBmcm9tIHRoZSBwcmlvcml0eSBpbWFnZS5gKTtcbiAgfVxuICBjb25zdCB2YWxpZElucHV0cyA9IFsnYXV0bycsICdlYWdlcicsICdsYXp5J107XG4gIGlmICh0eXBlb2YgZGlyLmxvYWRpbmcgPT09ICdzdHJpbmcnICYmICF2YWxpZElucHV0cy5pbmNsdWRlcyhkaXIubG9hZGluZykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke2Rpci5sb2FkaW5nfVxcYCkuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgdmFsaWQgdmFsdWUgKFwibGF6eVwiLCBcImVhZ2VyXCIsIG9yIFwiYXV0b1wiKS5gKTtcbiAgfVxufVxuIl19