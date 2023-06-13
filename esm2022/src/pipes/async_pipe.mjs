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
class AsyncPipe {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.5+sha-c0a2db9", ngImport: i0, type: AsyncPipe, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.0.5+sha-c0a2db9", ngImport: i0, type: AsyncPipe, isStandalone: true, name: "async", pure: false }); }
}
export { AsyncPipe };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.5+sha-c0a2db9", ngImport: i0, type: AsyncPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'async',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsaUJBQWlCLEVBQTJCLElBQUksRUFBaUIsU0FBUyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHdEksT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBUXZFLE1BQU0sb0JBQW9CO0lBQ3hCLGtCQUFrQixDQUFDLEtBQXdCLEVBQUUsaUJBQXNCO1FBQ2pFLDZGQUE2RjtRQUM3RixvRkFBb0Y7UUFDcEYsOEZBQThGO1FBQzlGLDhDQUE4QztRQUM5QyxFQUFFO1FBQ0YsOEZBQThGO1FBQzlGLHVGQUF1RjtRQUN2RixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ3JDLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztTQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUE0QjtRQUNsQywyRUFBMkU7UUFDM0UsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDRjtBQUVELE1BQU0sZUFBZTtJQUNuQixrQkFBa0IsQ0FBQyxLQUFtQixFQUFFLGlCQUFrQztRQUN4RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdkMsTUFBTSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLENBQUMsWUFBMEIsSUFBUyxDQUFDO0NBQzdDO0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0FBQy9DLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO0FBRXpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQkc7QUFDSCxNQUthLFNBQVM7SUFRcEIsWUFBWSxHQUFzQjtRQU4xQixpQkFBWSxHQUFRLElBQUksQ0FBQztRQUV6QixrQkFBYSxHQUFxQyxJQUFJLENBQUM7UUFDdkQsU0FBSSxHQUEwRCxJQUFJLENBQUM7UUFDbkUsY0FBUyxHQUE4QixJQUFJLENBQUM7UUFHbEQsd0ZBQXdGO1FBQ3hGLHVGQUF1RjtRQUN2RixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNsQixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN0QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDakI7UUFDRCxvRkFBb0Y7UUFDcEYsb0ZBQW9GO1FBQ3BGLGVBQWU7UUFDZixrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQVNELFNBQVMsQ0FBSSxHQUE0RDtRQUN2RSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNkLElBQUksR0FBRyxFQUFFO2dCQUNQLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEI7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDMUI7UUFFRCxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDNUI7UUFFRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVPLFVBQVUsQ0FBQyxHQUFxRDtRQUN0RSxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUNsRCxHQUFHLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRU8sZUFBZSxDQUFDLEdBQ2lCO1FBQ3ZDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLE9BQU8sZ0JBQWdCLENBQUM7U0FDekI7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QixPQUFPLHFCQUFxQixDQUFDO1NBQzlCO1FBRUQsTUFBTSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVPLFFBQVE7UUFDZCwyRkFBMkY7UUFDM0YsMkNBQTJDO1FBQzNDLElBQUksQ0FBQyxTQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFjLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRU8sa0JBQWtCLENBQUMsS0FBVSxFQUFFLEtBQWE7UUFDbEQsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTtZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQix3RkFBd0Y7WUFDeEYsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxJQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDO3lIQXBGVSxTQUFTO3VIQUFULFNBQVM7O1NBQVQsU0FBUztzR0FBVCxTQUFTO2tCQUxyQixJQUFJO21CQUFDO29CQUNKLElBQUksRUFBRSxPQUFPO29CQUNiLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmLCBFdmVudEVtaXR0ZXIsIE9uRGVzdHJveSwgUGlwZSwgUGlwZVRyYW5zZm9ybSwgdW50cmFja2VkLCDJtWlzUHJvbWlzZSwgybVpc1N1YnNjcmliYWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmliYWJsZSwgVW5zdWJzY3JpYmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG5pbnRlcmZhY2UgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IFN1YnNjcmliYWJsZTxhbnk+fFByb21pc2U8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSk6IFVuc3Vic2NyaWJhYmxlXG4gICAgICB8UHJvbWlzZTxhbnk+O1xuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogVW5zdWJzY3JpYmFibGV8UHJvbWlzZTxhbnk+KTogdm9pZDtcbn1cblxuY2xhc3MgU3Vic2NyaWJhYmxlU3RyYXRlZ3kgaW1wbGVtZW50cyBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogU3Vic2NyaWJhYmxlPGFueT4sIHVwZGF0ZUxhdGVzdFZhbHVlOiBhbnkpOiBVbnN1YnNjcmliYWJsZSB7XG4gICAgLy8gU3Vic2NyaXB0aW9uIGNhbiBiZSBzaWRlLWVmZmVjdGZ1bCwgYW5kIHdlIGRvbid0IHdhbnQgYW55IHNpZ25hbCByZWFkcyB3aGljaCBoYXBwZW4gaW4gdGhlXG4gICAgLy8gc2lkZSBlZmZlY3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiB0byBiZSB0cmFja2VkIGJ5IGEgY29tcG9uZW50J3MgdGVtcGxhdGUgd2hlbiB0aGF0XG4gICAgLy8gc3Vic2NyaXB0aW9uIGlzIHRyaWdnZXJlZCB2aWEgdGhlIGFzeW5jIHBpcGUuIFNvIHdlIHdyYXAgdGhlIHN1YnNjcmlwdGlvbiBpbiBgdW50cmFja2VkYCB0b1xuICAgIC8vIGRlY291cGxlIGZyb20gdGhlIGN1cnJlbnQgcmVhY3RpdmUgY29udGV4dC5cbiAgICAvL1xuICAgIC8vIGB1bnRyYWNrZWRgIGFsc28gcHJldmVudHMgc2lnbmFsIF93cml0ZXNfIHdoaWNoIGhhcHBlbiBpbiB0aGUgc3Vic2NyaXB0aW9uIHNpZGUgZWZmZWN0IGZyb21cbiAgICAvLyBiZWluZyB0cmVhdGVkIGFzIHNpZ25hbCB3cml0ZXMgZHVyaW5nIHRoZSB0ZW1wbGF0ZSBldmFsdWF0aW9uICh3aGljaCB0aHJvd3MgZXJyb3JzKS5cbiAgICByZXR1cm4gdW50cmFja2VkKCgpID0+IGFzeW5jLnN1YnNjcmliZSh7XG4gICAgICBuZXh0OiB1cGRhdGVMYXRlc3RWYWx1ZSxcbiAgICAgIGVycm9yOiAoZTogYW55KSA9PiB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFVuc3Vic2NyaWJhYmxlKTogdm9pZCB7XG4gICAgLy8gU2VlIHRoZSBjb21tZW50IGluIGBjcmVhdGVTdWJzY3JpcHRpb25gIGFib3ZlIG9uIHRoZSB1c2Ugb2YgYHVudHJhY2tlZGAuXG4gICAgdW50cmFja2VkKCgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgfVxufVxuXG5jbGFzcyBQcm9taXNlU3RyYXRlZ3kgaW1wbGVtZW50cyBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogUHJvbWlzZTxhbnk+LCB1cGRhdGVMYXRlc3RWYWx1ZTogKHY6IGFueSkgPT4gYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXN5bmMudGhlbih1cGRhdGVMYXRlc3RWYWx1ZSwgZSA9PiB7XG4gICAgICB0aHJvdyBlO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZShzdWJzY3JpcHRpb246IFByb21pc2U8YW55Pik6IHZvaWQge31cbn1cblxuY29uc3QgX3Byb21pc2VTdHJhdGVneSA9IG5ldyBQcm9taXNlU3RyYXRlZ3koKTtcbmNvbnN0IF9zdWJzY3JpYmFibGVTdHJhdGVneSA9IG5ldyBTdWJzY3JpYmFibGVTdHJhdGVneSgpO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFVud3JhcHMgYSB2YWx1ZSBmcm9tIGFuIGFzeW5jaHJvbm91cyBwcmltaXRpdmUuXG4gKlxuICogVGhlIGBhc3luY2AgcGlwZSBzdWJzY3JpYmVzIHRvIGFuIGBPYnNlcnZhYmxlYCBvciBgUHJvbWlzZWAgYW5kIHJldHVybnMgdGhlIGxhdGVzdCB2YWx1ZSBpdCBoYXNcbiAqIGVtaXR0ZWQuIFdoZW4gYSBuZXcgdmFsdWUgaXMgZW1pdHRlZCwgdGhlIGBhc3luY2AgcGlwZSBtYXJrcyB0aGUgY29tcG9uZW50IHRvIGJlIGNoZWNrZWQgZm9yXG4gKiBjaGFuZ2VzLiBXaGVuIHRoZSBjb21wb25lbnQgZ2V0cyBkZXN0cm95ZWQsIHRoZSBgYXN5bmNgIHBpcGUgdW5zdWJzY3JpYmVzIGF1dG9tYXRpY2FsbHkgdG8gYXZvaWRcbiAqIHBvdGVudGlhbCBtZW1vcnkgbGVha3MuIFdoZW4gdGhlIHJlZmVyZW5jZSBvZiB0aGUgZXhwcmVzc2lvbiBjaGFuZ2VzLCB0aGUgYGFzeW5jYCBwaXBlXG4gKiBhdXRvbWF0aWNhbGx5IHVuc3Vic2NyaWJlcyBmcm9tIHRoZSBvbGQgYE9ic2VydmFibGVgIG9yIGBQcm9taXNlYCBhbmQgc3Vic2NyaWJlcyB0byB0aGUgbmV3IG9uZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIFRoaXMgZXhhbXBsZSBiaW5kcyBhIGBQcm9taXNlYCB0byB0aGUgdmlldy4gQ2xpY2tpbmcgdGhlIGBSZXNvbHZlYCBidXR0b24gcmVzb2x2ZXMgdGhlXG4gKiBwcm9taXNlLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvYXN5bmNfcGlwZS50cyByZWdpb249J0FzeW5jUGlwZVByb21pc2UnfVxuICpcbiAqIEl0J3MgYWxzbyBwb3NzaWJsZSB0byB1c2UgYGFzeW5jYCB3aXRoIE9ic2VydmFibGVzLiBUaGUgZXhhbXBsZSBiZWxvdyBiaW5kcyB0aGUgYHRpbWVgIE9ic2VydmFibGVcbiAqIHRvIHRoZSB2aWV3LiBUaGUgT2JzZXJ2YWJsZSBjb250aW51b3VzbHkgdXBkYXRlcyB0aGUgdmlldyB3aXRoIHRoZSBjdXJyZW50IHRpbWUuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9hc3luY19waXBlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlT2JzZXJ2YWJsZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7XG4gIG5hbWU6ICdhc3luYycsXG4gIHB1cmU6IGZhbHNlLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBBc3luY1BpcGUgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIFBpcGVUcmFuc2Zvcm0ge1xuICBwcml2YXRlIF9yZWY6IENoYW5nZURldGVjdG9yUmVmfG51bGw7XG4gIHByaXZhdGUgX2xhdGVzdFZhbHVlOiBhbnkgPSBudWxsO1xuXG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogVW5zdWJzY3JpYmFibGV8UHJvbWlzZTxhbnk+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9vYmo6IFN1YnNjcmliYWJsZTxhbnk+fFByb21pc2U8YW55PnxFdmVudEVtaXR0ZXI8YW55PnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IFN1YnNjcmlwdGlvblN0cmF0ZWd5fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICAvLyBBc3NpZ24gYHJlZmAgaW50byBgdGhpcy5fcmVmYCBtYW51YWxseSBpbnN0ZWFkIG9mIGRlY2xhcmluZyBgX3JlZmAgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgLy8gcGFyYW1ldGVyIGxpc3QsIGFzIHRoZSB0eXBlIG9mIGB0aGlzLl9yZWZgIGluY2x1ZGVzIGBudWxsYCB1bmxpa2UgdGhlIHR5cGUgb2YgYHJlZmAuXG4gICAgdGhpcy5fcmVmID0gcmVmO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgIH1cbiAgICAvLyBDbGVhciB0aGUgYENoYW5nZURldGVjdG9yUmVmYCBhbmQgaXRzIGFzc29jaWF0aW9uIHdpdGggdGhlIHZpZXcgZGF0YSwgdG8gbWl0aWdhdGVcbiAgICAvLyBwb3RlbnRpYWwgbWVtb3J5IGxlYWtzIGluIE9ic2VydmFibGVzIHRoYXQgY291bGQgb3RoZXJ3aXNlIGNhdXNlIHRoZSB2aWV3IGRhdGEgdG9cbiAgICAvLyBiZSByZXRhaW5lZC5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xNzYyNFxuICAgIHRoaXMuX3JlZiA9IG51bGw7XG4gIH1cblxuICAvLyBOT1RFKEBiZW5sZXNoKTogQmVjYXVzZSBPYnNlcnZhYmxlIGhhcyBkZXByZWNhdGVkIGEgZmV3IGNhbGwgcGF0dGVybnMgZm9yIGBzdWJzY3JpYmVgLFxuICAvLyBUeXBlU2NyaXB0IGhhcyBhIGhhcmQgdGltZSBtYXRjaGluZyBPYnNlcnZhYmxlIHRvIFN1YnNjcmliYWJsZSwgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDM2NDNcblxuICB0cmFuc2Zvcm08VD4ob2JqOiBPYnNlcnZhYmxlPFQ+fFN1YnNjcmliYWJsZTxUPnxQcm9taXNlPFQ+KTogVHxudWxsO1xuICB0cmFuc2Zvcm08VD4ob2JqOiBudWxsfHVuZGVmaW5lZCk6IG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IE9ic2VydmFibGU8VD58U3Vic2NyaWJhYmxlPFQ+fFByb21pc2U8VD58bnVsbHx1bmRlZmluZWQpOiBUfG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IE9ic2VydmFibGU8VD58U3Vic2NyaWJhYmxlPFQ+fFByb21pc2U8VD58bnVsbHx1bmRlZmluZWQpOiBUfG51bGwge1xuICAgIGlmICghdGhpcy5fb2JqKSB7XG4gICAgICBpZiAob2JqKSB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmliZShvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2xhdGVzdFZhbHVlO1xuICAgIH1cblxuICAgIGlmIChvYmogIT09IHRoaXMuX29iaikge1xuICAgICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtKG9iaik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhdGVzdFZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlKG9iajogU3Vic2NyaWJhYmxlPGFueT58UHJvbWlzZTxhbnk+fEV2ZW50RW1pdHRlcjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fb2JqID0gb2JqO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gdGhpcy5fc2VsZWN0U3RyYXRlZ3kob2JqKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSB0aGlzLl9zdHJhdGVneS5jcmVhdGVTdWJzY3JpcHRpb24oXG4gICAgICAgIG9iaiwgKHZhbHVlOiBPYmplY3QpID0+IHRoaXMuX3VwZGF0ZUxhdGVzdFZhbHVlKG9iaiwgdmFsdWUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NlbGVjdFN0cmF0ZWd5KG9iajogU3Vic2NyaWJhYmxlPGFueT58UHJvbWlzZTxhbnk+fFxuICAgICAgICAgICAgICAgICAgICAgICAgICBFdmVudEVtaXR0ZXI8YW55Pik6IFN1YnNjcmlwdGlvblN0cmF0ZWd5IHtcbiAgICBpZiAoybVpc1Byb21pc2Uob2JqKSkge1xuICAgICAgcmV0dXJuIF9wcm9taXNlU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgaWYgKMm1aXNTdWJzY3JpYmFibGUob2JqKSkge1xuICAgICAgcmV0dXJuIF9zdWJzY3JpYmFibGVTdHJhdGVneTtcbiAgICB9XG5cbiAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoQXN5bmNQaXBlLCBvYmopO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBOb3RlOiBgZGlzcG9zZWAgaXMgb25seSBjYWxsZWQgaWYgYSBzdWJzY3JpcHRpb24gaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYmVmb3JlLCBpbmRpY2F0aW5nXG4gICAgLy8gdGhhdCBgdGhpcy5fc3RyYXRlZ3lgIGlzIGFsc28gYXZhaWxhYmxlLlxuICAgIHRoaXMuX3N0cmF0ZWd5IS5kaXNwb3NlKHRoaXMuX3N1YnNjcmlwdGlvbiEpO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICAvLyBOb3RlOiBgdGhpcy5fcmVmYCBpcyBvbmx5IGNsZWFyZWQgaW4gYG5nT25EZXN0cm95YCBzbyBpcyBrbm93biB0byBiZSBhdmFpbGFibGUgd2hlbiBhXG4gICAgICAvLyB2YWx1ZSBpcyBiZWluZyB1cGRhdGVkLlxuICAgICAgdGhpcy5fcmVmIS5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==