/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injectable, InjectionToken, Injector, Input, NgModule, NgZone, Renderer2, ɵRuntimeError as RuntimeError } from '@angular/core';
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
                console.warn(formatRuntimeError(2954 /* LCP_IMG_MISSING_PRIORITY */, `${directiveDetails}: the image was detected as the Largest Contentful Paint (LCP) ` +
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
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: LCPImageObserver, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: LCPImageObserver, decorators: [{
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", type: NgOptimizedImage, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", width: "width", height: "height", priority: "priority", src: "src" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
NgOptimizedImageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: NgOptimizedImageModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+20.sha-aa6f0c0", ngImport: i0, type: NgOptimizedImageModule, decorators: [{
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
        throw new RuntimeError(2950 /* UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir)} has detected that the \`src\` is also set (to ` +
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
        throw new RuntimeError(2951 /* INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
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
        throw new RuntimeError(2951 /* INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
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
        throw new RuntimeError(2951 /* INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`rawSrc\` has an invalid value: ` +
            `expecting a non-empty string, but got: \`${value}\`${extraMessage}.`);
    }
}
// Creates a `RuntimeError` instance to represent a situation when an input is set after
// the directive has initialized.
function postInitInputChangeError(dir, inputName) {
    return new RuntimeError(2952 /* UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir)} has detected that the \`${inputName}\` is updated after the ` +
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
        throw new RuntimeError(2951 /* INVALID_INPUT */, `The NgOptimizedImage directive has detected that the \`${inputName}\` has an invalid ` +
            `value: expecting a number that represents the ${inputName} in pixels, but got: ` +
            `\`${inputValue}\`.`);
    }
}
// Verifies that a specified input is set.
function assertRequiredNumberInput(dir, inputValue, inputName) {
    if (typeof inputValue === 'undefined') {
        throw new RuntimeError(2953 /* REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir)} has detected that the required \`${inputName}\` ` +
            `attribute is missing. Please specify the \`${inputName}\` attribute ` +
            `on the mentioned element.`);
    }
}
// #####################
// Copied from /core/src/errors.ts` since the function is not exposed in
// Angular v12, v13.
// #####################
export const ERROR_DETAILS_PAGE_BASE_URL = 'https://angular.io/errors';
function formatRuntimeError(code, message) {
    // Error code might be a negative number, which is a special marker that instructs the logic to
    // generate a link to the error details page on angular.io.
    const fullCode = `NG0${Math.abs(code)}`;
    let errorMessage = `${fullCode}${message ? ': ' + message : ''}`;
    if (ngDevMode && code < 0) {
        errorMessage = `${errorMessage}. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
    }
    return errorMessage;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWdDLFNBQVMsRUFBaUIsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVsTixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQWtCdkM7OztHQUdHO0FBQ0gsTUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUF5QixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBRWxFOzs7Ozs7R0FNRztBQUNILE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBYyxhQUFhLEVBQUU7SUFDekUsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWU7Q0FDL0IsQ0FBQyxDQUFDO0FBRUg7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFHTSxnQkFBZ0I7SUFTcEIsWUFBOEIsR0FBYTtRQVIzQyxzREFBc0Q7UUFDOUMsV0FBTSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQzNDLDhEQUE4RDtRQUN0RCxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFbEMsV0FBTSxHQUFnQixJQUFJLENBQUM7UUFDM0IsYUFBUSxHQUE2QixJQUFJLENBQUM7UUFHaEQsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUM1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QUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBRXhDLElBQUksWUFBWSxHQUFHLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7SUFFakUsSUFBSSxTQUFTLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtRQUN6QixZQUFZLEdBQUcsR0FBRyxZQUFZLGtCQUFrQiwyQkFBMkIsSUFBSSxRQUFRLEVBQUUsQ0FBQztLQUMzRjtJQUNELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGUsIE5nWm9uZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyLCBTaW1wbGVDaGFuZ2VzLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcblxuLyoqXG4gKiBDb25maWcgb3B0aW9ucyByZWNvZ25pemVkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VMb2FkZXJDb25maWcge1xuICAvLyBOYW1lIG9mIHRoZSBpbWFnZSB0byBiZSBhZGRlZCB0byB0aGUgaW1hZ2UgcmVxdWVzdCBVUkxcbiAgc3JjOiBzdHJpbmc7XG4gIC8vIFdpZHRoIG9mIHRoZSByZXF1ZXN0ZWQgaW1hZ2UgKHRvIGJlIHVzZWQgd2hlbiBnZW5lcmF0aW5nIHNyY3NldClcbiAgd2lkdGg/OiBudW1iZXI7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBpbWFnZSBsb2FkZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIEltYWdlTG9hZGVyID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHN0cmluZztcblxuLyoqXG4gKiBOb29wIGltYWdlIGxvYWRlciB0aGF0IGRvZXMgbm8gdHJhbnNmb3JtYXRpb24gdG8gdGhlIG9yaWdpbmFsIHNyYyBhbmQganVzdCByZXR1cm5zIGl0IGFzIGlzLlxuICogVGhpcyBsb2FkZXIgaXMgdXNlZCBhcyBhIGRlZmF1bHQgb25lIGlmIG1vcmUgc3BlY2lmaWMgbG9naWMgaXMgbm90IHByb3ZpZGVkIGluIGFuIGFwcCBjb25maWcuXG4gKi9cbmNvbnN0IG5vb3BJbWFnZUxvYWRlciA9IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiBjb25maWcuc3JjO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFNwZWNpYWwgdG9rZW4gdGhhdCBhbGxvd3MgdG8gY29uZmlndXJlIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gcHJvZHVjZSBhbiBpbWFnZSBVUkwgYmFzZWRcbiAqIG9uIHRoZSBzcGVjaWZpZWQgaW5wdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBJTUFHRV9MT0FERVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48SW1hZ2VMb2FkZXI+KCdJbWFnZUxvYWRlcicsIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICBmYWN0b3J5OiAoKSA9PiBub29wSW1hZ2VMb2FkZXIsXG59KTtcblxuLyoqXG4gKiBDb250YWlucyB0aGUgbG9naWMgdG8gZGV0ZWN0IHdoZXRoZXIgYW4gaW1hZ2Ugd2l0aCB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZVxuICogaXMgdHJlYXRlZCBhcyBhbiBMQ1AgZWxlbWVudC4gSWYgc28sIHZlcmlmaWVzIHRoYXQgdGhlIGltYWdlIGlzIG1hcmtlZCBhcyBhIHByaW9yaXR5LFxuICogdXNpbmcgdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgYSBkZXYtbW9kZSBvbmx5IGNsYXNzLCB3aGljaCBzaG91bGQgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqXG4gKiBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0LlxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5jbGFzcyBMQ1BJbWFnZU9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLy8gTWFwIG9mIGZ1bGwgaW1hZ2UgVVJMcyAtPiBvcmlnaW5hbCBgcmF3U3JjYCB2YWx1ZXMuXG4gIHByaXZhdGUgaW1hZ2VzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgLy8gS2VlcCB0cmFjayBvZiBpbWFnZXMgZm9yIHdoaWNoIGBjb25zb2xlLndhcm5gIHdhcyBwcm9kdWNlZC5cbiAgcHJpdmF0ZSBhbHJlYWR5V2FybmVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvd3xudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBvYnNlcnZlcjogUGVyZm9ybWFuY2VPYnNlcnZlcnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2M6IERvY3VtZW50KSB7XG4gICAgY29uc3Qgd2luID0gZG9jLmRlZmF1bHRWaWV3O1xuICAgIGlmICh0eXBlb2Ygd2luICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgUGVyZm9ybWFuY2VPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgICAgdGhpcy5vYnNlcnZlciA9IHRoaXMuaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTtcbiAgICB9XG4gIH1cblxuICAvLyBDb252ZXJ0cyByZWxhdGl2ZSBpbWFnZSBVUkwgdG8gYSBmdWxsIFVSTC5cbiAgcHJpdmF0ZSBnZXRGdWxsVXJsKHNyYzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBVUkwoc3JjLCB0aGlzLndpbmRvdyEubG9jYXRpb24uaHJlZikuaHJlZjtcbiAgfVxuXG4gIC8vIEluaXRzIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgYW5kIHN1YnNjcmliZXMgdG8gTENQIGV2ZW50cy5cbiAgLy8gQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdFxuICBwcml2YXRlIGluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk6IFBlcmZvcm1hbmNlT2JzZXJ2ZXIge1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKGVudHJ5TGlzdCkgPT4ge1xuICAgICAgY29uc3QgZW50cmllcyA9IGVudHJ5TGlzdC5nZXRFbnRyaWVzKCk7XG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgIC8vIE5vdGU6IHdlIHVzZSB0aGUgbGF0ZXN0IGVudHJ5IHByb2R1Y2VkIGJ5IHRoZSBgUGVyZm9ybWFuY2VPYnNlcnZlcmAgYXMgdGhlIGJlc3RcbiAgICAgIC8vIHNpZ25hbCBvbiB3aGljaCBlbGVtZW50IGlzIGFjdHVhbGx5IGFuIExDUCBvbmUuIEFzIGFuIGV4YW1wbGUsIHRoZSBmaXJzdCBpbWFnZSB0byBsb2FkIG9uXG4gICAgICAvLyBhIHBhZ2UsIGJ5IHZpcnR1ZSBvZiBiZWluZyB0aGUgb25seSB0aGluZyBvbiB0aGUgcGFnZSBzbyBmYXIsIGlzIG9mdGVuIGEgTENQIGNhbmRpZGF0ZVxuICAgICAgLy8gYW5kIGdldHMgcmVwb3J0ZWQgYnkgUGVyZm9ybWFuY2VPYnNlcnZlciwgYnV0IGlzbid0IG5lY2Vzc2FyaWx5IHRoZSBMQ1AgZWxlbWVudC5cbiAgICAgIGNvbnN0IGxjcEVsZW1lbnQgPSBlbnRyaWVzW2VudHJpZXMubGVuZ3RoIC0gMV07XG4gICAgICAvLyBDYXN0IHRvIGBhbnlgIGR1ZSB0byBtaXNzaW5nIGBlbGVtZW50YCBvbiBvYnNlcnZlZCB0eXBlIG9mIGVudHJ5LlxuICAgICAgY29uc3QgaW1nU3JjID0gKGxjcEVsZW1lbnQgYXMgYW55KS5lbGVtZW50Py5zcmMgPz8gJyc7XG5cbiAgICAgIC8vIEV4Y2x1ZGUgYGRhdGE6YCBhbmQgYGJsb2I6YCBVUkxzLCBzaW5jZSB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBkaXJlY3RpdmUuXG4gICAgICBpZiAoaW1nU3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykgfHwgaW1nU3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHJldHVybjtcblxuICAgICAgY29uc3QgaW1nUmF3U3JjID0gdGhpcy5pbWFnZXMuZ2V0KGltZ1NyYyk7XG4gICAgICBpZiAoaW1nUmF3U3JjICYmICF0aGlzLmFscmVhZHlXYXJuZWQuaGFzKGltZ1NyYykpIHtcbiAgICAgICAgdGhpcy5hbHJlYWR5V2FybmVkLmFkZChpbWdTcmMpO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyh7cmF3U3JjOiBpbWdSYXdTcmN9IGFzIGFueSk7XG4gICAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkxDUF9JTUdfTUlTU0lOR19QUklPUklUWSxcbiAgICAgICAgICAgIGAke2RpcmVjdGl2ZURldGFpbHN9OiB0aGUgaW1hZ2Ugd2FzIGRldGVjdGVkIGFzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgICAgICAgICAgYGVsZW1lbnQsIHNvIGl0cyBsb2FkaW5nIHNob3VsZCBiZSBwcmlvcml0aXplZCBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZS4gUGxlYXNlIGAgK1xuICAgICAgICAgICAgICAgIGBhZGQgdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUgaWYgdGhpcyBpbWFnZSBpcyBhYm92ZSB0aGUgZm9sZC5gKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh7dHlwZTogJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCcsIGJ1ZmZlcmVkOiB0cnVlfSk7XG4gICAgcmV0dXJuIG9ic2VydmVyO1xuICB9XG5cbiAgcmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZywgcmF3U3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5zZXQodGhpcy5nZXRGdWxsVXJsKHJld3JpdHRlblNyYyksIHJhd1NyYyk7XG4gIH1cblxuICB1bnJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5kZWxldGUodGhpcy5nZXRGdWxsVXJsKHJld3JpdHRlblNyYykpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5pbWFnZXMuY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlXYXJuZWQuY2xlYXIoKTtcbiAgfVxufVxuXG4vKipcbiAqICoqIEVYUEVSSU1FTlRBTCAqKlxuICpcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgZGVzY3JpcHRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgdXNhZ2Ugbm90ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2ltZ1tyYXdTcmNdJyxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoSU1BR0VfTE9BREVSKSBwcml2YXRlIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlciwgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgICAgcHJpdmF0ZSBpbWdFbGVtZW50OiBFbGVtZW50UmVmLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvLyBQcml2YXRlIGZpZWxkcyB0byBrZWVwIG5vcm1hbGl6ZWQgaW5wdXQgdmFsdWVzLlxuICBwcml2YXRlIF93aWR0aD86IG51bWJlcjtcbiAgcHJpdmF0ZSBfaGVpZ2h0PzogbnVtYmVyO1xuICBwcml2YXRlIF9wcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCgpIHJhd1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgd2lkdGgodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydFZhbGlkTnVtYmVySW5wdXQodmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGhlaWdodCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VmFsaWROdW1iZXJJbnB1dCh2YWx1ZSwgJ2hlaWdodCcpO1xuICAgIHRoaXMuX2hlaWdodCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgaGVpZ2h0KCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbWFnZSBzaG91bGQgaGF2ZSBhIGhpZ2ggcHJpb3JpdHkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgcHJpb3JpdHkodmFsdWU6IHN0cmluZ3xib29sZWFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3ByaW9yaXR5ID0gaW5wdXRUb0Jvb2xlYW4odmFsdWUpO1xuICB9XG4gIGdldCBwcmlvcml0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJpb3JpdHk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdmFsdWUgb2YgdGhlIGBzcmNgIGlmIGl0J3Mgc2V0IG9uIGEgaG9zdCA8aW1nPiBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIG5lZWRlZCB0byB2ZXJpZnkgdGhhdCB0aGVyZSBhcmUgbm8gYHNyY2AgYW5kIGByYXdTcmNgIHByb3ZpZGVkXG4gICAqIGF0IHRoZSBzYW1lIHRpbWUgKHRodXMgY2F1c2luZyBhbiBhbWJpZ3VpdHkgb24gd2hpY2ggc3JjIHRvIHVzZSkuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydFZhbGlkUmF3U3JjKHRoaXMucmF3U3JjKTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVUkwodGhpcyk7XG4gICAgICBhc3NlcnRSZXF1aXJlZE51bWJlcklucHV0KHRoaXMsIHRoaXMud2lkdGgsICd3aWR0aCcpO1xuICAgICAgYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dCh0aGlzLCB0aGlzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgICAgaWYgKCF0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIC8vIE1vbml0b3Igd2hldGhlciBhbiBpbWFnZSBpcyBhbiBMQ1AgZWxlbWVudCBvbmx5IGluIGNhc2VcbiAgICAgICAgLy8gdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGlzIG1pc3NpbmcuIE90aGVyd2lzZSwgYW4gaW1hZ2VcbiAgICAgICAgLy8gaGFzIHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgYW5kIG5vIGV4dHJhIGNoZWNrcyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIHdpdGhMQ1BJbWFnZU9ic2VydmVyKFxuICAgICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT5cbiAgICAgICAgICAgICAgICBvYnNlcnZlci5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMucmF3U3JjKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbG9hZGluZycsIHRoaXMuZ2V0TG9hZGluZ0JlaGF2aW9yKCkpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnZmV0Y2hwcmlvcml0eScsIHRoaXMuZ2V0RmV0Y2hQcmlvcml0eSgpKTtcbiAgICAvLyBUaGUgYHNyY2AgYXR0cmlidXRlIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCB0aGlzLmdldFJld3JpdHRlblNyYygpKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UodGhpcywgY2hhbmdlcywgWydyYXdTcmMnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ3ByaW9yaXR5J10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0TG9hZGluZ0JlaGF2aW9yKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMucmF3U3JjfTtcbiAgICByZXR1cm4gdGhpcy5pbWFnZUxvYWRlcihpbWdDb25maWcpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKG5nRGV2TW9kZSAmJiAhdGhpcy5wcmlvcml0eSkge1xuICAgICAgLy8gQW4gaW1hZ2UgaXMgb25seSByZWdpc3RlcmVkIGluIGRldiBtb2RlLCB0cnkgdG8gdW5yZWdpc3RlciBvbmx5IGluIGRldiBtb2RlIGFzIHdlbGwuXG4gICAgICB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gb2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuZ2V0UmV3cml0dGVuU3JjKCkpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIE5nTW9kdWxlIHRoYXQgZGVjbGFyZXMgYW5kIGV4cG9ydHMgdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUuXG4gKiBUaGlzIE5nTW9kdWxlIGlzIGEgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgYXBwcyB0aGF0IHVzZSBwcmUtdjE0XG4gKiB2ZXJzaW9ucyBvZiBBbmd1bGFyIChiZWZvcmUgdGhlIGBzdGFuZGFsb25lYCBmbGFnIGJlY2FtZSBhdmFpbGFibGUpLlxuICpcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgd2lsbCBiZWNvbWUgYSBzdGFuZGFsb25lIGRpcmVjdGl2ZSBpbiB2MTQgYW5kXG4gKiB0aGlzIE5nTW9kdWxlIHdpbGwgYmUgcmVtb3ZlZC5cbiAqL1xuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gIGV4cG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZU1vZHVsZSB7XG59XG5cbi8qKioqKiBIZWxwZXJzICoqKioqL1xuXG4vLyBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGludGVnZXIuXG5mdW5jdGlvbiBpbnB1dFRvSW50ZWdlcih2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogdmFsdWU7XG59XG5cbi8vIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gYm9vbGVhbi5cbmZ1bmN0aW9uIGlucHV0VG9Cb29sZWFuKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGAke3ZhbHVlfWAgIT09ICdmYWxzZSc7XG59XG5cbi8qKlxuICogSW52b2tlcyBhIGZ1bmN0aW9uLCBwYXNzaW5nIGFuIGluc3RhbmNlIG9mIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgYXMgYW4gYXJndW1lbnQuXG4gKlxuICogTm90ZXM6XG4gKiAtIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgaXMgYSB0cmVlLXNoYWthYmxlIHByb3ZpZGVyLCBwcm92aWRlZCBpbiAncm9vdCcsXG4gKiAgIHRodXMgaXQncyBhIHNpbmdsZXRvbiB3aXRoaW4gdGhpcyBhcHBsaWNhdGlvblxuICogLSB0aGUgcHJvY2VzcyBvZiBgTENQSW1hZ2VPYnNlcnZlcmAgY3JlYXRpb24gYW5kIGFuIGFjdHVhbCBvcGVyYXRpb24gYXJlIGludm9rZWQgb3V0c2lkZSBvZiB0aGVcbiAqICAgTmdab25lIHRvIG1ha2Ugc3VyZSBub25lIG9mIHRoZSBjYWxscyBpbnNpZGUgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBjbGFzcyB0cmlnZ2VyIHVubmVjZXNzYXJ5XG4gKiAgIGNoYW5nZSBkZXRlY3Rpb25cbiAqL1xuZnVuY3Rpb24gd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgaW5qZWN0b3I6IEluamVjdG9yLCBvcGVyYXRpb246IChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gdm9pZCk6IHZvaWQge1xuICBjb25zdCBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgcmV0dXJuIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBpbmplY3Rvci5nZXQoTENQSW1hZ2VPYnNlcnZlcik7XG4gICAgb3BlcmF0aW9uKG9ic2VydmVyKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGltZ0RpcmVjdGl2ZURldGFpbHMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIHJldHVybiBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIChhY3RpdmF0ZWQgb24gYW4gPGltZz4gZWxlbWVudCBgICtcbiAgICAgIGB3aXRoIHRoZSBcXGByYXdTcmM9XCIke2Rpci5yYXdTcmN9XCJcXGApYDtcbn1cblxuLyoqKioqIEFzc2VydCBmdW5jdGlvbnMgKioqKiovXG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmMpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHNyY1xcYCBpcyBhbHNvIHNldCAodG8gYCArXG4gICAgICAgICAgICBgXFxgJHtkaXIuc3JjfVxcYCkuIFBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY1xcYCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGltYWdlLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCB1c2UgdGhlIFxcYHJhd1NyY1xcYCB0byBjb21wdXRlIGAgK1xuICAgICAgICAgICAgYHRoZSBmaW5hbCBpbWFnZSBVUkwgYW5kIHNldCB0aGUgXFxgc3JjXFxgIGl0c2VsZi5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBub3QgYSBCYXNlNjQtZW5jb2RlZCBpbWFnZS5cbmZ1bmN0aW9uIGFzc2VydE5vdEJhc2U2NEltYWdlKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgcmF3U3JjID0gZGlyLnJhd1NyYy50cmltKCk7XG4gIGlmIChyYXdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSkge1xuICAgIGlmIChyYXdTcmMubGVuZ3RoID4gQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSB7XG4gICAgICByYXdTcmMgPSByYXdTcmMuc3Vic3RyaW5nKDAsIEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikgKyAnLi4uJztcbiAgICB9XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGByYXdTcmNcXGAgd2FzIHNldCBgICtcbiAgICAgICAgICAgIGB0byBhIEJhc2U2NC1lbmNvZGVkIHN0cmluZyAoJHtyYXdTcmN9KS4gQmFzZTY0LWVuY29kZWQgc3RyaW5ncyBhcmUgYCArXG4gICAgICAgICAgICBgbm90IHN1cHBvcnRlZCBieSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIFVzZSBhIHJlZ3VsYXIgXFxgc3JjXFxgIGAgK1xuICAgICAgICAgICAgYGF0dHJpYnV0ZSAoaW5zdGVhZCBvZiBcXGByYXdTcmNcXGApIHRvIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgYCArXG4gICAgICAgICAgICBgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgbm90IGEgQmxvYiBVUkwuXG5mdW5jdGlvbiBhc3NlcnROb3RCbG9iVVJMKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBjb25zdCByYXdTcmMgPSBkaXIucmF3U3JjLnRyaW0oKTtcbiAgaWYgKHJhd1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGByYXdTcmNcXGAgd2FzIHNldCBgICtcbiAgICAgICAgICAgIGB0byBhIGJsb2IgVVJMICgke3Jhd1NyY30pLiBCbG9iIFVSTHMgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGAgK1xuICAgICAgICAgICAgYE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBVc2UgYSByZWd1bGFyIFxcYHNyY1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgKGluc3RlYWQgb2YgXFxgcmF3U3JjXFxgKSB0byBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBgICtcbiAgICAgICAgICAgIGBmb3IgdGhpcyBlbGVtZW50LmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIHNldCB0byBhIG5vbi1lbXB0eSBzdHJpbmcuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZFJhd1NyYyh2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICBpZiAoIWlzU3RyaW5nIHx8IGlzRW1wdHlTdHJpbmcpIHtcbiAgICBjb25zdCBleHRyYU1lc3NhZ2UgPSBpc0VtcHR5U3RyaW5nID8gJyAoZW1wdHkgc3RyaW5nKScgOiAnJztcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZTogYCArXG4gICAgICAgICAgICBgZXhwZWN0aW5nIGEgbm9uLWVtcHR5IHN0cmluZywgYnV0IGdvdDogXFxgJHt2YWx1ZX1cXGAke2V4dHJhTWVzc2FnZX0uYCk7XG4gIH1cbn1cblxuLy8gQ3JlYXRlcyBhIGBSdW50aW1lRXJyb3JgIGluc3RhbmNlIHRvIHJlcHJlc2VudCBhIHNpdHVhdGlvbiB3aGVuIGFuIGlucHV0IGlzIHNldCBhZnRlclxuLy8gdGhlIGRpcmVjdGl2ZSBoYXMgaW5pdGlhbGl6ZWQuXG5mdW5jdGlvbiBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dE5hbWU6IHN0cmluZyk6IHt9IHtcbiAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfSU5QVVRfQ0hBTkdFLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgJHtpbnB1dE5hbWV9XFxgIGlzIHVwZGF0ZWQgYWZ0ZXIgdGhlIGAgK1xuICAgICAgICAgIGBpbml0aWFsaXphdGlvbi4gVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgbm90IHJlYWN0IHRvIHRoaXMgaW5wdXQgY2hhbmdlLmApO1xufVxuXG4vLyBWZXJpZnkgdGhhdCBub25lIG9mIHRoZSBsaXN0ZWQgaW5wdXRzIGhhcyBjaGFuZ2VkLlxuZnVuY3Rpb24gYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgY2hhbmdlczogU2ltcGxlQ2hhbmdlcywgaW5wdXRzOiBzdHJpbmdbXSkge1xuICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgY29uc3QgaXNVcGRhdGVkID0gY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eShpbnB1dCk7XG4gICAgaWYgKGlzVXBkYXRlZCAmJiAhY2hhbmdlc1tpbnB1dF0uaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICBpZiAoaW5wdXQgPT09ICdyYXdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGByYXdTcmNgIGlucHV0IGNoYW5nZXMsIHdlIGRldGVjdCB0aGF0IG9ubHkgaW4gdGhlXG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlc2AgaG9vaywgdGh1cyB0aGUgYHJhd1NyY2AgaXMgYWxyZWFkeSBzZXQuIFdlIHVzZVxuICAgICAgICAvLyBgcmF3U3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7cmF3U3JjOiBjaGFuZ2VzW2lucHV0XS5wcmV2aW91c1ZhbHVlfSBhcyBOZ09wdGltaXplZEltYWdlO1xuICAgICAgfVxuICAgICAgdGhyb3cgcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpciwgaW5wdXQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaGFzIGEgY29ycmVjdCB0eXBlIChudW1iZXIpLlxuZnVuY3Rpb24gYXNzZXJ0VmFsaWROdW1iZXJJbnB1dChpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBjb25zdCBpc1ZhbGlkID0gdHlwZW9mIGlucHV0VmFsdWUgPT09ICdudW1iZXInIHx8XG4gICAgICAodHlwZW9mIGlucHV0VmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoaW5wdXRWYWx1ZS50cmltKCkpKTtcbiAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgaGFzIGFuIGludmFsaWQgYCArXG4gICAgICAgICAgICBgdmFsdWU6IGV4cGVjdGluZyBhIG51bWJlciB0aGF0IHJlcHJlc2VudHMgdGhlICR7aW5wdXROYW1lfSBpbiBwaXhlbHMsIGJ1dCBnb3Q6IGAgK1xuICAgICAgICAgICAgYFxcYCR7aW5wdXRWYWx1ZX1cXGAuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG5mdW5jdGlvbiBhc3NlcnRSZXF1aXJlZE51bWJlcklucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUkVRVUlSRURfSU5QVVRfTUlTU0lORyxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgcmVxdWlyZWQgXFxgJHtpbnB1dE5hbWV9XFxgIGAgK1xuICAgICAgICAgICAgYGF0dHJpYnV0ZSBpcyBtaXNzaW5nLiBQbGVhc2Ugc3BlY2lmeSB0aGUgXFxgJHtpbnB1dE5hbWV9XFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGBvbiB0aGUgbWVudGlvbmVkIGVsZW1lbnQuYCk7XG4gIH1cbn1cblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBDb3BpZWQgZnJvbSAvY29yZS9zcmMvZXJyb3JzLnRzYCBzaW5jZSB0aGUgZnVuY3Rpb24gaXMgbm90IGV4cG9zZWQgaW5cbi8vIEFuZ3VsYXIgdjEyLCB2MTMuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuZXhwb3J0IGNvbnN0IEVSUk9SX0RFVEFJTFNfUEFHRV9CQVNFX1VSTCA9ICdodHRwczovL2FuZ3VsYXIuaW8vZXJyb3JzJztcblxuZnVuY3Rpb24gZm9ybWF0UnVudGltZUVycm9yPFQgZXh0ZW5kcyBudW1iZXIgPSBSdW50aW1lRXJyb3JDb2RlPihcbiAgICBjb2RlOiBULCBtZXNzYWdlOiBudWxsfGZhbHNlfHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVycm9yIGNvZGUgbWlnaHQgYmUgYSBuZWdhdGl2ZSBudW1iZXIsIHdoaWNoIGlzIGEgc3BlY2lhbCBtYXJrZXIgdGhhdCBpbnN0cnVjdHMgdGhlIGxvZ2ljIHRvXG4gIC8vIGdlbmVyYXRlIGEgbGluayB0byB0aGUgZXJyb3IgZGV0YWlscyBwYWdlIG9uIGFuZ3VsYXIuaW8uXG4gIGNvbnN0IGZ1bGxDb2RlID0gYE5HMCR7TWF0aC5hYnMoY29kZSl9YDtcblxuICBsZXQgZXJyb3JNZXNzYWdlID0gYCR7ZnVsbENvZGV9JHttZXNzYWdlID8gJzogJyArIG1lc3NhZ2UgOiAnJ31gO1xuXG4gIGlmIChuZ0Rldk1vZGUgJiYgY29kZSA8IDApIHtcbiAgICBlcnJvck1lc3NhZ2UgPSBgJHtlcnJvck1lc3NhZ2V9LiBGaW5kIG1vcmUgYXQgJHtFUlJPUl9ERVRBSUxTX1BBR0VfQkFTRV9VUkx9LyR7ZnVsbENvZGV9YDtcbiAgfVxuICByZXR1cm4gZXJyb3JNZXNzYWdlO1xufVxuIl19