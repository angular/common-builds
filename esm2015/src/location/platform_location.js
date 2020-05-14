/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/location/platform_location.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Inject, Injectable, InjectionToken, ɵɵinject } from '@angular/core';
import { getDOM } from '../dom_adapter';
import { DOCUMENT } from '../dom_tokens';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
                },] },
    ];
    /** @nocollapse */ PlatformLocation.ɵfac = function PlatformLocation_Factory(t) { return new (t || PlatformLocation)(); };
    /** @nocollapse */ PlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ token: PlatformLocation, factory: function () { return useBrowserPlatformLocation(); }, providedIn: 'platform' });
    return PlatformLocation;
})();
export { PlatformLocation };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PlatformLocation, [{
        type: Injectable,
        args: [{
                providedIn: 'platform',
                // See #23917
                useFactory: useBrowserPlatformLocation
            }]
    }], null, null); })();
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
                },] },
    ];
    /** @nocollapse */
    BrowserPlatformLocation.ctorParameters = () => [
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ];
    /** @nocollapse */ BrowserPlatformLocation.ɵfac = function BrowserPlatformLocation_Factory(t) { return new (t || BrowserPlatformLocation)(i0.ɵɵinject(DOCUMENT)); };
    /** @nocollapse */ BrowserPlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ token: BrowserPlatformLocation, factory: function () { return createBrowserPlatformLocation(); }, providedIn: 'platform' });
    return BrowserPlatformLocation;
})();
export { BrowserPlatformLocation };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(BrowserPlatformLocation, [{
        type: Injectable,
        args: [{
                providedIn: 'platform',
                // See #23917
                useFactory: createBrowserPlatformLocation,
            }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }]; }, null); })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QnZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxNQUtzQixnQkFBZ0I7OztnQkFMckMsVUFBVSxTQUFDO29CQUNWLFVBQVUsRUFBRSxVQUFVOztvQkFFdEIsVUFBVSxFQUFFLDBCQUEwQjtpQkFDdkM7O3VHQUNxQixnQkFBZ0I7K0VBQWhCLGdCQUFnQixnQ0FGeEIsMEJBQTBCLG1CQUYxQixVQUFVOzJCQW5DeEI7S0E0REM7U0FyQnFCLGdCQUFnQjtrREFBaEIsZ0JBQWdCO2NBTHJDLFVBQVU7ZUFBQztnQkFDVixVQUFVLEVBQUUsVUFBVTs7Z0JBRXRCLFVBQVUsRUFBRSwwQkFBMEI7YUFDdkM7Ozs7Ozs7SUFFQyxnRUFBc0M7Ozs7O0lBQ3RDLHNEQUE2Qjs7Ozs7O0lBQzdCLDBEQUFzRDs7Ozs7O0lBQ3RELDREQUF3RDs7Ozs7SUFFeEQsa0RBQTRCOzs7OztJQUM1QixzREFBZ0M7Ozs7O0lBQ2hDLHNEQUFnQzs7Ozs7SUFDaEMsa0RBQTRCOzs7OztJQUM1QixzREFBZ0M7Ozs7O0lBQ2hDLG9EQUE4Qjs7Ozs7SUFDOUIsa0RBQTRCOzs7Ozs7OztJQUU1QiwyRUFBb0U7Ozs7Ozs7O0lBRXBFLHdFQUFpRTs7Ozs7SUFFakUscURBQXlCOzs7OztJQUV6Qixr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bCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtnZXRET019IGZyb20gJy4uL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uL2RvbV90b2tlbnMnO1xuXG4vKipcbiAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5IGJ5IGFuIGFwcGxpY2F0aW9uIGRldmVsb3Blci4gSW5zdGVhZCwgdXNlXG4gKiB7QGxpbmsgTG9jYXRpb259LlxuICpcbiAqIGBQbGF0Zm9ybUxvY2F0aW9uYCBlbmNhcHN1bGF0ZXMgYWxsIGNhbGxzIHRvIERPTSBBUElzLCB3aGljaCBhbGxvd3MgdGhlIFJvdXRlciB0byBiZVxuICogcGxhdGZvcm0tYWdub3N0aWMuXG4gKiBUaGlzIG1lYW5zIHRoYXQgd2UgY2FuIGhhdmUgZGlmZmVyZW50IGltcGxlbWVudGF0aW9uIG9mIGBQbGF0Zm9ybUxvY2F0aW9uYCBmb3IgdGhlIGRpZmZlcmVudFxuICogcGxhdGZvcm1zIHRoYXQgQW5ndWxhciBzdXBwb3J0cy4gRm9yIGV4YW1wbGUsIGBAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyYCBwcm92aWRlcyBhblxuICogaW1wbGVtZW50YXRpb24gc3BlY2lmaWMgdG8gdGhlIGJyb3dzZXIgZW52aXJvbm1lbnQsIHdoaWxlIGBAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXJgIHByb3ZpZGVzXG4gKiBvbmUgc3VpdGFibGUgZm9yIHVzZSB3aXRoIHNlcnZlci1zaWRlIHJlbmRlcmluZy5cbiAqXG4gKiBUaGUgYFBsYXRmb3JtTG9jYXRpb25gIGNsYXNzIGlzIHVzZWQgZGlyZWN0bHkgYnkgYWxsIGltcGxlbWVudGF0aW9ucyBvZiB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX1cbiAqIHdoZW4gdGhleSBuZWVkIHRvIGludGVyYWN0IHdpdGggdGhlIERPTSBBUElzIGxpa2UgcHVzaFN0YXRlLCBwb3BTdGF0ZSwgZXRjLlxuICpcbiAqIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSBpbiB0dXJuIGlzIHVzZWQgYnkgdGhlIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB3aGljaCBpcyB1c2VkIGRpcmVjdGx5XG4gKiBieSB0aGUge0BsaW5rIFJvdXRlcn0gaW4gb3JkZXIgdG8gbmF2aWdhdGUgYmV0d2VlbiByb3V0ZXMuIFNpbmNlIGFsbCBpbnRlcmFjdGlvbnMgYmV0d2VlbiB7QGxpbmtcbiAqIFJvdXRlcn0gL1xuICoge0BsaW5rIExvY2F0aW9ufSAvIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSBhbmQgRE9NIEFQSXMgZmxvdyB0aHJvdWdoIHRoZSBgUGxhdGZvcm1Mb2NhdGlvbmBcbiAqIGNsYXNzLCB0aGV5IGFyZSBhbGwgcGxhdGZvcm0tYWdub3N0aWMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdwbGF0Zm9ybScsXG4gIC8vIFNlZSAjMjM5MTdcbiAgdXNlRmFjdG9yeTogdXNlQnJvd3NlclBsYXRmb3JtTG9jYXRpb25cbn0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIGFic3RyYWN0IGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldFN0YXRlKCk6IHVua25vd247XG4gIGFic3RyYWN0IG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkO1xuICBhYnN0cmFjdCBvbkhhc2hDaGFuZ2UoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkO1xuXG4gIGFic3RyYWN0IGdldCBocmVmKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHByb3RvY29sKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IGhvc3RuYW1lKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHBvcnQoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgcGF0aG5hbWUoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgc2VhcmNoKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IGhhc2goKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZDtcblxuICBhYnN0cmFjdCBmb3J3YXJkKCk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgYmFjaygpOiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQnJvd3NlclBsYXRmb3JtTG9jYXRpb24oKSB7XG4gIHJldHVybiDJtcm1aW5qZWN0KEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uKTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEluZGljYXRlcyB3aGVuIGEgbG9jYXRpb24gaXMgaW5pdGlhbGl6ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTE9DQVRJT05fSU5JVElBTElaRUQgPSBuZXcgSW5qZWN0aW9uVG9rZW48UHJvbWlzZTxhbnk+PignTG9jYXRpb24gSW5pdGlhbGl6ZWQnKTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgc2VyaWFsaXphYmxlIHZlcnNpb24gb2YgdGhlIGV2ZW50IGZyb20gYG9uUG9wU3RhdGVgIG9yIGBvbkhhc2hDaGFuZ2VgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uQ2hhbmdlRXZlbnQge1xuICB0eXBlOiBzdHJpbmc7XG4gIHN0YXRlOiBhbnk7XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIge1xuICAoZXZlbnQ6IExvY2F0aW9uQ2hhbmdlRXZlbnQpOiBhbnk7XG59XG5cblxuXG4vKipcbiAqIGBQbGF0Zm9ybUxvY2F0aW9uYCBlbmNhcHN1bGF0ZXMgYWxsIG9mIHRoZSBkaXJlY3QgY2FsbHMgdG8gcGxhdGZvcm0gQVBJcy5cbiAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5IGJ5IGFuIGFwcGxpY2F0aW9uIGRldmVsb3Blci4gSW5zdGVhZCwgdXNlXG4gKiB7QGxpbmsgTG9jYXRpb259LlxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdwbGF0Zm9ybScsXG4gIC8vIFNlZSAjMjM5MTdcbiAgdXNlRmFjdG9yeTogY3JlYXRlQnJvd3NlclBsYXRmb3JtTG9jYXRpb24sXG59KVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uIGV4dGVuZHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHB1YmxpYyByZWFkb25seSBsb2NhdGlvbiE6IExvY2F0aW9uO1xuICBwcml2YXRlIF9oaXN0b3J5ITogSGlzdG9yeTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2M6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBtb3ZlZCB0byBpdHMgb3duIG1ldGhvZCBzbyB0aGF0IGBNb2NrUGxhdGZvcm1Mb2NhdGlvblN0cmF0ZWd5YCBjYW4gb3ZlcndyaXRlIGl0XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luaXQoKSB7XG4gICAgKHRoaXMgYXMge2xvY2F0aW9uOiBMb2NhdGlvbn0pLmxvY2F0aW9uID0gZ2V0RE9NKCkuZ2V0TG9jYXRpb24oKTtcbiAgICB0aGlzLl9oaXN0b3J5ID0gZ2V0RE9NKCkuZ2V0SGlzdG9yeSgpO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldERPTSgpLmdldEJhc2VIcmVmKHRoaXMuX2RvYykhO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIGdldERPTSgpLmdldEdsb2JhbEV2ZW50VGFyZ2V0KHRoaXMuX2RvYywgJ3dpbmRvdycpLmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIGdldERPTSgpLmdldEdsb2JhbEV2ZW50VGFyZ2V0KHRoaXMuX2RvYywgJ3dpbmRvdycpLmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmbiwgZmFsc2UpO1xuICB9XG5cbiAgZ2V0IGhyZWYoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdGlvbi5ocmVmO1xuICB9XG4gIGdldCBwcm90b2NvbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLnByb3RvY29sO1xuICB9XG4gIGdldCBob3N0bmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLmhvc3RuYW1lO1xuICB9XG4gIGdldCBwb3J0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRpb24ucG9ydDtcbiAgfVxuICBnZXQgcGF0aG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgfVxuICBnZXQgc2VhcmNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRpb24uc2VhcmNoO1xuICB9XG4gIGdldCBoYXNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRpb24uaGFzaDtcbiAgfVxuICBzZXQgcGF0aG5hbWUobmV3UGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5sb2NhdGlvbi5wYXRobmFtZSA9IG5ld1BhdGg7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3VwcG9ydHNTdGF0ZSgpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYXRpb24uaGFzaCA9IHVybDtcbiAgICB9XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3VwcG9ydHNTdGF0ZSgpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYXRpb24uaGFzaCA9IHVybDtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIHRoaXMuX2hpc3RvcnkuZm9yd2FyZCgpO1xuICB9XG5cbiAgYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLl9oaXN0b3J5LmJhY2soKTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLl9oaXN0b3J5LnN0YXRlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdXBwb3J0c1N0YXRlKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gISF3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGU7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnJvd3NlclBsYXRmb3JtTG9jYXRpb24oKSB7XG4gIHJldHVybiBuZXcgQnJvd3NlclBsYXRmb3JtTG9jYXRpb24oybXJtWluamVjdChET0NVTUVOVCkpO1xufSJdfQ==