/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, Directive, ElementRef, inject, Injector, Input, NgZone, numberAttribute, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS, ɵperformanceMarkFeature as performanceMarkFeature, ɵRuntimeError as RuntimeError, ɵunwrapSafeValue as unwrapSafeValue, ChangeDetectorRef, } from '@angular/core';
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
                // This leaves the Angular zone to avoid triggering unnecessary change detection cycles when
                // document.addEventListener is invoked
                if (!this.isServer) {
                    ngZone.runOutsideAngular(() => {
                        assetPriorityCountBelowThreshold();
                    });
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0-rc.0+sha-58be8e6", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.1.0-rc.0+sha-58be8e6", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], placeholder: ["placeholder", "placeholder", booleanOrUrlAttribute], placeholderConfig: "placeholderConfig", src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0\" : null", "style.background-size": "placeholder ? \"cover\" : null", "style.background-position": "placeholder ? \"50% 50%\" : null", "style.background-repeat": "placeholder ? \"no-repeat\" : null", "style.background-image": "placeholder ? generatePlaceholder(placeholder) : null", "style.filter": "placeholder && shouldBlurPlaceholder(placeholderConfig) ? \"blur(15px)\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0-rc.0+sha-58be8e6", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
function assetPriorityCountBelowThreshold() {
    if (IMGS_WITH_PRIORITY_ATTR_COUNT === 0) {
        document.addEventListener('DOMContentLoaded', () => {
            if (IMGS_WITH_PRIORITY_ATTR_COUNT > PRIORITY_COUNT_THRESHOLD) {
                console.warn(formatRuntimeError(2966 /* RuntimeErrorCode.TOO_MANY_PRIORITY_ATTRIBUTES */, `NgOptimizedImage: The "priority" attribute is set to true more than ${PRIORITY_COUNT_THRESHOLD} times (${IMGS_WITH_PRIORITY_ATTR_COUNT} times). ` +
                    `Marking too many images as "high" priority can hurt your application's LCP (https://web.dev/lcp). ` +
                    `"Priority" should only be set on the image expected to be the page's LCP element.`));
            }
        });
    }
    IMGS_WITH_PRIORITY_ATTR_COUNT++;
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
        console.warn(formatRuntimeError(2967 /* RuntimeErrorCode.PLACEHOLDER_DIMENSION_LIMIT_EXCEEDED */, `${imgDirectiveDetails(dir.ngSrc)} it uses a placeholder image, but at least one of ` +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLEVBQ1IsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEVBSWYsV0FBVyxFQUNYLFNBQVMsRUFFVCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsYUFBYSxJQUFJLFlBQVksRUFDN0Isc0JBQXNCLElBQUkscUJBQXFCLEVBRS9DLHVCQUF1QixJQUFJLHNCQUFzQixFQUNqRCxhQUFhLElBQUksWUFBWSxFQUU3QixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUN2RSxPQUFPLEVBQ0wsWUFBWSxFQUdaLGVBQWUsR0FDaEIsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJC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Q2hHLHlEQUF5RDtBQUN6RCxNQUFNLFVBQVUscUJBQXFCLENBQUMsS0FBdUI7SUFDM0QsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLE1BQU0sSUFBSSxLQUFLLEtBQUssT0FBTyxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUN2RixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBpbmplY3QsXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBudW1iZXJBdHRyaWJ1dGUsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFBMQVRGT1JNX0lELFxuICBSZW5kZXJlcjIsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVJTUFHRV9DT05GSUcgYXMgSU1BR0VfQ09ORklHLFxuICDJtUlNQUdFX0NPTkZJR19ERUZBVUxUUyBhcyBJTUFHRV9DT05GSUdfREVGQVVMVFMsXG4gIMm1SW1hZ2VDb25maWcgYXMgSW1hZ2VDb25maWcsXG4gIMm1cGVyZm9ybWFuY2VNYXJrRmVhdHVyZSBhcyBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG4gIMm1U2FmZVZhbHVlIGFzIFNhZmVWYWx1ZSxcbiAgybV1bndyYXBTYWZlVmFsdWUgYXMgdW53cmFwU2FmZVZhbHVlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnLi4vLi4vcGxhdGZvcm1faWQnO1xuXG5pbXBvcnQge2ltZ0RpcmVjdGl2ZURldGFpbHN9IGZyb20gJy4vZXJyb3JfaGVscGVyJztcbmltcG9ydCB7Y2xvdWRpbmFyeUxvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9jbG91ZGluYXJ5X2xvYWRlcic7XG5pbXBvcnQge1xuICBJTUFHRV9MT0FERVIsXG4gIEltYWdlTG9hZGVyLFxuICBJbWFnZUxvYWRlckNvbmZpZyxcbiAgbm9vcEltYWdlTG9hZGVyLFxufSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7aW1hZ2VLaXRMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VraXRfbG9hZGVyJztcbmltcG9ydCB7aW1naXhMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1naXhfbG9hZGVyJztcbmltcG9ydCB7bmV0bGlmeUxvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9uZXRsaWZ5X2xvYWRlcic7XG5pbXBvcnQge0xDUEltYWdlT2JzZXJ2ZXJ9IGZyb20gJy4vbGNwX2ltYWdlX29ic2VydmVyJztcbmltcG9ydCB7UHJlY29ubmVjdExpbmtDaGVja2VyfSBmcm9tICcuL3ByZWNvbm5lY3RfbGlua19jaGVja2VyJztcbmltcG9ydCB7UHJlbG9hZExpbmtDcmVhdG9yfSBmcm9tICcuL3ByZWxvYWQtbGluay1jcmVhdG9yJztcblxuLyoqXG4gKiBXaGVuIGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UgaXMgcGFzc2VkIGFzIGFuIGlucHV0IHRvIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLFxuICogYW4gZXJyb3IgaXMgdGhyb3duLiBUaGUgaW1hZ2UgY29udGVudCAoYXMgYSBzdHJpbmcpIG1pZ2h0IGJlIHZlcnkgbG9uZywgdGh1cyBtYWtpbmdcbiAqIGl0IGhhcmQgdG8gcmVhZCBhbiBlcnJvciBtZXNzYWdlIGlmIHRoZSBlbnRpcmUgc3RyaW5nIGlzIGluY2x1ZGVkLiBUaGlzIGNvbnN0IGRlZmluZXNcbiAqIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBlcnJvciBtZXNzYWdlLiBUaGUgcmVzdFxuICogb2YgdGhlIGNvbnRlbnQgaXMgdHJ1bmNhdGVkLlxuICovXG5jb25zdCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IgPSA1MDtcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIHdpZHRoIGRlc2NyaXB0b3JzLlxuICogU2hvdWxkIG1hdGNoIHNvbWV0aGluZyBsaWtlOiBcIjEwMHcsIDIwMHdcIi5cbiAqL1xuY29uc3QgVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZCt3XFxzKigsfCQpKXsxLH0pJC87XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICogU2hvdWxkIG1hdGNoIHNvbWV0aGluZyBsaWtlOiBcIjF4LCAyeCwgNTB4XCIuIEFsc28gc3VwcG9ydHMgZGVjaW1hbHMgbGlrZSBcIjEuNXgsIDEuNTB4XCIuXG4gKi9cbmNvbnN0IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZCsoXFwuXFxkKyk/eFxccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFNyY3NldCB2YWx1ZXMgd2l0aCBhIGRlbnNpdHkgZGVzY3JpcHRvciBoaWdoZXIgdGhhbiB0aGlzIHZhbHVlIHdpbGwgYWN0aXZlbHlcbiAqIHRocm93IGFuIGVycm9yLiBTdWNoIGRlbnNpdGllcyBhcmUgbm90IHBlcm1pdHRlZCBhcyB0aGV5IGNhdXNlIGltYWdlIHNpemVzXG4gKiB0byBiZSB1bnJlYXNvbmFibHkgbGFyZ2UgYW5kIHNsb3cgZG93biBMQ1AuXG4gKi9cbmV4cG9ydCBjb25zdCBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAgPSAzO1xuXG4vKipcbiAqIFVzZWQgb25seSBpbiBlcnJvciBtZXNzYWdlIHRleHQgdG8gY29tbXVuaWNhdGUgYmVzdCBwcmFjdGljZXMsIGFzIHdlIHdpbGxcbiAqIG9ubHkgdGhyb3cgYmFzZWQgb24gdGhlIHNsaWdodGx5IG1vcmUgY29uc2VydmF0aXZlIEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUC5cbiAqL1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCA9IDI7XG5cbi8qKlxuICogVXNlZCBpbiBnZW5lcmF0aW5nIGF1dG9tYXRpYyBkZW5zaXR5LWJhc2VkIHNyY3NldHNcbiAqL1xuY29uc3QgREVOU0lUWV9TUkNTRVRfTVVMVElQTElFUlMgPSBbMSwgMl07XG5cbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggYnJlYWtwb2ludHMgdG8gdXNlIG9uIGZ1bGwtd2lkdGggaW1hZ2VzXG4gKi9cbmNvbnN0IFZJRVdQT1JUX0JSRUFLUE9JTlRfQ1VUT0ZGID0gNjQwO1xuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHR3byBhc3BlY3QgcmF0aW9zIGFyZSBzaW1pbGFyIGluIHZhbHVlLlxuICovXG5jb25zdCBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFID0gMC4xO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGltYWdlIGhhcyBiZWVuIHJlcXVlc3RlZCBhdCBhbiBvdmVybHlcbiAqIGxhcmdlIHNpemUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCByZW5kZXJlZCBpbWFnZSBzaXplIChhZnRlciB0YWtpbmdcbiAqIGludG8gYWNjb3VudCBhIHR5cGljYWwgZGV2aWNlIHBpeGVsIHJhdGlvKS4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTAwMDtcblxuLyoqXG4gKiBVc2VkIHRvIGxpbWl0IGF1dG9tYXRpYyBzcmNzZXQgZ2VuZXJhdGlvbiBvZiB2ZXJ5IGxhcmdlIHNvdXJjZXMgZm9yXG4gKiBmaXhlZC1zaXplIGltYWdlcy4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgPSAxOTIwO1xuY29uc3QgRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVCA9IDEwODA7XG5cbi8qKlxuICogRGVmYXVsdCBibHVyIHJhZGl1cyBvZiB0aGUgQ1NTIGZpbHRlciB1c2VkIG9uIHBsYWNlaG9sZGVyIGltYWdlcywgaW4gcGl4ZWxzXG4gKi9cbmV4cG9ydCBjb25zdCBQTEFDRUhPTERFUl9CTFVSX0FNT1VOVCA9IDE1O1xuXG4vKipcbiAqIFBsYWNlaG9sZGVyIGRpbWVuc2lvbiAoaGVpZ2h0IG9yIHdpZHRoKSBsaW1pdCBpbiBwaXhlbHMuIEFuZ3VsYXIgcHJvZHVjZXMgYSB3YXJuaW5nXG4gKiB3aGVuIHRoaXMgbGltaXQgaXMgY3Jvc3NlZC5cbiAqL1xuY29uc3QgUExBQ0VIT0xERVJfRElNRU5TSU9OX0xJTUlUID0gMTAwMDtcblxuLyoqXG4gKiBVc2VkIHRvIHdhcm4gb3IgZXJyb3Igd2hlbiB0aGUgdXNlciBwcm92aWRlcyBhbiBvdmVybHkgbGFyZ2UgZGF0YVVSTCBmb3IgdGhlIHBsYWNlaG9sZGVyXG4gKiBhdHRyaWJ1dGUuXG4gKiBDaGFyYWN0ZXIgY291bnQgb2YgQmFzZTY0IGltYWdlcyBpcyAxIGNoYXJhY3RlciBwZXIgYnl0ZSwgYW5kIGJhc2U2NCBlbmNvZGluZyBpcyBhcHByb3hpbWF0ZWx5XG4gKiAzMyUgbGFyZ2VyIHRoYW4gYmFzZSBpbWFnZXMsIHNvIDQwMDAgY2hhcmFjdGVycyBpcyBhcm91bmQgM0tCIG9uIGRpc2sgYW5kIDEwMDAwIGNoYXJhY3RlcnMgaXNcbiAqIGFyb3VuZCA3LjdLQi4gRXhwZXJpbWVudGFsbHksIDQwMDAgY2hhcmFjdGVycyBpcyBhYm91dCAyMHgyMHB4IGluIFBORyBvciBtZWRpdW0tcXVhbGl0eSBKUEVHXG4gKiBmb3JtYXQsIGFuZCAxMCwwMDAgaXMgYXJvdW5kIDUweDUwcHgsIGJ1dCB0aGVyZSdzIHF1aXRlIGEgYml0IG9mIHZhcmlhdGlvbiBkZXBlbmRpbmcgb24gaG93IHRoZVxuICogaW1hZ2UgaXMgc2F2ZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9XQVJOX0xJTUlUID0gNDAwMDtcbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9FUlJPUl9MSU1JVCA9IDEwMDAwO1xuXG4vKiogSW5mbyBhYm91dCBidWlsdC1pbiBsb2FkZXJzIHdlIGNhbiB0ZXN0IGZvci4gKi9cbmV4cG9ydCBjb25zdCBCVUlMVF9JTl9MT0FERVJTID0gW1xuICBpbWdpeExvYWRlckluZm8sXG4gIGltYWdlS2l0TG9hZGVySW5mbyxcbiAgY2xvdWRpbmFyeUxvYWRlckluZm8sXG4gIG5ldGxpZnlMb2FkZXJJbmZvLFxuXTtcblxuLyoqXG4gKiBUaHJlc2hvbGQgZm9yIHRoZSBQUklPUklUWV9UUlVFX0NPVU5UXG4gKi9cbmNvbnN0IFBSSU9SSVRZX0NPVU5UX1RIUkVTSE9MRCA9IDEwO1xuXG4vKipcbiAqIFRoaXMgY291bnQgaXMgdXNlZCB0byBsb2cgYSBkZXZNb2RlIHdhcm5pbmdcbiAqIHdoZW4gdGhlIGNvdW50IG9mIGRpcmVjdGl2ZSBpbnN0YW5jZXMgd2l0aCBwcmlvcml0eT10cnVlXG4gKiBleGNlZWRzIHRoZSB0aHJlc2hvbGQgUFJJT1JJVFlfQ09VTlRfVEhSRVNIT0xEXG4gKi9cbmxldCBJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVCA9IDA7XG5cbi8qKlxuICogQ29uZmlnIG9wdGlvbnMgdXNlZCBpbiByZW5kZXJpbmcgcGxhY2Vob2xkZXIgaW1hZ2VzLlxuICpcbiAqIEBzZWUge0BsaW5rIE5nT3B0aW1pemVkSW1hZ2V9XG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VQbGFjZWhvbGRlckNvbmZpZyB7XG4gIGJsdXI/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGltcHJvdmVzIGltYWdlIGxvYWRpbmcgcGVyZm9ybWFuY2UgYnkgZW5mb3JjaW5nIGJlc3QgcHJhY3RpY2VzLlxuICpcbiAqIGBOZ09wdGltaXplZEltYWdlYCBlbnN1cmVzIHRoYXQgdGhlIGxvYWRpbmcgb2YgdGhlIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBpbWFnZSBpc1xuICogcHJpb3JpdGl6ZWQgYnk6XG4gKiAtIEF1dG9tYXRpY2FsbHkgc2V0dGluZyB0aGUgYGZldGNocHJpb3JpdHlgIGF0dHJpYnV0ZSBvbiB0aGUgYDxpbWc+YCB0YWdcbiAqIC0gTGF6eSBsb2FkaW5nIG5vbi1wcmlvcml0eSBpbWFnZXMgYnkgZGVmYXVsdFxuICogLSBBdXRvbWF0aWNhbGx5IGdlbmVyYXRpbmcgYSBwcmVjb25uZWN0IGxpbmsgdGFnIGluIHRoZSBkb2N1bWVudCBoZWFkXG4gKlxuICogSW4gYWRkaXRpb24sIHRoZSBkaXJlY3RpdmU6XG4gKiAtIEdlbmVyYXRlcyBhcHByb3ByaWF0ZSBhc3NldCBVUkxzIGlmIGEgY29ycmVzcG9uZGluZyBgSW1hZ2VMb2FkZXJgIGZ1bmN0aW9uIGlzIHByb3ZpZGVkXG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVzIGEgc3Jjc2V0XG4gKiAtIFJlcXVpcmVzIHRoYXQgYHdpZHRoYCBhbmQgYGhlaWdodGAgYXJlIHNldFxuICogLSBXYXJucyBpZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGhhdmUgYmVlbiBzZXQgaW5jb3JyZWN0bHlcbiAqIC0gV2FybnMgaWYgdGhlIGltYWdlIHdpbGwgYmUgdmlzdWFsbHkgZGlzdG9ydGVkIHdoZW4gcmVuZGVyZWRcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgaXMgbWFya2VkIGFzIFtzdGFuZGFsb25lXShndWlkZS9jb21wb25lbnRzL2ltcG9ydGluZykgYW5kIGNhblxuICogYmUgaW1wb3J0ZWQgZGlyZWN0bHkuXG4gKlxuICogRm9sbG93IHRoZSBzdGVwcyBiZWxvdyB0byBlbmFibGUgYW5kIHVzZSB0aGUgZGlyZWN0aXZlOlxuICogMS4gSW1wb3J0IGl0IGludG8gdGhlIG5lY2Vzc2FyeSBOZ01vZHVsZSBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50LlxuICogMi4gT3B0aW9uYWxseSBwcm92aWRlIGFuIGBJbWFnZUxvYWRlcmAgaWYgeW91IHVzZSBhbiBpbWFnZSBob3N0aW5nIHNlcnZpY2UuXG4gKiAzLiBVcGRhdGUgdGhlIG5lY2Vzc2FyeSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIGFuZCByZXBsYWNlIGBzcmNgIGF0dHJpYnV0ZXMgd2l0aCBgbmdTcmNgLlxuICogVXNpbmcgYSBgbmdTcmNgIGFsbG93cyB0aGUgZGlyZWN0aXZlIHRvIGNvbnRyb2wgd2hlbiB0aGUgYHNyY2AgZ2V0cyBzZXQsIHdoaWNoIHRyaWdnZXJzIGFuIGltYWdlXG4gKiBkb3dubG9hZC5cbiAqXG4gKiBTdGVwIDE6IGltcG9ydCB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBOZ09wdGltaXplZEltYWdlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBJbmNsdWRlIGl0IGludG8gdGhlIG5lY2Vzc2FyeSBOZ01vZHVsZVxuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIEFwcE1vZHVsZSB7fVxuICpcbiAqIC8vIC4uLiBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc3RhbmRhbG9uZTogdHJ1ZVxuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgTXlTdGFuZGFsb25lQ29tcG9uZW50IHt9XG4gKiBgYGBcbiAqXG4gKiBTdGVwIDI6IGNvbmZpZ3VyZSBhIGxvYWRlci5cbiAqXG4gKiBUbyB1c2UgdGhlICoqZGVmYXVsdCBsb2FkZXIqKjogbm8gYWRkaXRpb25hbCBjb2RlIGNoYW5nZXMgYXJlIG5lY2Vzc2FyeS4gVGhlIFVSTCByZXR1cm5lZCBieSB0aGVcbiAqIGdlbmVyaWMgbG9hZGVyIHdpbGwgYWx3YXlzIG1hdGNoIHRoZSB2YWx1ZSBvZiBcInNyY1wiLiBJbiBvdGhlciB3b3JkcywgdGhpcyBsb2FkZXIgYXBwbGllcyBub1xuICogdHJhbnNmb3JtYXRpb25zIHRvIHRoZSByZXNvdXJjZSBVUkwgYW5kIHRoZSB2YWx1ZSBvZiB0aGUgYG5nU3JjYCBhdHRyaWJ1dGUgd2lsbCBiZSB1c2VkIGFzIGlzLlxuICpcbiAqIFRvIHVzZSBhbiBleGlzdGluZyBsb2FkZXIgZm9yIGEgKip0aGlyZC1wYXJ0eSBpbWFnZSBzZXJ2aWNlKio6IGFkZCB0aGUgcHJvdmlkZXIgZmFjdG9yeSBmb3IgeW91clxuICogY2hvc2VuIHNlcnZpY2UgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5LiBJbiB0aGUgZXhhbXBsZSBiZWxvdywgdGhlIEltZ2l4IGxvYWRlciBpcyB1c2VkOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7cHJvdmlkZUltZ2l4TG9hZGVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENhbGwgdGhlIGZ1bmN0aW9uIGFuZCBhZGQgdGhlIHJlc3VsdCB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXk6XG4gKiBwcm92aWRlcnM6IFtcbiAqICAgcHJvdmlkZUltZ2l4TG9hZGVyKFwiaHR0cHM6Ly9teS5iYXNlLnVybC9cIiksXG4gKiBdLFxuICogYGBgXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgcHJvdmlkZXMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gKiAtIGBwcm92aWRlQ2xvdWRmbGFyZUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVDbG91ZGluYXJ5TG9hZGVyYFxuICogLSBgcHJvdmlkZUltYWdlS2l0TG9hZGVyYFxuICogLSBgcHJvdmlkZUltZ2l4TG9hZGVyYFxuICpcbiAqIElmIHlvdSB1c2UgYSBkaWZmZXJlbnQgaW1hZ2UgcHJvdmlkZXIsIHlvdSBjYW4gY3JlYXRlIGEgY3VzdG9tIGxvYWRlciBmdW5jdGlvbiBhcyBkZXNjcmliZWRcbiAqIGJlbG93LlxuICpcbiAqIFRvIHVzZSBhICoqY3VzdG9tIGxvYWRlcioqOiBwcm92aWRlIHlvdXIgbG9hZGVyIGZ1bmN0aW9uIGFzIGEgdmFsdWUgZm9yIHRoZSBgSU1BR0VfTE9BREVSYCBESVxuICogdG9rZW4uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENvbmZpZ3VyZSB0aGUgbG9hZGVyIHVzaW5nIHRoZSBgSU1BR0VfTE9BREVSYCB0b2tlbi5cbiAqIHByb3ZpZGVyczogW1xuICogICB7XG4gKiAgICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAqICAgICAgdXNlVmFsdWU6IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiB7XG4gKiAgICAgICAgcmV0dXJuIGBodHRwczovL2V4YW1wbGUuY29tLyR7Y29uZmlnLnNyY30tJHtjb25maWcud2lkdGh9LmpwZ31gO1xuICogICAgICB9XG4gKiAgIH0sXG4gKiBdLFxuICogYGBgXG4gKlxuICogU3RlcCAzOiB1cGRhdGUgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyB0byB1c2UgYG5nU3JjYCBpbnN0ZWFkIG9mIGBzcmNgLlxuICpcbiAqIGBgYFxuICogPGltZyBuZ1NyYz1cImxvZ28ucG5nXCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIxMDBcIj5cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnaW1nW25nU3JjXScsXG4gIGhvc3Q6IHtcbiAgICAnW3N0eWxlLnBvc2l0aW9uXSc6ICdmaWxsID8gXCJhYnNvbHV0ZVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS53aWR0aF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5oZWlnaHRdJzogJ2ZpbGwgPyBcIjEwMCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuaW5zZXRdJzogJ2ZpbGwgPyBcIjBcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1zaXplXSc6ICdwbGFjZWhvbGRlciA/IFwiY292ZXJcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1wb3NpdGlvbl0nOiAncGxhY2Vob2xkZXIgPyBcIjUwJSA1MCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1yZXBlYXRdJzogJ3BsYWNlaG9sZGVyID8gXCJuby1yZXBlYXRcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1pbWFnZV0nOiAncGxhY2Vob2xkZXIgPyBnZW5lcmF0ZVBsYWNlaG9sZGVyKHBsYWNlaG9sZGVyKSA6IG51bGwnLFxuICAgICdbc3R5bGUuZmlsdGVyXSc6IGBwbGFjZWhvbGRlciAmJiBzaG91bGRCbHVyUGxhY2Vob2xkZXIocGxhY2Vob2xkZXJDb25maWcpID8gXCJibHVyKCR7UExBQ0VIT0xERVJfQkxVUl9BTU9VTlR9cHgpXCIgOiBudWxsYCxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGltYWdlTG9hZGVyID0gaW5qZWN0KElNQUdFX0xPQURFUik7XG4gIHByaXZhdGUgY29uZmlnOiBJbWFnZUNvbmZpZyA9IHByb2Nlc3NDb25maWcoaW5qZWN0KElNQUdFX0NPTkZJRykpO1xuICBwcml2YXRlIHJlbmRlcmVyID0gaW5qZWN0KFJlbmRlcmVyMik7XG4gIHByaXZhdGUgaW1nRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuICBwcml2YXRlIGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0KFBMQVRGT1JNX0lEKSk7XG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlbG9hZExpbmtDcmVhdG9yID0gaW5qZWN0KFByZWxvYWRMaW5rQ3JlYXRvcik7XG5cbiAgLy8gYSBMQ1AgaW1hZ2Ugb2JzZXJ2ZXIgLSBzaG91bGQgYmUgaW5qZWN0ZWQgb25seSBpbiB0aGUgZGV2IG1vZGVcbiAgcHJpdmF0ZSBsY3BPYnNlcnZlciA9IG5nRGV2TW9kZSA/IHRoaXMuaW5qZWN0b3IuZ2V0KExDUEltYWdlT2JzZXJ2ZXIpIDogbnVsbDtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSByZXdyaXR0ZW4gYHNyY2Agb25jZSBhbmQgc3RvcmUgaXQuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIHJlcGV0aXRpdmUgY2FsY3VsYXRpb25zIGFuZCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBjbGVhbnVwIGluIHRoZVxuICAgKiBgbmdPbkRlc3Ryb3lgIGRvZXMgbm90IHJlbHkgb24gdGhlIGBJTUFHRV9MT0FERVJgIGxvZ2ljICh3aGljaCBpbiB0dXJuIGNhbiByZWx5IG9uIHNvbWUgb3RoZXJcbiAgICogaW5zdGFuY2UgdGhhdCBtaWdodCBiZSBhbHJlYWR5IGRlc3Ryb3llZCkuXG4gICAqL1xuICBwcml2YXRlIF9yZW5kZXJlZFNyYzogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIHNvdXJjZSBpbWFnZS5cbiAgICogSW1hZ2UgbmFtZSB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGFuZCB0aGUgZmluYWwgVVJMIHdpbGwgYmUgYXBwbGllZCBhcyB0aGUgYHNyY2BcbiAgICogcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKi9cbiAgQElucHV0KHtyZXF1aXJlZDogdHJ1ZSwgdHJhbnNmb3JtOiB1bndyYXBTYWZlVXJsfSkgbmdTcmMhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAgICogVGhlIGltYWdlIG5hbWUgd2lsbCBiZSB0YWtlbiBmcm9tIGBuZ1NyY2AgYW5kIGNvbWJpbmVkIHdpdGggdGhlIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eVxuICAgKiBkZXNjcmlwdG9ycyB0byBnZW5lcmF0ZSB0aGUgZmluYWwgYHNyY3NldGAgcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPGltZyBuZ1NyYz1cImhlbGxvLmpwZ1wiIG5nU3Jjc2V0PVwiMTAwdywgMjAwd1wiIC8+ICA9PlxuICAgKiA8aW1nIHNyYz1cInBhdGgvaGVsbG8uanBnXCIgc3Jjc2V0PVwicGF0aC9oZWxsby5qcGc/dz0xMDAgMTAwdywgcGF0aC9oZWxsby5qcGc/dz0yMDAgMjAwd1wiIC8+XG4gICAqIGBgYFxuICAgKi9cbiAgQElucHV0KCkgbmdTcmNzZXQhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBiYXNlIGBzaXplc2AgYXR0cmlidXRlIHBhc3NlZCB0aHJvdWdoIHRvIHRoZSBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFByb3ZpZGluZyBzaXplcyBjYXVzZXMgdGhlIGltYWdlIHRvIGNyZWF0ZSBhbiBhdXRvbWF0aWMgcmVzcG9uc2l2ZSBzcmNzZXQuXG4gICAqL1xuICBASW5wdXQoKSBzaXplcz86IHN0cmluZztcblxuICAvKipcbiAgICogRm9yIHJlc3BvbnNpdmUgaW1hZ2VzOiB0aGUgaW50cmluc2ljIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqIEZvciBmaXhlZCBzaXplIGltYWdlczogdGhlIGRlc2lyZWQgcmVuZGVyZWQgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBudW1iZXJBdHRyaWJ1dGV9KSB3aWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBGb3IgcmVzcG9uc2l2ZSBpbWFnZXM6IHRoZSBpbnRyaW5zaWMgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqIEZvciBmaXhlZCBzaXplIGltYWdlczogdGhlIGRlc2lyZWQgcmVuZGVyZWQgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSkgaGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFRoZSBkZXNpcmVkIGxvYWRpbmcgYmVoYXZpb3IgKGxhenksIGVhZ2VyLCBvciBhdXRvKS4gRGVmYXVsdHMgdG8gYGxhenlgLFxuICAgKiB3aGljaCBpcyByZWNvbW1lbmRlZCBmb3IgbW9zdCBpbWFnZXMuXG4gICAqXG4gICAqIFdhcm5pbmc6IFNldHRpbmcgaW1hZ2VzIGFzIGxvYWRpbmc9XCJlYWdlclwiIG9yIGxvYWRpbmc9XCJhdXRvXCIgbWFya3MgdGhlbVxuICAgKiBhcyBub24tcHJpb3JpdHkgaW1hZ2VzIGFuZCBjYW4gaHVydCBsb2FkaW5nIHBlcmZvcm1hbmNlLiBGb3IgaW1hZ2VzIHdoaWNoXG4gICAqIG1heSBiZSB0aGUgTENQIGVsZW1lbnQsIHVzZSB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUgaW5zdGVhZCBvZiBgbG9hZGluZ2AuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkaW5nPzogJ2xhenknIHwgJ2VhZ2VyJyB8ICdhdXRvJztcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbWFnZSBzaG91bGQgaGF2ZSBhIGhpZ2ggcHJpb3JpdHkuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIHByaW9yaXR5ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIERhdGEgdG8gcGFzcyB0aHJvdWdoIHRvIGN1c3RvbSBsb2FkZXJzLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGVyUGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzcmNzZXQgZ2VuZXJhdGlvbiBmb3IgdGhpcyBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZU9wdGltaXplZFNyY3NldCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbWFnZSB0byBcImZpbGwgbW9kZVwiLCB3aGljaCBlbGltaW5hdGVzIHRoZSBoZWlnaHQvd2lkdGggcmVxdWlyZW1lbnQgYW5kIGFkZHNcbiAgICogc3R5bGVzIHN1Y2ggdGhhdCB0aGUgaW1hZ2UgZmlsbHMgaXRzIGNvbnRhaW5pbmcgZWxlbWVudC5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZmlsbCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBBIFVSTCBvciBkYXRhIFVSTCBmb3IgYW4gaW1hZ2UgdG8gYmUgdXNlZCBhcyBhIHBsYWNlaG9sZGVyIHdoaWxlIHRoaXMgaW1hZ2UgbG9hZHMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbk9yVXJsQXR0cmlidXRlfSkgcGxhY2Vob2xkZXI/OiBzdHJpbmcgfCBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBDb25maWd1cmF0aW9uIG9iamVjdCBmb3IgcGxhY2Vob2xkZXIgc2V0dGluZ3MuIE9wdGlvbnM6XG4gICAqICAgKiBibHVyOiBTZXR0aW5nIHRoaXMgdG8gZmFsc2UgZGlzYWJsZXMgdGhlIGF1dG9tYXRpYyBDU1MgYmx1ci5cbiAgICovXG4gIEBJbnB1dCgpIHBsYWNlaG9sZGVyQ29uZmlnPzogSW1hZ2VQbGFjZWhvbGRlckNvbmZpZztcblxuICAvKipcbiAgICogVmFsdWUgb2YgdGhlIGBzcmNgIGF0dHJpYnV0ZSBpZiBzZXQgb24gdGhlIGhvc3QgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIGV4Y2x1c2l2ZWx5IHJlYWQgdG8gYXNzZXJ0IHRoYXQgYHNyY2AgaXMgbm90IHNldCBpbiBjb25mbGljdFxuICAgKiB3aXRoIGBuZ1NyY2AgYW5kIHRoYXQgaW1hZ2VzIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyYz86IHN0cmluZztcblxuICAvKipcbiAgICogVmFsdWUgb2YgdGhlIGBzcmNzZXRgIGF0dHJpYnV0ZSBpZiBzZXQgb24gdGhlIGhvc3QgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIGV4Y2x1c2l2ZWx5IHJlYWQgdG8gYXNzZXJ0IHRoYXQgYHNyY3NldGAgaXMgbm90IHNldCBpbiBjb25mbGljdFxuICAgKiB3aXRoIGBuZ1NyY3NldGAgYW5kIHRoYXQgaW1hZ2VzIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyY3NldD86IHN0cmluZztcblxuICAvKiogQG5vZG9jICovXG4gIG5nT25Jbml0KCkge1xuICAgIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUoJ05nT3B0aW1pemVkSW1hZ2UnKTtcblxuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICBhc3NlcnROb25FbXB0eUlucHV0KHRoaXMsICduZ1NyYycsIHRoaXMubmdTcmMpO1xuICAgICAgYXNzZXJ0VmFsaWROZ1NyY3NldCh0aGlzLCB0aGlzLm5nU3Jjc2V0KTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBpZiAodGhpcy5uZ1NyY3NldCkge1xuICAgICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90QmFzZTY0SW1hZ2UodGhpcyk7XG4gICAgICBhc3NlcnROb3RCbG9iVXJsKHRoaXMpO1xuICAgICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgICBhc3NlcnRFbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgICAvLyBUaGlzIGxlYXZlcyB0aGUgQW5ndWxhciB6b25lIHRvIGF2b2lkIHRyaWdnZXJpbmcgdW5uZWNlc3NhcnkgY2hhbmdlIGRldGVjdGlvbiBjeWNsZXMgd2hlblxuICAgICAgICAvLyBgbG9hZGAgdGFza3MgYXJlIGludm9rZWQgb24gaW1hZ2VzLlxuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgICAgICBhc3NlcnROb25aZXJvUmVuZGVyZWRIZWlnaHQodGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHRoaXMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFzc2VydEdyZWF0ZXJUaGFuWmVybyh0aGlzLCB0aGlzLndpZHRoLCAnd2lkdGgnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IGNoZWNrIGZvciBkaXN0b3J0ZWQgaW1hZ2VzIHdoZW4gbm90IGluIGZpbGwgbW9kZSwgd2hlcmVcbiAgICAgICAgLy8gaW1hZ2VzIG1heSBiZSBpbnRlbnRpb25hbGx5IHN0cmV0Y2hlZCwgY3JvcHBlZCBvciBsZXR0ZXJib3hlZC5cbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgICAgYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24odGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KHRoaXMpO1xuICAgICAgaWYgKCF0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29tcGxleFNpemVzKHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0VmFsaWRQbGFjZWhvbGRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vdE1pc3NpbmdCdWlsdEluTG9hZGVyKHRoaXMubmdTcmMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuICAgICAgYXNzZXJ0Tm9OZ1NyY3NldFdpdGhvdXRMb2FkZXIodGhpcywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb0xvYWRlclBhcmFtc1dpdGhvdXRMb2FkZXIodGhpcywgdGhpcy5pbWFnZUxvYWRlcik7XG5cbiAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sY3BPYnNlcnZlciEucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjLCB0aGlzLnByaW9yaXR5KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IGNoZWNrZXIgPSB0aGlzLmluamVjdG9yLmdldChQcmVjb25uZWN0TGlua0NoZWNrZXIpO1xuICAgICAgICBjaGVja2VyLmFzc2VydFByZWNvbm5lY3QodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5uZ1NyYyk7XG5cbiAgICAgICAgLy8gVGhpcyBsZWF2ZXMgdGhlIEFuZ3VsYXIgem9uZSB0byBhdm9pZCB0cmlnZ2VyaW5nIHVubmVjZXNzYXJ5IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzIHdoZW5cbiAgICAgICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBpcyBpbnZva2VkXG4gICAgICAgIGlmICghdGhpcy5pc1NlcnZlcikge1xuICAgICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICBhc3NldFByaW9yaXR5Q291bnRCZWxvd1RocmVzaG9sZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnBsYWNlaG9sZGVyKSB7XG4gICAgICB0aGlzLnJlbW92ZVBsYWNlaG9sZGVyT25Mb2FkKHRoaXMuaW1nRWxlbWVudCk7XG4gICAgfVxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZXMoKSB7XG4gICAgLy8gTXVzdCBzZXQgd2lkdGgvaGVpZ2h0IGV4cGxpY2l0bHkgaW4gY2FzZSB0aGV5IGFyZSBib3VuZCAoaW4gd2hpY2ggY2FzZSB0aGV5IHdpbGxcbiAgICAvLyBvbmx5IGJlIHJlZmxlY3RlZCBhbmQgbm90IGZvdW5kIGJ5IHRoZSBicm93c2VyKVxuICAgIGlmICh0aGlzLmZpbGwpIHtcbiAgICAgIHRoaXMuc2l6ZXMgfHw9ICcxMDB2dyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoIS50b1N0cmluZygpKTtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQhLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbG9hZGluZycsIHRoaXMuZ2V0TG9hZGluZ0JlaGF2aW9yKCkpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnZmV0Y2hwcmlvcml0eScsIHRoaXMuZ2V0RmV0Y2hQcmlvcml0eSgpKTtcblxuICAgIC8vIFRoZSBgZGF0YS1uZy1pbWdgIGF0dHJpYnV0ZSBmbGFncyBhbiBpbWFnZSBhcyB1c2luZyB0aGUgZGlyZWN0aXZlLCB0byBhbGxvd1xuICAgIC8vIGZvciBhbmFseXNpcyBvZiB0aGUgZGlyZWN0aXZlJ3MgcGVyZm9ybWFuY2UuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCduZy1pbWcnLCAndHJ1ZScpO1xuXG4gICAgLy8gVGhlIGBzcmNgIGFuZCBgc3Jjc2V0YCBhdHRyaWJ1dGVzIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgY29uc3QgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy51cGRhdGVTcmNBbmRTcmNzZXQoKTtcblxuICAgIGlmICh0aGlzLnNpemVzKSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NpemVzJywgdGhpcy5zaXplcyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU2VydmVyICYmIHRoaXMucHJpb3JpdHkpIHtcbiAgICAgIHRoaXMucHJlbG9hZExpbmtDcmVhdG9yLmNyZWF0ZVByZWxvYWRMaW5rVGFnKFxuICAgICAgICB0aGlzLnJlbmRlcmVyLFxuICAgICAgICB0aGlzLmdldFJld3JpdHRlblNyYygpLFxuICAgICAgICByZXdyaXR0ZW5TcmNzZXQsXG4gICAgICAgIHRoaXMuc2l6ZXMsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZSh0aGlzLCBjaGFuZ2VzLCBbXG4gICAgICAgICduZ1NyY3NldCcsXG4gICAgICAgICd3aWR0aCcsXG4gICAgICAgICdoZWlnaHQnLFxuICAgICAgICAncHJpb3JpdHknLFxuICAgICAgICAnZmlsbCcsXG4gICAgICAgICdsb2FkaW5nJyxcbiAgICAgICAgJ3NpemVzJyxcbiAgICAgICAgJ2xvYWRlclBhcmFtcycsXG4gICAgICAgICdkaXNhYmxlT3B0aW1pemVkU3Jjc2V0JyxcbiAgICAgIF0pO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlc1snbmdTcmMnXSAmJiAhY2hhbmdlc1snbmdTcmMnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGNvbnN0IG9sZFNyYyA9IHRoaXMuX3JlbmRlcmVkU3JjO1xuICAgICAgdGhpcy51cGRhdGVTcmNBbmRTcmNzZXQodHJ1ZSk7XG4gICAgICBjb25zdCBuZXdTcmMgPSB0aGlzLl9yZW5kZXJlZFNyYztcbiAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsICYmIG9sZFNyYyAmJiBuZXdTcmMgJiYgb2xkU3JjICE9PSBuZXdTcmMpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyPy51cGRhdGVJbWFnZShvbGRTcmMsIG5ld1NyYyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChuZ0Rldk1vZGUgJiYgY2hhbmdlc1sncGxhY2Vob2xkZXInXT8uY3VycmVudFZhbHVlICYmICF0aGlzLmlzU2VydmVyKSB7XG4gICAgICBhc3NlcnRQbGFjZWhvbGRlckRpbWVuc2lvbnModGhpcywgdGhpcy5pbWdFbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNhbGxJbWFnZUxvYWRlcihcbiAgICBjb25maWdXaXRob3V0Q3VzdG9tUGFyYW1zOiBPbWl0PEltYWdlTG9hZGVyQ29uZmlnLCAnbG9hZGVyUGFyYW1zJz4sXG4gICk6IHN0cmluZyB7XG4gICAgbGV0IGF1Z21lbnRlZENvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcgPSBjb25maWdXaXRob3V0Q3VzdG9tUGFyYW1zO1xuICAgIGlmICh0aGlzLmxvYWRlclBhcmFtcykge1xuICAgICAgYXVnbWVudGVkQ29uZmlnLmxvYWRlclBhcmFtcyA9IHRoaXMubG9hZGVyUGFyYW1zO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbWFnZUxvYWRlcihhdWdtZW50ZWRDb25maWcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRMb2FkaW5nQmVoYXZpb3IoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5sb2FkaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRpbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2VhZ2VyJyA6ICdsYXp5JztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RmV0Y2hQcmlvcml0eSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2hpZ2gnIDogJ2F1dG8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmMoKTogc3RyaW5nIHtcbiAgICAvLyBJbWFnZUxvYWRlckNvbmZpZyBzdXBwb3J0cyBzZXR0aW5nIGEgd2lkdGggcHJvcGVydHkuIEhvd2V2ZXIsIHdlJ3JlIG5vdCBzZXR0aW5nIHdpZHRoIGhlcmVcbiAgICAvLyBiZWNhdXNlIGlmIHRoZSBkZXZlbG9wZXIgdXNlcyByZW5kZXJlZCB3aWR0aCBpbnN0ZWFkIG9mIGludHJpbnNpYyB3aWR0aCBpbiB0aGUgSFRNTCB3aWR0aFxuICAgIC8vIGF0dHJpYnV0ZSwgdGhlIGltYWdlIHJlcXVlc3RlZCBtYXkgYmUgdG9vIHNtYWxsIGZvciAyeCsgc2NyZWVucy5cbiAgICBpZiAoIXRoaXMuX3JlbmRlcmVkU3JjKSB7XG4gICAgICBjb25zdCBpbWdDb25maWcgPSB7c3JjOiB0aGlzLm5nU3JjfTtcbiAgICAgIC8vIENhY2hlIGNhbGN1bGF0ZWQgaW1hZ2Ugc3JjIHRvIHJldXNlIGl0IGxhdGVyIGluIHRoZSBjb2RlLlxuICAgICAgdGhpcy5fcmVuZGVyZWRTcmMgPSB0aGlzLmNhbGxJbWFnZUxvYWRlcihpbWdDb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyZWRTcmM7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHdpZHRoU3JjU2V0ID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdCh0aGlzLm5nU3Jjc2V0KTtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSB0aGlzLm5nU3Jjc2V0XG4gICAgICAuc3BsaXQoJywnKVxuICAgICAgLmZpbHRlcigoc3JjKSA9PiBzcmMgIT09ICcnKVxuICAgICAgLm1hcCgoc3JjU3RyKSA9PiB7XG4gICAgICAgIHNyY1N0ciA9IHNyY1N0ci50cmltKCk7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gd2lkdGhTcmNTZXQgPyBwYXJzZUZsb2F0KHNyY1N0cikgOiBwYXJzZUZsb2F0KHNyY1N0cikgKiB0aGlzLndpZHRoITtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRofSl9ICR7c3JjU3RyfWA7XG4gICAgICB9KTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIGdldEF1dG9tYXRpY1NyY3NldCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnNpemVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZXNwb25zaXZlU3Jjc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpeGVkU3Jjc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXNwb25zaXZlU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qge2JyZWFrcG9pbnRzfSA9IHRoaXMuY29uZmlnO1xuXG4gICAgbGV0IGZpbHRlcmVkQnJlYWtwb2ludHMgPSBicmVha3BvaW50cyE7XG4gICAgaWYgKHRoaXMuc2l6ZXM/LnRyaW0oKSA9PT0gJzEwMHZ3Jykge1xuICAgICAgLy8gU2luY2UgdGhpcyBpcyBhIGZ1bGwtc2NyZWVuLXdpZHRoIGltYWdlLCBvdXIgc3Jjc2V0IG9ubHkgbmVlZHMgdG8gaW5jbHVkZVxuICAgICAgLy8gYnJlYWtwb2ludHMgd2l0aCBmdWxsIHZpZXdwb3J0IHdpZHRocy5cbiAgICAgIGZpbHRlcmVkQnJlYWtwb2ludHMgPSBicmVha3BvaW50cyEuZmlsdGVyKChicCkgPT4gYnAgPj0gVklFV1BPUlRfQlJFQUtQT0lOVF9DVVRPRkYpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmFsU3JjcyA9IGZpbHRlcmVkQnJlYWtwb2ludHMubWFwKFxuICAgICAgKGJwKSA9PiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aDogYnB9KX0gJHticH13YCxcbiAgICApO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlU3JjQW5kU3Jjc2V0KGZvcmNlU3JjUmVjYWxjID0gZmFsc2UpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGlmIChmb3JjZVNyY1JlY2FsYykge1xuICAgICAgLy8gUmVzZXQgY2FjaGVkIHZhbHVlLCBzbyB0aGF0IHRoZSBmb2xsb3d1cCBgZ2V0UmV3cml0dGVuU3JjKClgIGNhbGxcbiAgICAgIC8vIHdpbGwgcmVjYWxjdWxhdGUgaXQgYW5kIHVwZGF0ZSB0aGUgY2FjaGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmV3cml0dGVuU3JjID0gdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyYycsIHJld3JpdHRlblNyYyk7XG5cbiAgICBsZXQgcmV3cml0dGVuU3Jjc2V0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0UmV3cml0dGVuU3Jjc2V0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCkpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0QXV0b21hdGljU3Jjc2V0KCk7XG4gICAgfVxuXG4gICAgaWYgKHJld3JpdHRlblNyY3NldCkge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmNzZXQnLCByZXdyaXR0ZW5TcmNzZXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmV3cml0dGVuU3Jjc2V0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGaXhlZFNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTLm1hcChcbiAgICAgIChtdWx0aXBsaWVyKSA9PlxuICAgICAgICBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7XG4gICAgICAgICAgc3JjOiB0aGlzLm5nU3JjLFxuICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoISAqIG11bHRpcGxpZXIsXG4gICAgICAgIH0pfSAke211bHRpcGxpZXJ9eGAsXG4gICAgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCk6IGJvb2xlYW4ge1xuICAgIGxldCBvdmVyc2l6ZWRJbWFnZSA9IGZhbHNlO1xuICAgIGlmICghdGhpcy5zaXplcykge1xuICAgICAgb3ZlcnNpemVkSW1hZ2UgPVxuICAgICAgICB0aGlzLndpZHRoISA+IEZJWEVEX1NSQ1NFVF9XSURUSF9MSU1JVCB8fCB0aGlzLmhlaWdodCEgPiBGSVhFRF9TUkNTRVRfSEVJR0hUX0xJTUlUO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgIXRoaXMuZGlzYWJsZU9wdGltaXplZFNyY3NldCAmJlxuICAgICAgIXRoaXMuc3Jjc2V0ICYmXG4gICAgICB0aGlzLmltYWdlTG9hZGVyICE9PSBub29wSW1hZ2VMb2FkZXIgJiZcbiAgICAgICFvdmVyc2l6ZWRJbWFnZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpbWFnZSB1cmwgZm9ybWF0dGVkIGZvciB1c2Ugd2l0aCB0aGUgQ1NTIGJhY2tncm91bmQtaW1hZ2UgcHJvcGVydHkuIEV4cGVjdHMgb25lIG9mOlxuICAgKiAqIEEgYmFzZTY0IGVuY29kZWQgaW1hZ2UsIHdoaWNoIGlzIHdyYXBwZWQgYW5kIHBhc3NlZCB0aHJvdWdoLlxuICAgKiAqIEEgYm9vbGVhbi4gSWYgdHJ1ZSwgY2FsbHMgdGhlIGltYWdlIGxvYWRlciB0byBnZW5lcmF0ZSBhIHNtYWxsIHBsYWNlaG9sZGVyIHVybC5cbiAgICovXG4gIHByaXZhdGUgZ2VuZXJhdGVQbGFjZWhvbGRlcihwbGFjZWhvbGRlcklucHV0OiBzdHJpbmcgfCBib29sZWFuKTogc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwge1xuICAgIGNvbnN0IHtwbGFjZWhvbGRlclJlc29sdXRpb259ID0gdGhpcy5jb25maWc7XG4gICAgaWYgKHBsYWNlaG9sZGVySW5wdXQgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBgdXJsKCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe1xuICAgICAgICBzcmM6IHRoaXMubmdTcmMsXG4gICAgICAgIHdpZHRoOiBwbGFjZWhvbGRlclJlc29sdXRpb24sXG4gICAgICAgIGlzUGxhY2Vob2xkZXI6IHRydWUsXG4gICAgICB9KX0pYDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwbGFjZWhvbGRlcklucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGB1cmwoJHtwbGFjZWhvbGRlcklucHV0fSlgO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGJsdXIgc2hvdWxkIGJlIGFwcGxpZWQsIGJhc2VkIG9uIGFuIG9wdGlvbmFsIGJvb2xlYW5cbiAgICogcHJvcGVydHkgYGJsdXJgIHdpdGhpbiB0aGUgb3B0aW9uYWwgY29uZmlndXJhdGlvbiBvYmplY3QgYHBsYWNlaG9sZGVyQ29uZmlnYC5cbiAgICovXG4gIHByaXZhdGUgc2hvdWxkQmx1clBsYWNlaG9sZGVyKHBsYWNlaG9sZGVyQ29uZmlnPzogSW1hZ2VQbGFjZWhvbGRlckNvbmZpZyk6IGJvb2xlYW4ge1xuICAgIGlmICghcGxhY2Vob2xkZXJDb25maWcgfHwgIXBsYWNlaG9sZGVyQ29uZmlnLmhhc093blByb3BlcnR5KCdibHVyJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gQm9vbGVhbihwbGFjZWhvbGRlckNvbmZpZy5ibHVyKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlUGxhY2Vob2xkZXJPbkxvYWQoaW1nOiBIVE1MSW1hZ2VFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2VEZXRlY3RvclJlZiA9IHRoaXMuaW5qZWN0b3IuZ2V0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgICAgIHRoaXMucGxhY2Vob2xkZXIgPSBmYWxzZTtcbiAgICAgIGNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH07XG5cbiAgICBjb25zdCByZW1vdmVMb2FkTGlzdGVuZXJGbiA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCBjYWxsYmFjayk7XG4gICAgY29uc3QgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oaW1nLCAnZXJyb3InLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZW5kZXJlZFNyYyAhPT0gbnVsbCAmJiB0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3JlbmRlcmVkU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8qKlxuICogU29ydHMgcHJvdmlkZWQgY29uZmlnIGJyZWFrcG9pbnRzIGFuZCB1c2VzIGRlZmF1bHRzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29uZmlnKGNvbmZpZzogSW1hZ2VDb25maWcpOiBJbWFnZUNvbmZpZyB7XG4gIGxldCBzb3J0ZWRCcmVha3BvaW50czoge2JyZWFrcG9pbnRzPzogbnVtYmVyW119ID0ge307XG4gIGlmIChjb25maWcuYnJlYWtwb2ludHMpIHtcbiAgICBzb3J0ZWRCcmVha3BvaW50cy5icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIElNQUdFX0NPTkZJR19ERUZBVUxUUywgY29uZmlnLCBzb3J0ZWRCcmVha3BvaW50cyk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3JjXFxgIGFuZCBcXGBuZ1NyY1xcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGBuZ1NyY1xcYC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY3NldFxcYCBhbmQgXFxgbmdTcmNzZXRcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3Jjc2V0XFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYCArXG4gICAgICAgIGBcXGBuZ1NyY3NldFxcYC4gVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCYXNlNjQtZW5jb2RlZCBpbWFnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKG5nU3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgbmdTcmMgPSBuZ1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgbmdTcmNcXGAgaXMgYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgYCArXG4gICAgICAgIGAoJHtuZ1NyY30pLiBOZ09wdGltaXplZEltYWdlIGRvZXMgbm90IHN1cHBvcnQgQmFzZTY0LWVuY29kZWQgc3RyaW5ncy4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHN0YW5kYXJkIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSAnc2l6ZXMnIG9ubHkgaW5jbHVkZXMgcmVzcG9uc2l2ZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29tcGxleFNpemVzKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgc2l6ZXMgPSBkaXIuc2l6ZXM7XG4gIGlmIChzaXplcz8ubWF0Y2goLygoXFwpfCwpXFxzfF4pXFxkK3B4LykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgc2l6ZXNcXGAgd2FzIHNldCB0byBhIHN0cmluZyBpbmNsdWRpbmcgYCArXG4gICAgICAgIGBwaXhlbCB2YWx1ZXMuIEZvciBhdXRvbWF0aWMgXFxgc3Jjc2V0XFxgIGdlbmVyYXRpb24sIFxcYHNpemVzXFxgIG11c3Qgb25seSBpbmNsdWRlIHJlc3BvbnNpdmUgYCArXG4gICAgICAgIGB2YWx1ZXMsIHN1Y2ggYXMgXFxgc2l6ZXM9XCI1MHZ3XCJcXGAgb3IgXFxgc2l6ZXM9XCIobWluLXdpZHRoOiA3NjhweCkgNTB2dywgMTAwdndcIlxcYC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgbW9kaWZ5IHRoZSBcXGBzaXplc1xcYCBhdHRyaWJ1dGUsIG9yIHByb3ZpZGUgeW91ciBvd24gXFxgbmdTcmNzZXRcXGAgdmFsdWUgZGlyZWN0bHkuYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkUGxhY2Vob2xkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgYXNzZXJ0Tm9QbGFjZWhvbGRlckNvbmZpZ1dpdGhvdXRQbGFjZWhvbGRlcihkaXIpO1xuICBhc3NlcnROb1JlbGF0aXZlUGxhY2Vob2xkZXJXaXRob3V0TG9hZGVyKGRpciwgaW1hZ2VMb2FkZXIpO1xuICBhc3NlcnROb092ZXJzaXplZERhdGFVcmwoZGlyKTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHBsYWNlaG9sZGVyQ29uZmlnIGlzbid0IGJlaW5nIHVzZWQgd2l0aG91dCBwbGFjZWhvbGRlclxuICovXG5mdW5jdGlvbiBhc3NlcnROb1BsYWNlaG9sZGVyQ29uZmlnV2l0aG91dFBsYWNlaG9sZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnBsYWNlaG9sZGVyQ29uZmlnICYmICFkaXIucGxhY2Vob2xkZXIpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgZGlyLm5nU3JjLFxuICAgICAgICBmYWxzZSxcbiAgICAgICl9IFxcYHBsYWNlaG9sZGVyQ29uZmlnXFxgIG9wdGlvbnMgd2VyZSBwcm92aWRlZCBmb3IgYW4gYCArXG4gICAgICAgIGBpbWFnZSB0aGF0IGRvZXMgbm90IHVzZSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlLCBhbmQgd2lsbCBoYXZlIG5vIGVmZmVjdC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBhIHJlbGF0aXZlIFVSTCBwbGFjZWhvbGRlciBpcyBzcGVjaWZpZWQsIGJ1dCBubyBsb2FkZXIgaXMgcHJlc2VudCB0byBwcm92aWRlIHRoZSBzbWFsbFxuICogaW1hZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUmVsYXRpdmVQbGFjZWhvbGRlcldpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5wbGFjZWhvbGRlciA9PT0gdHJ1ZSAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19ORUNFU1NBUllfTE9BREVSLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGlzIHNldCB0byB0cnVlIGJ1dCBgICtcbiAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgIGB3aGljaCB3b3VsZCByZXN1bHQgaW4gdGhlIHNhbWUgaW1hZ2UgYmVpbmcgdXNlZCBmb3IgdGhlIHByaW1hcnkgaW1hZ2UgYW5kIGl0cyBwbGFjZWhvbGRlci4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gb3ZlcnNpemVkIGRhdGFVUkwgcGxhY2Vob2xkZXIgaXMgcHJvdmlkZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vT3ZlcnNpemVkRGF0YVVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKFxuICAgIGRpci5wbGFjZWhvbGRlciAmJlxuICAgIHR5cGVvZiBkaXIucGxhY2Vob2xkZXIgPT09ICdzdHJpbmcnICYmXG4gICAgZGlyLnBsYWNlaG9sZGVyLnN0YXJ0c1dpdGgoJ2RhdGE6JylcbiAgKSB7XG4gICAgaWYgKGRpci5wbGFjZWhvbGRlci5sZW5ndGggPiBEQVRBX1VSTF9FUlJPUl9MSU1JVCkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfUExBQ0VIT0xERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgZGlyLm5nU3JjLFxuICAgICAgICApfSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGlzIHNldCB0byBhIGRhdGEgVVJMIHdoaWNoIGlzIGxvbmdlciBgICtcbiAgICAgICAgICBgdGhhbiAke0RBVEFfVVJMX0VSUk9SX0xJTUlUfSBjaGFyYWN0ZXJzLiBUaGlzIGlzIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLCBhcyBsYXJnZSBpbmxpbmUgcGxhY2Vob2xkZXJzIGAgK1xuICAgICAgICAgIGBkaXJlY3RseSBpbmNyZWFzZSB0aGUgYnVuZGxlIHNpemUgb2YgQW5ndWxhciBhbmQgaHVydCBwYWdlIGxvYWQgcGVyZm9ybWFuY2UuIFRvIGZpeCB0aGlzLCBnZW5lcmF0ZSBgICtcbiAgICAgICAgICBgYSBzbWFsbGVyIGRhdGEgVVJMIHBsYWNlaG9sZGVyLmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGlyLnBsYWNlaG9sZGVyLmxlbmd0aCA+IERBVEFfVVJMX1dBUk5fTElNSVQpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX1BMQUNFSE9MREVSLFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICBkaXIubmdTcmMsXG4gICAgICAgICAgKX0gdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSBkYXRhIFVSTCB3aGljaCBpcyBsb25nZXIgYCArXG4gICAgICAgICAgICBgdGhhbiAke0RBVEFfVVJMX1dBUk5fTElNSVR9IGNoYXJhY3RlcnMuIFRoaXMgaXMgZGlzY291cmFnZWQsIGFzIGxhcmdlIGlubGluZSBwbGFjZWhvbGRlcnMgYCArXG4gICAgICAgICAgICBgZGlyZWN0bHkgaW5jcmVhc2UgdGhlIGJ1bmRsZSBzaXplIG9mIEFuZ3VsYXIgYW5kIGh1cnQgcGFnZSBsb2FkIHBlcmZvcm1hbmNlLiBGb3IgYmV0dGVyIGxvYWRpbmcgcGVyZm9ybWFuY2UsIGAgK1xuICAgICAgICAgICAgYGdlbmVyYXRlIGEgc21hbGxlciBkYXRhIFVSTCBwbGFjZWhvbGRlci5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCbG9iVXJsKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBjb25zdCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNcXGAgd2FzIHNldCB0byBhIGJsb2IgVVJMICgke25nU3JjfSkuIGAgK1xuICAgICAgICBgQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGlucHV0IGlzIHNldCB0byBhIG5vbi1lbXB0eSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7bmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgIGAoXFxgJHt2YWx1ZX1cXGApLiBUbyBmaXggdGhpcywgY2hhbmdlIHRoZSB2YWx1ZSB0byBhIG5vbi1lbXB0eSBzdHJpbmcuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3Jjc2V0YCBpcyBpbiBhIHZhbGlkIGZvcm1hdCwgZS5nLiBcIjEwMHcsIDIwMHdcIiBvciBcIjF4LCAyeFwiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWROZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyLCAnbmdTcmNzZXQnLCB2YWx1ZSk7XG4gIGNvbnN0IHN0cmluZ1ZhbCA9IHZhbHVlIGFzIHN0cmluZztcbiAgY29uc3QgaXNWYWxpZFdpZHRoRGVzY3JpcHRvciA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcbiAgY29uc3QgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yID0gVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG5cbiAgaWYgKGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcikge1xuICAgIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXIsIHN0cmluZ1ZhbCk7XG4gIH1cblxuICBjb25zdCBpc1ZhbGlkU3Jjc2V0ID0gaXNWYWxpZFdpZHRoRGVzY3JpcHRvciB8fCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3I7XG4gIGlmICghaXNWYWxpZFNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke3ZhbHVlfVxcYCkuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBcXGBuZ1NyY3NldFxcYCB1c2luZyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG9uZSBvciBtb3JlIHdpZHRoIGAgK1xuICAgICAgICBgZGVzY3JpcHRvcnMgKGUuZy4gXCIxMDB3LCAyMDB3XCIpIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMgKGUuZy4gXCIxeCwgMnhcIikuYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiBzdHJpbmcpIHtcbiAgY29uc3QgdW5kZXJEZW5zaXR5Q2FwID0gdmFsdWVcbiAgICAuc3BsaXQoJywnKVxuICAgIC5ldmVyeSgobnVtKSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBjb250YWlucyBhbiB1bnN1cHBvcnRlZCBpbWFnZSBkZW5zaXR5OmAgK1xuICAgICAgICBgXFxgJHt2YWx1ZX1cXGAuIE5nT3B0aW1pemVkSW1hZ2UgZ2VuZXJhbGx5IHJlY29tbWVuZHMgYSBtYXggaW1hZ2UgZGVuc2l0eSBvZiBgICtcbiAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggYnV0IHN1cHBvcnRzIGltYWdlIGRlbnNpdGllcyB1cCB0byBgICtcbiAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXguIFRoZSBodW1hbiBleWUgY2Fubm90IGRpc3Rpbmd1aXNoIGJldHdlZW4gaW1hZ2UgZGVuc2l0aWVzIGAgK1xuICAgICAgICBgZ3JlYXRlciB0aGFuICR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggLSB3aGljaCBtYWtlcyB0aGVtIHVubmVjZXNzYXJ5IGZvciBgICtcbiAgICAgICAgYG1vc3QgdXNlIGNhc2VzLiBJbWFnZXMgdGhhdCB3aWxsIGJlIHBpbmNoLXpvb21lZCBhcmUgdHlwaWNhbGx5IHRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciBgICtcbiAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXggaW1hZ2VzLiBQbGVhc2UgcmVtb3ZlIHRoZSBoaWdoIGRlbnNpdHkgZGVzY3JpcHRvciBhbmQgdHJ5IGFnYWluLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgUnVudGltZUVycm9yYCBpbnN0YW5jZSB0byByZXByZXNlbnQgYSBzaXR1YXRpb24gd2hlbiBhbiBpbnB1dCBpcyBzZXQgYWZ0ZXJcbiAqIHRoZSBkaXJlY3RpdmUgaGFzIGluaXRpYWxpemVkLlxuICovXG5mdW5jdGlvbiBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dE5hbWU6IHN0cmluZyk6IHt9IHtcbiAgbGV0IHJlYXNvbiE6IHN0cmluZztcbiAgaWYgKGlucHV0TmFtZSA9PT0gJ3dpZHRoJyB8fCBpbnB1dE5hbWUgPT09ICdoZWlnaHQnKSB7XG4gICAgcmVhc29uID1cbiAgICAgIGBDaGFuZ2luZyBcXGAke2lucHV0TmFtZX1cXGAgbWF5IHJlc3VsdCBpbiBkaWZmZXJlbnQgYXR0cmlidXRlIHZhbHVlIGAgK1xuICAgICAgYGFwcGxpZWQgdG8gdGhlIHVuZGVybHlpbmcgaW1hZ2UgZWxlbWVudCBhbmQgY2F1c2UgbGF5b3V0IHNoaWZ0cyBvbiBhIHBhZ2UuYDtcbiAgfSBlbHNlIHtcbiAgICByZWFzb24gPVxuICAgICAgYENoYW5naW5nIHRoZSBcXGAke2lucHV0TmFtZX1cXGAgd291bGQgaGF2ZSBubyBlZmZlY3Qgb24gdGhlIHVuZGVybHlpbmcgYCArXG4gICAgICBgaW1hZ2UgZWxlbWVudCwgYmVjYXVzZSB0aGUgcmVzb3VyY2UgbG9hZGluZyBoYXMgYWxyZWFkeSBvY2N1cnJlZC5gO1xuICB9XG4gIHJldHVybiBuZXcgUnVudGltZUVycm9yKFxuICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgd2FzIHVwZGF0ZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uIGAgK1xuICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS4gJHtyZWFzb259IGAgK1xuICAgICAgYFRvIGZpeCB0aGlzLCBlaXRoZXIgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCB0byBhIHN0YXRpYyB2YWx1ZSBgICtcbiAgICAgIGBvciB3cmFwIHRoZSBpbWFnZSBlbGVtZW50IGluIGFuICpuZ0lmIHRoYXQgaXMgZ2F0ZWQgb24gdGhlIG5lY2Vzc2FyeSB2YWx1ZS5gLFxuICApO1xufVxuXG4vKipcbiAqIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgZGlyOiBOZ09wdGltaXplZEltYWdlLFxuICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLFxuICBpbnB1dHM6IHN0cmluZ1tdLFxuKSB7XG4gIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgIGNvbnN0IGlzVXBkYXRlZCA9IGNoYW5nZXMuaGFzT3duUHJvcGVydHkoaW5wdXQpO1xuICAgIGlmIChpc1VwZGF0ZWQgJiYgIWNoYW5nZXNbaW5wdXRdLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgaWYgKGlucHV0ID09PSAnbmdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGBuZ1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgbmdTcmNgIGlzIGFscmVhZHkgc2V0LiBXZSB1c2VcbiAgICAgICAgLy8gYG5nU3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7bmdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLlxuICovXG5mdW5jdGlvbiBhc3NlcnRHcmVhdGVyVGhhblplcm8oZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBjb25zdCB2YWxpZE51bWJlciA9IHR5cGVvZiBpbnB1dFZhbHVlID09PSAnbnVtYmVyJyAmJiBpbnB1dFZhbHVlID4gMDtcbiAgY29uc3QgdmFsaWRTdHJpbmcgPVxuICAgIHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSAmJiBwYXJzZUludChpbnB1dFZhbHVlKSA+IDA7XG4gIGlmICghdmFsaWROdW1iZXIgJiYgIXZhbGlkU3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIFxcYCR7aW5wdXROYW1lfVxcYCBhcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsXG4gIGltZzogSFRNTEltYWdlRWxlbWVudCxcbiAgcmVuZGVyZXI6IFJlbmRlcmVyMixcbikge1xuICBjb25zdCByZW1vdmVMb2FkTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGltZyk7XG4gICAgbGV0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSk7XG4gICAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcbiAgICBjb25zdCBib3hTaXppbmcgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2JveC1zaXppbmcnKTtcblxuICAgIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdSaWdodCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpO1xuICAgICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1ib3R0b20nKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdMZWZ0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKTtcbiAgICAgIHJlbmRlcmVkV2lkdGggLT0gcGFyc2VGbG9hdChwYWRkaW5nUmlnaHQpICsgcGFyc2VGbG9hdChwYWRkaW5nTGVmdCk7XG4gICAgICByZW5kZXJlZEhlaWdodCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChwYWRkaW5nQm90dG9tKTtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBpbWcubmF0dXJhbFdpZHRoO1xuICAgIGNvbnN0IGludHJpbnNpY0hlaWdodCA9IGltZy5uYXR1cmFsSGVpZ2h0O1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgIE1hdGguYWJzKHN1cHBsaWVkQXNwZWN0UmF0aW8gLSBpbnRyaW5zaWNBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuICAgIGNvbnN0IHN0eWxpbmdEaXN0b3J0aW9uID1cbiAgICAgIG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgJiZcbiAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuXG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBpbWFnZSBkb2VzIG5vdCBtYXRjaCBgICtcbiAgICAgICAgICAgIGB0aGUgYXNwZWN0IHJhdGlvIGluZGljYXRlZCBieSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLiBgICtcbiAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKFxuICAgICAgICAgICAgICBpbnRyaW5zaWNBc3BlY3RSYXRpbyxcbiAgICAgICAgICAgICl9KS4gXFxuU3VwcGxpZWQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzOiBgICtcbiAgICAgICAgICAgIGAke3N1cHBsaWVkV2lkdGh9dyB4ICR7c3VwcGxpZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKFxuICAgICAgICAgICAgICBzdXBwbGllZEFzcGVjdFJhdGlvLFxuICAgICAgICAgICAgKX0pLiBgICtcbiAgICAgICAgICAgIGBcXG5UbyBmaXggdGhpcywgdXBkYXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzdHlsaW5nRGlzdG9ydGlvbikge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgcmVuZGVyZWQgaW1hZ2UgYCArXG4gICAgICAgICAgICBgZG9lcyBub3QgbWF0Y2ggdGhlIGltYWdlJ3MgaW50cmluc2ljIGFzcGVjdCByYXRpby4gYCArXG4gICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtyb3VuZChpbnRyaW5zaWNBc3BlY3RSYXRpbyl9KS4gXFxuUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogYCArXG4gICAgICAgICAgICBgJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogYCArXG4gICAgICAgICAgICBgJHtyb3VuZChyZW5kZXJlZEFzcGVjdFJhdGlvKX0pLiBcXG5UaGlzIGlzc3VlIGNhbiBvY2N1ciBpZiBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlcyBhcmUgYWRkZWQgdG8gYW4gaW1hZ2Ugd2l0aG91dCB1cGRhdGluZyB0aGUgY29ycmVzcG9uZGluZyBgICtcbiAgICAgICAgICAgIGBpbWFnZSBzdHlsaW5nLiBUbyBmaXggdGhpcywgYWRqdXN0IGltYWdlIHN0eWxpbmcuIEluIG1vc3QgY2FzZXMsIGAgK1xuICAgICAgICAgICAgYGFkZGluZyBcImhlaWdodDogYXV0b1wiIG9yIFwid2lkdGg6IGF1dG9cIiB0byB0aGUgaW1hZ2Ugc3R5bGluZyB3aWxsIGZpeCBgICtcbiAgICAgICAgICAgIGB0aGlzIGlzc3VlLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoIWRpci5uZ1NyY3NldCAmJiBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zKSB7XG4gICAgICAvLyBJZiBgbmdTcmNzZXRgIGhhc24ndCBiZWVuIHNldCwgc2FuaXR5IGNoZWNrIHRoZSBpbnRyaW5zaWMgc2l6ZS5cbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZFdpZHRoO1xuICAgICAgY29uc3QgcmVjb21tZW5kZWRIZWlnaHQgPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZEhlaWdodDtcbiAgICAgIGNvbnN0IG92ZXJzaXplZFdpZHRoID0gaW50cmluc2ljV2lkdGggLSByZWNvbW1lbmRlZFdpZHRoID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRIZWlnaHQgPSBpbnRyaW5zaWNIZWlnaHQgLSByZWNvbW1lbmRlZEhlaWdodCA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgaWYgKG92ZXJzaXplZFdpZHRoIHx8IG92ZXJzaXplZEhlaWdodCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfSU1BR0UsXG4gICAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBpbnRyaW5zaWMgaW1hZ2UgaXMgc2lnbmlmaWNhbnRseSBgICtcbiAgICAgICAgICAgICAgYGxhcmdlciB0aGFuIG5lY2Vzc2FyeS4gYCArXG4gICAgICAgICAgICAgIGBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgIGBcXG5SZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtyZWNvbW1lbmRlZFdpZHRofXcgeCAke3JlY29tbWVuZGVkSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICBgXFxuTm90ZTogUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemUgaXMgY2FsY3VsYXRlZCBhc3N1bWluZyBhIG1heGltdW0gRFBSIG9mIGAgK1xuICAgICAgICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9LiBUbyBpbXByb3ZlIGxvYWRpbmcgdGltZSwgcmVzaXplIHRoZSBpbWFnZSBgICtcbiAgICAgICAgICAgICAgYG9yIGNvbnNpZGVyIHVzaW5nIHRoZSBcIm5nU3Jjc2V0XCIgYW5kIFwic2l6ZXNcIiBhdHRyaWJ1dGVzLmAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIFdlIG9ubHkgbGlzdGVuIHRvIHRoZSBgZXJyb3JgIGV2ZW50IHRvIHJlbW92ZSB0aGUgYGxvYWRgIGV2ZW50IGxpc3RlbmVyIGJlY2F1c2UgaXQgd2lsbCBub3QgYmVcbiAgLy8gZmlyZWQgaWYgdGhlIGltYWdlIGZhaWxzIHRvIGxvYWQuIFRoaXMgaXMgZG9uZSB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcyBpbiBkZXZlbG9wbWVudCBtb2RlXG4gIC8vIGJlY2F1c2UgaW1hZ2UgZWxlbWVudHMgYXJlbid0IGdhcmJhZ2UtY29sbGVjdGVkIHByb3Blcmx5LiBJdCBoYXBwZW5zIGJlY2F1c2Ugem9uZS5qcyBzdG9yZXMgdGhlXG4gIC8vIGV2ZW50IGxpc3RlbmVyIGRpcmVjdGx5IG9uIHRoZSBlbGVtZW50IGFuZCBjbG9zdXJlcyBjYXB0dXJlIGBkaXJgLlxuICBjb25zdCByZW1vdmVFcnJvckxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnZXJyb3InLCAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBtaXNzaW5nQXR0cmlidXRlcyA9IFtdO1xuICBpZiAoZGlyLndpZHRoID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ3dpZHRoJyk7XG4gIGlmIChkaXIuaGVpZ2h0ID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ2hlaWdodCcpO1xuICBpZiAobWlzc2luZ0F0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlJFUVVJUkVEX0lOUFVUX01JU1NJTkcsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZXNlIHJlcXVpcmVkIGF0dHJpYnV0ZXMgYCArXG4gICAgICAgIGBhcmUgbWlzc2luZzogJHttaXNzaW5nQXR0cmlidXRlcy5tYXAoKGF0dHIpID0+IGBcIiR7YXR0cn1cImApLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICAgYEluY2x1ZGluZyBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyB3aWxsIHByZXZlbnQgaW1hZ2UtcmVsYXRlZCBsYXlvdXQgc2hpZnRzLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBpbmNsdWRlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIG9uIHRoZSBpbWFnZSB0YWcgb3IgdHVybiBvbiBgICtcbiAgICAgICAgYFwiZmlsbFwiIG1vZGUgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBub3Qgc2V0LiBVc2VkIGluIGZpbGwgbW9kZSwgd2hlcmUgdGhvc2UgYXR0cmlidXRlcyBkb24ndCBtYWtlXG4gKiBzZW5zZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0RW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci53aWR0aCB8fCBkaXIuaGVpZ2h0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGF0dHJpYnV0ZXMgXFxgaGVpZ2h0XFxgIGFuZC9vciBcXGB3aWR0aFxcYCBhcmUgcHJlc2VudCBgICtcbiAgICAgICAgYGFsb25nIHdpdGggdGhlIFxcYGZpbGxcXGAgYXR0cmlidXRlLiBCZWNhdXNlIFxcYGZpbGxcXGAgbW9kZSBjYXVzZXMgYW4gaW1hZ2UgdG8gZmlsbCBpdHMgY29udGFpbmluZyBgICtcbiAgICAgICAgYGVsZW1lbnQsIHRoZSBzaXplIGF0dHJpYnV0ZXMgaGF2ZSBubyBlZmZlY3QgYW5kIHNob3VsZCBiZSByZW1vdmVkLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGhhcyBhIG5vbnplcm8gaGVpZ2h0LiBJZiB0aGUgaW1hZ2UgaXMgaW4gZmlsbCBtb2RlLCBwcm92aWRlc1xuICogZ3VpZGFuY2UgdGhhdCB0aGlzIGNhbiBiZSBjYXVzZWQgYnkgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCdzIENTUyBwb3NpdGlvbiBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uWmVyb1JlbmRlcmVkSGVpZ2h0KFxuICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsXG4gIGltZzogSFRNTEltYWdlRWxlbWVudCxcbiAgcmVuZGVyZXI6IFJlbmRlcmVyMixcbikge1xuICBjb25zdCByZW1vdmVMb2FkTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgcmVuZGVyZWRIZWlnaHQgPSBpbWcuY2xpZW50SGVpZ2h0O1xuICAgIGlmIChkaXIuZmlsbCAmJiByZW5kZXJlZEhlaWdodCA9PT0gMCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGhlaWdodCBvZiB0aGUgZmlsbC1tb2RlIGltYWdlIGlzIHplcm8uIGAgK1xuICAgICAgICAgICAgYFRoaXMgaXMgbGlrZWx5IGJlY2F1c2UgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgIGBwcm9wZXJ0eSBzZXQgdG8gb25lIG9mIHRoZSBmb2xsb3dpbmc6IFwicmVsYXRpdmVcIiwgXCJmaXhlZFwiLCBvciBcImFic29sdXRlXCIuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzIHByb2JsZW0sIG1ha2Ugc3VyZSB0aGUgY29udGFpbmVyIGVsZW1lbnQgaGFzIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgIGBwcm9wZXJ0eSBkZWZpbmVkIGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50IGlzIG5vdCB6ZXJvLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gU2VlIGNvbW1lbnRzIGluIHRoZSBgYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb25gLlxuICBjb25zdCByZW1vdmVFcnJvckxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnZXJyb3InLCAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYGxvYWRpbmdgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSB2YWxpZCBpbnB1dCAmXG4gKiBpcyBub3QgdXNlZCBvbiBwcmlvcml0eSBpbWFnZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLmxvYWRpbmcgJiYgZGlyLnByaW9yaXR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICBgd2FzIHVzZWQgb24gYW4gaW1hZ2UgdGhhdCB3YXMgbWFya2VkIFwicHJpb3JpdHlcIi4gYCArXG4gICAgICAgIGBTZXR0aW5nIFxcYGxvYWRpbmdcXGAgb24gcHJpb3JpdHkgaW1hZ2VzIGlzIG5vdCBhbGxvd2VkIGAgK1xuICAgICAgICBgYmVjYXVzZSB0aGVzZSBpbWFnZXMgd2lsbCBhbHdheXMgYmUgZWFnZXJseSBsb2FkZWQuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHJlbW92ZSB0aGUg4oCcbG9hZGluZ+KAnSBhdHRyaWJ1dGUgZnJvbSB0aGUgcHJpb3JpdHkgaW1hZ2UuYCxcbiAgICApO1xuICB9XG4gIGNvbnN0IHZhbGlkSW5wdXRzID0gWydhdXRvJywgJ2VhZ2VyJywgJ2xhenknXTtcbiAgaWYgKHR5cGVvZiBkaXIubG9hZGluZyA9PT0gJ3N0cmluZycgJiYgIXZhbGlkSW5wdXRzLmluY2x1ZGVzKGRpci5sb2FkaW5nKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgYGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke2Rpci5sb2FkaW5nfVxcYCkuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSB2YWxpZCB2YWx1ZSAoXCJsYXp5XCIsIFwiZWFnZXJcIiwgb3IgXCJhdXRvXCIpLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIE5PVCB1c2luZyBhIGxvYWRlciAoZmFsbGluZyBiYWNrIHRvIHRoZSBnZW5lcmljIGxvYWRlcikgYW5kXG4gKiB0aGUgaW1hZ2UgYXBwZWFycyB0byBiZSBob3N0ZWQgb24gb25lIG9mIHRoZSBpbWFnZSBDRE5zIGZvciB3aGljaFxuICogd2UgZG8gaGF2ZSBhIGJ1aWx0LWluIGltYWdlIGxvYWRlci4gU3VnZ2VzdHMgc3dpdGNoaW5nIHRvIHRoZVxuICogYnVpbHQtaW4gbG9hZGVyLlxuICpcbiAqIEBwYXJhbSBuZ1NyYyBWYWx1ZSBvZiB0aGUgbmdTcmMgYXR0cmlidXRlXG4gKiBAcGFyYW0gaW1hZ2VMb2FkZXIgSW1hZ2VMb2FkZXIgcHJvdmlkZWRcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIobmdTcmM6IHN0cmluZywgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgbGV0IGJ1aWx0SW5Mb2FkZXJOYW1lID0gJyc7XG4gICAgZm9yIChjb25zdCBsb2FkZXIgb2YgQlVJTFRfSU5fTE9BREVSUykge1xuICAgICAgaWYgKGxvYWRlci50ZXN0VXJsKG5nU3JjKSkge1xuICAgICAgICBidWlsdEluTG9hZGVyTmFtZSA9IGxvYWRlci5uYW1lO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJ1aWx0SW5Mb2FkZXJOYW1lKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfQlVJTFRJTl9MT0FERVIsXG4gICAgICAgICAgYE5nT3B0aW1pemVkSW1hZ2U6IEl0IGxvb2tzIGxpa2UgeW91ciBpbWFnZXMgbWF5IGJlIGhvc3RlZCBvbiB0aGUgYCArXG4gICAgICAgICAgICBgJHtidWlsdEluTG9hZGVyTmFtZX0gQ0ROLCBidXQgeW91ciBhcHAgaXMgbm90IHVzaW5nIEFuZ3VsYXIncyBgICtcbiAgICAgICAgICAgIGBidWlsdC1pbiBsb2FkZXIgZm9yIHRoYXQgQ0ROLiBXZSByZWNvbW1lbmQgc3dpdGNoaW5nIHRvIHVzZSBgICtcbiAgICAgICAgICAgIGB0aGUgYnVpbHQtaW4gYnkgY2FsbGluZyBcXGBwcm92aWRlJHtidWlsdEluTG9hZGVyTmFtZX1Mb2FkZXIoKVxcYCBgICtcbiAgICAgICAgICAgIGBpbiB5b3VyIFxcYHByb3ZpZGVyc1xcYCBhbmQgcGFzc2luZyBpdCB5b3VyIGluc3RhbmNlJ3MgYmFzZSBVUkwuIGAgK1xuICAgICAgICAgICAgYElmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgYnVpbHQtaW4gbG9hZGVyLCBkZWZpbmUgYSBjdXN0b20gYCArXG4gICAgICAgICAgICBgbG9hZGVyIGZ1bmN0aW9uIHVzaW5nIElNQUdFX0xPQURFUiB0byBzaWxlbmNlIHRoaXMgd2FybmluZy5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBuZ1NyY3NldCBpcyBwcmVzZW50IGFuZCBubyBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vTmdTcmNzZXRXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIubmdTcmNzZXQgJiYgaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX05FQ0VTU0FSWV9MT0FERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICBgbm8gaW1hZ2UgbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLCBgICtcbiAgICAgICAgICBgd2hpY2ggd291bGQgcmVzdWx0IGluIHRoZSBzYW1lIGltYWdlIGJlaW5nIHVzZWQgZm9yIGFsbCBjb25maWd1cmVkIHNpemVzLiBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBsb2FkZXIgb3IgcmVtb3ZlIHRoZSBcXGBuZ1NyY3NldFxcYCBhdHRyaWJ1dGUgZnJvbSB0aGUgaW1hZ2UuYCxcbiAgICAgICksXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIGxvYWRlclBhcmFtcyBpcyBwcmVzZW50IGFuZCBubyBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmdcbiAqIHVzZWQpLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0xvYWRlclBhcmFtc1dpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5sb2FkZXJQYXJhbXMgJiYgaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX05FQ0VTU0FSWV9MT0FERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRlclBhcmFtc1xcYCBhdHRyaWJ1dGUgaXMgcHJlc2VudCBidXQgYCArXG4gICAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgICAgYHdoaWNoIG1lYW5zIHRoYXQgdGhlIGxvYWRlclBhcmFtcyBkYXRhIHdpbGwgbm90IGJlIGNvbnN1bWVkIGFuZCB3aWxsIG5vdCBhZmZlY3QgdGhlIFVSTC4gYCArXG4gICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgY3VzdG9tIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYGxvYWRlclBhcmFtc1xcYCBhdHRyaWJ1dGUgZnJvbSB0aGUgaW1hZ2UuYCxcbiAgICAgICksXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIHRoZSBwcmlvcml0eSBhdHRyaWJ1dGUgaXMgdXNlZCB0b28gb2Z0ZW4gb24gcGFnZSBsb2FkXG4gKi9cbmZ1bmN0aW9uIGFzc2V0UHJpb3JpdHlDb3VudEJlbG93VGhyZXNob2xkKCkge1xuICBpZiAoSU1HU19XSVRIX1BSSU9SSVRZX0FUVFJfQ09VTlQgPT09IDApIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAgICAgaWYgKElNR1NfV0lUSF9QUklPUklUWV9BVFRSX0NPVU5UID4gUFJJT1JJVFlfQ09VTlRfVEhSRVNIT0xEKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlRPT19NQU5ZX1BSSU9SSVRZX0FUVFJJQlVURVMsXG4gICAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZTogVGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUgaXMgc2V0IHRvIHRydWUgbW9yZSB0aGFuICR7UFJJT1JJVFlfQ09VTlRfVEhSRVNIT0xEfSB0aW1lcyAoJHtJTUdTX1dJVEhfUFJJT1JJVFlfQVRUUl9DT1VOVH0gdGltZXMpLiBgICtcbiAgICAgICAgICAgICAgYE1hcmtpbmcgdG9vIG1hbnkgaW1hZ2VzIGFzIFwiaGlnaFwiIHByaW9yaXR5IGNhbiBodXJ0IHlvdXIgYXBwbGljYXRpb24ncyBMQ1AgKGh0dHBzOi8vd2ViLmRldi9sY3ApLiBgICtcbiAgICAgICAgICAgICAgYFwiUHJpb3JpdHlcIiBzaG91bGQgb25seSBiZSBzZXQgb24gdGhlIGltYWdlIGV4cGVjdGVkIHRvIGJlIHRoZSBwYWdlJ3MgTENQIGVsZW1lbnQuYCxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIElNR1NfV0lUSF9QUklPUklUWV9BVFRSX0NPVU5UKys7XG59XG5cbi8qKlxuICogV2FybnMgaWYgcGxhY2Vob2xkZXIncyBkaW1lbnNpb24gYXJlIG92ZXIgYSB0aHJlc2hvbGQuXG4gKlxuICogVGhpcyBhc3NlcnQgZnVuY3Rpb24gaXMgbWVhbnQgdG8gb25seSBydW4gb24gdGhlIGJyb3dzZXIuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFBsYWNlaG9sZGVyRGltZW5zaW9ucyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQpIHtcbiAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGltZ0VsZW1lbnQpO1xuICBsZXQgcmVuZGVyZWRXaWR0aCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd3aWR0aCcpKTtcbiAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcblxuICBpZiAocmVuZGVyZWRXaWR0aCA+IFBMQUNFSE9MREVSX0RJTUVOU0lPTl9MSU1JVCB8fCByZW5kZXJlZEhlaWdodCA+IFBMQUNFSE9MREVSX0RJTUVOU0lPTl9MSU1JVCkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5QTEFDRUhPTERFUl9ESU1FTlNJT05fTElNSVRfRVhDRUVERUQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gaXQgdXNlcyBhIHBsYWNlaG9sZGVyIGltYWdlLCBidXQgYXQgbGVhc3Qgb25lIG9mIGAgK1xuICAgICAgICAgIGBvZiB0aGUgZGltZW5zaW9ucyBhdHRyaWJ1dGUgKGhlaWdodCBvciB3aWR0aCkgZXhjZWVkcyB0aGUgbGltaXQgb2YgJHtQTEFDRUhPTERFUl9ESU1FTlNJT05fTElNSVR9cHguIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgdXNlIGEgc21hbGxlciBpbWFnZSBhcyBhIHBsYWNlaG9sZGVyLmAsXG4gICAgICApLFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcm91bmQoaW5wdXQ6IG51bWJlcik6IG51bWJlciB8IHN0cmluZyB7XG4gIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSA/IGlucHV0IDogaW5wdXQudG9GaXhlZCgyKTtcbn1cblxuLy8gVHJhbnNmb3JtIGZ1bmN0aW9uIHRvIGhhbmRsZSBTYWZlVmFsdWUgaW5wdXQgZm9yIG5nU3JjLiBUaGlzIGRvZXNuJ3QgZG8gYW55IHNhbml0aXphdGlvbixcbi8vIGFzIHRoYXQgaXMgbm90IG5lZWRlZCBmb3IgaW1nLnNyYyBhbmQgaW1nLnNyY3NldC4gVGhpcyB0cmFuc2Zvcm0gaXMgcHVyZWx5IGZvciBjb21wYXRpYmlsaXR5LlxuZnVuY3Rpb24gdW53cmFwU2FmZVVybCh2YWx1ZTogc3RyaW5nIHwgU2FmZVZhbHVlKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHVud3JhcFNhZmVWYWx1ZSh2YWx1ZSk7XG59XG5cbi8vIFRyYW5zZm9ybSBmdW5jdGlvbiB0byBoYW5kbGUgaW5wdXRzIHdoaWNoIG1heSBiZSBib29sZWFucywgc3RyaW5ncywgb3Igc3RyaW5nIHJlcHJlc2VudGF0aW9uc1xuLy8gb2YgYm9vbGVhbiB2YWx1ZXMuIFVzZWQgZm9yIHRoZSBwbGFjZWhvbGRlciBhdHRyaWJ1dGUuXG5leHBvcnQgZnVuY3Rpb24gYm9vbGVhbk9yVXJsQXR0cmlidXRlKHZhbHVlOiBib29sZWFuIHwgc3RyaW5nKTogYm9vbGVhbiB8IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlICE9PSAndHJ1ZScgJiYgdmFsdWUgIT09ICdmYWxzZScgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBib29sZWFuQXR0cmlidXRlKHZhbHVlKTtcbn1cbiJdfQ==