/**
 * @fileoverview added by tsickle
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
 * `PlatformLocation` encapsulates all calls to DOM apis, which allows the Router to be platform
 * agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that angular supports. For example, `\@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `\@angular/platform-webworker` provides
 * one suitable for use with web workers.
 *
 * The `PlatformLocation` class is used directly by all implementations of {\@link LocationStrategy}
 * when they need to interact with the DOM apis like pushState, popState, etc...
 *
 * {\@link LocationStrategy} in turn is used by the {\@link Location} service which is used directly
 * by the {\@link Router} in order to navigate between routes. Since all interactions between {\@link
 * Router} /
 * {\@link Location} / {\@link LocationStrategy} and DOM apis flow through the `PlatformLocation`
 * class they are all platform independent.
 *
 * \@publicApi
 * @abstract
 */
export class PlatformLocation {
}
PlatformLocation.decorators = [
    { type: Injectable, args: [{
                providedIn: 'platform',
                // See #23917
                useFactory: useBrowserPlatformLocation
            },] }
];
/** @nocollapse */ PlatformLocation.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: useBrowserPlatformLocation, token: PlatformLocation, providedIn: "platform" });
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
export class BrowserPlatformLocation extends PlatformLocation {
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
    getBaseHrefFromDOM() { return (/** @type {?} */ (getDOM().getBaseHref(this._doc))); }
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
    get href() { return this.location.href; }
    /**
     * @return {?}
     */
    get protocol() { return this.location.protocol; }
    /**
     * @return {?}
     */
    get hostname() { return this.location.hostname; }
    /**
     * @return {?}
     */
    get port() { return this.location.port; }
    /**
     * @return {?}
     */
    get pathname() { return this.location.pathname; }
    /**
     * @return {?}
     */
    get search() { return this.location.search; }
    /**
     * @return {?}
     */
    get hash() { return this.location.hash; }
    /**
     * @param {?} newPath
     * @return {?}
     */
    set pathname(newPath) { this.location.pathname = newPath; }
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
    forward() { this._history.forward(); }
    /**
     * @return {?}
     */
    back() { this._history.back(); }
    /**
     * @return {?}
     */
    getState() { return this._history.state; }
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
/** @nocollapse */ BrowserPlatformLocation.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: createBrowserPlatformLocation, token: BrowserPlatformLocation, providedIn: "platform" });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCdkMsTUFBTSxPQUFnQixnQkFBZ0I7OztZQUxyQyxVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLFVBQVU7O2dCQUV0QixVQUFVLEVBQUUsMEJBQTBCO2FBQ3ZDOzs7Ozs7OztJQUVDLGdFQUFzQzs7Ozs7SUFDdEMsc0RBQTZCOzs7Ozs7SUFDN0IsMERBQXNEOzs7Ozs7SUFDdEQsNERBQXdEOzs7OztJQUV4RCxrREFBNEI7Ozs7O0lBQzVCLHNEQUFnQzs7Ozs7SUFDaEMsc0RBQWdDOzs7OztJQUNoQyxrREFBNEI7Ozs7O0lBQzVCLHNEQUFnQzs7Ozs7SUFDaEMsb0RBQThCOzs7OztJQUM5QixrREFBNEI7Ozs7Ozs7O0lBRTVCLDJFQUFvRTs7Ozs7Ozs7SUFFcEUsd0VBQWlFOzs7OztJQUVqRSxxREFBeUI7Ozs7O0lBRXpCLGtEQUFzQjs7Ozs7QUFHeEIsTUFBTSxVQUFVLDBCQUEwQjtJQUN4QyxPQUFPLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzNDLENBQUM7Ozs7Ozs7O0FBUUQsTUFBTSxPQUFPLG9CQUFvQixHQUFHLElBQUksY0FBYyxDQUFlLHNCQUFzQixDQUFDOzs7Ozs7OztBQVE1Rix5Q0FHQzs7O0lBRkMsbUNBQWE7O0lBQ2Isb0NBQVc7Ozs7OztBQU1iLDRDQUE4RTs7Ozs7O0FBYzlFLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxnQkFBZ0I7Ozs7SUFJM0QsWUFBc0MsSUFBUztRQUM3QyxLQUFLLEVBQUUsQ0FBQztRQUQ0QixTQUFJLEdBQUosSUFBSSxDQUFLO1FBRTdDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7Ozs7OztJQUlELEtBQUs7UUFDSCxDQUFDLG1CQUFBLElBQUksRUFBdUIsQ0FBQyxDQUFDLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3hDLENBQUM7Ozs7SUFFRCxrQkFBa0IsS0FBYSxPQUFPLG1CQUFBLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRTFFLFVBQVUsQ0FBQyxFQUEwQjtRQUNuQyxNQUFNLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0YsQ0FBQzs7Ozs7SUFFRCxZQUFZLENBQUMsRUFBMEI7UUFDckMsTUFBTSxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9GLENBQUM7Ozs7SUFFRCxJQUFJLElBQUksS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7OztJQUNqRCxJQUFJLFFBQVEsS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7OztJQUN6RCxJQUFJLFFBQVEsS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7OztJQUN6RCxJQUFJLElBQUksS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7OztJQUNqRCxJQUFJLFFBQVEsS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7OztJQUN6RCxJQUFJLE1BQU0sS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7OztJQUNyRCxJQUFJLElBQUksS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFDakQsSUFBSSxRQUFRLENBQUMsT0FBZSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7SUFFbkUsU0FBUyxDQUFDLEtBQVUsRUFBRSxLQUFhLEVBQUUsR0FBVztRQUM5QyxJQUFJLGFBQWEsRUFBRSxFQUFFO1lBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUM7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztTQUMxQjtJQUNILENBQUM7Ozs7Ozs7SUFFRCxZQUFZLENBQUMsS0FBVSxFQUFFLEtBQWEsRUFBRSxHQUFXO1FBQ2pELElBQUksYUFBYSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMvQzthQUFNO1lBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQzs7OztJQUVELE9BQU8sS0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQzs7OztJQUU1QyxJQUFJLEtBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFdEMsUUFBUSxLQUFjLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7WUE1RHBELFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsVUFBVTs7Z0JBRXRCLFVBQVUsRUFBRSw2QkFBNkI7YUFDMUM7Ozs7NENBS2MsTUFBTSxTQUFDLFFBQVE7Ozs7O0lBSDVCLDJDQUFxQzs7Ozs7SUFDckMsMkNBQTRCOzs7OztJQUVoQix1Q0FBbUM7Ozs7O0FBc0RqRCxNQUFNLFVBQVUsYUFBYTtJQUMzQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUNwQyxDQUFDOzs7O0FBQ0QsTUFBTSxVQUFVLDZCQUE2QjtJQUMzQyxPQUFPLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Z2V0RE9NfSBmcm9tICcuLi9kb21fYWRhcHRlcic7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi9kb21fdG9rZW5zJztcblxuLyoqXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSBieSBhbiBhcHBsaWNhdGlvbiBkZXZlbG9wZXIuIEluc3RlYWQsIHVzZVxuICoge0BsaW5rIExvY2F0aW9ufS5cbiAqXG4gKiBgUGxhdGZvcm1Mb2NhdGlvbmAgZW5jYXBzdWxhdGVzIGFsbCBjYWxscyB0byBET00gYXBpcywgd2hpY2ggYWxsb3dzIHRoZSBSb3V0ZXIgdG8gYmUgcGxhdGZvcm1cbiAqIGFnbm9zdGljLlxuICogVGhpcyBtZWFucyB0aGF0IHdlIGNhbiBoYXZlIGRpZmZlcmVudCBpbXBsZW1lbnRhdGlvbiBvZiBgUGxhdGZvcm1Mb2NhdGlvbmAgZm9yIHRoZSBkaWZmZXJlbnRcbiAqIHBsYXRmb3JtcyB0aGF0IGFuZ3VsYXIgc3VwcG9ydHMuIEZvciBleGFtcGxlLCBgQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlcmAgcHJvdmlkZXMgYW5cbiAqIGltcGxlbWVudGF0aW9uIHNwZWNpZmljIHRvIHRoZSBicm93c2VyIGVudmlyb25tZW50LCB3aGlsZSBgQGFuZ3VsYXIvcGxhdGZvcm0td2Vid29ya2VyYCBwcm92aWRlc1xuICogb25lIHN1aXRhYmxlIGZvciB1c2Ugd2l0aCB3ZWIgd29ya2Vycy5cbiAqXG4gKiBUaGUgYFBsYXRmb3JtTG9jYXRpb25gIGNsYXNzIGlzIHVzZWQgZGlyZWN0bHkgYnkgYWxsIGltcGxlbWVudGF0aW9ucyBvZiB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX1cbiAqIHdoZW4gdGhleSBuZWVkIHRvIGludGVyYWN0IHdpdGggdGhlIERPTSBhcGlzIGxpa2UgcHVzaFN0YXRlLCBwb3BTdGF0ZSwgZXRjLi4uXG4gKlxuICoge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IGluIHR1cm4gaXMgdXNlZCBieSB0aGUge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHdoaWNoIGlzIHVzZWQgZGlyZWN0bHlcbiAqIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBpbiBvcmRlciB0byBuYXZpZ2F0ZSBiZXR3ZWVuIHJvdXRlcy4gU2luY2UgYWxsIGludGVyYWN0aW9ucyBiZXR3ZWVuIHtAbGlua1xuICogUm91dGVyfSAvXG4gKiB7QGxpbmsgTG9jYXRpb259IC8ge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IGFuZCBET00gYXBpcyBmbG93IHRocm91Z2ggdGhlIGBQbGF0Zm9ybUxvY2F0aW9uYFxuICogY2xhc3MgdGhleSBhcmUgYWxsIHBsYXRmb3JtIGluZGVwZW5kZW50LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncGxhdGZvcm0nLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IHVzZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBhYnN0cmFjdCBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXRTdGF0ZSgpOiB1bmtub3duO1xuICBhYnN0cmFjdCBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZDtcbiAgYWJzdHJhY3Qgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZDtcblxuICBhYnN0cmFjdCBnZXQgaHJlZigpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBwcm90b2NvbCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBob3N0bmFtZSgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBwb3J0KCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHBhdGhuYW1lKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IHNlYXJjaCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldCBoYXNoKCk6IHN0cmluZztcblxuICBhYnN0cmFjdCByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkO1xuXG4gIGFic3RyYWN0IHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgZm9yd2FyZCgpOiB2b2lkO1xuXG4gIGFic3RyYWN0IGJhY2soKTogdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uKCkge1xuICByZXR1cm4gybXJtWluamVjdChCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbik7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBJbmRpY2F0ZXMgd2hlbiBhIGxvY2F0aW9uIGlzIGluaXRpYWxpemVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IExPQ0FUSU9OX0lOSVRJQUxJWkVEID0gbmV3IEluamVjdGlvblRva2VuPFByb21pc2U8YW55Pj4oJ0xvY2F0aW9uIEluaXRpYWxpemVkJyk7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIHNlcmlhbGl6YWJsZSB2ZXJzaW9uIG9mIHRoZSBldmVudCBmcm9tIGBvblBvcFN0YXRlYCBvciBgb25IYXNoQ2hhbmdlYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbkNoYW5nZUV2ZW50IHtcbiAgdHlwZTogc3RyaW5nO1xuICBzdGF0ZTogYW55O1xufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyIHsgKGV2ZW50OiBMb2NhdGlvbkNoYW5nZUV2ZW50KTogYW55OyB9XG5cblxuXG4vKipcbiAqIGBQbGF0Zm9ybUxvY2F0aW9uYCBlbmNhcHN1bGF0ZXMgYWxsIG9mIHRoZSBkaXJlY3QgY2FsbHMgdG8gcGxhdGZvcm0gQVBJcy5cbiAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5IGJ5IGFuIGFwcGxpY2F0aW9uIGRldmVsb3Blci4gSW5zdGVhZCwgdXNlXG4gKiB7QGxpbmsgTG9jYXRpb259LlxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdwbGF0Zm9ybScsXG4gIC8vIFNlZSAjMjM5MTdcbiAgdXNlRmFjdG9yeTogY3JlYXRlQnJvd3NlclBsYXRmb3JtTG9jYXRpb24sXG59KVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uIGV4dGVuZHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHB1YmxpYyByZWFkb25seSBsb2NhdGlvbiAhOiBMb2NhdGlvbjtcbiAgcHJpdmF0ZSBfaGlzdG9yeSAhOiBIaXN0b3J5O1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvYzogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cblxuICAvLyBUaGlzIGlzIG1vdmVkIHRvIGl0cyBvd24gbWV0aG9kIHNvIHRoYXQgYE1vY2tQbGF0Zm9ybUxvY2F0aW9uU3RyYXRlZ3lgIGNhbiBvdmVyd3JpdGUgaXRcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5pdCgpIHtcbiAgICAodGhpcyBhc3tsb2NhdGlvbjogTG9jYXRpb259KS5sb2NhdGlvbiA9IGdldERPTSgpLmdldExvY2F0aW9uKCk7XG4gICAgdGhpcy5faGlzdG9yeSA9IGdldERPTSgpLmdldEhpc3RvcnkoKTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmcgeyByZXR1cm4gZ2V0RE9NKCkuZ2V0QmFzZUhyZWYodGhpcy5fZG9jKSAhOyB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIGdldERPTSgpLmdldEdsb2JhbEV2ZW50VGFyZ2V0KHRoaXMuX2RvYywgJ3dpbmRvdycpLmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIGdldERPTSgpLmdldEdsb2JhbEV2ZW50VGFyZ2V0KHRoaXMuX2RvYywgJ3dpbmRvdycpLmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmbiwgZmFsc2UpO1xuICB9XG5cbiAgZ2V0IGhyZWYoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubG9jYXRpb24uaHJlZjsgfVxuICBnZXQgcHJvdG9jb2woKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubG9jYXRpb24ucHJvdG9jb2w7IH1cbiAgZ2V0IGhvc3RuYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmxvY2F0aW9uLmhvc3RuYW1lOyB9XG4gIGdldCBwb3J0KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmxvY2F0aW9uLnBvcnQ7IH1cbiAgZ2V0IHBhdGhuYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmxvY2F0aW9uLnBhdGhuYW1lOyB9XG4gIGdldCBzZWFyY2goKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubG9jYXRpb24uc2VhcmNoOyB9XG4gIGdldCBoYXNoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmxvY2F0aW9uLmhhc2g7IH1cbiAgc2V0IHBhdGhuYW1lKG5ld1BhdGg6IHN0cmluZykgeyB0aGlzLmxvY2F0aW9uLnBhdGhuYW1lID0gbmV3UGF0aDsgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChzdXBwb3J0c1N0YXRlKCkpIHtcbiAgICAgIHRoaXMuX2hpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhdGlvbi5oYXNoID0gdXJsO1xuICAgIH1cbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChzdXBwb3J0c1N0YXRlKCkpIHtcbiAgICAgIHRoaXMuX2hpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhdGlvbi5oYXNoID0gdXJsO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX2hpc3RvcnkuZm9yd2FyZCgpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5faGlzdG9yeS5iYWNrKCk7IH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHsgcmV0dXJuIHRoaXMuX2hpc3Rvcnkuc3RhdGU7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1cHBvcnRzU3RhdGUoKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIXdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbijJtcm1aW5qZWN0KERPQ1VNRU5UKSk7XG59Il19