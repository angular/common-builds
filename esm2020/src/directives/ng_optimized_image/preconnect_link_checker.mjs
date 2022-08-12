/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError } from '@angular/core';
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
        const links = Array.from(document.querySelectorAll('link[rel=preconnect]'));
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
PreconnectLinkChecker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-0a9601b", ngImport: i0, type: PreconnectLinkChecker, deps: [{ token: DOCUMENT }, { token: PRECONNECT_CHECK_BLOCKLIST, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
PreconnectLinkChecker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-0a9601b", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-0a9601b", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
// Invokes a callback for each element in the array. Also invokes a callback
// recursively for each nested array.
function deepForEach(input, fn) {
    for (let value of input) {
        Array.isArray(value) ? deepForEach(value, fn) : fn(value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVySixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHMUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsZUFBZSxFQUFFLE1BQU0sRUFBQyxNQUFNLE9BQU8sQ0FBQzs7QUFFOUMsc0VBQXNFO0FBQ3RFLE1BQU0sbUNBQW1DLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFFM0Y7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUNuQyxJQUFJLGNBQWMsQ0FBeUIsNEJBQTRCLENBQUMsQ0FBQztBQUU3RTs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBWWhDLFlBQzhCLEdBQWEsRUFDUyxTQUFzQztRQUQ1RCxRQUFHLEdBQUgsR0FBRyxDQUFVO1FBWjNDLDBEQUEwRDtRQUMxRCw4RUFBOEU7UUFDdEUsb0JBQWUsR0FBcUIsSUFBSSxDQUFDO1FBRWpELGdGQUFnRjtRQUN4RSxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7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QUM7SUFDM0IsQ0FBQzs7NkhBeEZVLHFCQUFxQixrQkFhcEIsUUFBUSxhQUNJLDBCQUEwQjtpSUFkdkMscUJBQXFCLGNBRFQsTUFBTTtzR0FDbEIscUJBQXFCO2tCQURqQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzswREFjSyxRQUFROzBCQUF0QyxNQUFNOzJCQUFDLFFBQVE7OEJBQzJDLEtBQUs7MEJBQS9ELFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsMEJBQTBCOztBQTZFcEQsNEVBQTRFO0FBQzVFLHFDQUFxQztBQUNyQyxTQUFTLFdBQVcsQ0FBSSxLQUFrQixFQUFFLEVBQXNCO0lBQ2hFLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxFQUFFO1FBQ3ZCLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzRDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbCwgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi8uLi9kb21fdG9rZW5zJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHthc3NlcnREZXZNb2RlfSBmcm9tICcuL2Fzc2VydHMnO1xuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2V4dHJhY3RIb3N0bmFtZSwgZ2V0VXJsfSBmcm9tICcuL3VybCc7XG5cbi8vIFNldCBvZiBvcmlnaW5zIHRoYXQgYXJlIGFsd2F5cyBleGNsdWRlZCBmcm9tIHRoZSBwcmVjb25uZWN0IGNoZWNrcy5cbmNvbnN0IElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUID0gbmV3IFNldChbJ2xvY2FsaG9zdCcsICcxMjcuMC4wLjEnLCAnMC4wLjAuMCddKTtcblxuLyoqXG4gKiBNdWx0aS1wcm92aWRlciBpbmplY3Rpb24gdG9rZW4gdG8gY29uZmlndXJlIHdoaWNoIG9yaWdpbnMgc2hvdWxkIGJlIGV4Y2x1ZGVkXG4gKiBmcm9tIHRoZSBwcmVjb25uZWN0IGNoZWNrcy4gSXQgY2FuIGVpdGhlciBiZSBhIHNpbmdsZSBzdHJpbmcgb3IgYW4gYXJyYXkgb2Ygc3RyaW5nc1xuICogdG8gcmVwcmVzZW50IGEgZ3JvdXAgb2Ygb3JpZ2lucywgZm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCwgbXVsdGk6IHRydWUsIHVzZVZhbHVlOiAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20nfVxuICogYGBgXG4gKlxuICogb3I6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCwgbXVsdGk6IHRydWUsXG4gKiAgIHVzZVZhbHVlOiBbJ2h0dHBzOi8veW91ci1kb21haW4tMS5jb20nLCAnaHR0cHM6Ly95b3VyLWRvbWFpbi0yLmNvbSddfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuZXhwb3J0IGNvbnN0IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48QXJyYXk8c3RyaW5nfHN0cmluZ1tdPj4oJ1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUJyk7XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGxvZ2ljIHRvIGRldGVjdCB3aGV0aGVyIGFuIGltYWdlLCBtYXJrZWQgd2l0aCB0aGUgXCJwcmlvcml0eVwiIGF0dHJpYnV0ZVxuICogaGFzIGEgY29ycmVzcG9uZGluZyBgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPmAgdGFnIGluIHRoZSBgZG9jdW1lbnQuaGVhZGAuXG4gKlxuICogTm90ZTogdGhpcyBpcyBhIGRldi1tb2RlIG9ubHkgY2xhc3MsIHdoaWNoIHNob3VsZCBub3QgYXBwZWFyIGluIHByb2QgYnVuZGxlcyxcbiAqIHRodXMgdGhlcmUgaXMgbm8gYG5nRGV2TW9kZWAgdXNlIGluIHRoZSBjb2RlLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBQcmVjb25uZWN0TGlua0NoZWNrZXIge1xuICAvLyBTZXQgb2YgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPiB0YWdzIGZvdW5kIG9uIHRoaXMgcGFnZS5cbiAgLy8gVGhlIGBudWxsYCB2YWx1ZSBpbmRpY2F0ZXMgdGhhdCB0aGVyZSB3YXMgbm8gRE9NIHF1ZXJ5IG9wZXJhdGlvbiBwZXJmb3JtZWQuXG4gIHByaXZhdGUgcHJlY29ubmVjdExpbmtzOiBTZXQ8c3RyaW5nPnxudWxsID0gbnVsbDtcblxuICAvLyBLZWVwIHRyYWNrIG9mIGFsbCBhbHJlYWR5IHNlZW4gb3JpZ2luIFVSTHMgdG8gYXZvaWQgcmVwZWF0aW5nIHRoZSBzYW1lIGNoZWNrLlxuICBwcml2YXRlIGFscmVhZHlTZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvd3xudWxsID0gbnVsbDtcblxuICBwcml2YXRlIGJsb2NrbGlzdCA9IG5ldyBTZXQ8c3RyaW5nPihJTlRFUk5BTF9QUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvYzogRG9jdW1lbnQsXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUKSBibG9ja2xpc3Q6IEFycmF5PHN0cmluZ3xzdHJpbmdbXT58bnVsbCkge1xuICAgIGFzc2VydERldk1vZGUoJ3ByZWNvbm5lY3QgbGluayBjaGVja2VyJyk7XG4gICAgY29uc3Qgd2luID0gZG9jLmRlZmF1bHRWaWV3O1xuICAgIGlmICh0eXBlb2Ygd2luICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy53aW5kb3cgPSB3aW47XG4gICAgfVxuICAgIGlmIChibG9ja2xpc3QpIHtcbiAgICAgIHRoaXMucG9wdWxhdGVCbG9ja2xpc3QoYmxvY2tsaXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBvcHVsYXRlQmxvY2tsaXN0KG9yaWdpbnM6IEFycmF5PHN0cmluZ3xzdHJpbmdbXT4pIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcmlnaW5zKSkge1xuICAgICAgZGVlcEZvckVhY2gob3JpZ2lucywgb3JpZ2luID0+IHtcbiAgICAgICAgdGhpcy5ibG9ja2xpc3QuYWRkKGV4dHJhY3RIb3N0bmFtZShvcmlnaW4pKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9QUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCxcbiAgICAgICAgICBgVGhlIGJsb2NrbGlzdCBmb3IgdGhlIHByZWNvbm5lY3QgY2hlY2sgd2FzIG5vdCBwcm92aWRlZCBhcyBhbiBhcnJheS4gYCArXG4gICAgICAgICAgICAgIGBDaGVjayB0aGF0IHRoZSBcXGBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVFxcYCB0b2tlbiBpcyBjb25maWd1cmVkIGFzIGEgXFxgbXVsdGk6IHRydWVcXGAgcHJvdmlkZXIuYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGF0IGEgcHJlY29ubmVjdCByZXNvdXJjZSBoaW50IGV4aXN0cyBpbiB0aGUgaGVhZCBmbyBydGhlXG4gICAqIGdpdmVuIHNyYy5cbiAgICpcbiAgICogQHBhcmFtIHJld3JpdHRlblNyYyBzcmMgZm9ybWF0dGVkIHdpdGggbG9hZGVyXG4gICAqIEBwYXJhbSByYXdTcmMgcmF3U3JjIHZhbHVlXG4gICAqL1xuICBhc3NlcnRQcmVjb25uZWN0KHJld3JpdHRlblNyYzogc3RyaW5nLCByYXdTcmM6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy53aW5kb3cpIHJldHVybjtcblxuICAgIGNvbnN0IGltZ1VybCA9IGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMud2luZG93KTtcbiAgICBpZiAodGhpcy5ibG9ja2xpc3QuaGFzKGltZ1VybC5ob3N0bmFtZSkgfHwgdGhpcy5hbHJlYWR5U2Vlbi5oYXMoaW1nVXJsLm9yaWdpbikpIHJldHVybjtcblxuICAgIC8vIFJlZ2lzdGVyIHRoaXMgb3JpZ2luIGFzIHNlZW4sIHNvIHdlIGRvbid0IGNoZWNrIGl0IGFnYWluIGxhdGVyLlxuICAgIHRoaXMuYWxyZWFkeVNlZW4uYWRkKGltZ1VybC5vcmlnaW4pO1xuXG4gICAgaWYgKCF0aGlzLnByZWNvbm5lY3RMaW5rcykge1xuICAgICAgLy8gTm90ZTogd2UgcXVlcnkgZm9yIHByZWNvbm5lY3QgbGlua3Mgb25seSAqb25jZSogYW5kIGNhY2hlIHRoZSByZXN1bHRzXG4gICAgICAvLyBmb3IgdGhlIGVudGlyZSBsaWZlc3BhbiBvZiBhbiBhcHBsaWNhdGlvbiwgc2luY2UgaXQncyB1bmxpa2VseSB0aGF0IHRoZVxuICAgICAgLy8gbGlzdCB3b3VsZCBjaGFuZ2UgZnJlcXVlbnRseS4gVGhpcyBhbGxvd3MgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBub1xuICAgICAgLy8gcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zIG9mIG1ha2luZyBleHRyYSBET00gbG9va3VwcyBmb3IgZWFjaCBpbWFnZS5cbiAgICAgIHRoaXMucHJlY29ubmVjdExpbmtzID0gdGhpcy5xdWVyeVByZWNvbm5lY3RMaW5rcygpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5wcmVjb25uZWN0TGlua3MuaGFzKGltZ1VybC5vcmlnaW4pKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUFJJT1JJVFlfSU1HX01JU1NJTkdfUFJFQ09OTkVDVF9UQUcsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhyYXdTcmMpfSB0aGVyZSBpcyBubyBwcmVjb25uZWN0IHRhZyBwcmVzZW50IGZvciB0aGlzIGltYWdlLiBgICtcbiAgICAgICAgICAgICAgYFByZWNvbm5lY3RpbmcgdG8gdGhlIG9yaWdpbihzKSB0aGF0IHNlcnZlIHByaW9yaXR5IGltYWdlcyBlbnN1cmVzIHRoYXQgdGhlc2UgYCArXG4gICAgICAgICAgICAgIGBpbWFnZXMgYXJlIGRlbGl2ZXJlZCBhcyBzb29uIGFzIHBvc3NpYmxlLiBUbyBmaXggdGhpcywgcGxlYXNlIGFkZCB0aGUgZm9sbG93aW5nIGAgK1xuICAgICAgICAgICAgICBgZWxlbWVudCBpbnRvIHRoZSA8aGVhZD4gb2YgdGhlIGRvY3VtZW50OlxcbmAgK1xuICAgICAgICAgICAgICBgICA8bGluayByZWw9XCJwcmVjb25uZWN0XCIgaHJlZj1cIiR7aW1nVXJsLm9yaWdpbn1cIj5gKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBxdWVyeVByZWNvbm5lY3RMaW5rcygpOiBTZXQ8c3RyaW5nPiB7XG4gICAgY29uc3QgcHJlY29ubmVjdFVybHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBzZWxlY3RvciA9ICdsaW5rW3JlbD1wcmVjb25uZWN0XSc7XG4gICAgY29uc3QgbGlua3MgPVxuICAgICAgICBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbcmVsPXByZWNvbm5lY3RdJykpIGFzIEhUTUxMaW5rRWxlbWVudFtdO1xuICAgIGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcbiAgICAgIGNvbnN0IHVybCA9IGdldFVybChsaW5rLmhyZWYsIHRoaXMud2luZG93ISk7XG4gICAgICBwcmVjb25uZWN0VXJscy5hZGQodXJsLm9yaWdpbik7XG4gICAgfVxuICAgIHJldHVybiBwcmVjb25uZWN0VXJscztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMucHJlY29ubmVjdExpbmtzPy5jbGVhcigpO1xuICAgIHRoaXMuYWxyZWFkeVNlZW4uY2xlYXIoKTtcbiAgfVxufVxuXG4vLyBJbnZva2VzIGEgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgYXJyYXkuIEFsc28gaW52b2tlcyBhIGNhbGxiYWNrXG4vLyByZWN1cnNpdmVseSBmb3IgZWFjaCBuZXN0ZWQgYXJyYXkuXG5mdW5jdGlvbiBkZWVwRm9yRWFjaDxUPihpbnB1dDogKFR8YW55W10pW10sIGZuOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChsZXQgdmFsdWUgb2YgaW5wdXQpIHtcbiAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IGRlZXBGb3JFYWNoKHZhbHVlLCBmbikgOiBmbih2YWx1ZSk7XG4gIH1cbn1cbiJdfQ==