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
import { PlatformLocation } from '../../location';
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
        this.platformLocation = inject(PlatformLocation);
        /**
         * Set of <link rel="preconnect"> tags found on this page.
         * The `null` value indicates that there was no DOM query operation performed.
         */
        this.preconnectLinks = null;
        /*
         * Keep track of all already seen origin URLs to avoid repeating the same check.
         */
        this.alreadySeen = new Set();
        this.blocklist = new Set(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);
        assertDevMode('preconnect link checker');
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
        const imgUrl = getUrl(rewrittenSrc, this.platformLocation.href);
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
            const url = getUrl(link.href, this.platformLocation.href);
            preconnectUrls.add(url.origin);
        }
        return preconnectUrls;
    }
    ngOnDestroy() {
        this.preconnectLinks?.clear();
        this.alreadySeen.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.5+sha-11f066b", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.5+sha-11f066b", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.5+sha-11f066b", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUcxQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxlQUFlLEVBQUUsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzlDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDOztBQUVoRCxzRUFBc0U7QUFDdEUsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUUzRjs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLGNBQWMsQ0FDMUQsU0FBUyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM5QyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQWtCaEM7UUFqQlEsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztR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YyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLENBQUM7eUhBdEZVLHFCQUFxQjs2SEFBckIscUJBQXFCLGNBRFQsTUFBTTs7c0dBQ2xCLHFCQUFxQjtrQkFEakMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBMEZoQzs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBSSxLQUFvQixFQUFFLEVBQXNCO0lBQ2xFLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxFQUFFLENBQUM7UUFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVELENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgUExBVEZPUk1fSUQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2V4dHJhY3RIb3N0bmFtZSwgZ2V0VXJsfSBmcm9tICcuL3VybCc7XG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJy4uLy4uL3BsYXRmb3JtX2lkJztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbG9jYXRpb24nO1xuXG4vLyBTZXQgb2Ygb3JpZ2lucyB0aGF0IGFyZSBhbHdheXMgZXhjbHVkZWQgZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuXG5jb25zdCBJTlRFUk5BTF9QUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCA9IG5ldyBTZXQoWydsb2NhbGhvc3QnLCAnMTI3LjAuMC4xJywgJzAuMC4wLjAnXSk7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRvIGNvbmZpZ3VyZSB3aGljaCBvcmlnaW5zIHNob3VsZCBiZSBleGNsdWRlZFxuICogZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuIEl0IGNhbiBlaXRoZXIgYmUgYSBzaW5nbGUgc3RyaW5nIG9yIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAqIHRvIHJlcHJlc2VudCBhIGdyb3VwIG9mIG9yaWdpbnMsIGZvciBleGFtcGxlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICB7cHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIHVzZVZhbHVlOiAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20nfVxuICogYGBgXG4gKlxuICogb3I6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCxcbiAqICAgdXNlVmFsdWU6IFsnaHR0cHM6Ly95b3VyLWRvbWFpbi0xLmNvbScsICdodHRwczovL3lvdXItZG9tYWluLTIuY29tJ119XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxBcnJheTxzdHJpbmcgfCBzdHJpbmdbXT4+KFxuICBuZ0Rldk1vZGUgPyAnUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QnIDogJycsXG4pO1xuXG4vKipcbiAqIENvbnRhaW5zIHRoZSBsb2dpYyB0byBkZXRlY3Qgd2hldGhlciBhbiBpbWFnZSwgbWFya2VkIHdpdGggdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGVcbiAqIGhhcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gIHRhZyBpbiB0aGUgYGRvY3VtZW50LmhlYWRgLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgYSBkZXYtbW9kZSBvbmx5IGNsYXNzLCB3aGljaCBzaG91bGQgbm90IGFwcGVhciBpbiBwcm9kIGJ1bmRsZXMsXG4gKiB0aHVzIHRoZXJlIGlzIG5vIGBuZ0Rldk1vZGVgIHVzZSBpbiB0aGUgY29kZS5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUHJlY29ubmVjdExpbmtDaGVja2VyIHtcbiAgcHJpdmF0ZSBkb2N1bWVudCA9IGluamVjdChET0NVTUVOVCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdChQTEFURk9STV9JRCkpO1xuICBwcml2YXRlIHJlYWRvbmx5IHBsYXRmb3JtTG9jYXRpb24gPSBpbmplY3QoUGxhdGZvcm1Mb2NhdGlvbik7XG5cbiAgLyoqXG4gICAqIFNldCBvZiA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+IHRhZ3MgZm91bmQgb24gdGhpcyBwYWdlLlxuICAgKiBUaGUgYG51bGxgIHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZXJlIHdhcyBubyBET00gcXVlcnkgb3BlcmF0aW9uIHBlcmZvcm1lZC5cbiAgICovXG4gIHByaXZhdGUgcHJlY29ubmVjdExpbmtzOiBTZXQ8c3RyaW5nPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qXG4gICAqIEtlZXAgdHJhY2sgb2YgYWxsIGFscmVhZHkgc2VlbiBvcmlnaW4gVVJMcyB0byBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgY2hlY2suXG4gICAqL1xuICBwcml2YXRlIGFscmVhZHlTZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSBibG9ja2xpc3QgPSBuZXcgU2V0PHN0cmluZz4oSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGFzc2VydERldk1vZGUoJ3ByZWNvbm5lY3QgbGluayBjaGVja2VyJyk7XG4gICAgY29uc3QgYmxvY2tsaXN0ID0gaW5qZWN0KFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICBpZiAoYmxvY2tsaXN0KSB7XG4gICAgICB0aGlzLnBvcHVsYXRlQmxvY2tsaXN0KGJsb2NrbGlzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwb3B1bGF0ZUJsb2NrbGlzdChvcmlnaW5zOiBBcnJheTxzdHJpbmcgfCBzdHJpbmdbXT4gfCBzdHJpbmcpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcmlnaW5zKSkge1xuICAgICAgZGVlcEZvckVhY2gob3JpZ2lucywgKG9yaWdpbikgPT4ge1xuICAgICAgICB0aGlzLmJsb2NrbGlzdC5hZGQoZXh0cmFjdEhvc3RuYW1lKG9yaWdpbikpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYmxvY2tsaXN0LmFkZChleHRyYWN0SG9zdG5hbWUob3JpZ2lucykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhhdCBhIHByZWNvbm5lY3QgcmVzb3VyY2UgaGludCBleGlzdHMgaW4gdGhlIGhlYWQgZm9yIHRoZVxuICAgKiBnaXZlbiBzcmMuXG4gICAqXG4gICAqIEBwYXJhbSByZXdyaXR0ZW5TcmMgc3JjIGZvcm1hdHRlZCB3aXRoIGxvYWRlclxuICAgKiBAcGFyYW0gb3JpZ2luYWxOZ1NyYyBuZ1NyYyB2YWx1ZVxuICAgKi9cbiAgYXNzZXJ0UHJlY29ubmVjdChyZXdyaXR0ZW5TcmM6IHN0cmluZywgb3JpZ2luYWxOZ1NyYzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNTZXJ2ZXIpIHJldHVybjtcblxuICAgIGNvbnN0IGltZ1VybCA9IGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMucGxhdGZvcm1Mb2NhdGlvbi5ocmVmKTtcbiAgICBpZiAodGhpcy5ibG9ja2xpc3QuaGFzKGltZ1VybC5ob3N0bmFtZSkgfHwgdGhpcy5hbHJlYWR5U2Vlbi5oYXMoaW1nVXJsLm9yaWdpbikpIHJldHVybjtcblxuICAgIC8vIFJlZ2lzdGVyIHRoaXMgb3JpZ2luIGFzIHNlZW4sIHNvIHdlIGRvbid0IGNoZWNrIGl0IGFnYWluIGxhdGVyLlxuICAgIHRoaXMuYWxyZWFkeVNlZW4uYWRkKGltZ1VybC5vcmlnaW4pO1xuXG4gICAgLy8gTm90ZTogd2UgcXVlcnkgZm9yIHByZWNvbm5lY3QgbGlua3Mgb25seSAqb25jZSogYW5kIGNhY2hlIHRoZSByZXN1bHRzXG4gICAgLy8gZm9yIHRoZSBlbnRpcmUgbGlmZXNwYW4gb2YgYW4gYXBwbGljYXRpb24sIHNpbmNlIGl0J3MgdW5saWtlbHkgdGhhdCB0aGVcbiAgICAvLyBsaXN0IHdvdWxkIGNoYW5nZSBmcmVxdWVudGx5LiBUaGlzIGFsbG93cyB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vXG4gICAgLy8gcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zIG9mIG1ha2luZyBleHRyYSBET00gbG9va3VwcyBmb3IgZWFjaCBpbWFnZS5cbiAgICB0aGlzLnByZWNvbm5lY3RMaW5rcyA/Pz0gdGhpcy5xdWVyeVByZWNvbm5lY3RMaW5rcygpO1xuXG4gICAgaWYgKCF0aGlzLnByZWNvbm5lY3RMaW5rcy5oYXMoaW1nVXJsLm9yaWdpbikpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUFJJT1JJVFlfSU1HX01JU1NJTkdfUFJFQ09OTkVDVF9UQUcsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhvcmlnaW5hbE5nU3JjKX0gdGhlcmUgaXMgbm8gcHJlY29ubmVjdCB0YWcgcHJlc2VudCBmb3IgdGhpcyBgICtcbiAgICAgICAgICAgIGBpbWFnZS4gUHJlY29ubmVjdGluZyB0byB0aGUgb3JpZ2luKHMpIHRoYXQgc2VydmUgcHJpb3JpdHkgaW1hZ2VzIGVuc3VyZXMgdGhhdCB0aGVzZSBgICtcbiAgICAgICAgICAgIGBpbWFnZXMgYXJlIGRlbGl2ZXJlZCBhcyBzb29uIGFzIHBvc3NpYmxlLiBUbyBmaXggdGhpcywgcGxlYXNlIGFkZCB0aGUgZm9sbG93aW5nIGAgK1xuICAgICAgICAgICAgYGVsZW1lbnQgaW50byB0aGUgPGhlYWQ+IG9mIHRoZSBkb2N1bWVudDpcXG5gICtcbiAgICAgICAgICAgIGAgIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIiBocmVmPVwiJHtpbWdVcmwub3JpZ2lufVwiPmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcXVlcnlQcmVjb25uZWN0TGlua3MoKTogU2V0PHN0cmluZz4ge1xuICAgIGNvbnN0IHByZWNvbm5lY3RVcmxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnbGlua1tyZWw9cHJlY29ubmVjdF0nO1xuICAgIGNvbnN0IGxpbmtzOiBIVE1MTGlua0VsZW1lbnRbXSA9IEFycmF5LmZyb20odGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgZm9yIChsZXQgbGluayBvZiBsaW5rcykge1xuICAgICAgY29uc3QgdXJsID0gZ2V0VXJsKGxpbmsuaHJlZiwgdGhpcy5wbGF0Zm9ybUxvY2F0aW9uLmhyZWYpO1xuICAgICAgcHJlY29ubmVjdFVybHMuYWRkKHVybC5vcmlnaW4pO1xuICAgIH1cbiAgICByZXR1cm4gcHJlY29ubmVjdFVybHM7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnByZWNvbm5lY3RMaW5rcz8uY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlTZWVuLmNsZWFyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgYXJyYXkuIEFsc28gaW52b2tlcyBhIGNhbGxiYWNrXG4gKiByZWN1cnNpdmVseSBmb3IgZWFjaCBuZXN0ZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGRlZXBGb3JFYWNoPFQ+KGlucHV0OiAoVCB8IGFueVtdKVtdLCBmbjogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZCB7XG4gIGZvciAobGV0IHZhbHVlIG9mIGlucHV0KSB7XG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyBkZWVwRm9yRWFjaCh2YWx1ZSwgZm4pIDogZm4odmFsdWUpO1xuICB9XG59XG4iXX0=