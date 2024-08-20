/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, InjectionToken, ɵformatRuntimeError as formatRuntimeError, PLATFORM_ID, } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { imgDirectiveDetails } from './error_helper';
import { extractHostname, getUrl } from './url';
import { isPlatformServer } from '../../platform_id';
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
        this.isServer = isPlatformServer(inject(PLATFORM_ID));
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
        if (this.isServer)
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0+sha-1a5f5ee", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0+sha-1a5f5ee", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0+sha-1a5f5ee", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUcxQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxlQUFlLEVBQUUsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzlDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUVuRCxzRUFBc0U7QUFDdEUsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUUzRjs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLGNBQWMsQ0FDMUQsU0FBUyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM5QyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQW1CaEM7UUFsQlEsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQixhQUFRLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FB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SSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUM7WUFDNUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLENBQUM7eUhBM0ZVLHFCQUFxQjs2SEFBckIscUJBQXFCLGNBRFQsTUFBTTs7c0dBQ2xCLHFCQUFxQjtrQkFEakMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBK0ZoQzs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBSSxLQUFvQixFQUFFLEVBQXNCO0lBQ2xFLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxFQUFFLENBQUM7UUFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVELENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgUExBVEZPUk1fSUQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2V4dHJhY3RIb3N0bmFtZSwgZ2V0VXJsfSBmcm9tICcuL3VybCc7XG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJy4uLy4uL3BsYXRmb3JtX2lkJztcblxuLy8gU2V0IG9mIG9yaWdpbnMgdGhhdCBhcmUgYWx3YXlzIGV4Y2x1ZGVkIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLlxuY29uc3QgSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPSBuZXcgU2V0KFsnbG9jYWxob3N0JywgJzEyNy4wLjAuMScsICcwLjAuMC4wJ10pO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0byBjb25maWd1cmUgd2hpY2ggb3JpZ2lucyBzaG91bGQgYmUgZXhjbHVkZWRcbiAqIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLiBJdCBjYW4gZWl0aGVyIGJlIGEgc2luZ2xlIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzXG4gKiB0byByZXByZXNlbnQgYSBncm91cCBvZiBvcmlnaW5zLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAge3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCB1c2VWYWx1ZTogJ2h0dHBzOi8veW91ci1kb21haW4uY29tJ31cbiAqIGBgYFxuICpcbiAqIG9yOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICB7cHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsXG4gKiAgIHVzZVZhbHVlOiBbJ2h0dHBzOi8veW91ci1kb21haW4tMS5jb20nLCAnaHR0cHM6Ly95b3VyLWRvbWFpbi0yLmNvbSddfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPSBuZXcgSW5qZWN0aW9uVG9rZW48QXJyYXk8c3RyaW5nIHwgc3RyaW5nW10+PihcbiAgbmdEZXZNb2RlID8gJ1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBDb250YWlucyB0aGUgbG9naWMgdG8gZGV0ZWN0IHdoZXRoZXIgYW4gaW1hZ2UsIG1hcmtlZCB3aXRoIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlXG4gKiBoYXMgYSBjb3JyZXNwb25kaW5nIGA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+YCB0YWcgaW4gdGhlIGBkb2N1bWVudC5oZWFkYC5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFByZWNvbm5lY3RMaW5rQ2hlY2tlciB7XG4gIHByaXZhdGUgZG9jdW1lbnQgPSBpbmplY3QoRE9DVU1FTlQpO1xuICBwcml2YXRlIHJlYWRvbmx5IGlzU2VydmVyID0gaXNQbGF0Zm9ybVNlcnZlcihpbmplY3QoUExBVEZPUk1fSUQpKTtcblxuICAvKipcbiAgICogU2V0IG9mIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj4gdGFncyBmb3VuZCBvbiB0aGlzIHBhZ2UuXG4gICAqIFRoZSBgbnVsbGAgdmFsdWUgaW5kaWNhdGVzIHRoYXQgdGhlcmUgd2FzIG5vIERPTSBxdWVyeSBvcGVyYXRpb24gcGVyZm9ybWVkLlxuICAgKi9cbiAgcHJpdmF0ZSBwcmVjb25uZWN0TGlua3M6IFNldDxzdHJpbmc+IHwgbnVsbCA9IG51bGw7XG5cbiAgLypcbiAgICogS2VlcCB0cmFjayBvZiBhbGwgYWxyZWFkeSBzZWVuIG9yaWdpbiBVUkxzIHRvIGF2b2lkIHJlcGVhdGluZyB0aGUgc2FtZSBjaGVjay5cbiAgICovXG4gIHByaXZhdGUgYWxyZWFkeVNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIHdpbmRvdzogV2luZG93IHwgbnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBibG9ja2xpc3QgPSBuZXcgU2V0PHN0cmluZz4oSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGFzc2VydERldk1vZGUoJ3ByZWNvbm5lY3QgbGluayBjaGVja2VyJyk7XG4gICAgY29uc3Qgd2luID0gdGhpcy5kb2N1bWVudC5kZWZhdWx0VmlldztcbiAgICBpZiAodHlwZW9mIHdpbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93ID0gd2luO1xuICAgIH1cbiAgICBjb25zdCBibG9ja2xpc3QgPSBpbmplY3QoUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIGlmIChibG9ja2xpc3QpIHtcbiAgICAgIHRoaXMucG9wdWxhdGVCbG9ja2xpc3QoYmxvY2tsaXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBvcHVsYXRlQmxvY2tsaXN0KG9yaWdpbnM6IEFycmF5PHN0cmluZyB8IHN0cmluZ1tdPiB8IHN0cmluZykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9yaWdpbnMpKSB7XG4gICAgICBkZWVwRm9yRWFjaChvcmlnaW5zLCAob3JpZ2luKSA9PiB7XG4gICAgICAgIHRoaXMuYmxvY2tsaXN0LmFkZChleHRyYWN0SG9zdG5hbWUob3JpZ2luKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ibG9ja2xpc3QuYWRkKGV4dHJhY3RIb3N0bmFtZShvcmlnaW5zKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGF0IGEgcHJlY29ubmVjdCByZXNvdXJjZSBoaW50IGV4aXN0cyBpbiB0aGUgaGVhZCBmb3IgdGhlXG4gICAqIGdpdmVuIHNyYy5cbiAgICpcbiAgICogQHBhcmFtIHJld3JpdHRlblNyYyBzcmMgZm9ybWF0dGVkIHdpdGggbG9hZGVyXG4gICAqIEBwYXJhbSBvcmlnaW5hbE5nU3JjIG5nU3JjIHZhbHVlXG4gICAqL1xuICBhc3NlcnRQcmVjb25uZWN0KHJld3JpdHRlblNyYzogc3RyaW5nLCBvcmlnaW5hbE5nU3JjOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1NlcnZlcikgcmV0dXJuO1xuXG4gICAgY29uc3QgaW1nVXJsID0gZ2V0VXJsKHJld3JpdHRlblNyYywgdGhpcy53aW5kb3chKTtcbiAgICBpZiAodGhpcy5ibG9ja2xpc3QuaGFzKGltZ1VybC5ob3N0bmFtZSkgfHwgdGhpcy5hbHJlYWR5U2Vlbi5oYXMoaW1nVXJsLm9yaWdpbikpIHJldHVybjtcblxuICAgIC8vIFJlZ2lzdGVyIHRoaXMgb3JpZ2luIGFzIHNlZW4sIHNvIHdlIGRvbid0IGNoZWNrIGl0IGFnYWluIGxhdGVyLlxuICAgIHRoaXMuYWxyZWFkeVNlZW4uYWRkKGltZ1VybC5vcmlnaW4pO1xuXG4gICAgLy8gTm90ZTogd2UgcXVlcnkgZm9yIHByZWNvbm5lY3QgbGlua3Mgb25seSAqb25jZSogYW5kIGNhY2hlIHRoZSByZXN1bHRzXG4gICAgLy8gZm9yIHRoZSBlbnRpcmUgbGlmZXNwYW4gb2YgYW4gYXBwbGljYXRpb24sIHNpbmNlIGl0J3MgdW5saWtlbHkgdGhhdCB0aGVcbiAgICAvLyBsaXN0IHdvdWxkIGNoYW5nZSBmcmVxdWVudGx5LiBUaGlzIGFsbG93cyB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vXG4gICAgLy8gcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zIG9mIG1ha2luZyBleHRyYSBET00gbG9va3VwcyBmb3IgZWFjaCBpbWFnZS5cbiAgICB0aGlzLnByZWNvbm5lY3RMaW5rcyA/Pz0gdGhpcy5xdWVyeVByZWNvbm5lY3RMaW5rcygpO1xuXG4gICAgaWYgKCF0aGlzLnByZWNvbm5lY3RMaW5rcy5oYXMoaW1nVXJsLm9yaWdpbikpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUFJJT1JJVFlfSU1HX01JU1NJTkdfUFJFQ09OTkVDVF9UQUcsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhvcmlnaW5hbE5nU3JjKX0gdGhlcmUgaXMgbm8gcHJlY29ubmVjdCB0YWcgcHJlc2VudCBmb3IgdGhpcyBgICtcbiAgICAgICAgICAgIGBpbWFnZS4gUHJlY29ubmVjdGluZyB0byB0aGUgb3JpZ2luKHMpIHRoYXQgc2VydmUgcHJpb3JpdHkgaW1hZ2VzIGVuc3VyZXMgdGhhdCB0aGVzZSBgICtcbiAgICAgICAgICAgIGBpbWFnZXMgYXJlIGRlbGl2ZXJlZCBhcyBzb29uIGFzIHBvc3NpYmxlLiBUbyBmaXggdGhpcywgcGxlYXNlIGFkZCB0aGUgZm9sbG93aW5nIGAgK1xuICAgICAgICAgICAgYGVsZW1lbnQgaW50byB0aGUgPGhlYWQ+IG9mIHRoZSBkb2N1bWVudDpcXG5gICtcbiAgICAgICAgICAgIGAgIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIiBocmVmPVwiJHtpbWdVcmwub3JpZ2lufVwiPmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcXVlcnlQcmVjb25uZWN0TGlua3MoKTogU2V0PHN0cmluZz4ge1xuICAgIGNvbnN0IHByZWNvbm5lY3RVcmxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnbGlua1tyZWw9cHJlY29ubmVjdF0nO1xuICAgIGNvbnN0IGxpbmtzOiBIVE1MTGlua0VsZW1lbnRbXSA9IEFycmF5LmZyb20odGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgZm9yIChsZXQgbGluayBvZiBsaW5rcykge1xuICAgICAgY29uc3QgdXJsID0gZ2V0VXJsKGxpbmsuaHJlZiwgdGhpcy53aW5kb3chKTtcbiAgICAgIHByZWNvbm5lY3RVcmxzLmFkZCh1cmwub3JpZ2luKTtcbiAgICB9XG4gICAgcmV0dXJuIHByZWNvbm5lY3RVcmxzO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5wcmVjb25uZWN0TGlua3M/LmNsZWFyKCk7XG4gICAgdGhpcy5hbHJlYWR5U2Vlbi5jbGVhcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyBhIGNhbGxiYWNrIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5LiBBbHNvIGludm9rZXMgYSBjYWxsYmFja1xuICogcmVjdXJzaXZlbHkgZm9yIGVhY2ggbmVzdGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBkZWVwRm9yRWFjaDxUPihpbnB1dDogKFQgfCBhbnlbXSlbXSwgZm46ICh2YWx1ZTogVCkgPT4gdm9pZCk6IHZvaWQge1xuICBmb3IgKGxldCB2YWx1ZSBvZiBpbnB1dCkge1xuICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gZGVlcEZvckVhY2godmFsdWUsIGZuKSA6IGZuKHZhbHVlKTtcbiAgfVxufVxuIl19