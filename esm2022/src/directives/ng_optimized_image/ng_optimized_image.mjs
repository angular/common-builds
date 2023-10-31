/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, Directive, ElementRef, inject, Injector, Input, NgZone, numberAttribute, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS, ɵRuntimeError as RuntimeError, ɵunwrapSafeValue as unwrapSafeValue } from '@angular/core';
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
        performance.mark('mark_use_counter', { 'detail': { 'feature': 'NgOptimizedImage' } });
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
        return !this.disableOptimizedSrcset && !this.srcset && this.imageLoader !== noopImageLoader &&
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-a3028e2", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.1.0-next.0+sha-a3028e2", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0px\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-a3028e2", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBZ0MsV0FBVyxFQUFFLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBK0IsYUFBYSxJQUFJLFlBQVksRUFBMkIsZ0JBQWdCLElBQUksZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2xiLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRW5ELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxZQUFZLEVBQWtDLGVBQWUsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzNHLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQzs7QUFFMUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIs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RixnR0FBZ0c7QUFDaEcsU0FBUyxhQUFhLENBQUMsS0FBdUI7SUFDNUMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUNELE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtib29sZWFuQXR0cmlidXRlLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIGluamVjdCwgSW5qZWN0b3IsIElucHV0LCBOZ1pvbmUsIG51bWJlckF0dHJpYnV0ZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUExBVEZPUk1fSUQsIFJlbmRlcmVyMiwgU2ltcGxlQ2hhbmdlcywgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtUlNQUdFX0NPTkZJRyBhcyBJTUFHRV9DT05GSUcsIMm1SU1BR0VfQ09ORklHX0RFRkFVTFRTIGFzIElNQUdFX0NPTkZJR19ERUZBVUxUUywgybVJbWFnZUNvbmZpZyBhcyBJbWFnZUNvbmZpZywgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLCDJtVNhZmVWYWx1ZSBhcyBTYWZlVmFsdWUsIMm1dW53cmFwU2FmZVZhbHVlIGFzIHVud3JhcFNhZmVWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnLi4vLi4vcGxhdGZvcm1faWQnO1xuXG5pbXBvcnQge2ltZ0RpcmVjdGl2ZURldGFpbHN9IGZyb20gJy4vZXJyb3JfaGVscGVyJztcbmltcG9ydCB7Y2xvdWRpbmFyeUxvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9jbG91ZGluYXJ5X2xvYWRlcic7XG5pbXBvcnQge0lNQUdFX0xPQURFUiwgSW1hZ2VMb2FkZXIsIEltYWdlTG9hZGVyQ29uZmlnLCBub29wSW1hZ2VMb2FkZXJ9IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZV9sb2FkZXInO1xuaW1wb3J0IHtpbWFnZUtpdExvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWFnZWtpdF9sb2FkZXInO1xuaW1wb3J0IHtpbWdpeExvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVycy9pbWdpeF9sb2FkZXInO1xuaW1wb3J0IHtMQ1BJbWFnZU9ic2VydmVyfSBmcm9tICcuL2xjcF9pbWFnZV9vYnNlcnZlcic7XG5pbXBvcnQge1ByZWNvbm5lY3RMaW5rQ2hlY2tlcn0gZnJvbSAnLi9wcmVjb25uZWN0X2xpbmtfY2hlY2tlcic7XG5pbXBvcnQge1ByZWxvYWRMaW5rQ3JlYXRvcn0gZnJvbSAnLi9wcmVsb2FkLWxpbmstY3JlYXRvcic7XG5cbi8qKlxuICogV2hlbiBhIEJhc2U2NC1lbmNvZGVkIGltYWdlIGlzIHBhc3NlZCBhcyBhbiBpbnB1dCB0byB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSxcbiAqIGFuIGVycm9yIGlzIHRocm93bi4gVGhlIGltYWdlIGNvbnRlbnQgKGFzIGEgc3RyaW5nKSBtaWdodCBiZSB2ZXJ5IGxvbmcsIHRodXMgbWFraW5nXG4gKiBpdCBoYXJkIHRvIHJlYWQgYW4gZXJyb3IgbWVzc2FnZSBpZiB0aGUgZW50aXJlIHN0cmluZyBpcyBpbmNsdWRlZC4gVGhpcyBjb25zdCBkZWZpbmVzXG4gKiB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW50byB0aGUgZXJyb3IgbWVzc2FnZS4gVGhlIHJlc3RcbiAqIG9mIHRoZSBjb250ZW50IGlzIHRydW5jYXRlZC5cbiAqL1xuY29uc3QgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SID0gNTA7XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyB3aWR0aCBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxMDB3LCAyMDB3XCIuXG4gKi9cbmNvbnN0IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrd1xccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxeCwgMngsIDUweFwiLiBBbHNvIHN1cHBvcnRzIGRlY2ltYWxzIGxpa2UgXCIxLjV4LCAxLjUweFwiLlxuICovXG5jb25zdCBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrKFxcLlxcZCspP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgaW4gZ2VuZXJhdGluZyBhdXRvbWF0aWMgZGVuc2l0eS1iYXNlZCBzcmNzZXRzXG4gKi9cbmNvbnN0IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTID0gWzEsIDJdO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGJyZWFrcG9pbnRzIHRvIHVzZSBvbiBmdWxsLXdpZHRoIGltYWdlc1xuICovXG5jb25zdCBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRiA9IDY0MDtcbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYXNwZWN0IHJhdGlvcyBhcmUgc2ltaWxhciBpbiB2YWx1ZS5cbiAqL1xuY29uc3QgQVNQRUNUX1JBVElPX1RPTEVSQU5DRSA9IC4xO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGltYWdlIGhhcyBiZWVuIHJlcXVlc3RlZCBhdCBhbiBvdmVybHlcbiAqIGxhcmdlIHNpemUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCByZW5kZXJlZCBpbWFnZSBzaXplIChhZnRlciB0YWtpbmdcbiAqIGludG8gYWNjb3VudCBhIHR5cGljYWwgZGV2aWNlIHBpeGVsIHJhdGlvKS4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFID0gMTAwMDtcblxuLyoqXG4gKiBVc2VkIHRvIGxpbWl0IGF1dG9tYXRpYyBzcmNzZXQgZ2VuZXJhdGlvbiBvZiB2ZXJ5IGxhcmdlIHNvdXJjZXMgZm9yXG4gKiBmaXhlZC1zaXplIGltYWdlcy4gSW4gcGl4ZWxzLlxuICovXG5jb25zdCBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgPSAxOTIwO1xuY29uc3QgRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVCA9IDEwODA7XG5cblxuLyoqIEluZm8gYWJvdXQgYnVpbHQtaW4gbG9hZGVycyB3ZSBjYW4gdGVzdCBmb3IuICovXG5leHBvcnQgY29uc3QgQlVJTFRfSU5fTE9BREVSUyA9IFtpbWdpeExvYWRlckluZm8sIGltYWdlS2l0TG9hZGVySW5mbywgY2xvdWRpbmFyeUxvYWRlckluZm9dO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGltcHJvdmVzIGltYWdlIGxvYWRpbmcgcGVyZm9ybWFuY2UgYnkgZW5mb3JjaW5nIGJlc3QgcHJhY3RpY2VzLlxuICpcbiAqIGBOZ09wdGltaXplZEltYWdlYCBlbnN1cmVzIHRoYXQgdGhlIGxvYWRpbmcgb2YgdGhlIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBpbWFnZSBpc1xuICogcHJpb3JpdGl6ZWQgYnk6XG4gKiAtIEF1dG9tYXRpY2FsbHkgc2V0dGluZyB0aGUgYGZldGNocHJpb3JpdHlgIGF0dHJpYnV0ZSBvbiB0aGUgYDxpbWc+YCB0YWdcbiAqIC0gTGF6eSBsb2FkaW5nIG5vbi1wcmlvcml0eSBpbWFnZXMgYnkgZGVmYXVsdFxuICogLSBBdXRvbWF0aWNhbGx5IGdlbmVyYXRpbmcgYSBwcmVjb25uZWN0IGxpbmsgdGFnIGluIHRoZSBkb2N1bWVudCBoZWFkXG4gKlxuICogSW4gYWRkaXRpb24sIHRoZSBkaXJlY3RpdmU6XG4gKiAtIEdlbmVyYXRlcyBhcHByb3ByaWF0ZSBhc3NldCBVUkxzIGlmIGEgY29ycmVzcG9uZGluZyBgSW1hZ2VMb2FkZXJgIGZ1bmN0aW9uIGlzIHByb3ZpZGVkXG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVzIGEgc3Jjc2V0XG4gKiAtIFJlcXVpcmVzIHRoYXQgYHdpZHRoYCBhbmQgYGhlaWdodGAgYXJlIHNldFxuICogLSBXYXJucyBpZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGhhdmUgYmVlbiBzZXQgaW5jb3JyZWN0bHlcbiAqIC0gV2FybnMgaWYgdGhlIGltYWdlIHdpbGwgYmUgdmlzdWFsbHkgZGlzdG9ydGVkIHdoZW4gcmVuZGVyZWRcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgaXMgbWFya2VkIGFzIFtzdGFuZGFsb25lXShndWlkZS9zdGFuZGFsb25lLWNvbXBvbmVudHMpIGFuZCBjYW5cbiAqIGJlIGltcG9ydGVkIGRpcmVjdGx5LlxuICpcbiAqIEZvbGxvdyB0aGUgc3RlcHMgYmVsb3cgdG8gZW5hYmxlIGFuZCB1c2UgdGhlIGRpcmVjdGl2ZTpcbiAqIDEuIEltcG9ydCBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGUgb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudC5cbiAqIDIuIE9wdGlvbmFsbHkgcHJvdmlkZSBhbiBgSW1hZ2VMb2FkZXJgIGlmIHlvdSB1c2UgYW4gaW1hZ2UgaG9zdGluZyBzZXJ2aWNlLlxuICogMy4gVXBkYXRlIHRoZSBuZWNlc3NhcnkgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyBhbmQgcmVwbGFjZSBgc3JjYCBhdHRyaWJ1dGVzIHdpdGggYG5nU3JjYC5cbiAqIFVzaW5nIGEgYG5nU3JjYCBhbGxvd3MgdGhlIGRpcmVjdGl2ZSB0byBjb250cm9sIHdoZW4gdGhlIGBzcmNgIGdldHMgc2V0LCB3aGljaCB0cmlnZ2VycyBhbiBpbWFnZVxuICogZG93bmxvYWQuXG4gKlxuICogU3RlcCAxOiBpbXBvcnQgdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgTmdPcHRpbWl6ZWRJbWFnZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gSW5jbHVkZSBpdCBpbnRvIHRoZSBuZWNlc3NhcnkgTmdNb2R1bGVcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBBcHBNb2R1bGUge31cbiAqXG4gKiAvLyAuLi4gb3IgYSBzdGFuZGFsb25lIENvbXBvbmVudFxuICogQENvbXBvbmVudCh7XG4gKiAgIHN0YW5kYWxvbmU6IHRydWVcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIE15U3RhbmRhbG9uZUNvbXBvbmVudCB7fVxuICogYGBgXG4gKlxuICogU3RlcCAyOiBjb25maWd1cmUgYSBsb2FkZXIuXG4gKlxuICogVG8gdXNlIHRoZSAqKmRlZmF1bHQgbG9hZGVyKio6IG5vIGFkZGl0aW9uYWwgY29kZSBjaGFuZ2VzIGFyZSBuZWNlc3NhcnkuIFRoZSBVUkwgcmV0dXJuZWQgYnkgdGhlXG4gKiBnZW5lcmljIGxvYWRlciB3aWxsIGFsd2F5cyBtYXRjaCB0aGUgdmFsdWUgb2YgXCJzcmNcIi4gSW4gb3RoZXIgd29yZHMsIHRoaXMgbG9hZGVyIGFwcGxpZXMgbm9cbiAqIHRyYW5zZm9ybWF0aW9ucyB0byB0aGUgcmVzb3VyY2UgVVJMIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGBuZ1NyY2AgYXR0cmlidXRlIHdpbGwgYmUgdXNlZCBhcyBpcy5cbiAqXG4gKiBUbyB1c2UgYW4gZXhpc3RpbmcgbG9hZGVyIGZvciBhICoqdGhpcmQtcGFydHkgaW1hZ2Ugc2VydmljZSoqOiBhZGQgdGhlIHByb3ZpZGVyIGZhY3RvcnkgZm9yIHlvdXJcbiAqIGNob3NlbiBzZXJ2aWNlIHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheS4gSW4gdGhlIGV4YW1wbGUgYmVsb3csIHRoZSBJbWdpeCBsb2FkZXIgaXMgdXNlZDpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3Byb3ZpZGVJbWdpeExvYWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDYWxsIHRoZSBmdW5jdGlvbiBhbmQgYWRkIHRoZSByZXN1bHQgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5OlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHByb3ZpZGVJbWdpeExvYWRlcihcImh0dHBzOi8vbXkuYmFzZS51cmwvXCIpLFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIHByb3ZpZGVzIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICogLSBgcHJvdmlkZUNsb3VkZmxhcmVMb2FkZXJgXG4gKiAtIGBwcm92aWRlQ2xvdWRpbmFyeUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWFnZUtpdExvYWRlcmBcbiAqIC0gYHByb3ZpZGVJbWdpeExvYWRlcmBcbiAqXG4gKiBJZiB5b3UgdXNlIGEgZGlmZmVyZW50IGltYWdlIHByb3ZpZGVyLCB5b3UgY2FuIGNyZWF0ZSBhIGN1c3RvbSBsb2FkZXIgZnVuY3Rpb24gYXMgZGVzY3JpYmVkXG4gKiBiZWxvdy5cbiAqXG4gKiBUbyB1c2UgYSAqKmN1c3RvbSBsb2FkZXIqKjogcHJvdmlkZSB5b3VyIGxvYWRlciBmdW5jdGlvbiBhcyBhIHZhbHVlIGZvciB0aGUgYElNQUdFX0xPQURFUmAgRElcbiAqIHRva2VuLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBDb25maWd1cmUgdGhlIGxvYWRlciB1c2luZyB0aGUgYElNQUdFX0xPQURFUmAgdG9rZW4uXG4gKiBwcm92aWRlcnM6IFtcbiAqICAge1xuICogICAgICBwcm92aWRlOiBJTUFHRV9MT0FERVIsXG4gKiAgICAgIHVzZVZhbHVlOiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICogICAgICAgIHJldHVybiBgaHR0cHM6Ly9leGFtcGxlLmNvbS8ke2NvbmZpZy5zcmN9LSR7Y29uZmlnLndpZHRofS5qcGd9YDtcbiAqICAgICAgfVxuICogICB9LFxuICogXSxcbiAqIGBgYFxuICpcbiAqIFN0ZXAgMzogdXBkYXRlIGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgdG8gdXNlIGBuZ1NyY2AgaW5zdGVhZCBvZiBgc3JjYC5cbiAqXG4gKiBgYGBcbiAqIDxpbWcgbmdTcmM9XCJsb2dvLnBuZ1wiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMTAwXCI+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzZWxlY3RvcjogJ2ltZ1tuZ1NyY10nLFxuICBob3N0OiB7XG4gICAgJ1tzdHlsZS5wb3NpdGlvbl0nOiAnZmlsbCA/IFwiYWJzb2x1dGVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUud2lkdGhdJzogJ2ZpbGwgPyBcIjEwMCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuaGVpZ2h0XSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmluc2V0XSc6ICdmaWxsID8gXCIwcHhcIiA6IG51bGwnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGltYWdlTG9hZGVyID0gaW5qZWN0KElNQUdFX0xPQURFUik7XG4gIHByaXZhdGUgY29uZmlnOiBJbWFnZUNvbmZpZyA9IHByb2Nlc3NDb25maWcoaW5qZWN0KElNQUdFX0NPTkZJRykpO1xuICBwcml2YXRlIHJlbmRlcmVyID0gaW5qZWN0KFJlbmRlcmVyMik7XG4gIHByaXZhdGUgaW1nRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuICBwcml2YXRlIGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0KFBMQVRGT1JNX0lEKSk7XG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlbG9hZExpbmtDcmVhdG9yID0gaW5qZWN0KFByZWxvYWRMaW5rQ3JlYXRvcik7XG5cbiAgLy8gYSBMQ1AgaW1hZ2Ugb2JzZXJ2ZXIgLSBzaG91bGQgYmUgaW5qZWN0ZWQgb25seSBpbiB0aGUgZGV2IG1vZGVcbiAgcHJpdmF0ZSBsY3BPYnNlcnZlciA9IG5nRGV2TW9kZSA/IHRoaXMuaW5qZWN0b3IuZ2V0KExDUEltYWdlT2JzZXJ2ZXIpIDogbnVsbDtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSByZXdyaXR0ZW4gYHNyY2Agb25jZSBhbmQgc3RvcmUgaXQuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIHJlcGV0aXRpdmUgY2FsY3VsYXRpb25zIGFuZCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBjbGVhbnVwIGluIHRoZVxuICAgKiBgbmdPbkRlc3Ryb3lgIGRvZXMgbm90IHJlbHkgb24gdGhlIGBJTUFHRV9MT0FERVJgIGxvZ2ljICh3aGljaCBpbiB0dXJuIGNhbiByZWx5IG9uIHNvbWUgb3RoZXJcbiAgICogaW5zdGFuY2UgdGhhdCBtaWdodCBiZSBhbHJlYWR5IGRlc3Ryb3llZCkuXG4gICAqL1xuICBwcml2YXRlIF9yZW5kZXJlZFNyYzogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCh7cmVxdWlyZWQ6IHRydWUsIHRyYW5zZm9ybTogdW53cmFwU2FmZVVybH0pIG5nU3JjITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gICAqIFRoZSBpbWFnZSBuYW1lIHdpbGwgYmUgdGFrZW4gZnJvbSBgbmdTcmNgIGFuZCBjb21iaW5lZCB3aXRoIHRoZSBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHlcbiAgICogZGVzY3JpcHRvcnMgdG8gZ2VuZXJhdGUgdGhlIGZpbmFsIGBzcmNzZXRgIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogYGBgXG4gICAqIDxpbWcgbmdTcmM9XCJoZWxsby5qcGdcIiBuZ1NyY3NldD1cIjEwMHcsIDIwMHdcIiAvPiAgPT5cbiAgICogPGltZyBzcmM9XCJwYXRoL2hlbGxvLmpwZ1wiIHNyY3NldD1cInBhdGgvaGVsbG8uanBnP3c9MTAwIDEwMHcsIHBhdGgvaGVsbG8uanBnP3c9MjAwIDIwMHdcIiAvPlxuICAgKiBgYGBcbiAgICovXG4gIEBJbnB1dCgpIG5nU3Jjc2V0ITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBgc2l6ZXNgIGF0dHJpYnV0ZSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBQcm92aWRpbmcgc2l6ZXMgY2F1c2VzIHRoZSBpbWFnZSB0byBjcmVhdGUgYW4gYXV0b21hdGljIHJlc3BvbnNpdmUgc3Jjc2V0LlxuICAgKi9cbiAgQElucHV0KCkgc2l6ZXM/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKiBGb3IgZml4ZWQgc2l6ZSBpbWFnZXM6IHRoZSBkZXNpcmVkIHJlbmRlcmVkIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSkgd2lkdGg6IG51bWJlcnx1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy4qIFRoZSBpbnRyaW5zaWNcbiAgICogaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlfSkgaGVpZ2h0OiBudW1iZXJ8dW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVzaXJlZCBsb2FkaW5nIGJlaGF2aW9yIChsYXp5LCBlYWdlciwgb3IgYXV0bykuIERlZmF1bHRzIHRvIGBsYXp5YCxcbiAgICogd2hpY2ggaXMgcmVjb21tZW5kZWQgZm9yIG1vc3QgaW1hZ2VzLlxuICAgKlxuICAgKiBXYXJuaW5nOiBTZXR0aW5nIGltYWdlcyBhcyBsb2FkaW5nPVwiZWFnZXJcIiBvciBsb2FkaW5nPVwiYXV0b1wiIG1hcmtzIHRoZW1cbiAgICogYXMgbm9uLXByaW9yaXR5IGltYWdlcyBhbmQgY2FuIGh1cnQgbG9hZGluZyBwZXJmb3JtYW5jZS4gRm9yIGltYWdlcyB3aGljaFxuICAgKiBtYXkgYmUgdGhlIExDUCBlbGVtZW50LCB1c2UgdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGluc3RlYWQgb2YgYGxvYWRpbmdgLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGluZz86ICdsYXp5J3wnZWFnZXInfCdhdXRvJztcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbWFnZSBzaG91bGQgaGF2ZSBhIGhpZ2ggcHJpb3JpdHkuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIHByaW9yaXR5ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIERhdGEgdG8gcGFzcyB0aHJvdWdoIHRvIGN1c3RvbSBsb2FkZXJzLlxuICAgKi9cbiAgQElucHV0KCkgbG9hZGVyUGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzcmNzZXQgZ2VuZXJhdGlvbiBmb3IgdGhpcyBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZU9wdGltaXplZFNyY3NldCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbWFnZSB0byBcImZpbGwgbW9kZVwiLCB3aGljaCBlbGltaW5hdGVzIHRoZSBoZWlnaHQvd2lkdGggcmVxdWlyZW1lbnQgYW5kIGFkZHNcbiAgICogc3R5bGVzIHN1Y2ggdGhhdCB0aGUgaW1hZ2UgZmlsbHMgaXRzIGNvbnRhaW5pbmcgZWxlbWVudC5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZmlsbCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY2AgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3JjYCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3JjYCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgYHNyY3NldGAgYXR0cmlidXRlIGlmIHNldCBvbiB0aGUgaG9zdCBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgZXhjbHVzaXZlbHkgcmVhZCB0byBhc3NlcnQgdGhhdCBgc3Jjc2V0YCBpcyBub3Qgc2V0IGluIGNvbmZsaWN0XG4gICAqIHdpdGggYG5nU3Jjc2V0YCBhbmQgdGhhdCBpbWFnZXMgZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgcGVyZm9ybWFuY2UubWFyaygnbWFya191c2VfY291bnRlcicsIHsnZGV0YWlsJzogeydmZWF0dXJlJzogJ05nT3B0aW1pemVkSW1hZ2UnfX0pO1xuXG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgIGFzc2VydE5vbkVtcHR5SW5wdXQodGhpcywgJ25nU3JjJywgdGhpcy5uZ1NyYyk7XG4gICAgICBhc3NlcnRWYWxpZE5nU3Jjc2V0KHRoaXMsIHRoaXMubmdTcmNzZXQpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyh0aGlzKTtcbiAgICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQodGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVcmwodGhpcyk7XG4gICAgICBpZiAodGhpcy5maWxsKSB7XG4gICAgICAgIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICAgIC8vIFRoaXMgbGVhdmVzIHRoZSBBbmd1bGFyIHpvbmUgdG8gYXZvaWQgdHJpZ2dlcmluZyB1bm5lY2Vzc2FyeSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlcyB3aGVuXG4gICAgICAgIC8vIGBsb2FkYCB0YXNrcyBhcmUgaW52b2tlZCBvbiBpbWFnZXMuXG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihcbiAgICAgICAgICAgICgpID0+IGFzc2VydE5vblplcm9SZW5kZXJlZEhlaWdodCh0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHRoaXMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFzc2VydEdyZWF0ZXJUaGFuWmVybyh0aGlzLCB0aGlzLndpZHRoLCAnd2lkdGgnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IGNoZWNrIGZvciBkaXN0b3J0ZWQgaW1hZ2VzIHdoZW4gbm90IGluIGZpbGwgbW9kZSwgd2hlcmVcbiAgICAgICAgLy8gaW1hZ2VzIG1heSBiZSBpbnRlbnRpb25hbGx5IHN0cmV0Y2hlZCwgY3JvcHBlZCBvciBsZXR0ZXJib3hlZC5cbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKFxuICAgICAgICAgICAgKCkgPT4gYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24odGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKSk7XG4gICAgICB9XG4gICAgICBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dCh0aGlzKTtcbiAgICAgIGlmICghdGhpcy5uZ1NyY3NldCkge1xuICAgICAgICBhc3NlcnROb0NvbXBsZXhTaXplcyh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydE5vdE1pc3NpbmdCdWlsdEluTG9hZGVyKHRoaXMubmdTcmMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuICAgICAgYXNzZXJ0Tm9OZ1NyY3NldFdpdGhvdXRMb2FkZXIodGhpcywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb0xvYWRlclBhcmFtc1dpdGhvdXRMb2FkZXIodGhpcywgdGhpcy5pbWFnZUxvYWRlcik7XG5cbiAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sY3BPYnNlcnZlciEucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjLCB0aGlzLnByaW9yaXR5KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IGNoZWNrZXIgPSB0aGlzLmluamVjdG9yLmdldChQcmVjb25uZWN0TGlua0NoZWNrZXIpO1xuICAgICAgICBjaGVja2VyLmFzc2VydFByZWNvbm5lY3QodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5uZ1NyYyk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZXMoKSB7XG4gICAgLy8gTXVzdCBzZXQgd2lkdGgvaGVpZ2h0IGV4cGxpY2l0bHkgaW4gY2FzZSB0aGV5IGFyZSBib3VuZCAoaW4gd2hpY2ggY2FzZSB0aGV5IHdpbGxcbiAgICAvLyBvbmx5IGJlIHJlZmxlY3RlZCBhbmQgbm90IGZvdW5kIGJ5IHRoZSBicm93c2VyKVxuICAgIGlmICh0aGlzLmZpbGwpIHtcbiAgICAgIGlmICghdGhpcy5zaXplcykge1xuICAgICAgICB0aGlzLnNpemVzID0gJzEwMHZ3JztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGghLnRvU3RyaW5nKCkpO1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodCEudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdsb2FkaW5nJywgdGhpcy5nZXRMb2FkaW5nQmVoYXZpb3IoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdmZXRjaHByaW9yaXR5JywgdGhpcy5nZXRGZXRjaFByaW9yaXR5KCkpO1xuXG4gICAgLy8gVGhlIGBkYXRhLW5nLWltZ2AgYXR0cmlidXRlIGZsYWdzIGFuIGltYWdlIGFzIHVzaW5nIHRoZSBkaXJlY3RpdmUsIHRvIGFsbG93XG4gICAgLy8gZm9yIGFuYWx5c2lzIG9mIHRoZSBkaXJlY3RpdmUncyBwZXJmb3JtYW5jZS5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ25nLWltZycsICd0cnVlJyk7XG5cbiAgICAvLyBUaGUgYHNyY2AgYW5kIGBzcmNzZXRgIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIHNldCBsYXN0IHNpbmNlIG90aGVyIGF0dHJpYnV0ZXNcbiAgICAvLyBjb3VsZCBhZmZlY3QgdGhlIGltYWdlJ3MgbG9hZGluZyBiZWhhdmlvci5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLnVwZGF0ZVNyY0FuZFNyY3NldCgpO1xuXG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc2l6ZXMnLCB0aGlzLnNpemVzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTZXJ2ZXIgJiYgdGhpcy5wcmlvcml0eSkge1xuICAgICAgdGhpcy5wcmVsb2FkTGlua0NyZWF0b3IuY3JlYXRlUHJlbG9hZExpbmtUYWcoXG4gICAgICAgICAgdGhpcy5yZW5kZXJlciwgdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgcmV3cml0dGVuU3Jjc2V0LCB0aGlzLnNpemVzKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UodGhpcywgY2hhbmdlcywgW1xuICAgICAgICAnbmdTcmNzZXQnLFxuICAgICAgICAnd2lkdGgnLFxuICAgICAgICAnaGVpZ2h0JyxcbiAgICAgICAgJ3ByaW9yaXR5JyxcbiAgICAgICAgJ2ZpbGwnLFxuICAgICAgICAnbG9hZGluZycsXG4gICAgICAgICdzaXplcycsXG4gICAgICAgICdsb2FkZXJQYXJhbXMnLFxuICAgICAgICAnZGlzYWJsZU9wdGltaXplZFNyY3NldCcsXG4gICAgICBdKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZXNbJ25nU3JjJ10gJiYgIWNoYW5nZXNbJ25nU3JjJ10uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBjb25zdCBvbGRTcmMgPSB0aGlzLl9yZW5kZXJlZFNyYztcbiAgICAgIHRoaXMudXBkYXRlU3JjQW5kU3Jjc2V0KHRydWUpO1xuICAgICAgY29uc3QgbmV3U3JjID0gdGhpcy5fcmVuZGVyZWRTcmM7XG4gICAgICBpZiAodGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCAmJiBvbGRTcmMgJiYgbmV3U3JjICYmIG9sZFNyYyAhPT0gbmV3U3JjKSB7XG4gICAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sY3BPYnNlcnZlcj8udXBkYXRlSW1hZ2Uob2xkU3JjLCBuZXdTcmMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNhbGxJbWFnZUxvYWRlcihjb25maWdXaXRob3V0Q3VzdG9tUGFyYW1zOiBPbWl0PEltYWdlTG9hZGVyQ29uZmlnLCAnbG9hZGVyUGFyYW1zJz4pOlxuICAgICAgc3RyaW5nIHtcbiAgICBsZXQgYXVnbWVudGVkQ29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZyA9IGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM7XG4gICAgaWYgKHRoaXMubG9hZGVyUGFyYW1zKSB7XG4gICAgICBhdWdtZW50ZWRDb25maWcubG9hZGVyUGFyYW1zID0gdGhpcy5sb2FkZXJQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmltYWdlTG9hZGVyKGF1Z21lbnRlZENvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLmxvYWRpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9hZGluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGlmICghdGhpcy5fcmVuZGVyZWRTcmMpIHtcbiAgICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMubmdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IHRoaXMuY2FsbEltYWdlTG9hZGVyKGltZ0NvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlZFNyYztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qgd2lkdGhTcmNTZXQgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHRoaXMubmdTcmNzZXQpO1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IHRoaXMubmdTcmNzZXQuc3BsaXQoJywnKS5maWx0ZXIoc3JjID0+IHNyYyAhPT0gJycpLm1hcChzcmNTdHIgPT4ge1xuICAgICAgc3JjU3RyID0gc3JjU3RyLnRyaW0oKTtcbiAgICAgIGNvbnN0IHdpZHRoID0gd2lkdGhTcmNTZXQgPyBwYXJzZUZsb2F0KHNyY1N0cikgOiBwYXJzZUZsb2F0KHNyY1N0cikgKiB0aGlzLndpZHRoITtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aH0pfSAke3NyY1N0cn1gO1xuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QXV0b21hdGljU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlc3BvbnNpdmVTcmNzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWRTcmNzZXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFJlc3BvbnNpdmVTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB7YnJlYWtwb2ludHN9ID0gdGhpcy5jb25maWc7XG5cbiAgICBsZXQgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzITtcbiAgICBpZiAodGhpcy5zaXplcz8udHJpbSgpID09PSAnMTAwdncnKSB7XG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgZnVsbC1zY3JlZW4td2lkdGggaW1hZ2UsIG91ciBzcmNzZXQgb25seSBuZWVkcyB0byBpbmNsdWRlXG4gICAgICAvLyBicmVha3BvaW50cyB3aXRoIGZ1bGwgdmlld3BvcnQgd2lkdGhzLlxuICAgICAgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzIS5maWx0ZXIoYnAgPT4gYnAgPj0gVklFV1BPUlRfQlJFQUtQT0lOVF9DVVRPRkYpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmFsU3JjcyA9IGZpbHRlcmVkQnJlYWtwb2ludHMubWFwKFxuICAgICAgICBicCA9PiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7c3JjOiB0aGlzLm5nU3JjLCB3aWR0aDogYnB9KX0gJHticH13YCk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTcmNBbmRTcmNzZXQoZm9yY2VTcmNSZWNhbGMgPSBmYWxzZSk6IHN0cmluZ3x1bmRlZmluZWQge1xuICAgIGlmIChmb3JjZVNyY1JlY2FsYykge1xuICAgICAgLy8gUmVzZXQgY2FjaGVkIHZhbHVlLCBzbyB0aGF0IHRoZSBmb2xsb3d1cCBgZ2V0UmV3cml0dGVuU3JjKClgIGNhbGxcbiAgICAgIC8vIHdpbGwgcmVjYWxjdWxhdGUgaXQgYW5kIHVwZGF0ZSB0aGUgY2FjaGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmV3cml0dGVuU3JjID0gdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyYycsIHJld3JpdHRlblNyYyk7XG5cbiAgICBsZXQgcmV3cml0dGVuU3Jjc2V0OiBzdHJpbmd8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldFJld3JpdHRlblNyY3NldCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaG91bGRHZW5lcmF0ZUF1dG9tYXRpY1NyY3NldCgpKSB7XG4gICAgICByZXdyaXR0ZW5TcmNzZXQgPSB0aGlzLmdldEF1dG9tYXRpY1NyY3NldCgpO1xuICAgIH1cblxuICAgIGlmIChyZXdyaXR0ZW5TcmNzZXQpIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3Jjc2V0JywgcmV3cml0dGVuU3Jjc2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJld3JpdHRlblNyY3NldDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Rml4ZWRTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSBERU5TSVRZX1NSQ1NFVF9NVUxUSVBMSUVSUy5tYXAobXVsdGlwbGllciA9PiBgJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiB0aGlzLm5nU3JjLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoISAqIG11bHRpcGxpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9ICR7bXVsdGlwbGllcn14YCk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRHZW5lcmF0ZUF1dG9tYXRpY1NyY3NldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuZGlzYWJsZU9wdGltaXplZFNyY3NldCAmJiAhdGhpcy5zcmNzZXQgJiYgdGhpcy5pbWFnZUxvYWRlciAhPT0gbm9vcEltYWdlTG9hZGVyICYmXG4gICAgICAgICEodGhpcy53aWR0aCEgPiBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgfHwgdGhpcy5oZWlnaHQhID4gRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVCk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZW5kZXJlZFNyYyAhPT0gbnVsbCAmJiB0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3JlbmRlcmVkU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8qKlxuICogU29ydHMgcHJvdmlkZWQgY29uZmlnIGJyZWFrcG9pbnRzIGFuZCB1c2VzIGRlZmF1bHRzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29uZmlnKGNvbmZpZzogSW1hZ2VDb25maWcpOiBJbWFnZUNvbmZpZyB7XG4gIGxldCBzb3J0ZWRCcmVha3BvaW50czoge2JyZWFrcG9pbnRzPzogbnVtYmVyW119ID0ge307XG4gIGlmIChjb25maWcuYnJlYWtwb2ludHMpIHtcbiAgICBzb3J0ZWRCcmVha3BvaW50cy5icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIElNQUdFX0NPTkZJR19ERUZBVUxUUywgY29uZmlnLCBzb3J0ZWRCcmVha3BvaW50cyk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY1xcYCBhbmQgXFxgbmdTcmNcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGBuZ1NyY1xcYC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY1xcYCBhdHRyaWJ1dGUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDU0VUX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gYm90aCBcXGBzcmNzZXRcXGAgYW5kIFxcYG5nU3Jjc2V0XFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3Jjc2V0XFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYCArXG4gICAgICAgICAgICBgXFxgbmdTcmNzZXRcXGAuIFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNzZXRcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCYXNlNjQtZW5jb2RlZCBpbWFnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKG5nU3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgbmdTcmMgPSBuZ1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYG5nU3JjXFxgIGlzIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nIGAgK1xuICAgICAgICAgICAgYCgke25nU3JjfSkuIE5nT3B0aW1pemVkSW1hZ2UgZG9lcyBub3Qgc3VwcG9ydCBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgICAgIGBieSByZW1vdmluZyBcXGBuZ1NyY1xcYCBhbmQgdXNpbmcgYSBzdGFuZGFyZCBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSAnc2l6ZXMnIG9ubHkgaW5jbHVkZXMgcmVzcG9uc2l2ZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29tcGxleFNpemVzKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgc2l6ZXMgPSBkaXIuc2l6ZXM7XG4gIGlmIChzaXplcz8ubWF0Y2goLygoXFwpfCwpXFxzfF4pXFxkK3B4LykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYHNpemVzXFxgIHdhcyBzZXQgdG8gYSBzdHJpbmcgaW5jbHVkaW5nIGAgK1xuICAgICAgICAgICAgYHBpeGVsIHZhbHVlcy4gRm9yIGF1dG9tYXRpYyBcXGBzcmNzZXRcXGAgZ2VuZXJhdGlvbiwgXFxgc2l6ZXNcXGAgbXVzdCBvbmx5IGluY2x1ZGUgcmVzcG9uc2l2ZSBgICtcbiAgICAgICAgICAgIGB2YWx1ZXMsIHN1Y2ggYXMgXFxgc2l6ZXM9XCI1MHZ3XCJcXGAgb3IgXFxgc2l6ZXM9XCIobWluLXdpZHRoOiA3NjhweCkgNTB2dywgMTAwdndcIlxcYC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIG1vZGlmeSB0aGUgXFxgc2l6ZXNcXGAgYXR0cmlidXRlLCBvciBwcm92aWRlIHlvdXIgb3duIFxcYG5nU3Jjc2V0XFxgIHZhbHVlIGRpcmVjdGx5LmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgbmdTcmMgPSBkaXIubmdTcmMudHJpbSgpO1xuICBpZiAobmdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGBuZ1NyY1xcYCB3YXMgc2V0IHRvIGEgYmxvYiBVUkwgKCR7bmdTcmN9KS4gYCArXG4gICAgICAgICAgICBgQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgbmdTcmNcXGAgYW5kIHVzaW5nIGEgcmVndWxhciBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBpbnB1dCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eUlucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICBpZiAoIWlzU3RyaW5nIHx8IGlzRW1wdHlTdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtuYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSBgICtcbiAgICAgICAgICAgIGAoXFxgJHt2YWx1ZX1cXGApLiBUbyBmaXggdGhpcywgY2hhbmdlIHRoZSB2YWx1ZSB0byBhIG5vbi1lbXB0eSBzdHJpbmcuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNzZXRgIGlzIGluIGEgdmFsaWQgZm9ybWF0LCBlLmcuIFwiMTAwdywgMjAwd1wiIG9yIFwiMXgsIDJ4XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZE5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgdmFsdWU6IHVua25vd24pIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybjtcbiAgYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXIsICduZ1NyY3NldCcsIHZhbHVlKTtcbiAgY29uc3Qgc3RyaW5nVmFsID0gdmFsdWUgYXMgc3RyaW5nO1xuICBjb25zdCBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuICBjb25zdCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IgPSBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcblxuICBpZiAoaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yKSB7XG4gICAgYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpciwgc3RyaW5nVmFsKTtcbiAgfVxuXG4gIGNvbnN0IGlzVmFsaWRTcmNzZXQgPSBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yIHx8IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcjtcbiAgaWYgKCFpc1ZhbGlkU3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke3ZhbHVlfVxcYCkuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBzdXBwbHkgXFxgbmdTcmNzZXRcXGAgdXNpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBvbmUgb3IgbW9yZSB3aWR0aCBgICtcbiAgICAgICAgICAgIGBkZXNjcmlwdG9ycyAoZS5nLiBcIjEwMHcsIDIwMHdcIikgb3IgZGVuc2l0eSBkZXNjcmlwdG9ycyAoZS5nLiBcIjF4LCAyeFwiKS5gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGNvbnN0IHVuZGVyRGVuc2l0eUNhcCA9XG4gICAgICB2YWx1ZS5zcGxpdCgnLCcpLmV2ZXJ5KG51bSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBjb250YWlucyBhbiB1bnN1cHBvcnRlZCBpbWFnZSBkZW5zaXR5OmAgK1xuICAgICAgICAgICAgYFxcYCR7dmFsdWV9XFxgLiBOZ09wdGltaXplZEltYWdlIGdlbmVyYWxseSByZWNvbW1lbmRzIGEgbWF4IGltYWdlIGRlbnNpdHkgb2YgYCArXG4gICAgICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCBidXQgc3VwcG9ydHMgaW1hZ2UgZGVuc2l0aWVzIHVwIHRvIGAgK1xuICAgICAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXguIFRoZSBodW1hbiBleWUgY2Fubm90IGRpc3Rpbmd1aXNoIGJldHdlZW4gaW1hZ2UgZGVuc2l0aWVzIGAgK1xuICAgICAgICAgICAgYGdyZWF0ZXIgdGhhbiAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IC0gd2hpY2ggbWFrZXMgdGhlbSB1bm5lY2Vzc2FyeSBmb3IgYCArXG4gICAgICAgICAgICBgbW9zdCB1c2UgY2FzZXMuIEltYWdlcyB0aGF0IHdpbGwgYmUgcGluY2gtem9vbWVkIGFyZSB0eXBpY2FsbHkgdGhlIHByaW1hcnkgdXNlIGNhc2UgZm9yIGAgK1xuICAgICAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXggaW1hZ2VzLiBQbGVhc2UgcmVtb3ZlIHRoZSBoaWdoIGRlbnNpdHkgZGVzY3JpcHRvciBhbmQgdHJ5IGFnYWluLmApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBSdW50aW1lRXJyb3JgIGluc3RhbmNlIHRvIHJlcHJlc2VudCBhIHNpdHVhdGlvbiB3aGVuIGFuIGlucHV0IGlzIHNldCBhZnRlclxuICogdGhlIGRpcmVjdGl2ZSBoYXMgaW5pdGlhbGl6ZWQuXG4gKi9cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICBsZXQgcmVhc29uITogc3RyaW5nO1xuICBpZiAoaW5wdXROYW1lID09PSAnd2lkdGgnIHx8IGlucHV0TmFtZSA9PT0gJ2hlaWdodCcpIHtcbiAgICByZWFzb24gPSBgQ2hhbmdpbmcgXFxgJHtpbnB1dE5hbWV9XFxgIG1heSByZXN1bHQgaW4gZGlmZmVyZW50IGF0dHJpYnV0ZSB2YWx1ZSBgICtcbiAgICAgICAgYGFwcGxpZWQgdG8gdGhlIHVuZGVybHlpbmcgaW1hZ2UgZWxlbWVudCBhbmQgY2F1c2UgbGF5b3V0IHNoaWZ0cyBvbiBhIHBhZ2UuYDtcbiAgfSBlbHNlIHtcbiAgICByZWFzb24gPSBgQ2hhbmdpbmcgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCB3b3VsZCBoYXZlIG5vIGVmZmVjdCBvbiB0aGUgdW5kZXJseWluZyBgICtcbiAgICAgICAgYGltYWdlIGVsZW1lbnQsIGJlY2F1c2UgdGhlIHJlc291cmNlIGxvYWRpbmcgaGFzIGFscmVhZHkgb2NjdXJyZWQuYDtcbiAgfVxuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7aW5wdXROYW1lfVxcYCB3YXMgdXBkYXRlZCBhZnRlciBpbml0aWFsaXphdGlvbi4gYCArXG4gICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS4gJHtyZWFzb259IGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgZWl0aGVyIHN3aXRjaCBcXGAke2lucHV0TmFtZX1cXGAgdG8gYSBzdGF0aWMgdmFsdWUgYCArXG4gICAgICAgICAgYG9yIHdyYXAgdGhlIGltYWdlIGVsZW1lbnQgaW4gYW4gKm5nSWYgdGhhdCBpcyBnYXRlZCBvbiB0aGUgbmVjZXNzYXJ5IHZhbHVlLmApO1xufVxuXG4vKipcbiAqIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMsIGlucHV0czogc3RyaW5nW10pIHtcbiAgaW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgIGNvbnN0IGlzVXBkYXRlZCA9IGNoYW5nZXMuaGFzT3duUHJvcGVydHkoaW5wdXQpO1xuICAgIGlmIChpc1VwZGF0ZWQgJiYgIWNoYW5nZXNbaW5wdXRdLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgaWYgKGlucHV0ID09PSAnbmdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGBuZ1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgbmdTcmNgIGlzIGFscmVhZHkgc2V0LiBXZSB1c2VcbiAgICAgICAgLy8gYG5nU3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7bmdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLlxuICovXG5mdW5jdGlvbiBhc3NlcnRHcmVhdGVyVGhhblplcm8oZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBjb25zdCB2YWxpZE51bWJlciA9IHR5cGVvZiBpbnB1dFZhbHVlID09PSAnbnVtYmVyJyAmJiBpbnB1dFZhbHVlID4gMDtcbiAgY29uc3QgdmFsaWRTdHJpbmcgPVxuICAgICAgdHlwZW9mIGlucHV0VmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoaW5wdXRWYWx1ZS50cmltKCkpICYmIHBhcnNlSW50KGlucHV0VmFsdWUpID4gMDtcbiAgaWYgKCF2YWxpZE51bWJlciAmJiAhdmFsaWRTdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBcXGAke2lucHV0TmFtZX1cXGAgYXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IHJlbW92ZUxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGltZyk7XG4gICAgbGV0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSk7XG4gICAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcbiAgICBjb25zdCBib3hTaXppbmcgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2JveC1zaXppbmcnKTtcblxuICAgIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdSaWdodCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpO1xuICAgICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1ib3R0b20nKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdMZWZ0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKTtcbiAgICAgIHJlbmRlcmVkV2lkdGggLT0gcGFyc2VGbG9hdChwYWRkaW5nUmlnaHQpICsgcGFyc2VGbG9hdChwYWRkaW5nTGVmdCk7XG4gICAgICByZW5kZXJlZEhlaWdodCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChwYWRkaW5nQm90dG9tKTtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBpbWcubmF0dXJhbFdpZHRoO1xuICAgIGNvbnN0IGludHJpbnNpY0hlaWdodCA9IGltZy5uYXR1cmFsSGVpZ2h0O1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPSBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuXG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIGltYWdlIGRvZXMgbm90IG1hdGNoIGAgK1xuICAgICAgICAgICAgICBgdGhlIGFzcGVjdCByYXRpbyBpbmRpY2F0ZWQgYnkgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICByb3VuZChpbnRyaW5zaWNBc3BlY3RSYXRpbyl9KS4gXFxuU3VwcGxpZWQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzOiBgICtcbiAgICAgICAgICAgICAgYCR7c3VwcGxpZWRXaWR0aH13IHggJHtzdXBwbGllZEhlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICByb3VuZChzdXBwbGllZEFzcGVjdFJhdGlvKX0pLiBgICtcbiAgICAgICAgICAgICAgYFxcblRvIGZpeCB0aGlzLCB1cGRhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy5gKSk7XG4gICAgfSBlbHNlIGlmIChzdHlsaW5nRGlzdG9ydGlvbikge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBgICtcbiAgICAgICAgICAgICAgYGRvZXMgbm90IG1hdGNoIHRoZSBpbWFnZSdzIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIGAgK1xuICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKGludHJpbnNpY0FzcGVjdFJhdGlvKX0pLiBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiBgICtcbiAgICAgICAgICAgICAgYCR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oIChhc3BlY3QtcmF0aW86IGAgK1xuICAgICAgICAgICAgICBgJHtyb3VuZChyZW5kZXJlZEFzcGVjdFJhdGlvKX0pLiBcXG5UaGlzIGlzc3VlIGNhbiBvY2N1ciBpZiBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYCArXG4gICAgICAgICAgICAgIGBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhbiBpbWFnZSB3aXRob3V0IHVwZGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nIGAgK1xuICAgICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgICAgYGFkZGluZyBcImhlaWdodDogYXV0b1wiIG9yIFwid2lkdGg6IGF1dG9cIiB0byB0aGUgaW1hZ2Ugc3R5bGluZyB3aWxsIGZpeCBgICtcbiAgICAgICAgICAgICAgYHRoaXMgaXNzdWUuYCkpO1xuICAgIH0gZWxzZSBpZiAoIWRpci5uZ1NyY3NldCAmJiBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zKSB7XG4gICAgICAvLyBJZiBgbmdTcmNzZXRgIGhhc24ndCBiZWVuIHNldCwgc2FuaXR5IGNoZWNrIHRoZSBpbnRyaW5zaWMgc2l6ZS5cbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZFdpZHRoO1xuICAgICAgY29uc3QgcmVjb21tZW5kZWRIZWlnaHQgPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZEhlaWdodDtcbiAgICAgIGNvbnN0IG92ZXJzaXplZFdpZHRoID0gKGludHJpbnNpY1dpZHRoIC0gcmVjb21tZW5kZWRXaWR0aCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGNvbnN0IG92ZXJzaXplZEhlaWdodCA9IChpbnRyaW5zaWNIZWlnaHQgLSByZWNvbW1lbmRlZEhlaWdodCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGlmIChvdmVyc2l6ZWRXaWR0aCB8fCBvdmVyc2l6ZWRIZWlnaHQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX0lNQUdFLFxuICAgICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaW50cmluc2ljIGltYWdlIGlzIHNpZ25pZmljYW50bHkgYCArXG4gICAgICAgICAgICAgICAgYGxhcmdlciB0aGFuIG5lY2Vzc2FyeS4gYCArXG4gICAgICAgICAgICAgICAgYFxcblJlbmRlcmVkIGltYWdlIHNpemU6ICR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtyZWNvbW1lbmRlZFdpZHRofXcgeCAke1xuICAgICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuTm90ZTogUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemUgaXMgY2FsY3VsYXRlZCBhc3N1bWluZyBhIG1heGltdW0gRFBSIG9mIGAgK1xuICAgICAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH0uIFRvIGltcHJvdmUgbG9hZGluZyB0aW1lLCByZXNpemUgdGhlIGltYWdlIGAgK1xuICAgICAgICAgICAgICAgIGBvciBjb25zaWRlciB1c2luZyB0aGUgXCJuZ1NyY3NldFwiIGFuZCBcInNpemVzXCIgYXR0cmlidXRlcy5gKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG1pc3NpbmdBdHRyaWJ1dGVzID0gW107XG4gIGlmIChkaXIud2lkdGggPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnd2lkdGgnKTtcbiAgaWYgKGRpci5oZWlnaHQgPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnaGVpZ2h0Jyk7XG4gIGlmIChtaXNzaW5nQXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZXNlIHJlcXVpcmVkIGF0dHJpYnV0ZXMgYCArXG4gICAgICAgICAgICBgYXJlIG1pc3Npbmc6ICR7bWlzc2luZ0F0dHJpYnV0ZXMubWFwKGF0dHIgPT4gYFwiJHthdHRyfVwiYCkuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgICAgYEluY2x1ZGluZyBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyB3aWxsIHByZXZlbnQgaW1hZ2UtcmVsYXRlZCBsYXlvdXQgc2hpZnRzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgaW5jbHVkZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyBvbiB0aGUgaW1hZ2UgdGFnIG9yIHR1cm4gb24gYCArXG4gICAgICAgICAgICBgXCJmaWxsXCIgbW9kZSB3aXRoIHRoZSBcXGBmaWxsXFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgd2lkdGggYW5kIGhlaWdodCBhcmUgbm90IHNldC4gVXNlZCBpbiBmaWxsIG1vZGUsIHdoZXJlIHRob3NlIGF0dHJpYnV0ZXMgZG9uJ3QgbWFrZVxuICogc2Vuc2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIud2lkdGggfHwgZGlyLmhlaWdodCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5uZ1NyYyl9IHRoZSBhdHRyaWJ1dGVzIFxcYGhlaWdodFxcYCBhbmQvb3IgXFxgd2lkdGhcXGAgYXJlIHByZXNlbnQgYCArXG4gICAgICAgICAgICBgYWxvbmcgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuIEJlY2F1c2UgXFxgZmlsbFxcYCBtb2RlIGNhdXNlcyBhbiBpbWFnZSB0byBmaWxsIGl0cyBjb250YWluaW5nIGAgK1xuICAgICAgICAgICAgYGVsZW1lbnQsIHRoZSBzaXplIGF0dHJpYnV0ZXMgaGF2ZSBubyBlZmZlY3QgYW5kIHNob3VsZCBiZSByZW1vdmVkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgcmVuZGVyZWQgaW1hZ2UgaGFzIGEgbm9uemVybyBoZWlnaHQuIElmIHRoZSBpbWFnZSBpcyBpbiBmaWxsIG1vZGUsIHByb3ZpZGVzXG4gKiBndWlkYW5jZSB0aGF0IHRoaXMgY2FuIGJlIGNhdXNlZCBieSB0aGUgY29udGFpbmluZyBlbGVtZW50J3MgQ1NTIHBvc2l0aW9uIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25aZXJvUmVuZGVyZWRIZWlnaHQoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHJlbmRlcmVyOiBSZW5kZXJlcjIpIHtcbiAgY29uc3QgcmVtb3ZlTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCByZW5kZXJlZEhlaWdodCA9IGltZy5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKGRpci5maWxsICYmIHJlbmRlcmVkSGVpZ2h0ID09PSAwKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBoZWlnaHQgb2YgdGhlIGZpbGwtbW9kZSBpbWFnZSBpcyB6ZXJvLiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgbGlrZWx5IGJlY2F1c2UgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgICAgYHByb3BlcnR5IHNldCB0byBvbmUgb2YgdGhlIGZvbGxvd2luZzogXCJyZWxhdGl2ZVwiLCBcImZpeGVkXCIsIG9yIFwiYWJzb2x1dGVcIi4gYCArXG4gICAgICAgICAgICAgIGBUbyBmaXggdGhpcyBwcm9ibGVtLCBtYWtlIHN1cmUgdGhlIGNvbnRhaW5lciBlbGVtZW50IGhhcyB0aGUgQ1NTICdwb3NpdGlvbicgYCArXG4gICAgICAgICAgICAgIGBwcm9wZXJ0eSBkZWZpbmVkIGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50IGlzIG5vdCB6ZXJvLmApKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBsb2FkaW5nYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGEgdmFsaWQgaW5wdXQgJlxuICogaXMgbm90IHVzZWQgb24gcHJpb3JpdHkgaW1hZ2VzLlxuICovXG5mdW5jdGlvbiBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5sb2FkaW5nICYmIGRpci5wcmlvcml0eSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgd2FzIHVzZWQgb24gYW4gaW1hZ2UgdGhhdCB3YXMgbWFya2VkIFwicHJpb3JpdHlcIi4gYCArXG4gICAgICAgICAgICBgU2V0dGluZyBcXGBsb2FkaW5nXFxgIG9uIHByaW9yaXR5IGltYWdlcyBpcyBub3QgYWxsb3dlZCBgICtcbiAgICAgICAgICAgIGBiZWNhdXNlIHRoZXNlIGltYWdlcyB3aWxsIGFsd2F5cyBiZSBlYWdlcmx5IGxvYWRlZC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHJlbW92ZSB0aGUg4oCcbG9hZGluZ+KAnSBhdHRyaWJ1dGUgZnJvbSB0aGUgcHJpb3JpdHkgaW1hZ2UuYCk7XG4gIH1cbiAgY29uc3QgdmFsaWRJbnB1dHMgPSBbJ2F1dG8nLCAnZWFnZXInLCAnbGF6eSddO1xuICBpZiAodHlwZW9mIGRpci5sb2FkaW5nID09PSAnc3RyaW5nJyAmJiAhdmFsaWRJbnB1dHMuaW5jbHVkZXMoZGlyLmxvYWRpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHtkaXIubG9hZGluZ31cXGApLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIHZhbGlkIHZhbHVlIChcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIikuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBOT1QgdXNpbmcgYSBsb2FkZXIgKGZhbGxpbmcgYmFjayB0byB0aGUgZ2VuZXJpYyBsb2FkZXIpIGFuZFxuICogdGhlIGltYWdlIGFwcGVhcnMgdG8gYmUgaG9zdGVkIG9uIG9uZSBvZiB0aGUgaW1hZ2UgQ0ROcyBmb3Igd2hpY2hcbiAqIHdlIGRvIGhhdmUgYSBidWlsdC1pbiBpbWFnZSBsb2FkZXIuIFN1Z2dlc3RzIHN3aXRjaGluZyB0byB0aGVcbiAqIGJ1aWx0LWluIGxvYWRlci5cbiAqXG4gKiBAcGFyYW0gbmdTcmMgVmFsdWUgb2YgdGhlIG5nU3JjIGF0dHJpYnV0ZVxuICogQHBhcmFtIGltYWdlTG9hZGVyIEltYWdlTG9hZGVyIHByb3ZpZGVkXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdE1pc3NpbmdCdWlsdEluTG9hZGVyKG5nU3JjOiBzdHJpbmcsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGxldCBidWlsdEluTG9hZGVyTmFtZSA9ICcnO1xuICAgIGZvciAoY29uc3QgbG9hZGVyIG9mIEJVSUxUX0lOX0xPQURFUlMpIHtcbiAgICAgIGlmIChsb2FkZXIudGVzdFVybChuZ1NyYykpIHtcbiAgICAgICAgYnVpbHRJbkxvYWRlck5hbWUgPSBsb2FkZXIubmFtZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChidWlsdEluTG9hZGVyTmFtZSkge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfQlVJTFRJTl9MT0FERVIsXG4gICAgICAgICAgYE5nT3B0aW1pemVkSW1hZ2U6IEl0IGxvb2tzIGxpa2UgeW91ciBpbWFnZXMgbWF5IGJlIGhvc3RlZCBvbiB0aGUgYCArXG4gICAgICAgICAgICAgIGAke2J1aWx0SW5Mb2FkZXJOYW1lfSBDRE4sIGJ1dCB5b3VyIGFwcCBpcyBub3QgdXNpbmcgQW5ndWxhcidzIGAgK1xuICAgICAgICAgICAgICBgYnVpbHQtaW4gbG9hZGVyIGZvciB0aGF0IENETi4gV2UgcmVjb21tZW5kIHN3aXRjaGluZyB0byB1c2UgYCArXG4gICAgICAgICAgICAgIGB0aGUgYnVpbHQtaW4gYnkgY2FsbGluZyBcXGBwcm92aWRlJHtidWlsdEluTG9hZGVyTmFtZX1Mb2FkZXIoKVxcYCBgICtcbiAgICAgICAgICAgICAgYGluIHlvdXIgXFxgcHJvdmlkZXJzXFxgIGFuZCBwYXNzaW5nIGl0IHlvdXIgaW5zdGFuY2UncyBiYXNlIFVSTC4gYCArXG4gICAgICAgICAgICAgIGBJZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGJ1aWx0LWluIGxvYWRlciwgZGVmaW5lIGEgY3VzdG9tIGAgK1xuICAgICAgICAgICAgICBgbG9hZGVyIGZ1bmN0aW9uIHVzaW5nIElNQUdFX0xPQURFUiB0byBzaWxlbmNlIHRoaXMgd2FybmluZy5gKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgbmdTcmNzZXQgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLm5nU3Jjc2V0ICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgYXR0cmlidXRlIGlzIHByZXNlbnQgYnV0IGAgK1xuICAgICAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgICAgICBgd2hpY2ggd291bGQgcmVzdWx0IGluIHRoZSBzYW1lIGltYWdlIGJlaW5nIHVzZWQgZm9yIGFsbCBjb25maWd1cmVkIHNpemVzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBsb2FkZXJQYXJhbXMgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nXG4gKiB1c2VkKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Mb2FkZXJQYXJhbXNXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIubG9hZGVyUGFyYW1zICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICAgICAgYHdoaWNoIG1lYW5zIHRoYXQgdGhlIGxvYWRlclBhcmFtcyBkYXRhIHdpbGwgbm90IGJlIGNvbnN1bWVkIGFuZCB3aWxsIG5vdCBhZmZlY3QgdGhlIFVSTC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBjdXN0b20gbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gKSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiByb3VuZChpbnB1dDogbnVtYmVyKTogbnVtYmVyfHN0cmluZyB7XG4gIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSA/IGlucHV0IDogaW5wdXQudG9GaXhlZCgyKTtcbn1cblxuLy8gVHJhbnNmb3JtIGZ1bmN0aW9uIHRvIGhhbmRsZSBTYWZlVmFsdWUgaW5wdXQgZm9yIG5nU3JjLiBUaGlzIGRvZXNuJ3QgZG8gYW55IHNhbml0aXphdGlvbixcbi8vIGFzIHRoYXQgaXMgbm90IG5lZWRlZCBmb3IgaW1nLnNyYyBhbmQgaW1nLnNyY3NldC4gVGhpcyB0cmFuc2Zvcm0gaXMgcHVyZWx5IGZvciBjb21wYXRpYmlsaXR5LlxuZnVuY3Rpb24gdW53cmFwU2FmZVVybCh2YWx1ZTogc3RyaW5nfFNhZmVWYWx1ZSk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiB1bndyYXBTYWZlVmFsdWUodmFsdWUpO1xufVxuIl19