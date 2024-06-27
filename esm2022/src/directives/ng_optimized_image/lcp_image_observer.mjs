/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, ɵformatRuntimeError as formatRuntimeError, PLATFORM_ID, } from '@angular/core';
import { assertDevMode } from './asserts';
import { imgDirectiveDetails } from './error_helper';
import { getUrl } from './url';
import { PlatformLocation } from '../../location';
import { isPlatformBrowser } from '../../platform_id';
import * as i0 from "@angular/core";
/**
 * Observer that detects whether an image with `NgOptimizedImage`
 * is treated as a Largest Contentful Paint (LCP) element. If so,
 * asserts that the image has the `priority` attribute.
 *
 * Note: this is a dev-mode only class and it does not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 *
 * Based on https://web.dev/lcp/#measure-lcp-in-javascript.
 */
export class LCPImageObserver {
    constructor() {
        // Map of full image URLs -> original `ngSrc` values.
        this.images = new Map();
        this.observer = null;
        this.baseUrl = inject(PlatformLocation).href;
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        assertDevMode('LCP checker');
        if (isBrowser && typeof PerformanceObserver !== 'undefined') {
            this.observer = this.initPerformanceObserver();
        }
    }
    /**
     * Inits PerformanceObserver and subscribes to LCP events.
     * Based on https://web.dev/lcp/#measure-lcp-in-javascript
     */
    initPerformanceObserver() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length === 0)
                return;
            // We use the latest entry produced by the `PerformanceObserver` as the best
            // signal on which element is actually an LCP one. As an example, the first image to load on
            // a page, by virtue of being the only thing on the page so far, is often a LCP candidate
            // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
            const lcpElement = entries[entries.length - 1];
            // Cast to `any` due to missing `element` on the `LargestContentfulPaint` type of entry.
            // See https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
            const imgSrc = lcpElement.element?.src ?? '';
            // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
            if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:'))
                return;
            const img = this.images.get(imgSrc);
            if (!img)
                return;
            if (!img.priority && !img.alreadyWarnedPriority) {
                img.alreadyWarnedPriority = true;
                logMissingPriorityError(imgSrc);
            }
            if (img.modified && !img.alreadyWarnedModified) {
                img.alreadyWarnedModified = true;
                logModifiedWarning(imgSrc);
            }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        return observer;
    }
    registerImage(rewrittenSrc, originalNgSrc, isPriority) {
        if (!this.observer)
            return;
        const newObservedImageState = {
            priority: isPriority,
            modified: false,
            alreadyWarnedModified: false,
            alreadyWarnedPriority: false,
        };
        this.images.set(getUrl(rewrittenSrc, this.baseUrl).href, newObservedImageState);
    }
    unregisterImage(rewrittenSrc) {
        if (!this.observer)
            return;
        this.images.delete(getUrl(rewrittenSrc, this.baseUrl).href);
    }
    updateImage(originalSrc, newSrc) {
        const originalUrl = getUrl(originalSrc, this.baseUrl).href;
        const img = this.images.get(originalUrl);
        if (img) {
            img.modified = true;
            this.images.set(getUrl(newSrc, this.baseUrl).href, img);
            this.images.delete(originalUrl);
        }
    }
    ngOnDestroy() {
        if (!this.observer)
            return;
        this.observer.disconnect();
        this.images.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0-next.4+sha-2d8a96b", ngImport: i0, type: LCPImageObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0-next.4+sha-2d8a96b", ngImport: i0, type: LCPImageObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0-next.4+sha-2d8a96b", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
function logMissingPriorityError(ngSrc) {
    const directiveDetails = imgDirectiveDetails(ngSrc);
    console.error(formatRuntimeError(2955 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element but was not marked "priority". This image should be marked ` +
        `"priority" in order to prioritize its loading. ` +
        `To fix this, add the "priority" attribute.`));
}
function logModifiedWarning(ngSrc) {
    const directiveDetails = imgDirectiveDetails(ngSrc);
    console.warn(formatRuntimeError(2964 /* RuntimeErrorCode.LCP_IMG_NGSRC_MODIFIED */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element and has had its "ngSrc" attribute modified. This can cause ` +
        `slower loading performance. It is recommended not to modify the "ngSrc" ` +
        `property on any image which could be the LCP element.`));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNwX2ltYWdlX29ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9sY3BfaW1hZ2Vfb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLE1BQU0sRUFDTixVQUFVLEVBRVYsbUJBQW1CLElBQUksa0JBQWtCLEVBQ3pDLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUl2QixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDN0IsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7O0FBU3BEOzs7Ozs7Ozs7R0FTRztBQUVILE1BQU0sT0FBTyxnQkFBZ0I7SUFPM0I7UUFOQSxxREFBcUQ7UUFDN0MsV0FBTSxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBRS9DLGFBQVEsR0FBK0IsSUFBSSxDQUFDO1FBQ25DLFlBQU8sR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFHdkQsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFekQsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdCLElBQUksU0FBUyxJQUFJLE9BQU8sbUJBQW1CLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDNUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUNqRCxDQUFDO0lB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RSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3RCLENBQUM7eUhBbEZVLGdCQUFnQjs2SEFBaEIsZ0JBQWdCLGNBREosTUFBTTs7c0dBQ2xCLGdCQUFnQjtrQkFENUIsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBc0ZoQyxTQUFTLHVCQUF1QixDQUFDLEtBQWE7SUFDNUMsTUFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRCxPQUFPLENBQUMsS0FBSyxDQUNYLGtCQUFrQix1REFFaEIsR0FBRyxnQkFBZ0Isb0RBQW9EO1FBQ3JFLHFFQUFxRTtRQUNyRSxpREFBaUQ7UUFDakQsNENBQTRDLENBQy9DLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEtBQWE7SUFDdkMsTUFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRCxPQUFPLENBQUMsSUFBSSxDQUNWLGtCQUFrQixxREFFaEIsR0FBRyxnQkFBZ0Isb0RBQW9EO1FBQ3JFLHFFQUFxRTtRQUNyRSwwRUFBMEU7UUFDMUUsdURBQXVELENBQzFELENBQ0YsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgaW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBPbkRlc3Ryb3ksXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgUExBVEZPUk1fSUQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtnZXRVcmx9IGZyb20gJy4vdXJsJztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbG9jYXRpb24nO1xuaW1wb3J0IHtpc1BsYXRmb3JtQnJvd3Nlcn0gZnJvbSAnLi4vLi4vcGxhdGZvcm1faWQnO1xuXG5pbnRlcmZhY2UgT2JzZXJ2ZWRJbWFnZVN0YXRlIHtcbiAgcHJpb3JpdHk6IGJvb2xlYW47XG4gIG1vZGlmaWVkOiBib29sZWFuO1xuICBhbHJlYWR5V2FybmVkUHJpb3JpdHk6IGJvb2xlYW47XG4gIGFscmVhZHlXYXJuZWRNb2RpZmllZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBPYnNlcnZlciB0aGF0IGRldGVjdHMgd2hldGhlciBhbiBpbWFnZSB3aXRoIGBOZ09wdGltaXplZEltYWdlYFxuICogaXMgdHJlYXRlZCBhcyBhIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBlbGVtZW50LiBJZiBzbyxcbiAqIGFzc2VydHMgdGhhdCB0aGUgaW1hZ2UgaGFzIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcyBhbmQgaXQgZG9lcyBub3QgYXBwZWFyIGluIHByb2QgYnVuZGxlcyxcbiAqIHRodXMgdGhlcmUgaXMgbm8gYG5nRGV2TW9kZWAgdXNlIGluIHRoZSBjb2RlLlxuICpcbiAqIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHQuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIExDUEltYWdlT2JzZXJ2ZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvLyBNYXAgb2YgZnVsbCBpbWFnZSBVUkxzIC0+IG9yaWdpbmFsIGBuZ1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIGltYWdlcyA9IG5ldyBNYXA8c3RyaW5nLCBPYnNlcnZlZEltYWdlU3RhdGU+KCk7XG5cbiAgcHJpdmF0ZSBvYnNlcnZlcjogUGVyZm9ybWFuY2VPYnNlcnZlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IGJhc2VVcmwgPSBpbmplY3QoUGxhdGZvcm1Mb2NhdGlvbikuaHJlZjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBpc0Jyb3dzZXIgPSBpc1BsYXRmb3JtQnJvd3NlcihpbmplY3QoUExBVEZPUk1fSUQpKTtcblxuICAgIGFzc2VydERldk1vZGUoJ0xDUCBjaGVja2VyJyk7XG4gICAgaWYgKGlzQnJvd3NlciAmJiB0eXBlb2YgUGVyZm9ybWFuY2VPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMub2JzZXJ2ZXIgPSB0aGlzLmluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRzIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgYW5kIHN1YnNjcmliZXMgdG8gTENQIGV2ZW50cy5cbiAgICogQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdFxuICAgKi9cbiAgcHJpdmF0ZSBpbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpOiBQZXJmb3JtYW5jZU9ic2VydmVyIHtcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBQZXJmb3JtYW5jZU9ic2VydmVyKChlbnRyeUxpc3QpID0+IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBlbnRyeUxpc3QuZ2V0RW50cmllcygpO1xuICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAvLyBXZSB1c2UgdGhlIGxhdGVzdCBlbnRyeSBwcm9kdWNlZCBieSB0aGUgYFBlcmZvcm1hbmNlT2JzZXJ2ZXJgIGFzIHRoZSBiZXN0XG4gICAgICAvLyBzaWduYWwgb24gd2hpY2ggZWxlbWVudCBpcyBhY3R1YWxseSBhbiBMQ1Agb25lLiBBcyBhbiBleGFtcGxlLCB0aGUgZmlyc3QgaW1hZ2UgdG8gbG9hZCBvblxuICAgICAgLy8gYSBwYWdlLCBieSB2aXJ0dWUgb2YgYmVpbmcgdGhlIG9ubHkgdGhpbmcgb24gdGhlIHBhZ2Ugc28gZmFyLCBpcyBvZnRlbiBhIExDUCBjYW5kaWRhdGVcbiAgICAgIC8vIGFuZCBnZXRzIHJlcG9ydGVkIGJ5IFBlcmZvcm1hbmNlT2JzZXJ2ZXIsIGJ1dCBpc24ndCBuZWNlc3NhcmlseSB0aGUgTENQIGVsZW1lbnQuXG4gICAgICBjb25zdCBsY3BFbGVtZW50ID0gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAvLyBDYXN0IHRvIGBhbnlgIGR1ZSB0byBtaXNzaW5nIGBlbGVtZW50YCBvbiB0aGUgYExhcmdlc3RDb250ZW50ZnVsUGFpbnRgIHR5cGUgb2YgZW50cnkuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0xhcmdlc3RDb250ZW50ZnVsUGFpbnRcbiAgICAgIGNvbnN0IGltZ1NyYyA9IChsY3BFbGVtZW50IGFzIGFueSkuZWxlbWVudD8uc3JjID8/ICcnO1xuXG4gICAgICAvLyBFeGNsdWRlIGBkYXRhOmAgYW5kIGBibG9iOmAgVVJMcywgc2luY2UgdGhleSBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGlyZWN0aXZlLlxuICAgICAgaWYgKGltZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpIHx8IGltZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGltZyA9IHRoaXMuaW1hZ2VzLmdldChpbWdTcmMpO1xuICAgICAgaWYgKCFpbWcpIHJldHVybjtcbiAgICAgIGlmICghaW1nLnByaW9yaXR5ICYmICFpbWcuYWxyZWFkeVdhcm5lZFByaW9yaXR5KSB7XG4gICAgICAgIGltZy5hbHJlYWR5V2FybmVkUHJpb3JpdHkgPSB0cnVlO1xuICAgICAgICBsb2dNaXNzaW5nUHJpb3JpdHlFcnJvcihpbWdTcmMpO1xuICAgICAgfVxuICAgICAgaWYgKGltZy5tb2RpZmllZCAmJiAhaW1nLmFscmVhZHlXYXJuZWRNb2RpZmllZCkge1xuICAgICAgICBpbWcuYWxyZWFkeVdhcm5lZE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgbG9nTW9kaWZpZWRXYXJuaW5nKGltZ1NyYyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh7dHlwZTogJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCcsIGJ1ZmZlcmVkOiB0cnVlfSk7XG4gICAgcmV0dXJuIG9ic2VydmVyO1xuICB9XG5cbiAgcmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZywgb3JpZ2luYWxOZ1NyYzogc3RyaW5nLCBpc1ByaW9yaXR5OiBib29sZWFuKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgY29uc3QgbmV3T2JzZXJ2ZWRJbWFnZVN0YXRlOiBPYnNlcnZlZEltYWdlU3RhdGUgPSB7XG4gICAgICBwcmlvcml0eTogaXNQcmlvcml0eSxcbiAgICAgIG1vZGlmaWVkOiBmYWxzZSxcbiAgICAgIGFscmVhZHlXYXJuZWRNb2RpZmllZDogZmFsc2UsXG4gICAgICBhbHJlYWR5V2FybmVkUHJpb3JpdHk6IGZhbHNlLFxuICAgIH07XG4gICAgdGhpcy5pbWFnZXMuc2V0KGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMuYmFzZVVybCkuaHJlZiwgbmV3T2JzZXJ2ZWRJbWFnZVN0YXRlKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLmRlbGV0ZShnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLmJhc2VVcmwpLmhyZWYpO1xuICB9XG5cbiAgdXBkYXRlSW1hZ2Uob3JpZ2luYWxTcmM6IHN0cmluZywgbmV3U3JjOiBzdHJpbmcpIHtcbiAgICBjb25zdCBvcmlnaW5hbFVybCA9IGdldFVybChvcmlnaW5hbFNyYywgdGhpcy5iYXNlVXJsKS5ocmVmO1xuICAgIGNvbnN0IGltZyA9IHRoaXMuaW1hZ2VzLmdldChvcmlnaW5hbFVybCk7XG4gICAgaWYgKGltZykge1xuICAgICAgaW1nLm1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW1hZ2VzLnNldChnZXRVcmwobmV3U3JjLCB0aGlzLmJhc2VVcmwpLmhyZWYsIGltZyk7XG4gICAgICB0aGlzLmltYWdlcy5kZWxldGUob3JpZ2luYWxVcmwpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuaW1hZ2VzLmNsZWFyKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nTWlzc2luZ1ByaW9yaXR5RXJyb3IobmdTcmM6IHN0cmluZykge1xuICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyhuZ1NyYyk7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5MQ1BfSU1HX01JU1NJTkdfUFJJT1JJVFksXG4gICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfSB0aGlzIGltYWdlIGlzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgIGBlbGVtZW50IGJ1dCB3YXMgbm90IG1hcmtlZCBcInByaW9yaXR5XCIuIFRoaXMgaW1hZ2Ugc2hvdWxkIGJlIG1hcmtlZCBgICtcbiAgICAgICAgYFwicHJpb3JpdHlcIiBpbiBvcmRlciB0byBwcmlvcml0aXplIGl0cyBsb2FkaW5nLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBhZGQgdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUuYCxcbiAgICApLFxuICApO1xufVxuXG5mdW5jdGlvbiBsb2dNb2RpZmllZFdhcm5pbmcobmdTcmM6IHN0cmluZykge1xuICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyhuZ1NyYyk7XG4gIGNvbnNvbGUud2FybihcbiAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLkxDUF9JTUdfTkdTUkNfTU9ESUZJRUQsXG4gICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfSB0aGlzIGltYWdlIGlzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgIGBlbGVtZW50IGFuZCBoYXMgaGFkIGl0cyBcIm5nU3JjXCIgYXR0cmlidXRlIG1vZGlmaWVkLiBUaGlzIGNhbiBjYXVzZSBgICtcbiAgICAgICAgYHNsb3dlciBsb2FkaW5nIHBlcmZvcm1hbmNlLiBJdCBpcyByZWNvbW1lbmRlZCBub3QgdG8gbW9kaWZ5IHRoZSBcIm5nU3JjXCIgYCArXG4gICAgICAgIGBwcm9wZXJ0eSBvbiBhbnkgaW1hZ2Ugd2hpY2ggY291bGQgYmUgdGhlIExDUCBlbGVtZW50LmAsXG4gICAgKSxcbiAgKTtcbn1cbiJdfQ==