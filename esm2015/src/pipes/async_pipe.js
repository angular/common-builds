/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/pipes/async_pipe.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, Pipe, ɵisObservable, ɵisPromise } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * @record
 */
function SubscriptionStrategy() { }
if (false) {
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    SubscriptionStrategy.prototype.createSubscription = function (async, updateLatestValue) { };
    /**
     * @param {?} subscription
     * @return {?}
     */
    SubscriptionStrategy.prototype.dispose = function (subscription) { };
    /**
     * @param {?} subscription
     * @return {?}
     */
    SubscriptionStrategy.prototype.onDestroy = function (subscription) { };
}
class ObservableStrategy {
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    createSubscription(async, updateLatestValue) {
        return async.subscribe({
            next: updateLatestValue,
            error: (/**
             * @param {?} e
             * @return {?}
             */
            (e) => {
                throw e;
            })
        });
    }
    /**
     * @param {?} subscription
     * @return {?}
     */
    dispose(subscription) {
        subscription.unsubscribe();
    }
    /**
     * @param {?} subscription
     * @return {?}
     */
    onDestroy(subscription) {
        subscription.unsubscribe();
    }
}
class PromiseStrategy {
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue, (/**
         * @param {?} e
         * @return {?}
         */
        e => {
            throw e;
        }));
    }
    /**
     * @param {?} subscription
     * @return {?}
     */
    dispose(subscription) { }
    /**
     * @param {?} subscription
     * @return {?}
     */
    onDestroy(subscription) { }
}
/** @type {?} */
const _promiseStrategy = new PromiseStrategy();
/** @type {?} */
const _observableStrategy = new ObservableStrategy();
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
 * \@usageNotes
 *
 * ### Examples
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
 * \@publicApi
 */
let AsyncPipe = /** @class */ (() => {
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
     * \@usageNotes
     *
     * ### Examples
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
     * \@publicApi
     */
    class AsyncPipe {
        /**
         * @param {?} _ref
         */
        constructor(_ref) {
            this._ref = _ref;
            this._latestValue = null;
            this._subscription = null;
            this._obj = null;
            this._strategy = (/** @type {?} */ (null));
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            if (this._subscription) {
                this._dispose();
            }
        }
        /**
         * @param {?} obj
         * @return {?}
         */
        transform(obj) {
            if (!this._obj) {
                if (obj) {
                    this._subscribe(obj);
                }
                return this._latestValue;
            }
            if (obj !== this._obj) {
                this._dispose();
                return this.transform((/** @type {?} */ (obj)));
            }
            return this._latestValue;
        }
        /**
         * @private
         * @param {?} obj
         * @return {?}
         */
        _subscribe(obj) {
            this._obj = obj;
            this._strategy = this._selectStrategy(obj);
            this._subscription = this._strategy.createSubscription(obj, (/**
             * @param {?} value
             * @return {?}
             */
            (value) => this._updateLatestValue(obj, value)));
        }
        /**
         * @private
         * @param {?} obj
         * @return {?}
         */
        _selectStrategy(obj) {
            if (ɵisPromise(obj)) {
                return _promiseStrategy;
            }
            if (ɵisObservable(obj)) {
                return _observableStrategy;
            }
            throw invalidPipeArgumentError(AsyncPipe, obj);
        }
        /**
         * @private
         * @return {?}
         */
        _dispose() {
            this._strategy.dispose((/** @type {?} */ (this._subscription)));
            this._latestValue = null;
            this._subscription = null;
            this._obj = null;
        }
        /**
         * @private
         * @param {?} async
         * @param {?} value
         * @return {?}
         */
        _updateLatestValue(async, value) {
            if (async === this._obj) {
                this._latestValue = value;
                this._ref.markForCheck();
            }
        }
    }
    AsyncPipe.decorators = [
        { type: Pipe, args: [{ name: 'async', pure: false },] }
    ];
    /** @nocollapse */
    AsyncPipe.ctorParameters = () => [
        { type: ChangeDetectorRef }
    ];
    return AsyncPipe;
})();
export { AsyncPipe };
if (false) {
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._latestValue;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._subscription;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._obj;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._strategy;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._ref;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsaUJBQWlCLEVBQTJCLElBQUksRUFBaUIsYUFBYSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6SCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7OztBQUV2RSxtQ0FLQzs7Ozs7OztJQUpDLDRGQUNrQjs7Ozs7SUFDbEIscUVBQTJEOzs7OztJQUMzRCx1RUFBNkQ7O0FBRy9ELE1BQU0sa0JBQWtCOzs7Ozs7SUFDdEIsa0JBQWtCLENBQUMsS0FBc0IsRUFBRSxpQkFBc0I7UUFDL0QsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ3JCLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsS0FBSzs7OztZQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxDQUFBO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Ozs7SUFFRCxPQUFPLENBQUMsWUFBOEI7UUFDcEMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdCLENBQUM7Ozs7O0lBRUQsU0FBUyxDQUFDLFlBQThCO1FBQ3RDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUFFRCxNQUFNLGVBQWU7Ozs7OztJQUNuQixrQkFBa0IsQ0FBQyxLQUFtQixFQUFFLGlCQUFrQztRQUN4RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCOzs7O1FBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdkMsTUFBTSxDQUFDLENBQUM7UUFDVixDQUFDLEVBQUMsQ0FBQztJQUNMLENBQUM7Ozs7O0lBRUQsT0FBTyxDQUFDLFlBQTBCLElBQVMs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QUNwQixpQ0FBaUM7Ozs7O0lBRWpDLGtDQUFpRTs7Ozs7SUFDakUseUJBQXlFOzs7OztJQUN6RSw4QkFBZ0Q7Ozs7O0lBRXBDLHlCQUErQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgRXZlbnRFbWl0dGVyLCBPbkRlc3Ryb3ksIFBpcGUsIFBpcGVUcmFuc2Zvcm0sIMm1aXNPYnNlcnZhYmxlLCDJtWlzUHJvbWlzZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmlwdGlvbkxpa2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuaW50ZXJmYWNlIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogU3Vic2NyaXB0aW9uTGlrZVxuICAgICAgfFByb21pc2U8YW55PjtcbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbkxpa2V8UHJvbWlzZTxhbnk+KTogdm9pZDtcbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZXxQcm9taXNlPGFueT4pOiB2b2lkO1xufVxuXG5jbGFzcyBPYnNlcnZhYmxlU3RyYXRlZ3kgaW1wbGVtZW50cyBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogT2JzZXJ2YWJsZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIGFzeW5jLnN1YnNjcmliZSh7XG4gICAgICBuZXh0OiB1cGRhdGVMYXRlc3RWYWx1ZSxcbiAgICAgIGVycm9yOiAoZTogYW55KSA9PiB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZSk6IHZvaWQge1xuICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZSk6IHZvaWQge1xuICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG59XG5cbmNsYXNzIFByb21pc2VTdHJhdGVneSBpbXBsZW1lbnRzIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBQcm9taXNlPGFueT4sIHVwZGF0ZUxhdGVzdFZhbHVlOiAodjogYW55KSA9PiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhc3luYy50aGVuKHVwZGF0ZUxhdGVzdFZhbHVlLCBlID0+IHtcbiAgICAgIHRocm93IGU7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogUHJvbWlzZTxhbnk+KTogdm9pZCB7fVxuXG4gIG9uRGVzdHJveShzdWJzY3JpcHRpb246IFByb21pc2U8YW55Pik6IHZvaWQge31cbn1cblxuY29uc3QgX3Byb21pc2VTdHJhdGVneSA9IG5ldyBQcm9taXNlU3RyYXRlZ3koKTtcbmNvbnN0IF9vYnNlcnZhYmxlU3RyYXRlZ3kgPSBuZXcgT2JzZXJ2YWJsZVN0cmF0ZWd5KCk7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVW53cmFwcyBhIHZhbHVlIGZyb20gYW4gYXN5bmNocm9ub3VzIHByaW1pdGl2ZS5cbiAqXG4gKiBUaGUgYGFzeW5jYCBwaXBlIHN1YnNjcmliZXMgdG8gYW4gYE9ic2VydmFibGVgIG9yIGBQcm9taXNlYCBhbmQgcmV0dXJucyB0aGUgbGF0ZXN0IHZhbHVlIGl0IGhhc1xuICogZW1pdHRlZC4gV2hlbiBhIG5ldyB2YWx1ZSBpcyBlbWl0dGVkLCB0aGUgYGFzeW5jYCBwaXBlIG1hcmtzIHRoZSBjb21wb25lbnQgdG8gYmUgY2hlY2tlZCBmb3JcbiAqIGNoYW5nZXMuIFdoZW4gdGhlIGNvbXBvbmVudCBnZXRzIGRlc3Ryb3llZCwgdGhlIGBhc3luY2AgcGlwZSB1bnN1YnNjcmliZXMgYXV0b21hdGljYWxseSB0byBhdm9pZFxuICogcG90ZW50aWFsIG1lbW9yeSBsZWFrcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIFRoaXMgZXhhbXBsZSBiaW5kcyBhIGBQcm9taXNlYCB0byB0aGUgdmlldy4gQ2xpY2tpbmcgdGhlIGBSZXNvbHZlYCBidXR0b24gcmVzb2x2ZXMgdGhlXG4gKiBwcm9taXNlLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvYXN5bmNfcGlwZS50cyByZWdpb249J0FzeW5jUGlwZVByb21pc2UnfVxuICpcbiAqIEl0J3MgYWxzbyBwb3NzaWJsZSB0byB1c2UgYGFzeW5jYCB3aXRoIE9ic2VydmFibGVzLiBUaGUgZXhhbXBsZSBiZWxvdyBiaW5kcyB0aGUgYHRpbWVgIE9ic2VydmFibGVcbiAqIHRvIHRoZSB2aWV3LiBUaGUgT2JzZXJ2YWJsZSBjb250aW51b3VzbHkgdXBkYXRlcyB0aGUgdmlldyB3aXRoIHRoZSBjdXJyZW50IHRpbWUuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9hc3luY19waXBlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlT2JzZXJ2YWJsZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2FzeW5jJywgcHVyZTogZmFsc2V9KVxuZXhwb3J0IGNsYXNzIEFzeW5jUGlwZSBpbXBsZW1lbnRzIE9uRGVzdHJveSwgUGlwZVRyYW5zZm9ybSB7XG4gIHByaXZhdGUgX2xhdGVzdFZhbHVlOiBhbnkgPSBudWxsO1xuXG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZXxQcm9taXNlPGFueT58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX29iajogT2JzZXJ2YWJsZTxhbnk+fFByb21pc2U8YW55PnxFdmVudEVtaXR0ZXI8YW55PnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IFN1YnNjcmlwdGlvblN0cmF0ZWd5ID0gbnVsbCE7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge31cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgdHJhbnNmb3JtPFQ+KG9iajogbnVsbCk6IG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IHVuZGVmaW5lZCk6IHVuZGVmaW5lZDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogT2JzZXJ2YWJsZTxUPnxudWxsfHVuZGVmaW5lZCk6IFR8bnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogUHJvbWlzZTxUPnxudWxsfHVuZGVmaW5lZCk6IFR8bnVsbDtcbiAgdHJhbnNmb3JtKG9iajogT2JzZXJ2YWJsZTxhbnk+fFByb21pc2U8YW55PnxudWxsfHVuZGVmaW5lZCk6IGFueSB7XG4gICAgaWYgKCF0aGlzLl9vYmopIHtcbiAgICAgIGlmIChvYmopIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlKG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG9iaiAhPT0gdGhpcy5fb2JqKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0ob2JqIGFzIGFueSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhdGVzdFZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlKG9iajogT2JzZXJ2YWJsZTxhbnk+fFByb21pc2U8YW55PnxFdmVudEVtaXR0ZXI8YW55Pik6IHZvaWQge1xuICAgIHRoaXMuX29iaiA9IG9iajtcbiAgICB0aGlzLl9zdHJhdGVneSA9IHRoaXMuX3NlbGVjdFN0cmF0ZWd5KG9iaik7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gdGhpcy5fc3RyYXRlZ3kuY3JlYXRlU3Vic2NyaXB0aW9uKFxuICAgICAgICBvYmosICh2YWx1ZTogT2JqZWN0KSA9PiB0aGlzLl91cGRhdGVMYXRlc3RWYWx1ZShvYmosIHZhbHVlKSk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3RTdHJhdGVneShvYmo6IE9ic2VydmFibGU8YW55PnxQcm9taXNlPGFueT58RXZlbnRFbWl0dGVyPGFueT4pOiBhbnkge1xuICAgIGlmICjJtWlzUHJvbWlzZShvYmopKSB7XG4gICAgICByZXR1cm4gX3Byb21pc2VTdHJhdGVneTtcbiAgICB9XG5cbiAgICBpZiAoybVpc09ic2VydmFibGUob2JqKSkge1xuICAgICAgcmV0dXJuIF9vYnNlcnZhYmxlU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEFzeW5jUGlwZSwgb2JqKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RyYXRlZ3kuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24hKTtcbiAgICB0aGlzLl9sYXRlc3RWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9vYmogPSBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlTGF0ZXN0VmFsdWUoYXN5bmM6IGFueSwgdmFsdWU6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChhc3luYyA9PT0gdGhpcy5fb2JqKSB7XG4gICAgICB0aGlzLl9sYXRlc3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgdGhpcy5fcmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19