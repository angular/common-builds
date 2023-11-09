/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, Directive, ElementRef, inject, Injector, Input, NgZone, numberAttribute, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS, ɵperformanceMark as performanceMark, ɵRuntimeError as RuntimeError, ɵunwrapSafeValue as unwrapSafeValue } from '@angular/core';
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
        performanceMark('mark_use_counter', { 'detail': { 'feature': 'NgOptimizedImage' } });
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
        const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map(multiplier => `${this.callImageLoader({
            src: this.ngSrc,
            width: this.width * multiplier
        })} ${multiplier}x`);
        return finalSrcs.join(', ');
    }
    shouldGenerateAutomaticSrcset() {
        let oversizedImage = false;
        if (!this.sizes) {
            oversizedImage =
                this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
        }
        return !this.disableOptimizedSrcset && !this.srcset && this.imageLoader !== noopImageLoader &&
            !oversizedImage;
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.1+sha-f61519a", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.0.1+sha-f61519a", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0px\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.1+sha-f61519a", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
// Transform function to handle SafeValue input for ngSrc. This doesn't do any sanitization,
// as that is not needed for img.src and img.srcset. This transform is purely for compatibility.
function unwrapSafeUrl(value) {
    if (typeof value === 'string') {
        return value;
    }
    return unwrapSafeValue(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBZ0MsV0FBVyxFQUFFLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBK0IsZ0JBQWdCLElBQUksZUFBZSxFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQTJCLGdCQUFnQixJQUFJLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd2ZCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUN2RSxPQUFPLEVBQUMsWUFBWSxFQUFrQyxlQUFlLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMzRyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7O0FBRTFEOzs7Ozs7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QUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCw0RkFBNEY7QUFDNUYsZ0dBQWdHO0FBQ2hHLFNBQVMsYUFBYSxDQUFDLEtBQXVCO0lBQzVDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzdCLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Ym9vbGVhbkF0dHJpYnV0ZSwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBpbmplY3QsIEluamVjdG9yLCBJbnB1dCwgTmdab25lLCBudW1iZXJBdHRyaWJ1dGUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFBMQVRGT1JNX0lELCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXMsIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVJTUFHRV9DT05GSUcgYXMgSU1BR0VfQ09ORklHLCDJtUlNQUdFX0NPTkZJR19ERUZBVUxUUyBhcyBJTUFHRV9DT05GSUdfREVGQVVMVFMsIMm1SW1hZ2VDb25maWcgYXMgSW1hZ2VDb25maWcsIMm1cGVyZm9ybWFuY2VNYXJrIGFzIHBlcmZvcm1hbmNlTWFyaywgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLCDJtVNhZmVWYWx1ZSBhcyBTYWZlVmFsdWUsIMm1dW53cmFwU2FmZVZhbHVlIGFzIHVud3JhcFNhZmVWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnLi4vLi4vcGxhdGZvcm1faWQnO1xuXG5pbXBvcnQge2ltZ0RpcmVjdGl2ZURldGFpbHN9IGZyb20gJy4vZXJyb3JfaGVscGVyJztcbmltcG9ydCB7Y2xvdWRpbmFyeUxvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9jbG91ZGluYXJ5X2xvYWRlcic7XG5pbXBvcnQge0lNQUdFX0xPQURFUiwgSW1hZ2VMb2FkZXIsIEltYWdlTG9hZGVyQ29uZmlnLCBub29wSW1hZ2VMb2FkZXJ9IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZV9sb2FkZXInO1xuaW1wb3J0IHtpbWFnZUtpdExvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZWtpdF9sb2FkZXInO1xuaW1wb3J0IHtpbWdpeExvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWdpeF9sb2FkZXInO1xuaW1wb3J0IHtMQ1BJbWFnZU9ic2VydmVyfSBmcm9tICcuL2xjcF9pbWFnZV9vYnNlcnZlcic7XG5pbXBvcnQge1ByZWNvbm5lY3RMaW5rQ2hlY2tlcn0gZnJvbSAnLi9wcmVjb25uZWN0X2xpbmtfY2hlY2tlcic7XG5pbXBvcnQge1ByZWxvYWRMaW5rQ3JlYXRvcn0gZnJvbSAnLi9wcmVsb2FkLWxpbmstY3JlYXRvcic7XG5cbi8qKlxuICogV2hlbiBhIEJhc2U2NC1lbmNvZGVkIGltYWdlIGlzIHBhc3NlZCBhcyBhbiBpbnB1dCB0byB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSxcbiAqIGFuIGVycm9yIGlzIHRocm93bi4gVGhlIGltYWdlIGNvbnRlbnQgKGFzIGEgc3RyaW5nKSBtaWdodCBiZSB2ZXJ5IGxvbmcsIHRodXMgbWFraW5nXG4gKiBpdCBoYXJkIHRvIHJlYWQgYW4gZXJyb3IgbWVzc2FnZSBpZiB0aGUgZW50aXJlIHN0cmluZyBpcyBpbmNsdWRlZC4gVGhpcyBjb25zdCBkZWZpbmVzXG4gKiB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW50byB0aGUgZXJyb3IgbWVzc2FnZS4gVGhlIHJlc3RcbiAqIG9mIHRoZSBjb250ZW50IGlzIHRydW5jYXRlZC5cbiAqL1xuY29uc3QgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SID0gNTA7XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyB3aWR0aCBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxMDB3LCAyMDB3XCIuXG4gKi9cbmNvbnN0IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrd1xccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxeCwgMngsIDUweFwiLiBBbHNvIHN1cHBvcnRzIGRlY2ltYWxzIGxpa2UgXCIxLjV4LCAxLjUweFwiLlxuICovXG5jb25zdCBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrKFxcLlxcZCspP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgaW4gZ2VuZXJhdGluZyBhdXRvbWF0aWMgZGVuc2l0eS1iYXNlZCBzcmNzZXRzXG4gKi9cbmNvbnN0IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTID0gWzEsIDJdO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGJyZWFrcG9pbnRzIHRvIHVzZSBvbiBmdWxsLXdpZHRoIGltYWdlc1xuICovXG5jb25zdCBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRiA9IDY0MDtcbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYXNwZWN0IHJhdGlvcyBhcmUgc2ltaWxhciBpbiB2YWx1ZS5cbiAqL1xuY29uc3QgQVNQRUNUX1JBVElPX1RPTEVSQU5DRSA9IC4xO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGltYWdlIGhhcyBiZWVuIHJlcXVlc3RlZCBhdCBhbiBvdmVybHlcbiAqIGxhcmdlIHNpemUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCByZW5kZXJlZCBpbWFnZSBzaXplIChhZnRlciB0YWtpbmdcbiAqIGludG8gYWNjb3VudCBhIHR5cGljYWwgZGV2aWNlIHBpeGVsIHJhdGlvKS4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTAwMDtcblxuLyoqXG4gKiBVc2VkIHRvIGxpbWl0IGF1dG9tYXRpYyBzcmNzZXQgZ2VuZXJhdGlvbiBvZiB2ZXJ5IGxhcmdlIHNvdXJjZXMgZm9yXG4gKiBmaXhlZC1zaXplIGltYWdlcy4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgPSAxOTIwO1xuY29uc3QgRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVCA9IDEwODA7XG5cblxuLyoqIEluZm8gYWJvdXQgYnVpbHQtaW4gbG9hZGVycyB3ZSBjYW4gdGVzdCBmb3IuICovXG5leHBvcnQgY29uc3QgQlVJTFRfSU5fTE9BREVSUyA9IFtpbWdpeExvYWRlckluZm8sIGltYWdlS2l0TG9hZGVySW5mbywgY2xvdWRpbmFyeUxvYWRlckluZm9dO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGltcHJvdmVzIGltYWdlIGxvYWRpbmcgcGVyZm9ybWFuY2UgYnkgZW5mb3JjaW5nIGJlc3QgcHJhY3RpY2VzLlxuICpcbiAqIGBOZ09wdGltaXplZEltYWdlYCBlbnN1cmVzIHRoYXQgdGhlIGxvYWRpbmcgb2YgdGhlIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBpbWFnZSBpc1xuICogcHJpb3JpdGl6ZWQgYnk6XG4gKiAtIEF1dG9tYXRpY2FsbHkgc2V0dGluZyB0aGUgYGZldGNocHJpb3JpdHlgIGF0dHJpYnV0ZSBvbiB0aGUgYDxpbWc+YCB0YWdcbiAqIC0gTGF6eSBsb2FkaW5nIG5vbi1wcmlvcml0eSBpbWFnZXMgYnkgZGVmYXVsdFxuICogLSBBdXRvbWF0aWNhbGx5IGdlbmVyYXRpbmcgYSBwcmVjb25uZWN0IGxpbmsgdGFnIGluIHRoZSBkb2N1bWVudCBoZWFkXG4gKlxuICogSW4gYWRkaXRpb24sIHRoZSBkaXJlY3RpdmU6XG4gKiAtIEdlbmVyYXRlcyBhcHByb3ByaWF0ZSBhc3NldCBVUkxzIGlmIGEgY29ycmVzcG9uZGluZyBgSW1hZ2VMb2FkZXJgIGZ1bmN0aW9uIGlzIHByb3ZpZGVkXG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVzIGEgc3Jjc2V0XG4gKiAtIFJlcXVpcmVzIHRoYXQgYHdpZHRoYCBhbmQgYGhlaWdodGAgYXJlIHNldFxuICogLSBXYXJucyBpZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGhhdmUgYmVlbiBzZXQgaW5jb3JyZWN0bHlcbiAqIC0gV2FybnMgaWYgdGhlIGltYWdlIHdpbGwgYmUgdmlzdWFsbHkgZGlzdG9ydGVkIHdoZW4gcmVuZGVyZWRcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgaXMgbWFya2VkIGFzIFtzdGFuZGFsb25lXShndWlkZS9zdGFuZGFsb25lLWNvbXBvbmVudHMpIGFuZCBjYW5cbiAqIGJlIGltcG9ydGVkIGRpcmVjdGx5LlxuICpcbiAqIEZvbGxvdyB0aGUgc3RlcHMgYmVsb3cgdG8gZW5hYmxlIGFuZCB1c2UgdGhlIGRpcmVjdGl2ZTpcbiAqIDEuIEltcG9ydCBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGUgb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudC5cbiAqIDIuIE9wdGlvbmFsbHkgcHJvdmlkZSBhbiBgSW1hZ2VMb2FkZXJgIGlmIHlvdSB1c2UgYW4gaW1hZ2UgaG9zdGluZyBzZXJ2aWNlLlxuICogMy4gVXBkYXRlIHRoZSBuZWNlc3NhcnkgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyBhbmQgcmVwbGFjZSBgc3JjYCBhdHRyaWJ1dGVzIHdpdGggYG5nU3JjYC5cbiAqIFVzaW5nIGEgYG5nU3JjYCBhbGxvd3MgdGhlIGRpcmVjdGl2ZSB0byBjb250cm9sIHdoZW4gdGhlIGBzcmNgIGdldHMgc2V0LCB3aGljaCB0cmlnZ2VycyBhbiBpbWFnZVxuICogZG93bmxvYWQuXG4gKlxuICogU3RlcCAxOiBpbXBvcnQgdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgTmdPcHRpbWl6ZWRJbWFnZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gSW5jbHVkZSBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGVcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBBcHBNb2R1bGUge31cbiAqXG4gKiAvLyAuLi4gb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudFxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWVcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIE15U3RhbmRhbG9uZUNvbXBvbmVudCB7fVxuICogYGBgXG4gKlxuICogU3RlcCAyOiBjb25maWd1cmUgYSBsb2FkZXIuXG4gKlxuICogVG8gdXNlIHRoZSAqKmRlZmF1bHQgbG9hZGVyKio6IG5vIGFkZGl0aW9uYWwgY29kZSBjaGFuZ2VzIGFyZSBuZWNlc3NhcnkuIFRoZSBVUkwgcmV0dXJuZWQgYnkgdGhlXG4gKiBnZW5lcmljIGxvYWRlciB3aWxsIGFsd2F5cyBtYXRjaCB0aGUgdmFsdWUgb2YgXCJzcmNcIi4gSW4gb3RoZXIgd29yZHMsIHRoaXMgbG9hZGVyIGFwcGxpZXMgbm9cbiAqIHRyYW5zZm9ybWF0aW9ucyB0byB0aGUgcmVzb3VyY2UgVVJMIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGBuZ1NyY2AgYXR0cmlidXRlIHdpbGwgYmUgdXNlZCBhcyBpcy5cbiAqXG4gKiBUbyB1c2UgYW4gZXhpc3RpbmcgbG9hZGVyIGZvciBhICoqdGhpcmQtcGFydHkgaW1hZ2Ugc2VydmljZSoqOiBhZGQgdGhlIHByb3ZpZGVyIGZhY3RvcnkgZm9yIHlvdXJcbiAqIGNob3NlbiBzZXJ2aWNlIHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheS4gSW4gdGhlIGV4YW1wbGUgYmVsb3csIHRoZSBJbWdpeCBsb2FkZXIgaXMgdXNlZDpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3Byb3ZpZGVJbWdpeExvYWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDYWxsIHRoZSBmdW5jdGlvbiBhbmQgYWRkIHRoZSByZXN1bHQgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5OlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHByb3ZpZGVJbWdpeExvYWRlcihcImh0dHBzOi8vbXkuYmFzZS51cmwvXCIpLFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIHByb3ZpZGVzIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICogLSBgcHJvdmlkZUNsb3VkZmxhcmVMb2FkZXJgXG4gKiAtIGBwcm92aWRlQ2xvdWRpbmFyeUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWFnZUtpdExvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWdpeExvYWRlcmBcbiAqXG4gKiBJZiB5b3UgdXNlIGEgZGlmZmVyZW50IGltYWdlIHByb3ZpZGVyLCB5b3UgY2FuIGNyZWF0ZSBhIGN1c3RvbSBsb2FkZXIgZnVuY3Rpb24gYXMgZGVzY3JpYmVkXG4gKiBiZWxvdy5cbiAqXG4gKiBUbyB1c2UgYSAqKmN1c3RvbSBsb2FkZXIqKjogcHJvdmlkZSB5b3VyIGxvYWRlciBmdW5jdGlvbiBhcyBhIHZhbHVlIGZvciB0aGUgYElNQUdFX0xPQURFUmAgRElcbiAqIHRva2VuLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDb25maWd1cmUgdGhlIGxvYWRlciB1c2luZyB0aGUgYElNQUdFX0xPQURFUmAgdG9rZW4uXG4gKiBwcm92aWRlcnM6IFtcbiAqICAge1xuICogICAgICBwcm92aWRlOiBJTUFHRV9MT0FERVIsXG4gKiAgICAgIHVzZVZhbHVlOiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICogICAgICAgIHJldHVybiBgaHR0cHM6Ly9leGFtcGxlLmNvbS8ke2NvbmZpZy5zcmN9LSR7Y29uZmlnLndpZHRofS5qcGd9YDtcbiAqICAgICAgfVxuICogICB9LFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFN0ZXAgMzogdXBkYXRlIGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgdG8gdXNlIGBuZ1NyY2AgaW5zdGVhZCBvZiBgc3JjYC5cbiAqXG4gKiBgYGBcbiAqIDxpbWcgbmdTcmM9XCJsb2dvLnBuZ1wiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMTAwXCI+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzZWxlY3RvcjogJ2ltZ1tuZ1NyY10nLFxuICBob3N0OiB7XG4gICAgJ1tzdHlsZS5wb3NpdGlvbl0nOiAnZmlsbCA/IFwiYWJzb2x1dGVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUud2lkdGhdJzogJ2ZpbGwgPyBcIjEwMCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuaGVpZ2h0XSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmluc2V0XSc6ICdmaWxsID8gXCIwcHhcIiA6IG51bGwnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGltYWdlTG9hZGVyID0gaW5qZWN0KElNQUdFX0xPQURFUik7XG4gIHByaXZhdGUgY29uZmlnOiBJbWFnZUNvbmZpZyA9IHByb2Nlc3NDb25maWcoaW5qZWN0KElNQUdFX0NPTkZJRykpO1xuICBwcml2YXRlIHJlbmRlcmVyID0gaW5qZWN0KFJlbmRlcmVyMik7XG4gIHByaXZhdGUgaW1nRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuICBwcml2YXRlIGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0KFBMQVRGT1JNX0lEKSk7XG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlbG9hZExpbmtDcmVhdG9yID0gaW5qZWN0KFByZWxvYWRMaW5rQ3JlYXRvcik7XG5cbiAgLy8gYSBMQ1AgaW1hZ2Ugb2JzZXJ2ZXIgLSBzaG91bGQgYmUgaW5qZWN0ZWQgb25seSBpbiB0aGUgZGV2IG1vZGVcbiAgcHJpdmF0ZSBsY3BPYnNlcnZlciA9IG5nRGV2TW9kZSA/IHRoaXMuaW5qZWN0b3IuZ2V0KExDUEltYWdlT2JzZXJ2ZXIpIDogbnVsbDtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSByZXdyaXR0ZW4gYHNyY2Agb25jZSBhbmQgc3RvcmUgaXQuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIHJlcGV0aXRpdmUgY2FsY3VsYXRpb25zIGFuZCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBjbGVhbnVwIGluIHRoZVxuICAgKiBgbmdPbkRlc3Ryb3lgIGRvZXMgbm90IHJlbHkgb24gdGhlIGBJTUFHRV9MT0FERVJgIGxvZ2ljICh3aGljaCBpbiB0dXJuIGNhbiByZWx5IG9uIHNvbWUgb3RoZXJcbiAgICogaW5zdGFuY2UgdGhhdCBtaWdodCBiZSBhbHJlYWR5IGRlc3Ryb3llZCkuXG4gICAqL1xuICBwcml2YXRlIF9yZW5kZXJlZFNyYzogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCh7cmVxdWlyZWQ6IHRydWUsIHRyYW5zZm9ybTogdW53cmFwU2FmZVVybH0pIG5nU3JjITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gICAqIFRoZSBpbWFnZSBuYW1lIHdpbGwgYmUgdGFrZW4gZnJvbSBgbmdTcmNgIGFuZCBjb21iaW5lZCB3aXRoIHRoZSBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHlcbiAgICogZGVzY3JpcHRvcnMgdG8gZ2VuZXJhdGUgdGhlIGZpbmFsIGBzcmNzZXRgIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogYGBgXG4gICAqIDxpbWcgbmdTcmM9XCJoZWxsby5qcGdcIiBuZ1NyY3NldD1cIjEwMHcsIDIwMHdcIiAvPiAgPT5cbiAgICogPGltZyBzcmM9XCJwYXRoL2hlbGxvLmpwZ1wiIHNyY3NldD1cInBhdGgvaGVsbG8uanBnP3c9MTAwIDEwMHcsIHBhdGgvaGVsbG8uanBnP3c9MjAwIDIwMHdcIiAvPlxuICAgKiBgYGBcbiAgICovXG4gIEBJbnB1dCgpIG5nU3Jjc2V0ITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBgc2l6ZXNgIGF0dHJpYnV0ZSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBQcm92aWRpbmcgc2l6ZXMgY2F1c2VzIHRoZSBpbWFnZSB0byBjcmVhdGUgYW4gYXV0b21hdGljIHJlc3BvbnNpdmUgc3Jjc2V0LlxuICAgKi9cbiAgQElucHV0KCkgc2l6ZXM/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKiBGb3IgZml4ZWQgc2l6ZSBpbWFnZXM6IHRoZSBkZXNpcmVkIHJlbmRlcmVkIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSkgd2lkdGg6IG51bWJlcnx1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy4qIFRoZSBpbnRyaW5zaWNcbiAgICogaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSkgaGVpZ2h0OiBudW1iZXJ8dW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVzaXJlZCBsb2FkaW5nIGJlaGF2aW9yIChsYXp5LCBlYWdlciwgb3IgYXV0bykuIERlZmF1bHRzIHRvIGBsYXp5YCxcbiAgICogd2hpY2ggaXMgcmVjb21tZW5kZWQgZm9yIG1vc3QgaW1hZ2VzLlxuICAgKlxuICAgKiBXYXJuaW5nOiBTZXR0aW5nIGltYWdlcyBhcyBsb2FkaW5nPVwiZWFnZXJcIiBvciBsb2FkaW5nPVwiYXV0b1wiIG1hcmtzIHRoZW1cbiAgICogYXMgbm9uLXByaW9yaXR5IGltYWdlcyBhbmQgY2FuIGh1cnQgbG9hZGluZyBwZXJmb3JtYW5jZS4gRm9yIGltYWdlcyB3aGljaFxuICAgKiBtYXkgYmUgdGhlIExDUCBlbGVtZW50LCB1c2UgdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGluc3RlYWQgb2YgYGxvYWRpbmdgLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGluZz86ICdsYXp5J3wnZWFnZXInfCdhdXRvJztcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbWFnZSBzaG91bGQgaGF2ZSBhIGhpZ2ggcHJpb3JpdHkuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIHByaW9yaXR5ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIERhdGEgdG8gcGFzcyB0aHJvdWdoIHRvIGN1c3RvbSBsb2FkZXJzLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGVyUGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzcmNzZXQgZ2VuZXJhdGlvbiBmb3IgdGhpcyBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZU9wdGltaXplZFNyY3NldCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbWFnZSB0byBcImZpbGwgbW9kZVwiLCB3aGljaCBlbGltaW5hdGVzIHRoZSBoZWlnaHQvd2lkdGggcmVxdWlyZW1lbnQgYW5kIGFkZHNcbiAgICogc3R5bGVzIHN1Y2ggdGhhdCB0aGUgaW1hZ2UgZmlsbHMgaXRzIGNvbnRhaW5pbmcgZWxlbWVudC5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZmlsbCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY2AgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3JjYCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3Jjc2V0YCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgcGVyZm9ybWFuY2VNYXJrKCdtYXJrX3VzZV9jb3VudGVyJywgeydkZXRhaWwnOiB7J2ZlYXR1cmUnOiAnTmdPcHRpbWl6ZWRJbWFnZSd9fSk7XG5cbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgYXNzZXJ0Tm9uRW1wdHlJbnB1dCh0aGlzLCAnbmdTcmMnLCB0aGlzLm5nU3JjKTtcbiAgICAgIGFzc2VydFZhbGlkTmdTcmNzZXQodGhpcywgdGhpcy5uZ1NyY3NldCk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKHRoaXMpO1xuICAgICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldCh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydE5vdEJhc2U2NEltYWdlKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmxvYlVybCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLmZpbGwpIHtcbiAgICAgICAgYXNzZXJ0RW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgLy8gVGhpcyBsZWF2ZXMgdGhlIEFuZ3VsYXIgem9uZSB0byBhdm9pZCB0cmlnZ2VyaW5nIHVubmVjZXNzYXJ5IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzIHdoZW5cbiAgICAgICAgLy8gYGxvYWRgIHRhc2tzIGFyZSBpbnZva2VkIG9uIGltYWdlcy5cbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKFxuICAgICAgICAgICAgKCkgPT4gYXNzZXJ0Tm9uWmVyb1JlbmRlcmVkSGVpZ2h0KHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlcikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdGhpcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy53aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHRoaXMud2lkdGgsICd3aWR0aCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgY2hlY2sgZm9yIGRpc3RvcnRlZCBpbWFnZXMgd2hlbiBub3QgaW4gZmlsbCBtb2RlLCB3aGVyZVxuICAgICAgICAvLyBpbWFnZXMgbWF5IGJlIGludGVudGlvbmFsbHkgc3RyZXRjaGVkLCBjcm9wcGVkIG9yIGxldHRlcmJveGVkLlxuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoXG4gICAgICAgICAgICAoKSA9PiBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbih0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KHRoaXMpO1xuICAgICAgaWYgKCF0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29tcGxleFNpemVzKHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIodGhpcy5uZ1NyYywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcblxuICAgICAgaWYgKHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyIS5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMubmdTcmMsIHRoaXMucHJpb3JpdHkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuYXNzZXJ0UHJlY29ubmVjdCh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlcygpIHtcbiAgICAvLyBNdXN0IHNldCB3aWR0aC9oZWlnaHQgZXhwbGljaXRseSBpbiBjYXNlIHRoZXkgYXJlIGJvdW5kIChpbiB3aGljaCBjYXNlIHRoZXkgd2lsbFxuICAgIC8vIG9ubHkgYmUgcmVmbGVjdGVkIGFuZCBub3QgZm91bmQgYnkgdGhlIGJyb3dzZXIpXG4gICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgaWYgKCF0aGlzLnNpemVzKSB7XG4gICAgICAgIHRoaXMuc2l6ZXMgPSAnMTAwdncnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCEudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0IS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG5cbiAgICAvLyBUaGUgYGRhdGEtbmctaW1nYCBhdHRyaWJ1dGUgZmxhZ3MgYW4gaW1hZ2UgYXMgdXNpbmcgdGhlIGRpcmVjdGl2ZSwgdG8gYWxsb3dcbiAgICAvLyBmb3IgYW5hbHlzaXMgb2YgdGhlIGRpcmVjdGl2ZSdzIHBlcmZvcm1hbmNlLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbmctaW1nJywgJ3RydWUnKTtcblxuICAgIC8vIFRoZSBgc3JjYCBhbmQgYHNyY3NldGAgYXR0cmlidXRlcyBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIGNvbnN0IHJld3JpdHRlblNyY3NldCA9IHRoaXMudXBkYXRlU3JjQW5kU3Jjc2V0KCk7XG5cbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzaXplcycsIHRoaXMuc2l6ZXMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1NlcnZlciAmJiB0aGlzLnByaW9yaXR5KSB7XG4gICAgICB0aGlzLnByZWxvYWRMaW5rQ3JlYXRvci5jcmVhdGVQcmVsb2FkTGlua1RhZyhcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLCB0aGlzLmdldFJld3JpdHRlblNyYygpLCByZXdyaXR0ZW5TcmNzZXQsIHRoaXMuc2l6ZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZSh0aGlzLCBjaGFuZ2VzLCBbXG4gICAgICAgICduZ1NyY3NldCcsXG4gICAgICAgICd3aWR0aCcsXG4gICAgICAgICdoZWlnaHQnLFxuICAgICAgICAncHJpb3JpdHknLFxuICAgICAgICAnZmlsbCcsXG4gICAgICAgICdsb2FkaW5nJyxcbiAgICAgICAgJ3NpemVzJyxcbiAgICAgICAgJ2xvYWRlclBhcmFtcycsXG4gICAgICAgICdkaXNhYmxlT3B0aW1pemVkU3Jjc2V0JyxcbiAgICAgIF0pO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlc1snbmdTcmMnXSAmJiAhY2hhbmdlc1snbmdTcmMnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGNvbnN0IG9sZFNyYyA9IHRoaXMuX3JlbmRlcmVkU3JjO1xuICAgICAgdGhpcy51cGRhdGVTcmNBbmRTcmNzZXQodHJ1ZSk7XG4gICAgICBjb25zdCBuZXdTcmMgPSB0aGlzLl9yZW5kZXJlZFNyYztcbiAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsICYmIG9sZFNyYyAmJiBuZXdTcmMgJiYgb2xkU3JjICE9PSBuZXdTcmMpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyPy51cGRhdGVJbWFnZShvbGRTcmMsIG5ld1NyYyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2FsbEltYWdlTG9hZGVyKGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM6IE9taXQ8SW1hZ2VMb2FkZXJDb25maWcsICdsb2FkZXJQYXJhbXMnPik6XG4gICAgICBzdHJpbmcge1xuICAgIGxldCBhdWdtZW50ZWRDb25maWc6IEltYWdlTG9hZGVyQ29uZmlnID0gY29uZmlnV2l0aG91dEN1c3RvbVBhcmFtcztcbiAgICBpZiAodGhpcy5sb2FkZXJQYXJhbXMpIHtcbiAgICAgIGF1Z21lbnRlZENvbmZpZy5sb2FkZXJQYXJhbXMgPSB0aGlzLmxvYWRlclBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMb2FkZXIoYXVnbWVudGVkQ29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMubG9hZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgaWYgKCF0aGlzLl9yZW5kZXJlZFNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5uZ1NyY307XG4gICAgICAvLyBDYWNoZSBjYWxjdWxhdGVkIGltYWdlIHNyYyB0byByZXVzZSBpdCBsYXRlciBpbiB0aGUgY29kZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gdGhpcy5jYWxsSW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVkU3JjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB3aWR0aFNyY1NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodGhpcy5uZ1NyY3NldCk7XG4gICAgY29uc3QgZmluYWxTcmNzID0gdGhpcy5uZ1NyY3NldC5zcGxpdCgnLCcpLmZpbHRlcihzcmMgPT4gc3JjICE9PSAnJykubWFwKHNyY1N0ciA9PiB7XG4gICAgICBzcmNTdHIgPSBzcmNTdHIudHJpbSgpO1xuICAgICAgY29uc3Qgd2lkdGggPSB3aWR0aFNyY1NldCA/IHBhcnNlRmxvYXQoc3JjU3RyKSA6IHBhcnNlRmxvYXQoc3JjU3RyKSAqIHRoaXMud2lkdGghO1xuICAgICAgcmV0dXJuIGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRofSl9ICR7c3JjU3RyfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBdXRvbWF0aWNTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzcG9uc2l2ZVNyY3NldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaXhlZFNyY3NldCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVzcG9uc2l2ZVNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHticmVha3BvaW50c30gPSB0aGlzLmNvbmZpZztcblxuICAgIGxldCBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhO1xuICAgIGlmICh0aGlzLnNpemVzPy50cmltKCkgPT09ICcxMDB2dycpIHtcbiAgICAgIC8vIFNpbmNlIHRoaXMgaXMgYSBmdWxsLXNjcmVlbi13aWR0aCBpbWFnZSwgb3VyIHNyY3NldCBvbmx5IG5lZWRzIHRvIGluY2x1ZGVcbiAgICAgIC8vIGJyZWFrcG9pbnRzIHdpdGggZnVsbCB2aWV3cG9ydCB3aWR0aHMuXG4gICAgICBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhLmZpbHRlcihicCA9PiBicCA+PSBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRik7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxTcmNzID0gZmlsdGVyZWRCcmVha3BvaW50cy5tYXAoXG4gICAgICAgIGJwID0+IGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRoOiBicH0pfSAke2JwfXdgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVNyY0FuZFNyY3NldChmb3JjZVNyY1JlY2FsYyA9IGZhbHNlKTogc3RyaW5nfHVuZGVmaW5lZCB7XG4gICAgaWYgKGZvcmNlU3JjUmVjYWxjKSB7XG4gICAgICAvLyBSZXNldCBjYWNoZWQgdmFsdWUsIHNvIHRoYXQgdGhlIGZvbGxvd3VwIGBnZXRSZXdyaXR0ZW5TcmMoKWAgY2FsbFxuICAgICAgLy8gd2lsbCByZWNhbGN1bGF0ZSBpdCBhbmQgdXBkYXRlIHRoZSBjYWNoZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmMgPSB0aGlzLmdldFJld3JpdHRlblNyYygpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgcmV3cml0dGVuU3JjKTtcblxuICAgIGxldCByZXdyaXR0ZW5TcmNzZXQ6IHN0cmluZ3x1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0UmV3cml0dGVuU3Jjc2V0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCkpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0QXV0b21hdGljU3Jjc2V0KCk7XG4gICAgfVxuXG4gICAgaWYgKHJld3JpdHRlblNyY3NldCkge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmNzZXQnLCByZXdyaXR0ZW5TcmNzZXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmV3cml0dGVuU3Jjc2V0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGaXhlZFNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTLm1hcChtdWx0aXBsaWVyID0+IGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IHRoaXMubmdTcmMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGghICogbXVsdGlwbGllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX0gJHttdWx0aXBsaWVyfXhgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCk6IGJvb2xlYW4ge1xuICAgIGxldCBvdmVyc2l6ZWRJbWFnZSA9IGZhbHNlO1xuICAgIGlmICghdGhpcy5zaXplcykge1xuICAgICAgb3ZlcnNpemVkSW1hZ2UgPVxuICAgICAgICAgIHRoaXMud2lkdGghID4gRklYRURfU1JDU0VUX1dJRFRIX0xJTUlUIHx8IHRoaXMuaGVpZ2h0ISA+IEZJWEVEX1NSQ1NFVF9IRUlHSFRfTElNSVQ7XG4gICAgfVxuICAgIHJldHVybiAhdGhpcy5kaXNhYmxlT3B0aW1pemVkU3Jjc2V0ICYmICF0aGlzLnNyY3NldCAmJiB0aGlzLmltYWdlTG9hZGVyICE9PSBub29wSW1hZ2VMb2FkZXIgJiZcbiAgICAgICAgIW92ZXJzaXplZEltYWdlO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5fcmVuZGVyZWRTcmMgIT09IG51bGwgJiYgdGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxjcE9ic2VydmVyLnVucmVnaXN0ZXJJbWFnZSh0aGlzLl9yZW5kZXJlZFNyYyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuaW1nRWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5cbi8qKioqKiBIZWxwZXJzICoqKioqL1xuXG4vKipcbiAqIFNvcnRzIHByb3ZpZGVkIGNvbmZpZyBicmVha3BvaW50cyBhbmQgdXNlcyBkZWZhdWx0cy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0NvbmZpZyhjb25maWc6IEltYWdlQ29uZmlnKTogSW1hZ2VDb25maWcge1xuICBsZXQgc29ydGVkQnJlYWtwb2ludHM6IHticmVha3BvaW50cz86IG51bWJlcltdfSA9IHt9O1xuICBpZiAoY29uZmlnLmJyZWFrcG9pbnRzKSB7XG4gICAgc29ydGVkQnJlYWtwb2ludHMuYnJlYWtwb2ludHMgPSBjb25maWcuYnJlYWtwb2ludHMuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICB9XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBJTUFHRV9DT05GSUdfREVGQVVMVFMsIGNvbmZpZywgc29ydGVkQnJlYWtwb2ludHMpO1xufVxuXG4vKioqKiogQXNzZXJ0IGZ1bmN0aW9ucyAqKioqKi9cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmMpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gYm90aCBcXGBzcmNcXGAgYW5kIFxcYG5nU3JjXFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3JjXFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgXFxgbmdTcmNcXGAuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3Jjc2V0YCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3Jjc2V0XFxgIGFuZCBcXGBuZ1NyY3NldFxcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBzZXRzIFxcYHNyY3NldFxcYCBpdHNlbGYgYmFzZWQgb24gdGhlIHZhbHVlIG9mIGAgK1xuICAgICAgICAgICAgYFxcYG5nU3Jjc2V0XFxgLiBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3Jjc2V0XFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY2AgaXMgbm90IGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdEJhc2U2NEltYWdlKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgbmdTcmMgPSBkaXIubmdTcmMudHJpbSgpO1xuICBpZiAobmdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSkge1xuICAgIGlmIChuZ1NyYy5sZW5ndGggPiBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpIHtcbiAgICAgIG5nU3JjID0gbmdTcmMuc3Vic3RyaW5nKDAsIEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikgKyAnLi4uJztcbiAgICB9XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYywgZmFsc2UpfSBcXGBuZ1NyY1xcYCBpcyBhIEJhc2U2NC1lbmNvZGVkIHN0cmluZyBgICtcbiAgICAgICAgICAgIGAoJHtuZ1NyY30pLiBOZ09wdGltaXplZEltYWdlIGRvZXMgbm90IHN1cHBvcnQgQmFzZTY0LWVuY29kZWQgc3RyaW5ncy4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgbmdTcmNcXGAgYW5kIHVzaW5nIGEgc3RhbmRhcmQgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgJ3NpemVzJyBvbmx5IGluY2x1ZGVzIHJlc3BvbnNpdmUgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbXBsZXhTaXplcyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHNpemVzID0gZGlyLnNpemVzO1xuICBpZiAoc2l6ZXM/Lm1hdGNoKC8oKFxcKXwsKVxcc3xeKVxcZCtweC8pKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYywgZmFsc2UpfSBcXGBzaXplc1xcYCB3YXMgc2V0IHRvIGEgc3RyaW5nIGluY2x1ZGluZyBgICtcbiAgICAgICAgICAgIGBwaXhlbCB2YWx1ZXMuIEZvciBhdXRvbWF0aWMgXFxgc3Jjc2V0XFxgIGdlbmVyYXRpb24sIFxcYHNpemVzXFxgIG11c3Qgb25seSBpbmNsdWRlIHJlc3BvbnNpdmUgYCArXG4gICAgICAgICAgICBgdmFsdWVzLCBzdWNoIGFzIFxcYHNpemVzPVwiNTB2d1wiXFxgIG9yIFxcYHNpemVzPVwiKG1pbi13aWR0aDogNzY4cHgpIDUwdncsIDEwMHZ3XCJcXGAuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBtb2RpZnkgdGhlIFxcYHNpemVzXFxgIGF0dHJpYnV0ZSwgb3IgcHJvdmlkZSB5b3VyIG93biBcXGBuZ1NyY3NldFxcYCB2YWx1ZSBkaXJlY3RseS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY2AgaXMgbm90IGEgQmxvYiBVUkwuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVcmwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IG5nU3JjID0gZGlyLm5nU3JjLnRyaW0oKTtcbiAgaWYgKG5nU3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNcXGAgd2FzIHNldCB0byBhIGJsb2IgVVJMICgke25nU3JjfSkuIGAgK1xuICAgICAgICAgICAgYEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgaW5wdXQgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuICBjb25zdCBpc0VtcHR5U3RyaW5nID0gaXNTdHJpbmcgJiYgdmFsdWUudHJpbSgpID09PSAnJztcbiAgaWYgKCFpc1N0cmluZyB8fCBpc0VtcHR5U3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7bmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgICAgICBgKFxcYCR7dmFsdWV9XFxgKS4gVG8gZml4IHRoaXMsIGNoYW5nZSB0aGUgdmFsdWUgdG8gYSBub24tZW1wdHkgc3RyaW5nLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3Jjc2V0YCBpcyBpbiBhIHZhbGlkIGZvcm1hdCwgZS5nLiBcIjEwMHcsIDIwMHdcIiBvciBcIjF4LCAyeFwiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWROZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyLCAnbmdTcmNzZXQnLCB2YWx1ZSk7XG4gIGNvbnN0IHN0cmluZ1ZhbCA9IHZhbHVlIGFzIHN0cmluZztcbiAgY29uc3QgaXNWYWxpZFdpZHRoRGVzY3JpcHRvciA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcbiAgY29uc3QgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yID0gVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG5cbiAgaWYgKGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcikge1xuICAgIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXIsIHN0cmluZ1ZhbCk7XG4gIH1cblxuICBjb25zdCBpc1ZhbGlkU3Jjc2V0ID0gaXNWYWxpZFdpZHRoRGVzY3JpcHRvciB8fCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3I7XG4gIGlmICghaXNWYWxpZFNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGBuZ1NyY3NldFxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHt2YWx1ZX1cXGApLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgc3VwcGx5IFxcYG5nU3Jjc2V0XFxgIHVzaW5nIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2Ygb25lIG9yIG1vcmUgd2lkdGggYCArXG4gICAgICAgICAgICBgZGVzY3JpcHRvcnMgKGUuZy4gXCIxMDB3LCAyMDB3XCIpIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMgKGUuZy4gXCIxeCwgMnhcIikuYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgdmFsdWU6IHN0cmluZykge1xuICBjb25zdCB1bmRlckRlbnNpdHlDYXAgPVxuICAgICAgdmFsdWUuc3BsaXQoJywnKS5ldmVyeShudW0gPT4gbnVtID09PSAnJyB8fCBwYXJzZUZsb2F0KG51bSkgPD0gQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQKTtcbiAgaWYgKCF1bmRlckRlbnNpdHlDYXApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke1xuICAgICAgICAgICAgaW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgICAgICAgICBkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgY29udGFpbnMgYW4gdW5zdXBwb3J0ZWQgaW1hZ2UgZGVuc2l0eTpgICtcbiAgICAgICAgICAgIGBcXGAke3ZhbHVlfVxcYC4gTmdPcHRpbWl6ZWRJbWFnZSBnZW5lcmFsbHkgcmVjb21tZW5kcyBhIG1heCBpbWFnZSBkZW5zaXR5IG9mIGAgK1xuICAgICAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggYnV0IHN1cHBvcnRzIGltYWdlIGRlbnNpdGllcyB1cCB0byBgICtcbiAgICAgICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14LiBUaGUgaHVtYW4gZXllIGNhbm5vdCBkaXN0aW5ndWlzaCBiZXR3ZWVuIGltYWdlIGRlbnNpdGllcyBgICtcbiAgICAgICAgICAgIGBncmVhdGVyIHRoYW4gJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCAtIHdoaWNoIG1ha2VzIHRoZW0gdW5uZWNlc3NhcnkgZm9yIGAgK1xuICAgICAgICAgICAgYG1vc3QgdXNlIGNhc2VzLiBJbWFnZXMgdGhhdCB3aWxsIGJlIHBpbmNoLXpvb21lZCBhcmUgdHlwaWNhbGx5IHRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciBgICtcbiAgICAgICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGltYWdlcy4gUGxlYXNlIHJlbW92ZSB0aGUgaGlnaCBkZW5zaXR5IGRlc2NyaXB0b3IgYW5kIHRyeSBhZ2Fpbi5gKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgUnVudGltZUVycm9yYCBpbnN0YW5jZSB0byByZXByZXNlbnQgYSBzaXR1YXRpb24gd2hlbiBhbiBpbnB1dCBpcyBzZXQgYWZ0ZXJcbiAqIHRoZSBkaXJlY3RpdmUgaGFzIGluaXRpYWxpemVkLlxuICovXG5mdW5jdGlvbiBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dE5hbWU6IHN0cmluZyk6IHt9IHtcbiAgbGV0IHJlYXNvbiE6IHN0cmluZztcbiAgaWYgKGlucHV0TmFtZSA9PT0gJ3dpZHRoJyB8fCBpbnB1dE5hbWUgPT09ICdoZWlnaHQnKSB7XG4gICAgcmVhc29uID0gYENoYW5naW5nIFxcYCR7aW5wdXROYW1lfVxcYCBtYXkgcmVzdWx0IGluIGRpZmZlcmVudCBhdHRyaWJ1dGUgdmFsdWUgYCArXG4gICAgICAgIGBhcHBsaWVkIHRvIHRoZSB1bmRlcmx5aW5nIGltYWdlIGVsZW1lbnQgYW5kIGNhdXNlIGxheW91dCBzaGlmdHMgb24gYSBwYWdlLmA7XG4gIH0gZWxzZSB7XG4gICAgcmVhc29uID0gYENoYW5naW5nIHRoZSBcXGAke2lucHV0TmFtZX1cXGAgd291bGQgaGF2ZSBubyBlZmZlY3Qgb24gdGhlIHVuZGVybHlpbmcgYCArXG4gICAgICAgIGBpbWFnZSBlbGVtZW50LCBiZWNhdXNlIHRoZSByZXNvdXJjZSBsb2FkaW5nIGhhcyBhbHJlYWR5IG9jY3VycmVkLmA7XG4gIH1cbiAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfSU5QVVRfQ0hBTkdFLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgd2FzIHVwZGF0ZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uIGAgK1xuICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuICR7cmVhc29ufSBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIGVpdGhlciBzd2l0Y2ggXFxgJHtpbnB1dE5hbWV9XFxgIHRvIGEgc3RhdGljIHZhbHVlIGAgK1xuICAgICAgICAgIGBvciB3cmFwIHRoZSBpbWFnZSBlbGVtZW50IGluIGFuICpuZ0lmIHRoYXQgaXMgZ2F0ZWQgb24gdGhlIG5lY2Vzc2FyeSB2YWx1ZS5gKTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgdGhhdCBub25lIG9mIHRoZSBsaXN0ZWQgaW5wdXRzIGhhcyBjaGFuZ2VkLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBpbnB1dHM6IHN0cmluZ1tdKSB7XG4gIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICBjb25zdCBpc1VwZGF0ZWQgPSBjaGFuZ2VzLmhhc093blByb3BlcnR5KGlucHV0KTtcbiAgICBpZiAoaXNVcGRhdGVkICYmICFjaGFuZ2VzW2lucHV0XS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ25nU3JjJykge1xuICAgICAgICAvLyBXaGVuIHRoZSBgbmdTcmNgIGlucHV0IGNoYW5nZXMsIHdlIGRldGVjdCB0aGF0IG9ubHkgaW4gdGhlXG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlc2AgaG9vaywgdGh1cyB0aGUgYG5nU3JjYCBpcyBhbHJlYWR5IHNldC4gV2UgdXNlXG4gICAgICAgIC8vIGBuZ1NyY2AgaW4gdGhlIGVycm9yIG1lc3NhZ2UsIHNvIHdlIHVzZSBhIHByZXZpb3VzIHZhbHVlLCBidXRcbiAgICAgICAgLy8gbm90IHRoZSB1cGRhdGVkIG9uZSBpbiBpdC5cbiAgICAgICAgZGlyID0ge25nU3JjOiBjaGFuZ2VzW2lucHV0XS5wcmV2aW91c1ZhbHVlfSBhcyBOZ09wdGltaXplZEltYWdlO1xuICAgICAgfVxuICAgICAgdGhyb3cgcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpciwgaW5wdXQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0R3JlYXRlclRoYW5aZXJvKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgdmFsaWROdW1iZXIgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgJiYgaW5wdXRWYWx1ZSA+IDA7XG4gIGNvbnN0IHZhbGlkU3RyaW5nID1cbiAgICAgIHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSAmJiBwYXJzZUludChpbnB1dFZhbHVlKSA+IDA7XG4gIGlmICghdmFsaWROdW1iZXIgJiYgIXZhbGlkU3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7aW5wdXROYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgXFxgJHtpbnB1dE5hbWV9XFxgIGFzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgcmVuZGVyZWQgaW1hZ2UgaXMgbm90IHZpc3VhbGx5IGRpc3RvcnRlZC4gRWZmZWN0aXZlbHkgdGhpcyBpcyBjaGVja2luZzpcbiAqIC0gV2hldGhlciB0aGUgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgcmVmbGVjdCB0aGUgYWN0dWFsIGRpbWVuc2lvbnMgb2YgdGhlIGltYWdlLlxuICogLSBXaGV0aGVyIGltYWdlIHN0eWxpbmcgaXMgXCJjb3JyZWN0XCIgKHNlZSBiZWxvdyBmb3IgYSBsb25nZXIgZXhwbGFuYXRpb24pLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbihcbiAgICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltZzogSFRNTEltYWdlRWxlbWVudCwgcmVuZGVyZXI6IFJlbmRlcmVyMikge1xuICBjb25zdCByZW1vdmVMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCAoKSA9PiB7XG4gICAgcmVtb3ZlTGlzdGVuZXJGbigpO1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShpbWcpO1xuICAgIGxldCByZW5kZXJlZFdpZHRoID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJykpO1xuICAgIGxldCByZW5kZXJlZEhlaWdodCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdoZWlnaHQnKSk7XG4gICAgY29uc3QgYm94U2l6aW5nID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdib3gtc2l6aW5nJyk7XG5cbiAgICBpZiAoYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcpIHtcbiAgICAgIGNvbnN0IHBhZGRpbmdUb3AgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctdG9wJyk7XG4gICAgICBjb25zdCBwYWRkaW5nUmlnaHQgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctcmlnaHQnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdCb3R0b20gPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctYm90dG9tJyk7XG4gICAgICBjb25zdCBwYWRkaW5nTGVmdCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1sZWZ0Jyk7XG4gICAgICByZW5kZXJlZFdpZHRoIC09IHBhcnNlRmxvYXQocGFkZGluZ1JpZ2h0KSArIHBhcnNlRmxvYXQocGFkZGluZ0xlZnQpO1xuICAgICAgcmVuZGVyZWRIZWlnaHQgLT0gcGFyc2VGbG9hdChwYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQocGFkZGluZ0JvdHRvbSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVuZGVyZWRBc3BlY3RSYXRpbyA9IHJlbmRlcmVkV2lkdGggLyByZW5kZXJlZEhlaWdodDtcbiAgICBjb25zdCBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zID0gcmVuZGVyZWRXaWR0aCAhPT0gMCAmJiByZW5kZXJlZEhlaWdodCAhPT0gMDtcblxuICAgIGNvbnN0IGludHJpbnNpY1dpZHRoID0gaW1nLm5hdHVyYWxXaWR0aDtcbiAgICBjb25zdCBpbnRyaW5zaWNIZWlnaHQgPSBpbWcubmF0dXJhbEhlaWdodDtcbiAgICBjb25zdCBpbnRyaW5zaWNBc3BlY3RSYXRpbyA9IGludHJpbnNpY1dpZHRoIC8gaW50cmluc2ljSGVpZ2h0O1xuXG4gICAgY29uc3Qgc3VwcGxpZWRXaWR0aCA9IGRpci53aWR0aCE7XG4gICAgY29uc3Qgc3VwcGxpZWRIZWlnaHQgPSBkaXIuaGVpZ2h0ITtcbiAgICBjb25zdCBzdXBwbGllZEFzcGVjdFJhdGlvID0gc3VwcGxpZWRXaWR0aCAvIHN1cHBsaWVkSGVpZ2h0O1xuXG4gICAgLy8gVG9sZXJhbmNlIGlzIHVzZWQgdG8gYWNjb3VudCBmb3IgdGhlIGltcGFjdCBvZiBzdWJwaXhlbCByZW5kZXJpbmcuXG4gICAgLy8gRHVlIHRvIHN1YnBpeGVsIHJlbmRlcmluZywgdGhlIHJlbmRlcmVkLCBpbnRyaW5zaWMsIGFuZCBzdXBwbGllZFxuICAgIC8vIGFzcGVjdCByYXRpb3Mgb2YgYSBjb3JyZWN0bHkgY29uZmlndXJlZCBpbWFnZSBtYXkgbm90IGV4YWN0bHkgbWF0Y2guXG4gICAgLy8gRm9yIGV4YW1wbGUsIGEgYHdpZHRoPTQwMzAgaGVpZ2h0PTMwMjBgIGltYWdlIG1pZ2h0IGhhdmUgYSByZW5kZXJlZFxuICAgIC8vIHNpemUgb2YgXCIxMDYydywgNzk2LjQ4aFwiLiAoQW4gYXNwZWN0IHJhdGlvIG9mIDEuMzM0Li4uIHZzLiAxLjMzMy4uLilcbiAgICBjb25zdCBpbmFjY3VyYXRlRGltZW5zaW9ucyA9XG4gICAgICAgIE1hdGguYWJzKHN1cHBsaWVkQXNwZWN0UmF0aW8gLSBpbnRyaW5zaWNBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuICAgIGNvbnN0IHN0eWxpbmdEaXN0b3J0aW9uID0gbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucyAmJlxuICAgICAgICBNYXRoLmFicyhpbnRyaW5zaWNBc3BlY3RSYXRpbyAtIHJlbmRlcmVkQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcblxuICAgIGlmIChpbmFjY3VyYXRlRGltZW5zaW9ucykge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBpbWFnZSBkb2VzIG5vdCBtYXRjaCBgICtcbiAgICAgICAgICAgICAgYHRoZSBhc3BlY3QgcmF0aW8gaW5kaWNhdGVkIGJ5IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuIGAgK1xuICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke1xuICAgICAgICAgICAgICAgICAgcm91bmQoaW50cmluc2ljQXNwZWN0UmF0aW8pfSkuIFxcblN1cHBsaWVkIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlczogYCArXG4gICAgICAgICAgICAgIGAke3N1cHBsaWVkV2lkdGh9dyB4ICR7c3VwcGxpZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiAke1xuICAgICAgICAgICAgICAgICAgcm91bmQoc3VwcGxpZWRBc3BlY3RSYXRpbyl9KS4gYCArXG4gICAgICAgICAgICAgIGBcXG5UbyBmaXggdGhpcywgdXBkYXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuYCkpO1xuICAgIH0gZWxzZSBpZiAoc3R5bGluZ0Rpc3RvcnRpb24pIHtcbiAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgcmVuZGVyZWQgaW1hZ2UgYCArXG4gICAgICAgICAgICAgIGBkb2VzIG5vdCBtYXRjaCB0aGUgaW1hZ2UncyBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiBgICtcbiAgICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtyb3VuZChpbnRyaW5zaWNBc3BlY3RSYXRpbyl9KS4gXFxuUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogYCArXG4gICAgICAgICAgICAgIGAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiBgICtcbiAgICAgICAgICAgICAgYCR7cm91bmQocmVuZGVyZWRBc3BlY3RSYXRpbyl9KS4gXFxuVGhpcyBpc3N1ZSBjYW4gb2NjdXIgaWYgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGAgK1xuICAgICAgICAgICAgICBgYXR0cmlidXRlcyBhcmUgYWRkZWQgdG8gYW4gaW1hZ2Ugd2l0aG91dCB1cGRhdGluZyB0aGUgY29ycmVzcG9uZGluZyBgICtcbiAgICAgICAgICAgICAgYGltYWdlIHN0eWxpbmcuIFRvIGZpeCB0aGlzLCBhZGp1c3QgaW1hZ2Ugc3R5bGluZy4gSW4gbW9zdCBjYXNlcywgYCArXG4gICAgICAgICAgICAgIGBhZGRpbmcgXCJoZWlnaHQ6IGF1dG9cIiBvciBcIndpZHRoOiBhdXRvXCIgdG8gdGhlIGltYWdlIHN0eWxpbmcgd2lsbCBmaXggYCArXG4gICAgICAgICAgICAgIGB0aGlzIGlzc3VlLmApKTtcbiAgICB9IGVsc2UgaWYgKCFkaXIubmdTcmNzZXQgJiYgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucykge1xuICAgICAgLy8gSWYgYG5nU3Jjc2V0YCBoYXNuJ3QgYmVlbiBzZXQsIHNhbml0eSBjaGVjayB0aGUgaW50cmluc2ljIHNpemUuXG4gICAgICBjb25zdCByZWNvbW1lbmRlZFdpZHRoID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRXaWR0aDtcbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkSGVpZ2h0ID0gUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQICogcmVuZGVyZWRIZWlnaHQ7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRXaWR0aCA9IChpbnRyaW5zaWNXaWR0aCAtIHJlY29tbWVuZGVkV2lkdGgpID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRIZWlnaHQgPSAoaW50cmluc2ljSGVpZ2h0IC0gcmVjb21tZW5kZWRIZWlnaHQpID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgICBpZiAob3ZlcnNpemVkV2lkdGggfHwgb3ZlcnNpemVkSGVpZ2h0KSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk9WRVJTSVpFRF9JTUFHRSxcbiAgICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGludHJpbnNpYyBpbWFnZSBpcyBzaWduaWZpY2FudGx5IGAgK1xuICAgICAgICAgICAgICAgIGBsYXJnZXIgdGhhbiBuZWNlc3NhcnkuIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemU6ICR7cmVjb21tZW5kZWRXaWR0aH13IHggJHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb21tZW5kZWRIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgICAgYFxcbk5vdGU6IFJlY29tbWVuZGVkIGludHJpbnNpYyBpbWFnZSBzaXplIGlzIGNhbGN1bGF0ZWQgYXNzdW1pbmcgYSBtYXhpbXVtIERQUiBvZiBgICtcbiAgICAgICAgICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9LiBUbyBpbXByb3ZlIGxvYWRpbmcgdGltZSwgcmVzaXplIHRoZSBpbWFnZSBgICtcbiAgICAgICAgICAgICAgICBgb3IgY29uc2lkZXIgdXNpbmcgdGhlIFwibmdTcmNzZXRcIiBhbmQgXCJzaXplc1wiIGF0dHJpYnV0ZXMuYCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBtaXNzaW5nQXR0cmlidXRlcyA9IFtdO1xuICBpZiAoZGlyLndpZHRoID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ3dpZHRoJyk7XG4gIGlmIChkaXIuaGVpZ2h0ID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ2hlaWdodCcpO1xuICBpZiAobWlzc2luZ0F0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUkVRVUlSRURfSU5QVVRfTUlTU0lORyxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGVzZSByZXF1aXJlZCBhdHRyaWJ1dGVzIGAgK1xuICAgICAgICAgICAgYGFyZSBtaXNzaW5nOiAke21pc3NpbmdBdHRyaWJ1dGVzLm1hcChhdHRyID0+IGBcIiR7YXR0cn1cImApLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICAgICAgIGBJbmNsdWRpbmcgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgd2lsbCBwcmV2ZW50IGltYWdlLXJlbGF0ZWQgbGF5b3V0IHNoaWZ0cy4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGluY2x1ZGUgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgb24gdGhlIGltYWdlIHRhZyBvciB0dXJuIG9uIGAgK1xuICAgICAgICAgICAgYFwiZmlsbFwiIG1vZGUgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHdpZHRoIGFuZCBoZWlnaHQgYXJlIG5vdCBzZXQuIFVzZWQgaW4gZmlsbCBtb2RlLCB3aGVyZSB0aG9zZSBhdHRyaWJ1dGVzIGRvbid0IG1ha2VcbiAqIHNlbnNlLlxuICovXG5mdW5jdGlvbiBhc3NlcnRFbXB0eVdpZHRoQW5kSGVpZ2h0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLndpZHRoIHx8IGRpci5oZWlnaHQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke1xuICAgICAgICAgICAgaW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgICAgICAgICBkaXIubmdTcmMpfSB0aGUgYXR0cmlidXRlcyBcXGBoZWlnaHRcXGAgYW5kL29yIFxcYHdpZHRoXFxgIGFyZSBwcmVzZW50IGAgK1xuICAgICAgICAgICAgYGFsb25nIHdpdGggdGhlIFxcYGZpbGxcXGAgYXR0cmlidXRlLiBCZWNhdXNlIFxcYGZpbGxcXGAgbW9kZSBjYXVzZXMgYW4gaW1hZ2UgdG8gZmlsbCBpdHMgY29udGFpbmluZyBgICtcbiAgICAgICAgICAgIGBlbGVtZW50LCB0aGUgc2l6ZSBhdHRyaWJ1dGVzIGhhdmUgbm8gZWZmZWN0IGFuZCBzaG91bGQgYmUgcmVtb3ZlZC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGhhcyBhIG5vbnplcm8gaGVpZ2h0LiBJZiB0aGUgaW1hZ2UgaXMgaW4gZmlsbCBtb2RlLCBwcm92aWRlc1xuICogZ3VpZGFuY2UgdGhhdCB0aGlzIGNhbiBiZSBjYXVzZWQgYnkgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCdzIENTUyBwb3NpdGlvbiBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uWmVyb1JlbmRlcmVkSGVpZ2h0KFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IHJlbW92ZUxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgcmVuZGVyZWRIZWlnaHQgPSBpbWcuY2xpZW50SGVpZ2h0O1xuICAgIGlmIChkaXIuZmlsbCAmJiByZW5kZXJlZEhlaWdodCA9PT0gMCkge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaGVpZ2h0IG9mIHRoZSBmaWxsLW1vZGUgaW1hZ2UgaXMgemVyby4gYCArXG4gICAgICAgICAgICAgIGBUaGlzIGlzIGxpa2VseSBiZWNhdXNlIHRoZSBjb250YWluaW5nIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSB0aGUgQ1NTICdwb3NpdGlvbicgYCArXG4gICAgICAgICAgICAgIGBwcm9wZXJ0eSBzZXQgdG8gb25lIG9mIHRoZSBmb2xsb3dpbmc6IFwicmVsYXRpdmVcIiwgXCJmaXhlZFwiLCBvciBcImFic29sdXRlXCIuIGAgK1xuICAgICAgICAgICAgICBgVG8gZml4IHRoaXMgcHJvYmxlbSwgbWFrZSBzdXJlIHRoZSBjb250YWluZXIgZWxlbWVudCBoYXMgdGhlIENTUyAncG9zaXRpb24nIGAgK1xuICAgICAgICAgICAgICBgcHJvcGVydHkgZGVmaW5lZCBhbmQgdGhlIGhlaWdodCBvZiB0aGUgZWxlbWVudCBpcyBub3QgemVyby5gKSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbG9hZGluZ2AgYXR0cmlidXRlIGlzIHNldCB0byBhIHZhbGlkIGlucHV0ICZcbiAqIGlzIG5vdCB1c2VkIG9uIHByaW9yaXR5IGltYWdlcy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIubG9hZGluZyAmJiBkaXIucHJpb3JpdHkpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYHdhcyB1c2VkIG9uIGFuIGltYWdlIHRoYXQgd2FzIG1hcmtlZCBcInByaW9yaXR5XCIuIGAgK1xuICAgICAgICAgICAgYFNldHRpbmcgXFxgbG9hZGluZ1xcYCBvbiBwcmlvcml0eSBpbWFnZXMgaXMgbm90IGFsbG93ZWQgYCArXG4gICAgICAgICAgICBgYmVjYXVzZSB0aGVzZSBpbWFnZXMgd2lsbCBhbHdheXMgYmUgZWFnZXJseSBsb2FkZWQuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCByZW1vdmUgdGhlIOKAnGxvYWRpbmfigJ0gYXR0cmlidXRlIGZyb20gdGhlIHByaW9yaXR5IGltYWdlLmApO1xuICB9XG4gIGNvbnN0IHZhbGlkSW5wdXRzID0gWydhdXRvJywgJ2VhZ2VyJywgJ2xhenknXTtcbiAgaWYgKHR5cGVvZiBkaXIubG9hZGluZyA9PT0gJ3N0cmluZycgJiYgIXZhbGlkSW5wdXRzLmluY2x1ZGVzKGRpci5sb2FkaW5nKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgaGFzIGFuIGludmFsaWQgdmFsdWUgKFxcYCR7ZGlyLmxvYWRpbmd9XFxgKS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSB2YWxpZCB2YWx1ZSAoXCJsYXp5XCIsIFwiZWFnZXJcIiwgb3IgXCJhdXRvXCIpLmApO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgTk9UIHVzaW5nIGEgbG9hZGVyIChmYWxsaW5nIGJhY2sgdG8gdGhlIGdlbmVyaWMgbG9hZGVyKSBhbmRcbiAqIHRoZSBpbWFnZSBhcHBlYXJzIHRvIGJlIGhvc3RlZCBvbiBvbmUgb2YgdGhlIGltYWdlIENETnMgZm9yIHdoaWNoXG4gKiB3ZSBkbyBoYXZlIGEgYnVpbHQtaW4gaW1hZ2UgbG9hZGVyLiBTdWdnZXN0cyBzd2l0Y2hpbmcgdG8gdGhlXG4gKiBidWlsdC1pbiBsb2FkZXIuXG4gKlxuICogQHBhcmFtIG5nU3JjIFZhbHVlIG9mIHRoZSBuZ1NyYyBhdHRyaWJ1dGVcbiAqIEBwYXJhbSBpbWFnZUxvYWRlciBJbWFnZUxvYWRlciBwcm92aWRlZFxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RNaXNzaW5nQnVpbHRJbkxvYWRlcihuZ1NyYzogc3RyaW5nLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBsZXQgYnVpbHRJbkxvYWRlck5hbWUgPSAnJztcbiAgICBmb3IgKGNvbnN0IGxvYWRlciBvZiBCVUlMVF9JTl9MT0FERVJTKSB7XG4gICAgICBpZiAobG9hZGVyLnRlc3RVcmwobmdTcmMpKSB7XG4gICAgICAgIGJ1aWx0SW5Mb2FkZXJOYW1lID0gbG9hZGVyLm5hbWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYnVpbHRJbkxvYWRlck5hbWUpIHtcbiAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX0JVSUxUSU5fTE9BREVSLFxuICAgICAgICAgIGBOZ09wdGltaXplZEltYWdlOiBJdCBsb29rcyBsaWtlIHlvdXIgaW1hZ2VzIG1heSBiZSBob3N0ZWQgb24gdGhlIGAgK1xuICAgICAgICAgICAgICBgJHtidWlsdEluTG9hZGVyTmFtZX0gQ0ROLCBidXQgeW91ciBhcHAgaXMgbm90IHVzaW5nIEFuZ3VsYXIncyBgICtcbiAgICAgICAgICAgICAgYGJ1aWx0LWluIGxvYWRlciBmb3IgdGhhdCBDRE4uIFdlIHJlY29tbWVuZCBzd2l0Y2hpbmcgdG8gdXNlIGAgK1xuICAgICAgICAgICAgICBgdGhlIGJ1aWx0LWluIGJ5IGNhbGxpbmcgXFxgcHJvdmlkZSR7YnVpbHRJbkxvYWRlck5hbWV9TG9hZGVyKClcXGAgYCArXG4gICAgICAgICAgICAgIGBpbiB5b3VyIFxcYHByb3ZpZGVyc1xcYCBhbmQgcGFzc2luZyBpdCB5b3VyIGluc3RhbmNlJ3MgYmFzZSBVUkwuIGAgK1xuICAgICAgICAgICAgICBgSWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBidWlsdC1pbiBsb2FkZXIsIGRlZmluZSBhIGN1c3RvbSBgICtcbiAgICAgICAgICAgICAgYGxvYWRlciBmdW5jdGlvbiB1c2luZyBJTUFHRV9MT0FERVIgdG8gc2lsZW5jZSB0aGlzIHdhcm5pbmcuYCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIG5nU3Jjc2V0IGlzIHByZXNlbnQgYW5kIG5vIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9OZ1NyY3NldFdpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5uZ1NyY3NldCAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX05FQ0VTU0FSWV9MT0FERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICAgICAgYHdoaWNoIHdvdWxkIHJlc3VsdCBpbiB0aGUgc2FtZSBpbWFnZSBiZWluZyB1c2VkIGZvciBhbGwgY29uZmlndXJlZCBzaXplcy4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBsb2FkZXIgb3IgcmVtb3ZlIHRoZSBcXGBuZ1NyY3NldFxcYCBhdHRyaWJ1dGUgZnJvbSB0aGUgaW1hZ2UuYCkpO1xuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgbG9hZGVyUGFyYW1zIGlzIHByZXNlbnQgYW5kIG5vIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZ1xuICogdXNlZCkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLmxvYWRlclBhcmFtcyAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX05FQ0VTU0FSWV9MT0FERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRlclBhcmFtc1xcYCBhdHRyaWJ1dGUgaXMgcHJlc2VudCBidXQgYCArXG4gICAgICAgICAgICBgbm8gaW1hZ2UgbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLCBgICtcbiAgICAgICAgICAgIGB3aGljaCBtZWFucyB0aGF0IHRoZSBsb2FkZXJQYXJhbXMgZGF0YSB3aWxsIG5vdCBiZSBjb25zdW1lZCBhbmQgd2lsbCBub3QgYWZmZWN0IHRoZSBVUkwuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgY3VzdG9tIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYGxvYWRlclBhcmFtc1xcYCBhdHRyaWJ1dGUgZnJvbSB0aGUgaW1hZ2UuYCkpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gcm91bmQoaW5wdXQ6IG51bWJlcik6IG51bWJlcnxzdHJpbmcge1xuICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihpbnB1dCkgPyBpbnB1dCA6IGlucHV0LnRvRml4ZWQoMik7XG59XG5cbi8vIFRyYW5zZm9ybSBmdW5jdGlvbiB0byBoYW5kbGUgU2FmZVZhbHVlIGlucHV0IGZvciBuZ1NyYy4gVGhpcyBkb2Vzbid0IGRvIGFueSBzYW5pdGl6YXRpb24sXG4vLyBhcyB0aGF0IGlzIG5vdCBuZWVkZWQgZm9yIGltZy5zcmMgYW5kIGltZy5zcmNzZXQuIFRoaXMgdHJhbnNmb3JtIGlzIHB1cmVseSBmb3IgY29tcGF0aWJpbGl0eS5cbmZ1bmN0aW9uIHVud3JhcFNhZmVVcmwodmFsdWU6IHN0cmluZ3xTYWZlVmFsdWUpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdW53cmFwU2FmZVZhbHVlKHZhbHVlKTtcbn1cbiJdfQ==