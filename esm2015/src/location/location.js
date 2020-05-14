/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/location/location.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Injectable, ɵɵinject } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import { PlatformLocation } from './platform_location';
import { joinWithSlash, normalizeQueryParams, stripTrailingSlash } from './util';
import * as i0 from "@angular/core";
/**
 * \@publicApi
 * @record
 */
export function PopStateEvent() { }
if (false) {
    /** @type {?|undefined} */
    PopStateEvent.prototype.pop;
    /** @type {?|undefined} */
    PopStateEvent.prototype.state;
    /** @type {?|undefined} */
    PopStateEvent.prototype.type;
    /** @type {?|undefined} */
    PopStateEvent.prototype.url;
}
/**
 * \@description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on the `LocationStrategy` used, `Location` persists
 * to the URL's path or the URL's hash segment.
 *
 * \@usageNotes
 *
 * It's better to use the `Router#navigate` service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * <code-example path='common/location/ts/path_location_component.ts'
 * region='LocationComponent'></code-example>
 *
 * \@publicApi
 */
let Location = /** @class */ (() => {
    /**
     * \@description
     *
     * A service that applications can use to interact with a browser's URL.
     *
     * Depending on the `LocationStrategy` used, `Location` persists
     * to the URL's path or the URL's hash segment.
     *
     * \@usageNotes
     *
     * It's better to use the `Router#navigate` service to trigger route changes. Use
     * `Location` only if you need to interact with or create normalized URLs outside of
     * routing.
     *
     * `Location` is responsible for normalizing the URL against the application's base href.
     * A normalized URL is absolute from the URL host, includes the application's base href, and has no
     * trailing slash:
     * - `/my/app/user/123` is normalized
     * - `my/app/user/123` **is not** normalized
     * - `/my/app/user/123/` **is not** normalized
     *
     * ### Example
     *
     * <code-example path='common/location/ts/path_location_component.ts'
     * region='LocationComponent'></code-example>
     *
     * \@publicApi
     */
    class Location {
        /**
         * @param {?} platformStrategy
         * @param {?} platformLocation
         */
        constructor(platformStrategy, platformLocation) {
            /**
             * \@internal
             */
            this._subject = new EventEmitter();
            /**
             * \@internal
             */
            this._urlChangeListeners = [];
            this._platformStrategy = platformStrategy;
            /** @type {?} */
            const browserBaseHref = this._platformStrategy.getBaseHref();
            this._platformLocation = platformLocation;
            this._baseHref = stripTrailingSlash(_stripIndexHtml(browserBaseHref));
            this._platformStrategy.onPopState((/**
             * @param {?} ev
             * @return {?}
             */
            (ev) => {
                this._subject.emit({
                    'url': this.path(true),
                    'pop': true,
                    'state': ev.state,
                    'type': ev.type,
                });
            }));
        }
        /**
         * Normalizes the URL path for this location.
         *
         * @param {?=} includeHash True to include an anchor fragment in the path.
         *
         * @return {?} The normalized URL path.
         */
        // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
        // removed.
        path(includeHash = false) {
            return this.normalize(this._platformStrategy.path(includeHash));
        }
        /**
         * Reports the current state of the location history.
         * @return {?} The current value of the `history.state` object.
         */
        getState() {
            return this._platformLocation.getState();
        }
        /**
         * Normalizes the given path and compares to the current normalized path.
         *
         * @param {?} path The given URL path.
         * @param {?=} query Query parameters.
         *
         * @return {?} True if the given URL path is equal to the current normalized path, false
         * otherwise.
         */
        isCurrentPathEqualTo(path, query = '') {
            return this.path() == this.normalize(path + normalizeQueryParams(query));
        }
        /**
         * Normalizes a URL path by stripping any trailing slashes.
         *
         * @param {?} url String representing a URL.
         *
         * @return {?} The normalized URL string.
         */
        normalize(url) {
            return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
        }
        /**
         * Normalizes an external URL path.
         * If the given URL doesn't begin with a leading slash (`'/'`), adds one
         * before normalizing. Adds a hash if `HashLocationStrategy` is
         * in use, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
         *
         * @param {?} url String representing a URL.
         *
         * @return {?} A normalized platform-specific URL.
         */
        prepareExternalUrl(url) {
            if (url && url[0] !== '/') {
                url = '/' + url;
            }
            return this._platformStrategy.prepareExternalUrl(url);
        }
        // TODO: rename this method to pushState
        /**
         * Changes the browser's URL to a normalized version of a given URL, and pushes a
         * new item onto the platform's history.
         *
         * @param {?} path  URL path to normalize.
         * @param {?=} query Query parameters.
         * @param {?=} state Location history state.
         *
         * @return {?}
         */
        go(path, query = '', state = null) {
            this._platformStrategy.pushState(state, '', path, query);
            this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
        }
        /**
         * Changes the browser's URL to a normalized version of the given URL, and replaces
         * the top item on the platform's history stack.
         *
         * @param {?} path  URL path to normalize.
         * @param {?=} query Query parameters.
         * @param {?=} state Location history state.
         * @return {?}
         */
        replaceState(path, query = '', state = null) {
            this._platformStrategy.replaceState(state, '', path, query);
            this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
        }
        /**
         * Navigates forward in the platform's history.
         * @return {?}
         */
        forward() {
            this._platformStrategy.forward();
        }
        /**
         * Navigates back in the platform's history.
         * @return {?}
         */
        back() {
            this._platformStrategy.back();
        }
        /**
         * Registers a URL change listener. Use to catch updates performed by the Angular
         * framework that are not detectible through "popstate" or "hashchange" events.
         *
         * @param {?} fn The change handler function, which take a URL and a location history state.
         * @return {?}
         */
        onUrlChange(fn) {
            this._urlChangeListeners.push(fn);
            this.subscribe((/**
             * @param {?} v
             * @return {?}
             */
            v => {
                this._notifyUrlChangeListeners(v.url, v.state);
            }));
        }
        /**
         * \@internal
         * @param {?=} url
         * @param {?=} state
         * @return {?}
         */
        _notifyUrlChangeListeners(url = '', state) {
            this._urlChangeListeners.forEach((/**
             * @param {?} fn
             * @return {?}
             */
            fn => fn(url, state)));
        }
        /**
         * Subscribes to the platform's `popState` events.
         *
         * @param {?} onNext
         * @param {?=} onThrow
         * @param {?=} onReturn
         * @return {?} Subscribed events.
         */
        subscribe(onNext, onThrow, onReturn) {
            return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
        }
    }
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * @param params String of URL parameters.
     *
     * @return The normalized URL parameters string.
     */
    Location.normalizeQueryParams = normalizeQueryParams;
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @return The joined URL string.
     */
    Location.joinWithSlash = joinWithSlash;
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string.
     *
     * @return The URL string, modified if needed.
     */
    Location.stripTrailingSlash = stripTrailingSlash;
    Location.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root',
                    // See #23917
                    useFactory: createLocation,
                },] }
    ];
    /** @nocollapse */
    Location.ctorParameters = () => [
        { type: LocationStrategy },
        { type: PlatformLocation }
    ];
    /** @nocollapse */ Location.ɵprov = i0.ɵɵdefineInjectable({ factory: createLocation, token: Location, providedIn: "root" });
    return Location;
})();
export { Location };
if (false) {
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * \@param params String of URL parameters.
     *
     * \@return The normalized URL parameters string.
     * @type {?}
     */
    Location.normalizeQueryParams;
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * \@param start  URL string
     * \@param end    URL string
     *
     *
     * \@return The joined URL string.
     * @type {?}
     */
    Location.joinWithSlash;
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * \@param url URL string.
     *
     * \@return The URL string, modified if needed.
     * @type {?}
     */
    Location.stripTrailingSlash;
    /**
     * \@internal
     * @type {?}
     */
    Location.prototype._subject;
    /**
     * \@internal
     * @type {?}
     */
    Location.prototype._baseHref;
    /**
     * \@internal
     * @type {?}
     */
    Location.prototype._platformStrategy;
    /**
     * \@internal
     * @type {?}
     */
    Location.prototype._platformLocation;
    /**
     * \@internal
     * @type {?}
     */
    Location.prototype._urlChangeListeners;
}
/**
 * @return {?}
 */
export function createLocation() {
    return new Location(ɵɵinject((/** @type {?} */ (LocationStrategy))), ɵɵinject((/** @type {?} */ (PlatformLocation))));
}
/**
 * @param {?} baseHref
 * @param {?} url
 * @return {?}
 */
function _stripBaseHref(baseHref, url) {
    return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}
/**
 * @param {?} url
 * @return {?}
 */
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7QUFHL0UsbUNBS0M7OztJQUpDLDRCQUFjOztJQUNkLDhCQUFZOztJQUNaLDZCQUFjOztJQUNkLDRCQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQmY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsTUFLYSxRQUFROzs7OztRQVluQixZQUFZLGdCQUFrQyxFQUFFLGdCQUFrQzs7OztZQVZsRixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7Ozs7WUFRakQsd0JBQW1CLEdBQThDLEVBQUUsQ0FBQztZQUdsRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7O2tCQUNwQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRTtZQUM1RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7WUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVTs7OztZQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO29CQUNqQixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLEtBQUssRUFBRSxJQUFJO29CQUNYLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSztvQkFDakIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJO2lCQUNoQixDQUFDLENBQUM7WUFDTCxDQUFDLEVBQUMsQ0FBQztRQUNMLENBQUM7Ozs7Ozs7Ozs7UUFXRCxJQUFJLENBQUMsY0FBdUIsS0FBSztZQUMvQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7Ozs7O1FBTUQsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNDLENBQUM7Ozs7Ozs7Ozs7UUFXRCxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsUUFBZ0IsRUFBRTtZQUNuRCxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzNFLENBQUM7Ozs7Ozs7O1FBU0QsU0FBUyxDQUFDLEdBQVc7WUFDbkIsT0FBTyxRQUFRLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRixDQUFDOzs7Ozs7Ozs7OztRQVlELGtCQUFrQixDQUFDLEdBQVc7WUFDNUIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFDekIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7YUFDakI7WUFDRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RCxDQUFDOzs7Ozs7Ozs7Ozs7UUFZRCxFQUFFLENBQUMsSUFBWSxFQUFFLFFBQWdCLEVBQUUsRUFBRSxRQUFhLElBQUk7WUFDcEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMseUJBQXlCLENBQzFCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRSxDQUFDOzs7Ozs7Ozs7O1FBVUQsWUFBWSxDQUFDLElBQVksRUFBRSxRQUFnQixFQUFFLEVBQUUsUUFBYSxJQUFJO1lBQzlELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLHlCQUF5QixDQUMxQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUUsQ0FBQzs7Ozs7UUFLRCxPQUFPO1lBQ0wsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLENBQUM7Ozs7O1FBS0QsSUFBSTtZQUNGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDOzs7Ozs7OztRQVFELFdBQVcsQ0FBQyxFQUF5QztZQUNuRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxTQUFTOzs7O1lBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRCxDQUFDLEVBQUMsQ0FBQztRQUNMLENBQUM7Ozs7Ozs7UUFHRCx5QkFBeUIsQ0FBQyxNQUFjLEVBQUUsRUFBRSxLQUFjO1lBQ3hELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPOzs7O1lBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFDLENBQUM7UUFDekQsQ0FBQzs7Ozs7Ozs7O1FBVUQsU0FBUyxDQUNMLE1BQXNDLEVBQUUsT0FBeUMsRUFDakYsUUFBNEI7WUFDOUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDOzs7Ozs7Ozs7SUFTYSw2QkFBb0IsR0FBK0Isb0JBQW9CLENBQUM7Ozs7Ozs7Ozs7SUFXeEUsc0JBQWEsR0FBMkMsYUFBYSxDQUFDOzs7Ozs7Ozs7O0lBV3RFLDJCQUFrQixHQUE0QixrQkFBa0IsQ0FBQzs7Z0JBdk1oRixVQUFVLFNBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07O29CQUVsQixVQUFVLEVBQUUsY0FBYztpQkFDM0I7Ozs7Z0JBNUNPLGdCQUFnQjtnQkFDaEIsZ0JBQWdCOzs7bUJBWHhCO0tBMFBDO1NBbk1ZLFFBQVE7Ozs7Ozs7Ozs7SUE0S25CLDhCQUFzRjs7Ozs7Ozs7Ozs7SUFXdEYsdUJBQW9GOzs7Ozs7Ozs7OztJQVdwRiw0QkFBK0U7Ozs7O0lBaE0vRSw0QkFBaUQ7Ozs7O0lBRWpELDZCQUFrQjs7Ozs7SUFFbEIscUNBQW9DOzs7OztJQUVwQyxxQ0FBb0M7Ozs7O0lBRXBDLHVDQUFvRTs7Ozs7QUEyTHRFLE1BQU0sVUFBVSxjQUFjO0lBQzVCLE9BQU8sSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLG1CQUFBLGdCQUFnQixFQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsbUJBQUEsZ0JBQWdCLEVBQU8sQ0FBQyxDQUFDLENBQUM7QUFDNUYsQ0FBQzs7Ozs7O0FBRUQsU0FBUyxjQUFjLENBQUMsUUFBZ0IsRUFBRSxHQUFXO0lBQ25ELE9BQU8sUUFBUSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDckYsQ0FBQzs7Ozs7QUFFRCxTQUFTLGVBQWUsQ0FBQyxHQUFXO0lBQ2xDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIEluamVjdGFibGUsIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25MaWtlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtqb2luV2l0aFNsYXNoLCBub3JtYWxpemVRdWVyeVBhcmFtcywgc3RyaXBUcmFpbGluZ1NsYXNofSBmcm9tICcuL3V0aWwnO1xuXG4vKiogQHB1YmxpY0FwaSAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3BTdGF0ZUV2ZW50IHtcbiAgcG9wPzogYm9vbGVhbjtcbiAgc3RhdGU/OiBhbnk7XG4gIHR5cGU/OiBzdHJpbmc7XG4gIHVybD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIHNlcnZpY2UgdGhhdCBhcHBsaWNhdGlvbnMgY2FuIHVzZSB0byBpbnRlcmFjdCB3aXRoIGEgYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBEZXBlbmRpbmcgb24gdGhlIGBMb2NhdGlvblN0cmF0ZWd5YCB1c2VkLCBgTG9jYXRpb25gIHBlcnNpc3RzXG4gKiB0byB0aGUgVVJMJ3MgcGF0aCBvciB0aGUgVVJMJ3MgaGFzaCBzZWdtZW50LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogSXQncyBiZXR0ZXIgdG8gdXNlIHRoZSBgUm91dGVyI25hdmlnYXRlYCBzZXJ2aWNlIHRvIHRyaWdnZXIgcm91dGUgY2hhbmdlcy4gVXNlXG4gKiBgTG9jYXRpb25gIG9ubHkgaWYgeW91IG5lZWQgdG8gaW50ZXJhY3Qgd2l0aCBvciBjcmVhdGUgbm9ybWFsaXplZCBVUkxzIG91dHNpZGUgb2ZcbiAqIHJvdXRpbmcuXG4gKlxuICogYExvY2F0aW9uYCBpcyByZXNwb25zaWJsZSBmb3Igbm9ybWFsaXppbmcgdGhlIFVSTCBhZ2FpbnN0IHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZi5cbiAqIEEgbm9ybWFsaXplZCBVUkwgaXMgYWJzb2x1dGUgZnJvbSB0aGUgVVJMIGhvc3QsIGluY2x1ZGVzIHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZiwgYW5kIGhhcyBub1xuICogdHJhaWxpbmcgc2xhc2g6XG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzYCBpcyBub3JtYWxpemVkXG4gKiAtIGBteS9hcHAvdXNlci8xMjNgICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICogLSBgL215L2FwcC91c2VyLzEyMy9gICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPSdjb21tb24vbG9jYXRpb24vdHMvcGF0aF9sb2NhdGlvbl9jb21wb25lbnQudHMnXG4gKiByZWdpb249J0xvY2F0aW9uQ29tcG9uZW50Jz48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IGNyZWF0ZUxvY2F0aW9uLFxufSlcbmV4cG9ydCBjbGFzcyBMb2NhdGlvbiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9iYXNlSHJlZjogc3RyaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9wbGF0Zm9ybVN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5O1xuICAvKiogQGludGVybmFsICovXG4gIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uO1xuICAvKiogQGludGVybmFsICovXG4gIF91cmxDaGFuZ2VMaXN0ZW5lcnM6ICgodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSwgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbikge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kgPSBwbGF0Zm9ybVN0cmF0ZWd5O1xuICAgIGNvbnN0IGJyb3dzZXJCYXNlSHJlZiA9IHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuZ2V0QmFzZUhyZWYoKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uID0gcGxhdGZvcm1Mb2NhdGlvbjtcbiAgICB0aGlzLl9iYXNlSHJlZiA9IHN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBJbmRleEh0bWwoYnJvd3NlckJhc2VIcmVmKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5vblBvcFN0YXRlKChldikgPT4ge1xuICAgICAgdGhpcy5fc3ViamVjdC5lbWl0KHtcbiAgICAgICAgJ3VybCc6IHRoaXMucGF0aCh0cnVlKSxcbiAgICAgICAgJ3BvcCc6IHRydWUsXG4gICAgICAgICdzdGF0ZSc6IGV2LnN0YXRlLFxuICAgICAgICAndHlwZSc6IGV2LnR5cGUsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBVUkwgcGF0aCBmb3IgdGhpcyBsb2NhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIGluY2x1ZGVIYXNoIFRydWUgdG8gaW5jbHVkZSBhbiBhbmNob3IgZnJhZ21lbnQgaW4gdGhlIHBhdGguXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBwYXRoLlxuICAgKi9cbiAgLy8gVE9ETzogdnNhdmtpbi4gUmVtb3ZlIHRoZSBib29sZWFuIGZsYWcgYW5kIGFsd2F5cyBpbmNsdWRlIGhhc2ggb25jZSB0aGUgZGVwcmVjYXRlZCByb3V0ZXIgaXNcbiAgLy8gcmVtb3ZlZC5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUodGhpcy5fcGxhdGZvcm1TdHJhdGVneS5wYXRoKGluY2x1ZGVIYXNoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgbG9jYXRpb24gaGlzdG9yeS5cbiAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGBoaXN0b3J5LnN0YXRlYCBvYmplY3QuXG4gICAqL1xuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5nZXRTdGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIGdpdmVuIHBhdGggYW5kIGNvbXBhcmVzIHRvIHRoZSBjdXJyZW50IG5vcm1hbGl6ZWQgcGF0aC5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIGdpdmVuIFVSTCBwYXRoLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgZ2l2ZW4gVVJMIHBhdGggaXMgZXF1YWwgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLCBmYWxzZVxuICAgKiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0N1cnJlbnRQYXRoRXF1YWxUbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBhdGgoKSA9PSB0aGlzLm5vcm1hbGl6ZShwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGEgVVJMIHBhdGggYnkgc3RyaXBwaW5nIGFueSB0cmFpbGluZyBzbGFzaGVzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBzdHJpbmcuXG4gICAqL1xuICBub3JtYWxpemUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBMb2NhdGlvbi5zdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwQmFzZUhyZWYodGhpcy5fYmFzZUhyZWYsIF9zdHJpcEluZGV4SHRtbCh1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhbiBleHRlcm5hbCBVUkwgcGF0aC5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2Vzbid0IGJlZ2luIHdpdGggYSBsZWFkaW5nIHNsYXNoIChgJy8nYCksIGFkZHMgb25lXG4gICAqIGJlZm9yZSBub3JtYWxpemluZy4gQWRkcyBhIGhhc2ggaWYgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBpc1xuICAgKiBpbiB1c2UsIG9yIHRoZSBgQVBQX0JBU0VfSFJFRmAgaWYgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgaW4gdXNlLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwuXG4gICAqXG4gICAqIEByZXR1cm5zICBBIG5vcm1hbGl6ZWQgcGxhdGZvcm0tc3BlY2lmaWMgVVJMLlxuICAgKi9cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsICYmIHVybFswXSAhPT0gJy8nKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCh1cmwpO1xuICB9XG5cbiAgLy8gVE9ETzogcmVuYW1lIHRoaXMgbWV0aG9kIHRvIHB1c2hTdGF0ZVxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcidzIFVSTCB0byBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiBhIGdpdmVuIFVSTCwgYW5kIHB1c2hlcyBhXG4gICAqIG5ldyBpdGVtIG9udG8gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggIFVSTCBwYXRoIHRvIG5vcm1hbGl6ZS5cbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBzdGF0ZSBMb2NhdGlvbiBoaXN0b3J5IHN0YXRlLlxuICAgKlxuICAgKi9cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5wdXNoU3RhdGUoc3RhdGUsICcnLCBwYXRoLCBxdWVyeSk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKFxuICAgICAgICB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKSwgc3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGJyb3dzZXIncyBVUkwgdG8gYSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIFVSTCwgYW5kIHJlcGxhY2VzXG4gICAqIHRoZSB0b3AgaXRlbSBvbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5IHN0YWNrLlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCAgVVJMIHBhdGggdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqL1xuICByZXBsYWNlU3RhdGUocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5yZXBsYWNlU3RhdGUoc3RhdGUsICcnLCBwYXRoLCBxdWVyeSk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKFxuICAgICAgICB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKSwgc3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBmb3J3YXJkIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuZm9yd2FyZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBiYWNrIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuYmFjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIFVSTCBjaGFuZ2UgbGlzdGVuZXIuIFVzZSB0byBjYXRjaCB1cGRhdGVzIHBlcmZvcm1lZCBieSB0aGUgQW5ndWxhclxuICAgKiBmcmFtZXdvcmsgdGhhdCBhcmUgbm90IGRldGVjdGlibGUgdGhyb3VnaCBcInBvcHN0YXRlXCIgb3IgXCJoYXNoY2hhbmdlXCIgZXZlbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gZm4gVGhlIGNoYW5nZSBoYW5kbGVyIGZ1bmN0aW9uLCB3aGljaCB0YWtlIGEgVVJMIGFuZCBhIGxvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqL1xuICBvblVybENoYW5nZShmbjogKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZCkge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5wdXNoKGZuKTtcbiAgICB0aGlzLnN1YnNjcmliZSh2ID0+IHtcbiAgICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh2LnVybCwgdi5zdGF0ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnModXJsOiBzdHJpbmcgPSAnJywgc3RhdGU6IHVua25vd24pIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaChmbiA9PiBmbih1cmwsIHN0YXRlKSk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyB0byB0aGUgcGxhdGZvcm0ncyBgcG9wU3RhdGVgIGV2ZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIEV2ZW50IHRoYXQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHN0YXRlIGhpc3RvcnkgY2hhbmdlcy5cbiAgICogQHBhcmFtIGV4Y2VwdGlvbiBUaGUgZXhjZXB0aW9uIHRvIHRocm93LlxuICAgKlxuICAgKiBAcmV0dXJucyBTdWJzY3JpYmVkIGV2ZW50cy5cbiAgICovXG4gIHN1YnNjcmliZShcbiAgICAgIG9uTmV4dDogKHZhbHVlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkLCBvblRocm93PzogKChleGNlcHRpb246IGFueSkgPT4gdm9pZCl8bnVsbCxcbiAgICAgIG9uUmV0dXJuPzogKCgpID0+IHZvaWQpfG51bGwpOiBTdWJzY3JpcHRpb25MaWtlIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5zdWJzY3JpYmUoe25leHQ6IG9uTmV4dCwgZXJyb3I6IG9uVGhyb3csIGNvbXBsZXRlOiBvblJldHVybn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgVVJMIHBhcmFtZXRlcnMgYnkgcHJlcGVuZGluZyB3aXRoIGA/YCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIEBwYXJhbSAgcGFyYW1zIFN0cmluZyBvZiBVUkwgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHBhcmFtZXRlcnMgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBub3JtYWxpemVRdWVyeVBhcmFtczogKHBhcmFtczogc3RyaW5nKSA9PiBzdHJpbmcgPSBub3JtYWxpemVRdWVyeVBhcmFtcztcblxuICAvKipcbiAgICogSm9pbnMgdHdvIHBhcnRzIG9mIGEgVVJMIHdpdGggYSBzbGFzaCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCAgVVJMIHN0cmluZ1xuICAgKiBAcGFyYW0gZW5kICAgIFVSTCBzdHJpbmdcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGpvaW5lZCBVUkwgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBqb2luV2l0aFNsYXNoOiAoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHN0cmluZyA9IGpvaW5XaXRoU2xhc2g7XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSB0cmFpbGluZyBzbGFzaCBmcm9tIGEgVVJMIHN0cmluZyBpZiBuZWVkZWQuXG4gICAqIExvb2tzIGZvciB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBlaXRoZXIgYCNgLCBgP2AsIG9yIHRoZSBlbmQgb2YgdGhlXG4gICAqIGxpbmUgYXMgYC9gIGNoYXJhY3RlcnMgYW5kIHJlbW92ZXMgdGhlIHRyYWlsaW5nIHNsYXNoIGlmIG9uZSBleGlzdHMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVVJMIHN0cmluZy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIFVSTCBzdHJpbmcsIG1vZGlmaWVkIGlmIG5lZWRlZC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc3RyaXBUcmFpbGluZ1NsYXNoOiAodXJsOiBzdHJpbmcpID0+IHN0cmluZyA9IHN0cmlwVHJhaWxpbmdTbGFzaDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uKCkge1xuICByZXR1cm4gbmV3IExvY2F0aW9uKMm1ybVpbmplY3QoTG9jYXRpb25TdHJhdGVneSBhcyBhbnkpLCDJtcm1aW5qZWN0KFBsYXRmb3JtTG9jYXRpb24gYXMgYW55KSk7XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEJhc2VIcmVmKGJhc2VIcmVmOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJhc2VIcmVmICYmIHVybC5zdGFydHNXaXRoKGJhc2VIcmVmKSA/IHVybC5zdWJzdHJpbmcoYmFzZUhyZWYubGVuZ3RoKSA6IHVybDtcbn1cblxuZnVuY3Rpb24gX3N0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9pbmRleC5odG1sJC8sICcnKTtcbn1cbiJdfQ==