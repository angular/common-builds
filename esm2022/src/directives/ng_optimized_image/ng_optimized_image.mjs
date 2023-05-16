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
import { cloudinaryLoaderInfo } from './image_loaders/cloudinary_loader';
import { IMAGE_LOADER, noopImageLoader } from './image_loaders/image_loader';
import { imageKitLoaderInfo } from './image_loaders/imagekit_loader';
import { imgixLoaderInfo } from './image_loaders/imgix_loader';
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
/**
 * Used to limit automatic srcset generation of very large sources for
 * fixed-size images. In pixels.
 */
const FIXED_SRCSET_WIDTH_LIMIT = 1920;
const FIXED_SRCSET_HEIGHT_LIMIT = 1080;
/** Info about built-in loaders we can test for. */
export const BUILT_IN_LOADERS = [imgixLoaderInfo, imageKitLoaderInfo, cloudinaryLoaderInfo];
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
 */
class NgOptimizedImage {
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
     * For responsive images: the intrinsic width of the image in pixels.
     * For fixed size images: the desired rendered width of the image in pixels.
     */
    set width(value) {
        ngDevMode && assertGreaterThanZero(this, value, 'width');
        this._width = inputToInteger(value);
    }
    get width() {
        return this._width;
    }
    /**
     * For responsive images: the intrinsic height of the image in pixels.
     * For fixed size images: the desired rendered height of the image in pixels.* The intrinsic
     * height of the image in pixels.
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
     * Sets the image to "fill mode", which eliminates the height/width requirement and adds
     * styles such that the image fills its containing element.
     *
     * @developerPreview
     */
    set fill(value) {
        this._fill = inputToBoolean(value);
    }
    get fill() {
        return this._fill;
    }
    /** @nodoc */
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
                assertNonZeroRenderedHeight(this, this.imgElement, this.renderer);
            }
            else {
                assertNonEmptyWidthAndHeight(this);
                // Only check for distorted images when not in fill mode, where
                // images may be intentionally stretched, cropped or letterboxed.
                assertNoImageDistortion(this, this.imgElement, this.renderer);
            }
            assertValidLoadingInput(this);
            if (!this.ngSrcset) {
                assertNoComplexSizes(this);
            }
            assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
            assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
            assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
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
        // The `data-ng-img` attribute flags an image as using the directive, to allow
        // for analysis of the directive's performance.
        this.setHostAttribute('ng-img', 'true');
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
        else if (this.shouldGenerateAutomaticSrcset()) {
            rewrittenSrcset = this.getAutomaticSrcset();
        }
        if (rewrittenSrcset) {
            this.setHostAttribute('srcset', rewrittenSrcset);
        }
        if (this.isServer && this.priority) {
            this.preloadLinkChecker.createPreloadLinkTag(this.renderer, rewrittenSrc, rewrittenSrcset, this.sizes);
        }
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (ngDevMode) {
            assertNoPostInitInputChange(this, changes, [
                'ngSrc',
                'ngSrcset',
                'width',
                'height',
                'priority',
                'fill',
                'loading',
                'sizes',
                'loaderParams',
                'disableOptimizedSrcset',
            ]);
        }
    }
    callImageLoader(configWithoutCustomParams) {
        let augmentedConfig = configWithoutCustomParams;
        if (this.loaderParams) {
            augmentedConfig.loaderParams = this.loaderParams;
        }
        return this.imageLoader(augmentedConfig);
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
            this._renderedSrc = this.callImageLoader(imgConfig);
        }
        return this._renderedSrc;
    }
    getRewrittenSrcset() {
        const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
        const finalSrcs = this.ngSrcset.split(',').filter(src => src !== '').map(srcStr => {
            srcStr = srcStr.trim();
            const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
            return `${this.callImageLoader({ src: this.ngSrc, width })} ${srcStr}`;
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
        const finalSrcs = filteredBreakpoints.map(bp => `${this.callImageLoader({ src: this.ngSrc, width: bp })} ${bp}w`);
        return finalSrcs.join(', ');
    }
    getFixedSrcset() {
        const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map(multiplier => `${this.callImageLoader({
            src: this.ngSrc,
            width: this.width * multiplier
        })} ${multiplier}x`);
        return finalSrcs.join(', ');
    }
    shouldGenerateAutomaticSrcset() {
        return !this._disableOptimizedSrcset && !this.srcset && this.imageLoader !== noopImageLoader &&
            !(this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT);
    }
    /** @nodoc */
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.1+sha-3eafb4b", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.1+sha-3eafb4b", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: "ngSrc", ngSrcset: "ngSrcset", sizes: "sizes", width: "width", height: "height", loading: "loading", priority: "priority", loaderParams: "loaderParams", disableOptimizedSrcset: "disableOptimizedSrcset", fill: "fill", src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0px\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
export { NgOptimizedImage };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.1+sha-3eafb4b", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[ngSrc]',
                    host: {
                        '[style.position]': 'fill ? "absolute" : null',
                        '[style.width]': 'fill ? "100%" : null',
                        '[style.height]': 'fill ? "100%" : null',
                        '[style.inset]': 'fill ? "0px" : null'
                    }
                }]
        }], propDecorators: { ngSrc: [{
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
            }], loaderParams: [{
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
    let reason;
    if (inputName === 'width' || inputName === 'height') {
        reason = `Changing \`${inputName}\` may result in different attribute value ` +
            `applied to the underlying image element and cause layout shifts on a page.`;
    }
    else {
        reason = `Changing the \`${inputName}\` would have no effect on the underlying ` +
            `image element, because the resource loading has already occurred.`;
    }
    return new RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. ` +
        `The NgOptimizedImage directive will not react to this input change. ${reason} ` +
        `To fix this, either switch \`${inputName}\` to a static value ` +
        `or wrap the image element in an *ngIf that is gated on the necessary value.`);
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
        const computedStyle = window.getComputedStyle(img);
        let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
        let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
        const boxSizing = computedStyle.getPropertyValue('box-sizing');
        if (boxSizing === 'border-box') {
            const paddingTop = computedStyle.getPropertyValue('padding-top');
            const paddingRight = computedStyle.getPropertyValue('padding-right');
            const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
            const paddingLeft = computedStyle.getPropertyValue('padding-left');
            renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
            renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
        }
        const renderedAspectRatio = renderedWidth / renderedHeight;
        const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
        const intrinsicWidth = img.naturalWidth;
        const intrinsicHeight = img.naturalHeight;
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
                `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nSupplied width and height attributes: ` +
                `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${round(suppliedAspectRatio)}). ` +
                `\nTo fix this, update the width and height attributes.`));
        }
        else if (stylingDistortion) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image ` +
                `does not match the image's intrinsic aspect ratio. ` +
                `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nRendered image size: ` +
                `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` +
                `${round(renderedAspectRatio)}). \nThis issue can occur if "width" and "height" ` +
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
            `To fix this, include "width" and "height" attributes on the image tag or turn on ` +
            `"fill" mode with the \`fill\` attribute.`);
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
 * Verifies that the rendered image has a nonzero height. If the image is in fill mode, provides
 * guidance that this can be caused by the containing element's CSS position property.
 */
function assertNonZeroRenderedHeight(dir, img, renderer) {
    const removeListenerFn = renderer.listen(img, 'load', () => {
        removeListenerFn();
        const renderedHeight = img.clientHeight;
        if (dir.fill && renderedHeight === 0) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` +
                `This is likely because the containing element does not have the CSS 'position' ` +
                `property set to one of the following: "relative", "fixed", or "absolute". ` +
                `To fix this problem, make sure the container element has the CSS 'position' ` +
                `property defined and the height of the element is not zero.`));
        }
    });
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
/**
 * Warns if NOT using a loader (falling back to the generic loader) and
 * the image appears to be hosted on one of the image CDNs for which
 * we do have a built-in image loader. Suggests switching to the
 * built-in loader.
 *
 * @param ngSrc Value of the ngSrc attribute
 * @param imageLoader ImageLoader provided
 */
function assertNotMissingBuiltInLoader(ngSrc, imageLoader) {
    if (imageLoader === noopImageLoader) {
        let builtInLoaderName = '';
        for (const loader of BUILT_IN_LOADERS) {
            if (loader.testUrl(ngSrc)) {
                builtInLoaderName = loader.name;
                break;
            }
        }
        if (builtInLoaderName) {
            console.warn(formatRuntimeError(2962 /* RuntimeErrorCode.MISSING_BUILTIN_LOADER */, `NgOptimizedImage: It looks like your images may be hosted on the ` +
                `${builtInLoaderName} CDN, but your app is not using Angular's ` +
                `built-in loader for that CDN. We recommend switching to use ` +
                `the built-in by calling \`provide${builtInLoaderName}Loader()\` ` +
                `in your \`providers\` and passing it your instance's base URL. ` +
                `If you don't want to use the built-in loader, define a custom ` +
                `loader function using IMAGE_LOADER to silence this warning.`));
        }
    }
}
/**
 * Warns if ngSrcset is present and no loader is configured (i.e. the default one is being used).
 */
function assertNoNgSrcsetWithoutLoader(dir, imageLoader) {
    if (dir.ngSrcset && imageLoader === noopImageLoader) {
        console.warn(formatRuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` attribute is present but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which would result in the same image being used for all configured sizes. ` +
            `To fix this, provide a loader or remove the \`ngSrcset\` attribute from the image.`));
    }
}
/**
 * Warns if loaderParams is present and no loader is configured (i.e. the default one is being
 * used).
 */
function assertNoLoaderParamsWithoutLoader(dir, imageLoader) {
    if (dir.loaderParams && imageLoader === noopImageLoader) {
        console.warn(formatRuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`loaderParams\` attribute is present but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which means that the loaderParams data will not be consumed and will not affect the URL. ` +
            `To fix this, provide a custom loader or remove the \`loaderParams\` attribute from the image.`));
    }
}
function round(input) {
    return Number.isInteger(input) ? input : input.toFixed(2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBZ0MsV0FBVyxFQUFFLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdwUCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUN2RSxPQUFPLEVBQUMsWUFBWSxFQUFrQyxlQUFlLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMzRyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7O0FBRTFEOzs7Ozs7R0FNRztBQUNILE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sNkJBQTZCLEdBQUcsMkJBQTJCLENBQUM7QUFFbEU7OztHQUdHO0FBQ0gs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Y2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgaW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgSW5qZWN0b3IsIElucHV0LCBOZ1pvbmUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFBMQVRGT1JNX0lELCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXMsIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICcuLi8uLi9wbGF0Zm9ybV9pZCc7XG5cbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtjbG91ZGluYXJ5TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2Nsb3VkaW5hcnlfbG9hZGVyJztcbmltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlciwgSW1hZ2VMb2FkZXJDb25maWcsIG5vb3BJbWFnZUxvYWRlcn0gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltYWdlX2xvYWRlcic7XG5pbXBvcnQge2ltYWdlS2l0TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlcic7XG5pbXBvcnQge2ltZ2l4TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltZ2l4X2xvYWRlcic7XG5pbXBvcnQge0xDUEltYWdlT2JzZXJ2ZXJ9IGZyb20gJy4vbGNwX2ltYWdlX29ic2VydmVyJztcbmltcG9ydCB7UHJlY29ubmVjdExpbmtDaGVja2VyfSBmcm9tICcuL3ByZWNvbm5lY3RfbGlua19jaGVja2VyJztcbmltcG9ydCB7UHJlbG9hZExpbmtDcmVhdG9yfSBmcm9tICcuL3ByZWxvYWQtbGluay1jcmVhdG9yJztcblxuLyoqXG4gKiBXaGVuIGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UgaXMgcGFzc2VkIGFzIGFuIGlucHV0IHRvIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLFxuICogYW4gZXJyb3IgaXMgdGhyb3duLiBUaGUgaW1hZ2UgY29udGVudCAoYXMgYSBzdHJpbmcpIG1pZ2h0IGJlIHZlcnkgbG9uZywgdGh1cyBtYWtpbmdcbiAqIGl0IGhhcmQgdG8gcmVhZCBhbiBlcnJvciBtZXNzYWdlIGlmIHRoZSBlbnRpcmUgc3RyaW5nIGlzIGluY2x1ZGVkLiBUaGlzIGNvbnN0IGRlZmluZXNcbiAqIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBlcnJvciBtZXNzYWdlLiBUaGUgcmVzdFxuICogb2YgdGhlIGNvbnRlbnQgaXMgdHJ1bmNhdGVkLlxuICovXG5jb25zdCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IgPSA1MDtcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIHdpZHRoIGRlc2NyaXB0b3JzLlxuICogU2hvdWxkIG1hdGNoIHNvbWV0aGluZyBsaWtlOiBcIjEwMHcsIDIwMHdcIi5cbiAqL1xuY29uc3QgVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZCt3XFxzKigsfCQpKXsxLH0pJC87XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICogU2hvdWxkIG1hdGNoIHNvbWV0aGluZyBsaWtlOiBcIjF4LCAyeCwgNTB4XCIuIEFsc28gc3VwcG9ydHMgZGVjaW1hbHMgbGlrZSBcIjEuNXgsIDEuNTB4XCIuXG4gKi9cbmNvbnN0IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZCsoXFwuXFxkKyk/eFxccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFNyY3NldCB2YWx1ZXMgd2l0aCBhIGRlbnNpdHkgZGVzY3JpcHRvciBoaWdoZXIgdGhhbiB0aGlzIHZhbHVlIHdpbGwgYWN0aXZlbHlcbiAqIHRocm93IGFuIGVycm9yLiBTdWNoIGRlbnNpdGllcyBhcmUgbm90IHBlcm1pdHRlZCBhcyB0aGV5IGNhdXNlIGltYWdlIHNpemVzXG4gKiB0byBiZSB1bnJlYXNvbmFibHkgbGFyZ2UgYW5kIHNsb3cgZG93biBMQ1AuXG4gKi9cbmV4cG9ydCBjb25zdCBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAgPSAzO1xuXG4vKipcbiAqIFVzZWQgb25seSBpbiBlcnJvciBtZXNzYWdlIHRleHQgdG8gY29tbXVuaWNhdGUgYmVzdCBwcmFjdGljZXMsIGFzIHdlIHdpbGxcbiAqIG9ubHkgdGhyb3cgYmFzZWQgb24gdGhlIHNsaWdodGx5IG1vcmUgY29uc2VydmF0aXZlIEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUC5cbiAqL1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCA9IDI7XG5cbi8qKlxuICogVXNlZCBpbiBnZW5lcmF0aW5nIGF1dG9tYXRpYyBkZW5zaXR5LWJhc2VkIHNyY3NldHNcbiAqL1xuY29uc3QgREVOU0lUWV9TUkNTRVRfTVVMVElQTElFUlMgPSBbMSwgMl07XG5cbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggYnJlYWtwb2ludHMgdG8gdXNlIG9uIGZ1bGwtd2lkdGggaW1hZ2VzXG4gKi9cbmNvbnN0IFZJRVdQT1JUX0JSRUFLUE9JTlRfQ1VUT0ZGID0gNjQwO1xuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHR3byBhc3BlY3QgcmF0aW9zIGFyZSBzaW1pbGFyIGluIHZhbHVlLlxuICovXG5jb25zdCBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFID0gLjE7XG5cbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgaW1hZ2UgaGFzIGJlZW4gcmVxdWVzdGVkIGF0IGFuIG92ZXJseVxuICogbGFyZ2Ugc2l6ZSBjb21wYXJlZCB0byB0aGUgYWN0dWFsIHJlbmRlcmVkIGltYWdlIHNpemUgKGFmdGVyIHRha2luZ1xuICogaW50byBhY2NvdW50IGEgdHlwaWNhbCBkZXZpY2UgcGl4ZWwgcmF0aW8pLiBJbiBwaXhlbHMuXG4gKi9cbmNvbnN0IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0UgPSAxMDAwO1xuXG4vKipcbiAqIFVzZWQgdG8gbGltaXQgYXV0b21hdGljIHNyY3NldCBnZW5lcmF0aW9uIG9mIHZlcnkgbGFyZ2Ugc291cmNlcyBmb3JcbiAqIGZpeGVkLXNpemUgaW1hZ2VzLiBJbiBwaXhlbHMuXG4gKi9cbmNvbnN0IEZJWEVEX1NSQ1NFVF9XSURUSF9MSU1JVCA9IDE5MjA7XG5jb25zdCBGSVhFRF9TUkNTRVRfSEVJR0hUX0xJTUlUID0gMTA4MDtcblxuXG4vKiogSW5mbyBhYm91dCBidWlsdC1pbiBsb2FkZXJzIHdlIGNhbiB0ZXN0IGZvci4gKi9cbmV4cG9ydCBjb25zdCBCVUlMVF9JTl9MT0FERVJTID0gW2ltZ2l4TG9hZGVySW5mbywgaW1hZ2VLaXRMb2FkZXJJbmZvLCBjbG91ZGluYXJ5TG9hZGVySW5mb107XG5cbi8qKlxuICogQSBjb25maWd1cmF0aW9uIG9iamVjdCBmb3IgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBDb250YWluczpcbiAqIC0gYnJlYWtwb2ludHM6IEFuIGFycmF5IG9mIGludGVnZXIgYnJlYWtwb2ludHMgdXNlZCB0byBnZW5lcmF0ZVxuICogICAgICBzcmNzZXRzIGZvciByZXNwb25zaXZlIGltYWdlcy5cbiAqXG4gKiBMZWFybiBtb3JlIGFib3V0IHRoZSByZXNwb25zaXZlIGltYWdlIGNvbmZpZ3VyYXRpb24gaW4gW3RoZSBOZ09wdGltaXplZEltYWdlXG4gKiBndWlkZV0oZ3VpZGUvaW1hZ2UtZGlyZWN0aXZlKS5cbiAqIEBwdWJsaWNBcGlcbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKi9cbmV4cG9ydCB0eXBlIEltYWdlQ29uZmlnID0ge1xuICBicmVha3BvaW50cz86IG51bWJlcltdXG59O1xuXG5jb25zdCBkZWZhdWx0Q29uZmlnOiBJbWFnZUNvbmZpZyA9IHtcbiAgYnJlYWtwb2ludHM6IFsxNiwgMzIsIDQ4LCA2NCwgOTYsIDEyOCwgMjU2LCAzODQsIDY0MCwgNzUwLCA4MjgsIDEwODAsIDEyMDAsIDE5MjAsIDIwNDgsIDM4NDBdLFxufTtcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjb25maWd1cmVzIHRoZSBpbWFnZSBvcHRpbWl6ZWQgaW1hZ2UgZnVuY3Rpb25hbGl0eS5cbiAqXG4gKiBAc2VlIGBOZ09wdGltaXplZEltYWdlYFxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuZXhwb3J0IGNvbnN0IElNQUdFX0NPTkZJRyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxJbWFnZUNvbmZpZz4oXG4gICAgJ0ltYWdlQ29uZmlnJywge3Byb3ZpZGVkSW46ICdyb290JywgZmFjdG9yeTogKCkgPT4gZGVmYXVsdENvbmZpZ30pO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGltcHJvdmVzIGltYWdlIGxvYWRpbmcgcGVyZm9ybWFuY2UgYnkgZW5mb3JjaW5nIGJlc3QgcHJhY3RpY2VzLlxuICpcbiAqIGBOZ09wdGltaXplZEltYWdlYCBlbnN1cmVzIHRoYXQgdGhlIGxvYWRpbmcgb2YgdGhlIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBpbWFnZSBpc1xuICogcHJpb3JpdGl6ZWQgYnk6XG4gKiAtIEF1dG9tYXRpY2FsbHkgc2V0dGluZyB0aGUgYGZldGNocHJpb3JpdHlgIGF0dHJpYnV0ZSBvbiB0aGUgYDxpbWc+YCB0YWdcbiAqIC0gTGF6eSBsb2FkaW5nIG5vbi1wcmlvcml0eSBpbWFnZXMgYnkgZGVmYXVsdFxuICogLSBBc3NlcnRpbmcgdGhhdCB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgcHJlY29ubmVjdCBsaW5rIHRhZyBpbiB0aGUgZG9jdW1lbnQgaGVhZFxuICpcbiAqIEluIGFkZGl0aW9uLCB0aGUgZGlyZWN0aXZlOlxuICogLSBHZW5lcmF0ZXMgYXBwcm9wcmlhdGUgYXNzZXQgVVJMcyBpZiBhIGNvcnJlc3BvbmRpbmcgYEltYWdlTG9hZGVyYCBmdW5jdGlvbiBpcyBwcm92aWRlZFxuICogLSBBdXRvbWF0aWNhbGx5IGdlbmVyYXRlcyBhIHNyY3NldFxuICogLSBSZXF1aXJlcyB0aGF0IGB3aWR0aGAgYW5kIGBoZWlnaHRgIGFyZSBzZXRcbiAqIC0gV2FybnMgaWYgYHdpZHRoYCBvciBgaGVpZ2h0YCBoYXZlIGJlZW4gc2V0IGluY29ycmVjdGx5XG4gKiAtIFdhcm5zIGlmIHRoZSBpbWFnZSB3aWxsIGJlIHZpc3VhbGx5IGRpc3RvcnRlZCB3aGVuIHJlbmRlcmVkXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIGlzIG1hcmtlZCBhcyBbc3RhbmRhbG9uZV0oZ3VpZGUvc3RhbmRhbG9uZS1jb21wb25lbnRzKSBhbmQgY2FuXG4gKiBiZSBpbXBvcnRlZCBkaXJlY3RseS5cbiAqXG4gKiBGb2xsb3cgdGhlIHN0ZXBzIGJlbG93IHRvIGVuYWJsZSBhbmQgdXNlIHRoZSBkaXJlY3RpdmU6XG4gKiAxLiBJbXBvcnQgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnQuXG4gKiAyLiBPcHRpb25hbGx5IHByb3ZpZGUgYW4gYEltYWdlTG9hZGVyYCBpZiB5b3UgdXNlIGFuIGltYWdlIGhvc3Rpbmcgc2VydmljZS5cbiAqIDMuIFVwZGF0ZSB0aGUgbmVjZXNzYXJ5IGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgYW5kIHJlcGxhY2UgYHNyY2AgYXR0cmlidXRlcyB3aXRoIGBuZ1NyY2AuXG4gKiBVc2luZyBhIGBuZ1NyY2AgYWxsb3dzIHRoZSBkaXJlY3RpdmUgdG8gY29udHJvbCB3aGVuIHRoZSBgc3JjYCBnZXRzIHNldCwgd2hpY2ggdHJpZ2dlcnMgYW4gaW1hZ2VcbiAqIGRvd25sb2FkLlxuICpcbiAqIFN0ZXAgMTogaW1wb3J0IHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IE5nT3B0aW1pemVkSW1hZ2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIEluY2x1ZGUgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlXG4gKiBATmdNb2R1bGUoe1xuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgQXBwTW9kdWxlIHt9XG4gKlxuICogLy8gLi4uIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnRcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlXG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBNeVN0YW5kYWxvbmVDb21wb25lbnQge31cbiAqIGBgYFxuICpcbiAqIFN0ZXAgMjogY29uZmlndXJlIGEgbG9hZGVyLlxuICpcbiAqIFRvIHVzZSB0aGUgKipkZWZhdWx0IGxvYWRlcioqOiBubyBhZGRpdGlvbmFsIGNvZGUgY2hhbmdlcyBhcmUgbmVjZXNzYXJ5LiBUaGUgVVJMIHJldHVybmVkIGJ5IHRoZVxuICogZ2VuZXJpYyBsb2FkZXIgd2lsbCBhbHdheXMgbWF0Y2ggdGhlIHZhbHVlIG9mIFwic3JjXCIuIEluIG90aGVyIHdvcmRzLCB0aGlzIGxvYWRlciBhcHBsaWVzIG5vXG4gKiB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhlIHJlc291cmNlIFVSTCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBgbmdTcmNgIGF0dHJpYnV0ZSB3aWxsIGJlIHVzZWQgYXMgaXMuXG4gKlxuICogVG8gdXNlIGFuIGV4aXN0aW5nIGxvYWRlciBmb3IgYSAqKnRoaXJkLXBhcnR5IGltYWdlIHNlcnZpY2UqKjogYWRkIHRoZSBwcm92aWRlciBmYWN0b3J5IGZvciB5b3VyXG4gKiBjaG9zZW4gc2VydmljZSB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXkuIEluIHRoZSBleGFtcGxlIGJlbG93LCB0aGUgSW1naXggbG9hZGVyIGlzIHVzZWQ6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtwcm92aWRlSW1naXhMb2FkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ2FsbCB0aGUgZnVuY3Rpb24gYW5kIGFkZCB0aGUgcmVzdWx0IHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheTpcbiAqIHByb3ZpZGVyczogW1xuICogICBwcm92aWRlSW1naXhMb2FkZXIoXCJodHRwczovL215LmJhc2UudXJsL1wiKSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBwcm92aWRlcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uczpcbiAqIC0gYHByb3ZpZGVDbG91ZGZsYXJlTG9hZGVyYFxuICogLSBgcHJvdmlkZUNsb3VkaW5hcnlMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1hZ2VLaXRMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1naXhMb2FkZXJgXG4gKlxuICogSWYgeW91IHVzZSBhIGRpZmZlcmVudCBpbWFnZSBwcm92aWRlciwgeW91IGNhbiBjcmVhdGUgYSBjdXN0b20gbG9hZGVyIGZ1bmN0aW9uIGFzIGRlc2NyaWJlZFxuICogYmVsb3cuXG4gKlxuICogVG8gdXNlIGEgKipjdXN0b20gbG9hZGVyKio6IHByb3ZpZGUgeW91ciBsb2FkZXIgZnVuY3Rpb24gYXMgYSB2YWx1ZSBmb3IgdGhlIGBJTUFHRV9MT0FERVJgIERJXG4gKiB0b2tlbi5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0lNQUdFX0xPQURFUiwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ29uZmlndXJlIHRoZSBsb2FkZXIgdXNpbmcgdGhlIGBJTUFHRV9MT0FERVJgIHRva2VuLlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHtcbiAqICAgICAgcHJvdmlkZTogSU1BR0VfTE9BREVSLFxuICogICAgICB1c2VWYWx1ZTogKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAqICAgICAgICByZXR1cm4gYGh0dHBzOi8vZXhhbXBsZS5jb20vJHtjb25maWcuc3JjfS0ke2NvbmZpZy53aWR0aH0uanBnfWA7XG4gKiAgICAgIH1cbiAqICAgfSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBTdGVwIDM6IHVwZGF0ZSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIHRvIHVzZSBgbmdTcmNgIGluc3RlYWQgb2YgYHNyY2AuXG4gKlxuICogYGBgXG4gKiA8aW1nIG5nU3JjPVwibG9nby5wbmdcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjEwMFwiPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbWdbbmdTcmNdJyxcbiAgaG9zdDoge1xuICAgICdbc3R5bGUucG9zaXRpb25dJzogJ2ZpbGwgPyBcImFic29sdXRlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLndpZHRoXSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmhlaWdodF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5pbnNldF0nOiAnZmlsbCA/IFwiMHB4XCIgOiBudWxsJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2UgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBpbWFnZUxvYWRlciA9IGluamVjdChJTUFHRV9MT0FERVIpO1xuICBwcml2YXRlIGNvbmZpZzogSW1hZ2VDb25maWcgPSBwcm9jZXNzQ29uZmlnKGluamVjdChJTUFHRV9DT05GSUcpKTtcbiAgcHJpdmF0ZSByZW5kZXJlciA9IGluamVjdChSZW5kZXJlcjIpO1xuICBwcml2YXRlIGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcbiAgcHJpdmF0ZSBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHByaXZhdGUgcmVhZG9ubHkgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdChQTEFURk9STV9JRCkpO1xuICBwcml2YXRlIHJlYWRvbmx5IHByZWxvYWRMaW5rQ2hlY2tlciA9IGluamVjdChQcmVsb2FkTGlua0NyZWF0b3IpO1xuXG4gIC8vIGEgTENQIGltYWdlIG9ic2VydmVyIC0gc2hvdWxkIGJlIGluamVjdGVkIG9ubHkgaW4gdGhlIGRldiBtb2RlXG4gIHByaXZhdGUgbGNwT2JzZXJ2ZXIgPSBuZ0Rldk1vZGUgPyB0aGlzLmluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKSA6IG51bGw7XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgcmV3cml0dGVuIGBzcmNgIG9uY2UgYW5kIHN0b3JlIGl0LlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCByZXBldGl0aXZlIGNhbGN1bGF0aW9ucyBhbmQgbWFrZSBzdXJlIHRoZSBkaXJlY3RpdmUgY2xlYW51cCBpbiB0aGVcbiAgICogYG5nT25EZXN0cm95YCBkb2VzIG5vdCByZWx5IG9uIHRoZSBgSU1BR0VfTE9BREVSYCBsb2dpYyAod2hpY2ggaW4gdHVybiBjYW4gcmVseSBvbiBzb21lIG90aGVyXG4gICAqIGluc3RhbmNlIHRoYXQgbWlnaHQgYmUgYWxyZWFkeSBkZXN0cm95ZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyZWRTcmM6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgc291cmNlIGltYWdlLlxuICAgKiBJbWFnZSBuYW1lIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgYW5kIHRoZSBmaW5hbCBVUkwgd2lsbCBiZSBhcHBsaWVkIGFzIHRoZSBgc3JjYFxuICAgKiBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoKSBuZ1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogQSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICAgKiBUaGUgaW1hZ2UgbmFtZSB3aWxsIGJlIHRha2VuIGZyb20gYG5nU3JjYCBhbmQgY29tYmluZWQgd2l0aCB0aGUgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5XG4gICAqIGRlc2NyaXB0b3JzIHRvIGdlbmVyYXRlIHRoZSBmaW5hbCBgc3Jjc2V0YCBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIGBgYFxuICAgKiA8aW1nIG5nU3JjPVwiaGVsbG8uanBnXCIgbmdTcmNzZXQ9XCIxMDB3LCAyMDB3XCIgLz4gID0+XG4gICAqIDxpbWcgc3JjPVwicGF0aC9oZWxsby5qcGdcIiBzcmNzZXQ9XCJwYXRoL2hlbGxvLmpwZz93PTEwMCAxMDB3LCBwYXRoL2hlbGxvLmpwZz93PTIwMCAyMDB3XCIgLz5cbiAgICogYGBgXG4gICAqL1xuICBASW5wdXQoKSBuZ1NyY3NldCE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGJhc2UgYHNpemVzYCBhdHRyaWJ1dGUgcGFzc2VkIHRocm91Z2ggdG8gdGhlIGA8aW1nPmAgZWxlbWVudC5cbiAgICogUHJvdmlkaW5nIHNpemVzIGNhdXNlcyB0aGUgaW1hZ2UgdG8gY3JlYXRlIGFuIGF1dG9tYXRpYyByZXNwb25zaXZlIHNyY3NldC5cbiAgICovXG4gIEBJbnB1dCgpIHNpemVzPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBGb3IgcmVzcG9uc2l2ZSBpbWFnZXM6IHRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHdpZHRoKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cbiAgcHJpdmF0ZSBfd2lkdGg/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy4qIFRoZSBpbnRyaW5zaWNcbiAgICogaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgaGVpZ2h0KHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdmFsdWUsICdoZWlnaHQnKTtcbiAgICB0aGlzLl9oZWlnaHQgPSBpbnB1dFRvSW50ZWdlcih2YWx1ZSk7XG4gIH1cbiAgZ2V0IGhlaWdodCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG4gIHByaXZhdGUgX2hlaWdodD86IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGRlc2lyZWQgbG9hZGluZyBiZWhhdmlvciAobGF6eSwgZWFnZXIsIG9yIGF1dG8pLlxuICAgKlxuICAgKiBTZXR0aW5nIGltYWdlcyBhcyBsb2FkaW5nPSdlYWdlcicgb3IgbG9hZGluZz0nYXV0bycgbWFya3MgdGhlbVxuICAgKiBhcyBub24tcHJpb3JpdHkgaW1hZ2VzLiBBdm9pZCBjaGFuZ2luZyB0aGlzIGlucHV0IGZvciBwcmlvcml0eSBpbWFnZXMuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkaW5nPzogJ2xhenknfCdlYWdlcid8J2F1dG8nO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBwcmlvcml0eSh2YWx1ZTogc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fcHJpb3JpdHkgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IHByaW9yaXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcmlvcml0eTtcbiAgfVxuICBwcml2YXRlIF9wcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBEYXRhIHRvIHBhc3MgdGhyb3VnaCB0byBjdXN0b20gbG9hZGVycy5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRlclBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gZm9yIHRoaXMgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgZGlzYWJsZU9wdGltaXplZFNyY3NldCh2YWx1ZTogc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fZGlzYWJsZU9wdGltaXplZFNyY3NldCA9IGlucHV0VG9Cb29sZWFuKHZhbHVlKTtcbiAgfVxuICBnZXQgZGlzYWJsZU9wdGltaXplZFNyY3NldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZU9wdGltaXplZFNyY3NldDtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlT3B0aW1pemVkU3Jjc2V0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGltYWdlIHRvIFwiZmlsbCBtb2RlXCIsIHdoaWNoIGVsaW1pbmF0ZXMgdGhlIGhlaWdodC93aWR0aCByZXF1aXJlbWVudCBhbmQgYWRkc1xuICAgKiBzdHlsZXMgc3VjaCB0aGF0IHRoZSBpbWFnZSBmaWxscyBpdHMgY29udGFpbmluZyBlbGVtZW50LlxuICAgKlxuICAgKiBAZGV2ZWxvcGVyUHJldmlld1xuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGZpbGwodmFsdWU6IHN0cmluZ3xib29sZWFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX2ZpbGwgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IGZpbGwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGw7XG4gIH1cbiAgcHJpdmF0ZSBfZmlsbCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY2AgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3JjYCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3Jjc2V0YCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9uRW1wdHlJbnB1dCh0aGlzLCAnbmdTcmMnLCB0aGlzLm5nU3JjKTtcbiAgICAgIGFzc2VydFZhbGlkTmdTcmNzZXQodGhpcywgdGhpcy5uZ1NyY3NldCk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKHRoaXMpO1xuICAgICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldCh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydE5vdEJhc2U2NEltYWdlKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmxvYlVybCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLmZpbGwpIHtcbiAgICAgICAgYXNzZXJ0RW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgYXNzZXJ0Tm9uWmVyb1JlbmRlcmVkSGVpZ2h0KHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgICAvLyBPbmx5IGNoZWNrIGZvciBkaXN0b3J0ZWQgaW1hZ2VzIHdoZW4gbm90IGluIGZpbGwgbW9kZSwgd2hlcmVcbiAgICAgICAgLy8gaW1hZ2VzIG1heSBiZSBpbnRlbnRpb25hbGx5IHN0cmV0Y2hlZCwgY3JvcHBlZCBvciBsZXR0ZXJib3hlZC5cbiAgICAgICAgYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24odGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KHRoaXMpO1xuICAgICAgaWYgKCF0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29tcGxleFNpemVzKHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIodGhpcy5uZ1NyYywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGlmICh0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IGNoZWNrZXIgPSB0aGlzLmluamVjdG9yLmdldChQcmVjb25uZWN0TGlua0NoZWNrZXIpO1xuICAgICAgICBjaGVja2VyLmFzc2VydFByZWNvbm5lY3QodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5uZ1NyYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBNb25pdG9yIHdoZXRoZXIgYW4gaW1hZ2UgaXMgYW4gTENQIGVsZW1lbnQgb25seSBpbiBjYXNlXG4gICAgICAgIC8vIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZSBpcyBtaXNzaW5nLiBPdGhlcndpc2UsIGFuIGltYWdlXG4gICAgICAgIC8vIGhhcyB0aGUgbmVjZXNzYXJ5IHNldHRpbmdzIGFuZCBubyBleHRyYSBjaGVja3MgYXJlIHJlcXVpcmVkLlxuICAgICAgICBpZiAodGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIhLnJlZ2lzdGVySW1hZ2UodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5uZ1NyYyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlcygpIHtcbiAgICAvLyBNdXN0IHNldCB3aWR0aC9oZWlnaHQgZXhwbGljaXRseSBpbiBjYXNlIHRoZXkgYXJlIGJvdW5kIChpbiB3aGljaCBjYXNlIHRoZXkgd2lsbFxuICAgIC8vIG9ubHkgYmUgcmVmbGVjdGVkIGFuZCBub3QgZm91bmQgYnkgdGhlIGJyb3dzZXIpXG4gICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgaWYgKCF0aGlzLnNpemVzKSB7XG4gICAgICAgIHRoaXMuc2l6ZXMgPSAnMTAwdncnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCEudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0IS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG5cbiAgICAvLyBUaGUgYGRhdGEtbmctaW1nYCBhdHRyaWJ1dGUgZmxhZ3MgYW4gaW1hZ2UgYXMgdXNpbmcgdGhlIGRpcmVjdGl2ZSwgdG8gYWxsb3dcbiAgICAvLyBmb3IgYW5hbHlzaXMgb2YgdGhlIGRpcmVjdGl2ZSdzIHBlcmZvcm1hbmNlLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbmctaW1nJywgJ3RydWUnKTtcblxuICAgIC8vIFRoZSBgc3JjYCBhbmQgYHNyY3NldGAgYXR0cmlidXRlcyBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIGNvbnN0IHJld3JpdHRlblNyYyA9IHRoaXMuZ2V0UmV3cml0dGVuU3JjKCk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCByZXdyaXR0ZW5TcmMpO1xuXG4gICAgbGV0IHJld3JpdHRlblNyY3NldDogc3RyaW5nfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIGlmICh0aGlzLnNpemVzKSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NpemVzJywgdGhpcy5zaXplcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0UmV3cml0dGVuU3Jjc2V0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCkpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0QXV0b21hdGljU3Jjc2V0KCk7XG4gICAgfVxuXG4gICAgaWYgKHJld3JpdHRlblNyY3NldCkge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmNzZXQnLCByZXdyaXR0ZW5TcmNzZXQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzU2VydmVyICYmIHRoaXMucHJpb3JpdHkpIHtcbiAgICAgIHRoaXMucHJlbG9hZExpbmtDaGVja2VyLmNyZWF0ZVByZWxvYWRMaW5rVGFnKFxuICAgICAgICAgIHRoaXMucmVuZGVyZXIsIHJld3JpdHRlblNyYywgcmV3cml0dGVuU3Jjc2V0LCB0aGlzLnNpemVzKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UodGhpcywgY2hhbmdlcywgW1xuICAgICAgICAnbmdTcmMnLFxuICAgICAgICAnbmdTcmNzZXQnLFxuICAgICAgICAnd2lkdGgnLFxuICAgICAgICAnaGVpZ2h0JyxcbiAgICAgICAgJ3ByaW9yaXR5JyxcbiAgICAgICAgJ2ZpbGwnLFxuICAgICAgICAnbG9hZGluZycsXG4gICAgICAgICdzaXplcycsXG4gICAgICAgICdsb2FkZXJQYXJhbXMnLFxuICAgICAgICAnZGlzYWJsZU9wdGltaXplZFNyY3NldCcsXG4gICAgICBdKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNhbGxJbWFnZUxvYWRlcihjb25maWdXaXRob3V0Q3VzdG9tUGFyYW1zOiBPbWl0PEltYWdlTG9hZGVyQ29uZmlnLCAnbG9hZGVyUGFyYW1zJz4pOlxuICAgICAgc3RyaW5nIHtcbiAgICBsZXQgYXVnbWVudGVkQ29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZyA9IGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM7XG4gICAgaWYgKHRoaXMubG9hZGVyUGFyYW1zKSB7XG4gICAgICBhdWdtZW50ZWRDb25maWcubG9hZGVyUGFyYW1zID0gdGhpcy5sb2FkZXJQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmltYWdlTG9hZGVyKGF1Z21lbnRlZENvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLmxvYWRpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9hZGluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGlmICghdGhpcy5fcmVuZGVyZWRTcmMpIHtcbiAgICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMubmdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IHRoaXMuY2FsbEltYWdlTG9hZGVyKGltZ0NvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlZFNyYztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qgd2lkdGhTcmNTZXQgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHRoaXMubmdTcmNzZXQpO1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IHRoaXMubmdTcmNzZXQuc3BsaXQoJywnKS5maWx0ZXIoc3JjID0+IHNyYyAhPT0gJycpLm1hcChzcmNTdHIgPT4ge1xuICAgICAgc3JjU3RyID0gc3JjU3RyLnRyaW0oKTtcbiAgICAgIGNvbnN0IHdpZHRoID0gd2lkdGhTcmNTZXQgPyBwYXJzZUZsb2F0KHNyY1N0cikgOiBwYXJzZUZsb2F0KHNyY1N0cikgKiB0aGlzLndpZHRoITtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aH0pfSAke3NyY1N0cn1gO1xuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QXV0b21hdGljU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlc3BvbnNpdmVTcmNzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWRTcmNzZXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFJlc3BvbnNpdmVTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB7YnJlYWtwb2ludHN9ID0gdGhpcy5jb25maWc7XG5cbiAgICBsZXQgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzITtcbiAgICBpZiAodGhpcy5zaXplcz8udHJpbSgpID09PSAnMTAwdncnKSB7XG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgZnVsbC1zY3JlZW4td2lkdGggaW1hZ2UsIG91ciBzcmNzZXQgb25seSBuZWVkcyB0byBpbmNsdWRlXG4gICAgICAvLyBicmVha3BvaW50cyB3aXRoIGZ1bGwgdmlld3BvcnQgd2lkdGhzLlxuICAgICAgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzIS5maWx0ZXIoYnAgPT4gYnAgPj0gVklFV1BPUlRfQlJFQUtQT0lOVF9DVVRPRkYpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmFsU3JjcyA9IGZpbHRlcmVkQnJlYWtwb2ludHMubWFwKFxuICAgICAgICBicCA9PiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aDogYnB9KX0gJHticH13YCk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGaXhlZFNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTLm1hcChtdWx0aXBsaWVyID0+IGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IHRoaXMubmdTcmMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGghICogbXVsdGlwbGllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX0gJHttdWx0aXBsaWVyfXhgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5fZGlzYWJsZU9wdGltaXplZFNyY3NldCAmJiAhdGhpcy5zcmNzZXQgJiYgdGhpcy5pbWFnZUxvYWRlciAhPT0gbm9vcEltYWdlTG9hZGVyICYmXG4gICAgICAgICEodGhpcy53aWR0aCEgPiBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgfHwgdGhpcy5oZWlnaHQhID4gRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVCk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZW5kZXJlZFNyYyAhPT0gbnVsbCAmJiB0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3JlbmRlcmVkU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8qKlxuICogQ29udmVydCBpbnB1dCB2YWx1ZSB0byBpbnRlZ2VyLlxuICovXG5mdW5jdGlvbiBpbnB1dFRvSW50ZWdlcih2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogdmFsdWU7XG59XG5cbi8qKlxuICogQ29udmVydCBpbnB1dCB2YWx1ZSB0byBib29sZWFuLlxuICovXG5mdW5jdGlvbiBpbnB1dFRvQm9vbGVhbih2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBgJHt2YWx1ZX1gICE9PSAnZmFsc2UnO1xufVxuXG4vKipcbiAqIFNvcnRzIHByb3ZpZGVkIGNvbmZpZyBicmVha3BvaW50cyBhbmQgdXNlcyBkZWZhdWx0cy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0NvbmZpZyhjb25maWc6IEltYWdlQ29uZmlnKTogSW1hZ2VDb25maWcge1xuICBsZXQgc29ydGVkQnJlYWtwb2ludHM6IHticmVha3BvaW50cz86IG51bWJlcltdfSA9IHt9O1xuICBpZiAoY29uZmlnLmJyZWFrcG9pbnRzKSB7XG4gICAgc29ydGVkQnJlYWtwb2ludHMuYnJlYWtwb2ludHMgPSBjb25maWcuYnJlYWtwb2ludHMuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICB9XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0Q29uZmlnLCBjb25maWcsIHNvcnRlZEJyZWFrcG9pbnRzKTtcbn1cblxuLyoqKioqIEFzc2VydCBmdW5jdGlvbnMgKioqKiovXG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3JjYCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3JjKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ19BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3JjXFxgIGFuZCBcXGBuZ1NyY1xcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBzZXRzIFxcYHNyY1xcYCBpdHNlbGYgYmFzZWQgb24gdGhlIHZhbHVlIG9mIFxcYG5nU3JjXFxgLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY3NldGAgc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNTRVRfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY3NldFxcYCBhbmQgXFxgbmdTcmNzZXRcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNzZXRcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBgICtcbiAgICAgICAgICAgIGBcXGBuZ1NyY3NldFxcYC4gVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG5nU3JjID0gZGlyLm5nU3JjLnRyaW0oKTtcbiAgaWYgKG5nU3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAobmdTcmMubGVuZ3RoID4gQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSB7XG4gICAgICBuZ1NyYyA9IG5nU3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgbmdTcmNcXGAgaXMgYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgYCArXG4gICAgICAgICAgICBgKCR7bmdTcmN9KS4gTmdPcHRpbWl6ZWRJbWFnZSBkb2VzIG5vdCBzdXBwb3J0IEJhc2U2NC1lbmNvZGVkIHN0cmluZ3MuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHN0YW5kYXJkIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlICdzaXplcycgb25seSBpbmNsdWRlcyByZXNwb25zaXZlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db21wbGV4U2l6ZXMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBzaXplcyA9IGRpci5zaXplcztcbiAgaWYgKHNpemVzPy5tYXRjaCgvKChcXCl8LClcXHN8XilcXGQrcHgvKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgc2l6ZXNcXGAgd2FzIHNldCB0byBhIHN0cmluZyBpbmNsdWRpbmcgYCArXG4gICAgICAgICAgICBgcGl4ZWwgdmFsdWVzLiBGb3IgYXV0b21hdGljIFxcYHNyY3NldFxcYCBnZW5lcmF0aW9uLCBcXGBzaXplc1xcYCBtdXN0IG9ubHkgaW5jbHVkZSByZXNwb25zaXZlIGAgK1xuICAgICAgICAgICAgYHZhbHVlcywgc3VjaCBhcyBcXGBzaXplcz1cIjUwdndcIlxcYCBvciBcXGBzaXplcz1cIihtaW4td2lkdGg6IDc2OHB4KSA1MHZ3LCAxMDB2d1wiXFxgLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgbW9kaWZ5IHRoZSBcXGBzaXplc1xcYCBhdHRyaWJ1dGUsIG9yIHByb3ZpZGUgeW91ciBvd24gXFxgbmdTcmNzZXRcXGAgdmFsdWUgZGlyZWN0bHkuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCbG9iVXJsKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBjb25zdCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3JjXFxgIHdhcyBzZXQgdG8gYSBibG9iIFVSTCAoJHtuZ1NyY30pLiBgICtcbiAgICAgICAgICAgIGBCbG9iIFVSTHMgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgICAgIGBieSByZW1vdmluZyBcXGBuZ1NyY1xcYCBhbmQgdXNpbmcgYSByZWd1bGFyIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGlucHV0IGlzIHNldCB0byBhIG5vbi1lbXB0eSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke25hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIGAgK1xuICAgICAgICAgICAgYChcXGAke3ZhbHVlfVxcYCkuIFRvIGZpeCB0aGlzLCBjaGFuZ2UgdGhlIHZhbHVlIHRvIGEgbm9uLWVtcHR5IHN0cmluZy5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY3NldGAgaXMgaW4gYSB2YWxpZCBmb3JtYXQsIGUuZy4gXCIxMDB3LCAyMDB3XCIgb3IgXCIxeCwgMnhcIi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkTmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogdW5rbm93bikge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuO1xuICBhc3NlcnROb25FbXB0eUlucHV0KGRpciwgJ25nU3Jjc2V0JywgdmFsdWUpO1xuICBjb25zdCBzdHJpbmdWYWwgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gIGNvbnN0IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG4gIGNvbnN0IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvciA9IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuXG4gIGlmIChpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IpIHtcbiAgICBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyLCBzdHJpbmdWYWwpO1xuICB9XG5cbiAgY29uc3QgaXNWYWxpZFNyY3NldCA9IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgfHwgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yO1xuICBpZiAoIWlzVmFsaWRTcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNzZXRcXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgKFxcYCR7dmFsdWV9XFxgKS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBcXGBuZ1NyY3NldFxcYCB1c2luZyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG9uZSBvciBtb3JlIHdpZHRoIGAgK1xuICAgICAgICAgICAgYGRlc2NyaXB0b3JzIChlLmcuIFwiMTAwdywgMjAwd1wiKSBvciBkZW5zaXR5IGRlc2NyaXB0b3JzIChlLmcuIFwiMXgsIDJ4XCIpLmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiBzdHJpbmcpIHtcbiAgY29uc3QgdW5kZXJEZW5zaXR5Q2FwID1cbiAgICAgIHZhbHVlLnNwbGl0KCcsJykuZXZlcnkobnVtID0+IG51bSA9PT0gJycgfHwgcGFyc2VGbG9hdChudW0pIDw9IEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUCk7XG4gIGlmICghdW5kZXJEZW5zaXR5Q2FwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtcbiAgICAgICAgICAgIGltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICAgICAgZGlyLm5nU3JjKX0gdGhlIFxcYG5nU3Jjc2V0XFxgIGNvbnRhaW5zIGFuIHVuc3VwcG9ydGVkIGltYWdlIGRlbnNpdHk6YCArXG4gICAgICAgICAgICBgXFxgJHt2YWx1ZX1cXGAuIE5nT3B0aW1pemVkSW1hZ2UgZ2VuZXJhbGx5IHJlY29tbWVuZHMgYSBtYXggaW1hZ2UgZGVuc2l0eSBvZiBgICtcbiAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGJ1dCBzdXBwb3J0cyBpbWFnZSBkZW5zaXRpZXMgdXAgdG8gYCArXG4gICAgICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eC4gVGhlIGh1bWFuIGV5ZSBjYW5ub3QgZGlzdGluZ3Vpc2ggYmV0d2VlbiBpbWFnZSBkZW5zaXRpZXMgYCArXG4gICAgICAgICAgICBgZ3JlYXRlciB0aGFuICR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggLSB3aGljaCBtYWtlcyB0aGVtIHVubmVjZXNzYXJ5IGZvciBgICtcbiAgICAgICAgICAgIGBtb3N0IHVzZSBjYXNlcy4gSW1hZ2VzIHRoYXQgd2lsbCBiZSBwaW5jaC16b29tZWQgYXJlIHR5cGljYWxseSB0aGUgcHJpbWFyeSB1c2UgY2FzZSBmb3IgYCArXG4gICAgICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eCBpbWFnZXMuIFBsZWFzZSByZW1vdmUgdGhlIGhpZ2ggZGVuc2l0eSBkZXNjcmlwdG9yIGFuZCB0cnkgYWdhaW4uYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4gKiB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbiAqL1xuZnVuY3Rpb24gcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXROYW1lOiBzdHJpbmcpOiB7fSB7XG4gIGxldCByZWFzb24hOiBzdHJpbmc7XG4gIGlmIChpbnB1dE5hbWUgPT09ICd3aWR0aCcgfHwgaW5wdXROYW1lID09PSAnaGVpZ2h0Jykge1xuICAgIHJlYXNvbiA9IGBDaGFuZ2luZyBcXGAke2lucHV0TmFtZX1cXGAgbWF5IHJlc3VsdCBpbiBkaWZmZXJlbnQgYXR0cmlidXRlIHZhbHVlIGAgK1xuICAgICAgICBgYXBwbGllZCB0byB0aGUgdW5kZXJseWluZyBpbWFnZSBlbGVtZW50IGFuZCBjYXVzZSBsYXlvdXQgc2hpZnRzIG9uIGEgcGFnZS5gO1xuICB9IGVsc2Uge1xuICAgIHJlYXNvbiA9IGBDaGFuZ2luZyB0aGUgXFxgJHtpbnB1dE5hbWV9XFxgIHdvdWxkIGhhdmUgbm8gZWZmZWN0IG9uIHRoZSB1bmRlcmx5aW5nIGAgK1xuICAgICAgICBgaW1hZ2UgZWxlbWVudCwgYmVjYXVzZSB0aGUgcmVzb3VyY2UgbG9hZGluZyBoYXMgYWxyZWFkeSBvY2N1cnJlZC5gO1xuICB9XG4gIHJldHVybiBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX0lOUFVUX0NIQU5HRSxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIHdhcyB1cGRhdGVkIGFmdGVyIGluaXRpYWxpemF0aW9uLiBgICtcbiAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgbm90IHJlYWN0IHRvIHRoaXMgaW5wdXQgY2hhbmdlLiAke3JlYXNvbn0gYCArXG4gICAgICAgICAgYFRvIGZpeCB0aGlzLCBlaXRoZXIgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCB0byBhIHN0YXRpYyB2YWx1ZSBgICtcbiAgICAgICAgICBgb3Igd3JhcCB0aGUgaW1hZ2UgZWxlbWVudCBpbiBhbiAqbmdJZiB0aGF0IGlzIGdhdGVkIG9uIHRoZSBuZWNlc3NhcnkgdmFsdWUuYCk7XG59XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgbm9uZSBvZiB0aGUgbGlzdGVkIGlucHV0cyBoYXMgY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgY2hhbmdlczogU2ltcGxlQ2hhbmdlcywgaW5wdXRzOiBzdHJpbmdbXSkge1xuICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICduZ1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYG5nU3JjYCBpbnB1dCBjaGFuZ2VzLCB3ZSBkZXRlY3QgdGhhdCBvbmx5IGluIHRoZVxuICAgICAgICAvLyBgbmdPbkNoYW5nZXNgIGhvb2ssIHRodXMgdGhlIGBuZ1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgbmdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtuZ1NyYzogY2hhbmdlc1tpbnB1dF0ucHJldmlvdXNWYWx1ZX0gYXMgTmdPcHRpbWl6ZWRJbWFnZTtcbiAgICAgIH1cbiAgICAgIHRocm93IHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXIsIGlucHV0KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEdyZWF0ZXJUaGFuWmVybyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHZhbGlkTnVtYmVyID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInICYmIGlucHV0VmFsdWUgPiAwO1xuICBjb25zdCB2YWxpZFN0cmluZyA9XG4gICAgICB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkgJiYgcGFyc2VJbnQoaW5wdXRWYWx1ZSkgPiAwO1xuICBpZiAoIXZhbGlkTnVtYmVyICYmICF2YWxpZFN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgICAgICBgKFxcYCR7aW5wdXRWYWx1ZX1cXGApLiBUbyBmaXggdGhpcywgcHJvdmlkZSBcXGAke2lucHV0TmFtZX1cXGAgYCArXG4gICAgICAgICAgICBgYXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IHJlbW92ZUxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGltZyk7XG4gICAgbGV0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSk7XG4gICAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcbiAgICBjb25zdCBib3hTaXppbmcgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2JveC1zaXppbmcnKTtcblxuICAgIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdSaWdodCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpO1xuICAgICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1ib3R0b20nKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdMZWZ0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKTtcbiAgICAgIHJlbmRlcmVkV2lkdGggLT0gcGFyc2VGbG9hdChwYWRkaW5nUmlnaHQpICsgcGFyc2VGbG9hdChwYWRkaW5nTGVmdCk7XG4gICAgICByZW5kZXJlZEhlaWdodCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChwYWRkaW5nQm90dG9tKTtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBpbWcubmF0dXJhbFdpZHRoO1xuICAgIGNvbnN0IGludHJpbnNpY0hlaWdodCA9IGltZy5uYXR1cmFsSGVpZ2h0O1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPSBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuXG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIGltYWdlIGRvZXMgbm90IG1hdGNoIGAgK1xuICAgICAgICAgICAgICBgdGhlIGFzcGVjdCByYXRpbyBpbmRpY2F0ZWQgYnkgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICByb3VuZChpbnRyaW5zaWNBc3BlY3RSYXRpbyl9KS4gXFxuU3VwcGxpZWQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzOiBgICtcbiAgICAgICAgICAgICAgYCR7c3VwcGxpZWRXaWR0aH13IHggJHtzdXBwbGllZEhlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICByb3VuZChzdXBwbGllZEFzcGVjdFJhdGlvKX0pLiBgICtcbiAgICAgICAgICAgICAgYFxcblRvIGZpeCB0aGlzLCB1cGRhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy5gKSk7XG4gICAgfSBlbHNlIGlmIChzdHlsaW5nRGlzdG9ydGlvbikge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBgICtcbiAgICAgICAgICAgICAgYGRvZXMgbm90IG1hdGNoIHRoZSBpbWFnZSdzIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIGAgK1xuICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKGludHJpbnNpY0FzcGVjdFJhdGlvKX0pLiBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiBgICtcbiAgICAgICAgICAgICAgYCR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oIChhc3BlY3QtcmF0aW86IGAgK1xuICAgICAgICAgICAgICBgJHtyb3VuZChyZW5kZXJlZEFzcGVjdFJhdGlvKX0pLiBcXG5UaGlzIGlzc3VlIGNhbiBvY2N1ciBpZiBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYCArXG4gICAgICAgICAgICAgIGBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhbiBpbWFnZSB3aXRob3V0IHVwZGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nIGAgK1xuICAgICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgICAgYGFkZGluZyBcImhlaWdodDogYXV0b1wiIG9yIFwid2lkdGg6IGF1dG9cIiB0byB0aGUgaW1hZ2Ugc3R5bGluZyB3aWxsIGZpeCBgICtcbiAgICAgICAgICAgICAgYHRoaXMgaXNzdWUuYCkpO1xuICAgIH0gZWxzZSBpZiAoIWRpci5uZ1NyY3NldCAmJiBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zKSB7XG4gICAgICAvLyBJZiBgbmdTcmNzZXRgIGhhc24ndCBiZWVuIHNldCwgc2FuaXR5IGNoZWNrIHRoZSBpbnRyaW5zaWMgc2l6ZS5cbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZFdpZHRoO1xuICAgICAgY29uc3QgcmVjb21tZW5kZWRIZWlnaHQgPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZEhlaWdodDtcbiAgICAgIGNvbnN0IG92ZXJzaXplZFdpZHRoID0gKGludHJpbnNpY1dpZHRoIC0gcmVjb21tZW5kZWRXaWR0aCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGNvbnN0IG92ZXJzaXplZEhlaWdodCA9IChpbnRyaW5zaWNIZWlnaHQgLSByZWNvbW1lbmRlZEhlaWdodCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGlmIChvdmVyc2l6ZWRXaWR0aCB8fCBvdmVyc2l6ZWRIZWlnaHQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX0lNQUdFLFxuICAgICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaW50cmluc2ljIGltYWdlIGlzIHNpZ25pZmljYW50bHkgYCArXG4gICAgICAgICAgICAgICAgYGxhcmdlciB0aGFuIG5lY2Vzc2FyeS4gYCArXG4gICAgICAgICAgICAgICAgYFxcblJlbmRlcmVkIGltYWdlIHNpemU6ICR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtyZWNvbW1lbmRlZFdpZHRofXcgeCAke1xuICAgICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuTm90ZTogUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemUgaXMgY2FsY3VsYXRlZCBhc3N1bWluZyBhIG1heGltdW0gRFBSIG9mIGAgK1xuICAgICAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH0uIFRvIGltcHJvdmUgbG9hZGluZyB0aW1lLCByZXNpemUgdGhlIGltYWdlIGAgK1xuICAgICAgICAgICAgICAgIGBvciBjb25zaWRlciB1c2luZyB0aGUgXCJuZ1NyY3NldFwiIGFuZCBcInNpemVzXCIgYXR0cmlidXRlcy5gKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG1pc3NpbmdBdHRyaWJ1dGVzID0gW107XG4gIGlmIChkaXIud2lkdGggPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnd2lkdGgnKTtcbiAgaWYgKGRpci5oZWlnaHQgPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnaGVpZ2h0Jyk7XG4gIGlmIChtaXNzaW5nQXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZXNlIHJlcXVpcmVkIGF0dHJpYnV0ZXMgYCArXG4gICAgICAgICAgICBgYXJlIG1pc3Npbmc6ICR7bWlzc2luZ0F0dHJpYnV0ZXMubWFwKGF0dHIgPT4gYFwiJHthdHRyfVwiYCkuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgICAgYEluY2x1ZGluZyBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyB3aWxsIHByZXZlbnQgaW1hZ2UtcmVsYXRlZCBsYXlvdXQgc2hpZnRzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgaW5jbHVkZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyBvbiB0aGUgaW1hZ2UgdGFnIG9yIHR1cm4gb24gYCArXG4gICAgICAgICAgICBgXCJmaWxsXCIgbW9kZSB3aXRoIHRoZSBcXGBmaWxsXFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgd2lkdGggYW5kIGhlaWdodCBhcmUgbm90IHNldC4gVXNlZCBpbiBmaWxsIG1vZGUsIHdoZXJlIHRob3NlIGF0dHJpYnV0ZXMgZG9uJ3QgbWFrZVxuICogc2Vuc2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIud2lkdGggfHwgZGlyLmhlaWdodCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5uZ1NyYyl9IHRoZSBhdHRyaWJ1dGVzIFxcYGhlaWdodFxcYCBhbmQvb3IgXFxgd2lkdGhcXGAgYXJlIHByZXNlbnQgYCArXG4gICAgICAgICAgICBgYWxvbmcgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuIEJlY2F1c2UgXFxgZmlsbFxcYCBtb2RlIGNhdXNlcyBhbiBpbWFnZSB0byBmaWxsIGl0cyBjb250YWluaW5nIGAgK1xuICAgICAgICAgICAgYGVsZW1lbnQsIHRoZSBzaXplIGF0dHJpYnV0ZXMgaGF2ZSBubyBlZmZlY3QgYW5kIHNob3VsZCBiZSByZW1vdmVkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgcmVuZGVyZWQgaW1hZ2UgaGFzIGEgbm9uemVybyBoZWlnaHQuIElmIHRoZSBpbWFnZSBpcyBpbiBmaWxsIG1vZGUsIHByb3ZpZGVzXG4gKiBndWlkYW5jZSB0aGF0IHRoaXMgY2FuIGJlIGNhdXNlZCBieSB0aGUgY29udGFpbmluZyBlbGVtZW50J3MgQ1NTIHBvc2l0aW9uIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25aZXJvUmVuZGVyZWRIZWlnaHQoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHJlbmRlcmVyOiBSZW5kZXJlcjIpIHtcbiAgY29uc3QgcmVtb3ZlTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCByZW5kZXJlZEhlaWdodCA9IGltZy5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKGRpci5maWxsICYmIHJlbmRlcmVkSGVpZ2h0ID09PSAwKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBoZWlnaHQgb2YgdGhlIGZpbGwtbW9kZSBpbWFnZSBpcyB6ZXJvLiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgbGlrZWx5IGJlY2F1c2UgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgICAgYHByb3BlcnR5IHNldCB0byBvbmUgb2YgdGhlIGZvbGxvd2luZzogXCJyZWxhdGl2ZVwiLCBcImZpeGVkXCIsIG9yIFwiYWJzb2x1dGVcIi4gYCArXG4gICAgICAgICAgICAgIGBUbyBmaXggdGhpcyBwcm9ibGVtLCBtYWtlIHN1cmUgdGhlIGNvbnRhaW5lciBlbGVtZW50IGhhcyB0aGUgQ1NTICdwb3NpdGlvbicgYCArXG4gICAgICAgICAgICAgIGBwcm9wZXJ0eSBkZWZpbmVkIGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50IGlzIG5vdCB6ZXJvLmApKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBsb2FkaW5nYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGEgdmFsaWQgaW5wdXQgJlxuICogaXMgbm90IHVzZWQgb24gcHJpb3JpdHkgaW1hZ2VzLlxuICovXG5mdW5jdGlvbiBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5sb2FkaW5nICYmIGRpci5wcmlvcml0eSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgd2FzIHVzZWQgb24gYW4gaW1hZ2UgdGhhdCB3YXMgbWFya2VkIFwicHJpb3JpdHlcIi4gYCArXG4gICAgICAgICAgICBgU2V0dGluZyBcXGBsb2FkaW5nXFxgIG9uIHByaW9yaXR5IGltYWdlcyBpcyBub3QgYWxsb3dlZCBgICtcbiAgICAgICAgICAgIGBiZWNhdXNlIHRoZXNlIGltYWdlcyB3aWxsIGFsd2F5cyBiZSBlYWdlcmx5IGxvYWRlZC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHJlbW92ZSB0aGUg4oCcbG9hZGluZ+KAnSBhdHRyaWJ1dGUgZnJvbSB0aGUgcHJpb3JpdHkgaW1hZ2UuYCk7XG4gIH1cbiAgY29uc3QgdmFsaWRJbnB1dHMgPSBbJ2F1dG8nLCAnZWFnZXInLCAnbGF6eSddO1xuICBpZiAodHlwZW9mIGRpci5sb2FkaW5nID09PSAnc3RyaW5nJyAmJiAhdmFsaWRJbnB1dHMuaW5jbHVkZXMoZGlyLmxvYWRpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHtkaXIubG9hZGluZ31cXGApLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIHZhbGlkIHZhbHVlIChcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIikuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBOT1QgdXNpbmcgYSBsb2FkZXIgKGZhbGxpbmcgYmFjayB0byB0aGUgZ2VuZXJpYyBsb2FkZXIpIGFuZFxuICogdGhlIGltYWdlIGFwcGVhcnMgdG8gYmUgaG9zdGVkIG9uIG9uZSBvZiB0aGUgaW1hZ2UgQ0ROcyBmb3Igd2hpY2hcbiAqIHdlIGRvIGhhdmUgYSBidWlsdC1pbiBpbWFnZSBsb2FkZXIuIFN1Z2dlc3RzIHN3aXRjaGluZyB0byB0aGVcbiAqIGJ1aWx0LWluIGxvYWRlci5cbiAqXG4gKiBAcGFyYW0gbmdTcmMgVmFsdWUgb2YgdGhlIG5nU3JjIGF0dHJpYnV0ZVxuICogQHBhcmFtIGltYWdlTG9hZGVyIEltYWdlTG9hZGVyIHByb3ZpZGVkXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdE1pc3NpbmdCdWlsdEluTG9hZGVyKG5nU3JjOiBzdHJpbmcsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGxldCBidWlsdEluTG9hZGVyTmFtZSA9ICcnO1xuICAgIGZvciAoY29uc3QgbG9hZGVyIG9mIEJVSUxUX0lOX0xPQURFUlMpIHtcbiAgICAgIGlmIChsb2FkZXIudGVzdFVybChuZ1NyYykpIHtcbiAgICAgICAgYnVpbHRJbkxvYWRlck5hbWUgPSBsb2FkZXIubmFtZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChidWlsdEluTG9hZGVyTmFtZSkge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfQlVJTFRJTl9MT0FERVIsXG4gICAgICAgICAgYE5nT3B0aW1pemVkSW1hZ2U6IEl0IGxvb2tzIGxpa2UgeW91ciBpbWFnZXMgbWF5IGJlIGhvc3RlZCBvbiB0aGUgYCArXG4gICAgICAgICAgICAgIGAke2J1aWx0SW5Mb2FkZXJOYW1lfSBDRE4sIGJ1dCB5b3VyIGFwcCBpcyBub3QgdXNpbmcgQW5ndWxhcidzIGAgK1xuICAgICAgICAgICAgICBgYnVpbHQtaW4gbG9hZGVyIGZvciB0aGF0IENETi4gV2UgcmVjb21tZW5kIHN3aXRjaGluZyB0byB1c2UgYCArXG4gICAgICAgICAgICAgIGB0aGUgYnVpbHQtaW4gYnkgY2FsbGluZyBcXGBwcm92aWRlJHtidWlsdEluTG9hZGVyTmFtZX1Mb2FkZXIoKVxcYCBgICtcbiAgICAgICAgICAgICAgYGluIHlvdXIgXFxgcHJvdmlkZXJzXFxgIGFuZCBwYXNzaW5nIGl0IHlvdXIgaW5zdGFuY2UncyBiYXNlIFVSTC4gYCArXG4gICAgICAgICAgICAgIGBJZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGJ1aWx0LWluIGxvYWRlciwgZGVmaW5lIGEgY3VzdG9tIGAgK1xuICAgICAgICAgICAgICBgbG9hZGVyIGZ1bmN0aW9uIHVzaW5nIElNQUdFX0xPQURFUiB0byBzaWxlbmNlIHRoaXMgd2FybmluZy5gKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgbmdTcmNzZXQgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLm5nU3Jjc2V0ICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgYXR0cmlidXRlIGlzIHByZXNlbnQgYnV0IGAgK1xuICAgICAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgICAgICBgd2hpY2ggd291bGQgcmVzdWx0IGluIHRoZSBzYW1lIGltYWdlIGJlaW5nIHVzZWQgZm9yIGFsbCBjb25maWd1cmVkIHNpemVzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBsb2FkZXJQYXJhbXMgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nXG4gKiB1c2VkKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Mb2FkZXJQYXJhbXNXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIubG9hZGVyUGFyYW1zICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICAgICAgYHdoaWNoIG1lYW5zIHRoYXQgdGhlIGxvYWRlclBhcmFtcyBkYXRhIHdpbGwgbm90IGJlIGNvbnN1bWVkIGFuZCB3aWxsIG5vdCBhZmZlY3QgdGhlIFVSTC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBjdXN0b20gbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gKSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiByb3VuZChpbnB1dDogbnVtYmVyKTogbnVtYmVyfHN0cmluZyB7XG4gIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSA/IGlucHV0IDogaW5wdXQudG9GaXhlZCgyKTtcbn1cbiJdfQ==