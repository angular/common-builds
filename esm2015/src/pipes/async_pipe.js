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
import { ChangeDetectorRef, Pipe, WrappedValue, ɵisObservable, ɵisPromise } from '@angular/core';
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
        return async.subscribe({ next: updateLatestValue, error: (/**
             * @param {?} e
             * @return {?}
             */
            (e) => { throw e; }) });
    }
    /**
     * @param {?} subscription
     * @return {?}
     */
    dispose(subscription) { subscription.unsubscribe(); }
    /**
     * @param {?} subscription
     * @return {?}
     */
    onDestroy(subscription) { subscription.unsubscribe(); }
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
        e => { throw e; }));
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
export class AsyncPipe {
    /**
     * @param {?} _ref
     */
    constructor(_ref) {
        this._ref = _ref;
        this._latestValue = null;
        this._latestReturnedValue = null;
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
            this._latestReturnedValue = this._latestValue;
            return this._latestValue;
        }
        if (obj !== this._obj) {
            this._dispose();
            return this.transform((/** @type {?} */ (obj)));
        }
        if (this._latestValue === this._latestReturnedValue) {
            return this._latestReturnedValue;
        }
        this._latestReturnedValue = this._latestValue;
        return WrappedValue.wrap(this._latestValue);
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
        this._latestReturnedValue = null;
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
    AsyncPipe.prototype._latestReturnedValue;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBMkIsSUFBSSxFQUFpQixZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2SSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7OztBQUV2RSxtQ0FLQzs7Ozs7OztJQUpDLDRGQUNrQjs7Ozs7SUFDbEIscUVBQTJEOzs7OztJQUMzRCx1RUFBNkQ7O0FBRy9ELE1BQU0sa0JBQWtCOzs7Ozs7SUFDdEIsa0JBQWtCLENBQUMsS0FBc0IsRUFBRSxpQkFBc0I7UUFDL0QsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLEtBQUs7Ozs7WUFBRSxDQUFDLENBQU0sRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsRUFBQyxDQUFDLENBQUM7SUFDckYsQ0FBQzs7Ozs7SUFFRCxPQUFPLENBQUMsWUFBOEIsSUFBVSxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztJQUU3RSxTQUFTLENBQUMsWUFBOEIsSUFBVSxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2hGO0FBRUQsTUFBTSxlQUFlOzs7Ozs7SUFDbkIsa0JBQWtCLENBQUMsS0FBbUIsRUFBRSxpQkFBa0M7UUFDeEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQjs7OztRQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUMxRCxDQUFDOzs7OztJQUVELE9BQU8sQ0FBQyxZQUEwQixJ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QUFJLEtBQUssS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDMUI7SUFDSCxDQUFDOzs7WUEzRUYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDOzs7O1lBN0QxQixpQkFBaUI7Ozs7Ozs7SUErRHZCLGlDQUFpQzs7Ozs7SUFDakMseUNBQXlDOzs7OztJQUV6QyxrQ0FBaUU7Ozs7O0lBQ2pFLHlCQUF5RTs7Ozs7SUFDekUsOEJBQWlEOzs7OztJQUVyQyx5QkFBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWYsIEV2ZW50RW1pdHRlciwgT25EZXN0cm95LCBQaXBlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIMm1aXNPYnNlcnZhYmxlLCDJtWlzUHJvbWlzZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmlwdGlvbkxpa2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuaW50ZXJmYWNlIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogU3Vic2NyaXB0aW9uTGlrZVxuICAgICAgfFByb21pc2U8YW55PjtcbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbkxpa2V8UHJvbWlzZTxhbnk+KTogdm9pZDtcbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZXxQcm9taXNlPGFueT4pOiB2b2lkO1xufVxuXG5jbGFzcyBPYnNlcnZhYmxlU3RyYXRlZ3kgaW1wbGVtZW50cyBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogT2JzZXJ2YWJsZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIGFzeW5jLnN1YnNjcmliZSh7bmV4dDogdXBkYXRlTGF0ZXN0VmFsdWUsIGVycm9yOiAoZTogYW55KSA9PiB7IHRocm93IGU7IH19KTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25MaWtlKTogdm9pZCB7IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpOyB9XG5cbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZSk6IHZvaWQgeyBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfVxufVxuXG5jbGFzcyBQcm9taXNlU3RyYXRlZ3kgaW1wbGVtZW50cyBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogUHJvbWlzZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogKHY6IGFueSkgPT4gYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXN5bmMudGhlbih1cGRhdGVMYXRlc3RWYWx1ZSwgZSA9PiB7IHRocm93IGU7IH0pO1xuICB9XG5cbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFByb21pc2U8YW55Pik6IHZvaWQge31cblxuICBvbkRlc3Ryb3koc3Vic2NyaXB0aW9uOiBQcm9taXNlPGFueT4pOiB2b2lkIHt9XG59XG5cbmNvbnN0IF9wcm9taXNlU3RyYXRlZ3kgPSBuZXcgUHJvbWlzZVN0cmF0ZWd5KCk7XG5jb25zdCBfb2JzZXJ2YWJsZVN0cmF0ZWd5ID0gbmV3IE9ic2VydmFibGVTdHJhdGVneSgpO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFVud3JhcHMgYSB2YWx1ZSBmcm9tIGFuIGFzeW5jaHJvbm91cyBwcmltaXRpdmUuXG4gKlxuICogVGhlIGBhc3luY2AgcGlwZSBzdWJzY3JpYmVzIHRvIGFuIGBPYnNlcnZhYmxlYCBvciBgUHJvbWlzZWAgYW5kIHJldHVybnMgdGhlIGxhdGVzdCB2YWx1ZSBpdCBoYXNcbiAqIGVtaXR0ZWQuIFdoZW4gYSBuZXcgdmFsdWUgaXMgZW1pdHRlZCwgdGhlIGBhc3luY2AgcGlwZSBtYXJrcyB0aGUgY29tcG9uZW50IHRvIGJlIGNoZWNrZWQgZm9yXG4gKiBjaGFuZ2VzLiBXaGVuIHRoZSBjb21wb25lbnQgZ2V0cyBkZXN0cm95ZWQsIHRoZSBgYXN5bmNgIHBpcGUgdW5zdWJzY3JpYmVzIGF1dG9tYXRpY2FsbHkgdG8gYXZvaWRcbiAqIHBvdGVudGlhbCBtZW1vcnkgbGVha3MuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBUaGlzIGV4YW1wbGUgYmluZHMgYSBgUHJvbWlzZWAgdG8gdGhlIHZpZXcuIENsaWNraW5nIHRoZSBgUmVzb2x2ZWAgYnV0dG9uIHJlc29sdmVzIHRoZVxuICogcHJvbWlzZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2FzeW5jX3BpcGUudHMgcmVnaW9uPSdBc3luY1BpcGVQcm9taXNlJ31cbiAqXG4gKiBJdCdzIGFsc28gcG9zc2libGUgdG8gdXNlIGBhc3luY2Agd2l0aCBPYnNlcnZhYmxlcy4gVGhlIGV4YW1wbGUgYmVsb3cgYmluZHMgdGhlIGB0aW1lYCBPYnNlcnZhYmxlXG4gKiB0byB0aGUgdmlldy4gVGhlIE9ic2VydmFibGUgY29udGludW91c2x5IHVwZGF0ZXMgdGhlIHZpZXcgd2l0aCB0aGUgY3VycmVudCB0aW1lLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvYXN5bmNfcGlwZS50cyByZWdpb249J0FzeW5jUGlwZU9ic2VydmFibGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe25hbWU6ICdhc3luYycsIHB1cmU6IGZhbHNlfSlcbmV4cG9ydCBjbGFzcyBBc3luY1BpcGUgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIFBpcGVUcmFuc2Zvcm0ge1xuICBwcml2YXRlIF9sYXRlc3RWYWx1ZTogYW55ID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGF0ZXN0UmV0dXJuZWRWYWx1ZTogYW55ID0gbnVsbDtcblxuICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbkxpa2V8UHJvbWlzZTxhbnk+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9vYmo6IE9ic2VydmFibGU8YW55PnxQcm9taXNlPGFueT58RXZlbnRFbWl0dGVyPGFueT58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3N0cmF0ZWd5OiBTdWJzY3JpcHRpb25TdHJhdGVneSA9IG51bGwgITtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZWY6IENoYW5nZURldGVjdG9yUmVmKSB7fVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICB0cmFuc2Zvcm08VD4ob2JqOiBudWxsKTogbnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogdW5kZWZpbmVkKTogdW5kZWZpbmVkO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBPYnNlcnZhYmxlPFQ+fG51bGx8dW5kZWZpbmVkKTogVHxudWxsO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBQcm9taXNlPFQ+fG51bGx8dW5kZWZpbmVkKTogVHxudWxsO1xuICB0cmFuc2Zvcm0ob2JqOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+fG51bGx8dW5kZWZpbmVkKTogYW55IHtcbiAgICBpZiAoIXRoaXMuX29iaikge1xuICAgICAgaWYgKG9iaikge1xuICAgICAgICB0aGlzLl9zdWJzY3JpYmUob2JqKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUgPSB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICAgIHJldHVybiB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqICE9PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybShvYmogYXMgYW55KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGF0ZXN0VmFsdWUgPT09IHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUgPSB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICByZXR1cm4gV3JhcHBlZFZhbHVlLndyYXAodGhpcy5fbGF0ZXN0VmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlKG9iajogT2JzZXJ2YWJsZTxhbnk+fFByb21pc2U8YW55PnxFdmVudEVtaXR0ZXI8YW55Pik6IHZvaWQge1xuICAgIHRoaXMuX29iaiA9IG9iajtcbiAgICB0aGlzLl9zdHJhdGVneSA9IHRoaXMuX3NlbGVjdFN0cmF0ZWd5KG9iaik7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gdGhpcy5fc3RyYXRlZ3kuY3JlYXRlU3Vic2NyaXB0aW9uKFxuICAgICAgICBvYmosICh2YWx1ZTogT2JqZWN0KSA9PiB0aGlzLl91cGRhdGVMYXRlc3RWYWx1ZShvYmosIHZhbHVlKSk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3RTdHJhdGVneShvYmo6IE9ic2VydmFibGU8YW55PnxQcm9taXNlPGFueT58RXZlbnRFbWl0dGVyPGFueT4pOiBhbnkge1xuICAgIGlmICjJtWlzUHJvbWlzZShvYmopKSB7XG4gICAgICByZXR1cm4gX3Byb21pc2VTdHJhdGVneTtcbiAgICB9XG5cbiAgICBpZiAoybVpc09ic2VydmFibGUob2JqKSkge1xuICAgICAgcmV0dXJuIF9vYnNlcnZhYmxlU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEFzeW5jUGlwZSwgb2JqKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RyYXRlZ3kuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24gISk7XG4gICAgdGhpcy5fbGF0ZXN0VmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fb2JqID0gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUxhdGVzdFZhbHVlKGFzeW5jOiBhbnksIHZhbHVlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoYXN5bmMgPT09IHRoaXMuX29iaikge1xuICAgICAgdGhpcy5fbGF0ZXN0VmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuX3JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==