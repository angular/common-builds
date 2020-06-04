/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, Pipe, ɵisObservable, ɵisPromise } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
class ObservableStrategy {
    createSubscription(async, updateLatestValue) {
        return async.subscribe({
            next: updateLatestValue,
            error: (e) => {
                throw e;
            }
        });
    }
    dispose(subscription) {
        subscription.unsubscribe();
    }
    onDestroy(subscription) {
        subscription.unsubscribe();
    }
}
class PromiseStrategy {
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue, e => {
            throw e;
        });
    }
    dispose(subscription) { }
    onDestroy(subscription) { }
}
const _promiseStrategy = new PromiseStrategy();
const _observableStrategy = new ObservableStrategy();
/**
 * @ngModule CommonModule
 * @description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks.
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
let AsyncPipe = /** @class */ (() => {
    class AsyncPipe {
        constructor(_ref) {
            this._ref = _ref;
            this._latestValue = null;
            this._subscription = null;
            this._obj = null;
            this._strategy = null;
        }
        ngOnDestroy() {
            if (this._subscription) {
                this._dispose();
            }
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
            if (ɵisObservable(obj)) {
                return _observableStrategy;
            }
            throw invalidPipeArgumentError(AsyncPipe, obj);
        }
        _dispose() {
            this._strategy.dispose(this._subscription);
            this._latestValue = null;
            this._subscription = null;
            this._obj = null;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsaUJBQWlCLEVBQTJCLElBQUksRUFBaUIsYUFBYSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6SCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQVN2RSxNQUFNLGtCQUFrQjtJQUN0QixrQkFBa0IsQ0FBQyxLQUFzQixFQUFFLGlCQUFzQjtRQUMvRCxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDckIsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixLQUFLLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRTtnQkFDaEIsTUFBTSxDQUFDLENBQUM7WUFDVixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUE4QjtRQUNwQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELFNBQVMsQ0FBQyxZQUE4QjtRQUN0QyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNGO0FBRUQsTUFBTSxlQUFlO0lBQ25CLGtCQUFrQixDQUFDLEtBQW1CLEVBQUUsaUJBQWtDO1FBQ3hFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUN2QyxNQUFNLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUEwQixJQUFTLENBQUM7SUFFNUMsU0FBUyxDQUFDLFlBQTBCLElBQVMsQ0FBQztDQUMvQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztBQUMvQyxNQUFNLG1CQUFtQixHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztBQUVyRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7QUFDSDtJQUFBLE1BQ2EsU0FBUztRQU9wQixZQUFvQixJQUF1QjtZQUF2QixTQUFJLEdBQUosSUFBSSxDQUFtQjtZQU5uQyxpQkFBWSxHQUFRLElBQUksQ0FBQztZQUV6QixrQkFBYSxHQUF1QyxJQUFJLENBQUM7WUFDekQsU0FBSSxHQUF3RCxJQUFJLENBQUM7WUFDakUsY0FBUyxHQUF5QixJQUFLLENBQUM7UUFFRixDQUFDO1FBRS9DLFdBQVc7WUFDVCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqQjtRQUNILENBQUM7UUFNRCxTQUFTLENBQUMsR0FBZ0Q7WUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2QsSUFBSSxHQUFHLEVBQUU7b0JBQ1AsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDdEI7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO2FBQzFCO1lBRUQsSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDckIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBVSxDQUFDLENBQUM7YUFDbkM7WUFFRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDM0IsQ0FBQztRQUVPLFVBQVUsQ0FBQyxHQUFtRDtZQUNwRSxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUNsRCxHQUFHLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRU8sZUFBZSxDQUFDLEdBQW1EO1lBQ3pFLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQixPQUFPLGdCQUFnQixDQUFDO2FBQ3pCO1lBRUQsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sbUJBQW1CLENBQUM7YUFDNUI7WUFFRCxNQUFNLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRU8sUUFBUTtZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFjLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNuQixDQUFDO1FBRU8sa0JBQWtCLENBQUMsS0FBVSxFQUFFLEtBQWE7WUFDbEQsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDMUI7UUFDSCxDQUFDOzs7Z0JBbkVGLElBQUksU0FBQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQzs7OztnQkF4RTFCLGlCQUFpQjs7SUE0SXpCLGdCQUFDO0tBQUE7U0FuRVksU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmLCBFdmVudEVtaXR0ZXIsIE9uRGVzdHJveSwgUGlwZSwgUGlwZVRyYW5zZm9ybSwgybVpc09ic2VydmFibGUsIMm1aXNQcm9taXNlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG5pbnRlcmZhY2UgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IE9ic2VydmFibGU8YW55PnxQcm9taXNlPGFueT4sIHVwZGF0ZUxhdGVzdFZhbHVlOiBhbnkpOiBTdWJzY3JpcHRpb25MaWtlXG4gICAgICB8UHJvbWlzZTxhbnk+O1xuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZXxQcm9taXNlPGFueT4pOiB2b2lkO1xuICBvbkRlc3Ryb3koc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25MaWtlfFByb21pc2U8YW55Pik6IHZvaWQ7XG59XG5cbmNsYXNzIE9ic2VydmFibGVTdHJhdGVneSBpbXBsZW1lbnRzIFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgY3JlYXRlU3Vic2NyaXB0aW9uKGFzeW5jOiBPYnNlcnZhYmxlPGFueT4sIHVwZGF0ZUxhdGVzdFZhbHVlOiBhbnkpOiBTdWJzY3JpcHRpb25MaWtlIHtcbiAgICByZXR1cm4gYXN5bmMuc3Vic2NyaWJlKHtcbiAgICAgIG5leHQ6IHVwZGF0ZUxhdGVzdFZhbHVlLFxuICAgICAgZXJyb3I6IChlOiBhbnkpID0+IHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25MaWtlKTogdm9pZCB7XG4gICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBvbkRlc3Ryb3koc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25MaWtlKTogdm9pZCB7XG4gICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cbn1cblxuY2xhc3MgUHJvbWlzZVN0cmF0ZWd5IGltcGxlbWVudHMgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IFByb21pc2U8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6ICh2OiBhbnkpID0+IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGFzeW5jLnRoZW4odXBkYXRlTGF0ZXN0VmFsdWUsIGUgPT4ge1xuICAgICAgdGhyb3cgZTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBQcm9taXNlPGFueT4pOiB2b2lkIHt9XG5cbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogUHJvbWlzZTxhbnk+KTogdm9pZCB7fVxufVxuXG5jb25zdCBfcHJvbWlzZVN0cmF0ZWd5ID0gbmV3IFByb21pc2VTdHJhdGVneSgpO1xuY29uc3QgX29ic2VydmFibGVTdHJhdGVneSA9IG5ldyBPYnNlcnZhYmxlU3RyYXRlZ3koKTtcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVbndyYXBzIGEgdmFsdWUgZnJvbSBhbiBhc3luY2hyb25vdXMgcHJpbWl0aXZlLlxuICpcbiAqIFRoZSBgYXN5bmNgIHBpcGUgc3Vic2NyaWJlcyB0byBhbiBgT2JzZXJ2YWJsZWAgb3IgYFByb21pc2VgIGFuZCByZXR1cm5zIHRoZSBsYXRlc3QgdmFsdWUgaXQgaGFzXG4gKiBlbWl0dGVkLiBXaGVuIGEgbmV3IHZhbHVlIGlzIGVtaXR0ZWQsIHRoZSBgYXN5bmNgIHBpcGUgbWFya3MgdGhlIGNvbXBvbmVudCB0byBiZSBjaGVja2VkIGZvclxuICogY2hhbmdlcy4gV2hlbiB0aGUgY29tcG9uZW50IGdldHMgZGVzdHJveWVkLCB0aGUgYGFzeW5jYCBwaXBlIHVuc3Vic2NyaWJlcyBhdXRvbWF0aWNhbGx5IHRvIGF2b2lkXG4gKiBwb3RlbnRpYWwgbWVtb3J5IGxlYWtzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogVGhpcyBleGFtcGxlIGJpbmRzIGEgYFByb21pc2VgIHRvIHRoZSB2aWV3LiBDbGlja2luZyB0aGUgYFJlc29sdmVgIGJ1dHRvbiByZXNvbHZlcyB0aGVcbiAqIHByb21pc2UuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9hc3luY19waXBlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlUHJvbWlzZSd9XG4gKlxuICogSXQncyBhbHNvIHBvc3NpYmxlIHRvIHVzZSBgYXN5bmNgIHdpdGggT2JzZXJ2YWJsZXMuIFRoZSBleGFtcGxlIGJlbG93IGJpbmRzIHRoZSBgdGltZWAgT2JzZXJ2YWJsZVxuICogdG8gdGhlIHZpZXcuIFRoZSBPYnNlcnZhYmxlIGNvbnRpbnVvdXNseSB1cGRhdGVzIHRoZSB2aWV3IHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2FzeW5jX3BpcGUudHMgcmVnaW9uPSdBc3luY1BpcGVPYnNlcnZhYmxlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAnYXN5bmMnLCBwdXJlOiBmYWxzZX0pXG5leHBvcnQgY2xhc3MgQXN5bmNQaXBlIGltcGxlbWVudHMgT25EZXN0cm95LCBQaXBlVHJhbnNmb3JtIHtcbiAgcHJpdmF0ZSBfbGF0ZXN0VmFsdWU6IGFueSA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25MaWtlfFByb21pc2U8YW55PnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfb2JqOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+fEV2ZW50RW1pdHRlcjxhbnk+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9zdHJhdGVneTogU3Vic2NyaXB0aW9uU3RyYXRlZ3kgPSBudWxsITtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZWY6IENoYW5nZURldGVjdG9yUmVmKSB7fVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICB0cmFuc2Zvcm08VD4ob2JqOiBudWxsKTogbnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogdW5kZWZpbmVkKTogdW5kZWZpbmVkO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBPYnNlcnZhYmxlPFQ+fG51bGx8dW5kZWZpbmVkKTogVHxudWxsO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBQcm9taXNlPFQ+fG51bGx8dW5kZWZpbmVkKTogVHxudWxsO1xuICB0cmFuc2Zvcm0ob2JqOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+fG51bGx8dW5kZWZpbmVkKTogYW55IHtcbiAgICBpZiAoIXRoaXMuX29iaikge1xuICAgICAgaWYgKG9iaikge1xuICAgICAgICB0aGlzLl9zdWJzY3JpYmUob2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9sYXRlc3RWYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqICE9PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybShvYmogYXMgYW55KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmUob2JqOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+fEV2ZW50RW1pdHRlcjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fb2JqID0gb2JqO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gdGhpcy5fc2VsZWN0U3RyYXRlZ3kob2JqKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSB0aGlzLl9zdHJhdGVneS5jcmVhdGVTdWJzY3JpcHRpb24oXG4gICAgICAgIG9iaiwgKHZhbHVlOiBPYmplY3QpID0+IHRoaXMuX3VwZGF0ZUxhdGVzdFZhbHVlKG9iaiwgdmFsdWUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NlbGVjdFN0cmF0ZWd5KG9iajogT2JzZXJ2YWJsZTxhbnk+fFByb21pc2U8YW55PnxFdmVudEVtaXR0ZXI8YW55Pik6IGFueSB7XG4gICAgaWYgKMm1aXNQcm9taXNlKG9iaikpIHtcbiAgICAgIHJldHVybiBfcHJvbWlzZVN0cmF0ZWd5O1xuICAgIH1cblxuICAgIGlmICjJtWlzT2JzZXJ2YWJsZShvYmopKSB7XG4gICAgICByZXR1cm4gX29ic2VydmFibGVTdHJhdGVneTtcbiAgICB9XG5cbiAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoQXN5bmNQaXBlLCBvYmopO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdHJhdGVneS5kaXNwb3NlKHRoaXMuX3N1YnNjcmlwdGlvbiEpO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9yZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG59XG4iXX0=