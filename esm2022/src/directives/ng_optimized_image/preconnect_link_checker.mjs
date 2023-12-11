/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, InjectionToken, ɵformatRuntimeError as formatRuntimeError } from '@angular/core';
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
export const PRECONNECT_CHECK_BLOCKLIST = new InjectionToken('PRECONNECT_CHECK_BLOCKLIST');
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
            deepForEach(origins, origin => {
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
        if (!this.preconnectLinks) {
            // Note: we query for preconnect links only *once* and cache the results
            // for the entire lifespan of an application, since it's unlikely that the
            // list would change frequently. This allows to make sure there are no
            // performance implications of making extra DOM lookups for each image.
            this.preconnectLinks = this.queryPreconnectLinks();
        }
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.3+sha-f9731ee", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.3+sha-f9731ee", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.3+sha-f9731ee", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsSUFBSSxrQkFBa0IsRUFBZ0MsTUFBTSxlQUFlLENBQUM7QUFFM0ksT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUMsTUFBTSxPQUFPLENBQUM7O0FBRTlDLHNFQUFzRTtBQUN0RSxNQUFNLG1DQUFtQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTNGOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUNuQyxJQUFJLGNBQWMsQ0FBeUIsNEJBQTRCLENBQUMsQ0FBQztBQUU3RTs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBa0JoQztRQWpCUSxhQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBDOzs7V0FHRztRQUNLLG9CQUFlLEdBQXFCLElBQUksQ0FBQztRQUVqRDs7V0FFRztRQUNLLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVoQyxXQUFNLEdBQWdCLElBQUksQ0FBQztRQUUzQixjQUFTLEdBQUcsSUFBSSxHQUFH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QUM7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO3lIQXpGVSxxQkFBcUI7NkhBQXJCLHFCQUFxQixjQURULE1BQU07O3NHQUNsQixxQkFBcUI7a0JBRGpDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOztBQTZGaEM7OztHQUdHO0FBQ0gsU0FBUyxXQUFXLENBQUksS0FBa0IsRUFBRSxFQUFzQjtJQUNoRSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtleHRyYWN0SG9zdG5hbWUsIGdldFVybH0gZnJvbSAnLi91cmwnO1xuXG4vLyBTZXQgb2Ygb3JpZ2lucyB0aGF0IGFyZSBhbHdheXMgZXhjbHVkZWQgZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuXG5jb25zdCBJTlRFUk5BTF9QUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCA9IG5ldyBTZXQoWydsb2NhbGhvc3QnLCAnMTI3LjAuMC4xJywgJzAuMC4wLjAnXSk7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRvIGNvbmZpZ3VyZSB3aGljaCBvcmlnaW5zIHNob3VsZCBiZSBleGNsdWRlZFxuICogZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuIEl0IGNhbiBlaXRoZXIgYmUgYSBzaW5nbGUgc3RyaW5nIG9yIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAqIHRvIHJlcHJlc2VudCBhIGdyb3VwIG9mIG9yaWdpbnMsIGZvciBleGFtcGxlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICB7cHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIHVzZVZhbHVlOiAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20nfVxuICogYGBgXG4gKlxuICogb3I6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCxcbiAqICAgdXNlVmFsdWU6IFsnaHR0cHM6Ly95b3VyLWRvbWFpbi0xLmNvbScsICdodHRwczovL3lvdXItZG9tYWluLTIuY29tJ119XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPEFycmF5PHN0cmluZ3xzdHJpbmdbXT4+KCdQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCcpO1xuXG4vKipcbiAqIENvbnRhaW5zIHRoZSBsb2dpYyB0byBkZXRlY3Qgd2hldGhlciBhbiBpbWFnZSwgbWFya2VkIHdpdGggdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGVcbiAqIGhhcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gIHRhZyBpbiB0aGUgYGRvY3VtZW50LmhlYWRgLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgYSBkZXYtbW9kZSBvbmx5IGNsYXNzLCB3aGljaCBzaG91bGQgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUHJlY29ubmVjdExpbmtDaGVja2VyIHtcbiAgcHJpdmF0ZSBkb2N1bWVudCA9IGluamVjdChET0NVTUVOVCk7XG5cbiAgLyoqXG4gICAqIFNldCBvZiA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+IHRhZ3MgZm91bmQgb24gdGhpcyBwYWdlLlxuICAgKiBUaGUgYG51bGxgIHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZXJlIHdhcyBubyBET00gcXVlcnkgb3BlcmF0aW9uIHBlcmZvcm1lZC5cbiAgICovXG4gIHByaXZhdGUgcHJlY29ubmVjdExpbmtzOiBTZXQ8c3RyaW5nPnxudWxsID0gbnVsbDtcblxuICAvKlxuICAgKiBLZWVwIHRyYWNrIG9mIGFsbCBhbHJlYWR5IHNlZW4gb3JpZ2luIFVSTHMgdG8gYXZvaWQgcmVwZWF0aW5nIHRoZSBzYW1lIGNoZWNrLlxuICAgKi9cbiAgcHJpdmF0ZSBhbHJlYWR5U2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgd2luZG93OiBXaW5kb3d8bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBibG9ja2xpc3QgPSBuZXcgU2V0PHN0cmluZz4oSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGFzc2VydERldk1vZGUoJ3ByZWNvbm5lY3QgbGluayBjaGVja2VyJyk7XG4gICAgY29uc3Qgd2luID0gdGhpcy5kb2N1bWVudC5kZWZhdWx0VmlldztcbiAgICBpZiAodHlwZW9mIHdpbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgIH1cbiAgICBjb25zdCBibG9ja2xpc3QgPSBpbmplY3QoUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIGlmIChibG9ja2xpc3QpIHtcbiAgICAgIHRoaXMucG9wdWxhdGVCbG9ja2xpc3QoYmxvY2tsaXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBvcHVsYXRlQmxvY2tsaXN0KG9yaWdpbnM6IEFycmF5PHN0cmluZ3xzdHJpbmdbXT58c3RyaW5nKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3JpZ2lucykpIHtcbiAgICAgIGRlZXBGb3JFYWNoKG9yaWdpbnMsIG9yaWdpbiA9PiB7XG4gICAgICAgIHRoaXMuYmxvY2tsaXN0LmFkZChleHRyYWN0SG9zdG5hbWUob3JpZ2luKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ibG9ja2xpc3QuYWRkKGV4dHJhY3RIb3N0bmFtZShvcmlnaW5zKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGF0IGEgcHJlY29ubmVjdCByZXNvdXJjZSBoaW50IGV4aXN0cyBpbiB0aGUgaGVhZCBmb3IgdGhlXG4gICAqIGdpdmVuIHNyYy5cbiAgICpcbiAgICogQHBhcmFtIHJld3JpdHRlblNyYyBzcmMgZm9ybWF0dGVkIHdpdGggbG9hZGVyXG4gICAqIEBwYXJhbSBvcmlnaW5hbE5nU3JjIG5nU3JjIHZhbHVlXG4gICAqL1xuICBhc3NlcnRQcmVjb25uZWN0KHJld3JpdHRlblNyYzogc3RyaW5nLCBvcmlnaW5hbE5nU3JjOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMud2luZG93KSByZXR1cm47XG5cbiAgICBjb25zdCBpbWdVcmwgPSBnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyk7XG4gICAgaWYgKHRoaXMuYmxvY2tsaXN0LmhhcyhpbWdVcmwuaG9zdG5hbWUpIHx8IHRoaXMuYWxyZWFkeVNlZW4uaGFzKGltZ1VybC5vcmlnaW4pKSByZXR1cm47XG5cbiAgICAvLyBSZWdpc3RlciB0aGlzIG9yaWdpbiBhcyBzZWVuLCBzbyB3ZSBkb24ndCBjaGVjayBpdCBhZ2FpbiBsYXRlci5cbiAgICB0aGlzLmFscmVhZHlTZWVuLmFkZChpbWdVcmwub3JpZ2luKTtcblxuICAgIGlmICghdGhpcy5wcmVjb25uZWN0TGlua3MpIHtcbiAgICAgIC8vIE5vdGU6IHdlIHF1ZXJ5IGZvciBwcmVjb25uZWN0IGxpbmtzIG9ubHkgKm9uY2UqIGFuZCBjYWNoZSB0aGUgcmVzdWx0c1xuICAgICAgLy8gZm9yIHRoZSBlbnRpcmUgbGlmZXNwYW4gb2YgYW4gYXBwbGljYXRpb24sIHNpbmNlIGl0J3MgdW5saWtlbHkgdGhhdCB0aGVcbiAgICAgIC8vIGxpc3Qgd291bGQgY2hhbmdlIGZyZXF1ZW50bHkuIFRoaXMgYWxsb3dzIHRvIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm9cbiAgICAgIC8vIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9ucyBvZiBtYWtpbmcgZXh0cmEgRE9NIGxvb2t1cHMgZm9yIGVhY2ggaW1hZ2UuXG4gICAgICB0aGlzLnByZWNvbm5lY3RMaW5rcyA9IHRoaXMucXVlcnlQcmVjb25uZWN0TGlua3MoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucHJlY29ubmVjdExpbmtzLmhhcyhpbWdVcmwub3JpZ2luKSkge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlBSSU9SSVRZX0lNR19NSVNTSU5HX1BSRUNPTk5FQ1RfVEFHLFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMob3JpZ2luYWxOZ1NyYyl9IHRoZXJlIGlzIG5vIHByZWNvbm5lY3QgdGFnIHByZXNlbnQgZm9yIHRoaXMgYCArXG4gICAgICAgICAgICAgIGBpbWFnZS4gUHJlY29ubmVjdGluZyB0byB0aGUgb3JpZ2luKHMpIHRoYXQgc2VydmUgcHJpb3JpdHkgaW1hZ2VzIGVuc3VyZXMgdGhhdCB0aGVzZSBgICtcbiAgICAgICAgICAgICAgYGltYWdlcyBhcmUgZGVsaXZlcmVkIGFzIHNvb24gYXMgcG9zc2libGUuIFRvIGZpeCB0aGlzLCBwbGVhc2UgYWRkIHRoZSBmb2xsb3dpbmcgYCArXG4gICAgICAgICAgICAgIGBlbGVtZW50IGludG8gdGhlIDxoZWFkPiBvZiB0aGUgZG9jdW1lbnQ6XFxuYCArXG4gICAgICAgICAgICAgIGAgIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIiBocmVmPVwiJHtpbWdVcmwub3JpZ2lufVwiPmApKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHF1ZXJ5UHJlY29ubmVjdExpbmtzKCk6IFNldDxzdHJpbmc+IHtcbiAgICBjb25zdCBwcmVjb25uZWN0VXJscyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gJ2xpbmtbcmVsPXByZWNvbm5lY3RdJztcbiAgICBjb25zdCBsaW5rczogSFRNTExpbmtFbGVtZW50W10gPSBBcnJheS5mcm9tKHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcbiAgICAgIGNvbnN0IHVybCA9IGdldFVybChsaW5rLmhyZWYsIHRoaXMud2luZG93ISk7XG4gICAgICBwcmVjb25uZWN0VXJscy5hZGQodXJsLm9yaWdpbik7XG4gICAgfVxuICAgIHJldHVybiBwcmVjb25uZWN0VXJscztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMucHJlY29ubmVjdExpbmtzPy5jbGVhcigpO1xuICAgIHRoaXMuYWxyZWFkeVNlZW4uY2xlYXIoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgYSBjYWxsYmFjayBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBhcnJheS4gQWxzbyBpbnZva2VzIGEgY2FsbGJhY2tcbiAqIHJlY3Vyc2l2ZWx5IGZvciBlYWNoIG5lc3RlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZGVlcEZvckVhY2g8VD4oaW5wdXQ6IChUfGFueVtdKVtdLCBmbjogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZCB7XG4gIGZvciAobGV0IHZhbHVlIG9mIGlucHV0KSB7XG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyBkZWVwRm9yRWFjaCh2YWx1ZSwgZm4pIDogZm4odmFsdWUpO1xuICB9XG59XG4iXX0=