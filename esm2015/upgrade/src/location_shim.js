/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
 * Docs TBD.
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
     * Register URL change listeners. This API can be used to catch updates performed by the
     * AngularJS framework. These changes are a subset of the `$locationChangeStart/Success` events
     * as those events fire when AngularJS updates it's internally referenced version of the browser
     * URL. It's possible for `$locationChange` events to happen, but for the browser URL
     * (window.location) to remain unchanged. This `onChange` callback will fire only when AngularJS
     * actually updates the browser URL (window.location).
     * @param {?} fn
     * @param {?=} err
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
     * @param {?} url
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
     * @param {?} url
     * @param {?=} relHref
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
            this.$$notifyChangeListeners(url, state, oldUrl, oldState);
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
     * This method is getter only.
     *
     * Return full URL representation with all segments encoded according to rules specified in
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
     * This method is getter only.
     *
     * Return protocol of current URL.
     *
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
     * This method is getter only.
     *
     * Return host of current URL.
     *
     * Note: compared to the non-AngularJS version `location.host` which returns `hostname:port`, this
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
     * This method is getter only.
     *
     * Return port of current URL.
     *
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
     * If called, all changes to $location during the current `$digest` will replace the current
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
 * Docs TBD.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc2hpbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi91cGdyYWRlL3NyYy9sb2NhdGlvbl9zaGltLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBWUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDOztNQUVqRCxVQUFVLEdBQUcsZ0NBQWdDOztNQUM3QyxrQkFBa0IsR0FBRyxlQUFlOztNQUNwQyxpQkFBaUIsR0FBRywyQkFBMkI7O01BQy9DLGFBQWEsR0FBNEI7SUFDN0MsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsR0FBRztJQUNiLE1BQU0sRUFBRSxFQUFFO0NBQ1g7Ozs7OztBQU9ELE1BQU0sT0FBTyxhQUFhOzs7Ozs7OztJQXVCeEIsWUFDSSxTQUFjLEVBQVUsUUFBa0IsRUFBVSxnQkFBa0MsRUFDOUUsUUFBa0IsRUFBVSxnQkFBa0M7UUFEOUMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDOUUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUF4QmxFLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUVuQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBRXBCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixhQUFRLEdBQVEsRUFBRSxDQUFDO1FBQ25CLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFFcEIsc0JBQWlCLEdBSW5CLEVBQUUsQ0FBQztRQUVELGdCQUFXLEdBQVksSUFBSSxDQUFDO1FBdUs1QixtQkFB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eUNBQTBCOzs7OztJQUM1RCxpREFBMEM7Ozs7O0lBQUUseUNBQTBCOzs7OztJQUN0RSxpREFBMEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb24sIExvY2F0aW9uU3RyYXRlZ3ksIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1VwZ3JhZGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL3VwZ3JhZGUvc3RhdGljJztcblxuaW1wb3J0IHtVcmxDb2RlY30gZnJvbSAnLi9wYXJhbXMnO1xuaW1wb3J0IHtkZWVwRXF1YWwsIGlzQW5jaG9yLCBpc1Byb21pc2V9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBQQVRIX01BVENIID0gL14oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpPyQvO1xuY29uc3QgRE9VQkxFX1NMQVNIX1JFR0VYID0gL15cXHMqW1xcXFwvXXsyLH0vO1xuY29uc3QgSUdOT1JFX1VSSV9SRUdFWFAgPSAvXlxccyooamF2YXNjcmlwdHxtYWlsdG8pOi9pO1xuY29uc3QgREVGQVVMVF9QT1JUUzoge1trZXk6IHN0cmluZ106IG51bWJlcn0gPSB7XG4gICdodHRwOic6IDgwLFxuICAnaHR0cHM6JzogNDQzLFxuICAnZnRwOic6IDIxXG59O1xuXG4vKipcbiAqIERvY3MgVEJELlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzICRsb2NhdGlvblNoaW0ge1xuICBwcml2YXRlIGluaXRhbGl6aW5nID0gdHJ1ZTtcbiAgcHJpdmF0ZSB1cGRhdGVCcm93c2VyID0gZmFsc2U7XG4gIHByaXZhdGUgJCRhYnNVcmw6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlICQkdXJsOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHByb3RvY29sOiBzdHJpbmc7XG4gIHByaXZhdGUgJCRob3N0OiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHBvcnQ6IG51bWJlcnxudWxsO1xuICBwcml2YXRlICQkcmVwbGFjZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlICQkcGF0aDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRzZWFyY2g6IGFueSA9ICcnO1xuICBwcml2YXRlICQkaGFzaDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRzdGF0ZTogdW5rbm93bjtcbiAgcHJpdmF0ZSAkJGNoYW5nZUxpc3RlbmVyczogW1xuICAgICgodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duLCBvbGRVcmw6IHN0cmluZywgb2xkU3RhdGU6IHVua25vd24sIGVycj86IChlOiBFcnJvcikgPT4gdm9pZCkgPT5cbiAgICAgICAgIHZvaWQpLFxuICAgIChlOiBFcnJvcikgPT4gdm9pZFxuICBdW10gPSBbXTtcblxuICBwcml2YXRlIGNhY2hlZFN0YXRlOiB1bmtub3duID0gbnVsbDtcblxuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAkaW5qZWN0b3I6IGFueSwgcHJpdmF0ZSBsb2NhdGlvbjogTG9jYXRpb24sIHByaXZhdGUgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgIHByaXZhdGUgdXJsQ29kZWM6IFVybENvZGVjLCBwcml2YXRlIGxvY2F0aW9uU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kpIHtcbiAgICBjb25zdCBpbml0aWFsVXJsID0gdGhpcy5icm93c2VyVXJsKCk7XG5cbiAgICBsZXQgcGFyc2VkVXJsID0gdGhpcy51cmxDb2RlYy5wYXJzZShpbml0aWFsVXJsKTtcblxuICAgIGlmICh0eXBlb2YgcGFyc2VkVXJsID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgJ0ludmFsaWQgVVJMJztcbiAgICB9XG5cbiAgICB0aGlzLiQkcHJvdG9jb2wgPSBwYXJzZWRVcmwucHJvdG9jb2w7XG4gICAgdGhpcy4kJGhvc3QgPSBwYXJzZWRVcmwuaG9zdG5hbWU7XG4gICAgdGhpcy4kJHBvcnQgPSBwYXJzZUludChwYXJzZWRVcmwucG9ydCkgfHwgREVGQVVMVF9QT1JUU1twYXJzZWRVcmwucHJvdG9jb2xdIHx8IG51bGw7XG5cbiAgICB0aGlzLiQkcGFyc2VMaW5rVXJsKGluaXRpYWxVcmwsIGluaXRpYWxVcmwpO1xuICAgIHRoaXMuY2FjaGVTdGF0ZSgpO1xuICAgIHRoaXMuJCRzdGF0ZSA9IHRoaXMuYnJvd3NlclN0YXRlKCk7XG5cbiAgICBpZiAoaXNQcm9taXNlKCRpbmplY3RvcikpIHtcbiAgICAgICRpbmplY3Rvci50aGVuKCRpID0+IHRoaXMuaW5pdGlhbGl6ZSgkaSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluaXRpYWxpemUoJGluamVjdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemUoJGluamVjdG9yOiBhbnkpIHtcbiAgICBjb25zdCAkcm9vdFNjb3BlID0gJGluamVjdG9yLmdldCgnJHJvb3RTY29wZScpO1xuICAgIGNvbnN0ICRyb290RWxlbWVudCA9ICRpbmplY3Rvci5nZXQoJyRyb290RWxlbWVudCcpO1xuXG4gICAgJHJvb3RFbGVtZW50Lm9uKCdjbGljaycsIChldmVudDogYW55KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50LndoaWNoID09PSAyIHx8XG4gICAgICAgICAgZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IGVsbTogKE5vZGUgJiBQYXJlbnROb2RlKXxudWxsID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAvLyB0cmF2ZXJzZSB0aGUgRE9NIHVwIHRvIGZpbmQgZmlyc3QgQSB0YWdcbiAgICAgIHdoaWxlIChlbG0gJiYgZWxtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdhJykge1xuICAgICAgICAvLyBpZ25vcmUgcmV3cml0aW5nIGlmIG5vIEEgdGFnIChyZWFjaGVkIHJvb3QgZWxlbWVudCwgb3Igbm8gcGFyZW50IC0gcmVtb3ZlZCBmcm9tIGRvY3VtZW50KVxuICAgICAgICBpZiAoZWxtID09PSAkcm9vdEVsZW1lbnRbMF0gfHwgIShlbG0gPSBlbG0ucGFyZW50Tm9kZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0FuY2hvcihlbG0pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYWJzSHJlZiA9IGVsbS5ocmVmO1xuICAgICAgY29uc3QgcmVsSHJlZiA9IGVsbS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgLy8gSWdub3JlIHdoZW4gdXJsIGlzIHN0YXJ0ZWQgd2l0aCBqYXZhc2NyaXB0OiBvciBtYWlsdG86XG4gICAgICBpZiAoSUdOT1JFX1VSSV9SRUdFWFAudGVzdChhYnNIcmVmKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChhYnNIcmVmICYmICFlbG0uZ2V0QXR0cmlidXRlKCd0YXJnZXQnKSAmJiAhZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuJCRwYXJzZUxpbmtVcmwoYWJzSHJlZiwgcmVsSHJlZikpIHtcbiAgICAgICAgICAvLyBXZSBkbyBhIHByZXZlbnREZWZhdWx0IGZvciBhbGwgdXJscyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb24sXG4gICAgICAgICAgLy8gaW4gaHRtbDVtb2RlIGFuZCBhbHNvIHdpdGhvdXQsIHNvIHRoYXQgd2UgYXJlIGFibGUgdG8gYWJvcnQgbmF2aWdhdGlvbiB3aXRob3V0XG4gICAgICAgICAgLy8gZ2V0dGluZyBkb3VibGUgZW50cmllcyBpbiB0aGUgbG9jYXRpb24gaGlzdG9yeS5cbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIC8vIHVwZGF0ZSBsb2NhdGlvbiBtYW51YWxseVxuICAgICAgICAgIGlmICh0aGlzLmFic1VybCgpICE9PSB0aGlzLmJyb3dzZXJVcmwoKSkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMubG9jYXRpb24ub25VcmxDaGFuZ2UoKG5ld1VybCwgbmV3U3RhdGUpID0+IHtcbiAgICAgIGxldCBvbGRVcmwgPSB0aGlzLmFic1VybCgpO1xuICAgICAgbGV0IG9sZFN0YXRlID0gdGhpcy4kJHN0YXRlO1xuICAgICAgdGhpcy4kJHBhcnNlKG5ld1VybCk7XG4gICAgICBuZXdVcmwgPSB0aGlzLmFic1VybCgpO1xuICAgICAgdGhpcy4kJHN0YXRlID0gbmV3U3RhdGU7XG4gICAgICBjb25zdCBkZWZhdWx0UHJldmVudGVkID1cbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgbmV3VXJsLCBvbGRVcmwsIG5ld1N0YXRlLCBvbGRTdGF0ZSlcbiAgICAgICAgICAgICAgLmRlZmF1bHRQcmV2ZW50ZWQ7XG5cbiAgICAgIC8vIGlmIHRoZSBsb2NhdGlvbiB3YXMgY2hhbmdlZCBieSBhIGAkbG9jYXRpb25DaGFuZ2VTdGFydGAgaGFuZGxlciB0aGVuIHN0b3BcbiAgICAgIC8vIHByb2Nlc3NpbmcgdGhpcyBsb2NhdGlvbiBjaGFuZ2VcbiAgICAgIGlmICh0aGlzLmFic1VybCgpICE9PSBuZXdVcmwpIHJldHVybjtcblxuICAgICAgLy8gSWYgZGVmYXVsdCB3YXMgcHJldmVudGVkLCBzZXQgYmFjayB0byBvbGQgc3RhdGUuIFRoaXMgaXMgdGhlIHN0YXRlIHRoYXQgd2FzIGxvY2FsbHlcbiAgICAgIC8vIGNhY2hlZCBpbiB0aGUgJGxvY2F0aW9uIHNlcnZpY2UuXG4gICAgICBpZiAoZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICB0aGlzLiQkcGFyc2Uob2xkVXJsKTtcbiAgICAgICAgdGhpcy5zdGF0ZShvbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMuc2V0QnJvd3NlclVybFdpdGhGYWxsYmFjayhvbGRVcmwsIGZhbHNlLCBvbGRTdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluaXRhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIG5ld1VybCwgb2xkVXJsLCBuZXdTdGF0ZSwgb2xkU3RhdGUpO1xuICAgICAgICB0aGlzLnJlc2V0QnJvd3NlclVwZGF0ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcbiAgICAgICAgJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB1cGRhdGUgYnJvd3NlclxuICAgICRyb290U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmluaXRhbGl6aW5nIHx8IHRoaXMudXBkYXRlQnJvd3Nlcikge1xuICAgICAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBvbGRVcmwgPSB0aGlzLmJyb3dzZXJVcmwoKTtcbiAgICAgICAgY29uc3QgbmV3VXJsID0gdGhpcy5hYnNVcmwoKTtcbiAgICAgICAgY29uc3Qgb2xkU3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuICAgICAgICBsZXQgY3VycmVudFJlcGxhY2UgPSB0aGlzLiQkcmVwbGFjZTtcblxuICAgICAgICBjb25zdCB1cmxPclN0YXRlQ2hhbmdlZCA9XG4gICAgICAgICAgICAhdGhpcy51cmxDb2RlYy5hcmVFcXVhbChvbGRVcmwsIG5ld1VybCkgfHwgb2xkU3RhdGUgIT09IHRoaXMuJCRzdGF0ZTtcblxuICAgICAgICAvLyBGaXJlIGxvY2F0aW9uIGNoYW5nZXMgb25lIHRpbWUgdG8gb24gaW5pdGlhbGl6YXRpb24uIFRoaXMgbXVzdCBiZSBkb25lIG9uIHRoZVxuICAgICAgICAvLyBuZXh0IHRpY2sgKHRodXMgaW5zaWRlICRldmFsQXN5bmMoKSkgaW4gb3JkZXIgZm9yIGxpc3RlbmVycyB0byBiZSByZWdpc3RlcmVkXG4gICAgICAgIC8vIGJlZm9yZSB0aGUgZXZlbnQgZmlyZXMuIE1pbWljaW5nIGJlaGF2aW9yIGZyb20gJGxvY2F0aW9uV2F0Y2g6XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi9tYXN0ZXIvc3JjL25nL2xvY2F0aW9uLmpzI0w5ODNcbiAgICAgICAgaWYgKHRoaXMuaW5pdGFsaXppbmcgfHwgdXJsT3JTdGF0ZUNoYW5nZWQpIHtcbiAgICAgICAgICB0aGlzLmluaXRhbGl6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAkcm9vdFNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBuZXcgVVJMIGFnYWluIHNpbmNlIGl0IGNvdWxkIGhhdmUgY2hhbmdlZCBkdWUgdG8gYXN5bmMgdXBkYXRlXG4gICAgICAgICAgICBjb25zdCBuZXdVcmwgPSB0aGlzLmFic1VybCgpO1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFByZXZlbnRlZCA9XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZVxuICAgICAgICAgICAgICAgICAgICAuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBuZXdVcmwsIG9sZFVybCwgdGhpcy4kJHN0YXRlLCBvbGRTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgLmRlZmF1bHRQcmV2ZW50ZWQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSBsb2NhdGlvbiB3YXMgY2hhbmdlZCBieSBhIGAkbG9jYXRpb25DaGFuZ2VTdGFydGAgaGFuZGxlciB0aGVuIHN0b3BcbiAgICAgICAgICAgIC8vIHByb2Nlc3NpbmcgdGhpcyBsb2NhdGlvbiBjaGFuZ2VcbiAgICAgICAgICAgIGlmICh0aGlzLmFic1VybCgpICE9PSBuZXdVcmwpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy4kJHBhcnNlKG9sZFVybCk7XG4gICAgICAgICAgICAgIHRoaXMuJCRzdGF0ZSA9IG9sZFN0YXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBibG9jayBkb2Vzbid0IHJ1biB3aGVuIGluaXRhbGl6aW5nIGJlY2F1c2UgaXQncyBnb2luZyB0byBwZXJmb3JtIHRoZSB1cGRhdGUgdG9cbiAgICAgICAgICAgICAgLy8gdGhlIFVSTCB3aGljaCBzaG91bGRuJ3QgYmUgbmVlZGVkIHdoZW4gaW5pdGFsaXppbmcuXG4gICAgICAgICAgICAgIGlmICh1cmxPclN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QnJvd3NlclVybFdpdGhGYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgbmV3VXJsLCBjdXJyZW50UmVwbGFjZSwgb2xkU3RhdGUgPT09IHRoaXMuJCRzdGF0ZSA/IG51bGwgOiB0aGlzLiQkc3RhdGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCRyZXBsYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFxuICAgICAgICAgICAgICAgICAgJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBuZXdVcmwsIG9sZFVybCwgdGhpcy4kJHN0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuJCRyZXBsYWNlID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlc2V0QnJvd3NlclVwZGF0ZSgpIHtcbiAgICB0aGlzLiQkcmVwbGFjZSA9IGZhbHNlO1xuICAgIHRoaXMuJCRzdGF0ZSA9IHRoaXMuYnJvd3NlclN0YXRlKCk7XG4gICAgdGhpcy51cGRhdGVCcm93c2VyID0gZmFsc2U7XG4gICAgdGhpcy5sYXN0QnJvd3NlclVybCA9IHRoaXMuYnJvd3NlclVybCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBsYXN0SGlzdG9yeVN0YXRlOiB1bmtub3duO1xuICBwcml2YXRlIGxhc3RCcm93c2VyVXJsOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBicm93c2VyVXJsKCk6IHN0cmluZztcbiAgcHJpdmF0ZSBicm93c2VyVXJsKHVybDogc3RyaW5nLCByZXBsYWNlPzogYm9vbGVhbiwgc3RhdGU/OiB1bmtub3duKTogdGhpcztcbiAgcHJpdmF0ZSBicm93c2VyVXJsKHVybD86IHN0cmluZywgcmVwbGFjZT86IGJvb2xlYW4sIHN0YXRlPzogdW5rbm93bikge1xuICAgIC8vIEluIG1vZGVybiBicm93c2VycyBgaGlzdG9yeS5zdGF0ZWAgaXMgYG51bGxgIGJ5IGRlZmF1bHQ7IHRyZWF0aW5nIGl0IHNlcGFyYXRlbHlcbiAgICAvLyBmcm9tIGB1bmRlZmluZWRgIHdvdWxkIGNhdXNlIGAkYnJvd3Nlci51cmwoJy9mb28nKWAgdG8gY2hhbmdlIGBoaXN0b3J5LnN0YXRlYFxuICAgIC8vIHRvIHVuZGVmaW5lZCB2aWEgYHB1c2hTdGF0ZWAuIEluc3RlYWQsIGxldCdzIGNoYW5nZSBgdW5kZWZpbmVkYCB0byBgbnVsbGAgaGVyZS5cbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgc3RhdGUgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHNldHRlclxuICAgIGlmICh1cmwpIHtcbiAgICAgIGxldCBzYW1lU3RhdGUgPSB0aGlzLmxhc3RIaXN0b3J5U3RhdGUgPT09IHN0YXRlO1xuXG4gICAgICAvLyBOb3JtYWxpemUgdGhlIGlucHV0dGVkIFVSTFxuICAgICAgdXJsID0gdGhpcy51cmxDb2RlYy5wYXJzZSh1cmwpLmhyZWY7XG5cbiAgICAgIC8vIERvbid0IGNoYW5nZSBhbnl0aGluZyBpZiBwcmV2aW91cyBhbmQgY3VycmVudCBVUkxzIGFuZCBzdGF0ZXMgbWF0Y2guXG4gICAgICBpZiAodGhpcy5sYXN0QnJvd3NlclVybCA9PT0gdXJsICYmIHNhbWVTdGF0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHRoaXMubGFzdEJyb3dzZXJVcmwgPSB1cmw7XG4gICAgICB0aGlzLmxhc3RIaXN0b3J5U3RhdGUgPSBzdGF0ZTtcblxuICAgICAgLy8gUmVtb3ZlIHNlcnZlciBiYXNlIGZyb20gVVJMIGFzIHRoZSBBbmd1bGFyIEFQSXMgZm9yIHVwZGF0aW5nIFVSTCByZXF1aXJlXG4gICAgICAvLyBpdCB0byBiZSB0aGUgcGF0aCsuXG4gICAgICB1cmwgPSB0aGlzLnN0cmlwQmFzZVVybCh0aGlzLmdldFNlcnZlckJhc2UoKSwgdXJsKSB8fCB1cmw7XG5cbiAgICAgIC8vIFNldCB0aGUgVVJMXG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB0aGlzLmxvY2F0aW9uU3RyYXRlZ3kucmVwbGFjZVN0YXRlKHN0YXRlLCAnJywgdXJsLCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxvY2F0aW9uU3RyYXRlZ3kucHVzaFN0YXRlKHN0YXRlLCAnJywgdXJsLCAnJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2FjaGVTdGF0ZSgpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICAgIC8vIGdldHRlclxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybUxvY2F0aW9uLmhyZWY7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhpcyB2YXJpYWJsZSBzaG91bGQgYmUgdXNlZCAqb25seSogaW5zaWRlIHRoZSBjYWNoZVN0YXRlIGZ1bmN0aW9uLlxuICBwcml2YXRlIGxhc3RDYWNoZWRTdGF0ZTogdW5rbm93biA9IG51bGw7XG4gIHByaXZhdGUgY2FjaGVTdGF0ZSgpIHtcbiAgICAvLyBUaGlzIHNob3VsZCBiZSB0aGUgb25seSBwbGFjZSBpbiAkYnJvd3NlciB3aGVyZSBgaGlzdG9yeS5zdGF0ZWAgaXMgcmVhZC5cbiAgICB0aGlzLmNhY2hlZFN0YXRlID0gdGhpcy5wbGF0Zm9ybUxvY2F0aW9uLmdldFN0YXRlKCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNhY2hlZFN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5jYWNoZWRTdGF0ZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gUHJldmVudCBjYWxsYmFja3MgZm8gZmlyZSB0d2ljZSBpZiBib3RoIGhhc2hjaGFuZ2UgJiBwb3BzdGF0ZSB3ZXJlIGZpcmVkLlxuICAgIGlmIChkZWVwRXF1YWwodGhpcy5jYWNoZWRTdGF0ZSwgdGhpcy5sYXN0Q2FjaGVkU3RhdGUpKSB7XG4gICAgICB0aGlzLmNhY2hlZFN0YXRlID0gdGhpcy5sYXN0Q2FjaGVkU3RhdGU7XG4gICAgfVxuXG4gICAgdGhpcy5sYXN0Q2FjaGVkU3RhdGUgPSB0aGlzLmNhY2hlZFN0YXRlO1xuICAgIHRoaXMubGFzdEhpc3RvcnlTdGF0ZSA9IHRoaXMuY2FjaGVkU3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBlbXVsYXRlcyB0aGUgJGJyb3dzZXIuc3RhdGUoKSBmdW5jdGlvbiBmcm9tIEFuZ3VsYXJKUy4gSXQgd2lsbCBjYXVzZVxuICAgKiBoaXN0b3J5LnN0YXRlIHRvIGJlIGNhY2hlZCB1bmxlc3MgY2hhbmdlZCB3aXRoIGRlZXAgZXF1YWxpdHkgY2hlY2suXG4gICAqL1xuICBwcml2YXRlIGJyb3dzZXJTdGF0ZSgpOiB1bmtub3duIHsgcmV0dXJuIHRoaXMuY2FjaGVkU3RhdGU7IH1cblxuICBwcml2YXRlIHN0cmlwQmFzZVVybChiYXNlOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKGJhc2UpKSB7XG4gICAgICByZXR1cm4gdXJsLnN1YnN0cihiYXNlLmxlbmd0aCk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZlckJhc2UoKSB7XG4gICAgY29uc3Qge3Byb3RvY29sLCBob3N0bmFtZSwgcG9ydH0gPSB0aGlzLnBsYXRmb3JtTG9jYXRpb247XG4gICAgY29uc3QgYmFzZUhyZWYgPSB0aGlzLmxvY2F0aW9uU3RyYXRlZ3kuZ2V0QmFzZUhyZWYoKTtcbiAgICBsZXQgdXJsID0gYCR7cHJvdG9jb2x9Ly8ke2hvc3RuYW1lfSR7cG9ydCA/ICc6JyArIHBvcnQgOiAnJ30ke2Jhc2VIcmVmIHx8ICcvJ31gO1xuICAgIHJldHVybiB1cmwuZW5kc1dpdGgoJy8nKSA/IHVybCA6IHVybCArICcvJztcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VBcHBVcmwodXJsOiBzdHJpbmcpIHtcbiAgICBpZiAoRE9VQkxFX1NMQVNIX1JFR0VYLnRlc3QodXJsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCYWQgUGF0aCAtIFVSTCBjYW5ub3Qgc3RhcnQgd2l0aCBkb3VibGUgc2xhc2hlczogJHt1cmx9YCk7XG4gICAgfVxuXG4gICAgbGV0IHByZWZpeGVkID0gKHVybC5jaGFyQXQoMCkgIT09ICcvJyk7XG4gICAgaWYgKHByZWZpeGVkKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIGxldCBtYXRjaCA9IHRoaXMudXJsQ29kZWMucGFyc2UodXJsLCB0aGlzLmdldFNlcnZlckJhc2UoKSk7XG4gICAgaWYgKHR5cGVvZiBtYXRjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQmFkIFVSTCAtIENhbm5vdCBwYXJzZSBVUkw6ICR7dXJsfWApO1xuICAgIH1cbiAgICBsZXQgcGF0aCA9XG4gICAgICAgIHByZWZpeGVkICYmIG1hdGNoLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nID8gbWF0Y2gucGF0aG5hbWUuc3Vic3RyaW5nKDEpIDogbWF0Y2gucGF0aG5hbWU7XG4gICAgdGhpcy4kJHBhdGggPSB0aGlzLnVybENvZGVjLmRlY29kZVBhdGgocGF0aCk7XG4gICAgdGhpcy4kJHNlYXJjaCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlU2VhcmNoKG1hdGNoLnNlYXJjaCk7XG4gICAgdGhpcy4kJGhhc2ggPSB0aGlzLnVybENvZGVjLmRlY29kZUhhc2gobWF0Y2guaGFzaCk7XG5cbiAgICAvLyBtYWtlIHN1cmUgcGF0aCBzdGFydHMgd2l0aCAnLyc7XG4gICAgaWYgKHRoaXMuJCRwYXRoICYmIHRoaXMuJCRwYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0aGlzLiQkcGF0aCA9ICcvJyArIHRoaXMuJCRwYXRoO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBVUkwgY2hhbmdlIGxpc3RlbmVycy4gVGhpcyBBUEkgY2FuIGJlIHVzZWQgdG8gY2F0Y2ggdXBkYXRlcyBwZXJmb3JtZWQgYnkgdGhlXG4gICAqIEFuZ3VsYXJKUyBmcmFtZXdvcmsuIFRoZXNlIGNoYW5nZXMgYXJlIGEgc3Vic2V0IG9mIHRoZSBgJGxvY2F0aW9uQ2hhbmdlU3RhcnQvU3VjY2Vzc2AgZXZlbnRzXG4gICAqIGFzIHRob3NlIGV2ZW50cyBmaXJlIHdoZW4gQW5ndWxhckpTIHVwZGF0ZXMgaXQncyBpbnRlcm5hbGx5IHJlZmVyZW5jZWQgdmVyc2lvbiBvZiB0aGUgYnJvd3NlclxuICAgKiBVUkwuIEl0J3MgcG9zc2libGUgZm9yIGAkbG9jYXRpb25DaGFuZ2VgIGV2ZW50cyB0byBoYXBwZW4sIGJ1dCBmb3IgdGhlIGJyb3dzZXIgVVJMXG4gICAqICh3aW5kb3cubG9jYXRpb24pIHRvIHJlbWFpbiB1bmNoYW5nZWQuIFRoaXMgYG9uQ2hhbmdlYCBjYWxsYmFjayB3aWxsIGZpcmUgb25seSB3aGVuIEFuZ3VsYXJKU1xuICAgKiBhY3R1YWxseSB1cGRhdGVzIHRoZSBicm93c2VyIFVSTCAod2luZG93LmxvY2F0aW9uKS5cbiAgICovXG4gIG9uQ2hhbmdlKFxuICAgICAgZm46ICh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24sIG9sZFVybDogc3RyaW5nLCBvbGRTdGF0ZTogdW5rbm93bikgPT4gdm9pZCxcbiAgICAgIGVycjogKGU6IEVycm9yKSA9PiB2b2lkID0gKGU6IEVycm9yKSA9PiB7fSkge1xuICAgIHRoaXMuJCRjaGFuZ2VMaXN0ZW5lcnMucHVzaChbZm4sIGVycl0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICAkJG5vdGlmeUNoYW5nZUxpc3RlbmVycyhcbiAgICAgIHVybDogc3RyaW5nID0gJycsIHN0YXRlOiB1bmtub3duLCBvbGRVcmw6IHN0cmluZyA9ICcnLCBvbGRTdGF0ZTogdW5rbm93bikge1xuICAgIHRoaXMuJCRjaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaCgoW2ZuLCBlcnJdKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBmbih1cmwsIHN0YXRlLCBvbGRVcmwsIG9sZFN0YXRlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyKGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgJCRwYXJzZSh1cmw6IHN0cmluZykge1xuICAgIGxldCBwYXRoVXJsOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBwYXRoVXJsID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW1vdmUgcHJvdG9jb2wgJiBob3N0bmFtZSBpZiBVUkwgc3RhcnRzIHdpdGggaXRcbiAgICAgIHBhdGhVcmwgPSB0aGlzLnN0cmlwQmFzZVVybCh0aGlzLmdldFNlcnZlckJhc2UoKSwgdXJsKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwYXRoVXJsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHVybCBcIiR7dXJsfVwiLCBtaXNzaW5nIHBhdGggcHJlZml4IFwiJHt0aGlzLmdldFNlcnZlckJhc2UoKX1cIi5gKTtcbiAgICB9XG5cbiAgICB0aGlzLnBhcnNlQXBwVXJsKHBhdGhVcmwpO1xuXG4gICAgaWYgKCF0aGlzLiQkcGF0aCkge1xuICAgICAgdGhpcy4kJHBhdGggPSAnLyc7XG4gICAgfVxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgfVxuXG4gICQkcGFyc2VMaW5rVXJsKHVybDogc3RyaW5nLCByZWxIcmVmPzogc3RyaW5nfG51bGwpOiBib29sZWFuIHtcbiAgICAvLyBXaGVuIHJlbEhyZWYgaXMgcGFzc2VkLCBpdCBzaG91bGQgYmUgYSBoYXNoIGFuZCBpcyBoYW5kbGVkIHNlcGFyYXRlbHlcbiAgICBpZiAocmVsSHJlZiAmJiByZWxIcmVmWzBdID09PSAnIycpIHtcbiAgICAgIHRoaXMuaGFzaChyZWxIcmVmLnNsaWNlKDEpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBsZXQgcmV3cml0dGVuVXJsO1xuICAgIGxldCBhcHBVcmwgPSB0aGlzLnN0cmlwQmFzZVVybCh0aGlzLmdldFNlcnZlckJhc2UoKSwgdXJsKTtcbiAgICBpZiAodHlwZW9mIGFwcFVybCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJld3JpdHRlblVybCA9IHRoaXMuZ2V0U2VydmVyQmFzZSgpICsgYXBwVXJsO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRTZXJ2ZXJCYXNlKCkgPT09IHVybCArICcvJykge1xuICAgICAgcmV3cml0dGVuVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCk7XG4gICAgfVxuICAgIC8vIFNldCB0aGUgVVJMXG4gICAgaWYgKHJld3JpdHRlblVybCkge1xuICAgICAgdGhpcy4kJHBhcnNlKHJld3JpdHRlblVybCk7XG4gICAgfVxuICAgIHJldHVybiAhIXJld3JpdHRlblVybDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0QnJvd3NlclVybFdpdGhGYWxsYmFjayh1cmw6IHN0cmluZywgcmVwbGFjZTogYm9vbGVhbiwgc3RhdGU6IHVua25vd24pIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybCgpO1xuICAgIGNvbnN0IG9sZFN0YXRlID0gdGhpcy4kJHN0YXRlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmJyb3dzZXJVcmwodXJsLCByZXBsYWNlLCBzdGF0ZSk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSAkbG9jYXRpb24uc3RhdGUoKSByZXR1cm5zIHJlZmVyZW50aWFsbHkgaWRlbnRpY2FsIChub3QganVzdCBkZWVwbHkgZXF1YWwpXG4gICAgICAvLyBzdGF0ZSBvYmplY3Q7IHRoaXMgbWFrZXMgcG9zc2libGUgcXVpY2sgY2hlY2tpbmcgaWYgdGhlIHN0YXRlIGNoYW5nZWQgaW4gdGhlIGRpZ2VzdFxuICAgICAgLy8gbG9vcC4gQ2hlY2tpbmcgZGVlcCBlcXVhbGl0eSB3b3VsZCBiZSB0b28gZXhwZW5zaXZlLlxuICAgICAgdGhpcy4kJHN0YXRlID0gdGhpcy5icm93c2VyU3RhdGUoKTtcbiAgICAgIHRoaXMuJCRub3RpZnlDaGFuZ2VMaXN0ZW5lcnModXJsLCBzdGF0ZSwgb2xkVXJsLCBvbGRTdGF0ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gUmVzdG9yZSBvbGQgdmFsdWVzIGlmIHB1c2hTdGF0ZSBmYWlsc1xuICAgICAgdGhpcy51cmwob2xkVXJsKTtcbiAgICAgIHRoaXMuJCRzdGF0ZSA9IG9sZFN0YXRlO1xuXG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29tcG9zZVVybHMoKSB7XG4gICAgdGhpcy4kJHVybCA9IHRoaXMudXJsQ29kZWMubm9ybWFsaXplKHRoaXMuJCRwYXRoLCB0aGlzLiQkc2VhcmNoLCB0aGlzLiQkaGFzaCk7XG4gICAgdGhpcy4kJGFic1VybCA9IHRoaXMuZ2V0U2VydmVyQmFzZSgpICsgdGhpcy4kJHVybC5zdWJzdHIoMSk7ICAvLyByZW1vdmUgJy8nIGZyb20gZnJvbnQgb2YgVVJMXG4gICAgdGhpcy51cGRhdGVCcm93c2VyID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgb25seS5cbiAgICpcbiAgICogUmV0dXJuIGZ1bGwgVVJMIHJlcHJlc2VudGF0aW9uIHdpdGggYWxsIHNlZ21lbnRzIGVuY29kZWQgYWNjb3JkaW5nIHRvIHJ1bGVzIHNwZWNpZmllZCBpblxuICAgKiBbUkZDIDM5ODZdKGh0dHA6Ly93d3cuaWV0Zi5vcmcvcmZjL3JmYzM5ODYudHh0KS5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBhYnNVcmwgPSAkbG9jYXRpb24uYWJzVXJsKCk7XG4gICAqIC8vID0+IFwiaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cIlxuICAgKiBgYGBcbiAgICovXG4gIGFic1VybCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy4kJGFic1VybDsgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybiBVUkwgKGUuZy4gYC9wYXRoP2E9YiNoYXNoYCkgd2hlbiBjYWxsZWQgd2l0aG91dCBhbnkgcGFyYW1ldGVyLlxuICAgKlxuICAgKiBDaGFuZ2UgcGF0aCwgc2VhcmNoIGFuZCBoYXNoLCB3aGVuIGNhbGxlZCB3aXRoIHBhcmFtZXRlciBhbmQgcmV0dXJuIGAkbG9jYXRpb25gLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHVybCA9ICRsb2NhdGlvbi51cmwoKTtcbiAgICogLy8gPT4gXCIvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cIlxuICAgKiBgYGBcbiAgICovXG4gIHVybCgpOiBzdHJpbmc7XG4gIHVybCh1cmw6IHN0cmluZyk6IHRoaXM7XG4gIHVybCh1cmw/OiBzdHJpbmcpOiBzdHJpbmd8dGhpcyB7XG4gICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoIXVybC5sZW5ndGgpIHtcbiAgICAgICAgdXJsID0gJy8nO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRjaCA9IFBBVEhfTUFUQ0guZXhlYyh1cmwpO1xuICAgICAgaWYgKCFtYXRjaCkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAobWF0Y2hbMV0gfHwgdXJsID09PSAnJykgdGhpcy5wYXRoKHRoaXMudXJsQ29kZWMuZGVjb2RlUGF0aChtYXRjaFsxXSkpO1xuICAgICAgaWYgKG1hdGNoWzJdIHx8IG1hdGNoWzFdIHx8IHVybCA9PT0gJycpIHRoaXMuc2VhcmNoKG1hdGNoWzNdIHx8ICcnKTtcbiAgICAgIHRoaXMuaGFzaChtYXRjaFs1XSB8fCAnJyk7XG5cbiAgICAgIC8vIENoYWluYWJsZSBtZXRob2RcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiQkdXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciBvbmx5LlxuICAgKlxuICAgKiBSZXR1cm4gcHJvdG9jb2wgb2YgY3VycmVudCBVUkwuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcHJvdG9jb2wgPSAkbG9jYXRpb24ucHJvdG9jb2woKTtcbiAgICogLy8gPT4gXCJodHRwXCJcbiAgICogYGBgXG4gICAqL1xuICBwcm90b2NvbCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy4kJHByb3RvY29sOyB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciBvbmx5LlxuICAgKlxuICAgKiBSZXR1cm4gaG9zdCBvZiBjdXJyZW50IFVSTC5cbiAgICpcbiAgICogTm90ZTogY29tcGFyZWQgdG8gdGhlIG5vbi1Bbmd1bGFySlMgdmVyc2lvbiBgbG9jYXRpb24uaG9zdGAgd2hpY2ggcmV0dXJucyBgaG9zdG5hbWU6cG9ydGAsIHRoaXNcbiAgICogcmV0dXJucyB0aGUgYGhvc3RuYW1lYCBwb3J0aW9uIG9ubHkuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG4gICAqIC8vID0+IFwiZXhhbXBsZS5jb21cIlxuICAgKlxuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL3VzZXI6cGFzc3dvcmRAZXhhbXBsZS5jb206ODA4MC8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGhvc3QgPSAkbG9jYXRpb24uaG9zdCgpO1xuICAgKiAvLyA9PiBcImV4YW1wbGUuY29tXCJcbiAgICogaG9zdCA9IGxvY2F0aW9uLmhvc3Q7XG4gICAqIC8vID0+IFwiZXhhbXBsZS5jb206ODA4MFwiXG4gICAqIGBgYFxuICAgKi9cbiAgaG9zdCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy4kJGhvc3Q7IH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIG9ubHkuXG4gICAqXG4gICAqIFJldHVybiBwb3J0IG9mIGN1cnJlbnQgVVJMLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHBvcnQgPSAkbG9jYXRpb24ucG9ydCgpO1xuICAgKiAvLyA9PiA4MFxuICAgKiBgYGBcbiAgICovXG4gIHBvcnQoKTogbnVtYmVyfG51bGwgeyByZXR1cm4gdGhpcy4kJHBvcnQ7IH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIC8gc2V0dGVyLlxuICAgKlxuICAgKiBSZXR1cm4gcGF0aCBvZiBjdXJyZW50IFVSTCB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSBwYXRoIHdoZW4gY2FsbGVkIHdpdGggcGFyYW1ldGVyIGFuZCByZXR1cm4gYCRsb2NhdGlvbmAuXG4gICAqXG4gICAqIE5vdGU6IFBhdGggc2hvdWxkIGFsd2F5cyBiZWdpbiB3aXRoIGZvcndhcmQgc2xhc2ggKC8pLCB0aGlzIG1ldGhvZCB3aWxsIGFkZCB0aGUgZm9yd2FyZCBzbGFzaFxuICAgKiBpZiBpdCBpcyBtaXNzaW5nLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHBhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuICAgKiAvLyA9PiBcIi9zb21lL3BhdGhcIlxuICAgKiBgYGBcbiAgICovXG4gIHBhdGgoKTogc3RyaW5nO1xuICBwYXRoKHBhdGg6IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHRoaXM7XG4gIHBhdGgocGF0aD86IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHN0cmluZ3x0aGlzIHtcbiAgICBpZiAodHlwZW9mIHBhdGggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy4kJHBhdGg7XG4gICAgfVxuXG4gICAgLy8gbnVsbCBwYXRoIGNvbnZlcnRzIHRvIGVtcHR5IHN0cmluZy4gUHJlcGVuZCB3aXRoIFwiL1wiIGlmIG5lZWRlZC5cbiAgICBwYXRoID0gcGF0aCAhPT0gbnVsbCA/IHBhdGgudG9TdHJpbmcoKSA6ICcnO1xuICAgIHBhdGggPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nID8gcGF0aCA6ICcvJyArIHBhdGg7XG5cbiAgICB0aGlzLiQkcGF0aCA9IHBhdGg7XG5cbiAgICB0aGlzLmNvbXBvc2VVcmxzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIC8gc2V0dGVyLlxuICAgKlxuICAgKiBSZXR1cm4gc2VhcmNoIHBhcnQgKGFzIG9iamVjdCkgb2YgY3VycmVudCBVUkwgd2hlbiBjYWxsZWQgd2l0aG91dCBhbnkgcGFyYW1ldGVyLlxuICAgKlxuICAgKiBDaGFuZ2Ugc2VhcmNoIHBhcnQgd2hlbiBjYWxsZWQgd2l0aCBwYXJhbWV0ZXIgYW5kIHJldHVybiBgJGxvY2F0aW9uYC5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBzZWFyY2hPYmplY3QgPSAkbG9jYXRpb24uc2VhcmNoKCk7XG4gICAqIC8vID0+IHtmb286ICdiYXInLCBiYXo6ICd4b3hvJ31cbiAgICpcbiAgICogLy8gc2V0IGZvbyB0byAneWlwZWUnXG4gICAqICRsb2NhdGlvbi5zZWFyY2goJ2ZvbycsICd5aXBlZScpO1xuICAgKiAvLyAkbG9jYXRpb24uc2VhcmNoKCkgPT4ge2ZvbzogJ3lpcGVlJywgYmF6OiAneG94byd9XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3QuPHN0cmluZz58T2JqZWN0LjxBcnJheS48c3RyaW5nPj59IHNlYXJjaCBOZXcgc2VhcmNoIHBhcmFtcyAtIHN0cmluZyBvclxuICAgKiBoYXNoIG9iamVjdC5cbiAgICpcbiAgICogV2hlbiBjYWxsZWQgd2l0aCBhIHNpbmdsZSBhcmd1bWVudCB0aGUgbWV0aG9kIGFjdHMgYXMgYSBzZXR0ZXIsIHNldHRpbmcgdGhlIGBzZWFyY2hgIGNvbXBvbmVudFxuICAgKiBvZiBgJGxvY2F0aW9uYCB0byB0aGUgc3BlY2lmaWVkIHZhbHVlLlxuICAgKlxuICAgKiBJZiB0aGUgYXJndW1lbnQgaXMgYSBoYXNoIG9iamVjdCBjb250YWluaW5nIGFuIGFycmF5IG9mIHZhbHVlcywgdGhlc2UgdmFsdWVzIHdpbGwgYmUgZW5jb2RlZFxuICAgKiBhcyBkdXBsaWNhdGUgc2VhcmNoIHBhcmFtZXRlcnMgaW4gdGhlIFVSTC5cbiAgICpcbiAgICogQHBhcmFtIHsoc3RyaW5nfE51bWJlcnxBcnJheTxzdHJpbmc+fGJvb2xlYW4pPX0gcGFyYW1WYWx1ZSBJZiBgc2VhcmNoYCBpcyBhIHN0cmluZyBvciBudW1iZXIsIHRoZW4gYHBhcmFtVmFsdWVgXG4gICAqIHdpbGwgb3ZlcnJpZGUgb25seSBhIHNpbmdsZSBzZWFyY2ggcHJvcGVydHkuXG4gICAqXG4gICAqIElmIGBwYXJhbVZhbHVlYCBpcyBhbiBhcnJheSwgaXQgd2lsbCBvdmVycmlkZSB0aGUgcHJvcGVydHkgb2YgdGhlIGBzZWFyY2hgIGNvbXBvbmVudCBvZlxuICAgKiBgJGxvY2F0aW9uYCBzcGVjaWZpZWQgdmlhIHRoZSBmaXJzdCBhcmd1bWVudC5cbiAgICpcbiAgICogSWYgYHBhcmFtVmFsdWVgIGlzIGBudWxsYCwgdGhlIHByb3BlcnR5IHNwZWNpZmllZCB2aWEgdGhlIGZpcnN0IGFyZ3VtZW50IHdpbGwgYmUgZGVsZXRlZC5cbiAgICpcbiAgICogSWYgYHBhcmFtVmFsdWVgIGlzIGB0cnVlYCwgdGhlIHByb3BlcnR5IHNwZWNpZmllZCB2aWEgdGhlIGZpcnN0IGFyZ3VtZW50IHdpbGwgYmUgYWRkZWQgd2l0aCBub1xuICAgKiB2YWx1ZSBub3IgdHJhaWxpbmcgZXF1YWwgc2lnbi5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSBJZiBjYWxsZWQgd2l0aCBubyBhcmd1bWVudHMgcmV0dXJucyB0aGUgcGFyc2VkIGBzZWFyY2hgIG9iamVjdC4gSWYgY2FsbGVkIHdpdGhcbiAgICogb25lIG9yIG1vcmUgYXJndW1lbnRzIHJldHVybnMgYCRsb2NhdGlvbmAgb2JqZWN0IGl0c2VsZi5cbiAgICovXG4gIHNlYXJjaCgpOiB7W2tleTogc3RyaW5nXTogdW5rbm93bn07XG4gIHNlYXJjaChzZWFyY2g6IHN0cmluZ3xudW1iZXJ8e1trZXk6IHN0cmluZ106IHVua25vd259KTogdGhpcztcbiAgc2VhcmNoKFxuICAgICAgc2VhcmNoOiBzdHJpbmd8bnVtYmVyfHtba2V5OiBzdHJpbmddOiB1bmtub3dufSxcbiAgICAgIHBhcmFtVmFsdWU6IG51bGx8dW5kZWZpbmVkfHN0cmluZ3xudW1iZXJ8Ym9vbGVhbnxzdHJpbmdbXSk6IHRoaXM7XG4gIHNlYXJjaChcbiAgICAgIHNlYXJjaD86IHN0cmluZ3xudW1iZXJ8e1trZXk6IHN0cmluZ106IHVua25vd259LFxuICAgICAgcGFyYW1WYWx1ZT86IG51bGx8dW5kZWZpbmVkfHN0cmluZ3xudW1iZXJ8Ym9vbGVhbnxzdHJpbmdbXSk6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufXx0aGlzIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIHRoaXMuJCRzZWFyY2g7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGlmICh0eXBlb2Ygc2VhcmNoID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygc2VhcmNoID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRoaXMuJCRzZWFyY2ggPSB0aGlzLnVybENvZGVjLmRlY29kZVNlYXJjaChzZWFyY2gudG9TdHJpbmcoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ29iamVjdCcgJiYgc2VhcmNoICE9PSBudWxsKSB7XG4gICAgICAgICAgLy8gQ29weSB0aGUgb2JqZWN0IHNvIGl0J3MgbmV2ZXIgbXV0YXRlZFxuICAgICAgICAgIHNlYXJjaCA9IHsuLi5zZWFyY2h9O1xuICAgICAgICAgIC8vIHJlbW92ZSBvYmplY3QgdW5kZWZpbmVkIG9yIG51bGwgcHJvcGVydGllc1xuICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNlYXJjaCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaFtrZXldID09IG51bGwpIGRlbGV0ZSBzZWFyY2hba2V5XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLiQkc2VhcmNoID0gc2VhcmNoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0xvY2F0aW9uUHJvdmlkZXIuc2VhcmNoKCk6IEZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcgb3IgYW4gb2JqZWN0LicpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgY3VycmVudFNlYXJjaCA9IHRoaXMuc2VhcmNoKCk7XG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbVZhbHVlID09PSAndW5kZWZpbmVkJyB8fCBwYXJhbVZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBkZWxldGUgY3VycmVudFNlYXJjaFtzZWFyY2hdO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoKGN1cnJlbnRTZWFyY2gpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50U2VhcmNoW3NlYXJjaF0gPSBwYXJhbVZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoKGN1cnJlbnRTZWFyY2gpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbXBvc2VVcmxzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIC8gc2V0dGVyLlxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSBoYXNoIGZyYWdtZW50IHdoZW4gY2FsbGVkIHdpdGhvdXQgYW55IHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIENoYW5nZXMgdGhlIGhhc2ggZnJhZ21lbnQgd2hlbiBjYWxsZWQgd2l0aCBhIHBhcmFtZXRlciBhbmQgcmV0dXJucyBgJGxvY2F0aW9uYC5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvI2hhc2hWYWx1ZVxuICAgKiBsZXQgaGFzaCA9ICRsb2NhdGlvbi5oYXNoKCk7XG4gICAqIC8vID0+IFwiaGFzaFZhbHVlXCJcbiAgICogYGBgXG4gICAqL1xuICBoYXNoKCk6IHN0cmluZztcbiAgaGFzaChoYXNoOiBzdHJpbmd8bnVtYmVyfG51bGwpOiB0aGlzO1xuICBoYXNoKGhhc2g/OiBzdHJpbmd8bnVtYmVyfG51bGwpOiBzdHJpbmd8dGhpcyB7XG4gICAgaWYgKHR5cGVvZiBoYXNoID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuJCRoYXNoO1xuICAgIH1cblxuICAgIHRoaXMuJCRoYXNoID0gaGFzaCAhPT0gbnVsbCA/IGhhc2gudG9TdHJpbmcoKSA6ICcnO1xuXG4gICAgdGhpcy5jb21wb3NlVXJscygpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIGNhbGxlZCwgYWxsIGNoYW5nZXMgdG8gJGxvY2F0aW9uIGR1cmluZyB0aGUgY3VycmVudCBgJGRpZ2VzdGAgd2lsbCByZXBsYWNlIHRoZSBjdXJyZW50XG4gICAqIGhpc3RvcnkgcmVjb3JkLCBpbnN0ZWFkIG9mIGFkZGluZyBhIG5ldyBvbmUuXG4gICAqL1xuICByZXBsYWNlKCk6IHRoaXMge1xuICAgIHRoaXMuJCRyZXBsYWNlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybiB0aGUgaGlzdG9yeSBzdGF0ZSBvYmplY3Qgd2hlbiBjYWxsZWQgd2l0aG91dCBhbnkgcGFyYW1ldGVyLlxuICAgKlxuICAgKiBDaGFuZ2UgdGhlIGhpc3Rvcnkgc3RhdGUgb2JqZWN0IHdoZW4gY2FsbGVkIHdpdGggb25lIHBhcmFtZXRlciBhbmQgcmV0dXJuIGAkbG9jYXRpb25gLlxuICAgKiBUaGUgc3RhdGUgb2JqZWN0IGlzIGxhdGVyIHBhc3NlZCB0byBgcHVzaFN0YXRlYCBvciBgcmVwbGFjZVN0YXRlYC5cbiAgICpcbiAgICogTk9URTogVGhpcyBtZXRob2QgaXMgc3VwcG9ydGVkIG9ubHkgaW4gSFRNTDUgbW9kZSBhbmQgb25seSBpbiBicm93c2VycyBzdXBwb3J0aW5nXG4gICAqIHRoZSBIVE1MNSBIaXN0b3J5IEFQSSAoaS5lLiBtZXRob2RzIGBwdXNoU3RhdGVgIGFuZCBgcmVwbGFjZVN0YXRlYCkuIElmIHlvdSBuZWVkIHRvIHN1cHBvcnRcbiAgICogb2xkZXIgYnJvd3NlcnMgKGxpa2UgSUU5IG9yIEFuZHJvaWQgPCA0LjApLCBkb24ndCB1c2UgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqL1xuICBzdGF0ZSgpOiB1bmtub3duO1xuICBzdGF0ZShzdGF0ZTogdW5rbm93bik6IHRoaXM7XG4gIHN0YXRlKHN0YXRlPzogdW5rbm93bik6IHVua25vd258dGhpcyB7XG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiQkc3RhdGU7XG4gICAgfVxuXG4gICAgdGhpcy4kJHN0YXRlID0gc3RhdGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBEb2NzIFRCRC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyAkbG9jYXRpb25TaGltUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgbmdVcGdyYWRlOiBVcGdyYWRlTW9kdWxlLCBwcml2YXRlIGxvY2F0aW9uOiBMb2NhdGlvbixcbiAgICAgIHByaXZhdGUgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbiwgcHJpdmF0ZSB1cmxDb2RlYzogVXJsQ29kZWMsXG4gICAgICBwcml2YXRlIGxvY2F0aW9uU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kpIHt9XG5cbiAgJGdldCgpIHtcbiAgICByZXR1cm4gbmV3ICRsb2NhdGlvblNoaW0oXG4gICAgICAgIHRoaXMubmdVcGdyYWRlLiRpbmplY3RvciwgdGhpcy5sb2NhdGlvbiwgdGhpcy5wbGF0Zm9ybUxvY2F0aW9uLCB0aGlzLnVybENvZGVjLFxuICAgICAgICB0aGlzLmxvY2F0aW9uU3RyYXRlZ3kpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0dWIgbWV0aG9kIHVzZWQgdG8ga2VlcCBBUEkgY29tcGF0aWJsZSB3aXRoIEFuZ3VsYXJKUy4gVGhpcyBzZXR0aW5nIGlzIGNvbmZpZ3VyZWQgdGhyb3VnaFxuICAgKiB0aGUgTG9jYXRpb25VcGdyYWRlTW9kdWxlJ3MgYGNvbmZpZ2AgbWV0aG9kIGluIHlvdXIgQW5ndWxhciBhcHAuXG4gICAqL1xuICBoYXNoUHJlZml4KHByZWZpeD86IHN0cmluZykge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlndXJlIExvY2F0aW9uVXBncmFkZSB0aHJvdWdoIExvY2F0aW9uVXBncmFkZU1vZHVsZS5jb25maWcgbWV0aG9kLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0dWIgbWV0aG9kIHVzZWQgdG8ga2VlcCBBUEkgY29tcGF0aWJsZSB3aXRoIEFuZ3VsYXJKUy4gVGhpcyBzZXR0aW5nIGlzIGNvbmZpZ3VyZWQgdGhyb3VnaFxuICAgKiB0aGUgTG9jYXRpb25VcGdyYWRlTW9kdWxlJ3MgYGNvbmZpZ2AgbWV0aG9kIGluIHlvdXIgQW5ndWxhciBhcHAuXG4gICAqL1xuICBodG1sNU1vZGUobW9kZT86IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlndXJlIExvY2F0aW9uVXBncmFkZSB0aHJvdWdoIExvY2F0aW9uVXBncmFkZU1vZHVsZS5jb25maWcgbWV0aG9kLicpO1xuICB9XG59XG4iXX0=