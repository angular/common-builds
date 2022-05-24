/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injectable, InjectionToken, Injector, Input, NgZone, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
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
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-58bbe5e", ngImport: i0, type: LCPImageObserver, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-58bbe5e", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-58bbe5e", ngImport: i0, type: LCPImageObserver, decorators: [{
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
NgOptimizedImage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-58bbe5e", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Directive });
NgOptimizedImage.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.0+sha-58bbe5e", type: NgOptimizedImage, isStandalone: true, selector: "img[rawSrc]", inputs: { rawSrc: "rawSrc", width: "width", height: "height", priority: "priority", src: "src" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-58bbe5e", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBZ0MsU0FBUyxFQUFpQixtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRW5QLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBa0J2Qzs7O0dBR0c7QUFDSCxNQUFNLGVBQWUsR0FBRyxDQUFDLE1BQXlCLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFFbEU7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFjLGFBQWEsRUFBRTtJQUN6RSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZTtDQUMvQixDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUdNLGdCQUFnQjtJQVNwQixZQUE4QixHQUFhO1FBUjNDLHNEQUFzRDtRQUM5QyxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDM0MsOERBQThEO1FBQ3RELGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVsQyxXQUFNLEdBQWdCLElBQUksQ0FBQztRQUMzQixhQUFRLEdBQTZCLElBQUksQ0FBQztRQUdoRCxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMs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QUFFLFNBQWlCO0lBQ3BFLE1BQU0sT0FBTyxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVE7UUFDMUMsQ0FBQyxPQUFPLFVBQVUsS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWixNQUFNLElBQUksWUFBWSw0Q0FFbEIsMERBQTBELFNBQVMsb0JBQW9CO1lBQ25GLGlEQUFpRCxTQUFTLHVCQUF1QjtZQUNqRixLQUFLLFVBQVUsS0FBSyxDQUFDLENBQUM7S0FDL0I7QUFDSCxDQUFDO0FBRUQsMENBQTBDO0FBQzFDLFNBQVMseUJBQXlCLENBQUMsR0FBcUIsRUFBRSxVQUFtQixFQUFFLFNBQWlCO0lBQzlGLElBQUksT0FBTyxVQUFVLEtBQUssV0FBVyxFQUFFO1FBQ3JDLE1BQU0sSUFBSSxZQUFZLHFEQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsU0FBUyxLQUFLO1lBQzFFLDhDQUE4QyxTQUFTLGVBQWU7WUFDdEUsMkJBQTJCLENBQUMsQ0FBQztLQUN0QztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdG9yLCBJbnB1dCwgTmdab25lLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT25Jbml0LCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXMsIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5cbi8qKlxuICogQ29uZmlnIG9wdGlvbnMgcmVjb2duaXplZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlTG9hZGVyQ29uZmlnIHtcbiAgLy8gTmFtZSBvZiB0aGUgaW1hZ2UgdG8gYmUgYWRkZWQgdG8gdGhlIGltYWdlIHJlcXVlc3QgVVJMXG4gIHNyYzogc3RyaW5nO1xuICAvLyBXaWR0aCBvZiB0aGUgcmVxdWVzdGVkIGltYWdlICh0byBiZSB1c2VkIHdoZW4gZ2VuZXJhdGluZyBzcmNzZXQpXG4gIHdpZHRoPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgdHlwZSBJbWFnZUxvYWRlciA9IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiBzdHJpbmc7XG5cbi8qKlxuICogTm9vcCBpbWFnZSBsb2FkZXIgdGhhdCBkb2VzIG5vIHRyYW5zZm9ybWF0aW9uIHRvIHRoZSBvcmlnaW5hbCBzcmMgYW5kIGp1c3QgcmV0dXJucyBpdCBhcyBpcy5cbiAqIFRoaXMgbG9hZGVyIGlzIHVzZWQgYXMgYSBkZWZhdWx0IG9uZSBpZiBtb3JlIHNwZWNpZmljIGxvZ2ljIGlzIG5vdCBwcm92aWRlZCBpbiBhbiBhcHAgY29uZmlnLlxuICovXG5jb25zdCBub29wSW1hZ2VMb2FkZXIgPSAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4gY29uZmlnLnNyYztcblxuLyoqXG4gKiBXaGVuIGEgQmFzZTY0LWVuY29kZWQgaW1hZ2UgaXMgcGFzc2VkIGFzIGFuIGlucHV0IHRvIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLFxuICogYW4gZXJyb3IgaXMgdGhyb3duLiBUaGUgaW1hZ2UgY29udGVudCAoYXMgYSBzdHJpbmcpIG1pZ2h0IGJlIHZlcnkgbG9uZywgdGh1cyBtYWtpbmdcbiAqIGl0IGhhcmQgdG8gcmVhZCBhbiBlcnJvciBtZXNzYWdlIGlmIHRoZSBlbnRpcmUgc3RyaW5nIGlzIGluY2x1ZGVkLiBUaGlzIGNvbnN0IGRlZmluZXNcbiAqIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBlcnJvciBtZXNzYWdlLiBUaGUgcmVzdFxuICogb2YgdGhlIGNvbnRlbnQgaXMgdHJ1bmNhdGVkLlxuICovXG5jb25zdCBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IgPSA1MDtcblxuLyoqXG4gKiBTcGVjaWFsIHRva2VuIHRoYXQgYWxsb3dzIHRvIGNvbmZpZ3VyZSBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHByb2R1Y2UgYW4gaW1hZ2UgVVJMIGJhc2VkXG4gKiBvbiB0aGUgc3BlY2lmaWVkIGlucHV0LlxuICovXG5leHBvcnQgY29uc3QgSU1BR0VfTE9BREVSID0gbmV3IEluamVjdGlvblRva2VuPEltYWdlTG9hZGVyPignSW1hZ2VMb2FkZXInLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gbm9vcEltYWdlTG9hZGVyLFxufSk7XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGxvZ2ljIHRvIGRldGVjdCB3aGV0aGVyIGFuIGltYWdlIHdpdGggdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmVcbiAqIGlzIHRyZWF0ZWQgYXMgYW4gTENQIGVsZW1lbnQuIElmIHNvLCB2ZXJpZmllcyB0aGF0IHRoZSBpbWFnZSBpcyBtYXJrZWQgYXMgYSBwcmlvcml0eSxcbiAqIHVzaW5nIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKlxuICogQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdC5cbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuY2xhc3MgTENQSW1hZ2VPYnNlcnZlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8vIE1hcCBvZiBmdWxsIGltYWdlIFVSTHMgLT4gb3JpZ2luYWwgYHJhd1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIGltYWdlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIC8vIEtlZXAgdHJhY2sgb2YgaW1hZ2VzIGZvciB3aGljaCBgY29uc29sZS53YXJuYCB3YXMgcHJvZHVjZWQuXG4gIHByaXZhdGUgYWxyZWFkeVdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgd2luZG93OiBXaW5kb3d8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgb2JzZXJ2ZXI6IFBlcmZvcm1hbmNlT2JzZXJ2ZXJ8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgZG9jOiBEb2N1bWVudCkge1xuICAgIGNvbnN0IHdpbiA9IGRvYy5kZWZhdWx0VmlldztcbiAgICBpZiAodHlwZW9mIHdpbiAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICAgIHRoaXMub2JzZXJ2ZXIgPSB0aGlzLmluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29udmVydHMgcmVsYXRpdmUgaW1hZ2UgVVJMIHRvIGEgZnVsbCBVUkwuXG4gIHByaXZhdGUgZ2V0RnVsbFVybChzcmM6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgVVJMKHNyYywgdGhpcy53aW5kb3chLmxvY2F0aW9uLmhyZWYpLmhyZWY7XG4gIH1cblxuICAvLyBJbml0cyBQZXJmb3JtYW5jZU9ic2VydmVyIGFuZCBzdWJzY3JpYmVzIHRvIExDUCBldmVudHMuXG4gIC8vIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHRcbiAgcHJpdmF0ZSBpbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpOiBQZXJmb3JtYW5jZU9ic2VydmVyIHtcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBQZXJmb3JtYW5jZU9ic2VydmVyKChlbnRyeUxpc3QpID0+IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBlbnRyeUxpc3QuZ2V0RW50cmllcygpO1xuICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAvLyBOb3RlOiB3ZSB1c2UgdGhlIGxhdGVzdCBlbnRyeSBwcm9kdWNlZCBieSB0aGUgYFBlcmZvcm1hbmNlT2JzZXJ2ZXJgIGFzIHRoZSBiZXN0XG4gICAgICAvLyBzaWduYWwgb24gd2hpY2ggZWxlbWVudCBpcyBhY3R1YWxseSBhbiBMQ1Agb25lLiBBcyBhbiBleGFtcGxlLCB0aGUgZmlyc3QgaW1hZ2UgdG8gbG9hZCBvblxuICAgICAgLy8gYSBwYWdlLCBieSB2aXJ0dWUgb2YgYmVpbmcgdGhlIG9ubHkgdGhpbmcgb24gdGhlIHBhZ2Ugc28gZmFyLCBpcyBvZnRlbiBhIExDUCBjYW5kaWRhdGVcbiAgICAgIC8vIGFuZCBnZXRzIHJlcG9ydGVkIGJ5IFBlcmZvcm1hbmNlT2JzZXJ2ZXIsIGJ1dCBpc24ndCBuZWNlc3NhcmlseSB0aGUgTENQIGVsZW1lbnQuXG4gICAgICBjb25zdCBsY3BFbGVtZW50ID0gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdO1xuICAgICAgLy8gQ2FzdCB0byBgYW55YCBkdWUgdG8gbWlzc2luZyBgZWxlbWVudGAgb24gb2JzZXJ2ZWQgdHlwZSBvZiBlbnRyeS5cbiAgICAgIGNvbnN0IGltZ1NyYyA9IChsY3BFbGVtZW50IGFzIGFueSkuZWxlbWVudD8uc3JjID8/ICcnO1xuXG4gICAgICAvLyBFeGNsdWRlIGBkYXRhOmAgYW5kIGBibG9iOmAgVVJMcywgc2luY2UgdGhleSBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGlyZWN0aXZlLlxuICAgICAgaWYgKGltZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpIHx8IGltZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGltZ1Jhd1NyYyA9IHRoaXMuaW1hZ2VzLmdldChpbWdTcmMpO1xuICAgICAgaWYgKGltZ1Jhd1NyYyAmJiAhdGhpcy5hbHJlYWR5V2FybmVkLmhhcyhpbWdTcmMpKSB7XG4gICAgICAgIHRoaXMuYWxyZWFkeVdhcm5lZC5hZGQoaW1nU3JjKTtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlRGV0YWlscyA9IGltZ0RpcmVjdGl2ZURldGFpbHMoe3Jhd1NyYzogaW1nUmF3U3JjfSBhcyBhbnkpO1xuICAgICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5MQ1BfSU1HX01JU1NJTkdfUFJJT1JJVFksXG4gICAgICAgICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfTogdGhlIGltYWdlIHdhcyBkZXRlY3RlZCBhcyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGAgK1xuICAgICAgICAgICAgICAgIGBlbGVtZW50LCBzbyBpdHMgbG9hZGluZyBzaG91bGQgYmUgcHJpb3JpdGl6ZWQgZm9yIG9wdGltYWwgcGVyZm9ybWFuY2UuIFBsZWFzZSBgICtcbiAgICAgICAgICAgICAgICBgYWRkIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlIGlmIHRoaXMgaW1hZ2UgaXMgYWJvdmUgdGhlIGZvbGQuYCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoe3R5cGU6ICdsYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQnLCBidWZmZXJlZDogdHJ1ZX0pO1xuICAgIHJldHVybiBvYnNlcnZlcjtcbiAgfVxuXG4gIHJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcsIHJhd1NyYzogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5pbWFnZXMuc2V0KHRoaXMuZ2V0RnVsbFVybChyZXdyaXR0ZW5TcmMpLCByYXdTcmMpO1xuICB9XG5cbiAgdW5yZWdpc3RlckltYWdlKHJld3JpdHRlblNyYzogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5pbWFnZXMuZGVsZXRlKHRoaXMuZ2V0RnVsbFVybChyZXdyaXR0ZW5TcmMpKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuaW1hZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5hbHJlYWR5V2FybmVkLmNsZWFyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiAqKiBFWFBFUklNRU5UQUwgKipcbiAqXG4gKiBUT0RPOiBhZGQgSW1hZ2UgZGlyZWN0aXZlIGRlc2NyaXB0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUT0RPOiBhZGQgSW1hZ2UgZGlyZWN0aXZlIHVzYWdlIG5vdGVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbWdbcmF3U3JjXScsXG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2UgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KElNQUdFX0xPQURFUikgcHJpdmF0ZSBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIsIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICAgIHByaXZhdGUgaW1nRWxlbWVudDogRWxlbWVudFJlZiwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLy8gUHJpdmF0ZSBmaWVsZHMgdG8ga2VlcCBub3JtYWxpemVkIGlucHV0IHZhbHVlcy5cbiAgcHJpdmF0ZSBfd2lkdGg/OiBudW1iZXI7XG4gIHByaXZhdGUgX2hlaWdodD86IG51bWJlcjtcbiAgcHJpdmF0ZSBfcHJpb3JpdHkgPSBmYWxzZTtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgc291cmNlIGltYWdlLlxuICAgKiBJbWFnZSBuYW1lIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgYW5kIHRoZSBmaW5hbCBVUkwgd2lsbCBiZSBhcHBsaWVkIGFzIHRoZSBgc3JjYFxuICAgKiBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoKSByYXdTcmMhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHdpZHRoKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCkge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRWYWxpZE51bWJlcklucHV0KHZhbHVlLCAnd2lkdGgnKTtcbiAgICB0aGlzLl93aWR0aCA9IGlucHV0VG9JbnRlZ2VyKHZhbHVlKTtcbiAgfVxuICBnZXQgd2lkdGgoKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRyaW5zaWMgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBoZWlnaHQodmFsdWU6IHN0cmluZ3xudW1iZXJ8dW5kZWZpbmVkKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydFZhbGlkTnVtYmVySW5wdXQodmFsdWUsICdoZWlnaHQnKTtcbiAgICB0aGlzLl9oZWlnaHQgPSBpbnB1dFRvSW50ZWdlcih2YWx1ZSk7XG4gIH1cbiAgZ2V0IGhlaWdodCgpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW1hZ2Ugc2hvdWxkIGhhdmUgYSBoaWdoIHByaW9yaXR5LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHByaW9yaXR5KHZhbHVlOiBzdHJpbmd8Ym9vbGVhbnx1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9wcmlvcml0eSA9IGlucHV0VG9Cb29sZWFuKHZhbHVlKTtcbiAgfVxuICBnZXQgcHJpb3JpdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByaW9yaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHZhbHVlIG9mIHRoZSBgc3JjYCBpZiBpdCdzIHNldCBvbiBhIGhvc3QgPGltZz4gZWxlbWVudC5cbiAgICogVGhpcyBpbnB1dCBpcyBuZWVkZWQgdG8gdmVyaWZ5IHRoYXQgdGhlcmUgYXJlIG5vIGBzcmNgIGFuZCBgcmF3U3JjYCBwcm92aWRlZFxuICAgKiBhdCB0aGUgc2FtZSB0aW1lICh0aHVzIGNhdXNpbmcgYW4gYW1iaWd1aXR5IG9uIHdoaWNoIHNyYyB0byB1c2UpLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyYz86IHN0cmluZztcblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnRWYWxpZFJhd1NyYyh0aGlzLnJhd1NyYyk7XG4gICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKHRoaXMpO1xuICAgICAgYXNzZXJ0Tm90QmFzZTY0SW1hZ2UodGhpcyk7XG4gICAgICBhc3NlcnROb3RCbG9iVVJMKHRoaXMpO1xuICAgICAgYXNzZXJ0UmVxdWlyZWROdW1iZXJJbnB1dCh0aGlzLCB0aGlzLndpZHRoLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydFJlcXVpcmVkTnVtYmVySW5wdXQodGhpcywgdGhpcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSkge1xuICAgICAgICAvLyBNb25pdG9yIHdoZXRoZXIgYW4gaW1hZ2UgaXMgYW4gTENQIGVsZW1lbnQgb25seSBpbiBjYXNlXG4gICAgICAgIC8vIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZSBpcyBtaXNzaW5nLiBPdGhlcndpc2UsIGFuIGltYWdlXG4gICAgICAgIC8vIGhhcyB0aGUgbmVjZXNzYXJ5IHNldHRpbmdzIGFuZCBubyBleHRyYSBjaGVja3MgYXJlIHJlcXVpcmVkLlxuICAgICAgICB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IsXG4gICAgICAgICAgICAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLnJhd1NyYykpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2xvYWRpbmcnLCB0aGlzLmdldExvYWRpbmdCZWhhdmlvcigpKTtcbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ2ZldGNocHJpb3JpdHknLCB0aGlzLmdldEZldGNoUHJpb3JpdHkoKSk7XG4gICAgLy8gVGhlIGBzcmNgIGF0dHJpYnV0ZSBzaG91bGQgYmUgc2V0IGxhc3Qgc2luY2Ugb3RoZXIgYXR0cmlidXRlc1xuICAgIC8vIGNvdWxkIGFmZmVjdCB0aGUgaW1hZ2UncyBsb2FkaW5nIGJlaGF2aW9yLlxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgdGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKHRoaXMsIGNoYW5nZXMsIFsncmF3U3JjJywgJ3dpZHRoJywgJ2hlaWdodCcsICdwcmlvcml0eSddKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2VhZ2VyJyA6ICdsYXp5JztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RmV0Y2hQcmlvcml0eSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2hpZ2gnIDogJ2F1dG8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmMoKTogc3RyaW5nIHtcbiAgICAvLyBJbWFnZUxvYWRlckNvbmZpZyBzdXBwb3J0cyBzZXR0aW5nIGEgd2lkdGggcHJvcGVydHkuIEhvd2V2ZXIsIHdlJ3JlIG5vdCBzZXR0aW5nIHdpZHRoIGhlcmVcbiAgICAvLyBiZWNhdXNlIGlmIHRoZSBkZXZlbG9wZXIgdXNlcyByZW5kZXJlZCB3aWR0aCBpbnN0ZWFkIG9mIGludHJpbnNpYyB3aWR0aCBpbiB0aGUgSFRNTCB3aWR0aFxuICAgIC8vIGF0dHJpYnV0ZSwgdGhlIGltYWdlIHJlcXVlc3RlZCBtYXkgYmUgdG9vIHNtYWxsIGZvciAyeCsgc2NyZWVucy5cbiAgICBjb25zdCBpbWdDb25maWcgPSB7c3JjOiB0aGlzLnJhd1NyY307XG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMb2FkZXIoaW1nQ29uZmlnKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUgJiYgIXRoaXMucHJpb3JpdHkpIHtcbiAgICAgIC8vIEFuIGltYWdlIGlzIG9ubHkgcmVnaXN0ZXJlZCBpbiBkZXYgbW9kZSwgdHJ5IHRvIHVucmVnaXN0ZXIgb25seSBpbiBkZXYgbW9kZSBhcyB3ZWxsLlxuICAgICAgd2l0aExDUEltYWdlT2JzZXJ2ZXIoXG4gICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICAob2JzZXJ2ZXI6IExDUEltYWdlT2JzZXJ2ZXIpID0+IG9ic2VydmVyLnVucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRIb3N0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuaW1nRWxlbWVudC5uYXRpdmVFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8vIENvbnZlcnQgaW5wdXQgdmFsdWUgdG8gaW50ZWdlci5cbmZ1bmN0aW9uIGlucHV0VG9JbnRlZ2VyKHZhbHVlOiBzdHJpbmd8bnVtYmVyfHVuZGVmaW5lZCk6IG51bWJlcnx1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB2YWx1ZTtcbn1cblxuLy8gQ29udmVydCBpbnB1dCB2YWx1ZSB0byBib29sZWFuLlxuZnVuY3Rpb24gaW5wdXRUb0Jvb2xlYW4odmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgYCR7dmFsdWV9YCAhPT0gJ2ZhbHNlJztcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgZnVuY3Rpb24sIHBhc3NpbmcgYW4gaW5zdGFuY2Ugb2YgdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBhcyBhbiBhcmd1bWVudC5cbiAqXG4gKiBOb3RlczpcbiAqIC0gdGhlIGBMQ1BJbWFnZU9ic2VydmVyYCBpcyBhIHRyZWUtc2hha2FibGUgcHJvdmlkZXIsIHByb3ZpZGVkIGluICdyb290JyxcbiAqICAgdGh1cyBpdCdzIGEgc2luZ2xldG9uIHdpdGhpbiB0aGlzIGFwcGxpY2F0aW9uXG4gKiAtIHRoZSBwcm9jZXNzIG9mIGBMQ1BJbWFnZU9ic2VydmVyYCBjcmVhdGlvbiBhbmQgYW4gYWN0dWFsIG9wZXJhdGlvbiBhcmUgaW52b2tlZCBvdXRzaWRlIG9mIHRoZVxuICogICBOZ1pvbmUgdG8gbWFrZSBzdXJlIG5vbmUgb2YgdGhlIGNhbGxzIGluc2lkZSB0aGUgYExDUEltYWdlT2JzZXJ2ZXJgIGNsYXNzIHRyaWdnZXIgdW5uZWNlc3NhcnlcbiAqICAgY2hhbmdlIGRldGVjdGlvblxuICovXG5mdW5jdGlvbiB3aXRoTENQSW1hZ2VPYnNlcnZlcihcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsIG9wZXJhdGlvbjogKG9ic2VydmVyOiBMQ1BJbWFnZU9ic2VydmVyKSA9PiB2b2lkKTogdm9pZCB7XG4gIGNvbnN0IG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICByZXR1cm4gbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICBjb25zdCBvYnNlcnZlciA9IGluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKTtcbiAgICBvcGVyYXRpb24ob2JzZXJ2ZXIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW1nRGlyZWN0aXZlRGV0YWlscyhkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgcmV0dXJuIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgKGFjdGl2YXRlZCBvbiBhbiA8aW1nPiBlbGVtZW50IGAgK1xuICAgICAgYHdpdGggdGhlIFxcYHJhd1NyYz1cIiR7ZGlyLnJhd1NyY31cIlxcYClgO1xufVxuXG4vKioqKiogQXNzZXJ0IGZ1bmN0aW9ucyAqKioqKi9cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGVyZSBpcyBubyBgc3JjYCBzZXQgb24gYSBob3N0IGVsZW1lbnQuXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgc3JjXFxgIGlzIGFsc28gc2V0ICh0byBgICtcbiAgICAgICAgICAgIGBcXGAke2Rpci5zcmN9XFxgKS4gUGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZSBmcm9tIHRoaXMgaW1hZ2UuIGAgK1xuICAgICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIHVzZSB0aGUgXFxgcmF3U3JjXFxgIHRvIGNvbXB1dGUgYCArXG4gICAgICAgICAgICBgdGhlIGZpbmFsIGltYWdlIFVSTCBhbmQgc2V0IHRoZSBcXGBzcmNcXGAgaXRzZWxmLmApO1xuICB9XG59XG5cbi8vIFZlcmlmaWVzIHRoYXQgdGhlIGByYXdTcmNgIGlzIG5vdCBhIEJhc2U2NC1lbmNvZGVkIGltYWdlLlxuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCByYXdTcmMgPSBkaXIucmF3U3JjLnRyaW0oKTtcbiAgaWYgKHJhd1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKHJhd1NyYy5sZW5ndGggPiBCQVNFNjRfSU1HX01BWF9MRU5HVEhfSU5fRVJST1IpIHtcbiAgICAgIHJhd1NyYyA9IHJhd1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nICgke3Jhd1NyY30pLiBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzIGFyZSBgICtcbiAgICAgICAgICAgIGBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gVXNlIGEgcmVndWxhciBcXGBzcmNcXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIChpbnN0ZWFkIG9mIFxcYHJhd1NyY1xcYCkgdG8gZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBgICtcbiAgICAgICAgICAgIGBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IHRoZSBgcmF3U3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbmZ1bmN0aW9uIGFzc2VydE5vdEJsb2JVUkwoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGNvbnN0IHJhd1NyYyA9IGRpci5yYXdTcmMudHJpbSgpO1xuICBpZiAocmF3U3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYHJhd1NyY1xcYCB3YXMgc2V0IGAgK1xuICAgICAgICAgICAgYHRvIGEgYmxvYiBVUkwgKCR7cmF3U3JjfSkuIEJsb2IgVVJMcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgYCArXG4gICAgICAgICAgICBgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUuIFVzZSBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGAoaW5zdGVhZCBvZiBcXGByYXdTcmNcXGApIHRvIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGAgK1xuICAgICAgICAgICAgYGZvciB0aGlzIGVsZW1lbnQuYCk7XG4gIH1cbn1cblxuLy8gVmVyaWZpZXMgdGhhdCB0aGUgYHJhd1NyY2AgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IHN0cmluZy5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkUmF3U3JjKHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIGNvbnN0IGV4dHJhTWVzc2FnZSA9IGlzRW1wdHlTdHJpbmcgPyAnIChlbXB0eSBzdHJpbmcpJyA6ICcnO1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGUgXFxgcmF3U3JjXFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlOiBgICtcbiAgICAgICAgICAgIGBleHBlY3RpbmcgYSBub24tZW1wdHkgc3RyaW5nLCBidXQgZ290OiBcXGAke3ZhbHVlfVxcYCR7ZXh0cmFNZXNzYWdlfS5gKTtcbiAgfVxufVxuXG4vLyBDcmVhdGVzIGEgYFJ1bnRpbWVFcnJvcmAgaW5zdGFuY2UgdG8gcmVwcmVzZW50IGEgc2l0dWF0aW9uIHdoZW4gYW4gaW5wdXQgaXMgc2V0IGFmdGVyXG4vLyB0aGUgZGlyZWN0aXZlIGhhcyBpbml0aWFsaXplZC5cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcil9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgaXMgdXBkYXRlZCBhZnRlciB0aGUgYCArXG4gICAgICAgICAgYGluaXRpYWxpemF0aW9uLiBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgd2lsbCBub3QgcmVhY3QgdG8gdGhpcyBpbnB1dCBjaGFuZ2UuYCk7XG59XG5cbi8vIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG5mdW5jdGlvbiBhc3NlcnROb1Bvc3RJbml0SW5wdXRDaGFuZ2UoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBpbnB1dHM6IHN0cmluZ1tdKSB7XG4gIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICBjb25zdCBpc1VwZGF0ZWQgPSBjaGFuZ2VzLmhhc093blByb3BlcnR5KGlucHV0KTtcbiAgICBpZiAoaXNVcGRhdGVkICYmICFjaGFuZ2VzW2lucHV0XS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ3Jhd1NyYycpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgYHJhd1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgcmF3U3JjYCBpcyBhbHJlYWR5IHNldC4gV2UgdXNlXG4gICAgICAgIC8vIGByYXdTcmNgIGluIHRoZSBlcnJvciBtZXNzYWdlLCBzbyB3ZSB1c2UgYSBwcmV2aW91cyB2YWx1ZSwgYnV0XG4gICAgICAgIC8vIG5vdCB0aGUgdXBkYXRlZCBvbmUgaW4gaXQuXG4gICAgICAgIGRpciA9IHtyYXdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBoYXMgYSBjb3JyZWN0IHR5cGUgKG51bWJlcikuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZE51bWJlcklucHV0KGlucHV0VmFsdWU6IHVua25vd24sIGlucHV0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGlzVmFsaWQgPSB0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicgfHxcbiAgICAgICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJC8udGVzdChpbnB1dFZhbHVlLnRyaW0oKSkpO1xuICBpZiAoIWlzVmFsaWQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCBoYXMgYW4gaW52YWxpZCBgICtcbiAgICAgICAgICAgIGB2YWx1ZTogZXhwZWN0aW5nIGEgbnVtYmVyIHRoYXQgcmVwcmVzZW50cyB0aGUgJHtpbnB1dE5hbWV9IGluIHBpeGVscywgYnV0IGdvdDogYCArXG4gICAgICAgICAgICBgXFxgJHtpbnB1dFZhbHVlfVxcYC5gKTtcbiAgfVxufVxuXG4vLyBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbmZ1bmN0aW9uIGFzc2VydFJlcXVpcmVkTnVtYmVySW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBpZiAodHlwZW9mIGlucHV0VmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpcil9IGhhcyBkZXRlY3RlZCB0aGF0IHRoZSByZXF1aXJlZCBcXGAke2lucHV0TmFtZX1cXGAgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlIGlzIG1pc3NpbmcuIFBsZWFzZSBzcGVjaWZ5IHRoZSBcXGAke2lucHV0TmFtZX1cXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICAgICAgYG9uIHRoZSBtZW50aW9uZWQgZWxlbWVudC5gKTtcbiAgfVxufVxuIl19