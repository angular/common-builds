/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/location/location_strategy.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, ɵɵinject } from '@angular/core';
import { DOCUMENT } from '../dom_tokens';
import { PlatformLocation } from './platform_location';
import { joinWithSlash, normalizeQueryParams } from './util';
import * as i0 from "@angular/core";
/**
 * Enables the `Location` service to read route state from the browser's URL.
 * Angular provides two strategies:
 * `HashLocationStrategy` and `PathLocationStrategy`.
 *
 * Applications should use the `Router` or `Location` services to
 * interact with application route state.
 *
 * For instance, `HashLocationStrategy` produces URLs like
 * <code class="no-auto-link">http://example.com#/foo</code>,
 * and `PathLocationStrategy` produces
 * <code class="no-auto-link">http://example.com/foo</code> as an equivalent URL.
 *
 * See these two classes for more.
 *
 * \@publicApi
 * @abstract
 */
let LocationStrategy = /** @class */ (() => {
    /**
     * Enables the `Location` service to read route state from the browser's URL.
     * Angular provides two strategies:
     * `HashLocationStrategy` and `PathLocationStrategy`.
     *
     * Applications should use the `Router` or `Location` services to
     * interact with application route state.
     *
     * For instance, `HashLocationStrategy` produces URLs like
     * <code class="no-auto-link">http://example.com#/foo</code>,
     * and `PathLocationStrategy` produces
     * <code class="no-auto-link">http://example.com/foo</code> as an equivalent URL.
     *
     * See these two classes for more.
     *
     * \@publicApi
     * @abstract
     */
    class LocationStrategy {
    }
    LocationStrategy.decorators = [
        { type: Injectable, args: [{ providedIn: 'root', useFactory: provideLocationStrategy },] }
    ];
    /** @nocollapse */ LocationStrategy.ɵprov = i0.ɵɵdefineInjectable({ factory: provideLocationStrategy, token: LocationStrategy, providedIn: "root" });
    return LocationStrategy;
})();
export { LocationStrategy };
if (false) {
    /**
     * @abstract
     * @param {?=} includeHash
     * @return {?}
     */
    LocationStrategy.prototype.path = function (includeHash) { };
    /**
     * @abstract
     * @param {?} internal
     * @return {?}
     */
    LocationStrategy.prototype.prepareExternalUrl = function (internal) { };
    /**
     * @abstract
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @param {?} queryParams
     * @return {?}
     */
    LocationStrategy.prototype.pushState = function (state, title, url, queryParams) { };
    /**
     * @abstract
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @param {?} queryParams
     * @return {?}
     */
    LocationStrategy.prototype.replaceState = function (state, title, url, queryParams) { };
    /**
     * @abstract
     * @return {?}
     */
    LocationStrategy.prototype.forward = function () { };
    /**
     * @abstract
     * @return {?}
     */
    LocationStrategy.prototype.back = function () { };
    /**
     * @abstract
     * @param {?} fn
     * @return {?}
     */
    LocationStrategy.prototype.onPopState = function (fn) { };
    /**
     * @abstract
     * @return {?}
     */
    LocationStrategy.prototype.getBaseHref = function () { };
}
/**
 * @param {?} platformLocation
 * @return {?}
 */
export function provideLocationStrategy(platformLocation) {
    // See #23917
    /** @type {?} */
    const location = ɵɵinject(DOCUMENT).location;
    return new PathLocationStrategy(ɵɵinject((/** @type {?} */ (PlatformLocation))), location && location.origin || '');
}
/**
 * A predefined [DI token](guide/glossary#di-token) for the base href
 * to be used with the `PathLocationStrategy`.
 * The base href is the URL prefix that should be preserved when generating
 * and recognizing URLs.
 *
 * \@usageNotes
 *
 * The following example shows how to use this token to configure the root app injector
 * with a base href value, so that the DI framework can supply the dependency anywhere in the app.
 *
 * ```typescript
 * import {Component, NgModule} from '\@angular/core';
 * import {APP_BASE_HREF} from '\@angular/common';
 *
 * \@NgModule({
 *   providers: [{provide: APP_BASE_HREF, useValue: '/my/app'}]
 * })
 * class AppModule {}
 * ```
 *
 * \@publicApi
 * @type {?}
 */
export const APP_BASE_HREF = new InjectionToken('appBaseHref');
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
 * \@publicApi
 */
let PathLocationStrategy = /** @class */ (() => {
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
     * \@publicApi
     */
    class PathLocationStrategy extends LocationStrategy {
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
        getBaseHref() {
            return this._baseHref;
        }
        /**
         * @param {?} internal
         * @return {?}
         */
        prepareExternalUrl(internal) {
            return joinWithSlash(this._baseHref, internal);
        }
        /**
         * @param {?=} includeHash
         * @return {?}
         */
        path(includeHash = false) {
            /** @type {?} */
            const pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
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
            const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
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
            const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
            this._platformLocation.replaceState(state, title, externalUrl);
        }
        /**
         * @return {?}
         */
        forward() {
            this._platformLocation.forward();
        }
        /**
         * @return {?}
         */
        back() {
            this._platformLocation.back();
        }
    }
    PathLocationStrategy.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PathLocationStrategy.ctorParameters = () => [
        { type: PlatformLocation },
        { type: String, decorators: [{ type: Optional }, { type: Inject, args: [APP_BASE_HREF,] }] }
    ];
    return PathLocationStrategy;
})();
export { PathLocationStrategy };
if (false) {
    /**
     * @type {?}
     * @private
     */
    PathLocationStrategy.prototype._baseHref;
    /**
     * @type {?}
     * @private
     */
    PathLocationStrategy.prototype._platformLocation;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3JGLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUF5QixnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdFLE9BQU8sRUFBQyxhQUFhLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUIzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLE1BQ3NCLGdCQUFnQjs7O2dCQURyQyxVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSx1QkFBdUIsRUFBQzs7OzJCQTlCckU7S0F3Q0M7U0FUcUIsZ0JBQWdCOzs7Ozs7O0lBQ3BDLDZEQUE2Qzs7Ozs7O0lBQzdDLHdFQUFzRDs7Ozs7Ozs7O0lBQ3RELHFGQUFzRjs7Ozs7Ozs7O0lBQ3RGLHdGQUF5Rjs7Ozs7SUFDekYscURBQXlCOzs7OztJQUN6QixrREFBc0I7Ozs7OztJQUN0QiwwREFBc0Q7Ozs7O0lBQ3RELHlEQUErQjs7Ozs7O0FBR2pDLE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxnQkFBa0M7OztVQUVsRSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVE7SUFDNUMsT0FBTyxJQUFJLG9CQUFvQixDQUMzQixRQUFRLENBQUMsbUJBQUEsZ0JBQWdCLEVBQU8sQ0FBQyxFQUFFLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxD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Z2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWwsIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi4vZG9tX3Rva2Vucyc7XG5pbXBvcnQge0xvY2F0aW9uQ2hhbmdlTGlzdGVuZXIsIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtqb2luV2l0aFNsYXNoLCBub3JtYWxpemVRdWVyeVBhcmFtc30gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBFbmFibGVzIHRoZSBgTG9jYXRpb25gIHNlcnZpY2UgdG8gcmVhZCByb3V0ZSBzdGF0ZSBmcm9tIHRoZSBicm93c2VyJ3MgVVJMLlxuICogQW5ndWxhciBwcm92aWRlcyB0d28gc3RyYXRlZ2llczpcbiAqIGBIYXNoTG9jYXRpb25TdHJhdGVneWAgYW5kIGBQYXRoTG9jYXRpb25TdHJhdGVneWAuXG4gKlxuICogQXBwbGljYXRpb25zIHNob3VsZCB1c2UgdGhlIGBSb3V0ZXJgIG9yIGBMb2NhdGlvbmAgc2VydmljZXMgdG9cbiAqIGludGVyYWN0IHdpdGggYXBwbGljYXRpb24gcm91dGUgc3RhdGUuXG4gKlxuICogRm9yIGluc3RhbmNlLCBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIHByb2R1Y2VzIFVSTHMgbGlrZVxuICogPGNvZGUgY2xhc3M9XCJuby1hdXRvLWxpbmtcIj5odHRwOi8vZXhhbXBsZS5jb20jL2ZvbzwvY29kZT4sXG4gKiBhbmQgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBwcm9kdWNlc1xuICogPGNvZGUgY2xhc3M9XCJuby1hdXRvLWxpbmtcIj5odHRwOi8vZXhhbXBsZS5jb20vZm9vPC9jb2RlPiBhcyBhbiBlcXVpdmFsZW50IFVSTC5cbiAqXG4gKiBTZWUgdGhlc2UgdHdvIGNsYXNzZXMgZm9yIG1vcmUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnLCB1c2VGYWN0b3J5OiBwcm92aWRlTG9jYXRpb25TdHJhdGVneX0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9jYXRpb25TdHJhdGVneSB7XG4gIGFic3RyYWN0IHBhdGgoaW5jbHVkZUhhc2g/OiBib29sZWFuKTogc3RyaW5nO1xuICBhYnN0cmFjdCBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZztcbiAgYWJzdHJhY3QgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgZm9yd2FyZCgpOiB2b2lkO1xuICBhYnN0cmFjdCBiYWNrKCk6IHZvaWQ7XG4gIGFic3RyYWN0IG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkO1xuICBhYnN0cmFjdCBnZXRCYXNlSHJlZigpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uKSB7XG4gIC8vIFNlZSAjMjM5MTdcbiAgY29uc3QgbG9jYXRpb24gPSDJtcm1aW5qZWN0KERPQ1VNRU5UKS5sb2NhdGlvbjtcbiAgcmV0dXJuIG5ldyBQYXRoTG9jYXRpb25TdHJhdGVneShcbiAgICAgIMm1ybVpbmplY3QoUGxhdGZvcm1Mb2NhdGlvbiBhcyBhbnkpLCBsb2NhdGlvbiAmJiBsb2NhdGlvbi5vcmlnaW4gfHwgJycpO1xufVxuXG5cbi8qKlxuICogQSBwcmVkZWZpbmVkIFtESSB0b2tlbl0oZ3VpZGUvZ2xvc3NhcnkjZGktdG9rZW4pIGZvciB0aGUgYmFzZSBocmVmXG4gKiB0byBiZSB1c2VkIHdpdGggdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAuXG4gKiBUaGUgYmFzZSBocmVmIGlzIHRoZSBVUkwgcHJlZml4IHRoYXQgc2hvdWxkIGJlIHByZXNlcnZlZCB3aGVuIGdlbmVyYXRpbmdcbiAqIGFuZCByZWNvZ25pemluZyBVUkxzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byB1c2UgdGhpcyB0b2tlbiB0byBjb25maWd1cmUgdGhlIHJvb3QgYXBwIGluamVjdG9yXG4gKiB3aXRoIGEgYmFzZSBocmVmIHZhbHVlLCBzbyB0aGF0IHRoZSBESSBmcmFtZXdvcmsgY2FuIHN1cHBseSB0aGUgZGVwZW5kZW5jeSBhbnl3aGVyZSBpbiB0aGUgYXBwLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKiBpbXBvcnQge0FQUF9CQVNFX0hSRUZ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogQE5nTW9kdWxlKHtcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IEFQUF9CQVNFX0hSRUYsIHVzZVZhbHVlOiAnL215L2FwcCd9XVxuICogfSlcbiAqIGNsYXNzIEFwcE1vZHVsZSB7fVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgQVBQX0JBU0VfSFJFRiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdhcHBCYXNlSHJlZicpO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gdXNlZCB0byBjb25maWd1cmUgdGhlIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB0b1xuICogcmVwcmVzZW50IGl0cyBzdGF0ZSBpbiB0aGVcbiAqIFtwYXRoXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Vbmlmb3JtX1Jlc291cmNlX0xvY2F0b3IjU3ludGF4KSBvZiB0aGVcbiAqIGJyb3dzZXIncyBVUkwuXG4gKlxuICogSWYgeW91J3JlIHVzaW5nIGBQYXRoTG9jYXRpb25TdHJhdGVneWAsIHlvdSBtdXN0IHByb3ZpZGUgYSB7QGxpbmsgQVBQX0JBU0VfSFJFRn1cbiAqIG9yIGFkZCBhIGJhc2UgZWxlbWVudCB0byB0aGUgZG9jdW1lbnQuIFRoaXMgVVJMIHByZWZpeCB0aGF0IHdpbGwgYmUgcHJlc2VydmVkXG4gKiB3aGVuIGdlbmVyYXRpbmcgYW5kIHJlY29nbml6aW5nIFVSTHMuXG4gKlxuICogRm9yIGluc3RhbmNlLCBpZiB5b3UgcHJvdmlkZSBhbiBgQVBQX0JBU0VfSFJFRmAgb2YgYCcvbXkvYXBwJ2AgYW5kIGNhbGxcbiAqIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbS9teS9hcHAvZm9vYC5cbiAqXG4gKiBTaW1pbGFybHksIGlmIHlvdSBhZGQgYDxiYXNlIGhyZWY9Jy9teS9hcHAnLz5gIHRvIHRoZSBkb2N1bWVudCBhbmQgY2FsbFxuICogYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tL215L2FwcC9mb29gLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL2xvY2F0aW9uL3RzL3BhdGhfbG9jYXRpb25fY29tcG9uZW50LnRzIHJlZ2lvbj0nTG9jYXRpb25Db21wb25lbnQnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBhdGhMb2NhdGlvblN0cmF0ZWd5IGV4dGVuZHMgTG9jYXRpb25TdHJhdGVneSB7XG4gIHByaXZhdGUgX2Jhc2VIcmVmOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChBUFBfQkFTRV9IUkVGKSBocmVmPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmIChocmVmID09IG51bGwpIHtcbiAgICAgIGhyZWYgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldEJhc2VIcmVmRnJvbURPTSgpO1xuICAgIH1cblxuICAgIGlmIChocmVmID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgTm8gYmFzZSBocmVmIHNldC4gUGxlYXNlIHByb3ZpZGUgYSB2YWx1ZSBmb3IgdGhlIEFQUF9CQVNFX0hSRUYgdG9rZW4gb3IgYWRkIGEgYmFzZSBlbGVtZW50IHRvIHRoZSBkb2N1bWVudC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNlSHJlZiA9IGhyZWY7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlKGZuKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZShmbik7XG4gIH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9iYXNlSHJlZjtcbiAgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gam9pbldpdGhTbGFzaCh0aGlzLl9iYXNlSHJlZiwgaW50ZXJuYWwpO1xuICB9XG5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRobmFtZSA9XG4gICAgICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWUgKyBub3JtYWxpemVRdWVyeVBhcmFtcyh0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCk7XG4gICAgY29uc3QgaGFzaCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uaGFzaDtcbiAgICByZXR1cm4gaGFzaCAmJiBpbmNsdWRlSGFzaCA/IGAke3BhdGhuYW1lfSR7aGFzaH1gIDogcGF0aG5hbWU7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCBleHRlcm5hbFVybCk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCBleHRlcm5hbFVybCk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZm9yd2FyZCgpO1xuICB9XG5cbiAgYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTtcbiAgfVxufVxuIl19