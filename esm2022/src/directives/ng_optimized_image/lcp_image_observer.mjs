/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, ɵformatRuntimeError as formatRuntimeError } from '@angular/core';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-3cf18bb", ngImport: i0, type: LCPImageObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-3cf18bb", ngImport: i0, type: LCPImageObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-3cf18bb", ngImport: i0, type: LCPImageObserver, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNwX2ltYWdlX29ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9sY3BfaW1hZ2Vfb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQWEsbUJBQW1CLElBQUksa0JBQWtCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLE9BQU8sQ0FBQzs7QUFTN0I7Ozs7Ozs7OztHQVNHO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQU8zQjtRQU5BLHFEQUFxRDtRQUM3QyxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7UUFFL0MsV0FBTSxHQUFnQixJQUFJLENBQUM7UUFDM0IsYUFBUSxHQUE2QixJQUFJLENBQUM7UUFHaEQsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFDekMsSUFBSSxPQUFPLEdBQUcsS0FBSyxXQUFXLElBQUksT0FBTyxtQkFBbUIsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM3RSxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQ2pELENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssdUJBQXVCO1FBQzdCLE1B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RyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdEIsQ0FBQzt5SEFsRlUsZ0JBQWdCOzZIQUFoQixnQkFBZ0IsY0FESixNQUFNOztzR0FDbEIsZ0JBQWdCO2tCQUQ1QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7QUFzRmhDLFNBQVMsdUJBQXVCLENBQUMsS0FBYTtJQUM1QyxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLHVEQUU1QixHQUFHLGdCQUFnQixvREFBb0Q7UUFDbkUscUVBQXFFO1FBQ3JFLGlEQUFpRDtRQUNqRCw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsS0FBYTtJQUN2QyxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLHFEQUUzQixHQUFHLGdCQUFnQixvREFBb0Q7UUFDbkUscUVBQXFFO1FBQ3JFLDBFQUEwRTtRQUMxRSx1REFBdUQsQ0FBQyxDQUFDLENBQUM7QUFDcEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2dldFVybH0gZnJvbSAnLi91cmwnO1xuXG5pbnRlcmZhY2UgT2JzZXJ2ZWRJbWFnZVN0YXRlIHtcbiAgcHJpb3JpdHk6IGJvb2xlYW47XG4gIG1vZGlmaWVkOiBib29sZWFuO1xuICBhbHJlYWR5V2FybmVkUHJpb3JpdHk6IGJvb2xlYW47XG4gIGFscmVhZHlXYXJuZWRNb2RpZmllZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBPYnNlcnZlciB0aGF0IGRldGVjdHMgd2hldGhlciBhbiBpbWFnZSB3aXRoIGBOZ09wdGltaXplZEltYWdlYFxuICogaXMgdHJlYXRlZCBhcyBhIExhcmdlc3QgQ29udGVudGZ1bCBQYWludCAoTENQKSBlbGVtZW50LiBJZiBzbyxcbiAqIGFzc2VydHMgdGhhdCB0aGUgaW1hZ2UgaGFzIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcyBhbmQgaXQgZG9lcyBub3QgYXBwZWFyIGluIHByb2QgYnVuZGxlcyxcbiAqIHRodXMgdGhlcmUgaXMgbm8gYG5nRGV2TW9kZWAgdXNlIGluIHRoZSBjb2RlLlxuICpcbiAqIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHQuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIExDUEltYWdlT2JzZXJ2ZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvLyBNYXAgb2YgZnVsbCBpbWFnZSBVUkxzIC0+IG9yaWdpbmFsIGBuZ1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIGltYWdlcyA9IG5ldyBNYXA8c3RyaW5nLCBPYnNlcnZlZEltYWdlU3RhdGU+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvd3xudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBvYnNlcnZlcjogUGVyZm9ybWFuY2VPYnNlcnZlcnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBhc3NlcnREZXZNb2RlKCdMQ1AgY2hlY2tlcicpO1xuICAgIGNvbnN0IHdpbiA9IGluamVjdChET0NVTUVOVCkuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBQZXJmb3JtYW5jZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy53aW5kb3cgPSB3aW47XG4gICAgICB0aGlzLm9ic2VydmVyID0gdGhpcy5pbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0cyBQZXJmb3JtYW5jZU9ic2VydmVyIGFuZCBzdWJzY3JpYmVzIHRvIExDUCBldmVudHMuXG4gICAqIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHRcbiAgICovXG4gIHByaXZhdGUgaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTogUGVyZm9ybWFuY2VPYnNlcnZlciB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUGVyZm9ybWFuY2VPYnNlcnZlcigoZW50cnlMaXN0KSA9PiB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gZW50cnlMaXN0LmdldEVudHJpZXMoKTtcbiAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgLy8gV2UgdXNlIHRoZSBsYXRlc3QgZW50cnkgcHJvZHVjZWQgYnkgdGhlIGBQZXJmb3JtYW5jZU9ic2VydmVyYCBhcyB0aGUgYmVzdFxuICAgICAgLy8gc2lnbmFsIG9uIHdoaWNoIGVsZW1lbnQgaXMgYWN0dWFsbHkgYW4gTENQIG9uZS4gQXMgYW4gZXhhbXBsZSwgdGhlIGZpcnN0IGltYWdlIHRvIGxvYWQgb25cbiAgICAgIC8vIGEgcGFnZSwgYnkgdmlydHVlIG9mIGJlaW5nIHRoZSBvbmx5IHRoaW5nIG9uIHRoZSBwYWdlIHNvIGZhciwgaXMgb2Z0ZW4gYSBMQ1AgY2FuZGlkYXRlXG4gICAgICAvLyBhbmQgZ2V0cyByZXBvcnRlZCBieSBQZXJmb3JtYW5jZU9ic2VydmVyLCBidXQgaXNuJ3QgbmVjZXNzYXJpbHkgdGhlIExDUCBlbGVtZW50LlxuICAgICAgY29uc3QgbGNwRWxlbWVudCA9IGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXTtcblxuICAgICAgLy8gQ2FzdCB0byBgYW55YCBkdWUgdG8gbWlzc2luZyBgZWxlbWVudGAgb24gdGhlIGBMYXJnZXN0Q29udGVudGZ1bFBhaW50YCB0eXBlIG9mIGVudHJ5LlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9MYXJnZXN0Q29udGVudGZ1bFBhaW50XG4gICAgICBjb25zdCBpbWdTcmMgPSAobGNwRWxlbWVudCBhcyBhbnkpLmVsZW1lbnQ/LnNyYyA/PyAnJztcblxuICAgICAgLy8gRXhjbHVkZSBgZGF0YTpgIGFuZCBgYmxvYjpgIFVSTHMsIHNpbmNlIHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRpcmVjdGl2ZS5cbiAgICAgIGlmIChpbWdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSB8fCBpbWdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBpbWcgPSB0aGlzLmltYWdlcy5nZXQoaW1nU3JjKTtcbiAgICAgIGlmICghaW1nKSByZXR1cm47XG4gICAgICBpZiAoIWltZy5wcmlvcml0eSAmJiAhaW1nLmFscmVhZHlXYXJuZWRQcmlvcml0eSkge1xuICAgICAgICBpbWcuYWxyZWFkeVdhcm5lZFByaW9yaXR5ID0gdHJ1ZTtcbiAgICAgICAgbG9nTWlzc2luZ1ByaW9yaXR5RXJyb3IoaW1nU3JjKTtcbiAgICAgIH1cbiAgICAgIGlmIChpbWcubW9kaWZpZWQgJiYgIWltZy5hbHJlYWR5V2FybmVkTW9kaWZpZWQpIHtcbiAgICAgICAgaW1nLmFscmVhZHlXYXJuZWRNb2RpZmllZCA9IHRydWU7XG4gICAgICAgIGxvZ01vZGlmaWVkV2FybmluZyhpbWdTcmMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoe3R5cGU6ICdsYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQnLCBidWZmZXJlZDogdHJ1ZX0pO1xuICAgIHJldHVybiBvYnNlcnZlcjtcbiAgfVxuXG4gIHJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcsIG9yaWdpbmFsTmdTcmM6IHN0cmluZywgaXNQcmlvcml0eTogYm9vbGVhbikge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIGNvbnN0IG5ld09ic2VydmVkSW1hZ2VTdGF0ZTogT2JzZXJ2ZWRJbWFnZVN0YXRlID0ge1xuICAgICAgcHJpb3JpdHk6IGlzUHJpb3JpdHksXG4gICAgICBtb2RpZmllZDogZmFsc2UsXG4gICAgICBhbHJlYWR5V2FybmVkTW9kaWZpZWQ6IGZhbHNlLFxuICAgICAgYWxyZWFkeVdhcm5lZFByaW9yaXR5OiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5pbWFnZXMuc2V0KGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMud2luZG93ISkuaHJlZiwgbmV3T2JzZXJ2ZWRJbWFnZVN0YXRlKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLmRlbGV0ZShnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyEpLmhyZWYpO1xuICB9XG5cbiAgdXBkYXRlSW1hZ2Uob3JpZ2luYWxTcmM6IHN0cmluZywgbmV3U3JjOiBzdHJpbmcpIHtcbiAgICBjb25zdCBvcmlnaW5hbFVybCA9IGdldFVybChvcmlnaW5hbFNyYywgdGhpcy53aW5kb3chKS5ocmVmO1xuICAgIGNvbnN0IGltZyA9IHRoaXMuaW1hZ2VzLmdldChvcmlnaW5hbFVybCk7XG4gICAgaWYgKGltZykge1xuICAgICAgaW1nLm1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW1hZ2VzLnNldChnZXRVcmwobmV3U3JjLCB0aGlzLndpbmRvdyEpLmhyZWYsIGltZyk7XG4gICAgICB0aGlzLmltYWdlcy5kZWxldGUob3JpZ2luYWxVcmwpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuaW1hZ2VzLmNsZWFyKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nTWlzc2luZ1ByaW9yaXR5RXJyb3IobmdTcmM6IHN0cmluZykge1xuICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyhuZ1NyYyk7XG4gIGNvbnNvbGUuZXJyb3IoZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5MQ1BfSU1HX01JU1NJTkdfUFJJT1JJVFksXG4gICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfSB0aGlzIGltYWdlIGlzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgICAgYGVsZW1lbnQgYnV0IHdhcyBub3QgbWFya2VkIFwicHJpb3JpdHlcIi4gVGhpcyBpbWFnZSBzaG91bGQgYmUgbWFya2VkIGAgK1xuICAgICAgICAgIGBcInByaW9yaXR5XCIgaW4gb3JkZXIgdG8gcHJpb3JpdGl6ZSBpdHMgbG9hZGluZy4gYCArXG4gICAgICAgICAgYFRvIGZpeCB0aGlzLCBhZGQgdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUuYCkpO1xufVxuXG5mdW5jdGlvbiBsb2dNb2RpZmllZFdhcm5pbmcobmdTcmM6IHN0cmluZykge1xuICBjb25zdCBkaXJlY3RpdmVEZXRhaWxzID0gaW1nRGlyZWN0aXZlRGV0YWlscyhuZ1NyYyk7XG4gIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLkxDUF9JTUdfTkdTUkNfTU9ESUZJRUQsXG4gICAgICBgJHtkaXJlY3RpdmVEZXRhaWxzfSB0aGlzIGltYWdlIGlzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgICAgYGVsZW1lbnQgYW5kIGhhcyBoYWQgaXRzIFwibmdTcmNcIiBhdHRyaWJ1dGUgbW9kaWZpZWQuIFRoaXMgY2FuIGNhdXNlIGAgK1xuICAgICAgICAgIGBzbG93ZXIgbG9hZGluZyBwZXJmb3JtYW5jZS4gSXQgaXMgcmVjb21tZW5kZWQgbm90IHRvIG1vZGlmeSB0aGUgXCJuZ1NyY1wiIGAgK1xuICAgICAgICAgIGBwcm9wZXJ0eSBvbiBhbnkgaW1hZ2Ugd2hpY2ggY291bGQgYmUgdGhlIExDUCBlbGVtZW50LmApKTtcbn1cbiJdfQ==