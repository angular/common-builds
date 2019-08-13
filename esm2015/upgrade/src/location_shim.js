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
import { deepEqual, isAnchor, isPromise } from './utils';
/** @type {?} */
const PATH_MATCH = /^([^?#]*)(\?([^#]*))?(#(.*))?$/;
/** @type {?} */
const DOUBLE_SLASH_REGEX = /^\s*[\\/]{2,}/;
/** @type {?} */
const IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i;
/** @type {?} */
const DEFAULT_PORTS = {
    'http:': 80,
    'https:': 443,
    'ftp:': 21
};
/**
 * Location service that provides a drop-in replacement for the $location service
 * provided in AngularJS.
 *
 * @see [Using the Angular Unified Location Service](guide/upgrade#using-the-unified-angular-location-service)
 *
 * \@publicApi
 */
export class $locationShim {
    /**
     * @param {?} $injector
     * @param {?} location
     * @param {?} platformLocation
     * @param {?} urlCodec
     * @param {?} locationStrategy
     */
    constructor($injector, location, platformLocation, urlCodec, locationStrategy) {
        this.location = location;
        this.platformLocation = platformLocation;
        this.urlCodec = urlCodec;
        this.locationStrategy = locationStrategy;
        this.initalizing = true;
        this.updateBrowser = false;
        this.$$absUrl = '';
        this.$$url = '';
        this.$$host = '';
        this.$$replace = false;
        this.$$path = '';
        this.$$search = '';
        this.$$hash = '';
        this.$$changeListeners = [];
        this.cachedState = null;
        this.lastBrowserUrl = '';
        // This variable should be used *only* inside the cacheState function.
        this.lastCachedState = null;
        /** @type {?} */
        const initialUrl = this.browserUrl();
        /** @type {?} */
        let parsedUrl = this.urlCodec.parse(initialUrl);
        if (typeof parsedUrl === 'string') {
            throw 'Invalid URL';
        }
        this.$$protocol = parsedUrl.protocol;
        this.$$host = parsedUrl.hostname;
        this.$$port = parseInt(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null;
        this.$$parseLinkUrl(initialUrl, initialUrl);
        this.cacheState();
        this.$$state = this.browserState();
        if (isPromise($injector)) {
            $injector.then((/**
             * @param {?} $i
             * @return {?}
             */
            $i => this.initialize($i)));
        }
        else {
            this.initialize($injector);
        }
    }
    /**
     * @private
     * @param {?} $injector
     * @return {?}
     */
    initialize($injector) {
        /** @type {?} */
        const $rootScope = $injector.get('$rootScope');
        /** @type {?} */
        const $rootElement = $injector.get('$rootElement');
        $rootElement.on('click', (/**
         * @param {?} event
         * @return {?}
         */
        (event) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.which === 2 ||
                event.button === 2) {
                return;
            }
            /** @type {?} */
            let elm = event.target;
            // traverse the DOM up to find first A tag
            while (elm && elm.nodeName.toLowerCase() !== 'a') {
                // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
                if (elm === $rootElement[0] || !(elm = elm.parentNode)) {
                    return;
                }
            }
            if (!isAnchor(elm)) {
                return;
            }
            /** @type {?} */
            const absHref = elm.href;
            /** @type {?} */
            const relHref = elm.getAttribute('href');
            // Ignore when url is started with javascript: or mailto:
            if (IGNORE_URI_REGEXP.test(absHref)) {
                return;
            }
            if (absHref && !elm.getAttribute('target') && !event.isDefaultPrevented()) {
                if (this.$$parseLinkUrl(absHref, relHref)) {
                    // We do a preventDefault for all urls that are part of the AngularJS application,
                    // in html5mode and also without, so that we are able to abort navigation without
                    // getting double entries in the location history.
                    event.preventDefault();
                    // update location manually
                    if (this.absUrl() !== this.browserUrl()) {
                        $rootScope.$apply();
                    }
                }
            }
        }));
        this.location.onUrlChange((/**
         * @param {?} newUrl
         * @param {?} newState
         * @return {?}
         */
        (newUrl, newState) => {
            /** @type {?} */
            let oldUrl = this.absUrl();
            /** @type {?} */
            let oldState = this.$$state;
            this.$$parse(newUrl);
            newUrl = this.absUrl();
            this.$$state = newState;
            /** @type {?} */
            const defaultPrevented = $rootScope.$broadcast('$locationChangeStart', newUrl, oldUrl, newState, oldState)
                .defaultPrevented;
            // if the location was changed by a `$locationChangeStart` handler then stop
            // processing this location change
            if (this.absUrl() !== newUrl)
                return;
            // If default was prevented, set back to old state. This is the state that was locally
            // cached in the $location service.
            if (defaultPrevented) {
                this.$$parse(oldUrl);
                this.state(oldState);
                this.setBrowserUrlWithFallback(oldUrl, false, oldState);
                this.$$notifyChangeListeners(this.url(), this.$$state, oldUrl, oldState);
            }
            else {
                this.initalizing = false;
                $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, newState, oldState);
                this.resetBrowserUpdate();
            }
            if (!$rootScope.$$phase) {
                $rootScope.$digest();
            }
        }));
        // update browser
        $rootScope.$watch((/**
         * @return {?}
         */
        () => {
            if (this.initalizing || this.updateBrowser) {
                this.updateBrowser = false;
                /** @type {?} */
                const oldUrl = this.browserUrl();
                /** @type {?} */
                const newUrl = this.absUrl();
                /** @type {?} */
                const oldState = this.browserState();
                /** @type {?} */
                let currentReplace = this.$$replace;
                /** @type {?} */
                const urlOrStateChanged = !this.urlCodec.areEqual(oldUrl, newUrl) || oldState !== this.$$state;
                // Fire location changes one time to on initialization. This must be done on the
                // next tick (thus inside $evalAsync()) in order for listeners to be registered
                // before the event fires. Mimicing behavior from $locationWatch:
                // https://github.com/angular/angular.js/blob/master/src/ng/location.js#L983
                if (this.initalizing || urlOrStateChanged) {
                    this.initalizing = false;
                    $rootScope.$evalAsync((/**
                     * @return {?}
                     */
                    () => {
                        // Get the new URL again since it could have changed due to async update
                        /** @type {?} */
                        const newUrl = this.absUrl();
                        /** @type {?} */
                        const defaultPrevented = $rootScope
                            .$broadcast('$locationChangeStart', newUrl, oldUrl, this.$$state, oldState)
                            .defaultPrevented;
                        // if the location was changed by a `$locationChangeStart` handler then stop
                        // processing this location change
                        if (this.absUrl() !== newUrl)
                            return;
                        if (defaultPrevented) {
                            this.$$parse(oldUrl);
                            this.$$state = oldState;
                        }
                        else {
                            // This block doesn't run when initalizing because it's going to perform the update to
                            // the URL which shouldn't be needed when initalizing.
                            if (urlOrStateChanged) {
                                this.setBrowserUrlWithFallback(newUrl, currentReplace, oldState === this.$$state ? null : this.$$state);
                                this.$$replace = false;
                            }
                            $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, this.$$state, oldState);
                            if (urlOrStateChanged) {
                                this.$$notifyChangeListeners(this.url(), this.$$state, oldUrl, oldState);
                            }
                        }
                    }));
                }
            }
            this.$$replace = false;
        }));
    }
    /**
     * @private
     * @return {?}
     */
    resetBrowserUpdate() {
        this.$$replace = false;
        this.$$state = this.browserState();
        this.updateBrowser = false;
        this.lastBrowserUrl = this.browserUrl();
    }
    /**
     * @private
     * @param {?=} url
     * @param {?=} replace
     * @param {?=} state
     * @return {?}
     */
    browserUrl(url, replace, state) {
        // In modern browsers `history.state` is `null` by default; treating it separately
        // from `undefined` would cause `$browser.url('/foo')` to change `history.state`
        // to undefined via `pushState`. Instead, let's change `undefined` to `null` here.
        if (typeof state === 'undefined') {
            state = null;
        }
        // setter
        if (url) {
            /** @type {?} */
            let sameState = this.lastHistoryState === state;
            // Normalize the inputted URL
            url = this.urlCodec.parse(url).href;
            // Don't change anything if previous and current URLs and states match.
            if (this.lastBrowserUrl === url && sameState) {
                return this;
            }
            this.lastBrowserUrl = url;
            this.lastHistoryState = state;
            // Remove server base from URL as the Angular APIs for updating URL require
            // it to be the path+.
            url = this.stripBaseUrl(this.getServerBase(), url) || url;
            // Set the URL
            if (replace) {
                this.locationStrategy.replaceState(state, '', url, '');
            }
            else {
                this.locationStrategy.pushState(state, '', url, '');
            }
            this.cacheState();
            return this;
            // getter
        }
        else {
            return this.platformLocation.href;
        }
    }
    /**
     * @private
     * @return {?}
     */
    cacheState() {
        // This should be the only place in $browser where `history.state` is read.
        this.cachedState = this.platformLocation.getState();
        if (typeof this.cachedState === 'undefined') {
            this.cachedState = null;
        }
        // Prevent callbacks fo fire twice if both hashchange & popstate were fired.
        if (deepEqual(this.cachedState, this.lastCachedState)) {
            this.cachedState = this.lastCachedState;
        }
        this.lastCachedState = this.cachedState;
        this.lastHistoryState = this.cachedState;
    }
    /**
     * This function emulates the $browser.state() function from AngularJS. It will cause
     * history.state to be cached unless changed with deep equality check.
     * @private
     * @return {?}
     */
    browserState() { return this.cachedState; }
    /**
     * @private
     * @param {?} base
     * @param {?} url
     * @return {?}
     */
    stripBaseUrl(base, url) {
        if (url.startsWith(base)) {
            return url.substr(base.length);
        }
        return undefined;
    }
    /**
     * @private
     * @return {?}
     */
    getServerBase() {
        const { protocol, hostname, port } = this.platformLocation;
        /** @type {?} */
        const baseHref = this.locationStrategy.getBaseHref();
        /** @type {?} */
        let url = `${protocol}//${hostname}${port ? ':' + port : ''}${baseHref || '/'}`;
        return url.endsWith('/') ? url : url + '/';
    }
    /**
     * @private
     * @param {?} url
     * @return {?}
     */
    parseAppUrl(url) {
        if (DOUBLE_SLASH_REGEX.test(url)) {
            throw new Error(`Bad Path - URL cannot start with double slashes: ${url}`);
        }
        /** @type {?} */
        let prefixed = (url.charAt(0) !== '/');
        if (prefixed) {
            url = '/' + url;
        }
        /** @type {?} */
        let match = this.urlCodec.parse(url, this.getServerBase());
        if (typeof match === 'string') {
            throw new Error(`Bad URL - Cannot parse URL: ${url}`);
        }
        /** @type {?} */
        let path = prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname;
        this.$$path = this.urlCodec.decodePath(path);
        this.$$search = this.urlCodec.decodeSearch(match.search);
        this.$$hash = this.urlCodec.decodeHash(match.hash);
        // make sure path starts with '/';
        if (this.$$path && this.$$path.charAt(0) !== '/') {
            this.$$path = '/' + this.$$path;
        }
    }
    /**
     * Registers listeners for URL changes. This API is used to catch updates performed by the
     * AngularJS framework. These changes are a subset of the `$locationChangeStart` and
     * `$locationChangeSuccess` events which fire when AngularJS updates its internally-referenced
     * version of the browser URL.
     *
     * It's possible for `$locationChange` events to happen, but for the browser URL
     * (window.location) to remain unchanged. This `onChange` callback will fire only when AngularJS
     * actually updates the browser URL (window.location).
     *
     * @param {?} fn The callback function that is triggered for the listener when the URL changes.
     * @param {?=} err The callback function that is triggered when an error occurs.
     * @return {?}
     */
    onChange(fn, err = (/**
     * @param {?} e
     * @return {?}
     */
    (e) => { })) {
        this.$$changeListeners.push([fn, err]);
    }
    /**
     * \@internal
     * @param {?=} url
     * @param {?=} state
     * @param {?=} oldUrl
     * @param {?=} oldState
     * @return {?}
     */
    $$notifyChangeListeners(url = '', state, oldUrl = '', oldState) {
        this.$$changeListeners.forEach((/**
         * @param {?} __0
         * @return {?}
         */
        ([fn, err]) => {
            try {
                fn(url, state, oldUrl, oldState);
            }
            catch (e) {
                err(e);
            }
        }));
    }
    /**
     * Parses the provided URL, and sets the current URL to the parsed result.
     *
     * @param {?} url The URL string.
     * @return {?}
     */
    $$parse(url) {
        /** @type {?} */
        let pathUrl;
        if (url.startsWith('/')) {
            pathUrl = url;
        }
        else {
            // Remove protocol & hostname if URL starts with it
            pathUrl = this.stripBaseUrl(this.getServerBase(), url);
        }
        if (typeof pathUrl === 'undefined') {
            throw new Error(`Invalid url "${url}", missing path prefix "${this.getServerBase()}".`);
        }
        this.parseAppUrl(pathUrl);
        if (!this.$$path) {
            this.$$path = '/';
        }
        this.composeUrls();
    }
    /**
     * Parses the provided URL and its relative URL.
     *
     * @param {?} url The full URL string.
     * @param {?=} relHref A URL string relative to the full URL string.
     * @return {?}
     */
    $$parseLinkUrl(url, relHref) {
        // When relHref is passed, it should be a hash and is handled separately
        if (relHref && relHref[0] === '#') {
            this.hash(relHref.slice(1));
            return true;
        }
        /** @type {?} */
        let rewrittenUrl;
        /** @type {?} */
        let appUrl = this.stripBaseUrl(this.getServerBase(), url);
        if (typeof appUrl !== 'undefined') {
            rewrittenUrl = this.getServerBase() + appUrl;
        }
        else if (this.getServerBase() === url + '/') {
            rewrittenUrl = this.getServerBase();
        }
        // Set the URL
        if (rewrittenUrl) {
            this.$$parse(rewrittenUrl);
        }
        return !!rewrittenUrl;
    }
    /**
     * @private
     * @param {?} url
     * @param {?} replace
     * @param {?} state
     * @return {?}
     */
    setBrowserUrlWithFallback(url, replace, state) {
        /** @type {?} */
        const oldUrl = this.url();
        /** @type {?} */
        const oldState = this.$$state;
        try {
            this.browserUrl(url, replace, state);
            // Make sure $location.state() returns referentially identical (not just deeply equal)
            // state object; this makes possible quick checking if the state changed in the digest
            // loop. Checking deep equality would be too expensive.
            this.$$state = this.browserState();
        }
        catch (e) {
            // Restore old values if pushState fails
            this.url(oldUrl);
            this.$$state = oldState;
            throw e;
        }
    }
    /**
     * @private
     * @return {?}
     */
    composeUrls() {
        this.$$url = this.urlCodec.normalize(this.$$path, this.$$search, this.$$hash);
        this.$$absUrl = this.getServerBase() + this.$$url.substr(1); // remove '/' from front of URL
        this.updateBrowser = true;
    }
    /**
     * Retrieves the full URL representation with all segments encoded according to
     * rules specified in
     * [RFC 3986](http://www.ietf.org/rfc/rfc3986.txt).
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let absUrl = $location.absUrl();
     * // => "http://example.com/#/some/path?foo=bar&baz=xoxo"
     * ```
     * @return {?}
     */
    absUrl() { return this.$$absUrl; }
    /**
     * @param {?=} url
     * @return {?}
     */
    url(url) {
        if (typeof url === 'string') {
            if (!url.length) {
                url = '/';
            }
            /** @type {?} */
            const match = PATH_MATCH.exec(url);
            if (!match)
                return this;
            if (match[1] || url === '')
                this.path(this.urlCodec.decodePath(match[1]));
            if (match[2] || match[1] || url === '')
                this.search(match[3] || '');
            this.hash(match[5] || '');
            // Chainable method
            return this;
        }
        return this.$$url;
    }
    /**
     * Retrieves the protocol of the current URL.
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let protocol = $location.protocol();
     * // => "http"
     * ```
     * @return {?}
     */
    protocol() { return this.$$protocol; }
    /**
     * Retrieves the protocol of the current URL.
     *
     * In contrast to the non-AngularJS version `location.host` which returns `hostname:port`, this
     * returns the `hostname` portion only.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let host = $location.host();
     * // => "example.com"
     *
     * // given URL http://user:password\@example.com:8080/#/some/path?foo=bar&baz=xoxo
     * host = $location.host();
     * // => "example.com"
     * host = location.host;
     * // => "example.com:8080"
     * ```
     * @return {?}
     */
    host() { return this.$$host; }
    /**
     * Retrieves the port of the current URL.
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let port = $location.port();
     * // => 80
     * ```
     * @return {?}
     */
    port() { return this.$$port; }
    /**
     * @param {?=} path
     * @return {?}
     */
    path(path) {
        if (typeof path === 'undefined') {
            return this.$$path;
        }
        // null path converts to empty string. Prepend with "/" if needed.
        path = path !== null ? path.toString() : '';
        path = path.charAt(0) === '/' ? path : '/' + path;
        this.$$path = path;
        this.composeUrls();
        return this;
    }
    /**
     * @param {?=} search
     * @param {?=} paramValue
     * @return {?}
     */
    search(search, paramValue) {
        switch (arguments.length) {
            case 0:
                return this.$$search;
            case 1:
                if (typeof search === 'string' || typeof search === 'number') {
                    this.$$search = this.urlCodec.decodeSearch(search.toString());
                }
                else if (typeof search === 'object' && search !== null) {
                    // Copy the object so it's never mutated
                    search = Object.assign({}, search);
                    // remove object undefined or null properties
                    for (const key in search) {
                        if (search[key] == null)
                            delete search[key];
                    }
                    this.$$search = search;
                }
                else {
                    throw new Error('LocationProvider.search(): First argument must be a string or an object.');
                }
                break;
            default:
                if (typeof search === 'string') {
                    /** @type {?} */
                    const currentSearch = this.search();
                    if (typeof paramValue === 'undefined' || paramValue === null) {
                        delete currentSearch[search];
                        return this.search(currentSearch);
                    }
                    else {
                        currentSearch[search] = paramValue;
                        return this.search(currentSearch);
                    }
                }
        }
        this.composeUrls();
        return this;
    }
    /**
     * @param {?=} hash
     * @return {?}
     */
    hash(hash) {
        if (typeof hash === 'undefined') {
            return this.$$hash;
        }
        this.$$hash = hash !== null ? hash.toString() : '';
        this.composeUrls();
        return this;
    }
    /**
     * Changes to `$location` during the current `$digest` will replace the current
     * history record, instead of adding a new one.
     * @template THIS
     * @this {THIS}
     * @return {THIS}
     */
    replace() {
        (/** @type {?} */ (this)).$$replace = true;
        return (/** @type {?} */ (this));
    }
    /**
     * @param {?=} state
     * @return {?}
     */
    state(state) {
        if (typeof state === 'undefined') {
            return this.$$state;
        }
        this.$$state = state;
        return this;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.initalizing;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.updateBrowser;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$absUrl;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$url;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$protocol;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$host;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$port;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$replace;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$path;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$search;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$hash;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$state;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.$$changeListeners;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.cachedState;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.lastHistoryState;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.lastBrowserUrl;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.lastCachedState;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.location;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.platformLocation;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.urlCodec;
    /**
     * @type {?}
     * @private
     */
    $locationShim.prototype.locationStrategy;
}
/**
 * The factory function used to create an instance of the `$locationShim` in Angular,
 * and provides an API-compatiable `$locationProvider` for AngularJS.
 *
 * \@publicApi
 */
export class $locationShimProvider {
    /**
     * @param {?} ngUpgrade
     * @param {?} location
     * @param {?} platformLocation
     * @param {?} urlCodec
     * @param {?} locationStrategy
     */
    constructor(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
        this.ngUpgrade = ngUpgrade;
        this.location = location;
        this.platformLocation = platformLocation;
        this.urlCodec = urlCodec;
        this.locationStrategy = locationStrategy;
    }
    /**
     * Factory method that returns an instance of the $locationShim
     * @return {?}
     */
    $get() {
        return new $locationShim(this.ngUpgrade.$injector, this.location, this.platformLocation, this.urlCodec, this.locationStrategy);
    }
    /**
     * Stub method used to keep API compatible with AngularJS. This setting is configured through
     * the LocationUpgradeModule's `config` method in your Angular app.
     * @param {?=} prefix
     * @return {?}
     */
    hashPrefix(prefix) {
        throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
    }
    /**
     * Stub method used to keep API compatible with AngularJS. This setting is configured through
     * the LocationUpgradeModule's `config` method in your Angular app.
     * @param {?=} mode
     * @return {?}
     */
    html5Mode(mode) {
        throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    $locationShimProvider.prototype.ngUpgrade;
    /**
     * @type {?}
     * @private
     */
    $locationShimProvider.prototype.location;
    /**
     * @type {?}
     * @private
     */
    $locationShimProvider.prototype.platformLocation;
    /**
     * @type {?}
     * @private
     */
    $locationShimProvider.prototype.urlCodec;
    /**
     * @type {?}
     * @private
     */
    $locationShimProvider.prototype.locationStrategy;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc2hpbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi91cGdyYWRlL3NyYy9sb2NhdGlvbl9zaGltLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBWUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDOztNQUVqRCxVQUFVLEdBQUcsZ0NBQWdDOztNQUM3QyxrQkFBa0IsR0FBRyxlQUFlOztNQUNwQyxpQkFBaUIsR0FBRywyQkFBMkI7O01BQy9DLGFBQWEsR0FBNEI7SUFDN0MsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsR0FBRztJQUNiLE1BQU0sRUFBRSxFQUFFO0NBQ1g7Ozs7Ozs7OztBQVVELE1BQU0sT0FBTyxhQUFhOzs7Ozs7OztJQXVCeEIsWUFDSSxTQUFjLEVBQVUsUUFBa0IsRUFBVSxnQkFBa0MsRUFDOUUsUUFBa0IsRUFBVSxnQkFBa0M7UUFEOUMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDOUUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUF4QmxFLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUVuQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBRXBCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixhQUFRLEdBQVEsRUFBRSxDQUFDO1FBQ25CLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFFcEIsc0JBQWlCLEdBSW5CLEVBQUUsQ0FBQztRQUVELGdCQUFXLEdBQVksSUFBSSxDQUFDO1FBMks1Qixt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SUFBSSxLQUFLLENBQUMsd0VBQXdFLENBQUMsQ0FBQztJQUM1RixDQUFDOzs7Ozs7O0lBTUQsU0FBUyxDQUFDLElBQVU7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDO0lBQzVGLENBQUM7Q0FDRjs7Ozs7O0lBNUJLLDBDQUFnQzs7Ozs7SUFBRSx5Q0FBMEI7Ozs7O0lBQzVELGlEQUEwQzs7Ozs7SUFBRSx5Q0FBMEI7Ozs7O0lBQ3RFLGlEQUEwQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvbiwgTG9jYXRpb25TdHJhdGVneSwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG5pbXBvcnQge1VybENvZGVjfSBmcm9tICcuL3BhcmFtcyc7XG5pbXBvcnQge2RlZXBFcXVhbCwgaXNBbmNob3IsIGlzUHJvbWlzZX0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IFBBVEhfTUFUQ0ggPSAvXihbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/JC87XG5jb25zdCBET1VCTEVfU0xBU0hfUkVHRVggPSAvXlxccypbXFxcXC9dezIsfS87XG5jb25zdCBJR05PUkVfVVJJX1JFR0VYUCA9IC9eXFxzKihqYXZhc2NyaXB0fG1haWx0byk6L2k7XG5jb25zdCBERUZBVUxUX1BPUlRTOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSA9IHtcbiAgJ2h0dHA6JzogODAsXG4gICdodHRwczonOiA0NDMsXG4gICdmdHA6JzogMjFcbn07XG5cbi8qKlxuICogTG9jYXRpb24gc2VydmljZSB0aGF0IHByb3ZpZGVzIGEgZHJvcC1pbiByZXBsYWNlbWVudCBmb3IgdGhlICRsb2NhdGlvbiBzZXJ2aWNlXG4gKiBwcm92aWRlZCBpbiBBbmd1bGFySlMuXG4gKlxuICogQHNlZSBbVXNpbmcgdGhlIEFuZ3VsYXIgVW5pZmllZCBMb2NhdGlvbiBTZXJ2aWNlXShndWlkZS91cGdyYWRlI3VzaW5nLXRoZS11bmlmaWVkLWFuZ3VsYXItbG9jYXRpb24tc2VydmljZSlcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyAkbG9jYXRpb25TaGltIHtcbiAgcHJpdmF0ZSBpbml0YWxpemluZyA9IHRydWU7XG4gIHByaXZhdGUgdXBkYXRlQnJvd3NlciA9IGZhbHNlO1xuICBwcml2YXRlICQkYWJzVXJsOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHVybDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRwcm90b2NvbDogc3RyaW5nO1xuICBwcml2YXRlICQkaG9zdDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRwb3J0OiBudW1iZXJ8bnVsbDtcbiAgcHJpdmF0ZSAkJHJlcGxhY2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSAkJHBhdGg6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlICQkc2VhcmNoOiBhbnkgPSAnJztcbiAgcHJpdmF0ZSAkJGhhc2g6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlICQkc3RhdGU6IHVua25vd247XG4gIHByaXZhdGUgJCRjaGFuZ2VMaXN0ZW5lcnM6IFtcbiAgICAoKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93biwgb2xkVXJsOiBzdHJpbmcsIG9sZFN0YXRlOiB1bmtub3duLCBlcnI/OiAoZTogRXJyb3IpID0+IHZvaWQpID0+XG4gICAgICAgICB2b2lkKSxcbiAgICAoZTogRXJyb3IpID0+IHZvaWRcbiAgXVtdID0gW107XG5cbiAgcHJpdmF0ZSBjYWNoZWRTdGF0ZTogdW5rbm93biA9IG51bGw7XG5cblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgJGluamVjdG9yOiBhbnksIHByaXZhdGUgbG9jYXRpb246IExvY2F0aW9uLCBwcml2YXRlIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgICBwcml2YXRlIHVybENvZGVjOiBVcmxDb2RlYywgcHJpdmF0ZSBsb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gICAgY29uc3QgaW5pdGlhbFVybCA9IHRoaXMuYnJvd3NlclVybCgpO1xuXG4gICAgbGV0IHBhcnNlZFVybCA9IHRoaXMudXJsQ29kZWMucGFyc2UoaW5pdGlhbFVybCk7XG5cbiAgICBpZiAodHlwZW9mIHBhcnNlZFVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93ICdJbnZhbGlkIFVSTCc7XG4gICAgfVxuXG4gICAgdGhpcy4kJHByb3RvY29sID0gcGFyc2VkVXJsLnByb3RvY29sO1xuICAgIHRoaXMuJCRob3N0ID0gcGFyc2VkVXJsLmhvc3RuYW1lO1xuICAgIHRoaXMuJCRwb3J0ID0gcGFyc2VJbnQocGFyc2VkVXJsLnBvcnQpIHx8IERFRkFVTFRfUE9SVFNbcGFyc2VkVXJsLnByb3RvY29sXSB8fCBudWxsO1xuXG4gICAgdGhpcy4kJHBhcnNlTGlua1VybChpbml0aWFsVXJsLCBpbml0aWFsVXJsKTtcbiAgICB0aGlzLmNhY2hlU3RhdGUoKTtcbiAgICB0aGlzLiQkc3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuXG4gICAgaWYgKGlzUHJvbWlzZSgkaW5qZWN0b3IpKSB7XG4gICAgICAkaW5qZWN0b3IudGhlbigkaSA9PiB0aGlzLmluaXRpYWxpemUoJGkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbml0aWFsaXplKCRpbmplY3Rvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplKCRpbmplY3RvcjogYW55KSB7XG4gICAgY29uc3QgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcbiAgICBjb25zdCAkcm9vdEVsZW1lbnQgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdEVsZW1lbnQnKTtcblxuICAgICRyb290RWxlbWVudC5vbignY2xpY2snLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5zaGlmdEtleSB8fCBldmVudC53aGljaCA9PT0gMiB8fFxuICAgICAgICAgIGV2ZW50LmJ1dHRvbiA9PT0gMikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBlbG06IChOb2RlICYgUGFyZW50Tm9kZSl8bnVsbCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgLy8gdHJhdmVyc2UgdGhlIERPTSB1cCB0byBmaW5kIGZpcnN0IEEgdGFnXG4gICAgICB3aGlsZSAoZWxtICYmIGVsbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnYScpIHtcbiAgICAgICAgLy8gaWdub3JlIHJld3JpdGluZyBpZiBubyBBIHRhZyAocmVhY2hlZCByb290IGVsZW1lbnQsIG9yIG5vIHBhcmVudCAtIHJlbW92ZWQgZnJvbSBkb2N1bWVudClcbiAgICAgICAgaWYgKGVsbSA9PT0gJHJvb3RFbGVtZW50WzBdIHx8ICEoZWxtID0gZWxtLnBhcmVudE5vZGUpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNBbmNob3IoZWxtKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFic0hyZWYgPSBlbG0uaHJlZjtcbiAgICAgIGNvbnN0IHJlbEhyZWYgPSBlbG0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgIC8vIElnbm9yZSB3aGVuIHVybCBpcyBzdGFydGVkIHdpdGggamF2YXNjcmlwdDogb3IgbWFpbHRvOlxuICAgICAgaWYgKElHTk9SRV9VUklfUkVHRVhQLnRlc3QoYWJzSHJlZikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWJzSHJlZiAmJiAhZWxtLmdldEF0dHJpYnV0ZSgndGFyZ2V0JykgJiYgIWV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLiQkcGFyc2VMaW5rVXJsKGFic0hyZWYsIHJlbEhyZWYpKSB7XG4gICAgICAgICAgLy8gV2UgZG8gYSBwcmV2ZW50RGVmYXVsdCBmb3IgYWxsIHVybHMgdGhhdCBhcmUgcGFydCBvZiB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uLFxuICAgICAgICAgIC8vIGluIGh0bWw1bW9kZSBhbmQgYWxzbyB3aXRob3V0LCBzbyB0aGF0IHdlIGFyZSBhYmxlIHRvIGFib3J0IG5hdmlnYXRpb24gd2l0aG91dFxuICAgICAgICAgIC8vIGdldHRpbmcgZG91YmxlIGVudHJpZXMgaW4gdGhlIGxvY2F0aW9uIGhpc3RvcnkuXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAvLyB1cGRhdGUgbG9jYXRpb24gbWFudWFsbHlcbiAgICAgICAgICBpZiAodGhpcy5hYnNVcmwoKSAhPT0gdGhpcy5icm93c2VyVXJsKCkpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvY2F0aW9uLm9uVXJsQ2hhbmdlKChuZXdVcmwsIG5ld1N0YXRlKSA9PiB7XG4gICAgICBsZXQgb2xkVXJsID0gdGhpcy5hYnNVcmwoKTtcbiAgICAgIGxldCBvbGRTdGF0ZSA9IHRoaXMuJCRzdGF0ZTtcbiAgICAgIHRoaXMuJCRwYXJzZShuZXdVcmwpO1xuICAgICAgbmV3VXJsID0gdGhpcy5hYnNVcmwoKTtcbiAgICAgIHRoaXMuJCRzdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgY29uc3QgZGVmYXVsdFByZXZlbnRlZCA9XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIG5ld1VybCwgb2xkVXJsLCBuZXdTdGF0ZSwgb2xkU3RhdGUpXG4gICAgICAgICAgICAgIC5kZWZhdWx0UHJldmVudGVkO1xuXG4gICAgICAvLyBpZiB0aGUgbG9jYXRpb24gd2FzIGNoYW5nZWQgYnkgYSBgJGxvY2F0aW9uQ2hhbmdlU3RhcnRgIGhhbmRsZXIgdGhlbiBzdG9wXG4gICAgICAvLyBwcm9jZXNzaW5nIHRoaXMgbG9jYXRpb24gY2hhbmdlXG4gICAgICBpZiAodGhpcy5hYnNVcmwoKSAhPT0gbmV3VXJsKSByZXR1cm47XG5cbiAgICAgIC8vIElmIGRlZmF1bHQgd2FzIHByZXZlbnRlZCwgc2V0IGJhY2sgdG8gb2xkIHN0YXRlLiBUaGlzIGlzIHRoZSBzdGF0ZSB0aGF0IHdhcyBsb2NhbGx5XG4gICAgICAvLyBjYWNoZWQgaW4gdGhlICRsb2NhdGlvbiBzZXJ2aWNlLlxuICAgICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgdGhpcy4kJHBhcnNlKG9sZFVybCk7XG4gICAgICAgIHRoaXMuc3RhdGUob2xkU3RhdGUpO1xuICAgICAgICB0aGlzLnNldEJyb3dzZXJVcmxXaXRoRmFsbGJhY2sob2xkVXJsLCBmYWxzZSwgb2xkU3RhdGUpO1xuICAgICAgICB0aGlzLiQkbm90aWZ5Q2hhbmdlTGlzdGVuZXJzKHRoaXMudXJsKCksIHRoaXMuJCRzdGF0ZSwgb2xkVXJsLCBvbGRTdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluaXRhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIG5ld1VybCwgb2xkVXJsLCBuZXdTdGF0ZSwgb2xkU3RhdGUpO1xuICAgICAgICB0aGlzLnJlc2V0QnJvd3NlclVwZGF0ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcbiAgICAgICAgJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB1cGRhdGUgYnJvd3NlclxuICAgICRyb290U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmluaXRhbGl6aW5nIHx8IHRoaXMudXBkYXRlQnJvd3Nlcikge1xuICAgICAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBvbGRVcmwgPSB0aGlzLmJyb3dzZXJVcmwoKTtcbiAgICAgICAgY29uc3QgbmV3VXJsID0gdGhpcy5hYnNVcmwoKTtcbiAgICAgICAgY29uc3Qgb2xkU3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuICAgICAgICBsZXQgY3VycmVudFJlcGxhY2UgPSB0aGlzLiQkcmVwbGFjZTtcblxuICAgICAgICBjb25zdCB1cmxPclN0YXRlQ2hhbmdlZCA9XG4gICAgICAgICAgICAhdGhpcy51cmxDb2RlYy5hcmVFcXVhbChvbGRVcmwsIG5ld1VybCkgfHwgb2xkU3RhdGUgIT09IHRoaXMuJCRzdGF0ZTtcblxuICAgICAgICAvLyBGaXJlIGxvY2F0aW9uIGNoYW5nZXMgb25lIHRpbWUgdG8gb24gaW5pdGlhbGl6YXRpb24uIFRoaXMgbXVzdCBiZSBkb25lIG9uIHRoZVxuICAgICAgICAvLyBuZXh0IHRpY2sgKHRodXMgaW5zaWRlICRldmFsQXN5bmMoKSkgaW4gb3JkZXIgZm9yIGxpc3RlbmVycyB0byBiZSByZWdpc3RlcmVkXG4gICAgICAgIC8vIGJlZm9yZSB0aGUgZXZlbnQgZmlyZXMuIE1pbWljaW5nIGJlaGF2aW9yIGZyb20gJGxvY2F0aW9uV2F0Y2g6XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi9tYXN0ZXIvc3JjL25nL2xvY2F0aW9uLmpzI0w5ODNcbiAgICAgICAgaWYgKHRoaXMuaW5pdGFsaXppbmcgfHwgdXJsT3JTdGF0ZUNoYW5nZWQpIHtcbiAgICAgICAgICB0aGlzLmluaXRhbGl6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAkcm9vdFNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBuZXcgVVJMIGFnYWluIHNpbmNlIGl0IGNvdWxkIGhhdmUgY2hhbmdlZCBkdWUgdG8gYXN5bmMgdXBkYXRlXG4gICAgICAgICAgICBjb25zdCBuZXdVcmwgPSB0aGlzLmFic1VybCgpO1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFByZXZlbnRlZCA9XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZVxuICAgICAgICAgICAgICAgICAgICAuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBuZXdVcmwsIG9sZFVybCwgdGhpcy4kJHN0YXRlLCBvbGRTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgLmRlZmF1bHRQcmV2ZW50ZWQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSBsb2NhdGlvbiB3YXMgY2hhbmdlZCBieSBhIGAkbG9jYXRpb25DaGFuZ2VTdGFydGAgaGFuZGxlciB0aGVuIHN0b3BcbiAgICAgICAgICAgIC8vIHByb2Nlc3NpbmcgdGhpcyBsb2NhdGlvbiBjaGFuZ2VcbiAgICAgICAgICAgIGlmICh0aGlzLmFic1VybCgpICE9PSBuZXdVcmwpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy4kJHBhcnNlKG9sZFVybCk7XG4gICAgICAgICAgICAgIHRoaXMuJCRzdGF0ZSA9IG9sZFN0YXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBibG9jayBkb2Vzbid0IHJ1biB3aGVuIGluaXRhbGl6aW5nIGJlY2F1c2UgaXQncyBnb2luZyB0byBwZXJmb3JtIHRoZSB1cGRhdGUgdG9cbiAgICAgICAgICAgICAgLy8gdGhlIFVSTCB3aGljaCBzaG91bGRuJ3QgYmUgbmVlZGVkIHdoZW4gaW5pdGFsaXppbmcuXG4gICAgICAgICAgICAgIGlmICh1cmxPclN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QnJvd3NlclVybFdpdGhGYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgbmV3VXJsLCBjdXJyZW50UmVwbGFjZSwgb2xkU3RhdGUgPT09IHRoaXMuJCRzdGF0ZSA/IG51bGwgOiB0aGlzLiQkc3RhdGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCRyZXBsYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFxuICAgICAgICAgICAgICAgICAgJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBuZXdVcmwsIG9sZFVybCwgdGhpcy4kJHN0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICAgICAgICAgIGlmICh1cmxPclN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJCRub3RpZnlDaGFuZ2VMaXN0ZW5lcnModGhpcy51cmwoKSwgdGhpcy4kJHN0YXRlLCBvbGRVcmwsIG9sZFN0YXRlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLiQkcmVwbGFjZSA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldEJyb3dzZXJVcGRhdGUoKSB7XG4gICAgdGhpcy4kJHJlcGxhY2UgPSBmYWxzZTtcbiAgICB0aGlzLiQkc3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuICAgIHRoaXMudXBkYXRlQnJvd3NlciA9IGZhbHNlO1xuICAgIHRoaXMubGFzdEJyb3dzZXJVcmwgPSB0aGlzLmJyb3dzZXJVcmwoKTtcbiAgfVxuXG4gIHByaXZhdGUgbGFzdEhpc3RvcnlTdGF0ZTogdW5rbm93bjtcbiAgcHJpdmF0ZSBsYXN0QnJvd3NlclVybDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgYnJvd3NlclVybCgpOiBzdHJpbmc7XG4gIHByaXZhdGUgYnJvd3NlclVybCh1cmw6IHN0cmluZywgcmVwbGFjZT86IGJvb2xlYW4sIHN0YXRlPzogdW5rbm93bik6IHRoaXM7XG4gIHByaXZhdGUgYnJvd3NlclVybCh1cmw/OiBzdHJpbmcsIHJlcGxhY2U/OiBib29sZWFuLCBzdGF0ZT86IHVua25vd24pIHtcbiAgICAvLyBJbiBtb2Rlcm4gYnJvd3NlcnMgYGhpc3Rvcnkuc3RhdGVgIGlzIGBudWxsYCBieSBkZWZhdWx0OyB0cmVhdGluZyBpdCBzZXBhcmF0ZWx5XG4gICAgLy8gZnJvbSBgdW5kZWZpbmVkYCB3b3VsZCBjYXVzZSBgJGJyb3dzZXIudXJsKCcvZm9vJylgIHRvIGNoYW5nZSBgaGlzdG9yeS5zdGF0ZWBcbiAgICAvLyB0byB1bmRlZmluZWQgdmlhIGBwdXNoU3RhdGVgLiBJbnN0ZWFkLCBsZXQncyBjaGFuZ2UgYHVuZGVmaW5lZGAgdG8gYG51bGxgIGhlcmUuXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHN0YXRlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBzZXR0ZXJcbiAgICBpZiAodXJsKSB7XG4gICAgICBsZXQgc2FtZVN0YXRlID0gdGhpcy5sYXN0SGlzdG9yeVN0YXRlID09PSBzdGF0ZTtcblxuICAgICAgLy8gTm9ybWFsaXplIHRoZSBpbnB1dHRlZCBVUkxcbiAgICAgIHVybCA9IHRoaXMudXJsQ29kZWMucGFyc2UodXJsKS5ocmVmO1xuXG4gICAgICAvLyBEb24ndCBjaGFuZ2UgYW55dGhpbmcgaWYgcHJldmlvdXMgYW5kIGN1cnJlbnQgVVJMcyBhbmQgc3RhdGVzIG1hdGNoLlxuICAgICAgaWYgKHRoaXMubGFzdEJyb3dzZXJVcmwgPT09IHVybCAmJiBzYW1lU3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB0aGlzLmxhc3RCcm93c2VyVXJsID0gdXJsO1xuICAgICAgdGhpcy5sYXN0SGlzdG9yeVN0YXRlID0gc3RhdGU7XG5cbiAgICAgIC8vIFJlbW92ZSBzZXJ2ZXIgYmFzZSBmcm9tIFVSTCBhcyB0aGUgQW5ndWxhciBBUElzIGZvciB1cGRhdGluZyBVUkwgcmVxdWlyZVxuICAgICAgLy8gaXQgdG8gYmUgdGhlIHBhdGgrLlxuICAgICAgdXJsID0gdGhpcy5zdHJpcEJhc2VVcmwodGhpcy5nZXRTZXJ2ZXJCYXNlKCksIHVybCkgfHwgdXJsO1xuXG4gICAgICAvLyBTZXQgdGhlIFVSTFxuICAgICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgICAgdGhpcy5sb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgJycsIHVybCwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZShzdGF0ZSwgJycsIHVybCwgJycpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNhY2hlU3RhdGUoKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAvLyBnZXR0ZXJcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGxhdGZvcm1Mb2NhdGlvbi5ocmVmO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoaXMgdmFyaWFibGUgc2hvdWxkIGJlIHVzZWQgKm9ubHkqIGluc2lkZSB0aGUgY2FjaGVTdGF0ZSBmdW5jdGlvbi5cbiAgcHJpdmF0ZSBsYXN0Q2FjaGVkU3RhdGU6IHVua25vd24gPSBudWxsO1xuICBwcml2YXRlIGNhY2hlU3RhdGUoKSB7XG4gICAgLy8gVGhpcyBzaG91bGQgYmUgdGhlIG9ubHkgcGxhY2UgaW4gJGJyb3dzZXIgd2hlcmUgYGhpc3Rvcnkuc3RhdGVgIGlzIHJlYWQuXG4gICAgdGhpcy5jYWNoZWRTdGF0ZSA9IHRoaXMucGxhdGZvcm1Mb2NhdGlvbi5nZXRTdGF0ZSgpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5jYWNoZWRTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuY2FjaGVkU3RhdGUgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFByZXZlbnQgY2FsbGJhY2tzIGZvIGZpcmUgdHdpY2UgaWYgYm90aCBoYXNoY2hhbmdlICYgcG9wc3RhdGUgd2VyZSBmaXJlZC5cbiAgICBpZiAoZGVlcEVxdWFsKHRoaXMuY2FjaGVkU3RhdGUsIHRoaXMubGFzdENhY2hlZFN0YXRlKSkge1xuICAgICAgdGhpcy5jYWNoZWRTdGF0ZSA9IHRoaXMubGFzdENhY2hlZFN0YXRlO1xuICAgIH1cblxuICAgIHRoaXMubGFzdENhY2hlZFN0YXRlID0gdGhpcy5jYWNoZWRTdGF0ZTtcbiAgICB0aGlzLmxhc3RIaXN0b3J5U3RhdGUgPSB0aGlzLmNhY2hlZFN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gZW11bGF0ZXMgdGhlICRicm93c2VyLnN0YXRlKCkgZnVuY3Rpb24gZnJvbSBBbmd1bGFySlMuIEl0IHdpbGwgY2F1c2VcbiAgICogaGlzdG9yeS5zdGF0ZSB0byBiZSBjYWNoZWQgdW5sZXNzIGNoYW5nZWQgd2l0aCBkZWVwIGVxdWFsaXR5IGNoZWNrLlxuICAgKi9cbiAgcHJpdmF0ZSBicm93c2VyU3RhdGUoKTogdW5rbm93biB7IHJldHVybiB0aGlzLmNhY2hlZFN0YXRlOyB9XG5cbiAgcHJpdmF0ZSBzdHJpcEJhc2VVcmwoYmFzZTogc3RyaW5nLCB1cmw6IHN0cmluZykge1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aChiYXNlKSkge1xuICAgICAgcmV0dXJuIHVybC5zdWJzdHIoYmFzZS5sZW5ndGgpO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTZXJ2ZXJCYXNlKCkge1xuICAgIGNvbnN0IHtwcm90b2NvbCwgaG9zdG5hbWUsIHBvcnR9ID0gdGhpcy5wbGF0Zm9ybUxvY2F0aW9uO1xuICAgIGNvbnN0IGJhc2VIcmVmID0gdGhpcy5sb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmKCk7XG4gICAgbGV0IHVybCA9IGAke3Byb3RvY29sfS8vJHtob3N0bmFtZX0ke3BvcnQgPyAnOicgKyBwb3J0IDogJyd9JHtiYXNlSHJlZiB8fCAnLyd9YDtcbiAgICByZXR1cm4gdXJsLmVuZHNXaXRoKCcvJykgPyB1cmwgOiB1cmwgKyAnLyc7XG4gIH1cblxuICBwcml2YXRlIHBhcnNlQXBwVXJsKHVybDogc3RyaW5nKSB7XG4gICAgaWYgKERPVUJMRV9TTEFTSF9SRUdFWC50ZXN0KHVybCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQmFkIFBhdGggLSBVUkwgY2Fubm90IHN0YXJ0IHdpdGggZG91YmxlIHNsYXNoZXM6ICR7dXJsfWApO1xuICAgIH1cblxuICAgIGxldCBwcmVmaXhlZCA9ICh1cmwuY2hhckF0KDApICE9PSAnLycpO1xuICAgIGlmIChwcmVmaXhlZCkge1xuICAgICAgdXJsID0gJy8nICsgdXJsO1xuICAgIH1cbiAgICBsZXQgbWF0Y2ggPSB0aGlzLnVybENvZGVjLnBhcnNlKHVybCwgdGhpcy5nZXRTZXJ2ZXJCYXNlKCkpO1xuICAgIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEJhZCBVUkwgLSBDYW5ub3QgcGFyc2UgVVJMOiAke3VybH1gKTtcbiAgICB9XG4gICAgbGV0IHBhdGggPVxuICAgICAgICBwcmVmaXhlZCAmJiBtYXRjaC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyA/IG1hdGNoLnBhdGhuYW1lLnN1YnN0cmluZygxKSA6IG1hdGNoLnBhdGhuYW1lO1xuICAgIHRoaXMuJCRwYXRoID0gdGhpcy51cmxDb2RlYy5kZWNvZGVQYXRoKHBhdGgpO1xuICAgIHRoaXMuJCRzZWFyY2ggPSB0aGlzLnVybENvZGVjLmRlY29kZVNlYXJjaChtYXRjaC5zZWFyY2gpO1xuICAgIHRoaXMuJCRoYXNoID0gdGhpcy51cmxDb2RlYy5kZWNvZGVIYXNoKG1hdGNoLmhhc2gpO1xuXG4gICAgLy8gbWFrZSBzdXJlIHBhdGggc3RhcnRzIHdpdGggJy8nO1xuICAgIGlmICh0aGlzLiQkcGF0aCAmJiB0aGlzLiQkcGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdGhpcy4kJHBhdGggPSAnLycgKyB0aGlzLiQkcGF0aDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgVVJMIGNoYW5nZXMuIFRoaXMgQVBJIGlzIHVzZWQgdG8gY2F0Y2ggdXBkYXRlcyBwZXJmb3JtZWQgYnkgdGhlXG4gICAqIEFuZ3VsYXJKUyBmcmFtZXdvcmsuIFRoZXNlIGNoYW5nZXMgYXJlIGEgc3Vic2V0IG9mIHRoZSBgJGxvY2F0aW9uQ2hhbmdlU3RhcnRgIGFuZFxuICAgKiBgJGxvY2F0aW9uQ2hhbmdlU3VjY2Vzc2AgZXZlbnRzIHdoaWNoIGZpcmUgd2hlbiBBbmd1bGFySlMgdXBkYXRlcyBpdHMgaW50ZXJuYWxseS1yZWZlcmVuY2VkXG4gICAqIHZlcnNpb24gb2YgdGhlIGJyb3dzZXIgVVJMLlxuICAgKlxuICAgKiBJdCdzIHBvc3NpYmxlIGZvciBgJGxvY2F0aW9uQ2hhbmdlYCBldmVudHMgdG8gaGFwcGVuLCBidXQgZm9yIHRoZSBicm93c2VyIFVSTFxuICAgKiAod2luZG93LmxvY2F0aW9uKSB0byByZW1haW4gdW5jaGFuZ2VkLiBUaGlzIGBvbkNoYW5nZWAgY2FsbGJhY2sgd2lsbCBmaXJlIG9ubHkgd2hlbiBBbmd1bGFySlNcbiAgICogYWN0dWFsbHkgdXBkYXRlcyB0aGUgYnJvd3NlciBVUkwgKHdpbmRvdy5sb2NhdGlvbikuXG4gICAqXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBpcyB0cmlnZ2VyZWQgZm9yIHRoZSBsaXN0ZW5lciB3aGVuIHRoZSBVUkwgY2hhbmdlcy5cbiAgICogQHBhcmFtIGVyciBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBpcyB0cmlnZ2VyZWQgd2hlbiBhbiBlcnJvciBvY2N1cnMuXG4gICAqL1xuICBvbkNoYW5nZShcbiAgICAgIGZuOiAodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duLCBvbGRVcmw6IHN0cmluZywgb2xkU3RhdGU6IHVua25vd24pID0+IHZvaWQsXG4gICAgICBlcnI6IChlOiBFcnJvcikgPT4gdm9pZCA9IChlOiBFcnJvcikgPT4ge30pIHtcbiAgICB0aGlzLiQkY2hhbmdlTGlzdGVuZXJzLnB1c2goW2ZuLCBlcnJdKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgJCRub3RpZnlDaGFuZ2VMaXN0ZW5lcnMoXG4gICAgICB1cmw6IHN0cmluZyA9ICcnLCBzdGF0ZTogdW5rbm93biwgb2xkVXJsOiBzdHJpbmcgPSAnJywgb2xkU3RhdGU6IHVua25vd24pIHtcbiAgICB0aGlzLiQkY2hhbmdlTGlzdGVuZXJzLmZvckVhY2goKFtmbiwgZXJyXSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm4odXJsLCBzdGF0ZSwgb2xkVXJsLCBvbGRTdGF0ZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVycihlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIHByb3ZpZGVkIFVSTCwgYW5kIHNldHMgdGhlIGN1cnJlbnQgVVJMIHRvIHRoZSBwYXJzZWQgcmVzdWx0LlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFRoZSBVUkwgc3RyaW5nLlxuICAgKi9cbiAgJCRwYXJzZSh1cmw6IHN0cmluZykge1xuICAgIGxldCBwYXRoVXJsOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBwYXRoVXJsID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW1vdmUgcHJvdG9jb2wgJiBob3N0bmFtZSBpZiBVUkwgc3RhcnRzIHdpdGggaXRcbiAgICAgIHBhdGhVcmwgPSB0aGlzLnN0cmlwQmFzZVVybCh0aGlzLmdldFNlcnZlckJhc2UoKSwgdXJsKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwYXRoVXJsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHVybCBcIiR7dXJsfVwiLCBtaXNzaW5nIHBhdGggcHJlZml4IFwiJHt0aGlzLmdldFNlcnZlckJhc2UoKX1cIi5gKTtcbiAgICB9XG5cbiAgICB0aGlzLnBhcnNlQXBwVXJsKHBhdGhVcmwpO1xuXG4gICAgaWYgKCF0aGlzLiQkcGF0aCkge1xuICAgICAgdGhpcy4kJHBhdGggPSAnLyc7XG4gICAgfVxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIHByb3ZpZGVkIFVSTCBhbmQgaXRzIHJlbGF0aXZlIFVSTC5cbiAgICpcbiAgICogQHBhcmFtIHVybCBUaGUgZnVsbCBVUkwgc3RyaW5nLlxuICAgKiBAcGFyYW0gcmVsSHJlZiBBIFVSTCBzdHJpbmcgcmVsYXRpdmUgdG8gdGhlIGZ1bGwgVVJMIHN0cmluZy5cbiAgICovXG4gICQkcGFyc2VMaW5rVXJsKHVybDogc3RyaW5nLCByZWxIcmVmPzogc3RyaW5nfG51bGwpOiBib29sZWFuIHtcbiAgICAvLyBXaGVuIHJlbEhyZWYgaXMgcGFzc2VkLCBpdCBzaG91bGQgYmUgYSBoYXNoIGFuZCBpcyBoYW5kbGVkIHNlcGFyYXRlbHlcbiAgICBpZiAocmVsSHJlZiAmJiByZWxIcmVmWzBdID09PSAnIycpIHtcbiAgICAgIHRoaXMuaGFzaChyZWxIcmVmLnNsaWNlKDEpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBsZXQgcmV3cml0dGVuVXJsO1xuICAgIGxldCBhcHBVcmwgPSB0aGlzLnN0cmlwQmFzZVVybCh0aGlzLmdldFNlcnZlckJhc2UoKSwgdXJsKTtcbiAgICBpZiAodHlwZW9mIGFwcFVybCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJld3JpdHRlblVybCA9IHRoaXMuZ2V0U2VydmVyQmFzZSgpICsgYXBwVXJsO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRTZXJ2ZXJCYXNlKCkgPT09IHVybCArICcvJykge1xuICAgICAgcmV3cml0dGVuVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCk7XG4gICAgfVxuICAgIC8vIFNldCB0aGUgVVJMXG4gICAgaWYgKHJld3JpdHRlblVybCkge1xuICAgICAgdGhpcy4kJHBhcnNlKHJld3JpdHRlblVybCk7XG4gICAgfVxuICAgIHJldHVybiAhIXJld3JpdHRlblVybDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0QnJvd3NlclVybFdpdGhGYWxsYmFjayh1cmw6IHN0cmluZywgcmVwbGFjZTogYm9vbGVhbiwgc3RhdGU6IHVua25vd24pIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybCgpO1xuICAgIGNvbnN0IG9sZFN0YXRlID0gdGhpcy4kJHN0YXRlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmJyb3dzZXJVcmwodXJsLCByZXBsYWNlLCBzdGF0ZSk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSAkbG9jYXRpb24uc3RhdGUoKSByZXR1cm5zIHJlZmVyZW50aWFsbHkgaWRlbnRpY2FsIChub3QganVzdCBkZWVwbHkgZXF1YWwpXG4gICAgICAvLyBzdGF0ZSBvYmplY3Q7IHRoaXMgbWFrZXMgcG9zc2libGUgcXVpY2sgY2hlY2tpbmcgaWYgdGhlIHN0YXRlIGNoYW5nZWQgaW4gdGhlIGRpZ2VzdFxuICAgICAgLy8gbG9vcC4gQ2hlY2tpbmcgZGVlcCBlcXVhbGl0eSB3b3VsZCBiZSB0b28gZXhwZW5zaXZlLlxuICAgICAgdGhpcy4kJHN0YXRlID0gdGhpcy5icm93c2VyU3RhdGUoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBSZXN0b3JlIG9sZCB2YWx1ZXMgaWYgcHVzaFN0YXRlIGZhaWxzXG4gICAgICB0aGlzLnVybChvbGRVcmwpO1xuICAgICAgdGhpcy4kJHN0YXRlID0gb2xkU3RhdGU7XG5cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb21wb3NlVXJscygpIHtcbiAgICB0aGlzLiQkdXJsID0gdGhpcy51cmxDb2RlYy5ub3JtYWxpemUodGhpcy4kJHBhdGgsIHRoaXMuJCRzZWFyY2gsIHRoaXMuJCRoYXNoKTtcbiAgICB0aGlzLiQkYWJzVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCkgKyB0aGlzLiQkdXJsLnN1YnN0cigxKTsgIC8vIHJlbW92ZSAnLycgZnJvbSBmcm9udCBvZiBVUkxcbiAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgZnVsbCBVUkwgcmVwcmVzZW50YXRpb24gd2l0aCBhbGwgc2VnbWVudHMgZW5jb2RlZCBhY2NvcmRpbmcgdG9cbiAgICogcnVsZXMgc3BlY2lmaWVkIGluXG4gICAqIFtSRkMgMzk4Nl0oaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQpLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IGFic1VybCA9ICRsb2NhdGlvbi5hYnNVcmwoKTtcbiAgICogLy8gPT4gXCJodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1wiXG4gICAqIGBgYFxuICAgKi9cbiAgYWJzVXJsKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkYWJzVXJsOyB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBVUkwsIG9yIHNldHMgYSBuZXcgVVJMLiBXaGVuIHNldHRpbmcgYSBVUkwsXG4gICAqIGNoYW5nZXMgdGhlIHBhdGgsIHNlYXJjaCwgYW5kIGhhc2gsIGFuZCByZXR1cm5zIGEgcmVmZXJlbmNlIHRvIGl0cyBvd24gaW5zdGFuY2UuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgdXJsID0gJGxvY2F0aW9uLnVybCgpO1xuICAgKiAvLyA9PiBcIi9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1wiXG4gICAqIGBgYFxuICAgKi9cbiAgdXJsKCk6IHN0cmluZztcbiAgdXJsKHVybDogc3RyaW5nKTogdGhpcztcbiAgdXJsKHVybD86IHN0cmluZyk6IHN0cmluZ3x0aGlzIHtcbiAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdXJsLmxlbmd0aCkge1xuICAgICAgICB1cmwgPSAnLyc7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1hdGNoID0gUEFUSF9NQVRDSC5leGVjKHVybCk7XG4gICAgICBpZiAoIW1hdGNoKSByZXR1cm4gdGhpcztcbiAgICAgIGlmIChtYXRjaFsxXSB8fCB1cmwgPT09ICcnKSB0aGlzLnBhdGgodGhpcy51cmxDb2RlYy5kZWNvZGVQYXRoKG1hdGNoWzFdKSk7XG4gICAgICBpZiAobWF0Y2hbMl0gfHwgbWF0Y2hbMV0gfHwgdXJsID09PSAnJykgdGhpcy5zZWFyY2gobWF0Y2hbM10gfHwgJycpO1xuICAgICAgdGhpcy5oYXNoKG1hdGNoWzVdIHx8ICcnKTtcblxuICAgICAgLy8gQ2hhaW5hYmxlIG1ldGhvZFxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJCR1cmw7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBwcm90b2NvbCBvZiB0aGUgY3VycmVudCBVUkwuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcHJvdG9jb2wgPSAkbG9jYXRpb24ucHJvdG9jb2woKTtcbiAgICogLy8gPT4gXCJodHRwXCJcbiAgICogYGBgXG4gICAqL1xuICBwcm90b2NvbCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy4kJHByb3RvY29sOyB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgcHJvdG9jb2wgb2YgdGhlIGN1cnJlbnQgVVJMLlxuICAgKlxuICAgKiBJbiBjb250cmFzdCB0byB0aGUgbm9uLUFuZ3VsYXJKUyB2ZXJzaW9uIGBsb2NhdGlvbi5ob3N0YCB3aGljaCByZXR1cm5zIGBob3N0bmFtZTpwb3J0YCwgdGhpc1xuICAgKiByZXR1cm5zIHRoZSBgaG9zdG5hbWVgIHBvcnRpb24gb25seS5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbVwiXG4gICAqXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vdXNlcjpwYXNzd29yZEBleGFtcGxlLmNvbTo4MDgwLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG4gICAqIC8vID0+IFwiZXhhbXBsZS5jb21cIlxuICAgKiBob3N0ID0gbG9jYXRpb24uaG9zdDtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbTo4MDgwXCJcbiAgICogYGBgXG4gICAqL1xuICBob3N0KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkaG9zdDsgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIHBvcnQgb2YgdGhlIGN1cnJlbnQgVVJMLlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHBvcnQgPSAkbG9jYXRpb24ucG9ydCgpO1xuICAgKiAvLyA9PiA4MFxuICAgKiBgYGBcbiAgICovXG4gIHBvcnQoKTogbnVtYmVyfG51bGwgeyByZXR1cm4gdGhpcy4kJHBvcnQ7IH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBwYXRoIG9mIHRoZSBjdXJyZW50IFVSTCwgb3IgY2hhbmdlcyB0aGUgcGF0aCBhbmQgcmV0dXJucyBhIHJlZmVyZW5jZSB0byBpdHMgb3duXG4gICAqIGluc3RhbmNlLlxuICAgKlxuICAgKiBQYXRocyBzaG91bGQgYWx3YXlzIGJlZ2luIHdpdGggZm9yd2FyZCBzbGFzaCAoLykuIFRoaXMgbWV0aG9kIGFkZHMgdGhlIGZvcndhcmQgc2xhc2hcbiAgICogaWYgaXQgaXMgbWlzc2luZy5cbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBwYXRoID0gJGxvY2F0aW9uLnBhdGgoKTtcbiAgICogLy8gPT4gXCIvc29tZS9wYXRoXCJcbiAgICogYGBgXG4gICAqL1xuICBwYXRoKCk6IHN0cmluZztcbiAgcGF0aChwYXRoOiBzdHJpbmd8bnVtYmVyfG51bGwpOiB0aGlzO1xuICBwYXRoKHBhdGg/OiBzdHJpbmd8bnVtYmVyfG51bGwpOiBzdHJpbmd8dGhpcyB7XG4gICAgaWYgKHR5cGVvZiBwYXRoID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuJCRwYXRoO1xuICAgIH1cblxuICAgIC8vIG51bGwgcGF0aCBjb252ZXJ0cyB0byBlbXB0eSBzdHJpbmcuIFByZXBlbmQgd2l0aCBcIi9cIiBpZiBuZWVkZWQuXG4gICAgcGF0aCA9IHBhdGggIT09IG51bGwgPyBwYXRoLnRvU3RyaW5nKCkgOiAnJztcbiAgICBwYXRoID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJyA/IHBhdGggOiAnLycgKyBwYXRoO1xuXG4gICAgdGhpcy4kJHBhdGggPSBwYXRoO1xuXG4gICAgdGhpcy5jb21wb3NlVXJscygpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIG1hcCBvZiB0aGUgc2VhcmNoIHBhcmFtZXRlcnMgb2YgdGhlIGN1cnJlbnQgVVJMLCBvciBjaGFuZ2VzIGEgc2VhcmNoIFxuICAgKiBwYXJ0IGFuZCByZXR1cm5zIGEgcmVmZXJlbmNlIHRvIGl0cyBvd24gaW5zdGFuY2UuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgc2VhcmNoT2JqZWN0ID0gJGxvY2F0aW9uLnNlYXJjaCgpO1xuICAgKiAvLyA9PiB7Zm9vOiAnYmFyJywgYmF6OiAneG94byd9XG4gICAqXG4gICAqIC8vIHNldCBmb28gdG8gJ3lpcGVlJ1xuICAgKiAkbG9jYXRpb24uc2VhcmNoKCdmb28nLCAneWlwZWUnKTtcbiAgICogLy8gJGxvY2F0aW9uLnNlYXJjaCgpID0+IHtmb286ICd5aXBlZScsIGJhejogJ3hveG8nfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8T2JqZWN0LjxzdHJpbmc+fE9iamVjdC48QXJyYXkuPHN0cmluZz4+fSBzZWFyY2ggTmV3IHNlYXJjaCBwYXJhbXMgLSBzdHJpbmcgb3JcbiAgICogaGFzaCBvYmplY3QuXG4gICAqXG4gICAqIFdoZW4gY2FsbGVkIHdpdGggYSBzaW5nbGUgYXJndW1lbnQgdGhlIG1ldGhvZCBhY3RzIGFzIGEgc2V0dGVyLCBzZXR0aW5nIHRoZSBgc2VhcmNoYCBjb21wb25lbnRcbiAgICogb2YgYCRsb2NhdGlvbmAgdG8gdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAgICpcbiAgICogSWYgdGhlIGFyZ3VtZW50IGlzIGEgaGFzaCBvYmplY3QgY29udGFpbmluZyBhbiBhcnJheSBvZiB2YWx1ZXMsIHRoZXNlIHZhbHVlcyB3aWxsIGJlIGVuY29kZWRcbiAgICogYXMgZHVwbGljYXRlIHNlYXJjaCBwYXJhbWV0ZXJzIGluIHRoZSBVUkwuXG4gICAqXG4gICAqIEBwYXJhbSB7KHN0cmluZ3xOdW1iZXJ8QXJyYXk8c3RyaW5nPnxib29sZWFuKT19IHBhcmFtVmFsdWUgSWYgYHNlYXJjaGAgaXMgYSBzdHJpbmcgb3IgbnVtYmVyLCB0aGVuIGBwYXJhbVZhbHVlYFxuICAgKiB3aWxsIG92ZXJyaWRlIG9ubHkgYSBzaW5nbGUgc2VhcmNoIHByb3BlcnR5LlxuICAgKlxuICAgKiBJZiBgcGFyYW1WYWx1ZWAgaXMgYW4gYXJyYXksIGl0IHdpbGwgb3ZlcnJpZGUgdGhlIHByb3BlcnR5IG9mIHRoZSBgc2VhcmNoYCBjb21wb25lbnQgb2ZcbiAgICogYCRsb2NhdGlvbmAgc3BlY2lmaWVkIHZpYSB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAqXG4gICAqIElmIGBwYXJhbVZhbHVlYCBpcyBgbnVsbGAsIHRoZSBwcm9wZXJ0eSBzcGVjaWZpZWQgdmlhIHRoZSBmaXJzdCBhcmd1bWVudCB3aWxsIGJlIGRlbGV0ZWQuXG4gICAqXG4gICAqIElmIGBwYXJhbVZhbHVlYCBpcyBgdHJ1ZWAsIHRoZSBwcm9wZXJ0eSBzcGVjaWZpZWQgdmlhIHRoZSBmaXJzdCBhcmd1bWVudCB3aWxsIGJlIGFkZGVkIHdpdGggbm9cbiAgICogdmFsdWUgbm9yIHRyYWlsaW5nIGVxdWFsIHNpZ24uXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHBhcnNlZCBgc2VhcmNoYCBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgVVJMLCBvciB0aGUgY2hhbmdlZCBgc2VhcmNoYCBvYmplY3QuXG4gICAqL1xuICBzZWFyY2goKToge1trZXk6IHN0cmluZ106IHVua25vd259O1xuICBzZWFyY2goc2VhcmNoOiBzdHJpbmd8bnVtYmVyfHtba2V5OiBzdHJpbmddOiB1bmtub3dufSk6IHRoaXM7XG4gIHNlYXJjaChcbiAgICAgIHNlYXJjaDogc3RyaW5nfG51bWJlcnx7W2tleTogc3RyaW5nXTogdW5rbm93bn0sXG4gICAgICBwYXJhbVZhbHVlOiBudWxsfHVuZGVmaW5lZHxzdHJpbmd8bnVtYmVyfGJvb2xlYW58c3RyaW5nW10pOiB0aGlzO1xuICBzZWFyY2goXG4gICAgICBzZWFyY2g/OiBzdHJpbmd8bnVtYmVyfHtba2V5OiBzdHJpbmddOiB1bmtub3dufSxcbiAgICAgIHBhcmFtVmFsdWU/OiBudWxsfHVuZGVmaW5lZHxzdHJpbmd8bnVtYmVyfGJvb2xlYW58c3RyaW5nW10pOiB7W2tleTogc3RyaW5nXTogdW5rbm93bn18dGhpcyB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLiQkc2VhcmNoO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHNlYXJjaCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aGlzLiQkc2VhcmNoID0gdGhpcy51cmxDb2RlYy5kZWNvZGVTZWFyY2goc2VhcmNoLnRvU3RyaW5nKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdvYmplY3QnICYmIHNlYXJjaCAhPT0gbnVsbCkge1xuICAgICAgICAgIC8vIENvcHkgdGhlIG9iamVjdCBzbyBpdCdzIG5ldmVyIG11dGF0ZWRcbiAgICAgICAgICBzZWFyY2ggPSB7Li4uc2VhcmNofTtcbiAgICAgICAgICAvLyByZW1vdmUgb2JqZWN0IHVuZGVmaW5lZCBvciBudWxsIHByb3BlcnRpZXNcbiAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzZWFyY2gpIHtcbiAgICAgICAgICAgIGlmIChzZWFyY2hba2V5XSA9PSBudWxsKSBkZWxldGUgc2VhcmNoW2tleV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy4kJHNlYXJjaCA9IHNlYXJjaDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdMb2NhdGlvblByb3ZpZGVyLnNlYXJjaCgpOiBGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nIG9yIGFuIG9iamVjdC4nKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICh0eXBlb2Ygc2VhcmNoID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRTZWFyY2ggPSB0aGlzLnNlYXJjaCgpO1xuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1WYWx1ZSA9PT0gJ3VuZGVmaW5lZCcgfHwgcGFyYW1WYWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgZGVsZXRlIGN1cnJlbnRTZWFyY2hbc2VhcmNoXTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlYXJjaChjdXJyZW50U2VhcmNoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudFNlYXJjaFtzZWFyY2hdID0gcGFyYW1WYWx1ZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlYXJjaChjdXJyZW50U2VhcmNoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb21wb3NlVXJscygpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBoYXNoIGZyYWdtZW50LCBvciBjaGFuZ2VzIHRoZSBoYXNoIGZyYWdtZW50IGFuZCByZXR1cm5zIGEgcmVmZXJlbmNlIHRvXG4gICAqIGl0cyBvd24gaW5zdGFuY2UuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94byNoYXNoVmFsdWVcbiAgICogbGV0IGhhc2ggPSAkbG9jYXRpb24uaGFzaCgpO1xuICAgKiAvLyA9PiBcImhhc2hWYWx1ZVwiXG4gICAqIGBgYFxuICAgKi9cbiAgaGFzaCgpOiBzdHJpbmc7XG4gIGhhc2goaGFzaDogc3RyaW5nfG51bWJlcnxudWxsKTogdGhpcztcbiAgaGFzaChoYXNoPzogc3RyaW5nfG51bWJlcnxudWxsKTogc3RyaW5nfHRoaXMge1xuICAgIGlmICh0eXBlb2YgaGFzaCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiQkaGFzaDtcbiAgICB9XG5cbiAgICB0aGlzLiQkaGFzaCA9IGhhc2ggIT09IG51bGwgPyBoYXNoLnRvU3RyaW5nKCkgOiAnJztcblxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRvIGAkbG9jYXRpb25gIGR1cmluZyB0aGUgY3VycmVudCBgJGRpZ2VzdGAgd2lsbCByZXBsYWNlIHRoZSBjdXJyZW50XG4gICAqIGhpc3RvcnkgcmVjb3JkLCBpbnN0ZWFkIG9mIGFkZGluZyBhIG5ldyBvbmUuXG4gICAqL1xuICByZXBsYWNlKCk6IHRoaXMge1xuICAgIHRoaXMuJCRyZXBsYWNlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGhpc3Rvcnkgc3RhdGUgb2JqZWN0IHdoZW4gY2FsbGVkIHdpdGhvdXQgYW55IHBhcmFtZXRlci5cbiAgICpcbiAgICogQ2hhbmdlIHRoZSBoaXN0b3J5IHN0YXRlIG9iamVjdCB3aGVuIGNhbGxlZCB3aXRoIG9uZSBwYXJhbWV0ZXIgYW5kIHJldHVybiBgJGxvY2F0aW9uYC5cbiAgICogVGhlIHN0YXRlIG9iamVjdCBpcyBsYXRlciBwYXNzZWQgdG8gYHB1c2hTdGF0ZWAgb3IgYHJlcGxhY2VTdGF0ZWAuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHN1cHBvcnRlZCBvbmx5IGluIEhUTUw1IG1vZGUgYW5kIG9ubHkgaW4gYnJvd3NlcnMgc3VwcG9ydGluZ1xuICAgKiB0aGUgSFRNTDUgSGlzdG9yeSBBUEkgbWV0aG9kcyBzdWNoIGFzIGBwdXNoU3RhdGVgIGFuZCBgcmVwbGFjZVN0YXRlYC4gSWYgeW91IG5lZWQgdG8gc3VwcG9ydFxuICAgKiBvbGRlciBicm93c2VycyAobGlrZSBJRTkgb3IgQW5kcm9pZCA8IDQuMCksIGRvbid0IHVzZSB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICovXG4gIHN0YXRlKCk6IHVua25vd247XG4gIHN0YXRlKHN0YXRlOiB1bmtub3duKTogdGhpcztcbiAgc3RhdGUoc3RhdGU/OiB1bmtub3duKTogdW5rbm93bnx0aGlzIHtcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuJCRzdGF0ZTtcbiAgICB9XG5cbiAgICB0aGlzLiQkc3RhdGUgPSBzdGF0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBmYWN0b3J5IGZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBgJGxvY2F0aW9uU2hpbWAgaW4gQW5ndWxhcixcbiAqIGFuZCBwcm92aWRlcyBhbiBBUEktY29tcGF0aWFibGUgYCRsb2NhdGlvblByb3ZpZGVyYCBmb3IgQW5ndWxhckpTLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzICRsb2NhdGlvblNoaW1Qcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBuZ1VwZ3JhZGU6IFVwZ3JhZGVNb2R1bGUsIHByaXZhdGUgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgcHJpdmF0ZSBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLCBwcml2YXRlIHVybENvZGVjOiBVcmxDb2RlYyxcbiAgICAgIHByaXZhdGUgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge31cblxuICAvKipcbiAgICogRmFjdG9yeSBtZXRob2QgdGhhdCByZXR1cm5zIGFuIGluc3RhbmNlIG9mIHRoZSAkbG9jYXRpb25TaGltXG4gICAqL1xuICAkZ2V0KCkge1xuICAgIHJldHVybiBuZXcgJGxvY2F0aW9uU2hpbShcbiAgICAgICAgdGhpcy5uZ1VwZ3JhZGUuJGluamVjdG9yLCB0aGlzLmxvY2F0aW9uLCB0aGlzLnBsYXRmb3JtTG9jYXRpb24sIHRoaXMudXJsQ29kZWMsXG4gICAgICAgIHRoaXMubG9jYXRpb25TdHJhdGVneSk7XG4gIH1cblxuICAvKipcbiAgICogU3R1YiBtZXRob2QgdXNlZCB0byBrZWVwIEFQSSBjb21wYXRpYmxlIHdpdGggQW5ndWxhckpTLiBUaGlzIHNldHRpbmcgaXMgY29uZmlndXJlZCB0aHJvdWdoXG4gICAqIHRoZSBMb2NhdGlvblVwZ3JhZGVNb2R1bGUncyBgY29uZmlnYCBtZXRob2QgaW4geW91ciBBbmd1bGFyIGFwcC5cbiAgICovXG4gIGhhc2hQcmVmaXgocHJlZml4Pzogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb25maWd1cmUgTG9jYXRpb25VcGdyYWRlIHRocm91Z2ggTG9jYXRpb25VcGdyYWRlTW9kdWxlLmNvbmZpZyBtZXRob2QuJyk7XG4gIH1cblxuICAvKipcbiAgICogU3R1YiBtZXRob2QgdXNlZCB0byBrZWVwIEFQSSBjb21wYXRpYmxlIHdpdGggQW5ndWxhckpTLiBUaGlzIHNldHRpbmcgaXMgY29uZmlndXJlZCB0aHJvdWdoXG4gICAqIHRoZSBMb2NhdGlvblVwZ3JhZGVNb2R1bGUncyBgY29uZmlnYCBtZXRob2QgaW4geW91ciBBbmd1bGFyIGFwcC5cbiAgICovXG4gIGh0bWw1TW9kZShtb2RlPzogYW55KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb25maWd1cmUgTG9jYXRpb25VcGdyYWRlIHRocm91Z2ggTG9jYXRpb25VcGdyYWRlTW9kdWxlLmNvbmZpZyBtZXRob2QuJyk7XG4gIH1cbn1cbiJdfQ==