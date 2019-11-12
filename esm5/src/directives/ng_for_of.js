/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, isDevMode } from '@angular/core';
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
 * A [structural directive](guide/structural-directives) that renders
 * a template for each item in a collection.
 * The directive is placed on an element, which becomes the parent
 * of the cloned templates.
 *
 * The `ngForOf` directive is generally used in the
 * [shorthand form](guide/structural-directives#the-asterisk--prefix) `*ngFor`.
 * In this form, the template to be rendered for each iteration is the content
 * of an anchor element containing the directive.
 *
 * The following example shows the shorthand syntax with some options,
 * contained in an `<li>` element.
 *
 * ```
 * <li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>
 * ```
 *
 * The shorthand form expands into a long form that uses the `ngForOf` selector
 * on an `<ng-template>` element.
 * The content of the `<ng-template>` element is the `<li>` element that held the
 * short-form directive.
 *
 * Here is the expanded version of the short-form example.
 *
 * ```
 * <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
 *   <li>...</li>
 * </ng-template>
 * ```
 *
 * Angular automatically expands the shorthand syntax as it compiles the template.
 * The context for each embedded view is logically merged to the current component
 * context according to its lexical position.
 *
 * When using the shorthand syntax, Angular allows only [one structural directive
 * on an element](guide/structural-directives#one-structural-directive-per-host-element).
 * If you want to iterate conditionally, for example,
 * put the `*ngIf` on a container element that wraps the `*ngFor` element.
 * For futher discussion, see
 * [Structural Directives](guide/structural-directives#one-per-element).
 *
 * @usageNotes
 *
 * ### Local variables
 *
 * `NgForOf` provides exported values that can be aliased to local variables.
 * For example:
 *
 *  ```
 * <li *ngFor="let user of users; index as i; first as isFirst">
 *    {{i}}/{{users.length}}. {{user}} <span *ngIf="isFirst">default</span>
 * </li>
 * ```
 *
 * The following exported values can be aliased to local variables:
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
 * ### Change propagation
 *
 * When the contents of the iterator changes, `NgForOf` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls that are present, such as `<input>` elements that accept user input. Inserted rows can
 * be animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state
 * such as user input.
 * For more on animations, see [Transitions and Triggers](guide/transition-and-triggers).
 *
 * The identities of elements in the iterator can change while the data does not.
 * This can happen, for example, if the iterator is produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response produces objects with
 * different identities, and Angular must tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted).
 *
 * To avoid this expensive operation, you can customize the default tracking algorithm.
 * by supplying the `trackBy` option to `NgForOf`.
 * `trackBy` takes a function that has two arguments: `index` and `item`.
 * If `trackBy` is given, Angular tracks changes by the return value of the function.
 *
 * @see [Structural Directives](guide/structural-directives)
 * @ngModule CommonModule
 * @publicApi
 */
var NgForOf = /** @class */ (function () {
    function NgForOf(_viewContainer, _template, _differs) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this._ngForOf = null;
        this._ngForOfDirty = true;
        this._differ = null;
    }
    Object.defineProperty(NgForOf.prototype, "ngForOf", {
        /**
         * The value of the iterable expression, which can be used as a
         * [template input variable](guide/structural-directives#template-input-variable).
         */
        set: function (ngForOf) {
            this._ngForOf = ngForOf;
            this._ngForOfDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOf.prototype, "ngForTrackBy", {
        get: function () { return this._trackByFn; },
        /**
         * A function that defines how to track changes for items in the iterable.
         *
         * When items are added, moved, or removed in the iterable,
         * the directive must re-render the appropriate DOM nodes.
         * To minimize churn in the DOM, only nodes that have changed
         * are re-rendered.
         *
         * By default, the change detector assumes that
         * the object instance identifies the node in the iterable.
         * When this function is supplied, the directive uses
         * the result of calling this function to identify the item node,
         * rather than the identity of the object itself.
         *
         * The function receives two inputs,
         * the iteration index and the node object ID.
         */
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
        /**
         * A reference to the template that is stamped out for each item in the iterable.
         * @see [template reference variable](guide/template-syntax#template-reference-variables--var-)
         */
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
    /**
     * Applies the changes when needed.
     */
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
                    throw new Error("Cannot find a differ supporting object '" + value + "' of type '" + getTypeName(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
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
                // NgForOf is never "null" or "undefined" here because the differ detected
                // that a new item needs to be inserted from the iterable. This implies that
                // there is an iterable value for "_ngForOf".
                var view = _this._viewContainer.createEmbeddedView(_this._template, new NgForOfContext(null, _this._ngForOf, -1, -1), currentIndex === null ? undefined : currentIndex);
                var tuple = new RecordViewTuple(item, view);
                insertTuples.push(tuple);
            }
            else if (currentIndex == null) {
                _this._viewContainer.remove(adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);
            }
            else if (adjustedPreviousIndex !== null) {
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
     * Asserts the correct type of the context for the template that `NgForOf` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `NgForOf` structural directive renders its template with a specific context type.
     */
    NgForOf.ngTemplateContextGuard = function (dir, ctx) {
        return true;
    };
    __decorate([
        Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], NgForOf.prototype, "ngForOf", null);
    __decorate([
        Input(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function])
    ], NgForOf.prototype, "ngForTrackBy", null);
    __decorate([
        Input(),
        __metadata("design:type", TemplateRef),
        __metadata("design:paramtypes", [TemplateRef])
    ], NgForOf.prototype, "ngForTemplate", null);
    NgForOf = __decorate([
        Directive({ selector: '[ngFor][ngForOf]' }),
        __metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
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
function getTypeName(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBNEIsS0FBSyxFQUF5RCxlQUFlLEVBQWMsV0FBVyxFQUFtQixnQkFBZ0IsRUFBYyxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFcE87O0dBRUc7QUFDSDtJQUNFLHdCQUNXLFNBQVksRUFBUyxPQUFzQixFQUFTLEtBQWEsRUFDakUsS0FBYTtRQURiLGNBQVMsR0FBVCxTQUFTLENBQUc7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNqRSxVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUcsQ0FBQztJQUU1QixzQkFBSSxpQ0FBSzthQUFULGNBQXVCLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVqRCxzQkFBSSxnQ0FBSTthQUFSLGNBQXNCLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRTdELHNCQUFJLGdDQUFJO2FBQVIsY0FBc0IsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVwRCxzQkFBSSwrQkFBRzthQUFQLGNBQXFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDM0MscUJBQUM7QUFBRCxDQUFDLEFBWkQsSUFZQzs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0dHO0FBRUg7SUFnREUsaUJBQ1ksY0FBZ0MsRUFBVSxTQUF5QyxFQUNuRixRQUF5QjtRQUR6QixtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFnQztRQUNuRixhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQVI3QixhQUFRLEdBQWlDLElBQUksQ0FBQztRQUM5QyxrQkFBYSxHQUFZLElBQUksQ0FBQztRQUM5QixZQUFPLEdBQTJCLElBQUksQ0FBQztJQU1QLENBQUM7SUE1Q3pDLHNCQUFJLDRCQUFPO1FBTFg7OztXQUdHO2FBRUgsVUFBWSxPQUFxQztZQUMvQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUM1QixDQUFDOzs7T0FBQTtJQW1CRCxzQkFBSSxpQ0FBWTthQVloQixjQUF5QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBOUJsRTs7Ozs7Ozs7Ozs7Ozs7OztXQWdCRzthQUVILFVBQWlCLEVBQXNCO1lBQ3JDLElBQUksU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxPQUFPLEVBQUUsS0FBSyxVQUFVLEVBQUU7Z0JBQ3pELHFFQUFxRTtnQkFDckUsSUFBUyxPQUFPLElBQVMsT0FBTyxDQUFDLElBQUksRUFBRTtvQkFDckMsT0FBTyxDQUFDLElBQUksQ0FDUiw4Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBSTt3QkFDbEUsd0hBQXdILENBQUMsQ0FBQztpQkFDL0g7YUFDRjtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7OztPQUFBO0lBbUJELHNCQUFJLGtDQUFhO1FBTGpCOzs7V0FHRzthQUVILFVBQWtCLEtBQXFDO1lBQ3JELGdGQUFnRjtZQUNoRixxRkFBcUY7WUFDckYsd0JBQXdCO1lBQ3hCLElBQUksS0FBSyxFQUFFO2dCQUNULElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2FBQ3hCO1FBQ0gsQ0FBQzs7O09BQUE7SUFFRDs7T0FFRztJQUNILDJCQUFTLEdBQVQ7UUFDRSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0Isc0VBQXNFO1lBQ3RFLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFFO2dCQUMxQixJQUFJO29CQUNGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDcEU7Z0JBQUMsV0FBTTtvQkFDTixNQUFNLElBQUksS0FBSyxDQUNYLDZDQUEyQyxLQUFLLG1CQUFjLFdBQVcsQ0FBQyxLQUFLLENBQUMsZ0VBQTZELENBQUMsQ0FBQztpQkFDcEo7YUFDRjtTQUNGO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqRCxJQUFJLE9BQU87Z0JBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQztJQUNILENBQUM7SUFFTywrQkFBYSxHQUFyQixVQUFzQixPQUEyQjtRQUFqRCxpQkF5Q0M7UUF4Q0MsSUFBTSxZQUFZLEdBQXlCLEVBQUUsQ0FBQztRQUM5QyxPQUFPLENBQUMsZ0JBQWdCLENBQ3BCLFVBQUMsSUFBK0IsRUFBRSxxQkFBb0MsRUFDckUsWUFBMkI7WUFDMUIsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksRUFBRTtnQkFDOUIsMEVBQTBFO2dCQUMxRSw0RUFBNEU7Z0JBQzVFLDZDQUE2QztnQkFDN0MsSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FDL0MsS0FBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLGNBQWMsQ0FBSSxJQUFNLEVBQUUsS0FBSSxDQUFDLFFBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN0RSxZQUFZLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN0RCxJQUFNLEtBQUssR0FBRyxJQUFJLGVBQWUsQ0FBSSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2pELFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUI7aUJBQU0sSUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO2dCQUMvQixLQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FDdEIscUJBQXFCLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDekU7aUJBQU0sSUFBSSxxQkFBcUIsS0FBSyxJQUFJLEVBQUU7Z0JBQ3pDLElBQU0sSUFBSSxHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFHLENBQUM7Z0JBQzlELEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDN0MsSUFBTSxLQUFLLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFzQyxJQUFJLENBQUMsQ0FBQztnQkFDbEYsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMxQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRVAsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNuRTtRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hFLElBQU0sT0FBTyxHQUF1QyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFVLENBQUM7U0FDM0M7UUFFRCxPQUFPLENBQUMscUJBQXFCLENBQUMsVUFBQyxNQUFXO1lBQ3hDLElBQU0sT0FBTyxHQUMyQixLQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxnQ0FBYyxHQUF0QixVQUNJLElBQXdDLEVBQUUsTUFBaUM7UUFDN0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSw4QkFBc0IsR0FBN0IsVUFBaUMsR0FBZSxFQUFFLEdBQVE7UUFDeEQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBM0lEO1FBREMsS0FBSyxFQUFFOzs7MENBSVA7SUFtQkQ7UUFEQyxLQUFLLEVBQUU7OzsrQ0FXUDtJQW1CRDtRQURDLEtBQUssRUFBRTtrQ0FDaUIsV0FBVzt5Q0FBWCxXQUFXO2dEQU9uQztJQWhFVSxPQUFPO1FBRG5CLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxrQkFBa0IsRUFBQyxDQUFDO3lDQWtEWixnQkFBZ0IsRUFBcUIsV0FBVztZQUN0RCxlQUFlO09BbEQxQixPQUFPLENBa0puQjtJQUFELGNBQUM7Q0FBQSxBQWxKRCxJQWtKQztTQWxKWSxPQUFPO0FBb0pwQjtJQUNFLHlCQUFtQixNQUFXLEVBQVMsSUFBd0M7UUFBNUQsV0FBTSxHQUFOLE1BQU0sQ0FBSztRQUFTLFNBQUksR0FBSixJQUFJLENBQW9DO0lBQUcsQ0FBQztJQUNyRixzQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRUQsU0FBUyxXQUFXLENBQUMsSUFBUztJQUM1QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQztBQUNyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRW1iZWRkZWRWaWV3UmVmLCBJbnB1dCwgSXRlcmFibGVDaGFuZ2VSZWNvcmQsIEl0ZXJhYmxlQ2hhbmdlcywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgTmdJdGVyYWJsZSwgVGVtcGxhdGVSZWYsIFRyYWNrQnlGdW5jdGlvbiwgVmlld0NvbnRhaW5lclJlZiwgZm9yd2FyZFJlZiwgaXNEZXZNb2RlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ0Zvck9mQ29udGV4dDxUPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljICRpbXBsaWNpdDogVCwgcHVibGljIG5nRm9yT2Y6IE5nSXRlcmFibGU8VD4sIHB1YmxpYyBpbmRleDogbnVtYmVyLFxuICAgICAgcHVibGljIGNvdW50OiBudW1iZXIpIHt9XG5cbiAgZ2V0IGZpcnN0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pbmRleCA9PT0gMDsgfVxuXG4gIGdldCBsYXN0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pbmRleCA9PT0gdGhpcy5jb3VudCAtIDE7IH1cblxuICBnZXQgZXZlbigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaW5kZXggJSAyID09PSAwOyB9XG5cbiAgZ2V0IG9kZCgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLmV2ZW47IH1cbn1cblxuLyoqXG4gKiBBIFtzdHJ1Y3R1cmFsIGRpcmVjdGl2ZV0oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzKSB0aGF0IHJlbmRlcnNcbiAqIGEgdGVtcGxhdGUgZm9yIGVhY2ggaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gKiBUaGUgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBlbGVtZW50LCB3aGljaCBiZWNvbWVzIHRoZSBwYXJlbnRcbiAqIG9mIHRoZSBjbG9uZWQgdGVtcGxhdGVzLlxuICpcbiAqIFRoZSBgbmdGb3JPZmAgZGlyZWN0aXZlIGlzIGdlbmVyYWxseSB1c2VkIGluIHRoZVxuICogW3Nob3J0aGFuZCBmb3JtXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjdGhlLWFzdGVyaXNrLS1wcmVmaXgpIGAqbmdGb3JgLlxuICogSW4gdGhpcyBmb3JtLCB0aGUgdGVtcGxhdGUgdG8gYmUgcmVuZGVyZWQgZm9yIGVhY2ggaXRlcmF0aW9uIGlzIHRoZSBjb250ZW50XG4gKiBvZiBhbiBhbmNob3IgZWxlbWVudCBjb250YWluaW5nIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIHRoZSBzaG9ydGhhbmQgc3ludGF4IHdpdGggc29tZSBvcHRpb25zLFxuICogY29udGFpbmVkIGluIGFuIGA8bGk+YCBlbGVtZW50LlxuICpcbiAqIGBgYFxuICogPGxpICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zOyBpbmRleCBhcyBpOyB0cmFja0J5OiB0cmFja0J5Rm5cIj4uLi48L2xpPlxuICogYGBgXG4gKlxuICogVGhlIHNob3J0aGFuZCBmb3JtIGV4cGFuZHMgaW50byBhIGxvbmcgZm9ybSB0aGF0IHVzZXMgdGhlIGBuZ0Zvck9mYCBzZWxlY3RvclxuICogb24gYW4gYDxuZy10ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKiBUaGUgY29udGVudCBvZiB0aGUgYDxuZy10ZW1wbGF0ZT5gIGVsZW1lbnQgaXMgdGhlIGA8bGk+YCBlbGVtZW50IHRoYXQgaGVsZCB0aGVcbiAqIHNob3J0LWZvcm0gZGlyZWN0aXZlLlxuICpcbiAqIEhlcmUgaXMgdGhlIGV4cGFuZGVkIHZlcnNpb24gb2YgdGhlIHNob3J0LWZvcm0gZXhhbXBsZS5cbiAqXG4gKiBgYGBcbiAqIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtaXRlbSBbbmdGb3JPZl09XCJpdGVtc1wiIGxldC1pPVwiaW5kZXhcIiBbbmdGb3JUcmFja0J5XT1cInRyYWNrQnlGblwiPlxuICogICA8bGk+Li4uPC9saT5cbiAqIDwvbmctdGVtcGxhdGU+XG4gKiBgYGBcbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgZXhwYW5kcyB0aGUgc2hvcnRoYW5kIHN5bnRheCBhcyBpdCBjb21waWxlcyB0aGUgdGVtcGxhdGUuXG4gKiBUaGUgY29udGV4dCBmb3IgZWFjaCBlbWJlZGRlZCB2aWV3IGlzIGxvZ2ljYWxseSBtZXJnZWQgdG8gdGhlIGN1cnJlbnQgY29tcG9uZW50XG4gKiBjb250ZXh0IGFjY29yZGluZyB0byBpdHMgbGV4aWNhbCBwb3NpdGlvbi5cbiAqXG4gKiBXaGVuIHVzaW5nIHRoZSBzaG9ydGhhbmQgc3ludGF4LCBBbmd1bGFyIGFsbG93cyBvbmx5IFtvbmUgc3RydWN0dXJhbCBkaXJlY3RpdmVcbiAqIG9uIGFuIGVsZW1lbnRdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNvbmUtc3RydWN0dXJhbC1kaXJlY3RpdmUtcGVyLWhvc3QtZWxlbWVudCkuXG4gKiBJZiB5b3Ugd2FudCB0byBpdGVyYXRlIGNvbmRpdGlvbmFsbHksIGZvciBleGFtcGxlLFxuICogcHV0IHRoZSBgKm5nSWZgIG9uIGEgY29udGFpbmVyIGVsZW1lbnQgdGhhdCB3cmFwcyB0aGUgYCpuZ0ZvcmAgZWxlbWVudC5cbiAqIEZvciBmdXRoZXIgZGlzY3Vzc2lvbiwgc2VlXG4gKiBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjb25lLXBlci1lbGVtZW50KS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBMb2NhbCB2YXJpYWJsZXNcbiAqXG4gKiBgTmdGb3JPZmAgcHJvdmlkZXMgZXhwb3J0ZWQgdmFsdWVzIHRoYXQgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzLlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogIGBgYFxuICogPGxpICpuZ0Zvcj1cImxldCB1c2VyIG9mIHVzZXJzOyBpbmRleCBhcyBpOyBmaXJzdCBhcyBpc0ZpcnN0XCI+XG4gKiAgICB7e2l9fS97e3VzZXJzLmxlbmd0aH19LiB7e3VzZXJ9fSA8c3BhbiAqbmdJZj1cImlzRmlyc3RcIj5kZWZhdWx0PC9zcGFuPlxuICogPC9saT5cbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhwb3J0ZWQgdmFsdWVzIGNhbiBiZSBhbGlhc2VkIHRvIGxvY2FsIHZhcmlhYmxlczpcbiAqXG4gKiAtIGAkaW1wbGljaXQ6IFRgOiBUaGUgdmFsdWUgb2YgdGhlIGluZGl2aWR1YWwgaXRlbXMgaW4gdGhlIGl0ZXJhYmxlIChgbmdGb3JPZmApLlxuICogLSBgbmdGb3JPZjogTmdJdGVyYWJsZTxUPmA6IFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbi4gVXNlZnVsIHdoZW4gdGhlIGV4cHJlc3Npb24gaXNcbiAqIG1vcmUgY29tcGxleCB0aGVuIGEgcHJvcGVydHkgYWNjZXNzLCBmb3IgZXhhbXBsZSB3aGVuIHVzaW5nIHRoZSBhc3luYyBwaXBlIChgdXNlclN0cmVhbXMgfFxuICogYXN5bmNgKS5cbiAqIC0gYGluZGV4OiBudW1iZXJgOiBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBmaXJzdDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBpcyB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBsYXN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgZXZlbjogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gZXZlbiBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBvZGQ6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaGFzIGFuIG9kZCBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKlxuICogIyMjIENoYW5nZSBwcm9wYWdhdGlvblxuICpcbiAqIFdoZW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBpdGVyYXRvciBjaGFuZ2VzLCBgTmdGb3JPZmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHMgdGhhdCBhcmUgcHJlc2VudCwgc3VjaCBhcyBgPGlucHV0PmAgZWxlbWVudHMgdGhhdCBhY2NlcHQgdXNlciBpbnB1dC4gSW5zZXJ0ZWQgcm93cyBjYW5cbiAqIGJlIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZVxuICogc3VjaCBhcyB1c2VyIGlucHV0LlxuICogRm9yIG1vcmUgb24gYW5pbWF0aW9ucywgc2VlIFtUcmFuc2l0aW9ucyBhbmQgVHJpZ2dlcnNdKGd1aWRlL3RyYW5zaXRpb24tYW5kLXRyaWdnZXJzKS5cbiAqXG4gKiBUaGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgY2FuIGNoYW5nZSB3aGlsZSB0aGUgZGF0YSBkb2VzIG5vdC5cbiAqIFRoaXMgY2FuIGhhcHBlbiwgZm9yIGV4YW1wbGUsIGlmIHRoZSBpdGVyYXRvciBpcyBwcm9kdWNlZCBmcm9tIGFuIFJQQyB0byB0aGUgc2VydmVyLCBhbmQgdGhhdFxuICogUlBDIGlzIHJlLXJ1bi4gRXZlbiBpZiB0aGUgZGF0YSBoYXNuJ3QgY2hhbmdlZCwgdGhlIHNlY29uZCByZXNwb25zZSBwcm9kdWNlcyBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciBtdXN0IHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS5cbiAqXG4gKiBUbyBhdm9pZCB0aGlzIGV4cGVuc2l2ZSBvcGVyYXRpb24sIHlvdSBjYW4gY3VzdG9taXplIHRoZSBkZWZhdWx0IHRyYWNraW5nIGFsZ29yaXRobS5cbiAqIGJ5IHN1cHBseWluZyB0aGUgYHRyYWNrQnlgIG9wdGlvbiB0byBgTmdGb3JPZmAuXG4gKiBgdHJhY2tCeWAgdGFrZXMgYSBmdW5jdGlvbiB0aGF0IGhhcyB0d28gYXJndW1lbnRzOiBgaW5kZXhgIGFuZCBgaXRlbWAuXG4gKiBJZiBgdHJhY2tCeWAgaXMgZ2l2ZW4sIEFuZ3VsYXIgdHJhY2tzIGNoYW5nZXMgYnkgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24uXG4gKlxuICogQHNlZSBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nRm9yXVtuZ0Zvck9mXSd9KVxuZXhwb3J0IGNsYXNzIE5nRm9yT2Y8VD4gaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqXG4gICAqIFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbiwgd2hpY2ggY2FuIGJlIHVzZWQgYXMgYVxuICAgKiBbdGVtcGxhdGUgaW5wdXQgdmFyaWFibGVdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyN0ZW1wbGF0ZS1pbnB1dC12YXJpYWJsZSkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbmdGb3JPZihuZ0Zvck9mOiBOZ0l0ZXJhYmxlPFQ+fHVuZGVmaW5lZHxudWxsKSB7XG4gICAgdGhpcy5fbmdGb3JPZiA9IG5nRm9yT2Y7XG4gICAgdGhpcy5fbmdGb3JPZkRpcnR5ID0gdHJ1ZTtcbiAgfVxuICAvKipcbiAgICogQSBmdW5jdGlvbiB0aGF0IGRlZmluZXMgaG93IHRvIHRyYWNrIGNoYW5nZXMgZm9yIGl0ZW1zIGluIHRoZSBpdGVyYWJsZS5cbiAgICpcbiAgICogV2hlbiBpdGVtcyBhcmUgYWRkZWQsIG1vdmVkLCBvciByZW1vdmVkIGluIHRoZSBpdGVyYWJsZSxcbiAgICogdGhlIGRpcmVjdGl2ZSBtdXN0IHJlLXJlbmRlciB0aGUgYXBwcm9wcmlhdGUgRE9NIG5vZGVzLlxuICAgKiBUbyBtaW5pbWl6ZSBjaHVybiBpbiB0aGUgRE9NLCBvbmx5IG5vZGVzIHRoYXQgaGF2ZSBjaGFuZ2VkXG4gICAqIGFyZSByZS1yZW5kZXJlZC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgdGhlIGNoYW5nZSBkZXRlY3RvciBhc3N1bWVzIHRoYXRcbiAgICogdGhlIG9iamVjdCBpbnN0YW5jZSBpZGVudGlmaWVzIHRoZSBub2RlIGluIHRoZSBpdGVyYWJsZS5cbiAgICogV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIHN1cHBsaWVkLCB0aGUgZGlyZWN0aXZlIHVzZXNcbiAgICogdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoaXMgZnVuY3Rpb24gdG8gaWRlbnRpZnkgdGhlIGl0ZW0gbm9kZSxcbiAgICogcmF0aGVyIHRoYW4gdGhlIGlkZW50aXR5IG9mIHRoZSBvYmplY3QgaXRzZWxmLlxuICAgKlxuICAgKiBUaGUgZnVuY3Rpb24gcmVjZWl2ZXMgdHdvIGlucHV0cyxcbiAgICogdGhlIGl0ZXJhdGlvbiBpbmRleCBhbmQgdGhlIG5vZGUgb2JqZWN0IElELlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUT0RPKHZpY2IpOiB1c2UgYSBsb2cgc2VydmljZSBvbmNlIHRoZXJlIGlzIGEgcHVibGljIG9uZSBhdmFpbGFibGVcbiAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcbiAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xuICB9XG5cbiAgZ2V0IG5nRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4geyByZXR1cm4gdGhpcy5fdHJhY2tCeUZuOyB9XG5cbiAgcHJpdmF0ZSBfbmdGb3JPZjogTmdJdGVyYWJsZTxUPnx1bmRlZmluZWR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX25nRm9yT2ZEaXJ0eTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX2RpZmZlcjogSXRlcmFibGVEaWZmZXI8VD58bnVsbCA9IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF90cmFja0J5Rm4gITogVHJhY2tCeUZ1bmN0aW9uPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQ+PixcbiAgICAgIHByaXZhdGUgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycykge31cblxuICAvKipcbiAgICogQSByZWZlcmVuY2UgdG8gdGhlIHRlbXBsYXRlIHRoYXQgaXMgc3RhbXBlZCBvdXQgZm9yIGVhY2ggaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gICAqIEBzZWUgW3RlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZV0oZ3VpZGUvdGVtcGxhdGUtc3ludGF4I3RlbXBsYXRlLXJlZmVyZW5jZS12YXJpYWJsZXMtLXZhci0pXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbmdGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7XG4gICAgLy8gVE9ETyhUUzIuMSk6IG1ha2UgVGVtcGxhdGVSZWY8UGFydGlhbDxOZ0ZvclJvd09mPFQ+Pj4gb25jZSB3ZSBtb3ZlIHRvIFRTIHYyLjFcbiAgICAvLyBUaGUgY3VycmVudCB0eXBlIGlzIHRvbyByZXN0cmljdGl2ZTsgYSB0ZW1wbGF0ZSB0aGF0IGp1c3QgdXNlcyBpbmRleCwgZm9yIGV4YW1wbGUsXG4gICAgLy8gc2hvdWxkIGJlIGFjY2VwdGFibGUuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBjaGFuZ2VzIHdoZW4gbmVlZGVkLlxuICAgKi9cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9uZ0Zvck9mRGlydHkpIHtcbiAgICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IGZhbHNlO1xuICAgICAgLy8gUmVhY3Qgb24gbmdGb3JPZiBjaGFuZ2VzIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9uZ0Zvck9mO1xuICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLm5nRm9yVHJhY2tCeSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZSh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdGb3JPZik7XG4gICAgICBpZiAoY2hhbmdlcykgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8VD4pIHtcbiAgICBjb25zdCBpbnNlcnRUdXBsZXM6IFJlY29yZFZpZXdUdXBsZTxUPltdID0gW107XG4gICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKFxuICAgICAgICAoaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8YW55PiwgYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXIgfCBudWxsLFxuICAgICAgICAgY3VycmVudEluZGV4OiBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBOZ0Zvck9mIGlzIG5ldmVyIFwibnVsbFwiIG9yIFwidW5kZWZpbmVkXCIgaGVyZSBiZWNhdXNlIHRoZSBkaWZmZXIgZGV0ZWN0ZWRcbiAgICAgICAgICAgIC8vIHRoYXQgYSBuZXcgaXRlbSBuZWVkcyB0byBiZSBpbnNlcnRlZCBmcm9tIHRoZSBpdGVyYWJsZS4gVGhpcyBpbXBsaWVzIHRoYXRcbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIGFuIGl0ZXJhYmxlIHZhbHVlIGZvciBcIl9uZ0Zvck9mXCIuXG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcoXG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUsIG5ldyBOZ0Zvck9mQ29udGV4dDxUPihudWxsICEsIHRoaXMuX25nRm9yT2YgISwgLTEsIC0xKSxcbiAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXggPT09IG51bGwgPyB1bmRlZmluZWQgOiBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgdHVwbGUgPSBuZXcgUmVjb3JkVmlld1R1cGxlPFQ+KGl0ZW0sIHZpZXcpO1xuICAgICAgICAgICAgaW5zZXJ0VHVwbGVzLnB1c2godHVwbGUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIucmVtb3ZlKFxuICAgICAgICAgICAgICAgIGFkanVzdGVkUHJldmlvdXNJbmRleCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGFkanVzdGVkUHJldmlvdXNJbmRleCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhZGp1c3RlZFByZXZpb3VzSW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLl92aWV3Q29udGFpbmVyLmdldChhZGp1c3RlZFByZXZpb3VzSW5kZXgpICE7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLm1vdmUodmlldywgY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IHR1cGxlID0gbmV3IFJlY29yZFZpZXdUdXBsZShpdGVtLCA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj52aWV3KTtcbiAgICAgICAgICAgIGluc2VydFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnNlcnRUdXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3BlclZpZXdDaGFuZ2UoaW5zZXJ0VHVwbGVzW2ldLnZpZXcsIGluc2VydFR1cGxlc1tpXS5yZWNvcmQpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwLCBpbGVuID0gdGhpcy5fdmlld0NvbnRhaW5lci5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj50aGlzLl92aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC5pbmRleCA9IGk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuY291bnQgPSBpbGVuO1xuICAgICAgdmlld1JlZi5jb250ZXh0Lm5nRm9yT2YgPSB0aGlzLl9uZ0Zvck9mICE7XG4gICAgfVxuXG4gICAgY2hhbmdlcy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogYW55KSA9PiB7XG4gICAgICBjb25zdCB2aWV3UmVmID1cbiAgICAgICAgICA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj50aGlzLl92aWV3Q29udGFpbmVyLmdldChyZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC4kaW1wbGljaXQgPSByZWNvcmQuaXRlbTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3BlclZpZXdDaGFuZ2UoXG4gICAgICB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+LCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4pIHtcbiAgICB2aWV3LmNvbnRleHQuJGltcGxpY2l0ID0gcmVjb3JkLml0ZW07XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBjb250ZXh0IGZvciB0aGUgdGVtcGxhdGUgdGhhdCBgTmdGb3JPZmAgd2lsbCByZW5kZXIuXG4gICAqXG4gICAqIFRoZSBwcmVzZW5jZSBvZiB0aGlzIG1ldGhvZCBpcyBhIHNpZ25hbCB0byB0aGUgSXZ5IHRlbXBsYXRlIHR5cGUtY2hlY2sgY29tcGlsZXIgdGhhdCB0aGVcbiAgICogYE5nRm9yT2ZgIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHJlbmRlcnMgaXRzIHRlbXBsYXRlIHdpdGggYSBzcGVjaWZpYyBjb250ZXh0IHR5cGUuXG4gICAqL1xuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxUPihkaXI6IE5nRm9yT2Y8VD4sIGN0eDogYW55KTogY3R4IGlzIE5nRm9yT2ZDb250ZXh0PFQ+IHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5jbGFzcyBSZWNvcmRWaWV3VHVwbGU8VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjb3JkOiBhbnksIHB1YmxpYyB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7fVxufVxuXG5mdW5jdGlvbiBnZXRUeXBlTmFtZSh0eXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xufVxuIl19