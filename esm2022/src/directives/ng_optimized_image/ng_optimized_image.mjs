/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { booleanAttribute, Directive, ElementRef, inject, Injector, Input, NgZone, numberAttribute, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS, ɵperformanceMarkFeature as performanceMarkFeature, ɵRuntimeError as RuntimeError, ɵunwrapSafeValue as unwrapSafeValue, ChangeDetectorRef, ApplicationRef, ɵwhenStable as whenStable, } from '@angular/core';
import { isPlatformServer } from '../../platform_id';
import { imgDirectiveDetails } from './error_helper';
import { cloudinaryLoaderInfo } from './image_loaders/cloudinary_loader';
import { IMAGE_LOADER, noopImageLoader, } from './image_loaders/image_loader';
import { imageKitLoaderInfo } from './image_loaders/imagekit_loader';
import { imgixLoaderInfo } from './image_loaders/imgix_loader';
import { netlifyLoaderInfo } from './image_loaders/netlify_loader';
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
const ASPECT_RATIO_TOLERANCE = 0.1;
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
/**
 * Default blur radius of the CSS filter used on placeholder images, in pixels
 */
export const PLACEHOLDER_BLUR_AMOUNT = 15;
/**
 * Placeholder dimension (height or width) limit in pixels. Angular produces a warning
 * when this limit is crossed.
 */
const PLACEHOLDER_DIMENSION_LIMIT = 1000;
/**
 * Used to warn or error when the user provides an overly large dataURL for the placeholder
 * attribute.
 * Character count of Base64 images is 1 character per byte, and base64 encoding is approximately
 * 33% larger than base images, so 4000 characters is around 3KB on disk and 10000 characters is
 * around 7.7KB. Experimentally, 4000 characters is about 20x20px in PNG or medium-quality JPEG
 * format, and 10,000 is around 50x50px, but there's quite a bit of variation depending on how the
 * image is saved.
 */
export const DATA_URL_WARN_LIMIT = 4000;
export const DATA_URL_ERROR_LIMIT = 10000;
/** Info about built-in loaders we can test for. */
export const BUILT_IN_LOADERS = [
    imgixLoaderInfo,
    imageKitLoaderInfo,
    cloudinaryLoaderInfo,
    netlifyLoaderInfo,
];
/**
 * Threshold for the PRIORITY_TRUE_COUNT
 */
const PRIORITY_COUNT_THRESHOLD = 10;
/**
 * This count is used to log a devMode warning
 * when the count of directive instances with priority=true
 * exceeds the threshold PRIORITY_COUNT_THRESHOLD
 */
let IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
/**
 * This function is for testing purpose.
 */
export function resetImagePriorityCount() {
    IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
}
/**
 * Directive that improves image loading performance by enforcing best practices.
 *
 * `NgOptimizedImage` ensures that the loading of the Largest Contentful Paint (LCP) image is
 * prioritized by:
 * - Automatically setting the `fetchpriority` attribute on the `<img>` tag
 * - Lazy loading non-priority images by default
 * - Automatically generating a preconnect link tag in the document head
 *
 * In addition, the directive:
 * - Generates appropriate asset URLs if a corresponding `ImageLoader` function is provided
 * - Automatically generates a srcset
 * - Requires that `width` and `height` are set
 * - Warns if `width` or `height` have been set incorrectly
 * - Warns if the image will be visually distorted when rendered
 *
 * @usageNotes
 * The `NgOptimizedImage` directive is marked as [standalone](guide/components/importing) and can
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
export class NgOptimizedImage {
    constructor() {
        this.imageLoader = inject(IMAGE_LOADER);
        this.config = processConfig(inject(IMAGE_CONFIG));
        this.renderer = inject(Renderer2);
        this.imgElement = inject(ElementRef).nativeElement;
        this.injector = inject(Injector);
        this.isServer = isPlatformServer(inject(PLATFORM_ID));
        this.preloadLinkCreator = inject(PreloadLinkCreator);
        // a LCP image observer - should be injected only in the dev mode
        this.lcpObserver = ngDevMode ? this.injector.get(LCPImageObserver) : null;
        /**
         * Calculate the rewritten `src` once and store it.
         * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
         * `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
         * instance that might be already destroyed).
         */
        this._renderedSrc = null;
        /**
         * Indicates whether this image should have a high priority.
         */
        this.priority = false;
        /**
         * Disables automatic srcset generation for this image.
         */
        this.disableOptimizedSrcset = false;
        /**
         * Sets the image to "fill mode", which eliminates the height/width requirement and adds
         * styles such that the image fills its containing element.
         */
        this.fill = false;
    }
    /** @nodoc */
    ngOnInit() {
        performanceMarkFeature('NgOptimizedImage');
        if (ngDevMode) {
            const ngZone = this.injector.get(NgZone);
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
                // This leaves the Angular zone to avoid triggering unnecessary change detection cycles when
                // `load` tasks are invoked on images.
                ngZone.runOutsideAngular(() => assertNonZeroRenderedHeight(this, this.imgElement, this.renderer));
            }
            else {
                assertNonEmptyWidthAndHeight(this);
                if (this.height !== undefined) {
                    assertGreaterThanZero(this, this.height, 'height');
                }
                if (this.width !== undefined) {
                    assertGreaterThanZero(this, this.width, 'width');
                }
                // Only check for distorted images when not in fill mode, where
                // images may be intentionally stretched, cropped or letterboxed.
                ngZone.runOutsideAngular(() => assertNoImageDistortion(this, this.imgElement, this.renderer));
            }
            assertValidLoadingInput(this);
            if (!this.ngSrcset) {
                assertNoComplexSizes(this);
            }
            assertValidPlaceholder(this, this.imageLoader);
            assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
            assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
            assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
            if (this.lcpObserver !== null) {
                const ngZone = this.injector.get(NgZone);
                ngZone.runOutsideAngular(() => {
                    this.lcpObserver.registerImage(this.getRewrittenSrc(), this.ngSrc, this.priority);
                });
            }
            if (this.priority) {
                const checker = this.injector.get(PreconnectLinkChecker);
                checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
                if (!this.isServer) {
                    const applicationRef = this.injector.get(ApplicationRef);
                    assetPriorityCountBelowThreshold(applicationRef);
                }
            }
        }
        if (this.placeholder) {
            this.removePlaceholderOnLoad(this.imgElement);
        }
        this.setHostAttributes();
    }
    setHostAttributes() {
        // Must set width/height explicitly in case they are bound (in which case they will
        // only be reflected and not found by the browser)
        if (this.fill) {
            this.sizes ||= '100vw';
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
        const rewrittenSrcset = this.updateSrcAndSrcset();
        if (this.sizes) {
            this.setHostAttribute('sizes', this.sizes);
        }
        if (this.isServer && this.priority) {
            this.preloadLinkCreator.createPreloadLinkTag(this.renderer, this.getRewrittenSrc(), rewrittenSrcset, this.sizes);
        }
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (ngDevMode) {
            assertNoPostInitInputChange(this, changes, [
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
        if (changes['ngSrc'] && !changes['ngSrc'].isFirstChange()) {
            const oldSrc = this._renderedSrc;
            this.updateSrcAndSrcset(true);
            const newSrc = this._renderedSrc;
            if (this.lcpObserver !== null && oldSrc && newSrc && oldSrc !== newSrc) {
                const ngZone = this.injector.get(NgZone);
                ngZone.runOutsideAngular(() => {
                    this.lcpObserver?.updateImage(oldSrc, newSrc);
                });
            }
        }
        if (ngDevMode && changes['placeholder']?.currentValue && !this.isServer) {
            assertPlaceholderDimensions(this, this.imgElement);
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
        const finalSrcs = this.ngSrcset
            .split(',')
            .filter((src) => src !== '')
            .map((srcStr) => {
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
            filteredBreakpoints = breakpoints.filter((bp) => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
        }
        const finalSrcs = filteredBreakpoints.map((bp) => `${this.callImageLoader({ src: this.ngSrc, width: bp })} ${bp}w`);
        return finalSrcs.join(', ');
    }
    updateSrcAndSrcset(forceSrcRecalc = false) {
        if (forceSrcRecalc) {
            // Reset cached value, so that the followup `getRewrittenSrc()` call
            // will recalculate it and update the cache.
            this._renderedSrc = null;
        }
        const rewrittenSrc = this.getRewrittenSrc();
        this.setHostAttribute('src', rewrittenSrc);
        let rewrittenSrcset = undefined;
        if (this.ngSrcset) {
            rewrittenSrcset = this.getRewrittenSrcset();
        }
        else if (this.shouldGenerateAutomaticSrcset()) {
            rewrittenSrcset = this.getAutomaticSrcset();
        }
        if (rewrittenSrcset) {
            this.setHostAttribute('srcset', rewrittenSrcset);
        }
        return rewrittenSrcset;
    }
    getFixedSrcset() {
        const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map((multiplier) => `${this.callImageLoader({
            src: this.ngSrc,
            width: this.width * multiplier,
        })} ${multiplier}x`);
        return finalSrcs.join(', ');
    }
    shouldGenerateAutomaticSrcset() {
        let oversizedImage = false;
        if (!this.sizes) {
            oversizedImage =
                this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
        }
        return (!this.disableOptimizedSrcset &&
            !this.srcset &&
            this.imageLoader !== noopImageLoader &&
            !oversizedImage);
    }
    /**
     * Returns an image url formatted for use with the CSS background-image property. Expects one of:
     * * A base64 encoded image, which is wrapped and passed through.
     * * A boolean. If true, calls the image loader to generate a small placeholder url.
     */
    generatePlaceholder(placeholderInput) {
        const { placeholderResolution } = this.config;
        if (placeholderInput === true) {
            return `url(${this.callImageLoader({
                src: this.ngSrc,
                width: placeholderResolution,
                isPlaceholder: true,
            })})`;
        }
        else if (typeof placeholderInput === 'string') {
            return `url(${placeholderInput})`;
        }
        return null;
    }
    /**
     * Determines if blur should be applied, based on an optional boolean
     * property `blur` within the optional configuration object `placeholderConfig`.
     */
    shouldBlurPlaceholder(placeholderConfig) {
        if (!placeholderConfig || !placeholderConfig.hasOwnProperty('blur')) {
            return true;
        }
        return Boolean(placeholderConfig.blur);
    }
    removePlaceholderOnLoad(img) {
        const callback = () => {
            const changeDetectorRef = this.injector.get(ChangeDetectorRef);
            removeLoadListenerFn();
            removeErrorListenerFn();
            this.placeholder = false;
            changeDetectorRef.markForCheck();
        };
        const removeLoadListenerFn = this.renderer.listen(img, 'load', callback);
        const removeErrorListenerFn = this.renderer.listen(img, 'error', callback);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.6+sha-1391928", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.6+sha-1391928", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], placeholder: ["placeholder", "placeholder", booleanOrUrlAttribute], placeholderConfig: "placeholderConfig", src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0\" : null", "style.background-size": "placeholder ? \"cover\" : null", "style.background-position": "placeholder ? \"50% 50%\" : null", "style.background-repeat": "placeholder ? \"no-repeat\" : null", "style.background-image": "placeholder ? generatePlaceholder(placeholder) : null", "style.filter": "placeholder && shouldBlurPlaceholder(placeholderConfig) ? \"blur(15px)\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.6+sha-1391928", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[ngSrc]',
                    host: {
                        '[style.position]': 'fill ? "absolute" : null',
                        '[style.width]': 'fill ? "100%" : null',
                        '[style.height]': 'fill ? "100%" : null',
                        '[style.inset]': 'fill ? "0" : null',
                        '[style.background-size]': 'placeholder ? "cover" : null',
                        '[style.background-position]': 'placeholder ? "50% 50%" : null',
                        '[style.background-repeat]': 'placeholder ? "no-repeat" : null',
                        '[style.background-image]': 'placeholder ? generatePlaceholder(placeholder) : null',
                        '[style.filter]': `placeholder && shouldBlurPlaceholder(placeholderConfig) ? "blur(${PLACEHOLDER_BLUR_AMOUNT}px)" : null`,
                    },
                }]
        }], propDecorators: { ngSrc: [{
                type: Input,
                args: [{ required: true, transform: unwrapSafeUrl }]
            }], ngSrcset: [{
                type: Input
            }], sizes: [{
                type: Input
            }], width: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], height: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], loading: [{
                type: Input
            }], priority: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], loaderParams: [{
                type: Input
            }], disableOptimizedSrcset: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], fill: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], placeholder: [{
                type: Input,
                args: [{ transform: booleanOrUrlAttribute }]
            }], placeholderConfig: [{
                type: Input
            }], src: [{
                type: Input
            }], srcset: [{
                type: Input
            }] } });
/***** Helpers *****/
/**
 * Sorts provided config breakpoints and uses defaults.
 */
function processConfig(config) {
    let sortedBreakpoints = {};
    if (config.breakpoints) {
        sortedBreakpoints.breakpoints = config.breakpoints.sort((a, b) => a - b);
    }
    return Object.assign({}, IMAGE_CONFIG_DEFAULTS, config, sortedBreakpoints);
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
function assertValidPlaceholder(dir, imageLoader) {
    assertNoPlaceholderConfigWithoutPlaceholder(dir);
    assertNoRelativePlaceholderWithoutLoader(dir, imageLoader);
    assertNoOversizedDataUrl(dir);
}
/**
 * Verifies that placeholderConfig isn't being used without placeholder
 */
function assertNoPlaceholderConfigWithoutPlaceholder(dir) {
    if (dir.placeholderConfig && !dir.placeholder) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`placeholderConfig\` options were provided for an ` +
            `image that does not use the \`placeholder\` attribute, and will have no effect.`);
    }
}
/**
 * Warns if a relative URL placeholder is specified, but no loader is present to provide the small
 * image.
 */
function assertNoRelativePlaceholderWithoutLoader(dir, imageLoader) {
    if (dir.placeholder === true && imageLoader === noopImageLoader) {
        throw new RuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to true but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which would result in the same image being used for the primary image and its placeholder. ` +
            `To fix this, provide a loader or remove the \`placeholder\` attribute from the image.`);
    }
}
/**
 * Warns or throws an error if an oversized dataURL placeholder is provided.
 */
function assertNoOversizedDataUrl(dir) {
    if (dir.placeholder &&
        typeof dir.placeholder === 'string' &&
        dir.placeholder.startsWith('data:')) {
        if (dir.placeholder.length > DATA_URL_ERROR_LIMIT) {
            throw new RuntimeError(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
                `than ${DATA_URL_ERROR_LIMIT} characters. This is strongly discouraged, as large inline placeholders ` +
                `directly increase the bundle size of Angular and hurt page load performance. To fix this, generate ` +
                `a smaller data URL placeholder.`);
        }
        if (dir.placeholder.length > DATA_URL_WARN_LIMIT) {
            console.warn(formatRuntimeError(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
                `than ${DATA_URL_WARN_LIMIT} characters. This is discouraged, as large inline placeholders ` +
                `directly increase the bundle size of Angular and hurt page load performance. For better loading performance, ` +
                `generate a smaller data URL placeholder.`));
        }
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
    const underDensityCap = value
        .split(',')
        .every((num) => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
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
        reason =
            `Changing \`${inputName}\` may result in different attribute value ` +
                `applied to the underlying image element and cause layout shifts on a page.`;
    }
    else {
        reason =
            `Changing the \`${inputName}\` would have no effect on the underlying ` +
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
    inputs.forEach((input) => {
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
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value. ` +
            `To fix this, provide \`${inputName}\` as a number greater than 0.`);
    }
}
/**
 * Verifies that the rendered image is not visually distorted. Effectively this is checking:
 * - Whether the "width" and "height" attributes reflect the actual dimensions of the image.
 * - Whether image styling is "correct" (see below for a longer explanation).
 */
function assertNoImageDistortion(dir, img, renderer) {
    const removeLoadListenerFn = renderer.listen(img, 'load', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
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
            const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
            const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
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
    // We only listen to the `error` event to remove the `load` event listener because it will not be
    // fired if the image fails to load. This is done to prevent memory leaks in development mode
    // because image elements aren't garbage-collected properly. It happens because zone.js stores the
    // event listener directly on the element and closures capture `dir`.
    const removeErrorListenerFn = renderer.listen(img, 'error', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
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
            `are missing: ${missingAttributes.map((attr) => `"${attr}"`).join(', ')}. ` +
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
    const removeLoadListenerFn = renderer.listen(img, 'load', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
        const renderedHeight = img.clientHeight;
        if (dir.fill && renderedHeight === 0) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` +
                `This is likely because the containing element does not have the CSS 'position' ` +
                `property set to one of the following: "relative", "fixed", or "absolute". ` +
                `To fix this problem, make sure the container element has the CSS 'position' ` +
                `property defined and the height of the element is not zero.`));
        }
    });
    // See comments in the `assertNoImageDistortion`.
    const removeErrorListenerFn = renderer.listen(img, 'error', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
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
/**
 * Warns if the priority attribute is used too often on page load
 */
async function assetPriorityCountBelowThreshold(appRef) {
    if (IMGS_WITH_PRIORITY_ATTR_COUNT === 0) {
        IMGS_WITH_PRIORITY_ATTR_COUNT++;
        await whenStable(appRef);
        if (IMGS_WITH_PRIORITY_ATTR_COUNT > PRIORITY_COUNT_THRESHOLD) {
            console.warn(formatRuntimeError(2966 /* RuntimeErrorCode.TOO_MANY_PRIORITY_ATTRIBUTES */, `NgOptimizedImage: The "priority" attribute is set to true more than ${PRIORITY_COUNT_THRESHOLD} times (${IMGS_WITH_PRIORITY_ATTR_COUNT} times). ` +
                `Marking too many images as "high" priority can hurt your application's LCP (https://web.dev/lcp). ` +
                `"Priority" should only be set on the image expected to be the page's LCP element.`));
        }
    }
    else {
        IMGS_WITH_PRIORITY_ATTR_COUNT++;
    }
}
/**
 * Warns if placeholder's dimension are over a threshold.
 *
 * This assert function is meant to only run on the browser.
 */
function assertPlaceholderDimensions(dir, imgElement) {
    const computedStyle = window.getComputedStyle(imgElement);
    let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
    let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
    if (renderedWidth > PLACEHOLDER_DIMENSION_LIMIT || renderedHeight > PLACEHOLDER_DIMENSION_LIMIT) {
        console.warn(formatRuntimeError(2967 /* RuntimeErrorCode.PLACEHOLDER_DIMENSION_LIMIT_EXCEEDED */, `${imgDirectiveDetails(dir.ngSrc)} it uses a placeholder image, but at least one ` +
            `of the dimensions attribute (height or width) exceeds the limit of ${PLACEHOLDER_DIMENSION_LIMIT}px. ` +
            `To fix this, use a smaller image as a placeholder.`));
    }
}
function round(input) {
    return Number.isInteger(input) ? input : input.toFixed(2);
}
// Transform function to handle SafeValue input for ngSrc. This doesn't do any sanitization,
// as that is not needed for img.src and img.srcset. This transform is purely for compatibility.
function unwrapSafeUrl(value) {
    if (typeof value === 'string') {
        return value;
    }
    return unwrapSafeValue(value);
}
// Transform function to handle inputs which may be booleans, strings, or string representations
// of boolean values. Used for the placeholder attribute.
export function booleanOrUrlAttribute(value) {
    if (typeof value === 'string' && value !== 'true' && value !== 'false' && value !== '') {
        return value;
    }
    return booleanAttribute(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLEVBQ1IsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEVBSWYsV0FBVyxFQUNYLFNBQVMsRUFFVCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsYUFBYSxJQUFJLFlBQVksRUFDN0Isc0JBQXNCLElBQUkscUJBQXFCLEVBRS9DLHVCQUF1QixJQUFJLHNCQUFzQixFQUNqRCxhQUFhLElBQUksWUFBWSxFQUU3QixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGlCQUFpQixFQUNqQixjQUFjLEVBQ2QsV0FBVyxJQUFJLFVBQVUsR0FDMUIsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFbkQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDdkUsT0FBTyxFQUNMLFlBQVksRUFHWixlQUFlLEdBQ2hCLE1BQU0sOEJBQThCLENBQUM7QUFDdEMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDbkUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9B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S0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxnR0FBZ0c7QUFDaEcseURBQXlEO0FBQ3pELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxLQUF1QjtJQUMzRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUssTUFBTSxJQUFJLEtBQUssS0FBSyxPQUFPLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQ3ZGLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDakMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBpbmplY3QsXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBudW1iZXJBdHRyaWJ1dGUsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFBMQVRGT1JNX0lELFxuICBSZW5kZXJlcjIsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVJTUFHRV9DT05GSUcgYXMgSU1BR0VfQ09ORklHLFxuICDJtUlNQUdFX0NPTkZJR19ERUZBVUxUUyBhcyBJTUFHRV9DT05GSUdfREVGQVVMVFMsXG4gIMm1SW1hZ2VDb25maWcgYXMgSW1hZ2VDb25maWcsXG4gIMm1cGVyZm9ybWFuY2VNYXJrRmVhdHVyZSBhcyBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG4gIMm1U2FmZVZhbHVlIGFzIFNhZmVWYWx1ZSxcbiAgybV1bndyYXBTYWZlVmFsdWUgYXMgdW53cmFwU2FmZVZhbHVlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQXBwbGljYXRpb25SZWYsXG4gIMm1d2hlblN0YWJsZSBhcyB3aGVuU3RhYmxlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICcuLi8uLi9wbGF0Zm9ybV9pZCc7XG5cbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtjbG91ZGluYXJ5TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2Nsb3VkaW5hcnlfbG9hZGVyJztcbmltcG9ydCB7XG4gIElNQUdFX0xPQURFUixcbiAgSW1hZ2VMb2FkZXIsXG4gIEltYWdlTG9hZGVyQ29uZmlnLFxuICBub29wSW1hZ2VMb2FkZXIsXG59IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZV9sb2FkZXInO1xuaW1wb3J0IHtpbWFnZUtpdExvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZWtpdF9sb2FkZXInO1xuaW1wb3J0IHtpbWdpeExvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWdpeF9sb2FkZXInO1xuaW1wb3J0IHtuZXRsaWZ5TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL25ldGxpZnlfbG9hZGVyJztcbmltcG9ydCB7TENQSW1hZ2VPYnNlcnZlcn0gZnJvbSAnLi9sY3BfaW1hZ2Vfb2JzZXJ2ZXInO1xuaW1wb3J0IHtQcmVjb25uZWN0TGlua0NoZWNrZXJ9IGZyb20gJy4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtQcmVsb2FkTGlua0NyZWF0b3J9IGZyb20gJy4vcHJlbG9hZC1saW5rLWNyZWF0b3InO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgd2lkdGggZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMTAwdywgMjAwd1wiLlxuICovXG5jb25zdCBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkK3dcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMXgsIDJ4LCA1MHhcIi4gQWxzbyBzdXBwb3J0cyBkZWNpbWFscyBsaWtlIFwiMS41eCwgMS41MHhcIi5cbiAqL1xuY29uc3QgVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkKyhcXC5cXGQrKT94XFxzKigsfCQpKXsxLH0pJC87XG5cbi8qKlxuICogU3Jjc2V0IHZhbHVlcyB3aXRoIGEgZGVuc2l0eSBkZXNjcmlwdG9yIGhpZ2hlciB0aGFuIHRoaXMgdmFsdWUgd2lsbCBhY3RpdmVseVxuICogdGhyb3cgYW4gZXJyb3IuIFN1Y2ggZGVuc2l0aWVzIGFyZSBub3QgcGVybWl0dGVkIGFzIHRoZXkgY2F1c2UgaW1hZ2Ugc2l6ZXNcbiAqIHRvIGJlIHVucmVhc29uYWJseSBsYXJnZSBhbmQgc2xvdyBkb3duIExDUC5cbiAqL1xuZXhwb3J0IGNvbnN0IEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUCA9IDM7XG5cbi8qKlxuICogVXNlZCBvbmx5IGluIGVycm9yIG1lc3NhZ2UgdGV4dCB0byBjb21tdW5pY2F0ZSBiZXN0IHByYWN0aWNlcywgYXMgd2Ugd2lsbFxuICogb25seSB0aHJvdyBiYXNlZCBvbiB0aGUgc2xpZ2h0bHkgbW9yZSBjb25zZXJ2YXRpdmUgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQLlxuICovXG5leHBvcnQgY29uc3QgUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMjtcblxuLyoqXG4gKiBVc2VkIGluIGdlbmVyYXRpbmcgYXV0b21hdGljIGRlbnNpdHktYmFzZWQgc3Jjc2V0c1xuICovXG5jb25zdCBERU5TSVRZX1NSQ1NFVF9NVUxUSVBMSUVSUyA9IFsxLCAyXTtcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGljaCBicmVha3BvaW50cyB0byB1c2Ugb24gZnVsbC13aWR0aCBpbWFnZXNcbiAqL1xuY29uc3QgVklFV1BPUlRfQlJFQUtQT0lOVF9DVVRPRkYgPSA2NDA7XG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFzcGVjdCByYXRpb3MgYXJlIHNpbWlsYXIgaW4gdmFsdWUuXG4gKi9cbmNvbnN0IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0UgPSAwLjE7XG5cbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgaW1hZ2UgaGFzIGJlZW4gcmVxdWVzdGVkIGF0IGFuIG92ZXJseVxuICogbGFyZ2Ugc2l6ZSBjb21wYXJlZCB0byB0aGUgYWN0dWFsIHJlbmRlcmVkIGltYWdlIHNpemUgKGFmdGVyIHRha2luZ1xuICogaW50byBhY2NvdW50IGEgdHlwaWNhbCBkZXZpY2UgcGl4ZWwgcmF0aW8pLiBJbiBwaXhlbHMuXG4gKi9cbmNvbnN0IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0UgPSAxMDAwO1xuXG4vKipcbiAqIFVzZWQgdG8gbGltaXQgYXV0b21hdGljIHNyY3NldCBnZW5lcmF0aW9uIG9mIHZlcnkgbGFyZ2Ugc291cmNlcyBmb3JcbiAqIGZpeGVkLXNpemUgaW1hZ2VzLiBJbiBwaXhlbHMuXG4gKi9cbmNvbnN0IEZJWEVEX1NSQ1NFVF9XSURUSF9MSU1JVCA9IDE5MjA7XG5jb25zdCBGSVhFRF9TUkNTRVRfSEVJR0hUX0xJTUlUID0gMTA4MDtcblxuLyoqXG4gKiBEZWZhdWx0IGJsdXIgcmFkaXVzIG9mIHRoZSBDU1MgZmlsdGVyIHVzZWQgb24gcGxhY2Vob2xkZXIgaW1hZ2VzLCBpbiBwaXhlbHNcbiAqL1xuZXhwb3J0IGNvbnN0IFBMQUNFSE9MREVSX0JMVVJfQU1PVU5UID0gMTU7XG5cbi8qKlxuICogUGxhY2Vob2xkZXIgZGltZW5zaW9uIChoZWlnaHQgb3Igd2lkdGgpIGxpbWl0IGluIHBpeGVscy4gQW5ndWxhciBwcm9kdWNlcyBhIHdhcm5pbmdcbiAqIHdoZW4gdGhpcyBsaW1pdCBpcyBjcm9zc2VkLlxuICovXG5jb25zdCBQTEFDRUhPTERFUl9ESU1FTlNJT05fTElNSVQgPSAxMDAwO1xuXG4vKipcbiAqIFVzZWQgdG8gd2FybiBvciBlcnJvciB3aGVuIHRoZSB1c2VyIHByb3ZpZGVzIGFuIG92ZXJseSBsYXJnZSBkYXRhVVJMIGZvciB0aGUgcGxhY2Vob2xkZXJcbiAqIGF0dHJpYnV0ZS5cbiAqIENoYXJhY3RlciBjb3VudCBvZiBCYXNlNjQgaW1hZ2VzIGlzIDEgY2hhcmFjdGVyIHBlciBieXRlLCBhbmQgYmFzZTY0IGVuY29kaW5nIGlzIGFwcHJveGltYXRlbHlcbiAqIDMzJSBsYXJnZXIgdGhhbiBiYXNlIGltYWdlcywgc28gNDAwMCBjaGFyYWN0ZXJzIGlzIGFyb3VuZCAzS0Igb24gZGlzayBhbmQgMTAwMDAgY2hhcmFjdGVycyBpc1xuICogYXJvdW5kIDcuN0tCLiBFeHBlcmltZW50YWxseSwgNDAwMCBjaGFyYWN0ZXJzIGlzIGFib3V0IDIweDIwcHggaW4gUE5HIG9yIG1lZGl1bS1xdWFsaXR5IEpQRUdcbiAqIGZvcm1hdCwgYW5kIDEwLDAwMCBpcyBhcm91bmQgNTB4NTBweCwgYnV0IHRoZXJlJ3MgcXVpdGUgYSBiaXQgb2YgdmFyaWF0aW9uIGRlcGVuZGluZyBvbiBob3cgdGhlXG4gKiBpbWFnZSBpcyBzYXZlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IERBVEFfVVJMX1dBUk5fTElNSVQgPSA0MDAwO1xuZXhwb3J0IGNvbnN0IERBVEFfVVJMX0VSUk9SX0xJTUlUID0gMTAwMDA7XG5cbi8qKiBJbmZvIGFib3V0IGJ1aWx0LWluIGxvYWRlcnMgd2UgY2FuIHRlc3QgZm9yLiAqL1xuZXhwb3J0IGNvbnN0IEJVSUxUX0lOX0xPQURFUlMgPSBbXG4gIGltZ2l4TG9hZGVySW5mbyxcbiAgaW1hZ2VLaXRMb2FkZXJJbmZvLFxuICBjbG91ZGluYXJ5TG9hZGVySW5mbyxcbiAgbmV0bGlmeUxvYWRlckluZm8sXG5dO1xuXG4vKipcbiAqIFRocmVzaG9sZCBmb3IgdGhlIFBSSU9SSVRZX1RSVUVfQ09VTlRcbiAqL1xuY29uc3QgUFJJT1JJVFlfQ09VTlRfVEhSRVNIT0xEID0gMTA7XG5cbi8qKlxuICogVGhpcyBjb3VudCBpcyB1c2VkIHRvIGxvZyBhIGRldk1vZGUgd2FybmluZ1xuICogd2hlbiB0aGUgY291bnQgb2YgZGlyZWN0aXZlIGluc3RhbmNlcyB3aXRoIHByaW9yaXR5PXRydWVcbiAqIGV4Y2VlZHMgdGhlIHRocmVzaG9sZCBQUklPUklUWV9DT1VOVF9USFJFU0hPTERcbiAqL1xubGV0IElNR1NfV0lUSF9QUklPUklUWV9BVFRSX0NPVU5UID0gMDtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGZvciB0ZXN0aW5nIHB1cnBvc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEltYWdlUHJpb3JpdHlDb3VudCgpIHtcbiAgSU1HU19XSVRIX1BSSU9SSVRZX0FUVFJfQ09VTlQgPSAwO1xufVxuXG4vKipcbiAqIENvbmZpZyBvcHRpb25zIHVzZWQgaW4gcmVuZGVyaW5nIHBsYWNlaG9sZGVyIGltYWdlcy5cbiAqXG4gKiBAc2VlIHtAbGluayBOZ09wdGltaXplZEltYWdlfVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlUGxhY2Vob2xkZXJDb25maWcge1xuICBibHVyPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEaXJlY3RpdmUgdGhhdCBpbXByb3ZlcyBpbWFnZSBsb2FkaW5nIHBlcmZvcm1hbmNlIGJ5IGVuZm9yY2luZyBiZXN0IHByYWN0aWNlcy5cbiAqXG4gKiBgTmdPcHRpbWl6ZWRJbWFnZWAgZW5zdXJlcyB0aGF0IHRoZSBsb2FkaW5nIG9mIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgaW1hZ2UgaXNcbiAqIHByaW9yaXRpemVkIGJ5OlxuICogLSBBdXRvbWF0aWNhbGx5IHNldHRpbmcgdGhlIGBmZXRjaHByaW9yaXR5YCBhdHRyaWJ1dGUgb24gdGhlIGA8aW1nPmAgdGFnXG4gKiAtIExhenkgbG9hZGluZyBub24tcHJpb3JpdHkgaW1hZ2VzIGJ5IGRlZmF1bHRcbiAqIC0gQXV0b21hdGljYWxseSBnZW5lcmF0aW5nIGEgcHJlY29ubmVjdCBsaW5rIHRhZyBpbiB0aGUgZG9jdW1lbnQgaGVhZFxuICpcbiAqIEluIGFkZGl0aW9uLCB0aGUgZGlyZWN0aXZlOlxuICogLSBHZW5lcmF0ZXMgYXBwcm9wcmlhdGUgYXNzZXQgVVJMcyBpZiBhIGNvcnJlc3BvbmRpbmcgYEltYWdlTG9hZGVyYCBmdW5jdGlvbiBpcyBwcm92aWRlZFxuICogLSBBdXRvbWF0aWNhbGx5IGdlbmVyYXRlcyBhIHNyY3NldFxuICogLSBSZXF1aXJlcyB0aGF0IGB3aWR0aGAgYW5kIGBoZWlnaHRgIGFyZSBzZXRcbiAqIC0gV2FybnMgaWYgYHdpZHRoYCBvciBgaGVpZ2h0YCBoYXZlIGJlZW4gc2V0IGluY29ycmVjdGx5XG4gKiAtIFdhcm5zIGlmIHRoZSBpbWFnZSB3aWxsIGJlIHZpc3VhbGx5IGRpc3RvcnRlZCB3aGVuIHJlbmRlcmVkXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIGlzIG1hcmtlZCBhcyBbc3RhbmRhbG9uZV0oZ3VpZGUvY29tcG9uZW50cy9pbXBvcnRpbmcpIGFuZCBjYW5cbiAqIGJlIGltcG9ydGVkIGRpcmVjdGx5LlxuICpcbiAqIEZvbGxvdyB0aGUgc3RlcHMgYmVsb3cgdG8gZW5hYmxlIGFuZCB1c2UgdGhlIGRpcmVjdGl2ZTpcbiAqIDEuIEltcG9ydCBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGUgb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudC5cbiAqIDIuIE9wdGlvbmFsbHkgcHJvdmlkZSBhbiBgSW1hZ2VMb2FkZXJgIGlmIHlvdSB1c2UgYW4gaW1hZ2UgaG9zdGluZyBzZXJ2aWNlLlxuICogMy4gVXBkYXRlIHRoZSBuZWNlc3NhcnkgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyBhbmQgcmVwbGFjZSBgc3JjYCBhdHRyaWJ1dGVzIHdpdGggYG5nU3JjYC5cbiAqIFVzaW5nIGEgYG5nU3JjYCBhbGxvd3MgdGhlIGRpcmVjdGl2ZSB0byBjb250cm9sIHdoZW4gdGhlIGBzcmNgIGdldHMgc2V0LCB3aGljaCB0cmlnZ2VycyBhbiBpbWFnZVxuICogZG93bmxvYWQuXG4gKlxuICogU3RlcCAxOiBpbXBvcnQgdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgTmdPcHRpbWl6ZWRJbWFnZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gSW5jbHVkZSBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGVcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBBcHBNb2R1bGUge31cbiAqXG4gKiAvLyAuLi4gb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudFxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWVcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIE15U3RhbmRhbG9uZUNvbXBvbmVudCB7fVxuICogYGBgXG4gKlxuICogU3RlcCAyOiBjb25maWd1cmUgYSBsb2FkZXIuXG4gKlxuICogVG8gdXNlIHRoZSAqKmRlZmF1bHQgbG9hZGVyKio6IG5vIGFkZGl0aW9uYWwgY29kZSBjaGFuZ2VzIGFyZSBuZWNlc3NhcnkuIFRoZSBVUkwgcmV0dXJuZWQgYnkgdGhlXG4gKiBnZW5lcmljIGxvYWRlciB3aWxsIGFsd2F5cyBtYXRjaCB0aGUgdmFsdWUgb2YgXCJzcmNcIi4gSW4gb3RoZXIgd29yZHMsIHRoaXMgbG9hZGVyIGFwcGxpZXMgbm9cbiAqIHRyYW5zZm9ybWF0aW9ucyB0byB0aGUgcmVzb3VyY2UgVVJMIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGBuZ1NyY2AgYXR0cmlidXRlIHdpbGwgYmUgdXNlZCBhcyBpcy5cbiAqXG4gKiBUbyB1c2UgYW4gZXhpc3RpbmcgbG9hZGVyIGZvciBhICoqdGhpcmQtcGFydHkgaW1hZ2Ugc2VydmljZSoqOiBhZGQgdGhlIHByb3ZpZGVyIGZhY3RvcnkgZm9yIHlvdXJcbiAqIGNob3NlbiBzZXJ2aWNlIHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheS4gSW4gdGhlIGV4YW1wbGUgYmVsb3csIHRoZSBJbWdpeCBsb2FkZXIgaXMgdXNlZDpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3Byb3ZpZGVJbWdpeExvYWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDYWxsIHRoZSBmdW5jdGlvbiBhbmQgYWRkIHRoZSByZXN1bHQgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5OlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHByb3ZpZGVJbWdpeExvYWRlcihcImh0dHBzOi8vbXkuYmFzZS51cmwvXCIpLFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIHByb3ZpZGVzIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICogLSBgcHJvdmlkZUNsb3VkZmxhcmVMb2FkZXJgXG4gKiAtIGBwcm92aWRlQ2xvdWRpbmFyeUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWFnZUtpdExvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWdpeExvYWRlcmBcbiAqXG4gKiBJZiB5b3UgdXNlIGEgZGlmZmVyZW50IGltYWdlIHByb3ZpZGVyLCB5b3UgY2FuIGNyZWF0ZSBhIGN1c3RvbSBsb2FkZXIgZnVuY3Rpb24gYXMgZGVzY3JpYmVkXG4gKiBiZWxvdy5cbiAqXG4gKiBUbyB1c2UgYSAqKmN1c3RvbSBsb2FkZXIqKjogcHJvdmlkZSB5b3VyIGxvYWRlciBmdW5jdGlvbiBhcyBhIHZhbHVlIGZvciB0aGUgYElNQUdFX0xPQURFUmAgRElcbiAqIHRva2VuLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDb25maWd1cmUgdGhlIGxvYWRlciB1c2luZyB0aGUgYElNQUdFX0xPQURFUmAgdG9rZW4uXG4gKiBwcm92aWRlcnM6IFtcbiAqICAge1xuICogICAgICBwcm92aWRlOiBJTUFHRV9MT0FERVIsXG4gKiAgICAgIHVzZVZhbHVlOiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICogICAgICAgIHJldHVybiBgaHR0cHM6Ly9leGFtcGxlLmNvbS8ke2NvbmZpZy5zcmN9LSR7Y29uZmlnLndpZHRofS5qcGd9YDtcbiAqICAgICAgfVxuICogICB9LFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFN0ZXAgMzogdXBkYXRlIGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgdG8gdXNlIGBuZ1NyY2AgaW5zdGVhZCBvZiBgc3JjYC5cbiAqXG4gKiBgYGBcbiAqIDxpbWcgbmdTcmM9XCJsb2dvLnBuZ1wiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMTAwXCI+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzZWxlY3RvcjogJ2ltZ1tuZ1NyY10nLFxuICBob3N0OiB7XG4gICAgJ1tzdHlsZS5wb3NpdGlvbl0nOiAnZmlsbCA/IFwiYWJzb2x1dGVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUud2lkdGhdJzogJ2ZpbGwgPyBcIjEwMCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuaGVpZ2h0XSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmluc2V0XSc6ICdmaWxsID8gXCIwXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmJhY2tncm91bmQtc2l6ZV0nOiAncGxhY2Vob2xkZXIgPyBcImNvdmVyXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmJhY2tncm91bmQtcG9zaXRpb25dJzogJ3BsYWNlaG9sZGVyID8gXCI1MCUgNTAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmJhY2tncm91bmQtcmVwZWF0XSc6ICdwbGFjZWhvbGRlciA/IFwibm8tcmVwZWF0XCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmJhY2tncm91bmQtaW1hZ2VdJzogJ3BsYWNlaG9sZGVyID8gZ2VuZXJhdGVQbGFjZWhvbGRlcihwbGFjZWhvbGRlcikgOiBudWxsJyxcbiAgICAnW3N0eWxlLmZpbHRlcl0nOiBgcGxhY2Vob2xkZXIgJiYgc2hvdWxkQmx1clBsYWNlaG9sZGVyKHBsYWNlaG9sZGVyQ29uZmlnKSA/IFwiYmx1cigke1BMQUNFSE9MREVSX0JMVVJfQU1PVU5UfXB4KVwiIDogbnVsbGAsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2UgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBpbWFnZUxvYWRlciA9IGluamVjdChJTUFHRV9MT0FERVIpO1xuICBwcml2YXRlIGNvbmZpZzogSW1hZ2VDb25maWcgPSBwcm9jZXNzQ29uZmlnKGluamVjdChJTUFHRV9DT05GSUcpKTtcbiAgcHJpdmF0ZSByZW5kZXJlciA9IGluamVjdChSZW5kZXJlcjIpO1xuICBwcml2YXRlIGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcbiAgcHJpdmF0ZSBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHByaXZhdGUgcmVhZG9ubHkgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdChQTEFURk9STV9JRCkpO1xuICBwcml2YXRlIHJlYWRvbmx5IHByZWxvYWRMaW5rQ3JlYXRvciA9IGluamVjdChQcmVsb2FkTGlua0NyZWF0b3IpO1xuXG4gIC8vIGEgTENQIGltYWdlIG9ic2VydmVyIC0gc2hvdWxkIGJlIGluamVjdGVkIG9ubHkgaW4gdGhlIGRldiBtb2RlXG4gIHByaXZhdGUgbGNwT2JzZXJ2ZXIgPSBuZ0Rldk1vZGUgPyB0aGlzLmluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKSA6IG51bGw7XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgcmV3cml0dGVuIGBzcmNgIG9uY2UgYW5kIHN0b3JlIGl0LlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCByZXBldGl0aXZlIGNhbGN1bGF0aW9ucyBhbmQgbWFrZSBzdXJlIHRoZSBkaXJlY3RpdmUgY2xlYW51cCBpbiB0aGVcbiAgICogYG5nT25EZXN0cm95YCBkb2VzIG5vdCByZWx5IG9uIHRoZSBgSU1BR0VfTE9BREVSYCBsb2dpYyAod2hpY2ggaW4gdHVybiBjYW4gcmVseSBvbiBzb21lIG90aGVyXG4gICAqIGluc3RhbmNlIHRoYXQgbWlnaHQgYmUgYWxyZWFkeSBkZXN0cm95ZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyZWRTcmM6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCh7cmVxdWlyZWQ6IHRydWUsIHRyYW5zZm9ybTogdW53cmFwU2FmZVVybH0pIG5nU3JjITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gICAqIFRoZSBpbWFnZSBuYW1lIHdpbGwgYmUgdGFrZW4gZnJvbSBgbmdTcmNgIGFuZCBjb21iaW5lZCB3aXRoIHRoZSBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHlcbiAgICogZGVzY3JpcHRvcnMgdG8gZ2VuZXJhdGUgdGhlIGZpbmFsIGBzcmNzZXRgIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogYGBgXG4gICAqIDxpbWcgbmdTcmM9XCJoZWxsby5qcGdcIiBuZ1NyY3NldD1cIjEwMHcsIDIwMHdcIiAvPiAgPT5cbiAgICogPGltZyBzcmM9XCJwYXRoL2hlbGxvLmpwZ1wiIHNyY3NldD1cInBhdGgvaGVsbG8uanBnP3c9MTAwIDEwMHcsIHBhdGgvaGVsbG8uanBnP3c9MjAwIDIwMHdcIiAvPlxuICAgKiBgYGBcbiAgICovXG4gIEBJbnB1dCgpIG5nU3Jjc2V0ITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBgc2l6ZXNgIGF0dHJpYnV0ZSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBQcm92aWRpbmcgc2l6ZXMgY2F1c2VzIHRoZSBpbWFnZSB0byBjcmVhdGUgYW4gYXV0b21hdGljIHJlc3BvbnNpdmUgc3Jjc2V0LlxuICAgKi9cbiAgQElucHV0KCkgc2l6ZXM/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKiBGb3IgZml4ZWQgc2l6ZSBpbWFnZXM6IHRoZSBkZXNpcmVkIHJlbmRlcmVkIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSkgd2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogRm9yIHJlc3BvbnNpdmUgaW1hZ2VzOiB0aGUgaW50cmluc2ljIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKiBGb3IgZml4ZWQgc2l6ZSBpbWFnZXM6IHRoZSBkZXNpcmVkIHJlbmRlcmVkIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pIGhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVzaXJlZCBsb2FkaW5nIGJlaGF2aW9yIChsYXp5LCBlYWdlciwgb3IgYXV0bykuIERlZmF1bHRzIHRvIGBsYXp5YCxcbiAgICogd2hpY2ggaXMgcmVjb21tZW5kZWQgZm9yIG1vc3QgaW1hZ2VzLlxuICAgKlxuICAgKiBXYXJuaW5nOiBTZXR0aW5nIGltYWdlcyBhcyBsb2FkaW5nPVwiZWFnZXJcIiBvciBsb2FkaW5nPVwiYXV0b1wiIG1hcmtzIHRoZW1cbiAgICogYXMgbm9uLXByaW9yaXR5IGltYWdlcyBhbmQgY2FuIGh1cnQgbG9hZGluZyBwZXJmb3JtYW5jZS4gRm9yIGltYWdlcyB3aGljaFxuICAgKiBtYXkgYmUgdGhlIExDUCBlbGVtZW50LCB1c2UgdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGluc3RlYWQgb2YgYGxvYWRpbmdgLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGluZz86ICdsYXp5JyB8ICdlYWdlcicgfCAnYXV0byc7XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW1hZ2Ugc2hvdWxkIGhhdmUgYSBoaWdoIHByaW9yaXR5LlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBwcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBEYXRhIHRvIHBhc3MgdGhyb3VnaCB0byBjdXN0b20gbG9hZGVycy5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRlclBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gZm9yIHRoaXMgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGRpc2FibGVPcHRpbWl6ZWRTcmNzZXQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU2V0cyB0aGUgaW1hZ2UgdG8gXCJmaWxsIG1vZGVcIiwgd2hpY2ggZWxpbWluYXRlcyB0aGUgaGVpZ2h0L3dpZHRoIHJlcXVpcmVtZW50IGFuZCBhZGRzXG4gICAqIHN0eWxlcyBzdWNoIHRoYXQgdGhlIGltYWdlIGZpbGxzIGl0cyBjb250YWluaW5nIGVsZW1lbnQuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGZpbGwgPSBmYWxzZTtcblxuICAvKipcbiAgICogQSBVUkwgb3IgZGF0YSBVUkwgZm9yIGFuIGltYWdlIHRvIGJlIHVzZWQgYXMgYSBwbGFjZWhvbGRlciB3aGlsZSB0aGlzIGltYWdlIGxvYWRzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5PclVybEF0dHJpYnV0ZX0pIHBsYWNlaG9sZGVyPzogc3RyaW5nIHwgYm9vbGVhbjtcblxuICAvKipcbiAgICogQ29uZmlndXJhdGlvbiBvYmplY3QgZm9yIHBsYWNlaG9sZGVyIHNldHRpbmdzLiBPcHRpb25zOlxuICAgKiAgICogYmx1cjogU2V0dGluZyB0aGlzIHRvIGZhbHNlIGRpc2FibGVzIHRoZSBhdXRvbWF0aWMgQ1NTIGJsdXIuXG4gICAqL1xuICBASW5wdXQoKSBwbGFjZWhvbGRlckNvbmZpZz86IEltYWdlUGxhY2Vob2xkZXJDb25maWc7XG5cbiAgLyoqXG4gICAqIFZhbHVlIG9mIHRoZSBgc3JjYCBhdHRyaWJ1dGUgaWYgc2V0IG9uIHRoZSBob3N0IGA8aW1nPmAgZWxlbWVudC5cbiAgICogVGhpcyBpbnB1dCBpcyBleGNsdXNpdmVseSByZWFkIHRvIGFzc2VydCB0aGF0IGBzcmNgIGlzIG5vdCBzZXQgaW4gY29uZmxpY3RcbiAgICogd2l0aCBgbmdTcmNgIGFuZCB0aGF0IGltYWdlcyBkb24ndCBzdGFydCB0byBsb2FkIHVudGlsIGEgbGF6eSBsb2FkaW5nIHN0cmF0ZWd5IGlzIHNldC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBASW5wdXQoKSBzcmM/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFZhbHVlIG9mIHRoZSBgc3Jjc2V0YCBhdHRyaWJ1dGUgaWYgc2V0IG9uIHRoZSBob3N0IGA8aW1nPmAgZWxlbWVudC5cbiAgICogVGhpcyBpbnB1dCBpcyBleGNsdXNpdmVseSByZWFkIHRvIGFzc2VydCB0aGF0IGBzcmNzZXRgIGlzIG5vdCBzZXQgaW4gY29uZmxpY3RcbiAgICogd2l0aCBgbmdTcmNzZXRgIGFuZCB0aGF0IGltYWdlcyBkb24ndCBzdGFydCB0byBsb2FkIHVudGlsIGEgbGF6eSBsb2FkaW5nIHN0cmF0ZWd5IGlzIHNldC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBASW5wdXQoKSBzcmNzZXQ/OiBzdHJpbmc7XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uSW5pdCgpIHtcbiAgICBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlKCdOZ09wdGltaXplZEltYWdlJyk7XG5cbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgYXNzZXJ0Tm9uRW1wdHlJbnB1dCh0aGlzLCAnbmdTcmMnLCB0aGlzLm5nU3JjKTtcbiAgICAgIGFzc2VydFZhbGlkTmdTcmNzZXQodGhpcywgdGhpcy5uZ1NyY3NldCk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKHRoaXMpO1xuICAgICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldCh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydE5vdEJhc2U2NEltYWdlKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmxvYlVybCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLmZpbGwpIHtcbiAgICAgICAgYXNzZXJ0RW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgLy8gVGhpcyBsZWF2ZXMgdGhlIEFuZ3VsYXIgem9uZSB0byBhdm9pZCB0cmlnZ2VyaW5nIHVubmVjZXNzYXJ5IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzIHdoZW5cbiAgICAgICAgLy8gYGxvYWRgIHRhc2tzIGFyZSBpbnZva2VkIG9uIGltYWdlcy5cbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgICAgYXNzZXJ0Tm9uWmVyb1JlbmRlcmVkSGVpZ2h0KHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlciksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFzc2VydEdyZWF0ZXJUaGFuWmVybyh0aGlzLCB0aGlzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdGhpcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25seSBjaGVjayBmb3IgZGlzdG9ydGVkIGltYWdlcyB3aGVuIG5vdCBpbiBmaWxsIG1vZGUsIHdoZXJlXG4gICAgICAgIC8vIGltYWdlcyBtYXkgYmUgaW50ZW50aW9uYWxseSBzdHJldGNoZWQsIGNyb3BwZWQgb3IgbGV0dGVyYm94ZWQuXG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICAgIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlciksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dCh0aGlzKTtcbiAgICAgIGlmICghdGhpcy5uZ1NyY3NldCkge1xuICAgICAgICBhc3NlcnROb0NvbXBsZXhTaXplcyh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydFZhbGlkUGxhY2Vob2xkZXIodGhpcywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb3RNaXNzaW5nQnVpbHRJbkxvYWRlcih0aGlzLm5nU3JjLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vTmdTcmNzZXRXaXRob3V0TG9hZGVyKHRoaXMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuICAgICAgYXNzZXJ0Tm9Mb2FkZXJQYXJhbXNXaXRob3V0TG9hZGVyKHRoaXMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuXG4gICAgICBpZiAodGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIhLnJlZ2lzdGVySW1hZ2UodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5uZ1NyYywgdGhpcy5wcmlvcml0eSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wcmlvcml0eSkge1xuICAgICAgICBjb25zdCBjaGVja2VyID0gdGhpcy5pbmplY3Rvci5nZXQoUHJlY29ubmVjdExpbmtDaGVja2VyKTtcbiAgICAgICAgY2hlY2tlci5hc3NlcnRQcmVjb25uZWN0KHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMubmdTcmMpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1NlcnZlcikge1xuICAgICAgICAgIGNvbnN0IGFwcGxpY2F0aW9uUmVmID0gdGhpcy5pbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuICAgICAgICAgIGFzc2V0UHJpb3JpdHlDb3VudEJlbG93VGhyZXNob2xkKGFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5wbGFjZWhvbGRlcikge1xuICAgICAgdGhpcy5yZW1vdmVQbGFjZWhvbGRlck9uTG9hZCh0aGlzLmltZ0VsZW1lbnQpO1xuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGVzKCk7XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGVzKCkge1xuICAgIC8vIE11c3Qgc2V0IHdpZHRoL2hlaWdodCBleHBsaWNpdGx5IGluIGNhc2UgdGhleSBhcmUgYm91bmQgKGluIHdoaWNoIGNhc2UgdGhleSB3aWxsXG4gICAgLy8gb25seSBiZSByZWZsZWN0ZWQgYW5kIG5vdCBmb3VuZCBieSB0aGUgYnJvd3NlcilcbiAgICBpZiAodGhpcy5maWxsKSB7XG4gICAgICB0aGlzLnNpemVzIHx8PSAnMTAwdncnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCEudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0IS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG5cbiAgICAvLyBUaGUgYGRhdGEtbmctaW1nYCBhdHRyaWJ1dGUgZmxhZ3MgYW4gaW1hZ2UgYXMgdXNpbmcgdGhlIGRpcmVjdGl2ZSwgdG8gYWxsb3dcbiAgICAvLyBmb3IgYW5hbHlzaXMgb2YgdGhlIGRpcmVjdGl2ZSdzIHBlcmZvcm1hbmNlLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbmctaW1nJywgJ3RydWUnKTtcblxuICAgIC8vIFRoZSBgc3JjYCBhbmQgYHNyY3NldGAgYXR0cmlidXRlcyBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIGNvbnN0IHJld3JpdHRlblNyY3NldCA9IHRoaXMudXBkYXRlU3JjQW5kU3Jjc2V0KCk7XG5cbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzaXplcycsIHRoaXMuc2l6ZXMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1NlcnZlciAmJiB0aGlzLnByaW9yaXR5KSB7XG4gICAgICB0aGlzLnByZWxvYWRMaW5rQ3JlYXRvci5jcmVhdGVQcmVsb2FkTGlua1RhZyhcbiAgICAgICAgdGhpcy5yZW5kZXJlcixcbiAgICAgICAgdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSxcbiAgICAgICAgcmV3cml0dGVuU3Jjc2V0LFxuICAgICAgICB0aGlzLnNpemVzLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UodGhpcywgY2hhbmdlcywgW1xuICAgICAgICAnbmdTcmNzZXQnLFxuICAgICAgICAnd2lkdGgnLFxuICAgICAgICAnaGVpZ2h0JyxcbiAgICAgICAgJ3ByaW9yaXR5JyxcbiAgICAgICAgJ2ZpbGwnLFxuICAgICAgICAnbG9hZGluZycsXG4gICAgICAgICdzaXplcycsXG4gICAgICAgICdsb2FkZXJQYXJhbXMnLFxuICAgICAgICAnZGlzYWJsZU9wdGltaXplZFNyY3NldCcsXG4gICAgICBdKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZXNbJ25nU3JjJ10gJiYgIWNoYW5nZXNbJ25nU3JjJ10uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBjb25zdCBvbGRTcmMgPSB0aGlzLl9yZW5kZXJlZFNyYztcbiAgICAgIHRoaXMudXBkYXRlU3JjQW5kU3Jjc2V0KHRydWUpO1xuICAgICAgY29uc3QgbmV3U3JjID0gdGhpcy5fcmVuZGVyZWRTcmM7XG4gICAgICBpZiAodGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCAmJiBvbGRTcmMgJiYgbmV3U3JjICYmIG9sZFNyYyAhPT0gbmV3U3JjKSB7XG4gICAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sY3BPYnNlcnZlcj8udXBkYXRlSW1hZ2Uob2xkU3JjLCBuZXdTcmMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobmdEZXZNb2RlICYmIGNoYW5nZXNbJ3BsYWNlaG9sZGVyJ10/LmN1cnJlbnRWYWx1ZSAmJiAhdGhpcy5pc1NlcnZlcikge1xuICAgICAgYXNzZXJ0UGxhY2Vob2xkZXJEaW1lbnNpb25zKHRoaXMsIHRoaXMuaW1nRWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjYWxsSW1hZ2VMb2FkZXIoXG4gICAgY29uZmlnV2l0aG91dEN1c3RvbVBhcmFtczogT21pdDxJbWFnZUxvYWRlckNvbmZpZywgJ2xvYWRlclBhcmFtcyc+LFxuICApOiBzdHJpbmcge1xuICAgIGxldCBhdWdtZW50ZWRDb25maWc6IEltYWdlTG9hZGVyQ29uZmlnID0gY29uZmlnV2l0aG91dEN1c3RvbVBhcmFtcztcbiAgICBpZiAodGhpcy5sb2FkZXJQYXJhbXMpIHtcbiAgICAgIGF1Z21lbnRlZENvbmZpZy5sb2FkZXJQYXJhbXMgPSB0aGlzLmxvYWRlclBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMb2FkZXIoYXVnbWVudGVkQ29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMubG9hZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgaWYgKCF0aGlzLl9yZW5kZXJlZFNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5uZ1NyY307XG4gICAgICAvLyBDYWNoZSBjYWxjdWxhdGVkIGltYWdlIHNyYyB0byByZXVzZSBpdCBsYXRlciBpbiB0aGUgY29kZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gdGhpcy5jYWxsSW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVkU3JjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB3aWR0aFNyY1NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodGhpcy5uZ1NyY3NldCk7XG4gICAgY29uc3QgZmluYWxTcmNzID0gdGhpcy5uZ1NyY3NldFxuICAgICAgLnNwbGl0KCcsJylcbiAgICAgIC5maWx0ZXIoKHNyYykgPT4gc3JjICE9PSAnJylcbiAgICAgIC5tYXAoKHNyY1N0cikgPT4ge1xuICAgICAgICBzcmNTdHIgPSBzcmNTdHIudHJpbSgpO1xuICAgICAgICBjb25zdCB3aWR0aCA9IHdpZHRoU3JjU2V0ID8gcGFyc2VGbG9hdChzcmNTdHIpIDogcGFyc2VGbG9hdChzcmNTdHIpICogdGhpcy53aWR0aCE7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aH0pfSAke3NyY1N0cn1gO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBdXRvbWF0aWNTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzcG9uc2l2ZVNyY3NldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaXhlZFNyY3NldCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVzcG9uc2l2ZVNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHticmVha3BvaW50c30gPSB0aGlzLmNvbmZpZztcblxuICAgIGxldCBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhO1xuICAgIGlmICh0aGlzLnNpemVzPy50cmltKCkgPT09ICcxMDB2dycpIHtcbiAgICAgIC8vIFNpbmNlIHRoaXMgaXMgYSBmdWxsLXNjcmVlbi13aWR0aCBpbWFnZSwgb3VyIHNyY3NldCBvbmx5IG5lZWRzIHRvIGluY2x1ZGVcbiAgICAgIC8vIGJyZWFrcG9pbnRzIHdpdGggZnVsbCB2aWV3cG9ydCB3aWR0aHMuXG4gICAgICBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhLmZpbHRlcigoYnApID0+IGJwID49IFZJRVdQT1JUX0JSRUFLUE9JTlRfQ1VUT0ZGKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbFNyY3MgPSBmaWx0ZXJlZEJyZWFrcG9pbnRzLm1hcChcbiAgICAgIChicCkgPT4gYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGg6IGJwfSl9ICR7YnB9d2AsXG4gICAgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVNyY0FuZFNyY3NldChmb3JjZVNyY1JlY2FsYyA9IGZhbHNlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoZm9yY2VTcmNSZWNhbGMpIHtcbiAgICAgIC8vIFJlc2V0IGNhY2hlZCB2YWx1ZSwgc28gdGhhdCB0aGUgZm9sbG93dXAgYGdldFJld3JpdHRlblNyYygpYCBjYWxsXG4gICAgICAvLyB3aWxsIHJlY2FsY3VsYXRlIGl0IGFuZCB1cGRhdGUgdGhlIGNhY2hlLlxuICAgICAgdGhpcy5fcmVuZGVyZWRTcmMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHJld3JpdHRlblNyYyA9IHRoaXMuZ2V0UmV3cml0dGVuU3JjKCk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCByZXdyaXR0ZW5TcmMpO1xuXG4gICAgbGV0IHJld3JpdHRlblNyY3NldDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldFJld3JpdHRlblNyY3NldCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaG91bGRHZW5lcmF0ZUF1dG9tYXRpY1NyY3NldCgpKSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldEF1dG9tYXRpY1NyY3NldCgpO1xuICAgIH1cblxuICAgIGlmIChyZXdyaXR0ZW5TcmNzZXQpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3Jjc2V0JywgcmV3cml0dGVuU3Jjc2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJld3JpdHRlblNyY3NldDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Rml4ZWRTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSBERU5TSVRZX1NSQ1NFVF9NVUxUSVBMSUVSUy5tYXAoXG4gICAgICAobXVsdGlwbGllcikgPT5cbiAgICAgICAgYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe1xuICAgICAgICAgIHNyYzogdGhpcy5uZ1NyYyxcbiAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCEgKiBtdWx0aXBsaWVyLFxuICAgICAgICB9KX0gJHttdWx0aXBsaWVyfXhgLFxuICAgICk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRHZW5lcmF0ZUF1dG9tYXRpY1NyY3NldCgpOiBib29sZWFuIHtcbiAgICBsZXQgb3ZlcnNpemVkSW1hZ2UgPSBmYWxzZTtcbiAgICBpZiAoIXRoaXMuc2l6ZXMpIHtcbiAgICAgIG92ZXJzaXplZEltYWdlID1cbiAgICAgICAgdGhpcy53aWR0aCEgPiBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgfHwgdGhpcy5oZWlnaHQhID4gRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVDtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICF0aGlzLmRpc2FibGVPcHRpbWl6ZWRTcmNzZXQgJiZcbiAgICAgICF0aGlzLnNyY3NldCAmJlxuICAgICAgdGhpcy5pbWFnZUxvYWRlciAhPT0gbm9vcEltYWdlTG9hZGVyICYmXG4gICAgICAhb3ZlcnNpemVkSW1hZ2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW1hZ2UgdXJsIGZvcm1hdHRlZCBmb3IgdXNlIHdpdGggdGhlIENTUyBiYWNrZ3JvdW5kLWltYWdlIHByb3BlcnR5LiBFeHBlY3RzIG9uZSBvZjpcbiAgICogKiBBIGJhc2U2NCBlbmNvZGVkIGltYWdlLCB3aGljaCBpcyB3cmFwcGVkIGFuZCBwYXNzZWQgdGhyb3VnaC5cbiAgICogKiBBIGJvb2xlYW4uIElmIHRydWUsIGNhbGxzIHRoZSBpbWFnZSBsb2FkZXIgdG8gZ2VuZXJhdGUgYSBzbWFsbCBwbGFjZWhvbGRlciB1cmwuXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlUGxhY2Vob2xkZXIocGxhY2Vob2xkZXJJbnB1dDogc3RyaW5nIHwgYm9vbGVhbik6IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHtcbiAgICBjb25zdCB7cGxhY2Vob2xkZXJSZXNvbHV0aW9ufSA9IHRoaXMuY29uZmlnO1xuICAgIGlmIChwbGFjZWhvbGRlcklucHV0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gYHVybCgke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtcbiAgICAgICAgc3JjOiB0aGlzLm5nU3JjLFxuICAgICAgICB3aWR0aDogcGxhY2Vob2xkZXJSZXNvbHV0aW9uLFxuICAgICAgICBpc1BsYWNlaG9sZGVyOiB0cnVlLFxuICAgICAgfSl9KWA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGxhY2Vob2xkZXJJbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBgdXJsKCR7cGxhY2Vob2xkZXJJbnB1dH0pYDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBibHVyIHNob3VsZCBiZSBhcHBsaWVkLCBiYXNlZCBvbiBhbiBvcHRpb25hbCBib29sZWFuXG4gICAqIHByb3BlcnR5IGBibHVyYCB3aXRoaW4gdGhlIG9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGBwbGFjZWhvbGRlckNvbmZpZ2AuXG4gICAqL1xuICBwcml2YXRlIHNob3VsZEJsdXJQbGFjZWhvbGRlcihwbGFjZWhvbGRlckNvbmZpZz86IEltYWdlUGxhY2Vob2xkZXJDb25maWcpOiBib29sZWFuIHtcbiAgICBpZiAoIXBsYWNlaG9sZGVyQ29uZmlnIHx8ICFwbGFjZWhvbGRlckNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnYmx1cicpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIEJvb2xlYW4ocGxhY2Vob2xkZXJDb25maWcuYmx1cik7XG4gIH1cblxuICBwcml2YXRlIHJlbW92ZVBsYWNlaG9sZGVyT25Mb2FkKGltZzogSFRNTEltYWdlRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlRGV0ZWN0b3JSZWYgPSB0aGlzLmluamVjdG9yLmdldChDaGFuZ2VEZXRlY3RvclJlZik7XG4gICAgICByZW1vdmVMb2FkTGlzdGVuZXJGbigpO1xuICAgICAgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuKCk7XG4gICAgICB0aGlzLnBsYWNlaG9sZGVyID0gZmFsc2U7XG4gICAgICBjaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9O1xuXG4gICAgY29uc3QgcmVtb3ZlTG9hZExpc3RlbmVyRm4gPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgY2FsbGJhY2spO1xuICAgIGNvbnN0IHJlbW92ZUVycm9yTGlzdGVuZXJGbiA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGltZywgJ2Vycm9yJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5fcmVuZGVyZWRTcmMgIT09IG51bGwgJiYgdGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxjcE9ic2VydmVyLnVucmVnaXN0ZXJJbWFnZSh0aGlzLl9yZW5kZXJlZFNyYyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuaW1nRWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5cbi8qKioqKiBIZWxwZXJzICoqKioqL1xuXG4vKipcbiAqIFNvcnRzIHByb3ZpZGVkIGNvbmZpZyBicmVha3BvaW50cyBhbmQgdXNlcyBkZWZhdWx0cy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0NvbmZpZyhjb25maWc6IEltYWdlQ29uZmlnKTogSW1hZ2VDb25maWcge1xuICBsZXQgc29ydGVkQnJlYWtwb2ludHM6IHticmVha3BvaW50cz86IG51bWJlcltdfSA9IHt9O1xuICBpZiAoY29uZmlnLmJyZWFrcG9pbnRzKSB7XG4gICAgc29ydGVkQnJlYWtwb2ludHMuYnJlYWtwb2ludHMgPSBjb25maWcuYnJlYWtwb2ludHMuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICB9XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBJTUFHRV9DT05GSUdfREVGQVVMVFMsIGNvbmZpZywgc29ydGVkQnJlYWtwb2ludHMpO1xufVxuXG4vKioqKiogQXNzZXJ0IGZ1bmN0aW9ucyAqKioqKi9cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmMpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ19BVFRSLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY1xcYCBhbmQgXFxgbmdTcmNcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3JjXFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgXFxgbmdTcmNcXGAuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY1xcYCBhdHRyaWJ1dGUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3Jjc2V0YCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNTRVRfQVRUUixcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gYm90aCBcXGBzcmNzZXRcXGAgYW5kIFxcYG5nU3Jjc2V0XFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBzZXRzIFxcYHNyY3NldFxcYCBpdHNlbGYgYmFzZWQgb24gdGhlIHZhbHVlIG9mIGAgK1xuICAgICAgICBgXFxgbmdTcmNzZXRcXGAuIFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNzZXRcXGAgYXR0cmlidXRlLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY2AgaXMgbm90IGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdEJhc2U2NEltYWdlKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgbmdTcmMgPSBkaXIubmdTcmMudHJpbSgpO1xuICBpZiAobmdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSkge1xuICAgIGlmIChuZ1NyYy5sZW5ndGggPiBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpIHtcbiAgICAgIG5nU3JjID0gbmdTcmMuc3Vic3RyaW5nKDAsIEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikgKyAnLi4uJztcbiAgICB9XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYG5nU3JjXFxgIGlzIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nIGAgK1xuICAgICAgICBgKCR7bmdTcmN9KS4gTmdPcHRpbWl6ZWRJbWFnZSBkb2VzIG5vdCBzdXBwb3J0IEJhc2U2NC1lbmNvZGVkIHN0cmluZ3MuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgIGBieSByZW1vdmluZyBcXGBuZ1NyY1xcYCBhbmQgdXNpbmcgYSBzdGFuZGFyZCBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgJ3NpemVzJyBvbmx5IGluY2x1ZGVzIHJlc3BvbnNpdmUgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbXBsZXhTaXplcyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHNpemVzID0gZGlyLnNpemVzO1xuICBpZiAoc2l6ZXM/Lm1hdGNoKC8oKFxcKXwsKVxcc3xeKVxcZCtweC8pKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYHNpemVzXFxgIHdhcyBzZXQgdG8gYSBzdHJpbmcgaW5jbHVkaW5nIGAgK1xuICAgICAgICBgcGl4ZWwgdmFsdWVzLiBGb3IgYXV0b21hdGljIFxcYHNyY3NldFxcYCBnZW5lcmF0aW9uLCBcXGBzaXplc1xcYCBtdXN0IG9ubHkgaW5jbHVkZSByZXNwb25zaXZlIGAgK1xuICAgICAgICBgdmFsdWVzLCBzdWNoIGFzIFxcYHNpemVzPVwiNTB2d1wiXFxgIG9yIFxcYHNpemVzPVwiKG1pbi13aWR0aDogNzY4cHgpIDUwdncsIDEwMHZ3XCJcXGAuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIG1vZGlmeSB0aGUgXFxgc2l6ZXNcXGAgYXR0cmlidXRlLCBvciBwcm92aWRlIHlvdXIgb3duIFxcYG5nU3Jjc2V0XFxgIHZhbHVlIGRpcmVjdGx5LmAsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZFBsYWNlaG9sZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGFzc2VydE5vUGxhY2Vob2xkZXJDb25maWdXaXRob3V0UGxhY2Vob2xkZXIoZGlyKTtcbiAgYXNzZXJ0Tm9SZWxhdGl2ZVBsYWNlaG9sZGVyV2l0aG91dExvYWRlcihkaXIsIGltYWdlTG9hZGVyKTtcbiAgYXNzZXJ0Tm9PdmVyc2l6ZWREYXRhVXJsKGRpcik7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBwbGFjZWhvbGRlckNvbmZpZyBpc24ndCBiZWluZyB1c2VkIHdpdGhvdXQgcGxhY2Vob2xkZXJcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9QbGFjZWhvbGRlckNvbmZpZ1dpdGhvdXRQbGFjZWhvbGRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5wbGFjZWhvbGRlckNvbmZpZyAmJiAhZGlyLnBsYWNlaG9sZGVyKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgIGRpci5uZ1NyYyxcbiAgICAgICAgZmFsc2UsXG4gICAgICApfSBcXGBwbGFjZWhvbGRlckNvbmZpZ1xcYCBvcHRpb25zIHdlcmUgcHJvdmlkZWQgZm9yIGFuIGAgK1xuICAgICAgICBgaW1hZ2UgdGhhdCBkb2VzIG5vdCB1c2UgdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSwgYW5kIHdpbGwgaGF2ZSBubyBlZmZlY3QuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgYSByZWxhdGl2ZSBVUkwgcGxhY2Vob2xkZXIgaXMgc3BlY2lmaWVkLCBidXQgbm8gbG9hZGVyIGlzIHByZXNlbnQgdG8gcHJvdmlkZSB0aGUgc21hbGxcbiAqIGltYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb1JlbGF0aXZlUGxhY2Vob2xkZXJXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIucGxhY2Vob2xkZXIgPT09IHRydWUgJiYgaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gdHJ1ZSBidXQgYCArXG4gICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICBgd2hpY2ggd291bGQgcmVzdWx0IGluIHRoZSBzYW1lIGltYWdlIGJlaW5nIHVzZWQgZm9yIHRoZSBwcmltYXJ5IGltYWdlIGFuZCBpdHMgcGxhY2Vob2xkZXIuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBsb2FkZXIgb3IgcmVtb3ZlIHRoZSBcXGBwbGFjZWhvbGRlclxcYCBhdHRyaWJ1dGUgZnJvbSB0aGUgaW1hZ2UuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgb3IgdGhyb3dzIGFuIGVycm9yIGlmIGFuIG92ZXJzaXplZCBkYXRhVVJMIHBsYWNlaG9sZGVyIGlzIHByb3ZpZGVkLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb092ZXJzaXplZERhdGFVcmwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChcbiAgICBkaXIucGxhY2Vob2xkZXIgJiZcbiAgICB0eXBlb2YgZGlyLnBsYWNlaG9sZGVyID09PSAnc3RyaW5nJyAmJlxuICAgIGRpci5wbGFjZWhvbGRlci5zdGFydHNXaXRoKCdkYXRhOicpXG4gICkge1xuICAgIGlmIChkaXIucGxhY2Vob2xkZXIubGVuZ3RoID4gREFUQV9VUkxfRVJST1JfTElNSVQpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX1BMQUNFSE9MREVSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgIGRpci5uZ1NyYyxcbiAgICAgICAgKX0gdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSBkYXRhIFVSTCB3aGljaCBpcyBsb25nZXIgYCArXG4gICAgICAgICAgYHRoYW4gJHtEQVRBX1VSTF9FUlJPUl9MSU1JVH0gY2hhcmFjdGVycy4gVGhpcyBpcyBzdHJvbmdseSBkaXNjb3VyYWdlZCwgYXMgbGFyZ2UgaW5saW5lIHBsYWNlaG9sZGVycyBgICtcbiAgICAgICAgICBgZGlyZWN0bHkgaW5jcmVhc2UgdGhlIGJ1bmRsZSBzaXplIG9mIEFuZ3VsYXIgYW5kIGh1cnQgcGFnZSBsb2FkIHBlcmZvcm1hbmNlLiBUbyBmaXggdGhpcywgZ2VuZXJhdGUgYCArXG4gICAgICAgICAgYGEgc21hbGxlciBkYXRhIFVSTCBwbGFjZWhvbGRlci5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGRpci5wbGFjZWhvbGRlci5sZW5ndGggPiBEQVRBX1VSTF9XQVJOX0xJTUlUKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk9WRVJTSVpFRF9QTEFDRUhPTERFUixcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgZGlyLm5nU3JjLFxuICAgICAgICAgICl9IHRoZSBcXGBwbGFjZWhvbGRlclxcYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGEgZGF0YSBVUkwgd2hpY2ggaXMgbG9uZ2VyIGAgK1xuICAgICAgICAgICAgYHRoYW4gJHtEQVRBX1VSTF9XQVJOX0xJTUlUfSBjaGFyYWN0ZXJzLiBUaGlzIGlzIGRpc2NvdXJhZ2VkLCBhcyBsYXJnZSBpbmxpbmUgcGxhY2Vob2xkZXJzIGAgK1xuICAgICAgICAgICAgYGRpcmVjdGx5IGluY3JlYXNlIHRoZSBidW5kbGUgc2l6ZSBvZiBBbmd1bGFyIGFuZCBodXJ0IHBhZ2UgbG9hZCBwZXJmb3JtYW5jZS4gRm9yIGJldHRlciBsb2FkaW5nIHBlcmZvcm1hbmNlLCBgICtcbiAgICAgICAgICAgIGBnZW5lcmF0ZSBhIHNtYWxsZXIgZGF0YSBVUkwgcGxhY2Vob2xkZXIuYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgbmdTcmMgPSBkaXIubmdTcmMudHJpbSgpO1xuICBpZiAobmdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3JjXFxgIHdhcyBzZXQgdG8gYSBibG9iIFVSTCAoJHtuZ1NyY30pLiBgICtcbiAgICAgICAgYEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgIGBieSByZW1vdmluZyBcXGBuZ1NyY1xcYCBhbmQgdXNpbmcgYSByZWd1bGFyIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBpbnB1dCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eUlucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICBpZiAoIWlzU3RyaW5nIHx8IGlzRW1wdHlTdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke25hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIGAgK1xuICAgICAgICBgKFxcYCR7dmFsdWV9XFxgKS4gVG8gZml4IHRoaXMsIGNoYW5nZSB0aGUgdmFsdWUgdG8gYSBub24tZW1wdHkgc3RyaW5nLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY3NldGAgaXMgaW4gYSB2YWxpZCBmb3JtYXQsIGUuZy4gXCIxMDB3LCAyMDB3XCIgb3IgXCIxeCwgMnhcIi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkTmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogdW5rbm93bikge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuO1xuICBhc3NlcnROb25FbXB0eUlucHV0KGRpciwgJ25nU3Jjc2V0JywgdmFsdWUpO1xuICBjb25zdCBzdHJpbmdWYWwgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gIGNvbnN0IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG4gIGNvbnN0IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvciA9IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuXG4gIGlmIChpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IpIHtcbiAgICBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyLCBzdHJpbmdWYWwpO1xuICB9XG5cbiAgY29uc3QgaXNWYWxpZFNyY3NldCA9IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgfHwgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yO1xuICBpZiAoIWlzVmFsaWRTcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGBuZ1NyY3NldFxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHt2YWx1ZX1cXGApLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBzdXBwbHkgXFxgbmdTcmNzZXRcXGAgdXNpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBvbmUgb3IgbW9yZSB3aWR0aCBgICtcbiAgICAgICAgYGRlc2NyaXB0b3JzIChlLmcuIFwiMTAwdywgMjAwd1wiKSBvciBkZW5zaXR5IGRlc2NyaXB0b3JzIChlLmcuIFwiMXgsIDJ4XCIpLmAsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGNvbnN0IHVuZGVyRGVuc2l0eUNhcCA9IHZhbHVlXG4gICAgLnNwbGl0KCcsJylcbiAgICAuZXZlcnkoKG51bSkgPT4gbnVtID09PSAnJyB8fCBwYXJzZUZsb2F0KG51bSkgPD0gQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQKTtcbiAgaWYgKCF1bmRlckRlbnNpdHlDYXApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgY29udGFpbnMgYW4gdW5zdXBwb3J0ZWQgaW1hZ2UgZGVuc2l0eTpgICtcbiAgICAgICAgYFxcYCR7dmFsdWV9XFxgLiBOZ09wdGltaXplZEltYWdlIGdlbmVyYWxseSByZWNvbW1lbmRzIGEgbWF4IGltYWdlIGRlbnNpdHkgb2YgYCArXG4gICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGJ1dCBzdXBwb3J0cyBpbWFnZSBkZW5zaXRpZXMgdXAgdG8gYCArXG4gICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14LiBUaGUgaHVtYW4gZXllIGNhbm5vdCBkaXN0aW5ndWlzaCBiZXR3ZWVuIGltYWdlIGRlbnNpdGllcyBgICtcbiAgICAgICAgYGdyZWF0ZXIgdGhhbiAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IC0gd2hpY2ggbWFrZXMgdGhlbSB1bm5lY2Vzc2FyeSBmb3IgYCArXG4gICAgICAgIGBtb3N0IHVzZSBjYXNlcy4gSW1hZ2VzIHRoYXQgd2lsbCBiZSBwaW5jaC16b29tZWQgYXJlIHR5cGljYWxseSB0aGUgcHJpbWFyeSB1c2UgY2FzZSBmb3IgYCArXG4gICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGltYWdlcy4gUGxlYXNlIHJlbW92ZSB0aGUgaGlnaCBkZW5zaXR5IGRlc2NyaXB0b3IgYW5kIHRyeSBhZ2Fpbi5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4gKiB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbiAqL1xuZnVuY3Rpb24gcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXROYW1lOiBzdHJpbmcpOiB7fSB7XG4gIGxldCByZWFzb24hOiBzdHJpbmc7XG4gIGlmIChpbnB1dE5hbWUgPT09ICd3aWR0aCcgfHwgaW5wdXROYW1lID09PSAnaGVpZ2h0Jykge1xuICAgIHJlYXNvbiA9XG4gICAgICBgQ2hhbmdpbmcgXFxgJHtpbnB1dE5hbWV9XFxgIG1heSByZXN1bHQgaW4gZGlmZmVyZW50IGF0dHJpYnV0ZSB2YWx1ZSBgICtcbiAgICAgIGBhcHBsaWVkIHRvIHRoZSB1bmRlcmx5aW5nIGltYWdlIGVsZW1lbnQgYW5kIGNhdXNlIGxheW91dCBzaGlmdHMgb24gYSBwYWdlLmA7XG4gIH0gZWxzZSB7XG4gICAgcmVhc29uID1cbiAgICAgIGBDaGFuZ2luZyB0aGUgXFxgJHtpbnB1dE5hbWV9XFxgIHdvdWxkIGhhdmUgbm8gZWZmZWN0IG9uIHRoZSB1bmRlcmx5aW5nIGAgK1xuICAgICAgYGltYWdlIGVsZW1lbnQsIGJlY2F1c2UgdGhlIHJlc291cmNlIGxvYWRpbmcgaGFzIGFscmVhZHkgb2NjdXJyZWQuYDtcbiAgfVxuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfSU5QVVRfQ0hBTkdFLFxuICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIHdhcyB1cGRhdGVkIGFmdGVyIGluaXRpYWxpemF0aW9uLiBgICtcbiAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuICR7cmVhc29ufSBgICtcbiAgICAgIGBUbyBmaXggdGhpcywgZWl0aGVyIHN3aXRjaCBcXGAke2lucHV0TmFtZX1cXGAgdG8gYSBzdGF0aWMgdmFsdWUgYCArXG4gICAgICBgb3Igd3JhcCB0aGUgaW1hZ2UgZWxlbWVudCBpbiBhbiAqbmdJZiB0aGF0IGlzIGdhdGVkIG9uIHRoZSBuZWNlc3NhcnkgdmFsdWUuYCxcbiAgKTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgdGhhdCBub25lIG9mIHRoZSBsaXN0ZWQgaW5wdXRzIGhhcyBjaGFuZ2VkLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSxcbiAgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyxcbiAgaW5wdXRzOiBzdHJpbmdbXSxcbikge1xuICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICBjb25zdCBpc1VwZGF0ZWQgPSBjaGFuZ2VzLmhhc093blByb3BlcnR5KGlucHV0KTtcbiAgICBpZiAoaXNVcGRhdGVkICYmICFjaGFuZ2VzW2lucHV0XS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ25nU3JjJykge1xuICAgICAgICAvLyBXaGVuIHRoZSBgbmdTcmNgIGlucHV0IGNoYW5nZXMsIHdlIGRldGVjdCB0aGF0IG9ubHkgaW4gdGhlXG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlc2AgaG9vaywgdGh1cyB0aGUgYG5nU3JjYCBpcyBhbHJlYWR5IHNldC4gV2UgdXNlXG4gICAgICAgIC8vIGBuZ1NyY2AgaW4gdGhlIGVycm9yIG1lc3NhZ2UsIHNvIHdlIHVzZSBhIHByZXZpb3VzIHZhbHVlLCBidXRcbiAgICAgICAgLy8gbm90IHRoZSB1cGRhdGVkIG9uZSBpbiBpdC5cbiAgICAgICAgZGlyID0ge25nU3JjOiBjaGFuZ2VzW2lucHV0XS5wcmV2aW91c1ZhbHVlfSBhcyBOZ09wdGltaXplZEltYWdlO1xuICAgICAgfVxuICAgICAgdGhyb3cgcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpciwgaW5wdXQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0R3JlYXRlclRoYW5aZXJvKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgdmFsaWROdW1iZXIgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgJiYgaW5wdXRWYWx1ZSA+IDA7XG4gIGNvbnN0IHZhbGlkU3RyaW5nID1cbiAgICB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkgJiYgcGFyc2VJbnQoaW5wdXRWYWx1ZSkgPiAwO1xuICBpZiAoIXZhbGlkTnVtYmVyICYmICF2YWxpZFN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7aW5wdXROYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZS4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBcXGAke2lucHV0TmFtZX1cXGAgYXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgcmVuZGVyZWQgaW1hZ2UgaXMgbm90IHZpc3VhbGx5IGRpc3RvcnRlZC4gRWZmZWN0aXZlbHkgdGhpcyBpcyBjaGVja2luZzpcbiAqIC0gV2hldGhlciB0aGUgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgcmVmbGVjdCB0aGUgYWN0dWFsIGRpbWVuc2lvbnMgb2YgdGhlIGltYWdlLlxuICogLSBXaGV0aGVyIGltYWdlIHN0eWxpbmcgaXMgXCJjb3JyZWN0XCIgKHNlZSBiZWxvdyBmb3IgYSBsb25nZXIgZXhwbGFuYXRpb24pLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbihcbiAgZGlyOiBOZ09wdGltaXplZEltYWdlLFxuICBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4pIHtcbiAgY29uc3QgcmVtb3ZlTG9hZExpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMb2FkTGlzdGVuZXJGbigpO1xuICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShpbWcpO1xuICAgIGxldCByZW5kZXJlZFdpZHRoID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJykpO1xuICAgIGxldCByZW5kZXJlZEhlaWdodCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdoZWlnaHQnKSk7XG4gICAgY29uc3QgYm94U2l6aW5nID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdib3gtc2l6aW5nJyk7XG5cbiAgICBpZiAoYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcpIHtcbiAgICAgIGNvbnN0IHBhZGRpbmdUb3AgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctdG9wJyk7XG4gICAgICBjb25zdCBwYWRkaW5nUmlnaHQgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctcmlnaHQnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdCb3R0b20gPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctYm90dG9tJyk7XG4gICAgICBjb25zdCBwYWRkaW5nTGVmdCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1sZWZ0Jyk7XG4gICAgICByZW5kZXJlZFdpZHRoIC09IHBhcnNlRmxvYXQocGFkZGluZ1JpZ2h0KSArIHBhcnNlRmxvYXQocGFkZGluZ0xlZnQpO1xuICAgICAgcmVuZGVyZWRIZWlnaHQgLT0gcGFyc2VGbG9hdChwYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQocGFkZGluZ0JvdHRvbSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVuZGVyZWRBc3BlY3RSYXRpbyA9IHJlbmRlcmVkV2lkdGggLyByZW5kZXJlZEhlaWdodDtcbiAgICBjb25zdCBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zID0gcmVuZGVyZWRXaWR0aCAhPT0gMCAmJiByZW5kZXJlZEhlaWdodCAhPT0gMDtcblxuICAgIGNvbnN0IGludHJpbnNpY1dpZHRoID0gaW1nLm5hdHVyYWxXaWR0aDtcbiAgICBjb25zdCBpbnRyaW5zaWNIZWlnaHQgPSBpbWcubmF0dXJhbEhlaWdodDtcbiAgICBjb25zdCBpbnRyaW5zaWNBc3BlY3RSYXRpbyA9IGludHJpbnNpY1dpZHRoIC8gaW50cmluc2ljSGVpZ2h0O1xuXG4gICAgY29uc3Qgc3VwcGxpZWRXaWR0aCA9IGRpci53aWR0aCE7XG4gICAgY29uc3Qgc3VwcGxpZWRIZWlnaHQgPSBkaXIuaGVpZ2h0ITtcbiAgICBjb25zdCBzdXBwbGllZEFzcGVjdFJhdGlvID0gc3VwcGxpZWRXaWR0aCAvIHN1cHBsaWVkSGVpZ2h0O1xuXG4gICAgLy8gVG9sZXJhbmNlIGlzIHVzZWQgdG8gYWNjb3VudCBmb3IgdGhlIGltcGFjdCBvZiBzdWJwaXhlbCByZW5kZXJpbmcuXG4gICAgLy8gRHVlIHRvIHN1YnBpeGVsIHJlbmRlcmluZywgdGhlIHJlbmRlcmVkLCBpbnRyaW5zaWMsIGFuZCBzdXBwbGllZFxuICAgIC8vIGFzcGVjdCByYXRpb3Mgb2YgYSBjb3JyZWN0bHkgY29uZmlndXJlZCBpbWFnZSBtYXkgbm90IGV4YWN0bHkgbWF0Y2guXG4gICAgLy8gRm9yIGV4YW1wbGUsIGEgYHdpZHRoPTQwMzAgaGVpZ2h0PTMwMjBgIGltYWdlIG1pZ2h0IGhhdmUgYSByZW5kZXJlZFxuICAgIC8vIHNpemUgb2YgXCIxMDYydywgNzk2LjQ4aFwiLiAoQW4gYXNwZWN0IHJhdGlvIG9mIDEuMzM0Li4uIHZzLiAxLjMzMy4uLilcbiAgICBjb25zdCBpbmFjY3VyYXRlRGltZW5zaW9ucyA9XG4gICAgICBNYXRoLmFicyhzdXBwbGllZEFzcGVjdFJhdGlvIC0gaW50cmluc2ljQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcbiAgICBjb25zdCBzdHlsaW5nRGlzdG9ydGlvbiA9XG4gICAgICBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICBNYXRoLmFicyhpbnRyaW5zaWNBc3BlY3RSYXRpbyAtIHJlbmRlcmVkQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcblxuICAgIGlmIChpbmFjY3VyYXRlRGltZW5zaW9ucykge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgaW1hZ2UgZG9lcyBub3QgbWF0Y2ggYCArXG4gICAgICAgICAgICBgdGhlIGFzcGVjdCByYXRpbyBpbmRpY2F0ZWQgYnkgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy4gYCArXG4gICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtyb3VuZChcbiAgICAgICAgICAgICAgaW50cmluc2ljQXNwZWN0UmF0aW8sXG4gICAgICAgICAgICApfSkuIFxcblN1cHBsaWVkIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlczogYCArXG4gICAgICAgICAgICBgJHtzdXBwbGllZFdpZHRofXcgeCAke3N1cHBsaWVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtyb3VuZChcbiAgICAgICAgICAgICAgc3VwcGxpZWRBc3BlY3RSYXRpbyxcbiAgICAgICAgICAgICl9KS4gYCArXG4gICAgICAgICAgICBgXFxuVG8gZml4IHRoaXMsIHVwZGF0ZSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoc3R5bGluZ0Rpc3RvcnRpb24pIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIHJlbmRlcmVkIGltYWdlIGAgK1xuICAgICAgICAgICAgYGRvZXMgbm90IG1hdGNoIHRoZSBpbWFnZSdzIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIGAgK1xuICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7cm91bmQoaW50cmluc2ljQXNwZWN0UmF0aW8pfSkuIFxcblJlbmRlcmVkIGltYWdlIHNpemU6IGAgK1xuICAgICAgICAgICAgYCR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oIChhc3BlY3QtcmF0aW86IGAgK1xuICAgICAgICAgICAgYCR7cm91bmQocmVuZGVyZWRBc3BlY3RSYXRpbyl9KS4gXFxuVGhpcyBpc3N1ZSBjYW4gb2NjdXIgaWYgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGAgK1xuICAgICAgICAgICAgYGF0dHJpYnV0ZXMgYXJlIGFkZGVkIHRvIGFuIGltYWdlIHdpdGhvdXQgdXBkYXRpbmcgdGhlIGNvcnJlc3BvbmRpbmcgYCArXG4gICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgIGBhZGRpbmcgXCJoZWlnaHQ6IGF1dG9cIiBvciBcIndpZHRoOiBhdXRvXCIgdG8gdGhlIGltYWdlIHN0eWxpbmcgd2lsbCBmaXggYCArXG4gICAgICAgICAgICBgdGhpcyBpc3N1ZS5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKCFkaXIubmdTcmNzZXQgJiYgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucykge1xuICAgICAgLy8gSWYgYG5nU3Jjc2V0YCBoYXNuJ3QgYmVlbiBzZXQsIHNhbml0eSBjaGVjayB0aGUgaW50cmluc2ljIHNpemUuXG4gICAgICBjb25zdCByZWNvbW1lbmRlZFdpZHRoID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRXaWR0aDtcbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkSGVpZ2h0ID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRIZWlnaHQ7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRXaWR0aCA9IGludHJpbnNpY1dpZHRoIC0gcmVjb21tZW5kZWRXaWR0aCA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgY29uc3Qgb3ZlcnNpemVkSGVpZ2h0ID0gaW50cmluc2ljSGVpZ2h0IC0gcmVjb21tZW5kZWRIZWlnaHQgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGlmIChvdmVyc2l6ZWRXaWR0aCB8fCBvdmVyc2l6ZWRIZWlnaHQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX0lNQUdFLFxuICAgICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaW50cmluc2ljIGltYWdlIGlzIHNpZ25pZmljYW50bHkgYCArXG4gICAgICAgICAgICAgIGBsYXJnZXIgdGhhbiBuZWNlc3NhcnkuIGAgK1xuICAgICAgICAgICAgICBgXFxuUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICBgXFxuUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemU6ICR7cmVjb21tZW5kZWRXaWR0aH13IHggJHtyZWNvbW1lbmRlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgYFxcbk5vdGU6IFJlY29tbWVuZGVkIGludHJpbnNpYyBpbWFnZSBzaXplIGlzIGNhbGN1bGF0ZWQgYXNzdW1pbmcgYSBtYXhpbXVtIERQUiBvZiBgICtcbiAgICAgICAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfS4gVG8gaW1wcm92ZSBsb2FkaW5nIHRpbWUsIHJlc2l6ZSB0aGUgaW1hZ2UgYCArXG4gICAgICAgICAgICAgIGBvciBjb25zaWRlciB1c2luZyB0aGUgXCJuZ1NyY3NldFwiIGFuZCBcInNpemVzXCIgYXR0cmlidXRlcy5gLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBXZSBvbmx5IGxpc3RlbiB0byB0aGUgYGVycm9yYCBldmVudCB0byByZW1vdmUgdGhlIGBsb2FkYCBldmVudCBsaXN0ZW5lciBiZWNhdXNlIGl0IHdpbGwgbm90IGJlXG4gIC8vIGZpcmVkIGlmIHRoZSBpbWFnZSBmYWlscyB0byBsb2FkLiBUaGlzIGlzIGRvbmUgdG8gcHJldmVudCBtZW1vcnkgbGVha3MgaW4gZGV2ZWxvcG1lbnQgbW9kZVxuICAvLyBiZWNhdXNlIGltYWdlIGVsZW1lbnRzIGFyZW4ndCBnYXJiYWdlLWNvbGxlY3RlZCBwcm9wZXJseS4gSXQgaGFwcGVucyBiZWNhdXNlIHpvbmUuanMgc3RvcmVzIHRoZVxuICAvLyBldmVudCBsaXN0ZW5lciBkaXJlY3RseSBvbiB0aGUgZWxlbWVudCBhbmQgY2xvc3VyZXMgY2FwdHVyZSBgZGlyYC5cbiAgY29uc3QgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2Vycm9yJywgKCkgPT4ge1xuICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuKCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgc2V0LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgbWlzc2luZ0F0dHJpYnV0ZXMgPSBbXTtcbiAgaWYgKGRpci53aWR0aCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCd3aWR0aCcpO1xuICBpZiAoZGlyLmhlaWdodCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCdoZWlnaHQnKTtcbiAgaWYgKG1pc3NpbmdBdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGVzZSByZXF1aXJlZCBhdHRyaWJ1dGVzIGAgK1xuICAgICAgICBgYXJlIG1pc3Npbmc6ICR7bWlzc2luZ0F0dHJpYnV0ZXMubWFwKChhdHRyKSA9PiBgXCIke2F0dHJ9XCJgKS5qb2luKCcsICcpfS4gYCArXG4gICAgICAgIGBJbmNsdWRpbmcgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgd2lsbCBwcmV2ZW50IGltYWdlLXJlbGF0ZWQgbGF5b3V0IHNoaWZ0cy4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgaW5jbHVkZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyBvbiB0aGUgaW1hZ2UgdGFnIG9yIHR1cm4gb24gYCArXG4gICAgICAgIGBcImZpbGxcIiBtb2RlIHdpdGggdGhlIFxcYGZpbGxcXGAgYXR0cmlidXRlLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgd2lkdGggYW5kIGhlaWdodCBhcmUgbm90IHNldC4gVXNlZCBpbiBmaWxsIG1vZGUsIHdoZXJlIHRob3NlIGF0dHJpYnV0ZXMgZG9uJ3QgbWFrZVxuICogc2Vuc2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIud2lkdGggfHwgZGlyLmhlaWdodCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhdHRyaWJ1dGVzIFxcYGhlaWdodFxcYCBhbmQvb3IgXFxgd2lkdGhcXGAgYXJlIHByZXNlbnQgYCArXG4gICAgICAgIGBhbG9uZyB3aXRoIHRoZSBcXGBmaWxsXFxgIGF0dHJpYnV0ZS4gQmVjYXVzZSBcXGBmaWxsXFxgIG1vZGUgY2F1c2VzIGFuIGltYWdlIHRvIGZpbGwgaXRzIGNvbnRhaW5pbmcgYCArXG4gICAgICAgIGBlbGVtZW50LCB0aGUgc2l6ZSBhdHRyaWJ1dGVzIGhhdmUgbm8gZWZmZWN0IGFuZCBzaG91bGQgYmUgcmVtb3ZlZC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBoYXMgYSBub256ZXJvIGhlaWdodC4gSWYgdGhlIGltYWdlIGlzIGluIGZpbGwgbW9kZSwgcHJvdmlkZXNcbiAqIGd1aWRhbmNlIHRoYXQgdGhpcyBjYW4gYmUgY2F1c2VkIGJ5IHRoZSBjb250YWluaW5nIGVsZW1lbnQncyBDU1MgcG9zaXRpb24gcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vblplcm9SZW5kZXJlZEhlaWdodChcbiAgZGlyOiBOZ09wdGltaXplZEltYWdlLFxuICBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4pIHtcbiAgY29uc3QgcmVtb3ZlTG9hZExpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMb2FkTGlzdGVuZXJGbigpO1xuICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICAgIGNvbnN0IHJlbmRlcmVkSGVpZ2h0ID0gaW1nLmNsaWVudEhlaWdodDtcbiAgICBpZiAoZGlyLmZpbGwgJiYgcmVuZGVyZWRIZWlnaHQgPT09IDApIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBoZWlnaHQgb2YgdGhlIGZpbGwtbW9kZSBpbWFnZSBpcyB6ZXJvLiBgICtcbiAgICAgICAgICAgIGBUaGlzIGlzIGxpa2VseSBiZWNhdXNlIHRoZSBjb250YWluaW5nIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSB0aGUgQ1NTICdwb3NpdGlvbicgYCArXG4gICAgICAgICAgICBgcHJvcGVydHkgc2V0IHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nOiBcInJlbGF0aXZlXCIsIFwiZml4ZWRcIiwgb3IgXCJhYnNvbHV0ZVwiLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcyBwcm9ibGVtLCBtYWtlIHN1cmUgdGhlIGNvbnRhaW5lciBlbGVtZW50IGhhcyB0aGUgQ1NTICdwb3NpdGlvbicgYCArXG4gICAgICAgICAgICBgcHJvcGVydHkgZGVmaW5lZCBhbmQgdGhlIGhlaWdodCBvZiB0aGUgZWxlbWVudCBpcyBub3QgemVyby5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFNlZSBjb21tZW50cyBpbiB0aGUgYGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uYC5cbiAgY29uc3QgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2Vycm9yJywgKCkgPT4ge1xuICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuKCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBsb2FkaW5nYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGEgdmFsaWQgaW5wdXQgJlxuICogaXMgbm90IHVzZWQgb24gcHJpb3JpdHkgaW1hZ2VzLlxuICovXG5mdW5jdGlvbiBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5sb2FkaW5nICYmIGRpci5wcmlvcml0eSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgYHdhcyB1c2VkIG9uIGFuIGltYWdlIHRoYXQgd2FzIG1hcmtlZCBcInByaW9yaXR5XCIuIGAgK1xuICAgICAgICBgU2V0dGluZyBcXGBsb2FkaW5nXFxgIG9uIHByaW9yaXR5IGltYWdlcyBpcyBub3QgYWxsb3dlZCBgICtcbiAgICAgICAgYGJlY2F1c2UgdGhlc2UgaW1hZ2VzIHdpbGwgYWx3YXlzIGJlIGVhZ2VybHkgbG9hZGVkLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCByZW1vdmUgdGhlIOKAnGxvYWRpbmfigJ0gYXR0cmlidXRlIGZyb20gdGhlIHByaW9yaXR5IGltYWdlLmAsXG4gICAgKTtcbiAgfVxuICBjb25zdCB2YWxpZElucHV0cyA9IFsnYXV0bycsICdlYWdlcicsICdsYXp5J107XG4gIGlmICh0eXBlb2YgZGlyLmxvYWRpbmcgPT09ICdzdHJpbmcnICYmICF2YWxpZElucHV0cy5pbmNsdWRlcyhkaXIubG9hZGluZykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgIGBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHtkaXIubG9hZGluZ31cXGApLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgdmFsaWQgdmFsdWUgKFwibGF6eVwiLCBcImVhZ2VyXCIsIG9yIFwiYXV0b1wiKS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBOT1QgdXNpbmcgYSBsb2FkZXIgKGZhbGxpbmcgYmFjayB0byB0aGUgZ2VuZXJpYyBsb2FkZXIpIGFuZFxuICogdGhlIGltYWdlIGFwcGVhcnMgdG8gYmUgaG9zdGVkIG9uIG9uZSBvZiB0aGUgaW1hZ2UgQ0ROcyBmb3Igd2hpY2hcbiAqIHdlIGRvIGhhdmUgYSBidWlsdC1pbiBpbWFnZSBsb2FkZXIuIFN1Z2dlc3RzIHN3aXRjaGluZyB0byB0aGVcbiAqIGJ1aWx0LWluIGxvYWRlci5cbiAqXG4gKiBAcGFyYW0gbmdTcmMgVmFsdWUgb2YgdGhlIG5nU3JjIGF0dHJpYnV0ZVxuICogQHBhcmFtIGltYWdlTG9hZGVyIEltYWdlTG9hZGVyIHByb3ZpZGVkXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdE1pc3NpbmdCdWlsdEluTG9hZGVyKG5nU3JjOiBzdHJpbmcsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGxldCBidWlsdEluTG9hZGVyTmFtZSA9ICcnO1xuICAgIGZvciAoY29uc3QgbG9hZGVyIG9mIEJVSUxUX0lOX0xPQURFUlMpIHtcbiAgICAgIGlmIChsb2FkZXIudGVzdFVybChuZ1NyYykpIHtcbiAgICAgICAgYnVpbHRJbkxvYWRlck5hbWUgPSBsb2FkZXIubmFtZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChidWlsdEluTG9hZGVyTmFtZSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX0JVSUxUSU5fTE9BREVSLFxuICAgICAgICAgIGBOZ09wdGltaXplZEltYWdlOiBJdCBsb29rcyBsaWtlIHlvdXIgaW1hZ2VzIG1heSBiZSBob3N0ZWQgb24gdGhlIGAgK1xuICAgICAgICAgICAgYCR7YnVpbHRJbkxvYWRlck5hbWV9IENETiwgYnV0IHlvdXIgYXBwIGlzIG5vdCB1c2luZyBBbmd1bGFyJ3MgYCArXG4gICAgICAgICAgICBgYnVpbHQtaW4gbG9hZGVyIGZvciB0aGF0IENETi4gV2UgcmVjb21tZW5kIHN3aXRjaGluZyB0byB1c2UgYCArXG4gICAgICAgICAgICBgdGhlIGJ1aWx0LWluIGJ5IGNhbGxpbmcgXFxgcHJvdmlkZSR7YnVpbHRJbkxvYWRlck5hbWV9TG9hZGVyKClcXGAgYCArXG4gICAgICAgICAgICBgaW4geW91ciBcXGBwcm92aWRlcnNcXGAgYW5kIHBhc3NpbmcgaXQgeW91ciBpbnN0YW5jZSdzIGJhc2UgVVJMLiBgICtcbiAgICAgICAgICAgIGBJZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGJ1aWx0LWluIGxvYWRlciwgZGVmaW5lIGEgY3VzdG9tIGAgK1xuICAgICAgICAgICAgYGxvYWRlciBmdW5jdGlvbiB1c2luZyBJTUFHRV9MT0FERVIgdG8gc2lsZW5jZSB0aGlzIHdhcm5pbmcuYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgbmdTcmNzZXQgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLm5nU3Jjc2V0ICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19ORUNFU1NBUllfTE9BREVSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBhdHRyaWJ1dGUgaXMgcHJlc2VudCBidXQgYCArXG4gICAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgICAgYHdoaWNoIHdvdWxkIHJlc3VsdCBpbiB0aGUgc2FtZSBpbWFnZSBiZWluZyB1c2VkIGZvciBhbGwgY29uZmlndXJlZCBzaXplcy4gYCArXG4gICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgbmdTcmNzZXRcXGAgYXR0cmlidXRlIGZyb20gdGhlIGltYWdlLmAsXG4gICAgICApLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBsb2FkZXJQYXJhbXMgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nXG4gKiB1c2VkKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Mb2FkZXJQYXJhbXNXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIubG9hZGVyUGFyYW1zICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19ORUNFU1NBUllfTE9BREVSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkZXJQYXJhbXNcXGAgYXR0cmlidXRlIGlzIHByZXNlbnQgYnV0IGAgK1xuICAgICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICAgIGB3aGljaCBtZWFucyB0aGF0IHRoZSBsb2FkZXJQYXJhbXMgZGF0YSB3aWxsIG5vdCBiZSBjb25zdW1lZCBhbmQgd2lsbCBub3QgYWZmZWN0IHRoZSBVUkwuIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGN1c3RvbSBsb2FkZXIgb3IgcmVtb3ZlIHRoZSBcXGBsb2FkZXJQYXJhbXNcXGAgYXR0cmlidXRlIGZyb20gdGhlIGltYWdlLmAsXG4gICAgICApLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiB0aGUgcHJpb3JpdHkgYXR0cmlidXRlIGlzIHVzZWQgdG9vIG9mdGVuIG9uIHBhZ2UgbG9hZFxuICovXG5hc3luYyBmdW5jdGlvbiBhc3NldFByaW9yaXR5Q291bnRCZWxvd1RocmVzaG9sZChhcHBSZWY6IEFwcGxpY2F0aW9uUmVmKSB7XG4gIGlmIChJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVCA9PT0gMCkge1xuICAgIElNR1NfV0lUSF9QUklPUklUWV9BVFRSX0NPVU5UKys7XG4gICAgYXdhaXQgd2hlblN0YWJsZShhcHBSZWYpO1xuICAgIGlmIChJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVCA+IFBSSU9SSVRZX0NPVU5UX1RIUkVTSE9MRCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5UT09fTUFOWV9QUklPUklUWV9BVFRSSUJVVEVTLFxuICAgICAgICAgIGBOZ09wdGltaXplZEltYWdlOiBUaGUgXCJwcmlvcml0eVwiIGF0dHJpYnV0ZSBpcyBzZXQgdG8gdHJ1ZSBtb3JlIHRoYW4gJHtQUklPUklUWV9DT1VOVF9USFJFU0hPTER9IHRpbWVzICgke0lNR1NfV0lUSF9QUklPUklUWV9BVFRSX0NPVU5UfSB0aW1lcykuIGAgK1xuICAgICAgICAgICAgYE1hcmtpbmcgdG9vIG1hbnkgaW1hZ2VzIGFzIFwiaGlnaFwiIHByaW9yaXR5IGNhbiBodXJ0IHlvdXIgYXBwbGljYXRpb24ncyBMQ1AgKGh0dHBzOi8vd2ViLmRldi9sY3ApLiBgICtcbiAgICAgICAgICAgIGBcIlByaW9yaXR5XCIgc2hvdWxkIG9ubHkgYmUgc2V0IG9uIHRoZSBpbWFnZSBleHBlY3RlZCB0byBiZSB0aGUgcGFnZSdzIExDUCBlbGVtZW50LmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVCsrO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgcGxhY2Vob2xkZXIncyBkaW1lbnNpb24gYXJlIG92ZXIgYSB0aHJlc2hvbGQuXG4gKlxuICogVGhpcyBhc3NlcnQgZnVuY3Rpb24gaXMgbWVhbnQgdG8gb25seSBydW4gb24gdGhlIGJyb3dzZXIuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFBsYWNlaG9sZGVyRGltZW5zaW9ucyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQpIHtcbiAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGltZ0VsZW1lbnQpO1xuICBsZXQgcmVuZGVyZWRXaWR0aCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd3aWR0aCcpKTtcbiAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcblxuICBpZiAocmVuZGVyZWRXaWR0aCA+IFBMQUNFSE9MREVSX0RJTUVOU0lPTl9MSU1JVCB8fCByZW5kZXJlZEhlaWdodCA+IFBMQUNFSE9MREVSX0RJTUVOU0lPTl9MSU1JVCkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5QTEFDRUhPTERFUl9ESU1FTlNJT05fTElNSVRfRVhDRUVERUQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gaXQgdXNlcyBhIHBsYWNlaG9sZGVyIGltYWdlLCBidXQgYXQgbGVhc3Qgb25lIGAgK1xuICAgICAgICAgIGBvZiB0aGUgZGltZW5zaW9ucyBhdHRyaWJ1dGUgKGhlaWdodCBvciB3aWR0aCkgZXhjZWVkcyB0aGUgbGltaXQgb2YgJHtQTEFDRUhPTERFUl9ESU1FTlNJT05fTElNSVR9cHguIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgdXNlIGEgc21hbGxlciBpbWFnZSBhcyBhIHBsYWNlaG9sZGVyLmAsXG4gICAgICApLFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcm91bmQoaW5wdXQ6IG51bWJlcik6IG51bWJlciB8IHN0cmluZyB7XG4gIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSA/IGlucHV0IDogaW5wdXQudG9GaXhlZCgyKTtcbn1cblxuLy8gVHJhbnNmb3JtIGZ1bmN0aW9uIHRvIGhhbmRsZSBTYWZlVmFsdWUgaW5wdXQgZm9yIG5nU3JjLiBUaGlzIGRvZXNuJ3QgZG8gYW55IHNhbml0aXphdGlvbixcbi8vIGFzIHRoYXQgaXMgbm90IG5lZWRlZCBmb3IgaW1nLnNyYyBhbmQgaW1nLnNyY3NldC4gVGhpcyB0cmFuc2Zvcm0gaXMgcHVyZWx5IGZvciBjb21wYXRpYmlsaXR5LlxuZnVuY3Rpb24gdW53cmFwU2FmZVVybCh2YWx1ZTogc3RyaW5nIHwgU2FmZVZhbHVlKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHVud3JhcFNhZmVWYWx1ZSh2YWx1ZSk7XG59XG5cbi8vIFRyYW5zZm9ybSBmdW5jdGlvbiB0byBoYW5kbGUgaW5wdXRzIHdoaWNoIG1heSBiZSBib29sZWFucywgc3RyaW5ncywgb3Igc3RyaW5nIHJlcHJlc2VudGF0aW9uc1xuLy8gb2YgYm9vbGVhbiB2YWx1ZXMuIFVzZWQgZm9yIHRoZSBwbGFjZWhvbGRlciBhdHRyaWJ1dGUuXG5leHBvcnQgZnVuY3Rpb24gYm9vbGVhbk9yVXJsQXR0cmlidXRlKHZhbHVlOiBib29sZWFuIHwgc3RyaW5nKTogYm9vbGVhbiB8IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlICE9PSAndHJ1ZScgJiYgdmFsdWUgIT09ICdmYWxzZScgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBib29sZWFuQXR0cmlidXRlKHZhbHVlKTtcbn1cbiJdfQ==