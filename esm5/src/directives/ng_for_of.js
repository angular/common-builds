/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, isDevMode } from '@angular/core';
var NgForOfContext = /** @class */ (function () {
    function NgForOfContext($implicit, ngForOf, index, count) {
        this.$implicit = $implicit;
        this.ngForOf = ngForOf;
        this.index = index;
        this.count = count;
    }
    Object.defineProperty(NgForOfContext.prototype, "first", {
        get: function () { return this.index === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOfContext.prototype, "last", {
        get: function () { return this.index === this.count - 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOfContext.prototype, "even", {
        get: function () { return this.index % 2 === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOfContext.prototype, "odd", {
        get: function () { return !this.even; },
        enumerable: true,
        configurable: true
    });
    return NgForOfContext;
}());
export { NgForOfContext };
/**
 * The `NgForOf` directive instantiates a template once per item from an iterable. The context
 * for each instantiated template inherits from the outer context with the given loop variable
 * set to the current item from the iterable.
 *
 * @usageNotes
 *
 * ### Local Variables
 *
 * `NgForOf` provides several exported values that can be aliased to local variables:
 *
 * - `$implicit: T`: The value of the individual items in the iterable (`ngForOf`).
 * - `ngForOf: NgIterable<T>`: The value of the iterable expression. Useful when the expression is
 * more complex then a property access, for example when using the async pipe (`userStreams |
 * async`).
 * - `index: number`: The index of the current item in the iterable.
 * - `first: boolean`: True when the item is the first item in the iterable.
 * - `last: boolean`: True when the item is the last item in the iterable.
 * - `even: boolean`: True when the item has an even index in the iterable.
 * - `odd: boolean`: True when the item has an odd index in the iterable.
 *
 * ```
 * <li *ngFor="let user of userObservable | async as users; index as i; first as isFirst">
 *    {{i}}/{{users.length}}. {{user}} <span *ngIf="isFirst">default</span>
 * </li>
 * ```
 *
 * ### Change Propagation
 *
 * When the contents of the iterator changes, `NgForOf` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 * * Otherwise, the DOM element for that item will remain the same.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls (such as `<input>` elements which accept user input) that are present. Inserted rows can
 * be animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state
 * such as user input.
 *
 * It is possible for the identities of elements in the iterator to change while the data does not.
 * This can happen, for example, if the iterator produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response will produce objects with
 * different identities, and Angular will tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted). This is an expensive operation and should
 * be avoided if possible.
 *
 * To customize the default tracking algorithm, `NgForOf` supports `trackBy` option.
 * `trackBy` takes a function which has two arguments: `index` and `item`.
 * If `trackBy` is given, Angular tracks changes by the return value of the function.
 *
 * ### Syntax
 *
 * - `<li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>`
 *
 * With `<ng-template>` element:
 *
 * ```
 * <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
 *   <li>...</li>
 * </ng-template>
 * ```
 *
 * ### Example
 *
 * See a [live demo](http://plnkr.co/edit/KVuXxDp0qinGDyo307QW?p=preview) for a more detailed
 * example.
 *
 * @ngModule CommonModule
 */
var NgForOf = /** @class */ (function () {
    function NgForOf(_viewContainer, _template, _differs) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this._ngForOfDirty = true;
        this._differ = null;
    }
    Object.defineProperty(NgForOf.prototype, "ngForOf", {
        set: function (ngForOf) {
            this._ngForOf = ngForOf;
            this._ngForOfDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOf.prototype, "ngForTrackBy", {
        get: function () { return this._trackByFn; },
        set: function (fn) {
            if (isDevMode() && fn != null && typeof fn !== 'function') {
                // TODO(vicb): use a log service once there is a public one available
                if (console && console.warn) {
                    console.warn("trackBy must be a function, but received " + JSON.stringify(fn) + ". " +
                        "See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.");
                }
            }
            this._trackByFn = fn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOf.prototype, "ngForTemplate", {
        set: function (value) {
            // TODO(TS2.1): make TemplateRef<Partial<NgForRowOf<T>>> once we move to TS v2.1
            // The current type is too restrictive; a template that just uses index, for example,
            // should be acceptable.
            if (value) {
                this._template = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    NgForOf.prototype.ngDoCheck = function () {
        if (this._ngForOfDirty) {
            this._ngForOfDirty = false;
            // React on ngForOf changes only once all inputs have been initialized
            var value = this._ngForOf;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.ngForTrackBy);
                }
                catch (e) {
                    throw new Error("Cannot find a differ supporting object '" + value + "' of type '" + getTypeNameForDebugging(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
                }
            }
        }
        if (this._differ) {
            var changes = this._differ.diff(this._ngForOf);
            if (changes)
                this._applyChanges(changes);
        }
    };
    NgForOf.prototype._applyChanges = function (changes) {
        var _this = this;
        var insertTuples = [];
        changes.forEachOperation(function (item, adjustedPreviousIndex, currentIndex) {
            if (item.previousIndex == null) {
                var view = _this._viewContainer.createEmbeddedView(_this._template, new NgForOfContext(null, _this._ngForOf, -1, -1), currentIndex);
                var tuple = new RecordViewTuple(item, view);
                insertTuples.push(tuple);
            }
            else if (currentIndex == null) {
                _this._viewContainer.remove(adjustedPreviousIndex);
            }
            else {
                var view = _this._viewContainer.get(adjustedPreviousIndex);
                _this._viewContainer.move(view, currentIndex);
                var tuple = new RecordViewTuple(item, view);
                insertTuples.push(tuple);
            }
        });
        for (var i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
        for (var i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
            var viewRef = this._viewContainer.get(i);
            viewRef.context.index = i;
            viewRef.context.count = ilen;
            viewRef.context.ngForOf = this._ngForOf;
        }
        changes.forEachIdentityChange(function (record) {
            var viewRef = _this._viewContainer.get(record.currentIndex);
            viewRef.context.$implicit = record.item;
        });
    };
    NgForOf.prototype._perViewChange = function (view, record) {
        view.context.$implicit = record.item;
    };
    /**
     * Assert the correct type of the context for the template that `NgForOf` will render.
     *
     * The presence of this method is a signal to the Ivy template type check compiler that the
     * `NgForOf` structural directive renders its template with a specific context type.
     */
    NgForOf.ngTemplateContextGuard = function (dir, ctx) {
        return true;
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], NgForOf.prototype, "ngForOf", null);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Function])
    ], NgForOf.prototype, "ngForTrackBy", null);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", TemplateRef),
        tslib_1.__metadata("design:paramtypes", [TemplateRef])
    ], NgForOf.prototype, "ngForTemplate", null);
    NgForOf = tslib_1.__decorate([
        Directive({ selector: '[ngFor][ngForOf]' }),
        tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
            IterableDiffers])
    ], NgForOf);
    return NgForOf;
}());
export { NgForOf };
var RecordViewTuple = /** @class */ (function () {
    function RecordViewTuple(record, view) {
        this.record = record;
        this.view = view;
    }
    return RecordViewTuple;
}());
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFvQixTQUFTLEVBQTRCLEtBQUssRUFBeUQsZUFBZSxFQUFjLFdBQVcsRUFBbUIsZ0JBQWdCLEVBQWMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZQO0lBQ0Usd0JBQ1csU0FBWSxFQUFTLE9BQXNCLEVBQVMsS0FBYSxFQUNqRSxLQUFhO1FBRGIsY0FBUyxHQUFULFNBQVMsQ0FBRztRQUFTLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2pFLFVBQUssR0FBTCxLQUFLLENBQVE7SUFBRyxDQUFDO0lBRTVCLHNCQUFJLGlDQUFLO2FBQVQsY0FBdUIsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRWpELHNCQUFJLGdDQUFJO2FBQVIsY0FBc0IsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFN0Qsc0JBQUksZ0NBQUk7YUFBUixjQUFzQixPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRXBELHNCQUFJLCtCQUFHO2FBQVAsY0FBcUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUMzQyxxQkFBQztBQUFELENBQUMsQUFaRCxJQVlDOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVF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QUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQztBQUNyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmLCBEaXJlY3RpdmUsIERvQ2hlY2ssIEVtYmVkZGVkVmlld1JlZiwgSW5wdXQsIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLCBJdGVyYWJsZUNoYW5nZXMsIEl0ZXJhYmxlRGlmZmVyLCBJdGVyYWJsZURpZmZlcnMsIE5nSXRlcmFibGUsIFRlbXBsYXRlUmVmLCBUcmFja0J5RnVuY3Rpb24sIFZpZXdDb250YWluZXJSZWYsIGZvcndhcmRSZWYsIGlzRGV2TW9kZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBjbGFzcyBOZ0Zvck9mQ29udGV4dDxUPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljICRpbXBsaWNpdDogVCwgcHVibGljIG5nRm9yT2Y6IE5nSXRlcmFibGU8VD4sIHB1YmxpYyBpbmRleDogbnVtYmVyLFxuICAgICAgcHVibGljIGNvdW50OiBudW1iZXIpIHt9XG5cbiAgZ2V0IGZpcnN0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pbmRleCA9PT0gMDsgfVxuXG4gIGdldCBsYXN0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pbmRleCA9PT0gdGhpcy5jb3VudCAtIDE7IH1cblxuICBnZXQgZXZlbigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaW5kZXggJSAyID09PSAwOyB9XG5cbiAgZ2V0IG9kZCgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLmV2ZW47IH1cbn1cblxuLyoqXG4gKiBUaGUgYE5nRm9yT2ZgIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgYSB0ZW1wbGF0ZSBvbmNlIHBlciBpdGVtIGZyb20gYW4gaXRlcmFibGUuIFRoZSBjb250ZXh0XG4gKiBmb3IgZWFjaCBpbnN0YW50aWF0ZWQgdGVtcGxhdGUgaW5oZXJpdHMgZnJvbSB0aGUgb3V0ZXIgY29udGV4dCB3aXRoIHRoZSBnaXZlbiBsb29wIHZhcmlhYmxlXG4gKiBzZXQgdG8gdGhlIGN1cnJlbnQgaXRlbSBmcm9tIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBMb2NhbCBWYXJpYWJsZXNcbiAqXG4gKiBgTmdGb3JPZmAgcHJvdmlkZXMgc2V2ZXJhbCBleHBvcnRlZCB2YWx1ZXMgdGhhdCBjYW4gYmUgYWxpYXNlZCB0byBsb2NhbCB2YXJpYWJsZXM6XG4gKlxuICogLSBgJGltcGxpY2l0OiBUYDogVGhlIHZhbHVlIG9mIHRoZSBpbmRpdmlkdWFsIGl0ZW1zIGluIHRoZSBpdGVyYWJsZSAoYG5nRm9yT2ZgKS5cbiAqIC0gYG5nRm9yT2Y6IE5nSXRlcmFibGU8VD5gOiBUaGUgdmFsdWUgb2YgdGhlIGl0ZXJhYmxlIGV4cHJlc3Npb24uIFVzZWZ1bCB3aGVuIHRoZSBleHByZXNzaW9uIGlzXG4gKiBtb3JlIGNvbXBsZXggdGhlbiBhIHByb3BlcnR5IGFjY2VzcywgZm9yIGV4YW1wbGUgd2hlbiB1c2luZyB0aGUgYXN5bmMgcGlwZSAoYHVzZXJTdHJlYW1zIHxcbiAqIGFzeW5jYCkuXG4gKiAtIGBpbmRleDogbnVtYmVyYDogVGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgZmlyc3Q6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaXMgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgbGFzdDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBpcyB0aGUgbGFzdCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGV2ZW46IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaGFzIGFuIGV2ZW4gaW5kZXggaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgb2RkOiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGhhcyBhbiBvZGQgaW5kZXggaW4gdGhlIGl0ZXJhYmxlLlxuICpcbiAqIGBgYFxuICogPGxpICpuZ0Zvcj1cImxldCB1c2VyIG9mIHVzZXJPYnNlcnZhYmxlIHwgYXN5bmMgYXMgdXNlcnM7IGluZGV4IGFzIGk7IGZpcnN0IGFzIGlzRmlyc3RcIj5cbiAqICAgIHt7aX19L3t7dXNlcnMubGVuZ3RofX0uIHt7dXNlcn19IDxzcGFuICpuZ0lmPVwiaXNGaXJzdFwiPmRlZmF1bHQ8L3NwYW4+XG4gKiA8L2xpPlxuICogYGBgXG4gKlxuICogIyMjIENoYW5nZSBQcm9wYWdhdGlvblxuICpcbiAqIFdoZW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBpdGVyYXRvciBjaGFuZ2VzLCBgTmdGb3JPZmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKiAqIE90aGVyd2lzZSwgdGhlIERPTSBlbGVtZW50IGZvciB0aGF0IGl0ZW0gd2lsbCByZW1haW4gdGhlIHNhbWUuXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHMgKHN1Y2ggYXMgYDxpbnB1dD5gIGVsZW1lbnRzIHdoaWNoIGFjY2VwdCB1c2VyIGlucHV0KSB0aGF0IGFyZSBwcmVzZW50LiBJbnNlcnRlZCByb3dzIGNhblxuICogYmUgYW5pbWF0ZWQgaW4sIGRlbGV0ZWQgcm93cyBjYW4gYmUgYW5pbWF0ZWQgb3V0LCBhbmQgdW5jaGFuZ2VkIHJvd3MgcmV0YWluIGFueSB1bnNhdmVkIHN0YXRlXG4gKiBzdWNoIGFzIHVzZXIgaW5wdXQuXG4gKlxuICogSXQgaXMgcG9zc2libGUgZm9yIHRoZSBpZGVudGl0aWVzIG9mIGVsZW1lbnRzIGluIHRoZSBpdGVyYXRvciB0byBjaGFuZ2Ugd2hpbGUgdGhlIGRhdGEgZG9lcyBub3QuXG4gKiBUaGlzIGNhbiBoYXBwZW4sIGZvciBleGFtcGxlLCBpZiB0aGUgaXRlcmF0b3IgcHJvZHVjZWQgZnJvbSBhbiBSUEMgdG8gdGhlIHNlcnZlciwgYW5kIHRoYXRcbiAqIFJQQyBpcyByZS1ydW4uIEV2ZW4gaWYgdGhlIGRhdGEgaGFzbid0IGNoYW5nZWQsIHRoZSBzZWNvbmQgcmVzcG9uc2Ugd2lsbCBwcm9kdWNlIG9iamVjdHMgd2l0aFxuICogZGlmZmVyZW50IGlkZW50aXRpZXMsIGFuZCBBbmd1bGFyIHdpbGwgdGVhciBkb3duIHRoZSBlbnRpcmUgRE9NIGFuZCByZWJ1aWxkIGl0IChhcyBpZiBhbGwgb2xkXG4gKiBlbGVtZW50cyB3ZXJlIGRlbGV0ZWQgYW5kIGFsbCBuZXcgZWxlbWVudHMgaW5zZXJ0ZWQpLiBUaGlzIGlzIGFuIGV4cGVuc2l2ZSBvcGVyYXRpb24gYW5kIHNob3VsZFxuICogYmUgYXZvaWRlZCBpZiBwb3NzaWJsZS5cbiAqXG4gKiBUbyBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJhY2tpbmcgYWxnb3JpdGhtLCBgTmdGb3JPZmAgc3VwcG9ydHMgYHRyYWNrQnlgIG9wdGlvbi5cbiAqIGB0cmFja0J5YCB0YWtlcyBhIGZ1bmN0aW9uIHdoaWNoIGhhcyB0d28gYXJndW1lbnRzOiBgaW5kZXhgIGFuZCBgaXRlbWAuXG4gKiBJZiBgdHJhY2tCeWAgaXMgZ2l2ZW4sIEFuZ3VsYXIgdHJhY2tzIGNoYW5nZXMgYnkgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24uXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgaW5kZXggYXMgaTsgdHJhY2tCeTogdHJhY2tCeUZuXCI+Li4uPC9saT5gXG4gKlxuICogV2l0aCBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudDpcbiAqXG4gKiBgYGBcbiAqIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtaXRlbSBbbmdGb3JPZl09XCJpdGVtc1wiIGxldC1pPVwiaW5kZXhcIiBbbmdGb3JUcmFja0J5XT1cInRyYWNrQnlGblwiPlxuICogICA8bGk+Li4uPC9saT5cbiAqIDwvbmctdGVtcGxhdGU+XG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFNlZSBhIFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tWdVh4RHAwcWluR0R5bzMwN1FXP3A9cHJldmlldykgZm9yIGEgbW9yZSBkZXRhaWxlZFxuICogZXhhbXBsZS5cbiAqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nRm9yXVtuZ0Zvck9mXSd9KVxuZXhwb3J0IGNsYXNzIE5nRm9yT2Y8VD4gaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgQElucHV0KClcbiAgc2V0IG5nRm9yT2YobmdGb3JPZjogTmdJdGVyYWJsZTxUPikge1xuICAgIHRoaXMuX25nRm9yT2YgPSBuZ0Zvck9mO1xuICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IHRydWU7XG4gIH1cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUT0RPKHZpY2IpOiB1c2UgYSBsb2cgc2VydmljZSBvbmNlIHRoZXJlIGlzIGEgcHVibGljIG9uZSBhdmFpbGFibGVcbiAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcbiAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xuICB9XG5cbiAgZ2V0IG5nRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4geyByZXR1cm4gdGhpcy5fdHJhY2tCeUZuOyB9XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX25nRm9yT2YgITogTmdJdGVyYWJsZTxUPjtcbiAgcHJpdmF0ZSBfbmdGb3JPZkRpcnR5OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPnxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3RyYWNrQnlGbiAhOiBUcmFja0J5RnVuY3Rpb248VD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8TmdGb3JPZkNvbnRleHQ8VD4+LFxuICAgICAgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzKSB7fVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0ZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZjxOZ0Zvck9mQ29udGV4dDxUPj4pIHtcbiAgICAvLyBUT0RPKFRTMi4xKTogbWFrZSBUZW1wbGF0ZVJlZjxQYXJ0aWFsPE5nRm9yUm93T2Y8VD4+PiBvbmNlIHdlIG1vdmUgdG8gVFMgdjIuMVxuICAgIC8vIFRoZSBjdXJyZW50IHR5cGUgaXMgdG9vIHJlc3RyaWN0aXZlOyBhIHRlbXBsYXRlIHRoYXQganVzdCB1c2VzIGluZGV4LCBmb3IgZXhhbXBsZSxcbiAgICAvLyBzaG91bGQgYmUgYWNjZXB0YWJsZS5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9uZ0Zvck9mRGlydHkpIHtcbiAgICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IGZhbHNlO1xuICAgICAgLy8gUmVhY3Qgb24gbmdGb3JPZiBjaGFuZ2VzIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9uZ0Zvck9mO1xuICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLm5nRm9yVHJhY2tCeSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHt2YWx1ZX0nIG9mIHR5cGUgJyR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodmFsdWUpfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMgc3VjaCBhcyBBcnJheXMuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX2RpZmZlcikge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nRm9yT2YpO1xuICAgICAgaWYgKGNoYW5nZXMpIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XG4gICAgY29uc3QgaW5zZXJ0VHVwbGVzOiBSZWNvcmRWaWV3VHVwbGU8VD5bXSA9IFtdO1xuICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbihcbiAgICAgICAgKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgIGlmIChpdGVtLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuX3ZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlLCBuZXcgTmdGb3JPZkNvbnRleHQ8VD4obnVsbCAhLCB0aGlzLl9uZ0Zvck9mLCAtMSwgLTEpLCBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgdHVwbGUgPSBuZXcgUmVjb3JkVmlld1R1cGxlPFQ+KGl0ZW0sIHZpZXcpO1xuICAgICAgICAgICAgaW5zZXJ0VHVwbGVzLnB1c2godHVwbGUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIucmVtb3ZlKGFkanVzdGVkUHJldmlvdXNJbmRleCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLl92aWV3Q29udGFpbmVyLmdldChhZGp1c3RlZFByZXZpb3VzSW5kZXgpICE7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLm1vdmUodmlldywgY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IHR1cGxlID0gbmV3IFJlY29yZFZpZXdUdXBsZShpdGVtLCA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj52aWV3KTtcbiAgICAgICAgICAgIGluc2VydFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnNlcnRUdXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3BlclZpZXdDaGFuZ2UoaW5zZXJ0VHVwbGVzW2ldLnZpZXcsIGluc2VydFR1cGxlc1tpXS5yZWNvcmQpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwLCBpbGVuID0gdGhpcy5fdmlld0NvbnRhaW5lci5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj50aGlzLl92aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC5pbmRleCA9IGk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuY291bnQgPSBpbGVuO1xuICAgICAgdmlld1JlZi5jb250ZXh0Lm5nRm9yT2YgPSB0aGlzLl9uZ0Zvck9mO1xuICAgIH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xuICAgICAgY29uc3Qgdmlld1JlZiA9XG4gICAgICAgICAgPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxUPj4+dGhpcy5fdmlld0NvbnRhaW5lci5nZXQocmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuJGltcGxpY2l0ID0gcmVjb3JkLml0ZW07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9wZXJWaWV3Q2hhbmdlKFxuICAgICAgdmlldzogRW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+PiwgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxhbnk+KSB7XG4gICAgdmlldy5jb250ZXh0LiRpbXBsaWNpdCA9IHJlY29yZC5pdGVtO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBjb250ZXh0IGZvciB0aGUgdGVtcGxhdGUgdGhhdCBgTmdGb3JPZmAgd2lsbCByZW5kZXIuXG4gICAqXG4gICAqIFRoZSBwcmVzZW5jZSBvZiB0aGlzIG1ldGhvZCBpcyBhIHNpZ25hbCB0byB0aGUgSXZ5IHRlbXBsYXRlIHR5cGUgY2hlY2sgY29tcGlsZXIgdGhhdCB0aGVcbiAgICogYE5nRm9yT2ZgIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHJlbmRlcnMgaXRzIHRlbXBsYXRlIHdpdGggYSBzcGVjaWZpYyBjb250ZXh0IHR5cGUuXG4gICAqL1xuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxUPihkaXI6IE5nRm9yT2Y8VD4sIGN0eDogYW55KTogY3R4IGlzIE5nRm9yT2ZDb250ZXh0PFQ+IHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5jbGFzcyBSZWNvcmRWaWV3VHVwbGU8VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjb3JkOiBhbnksIHB1YmxpYyB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVbJ25hbWUnXSB8fCB0eXBlb2YgdHlwZTtcbn1cbiJdfQ==