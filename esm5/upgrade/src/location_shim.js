/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __read } from "tslib";
import { deepEqual, isAnchor, isPromise } from './utils';
var PATH_MATCH = /^([^?#]*)(\?([^#]*))?(#(.*))?$/;
var DOUBLE_SLASH_REGEX = /^\s*[\\/]{2,}/;
var IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i;
var DEFAULT_PORTS = {
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
 * @publicApi
 */
var $locationShim = /** @class */ (function () {
    function $locationShim($injector, location, platformLocation, urlCodec, locationStrategy) {
        var _this = this;
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
        var initialUrl = this.browserUrl();
        var parsedUrl = this.urlCodec.parse(initialUrl);
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
            $injector.then(function ($i) { return _this.initialize($i); });
        }
        else {
            this.initialize($injector);
        }
    }
    $locationShim.prototype.initialize = function ($injector) {
        var _this = this;
        var $rootScope = $injector.get('$rootScope');
        var $rootElement = $injector.get('$rootElement');
        $rootElement.on('click', function (event) {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.which === 2 ||
                event.button === 2) {
                return;
            }
            var elm = event.target;
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
            var absHref = elm.href;
            var relHref = elm.getAttribute('href');
            // Ignore when url is started with javascript: or mailto:
            if (IGNORE_URI_REGEXP.test(absHref)) {
                return;
            }
            if (absHref && !elm.getAttribute('target') && !event.isDefaultPrevented()) {
                if (_this.$$parseLinkUrl(absHref, relHref)) {
                    // We do a preventDefault for all urls that are part of the AngularJS application,
                    // in html5mode and also without, so that we are able to abort navigation without
                    // getting double entries in the location history.
                    event.preventDefault();
                    // update location manually
                    if (_this.absUrl() !== _this.browserUrl()) {
                        $rootScope.$apply();
                    }
                }
            }
        });
        this.location.onUrlChange(function (newUrl, newState) {
            var oldUrl = _this.absUrl();
            var oldState = _this.$$state;
            _this.$$parse(newUrl);
            newUrl = _this.absUrl();
            _this.$$state = newState;
            var defaultPrevented = $rootScope.$broadcast('$locationChangeStart', newUrl, oldUrl, newState, oldState)
                .defaultPrevented;
            // if the location was changed by a `$locationChangeStart` handler then stop
            // processing this location change
            if (_this.absUrl() !== newUrl)
                return;
            // If default was prevented, set back to old state. This is the state that was locally
            // cached in the $location service.
            if (defaultPrevented) {
                _this.$$parse(oldUrl);
                _this.state(oldState);
                _this.setBrowserUrlWithFallback(oldUrl, false, oldState);
                _this.$$notifyChangeListeners(_this.url(), _this.$$state, oldUrl, oldState);
            }
            else {
                _this.initalizing = false;
                $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, newState, oldState);
                _this.resetBrowserUpdate();
            }
            if (!$rootScope.$$phase) {
                $rootScope.$digest();
            }
        });
        // update browser
        $rootScope.$watch(function () {
            if (_this.initalizing || _this.updateBrowser) {
                _this.updateBrowser = false;
                var oldUrl_1 = _this.browserUrl();
                var newUrl = _this.absUrl();
                var oldState_1 = _this.browserState();
                var currentReplace_1 = _this.$$replace;
                var urlOrStateChanged_1 = !_this.urlCodec.areEqual(oldUrl_1, newUrl) || oldState_1 !== _this.$$state;
                // Fire location changes one time to on initialization. This must be done on the
                // next tick (thus inside $evalAsync()) in order for listeners to be registered
                // before the event fires. Mimicing behavior from $locationWatch:
                // https://github.com/angular/angular.js/blob/master/src/ng/location.js#L983
                if (_this.initalizing || urlOrStateChanged_1) {
                    _this.initalizing = false;
                    $rootScope.$evalAsync(function () {
                        // Get the new URL again since it could have changed due to async update
                        var newUrl = _this.absUrl();
                        var defaultPrevented = $rootScope
                            .$broadcast('$locationChangeStart', newUrl, oldUrl_1, _this.$$state, oldState_1)
                            .defaultPrevented;
                        // if the location was changed by a `$locationChangeStart` handler then stop
                        // processing this location change
                        if (_this.absUrl() !== newUrl)
                            return;
                        if (defaultPrevented) {
                            _this.$$parse(oldUrl_1);
                            _this.$$state = oldState_1;
                        }
                        else {
                            // This block doesn't run when initalizing because it's going to perform the update to
                            // the URL which shouldn't be needed when initalizing.
                            if (urlOrStateChanged_1) {
                                _this.setBrowserUrlWithFallback(newUrl, currentReplace_1, oldState_1 === _this.$$state ? null : _this.$$state);
                                _this.$$replace = false;
                            }
                            $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl_1, _this.$$state, oldState_1);
                            if (urlOrStateChanged_1) {
                                _this.$$notifyChangeListeners(_this.url(), _this.$$state, oldUrl_1, oldState_1);
                            }
                        }
                    });
                }
            }
            _this.$$replace = false;
        });
    };
    $locationShim.prototype.resetBrowserUpdate = function () {
        this.$$replace = false;
        this.$$state = this.browserState();
        this.updateBrowser = false;
        this.lastBrowserUrl = this.browserUrl();
    };
    $locationShim.prototype.browserUrl = function (url, replace, state) {
        // In modern browsers `history.state` is `null` by default; treating it separately
        // from `undefined` would cause `$browser.url('/foo')` to change `history.state`
        // to undefined via `pushState`. Instead, let's change `undefined` to `null` here.
        if (typeof state === 'undefined') {
            state = null;
        }
        // setter
        if (url) {
            var sameState = this.lastHistoryState === state;
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
    };
    $locationShim.prototype.cacheState = function () {
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
    };
    /**
     * This function emulates the $browser.state() function from AngularJS. It will cause
     * history.state to be cached unless changed with deep equality check.
     */
    $locationShim.prototype.browserState = function () {
        return this.cachedState;
    };
    $locationShim.prototype.stripBaseUrl = function (base, url) {
        if (url.startsWith(base)) {
            return url.substr(base.length);
        }
        return undefined;
    };
    $locationShim.prototype.getServerBase = function () {
        var _a = this.platformLocation, protocol = _a.protocol, hostname = _a.hostname, port = _a.port;
        var baseHref = this.locationStrategy.getBaseHref();
        var url = protocol + "//" + hostname + (port ? ':' + port : '') + (baseHref || '/');
        return url.endsWith('/') ? url : url + '/';
    };
    $locationShim.prototype.parseAppUrl = function (url) {
        if (DOUBLE_SLASH_REGEX.test(url)) {
            throw new Error("Bad Path - URL cannot start with double slashes: " + url);
        }
        var prefixed = (url.charAt(0) !== '/');
        if (prefixed) {
            url = '/' + url;
        }
        var match = this.urlCodec.parse(url, this.getServerBase());
        if (typeof match === 'string') {
            throw new Error("Bad URL - Cannot parse URL: " + url);
        }
        var path = prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname;
        this.$$path = this.urlCodec.decodePath(path);
        this.$$search = this.urlCodec.decodeSearch(match.search);
        this.$$hash = this.urlCodec.decodeHash(match.hash);
        // make sure path starts with '/';
        if (this.$$path && this.$$path.charAt(0) !== '/') {
            this.$$path = '/' + this.$$path;
        }
    };
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
     * @param fn The callback function that is triggered for the listener when the URL changes.
     * @param err The callback function that is triggered when an error occurs.
     */
    $locationShim.prototype.onChange = function (fn, err) {
        if (err === void 0) { err = function (e) { }; }
        this.$$changeListeners.push([fn, err]);
    };
    /** @internal */
    $locationShim.prototype.$$notifyChangeListeners = function (url, state, oldUrl, oldState) {
        if (url === void 0) { url = ''; }
        if (oldUrl === void 0) { oldUrl = ''; }
        this.$$changeListeners.forEach(function (_a) {
            var _b = __read(_a, 2), fn = _b[0], err = _b[1];
            try {
                fn(url, state, oldUrl, oldState);
            }
            catch (e) {
                err(e);
            }
        });
    };
    /**
     * Parses the provided URL, and sets the current URL to the parsed result.
     *
     * @param url The URL string.
     */
    $locationShim.prototype.$$parse = function (url) {
        var pathUrl;
        if (url.startsWith('/')) {
            pathUrl = url;
        }
        else {
            // Remove protocol & hostname if URL starts with it
            pathUrl = this.stripBaseUrl(this.getServerBase(), url);
        }
        if (typeof pathUrl === 'undefined') {
            throw new Error("Invalid url \"" + url + "\", missing path prefix \"" + this.getServerBase() + "\".");
        }
        this.parseAppUrl(pathUrl);
        if (!this.$$path) {
            this.$$path = '/';
        }
        this.composeUrls();
    };
    /**
     * Parses the provided URL and its relative URL.
     *
     * @param url The full URL string.
     * @param relHref A URL string relative to the full URL string.
     */
    $locationShim.prototype.$$parseLinkUrl = function (url, relHref) {
        // When relHref is passed, it should be a hash and is handled separately
        if (relHref && relHref[0] === '#') {
            this.hash(relHref.slice(1));
            return true;
        }
        var rewrittenUrl;
        var appUrl = this.stripBaseUrl(this.getServerBase(), url);
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
    };
    $locationShim.prototype.setBrowserUrlWithFallback = function (url, replace, state) {
        var oldUrl = this.url();
        var oldState = this.$$state;
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
    };
    $locationShim.prototype.composeUrls = function () {
        this.$$url = this.urlCodec.normalize(this.$$path, this.$$search, this.$$hash);
        this.$$absUrl = this.getServerBase() + this.$$url.substr(1); // remove '/' from front of URL
        this.updateBrowser = true;
    };
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
     */
    $locationShim.prototype.absUrl = function () {
        return this.$$absUrl;
    };
    $locationShim.prototype.url = function (url) {
        if (typeof url === 'string') {
            if (!url.length) {
                url = '/';
            }
            var match = PATH_MATCH.exec(url);
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
    };
    /**
     * Retrieves the protocol of the current URL.
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let protocol = $location.protocol();
     * // => "http"
     * ```
     */
    $locationShim.prototype.protocol = function () {
        return this.$$protocol;
    };
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
     * // given URL http://user:password@example.com:8080/#/some/path?foo=bar&baz=xoxo
     * host = $location.host();
     * // => "example.com"
     * host = location.host;
     * // => "example.com:8080"
     * ```
     */
    $locationShim.prototype.host = function () {
        return this.$$host;
    };
    /**
     * Retrieves the port of the current URL.
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let port = $location.port();
     * // => 80
     * ```
     */
    $locationShim.prototype.port = function () {
        return this.$$port;
    };
    $locationShim.prototype.path = function (path) {
        if (typeof path === 'undefined') {
            return this.$$path;
        }
        // null path converts to empty string. Prepend with "/" if needed.
        path = path !== null ? path.toString() : '';
        path = path.charAt(0) === '/' ? path : '/' + path;
        this.$$path = path;
        this.composeUrls();
        return this;
    };
    $locationShim.prototype.search = function (search, paramValue) {
        switch (arguments.length) {
            case 0:
                return this.$$search;
            case 1:
                if (typeof search === 'string' || typeof search === 'number') {
                    this.$$search = this.urlCodec.decodeSearch(search.toString());
                }
                else if (typeof search === 'object' && search !== null) {
                    // Copy the object so it's never mutated
                    search = __assign({}, search);
                    // remove object undefined or null properties
                    for (var key in search) {
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
                    var currentSearch = this.search();
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
    };
    $locationShim.prototype.hash = function (hash) {
        if (typeof hash === 'undefined') {
            return this.$$hash;
        }
        this.$$hash = hash !== null ? hash.toString() : '';
        this.composeUrls();
        return this;
    };
    /**
     * Changes to `$location` during the current `$digest` will replace the current
     * history record, instead of adding a new one.
     */
    $locationShim.prototype.replace = function () {
        this.$$replace = true;
        return this;
    };
    $locationShim.prototype.state = function (state) {
        if (typeof state === 'undefined') {
            return this.$$state;
        }
        this.$$state = state;
        return this;
    };
    return $locationShim;
}());
export { $locationShim };
/**
 * The factory function used to create an instance of the `$locationShim` in Angular,
 * and provides an API-compatiable `$locationProvider` for AngularJS.
 *
 * @publicApi
 */
var $locationShimProvider = /** @class */ (function () {
    function $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
        this.ngUpgrade = ngUpgrade;
        this.location = location;
        this.platformLocation = platformLocation;
        this.urlCodec = urlCodec;
        this.locationStrategy = locationStrategy;
    }
    /**
     * Factory method that returns an instance of the $locationShim
     */
    $locationShimProvider.prototype.$get = function () {
        return new $locationShim(this.ngUpgrade.$injector, this.location, this.platformLocation, this.urlCodec, this.locationStrategy);
    };
    /**
     * Stub method used to keep API compatible with AngularJS. This setting is configured through
     * the LocationUpgradeModule's `config` method in your Angular app.
     */
    $locationShimProvider.prototype.hashPrefix = function (prefix) {
        throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
    };
    /**
     * Stub method used to keep API compatible with AngularJS. This setting is configured through
     * the LocationUpgradeModule's `config` method in your Angular app.
     */
    $locationShimProvider.prototype.html5Mode = function (mode) {
        throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
    };
    return $locationShimProvider;
}());
export { $locationShimProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc2hpbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi91cGdyYWRlL3NyYy9sb2NhdGlvbl9zaGltLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFNSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFdkQsSUFBTSxVQUFVLEdBQUcsZ0NBQWdDLENBQUM7QUFDcEQsSUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7QUFDM0MsSUFBTSxpQkFBaUIsR0FBRywyQkFBMkIsQ0FBQztBQUN0RCxJQUFNLGFBQWEsR0FBNEI7SUFDN0MsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsR0FBRztJQUNiLE1BQU0sRUFBRSxFQUFFO0NBQ1gsQ0FBQztBQUVGOzs7Ozs7O0dBT0c7QUFDSDtJQXVCRSx1QkFDSSxTQUFjLEVBQVUsUUFBa0IsRUFBVSxnQkFBa0MsRUFDOUUsUUFBa0IsRUFBVSxnQkFBa0M7UUFGMUUsaUJBd0JDO1FBdkIyQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUM5RSxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQXhCbEUsZ0JBQVcsR0FBRyxJQUFJLENBQUM7UUFDbkIsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFDdEIsYUFBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixVQUFLLEdBQVcsRUFBRSxDQUFDO1FBRW5CLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFFcEIsY0FBUyxHQUFZLEtBQUssQ0FBQztRQUMzQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLGFBQVEsR0FBUSxFQUFFLENBQUM7UUFDbkIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUVwQixzQkFB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LEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQzdFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7O09BR0c7SUFDSCwwQ0FBVSxHQUFWLFVBQVcsTUFBZTtRQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUVEOzs7T0FHRztJQUNILHlDQUFTLEdBQVQsVUFBVSxJQUFVO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0VBQXdFLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBQ0gsNEJBQUM7QUFBRCxDQUFDLEFBOUJELElBOEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uLCBMb2NhdGlvblN0cmF0ZWd5LCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG5cbmltcG9ydCB7VXJsQ29kZWN9IGZyb20gJy4vcGFyYW1zJztcbmltcG9ydCB7ZGVlcEVxdWFsLCBpc0FuY2hvciwgaXNQcm9taXNlfSBmcm9tICcuL3V0aWxzJztcblxuY29uc3QgUEFUSF9NQVRDSCA9IC9eKFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT8kLztcbmNvbnN0IERPVUJMRV9TTEFTSF9SRUdFWCA9IC9eXFxzKltcXFxcL117Mix9LztcbmNvbnN0IElHTk9SRV9VUklfUkVHRVhQID0gL15cXHMqKGphdmFzY3JpcHR8bWFpbHRvKTovaTtcbmNvbnN0IERFRkFVTFRfUE9SVFM6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge1xuICAnaHR0cDonOiA4MCxcbiAgJ2h0dHBzOic6IDQ0MyxcbiAgJ2Z0cDonOiAyMVxufTtcblxuLyoqXG4gKiBMb2NhdGlvbiBzZXJ2aWNlIHRoYXQgcHJvdmlkZXMgYSBkcm9wLWluIHJlcGxhY2VtZW50IGZvciB0aGUgJGxvY2F0aW9uIHNlcnZpY2VcbiAqIHByb3ZpZGVkIGluIEFuZ3VsYXJKUy5cbiAqXG4gKiBAc2VlIFtVc2luZyB0aGUgQW5ndWxhciBVbmlmaWVkIExvY2F0aW9uIFNlcnZpY2VdKGd1aWRlL3VwZ3JhZGUjdXNpbmctdGhlLXVuaWZpZWQtYW5ndWxhci1sb2NhdGlvbi1zZXJ2aWNlKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzICRsb2NhdGlvblNoaW0ge1xuICBwcml2YXRlIGluaXRhbGl6aW5nID0gdHJ1ZTtcbiAgcHJpdmF0ZSB1cGRhdGVCcm93c2VyID0gZmFsc2U7XG4gIHByaXZhdGUgJCRhYnNVcmw6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlICQkdXJsOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHByb3RvY29sOiBzdHJpbmc7XG4gIHByaXZhdGUgJCRob3N0OiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHBvcnQ6IG51bWJlcnxudWxsO1xuICBwcml2YXRlICQkcmVwbGFjZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlICQkcGF0aDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRzZWFyY2g6IGFueSA9ICcnO1xuICBwcml2YXRlICQkaGFzaDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCRzdGF0ZTogdW5rbm93bjtcbiAgcHJpdmF0ZSAkJGNoYW5nZUxpc3RlbmVyczogW1xuICAgICgodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duLCBvbGRVcmw6IHN0cmluZywgb2xkU3RhdGU6IHVua25vd24sIGVycj86IChlOiBFcnJvcikgPT4gdm9pZCkgPT5cbiAgICAgICAgIHZvaWQpLFxuICAgIChlOiBFcnJvcikgPT4gdm9pZFxuICBdW10gPSBbXTtcblxuICBwcml2YXRlIGNhY2hlZFN0YXRlOiB1bmtub3duID0gbnVsbDtcblxuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAkaW5qZWN0b3I6IGFueSwgcHJpdmF0ZSBsb2NhdGlvbjogTG9jYXRpb24sIHByaXZhdGUgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgIHByaXZhdGUgdXJsQ29kZWM6IFVybENvZGVjLCBwcml2YXRlIGxvY2F0aW9uU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kpIHtcbiAgICBjb25zdCBpbml0aWFsVXJsID0gdGhpcy5icm93c2VyVXJsKCk7XG5cbiAgICBsZXQgcGFyc2VkVXJsID0gdGhpcy51cmxDb2RlYy5wYXJzZShpbml0aWFsVXJsKTtcblxuICAgIGlmICh0eXBlb2YgcGFyc2VkVXJsID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgJ0ludmFsaWQgVVJMJztcbiAgICB9XG5cbiAgICB0aGlzLiQkcHJvdG9jb2wgPSBwYXJzZWRVcmwucHJvdG9jb2w7XG4gICAgdGhpcy4kJGhvc3QgPSBwYXJzZWRVcmwuaG9zdG5hbWU7XG4gICAgdGhpcy4kJHBvcnQgPSBwYXJzZUludChwYXJzZWRVcmwucG9ydCkgfHwgREVGQVVMVF9QT1JUU1twYXJzZWRVcmwucHJvdG9jb2xdIHx8IG51bGw7XG5cbiAgICB0aGlzLiQkcGFyc2VMaW5rVXJsKGluaXRpYWxVcmwsIGluaXRpYWxVcmwpO1xuICAgIHRoaXMuY2FjaGVTdGF0ZSgpO1xuICAgIHRoaXMuJCRzdGF0ZSA9IHRoaXMuYnJvd3NlclN0YXRlKCk7XG5cbiAgICBpZiAoaXNQcm9taXNlKCRpbmplY3RvcikpIHtcbiAgICAgICRpbmplY3Rvci50aGVuKCRpID0+IHRoaXMuaW5pdGlhbGl6ZSgkaSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluaXRpYWxpemUoJGluamVjdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemUoJGluamVjdG9yOiBhbnkpIHtcbiAgICBjb25zdCAkcm9vdFNjb3BlID0gJGluamVjdG9yLmdldCgnJHJvb3RTY29wZScpO1xuICAgIGNvbnN0ICRyb290RWxlbWVudCA9ICRpbmplY3Rvci5nZXQoJyRyb290RWxlbWVudCcpO1xuXG4gICAgJHJvb3RFbGVtZW50Lm9uKCdjbGljaycsIChldmVudDogYW55KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50LndoaWNoID09PSAyIHx8XG4gICAgICAgICAgZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IGVsbTogKE5vZGUmUGFyZW50Tm9kZSl8bnVsbCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgLy8gdHJhdmVyc2UgdGhlIERPTSB1cCB0byBmaW5kIGZpcnN0IEEgdGFnXG4gICAgICB3aGlsZSAoZWxtICYmIGVsbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnYScpIHtcbiAgICAgICAgLy8gaWdub3JlIHJld3JpdGluZyBpZiBubyBBIHRhZyAocmVhY2hlZCByb290IGVsZW1lbnQsIG9yIG5vIHBhcmVudCAtIHJlbW92ZWQgZnJvbSBkb2N1bWVudClcbiAgICAgICAgaWYgKGVsbSA9PT0gJHJvb3RFbGVtZW50WzBdIHx8ICEoZWxtID0gZWxtLnBhcmVudE5vZGUpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNBbmNob3IoZWxtKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFic0hyZWYgPSBlbG0uaHJlZjtcbiAgICAgIGNvbnN0IHJlbEhyZWYgPSBlbG0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgIC8vIElnbm9yZSB3aGVuIHVybCBpcyBzdGFydGVkIHdpdGggamF2YXNjcmlwdDogb3IgbWFpbHRvOlxuICAgICAgaWYgKElHTk9SRV9VUklfUkVHRVhQLnRlc3QoYWJzSHJlZikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWJzSHJlZiAmJiAhZWxtLmdldEF0dHJpYnV0ZSgndGFyZ2V0JykgJiYgIWV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLiQkcGFyc2VMaW5rVXJsKGFic0hyZWYsIHJlbEhyZWYpKSB7XG4gICAgICAgICAgLy8gV2UgZG8gYSBwcmV2ZW50RGVmYXVsdCBmb3IgYWxsIHVybHMgdGhhdCBhcmUgcGFydCBvZiB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uLFxuICAgICAgICAgIC8vIGluIGh0bWw1bW9kZSBhbmQgYWxzbyB3aXRob3V0LCBzbyB0aGF0IHdlIGFyZSBhYmxlIHRvIGFib3J0IG5hdmlnYXRpb24gd2l0aG91dFxuICAgICAgICAgIC8vIGdldHRpbmcgZG91YmxlIGVudHJpZXMgaW4gdGhlIGxvY2F0aW9uIGhpc3RvcnkuXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAvLyB1cGRhdGUgbG9jYXRpb24gbWFudWFsbHlcbiAgICAgICAgICBpZiAodGhpcy5hYnNVcmwoKSAhPT0gdGhpcy5icm93c2VyVXJsKCkpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvY2F0aW9uLm9uVXJsQ2hhbmdlKChuZXdVcmwsIG5ld1N0YXRlKSA9PiB7XG4gICAgICBsZXQgb2xkVXJsID0gdGhpcy5hYnNVcmwoKTtcbiAgICAgIGxldCBvbGRTdGF0ZSA9IHRoaXMuJCRzdGF0ZTtcbiAgICAgIHRoaXMuJCRwYXJzZShuZXdVcmwpO1xuICAgICAgbmV3VXJsID0gdGhpcy5hYnNVcmwoKTtcbiAgICAgIHRoaXMuJCRzdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgY29uc3QgZGVmYXVsdFByZXZlbnRlZCA9XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIG5ld1VybCwgb2xkVXJsLCBuZXdTdGF0ZSwgb2xkU3RhdGUpXG4gICAgICAgICAgICAgIC5kZWZhdWx0UHJldmVudGVkO1xuXG4gICAgICAvLyBpZiB0aGUgbG9jYXRpb24gd2FzIGNoYW5nZWQgYnkgYSBgJGxvY2F0aW9uQ2hhbmdlU3RhcnRgIGhhbmRsZXIgdGhlbiBzdG9wXG4gICAgICAvLyBwcm9jZXNzaW5nIHRoaXMgbG9jYXRpb24gY2hhbmdlXG4gICAgICBpZiAodGhpcy5hYnNVcmwoKSAhPT0gbmV3VXJsKSByZXR1cm47XG5cbiAgICAgIC8vIElmIGRlZmF1bHQgd2FzIHByZXZlbnRlZCwgc2V0IGJhY2sgdG8gb2xkIHN0YXRlLiBUaGlzIGlzIHRoZSBzdGF0ZSB0aGF0IHdhcyBsb2NhbGx5XG4gICAgICAvLyBjYWNoZWQgaW4gdGhlICRsb2NhdGlvbiBzZXJ2aWNlLlxuICAgICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgdGhpcy4kJHBhcnNlKG9sZFVybCk7XG4gICAgICAgIHRoaXMuc3RhdGUob2xkU3RhdGUpO1xuICAgICAgICB0aGlzLnNldEJyb3dzZXJVcmxXaXRoRmFsbGJhY2sob2xkVXJsLCBmYWxzZSwgb2xkU3RhdGUpO1xuICAgICAgICB0aGlzLiQkbm90aWZ5Q2hhbmdlTGlzdGVuZXJzKHRoaXMudXJsKCksIHRoaXMuJCRzdGF0ZSwgb2xkVXJsLCBvbGRTdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluaXRhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIG5ld1VybCwgb2xkVXJsLCBuZXdTdGF0ZSwgb2xkU3RhdGUpO1xuICAgICAgICB0aGlzLnJlc2V0QnJvd3NlclVwZGF0ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcbiAgICAgICAgJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB1cGRhdGUgYnJvd3NlclxuICAgICRyb290U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmluaXRhbGl6aW5nIHx8IHRoaXMudXBkYXRlQnJvd3Nlcikge1xuICAgICAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBvbGRVcmwgPSB0aGlzLmJyb3dzZXJVcmwoKTtcbiAgICAgICAgY29uc3QgbmV3VXJsID0gdGhpcy5hYnNVcmwoKTtcbiAgICAgICAgY29uc3Qgb2xkU3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuICAgICAgICBsZXQgY3VycmVudFJlcGxhY2UgPSB0aGlzLiQkcmVwbGFjZTtcblxuICAgICAgICBjb25zdCB1cmxPclN0YXRlQ2hhbmdlZCA9XG4gICAgICAgICAgICAhdGhpcy51cmxDb2RlYy5hcmVFcXVhbChvbGRVcmwsIG5ld1VybCkgfHwgb2xkU3RhdGUgIT09IHRoaXMuJCRzdGF0ZTtcblxuICAgICAgICAvLyBGaXJlIGxvY2F0aW9uIGNoYW5nZXMgb25lIHRpbWUgdG8gb24gaW5pdGlhbGl6YXRpb24uIFRoaXMgbXVzdCBiZSBkb25lIG9uIHRoZVxuICAgICAgICAvLyBuZXh0IHRpY2sgKHRodXMgaW5zaWRlICRldmFsQXN5bmMoKSkgaW4gb3JkZXIgZm9yIGxpc3RlbmVycyB0byBiZSByZWdpc3RlcmVkXG4gICAgICAgIC8vIGJlZm9yZSB0aGUgZXZlbnQgZmlyZXMuIE1pbWljaW5nIGJlaGF2aW9yIGZyb20gJGxvY2F0aW9uV2F0Y2g6XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi9tYXN0ZXIvc3JjL25nL2xvY2F0aW9uLmpzI0w5ODNcbiAgICAgICAgaWYgKHRoaXMuaW5pdGFsaXppbmcgfHwgdXJsT3JTdGF0ZUNoYW5nZWQpIHtcbiAgICAgICAgICB0aGlzLmluaXRhbGl6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAkcm9vdFNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBuZXcgVVJMIGFnYWluIHNpbmNlIGl0IGNvdWxkIGhhdmUgY2hhbmdlZCBkdWUgdG8gYXN5bmMgdXBkYXRlXG4gICAgICAgICAgICBjb25zdCBuZXdVcmwgPSB0aGlzLmFic1VybCgpO1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFByZXZlbnRlZCA9XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZVxuICAgICAgICAgICAgICAgICAgICAuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBuZXdVcmwsIG9sZFVybCwgdGhpcy4kJHN0YXRlLCBvbGRTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgLmRlZmF1bHRQcmV2ZW50ZWQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSBsb2NhdGlvbiB3YXMgY2hhbmdlZCBieSBhIGAkbG9jYXRpb25DaGFuZ2VTdGFydGAgaGFuZGxlciB0aGVuIHN0b3BcbiAgICAgICAgICAgIC8vIHByb2Nlc3NpbmcgdGhpcyBsb2NhdGlvbiBjaGFuZ2VcbiAgICAgICAgICAgIGlmICh0aGlzLmFic1VybCgpICE9PSBuZXdVcmwpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy4kJHBhcnNlKG9sZFVybCk7XG4gICAgICAgICAgICAgIHRoaXMuJCRzdGF0ZSA9IG9sZFN0YXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBibG9jayBkb2Vzbid0IHJ1biB3aGVuIGluaXRhbGl6aW5nIGJlY2F1c2UgaXQncyBnb2luZyB0byBwZXJmb3JtIHRoZSB1cGRhdGUgdG9cbiAgICAgICAgICAgICAgLy8gdGhlIFVSTCB3aGljaCBzaG91bGRuJ3QgYmUgbmVlZGVkIHdoZW4gaW5pdGFsaXppbmcuXG4gICAgICAgICAgICAgIGlmICh1cmxPclN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QnJvd3NlclVybFdpdGhGYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgbmV3VXJsLCBjdXJyZW50UmVwbGFjZSwgb2xkU3RhdGUgPT09IHRoaXMuJCRzdGF0ZSA/IG51bGwgOiB0aGlzLiQkc3RhdGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCRyZXBsYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFxuICAgICAgICAgICAgICAgICAgJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBuZXdVcmwsIG9sZFVybCwgdGhpcy4kJHN0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICAgICAgICAgIGlmICh1cmxPclN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJCRub3RpZnlDaGFuZ2VMaXN0ZW5lcnModGhpcy51cmwoKSwgdGhpcy4kJHN0YXRlLCBvbGRVcmwsIG9sZFN0YXRlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLiQkcmVwbGFjZSA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldEJyb3dzZXJVcGRhdGUoKSB7XG4gICAgdGhpcy4kJHJlcGxhY2UgPSBmYWxzZTtcbiAgICB0aGlzLiQkc3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuICAgIHRoaXMudXBkYXRlQnJvd3NlciA9IGZhbHNlO1xuICAgIHRoaXMubGFzdEJyb3dzZXJVcmwgPSB0aGlzLmJyb3dzZXJVcmwoKTtcbiAgfVxuXG4gIHByaXZhdGUgbGFzdEhpc3RvcnlTdGF0ZTogdW5rbm93bjtcbiAgcHJpdmF0ZSBsYXN0QnJvd3NlclVybDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgYnJvd3NlclVybCgpOiBzdHJpbmc7XG4gIHByaXZhdGUgYnJvd3NlclVybCh1cmw6IHN0cmluZywgcmVwbGFjZT86IGJvb2xlYW4sIHN0YXRlPzogdW5rbm93bik6IHRoaXM7XG4gIHByaXZhdGUgYnJvd3NlclVybCh1cmw/OiBzdHJpbmcsIHJlcGxhY2U/OiBib29sZWFuLCBzdGF0ZT86IHVua25vd24pIHtcbiAgICAvLyBJbiBtb2Rlcm4gYnJvd3NlcnMgYGhpc3Rvcnkuc3RhdGVgIGlzIGBudWxsYCBieSBkZWZhdWx0OyB0cmVhdGluZyBpdCBzZXBhcmF0ZWx5XG4gICAgLy8gZnJvbSBgdW5kZWZpbmVkYCB3b3VsZCBjYXVzZSBgJGJyb3dzZXIudXJsKCcvZm9vJylgIHRvIGNoYW5nZSBgaGlzdG9yeS5zdGF0ZWBcbiAgICAvLyB0byB1bmRlZmluZWQgdmlhIGBwdXNoU3RhdGVgLiBJbnN0ZWFkLCBsZXQncyBjaGFuZ2UgYHVuZGVmaW5lZGAgdG8gYG51bGxgIGhlcmUuXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHN0YXRlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBzZXR0ZXJcbiAgICBpZiAodXJsKSB7XG4gICAgICBsZXQgc2FtZVN0YXRlID0gdGhpcy5sYXN0SGlzdG9yeVN0YXRlID09PSBzdGF0ZTtcblxuICAgICAgLy8gTm9ybWFsaXplIHRoZSBpbnB1dHRlZCBVUkxcbiAgICAgIHVybCA9IHRoaXMudXJsQ29kZWMucGFyc2UodXJsKS5ocmVmO1xuXG4gICAgICAvLyBEb24ndCBjaGFuZ2UgYW55dGhpbmcgaWYgcHJldmlvdXMgYW5kIGN1cnJlbnQgVVJMcyBhbmQgc3RhdGVzIG1hdGNoLlxuICAgICAgaWYgKHRoaXMubGFzdEJyb3dzZXJVcmwgPT09IHVybCAmJiBzYW1lU3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB0aGlzLmxhc3RCcm93c2VyVXJsID0gdXJsO1xuICAgICAgdGhpcy5sYXN0SGlzdG9yeVN0YXRlID0gc3RhdGU7XG5cbiAgICAgIC8vIFJlbW92ZSBzZXJ2ZXIgYmFzZSBmcm9tIFVSTCBhcyB0aGUgQW5ndWxhciBBUElzIGZvciB1cGRhdGluZyBVUkwgcmVxdWlyZVxuICAgICAgLy8gaXQgdG8gYmUgdGhlIHBhdGgrLlxuICAgICAgdXJsID0gdGhpcy5zdHJpcEJhc2VVcmwodGhpcy5nZXRTZXJ2ZXJCYXNlKCksIHVybCkgfHwgdXJsO1xuXG4gICAgICAvLyBTZXQgdGhlIFVSTFxuICAgICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgICAgdGhpcy5sb2NhdGlvblN0cmF0ZWd5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgJycsIHVybCwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZShzdGF0ZSwgJycsIHVybCwgJycpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNhY2hlU3RhdGUoKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAvLyBnZXR0ZXJcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGxhdGZvcm1Mb2NhdGlvbi5ocmVmO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoaXMgdmFyaWFibGUgc2hvdWxkIGJlIHVzZWQgKm9ubHkqIGluc2lkZSB0aGUgY2FjaGVTdGF0ZSBmdW5jdGlvbi5cbiAgcHJpdmF0ZSBsYXN0Q2FjaGVkU3RhdGU6IHVua25vd24gPSBudWxsO1xuICBwcml2YXRlIGNhY2hlU3RhdGUoKSB7XG4gICAgLy8gVGhpcyBzaG91bGQgYmUgdGhlIG9ubHkgcGxhY2UgaW4gJGJyb3dzZXIgd2hlcmUgYGhpc3Rvcnkuc3RhdGVgIGlzIHJlYWQuXG4gICAgdGhpcy5jYWNoZWRTdGF0ZSA9IHRoaXMucGxhdGZvcm1Mb2NhdGlvbi5nZXRTdGF0ZSgpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5jYWNoZWRTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuY2FjaGVkU3RhdGUgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFByZXZlbnQgY2FsbGJhY2tzIGZvIGZpcmUgdHdpY2UgaWYgYm90aCBoYXNoY2hhbmdlICYgcG9wc3RhdGUgd2VyZSBmaXJlZC5cbiAgICBpZiAoZGVlcEVxdWFsKHRoaXMuY2FjaGVkU3RhdGUsIHRoaXMubGFzdENhY2hlZFN0YXRlKSkge1xuICAgICAgdGhpcy5jYWNoZWRTdGF0ZSA9IHRoaXMubGFzdENhY2hlZFN0YXRlO1xuICAgIH1cblxuICAgIHRoaXMubGFzdENhY2hlZFN0YXRlID0gdGhpcy5jYWNoZWRTdGF0ZTtcbiAgICB0aGlzLmxhc3RIaXN0b3J5U3RhdGUgPSB0aGlzLmNhY2hlZFN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gZW11bGF0ZXMgdGhlICRicm93c2VyLnN0YXRlKCkgZnVuY3Rpb24gZnJvbSBBbmd1bGFySlMuIEl0IHdpbGwgY2F1c2VcbiAgICogaGlzdG9yeS5zdGF0ZSB0byBiZSBjYWNoZWQgdW5sZXNzIGNoYW5nZWQgd2l0aCBkZWVwIGVxdWFsaXR5IGNoZWNrLlxuICAgKi9cbiAgcHJpdmF0ZSBicm93c2VyU3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkU3RhdGU7XG4gIH1cblxuICBwcml2YXRlIHN0cmlwQmFzZVVybChiYXNlOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKGJhc2UpKSB7XG4gICAgICByZXR1cm4gdXJsLnN1YnN0cihiYXNlLmxlbmd0aCk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZlckJhc2UoKSB7XG4gICAgY29uc3Qge3Byb3RvY29sLCBob3N0bmFtZSwgcG9ydH0gPSB0aGlzLnBsYXRmb3JtTG9jYXRpb247XG4gICAgY29uc3QgYmFzZUhyZWYgPSB0aGlzLmxvY2F0aW9uU3RyYXRlZ3kuZ2V0QmFzZUhyZWYoKTtcbiAgICBsZXQgdXJsID0gYCR7cHJvdG9jb2x9Ly8ke2hvc3RuYW1lfSR7cG9ydCA/ICc6JyArIHBvcnQgOiAnJ30ke2Jhc2VIcmVmIHx8ICcvJ31gO1xuICAgIHJldHVybiB1cmwuZW5kc1dpdGgoJy8nKSA/IHVybCA6IHVybCArICcvJztcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VBcHBVcmwodXJsOiBzdHJpbmcpIHtcbiAgICBpZiAoRE9VQkxFX1NMQVNIX1JFR0VYLnRlc3QodXJsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCYWQgUGF0aCAtIFVSTCBjYW5ub3Qgc3RhcnQgd2l0aCBkb3VibGUgc2xhc2hlczogJHt1cmx9YCk7XG4gICAgfVxuXG4gICAgbGV0IHByZWZpeGVkID0gKHVybC5jaGFyQXQoMCkgIT09ICcvJyk7XG4gICAgaWYgKHByZWZpeGVkKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIGxldCBtYXRjaCA9IHRoaXMudXJsQ29kZWMucGFyc2UodXJsLCB0aGlzLmdldFNlcnZlckJhc2UoKSk7XG4gICAgaWYgKHR5cGVvZiBtYXRjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQmFkIFVSTCAtIENhbm5vdCBwYXJzZSBVUkw6ICR7dXJsfWApO1xuICAgIH1cbiAgICBsZXQgcGF0aCA9XG4gICAgICAgIHByZWZpeGVkICYmIG1hdGNoLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nID8gbWF0Y2gucGF0aG5hbWUuc3Vic3RyaW5nKDEpIDogbWF0Y2gucGF0aG5hbWU7XG4gICAgdGhpcy4kJHBhdGggPSB0aGlzLnVybENvZGVjLmRlY29kZVBhdGgocGF0aCk7XG4gICAgdGhpcy4kJHNlYXJjaCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlU2VhcmNoKG1hdGNoLnNlYXJjaCk7XG4gICAgdGhpcy4kJGhhc2ggPSB0aGlzLnVybENvZGVjLmRlY29kZUhhc2gobWF0Y2guaGFzaCk7XG5cbiAgICAvLyBtYWtlIHN1cmUgcGF0aCBzdGFydHMgd2l0aCAnLyc7XG4gICAgaWYgKHRoaXMuJCRwYXRoICYmIHRoaXMuJCRwYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0aGlzLiQkcGF0aCA9ICcvJyArIHRoaXMuJCRwYXRoO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgbGlzdGVuZXJzIGZvciBVUkwgY2hhbmdlcy4gVGhpcyBBUEkgaXMgdXNlZCB0byBjYXRjaCB1cGRhdGVzIHBlcmZvcm1lZCBieSB0aGVcbiAgICogQW5ndWxhckpTIGZyYW1ld29yay4gVGhlc2UgY2hhbmdlcyBhcmUgYSBzdWJzZXQgb2YgdGhlIGAkbG9jYXRpb25DaGFuZ2VTdGFydGAgYW5kXG4gICAqIGAkbG9jYXRpb25DaGFuZ2VTdWNjZXNzYCBldmVudHMgd2hpY2ggZmlyZSB3aGVuIEFuZ3VsYXJKUyB1cGRhdGVzIGl0cyBpbnRlcm5hbGx5LXJlZmVyZW5jZWRcbiAgICogdmVyc2lvbiBvZiB0aGUgYnJvd3NlciBVUkwuXG4gICAqXG4gICAqIEl0J3MgcG9zc2libGUgZm9yIGAkbG9jYXRpb25DaGFuZ2VgIGV2ZW50cyB0byBoYXBwZW4sIGJ1dCBmb3IgdGhlIGJyb3dzZXIgVVJMXG4gICAqICh3aW5kb3cubG9jYXRpb24pIHRvIHJlbWFpbiB1bmNoYW5nZWQuIFRoaXMgYG9uQ2hhbmdlYCBjYWxsYmFjayB3aWxsIGZpcmUgb25seSB3aGVuIEFuZ3VsYXJKU1xuICAgKiBhY3R1YWxseSB1cGRhdGVzIHRoZSBicm93c2VyIFVSTCAod2luZG93LmxvY2F0aW9uKS5cbiAgICpcbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGlzIHRyaWdnZXJlZCBmb3IgdGhlIGxpc3RlbmVyIHdoZW4gdGhlIFVSTCBjaGFuZ2VzLlxuICAgKiBAcGFyYW0gZXJyIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGlzIHRyaWdnZXJlZCB3aGVuIGFuIGVycm9yIG9jY3Vycy5cbiAgICovXG4gIG9uQ2hhbmdlKFxuICAgICAgZm46ICh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24sIG9sZFVybDogc3RyaW5nLCBvbGRTdGF0ZTogdW5rbm93bikgPT4gdm9pZCxcbiAgICAgIGVycjogKGU6IEVycm9yKSA9PiB2b2lkID0gKGU6IEVycm9yKSA9PiB7fSkge1xuICAgIHRoaXMuJCRjaGFuZ2VMaXN0ZW5lcnMucHVzaChbZm4sIGVycl0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICAkJG5vdGlmeUNoYW5nZUxpc3RlbmVycyhcbiAgICAgIHVybDogc3RyaW5nID0gJycsIHN0YXRlOiB1bmtub3duLCBvbGRVcmw6IHN0cmluZyA9ICcnLCBvbGRTdGF0ZTogdW5rbm93bikge1xuICAgIHRoaXMuJCRjaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaCgoW2ZuLCBlcnJdKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBmbih1cmwsIHN0YXRlLCBvbGRVcmwsIG9sZFN0YXRlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyKGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgcHJvdmlkZWQgVVJMLCBhbmQgc2V0cyB0aGUgY3VycmVudCBVUkwgdG8gdGhlIHBhcnNlZCByZXN1bHQuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVGhlIFVSTCBzdHJpbmcuXG4gICAqL1xuICAkJHBhcnNlKHVybDogc3RyaW5nKSB7XG4gICAgbGV0IHBhdGhVcmw6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHBhdGhVcmwgPSB1cmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlbW92ZSBwcm90b2NvbCAmIGhvc3RuYW1lIGlmIFVSTCBzdGFydHMgd2l0aCBpdFxuICAgICAgcGF0aFVybCA9IHRoaXMuc3RyaXBCYXNlVXJsKHRoaXMuZ2V0U2VydmVyQmFzZSgpLCB1cmwpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHBhdGhVcmwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdXJsIFwiJHt1cmx9XCIsIG1pc3NpbmcgcGF0aCBwcmVmaXggXCIke3RoaXMuZ2V0U2VydmVyQmFzZSgpfVwiLmApO1xuICAgIH1cblxuICAgIHRoaXMucGFyc2VBcHBVcmwocGF0aFVybCk7XG5cbiAgICBpZiAoIXRoaXMuJCRwYXRoKSB7XG4gICAgICB0aGlzLiQkcGF0aCA9ICcvJztcbiAgICB9XG4gICAgdGhpcy5jb21wb3NlVXJscygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgcHJvdmlkZWQgVVJMIGFuZCBpdHMgcmVsYXRpdmUgVVJMLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFRoZSBmdWxsIFVSTCBzdHJpbmcuXG4gICAqIEBwYXJhbSByZWxIcmVmIEEgVVJMIHN0cmluZyByZWxhdGl2ZSB0byB0aGUgZnVsbCBVUkwgc3RyaW5nLlxuICAgKi9cbiAgJCRwYXJzZUxpbmtVcmwodXJsOiBzdHJpbmcsIHJlbEhyZWY/OiBzdHJpbmd8bnVsbCk6IGJvb2xlYW4ge1xuICAgIC8vIFdoZW4gcmVsSHJlZiBpcyBwYXNzZWQsIGl0IHNob3VsZCBiZSBhIGhhc2ggYW5kIGlzIGhhbmRsZWQgc2VwYXJhdGVseVxuICAgIGlmIChyZWxIcmVmICYmIHJlbEhyZWZbMF0gPT09ICcjJykge1xuICAgICAgdGhpcy5oYXNoKHJlbEhyZWYuc2xpY2UoMSkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGxldCByZXdyaXR0ZW5Vcmw7XG4gICAgbGV0IGFwcFVybCA9IHRoaXMuc3RyaXBCYXNlVXJsKHRoaXMuZ2V0U2VydmVyQmFzZSgpLCB1cmwpO1xuICAgIGlmICh0eXBlb2YgYXBwVXJsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV3cml0dGVuVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCkgKyBhcHBVcmw7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldFNlcnZlckJhc2UoKSA9PT0gdXJsICsgJy8nKSB7XG4gICAgICByZXdyaXR0ZW5VcmwgPSB0aGlzLmdldFNlcnZlckJhc2UoKTtcbiAgICB9XG4gICAgLy8gU2V0IHRoZSBVUkxcbiAgICBpZiAocmV3cml0dGVuVXJsKSB7XG4gICAgICB0aGlzLiQkcGFyc2UocmV3cml0dGVuVXJsKTtcbiAgICB9XG4gICAgcmV0dXJuICEhcmV3cml0dGVuVXJsO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRCcm93c2VyVXJsV2l0aEZhbGxiYWNrKHVybDogc3RyaW5nLCByZXBsYWNlOiBib29sZWFuLCBzdGF0ZTogdW5rbm93bikge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsKCk7XG4gICAgY29uc3Qgb2xkU3RhdGUgPSB0aGlzLiQkc3RhdGU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuYnJvd3NlclVybCh1cmwsIHJlcGxhY2UsIHN0YXRlKTtcblxuICAgICAgLy8gTWFrZSBzdXJlICRsb2NhdGlvbi5zdGF0ZSgpIHJldHVybnMgcmVmZXJlbnRpYWxseSBpZGVudGljYWwgKG5vdCBqdXN0IGRlZXBseSBlcXVhbClcbiAgICAgIC8vIHN0YXRlIG9iamVjdDsgdGhpcyBtYWtlcyBwb3NzaWJsZSBxdWljayBjaGVja2luZyBpZiB0aGUgc3RhdGUgY2hhbmdlZCBpbiB0aGUgZGlnZXN0XG4gICAgICAvLyBsb29wLiBDaGVja2luZyBkZWVwIGVxdWFsaXR5IHdvdWxkIGJlIHRvbyBleHBlbnNpdmUuXG4gICAgICB0aGlzLiQkc3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFJlc3RvcmUgb2xkIHZhbHVlcyBpZiBwdXNoU3RhdGUgZmFpbHNcbiAgICAgIHRoaXMudXJsKG9sZFVybCk7XG4gICAgICB0aGlzLiQkc3RhdGUgPSBvbGRTdGF0ZTtcblxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbXBvc2VVcmxzKCkge1xuICAgIHRoaXMuJCR1cmwgPSB0aGlzLnVybENvZGVjLm5vcm1hbGl6ZSh0aGlzLiQkcGF0aCwgdGhpcy4kJHNlYXJjaCwgdGhpcy4kJGhhc2gpO1xuICAgIHRoaXMuJCRhYnNVcmwgPSB0aGlzLmdldFNlcnZlckJhc2UoKSArIHRoaXMuJCR1cmwuc3Vic3RyKDEpOyAgLy8gcmVtb3ZlICcvJyBmcm9tIGZyb250IG9mIFVSTFxuICAgIHRoaXMudXBkYXRlQnJvd3NlciA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBmdWxsIFVSTCByZXByZXNlbnRhdGlvbiB3aXRoIGFsbCBzZWdtZW50cyBlbmNvZGVkIGFjY29yZGluZyB0b1xuICAgKiBydWxlcyBzcGVjaWZpZWQgaW5cbiAgICogW1JGQyAzOTg2XShodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmMzOTg2LnR4dCkuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgYWJzVXJsID0gJGxvY2F0aW9uLmFic1VybCgpO1xuICAgKiAvLyA9PiBcImh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXCJcbiAgICogYGBgXG4gICAqL1xuICBhYnNVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy4kJGFic1VybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgVVJMLCBvciBzZXRzIGEgbmV3IFVSTC4gV2hlbiBzZXR0aW5nIGEgVVJMLFxuICAgKiBjaGFuZ2VzIHRoZSBwYXRoLCBzZWFyY2gsIGFuZCBoYXNoLCBhbmQgcmV0dXJucyBhIHJlZmVyZW5jZSB0byBpdHMgb3duIGluc3RhbmNlLlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHVybCA9ICRsb2NhdGlvbi51cmwoKTtcbiAgICogLy8gPT4gXCIvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cIlxuICAgKiBgYGBcbiAgICovXG4gIHVybCgpOiBzdHJpbmc7XG4gIHVybCh1cmw6IHN0cmluZyk6IHRoaXM7XG4gIHVybCh1cmw/OiBzdHJpbmcpOiBzdHJpbmd8dGhpcyB7XG4gICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoIXVybC5sZW5ndGgpIHtcbiAgICAgICAgdXJsID0gJy8nO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRjaCA9IFBBVEhfTUFUQ0guZXhlYyh1cmwpO1xuICAgICAgaWYgKCFtYXRjaCkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAobWF0Y2hbMV0gfHwgdXJsID09PSAnJykgdGhpcy5wYXRoKHRoaXMudXJsQ29kZWMuZGVjb2RlUGF0aChtYXRjaFsxXSkpO1xuICAgICAgaWYgKG1hdGNoWzJdIHx8IG1hdGNoWzFdIHx8IHVybCA9PT0gJycpIHRoaXMuc2VhcmNoKG1hdGNoWzNdIHx8ICcnKTtcbiAgICAgIHRoaXMuaGFzaChtYXRjaFs1XSB8fCAnJyk7XG5cbiAgICAgIC8vIENoYWluYWJsZSBtZXRob2RcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiQkdXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgcHJvdG9jb2wgb2YgdGhlIGN1cnJlbnQgVVJMLlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHByb3RvY29sID0gJGxvY2F0aW9uLnByb3RvY29sKCk7XG4gICAqIC8vID0+IFwiaHR0cFwiXG4gICAqIGBgYFxuICAgKi9cbiAgcHJvdG9jb2woKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy4kJHByb3RvY29sO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgcHJvdG9jb2wgb2YgdGhlIGN1cnJlbnQgVVJMLlxuICAgKlxuICAgKiBJbiBjb250cmFzdCB0byB0aGUgbm9uLUFuZ3VsYXJKUyB2ZXJzaW9uIGBsb2NhdGlvbi5ob3N0YCB3aGljaCByZXR1cm5zIGBob3N0bmFtZTpwb3J0YCwgdGhpc1xuICAgKiByZXR1cm5zIHRoZSBgaG9zdG5hbWVgIHBvcnRpb24gb25seS5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbVwiXG4gICAqXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vdXNlcjpwYXNzd29yZEBleGFtcGxlLmNvbTo4MDgwLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG4gICAqIC8vID0+IFwiZXhhbXBsZS5jb21cIlxuICAgKiBob3N0ID0gbG9jYXRpb24uaG9zdDtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbTo4MDgwXCJcbiAgICogYGBgXG4gICAqL1xuICBob3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuJCRob3N0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgcG9ydCBvZiB0aGUgY3VycmVudCBVUkwuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcG9ydCA9ICRsb2NhdGlvbi5wb3J0KCk7XG4gICAqIC8vID0+IDgwXG4gICAqIGBgYFxuICAgKi9cbiAgcG9ydCgpOiBudW1iZXJ8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuJCRwb3J0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgcGF0aCBvZiB0aGUgY3VycmVudCBVUkwsIG9yIGNoYW5nZXMgdGhlIHBhdGggYW5kIHJldHVybnMgYSByZWZlcmVuY2UgdG8gaXRzIG93blxuICAgKiBpbnN0YW5jZS5cbiAgICpcbiAgICogUGF0aHMgc2hvdWxkIGFsd2F5cyBiZWdpbiB3aXRoIGZvcndhcmQgc2xhc2ggKC8pLiBUaGlzIG1ldGhvZCBhZGRzIHRoZSBmb3J3YXJkIHNsYXNoXG4gICAqIGlmIGl0IGlzIG1pc3NpbmcuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG4gICAqIC8vID0+IFwiL3NvbWUvcGF0aFwiXG4gICAqIGBgYFxuICAgKi9cbiAgcGF0aCgpOiBzdHJpbmc7XG4gIHBhdGgocGF0aDogc3RyaW5nfG51bWJlcnxudWxsKTogdGhpcztcbiAgcGF0aChwYXRoPzogc3RyaW5nfG51bWJlcnxudWxsKTogc3RyaW5nfHRoaXMge1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiQkcGF0aDtcbiAgICB9XG5cbiAgICAvLyBudWxsIHBhdGggY29udmVydHMgdG8gZW1wdHkgc3RyaW5nLiBQcmVwZW5kIHdpdGggXCIvXCIgaWYgbmVlZGVkLlxuICAgIHBhdGggPSBwYXRoICE9PSBudWxsID8gcGF0aC50b1N0cmluZygpIDogJyc7XG4gICAgcGF0aCA9IHBhdGguY2hhckF0KDApID09PSAnLycgPyBwYXRoIDogJy8nICsgcGF0aDtcblxuICAgIHRoaXMuJCRwYXRoID0gcGF0aDtcblxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSBtYXAgb2YgdGhlIHNlYXJjaCBwYXJhbWV0ZXJzIG9mIHRoZSBjdXJyZW50IFVSTCwgb3IgY2hhbmdlcyBhIHNlYXJjaFxuICAgKiBwYXJ0IGFuZCByZXR1cm5zIGEgcmVmZXJlbmNlIHRvIGl0cyBvd24gaW5zdGFuY2UuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgc2VhcmNoT2JqZWN0ID0gJGxvY2F0aW9uLnNlYXJjaCgpO1xuICAgKiAvLyA9PiB7Zm9vOiAnYmFyJywgYmF6OiAneG94byd9XG4gICAqXG4gICAqIC8vIHNldCBmb28gdG8gJ3lpcGVlJ1xuICAgKiAkbG9jYXRpb24uc2VhcmNoKCdmb28nLCAneWlwZWUnKTtcbiAgICogLy8gJGxvY2F0aW9uLnNlYXJjaCgpID0+IHtmb286ICd5aXBlZScsIGJhejogJ3hveG8nfVxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8T2JqZWN0LjxzdHJpbmc+fE9iamVjdC48QXJyYXkuPHN0cmluZz4+fSBzZWFyY2ggTmV3IHNlYXJjaCBwYXJhbXMgLSBzdHJpbmcgb3JcbiAgICogaGFzaCBvYmplY3QuXG4gICAqXG4gICAqIFdoZW4gY2FsbGVkIHdpdGggYSBzaW5nbGUgYXJndW1lbnQgdGhlIG1ldGhvZCBhY3RzIGFzIGEgc2V0dGVyLCBzZXR0aW5nIHRoZSBgc2VhcmNoYCBjb21wb25lbnRcbiAgICogb2YgYCRsb2NhdGlvbmAgdG8gdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAgICpcbiAgICogSWYgdGhlIGFyZ3VtZW50IGlzIGEgaGFzaCBvYmplY3QgY29udGFpbmluZyBhbiBhcnJheSBvZiB2YWx1ZXMsIHRoZXNlIHZhbHVlcyB3aWxsIGJlIGVuY29kZWRcbiAgICogYXMgZHVwbGljYXRlIHNlYXJjaCBwYXJhbWV0ZXJzIGluIHRoZSBVUkwuXG4gICAqXG4gICAqIEBwYXJhbSB7KHN0cmluZ3xOdW1iZXJ8QXJyYXk8c3RyaW5nPnxib29sZWFuKT19IHBhcmFtVmFsdWUgSWYgYHNlYXJjaGAgaXMgYSBzdHJpbmcgb3IgbnVtYmVyLFxuICAgKiAgICAgdGhlbiBgcGFyYW1WYWx1ZWBcbiAgICogd2lsbCBvdmVycmlkZSBvbmx5IGEgc2luZ2xlIHNlYXJjaCBwcm9wZXJ0eS5cbiAgICpcbiAgICogSWYgYHBhcmFtVmFsdWVgIGlzIGFuIGFycmF5LCBpdCB3aWxsIG92ZXJyaWRlIHRoZSBwcm9wZXJ0eSBvZiB0aGUgYHNlYXJjaGAgY29tcG9uZW50IG9mXG4gICAqIGAkbG9jYXRpb25gIHNwZWNpZmllZCB2aWEgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgKlxuICAgKiBJZiBgcGFyYW1WYWx1ZWAgaXMgYG51bGxgLCB0aGUgcHJvcGVydHkgc3BlY2lmaWVkIHZpYSB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBkZWxldGVkLlxuICAgKlxuICAgKiBJZiBgcGFyYW1WYWx1ZWAgaXMgYHRydWVgLCB0aGUgcHJvcGVydHkgc3BlY2lmaWVkIHZpYSB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBhZGRlZCB3aXRoIG5vXG4gICAqIHZhbHVlIG5vciB0cmFpbGluZyBlcXVhbCBzaWduLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBwYXJzZWQgYHNlYXJjaGAgb2JqZWN0IG9mIHRoZSBjdXJyZW50IFVSTCwgb3IgdGhlIGNoYW5nZWQgYHNlYXJjaGAgb2JqZWN0LlxuICAgKi9cbiAgc2VhcmNoKCk6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufTtcbiAgc2VhcmNoKHNlYXJjaDogc3RyaW5nfG51bWJlcnx7W2tleTogc3RyaW5nXTogdW5rbm93bn0pOiB0aGlzO1xuICBzZWFyY2goXG4gICAgICBzZWFyY2g6IHN0cmluZ3xudW1iZXJ8e1trZXk6IHN0cmluZ106IHVua25vd259LFxuICAgICAgcGFyYW1WYWx1ZTogbnVsbHx1bmRlZmluZWR8c3RyaW5nfG51bWJlcnxib29sZWFufHN0cmluZ1tdKTogdGhpcztcbiAgc2VhcmNoKFxuICAgICAgc2VhcmNoPzogc3RyaW5nfG51bWJlcnx7W2tleTogc3RyaW5nXTogdW5rbm93bn0sXG4gICAgICBwYXJhbVZhbHVlPzogbnVsbHx1bmRlZmluZWR8c3RyaW5nfG51bWJlcnxib29sZWFufHN0cmluZ1tdKToge1trZXk6IHN0cmluZ106IHVua25vd259fHRoaXMge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy4kJHNlYXJjaDtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzZWFyY2ggPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy4kJHNlYXJjaCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlU2VhcmNoKHNlYXJjaC50b1N0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VhcmNoID09PSAnb2JqZWN0JyAmJiBzZWFyY2ggIT09IG51bGwpIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBvYmplY3Qgc28gaXQncyBuZXZlciBtdXRhdGVkXG4gICAgICAgICAgc2VhcmNoID0gey4uLnNlYXJjaH07XG4gICAgICAgICAgLy8gcmVtb3ZlIG9iamVjdCB1bmRlZmluZWQgb3IgbnVsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2VhcmNoKSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoW2tleV0gPT0gbnVsbCkgZGVsZXRlIHNlYXJjaFtrZXldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuJCRzZWFyY2ggPSBzZWFyY2g7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnTG9jYXRpb25Qcm92aWRlci5zZWFyY2goKTogRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZyBvciBhbiBvYmplY3QuJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50U2VhcmNoID0gdGhpcy5zZWFyY2goKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtVmFsdWUgPT09ICd1bmRlZmluZWQnIHx8IHBhcmFtVmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjdXJyZW50U2VhcmNoW3NlYXJjaF07XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2goY3VycmVudFNlYXJjaCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRTZWFyY2hbc2VhcmNoXSA9IHBhcmFtVmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2goY3VycmVudFNlYXJjaCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgaGFzaCBmcmFnbWVudCwgb3IgY2hhbmdlcyB0aGUgaGFzaCBmcmFnbWVudCBhbmQgcmV0dXJucyBhIHJlZmVyZW5jZSB0b1xuICAgKiBpdHMgb3duIGluc3RhbmNlLlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG8jaGFzaFZhbHVlXG4gICAqIGxldCBoYXNoID0gJGxvY2F0aW9uLmhhc2goKTtcbiAgICogLy8gPT4gXCJoYXNoVmFsdWVcIlxuICAgKiBgYGBcbiAgICovXG4gIGhhc2goKTogc3RyaW5nO1xuICBoYXNoKGhhc2g6IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHRoaXM7XG4gIGhhc2goaGFzaD86IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHN0cmluZ3x0aGlzIHtcbiAgICBpZiAodHlwZW9mIGhhc2ggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy4kJGhhc2g7XG4gICAgfVxuXG4gICAgdGhpcy4kJGhhc2ggPSBoYXNoICE9PSBudWxsID8gaGFzaC50b1N0cmluZygpIDogJyc7XG5cbiAgICB0aGlzLmNvbXBvc2VVcmxzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0byBgJGxvY2F0aW9uYCBkdXJpbmcgdGhlIGN1cnJlbnQgYCRkaWdlc3RgIHdpbGwgcmVwbGFjZSB0aGUgY3VycmVudFxuICAgKiBoaXN0b3J5IHJlY29yZCwgaW5zdGVhZCBvZiBhZGRpbmcgYSBuZXcgb25lLlxuICAgKi9cbiAgcmVwbGFjZSgpOiB0aGlzIHtcbiAgICB0aGlzLiQkcmVwbGFjZSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBoaXN0b3J5IHN0YXRlIG9iamVjdCB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSB0aGUgaGlzdG9yeSBzdGF0ZSBvYmplY3Qgd2hlbiBjYWxsZWQgd2l0aCBvbmUgcGFyYW1ldGVyIGFuZCByZXR1cm4gYCRsb2NhdGlvbmAuXG4gICAqIFRoZSBzdGF0ZSBvYmplY3QgaXMgbGF0ZXIgcGFzc2VkIHRvIGBwdXNoU3RhdGVgIG9yIGByZXBsYWNlU3RhdGVgLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBzdXBwb3J0ZWQgb25seSBpbiBIVE1MNSBtb2RlIGFuZCBvbmx5IGluIGJyb3dzZXJzIHN1cHBvcnRpbmdcbiAgICogdGhlIEhUTUw1IEhpc3RvcnkgQVBJIG1ldGhvZHMgc3VjaCBhcyBgcHVzaFN0YXRlYCBhbmQgYHJlcGxhY2VTdGF0ZWAuIElmIHlvdSBuZWVkIHRvIHN1cHBvcnRcbiAgICogb2xkZXIgYnJvd3NlcnMgKGxpa2UgSUU5IG9yIEFuZHJvaWQgPCA0LjApLCBkb24ndCB1c2UgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqL1xuICBzdGF0ZSgpOiB1bmtub3duO1xuICBzdGF0ZShzdGF0ZTogdW5rbm93bik6IHRoaXM7XG4gIHN0YXRlKHN0YXRlPzogdW5rbm93bik6IHVua25vd258dGhpcyB7XG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiQkc3RhdGU7XG4gICAgfVxuXG4gICAgdGhpcy4kJHN0YXRlID0gc3RhdGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZmFjdG9yeSBmdW5jdGlvbiB1c2VkIHRvIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgYCRsb2NhdGlvblNoaW1gIGluIEFuZ3VsYXIsXG4gKiBhbmQgcHJvdmlkZXMgYW4gQVBJLWNvbXBhdGlhYmxlIGAkbG9jYXRpb25Qcm92aWRlcmAgZm9yIEFuZ3VsYXJKUy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyAkbG9jYXRpb25TaGltUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgbmdVcGdyYWRlOiBVcGdyYWRlTW9kdWxlLCBwcml2YXRlIGxvY2F0aW9uOiBMb2NhdGlvbixcbiAgICAgIHByaXZhdGUgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbiwgcHJpdmF0ZSB1cmxDb2RlYzogVXJsQ29kZWMsXG4gICAgICBwcml2YXRlIGxvY2F0aW9uU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kpIHt9XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgbWV0aG9kIHRoYXQgcmV0dXJucyBhbiBpbnN0YW5jZSBvZiB0aGUgJGxvY2F0aW9uU2hpbVxuICAgKi9cbiAgJGdldCgpIHtcbiAgICByZXR1cm4gbmV3ICRsb2NhdGlvblNoaW0oXG4gICAgICAgIHRoaXMubmdVcGdyYWRlLiRpbmplY3RvciwgdGhpcy5sb2NhdGlvbiwgdGhpcy5wbGF0Zm9ybUxvY2F0aW9uLCB0aGlzLnVybENvZGVjLFxuICAgICAgICB0aGlzLmxvY2F0aW9uU3RyYXRlZ3kpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0dWIgbWV0aG9kIHVzZWQgdG8ga2VlcCBBUEkgY29tcGF0aWJsZSB3aXRoIEFuZ3VsYXJKUy4gVGhpcyBzZXR0aW5nIGlzIGNvbmZpZ3VyZWQgdGhyb3VnaFxuICAgKiB0aGUgTG9jYXRpb25VcGdyYWRlTW9kdWxlJ3MgYGNvbmZpZ2AgbWV0aG9kIGluIHlvdXIgQW5ndWxhciBhcHAuXG4gICAqL1xuICBoYXNoUHJlZml4KHByZWZpeD86IHN0cmluZykge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlndXJlIExvY2F0aW9uVXBncmFkZSB0aHJvdWdoIExvY2F0aW9uVXBncmFkZU1vZHVsZS5jb25maWcgbWV0aG9kLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0dWIgbWV0aG9kIHVzZWQgdG8ga2VlcCBBUEkgY29tcGF0aWJsZSB3aXRoIEFuZ3VsYXJKUy4gVGhpcyBzZXR0aW5nIGlzIGNvbmZpZ3VyZWQgdGhyb3VnaFxuICAgKiB0aGUgTG9jYXRpb25VcGdyYWRlTW9kdWxlJ3MgYGNvbmZpZ2AgbWV0aG9kIGluIHlvdXIgQW5ndWxhciBhcHAuXG4gICAqL1xuICBodG1sNU1vZGUobW9kZT86IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlndXJlIExvY2F0aW9uVXBncmFkZSB0aHJvdWdoIExvY2F0aW9uVXBncmFkZU1vZHVsZS5jb25maWcgbWV0aG9kLicpO1xuICB9XG59XG4iXX0=