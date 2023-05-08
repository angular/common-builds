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
class Location {
    constructor(locationStrategy) {
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._urlChangeListeners = [];
        /** @internal */
        this._urlChangeSubscription = null;
        this._locationStrategy = locationStrategy;
        const baseHref = this._locationStrategy.getBaseHref();
        // Note: This class's interaction with base HREF does not fully follow the rules
        // outlined in the spec https://www.freesoft.org/CIE/RFC/1808/18.htm.
        // Instead of trying to fix individual bugs with more and more code, we should
        // investigate using the URL constructor and providing the base as a second
        // argument.
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#parameters
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
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * @param  params String of URL parameters.
     *
     * @returns The normalized URL parameters string.
     */
    static { this.normalizeQueryParams = normalizeQueryParams; }
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @returns The joined URL string.
     */
    static { this.joinWithSlash = joinWithSlash; }
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string.
     *
     * @returns The URL string, modified if needed.
     */
    static { this.stripTrailingSlash = stripTrailingSlash; }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-9d4842c", ngImport: i0, type: Location, deps: [{ token: i1.LocationStrategy }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-9d4842c", ngImport: i0, type: Location, providedIn: 'root', useFactory: createLocation }); }
}
export { Location };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-9d4842c", ngImport: i0, type: Location, decorators: [{
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
    if (!basePath || !url.startsWith(basePath)) {
        return url;
    }
    const strippedUrl = url.substring(basePath.length);
    if (strippedUrl === '' || ['/', ';', '?', '#'].includes(strippedUrl[0])) {
        return strippedUrl;
    }
    return url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
function _stripOrigin(baseHref) {
    // DO NOT REFACTOR! Previously, this check looked like this:
    // `/^(https?:)?\/\//.test(baseHref)`, but that resulted in
    // syntactically incorrect code after Closure Compiler minification.
    // This was likely caused by a bug in Closure Compiler, but
    // for now, the check is rewritten to use `new RegExp` instead.
    const isAbsoluteUrl = (new RegExp('^(https?:)?//')).test(baseHref);
    if (isAbsoluteUrl) {
        const [, pathname] = baseHref.split(/\/\/[^\/]+/);
        return pathname;
    }
    return baseHref;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFhLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUc1RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7QUFVL0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUNILE1BS2EsUUFBUTtJQVluQixZQUFZLGdCQUFrQztRQVg5QyxnQkFBZ0I7UUFDaEIsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBS2pELGdCQUFnQjtRQUNoQix3QkFBbUIsR0FBOEMsRUFBRSxDQUFDO1FBQ3BFLGdCQUFnQjtRQUNoQiwyQkFBc0IsR0FBMEIsSUFBSSxDQUFDO1FBR25ELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEQsZ0ZBQWdGO1FBQ2hGLHFFQUFxRTtRQUNyRSw4RUFBOEU7UUFDOUUsMkVBQTJFO1FBQzNFLFlBQVk7UUFDWixzRUFBc0U7UUFDdEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLEtB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O0lBQ2xDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLFFBQWdCO0lBQ3BDLDREQUE0RDtJQUM1RCwyREFBMkQ7SUFDM0Qsb0VBQW9FO0lBQ3BFLDJEQUEyRDtJQUMzRCwrREFBK0Q7SUFDL0QsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRSxJQUFJLGFBQWEsRUFBRTtRQUNqQixNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xELE9BQU8sUUFBUSxDQUFDO0tBQ2pCO0lBQ0QsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlciwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge2pvaW5XaXRoU2xhc2gsIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zLCBzdHJpcFRyYWlsaW5nU2xhc2h9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBAcHVibGljQXBpICovXG5leHBvcnQgaW50ZXJmYWNlIFBvcFN0YXRlRXZlbnQge1xuICBwb3A/OiBib29sZWFuO1xuICBzdGF0ZT86IGFueTtcbiAgdHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgc2VydmljZSB0aGF0IGFwcGxpY2F0aW9ucyBjYW4gdXNlIHRvIGludGVyYWN0IHdpdGggYSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIERlcGVuZGluZyBvbiB0aGUgYExvY2F0aW9uU3RyYXRlZ3lgIHVzZWQsIGBMb2NhdGlvbmAgcGVyc2lzdHNcbiAqIHRvIHRoZSBVUkwncyBwYXRoIG9yIHRoZSBVUkwncyBoYXNoIHNlZ21lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBJdCdzIGJldHRlciB0byB1c2UgdGhlIGBSb3V0ZXIubmF2aWdhdGUoKWAgc2VydmljZSB0byB0cmlnZ2VyIHJvdXRlIGNoYW5nZXMuIFVzZVxuICogYExvY2F0aW9uYCBvbmx5IGlmIHlvdSBuZWVkIHRvIGludGVyYWN0IHdpdGggb3IgY3JlYXRlIG5vcm1hbGl6ZWQgVVJMcyBvdXRzaWRlIG9mXG4gKiByb3V0aW5nLlxuICpcbiAqIGBMb2NhdGlvbmAgaXMgcmVzcG9uc2libGUgZm9yIG5vcm1hbGl6aW5nIHRoZSBVUkwgYWdhaW5zdCB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYuXG4gKiBBIG5vcm1hbGl6ZWQgVVJMIGlzIGFic29sdXRlIGZyb20gdGhlIFVSTCBob3N0LCBpbmNsdWRlcyB0aGUgYXBwbGljYXRpb24ncyBiYXNlIGhyZWYsIGFuZCBoYXMgbm9cbiAqIHRyYWlsaW5nIHNsYXNoOlxuICogLSBgL215L2FwcC91c2VyLzEyM2AgaXMgbm9ybWFsaXplZFxuICogLSBgbXkvYXBwL3VzZXIvMTIzYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqIC0gYC9teS9hcHAvdXNlci8xMjMvYCAqKmlzIG5vdCoqIG5vcm1hbGl6ZWRcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD0nY29tbW9uL2xvY2F0aW9uL3RzL3BhdGhfbG9jYXRpb25fY29tcG9uZW50LnRzJ1xuICogcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCc+PC9jb2RlLWV4YW1wbGU+XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgLy8gU2VlICMyMzkxN1xuICB1c2VGYWN0b3J5OiBjcmVhdGVMb2NhdGlvbixcbn0pXG5leHBvcnQgY2xhc3MgTG9jYXRpb24gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmFzZVBhdGg6IHN0cmluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXJsQ2hhbmdlTGlzdGVuZXJzOiAoKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZClbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF91cmxDaGFuZ2VTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbkxpa2V8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IobG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge1xuICAgIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kgPSBsb2NhdGlvblN0cmF0ZWd5O1xuICAgIGNvbnN0IGJhc2VIcmVmID0gdGhpcy5fbG9jYXRpb25TdHJhdGVneS5nZXRCYXNlSHJlZigpO1xuICAgIC8vIE5vdGU6IFRoaXMgY2xhc3MncyBpbnRlcmFjdGlvbiB3aXRoIGJhc2UgSFJFRiBkb2VzIG5vdCBmdWxseSBmb2xsb3cgdGhlIHJ1bGVzXG4gICAgLy8gb3V0bGluZWQgaW4gdGhlIHNwZWMgaHR0cHM6Ly93d3cuZnJlZXNvZnQub3JnL0NJRS9SRkMvMTgwOC8xOC5odG0uXG4gICAgLy8gSW5zdGVhZCBvZiB0cnlpbmcgdG8gZml4IGluZGl2aWR1YWwgYnVncyB3aXRoIG1vcmUgYW5kIG1vcmUgY29kZSwgd2Ugc2hvdWxkXG4gICAgLy8gaW52ZXN0aWdhdGUgdXNpbmcgdGhlIFVSTCBjb25zdHJ1Y3RvciBhbmQgcHJvdmlkaW5nIHRoZSBiYXNlIGFzIGEgc2Vjb25kXG4gICAgLy8gYXJndW1lbnQuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1VSTC9VUkwjcGFyYW1ldGVyc1xuICAgIHRoaXMuX2Jhc2VQYXRoID0gX3N0cmlwT3JpZ2luKHN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBJbmRleEh0bWwoYmFzZUhyZWYpKSk7XG4gICAgdGhpcy5fbG9jYXRpb25TdHJhdGVneS5vblBvcFN0YXRlKChldikgPT4ge1xuICAgICAgdGhpcy5fc3ViamVjdC5lbWl0KHtcbiAgICAgICAgJ3VybCc6IHRoaXMucGF0aCh0cnVlKSxcbiAgICAgICAgJ3BvcCc6IHRydWUsXG4gICAgICAgICdzdGF0ZSc6IGV2LnN0YXRlLFxuICAgICAgICAndHlwZSc6IGV2LnR5cGUsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIFVSTCBwYXRoIGZvciB0aGlzIGxvY2F0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gaW5jbHVkZUhhc2ggVHJ1ZSB0byBpbmNsdWRlIGFuIGFuY2hvciBmcmFnbWVudCBpbiB0aGUgcGF0aC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHBhdGguXG4gICAqL1xuICAvLyBUT0RPOiB2c2F2a2luLiBSZW1vdmUgdGhlIGJvb2xlYW4gZmxhZyBhbmQgYWx3YXlzIGluY2x1ZGUgaGFzaCBvbmNlIHRoZSBkZXByZWNhdGVkIHJvdXRlciBpc1xuICAvLyByZW1vdmVkLlxuICBwYXRoKGluY2x1ZGVIYXNoOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSh0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LnBhdGgoaW5jbHVkZUhhc2gpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBsb2NhdGlvbiBoaXN0b3J5LlxuICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgYGhpc3Rvcnkuc3RhdGVgIG9iamVjdC5cbiAgICovXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LmdldFN0YXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgZ2l2ZW4gcGF0aCBhbmQgY29tcGFyZXMgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZ2l2ZW4gVVJMIHBhdGguXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBnaXZlbiBVUkwgcGF0aCBpcyBlcXVhbCB0byB0aGUgY3VycmVudCBub3JtYWxpemVkIHBhdGgsIGZhbHNlXG4gICAqIG90aGVyd2lzZS5cbiAgICovXG4gIGlzQ3VycmVudFBhdGhFcXVhbFRvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGF0aCgpID09IHRoaXMubm9ybWFsaXplKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgYSBVUkwgcGF0aCBieSBzdHJpcHBpbmcgYW55IHRyYWlsaW5nIHNsYXNoZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIG5vcm1hbGl6ZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIExvY2F0aW9uLnN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBCYXNlUGF0aCh0aGlzLl9iYXNlUGF0aCwgX3N0cmlwSW5kZXhIdG1sKHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGFuIGV4dGVybmFsIFVSTCBwYXRoLlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXNuJ3QgYmVnaW4gd2l0aCBhIGxlYWRpbmcgc2xhc2ggKGAnLydgKSwgYWRkcyBvbmVcbiAgICogYmVmb3JlIG5vcm1hbGl6aW5nLiBBZGRzIGEgaGFzaCBpZiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzXG4gICAqIGluIHVzZSwgb3IgdGhlIGBBUFBfQkFTRV9IUkVGYCBpZiB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyBpbiB1c2UuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgU3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgIEEgbm9ybWFsaXplZCBwbGF0Zm9ybS1zcGVjaWZpYyBVUkwuXG4gICAqL1xuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gIH1cblxuICAvLyBUT0RPOiByZW5hbWUgdGhpcyBtZXRob2QgdG8gcHVzaFN0YXRlXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VyJ3MgVVJMIHRvIGEgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIGEgZ2l2ZW4gVVJMLCBhbmQgcHVzaGVzIGFcbiAgICogbmV3IGl0ZW0gb250byB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCAgVVJMIHBhdGggdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqXG4gICAqL1xuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcidzIFVSTCB0byBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcmVwbGFjZXNcbiAgICogdGhlIHRvcCBpdGVtIG9uIHRoZSBwbGF0Zm9ybSdzIGhpc3Rvcnkgc3RhY2suXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoICBVUkwgcGF0aCB0byBub3JtYWxpemUuXG4gICAqIEBwYXJhbSBxdWVyeSBRdWVyeSBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gc3RhdGUgTG9jYXRpb24gaGlzdG9yeSBzdGF0ZS5cbiAgICovXG4gIHJlcGxhY2VTdGF0ZShwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgJycsIHBhdGgsIHF1ZXJ5KTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSkpLCBzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGZvcndhcmQgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdGhpcy5fbG9jYXRpb25TdHJhdGVneS5mb3J3YXJkKCk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGVzIGJhY2sgaW4gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICovXG4gIGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5fbG9jYXRpb25TdHJhdGVneS5iYWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGUgdG8gYSBzcGVjaWZpYyBwYWdlIGZyb20gc2Vzc2lvbiBoaXN0b3J5LCBpZGVudGlmaWVkIGJ5IGl0cyByZWxhdGl2ZSBwb3NpdGlvbiB0byB0aGVcbiAgICogY3VycmVudCBwYWdlLlxuICAgKlxuICAgKiBAcGFyYW0gcmVsYXRpdmVQb3NpdGlvbiAgUG9zaXRpb24gb2YgdGhlIHRhcmdldCBwYWdlIGluIHRoZSBoaXN0b3J5IHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50XG4gICAqICAgICBwYWdlLlxuICAgKiBBIG5lZ2F0aXZlIHZhbHVlIG1vdmVzIGJhY2t3YXJkcywgYSBwb3NpdGl2ZSB2YWx1ZSBtb3ZlcyBmb3J3YXJkcywgZS5nLiBgbG9jYXRpb24uaGlzdG9yeUdvKDIpYFxuICAgKiBtb3ZlcyBmb3J3YXJkIHR3byBwYWdlcyBhbmQgYGxvY2F0aW9uLmhpc3RvcnlHbygtMilgIG1vdmVzIGJhY2sgdHdvIHBhZ2VzLiBXaGVuIHdlIHRyeSB0byBnb1xuICAgKiBiZXlvbmQgd2hhdCdzIHN0b3JlZCBpbiB0aGUgaGlzdG9yeSBzZXNzaW9uLCB3ZSBzdGF5IGluIHRoZSBjdXJyZW50IHBhZ2UuIFNhbWUgYmVoYXZpb3VyIG9jY3Vyc1xuICAgKiB3aGVuIGByZWxhdGl2ZVBvc2l0aW9uYCBlcXVhbHMgMC5cbiAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSGlzdG9yeV9BUEkjTW92aW5nX3RvX2Ffc3BlY2lmaWNfcG9pbnRfaW5faGlzdG9yeVxuICAgKi9cbiAgaGlzdG9yeUdvKHJlbGF0aXZlUG9zaXRpb246IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICB0aGlzLl9sb2NhdGlvblN0cmF0ZWd5Lmhpc3RvcnlHbz8uKHJlbGF0aXZlUG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIFVSTCBjaGFuZ2UgbGlzdGVuZXIuIFVzZSB0byBjYXRjaCB1cGRhdGVzIHBlcmZvcm1lZCBieSB0aGUgQW5ndWxhclxuICAgKiBmcmFtZXdvcmsgdGhhdCBhcmUgbm90IGRldGVjdGlibGUgdGhyb3VnaCBcInBvcHN0YXRlXCIgb3IgXCJoYXNoY2hhbmdlXCIgZXZlbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gZm4gVGhlIGNoYW5nZSBoYW5kbGVyIGZ1bmN0aW9uLCB3aGljaCB0YWtlIGEgVVJMIGFuZCBhIGxvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBleGVjdXRlZCwgdW5yZWdpc3RlcnMgYSBVUkwgY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cbiAgb25VcmxDaGFuZ2UoZm46ICh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24pID0+IHZvaWQpOiBWb2lkRnVuY3Rpb24ge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5wdXNoKGZuKTtcblxuICAgIGlmICghdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZSh2ID0+IHtcbiAgICAgICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHYudXJsLCB2LnN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCBmbkluZGV4ID0gdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmluZGV4T2YoZm4pO1xuICAgICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLnNwbGljZShmbkluZGV4LCAxKTtcblxuICAgICAgaWYgKHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgICAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnModXJsOiBzdHJpbmcgPSAnJywgc3RhdGU6IHVua25vd24pIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaChmbiA9PiBmbih1cmwsIHN0YXRlKSk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyB0byB0aGUgcGxhdGZvcm0ncyBgcG9wU3RhdGVgIGV2ZW50cy5cbiAgICpcbiAgICogTm90ZTogYExvY2F0aW9uLmdvKClgIGRvZXMgbm90IHRyaWdnZXIgdGhlIGBwb3BTdGF0ZWAgZXZlbnQgaW4gdGhlIGJyb3dzZXIuIFVzZVxuICAgKiBgTG9jYXRpb24ub25VcmxDaGFuZ2UoKWAgdG8gc3Vic2NyaWJlIHRvIFVSTCBjaGFuZ2VzIGluc3RlYWQuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBFdmVudCB0aGF0IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBzdGF0ZSBoaXN0b3J5IGNoYW5nZXMuXG4gICAqIEBwYXJhbSBleGNlcHRpb24gVGhlIGV4Y2VwdGlvbiB0byB0aHJvdy5cbiAgICpcbiAgICogQHNlZSBbb25wb3BzdGF0ZV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvd0V2ZW50SGFuZGxlcnMvb25wb3BzdGF0ZSlcbiAgICpcbiAgICogQHJldHVybnMgU3Vic2NyaWJlZCBldmVudHMuXG4gICAqL1xuICBzdWJzY3JpYmUoXG4gICAgICBvbk5leHQ6ICh2YWx1ZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZCwgb25UaHJvdz86ICgoZXhjZXB0aW9uOiBhbnkpID0+IHZvaWQpfG51bGwsXG4gICAgICBvblJldHVybj86ICgoKSA9PiB2b2lkKXxudWxsKTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvblRocm93LCBjb21wbGV0ZTogb25SZXR1cm59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIFVSTCBwYXJhbWV0ZXJzIGJ5IHByZXBlbmRpbmcgd2l0aCBgP2AgaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gIHBhcmFtcyBTdHJpbmcgb2YgVVJMIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBwYXJhbWV0ZXJzIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplUXVlcnlQYXJhbXM6IChwYXJhbXM6IHN0cmluZykgPT4gc3RyaW5nID0gbm9ybWFsaXplUXVlcnlQYXJhbXM7XG5cbiAgLyoqXG4gICAqIEpvaW5zIHR3byBwYXJ0cyBvZiBhIFVSTCB3aXRoIGEgc2xhc2ggaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgIFVSTCBzdHJpbmdcbiAgICogQHBhcmFtIGVuZCAgICBVUkwgc3RyaW5nXG4gICAqXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBqb2luZWQgVVJMIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgam9pbldpdGhTbGFzaDogKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiBzdHJpbmcgPSBqb2luV2l0aFNsYXNoO1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgdHJhaWxpbmcgc2xhc2ggZnJvbSBhIFVSTCBzdHJpbmcgaWYgbmVlZGVkLlxuICAgKiBMb29rcyBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgZWl0aGVyIGAjYCwgYD9gLCBvciB0aGUgZW5kIG9mIHRoZVxuICAgKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFuZCByZW1vdmVzIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBvbmUgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFVSTCBzdHJpbmcuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBVUkwgc3RyaW5nLCBtb2RpZmllZCBpZiBuZWVkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHN0cmlwVHJhaWxpbmdTbGFzaDogKHVybDogc3RyaW5nKSA9PiBzdHJpbmcgPSBzdHJpcFRyYWlsaW5nU2xhc2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBMb2NhdGlvbijJtcm1aW5qZWN0KExvY2F0aW9uU3RyYXRlZ3kgYXMgYW55KSk7XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEJhc2VQYXRoKGJhc2VQYXRoOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFiYXNlUGF0aCB8fCAhdXJsLnN0YXJ0c1dpdGgoYmFzZVBhdGgpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuICBjb25zdCBzdHJpcHBlZFVybCA9IHVybC5zdWJzdHJpbmcoYmFzZVBhdGgubGVuZ3RoKTtcbiAgaWYgKHN0cmlwcGVkVXJsID09PSAnJyB8fCBbJy8nLCAnOycsICc/JywgJyMnXS5pbmNsdWRlcyhzdHJpcHBlZFVybFswXSkpIHtcbiAgICByZXR1cm4gc3RyaXBwZWRVcmw7XG4gIH1cbiAgcmV0dXJuIHVybDtcbn1cblxuZnVuY3Rpb24gX3N0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9pbmRleC5odG1sJC8sICcnKTtcbn1cblxuZnVuY3Rpb24gX3N0cmlwT3JpZ2luKGJhc2VIcmVmOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBETyBOT1QgUkVGQUNUT1IhIFByZXZpb3VzbHksIHRoaXMgY2hlY2sgbG9va2VkIGxpa2UgdGhpczpcbiAgLy8gYC9eKGh0dHBzPzopP1xcL1xcLy8udGVzdChiYXNlSHJlZilgLCBidXQgdGhhdCByZXN1bHRlZCBpblxuICAvLyBzeW50YWN0aWNhbGx5IGluY29ycmVjdCBjb2RlIGFmdGVyIENsb3N1cmUgQ29tcGlsZXIgbWluaWZpY2F0aW9uLlxuICAvLyBUaGlzIHdhcyBsaWtlbHkgY2F1c2VkIGJ5IGEgYnVnIGluIENsb3N1cmUgQ29tcGlsZXIsIGJ1dFxuICAvLyBmb3Igbm93LCB0aGUgY2hlY2sgaXMgcmV3cml0dGVuIHRvIHVzZSBgbmV3IFJlZ0V4cGAgaW5zdGVhZC5cbiAgY29uc3QgaXNBYnNvbHV0ZVVybCA9IChuZXcgUmVnRXhwKCdeKGh0dHBzPzopPy8vJykpLnRlc3QoYmFzZUhyZWYpO1xuICBpZiAoaXNBYnNvbHV0ZVVybCkge1xuICAgIGNvbnN0IFssIHBhdGhuYW1lXSA9IGJhc2VIcmVmLnNwbGl0KC9cXC9cXC9bXlxcL10rLyk7XG4gICAgcmV0dXJuIHBhdGhuYW1lO1xuICB9XG4gIHJldHVybiBiYXNlSHJlZjtcbn1cbiJdfQ==