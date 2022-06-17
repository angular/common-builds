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
            assertRequiredNumberInput(this, this.width, 'width');
            assertRequiredNumberInput(this, this.height, 'height');
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-1314b1c", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.0+sha-1314b1c", type: NgOptimizedImage, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", rawSrcset: "rawSrcset", width: "width", height: "height", loading: "loading", priority: "priority", src: "src", srcset: "srcset" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-1314b1c", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
NgOptimizedImageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-1314b1c", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.1.0-next.0+sha-1314b1c", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-1314b1c", ngImport: i0, type: NgOptimizedImageModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-1314b1c", ngImport: i0, type: NgOptimizedImageModule, decorators: [{
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
    const isValidSrcset = VALID_WIDTH_DESCRIPTOR_SRCSET.test(value) ||
        VALID_DENSITY_DESCRIPTOR_SRCSET.test(value);
    if (!isValidSrcset) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrcset\` has an invalid value: ` +
            `expecting width descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x"), ` +
            `but got: \`${value}\``);
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
function assertRequiredNumberInput(dir, inputValue, inputName) {
    if (typeof inputValue === 'undefined') {
        throw new RuntimeError(2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir.rawSrc)} has detected that the required \`${inputName}\` ` +
            `attribute is missing. Please specify the \`${inputName}\` attribute ` +
            `on the mentioned element.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBZ0MsU0FBUyxFQUFpQixtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBSWpPLE9BQU8sRUFBQyxZQUFZLEVBQWMsTUFBTSw4QkFBOEIsQ0FBQztBQUN2RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRTNDOzs7Ozs7R0FNRztBQUNILE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sNkJBQTZCLEdBQUcsMkJBQTJCLENBQUM7QUFFbEU7OztHQUdHO0FBQ0gsTUFBTSwrQkFBK0IsR0FBRyxpQ0FBaUMsQ0FBQztBQUUxRTs7R0FFRztBQUNILE1BQU0sc0JBQXNCLEdBQUcsRUFBRSxDQUFDO0FBRWxDOzs7Ozs7O0dBT0c7QUFJSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ2tDLFdBQXdCLEVBQVUsUUFBbUIsRUFDM0UsVUFBc0IsRUFBVSxRQUFrQjtRQUQ1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDM0UsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUFV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QU8sQ0FBQyxFQUFFO1FBQ3pFLE1BQU0sSUFBSSxZQUFZLDRDQUVsQiw2RUFBNkU7WUFDekUsc0VBQXNFO1lBQ3RFLEtBQUssR0FBRyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7S0FDaEM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGUsIE5nWm9uZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyLCBTaW1wbGVDaGFuZ2VzLCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7TENQSW1hZ2VPYnNlcnZlcn0gZnJvbSAnLi9sY3BfaW1hZ2Vfb2JzZXJ2ZXInO1xuaW1wb3J0IHtQcmVjb25uZWN0TGlua0NoZWNrZXJ9IGZyb20gJy4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgd2lkdGggZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMTAwdywgMjAwd1wiLlxuICovXG5jb25zdCBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkK3dcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMXgsIDJ4XCIuXG4gKi9cbmNvbnN0IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZChcXC5cXGQpP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHR3byBhc3BlY3QgcmF0aW9zIGFyZSBzaW1pbGFyIGluIHZhbHVlLlxuICovXG5jb25zdCBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFID0gLjE7XG5cbi8qKlxuICogKiogRVhQRVJJTUVOVEFMICoqXG4gKlxuICogVE9ETzogYWRkIEltYWdlIGRpcmVjdGl2ZSBkZXNjcmlwdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVE9ETzogYWRkIEltYWdlIGRpcmVjdGl2ZSB1c2FnZSBub3Rlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW1nW3Jhd1NyY10nLFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEluamVjdChJTUFHRV9MT0FERVIpIHByaXZhdGUgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyLCBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgICBwcml2YXRlIGltZ0VsZW1lbnQ6IEVsZW1lbnRSZWYsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIC8vIFByaXZhdGUgZmllbGRzIHRvIGtlZXAgbm9ybWFsaXplZCBpbnB1dCB2YWx1ZXMuXG4gIHByaXZhdGUgX3dpZHRoPzogbnVtYmVyO1xuICBwcml2YXRlIF9oZWlnaHQ/OiBudW1iZXI7XG4gIHByaXZhdGUgX3ByaW9yaXR5ID0gZmFsc2U7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSByZXdyaXR0ZW4gYHNyY2Agb25jZSBhbmQgc3RvcmUgaXQuXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIHJlcGV0aXRpdmUgY2FsY3VsYXRpb25zIGFuZCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBjbGVhbnVwIGluIHRoZVxuICAvLyBgbmdPbkRlc3Ryb3lgIGRvZXMgbm90IHJlbHkgb24gdGhlIGBJTUFHRV9MT0FERVJgIGxvZ2ljICh3aGljaCBpbiB0dXJuIGNhbiByZWx5IG9uIHNvbWUgb3RoZXJcbiAgLy8gaW5zdGFuY2UgdGhhdCBtaWdodCBiZSBhbHJlYWR5IGRlc3Ryb3llZCkuXG4gIHByaXZhdGUgX3Jld3JpdHRlblNyYzogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCgpIHJhd1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogQSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICAgKiBUaGUgaW1hZ2UgbmFtZSB3aWxsIGJlIHRha2VuIGZyb20gYHJhd1NyY2AgYW5kIGNvbWJpbmVkIHdpdGggdGhlIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eVxuICAgKiBkZXNjcmlwdG9ycyB0byBnZW5lcmF0ZSB0aGUgZmluYWwgYHNyY3NldGAgcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiA8aW1nIHJhd1NyYz1cImhlbGxvLmpwZ1wiIHJhd1NyY3NldD1cIjEwMHcsIDIwMHdcIiAvPiAgPT5cbiAgICogPGltZyBzcmM9XCJwYXRoL2hlbGxvLmpwZ1wiIHNyY3NldD1cInBhdGgvaGVsbG8uanBnP3c9MTAwIDEwMHcsIHBhdGgvaGVsbG8uanBnP3c9MjAwIDIwMHdcIiAvPlxuICAgKi9cbiAgQElucHV0KCkgcmF3U3Jjc2V0ITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgaW50cmluc2ljIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCB3aWR0aCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0R3JlYXRlclRoYW5aZXJvTnVtYmVyKHZhbHVlLCAnd2lkdGgnKTtcbiAgICB0aGlzLl93aWR0aCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgd2lkdGgoKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRyaW5zaWMgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBoZWlnaHQodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydEdyZWF0ZXJUaGFuWmVyb051bWJlcih2YWx1ZSwgJ2hlaWdodCcpO1xuICAgIHRoaXMuX2hlaWdodCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgaGVpZ2h0KCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRlc2lyZWQgbG9hZGluZyBiZWhhdmlvciAobGF6eSwgZWFnZXIsIG9yIGF1dG8pLlxuICAgKiBUaGUgcHJpbWFyeSB1c2UgY2FzZSBmb3IgdGhpcyBpbnB1dCBpcyBvcHRpbmctb3V0IG5vbi1wcmlvcml0eSBpbWFnZXNcbiAgICogZnJvbSBsYXp5IGxvYWRpbmcgYnkgbWFya2luZyB0aGVtIGxvYWRpbmc9J2VhZ2VyJyBvciBsb2FkaW5nPSdhdXRvJy5cbiAgICogVGhpcyBpbnB1dCBzaG91bGQgbm90IGJlIHVzZWQgd2l0aCBwcmlvcml0eSBpbWFnZXMuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkaW5nPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBwcmlvcml0eSh2YWx1ZTogc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fcHJpb3JpdHkgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IHByaW9yaXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcmlvcml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB2YWx1ZSBvZiB0aGUgYHNyY2AgYW5kIGBzcmNzZXRgIGlmIHRoZXkncmUgc2V0IG9uIGEgaG9zdCA8aW1nPiBlbGVtZW50LlxuICAgKiBUaGVzZSBpbnB1dHMgYXJlIG5lZWRlZCB0byB2ZXJpZnkgdGhhdCB0aGVyZSBhcmUgbm8gY29uZmxpY3Rpbmcgc291cmNlcyBwcm92aWRlZFxuICAgKiBhdCB0aGUgc2FtZSB0aW1lIChlLmcuIGBzcmNgIGFuZCBgcmF3U3JjYCB0b2dldGhlciBvciBgc3Jjc2V0YCBhbmQgYHJhd1NyY3NldGAsXG4gICAqIHRodXMgY2F1c2luZyBhbiBhbWJpZ3VpdHkgb24gd2hpY2ggc3JjIHRvIHVzZSkgYW5kIHRoYXQgaW1hZ2VzXG4gICAqIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyYz86IHN0cmluZztcbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vbkVtcHR5SW5wdXQoJ3Jhd1NyYycsIHRoaXMucmF3U3JjKTtcbiAgICAgIGFzc2VydFZhbGlkUmF3U3Jjc2V0KHRoaXMucmF3U3Jjc2V0KTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmFzZTY0SW1hZ2UodGhpcyk7XG4gICAgICBhc3NlcnROb3RCbG9iVVJMKHRoaXMpO1xuICAgICAgYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dCh0aGlzLCB0aGlzLndpZHRoLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydFJlcXVpcmVkTnVtYmVySW5wdXQodGhpcywgdGhpcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICAgIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KHRoaXMpO1xuICAgICAgYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24odGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKTtcbiAgICAgIGlmICh0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IGNoZWNrZXIgPSB0aGlzLmluamVjdG9yLmdldChQcmVjb25uZWN0TGlua0NoZWNrZXIpO1xuICAgICAgICBjaGVja2VyLmNoZWNrKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMucmF3U3JjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE1vbml0b3Igd2hldGhlciBhbiBpbWFnZSBpcyBhbiBMQ1AgZWxlbWVudCBvbmx5IGluIGNhc2VcbiAgICAgICAgLy8gdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGlzIG1pc3NpbmcuIE90aGVyd2lzZSwgYW4gaW1hZ2VcbiAgICAgICAgLy8gaGFzIHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgYW5kIG5vIGV4dHJhIGNoZWNrcyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIHdpdGhMQ1BJbWFnZU9ic2VydmVyKFxuICAgICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT5cbiAgICAgICAgICAgICAgICBvYnNlcnZlci5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMucmF3U3JjKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbG9hZGluZycsIHRoaXMuZ2V0TG9hZGluZ0JlaGF2aW9yKCkpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnZmV0Y2hwcmlvcml0eScsIHRoaXMuZ2V0RmV0Y2hQcmlvcml0eSgpKTtcbiAgICAvLyBUaGUgYHNyY2AgYW5kIGBzcmNzZXRgIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIHNldCBsYXN0IHNpbmNlIG90aGVyIGF0dHJpYnV0ZXNcbiAgICAvLyBjb3VsZCBhZmZlY3QgdGhlIGltYWdlJ3MgbG9hZGluZyBiZWhhdmlvci5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyYycsIHRoaXMuZ2V0UmV3cml0dGVuU3JjKCkpO1xuICAgIGlmICh0aGlzLnJhd1NyY3NldCkge1xuICAgICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmNzZXQnLCB0aGlzLmdldFJld3JpdHRlblNyY3NldCgpKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgICAgICAgIHRoaXMsIGNoYW5nZXMsIFsncmF3U3JjJywgJ3Jhd1NyY3NldCcsICd3aWR0aCcsICdoZWlnaHQnLCAncHJpb3JpdHknXSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRMb2FkaW5nQmVoYXZpb3IoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5sb2FkaW5nICE9PSB1bmRlZmluZWQgJiYgaXNOb25FbXB0eVN0cmluZyh0aGlzLmxvYWRpbmcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2FkaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgaWYgKCF0aGlzLl9yZXdyaXR0ZW5TcmMpIHtcbiAgICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMucmF3U3JjfTtcbiAgICAgIC8vIENhY2hlIGNhbGN1bGF0ZWQgaW1hZ2Ugc3JjIHRvIHJldXNlIGl0IGxhdGVyIGluIHRoZSBjb2RlLlxuICAgICAgdGhpcy5fcmV3cml0dGVuU3JjID0gdGhpcy5pbWFnZUxvYWRlcihpbWdDb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmV3cml0dGVuU3JjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB3aWR0aFNyY1NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodGhpcy5yYXdTcmNzZXQpO1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IHRoaXMucmF3U3Jjc2V0LnNwbGl0KCcsJykuZmlsdGVyKHNyYyA9PiBzcmMgIT09ICcnKS5tYXAoc3JjU3RyID0+IHtcbiAgICAgIHNyY1N0ciA9IHNyY1N0ci50cmltKCk7XG4gICAgICBjb25zdCB3aWR0aCA9IHdpZHRoU3JjU2V0ID8gcGFyc2VGbG9hdChzcmNTdHIpIDogcGFyc2VGbG9hdChzcmNTdHIpICogdGhpcy53aWR0aCE7XG4gICAgICByZXR1cm4gYCR7dGhpcy5pbWFnZUxvYWRlcih7c3JjOiB0aGlzLnJhd1NyYywgd2lkdGh9KX0gJHtzcmNTdHJ9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5fcmV3cml0dGVuU3JjICE9PSBudWxsKSB7XG4gICAgICAgIHdpdGhMQ1BJbWFnZU9ic2VydmVyKFxuICAgICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gb2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3Jld3JpdHRlblNyYyEpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG5cbi8qKlxuICogTmdNb2R1bGUgdGhhdCBkZWNsYXJlcyBhbmQgZXhwb3J0cyB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZS5cbiAqIFRoaXMgTmdNb2R1bGUgaXMgYSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBhcHBzIHRoYXQgdXNlIHByZS12MTRcbiAqIHZlcnNpb25zIG9mIEFuZ3VsYXIgKGJlZm9yZSB0aGUgYHN0YW5kYWxvbmVgIGZsYWcgYmVjYW1lIGF2YWlsYWJsZSkuXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCB3aWxsIGJlY29tZSBhIHN0YW5kYWxvbmUgZGlyZWN0aXZlIGluIHYxNCBhbmRcbiAqIHRoaXMgTmdNb2R1bGUgd2lsbCBiZSByZW1vdmVkLlxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAgZXhwb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlTW9kdWxlIHtcbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8vIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gaW50ZWdlci5cbmZ1bmN0aW9uIGlucHV0VG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCk6IG51bWJlcnx1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB2YWx1ZTtcbn1cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBib29sZWFuLlxuZnVuY3Rpb24gaW5wdXRUb0Jvb2xlYW4odmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgYCR7dmFsdWV9YCAhPT0gJ2ZhbHNlJztcbn1cblxuZnVuY3Rpb24gaXNOb25FbXB0eVN0cmluZyh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICByZXR1cm4gaXNTdHJpbmcgJiYgIWlzRW1wdHlTdHJpbmc7XG59XG5cbi8qKlxuICogSW52b2tlcyBhIGZ1bmN0aW9uLCBwYXNzaW5nIGFuIGluc3RhbmNlIG9mIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgYXMgYW4gYXJndW1lbnQuXG4gKlxuICogTm90ZXM6XG4gKiAtIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgaXMgYSB0cmVlLXNoYWthYmxlIHByb3ZpZGVyLCBwcm92aWRlZCBpbiAncm9vdCcsXG4gKiAgIHRodXMgaXQncyBhIHNpbmdsZXRvbiB3aXRoaW4gdGhpcyBhcHBsaWNhdGlvblxuICogLSB0aGUgcHJvY2VzcyBvZiBgTENQSW1hZ2VPYnNlcnZlcmAgY3JlYXRpb24gYW5kIGFuIGFjdHVhbCBvcGVyYXRpb24gYXJlIGludm9rZWQgb3V0c2lkZSBvZiB0aGVcbiAqICAgTmdab25lIHRvIG1ha2Ugc3VyZSBub25lIG9mIHRoZSBjYWxscyBpbnNpZGUgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBjbGFzcyB0cmlnZ2VyIHVubmVjZXNzYXJ5XG4gKiAgIGNoYW5nZSBkZXRlY3Rpb25cbiAqL1xuZnVuY3Rpb24gd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgaW5qZWN0b3I6IEluamVjdG9yLCBvcGVyYXRpb246IChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gdm9pZCk6IHZvaWQge1xuICBjb25zdCBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgcmV0dXJuIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBpbmplY3Rvci5nZXQoTENQSW1hZ2VPYnNlcnZlcik7XG4gICAgb3BlcmF0aW9uKG9ic2VydmVyKTtcbiAgfSk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vLyBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3JjKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ19BVFRSLFxuICAgICAgICBgJHtcbiAgICAgICAgICAgIGltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICAgICAgZGlyLnJhd1NyYyl9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGBzcmNcXGAgaGFzIGFscmVhZHkgYmVlbiBzZXQgKHRvIGAgK1xuICAgICAgICAgICAgYFxcYCR7ZGlyLnNyY31cXGApLiBQbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNcXGAgYXR0cmlidXRlIGZyb20gdGhpcyBpbWFnZS4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgdXNlIHRoZSBcXGByYXdTcmNcXGAgdG8gY29tcHV0ZSBgICtcbiAgICAgICAgICAgIGB0aGUgZmluYWwgaW1hZ2UgVVJMIGFuZCBzZXQgdGhlIFxcYHNyY1xcYCBpdHNlbGYuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3Jjc2V0YCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNTRVRfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHNyY3NldFxcYCBoYXMgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFBsZWFzZSByZXBsYWNlIHRoZSBcXGBzcmNzZXRcXGAgYXR0cmlidXRlIGZyb20gdGhpcyBpbWFnZSB3aXRoIFxcYHJhd1NyY3NldFxcYC4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHVzZXMgXFxgcmF3U3Jjc2V0XFxgIHRvIHNldCB0aGUgXFxgc3Jjc2V0XFxgIGF0dHJpYnV0ZWAgK1xuICAgICAgICAgICAgYGF0IGEgdGltZSB0aGF0IGRvZXMgbm90IGRpc3J1cHQgbGF6eSBsb2FkaW5nLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCByYXdTcmMgPSBkaXIucmF3U3JjLnRyaW0oKTtcbiAgaWYgKHJhd1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKHJhd1NyYy5sZW5ndGggPiBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpIHtcbiAgICAgIHJhd1NyYyA9IHJhd1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nICgke3Jhd1NyY30pLiBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzIGFyZSBgICtcbiAgICAgICAgICAgIGBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gVXNlIGEgcmVndWxhciBcXGBzcmNcXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIChpbnN0ZWFkIG9mIFxcYHJhd1NyY1xcYCkgdG8gZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBgICtcbiAgICAgICAgICAgIGBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVUkwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgYmxvYiBVUkwgKCR7cmF3U3JjfSkuIEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgYCArXG4gICAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIFVzZSBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGAoaW5zdGVhZCBvZiBcXGByYXdTcmNcXGApIHRvIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGAgK1xuICAgICAgICAgICAgYGZvciB0aGlzIGVsZW1lbnQuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgaW5wdXQgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5SW5wdXQobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICBpZiAoIWlzU3RyaW5nIHx8IGlzRW1wdHlTdHJpbmcpIHtcbiAgICBjb25zdCBleHRyYU1lc3NhZ2UgPSBpc0VtcHR5U3RyaW5nID8gJyAoZW1wdHkgc3RyaW5nKScgOiAnJztcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYCR7bmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWU6IGAgK1xuICAgICAgICAgICAgYGV4cGVjdGluZyBhIG5vbi1lbXB0eSBzdHJpbmcsIGJ1dCBnb3Q6IFxcYCR7dmFsdWV9XFxgJHtleHRyYU1lc3NhZ2V9LmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNzZXRgIGlzIGluIGEgdmFsaWQgZm9ybWF0LCBlLmcuIFwiMTAwdywgMjAwd1wiIG9yIFwiMXgsIDJ4XCJcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZFJhd1NyY3NldCh2YWx1ZTogdW5rbm93bikge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuO1xuICBhc3NlcnROb25FbXB0eUlucHV0KCdyYXdTcmNzZXQnLCB2YWx1ZSk7XG4gIGNvbnN0IGlzVmFsaWRTcmNzZXQgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHZhbHVlIGFzIHN0cmluZykgfHxcbiAgICAgIFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQudGVzdCh2YWx1ZSBhcyBzdHJpbmcpO1xuXG4gIGlmICghaXNWYWxpZFNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlOiBgICtcbiAgICAgICAgICAgIGBleHBlY3Rpbmcgd2lkdGggZGVzY3JpcHRvcnMgKGUuZy4gXCIxMDB3LCAyMDB3XCIpIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMgKGUuZy4gXCIxeCwgMnhcIiksIGAgK1xuICAgICAgICAgICAgYGJ1dCBnb3Q6IFxcYCR7dmFsdWV9XFxgYCk7XG4gIH1cbn1cblxuLy8gQ3JlYXRlcyBhIGBSdW50aW1lRXJyb3JgIGluc3RhbmNlIHRvIHJlcHJlc2VudCBhIHNpdHVhdGlvbiB3aGVuIGFuIGlucHV0IGlzIHNldCBhZnRlclxuLy8gdGhlIGRpcmVjdGl2ZSBoYXMgaW5pdGlhbGl6ZWQuXG5mdW5jdGlvbiBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dE5hbWU6IHN0cmluZyk6IHt9IHtcbiAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfSU5QVVRfQ0hBTkdFLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYCR7XG4gICAgICAgICAgaW5wdXROYW1lfVxcYCBpcyB1cGRhdGVkIGFmdGVyIHRoZSBgICtcbiAgICAgICAgICBgaW5pdGlhbGl6YXRpb24uIFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS5gKTtcbn1cblxuLy8gVmVyaWZ5IHRoYXQgbm9uZSBvZiB0aGUgbGlzdGVkIGlucHV0cyBoYXMgY2hhbmdlZC5cbmZ1bmN0aW9uIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMsIGlucHV0czogc3RyaW5nW10pIHtcbiAgaW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgIGNvbnN0IGlzVXBkYXRlZCA9IGNoYW5nZXMuaGFzT3duUHJvcGVydHkoaW5wdXQpO1xuICAgIGlmIChpc1VwZGF0ZWQgJiYgIWNoYW5nZXNbaW5wdXRdLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgaWYgKGlucHV0ID09PSAncmF3U3JjJykge1xuICAgICAgICAvLyBXaGVuIHRoZSBgcmF3U3JjYCBpbnB1dCBjaGFuZ2VzLCB3ZSBkZXRlY3QgdGhhdCBvbmx5IGluIHRoZVxuICAgICAgICAvLyBgbmdPbkNoYW5nZXNgIGhvb2ssIHRodXMgdGhlIGByYXdTcmNgIGlzIGFscmVhZHkgc2V0LiBXZSB1c2VcbiAgICAgICAgLy8gYHJhd1NyY2AgaW4gdGhlIGVycm9yIG1lc3NhZ2UsIHNvIHdlIHVzZSBhIHByZXZpb3VzIHZhbHVlLCBidXRcbiAgICAgICAgLy8gbm90IHRoZSB1cGRhdGVkIG9uZSBpbiBpdC5cbiAgICAgICAgZGlyID0ge3Jhd1NyYzogY2hhbmdlc1tpbnB1dF0ucHJldmlvdXNWYWx1ZX0gYXMgTmdPcHRpbWl6ZWRJbWFnZTtcbiAgICAgIH1cbiAgICAgIHRocm93IHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXIsIGlucHV0KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLlxuZnVuY3Rpb24gYXNzZXJ0R3JlYXRlclRoYW5aZXJvTnVtYmVyKGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHZhbGlkTnVtYmVyID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInICYmIGlucHV0VmFsdWUgPiAwO1xuICBjb25zdCB2YWxpZFN0cmluZyA9XG4gICAgICB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkgJiYgcGFyc2VJbnQoaW5wdXRWYWx1ZSkgPiAwO1xuICBpZiAoIXZhbGlkTnVtYmVyICYmICF2YWxpZFN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIGAgK1xuICAgICAgICAgICAgYHZhbHVlOiBleHBlY3RpbmcgYSBudW1iZXIgdGhhdCByZXByZXNlbnRzIHRoZSAke2lucHV0TmFtZX0gaW4gcGl4ZWxzLCBidXQgZ290OiBgICtcbiAgICAgICAgICAgIGBcXGAke2lucHV0VmFsdWV9XFxgLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGlzIG5vdCB2aXN1YWxseSBkaXN0b3J0ZWQuIEVmZmVjdGl2ZWx5IHRoaXMgaXMgY2hlY2tpbmc6XG4vLyAtIFdoZXRoZXIgdGhlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIHJlZmxlY3QgdGhlIGFjdHVhbCBkaW1lbnNpb25zIG9mIHRoZSBpbWFnZS5cbi8vIC0gV2hldGhlciBpbWFnZSBzdHlsaW5nIGlzIFwiY29ycmVjdFwiIChzZWUgYmVsb3cgZm9yIGEgbG9uZ2VyIGV4cGxhbmF0aW9uKS5cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgZWxlbWVudDogRWxlbWVudFJlZjxhbnk+LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IGltZyA9IGVsZW1lbnQubmF0aXZlRWxlbWVudDtcbiAgY29uc3QgcmVtb3ZlTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCByZW5kZXJlZFdpZHRoID0gcGFyc2VGbG9hdChpbWcuY2xpZW50V2lkdGgpO1xuICAgIGNvbnN0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChpbWcuY2xpZW50SGVpZ2h0KTtcbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBwYXJzZUZsb2F0KGltZy5uYXR1cmFsV2lkdGgpO1xuICAgIGNvbnN0IGludHJpbnNpY0hlaWdodCA9IHBhcnNlRmxvYXQoaW1nLm5hdHVyYWxIZWlnaHQpO1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPSBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuICAgIGlmIChpbmFjY3VyYXRlRGltZW5zaW9ucykge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgYCArXG4gICAgICAgICAgICAgIGBpbWFnZSBkb2VzIG5vdCBtYXRjaCB0aGUgYXNwZWN0IHJhdGlvIGluZGljYXRlZCBieSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLiBgICtcbiAgICAgICAgICAgICAgYEludHJpbnNpYyBpbWFnZSBzaXplOiAke2ludHJpbnNpY1dpZHRofXcgeCAke2ludHJpbnNpY0hlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICBpbnRyaW5zaWNBc3BlY3RSYXRpb30pLiBgICtcbiAgICAgICAgICAgICAgYFN1cHBsaWVkIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlczogJHtzdXBwbGllZFdpZHRofXcgeCAke1xuICAgICAgICAgICAgICAgICAgc3VwcGxpZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiAke3N1cHBsaWVkQXNwZWN0UmF0aW99KS4gYCArXG4gICAgICAgICAgICAgIGBUbyBmaXggdGhpcywgdXBkYXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuYCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3R5bGluZ0Rpc3RvcnRpb24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIGAgK1xuICAgICAgICAgICAgICAgIGByZW5kZXJlZCBpbWFnZSBkb2VzIG5vdCBtYXRjaCB0aGUgaW1hZ2UncyBpbnRyaW5zaWMgYXNwZWN0IHJhdGlvLiBgICtcbiAgICAgICAgICAgICAgICBgSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogJHtcbiAgICAgICAgICAgICAgICAgICAgaW50cmluc2ljQXNwZWN0UmF0aW99KS4gYCArXG4gICAgICAgICAgICAgICAgYFJlbmRlcmVkIGltYWdlIHNpemU6ICR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkQXNwZWN0UmF0aW99KS4gYCArXG4gICAgICAgICAgICAgICAgYFRoaXMgaXNzdWUgY2FuIG9jY3VyIGlmIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhbiBpbWFnZSBgICtcbiAgICAgICAgICAgICAgICBgd2l0aG91dCB1cGRhdGluZyB0aGUgY29ycmVzcG9uZGluZyBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgICAgICBgYWRkaW5nIFwiaGVpZ2h0OiBhdXRvXCIgb3IgXCJ3aWR0aDogYXV0b1wiIHRvIHRoZSBpbWFnZSBzdHlsaW5nIHdpbGwgZml4IHRoaXMgaXNzdWUuYCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgc2V0LlxuZnVuY3Rpb24gYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJFUVVJUkVEX0lOUFVUX01JU1NJTkcsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLnJhd1NyYyl9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSByZXF1aXJlZCBcXGAke2lucHV0TmFtZX1cXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIGlzIG1pc3NpbmcuIFBsZWFzZSBzcGVjaWZ5IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYG9uIHRoZSBtZW50aW9uZWQgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgbG9hZGluZ2AgYXR0cmlidXRlIGlzIHNldCB0byBhIHZhbGlkIGlucHV0ICZcbi8vIGlzIG5vdCB1c2VkIG9uIHByaW9yaXR5IGltYWdlcy5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLmxvYWRpbmcgJiYgZGlyLnByaW9yaXR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGB3YXMgdXNlZCBvbiBhbiBpbWFnZSB0aGF0IHdhcyBtYXJrZWQgXCJwcmlvcml0eVwiLiBJbWFnZXMgbWFya2VkIFwicHJpb3JpdHlcIiBgICtcbiAgICAgICAgICAgIGBhcmUgYWx3YXlzIGVhZ2VybHkgbG9hZGVkIGFuZCB0aGlzIGJlaGF2aW9yIGNhbm5vdCBiZSBvdmVyd3JpdHRlbiBieSB1c2luZyBgICtcbiAgICAgICAgICAgIGB0aGUgXCJsb2FkaW5nXCIgYXR0cmlidXRlLmApO1xuICB9XG4gIGNvbnN0IHZhbGlkSW5wdXRzID0gWydhdXRvJywgJ2VhZ2VyJywgJ2xhenknXTtcbiAgaWYgKHR5cGVvZiBkaXIubG9hZGluZyA9PT0gJ3N0cmluZycgJiYgIXZhbGlkSW5wdXRzLmluY2x1ZGVzKGRpci5sb2FkaW5nKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgaGFzIGFuIGludmFsaWQgdmFsdWU6IGV4cGVjdGluZyBcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIiBidXQgZ290OiBgICtcbiAgICAgICAgICAgIGBcXGAke2Rpci5sb2FkaW5nfVxcYC5gKTtcbiAgfVxufVxuIl19