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
        const win = inject(DOCUMENT).defaultView;
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
        const links = Array.from(document.querySelectorAll(selector));
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
PreconnectLinkChecker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0-next.0+sha-c467eb7", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
PreconnectLinkChecker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.3.0-next.0+sha-c467eb7", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0-next.0+sha-c467eb7", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTNJLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUcxQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxlQUFlLEVBQUUsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDOztBQUU5QyxzRUFBc0U7QUFDdEUsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUUzRjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQ25DLElBQUksY0FBYyxDQUF5Qiw0QkFBNEIsQ0FBQyxDQUFDO0FBRTdFOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyxxQkFBcUI7SUFnQmhDO1FBZkE7OztXQUdHO1FBQ0ssb0JBQWUsR0FBcUIsSUFBSSxDQUFDO1FBRWpEOztXQUVHO1FBQ0ssZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRWhDLFdBQU0sR0FBZ0IsSUFBSSxDQUFDO1FBRTNCLGNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBUyxtQ0FBbUMsQ0FBQyxDQUFDO1FBR3ZFLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFDekMsSUFBSSxPQUFPLEdBQUcsS0FBSyxXQUFXLEVBQUU7WUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7U0FDbkI7UUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsMEJBQTBCLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLFNBQVMsRUFBRTtZQUNiLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNuQztJQUNILENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxPQUErQjtRQUN2RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDMUIsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7U0FDSjthQUFNO1lBQ0wsTUFBTSxJQUFJLFlBQVksaUVBRWxCLHVFQUF1RTtnQkFDbkUsa0dBQWtHLENBQUMsQ0FBQztTQUM3RztJQUNILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxnQkFBZ0IsQ0FBQyxZQUFvQixFQUFFLE1BQWM7UUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUV6QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQUUsT0FBTztRQUV2RixrRUFBa0U7UUFDbEUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXBDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3pCLHdFQUF3RTtZQUN4RSwwRUFBMEU7WUFDMUUsc0VBQXNFO1lBQ3RFLHVFQUF1RTtZQUN2RSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixrRUFFM0IsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsc0RBQXNEO2dCQUNoRiwrRUFBK0U7Z0JBQy9FLGtGQUFrRjtnQkFDbEYsNENBQTRDO2dCQUM1QyxrQ0FBa0MsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMvRDtJQUNILENBQUM7SUFFTyxvQkFBb0I7UUFDMUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUN6QyxNQUFNLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQztRQUN4QyxNQUFNLEtBQUssR0FBc0IsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNqRixLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN0QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUM7WUFDNUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEM7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDOzs2SEExRlUscUJBQXFCO2lJQUFyQixxQkFBcUIsY0FEVCxNQUFNO3NHQUNsQixxQkFBcUI7a0JBRGpDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOztBQThGaEM7OztHQUdHO0FBQ0gsU0FBUyxXQUFXLENBQUksS0FBa0IsRUFBRSxFQUFzQjtJQUNoRSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssRUFBRTtRQUN2QixLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDM0Q7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2V4dHJhY3RIb3N0bmFtZSwgZ2V0VXJsfSBmcm9tICcuL3VybCc7XG5cbi8vIFNldCBvZiBvcmlnaW5zIHRoYXQgYXJlIGFsd2F5cyBleGNsdWRlZCBmcm9tIHRoZSBwcmVjb25uZWN0IGNoZWNrcy5cbmNvbnN0IElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUID0gbmV3IFNldChbJ2xvY2FsaG9zdCcsICcxMjcuMC4wLjEnLCAnMC4wLjAuMCddKTtcblxuLyoqXG4gKiBNdWx0aS1wcm92aWRlciBpbmplY3Rpb24gdG9rZW4gdG8gY29uZmlndXJlIHdoaWNoIG9yaWdpbnMgc2hvdWxkIGJlIGV4Y2x1ZGVkXG4gKiBmcm9tIHRoZSBwcmVjb25uZWN0IGNoZWNrcy4gSXQgY2FuIGVpdGhlciBiZSBhIHNpbmdsZSBzdHJpbmcgb3IgYW4gYXJyYXkgb2Ygc3RyaW5nc1xuICogdG8gcmVwcmVzZW50IGEgZ3JvdXAgb2Ygb3JpZ2lucywgZm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCwgbXVsdGk6IHRydWUsIHVzZVZhbHVlOiAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20nfVxuICogYGBgXG4gKlxuICogb3I6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCwgbXVsdGk6IHRydWUsXG4gKiAgIHVzZVZhbHVlOiBbJ2h0dHBzOi8veW91ci1kb21haW4tMS5jb20nLCAnaHR0cHM6Ly95b3VyLWRvbWFpbi0yLmNvbSddfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuZXhwb3J0IGNvbnN0IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48QXJyYXk8c3RyaW5nfHN0cmluZ1tdPj4oJ1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUJyk7XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGxvZ2ljIHRvIGRldGVjdCB3aGV0aGVyIGFuIGltYWdlLCBtYXJrZWQgd2l0aCB0aGUgXCJwcmlvcml0eVwiIGF0dHJpYnV0ZVxuICogaGFzIGEgY29ycmVzcG9uZGluZyBgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPmAgdGFnIGluIHRoZSBgZG9jdW1lbnQuaGVhZGAuXG4gKlxuICogTm90ZTogdGhpcyBpcyBhIGRldi1tb2RlIG9ubHkgY2xhc3MsIHdoaWNoIHNob3VsZCBub3QgYXBwZWFyIGluIHByb2QgYnVuZGxlcyxcbiAqIHRodXMgdGhlcmUgaXMgbm8gYG5nRGV2TW9kZWAgdXNlIGluIHRoZSBjb2RlLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBQcmVjb25uZWN0TGlua0NoZWNrZXIge1xuICAvKipcbiAgICogU2V0IG9mIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj4gdGFncyBmb3VuZCBvbiB0aGlzIHBhZ2UuXG4gICAqIFRoZSBgbnVsbGAgdmFsdWUgaW5kaWNhdGVzIHRoYXQgdGhlcmUgd2FzIG5vIERPTSBxdWVyeSBvcGVyYXRpb24gcGVyZm9ybWVkLlxuICAgKi9cbiAgcHJpdmF0ZSBwcmVjb25uZWN0TGlua3M6IFNldDxzdHJpbmc+fG51bGwgPSBudWxsO1xuXG4gIC8qXG4gICAqIEtlZXAgdHJhY2sgb2YgYWxsIGFscmVhZHkgc2VlbiBvcmlnaW4gVVJMcyB0byBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgY2hlY2suXG4gICAqL1xuICBwcml2YXRlIGFscmVhZHlTZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvd3xudWxsID0gbnVsbDtcblxuICBwcml2YXRlIGJsb2NrbGlzdCA9IG5ldyBTZXQ8c3RyaW5nPihJTlRFUk5BTF9QUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgYXNzZXJ0RGV2TW9kZSgncHJlY29ubmVjdCBsaW5rIGNoZWNrZXInKTtcbiAgICBjb25zdCB3aW4gPSBpbmplY3QoRE9DVU1FTlQpLmRlZmF1bHRWaWV3O1xuICAgIGlmICh0eXBlb2Ygd2luICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy53aW5kb3cgPSB3aW47XG4gICAgfVxuICAgIGNvbnN0IGJsb2NrbGlzdCA9IGluamVjdChQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCwge29wdGlvbmFsOiB0cnVlfSk7XG4gICAgaWYgKGJsb2NrbGlzdCkge1xuICAgICAgdGhpcy5wb3B1bGF0ZUJsb2NrbGlzdChibG9ja2xpc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcG9wdWxhdGVCbG9ja2xpc3Qob3JpZ2luczogQXJyYXk8c3RyaW5nfHN0cmluZ1tdPikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9yaWdpbnMpKSB7XG4gICAgICBkZWVwRm9yRWFjaChvcmlnaW5zLCBvcmlnaW4gPT4ge1xuICAgICAgICB0aGlzLmJsb2NrbGlzdC5hZGQoZXh0cmFjdEhvc3RuYW1lKG9yaWdpbikpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULFxuICAgICAgICAgIGBUaGUgYmxvY2tsaXN0IGZvciB0aGUgcHJlY29ubmVjdCBjaGVjayB3YXMgbm90IHByb3ZpZGVkIGFzIGFuIGFycmF5LiBgICtcbiAgICAgICAgICAgICAgYENoZWNrIHRoYXQgdGhlIFxcYFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUXFxgIHRva2VuIGlzIGNvbmZpZ3VyZWQgYXMgYSBcXGBtdWx0aTogdHJ1ZVxcYCBwcm92aWRlci5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoYXQgYSBwcmVjb25uZWN0IHJlc291cmNlIGhpbnQgZXhpc3RzIGluIHRoZSBoZWFkIGZvIHJ0aGVcbiAgICogZ2l2ZW4gc3JjLlxuICAgKlxuICAgKiBAcGFyYW0gcmV3cml0dGVuU3JjIHNyYyBmb3JtYXR0ZWQgd2l0aCBsb2FkZXJcbiAgICogQHBhcmFtIHJhd1NyYyByYXdTcmMgdmFsdWVcbiAgICovXG4gIGFzc2VydFByZWNvbm5lY3QocmV3cml0dGVuU3JjOiBzdHJpbmcsIHJhd1NyYzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndpbmRvdykgcmV0dXJuO1xuXG4gICAgY29uc3QgaW1nVXJsID0gZ2V0VXJsKHJld3JpdHRlblNyYywgdGhpcy53aW5kb3cpO1xuICAgIGlmICh0aGlzLmJsb2NrbGlzdC5oYXMoaW1nVXJsLmhvc3RuYW1lKSB8fCB0aGlzLmFscmVhZHlTZWVuLmhhcyhpbWdVcmwub3JpZ2luKSkgcmV0dXJuO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhpcyBvcmlnaW4gYXMgc2Vlbiwgc28gd2UgZG9uJ3QgY2hlY2sgaXQgYWdhaW4gbGF0ZXIuXG4gICAgdGhpcy5hbHJlYWR5U2Vlbi5hZGQoaW1nVXJsLm9yaWdpbik7XG5cbiAgICBpZiAoIXRoaXMucHJlY29ubmVjdExpbmtzKSB7XG4gICAgICAvLyBOb3RlOiB3ZSBxdWVyeSBmb3IgcHJlY29ubmVjdCBsaW5rcyBvbmx5ICpvbmNlKiBhbmQgY2FjaGUgdGhlIHJlc3VsdHNcbiAgICAgIC8vIGZvciB0aGUgZW50aXJlIGxpZmVzcGFuIG9mIGFuIGFwcGxpY2F0aW9uLCBzaW5jZSBpdCdzIHVubGlrZWx5IHRoYXQgdGhlXG4gICAgICAvLyBsaXN0IHdvdWxkIGNoYW5nZSBmcmVxdWVudGx5LiBUaGlzIGFsbG93cyB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vXG4gICAgICAvLyBwZXJmb3JtYW5jZSBpbXBsaWNhdGlvbnMgb2YgbWFraW5nIGV4dHJhIERPTSBsb29rdXBzIGZvciBlYWNoIGltYWdlLlxuICAgICAgdGhpcy5wcmVjb25uZWN0TGlua3MgPSB0aGlzLnF1ZXJ5UHJlY29ubmVjdExpbmtzKCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnByZWNvbm5lY3RMaW5rcy5oYXMoaW1nVXJsLm9yaWdpbikpIHtcbiAgICAgIGNvbnNvbGUud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5QUklPUklUWV9JTUdfTUlTU0lOR19QUkVDT05ORUNUX1RBRyxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKHJhd1NyYyl9IHRoZXJlIGlzIG5vIHByZWNvbm5lY3QgdGFnIHByZXNlbnQgZm9yIHRoaXMgaW1hZ2UuIGAgK1xuICAgICAgICAgICAgICBgUHJlY29ubmVjdGluZyB0byB0aGUgb3JpZ2luKHMpIHRoYXQgc2VydmUgcHJpb3JpdHkgaW1hZ2VzIGVuc3VyZXMgdGhhdCB0aGVzZSBgICtcbiAgICAgICAgICAgICAgYGltYWdlcyBhcmUgZGVsaXZlcmVkIGFzIHNvb24gYXMgcG9zc2libGUuIFRvIGZpeCB0aGlzLCBwbGVhc2UgYWRkIHRoZSBmb2xsb3dpbmcgYCArXG4gICAgICAgICAgICAgIGBlbGVtZW50IGludG8gdGhlIDxoZWFkPiBvZiB0aGUgZG9jdW1lbnQ6XFxuYCArXG4gICAgICAgICAgICAgIGAgIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIiBocmVmPVwiJHtpbWdVcmwub3JpZ2lufVwiPmApKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHF1ZXJ5UHJlY29ubmVjdExpbmtzKCk6IFNldDxzdHJpbmc+IHtcbiAgICBjb25zdCBwcmVjb25uZWN0VXJscyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gJ2xpbmtbcmVsPXByZWNvbm5lY3RdJztcbiAgICBjb25zdCBsaW5rczogSFRNTExpbmtFbGVtZW50W10gPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICBmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XG4gICAgICBjb25zdCB1cmwgPSBnZXRVcmwobGluay5ocmVmLCB0aGlzLndpbmRvdyEpO1xuICAgICAgcHJlY29ubmVjdFVybHMuYWRkKHVybC5vcmlnaW4pO1xuICAgIH1cbiAgICByZXR1cm4gcHJlY29ubmVjdFVybHM7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnByZWNvbm5lY3RMaW5rcz8uY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlTZWVuLmNsZWFyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgYXJyYXkuIEFsc28gaW52b2tlcyBhIGNhbGxiYWNrXG4gKiByZWN1cnNpdmVseSBmb3IgZWFjaCBuZXN0ZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGRlZXBGb3JFYWNoPFQ+KGlucHV0OiAoVHxhbnlbXSlbXSwgZm46ICh2YWx1ZTogVCkgPT4gdm9pZCk6IHZvaWQge1xuICBmb3IgKGxldCB2YWx1ZSBvZiBpbnB1dCkge1xuICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gZGVlcEZvckVhY2godmFsdWUsIGZuKSA6IGZuKHZhbHVlKTtcbiAgfVxufVxuIl19