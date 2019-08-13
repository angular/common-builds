/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { EventEmitter, Injectable } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import { PlatformLocation } from './platform_location';
import * as i0 from "@angular/core";
import * as i1 from "./location_strategy";
import * as i2 from "./platform_location";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
export class Location {
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
        this._baseHref = Location.stripTrailingSlash(_stripIndexHtml(browserBaseHref));
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
    getState() { return this._platformLocation.getState(); }
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
        return this.path() == this.normalize(path + Location.normalizeQueryParams(query));
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
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + Location.normalizeQueryParams(query)), state);
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
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + Location.normalizeQueryParams(query)), state);
    }
    /**
     * Navigates forward in the platform's history.
     * @return {?}
     */
    forward() { this._platformStrategy.forward(); }
    /**
     * Navigates back in the platform's history.
     * @return {?}
     */
    back() { this._platformStrategy.back(); }
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
        v => { this._notifyUrlChangeListeners(v.url, v.state); }));
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
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * @param {?} params String of URL parameters.
     *
     * @return {?} The normalized URL parameters string.
     */
    static normalizeQueryParams(params) {
        return params && params[0] !== '?' ? '?' + params : params;
    }
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param {?} start  URL string
     * @param {?} end    URL string
     *
     *
     * @return {?} The joined URL string.
     */
    static joinWithSlash(start, end) {
        if (start.length == 0) {
            return end;
        }
        if (end.length == 0) {
            return start;
        }
        /** @type {?} */
        let slashes = 0;
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
    }
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param {?} url URL string.
     *
     * @return {?} The URL string, modified if needed.
     */
    static stripTrailingSlash(url) {
        /** @type {?} */
        const match = url.match(/#|\?|$/);
        /** @type {?} */
        const pathEndIdx = match && match.index || url.length;
        /** @type {?} */
        const droppedSlashIdx = pathEndIdx - (url[pathEndIdx - 1] === '/' ? 1 : 0);
        return url.slice(0, droppedSlashIdx) + url.slice(pathEndIdx);
    }
}
Location.decorators = [
    { type: Injectable },
];
/** @nocollapse */
Location.ctorParameters = () => [
    { type: LocationStrategy },
    { type: PlatformLocation }
];
/** @nocollapse */ Location.ngInjectableDef = i0.ɵɵdefineInjectable({ token: Location, factory: function Location_Factory(t) { return new (t || Location)(i0.ɵɵinject(i1.LocationStrategy), i0.ɵɵinject(i2.PlatformLocation)); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(Location, [{
        type: Injectable
    }], function () { return [{ type: i1.LocationStrategy }, { type: i2.PlatformLocation }]; }, null);
if (false) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFRQSxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd2RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBR3JELG1DQUtDOzs7SUFKQyw0QkFBYzs7SUFDZCw4QkFBWTs7SUFDWiw2QkFBYzs7SUFDZCw0QkFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0NmLE1BQU0sT0FBTyxRQUFROzs7OztJQVluQixZQUFZLGdCQUFrQyxFQUFFLGdCQUFrQzs7OztRQVZsRixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7Ozs7UUFRakQsd0JBQW1CLEdBQThDLEVBQUUsQ0FBQztRQUdsRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7O2NBQ3BDLGVBQWUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFO1FBQzVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVTs7OztRQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdEIsS0FBSyxFQUFFLElBQUk7Z0JB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ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25MaWtlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5cbi8qKiBAcHVibGljQXBpICovXG5leHBvcnQgaW50ZXJmYWNlIFBvcFN0YXRlRXZlbnQge1xuICBwb3A/OiBib29sZWFuO1xuICBzdGF0ZT86IGFueTtcbiAgdHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgc2VydmljZSB0aGF0IGFwcGxpY2F0aW9ucyBjYW4gdXNlIHRvIGludGVyYWN0IHdpdGggYSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIERlcGVuZGluZyBvbiB0aGUgYExvY2F0aW9uU3RyYXRlZ3lgIHVzZWQsIGBMb2NhdGlvbmAgcGVyc2lzdHNcbiAqIHRvIHRoZSBVUkwncyBwYXRoIG9yIHRoZSBVUkwncyBoYXNoIHNlZ21lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBJdCdzIGJldHRlciB0byB1c2UgdGhlIGBSb3V0ZXIjbmF2aWdhdGVgIHNlcnZpY2UgdG8gdHJpZ2dlciByb3V0ZSBjaGFuZ2VzLiBVc2VcbiAqIGBMb2NhdGlvbmAgb25seSBpZiB5b3UgbmVlZCB0byBpbnRlcmFjdCB3aXRoIG9yIGNyZWF0ZSBub3JtYWxpemVkIFVSTHMgb3V0c2lkZSBvZlxuICogcm91dGluZy5cbiAqXG4gKiBgTG9jYXRpb25gIGlzIHJlc3BvbnNpYmxlIGZvciBub3JtYWxpemluZyB0aGUgVVJMIGFnYWluc3QgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLlxuICogQSBub3JtYWxpemVkIFVSTCBpcyBhYnNvbHV0ZSBmcm9tIHRoZSBVUkwgaG9zdCwgaW5jbHVkZXMgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLCBhbmQgaGFzIG5vXG4gKiB0cmFpbGluZyBzbGFzaDpcbiAqIC0gYC9teS9hcHAvdXNlci8xMjNgIGlzIG5vcm1hbGl6ZWRcbiAqIC0gYG15L2FwcC91c2VyLzEyM2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzL2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiA8Y29kZS1leGFtcGxlIHBhdGg9J2NvbW1vbi9sb2NhdGlvbi90cy9wYXRoX2xvY2F0aW9uX2NvbXBvbmVudC50cydcbiAqIHJlZ2lvbj0nTG9jYXRpb25Db21wb25lbnQnPjwvY29kZS1leGFtcGxlPlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Jhc2VIcmVmOiBzdHJpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3k7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb247XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VybENoYW5nZUxpc3RlbmVyczogKCh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24pID0+IHZvaWQpW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihwbGF0Zm9ybVN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5LCBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneSA9IHBsYXRmb3JtU3RyYXRlZ3k7XG4gICAgY29uc3QgYnJvd3NlckJhc2VIcmVmID0gdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5nZXRCYXNlSHJlZigpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24gPSBwbGF0Zm9ybUxvY2F0aW9uO1xuICAgIHRoaXMuX2Jhc2VIcmVmID0gTG9jYXRpb24uc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEluZGV4SHRtbChicm93c2VyQmFzZUhyZWYpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5Lm9uUG9wU3RhdGUoKGV2KSA9PiB7XG4gICAgICB0aGlzLl9zdWJqZWN0LmVtaXQoe1xuICAgICAgICAndXJsJzogdGhpcy5wYXRoKHRydWUpLFxuICAgICAgICAncG9wJzogdHJ1ZSxcbiAgICAgICAgJ3N0YXRlJzogZXYuc3RhdGUsXG4gICAgICAgICd0eXBlJzogZXYudHlwZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIFVSTCBwYXRoIGZvciB0aGlzIGxvY2F0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gaW5jbHVkZUhhc2ggVHJ1ZSB0byBpbmNsdWRlIGFuIGFuY2hvciBmcmFnbWVudCBpbiB0aGUgcGF0aC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHBhdGguXG4gICAqL1xuICAvLyBUT0RPOiB2c2F2a2luLiBSZW1vdmUgdGhlIGJvb2xlYW4gZmxhZyBhbmQgYWx3YXlzIGluY2x1ZGUgaGFzaCBvbmNlIHRoZSBkZXByZWNhdGVkIHJvdXRlciBpc1xuICAvLyByZW1vdmVkLlxuICBwYXRoKGluY2x1ZGVIYXNoOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSh0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnBhdGgoaW5jbHVkZUhhc2gpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBsb2NhdGlvbiBoaXN0b3J5LlxuICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgYGhpc3Rvcnkuc3RhdGVgIG9iamVjdC5cbiAgICovXG4gIGdldFN0YXRlKCk6IHVua25vd24geyByZXR1cm4gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5nZXRTdGF0ZSgpOyB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIGdpdmVuIHBhdGggYW5kIGNvbXBhcmVzIHRvIHRoZSBjdXJyZW50IG5vcm1hbGl6ZWQgcGF0aC5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIGdpdmVuIFVSTCBwYXRoLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgZ2l2ZW4gVVJMIHBhdGggaXMgZXF1YWwgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLCBmYWxzZVxuICAgKiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0N1cnJlbnRQYXRoRXF1YWxUbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBhdGgoKSA9PSB0aGlzLm5vcm1hbGl6ZShwYXRoICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGEgVVJMIHBhdGggYnkgc3RyaXBwaW5nIGFueSB0cmFpbGluZyBzbGFzaGVzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBzdHJpbmcuXG4gICAqL1xuICBub3JtYWxpemUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBMb2NhdGlvbi5zdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwQmFzZUhyZWYodGhpcy5fYmFzZUhyZWYsIF9zdHJpcEluZGV4SHRtbCh1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhbiBleHRlcm5hbCBVUkwgcGF0aC5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2Vzbid0IGJlZ2luIHdpdGggYSBsZWFkaW5nIHNsYXNoIChgJy8nYCksIGFkZHMgb25lXG4gICAqIGJlZm9yZSBub3JtYWxpemluZy4gQWRkcyBhIGhhc2ggaWYgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBpc1xuICAgKiBpbiB1c2UsIG9yIHRoZSBgQVBQX0JBU0VfSFJFRmAgaWYgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgaW4gdXNlLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwuXG4gICAqXG4gICAqIEByZXR1cm5zICBBIG5vcm1hbGl6ZWQgcGxhdGZvcm0tc3BlY2lmaWMgVVJMLlxuICAgKi9cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsICYmIHVybFswXSAhPT0gJy8nKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCh1cmwpO1xuICB9XG5cbiAgLy8gVE9ETzogcmVuYW1lIHRoaXMgbWV0aG9kIHRvIHB1c2hTdGF0ZVxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcidzIFVSTCB0byBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiBhIGdpdmVuIFVSTCwgYW5kIHB1c2hlcyBhXG4gICAqIG5ldyBpdGVtIG9udG8gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggIFVSTCBwYXRoIHRvIG5vcm1hbGl6ZS5cbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBzdGF0ZSBMb2NhdGlvbiBoaXN0b3J5IHN0YXRlLlxuICAgKlxuICAgKi9cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5wdXNoU3RhdGUoc3RhdGUsICcnLCBwYXRoLCBxdWVyeSk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKFxuICAgICAgICB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKSwgc3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGJyb3dzZXIncyBVUkwgdG8gYSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIFVSTCwgYW5kIHJlcGxhY2VzXG4gICAqIHRoZSB0b3AgaXRlbSBvbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5IHN0YWNrLlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCAgVVJMIHBhdGggdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqL1xuICByZXBsYWNlU3RhdGUocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5yZXBsYWNlU3RhdGUoc3RhdGUsICcnLCBwYXRoLCBxdWVyeSk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKFxuICAgICAgICB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKSwgc3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBmb3J3YXJkIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBmb3J3YXJkKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LmZvcndhcmQoKTsgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgYmFjayBpbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5iYWNrKCk7IH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgVVJMIGNoYW5nZSBsaXN0ZW5lci4gVXNlIHRvIGNhdGNoIHVwZGF0ZXMgcGVyZm9ybWVkIGJ5IHRoZSBBbmd1bGFyXG4gICAqIGZyYW1ld29yayB0aGF0IGFyZSBub3QgZGV0ZWN0aWJsZSB0aHJvdWdoIFwicG9wc3RhdGVcIiBvciBcImhhc2hjaGFuZ2VcIiBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSBmbiBUaGUgY2hhbmdlIGhhbmRsZXIgZnVuY3Rpb24sIHdoaWNoIHRha2UgYSBVUkwgYW5kIGEgbG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICovXG4gIG9uVXJsQ2hhbmdlKGZuOiAodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLnB1c2goZm4pO1xuICAgIHRoaXMuc3Vic2NyaWJlKHYgPT4geyB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnModi51cmwsIHYuc3RhdGUpOyB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh1cmw6IHN0cmluZyA9ICcnLCBzdGF0ZTogdW5rbm93bikge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5mb3JFYWNoKGZuID0+IGZuKHVybCwgc3RhdGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIHRoZSBwbGF0Zm9ybSdzIGBwb3BTdGF0ZWAgZXZlbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgRXZlbnQgdGhhdCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgc3RhdGUgaGlzdG9yeSBjaGFuZ2VzLlxuICAgKiBAcGFyYW0gZXhjZXB0aW9uIFRoZSBleGNlcHRpb24gdG8gdGhyb3cuXG4gICAqXG4gICAqIEByZXR1cm5zIFN1YnNjcmliZWQgZXZlbnRzLlxuICAgKi9cbiAgc3Vic2NyaWJlKFxuICAgICAgb25OZXh0OiAodmFsdWU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQsIG9uVGhyb3c/OiAoKGV4Y2VwdGlvbjogYW55KSA9PiB2b2lkKXxudWxsLFxuICAgICAgb25SZXR1cm4/OiAoKCkgPT4gdm9pZCl8bnVsbCk6IFN1YnNjcmlwdGlvbkxpa2Uge1xuICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LnN1YnNjcmliZSh7bmV4dDogb25OZXh0LCBlcnJvcjogb25UaHJvdywgY29tcGxldGU6IG9uUmV0dXJufSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBVUkwgcGFyYW1ldGVycyBieSBwcmVwZW5kaW5nIHdpdGggYD9gIGlmIG5lZWRlZC5cbiAgICpcbiAgICogQHBhcmFtICBwYXJhbXMgU3RyaW5nIG9mIFVSTCBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgcGFyYW1ldGVycyBzdHJpbmcuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHBhcmFtczogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGFyYW1zICYmIHBhcmFtc1swXSAhPT0gJz8nID8gJz8nICsgcGFyYW1zIDogcGFyYW1zO1xuICB9XG5cbiAgLyoqXG4gICAqIEpvaW5zIHR3byBwYXJ0cyBvZiBhIFVSTCB3aXRoIGEgc2xhc2ggaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgIFVSTCBzdHJpbmdcbiAgICogQHBhcmFtIGVuZCAgICBVUkwgc3RyaW5nXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBqb2luZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgam9pbldpdGhTbGFzaChzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHN0YXJ0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gZW5kO1xuICAgIH1cbiAgICBpZiAoZW5kLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gc3RhcnQ7XG4gICAgfVxuICAgIGxldCBzbGFzaGVzID0gMDtcbiAgICBpZiAoc3RhcnQuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgc2xhc2hlcysrO1xuICAgIH1cbiAgICBpZiAoZW5kLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgc2xhc2hlcysrO1xuICAgIH1cbiAgICBpZiAoc2xhc2hlcyA9PSAyKSB7XG4gICAgICByZXR1cm4gc3RhcnQgKyBlbmQuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICBpZiAoc2xhc2hlcyA9PSAxKSB7XG4gICAgICByZXR1cm4gc3RhcnQgKyBlbmQ7XG4gICAgfVxuICAgIHJldHVybiBzdGFydCArICcvJyArIGVuZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgdHJhaWxpbmcgc2xhc2ggZnJvbSBhIFVSTCBzdHJpbmcgaWYgbmVlZGVkLlxuICAgKiBMb29rcyBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgZWl0aGVyIGAjYCwgYD9gLCBvciB0aGUgZW5kIG9mIHRoZVxuICAgKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFuZCByZW1vdmVzIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBvbmUgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFVSTCBzdHJpbmcuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBVUkwgc3RyaW5nLCBtb2RpZmllZCBpZiBuZWVkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHN0cmlwVHJhaWxpbmdTbGFzaCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goLyN8XFw/fCQvKTtcbiAgICBjb25zdCBwYXRoRW5kSWR4ID0gbWF0Y2ggJiYgbWF0Y2guaW5kZXggfHwgdXJsLmxlbmd0aDtcbiAgICBjb25zdCBkcm9wcGVkU2xhc2hJZHggPSBwYXRoRW5kSWR4IC0gKHVybFtwYXRoRW5kSWR4IC0gMV0gPT09ICcvJyA/IDEgOiAwKTtcbiAgICByZXR1cm4gdXJsLnNsaWNlKDAsIGRyb3BwZWRTbGFzaElkeCkgKyB1cmwuc2xpY2UocGF0aEVuZElkeCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3N0cmlwQmFzZUhyZWYoYmFzZUhyZWY6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYmFzZUhyZWYgJiYgdXJsLnN0YXJ0c1dpdGgoYmFzZUhyZWYpID8gdXJsLnN1YnN0cmluZyhiYXNlSHJlZi5sZW5ndGgpIDogdXJsO1xufVxuXG5mdW5jdGlvbiBfc3RyaXBJbmRleEh0bWwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdXJsLnJlcGxhY2UoL1xcL2luZGV4Lmh0bWwkLywgJycpO1xufVxuIl19