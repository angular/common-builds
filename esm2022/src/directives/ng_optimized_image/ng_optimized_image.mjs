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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-next.7+sha-0ec66b8", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.0.0-next.7+sha-0ec66b8", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0px\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-next.7+sha-0ec66b8", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBZ0MsV0FBVyxFQUFFLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBK0IsYUFBYSxJQUFJLFlBQVksRUFBMkIsZ0JBQWdCLElBQUksZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2xiLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRW5ELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxZQUFZLEVBQWtDLGVBQWUsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzNHLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQzs7QUFFMUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIs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Q2Q7SUFDRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Ym9vbGVhbkF0dHJpYnV0ZSwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBpbmplY3QsIEluamVjdG9yLCBJbnB1dCwgTmdab25lLCBudW1iZXJBdHRyaWJ1dGUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFBMQVRGT1JNX0lELCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXMsIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVJTUFHRV9DT05GSUcgYXMgSU1BR0VfQ09ORklHLCDJtUlNQUdFX0NPTkZJR19ERUZBVUxUUyBhcyBJTUFHRV9DT05GSUdfREVGQVVMVFMsIMm1SW1hZ2VDb25maWcgYXMgSW1hZ2VDb25maWcsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvciwgybVTYWZlVmFsdWUgYXMgU2FmZVZhbHVlLCDJtXVud3JhcFNhZmVWYWx1ZSBhcyB1bndyYXBTYWZlVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJy4uLy4uL3BsYXRmb3JtX2lkJztcblxuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2Nsb3VkaW5hcnlMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXInO1xuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyLCBJbWFnZUxvYWRlckNvbmZpZywgbm9vcEltYWdlTG9hZGVyfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7aW1hZ2VLaXRMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VraXRfbG9hZGVyJztcbmltcG9ydCB7aW1naXhMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1naXhfbG9hZGVyJztcbmltcG9ydCB7TENQSW1hZ2VPYnNlcnZlcn0gZnJvbSAnLi9sY3BfaW1hZ2Vfb2JzZXJ2ZXInO1xuaW1wb3J0IHtQcmVjb25uZWN0TGlua0NoZWNrZXJ9IGZyb20gJy4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtQcmVsb2FkTGlua0NyZWF0b3J9IGZyb20gJy4vcHJlbG9hZC1saW5rLWNyZWF0b3InO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgd2lkdGggZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMTAwdywgMjAwd1wiLlxuICovXG5jb25zdCBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkK3dcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMXgsIDJ4LCA1MHhcIi4gQWxzbyBzdXBwb3J0cyBkZWNpbWFscyBsaWtlIFwiMS41eCwgMS41MHhcIi5cbiAqL1xuY29uc3QgVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkKyhcXC5cXGQrKT94XFxzKigsfCQpKXsxLH0pJC87XG5cbi8qKlxuICogU3Jjc2V0IHZhbHVlcyB3aXRoIGEgZGVuc2l0eSBkZXNjcmlwdG9yIGhpZ2hlciB0aGFuIHRoaXMgdmFsdWUgd2lsbCBhY3RpdmVseVxuICogdGhyb3cgYW4gZXJyb3IuIFN1Y2ggZGVuc2l0aWVzIGFyZSBub3QgcGVybWl0dGVkIGFzIHRoZXkgY2F1c2UgaW1hZ2Ugc2l6ZXNcbiAqIHRvIGJlIHVucmVhc29uYWJseSBsYXJnZSBhbmQgc2xvdyBkb3duIExDUC5cbiAqL1xuZXhwb3J0IGNvbnN0IEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUCA9IDM7XG5cbi8qKlxuICogVXNlZCBvbmx5IGluIGVycm9yIG1lc3NhZ2UgdGV4dCB0byBjb21tdW5pY2F0ZSBiZXN0IHByYWN0aWNlcywgYXMgd2Ugd2lsbFxuICogb25seSB0aHJvdyBiYXNlZCBvbiB0aGUgc2xpZ2h0bHkgbW9yZSBjb25zZXJ2YXRpdmUgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQLlxuICovXG5leHBvcnQgY29uc3QgUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMjtcblxuLyoqXG4gKiBVc2VkIGluIGdlbmVyYXRpbmcgYXV0b21hdGljIGRlbnNpdHktYmFzZWQgc3Jjc2V0c1xuICovXG5jb25zdCBERU5TSVRZX1NSQ1NFVF9NVUxUSVBMSUVSUyA9IFsxLCAyXTtcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGljaCBicmVha3BvaW50cyB0byB1c2Ugb24gZnVsbC13aWR0aCBpbWFnZXNcbiAqL1xuY29uc3QgVklFV1BPUlRfQlJFQUtQT0lOVF9DVVRPRkYgPSA2NDA7XG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFzcGVjdCByYXRpb3MgYXJlIHNpbWlsYXIgaW4gdmFsdWUuXG4gKi9cbmNvbnN0IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0UgPSAuMTtcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBpbWFnZSBoYXMgYmVlbiByZXF1ZXN0ZWQgYXQgYW4gb3Zlcmx5XG4gKiBsYXJnZSBzaXplIGNvbXBhcmVkIHRvIHRoZSBhY3R1YWwgcmVuZGVyZWQgaW1hZ2Ugc2l6ZSAoYWZ0ZXIgdGFraW5nXG4gKiBpbnRvIGFjY291bnQgYSB0eXBpY2FsIGRldmljZSBwaXhlbCByYXRpbykuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRSA9IDEwMDA7XG5cbi8qKlxuICogVXNlZCB0byBsaW1pdCBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gb2YgdmVyeSBsYXJnZSBzb3VyY2VzIGZvclxuICogZml4ZWQtc2l6ZSBpbWFnZXMuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgRklYRURfU1JDU0VUX1dJRFRIX0xJTUlUID0gMTkyMDtcbmNvbnN0IEZJWEVEX1NSQ1NFVF9IRUlHSFRfTElNSVQgPSAxMDgwO1xuXG5cbi8qKiBJbmZvIGFib3V0IGJ1aWx0LWluIGxvYWRlcnMgd2UgY2FuIHRlc3QgZm9yLiAqL1xuZXhwb3J0IGNvbnN0IEJVSUxUX0lOX0xPQURFUlMgPSBbaW1naXhMb2FkZXJJbmZvLCBpbWFnZUtpdExvYWRlckluZm8sIGNsb3VkaW5hcnlMb2FkZXJJbmZvXTtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdGhhdCBpbXByb3ZlcyBpbWFnZSBsb2FkaW5nIHBlcmZvcm1hbmNlIGJ5IGVuZm9yY2luZyBiZXN0IHByYWN0aWNlcy5cbiAqXG4gKiBgTmdPcHRpbWl6ZWRJbWFnZWAgZW5zdXJlcyB0aGF0IHRoZSBsb2FkaW5nIG9mIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgaW1hZ2UgaXNcbiAqIHByaW9yaXRpemVkIGJ5OlxuICogLSBBdXRvbWF0aWNhbGx5IHNldHRpbmcgdGhlIGBmZXRjaHByaW9yaXR5YCBhdHRyaWJ1dGUgb24gdGhlIGA8aW1nPmAgdGFnXG4gKiAtIExhenkgbG9hZGluZyBub24tcHJpb3JpdHkgaW1hZ2VzIGJ5IGRlZmF1bHRcbiAqIC0gQXNzZXJ0aW5nIHRoYXQgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIHByZWNvbm5lY3QgbGluayB0YWcgaW4gdGhlIGRvY3VtZW50IGhlYWRcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIGRpcmVjdGl2ZTpcbiAqIC0gR2VuZXJhdGVzIGFwcHJvcHJpYXRlIGFzc2V0IFVSTHMgaWYgYSBjb3JyZXNwb25kaW5nIGBJbWFnZUxvYWRlcmAgZnVuY3Rpb24gaXMgcHJvdmlkZWRcbiAqIC0gQXV0b21hdGljYWxseSBnZW5lcmF0ZXMgYSBzcmNzZXRcbiAqIC0gUmVxdWlyZXMgdGhhdCBgd2lkdGhgIGFuZCBgaGVpZ2h0YCBhcmUgc2V0XG4gKiAtIFdhcm5zIGlmIGB3aWR0aGAgb3IgYGhlaWdodGAgaGF2ZSBiZWVuIHNldCBpbmNvcnJlY3RseVxuICogLSBXYXJucyBpZiB0aGUgaW1hZ2Ugd2lsbCBiZSB2aXN1YWxseSBkaXN0b3J0ZWQgd2hlbiByZW5kZXJlZFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBpcyBtYXJrZWQgYXMgW3N0YW5kYWxvbmVdKGd1aWRlL3N0YW5kYWxvbmUtY29tcG9uZW50cykgYW5kIGNhblxuICogYmUgaW1wb3J0ZWQgZGlyZWN0bHkuXG4gKlxuICogRm9sbG93IHRoZSBzdGVwcyBiZWxvdyB0byBlbmFibGUgYW5kIHVzZSB0aGUgZGlyZWN0aXZlOlxuICogMS4gSW1wb3J0IGl0IGludG8gdGhlIG5lY2Vzc2FyeSBOZ01vZHVsZSBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50LlxuICogMi4gT3B0aW9uYWxseSBwcm92aWRlIGFuIGBJbWFnZUxvYWRlcmAgaWYgeW91IHVzZSBhbiBpbWFnZSBob3N0aW5nIHNlcnZpY2UuXG4gKiAzLiBVcGRhdGUgdGhlIG5lY2Vzc2FyeSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIGFuZCByZXBsYWNlIGBzcmNgIGF0dHJpYnV0ZXMgd2l0aCBgbmdTcmNgLlxuICogVXNpbmcgYSBgbmdTcmNgIGFsbG93cyB0aGUgZGlyZWN0aXZlIHRvIGNvbnRyb2wgd2hlbiB0aGUgYHNyY2AgZ2V0cyBzZXQsIHdoaWNoIHRyaWdnZXJzIGFuIGltYWdlXG4gKiBkb3dubG9hZC5cbiAqXG4gKiBTdGVwIDE6IGltcG9ydCB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBOZ09wdGltaXplZEltYWdlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbiAqXG4gKiAvLyBJbmNsdWRlIGl0IGludG8gdGhlIG5lY2Vzc2FyeSBOZ01vZHVsZVxuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxuICogfSlcbiAqIGNsYXNzIEFwcE1vZHVsZSB7fVxuICpcbiAqIC8vIC4uLiBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc3RhbmRhbG9uZTogdHJ1ZVxuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgTXlTdGFuZGFsb25lQ29tcG9uZW50IHt9XG4gKiBgYGBcbiAqXG4gKiBTdGVwIDI6IGNvbmZpZ3VyZSBhIGxvYWRlci5cbiAqXG4gKiBUbyB1c2UgdGhlICoqZGVmYXVsdCBsb2FkZXIqKjogbm8gYWRkaXRpb25hbCBjb2RlIGNoYW5nZXMgYXJlIG5lY2Vzc2FyeS4gVGhlIFVSTCByZXR1cm5lZCBieSB0aGVcbiAqIGdlbmVyaWMgbG9hZGVyIHdpbGwgYWx3YXlzIG1hdGNoIHRoZSB2YWx1ZSBvZiBcInNyY1wiLiBJbiBvdGhlciB3b3JkcywgdGhpcyBsb2FkZXIgYXBwbGllcyBub1xuICogdHJhbnNmb3JtYXRpb25zIHRvIHRoZSByZXNvdXJjZSBVUkwgYW5kIHRoZSB2YWx1ZSBvZiB0aGUgYG5nU3JjYCBhdHRyaWJ1dGUgd2lsbCBiZSB1c2VkIGFzIGlzLlxuICpcbiAqIFRvIHVzZSBhbiBleGlzdGluZyBsb2FkZXIgZm9yIGEgKip0aGlyZC1wYXJ0eSBpbWFnZSBzZXJ2aWNlKio6IGFkZCB0aGUgcHJvdmlkZXIgZmFjdG9yeSBmb3IgeW91clxuICogY2hvc2VuIHNlcnZpY2UgdG8gdGhlIGBwcm92aWRlcnNgIGFycmF5LiBJbiB0aGUgZXhhbXBsZSBiZWxvdywgdGhlIEltZ2l4IGxvYWRlciBpcyB1c2VkOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7cHJvdmlkZUltZ2l4TG9hZGVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENhbGwgdGhlIGZ1bmN0aW9uIGFuZCBhZGQgdGhlIHJlc3VsdCB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXk6XG4gKiBwcm92aWRlcnM6IFtcbiAqICAgcHJvdmlkZUltZ2l4TG9hZGVyKFwiaHR0cHM6Ly9teS5iYXNlLnVybC9cIiksXG4gKiBdLFxuICogYGBgXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUgcHJvdmlkZXMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gKiAtIGBwcm92aWRlQ2xvdWRmbGFyZUxvYWRlcmBcbiAqIC0gYHByb3ZpZGVDbG91ZGluYXJ5TG9hZGVyYFxuICogLSBgcHJvdmlkZUltYWdlS2l0TG9hZGVyYFxuICogLSBgcHJvdmlkZUltZ2l4TG9hZGVyYFxuICpcbiAqIElmIHlvdSB1c2UgYSBkaWZmZXJlbnQgaW1hZ2UgcHJvdmlkZXIsIHlvdSBjYW4gY3JlYXRlIGEgY3VzdG9tIGxvYWRlciBmdW5jdGlvbiBhcyBkZXNjcmliZWRcbiAqIGJlbG93LlxuICpcbiAqIFRvIHVzZSBhICoqY3VzdG9tIGxvYWRlcioqOiBwcm92aWRlIHlvdXIgbG9hZGVyIGZ1bmN0aW9uIGFzIGEgdmFsdWUgZm9yIHRoZSBgSU1BR0VfTE9BREVSYCBESVxuICogdG9rZW4uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIENvbmZpZ3VyZSB0aGUgbG9hZGVyIHVzaW5nIHRoZSBgSU1BR0VfTE9BREVSYCB0b2tlbi5cbiAqIHByb3ZpZGVyczogW1xuICogICB7XG4gKiAgICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAqICAgICAgdXNlVmFsdWU6IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiB7XG4gKiAgICAgICAgcmV0dXJuIGBodHRwczovL2V4YW1wbGUuY29tLyR7Y29uZmlnLnNyY30tJHtjb25maWcud2lkdGh9LmpwZ31gO1xuICogICAgICB9XG4gKiAgIH0sXG4gKiBdLFxuICogYGBgXG4gKlxuICogU3RlcCAzOiB1cGRhdGUgYDxpbWc+YCB0YWdzIGluIHRlbXBsYXRlcyB0byB1c2UgYG5nU3JjYCBpbnN0ZWFkIG9mIGBzcmNgLlxuICpcbiAqIGBgYFxuICogPGltZyBuZ1NyYz1cImxvZ28ucG5nXCIgd2lkdGg9XCIyMDBcIiBoZWlnaHQ9XCIxMDBcIj5cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnaW1nW25nU3JjXScsXG4gIGhvc3Q6IHtcbiAgICAnW3N0eWxlLnBvc2l0aW9uXSc6ICdmaWxsID8gXCJhYnNvbHV0ZVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS53aWR0aF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5oZWlnaHRdJzogJ2ZpbGwgPyBcIjEwMCVcIiA6IG51bGwnLFxuICAgICdbc3R5bGUuaW5zZXRdJzogJ2ZpbGwgPyBcIjBweFwiIDogbnVsbCdcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaW1hZ2VMb2FkZXIgPSBpbmplY3QoSU1BR0VfTE9BREVSKTtcbiAgcHJpdmF0ZSBjb25maWc6IEltYWdlQ29uZmlnID0gcHJvY2Vzc0NvbmZpZyhpbmplY3QoSU1BR0VfQ09ORklHKSk7XG4gIHByaXZhdGUgcmVuZGVyZXIgPSBpbmplY3QoUmVuZGVyZXIyKTtcbiAgcHJpdmF0ZSBpbWdFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50ID0gaW5qZWN0KEVsZW1lbnRSZWYpLm5hdGl2ZUVsZW1lbnQ7XG4gIHByaXZhdGUgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuICBwcml2YXRlIHJlYWRvbmx5IGlzU2VydmVyID0gaXNQbGF0Zm9ybVNlcnZlcihpbmplY3QoUExBVEZPUk1fSUQpKTtcbiAgcHJpdmF0ZSByZWFkb25seSBwcmVsb2FkTGlua0NyZWF0b3IgPSBpbmplY3QoUHJlbG9hZExpbmtDcmVhdG9yKTtcblxuICAvLyBhIExDUCBpbWFnZSBvYnNlcnZlciAtIHNob3VsZCBiZSBpbmplY3RlZCBvbmx5IGluIHRoZSBkZXYgbW9kZVxuICBwcml2YXRlIGxjcE9ic2VydmVyID0gbmdEZXZNb2RlID8gdGhpcy5pbmplY3Rvci5nZXQoTENQSW1hZ2VPYnNlcnZlcikgOiBudWxsO1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHJld3JpdHRlbiBgc3JjYCBvbmNlIGFuZCBzdG9yZSBpdC5cbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgcmVwZXRpdGl2ZSBjYWxjdWxhdGlvbnMgYW5kIG1ha2Ugc3VyZSB0aGUgZGlyZWN0aXZlIGNsZWFudXAgaW4gdGhlXG4gICAqIGBuZ09uRGVzdHJveWAgZG9lcyBub3QgcmVseSBvbiB0aGUgYElNQUdFX0xPQURFUmAgbG9naWMgKHdoaWNoIGluIHR1cm4gY2FuIHJlbHkgb24gc29tZSBvdGhlclxuICAgKiBpbnN0YW5jZSB0aGF0IG1pZ2h0IGJlIGFscmVhZHkgZGVzdHJveWVkKS5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlcmVkU3JjOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIHNvdXJjZSBpbWFnZS5cbiAgICogSW1hZ2UgbmFtZSB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGFuZCB0aGUgZmluYWwgVVJMIHdpbGwgYmUgYXBwbGllZCBhcyB0aGUgYHNyY2BcbiAgICogcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKi9cbiAgQElucHV0KHtyZXF1aXJlZDogdHJ1ZSwgdHJhbnNmb3JtOiB1bndyYXBTYWZlVXJsfSkgbmdTcmMhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAgICogVGhlIGltYWdlIG5hbWUgd2lsbCBiZSB0YWtlbiBmcm9tIGBuZ1NyY2AgYW5kIGNvbWJpbmVkIHdpdGggdGhlIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eVxuICAgKiBkZXNjcmlwdG9ycyB0byBnZW5lcmF0ZSB0aGUgZmluYWwgYHNyY3NldGAgcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiBgYGBcbiAgICogPGltZyBuZ1NyYz1cImhlbGxvLmpwZ1wiIG5nU3Jjc2V0PVwiMTAwdywgMjAwd1wiIC8+ICA9PlxuICAgKiA8aW1nIHNyYz1cInBhdGgvaGVsbG8uanBnXCIgc3Jjc2V0PVwicGF0aC9oZWxsby5qcGc/dz0xMDAgMTAwdywgcGF0aC9oZWxsby5qcGc/dz0yMDAgMjAwd1wiIC8+XG4gICAqIGBgYFxuICAgKi9cbiAgQElucHV0KCkgbmdTcmNzZXQhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBiYXNlIGBzaXplc2AgYXR0cmlidXRlIHBhc3NlZCB0aHJvdWdoIHRvIHRoZSBgPGltZz5gIGVsZW1lbnQuXG4gICAqIFByb3ZpZGluZyBzaXplcyBjYXVzZXMgdGhlIGltYWdlIHRvIGNyZWF0ZSBhbiBhdXRvbWF0aWMgcmVzcG9uc2l2ZSBzcmNzZXQuXG4gICAqL1xuICBASW5wdXQoKSBzaXplcz86IHN0cmluZztcblxuICAvKipcbiAgICogRm9yIHJlc3BvbnNpdmUgaW1hZ2VzOiB0aGUgaW50cmluc2ljIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqIEZvciBmaXhlZCBzaXplIGltYWdlczogdGhlIGRlc2lyZWQgcmVuZGVyZWQgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBudW1iZXJBdHRyaWJ1dGV9KSB3aWR0aDogbnVtYmVyfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogRm9yIHJlc3BvbnNpdmUgaW1hZ2VzOiB0aGUgaW50cmluc2ljIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKiBGb3IgZml4ZWQgc2l6ZSBpbWFnZXM6IHRoZSBkZXNpcmVkIHJlbmRlcmVkIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLiogVGhlIGludHJpbnNpY1xuICAgKiBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBudW1iZXJBdHRyaWJ1dGV9KSBoZWlnaHQ6IG51bWJlcnx1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFRoZSBkZXNpcmVkIGxvYWRpbmcgYmVoYXZpb3IgKGxhenksIGVhZ2VyLCBvciBhdXRvKS4gRGVmYXVsdHMgdG8gYGxhenlgLFxuICAgKiB3aGljaCBpcyByZWNvbW1lbmRlZCBmb3IgbW9zdCBpbWFnZXMuXG4gICAqXG4gICAqIFdhcm5pbmc6IFNldHRpbmcgaW1hZ2VzIGFzIGxvYWRpbmc9XCJlYWdlclwiIG9yIGxvYWRpbmc9XCJhdXRvXCIgbWFya3MgdGhlbVxuICAgKiBhcyBub24tcHJpb3JpdHkgaW1hZ2VzIGFuZCBjYW4gaHVydCBsb2FkaW5nIHBlcmZvcm1hbmNlLiBGb3IgaW1hZ2VzIHdoaWNoXG4gICAqIG1heSBiZSB0aGUgTENQIGVsZW1lbnQsIHVzZSB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUgaW5zdGVhZCBvZiBgbG9hZGluZ2AuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkaW5nPzogJ2xhenknfCdlYWdlcid8J2F1dG8nO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgcHJpb3JpdHkgPSBmYWxzZTtcblxuICAvKipcbiAgICogRGF0YSB0byBwYXNzIHRocm91Z2ggdG8gY3VzdG9tIGxvYWRlcnMuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkZXJQYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNyY3NldCBnZW5lcmF0aW9uIGZvciB0aGlzIGltYWdlLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBkaXNhYmxlT3B0aW1pemVkU3Jjc2V0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGltYWdlIHRvIFwiZmlsbCBtb2RlXCIsIHdoaWNoIGVsaW1pbmF0ZXMgdGhlIGhlaWdodC93aWR0aCByZXF1aXJlbWVudCBhbmQgYWRkc1xuICAgKiBzdHlsZXMgc3VjaCB0aGF0IHRoZSBpbWFnZSBmaWxscyBpdHMgY29udGFpbmluZyBlbGVtZW50LlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBmaWxsID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFZhbHVlIG9mIHRoZSBgc3JjYCBhdHRyaWJ1dGUgaWYgc2V0IG9uIHRoZSBob3N0IGA8aW1nPmAgZWxlbWVudC5cbiAgICogVGhpcyBpbnB1dCBpcyBleGNsdXNpdmVseSByZWFkIHRvIGFzc2VydCB0aGF0IGBzcmNgIGlzIG5vdCBzZXQgaW4gY29uZmxpY3RcbiAgICogd2l0aCBgbmdTcmNgIGFuZCB0aGF0IGltYWdlcyBkb24ndCBzdGFydCB0byBsb2FkIHVudGlsIGEgbGF6eSBsb2FkaW5nIHN0cmF0ZWd5IGlzIHNldC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBASW5wdXQoKSBzcmM/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFZhbHVlIG9mIHRoZSBgc3Jjc2V0YCBhdHRyaWJ1dGUgaWYgc2V0IG9uIHRoZSBob3N0IGA8aW1nPmAgZWxlbWVudC5cbiAgICogVGhpcyBpbnB1dCBpcyBleGNsdXNpdmVseSByZWFkIHRvIGFzc2VydCB0aGF0IGBzcmNzZXRgIGlzIG5vdCBzZXQgaW4gY29uZmxpY3RcbiAgICogd2l0aCBgbmdTcmNzZXRgIGFuZCB0aGF0IGltYWdlcyBkb24ndCBzdGFydCB0byBsb2FkIHVudGlsIGEgbGF6eSBsb2FkaW5nIHN0cmF0ZWd5IGlzIHNldC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBASW5wdXQoKSBzcmNzZXQ/OiBzdHJpbmc7XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgYXNzZXJ0Tm9uRW1wdHlJbnB1dCh0aGlzLCAnbmdTcmMnLCB0aGlzLm5nU3JjKTtcbiAgICAgIGFzc2VydFZhbGlkTmdTcmNzZXQodGhpcywgdGhpcy5uZ1NyY3NldCk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKHRoaXMpO1xuICAgICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldCh0aGlzKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydE5vdEJhc2U2NEltYWdlKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmxvYlVybCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLmZpbGwpIHtcbiAgICAgICAgYXNzZXJ0RW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgLy8gVGhpcyBsZWF2ZXMgdGhlIEFuZ3VsYXIgem9uZSB0byBhdm9pZCB0cmlnZ2VyaW5nIHVubmVjZXNzYXJ5IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzIHdoZW5cbiAgICAgICAgLy8gYGxvYWRgIHRhc2tzIGFyZSBpbnZva2VkIG9uIGltYWdlcy5cbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKFxuICAgICAgICAgICAgKCkgPT4gYXNzZXJ0Tm9uWmVyb1JlbmRlcmVkSGVpZ2h0KHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlcikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdGhpcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy53aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHRoaXMud2lkdGgsICd3aWR0aCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgY2hlY2sgZm9yIGRpc3RvcnRlZCBpbWFnZXMgd2hlbiBub3QgaW4gZmlsbCBtb2RlLCB3aGVyZVxuICAgICAgICAvLyBpbWFnZXMgbWF5IGJlIGludGVudGlvbmFsbHkgc3RyZXRjaGVkLCBjcm9wcGVkIG9yIGxldHRlcmJveGVkLlxuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoXG4gICAgICAgICAgICAoKSA9PiBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbih0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KHRoaXMpO1xuICAgICAgaWYgKCF0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29tcGxleFNpemVzKHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIodGhpcy5uZ1NyYywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vTG9hZGVyUGFyYW1zV2l0aG91dExvYWRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcblxuICAgICAgaWYgKHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyIS5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMubmdTcmMsIHRoaXMucHJpb3JpdHkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuYXNzZXJ0UHJlY29ubmVjdCh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlcygpIHtcbiAgICAvLyBNdXN0IHNldCB3aWR0aC9oZWlnaHQgZXhwbGljaXRseSBpbiBjYXNlIHRoZXkgYXJlIGJvdW5kIChpbiB3aGljaCBjYXNlIHRoZXkgd2lsbFxuICAgIC8vIG9ubHkgYmUgcmVmbGVjdGVkIGFuZCBub3QgZm91bmQgYnkgdGhlIGJyb3dzZXIpXG4gICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgaWYgKCF0aGlzLnNpemVzKSB7XG4gICAgICAgIHRoaXMuc2l6ZXMgPSAnMTAwdncnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCEudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0IS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG5cbiAgICAvLyBUaGUgYGRhdGEtbmctaW1nYCBhdHRyaWJ1dGUgZmxhZ3MgYW4gaW1hZ2UgYXMgdXNpbmcgdGhlIGRpcmVjdGl2ZSwgdG8gYWxsb3dcbiAgICAvLyBmb3IgYW5hbHlzaXMgb2YgdGhlIGRpcmVjdGl2ZSdzIHBlcmZvcm1hbmNlLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbmctaW1nJywgJ3RydWUnKTtcblxuICAgIC8vIFRoZSBgc3JjYCBhbmQgYHNyY3NldGAgYXR0cmlidXRlcyBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIGNvbnN0IHJld3JpdHRlblNyY3NldCA9IHRoaXMudXBkYXRlU3JjQW5kU3Jjc2V0KCk7XG5cbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzaXplcycsIHRoaXMuc2l6ZXMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1NlcnZlciAmJiB0aGlzLnByaW9yaXR5KSB7XG4gICAgICB0aGlzLnByZWxvYWRMaW5rQ3JlYXRvci5jcmVhdGVQcmVsb2FkTGlua1RhZyhcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLCB0aGlzLmdldFJld3JpdHRlblNyYygpLCByZXdyaXR0ZW5TcmNzZXQsIHRoaXMuc2l6ZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZSh0aGlzLCBjaGFuZ2VzLCBbXG4gICAgICAgICduZ1NyY3NldCcsXG4gICAgICAgICd3aWR0aCcsXG4gICAgICAgICdoZWlnaHQnLFxuICAgICAgICAncHJpb3JpdHknLFxuICAgICAgICAnZmlsbCcsXG4gICAgICAgICdsb2FkaW5nJyxcbiAgICAgICAgJ3NpemVzJyxcbiAgICAgICAgJ2xvYWRlclBhcmFtcycsXG4gICAgICAgICdkaXNhYmxlT3B0aW1pemVkU3Jjc2V0JyxcbiAgICAgIF0pO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlc1snbmdTcmMnXSAmJiAhY2hhbmdlc1snbmdTcmMnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGNvbnN0IG9sZFNyYyA9IHRoaXMuX3JlbmRlcmVkU3JjO1xuICAgICAgdGhpcy51cGRhdGVTcmNBbmRTcmNzZXQodHJ1ZSk7XG4gICAgICBjb25zdCBuZXdTcmMgPSB0aGlzLl9yZW5kZXJlZFNyYztcbiAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsICYmIG9sZFNyYyAmJiBuZXdTcmMgJiYgb2xkU3JjICE9PSBuZXdTcmMpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyPy51cGRhdGVJbWFnZShvbGRTcmMsIG5ld1NyYyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2FsbEltYWdlTG9hZGVyKGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM6IE9taXQ8SW1hZ2VMb2FkZXJDb25maWcsICdsb2FkZXJQYXJhbXMnPik6XG4gICAgICBzdHJpbmcge1xuICAgIGxldCBhdWdtZW50ZWRDb25maWc6IEltYWdlTG9hZGVyQ29uZmlnID0gY29uZmlnV2l0aG91dEN1c3RvbVBhcmFtcztcbiAgICBpZiAodGhpcy5sb2FkZXJQYXJhbXMpIHtcbiAgICAgIGF1Z21lbnRlZENvbmZpZy5sb2FkZXJQYXJhbXMgPSB0aGlzLmxvYWRlclBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMb2FkZXIoYXVnbWVudGVkQ29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMubG9hZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgaWYgKCF0aGlzLl9yZW5kZXJlZFNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5uZ1NyY307XG4gICAgICAvLyBDYWNoZSBjYWxjdWxhdGVkIGltYWdlIHNyYyB0byByZXVzZSBpdCBsYXRlciBpbiB0aGUgY29kZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gdGhpcy5jYWxsSW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVkU3JjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB3aWR0aFNyY1NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodGhpcy5uZ1NyY3NldCk7XG4gICAgY29uc3QgZmluYWxTcmNzID0gdGhpcy5uZ1NyY3NldC5zcGxpdCgnLCcpLmZpbHRlcihzcmMgPT4gc3JjICE9PSAnJykubWFwKHNyY1N0ciA9PiB7XG4gICAgICBzcmNTdHIgPSBzcmNTdHIudHJpbSgpO1xuICAgICAgY29uc3Qgd2lkdGggPSB3aWR0aFNyY1NldCA/IHBhcnNlRmxvYXQoc3JjU3RyKSA6IHBhcnNlRmxvYXQoc3JjU3RyKSAqIHRoaXMud2lkdGghO1xuICAgICAgcmV0dXJuIGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRofSl9ICR7c3JjU3RyfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBdXRvbWF0aWNTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5zaXplcykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVzcG9uc2l2ZVNyY3NldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaXhlZFNyY3NldCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVzcG9uc2l2ZVNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHticmVha3BvaW50c30gPSB0aGlzLmNvbmZpZztcblxuICAgIGxldCBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhO1xuICAgIGlmICh0aGlzLnNpemVzPy50cmltKCkgPT09ICcxMDB2dycpIHtcbiAgICAgIC8vIFNpbmNlIHRoaXMgaXMgYSBmdWxsLXNjcmVlbi13aWR0aCBpbWFnZSwgb3VyIHNyY3NldCBvbmx5IG5lZWRzIHRvIGluY2x1ZGVcbiAgICAgIC8vIGJyZWFrcG9pbnRzIHdpdGggZnVsbCB2aWV3cG9ydCB3aWR0aHMuXG4gICAgICBmaWx0ZXJlZEJyZWFrcG9pbnRzID0gYnJlYWtwb2ludHMhLmZpbHRlcihicCA9PiBicCA+PSBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRik7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxTcmNzID0gZmlsdGVyZWRCcmVha3BvaW50cy5tYXAoXG4gICAgICAgIGJwID0+IGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRoOiBicH0pfSAke2JwfXdgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVNyY0FuZFNyY3NldChmb3JjZVNyY1JlY2FsYyA9IGZhbHNlKTogc3RyaW5nfHVuZGVmaW5lZCB7XG4gICAgaWYgKGZvcmNlU3JjUmVjYWxjKSB7XG4gICAgICAvLyBSZXNldCBjYWNoZWQgdmFsdWUsIHNvIHRoYXQgdGhlIGZvbGxvd3VwIGBnZXRSZXdyaXR0ZW5TcmMoKWAgY2FsbFxuICAgICAgLy8gd2lsbCByZWNhbGN1bGF0ZSBpdCBhbmQgdXBkYXRlIHRoZSBjYWNoZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmMgPSB0aGlzLmdldFJld3JpdHRlblNyYygpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgcmV3cml0dGVuU3JjKTtcblxuICAgIGxldCByZXdyaXR0ZW5TcmNzZXQ6IHN0cmluZ3x1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMubmdTcmNzZXQpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0UmV3cml0dGVuU3Jjc2V0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCkpIHtcbiAgICAgIHJld3JpdHRlblNyY3NldCA9IHRoaXMuZ2V0QXV0b21hdGljU3Jjc2V0KCk7XG4gICAgfVxuXG4gICAgaWYgKHJld3JpdHRlblNyY3NldCkge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmNzZXQnLCByZXdyaXR0ZW5TcmNzZXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmV3cml0dGVuU3Jjc2V0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGaXhlZFNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTLm1hcChtdWx0aXBsaWVyID0+IGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IHRoaXMubmdTcmMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGghICogbXVsdGlwbGllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX0gJHttdWx0aXBsaWVyfXhgKTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZEdlbmVyYXRlQXV0b21hdGljU3Jjc2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5kaXNhYmxlT3B0aW1pemVkU3Jjc2V0ICYmICF0aGlzLnNyY3NldCAmJiB0aGlzLmltYWdlTG9hZGVyICE9PSBub29wSW1hZ2VMb2FkZXIgJiZcbiAgICAgICAgISh0aGlzLndpZHRoISA+IEZJWEVEX1NSQ1NFVF9XSURUSF9MSU1JVCB8fCB0aGlzLmhlaWdodCEgPiBGSVhFRF9TUkNTRVRfSEVJR0hUX0xJTUlUKTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLnByaW9yaXR5ICYmIHRoaXMuX3JlbmRlcmVkU3JjICE9PSBudWxsICYmIHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5sY3BPYnNlcnZlci51bnJlZ2lzdGVySW1hZ2UodGhpcy5fcmVuZGVyZWRTcmMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmltZ0VsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG4vKioqKiogSGVscGVycyAqKioqKi9cblxuLyoqXG4gKiBTb3J0cyBwcm92aWRlZCBjb25maWcgYnJlYWtwb2ludHMgYW5kIHVzZXMgZGVmYXVsdHMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NDb25maWcoY29uZmlnOiBJbWFnZUNvbmZpZyk6IEltYWdlQ29uZmlnIHtcbiAgbGV0IHNvcnRlZEJyZWFrcG9pbnRzOiB7YnJlYWtwb2ludHM/OiBudW1iZXJbXX0gPSB7fTtcbiAgaWYgKGNvbmZpZy5icmVha3BvaW50cykge1xuICAgIHNvcnRlZEJyZWFrcG9pbnRzLmJyZWFrcG9pbnRzID0gY29uZmlnLmJyZWFrcG9pbnRzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgSU1BR0VfQ09ORklHX0RFRkFVTFRTLCBjb25maWcsIHNvcnRlZEJyZWFrcG9pbnRzKTtcbn1cblxuLyoqKioqIEFzc2VydCBmdW5jdGlvbnMgKioqKiovXG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3JjYCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3JjKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ19BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3JjXFxgIGFuZCBcXGBuZ1NyY1xcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBzZXRzIFxcYHNyY1xcYCBpdHNlbGYgYmFzZWQgb24gdGhlIHZhbHVlIG9mIFxcYG5nU3JjXFxgLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY3NldGAgc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNTRVRfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY3NldFxcYCBhbmQgXFxgbmdTcmNzZXRcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNzZXRcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBgICtcbiAgICAgICAgICAgIGBcXGBuZ1NyY3NldFxcYC4gVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG5nU3JjID0gZGlyLm5nU3JjLnRyaW0oKTtcbiAgaWYgKG5nU3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAobmdTcmMubGVuZ3RoID4gQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSB7XG4gICAgICBuZ1NyYyA9IG5nU3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgbmdTcmNcXGAgaXMgYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgYCArXG4gICAgICAgICAgICBgKCR7bmdTcmN9KS4gTmdPcHRpbWl6ZWRJbWFnZSBkb2VzIG5vdCBzdXBwb3J0IEJhc2U2NC1lbmNvZGVkIHN0cmluZ3MuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50IGAgK1xuICAgICAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHN0YW5kYXJkIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlICdzaXplcycgb25seSBpbmNsdWRlcyByZXNwb25zaXZlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db21wbGV4U2l6ZXMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBzaXplcyA9IGRpci5zaXplcztcbiAgaWYgKHNpemVzPy5tYXRjaCgvKChcXCl8LClcXHN8XilcXGQrcHgvKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgc2l6ZXNcXGAgd2FzIHNldCB0byBhIHN0cmluZyBpbmNsdWRpbmcgYCArXG4gICAgICAgICAgICBgcGl4ZWwgdmFsdWVzLiBGb3IgYXV0b21hdGljIFxcYHNyY3NldFxcYCBnZW5lcmF0aW9uLCBcXGBzaXplc1xcYCBtdXN0IG9ubHkgaW5jbHVkZSByZXNwb25zaXZlIGAgK1xuICAgICAgICAgICAgYHZhbHVlcywgc3VjaCBhcyBcXGBzaXplcz1cIjUwdndcIlxcYCBvciBcXGBzaXplcz1cIihtaW4td2lkdGg6IDc2OHB4KSA1MHZ3LCAxMDB2d1wiXFxgLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgbW9kaWZ5IHRoZSBcXGBzaXplc1xcYCBhdHRyaWJ1dGUsIG9yIHByb3ZpZGUgeW91ciBvd24gXFxgbmdTcmNzZXRcXGAgdmFsdWUgZGlyZWN0bHkuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCbG9iVXJsKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBjb25zdCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3JjXFxgIHdhcyBzZXQgdG8gYSBibG9iIFVSTCAoJHtuZ1NyY30pLiBgICtcbiAgICAgICAgICAgIGBCbG9iIFVSTHMgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgICAgIGBieSByZW1vdmluZyBcXGBuZ1NyY1xcYCBhbmQgdXNpbmcgYSByZWd1bGFyIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGlucHV0IGlzIHNldCB0byBhIG5vbi1lbXB0eSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke25hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIGAgK1xuICAgICAgICAgICAgYChcXGAke3ZhbHVlfVxcYCkuIFRvIGZpeCB0aGlzLCBjaGFuZ2UgdGhlIHZhbHVlIHRvIGEgbm9uLWVtcHR5IHN0cmluZy5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZ1NyY3NldGAgaXMgaW4gYSB2YWxpZCBmb3JtYXQsIGUuZy4gXCIxMDB3LCAyMDB3XCIgb3IgXCIxeCwgMnhcIi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkTmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogdW5rbm93bikge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuO1xuICBhc3NlcnROb25FbXB0eUlucHV0KGRpciwgJ25nU3Jjc2V0JywgdmFsdWUpO1xuICBjb25zdCBzdHJpbmdWYWwgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gIGNvbnN0IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG4gIGNvbnN0IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvciA9IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuXG4gIGlmIChpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IpIHtcbiAgICBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyLCBzdHJpbmdWYWwpO1xuICB9XG5cbiAgY29uc3QgaXNWYWxpZFNyY3NldCA9IGlzVmFsaWRXaWR0aERlc2NyaXB0b3IgfHwgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yO1xuICBpZiAoIWlzVmFsaWRTcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNzZXRcXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgKFxcYCR7dmFsdWV9XFxgKS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBcXGBuZ1NyY3NldFxcYCB1c2luZyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG9uZSBvciBtb3JlIHdpZHRoIGAgK1xuICAgICAgICAgICAgYGRlc2NyaXB0b3JzIChlLmcuIFwiMTAwdywgMjAwd1wiKSBvciBkZW5zaXR5IGRlc2NyaXB0b3JzIChlLmcuIFwiMXgsIDJ4XCIpLmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiBzdHJpbmcpIHtcbiAgY29uc3QgdW5kZXJEZW5zaXR5Q2FwID1cbiAgICAgIHZhbHVlLnNwbGl0KCcsJykuZXZlcnkobnVtID0+IG51bSA9PT0gJycgfHwgcGFyc2VGbG9hdChudW0pIDw9IEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUCk7XG4gIGlmICghdW5kZXJEZW5zaXR5Q2FwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtcbiAgICAgICAgICAgIGltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICAgICAgZGlyLm5nU3JjKX0gdGhlIFxcYG5nU3Jjc2V0XFxgIGNvbnRhaW5zIGFuIHVuc3VwcG9ydGVkIGltYWdlIGRlbnNpdHk6YCArXG4gICAgICAgICAgICBgXFxgJHt2YWx1ZX1cXGAuIE5nT3B0aW1pemVkSW1hZ2UgZ2VuZXJhbGx5IHJlY29tbWVuZHMgYSBtYXggaW1hZ2UgZGVuc2l0eSBvZiBgICtcbiAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGJ1dCBzdXBwb3J0cyBpbWFnZSBkZW5zaXRpZXMgdXAgdG8gYCArXG4gICAgICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eC4gVGhlIGh1bWFuIGV5ZSBjYW5ub3QgZGlzdGluZ3Vpc2ggYmV0d2VlbiBpbWFnZSBkZW5zaXRpZXMgYCArXG4gICAgICAgICAgICBgZ3JlYXRlciB0aGFuICR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggLSB3aGljaCBtYWtlcyB0aGVtIHVubmVjZXNzYXJ5IGZvciBgICtcbiAgICAgICAgICAgIGBtb3N0IHVzZSBjYXNlcy4gSW1hZ2VzIHRoYXQgd2lsbCBiZSBwaW5jaC16b29tZWQgYXJlIHR5cGljYWxseSB0aGUgcHJpbWFyeSB1c2UgY2FzZSBmb3IgYCArXG4gICAgICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eCBpbWFnZXMuIFBsZWFzZSByZW1vdmUgdGhlIGhpZ2ggZGVuc2l0eSBkZXNjcmlwdG9yIGFuZCB0cnkgYWdhaW4uYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4gKiB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbiAqL1xuZnVuY3Rpb24gcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXROYW1lOiBzdHJpbmcpOiB7fSB7XG4gIGxldCByZWFzb24hOiBzdHJpbmc7XG4gIGlmIChpbnB1dE5hbWUgPT09ICd3aWR0aCcgfHwgaW5wdXROYW1lID09PSAnaGVpZ2h0Jykge1xuICAgIHJlYXNvbiA9IGBDaGFuZ2luZyBcXGAke2lucHV0TmFtZX1cXGAgbWF5IHJlc3VsdCBpbiBkaWZmZXJlbnQgYXR0cmlidXRlIHZhbHVlIGAgK1xuICAgICAgICBgYXBwbGllZCB0byB0aGUgdW5kZXJseWluZyBpbWFnZSBlbGVtZW50IGFuZCBjYXVzZSBsYXlvdXQgc2hpZnRzIG9uIGEgcGFnZS5gO1xuICB9IGVsc2Uge1xuICAgIHJlYXNvbiA9IGBDaGFuZ2luZyB0aGUgXFxgJHtpbnB1dE5hbWV9XFxgIHdvdWxkIGhhdmUgbm8gZWZmZWN0IG9uIHRoZSB1bmRlcmx5aW5nIGAgK1xuICAgICAgICBgaW1hZ2UgZWxlbWVudCwgYmVjYXVzZSB0aGUgcmVzb3VyY2UgbG9hZGluZyBoYXMgYWxyZWFkeSBvY2N1cnJlZC5gO1xuICB9XG4gIHJldHVybiBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX0lOUFVUX0NIQU5HRSxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIHdhcyB1cGRhdGVkIGFmdGVyIGluaXRpYWxpemF0aW9uLiBgICtcbiAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgbm90IHJlYWN0IHRvIHRoaXMgaW5wdXQgY2hhbmdlLiAke3JlYXNvbn0gYCArXG4gICAgICAgICAgYFRvIGZpeCB0aGlzLCBlaXRoZXIgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCB0byBhIHN0YXRpYyB2YWx1ZSBgICtcbiAgICAgICAgICBgb3Igd3JhcCB0aGUgaW1hZ2UgZWxlbWVudCBpbiBhbiAqbmdJZiB0aGF0IGlzIGdhdGVkIG9uIHRoZSBuZWNlc3NhcnkgdmFsdWUuYCk7XG59XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgbm9uZSBvZiB0aGUgbGlzdGVkIGlucHV0cyBoYXMgY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgY2hhbmdlczogU2ltcGxlQ2hhbmdlcywgaW5wdXRzOiBzdHJpbmdbXSkge1xuICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICduZ1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYG5nU3JjYCBpbnB1dCBjaGFuZ2VzLCB3ZSBkZXRlY3QgdGhhdCBvbmx5IGluIHRoZVxuICAgICAgICAvLyBgbmdPbkNoYW5nZXNgIGhvb2ssIHRodXMgdGhlIGBuZ1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgbmdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtuZ1NyYzogY2hhbmdlc1tpbnB1dF0ucHJldmlvdXNWYWx1ZX0gYXMgTmdPcHRpbWl6ZWRJbWFnZTtcbiAgICAgIH1cbiAgICAgIHRocm93IHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXIsIGlucHV0KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEdyZWF0ZXJUaGFuWmVybyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHZhbGlkTnVtYmVyID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInICYmIGlucHV0VmFsdWUgPiAwO1xuICBjb25zdCB2YWxpZFN0cmluZyA9XG4gICAgICB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkgJiYgcGFyc2VJbnQoaW5wdXRWYWx1ZSkgPiAwO1xuICBpZiAoIXZhbGlkTnVtYmVyICYmICF2YWxpZFN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIFxcYCR7aW5wdXROYW1lfVxcYCBhcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGlzIG5vdCB2aXN1YWxseSBkaXN0b3J0ZWQuIEVmZmVjdGl2ZWx5IHRoaXMgaXMgY2hlY2tpbmc6XG4gKiAtIFdoZXRoZXIgdGhlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHJlZmxlY3QgdGhlIGFjdHVhbCBkaW1lbnNpb25zIG9mIHRoZSBpbWFnZS5cbiAqIC0gV2hldGhlciBpbWFnZSBzdHlsaW5nIGlzIFwiY29ycmVjdFwiIChzZWUgYmVsb3cgZm9yIGEgbG9uZ2VyIGV4cGxhbmF0aW9uKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24oXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHJlbmRlcmVyOiBSZW5kZXJlcjIpIHtcbiAgY29uc3QgcmVtb3ZlTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoaW1nKTtcbiAgICBsZXQgcmVuZGVyZWRXaWR0aCA9IHBhcnNlRmxvYXQoY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd3aWR0aCcpKTtcbiAgICBsZXQgcmVuZGVyZWRIZWlnaHQgPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnaGVpZ2h0JykpO1xuICAgIGNvbnN0IGJveFNpemluZyA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnYm94LXNpemluZycpO1xuXG4gICAgaWYgKGJveFNpemluZyA9PT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICBjb25zdCBwYWRkaW5nVG9wID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXRvcCcpO1xuICAgICAgY29uc3QgcGFkZGluZ1JpZ2h0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXJpZ2h0Jyk7XG4gICAgICBjb25zdCBwYWRkaW5nQm90dG9tID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWJvdHRvbScpO1xuICAgICAgY29uc3QgcGFkZGluZ0xlZnQgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctbGVmdCcpO1xuICAgICAgcmVuZGVyZWRXaWR0aCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdSaWdodCkgKyBwYXJzZUZsb2F0KHBhZGRpbmdMZWZ0KTtcbiAgICAgIHJlbmRlcmVkSGVpZ2h0IC09IHBhcnNlRmxvYXQocGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KHBhZGRpbmdCb3R0b20pO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbmRlcmVkQXNwZWN0UmF0aW8gPSByZW5kZXJlZFdpZHRoIC8gcmVuZGVyZWRIZWlnaHQ7XG4gICAgY29uc3Qgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucyA9IHJlbmRlcmVkV2lkdGggIT09IDAgJiYgcmVuZGVyZWRIZWlnaHQgIT09IDA7XG5cbiAgICBjb25zdCBpbnRyaW5zaWNXaWR0aCA9IGltZy5uYXR1cmFsV2lkdGg7XG4gICAgY29uc3QgaW50cmluc2ljSGVpZ2h0ID0gaW1nLm5hdHVyYWxIZWlnaHQ7XG4gICAgY29uc3QgaW50cmluc2ljQXNwZWN0UmF0aW8gPSBpbnRyaW5zaWNXaWR0aCAvIGludHJpbnNpY0hlaWdodDtcblxuICAgIGNvbnN0IHN1cHBsaWVkV2lkdGggPSBkaXIud2lkdGghO1xuICAgIGNvbnN0IHN1cHBsaWVkSGVpZ2h0ID0gZGlyLmhlaWdodCE7XG4gICAgY29uc3Qgc3VwcGxpZWRBc3BlY3RSYXRpbyA9IHN1cHBsaWVkV2lkdGggLyBzdXBwbGllZEhlaWdodDtcblxuICAgIC8vIFRvbGVyYW5jZSBpcyB1c2VkIHRvIGFjY291bnQgZm9yIHRoZSBpbXBhY3Qgb2Ygc3VicGl4ZWwgcmVuZGVyaW5nLlxuICAgIC8vIER1ZSB0byBzdWJwaXhlbCByZW5kZXJpbmcsIHRoZSByZW5kZXJlZCwgaW50cmluc2ljLCBhbmQgc3VwcGxpZWRcbiAgICAvLyBhc3BlY3QgcmF0aW9zIG9mIGEgY29ycmVjdGx5IGNvbmZpZ3VyZWQgaW1hZ2UgbWF5IG5vdCBleGFjdGx5IG1hdGNoLlxuICAgIC8vIEZvciBleGFtcGxlLCBhIGB3aWR0aD00MDMwIGhlaWdodD0zMDIwYCBpbWFnZSBtaWdodCBoYXZlIGEgcmVuZGVyZWRcbiAgICAvLyBzaXplIG9mIFwiMTA2MncsIDc5Ni40OGhcIi4gKEFuIGFzcGVjdCByYXRpbyBvZiAxLjMzNC4uLiB2cy4gMS4zMzMuLi4pXG4gICAgY29uc3QgaW5hY2N1cmF0ZURpbWVuc2lvbnMgPVxuICAgICAgICBNYXRoLmFicyhzdXBwbGllZEFzcGVjdFJhdGlvIC0gaW50cmluc2ljQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcbiAgICBjb25zdCBzdHlsaW5nRGlzdG9ydGlvbiA9IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgJiZcbiAgICAgICAgTWF0aC5hYnMoaW50cmluc2ljQXNwZWN0UmF0aW8gLSByZW5kZXJlZEFzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG5cbiAgICBpZiAoaW5hY2N1cmF0ZURpbWVuc2lvbnMpIHtcbiAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgaW1hZ2UgZG9lcyBub3QgbWF0Y2ggYCArXG4gICAgICAgICAgICAgIGB0aGUgYXNwZWN0IHJhdGlvIGluZGljYXRlZCBieSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLiBgICtcbiAgICAgICAgICAgICAgYFxcbkludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIGAgK1xuICAgICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtcbiAgICAgICAgICAgICAgICAgIHJvdW5kKGludHJpbnNpY0FzcGVjdFJhdGlvKX0pLiBcXG5TdXBwbGllZCB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXM6IGAgK1xuICAgICAgICAgICAgICBgJHtzdXBwbGllZFdpZHRofXcgeCAke3N1cHBsaWVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtcbiAgICAgICAgICAgICAgICAgIHJvdW5kKHN1cHBsaWVkQXNwZWN0UmF0aW8pfSkuIGAgK1xuICAgICAgICAgICAgICBgXFxuVG8gZml4IHRoaXMsIHVwZGF0ZSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLmApKTtcbiAgICB9IGVsc2UgaWYgKHN0eWxpbmdEaXN0b3J0aW9uKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIHJlbmRlcmVkIGltYWdlIGAgK1xuICAgICAgICAgICAgICBgZG9lcyBub3QgbWF0Y2ggdGhlIGltYWdlJ3MgaW50cmluc2ljIGFzcGVjdCByYXRpby4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7cm91bmQoaW50cmluc2ljQXNwZWN0UmF0aW8pfSkuIFxcblJlbmRlcmVkIGltYWdlIHNpemU6IGAgK1xuICAgICAgICAgICAgICBgJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogYCArXG4gICAgICAgICAgICAgIGAke3JvdW5kKHJlbmRlcmVkQXNwZWN0UmF0aW8pfSkuIFxcblRoaXMgaXNzdWUgY2FuIG9jY3VyIGlmIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBgICtcbiAgICAgICAgICAgICAgYGF0dHJpYnV0ZXMgYXJlIGFkZGVkIHRvIGFuIGltYWdlIHdpdGhvdXQgdXBkYXRpbmcgdGhlIGNvcnJlc3BvbmRpbmcgYCArXG4gICAgICAgICAgICAgIGBpbWFnZSBzdHlsaW5nLiBUbyBmaXggdGhpcywgYWRqdXN0IGltYWdlIHN0eWxpbmcuIEluIG1vc3QgY2FzZXMsIGAgK1xuICAgICAgICAgICAgICBgYWRkaW5nIFwiaGVpZ2h0OiBhdXRvXCIgb3IgXCJ3aWR0aDogYXV0b1wiIHRvIHRoZSBpbWFnZSBzdHlsaW5nIHdpbGwgZml4IGAgK1xuICAgICAgICAgICAgICBgdGhpcyBpc3N1ZS5gKSk7XG4gICAgfSBlbHNlIGlmICghZGlyLm5nU3Jjc2V0ICYmIG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMpIHtcbiAgICAgIC8vIElmIGBuZ1NyY3NldGAgaGFzbid0IGJlZW4gc2V0LCBzYW5pdHkgY2hlY2sgdGhlIGludHJpbnNpYyBzaXplLlxuICAgICAgY29uc3QgcmVjb21tZW5kZWRXaWR0aCA9IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCAqIHJlbmRlcmVkV2lkdGg7XG4gICAgICBjb25zdCByZWNvbW1lbmRlZEhlaWdodCA9IFJFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUCAqIHJlbmRlcmVkSGVpZ2h0O1xuICAgICAgY29uc3Qgb3ZlcnNpemVkV2lkdGggPSAoaW50cmluc2ljV2lkdGggLSByZWNvbW1lbmRlZFdpZHRoKSA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgY29uc3Qgb3ZlcnNpemVkSGVpZ2h0ID0gKGludHJpbnNpY0hlaWdodCAtIHJlY29tbWVuZGVkSGVpZ2h0KSA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgaWYgKG92ZXJzaXplZFdpZHRoIHx8IG92ZXJzaXplZEhlaWdodCkge1xuICAgICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfSU1BR0UsXG4gICAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBpbnRyaW5zaWMgaW1hZ2UgaXMgc2lnbmlmaWNhbnRseSBgICtcbiAgICAgICAgICAgICAgICBgbGFyZ2VyIHRoYW4gbmVjZXNzYXJ5LiBgICtcbiAgICAgICAgICAgICAgICBgXFxuUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgICAgYFxcblJlY29tbWVuZGVkIGludHJpbnNpYyBpbWFnZSBzaXplOiAke3JlY29tbWVuZGVkV2lkdGh9dyB4ICR7XG4gICAgICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5Ob3RlOiBSZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZSBpcyBjYWxjdWxhdGVkIGFzc3VtaW5nIGEgbWF4aW11bSBEUFIgb2YgYCArXG4gICAgICAgICAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfS4gVG8gaW1wcm92ZSBsb2FkaW5nIHRpbWUsIHJlc2l6ZSB0aGUgaW1hZ2UgYCArXG4gICAgICAgICAgICAgICAgYG9yIGNvbnNpZGVyIHVzaW5nIHRoZSBcIm5nU3Jjc2V0XCIgYW5kIFwic2l6ZXNcIiBhdHRyaWJ1dGVzLmApKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgc2V0LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgbWlzc2luZ0F0dHJpYnV0ZXMgPSBbXTtcbiAgaWYgKGRpci53aWR0aCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCd3aWR0aCcpO1xuICBpZiAoZGlyLmhlaWdodCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCdoZWlnaHQnKTtcbiAgaWYgKG1pc3NpbmdBdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJFUVVJUkVEX0lOUFVUX01JU1NJTkcsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlc2UgcmVxdWlyZWQgYXR0cmlidXRlcyBgICtcbiAgICAgICAgICAgIGBhcmUgbWlzc2luZzogJHttaXNzaW5nQXR0cmlidXRlcy5tYXAoYXR0ciA9PiBgXCIke2F0dHJ9XCJgKS5qb2luKCcsICcpfS4gYCArXG4gICAgICAgICAgICBgSW5jbHVkaW5nIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHdpbGwgcHJldmVudCBpbWFnZS1yZWxhdGVkIGxheW91dCBzaGlmdHMuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBpbmNsdWRlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIG9uIHRoZSBpbWFnZSB0YWcgb3IgdHVybiBvbiBgICtcbiAgICAgICAgICAgIGBcImZpbGxcIiBtb2RlIHdpdGggdGhlIFxcYGZpbGxcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBub3Qgc2V0LiBVc2VkIGluIGZpbGwgbW9kZSwgd2hlcmUgdGhvc2UgYXR0cmlidXRlcyBkb24ndCBtYWtlXG4gKiBzZW5zZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0RW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci53aWR0aCB8fCBkaXIuaGVpZ2h0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtcbiAgICAgICAgICAgIGltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICAgICAgZGlyLm5nU3JjKX0gdGhlIGF0dHJpYnV0ZXMgXFxgaGVpZ2h0XFxgIGFuZC9vciBcXGB3aWR0aFxcYCBhcmUgcHJlc2VudCBgICtcbiAgICAgICAgICAgIGBhbG9uZyB3aXRoIHRoZSBcXGBmaWxsXFxgIGF0dHJpYnV0ZS4gQmVjYXVzZSBcXGBmaWxsXFxgIG1vZGUgY2F1c2VzIGFuIGltYWdlIHRvIGZpbGwgaXRzIGNvbnRhaW5pbmcgYCArXG4gICAgICAgICAgICBgZWxlbWVudCwgdGhlIHNpemUgYXR0cmlidXRlcyBoYXZlIG5vIGVmZmVjdCBhbmQgc2hvdWxkIGJlIHJlbW92ZWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBoYXMgYSBub256ZXJvIGhlaWdodC4gSWYgdGhlIGltYWdlIGlzIGluIGZpbGwgbW9kZSwgcHJvdmlkZXNcbiAqIGd1aWRhbmNlIHRoYXQgdGhpcyBjYW4gYmUgY2F1c2VkIGJ5IHRoZSBjb250YWluaW5nIGVsZW1lbnQncyBDU1MgcG9zaXRpb24gcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vblplcm9SZW5kZXJlZEhlaWdodChcbiAgICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltZzogSFRNTEltYWdlRWxlbWVudCwgcmVuZGVyZXI6IFJlbmRlcmVyMikge1xuICBjb25zdCByZW1vdmVMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCAoKSA9PiB7XG4gICAgcmVtb3ZlTGlzdGVuZXJGbigpO1xuICAgIGNvbnN0IHJlbmRlcmVkSGVpZ2h0ID0gaW1nLmNsaWVudEhlaWdodDtcbiAgICBpZiAoZGlyLmZpbGwgJiYgcmVuZGVyZWRIZWlnaHQgPT09IDApIHtcbiAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGhlaWdodCBvZiB0aGUgZmlsbC1tb2RlIGltYWdlIGlzIHplcm8uIGAgK1xuICAgICAgICAgICAgICBgVGhpcyBpcyBsaWtlbHkgYmVjYXVzZSB0aGUgY29udGFpbmluZyBlbGVtZW50IGRvZXMgbm90IGhhdmUgdGhlIENTUyAncG9zaXRpb24nIGAgK1xuICAgICAgICAgICAgICBgcHJvcGVydHkgc2V0IHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nOiBcInJlbGF0aXZlXCIsIFwiZml4ZWRcIiwgb3IgXCJhYnNvbHV0ZVwiLiBgICtcbiAgICAgICAgICAgICAgYFRvIGZpeCB0aGlzIHByb2JsZW0sIG1ha2Ugc3VyZSB0aGUgY29udGFpbmVyIGVsZW1lbnQgaGFzIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgICAgYHByb3BlcnR5IGRlZmluZWQgYW5kIHRoZSBoZWlnaHQgb2YgdGhlIGVsZW1lbnQgaXMgbm90IHplcm8uYCkpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYGxvYWRpbmdgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSB2YWxpZCBpbnB1dCAmXG4gKiBpcyBub3QgdXNlZCBvbiBwcmlvcml0eSBpbWFnZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLmxvYWRpbmcgJiYgZGlyLnByaW9yaXR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBgICtcbiAgICAgICAgICAgIGBTZXR0aW5nIFxcYGxvYWRpbmdcXGAgb24gcHJpb3JpdHkgaW1hZ2VzIGlzIG5vdCBhbGxvd2VkIGAgK1xuICAgICAgICAgICAgYGJlY2F1c2UgdGhlc2UgaW1hZ2VzIHdpbGwgYWx3YXlzIGJlIGVhZ2VybHkgbG9hZGVkLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcmVtb3ZlIHRoZSDigJxsb2FkaW5n4oCdIGF0dHJpYnV0ZSBmcm9tIHRoZSBwcmlvcml0eSBpbWFnZS5gKTtcbiAgfVxuICBjb25zdCB2YWxpZElucHV0cyA9IFsnYXV0bycsICdlYWdlcicsICdsYXp5J107XG4gIGlmICh0eXBlb2YgZGlyLmxvYWRpbmcgPT09ICdzdHJpbmcnICYmICF2YWxpZElucHV0cy5pbmNsdWRlcyhkaXIubG9hZGluZykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke2Rpci5sb2FkaW5nfVxcYCkuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgdmFsaWQgdmFsdWUgKFwibGF6eVwiLCBcImVhZ2VyXCIsIG9yIFwiYXV0b1wiKS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIE5PVCB1c2luZyBhIGxvYWRlciAoZmFsbGluZyBiYWNrIHRvIHRoZSBnZW5lcmljIGxvYWRlcikgYW5kXG4gKiB0aGUgaW1hZ2UgYXBwZWFycyB0byBiZSBob3N0ZWQgb24gb25lIG9mIHRoZSBpbWFnZSBDRE5zIGZvciB3aGljaFxuICogd2UgZG8gaGF2ZSBhIGJ1aWx0LWluIGltYWdlIGxvYWRlci4gU3VnZ2VzdHMgc3dpdGNoaW5nIHRvIHRoZVxuICogYnVpbHQtaW4gbG9hZGVyLlxuICpcbiAqIEBwYXJhbSBuZ1NyYyBWYWx1ZSBvZiB0aGUgbmdTcmMgYXR0cmlidXRlXG4gKiBAcGFyYW0gaW1hZ2VMb2FkZXIgSW1hZ2VMb2FkZXIgcHJvdmlkZWRcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIobmdTcmM6IHN0cmluZywgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgbGV0IGJ1aWx0SW5Mb2FkZXJOYW1lID0gJyc7XG4gICAgZm9yIChjb25zdCBsb2FkZXIgb2YgQlVJTFRfSU5fTE9BREVSUykge1xuICAgICAgaWYgKGxvYWRlci50ZXN0VXJsKG5nU3JjKSkge1xuICAgICAgICBidWlsdEluTG9hZGVyTmFtZSA9IGxvYWRlci5uYW1lO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJ1aWx0SW5Mb2FkZXJOYW1lKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19CVUlMVElOX0xPQURFUixcbiAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZTogSXQgbG9va3MgbGlrZSB5b3VyIGltYWdlcyBtYXkgYmUgaG9zdGVkIG9uIHRoZSBgICtcbiAgICAgICAgICAgICAgYCR7YnVpbHRJbkxvYWRlck5hbWV9IENETiwgYnV0IHlvdXIgYXBwIGlzIG5vdCB1c2luZyBBbmd1bGFyJ3MgYCArXG4gICAgICAgICAgICAgIGBidWlsdC1pbiBsb2FkZXIgZm9yIHRoYXQgQ0ROLiBXZSByZWNvbW1lbmQgc3dpdGNoaW5nIHRvIHVzZSBgICtcbiAgICAgICAgICAgICAgYHRoZSBidWlsdC1pbiBieSBjYWxsaW5nIFxcYHByb3ZpZGUke2J1aWx0SW5Mb2FkZXJOYW1lfUxvYWRlcigpXFxgIGAgK1xuICAgICAgICAgICAgICBgaW4geW91ciBcXGBwcm92aWRlcnNcXGAgYW5kIHBhc3NpbmcgaXQgeW91ciBpbnN0YW5jZSdzIGJhc2UgVVJMLiBgICtcbiAgICAgICAgICAgICAgYElmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgYnVpbHQtaW4gbG9hZGVyLCBkZWZpbmUgYSBjdXN0b20gYCArXG4gICAgICAgICAgICAgIGBsb2FkZXIgZnVuY3Rpb24gdXNpbmcgSU1BR0VfTE9BREVSIHRvIHNpbGVuY2UgdGhpcyB3YXJuaW5nLmApKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBuZ1NyY3NldCBpcyBwcmVzZW50IGFuZCBubyBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vTmdTcmNzZXRXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIubmdTcmNzZXQgJiYgaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19ORUNFU1NBUllfTE9BREVSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBhdHRyaWJ1dGUgaXMgcHJlc2VudCBidXQgYCArXG4gICAgICAgICAgICBgbm8gaW1hZ2UgbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLCBgICtcbiAgICAgICAgICAgIGB3aGljaCB3b3VsZCByZXN1bHQgaW4gdGhlIHNhbWUgaW1hZ2UgYmVpbmcgdXNlZCBmb3IgYWxsIGNvbmZpZ3VyZWQgc2l6ZXMuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgbmdTcmNzZXRcXGAgYXR0cmlidXRlIGZyb20gdGhlIGltYWdlLmApKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIGxvYWRlclBhcmFtcyBpcyBwcmVzZW50IGFuZCBubyBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmdcbiAqIHVzZWQpLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0xvYWRlclBhcmFtc1dpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5sb2FkZXJQYXJhbXMgJiYgaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19ORUNFU1NBUllfTE9BREVSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkZXJQYXJhbXNcXGAgYXR0cmlidXRlIGlzIHByZXNlbnQgYnV0IGAgK1xuICAgICAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgICAgICBgd2hpY2ggbWVhbnMgdGhhdCB0aGUgbG9hZGVyUGFyYW1zIGRhdGEgd2lsbCBub3QgYmUgY29uc3VtZWQgYW5kIHdpbGwgbm90IGFmZmVjdCB0aGUgVVJMLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGN1c3RvbSBsb2FkZXIgb3IgcmVtb3ZlIHRoZSBcXGBsb2FkZXJQYXJhbXNcXGAgYXR0cmlidXRlIGZyb20gdGhlIGltYWdlLmApKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHJvdW5kKGlucHV0OiBudW1iZXIpOiBudW1iZXJ8c3RyaW5nIHtcbiAgcmV0dXJuIE51bWJlci5pc0ludGVnZXIoaW5wdXQpID8gaW5wdXQgOiBpbnB1dC50b0ZpeGVkKDIpO1xufVxuXG4vLyBUcmFuc2Zvcm0gZnVuY3Rpb24gdG8gaGFuZGxlIFNhZmVWYWx1ZSBpbnB1dCBmb3IgbmdTcmMuIFRoaXMgZG9lc24ndCBkbyBhbnkgc2FuaXRpemF0aW9uLFxuLy8gYXMgdGhhdCBpcyBub3QgbmVlZGVkIGZvciBpbWcuc3JjIGFuZCBpbWcuc3Jjc2V0LiBUaGlzIHRyYW5zZm9ybSBpcyBwdXJlbHkgZm9yIGNvbXBhdGliaWxpdHkuXG5mdW5jdGlvbiB1bndyYXBTYWZlVXJsKHZhbHVlOiBzdHJpbmd8U2FmZVZhbHVlKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHVud3JhcFNhZmVWYWx1ZSh2YWx1ZSk7XG59XG4iXX0=