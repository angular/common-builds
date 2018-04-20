/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Injectable } from '@angular/core';
/**
 * A spy for {\@link Location} that allows tests to fire simulated location events.
 *
 * \@experimental
 */
var SpyLocation = /** @class */ (function () {
    function SpyLocation() {
        this.urlChanges = [];
        this._history = [new LocationState('', '', null)];
        this._historyIndex = 0;
        /**
         * \@internal
         */
        this._subject = new EventEmitter();
        /**
         * \@internal
         */
        this._baseHref = '';
        /**
         * \@internal
         */
        this._platformStrategy = /** @type {?} */ ((null));
    }
    /**
     * @param {?} url
     * @return {?}
     */
    SpyLocation.prototype.setInitialPath = /**
     * @param {?} url
     * @return {?}
     */
    function (url) { this._history[this._historyIndex].path = url; };
    /**
     * @param {?} url
     * @return {?}
     */
    SpyLocation.prototype.setBaseHref = /**
     * @param {?} url
     * @return {?}
     */
    function (url) { this._baseHref = url; };
    /**
     * @return {?}
     */
    SpyLocation.prototype.path = /**
     * @return {?}
     */
    function () { return this._history[this._historyIndex].path; };
    /**
     * @return {?}
     */
    SpyLocation.prototype.state = /**
     * @return {?}
     */
    function () { return this._history[this._historyIndex].state; };
    /**
     * @param {?} path
     * @param {?=} query
     * @return {?}
     */
    SpyLocation.prototype.isCurrentPathEqualTo = /**
     * @param {?} path
     * @param {?=} query
     * @return {?}
     */
    function (path, query) {
        if (query === void 0) { query = ''; }
        var /** @type {?} */ givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
        var /** @type {?} */ currPath = this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();
        return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
    };
    /**
     * @param {?} pathname
     * @return {?}
     */
    SpyLocation.prototype.simulateUrlPop = /**
     * @param {?} pathname
     * @return {?}
     */
    function (pathname) {
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
    };
    /**
     * @param {?} pathname
     * @return {?}
     */
    SpyLocation.prototype.simulateHashChange = /**
     * @param {?} pathname
     * @return {?}
     */
    function (pathname) {
        // Because we don't prevent the native event, the browser will independently update the path
        this.setInitialPath(pathname);
        this.urlChanges.push('hash: ' + pathname);
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'hashchange' });
    };
    /**
     * @param {?} url
     * @return {?}
     */
    SpyLocation.prototype.prepareExternalUrl = /**
     * @param {?} url
     * @return {?}
     */
    function (url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    };
    /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    SpyLocation.prototype.go = /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    function (path, query, state) {
        if (query === void 0) { query = ''; }
        if (state === void 0) { state = null; }
        path = this.prepareExternalUrl(path);
        if (this._historyIndex > 0) {
            this._history.splice(this._historyIndex + 1);
        }
        this._history.push(new LocationState(path, query, state));
        this._historyIndex = this._history.length - 1;
        var /** @type {?} */ locationState = this._history[this._historyIndex - 1];
        if (locationState.path == path && locationState.query == query) {
            return;
        }
        var /** @type {?} */ url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
        this._subject.emit({ 'url': url, 'pop': false });
    };
    /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    SpyLocation.prototype.replaceState = /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    function (path, query, state) {
        if (query === void 0) { query = ''; }
        if (state === void 0) { state = null; }
        path = this.prepareExternalUrl(path);
        var /** @type {?} */ history = this._history[this._historyIndex];
        if (history.path == path && history.query == query) {
            return;
        }
        history.path = path;
        history.query = query;
        history.state = state;
        var /** @type {?} */ url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push('replace: ' + url);
    };
    /**
     * @return {?}
     */
    SpyLocation.prototype.forward = /**
     * @return {?}
     */
    function () {
        if (this._historyIndex < (this._history.length - 1)) {
            this._historyIndex++;
            this._subject.emit({ 'url': this.path(), 'state': this.state(), 'pop': true });
        }
    };
    /**
     * @return {?}
     */
    SpyLocation.prototype.back = /**
     * @return {?}
     */
    function () {
        if (this._historyIndex > 0) {
            this._historyIndex--;
            this._subject.emit({ 'url': this.path(), 'state': this.state(), 'pop': true });
        }
    };
    /**
     * @param {?} onNext
     * @param {?=} onThrow
     * @param {?=} onReturn
     * @return {?}
     */
    SpyLocation.prototype.subscribe = /**
     * @param {?} onNext
     * @param {?=} onThrow
     * @param {?=} onReturn
     * @return {?}
     */
    function (onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    };
    /**
     * @param {?} url
     * @return {?}
     */
    SpyLocation.prototype.normalize = /**
     * @param {?} url
     * @return {?}
     */
    function (url) { return /** @type {?} */ ((null)); };
    SpyLocation.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    SpyLocation.ctorParameters = function () { return []; };
    return SpyLocation;
}());
export { SpyLocation };
function SpyLocation_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    SpyLocation.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    SpyLocation.ctorParameters;
    /** @type {?} */
    SpyLocation.prototype.urlChanges;
    /** @type {?} */
    SpyLocation.prototype._history;
    /** @type {?} */
    SpyLocation.prototype._historyIndex;
    /**
     * \@internal
     * @type {?}
     */
    SpyLocation.prototype._subject;
    /**
     * \@internal
     * @type {?}
     */
    SpyLocation.prototype._baseHref;
    /**
     * \@internal
     * @type {?}
     */
    SpyLocation.prototype._platformStrategy;
}
var LocationState = /** @class */ (function () {
    function LocationState(path, query, state) {
        this.path = path;
        this.query = query;
        this.state = state;
    }
    return LocationState;
}());
function LocationState_tsickle_Closure_declarations() {
    /** @type {?} */
    LocationState.prototype.path;
    /** @type {?} */
    LocationState.prototype.query;
    /** @type {?} */
    LocationState.prototype.state;
}
//# sourceMappingURL=location_mock.js.map