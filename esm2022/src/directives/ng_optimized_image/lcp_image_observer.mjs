/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, ɵformatRuntimeError as formatRuntimeError, PLATFORM_ID, } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { imgDirectiveDetails } from './error_helper';
import { getUrl } from './url';
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
        this.window = null;
        this.observer = null;
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        assertDevMode('LCP checker');
        const win = inject(DOCUMENT).defaultView;
        if (isBrowser && typeof PerformanceObserver !== 'undefined') {
            this.window = win;
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
        this.images.set(getUrl(rewrittenSrc, this.window).href, newObservedImageState);
    }
    unregisterImage(rewrittenSrc) {
        if (!this.observer)
            return;
        this.images.delete(getUrl(rewrittenSrc, this.window).href);
    }
    updateImage(originalSrc, newSrc) {
        if (!this.observer)
            return;
        const originalUrl = getUrl(originalSrc, this.window).href;
        const img = this.images.get(originalUrl);
        if (img) {
            img.modified = true;
            this.images.set(getUrl(newSrc, this.window).href, img);
            this.images.delete(originalUrl);
        }
    }
    ngOnDestroy() {
        if (!this.observer)
            return;
        this.observer.disconnect();
        this.images.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.2+sha-1853bbb", ngImport: i0, type: LCPImageObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.2+sha-1853bbb", ngImport: i0, type: LCPImageObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.2+sha-1853bbb", ngImport: i0, type: LCPImageObserver, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNwX2ltYWdlX29ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9sY3BfaW1hZ2Vfb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLE1BQU0sRUFDTixVQUFVLEVBRVYsbUJBQW1CLElBQUksa0JBQWtCLEVBQ3pDLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHMUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzdCLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQVNwRDs7Ozs7Ozs7O0dBU0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBTzNCO1FBTkEscURBQXFEO1FBQzdDLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQUUvQyxXQUFNLEdBQWtCLElBQUksQ0FBQztRQUM3QixhQUFRLEdBQStCLElBQUksQ0FBQztRQUdsRCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RCxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUN6QyxJQUFJLFNBQVMsSUFBSSxPQUFPLG1CQUFtQixLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1lB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IEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgaW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBPbkRlc3Ryb3ksXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgUExBVEZPUk1fSUQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2dldFVybH0gZnJvbSAnLi91cmwnO1xuaW1wb3J0IHtpc1BsYXRmb3JtQnJvd3Nlcn0gZnJvbSAnLi4vLi4vcGxhdGZvcm1faWQnO1xuXG5pbnRlcmZhY2UgT2JzZXJ2ZWRJbWFnZVN0YXRlIHtcbiAgcHJpb3JpdHk6IGJvb2xlYW47XG4gIG1vZGlmaWVkOiBib29sZWFuO1xuICBhbHJlYWR5V2FybmVkUHJpb3JpdHk6IGJvb2xlYW47XG4gIGFscmVhZHlXYXJuZWRNb2RpZmllZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBPYnNlcnZlciB0aGF0IGRldGVjdHMgd2hldGhlciBhbiBpbWFnZSB3aXRoIGBOZ09wdGltaXplZEltYWdlYFxuICogaXMgdHJlYXRlZCBhcyBhIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBlbGVtZW50LiBJZiBzbyxcbiAqIGFzc2VydHMgdGhhdCB0aGUgaW1hZ2UgaGFzIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcyBhbmQgaXQgZG9lcyBub3QgYXBwZWFyIGluIHByb2QgYnVuZGxlcyxcbiAqIHRodXMgdGhlcmUgaXMgbm8gYG5nRGV2TW9kZWAgdXNlIGluIHRoZSBjb2RlLlxuICpcbiAqIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHQuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIExDUEltYWdlT2JzZXJ2ZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvLyBNYXAgb2YgZnVsbCBpbWFnZSBVUkxzIC0+IG9yaWdpbmFsIGBuZ1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIGltYWdlcyA9IG5ldyBNYXA8c3RyaW5nLCBPYnNlcnZlZEltYWdlU3RhdGU+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvdyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG9ic2VydmVyOiBQZXJmb3JtYW5jZU9ic2VydmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3QgaXNCcm93c2VyID0gaXNQbGF0Zm9ybUJyb3dzZXIoaW5qZWN0KFBMQVRGT1JNX0lEKSk7XG4gICAgYXNzZXJ0RGV2TW9kZSgnTENQIGNoZWNrZXInKTtcbiAgICBjb25zdCB3aW4gPSBpbmplY3QoRE9DVU1FTlQpLmRlZmF1bHRWaWV3O1xuICAgIGlmIChpc0Jyb3dzZXIgJiYgdHlwZW9mIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICAgIHRoaXMub2JzZXJ2ZXIgPSB0aGlzLmluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRzIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgYW5kIHN1YnNjcmliZXMgdG8gTENQIGV2ZW50cy5cbiAgICogQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdFxuICAgKi9cbiAgcHJpdmF0ZSBpbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpOiBQZXJmb3JtYW5jZU9ic2VydmVyIHtcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBQZXJmb3JtYW5jZU9ic2VydmVyKChlbnRyeUxpc3QpID0+IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBlbnRyeUxpc3QuZ2V0RW50cmllcygpO1xuICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAvLyBXZSB1c2UgdGhlIGxhdGVzdCBlbnRyeSBwcm9kdWNlZCBieSB0aGUgYFBlcmZvcm1hbmNlT2JzZXJ2ZXJgIGFzIHRoZSBiZXN0XG4gICAgICAvLyBzaWduYWwgb24gd2hpY2ggZWxlbWVudCBpcyBhY3R1YWxseSBhbiBMQ1Agb25lLiBBcyBhbiBleGFtcGxlLCB0aGUgZmlyc3QgaW1hZ2UgdG8gbG9hZCBvblxuICAgICAgLy8gYSBwYWdlLCBieSB2aXJ0dWUgb2YgYmVpbmcgdGhlIG9ubHkgdGhpbmcgb24gdGhlIHBhZ2Ugc28gZmFyLCBpcyBvZnRlbiBhIExDUCBjYW5kaWRhdGVcbiAgICAgIC8vIGFuZCBnZXRzIHJlcG9ydGVkIGJ5IFBlcmZvcm1hbmNlT2JzZXJ2ZXIsIGJ1dCBpc24ndCBuZWNlc3NhcmlseSB0aGUgTENQIGVsZW1lbnQuXG4gICAgICBjb25zdCBsY3BFbGVtZW50ID0gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAvLyBDYXN0IHRvIGBhbnlgIGR1ZSB0byBtaXNzaW5nIGBlbGVtZW50YCBvbiB0aGUgYExhcmdlc3RDb250ZW50ZnVsUGFpbnRgIHR5cGUgb2YgZW50cnkuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0xhcmdlc3RDb250ZW50ZnVsUGFpbnRcbiAgICAgIGNvbnN0IGltZ1NyYyA9IChsY3BFbGVtZW50IGFzIGFueSkuZWxlbWVudD8uc3JjID8/ICcnO1xuXG4gICAgICAvLyBFeGNsdWRlIGBkYXRhOmAgYW5kIGBibG9iOmAgVVJMcywgc2luY2UgdGhleSBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGlyZWN0aXZlLlxuICAgICAgaWYgKGltZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpIHx8IGltZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGltZyA9IHRoaXMuaW1hZ2VzLmdldChpbWdTcmMpO1xuICAgICAgaWYgKCFpbWcpIHJldHVybjtcbiAgICAgIGlmICghaW1nLnByaW9yaXR5ICYmICFpbWcuYWxyZWFkeVdhcm5lZFByaW9yaXR5KSB7XG4gICAgICAgIGltZy5hbHJlYWR5V2FybmVkUHJpb3JpdHkgPSB0cnVlO1xuICAgICAgICBsb2dNaXNzaW5nUHJpb3JpdHlFcnJvcihpbWdTcmMpO1xuICAgICAgfVxuICAgICAgaWYgKGltZy5tb2RpZmllZCAmJiAhaW1nLmFscmVhZHlXYXJuZWRNb2RpZmllZCkge1xuICAgICAgICBpbWcuYWxyZWFkeVdhcm5lZE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgbG9nTW9kaWZpZWRXYXJuaW5nKGltZ1NyYyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh7dHlwZTogJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCcsIGJ1ZmZlcmVkOiB0cnVlfSk7XG4gICAgcmV0dXJuIG9ic2VydmVyO1xuICB9XG5cbiAgcmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZywgb3JpZ2luYWxOZ1NyYzogc3RyaW5nLCBpc1ByaW9yaXR5OiBib29sZWFuKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgY29uc3QgbmV3T2JzZXJ2ZWRJbWFnZVN0YXRlOiBPYnNlcnZlZEltYWdlU3RhdGUgPSB7XG4gICAgICBwcmlvcml0eTogaXNQcmlvcml0eSxcbiAgICAgIG1vZGlmaWVkOiBmYWxzZSxcbiAgICAgIGFscmVhZHlXYXJuZWRNb2RpZmllZDogZmFsc2UsXG4gICAgICBhbHJlYWR5V2FybmVkUHJpb3JpdHk6IGZhbHNlLFxuICAgIH07XG4gICAgdGhpcy5pbWFnZXMuc2V0KGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMud2luZG93ISkuaHJlZiwgbmV3T2JzZXJ2ZWRJbWFnZVN0YXRlKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLmRlbGV0ZShnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyEpLmhyZWYpO1xuICB9XG5cbiAgdXBkYXRlSW1hZ2Uob3JpZ2luYWxTcmM6IHN0cmluZywgbmV3U3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICBjb25zdCBvcmlnaW5hbFVybCA9IGdldFVybChvcmlnaW5hbFNyYywgdGhpcy53aW5kb3chKS5ocmVmO1xuICAgIGNvbnN0IGltZyA9IHRoaXMuaW1hZ2VzLmdldChvcmlnaW5hbFVybCk7XG4gICAgaWYgKGltZykge1xuICAgICAgaW1nLm1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW1hZ2VzLnNldChnZXRVcmwobmV3U3JjLCB0aGlzLndpbmRvdyEpLmhyZWYsIGltZyk7XG4gICAgICB0aGlzLmltYWdlcy5kZWxldGUob3JpZ2luYWxVcmwpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuaW1hZ2VzLmNsZWFyKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nTWlzc2luZ1ByaW9yaXR5RXJyb3IobmdTcmM6IHN0cmluZykge1xuICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyhuZ1NyYyk7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5MQ1BfSU1HX01JU1NJTkdfUFJJT1JJVFksXG4gICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfSB0aGlzIGltYWdlIGlzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgIGBlbGVtZW50IGJ1dCB3YXMgbm90IG1hcmtlZCBcInByaW9yaXR5XCIuIFRoaXMgaW1hZ2Ugc2hvdWxkIGJlIG1hcmtlZCBgICtcbiAgICAgICAgYFwicHJpb3JpdHlcIiBpbiBvcmRlciB0byBwcmlvcml0aXplIGl0cyBsb2FkaW5nLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBhZGQgdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUuYCxcbiAgICApLFxuICApO1xufVxuXG5mdW5jdGlvbiBsb2dNb2RpZmllZFdhcm5pbmcobmdTcmM6IHN0cmluZykge1xuICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyhuZ1NyYyk7XG4gIGNvbnNvbGUud2FybihcbiAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLkxDUF9JTUdfTkdTUkNfTU9ESUZJRUQsXG4gICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfSB0aGlzIGltYWdlIGlzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgIGBlbGVtZW50IGFuZCBoYXMgaGFkIGl0cyBcIm5nU3JjXCIgYXR0cmlidXRlIG1vZGlmaWVkLiBUaGlzIGNhbiBjYXVzZSBgICtcbiAgICAgICAgYHNsb3dlciBsb2FkaW5nIHBlcmZvcm1hbmNlLiBJdCBpcyByZWNvbW1lbmRlZCBub3QgdG8gbW9kaWZ5IHRoZSBcIm5nU3JjXCIgYCArXG4gICAgICAgIGBwcm9wZXJ0eSBvbiBhbnkgaW1hZ2Ugd2hpY2ggY291bGQgYmUgdGhlIExDUCBlbGVtZW50LmAsXG4gICAgKSxcbiAgKTtcbn1cbiJdfQ==