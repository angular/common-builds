/**
 * @license Angular v20.3.33+sha-fc0e50a
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { inject, Injectable, InjectionToken, DOCUMENT, Optional, Inject, ɵɵinject as __inject } from '@angular/core';
import { Subject } from 'rxjs';
import { PlatformLocation } from './platform_location.mjs';

/**
 * Joins two parts of a URL with a slash if needed.
 *
 * @param start  URL string
 * @param end    URL string
 *
 *
 * @returns The joined URL string.
 */
function joinWithSlash(start, end) {
    // If `start` is an empty string, return `end` as the result.
    if (!start)
        return end;
    // If `end` is an empty string, return `start` as the result.
    if (!end)
        return start;
    // If `start` ends with a slash, remove the leading slash from `end`.
    if (start.endsWith('/')) {
        return end.startsWith('/') ? start + end.slice(1) : start + end;
    }
    // If `start` doesn't end with a slash, add one if `end` doesn't start with a slash.
    return end.startsWith('/') ? start + end : `${start}/${end}`;
}
/**
 * Removes a trailing slash from a URL string if needed.
 * Looks for the first occurrence of either `#`, `?`, or the end of the
 * line as `/` characters and removes the trailing slash if one exists.
 *
 * @param url URL string.
 *
 * @returns The URL string, modified if needed.
 */
function stripTrailingSlash(url) {
    // Find the index of the first occurrence of `#`, `?`, or the end of the string.
    // This marks the start of the query string, fragment, or the end of the URL path.
    const pathEndIdx = url.search(/#|\?|$/);
    // Check if the character before `pathEndIdx` is a trailing slash.
    // If it is, remove the trailing slash and return the modified URL.
    // Otherwise, return the URL as is.
    return url[pathEndIdx - 1] === '/' ? url.slice(0, pathEndIdx - 1) + url.slice(pathEndIdx) : url;
}
/**
 * Normalizes URL parameters by prepending with `?` if needed.
 *
 * @param  params String of URL parameters.
 *
 * @returns The normalized URL parameters string.
 */
function normalizeQueryParams(params) {
    return params && params[0] !== '?' ? `?${params}` : params;
}

/**
 * Enables the `Location` service to read route state from the browser's URL.
 * Angular provides two strategies:
 * `HashLocationStrategy` and `PathLocationStrategy`.
 *
 * Applications should use the `Router` or `Location` services to
 * interact with application route state.
 *
 * For instance, `HashLocationStrategy` produces URLs like
 * <code class="no-auto-link">http://example.com/#/foo</code>,
 * and `PathLocationStrategy` produces
 * <code class="no-auto-link">http://example.com/foo</code> as an equivalent URL.
 *
 * See these two classes for more.
 *
 * @publicApi
 */
class LocationStrategy {
    historyGo(relativePosition) {
        throw new Error(ngDevMode ? 'Not implemented' : '');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: LocationStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: LocationStrategy, providedIn: 'root', useFactory: () => inject(PathLocationStrategy) });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: LocationStrategy, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => inject(PathLocationStrategy) }]
        }] });
/**
 * A predefined DI token for the base href
 * to be used with the `PathLocationStrategy`.
 * The base href is the URL prefix that should be preserved when generating
 * and recognizing URLs.
 *
 * @usageNotes
 *
 * The following example shows how to use this token to configure the root app injector
 * with a base href value, so that the DI framework can supply the dependency anywhere in the app.
 *
 * ```ts
 * import {NgModule} from '@angular/core';
 * import {APP_BASE_HREF} from '@angular/common';
 *
 * @NgModule({
 *   providers: [{provide: APP_BASE_HREF, useValue: '/my/app'}]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
const APP_BASE_HREF = new InjectionToken(ngDevMode ? 'appBaseHref' : '');
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you may provide a {@link APP_BASE_HREF}
 * or add a `<base href>` element to the document to override the default.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app/'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`. To ensure all relative URIs resolve correctly,
 * the `<base href>` and/or `APP_BASE_HREF` should end with a `/`.
 *
 * Similarly, if you add `<base href='/my/app/'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Note that when using `PathLocationStrategy`, neither the query nor
 * the fragment in the `<base href>` will be preserved, as outlined
 * by the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2).
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
class PathLocationStrategy extends LocationStrategy {
    _platformLocation;
    _baseHref;
    _removeListenerFns = [];
    constructor(_platformLocation, href) {
        super();
        this._platformLocation = _platformLocation;
        this._baseHref =
            href ??
                this._platformLocation.getBaseHrefFromDOM() ??
                inject(DOCUMENT).location?.origin ??
                '';
    }
    /** @docs-private */
    ngOnDestroy() {
        while (this._removeListenerFns.length) {
            this._removeListenerFns.pop()();
        }
    }
    onPopState(fn) {
        this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
    }
    getBaseHref() {
        return this._baseHref;
    }
    prepareExternalUrl(internal) {
        return joinWithSlash(this._baseHref, internal);
    }
    path(includeHash = false) {
        const pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
        const hash = this._platformLocation.hash;
        return hash && includeHash ? `${pathname}${hash}` : pathname;
    }
    pushState(state, title, url, queryParams) {
        const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    }
    replaceState(state, title, url, queryParams) {
        const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.replaceState(state, title, externalUrl);
    }
    forward() {
        this._platformLocation.forward();
    }
    back() {
        this._platformLocation.back();
    }
    getState() {
        return this._platformLocation.getState();
    }
    historyGo(relativePosition = 0) {
        this._platformLocation.historyGo?.(relativePosition);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: PathLocationStrategy, deps: [{ token: PlatformLocation }, { token: APP_BASE_HREF, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: PathLocationStrategy, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: PathLocationStrategy, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: PlatformLocation }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [APP_BASE_HREF]
                }] }] });

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
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
class Location {
    /** @internal */
    _subject = new Subject();
    /** @internal */
    _basePath;
    /** @internal */
    _locationStrategy;
    /** @internal */
    _urlChangeListeners = [];
    /** @internal */
    _urlChangeSubscription = null;
    constructor(locationStrategy) {
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
            this._subject.next({
                'url': this.path(true),
                'pop': true,
                'state': ev.state,
                'type': ev.type,
            });
        });
    }
    /** @docs-private */
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
        this._urlChangeSubscription ??= this.subscribe((v) => {
            this._notifyUrlChangeListeners(v.url, v.state);
        });
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
        this._urlChangeListeners.forEach((fn) => fn(url, state));
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
        return this._subject.subscribe({
            next: onNext,
            error: onThrow ?? undefined,
            complete: onReturn ?? undefined,
        });
    }
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * @param  params String of URL parameters.
     *
     * @returns The normalized URL parameters string.
     */
    static normalizeQueryParams = normalizeQueryParams;
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @returns The joined URL string.
     */
    static joinWithSlash = joinWithSlash;
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string.
     *
     * @returns The URL string, modified if needed.
     */
    static stripTrailingSlash = stripTrailingSlash;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: Location, deps: [{ token: LocationStrategy }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: Location, providedIn: 'root', useFactory: createLocation });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33+sha-fc0e50a", ngImport: i0, type: Location, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                    // See #23917
                    useFactory: createLocation,
                }]
        }], ctorParameters: () => [{ type: LocationStrategy }] });
function createLocation() {
    return new Location(__inject(LocationStrategy));
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
    const isAbsoluteUrl = new RegExp('^(https?:)?//').test(baseHref);
    if (isAbsoluteUrl) {
        const [, pathname] = baseHref.split(/\/\/[^\/]+/);
        return pathname;
    }
    return baseHref;
}

export { APP_BASE_HREF, Location, LocationStrategy, PathLocationStrategy, joinWithSlash, normalizeQueryParams };
//# sourceMappingURL=location.mjs.map
