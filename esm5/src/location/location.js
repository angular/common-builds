/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Injectable } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import { PlatformLocation } from './platform_location';
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
        this._baseHref = Location.stripTrailingSlash(_stripIndexHtml(browserBaseHref));
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
        return this.path() == this.normalize(path + Location.normalizeQueryParams(query));
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
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + Location.normalizeQueryParams(query)), state);
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
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + Location.normalizeQueryParams(query)), state);
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
    Location.normalizeQueryParams = function (params) {
        return params && params[0] !== '?' ? '?' + params : params;
    };
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @returns The joined URL string.
     */
    Location.joinWithSlash = function (start, end) {
        if (start.length == 0) {
            return end;
        }
        if (end.length == 0) {
            return start;
        }
        var slashes = 0;
        if (start.endsWith('/')) {
            slashes++;
        }
        if (end.startsWith('/')) {
            slashes++;
        }
        if (slashes == 2) {
            return start + end.substring(1);
        }
        if (slashes == 1) {
            return start + end;
        }
        return start + '/' + end;
    };
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string.
     *
     * @returns The URL string, modified if needed.
     */
    Location.stripTrailingSlash = function (url) {
        var match = url.match(/#|\?|$/);
        var pathEndIdx = match && match.index || url.length;
        var droppedSlashIdx = pathEndIdx - (url[pathEndIdx - 1] === '/' ? 1 : 0);
        return url.slice(0, droppedSlashIdx) + url.slice(pathEndIdx);
    };
    Location.ngInjectableDef = i0.ɵɵdefineInjectable({ token: Location, factory: function Location_Factory(t) { return new (t || Location)(i0.ɵɵinject(i1.LocationStrategy), i0.ɵɵinject(i2.PlatformLocation)); }, providedIn: null });
    return Location;
}());
export { Location };
/*@__PURE__*/ i0.ɵsetClassMetadata(Location, [{
        type: Injectable
    }], function () { return [{ type: i1.LocationStrategy }, { type: i2.PlatformLocation }]; }, null);
function _stripBaseHref(baseHref, url) {
    return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3ZELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7O0FBVXJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQkc7QUFDSDtJQWFFLGtCQUFZLGdCQUFrQyxFQUFFLGdCQUFrQztRQUFsRixpQkFhQztRQXhCRCxnQkFBZ0I7UUFDaEIsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBT2pELGdCQUFnQjtRQUNoQix3QkFBbUIsR0FBOEMsRUFBRSxDQUFDO1FBR2xFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0QsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsVUFBQyxFQUFFO1lBQ25DLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUNqQixLQUFLLEVBQUUsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssRUFBRSxJQUFJO2dCQUNYLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSztnQkFDakIs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RSxHQUFXO0lBQ25ELE9BQU8sUUFBUSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDckYsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLEdBQVc7SUFDbEMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlciwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbkxpa2V9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0xvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcblxuLyoqIEBwdWJsaWNBcGkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9wU3RhdGVFdmVudCB7XG4gIHBvcD86IGJvb2xlYW47XG4gIHN0YXRlPzogYW55O1xuICB0eXBlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBzZXJ2aWNlIHRoYXQgYXBwbGljYXRpb25zIGNhbiB1c2UgdG8gaW50ZXJhY3Qgd2l0aCBhIGJyb3dzZXIncyBVUkwuXG4gKlxuICogRGVwZW5kaW5nIG9uIHRoZSBgTG9jYXRpb25TdHJhdGVneWAgdXNlZCwgYExvY2F0aW9uYCBwZXJzaXN0c1xuICogdG8gdGhlIFVSTCdzIHBhdGggb3IgdGhlIFVSTCdzIGhhc2ggc2VnbWVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEl0J3MgYmV0dGVyIHRvIHVzZSB0aGUgYFJvdXRlciNuYXZpZ2F0ZWAgc2VydmljZSB0byB0cmlnZ2VyIHJvdXRlIGNoYW5nZXMuIFVzZVxuICogYExvY2F0aW9uYCBvbmx5IGlmIHlvdSBuZWVkIHRvIGludGVyYWN0IHdpdGggb3IgY3JlYXRlIG5vcm1hbGl6ZWQgVVJMcyBvdXRzaWRlIG9mXG4gKiByb3V0aW5nLlxuICpcbiAqIGBMb2NhdGlvbmAgaXMgcmVzcG9uc2libGUgZm9yIG5vcm1hbGl6aW5nIHRoZSBVUkwgYWdhaW5zdCB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYuXG4gKiBBIG5vcm1hbGl6ZWQgVVJMIGlzIGFic29sdXRlIGZyb20gdGhlIFVSTCBob3N0LCBpbmNsdWRlcyB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYsIGFuZCBoYXMgbm9cbiAqIHRyYWlsaW5nIHNsYXNoOlxuICogLSBgL215L2FwcC91c2VyLzEyM2AgaXMgbm9ybWFsaXplZFxuICogLSBgbXkvYXBwL3VzZXIvMTIzYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqIC0gYC9teS9hcHAvdXNlci8xMjMvYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD0nY29tbW9uL2xvY2F0aW9uL3RzL3BhdGhfbG9jYXRpb25fY29tcG9uZW50LnRzJ1xuICogcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCc+PC9jb2RlLWV4YW1wbGU+XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9jYXRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmFzZUhyZWY6IHN0cmluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXJsQ2hhbmdlTGlzdGVuZXJzOiAoKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZClbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHBsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3ksIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24pIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5ID0gcGxhdGZvcm1TdHJhdGVneTtcbiAgICBjb25zdCBicm93c2VyQmFzZUhyZWYgPSB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LmdldEJhc2VIcmVmKCk7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbiA9IHBsYXRmb3JtTG9jYXRpb247XG4gICAgdGhpcy5fYmFzZUhyZWYgPSBMb2NhdGlvbi5zdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwSW5kZXhIdG1sKGJyb3dzZXJCYXNlSHJlZikpO1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kub25Qb3BTdGF0ZSgoZXYpID0+IHtcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7XG4gICAgICAgICd1cmwnOiB0aGlzLnBhdGgodHJ1ZSksXG4gICAgICAgICdwb3AnOiB0cnVlLFxuICAgICAgICAnc3RhdGUnOiBldi5zdGF0ZSxcbiAgICAgICAgJ3R5cGUnOiBldi50eXBlLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgVVJMIHBhdGggZm9yIHRoaXMgbG9jYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBpbmNsdWRlSGFzaCBUcnVlIHRvIGluY2x1ZGUgYW4gYW5jaG9yIGZyYWdtZW50IGluIHRoZSBwYXRoLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgcGF0aC5cbiAgICovXG4gIC8vIFRPRE86IHZzYXZraW4uIFJlbW92ZSB0aGUgYm9vbGVhbiBmbGFnIGFuZCBhbHdheXMgaW5jbHVkZSBoYXNoIG9uY2UgdGhlIGRlcHJlY2F0ZWQgcm91dGVyIGlzXG4gIC8vIHJlbW92ZWQuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kucGF0aChpbmNsdWRlSGFzaCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGxvY2F0aW9uIGhpc3RvcnkuXG4gICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBgaGlzdG9yeS5zdGF0ZWAgb2JqZWN0LlxuICAgKi9cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7IHJldHVybiB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldFN0YXRlKCk7IH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgZ2l2ZW4gcGF0aCBhbmQgY29tcGFyZXMgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZ2l2ZW4gVVJMIHBhdGguXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBnaXZlbiBVUkwgcGF0aCBpcyBlcXVhbCB0byB0aGUgY3VycmVudCBub3JtYWxpemVkIHBhdGgsIGZhbHNlXG4gICAqIG90aGVyd2lzZS5cbiAgICovXG4gIGlzQ3VycmVudFBhdGhFcXVhbFRvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGF0aCgpID09IHRoaXMubm9ybWFsaXplKHBhdGggKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgYSBVUkwgcGF0aCBieSBzdHJpcHBpbmcgYW55IHRyYWlsaW5nIHNsYXNoZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIG5vcm1hbGl6ZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIExvY2F0aW9uLnN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBCYXNlSHJlZih0aGlzLl9iYXNlSHJlZiwgX3N0cmlwSW5kZXhIdG1sKHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIGV4dGVybmFsIFVSTCBwYXRoLlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXNuJ3QgYmVnaW4gd2l0aCBhIGxlYWRpbmcgc2xhc2ggKGAnLydgKSwgYWRkcyBvbmVcbiAgICogYmVmb3JlIG5vcm1hbGl6aW5nLiBBZGRzIGEgaGFzaCBpZiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzXG4gICAqIGluIHVzZSwgb3IgdGhlIGBBUFBfQkFTRV9IUkVGYCBpZiB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyBpbiB1c2UuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgIEEgbm9ybWFsaXplZCBwbGF0Zm9ybS1zcGVjaWZpYyBVUkwuXG4gICAqL1xuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gIH1cblxuICAvLyBUT0RPOiByZW5hbWUgdGhpcyBtZXRob2QgdG8gcHVzaFN0YXRlXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VyJ3MgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIGEgZ2l2ZW4gVVJMLCBhbmQgcHVzaGVzIGFcbiAgICogbmV3IGl0ZW0gb250byB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCAgVVJMIHBhdGggdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqXG4gICAqL1xuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnB1c2hTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcidzIFVSTCB0byBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcmVwbGFjZXNcbiAgICogdGhlIHRvcCBpdGVtIG9uIHRoZSBwbGF0Zm9ybSdzIGhpc3Rvcnkgc3RhY2suXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoICBVUkwgcGF0aCB0byBub3JtYWxpemUuXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gc3RhdGUgTG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICovXG4gIHJlcGxhY2VTdGF0ZShwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGZvcndhcmQgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuZm9yd2FyZCgpOyB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBiYWNrIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LmJhY2soKTsgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBVUkwgY2hhbmdlIGxpc3RlbmVyLiBVc2UgdG8gY2F0Y2ggdXBkYXRlcyBwZXJmb3JtZWQgYnkgdGhlIEFuZ3VsYXJcbiAgICogZnJhbWV3b3JrIHRoYXQgYXJlIG5vdCBkZXRlY3RpYmxlIHRocm91Z2ggXCJwb3BzdGF0ZVwiIG9yIFwiaGFzaGNoYW5nZVwiIGV2ZW50cy5cbiAgICpcbiAgICogQHBhcmFtIGZuIFRoZSBjaGFuZ2UgaGFuZGxlciBmdW5jdGlvbiwgd2hpY2ggdGFrZSBhIFVSTCBhbmQgYSBsb2NhdGlvbiBoaXN0b3J5IHN0YXRlLlxuICAgKi9cbiAgb25VcmxDaGFuZ2UoZm46ICh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24pID0+IHZvaWQpIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMucHVzaChmbik7XG4gICAgdGhpcy5zdWJzY3JpYmUodiA9PiB7IHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh2LnVybCwgdi5zdGF0ZSk7IH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHVybDogc3RyaW5nID0gJycsIHN0YXRlOiB1bmtub3duKSB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goZm4gPT4gZm4odXJsLCBzdGF0ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gdGhlIHBsYXRmb3JtJ3MgYHBvcFN0YXRlYCBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBFdmVudCB0aGF0IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBzdGF0ZSBoaXN0b3J5IGNoYW5nZXMuXG4gICAqIEBwYXJhbSBleGNlcHRpb24gVGhlIGV4Y2VwdGlvbiB0byB0aHJvdy5cbiAgICpcbiAgICogQHJldHVybnMgU3Vic2NyaWJlZCBldmVudHMuXG4gICAqL1xuICBzdWJzY3JpYmUoXG4gICAgICBvbk5leHQ6ICh2YWx1ZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZCwgb25UaHJvdz86ICgoZXhjZXB0aW9uOiBhbnkpID0+IHZvaWQpfG51bGwsXG4gICAgICBvblJldHVybj86ICgoKSA9PiB2b2lkKXxudWxsKTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvblRocm93LCBjb21wbGV0ZTogb25SZXR1cm59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIFVSTCBwYXJhbWV0ZXJzIGJ5IHByZXBlbmRpbmcgd2l0aCBgP2AgaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gIHBhcmFtcyBTdHJpbmcgb2YgVVJMIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBwYXJhbWV0ZXJzIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplUXVlcnlQYXJhbXMocGFyYW1zOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXJhbXMgJiYgcGFyYW1zWzBdICE9PSAnPycgPyAnPycgKyBwYXJhbXMgOiBwYXJhbXM7XG4gIH1cblxuICAvKipcbiAgICogSm9pbnMgdHdvIHBhcnRzIG9mIGEgVVJMIHdpdGggYSBzbGFzaCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCAgVVJMIHN0cmluZ1xuICAgKiBAcGFyYW0gZW5kICAgIFVSTCBzdHJpbmdcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGpvaW5lZCBVUkwgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBqb2luV2l0aFNsYXNoKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoc3RhcnQubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuICAgIGlmIChlbmQubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBzdGFydDtcbiAgICB9XG4gICAgbGV0IHNsYXNoZXMgPSAwO1xuICAgIGlmIChzdGFydC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBzbGFzaGVzKys7XG4gICAgfVxuICAgIGlmIChlbmQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBzbGFzaGVzKys7XG4gICAgfVxuICAgIGlmIChzbGFzaGVzID09IDIpIHtcbiAgICAgIHJldHVybiBzdGFydCArIGVuZC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChzbGFzaGVzID09IDEpIHtcbiAgICAgIHJldHVybiBzdGFydCArIGVuZDtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXJ0ICsgJy8nICsgZW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSB0cmFpbGluZyBzbGFzaCBmcm9tIGEgVVJMIHN0cmluZyBpZiBuZWVkZWQuXG4gICAqIExvb2tzIGZvciB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBlaXRoZXIgYCNgLCBgP2AsIG9yIHRoZSBlbmQgb2YgdGhlXG4gICAqIGxpbmUgYXMgYC9gIGNoYXJhY3RlcnMgYW5kIHJlbW92ZXMgdGhlIHRyYWlsaW5nIHNsYXNoIGlmIG9uZSBleGlzdHMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVVJMIHN0cmluZy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIFVSTCBzdHJpbmcsIG1vZGlmaWVkIGlmIG5lZWRlZC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc3RyaXBUcmFpbGluZ1NsYXNoKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaCgvI3xcXD98JC8pO1xuICAgIGNvbnN0IHBhdGhFbmRJZHggPSBtYXRjaCAmJiBtYXRjaC5pbmRleCB8fCB1cmwubGVuZ3RoO1xuICAgIGNvbnN0IGRyb3BwZWRTbGFzaElkeCA9IHBhdGhFbmRJZHggLSAodXJsW3BhdGhFbmRJZHggLSAxXSA9PT0gJy8nID8gMSA6IDApO1xuICAgIHJldHVybiB1cmwuc2xpY2UoMCwgZHJvcHBlZFNsYXNoSWR4KSArIHVybC5zbGljZShwYXRoRW5kSWR4KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfc3RyaXBCYXNlSHJlZihiYXNlSHJlZjogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlSHJlZiAmJiB1cmwuc3RhcnRzV2l0aChiYXNlSHJlZikgPyB1cmwuc3Vic3RyaW5nKGJhc2VIcmVmLmxlbmd0aCkgOiB1cmw7XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEluZGV4SHRtbCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwvaW5kZXguaHRtbCQvLCAnJyk7XG59XG4iXX0=