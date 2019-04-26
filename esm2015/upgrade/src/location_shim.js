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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc2hpbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi91cGdyYWRlL3NyYy9sb2NhdGlvbl9zaGltLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBWUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDOztNQUVqRCxVQUFVLEdBQUcsZ0NBQWdDOztNQUM3QyxrQkFBa0IsR0FBRyxlQUFlOztNQUNwQyxpQkFBaUIsR0FBRywyQkFBMkI7O01BQy9DLGFBQWEsR0FBNEI7SUFDN0MsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsR0FBRztJQUNiLE1BQU0sRUFBRSxFQUFFO0NBQ1g7Ozs7OztBQU9ELE1BQU0sT0FBTyxhQUFhOzs7Ozs7OztJQWdCeEIsWUFDSSxTQUFjLEVBQVUsUUFBa0IsRUFBVSxnQkFBa0MsRUFDOUUsUUFBa0IsRUFBVSxnQkFBa0M7UUFEOUMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDOUUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFqQmxFLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUVuQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBRXBCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixhQUFRLEdBQVEsRUFBRSxDQUFDO1FBQ25CLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFHcEIsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFxSzVCLG1CQUFjLEdBQVcsRUFBRSxDQUFDOztRQThDNUIsb0JB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UyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQzdFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdCLENBQUM7Ozs7Ozs7SUFNRCxVQUFVLENBQUMsTUFBZTtRQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7SUFDNUYsQ0FBQzs7Ozs7OztJQU1ELFNBQVMsQ0FBQyxJQUFVO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0VBQXdFLENBQUMsQ0FBQztJQUM1RixDQUFDO0NBQ0Y7Ozs7OztJQXpCSywwQ0FBZ0M7Ozs7O0lBQUUseUNBQTBCOzs7OztJQUM1RCxpREFBMEM7Ozs7O0lBQUUseUNBQTBCOzs7OztJQUN0RSxpREFBMEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb24sIExvY2F0aW9uU3RyYXRlZ3ksIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1VwZ3JhZGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL3VwZ3JhZGUvc3RhdGljJztcblxuaW1wb3J0IHtVcmxDb2RlY30gZnJvbSAnLi9wYXJhbXMnO1xuaW1wb3J0IHtkZWVwRXF1YWwsIGlzQW5jaG9yLCBpc1Byb21pc2V9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBQQVRIX01BVENIID0gL14oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpPyQvO1xuY29uc3QgRE9VQkxFX1NMQVNIX1JFR0VYID0gL15cXHMqW1xcXFwvXXsyLH0vO1xuY29uc3QgSUdOT1JFX1VSSV9SRUdFWFAgPSAvXlxccyooamF2YXNjcmlwdHxtYWlsdG8pOi9pO1xuY29uc3QgREVGQVVMVF9QT1JUUzoge1trZXk6IHN0cmluZ106IG51bWJlcn0gPSB7XG4gICdodHRwOic6IDgwLFxuICAnaHR0cHM6JzogNDQzLFxuICAnZnRwOic6IDIxXG59O1xuXG4vKipcbiAqIERvY3MgVEJELlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzICRsb2NhdGlvblNoaW0ge1xuICBwcml2YXRlIGluaXRhbGl6aW5nID0gdHJ1ZTtcbiAgcHJpdmF0ZSB1cGRhdGVCcm93c2VyID0gZmFsc2U7XG4gIHByaXZhdGUgJCRhYnNVcmw6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlICQkdXJsOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHByb3RvY29sOiBzdHJpbmc7XG4gIHByaXZhdGUgJCRob3N0OiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHBvcnQ6IG51bWJlcnxudWxsO1xuICBwcml2YXRlICQkcmVwbGFjZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlICQkcGF0aDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRzZWFyY2g6IGFueSA9ICcnO1xuICBwcml2YXRlICQkaGFzaDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRzdGF0ZTogdW5rbm93bjtcblxuICBwcml2YXRlIGNhY2hlZFN0YXRlOiB1bmtub3duID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgICRpbmplY3RvcjogYW55LCBwcml2YXRlIGxvY2F0aW9uOiBMb2NhdGlvbiwgcHJpdmF0ZSBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgcHJpdmF0ZSB1cmxDb2RlYzogVXJsQ29kZWMsIHByaXZhdGUgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge1xuICAgIGNvbnN0IGluaXRpYWxVcmwgPSB0aGlzLmJyb3dzZXJVcmwoKTtcblxuICAgIGxldCBwYXJzZWRVcmwgPSB0aGlzLnVybENvZGVjLnBhcnNlKGluaXRpYWxVcmwpO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJzZWRVcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyAnSW52YWxpZCBVUkwnO1xuICAgIH1cblxuICAgIHRoaXMuJCRwcm90b2NvbCA9IHBhcnNlZFVybC5wcm90b2NvbDtcbiAgICB0aGlzLiQkaG9zdCA9IHBhcnNlZFVybC5ob3N0bmFtZTtcbiAgICB0aGlzLiQkcG9ydCA9IHBhcnNlSW50KHBhcnNlZFVybC5wb3J0KSB8fCBERUZBVUxUX1BPUlRTW3BhcnNlZFVybC5wcm90b2NvbF0gfHwgbnVsbDtcblxuICAgIHRoaXMuJCRwYXJzZUxpbmtVcmwoaW5pdGlhbFVybCwgaW5pdGlhbFVybCk7XG4gICAgdGhpcy5jYWNoZVN0YXRlKCk7XG4gICAgdGhpcy4kJHN0YXRlID0gdGhpcy5icm93c2VyU3RhdGUoKTtcblxuICAgIGlmIChpc1Byb21pc2UoJGluamVjdG9yKSkge1xuICAgICAgJGluamVjdG9yLnRoZW4oJGkgPT4gdGhpcy5pbml0aWFsaXplKCRpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZSgkaW5qZWN0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZSgkaW5qZWN0b3I6IGFueSkge1xuICAgIGNvbnN0ICRyb290U2NvcGUgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdFNjb3BlJyk7XG4gICAgY29uc3QgJHJvb3RFbGVtZW50ID0gJGluamVjdG9yLmdldCgnJHJvb3RFbGVtZW50Jyk7XG5cbiAgICAkcm9vdEVsZW1lbnQub24oJ2NsaWNrJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQud2hpY2ggPT09IDIgfHxcbiAgICAgICAgICBldmVudC5idXR0b24gPT09IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgZWxtOiAoTm9kZSAmIFBhcmVudE5vZGUpfG51bGwgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIC8vIHRyYXZlcnNlIHRoZSBET00gdXAgdG8gZmluZCBmaXJzdCBBIHRhZ1xuICAgICAgd2hpbGUgKGVsbSAmJiBlbG0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2EnKSB7XG4gICAgICAgIC8vIGlnbm9yZSByZXdyaXRpbmcgaWYgbm8gQSB0YWcgKHJlYWNoZWQgcm9vdCBlbGVtZW50LCBvciBubyBwYXJlbnQgLSByZW1vdmVkIGZyb20gZG9jdW1lbnQpXG4gICAgICAgIGlmIChlbG0gPT09ICRyb290RWxlbWVudFswXSB8fCAhKGVsbSA9IGVsbS5wYXJlbnROb2RlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWlzQW5jaG9yKGVsbSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhYnNIcmVmID0gZWxtLmhyZWY7XG4gICAgICBjb25zdCByZWxIcmVmID0gZWxtLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICAvLyBJZ25vcmUgd2hlbiB1cmwgaXMgc3RhcnRlZCB3aXRoIGphdmFzY3JpcHQ6IG9yIG1haWx0bzpcbiAgICAgIGlmIChJR05PUkVfVVJJX1JFR0VYUC50ZXN0KGFic0hyZWYpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGFic0hyZWYgJiYgIWVsbS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpICYmICFldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICBpZiAodGhpcy4kJHBhcnNlTGlua1VybChhYnNIcmVmLCByZWxIcmVmKSkge1xuICAgICAgICAgIC8vIFdlIGRvIGEgcHJldmVudERlZmF1bHQgZm9yIGFsbCB1cmxzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbixcbiAgICAgICAgICAvLyBpbiBodG1sNW1vZGUgYW5kIGFsc28gd2l0aG91dCwgc28gdGhhdCB3ZSBhcmUgYWJsZSB0byBhYm9ydCBuYXZpZ2F0aW9uIHdpdGhvdXRcbiAgICAgICAgICAvLyBnZXR0aW5nIGRvdWJsZSBlbnRyaWVzIGluIHRoZSBsb2NhdGlvbiBoaXN0b3J5LlxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgLy8gdXBkYXRlIGxvY2F0aW9uIG1hbnVhbGx5XG4gICAgICAgICAgaWYgKHRoaXMuYWJzVXJsKCkgIT09IHRoaXMuYnJvd3NlclVybCgpKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5sb2NhdGlvbi5vblVybENoYW5nZSgobmV3VXJsLCBuZXdTdGF0ZSkgPT4ge1xuICAgICAgbGV0IG9sZFVybCA9IHRoaXMuYWJzVXJsKCk7XG4gICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLiQkc3RhdGU7XG4gICAgICB0aGlzLiQkcGFyc2UobmV3VXJsKTtcbiAgICAgIG5ld1VybCA9IHRoaXMuYWJzVXJsKCk7XG4gICAgICB0aGlzLiQkc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgIGNvbnN0IGRlZmF1bHRQcmV2ZW50ZWQgPVxuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBuZXdVcmwsIG9sZFVybCwgbmV3U3RhdGUsIG9sZFN0YXRlKVxuICAgICAgICAgICAgICAuZGVmYXVsdFByZXZlbnRlZDtcblxuICAgICAgLy8gaWYgdGhlIGxvY2F0aW9uIHdhcyBjaGFuZ2VkIGJ5IGEgYCRsb2NhdGlvbkNoYW5nZVN0YXJ0YCBoYW5kbGVyIHRoZW4gc3RvcFxuICAgICAgLy8gcHJvY2Vzc2luZyB0aGlzIGxvY2F0aW9uIGNoYW5nZVxuICAgICAgaWYgKHRoaXMuYWJzVXJsKCkgIT09IG5ld1VybCkgcmV0dXJuO1xuXG4gICAgICAvLyBJZiBkZWZhdWx0IHdhcyBwcmV2ZW50ZWQsIHNldCBiYWNrIHRvIG9sZCBzdGF0ZS4gVGhpcyBpcyB0aGUgc3RhdGUgdGhhdCB3YXMgbG9jYWxseVxuICAgICAgLy8gY2FjaGVkIGluIHRoZSAkbG9jYXRpb24gc2VydmljZS5cbiAgICAgIGlmIChkZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHRoaXMuJCRwYXJzZShvbGRVcmwpO1xuICAgICAgICB0aGlzLnN0YXRlKG9sZFN0YXRlKTtcbiAgICAgICAgdGhpcy5zZXRCcm93c2VyVXJsV2l0aEZhbGxiYWNrKG9sZFVybCwgZmFsc2UsIG9sZFN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5pdGFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgbmV3VXJsLCBvbGRVcmwsIG5ld1N0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMucmVzZXRCcm93c2VyVXBkYXRlKCk7XG4gICAgICB9XG4gICAgICBpZiAoISRyb290U2NvcGUuJCRwaGFzZSkge1xuICAgICAgICAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHVwZGF0ZSBicm93c2VyXG4gICAgJHJvb3RTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaW5pdGFsaXppbmcgfHwgdGhpcy51cGRhdGVCcm93c2VyKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQnJvd3NlciA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IG9sZFVybCA9IHRoaXMuYnJvd3NlclVybCgpO1xuICAgICAgICBjb25zdCBuZXdVcmwgPSB0aGlzLmFic1VybCgpO1xuICAgICAgICBjb25zdCBvbGRTdGF0ZSA9IHRoaXMuYnJvd3NlclN0YXRlKCk7XG4gICAgICAgIGxldCBjdXJyZW50UmVwbGFjZSA9IHRoaXMuJCRyZXBsYWNlO1xuXG4gICAgICAgIGNvbnN0IHVybE9yU3RhdGVDaGFuZ2VkID1cbiAgICAgICAgICAgICF0aGlzLnVybENvZGVjLmFyZUVxdWFsKG9sZFVybCwgbmV3VXJsKSB8fCBvbGRTdGF0ZSAhPT0gdGhpcy4kJHN0YXRlO1xuXG4gICAgICAgIC8vIEZpcmUgbG9jYXRpb24gY2hhbmdlcyBvbmUgdGltZSB0byBvbiBpbml0aWFsaXphdGlvbi4gVGhpcyBtdXN0IGJlIGRvbmUgb24gdGhlXG4gICAgICAgIC8vIG5leHQgdGljayAodGh1cyBpbnNpZGUgJGV2YWxBc3luYygpKSBpbiBvcmRlciBmb3IgbGlzdGVuZXJzIHRvIGJlIHJlZ2lzdGVyZWRcbiAgICAgICAgLy8gYmVmb3JlIHRoZSBldmVudCBmaXJlcy4gTWltaWNpbmcgYmVoYXZpb3IgZnJvbSAkbG9jYXRpb25XYXRjaDpcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iL21hc3Rlci9zcmMvbmcvbG9jYXRpb24uanMjTDk4M1xuICAgICAgICBpZiAodGhpcy5pbml0YWxpemluZyB8fCB1cmxPclN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgIHRoaXMuaW5pdGFsaXppbmcgPSBmYWxzZTtcblxuICAgICAgICAgICRyb290U2NvcGUuJGV2YWxBc3luYygoKSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIG5ldyBVUkwgYWdhaW4gc2luY2UgaXQgY291bGQgaGF2ZSBjaGFuZ2VkIGR1ZSB0byBhc3luYyB1cGRhdGVcbiAgICAgICAgICAgIGNvbnN0IG5ld1VybCA9IHRoaXMuYWJzVXJsKCk7XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0UHJldmVudGVkID1cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlXG4gICAgICAgICAgICAgICAgICAgIC4kYnJvYWRjYXN0KCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIG5ld1VybCwgb2xkVXJsLCB0aGlzLiQkc3RhdGUsIG9sZFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICAuZGVmYXVsdFByZXZlbnRlZDtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIGxvY2F0aW9uIHdhcyBjaGFuZ2VkIGJ5IGEgYCRsb2NhdGlvbkNoYW5nZVN0YXJ0YCBoYW5kbGVyIHRoZW4gc3RvcFxuICAgICAgICAgICAgLy8gcHJvY2Vzc2luZyB0aGlzIGxvY2F0aW9uIGNoYW5nZVxuICAgICAgICAgICAgaWYgKHRoaXMuYWJzVXJsKCkgIT09IG5ld1VybCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICB0aGlzLiQkcGFyc2Uob2xkVXJsKTtcbiAgICAgICAgICAgICAgdGhpcy4kJHN0YXRlID0gb2xkU3RhdGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGJsb2NrIGRvZXNuJ3QgcnVuIHdoZW4gaW5pdGFsaXppbmcgYmVjYXVzZSBpdCdzIGdvaW5nIHRvIHBlcmZvcm0gdGhlIHVwZGF0ZSB0b1xuICAgICAgICAgICAgICAvLyB0aGUgVVJMIHdoaWNoIHNob3VsZG4ndCBiZSBuZWVkZWQgd2hlbiBpbml0YWxpemluZy5cbiAgICAgICAgICAgICAgaWYgKHVybE9yU3RhdGVDaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRCcm93c2VyVXJsV2l0aEZhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICBuZXdVcmwsIGN1cnJlbnRSZXBsYWNlLCBvbGRTdGF0ZSA9PT0gdGhpcy4kJHN0YXRlID8gbnVsbCA6IHRoaXMuJCRzdGF0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kJHJlcGxhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoXG4gICAgICAgICAgICAgICAgICAnJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIG5ld1VybCwgb2xkVXJsLCB0aGlzLiQkc3RhdGUsIG9sZFN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy4kJHJlcGxhY2UgPSBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRCcm93c2VyVXBkYXRlKCkge1xuICAgIHRoaXMuJCRyZXBsYWNlID0gZmFsc2U7XG4gICAgdGhpcy4kJHN0YXRlID0gdGhpcy5icm93c2VyU3RhdGUoKTtcbiAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3RCcm93c2VyVXJsID0gdGhpcy5icm93c2VyVXJsKCk7XG4gIH1cblxuICBwcml2YXRlIGxhc3RIaXN0b3J5U3RhdGU6IHVua25vd247XG4gIHByaXZhdGUgbGFzdEJyb3dzZXJVcmw6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIGJyb3dzZXJVcmwoKTogc3RyaW5nO1xuICBwcml2YXRlIGJyb3dzZXJVcmwodXJsOiBzdHJpbmcsIHJlcGxhY2U/OiBib29sZWFuLCBzdGF0ZT86IHVua25vd24pOiB0aGlzO1xuICBwcml2YXRlIGJyb3dzZXJVcmwodXJsPzogc3RyaW5nLCByZXBsYWNlPzogYm9vbGVhbiwgc3RhdGU/OiB1bmtub3duKSB7XG4gICAgLy8gSW4gbW9kZXJuIGJyb3dzZXJzIGBoaXN0b3J5LnN0YXRlYCBpcyBgbnVsbGAgYnkgZGVmYXVsdDsgdHJlYXRpbmcgaXQgc2VwYXJhdGVseVxuICAgIC8vIGZyb20gYHVuZGVmaW5lZGAgd291bGQgY2F1c2UgYCRicm93c2VyLnVybCgnL2ZvbycpYCB0byBjaGFuZ2UgYGhpc3Rvcnkuc3RhdGVgXG4gICAgLy8gdG8gdW5kZWZpbmVkIHZpYSBgcHVzaFN0YXRlYC4gSW5zdGVhZCwgbGV0J3MgY2hhbmdlIGB1bmRlZmluZWRgIHRvIGBudWxsYCBoZXJlLlxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzdGF0ZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gc2V0dGVyXG4gICAgaWYgKHVybCkge1xuICAgICAgbGV0IHNhbWVTdGF0ZSA9IHRoaXMubGFzdEhpc3RvcnlTdGF0ZSA9PT0gc3RhdGU7XG5cbiAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgaW5wdXR0ZWQgVVJMXG4gICAgICB1cmwgPSB0aGlzLnVybENvZGVjLnBhcnNlKHVybCkuaHJlZjtcblxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIGFueXRoaW5nIGlmIHByZXZpb3VzIGFuZCBjdXJyZW50IFVSTHMgYW5kIHN0YXRlcyBtYXRjaC5cbiAgICAgIGlmICh0aGlzLmxhc3RCcm93c2VyVXJsID09PSB1cmwgJiYgc2FtZVN0YXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdGhpcy5sYXN0QnJvd3NlclVybCA9IHVybDtcbiAgICAgIHRoaXMubGFzdEhpc3RvcnlTdGF0ZSA9IHN0YXRlO1xuXG4gICAgICAvLyBSZW1vdmUgc2VydmVyIGJhc2UgZnJvbSBVUkwgYXMgdGhlIEFuZ3VsYXIgQVBJcyBmb3IgdXBkYXRpbmcgVVJMIHJlcXVpcmVcbiAgICAgIC8vIGl0IHRvIGJlIHRoZSBwYXRoKy5cbiAgICAgIHVybCA9IHRoaXMuc3RyaXBCYXNlVXJsKHRoaXMuZ2V0U2VydmVyQmFzZSgpLCB1cmwpIHx8IHVybDtcblxuICAgICAgLy8gU2V0IHRoZSBVUkxcbiAgICAgIGlmIChyZXBsYWNlKSB7XG4gICAgICAgIHRoaXMubG9jYXRpb25TdHJhdGVneS5yZXBsYWNlU3RhdGUoc3RhdGUsICcnLCB1cmwsICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubG9jYXRpb25TdHJhdGVneS5wdXNoU3RhdGUoc3RhdGUsICcnLCB1cmwsICcnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWNoZVN0YXRlKCk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgICAgLy8gZ2V0dGVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBsYXRmb3JtTG9jYXRpb24uaHJlZjtcbiAgICB9XG4gIH1cblxuICAvLyBUaGlzIHZhcmlhYmxlIHNob3VsZCBiZSB1c2VkICpvbmx5KiBpbnNpZGUgdGhlIGNhY2hlU3RhdGUgZnVuY3Rpb24uXG4gIHByaXZhdGUgbGFzdENhY2hlZFN0YXRlOiB1bmtub3duID0gbnVsbDtcbiAgcHJpdmF0ZSBjYWNoZVN0YXRlKCkge1xuICAgIC8vIFRoaXMgc2hvdWxkIGJlIHRoZSBvbmx5IHBsYWNlIGluICRicm93c2VyIHdoZXJlIGBoaXN0b3J5LnN0YXRlYCBpcyByZWFkLlxuICAgIHRoaXMuY2FjaGVkU3RhdGUgPSB0aGlzLnBsYXRmb3JtTG9jYXRpb24uZ2V0U3RhdGUoKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuY2FjaGVkU3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmNhY2hlZFN0YXRlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBQcmV2ZW50IGNhbGxiYWNrcyBmbyBmaXJlIHR3aWNlIGlmIGJvdGggaGFzaGNoYW5nZSAmIHBvcHN0YXRlIHdlcmUgZmlyZWQuXG4gICAgaWYgKGRlZXBFcXVhbCh0aGlzLmNhY2hlZFN0YXRlLCB0aGlzLmxhc3RDYWNoZWRTdGF0ZSkpIHtcbiAgICAgIHRoaXMuY2FjaGVkU3RhdGUgPSB0aGlzLmxhc3RDYWNoZWRTdGF0ZTtcbiAgICB9XG5cbiAgICB0aGlzLmxhc3RDYWNoZWRTdGF0ZSA9IHRoaXMuY2FjaGVkU3RhdGU7XG4gICAgdGhpcy5sYXN0SGlzdG9yeVN0YXRlID0gdGhpcy5jYWNoZWRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGVtdWxhdGVzIHRoZSAkYnJvd3Nlci5zdGF0ZSgpIGZ1bmN0aW9uIGZyb20gQW5ndWxhckpTLiBJdCB3aWxsIGNhdXNlXG4gICAqIGhpc3Rvcnkuc3RhdGUgdG8gYmUgY2FjaGVkIHVubGVzcyBjaGFuZ2VkIHdpdGggZGVlcCBlcXVhbGl0eSBjaGVjay5cbiAgICovXG4gIHByaXZhdGUgYnJvd3NlclN0YXRlKCk6IHVua25vd24geyByZXR1cm4gdGhpcy5jYWNoZWRTdGF0ZTsgfVxuXG4gIHByaXZhdGUgc3RyaXBCYXNlVXJsKGJhc2U6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoYmFzZSkpIHtcbiAgICAgIHJldHVybiB1cmwuc3Vic3RyKGJhc2UubGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2VydmVyQmFzZSgpIHtcbiAgICBjb25zdCB7cHJvdG9jb2wsIGhvc3RuYW1lLCBwb3J0fSA9IHRoaXMucGxhdGZvcm1Mb2NhdGlvbjtcbiAgICBjb25zdCBiYXNlSHJlZiA9IHRoaXMubG9jYXRpb25TdHJhdGVneS5nZXRCYXNlSHJlZigpO1xuICAgIGxldCB1cmwgPSBgJHtwcm90b2NvbH0vLyR7aG9zdG5hbWV9JHtwb3J0ID8gJzonICsgcG9ydCA6ICcnfSR7YmFzZUhyZWYgfHwgJy8nfWA7XG4gICAgcmV0dXJuIHVybC5lbmRzV2l0aCgnLycpID8gdXJsIDogdXJsICsgJy8nO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUFwcFVybCh1cmw6IHN0cmluZykge1xuICAgIGlmIChET1VCTEVfU0xBU0hfUkVHRVgudGVzdCh1cmwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEJhZCBQYXRoIC0gVVJMIGNhbm5vdCBzdGFydCB3aXRoIGRvdWJsZSBzbGFzaGVzOiAke3VybH1gKTtcbiAgICB9XG5cbiAgICBsZXQgcHJlZml4ZWQgPSAodXJsLmNoYXJBdCgwKSAhPT0gJy8nKTtcbiAgICBpZiAocHJlZml4ZWQpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgbGV0IG1hdGNoID0gdGhpcy51cmxDb2RlYy5wYXJzZSh1cmwsIHRoaXMuZ2V0U2VydmVyQmFzZSgpKTtcbiAgICBpZiAodHlwZW9mIG1hdGNoID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCYWQgVVJMIC0gQ2Fubm90IHBhcnNlIFVSTDogJHt1cmx9YCk7XG4gICAgfVxuICAgIGxldCBwYXRoID1cbiAgICAgICAgcHJlZml4ZWQgJiYgbWF0Y2gucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycgPyBtYXRjaC5wYXRobmFtZS5zdWJzdHJpbmcoMSkgOiBtYXRjaC5wYXRobmFtZTtcbiAgICB0aGlzLiQkcGF0aCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlUGF0aChwYXRoKTtcbiAgICB0aGlzLiQkc2VhcmNoID0gdGhpcy51cmxDb2RlYy5kZWNvZGVTZWFyY2gobWF0Y2guc2VhcmNoKTtcbiAgICB0aGlzLiQkaGFzaCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlSGFzaChtYXRjaC5oYXNoKTtcblxuICAgIC8vIG1ha2Ugc3VyZSBwYXRoIHN0YXJ0cyB3aXRoICcvJztcbiAgICBpZiAodGhpcy4kJHBhdGggJiYgdGhpcy4kJHBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHRoaXMuJCRwYXRoID0gJy8nICsgdGhpcy4kJHBhdGg7XG4gICAgfVxuICB9XG5cbiAgJCRwYXJzZSh1cmw6IHN0cmluZykge1xuICAgIGxldCBwYXRoVXJsOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBwYXRoVXJsID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW1vdmUgcHJvdG9jb2wgJiBob3N0bmFtZSBpZiBVUkwgc3RhcnRzIHdpdGggaXRcbiAgICAgIHBhdGhVcmwgPSB0aGlzLnN0cmlwQmFzZVVybCh0aGlzLmdldFNlcnZlckJhc2UoKSwgdXJsKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwYXRoVXJsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHVybCBcIiR7dXJsfVwiLCBtaXNzaW5nIHBhdGggcHJlZml4IFwiJHt0aGlzLmdldFNlcnZlckJhc2UoKX1cIi5gKTtcbiAgICB9XG5cbiAgICB0aGlzLnBhcnNlQXBwVXJsKHBhdGhVcmwpO1xuXG4gICAgaWYgKCF0aGlzLiQkcGF0aCkge1xuICAgICAgdGhpcy4kJHBhdGggPSAnLyc7XG4gICAgfVxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgfVxuXG4gICQkcGFyc2VMaW5rVXJsKHVybDogc3RyaW5nLCByZWxIcmVmPzogc3RyaW5nfG51bGwpOiBib29sZWFuIHtcbiAgICAvLyBXaGVuIHJlbEhyZWYgaXMgcGFzc2VkLCBpdCBzaG91bGQgYmUgYSBoYXNoIGFuZCBpcyBoYW5kbGVkIHNlcGFyYXRlbHlcbiAgICBpZiAocmVsSHJlZiAmJiByZWxIcmVmWzBdID09PSAnIycpIHtcbiAgICAgIHRoaXMuaGFzaChyZWxIcmVmLnNsaWNlKDEpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBsZXQgcmV3cml0dGVuVXJsO1xuICAgIGxldCBhcHBVcmwgPSB0aGlzLnN0cmlwQmFzZVVybCh0aGlzLmdldFNlcnZlckJhc2UoKSwgdXJsKTtcbiAgICBpZiAodHlwZW9mIGFwcFVybCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJld3JpdHRlblVybCA9IHRoaXMuZ2V0U2VydmVyQmFzZSgpICsgYXBwVXJsO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRTZXJ2ZXJCYXNlKCkgPT09IHVybCArICcvJykge1xuICAgICAgcmV3cml0dGVuVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCk7XG4gICAgfVxuICAgIC8vIFNldCB0aGUgVVJMXG4gICAgaWYgKHJld3JpdHRlblVybCkge1xuICAgICAgdGhpcy4kJHBhcnNlKHJld3JpdHRlblVybCk7XG4gICAgfVxuICAgIHJldHVybiAhIXJld3JpdHRlblVybDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0QnJvd3NlclVybFdpdGhGYWxsYmFjayh1cmw6IHN0cmluZywgcmVwbGFjZTogYm9vbGVhbiwgc3RhdGU6IHVua25vd24pIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybCgpO1xuICAgIGNvbnN0IG9sZFN0YXRlID0gdGhpcy4kJHN0YXRlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmJyb3dzZXJVcmwodXJsLCByZXBsYWNlLCBzdGF0ZSk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSAkbG9jYXRpb24uc3RhdGUoKSByZXR1cm5zIHJlZmVyZW50aWFsbHkgaWRlbnRpY2FsIChub3QganVzdCBkZWVwbHkgZXF1YWwpXG4gICAgICAvLyBzdGF0ZSBvYmplY3Q7IHRoaXMgbWFrZXMgcG9zc2libGUgcXVpY2sgY2hlY2tpbmcgaWYgdGhlIHN0YXRlIGNoYW5nZWQgaW4gdGhlIGRpZ2VzdFxuICAgICAgLy8gbG9vcC4gQ2hlY2tpbmcgZGVlcCBlcXVhbGl0eSB3b3VsZCBiZSB0b28gZXhwZW5zaXZlLlxuICAgICAgdGhpcy4kJHN0YXRlID0gdGhpcy5icm93c2VyU3RhdGUoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBSZXN0b3JlIG9sZCB2YWx1ZXMgaWYgcHVzaFN0YXRlIGZhaWxzXG4gICAgICB0aGlzLnVybChvbGRVcmwpO1xuICAgICAgdGhpcy4kJHN0YXRlID0gb2xkU3RhdGU7XG5cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb21wb3NlVXJscygpIHtcbiAgICB0aGlzLiQkdXJsID0gdGhpcy51cmxDb2RlYy5ub3JtYWxpemUodGhpcy4kJHBhdGgsIHRoaXMuJCRzZWFyY2gsIHRoaXMuJCRoYXNoKTtcbiAgICB0aGlzLiQkYWJzVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCkgKyB0aGlzLiQkdXJsLnN1YnN0cigxKTsgIC8vIHJlbW92ZSAnLycgZnJvbSBmcm9udCBvZiBVUkxcbiAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciBvbmx5LlxuICAgKlxuICAgKiBSZXR1cm4gZnVsbCBVUkwgcmVwcmVzZW50YXRpb24gd2l0aCBhbGwgc2VnbWVudHMgZW5jb2RlZCBhY2NvcmRpbmcgdG8gcnVsZXMgc3BlY2lmaWVkIGluXG4gICAqIFtSRkMgMzk4Nl0oaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQpLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IGFic1VybCA9ICRsb2NhdGlvbi5hYnNVcmwoKTtcbiAgICogLy8gPT4gXCJodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1wiXG4gICAqIGBgYFxuICAgKi9cbiAgYWJzVXJsKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkYWJzVXJsOyB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciAvIHNldHRlci5cbiAgICpcbiAgICogUmV0dXJuIFVSTCAoZS5nLiBgL3BhdGg/YT1iI2hhc2hgKSB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSBwYXRoLCBzZWFyY2ggYW5kIGhhc2gsIHdoZW4gY2FsbGVkIHdpdGggcGFyYW1ldGVyIGFuZCByZXR1cm4gYCRsb2NhdGlvbmAuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgdXJsID0gJGxvY2F0aW9uLnVybCgpO1xuICAgKiAvLyA9PiBcIi9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1wiXG4gICAqIGBgYFxuICAgKi9cbiAgdXJsKCk6IHN0cmluZztcbiAgdXJsKHVybDogc3RyaW5nKTogdGhpcztcbiAgdXJsKHVybD86IHN0cmluZyk6IHN0cmluZ3x0aGlzIHtcbiAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdXJsLmxlbmd0aCkge1xuICAgICAgICB1cmwgPSAnLyc7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1hdGNoID0gUEFUSF9NQVRDSC5leGVjKHVybCk7XG4gICAgICBpZiAoIW1hdGNoKSByZXR1cm4gdGhpcztcbiAgICAgIGlmIChtYXRjaFsxXSB8fCB1cmwgPT09ICcnKSB0aGlzLnBhdGgodGhpcy51cmxDb2RlYy5kZWNvZGVQYXRoKG1hdGNoWzFdKSk7XG4gICAgICBpZiAobWF0Y2hbMl0gfHwgbWF0Y2hbMV0gfHwgdXJsID09PSAnJykgdGhpcy5zZWFyY2gobWF0Y2hbM10gfHwgJycpO1xuICAgICAgdGhpcy5oYXNoKG1hdGNoWzVdIHx8ICcnKTtcblxuICAgICAgLy8gQ2hhaW5hYmxlIG1ldGhvZFxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJCR1cmw7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIG9ubHkuXG4gICAqXG4gICAqIFJldHVybiBwcm90b2NvbCBvZiBjdXJyZW50IFVSTC5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBwcm90b2NvbCA9ICRsb2NhdGlvbi5wcm90b2NvbCgpO1xuICAgKiAvLyA9PiBcImh0dHBcIlxuICAgKiBgYGBcbiAgICovXG4gIHByb3RvY29sKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkcHJvdG9jb2w7IH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIG9ubHkuXG4gICAqXG4gICAqIFJldHVybiBob3N0IG9mIGN1cnJlbnQgVVJMLlxuICAgKlxuICAgKiBOb3RlOiBjb21wYXJlZCB0byB0aGUgbm9uLUFuZ3VsYXJKUyB2ZXJzaW9uIGBsb2NhdGlvbi5ob3N0YCB3aGljaCByZXR1cm5zIGBob3N0bmFtZTpwb3J0YCwgdGhpc1xuICAgKiByZXR1cm5zIHRoZSBgaG9zdG5hbWVgIHBvcnRpb24gb25seS5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbVwiXG4gICAqXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vdXNlcjpwYXNzd29yZEBleGFtcGxlLmNvbTo4MDgwLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG4gICAqIC8vID0+IFwiZXhhbXBsZS5jb21cIlxuICAgKiBob3N0ID0gbG9jYXRpb24uaG9zdDtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbTo4MDgwXCJcbiAgICogYGBgXG4gICAqL1xuICBob3N0KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkaG9zdDsgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgb25seS5cbiAgICpcbiAgICogUmV0dXJuIHBvcnQgb2YgY3VycmVudCBVUkwuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcG9ydCA9ICRsb2NhdGlvbi5wb3J0KCk7XG4gICAqIC8vID0+IDgwXG4gICAqIGBgYFxuICAgKi9cbiAgcG9ydCgpOiBudW1iZXJ8bnVsbCB7IHJldHVybiB0aGlzLiQkcG9ydDsgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybiBwYXRoIG9mIGN1cnJlbnQgVVJMIHdoZW4gY2FsbGVkIHdpdGhvdXQgYW55IHBhcmFtZXRlci5cbiAgICpcbiAgICogQ2hhbmdlIHBhdGggd2hlbiBjYWxsZWQgd2l0aCBwYXJhbWV0ZXIgYW5kIHJldHVybiBgJGxvY2F0aW9uYC5cbiAgICpcbiAgICogTm90ZTogUGF0aCBzaG91bGQgYWx3YXlzIGJlZ2luIHdpdGggZm9yd2FyZCBzbGFzaCAoLyksIHRoaXMgbWV0aG9kIHdpbGwgYWRkIHRoZSBmb3J3YXJkIHNsYXNoXG4gICAqIGlmIGl0IGlzIG1pc3NpbmcuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG4gICAqIC8vID0+IFwiL3NvbWUvcGF0aFwiXG4gICAqIGBgYFxuICAgKi9cbiAgcGF0aCgpOiBzdHJpbmc7XG4gIHBhdGgocGF0aDogc3RyaW5nfG51bWJlcnxudWxsKTogdGhpcztcbiAgcGF0aChwYXRoPzogc3RyaW5nfG51bWJlcnxudWxsKTogc3RyaW5nfHRoaXMge1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiQkcGF0aDtcbiAgICB9XG5cbiAgICAvLyBudWxsIHBhdGggY29udmVydHMgdG8gZW1wdHkgc3RyaW5nLiBQcmVwZW5kIHdpdGggXCIvXCIgaWYgbmVlZGVkLlxuICAgIHBhdGggPSBwYXRoICE9PSBudWxsID8gcGF0aC50b1N0cmluZygpIDogJyc7XG4gICAgcGF0aCA9IHBhdGguY2hhckF0KDApID09PSAnLycgPyBwYXRoIDogJy8nICsgcGF0aDtcblxuICAgIHRoaXMuJCRwYXRoID0gcGF0aDtcblxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybiBzZWFyY2ggcGFydCAoYXMgb2JqZWN0KSBvZiBjdXJyZW50IFVSTCB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSBzZWFyY2ggcGFydCB3aGVuIGNhbGxlZCB3aXRoIHBhcmFtZXRlciBhbmQgcmV0dXJuIGAkbG9jYXRpb25gLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHNlYXJjaE9iamVjdCA9ICRsb2NhdGlvbi5zZWFyY2goKTtcbiAgICogLy8gPT4ge2ZvbzogJ2JhcicsIGJhejogJ3hveG8nfVxuICAgKlxuICAgKiAvLyBzZXQgZm9vIHRvICd5aXBlZSdcbiAgICogJGxvY2F0aW9uLnNlYXJjaCgnZm9vJywgJ3lpcGVlJyk7XG4gICAqIC8vICRsb2NhdGlvbi5zZWFyY2goKSA9PiB7Zm9vOiAneWlwZWUnLCBiYXo6ICd4b3hvJ31cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdC48c3RyaW5nPnxPYmplY3QuPEFycmF5LjxzdHJpbmc+Pn0gc2VhcmNoIE5ldyBzZWFyY2ggcGFyYW1zIC0gc3RyaW5nIG9yXG4gICAqIGhhc2ggb2JqZWN0LlxuICAgKlxuICAgKiBXaGVuIGNhbGxlZCB3aXRoIGEgc2luZ2xlIGFyZ3VtZW50IHRoZSBtZXRob2QgYWN0cyBhcyBhIHNldHRlciwgc2V0dGluZyB0aGUgYHNlYXJjaGAgY29tcG9uZW50XG4gICAqIG9mIGAkbG9jYXRpb25gIHRvIHRoZSBzcGVjaWZpZWQgdmFsdWUuXG4gICAqXG4gICAqIElmIHRoZSBhcmd1bWVudCBpcyBhIGhhc2ggb2JqZWN0IGNvbnRhaW5pbmcgYW4gYXJyYXkgb2YgdmFsdWVzLCB0aGVzZSB2YWx1ZXMgd2lsbCBiZSBlbmNvZGVkXG4gICAqIGFzIGR1cGxpY2F0ZSBzZWFyY2ggcGFyYW1ldGVycyBpbiB0aGUgVVJMLlxuICAgKlxuICAgKiBAcGFyYW0geyhzdHJpbmd8TnVtYmVyfEFycmF5PHN0cmluZz58Ym9vbGVhbik9fSBwYXJhbVZhbHVlIElmIGBzZWFyY2hgIGlzIGEgc3RyaW5nIG9yIG51bWJlciwgdGhlbiBgcGFyYW1WYWx1ZWBcbiAgICogd2lsbCBvdmVycmlkZSBvbmx5IGEgc2luZ2xlIHNlYXJjaCBwcm9wZXJ0eS5cbiAgICpcbiAgICogSWYgYHBhcmFtVmFsdWVgIGlzIGFuIGFycmF5LCBpdCB3aWxsIG92ZXJyaWRlIHRoZSBwcm9wZXJ0eSBvZiB0aGUgYHNlYXJjaGAgY29tcG9uZW50IG9mXG4gICAqIGAkbG9jYXRpb25gIHNwZWNpZmllZCB2aWEgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgKlxuICAgKiBJZiBgcGFyYW1WYWx1ZWAgaXMgYG51bGxgLCB0aGUgcHJvcGVydHkgc3BlY2lmaWVkIHZpYSB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBkZWxldGVkLlxuICAgKlxuICAgKiBJZiBgcGFyYW1WYWx1ZWAgaXMgYHRydWVgLCB0aGUgcHJvcGVydHkgc3BlY2lmaWVkIHZpYSB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBhZGRlZCB3aXRoIG5vXG4gICAqIHZhbHVlIG5vciB0cmFpbGluZyBlcXVhbCBzaWduLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IElmIGNhbGxlZCB3aXRoIG5vIGFyZ3VtZW50cyByZXR1cm5zIHRoZSBwYXJzZWQgYHNlYXJjaGAgb2JqZWN0LiBJZiBjYWxsZWQgd2l0aFxuICAgKiBvbmUgb3IgbW9yZSBhcmd1bWVudHMgcmV0dXJucyBgJGxvY2F0aW9uYCBvYmplY3QgaXRzZWxmLlxuICAgKi9cbiAgc2VhcmNoKCk6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufTtcbiAgc2VhcmNoKHNlYXJjaDogc3RyaW5nfG51bWJlcnx7W2tleTogc3RyaW5nXTogdW5rbm93bn0pOiB0aGlzO1xuICBzZWFyY2goXG4gICAgICBzZWFyY2g6IHN0cmluZ3xudW1iZXJ8e1trZXk6IHN0cmluZ106IHVua25vd259LFxuICAgICAgcGFyYW1WYWx1ZTogbnVsbHx1bmRlZmluZWR8c3RyaW5nfG51bWJlcnxib29sZWFufHN0cmluZ1tdKTogdGhpcztcbiAgc2VhcmNoKFxuICAgICAgc2VhcmNoPzogc3RyaW5nfG51bWJlcnx7W2tleTogc3RyaW5nXTogdW5rbm93bn0sXG4gICAgICBwYXJhbVZhbHVlPzogbnVsbHx1bmRlZmluZWR8c3RyaW5nfG51bWJlcnxib29sZWFufHN0cmluZ1tdKToge1trZXk6IHN0cmluZ106IHVua25vd259fHRoaXMge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy4kJHNlYXJjaDtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzZWFyY2ggPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy4kJHNlYXJjaCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlU2VhcmNoKHNlYXJjaC50b1N0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VhcmNoID09PSAnb2JqZWN0JyAmJiBzZWFyY2ggIT09IG51bGwpIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBvYmplY3Qgc28gaXQncyBuZXZlciBtdXRhdGVkXG4gICAgICAgICAgc2VhcmNoID0gey4uLnNlYXJjaH07XG4gICAgICAgICAgLy8gcmVtb3ZlIG9iamVjdCB1bmRlZmluZWQgb3IgbnVsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2VhcmNoKSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoW2tleV0gPT0gbnVsbCkgZGVsZXRlIHNlYXJjaFtrZXldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuJCRzZWFyY2ggPSBzZWFyY2g7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnTG9jYXRpb25Qcm92aWRlci5zZWFyY2goKTogRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZyBvciBhbiBvYmplY3QuJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50U2VhcmNoID0gdGhpcy5zZWFyY2goKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtVmFsdWUgPT09ICd1bmRlZmluZWQnIHx8IHBhcmFtVmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjdXJyZW50U2VhcmNoW3NlYXJjaF07XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2goY3VycmVudFNlYXJjaCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRTZWFyY2hbc2VhcmNoXSA9IHBhcmFtVmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2goY3VycmVudFNlYXJjaCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybnMgdGhlIGhhc2ggZnJhZ21lbnQgd2hlbiBjYWxsZWQgd2l0aG91dCBhbnkgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQ2hhbmdlcyB0aGUgaGFzaCBmcmFnbWVudCB3aGVuIGNhbGxlZCB3aXRoIGEgcGFyYW1ldGVyIGFuZCByZXR1cm5zIGAkbG9jYXRpb25gLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG8jaGFzaFZhbHVlXG4gICAqIGxldCBoYXNoID0gJGxvY2F0aW9uLmhhc2goKTtcbiAgICogLy8gPT4gXCJoYXNoVmFsdWVcIlxuICAgKiBgYGBcbiAgICovXG4gIGhhc2goKTogc3RyaW5nO1xuICBoYXNoKGhhc2g6IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHRoaXM7XG4gIGhhc2goaGFzaD86IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHN0cmluZ3x0aGlzIHtcbiAgICBpZiAodHlwZW9mIGhhc2ggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy4kJGhhc2g7XG4gICAgfVxuXG4gICAgdGhpcy4kJGhhc2ggPSBoYXNoICE9PSBudWxsID8gaGFzaC50b1N0cmluZygpIDogJyc7XG5cbiAgICB0aGlzLmNvbXBvc2VVcmxzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSWYgY2FsbGVkLCBhbGwgY2hhbmdlcyB0byAkbG9jYXRpb24gZHVyaW5nIHRoZSBjdXJyZW50IGAkZGlnZXN0YCB3aWxsIHJlcGxhY2UgdGhlIGN1cnJlbnRcbiAgICogaGlzdG9yeSByZWNvcmQsIGluc3RlYWQgb2YgYWRkaW5nIGEgbmV3IG9uZS5cbiAgICovXG4gIHJlcGxhY2UoKTogdGhpcyB7XG4gICAgdGhpcy4kJHJlcGxhY2UgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciAvIHNldHRlci5cbiAgICpcbiAgICogUmV0dXJuIHRoZSBoaXN0b3J5IHN0YXRlIG9iamVjdCB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSB0aGUgaGlzdG9yeSBzdGF0ZSBvYmplY3Qgd2hlbiBjYWxsZWQgd2l0aCBvbmUgcGFyYW1ldGVyIGFuZCByZXR1cm4gYCRsb2NhdGlvbmAuXG4gICAqIFRoZSBzdGF0ZSBvYmplY3QgaXMgbGF0ZXIgcGFzc2VkIHRvIGBwdXNoU3RhdGVgIG9yIGByZXBsYWNlU3RhdGVgLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1ldGhvZCBpcyBzdXBwb3J0ZWQgb25seSBpbiBIVE1MNSBtb2RlIGFuZCBvbmx5IGluIGJyb3dzZXJzIHN1cHBvcnRpbmdcbiAgICogdGhlIEhUTUw1IEhpc3RvcnkgQVBJIChpLmUuIG1ldGhvZHMgYHB1c2hTdGF0ZWAgYW5kIGByZXBsYWNlU3RhdGVgKS4gSWYgeW91IG5lZWQgdG8gc3VwcG9ydFxuICAgKiBvbGRlciBicm93c2VycyAobGlrZSBJRTkgb3IgQW5kcm9pZCA8IDQuMCksIGRvbid0IHVzZSB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICovXG4gIHN0YXRlKCk6IHVua25vd247XG4gIHN0YXRlKHN0YXRlOiB1bmtub3duKTogdGhpcztcbiAgc3RhdGUoc3RhdGU/OiB1bmtub3duKTogdW5rbm93bnx0aGlzIHtcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuJCRzdGF0ZTtcbiAgICB9XG5cbiAgICB0aGlzLiQkc3RhdGUgPSBzdGF0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIERvY3MgVEJELlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzICRsb2NhdGlvblNoaW1Qcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBuZ1VwZ3JhZGU6IFVwZ3JhZGVNb2R1bGUsIHByaXZhdGUgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgcHJpdmF0ZSBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLCBwcml2YXRlIHVybENvZGVjOiBVcmxDb2RlYyxcbiAgICAgIHByaXZhdGUgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge31cblxuICAkZ2V0KCkge1xuICAgIHJldHVybiBuZXcgJGxvY2F0aW9uU2hpbShcbiAgICAgICAgdGhpcy5uZ1VwZ3JhZGUuJGluamVjdG9yLCB0aGlzLmxvY2F0aW9uLCB0aGlzLnBsYXRmb3JtTG9jYXRpb24sIHRoaXMudXJsQ29kZWMsXG4gICAgICAgIHRoaXMubG9jYXRpb25TdHJhdGVneSk7XG4gIH1cblxuICAvKipcbiAgICogU3R1YiBtZXRob2QgdXNlZCB0byBrZWVwIEFQSSBjb21wYXRpYmxlIHdpdGggQW5ndWxhckpTLiBUaGlzIHNldHRpbmcgaXMgY29uZmlndXJlZCB0aHJvdWdoXG4gICAqIHRoZSBMb2NhdGlvblVwZ3JhZGVNb2R1bGUncyBgY29uZmlnYCBtZXRob2QgaW4geW91ciBBbmd1bGFyIGFwcC5cbiAgICovXG4gIGhhc2hQcmVmaXgocHJlZml4Pzogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb25maWd1cmUgTG9jYXRpb25VcGdyYWRlIHRocm91Z2ggTG9jYXRpb25VcGdyYWRlTW9kdWxlLmNvbmZpZyBtZXRob2QuJyk7XG4gIH1cblxuICAvKipcbiAgICogU3R1YiBtZXRob2QgdXNlZCB0byBrZWVwIEFQSSBjb21wYXRpYmxlIHdpdGggQW5ndWxhckpTLiBUaGlzIHNldHRpbmcgaXMgY29uZmlndXJlZCB0aHJvdWdoXG4gICAqIHRoZSBMb2NhdGlvblVwZ3JhZGVNb2R1bGUncyBgY29uZmlnYCBtZXRob2QgaW4geW91ciBBbmd1bGFyIGFwcC5cbiAgICovXG4gIGh0bWw1TW9kZShtb2RlPzogYW55KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb25maWd1cmUgTG9jYXRpb25VcGdyYWRlIHRocm91Z2ggTG9jYXRpb25VcGdyYWRlTW9kdWxlLmNvbmZpZyBtZXRob2QuJyk7XG4gIH1cbn1cbiJdfQ==