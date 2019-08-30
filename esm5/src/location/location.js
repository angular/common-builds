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
import * as i1 from "./location_strategy";
import * as i2 from "./platform_location";
/**
 * @description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on the `LocationStrategy` used, `Location` persists
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
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
 * @publicApi
 */
var Location = /** @class */ (function () {
    function Location(platformStrategy, platformLocation) {
        var _this = this;
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._urlChangeListeners = [];
        this._platformStrategy = platformStrategy;
        var browserBaseHref = this._platformStrategy.getBaseHref();
        this._platformLocation = platformLocation;
        this._baseHref = stripTrailingSlash(_stripIndexHtml(browserBaseHref));
        this._platformStrategy.onPopState(function (ev) {
            _this._subject.emit({
                'url': _this.path(true),
                'pop': true,
                'state': ev.state,
                'type': ev.type,
            });
        });
    }
    /**
     * Normalizes the URL path for this location.
     *
     * @param includeHash True to include an anchor fragment in the path.
     *
     * @returns The normalized URL path.
     */
    // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
    // removed.
    Location.prototype.path = function (includeHash) {
        if (includeHash === void 0) { includeHash = false; }
        return this.normalize(this._platformStrategy.path(includeHash));
    };
    /**
     * Reports the current state of the location history.
     * @returns The current value of the `history.state` object.
     */
    Location.prototype.getState = function () { return this._platformLocation.getState(); };
    /**
     * Normalizes the given path and compares to the current normalized path.
     *
     * @param path The given URL path.
     * @param query Query parameters.
     *
     * @returns True if the given URL path is equal to the current normalized path, false
     * otherwise.
     */
    Location.prototype.isCurrentPathEqualTo = function (path, query) {
        if (query === void 0) { query = ''; }
        return this.path() == this.normalize(path + normalizeQueryParams(query));
    };
    /**
     * Normalizes a URL path by stripping any trailing slashes.
     *
     * @param url String representing a URL.
     *
     * @returns The normalized URL string.
     */
    Location.prototype.normalize = function (url) {
        return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
    };
    /**
     * Normalizes an external URL path.
     * If the given URL doesn't begin with a leading slash (`'/'`), adds one
     * before normalizing. Adds a hash if `HashLocationStrategy` is
     * in use, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
     *
     * @param url String representing a URL.
     *
     * @returns  A normalized platform-specific URL.
     */
    Location.prototype.prepareExternalUrl = function (url) {
        if (url && url[0] !== '/') {
            url = '/' + url;
        }
        return this._platformStrategy.prepareExternalUrl(url);
    };
    // TODO: rename this method to pushState
    /**
     * Changes the browser's URL to a normalized version of a given URL, and pushes a
     * new item onto the platform's history.
     *
     * @param path  URL path to normalize.
     * @param query Query parameters.
     * @param state Location history state.
     *
     */
    Location.prototype.go = function (path, query, state) {
        if (query === void 0) { query = ''; }
        if (state === void 0) { state = null; }
        this._platformStrategy.pushState(state, '', path, query);
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
    };
    /**
     * Changes the browser's URL to a normalized version of the given URL, and replaces
     * the top item on the platform's history stack.
     *
     * @param path  URL path to normalize.
     * @param query Query parameters.
     * @param state Location history state.
     */
    Location.prototype.replaceState = function (path, query, state) {
        if (query === void 0) { query = ''; }
        if (state === void 0) { state = null; }
        this._platformStrategy.replaceState(state, '', path, query);
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
    };
    /**
     * Navigates forward in the platform's history.
     */
    Location.prototype.forward = function () { this._platformStrategy.forward(); };
    /**
     * Navigates back in the platform's history.
     */
    Location.prototype.back = function () { this._platformStrategy.back(); };
    /**
     * Registers a URL change listener. Use to catch updates performed by the Angular
     * framework that are not detectible through "popstate" or "hashchange" events.
     *
     * @param fn The change handler function, which take a URL and a location history state.
     */
    Location.prototype.onUrlChange = function (fn) {
        var _this = this;
        this._urlChangeListeners.push(fn);
        this.subscribe(function (v) { _this._notifyUrlChangeListeners(v.url, v.state); });
    };
    /** @internal */
    Location.prototype._notifyUrlChangeListeners = function (url, state) {
        if (url === void 0) { url = ''; }
        this._urlChangeListeners.forEach(function (fn) { return fn(url, state); });
    };
    /**
     * Subscribes to the platform's `popState` events.
     *
     * @param value Event that is triggered when the state history changes.
     * @param exception The exception to throw.
     *
     * @returns Subscribed events.
     */
    Location.prototype.subscribe = function (onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    };
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * @param  params String of URL parameters.
     *
     * @returns The normalized URL parameters string.
     */
    Location.normalizeQueryParams = normalizeQueryParams;
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @returns The joined URL string.
     */
    Location.joinWithSlash = joinWithSlash;
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string.
     *
     * @returns The URL string, modified if needed.
     */
    Location.stripTrailingSlash = stripTrailingSlash;
    Location.ngInjectableDef = i0.ɵɵdefineInjectable({ token: Location, factory: function Location_Factory(t) { var r = null; if (t) {
            (r = new t(i0.ɵɵinject(i1.LocationStrategy), i0.ɵɵinject(i2.PlatformLocation)));
        }
        else {
            (r = createLocation());
        } return r; }, providedIn: 'root' });
    return Location;
}());
export { Location };
/*@__PURE__*/ i0.ɵsetClassMetadata(Location, [{
        type: Injectable,
        args: [{
                providedIn: 'root',
                // See #23917
                useFactory: createLocation,
            }]
    }], function () { return [{ type: i1.LocationStrategy }, { type: i2.PlatformLocation }]; }, null);
export function createLocation() {
    return new Location(ɵɵinject(LocationStrategy), ɵɵinject(PlatformLocation));
}
function _stripBaseHref(baseHref, url) {
    return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7O0FBVS9FOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQkc7QUFDSDtJQWlCRSxrQkFBWSxnQkFBa0MsRUFBRSxnQkFBa0M7UUFBbEYsaUJBYUM7UUF4QkQsZ0JBQWdCO1FBQ2hCLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQU9qRCxnQkFBZ0I7UUFDaEIsd0JBQW1CLEdBQThDLEVBQUUsQ0FBQztRQUdsRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7UUFDMUMsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsVUFBQyxFQUFFO1lBQ25DLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUNqQixLQUFLLEVBQUUsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssRUFBRSxJQUFJO2dCQUNYLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSztnQkFDakIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJO2FBQ2hCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILCtGQUErRjtJQUMvRixXQUFXO0lBQ1gsdUJBQUksR0FBSixVQUFLLFdBQTRCO1FBQTVCLDRCQUFBLEVBQUEsbUJBQTRCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNILDJCQUFRLEdBQVIsY0FBc0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWpFOzs7Ozs7OztPQVFHO0lBQ0gsdUNBQW9CLEdBQXBCLFVBQXFCLElBQVksRUFBRSxLQUFrQjtRQUFsQixzQkFBQSxFQUFBLFVBQWtCO1FBQ25ELE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILDRCQUFTLEdBQVQsVUFBVSxHQUFXO1FBQ25CLE9BQU8sUUFBUSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILHFDQUFrQixHQUFsQixVQUFtQixHQUFXO1FBQzVCLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDekIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7U0FDakI7UUFDRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDOzs7Ozs7OztPQVFHO0lBQ0gscUJBQUUsR0FBRixVQUFHLElBQVksRUFBRSxLQUFrQixFQUFFLEtBQWlCO1FBQXJDLHNCQUFBLEVBQUEsVUFBa0I7UUFBRSxzQkFBQSxFQUFBLFlBQWlCO1FBQ3BELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLHlCQUF5QixDQUMxQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCwrQkFBWSxHQUFaLFVBQWEsSUFBWSxFQUFFLEtBQWtCLEVBQUUsS0FBaUI7UUFBckMsc0JBQUEsRUFBQSxVQUFrQjtRQUFFLHNCQUFBLEVBQUEsWUFBaUI7UUFDOUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMseUJBQXlCLENBQzFCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCwwQkFBTyxHQUFQLGNBQWtCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQ7O09BRUc7SUFDSCx1QkFBSSxHQUFKLGNBQWUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUvQzs7Ozs7T0FLRztJQUNILDhCQUFXLEdBQVgsVUFBWSxFQUF5QztRQUFyRCxpQkFHQztRQUZDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFBLENBQUMsSUFBTSxLQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLDRDQUF5QixHQUF6QixVQUEwQixHQUFnQixFQUFFLEtBQWM7UUFBaEMsb0JBQUEsRUFBQSxRQUFnQjtRQUN4QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBZCxDQUFjLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILDRCQUFTLEdBQVQsVUFDSSxNQUFzQyxFQUFFLE9BQXlDLEVBQ2pGLFFBQTRCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNXLDZCQUFvQixHQUErQixvQkFBb0IsQ0FBQztJQUV0Rjs7Ozs7Ozs7T0FRRztJQUNXLHNCQUFhLEdBQTJDLGFBQWEsQ0FBQztJQUVwRjs7Ozs7Ozs7T0FRRztJQUNXLDJCQUFrQixHQUE0QixrQkFBa0IsQ0FBQzs4REExTHBFLFFBQVE7Ozs7aUJBRlAsY0FBYzttQ0FGZCxNQUFNO21CQW5EcEI7Q0FrUEMsQUFoTUQsSUFnTUM7U0EzTFksUUFBUTttQ0FBUixRQUFRO2NBTHBCLFVBQVU7ZUFBQztnQkFDVixVQUFVLEVBQUUsTUFBTTtnQkFDbEIsYUFBYTtnQkFDYixVQUFVLEVBQUUsY0FBYzthQUMzQjs7QUE4TEQsTUFBTSxVQUFVLGNBQWM7SUFDNUIsT0FBTyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQXVCLENBQUMsRUFBRSxRQUFRLENBQUMsZ0JBQXVCLENBQUMsQ0FBQyxDQUFDO0FBQzVGLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxRQUFnQixFQUFFLEdBQVc7SUFDbkQsT0FBTyxRQUFRLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyRixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsR0FBVztJQUNsQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlLCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0xvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7am9pbldpdGhTbGFzaCwgbm9ybWFsaXplUXVlcnlQYXJhbXMsIHN0cmlwVHJhaWxpbmdTbGFzaH0gZnJvbSAnLi91dGlsJztcblxuLyoqIEBwdWJsaWNBcGkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9wU3RhdGVFdmVudCB7XG4gIHBvcD86IGJvb2xlYW47XG4gIHN0YXRlPzogYW55O1xuICB0eXBlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBzZXJ2aWNlIHRoYXQgYXBwbGljYXRpb25zIGNhbiB1c2UgdG8gaW50ZXJhY3Qgd2l0aCBhIGJyb3dzZXIncyBVUkwuXG4gKlxuICogRGVwZW5kaW5nIG9uIHRoZSBgTG9jYXRpb25TdHJhdGVneWAgdXNlZCwgYExvY2F0aW9uYCBwZXJzaXN0c1xuICogdG8gdGhlIFVSTCdzIHBhdGggb3IgdGhlIFVSTCdzIGhhc2ggc2VnbWVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEl0J3MgYmV0dGVyIHRvIHVzZSB0aGUgYFJvdXRlciNuYXZpZ2F0ZWAgc2VydmljZSB0byB0cmlnZ2VyIHJvdXRlIGNoYW5nZXMuIFVzZVxuICogYExvY2F0aW9uYCBvbmx5IGlmIHlvdSBuZWVkIHRvIGludGVyYWN0IHdpdGggb3IgY3JlYXRlIG5vcm1hbGl6ZWQgVVJMcyBvdXRzaWRlIG9mXG4gKiByb3V0aW5nLlxuICpcbiAqIGBMb2NhdGlvbmAgaXMgcmVzcG9uc2libGUgZm9yIG5vcm1hbGl6aW5nIHRoZSBVUkwgYWdhaW5zdCB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYuXG4gKiBBIG5vcm1hbGl6ZWQgVVJMIGlzIGFic29sdXRlIGZyb20gdGhlIFVSTCBob3N0LCBpbmNsdWRlcyB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYsIGFuZCBoYXMgbm9cbiAqIHRyYWlsaW5nIHNsYXNoOlxuICogLSBgL215L2FwcC91c2VyLzEyM2AgaXMgbm9ybWFsaXplZFxuICogLSBgbXkvYXBwL3VzZXIvMTIzYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqIC0gYC9teS9hcHAvdXNlci8xMjMvYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD0nY29tbW9uL2xvY2F0aW9uL3RzL3BhdGhfbG9jYXRpb25fY29tcG9uZW50LnRzJ1xuICogcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCc+PC9jb2RlLWV4YW1wbGU+XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgLy8gU2VlICMyMzkxN1xuICB1c2VGYWN0b3J5OiBjcmVhdGVMb2NhdGlvbixcbn0pXG5leHBvcnQgY2xhc3MgTG9jYXRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmFzZUhyZWY6IHN0cmluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXJsQ2hhbmdlTGlzdGVuZXJzOiAoKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZClbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHBsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3ksIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24pIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5ID0gcGxhdGZvcm1TdHJhdGVneTtcbiAgICBjb25zdCBicm93c2VyQmFzZUhyZWYgPSB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LmdldEJhc2VIcmVmKCk7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbiA9IHBsYXRmb3JtTG9jYXRpb247XG4gICAgdGhpcy5fYmFzZUhyZWYgPSBzdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwSW5kZXhIdG1sKGJyb3dzZXJCYXNlSHJlZikpO1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kub25Qb3BTdGF0ZSgoZXYpID0+IHtcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7XG4gICAgICAgICd1cmwnOiB0aGlzLnBhdGgodHJ1ZSksXG4gICAgICAgICdwb3AnOiB0cnVlLFxuICAgICAgICAnc3RhdGUnOiBldi5zdGF0ZSxcbiAgICAgICAgJ3R5cGUnOiBldi50eXBlLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgVVJMIHBhdGggZm9yIHRoaXMgbG9jYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBpbmNsdWRlSGFzaCBUcnVlIHRvIGluY2x1ZGUgYW4gYW5jaG9yIGZyYWdtZW50IGluIHRoZSBwYXRoLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgcGF0aC5cbiAgICovXG4gIC8vIFRPRE86IHZzYXZraW4uIFJlbW92ZSB0aGUgYm9vbGVhbiBmbGFnIGFuZCBhbHdheXMgaW5jbHVkZSBoYXNoIG9uY2UgdGhlIGRlcHJlY2F0ZWQgcm91dGVyIGlzXG4gIC8vIHJlbW92ZWQuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kucGF0aChpbmNsdWRlSGFzaCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGxvY2F0aW9uIGhpc3RvcnkuXG4gICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBgaGlzdG9yeS5zdGF0ZWAgb2JqZWN0LlxuICAgKi9cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7IHJldHVybiB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldFN0YXRlKCk7IH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgZ2l2ZW4gcGF0aCBhbmQgY29tcGFyZXMgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZ2l2ZW4gVVJMIHBhdGguXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBnaXZlbiBVUkwgcGF0aCBpcyBlcXVhbCB0byB0aGUgY3VycmVudCBub3JtYWxpemVkIHBhdGgsIGZhbHNlXG4gICAqIG90aGVyd2lzZS5cbiAgICovXG4gIGlzQ3VycmVudFBhdGhFcXVhbFRvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGF0aCgpID09IHRoaXMubm9ybWFsaXplKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgYSBVUkwgcGF0aCBieSBzdHJpcHBpbmcgYW55IHRyYWlsaW5nIHNsYXNoZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIG5vcm1hbGl6ZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIExvY2F0aW9uLnN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBCYXNlSHJlZih0aGlzLl9iYXNlSHJlZiwgX3N0cmlwSW5kZXhIdG1sKHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIGV4dGVybmFsIFVSTCBwYXRoLlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXNuJ3QgYmVnaW4gd2l0aCBhIGxlYWRpbmcgc2xhc2ggKGAnLydgKSwgYWRkcyBvbmVcbiAgICogYmVmb3JlIG5vcm1hbGl6aW5nLiBBZGRzIGEgaGFzaCBpZiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzXG4gICAqIGluIHVzZSwgb3IgdGhlIGBBUFBfQkFTRV9IUkVGYCBpZiB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyBpbiB1c2UuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgIEEgbm9ybWFsaXplZCBwbGF0Zm9ybS1zcGVjaWZpYyBVUkwuXG4gICAqL1xuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gIH1cblxuICAvLyBUT0RPOiByZW5hbWUgdGhpcyBtZXRob2QgdG8gcHVzaFN0YXRlXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VyJ3MgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIGEgZ2l2ZW4gVVJMLCBhbmQgcHVzaGVzIGFcbiAgICogbmV3IGl0ZW0gb250byB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCAgVVJMIHBhdGggdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqXG4gICAqL1xuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnB1c2hTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcidzIFVSTCB0byBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcmVwbGFjZXNcbiAgICogdGhlIHRvcCBpdGVtIG9uIHRoZSBwbGF0Zm9ybSdzIGhpc3Rvcnkgc3RhY2suXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoICBVUkwgcGF0aCB0byBub3JtYWxpemUuXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gc3RhdGUgTG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICovXG4gIHJlcGxhY2VTdGF0ZShwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGZvcndhcmQgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuZm9yd2FyZCgpOyB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBiYWNrIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LmJhY2soKTsgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBVUkwgY2hhbmdlIGxpc3RlbmVyLiBVc2UgdG8gY2F0Y2ggdXBkYXRlcyBwZXJmb3JtZWQgYnkgdGhlIEFuZ3VsYXJcbiAgICogZnJhbWV3b3JrIHRoYXQgYXJlIG5vdCBkZXRlY3RpYmxlIHRocm91Z2ggXCJwb3BzdGF0ZVwiIG9yIFwiaGFzaGNoYW5nZVwiIGV2ZW50cy5cbiAgICpcbiAgICogQHBhcmFtIGZuIFRoZSBjaGFuZ2UgaGFuZGxlciBmdW5jdGlvbiwgd2hpY2ggdGFrZSBhIFVSTCBhbmQgYSBsb2NhdGlvbiBoaXN0b3J5IHN0YXRlLlxuICAgKi9cbiAgb25VcmxDaGFuZ2UoZm46ICh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24pID0+IHZvaWQpIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMucHVzaChmbik7XG4gICAgdGhpcy5zdWJzY3JpYmUodiA9PiB7IHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh2LnVybCwgdi5zdGF0ZSk7IH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHVybDogc3RyaW5nID0gJycsIHN0YXRlOiB1bmtub3duKSB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goZm4gPT4gZm4odXJsLCBzdGF0ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gdGhlIHBsYXRmb3JtJ3MgYHBvcFN0YXRlYCBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBFdmVudCB0aGF0IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBzdGF0ZSBoaXN0b3J5IGNoYW5nZXMuXG4gICAqIEBwYXJhbSBleGNlcHRpb24gVGhlIGV4Y2VwdGlvbiB0byB0aHJvdy5cbiAgICpcbiAgICogQHJldHVybnMgU3Vic2NyaWJlZCBldmVudHMuXG4gICAqL1xuICBzdWJzY3JpYmUoXG4gICAgICBvbk5leHQ6ICh2YWx1ZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZCwgb25UaHJvdz86ICgoZXhjZXB0aW9uOiBhbnkpID0+IHZvaWQpfG51bGwsXG4gICAgICBvblJldHVybj86ICgoKSA9PiB2b2lkKXxudWxsKTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvblRocm93LCBjb21wbGV0ZTogb25SZXR1cm59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIFVSTCBwYXJhbWV0ZXJzIGJ5IHByZXBlbmRpbmcgd2l0aCBgP2AgaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gIHBhcmFtcyBTdHJpbmcgb2YgVVJMIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBwYXJhbWV0ZXJzIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplUXVlcnlQYXJhbXM6IChwYXJhbXM6IHN0cmluZykgPT4gc3RyaW5nID0gbm9ybWFsaXplUXVlcnlQYXJhbXM7XG5cbiAgLyoqXG4gICAqIEpvaW5zIHR3byBwYXJ0cyBvZiBhIFVSTCB3aXRoIGEgc2xhc2ggaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgIFVSTCBzdHJpbmdcbiAgICogQHBhcmFtIGVuZCAgICBVUkwgc3RyaW5nXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBqb2luZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgam9pbldpdGhTbGFzaDogKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiBzdHJpbmcgPSBqb2luV2l0aFNsYXNoO1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgdHJhaWxpbmcgc2xhc2ggZnJvbSBhIFVSTCBzdHJpbmcgaWYgbmVlZGVkLlxuICAgKiBMb29rcyBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgZWl0aGVyIGAjYCwgYD9gLCBvciB0aGUgZW5kIG9mIHRoZVxuICAgKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFuZCByZW1vdmVzIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBvbmUgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFVSTCBzdHJpbmcuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBVUkwgc3RyaW5nLCBtb2RpZmllZCBpZiBuZWVkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHN0cmlwVHJhaWxpbmdTbGFzaDogKHVybDogc3RyaW5nKSA9PiBzdHJpbmcgPSBzdHJpcFRyYWlsaW5nU2xhc2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBMb2NhdGlvbijJtcm1aW5qZWN0KExvY2F0aW9uU3RyYXRlZ3kgYXMgYW55KSwgybXJtWluamVjdChQbGF0Zm9ybUxvY2F0aW9uIGFzIGFueSkpO1xufVxuXG5mdW5jdGlvbiBfc3RyaXBCYXNlSHJlZihiYXNlSHJlZjogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlSHJlZiAmJiB1cmwuc3RhcnRzV2l0aChiYXNlSHJlZikgPyB1cmwuc3Vic3RyaW5nKGJhc2VIcmVmLmxlbmd0aCkgOiB1cmw7XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEluZGV4SHRtbCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwvaW5kZXguaHRtbCQvLCAnJyk7XG59XG4iXX0=