/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { imgDirectiveDetails } from './error_helper';
import { getUrl } from './url';
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
        assertDevMode('LCP checker');
        const win = inject(DOCUMENT).defaultView;
        if (typeof win !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
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
                throwMissingPriorityError(imgSrc);
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
            alreadyWarnedPriority: false
        };
        this.images.set(getUrl(rewrittenSrc, this.window).href, newObservedImageState);
    }
    unregisterImage(rewrittenSrc) {
        if (!this.observer)
            return;
        this.images.delete(getUrl(rewrittenSrc, this.window).href);
    }
    updateImage(originalSrc, newSrc) {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-next.4+sha-9bd1551", ngImport: i0, type: LCPImageObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.0-next.4+sha-9bd1551", ngImport: i0, type: LCPImageObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-next.4+sha-9bd1551", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return []; } });
function throwMissingPriorityError(ngSrc) {
    const directiveDetails = imgDirectiveDetails(ngSrc);
    throw new RuntimeError(2955 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) element ` +
        `but was not marked "priority". This can have a strong negative impact ` +
        `on the LCP score of the entire application. This error can be fixed by ` +
        `adding the 'priority' attribute to all images which are possibly the LCP element.`);
}
function logModifiedWarning(ngSrc) {
    const directiveDetails = imgDirectiveDetails(ngSrc);
    console.warn(formatRuntimeError(2964 /* RuntimeErrorCode.LCP_IMG_NGSRC_MODIFIED */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
        `element and has had its "ngSrc" attribute modified. This can cause ` +
        `slower loading performance. It is recommended not to modify the "ngSrc" ` +
        `property on any image which could be the LCP element.`));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNwX2ltYWdlX29ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9sY3BfaW1hZ2Vfb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQWEsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV0SSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHMUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDOztBQVM3Qjs7Ozs7Ozs7O0dBU0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBTzNCO1FBTkEscURBQXFEO1FBQzdDLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQUUvQyxXQUFNLEdBQWdCLElBQUksQ0FBQztRQUMzQixhQUFRLEdBQTZCLElBQUksQ0FBQztRQUdoRCxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUN6QyxJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsSUFBSSxPQUFPLG1CQUFtQixLQUFLLFdBQVcsRUFBRTtZQUM1RSxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHVCQUF1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eEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDakM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3RCLENBQUM7eUhBbEZVLGdCQUFnQjs2SEFBaEIsZ0JBQWdCLGNBREosTUFBTTs7c0dBQ2xCLGdCQUFnQjtrQkFENUIsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBc0ZoQyxTQUFTLHlCQUF5QixDQUFDLEtBQWE7SUFDOUMsTUFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRCxNQUFNLElBQUksWUFBWSx1REFFbEIsR0FBRyxnQkFBZ0IsNERBQTREO1FBQzNFLHdFQUF3RTtRQUN4RSx5RUFBeUU7UUFDekUsbUZBQW1GLENBQUMsQ0FBQztBQUMvRixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxLQUFhO0lBQ3ZDLE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEQsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IscURBRTNCLEdBQUcsZ0JBQWdCLG9EQUFvRDtRQUNuRSxxRUFBcUU7UUFDckUsMEVBQTBFO1FBQzFFLHVEQUF1RCxDQUFDLENBQUMsQ0FBQztBQUNwRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtnZXRVcmx9IGZyb20gJy4vdXJsJztcblxuaW50ZXJmYWNlIE9ic2VydmVkSW1hZ2VTdGF0ZSB7XG4gIHByaW9yaXR5OiBib29sZWFuO1xuICBtb2RpZmllZDogYm9vbGVhbjtcbiAgYWxyZWFkeVdhcm5lZFByaW9yaXR5OiBib29sZWFuO1xuICBhbHJlYWR5V2FybmVkTW9kaWZpZWQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogT2JzZXJ2ZXIgdGhhdCBkZXRlY3RzIHdoZXRoZXIgYW4gaW1hZ2Ugd2l0aCBgTmdPcHRpbWl6ZWRJbWFnZWBcbiAqIGlzIHRyZWF0ZWQgYXMgYSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgZWxlbWVudC4gSWYgc28sXG4gKiBhc3NlcnRzIHRoYXQgdGhlIGltYWdlIGhhcyB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUuXG4gKlxuICogTm90ZTogdGhpcyBpcyBhIGRldi1tb2RlIG9ubHkgY2xhc3MgYW5kIGl0IGRvZXMgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqXG4gKiBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0LlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBMQ1BJbWFnZU9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLy8gTWFwIG9mIGZ1bGwgaW1hZ2UgVVJMcyAtPiBvcmlnaW5hbCBgbmdTcmNgIHZhbHVlcy5cbiAgcHJpdmF0ZSBpbWFnZXMgPSBuZXcgTWFwPHN0cmluZywgT2JzZXJ2ZWRJbWFnZVN0YXRlPigpO1xuXG4gIHByaXZhdGUgd2luZG93OiBXaW5kb3d8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgb2JzZXJ2ZXI6IFBlcmZvcm1hbmNlT2JzZXJ2ZXJ8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgYXNzZXJ0RGV2TW9kZSgnTENQIGNoZWNrZXInKTtcbiAgICBjb25zdCB3aW4gPSBpbmplY3QoRE9DVU1FTlQpLmRlZmF1bHRWaWV3O1xuICAgIGlmICh0eXBlb2Ygd2luICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgUGVyZm9ybWFuY2VPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgICAgdGhpcy5vYnNlcnZlciA9IHRoaXMuaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5pdHMgUGVyZm9ybWFuY2VPYnNlcnZlciBhbmQgc3Vic2NyaWJlcyB0byBMQ1AgZXZlbnRzLlxuICAgKiBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0XG4gICAqL1xuICBwcml2YXRlIGluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk6IFBlcmZvcm1hbmNlT2JzZXJ2ZXIge1xuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKGVudHJ5TGlzdCkgPT4ge1xuICAgICAgY29uc3QgZW50cmllcyA9IGVudHJ5TGlzdC5nZXRFbnRyaWVzKCk7XG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgIC8vIFdlIHVzZSB0aGUgbGF0ZXN0IGVudHJ5IHByb2R1Y2VkIGJ5IHRoZSBgUGVyZm9ybWFuY2VPYnNlcnZlcmAgYXMgdGhlIGJlc3RcbiAgICAgIC8vIHNpZ25hbCBvbiB3aGljaCBlbGVtZW50IGlzIGFjdHVhbGx5IGFuIExDUCBvbmUuIEFzIGFuIGV4YW1wbGUsIHRoZSBmaXJzdCBpbWFnZSB0byBsb2FkIG9uXG4gICAgICAvLyBhIHBhZ2UsIGJ5IHZpcnR1ZSBvZiBiZWluZyB0aGUgb25seSB0aGluZyBvbiB0aGUgcGFnZSBzbyBmYXIsIGlzIG9mdGVuIGEgTENQIGNhbmRpZGF0ZVxuICAgICAgLy8gYW5kIGdldHMgcmVwb3J0ZWQgYnkgUGVyZm9ybWFuY2VPYnNlcnZlciwgYnV0IGlzbid0IG5lY2Vzc2FyaWx5IHRoZSBMQ1AgZWxlbWVudC5cbiAgICAgIGNvbnN0IGxjcEVsZW1lbnQgPSBlbnRyaWVzW2VudHJpZXMubGVuZ3RoIC0gMV07XG5cbiAgICAgIC8vIENhc3QgdG8gYGFueWAgZHVlIHRvIG1pc3NpbmcgYGVsZW1lbnRgIG9uIHRoZSBgTGFyZ2VzdENvbnRlbnRmdWxQYWludGAgdHlwZSBvZiBlbnRyeS5cbiAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTGFyZ2VzdENvbnRlbnRmdWxQYWludFxuICAgICAgY29uc3QgaW1nU3JjID0gKGxjcEVsZW1lbnQgYXMgYW55KS5lbGVtZW50Py5zcmMgPz8gJyc7XG5cbiAgICAgIC8vIEV4Y2x1ZGUgYGRhdGE6YCBhbmQgYGJsb2I6YCBVUkxzLCBzaW5jZSB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBkaXJlY3RpdmUuXG4gICAgICBpZiAoaW1nU3JjLnN0YXJ0c1dpdGgoJ2RhdGE6JykgfHwgaW1nU3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHJldHVybjtcblxuICAgICAgY29uc3QgaW1nID0gdGhpcy5pbWFnZXMuZ2V0KGltZ1NyYyk7XG4gICAgICBpZiAoIWltZykgcmV0dXJuO1xuICAgICAgaWYgKCFpbWcucHJpb3JpdHkgJiYgIWltZy5hbHJlYWR5V2FybmVkUHJpb3JpdHkpIHtcbiAgICAgICAgaW1nLmFscmVhZHlXYXJuZWRQcmlvcml0eSA9IHRydWU7XG4gICAgICAgIHRocm93TWlzc2luZ1ByaW9yaXR5RXJyb3IoaW1nU3JjKTtcbiAgICAgIH1cbiAgICAgIGlmIChpbWcubW9kaWZpZWQgJiYgIWltZy5hbHJlYWR5V2FybmVkTW9kaWZpZWQpIHtcbiAgICAgICAgaW1nLmFscmVhZHlXYXJuZWRNb2RpZmllZCA9IHRydWU7XG4gICAgICAgIGxvZ01vZGlmaWVkV2FybmluZyhpbWdTcmMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoe3R5cGU6ICdsYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQnLCBidWZmZXJlZDogdHJ1ZX0pO1xuICAgIHJldHVybiBvYnNlcnZlcjtcbiAgfVxuXG4gIHJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcsIG9yaWdpbmFsTmdTcmM6IHN0cmluZywgaXNQcmlvcml0eTogYm9vbGVhbikge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIGNvbnN0IG5ld09ic2VydmVkSW1hZ2VTdGF0ZTogT2JzZXJ2ZWRJbWFnZVN0YXRlID0ge1xuICAgICAgcHJpb3JpdHk6IGlzUHJpb3JpdHksXG4gICAgICBtb2RpZmllZDogZmFsc2UsXG4gICAgICBhbHJlYWR5V2FybmVkTW9kaWZpZWQ6IGZhbHNlLFxuICAgICAgYWxyZWFkeVdhcm5lZFByaW9yaXR5OiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5pbWFnZXMuc2V0KGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMud2luZG93ISkuaHJlZiwgbmV3T2JzZXJ2ZWRJbWFnZVN0YXRlKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLmRlbGV0ZShnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyEpLmhyZWYpO1xuICB9XG5cbiAgdXBkYXRlSW1hZ2Uob3JpZ2luYWxTcmM6IHN0cmluZywgbmV3U3JjOiBzdHJpbmcpIHtcbiAgICBjb25zdCBvcmlnaW5hbFVybCA9IGdldFVybChvcmlnaW5hbFNyYywgdGhpcy53aW5kb3chKS5ocmVmO1xuICAgIGNvbnN0IGltZyA9IHRoaXMuaW1hZ2VzLmdldChvcmlnaW5hbFVybCk7XG4gICAgaWYgKGltZykge1xuICAgICAgaW1nLm1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW1hZ2VzLnNldChnZXRVcmwobmV3U3JjLCB0aGlzLndpbmRvdyEpLmhyZWYsIGltZyk7XG4gICAgICB0aGlzLmltYWdlcy5kZWxldGUob3JpZ2luYWxVcmwpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuaW1hZ2VzLmNsZWFyKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdGhyb3dNaXNzaW5nUHJpb3JpdHlFcnJvcihuZ1NyYzogc3RyaW5nKSB7XG4gIGNvbnN0IGRpcmVjdGl2ZURldGFpbHMgPSBpbWdEaXJlY3RpdmVEZXRhaWxzKG5nU3JjKTtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTENQX0lNR19NSVNTSU5HX1BSSU9SSVRZLFxuICAgICAgYCR7ZGlyZWN0aXZlRGV0YWlsc30gdGhpcyBpbWFnZSBpcyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGVsZW1lbnQgYCArXG4gICAgICAgICAgYGJ1dCB3YXMgbm90IG1hcmtlZCBcInByaW9yaXR5XCIuIFRoaXMgY2FuIGhhdmUgYSBzdHJvbmcgbmVnYXRpdmUgaW1wYWN0IGAgK1xuICAgICAgICAgIGBvbiB0aGUgTENQIHNjb3JlIG9mIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uIFRoaXMgZXJyb3IgY2FuIGJlIGZpeGVkIGJ5IGAgK1xuICAgICAgICAgIGBhZGRpbmcgdGhlICdwcmlvcml0eScgYXR0cmlidXRlIHRvIGFsbCBpbWFnZXMgd2hpY2ggYXJlIHBvc3NpYmx5IHRoZSBMQ1AgZWxlbWVudC5gKTtcbn1cblxuZnVuY3Rpb24gbG9nTW9kaWZpZWRXYXJuaW5nKG5nU3JjOiBzdHJpbmcpIHtcbiAgY29uc3QgZGlyZWN0aXZlRGV0YWlscyA9IGltZ0RpcmVjdGl2ZURldGFpbHMobmdTcmMpO1xuICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5MQ1BfSU1HX05HU1JDX01PRElGSUVELFxuICAgICAgYCR7ZGlyZWN0aXZlRGV0YWlsc30gdGhpcyBpbWFnZSBpcyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGAgK1xuICAgICAgICAgIGBlbGVtZW50IGFuZCBoYXMgaGFkIGl0cyBcIm5nU3JjXCIgYXR0cmlidXRlIG1vZGlmaWVkLiBUaGlzIGNhbiBjYXVzZSBgICtcbiAgICAgICAgICBgc2xvd2VyIGxvYWRpbmcgcGVyZm9ybWFuY2UuIEl0IGlzIHJlY29tbWVuZGVkIG5vdCB0byBtb2RpZnkgdGhlIFwibmdTcmNcIiBgICtcbiAgICAgICAgICBgcHJvcGVydHkgb24gYW55IGltYWdlIHdoaWNoIGNvdWxkIGJlIHRoZSBMQ1AgZWxlbWVudC5gKSk7XG59XG4iXX0=