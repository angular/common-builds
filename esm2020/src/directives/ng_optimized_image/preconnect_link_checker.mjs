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
            throw new RuntimeError(2957 /* RuntimeErrorCode.INVALID_PRECONNECT_CHECK_BLOCKLIST */, `The blocklist for the preconnect check was not provided as an array. ` +
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
            console.warn(formatRuntimeError(2956 /* RuntimeErrorCode.PRIORITY_IMG_MISSING_PRECONNECT_TAG */, `${imgDirectiveDetails(rawSrc)} there is no preconnect tag present for this image. ` +
                `Preconnecting to the origin(s) that serve priority images ensures that these ` +
                `images are delivered as soon as possible. To fix this, please add the following ` +
                `element into the <head> of the document:\n` +
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
PreconnectLinkChecker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-30ed35f", ngImport: i0, type: PreconnectLinkChecker, deps: [{ token: DOCUMENT }, { token: PRECONNECT_CHECK_BLOCKLIST, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
PreconnectLinkChecker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-30ed35f", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0-next.0+sha-30ed35f", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVySixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHMUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRWpGLHNFQUFzRTtBQUN0RSxNQUFNLG1DQUFtQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FDbkMsSUFBSSxjQUFjLENBQXlCLDRCQUE0QixDQUFDLENBQUM7QUFFN0U7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQVloQyxZQUM4QixHQUFhLEVBQ1MsU0FBc0M7UUFENUQsUUFBRyxHQUFILEdBQUcsQ0FBVTtRQVozQywwREFBMEQ7UUFDMUQsOEVBQThFO1FBQ3RFLG9CQUFlLEdBQXFCLElBQUksQ0FBQztRQUVqRCxnRkFBZ0Y7UUFDeEUsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRWhDLFdBQU0sR0FBZ0IsSUFBSSxD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O0lBQzNCLENBQUM7OzZIQWhGVSxxQkFBcUIsa0JBYXBCLFFBQVEsYUFDSSwwQkFBMEI7aUlBZHZDLHFCQUFxQixjQURULE1BQU07c0dBQ2xCLHFCQUFxQjtrQkFEakMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7MERBY0ssUUFBUTswQkFBdEMsTUFBTTsyQkFBQyxRQUFROzhCQUMyQyxLQUFLOzBCQUEvRCxRQUFROzswQkFBSSxNQUFNOzJCQUFDLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9wdGlvbmFsLCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uLy4uL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuXG5pbXBvcnQge2Fzc2VydERldk1vZGV9IGZyb20gJy4vYXNzZXJ0cyc7XG5pbXBvcnQge2RlZXBGb3JFYWNoLCBleHRyYWN0SG9zdG5hbWUsIGdldFVybCwgaW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi91dGlsJztcblxuLy8gU2V0IG9mIG9yaWdpbnMgdGhhdCBhcmUgYWx3YXlzIGV4Y2x1ZGVkIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLlxuY29uc3QgSU5URVJOQUxfUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPSBuZXcgU2V0KFsnbG9jYWxob3N0JywgJzEyNy4wLjAuMScsICcwLjAuMC4wJ10pO1xuXG4vKipcbiAqIE11bHRpLXByb3ZpZGVyIGluamVjdGlvbiB0b2tlbiB0byBjb25maWd1cmUgd2hpY2ggb3JpZ2lucyBzaG91bGQgYmUgZXhjbHVkZWRcbiAqIGZyb20gdGhlIHByZWNvbm5lY3QgY2hlY2tzLiBJZiBjYW4gZWl0aGVyIGJlIGEgc2luZ2xlIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzXG4gKiB0byByZXByZXNlbnQgYSBncm91cCBvZiBvcmlnaW5zLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAge3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCBtdWx0aTogdHJ1ZSwgdXNlVmFsdWU6ICdodHRwczovL3lvdXItZG9tYWluLmNvbSd9XG4gKiBgYGBcbiAqXG4gKiBvcjpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAge3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCBtdWx0aTogdHJ1ZSxcbiAqICAgdXNlVmFsdWU6IFsnaHR0cHM6Ly95b3VyLWRvbWFpbi0xLmNvbScsICdodHRwczovL3lvdXItZG9tYWluLTIuY29tJ119XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5leHBvcnQgY29uc3QgUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxBcnJheTxzdHJpbmd8c3RyaW5nW10+PignUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QnKTtcblxuLyoqXG4gKiBDb250YWlucyB0aGUgbG9naWMgdG8gZGV0ZWN0IHdoZXRoZXIgYW4gaW1hZ2UsIG1hcmtlZCB3aXRoIHRoZSBcInByaW9yaXR5XCIgYXR0cmlidXRlXG4gKiBoYXMgYSBjb3JyZXNwb25kaW5nIGA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+YCB0YWcgaW4gdGhlIGBkb2N1bWVudC5oZWFkYC5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIGEgZGV2LW1vZGUgb25seSBjbGFzcywgd2hpY2ggc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZCBidW5kbGVzLFxuICogdGh1cyB0aGVyZSBpcyBubyBgbmdEZXZNb2RlYCB1c2UgaW4gdGhlIGNvZGUuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFByZWNvbm5lY3RMaW5rQ2hlY2tlciB7XG4gIC8vIFNldCBvZiA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+IHRhZ3MgZm91bmQgb24gdGhpcyBwYWdlLlxuICAvLyBUaGUgYG51bGxgIHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZXJlIHdhcyBubyBET00gcXVlcnkgb3BlcmF0aW9uIHBlcmZvcm1lZC5cbiAgcHJpdmF0ZSBwcmVjb25uZWN0TGlua3M6IFNldDxzdHJpbmc+fG51bGwgPSBudWxsO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2YgYWxsIGFscmVhZHkgc2VlbiBvcmlnaW4gVVJMcyB0byBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgY2hlY2suXG4gIHByaXZhdGUgYWxyZWFkeVNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIHdpbmRvdzogV2luZG93fG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgYmxvY2tsaXN0ID0gbmV3IFNldDxzdHJpbmc+KElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jOiBEb2N1bWVudCxcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QpIGJsb2NrbGlzdDogQXJyYXk8c3RyaW5nfHN0cmluZ1tdPnxudWxsKSB7XG4gICAgYXNzZXJ0RGV2TW9kZSgncHJlY29ubmVjdCBsaW5rIGNoZWNrZXInKTtcbiAgICBjb25zdCB3aW4gPSBkb2MuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICB9XG4gICAgaWYgKGJsb2NrbGlzdCkge1xuICAgICAgdGhpcy5wdXB1bGF0ZUJsb2NrbGlzdChibG9ja2xpc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcHVwdWxhdGVCbG9ja2xpc3Qob3JpZ2luczogQXJyYXk8c3RyaW5nfHN0cmluZ1tdPikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9yaWdpbnMpKSB7XG4gICAgICBkZWVwRm9yRWFjaChvcmlnaW5zLCBvcmlnaW4gPT4ge1xuICAgICAgICB0aGlzLmJsb2NrbGlzdC5hZGQoZXh0cmFjdEhvc3RuYW1lKG9yaWdpbikpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULFxuICAgICAgICAgIGBUaGUgYmxvY2tsaXN0IGZvciB0aGUgcHJlY29ubmVjdCBjaGVjayB3YXMgbm90IHByb3ZpZGVkIGFzIGFuIGFycmF5LiBgICtcbiAgICAgICAgICAgICAgYENoZWNrIHRoYXQgdGhlIFxcYFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUXFxgIHRva2VuIGlzIGNvbmZpZ3VyZWQgYXMgYSBcXGBtdWx0aTogdHJ1ZVxcYCBwcm92aWRlci5gKTtcbiAgICB9XG4gIH1cblxuICBjaGVjayhyZXdyaXR0ZW5TcmM6IHN0cmluZywgcmF3U3JjOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMud2luZG93KSByZXR1cm47XG5cbiAgICBjb25zdCBpbWdVcmwgPSBnZXRVcmwocmV3cml0dGVuU3JjLCB0aGlzLndpbmRvdyk7XG4gICAgaWYgKHRoaXMuYmxvY2tsaXN0LmhhcyhpbWdVcmwuaG9zdG5hbWUpIHx8IHRoaXMuYWxyZWFkeVNlZW4uaGFzKGltZ1VybC5vcmlnaW4pKSByZXR1cm47XG5cbiAgICAvLyBSZWdpc3RlciB0aGlzIG9yaWdpbiBhcyBzZWVuLCBzbyB3ZSBkb24ndCBjaGVjayBpdCBhZ2FpbiBsYXRlci5cbiAgICB0aGlzLmFscmVhZHlTZWVuLmFkZChpbWdVcmwub3JpZ2luKTtcblxuICAgIGlmICh0aGlzLnByZWNvbm5lY3RMaW5rcyA9PT0gbnVsbCkge1xuICAgICAgLy8gTm90ZTogd2UgcXVlcnkgZm9yIHByZWNvbm5lY3QgbGlua3Mgb25seSAqb25jZSogYW5kIGNhY2hlIHRoZSByZXN1bHRzXG4gICAgICAvLyBmb3IgdGhlIGVudGlyZSBsaWZlc3BhbiBvZiBhbiBhcHBsaWNhdGlvbiwgc2luY2UgaXQncyB1bmxpa2VseSB0aGF0IHRoZVxuICAgICAgLy8gbGlzdCB3b3VsZCBjaGFuZ2UgZnJlcXVlbnRseS4gVGhpcyBhbGxvd3MgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBub1xuICAgICAgLy8gcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zIG9mIG1ha2luZyBleHRyYSBET00gbG9va3VwcyBmb3IgZWFjaCBpbWFnZS5cbiAgICAgIHRoaXMucHJlY29ubmVjdExpbmtzID0gdGhpcy5xdWVyeVByZWNvbm5lY3RMaW5rcygpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5wcmVjb25uZWN0TGlua3MuaGFzKGltZ1VybC5vcmlnaW4pKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUFJJT1JJVFlfSU1HX01JU1NJTkdfUFJFQ09OTkVDVF9UQUcsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhyYXdTcmMpfSB0aGVyZSBpcyBubyBwcmVjb25uZWN0IHRhZyBwcmVzZW50IGZvciB0aGlzIGltYWdlLiBgICtcbiAgICAgICAgICAgICAgYFByZWNvbm5lY3RpbmcgdG8gdGhlIG9yaWdpbihzKSB0aGF0IHNlcnZlIHByaW9yaXR5IGltYWdlcyBlbnN1cmVzIHRoYXQgdGhlc2UgYCArXG4gICAgICAgICAgICAgIGBpbWFnZXMgYXJlIGRlbGl2ZXJlZCBhcyBzb29uIGFzIHBvc3NpYmxlLiBUbyBmaXggdGhpcywgcGxlYXNlIGFkZCB0aGUgZm9sbG93aW5nIGAgK1xuICAgICAgICAgICAgICBgZWxlbWVudCBpbnRvIHRoZSA8aGVhZD4gb2YgdGhlIGRvY3VtZW50OlxcbmAgK1xuICAgICAgICAgICAgICBgICA8bGluayByZWw9XCJwcmVjb25uZWN0XCIgaHJlZj1cIiR7aW1nVXJsLm9yaWdpbn1cIj5gKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBxdWVyeVByZWNvbm5lY3RMaW5rcygpOiBTZXQ8c3RyaW5nPiB7XG4gICAgY29uc3QgcHJlY29ubmVjdFVSTHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBzZWxlY3RvciA9ICdsaW5rW3JlbD1wcmVjb25uZWN0XSc7XG4gICAgY29uc3QgbGlua3MgPSAodGhpcy5kb2MuaGVhZD8ucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgPz8gW10pIGFzIHVua25vd24gYXMgSFRNTExpbmtFbGVtZW50W107XG4gICAgbGlua3MuZm9yRWFjaChsaW5rID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IGdldFVybChsaW5rLmhyZWYsIHRoaXMud2luZG93ISk7XG4gICAgICBwcmVjb25uZWN0VVJMcy5hZGQodXJsLm9yaWdpbik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHByZWNvbm5lY3RVUkxzO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5wcmVjb25uZWN0TGlua3M/LmNsZWFyKCk7XG4gICAgdGhpcy5hbHJlYWR5U2Vlbi5jbGVhcigpO1xuICB9XG59XG4iXX0=