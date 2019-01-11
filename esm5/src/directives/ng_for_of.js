/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, isDevMode } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @publicApi
 */
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
 * @publicApi
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
                catch (_a) {
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
    NgForOf.ngDirectiveDef = i0.ɵdefineDirective({ type: NgForOf, selectors: [["", "ngFor", "", "ngForOf", ""]], factory: function NgForOf_Factory(t) { return new (t || NgForOf)(i0.ɵdirectiveInject(ViewContainerRef), i0.ɵdirectiveInject(TemplateRef), i0.ɵdirectiveInject(IterableDiffers)); }, inputs: { ngForOf: "ngForOf", ngForTrackBy: "ngForTrackBy", ngForTemplate: "ngForTemplate" } });
    return NgForOf;
}());
export { NgForOf };
/*@__PURE__*/ i0.ɵsetClassMetadata(NgForOf, [{
        type: Directive,
        args: [{ selector: '[ngFor][ngForOf]' }]
    }], function () { return [{
        type: ViewContainerRef
    }, {
        type: TemplateRef
    }, {
        type: IterableDiffers
    }]; }, { ngForOf: [{
            type: Input
        }], ngForTrackBy: [{
            type: Input
        }], ngForTemplate: [{
            type: Input
        }] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQW9CLFNBQVMsRUFBNEIsS0FBSyxFQUF5RCxlQUFlLEVBQWMsV0FBVyxFQUFtQixnQkFBZ0IsRUFBYyxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBRXZQOztHQUVHO0FBQ0g7SUFDRSx3QkFDVyxTQUFZLEVBQVMsT0FBc0IsRUFBUyxLQUFhLEVBQ2pFLEtBQWE7UUFEYixjQUFTLEdBQVQsU0FBUyxDQUFHO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDakUsVUFBSyxHQUFMLEtBQUssQ0FBUTtJQUFHLENBQUM7SUFFNUIsc0JBQUksaUNBQUs7YUFBVCxjQUF1QixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFakQsc0JBQUksZ0NBQUk7YUFBUixjQUFzQixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUU3RCxzQkFBSSxnQ0FBSTthQUFSLGNBQXNCLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFcEQsc0JBQUksK0JBQUc7YUFBUCxjQUFxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQzNDLHFCQUFDO0FBQUQsQ0FBQyxBQVpELElBWUM7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUFPLElBQUksQ0FBQztBQUNyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmLCBEaXJlY3RpdmUsIERvQ2hlY2ssIEVtYmVkZGVkVmlld1JlZiwgSW5wdXQsIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLCBJdGVyYWJsZUNoYW5nZXMsIEl0ZXJhYmxlRGlmZmVyLCBJdGVyYWJsZURpZmZlcnMsIE5nSXRlcmFibGUsIFRlbXBsYXRlUmVmLCBUcmFja0J5RnVuY3Rpb24sIFZpZXdDb250YWluZXJSZWYsIGZvcndhcmRSZWYsIGlzRGV2TW9kZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdGb3JPZkNvbnRleHQ8VD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyAkaW1wbGljaXQ6IFQsIHB1YmxpYyBuZ0Zvck9mOiBOZ0l0ZXJhYmxlPFQ+LCBwdWJsaWMgaW5kZXg6IG51bWJlcixcbiAgICAgIHB1YmxpYyBjb3VudDogbnVtYmVyKSB7fVxuXG4gIGdldCBmaXJzdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaW5kZXggPT09IDA7IH1cblxuICBnZXQgbGFzdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaW5kZXggPT09IHRoaXMuY291bnQgLSAxOyB9XG5cbiAgZ2V0IGV2ZW4oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmluZGV4ICUgMiA9PT0gMDsgfVxuXG4gIGdldCBvZGQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5ldmVuOyB9XG59XG5cbi8qKlxuICogVGhlIGBOZ0Zvck9mYCBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIGEgdGVtcGxhdGUgb25jZSBwZXIgaXRlbSBmcm9tIGFuIGl0ZXJhYmxlLiBUaGUgY29udGV4dFxuICogZm9yIGVhY2ggaW5zdGFudGlhdGVkIHRlbXBsYXRlIGluaGVyaXRzIGZyb20gdGhlIG91dGVyIGNvbnRleHQgd2l0aCB0aGUgZ2l2ZW4gbG9vcCB2YXJpYWJsZVxuICogc2V0IHRvIHRoZSBjdXJyZW50IGl0ZW0gZnJvbSB0aGUgaXRlcmFibGUuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgTG9jYWwgVmFyaWFibGVzXG4gKlxuICogYE5nRm9yT2ZgIHByb3ZpZGVzIHNldmVyYWwgZXhwb3J0ZWQgdmFsdWVzIHRoYXQgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzOlxuICpcbiAqIC0gYCRpbXBsaWNpdDogVGA6IFRoZSB2YWx1ZSBvZiB0aGUgaW5kaXZpZHVhbCBpdGVtcyBpbiB0aGUgaXRlcmFibGUgKGBuZ0Zvck9mYCkuXG4gKiAtIGBuZ0Zvck9mOiBOZ0l0ZXJhYmxlPFQ+YDogVGhlIHZhbHVlIG9mIHRoZSBpdGVyYWJsZSBleHByZXNzaW9uLiBVc2VmdWwgd2hlbiB0aGUgZXhwcmVzc2lvbiBpc1xuICogbW9yZSBjb21wbGV4IHRoZW4gYSBwcm9wZXJ0eSBhY2Nlc3MsIGZvciBleGFtcGxlIHdoZW4gdXNpbmcgdGhlIGFzeW5jIHBpcGUgKGB1c2VyU3RyZWFtcyB8XG4gKiBhc3luY2ApLlxuICogLSBgaW5kZXg6IG51bWJlcmA6IFRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGZpcnN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGxhc3Q6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaXMgdGhlIGxhc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBldmVuOiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGhhcyBhbiBldmVuIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYG9kZDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gb2RkIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiBgYGBcbiAqIDxsaSAqbmdGb3I9XCJsZXQgdXNlciBvZiB1c2VyT2JzZXJ2YWJsZSB8IGFzeW5jIGFzIHVzZXJzOyBpbmRleCBhcyBpOyBmaXJzdCBhcyBpc0ZpcnN0XCI+XG4gKiAgICB7e2l9fS97e3VzZXJzLmxlbmd0aH19LiB7e3VzZXJ9fSA8c3BhbiAqbmdJZj1cImlzRmlyc3RcIj5kZWZhdWx0PC9zcGFuPlxuICogPC9saT5cbiAqIGBgYFxuICpcbiAqICMjIyBDaGFuZ2UgUHJvcGFnYXRpb25cbiAqXG4gKiBXaGVuIHRoZSBjb250ZW50cyBvZiB0aGUgaXRlcmF0b3IgY2hhbmdlcywgYE5nRm9yT2ZgIG1ha2VzIHRoZSBjb3JyZXNwb25kaW5nIGNoYW5nZXMgdG8gdGhlIERPTTpcbiAqXG4gKiAqIFdoZW4gYW4gaXRlbSBpcyBhZGRlZCwgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIHRlbXBsYXRlIGlzIGFkZGVkIHRvIHRoZSBET00uXG4gKiAqIFdoZW4gYW4gaXRlbSBpcyByZW1vdmVkLCBpdHMgdGVtcGxhdGUgaW5zdGFuY2UgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00uXG4gKiAqIFdoZW4gaXRlbXMgYXJlIHJlb3JkZXJlZCwgdGhlaXIgcmVzcGVjdGl2ZSB0ZW1wbGF0ZXMgYXJlIHJlb3JkZXJlZCBpbiB0aGUgRE9NLlxuICogKiBPdGhlcndpc2UsIHRoZSBET00gZWxlbWVudCBmb3IgdGhhdCBpdGVtIHdpbGwgcmVtYWluIHRoZSBzYW1lLlxuICpcbiAqIEFuZ3VsYXIgdXNlcyBvYmplY3QgaWRlbnRpdHkgdG8gdHJhY2sgaW5zZXJ0aW9ucyBhbmQgZGVsZXRpb25zIHdpdGhpbiB0aGUgaXRlcmF0b3IgYW5kIHJlcHJvZHVjZVxuICogdGhvc2UgY2hhbmdlcyBpbiB0aGUgRE9NLiBUaGlzIGhhcyBpbXBvcnRhbnQgaW1wbGljYXRpb25zIGZvciBhbmltYXRpb25zIGFuZCBhbnkgc3RhdGVmdWxcbiAqIGNvbnRyb2xzIChzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB3aGljaCBhY2NlcHQgdXNlciBpbnB1dCkgdGhhdCBhcmUgcHJlc2VudC4gSW5zZXJ0ZWQgcm93cyBjYW5cbiAqIGJlIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZVxuICogc3VjaCBhcyB1c2VyIGlucHV0LlxuICpcbiAqIEl0IGlzIHBvc3NpYmxlIGZvciB0aGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgdG8gY2hhbmdlIHdoaWxlIHRoZSBkYXRhIGRvZXMgbm90LlxuICogVGhpcyBjYW4gaGFwcGVuLCBmb3IgZXhhbXBsZSwgaWYgdGhlIGl0ZXJhdG9yIHByb2R1Y2VkIGZyb20gYW4gUlBDIHRvIHRoZSBzZXJ2ZXIsIGFuZCB0aGF0XG4gKiBSUEMgaXMgcmUtcnVuLiBFdmVuIGlmIHRoZSBkYXRhIGhhc24ndCBjaGFuZ2VkLCB0aGUgc2Vjb25kIHJlc3BvbnNlIHdpbGwgcHJvZHVjZSBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciB3aWxsIHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS4gVGhpcyBpcyBhbiBleHBlbnNpdmUgb3BlcmF0aW9uIGFuZCBzaG91bGRcbiAqIGJlIGF2b2lkZWQgaWYgcG9zc2libGUuXG4gKlxuICogVG8gY3VzdG9taXplIHRoZSBkZWZhdWx0IHRyYWNraW5nIGFsZ29yaXRobSwgYE5nRm9yT2ZgIHN1cHBvcnRzIGB0cmFja0J5YCBvcHRpb24uXG4gKiBgdHJhY2tCeWAgdGFrZXMgYSBmdW5jdGlvbiB3aGljaCBoYXMgdHdvIGFyZ3VtZW50czogYGluZGV4YCBhbmQgYGl0ZW1gLlxuICogSWYgYHRyYWNrQnlgIGlzIGdpdmVuLCBBbmd1bGFyIHRyYWNrcyBjaGFuZ2VzIGJ5IHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uLlxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiAtIGA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXM7IGluZGV4IGFzIGk7IHRyYWNrQnk6IHRyYWNrQnlGblwiPi4uLjwvbGk+YFxuICpcbiAqIFdpdGggYDxuZy10ZW1wbGF0ZT5gIGVsZW1lbnQ6XG4gKlxuICogYGBgXG4gKiA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIiBsZXQtaT1cImluZGV4XCIgW25nRm9yVHJhY2tCeV09XCJ0cmFja0J5Rm5cIj5cbiAqICAgPGxpPi4uLjwvbGk+XG4gKiA8L25nLXRlbXBsYXRlPlxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTZWUgYSBbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9LVnVYeERwMHFpbkdEeW8zMDdRVz9wPXByZXZpZXcpIGZvciBhIG1vcmUgZGV0YWlsZWRcbiAqIGV4YW1wbGUuXG4gKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0Zvcl1bbmdGb3JPZl0nfSlcbmV4cG9ydCBjbGFzcyBOZ0Zvck9mPFQ+IGltcGxlbWVudHMgRG9DaGVjayB7XG4gIEBJbnB1dCgpXG4gIHNldCBuZ0Zvck9mKG5nRm9yT2Y6IE5nSXRlcmFibGU8VD4pIHtcbiAgICB0aGlzLl9uZ0Zvck9mID0gbmdGb3JPZjtcbiAgICB0aGlzLl9uZ0Zvck9mRGlydHkgPSB0cnVlO1xuICB9XG4gIEBJbnB1dCgpXG4gIHNldCBuZ0ZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xuICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gVE9ETyh2aWNiKTogdXNlIGEgbG9nIHNlcnZpY2Ugb25jZSB0aGVyZSBpcyBhIHB1YmxpYyBvbmUgYXZhaWxhYmxlXG4gICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXG4gICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl90cmFja0J5Rm4gPSBmbjtcbiAgfVxuXG4gIGdldCBuZ0ZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHsgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjsgfVxuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9uZ0Zvck9mICE6IE5nSXRlcmFibGU8VD47XG4gIHByaXZhdGUgX25nRm9yT2ZEaXJ0eTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX2RpZmZlcjogSXRlcmFibGVEaWZmZXI8VD58bnVsbCA9IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF90cmFja0J5Rm4gITogVHJhY2tCeUZ1bmN0aW9uPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQ+PixcbiAgICAgIHByaXZhdGUgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycykge31cblxuICBASW5wdXQoKVxuICBzZXQgbmdGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7XG4gICAgLy8gVE9ETyhUUzIuMSk6IG1ha2UgVGVtcGxhdGVSZWY8UGFydGlhbDxOZ0ZvclJvd09mPFQ+Pj4gb25jZSB3ZSBtb3ZlIHRvIFRTIHYyLjFcbiAgICAvLyBUaGUgY3VycmVudCB0eXBlIGlzIHRvbyByZXN0cmljdGl2ZTsgYSB0ZW1wbGF0ZSB0aGF0IGp1c3QgdXNlcyBpbmRleCwgZm9yIGV4YW1wbGUsXG4gICAgLy8gc2hvdWxkIGJlIGFjY2VwdGFibGUuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbmdGb3JPZkRpcnR5KSB7XG4gICAgICB0aGlzLl9uZ0Zvck9mRGlydHkgPSBmYWxzZTtcbiAgICAgIC8vIFJlYWN0IG9uIG5nRm9yT2YgY2hhbmdlcyBvbmx5IG9uY2UgYWxsIGlucHV0cyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWRcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fbmdGb3JPZjtcbiAgICAgIGlmICghdGhpcy5fZGlmZmVyICYmIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5uZ0ZvclRyYWNrQnkpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHt2YWx1ZX0nIG9mIHR5cGUgJyR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodmFsdWUpfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMgc3VjaCBhcyBBcnJheXMuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX2RpZmZlcikge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nRm9yT2YpO1xuICAgICAgaWYgKGNoYW5nZXMpIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XG4gICAgY29uc3QgaW5zZXJ0VHVwbGVzOiBSZWNvcmRWaWV3VHVwbGU8VD5bXSA9IFtdO1xuICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbihcbiAgICAgICAgKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgIGlmIChpdGVtLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuX3ZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlLCBuZXcgTmdGb3JPZkNvbnRleHQ8VD4obnVsbCAhLCB0aGlzLl9uZ0Zvck9mLCAtMSwgLTEpLCBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgdHVwbGUgPSBuZXcgUmVjb3JkVmlld1R1cGxlPFQ+KGl0ZW0sIHZpZXcpO1xuICAgICAgICAgICAgaW5zZXJ0VHVwbGVzLnB1c2godHVwbGUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIucmVtb3ZlKGFkanVzdGVkUHJldmlvdXNJbmRleCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLl92aWV3Q29udGFpbmVyLmdldChhZGp1c3RlZFByZXZpb3VzSW5kZXgpICE7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLm1vdmUodmlldywgY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IHR1cGxlID0gbmV3IFJlY29yZFZpZXdUdXBsZShpdGVtLCA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj52aWV3KTtcbiAgICAgICAgICAgIGluc2VydFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnNlcnRUdXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3BlclZpZXdDaGFuZ2UoaW5zZXJ0VHVwbGVzW2ldLnZpZXcsIGluc2VydFR1cGxlc1tpXS5yZWNvcmQpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwLCBpbGVuID0gdGhpcy5fdmlld0NvbnRhaW5lci5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj50aGlzLl92aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC5pbmRleCA9IGk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuY291bnQgPSBpbGVuO1xuICAgICAgdmlld1JlZi5jb250ZXh0Lm5nRm9yT2YgPSB0aGlzLl9uZ0Zvck9mO1xuICAgIH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xuICAgICAgY29uc3Qgdmlld1JlZiA9XG4gICAgICAgICAgPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxUPj4+dGhpcy5fdmlld0NvbnRhaW5lci5nZXQocmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuJGltcGxpY2l0ID0gcmVjb3JkLml0ZW07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9wZXJWaWV3Q2hhbmdlKFxuICAgICAgdmlldzogRW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+PiwgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxhbnk+KSB7XG4gICAgdmlldy5jb250ZXh0LiRpbXBsaWNpdCA9IHJlY29yZC5pdGVtO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBjb250ZXh0IGZvciB0aGUgdGVtcGxhdGUgdGhhdCBgTmdGb3JPZmAgd2lsbCByZW5kZXIuXG4gICAqXG4gICAqIFRoZSBwcmVzZW5jZSBvZiB0aGlzIG1ldGhvZCBpcyBhIHNpZ25hbCB0byB0aGUgSXZ5IHRlbXBsYXRlIHR5cGUgY2hlY2sgY29tcGlsZXIgdGhhdCB0aGVcbiAgICogYE5nRm9yT2ZgIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHJlbmRlcnMgaXRzIHRlbXBsYXRlIHdpdGggYSBzcGVjaWZpYyBjb250ZXh0IHR5cGUuXG4gICAqL1xuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxUPihkaXI6IE5nRm9yT2Y8VD4sIGN0eDogYW55KTogY3R4IGlzIE5nRm9yT2ZDb250ZXh0PFQ+IHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5jbGFzcyBSZWNvcmRWaWV3VHVwbGU8VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjb3JkOiBhbnksIHB1YmxpYyB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVbJ25hbWUnXSB8fCB0eXBlb2YgdHlwZTtcbn1cbiJdfQ==