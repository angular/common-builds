/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
let Location = /** @class */ (() => {
    class Location {
        constructor(platformStrategy, platformLocation) {
            /** @internal */
            this._subject = new EventEmitter();
            /** @internal */
            this._urlChangeListeners = [];
            this._platformStrategy = platformStrategy;
            const browserBaseHref = this._platformStrategy.getBaseHref();
            this._platformLocation = platformLocation;
            this._baseHref = stripTrailingSlash(_stripIndexHtml(browserBaseHref));
            this._platformStrategy.onPopState((ev) => {
                this._subject.emit({
                    'url': this.path(true),
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
        path(includeHash = false) {
            return this.normalize(this._platformStrategy.path(includeHash));
        }
        /**
         * Reports the current state of the location history.
         * @returns The current value of the `history.state` object.
         */
        getState() {
            return this._platformLocation.getState();
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
            return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
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
            return this._platformStrategy.prepareExternalUrl(url);
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
            this._platformStrategy.pushState(state, '', path, query);
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
            this._platformStrategy.replaceState(state, '', path, query);
            this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
        }
        /**
         * Navigates forward in the platform's history.
         */
        forward() {
            this._platformStrategy.forward();
        }
        /**
         * Navigates back in the platform's history.
         */
        back() {
            this._platformStrategy.back();
        }
        /**
         * Registers a URL change listener. Use to catch updates performed by the Angular
         * framework that are not detectible through "popstate" or "hashchange" events.
         *
         * @param fn The change handler function, which take a URL and a location history state.
         */
        onUrlChange(fn) {
            this._urlChangeListeners.push(fn);
            if (!this._urlChangeSubscription) {
                this._urlChangeSubscription = this.subscribe(v => {
                    this._notifyUrlChangeListeners(v.url, v.state);
                });
            }
        }
        /** @internal */
        _notifyUrlChangeListeners(url = '', state) {
            this._urlChangeListeners.forEach(fn => fn(url, state));
        }
        /**
         * Subscribes to the platform's `popState` events.
         *
         * @param value Event that is triggered when the state history changes.
         * @param exception The exception to throw.
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
    Location.ɵprov = i0.ɵɵdefineInjectable({ factory: createLocation, token: Location, providedIn: "root" });
    return Location;
})();
export { Location };
export function createLocation() {
    return new Location(ɵɵinject(LocationStrategy), ɵɵinject(PlatformLocation));
}
function _stripBaseHref(baseHref, url) {
    return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUSxDQUFDOztBQVUvRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBQ0g7SUFBQSxNQUthLFFBQVE7UUFhbkIsWUFBWSxnQkFBa0MsRUFBRSxnQkFBa0M7WUFabEYsZ0JBQWdCO1lBQ2hCLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQU9qRCxnQkFBZ0I7WUFDaEIsd0JBQW1CLEdBQThDLEVBQUUsQ0FBQztZQUlsRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7WUFDMUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztZQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElB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QUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3JGLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxHQUFXO0lBQ2xDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlciwgSW5qZWN0YWJsZSwgybXJtWluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbkxpa2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5pbXBvcnQge2pvaW5XaXRoU2xhc2gsIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zLCBzdHJpcFRyYWlsaW5nU2xhc2h9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBAcHVibGljQXBpICovXG5leHBvcnQgaW50ZXJmYWNlIFBvcFN0YXRlRXZlbnQge1xuICBwb3A/OiBib29sZWFuO1xuICBzdGF0ZT86IGFueTtcbiAgdHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgc2VydmljZSB0aGF0IGFwcGxpY2F0aW9ucyBjYW4gdXNlIHRvIGludGVyYWN0IHdpdGggYSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIERlcGVuZGluZyBvbiB0aGUgYExvY2F0aW9uU3RyYXRlZ3lgIHVzZWQsIGBMb2NhdGlvbmAgcGVyc2lzdHNcbiAqIHRvIHRoZSBVUkwncyBwYXRoIG9yIHRoZSBVUkwncyBoYXNoIHNlZ21lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBJdCdzIGJldHRlciB0byB1c2UgdGhlIGBSb3V0ZXIjbmF2aWdhdGVgIHNlcnZpY2UgdG8gdHJpZ2dlciByb3V0ZSBjaGFuZ2VzLiBVc2VcbiAqIGBMb2NhdGlvbmAgb25seSBpZiB5b3UgbmVlZCB0byBpbnRlcmFjdCB3aXRoIG9yIGNyZWF0ZSBub3JtYWxpemVkIFVSTHMgb3V0c2lkZSBvZlxuICogcm91dGluZy5cbiAqXG4gKiBgTG9jYXRpb25gIGlzIHJlc3BvbnNpYmxlIGZvciBub3JtYWxpemluZyB0aGUgVVJMIGFnYWluc3QgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLlxuICogQSBub3JtYWxpemVkIFVSTCBpcyBhYnNvbHV0ZSBmcm9tIHRoZSBVUkwgaG9zdCwgaW5jbHVkZXMgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLCBhbmQgaGFzIG5vXG4gKiB0cmFpbGluZyBzbGFzaDpcbiAqIC0gYC9teS9hcHAvdXNlci8xMjNgIGlzIG5vcm1hbGl6ZWRcbiAqIC0gYG15L2FwcC91c2VyLzEyM2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzL2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiA8Y29kZS1leGFtcGxlIHBhdGg9J2NvbW1vbi9sb2NhdGlvbi90cy9wYXRoX2xvY2F0aW9uX2NvbXBvbmVudC50cydcbiAqIHJlZ2lvbj0nTG9jYXRpb25Db21wb25lbnQnPjwvY29kZS1leGFtcGxlPlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIC8vIFNlZSAjMjM5MTdcbiAgdXNlRmFjdG9yeTogY3JlYXRlTG9jYXRpb24sXG59KVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Jhc2VIcmVmOiBzdHJpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3k7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb247XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VybENoYW5nZUxpc3RlbmVyczogKCh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24pID0+IHZvaWQpW10gPSBbXTtcbiAgcHJpdmF0ZSBfdXJsQ2hhbmdlU3Vic2NyaXB0aW9uPzogU3Vic2NyaXB0aW9uTGlrZTtcblxuICBjb25zdHJ1Y3RvcihwbGF0Zm9ybVN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5LCBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneSA9IHBsYXRmb3JtU3RyYXRlZ3k7XG4gICAgY29uc3QgYnJvd3NlckJhc2VIcmVmID0gdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5nZXRCYXNlSHJlZigpO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24gPSBwbGF0Zm9ybUxvY2F0aW9uO1xuICAgIHRoaXMuX2Jhc2VIcmVmID0gc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEluZGV4SHRtbChicm93c2VyQmFzZUhyZWYpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5Lm9uUG9wU3RhdGUoKGV2KSA9PiB7XG4gICAgICB0aGlzLl9zdWJqZWN0LmVtaXQoe1xuICAgICAgICAndXJsJzogdGhpcy5wYXRoKHRydWUpLFxuICAgICAgICAncG9wJzogdHJ1ZSxcbiAgICAgICAgJ3N0YXRlJzogZXYuc3RhdGUsXG4gICAgICAgICd0eXBlJzogZXYudHlwZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIFVSTCBwYXRoIGZvciB0aGlzIGxvY2F0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gaW5jbHVkZUhhc2ggVHJ1ZSB0byBpbmNsdWRlIGFuIGFuY2hvciBmcmFnbWVudCBpbiB0aGUgcGF0aC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHBhdGguXG4gICAqL1xuICAvLyBUT0RPOiB2c2F2a2luLiBSZW1vdmUgdGhlIGJvb2xlYW4gZmxhZyBhbmQgYWx3YXlzIGluY2x1ZGUgaGFzaCBvbmNlIHRoZSBkZXByZWNhdGVkIHJvdXRlciBpc1xuICAvLyByZW1vdmVkLlxuICBwYXRoKGluY2x1ZGVIYXNoOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSh0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnBhdGgoaW5jbHVkZUhhc2gpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBsb2NhdGlvbiBoaXN0b3J5LlxuICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgYGhpc3Rvcnkuc3RhdGVgIG9iamVjdC5cbiAgICovXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmdldFN0YXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgZ2l2ZW4gcGF0aCBhbmQgY29tcGFyZXMgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZ2l2ZW4gVVJMIHBhdGguXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBnaXZlbiBVUkwgcGF0aCBpcyBlcXVhbCB0byB0aGUgY3VycmVudCBub3JtYWxpemVkIHBhdGgsIGZhbHNlXG4gICAqIG90aGVyd2lzZS5cbiAgICovXG4gIGlzQ3VycmVudFBhdGhFcXVhbFRvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGF0aCgpID09IHRoaXMubm9ybWFsaXplKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgYSBVUkwgcGF0aCBieSBzdHJpcHBpbmcgYW55IHRyYWlsaW5nIHNsYXNoZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIG5vcm1hbGl6ZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIExvY2F0aW9uLnN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBCYXNlSHJlZih0aGlzLl9iYXNlSHJlZiwgX3N0cmlwSW5kZXhIdG1sKHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIGV4dGVybmFsIFVSTCBwYXRoLlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXNuJ3QgYmVnaW4gd2l0aCBhIGxlYWRpbmcgc2xhc2ggKGAnLydgKSwgYWRkcyBvbmVcbiAgICogYmVmb3JlIG5vcm1hbGl6aW5nLiBBZGRzIGEgaGFzaCBpZiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzXG4gICAqIGluIHVzZSwgb3IgdGhlIGBBUFBfQkFTRV9IUkVGYCBpZiB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyBpbiB1c2UuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgIEEgbm9ybWFsaXplZCBwbGF0Zm9ybS1zcGVjaWZpYyBVUkwuXG4gICAqL1xuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gIH1cblxuICAvLyBUT0RPOiByZW5hbWUgdGhpcyBtZXRob2QgdG8gcHVzaFN0YXRlXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VyJ3MgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIGEgZ2l2ZW4gVVJMLCBhbmQgcHVzaGVzIGFcbiAgICogbmV3IGl0ZW0gb250byB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCAgVVJMIHBhdGggdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqXG4gICAqL1xuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnB1c2hTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcidzIFVSTCB0byBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcmVwbGFjZXNcbiAgICogdGhlIHRvcCBpdGVtIG9uIHRoZSBwbGF0Zm9ybSdzIGhpc3Rvcnkgc3RhY2suXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoICBVUkwgcGF0aCB0byBub3JtYWxpemUuXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gc3RhdGUgTG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICovXG4gIHJlcGxhY2VTdGF0ZShwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGZvcndhcmQgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5mb3J3YXJkKCk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGJhY2sgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5iYWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgVVJMIGNoYW5nZSBsaXN0ZW5lci4gVXNlIHRvIGNhdGNoIHVwZGF0ZXMgcGVyZm9ybWVkIGJ5IHRoZSBBbmd1bGFyXG4gICAqIGZyYW1ld29yayB0aGF0IGFyZSBub3QgZGV0ZWN0aWJsZSB0aHJvdWdoIFwicG9wc3RhdGVcIiBvciBcImhhc2hjaGFuZ2VcIiBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSBmbiBUaGUgY2hhbmdlIGhhbmRsZXIgZnVuY3Rpb24sIHdoaWNoIHRha2UgYSBVUkwgYW5kIGEgbG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICovXG4gIG9uVXJsQ2hhbmdlKGZuOiAodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLnB1c2goZm4pO1xuXG4gICAgaWYgKCF0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3VybENoYW5nZVN1YnNjcmlwdGlvbiA9IHRoaXMuc3Vic2NyaWJlKHYgPT4ge1xuICAgICAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnModi51cmwsIHYuc3RhdGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHVybDogc3RyaW5nID0gJycsIHN0YXRlOiB1bmtub3duKSB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goZm4gPT4gZm4odXJsLCBzdGF0ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gdGhlIHBsYXRmb3JtJ3MgYHBvcFN0YXRlYCBldmVudHMuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBFdmVudCB0aGF0IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBzdGF0ZSBoaXN0b3J5IGNoYW5nZXMuXG4gICAqIEBwYXJhbSBleGNlcHRpb24gVGhlIGV4Y2VwdGlvbiB0byB0aHJvdy5cbiAgICpcbiAgICogQHJldHVybnMgU3Vic2NyaWJlZCBldmVudHMuXG4gICAqL1xuICBzdWJzY3JpYmUoXG4gICAgICBvbk5leHQ6ICh2YWx1ZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZCwgb25UaHJvdz86ICgoZXhjZXB0aW9uOiBhbnkpID0+IHZvaWQpfG51bGwsXG4gICAgICBvblJldHVybj86ICgoKSA9PiB2b2lkKXxudWxsKTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvblRocm93LCBjb21wbGV0ZTogb25SZXR1cm59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIFVSTCBwYXJhbWV0ZXJzIGJ5IHByZXBlbmRpbmcgd2l0aCBgP2AgaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gIHBhcmFtcyBTdHJpbmcgb2YgVVJMIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBwYXJhbWV0ZXJzIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplUXVlcnlQYXJhbXM6IChwYXJhbXM6IHN0cmluZykgPT4gc3RyaW5nID0gbm9ybWFsaXplUXVlcnlQYXJhbXM7XG5cbiAgLyoqXG4gICAqIEpvaW5zIHR3byBwYXJ0cyBvZiBhIFVSTCB3aXRoIGEgc2xhc2ggaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgIFVSTCBzdHJpbmdcbiAgICogQHBhcmFtIGVuZCAgICBVUkwgc3RyaW5nXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBqb2luZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgam9pbldpdGhTbGFzaDogKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiBzdHJpbmcgPSBqb2luV2l0aFNsYXNoO1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgdHJhaWxpbmcgc2xhc2ggZnJvbSBhIFVSTCBzdHJpbmcgaWYgbmVlZGVkLlxuICAgKiBMb29rcyBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgZWl0aGVyIGAjYCwgYD9gLCBvciB0aGUgZW5kIG9mIHRoZVxuICAgKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFuZCByZW1vdmVzIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBvbmUgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFVSTCBzdHJpbmcuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBVUkwgc3RyaW5nLCBtb2RpZmllZCBpZiBuZWVkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHN0cmlwVHJhaWxpbmdTbGFzaDogKHVybDogc3RyaW5nKSA9PiBzdHJpbmcgPSBzdHJpcFRyYWlsaW5nU2xhc2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBMb2NhdGlvbijJtcm1aW5qZWN0KExvY2F0aW9uU3RyYXRlZ3kgYXMgYW55KSwgybXJtWluamVjdChQbGF0Zm9ybUxvY2F0aW9uIGFzIGFueSkpO1xufVxuXG5mdW5jdGlvbiBfc3RyaXBCYXNlSHJlZihiYXNlSHJlZjogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlSHJlZiAmJiB1cmwuc3RhcnRzV2l0aChiYXNlSHJlZikgPyB1cmwuc3Vic3RyaW5nKGJhc2VIcmVmLmxlbmd0aCkgOiB1cmw7XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEluZGV4SHRtbCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwvaW5kZXguaHRtbCQvLCAnJyk7XG59XG4iXX0=