/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injectable, InjectionToken, Injector, Input, NgModule, NgZone, Renderer2, ɵRuntimeError as RuntimeError } from '@angular/core';
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
    constructor() {
        // Map of full image URLs -> original `rawSrc` values.
        this.images = new Map();
        // Keep track of images for which `console.warn` was produced.
        this.alreadyWarned = new Set();
        // Whether there was an attempt to init `PerformanceObserver` already.
        this.initialized = false;
        this.window = null;
        this.observer = null;
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
    registerImage(rewrittenSrc, rawSrc, doc) {
        if (!this.initialized) {
            this.initialized = true;
            const win = doc.defaultView;
            if (typeof win !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
                this.window = win;
                this.observer = this.initPerformanceObserver();
            }
        }
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
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: LCPImageObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });
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
                withLCPImageObserver(this.injector, (observer) => observer.registerImage(this.getRewrittenSrc(), this.rawSrc, this.imgElement.nativeElement.ownerDocument));
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", type: NgOptimizedImage, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", width: "width", height: "height", priority: "priority", src: "src" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
NgOptimizedImageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: NgOptimizedImageModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+23.sha-872282c", ngImport: i0, type: NgOptimizedImageModule, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWdDLFNBQVMsRUFBaUIsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFtQmxOOzs7R0FHRztBQUNILE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBeUIsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUVsRTs7Ozs7O0dBTUc7QUFDSCxNQUFNLDhCQUE4QixHQUFHLEVBQUUsQ0FBQztBQUUxQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQWMsYUFBYSxFQUFFO0lBQ3pFLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxlQUFlO0NBQy9CLENBQUMsQ0FBQztBQUVIOzs7Ozs7Ozs7R0FTRztBQUNILE1BR00sZ0JBQWdCO0lBSHRCO1FBSUUsc0RBQXNEO1FBQzlDLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUMzQyw4REFBOEQ7UUFDdEQsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQzFDLHNFQUFzRTtRQUM5RCxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUVwQixXQUFNLEdBQWdCLElBQUksQ0FBQztRQUMzQixhQUFRLEdBQTZCLElBQUksQ0FBQztLQStEbkQ7SUE3REMsNkNBQTZDO0lBQ3JDLFVBQVUsQ0FBQyxHQUFXO1FBQzVCLE9BQU8sSUFBSSxH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QjtJQUNyQywrRkFBK0Y7SUFDL0YsMkRBQTJEO0lBQzNELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBRXhDLElBQUksWUFBWSxHQUFHLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7SUFFakUsSUFBSSxTQUFTLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtRQUN6QixZQUFZLEdBQUcsR0FBRyxZQUFZLGtCQUFrQiwyQkFBMkIsSUFBSSxRQUFRLEVBQUUsQ0FBQztLQUMzRjtJQUNELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGUsIE5nWm9uZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyLCBTaW1wbGVDaGFuZ2VzLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5cbi8qKlxuICogQ29uZmlnIG9wdGlvbnMgcmVjb2duaXplZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlTG9hZGVyQ29uZmlnIHtcbiAgLy8gTmFtZSBvZiB0aGUgaW1hZ2UgdG8gYmUgYWRkZWQgdG8gdGhlIGltYWdlIHJlcXVlc3QgVVJMXG4gIHNyYzogc3RyaW5nO1xuICAvLyBXaWR0aCBvZiB0aGUgcmVxdWVzdGVkIGltYWdlICh0byBiZSB1c2VkIHdoZW4gZ2VuZXJhdGluZyBzcmNzZXQpXG4gIHdpZHRoPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgdHlwZSBJbWFnZUxvYWRlciA9IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiBzdHJpbmc7XG5cbi8qKlxuICogTm9vcCBpbWFnZSBsb2FkZXIgdGhhdCBkb2VzIG5vIHRyYW5zZm9ybWF0aW9uIHRvIHRoZSBvcmlnaW5hbCBzcmMgYW5kIGp1c3QgcmV0dXJucyBpdCBhcyBpcy5cbiAqIFRoaXMgbG9hZGVyIGlzIHVzZWQgYXMgYSBkZWZhdWx0IG9uZSBpZiBtb3JlIHNwZWNpZmljIGxvZ2ljIGlzIG5vdCBwcm92aWRlZCBpbiBhbiBhcHAgY29uZmlnLlxuICovXG5jb25zdCBub29wSW1hZ2VMb2FkZXIgPSAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4gY29uZmlnLnNyYztcblxuLyoqXG4gKiBXaGVuIGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UgaXMgcGFzc2VkIGFzIGFuIGlucHV0IHRvIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLFxuICogYW4gZXJyb3IgaXMgdGhyb3duLiBUaGUgaW1hZ2UgY29udGVudCAoYXMgYSBzdHJpbmcpIG1pZ2h0IGJlIHZlcnkgbG9uZywgdGh1cyBtYWtpbmdcbiAqIGl0IGhhcmQgdG8gcmVhZCBhbiBlcnJvciBtZXNzYWdlIGlmIHRoZSBlbnRpcmUgc3RyaW5nIGlzIGluY2x1ZGVkLiBUaGlzIGNvbnN0IGRlZmluZXNcbiAqIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBlcnJvciBtZXNzYWdlLiBUaGUgcmVzdFxuICogb2YgdGhlIGNvbnRlbnQgaXMgdHJ1bmNhdGVkLlxuICovXG5jb25zdCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IgPSA1MDtcblxuLyoqXG4gKiBTcGVjaWFsIHRva2VuIHRoYXQgYWxsb3dzIHRvIGNvbmZpZ3VyZSBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHByb2R1Y2UgYW4gaW1hZ2UgVVJMIGJhc2VkXG4gKiBvbiB0aGUgc3BlY2lmaWVkIGlucHV0LlxuICovXG5leHBvcnQgY29uc3QgSU1BR0VfTE9BREVSID0gbmV3IEluamVjdGlvblRva2VuPEltYWdlTG9hZGVyPignSW1hZ2VMb2FkZXInLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gbm9vcEltYWdlTG9hZGVyLFxufSk7XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGxvZ2ljIHRvIGRldGVjdCB3aGV0aGVyIGFuIGltYWdlIHdpdGggdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmVcbiAqIGlzIHRyZWF0ZWQgYXMgYW4gTENQIGVsZW1lbnQuIElmIHNvLCB2ZXJpZmllcyB0aGF0IHRoZSBpbWFnZSBpcyBtYXJrZWQgYXMgYSBwcmlvcml0eSxcbiAqIHVzaW5nIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKlxuICogQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdC5cbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuY2xhc3MgTENQSW1hZ2VPYnNlcnZlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8vIE1hcCBvZiBmdWxsIGltYWdlIFVSTHMgLT4gb3JpZ2luYWwgYHJhd1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIGltYWdlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIC8vIEtlZXAgdHJhY2sgb2YgaW1hZ2VzIGZvciB3aGljaCBgY29uc29sZS53YXJuYCB3YXMgcHJvZHVjZWQuXG4gIHByaXZhdGUgYWxyZWFkeVdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAvLyBXaGV0aGVyIHRoZXJlIHdhcyBhbiBhdHRlbXB0IHRvIGluaXQgYFBlcmZvcm1hbmNlT2JzZXJ2ZXJgIGFscmVhZHkuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICBwcml2YXRlIHdpbmRvdzogV2luZG93fG51bGwgPSBudWxsO1xuICBwcml2YXRlIG9ic2VydmVyOiBQZXJmb3JtYW5jZU9ic2VydmVyfG51bGwgPSBudWxsO1xuXG4gIC8vIENvbnZlcnRzIHJlbGF0aXZlIGltYWdlIFVSTCB0byBhIGZ1bGwgVVJMLlxuICBwcml2YXRlIGdldEZ1bGxVcmwoc3JjOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFVSTChzcmMsIHRoaXMud2luZG93IS5sb2NhdGlvbi5ocmVmKS5ocmVmO1xuICB9XG5cbiAgLy8gSW5pdHMgUGVyZm9ybWFuY2VPYnNlcnZlciBhbmQgc3Vic2NyaWJlcyB0byBMQ1AgZXZlbnRzLlxuICAvLyBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0XG4gIHByaXZhdGUgaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTogUGVyZm9ybWFuY2VPYnNlcnZlciB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUGVyZm9ybWFuY2VPYnNlcnZlcigoZW50cnlMaXN0KSA9PiB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gZW50cnlMaXN0LmdldEVudHJpZXMoKTtcbiAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgLy8gTm90ZTogd2UgdXNlIHRoZSBsYXRlc3QgZW50cnkgcHJvZHVjZWQgYnkgdGhlIGBQZXJmb3JtYW5jZU9ic2VydmVyYCBhcyB0aGUgYmVzdFxuICAgICAgLy8gc2lnbmFsIG9uIHdoaWNoIGVsZW1lbnQgaXMgYWN0dWFsbHkgYW4gTENQIG9uZS4gQXMgYW4gZXhhbXBsZSwgdGhlIGZpcnN0IGltYWdlIHRvIGxvYWQgb25cbiAgICAgIC8vIGEgcGFnZSwgYnkgdmlydHVlIG9mIGJlaW5nIHRoZSBvbmx5IHRoaW5nIG9uIHRoZSBwYWdlIHNvIGZhciwgaXMgb2Z0ZW4gYSBMQ1AgY2FuZGlkYXRlXG4gICAgICAvLyBhbmQgZ2V0cyByZXBvcnRlZCBieSBQZXJmb3JtYW5jZU9ic2VydmVyLCBidXQgaXNuJ3QgbmVjZXNzYXJpbHkgdGhlIExDUCBlbGVtZW50LlxuICAgICAgY29uc3QgbGNwRWxlbWVudCA9IGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXTtcbiAgICAgIC8vIENhc3QgdG8gYGFueWAgZHVlIHRvIG1pc3NpbmcgYGVsZW1lbnRgIG9uIG9ic2VydmVkIHR5cGUgb2YgZW50cnkuXG4gICAgICBjb25zdCBpbWdTcmMgPSAobGNwRWxlbWVudCBhcyBhbnkpLmVsZW1lbnQ/LnNyYyA/PyAnJztcblxuICAgICAgLy8gRXhjbHVkZSBgZGF0YTpgIGFuZCBgYmxvYjpgIFVSTHMsIHNpbmNlIHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRpcmVjdGl2ZS5cbiAgICAgIGlmIChpbWdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSB8fCBpbWdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBpbWdSYXdTcmMgPSB0aGlzLmltYWdlcy5nZXQoaW1nU3JjKTtcbiAgICAgIGlmIChpbWdSYXdTcmMgJiYgIXRoaXMuYWxyZWFkeVdhcm5lZC5oYXMoaW1nU3JjKSkge1xuICAgICAgICB0aGlzLmFscmVhZHlXYXJuZWQuYWRkKGltZ1NyYyk7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZURldGFpbHMgPSBpbWdEaXJlY3RpdmVEZXRhaWxzKHtyYXdTcmM6IGltZ1Jhd1NyY30gYXMgYW55KTtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTENQX0lNR19NSVNTSU5HX1BSSU9SSVRZLFxuICAgICAgICAgICAgYCR7ZGlyZWN0aXZlRGV0YWlsc306IHRoZSBpbWFnZSB3YXMgZGV0ZWN0ZWQgYXMgdGhlIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBgICtcbiAgICAgICAgICAgICAgICBgZWxlbWVudCwgc28gaXRzIGxvYWRpbmcgc2hvdWxkIGJlIHByaW9yaXRpemVkIGZvciBvcHRpbWFsIHBlcmZvcm1hbmNlLiBQbGVhc2UgYCArXG4gICAgICAgICAgICAgICAgYGFkZCB0aGUgXCJwcmlvcml0eVwiIGF0dHJpYnV0ZSBpZiB0aGlzIGltYWdlIGlzIGFib3ZlIHRoZSBmb2xkLmApKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKHt0eXBlOiAnbGFyZ2VzdC1jb250ZW50ZnVsLXBhaW50JywgYnVmZmVyZWQ6IHRydWV9KTtcbiAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gIH1cblxuICByZWdpc3RlckltYWdlKHJld3JpdHRlblNyYzogc3RyaW5nLCByYXdTcmM6IHN0cmluZywgZG9jOiBEb2N1bWVudCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICBjb25zdCB3aW4gPSBkb2MuZGVmYXVsdFZpZXc7XG4gICAgICBpZiAodHlwZW9mIHdpbiAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gdGhpcy5pbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5zZXQodGhpcy5nZXRGdWxsVXJsKHJld3JpdHRlblNyYyksIHJhd1NyYyk7XG4gIH1cblxuICB1bnJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5kZWxldGUodGhpcy5nZXRGdWxsVXJsKHJld3JpdHRlblNyYykpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5pbWFnZXMuY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlXYXJuZWQuY2xlYXIoKTtcbiAgfVxufVxuXG4vKipcbiAqICoqIEVYUEVSSU1FTlRBTCAqKlxuICpcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgZGVzY3JpcHRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRPRE86IGFkZCBJbWFnZSBkaXJlY3RpdmUgdXNhZ2Ugbm90ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2ltZ1tyYXdTcmNdJyxcbn0pXG5leHBvcnQgY2xhc3MgTmdPcHRpbWl6ZWRJbWFnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoSU1BR0VfTE9BREVSKSBwcml2YXRlIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlciwgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgICAgcHJpdmF0ZSBpbWdFbGVtZW50OiBFbGVtZW50UmVmLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvLyBQcml2YXRlIGZpZWxkcyB0byBrZWVwIG5vcm1hbGl6ZWQgaW5wdXQgdmFsdWVzLlxuICBwcml2YXRlIF93aWR0aD86IG51bWJlcjtcbiAgcHJpdmF0ZSBfaGVpZ2h0PzogbnVtYmVyO1xuICBwcml2YXRlIF9wcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBzb3VyY2UgaW1hZ2UuXG4gICAqIEltYWdlIG5hbWUgd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhlIGltYWdlIGxvYWRlciBhbmQgdGhlIGZpbmFsIFVSTCB3aWxsIGJlIGFwcGxpZWQgYXMgdGhlIGBzcmNgXG4gICAqIHByb3BlcnR5IG9mIHRoZSBpbWFnZS5cbiAgICovXG4gIEBJbnB1dCgpIHJhd1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgd2lkdGgodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydFZhbGlkTnVtYmVySW5wdXQodmFsdWUsICd3aWR0aCcpO1xuICAgIHRoaXMuX3dpZHRoID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCB3aWR0aCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGhlaWdodCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VmFsaWROdW1iZXJJbnB1dCh2YWx1ZSwgJ2hlaWdodCcpO1xuICAgIHRoaXMuX2hlaWdodCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgaGVpZ2h0KCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpbWFnZSBzaG91bGQgaGF2ZSBhIGhpZ2ggcHJpb3JpdHkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgcHJpb3JpdHkodmFsdWU6IHN0cmluZ3xib29sZWFufHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3ByaW9yaXR5ID0gaW5wdXRUb0Jvb2xlYW4odmFsdWUpO1xuICB9XG4gIGdldCBwcmlvcml0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJpb3JpdHk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdmFsdWUgb2YgdGhlIGBzcmNgIGlmIGl0J3Mgc2V0IG9uIGEgaG9zdCA8aW1nPiBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIG5lZWRlZCB0byB2ZXJpZnkgdGhhdCB0aGVyZSBhcmUgbm8gYHNyY2AgYW5kIGByYXdTcmNgIHByb3ZpZGVkXG4gICAqIGF0IHRoZSBzYW1lIHRpbWUgKHRodXMgY2F1c2luZyBhbiBhbWJpZ3VpdHkgb24gd2hpY2ggc3JjIHRvIHVzZSkuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgQElucHV0KCkgc3JjPzogc3RyaW5nO1xuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydFZhbGlkUmF3U3JjKHRoaXMucmF3U3JjKTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBhc3NlcnROb3RCYXNlNjRJbWFnZSh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJsb2JVUkwodGhpcyk7XG4gICAgICBhc3NlcnRSZXF1aXJlZE51bWJlcklucHV0KHRoaXMsIHRoaXMud2lkdGgsICd3aWR0aCcpO1xuICAgICAgYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dCh0aGlzLCB0aGlzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgICAgaWYgKCF0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIC8vIE1vbml0b3Igd2hldGhlciBhbiBpbWFnZSBpcyBhbiBMQ1AgZWxlbWVudCBvbmx5IGluIGNhc2VcbiAgICAgICAgLy8gdGhlIGBwcmlvcml0eWAgYXR0cmlidXRlIGlzIG1pc3NpbmcuIE90aGVyd2lzZSwgYW4gaW1hZ2VcbiAgICAgICAgLy8gaGFzIHRoZSBuZWNlc3Nhcnkgc2V0dGluZ3MgYW5kIG5vIGV4dHJhIGNoZWNrcyBhcmUgcmVxdWlyZWQuXG4gICAgICAgIHdpdGhMQ1BJbWFnZU9ic2VydmVyKFxuICAgICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAgIChvYnNlcnZlcjogTENQSW1hZ2VPYnNlcnZlcikgPT4gb2JzZXJ2ZXIucmVnaXN0ZXJJbWFnZShcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLnJhd1NyYywgdGhpcy5pbWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQub3duZXJEb2N1bWVudCkpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG4gICAgLy8gVGhlIGBzcmNgIGF0dHJpYnV0ZSBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKHRoaXMsIGNoYW5nZXMsIFsncmF3U3JjJywgJ3dpZHRoJywgJ2hlaWdodCcsICdwcmlvcml0eSddKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2VhZ2VyJyA6ICdsYXp5JztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RmV0Y2hQcmlvcml0eSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2hpZ2gnIDogJ2F1dG8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmMoKTogc3RyaW5nIHtcbiAgICAvLyBJbWFnZUxvYWRlckNvbmZpZyBzdXBwb3J0cyBzZXR0aW5nIGEgd2lkdGggcHJvcGVydHkuIEhvd2V2ZXIsIHdlJ3JlIG5vdCBzZXR0aW5nIHdpZHRoIGhlcmVcbiAgICAvLyBiZWNhdXNlIGlmIHRoZSBkZXZlbG9wZXIgdXNlcyByZW5kZXJlZCB3aWR0aCBpbnN0ZWFkIG9mIGludHJpbnNpYyB3aWR0aCBpbiB0aGUgSFRNTCB3aWR0aFxuICAgIC8vIGF0dHJpYnV0ZSwgdGhlIGltYWdlIHJlcXVlc3RlZCBtYXkgYmUgdG9vIHNtYWxsIGZvciAyeCsgc2NyZWVucy5cbiAgICBjb25zdCBpbWdDb25maWcgPSB7c3JjOiB0aGlzLnJhd1NyY307XG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUgJiYgIXRoaXMucHJpb3JpdHkpIHtcbiAgICAgIC8vIEFuIGltYWdlIGlzIG9ubHkgcmVnaXN0ZXJlZCBpbiBkZXYgbW9kZSwgdHJ5IHRvIHVucmVnaXN0ZXIgb25seSBpbiBkZXYgbW9kZSBhcyB3ZWxsLlxuICAgICAgd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+IG9ic2VydmVyLnVucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuaW1nRWxlbWVudC5uYXRpdmVFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBOZ01vZHVsZSB0aGF0IGRlY2xhcmVzIGFuZCBleHBvcnRzIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICogVGhpcyBOZ01vZHVsZSBpcyBhIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIGFwcHMgdGhhdCB1c2UgcHJlLXYxNFxuICogdmVyc2lvbnMgb2YgQW5ndWxhciAoYmVmb3JlIHRoZSBgc3RhbmRhbG9uZWAgZmxhZyBiZWNhbWUgYXZhaWxhYmxlKS5cbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIHdpbGwgYmVjb21lIGEgc3RhbmRhbG9uZSBkaXJlY3RpdmUgaW4gdjE0IGFuZFxuICogdGhpcyBOZ01vZHVsZSB3aWxsIGJlIHJlbW92ZWQuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW05nT3B0aW1pemVkSW1hZ2VdLFxuICBleHBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2VNb2R1bGUge1xufVxuXG4vKioqKiogSGVscGVycyAqKioqKi9cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBpbnRlZ2VyLlxuZnVuY3Rpb24gaW5wdXRUb0ludGVnZXIodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gcGFyc2VJbnQodmFsdWUsIDEwKSA6IHZhbHVlO1xufVxuXG4vLyBDb252ZXJ0IGlucHV0IHZhbHVlIHRvIGJvb2xlYW4uXG5mdW5jdGlvbiBpbnB1dFRvQm9vbGVhbih2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBgJHt2YWx1ZX1gICE9PSAnZmFsc2UnO1xufVxuXG4vKipcbiAqIEludm9rZXMgYSBmdW5jdGlvbiwgcGFzc2luZyBhbiBpbnN0YW5jZSBvZiB0aGUgYExDUEltYWdlT2JzZXJ2ZXJgIGFzIGFuIGFyZ3VtZW50LlxuICpcbiAqIE5vdGVzOlxuICogLSB0aGUgYExDUEltYWdlT2JzZXJ2ZXJgIGlzIGEgdHJlZS1zaGFrYWJsZSBwcm92aWRlciwgcHJvdmlkZWQgaW4gJ3Jvb3QnLFxuICogICB0aHVzIGl0J3MgYSBzaW5nbGV0b24gd2l0aGluIHRoaXMgYXBwbGljYXRpb25cbiAqIC0gdGhlIHByb2Nlc3Mgb2YgYExDUEltYWdlT2JzZXJ2ZXJgIGNyZWF0aW9uIGFuZCBhbiBhY3R1YWwgb3BlcmF0aW9uIGFyZSBpbnZva2VkIG91dHNpZGUgb2YgdGhlXG4gKiAgIE5nWm9uZSB0byBtYWtlIHN1cmUgbm9uZSBvZiB0aGUgY2FsbHMgaW5zaWRlIHRoZSBgTENQSW1hZ2VPYnNlcnZlcmAgY2xhc3MgdHJpZ2dlciB1bm5lY2Vzc2FyeVxuICogICBjaGFuZ2UgZGV0ZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIHdpdGhMQ1BJbWFnZU9ic2VydmVyKFxuICAgIGluamVjdG9yOiBJbmplY3Rvciwgb3BlcmF0aW9uOiAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+IHZvaWQpOiB2b2lkIHtcbiAgY29uc3Qgbmdab25lID0gaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gIHJldHVybiBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgIGNvbnN0IG9ic2VydmVyID0gaW5qZWN0b3IuZ2V0KExDUEltYWdlT2JzZXJ2ZXIpO1xuICAgIG9wZXJhdGlvbihvYnNlcnZlcik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICByZXR1cm4gYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSAoYWN0aXZhdGVkIG9uIGFuIDxpbWc+IGVsZW1lbnQgYCArXG4gICAgICBgd2l0aCB0aGUgXFxgcmF3U3JjPVwiJHtkaXIucmF3U3JjfVwiXFxgKWA7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vLyBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbmZ1bmN0aW9uIGFzc2VydE5vQ29uZmxpY3RpbmdTcmMoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIuc3JjKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ19BVFRSLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcil9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGBzcmNcXGAgaXMgYWxzbyBzZXQgKHRvIGAgK1xuICAgICAgICAgICAgYFxcYCR7ZGlyLnNyY31cXGApLiBQbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNcXGAgYXR0cmlidXRlIGZyb20gdGhpcyBpbWFnZS4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHdpbGwgdXNlIHRoZSBcXGByYXdTcmNcXGAgdG8gY29tcHV0ZSBgICtcbiAgICAgICAgICAgIGB0aGUgZmluYWwgaW1hZ2UgVVJMIGFuZCBzZXQgdGhlIFxcYHNyY1xcYCBpdHNlbGYuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgbm90IGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UuXG5mdW5jdGlvbiBhc3NlcnROb3RCYXNlNjRJbWFnZShkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICBpZiAocmF3U3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgcmF3U3JjID0gcmF3U3JjLnN1YnN0cmluZygwLCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpICsgJy4uLic7XG4gICAgfVxuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIHdhcyBzZXQgYCArXG4gICAgICAgICAgICBgdG8gYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgKCR7cmF3U3JjfSkuIEJhc2U2NC1lbmNvZGVkIHN0cmluZ3MgYXJlIGAgK1xuICAgICAgICAgICAgYG5vdCBzdXBwb3J0ZWQgYnkgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlLiBVc2UgYSByZWd1bGFyIFxcYHNyY1xcYCBgICtcbiAgICAgICAgICAgIGBhdHRyaWJ1dGUgKGluc3RlYWQgb2YgXFxgcmF3U3JjXFxgKSB0byBkaXNhYmxlIHRoZSBOZ09wdGltaXplZEltYWdlIGAgK1xuICAgICAgICAgICAgYGRpcmVjdGl2ZSBmb3IgdGhpcyBlbGVtZW50LmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVSTChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgcmF3U3JjID0gZGlyLnJhd1NyYy50cmltKCk7XG4gIGlmIChyYXdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIHdhcyBzZXQgYCArXG4gICAgICAgICAgICBgdG8gYSBibG9iIFVSTCAoJHtyYXdTcmN9KS4gQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgICtcbiAgICAgICAgICAgIGBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gVXNlIGEgcmVndWxhciBcXGBzcmNcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYChpbnN0ZWFkIG9mIFxcYHJhd1NyY1xcYCkgdG8gZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgYCArXG4gICAgICAgICAgICBgZm9yIHRoaXMgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuZnVuY3Rpb24gYXNzZXJ0VmFsaWRSYXdTcmModmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuICBjb25zdCBpc0VtcHR5U3RyaW5nID0gaXNTdHJpbmcgJiYgdmFsdWUudHJpbSgpID09PSAnJztcbiAgaWYgKCFpc1N0cmluZyB8fCBpc0VtcHR5U3RyaW5nKSB7XG4gICAgY29uc3QgZXh0cmFNZXNzYWdlID0gaXNFbXB0eVN0cmluZyA/ICcgKGVtcHR5IHN0cmluZyknIDogJyc7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGByYXdTcmNcXGAgaGFzIGFuIGludmFsaWQgdmFsdWU6IGAgK1xuICAgICAgICAgICAgYGV4cGVjdGluZyBhIG5vbi1lbXB0eSBzdHJpbmcsIGJ1dCBnb3Q6IFxcYCR7dmFsdWV9XFxgJHtleHRyYU1lc3NhZ2V9LmApO1xuICB9XG59XG5cbi8vIENyZWF0ZXMgYSBgUnVudGltZUVycm9yYCBpbnN0YW5jZSB0byByZXByZXNlbnQgYSBzaXR1YXRpb24gd2hlbiBhbiBpbnB1dCBpcyBzZXQgYWZ0ZXJcbi8vIHRoZSBkaXJlY3RpdmUgaGFzIGluaXRpYWxpemVkLlxuZnVuY3Rpb24gcG9zdEluaXRJbnB1dENoYW5nZUVycm9yKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW5wdXROYW1lOiBzdHJpbmcpOiB7fSB7XG4gIHJldHVybiBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX0lOUFVUX0NIQU5HRSxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCBpcyB1cGRhdGVkIGFmdGVyIHRoZSBgICtcbiAgICAgICAgICBgaW5pdGlhbGl6YXRpb24uIFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS5gKTtcbn1cblxuLy8gVmVyaWZ5IHRoYXQgbm9uZSBvZiB0aGUgbGlzdGVkIGlucHV0cyBoYXMgY2hhbmdlZC5cbmZ1bmN0aW9uIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMsIGlucHV0czogc3RyaW5nW10pIHtcbiAgaW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgIGNvbnN0IGlzVXBkYXRlZCA9IGNoYW5nZXMuaGFzT3duUHJvcGVydHkoaW5wdXQpO1xuICAgIGlmIChpc1VwZGF0ZWQgJiYgIWNoYW5nZXNbaW5wdXRdLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgaWYgKGlucHV0ID09PSAncmF3U3JjJykge1xuICAgICAgICAvLyBXaGVuIHRoZSBgcmF3U3JjYCBpbnB1dCBjaGFuZ2VzLCB3ZSBkZXRlY3QgdGhhdCBvbmx5IGluIHRoZVxuICAgICAgICAvLyBgbmdPbkNoYW5nZXNgIGhvb2ssIHRodXMgdGhlIGByYXdTcmNgIGlzIGFscmVhZHkgc2V0LiBXZSB1c2VcbiAgICAgICAgLy8gYHJhd1NyY2AgaW4gdGhlIGVycm9yIG1lc3NhZ2UsIHNvIHdlIHVzZSBhIHByZXZpb3VzIHZhbHVlLCBidXRcbiAgICAgICAgLy8gbm90IHRoZSB1cGRhdGVkIG9uZSBpbiBpdC5cbiAgICAgICAgZGlyID0ge3Jhd1NyYzogY2hhbmdlc1tpbnB1dF0ucHJldmlvdXNWYWx1ZX0gYXMgTmdPcHRpbWl6ZWRJbWFnZTtcbiAgICAgIH1cbiAgICAgIHRocm93IHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXIsIGlucHV0KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGhhcyBhIGNvcnJlY3QgdHlwZSAobnVtYmVyKS5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTnVtYmVySW5wdXQoaW5wdXRWYWx1ZTogdW5rbm93biwgaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgaXNWYWxpZCA9IHR5cGVvZiBpbnB1dFZhbHVlID09PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSk7XG4gIGlmICghaXNWYWxpZCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIGAgK1xuICAgICAgICAgICAgYHZhbHVlOiBleHBlY3RpbmcgYSBudW1iZXIgdGhhdCByZXByZXNlbnRzIHRoZSAke2lucHV0TmFtZX0gaW4gcGl4ZWxzLCBidXQgZ290OiBgICtcbiAgICAgICAgICAgIGBcXGAke2lucHV0VmFsdWV9XFxgLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgYSBzcGVjaWZpZWQgaW5wdXQgaXMgc2V0LlxuZnVuY3Rpb24gYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJFUVVJUkVEX0lOUFVUX01JU1NJTkcsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyKX0gaGFzIGRldGVjdGVkIHRoYXQgdGhlIHJlcXVpcmVkIFxcYCR7aW5wdXROYW1lfVxcYCBgICtcbiAgICAgICAgICAgIGBhdHRyaWJ1dGUgaXMgbWlzc2luZy4gUGxlYXNlIHNwZWNpZnkgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgb24gdGhlIG1lbnRpb25lZCBlbGVtZW50LmApO1xuICB9XG59XG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuLy8gQ29waWVkIGZyb20gL2NvcmUvc3JjL2Vycm9ycy50c2Agc2luY2UgdGhlIGZ1bmN0aW9uIGlzIG5vdCBleHBvc2VkIGluXG4vLyBBbmd1bGFyIHYxMiwgdjEzLlxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmV4cG9ydCBjb25zdCBFUlJPUl9ERVRBSUxTX1BBR0VfQkFTRV9VUkwgPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2Vycm9ycyc7XG5cbmZ1bmN0aW9uIGZvcm1hdFJ1bnRpbWVFcnJvcjxUIGV4dGVuZHMgbnVtYmVyID0gUnVudGltZUVycm9yQ29kZT4oXG4gICAgY29kZTogVCwgbWVzc2FnZTogbnVsbHxmYWxzZXxzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBFcnJvciBjb2RlIG1pZ2h0IGJlIGEgbmVnYXRpdmUgbnVtYmVyLCB3aGljaCBpcyBhIHNwZWNpYWwgbWFya2VyIHRoYXQgaW5zdHJ1Y3RzIHRoZSBsb2dpYyB0b1xuICAvLyBnZW5lcmF0ZSBhIGxpbmsgdG8gdGhlIGVycm9yIGRldGFpbHMgcGFnZSBvbiBhbmd1bGFyLmlvLlxuICBjb25zdCBmdWxsQ29kZSA9IGBORzAke01hdGguYWJzKGNvZGUpfWA7XG5cbiAgbGV0IGVycm9yTWVzc2FnZSA9IGAke2Z1bGxDb2RlfSR7bWVzc2FnZSA/ICc6ICcgKyBtZXNzYWdlIDogJyd9YDtcblxuICBpZiAobmdEZXZNb2RlICYmIGNvZGUgPCAwKSB7XG4gICAgZXJyb3JNZXNzYWdlID0gYCR7ZXJyb3JNZXNzYWdlfS4gRmluZCBtb3JlIGF0ICR7RVJST1JfREVUQUlMU19QQUdFX0JBU0VfVVJMfS8ke2Z1bGxDb2RlfWA7XG4gIH1cbiAgcmV0dXJuIGVycm9yTWVzc2FnZTtcbn1cbiJdfQ==