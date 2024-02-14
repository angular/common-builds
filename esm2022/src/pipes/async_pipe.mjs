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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.1+sha-44a0ea4", ngImport: i0, type: AsyncPipe, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.2.1+sha-44a0ea4", ngImport: i0, type: AsyncPipe, isStandalone: true, name: "async", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.1+sha-44a0ea4", ngImport: i0, type: AsyncPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'async',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsaUJBQWlCLEVBR2pCLElBQUksRUFFSixTQUFTLEVBQ1QsVUFBVSxFQUNWLGVBQWUsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBVXZFLE1BQU0sb0JBQW9CO0lBQ3hCLGtCQUFrQixDQUFDLEtBQXdCLEVBQUUsaUJBQXNCO1FBQ2pFLDZGQUE2RjtRQUM3RixvRkFBb0Y7UUFDcEYsOEZBQThGO1FBQzlGLDhDQUE4QztRQUM5QyxFQUFFO1FBQ0YsOEZBQThGO1FBQzlGLHVGQUF1RjtRQUN2RixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FDcEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNkLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztTQUNGLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUE0QjtRQUNsQywyRUFBMkU7UUFDM0UsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDRjtBQUVELE1BQU0sZUFBZTtJQUNuQixrQkFBa0IsQ0FBQyxLQUFtQixFQUFFLGlCQUFrQztRQUN4RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN6QyxNQUFNLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8s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RSxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO3lIQXRGVSxTQUFTO3VIQUFULFNBQVM7O3NHQUFULFNBQVM7a0JBTHJCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLE9BQU87b0JBQ2IsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uRGVzdHJveSxcbiAgUGlwZSxcbiAgUGlwZVRyYW5zZm9ybSxcbiAgdW50cmFja2VkLFxuICDJtWlzUHJvbWlzZSxcbiAgybVpc1N1YnNjcmliYWJsZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmliYWJsZSwgVW5zdWJzY3JpYmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG5pbnRlcmZhY2UgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oXG4gICAgYXN5bmM6IFN1YnNjcmliYWJsZTxhbnk+IHwgUHJvbWlzZTxhbnk+LFxuICAgIHVwZGF0ZUxhdGVzdFZhbHVlOiBhbnksXG4gICk6IFVuc3Vic2NyaWJhYmxlIHwgUHJvbWlzZTxhbnk+O1xuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogVW5zdWJzY3JpYmFibGUgfCBQcm9taXNlPGFueT4pOiB2b2lkO1xufVxuXG5jbGFzcyBTdWJzY3JpYmFibGVTdHJhdGVneSBpbXBsZW1lbnRzIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBTdWJzY3JpYmFibGU8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSk6IFVuc3Vic2NyaWJhYmxlIHtcbiAgICAvLyBTdWJzY3JpcHRpb24gY2FuIGJlIHNpZGUtZWZmZWN0ZnVsLCBhbmQgd2UgZG9uJ3Qgd2FudCBhbnkgc2lnbmFsIHJlYWRzIHdoaWNoIGhhcHBlbiBpbiB0aGVcbiAgICAvLyBzaWRlIGVmZmVjdCBvZiB0aGUgc3Vic2NyaXB0aW9uIHRvIGJlIHRyYWNrZWQgYnkgYSBjb21wb25lbnQncyB0ZW1wbGF0ZSB3aGVuIHRoYXRcbiAgICAvLyBzdWJzY3JpcHRpb24gaXMgdHJpZ2dlcmVkIHZpYSB0aGUgYXN5bmMgcGlwZS4gU28gd2Ugd3JhcCB0aGUgc3Vic2NyaXB0aW9uIGluIGB1bnRyYWNrZWRgIHRvXG4gICAgLy8gZGVjb3VwbGUgZnJvbSB0aGUgY3VycmVudCByZWFjdGl2ZSBjb250ZXh0LlxuICAgIC8vXG4gICAgLy8gYHVudHJhY2tlZGAgYWxzbyBwcmV2ZW50cyBzaWduYWwgX3dyaXRlc18gd2hpY2ggaGFwcGVuIGluIHRoZSBzdWJzY3JpcHRpb24gc2lkZSBlZmZlY3QgZnJvbVxuICAgIC8vIGJlaW5nIHRyZWF0ZWQgYXMgc2lnbmFsIHdyaXRlcyBkdXJpbmcgdGhlIHRlbXBsYXRlIGV2YWx1YXRpb24gKHdoaWNoIHRocm93cyBlcnJvcnMpLlxuICAgIHJldHVybiB1bnRyYWNrZWQoKCkgPT5cbiAgICAgIGFzeW5jLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IHVwZGF0ZUxhdGVzdFZhbHVlLFxuICAgICAgICBlcnJvcjogKGU6IGFueSkgPT4ge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFVuc3Vic2NyaWJhYmxlKTogdm9pZCB7XG4gICAgLy8gU2VlIHRoZSBjb21tZW50IGluIGBjcmVhdGVTdWJzY3JpcHRpb25gIGFib3ZlIG9uIHRoZSB1c2Ugb2YgYHVudHJhY2tlZGAuXG4gICAgdW50cmFja2VkKCgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgfVxufVxuXG5jbGFzcyBQcm9taXNlU3RyYXRlZ3kgaW1wbGVtZW50cyBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogUHJvbWlzZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogKHY6IGFueSkgPT4gYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXN5bmMudGhlbih1cGRhdGVMYXRlc3RWYWx1ZSwgKGUpID0+IHtcbiAgICAgIHRocm93IGU7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogUHJvbWlzZTxhbnk+KTogdm9pZCB7fVxufVxuXG5jb25zdCBfcHJvbWlzZVN0cmF0ZWd5ID0gbmV3IFByb21pc2VTdHJhdGVneSgpO1xuY29uc3QgX3N1YnNjcmliYWJsZVN0cmF0ZWd5ID0gbmV3IFN1YnNjcmliYWJsZVN0cmF0ZWd5KCk7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVW53cmFwcyBhIHZhbHVlIGZyb20gYW4gYXN5bmNocm9ub3VzIHByaW1pdGl2ZS5cbiAqXG4gKiBUaGUgYGFzeW5jYCBwaXBlIHN1YnNjcmliZXMgdG8gYW4gYE9ic2VydmFibGVgIG9yIGBQcm9taXNlYCBhbmQgcmV0dXJucyB0aGUgbGF0ZXN0IHZhbHVlIGl0IGhhc1xuICogZW1pdHRlZC4gV2hlbiBhIG5ldyB2YWx1ZSBpcyBlbWl0dGVkLCB0aGUgYGFzeW5jYCBwaXBlIG1hcmtzIHRoZSBjb21wb25lbnQgdG8gYmUgY2hlY2tlZCBmb3JcbiAqIGNoYW5nZXMuIFdoZW4gdGhlIGNvbXBvbmVudCBnZXRzIGRlc3Ryb3llZCwgdGhlIGBhc3luY2AgcGlwZSB1bnN1YnNjcmliZXMgYXV0b21hdGljYWxseSB0byBhdm9pZFxuICogcG90ZW50aWFsIG1lbW9yeSBsZWFrcy4gV2hlbiB0aGUgcmVmZXJlbmNlIG9mIHRoZSBleHByZXNzaW9uIGNoYW5nZXMsIHRoZSBgYXN5bmNgIHBpcGVcbiAqIGF1dG9tYXRpY2FsbHkgdW5zdWJzY3JpYmVzIGZyb20gdGhlIG9sZCBgT2JzZXJ2YWJsZWAgb3IgYFByb21pc2VgIGFuZCBzdWJzY3JpYmVzIHRvIHRoZSBuZXcgb25lLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogVGhpcyBleGFtcGxlIGJpbmRzIGEgYFByb21pc2VgIHRvIHRoZSB2aWV3LiBDbGlja2luZyB0aGUgYFJlc29sdmVgIGJ1dHRvbiByZXNvbHZlcyB0aGVcbiAqIHByb21pc2UuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9hc3luY19waXBlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlUHJvbWlzZSd9XG4gKlxuICogSXQncyBhbHNvIHBvc3NpYmxlIHRvIHVzZSBgYXN5bmNgIHdpdGggT2JzZXJ2YWJsZXMuIFRoZSBleGFtcGxlIGJlbG93IGJpbmRzIHRoZSBgdGltZWAgT2JzZXJ2YWJsZVxuICogdG8gdGhlIHZpZXcuIFRoZSBPYnNlcnZhYmxlIGNvbnRpbnVvdXNseSB1cGRhdGVzIHRoZSB2aWV3IHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2FzeW5jX3BpcGUudHMgcmVnaW9uPSdBc3luY1BpcGVPYnNlcnZhYmxlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ2FzeW5jJyxcbiAgcHVyZTogZmFsc2UsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIEFzeW5jUGlwZSBpbXBsZW1lbnRzIE9uRGVzdHJveSwgUGlwZVRyYW5zZm9ybSB7XG4gIHByaXZhdGUgX3JlZjogQ2hhbmdlRGV0ZWN0b3JSZWYgfCBudWxsO1xuICBwcml2YXRlIF9sYXRlc3RWYWx1ZTogYW55ID0gbnVsbDtcblxuICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFVuc3Vic2NyaWJhYmxlIHwgUHJvbWlzZTxhbnk+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX29iajogU3Vic2NyaWJhYmxlPGFueT4gfCBQcm9taXNlPGFueT4gfCBFdmVudEVtaXR0ZXI8YW55PiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9zdHJhdGVneTogU3Vic2NyaXB0aW9uU3RyYXRlZ3kgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihyZWY6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgLy8gQXNzaWduIGByZWZgIGludG8gYHRoaXMuX3JlZmAgbWFudWFsbHkgaW5zdGVhZCBvZiBkZWNsYXJpbmcgYF9yZWZgIGluIHRoZSBjb25zdHJ1Y3RvclxuICAgIC8vIHBhcmFtZXRlciBsaXN0LCBhcyB0aGUgdHlwZSBvZiBgdGhpcy5fcmVmYCBpbmNsdWRlcyBgbnVsbGAgdW5saWtlIHRoZSB0eXBlIG9mIGByZWZgLlxuICAgIHRoaXMuX3JlZiA9IHJlZjtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICB9XG4gICAgLy8gQ2xlYXIgdGhlIGBDaGFuZ2VEZXRlY3RvclJlZmAgYW5kIGl0cyBhc3NvY2lhdGlvbiB3aXRoIHRoZSB2aWV3IGRhdGEsIHRvIG1pdGlnYXRlXG4gICAgLy8gcG90ZW50aWFsIG1lbW9yeSBsZWFrcyBpbiBPYnNlcnZhYmxlcyB0aGF0IGNvdWxkIG90aGVyd2lzZSBjYXVzZSB0aGUgdmlldyBkYXRhIHRvXG4gICAgLy8gYmUgcmV0YWluZWQuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTc2MjRcbiAgICB0aGlzLl9yZWYgPSBudWxsO1xuICB9XG5cbiAgLy8gTk9URShAYmVubGVzaCk6IEJlY2F1c2UgT2JzZXJ2YWJsZSBoYXMgZGVwcmVjYXRlZCBhIGZldyBjYWxsIHBhdHRlcm5zIGZvciBgc3Vic2NyaWJlYCxcbiAgLy8gVHlwZVNjcmlwdCBoYXMgYSBoYXJkIHRpbWUgbWF0Y2hpbmcgT2JzZXJ2YWJsZSB0byBTdWJzY3JpYmFibGUsIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQzNjQzXG5cbiAgdHJhbnNmb3JtPFQ+KG9iajogT2JzZXJ2YWJsZTxUPiB8IFN1YnNjcmliYWJsZTxUPiB8IFByb21pc2U8VD4pOiBUIHwgbnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogbnVsbCB8IHVuZGVmaW5lZCk6IG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IE9ic2VydmFibGU8VD4gfCBTdWJzY3JpYmFibGU8VD4gfCBQcm9taXNlPFQ+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IFQgfCBudWxsO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBPYnNlcnZhYmxlPFQ+IHwgU3Vic2NyaWJhYmxlPFQ+IHwgUHJvbWlzZTxUPiB8IG51bGwgfCB1bmRlZmluZWQpOiBUIHwgbnVsbCB7XG4gICAgaWYgKCF0aGlzLl9vYmopIHtcbiAgICAgIGlmIChvYmopIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlKG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG9iaiAhPT0gdGhpcy5fb2JqKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0ob2JqKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmUob2JqOiBTdWJzY3JpYmFibGU8YW55PiB8IFByb21pc2U8YW55PiB8IEV2ZW50RW1pdHRlcjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fb2JqID0gb2JqO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gdGhpcy5fc2VsZWN0U3RyYXRlZ3kob2JqKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSB0aGlzLl9zdHJhdGVneS5jcmVhdGVTdWJzY3JpcHRpb24ob2JqLCAodmFsdWU6IE9iamVjdCkgPT5cbiAgICAgIHRoaXMuX3VwZGF0ZUxhdGVzdFZhbHVlKG9iaiwgdmFsdWUpLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3RTdHJhdGVneShcbiAgICBvYmo6IFN1YnNjcmliYWJsZTxhbnk+IHwgUHJvbWlzZTxhbnk+IHwgRXZlbnRFbWl0dGVyPGFueT4sXG4gICk6IFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgICBpZiAoybVpc1Byb21pc2Uob2JqKSkge1xuICAgICAgcmV0dXJuIF9wcm9taXNlU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgaWYgKMm1aXNTdWJzY3JpYmFibGUob2JqKSkge1xuICAgICAgcmV0dXJuIF9zdWJzY3JpYmFibGVTdHJhdGVneTtcbiAgICB9XG5cbiAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoQXN5bmNQaXBlLCBvYmopO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBOb3RlOiBgZGlzcG9zZWAgaXMgb25seSBjYWxsZWQgaWYgYSBzdWJzY3JpcHRpb24gaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYmVmb3JlLCBpbmRpY2F0aW5nXG4gICAgLy8gdGhhdCBgdGhpcy5fc3RyYXRlZ3lgIGlzIGFsc28gYXZhaWxhYmxlLlxuICAgIHRoaXMuX3N0cmF0ZWd5IS5kaXNwb3NlKHRoaXMuX3N1YnNjcmlwdGlvbiEpO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICAvLyBOb3RlOiBgdGhpcy5fcmVmYCBpcyBvbmx5IGNsZWFyZWQgaW4gYG5nT25EZXN0cm95YCBzbyBpcyBrbm93biB0byBiZSBhdmFpbGFibGUgd2hlbiBhXG4gICAgICAvLyB2YWx1ZSBpcyBiZWluZyB1cGRhdGVkLlxuICAgICAgdGhpcy5fcmVmIS5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==