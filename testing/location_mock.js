"use strict";
var core_1 = require('@angular/core');
var async_1 = require('../src/facade/async');
var SpyLocation = (function () {
    function SpyLocation() {
        this.urlChanges = [];
        /** @internal */
        this._history = [new LocationState('', '')];
        /** @internal */
        this._historyIndex = 0;
        /** @internal */
        this._subject = new core_1.EventEmitter();
        /** @internal */
        this._baseHref = '';
        // TODO: remove these once Location is an interface, and can be implemented cleanly
        this.platformStrategy = null;
    }
    SpyLocation.prototype.setInitialPath = function (url) { this._history[this._historyIndex].path = url; };
    SpyLocation.prototype.setBaseHref = function (url) { this._baseHref = url; };
    SpyLocation.prototype.path = function () { return this._history[this._historyIndex].path; };
    SpyLocation.prototype.simulateUrlPop = function (pathname) {
        async_1.ObservableWrapper.callEmit(this._subject, { 'url': pathname, 'pop': true });
    };
    SpyLocation.prototype.simulateHashChange = function (pathname) {
        // Because we don't prevent the native event, the browser will independently update the path
        this.setInitialPath(pathname);
        this.urlChanges.push('hash: ' + pathname);
        async_1.ObservableWrapper.callEmit(this._subject, { 'url': pathname, 'pop': true, 'type': 'hashchange' });
    };
    SpyLocation.prototype.prepareExternalUrl = function (url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    };
    SpyLocation.prototype.go = function (path, query) {
        if (query === void 0) { query = ''; }
        path = this.prepareExternalUrl(path);
        if (this._historyIndex > 0) {
            this._history.splice(this._historyIndex + 1);
        }
        this._history.push(new LocationState(path, query));
        this._historyIndex = this._history.length - 1;
        var locationState = this._history[this._historyIndex - 1];
        if (locationState.path == path && locationState.query == query) {
            return;
        }
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
    };
    SpyLocation.prototype.replaceState = function (path, query) {
        if (query === void 0) { query = ''; }
        path = this.prepareExternalUrl(path);
        this._history[this._historyIndex].path = path;
        this._history[this._historyIndex].query = query;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push('replace: ' + url);
    };
    SpyLocation.prototype.forward = function () {
        if (this._historyIndex < (this._history.length - 1)) {
            this._historyIndex++;
            async_1.ObservableWrapper.callEmit(this._subject, { 'url': this.path(), 'pop': true });
        }
    };
    SpyLocation.prototype.back = function () {
        if (this._historyIndex > 0) {
            this._historyIndex--;
            async_1.ObservableWrapper.callEmit(this._subject, { 'url': this.path(), 'pop': true });
        }
    };
    SpyLocation.prototype.subscribe = function (onNext, onThrow, onReturn) {
        if (onThrow === void 0) { onThrow = null; }
        if (onReturn === void 0) { onReturn = null; }
        return async_1.ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    };
    SpyLocation.prototype.normalize = function (url) { return null; };
    SpyLocation.decorators = [
        { type: core_1.Injectable },
    ];
    return SpyLocation;
}());
exports.SpyLocation = SpyLocation;
var LocationState = (function () {
    function LocationState(path, query) {
        this.path = path;
        this.query = query;
    }
    return LocationState;
}());
//# sourceMappingURL=location_mock.js.map