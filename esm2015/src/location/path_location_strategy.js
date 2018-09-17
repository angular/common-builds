import { Inject, Injectable, Optional } from '@angular/core';
import { Location } from './location';
import { APP_BASE_HREF, LocationStrategy } from './location_strategy';
import { PlatformLocation } from './platform_location';
import * as i0 from "@angular/core";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@description
 * A {\@link LocationStrategy} used to configure the {\@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you must provide a {\@link APP_BASE_HREF}
 * or add a base element to the document. This URL prefix that will be preserved
 * when generating and recognizing URLs.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Similarly, if you add `<base href='/my/app'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * \@usageNotes
 *
 * ### Example
 *
 * {\@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 *
 */
export class PathLocationStrategy extends LocationStrategy {
    /**
     * @param {?} _platformLocation
     * @param {?=} href
     */
    constructor(_platformLocation, href) {
        super();
        this._platformLocation = _platformLocation;
        if (href == null) {
            href = this._platformLocation.getBaseHrefFromDOM();
        }
        if (href == null) {
            throw new Error(`No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.`);
        }
        this._baseHref = href;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onPopState(fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    }
    /**
     * @return {?}
     */
    getBaseHref() { return this._baseHref; }
    /**
     * @param {?} internal
     * @return {?}
     */
    prepareExternalUrl(internal) {
        return Location.joinWithSlash(this._baseHref, internal);
    }
    /**
     * @param {?=} includeHash
     * @return {?}
     */
    path(includeHash = false) {
        /** @type {?} */
        const pathname = this._platformLocation.pathname +
            Location.normalizeQueryParams(this._platformLocation.search);
        /** @type {?} */
        const hash = this._platformLocation.hash;
        return hash && includeHash ? `${pathname}${hash}` : pathname;
    }
    /**
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @param {?} queryParams
     * @return {?}
     */
    pushState(state, title, url, queryParams) {
        /** @type {?} */
        const externalUrl = this.prepareExternalUrl(url + Location.normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    }
    /**
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @param {?} queryParams
     * @return {?}
     */
    replaceState(state, title, url, queryParams) {
        /** @type {?} */
        const externalUrl = this.prepareExternalUrl(url + Location.normalizeQueryParams(queryParams));
        this._platformLocation.replaceState(state, title, externalUrl);
    }
    /**
     * @return {?}
     */
    forward() { this._platformLocation.forward(); }
    /**
     * @return {?}
     */
    back() { this._platformLocation.back(); }
}
PathLocationStrategy.decorators = [
    { type: Injectable },
];
/** @nocollapse */
PathLocationStrategy.ctorParameters = () => [
    { type: PlatformLocation },
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [APP_BASE_HREF,] }] }
];
PathLocationStrategy.ngInjectableDef = i0.defineInjectable({ token: PathLocationStrategy, factory: function PathLocationStrategy_Factory(t) { return new (t || PathLocationStrategy)(i0.inject(PlatformLocation), i0.inject(APP_BASE_HREF, 8)); }, providedIn: null });
if (false) {
    /** @type {?} */
    PathLocationStrategy.prototype._baseHref;
    /** @type {?} */
    PathLocationStrategy.prototype._platformLocation;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvbG9jYXRpb24vcGF0aF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHM0QsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLEVBQUMsYUFBYSxFQUFFLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEUsT0FBTyxFQUF5QixnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0M3RSxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsZ0JBQWdCOzs7OztJQUd4RCxZQUNZLG1CQUMyQixJQUFhO1FBQ2xELEtBQUssRUFBRSxDQUFDO1FBRkUsc0JBQWlCLEdBQWpCLGlCQUFpQjtRQUkzQixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDaEIsSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQ1gsNkdBQTZHLENBQUMsQ0FBQztTQUNwSDtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0tBQ3ZCOzs7OztJQUVELFVBQVUsQ0FBQyxFQUEwQjtRQUNuQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDekM7Ozs7SUFFRCxXQUFXLEtBQWEsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7Ozs7O0lBRWhELGtCQUFrQixDQUFDLFFBQWdCO1FBQ2pDLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3pEOzs7OztJQUVELElBQUksQ0FBQyxjQUF1QixLQUFLOztRQUMvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUTtZQUM1QyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDOztRQUNqRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztLQUM5RDs7Ozs7Ozs7SUFFRCxTQUFTLENBQUMsS0FBVSxFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsV0FBbUI7O1FBQ25FLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzdEOzs7Ozs7OztJQUVELFlBQVksQ0FBQyxLQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxXQUFtQjs7UUFDdEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM5RixJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDaEU7Ozs7SUFFRCxPQUFPLEtBQVcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7Ozs7SUFFckQsSUFBSSxLQUFXLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFOzs7WUFuRGhELFVBQVU7Ozs7WUEvQnFCLGdCQUFnQjt5Q0FxQ3pDLFFBQVEsWUFBSSxNQUFNLFNBQUMsYUFBYTs7b0VBTDFCLG9CQUFvQix1RUFBcEIsb0JBQW9CLFlBSUEsZ0JBQWdCLGFBQ3ZCLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9sb2NhdGlvbic7XG5pbXBvcnQge0FQUF9CQVNFX0hSRUYsIExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtMb2NhdGlvbkNoYW5nZUxpc3RlbmVyLCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcblxuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHRvXG4gKiByZXByZXNlbnQgaXRzIHN0YXRlIGluIHRoZVxuICogW3BhdGhdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaWZvcm1fUmVzb3VyY2VfTG9jYXRvciNTeW50YXgpIG9mIHRoZVxuICogYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBJZiB5b3UncmUgdXNpbmcgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCwgeW91IG11c3QgcHJvdmlkZSBhIHtAbGluayBBUFBfQkFTRV9IUkVGfVxuICogb3IgYWRkIGEgYmFzZSBlbGVtZW50IHRvIHRoZSBkb2N1bWVudC4gVGhpcyBVUkwgcHJlZml4IHRoYXQgd2lsbCBiZSBwcmVzZXJ2ZWRcbiAqIHdoZW4gZ2VuZXJhdGluZyBhbmQgcmVjb2duaXppbmcgVVJMcy5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBwcm92aWRlIGFuIGBBUFBfQkFTRV9IUkVGYCBvZiBgJy9teS9hcHAnYCBhbmQgY2FsbFxuICogYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tL215L2FwcC9mb29gLlxuICpcbiAqIFNpbWlsYXJseSwgaWYgeW91IGFkZCBgPGJhc2UgaHJlZj0nL215L2FwcCcvPmAgdG8gdGhlIGRvY3VtZW50IGFuZCBjYWxsXG4gKiBgbG9jYXRpb24uZ28oJy9mb28nKWAsIHRoZSBicm93c2VyJ3MgVVJMIHdpbGwgYmVjb21lXG4gKiBgZXhhbXBsZS5jb20vbXkvYXBwL2Zvb2AuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbG9jYXRpb24vdHMvcGF0aF9sb2NhdGlvbl9jb21wb25lbnQudHMgcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCd9XG4gKlxuICpcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBhdGhMb2NhdGlvblN0cmF0ZWd5IGV4dGVuZHMgTG9jYXRpb25TdHJhdGVneSB7XG4gIHByaXZhdGUgX2Jhc2VIcmVmOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChBUFBfQkFTRV9IUkVGKSBocmVmPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmIChocmVmID09IG51bGwpIHtcbiAgICAgIGhyZWYgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldEJhc2VIcmVmRnJvbURPTSgpO1xuICAgIH1cblxuICAgIGlmIChocmVmID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgTm8gYmFzZSBocmVmIHNldC4gUGxlYXNlIHByb3ZpZGUgYSB2YWx1ZSBmb3IgdGhlIEFQUF9CQVNFX0hSRUYgdG9rZW4gb3IgYWRkIGEgYmFzZSBlbGVtZW50IHRvIHRoZSBkb2N1bWVudC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNlSHJlZiA9IGhyZWY7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlKGZuKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZShmbik7XG4gIH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fYmFzZUhyZWY7IH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIExvY2F0aW9uLmpvaW5XaXRoU2xhc2godGhpcy5fYmFzZUhyZWYsIGludGVybmFsKTtcbiAgfVxuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aG5hbWUgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnBhdGhuYW1lICtcbiAgICAgICAgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXModGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5zZWFyY2gpO1xuICAgIGNvbnN0IGhhc2ggPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmhhc2g7XG4gICAgcmV0dXJuIGhhc2ggJiYgaW5jbHVkZUhhc2ggPyBgJHtwYXRobmFtZX0ke2hhc2h9YCA6IHBhdGhuYW1lO1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgY29uc3QgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgY29uc3QgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwgKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTsgfVxufVxuIl19