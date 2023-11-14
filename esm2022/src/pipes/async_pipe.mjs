/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, Pipe, untracked, ɵisPromise, ɵisSubscribable } from '@angular/core';
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
            }
        }));
    }
    dispose(subscription) {
        // See the comment in `createSubscription` above on the use of `untracked`.
        untracked(() => subscription.unsubscribe());
    }
}
class PromiseStrategy {
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue, e => {
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
                this._subscribe(obj);
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
            // Note: `this._ref` is only cleared in `ngOnDestroy` so is known to be available when a
            // value is being updated.
            this._ref.markForCheck();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-7f9ab9d", ngImport: i0, type: AsyncPipe, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.1.0-next.0+sha-7f9ab9d", ngImport: i0, type: AsyncPipe, isStandalone: true, name: "async", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-7f9ab9d", ngImport: i0, type: AsyncPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'async',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsaUJBQWlCLEVBQTJCLElBQUksRUFBaUIsU0FBUyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHdEksT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBUXZFLE1BQU0sb0JBQW9CO0lBQ3hCLGtCQUFrQixDQUFDLEtBQXdCLEVBQUUsaUJBQXNCO1FBQ2pFLDZGQUE2RjtRQUM3RixvRkFBb0Y7UUFDcEYsOEZBQThGO1FBQzlGLDhDQUE4QztRQUM5QyxFQUFFO1FBQ0YsOEZBQThGO1FBQzlGLHVGQUF1RjtRQUN2RixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ3JDLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztTQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUE0QjtRQUNsQywyRUFBMkU7UUFDM0UsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDRjtBQUVELE1BQU0sZUFBZTtJQUNuQixrQkFBa0IsQ0FBQyxLQUFtQixFQUFFLGlCQUFrQztRQUN4RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdkMsTUFBTSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLENBQUMs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O1FBQzVCLENBQUM7SUFDSCxDQUFDO3lIQXBGVSxTQUFTO3VIQUFULFNBQVM7O3NHQUFULFNBQVM7a0JBTHJCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLE9BQU87b0JBQ2IsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWYsIEV2ZW50RW1pdHRlciwgT25EZXN0cm95LCBQaXBlLCBQaXBlVHJhbnNmb3JtLCB1bnRyYWNrZWQsIMm1aXNQcm9taXNlLCDJtWlzU3Vic2NyaWJhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3Vic2NyaWJhYmxlLCBVbnN1YnNjcmliYWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmludGVyZmFjZSBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogU3Vic2NyaWJhYmxlPGFueT58UHJvbWlzZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogYW55KTogVW5zdWJzY3JpYmFibGVcbiAgICAgIHxQcm9taXNlPGFueT47XG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBVbnN1YnNjcmliYWJsZXxQcm9taXNlPGFueT4pOiB2b2lkO1xufVxuXG5jbGFzcyBTdWJzY3JpYmFibGVTdHJhdGVneSBpbXBsZW1lbnRzIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBTdWJzY3JpYmFibGU8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSk6IFVuc3Vic2NyaWJhYmxlIHtcbiAgICAvLyBTdWJzY3JpcHRpb24gY2FuIGJlIHNpZGUtZWZmZWN0ZnVsLCBhbmQgd2UgZG9uJ3Qgd2FudCBhbnkgc2lnbmFsIHJlYWRzIHdoaWNoIGhhcHBlbiBpbiB0aGVcbiAgICAvLyBzaWRlIGVmZmVjdCBvZiB0aGUgc3Vic2NyaXB0aW9uIHRvIGJlIHRyYWNrZWQgYnkgYSBjb21wb25lbnQncyB0ZW1wbGF0ZSB3aGVuIHRoYXRcbiAgICAvLyBzdWJzY3JpcHRpb24gaXMgdHJpZ2dlcmVkIHZpYSB0aGUgYXN5bmMgcGlwZS4gU28gd2Ugd3JhcCB0aGUgc3Vic2NyaXB0aW9uIGluIGB1bnRyYWNrZWRgIHRvXG4gICAgLy8gZGVjb3VwbGUgZnJvbSB0aGUgY3VycmVudCByZWFjdGl2ZSBjb250ZXh0LlxuICAgIC8vXG4gICAgLy8gYHVudHJhY2tlZGAgYWxzbyBwcmV2ZW50cyBzaWduYWwgX3dyaXRlc18gd2hpY2ggaGFwcGVuIGluIHRoZSBzdWJzY3JpcHRpb24gc2lkZSBlZmZlY3QgZnJvbVxuICAgIC8vIGJlaW5nIHRyZWF0ZWQgYXMgc2lnbmFsIHdyaXRlcyBkdXJpbmcgdGhlIHRlbXBsYXRlIGV2YWx1YXRpb24gKHdoaWNoIHRocm93cyBlcnJvcnMpLlxuICAgIHJldHVybiB1bnRyYWNrZWQoKCkgPT4gYXN5bmMuc3Vic2NyaWJlKHtcbiAgICAgIG5leHQ6IHVwZGF0ZUxhdGVzdFZhbHVlLFxuICAgICAgZXJyb3I6IChlOiBhbnkpID0+IHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogVW5zdWJzY3JpYmFibGUpOiB2b2lkIHtcbiAgICAvLyBTZWUgdGhlIGNvbW1lbnQgaW4gYGNyZWF0ZVN1YnNjcmlwdGlvbmAgYWJvdmUgb24gdGhlIHVzZSBvZiBgdW50cmFja2VkYC5cbiAgICB1bnRyYWNrZWQoKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICB9XG59XG5cbmNsYXNzIFByb21pc2VTdHJhdGVneSBpbXBsZW1lbnRzIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBQcm9taXNlPGFueT4sIHVwZGF0ZUxhdGVzdFZhbHVlOiAodjogYW55KSA9PiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhc3luYy50aGVuKHVwZGF0ZUxhdGVzdFZhbHVlLCBlID0+IHtcbiAgICAgIHRocm93IGU7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogUHJvbWlzZTxhbnk+KTogdm9pZCB7fVxufVxuXG5jb25zdCBfcHJvbWlzZVN0cmF0ZWd5ID0gbmV3IFByb21pc2VTdHJhdGVneSgpO1xuY29uc3QgX3N1YnNjcmliYWJsZVN0cmF0ZWd5ID0gbmV3IFN1YnNjcmliYWJsZVN0cmF0ZWd5KCk7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVW53cmFwcyBhIHZhbHVlIGZyb20gYW4gYXN5bmNocm9ub3VzIHByaW1pdGl2ZS5cbiAqXG4gKiBUaGUgYGFzeW5jYCBwaXBlIHN1YnNjcmliZXMgdG8gYW4gYE9ic2VydmFibGVgIG9yIGBQcm9taXNlYCBhbmQgcmV0dXJucyB0aGUgbGF0ZXN0IHZhbHVlIGl0IGhhc1xuICogZW1pdHRlZC4gV2hlbiBhIG5ldyB2YWx1ZSBpcyBlbWl0dGVkLCB0aGUgYGFzeW5jYCBwaXBlIG1hcmtzIHRoZSBjb21wb25lbnQgdG8gYmUgY2hlY2tlZCBmb3JcbiAqIGNoYW5nZXMuIFdoZW4gdGhlIGNvbXBvbmVudCBnZXRzIGRlc3Ryb3llZCwgdGhlIGBhc3luY2AgcGlwZSB1bnN1YnNjcmliZXMgYXV0b21hdGljYWxseSB0byBhdm9pZFxuICogcG90ZW50aWFsIG1lbW9yeSBsZWFrcy4gV2hlbiB0aGUgcmVmZXJlbmNlIG9mIHRoZSBleHByZXNzaW9uIGNoYW5nZXMsIHRoZSBgYXN5bmNgIHBpcGVcbiAqIGF1dG9tYXRpY2FsbHkgdW5zdWJzY3JpYmVzIGZyb20gdGhlIG9sZCBgT2JzZXJ2YWJsZWAgb3IgYFByb21pc2VgIGFuZCBzdWJzY3JpYmVzIHRvIHRoZSBuZXcgb25lLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogVGhpcyBleGFtcGxlIGJpbmRzIGEgYFByb21pc2VgIHRvIHRoZSB2aWV3LiBDbGlja2luZyB0aGUgYFJlc29sdmVgIGJ1dHRvbiByZXNvbHZlcyB0aGVcbiAqIHByb21pc2UuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9hc3luY19waXBlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlUHJvbWlzZSd9XG4gKlxuICogSXQncyBhbHNvIHBvc3NpYmxlIHRvIHVzZSBgYXN5bmNgIHdpdGggT2JzZXJ2YWJsZXMuIFRoZSBleGFtcGxlIGJlbG93IGJpbmRzIHRoZSBgdGltZWAgT2JzZXJ2YWJsZVxuICogdG8gdGhlIHZpZXcuIFRoZSBPYnNlcnZhYmxlIGNvbnRpbnVvdXNseSB1cGRhdGVzIHRoZSB2aWV3IHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2FzeW5jX3BpcGUudHMgcmVnaW9uPSdBc3luY1BpcGVPYnNlcnZhYmxlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ2FzeW5jJyxcbiAgcHVyZTogZmFsc2UsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIEFzeW5jUGlwZSBpbXBsZW1lbnRzIE9uRGVzdHJveSwgUGlwZVRyYW5zZm9ybSB7XG4gIHByaXZhdGUgX3JlZjogQ2hhbmdlRGV0ZWN0b3JSZWZ8bnVsbDtcbiAgcHJpdmF0ZSBfbGF0ZXN0VmFsdWU6IGFueSA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBVbnN1YnNjcmliYWJsZXxQcm9taXNlPGFueT58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX29iajogU3Vic2NyaWJhYmxlPGFueT58UHJvbWlzZTxhbnk+fEV2ZW50RW1pdHRlcjxhbnk+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9zdHJhdGVneTogU3Vic2NyaXB0aW9uU3RyYXRlZ3l8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgIC8vIEFzc2lnbiBgcmVmYCBpbnRvIGB0aGlzLl9yZWZgIG1hbnVhbGx5IGluc3RlYWQgb2YgZGVjbGFyaW5nIGBfcmVmYCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAvLyBwYXJhbWV0ZXIgbGlzdCwgYXMgdGhlIHR5cGUgb2YgYHRoaXMuX3JlZmAgaW5jbHVkZXMgYG51bGxgIHVubGlrZSB0aGUgdHlwZSBvZiBgcmVmYC5cbiAgICB0aGlzLl9yZWYgPSByZWY7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgfVxuICAgIC8vIENsZWFyIHRoZSBgQ2hhbmdlRGV0ZWN0b3JSZWZgIGFuZCBpdHMgYXNzb2NpYXRpb24gd2l0aCB0aGUgdmlldyBkYXRhLCB0byBtaXRpZ2F0ZVxuICAgIC8vIHBvdGVudGlhbCBtZW1vcnkgbGVha3MgaW4gT2JzZXJ2YWJsZXMgdGhhdCBjb3VsZCBvdGhlcndpc2UgY2F1c2UgdGhlIHZpZXcgZGF0YSB0b1xuICAgIC8vIGJlIHJldGFpbmVkLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE3NjI0XG4gICAgdGhpcy5fcmVmID0gbnVsbDtcbiAgfVxuXG4gIC8vIE5PVEUoQGJlbmxlc2gpOiBCZWNhdXNlIE9ic2VydmFibGUgaGFzIGRlcHJlY2F0ZWQgYSBmZXcgY2FsbCBwYXR0ZXJucyBmb3IgYHN1YnNjcmliZWAsXG4gIC8vIFR5cGVTY3JpcHQgaGFzIGEgaGFyZCB0aW1lIG1hdGNoaW5nIE9ic2VydmFibGUgdG8gU3Vic2NyaWJhYmxlLCBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MzY0M1xuXG4gIHRyYW5zZm9ybTxUPihvYmo6IE9ic2VydmFibGU8VD58U3Vic2NyaWJhYmxlPFQ+fFByb21pc2U8VD4pOiBUfG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IG51bGx8dW5kZWZpbmVkKTogbnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogT2JzZXJ2YWJsZTxUPnxTdWJzY3JpYmFibGU8VD58UHJvbWlzZTxUPnxudWxsfHVuZGVmaW5lZCk6IFR8bnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogT2JzZXJ2YWJsZTxUPnxTdWJzY3JpYmFibGU8VD58UHJvbWlzZTxUPnxudWxsfHVuZGVmaW5lZCk6IFR8bnVsbCB7XG4gICAgaWYgKCF0aGlzLl9vYmopIHtcbiAgICAgIGlmIChvYmopIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlKG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG9iaiAhPT0gdGhpcy5fb2JqKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0ob2JqKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmUob2JqOiBTdWJzY3JpYmFibGU8YW55PnxQcm9taXNlPGFueT58RXZlbnRFbWl0dGVyPGFueT4pOiB2b2lkIHtcbiAgICB0aGlzLl9vYmogPSBvYmo7XG4gICAgdGhpcy5fc3RyYXRlZ3kgPSB0aGlzLl9zZWxlY3RTdHJhdGVneShvYmopO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHRoaXMuX3N0cmF0ZWd5LmNyZWF0ZVN1YnNjcmlwdGlvbihcbiAgICAgICAgb2JqLCAodmFsdWU6IE9iamVjdCkgPT4gdGhpcy5fdXBkYXRlTGF0ZXN0VmFsdWUob2JqLCB2YWx1ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2VsZWN0U3RyYXRlZ3kob2JqOiBTdWJzY3JpYmFibGU8YW55PnxQcm9taXNlPGFueT58XG4gICAgICAgICAgICAgICAgICAgICAgICAgIEV2ZW50RW1pdHRlcjxhbnk+KTogU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICAgIGlmICjJtWlzUHJvbWlzZShvYmopKSB7XG4gICAgICByZXR1cm4gX3Byb21pc2VTdHJhdGVneTtcbiAgICB9XG5cbiAgICBpZiAoybVpc1N1YnNjcmliYWJsZShvYmopKSB7XG4gICAgICByZXR1cm4gX3N1YnNjcmliYWJsZVN0cmF0ZWd5O1xuICAgIH1cblxuICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihBc3luY1BpcGUsIG9iaik7XG4gIH1cblxuICBwcml2YXRlIF9kaXNwb3NlKCk6IHZvaWQge1xuICAgIC8vIE5vdGU6IGBkaXNwb3NlYCBpcyBvbmx5IGNhbGxlZCBpZiBhIHN1YnNjcmlwdGlvbiBoYXMgYmVlbiBpbml0aWFsaXplZCBiZWZvcmUsIGluZGljYXRpbmdcbiAgICAvLyB0aGF0IGB0aGlzLl9zdHJhdGVneWAgaXMgYWxzbyBhdmFpbGFibGUuXG4gICAgdGhpcy5fc3RyYXRlZ3khLmRpc3Bvc2UodGhpcy5fc3Vic2NyaXB0aW9uISk7XG4gICAgdGhpcy5fbGF0ZXN0VmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fb2JqID0gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUxhdGVzdFZhbHVlKGFzeW5jOiBhbnksIHZhbHVlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoYXN5bmMgPT09IHRoaXMuX29iaikge1xuICAgICAgdGhpcy5fbGF0ZXN0VmFsdWUgPSB2YWx1ZTtcbiAgICAgIC8vIE5vdGU6IGB0aGlzLl9yZWZgIGlzIG9ubHkgY2xlYXJlZCBpbiBgbmdPbkRlc3Ryb3lgIHNvIGlzIGtub3duIHRvIGJlIGF2YWlsYWJsZSB3aGVuIGFcbiAgICAgIC8vIHZhbHVlIGlzIGJlaW5nIHVwZGF0ZWQuXG4gICAgICB0aGlzLl9yZWYhLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxufVxuIl19