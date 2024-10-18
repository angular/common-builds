/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8+sha-d1cfbb1", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8+sha-d1cfbb1", ngImport: i0, type: PreconnectLinkChecker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8+sha-d1cfbb1", ngImport: i0, type: PreconnectLinkChecker, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29ubmVjdF9saW5rX2NoZWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWNvbm5lY3RfbGlua19jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUcxQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxlQUFlLEVBQUUsTUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzlDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUVuRCxzRUFBc0U7QUFDdEUsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUUzRjs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLGNBQWMsQ0FDMUQsU0FBUyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM5QyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQW1CaEM7UUFsQlEsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQixhQUFRLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FB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SSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUM7WUFDNUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLENBQUM7eUhBM0ZVLHFCQUFxQjs2SEFBckIscUJBQXFCLGNBRFQsTUFBTTs7c0dBQ2xCLHFCQUFxQjtrQkFEakMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBK0ZoQzs7O0dBR0c7QUFDSCxTQUFTLFdBQVcsQ0FBSSxLQUFvQixFQUFFLEVBQXNCO0lBQ2xFLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxFQUFFLENBQUM7UUFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVELENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBpbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdGlvblRva2VuLFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIFBMQVRGT1JNX0lELFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5cbmltcG9ydCB7YXNzZXJ0RGV2TW9kZX0gZnJvbSAnLi9hc3NlcnRzJztcbmltcG9ydCB7aW1nRGlyZWN0aXZlRGV0YWlsc30gZnJvbSAnLi9lcnJvcl9oZWxwZXInO1xuaW1wb3J0IHtleHRyYWN0SG9zdG5hbWUsIGdldFVybH0gZnJvbSAnLi91cmwnO1xuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICcuLi8uLi9wbGF0Zm9ybV9pZCc7XG5cbi8vIFNldCBvZiBvcmlnaW5zIHRoYXQgYXJlIGFsd2F5cyBleGNsdWRlZCBmcm9tIHRoZSBwcmVjb25uZWN0IGNoZWNrcy5cbmNvbnN0IElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUID0gbmV3IFNldChbJ2xvY2FsaG9zdCcsICcxMjcuMC4wLjEnLCAnMC4wLjAuMCddKTtcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdG8gY29uZmlndXJlIHdoaWNoIG9yaWdpbnMgc2hvdWxkIGJlIGV4Y2x1ZGVkXG4gKiBmcm9tIHRoZSBwcmVjb25uZWN0IGNoZWNrcy4gSXQgY2FuIGVpdGhlciBiZSBhIHNpbmdsZSBzdHJpbmcgb3IgYW4gYXJyYXkgb2Ygc3RyaW5nc1xuICogdG8gcmVwcmVzZW50IGEgZ3JvdXAgb2Ygb3JpZ2lucywgZm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHtwcm92aWRlOiBQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCwgdXNlVmFsdWU6ICdodHRwczovL3lvdXItZG9tYWluLmNvbSd9XG4gKiBgYGBcbiAqXG4gKiBvcjpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAge3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULFxuICogICB1c2VWYWx1ZTogWydodHRwczovL3lvdXItZG9tYWluLTEuY29tJywgJ2h0dHBzOi8veW91ci1kb21haW4tMi5jb20nXX1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUID0gbmV3IEluamVjdGlvblRva2VuPEFycmF5PHN0cmluZyB8IHN0cmluZ1tdPj4oXG4gIG5nRGV2TW9kZSA/ICdQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVCcgOiAnJyxcbik7XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGxvZ2ljIHRvIGRldGVjdCB3aGV0aGVyIGFuIGltYWdlLCBtYXJrZWQgd2l0aCB0aGUgXCJwcmlvcml0eVwiIGF0dHJpYnV0ZVxuICogaGFzIGEgY29ycmVzcG9uZGluZyBgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPmAgdGFnIGluIHRoZSBgZG9jdW1lbnQuaGVhZGAuXG4gKlxuICogTm90ZTogdGhpcyBpcyBhIGRldi1tb2RlIG9ubHkgY2xhc3MsIHdoaWNoIHNob3VsZCBub3QgYXBwZWFyIGluIHByb2QgYnVuZGxlcyxcbiAqIHRodXMgdGhlcmUgaXMgbm8gYG5nRGV2TW9kZWAgdXNlIGluIHRoZSBjb2RlLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBQcmVjb25uZWN0TGlua0NoZWNrZXIge1xuICBwcml2YXRlIGRvY3VtZW50ID0gaW5qZWN0KERPQ1VNRU5UKTtcbiAgcHJpdmF0ZSByZWFkb25seSBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0KFBMQVRGT1JNX0lEKSk7XG5cbiAgLyoqXG4gICAqIFNldCBvZiA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+IHRhZ3MgZm91bmQgb24gdGhpcyBwYWdlLlxuICAgKiBUaGUgYG51bGxgIHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZXJlIHdhcyBubyBET00gcXVlcnkgb3BlcmF0aW9uIHBlcmZvcm1lZC5cbiAgICovXG4gIHByaXZhdGUgcHJlY29ubmVjdExpbmtzOiBTZXQ8c3RyaW5nPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qXG4gICAqIEtlZXAgdHJhY2sgb2YgYWxsIGFscmVhZHkgc2VlbiBvcmlnaW4gVVJMcyB0byBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgY2hlY2suXG4gICAqL1xuICBwcml2YXRlIGFscmVhZHlTZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSB3aW5kb3c6IFdpbmRvdyB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgYmxvY2tsaXN0ID0gbmV3IFNldDxzdHJpbmc+KElOVEVSTkFMX1BSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNUKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBhc3NlcnREZXZNb2RlKCdwcmVjb25uZWN0IGxpbmsgY2hlY2tlcicpO1xuICAgIGNvbnN0IHdpbiA9IHRoaXMuZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgaWYgKHR5cGVvZiB3aW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvdyA9IHdpbjtcbiAgICB9XG4gICAgY29uc3QgYmxvY2tsaXN0ID0gaW5qZWN0KFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICBpZiAoYmxvY2tsaXN0KSB7XG4gICAgICB0aGlzLnBvcHVsYXRlQmxvY2tsaXN0KGJsb2NrbGlzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwb3B1bGF0ZUJsb2NrbGlzdChvcmlnaW5zOiBBcnJheTxzdHJpbmcgfCBzdHJpbmdbXT4gfCBzdHJpbmcpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcmlnaW5zKSkge1xuICAgICAgZGVlcEZvckVhY2gob3JpZ2lucywgKG9yaWdpbikgPT4ge1xuICAgICAgICB0aGlzLmJsb2NrbGlzdC5hZGQoZXh0cmFjdEhvc3RuYW1lKG9yaWdpbikpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYmxvY2tsaXN0LmFkZChleHRyYWN0SG9zdG5hbWUob3JpZ2lucykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhhdCBhIHByZWNvbm5lY3QgcmVzb3VyY2UgaGludCBleGlzdHMgaW4gdGhlIGhlYWQgZm9yIHRoZVxuICAgKiBnaXZlbiBzcmMuXG4gICAqXG4gICAqIEBwYXJhbSByZXdyaXR0ZW5TcmMgc3JjIGZvcm1hdHRlZCB3aXRoIGxvYWRlclxuICAgKiBAcGFyYW0gb3JpZ2luYWxOZ1NyYyBuZ1NyYyB2YWx1ZVxuICAgKi9cbiAgYXNzZXJ0UHJlY29ubmVjdChyZXdyaXR0ZW5TcmM6IHN0cmluZywgb3JpZ2luYWxOZ1NyYzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNTZXJ2ZXIpIHJldHVybjtcblxuICAgIGNvbnN0IGltZ1VybCA9IGdldFVybChyZXdyaXR0ZW5TcmMsIHRoaXMud2luZG93ISk7XG4gICAgaWYgKHRoaXMuYmxvY2tsaXN0LmhhcyhpbWdVcmwuaG9zdG5hbWUpIHx8IHRoaXMuYWxyZWFkeVNlZW4uaGFzKGltZ1VybC5vcmlnaW4pKSByZXR1cm47XG5cbiAgICAvLyBSZWdpc3RlciB0aGlzIG9yaWdpbiBhcyBzZWVuLCBzbyB3ZSBkb24ndCBjaGVjayBpdCBhZ2FpbiBsYXRlci5cbiAgICB0aGlzLmFscmVhZHlTZWVuLmFkZChpbWdVcmwub3JpZ2luKTtcblxuICAgIC8vIE5vdGU6IHdlIHF1ZXJ5IGZvciBwcmVjb25uZWN0IGxpbmtzIG9ubHkgKm9uY2UqIGFuZCBjYWNoZSB0aGUgcmVzdWx0c1xuICAgIC8vIGZvciB0aGUgZW50aXJlIGxpZmVzcGFuIG9mIGFuIGFwcGxpY2F0aW9uLCBzaW5jZSBpdCdzIHVubGlrZWx5IHRoYXQgdGhlXG4gICAgLy8gbGlzdCB3b3VsZCBjaGFuZ2UgZnJlcXVlbnRseS4gVGhpcyBhbGxvd3MgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBub1xuICAgIC8vIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9ucyBvZiBtYWtpbmcgZXh0cmEgRE9NIGxvb2t1cHMgZm9yIGVhY2ggaW1hZ2UuXG4gICAgdGhpcy5wcmVjb25uZWN0TGlua3MgPz89IHRoaXMucXVlcnlQcmVjb25uZWN0TGlua3MoKTtcblxuICAgIGlmICghdGhpcy5wcmVjb25uZWN0TGlua3MuaGFzKGltZ1VybC5vcmlnaW4pKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlBSSU9SSVRZX0lNR19NSVNTSU5HX1BSRUNPTk5FQ1RfVEFHLFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMob3JpZ2luYWxOZ1NyYyl9IHRoZXJlIGlzIG5vIHByZWNvbm5lY3QgdGFnIHByZXNlbnQgZm9yIHRoaXMgYCArXG4gICAgICAgICAgICBgaW1hZ2UuIFByZWNvbm5lY3RpbmcgdG8gdGhlIG9yaWdpbihzKSB0aGF0IHNlcnZlIHByaW9yaXR5IGltYWdlcyBlbnN1cmVzIHRoYXQgdGhlc2UgYCArXG4gICAgICAgICAgICBgaW1hZ2VzIGFyZSBkZWxpdmVyZWQgYXMgc29vbiBhcyBwb3NzaWJsZS4gVG8gZml4IHRoaXMsIHBsZWFzZSBhZGQgdGhlIGZvbGxvd2luZyBgICtcbiAgICAgICAgICAgIGBlbGVtZW50IGludG8gdGhlIDxoZWFkPiBvZiB0aGUgZG9jdW1lbnQ6XFxuYCArXG4gICAgICAgICAgICBgICA8bGluayByZWw9XCJwcmVjb25uZWN0XCIgaHJlZj1cIiR7aW1nVXJsLm9yaWdpbn1cIj5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHF1ZXJ5UHJlY29ubmVjdExpbmtzKCk6IFNldDxzdHJpbmc+IHtcbiAgICBjb25zdCBwcmVjb25uZWN0VXJscyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gJ2xpbmtbcmVsPXByZWNvbm5lY3RdJztcbiAgICBjb25zdCBsaW5rczogSFRNTExpbmtFbGVtZW50W10gPSBBcnJheS5mcm9tKHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcbiAgICAgIGNvbnN0IHVybCA9IGdldFVybChsaW5rLmhyZWYsIHRoaXMud2luZG93ISk7XG4gICAgICBwcmVjb25uZWN0VXJscy5hZGQodXJsLm9yaWdpbik7XG4gICAgfVxuICAgIHJldHVybiBwcmVjb25uZWN0VXJscztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMucHJlY29ubmVjdExpbmtzPy5jbGVhcigpO1xuICAgIHRoaXMuYWxyZWFkeVNlZW4uY2xlYXIoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgYSBjYWxsYmFjayBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBhcnJheS4gQWxzbyBpbnZva2VzIGEgY2FsbGJhY2tcbiAqIHJlY3Vyc2l2ZWx5IGZvciBlYWNoIG5lc3RlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZGVlcEZvckVhY2g8VD4oaW5wdXQ6IChUIHwgYW55W10pW10sIGZuOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChsZXQgdmFsdWUgb2YgaW5wdXQpIHtcbiAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IGRlZXBGb3JFYWNoKHZhbHVlLCBmbikgOiBmbih2YWx1ZSk7XG4gIH1cbn1cbiJdfQ==