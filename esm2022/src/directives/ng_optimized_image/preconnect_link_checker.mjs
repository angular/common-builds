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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-45288f7", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-45288f7", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-45288f7", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsSUFBSSxrQkFBa0IsRUFBZ0MsTUFBTSxlQUFlLENBQUM7QUFFM0ksT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUMsTUFBTSxPQUFPLENBQUM7O0FBRTlDLHNFQUFzRTtBQUN0RSxNQUFNLG1DQUFtQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTNGOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUNuQyxJQUFJLGNBQWMsQ0FBeUIsU0FBUyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQWtCaEM7UUFqQlEsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQzs7O1dBR0c7UUFDSyxvQkFBZSxHQUFxQixJQUFJLENBQUM7UUFFakQ7O1dBRUc7UUFDSyxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFaEMsV0FBTSxH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TyxjQUFjLENBQUM7SUFDeEIsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDM0IsQ0FBQzt5SEF2RlUscUJBQXFCOzZIQUFyQixxQkFBcUIsY0FEVCxNQUFNOztzR0FDbEIscUJBQXFCO2tCQURqQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7QUEyRmhDOzs7R0FHRztBQUNILFNBQVMsV0FBVyxDQUFJLEtBQWtCLEVBQUUsRUFBc0I7SUFDaEUsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUN4QixLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUQsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uLy4uL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuXG5pbXBvcnQge2Fzc2VydERldk1vZGV9IGZyb20gJy4vYXNzZXJ0cyc7XG5pbXBvcnQge2ltZ0RpcmVjdGl2ZURldGFpbHN9IGZyb20gJy4vZXJyb3JfaGVscGVyJztcbmltcG9ydCB7ZXh0cmFjdEhvc3RuYW1lLCBnZXRVcmx9IGZyb20gJy4vdXJsJztcblxuLy8gU2V0IG9mIG9yaWdpbnMgdGhhdCBhcmUgYWx3YXlzIGV4Y2x1ZGVkIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLlxuY29uc3QgSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPSBuZXcgU2V0KFsnbG9jYWxob3N0JywgJzEyNy4wLjAuMScsICcwLjAuMC4wJ10pO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0byBjb25maWd1cmUgd2hpY2ggb3JpZ2lucyBzaG91bGQgYmUgZXhjbHVkZWRcbiAqIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLiBJdCBjYW4gZWl0aGVyIGJlIGEgc2luZ2xlIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzXG4gKiB0byByZXByZXNlbnQgYSBncm91cCBvZiBvcmlnaW5zLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAge3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCB1c2VWYWx1ZTogJ2h0dHBzOi8veW91ci1kb21haW4uY29tJ31cbiAqIGBgYFxuICpcbiAqIG9yOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICB7cHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsXG4gKiAgIHVzZVZhbHVlOiBbJ2h0dHBzOi8veW91ci1kb21haW4tMS5jb20nLCAnaHR0cHM6Ly95b3VyLWRvbWFpbi0yLmNvbSddfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxBcnJheTxzdHJpbmd8c3RyaW5nW10+PihuZ0Rldk1vZGUgPyAnUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QnIDogJycpO1xuXG4vKipcbiAqIENvbnRhaW5zIHRoZSBsb2dpYyB0byBkZXRlY3Qgd2hldGhlciBhbiBpbWFnZSwgbWFya2VkIHdpdGggdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGVcbiAqIGhhcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gIHRhZyBpbiB0aGUgYGRvY3VtZW50LmhlYWRgLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgYSBkZXYtbW9kZSBvbmx5IGNsYXNzLCB3aGljaCBzaG91bGQgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUHJlY29ubmVjdExpbmtDaGVja2VyIHtcbiAgcHJpdmF0ZSBkb2N1bWVudCA9IGluamVjdChET0NVTUVOVCk7XG5cbiAgLyoqXG4gICAqIFNldCBvZiA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+IHRhZ3MgZm91bmQgb24gdGhpcyBwYWdlLlxuICAgKiBUaGUgYG51bGxgIHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZXJlIHdhcyBubyBET00gcXVlcnkgb3BlcmF0aW9uIHBlcmZvcm1lZC5cbiAgICovXG4gIHByaXZhdGUgcHJlY29ubmVjdExpbmtzOiBTZXQ8c3RyaW5nPnxudWxsID0gbnVsbDtcblxuICAvKlxuICAgKiBLZWVwIHRyYWNrIG9mIGFsbCBhbHJlYWR5IHNlZW4gb3JpZ2luIFVSTHMgdG8gYXZvaWQgcmVwZWF0aW5nIHRoZSBzYW1lIGNoZWNrLlxuICAgKi9cbiAgcHJpdmF0ZSBhbHJlYWR5U2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgd2luZG93OiBXaW5kb3d8bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBibG9ja2xpc3QgPSBuZXcgU2V0PHN0cmluZz4oSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGFzc2VydERldk1vZGUoJ3ByZWNvbm5lY3QgbGluayBjaGVja2VyJyk7XG4gICAgY29uc3Qgd2luID0gdGhpcy5kb2N1bWVudC5kZWZhdWx0VmlldztcbiAgICBpZiAodHlwZW9mIHdpbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgIH1cbiAgICBjb25zdCBibG9ja2xpc3QgPSBpbmplY3QoUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIGlmIChibG9ja2xpc3QpIHtcbiAgICAgIHRoaXMucG9wdWxhdGVCbG9ja2xpc3QoYmxvY2tsaXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBvcHVsYXRlQmxvY2tsaXN0KG9yaWdpbnM6IEFycmF5PHN0cmluZ3xzdHJpbmdbXT58c3RyaW5nKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3JpZ2lucykpIHtcbiAgICAgIGRlZXBGb3JFYWNoKG9yaWdpbnMsIG9yaWdpbiA9PiB7XG4gICAgICAgIHRoaXMuYmxvY2tsaXN0LmFkZChleHRyYWN0SG9zdG5hbWUob3JpZ2luKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ibG9ja2xpc3QuYWRkKGV4dHJhY3RIb3N0bmFtZShvcmlnaW5zKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGF0IGEgcHJlY29ubmVjdCByZXNvdXJjZSBoaW50IGV4aXN0cyBpbiB0aGUgaGVhZCBmb3IgdGhlXG4gICAqIGdpdmVuIHNyYy5cbiAgICpcbiAgICogQHBhcmFtIHJld3JpdHRlblNyYyBzcmMgZm9ybWF0dGVkIHdpdGggbG9hZGVyXG4gICAqIEBwYXJhbSBvcmlnaW5hbE5nU3JjIG5nU3JjIHZhbHVlXG4gICAqL1xuICBhc3NlcnRQcmVjb25uZWN0KHJld3JpdHRlblNyYzogc3RyaW5nLCBvcmlnaW5hbE5nU3JjOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMud2luZG93KSByZXR1cm47XG5cbiAgICBjb25zdCBpbWdVcmwgPSBnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyk7XG4gICAgaWYgKHRoaXMuYmxvY2tsaXN0LmhhcyhpbWdVcmwuaG9zdG5hbWUpIHx8IHRoaXMuYWxyZWFkeVNlZW4uaGFzKGltZ1VybC5vcmlnaW4pKSByZXR1cm47XG5cbiAgICAvLyBSZWdpc3RlciB0aGlzIG9yaWdpbiBhcyBzZWVuLCBzbyB3ZSBkb24ndCBjaGVjayBpdCBhZ2FpbiBsYXRlci5cbiAgICB0aGlzLmFscmVhZHlTZWVuLmFkZChpbWdVcmwub3JpZ2luKTtcblxuICAgIC8vIE5vdGU6IHdlIHF1ZXJ5IGZvciBwcmVjb25uZWN0IGxpbmtzIG9ubHkgKm9uY2UqIGFuZCBjYWNoZSB0aGUgcmVzdWx0c1xuICAgIC8vIGZvciB0aGUgZW50aXJlIGxpZmVzcGFuIG9mIGFuIGFwcGxpY2F0aW9uLCBzaW5jZSBpdCdzIHVubGlrZWx5IHRoYXQgdGhlXG4gICAgLy8gbGlzdCB3b3VsZCBjaGFuZ2UgZnJlcXVlbnRseS4gVGhpcyBhbGxvd3MgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBub1xuICAgIC8vIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9ucyBvZiBtYWtpbmcgZXh0cmEgRE9NIGxvb2t1cHMgZm9yIGVhY2ggaW1hZ2UuXG4gICAgdGhpcy5wcmVjb25uZWN0TGlua3MgPz89IHRoaXMucXVlcnlQcmVjb25uZWN0TGlua3MoKTtcblxuICAgIGlmICghdGhpcy5wcmVjb25uZWN0TGlua3MuaGFzKGltZ1VybC5vcmlnaW4pKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUFJJT1JJVFlfSU1HX01JU1NJTkdfUFJFQ09OTkVDVF9UQUcsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhvcmlnaW5hbE5nU3JjKX0gdGhlcmUgaXMgbm8gcHJlY29ubmVjdCB0YWcgcHJlc2VudCBmb3IgdGhpcyBgICtcbiAgICAgICAgICAgICAgYGltYWdlLiBQcmVjb25uZWN0aW5nIHRvIHRoZSBvcmlnaW4ocykgdGhhdCBzZXJ2ZSBwcmlvcml0eSBpbWFnZXMgZW5zdXJlcyB0aGF0IHRoZXNlIGAgK1xuICAgICAgICAgICAgICBgaW1hZ2VzIGFyZSBkZWxpdmVyZWQgYXMgc29vbiBhcyBwb3NzaWJsZS4gVG8gZml4IHRoaXMsIHBsZWFzZSBhZGQgdGhlIGZvbGxvd2luZyBgICtcbiAgICAgICAgICAgICAgYGVsZW1lbnQgaW50byB0aGUgPGhlYWQ+IG9mIHRoZSBkb2N1bWVudDpcXG5gICtcbiAgICAgICAgICAgICAgYCAgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiIGhyZWY9XCIke2ltZ1VybC5vcmlnaW59XCI+YCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcXVlcnlQcmVjb25uZWN0TGlua3MoKTogU2V0PHN0cmluZz4ge1xuICAgIGNvbnN0IHByZWNvbm5lY3RVcmxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnbGlua1tyZWw9cHJlY29ubmVjdF0nO1xuICAgIGNvbnN0IGxpbmtzOiBIVE1MTGlua0VsZW1lbnRbXSA9IEFycmF5LmZyb20odGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgZm9yIChsZXQgbGluayBvZiBsaW5rcykge1xuICAgICAgY29uc3QgdXJsID0gZ2V0VXJsKGxpbmsuaHJlZiwgdGhpcy53aW5kb3chKTtcbiAgICAgIHByZWNvbm5lY3RVcmxzLmFkZCh1cmwub3JpZ2luKTtcbiAgICB9XG4gICAgcmV0dXJuIHByZWNvbm5lY3RVcmxzO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5wcmVjb25uZWN0TGlua3M/LmNsZWFyKCk7XG4gICAgdGhpcy5hbHJlYWR5U2Vlbi5jbGVhcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyBhIGNhbGxiYWNrIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5LiBBbHNvIGludm9rZXMgYSBjYWxsYmFja1xuICogcmVjdXJzaXZlbHkgZm9yIGVhY2ggbmVzdGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBkZWVwRm9yRWFjaDxUPihpbnB1dDogKFR8YW55W10pW10sIGZuOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChsZXQgdmFsdWUgb2YgaW5wdXQpIHtcbiAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IGRlZXBGb3JFYWNoKHZhbHVlLCBmbikgOiBmbih2YWx1ZSk7XG4gIH1cbn1cbiJdfQ==