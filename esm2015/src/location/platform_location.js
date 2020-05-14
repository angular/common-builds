/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/location/platform_location.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, ɵɵinject } from '@angular/core';
import { getDOM } from '../dom_adapter';
import { DOCUMENT } from '../dom_tokens';
import * as i0 from "@angular/core";
/**
 * This class should not be used directly by an application developer. Instead, use
 * {\@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM APIs, which allows the Router to be
 * platform-agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that Angular supports. For example, `\@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `\@angular/platform-server` provides
 * one suitable for use with server-side rendering.
 *
 * The `PlatformLocation` class is used directly by all implementations of {\@link LocationStrategy}
 * when they need to interact with the DOM APIs like pushState, popState, etc.
 *
 * {\@link LocationStrategy} in turn is used by the {\@link Location} service which is used directly
 * by the {\@link Router} in order to navigate between routes. Since all interactions between {\@link
 * Router} /
 * {\@link Location} / {\@link LocationStrategy} and DOM APIs flow through the `PlatformLocation`
 * class, they are all platform-agnostic.
 *
 * \@publicApi
 * @abstract
 */
let PlatformLocation = /** @class */ (() => {
    /**
     * This class should not be used directly by an application developer. Instead, use
     * {\@link Location}.
     *
     * `PlatformLocation` encapsulates all calls to DOM APIs, which allows the Router to be
     * platform-agnostic.
     * This means that we can have different implementation of `PlatformLocation` for the different
     * platforms that Angular supports. For example, `\@angular/platform-browser` provides an
     * implementation specific to the browser environment, while `\@angular/platform-server` provides
     * one suitable for use with server-side rendering.
     *
     * The `PlatformLocation` class is used directly by all implementations of {\@link LocationStrategy}
     * when they need to interact with the DOM APIs like pushState, popState, etc.
     *
     * {\@link LocationStrategy} in turn is used by the {\@link Location} service which is used directly
     * by the {\@link Router} in order to navigate between routes. Since all interactions between {\@link
     * Router} /
     * {\@link Location} / {\@link LocationStrategy} and DOM APIs flow through the `PlatformLocation`
     * class, they are all platform-agnostic.
     *
     * \@publicApi
     * @abstract
     */
    class PlatformLocation {
    }
    PlatformLocation.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'platform',
                    // See #23917
                    useFactory: useBrowserPlatformLocation
                },] }
    ];
    /** @nocollapse */ PlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ factory: useBrowserPlatformLocation, token: PlatformLocation, providedIn: "platform" });
    return PlatformLocation;
})();
export { PlatformLocation };
if (false) {
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.getBaseHrefFromDOM = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.getState = function () { };
    /**
     * @abstract
     * @param {?} fn
     * @return {?}
     */
    PlatformLocation.prototype.onPopState = function (fn) { };
    /**
     * @abstract
     * @param {?} fn
     * @return {?}
     */
    PlatformLocation.prototype.onHashChange = function (fn) { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.href = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.protocol = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.hostname = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.port = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.pathname = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.search = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.hash = function () { };
    /**
     * @abstract
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @return {?}
     */
    PlatformLocation.prototype.replaceState = function (state, title, url) { };
    /**
     * @abstract
     * @param {?} state
     * @param {?} title
     * @param {?} url
     * @return {?}
     */
    PlatformLocation.prototype.pushState = function (state, title, url) { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.forward = function () { };
    /**
     * @abstract
     * @return {?}
     */
    PlatformLocation.prototype.back = function () { };
}
/**
 * @return {?}
 */
export function useBrowserPlatformLocation() {
    return ɵɵinject(BrowserPlatformLocation);
}
/**
 * \@description
 * Indicates when a location is initialized.
 *
 * \@publicApi
 * @type {?}
 */
export const LOCATION_INITIALIZED = new InjectionToken('Location Initialized');
/**
 * \@description
 * A serializable version of the event from `onPopState` or `onHashChange`
 *
 * \@publicApi
 * @record
 */
export function LocationChangeEvent() { }
if (false) {
    /** @type {?} */
    LocationChangeEvent.prototype.type;
    /** @type {?} */
    LocationChangeEvent.prototype.state;
}
/**
 * \@publicApi
 * @record
 */
export function LocationChangeListener() { }
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {\@link Location}.
 */
let BrowserPlatformLocation = /** @class */ (() => {
    /**
     * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
     * This class should not be used directly by an application developer. Instead, use
     * {\@link Location}.
     */
    class BrowserPlatformLocation extends PlatformLocation {
        /**
         * @param {?} _doc
         */
        constructor(_doc) {
            super();
            this._doc = _doc;
            this._init();
        }
        // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
        /**
         * \@internal
         * @return {?}
         */
        _init() {
            ((/** @type {?} */ (this))).location = getDOM().getLocation();
            this._history = getDOM().getHistory();
        }
        /**
         * @return {?}
         */
        getBaseHrefFromDOM() {
            return (/** @type {?} */ (getDOM().getBaseHref(this._doc)));
        }
        /**
         * @param {?} fn
         * @return {?}
         */
        onPopState(fn) {
            getDOM().getGlobalEventTarget(this._doc, 'window').addEventListener('popstate', fn, false);
        }
        /**
         * @param {?} fn
         * @return {?}
         */
        onHashChange(fn) {
            getDOM().getGlobalEventTarget(this._doc, 'window').addEventListener('hashchange', fn, false);
        }
        /**
         * @return {?}
         */
        get href() {
            return this.location.href;
        }
        /**
         * @return {?}
         */
        get protocol() {
            return this.location.protocol;
        }
        /**
         * @return {?}
         */
        get hostname() {
            return this.location.hostname;
        }
        /**
         * @return {?}
         */
        get port() {
            return this.location.port;
        }
        /**
         * @return {?}
         */
        get pathname() {
            return this.location.pathname;
        }
        /**
         * @return {?}
         */
        get search() {
            return this.location.search;
        }
        /**
         * @return {?}
         */
        get hash() {
            return this.location.hash;
        }
        /**
         * @param {?} newPath
         * @return {?}
         */
        set pathname(newPath) {
            this.location.pathname = newPath;
        }
        /**
         * @param {?} state
         * @param {?} title
         * @param {?} url
         * @return {?}
         */
        pushState(state, title, url) {
            if (supportsState()) {
                this._history.pushState(state, title, url);
            }
            else {
                this.location.hash = url;
            }
        }
        /**
         * @param {?} state
         * @param {?} title
         * @param {?} url
         * @return {?}
         */
        replaceState(state, title, url) {
            if (supportsState()) {
                this._history.replaceState(state, title, url);
            }
            else {
                this.location.hash = url;
            }
        }
        /**
         * @return {?}
         */
        forward() {
            this._history.forward();
        }
        /**
         * @return {?}
         */
        back() {
            this._history.back();
        }
        /**
         * @return {?}
         */
        getState() {
            return this._history.state;
        }
    }
    BrowserPlatformLocation.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'platform',
                    // See #23917
                    useFactory: createBrowserPlatformLocation,
                },] }
    ];
    /** @nocollapse */
    BrowserPlatformLocation.ctorParameters = () => [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ];
    /** @nocollapse */ BrowserPlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ factory: createBrowserPlatformLocation, token: BrowserPlatformLocation, providedIn: "platform" });
    return BrowserPlatformLocation;
})();
export { BrowserPlatformLocation };
if (false) {
    /** @type {?} */
    BrowserPlatformLocation.prototype.location;
    /**
     * @type {?}
     * @private
     */
    BrowserPlatformLocation.prototype._history;
    /**
     * @type {?}
     * @private
     */
    BrowserPlatformLocation.prototype._doc;
}
/**
 * @return {?}
 */
export function supportsState() {
    return !!window.history.pushState;
}
/**
 * @return {?}
 */
export function createBrowserPlatformLocation() {
    return new BrowserPlatformLocation(ɵɵinject(DOCUMENT));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QnZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxNQUtzQixnQkFBZ0I7OztnQkFMckMsVUFBVSxTQUFDO29CQUNWLFVBQVUsRUFBRSxVQUFVOztvQkFFdEIsVUFBVSxFQUFFLDBCQUEwQjtpQkFDdkM7OzsyQkF0Q0Q7S0E0REM7U0FyQnFCLGdCQUFnQjs7Ozs7O0lBQ3BDLGdFQUFzQzs7Ozs7SUFDdEMsc0RBQTZCOzs7Ozs7SUFDN0IsMERBQXNEOzs7Ozs7SUFDdEQsNERBQXdEOzs7OztJQUV4RCxrREFBNEI7Ozs7O0lBQzVCLHNEQUFnQzs7Ozs7SUFDaEMsc0RBQWdDOzs7OztJQUNoQyxrREFBNEI7Ozs7O0lBQzVCLHNEQUFnQzs7Ozs7SUFDaEMsb0RBQThCOzs7OztJQUM5QixrREFBNEI7Ozs7Ozs7O0lBRTVCLDJFQUFvRTs7Ozs7Ozs7SUFFcEUsd0VBQWlFOzs7OztJQUVqRSxxREFBeUI7Ozs7O0lBRXpCLGtEQUFzQjs7Ozs7QUFHeEIsTUFBTSxVQUFVLDBCQUEwQjtJQUN4QyxPQUFPLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzNDLENBQUM7Ozs7Ozs7O0FBUUQsTUFBTSxPQUFPLG9CQUFvQixHQUFHLElBQUksY0FBYyxDQUFlLHNCQUFz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LElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQzs7OztRQUVELElBQUk7WUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLENBQUM7Ozs7UUFFRCxRQUFRO1lBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM3QixDQUFDOzs7Z0JBcEZGLFVBQVUsU0FBQztvQkFDVixVQUFVLEVBQUUsVUFBVTs7b0JBRXRCLFVBQVUsRUFBRSw2QkFBNkI7aUJBQzFDOzs7O2dEQUtjLE1BQU0sU0FBQyxRQUFROzs7a0NBNUc5QjtLQXdMQztTQWhGWSx1QkFBdUI7OztJQUNsQywyQ0FBb0M7Ozs7O0lBQ3BDLDJDQUEyQjs7Ozs7SUFFZix1Q0FBbUM7Ozs7O0FBOEVqRCxNQUFNLFVBQVUsYUFBYTtJQUMzQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUNwQyxDQUFDOzs7O0FBQ0QsTUFBTSxVQUFVLDZCQUE2QjtJQUMzQyxPQUFPLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Z2V0RE9NfSBmcm9tICcuLi9kb21fYWRhcHRlcic7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi9kb21fdG9rZW5zJztcblxuLyoqXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSBieSBhbiBhcHBsaWNhdGlvbiBkZXZlbG9wZXIuIEluc3RlYWQsIHVzZVxuICoge0BsaW5rIExvY2F0aW9ufS5cbiAqXG4gKiBgUGxhdGZvcm1Mb2NhdGlvbmAgZW5jYXBzdWxhdGVzIGFsbCBjYWxscyB0byBET00gQVBJcywgd2hpY2ggYWxsb3dzIHRoZSBSb3V0ZXIgdG8gYmVcbiAqIHBsYXRmb3JtLWFnbm9zdGljLlxuICogVGhpcyBtZWFucyB0aGF0IHdlIGNhbiBoYXZlIGRpZmZlcmVudCBpbXBsZW1lbnRhdGlvbiBvZiBgUGxhdGZvcm1Mb2NhdGlvbmAgZm9yIHRoZSBkaWZmZXJlbnRcbiAqIHBsYXRmb3JtcyB0aGF0IEFuZ3VsYXIgc3VwcG9ydHMuIEZvciBleGFtcGxlLCBgQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlcmAgcHJvdmlkZXMgYW5cbiAqIGltcGxlbWVudGF0aW9uIHNwZWNpZmljIHRvIHRoZSBicm93c2VyIGVudmlyb25tZW50LCB3aGlsZSBgQGFuZ3VsYXIvcGxhdGZvcm0tc2VydmVyYCBwcm92aWRlc1xuICogb25lIHN1aXRhYmxlIGZvciB1c2Ugd2l0aCBzZXJ2ZXItc2lkZSByZW5kZXJpbmcuXG4gKlxuICogVGhlIGBQbGF0Zm9ybUxvY2F0aW9uYCBjbGFzcyBpcyB1c2VkIGRpcmVjdGx5IGJ5IGFsbCBpbXBsZW1lbnRhdGlvbnMgb2Yge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9XG4gKiB3aGVuIHRoZXkgbmVlZCB0byBpbnRlcmFjdCB3aXRoIHRoZSBET00gQVBJcyBsaWtlIHB1c2hTdGF0ZSwgcG9wU3RhdGUsIGV0Yy5cbiAqXG4gKiB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gaW4gdHVybiBpcyB1c2VkIGJ5IHRoZSB7QGxpbmsgTG9jYXRpb259IHNlcnZpY2Ugd2hpY2ggaXMgdXNlZCBkaXJlY3RseVxuICogYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGluIG9yZGVyIHRvIG5hdmlnYXRlIGJldHdlZW4gcm91dGVzLiBTaW5jZSBhbGwgaW50ZXJhY3Rpb25zIGJldHdlZW4ge0BsaW5rXG4gKiBSb3V0ZXJ9IC9cbiAqIHtAbGluayBMb2NhdGlvbn0gLyB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gYW5kIERPTSBBUElzIGZsb3cgdGhyb3VnaCB0aGUgYFBsYXRmb3JtTG9jYXRpb25gXG4gKiBjbGFzcywgdGhleSBhcmUgYWxsIHBsYXRmb3JtLWFnbm9zdGljLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncGxhdGZvcm0nLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IHVzZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBhYnN0cmFjdCBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXRTdGF0ZSgpOiB1bmtub3duO1xuICBhYnN0cmFjdCBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZDtcbiAgYWJzdHJhY3Qgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZDtcblxuICBhYnN0cmFjdCBnZXQgaHJlZigpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBwcm90b2NvbCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBob3N0bmFtZSgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBwb3J0KCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHBhdGhuYW1lKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHNlYXJjaCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBoYXNoKCk6IHN0cmluZztcblxuICBhYnN0cmFjdCByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkO1xuXG4gIGFic3RyYWN0IHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgZm9yd2FyZCgpOiB2b2lkO1xuXG4gIGFic3RyYWN0IGJhY2soKTogdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uKCkge1xuICByZXR1cm4gybXJtWluamVjdChCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbik7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBJbmRpY2F0ZXMgd2hlbiBhIGxvY2F0aW9uIGlzIGluaXRpYWxpemVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IExPQ0FUSU9OX0lOSVRJQUxJWkVEID0gbmV3IEluamVjdGlvblRva2VuPFByb21pc2U8YW55Pj4oJ0xvY2F0aW9uIEluaXRpYWxpemVkJyk7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIHNlcmlhbGl6YWJsZSB2ZXJzaW9uIG9mIHRoZSBldmVudCBmcm9tIGBvblBvcFN0YXRlYCBvciBgb25IYXNoQ2hhbmdlYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbkNoYW5nZUV2ZW50IHtcbiAgdHlwZTogc3RyaW5nO1xuICBzdGF0ZTogYW55O1xufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyIHtcbiAgKGV2ZW50OiBMb2NhdGlvbkNoYW5nZUV2ZW50KTogYW55O1xufVxuXG5cblxuLyoqXG4gKiBgUGxhdGZvcm1Mb2NhdGlvbmAgZW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgZGlyZWN0IGNhbGxzIHRvIHBsYXRmb3JtIEFQSXMuXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSBieSBhbiBhcHBsaWNhdGlvbiBkZXZlbG9wZXIuIEluc3RlYWQsIHVzZVxuICoge0BsaW5rIExvY2F0aW9ufS5cbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncGxhdGZvcm0nLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IGNyZWF0ZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLFxufSlcbmV4cG9ydCBjbGFzcyBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbiBleHRlbmRzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwdWJsaWMgcmVhZG9ubHkgbG9jYXRpb24hOiBMb2NhdGlvbjtcbiAgcHJpdmF0ZSBfaGlzdG9yeSE6IEhpc3Rvcnk7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgbW92ZWQgdG8gaXRzIG93biBtZXRob2Qgc28gdGhhdCBgTW9ja1BsYXRmb3JtTG9jYXRpb25TdHJhdGVneWAgY2FuIG92ZXJ3cml0ZSBpdFxuICAvKiogQGludGVybmFsICovXG4gIF9pbml0KCkge1xuICAgICh0aGlzIGFzIHtsb2NhdGlvbjogTG9jYXRpb259KS5sb2NhdGlvbiA9IGdldERPTSgpLmdldExvY2F0aW9uKCk7XG4gICAgdGhpcy5faGlzdG9yeSA9IGdldERPTSgpLmdldEhpc3RvcnkoKTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXRET00oKS5nZXRCYXNlSHJlZih0aGlzLl9kb2MpITtcbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICBnZXRET00oKS5nZXRHbG9iYWxFdmVudFRhcmdldCh0aGlzLl9kb2MsICd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZuLCBmYWxzZSk7XG4gIH1cblxuICBvbkhhc2hDaGFuZ2UoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICBnZXRET00oKS5nZXRHbG9iYWxFdmVudFRhcmdldCh0aGlzLl9kb2MsICd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIGdldCBocmVmKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRpb24uaHJlZjtcbiAgfVxuICBnZXQgcHJvdG9jb2woKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdGlvbi5wcm90b2NvbDtcbiAgfVxuICBnZXQgaG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgfVxuICBnZXQgcG9ydCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLnBvcnQ7XG4gIH1cbiAgZ2V0IHBhdGhuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRpb24ucGF0aG5hbWU7XG4gIH1cbiAgZ2V0IHNlYXJjaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLnNlYXJjaDtcbiAgfVxuICBnZXQgaGFzaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLmhhc2g7XG4gIH1cbiAgc2V0IHBhdGhuYW1lKG5ld1BhdGg6IHN0cmluZykge1xuICAgIHRoaXMubG9jYXRpb24ucGF0aG5hbWUgPSBuZXdQYXRoO1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHN1cHBvcnRzU3RhdGUoKSkge1xuICAgICAgdGhpcy5faGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvY2F0aW9uLmhhc2ggPSB1cmw7XG4gICAgfVxuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHN1cHBvcnRzU3RhdGUoKSkge1xuICAgICAgdGhpcy5faGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvY2F0aW9uLmhhc2ggPSB1cmw7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9oaXN0b3J5LmZvcndhcmQoKTtcbiAgfVxuXG4gIGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5iYWNrKCk7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeS5zdGF0ZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VwcG9ydHNTdGF0ZSgpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uKCkge1xuICByZXR1cm4gbmV3IEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uKMm1ybVpbmplY3QoRE9DVU1FTlQpKTtcbn0iXX0=