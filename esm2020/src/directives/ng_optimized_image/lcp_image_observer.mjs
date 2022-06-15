/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, ɵformatRuntimeError as formatRuntimeError } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { getUrl, imgDirectiveDetails } from './util';
import * as i0 from "@angular/core";
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
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-485c6a7", ngImport: i0, type: LCPImageObserver, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-485c6a7", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.0+sha-485c6a7", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNwX2ltYWdlX29ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9sY3BfaW1hZ2Vfb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQWEsbUJBQW1CLElBQUksa0JBQWtCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFFbkQ7Ozs7Ozs7OztHQVNHO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQVMzQixZQUE4QixHQUFhO1FBUjNDLHNEQUFzRDtRQUM5QyxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDM0MsOERBQThEO1FBQ3RELGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVsQyxXQUFNLEdBQWdCLElBQUksQ0FBQztRQUMzQixhQUFRLEdBQTZCLElBQUksQ0FBQztRQUdoRCxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUM1QixJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsSUFBSSxPQUFPLG1CQUFtQixLQUFLLFdBQVcsRUFBRTtZQUM1RSxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQztJQUVELDBEQUEwRDtJQUMxRCwwREFBMEQ7SUFDbEQsdUJBQXVCO1FBQzdCLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNyRCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTztZQUNqQyxrRkFBa0Y7WUFDbEYsNEZBQTRGO1lBQzVGLHlGQUF5RjtZQUN6RixtRkFBbUY7WUFDbkYsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0Msb0VBQW9FO1lBQ3BFLE1BQU0sTUFBTSxHQUFJLFVBQWtCLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7WUFFdEQsbUZBQW1GO1lBQ25GLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztnQkFBRSxPQUFPO1lBRXJFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQixNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQix1REFFM0IsR0FBRyxnQkFBZ0IsaUVBQWlFO29CQUNoRixnRkFBZ0Y7b0JBQ2hGLCtEQUErRCxDQUFDLENBQUMsQ0FBQzthQUMzRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBRSwwQkFBMEIsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUNyRSxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsYUFBYSxDQUFDLFlBQW9CLEVBQUUsTUFBYztRQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsZUFBZSxDQUFDLFlBQW9CO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdCLENBQUM7O3dIQWpFVSxnQkFBZ0Isa0JBU1AsUUFBUTs0SEFUakIsZ0JBQWdCLGNBREosTUFBTTtzR0FDbEIsZ0JBQWdCO2tCQUQ1QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzswREFVSyxRQUFROzBCQUE5QixNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveSwgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7Z2V0VXJsLCBpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIENvbnRhaW5zIHRoZSBsb2dpYyB0byBkZXRlY3Qgd2hldGhlciBhbiBpbWFnZSB3aXRoIHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlXG4gKiBpcyB0cmVhdGVkIGFzIGFuIExDUCBlbGVtZW50LiBJZiBzbywgdmVyaWZpZXMgdGhhdCB0aGUgaW1hZ2UgaXMgbWFya2VkIGFzIGEgcHJpb3JpdHksXG4gKiB1c2luZyB0aGUgYHByaW9yaXR5YCBhdHRyaWJ1dGUuXG4gKlxuICogTm90ZTogdGhpcyBpcyBhIGRldi1tb2RlIG9ubHkgY2xhc3MsIHdoaWNoIHNob3VsZCBub3QgYXBwZWFyIGluIHByb2QgYnVuZGxlcyxcbiAqIHRodXMgdGhlcmUgaXMgbm8gYG5nRGV2TW9kZWAgdXNlIGluIHRoZSBjb2RlLlxuICpcbiAqIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHQuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIExDUEltYWdlT2JzZXJ2ZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvLyBNYXAgb2YgZnVsbCBpbWFnZSBVUkxzIC0+IG9yaWdpbmFsIGByYXdTcmNgIHZhbHVlcy5cbiAgcHJpdmF0ZSBpbWFnZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAvLyBLZWVwIHRyYWNrIG9mIGltYWdlcyBmb3Igd2hpY2ggYGNvbnNvbGUud2FybmAgd2FzIHByb2R1Y2VkLlxuICBwcml2YXRlIGFscmVhZHlXYXJuZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIHdpbmRvdzogV2luZG93fG51bGwgPSBudWxsO1xuICBwcml2YXRlIG9ic2VydmVyOiBQZXJmb3JtYW5jZU9ic2VydmVyfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIGRvYzogRG9jdW1lbnQpIHtcbiAgICBhc3NlcnREZXZNb2RlKCdMQ1AgY2hlY2tlcicpO1xuICAgIGNvbnN0IHdpbiA9IGRvYy5kZWZhdWx0VmlldztcbiAgICBpZiAodHlwZW9mIHdpbiAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICAgIHRoaXMub2JzZXJ2ZXIgPSB0aGlzLmluaXRQZXJmb3JtYW5jZU9ic2VydmVyKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gSW5pdHMgUGVyZm9ybWFuY2VPYnNlcnZlciBhbmQgc3Vic2NyaWJlcyB0byBMQ1AgZXZlbnRzLlxuICAvLyBCYXNlZCBvbiBodHRwczovL3dlYi5kZXYvbGNwLyNtZWFzdXJlLWxjcC1pbi1qYXZhc2NyaXB0XG4gIHByaXZhdGUgaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTogUGVyZm9ybWFuY2VPYnNlcnZlciB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUGVyZm9ybWFuY2VPYnNlcnZlcigoZW50cnlMaXN0KSA9PiB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gZW50cnlMaXN0LmdldEVudHJpZXMoKTtcbiAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgLy8gTm90ZTogd2UgdXNlIHRoZSBsYXRlc3QgZW50cnkgcHJvZHVjZWQgYnkgdGhlIGBQZXJmb3JtYW5jZU9ic2VydmVyYCBhcyB0aGUgYmVzdFxuICAgICAgLy8gc2lnbmFsIG9uIHdoaWNoIGVsZW1lbnQgaXMgYWN0dWFsbHkgYW4gTENQIG9uZS4gQXMgYW4gZXhhbXBsZSwgdGhlIGZpcnN0IGltYWdlIHRvIGxvYWQgb25cbiAgICAgIC8vIGEgcGFnZSwgYnkgdmlydHVlIG9mIGJlaW5nIHRoZSBvbmx5IHRoaW5nIG9uIHRoZSBwYWdlIHNvIGZhciwgaXMgb2Z0ZW4gYSBMQ1AgY2FuZGlkYXRlXG4gICAgICAvLyBhbmQgZ2V0cyByZXBvcnRlZCBieSBQZXJmb3JtYW5jZU9ic2VydmVyLCBidXQgaXNuJ3QgbmVjZXNzYXJpbHkgdGhlIExDUCBlbGVtZW50LlxuICAgICAgY29uc3QgbGNwRWxlbWVudCA9IGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXTtcbiAgICAgIC8vIENhc3QgdG8gYGFueWAgZHVlIHRvIG1pc3NpbmcgYGVsZW1lbnRgIG9uIG9ic2VydmVkIHR5cGUgb2YgZW50cnkuXG4gICAgICBjb25zdCBpbWdTcmMgPSAobGNwRWxlbWVudCBhcyBhbnkpLmVsZW1lbnQ/LnNyYyA/PyAnJztcblxuICAgICAgLy8gRXhjbHVkZSBgZGF0YTpgIGFuZCBgYmxvYjpgIFVSTHMsIHNpbmNlIHRoZXkgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRpcmVjdGl2ZS5cbiAgICAgIGlmIChpbWdTcmMuc3RhcnRzV2l0aCgnZGF0YTonKSB8fCBpbWdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBpbWdSYXdTcmMgPSB0aGlzLmltYWdlcy5nZXQoaW1nU3JjKTtcbiAgICAgIGlmIChpbWdSYXdTcmMgJiYgIXRoaXMuYWxyZWFkeVdhcm5lZC5oYXMoaW1nU3JjKSkge1xuICAgICAgICB0aGlzLmFscmVhZHlXYXJuZWQuYWRkKGltZ1NyYyk7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZURldGFpbHMgPSBpbWdEaXJlY3RpdmVEZXRhaWxzKGltZ1Jhd1NyYyk7XG4gICAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkxDUF9JTUdfTUlTU0lOR19QUklPUklUWSxcbiAgICAgICAgICAgIGAke2RpcmVjdGl2ZURldGFpbHN9OiB0aGUgaW1hZ2Ugd2FzIGRldGVjdGVkIGFzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgYCArXG4gICAgICAgICAgICAgICAgYGVsZW1lbnQsIHNvIGl0cyBsb2FkaW5nIHNob3VsZCBiZSBwcmlvcml0aXplZCBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZS4gUGxlYXNlIGAgK1xuICAgICAgICAgICAgICAgIGBhZGQgdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUgaWYgdGhpcyBpbWFnZSBpcyBhYm92ZSB0aGUgZm9sZC5gKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh7dHlwZTogJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCcsIGJ1ZmZlcmVkOiB0cnVlfSk7XG4gICAgcmV0dXJuIG9ic2VydmVyO1xuICB9XG5cbiAgcmVnaXN0ZXJJbWFnZShyZXdyaXR0ZW5TcmM6IHN0cmluZywgcmF3U3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5zZXQoZ2V0VXJsKHJld3JpdHRlblNyYywgdGhpcy53aW5kb3chKS5ocmVmLCByYXdTcmMpO1xuICB9XG5cbiAgdW5yZWdpc3RlckltYWdlKHJld3JpdHRlblNyYzogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyKSByZXR1cm47XG4gICAgdGhpcy5pbWFnZXMuZGVsZXRlKGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMud2luZG93ISkuaHJlZik7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLmltYWdlcy5jbGVhcigpO1xuICAgIHRoaXMuYWxyZWFkeVdhcm5lZC5jbGVhcigpO1xuICB9XG59XG4iXX0=