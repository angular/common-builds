/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, InjectionToken, ɵformatRuntimeError as formatRuntimeError, } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { imgDirectiveDetails } from './error_helper';
import { extractHostname, getUrl } from './url';
import * as i0 from "@angular/core";
// Set of origins that are always excluded from the preconnect checks.
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
/**
 * Injection token to configure which origins should be excluded
 * from the preconnect checks. It can either be a single string or an array of strings
 * to represent a group of origins, for example:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'}
 * ```
 *
 * or:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST,
 *   useValue: ['https://your-domain-1.com', 'https://your-domain-2.com']}
 * ```
 *
 * @publicApi
 */
export const PRECONNECT_CHECK_BLOCKLIST = new InjectionToken(ngDevMode ? 'PRECONNECT_CHECK_BLOCKLIST' : '');
/**
 * Contains the logic to detect whether an image, marked with the "priority" attribute
 * has a corresponding `<link rel="preconnect">` tag in the `document.head`.
 *
 * Note: this is a dev-mode only class, which should not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 */
export class PreconnectLinkChecker {
    constructor() {
        this.document = inject(DOCUMENT);
        /**
         * Set of <link rel="preconnect"> tags found on this page.
         * The `null` value indicates that there was no DOM query operation performed.
         */
        this.preconnectLinks = null;
        /*
         * Keep track of all already seen origin URLs to avoid repeating the same check.
         */
        this.alreadySeen = new Set();
        this.window = null;
        this.blocklist = new Set(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);
        assertDevMode('preconnect link checker');
        const win = this.document.defaultView;
        if (typeof win !== 'undefined') {
            this.window = win;
        }
        const blocklist = inject(PRECONNECT_CHECK_BLOCKLIST, { optional: true });
        if (blocklist) {
            this.populateBlocklist(blocklist);
        }
    }
    populateBlocklist(origins) {
        if (Array.isArray(origins)) {
            deepForEach(origins, (origin) => {
                this.blocklist.add(extractHostname(origin));
            });
        }
        else {
            this.blocklist.add(extractHostname(origins));
        }
    }
    /**
     * Checks that a preconnect resource hint exists in the head for the
     * given src.
     *
     * @param rewrittenSrc src formatted with loader
     * @param originalNgSrc ngSrc value
     */
    assertPreconnect(rewrittenSrc, originalNgSrc) {
        if (!this.window)
            return;
        const imgUrl = getUrl(rewrittenSrc, this.window);
        if (this.blocklist.has(imgUrl.hostname) || this.alreadySeen.has(imgUrl.origin))
            return;
        // Register this origin as seen, so we don't check it again later.
        this.alreadySeen.add(imgUrl.origin);
        // Note: we query for preconnect links only *once* and cache the results
        // for the entire lifespan of an application, since it's unlikely that the
        // list would change frequently. This allows to make sure there are no
        // performance implications of making extra DOM lookups for each image.
        this.preconnectLinks ??= this.queryPreconnectLinks();
        if (!this.preconnectLinks.has(imgUrl.origin)) {
            console.warn(formatRuntimeError(2956 /* RuntimeErrorCode.PRIORITY_IMG_MISSING_PRECONNECT_TAG */, `${imgDirectiveDetails(originalNgSrc)} there is no preconnect tag present for this ` +
                `image. Preconnecting to the origin(s) that serve priority images ensures that these ` +
                `images are delivered as soon as possible. To fix this, please add the following ` +
                `element into the <head> of the document:\n` +
                `  <link rel="preconnect" href="${imgUrl.origin}">`));
        }
    }
    queryPreconnectLinks() {
        const preconnectUrls = new Set();
        const selector = 'link[rel=preconnect]';
        const links = Array.from(this.document.querySelectorAll(selector));
        for (let link of links) {
            const url = getUrl(link.href, this.window);
            preconnectUrls.add(url.origin);
        }
        return preconnectUrls;
    }
    ngOnDestroy() {
        this.preconnectLinks?.clear();
        this.alreadySeen.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.0+sha-331b30e", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.0+sha-331b30e", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.0+sha-331b30e", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
/**
 * Invokes a callback for each element in the array. Also invokes a callback
 * recursively for each nested array.
 */
function deepForEach(input, fn) {
    for (let value of input) {
        Array.isArray(value) ? deepForEach(value, fn) : fn(value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxtQkFBbUIsSUFBSSxrQkFBa0IsR0FFMUMsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUMsTUFBTSxPQUFPLENBQUM7O0FBRTlDLHNFQUFzRTtBQUN0RSxNQUFNLG1DQUFtQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTNGOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLElBQUksY0FBYyxDQUMxRCxTQUFTLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQzlDLENBQUM7QUFFRjs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBa0JoQztRQWpCUSxhQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBDOzs7V0FHRztRQUNLLG9CQUFlLEdBQXVCLElBQUksQ0FBQztRQUVuRDs7V0FFRztRQUNLLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVoQyxXQUFNLEdB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LE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLENBQUM7eUhBMUZVLHFCQUFxQjs2SEFBckIscUJBQXFCLGNBRFQsTUFBTTs7c0dBQ2xCLHFCQUFxQjtrQkFEakMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBOEZoQzs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBSSxLQUFvQixFQUFFLEVBQXNCO0lBQ2xFLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxFQUFFLENBQUM7UUFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVELENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtleHRyYWN0SG9zdG5hbWUsIGdldFVybH0gZnJvbSAnLi91cmwnO1xuXG4vLyBTZXQgb2Ygb3JpZ2lucyB0aGF0IGFyZSBhbHdheXMgZXhjbHVkZWQgZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuXG5jb25zdCBJTlRFUk5BTF9QUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCA9IG5ldyBTZXQoWydsb2NhbGhvc3QnLCAnMTI3LjAuMC4xJywgJzAuMC4wLjAnXSk7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRvIGNvbmZpZ3VyZSB3aGljaCBvcmlnaW5zIHNob3VsZCBiZSBleGNsdWRlZFxuICogZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuIEl0IGNhbiBlaXRoZXIgYmUgYSBzaW5nbGUgc3RyaW5nIG9yIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAqIHRvIHJlcHJlc2VudCBhIGdyb3VwIG9mIG9yaWdpbnMsIGZvciBleGFtcGxlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICB7cHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIHVzZVZhbHVlOiAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20nfVxuICogYGBgXG4gKlxuICogb3I6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCxcbiAqICAgdXNlVmFsdWU6IFsnaHR0cHM6Ly95b3VyLWRvbWFpbi0xLmNvbScsICdodHRwczovL3lvdXItZG9tYWluLTIuY29tJ119XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxBcnJheTxzdHJpbmcgfCBzdHJpbmdbXT4+KFxuICBuZ0Rldk1vZGUgPyAnUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QnIDogJycsXG4pO1xuXG4vKipcbiAqIENvbnRhaW5zIHRoZSBsb2dpYyB0byBkZXRlY3Qgd2hldGhlciBhbiBpbWFnZSwgbWFya2VkIHdpdGggdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGVcbiAqIGhhcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gIHRhZyBpbiB0aGUgYGRvY3VtZW50LmhlYWRgLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgYSBkZXYtbW9kZSBvbmx5IGNsYXNzLCB3aGljaCBzaG91bGQgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUHJlY29ubmVjdExpbmtDaGVja2VyIHtcbiAgcHJpdmF0ZSBkb2N1bWVudCA9IGluamVjdChET0NVTUVOVCk7XG5cbiAgLyoqXG4gICAqIFNldCBvZiA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+IHRhZ3MgZm91bmQgb24gdGhpcyBwYWdlLlxuICAgKiBUaGUgYG51bGxgIHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZXJlIHdhcyBubyBET00gcXVlcnkgb3BlcmF0aW9uIHBlcmZvcm1lZC5cbiAgICovXG4gIHByaXZhdGUgcHJlY29ubmVjdExpbmtzOiBTZXQ8c3RyaW5nPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qXG4gICAqIEtlZXAgdHJhY2sgb2YgYWxsIGFscmVhZHkgc2VlbiBvcmlnaW4gVVJMcyB0byBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgY2hlY2suXG4gICAqL1xuICBwcml2YXRlIGFscmVhZHlTZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvdyB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgYmxvY2tsaXN0ID0gbmV3IFNldDxzdHJpbmc+KElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBhc3NlcnREZXZNb2RlKCdwcmVjb25uZWN0IGxpbmsgY2hlY2tlcicpO1xuICAgIGNvbnN0IHdpbiA9IHRoaXMuZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICB9XG4gICAgY29uc3QgYmxvY2tsaXN0ID0gaW5qZWN0KFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICBpZiAoYmxvY2tsaXN0KSB7XG4gICAgICB0aGlzLnBvcHVsYXRlQmxvY2tsaXN0KGJsb2NrbGlzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwb3B1bGF0ZUJsb2NrbGlzdChvcmlnaW5zOiBBcnJheTxzdHJpbmcgfCBzdHJpbmdbXT4gfCBzdHJpbmcpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcmlnaW5zKSkge1xuICAgICAgZGVlcEZvckVhY2gob3JpZ2lucywgKG9yaWdpbikgPT4ge1xuICAgICAgICB0aGlzLmJsb2NrbGlzdC5hZGQoZXh0cmFjdEhvc3RuYW1lKG9yaWdpbikpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYmxvY2tsaXN0LmFkZChleHRyYWN0SG9zdG5hbWUob3JpZ2lucykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhhdCBhIHByZWNvbm5lY3QgcmVzb3VyY2UgaGludCBleGlzdHMgaW4gdGhlIGhlYWQgZm9yIHRoZVxuICAgKiBnaXZlbiBzcmMuXG4gICAqXG4gICAqIEBwYXJhbSByZXdyaXR0ZW5TcmMgc3JjIGZvcm1hdHRlZCB3aXRoIGxvYWRlclxuICAgKiBAcGFyYW0gb3JpZ2luYWxOZ1NyYyBuZ1NyYyB2YWx1ZVxuICAgKi9cbiAgYXNzZXJ0UHJlY29ubmVjdChyZXdyaXR0ZW5TcmM6IHN0cmluZywgb3JpZ2luYWxOZ1NyYzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndpbmRvdykgcmV0dXJuO1xuXG4gICAgY29uc3QgaW1nVXJsID0gZ2V0VXJsKHJld3JpdHRlblNyYywgdGhpcy53aW5kb3cpO1xuICAgIGlmICh0aGlzLmJsb2NrbGlzdC5oYXMoaW1nVXJsLmhvc3RuYW1lKSB8fCB0aGlzLmFscmVhZHlTZWVuLmhhcyhpbWdVcmwub3JpZ2luKSkgcmV0dXJuO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhpcyBvcmlnaW4gYXMgc2Vlbiwgc28gd2UgZG9uJ3QgY2hlY2sgaXQgYWdhaW4gbGF0ZXIuXG4gICAgdGhpcy5hbHJlYWR5U2Vlbi5hZGQoaW1nVXJsLm9yaWdpbik7XG5cbiAgICAvLyBOb3RlOiB3ZSBxdWVyeSBmb3IgcHJlY29ubmVjdCBsaW5rcyBvbmx5ICpvbmNlKiBhbmQgY2FjaGUgdGhlIHJlc3VsdHNcbiAgICAvLyBmb3IgdGhlIGVudGlyZSBsaWZlc3BhbiBvZiBhbiBhcHBsaWNhdGlvbiwgc2luY2UgaXQncyB1bmxpa2VseSB0aGF0IHRoZVxuICAgIC8vIGxpc3Qgd291bGQgY2hhbmdlIGZyZXF1ZW50bHkuIFRoaXMgYWxsb3dzIHRvIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm9cbiAgICAvLyBwZXJmb3JtYW5jZSBpbXBsaWNhdGlvbnMgb2YgbWFraW5nIGV4dHJhIERPTSBsb29rdXBzIGZvciBlYWNoIGltYWdlLlxuICAgIHRoaXMucHJlY29ubmVjdExpbmtzID8/PSB0aGlzLnF1ZXJ5UHJlY29ubmVjdExpbmtzKCk7XG5cbiAgICBpZiAoIXRoaXMucHJlY29ubmVjdExpbmtzLmhhcyhpbWdVcmwub3JpZ2luKSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5QUklPUklUWV9JTUdfTUlTU0lOR19QUkVDT05ORUNUX1RBRyxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKG9yaWdpbmFsTmdTcmMpfSB0aGVyZSBpcyBubyBwcmVjb25uZWN0IHRhZyBwcmVzZW50IGZvciB0aGlzIGAgK1xuICAgICAgICAgICAgYGltYWdlLiBQcmVjb25uZWN0aW5nIHRvIHRoZSBvcmlnaW4ocykgdGhhdCBzZXJ2ZSBwcmlvcml0eSBpbWFnZXMgZW5zdXJlcyB0aGF0IHRoZXNlIGAgK1xuICAgICAgICAgICAgYGltYWdlcyBhcmUgZGVsaXZlcmVkIGFzIHNvb24gYXMgcG9zc2libGUuIFRvIGZpeCB0aGlzLCBwbGVhc2UgYWRkIHRoZSBmb2xsb3dpbmcgYCArXG4gICAgICAgICAgICBgZWxlbWVudCBpbnRvIHRoZSA8aGVhZD4gb2YgdGhlIGRvY3VtZW50OlxcbmAgK1xuICAgICAgICAgICAgYCAgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiIGhyZWY9XCIke2ltZ1VybC5vcmlnaW59XCI+YCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBxdWVyeVByZWNvbm5lY3RMaW5rcygpOiBTZXQ8c3RyaW5nPiB7XG4gICAgY29uc3QgcHJlY29ubmVjdFVybHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBzZWxlY3RvciA9ICdsaW5rW3JlbD1wcmVjb25uZWN0XSc7XG4gICAgY29uc3QgbGlua3M6IEhUTUxMaW5rRWxlbWVudFtdID0gQXJyYXkuZnJvbSh0aGlzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICBmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XG4gICAgICBjb25zdCB1cmwgPSBnZXRVcmwobGluay5ocmVmLCB0aGlzLndpbmRvdyEpO1xuICAgICAgcHJlY29ubmVjdFVybHMuYWRkKHVybC5vcmlnaW4pO1xuICAgIH1cbiAgICByZXR1cm4gcHJlY29ubmVjdFVybHM7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnByZWNvbm5lY3RMaW5rcz8uY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlTZWVuLmNsZWFyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgYXJyYXkuIEFsc28gaW52b2tlcyBhIGNhbGxiYWNrXG4gKiByZWN1cnNpdmVseSBmb3IgZWFjaCBuZXN0ZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGRlZXBGb3JFYWNoPFQ+KGlucHV0OiAoVCB8IGFueVtdKVtdLCBmbjogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZCB7XG4gIGZvciAobGV0IHZhbHVlIG9mIGlucHV0KSB7XG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyBkZWVwRm9yRWFjaCh2YWx1ZSwgZm4pIDogZm4odmFsdWUpO1xuICB9XG59XG4iXX0=