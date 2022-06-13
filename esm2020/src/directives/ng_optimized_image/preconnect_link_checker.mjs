/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, ɵRuntimeError as RuntimeError } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { assertDevMode } from './asserts';
import { deepForEach, extractHostname, getUrl, imgDirectiveDetails } from './util';
import * as i0 from "@angular/core";
// Set of origins that are always excluded from the preconnect checks.
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
/**
 * Multi-provider injection token to configure which origins should be excluded
 * from the preconnect checks. If can either be a single string or an array of strings
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
    constructor(doc, blocklist) {
        this.doc = doc;
        // Set of <link rel="preconnect"> tags found on this page.
        // The `null` value indicates that there was no DOM query operation performed.
        this.preconnectLinks = null;
        // Keep track of all already seen origin URLs to avoid repeating the same check.
        this.alreadySeen = new Set();
        this.window = null;
        this.blocklist = new Set(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);
        assertDevMode('preconnect link checker');
        const win = doc.defaultView;
        if (typeof win !== 'undefined') {
            this.window = win;
        }
        if (blocklist) {
            this.pupulateBlocklist(blocklist);
        }
    }
    pupulateBlocklist(origins) {
        if (Array.isArray(origins)) {
            deepForEach(origins, origin => {
                this.blocklist.add(extractHostname(origin));
            });
        }
        else {
            throw new RuntimeError(2957 /* INVALID_PRECONNECT_CHECK_BLOCKLIST */, `The blocklist for the preconnect check was not provided as an array. ` +
                `Check that the \`PRECONNECT_CHECK_BLOCKLIST\` token is configured as a \`multi: true\` provider.`);
        }
    }
    check(rewrittenSrc, rawSrc) {
        if (!this.window)
            return;
        const imgUrl = getUrl(rewrittenSrc, this.window);
        if (this.blocklist.has(imgUrl.hostname) || this.alreadySeen.has(imgUrl.origin))
            return;
        // Register this origin as seen, so we don't check it again later.
        this.alreadySeen.add(imgUrl.origin);
        if (this.preconnectLinks === null) {
            // Note: we query for preconnect links only *once* and cache the results
            // for the entire lifespan of an application, since it's unlikely that the
            // list would change frequently. This allows to make sure there are no
            // performance implications of making extra DOM lookups for each image.
            this.preconnectLinks = this.queryPreconnectLinks();
        }
        if (!this.preconnectLinks.has(imgUrl.origin)) {
            console.warn(formatRuntimeError(2956 /* PRIORITY_IMG_MISSING_PRECONNECT_TAG */, `${imgDirectiveDetails(rawSrc)} has detected that this image ` +
                `contains the "priority" attribute, but doesn't have a corresponding ` +
                `preconnect tag. Please add the following element into ` +
                `the <head> of the document to optimize loading of this image:\n` +
                `  <link rel="preconnect" href="${imgUrl.origin}">`));
        }
    }
    queryPreconnectLinks() {
        const preconnectURLs = new Set();
        const selector = 'link[rel=preconnect]';
        const links = (this.doc.head?.querySelectorAll(selector) ?? []);
        links.forEach(link => {
            const url = getUrl(link.href, this.window);
            preconnectURLs.add(url.origin);
        });
        return preconnectURLs;
    }
    ngOnDestroy() {
        this.preconnectLinks?.clear();
        this.alreadySeen.clear();
    }
}
PreconnectLinkChecker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11+sha-5af8e46", ngImport: i0, type: PreconnectLinkChecker, deps: [{ token: DOCUMENT }, { token: PRECONNECT_CHECK_BLOCKLIST, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
PreconnectLinkChecker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.11+sha-5af8e46", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11+sha-5af8e46", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: Array, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PRECONNECT_CHECK_BLOCKLIST]
                }] }]; } });
// #####################
// Copied from /core/src/errors.ts` since the function is not exposed in
// Angular v12, v13.
// #####################
export const ERROR_DETAILS_PAGE_BASE_URL = 'https://angular.io/errors';
function formatRuntimeError(code, message) {
    // Error code might be a negative number, which is a special marker that instructs the logic to
    // generate a link to the error details page on angular.io.
    const fullCode = `NG0${Math.abs(code)}`;
    let errorMessage = `${fullCode}${message ? ': ' + message : ''}`;
    if (ngDevMode && code < 0) {
        errorMessage = `${errorMessage}. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
    }
    return errorMessage;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUxRyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHMUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRWpGLHNFQUFzRTtBQUN0RSxNQUFNLG1DQUFtQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTNGOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUNuQyxJQUFJLGNBQWMsQ0FBeUIsNEJBQTRCLENBQUMsQ0FBQztBQUU3RTs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBWWhDLFlBQzhCLEdBQWEsRUFDUyxTQUFzQztRQUQ1RCxRQUFHLEdBQUgsR0FBRyxDQUFVO1FBWjNDLDBEQUEwRDtRQUMxRCw4RUFBOEU7UUFDdEUsb0JBQWUsR0FBcUIsSUFBSSxDQUFDO1FBRWpELGdGQUFnRjtRQUN4RSxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFaEMsV0FBTSxHQUFnQixJQUFJLENBQUM7UUFFM0IsY0FBUyxHQUFHLElBQUksR0FB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QkFhcEIsUUFBUSxhQUNJLDBCQUEwQjtpSUFkdkMscUJBQXFCLGNBRFQsTUFBTTtzR0FDbEIscUJBQXFCO2tCQURqQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzswREFjSyxRQUFROzBCQUF0QyxNQUFNOzJCQUFDLFFBQVE7OEJBQzJDLEtBQUs7MEJBQS9ELFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsMEJBQTBCOztBQXFFcEQsd0JBQXdCO0FBQ3hCLHdFQUF3RTtBQUN4RSxvQkFBb0I7QUFDcEIsd0JBQXdCO0FBRXhCLE1BQU0sQ0FBQyxNQUFNLDJCQUEyQixHQUFHLDJCQUEyQixDQUFDO0FBRXZFLFNBQVMsa0JBQWtCLENBQ3ZCLElBQU8sRUFBRSxPQUEwQjtJQUNyQywrRkFBK0Y7SUFDL0YsMkRBQTJEO0lBQzNELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBRXhDLElBQUksWUFBWSxHQUFHLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7SUFFakUsSUFBSSxTQUFTLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtRQUN6QixZQUFZLEdBQUcsR0FBRyxZQUFZLGtCQUFrQiwyQkFBMkIsSUFBSSxRQUFRLEVBQUUsQ0FBQztLQUMzRjtJQUNELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbCwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7ZGVlcEZvckVhY2gsIGV4dHJhY3RIb3N0bmFtZSwgZ2V0VXJsLCBpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL3V0aWwnO1xuXG4vLyBTZXQgb2Ygb3JpZ2lucyB0aGF0IGFyZSBhbHdheXMgZXhjbHVkZWQgZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuXG5jb25zdCBJTlRFUk5BTF9QUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCA9IG5ldyBTZXQoWydsb2NhbGhvc3QnLCAnMTI3LjAuMC4xJywgJzAuMC4wLjAnXSk7XG5cbi8qKlxuICogTXVsdGktcHJvdmlkZXIgaW5qZWN0aW9uIHRva2VuIHRvIGNvbmZpZ3VyZSB3aGljaCBvcmlnaW5zIHNob3VsZCBiZSBleGNsdWRlZFxuICogZnJvbSB0aGUgcHJlY29ubmVjdCBjaGVja3MuIElmIGNhbiBlaXRoZXIgYmUgYSBzaW5nbGUgc3RyaW5nIG9yIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAqIHRvIHJlcHJlc2VudCBhIGdyb3VwIG9mIG9yaWdpbnMsIGZvciBleGFtcGxlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICB7cHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIG11bHRpOiB0cnVlLCB1c2VWYWx1ZTogJ2h0dHBzOi8veW91ci1kb21haW4uY29tJ31cbiAqIGBgYFxuICpcbiAqIG9yOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICB7cHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsIG11bHRpOiB0cnVlLFxuICogICB1c2VWYWx1ZTogWydodHRwczovL3lvdXItZG9tYWluLTEuY29tJywgJ2h0dHBzOi8veW91ci1kb21haW4tMi5jb20nXX1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxBcnJheTxzdHJpbmd8c3RyaW5nW10+PignUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QnKTtcblxuLyoqXG4gKiBDb250YWlucyB0aGUgbG9naWMgdG8gZGV0ZWN0IHdoZXRoZXIgYW4gaW1hZ2UsIG1hcmtlZCB3aXRoIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlXG4gKiBoYXMgYSBjb3JyZXNwb25kaW5nIGA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+YCB0YWcgaW4gdGhlIGBkb2N1bWVudC5oZWFkYC5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFByZWNvbm5lY3RMaW5rQ2hlY2tlciB7XG4gIC8vIFNldCBvZiA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+IHRhZ3MgZm91bmQgb24gdGhpcyBwYWdlLlxuICAvLyBUaGUgYG51bGxgIHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZXJlIHdhcyBubyBET00gcXVlcnkgb3BlcmF0aW9uIHBlcmZvcm1lZC5cbiAgcHJpdmF0ZSBwcmVjb25uZWN0TGlua3M6IFNldDxzdHJpbmc+fG51bGwgPSBudWxsO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2YgYWxsIGFscmVhZHkgc2VlbiBvcmlnaW4gVVJMcyB0byBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgY2hlY2suXG4gIHByaXZhdGUgYWxyZWFkeVNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIHdpbmRvdzogV2luZG93fG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgYmxvY2tsaXN0ID0gbmV3IFNldDxzdHJpbmc+KElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jOiBEb2N1bWVudCxcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QpIGJsb2NrbGlzdDogQXJyYXk8c3RyaW5nfHN0cmluZ1tdPnxudWxsKSB7XG4gICAgYXNzZXJ0RGV2TW9kZSgncHJlY29ubmVjdCBsaW5rIGNoZWNrZXInKTtcbiAgICBjb25zdCB3aW4gPSBkb2MuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICB9XG4gICAgaWYgKGJsb2NrbGlzdCkge1xuICAgICAgdGhpcy5wdXB1bGF0ZUJsb2NrbGlzdChibG9ja2xpc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcHVwdWxhdGVCbG9ja2xpc3Qob3JpZ2luczogQXJyYXk8c3RyaW5nfHN0cmluZ1tdPikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9yaWdpbnMpKSB7XG4gICAgICBkZWVwRm9yRWFjaChvcmlnaW5zLCBvcmlnaW4gPT4ge1xuICAgICAgICB0aGlzLmJsb2NrbGlzdC5hZGQoZXh0cmFjdEhvc3RuYW1lKG9yaWdpbikpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULFxuICAgICAgICAgIGBUaGUgYmxvY2tsaXN0IGZvciB0aGUgcHJlY29ubmVjdCBjaGVjayB3YXMgbm90IHByb3ZpZGVkIGFzIGFuIGFycmF5LiBgICtcbiAgICAgICAgICAgICAgYENoZWNrIHRoYXQgdGhlIFxcYFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUXFxgIHRva2VuIGlzIGNvbmZpZ3VyZWQgYXMgYSBcXGBtdWx0aTogdHJ1ZVxcYCBwcm92aWRlci5gKTtcbiAgICB9XG4gIH1cblxuICBjaGVjayhyZXdyaXR0ZW5TcmM6IHN0cmluZywgcmF3U3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMud2luZG93KSByZXR1cm47XG5cbiAgICBjb25zdCBpbWdVcmwgPSBnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyk7XG4gICAgaWYgKHRoaXMuYmxvY2tsaXN0LmhhcyhpbWdVcmwuaG9zdG5hbWUpIHx8IHRoaXMuYWxyZWFkeVNlZW4uaGFzKGltZ1VybC5vcmlnaW4pKSByZXR1cm47XG5cbiAgICAvLyBSZWdpc3RlciB0aGlzIG9yaWdpbiBhcyBzZWVuLCBzbyB3ZSBkb24ndCBjaGVjayBpdCBhZ2FpbiBsYXRlci5cbiAgICB0aGlzLmFscmVhZHlTZWVuLmFkZChpbWdVcmwub3JpZ2luKTtcblxuICAgIGlmICh0aGlzLnByZWNvbm5lY3RMaW5rcyA9PT0gbnVsbCkge1xuICAgICAgLy8gTm90ZTogd2UgcXVlcnkgZm9yIHByZWNvbm5lY3QgbGlua3Mgb25seSAqb25jZSogYW5kIGNhY2hlIHRoZSByZXN1bHRzXG4gICAgICAvLyBmb3IgdGhlIGVudGlyZSBsaWZlc3BhbiBvZiBhbiBhcHBsaWNhdGlvbiwgc2luY2UgaXQncyB1bmxpa2VseSB0aGF0IHRoZVxuICAgICAgLy8gbGlzdCB3b3VsZCBjaGFuZ2UgZnJlcXVlbnRseS4gVGhpcyBhbGxvd3MgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBub1xuICAgICAgLy8gcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zIG9mIG1ha2luZyBleHRyYSBET00gbG9va3VwcyBmb3IgZWFjaCBpbWFnZS5cbiAgICAgIHRoaXMucHJlY29ubmVjdExpbmtzID0gdGhpcy5xdWVyeVByZWNvbm5lY3RMaW5rcygpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5wcmVjb25uZWN0TGlua3MuaGFzKGltZ1VybC5vcmlnaW4pKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUFJJT1JJVFlfSU1HX01JU1NJTkdfUFJFQ09OTkVDVF9UQUcsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhyYXdTcmMpfSBoYXMgZGV0ZWN0ZWQgdGhhdCB0aGlzIGltYWdlIGAgK1xuICAgICAgICAgICAgICBgY29udGFpbnMgdGhlIFwicHJpb3JpdHlcIiBhdHRyaWJ1dGUsIGJ1dCBkb2Vzbid0IGhhdmUgYSBjb3JyZXNwb25kaW5nIGAgK1xuICAgICAgICAgICAgICBgcHJlY29ubmVjdCB0YWcuIFBsZWFzZSBhZGQgdGhlIGZvbGxvd2luZyBlbGVtZW50IGludG8gYCArXG4gICAgICAgICAgICAgIGB0aGUgPGhlYWQ+IG9mIHRoZSBkb2N1bWVudCB0byBvcHRpbWl6ZSBsb2FkaW5nIG9mIHRoaXMgaW1hZ2U6XFxuYCArXG4gICAgICAgICAgICAgIGAgIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIiBocmVmPVwiJHtpbWdVcmwub3JpZ2lufVwiPmApKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHF1ZXJ5UHJlY29ubmVjdExpbmtzKCk6IFNldDxzdHJpbmc+IHtcbiAgICBjb25zdCBwcmVjb25uZWN0VVJMcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gJ2xpbmtbcmVsPXByZWNvbm5lY3RdJztcbiAgICBjb25zdCBsaW5rcyA9ICh0aGlzLmRvYy5oZWFkPy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA/PyBbXSkgYXMgdW5rbm93biBhcyBIVE1MTGlua0VsZW1lbnRbXTtcbiAgICBsaW5rcy5mb3JFYWNoKGxpbmsgPT4ge1xuICAgICAgY29uc3QgdXJsID0gZ2V0VXJsKGxpbmsuaHJlZiwgdGhpcy53aW5kb3chKTtcbiAgICAgIHByZWNvbm5lY3RVUkxzLmFkZCh1cmwub3JpZ2luKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcHJlY29ubmVjdFVSTHM7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnByZWNvbm5lY3RMaW5rcz8uY2xlYXIoKTtcbiAgICB0aGlzLmFscmVhZHlTZWVuLmNsZWFyKCk7XG4gIH1cbn1cblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBDb3BpZWQgZnJvbSAvY29yZS9zcmMvZXJyb3JzLnRzYCBzaW5jZSB0aGUgZnVuY3Rpb24gaXMgbm90IGV4cG9zZWQgaW5cbi8vIEFuZ3VsYXIgdjEyLCB2MTMuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuZXhwb3J0IGNvbnN0IEVSUk9SX0RFVEFJTFNfUEFHRV9CQVNFX1VSTCA9ICdodHRwczovL2FuZ3VsYXIuaW8vZXJyb3JzJztcblxuZnVuY3Rpb24gZm9ybWF0UnVudGltZUVycm9yPFQgZXh0ZW5kcyBudW1iZXIgPSBSdW50aW1lRXJyb3JDb2RlPihcbiAgICBjb2RlOiBULCBtZXNzYWdlOiBudWxsfGZhbHNlfHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEVycm9yIGNvZGUgbWlnaHQgYmUgYSBuZWdhdGl2ZSBudW1iZXIsIHdoaWNoIGlzIGEgc3BlY2lhbCBtYXJrZXIgdGhhdCBpbnN0cnVjdHMgdGhlIGxvZ2ljIHRvXG4gIC8vIGdlbmVyYXRlIGEgbGluayB0byB0aGUgZXJyb3IgZGV0YWlscyBwYWdlIG9uIGFuZ3VsYXIuaW8uXG4gIGNvbnN0IGZ1bGxDb2RlID0gYE5HMCR7TWF0aC5hYnMoY29kZSl9YDtcblxuICBsZXQgZXJyb3JNZXNzYWdlID0gYCR7ZnVsbENvZGV9JHttZXNzYWdlID8gJzogJyArIG1lc3NhZ2UgOiAnJ31gO1xuXG4gIGlmIChuZ0Rldk1vZGUgJiYgY29kZSA8IDApIHtcbiAgICBlcnJvck1lc3NhZ2UgPSBgJHtlcnJvck1lc3NhZ2V9LiBGaW5kIG1vcmUgYXQgJHtFUlJPUl9ERVRBSUxTX1BBR0VfQkFTRV9VUkx9LyR7ZnVsbENvZGV9YDtcbiAgfVxuICByZXR1cm4gZXJyb3JNZXNzYWdlO1xufVxuIl19