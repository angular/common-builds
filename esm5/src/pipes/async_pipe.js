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
import { ChangeDetectorRef, Pipe, WrappedValue, ɵisObservable, ɵisPromise } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * @record
 */
function SubscriptionStrategy() { }
function SubscriptionStrategy_tsickle_Closure_declarations() {
    /** @type {?} */
    SubscriptionStrategy.prototype.createSubscription;
    /** @type {?} */
    SubscriptionStrategy.prototype.dispose;
    /** @type {?} */
    SubscriptionStrategy.prototype.onDestroy;
}
var ObservableStrategy = /** @class */ (function () {
    function ObservableStrategy() {
    }
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    ObservableStrategy.prototype.createSubscription = /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    function (async, updateLatestValue) {
        return async.subscribe({ next: updateLatestValue, error: function (e) { throw e; } });
    };
    /**
     * @param {?} subscription
     * @return {?}
     */
    ObservableStrategy.prototype.dispose = /**
     * @param {?} subscription
     * @return {?}
     */
    function (subscription) { subscription.unsubscribe(); };
    /**
     * @param {?} subscription
     * @return {?}
     */
    ObservableStrategy.prototype.onDestroy = /**
     * @param {?} subscription
     * @return {?}
     */
    function (subscription) { subscription.unsubscribe(); };
    return ObservableStrategy;
}());
var PromiseStrategy = /** @class */ (function () {
    function PromiseStrategy() {
    }
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    PromiseStrategy.prototype.createSubscription = /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    function (async, updateLatestValue) {
        return async.then(updateLatestValue, function (e) { throw e; });
    };
    /**
     * @param {?} subscription
     * @return {?}
     */
    PromiseStrategy.prototype.dispose = /**
     * @param {?} subscription
     * @return {?}
     */
    function (subscription) { };
    /**
     * @param {?} subscription
     * @return {?}
     */
    PromiseStrategy.prototype.onDestroy = /**
     * @param {?} subscription
     * @return {?}
     */
    function (subscription) { };
    return PromiseStrategy;
}());
var /** @type {?} */ _promiseStrategy = new PromiseStrategy();
var /** @type {?} */ _observableStrategy = new ObservableStrategy();
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks.
 *
 *
 * ## Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {\@example common/pipes/ts/async_pipe.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. The Observable continuously updates the view with the current time.
 *
 * {\@example common/pipes/ts/async_pipe.ts region='AsyncPipeObservable'}
 *
 *
 */
var AsyncPipe = /** @class */ (function () {
    function AsyncPipe(_ref) {
        this._ref = _ref;
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
        this._strategy = /** @type {?} */ ((null));
    }
    /**
     * @return {?}
     */
    AsyncPipe.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this._subscription) {
            this._dispose();
        }
    };
    /**
     * @param {?} obj
     * @return {?}
     */
    AsyncPipe.prototype.transform = /**
     * @param {?} obj
     * @return {?}
     */
    function (obj) {
        if (!this._obj) {
            if (obj) {
                this._subscribe(obj);
            }
            this._latestReturnedValue = this._latestValue;
            return this._latestValue;
        }
        if (obj !== this._obj) {
            this._dispose();
            return this.transform(/** @type {?} */ (obj));
        }
        if (this._latestValue === this._latestReturnedValue) {
            return this._latestReturnedValue;
        }
        this._latestReturnedValue = this._latestValue;
        return WrappedValue.wrap(this._latestValue);
    };
    /**
     * @param {?} obj
     * @return {?}
     */
    AsyncPipe.prototype._subscribe = /**
     * @param {?} obj
     * @return {?}
     */
    function (obj) {
        var _this = this;
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription = this._strategy.createSubscription(obj, function (value) { return _this._updateLatestValue(obj, value); });
    };
    /**
     * @param {?} obj
     * @return {?}
     */
    AsyncPipe.prototype._selectStrategy = /**
     * @param {?} obj
     * @return {?}
     */
    function (obj) {
        if (ɵisPromise(obj)) {
            return _promiseStrategy;
        }
        if (ɵisObservable(obj)) {
            return _observableStrategy;
        }
        throw invalidPipeArgumentError(AsyncPipe, obj);
    };
    /**
     * @return {?}
     */
    AsyncPipe.prototype._dispose = /**
     * @return {?}
     */
    function () {
        this._strategy.dispose(/** @type {?} */ ((this._subscription)));
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
    };
    /**
     * @param {?} async
     * @param {?} value
     * @return {?}
     */
    AsyncPipe.prototype._updateLatestValue = /**
     * @param {?} async
     * @param {?} value
     * @return {?}
     */
    function (async, value) {
        if (async === this._obj) {
            this._latestValue = value;
            this._ref.markForCheck();
        }
    };
    AsyncPipe.decorators = [
        { type: Pipe, args: [{ name: 'async', pure: false },] },
    ];
    /** @nocollapse */
    AsyncPipe.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
    ]; };
    return AsyncPipe;
}());
export { AsyncPipe };
function AsyncPipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    AsyncPipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    AsyncPipe.ctorParameters;
    /** @type {?} */
    AsyncPipe.prototype._latestValue;
    /** @type {?} */
    AsyncPipe.prototype._latestReturnedValue;
    /** @type {?} */
    AsyncPipe.prototype._subscription;
    /** @type {?} */
    AsyncPipe.prototype._obj;
    /** @type {?} */
    AsyncPipe.prototype._strategy;
    /** @type {?} */
    AsyncPipe.prototype._ref;
}
//# sourceMappingURL=async_pipe.js.map