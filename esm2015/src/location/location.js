/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { EventEmitter, Injectable } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import * as i0 from "@angular/core";
import * as i1 from "./location_strategy";
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
 * Depending on the {\@link LocationStrategy} used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * \@usageNotes
 *
 * It's better to use the {\@link Router#navigate} service to trigger route changes. Use
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
 * {\@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * \@publicApi
 */
export class Location {
    /**
     * @param {?} platformStrategy
     */
    constructor(platformStrategy) {
        /**
         * \@internal
         */
        this._subject = new EventEmitter();
        this._platformStrategy = platformStrategy;
        /** @type {?} */
        const browserBaseHref = this._platformStrategy.getBaseHref();
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
     * Returns the normalized URL path.
     *
     * @param {?=} includeHash Whether path has an anchor fragment.
     *
     * @return {?} The normalized URL path.
     */
    // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
    // removed.
    path(includeHash = false) {
        return this.normalize(this._platformStrategy.path(includeHash));
    }
    /**
     * Normalizes the given path and compares to the current normalized path.
     *
     * @param {?} path The given URL path
     * @param {?=} query Query parameters
     *
     * @return {?} `true` if the given URL path is equal to the current normalized path, `false`
     * otherwise.
     */
    isCurrentPathEqualTo(path, query = '') {
        return this.path() == this.normalize(path + Location.normalizeQueryParams(query));
    }
    /**
     * Given a string representing a URL, returns the URL path after stripping the
     * trailing slashes.
     *
     * @param {?} url String representing a URL.
     *
     * @return {?} Normalized URL string.
     */
    normalize(url) {
        return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
    }
    /**
     * Given a string representing a URL, returns the platform-specific external URL path.
     * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
     * before normalizing. This method also adds a hash if `HashLocationStrategy` is
     * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
     *
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
     * Changes the browsers URL to a normalized version of the given URL, and pushes a
     * new item onto the platform's history.
     *
     * @param {?} path  URL path to normalizze
     * @param {?=} query Query parameters
     * @param {?=} state Location history state
     *
     * @return {?}
     */
    go(path, query = '', state = null) {
        this._platformStrategy.pushState(state, '', path, query);
    }
    /**
     * Changes the browser's URL to a normalized version of the given URL, and replaces
     * the top item on the platform's history stack.
     *
     * @param {?} path  URL path to normalizze
     * @param {?=} query Query parameters
     * @param {?=} state Location history state
     * @return {?}
     */
    replaceState(path, query = '', state = null) {
        this._platformStrategy.replaceState(state, '', path, query);
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
     * Subscribe to the platform's `popState` events.
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
     * Given a string of url parameters, prepend with `?` if needed, otherwise return the
     * parameters as is.
     *
     * @param {?} params String of URL parameters
     *
     * @return {?} URL parameters prepended with `?` or the parameters as is.
     */
    static normalizeQueryParams(params) {
        return params && params[0] !== '?' ? '?' + params : params;
    }
    /**
     * Given 2 parts of a URL, join them with a slash if needed.
     *
     * @param {?} start  URL string
     * @param {?} end    URL string
     *
     *
     * @return {?} Given URL strings joined with a slash, if needed.
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
     * If URL has a trailing slash, remove it, otherwise return the URL as is. The
     * method looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param {?} url URL string
     *
     * @return {?} Returns a URL string after removing the trailing slash if one exists, otherwise
     * returns the string as is.
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
    { type: LocationStrategy }
];
/** @nocollapse */ Location.ngInjectableDef = i0.ΔdefineInjectable({ token: Location, factory: function Location_Factory(t) { return new (t || Location)(i0.Δinject(i1.LocationStrategy)); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(Location, [{
        type: Injectable
    }], function () { return [{ type: i1.LocationStrategy }]; }, null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFRQSxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd2RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFHckQsbUNBS0M7OztJQUpDLDRCQUFjOztJQUNkLDhCQUFZOztJQUNaLDZCQUFjOztJQUNkLDRCQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStCZixNQUFNLE9BQU8sUUFBUTs7OztJQVFuQixZQUFZLGdCQUFrQzs7OztRQU45QyxhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFPL0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDOztjQUNwQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRTtRQUM1RCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVTs7OztRQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdEIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsT0FBTyxFQUFFLEVBQUUsQ0FBQyxLQUFLO2dCQUNqQixNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUk7YUFDaEIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxFQUFDLENBQUM7SUFDTCxDQUFDOzs7Ozs7Ozs7O0lBV0QsSUFBSSxDQUFDLGNB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Q0FBQyxDQUFDO0FBQzFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5cbi8qKiBAcHVibGljQXBpICovXG5leHBvcnQgaW50ZXJmYWNlIFBvcFN0YXRlRXZlbnQge1xuICBwb3A/OiBib29sZWFuO1xuICBzdGF0ZT86IGFueTtcbiAgdHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgc2VydmljZSB0aGF0IGFwcGxpY2F0aW9ucyBjYW4gdXNlIHRvIGludGVyYWN0IHdpdGggYSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIERlcGVuZGluZyBvbiB0aGUge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IHVzZWQsIGBMb2NhdGlvbmAgd2lsbCBlaXRoZXIgcGVyc2lzdFxuICogdG8gdGhlIFVSTCdzIHBhdGggb3IgdGhlIFVSTCdzIGhhc2ggc2VnbWVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEl0J3MgYmV0dGVyIHRvIHVzZSB0aGUge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZX0gc2VydmljZSB0byB0cmlnZ2VyIHJvdXRlIGNoYW5nZXMuIFVzZVxuICogYExvY2F0aW9uYCBvbmx5IGlmIHlvdSBuZWVkIHRvIGludGVyYWN0IHdpdGggb3IgY3JlYXRlIG5vcm1hbGl6ZWQgVVJMcyBvdXRzaWRlIG9mXG4gKiByb3V0aW5nLlxuICpcbiAqIGBMb2NhdGlvbmAgaXMgcmVzcG9uc2libGUgZm9yIG5vcm1hbGl6aW5nIHRoZSBVUkwgYWdhaW5zdCB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYuXG4gKiBBIG5vcm1hbGl6ZWQgVVJMIGlzIGFic29sdXRlIGZyb20gdGhlIFVSTCBob3N0LCBpbmNsdWRlcyB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYsIGFuZCBoYXMgbm9cbiAqIHRyYWlsaW5nIHNsYXNoOlxuICogLSBgL215L2FwcC91c2VyLzEyM2AgaXMgbm9ybWFsaXplZFxuICogLSBgbXkvYXBwL3VzZXIvMTIzYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqIC0gYC9teS9hcHAvdXNlci8xMjMvYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbG9jYXRpb24vdHMvcGF0aF9sb2NhdGlvbl9jb21wb25lbnQudHMgcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9jYXRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmFzZUhyZWY6IHN0cmluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneTtcblxuICBjb25zdHJ1Y3RvcihwbGF0Zm9ybVN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneSA9IHBsYXRmb3JtU3RyYXRlZ3k7XG4gICAgY29uc3QgYnJvd3NlckJhc2VIcmVmID0gdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5nZXRCYXNlSHJlZigpO1xuICAgIHRoaXMuX2Jhc2VIcmVmID0gTG9jYXRpb24uc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEluZGV4SHRtbChicm93c2VyQmFzZUhyZWYpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5Lm9uUG9wU3RhdGUoKGV2KSA9PiB7XG4gICAgICB0aGlzLl9zdWJqZWN0LmVtaXQoe1xuICAgICAgICAndXJsJzogdGhpcy5wYXRoKHRydWUpLFxuICAgICAgICAncG9wJzogdHJ1ZSxcbiAgICAgICAgJ3N0YXRlJzogZXYuc3RhdGUsXG4gICAgICAgICd0eXBlJzogZXYudHlwZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG5vcm1hbGl6ZWQgVVJMIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSBpbmNsdWRlSGFzaCBXaGV0aGVyIHBhdGggaGFzIGFuIGFuY2hvciBmcmFnbWVudC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHBhdGguXG4gICAqL1xuICAvLyBUT0RPOiB2c2F2a2luLiBSZW1vdmUgdGhlIGJvb2xlYW4gZmxhZyBhbmQgYWx3YXlzIGluY2x1ZGUgaGFzaCBvbmNlIHRoZSBkZXByZWNhdGVkIHJvdXRlciBpc1xuICAvLyByZW1vdmVkLlxuICBwYXRoKGluY2x1ZGVIYXNoOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSh0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnBhdGgoaW5jbHVkZUhhc2gpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBnaXZlbiBwYXRoIGFuZCBjb21wYXJlcyB0byB0aGUgY3VycmVudCBub3JtYWxpemVkIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBnaXZlbiBVUkwgcGF0aFxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVyc1xuICAgKlxuICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGdpdmVuIFVSTCBwYXRoIGlzIGVxdWFsIHRvIHRoZSBjdXJyZW50IG5vcm1hbGl6ZWQgcGF0aCwgYGZhbHNlYFxuICAgKiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0N1cnJlbnRQYXRoRXF1YWxUbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBhdGgoKSA9PSB0aGlzLm5vcm1hbGl6ZShwYXRoICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwsIHJldHVybnMgdGhlIFVSTCBwYXRoIGFmdGVyIHN0cmlwcGluZyB0aGVcbiAgICogdHJhaWxpbmcgc2xhc2hlcy5cbiAgICpcbiAgICogQHBhcmFtIHVybCBTdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLlxuICAgKlxuICAgKiBAcmV0dXJucyBOb3JtYWxpemVkIFVSTCBzdHJpbmcuXG4gICAqL1xuICBub3JtYWxpemUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBMb2NhdGlvbi5zdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwQmFzZUhyZWYodGhpcy5fYmFzZUhyZWYsIF9zdHJpcEluZGV4SHRtbCh1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLCByZXR1cm5zIHRoZSBwbGF0Zm9ybS1zcGVjaWZpYyBleHRlcm5hbCBVUkwgcGF0aC5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2Vzbid0IGJlZ2luIHdpdGggYSBsZWFkaW5nIHNsYXNoIChgJy8nYCksIHRoaXMgbWV0aG9kIGFkZHMgb25lXG4gICAqIGJlZm9yZSBub3JtYWxpemluZy4gVGhpcyBtZXRob2QgYWxzbyBhZGRzIGEgaGFzaCBpZiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzXG4gICAqIHVzZWQsIG9yIHRoZSBgQVBQX0JBU0VfSFJFRmAgaWYgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgaW4gdXNlLlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwuXG4gICAqXG4gICAqIEByZXR1cm5zICBBIG5vcm1hbGl6ZWQgcGxhdGZvcm0tc3BlY2lmaWMgVVJMLlxuICAgKi9cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsICYmIHVybFswXSAhPT0gJy8nKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCh1cmwpO1xuICB9XG5cbiAgLy8gVE9ETzogcmVuYW1lIHRoaXMgbWV0aG9kIHRvIHB1c2hTdGF0ZVxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcnMgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBVUkwsIGFuZCBwdXNoZXMgYVxuICAgKiBuZXcgaXRlbSBvbnRvIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoICBVUkwgcGF0aCB0byBub3JtYWxpenplXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzXG4gICAqIEBwYXJhbSBzdGF0ZSBMb2NhdGlvbiBoaXN0b3J5IHN0YXRlXG4gICAqXG4gICAqL1xuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnB1c2hTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VyJ3MgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBVUkwsIGFuZCByZXBsYWNlc1xuICAgKiB0aGUgdG9wIGl0ZW0gb24gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeSBzdGFjay5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggIFVSTCBwYXRoIHRvIG5vcm1hbGl6emVcbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGVcbiAgICovXG4gIHJlcGxhY2VTdGF0ZShwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgZm9yd2FyZCBpbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5mb3J3YXJkKCk7IH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGJhY2sgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGJhY2soKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuYmFjaygpOyB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgcGxhdGZvcm0ncyBgcG9wU3RhdGVgIGV2ZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIEV2ZW50IHRoYXQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHN0YXRlIGhpc3RvcnkgY2hhbmdlcy5cbiAgICogQHBhcmFtIGV4Y2VwdGlvbiBUaGUgZXhjZXB0aW9uIHRvIHRocm93LlxuICAgKlxuICAgKiBAcmV0dXJucyBTdWJzY3JpYmVkIGV2ZW50cy5cbiAgICovXG4gIHN1YnNjcmliZShcbiAgICAgIG9uTmV4dDogKHZhbHVlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkLCBvblRocm93PzogKChleGNlcHRpb246IGFueSkgPT4gdm9pZCl8bnVsbCxcbiAgICAgIG9uUmV0dXJuPzogKCgpID0+IHZvaWQpfG51bGwpOiBTdWJzY3JpcHRpb25MaWtlIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5zdWJzY3JpYmUoe25leHQ6IG9uTmV4dCwgZXJyb3I6IG9uVGhyb3csIGNvbXBsZXRlOiBvblJldHVybn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgc3RyaW5nIG9mIHVybCBwYXJhbWV0ZXJzLCBwcmVwZW5kIHdpdGggYD9gIGlmIG5lZWRlZCwgb3RoZXJ3aXNlIHJldHVybiB0aGVcbiAgICogcGFyYW1ldGVycyBhcyBpcy5cbiAgICpcbiAgICogIEBwYXJhbSAgcGFyYW1zIFN0cmluZyBvZiBVUkwgcGFyYW1ldGVyc1xuICAgKlxuICAgKiAgQHJldHVybnMgVVJMIHBhcmFtZXRlcnMgcHJlcGVuZGVkIHdpdGggYD9gIG9yIHRoZSBwYXJhbWV0ZXJzIGFzIGlzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBub3JtYWxpemVRdWVyeVBhcmFtcyhwYXJhbXM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhcmFtcyAmJiBwYXJhbXNbMF0gIT09ICc/JyA/ICc/JyArIHBhcmFtcyA6IHBhcmFtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiAyIHBhcnRzIG9mIGEgVVJMLCBqb2luIHRoZW0gd2l0aCBhIHNsYXNoIGlmIG5lZWRlZC5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0ICBVUkwgc3RyaW5nXG4gICAqIEBwYXJhbSBlbmQgICAgVVJMIHN0cmluZ1xuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBHaXZlbiBVUkwgc3RyaW5ncyBqb2luZWQgd2l0aCBhIHNsYXNoLCBpZiBuZWVkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGpvaW5XaXRoU2xhc2goc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChzdGFydC5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIGVuZDtcbiAgICB9XG4gICAgaWYgKGVuZC5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIHN0YXJ0O1xuICAgIH1cbiAgICBsZXQgc2xhc2hlcyA9IDA7XG4gICAgaWYgKHN0YXJ0LmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHNsYXNoZXMrKztcbiAgICB9XG4gICAgaWYgKGVuZC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHNsYXNoZXMrKztcbiAgICB9XG4gICAgaWYgKHNsYXNoZXMgPT0gMikge1xuICAgICAgcmV0dXJuIHN0YXJ0ICsgZW5kLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgaWYgKHNsYXNoZXMgPT0gMSkge1xuICAgICAgcmV0dXJuIHN0YXJ0ICsgZW5kO1xuICAgIH1cbiAgICByZXR1cm4gc3RhcnQgKyAnLycgKyBlbmQ7XG4gIH1cblxuICAvKipcbiAgICogSWYgVVJMIGhhcyBhIHRyYWlsaW5nIHNsYXNoLCByZW1vdmUgaXQsIG90aGVyd2lzZSByZXR1cm4gdGhlIFVSTCBhcyBpcy4gVGhlXG4gICAqIG1ldGhvZCBsb29rcyBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgZWl0aGVyIGAjYCwgYD9gLCBvciB0aGUgZW5kIG9mIHRoZVxuICAgKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFuZCByZW1vdmVzIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBvbmUgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFVSTCBzdHJpbmdcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFVSTCBzdHJpbmcgYWZ0ZXIgcmVtb3ZpbmcgdGhlIHRyYWlsaW5nIHNsYXNoIGlmIG9uZSBleGlzdHMsIG90aGVyd2lzZVxuICAgKiByZXR1cm5zIHRoZSBzdHJpbmcgYXMgaXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHN0cmlwVHJhaWxpbmdTbGFzaCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goLyN8XFw/fCQvKTtcbiAgICBjb25zdCBwYXRoRW5kSWR4ID0gbWF0Y2ggJiYgbWF0Y2guaW5kZXggfHwgdXJsLmxlbmd0aDtcbiAgICBjb25zdCBkcm9wcGVkU2xhc2hJZHggPSBwYXRoRW5kSWR4IC0gKHVybFtwYXRoRW5kSWR4IC0gMV0gPT09ICcvJyA/IDEgOiAwKTtcbiAgICByZXR1cm4gdXJsLnNsaWNlKDAsIGRyb3BwZWRTbGFzaElkeCkgKyB1cmwuc2xpY2UocGF0aEVuZElkeCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3N0cmlwQmFzZUhyZWYoYmFzZUhyZWY6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYmFzZUhyZWYgJiYgdXJsLnN0YXJ0c1dpdGgoYmFzZUhyZWYpID8gdXJsLnN1YnN0cmluZyhiYXNlSHJlZi5sZW5ndGgpIDogdXJsO1xufVxuXG5mdW5jdGlvbiBfc3RyaXBJbmRleEh0bWwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdXJsLnJlcGxhY2UoL1xcL2luZGV4Lmh0bWwkLywgJycpO1xufVxuIl19