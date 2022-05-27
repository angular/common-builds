/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
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
    constructor(injector) {
        // Map of full image URLs -> original `rawSrc` values.
        this.images = new Map();
        // Keep track of images for which `console.warn` was produced.
        this.alreadyWarned = new Set();
        this.window = null;
        this.observer = null;
        const doc = injector.get(DOCUMENT);
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
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: LCPImageObserver, deps: [{ token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i0.Injector }]; } });
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", type: NgOptimizedImage, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", width: "width", height: "height", priority: "priority", src: "src" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: NgOptimizedImage, decorators: [{
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
NgOptimizedImageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: NgOptimizedImageModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9+22.sha-6dbb148", ngImport: i0, type: NgOptimizedImageModule, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFnQyxTQUFTLEVBQWlCLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBbUJsTjs7O0dBR0c7QUFDSCxNQUFNLGVBQWUsR0FBRyxDQUFDLE1BQXlCLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFFbEU7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFjLGFBQWEsRUFBRTtJQUN6RSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZTtDQUMvQixDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUdNLGdCQUFnQjtJQVNwQixZQUFZLFFBQWtCO1FBUjlCLHNEQUFzRDtRQUM5QyxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDM0MsOERBQThEO1FBQ3RELGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVsQyxXQUFNLEdBQWdCLElBQUksQ0FBQztRQUMzQixhQUFRLEdBQTZCLElBQUksQ0FBQztRQUdoRCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFFB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QUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFFeEMsSUFBSSxZQUFZLEdBQUcsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUVqRSxJQUFJLFNBQVMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO1FBQ3pCLFlBQVksR0FBRyxHQUFHLFlBQVksa0JBQWtCLDJCQUEyQixJQUFJLFFBQVEsRUFBRSxDQUFDO0tBQzNGO0lBQ0QsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGUsIE5nWm9uZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyLCBTaW1wbGVDaGFuZ2VzLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5cbi8qKlxuICogQ29uZmlnIG9wdGlvbnMgcmVjb2duaXplZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlTG9hZGVyQ29uZmlnIHtcbiAgLy8gTmFtZSBvZiB0aGUgaW1hZ2UgdG8gYmUgYWRkZWQgdG8gdGhlIGltYWdlIHJlcXVlc3QgVVJMXG4gIHNyYzogc3RyaW5nO1xuICAvLyBXaWR0aCBvZiB0aGUgcmVxdWVzdGVkIGltYWdlICh0byBiZSB1c2VkIHdoZW4gZ2VuZXJhdGluZyBzcmNzZXQpXG4gIHdpZHRoPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgdHlwZSBJbWFnZUxvYWRlciA9IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiBzdHJpbmc7XG5cbi8qKlxuICogTm9vcCBpbWFnZSBsb2FkZXIgdGhhdCBkb2VzIG5vIHRyYW5zZm9ybWF0aW9uIHRvIHRoZSBvcmlnaW5hbCBzcmMgYW5kIGp1c3QgcmV0dXJucyBpdCBhcyBpcy5cbiAqIFRoaXMgbG9hZGVyIGlzIHVzZWQgYXMgYSBkZWZhdWx0IG9uZSBpZiBtb3JlIHNwZWNpZmljIGxvZ2ljIGlzIG5vdCBwcm92aWRlZCBpbiBhbiBhcHAgY29uZmlnLlxuICovXG5jb25zdCBub29wSW1hZ2VMb2FkZXIgPSAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4gY29uZmlnLnNyYztcblxuLyoqXG4gKiBXaGVuIGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UgaXMgcGFzc2VkIGFzIGFuIGlucHV0IHRvIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLFxuICogYW4gZXJyb3IgaXMgdGhyb3duLiBUaGUgaW1hZ2UgY29udGVudCAoYXMgYSBzdHJpbmcpIG1pZ2h0IGJlIHZlcnkgbG9uZywgdGh1cyBtYWtpbmdcbiAqIGl0IGhhcmQgdG8gcmVhZCBhbiBlcnJvciBtZXNzYWdlIGlmIHRoZSBlbnRpcmUgc3RyaW5nIGlzIGluY2x1ZGVkLiBUaGlzIGNvbnN0IGRlZmluZXNcbiAqIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBlcnJvciBtZXNzYWdlLiBUaGUgcmVzdFxuICogb2YgdGhlIGNvbnRlbnQgaXMgdHJ1bmNhdGVkLlxuICovXG5jb25zdCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IgPSA1MDtcblxuLyoqXG4gKiBTcGVjaWFsIHRva2VuIHRoYXQgYWxsb3dzIHRvIGNvbmZpZ3VyZSBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHByb2R1Y2UgYW4gaW1hZ2UgVVJMIGJhc2VkXG4gKiBvbiB0aGUgc3BlY2lmaWVkIGlucHV0LlxuICovXG5leHBvcnQgY29uc3QgSU1BR0VfTE9BREVSID0gbmV3IEluamVjdGlvblRva2VuPEltYWdlTG9hZGVyPignSW1hZ2VMb2FkZXInLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gbm9vcEltYWdlTG9hZGVyLFxufSk7XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGxvZ2ljIHRvIGRldGVjdCB3aGV0aGVyIGFuIGltYWdlIHdpdGggdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmVcbiAqIGlzIHRyZWF0ZWQgYXMgYW4gTENQIGVsZW1lbnQuIElmIHNvLCB2ZXJpZmllcyB0aGF0IHRoZSBpbWFnZSBpcyBtYXJrZWQgYXMgYSBwcmlvcml0eSxcbiAqIHVzaW5nIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKlxuICogQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdC5cbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuY2xhc3MgTENQSW1hZ2VPYnNlcnZlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8vIE1hcCBvZiBmdWxsIGltYWdlIFVSTHMgLT4gb3JpZ2luYWwgYHJhd1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIGltYWdlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIC8vIEtlZXAgdHJhY2sgb2YgaW1hZ2VzIGZvciB3aGljaCBgY29uc29sZS53YXJuYCB3YXMgcHJvZHVjZWQuXG4gIHByaXZhdGUgYWxyZWFkeVdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgd2luZG93OiBXaW5kb3d8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgb2JzZXJ2ZXI6IFBlcmZvcm1hbmNlT2JzZXJ2ZXJ8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgY29uc3QgZG9jID0gaW5qZWN0b3IuZ2V0KERPQ1VNRU5UKTtcbiAgICBjb25zdCB3aW4gPSBkb2MuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBQZXJmb3JtYW5jZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy53aW5kb3cgPSB3aW47XG4gICAgICB0aGlzLm9ic2VydmVyID0gdGhpcy5pbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENvbnZlcnRzIHJlbGF0aXZlIGltYWdlIFVSTCB0byBhIGZ1bGwgVVJMLlxuICBwcml2YXRlIGdldEZ1bGxVcmwoc3JjOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFVSTChzcmMsIHRoaXMud2luZG93IS5sb2NhdGlvbi5ocmVmKS5ocmVmO1xuICB9XG5cbiAgLy8gSW5pdHMgUGVyZm9ybWFuY2VPYnNlcnZlciBhbmQgc3Vic2NyaWJlcyB0byBMQ1AgZXZlbnRzLlxuICAvLyBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0XG4gIHByaXZhdGUgaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTogUGVyZm9ybWFuY2VPYnNlcnZlciB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUGVyZm9ybWFuY2VPYnNlcnZlcigoZW50cnlMaXN0KSA9PiB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gZW50cnlMaXN0LmdldEVudHJpZXMoKTtcbiAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgLy8gTm90ZTogd2UgdXNlIHRoZSBsYXRlc3QgZW50cnkgcHJvZHVjZWQgYnkgdGhlIGBQZXJmb3JtYW5jZU9ic2VydmVyYCBhcyB0aGUgYmVzdFxuICAgICAgLy8gc2lnbmFsIG9uIHdoaWNoIGVsZW1lbnQgaXMgYWN0dWFsbHkgYW4gTENQIG9uZS4gQXMgYW4gZXhhbXBsZSwgdGhlIGZpcnN0IGltYWdlIHRvIGxvYWQgb25cbiAgICAgIC8vIGEgcGFnZSwgYnkgdmlydHVlIG9mIGJlaW5nIHRoZSBvbmx5IHRoaW5nIG9uIHRoZSBwYWdlIHNvIGZhciwgaXMgb2Z0ZW4gYSBMQ1AgY2FuZGlkYXRlXG4gICAgICAvLyBhbmQgZ2V0cyByZXBvcnRlZCBieSBQZXJmb3JtYW5jZU9ic2VydmVyLCBidXQgaXNuJ3QgbmVjZXNzYXJpbHkgdGhlIExDUCBlbGVtZW50LlxuICAgICAgY29uc3QgbGNwRWxlbWVudCA9IGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXTtcbiAgICAgIC8vIENhc3QgdG8gYGFueWAgZHVlIHRvIG1pc3NpbmcgYGVsZW1lbnRgIG9uIG9ic2VydmVkIHR5cGUgb2YgZW50cnkuXG4gICAgICBjb25zdCBpbWdTcmMgPSAobGNwRWxlbWVudCBhcyBhbnkpLmVsZW1lbnQ/LnNyYyA/PyAnJztcblxuICAgICAgLy8gRXhjbHVkZSBgZGF0YTpgIGFuZCBgYmxvYjpgIFVSTHMsIHNpbmNlIHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRpcmVjdGl2ZS5cbiAgICAgIGlmIChpbWdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSB8fCBpbWdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBpbWdSYXdTcmMgPSB0aGlzLmltYWdlcy5nZXQoaW1nU3JjKTtcbiAgICAgIGlmIChpbWdSYXdTcmMgJiYgIXRoaXMuYWxyZWFkeVdhcm5lZC5oYXMoaW1nU3JjKSkge1xuICAgICAgICB0aGlzLmFscmVhZHlXYXJuZWQuYWRkKGltZ1NyYyk7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZURldGFpbHMgPSBpbWdEaXJlY3RpdmVEZXRhaWxzKHtyYXdTcmM6IGltZ1Jhd1NyY30gYXMgYW55KTtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTENQX0lNR19NSVNTSU5HX1BSSU9SSVRZLFxuICAgICAgICAgICAgYCR7ZGlyZWN0aXZlRGV0YWlsc306IHRoZSBpbWFnZSB3YXMgZGV0ZWN0ZWQgYXMgdGhlIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBgICtcbiAgICAgICAgICAgICAgICBgZWxlbWVudCwgc28gaXRzIGxvYWRpbmcgc2hvdWxkIGJlIHByaW9yaXRpemVkIGZvciBvcHRpbWFsIHBlcmZvcm1hbmNlLiBQbGVhc2UgYCArXG4gICAgICAgICAgICAgICAgYGFkZCB0aGUgXCJwcmlvcml0eVwiIGF0dHJpYnV0ZSBpZiB0aGlzIGltYWdlIGlzIGFib3ZlIHRoZSBmb2xkLmApKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKHt0eXBlOiAnbGFyZ2VzdC1jb250ZW50ZnVsLXBhaW50JywgYnVmZmVyZWQ6IHRydWV9KTtcbiAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gIH1cblxuICByZWdpc3RlckltYWdlKHJld3JpdHRlblNyYzogc3RyaW5nLCByYXdTcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLnNldCh0aGlzLmdldEZ1bGxVcmwocmV3cml0dGVuU3JjKSwgcmF3U3JjKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLmRlbGV0ZSh0aGlzLmdldEZ1bGxVcmwocmV3cml0dGVuU3JjKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLmltYWdlcy5jbGVhcigpO1xuICAgIHRoaXMuYWxyZWFkeVdhcm5lZC5jbGVhcigpO1xuICB9XG59XG5cbi8qKlxuICogKiogRVhQRVJJTUVOVEFMICoqXG4gKlxuICogVE9ETzogYWRkIEltYWdlIGRpcmVjdGl2ZSBkZXNjcmlwdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVE9ETzogYWRkIEltYWdlIGRpcmVjdGl2ZSB1c2FnZSBub3Rlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW1nW3Jhd1NyY10nLFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEluamVjdChJTUFHRV9MT0FERVIpIHByaXZhdGUgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyLCBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgICBwcml2YXRlIGltZ0VsZW1lbnQ6IEVsZW1lbnRSZWYsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIC8vIFByaXZhdGUgZmllbGRzIHRvIGtlZXAgbm9ybWFsaXplZCBpbnB1dCB2YWx1ZXMuXG4gIHByaXZhdGUgX3dpZHRoPzogbnVtYmVyO1xuICBwcml2YXRlIF9oZWlnaHQ/OiBudW1iZXI7XG4gIHByaXZhdGUgX3ByaW9yaXR5ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIHNvdXJjZSBpbWFnZS5cbiAgICogSW1hZ2UgbmFtZSB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGFuZCB0aGUgZmluYWwgVVJMIHdpbGwgYmUgYXBwbGllZCBhcyB0aGUgYHNyY2BcbiAgICogcHJvcGVydHkgb2YgdGhlIGltYWdlLlxuICAgKi9cbiAgQElucHV0KCkgcmF3U3JjITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgaW50cmluc2ljIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCB3aWR0aCh2YWx1ZTogc3RyaW5nfG51bWJlcnx1bmRlZmluZWQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VmFsaWROdW1iZXJJbnB1dCh2YWx1ZSwgJ3dpZHRoJyk7XG4gICAgdGhpcy5fd2lkdGggPSBpbnB1dFRvSW50ZWdlcih2YWx1ZSk7XG4gIH1cbiAgZ2V0IHdpZHRoKCk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW50cmluc2ljIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgaGVpZ2h0KHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRWYWxpZE51bWJlcklucHV0KHZhbHVlLCAnaGVpZ2h0Jyk7XG4gICAgdGhpcy5faGVpZ2h0ID0gaW5wdXRUb0ludGVnZXIodmFsdWUpO1xuICB9XG4gIGdldCBoZWlnaHQoKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBwcmlvcml0eSh2YWx1ZTogc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fcHJpb3JpdHkgPSBpbnB1dFRvQm9vbGVhbih2YWx1ZSk7XG4gIH1cbiAgZ2V0IHByaW9yaXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcmlvcml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB2YWx1ZSBvZiB0aGUgYHNyY2AgaWYgaXQncyBzZXQgb24gYSBob3N0IDxpbWc+IGVsZW1lbnQuXG4gICAqIFRoaXMgaW5wdXQgaXMgbmVlZGVkIHRvIHZlcmlmeSB0aGF0IHRoZXJlIGFyZSBubyBgc3JjYCBhbmQgYHJhd1NyY2AgcHJvdmlkZWRcbiAgICogYXQgdGhlIHNhbWUgdGltZSAodGh1cyBjYXVzaW5nIGFuIGFtYmlndWl0eSBvbiB3aGljaCBzcmMgdG8gdXNlKS5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBASW5wdXQoKSBzcmM/OiBzdHJpbmc7XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0VmFsaWRSYXdTcmModGhpcy5yYXdTcmMpO1xuICAgICAgYXNzZXJ0Tm9Db25mbGljdGluZ1NyYyh0aGlzKTtcbiAgICAgIGFzc2VydE5vdEJhc2U2NEltYWdlKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmxvYlVSTCh0aGlzKTtcbiAgICAgIGFzc2VydFJlcXVpcmVkTnVtYmVySW5wdXQodGhpcywgdGhpcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgICBhc3NlcnRSZXF1aXJlZE51bWJlcklucHV0KHRoaXMsIHRoaXMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG4gICAgICBpZiAoIXRoaXMucHJpb3JpdHkpIHtcbiAgICAgICAgLy8gTW9uaXRvciB3aGV0aGVyIGFuIGltYWdlIGlzIGFuIExDUCBlbGVtZW50IG9ubHkgaW4gY2FzZVxuICAgICAgICAvLyB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUgaXMgbWlzc2luZy4gT3RoZXJ3aXNlLCBhbiBpbWFnZVxuICAgICAgICAvLyBoYXMgdGhlIG5lY2Vzc2FyeSBzZXR0aW5ncyBhbmQgbm8gZXh0cmEgY2hlY2tzIGFyZSByZXF1aXJlZC5cbiAgICAgICAgd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAgICAgKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PlxuICAgICAgICAgICAgICAgIG9ic2VydmVyLnJlZ2lzdGVySW1hZ2UodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5yYXdTcmMpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdsb2FkaW5nJywgdGhpcy5nZXRMb2FkaW5nQmVoYXZpb3IoKSk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdmZXRjaHByaW9yaXR5JywgdGhpcy5nZXRGZXRjaFByaW9yaXR5KCkpO1xuICAgIC8vIFRoZSBgc3JjYCBhdHRyaWJ1dGUgc2hvdWxkIGJlIHNldCBsYXN0IHNpbmNlIG90aGVyIGF0dHJpYnV0ZXNcbiAgICAvLyBjb3VsZCBhZmZlY3QgdGhlIGltYWdlJ3MgbG9hZGluZyBiZWhhdmlvci5cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyYycsIHRoaXMuZ2V0UmV3cml0dGVuU3JjKCkpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZSh0aGlzLCBjaGFuZ2VzLCBbJ3Jhd1NyYycsICd3aWR0aCcsICdoZWlnaHQnLCAncHJpb3JpdHknXSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRMb2FkaW5nQmVoYXZpb3IoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdlYWdlcicgOiAnbGF6eSc7XG4gIH1cblxuICBwcml2YXRlIGdldEZldGNoUHJpb3JpdHkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmlvcml0eSA/ICdoaWdoJyA6ICdhdXRvJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3JjKCk6IHN0cmluZyB7XG4gICAgLy8gSW1hZ2VMb2FkZXJDb25maWcgc3VwcG9ydHMgc2V0dGluZyBhIHdpZHRoIHByb3BlcnR5LiBIb3dldmVyLCB3ZSdyZSBub3Qgc2V0dGluZyB3aWR0aCBoZXJlXG4gICAgLy8gYmVjYXVzZSBpZiB0aGUgZGV2ZWxvcGVyIHVzZXMgcmVuZGVyZWQgd2lkdGggaW5zdGVhZCBvZiBpbnRyaW5zaWMgd2lkdGggaW4gdGhlIEhUTUwgd2lkdGhcbiAgICAvLyBhdHRyaWJ1dGUsIHRoZSBpbWFnZSByZXF1ZXN0ZWQgbWF5IGJlIHRvbyBzbWFsbCBmb3IgMngrIHNjcmVlbnMuXG4gICAgY29uc3QgaW1nQ29uZmlnID0ge3NyYzogdGhpcy5yYXdTcmN9O1xuICAgIHJldHVybiB0aGlzLmltYWdlTG9hZGVyKGltZ0NvbmZpZyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAobmdEZXZNb2RlICYmICF0aGlzLnByaW9yaXR5KSB7XG4gICAgICAvLyBBbiBpbWFnZSBpcyBvbmx5IHJlZ2lzdGVyZWQgaW4gZGV2IG1vZGUsIHRyeSB0byB1bnJlZ2lzdGVyIG9ubHkgaW4gZGV2IG1vZGUgYXMgd2VsbC5cbiAgICAgIHdpdGhMQ1BJbWFnZU9ic2VydmVyKFxuICAgICAgICAgIHRoaXMuaW5qZWN0b3IsXG4gICAgICAgICAgKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiBvYnNlcnZlci51bnJlZ2lzdGVySW1hZ2UodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmltZ0VsZW1lbnQubmF0aXZlRWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogTmdNb2R1bGUgdGhhdCBkZWNsYXJlcyBhbmQgZXhwb3J0cyB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZS5cbiAqIFRoaXMgTmdNb2R1bGUgaXMgYSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBhcHBzIHRoYXQgdXNlIHByZS12MTRcbiAqIHZlcnNpb25zIG9mIEFuZ3VsYXIgKGJlZm9yZSB0aGUgYHN0YW5kYWxvbmVgIGZsYWcgYmVjYW1lIGF2YWlsYWJsZSkuXG4gKlxuICogVGhlIGBOZ09wdGltaXplZEltYWdlYCB3aWxsIGJlY29tZSBhIHN0YW5kYWxvbmUgZGlyZWN0aXZlIGluIHYxNCBhbmRcbiAqIHRoaXMgTmdNb2R1bGUgd2lsbCBiZSByZW1vdmVkLlxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAgZXhwb3J0czogW05nT3B0aW1pemVkSW1hZ2VdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlTW9kdWxlIHtcbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8vIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gaW50ZWdlci5cbmZ1bmN0aW9uIGlucHV0VG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCk6IG51bWJlcnx1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB2YWx1ZTtcbn1cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBib29sZWFuLlxuZnVuY3Rpb24gaW5wdXRUb0Jvb2xlYW4odmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgYCR7dmFsdWV9YCAhPT0gJ2ZhbHNlJztcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgZnVuY3Rpb24sIHBhc3NpbmcgYW4gaW5zdGFuY2Ugb2YgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBhcyBhbiBhcmd1bWVudC5cbiAqXG4gKiBOb3RlczpcbiAqIC0gdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBpcyBhIHRyZWUtc2hha2FibGUgcHJvdmlkZXIsIHByb3ZpZGVkIGluICdyb290JyxcbiAqICAgdGh1cyBpdCdzIGEgc2luZ2xldG9uIHdpdGhpbiB0aGlzIGFwcGxpY2F0aW9uXG4gKiAtIHRoZSBwcm9jZXNzIG9mIGBMQ1BJbWFnZU9ic2VydmVyYCBjcmVhdGlvbiBhbmQgYW4gYWN0dWFsIG9wZXJhdGlvbiBhcmUgaW52b2tlZCBvdXRzaWRlIG9mIHRoZVxuICogICBOZ1pvbmUgdG8gbWFrZSBzdXJlIG5vbmUgb2YgdGhlIGNhbGxzIGluc2lkZSB0aGUgYExDUEltYWdlT2JzZXJ2ZXJgIGNsYXNzIHRyaWdnZXIgdW5uZWNlc3NhcnlcbiAqICAgY2hhbmdlIGRldGVjdGlvblxuICovXG5mdW5jdGlvbiB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsIG9wZXJhdGlvbjogKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiB2b2lkKTogdm9pZCB7XG4gIGNvbnN0IG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICByZXR1cm4gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICBjb25zdCBvYnNlcnZlciA9IGluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKTtcbiAgICBvcGVyYXRpb24ob2JzZXJ2ZXIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW1nRGlyZWN0aXZlRGV0YWlscyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgcmV0dXJuIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgKGFjdGl2YXRlZCBvbiBhbiA8aW1nPiBlbGVtZW50IGAgK1xuICAgICAgYHdpdGggdGhlIFxcYHJhd1NyYz1cIiR7ZGlyLnJhd1NyY31cIlxcYClgO1xufVxuXG4vKioqKiogQXNzZXJ0IGZ1bmN0aW9ucyAqKioqKi9cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3JjYCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgc3JjXFxgIGlzIGFsc28gc2V0ICh0byBgICtcbiAgICAgICAgICAgIGBcXGAke2Rpci5zcmN9XFxgKS4gUGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZSBmcm9tIHRoaXMgaW1hZ2UuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIHVzZSB0aGUgXFxgcmF3U3JjXFxgIHRvIGNvbXB1dGUgYCArXG4gICAgICAgICAgICBgdGhlIGZpbmFsIGltYWdlIFVSTCBhbmQgc2V0IHRoZSBcXGBzcmNcXGAgaXRzZWxmLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCByYXdTcmMgPSBkaXIucmF3U3JjLnRyaW0oKTtcbiAgaWYgKHJhd1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKHJhd1NyYy5sZW5ndGggPiBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpIHtcbiAgICAgIHJhd1NyYyA9IHJhd1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nICgke3Jhd1NyY30pLiBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzIGFyZSBgICtcbiAgICAgICAgICAgIGBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gVXNlIGEgcmVndWxhciBcXGBzcmNcXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIChpbnN0ZWFkIG9mIFxcYHJhd1NyY1xcYCkgdG8gZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBgICtcbiAgICAgICAgICAgIGBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVUkwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgYmxvYiBVUkwgKCR7cmF3U3JjfSkuIEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgYCArXG4gICAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIFVzZSBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGAoaW5zdGVhZCBvZiBcXGByYXdTcmNcXGApIHRvIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGAgK1xuICAgICAgICAgICAgYGZvciB0aGlzIGVsZW1lbnQuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkUmF3U3JjKHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIGNvbnN0IGV4dHJhTWVzc2FnZSA9IGlzRW1wdHlTdHJpbmcgPyAnIChlbXB0eSBzdHJpbmcpJyA6ICcnO1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlOiBgICtcbiAgICAgICAgICAgIGBleHBlY3RpbmcgYSBub24tZW1wdHkgc3RyaW5nLCBidXQgZ290OiBcXGAke3ZhbHVlfVxcYCR7ZXh0cmFNZXNzYWdlfS5gKTtcbiAgfVxufVxuXG4vLyBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4vLyB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcil9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgaXMgdXBkYXRlZCBhZnRlciB0aGUgYCArXG4gICAgICAgICAgYGluaXRpYWxpemF0aW9uLiBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuYCk7XG59XG5cbi8vIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG5mdW5jdGlvbiBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBpbnB1dHM6IHN0cmluZ1tdKSB7XG4gIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICBjb25zdCBpc1VwZGF0ZWQgPSBjaGFuZ2VzLmhhc093blByb3BlcnR5KGlucHV0KTtcbiAgICBpZiAoaXNVcGRhdGVkICYmICFjaGFuZ2VzW2lucHV0XS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ3Jhd1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYHJhd1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgcmF3U3JjYCBpcyBhbHJlYWR5IHNldC4gV2UgdXNlXG4gICAgICAgIC8vIGByYXdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtyYXdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBoYXMgYSBjb3JyZWN0IHR5cGUgKG51bWJlcikuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZE51bWJlcklucHV0KGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGlzVmFsaWQgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgfHxcbiAgICAgICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkpO1xuICBpZiAoIWlzVmFsaWQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCBoYXMgYW4gaW52YWxpZCBgICtcbiAgICAgICAgICAgIGB2YWx1ZTogZXhwZWN0aW5nIGEgbnVtYmVyIHRoYXQgcmVwcmVzZW50cyB0aGUgJHtpbnB1dE5hbWV9IGluIHBpeGVscywgYnV0IGdvdDogYCArXG4gICAgICAgICAgICBgXFxgJHtpbnB1dFZhbHVlfVxcYC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbmZ1bmN0aW9uIGFzc2VydFJlcXVpcmVkTnVtYmVySW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBpZiAodHlwZW9mIGlucHV0VmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcil9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSByZXF1aXJlZCBcXGAke2lucHV0TmFtZX1cXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIGlzIG1pc3NpbmcuIFBsZWFzZSBzcGVjaWZ5IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYG9uIHRoZSBtZW50aW9uZWQgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vIENvcGllZCBmcm9tIC9jb3JlL3NyYy9lcnJvcnMudHNgIHNpbmNlIHRoZSBmdW5jdGlvbiBpcyBub3QgZXhwb3NlZCBpblxuLy8gQW5ndWxhciB2MTIsIHYxMy5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5leHBvcnQgY29uc3QgRVJST1JfREVUQUlMU19QQUdFX0JBU0VfVVJMID0gJ2h0dHBzOi8vYW5ndWxhci5pby9lcnJvcnMnO1xuXG5mdW5jdGlvbiBmb3JtYXRSdW50aW1lRXJyb3I8VCBleHRlbmRzIG51bWJlciA9IFJ1bnRpbWVFcnJvckNvZGU+KFxuICAgIGNvZGU6IFQsIG1lc3NhZ2U6IG51bGx8ZmFsc2V8c3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gRXJyb3IgY29kZSBtaWdodCBiZSBhIG5lZ2F0aXZlIG51bWJlciwgd2hpY2ggaXMgYSBzcGVjaWFsIG1hcmtlciB0aGF0IGluc3RydWN0cyB0aGUgbG9naWMgdG9cbiAgLy8gZ2VuZXJhdGUgYSBsaW5rIHRvIHRoZSBlcnJvciBkZXRhaWxzIHBhZ2Ugb24gYW5ndWxhci5pby5cbiAgY29uc3QgZnVsbENvZGUgPSBgTkcwJHtNYXRoLmFicyhjb2RlKX1gO1xuXG4gIGxldCBlcnJvck1lc3NhZ2UgPSBgJHtmdWxsQ29kZX0ke21lc3NhZ2UgPyAnOiAnICsgbWVzc2FnZSA6ICcnfWA7XG5cbiAgaWYgKG5nRGV2TW9kZSAmJiBjb2RlIDwgMCkge1xuICAgIGVycm9yTWVzc2FnZSA9IGAke2Vycm9yTWVzc2FnZX0uIEZpbmQgbW9yZSBhdCAke0VSUk9SX0RFVEFJTFNfUEFHRV9CQVNFX1VSTH0vJHtmdWxsQ29kZX1gO1xuICB9XG4gIHJldHVybiBlcnJvck1lc3NhZ2U7XG59XG4iXX0=