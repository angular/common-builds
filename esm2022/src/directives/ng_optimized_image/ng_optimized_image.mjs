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
        else if (typeof placeholderInput === 'string' && placeholderInput.startsWith('data:')) {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.0+sha-1f5ab96", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.3.0+sha-1f5ab96", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], placeholder: ["placeholder", "placeholder", booleanOrDataUrlAttribute], placeholderConfig: "placeholderConfig", src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0\" : null", "style.background-size": "placeholder ? \"cover\" : null", "style.background-position": "placeholder ? \"50% 50%\" : null", "style.background-repeat": "placeholder ? \"no-repeat\" : null", "style.background-image": "placeholder ? generatePlaceholder(placeholder) : null", "style.filter": "placeholder && shouldBlurPlaceholder(placeholderConfig) ? \"blur(15px)\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.0+sha-1f5ab96", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
                args: [{ transform: booleanOrDataUrlAttribute }]
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
export function booleanOrDataUrlAttribute(value) {
    if (typeof value === 'string' && value.startsWith(`data:`)) {
        return value;
    }
    return booleanAttribute(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLEVBQ1IsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEVBSWYsV0FBVyxFQUNYLFNBQVMsRUFFVCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsYUFBYSxJQUFJLFlBQVksRUFDN0Isc0JBQXNCLElBQUkscUJBQXFCLEVBRS9DLHVCQUF1QixJQUFJLHNCQUFzQixFQUNqRCxhQUFhLElBQUksWUFBWSxFQUU3QixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUN2RSxPQUFPLEVBQ0wsWUFBWSxFQUdaLGVBQWUsR0FDaEIsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7O0FBRTFEOzs7Ozs7R0FNRztBQUNILE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sNkJBQTZCLEdBQUcsMkJBQTJCLENBQUM7QUFFbEU7OztHQUdHO0FBQ0gsTUFBTSwrQkFBK0IsR0FBRyxtQ0FBbUMsQ0FBQztBQUU1RTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxDQUFDO0FBRTdDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixHQUFHLENBQUMsQ0FBQztBQUVoRDs7R0FFRztBQUNILE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUM7O0dBRUc7QUFDSCxNQUFNLDBCQUEwQixHQUFHLEdBQUcsQ0FBQztBQUN2Qzs7R0FFRztBQUNILE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDO0FBRW5DOzs7O0dBSUc7QUFDSCxNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQztBQUV2Qzs7O0dBR0c7QUFDSCxNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQztBQUN0QyxNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQztBQUV2Qzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUUxQzs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQztBQUN4QyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLENBQUM7QUFFMUMsbURBQW1EO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHO0lBQzlCLGVBQWU7SUFDZixrQkFBa0I7SUFDbEIsb0JBQW9CO0lBQ3BCLGlCQUFpQjtDQUNsQixDQUFDO0FBWUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpR0c7QUFnQkgsTUFBTSxPQUFPLGdCQUFnQjtJQWY3QjtRQWdCVSxnQkFBVyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNuQyxXQUFNLEdBQWdCLGFBQWEsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMxRCxhQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdCLGVBQVUsR0FBcUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUNoRSxhQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25CLGFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRCx1QkFBa0IsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUVqRSxpRUFBaUU7UUFDekQsZ0JBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3RTs7Ozs7V0FLRztRQUNLLGlCQUFZLEdBQWtCLElBQUksQ0FBQztRQW1EM0M7O1dBRUc7UUFDbUMsYUFBUSxHQUFHLEtBQUssQ0FBQztRQU92RDs7V0FFRztRQUNtQywyQkFBc0IsR0FBRyxLQUFLLENBQUM7UUFFckU7OztXQUdHO1FBQ21DLFNBQUksR0FBRyxLQUFLLENBQUM7S0FzVXBEO0lBelNDLGFBQWE7SUFDYixRQUFRO1FBQ04sc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUUzQyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEIseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUNELG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNkLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoQyw0RkFBNEY7Z0JBQzVGLHNDQUFzQztnQkFDdEMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUM1QiwyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQ2xFLENBQUM7WUFDSixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDOUIscUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO29CQUM3QixxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztnQkFDRCwrREFBK0Q7Z0JBQy9ELGlFQUFpRTtnQkFDakUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUM1Qix1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQzlELENBQUM7WUFDSixDQUFDO1lBQ0QsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbkIsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQztZQUNELHNCQUFzQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0MsNkJBQTZCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDNUQsNkJBQTZCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxpQ0FBaUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTFELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxXQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9ELENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixtRkFBbUY7UUFDbkYsa0RBQWtEO1FBQ2xELElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUM7UUFDekIsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUVoRSw4RUFBOEU7UUFDOUUsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFeEMsOEVBQThFO1FBQzlFLDZDQUE2QztRQUM3QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVsRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FDMUMsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsZUFBZSxFQUFFLEVBQ3RCLGVBQWUsRUFDZixJQUFJLENBQUMsS0FBSyxDQUNYLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVELGFBQWE7SUFDYixXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNkLDJCQUEyQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7Z0JBQ3pDLFVBQVU7Z0JBQ1YsT0FBTztnQkFDUCxRQUFRO2dCQUNSLFVBQVU7Z0JBQ1YsTUFBTTtnQkFDTixTQUFTO2dCQUNULE9BQU87Z0JBQ1AsY0FBYztnQkFDZCx3QkFBd0I7YUFDekIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7WUFDMUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNqQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNqQyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUN2RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLGVBQWUsQ0FDckIseUJBQWtFO1FBRWxFLElBQUksZUFBZSxHQUFzQix5QkFBeUIsQ0FBQztRQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0QixlQUFlLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDbkQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDakQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3RCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN6QyxDQUFDO0lBRU8sZUFBZTtRQUNyQiw2RkFBNkY7UUFDN0YsNEZBQTRGO1FBQzVGLG1FQUFtRTtRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sU0FBUyxHQUFHLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQztZQUNwQyw0REFBNEQ7WUFDNUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVPLGtCQUFrQjtRQUN4QixNQUFNLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRO2FBQzVCLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDVixNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7YUFDM0IsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDZCxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQU0sQ0FBQztZQUNsRixPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7UUFDdkUsQ0FBQyxDQUFDLENBQUM7UUFDTCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLGtCQUFrQjtRQUN4QixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDcEMsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0gsQ0FBQztJQUVPLG1CQUFtQjtRQUN6QixNQUFNLEVBQUMsV0FBVyxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUVsQyxJQUFJLG1CQUFtQixHQUFHLFdBQVksQ0FBQztRQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDbkMsNEVBQTRFO1lBQzVFLHlDQUF5QztZQUN6QyxtQkFBbUIsR0FBRyxXQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksMEJBQTBCLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUN2QyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQ3ZFLENBQUM7UUFDRixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLGNBQWMsR0FBRyxLQUFLO1FBQy9DLElBQUksY0FBYyxFQUFFLENBQUM7WUFDbkIsb0VBQW9FO1lBQ3BFLDRDQUE0QztZQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFM0MsSUFBSSxlQUFlLEdBQXVCLFNBQVMsQ0FBQztRQUNwRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNsQixlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUMsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLDZCQUE2QixFQUFFLEVBQUUsQ0FBQztZQUNoRCxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUVPLGNBQWM7UUFDcEIsTUFBTSxTQUFTLEdBQUcsMEJBQTBCLENBQUMsR0FBRyxDQUM5QyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQ2IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ3RCLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSztZQUNmLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBTSxHQUFHLFVBQVU7U0FDaEMsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUN0QixDQUFDO1FBQ0YsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTyw2QkFBNkI7UUFDbkMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsY0FBYztnQkFDWixJQUFJLENBQUMsS0FBTSxHQUFHLHdCQUF3QixJQUFJLElBQUksQ0FBQyxNQUFPLEdBQUcseUJBQXlCLENBQUM7UUFDdkYsQ0FBQztRQUNELE9BQU8sQ0FDTCxDQUFDLElBQUksQ0FBQyxzQkFBc0I7WUFDNUIsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUNaLElBQUksQ0FBQyxXQUFXLEtBQUssZUFBZTtZQUNwQyxDQUFDLGNBQWMsQ0FDaEIsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssbUJBQW1CLENBQUMsZ0JBQWtDO1FBQzVELE1BQU0sRUFBQyxxQkFBcUIsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDNUMsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUM5QixPQUFPLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztnQkFDakMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNmLEtBQUssRUFBRSxxQkFBcUI7Z0JBQzVCLGFBQWEsRUFBRSxJQUFJO2FBQ3BCLENBQUMsR0FBRyxDQUFDO1FBQ1IsQ0FBQzthQUFNLElBQUksT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLElBQUksZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDeEYsT0FBTyxPQUFPLGdCQUFnQixHQUFHLENBQUM7UUFDcEMsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHFCQUFxQixDQUFDLGlCQUEwQztRQUN0RSxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNwRSxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU8sdUJBQXVCLENBQUMsR0FBcUI7UUFDbkQsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO1lBQ3BCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvRCxvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZCLHFCQUFxQixFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbkMsQ0FBQyxDQUFDO1FBRUYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsYUFBYTtJQUNiLFdBQVc7UUFDVCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLGdCQUFnQixDQUFDLElBQVksRUFBRSxLQUFhO1FBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7eUhBN1pVLGdCQUFnQjs2R0FBaEIsZ0JBQWdCLGtGQWcrQnBCLGFBQWEsbUVBOTZCRCxlQUFlLGdDQU9mLGVBQWUsMERBZWYsZ0JBQWdCLDhHQVVoQixnQkFBZ0IsMEJBTWhCLGdCQUFnQiwrQ0FpNUJyQix5QkFBeUI7O3NHQXorQjVCLGdCQUFnQjtrQkFmNUIsU0FBUzttQkFBQztvQkFDVCxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLElBQUksRUFBRTt3QkFDSixrQkFBa0IsRUFBRSwwQkFBMEI7d0JBQzlDLGVBQWUsRUFBRSxzQkFBc0I7d0JBQ3ZDLGdCQUFnQixFQUFFLHNCQUFzQjt3QkFDeEMsZUFBZSxFQUFFLG1CQUFtQjt3QkFDcEMseUJBQXlCLEVBQUUsOEJBQThCO3dCQUN6RCw2QkFBNkIsRUFBRSxnQ0FBZ0M7d0JBQy9ELDJCQUEyQixFQUFFLGtDQUFrQzt3QkFDL0QsMEJBQTBCLEVBQUUsdURBQXVEO3dCQUNuRixnQkFBZ0IsRUFBRSxtRUFBbUUsdUJBQXVCLGFBQWE7cUJBQzFIO2lCQUNGOzhCQTBCb0QsS0FBSztzQkFBdkQsS0FBSzt1QkFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBQztnQkFheEMsUUFBUTtzQkFBaEIsS0FBSztnQkFNRyxLQUFLO3NCQUFiLEtBQUs7Z0JBTStCLEtBQUs7c0JBQXpDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZUFBZSxFQUFDO2dCQU9FLE1BQU07c0JBQTFDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZUFBZSxFQUFDO2dCQVUxQixPQUFPO3NCQUFmLEtBQUs7Z0JBS2dDLFFBQVE7c0JBQTdDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBSzNCLFlBQVk7c0JBQXBCLEtBQUs7Z0JBS2dDLHNCQUFzQjtzQkFBM0QsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFNRSxJQUFJO3NCQUF6QyxLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQUtXLFdBQVc7c0JBQXpELEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUseUJBQXlCLEVBQUM7Z0JBTXBDLGlCQUFpQjtzQkFBekIsS0FBSztnQkFRRyxHQUFHO3NCQUFYLEtBQUs7Z0JBUUcsTUFBTTtzQkFBZCxLQUFLOztBQTZTUixxQkFBcUI7QUFFckI7O0dBRUc7QUFDSCxTQUFTLGFBQWEsQ0FBQyxNQUFtQjtJQUN4QyxJQUFJLGlCQUFpQixHQUE2QixFQUFFLENBQUM7SUFDckQsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsaUJBQWlCLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdFLENBQUM7QUFFRCw4QkFBOEI7QUFFOUI7O0dBRUc7QUFDSCxTQUFTLHNCQUFzQixDQUFDLEdBQXFCO0lBQ25ELElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1osTUFBTSxJQUFJLFlBQVksa0RBRXBCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyw2Q0FBNkM7WUFDNUUsMERBQTBEO1lBQzFELHNGQUFzRjtZQUN0RixtREFBbUQsQ0FDdEQsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLHlCQUF5QixDQUFDLEdBQXFCO0lBQ3RELElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsTUFBTSxJQUFJLFlBQVkscURBRXBCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtREFBbUQ7WUFDbEYsMERBQTBEO1lBQzFELDhFQUE4RTtZQUM5RSxvRUFBb0UsQ0FDdkUsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLG9CQUFvQixDQUFDLEdBQXFCO0lBQ2pELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLDhCQUE4QixFQUFFLENBQUM7WUFDbEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLDhCQUE4QixDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxNQUFNLElBQUksWUFBWSw0Q0FFcEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyx3Q0FBd0M7WUFDOUUsSUFBSSxLQUFLLCtEQUErRDtZQUN4RSx1RUFBdUU7WUFDdkUsdUVBQXVFLENBQzFFLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxHQUFxQjtJQUNqRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQ3RCLElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7UUFDdEMsTUFBTSxJQUFJLFlBQVksNENBRXBCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsMkNBQTJDO1lBQ2pGLDRGQUE0RjtZQUM1RixrRkFBa0Y7WUFDbEYsK0ZBQStGLENBQ2xHLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsR0FBcUIsRUFBRSxXQUF3QjtJQUM3RSwyQ0FBMkMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRCx3Q0FBd0MsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDM0Qsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUywyQ0FBMkMsQ0FBQyxHQUFxQjtJQUN4RSxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM5QyxNQUFNLElBQUksWUFBWSw0Q0FFcEIsR0FBRyxtQkFBbUIsQ0FDcEIsR0FBRyxDQUFDLEtBQUssRUFDVCxLQUFLLENBQ04sc0RBQXNEO1lBQ3JELGlGQUFpRixDQUNwRixDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHdDQUF3QyxDQUFDLEdBQXFCLEVBQUUsV0FBd0I7SUFDL0YsSUFBSSxHQUFHLENBQUMsV0FBVyxLQUFLLElBQUksSUFBSSxXQUFXLEtBQUssZUFBZSxFQUFFLENBQUM7UUFDaEUsTUFBTSxJQUFJLFlBQVksdURBRXBCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvREFBb0Q7WUFDbkYsc0VBQXNFO1lBQ3RFLDZGQUE2RjtZQUM3Rix1RkFBdUYsQ0FDMUYsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLHdCQUF3QixDQUFDLEdBQXFCO0lBQ3JELElBQ0UsR0FBRyxDQUFDLFdBQVc7UUFDZixPQUFPLEdBQUcsQ0FBQyxXQUFXLEtBQUssUUFBUTtRQUNuQyxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDbkMsQ0FBQztRQUNELElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztZQUNsRCxNQUFNLElBQUksWUFBWSxvREFFcEIsR0FBRyxtQkFBbUIsQ0FDcEIsR0FBRyxDQUFDLEtBQUssQ0FDVixzRUFBc0U7Z0JBQ3JFLFFBQVEsb0JBQW9CLDBFQUEwRTtnQkFDdEcscUdBQXFHO2dCQUNyRyxpQ0FBaUMsQ0FDcEMsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLG1CQUFtQixFQUFFLENBQUM7WUFDakQsT0FBTyxDQUFDLElBQUksQ0FDVixrQkFBa0Isb0RBRWhCLEdBQUcsbUJBQW1CLENBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQ1Ysc0VBQXNFO2dCQUNyRSxRQUFRLG1CQUFtQixpRUFBaUU7Z0JBQzVGLCtHQUErRztnQkFDL0csMENBQTBDLENBQzdDLENBQ0YsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFxQjtJQUM3QyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxZQUFZLDRDQUVwQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUNBQXFDLEtBQUssS0FBSztZQUM5RSxpRUFBaUU7WUFDakUsdUVBQXVFO1lBQ3ZFLHNFQUFzRSxDQUN6RSxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsbUJBQW1CLENBQUMsR0FBcUIsRUFBRSxJQUFZLEVBQUUsS0FBYztJQUM5RSxNQUFNLFFBQVEsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7SUFDM0MsTUFBTSxhQUFhLEdBQUcsUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDdEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksWUFBWSw0Q0FFcEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSwwQkFBMEI7WUFDbkUsTUFBTSxLQUFLLDJEQUEyRCxDQUN6RSxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxHQUFxQixFQUFFLEtBQWM7SUFDdkUsSUFBSSxLQUFLLElBQUksSUFBSTtRQUFFLE9BQU87SUFDMUIsbUJBQW1CLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1QyxNQUFNLFNBQVMsR0FBRyxLQUFlLENBQUM7SUFDbEMsTUFBTSxzQkFBc0IsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0UsTUFBTSx3QkFBd0IsR0FBRywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFakYsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO1FBQzdCLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUcsc0JBQXNCLElBQUksd0JBQXdCLENBQUM7SUFDekUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxZQUFZLDRDQUVwQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMseUNBQXlDLEtBQUssT0FBTztZQUNwRixxRkFBcUY7WUFDckYseUVBQXlFLENBQzVFLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsR0FBcUIsRUFBRSxLQUFhO0lBQ2pFLE1BQU0sZUFBZSxHQUFHLEtBQUs7U0FDMUIsS0FBSyxDQUFDLEdBQUcsQ0FBQztTQUNWLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksMkJBQTJCLENBQUMsQ0FBQztJQUNoRixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDckIsTUFBTSxJQUFJLFlBQVksNENBRXBCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQywwREFBMEQ7WUFDekYsS0FBSyxLQUFLLG1FQUFtRTtZQUM3RSxHQUFHLDhCQUE4Qix1Q0FBdUM7WUFDeEUsR0FBRywyQkFBMkIsOERBQThEO1lBQzVGLGdCQUFnQiw4QkFBOEIsdUNBQXVDO1lBQ3JGLDBGQUEwRjtZQUMxRixHQUFHLDJCQUEyQixvRUFBb0UsQ0FDckcsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyx3QkFBd0IsQ0FBQyxHQUFxQixFQUFFLFNBQWlCO0lBQ3hFLElBQUksTUFBZSxDQUFDO0lBQ3BCLElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxTQUFTLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDcEQsTUFBTTtZQUNKLGNBQWMsU0FBUyw2Q0FBNkM7Z0JBQ3BFLDRFQUE0RSxDQUFDO0lBQ2pGLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTTtZQUNKLGtCQUFrQixTQUFTLDRDQUE0QztnQkFDdkUsbUVBQW1FLENBQUM7SUFDeEUsQ0FBQztJQUNELE9BQU8sSUFBSSxZQUFZLHNEQUVyQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxTQUFTLHVDQUF1QztRQUNyRix1RUFBdUUsTUFBTSxHQUFHO1FBQ2hGLGdDQUFnQyxTQUFTLHVCQUF1QjtRQUNoRSw2RUFBNkUsQ0FDaEYsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsMkJBQTJCLENBQ2xDLEdBQXFCLEVBQ3JCLE9BQXNCLEVBQ3RCLE1BQWdCO0lBRWhCLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUN2QixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELElBQUksU0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7WUFDakQsSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLDZEQUE2RDtnQkFDN0QsOERBQThEO2dCQUM5RCxnRUFBZ0U7Z0JBQ2hFLDZCQUE2QjtnQkFDN0IsR0FBRyxHQUFHLEVBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQXFCLENBQUM7WUFDbEUsQ0FBQztZQUNELE1BQU0sd0JBQXdCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMscUJBQXFCLENBQUMsR0FBcUIsRUFBRSxVQUFtQixFQUFFLFNBQWlCO0lBQzFGLE1BQU0sV0FBVyxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVEsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sV0FBVyxHQUNmLE9BQU8sVUFBVSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEcsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxZQUFZLDRDQUVwQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxTQUFTLDJCQUEyQjtZQUN6RSwwQkFBMEIsU0FBUyxnQ0FBZ0MsQ0FDdEUsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsdUJBQXVCLENBQzlCLEdBQXFCLEVBQ3JCLEdBQXFCLEVBQ3JCLFFBQW1CO0lBRW5CLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUM3RCxvQkFBb0IsRUFBRSxDQUFDO1FBQ3ZCLHFCQUFxQixFQUFFLENBQUM7UUFDeEIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELElBQUksYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLGNBQWMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUUsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRS9ELElBQUksU0FBUyxLQUFLLFlBQVksRUFBRSxDQUFDO1lBQy9CLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNqRSxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDckUsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdkUsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ25FLGFBQWEsSUFBSSxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BFLGNBQWMsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxNQUFNLG1CQUFtQixHQUFHLGFBQWEsR0FBRyxjQUFjLENBQUM7UUFDM0QsTUFBTSx5QkFBeUIsR0FBRyxhQUFhLEtBQUssQ0FBQyxJQUFJLGNBQWMsS0FBSyxDQUFDLENBQUM7UUFFOUUsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN4QyxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO1FBQzFDLE1BQU0sb0JBQW9CLEdBQUcsY0FBYyxHQUFHLGVBQWUsQ0FBQztRQUU5RCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBTSxDQUFDO1FBQ2pDLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFPLENBQUM7UUFDbkMsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLEdBQUcsY0FBYyxDQUFDO1FBRTNELHFFQUFxRTtRQUNyRSxtRUFBbUU7UUFDbkUsdUVBQXVFO1FBQ3ZFLHNFQUFzRTtRQUN0RSx1RUFBdUU7UUFDdkUsTUFBTSxvQkFBb0IsR0FDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLHNCQUFzQixDQUFDO1FBQ2hGLE1BQU0saUJBQWlCLEdBQ3JCLHlCQUF5QjtZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsc0JBQXNCLENBQUM7UUFFaEYsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQ1Ysa0JBQWtCLDRDQUVoQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0RBQWdEO2dCQUMvRSxpRUFBaUU7Z0JBQ2pFLDJCQUEyQixjQUFjLE9BQU8sZUFBZSxJQUFJO2dCQUNuRSxrQkFBa0IsS0FBSyxDQUNyQixvQkFBb0IsQ0FDckIsNkNBQTZDO2dCQUM5QyxHQUFHLGFBQWEsT0FBTyxjQUFjLG9CQUFvQixLQUFLLENBQzVELG1CQUFtQixDQUNwQixLQUFLO2dCQUNOLHdEQUF3RCxDQUMzRCxDQUNGLENBQUM7UUFDSixDQUFDO2FBQU0sSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQ1Ysa0JBQWtCLDRDQUVoQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsMENBQTBDO2dCQUN6RSxxREFBcUQ7Z0JBQ3JELDJCQUEyQixjQUFjLE9BQU8sZUFBZSxJQUFJO2dCQUNuRSxrQkFBa0IsS0FBSyxDQUFDLG9CQUFvQixDQUFDLDRCQUE0QjtnQkFDekUsR0FBRyxhQUFhLE9BQU8sY0FBYyxtQkFBbUI7Z0JBQ3hELEdBQUcsS0FBSyxDQUFDLG1CQUFtQixDQUFDLG9EQUFvRDtnQkFDakYsc0VBQXNFO2dCQUN0RSxtRUFBbUU7Z0JBQ25FLHVFQUF1RTtnQkFDdkUsYUFBYSxDQUNoQixDQUNGLENBQUM7UUFDSixDQUFDO2FBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUkseUJBQXlCLEVBQUUsQ0FBQztZQUN0RCxrRUFBa0U7WUFDbEUsTUFBTSxnQkFBZ0IsR0FBRyw4QkFBOEIsR0FBRyxhQUFhLENBQUM7WUFDeEUsTUFBTSxpQkFBaUIsR0FBRyw4QkFBOEIsR0FBRyxjQUFjLENBQUM7WUFDMUUsTUFBTSxjQUFjLEdBQUcsY0FBYyxHQUFHLGdCQUFnQixJQUFJLHlCQUF5QixDQUFDO1lBQ3RGLE1BQU0sZUFBZSxHQUFHLGVBQWUsR0FBRyxpQkFBaUIsSUFBSSx5QkFBeUIsQ0FBQztZQUN6RixJQUFJLGNBQWMsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDdEMsT0FBTyxDQUFDLElBQUksQ0FDVixrQkFBa0IsOENBRWhCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0M7b0JBQ3ZFLHlCQUF5QjtvQkFDekIsMEJBQTBCLGFBQWEsT0FBTyxjQUFjLEtBQUs7b0JBQ2pFLDJCQUEyQixjQUFjLE9BQU8sZUFBZSxLQUFLO29CQUNwRSx1Q0FBdUMsZ0JBQWdCLE9BQU8saUJBQWlCLEtBQUs7b0JBQ3BGLG1GQUFtRjtvQkFDbkYsR0FBRyw4QkFBOEIsOENBQThDO29CQUMvRSwwREFBMEQsQ0FDN0QsQ0FDRixDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILGlHQUFpRztJQUNqRyw2RkFBNkY7SUFDN0Ysa0dBQWtHO0lBQ2xHLHFFQUFxRTtJQUNyRSxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDL0Qsb0JBQW9CLEVBQUUsQ0FBQztRQUN2QixxQkFBcUIsRUFBRSxDQUFDO0lBQzFCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyw0QkFBNEIsQ0FBQyxHQUFxQjtJQUN6RCxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztJQUMzQixJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssU0FBUztRQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3RCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssU0FBUztRQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvRCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNqQyxNQUFNLElBQUksWUFBWSxxREFFcEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDZCQUE2QjtZQUM1RCxnQkFBZ0IsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQzNFLHNGQUFzRjtZQUN0RixtRkFBbUY7WUFDbkYsMENBQTBDLENBQzdDLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMseUJBQXlCLENBQUMsR0FBcUI7SUFDdEQsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixNQUFNLElBQUksWUFBWSw0Q0FFcEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDBEQUEwRDtZQUN6RixrR0FBa0c7WUFDbEcsb0VBQW9FLENBQ3ZFLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsMkJBQTJCLENBQ2xDLEdBQXFCLEVBQ3JCLEdBQXFCLEVBQ3JCLFFBQW1CO0lBRW5CLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUM3RCxvQkFBb0IsRUFBRSxDQUFDO1FBQ3ZCLHFCQUFxQixFQUFFLENBQUM7UUFDeEIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN4QyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksY0FBYyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQ1Ysa0JBQWtCLDRDQUVoQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsOENBQThDO2dCQUM3RSxpRkFBaUY7Z0JBQ2pGLDRFQUE0RTtnQkFDNUUsOEVBQThFO2dCQUM5RSw2REFBNkQsQ0FDaEUsQ0FDRixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsaURBQWlEO0lBQ2pELE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUMvRCxvQkFBb0IsRUFBRSxDQUFDO1FBQ3ZCLHFCQUFxQixFQUFFLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxHQUFxQjtJQUNwRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxZQUFZLDRDQUVwQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCO1lBQzVELG1EQUFtRDtZQUNuRCx3REFBd0Q7WUFDeEQsc0RBQXNEO1lBQ3RELHNFQUFzRSxDQUN6RSxDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sV0FBVyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QyxJQUFJLE9BQU8sR0FBRyxDQUFDLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQzFFLE1BQU0sSUFBSSxZQUFZLDRDQUVwQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCO1lBQzVELDJCQUEyQixHQUFHLENBQUMsT0FBTyxPQUFPO1lBQzdDLGtFQUFrRSxDQUNyRSxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsNkJBQTZCLENBQUMsS0FBYSxFQUFFLFdBQXdCO0lBQzVFLElBQUksV0FBVyxLQUFLLGVBQWUsRUFBRSxDQUFDO1FBQ3BDLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1FBQzNCLEtBQUssTUFBTSxNQUFNLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUN0QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEMsTUFBTTtZQUNSLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQ1Ysa0JBQWtCLHFEQUVoQixtRUFBbUU7Z0JBQ2pFLEdBQUcsaUJBQWlCLDRDQUE0QztnQkFDaEUsOERBQThEO2dCQUM5RCxvQ0FBb0MsaUJBQWlCLGFBQWE7Z0JBQ2xFLGlFQUFpRTtnQkFDakUsZ0VBQWdFO2dCQUNoRSw2REFBNkQsQ0FDaEUsQ0FDRixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLDZCQUE2QixDQUFDLEdBQXFCLEVBQUUsV0FBd0I7SUFDcEYsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLFdBQVcsS0FBSyxlQUFlLEVBQUUsQ0FBQztRQUNwRCxPQUFPLENBQUMsSUFBSSxDQUNWLGtCQUFrQix1REFFaEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDZDQUE2QztZQUM1RSxzRUFBc0U7WUFDdEUsNEVBQTRFO1lBQzVFLG9GQUFvRixDQUN2RixDQUNGLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsaUNBQWlDLENBQUMsR0FBcUIsRUFBRSxXQUF3QjtJQUN4RixJQUFJLEdBQUcsQ0FBQyxZQUFZLElBQUksV0FBVyxLQUFLLGVBQWUsRUFBRSxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQ1Ysa0JBQWtCLHVEQUVoQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaURBQWlEO1lBQ2hGLHNFQUFzRTtZQUN0RSwyRkFBMkY7WUFDM0YsK0ZBQStGLENBQ2xHLENBQ0YsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsS0FBYTtJQUMxQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsNEZBQTRGO0FBQzVGLGdHQUFnRztBQUNoRyxTQUFTLGFBQWEsQ0FBQyxLQUF5QjtJQUM5QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxnR0FBZ0c7QUFDaEcseURBQXlEO0FBQ3pELE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxLQUF1QjtJQUMvRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDM0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgaW5qZWN0LFxuICBJbmplY3RvcixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgbnVtYmVyQXR0cmlidXRlLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBQTEFURk9STV9JRCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2VzLFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIMm1SU1BR0VfQ09ORklHIGFzIElNQUdFX0NPTkZJRyxcbiAgybVJTUFHRV9DT05GSUdfREVGQVVMVFMgYXMgSU1BR0VfQ09ORklHX0RFRkFVTFRTLFxuICDJtUltYWdlQ29uZmlnIGFzIEltYWdlQ29uZmlnLFxuICDJtXBlcmZvcm1hbmNlTWFya0ZlYXR1cmUgYXMgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSxcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxuICDJtVNhZmVWYWx1ZSBhcyBTYWZlVmFsdWUsXG4gIMm1dW53cmFwU2FmZVZhbHVlIGFzIHVud3JhcFNhZmVWYWx1ZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJy4uLy4uL3BsYXRmb3JtX2lkJztcblxuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2Nsb3VkaW5hcnlMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXInO1xuaW1wb3J0IHtcbiAgSU1BR0VfTE9BREVSLFxuICBJbWFnZUxvYWRlcixcbiAgSW1hZ2VMb2FkZXJDb25maWcsXG4gIG5vb3BJbWFnZUxvYWRlcixcbn0gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltYWdlX2xvYWRlcic7XG5pbXBvcnQge2ltYWdlS2l0TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlcic7XG5pbXBvcnQge2ltZ2l4TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltZ2l4X2xvYWRlcic7XG5pbXBvcnQge25ldGxpZnlMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvbmV0bGlmeV9sb2FkZXInO1xuaW1wb3J0IHtMQ1BJbWFnZU9ic2VydmVyfSBmcm9tICcuL2xjcF9pbWFnZV9vYnNlcnZlcic7XG5pbXBvcnQge1ByZWNvbm5lY3RMaW5rQ2hlY2tlcn0gZnJvbSAnLi9wcmVjb25uZWN0X2xpbmtfY2hlY2tlcic7XG5pbXBvcnQge1ByZWxvYWRMaW5rQ3JlYXRvcn0gZnJvbSAnLi9wcmVsb2FkLWxpbmstY3JlYXRvcic7XG5cbi8qKlxuICogV2hlbiBhIEJhc2U2NC1lbmNvZGVkIGltYWdlIGlzIHBhc3NlZCBhcyBhbiBpbnB1dCB0byB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSxcbiAqIGFuIGVycm9yIGlzIHRocm93bi4gVGhlIGltYWdlIGNvbnRlbnQgKGFzIGEgc3RyaW5nKSBtaWdodCBiZSB2ZXJ5IGxvbmcsIHRodXMgbWFraW5nXG4gKiBpdCBoYXJkIHRvIHJlYWQgYW4gZXJyb3IgbWVzc2FnZSBpZiB0aGUgZW50aXJlIHN0cmluZyBpcyBpbmNsdWRlZC4gVGhpcyBjb25zdCBkZWZpbmVzXG4gKiB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW50byB0aGUgZXJyb3IgbWVzc2FnZS4gVGhlIHJlc3RcbiAqIG9mIHRoZSBjb250ZW50IGlzIHRydW5jYXRlZC5cbiAqL1xuY29uc3QgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SID0gNTA7XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyB3aWR0aCBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxMDB3LCAyMDB3XCIuXG4gKi9cbmNvbnN0IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrd1xccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxeCwgMngsIDUweFwiLiBBbHNvIHN1cHBvcnRzIGRlY2ltYWxzIGxpa2UgXCIxLjV4LCAxLjUweFwiLlxuICovXG5jb25zdCBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrKFxcLlxcZCspP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgaW4gZ2VuZXJhdGluZyBhdXRvbWF0aWMgZGVuc2l0eS1iYXNlZCBzcmNzZXRzXG4gKi9cbmNvbnN0IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTID0gWzEsIDJdO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGJyZWFrcG9pbnRzIHRvIHVzZSBvbiBmdWxsLXdpZHRoIGltYWdlc1xuICovXG5jb25zdCBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRiA9IDY0MDtcbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYXNwZWN0IHJhdGlvcyBhcmUgc2ltaWxhciBpbiB2YWx1ZS5cbiAqL1xuY29uc3QgQVNQRUNUX1JBVElPX1RPTEVSQU5DRSA9IDAuMTtcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBpbWFnZSBoYXMgYmVlbiByZXF1ZXN0ZWQgYXQgYW4gb3Zlcmx5XG4gKiBsYXJnZSBzaXplIGNvbXBhcmVkIHRvIHRoZSBhY3R1YWwgcmVuZGVyZWQgaW1hZ2Ugc2l6ZSAoYWZ0ZXIgdGFraW5nXG4gKiBpbnRvIGFjY291bnQgYSB0eXBpY2FsIGRldmljZSBwaXhlbCByYXRpbykuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRSA9IDEwMDA7XG5cbi8qKlxuICogVXNlZCB0byBsaW1pdCBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gb2YgdmVyeSBsYXJnZSBzb3VyY2VzIGZvclxuICogZml4ZWQtc2l6ZSBpbWFnZXMuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgRklYRURfU1JDU0VUX1dJRFRIX0xJTUlUID0gMTkyMDtcbmNvbnN0IEZJWEVEX1NSQ1NFVF9IRUlHSFRfTElNSVQgPSAxMDgwO1xuXG4vKipcbiAqIERlZmF1bHQgYmx1ciByYWRpdXMgb2YgdGhlIENTUyBmaWx0ZXIgdXNlZCBvbiBwbGFjZWhvbGRlciBpbWFnZXMsIGluIHBpeGVsc1xuICovXG5leHBvcnQgY29uc3QgUExBQ0VIT0xERVJfQkxVUl9BTU9VTlQgPSAxNTtcblxuLyoqXG4gKiBVc2VkIHRvIHdhcm4gb3IgZXJyb3Igd2hlbiB0aGUgdXNlciBwcm92aWRlcyBhbiBvdmVybHkgbGFyZ2UgZGF0YVVSTCBmb3IgdGhlIHBsYWNlaG9sZGVyXG4gKiBhdHRyaWJ1dGUuXG4gKiBDaGFyYWN0ZXIgY291bnQgb2YgQmFzZTY0IGltYWdlcyBpcyAxIGNoYXJhY3RlciBwZXIgYnl0ZSwgYW5kIGJhc2U2NCBlbmNvZGluZyBpcyBhcHByb3hpbWF0ZWx5XG4gKiAzMyUgbGFyZ2VyIHRoYW4gYmFzZSBpbWFnZXMsIHNvIDQwMDAgY2hhcmFjdGVycyBpcyBhcm91bmQgM0tCIG9uIGRpc2sgYW5kIDEwMDAwIGNoYXJhY3RlcnMgaXNcbiAqIGFyb3VuZCA3LjdLQi4gRXhwZXJpbWVudGFsbHksIDQwMDAgY2hhcmFjdGVycyBpcyBhYm91dCAyMHgyMHB4IGluIFBORyBvciBtZWRpdW0tcXVhbGl0eSBKUEVHXG4gKiBmb3JtYXQsIGFuZCAxMCwwMDAgaXMgYXJvdW5kIDUweDUwcHgsIGJ1dCB0aGVyZSdzIHF1aXRlIGEgYml0IG9mIHZhcmlhdGlvbiBkZXBlbmRpbmcgb24gaG93IHRoZVxuICogaW1hZ2UgaXMgc2F2ZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9XQVJOX0xJTUlUID0gNDAwMDtcbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9FUlJPUl9MSU1JVCA9IDEwMDAwO1xuXG4vKiogSW5mbyBhYm91dCBidWlsdC1pbiBsb2FkZXJzIHdlIGNhbiB0ZXN0IGZvci4gKi9cbmV4cG9ydCBjb25zdCBCVUlMVF9JTl9MT0FERVJTID0gW1xuICBpbWdpeExvYWRlckluZm8sXG4gIGltYWdlS2l0TG9hZGVySW5mbyxcbiAgY2xvdWRpbmFyeUxvYWRlckluZm8sXG4gIG5ldGxpZnlMb2FkZXJJbmZvLFxuXTtcblxuLyoqXG4gKiBDb25maWcgb3B0aW9ucyB1c2VkIGluIHJlbmRlcmluZyBwbGFjZWhvbGRlciBpbWFnZXMuXG4gKlxuICogQHNlZSB7QGxpbmsgTmdPcHRpbWl6ZWRJbWFnZX1cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbWFnZVBsYWNlaG9sZGVyQ29uZmlnIHtcbiAgYmx1cj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgaW1wcm92ZXMgaW1hZ2UgbG9hZGluZyBwZXJmb3JtYW5jZSBieSBlbmZvcmNpbmcgYmVzdCBwcmFjdGljZXMuXG4gKlxuICogYE5nT3B0aW1pemVkSW1hZ2VgIGVuc3VyZXMgdGhhdCB0aGUgbG9hZGluZyBvZiB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGltYWdlIGlzXG4gKiBwcmlvcml0aXplZCBieTpcbiAqIC0gQXV0b21hdGljYWxseSBzZXR0aW5nIHRoZSBgZmV0Y2hwcmlvcml0eWAgYXR0cmlidXRlIG9uIHRoZSBgPGltZz5gIHRhZ1xuICogLSBMYXp5IGxvYWRpbmcgbm9uLXByaW9yaXR5IGltYWdlcyBieSBkZWZhdWx0XG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGluZyBhIHByZWNvbm5lY3QgbGluayB0YWcgaW4gdGhlIGRvY3VtZW50IGhlYWRcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIGRpcmVjdGl2ZTpcbiAqIC0gR2VuZXJhdGVzIGFwcHJvcHJpYXRlIGFzc2V0IFVSTHMgaWYgYSBjb3JyZXNwb25kaW5nIGBJbWFnZUxvYWRlcmAgZnVuY3Rpb24gaXMgcHJvdmlkZWRcbiAqIC0gQXV0b21hdGljYWxseSBnZW5lcmF0ZXMgYSBzcmNzZXRcbiAqIC0gUmVxdWlyZXMgdGhhdCBgd2lkdGhgIGFuZCBgaGVpZ2h0YCBhcmUgc2V0XG4gKiAtIFdhcm5zIGlmIGB3aWR0aGAgb3IgYGhlaWdodGAgaGF2ZSBiZWVuIHNldCBpbmNvcnJlY3RseVxuICogLSBXYXJucyBpZiB0aGUgaW1hZ2Ugd2lsbCBiZSB2aXN1YWxseSBkaXN0b3J0ZWQgd2hlbiByZW5kZXJlZFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBpcyBtYXJrZWQgYXMgW3N0YW5kYWxvbmVdKGd1aWRlL3N0YW5kYWxvbmUtY29tcG9uZW50cykgYW5kIGNhblxuICogYmUgaW1wb3J0ZWQgZGlyZWN0bHkuXG4gKlxuICogRm9sbG93IHRoZSBzdGVwcyBiZWxvdyB0byBlbmFibGUgYW5kIHVzZSB0aGUgZGlyZWN0aXZlOlxuICogMS4gSW1wb3J0IGl0IGludG8gdGhlIG5lY2Vzc2FyeSBOZ01vZHVsZSBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50LlxuICogMi4gT3B0aW9uYWxseSBwcm92aWRlIGFuIGBJbWFnZUxvYWRlcmAgaWYgeW91IHVzZSBhbiBpbWFnZSBob3N0aW5nIHNlcnZpY2UuXG4gKiAzLiBVcGRhdGUgdGhlIG5lY2Vzc2FyeSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIGFuZCByZXBsYWNlIGBzcmNgIGF0dHJpYnV0ZXMgd2l0aCBgbmdTcmNgLlxuICogVXNpbmcgYSBgbmdTcmNgIGFsbG93cyB0aGUgZGlyZWN0aXZlIHRvIGNvbnRyb2wgd2hlbiB0aGUgYHNyY2AgZ2V0cyBzZXQsIHdoaWNoIHRyaWdnZXJzIGFuIGltYWdlXG4gKiBkb3dubG9hZC5cbiAqXG4gKiBTdGVwIDE6IGltcG9ydCB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBOZ09wdGltaXplZEltYWdlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBJbmNsdWRlIGl0IGludG8gdGhlIG5lY2Vzc2FyeSBOZ01vZHVsZVxuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIEFwcE1vZHVsZSB7fVxuICpcbiAqIC8vIC4uLiBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc3RhbmRhbG9uZTogdHJ1ZVxuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgTXlTdGFuZGFsb25lQ29tcG9uZW50IHt9XG4gKiBgYGBcbiAqXG4gKiBTdGVwIDI6IGNvbmZpZ3VyZSBhIGxvYWRlci5cbiAqXG4gKiBUbyB1c2UgdGhlICoqZGVmYXVsdCBsb2FkZXIqKjogbm8gYWRkaXRpb25hbCBjb2RlIGNoYW5nZXMgYXJlIG5lY2Vzc2FyeS4gVGhlIFVSTCByZXR1cm5lZCBieSB0aGVcbiAqIGdlbmVyaWMgbG9hZGVyIHdpbGwgYWx3YXlzIG1hdGNoIHRoZSB2YWx1ZSBvZiBcInNyY1wiLiBJbiBvdGhlciB3b3JkcywgdGhpcyBsb2FkZXIgYXBwbGllcyBub1xuICogdHJhbnNmb3JtYXRpb25zIHRvIHRoZSByZXNvdXJjZSBVUkwgYW5kIHRoZSB2YWx1ZSBvZiB0aGUgYG5nU3JjYCBhdHRyaWJ1dGUgd2lsbCBiZSB1c2VkIGFzIGlzLlxuICpcbiAqIFRvIHVzZSBhbiBleGlzdGluZyBsb2FkZXIgZm9yIGEgKip0aGlyZC1wYXJ0eSBpbWFnZSBzZXJ2aWNlKio6IGFkZCB0aGUgcHJvdmlkZXIgZmFjdG9yeSBmb3IgeW91clxuICogY2hvc2VuIHNlcnZpY2UgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5LiBJbiB0aGUgZXhhbXBsZSBiZWxvdywgdGhlIEltZ2l4IGxvYWRlciBpcyB1c2VkOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7cHJvdmlkZUltZ2l4TG9hZGVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENhbGwgdGhlIGZ1bmN0aW9uIGFuZCBhZGQgdGhlIHJlc3VsdCB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXk6XG4gKiBwcm92aWRlcnM6IFtcbiAqICAgcHJvdmlkZUltZ2l4TG9hZGVyKFwiaHR0cHM6Ly9teS5iYXNlLnVybC9cIiksXG4gKiBdLFxuICogYGBgXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgcHJvdmlkZXMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gKiAtIGBwcm92aWRlQ2xvdWRmbGFyZUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVDbG91ZGluYXJ5TG9hZGVyYFxuICogLSBgcHJvdmlkZUltYWdlS2l0TG9hZGVyYFxuICogLSBgcHJvdmlkZUltZ2l4TG9hZGVyYFxuICpcbiAqIElmIHlvdSB1c2UgYSBkaWZmZXJlbnQgaW1hZ2UgcHJvdmlkZXIsIHlvdSBjYW4gY3JlYXRlIGEgY3VzdG9tIGxvYWRlciBmdW5jdGlvbiBhcyBkZXNjcmliZWRcbiAqIGJlbG93LlxuICpcbiAqIFRvIHVzZSBhICoqY3VzdG9tIGxvYWRlcioqOiBwcm92aWRlIHlvdXIgbG9hZGVyIGZ1bmN0aW9uIGFzIGEgdmFsdWUgZm9yIHRoZSBgSU1BR0VfTE9BREVSYCBESVxuICogdG9rZW4uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENvbmZpZ3VyZSB0aGUgbG9hZGVyIHVzaW5nIHRoZSBgSU1BR0VfTE9BREVSYCB0b2tlbi5cbiAqIHByb3ZpZGVyczogW1xuICogICB7XG4gKiAgICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAqICAgICAgdXNlVmFsdWU6IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiB7XG4gKiAgICAgICAgcmV0dXJuIGBodHRwczovL2V4YW1wbGUuY29tLyR7Y29uZmlnLnNyY30tJHtjb25maWcud2lkdGh9LmpwZ31gO1xuICogICAgICB9XG4gKiAgIH0sXG4gKiBdLFxuICogYGBgXG4gKlxuICogU3RlcCAzOiB1cGRhdGUgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyB0byB1c2UgYG5nU3JjYCBpbnN0ZWFkIG9mIGBzcmNgLlxuICpcbiAqIGBgYFxuICogPGltZyBuZ1NyYz1cImxvZ28ucG5nXCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIxMDBcIj5cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnaW1nW25nU3JjXScsXG4gIGhvc3Q6IHtcbiAgICAnW3N0eWxlLnBvc2l0aW9uXSc6ICdmaWxsID8gXCJhYnNvbHV0ZVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS53aWR0aF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5oZWlnaHRdJzogJ2ZpbGwgPyBcIjEwMCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuaW5zZXRdJzogJ2ZpbGwgPyBcIjBcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1zaXplXSc6ICdwbGFjZWhvbGRlciA/IFwiY292ZXJcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1wb3NpdGlvbl0nOiAncGxhY2Vob2xkZXIgPyBcIjUwJSA1MCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1yZXBlYXRdJzogJ3BsYWNlaG9sZGVyID8gXCJuby1yZXBlYXRcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuYmFja2dyb3VuZC1pbWFnZV0nOiAncGxhY2Vob2xkZXIgPyBnZW5lcmF0ZVBsYWNlaG9sZGVyKHBsYWNlaG9sZGVyKSA6IG51bGwnLFxuICAgICdbc3R5bGUuZmlsdGVyXSc6IGBwbGFjZWhvbGRlciAmJiBzaG91bGRCbHVyUGxhY2Vob2xkZXIocGxhY2Vob2xkZXJDb25maWcpID8gXCJibHVyKCR7UExBQ0VIT0xERVJfQkxVUl9BTU9VTlR9cHgpXCIgOiBudWxsYCxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGltYWdlTG9hZGVyID0gaW5qZWN0KElNQUdFX0xPQURFUik7XG4gIHByaXZhdGUgY29uZmlnOiBJbWFnZUNvbmZpZyA9IHByb2Nlc3NDb25maWcoaW5qZWN0KElNQUdFX0NPTkZJRykpO1xuICBwcml2YXRlIHJlbmRlcmVyID0gaW5qZWN0KFJlbmRlcmVyMik7XG4gIHByaXZhdGUgaW1nRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuICBwcml2YXRlIGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0KFBMQVRGT1JNX0lEKSk7XG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlbG9hZExpbmtDcmVhdG9yID0gaW5qZWN0KFByZWxvYWRMaW5rQ3JlYXRvcik7XG5cbiAgLy8gYSBMQ1AgaW1hZ2Ugb2JzZXJ2ZXIgLSBzaG91bGQgYmUgaW5qZWN0ZWQgb25seSBpbiB0aGUgZGV2IG1vZGVcbiAgcHJpdmF0ZSBsY3BPYnNlcnZlciA9IG5nRGV2TW9kZSA/IHRoaXMuaW5qZWN0b3IuZ2V0KExDUEltYWdlT2JzZXJ2ZXIpIDogbnVsbDtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSByZXdyaXR0ZW4gYHNyY2Agb25jZSBhbmQgc3RvcmUgaXQuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIHJlcGV0aXRpdmUgY2FsY3VsYXRpb25zIGFuZCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBjbGVhbnVwIGluIHRoZVxuICAgKiBgbmdPbkRlc3Ryb3lgIGRvZXMgbm90IHJlbHkgb24gdGhlIGBJTUFHRV9MT0FERVJgIGxvZ2ljICh3aGljaCBpbiB0dXJuIGNhbiByZWx5IG9uIHNvbWUgb3RoZXJcbiAgICogaW5zdGFuY2UgdGhhdCBtaWdodCBiZSBhbHJlYWR5IGRlc3Ryb3llZCkuXG4gICAqL1xuICBwcml2YXRlIF9yZW5kZXJlZFNyYzogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIHNvdXJjZSBpbWFnZS5cbiAgICogSW1hZ2UgbmFtZSB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGFuZCB0aGUgZmluYWwgVVJMIHdpbGwgYmUgYXBwbGllZCBhcyB0aGUgYHNyY2BcbiAgICogcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKi9cbiAgQElucHV0KHtyZXF1aXJlZDogdHJ1ZSwgdHJhbnNmb3JtOiB1bndyYXBTYWZlVXJsfSkgbmdTcmMhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAgICogVGhlIGltYWdlIG5hbWUgd2lsbCBiZSB0YWtlbiBmcm9tIGBuZ1NyY2AgYW5kIGNvbWJpbmVkIHdpdGggdGhlIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eVxuICAgKiBkZXNjcmlwdG9ycyB0byBnZW5lcmF0ZSB0aGUgZmluYWwgYHNyY3NldGAgcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPGltZyBuZ1NyYz1cImhlbGxvLmpwZ1wiIG5nU3Jjc2V0PVwiMTAwdywgMjAwd1wiIC8+ICA9PlxuICAgKiA8aW1nIHNyYz1cInBhdGgvaGVsbG8uanBnXCIgc3Jjc2V0PVwicGF0aC9oZWxsby5qcGc/dz0xMDAgMTAwdywgcGF0aC9oZWxsby5qcGc/dz0yMDAgMjAwd1wiIC8+XG4gICAqIGBgYFxuICAgKi9cbiAgQElucHV0KCkgbmdTcmNzZXQhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBiYXNlIGBzaXplc2AgYXR0cmlidXRlIHBhc3NlZCB0aHJvdWdoIHRvIHRoZSBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFByb3ZpZGluZyBzaXplcyBjYXVzZXMgdGhlIGltYWdlIHRvIGNyZWF0ZSBhbiBhdXRvbWF0aWMgcmVzcG9uc2l2ZSBzcmNzZXQuXG4gICAqL1xuICBASW5wdXQoKSBzaXplcz86IHN0cmluZztcblxuICAvKipcbiAgICogRm9yIHJlc3BvbnNpdmUgaW1hZ2VzOiB0aGUgaW50cmluc2ljIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqIEZvciBmaXhlZCBzaXplIGltYWdlczogdGhlIGRlc2lyZWQgcmVuZGVyZWQgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBudW1iZXJBdHRyaWJ1dGV9KSB3aWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBGb3IgcmVzcG9uc2l2ZSBpbWFnZXM6IHRoZSBpbnRyaW5zaWMgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqIEZvciBmaXhlZCBzaXplIGltYWdlczogdGhlIGRlc2lyZWQgcmVuZGVyZWQgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuKiBUaGUgaW50cmluc2ljXG4gICAqIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pIGhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVzaXJlZCBsb2FkaW5nIGJlaGF2aW9yIChsYXp5LCBlYWdlciwgb3IgYXV0bykuIERlZmF1bHRzIHRvIGBsYXp5YCxcbiAgICogd2hpY2ggaXMgcmVjb21tZW5kZWQgZm9yIG1vc3QgaW1hZ2VzLlxuICAgKlxuICAgKiBXYXJuaW5nOiBTZXR0aW5nIGltYWdlcyBhcyBsb2FkaW5nPVwiZWFnZXJcIiBvciBsb2FkaW5nPVwiYXV0b1wiIG1hcmtzIHRoZW1cbiAgICogYXMgbm9uLXByaW9yaXR5IGltYWdlcyBhbmQgY2FuIGh1cnQgbG9hZGluZyBwZXJmb3JtYW5jZS4gRm9yIGltYWdlcyB3aGljaFxuICAgKiBtYXkgYmUgdGhlIExDUCBlbGVtZW50LCB1c2UgdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGluc3RlYWQgb2YgYGxvYWRpbmdgLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGluZz86ICdsYXp5JyB8ICdlYWdlcicgfCAnYXV0byc7XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW1hZ2Ugc2hvdWxkIGhhdmUgYSBoaWdoIHByaW9yaXR5LlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBwcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBEYXRhIHRvIHBhc3MgdGhyb3VnaCB0byBjdXN0b20gbG9hZGVycy5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRlclBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gZm9yIHRoaXMgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGRpc2FibGVPcHRpbWl6ZWRTcmNzZXQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU2V0cyB0aGUgaW1hZ2UgdG8gXCJmaWxsIG1vZGVcIiwgd2hpY2ggZWxpbWluYXRlcyB0aGUgaGVpZ2h0L3dpZHRoIHJlcXVpcmVtZW50IGFuZCBhZGRzXG4gICAqIHN0eWxlcyBzdWNoIHRoYXQgdGhlIGltYWdlIGZpbGxzIGl0cyBjb250YWluaW5nIGVsZW1lbnQuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGZpbGwgPSBmYWxzZTtcblxuICAvKipcbiAgICogQSBVUkwgb3IgZGF0YSBVUkwgZm9yIGFuIGltYWdlIHRvIGJlIHVzZWQgYXMgYSBwbGFjZWhvbGRlciB3aGlsZSB0aGlzIGltYWdlIGxvYWRzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5PckRhdGFVcmxBdHRyaWJ1dGV9KSBwbGFjZWhvbGRlcj86IHN0cmluZyB8IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyYXRpb24gb2JqZWN0IGZvciBwbGFjZWhvbGRlciBzZXR0aW5ncy4gT3B0aW9uczpcbiAgICogICAqIGJsdXI6IFNldHRpbmcgdGhpcyB0byBmYWxzZSBkaXNhYmxlcyB0aGUgYXV0b21hdGljIENTUyBibHVyLlxuICAgKi9cbiAgQElucHV0KCkgcGxhY2Vob2xkZXJDb25maWc/OiBJbWFnZVBsYWNlaG9sZGVyQ29uZmlnO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY2AgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3JjYCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3Jjc2V0YCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSgnTmdPcHRpbWl6ZWRJbWFnZScpO1xuXG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgIGFzc2VydE5vbkVtcHR5SW5wdXQodGhpcywgJ25nU3JjJywgdGhpcy5uZ1NyYyk7XG4gICAgICBhc3NlcnRWYWxpZE5nU3Jjc2V0KHRoaXMsIHRoaXMubmdTcmNzZXQpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyh0aGlzKTtcbiAgICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQodGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVcmwodGhpcyk7XG4gICAgICBpZiAodGhpcy5maWxsKSB7XG4gICAgICAgIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICAgIC8vIFRoaXMgbGVhdmVzIHRoZSBBbmd1bGFyIHpvbmUgdG8gYXZvaWQgdHJpZ2dlcmluZyB1bm5lY2Vzc2FyeSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlcyB3aGVuXG4gICAgICAgIC8vIGBsb2FkYCB0YXNrcyBhcmUgaW52b2tlZCBvbiBpbWFnZXMuXG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICAgIGFzc2VydE5vblplcm9SZW5kZXJlZEhlaWdodCh0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdGhpcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy53aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHRoaXMud2lkdGgsICd3aWR0aCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgY2hlY2sgZm9yIGRpc3RvcnRlZCBpbWFnZXMgd2hlbiBub3QgaW4gZmlsbCBtb2RlLCB3aGVyZVxuICAgICAgICAvLyBpbWFnZXMgbWF5IGJlIGludGVudGlvbmFsbHkgc3RyZXRjaGVkLCBjcm9wcGVkIG9yIGxldHRlcmJveGVkLlxuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgICAgICBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbih0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQodGhpcyk7XG4gICAgICBpZiAoIXRoaXMubmdTcmNzZXQpIHtcbiAgICAgICAgYXNzZXJ0Tm9Db21wbGV4U2l6ZXModGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnRWYWxpZFBsYWNlaG9sZGVyKHRoaXMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuICAgICAgYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIodGhpcy5uZ1NyYywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcblxuICAgICAgaWYgKHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyIS5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMubmdTcmMsIHRoaXMucHJpb3JpdHkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuYXNzZXJ0UHJlY29ubmVjdCh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMucGxhY2Vob2xkZXIpIHtcbiAgICAgIHRoaXMucmVtb3ZlUGxhY2Vob2xkZXJPbkxvYWQodGhpcy5pbWdFbGVtZW50KTtcbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlcygpIHtcbiAgICAvLyBNdXN0IHNldCB3aWR0aC9oZWlnaHQgZXhwbGljaXRseSBpbiBjYXNlIHRoZXkgYXJlIGJvdW5kIChpbiB3aGljaCBjYXNlIHRoZXkgd2lsbFxuICAgIC8vIG9ubHkgYmUgcmVmbGVjdGVkIGFuZCBub3QgZm91bmQgYnkgdGhlIGJyb3dzZXIpXG4gICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgdGhpcy5zaXplcyB8fD0gJzEwMHZ3JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGghLnRvU3RyaW5nKCkpO1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodCEudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdsb2FkaW5nJywgdGhpcy5nZXRMb2FkaW5nQmVoYXZpb3IoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdmZXRjaHByaW9yaXR5JywgdGhpcy5nZXRGZXRjaFByaW9yaXR5KCkpO1xuXG4gICAgLy8gVGhlIGBkYXRhLW5nLWltZ2AgYXR0cmlidXRlIGZsYWdzIGFuIGltYWdlIGFzIHVzaW5nIHRoZSBkaXJlY3RpdmUsIHRvIGFsbG93XG4gICAgLy8gZm9yIGFuYWx5c2lzIG9mIHRoZSBkaXJlY3RpdmUncyBwZXJmb3JtYW5jZS5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ25nLWltZycsICd0cnVlJyk7XG5cbiAgICAvLyBUaGUgYHNyY2AgYW5kIGBzcmNzZXRgIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIHNldCBsYXN0IHNpbmNlIG90aGVyIGF0dHJpYnV0ZXNcbiAgICAvLyBjb3VsZCBhZmZlY3QgdGhlIGltYWdlJ3MgbG9hZGluZyBiZWhhdmlvci5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLnVwZGF0ZVNyY0FuZFNyY3NldCgpO1xuXG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc2l6ZXMnLCB0aGlzLnNpemVzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTZXJ2ZXIgJiYgdGhpcy5wcmlvcml0eSkge1xuICAgICAgdGhpcy5wcmVsb2FkTGlua0NyZWF0b3IuY3JlYXRlUHJlbG9hZExpbmtUYWcoXG4gICAgICAgIHRoaXMucmVuZGVyZXIsXG4gICAgICAgIHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksXG4gICAgICAgIHJld3JpdHRlblNyY3NldCxcbiAgICAgICAgdGhpcy5zaXplcyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKHRoaXMsIGNoYW5nZXMsIFtcbiAgICAgICAgJ25nU3Jjc2V0JyxcbiAgICAgICAgJ3dpZHRoJyxcbiAgICAgICAgJ2hlaWdodCcsXG4gICAgICAgICdwcmlvcml0eScsXG4gICAgICAgICdmaWxsJyxcbiAgICAgICAgJ2xvYWRpbmcnLFxuICAgICAgICAnc2l6ZXMnLFxuICAgICAgICAnbG9hZGVyUGFyYW1zJyxcbiAgICAgICAgJ2Rpc2FibGVPcHRpbWl6ZWRTcmNzZXQnLFxuICAgICAgXSk7XG4gICAgfVxuICAgIGlmIChjaGFuZ2VzWyduZ1NyYyddICYmICFjaGFuZ2VzWyduZ1NyYyddLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgY29uc3Qgb2xkU3JjID0gdGhpcy5fcmVuZGVyZWRTcmM7XG4gICAgICB0aGlzLnVwZGF0ZVNyY0FuZFNyY3NldCh0cnVlKTtcbiAgICAgIGNvbnN0IG5ld1NyYyA9IHRoaXMuX3JlbmRlcmVkU3JjO1xuICAgICAgaWYgKHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwgJiYgb2xkU3JjICYmIG5ld1NyYyAmJiBvbGRTcmMgIT09IG5ld1NyYykge1xuICAgICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGNwT2JzZXJ2ZXI/LnVwZGF0ZUltYWdlKG9sZFNyYywgbmV3U3JjKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjYWxsSW1hZ2VMb2FkZXIoXG4gICAgY29uZmlnV2l0aG91dEN1c3RvbVBhcmFtczogT21pdDxJbWFnZUxvYWRlckNvbmZpZywgJ2xvYWRlclBhcmFtcyc+LFxuICApOiBzdHJpbmcge1xuICAgIGxldCBhdWdtZW50ZWRDb25maWc6IEltYWdlTG9hZGVyQ29uZmlnID0gY29uZmlnV2l0aG91dEN1c3RvbVBhcmFtcztcbiAgICBpZiAodGhpcy5sb2FkZXJQYXJhbXMpIHtcbiAgICAgIGF1Z21lbnRlZENvbmZpZy5sb2FkZXJQYXJhbXMgPSB0aGlzLmxvYWRlclBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMb2FkZXIoYXVnbWVudGVkQ29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMubG9hZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgaWYgKCF0aGlzLl9yZW5kZXJlZFNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5uZ1NyY307XG4gICAgICAvLyBDYWNoZSBjYWxjdWxhdGVkIGltYWdlIHNyYyB0byByZXVzZSBpdCBsYXRlciBpbiB0aGUgY29kZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gdGhpcy5jYWxsSW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVkU3JjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB3aWR0aFNyY1NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodGhpcy5uZ1NyY3NldCk7XG4gICAgY29uc3QgZmluYWxTcmNzID0gdGhpcy5uZ1NyY3NldFxuICAgICAgLnNwbGl0KCcsJylcbiAgICAgIC5maWx0ZXIoKHNyYykgPT4gc3JjICE9PSAnJylcbiAgICAgIC5tYXAoKHNyY1N0cikgPT4ge1xuICAgICAgICBzcmNTdHIgPSBzcmNTdHIudHJpbSgpO1xuICAgICAgICBjb25zdCB3aWR0aCA9IHdpZHRoU3JjU2V0ID8gcGFyc2VGbG9hdChzcmNTdHIpIDogcGFyc2VGbG9hdChzcmNTdHIpICogdGhpcy53aWR0aCE7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aH0pfSAke3NyY1N0cn1gO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBdXRvbWF0aWNTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzcG9uc2l2ZVNyY3NldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaXhlZFNyY3NldCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVzcG9uc2l2ZVNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHticmVha3BvaW50c30gPSB0aGlzLmNvbmZpZztcblxuICAgIGxldCBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhO1xuICAgIGlmICh0aGlzLnNpemVzPy50cmltKCkgPT09ICcxMDB2dycpIHtcbiAgICAgIC8vIFNpbmNlIHRoaXMgaXMgYSBmdWxsLXNjcmVlbi13aWR0aCBpbWFnZSwgb3VyIHNyY3NldCBvbmx5IG5lZWRzIHRvIGluY2x1ZGVcbiAgICAgIC8vIGJyZWFrcG9pbnRzIHdpdGggZnVsbCB2aWV3cG9ydCB3aWR0aHMuXG4gICAgICBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhLmZpbHRlcigoYnApID0+IGJwID49IFZJRVdQT1JUX0JSRUFLUE9JTlRfQ1VUT0ZGKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbFNyY3MgPSBmaWx0ZXJlZEJyZWFrcG9pbnRzLm1hcChcbiAgICAgIChicCkgPT4gYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGg6IGJwfSl9ICR7YnB9d2AsXG4gICAgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVNyY0FuZFNyY3NldChmb3JjZVNyY1JlY2FsYyA9IGZhbHNlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoZm9yY2VTcmNSZWNhbGMpIHtcbiAgICAgIC8vIFJlc2V0IGNhY2hlZCB2YWx1ZSwgc28gdGhhdCB0aGUgZm9sbG93dXAgYGdldFJld3JpdHRlblNyYygpYCBjYWxsXG4gICAgICAvLyB3aWxsIHJlY2FsY3VsYXRlIGl0IGFuZCB1cGRhdGUgdGhlIGNhY2hlLlxuICAgICAgdGhpcy5fcmVuZGVyZWRTcmMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHJld3JpdHRlblNyYyA9IHRoaXMuZ2V0UmV3cml0dGVuU3JjKCk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCByZXdyaXR0ZW5TcmMpO1xuXG4gICAgbGV0IHJld3JpdHRlblNyY3NldDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldFJld3JpdHRlblNyY3NldCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaG91bGRHZW5lcmF0ZUF1dG9tYXRpY1NyY3NldCgpKSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldEF1dG9tYXRpY1NyY3NldCgpO1xuICAgIH1cblxuICAgIGlmIChyZXdyaXR0ZW5TcmNzZXQpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3Jjc2V0JywgcmV3cml0dGVuU3Jjc2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJld3JpdHRlblNyY3NldDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Rml4ZWRTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSBERU5TSVRZX1NSQ1NFVF9NVUxUSVBMSUVSUy5tYXAoXG4gICAgICAobXVsdGlwbGllcikgPT5cbiAgICAgICAgYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe1xuICAgICAgICAgIHNyYzogdGhpcy5uZ1NyYyxcbiAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCEgKiBtdWx0aXBsaWVyLFxuICAgICAgICB9KX0gJHttdWx0aXBsaWVyfXhgLFxuICAgICk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRHZW5lcmF0ZUF1dG9tYXRpY1NyY3NldCgpOiBib29sZWFuIHtcbiAgICBsZXQgb3ZlcnNpemVkSW1hZ2UgPSBmYWxzZTtcbiAgICBpZiAoIXRoaXMuc2l6ZXMpIHtcbiAgICAgIG92ZXJzaXplZEltYWdlID1cbiAgICAgICAgdGhpcy53aWR0aCEgPiBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgfHwgdGhpcy5oZWlnaHQhID4gRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVDtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICF0aGlzLmRpc2FibGVPcHRpbWl6ZWRTcmNzZXQgJiZcbiAgICAgICF0aGlzLnNyY3NldCAmJlxuICAgICAgdGhpcy5pbWFnZUxvYWRlciAhPT0gbm9vcEltYWdlTG9hZGVyICYmXG4gICAgICAhb3ZlcnNpemVkSW1hZ2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaW1hZ2UgdXJsIGZvcm1hdHRlZCBmb3IgdXNlIHdpdGggdGhlIENTUyBiYWNrZ3JvdW5kLWltYWdlIHByb3BlcnR5LiBFeHBlY3RzIG9uZSBvZjpcbiAgICogKiBBIGJhc2U2NCBlbmNvZGVkIGltYWdlLCB3aGljaCBpcyB3cmFwcGVkIGFuZCBwYXNzZWQgdGhyb3VnaC5cbiAgICogKiBBIGJvb2xlYW4uIElmIHRydWUsIGNhbGxzIHRoZSBpbWFnZSBsb2FkZXIgdG8gZ2VuZXJhdGUgYSBzbWFsbCBwbGFjZWhvbGRlciB1cmwuXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlUGxhY2Vob2xkZXIocGxhY2Vob2xkZXJJbnB1dDogc3RyaW5nIHwgYm9vbGVhbik6IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHtcbiAgICBjb25zdCB7cGxhY2Vob2xkZXJSZXNvbHV0aW9ufSA9IHRoaXMuY29uZmlnO1xuICAgIGlmIChwbGFjZWhvbGRlcklucHV0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gYHVybCgke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtcbiAgICAgICAgc3JjOiB0aGlzLm5nU3JjLFxuICAgICAgICB3aWR0aDogcGxhY2Vob2xkZXJSZXNvbHV0aW9uLFxuICAgICAgICBpc1BsYWNlaG9sZGVyOiB0cnVlLFxuICAgICAgfSl9KWA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGxhY2Vob2xkZXJJbnB1dCA9PT0gJ3N0cmluZycgJiYgcGxhY2Vob2xkZXJJbnB1dC5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgICByZXR1cm4gYHVybCgke3BsYWNlaG9sZGVySW5wdXR9KWA7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYmx1ciBzaG91bGQgYmUgYXBwbGllZCwgYmFzZWQgb24gYW4gb3B0aW9uYWwgYm9vbGVhblxuICAgKiBwcm9wZXJ0eSBgYmx1cmAgd2l0aGluIHRoZSBvcHRpb25hbCBjb25maWd1cmF0aW9uIG9iamVjdCBgcGxhY2Vob2xkZXJDb25maWdgLlxuICAgKi9cbiAgcHJpdmF0ZSBzaG91bGRCbHVyUGxhY2Vob2xkZXIocGxhY2Vob2xkZXJDb25maWc/OiBJbWFnZVBsYWNlaG9sZGVyQ29uZmlnKTogYm9vbGVhbiB7XG4gICAgaWYgKCFwbGFjZWhvbGRlckNvbmZpZyB8fCAhcGxhY2Vob2xkZXJDb25maWcuaGFzT3duUHJvcGVydHkoJ2JsdXInKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBCb29sZWFuKHBsYWNlaG9sZGVyQ29uZmlnLmJsdXIpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVQbGFjZWhvbGRlck9uTG9hZChpbWc6IEhUTUxJbWFnZUVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNoYW5nZURldGVjdG9yUmVmID0gdGhpcy5pbmplY3Rvci5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICAgICAgdGhpcy5wbGFjZWhvbGRlciA9IGZhbHNlO1xuICAgICAgY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IHJlbW92ZUxvYWRMaXN0ZW5lckZuID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsIGNhbGxiYWNrKTtcbiAgICBjb25zdCByZW1vdmVFcnJvckxpc3RlbmVyRm4gPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihpbWcsICdlcnJvcicsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMuX3JlbmRlcmVkU3JjICE9PSBudWxsICYmIHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5sY3BPYnNlcnZlci51bnJlZ2lzdGVySW1hZ2UodGhpcy5fcmVuZGVyZWRTcmMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmltZ0VsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG4vKioqKiogSGVscGVycyAqKioqKi9cblxuLyoqXG4gKiBTb3J0cyBwcm92aWRlZCBjb25maWcgYnJlYWtwb2ludHMgYW5kIHVzZXMgZGVmYXVsdHMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NDb25maWcoY29uZmlnOiBJbWFnZUNvbmZpZyk6IEltYWdlQ29uZmlnIHtcbiAgbGV0IHNvcnRlZEJyZWFrcG9pbnRzOiB7YnJlYWtwb2ludHM/OiBudW1iZXJbXX0gPSB7fTtcbiAgaWYgKGNvbmZpZy5icmVha3BvaW50cykge1xuICAgIHNvcnRlZEJyZWFrcG9pbnRzLmJyZWFrcG9pbnRzID0gY29uZmlnLmJyZWFrcG9pbnRzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgSU1BR0VfQ09ORklHX0RFRkFVTFRTLCBjb25maWcsIHNvcnRlZEJyZWFrcG9pbnRzKTtcbn1cblxuLyoqKioqIEFzc2VydCBmdW5jdGlvbnMgKioqKiovXG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3JjYCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3JjKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNfQVRUUixcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gYm90aCBcXGBzcmNcXGAgYW5kIFxcYG5nU3JjXFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBzZXRzIFxcYHNyY1xcYCBpdHNlbGYgYmFzZWQgb24gdGhlIHZhbHVlIG9mIFxcYG5nU3JjXFxgLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNcXGAgYXR0cmlidXRlLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY3NldGAgc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDU0VUX0FUVFIsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3Jjc2V0XFxgIGFuZCBcXGBuZ1NyY3NldFxcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNzZXRcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBgICtcbiAgICAgICAgYFxcYG5nU3Jjc2V0XFxgLiBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3Jjc2V0XFxgIGF0dHJpYnV0ZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG5nU3JjID0gZGlyLm5nU3JjLnRyaW0oKTtcbiAgaWYgKG5nU3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAobmdTcmMubGVuZ3RoID4gQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSB7XG4gICAgICBuZ1NyYyA9IG5nU3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYywgZmFsc2UpfSBcXGBuZ1NyY1xcYCBpcyBhIEJhc2U2NC1lbmNvZGVkIHN0cmluZyBgICtcbiAgICAgICAgYCgke25nU3JjfSkuIE5nT3B0aW1pemVkSW1hZ2UgZG9lcyBub3Qgc3VwcG9ydCBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgbmdTcmNcXGAgYW5kIHVzaW5nIGEgc3RhbmRhcmQgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlICdzaXplcycgb25seSBpbmNsdWRlcyByZXNwb25zaXZlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db21wbGV4U2l6ZXMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBzaXplcyA9IGRpci5zaXplcztcbiAgaWYgKHNpemVzPy5tYXRjaCgvKChcXCl8LClcXHN8XilcXGQrcHgvKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYywgZmFsc2UpfSBcXGBzaXplc1xcYCB3YXMgc2V0IHRvIGEgc3RyaW5nIGluY2x1ZGluZyBgICtcbiAgICAgICAgYHBpeGVsIHZhbHVlcy4gRm9yIGF1dG9tYXRpYyBcXGBzcmNzZXRcXGAgZ2VuZXJhdGlvbiwgXFxgc2l6ZXNcXGAgbXVzdCBvbmx5IGluY2x1ZGUgcmVzcG9uc2l2ZSBgICtcbiAgICAgICAgYHZhbHVlcywgc3VjaCBhcyBcXGBzaXplcz1cIjUwdndcIlxcYCBvciBcXGBzaXplcz1cIihtaW4td2lkdGg6IDc2OHB4KSA1MHZ3LCAxMDB2d1wiXFxgLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBtb2RpZnkgdGhlIFxcYHNpemVzXFxgIGF0dHJpYnV0ZSwgb3IgcHJvdmlkZSB5b3VyIG93biBcXGBuZ1NyY3NldFxcYCB2YWx1ZSBkaXJlY3RseS5gLFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0VmFsaWRQbGFjZWhvbGRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBhc3NlcnROb1BsYWNlaG9sZGVyQ29uZmlnV2l0aG91dFBsYWNlaG9sZGVyKGRpcik7XG4gIGFzc2VydE5vUmVsYXRpdmVQbGFjZWhvbGRlcldpdGhvdXRMb2FkZXIoZGlyLCBpbWFnZUxvYWRlcik7XG4gIGFzc2VydE5vT3ZlcnNpemVkRGF0YVVybChkaXIpO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgcGxhY2Vob2xkZXJDb25maWcgaXNuJ3QgYmVpbmcgdXNlZCB3aXRob3V0IHBsYWNlaG9sZGVyXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUGxhY2Vob2xkZXJDb25maWdXaXRob3V0UGxhY2Vob2xkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIucGxhY2Vob2xkZXJDb25maWcgJiYgIWRpci5wbGFjZWhvbGRlcikge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICBkaXIubmdTcmMsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKX0gXFxgcGxhY2Vob2xkZXJDb25maWdcXGAgb3B0aW9ucyB3ZXJlIHByb3ZpZGVkIGZvciBhbiBgICtcbiAgICAgICAgYGltYWdlIHRoYXQgZG9lcyBub3QgdXNlIHRoZSBcXGBwbGFjZWhvbGRlclxcYCBhdHRyaWJ1dGUsIGFuZCB3aWxsIGhhdmUgbm8gZWZmZWN0LmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIGEgcmVsYXRpdmUgVVJMIHBsYWNlaG9sZGVyIGlzIHNwZWNpZmllZCwgYnV0IG5vIGxvYWRlciBpcyBwcmVzZW50IHRvIHByb3ZpZGUgdGhlIHNtYWxsXG4gKiBpbWFnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9SZWxhdGl2ZVBsYWNlaG9sZGVyV2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLnBsYWNlaG9sZGVyID09PSB0cnVlICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX05FQ0VTU0FSWV9MT0FERVIsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBwbGFjZWhvbGRlclxcYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIHRydWUgYnV0IGAgK1xuICAgICAgICBgbm8gaW1hZ2UgbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLCBgICtcbiAgICAgICAgYHdoaWNoIHdvdWxkIHJlc3VsdCBpbiB0aGUgc2FtZSBpbWFnZSBiZWluZyB1c2VkIGZvciB0aGUgcHJpbWFyeSBpbWFnZSBhbmQgaXRzIHBsYWNlaG9sZGVyLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGZyb20gdGhlIGltYWdlLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIG9yIHRocm93cyBhbiBlcnJvciBpZiBhbiBvdmVyc2l6ZWQgZGF0YVVSTCBwbGFjZWhvbGRlciBpcyBwcm92aWRlZC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9PdmVyc2l6ZWREYXRhVXJsKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoXG4gICAgZGlyLnBsYWNlaG9sZGVyICYmXG4gICAgdHlwZW9mIGRpci5wbGFjZWhvbGRlciA9PT0gJ3N0cmluZycgJiZcbiAgICBkaXIucGxhY2Vob2xkZXIuc3RhcnRzV2l0aCgnZGF0YTonKVxuICApIHtcbiAgICBpZiAoZGlyLnBsYWNlaG9sZGVyLmxlbmd0aCA+IERBVEFfVVJMX0VSUk9SX0xJTUlUKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk9WRVJTSVpFRF9QTEFDRUhPTERFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgICBkaXIubmdTcmMsXG4gICAgICAgICl9IHRoZSBcXGBwbGFjZWhvbGRlclxcYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGEgZGF0YSBVUkwgd2hpY2ggaXMgbG9uZ2VyIGAgK1xuICAgICAgICAgIGB0aGFuICR7REFUQV9VUkxfRVJST1JfTElNSVR9IGNoYXJhY3RlcnMuIFRoaXMgaXMgc3Ryb25nbHkgZGlzY291cmFnZWQsIGFzIGxhcmdlIGlubGluZSBwbGFjZWhvbGRlcnMgYCArXG4gICAgICAgICAgYGRpcmVjdGx5IGluY3JlYXNlIHRoZSBidW5kbGUgc2l6ZSBvZiBBbmd1bGFyIGFuZCBodXJ0IHBhZ2UgbG9hZCBwZXJmb3JtYW5jZS4gVG8gZml4IHRoaXMsIGdlbmVyYXRlIGAgK1xuICAgICAgICAgIGBhIHNtYWxsZXIgZGF0YSBVUkwgcGxhY2Vob2xkZXIuYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChkaXIucGxhY2Vob2xkZXIubGVuZ3RoID4gREFUQV9VUkxfV0FSTl9MSU1JVCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfUExBQ0VIT0xERVIsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgICAgIGRpci5uZ1NyYyxcbiAgICAgICAgICApfSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGlzIHNldCB0byBhIGRhdGEgVVJMIHdoaWNoIGlzIGxvbmdlciBgICtcbiAgICAgICAgICAgIGB0aGFuICR7REFUQV9VUkxfV0FSTl9MSU1JVH0gY2hhcmFjdGVycy4gVGhpcyBpcyBkaXNjb3VyYWdlZCwgYXMgbGFyZ2UgaW5saW5lIHBsYWNlaG9sZGVycyBgICtcbiAgICAgICAgICAgIGBkaXJlY3RseSBpbmNyZWFzZSB0aGUgYnVuZGxlIHNpemUgb2YgQW5ndWxhciBhbmQgaHVydCBwYWdlIGxvYWQgcGVyZm9ybWFuY2UuIEZvciBiZXR0ZXIgbG9hZGluZyBwZXJmb3JtYW5jZSwgYCArXG4gICAgICAgICAgICBgZ2VuZXJhdGUgYSBzbWFsbGVyIGRhdGEgVVJMIHBsYWNlaG9sZGVyLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY2AgaXMgbm90IGEgQmxvYiBVUkwuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVcmwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IG5nU3JjID0gZGlyLm5nU3JjLnRyaW0oKTtcbiAgaWYgKG5nU3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGBuZ1NyY1xcYCB3YXMgc2V0IHRvIGEgYmxvYiBVUkwgKCR7bmdTcmN9KS4gYCArXG4gICAgICAgIGBCbG9iIFVSTHMgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgbmdTcmNcXGAgYW5kIHVzaW5nIGEgcmVndWxhciBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgaW5wdXQgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuICBjb25zdCBpc0VtcHR5U3RyaW5nID0gaXNTdHJpbmcgJiYgdmFsdWUudHJpbSgpID09PSAnJztcbiAgaWYgKCFpc1N0cmluZyB8fCBpc0VtcHR5U3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtuYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSBgICtcbiAgICAgICAgYChcXGAke3ZhbHVlfVxcYCkuIFRvIGZpeCB0aGlzLCBjaGFuZ2UgdGhlIHZhbHVlIHRvIGEgbm9uLWVtcHR5IHN0cmluZy5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNzZXRgIGlzIGluIGEgdmFsaWQgZm9ybWF0LCBlLmcuIFwiMTAwdywgMjAwd1wiIG9yIFwiMXgsIDJ4XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZE5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgdmFsdWU6IHVua25vd24pIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybjtcbiAgYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXIsICduZ1NyY3NldCcsIHZhbHVlKTtcbiAgY29uc3Qgc3RyaW5nVmFsID0gdmFsdWUgYXMgc3RyaW5nO1xuICBjb25zdCBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuICBjb25zdCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IgPSBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcblxuICBpZiAoaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yKSB7XG4gICAgYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpciwgc3RyaW5nVmFsKTtcbiAgfVxuXG4gIGNvbnN0IGlzVmFsaWRTcmNzZXQgPSBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yIHx8IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcjtcbiAgaWYgKCFpc1ZhbGlkU3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNzZXRcXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgKFxcYCR7dmFsdWV9XFxgKS4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgc3VwcGx5IFxcYG5nU3Jjc2V0XFxgIHVzaW5nIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2Ygb25lIG9yIG1vcmUgd2lkdGggYCArXG4gICAgICAgIGBkZXNjcmlwdG9ycyAoZS5nLiBcIjEwMHcsIDIwMHdcIikgb3IgZGVuc2l0eSBkZXNjcmlwdG9ycyAoZS5nLiBcIjF4LCAyeFwiKS5gLFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgdmFsdWU6IHN0cmluZykge1xuICBjb25zdCB1bmRlckRlbnNpdHlDYXAgPSB2YWx1ZVxuICAgIC5zcGxpdCgnLCcpXG4gICAgLmV2ZXJ5KChudW0pID0+IG51bSA9PT0gJycgfHwgcGFyc2VGbG9hdChudW0pIDw9IEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUCk7XG4gIGlmICghdW5kZXJEZW5zaXR5Q2FwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYG5nU3Jjc2V0XFxgIGNvbnRhaW5zIGFuIHVuc3VwcG9ydGVkIGltYWdlIGRlbnNpdHk6YCArXG4gICAgICAgIGBcXGAke3ZhbHVlfVxcYC4gTmdPcHRpbWl6ZWRJbWFnZSBnZW5lcmFsbHkgcmVjb21tZW5kcyBhIG1heCBpbWFnZSBkZW5zaXR5IG9mIGAgK1xuICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCBidXQgc3VwcG9ydHMgaW1hZ2UgZGVuc2l0aWVzIHVwIHRvIGAgK1xuICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eC4gVGhlIGh1bWFuIGV5ZSBjYW5ub3QgZGlzdGluZ3Vpc2ggYmV0d2VlbiBpbWFnZSBkZW5zaXRpZXMgYCArXG4gICAgICAgIGBncmVhdGVyIHRoYW4gJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCAtIHdoaWNoIG1ha2VzIHRoZW0gdW5uZWNlc3NhcnkgZm9yIGAgK1xuICAgICAgICBgbW9zdCB1c2UgY2FzZXMuIEltYWdlcyB0aGF0IHdpbGwgYmUgcGluY2gtem9vbWVkIGFyZSB0eXBpY2FsbHkgdGhlIHByaW1hcnkgdXNlIGNhc2UgZm9yIGAgK1xuICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eCBpbWFnZXMuIFBsZWFzZSByZW1vdmUgdGhlIGhpZ2ggZGVuc2l0eSBkZXNjcmlwdG9yIGFuZCB0cnkgYWdhaW4uYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBSdW50aW1lRXJyb3JgIGluc3RhbmNlIHRvIHJlcHJlc2VudCBhIHNpdHVhdGlvbiB3aGVuIGFuIGlucHV0IGlzIHNldCBhZnRlclxuICogdGhlIGRpcmVjdGl2ZSBoYXMgaW5pdGlhbGl6ZWQuXG4gKi9cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICBsZXQgcmVhc29uITogc3RyaW5nO1xuICBpZiAoaW5wdXROYW1lID09PSAnd2lkdGgnIHx8IGlucHV0TmFtZSA9PT0gJ2hlaWdodCcpIHtcbiAgICByZWFzb24gPVxuICAgICAgYENoYW5naW5nIFxcYCR7aW5wdXROYW1lfVxcYCBtYXkgcmVzdWx0IGluIGRpZmZlcmVudCBhdHRyaWJ1dGUgdmFsdWUgYCArXG4gICAgICBgYXBwbGllZCB0byB0aGUgdW5kZXJseWluZyBpbWFnZSBlbGVtZW50IGFuZCBjYXVzZSBsYXlvdXQgc2hpZnRzIG9uIGEgcGFnZS5gO1xuICB9IGVsc2Uge1xuICAgIHJlYXNvbiA9XG4gICAgICBgQ2hhbmdpbmcgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCB3b3VsZCBoYXZlIG5vIGVmZmVjdCBvbiB0aGUgdW5kZXJseWluZyBgICtcbiAgICAgIGBpbWFnZSBlbGVtZW50LCBiZWNhdXNlIHRoZSByZXNvdXJjZSBsb2FkaW5nIGhhcyBhbHJlYWR5IG9jY3VycmVkLmA7XG4gIH1cbiAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoXG4gICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX0lOUFVUX0NIQU5HRSxcbiAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7aW5wdXROYW1lfVxcYCB3YXMgdXBkYXRlZCBhZnRlciBpbml0aWFsaXphdGlvbi4gYCArXG4gICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgbm90IHJlYWN0IHRvIHRoaXMgaW5wdXQgY2hhbmdlLiAke3JlYXNvbn0gYCArXG4gICAgICBgVG8gZml4IHRoaXMsIGVpdGhlciBzd2l0Y2ggXFxgJHtpbnB1dE5hbWV9XFxgIHRvIGEgc3RhdGljIHZhbHVlIGAgK1xuICAgICAgYG9yIHdyYXAgdGhlIGltYWdlIGVsZW1lbnQgaW4gYW4gKm5nSWYgdGhhdCBpcyBnYXRlZCBvbiB0aGUgbmVjZXNzYXJ5IHZhbHVlLmAsXG4gICk7XG59XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgbm9uZSBvZiB0aGUgbGlzdGVkIGlucHV0cyBoYXMgY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsXG4gIGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMsXG4gIGlucHV0czogc3RyaW5nW10sXG4pIHtcbiAgaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICduZ1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYG5nU3JjYCBpbnB1dCBjaGFuZ2VzLCB3ZSBkZXRlY3QgdGhhdCBvbmx5IGluIHRoZVxuICAgICAgICAvLyBgbmdPbkNoYW5nZXNgIGhvb2ssIHRodXMgdGhlIGBuZ1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgbmdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtuZ1NyYzogY2hhbmdlc1tpbnB1dF0ucHJldmlvdXNWYWx1ZX0gYXMgTmdPcHRpbWl6ZWRJbWFnZTtcbiAgICAgIH1cbiAgICAgIHRocm93IHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXIsIGlucHV0KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEdyZWF0ZXJUaGFuWmVybyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHZhbGlkTnVtYmVyID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInICYmIGlucHV0VmFsdWUgPiAwO1xuICBjb25zdCB2YWxpZFN0cmluZyA9XG4gICAgdHlwZW9mIGlucHV0VmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoaW5wdXRWYWx1ZS50cmltKCkpICYmIHBhcnNlSW50KGlucHV0VmFsdWUpID4gMDtcbiAgaWYgKCF2YWxpZE51bWJlciAmJiAhdmFsaWRTdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgXFxgJHtpbnB1dE5hbWV9XFxgIGFzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGlzIG5vdCB2aXN1YWxseSBkaXN0b3J0ZWQuIEVmZmVjdGl2ZWx5IHRoaXMgaXMgY2hlY2tpbmc6XG4gKiAtIFdoZXRoZXIgdGhlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHJlZmxlY3QgdGhlIGFjdHVhbCBkaW1lbnNpb25zIG9mIHRoZSBpbWFnZS5cbiAqIC0gV2hldGhlciBpbWFnZSBzdHlsaW5nIGlzIFwiY29ycmVjdFwiIChzZWUgYmVsb3cgZm9yIGEgbG9uZ2VyIGV4cGxhbmF0aW9uKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24oXG4gIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSxcbiAgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LFxuICByZW5kZXJlcjogUmVuZGVyZXIyLFxuKSB7XG4gIGNvbnN0IHJlbW92ZUxvYWRMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoaW1nKTtcbiAgICBsZXQgcmVuZGVyZWRXaWR0aCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd3aWR0aCcpKTtcbiAgICBsZXQgcmVuZGVyZWRIZWlnaHQgPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnaGVpZ2h0JykpO1xuICAgIGNvbnN0IGJveFNpemluZyA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnYm94LXNpemluZycpO1xuXG4gICAgaWYgKGJveFNpemluZyA9PT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICBjb25zdCBwYWRkaW5nVG9wID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXRvcCcpO1xuICAgICAgY29uc3QgcGFkZGluZ1JpZ2h0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXJpZ2h0Jyk7XG4gICAgICBjb25zdCBwYWRkaW5nQm90dG9tID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWJvdHRvbScpO1xuICAgICAgY29uc3QgcGFkZGluZ0xlZnQgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctbGVmdCcpO1xuICAgICAgcmVuZGVyZWRXaWR0aCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdSaWdodCkgKyBwYXJzZUZsb2F0KHBhZGRpbmdMZWZ0KTtcbiAgICAgIHJlbmRlcmVkSGVpZ2h0IC09IHBhcnNlRmxvYXQocGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KHBhZGRpbmdCb3R0b20pO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbmRlcmVkQXNwZWN0UmF0aW8gPSByZW5kZXJlZFdpZHRoIC8gcmVuZGVyZWRIZWlnaHQ7XG4gICAgY29uc3Qgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucyA9IHJlbmRlcmVkV2lkdGggIT09IDAgJiYgcmVuZGVyZWRIZWlnaHQgIT09IDA7XG5cbiAgICBjb25zdCBpbnRyaW5zaWNXaWR0aCA9IGltZy5uYXR1cmFsV2lkdGg7XG4gICAgY29uc3QgaW50cmluc2ljSGVpZ2h0ID0gaW1nLm5hdHVyYWxIZWlnaHQ7XG4gICAgY29uc3QgaW50cmluc2ljQXNwZWN0UmF0aW8gPSBpbnRyaW5zaWNXaWR0aCAvIGludHJpbnNpY0hlaWdodDtcblxuICAgIGNvbnN0IHN1cHBsaWVkV2lkdGggPSBkaXIud2lkdGghO1xuICAgIGNvbnN0IHN1cHBsaWVkSGVpZ2h0ID0gZGlyLmhlaWdodCE7XG4gICAgY29uc3Qgc3VwcGxpZWRBc3BlY3RSYXRpbyA9IHN1cHBsaWVkV2lkdGggLyBzdXBwbGllZEhlaWdodDtcblxuICAgIC8vIFRvbGVyYW5jZSBpcyB1c2VkIHRvIGFjY291bnQgZm9yIHRoZSBpbXBhY3Qgb2Ygc3VicGl4ZWwgcmVuZGVyaW5nLlxuICAgIC8vIER1ZSB0byBzdWJwaXhlbCByZW5kZXJpbmcsIHRoZSByZW5kZXJlZCwgaW50cmluc2ljLCBhbmQgc3VwcGxpZWRcbiAgICAvLyBhc3BlY3QgcmF0aW9zIG9mIGEgY29ycmVjdGx5IGNvbmZpZ3VyZWQgaW1hZ2UgbWF5IG5vdCBleGFjdGx5IG1hdGNoLlxuICAgIC8vIEZvciBleGFtcGxlLCBhIGB3aWR0aD00MDMwIGhlaWdodD0zMDIwYCBpbWFnZSBtaWdodCBoYXZlIGEgcmVuZGVyZWRcbiAgICAvLyBzaXplIG9mIFwiMTA2MncsIDc5Ni40OGhcIi4gKEFuIGFzcGVjdCByYXRpbyBvZiAxLjMzNC4uLiB2cy4gMS4zMzMuLi4pXG4gICAgY29uc3QgaW5hY2N1cmF0ZURpbWVuc2lvbnMgPVxuICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPVxuICAgICAgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucyAmJlxuICAgICAgTWF0aC5hYnMoaW50cmluc2ljQXNwZWN0UmF0aW8gLSByZW5kZXJlZEFzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG5cbiAgICBpZiAoaW5hY2N1cmF0ZURpbWVuc2lvbnMpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIGltYWdlIGRvZXMgbm90IG1hdGNoIGAgK1xuICAgICAgICAgICAgYHRoZSBhc3BlY3QgcmF0aW8gaW5kaWNhdGVkIGJ5IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuIGAgK1xuICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7cm91bmQoXG4gICAgICAgICAgICAgIGludHJpbnNpY0FzcGVjdFJhdGlvLFxuICAgICAgICAgICAgKX0pLiBcXG5TdXBwbGllZCB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXM6IGAgK1xuICAgICAgICAgICAgYCR7c3VwcGxpZWRXaWR0aH13IHggJHtzdXBwbGllZEhlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7cm91bmQoXG4gICAgICAgICAgICAgIHN1cHBsaWVkQXNwZWN0UmF0aW8sXG4gICAgICAgICAgICApfSkuIGAgK1xuICAgICAgICAgICAgYFxcblRvIGZpeCB0aGlzLCB1cGRhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHN0eWxpbmdEaXN0b3J0aW9uKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBgICtcbiAgICAgICAgICAgIGBkb2VzIG5vdCBtYXRjaCB0aGUgaW1hZ2UncyBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiBgICtcbiAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKGludHJpbnNpY0FzcGVjdFJhdGlvKX0pLiBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiBgICtcbiAgICAgICAgICAgIGAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiBgICtcbiAgICAgICAgICAgIGAke3JvdW5kKHJlbmRlcmVkQXNwZWN0UmF0aW8pfSkuIFxcblRoaXMgaXNzdWUgY2FuIG9jY3VyIGlmIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBgICtcbiAgICAgICAgICAgIGBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhbiBpbWFnZSB3aXRob3V0IHVwZGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nIGAgK1xuICAgICAgICAgICAgYGltYWdlIHN0eWxpbmcuIFRvIGZpeCB0aGlzLCBhZGp1c3QgaW1hZ2Ugc3R5bGluZy4gSW4gbW9zdCBjYXNlcywgYCArXG4gICAgICAgICAgICBgYWRkaW5nIFwiaGVpZ2h0OiBhdXRvXCIgb3IgXCJ3aWR0aDogYXV0b1wiIHRvIHRoZSBpbWFnZSBzdHlsaW5nIHdpbGwgZml4IGAgK1xuICAgICAgICAgICAgYHRoaXMgaXNzdWUuYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICghZGlyLm5nU3Jjc2V0ICYmIG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMpIHtcbiAgICAgIC8vIElmIGBuZ1NyY3NldGAgaGFzbid0IGJlZW4gc2V0LCBzYW5pdHkgY2hlY2sgdGhlIGludHJpbnNpYyBzaXplLlxuICAgICAgY29uc3QgcmVjb21tZW5kZWRXaWR0aCA9IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCAqIHJlbmRlcmVkV2lkdGg7XG4gICAgICBjb25zdCByZWNvbW1lbmRlZEhlaWdodCA9IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCAqIHJlbmRlcmVkSGVpZ2h0O1xuICAgICAgY29uc3Qgb3ZlcnNpemVkV2lkdGggPSBpbnRyaW5zaWNXaWR0aCAtIHJlY29tbWVuZGVkV2lkdGggPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGNvbnN0IG92ZXJzaXplZEhlaWdodCA9IGludHJpbnNpY0hlaWdodCAtIHJlY29tbWVuZGVkSGVpZ2h0ID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgICBpZiAob3ZlcnNpemVkV2lkdGggfHwgb3ZlcnNpemVkSGVpZ2h0KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk9WRVJTSVpFRF9JTUFHRSxcbiAgICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGludHJpbnNpYyBpbWFnZSBpcyBzaWduaWZpY2FudGx5IGAgK1xuICAgICAgICAgICAgICBgbGFyZ2VyIHRoYW4gbmVjZXNzYXJ5LiBgICtcbiAgICAgICAgICAgICAgYFxcblJlbmRlcmVkIGltYWdlIHNpemU6ICR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgYFxcblJlY29tbWVuZGVkIGludHJpbnNpYyBpbWFnZSBzaXplOiAke3JlY29tbWVuZGVkV2lkdGh9dyB4ICR7cmVjb21tZW5kZWRIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgIGBcXG5Ob3RlOiBSZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZSBpcyBjYWxjdWxhdGVkIGFzc3VtaW5nIGEgbWF4aW11bSBEUFIgb2YgYCArXG4gICAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH0uIFRvIGltcHJvdmUgbG9hZGluZyB0aW1lLCByZXNpemUgdGhlIGltYWdlIGAgK1xuICAgICAgICAgICAgICBgb3IgY29uc2lkZXIgdXNpbmcgdGhlIFwibmdTcmNzZXRcIiBhbmQgXCJzaXplc1wiIGF0dHJpYnV0ZXMuYCxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gV2Ugb25seSBsaXN0ZW4gdG8gdGhlIGBlcnJvcmAgZXZlbnQgdG8gcmVtb3ZlIHRoZSBgbG9hZGAgZXZlbnQgbGlzdGVuZXIgYmVjYXVzZSBpdCB3aWxsIG5vdCBiZVxuICAvLyBmaXJlZCBpZiB0aGUgaW1hZ2UgZmFpbHMgdG8gbG9hZC4gVGhpcyBpcyBkb25lIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzIGluIGRldmVsb3BtZW50IG1vZGVcbiAgLy8gYmVjYXVzZSBpbWFnZSBlbGVtZW50cyBhcmVuJ3QgZ2FyYmFnZS1jb2xsZWN0ZWQgcHJvcGVybHkuIEl0IGhhcHBlbnMgYmVjYXVzZSB6b25lLmpzIHN0b3JlcyB0aGVcbiAgLy8gZXZlbnQgbGlzdGVuZXIgZGlyZWN0bHkgb24gdGhlIGVsZW1lbnQgYW5kIGNsb3N1cmVzIGNhcHR1cmUgYGRpcmAuXG4gIGNvbnN0IHJlbW92ZUVycm9yTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdlcnJvcicsICgpID0+IHtcbiAgICByZW1vdmVMb2FkTGlzdGVuZXJGbigpO1xuICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG1pc3NpbmdBdHRyaWJ1dGVzID0gW107XG4gIGlmIChkaXIud2lkdGggPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnd2lkdGgnKTtcbiAgaWYgKGRpci5oZWlnaHQgPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnaGVpZ2h0Jyk7XG4gIGlmIChtaXNzaW5nQXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUkVRVUlSRURfSU5QVVRfTUlTU0lORyxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlc2UgcmVxdWlyZWQgYXR0cmlidXRlcyBgICtcbiAgICAgICAgYGFyZSBtaXNzaW5nOiAke21pc3NpbmdBdHRyaWJ1dGVzLm1hcCgoYXR0cikgPT4gYFwiJHthdHRyfVwiYCkuam9pbignLCAnKX0uIGAgK1xuICAgICAgICBgSW5jbHVkaW5nIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHdpbGwgcHJldmVudCBpbWFnZS1yZWxhdGVkIGxheW91dCBzaGlmdHMuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIGluY2x1ZGUgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgb24gdGhlIGltYWdlIHRhZyBvciB0dXJuIG9uIGAgK1xuICAgICAgICBgXCJmaWxsXCIgbW9kZSB3aXRoIHRoZSBcXGBmaWxsXFxgIGF0dHJpYnV0ZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHdpZHRoIGFuZCBoZWlnaHQgYXJlIG5vdCBzZXQuIFVzZWQgaW4gZmlsbCBtb2RlLCB3aGVyZSB0aG9zZSBhdHRyaWJ1dGVzIGRvbid0IG1ha2VcbiAqIHNlbnNlLlxuICovXG5mdW5jdGlvbiBhc3NlcnRFbXB0eVdpZHRoQW5kSGVpZ2h0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLndpZHRoIHx8IGRpci5oZWlnaHQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXR0cmlidXRlcyBcXGBoZWlnaHRcXGAgYW5kL29yIFxcYHdpZHRoXFxgIGFyZSBwcmVzZW50IGAgK1xuICAgICAgICBgYWxvbmcgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuIEJlY2F1c2UgXFxgZmlsbFxcYCBtb2RlIGNhdXNlcyBhbiBpbWFnZSB0byBmaWxsIGl0cyBjb250YWluaW5nIGAgK1xuICAgICAgICBgZWxlbWVudCwgdGhlIHNpemUgYXR0cmlidXRlcyBoYXZlIG5vIGVmZmVjdCBhbmQgc2hvdWxkIGJlIHJlbW92ZWQuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgcmVuZGVyZWQgaW1hZ2UgaGFzIGEgbm9uemVybyBoZWlnaHQuIElmIHRoZSBpbWFnZSBpcyBpbiBmaWxsIG1vZGUsIHByb3ZpZGVzXG4gKiBndWlkYW5jZSB0aGF0IHRoaXMgY2FuIGJlIGNhdXNlZCBieSB0aGUgY29udGFpbmluZyBlbGVtZW50J3MgQ1NTIHBvc2l0aW9uIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25aZXJvUmVuZGVyZWRIZWlnaHQoXG4gIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSxcbiAgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LFxuICByZW5kZXJlcjogUmVuZGVyZXIyLFxuKSB7XG4gIGNvbnN0IHJlbW92ZUxvYWRMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCByZW5kZXJlZEhlaWdodCA9IGltZy5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKGRpci5maWxsICYmIHJlbmRlcmVkSGVpZ2h0ID09PSAwKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaGVpZ2h0IG9mIHRoZSBmaWxsLW1vZGUgaW1hZ2UgaXMgemVyby4gYCArXG4gICAgICAgICAgICBgVGhpcyBpcyBsaWtlbHkgYmVjYXVzZSB0aGUgY29udGFpbmluZyBlbGVtZW50IGRvZXMgbm90IGhhdmUgdGhlIENTUyAncG9zaXRpb24nIGAgK1xuICAgICAgICAgICAgYHByb3BlcnR5IHNldCB0byBvbmUgb2YgdGhlIGZvbGxvd2luZzogXCJyZWxhdGl2ZVwiLCBcImZpeGVkXCIsIG9yIFwiYWJzb2x1dGVcIi4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMgcHJvYmxlbSwgbWFrZSBzdXJlIHRoZSBjb250YWluZXIgZWxlbWVudCBoYXMgdGhlIENTUyAncG9zaXRpb24nIGAgK1xuICAgICAgICAgICAgYHByb3BlcnR5IGRlZmluZWQgYW5kIHRoZSBoZWlnaHQgb2YgdGhlIGVsZW1lbnQgaXMgbm90IHplcm8uYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICAvLyBTZWUgY29tbWVudHMgaW4gdGhlIGBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbmAuXG4gIGNvbnN0IHJlbW92ZUVycm9yTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdlcnJvcicsICgpID0+IHtcbiAgICByZW1vdmVMb2FkTGlzdGVuZXJGbigpO1xuICAgIHJlbW92ZUVycm9yTGlzdGVuZXJGbigpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbG9hZGluZ2AgYXR0cmlidXRlIGlzIHNldCB0byBhIHZhbGlkIGlucHV0ICZcbiAqIGlzIG5vdCB1c2VkIG9uIHByaW9yaXR5IGltYWdlcy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIubG9hZGluZyAmJiBkaXIucHJpb3JpdHkpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBgICtcbiAgICAgICAgYFNldHRpbmcgXFxgbG9hZGluZ1xcYCBvbiBwcmlvcml0eSBpbWFnZXMgaXMgbm90IGFsbG93ZWQgYCArXG4gICAgICAgIGBiZWNhdXNlIHRoZXNlIGltYWdlcyB3aWxsIGFsd2F5cyBiZSBlYWdlcmx5IGxvYWRlZC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcmVtb3ZlIHRoZSDigJxsb2FkaW5n4oCdIGF0dHJpYnV0ZSBmcm9tIHRoZSBwcmlvcml0eSBpbWFnZS5gLFxuICAgICk7XG4gIH1cbiAgY29uc3QgdmFsaWRJbnB1dHMgPSBbJ2F1dG8nLCAnZWFnZXInLCAnbGF6eSddO1xuICBpZiAodHlwZW9mIGRpci5sb2FkaW5nID09PSAnc3RyaW5nJyAmJiAhdmFsaWRJbnB1dHMuaW5jbHVkZXMoZGlyLmxvYWRpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICBgaGFzIGFuIGludmFsaWQgdmFsdWUgKFxcYCR7ZGlyLmxvYWRpbmd9XFxgKS4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIHZhbGlkIHZhbHVlIChcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIikuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgTk9UIHVzaW5nIGEgbG9hZGVyIChmYWxsaW5nIGJhY2sgdG8gdGhlIGdlbmVyaWMgbG9hZGVyKSBhbmRcbiAqIHRoZSBpbWFnZSBhcHBlYXJzIHRvIGJlIGhvc3RlZCBvbiBvbmUgb2YgdGhlIGltYWdlIENETnMgZm9yIHdoaWNoXG4gKiB3ZSBkbyBoYXZlIGEgYnVpbHQtaW4gaW1hZ2UgbG9hZGVyLiBTdWdnZXN0cyBzd2l0Y2hpbmcgdG8gdGhlXG4gKiBidWlsdC1pbiBsb2FkZXIuXG4gKlxuICogQHBhcmFtIG5nU3JjIFZhbHVlIG9mIHRoZSBuZ1NyYyBhdHRyaWJ1dGVcbiAqIEBwYXJhbSBpbWFnZUxvYWRlciBJbWFnZUxvYWRlciBwcm92aWRlZFxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RNaXNzaW5nQnVpbHRJbkxvYWRlcihuZ1NyYzogc3RyaW5nLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBsZXQgYnVpbHRJbkxvYWRlck5hbWUgPSAnJztcbiAgICBmb3IgKGNvbnN0IGxvYWRlciBvZiBCVUlMVF9JTl9MT0FERVJTKSB7XG4gICAgICBpZiAobG9hZGVyLnRlc3RVcmwobmdTcmMpKSB7XG4gICAgICAgIGJ1aWx0SW5Mb2FkZXJOYW1lID0gbG9hZGVyLm5hbWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYnVpbHRJbkxvYWRlck5hbWUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19CVUlMVElOX0xPQURFUixcbiAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZTogSXQgbG9va3MgbGlrZSB5b3VyIGltYWdlcyBtYXkgYmUgaG9zdGVkIG9uIHRoZSBgICtcbiAgICAgICAgICAgIGAke2J1aWx0SW5Mb2FkZXJOYW1lfSBDRE4sIGJ1dCB5b3VyIGFwcCBpcyBub3QgdXNpbmcgQW5ndWxhcidzIGAgK1xuICAgICAgICAgICAgYGJ1aWx0LWluIGxvYWRlciBmb3IgdGhhdCBDRE4uIFdlIHJlY29tbWVuZCBzd2l0Y2hpbmcgdG8gdXNlIGAgK1xuICAgICAgICAgICAgYHRoZSBidWlsdC1pbiBieSBjYWxsaW5nIFxcYHByb3ZpZGUke2J1aWx0SW5Mb2FkZXJOYW1lfUxvYWRlcigpXFxgIGAgK1xuICAgICAgICAgICAgYGluIHlvdXIgXFxgcHJvdmlkZXJzXFxgIGFuZCBwYXNzaW5nIGl0IHlvdXIgaW5zdGFuY2UncyBiYXNlIFVSTC4gYCArXG4gICAgICAgICAgICBgSWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBidWlsdC1pbiBsb2FkZXIsIGRlZmluZSBhIGN1c3RvbSBgICtcbiAgICAgICAgICAgIGBsb2FkZXIgZnVuY3Rpb24gdXNpbmcgSU1BR0VfTE9BREVSIHRvIHNpbGVuY2UgdGhpcyB3YXJuaW5nLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIG5nU3Jjc2V0IGlzIHByZXNlbnQgYW5kIG5vIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9OZ1NyY3NldFdpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5uZ1NyY3NldCAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgYXR0cmlidXRlIGlzIHByZXNlbnQgYnV0IGAgK1xuICAgICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICAgIGB3aGljaCB3b3VsZCByZXN1bHQgaW4gdGhlIHNhbWUgaW1hZ2UgYmVpbmcgdXNlZCBmb3IgYWxsIGNvbmZpZ3VyZWQgc2l6ZXMuIGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gLFxuICAgICAgKSxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgbG9hZGVyUGFyYW1zIGlzIHByZXNlbnQgYW5kIG5vIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZ1xuICogdXNlZCkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLmxvYWRlclBhcmFtcyAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICBgbm8gaW1hZ2UgbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLCBgICtcbiAgICAgICAgICBgd2hpY2ggbWVhbnMgdGhhdCB0aGUgbG9hZGVyUGFyYW1zIGRhdGEgd2lsbCBub3QgYmUgY29uc3VtZWQgYW5kIHdpbGwgbm90IGFmZmVjdCB0aGUgVVJMLiBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBjdXN0b20gbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gLFxuICAgICAgKSxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJvdW5kKGlucHV0OiBudW1iZXIpOiBudW1iZXIgfCBzdHJpbmcge1xuICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihpbnB1dCkgPyBpbnB1dCA6IGlucHV0LnRvRml4ZWQoMik7XG59XG5cbi8vIFRyYW5zZm9ybSBmdW5jdGlvbiB0byBoYW5kbGUgU2FmZVZhbHVlIGlucHV0IGZvciBuZ1NyYy4gVGhpcyBkb2Vzbid0IGRvIGFueSBzYW5pdGl6YXRpb24sXG4vLyBhcyB0aGF0IGlzIG5vdCBuZWVkZWQgZm9yIGltZy5zcmMgYW5kIGltZy5zcmNzZXQuIFRoaXMgdHJhbnNmb3JtIGlzIHB1cmVseSBmb3IgY29tcGF0aWJpbGl0eS5cbmZ1bmN0aW9uIHVud3JhcFNhZmVVcmwodmFsdWU6IHN0cmluZyB8IFNhZmVWYWx1ZSk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiB1bndyYXBTYWZlVmFsdWUodmFsdWUpO1xufVxuXG4vLyBUcmFuc2Zvcm0gZnVuY3Rpb24gdG8gaGFuZGxlIGlucHV0cyB3aGljaCBtYXkgYmUgYm9vbGVhbnMsIHN0cmluZ3MsIG9yIHN0cmluZyByZXByZXNlbnRhdGlvbnNcbi8vIG9mIGJvb2xlYW4gdmFsdWVzLiBVc2VkIGZvciB0aGUgcGxhY2Vob2xkZXIgYXR0cmlidXRlLlxuZXhwb3J0IGZ1bmN0aW9uIGJvb2xlYW5PckRhdGFVcmxBdHRyaWJ1dGUodmFsdWU6IGJvb2xlYW4gfCBzdHJpbmcpOiBib29sZWFuIHwgc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUuc3RhcnRzV2l0aChgZGF0YTpgKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gYm9vbGVhbkF0dHJpYnV0ZSh2YWx1ZSk7XG59XG4iXX0=