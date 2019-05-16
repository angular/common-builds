/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
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
 * Docs TBD.
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
    $locationShim.prototype.browserState = function () { return this.cachedState; };
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
     * Register URL change listeners. This API can be used to catch updates performed by the
     * AngularJS framework. These changes are a subset of the `$locationChangeStart/Success` events
     * as those events fire when AngularJS updates it's internally referenced version of the browser
     * URL. It's possible for `$locationChange` events to happen, but for the browser URL
     * (window.location) to remain unchanged. This `onChange` callback will fire only when AngularJS
     * actually updates the browser URL (window.location).
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
            var _b = tslib_1.__read(_a, 2), fn = _b[0], err = _b[1];
            try {
                fn(url, state, oldUrl, oldState);
            }
            catch (e) {
                err(e);
            }
        });
    };
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
            this.$$notifyChangeListeners(url, state, oldUrl, oldState);
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
     */
    $locationShim.prototype.absUrl = function () { return this.$$absUrl; };
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
     */
    $locationShim.prototype.protocol = function () { return this.$$protocol; };
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
     * // given URL http://user:password@example.com:8080/#/some/path?foo=bar&baz=xoxo
     * host = $location.host();
     * // => "example.com"
     * host = location.host;
     * // => "example.com:8080"
     * ```
     */
    $locationShim.prototype.host = function () { return this.$$host; };
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
     */
    $locationShim.prototype.port = function () { return this.$$port; };
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
                    search = tslib_1.__assign({}, search);
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
     * If called, all changes to $location during the current `$digest` will replace the current
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
 * Docs TBD.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc2hpbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi91cGdyYWRlL3NyYy9sb2NhdGlvbl9zaGltLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFNSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFdkQsSUFBTSxVQUFVLEdBQUcsZ0NBQWdDLENBQUM7QUFDcEQsSUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7QUFDM0MsSUFBTSxpQkFBaUIsR0FBRywyQkFBMkIsQ0FBQztBQUN0RCxJQUFNLGFBQWEsR0FBNEI7SUFDN0MsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsR0FBRztJQUNiLE1BQU0sRUFBRSxFQUFFO0NBQ1gsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSDtJQXVCRSx1QkFDSSxTQUFjLEVBQVUsUUFBa0IsRUFBVSxnQkFBa0MsRUFDOUUsUUFBa0IsRUFBVSxnQkFBa0M7UUFGMUUsaUJBd0JDO1FBdkIyQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUM5RSxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQXhCbEUsZ0JBQVcsR0FBRyxJQUFJLENBQUM7UUFDbkIsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFDdEIsYUFBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixVQUFLLEdBQVcsRUFBRSxDQUFDO1FBRW5CLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFFcEIsY0FBUyxHQUFZLEtBQUssQ0FBQztRQUMzQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLGFBQVEsR0FBUSxFQUFFLENBQUM7UUFDbkIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUVwQixzQkFBaUIs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O09BR0c7SUFDSCx5Q0FBUyxHQUFULFVBQVUsSUFBVTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQTNCRCxJQTJCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvbiwgTG9jYXRpb25TdHJhdGVneSwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG5pbXBvcnQge1VybENvZGVjfSBmcm9tICcuL3BhcmFtcyc7XG5pbXBvcnQge2RlZXBFcXVhbCwgaXNBbmNob3IsIGlzUHJvbWlzZX0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IFBBVEhfTUFUQ0ggPSAvXihbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/JC87XG5jb25zdCBET1VCTEVfU0xBU0hfUkVHRVggPSAvXlxccypbXFxcXC9dezIsfS87XG5jb25zdCBJR05PUkVfVVJJX1JFR0VYUCA9IC9eXFxzKihqYXZhc2NyaXB0fG1haWx0byk6L2k7XG5jb25zdCBERUZBVUxUX1BPUlRTOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSA9IHtcbiAgJ2h0dHA6JzogODAsXG4gICdodHRwczonOiA0NDMsXG4gICdmdHA6JzogMjFcbn07XG5cbi8qKlxuICogRG9jcyBUQkQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgJGxvY2F0aW9uU2hpbSB7XG4gIHByaXZhdGUgaW5pdGFsaXppbmcgPSB0cnVlO1xuICBwcml2YXRlIHVwZGF0ZUJyb3dzZXIgPSBmYWxzZTtcbiAgcHJpdmF0ZSAkJGFic1VybDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgJCR1cmw6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlICQkcHJvdG9jb2w6IHN0cmluZztcbiAgcHJpdmF0ZSAkJGhvc3Q6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlICQkcG9ydDogbnVtYmVyfG51bGw7XG4gIHByaXZhdGUgJCRyZXBsYWNlOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgJCRwYXRoOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHNlYXJjaDogYW55ID0gJyc7XG4gIHByaXZhdGUgJCRoYXNoOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSAkJHN0YXRlOiB1bmtub3duO1xuICBwcml2YXRlICQkY2hhbmdlTGlzdGVuZXJzOiBbXG4gICAgKCh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24sIG9sZFVybDogc3RyaW5nLCBvbGRTdGF0ZTogdW5rbm93biwgZXJyPzogKGU6IEVycm9yKSA9PiB2b2lkKSA9PlxuICAgICAgICAgdm9pZCksXG4gICAgKGU6IEVycm9yKSA9PiB2b2lkXG4gIF1bXSA9IFtdO1xuXG4gIHByaXZhdGUgY2FjaGVkU3RhdGU6IHVua25vd24gPSBudWxsO1xuXG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgICRpbmplY3RvcjogYW55LCBwcml2YXRlIGxvY2F0aW9uOiBMb2NhdGlvbiwgcHJpdmF0ZSBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgcHJpdmF0ZSB1cmxDb2RlYzogVXJsQ29kZWMsIHByaXZhdGUgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge1xuICAgIGNvbnN0IGluaXRpYWxVcmwgPSB0aGlzLmJyb3dzZXJVcmwoKTtcblxuICAgIGxldCBwYXJzZWRVcmwgPSB0aGlzLnVybENvZGVjLnBhcnNlKGluaXRpYWxVcmwpO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJzZWRVcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyAnSW52YWxpZCBVUkwnO1xuICAgIH1cblxuICAgIHRoaXMuJCRwcm90b2NvbCA9IHBhcnNlZFVybC5wcm90b2NvbDtcbiAgICB0aGlzLiQkaG9zdCA9IHBhcnNlZFVybC5ob3N0bmFtZTtcbiAgICB0aGlzLiQkcG9ydCA9IHBhcnNlSW50KHBhcnNlZFVybC5wb3J0KSB8fCBERUZBVUxUX1BPUlRTW3BhcnNlZFVybC5wcm90b2NvbF0gfHwgbnVsbDtcblxuICAgIHRoaXMuJCRwYXJzZUxpbmtVcmwoaW5pdGlhbFVybCwgaW5pdGlhbFVybCk7XG4gICAgdGhpcy5jYWNoZVN0YXRlKCk7XG4gICAgdGhpcy4kJHN0YXRlID0gdGhpcy5icm93c2VyU3RhdGUoKTtcblxuICAgIGlmIChpc1Byb21pc2UoJGluamVjdG9yKSkge1xuICAgICAgJGluamVjdG9yLnRoZW4oJGkgPT4gdGhpcy5pbml0aWFsaXplKCRpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZSgkaW5qZWN0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZSgkaW5qZWN0b3I6IGFueSkge1xuICAgIGNvbnN0ICRyb290U2NvcGUgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdFNjb3BlJyk7XG4gICAgY29uc3QgJHJvb3RFbGVtZW50ID0gJGluamVjdG9yLmdldCgnJHJvb3RFbGVtZW50Jyk7XG5cbiAgICAkcm9vdEVsZW1lbnQub24oJ2NsaWNrJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQud2hpY2ggPT09IDIgfHxcbiAgICAgICAgICBldmVudC5idXR0b24gPT09IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgZWxtOiAoTm9kZSAmIFBhcmVudE5vZGUpfG51bGwgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIC8vIHRyYXZlcnNlIHRoZSBET00gdXAgdG8gZmluZCBmaXJzdCBBIHRhZ1xuICAgICAgd2hpbGUgKGVsbSAmJiBlbG0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2EnKSB7XG4gICAgICAgIC8vIGlnbm9yZSByZXdyaXRpbmcgaWYgbm8gQSB0YWcgKHJlYWNoZWQgcm9vdCBlbGVtZW50LCBvciBubyBwYXJlbnQgLSByZW1vdmVkIGZyb20gZG9jdW1lbnQpXG4gICAgICAgIGlmIChlbG0gPT09ICRyb290RWxlbWVudFswXSB8fCAhKGVsbSA9IGVsbS5wYXJlbnROb2RlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWlzQW5jaG9yKGVsbSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhYnNIcmVmID0gZWxtLmhyZWY7XG4gICAgICBjb25zdCByZWxIcmVmID0gZWxtLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXG4gICAgICAvLyBJZ25vcmUgd2hlbiB1cmwgaXMgc3RhcnRlZCB3aXRoIGphdmFzY3JpcHQ6IG9yIG1haWx0bzpcbiAgICAgIGlmIChJR05PUkVfVVJJX1JFR0VYUC50ZXN0KGFic0hyZWYpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGFic0hyZWYgJiYgIWVsbS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpICYmICFldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICBpZiAodGhpcy4kJHBhcnNlTGlua1VybChhYnNIcmVmLCByZWxIcmVmKSkge1xuICAgICAgICAgIC8vIFdlIGRvIGEgcHJldmVudERlZmF1bHQgZm9yIGFsbCB1cmxzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbixcbiAgICAgICAgICAvLyBpbiBodG1sNW1vZGUgYW5kIGFsc28gd2l0aG91dCwgc28gdGhhdCB3ZSBhcmUgYWJsZSB0byBhYm9ydCBuYXZpZ2F0aW9uIHdpdGhvdXRcbiAgICAgICAgICAvLyBnZXR0aW5nIGRvdWJsZSBlbnRyaWVzIGluIHRoZSBsb2NhdGlvbiBoaXN0b3J5LlxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgLy8gdXBkYXRlIGxvY2F0aW9uIG1hbnVhbGx5XG4gICAgICAgICAgaWYgKHRoaXMuYWJzVXJsKCkgIT09IHRoaXMuYnJvd3NlclVybCgpKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5sb2NhdGlvbi5vblVybENoYW5nZSgobmV3VXJsLCBuZXdTdGF0ZSkgPT4ge1xuICAgICAgbGV0IG9sZFVybCA9IHRoaXMuYWJzVXJsKCk7XG4gICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLiQkc3RhdGU7XG4gICAgICB0aGlzLiQkcGFyc2UobmV3VXJsKTtcbiAgICAgIG5ld1VybCA9IHRoaXMuYWJzVXJsKCk7XG4gICAgICB0aGlzLiQkc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgIGNvbnN0IGRlZmF1bHRQcmV2ZW50ZWQgPVxuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBuZXdVcmwsIG9sZFVybCwgbmV3U3RhdGUsIG9sZFN0YXRlKVxuICAgICAgICAgICAgICAuZGVmYXVsdFByZXZlbnRlZDtcblxuICAgICAgLy8gaWYgdGhlIGxvY2F0aW9uIHdhcyBjaGFuZ2VkIGJ5IGEgYCRsb2NhdGlvbkNoYW5nZVN0YXJ0YCBoYW5kbGVyIHRoZW4gc3RvcFxuICAgICAgLy8gcHJvY2Vzc2luZyB0aGlzIGxvY2F0aW9uIGNoYW5nZVxuICAgICAgaWYgKHRoaXMuYWJzVXJsKCkgIT09IG5ld1VybCkgcmV0dXJuO1xuXG4gICAgICAvLyBJZiBkZWZhdWx0IHdhcyBwcmV2ZW50ZWQsIHNldCBiYWNrIHRvIG9sZCBzdGF0ZS4gVGhpcyBpcyB0aGUgc3RhdGUgdGhhdCB3YXMgbG9jYWxseVxuICAgICAgLy8gY2FjaGVkIGluIHRoZSAkbG9jYXRpb24gc2VydmljZS5cbiAgICAgIGlmIChkZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHRoaXMuJCRwYXJzZShvbGRVcmwpO1xuICAgICAgICB0aGlzLnN0YXRlKG9sZFN0YXRlKTtcbiAgICAgICAgdGhpcy5zZXRCcm93c2VyVXJsV2l0aEZhbGxiYWNrKG9sZFVybCwgZmFsc2UsIG9sZFN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5pdGFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgbmV3VXJsLCBvbGRVcmwsIG5ld1N0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMucmVzZXRCcm93c2VyVXBkYXRlKCk7XG4gICAgICB9XG4gICAgICBpZiAoISRyb290U2NvcGUuJCRwaGFzZSkge1xuICAgICAgICAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHVwZGF0ZSBicm93c2VyXG4gICAgJHJvb3RTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaW5pdGFsaXppbmcgfHwgdGhpcy51cGRhdGVCcm93c2VyKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQnJvd3NlciA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IG9sZFVybCA9IHRoaXMuYnJvd3NlclVybCgpO1xuICAgICAgICBjb25zdCBuZXdVcmwgPSB0aGlzLmFic1VybCgpO1xuICAgICAgICBjb25zdCBvbGRTdGF0ZSA9IHRoaXMuYnJvd3NlclN0YXRlKCk7XG4gICAgICAgIGxldCBjdXJyZW50UmVwbGFjZSA9IHRoaXMuJCRyZXBsYWNlO1xuXG4gICAgICAgIGNvbnN0IHVybE9yU3RhdGVDaGFuZ2VkID1cbiAgICAgICAgICAgICF0aGlzLnVybENvZGVjLmFyZUVxdWFsKG9sZFVybCwgbmV3VXJsKSB8fCBvbGRTdGF0ZSAhPT0gdGhpcy4kJHN0YXRlO1xuXG4gICAgICAgIC8vIEZpcmUgbG9jYXRpb24gY2hhbmdlcyBvbmUgdGltZSB0byBvbiBpbml0aWFsaXphdGlvbi4gVGhpcyBtdXN0IGJlIGRvbmUgb24gdGhlXG4gICAgICAgIC8vIG5leHQgdGljayAodGh1cyBpbnNpZGUgJGV2YWxBc3luYygpKSBpbiBvcmRlciBmb3IgbGlzdGVuZXJzIHRvIGJlIHJlZ2lzdGVyZWRcbiAgICAgICAgLy8gYmVmb3JlIHRoZSBldmVudCBmaXJlcy4gTWltaWNpbmcgYmVoYXZpb3IgZnJvbSAkbG9jYXRpb25XYXRjaDpcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iL21hc3Rlci9zcmMvbmcvbG9jYXRpb24uanMjTDk4M1xuICAgICAgICBpZiAodGhpcy5pbml0YWxpemluZyB8fCB1cmxPclN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgIHRoaXMuaW5pdGFsaXppbmcgPSBmYWxzZTtcblxuICAgICAgICAgICRyb290U2NvcGUuJGV2YWxBc3luYygoKSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIG5ldyBVUkwgYWdhaW4gc2luY2UgaXQgY291bGQgaGF2ZSBjaGFuZ2VkIGR1ZSB0byBhc3luYyB1cGRhdGVcbiAgICAgICAgICAgIGNvbnN0IG5ld1VybCA9IHRoaXMuYWJzVXJsKCk7XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0UHJldmVudGVkID1cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlXG4gICAgICAgICAgICAgICAgICAgIC4kYnJvYWRjYXN0KCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIG5ld1VybCwgb2xkVXJsLCB0aGlzLiQkc3RhdGUsIG9sZFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICAuZGVmYXVsdFByZXZlbnRlZDtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIGxvY2F0aW9uIHdhcyBjaGFuZ2VkIGJ5IGEgYCRsb2NhdGlvbkNoYW5nZVN0YXJ0YCBoYW5kbGVyIHRoZW4gc3RvcFxuICAgICAgICAgICAgLy8gcHJvY2Vzc2luZyB0aGlzIGxvY2F0aW9uIGNoYW5nZVxuICAgICAgICAgICAgaWYgKHRoaXMuYWJzVXJsKCkgIT09IG5ld1VybCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICB0aGlzLiQkcGFyc2Uob2xkVXJsKTtcbiAgICAgICAgICAgICAgdGhpcy4kJHN0YXRlID0gb2xkU3RhdGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaGlzIGJsb2NrIGRvZXNuJ3QgcnVuIHdoZW4gaW5pdGFsaXppbmcgYmVjYXVzZSBpdCdzIGdvaW5nIHRvIHBlcmZvcm0gdGhlIHVwZGF0ZSB0b1xuICAgICAgICAgICAgICAvLyB0aGUgVVJMIHdoaWNoIHNob3VsZG4ndCBiZSBuZWVkZWQgd2hlbiBpbml0YWxpemluZy5cbiAgICAgICAgICAgICAgaWYgKHVybE9yU3RhdGVDaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRCcm93c2VyVXJsV2l0aEZhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICBuZXdVcmwsIGN1cnJlbnRSZXBsYWNlLCBvbGRTdGF0ZSA9PT0gdGhpcy4kJHN0YXRlID8gbnVsbCA6IHRoaXMuJCRzdGF0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kJHJlcGxhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoXG4gICAgICAgICAgICAgICAgICAnJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIG5ld1VybCwgb2xkVXJsLCB0aGlzLiQkc3RhdGUsIG9sZFN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy4kJHJlcGxhY2UgPSBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRCcm93c2VyVXBkYXRlKCkge1xuICAgIHRoaXMuJCRyZXBsYWNlID0gZmFsc2U7XG4gICAgdGhpcy4kJHN0YXRlID0gdGhpcy5icm93c2VyU3RhdGUoKTtcbiAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3RCcm93c2VyVXJsID0gdGhpcy5icm93c2VyVXJsKCk7XG4gIH1cblxuICBwcml2YXRlIGxhc3RIaXN0b3J5U3RhdGU6IHVua25vd247XG4gIHByaXZhdGUgbGFzdEJyb3dzZXJVcmw6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIGJyb3dzZXJVcmwoKTogc3RyaW5nO1xuICBwcml2YXRlIGJyb3dzZXJVcmwodXJsOiBzdHJpbmcsIHJlcGxhY2U/OiBib29sZWFuLCBzdGF0ZT86IHVua25vd24pOiB0aGlzO1xuICBwcml2YXRlIGJyb3dzZXJVcmwodXJsPzogc3RyaW5nLCByZXBsYWNlPzogYm9vbGVhbiwgc3RhdGU/OiB1bmtub3duKSB7XG4gICAgLy8gSW4gbW9kZXJuIGJyb3dzZXJzIGBoaXN0b3J5LnN0YXRlYCBpcyBgbnVsbGAgYnkgZGVmYXVsdDsgdHJlYXRpbmcgaXQgc2VwYXJhdGVseVxuICAgIC8vIGZyb20gYHVuZGVmaW5lZGAgd291bGQgY2F1c2UgYCRicm93c2VyLnVybCgnL2ZvbycpYCB0byBjaGFuZ2UgYGhpc3Rvcnkuc3RhdGVgXG4gICAgLy8gdG8gdW5kZWZpbmVkIHZpYSBgcHVzaFN0YXRlYC4gSW5zdGVhZCwgbGV0J3MgY2hhbmdlIGB1bmRlZmluZWRgIHRvIGBudWxsYCBoZXJlLlxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzdGF0ZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gc2V0dGVyXG4gICAgaWYgKHVybCkge1xuICAgICAgbGV0IHNhbWVTdGF0ZSA9IHRoaXMubGFzdEhpc3RvcnlTdGF0ZSA9PT0gc3RhdGU7XG5cbiAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgaW5wdXR0ZWQgVVJMXG4gICAgICB1cmwgPSB0aGlzLnVybENvZGVjLnBhcnNlKHVybCkuaHJlZjtcblxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIGFueXRoaW5nIGlmIHByZXZpb3VzIGFuZCBjdXJyZW50IFVSTHMgYW5kIHN0YXRlcyBtYXRjaC5cbiAgICAgIGlmICh0aGlzLmxhc3RCcm93c2VyVXJsID09PSB1cmwgJiYgc2FtZVN0YXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdGhpcy5sYXN0QnJvd3NlclVybCA9IHVybDtcbiAgICAgIHRoaXMubGFzdEhpc3RvcnlTdGF0ZSA9IHN0YXRlO1xuXG4gICAgICAvLyBSZW1vdmUgc2VydmVyIGJhc2UgZnJvbSBVUkwgYXMgdGhlIEFuZ3VsYXIgQVBJcyBmb3IgdXBkYXRpbmcgVVJMIHJlcXVpcmVcbiAgICAgIC8vIGl0IHRvIGJlIHRoZSBwYXRoKy5cbiAgICAgIHVybCA9IHRoaXMuc3RyaXBCYXNlVXJsKHRoaXMuZ2V0U2VydmVyQmFzZSgpLCB1cmwpIHx8IHVybDtcblxuICAgICAgLy8gU2V0IHRoZSBVUkxcbiAgICAgIGlmIChyZXBsYWNlKSB7XG4gICAgICAgIHRoaXMubG9jYXRpb25TdHJhdGVneS5yZXBsYWNlU3RhdGUoc3RhdGUsICcnLCB1cmwsICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubG9jYXRpb25TdHJhdGVneS5wdXNoU3RhdGUoc3RhdGUsICcnLCB1cmwsICcnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWNoZVN0YXRlKCk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgICAgLy8gZ2V0dGVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBsYXRmb3JtTG9jYXRpb24uaHJlZjtcbiAgICB9XG4gIH1cblxuICAvLyBUaGlzIHZhcmlhYmxlIHNob3VsZCBiZSB1c2VkICpvbmx5KiBpbnNpZGUgdGhlIGNhY2hlU3RhdGUgZnVuY3Rpb24uXG4gIHByaXZhdGUgbGFzdENhY2hlZFN0YXRlOiB1bmtub3duID0gbnVsbDtcbiAgcHJpdmF0ZSBjYWNoZVN0YXRlKCkge1xuICAgIC8vIFRoaXMgc2hvdWxkIGJlIHRoZSBvbmx5IHBsYWNlIGluICRicm93c2VyIHdoZXJlIGBoaXN0b3J5LnN0YXRlYCBpcyByZWFkLlxuICAgIHRoaXMuY2FjaGVkU3RhdGUgPSB0aGlzLnBsYXRmb3JtTG9jYXRpb24uZ2V0U3RhdGUoKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuY2FjaGVkU3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmNhY2hlZFN0YXRlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBQcmV2ZW50IGNhbGxiYWNrcyBmbyBmaXJlIHR3aWNlIGlmIGJvdGggaGFzaGNoYW5nZSAmIHBvcHN0YXRlIHdlcmUgZmlyZWQuXG4gICAgaWYgKGRlZXBFcXVhbCh0aGlzLmNhY2hlZFN0YXRlLCB0aGlzLmxhc3RDYWNoZWRTdGF0ZSkpIHtcbiAgICAgIHRoaXMuY2FjaGVkU3RhdGUgPSB0aGlzLmxhc3RDYWNoZWRTdGF0ZTtcbiAgICB9XG5cbiAgICB0aGlzLmxhc3RDYWNoZWRTdGF0ZSA9IHRoaXMuY2FjaGVkU3RhdGU7XG4gICAgdGhpcy5sYXN0SGlzdG9yeVN0YXRlID0gdGhpcy5jYWNoZWRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGVtdWxhdGVzIHRoZSAkYnJvd3Nlci5zdGF0ZSgpIGZ1bmN0aW9uIGZyb20gQW5ndWxhckpTLiBJdCB3aWxsIGNhdXNlXG4gICAqIGhpc3Rvcnkuc3RhdGUgdG8gYmUgY2FjaGVkIHVubGVzcyBjaGFuZ2VkIHdpdGggZGVlcCBlcXVhbGl0eSBjaGVjay5cbiAgICovXG4gIHByaXZhdGUgYnJvd3NlclN0YXRlKCk6IHVua25vd24geyByZXR1cm4gdGhpcy5jYWNoZWRTdGF0ZTsgfVxuXG4gIHByaXZhdGUgc3RyaXBCYXNlVXJsKGJhc2U6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoYmFzZSkpIHtcbiAgICAgIHJldHVybiB1cmwuc3Vic3RyKGJhc2UubGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2VydmVyQmFzZSgpIHtcbiAgICBjb25zdCB7cHJvdG9jb2wsIGhvc3RuYW1lLCBwb3J0fSA9IHRoaXMucGxhdGZvcm1Mb2NhdGlvbjtcbiAgICBjb25zdCBiYXNlSHJlZiA9IHRoaXMubG9jYXRpb25TdHJhdGVneS5nZXRCYXNlSHJlZigpO1xuICAgIGxldCB1cmwgPSBgJHtwcm90b2NvbH0vLyR7aG9zdG5hbWV9JHtwb3J0ID8gJzonICsgcG9ydCA6ICcnfSR7YmFzZUhyZWYgfHwgJy8nfWA7XG4gICAgcmV0dXJuIHVybC5lbmRzV2l0aCgnLycpID8gdXJsIDogdXJsICsgJy8nO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUFwcFVybCh1cmw6IHN0cmluZykge1xuICAgIGlmIChET1VCTEVfU0xBU0hfUkVHRVgudGVzdCh1cmwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEJhZCBQYXRoIC0gVVJMIGNhbm5vdCBzdGFydCB3aXRoIGRvdWJsZSBzbGFzaGVzOiAke3VybH1gKTtcbiAgICB9XG5cbiAgICBsZXQgcHJlZml4ZWQgPSAodXJsLmNoYXJBdCgwKSAhPT0gJy8nKTtcbiAgICBpZiAocHJlZml4ZWQpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgbGV0IG1hdGNoID0gdGhpcy51cmxDb2RlYy5wYXJzZSh1cmwsIHRoaXMuZ2V0U2VydmVyQmFzZSgpKTtcbiAgICBpZiAodHlwZW9mIG1hdGNoID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCYWQgVVJMIC0gQ2Fubm90IHBhcnNlIFVSTDogJHt1cmx9YCk7XG4gICAgfVxuICAgIGxldCBwYXRoID1cbiAgICAgICAgcHJlZml4ZWQgJiYgbWF0Y2gucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycgPyBtYXRjaC5wYXRobmFtZS5zdWJzdHJpbmcoMSkgOiBtYXRjaC5wYXRobmFtZTtcbiAgICB0aGlzLiQkcGF0aCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlUGF0aChwYXRoKTtcbiAgICB0aGlzLiQkc2VhcmNoID0gdGhpcy51cmxDb2RlYy5kZWNvZGVTZWFyY2gobWF0Y2guc2VhcmNoKTtcbiAgICB0aGlzLiQkaGFzaCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlSGFzaChtYXRjaC5oYXNoKTtcblxuICAgIC8vIG1ha2Ugc3VyZSBwYXRoIHN0YXJ0cyB3aXRoICcvJztcbiAgICBpZiAodGhpcy4kJHBhdGggJiYgdGhpcy4kJHBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHRoaXMuJCRwYXRoID0gJy8nICsgdGhpcy4kJHBhdGg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIFVSTCBjaGFuZ2UgbGlzdGVuZXJzLiBUaGlzIEFQSSBjYW4gYmUgdXNlZCB0byBjYXRjaCB1cGRhdGVzIHBlcmZvcm1lZCBieSB0aGVcbiAgICogQW5ndWxhckpTIGZyYW1ld29yay4gVGhlc2UgY2hhbmdlcyBhcmUgYSBzdWJzZXQgb2YgdGhlIGAkbG9jYXRpb25DaGFuZ2VTdGFydC9TdWNjZXNzYCBldmVudHNcbiAgICogYXMgdGhvc2UgZXZlbnRzIGZpcmUgd2hlbiBBbmd1bGFySlMgdXBkYXRlcyBpdCdzIGludGVybmFsbHkgcmVmZXJlbmNlZCB2ZXJzaW9uIG9mIHRoZSBicm93c2VyXG4gICAqIFVSTC4gSXQncyBwb3NzaWJsZSBmb3IgYCRsb2NhdGlvbkNoYW5nZWAgZXZlbnRzIHRvIGhhcHBlbiwgYnV0IGZvciB0aGUgYnJvd3NlciBVUkxcbiAgICogKHdpbmRvdy5sb2NhdGlvbikgdG8gcmVtYWluIHVuY2hhbmdlZC4gVGhpcyBgb25DaGFuZ2VgIGNhbGxiYWNrIHdpbGwgZmlyZSBvbmx5IHdoZW4gQW5ndWxhckpTXG4gICAqIGFjdHVhbGx5IHVwZGF0ZXMgdGhlIGJyb3dzZXIgVVJMICh3aW5kb3cubG9jYXRpb24pLlxuICAgKi9cbiAgb25DaGFuZ2UoXG4gICAgICBmbjogKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93biwgb2xkVXJsOiBzdHJpbmcsIG9sZFN0YXRlOiB1bmtub3duKSA9PiB2b2lkLFxuICAgICAgZXJyOiAoZTogRXJyb3IpID0+IHZvaWQgPSAoZTogRXJyb3IpID0+IHt9KSB7XG4gICAgdGhpcy4kJGNoYW5nZUxpc3RlbmVycy5wdXNoKFtmbiwgZXJyXSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gICQkbm90aWZ5Q2hhbmdlTGlzdGVuZXJzKFxuICAgICAgdXJsOiBzdHJpbmcgPSAnJywgc3RhdGU6IHVua25vd24sIG9sZFVybDogc3RyaW5nID0gJycsIG9sZFN0YXRlOiB1bmtub3duKSB7XG4gICAgdGhpcy4kJGNoYW5nZUxpc3RlbmVycy5mb3JFYWNoKChbZm4sIGVycl0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZuKHVybCwgc3RhdGUsIG9sZFVybCwgb2xkU3RhdGUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnIoZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAkJHBhcnNlKHVybDogc3RyaW5nKSB7XG4gICAgbGV0IHBhdGhVcmw6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHBhdGhVcmwgPSB1cmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlbW92ZSBwcm90b2NvbCAmIGhvc3RuYW1lIGlmIFVSTCBzdGFydHMgd2l0aCBpdFxuICAgICAgcGF0aFVybCA9IHRoaXMuc3RyaXBCYXNlVXJsKHRoaXMuZ2V0U2VydmVyQmFzZSgpLCB1cmwpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHBhdGhVcmwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdXJsIFwiJHt1cmx9XCIsIG1pc3NpbmcgcGF0aCBwcmVmaXggXCIke3RoaXMuZ2V0U2VydmVyQmFzZSgpfVwiLmApO1xuICAgIH1cblxuICAgIHRoaXMucGFyc2VBcHBVcmwocGF0aFVybCk7XG5cbiAgICBpZiAoIXRoaXMuJCRwYXRoKSB7XG4gICAgICB0aGlzLiQkcGF0aCA9ICcvJztcbiAgICB9XG4gICAgdGhpcy5jb21wb3NlVXJscygpO1xuICB9XG5cbiAgJCRwYXJzZUxpbmtVcmwodXJsOiBzdHJpbmcsIHJlbEhyZWY/OiBzdHJpbmd8bnVsbCk6IGJvb2xlYW4ge1xuICAgIC8vIFdoZW4gcmVsSHJlZiBpcyBwYXNzZWQsIGl0IHNob3VsZCBiZSBhIGhhc2ggYW5kIGlzIGhhbmRsZWQgc2VwYXJhdGVseVxuICAgIGlmIChyZWxIcmVmICYmIHJlbEhyZWZbMF0gPT09ICcjJykge1xuICAgICAgdGhpcy5oYXNoKHJlbEhyZWYuc2xpY2UoMSkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGxldCByZXdyaXR0ZW5Vcmw7XG4gICAgbGV0IGFwcFVybCA9IHRoaXMuc3RyaXBCYXNlVXJsKHRoaXMuZ2V0U2VydmVyQmFzZSgpLCB1cmwpO1xuICAgIGlmICh0eXBlb2YgYXBwVXJsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV3cml0dGVuVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCkgKyBhcHBVcmw7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldFNlcnZlckJhc2UoKSA9PT0gdXJsICsgJy8nKSB7XG4gICAgICByZXdyaXR0ZW5VcmwgPSB0aGlzLmdldFNlcnZlckJhc2UoKTtcbiAgICB9XG4gICAgLy8gU2V0IHRoZSBVUkxcbiAgICBpZiAocmV3cml0dGVuVXJsKSB7XG4gICAgICB0aGlzLiQkcGFyc2UocmV3cml0dGVuVXJsKTtcbiAgICB9XG4gICAgcmV0dXJuICEhcmV3cml0dGVuVXJsO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRCcm93c2VyVXJsV2l0aEZhbGxiYWNrKHVybDogc3RyaW5nLCByZXBsYWNlOiBib29sZWFuLCBzdGF0ZTogdW5rbm93bikge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsKCk7XG4gICAgY29uc3Qgb2xkU3RhdGUgPSB0aGlzLiQkc3RhdGU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuYnJvd3NlclVybCh1cmwsIHJlcGxhY2UsIHN0YXRlKTtcblxuICAgICAgLy8gTWFrZSBzdXJlICRsb2NhdGlvbi5zdGF0ZSgpIHJldHVybnMgcmVmZXJlbnRpYWxseSBpZGVudGljYWwgKG5vdCBqdXN0IGRlZXBseSBlcXVhbClcbiAgICAgIC8vIHN0YXRlIG9iamVjdDsgdGhpcyBtYWtlcyBwb3NzaWJsZSBxdWljayBjaGVja2luZyBpZiB0aGUgc3RhdGUgY2hhbmdlZCBpbiB0aGUgZGlnZXN0XG4gICAgICAvLyBsb29wLiBDaGVja2luZyBkZWVwIGVxdWFsaXR5IHdvdWxkIGJlIHRvbyBleHBlbnNpdmUuXG4gICAgICB0aGlzLiQkc3RhdGUgPSB0aGlzLmJyb3dzZXJTdGF0ZSgpO1xuICAgICAgdGhpcy4kJG5vdGlmeUNoYW5nZUxpc3RlbmVycyh1cmwsIHN0YXRlLCBvbGRVcmwsIG9sZFN0YXRlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBSZXN0b3JlIG9sZCB2YWx1ZXMgaWYgcHVzaFN0YXRlIGZhaWxzXG4gICAgICB0aGlzLnVybChvbGRVcmwpO1xuICAgICAgdGhpcy4kJHN0YXRlID0gb2xkU3RhdGU7XG5cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb21wb3NlVXJscygpIHtcbiAgICB0aGlzLiQkdXJsID0gdGhpcy51cmxDb2RlYy5ub3JtYWxpemUodGhpcy4kJHBhdGgsIHRoaXMuJCRzZWFyY2gsIHRoaXMuJCRoYXNoKTtcbiAgICB0aGlzLiQkYWJzVXJsID0gdGhpcy5nZXRTZXJ2ZXJCYXNlKCkgKyB0aGlzLiQkdXJsLnN1YnN0cigxKTsgIC8vIHJlbW92ZSAnLycgZnJvbSBmcm9udCBvZiBVUkxcbiAgICB0aGlzLnVwZGF0ZUJyb3dzZXIgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciBvbmx5LlxuICAgKlxuICAgKiBSZXR1cm4gZnVsbCBVUkwgcmVwcmVzZW50YXRpb24gd2l0aCBhbGwgc2VnbWVudHMgZW5jb2RlZCBhY2NvcmRpbmcgdG8gcnVsZXMgc3BlY2lmaWVkIGluXG4gICAqIFtSRkMgMzk4Nl0oaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQpLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IGFic1VybCA9ICRsb2NhdGlvbi5hYnNVcmwoKTtcbiAgICogLy8gPT4gXCJodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1wiXG4gICAqIGBgYFxuICAgKi9cbiAgYWJzVXJsKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkYWJzVXJsOyB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciAvIHNldHRlci5cbiAgICpcbiAgICogUmV0dXJuIFVSTCAoZS5nLiBgL3BhdGg/YT1iI2hhc2hgKSB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSBwYXRoLCBzZWFyY2ggYW5kIGhhc2gsIHdoZW4gY2FsbGVkIHdpdGggcGFyYW1ldGVyIGFuZCByZXR1cm4gYCRsb2NhdGlvbmAuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgdXJsID0gJGxvY2F0aW9uLnVybCgpO1xuICAgKiAvLyA9PiBcIi9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1wiXG4gICAqIGBgYFxuICAgKi9cbiAgdXJsKCk6IHN0cmluZztcbiAgdXJsKHVybDogc3RyaW5nKTogdGhpcztcbiAgdXJsKHVybD86IHN0cmluZyk6IHN0cmluZ3x0aGlzIHtcbiAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdXJsLmxlbmd0aCkge1xuICAgICAgICB1cmwgPSAnLyc7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1hdGNoID0gUEFUSF9NQVRDSC5leGVjKHVybCk7XG4gICAgICBpZiAoIW1hdGNoKSByZXR1cm4gdGhpcztcbiAgICAgIGlmIChtYXRjaFsxXSB8fCB1cmwgPT09ICcnKSB0aGlzLnBhdGgodGhpcy51cmxDb2RlYy5kZWNvZGVQYXRoKG1hdGNoWzFdKSk7XG4gICAgICBpZiAobWF0Y2hbMl0gfHwgbWF0Y2hbMV0gfHwgdXJsID09PSAnJykgdGhpcy5zZWFyY2gobWF0Y2hbM10gfHwgJycpO1xuICAgICAgdGhpcy5oYXNoKG1hdGNoWzVdIHx8ICcnKTtcblxuICAgICAgLy8gQ2hhaW5hYmxlIG1ldGhvZFxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJCR1cmw7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIG9ubHkuXG4gICAqXG4gICAqIFJldHVybiBwcm90b2NvbCBvZiBjdXJyZW50IFVSTC5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBwcm90b2NvbCA9ICRsb2NhdGlvbi5wcm90b2NvbCgpO1xuICAgKiAvLyA9PiBcImh0dHBcIlxuICAgKiBgYGBcbiAgICovXG4gIHByb3RvY29sKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkcHJvdG9jb2w7IH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgZ2V0dGVyIG9ubHkuXG4gICAqXG4gICAqIFJldHVybiBob3N0IG9mIGN1cnJlbnQgVVJMLlxuICAgKlxuICAgKiBOb3RlOiBjb21wYXJlZCB0byB0aGUgbm9uLUFuZ3VsYXJKUyB2ZXJzaW9uIGBsb2NhdGlvbi5ob3N0YCB3aGljaCByZXR1cm5zIGBob3N0bmFtZTpwb3J0YCwgdGhpc1xuICAgKiByZXR1cm5zIHRoZSBgaG9zdG5hbWVgIHBvcnRpb24gb25seS5cbiAgICpcbiAgICpcbiAgICogYGBganNcbiAgICogLy8gZ2l2ZW4gVVJMIGh0dHA6Ly9leGFtcGxlLmNvbS8jL3NvbWUvcGF0aD9mb289YmFyJmJhej14b3hvXG4gICAqIGxldCBob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbVwiXG4gICAqXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vdXNlcjpwYXNzd29yZEBleGFtcGxlLmNvbTo4MDgwLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG4gICAqIC8vID0+IFwiZXhhbXBsZS5jb21cIlxuICAgKiBob3N0ID0gbG9jYXRpb24uaG9zdDtcbiAgICogLy8gPT4gXCJleGFtcGxlLmNvbTo4MDgwXCJcbiAgICogYGBgXG4gICAqL1xuICBob3N0KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLiQkaG9zdDsgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgb25seS5cbiAgICpcbiAgICogUmV0dXJuIHBvcnQgb2YgY3VycmVudCBVUkwuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcG9ydCA9ICRsb2NhdGlvbi5wb3J0KCk7XG4gICAqIC8vID0+IDgwXG4gICAqIGBgYFxuICAgKi9cbiAgcG9ydCgpOiBudW1iZXJ8bnVsbCB7IHJldHVybiB0aGlzLiQkcG9ydDsgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybiBwYXRoIG9mIGN1cnJlbnQgVVJMIHdoZW4gY2FsbGVkIHdpdGhvdXQgYW55IHBhcmFtZXRlci5cbiAgICpcbiAgICogQ2hhbmdlIHBhdGggd2hlbiBjYWxsZWQgd2l0aCBwYXJhbWV0ZXIgYW5kIHJldHVybiBgJGxvY2F0aW9uYC5cbiAgICpcbiAgICogTm90ZTogUGF0aCBzaG91bGQgYWx3YXlzIGJlZ2luIHdpdGggZm9yd2FyZCBzbGFzaCAoLyksIHRoaXMgbWV0aG9kIHdpbGwgYWRkIHRoZSBmb3J3YXJkIHNsYXNoXG4gICAqIGlmIGl0IGlzIG1pc3NpbmcuXG4gICAqXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdpdmVuIFVSTCBodHRwOi8vZXhhbXBsZS5jb20vIy9zb21lL3BhdGg/Zm9vPWJhciZiYXo9eG94b1xuICAgKiBsZXQgcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG4gICAqIC8vID0+IFwiL3NvbWUvcGF0aFwiXG4gICAqIGBgYFxuICAgKi9cbiAgcGF0aCgpOiBzdHJpbmc7XG4gIHBhdGgocGF0aDogc3RyaW5nfG51bWJlcnxudWxsKTogdGhpcztcbiAgcGF0aChwYXRoPzogc3RyaW5nfG51bWJlcnxudWxsKTogc3RyaW5nfHRoaXMge1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiQkcGF0aDtcbiAgICB9XG5cbiAgICAvLyBudWxsIHBhdGggY29udmVydHMgdG8gZW1wdHkgc3RyaW5nLiBQcmVwZW5kIHdpdGggXCIvXCIgaWYgbmVlZGVkLlxuICAgIHBhdGggPSBwYXRoICE9PSBudWxsID8gcGF0aC50b1N0cmluZygpIDogJyc7XG4gICAgcGF0aCA9IHBhdGguY2hhckF0KDApID09PSAnLycgPyBwYXRoIDogJy8nICsgcGF0aDtcblxuICAgIHRoaXMuJCRwYXRoID0gcGF0aDtcblxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybiBzZWFyY2ggcGFydCAoYXMgb2JqZWN0KSBvZiBjdXJyZW50IFVSTCB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSBzZWFyY2ggcGFydCB3aGVuIGNhbGxlZCB3aXRoIHBhcmFtZXRlciBhbmQgcmV0dXJuIGAkbG9jYXRpb25gLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG9cbiAgICogbGV0IHNlYXJjaE9iamVjdCA9ICRsb2NhdGlvbi5zZWFyY2goKTtcbiAgICogLy8gPT4ge2ZvbzogJ2JhcicsIGJhejogJ3hveG8nfVxuICAgKlxuICAgKiAvLyBzZXQgZm9vIHRvICd5aXBlZSdcbiAgICogJGxvY2F0aW9uLnNlYXJjaCgnZm9vJywgJ3lpcGVlJyk7XG4gICAqIC8vICRsb2NhdGlvbi5zZWFyY2goKSA9PiB7Zm9vOiAneWlwZWUnLCBiYXo6ICd4b3hvJ31cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdC48c3RyaW5nPnxPYmplY3QuPEFycmF5LjxzdHJpbmc+Pn0gc2VhcmNoIE5ldyBzZWFyY2ggcGFyYW1zIC0gc3RyaW5nIG9yXG4gICAqIGhhc2ggb2JqZWN0LlxuICAgKlxuICAgKiBXaGVuIGNhbGxlZCB3aXRoIGEgc2luZ2xlIGFyZ3VtZW50IHRoZSBtZXRob2QgYWN0cyBhcyBhIHNldHRlciwgc2V0dGluZyB0aGUgYHNlYXJjaGAgY29tcG9uZW50XG4gICAqIG9mIGAkbG9jYXRpb25gIHRvIHRoZSBzcGVjaWZpZWQgdmFsdWUuXG4gICAqXG4gICAqIElmIHRoZSBhcmd1bWVudCBpcyBhIGhhc2ggb2JqZWN0IGNvbnRhaW5pbmcgYW4gYXJyYXkgb2YgdmFsdWVzLCB0aGVzZSB2YWx1ZXMgd2lsbCBiZSBlbmNvZGVkXG4gICAqIGFzIGR1cGxpY2F0ZSBzZWFyY2ggcGFyYW1ldGVycyBpbiB0aGUgVVJMLlxuICAgKlxuICAgKiBAcGFyYW0geyhzdHJpbmd8TnVtYmVyfEFycmF5PHN0cmluZz58Ym9vbGVhbik9fSBwYXJhbVZhbHVlIElmIGBzZWFyY2hgIGlzIGEgc3RyaW5nIG9yIG51bWJlciwgdGhlbiBgcGFyYW1WYWx1ZWBcbiAgICogd2lsbCBvdmVycmlkZSBvbmx5IGEgc2luZ2xlIHNlYXJjaCBwcm9wZXJ0eS5cbiAgICpcbiAgICogSWYgYHBhcmFtVmFsdWVgIGlzIGFuIGFycmF5LCBpdCB3aWxsIG92ZXJyaWRlIHRoZSBwcm9wZXJ0eSBvZiB0aGUgYHNlYXJjaGAgY29tcG9uZW50IG9mXG4gICAqIGAkbG9jYXRpb25gIHNwZWNpZmllZCB2aWEgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgKlxuICAgKiBJZiBgcGFyYW1WYWx1ZWAgaXMgYG51bGxgLCB0aGUgcHJvcGVydHkgc3BlY2lmaWVkIHZpYSB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBkZWxldGVkLlxuICAgKlxuICAgKiBJZiBgcGFyYW1WYWx1ZWAgaXMgYHRydWVgLCB0aGUgcHJvcGVydHkgc3BlY2lmaWVkIHZpYSB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBhZGRlZCB3aXRoIG5vXG4gICAqIHZhbHVlIG5vciB0cmFpbGluZyBlcXVhbCBzaWduLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IElmIGNhbGxlZCB3aXRoIG5vIGFyZ3VtZW50cyByZXR1cm5zIHRoZSBwYXJzZWQgYHNlYXJjaGAgb2JqZWN0LiBJZiBjYWxsZWQgd2l0aFxuICAgKiBvbmUgb3IgbW9yZSBhcmd1bWVudHMgcmV0dXJucyBgJGxvY2F0aW9uYCBvYmplY3QgaXRzZWxmLlxuICAgKi9cbiAgc2VhcmNoKCk6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufTtcbiAgc2VhcmNoKHNlYXJjaDogc3RyaW5nfG51bWJlcnx7W2tleTogc3RyaW5nXTogdW5rbm93bn0pOiB0aGlzO1xuICBzZWFyY2goXG4gICAgICBzZWFyY2g6IHN0cmluZ3xudW1iZXJ8e1trZXk6IHN0cmluZ106IHVua25vd259LFxuICAgICAgcGFyYW1WYWx1ZTogbnVsbHx1bmRlZmluZWR8c3RyaW5nfG51bWJlcnxib29sZWFufHN0cmluZ1tdKTogdGhpcztcbiAgc2VhcmNoKFxuICAgICAgc2VhcmNoPzogc3RyaW5nfG51bWJlcnx7W2tleTogc3RyaW5nXTogdW5rbm93bn0sXG4gICAgICBwYXJhbVZhbHVlPzogbnVsbHx1bmRlZmluZWR8c3RyaW5nfG51bWJlcnxib29sZWFufHN0cmluZ1tdKToge1trZXk6IHN0cmluZ106IHVua25vd259fHRoaXMge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy4kJHNlYXJjaDtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzZWFyY2ggPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy4kJHNlYXJjaCA9IHRoaXMudXJsQ29kZWMuZGVjb2RlU2VhcmNoKHNlYXJjaC50b1N0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VhcmNoID09PSAnb2JqZWN0JyAmJiBzZWFyY2ggIT09IG51bGwpIHtcbiAgICAgICAgICAvLyBDb3B5IHRoZSBvYmplY3Qgc28gaXQncyBuZXZlciBtdXRhdGVkXG4gICAgICAgICAgc2VhcmNoID0gey4uLnNlYXJjaH07XG4gICAgICAgICAgLy8gcmVtb3ZlIG9iamVjdCB1bmRlZmluZWQgb3IgbnVsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2VhcmNoKSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoW2tleV0gPT0gbnVsbCkgZGVsZXRlIHNlYXJjaFtrZXldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuJCRzZWFyY2ggPSBzZWFyY2g7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnTG9jYXRpb25Qcm92aWRlci5zZWFyY2goKTogRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZyBvciBhbiBvYmplY3QuJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50U2VhcmNoID0gdGhpcy5zZWFyY2goKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtVmFsdWUgPT09ICd1bmRlZmluZWQnIHx8IHBhcmFtVmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjdXJyZW50U2VhcmNoW3NlYXJjaF07XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2goY3VycmVudFNlYXJjaCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRTZWFyY2hbc2VhcmNoXSA9IHBhcmFtVmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2goY3VycmVudFNlYXJjaCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29tcG9zZVVybHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBnZXR0ZXIgLyBzZXR0ZXIuXG4gICAqXG4gICAqIFJldHVybnMgdGhlIGhhc2ggZnJhZ21lbnQgd2hlbiBjYWxsZWQgd2l0aG91dCBhbnkgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQ2hhbmdlcyB0aGUgaGFzaCBmcmFnbWVudCB3aGVuIGNhbGxlZCB3aXRoIGEgcGFyYW1ldGVyIGFuZCByZXR1cm5zIGAkbG9jYXRpb25gLlxuICAgKlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiAvLyBnaXZlbiBVUkwgaHR0cDovL2V4YW1wbGUuY29tLyMvc29tZS9wYXRoP2Zvbz1iYXImYmF6PXhveG8jaGFzaFZhbHVlXG4gICAqIGxldCBoYXNoID0gJGxvY2F0aW9uLmhhc2goKTtcbiAgICogLy8gPT4gXCJoYXNoVmFsdWVcIlxuICAgKiBgYGBcbiAgICovXG4gIGhhc2goKTogc3RyaW5nO1xuICBoYXNoKGhhc2g6IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHRoaXM7XG4gIGhhc2goaGFzaD86IHN0cmluZ3xudW1iZXJ8bnVsbCk6IHN0cmluZ3x0aGlzIHtcbiAgICBpZiAodHlwZW9mIGhhc2ggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy4kJGhhc2g7XG4gICAgfVxuXG4gICAgdGhpcy4kJGhhc2ggPSBoYXNoICE9PSBudWxsID8gaGFzaC50b1N0cmluZygpIDogJyc7XG5cbiAgICB0aGlzLmNvbXBvc2VVcmxzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSWYgY2FsbGVkLCBhbGwgY2hhbmdlcyB0byAkbG9jYXRpb24gZHVyaW5nIHRoZSBjdXJyZW50IGAkZGlnZXN0YCB3aWxsIHJlcGxhY2UgdGhlIGN1cnJlbnRcbiAgICogaGlzdG9yeSByZWNvcmQsIGluc3RlYWQgb2YgYWRkaW5nIGEgbmV3IG9uZS5cbiAgICovXG4gIHJlcGxhY2UoKTogdGhpcyB7XG4gICAgdGhpcy4kJHJlcGxhY2UgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGdldHRlciAvIHNldHRlci5cbiAgICpcbiAgICogUmV0dXJuIHRoZSBoaXN0b3J5IHN0YXRlIG9iamVjdCB3aGVuIGNhbGxlZCB3aXRob3V0IGFueSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIENoYW5nZSB0aGUgaGlzdG9yeSBzdGF0ZSBvYmplY3Qgd2hlbiBjYWxsZWQgd2l0aCBvbmUgcGFyYW1ldGVyIGFuZCByZXR1cm4gYCRsb2NhdGlvbmAuXG4gICAqIFRoZSBzdGF0ZSBvYmplY3QgaXMgbGF0ZXIgcGFzc2VkIHRvIGBwdXNoU3RhdGVgIG9yIGByZXBsYWNlU3RhdGVgLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1ldGhvZCBpcyBzdXBwb3J0ZWQgb25seSBpbiBIVE1MNSBtb2RlIGFuZCBvbmx5IGluIGJyb3dzZXJzIHN1cHBvcnRpbmdcbiAgICogdGhlIEhUTUw1IEhpc3RvcnkgQVBJIChpLmUuIG1ldGhvZHMgYHB1c2hTdGF0ZWAgYW5kIGByZXBsYWNlU3RhdGVgKS4gSWYgeW91IG5lZWQgdG8gc3VwcG9ydFxuICAgKiBvbGRlciBicm93c2VycyAobGlrZSBJRTkgb3IgQW5kcm9pZCA8IDQuMCksIGRvbid0IHVzZSB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICovXG4gIHN0YXRlKCk6IHVua25vd247XG4gIHN0YXRlKHN0YXRlOiB1bmtub3duKTogdGhpcztcbiAgc3RhdGUoc3RhdGU/OiB1bmtub3duKTogdW5rbm93bnx0aGlzIHtcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuJCRzdGF0ZTtcbiAgICB9XG5cbiAgICB0aGlzLiQkc3RhdGUgPSBzdGF0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIERvY3MgVEJELlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzICRsb2NhdGlvblNoaW1Qcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBuZ1VwZ3JhZGU6IFVwZ3JhZGVNb2R1bGUsIHByaXZhdGUgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgcHJpdmF0ZSBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLCBwcml2YXRlIHVybENvZGVjOiBVcmxDb2RlYyxcbiAgICAgIHByaXZhdGUgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge31cblxuICAkZ2V0KCkge1xuICAgIHJldHVybiBuZXcgJGxvY2F0aW9uU2hpbShcbiAgICAgICAgdGhpcy5uZ1VwZ3JhZGUuJGluamVjdG9yLCB0aGlzLmxvY2F0aW9uLCB0aGlzLnBsYXRmb3JtTG9jYXRpb24sIHRoaXMudXJsQ29kZWMsXG4gICAgICAgIHRoaXMubG9jYXRpb25TdHJhdGVneSk7XG4gIH1cblxuICAvKipcbiAgICogU3R1YiBtZXRob2QgdXNlZCB0byBrZWVwIEFQSSBjb21wYXRpYmxlIHdpdGggQW5ndWxhckpTLiBUaGlzIHNldHRpbmcgaXMgY29uZmlndXJlZCB0aHJvdWdoXG4gICAqIHRoZSBMb2NhdGlvblVwZ3JhZGVNb2R1bGUncyBgY29uZmlnYCBtZXRob2QgaW4geW91ciBBbmd1bGFyIGFwcC5cbiAgICovXG4gIGhhc2hQcmVmaXgocHJlZml4Pzogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb25maWd1cmUgTG9jYXRpb25VcGdyYWRlIHRocm91Z2ggTG9jYXRpb25VcGdyYWRlTW9kdWxlLmNvbmZpZyBtZXRob2QuJyk7XG4gIH1cblxuICAvKipcbiAgICogU3R1YiBtZXRob2QgdXNlZCB0byBrZWVwIEFQSSBjb21wYXRpYmxlIHdpdGggQW5ndWxhckpTLiBUaGlzIHNldHRpbmcgaXMgY29uZmlndXJlZCB0aHJvdWdoXG4gICAqIHRoZSBMb2NhdGlvblVwZ3JhZGVNb2R1bGUncyBgY29uZmlnYCBtZXRob2QgaW4geW91ciBBbmd1bGFyIGFwcC5cbiAgICovXG4gIGh0bWw1TW9kZShtb2RlPzogYW55KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb25maWd1cmUgTG9jYXRpb25VcGdyYWRlIHRocm91Z2ggTG9jYXRpb25VcGdyYWRlTW9kdWxlLmNvbmZpZyBtZXRob2QuJyk7XG4gIH1cbn1cbiJdfQ==