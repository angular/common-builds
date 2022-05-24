/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injectable, InjectionToken, Injector, Input, NgModule, NgZone, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
import { DOCUMENT } from '../dom_tokens';
import * as i0 from "@angular/core";
/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 */
const noopImageLoader = (config) => config.src;
/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
/**
 * Special token that allows to configure a function that will be used to produce an image URL based
 * on the specified input.
 */
export const IMAGE_LOADER = new InjectionToken('ImageLoader', {
    providedIn: 'root',
    factory: () => noopImageLoader,
});
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
class LCPImageObserver {
    constructor(doc) {
        // Map of full image URLs -> original `rawSrc` values.
        this.images = new Map();
        // Keep track of images for which `console.warn` was produced.
        this.alreadyWarned = new Set();
        this.window = null;
        this.observer = null;
        const win = doc.defaultView;
        if (typeof win !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
            this.window = win;
            this.observer = this.initPerformanceObserver();
        }
    }
    // Converts relative image URL to a full URL.
    getFullUrl(src) {
        return new URL(src, this.window.location.href).href;
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
                const directiveDetails = imgDirectiveDetails({ rawSrc: imgRawSrc });
                console.warn(formatRuntimeError(2954 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */, `${directiveDetails}: the image was detected as the Largest Contentful Paint (LCP) ` +
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
        this.images.set(this.getFullUrl(rewrittenSrc), rawSrc);
    }
    unregisterImage(rewrittenSrc) {
        if (!this.observer)
            return;
        this.images.delete(this.getFullUrl(rewrittenSrc));
    }
    ngOnDestroy() {
        if (!this.observer)
            return;
        this.observer.disconnect();
        this.images.clear();
        this.alreadyWarned.clear();
    }
}
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: LCPImageObserver, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
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
            assertValidRawSrc(this.rawSrc);
            assertNoConflictingSrc(this);
            assertNotBase64Image(this);
            assertNotBlobURL(this);
            assertRequiredNumberInput(this, this.width, 'width');
            assertRequiredNumberInput(this, this.height, 'height');
            if (!this.priority) {
                // Monitor whether an image is an LCP element only in case
                // the `priority` attribute is missing. Otherwise, an image
                // has the necessary settings and no extra checks are required.
                withLCPImageObserver(this.injector, (observer) => observer.registerImage(this.getRewrittenSrc(), this.rawSrc));
            }
        }
        this.setHostAttribute('loading', this.getLoadingBehavior());
        this.setHostAttribute('fetchpriority', this.getFetchPriority());
        // The `src` attribute should be set last since other attributes
        // could affect the image's loading behavior.
        this.setHostAttribute('src', this.getRewrittenSrc());
    }
    ngOnChanges(changes) {
        if (ngDevMode) {
            assertNoPostInitInputChange(this, changes, ['rawSrc', 'width', 'height', 'priority']);
        }
    }
    getLoadingBehavior() {
        return this.priority ? 'eager' : 'lazy';
    }
    getFetchPriority() {
        return this.priority ? 'high' : 'auto';
    }
    getRewrittenSrc() {
        // ImageLoaderConfig supports setting a width property. However, we're not setting width here
        // because if the developer uses rendered width instead of intrinsic width in the HTML width
        // attribute, the image requested may be too small for 2x+ screens.
        const imgConfig = { src: this.rawSrc };
        return this.imageLoader(imgConfig);
    }
    ngOnDestroy() {
        if (ngDevMode && !this.priority) {
            // An image is only registered in dev mode, try to unregister only in dev mode as well.
            withLCPImageObserver(this.injector, (observer) => observer.unregisterImage(this.getRewrittenSrc()));
        }
    }
    setHostAttribute(name, value) {
        this.renderer.setAttribute(this.imgElement.nativeElement, name, value);
    }
}
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.0+sha-7081f50", type: NgOptimizedImage, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", width: "width", height: "height", priority: "priority", src: "src" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    selector: 'img[rawSrc]',
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [IMAGE_LOADER]
                }] }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i0.Injector }]; }, propDecorators: { rawSrc: [{
                type: Input
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], priority: [{
                type: Input
            }], src: [{
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
NgOptimizedImageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: NgOptimizedImageModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-7081f50", ngImport: i0, type: NgOptimizedImageModule, decorators: [{
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
function imgDirectiveDetails(dir) {
    return `The NgOptimizedImage directive (activated on an <img> element ` +
        `with the \`rawSrc="${dir.rawSrc}"\`)`;
}
/***** Assert functions *****/
// Verifies that there is no `src` set on a host element.
function assertNoConflictingSrc(dir) {
    if (dir.src) {
        throw new RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir)} has detected that the \`src\` is also set (to ` +
            `\`${dir.src}\`). Please remove the \`src\` attribute from this image. ` +
            `The NgOptimizedImage directive will use the \`rawSrc\` to compute ` +
            `the final image URL and set the \`src\` itself.`);
    }
}
// Verifies that the `rawSrc` is not a Base64-encoded image.
function assertNotBase64Image(dir) {
    let rawSrc = dir.rawSrc.trim();
    if (rawSrc.startsWith('data:')) {
        if (rawSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
            rawSrc = rawSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
        }
        throw new RuntimeError(2951 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
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
        throw new RuntimeError(2951 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
            `to a blob URL (${rawSrc}). Blob URLs are not supported by the ` +
            `NgOptimizedImage directive. Use a regular \`src\` attribute ` +
            `(instead of \`rawSrc\`) to disable the NgOptimizedImage directive ` +
            `for this element.`);
    }
}
// Verifies that the `rawSrc` is set to a non-empty string.
function assertValidRawSrc(value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    if (!isString || isEmptyString) {
        const extraMessage = isEmptyString ? ' (empty string)' : '';
        throw new RuntimeError(2951 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` has an invalid value: ` +
            `expecting a non-empty string, but got: \`${value}\`${extraMessage}.`);
    }
}
// Creates a `RuntimeError` instance to represent a situation when an input is set after
// the directive has initialized.
function postInitInputChangeError(dir, inputName) {
    return new RuntimeError(2952 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir)} has detected that the \`${inputName}\` is updated after the ` +
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
        throw new RuntimeError(2951 /* RuntimeErrorCode.INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`${inputName}\` has an invalid ` +
            `value: expecting a number that represents the ${inputName} in pixels, but got: ` +
            `\`${inputValue}\`.`);
    }
}
// Verifies that a specified input is set.
function assertRequiredNumberInput(dir, inputValue, inputName) {
    if (typeof inputValue === 'undefined') {
        throw new RuntimeError(2953 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir)} has detected that the required \`${inputName}\` ` +
            `attribute is missing. Please specify the \`${inputName}\` attribute ` +
            `on the mentioned element.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWdDLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3UCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQWtCdkM7OztHQUdHO0FBQ0gsTUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUF5QixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBRWxFOzs7Ozs7R0FNRztBQUNILE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBYyxhQUFhLEVBQUU7SUFDekUsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWU7Q0FDL0IsQ0FBQyxDQUFDO0FBRUg7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFHTSxnQkFBZ0I7SUFTcEIsWUFBOEIsR0FBYTtRQVIzQyxzREFBc0Q7UUFDOUMsV0FBTSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQzNDLDhEQUE4RDtRQUN0RCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFbEMsV0FBTSxHQUFnQixJQUFJLENBQUM7UUFDM0IsYUFBUSxHQUE2QixJQUFJLENBQUM7UUFHaEQsTUFBTSxHQUFHLEdBQUcs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O2dCQUM3QixHQUFHLEdBQUcsRUFBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBcUIsQ0FBQzthQUNsRTtZQUNELE1BQU0sd0JBQXdCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzVDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsK0RBQStEO0FBQy9ELFNBQVMsc0JBQXNCLENBQUMsVUFBbUIsRUFBRSxTQUFpQjtJQUNwRSxNQUFNLE9BQU8sR0FBRyxPQUFPLFVBQVUsS0FBSyxRQUFRO1FBQzFDLENBQUMsT0FBTyxVQUFVLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RSxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osTUFBTSxJQUFJLFlBQVksNENBRWxCLDBEQUEwRCxTQUFTLG9CQUFvQjtZQUNuRixpREFBaUQsU0FBUyx1QkFBdUI7WUFDakYsS0FBSyxVQUFVLEtBQUssQ0FBQyxDQUFDO0tBQy9CO0FBQ0gsQ0FBQztBQUVELDBDQUEwQztBQUMxQyxTQUFTLHlCQUF5QixDQUFDLEdBQXFCLEVBQUUsVUFBbUIsRUFBRSxTQUFpQjtJQUM5RixJQUFJLE9BQU8sVUFBVSxLQUFLLFdBQVcsRUFBRTtRQUNyQyxNQUFNLElBQUksWUFBWSxxREFFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMscUNBQXFDLFNBQVMsS0FBSztZQUMxRSw4Q0FBOEMsU0FBUyxlQUFlO1lBQ3RFLDJCQUEyQixDQUFDLENBQUM7S0FDdEM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBJbmplY3RvciwgSW5wdXQsIE5nTW9kdWxlLCBOZ1pvbmUsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFJlbmRlcmVyMiwgU2ltcGxlQ2hhbmdlcywgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcblxuLyoqXG4gKiBDb25maWcgb3B0aW9ucyByZWNvZ25pemVkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VMb2FkZXJDb25maWcge1xuICAvLyBOYW1lIG9mIHRoZSBpbWFnZSB0byBiZSBhZGRlZCB0byB0aGUgaW1hZ2UgcmVxdWVzdCBVUkxcbiAgc3JjOiBzdHJpbmc7XG4gIC8vIFdpZHRoIG9mIHRoZSByZXF1ZXN0ZWQgaW1hZ2UgKHRvIGJlIHVzZWQgd2hlbiBnZW5lcmF0aW5nIHNyY3NldClcbiAgd2lkdGg/OiBudW1iZXI7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBpbWFnZSBsb2FkZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIEltYWdlTG9hZGVyID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHN0cmluZztcblxuLyoqXG4gKiBOb29wIGltYWdlIGxvYWRlciB0aGF0IGRvZXMgbm8gdHJhbnNmb3JtYXRpb24gdG8gdGhlIG9yaWdpbmFsIHNyYyBhbmQganVzdCByZXR1cm5zIGl0IGFzIGlzLlxuICogVGhpcyBsb2FkZXIgaXMgdXNlZCBhcyBhIGRlZmF1bHQgb25lIGlmIG1vcmUgc3BlY2lmaWMgbG9naWMgaXMgbm90IHByb3ZpZGVkIGluIGFuIGFwcCBjb25maWcuXG4gKi9cbmNvbnN0IG5vb3BJbWFnZUxvYWRlciA9IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiBjb25maWcuc3JjO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFNwZWNpYWwgdG9rZW4gdGhhdCBhbGxvd3MgdG8gY29uZmlndXJlIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gcHJvZHVjZSBhbiBpbWFnZSBVUkwgYmFzZWRcbiAqIG9uIHRoZSBzcGVjaWZpZWQgaW5wdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBJTUFHRV9MT0FERVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48SW1hZ2VMb2FkZXI+KCdJbWFnZUxvYWRlcicsIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICBmYWN0b3J5OiAoKSA9PiBub29wSW1hZ2VMb2FkZXIsXG59KTtcblxuLyoqXG4gKiBDb250YWlucyB0aGUgbG9naWMgdG8gZGV0ZWN0IHdoZXRoZXIgYW4gaW1hZ2Ugd2l0aCB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZVxuICogaXMgdHJlYXRlZCBhcyBhbiBMQ1AgZWxlbWVudC4gSWYgc28sIHZlcmlmaWVzIHRoYXQgdGhlIGltYWdlIGlzIG1hcmtlZCBhcyBhIHByaW9yaXR5LFxuICogdXNpbmcgdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgYSBkZXYtbW9kZSBvbmx5IGNsYXNzLCB3aGljaCBzaG91bGQgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqXG4gKiBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0LlxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5jbGFzcyBMQ1BJbWFnZU9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLy8gTWFwIG9mIGZ1bGwgaW1hZ2UgVVJMcyAtPiBvcmlnaW5hbCBgcmF3U3JjYCB2YWx1ZXMuXG4gIHByaXZhdGUgaW1hZ2VzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgLy8gS2VlcCB0cmFjayBvZiBpbWFnZXMgZm9yIHdoaWNoIGBjb25zb2xlLndhcm5gIHdhcyBwcm9kdWNlZC5cbiAgcHJpdmF0ZSBhbHJlYWR5V2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvd3xudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBvYnNlcnZlcjogUGVyZm9ybWFuY2VPYnNlcnZlcnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2M6IERvY3VtZW50KSB7XG4gICAgY29uc3Qgd2luID0gZG9jLmRlZmF1bHRWaWV3O1xuICAgIGlmICh0eXBlb2Ygd2luICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgUGVyZm9ybWFuY2VPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgICAgdGhpcy5vYnNlcnZlciA9IHRoaXMuaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTtcbiAgICB9XG4gIH1cblxuICAvLyBDb252ZXJ0cyByZWxhdGl2ZSBpbWFnZSBVUkwgdG8gYSBmdWxsIFVSTC5cbiAgcHJpdmF0ZSBnZXRGdWxsVXJsKHNyYzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBVUkwoc3JjLCB0aGlzLndpbmRvdyEubG9jYXRpb24uaHJlZikuaHJlZjtcbiAgfVxuXG4gIC8vIEluaXRzIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgYW5kIHN1YnNjcmliZXMgdG8gTENQIGV2ZW50cy5cbiAgLy8gQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdFxuICBwcml2YXRlIGluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk6IFBlcmZvcm1hbmNlT2JzZXJ2ZXIge1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKGVudHJ5TGlzdCkgPT4ge1xuICAgICAgY29uc3QgZW50cmllcyA9IGVudHJ5TGlzdC5nZXRFbnRyaWVzKCk7XG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgIC8vIE5vdGU6IHdlIHVzZSB0aGUgbGF0ZXN0IGVudHJ5IHByb2R1Y2VkIGJ5IHRoZSBgUGVyZm9ybWFuY2VPYnNlcnZlcmAgYXMgdGhlIGJlc3RcbiAgICAgIC8vIHNpZ25hbCBvbiB3aGljaCBlbGVtZW50IGlzIGFjdHVhbGx5IGFuIExDUCBvbmUuIEFzIGFuIGV4YW1wbGUsIHRoZSBmaXJzdCBpbWFnZSB0byBsb2FkIG9uXG4gICAgICAvLyBhIHBhZ2UsIGJ5IHZpcnR1ZSBvZiBiZWluZyB0aGUgb25seSB0aGluZyBvbiB0aGUgcGFnZSBzbyBmYXIsIGlzIG9mdGVuIGEgTENQIGNhbmRpZGF0ZVxuICAgICAgLy8gYW5kIGdldHMgcmVwb3J0ZWQgYnkgUGVyZm9ybWFuY2VPYnNlcnZlciwgYnV0IGlzbid0IG5lY2Vzc2FyaWx5IHRoZSBMQ1AgZWxlbWVudC5cbiAgICAgIGNvbnN0IGxjcEVsZW1lbnQgPSBlbnRyaWVzW2VudHJpZXMubGVuZ3RoIC0gMV07XG4gICAgICAvLyBDYXN0IHRvIGBhbnlgIGR1ZSB0byBtaXNzaW5nIGBlbGVtZW50YCBvbiBvYnNlcnZlZCB0eXBlIG9mIGVudHJ5LlxuICAgICAgY29uc3QgaW1nU3JjID0gKGxjcEVsZW1lbnQgYXMgYW55KS5lbGVtZW50Py5zcmMgPz8gJyc7XG5cbiAgICAgIC8vIEV4Y2x1ZGUgYGRhdGE6YCBhbmQgYGJsb2I6YCBVUkxzLCBzaW5jZSB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBkaXJlY3RpdmUuXG4gICAgICBpZiAoaW1nU3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykgfHwgaW1nU3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHJldHVybjtcblxuICAgICAgY29uc3QgaW1nUmF3U3JjID0gdGhpcy5pbWFnZXMuZ2V0KGltZ1NyYyk7XG4gICAgICBpZiAoaW1nUmF3U3JjICYmICF0aGlzLmFscmVhZHlXYXJuZWQuaGFzKGltZ1NyYykpIHtcbiAgICAgICAgdGhpcy5hbHJlYWR5V2FybmVkLmFkZChpbWdTcmMpO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyh7cmF3U3JjOiBpbWdSYXdTcmN9IGFzIGFueSk7XG4gICAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkxDUF9JTUdfTUlTU0lOR19QUklPUklUWSxcbiAgICAgICAgICAgIGAke2RpcmVjdGl2ZURldGFpbHN9OiB0aGUgaW1hZ2Ugd2FzIGRldGVjdGVkIGFzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgICAgICAgICAgYGVsZW1lbnQsIHNvIGl0cyBsb2FkaW5nIHNob3VsZCBiZSBwcmlvcml0aXplZCBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZS4gUGxlYXNlIGAgK1xuICAgICAgICAgICAgICAgIGBhZGQgdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUgaWYgdGhpcyBpbWFnZSBpcyBhYm92ZSB0aGUgZm9sZC5gKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh7dHlwZTogJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCcsIGJ1ZmZlcmVkOiB0cnVlfSk7XG4gICAgcmV0dXJuIG9ic2VydmVyO1xuICB9XG5cbiAgcmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZywgcmF3U3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5zZXQodGhpcy5nZXRGdWxsVXJsKHJld3JpdHRlblNyYyksIHJhd1NyYyk7XG4gIH1cblxuICB1bnJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5kZWxldGUodGhpcy5nZXRGdWxsVXJsKHJld3JpdHRlblNyYykpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5pbWFnZXMuY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlXYXJuZWQuY2xlYXIoKTtcbiAgfVxufVxuXG4vKipcbiAqICoqIEVYUEVSSU1FTlRBTCAqKlxuICpcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgZGVzY3JpcHRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgdXNhZ2Ugbm90ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2ltZ1tyYXdTcmNdJyxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoSU1BR0VfTE9BREVSKSBwcml2YXRlIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlciwgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgICAgcHJpdmF0ZSBpbWdFbGVtZW50OiBFbGVtZW50UmVmLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvLyBQcml2YXRlIGZpZWxkcyB0byBrZWVwIG5vcm1hbGl6ZWQgaW5wdXQgdmFsdWVzLlxuICBwcml2YXRlIF93aWR0aD86IG51bWJlcjtcbiAgcHJpdmF0ZSBfaGVpZ2h0PzogbnVtYmVyO1xuICBwcml2YXRlIF9wcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCgpIHJhd1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgd2lkdGgodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydFZhbGlkTnVtYmVySW5wdXQodmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGhlaWdodCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VmFsaWROdW1iZXJJbnB1dCh2YWx1ZSwgJ2hlaWdodCcpO1xuICAgIHRoaXMuX2hlaWdodCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgaGVpZ2h0KCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbWFnZSBzaG91bGQgaGF2ZSBhIGhpZ2ggcHJpb3JpdHkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgcHJpb3JpdHkodmFsdWU6IHN0cmluZ3xib29sZWFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3ByaW9yaXR5ID0gaW5wdXRUb0Jvb2xlYW4odmFsdWUpO1xuICB9XG4gIGdldCBwcmlvcml0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJpb3JpdHk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdmFsdWUgb2YgdGhlIGBzcmNgIGlmIGl0J3Mgc2V0IG9uIGEgaG9zdCA8aW1nPiBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIG5lZWRlZCB0byB2ZXJpZnkgdGhhdCB0aGVyZSBhcmUgbm8gYHNyY2AgYW5kIGByYXdTcmNgIHByb3ZpZGVkXG4gICAqIGF0IHRoZSBzYW1lIHRpbWUgKHRodXMgY2F1c2luZyBhbiBhbWJpZ3VpdHkgb24gd2hpY2ggc3JjIHRvIHVzZSkuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydFZhbGlkUmF3U3JjKHRoaXMucmF3U3JjKTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVUkwodGhpcyk7XG4gICAgICBhc3NlcnRSZXF1aXJlZE51bWJlcklucHV0KHRoaXMsIHRoaXMud2lkdGgsICd3aWR0aCcpO1xuICAgICAgYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dCh0aGlzLCB0aGlzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgICAgaWYgKCF0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIC8vIE1vbml0b3Igd2hldGhlciBhbiBpbWFnZSBpcyBhbiBMQ1AgZWxlbWVudCBvbmx5IGluIGNhc2VcbiAgICAgICAgLy8gdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGlzIG1pc3NpbmcuIE90aGVyd2lzZSwgYW4gaW1hZ2VcbiAgICAgICAgLy8gaGFzIHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgYW5kIG5vIGV4dHJhIGNoZWNrcyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIHdpdGhMQ1BJbWFnZU9ic2VydmVyKFxuICAgICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT5cbiAgICAgICAgICAgICAgICBvYnNlcnZlci5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMucmF3U3JjKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbG9hZGluZycsIHRoaXMuZ2V0TG9hZGluZ0JlaGF2aW9yKCkpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnZmV0Y2hwcmlvcml0eScsIHRoaXMuZ2V0RmV0Y2hQcmlvcml0eSgpKTtcbiAgICAvLyBUaGUgYHNyY2AgYXR0cmlidXRlIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCB0aGlzLmdldFJld3JpdHRlblNyYygpKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UodGhpcywgY2hhbmdlcywgWydyYXdTcmMnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ3ByaW9yaXR5J10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMucmF3U3JjfTtcbiAgICByZXR1cm4gdGhpcy5pbWFnZUxvYWRlcihpbWdDb25maWcpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKG5nRGV2TW9kZSAmJiAhdGhpcy5wcmlvcml0eSkge1xuICAgICAgLy8gQW4gaW1hZ2UgaXMgb25seSByZWdpc3RlcmVkIGluIGRldiBtb2RlLCB0cnkgdG8gdW5yZWdpc3RlciBvbmx5IGluIGRldiBtb2RlIGFzIHdlbGwuXG4gICAgICB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gb2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCkpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG5cbi8qKlxuICogTmdNb2R1bGUgdGhhdCBkZWNsYXJlcyBhbmQgZXhwb3J0cyB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZS5cbiAqIFRoaXMgTmdNb2R1bGUgaXMgYSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBhcHBzIHRoYXQgdXNlIHByZS12MTRcbiAqIHZlcnNpb25zIG9mIEFuZ3VsYXIgKGJlZm9yZSB0aGUgYHN0YW5kYWxvbmVgIGZsYWcgYmVjYW1lIGF2YWlsYWJsZSkuXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCB3aWxsIGJlY29tZSBhIHN0YW5kYWxvbmUgZGlyZWN0aXZlIGluIHYxNCBhbmRcbiAqIHRoaXMgTmdNb2R1bGUgd2lsbCBiZSByZW1vdmVkLlxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAgZXhwb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlTW9kdWxlIHtcbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8vIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gaW50ZWdlci5cbmZ1bmN0aW9uIGlucHV0VG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCk6IG51bWJlcnx1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB2YWx1ZTtcbn1cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBib29sZWFuLlxuZnVuY3Rpb24gaW5wdXRUb0Jvb2xlYW4odmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgYCR7dmFsdWV9YCAhPT0gJ2ZhbHNlJztcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgZnVuY3Rpb24sIHBhc3NpbmcgYW4gaW5zdGFuY2Ugb2YgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBhcyBhbiBhcmd1bWVudC5cbiAqXG4gKiBOb3RlczpcbiAqIC0gdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBpcyBhIHRyZWUtc2hha2FibGUgcHJvdmlkZXIsIHByb3ZpZGVkIGluICdyb290JyxcbiAqICAgdGh1cyBpdCdzIGEgc2luZ2xldG9uIHdpdGhpbiB0aGlzIGFwcGxpY2F0aW9uXG4gKiAtIHRoZSBwcm9jZXNzIG9mIGBMQ1BJbWFnZU9ic2VydmVyYCBjcmVhdGlvbiBhbmQgYW4gYWN0dWFsIG9wZXJhdGlvbiBhcmUgaW52b2tlZCBvdXRzaWRlIG9mIHRoZVxuICogICBOZ1pvbmUgdG8gbWFrZSBzdXJlIG5vbmUgb2YgdGhlIGNhbGxzIGluc2lkZSB0aGUgYExDUEltYWdlT2JzZXJ2ZXJgIGNsYXNzIHRyaWdnZXIgdW5uZWNlc3NhcnlcbiAqICAgY2hhbmdlIGRldGVjdGlvblxuICovXG5mdW5jdGlvbiB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsIG9wZXJhdGlvbjogKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiB2b2lkKTogdm9pZCB7XG4gIGNvbnN0IG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICByZXR1cm4gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICBjb25zdCBvYnNlcnZlciA9IGluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKTtcbiAgICBvcGVyYXRpb24ob2JzZXJ2ZXIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW1nRGlyZWN0aXZlRGV0YWlscyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgcmV0dXJuIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgKGFjdGl2YXRlZCBvbiBhbiA8aW1nPiBlbGVtZW50IGAgK1xuICAgICAgYHdpdGggdGhlIFxcYHJhd1NyYz1cIiR7ZGlyLnJhd1NyY31cIlxcYClgO1xufVxuXG4vKioqKiogQXNzZXJ0IGZ1bmN0aW9ucyAqKioqKi9cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3JjYCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgc3JjXFxgIGlzIGFsc28gc2V0ICh0byBgICtcbiAgICAgICAgICAgIGBcXGAke2Rpci5zcmN9XFxgKS4gUGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZSBmcm9tIHRoaXMgaW1hZ2UuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIHVzZSB0aGUgXFxgcmF3U3JjXFxgIHRvIGNvbXB1dGUgYCArXG4gICAgICAgICAgICBgdGhlIGZpbmFsIGltYWdlIFVSTCBhbmQgc2V0IHRoZSBcXGBzcmNcXGAgaXRzZWxmLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCByYXdTcmMgPSBkaXIucmF3U3JjLnRyaW0oKTtcbiAgaWYgKHJhd1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKHJhd1NyYy5sZW5ndGggPiBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpIHtcbiAgICAgIHJhd1NyYyA9IHJhd1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nICgke3Jhd1NyY30pLiBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzIGFyZSBgICtcbiAgICAgICAgICAgIGBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gVXNlIGEgcmVndWxhciBcXGBzcmNcXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIChpbnN0ZWFkIG9mIFxcYHJhd1NyY1xcYCkgdG8gZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBgICtcbiAgICAgICAgICAgIGBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVUkwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgYmxvYiBVUkwgKCR7cmF3U3JjfSkuIEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgYCArXG4gICAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIFVzZSBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGAoaW5zdGVhZCBvZiBcXGByYXdTcmNcXGApIHRvIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGAgK1xuICAgICAgICAgICAgYGZvciB0aGlzIGVsZW1lbnQuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkUmF3U3JjKHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIGNvbnN0IGV4dHJhTWVzc2FnZSA9IGlzRW1wdHlTdHJpbmcgPyAnIChlbXB0eSBzdHJpbmcpJyA6ICcnO1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlOiBgICtcbiAgICAgICAgICAgIGBleHBlY3RpbmcgYSBub24tZW1wdHkgc3RyaW5nLCBidXQgZ290OiBcXGAke3ZhbHVlfVxcYCR7ZXh0cmFNZXNzYWdlfS5gKTtcbiAgfVxufVxuXG4vLyBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4vLyB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcil9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgaXMgdXBkYXRlZCBhZnRlciB0aGUgYCArXG4gICAgICAgICAgYGluaXRpYWxpemF0aW9uLiBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuYCk7XG59XG5cbi8vIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG5mdW5jdGlvbiBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBpbnB1dHM6IHN0cmluZ1tdKSB7XG4gIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICBjb25zdCBpc1VwZGF0ZWQgPSBjaGFuZ2VzLmhhc093blByb3BlcnR5KGlucHV0KTtcbiAgICBpZiAoaXNVcGRhdGVkICYmICFjaGFuZ2VzW2lucHV0XS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ3Jhd1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYHJhd1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgcmF3U3JjYCBpcyBhbHJlYWR5IHNldC4gV2UgdXNlXG4gICAgICAgIC8vIGByYXdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtyYXdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBoYXMgYSBjb3JyZWN0IHR5cGUgKG51bWJlcikuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZE51bWJlcklucHV0KGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGlzVmFsaWQgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgfHxcbiAgICAgICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkpO1xuICBpZiAoIWlzVmFsaWQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCBoYXMgYW4gaW52YWxpZCBgICtcbiAgICAgICAgICAgIGB2YWx1ZTogZXhwZWN0aW5nIGEgbnVtYmVyIHRoYXQgcmVwcmVzZW50cyB0aGUgJHtpbnB1dE5hbWV9IGluIHBpeGVscywgYnV0IGdvdDogYCArXG4gICAgICAgICAgICBgXFxgJHtpbnB1dFZhbHVlfVxcYC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbmZ1bmN0aW9uIGFzc2VydFJlcXVpcmVkTnVtYmVySW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBpZiAodHlwZW9mIGlucHV0VmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcil9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSByZXF1aXJlZCBcXGAke2lucHV0TmFtZX1cXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIGlzIG1pc3NpbmcuIFBsZWFzZSBzcGVjaWZ5IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYG9uIHRoZSBtZW50aW9uZWQgZWxlbWVudC5gKTtcbiAgfVxufVxuIl19