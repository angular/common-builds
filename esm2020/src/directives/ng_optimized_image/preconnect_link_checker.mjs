/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, InjectionToken, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { imgDirectiveDetails } from './error_helper';
import { extractHostname, getUrl } from './url';
import * as i0 from "@angular/core";
// Set of origins that are always excluded from the preconnect checks.
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
/**
 * Multi-provider injection token to configure which origins should be excluded
 * from the preconnect checks. It can either be a single string or an array of strings
 * to represent a group of origins, for example:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, multi: true, useValue: 'https://your-domain.com'}
 * ```
 *
 * or:
 *
 * ```typescript
 *  {provide: PRECONNECT_CHECK_BLOCKLIST, multi: true,
 *   useValue: ['https://your-domain-1.com', 'https://your-domain-2.com']}
 * ```
 *
 * @publicApi
 * @developerPreview
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
            throw new RuntimeError(2957 /* RuntimeErrorCode.INVALID_PRECONNECT_CHECK_BLOCKLIST */, `The blocklist for the preconnect check was not provided as an array. ` +
                `Check that the \`PRECONNECT_CHECK_BLOCKLIST\` token is configured as a \`multi: true\` provider.`);
        }
    }
    /**
     * Checks that a preconnect resource hint exists in the head fo rthe
     * given src.
     *
     * @param rewrittenSrc src formatted with loader
     * @param rawSrc rawSrc value
     */
    assertPreconnect(rewrittenSrc, rawSrc) {
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
            console.warn(formatRuntimeError(2956 /* RuntimeErrorCode.PRIORITY_IMG_MISSING_PRECONNECT_TAG */, `${imgDirectiveDetails(rawSrc)} there is no preconnect tag present for this image. ` +
                `Preconnecting to the origin(s) that serve priority images ensures that these ` +
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
}
PreconnectLinkChecker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.0-next.0+sha-93d7d91", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
PreconnectLinkChecker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.0.0-next.0+sha-93d7d91", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.0-next.0+sha-93d7d91", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return []; } });
/**
 * Invokes a callback for each element in the array. Also invokes a callback
 * recursively for each nested array.
 */
function deepForEach(input, fn) {
    for (let value of input) {
        Array.isArray(value) ? deepForEach(value, fn) : fn(value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTNJLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUcxQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxlQUFlLEVBQUUsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDOztBQUU5QyxzRUFBc0U7QUFDdEUsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUUzRjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQ25DLElBQUksY0FBYyxDQUF5Qiw0QkFBNEIsQ0FBQyxDQUFDO0FBRTdFOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyxxQkFBcUI7SUFrQmhDO1FBakJRLGFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEM7OztXQUdHO1FBQ0ssb0JBQWUsR0FBcUIsSUFBSSxDQUFDO1FBRWpEOztXQUVHO1FBQ0ssZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRWhDLFdBQU0sR0FBZ0IsSUFBSSxDQUFDO1FBRTNC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LGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLENBQUM7OzZIQTVGVSxxQkFBcUI7aUlBQXJCLHFCQUFxQixjQURULE1BQU07c0dBQ2xCLHFCQUFxQjtrQkFEakMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBZ0doQzs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBSSxLQUFrQixFQUFFLEVBQXNCO0lBQ2hFLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxFQUFFO1FBQ3ZCLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzRDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uLy4uL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuXG5pbXBvcnQge2Fzc2VydERldk1vZGV9IGZyb20gJy4vYXNzZXJ0cyc7XG5pbXBvcnQge2ltZ0RpcmVjdGl2ZURldGFpbHN9IGZyb20gJy4vZXJyb3JfaGVscGVyJztcbmltcG9ydCB7ZXh0cmFjdEhvc3RuYW1lLCBnZXRVcmx9IGZyb20gJy4vdXJsJztcblxuLy8gU2V0IG9mIG9yaWdpbnMgdGhhdCBhcmUgYWx3YXlzIGV4Y2x1ZGVkIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLlxuY29uc3QgSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPSBuZXcgU2V0KFsnbG9jYWxob3N0JywgJzEyNy4wLjAuMScsICcwLjAuMC4wJ10pO1xuXG4vKipcbiAqIE11bHRpLXByb3ZpZGVyIGluamVjdGlvbiB0b2tlbiB0byBjb25maWd1cmUgd2hpY2ggb3JpZ2lucyBzaG91bGQgYmUgZXhjbHVkZWRcbiAqIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLiBJdCBjYW4gZWl0aGVyIGJlIGEgc2luZ2xlIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzXG4gKiB0byByZXByZXNlbnQgYSBncm91cCBvZiBvcmlnaW5zLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAge3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCBtdWx0aTogdHJ1ZSwgdXNlVmFsdWU6ICdodHRwczovL3lvdXItZG9tYWluLmNvbSd9XG4gKiBgYGBcbiAqXG4gKiBvcjpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAge3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCBtdWx0aTogdHJ1ZSxcbiAqICAgdXNlVmFsdWU6IFsnaHR0cHM6Ly95b3VyLWRvbWFpbi0xLmNvbScsICdodHRwczovL3lvdXItZG9tYWluLTIuY29tJ119XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5leHBvcnQgY29uc3QgUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxBcnJheTxzdHJpbmd8c3RyaW5nW10+PignUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QnKTtcblxuLyoqXG4gKiBDb250YWlucyB0aGUgbG9naWMgdG8gZGV0ZWN0IHdoZXRoZXIgYW4gaW1hZ2UsIG1hcmtlZCB3aXRoIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlXG4gKiBoYXMgYSBjb3JyZXNwb25kaW5nIGA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+YCB0YWcgaW4gdGhlIGBkb2N1bWVudC5oZWFkYC5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFByZWNvbm5lY3RMaW5rQ2hlY2tlciB7XG4gIHByaXZhdGUgZG9jdW1lbnQgPSBpbmplY3QoRE9DVU1FTlQpO1xuXG4gIC8qKlxuICAgKiBTZXQgb2YgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPiB0YWdzIGZvdW5kIG9uIHRoaXMgcGFnZS5cbiAgICogVGhlIGBudWxsYCB2YWx1ZSBpbmRpY2F0ZXMgdGhhdCB0aGVyZSB3YXMgbm8gRE9NIHF1ZXJ5IG9wZXJhdGlvbiBwZXJmb3JtZWQuXG4gICAqL1xuICBwcml2YXRlIHByZWNvbm5lY3RMaW5rczogU2V0PHN0cmluZz58bnVsbCA9IG51bGw7XG5cbiAgLypcbiAgICogS2VlcCB0cmFjayBvZiBhbGwgYWxyZWFkeSBzZWVuIG9yaWdpbiBVUkxzIHRvIGF2b2lkIHJlcGVhdGluZyB0aGUgc2FtZSBjaGVjay5cbiAgICovXG4gIHByaXZhdGUgYWxyZWFkeVNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIHdpbmRvdzogV2luZG93fG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgYmxvY2tsaXN0ID0gbmV3IFNldDxzdHJpbmc+KElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBhc3NlcnREZXZNb2RlKCdwcmVjb25uZWN0IGxpbmsgY2hlY2tlcicpO1xuICAgIGNvbnN0IHdpbiA9IHRoaXMuZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICB9XG4gICAgY29uc3QgYmxvY2tsaXN0ID0gaW5qZWN0KFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICBpZiAoYmxvY2tsaXN0KSB7XG4gICAgICB0aGlzLnBvcHVsYXRlQmxvY2tsaXN0KGJsb2NrbGlzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwb3B1bGF0ZUJsb2NrbGlzdChvcmlnaW5zOiBBcnJheTxzdHJpbmd8c3RyaW5nW10+KSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3JpZ2lucykpIHtcbiAgICAgIGRlZXBGb3JFYWNoKG9yaWdpbnMsIG9yaWdpbiA9PiB7XG4gICAgICAgIHRoaXMuYmxvY2tsaXN0LmFkZChleHRyYWN0SG9zdG5hbWUob3JpZ2luKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsXG4gICAgICAgICAgYFRoZSBibG9ja2xpc3QgZm9yIHRoZSBwcmVjb25uZWN0IGNoZWNrIHdhcyBub3QgcHJvdmlkZWQgYXMgYW4gYXJyYXkuIGAgK1xuICAgICAgICAgICAgICBgQ2hlY2sgdGhhdCB0aGUgXFxgUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1RcXGAgdG9rZW4gaXMgY29uZmlndXJlZCBhcyBhIFxcYG11bHRpOiB0cnVlXFxgIHByb3ZpZGVyLmApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhhdCBhIHByZWNvbm5lY3QgcmVzb3VyY2UgaGludCBleGlzdHMgaW4gdGhlIGhlYWQgZm8gcnRoZVxuICAgKiBnaXZlbiBzcmMuXG4gICAqXG4gICAqIEBwYXJhbSByZXdyaXR0ZW5TcmMgc3JjIGZvcm1hdHRlZCB3aXRoIGxvYWRlclxuICAgKiBAcGFyYW0gcmF3U3JjIHJhd1NyYyB2YWx1ZVxuICAgKi9cbiAgYXNzZXJ0UHJlY29ubmVjdChyZXdyaXR0ZW5TcmM6IHN0cmluZywgcmF3U3JjOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMud2luZG93KSByZXR1cm47XG5cbiAgICBjb25zdCBpbWdVcmwgPSBnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyk7XG4gICAgaWYgKHRoaXMuYmxvY2tsaXN0LmhhcyhpbWdVcmwuaG9zdG5hbWUpIHx8IHRoaXMuYWxyZWFkeVNlZW4uaGFzKGltZ1VybC5vcmlnaW4pKSByZXR1cm47XG5cbiAgICAvLyBSZWdpc3RlciB0aGlzIG9yaWdpbiBhcyBzZWVuLCBzbyB3ZSBkb24ndCBjaGVjayBpdCBhZ2FpbiBsYXRlci5cbiAgICB0aGlzLmFscmVhZHlTZWVuLmFkZChpbWdVcmwub3JpZ2luKTtcblxuICAgIGlmICghdGhpcy5wcmVjb25uZWN0TGlua3MpIHtcbiAgICAgIC8vIE5vdGU6IHdlIHF1ZXJ5IGZvciBwcmVjb25uZWN0IGxpbmtzIG9ubHkgKm9uY2UqIGFuZCBjYWNoZSB0aGUgcmVzdWx0c1xuICAgICAgLy8gZm9yIHRoZSBlbnRpcmUgbGlmZXNwYW4gb2YgYW4gYXBwbGljYXRpb24sIHNpbmNlIGl0J3MgdW5saWtlbHkgdGhhdCB0aGVcbiAgICAgIC8vIGxpc3Qgd291bGQgY2hhbmdlIGZyZXF1ZW50bHkuIFRoaXMgYWxsb3dzIHRvIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm9cbiAgICAgIC8vIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9ucyBvZiBtYWtpbmcgZXh0cmEgRE9NIGxvb2t1cHMgZm9yIGVhY2ggaW1hZ2UuXG4gICAgICB0aGlzLnByZWNvbm5lY3RMaW5rcyA9IHRoaXMucXVlcnlQcmVjb25uZWN0TGlua3MoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucHJlY29ubmVjdExpbmtzLmhhcyhpbWdVcmwub3JpZ2luKSkge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlBSSU9SSVRZX0lNR19NSVNTSU5HX1BSRUNPTk5FQ1RfVEFHLFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMocmF3U3JjKX0gdGhlcmUgaXMgbm8gcHJlY29ubmVjdCB0YWcgcHJlc2VudCBmb3IgdGhpcyBpbWFnZS4gYCArXG4gICAgICAgICAgICAgIGBQcmVjb25uZWN0aW5nIHRvIHRoZSBvcmlnaW4ocykgdGhhdCBzZXJ2ZSBwcmlvcml0eSBpbWFnZXMgZW5zdXJlcyB0aGF0IHRoZXNlIGAgK1xuICAgICAgICAgICAgICBgaW1hZ2VzIGFyZSBkZWxpdmVyZWQgYXMgc29vbiBhcyBwb3NzaWJsZS4gVG8gZml4IHRoaXMsIHBsZWFzZSBhZGQgdGhlIGZvbGxvd2luZyBgICtcbiAgICAgICAgICAgICAgYGVsZW1lbnQgaW50byB0aGUgPGhlYWQ+IG9mIHRoZSBkb2N1bWVudDpcXG5gICtcbiAgICAgICAgICAgICAgYCAgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiIGhyZWY9XCIke2ltZ1VybC5vcmlnaW59XCI+YCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcXVlcnlQcmVjb25uZWN0TGlua3MoKTogU2V0PHN0cmluZz4ge1xuICAgIGNvbnN0IHByZWNvbm5lY3RVcmxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnbGlua1tyZWw9cHJlY29ubmVjdF0nO1xuICAgIGNvbnN0IGxpbmtzOiBIVE1MTGlua0VsZW1lbnRbXSA9IEFycmF5LmZyb20odGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgZm9yIChsZXQgbGluayBvZiBsaW5rcykge1xuICAgICAgY29uc3QgdXJsID0gZ2V0VXJsKGxpbmsuaHJlZiwgdGhpcy53aW5kb3chKTtcbiAgICAgIHByZWNvbm5lY3RVcmxzLmFkZCh1cmwub3JpZ2luKTtcbiAgICB9XG4gICAgcmV0dXJuIHByZWNvbm5lY3RVcmxzO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5wcmVjb25uZWN0TGlua3M/LmNsZWFyKCk7XG4gICAgdGhpcy5hbHJlYWR5U2Vlbi5jbGVhcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyBhIGNhbGxiYWNrIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5LiBBbHNvIGludm9rZXMgYSBjYWxsYmFja1xuICogcmVjdXJzaXZlbHkgZm9yIGVhY2ggbmVzdGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBkZWVwRm9yRWFjaDxUPihpbnB1dDogKFR8YW55W10pW10sIGZuOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChsZXQgdmFsdWUgb2YgaW5wdXQpIHtcbiAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IGRlZXBGb3JFYWNoKHZhbHVlLCBmbikgOiBmbih2YWx1ZSk7XG4gIH1cbn1cbiJdfQ==