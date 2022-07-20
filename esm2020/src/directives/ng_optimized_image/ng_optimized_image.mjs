/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injector, Input, NgModule, NgZone, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
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
 * ** EXPERIMENTAL **
 *
 * TODO: add Image directive description.
 *
 * @usageNotes
 * TODO: add Image directive usage notes.
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
        ngDevMode && assertGreaterThanZeroNumber(value, 'width');
        this._width = inputToInteger(value);
    }
    get width() {
        return this._width;
    }
    /**
     * The intrinsic height of the image in px.
     */
    set height(value) {
        ngDevMode && assertGreaterThanZeroNumber(value, 'height');
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
            assertNonEmptyInput('rawSrc', this.rawSrc);
            assertValidRawSrcset(this.rawSrcset);
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-b5afd62", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.0-next.0+sha-b5afd62", type: NgOptimizedImage, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", rawSrcset: "rawSrcset", width: "width", height: "height", loading: "loading", priority: "priority", src: "src", srcset: "srcset" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-b5afd62", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
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
/**
 * NgModule that declares and exports the `NgOptimizedImage` directive.
 * This NgModule is a compatibility layer for apps that use pre-v14
 * versions of Angular (before the `standalone` flag became available).
 *
 * The `NgOptimizedImage` will become a standalone directive in v14 and
 * this NgModule will be removed.
 */
export class NgOptimizedImageModule {
}
NgOptimizedImageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-b5afd62", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.0-next.0+sha-b5afd62", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-b5afd62", ngImport: i0, type: NgOptimizedImageModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-b5afd62", ngImport: i0, type: NgOptimizedImageModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [NgOptimizedImage],
                    exports: [NgOptimizedImage],
                }]
        }] });
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
        throw new RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir.rawSrc)} has detected that the \`src\` has already been set (to ` +
            `\`${dir.src}\`). Please remove the \`src\` attribute from this image. ` +
            `The NgOptimizedImage directive will use the \`rawSrc\` to compute ` +
            `the final image URL and set the \`src\` itself.`);
    }
}
// Verifies that there is no `srcset` set on a host element.
function assertNoConflictingSrcset(dir) {
    if (dir.srcset) {
        throw new RuntimeError(2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */, `${imgDirectiveDetails(dir.rawSrc)} has detected that the \`srcset\` has been set. ` +
            `Please replace the \`srcset\` attribute from this image with \`rawSrcset\`. ` +
            `The NgOptimizedImage directive uses \`rawSrcset\` to set the \`srcset\` attribute` +
            `at a time that does not disrupt lazy loading.`);
    }
}
// Verifies that the `rawSrc` is not a Base64-encoded image.
function assertNotBase64Image(dir) {
    let rawSrc = dir.rawSrc.trim();
    if (rawSrc.startsWith('data:')) {
        if (rawSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
            rawSrc = rawSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
        }
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
            `to a Base64-encoded string (${rawSrc}). Base64-encoded strings are ` +
            `not supported by the NgOptimizedImage directive. Use a regular \`src\` ` +
            `attribute (instead of \`rawSrc\`) to disable the NgOptimizedImage ` +
            `directive for this element.`);
    }
}
// Verifies that the `rawSrc` is not a Blob URL.
function assertNotBlobURL(dir) {
    const rawSrc = dir.rawSrc.trim();
    if (rawSrc.startsWith('blob:')) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
            `to a blob URL (${rawSrc}). Blob URLs are not supported by the ` +
            `NgOptimizedImage directive. Use a regular \`src\` attribute ` +
            `(instead of \`rawSrc\`) to disable the NgOptimizedImage directive ` +
            `for this element.`);
    }
}
// Verifies that the input is set to a non-empty string.
function assertNonEmptyInput(name, value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    if (!isString || isEmptyString) {
        const extraMessage = isEmptyString ? ' (empty string)' : '';
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`${name}\` has an invalid value: ` +
            `expecting a non-empty string, but got: \`${value}\`${extraMessage}.`);
    }
}
// Verifies that the `rawSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x"
export function assertValidRawSrcset(value) {
    if (value == null)
        return;
    assertNonEmptyInput('rawSrcset', value);
    const stringVal = value;
    const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
    const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
    if (isValidDensityDescriptor) {
        assertUnderDensityCap(stringVal);
    }
    const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
    if (!isValidSrcset) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrcset\` has an invalid value: ` +
            `expecting width descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x"), ` +
            `but got: \`${stringVal}\``);
    }
}
function assertUnderDensityCap(value) {
    const underDensityCap = value.split(',').every(num => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
    if (!underDensityCap) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrcset\` contains an unsupported image density:` +
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
    return new RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.rawSrc)} has detected that the \`${inputName}\` is updated after the ` +
        `initialization. The NgOptimizedImage directive will not react to this input change.`);
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
function assertGreaterThanZeroNumber(inputValue, inputName) {
    const validNumber = typeof inputValue === 'number' && inputValue > 0;
    const validString = typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
    if (!validNumber && !validString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`${inputName}\` has an invalid ` +
            `value: expecting a number that represents the ${inputName} in pixels, but got: ` +
            `\`${inputValue}\`.`);
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
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} has detected that the aspect ratio of the ` +
                `image does not match the aspect ratio indicated by the width and height attributes. ` +
                `Intrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h (aspect-ratio: ${intrinsicAspectRatio}). ` +
                `Supplied width and height attributes: ${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${suppliedAspectRatio}). ` +
                `To fix this, update the width and height attributes.`));
        }
        else {
            if (stylingDistortion) {
                console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.rawSrc)} has detected that the aspect ratio of the ` +
                    `rendered image does not match the image's intrinsic aspect ratio. ` +
                    `Intrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h (aspect-ratio: ${intrinsicAspectRatio}). ` +
                    `Rendered image size: ${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ${renderedAspectRatio}). ` +
                    `This issue can occur if "width" and "height" attributes are added to an image ` +
                    `without updating the corresponding image styling. In most cases, ` +
                    `adding "height: auto" or "width: auto" to the image styling will fix this issue.`));
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
        throw new RuntimeError(2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir.rawSrc)} has detected that these required attributes` +
            ` are missing:\`${missingAttributes.join(',')}\`. Including "width" and "height" ` +
            `attributes will prevent image-related layout shifts. Please include "width" and ` +
            `"height" attributes on the image tag.`);
    }
}
// Verifies that the `loading` attribute is set to a valid input &
// is not used on priority images.
function assertValidLoadingInput(dir) {
    if (dir.loading && dir.priority) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`loading\` attribute ` +
            `was used on an image that was marked "priority". Images marked "priority" ` +
            `are always eagerly loaded and this behavior cannot be overwritten by using ` +
            `the "loading" attribute.`);
    }
    const validInputs = ['auto', 'eager', 'lazy'];
    if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`loading\` attribute ` +
            `has an invalid value: expecting "lazy", "eager", or "auto" but got: ` +
            `\`${dir.loading}\`.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBZ0MsU0FBUyxFQUFpQixtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBSWpPLE9BQU8sRUFBQyxZQUFZLEVBQWMsTUFBTSw4QkFBOEIsQ0FBQztBQUN2RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRTNDOzs7Ozs7R0FNRztBQUNILE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sNkJBQTZCLEdBQUcsMkJBQTJCLENBQUM7QUFFbEU7OztHQUdHO0FBQ0gsTUFBTSwrQkFBK0IsR0FBRyxpQ0FBaUMsQ0FBQztBQUUxRTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxDQUFDO0FBRTdDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixHQUFHLENBQUMsQ0FBQztBQUVoRDs7R0FFRztBQUNILE1BQU0sc0JBQXNCLEdBQUcsRUFBRSxDQUFDO0FBRWxDOzs7Ozs7O0dBT0c7QUFJSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ2tDLFdBQXdCLEVBQVUs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QUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGUsIE5nWm9uZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyLCBTaW1wbGVDaGFuZ2VzLCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7TENQSW1hZ2VPYnNlcnZlcn0gZnJvbSAnLi9sY3BfaW1hZ2Vfb2JzZXJ2ZXInO1xuaW1wb3J0IHtQcmVjb25uZWN0TGlua0NoZWNrZXJ9IGZyb20gJy4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgd2lkdGggZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMTAwdywgMjAwd1wiLlxuICovXG5jb25zdCBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkK3dcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMXgsIDJ4XCIuXG4gKi9cbmNvbnN0IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZChcXC5cXGQpP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFzcGVjdCByYXRpb3MgYXJlIHNpbWlsYXIgaW4gdmFsdWUuXG4gKi9cbmNvbnN0IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0UgPSAuMTtcblxuLyoqXG4gKiAqKiBFWFBFUklNRU5UQUwgKipcbiAqXG4gKiBUT0RPOiBhZGQgSW1hZ2UgZGlyZWN0aXZlIGRlc2NyaXB0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUT0RPOiBhZGQgSW1hZ2UgZGlyZWN0aXZlIHVzYWdlIG5vdGVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdpbWdbcmF3U3JjXScsXG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2UgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KElNQUdFX0xPQURFUikgcHJpdmF0ZSBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIsIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICAgIHByaXZhdGUgaW1nRWxlbWVudDogRWxlbWVudFJlZiwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLy8gUHJpdmF0ZSBmaWVsZHMgdG8ga2VlcCBub3JtYWxpemVkIGlucHV0IHZhbHVlcy5cbiAgcHJpdmF0ZSBfd2lkdGg/OiBudW1iZXI7XG4gIHByaXZhdGUgX2hlaWdodD86IG51bWJlcjtcbiAgcHJpdmF0ZSBfcHJpb3JpdHkgPSBmYWxzZTtcblxuICAvLyBDYWxjdWxhdGUgdGhlIHJld3JpdHRlbiBgc3JjYCBvbmNlIGFuZCBzdG9yZSBpdC5cbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgcmVwZXRpdGl2ZSBjYWxjdWxhdGlvbnMgYW5kIG1ha2Ugc3VyZSB0aGUgZGlyZWN0aXZlIGNsZWFudXAgaW4gdGhlXG4gIC8vIGBuZ09uRGVzdHJveWAgZG9lcyBub3QgcmVseSBvbiB0aGUgYElNQUdFX0xPQURFUmAgbG9naWMgKHdoaWNoIGluIHR1cm4gY2FuIHJlbHkgb24gc29tZSBvdGhlclxuICAvLyBpbnN0YW5jZSB0aGF0IG1pZ2h0IGJlIGFscmVhZHkgZGVzdHJveWVkKS5cbiAgcHJpdmF0ZSBfcmV3cml0dGVuU3JjOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIHNvdXJjZSBpbWFnZS5cbiAgICogSW1hZ2UgbmFtZSB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGFuZCB0aGUgZmluYWwgVVJMIHdpbGwgYmUgYXBwbGllZCBhcyB0aGUgYHNyY2BcbiAgICogcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKi9cbiAgQElucHV0KCkgcmF3U3JjITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gICAqIFRoZSBpbWFnZSBuYW1lIHdpbGwgYmUgdGFrZW4gZnJvbSBgcmF3U3JjYCBhbmQgY29tYmluZWQgd2l0aCB0aGUgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5XG4gICAqIGRlc2NyaXB0b3JzIHRvIGdlbmVyYXRlIHRoZSBmaW5hbCBgc3Jjc2V0YCBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIDxpbWcgcmF3U3JjPVwiaGVsbG8uanBnXCIgcmF3U3Jjc2V0PVwiMTAwdywgMjAwd1wiIC8+ICA9PlxuICAgKiA8aW1nIHNyYz1cInBhdGgvaGVsbG8uanBnXCIgc3Jjc2V0PVwicGF0aC9oZWxsby5qcGc/dz0xMDAgMTAwdywgcGF0aC9oZWxsby5qcGc/dz0yMDAgMjAwd1wiIC8+XG4gICAqL1xuICBASW5wdXQoKSByYXdTcmNzZXQhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHdpZHRoKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRHcmVhdGVyVGhhblplcm9OdW1iZXIodmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGhlaWdodCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0R3JlYXRlclRoYW5aZXJvTnVtYmVyKHZhbHVlLCAnaGVpZ2h0Jyk7XG4gICAgdGhpcy5faGVpZ2h0ID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCBoZWlnaHQoKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZGVzaXJlZCBsb2FkaW5nIGJlaGF2aW9yIChsYXp5LCBlYWdlciwgb3IgYXV0bykuXG4gICAqIFRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciB0aGlzIGlucHV0IGlzIG9wdGluZy1vdXQgbm9uLXByaW9yaXR5IGltYWdlc1xuICAgKiBmcm9tIGxhenkgbG9hZGluZyBieSBtYXJraW5nIHRoZW0gbG9hZGluZz0nZWFnZXInIG9yIGxvYWRpbmc9J2F1dG8nLlxuICAgKiBUaGlzIGlucHV0IHNob3VsZCBub3QgYmUgdXNlZCB3aXRoIHByaW9yaXR5IGltYWdlcy5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRpbmc/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW1hZ2Ugc2hvdWxkIGhhdmUgYSBoaWdoIHByaW9yaXR5LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHByaW9yaXR5KHZhbHVlOiBzdHJpbmd8Ym9vbGVhbnx1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9wcmlvcml0eSA9IGlucHV0VG9Cb29sZWFuKHZhbHVlKTtcbiAgfVxuICBnZXQgcHJpb3JpdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByaW9yaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHZhbHVlIG9mIHRoZSBgc3JjYCBhbmQgYHNyY3NldGAgaWYgdGhleSdyZSBzZXQgb24gYSBob3N0IDxpbWc+IGVsZW1lbnQuXG4gICAqIFRoZXNlIGlucHV0cyBhcmUgbmVlZGVkIHRvIHZlcmlmeSB0aGF0IHRoZXJlIGFyZSBubyBjb25mbGljdGluZyBzb3VyY2VzIHByb3ZpZGVkXG4gICAqIGF0IHRoZSBzYW1lIHRpbWUgKGUuZy4gYHNyY2AgYW5kIGByYXdTcmNgIHRvZ2V0aGVyIG9yIGBzcmNzZXRgIGFuZCBgcmF3U3Jjc2V0YCxcbiAgICogdGh1cyBjYXVzaW5nIGFuIGFtYmlndWl0eSBvbiB3aGljaCBzcmMgdG8gdXNlKSBhbmQgdGhhdCBpbWFnZXNcbiAgICogZG9uJ3Qgc3RhcnQgdG8gbG9hZCB1bnRpbCBhIGxhenkgbG9hZGluZyBzdHJhdGVneSBpcyBzZXQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuICBASW5wdXQoKSBzcmNzZXQ/OiBzdHJpbmc7XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9uRW1wdHlJbnB1dCgncmF3U3JjJywgdGhpcy5yYXdTcmMpO1xuICAgICAgYXNzZXJ0VmFsaWRSYXdTcmNzZXQodGhpcy5yYXdTcmNzZXQpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyh0aGlzKTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQodGhpcyk7XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVUkwodGhpcyk7XG4gICAgICBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQodGhpcyk7XG4gICAgICBhc3NlcnROb0ltYWdlRGlzdG9ydGlvbih0aGlzLCB0aGlzLmltZ0VsZW1lbnQsIHRoaXMucmVuZGVyZXIpO1xuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuY2hlY2sodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5yYXdTcmMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTW9uaXRvciB3aGV0aGVyIGFuIGltYWdlIGlzIGFuIExDUCBlbGVtZW50IG9ubHkgaW4gY2FzZVxuICAgICAgICAvLyB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUgaXMgbWlzc2luZy4gT3RoZXJ3aXNlLCBhbiBpbWFnZVxuICAgICAgICAvLyBoYXMgdGhlIG5lY2Vzc2FyeSBzZXR0aW5ncyBhbmQgbm8gZXh0cmEgY2hlY2tzIGFyZSByZXF1aXJlZC5cbiAgICAgICAgd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAgICAgKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PlxuICAgICAgICAgICAgICAgIG9ic2VydmVyLnJlZ2lzdGVySW1hZ2UodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5yYXdTcmMpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdsb2FkaW5nJywgdGhpcy5nZXRMb2FkaW5nQmVoYXZpb3IoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdmZXRjaHByaW9yaXR5JywgdGhpcy5nZXRGZXRjaFByaW9yaXR5KCkpO1xuICAgIC8vIFRoZSBgc3JjYCBhbmQgYHNyY3NldGAgYXR0cmlidXRlcyBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSk7XG4gICAgaWYgKHRoaXMucmF3U3Jjc2V0KSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyY3NldCcsIHRoaXMuZ2V0UmV3cml0dGVuU3Jjc2V0KCkpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgICAgICAgdGhpcywgY2hhbmdlcywgWydyYXdTcmMnLCAncmF3U3Jjc2V0JywgJ3dpZHRoJywgJ2hlaWdodCcsICdwcmlvcml0eSddKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLmxvYWRpbmcgIT09IHVuZGVmaW5lZCAmJiBpc05vbkVtcHR5U3RyaW5nKHRoaXMubG9hZGluZykpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRpbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2VhZ2VyJyA6ICdsYXp5JztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RmV0Y2hQcmlvcml0eSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2hpZ2gnIDogJ2F1dG8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmMoKTogc3RyaW5nIHtcbiAgICAvLyBJbWFnZUxvYWRlckNvbmZpZyBzdXBwb3J0cyBzZXR0aW5nIGEgd2lkdGggcHJvcGVydHkuIEhvd2V2ZXIsIHdlJ3JlIG5vdCBzZXR0aW5nIHdpZHRoIGhlcmVcbiAgICAvLyBiZWNhdXNlIGlmIHRoZSBkZXZlbG9wZXIgdXNlcyByZW5kZXJlZCB3aWR0aCBpbnN0ZWFkIG9mIGludHJpbnNpYyB3aWR0aCBpbiB0aGUgSFRNTCB3aWR0aFxuICAgIC8vIGF0dHJpYnV0ZSwgdGhlIGltYWdlIHJlcXVlc3RlZCBtYXkgYmUgdG9vIHNtYWxsIGZvciAyeCsgc2NyZWVucy5cbiAgICBpZiAoIXRoaXMuX3Jld3JpdHRlblNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5yYXdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZXdyaXR0ZW5TcmMgPSB0aGlzLmltYWdlTG9hZGVyKGltZ0NvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZXdyaXR0ZW5TcmM7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHdpZHRoU3JjU2V0ID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdCh0aGlzLnJhd1NyY3NldCk7XG4gICAgY29uc3QgZmluYWxTcmNzID0gdGhpcy5yYXdTcmNzZXQuc3BsaXQoJywnKS5maWx0ZXIoc3JjID0+IHNyYyAhPT0gJycpLm1hcChzcmNTdHIgPT4ge1xuICAgICAgc3JjU3RyID0gc3JjU3RyLnRyaW0oKTtcbiAgICAgIGNvbnN0IHdpZHRoID0gd2lkdGhTcmNTZXQgPyBwYXJzZUZsb2F0KHNyY1N0cikgOiBwYXJzZUZsb2F0KHNyY1N0cikgKiB0aGlzLndpZHRoITtcbiAgICAgIHJldHVybiBgJHt0aGlzLmltYWdlTG9hZGVyKHtzcmM6IHRoaXMucmF3U3JjLCB3aWR0aH0pfSAke3NyY1N0cn1gO1xuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZXdyaXR0ZW5TcmMgIT09IG51bGwpIHtcbiAgICAgICAgd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAgICAgKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiBvYnNlcnZlci51bnJlZ2lzdGVySW1hZ2UodGhpcy5fcmV3cml0dGVuU3JjISkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmltZ0VsZW1lbnQubmF0aXZlRWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5cblxuLyoqXG4gKiBOZ01vZHVsZSB0aGF0IGRlY2xhcmVzIGFuZCBleHBvcnRzIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICogVGhpcyBOZ01vZHVsZSBpcyBhIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIGFwcHMgdGhhdCB1c2UgcHJlLXYxNFxuICogdmVyc2lvbnMgb2YgQW5ndWxhciAoYmVmb3JlIHRoZSBgc3RhbmRhbG9uZWAgZmxhZyBiZWNhbWUgYXZhaWxhYmxlKS5cbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIHdpbGwgYmVjb21lIGEgc3RhbmRhbG9uZSBkaXJlY3RpdmUgaW4gdjE0IGFuZFxuICogdGhpcyBOZ01vZHVsZSB3aWxsIGJlIHJlbW92ZWQuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW05nT3B0aW1pemVkSW1hZ2VdLFxuICBleHBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2VNb2R1bGUge1xufVxuXG4vKioqKiogSGVscGVycyAqKioqKi9cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBpbnRlZ2VyLlxuZnVuY3Rpb24gaW5wdXRUb0ludGVnZXIodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gcGFyc2VJbnQodmFsdWUsIDEwKSA6IHZhbHVlO1xufVxuXG4vLyBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGJvb2xlYW4uXG5mdW5jdGlvbiBpbnB1dFRvQm9vbGVhbih2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBgJHt2YWx1ZX1gICE9PSAnZmFsc2UnO1xufVxuXG5mdW5jdGlvbiBpc05vbkVtcHR5U3RyaW5nKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIHJldHVybiBpc1N0cmluZyAmJiAhaXNFbXB0eVN0cmluZztcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgZnVuY3Rpb24sIHBhc3NpbmcgYW4gaW5zdGFuY2Ugb2YgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBhcyBhbiBhcmd1bWVudC5cbiAqXG4gKiBOb3RlczpcbiAqIC0gdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBpcyBhIHRyZWUtc2hha2FibGUgcHJvdmlkZXIsIHByb3ZpZGVkIGluICdyb290JyxcbiAqICAgdGh1cyBpdCdzIGEgc2luZ2xldG9uIHdpdGhpbiB0aGlzIGFwcGxpY2F0aW9uXG4gKiAtIHRoZSBwcm9jZXNzIG9mIGBMQ1BJbWFnZU9ic2VydmVyYCBjcmVhdGlvbiBhbmQgYW4gYWN0dWFsIG9wZXJhdGlvbiBhcmUgaW52b2tlZCBvdXRzaWRlIG9mIHRoZVxuICogICBOZ1pvbmUgdG8gbWFrZSBzdXJlIG5vbmUgb2YgdGhlIGNhbGxzIGluc2lkZSB0aGUgYExDUEltYWdlT2JzZXJ2ZXJgIGNsYXNzIHRyaWdnZXIgdW5uZWNlc3NhcnlcbiAqICAgY2hhbmdlIGRldGVjdGlvblxuICovXG5mdW5jdGlvbiB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsIG9wZXJhdGlvbjogKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiB2b2lkKTogdm9pZCB7XG4gIGNvbnN0IG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICByZXR1cm4gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICBjb25zdCBvYnNlcnZlciA9IGluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKTtcbiAgICBvcGVyYXRpb24ob2JzZXJ2ZXIpO1xuICB9KTtcbn1cblxuLyoqKioqIEFzc2VydCBmdW5jdGlvbnMgKioqKiovXG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmMpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICAgIGAke1xuICAgICAgICAgICAgaW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgICAgICAgICBkaXIucmF3U3JjKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHNyY1xcYCBoYXMgYWxyZWFkeSBiZWVuIHNldCAodG8gYCArXG4gICAgICAgICAgICBgXFxgJHtkaXIuc3JjfVxcYCkuIFBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY1xcYCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGltYWdlLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCB1c2UgdGhlIFxcYHJhd1NyY1xcYCB0byBjb21wdXRlIGAgK1xuICAgICAgICAgICAgYHRoZSBmaW5hbCBpbWFnZSBVUkwgYW5kIHNldCB0aGUgXFxgc3JjXFxgIGl0c2VsZi5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgc3Jjc2V0XFxgIGhhcyBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgUGxlYXNlIHJlcGxhY2UgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGltYWdlIHdpdGggXFxgcmF3U3Jjc2V0XFxgLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgdXNlcyBcXGByYXdTcmNzZXRcXGAgdG8gc2V0IHRoZSBcXGBzcmNzZXRcXGAgYXR0cmlidXRlYCArXG4gICAgICAgICAgICBgYXQgYSB0aW1lIHRoYXQgZG9lcyBub3QgZGlzcnVwdCBsYXp5IGxvYWRpbmcuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgbm90IGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UuXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAocmF3U3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgcmF3U3JjID0gcmF3U3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIHdhcyBzZXQgYCArXG4gICAgICAgICAgICBgdG8gYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgKCR7cmF3U3JjfSkuIEJhc2U2NC1lbmNvZGVkIHN0cmluZ3MgYXJlIGAgK1xuICAgICAgICAgICAgYG5vdCBzdXBwb3J0ZWQgYnkgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBVc2UgYSByZWd1bGFyIFxcYHNyY1xcYCBgICtcbiAgICAgICAgICAgIGBhdHRyaWJ1dGUgKGluc3RlYWQgb2YgXFxgcmF3U3JjXFxgKSB0byBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGAgK1xuICAgICAgICAgICAgYGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50LmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVSTChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgcmF3U3JjID0gZGlyLnJhd1NyYy50cmltKCk7XG4gIGlmIChyYXdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIHdhcyBzZXQgYCArXG4gICAgICAgICAgICBgdG8gYSBibG9iIFVSTCAoJHtyYXdTcmN9KS4gQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgICtcbiAgICAgICAgICAgIGBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gVXNlIGEgcmVndWxhciBcXGBzcmNcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYChpbnN0ZWFkIG9mIFxcYHJhd1NyY1xcYCkgdG8gZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgYCArXG4gICAgICAgICAgICBgZm9yIHRoaXMgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBpbnB1dCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlJbnB1dChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIGNvbnN0IGV4dHJhTWVzc2FnZSA9IGlzRW1wdHlTdHJpbmcgPyAnIChlbXB0eSBzdHJpbmcpJyA6ICcnO1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgJHtuYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZTogYCArXG4gICAgICAgICAgICBgZXhwZWN0aW5nIGEgbm9uLWVtcHR5IHN0cmluZywgYnV0IGdvdDogXFxgJHt2YWx1ZX1cXGAke2V4dHJhTWVzc2FnZX0uYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY3NldGAgaXMgaW4gYSB2YWxpZCBmb3JtYXQsIGUuZy4gXCIxMDB3LCAyMDB3XCIgb3IgXCIxeCwgMnhcIlxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkUmF3U3Jjc2V0KHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoJ3Jhd1NyY3NldCcsIHZhbHVlKTtcbiAgY29uc3Qgc3RyaW5nVmFsID0gdmFsdWUgYXMgc3RyaW5nO1xuICBjb25zdCBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuICBjb25zdCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IgPSBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcblxuICBpZiAoaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yKSB7XG4gICAgYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKHN0cmluZ1ZhbCk7XG4gIH1cblxuICBjb25zdCBpc1ZhbGlkU3Jjc2V0ID0gaXNWYWxpZFdpZHRoRGVzY3JpcHRvciB8fCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3I7XG4gIGlmICghaXNWYWxpZFNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlOiBgICtcbiAgICAgICAgICAgIGBleHBlY3Rpbmcgd2lkdGggZGVzY3JpcHRvcnMgKGUuZy4gXCIxMDB3LCAyMDB3XCIpIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMgKGUuZy4gXCIxeCwgMnhcIiksIGAgK1xuICAgICAgICAgICAgYGJ1dCBnb3Q6IFxcYCR7c3RyaW5nVmFsfVxcYGApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuZGVyRGVuc2l0eUNhcCh2YWx1ZTogc3RyaW5nKSB7XG4gIGNvbnN0IHVuZGVyRGVuc2l0eUNhcCA9XG4gICAgICB2YWx1ZS5zcGxpdCgnLCcpLmV2ZXJ5KG51bSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3Jjc2V0XFxgIGNvbnRhaW5zIGFuIHVuc3VwcG9ydGVkIGltYWdlIGRlbnNpdHk6YCArXG4gICAgICAgICAgICBgXFxgJHt2YWx1ZX1cXGAuIE5nT3B0aW1pemVkSW1hZ2UgZ2VuZXJhbGx5IHJlY29tbWVuZHMgYSBtYXggaW1hZ2UgZGVuc2l0eSBvZiBgICtcbiAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGJ1dCBzdXBwb3J0cyBpbWFnZSBkZW5zaXRpZXMgdXAgdG8gYCArXG4gICAgICAgICAgICBgJHtBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVB9eC4gVGhlIGh1bWFuIGV5ZSBjYW5ub3QgZGlzdGluZ3Vpc2ggYmV0d2VlbiBpbWFnZSBkZW5zaXRpZXMgYCArXG4gICAgICAgICAgICBgZ3JlYXRlciB0aGFuICR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggLSB3aGljaCBtYWtlcyB0aGVtIHVubmVjZXNzYXJ5IGZvciBgICtcbiAgICAgICAgICAgIGBtb3N0IHVzZSBjYXNlcy4gSW1hZ2VzIHRoYXQgd2lsbCBiZSBwaW5jaC16b29tZWQgYXJlIHR5cGljYWxseSB0aGUgcHJpbWFyeSB1c2UgY2FzZSBmb3JgICtcbiAgICAgICAgICAgIGAke0FCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUH14IGltYWdlcy4gUGxlYXNlIHJlbW92ZSB0aGUgaGlnaCBkZW5zaXR5IGRlc2NyaXB0b3IgYW5kIHRyeSBhZ2Fpbi5gKTtcbiAgfVxufVxuXG4vLyBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4vLyB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgJHtcbiAgICAgICAgICBpbnB1dE5hbWV9XFxgIGlzIHVwZGF0ZWQgYWZ0ZXIgdGhlIGAgK1xuICAgICAgICAgIGBpbml0aWFsaXphdGlvbi4gVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgbm90IHJlYWN0IHRvIHRoaXMgaW5wdXQgY2hhbmdlLmApO1xufVxuXG4vLyBWZXJpZnkgdGhhdCBub25lIG9mIHRoZSBsaXN0ZWQgaW5wdXRzIGhhcyBjaGFuZ2VkLlxuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgY2hhbmdlczogU2ltcGxlQ2hhbmdlcywgaW5wdXRzOiBzdHJpbmdbXSkge1xuICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICdyYXdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGByYXdTcmNgIGlucHV0IGNoYW5nZXMsIHdlIGRldGVjdCB0aGF0IG9ubHkgaW4gdGhlXG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlc2AgaG9vaywgdGh1cyB0aGUgYHJhd1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgcmF3U3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7cmF3U3JjOiBjaGFuZ2VzW2lucHV0XS5wcmV2aW91c1ZhbHVlfSBhcyBOZ09wdGltaXplZEltYWdlO1xuICAgICAgfVxuICAgICAgdGhyb3cgcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpciwgaW5wdXQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuXG5mdW5jdGlvbiBhc3NlcnRHcmVhdGVyVGhhblplcm9OdW1iZXIoaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgdmFsaWROdW1iZXIgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgJiYgaW5wdXRWYWx1ZSA+IDA7XG4gIGNvbnN0IHZhbGlkU3RyaW5nID1cbiAgICAgIHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSAmJiBwYXJzZUludChpbnB1dFZhbHVlKSA+IDA7XG4gIGlmICghdmFsaWROdW1iZXIgJiYgIXZhbGlkU3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgYCArXG4gICAgICAgICAgICBgdmFsdWU6IGV4cGVjdGluZyBhIG51bWJlciB0aGF0IHJlcHJlc2VudHMgdGhlICR7aW5wdXROYW1lfSBpbiBwaXhlbHMsIGJ1dCBnb3Q6IGAgK1xuICAgICAgICAgICAgYFxcYCR7aW5wdXRWYWx1ZX1cXGAuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgcmVuZGVyZWQgaW1hZ2UgaXMgbm90IHZpc3VhbGx5IGRpc3RvcnRlZC4gRWZmZWN0aXZlbHkgdGhpcyBpcyBjaGVja2luZzpcbi8vIC0gV2hldGhlciB0aGUgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgcmVmbGVjdCB0aGUgYWN0dWFsIGRpbWVuc2lvbnMgb2YgdGhlIGltYWdlLlxuLy8gLSBXaGV0aGVyIGltYWdlIHN0eWxpbmcgaXMgXCJjb3JyZWN0XCIgKHNlZSBiZWxvdyBmb3IgYSBsb25nZXIgZXhwbGFuYXRpb24pLlxuZnVuY3Rpb24gYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24oXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBlbGVtZW50OiBFbGVtZW50UmVmPGFueT4sIHJlbmRlcmVyOiBSZW5kZXJlcjIpIHtcbiAgY29uc3QgaW1nID0gZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICBjb25zdCByZW1vdmVMaXN0ZW5lckZuID0gcmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCAoKSA9PiB7XG4gICAgcmVtb3ZlTGlzdGVuZXJGbigpO1xuICAgIGNvbnN0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGltZy5jbGllbnRXaWR0aCk7XG4gICAgY29uc3QgcmVuZGVyZWRIZWlnaHQgPSBwYXJzZUZsb2F0KGltZy5jbGllbnRIZWlnaHQpO1xuICAgIGNvbnN0IHJlbmRlcmVkQXNwZWN0UmF0aW8gPSByZW5kZXJlZFdpZHRoIC8gcmVuZGVyZWRIZWlnaHQ7XG4gICAgY29uc3Qgbm9uWmVyb1JlbmRlcmVkRGltZW5zaW9ucyA9IHJlbmRlcmVkV2lkdGggIT09IDAgJiYgcmVuZGVyZWRIZWlnaHQgIT09IDA7XG5cbiAgICBjb25zdCBpbnRyaW5zaWNXaWR0aCA9IHBhcnNlRmxvYXQoaW1nLm5hdHVyYWxXaWR0aCk7XG4gICAgY29uc3QgaW50cmluc2ljSGVpZ2h0ID0gcGFyc2VGbG9hdChpbWcubmF0dXJhbEhlaWdodCk7XG4gICAgY29uc3QgaW50cmluc2ljQXNwZWN0UmF0aW8gPSBpbnRyaW5zaWNXaWR0aCAvIGludHJpbnNpY0hlaWdodDtcblxuICAgIGNvbnN0IHN1cHBsaWVkV2lkdGggPSBkaXIud2lkdGghO1xuICAgIGNvbnN0IHN1cHBsaWVkSGVpZ2h0ID0gZGlyLmhlaWdodCE7XG4gICAgY29uc3Qgc3VwcGxpZWRBc3BlY3RSYXRpbyA9IHN1cHBsaWVkV2lkdGggLyBzdXBwbGllZEhlaWdodDtcblxuICAgIC8vIFRvbGVyYW5jZSBpcyB1c2VkIHRvIGFjY291bnQgZm9yIHRoZSBpbXBhY3Qgb2Ygc3VicGl4ZWwgcmVuZGVyaW5nLlxuICAgIC8vIER1ZSB0byBzdWJwaXhlbCByZW5kZXJpbmcsIHRoZSByZW5kZXJlZCwgaW50cmluc2ljLCBhbmQgc3VwcGxpZWRcbiAgICAvLyBhc3BlY3QgcmF0aW9zIG9mIGEgY29ycmVjdGx5IGNvbmZpZ3VyZWQgaW1hZ2UgbWF5IG5vdCBleGFjdGx5IG1hdGNoLlxuICAgIC8vIEZvciBleGFtcGxlLCBhIGB3aWR0aD00MDMwIGhlaWdodD0zMDIwYCBpbWFnZSBtaWdodCBoYXZlIGEgcmVuZGVyZWRcbiAgICAvLyBzaXplIG9mIFwiMTA2MncsIDc5Ni40OGhcIi4gKEFuIGFzcGVjdCByYXRpbyBvZiAxLjMzNC4uLiB2cy4gMS4zMzMuLi4pXG4gICAgY29uc3QgaW5hY2N1cmF0ZURpbWVuc2lvbnMgPVxuICAgICAgICBNYXRoLmFicyhzdXBwbGllZEFzcGVjdFJhdGlvIC0gaW50cmluc2ljQXNwZWN0UmF0aW8pID4gQVNQRUNUX1JBVElPX1RPTEVSQU5DRTtcbiAgICBjb25zdCBzdHlsaW5nRGlzdG9ydGlvbiA9IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgJiZcbiAgICAgICAgTWF0aC5hYnMoaW50cmluc2ljQXNwZWN0UmF0aW8gLSByZW5kZXJlZEFzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBgICtcbiAgICAgICAgICAgICAgYGltYWdlIGRvZXMgbm90IG1hdGNoIHRoZSBhc3BlY3QgcmF0aW8gaW5kaWNhdGVkIGJ5IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuIGAgK1xuICAgICAgICAgICAgICBgSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtcbiAgICAgICAgICAgICAgICAgIGludHJpbnNpY0FzcGVjdFJhdGlvfSkuIGAgK1xuICAgICAgICAgICAgICBgU3VwcGxpZWQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzOiAke3N1cHBsaWVkV2lkdGh9dyB4ICR7XG4gICAgICAgICAgICAgICAgICBzdXBwbGllZEhlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7c3VwcGxpZWRBc3BlY3RSYXRpb30pLiBgICtcbiAgICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCB1cGRhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy5gKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdHlsaW5nRGlzdG9ydGlvbikge1xuICAgICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgYCArXG4gICAgICAgICAgICAgICAgYHJlbmRlcmVkIGltYWdlIGRvZXMgbm90IG1hdGNoIHRoZSBpbWFnZSdzIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIGAgK1xuICAgICAgICAgICAgICAgIGBJbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiAke1xuICAgICAgICAgICAgICAgICAgICBpbnRyaW5zaWNBc3BlY3RSYXRpb30pLiBgICtcbiAgICAgICAgICAgICAgICBgUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRBc3BlY3RSYXRpb30pLiBgICtcbiAgICAgICAgICAgICAgICBgVGhpcyBpc3N1ZSBjYW4gb2NjdXIgaWYgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGF0dHJpYnV0ZXMgYXJlIGFkZGVkIHRvIGFuIGltYWdlIGAgK1xuICAgICAgICAgICAgICAgIGB3aXRob3V0IHVwZGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nIGltYWdlIHN0eWxpbmcuIEluIG1vc3QgY2FzZXMsIGAgK1xuICAgICAgICAgICAgICAgIGBhZGRpbmcgXCJoZWlnaHQ6IGF1dG9cIiBvciBcIndpZHRoOiBhdXRvXCIgdG8gdGhlIGltYWdlIHN0eWxpbmcgd2lsbCBmaXggdGhpcyBpc3N1ZS5gKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLy8gVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgbWlzc2luZ0F0dHJpYnV0ZXMgPSBbXTtcbiAgaWYgKGRpci53aWR0aCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCd3aWR0aCcpO1xuICBpZiAoZGlyLmhlaWdodCA9PT0gdW5kZWZpbmVkKSBtaXNzaW5nQXR0cmlidXRlcy5wdXNoKCdoZWlnaHQnKTtcbiAgaWYgKG1pc3NpbmdBdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJFUVVJUkVEX0lOUFVUX01JU1NJTkcsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZXNlIHJlcXVpcmVkIGF0dHJpYnV0ZXNgICtcbiAgICAgICAgICAgIGAgYXJlIG1pc3Npbmc6XFxgJHttaXNzaW5nQXR0cmlidXRlcy5qb2luKCcsJyl9XFxgLiBJbmNsdWRpbmcgXCJ3aWR0aFwiIGFuZCBcImhlaWdodFwiIGAgK1xuICAgICAgICAgICAgYGF0dHJpYnV0ZXMgd2lsbCBwcmV2ZW50IGltYWdlLXJlbGF0ZWQgbGF5b3V0IHNoaWZ0cy4gUGxlYXNlIGluY2x1ZGUgXCJ3aWR0aFwiIGFuZCBgICtcbiAgICAgICAgICAgIGBcImhlaWdodFwiIGF0dHJpYnV0ZXMgb24gdGhlIGltYWdlIHRhZy5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgbG9hZGluZ2AgYXR0cmlidXRlIGlzIHNldCB0byBhIHZhbGlkIGlucHV0ICZcbi8vIGlzIG5vdCB1c2VkIG9uIHByaW9yaXR5IGltYWdlcy5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLmxvYWRpbmcgJiYgZGlyLnByaW9yaXR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBJbWFnZXMgbWFya2VkIFwicHJpb3JpdHlcIiBgICtcbiAgICAgICAgICAgIGBhcmUgYWx3YXlzIGVhZ2VybHkgbG9hZGVkIGFuZCB0aGlzIGJlaGF2aW9yIGNhbm5vdCBiZSBvdmVyd3JpdHRlbiBieSB1c2luZyBgICtcbiAgICAgICAgICAgIGB0aGUgXCJsb2FkaW5nXCIgYXR0cmlidXRlLmApO1xuICB9XG4gIGNvbnN0IHZhbGlkSW5wdXRzID0gWydhdXRvJywgJ2VhZ2VyJywgJ2xhenknXTtcbiAgaWYgKHR5cGVvZiBkaXIubG9hZGluZyA9PT0gJ3N0cmluZycgJiYgIXZhbGlkSW5wdXRzLmluY2x1ZGVzKGRpci5sb2FkaW5nKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgaGFzIGFuIGludmFsaWQgdmFsdWU6IGV4cGVjdGluZyBcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIiBidXQgZ290OiBgICtcbiAgICAgICAgICAgIGBcXGAke2Rpci5sb2FkaW5nfVxcYC5gKTtcbiAgfVxufVxuIl19