/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, Pipe, untracked, ɵisPromise, ɵisSubscribable, } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
class SubscribableStrategy {
    createSubscription(async, updateLatestValue) {
        // Subscription can be side-effectful, and we don't want any signal reads which happen in the
        // side effect of the subscription to be tracked by a component's template when that
        // subscription is triggered via the async pipe. So we wrap the subscription in `untracked` to
        // decouple from the current reactive context.
        //
        // `untracked` also prevents signal _writes_ which happen in the subscription side effect from
        // being treated as signal writes during the template evaluation (which throws errors).
        return untracked(() => async.subscribe({
            next: updateLatestValue,
            error: (e) => {
                throw e;
            },
        }));
    }
    dispose(subscription) {
        // See the comment in `createSubscription` above on the use of `untracked`.
        untracked(() => subscription.unsubscribe());
    }
}
class PromiseStrategy {
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue, (e) => {
            throw e;
        });
    }
    dispose(subscription) { }
}
const _promiseStrategy = new PromiseStrategy();
const _subscribableStrategy = new SubscribableStrategy();
/**
 * @ngModule CommonModule
 * @description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks. When the reference of the expression changes, the `async` pipe
 * automatically unsubscribes from the old `Observable` or `Promise` and subscribes to the new one.
 *
 * @usageNotes
 *
 * ### Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. The Observable continuously updates the view with the current time.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipeObservable'}
 *
 * @publicApi
 */
export class AsyncPipe {
    constructor(ref) {
        this._latestValue = null;
        this.markForCheckOnValueUpdate = true;
        this._subscription = null;
        this._obj = null;
        this._strategy = null;
        // Assign `ref` into `this._ref` manually instead of declaring `_ref` in the constructor
        // parameter list, as the type of `this._ref` includes `null` unlike the type of `ref`.
        this._ref = ref;
    }
    ngOnDestroy() {
        if (this._subscription) {
            this._dispose();
        }
        // Clear the `ChangeDetectorRef` and its association with the view data, to mitigate
        // potential memory leaks in Observables that could otherwise cause the view data to
        // be retained.
        // https://github.com/angular/angular/issues/17624
        this._ref = null;
    }
    transform(obj) {
        if (!this._obj) {
            if (obj) {
                try {
                    // Only call `markForCheck` if the value is updated asynchronously.
                    // Synchronous updates _during_ subscription should not wastefully mark for check -
                    // this value is already going to be returned from the transform function.
                    this.markForCheckOnValueUpdate = false;
                    this._subscribe(obj);
                }
                finally {
                    this.markForCheckOnValueUpdate = true;
                }
            }
            return this._latestValue;
        }
        if (obj !== this._obj) {
            this._dispose();
            return this.transform(obj);
        }
        return this._latestValue;
    }
    _subscribe(obj) {
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription = this._strategy.createSubscription(obj, (value) => this._updateLatestValue(obj, value));
    }
    _selectStrategy(obj) {
        if (ɵisPromise(obj)) {
            return _promiseStrategy;
        }
        if (ɵisSubscribable(obj)) {
            return _subscribableStrategy;
        }
        throw invalidPipeArgumentError(AsyncPipe, obj);
    }
    _dispose() {
        // Note: `dispose` is only called if a subscription has been initialized before, indicating
        // that `this._strategy` is also available.
        this._strategy.dispose(this._subscription);
        this._latestValue = null;
        this._subscription = null;
        this._obj = null;
    }
    _updateLatestValue(async, value) {
        if (async === this._obj) {
            this._latestValue = value;
            if (this.markForCheckOnValueUpdate) {
                this._ref?.markForCheck();
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: AsyncPipe, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: AsyncPipe, isStandalone: true, name: "async", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: AsyncPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'async',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsaUJBQWlCLEVBR2pCLElBQUksRUFFSixTQUFTLEVBQ1QsVUFBVSxFQUNWLGVBQWUsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBVXZFLE1BQU0sb0JBQW9CO0lBQ3hCLGtCQUFrQixDQUFDLEtBQXdCLEVBQUUsaUJBQXNCO1FBQ2pFLDZGQUE2RjtRQUM3RixvRkFBb0Y7UUFDcEYsOEZBQThGO1FBQzlGLDhDQUE4QztRQUM5QyxFQUFFO1FBQ0YsOEZBQThGO1FBQzlGLHVGQUF1RjtRQUN2RixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FDcEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNkLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztTQUNGLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUE0QjtRQUNsQywyRUFBMkU7UUFDM0UsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDRjtBQUVELE1BQU0sZUFBZTtJQUNuQixrQkFBa0IsQ0FBQyxLQUFtQixFQUFFLGlCQUFrQztRQUN4RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN6QyxNQUFNLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8s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RyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLEtBQVUsRUFBRSxLQUFhO1FBQ2xELElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQixJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQzt5SEEvRlUsU0FBUzt1SEFBVCxTQUFTOztzR0FBVCxTQUFTO2tCQUxyQixJQUFJO21CQUFDO29CQUNKLElBQUksRUFBRSxPQUFPO29CQUNiLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBPbkRlc3Ryb3ksXG4gIFBpcGUsXG4gIFBpcGVUcmFuc2Zvcm0sXG4gIHVudHJhY2tlZCxcbiAgybVpc1Byb21pc2UsXG4gIMm1aXNTdWJzY3JpYmFibGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJzY3JpYmFibGUsIFVuc3Vic2NyaWJhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuaW50ZXJmYWNlIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKFxuICAgIGFzeW5jOiBTdWJzY3JpYmFibGU8YW55PiB8IFByb21pc2U8YW55PixcbiAgICB1cGRhdGVMYXRlc3RWYWx1ZTogYW55LFxuICApOiBVbnN1YnNjcmliYWJsZSB8IFByb21pc2U8YW55PjtcbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFVuc3Vic2NyaWJhYmxlIHwgUHJvbWlzZTxhbnk+KTogdm9pZDtcbn1cblxuY2xhc3MgU3Vic2NyaWJhYmxlU3RyYXRlZ3kgaW1wbGVtZW50cyBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogU3Vic2NyaWJhYmxlPGFueT4sIHVwZGF0ZUxhdGVzdFZhbHVlOiBhbnkpOiBVbnN1YnNjcmliYWJsZSB7XG4gICAgLy8gU3Vic2NyaXB0aW9uIGNhbiBiZSBzaWRlLWVmZmVjdGZ1bCwgYW5kIHdlIGRvbid0IHdhbnQgYW55IHNpZ25hbCByZWFkcyB3aGljaCBoYXBwZW4gaW4gdGhlXG4gICAgLy8gc2lkZSBlZmZlY3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiB0byBiZSB0cmFja2VkIGJ5IGEgY29tcG9uZW50J3MgdGVtcGxhdGUgd2hlbiB0aGF0XG4gICAgLy8gc3Vic2NyaXB0aW9uIGlzIHRyaWdnZXJlZCB2aWEgdGhlIGFzeW5jIHBpcGUuIFNvIHdlIHdyYXAgdGhlIHN1YnNjcmlwdGlvbiBpbiBgdW50cmFja2VkYCB0b1xuICAgIC8vIGRlY291cGxlIGZyb20gdGhlIGN1cnJlbnQgcmVhY3RpdmUgY29udGV4dC5cbiAgICAvL1xuICAgIC8vIGB1bnRyYWNrZWRgIGFsc28gcHJldmVudHMgc2lnbmFsIF93cml0ZXNfIHdoaWNoIGhhcHBlbiBpbiB0aGUgc3Vic2NyaXB0aW9uIHNpZGUgZWZmZWN0IGZyb21cbiAgICAvLyBiZWluZyB0cmVhdGVkIGFzIHNpZ25hbCB3cml0ZXMgZHVyaW5nIHRoZSB0ZW1wbGF0ZSBldmFsdWF0aW9uICh3aGljaCB0aHJvd3MgZXJyb3JzKS5cbiAgICByZXR1cm4gdW50cmFja2VkKCgpID0+XG4gICAgICBhc3luYy5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiB1cGRhdGVMYXRlc3RWYWx1ZSxcbiAgICAgICAgZXJyb3I6IChlOiBhbnkpID0+IHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBVbnN1YnNjcmliYWJsZSk6IHZvaWQge1xuICAgIC8vIFNlZSB0aGUgY29tbWVudCBpbiBgY3JlYXRlU3Vic2NyaXB0aW9uYCBhYm92ZSBvbiB0aGUgdXNlIG9mIGB1bnRyYWNrZWRgLlxuICAgIHVudHJhY2tlZCgoKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gIH1cbn1cblxuY2xhc3MgUHJvbWlzZVN0cmF0ZWd5IGltcGxlbWVudHMgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IFByb21pc2U8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6ICh2OiBhbnkpID0+IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGFzeW5jLnRoZW4odXBkYXRlTGF0ZXN0VmFsdWUsIChlKSA9PiB7XG4gICAgICB0aHJvdyBlO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFByb21pc2U8YW55Pik6IHZvaWQge31cbn1cblxuY29uc3QgX3Byb21pc2VTdHJhdGVneSA9IG5ldyBQcm9taXNlU3RyYXRlZ3koKTtcbmNvbnN0IF9zdWJzY3JpYmFibGVTdHJhdGVneSA9IG5ldyBTdWJzY3JpYmFibGVTdHJhdGVneSgpO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFVud3JhcHMgYSB2YWx1ZSBmcm9tIGFuIGFzeW5jaHJvbm91cyBwcmltaXRpdmUuXG4gKlxuICogVGhlIGBhc3luY2AgcGlwZSBzdWJzY3JpYmVzIHRvIGFuIGBPYnNlcnZhYmxlYCBvciBgUHJvbWlzZWAgYW5kIHJldHVybnMgdGhlIGxhdGVzdCB2YWx1ZSBpdCBoYXNcbiAqIGVtaXR0ZWQuIFdoZW4gYSBuZXcgdmFsdWUgaXMgZW1pdHRlZCwgdGhlIGBhc3luY2AgcGlwZSBtYXJrcyB0aGUgY29tcG9uZW50IHRvIGJlIGNoZWNrZWQgZm9yXG4gKiBjaGFuZ2VzLiBXaGVuIHRoZSBjb21wb25lbnQgZ2V0cyBkZXN0cm95ZWQsIHRoZSBgYXN5bmNgIHBpcGUgdW5zdWJzY3JpYmVzIGF1dG9tYXRpY2FsbHkgdG8gYXZvaWRcbiAqIHBvdGVudGlhbCBtZW1vcnkgbGVha3MuIFdoZW4gdGhlIHJlZmVyZW5jZSBvZiB0aGUgZXhwcmVzc2lvbiBjaGFuZ2VzLCB0aGUgYGFzeW5jYCBwaXBlXG4gKiBhdXRvbWF0aWNhbGx5IHVuc3Vic2NyaWJlcyBmcm9tIHRoZSBvbGQgYE9ic2VydmFibGVgIG9yIGBQcm9taXNlYCBhbmQgc3Vic2NyaWJlcyB0byB0aGUgbmV3IG9uZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIFRoaXMgZXhhbXBsZSBiaW5kcyBhIGBQcm9taXNlYCB0byB0aGUgdmlldy4gQ2xpY2tpbmcgdGhlIGBSZXNvbHZlYCBidXR0b24gcmVzb2x2ZXMgdGhlXG4gKiBwcm9taXNlLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvYXN5bmNfcGlwZS50cyByZWdpb249J0FzeW5jUGlwZVByb21pc2UnfVxuICpcbiAqIEl0J3MgYWxzbyBwb3NzaWJsZSB0byB1c2UgYGFzeW5jYCB3aXRoIE9ic2VydmFibGVzLiBUaGUgZXhhbXBsZSBiZWxvdyBiaW5kcyB0aGUgYHRpbWVgIE9ic2VydmFibGVcbiAqIHRvIHRoZSB2aWV3LiBUaGUgT2JzZXJ2YWJsZSBjb250aW51b3VzbHkgdXBkYXRlcyB0aGUgdmlldyB3aXRoIHRoZSBjdXJyZW50IHRpbWUuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9hc3luY19waXBlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlT2JzZXJ2YWJsZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7XG4gIG5hbWU6ICdhc3luYycsXG4gIHB1cmU6IGZhbHNlLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBBc3luY1BpcGUgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIFBpcGVUcmFuc2Zvcm0ge1xuICBwcml2YXRlIF9yZWY6IENoYW5nZURldGVjdG9yUmVmIHwgbnVsbDtcbiAgcHJpdmF0ZSBfbGF0ZXN0VmFsdWU6IGFueSA9IG51bGw7XG4gIHByaXZhdGUgbWFya0ZvckNoZWNrT25WYWx1ZVVwZGF0ZSA9IHRydWU7XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBVbnN1YnNjcmliYWJsZSB8IFByb21pc2U8YW55PiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9vYmo6IFN1YnNjcmliYWJsZTxhbnk+IHwgUHJvbWlzZTxhbnk+IHwgRXZlbnRFbWl0dGVyPGFueT4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IFN1YnNjcmlwdGlvblN0cmF0ZWd5IHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgIC8vIEFzc2lnbiBgcmVmYCBpbnRvIGB0aGlzLl9yZWZgIG1hbnVhbGx5IGluc3RlYWQgb2YgZGVjbGFyaW5nIGBfcmVmYCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAvLyBwYXJhbWV0ZXIgbGlzdCwgYXMgdGhlIHR5cGUgb2YgYHRoaXMuX3JlZmAgaW5jbHVkZXMgYG51bGxgIHVubGlrZSB0aGUgdHlwZSBvZiBgcmVmYC5cbiAgICB0aGlzLl9yZWYgPSByZWY7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgfVxuICAgIC8vIENsZWFyIHRoZSBgQ2hhbmdlRGV0ZWN0b3JSZWZgIGFuZCBpdHMgYXNzb2NpYXRpb24gd2l0aCB0aGUgdmlldyBkYXRhLCB0byBtaXRpZ2F0ZVxuICAgIC8vIHBvdGVudGlhbCBtZW1vcnkgbGVha3MgaW4gT2JzZXJ2YWJsZXMgdGhhdCBjb3VsZCBvdGhlcndpc2UgY2F1c2UgdGhlIHZpZXcgZGF0YSB0b1xuICAgIC8vIGJlIHJldGFpbmVkLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE3NjI0XG4gICAgdGhpcy5fcmVmID0gbnVsbDtcbiAgfVxuXG4gIC8vIE5PVEUoQGJlbmxlc2gpOiBCZWNhdXNlIE9ic2VydmFibGUgaGFzIGRlcHJlY2F0ZWQgYSBmZXcgY2FsbCBwYXR0ZXJucyBmb3IgYHN1YnNjcmliZWAsXG4gIC8vIFR5cGVTY3JpcHQgaGFzIGEgaGFyZCB0aW1lIG1hdGNoaW5nIE9ic2VydmFibGUgdG8gU3Vic2NyaWJhYmxlLCBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzY0M1xuXG4gIHRyYW5zZm9ybTxUPihvYmo6IE9ic2VydmFibGU8VD4gfCBTdWJzY3JpYmFibGU8VD4gfCBQcm9taXNlPFQ+KTogVCB8IG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IG51bGwgfCB1bmRlZmluZWQpOiBudWxsO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBPYnNlcnZhYmxlPFQ+IHwgU3Vic2NyaWJhYmxlPFQ+IHwgUHJvbWlzZTxUPiB8IG51bGwgfCB1bmRlZmluZWQpOiBUIHwgbnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogT2JzZXJ2YWJsZTxUPiB8IFN1YnNjcmliYWJsZTxUPiB8IFByb21pc2U8VD4gfCBudWxsIHwgdW5kZWZpbmVkKTogVCB8IG51bGwge1xuICAgIGlmICghdGhpcy5fb2JqKSB7XG4gICAgICBpZiAob2JqKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gT25seSBjYWxsIGBtYXJrRm9yQ2hlY2tgIGlmIHRoZSB2YWx1ZSBpcyB1cGRhdGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICAgIC8vIFN5bmNocm9ub3VzIHVwZGF0ZXMgX2R1cmluZ18gc3Vic2NyaXB0aW9uIHNob3VsZCBub3Qgd2FzdGVmdWxseSBtYXJrIGZvciBjaGVjayAtXG4gICAgICAgICAgLy8gdGhpcyB2YWx1ZSBpcyBhbHJlYWR5IGdvaW5nIHRvIGJlIHJldHVybmVkIGZyb20gdGhlIHRyYW5zZm9ybSBmdW5jdGlvbi5cbiAgICAgICAgICB0aGlzLm1hcmtGb3JDaGVja09uVmFsdWVVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLl9zdWJzY3JpYmUob2JqKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0aGlzLm1hcmtGb3JDaGVja09uVmFsdWVVcGRhdGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG9iaiAhPT0gdGhpcy5fb2JqKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0ob2JqKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmUob2JqOiBTdWJzY3JpYmFibGU8YW55PiB8IFByb21pc2U8YW55PiB8IEV2ZW50RW1pdHRlcjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fb2JqID0gb2JqO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gdGhpcy5fc2VsZWN0U3RyYXRlZ3kob2JqKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSB0aGlzLl9zdHJhdGVneS5jcmVhdGVTdWJzY3JpcHRpb24ob2JqLCAodmFsdWU6IE9iamVjdCkgPT5cbiAgICAgIHRoaXMuX3VwZGF0ZUxhdGVzdFZhbHVlKG9iaiwgdmFsdWUpLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3RTdHJhdGVneShcbiAgICBvYmo6IFN1YnNjcmliYWJsZTxhbnk+IHwgUHJvbWlzZTxhbnk+IHwgRXZlbnRFbWl0dGVyPGFueT4sXG4gICk6IFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgICBpZiAoybVpc1Byb21pc2Uob2JqKSkge1xuICAgICAgcmV0dXJuIF9wcm9taXNlU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgaWYgKMm1aXNTdWJzY3JpYmFibGUob2JqKSkge1xuICAgICAgcmV0dXJuIF9zdWJzY3JpYmFibGVTdHJhdGVneTtcbiAgICB9XG5cbiAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoQXN5bmNQaXBlLCBvYmopO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBOb3RlOiBgZGlzcG9zZWAgaXMgb25seSBjYWxsZWQgaWYgYSBzdWJzY3JpcHRpb24gaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYmVmb3JlLCBpbmRpY2F0aW5nXG4gICAgLy8gdGhhdCBgdGhpcy5fc3RyYXRlZ3lgIGlzIGFsc28gYXZhaWxhYmxlLlxuICAgIHRoaXMuX3N0cmF0ZWd5IS5kaXNwb3NlKHRoaXMuX3N1YnNjcmlwdGlvbiEpO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICBpZiAodGhpcy5tYXJrRm9yQ2hlY2tPblZhbHVlVXBkYXRlKSB7XG4gICAgICAgIHRoaXMuX3JlZj8ubWFya0ZvckNoZWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=