/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injectable, Injector, Input, NgModule, NgZone, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { IMAGE_LOADER } from './image_loaders/image_loader';
import { PreconnectLinkChecker } from './preconnect_link_checker';
import { getUrl, imgDirectiveDetails } from './util';
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
 * Contains the logic to detect whether an image with the `NgOptimizedImage` directive
 * is treated as an LCP element. If so, verifies that the image is marked as a priority,
 * using the `priority` attribute.
 *
 * Note: this is a dev-mode only class, which should not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 *
 * Based on https://web.dev/lcp/#measure-lcp-in-javascript.
 */
export class LCPImageObserver {
    constructor(doc) {
        // Map of full image URLs -> original `rawSrc` values.
        this.images = new Map();
        // Keep track of images for which `console.warn` was produced.
        this.alreadyWarned = new Set();
        this.window = null;
        this.observer = null;
        assertDevMode('LCP checker');
        const win = doc.defaultView;
        if (typeof win !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
            this.window = win;
            this.observer = this.initPerformanceObserver();
        }
    }
    // Inits PerformanceObserver and subscribes to LCP events.
    // Based on https://web.dev/lcp/#measure-lcp-in-javascript
    initPerformanceObserver() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length === 0)
                return;
            // Note: we use the latest entry produced by the `PerformanceObserver` as the best
            // signal on which element is actually an LCP one. As an example, the first image to load on
            // a page, by virtue of being the only thing on the page so far, is often a LCP candidate
            // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
            const lcpElement = entries[entries.length - 1];
            // Cast to `any` due to missing `element` on observed type of entry.
            const imgSrc = lcpElement.element?.src ?? '';
            // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
            if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:'))
                return;
            const imgRawSrc = this.images.get(imgSrc);
            if (imgRawSrc && !this.alreadyWarned.has(imgSrc)) {
                this.alreadyWarned.add(imgSrc);
                const directiveDetails = imgDirectiveDetails(imgRawSrc);
                console.warn(formatRuntimeError(2955 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */, `${directiveDetails}: the image was detected as the Largest Contentful Paint (LCP) ` +
                    `element, so its loading should be prioritized for optimal performance. Please ` +
                    `add the "priority" attribute if this image is above the fold.`));
            }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        return observer;
    }
    registerImage(rewrittenSrc, rawSrc) {
        if (!this.observer)
            return;
        this.images.set(getUrl(rewrittenSrc, this.window).href, rawSrc);
    }
    unregisterImage(rewrittenSrc) {
        if (!this.observer)
            return;
        this.images.delete(getUrl(rewrittenSrc, this.window).href);
    }
    ngOnDestroy() {
        if (!this.observer)
            return;
        this.observer.disconnect();
        this.images.clear();
        this.alreadyWarned.clear();
    }
}
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: LCPImageObserver, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
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
        ngDevMode && assertValidNumberInput(value, 'width');
        this._width = inputToInteger(value);
    }
    get width() {
        return this._width;
    }
    /**
     * The intrinsic height of the image in px.
     */
    set height(value) {
        ngDevMode && assertValidNumberInput(value, 'height');
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.0+sha-7e8be93", type: NgOptimizedImage, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", rawSrcset: "rawSrcset", width: "width", height: "height", loading: "loading", priority: "priority", src: "src", srcset: "srcset" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
NgOptimizedImageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: NgOptimizedImageModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7e8be93", ngImport: i0, type: NgOptimizedImageModule, decorators: [{
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
// Verifies that a specified input has a correct type (number).
function assertValidNumberInput(inputValue, inputName) {
    const isValid = typeof inputValue === 'number' ||
        (typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()));
    if (!isValid) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`${inputName}\` has an invalid ` +
            `value: expecting a number that represents the ${inputName} in pixels, but got: ` +
            `\`${inputValue}\`.`);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWdDLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3TyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHMUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLEVBQUMsWUFBWSxFQUFjLE1BQU0sOEJBQThCLENBQUM7QUFDdkUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEUsT0FBTyxFQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFFbkQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRywyQkFBMkIsQ0FBQztBQUVsRTs7O0dBR0c7QUFDSCxNQUFNLCtCQUErQixHQUFHLGlDQUFpQyxDQUFDO0FBRTFFOzs7Ozs7Ozs7R0FTRztBQUVILE1BQU0sT0FBTyxnQkFBZ0I7SUFTM0IsWUFBOEIsR0FBYTtRQVIzQyxzREFBc0Q7UUFDOUMsV0FBTSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQzNDLDhEQUE4RDtRQUN0RCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7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LHFDQUFxQyxTQUFTLEtBQUs7WUFDakYsOENBQThDLFNBQVMsZUFBZTtZQUN0RSwyQkFBMkIsQ0FBQyxDQUFDO0tBQ3RDO0FBQ0gsQ0FBQztBQUVELGtFQUFrRTtBQUNsRSxrQ0FBa0M7QUFDbEMsU0FBUyx1QkFBdUIsQ0FBQyxHQUFxQjtJQUNwRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtRQUMvQixNQUFNLElBQUksWUFBWSw0Q0FFbEIsNkVBQTZFO1lBQ3pFLDRFQUE0RTtZQUM1RSw2RUFBNkU7WUFDN0UsMEJBQTBCLENBQUMsQ0FBQztLQUNyQztJQUNELE1BQU0sV0FBVyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QyxJQUFJLE9BQU8sR0FBRyxDQUFDLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN6RSxNQUFNLElBQUksWUFBWSw0Q0FFbEIsNkVBQTZFO1lBQ3pFLHNFQUFzRTtZQUN0RSxLQUFLLEdBQUcsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3RvciwgSW5wdXQsIE5nTW9kdWxlLCBOZ1pvbmUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFJlbmRlcmVyMiwgU2ltcGxlQ2hhbmdlcywgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7UHJlY29ubmVjdExpbmtDaGVja2VyfSBmcm9tICcuL3ByZWNvbm5lY3RfbGlua19jaGVja2VyJztcbmltcG9ydCB7Z2V0VXJsLCBpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgd2lkdGggZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMTAwdywgMjAwd1wiLlxuICovXG5jb25zdCBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkK3dcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMXgsIDJ4XCIuXG4gKi9cbmNvbnN0IFZBTElEX0RFTlNJVFlfREVTQ1JJUFRPUl9TUkNTRVQgPSAvXigoXFxzKlxcZChcXC5cXGQpP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBDb250YWlucyB0aGUgbG9naWMgdG8gZGV0ZWN0IHdoZXRoZXIgYW4gaW1hZ2Ugd2l0aCB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZVxuICogaXMgdHJlYXRlZCBhcyBhbiBMQ1AgZWxlbWVudC4gSWYgc28sIHZlcmlmaWVzIHRoYXQgdGhlIGltYWdlIGlzIG1hcmtlZCBhcyBhIHByaW9yaXR5LFxuICogdXNpbmcgdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgYSBkZXYtbW9kZSBvbmx5IGNsYXNzLCB3aGljaCBzaG91bGQgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqXG4gKiBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0LlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBMQ1BJbWFnZU9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLy8gTWFwIG9mIGZ1bGwgaW1hZ2UgVVJMcyAtPiBvcmlnaW5hbCBgcmF3U3JjYCB2YWx1ZXMuXG4gIHByaXZhdGUgaW1hZ2VzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgLy8gS2VlcCB0cmFjayBvZiBpbWFnZXMgZm9yIHdoaWNoIGBjb25zb2xlLndhcm5gIHdhcyBwcm9kdWNlZC5cbiAgcHJpdmF0ZSBhbHJlYWR5V2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvd3xudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBvYnNlcnZlcjogUGVyZm9ybWFuY2VPYnNlcnZlcnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2M6IERvY3VtZW50KSB7XG4gICAgYXNzZXJ0RGV2TW9kZSgnTENQIGNoZWNrZXInKTtcbiAgICBjb25zdCB3aW4gPSBkb2MuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBQZXJmb3JtYW5jZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy53aW5kb3cgPSB3aW47XG4gICAgICB0aGlzLm9ic2VydmVyID0gdGhpcy5pbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluaXRzIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgYW5kIHN1YnNjcmliZXMgdG8gTENQIGV2ZW50cy5cbiAgLy8gQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdFxuICBwcml2YXRlIGluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk6IFBlcmZvcm1hbmNlT2JzZXJ2ZXIge1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKGVudHJ5TGlzdCkgPT4ge1xuICAgICAgY29uc3QgZW50cmllcyA9IGVudHJ5TGlzdC5nZXRFbnRyaWVzKCk7XG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgIC8vIE5vdGU6IHdlIHVzZSB0aGUgbGF0ZXN0IGVudHJ5IHByb2R1Y2VkIGJ5IHRoZSBgUGVyZm9ybWFuY2VPYnNlcnZlcmAgYXMgdGhlIGJlc3RcbiAgICAgIC8vIHNpZ25hbCBvbiB3aGljaCBlbGVtZW50IGlzIGFjdHVhbGx5IGFuIExDUCBvbmUuIEFzIGFuIGV4YW1wbGUsIHRoZSBmaXJzdCBpbWFnZSB0byBsb2FkIG9uXG4gICAgICAvLyBhIHBhZ2UsIGJ5IHZpcnR1ZSBvZiBiZWluZyB0aGUgb25seSB0aGluZyBvbiB0aGUgcGFnZSBzbyBmYXIsIGlzIG9mdGVuIGEgTENQIGNhbmRpZGF0ZVxuICAgICAgLy8gYW5kIGdldHMgcmVwb3J0ZWQgYnkgUGVyZm9ybWFuY2VPYnNlcnZlciwgYnV0IGlzbid0IG5lY2Vzc2FyaWx5IHRoZSBMQ1AgZWxlbWVudC5cbiAgICAgIGNvbnN0IGxjcEVsZW1lbnQgPSBlbnRyaWVzW2VudHJpZXMubGVuZ3RoIC0gMV07XG4gICAgICAvLyBDYXN0IHRvIGBhbnlgIGR1ZSB0byBtaXNzaW5nIGBlbGVtZW50YCBvbiBvYnNlcnZlZCB0eXBlIG9mIGVudHJ5LlxuICAgICAgY29uc3QgaW1nU3JjID0gKGxjcEVsZW1lbnQgYXMgYW55KS5lbGVtZW50Py5zcmMgPz8gJyc7XG5cbiAgICAgIC8vIEV4Y2x1ZGUgYGRhdGE6YCBhbmQgYGJsb2I6YCBVUkxzLCBzaW5jZSB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBkaXJlY3RpdmUuXG4gICAgICBpZiAoaW1nU3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykgfHwgaW1nU3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHJldHVybjtcblxuICAgICAgY29uc3QgaW1nUmF3U3JjID0gdGhpcy5pbWFnZXMuZ2V0KGltZ1NyYyk7XG4gICAgICBpZiAoaW1nUmF3U3JjICYmICF0aGlzLmFscmVhZHlXYXJuZWQuaGFzKGltZ1NyYykpIHtcbiAgICAgICAgdGhpcy5hbHJlYWR5V2FybmVkLmFkZChpbWdTcmMpO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyhpbWdSYXdTcmMpO1xuICAgICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5MQ1BfSU1HX01JU1NJTkdfUFJJT1JJVFksXG4gICAgICAgICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfTogdGhlIGltYWdlIHdhcyBkZXRlY3RlZCBhcyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGAgK1xuICAgICAgICAgICAgICAgIGBlbGVtZW50LCBzbyBpdHMgbG9hZGluZyBzaG91bGQgYmUgcHJpb3JpdGl6ZWQgZm9yIG9wdGltYWwgcGVyZm9ybWFuY2UuIFBsZWFzZSBgICtcbiAgICAgICAgICAgICAgICBgYWRkIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlIGlmIHRoaXMgaW1hZ2UgaXMgYWJvdmUgdGhlIGZvbGQuYCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoe3R5cGU6ICdsYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQnLCBidWZmZXJlZDogdHJ1ZX0pO1xuICAgIHJldHVybiBvYnNlcnZlcjtcbiAgfVxuXG4gIHJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcsIHJhd1NyYzogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5pbWFnZXMuc2V0KGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMud2luZG93ISkuaHJlZiwgcmF3U3JjKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLmRlbGV0ZShnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyEpLmhyZWYpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5pbWFnZXMuY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlXYXJuZWQuY2xlYXIoKTtcbiAgfVxufVxuXG4vKipcbiAqICoqIEVYUEVSSU1FTlRBTCAqKlxuICpcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgZGVzY3JpcHRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgdXNhZ2Ugbm90ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2ltZ1tyYXdTcmNdJyxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoSU1BR0VfTE9BREVSKSBwcml2YXRlIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlciwgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgICAgcHJpdmF0ZSBpbWdFbGVtZW50OiBFbGVtZW50UmVmLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvLyBQcml2YXRlIGZpZWxkcyB0byBrZWVwIG5vcm1hbGl6ZWQgaW5wdXQgdmFsdWVzLlxuICBwcml2YXRlIF93aWR0aD86IG51bWJlcjtcbiAgcHJpdmF0ZSBfaGVpZ2h0PzogbnVtYmVyO1xuICBwcml2YXRlIF9wcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgcmV3cml0dGVuIGBzcmNgIG9uY2UgYW5kIHN0b3JlIGl0LlxuICAvLyBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCByZXBldGl0aXZlIGNhbGN1bGF0aW9ucyBhbmQgbWFrZSBzdXJlIHRoZSBkaXJlY3RpdmUgY2xlYW51cCBpbiB0aGVcbiAgLy8gYG5nT25EZXN0cm95YCBkb2VzIG5vdCByZWx5IG9uIHRoZSBgSU1BR0VfTE9BREVSYCBsb2dpYyAod2hpY2ggaW4gdHVybiBjYW4gcmVseSBvbiBzb21lIG90aGVyXG4gIC8vIGluc3RhbmNlIHRoYXQgbWlnaHQgYmUgYWxyZWFkeSBkZXN0cm95ZWQpLlxuICBwcml2YXRlIF9yZXdyaXR0ZW5TcmM6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgc291cmNlIGltYWdlLlxuICAgKiBJbWFnZSBuYW1lIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgYW5kIHRoZSBmaW5hbCBVUkwgd2lsbCBiZSBhcHBsaWVkIGFzIHRoZSBgc3JjYFxuICAgKiBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoKSByYXdTcmMhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygd2lkdGggb3IgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAgICogVGhlIGltYWdlIG5hbWUgd2lsbCBiZSB0YWtlbiBmcm9tIGByYXdTcmNgIGFuZCBjb21iaW5lZCB3aXRoIHRoZSBsaXN0IG9mIHdpZHRoIG9yIGRlbnNpdHlcbiAgICogZGVzY3JpcHRvcnMgdG8gZ2VuZXJhdGUgdGhlIGZpbmFsIGBzcmNzZXRgIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogPGltZyByYXdTcmM9XCJoZWxsby5qcGdcIiByYXdTcmNzZXQ9XCIxMDB3LCAyMDB3XCIgLz4gID0+XG4gICAqIDxpbWcgc3JjPVwicGF0aC9oZWxsby5qcGdcIiBzcmNzZXQ9XCJwYXRoL2hlbGxvLmpwZz93PTEwMCAxMDB3LCBwYXRoL2hlbGxvLmpwZz93PTIwMCAyMDB3XCIgLz5cbiAgICovXG4gIEBJbnB1dCgpIHJhd1NyY3NldCE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgd2lkdGgodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydFZhbGlkTnVtYmVySW5wdXQodmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGhlaWdodCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VmFsaWROdW1iZXJJbnB1dCh2YWx1ZSwgJ2hlaWdodCcpO1xuICAgIHRoaXMuX2hlaWdodCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgaGVpZ2h0KCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRlc2lyZWQgbG9hZGluZyBiZWhhdmlvciAobGF6eSwgZWFnZXIsIG9yIGF1dG8pLlxuICAgKiBUaGUgcHJpbWFyeSB1c2UgY2FzZSBmb3IgdGhpcyBpbnB1dCBpcyBvcHRpbmctb3V0IG5vbi1wcmlvcml0eSBpbWFnZXNcbiAgICogZnJvbSBsYXp5IGxvYWRpbmcgYnkgbWFya2luZyB0aGVtIGxvYWRpbmc9J2VhZ2VyJyBvciBsb2FkaW5nPSdhdXRvJy5cbiAgICogVGhpcyBpbnB1dCBzaG91bGQgbm90IGJlIHVzZWQgd2l0aCBwcmlvcml0eSBpbWFnZXMuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkaW5nPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBwcmlvcml0eSh2YWx1ZTogc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fcHJpb3JpdHkgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IHByaW9yaXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcmlvcml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB2YWx1ZSBvZiB0aGUgYHNyY2AgYW5kIGBzcmNzZXRgIGlmIHRoZXkncmUgc2V0IG9uIGEgaG9zdCA8aW1nPiBlbGVtZW50LlxuICAgKiBUaGVzZSBpbnB1dHMgYXJlIG5lZWRlZCB0byB2ZXJpZnkgdGhhdCB0aGVyZSBhcmUgbm8gY29uZmxpY3Rpbmcgc291cmNlcyBwcm92aWRlZFxuICAgKiBhdCB0aGUgc2FtZSB0aW1lIChlLmcuIGBzcmNgIGFuZCBgcmF3U3JjYCB0b2dldGhlciBvciBgc3Jjc2V0YCBhbmQgYHJhd1NyY3NldGAsXG4gICAqIHRodXMgY2F1c2luZyBhbiBhbWJpZ3VpdHkgb24gd2hpY2ggc3JjIHRvIHVzZSkgYW5kIHRoYXQgaW1hZ2VzXG4gICAqIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyYz86IHN0cmluZztcbiAgQElucHV0KCkgc3Jjc2V0Pzogc3RyaW5nO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vbkVtcHR5SW5wdXQoJ3Jhd1NyYycsIHRoaXMucmF3U3JjKTtcbiAgICAgIGFzc2VydFZhbGlkUmF3U3Jjc2V0KHRoaXMucmF3U3Jjc2V0KTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmFzZTY0SW1hZ2UodGhpcyk7XG4gICAgICBhc3NlcnROb3RCbG9iVVJMKHRoaXMpO1xuICAgICAgYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dCh0aGlzLCB0aGlzLndpZHRoLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydFJlcXVpcmVkTnVtYmVySW5wdXQodGhpcywgdGhpcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICAgIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KHRoaXMpO1xuICAgICAgaWYgKHRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3QgY2hlY2tlciA9IHRoaXMuaW5qZWN0b3IuZ2V0KFByZWNvbm5lY3RMaW5rQ2hlY2tlcik7XG4gICAgICAgIGNoZWNrZXIuY2hlY2sodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5yYXdTcmMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTW9uaXRvciB3aGV0aGVyIGFuIGltYWdlIGlzIGFuIExDUCBlbGVtZW50IG9ubHkgaW4gY2FzZVxuICAgICAgICAvLyB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUgaXMgbWlzc2luZy4gT3RoZXJ3aXNlLCBhbiBpbWFnZVxuICAgICAgICAvLyBoYXMgdGhlIG5lY2Vzc2FyeSBzZXR0aW5ncyBhbmQgbm8gZXh0cmEgY2hlY2tzIGFyZSByZXF1aXJlZC5cbiAgICAgICAgd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAgICAgKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PlxuICAgICAgICAgICAgICAgIG9ic2VydmVyLnJlZ2lzdGVySW1hZ2UodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5yYXdTcmMpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdsb2FkaW5nJywgdGhpcy5nZXRMb2FkaW5nQmVoYXZpb3IoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdmZXRjaHByaW9yaXR5JywgdGhpcy5nZXRGZXRjaFByaW9yaXR5KCkpO1xuICAgIC8vIFRoZSBgc3JjYCBhbmQgYHNyY3NldGAgYXR0cmlidXRlcyBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSk7XG4gICAgaWYgKHRoaXMucmF3U3Jjc2V0KSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyY3NldCcsIHRoaXMuZ2V0UmV3cml0dGVuU3Jjc2V0KCkpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgICAgICAgdGhpcywgY2hhbmdlcywgWydyYXdTcmMnLCAncmF3U3Jjc2V0JywgJ3dpZHRoJywgJ2hlaWdodCcsICdwcmlvcml0eSddKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLmxvYWRpbmcgIT09IHVuZGVmaW5lZCAmJiBpc05vbkVtcHR5U3RyaW5nKHRoaXMubG9hZGluZykpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRpbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2VhZ2VyJyA6ICdsYXp5JztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RmV0Y2hQcmlvcml0eSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2hpZ2gnIDogJ2F1dG8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmMoKTogc3RyaW5nIHtcbiAgICAvLyBJbWFnZUxvYWRlckNvbmZpZyBzdXBwb3J0cyBzZXR0aW5nIGEgd2lkdGggcHJvcGVydHkuIEhvd2V2ZXIsIHdlJ3JlIG5vdCBzZXR0aW5nIHdpZHRoIGhlcmVcbiAgICAvLyBiZWNhdXNlIGlmIHRoZSBkZXZlbG9wZXIgdXNlcyByZW5kZXJlZCB3aWR0aCBpbnN0ZWFkIG9mIGludHJpbnNpYyB3aWR0aCBpbiB0aGUgSFRNTCB3aWR0aFxuICAgIC8vIGF0dHJpYnV0ZSwgdGhlIGltYWdlIHJlcXVlc3RlZCBtYXkgYmUgdG9vIHNtYWxsIGZvciAyeCsgc2NyZWVucy5cbiAgICBpZiAoIXRoaXMuX3Jld3JpdHRlblNyYykge1xuICAgICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5yYXdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZXdyaXR0ZW5TcmMgPSB0aGlzLmltYWdlTG9hZGVyKGltZ0NvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZXdyaXR0ZW5TcmM7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHdpZHRoU3JjU2V0ID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdCh0aGlzLnJhd1NyY3NldCk7XG4gICAgY29uc3QgZmluYWxTcmNzID0gdGhpcy5yYXdTcmNzZXQuc3BsaXQoJywnKS5maWx0ZXIoc3JjID0+IHNyYyAhPT0gJycpLm1hcChzcmNTdHIgPT4ge1xuICAgICAgc3JjU3RyID0gc3JjU3RyLnRyaW0oKTtcbiAgICAgIGNvbnN0IHdpZHRoID0gd2lkdGhTcmNTZXQgPyBwYXJzZUZsb2F0KHNyY1N0cikgOiBwYXJzZUZsb2F0KHNyY1N0cikgKiB0aGlzLndpZHRoITtcbiAgICAgIHJldHVybiBgJHt0aGlzLmltYWdlTG9hZGVyKHtzcmM6IHRoaXMucmF3U3JjLCB3aWR0aH0pfSAke3NyY1N0cn1gO1xuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZXdyaXR0ZW5TcmMgIT09IG51bGwpIHtcbiAgICAgICAgd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAgICAgKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiBvYnNlcnZlci51bnJlZ2lzdGVySW1hZ2UodGhpcy5fcmV3cml0dGVuU3JjISkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmltZ0VsZW1lbnQubmF0aXZlRWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5cblxuLyoqXG4gKiBOZ01vZHVsZSB0aGF0IGRlY2xhcmVzIGFuZCBleHBvcnRzIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICogVGhpcyBOZ01vZHVsZSBpcyBhIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIGFwcHMgdGhhdCB1c2UgcHJlLXYxNFxuICogdmVyc2lvbnMgb2YgQW5ndWxhciAoYmVmb3JlIHRoZSBgc3RhbmRhbG9uZWAgZmxhZyBiZWNhbWUgYXZhaWxhYmxlKS5cbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIHdpbGwgYmVjb21lIGEgc3RhbmRhbG9uZSBkaXJlY3RpdmUgaW4gdjE0IGFuZFxuICogdGhpcyBOZ01vZHVsZSB3aWxsIGJlIHJlbW92ZWQuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW05nT3B0aW1pemVkSW1hZ2VdLFxuICBleHBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2VNb2R1bGUge1xufVxuXG4vKioqKiogSGVscGVycyAqKioqKi9cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBpbnRlZ2VyLlxuZnVuY3Rpb24gaW5wdXRUb0ludGVnZXIodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gcGFyc2VJbnQodmFsdWUsIDEwKSA6IHZhbHVlO1xufVxuXG4vLyBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGJvb2xlYW4uXG5mdW5jdGlvbiBpbnB1dFRvQm9vbGVhbih2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBgJHt2YWx1ZX1gICE9PSAnZmFsc2UnO1xufVxuXG5mdW5jdGlvbiBpc05vbkVtcHR5U3RyaW5nKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIHJldHVybiBpc1N0cmluZyAmJiAhaXNFbXB0eVN0cmluZztcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgZnVuY3Rpb24sIHBhc3NpbmcgYW4gaW5zdGFuY2Ugb2YgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBhcyBhbiBhcmd1bWVudC5cbiAqXG4gKiBOb3RlczpcbiAqIC0gdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBpcyBhIHRyZWUtc2hha2FibGUgcHJvdmlkZXIsIHByb3ZpZGVkIGluICdyb290JyxcbiAqICAgdGh1cyBpdCdzIGEgc2luZ2xldG9uIHdpdGhpbiB0aGlzIGFwcGxpY2F0aW9uXG4gKiAtIHRoZSBwcm9jZXNzIG9mIGBMQ1BJbWFnZU9ic2VydmVyYCBjcmVhdGlvbiBhbmQgYW4gYWN0dWFsIG9wZXJhdGlvbiBhcmUgaW52b2tlZCBvdXRzaWRlIG9mIHRoZVxuICogICBOZ1pvbmUgdG8gbWFrZSBzdXJlIG5vbmUgb2YgdGhlIGNhbGxzIGluc2lkZSB0aGUgYExDUEltYWdlT2JzZXJ2ZXJgIGNsYXNzIHRyaWdnZXIgdW5uZWNlc3NhcnlcbiAqICAgY2hhbmdlIGRldGVjdGlvblxuICovXG5mdW5jdGlvbiB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsIG9wZXJhdGlvbjogKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiB2b2lkKTogdm9pZCB7XG4gIGNvbnN0IG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICByZXR1cm4gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICBjb25zdCBvYnNlcnZlciA9IGluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKTtcbiAgICBvcGVyYXRpb24ob2JzZXJ2ZXIpO1xuICB9KTtcbn1cblxuLyoqKioqIEFzc2VydCBmdW5jdGlvbnMgKioqKiovXG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmMpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICAgIGAke1xuICAgICAgICAgICAgaW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgICAgICAgICBkaXIucmF3U3JjKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHNyY1xcYCBoYXMgYWxyZWFkeSBiZWVuIHNldCAodG8gYCArXG4gICAgICAgICAgICBgXFxgJHtkaXIuc3JjfVxcYCkuIFBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY1xcYCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGltYWdlLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCB1c2UgdGhlIFxcYHJhd1NyY1xcYCB0byBjb21wdXRlIGAgK1xuICAgICAgICAgICAgYHRoZSBmaW5hbCBpbWFnZSBVUkwgYW5kIHNldCB0aGUgXFxgc3JjXFxgIGl0c2VsZi5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmNzZXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgc3Jjc2V0XFxgIGhhcyBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgUGxlYXNlIHJlcGxhY2UgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGltYWdlIHdpdGggXFxgcmF3U3Jjc2V0XFxgLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgdXNlcyBcXGByYXdTcmNzZXRcXGAgdG8gc2V0IHRoZSBcXGBzcmNzZXRcXGAgYXR0cmlidXRlYCArXG4gICAgICAgICAgICBgYXQgYSB0aW1lIHRoYXQgZG9lcyBub3QgZGlzcnVwdCBsYXp5IGxvYWRpbmcuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgbm90IGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UuXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAocmF3U3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgcmF3U3JjID0gcmF3U3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIHdhcyBzZXQgYCArXG4gICAgICAgICAgICBgdG8gYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgKCR7cmF3U3JjfSkuIEJhc2U2NC1lbmNvZGVkIHN0cmluZ3MgYXJlIGAgK1xuICAgICAgICAgICAgYG5vdCBzdXBwb3J0ZWQgYnkgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBVc2UgYSByZWd1bGFyIFxcYHNyY1xcYCBgICtcbiAgICAgICAgICAgIGBhdHRyaWJ1dGUgKGluc3RlYWQgb2YgXFxgcmF3U3JjXFxgKSB0byBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGAgK1xuICAgICAgICAgICAgYGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50LmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVSTChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgcmF3U3JjID0gZGlyLnJhd1NyYy50cmltKCk7XG4gIGlmIChyYXdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIHdhcyBzZXQgYCArXG4gICAgICAgICAgICBgdG8gYSBibG9iIFVSTCAoJHtyYXdTcmN9KS4gQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgICtcbiAgICAgICAgICAgIGBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gVXNlIGEgcmVndWxhciBcXGBzcmNcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYChpbnN0ZWFkIG9mIFxcYHJhd1NyY1xcYCkgdG8gZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgYCArXG4gICAgICAgICAgICBgZm9yIHRoaXMgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBpbnB1dCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlJbnB1dChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIGNvbnN0IGV4dHJhTWVzc2FnZSA9IGlzRW1wdHlTdHJpbmcgPyAnIChlbXB0eSBzdHJpbmcpJyA6ICcnO1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgJHtuYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZTogYCArXG4gICAgICAgICAgICBgZXhwZWN0aW5nIGEgbm9uLWVtcHR5IHN0cmluZywgYnV0IGdvdDogXFxgJHt2YWx1ZX1cXGAke2V4dHJhTWVzc2FnZX0uYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY3NldGAgaXMgaW4gYSB2YWxpZCBmb3JtYXQsIGUuZy4gXCIxMDB3LCAyMDB3XCIgb3IgXCIxeCwgMnhcIlxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkUmF3U3Jjc2V0KHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoJ3Jhd1NyY3NldCcsIHZhbHVlKTtcbiAgY29uc3QgaXNWYWxpZFNyY3NldCA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3QodmFsdWUgYXMgc3RyaW5nKSB8fFxuICAgICAgVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHZhbHVlIGFzIHN0cmluZyk7XG5cbiAgaWYgKCFpc1ZhbGlkU3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGByYXdTcmNzZXRcXGAgaGFzIGFuIGludmFsaWQgdmFsdWU6IGAgK1xuICAgICAgICAgICAgYGV4cGVjdGluZyB3aWR0aCBkZXNjcmlwdG9ycyAoZS5nLiBcIjEwMHcsIDIwMHdcIikgb3IgZGVuc2l0eSBkZXNjcmlwdG9ycyAoZS5nLiBcIjF4LCAyeFwiKSwgYCArXG4gICAgICAgICAgICBgYnV0IGdvdDogXFxgJHt2YWx1ZX1cXGBgKTtcbiAgfVxufVxuXG4vLyBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4vLyB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5yYXdTcmMpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgJHtcbiAgICAgICAgICBpbnB1dE5hbWV9XFxgIGlzIHVwZGF0ZWQgYWZ0ZXIgdGhlIGAgK1xuICAgICAgICAgIGBpbml0aWFsaXphdGlvbi4gVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgbm90IHJlYWN0IHRvIHRoaXMgaW5wdXQgY2hhbmdlLmApO1xufVxuXG4vLyBWZXJpZnkgdGhhdCBub25lIG9mIHRoZSBsaXN0ZWQgaW5wdXRzIGhhcyBjaGFuZ2VkLlxuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgY2hhbmdlczogU2ltcGxlQ2hhbmdlcywgaW5wdXRzOiBzdHJpbmdbXSkge1xuICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICdyYXdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGByYXdTcmNgIGlucHV0IGNoYW5nZXMsIHdlIGRldGVjdCB0aGF0IG9ubHkgaW4gdGhlXG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlc2AgaG9vaywgdGh1cyB0aGUgYHJhd1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgcmF3U3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7cmF3U3JjOiBjaGFuZ2VzW2lucHV0XS5wcmV2aW91c1ZhbHVlfSBhcyBOZ09wdGltaXplZEltYWdlO1xuICAgICAgfVxuICAgICAgdGhyb3cgcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpciwgaW5wdXQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaGFzIGEgY29ycmVjdCB0eXBlIChudW1iZXIpLlxuZnVuY3Rpb24gYXNzZXJ0VmFsaWROdW1iZXJJbnB1dChpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBjb25zdCBpc1ZhbGlkID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInIHx8XG4gICAgICAodHlwZW9mIGlucHV0VmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoaW5wdXRWYWx1ZS50cmltKCkpKTtcbiAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgYCArXG4gICAgICAgICAgICBgdmFsdWU6IGV4cGVjdGluZyBhIG51bWJlciB0aGF0IHJlcHJlc2VudHMgdGhlICR7aW5wdXROYW1lfSBpbiBwaXhlbHMsIGJ1dCBnb3Q6IGAgK1xuICAgICAgICAgICAgYFxcYCR7aW5wdXRWYWx1ZX1cXGAuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG5mdW5jdGlvbiBhc3NlcnRSZXF1aXJlZE51bWJlcklucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUkVRVUlSRURfSU5QVVRfTUlTU0lORyxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIucmF3U3JjKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIHJlcXVpcmVkIFxcYCR7aW5wdXROYW1lfVxcYCBgICtcbiAgICAgICAgICAgIGBhdHRyaWJ1dGUgaXMgbWlzc2luZy4gUGxlYXNlIHNwZWNpZnkgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgb24gdGhlIG1lbnRpb25lZCBlbGVtZW50LmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGBsb2FkaW5nYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGEgdmFsaWQgaW5wdXQgJlxuLy8gaXMgbm90IHVzZWQgb24gcHJpb3JpdHkgaW1hZ2VzLlxuZnVuY3Rpb24gYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIubG9hZGluZyAmJiBkaXIucHJpb3JpdHkpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYHdhcyB1c2VkIG9uIGFuIGltYWdlIHRoYXQgd2FzIG1hcmtlZCBcInByaW9yaXR5XCIuIEltYWdlcyBtYXJrZWQgXCJwcmlvcml0eVwiIGAgK1xuICAgICAgICAgICAgYGFyZSBhbHdheXMgZWFnZXJseSBsb2FkZWQgYW5kIHRoaXMgYmVoYXZpb3IgY2Fubm90IGJlIG92ZXJ3cml0dGVuIGJ5IHVzaW5nIGAgK1xuICAgICAgICAgICAgYHRoZSBcImxvYWRpbmdcIiBhdHRyaWJ1dGUuYCk7XG4gIH1cbiAgY29uc3QgdmFsaWRJbnB1dHMgPSBbJ2F1dG8nLCAnZWFnZXInLCAnbGF6eSddO1xuICBpZiAodHlwZW9mIGRpci5sb2FkaW5nID09PSAnc3RyaW5nJyAmJiAhdmFsaWRJbnB1dHMuaW5jbHVkZXMoZGlyLmxvYWRpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGBoYXMgYW4gaW52YWxpZCB2YWx1ZTogZXhwZWN0aW5nIFwibGF6eVwiLCBcImVhZ2VyXCIsIG9yIFwiYXV0b1wiIGJ1dCBnb3Q6IGAgK1xuICAgICAgICAgICAgYFxcYCR7ZGlyLmxvYWRpbmd9XFxgLmApO1xuICB9XG59XG4iXX0=