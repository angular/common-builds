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
                console.warn(formatRuntimeError(2955 /* RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY */, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` +
                    `element but was not marked "priority". This image should be marked ` +
                    `"priority" in order to prioritize its loading. ` +
                    `To fix this, add the "priority" attribute.`));
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
LCPImageObserver.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-37ce31f", ngImport: i0, type: LCPImageObserver, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
LCPImageObserver.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-37ce31f", ngImport: i0, type: LCPImageObserver, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-37ce31f", ngImport: i0, type: LCPImageObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNwX2ltYWdlX29ic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9sY3BfaW1hZ2Vfb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQWEsbUJBQW1CLElBQUksa0JBQWtCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFFbkQ7Ozs7Ozs7OztHQVNHO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQVMzQixZQUE4QixHQUFhO1FBUjNDLHNEQUFzRDtRQUM5QyxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDM0MsOERBQThEO1FBQ3RELGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVsQyxXQUFNLEdBQWdCLElBQUksQ0FBQztRQUMzQixhQUFRLEdBQTZCLElBQUksQ0FBQztRQUdoRCxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUM1QixJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsSUFBSSxPQUFPLG1CQUFtQixLQUFLLFdBQVcsRUFBRTtZQUM1RSxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQztJQUVELDBEQUEwRDtJQUMxRCwwREFBMEQ7SUFDbEQsdUJBQXVCO1FBQzdCLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNyRCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTztZQUNqQyxrRkFBa0Y7WUFDbEYsNEZBQTRGO1lBQzVGLHlGQUF5RjtZQUN6RixtRkFBbUY7WUFDbkYsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0Msb0VBQW9FO1lBQ3BFLE1BQU0sTUFBTSxHQUFJLFVBQWtCLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7WUFFdEQsbUZBQW1GO1lBQ25GLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztnQkFBRSxPQUFPO1lBRXJFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQixNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQix1REFFM0IsR0FBRyxnQkFBZ0Isb0RBQW9EO29CQUNuRSxxRUFBcUU7b0JBQ3JFLGlEQUFpRDtvQkFDakQsNENBQTRDLENBQUMsQ0FBQyxDQUFDO2FBQ3hEO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxhQUFhLENBQUMsWUFBb0IsRUFBRSxNQUFjO1FBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxlQUFlLENBQUMsWUFBb0I7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsQ0FBQzs7d0hBbEVVLGdCQUFnQixrQkFTUCxRQUFROzRIQVRqQixnQkFBZ0IsY0FESixNQUFNO3NHQUNsQixnQkFBZ0I7a0JBRDVCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzBEQVVLLFFBQVE7MEJBQTlCLE1BQU07MkJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtnZXRVcmwsIGltZ0RpcmVjdGl2ZURldGFpbHN9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGxvZ2ljIHRvIGRldGVjdCB3aGV0aGVyIGFuIGltYWdlIHdpdGggdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmVcbiAqIGlzIHRyZWF0ZWQgYXMgYW4gTENQIGVsZW1lbnQuIElmIHNvLCB2ZXJpZmllcyB0aGF0IHRoZSBpbWFnZSBpcyBtYXJrZWQgYXMgYSBwcmlvcml0eSxcbiAqIHVzaW5nIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKlxuICogQmFzZWQgb24gaHR0cHM6Ly93ZWIuZGV2L2xjcC8jbWVhc3VyZS1sY3AtaW4tamF2YXNjcmlwdC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTENQSW1hZ2VPYnNlcnZlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8vIE1hcCBvZiBmdWxsIGltYWdlIFVSTHMgLT4gb3JpZ2luYWwgYHJhd1NyY2AgdmFsdWVzLlxuICBwcml2YXRlIGltYWdlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIC8vIEtlZXAgdHJhY2sgb2YgaW1hZ2VzIGZvciB3aGljaCBgY29uc29sZS53YXJuYCB3YXMgcHJvZHVjZWQuXG4gIHByaXZhdGUgYWxyZWFkeVdhcm5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgd2luZG93OiBXaW5kb3d8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgb2JzZXJ2ZXI6IFBlcmZvcm1hbmNlT2JzZXJ2ZXJ8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgZG9jOiBEb2N1bWVudCkge1xuICAgIGFzc2VydERldk1vZGUoJ0xDUCBjaGVja2VyJyk7XG4gICAgY29uc3Qgd2luID0gZG9jLmRlZmF1bHRWaWV3O1xuICAgIGlmICh0eXBlb2Ygd2luICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgUGVyZm9ybWFuY2VPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgICAgdGhpcy5vYnNlcnZlciA9IHRoaXMuaW5pdFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbml0cyBQZXJmb3JtYW5jZU9ic2VydmVyIGFuZCBzdWJzY3JpYmVzIHRvIExDUCBldmVudHMuXG4gIC8vIEJhc2VkIG9uIGh0dHBzOi8vd2ViLmRldi9sY3AvI21lYXN1cmUtbGNwLWluLWphdmFzY3JpcHRcbiAgcHJpdmF0ZSBpbml0UGVyZm9ybWFuY2VPYnNlcnZlcigpOiBQZXJmb3JtYW5jZU9ic2VydmVyIHtcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBQZXJmb3JtYW5jZU9ic2VydmVyKChlbnRyeUxpc3QpID0+IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBlbnRyeUxpc3QuZ2V0RW50cmllcygpO1xuICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAvLyBOb3RlOiB3ZSB1c2UgdGhlIGxhdGVzdCBlbnRyeSBwcm9kdWNlZCBieSB0aGUgYFBlcmZvcm1hbmNlT2JzZXJ2ZXJgIGFzIHRoZSBiZXN0XG4gICAgICAvLyBzaWduYWwgb24gd2hpY2ggZWxlbWVudCBpcyBhY3R1YWxseSBhbiBMQ1Agb25lLiBBcyBhbiBleGFtcGxlLCB0aGUgZmlyc3QgaW1hZ2UgdG8gbG9hZCBvblxuICAgICAgLy8gYSBwYWdlLCBieSB2aXJ0dWUgb2YgYmVpbmcgdGhlIG9ubHkgdGhpbmcgb24gdGhlIHBhZ2Ugc28gZmFyLCBpcyBvZnRlbiBhIExDUCBjYW5kaWRhdGVcbiAgICAgIC8vIGFuZCBnZXRzIHJlcG9ydGVkIGJ5IFBlcmZvcm1hbmNlT2JzZXJ2ZXIsIGJ1dCBpc24ndCBuZWNlc3NhcmlseSB0aGUgTENQIGVsZW1lbnQuXG4gICAgICBjb25zdCBsY3BFbGVtZW50ID0gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdO1xuICAgICAgLy8gQ2FzdCB0byBgYW55YCBkdWUgdG8gbWlzc2luZyBgZWxlbWVudGAgb24gb2JzZXJ2ZWQgdHlwZSBvZiBlbnRyeS5cbiAgICAgIGNvbnN0IGltZ1NyYyA9IChsY3BFbGVtZW50IGFzIGFueSkuZWxlbWVudD8uc3JjID8/ICcnO1xuXG4gICAgICAvLyBFeGNsdWRlIGBkYXRhOmAgYW5kIGBibG9iOmAgVVJMcywgc2luY2UgdGhleSBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGlyZWN0aXZlLlxuICAgICAgaWYgKGltZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpIHx8IGltZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGltZ1Jhd1NyYyA9IHRoaXMuaW1hZ2VzLmdldChpbWdTcmMpO1xuICAgICAgaWYgKGltZ1Jhd1NyYyAmJiAhdGhpcy5hbHJlYWR5V2FybmVkLmhhcyhpbWdTcmMpKSB7XG4gICAgICAgIHRoaXMuYWxyZWFkeVdhcm5lZC5hZGQoaW1nU3JjKTtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlRGV0YWlscyA9IGltZ0RpcmVjdGl2ZURldGFpbHMoaW1nUmF3U3JjKTtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTENQX0lNR19NSVNTSU5HX1BSSU9SSVRZLFxuICAgICAgICAgICAgYCR7ZGlyZWN0aXZlRGV0YWlsc30gdGhpcyBpbWFnZSBpcyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGAgK1xuICAgICAgICAgICAgICAgIGBlbGVtZW50IGJ1dCB3YXMgbm90IG1hcmtlZCBcInByaW9yaXR5XCIuIFRoaXMgaW1hZ2Ugc2hvdWxkIGJlIG1hcmtlZCBgICtcbiAgICAgICAgICAgICAgICBgXCJwcmlvcml0eVwiIGluIG9yZGVyIHRvIHByaW9yaXRpemUgaXRzIGxvYWRpbmcuIGAgK1xuICAgICAgICAgICAgICAgIGBUbyBmaXggdGhpcywgYWRkIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlLmApKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKHt0eXBlOiAnbGFyZ2VzdC1jb250ZW50ZnVsLXBhaW50JywgYnVmZmVyZWQ6IHRydWV9KTtcbiAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gIH1cblxuICByZWdpc3RlckltYWdlKHJld3JpdHRlblNyYzogc3RyaW5nLCByYXdTcmM6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMuaW1hZ2VzLnNldChnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyEpLmhyZWYsIHJhd1NyYyk7XG4gIH1cblxuICB1bnJlZ2lzdGVySW1hZ2UocmV3cml0dGVuU3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHJldHVybjtcbiAgICB0aGlzLmltYWdlcy5kZWxldGUoZ2V0VXJsKHJld3JpdHRlblNyYywgdGhpcy53aW5kb3chKS5ocmVmKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5vYnNlcnZlcikgcmV0dXJuO1xuICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuaW1hZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5hbHJlYWR5V2FybmVkLmNsZWFyKCk7XG4gIH1cbn1cbiJdfQ==