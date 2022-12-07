/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Injectable, ɵɵinject } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import { joinWithSlash, normalizeQueryParams, stripTrailingSlash } from './util';
import * as i0 from "@angular/core";
import * as i1 from "./location_strategy";
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
 * It's better to use the `Router.navigate()` service to trigger route changes. Use
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
export class Location {
    constructor(locationStrategy) {
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._urlChangeListeners = [];
        /** @internal */
        this._urlChangeSubscription = null;
        this._locationStrategy = locationStrategy;
        const baseHref = this._locationStrategy.getBaseHref();
        this._basePath = _stripOrigin(stripTrailingSlash(_stripIndexHtml(baseHref)));
        this._locationStrategy.onPopState((ev) => {
            this._subject.emit({
                'url': this.path(true),
                'pop': true,
                'state': ev.state,
                'type': ev.type,
            });
        });
    }
    /** @nodoc */
    ngOnDestroy() {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeListeners = [];
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
    path(includeHash = false) {
        return this.normalize(this._locationStrategy.path(includeHash));
    }
    /**
     * Reports the current state of the location history.
     * @returns The current value of the `history.state` object.
     */
    getState() {
        return this._locationStrategy.getState();
    }
    /**
     * Normalizes the given path and compares to the current normalized path.
     *
     * @param path The given URL path.
     * @param query Query parameters.
     *
     * @returns True if the given URL path is equal to the current normalized path, false
     * otherwise.
     */
    isCurrentPathEqualTo(path, query = '') {
        return this.path() == this.normalize(path + normalizeQueryParams(query));
    }
    /**
     * Normalizes a URL path by stripping any trailing slashes.
     *
     * @param url String representing a URL.
     *
     * @returns The normalized URL string.
     */
    normalize(url) {
        return Location.stripTrailingSlash(_stripBasePath(this._basePath, _stripIndexHtml(url)));
    }
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
    prepareExternalUrl(url) {
        if (url && url[0] !== '/') {
            url = '/' + url;
        }
        return this._locationStrategy.prepareExternalUrl(url);
    }
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
    go(path, query = '', state = null) {
        this._locationStrategy.pushState(state, '', path, query);
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
    }
    /**
     * Changes the browser's URL to a normalized version of the given URL, and replaces
     * the top item on the platform's history stack.
     *
     * @param path  URL path to normalize.
     * @param query Query parameters.
     * @param state Location history state.
     */
    replaceState(path, query = '', state = null) {
        this._locationStrategy.replaceState(state, '', path, query);
        this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
    }
    /**
     * Navigates forward in the platform's history.
     */
    forward() {
        this._locationStrategy.forward();
    }
    /**
     * Navigates back in the platform's history.
     */
    back() {
        this._locationStrategy.back();
    }
    /**
     * Navigate to a specific page from session history, identified by its relative position to the
     * current page.
     *
     * @param relativePosition  Position of the target page in the history relative to the current
     *     page.
     * A negative value moves backwards, a positive value moves forwards, e.g. `location.historyGo(2)`
     * moves forward two pages and `location.historyGo(-2)` moves back two pages. When we try to go
     * beyond what's stored in the history session, we stay in the current page. Same behaviour occurs
     * when `relativePosition` equals 0.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/History_API#Moving_to_a_specific_point_in_history
     */
    historyGo(relativePosition = 0) {
        this._locationStrategy.historyGo?.(relativePosition);
    }
    /**
     * Registers a URL change listener. Use to catch updates performed by the Angular
     * framework that are not detectible through "popstate" or "hashchange" events.
     *
     * @param fn The change handler function, which take a URL and a location history state.
     * @returns A function that, when executed, unregisters a URL change listener.
     */
    onUrlChange(fn) {
        this._urlChangeListeners.push(fn);
        if (!this._urlChangeSubscription) {
            this._urlChangeSubscription = this.subscribe(v => {
                this._notifyUrlChangeListeners(v.url, v.state);
            });
        }
        return () => {
            const fnIndex = this._urlChangeListeners.indexOf(fn);
            this._urlChangeListeners.splice(fnIndex, 1);
            if (this._urlChangeListeners.length === 0) {
                this._urlChangeSubscription?.unsubscribe();
                this._urlChangeSubscription = null;
            }
        };
    }
    /** @internal */
    _notifyUrlChangeListeners(url = '', state) {
        this._urlChangeListeners.forEach(fn => fn(url, state));
    }
    /**
     * Subscribes to the platform's `popState` events.
     *
     * Note: `Location.go()` does not trigger the `popState` event in the browser. Use
     * `Location.onUrlChange()` to subscribe to URL changes instead.
     *
     * @param value Event that is triggered when the state history changes.
     * @param exception The exception to throw.
     *
     * @see [onpopstate](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate)
     *
     * @returns Subscribed events.
     */
    subscribe(onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    }
}
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
Location.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.0-next.2+sha-9226dd2", ngImport: i0, type: Location, deps: [{ token: i1.LocationStrategy }], target: i0.ɵɵFactoryTarget.Injectable });
Location.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.1.0-next.2+sha-9226dd2", ngImport: i0, type: Location, providedIn: 'root', useFactory: createLocation });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.1.0-next.2+sha-9226dd2", ngImport: i0, type: Location, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                    // See #23917
                    useFactory: createLocation,
                }]
        }], ctorParameters: function () { return [{ type: i1.LocationStrategy }]; } });
export function createLocation() {
    return new Location(ɵɵinject(LocationStrategy));
}
function _stripBasePath(basePath, url) {
    return basePath && url.startsWith(basePath) ? url.substring(basePath.length) : url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
function _stripOrigin(baseHref) {
    if (/^(https?:)?\/\//.test(baseHref)) {
        const [, pathname] = baseHref.split(/\/\/[^\/]+/);
        return pathname;
    }
    return baseHref;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFhLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUc1RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7QUFVL0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQU1ILE1BQU0sT0FBTyxRQUFRO0lBWW5CLFlBQVksZ0JBQWtDO1FBWDlDLGdCQUFnQjtRQUNoQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFLakQsZ0JBQWdCO1FBQ2hCLHdCQUFtQixHQUE4QyxFQUFFLENBQUM7UUFDcEUsZ0JBQWdCO1FBQ2hCLDJCQUFzQixHQUEwQixJQUFJLENBQUM7UUFHbkQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDakIsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN0QixLQUFLLEVBQUUsSUFBSTtnQkFDWCxPQUFP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XG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25MaWtlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7am9pbldpdGhTbGFzaCwgbm9ybWFsaXplUXVlcnlQYXJhbXMsIHN0cmlwVHJhaWxpbmdTbGFzaH0gZnJvbSAnLi91dGlsJztcblxuLyoqIEBwdWJsaWNBcGkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9wU3RhdGVFdmVudCB7XG4gIHBvcD86IGJvb2xlYW47XG4gIHN0YXRlPzogYW55O1xuICB0eXBlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBzZXJ2aWNlIHRoYXQgYXBwbGljYXRpb25zIGNhbiB1c2UgdG8gaW50ZXJhY3Qgd2l0aCBhIGJyb3dzZXIncyBVUkwuXG4gKlxuICogRGVwZW5kaW5nIG9uIHRoZSBgTG9jYXRpb25TdHJhdGVneWAgdXNlZCwgYExvY2F0aW9uYCBwZXJzaXN0c1xuICogdG8gdGhlIFVSTCdzIHBhdGggb3IgdGhlIFVSTCdzIGhhc2ggc2VnbWVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEl0J3MgYmV0dGVyIHRvIHVzZSB0aGUgYFJvdXRlci5uYXZpZ2F0ZSgpYCBzZXJ2aWNlIHRvIHRyaWdnZXIgcm91dGUgY2hhbmdlcy4gVXNlXG4gKiBgTG9jYXRpb25gIG9ubHkgaWYgeW91IG5lZWQgdG8gaW50ZXJhY3Qgd2l0aCBvciBjcmVhdGUgbm9ybWFsaXplZCBVUkxzIG91dHNpZGUgb2ZcbiAqIHJvdXRpbmcuXG4gKlxuICogYExvY2F0aW9uYCBpcyByZXNwb25zaWJsZSBmb3Igbm9ybWFsaXppbmcgdGhlIFVSTCBhZ2FpbnN0IHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZi5cbiAqIEEgbm9ybWFsaXplZCBVUkwgaXMgYWJzb2x1dGUgZnJvbSB0aGUgVVJMIGhvc3QsIGluY2x1ZGVzIHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZiwgYW5kIGhhcyBub1xuICogdHJhaWxpbmcgc2xhc2g6XG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzYCBpcyBub3JtYWxpemVkXG4gKiAtIGBteS9hcHAvdXNlci8xMjNgICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICogLSBgL215L2FwcC91c2VyLzEyMy9gICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPSdjb21tb24vbG9jYXRpb24vdHMvcGF0aF9sb2NhdGlvbl9jb21wb25lbnQudHMnXG4gKiByZWdpb249J0xvY2F0aW9uQ29tcG9uZW50Jz48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IGNyZWF0ZUxvY2F0aW9uLFxufSlcbmV4cG9ydCBjbGFzcyBMb2NhdGlvbiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9iYXNlUGF0aDogc3RyaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9sb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5O1xuICAvKiogQGludGVybmFsICovXG4gIF91cmxDaGFuZ2VMaXN0ZW5lcnM6ICgodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKVtdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VybENoYW5nZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZXxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihsb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gICAgdGhpcy5fbG9jYXRpb25TdHJhdGVneSA9IGxvY2F0aW9uU3RyYXRlZ3k7XG4gICAgY29uc3QgYmFzZUhyZWYgPSB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmKCk7XG4gICAgdGhpcy5fYmFzZVBhdGggPSBfc3RyaXBPcmlnaW4oc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEluZGV4SHRtbChiYXNlSHJlZikpKTtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5Lm9uUG9wU3RhdGUoKGV2KSA9PiB7XG4gICAgICB0aGlzLl9zdWJqZWN0LmVtaXQoe1xuICAgICAgICAndXJsJzogdGhpcy5wYXRoKHRydWUpLFxuICAgICAgICAncG9wJzogdHJ1ZSxcbiAgICAgICAgJ3N0YXRlJzogZXYuc3RhdGUsXG4gICAgICAgICd0eXBlJzogZXYudHlwZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgVVJMIHBhdGggZm9yIHRoaXMgbG9jYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBpbmNsdWRlSGFzaCBUcnVlIHRvIGluY2x1ZGUgYW4gYW5jaG9yIGZyYWdtZW50IGluIHRoZSBwYXRoLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgcGF0aC5cbiAgICovXG4gIC8vIFRPRE86IHZzYXZraW4uIFJlbW92ZSB0aGUgYm9vbGVhbiBmbGFnIGFuZCBhbHdheXMgaW5jbHVkZSBoYXNoIG9uY2UgdGhlIGRlcHJlY2F0ZWQgcm91dGVyIGlzXG4gIC8vIHJlbW92ZWQuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kucGF0aChpbmNsdWRlSGFzaCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGxvY2F0aW9uIGhpc3RvcnkuXG4gICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBgaGlzdG9yeS5zdGF0ZWAgb2JqZWN0LlxuICAgKi9cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kuZ2V0U3RhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBnaXZlbiBwYXRoIGFuZCBjb21wYXJlcyB0byB0aGUgY3VycmVudCBub3JtYWxpemVkIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBnaXZlbiBVUkwgcGF0aC5cbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGdpdmVuIFVSTCBwYXRoIGlzIGVxdWFsIHRvIHRoZSBjdXJyZW50IG5vcm1hbGl6ZWQgcGF0aCwgZmFsc2VcbiAgICogb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNDdXJyZW50UGF0aEVxdWFsVG8ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoKCkgPT0gdGhpcy5ub3JtYWxpemUocGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5KSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhIFVSTCBwYXRoIGJ5IHN0cmlwcGluZyBhbnkgdHJhaWxpbmcgc2xhc2hlcy5cbiAgICpcbiAgICogQHBhcmFtIHVybCBTdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgc3RyaW5nLlxuICAgKi9cbiAgbm9ybWFsaXplKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTG9jYXRpb24uc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEJhc2VQYXRoKHRoaXMuX2Jhc2VQYXRoLCBfc3RyaXBJbmRleEh0bWwodXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgYW4gZXh0ZXJuYWwgVVJMIHBhdGguXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgZG9lc24ndCBiZWdpbiB3aXRoIGEgbGVhZGluZyBzbGFzaCAoYCcvJ2ApLCBhZGRzIG9uZVxuICAgKiBiZWZvcmUgbm9ybWFsaXppbmcuIEFkZHMgYSBoYXNoIGlmIGBIYXNoTG9jYXRpb25TdHJhdGVneWAgaXNcbiAgICogaW4gdXNlLCBvciB0aGUgYEFQUF9CQVNFX0hSRUZgIGlmIHRoZSBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgIGlzIGluIHVzZS5cbiAgICpcbiAgICogQHBhcmFtIHVybCBTdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLlxuICAgKlxuICAgKiBAcmV0dXJucyAgQSBub3JtYWxpemVkIHBsYXRmb3JtLXNwZWNpZmljIFVSTC5cbiAgICovXG4gIHByZXBhcmVFeHRlcm5hbFVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHVybCAmJiB1cmxbMF0gIT09ICcvJykge1xuICAgICAgdXJsID0gJy8nICsgdXJsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25TdHJhdGVneS5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsKTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbmFtZSB0aGlzIG1ldGhvZCB0byBwdXNoU3RhdGVcbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGJyb3dzZXIncyBVUkwgdG8gYSBub3JtYWxpemVkIHZlcnNpb24gb2YgYSBnaXZlbiBVUkwsIGFuZCBwdXNoZXMgYVxuICAgKiBuZXcgaXRlbSBvbnRvIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoICBVUkwgcGF0aCB0byBub3JtYWxpemUuXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gc3RhdGUgTG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICpcbiAgICovXG4gIGdvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kucHVzaFN0YXRlKHN0YXRlLCAnJywgcGF0aCwgcXVlcnkpO1xuICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyhcbiAgICAgICAgdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5KSksIHN0YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VyJ3MgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBVUkwsIGFuZCByZXBsYWNlc1xuICAgKiB0aGUgdG9wIGl0ZW0gb24gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeSBzdGFjay5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggIFVSTCBwYXRoIHRvIG5vcm1hbGl6ZS5cbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBzdGF0ZSBMb2NhdGlvbiBoaXN0b3J5IHN0YXRlLlxuICAgKi9cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kucmVwbGFjZVN0YXRlKHN0YXRlLCAnJywgcGF0aCwgcXVlcnkpO1xuICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyhcbiAgICAgICAgdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5KSksIHN0YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgZm9yd2FyZCBpbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgZm9yd2FyZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgYmFjayBpbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LmJhY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB0byBhIHNwZWNpZmljIHBhZ2UgZnJvbSBzZXNzaW9uIGhpc3RvcnksIGlkZW50aWZpZWQgYnkgaXRzIHJlbGF0aXZlIHBvc2l0aW9uIHRvIHRoZVxuICAgKiBjdXJyZW50IHBhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSByZWxhdGl2ZVBvc2l0aW9uICBQb3NpdGlvbiBvZiB0aGUgdGFyZ2V0IHBhZ2UgaW4gdGhlIGhpc3RvcnkgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnRcbiAgICogICAgIHBhZ2UuXG4gICAqIEEgbmVnYXRpdmUgdmFsdWUgbW92ZXMgYmFja3dhcmRzLCBhIHBvc2l0aXZlIHZhbHVlIG1vdmVzIGZvcndhcmRzLCBlLmcuIGBsb2NhdGlvbi5oaXN0b3J5R28oMilgXG4gICAqIG1vdmVzIGZvcndhcmQgdHdvIHBhZ2VzIGFuZCBgbG9jYXRpb24uaGlzdG9yeUdvKC0yKWAgbW92ZXMgYmFjayB0d28gcGFnZXMuIFdoZW4gd2UgdHJ5IHRvIGdvXG4gICAqIGJleW9uZCB3aGF0J3Mgc3RvcmVkIGluIHRoZSBoaXN0b3J5IHNlc3Npb24sIHdlIHN0YXkgaW4gdGhlIGN1cnJlbnQgcGFnZS4gU2FtZSBiZWhhdmlvdXIgb2NjdXJzXG4gICAqIHdoZW4gYHJlbGF0aXZlUG9zaXRpb25gIGVxdWFscyAwLlxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IaXN0b3J5X0FQSSNNb3ZpbmdfdG9fYV9zcGVjaWZpY19wb2ludF9pbl9oaXN0b3J5XG4gICAqL1xuICBoaXN0b3J5R28ocmVsYXRpdmVQb3NpdGlvbjogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kuaGlzdG9yeUdvPy4ocmVsYXRpdmVQb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgVVJMIGNoYW5nZSBsaXN0ZW5lci4gVXNlIHRvIGNhdGNoIHVwZGF0ZXMgcGVyZm9ybWVkIGJ5IHRoZSBBbmd1bGFyXG4gICAqIGZyYW1ld29yayB0aGF0IGFyZSBub3QgZGV0ZWN0aWJsZSB0aHJvdWdoIFwicG9wc3RhdGVcIiBvciBcImhhc2hjaGFuZ2VcIiBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSBmbiBUaGUgY2hhbmdlIGhhbmRsZXIgZnVuY3Rpb24sIHdoaWNoIHRha2UgYSBVUkwgYW5kIGEgbG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGV4ZWN1dGVkLCB1bnJlZ2lzdGVycyBhIFVSTCBjaGFuZ2UgbGlzdGVuZXIuXG4gICAqL1xuICBvblVybENoYW5nZShmbjogKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZCk6IFZvaWRGdW5jdGlvbiB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLnB1c2goZm4pO1xuXG4gICAgaWYgKCF0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3VybENoYW5nZVN1YnNjcmlwdGlvbiA9IHRoaXMuc3Vic2NyaWJlKHYgPT4ge1xuICAgICAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnModi51cmwsIHYuc3RhdGUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbnN0IGZuSW5kZXggPSB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMuaW5kZXhPZihmbik7XG4gICAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMuc3BsaWNlKGZuSW5kZXgsIDEpO1xuXG4gICAgICBpZiAodGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIHRoaXMuX3VybENoYW5nZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh1cmw6IHN0cmluZyA9ICcnLCBzdGF0ZTogdW5rbm93bikge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5mb3JFYWNoKGZuID0+IGZuKHVybCwgc3RhdGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIHRoZSBwbGF0Zm9ybSdzIGBwb3BTdGF0ZWAgZXZlbnRzLlxuICAgKlxuICAgKiBOb3RlOiBgTG9jYXRpb24uZ28oKWAgZG9lcyBub3QgdHJpZ2dlciB0aGUgYHBvcFN0YXRlYCBldmVudCBpbiB0aGUgYnJvd3Nlci4gVXNlXG4gICAqIGBMb2NhdGlvbi5vblVybENoYW5nZSgpYCB0byBzdWJzY3JpYmUgdG8gVVJMIGNoYW5nZXMgaW5zdGVhZC5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIEV2ZW50IHRoYXQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHN0YXRlIGhpc3RvcnkgY2hhbmdlcy5cbiAgICogQHBhcmFtIGV4Y2VwdGlvbiBUaGUgZXhjZXB0aW9uIHRvIHRocm93LlxuICAgKlxuICAgKiBAc2VlIFtvbnBvcHN0YXRlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93RXZlbnRIYW5kbGVycy9vbnBvcHN0YXRlKVxuICAgKlxuICAgKiBAcmV0dXJucyBTdWJzY3JpYmVkIGV2ZW50cy5cbiAgICovXG4gIHN1YnNjcmliZShcbiAgICAgIG9uTmV4dDogKHZhbHVlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkLCBvblRocm93PzogKChleGNlcHRpb246IGFueSkgPT4gdm9pZCl8bnVsbCxcbiAgICAgIG9uUmV0dXJuPzogKCgpID0+IHZvaWQpfG51bGwpOiBTdWJzY3JpcHRpb25MaWtlIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5zdWJzY3JpYmUoe25leHQ6IG9uTmV4dCwgZXJyb3I6IG9uVGhyb3csIGNvbXBsZXRlOiBvblJldHVybn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgVVJMIHBhcmFtZXRlcnMgYnkgcHJlcGVuZGluZyB3aXRoIGA/YCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIEBwYXJhbSAgcGFyYW1zIFN0cmluZyBvZiBVUkwgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHBhcmFtZXRlcnMgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBub3JtYWxpemVRdWVyeVBhcmFtczogKHBhcmFtczogc3RyaW5nKSA9PiBzdHJpbmcgPSBub3JtYWxpemVRdWVyeVBhcmFtcztcblxuICAvKipcbiAgICogSm9pbnMgdHdvIHBhcnRzIG9mIGEgVVJMIHdpdGggYSBzbGFzaCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCAgVVJMIHN0cmluZ1xuICAgKiBAcGFyYW0gZW5kICAgIFVSTCBzdHJpbmdcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGpvaW5lZCBVUkwgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBqb2luV2l0aFNsYXNoOiAoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHN0cmluZyA9IGpvaW5XaXRoU2xhc2g7XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSB0cmFpbGluZyBzbGFzaCBmcm9tIGEgVVJMIHN0cmluZyBpZiBuZWVkZWQuXG4gICAqIExvb2tzIGZvciB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBlaXRoZXIgYCNgLCBgP2AsIG9yIHRoZSBlbmQgb2YgdGhlXG4gICAqIGxpbmUgYXMgYC9gIGNoYXJhY3RlcnMgYW5kIHJlbW92ZXMgdGhlIHRyYWlsaW5nIHNsYXNoIGlmIG9uZSBleGlzdHMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVVJMIHN0cmluZy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIFVSTCBzdHJpbmcsIG1vZGlmaWVkIGlmIG5lZWRlZC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc3RyaXBUcmFpbGluZ1NsYXNoOiAodXJsOiBzdHJpbmcpID0+IHN0cmluZyA9IHN0cmlwVHJhaWxpbmdTbGFzaDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uKCkge1xuICByZXR1cm4gbmV3IExvY2F0aW9uKMm1ybVpbmplY3QoTG9jYXRpb25TdHJhdGVneSBhcyBhbnkpKTtcbn1cblxuZnVuY3Rpb24gX3N0cmlwQmFzZVBhdGgoYmFzZVBhdGg6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYmFzZVBhdGggJiYgdXJsLnN0YXJ0c1dpdGgoYmFzZVBhdGgpID8gdXJsLnN1YnN0cmluZyhiYXNlUGF0aC5sZW5ndGgpIDogdXJsO1xufVxuXG5mdW5jdGlvbiBfc3RyaXBJbmRleEh0bWwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdXJsLnJlcGxhY2UoL1xcL2luZGV4Lmh0bWwkLywgJycpO1xufVxuXG5mdW5jdGlvbiBfc3RyaXBPcmlnaW4oYmFzZUhyZWY6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICgvXihodHRwcz86KT9cXC9cXC8vLnRlc3QoYmFzZUhyZWYpKSB7XG4gICAgY29uc3QgWywgcGF0aG5hbWVdID0gYmFzZUhyZWYuc3BsaXQoL1xcL1xcL1teXFwvXSsvKTtcbiAgICByZXR1cm4gcGF0aG5hbWU7XG4gIH1cbiAgcmV0dXJuIGJhc2VIcmVmO1xufVxuIl19