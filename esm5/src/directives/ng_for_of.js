/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, isDevMode } from '@angular/core';
/**
 *
 * @template T
 */
var /**
 *
 * @template T
 */
NgForOfContext = /** @class */ (function () {
    function NgForOfContext($implicit, ngForOf, index, count) {
        this.$implicit = $implicit;
        this.ngForOf = ngForOf;
        this.index = index;
        this.count = count;
    }
    Object.defineProperty(NgForOfContext.prototype, "first", {
        get: /**
         * @return {?}
         */
        function () { return this.index === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOfContext.prototype, "last", {
        get: /**
         * @return {?}
         */
        function () { return this.index === this.count - 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOfContext.prototype, "even", {
        get: /**
         * @return {?}
         */
        function () { return this.index % 2 === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForOfContext.prototype, "odd", {
        get: /**
         * @return {?}
         */
        function () { return !this.even; },
        enumerable: true,
        configurable: true
    });
    return NgForOfContext;
}());
/**
 *
 * @template T
 */
export { NgForOfContext };
function NgForOfContext_tsickle_Closure_declarations() {
    /** @type {?} */
    NgForOfContext.prototype.$implicit;
    /** @type {?} */
    NgForOfContext.prototype.ngForOf;
    /** @type {?} */
    NgForOfContext.prototype.index;
    /** @type {?} */
    NgForOfContext.prototype.count;
}
/**
 * The `NgForOf` directive instantiates a template once per item from an iterable. The context
 * for each instantiated template inherits from the outer context with the given loop variable
 * set to the current item from the iterable.
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
 *
 * @template T
 */
var NgForOf = /** @class */ (function () {
    function NgForOf(_viewContainer, _template, _differs) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this._differ = null;
    }
    Object.defineProperty(NgForOf.prototype, "ngForTrackBy", {
        get: /**
         * @return {?}
         */
        function () { return this._trackByFn; },
        set: /**
         * @param {?} fn
         * @return {?}
         */
        function (fn) {
            if (isDevMode() && fn != null && typeof fn !== 'function') {
                // TODO(vicb): use a log service once there is a public one available
                if (/** @type {?} */ (console) && /** @type {?} */ (console.warn)) {
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
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
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
     * @param {?} changes
     * @return {?}
     */
    NgForOf.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if ('ngForOf' in changes) {
            // React on ngForOf changes only once all inputs have been initialized
            var /** @type {?} */ value = changes['ngForOf'].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.ngForTrackBy);
                }
                catch (/** @type {?} */ e) {
                    throw new Error("Cannot find a differ supporting object '" + value + "' of type '" + getTypeNameForDebugging(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
                }
            }
        }
    };
    /**
     * @return {?}
     */
    NgForOf.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        if (this._differ) {
            var /** @type {?} */ changes = this._differ.diff(this.ngForOf);
            if (changes)
                this._applyChanges(changes);
        }
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    NgForOf.prototype._applyChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        var _this = this;
        var /** @type {?} */ insertTuples = [];
        changes.forEachOperation(function (item, adjustedPreviousIndex, currentIndex) {
            if (item.previousIndex == null) {
                var /** @type {?} */ view = _this._viewContainer.createEmbeddedView(_this._template, new NgForOfContext(/** @type {?} */ ((null)), _this.ngForOf, -1, -1), currentIndex);
                var /** @type {?} */ tuple = new RecordViewTuple(item, view);
                insertTuples.push(tuple);
            }
            else if (currentIndex == null) {
                _this._viewContainer.remove(adjustedPreviousIndex);
            }
            else {
                var /** @type {?} */ view = /** @type {?} */ ((_this._viewContainer.get(adjustedPreviousIndex)));
                _this._viewContainer.move(view, currentIndex);
                var /** @type {?} */ tuple = new RecordViewTuple(item, /** @type {?} */ (view));
                insertTuples.push(tuple);
            }
        });
        for (var /** @type {?} */ i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
        for (var /** @type {?} */ i = 0, /** @type {?} */ ilen = this._viewContainer.length; i < ilen; i++) {
            var /** @type {?} */ viewRef = /** @type {?} */ (this._viewContainer.get(i));
            viewRef.context.index = i;
            viewRef.context.count = ilen;
        }
        changes.forEachIdentityChange(function (record) {
            var /** @type {?} */ viewRef = /** @type {?} */ (_this._viewContainer.get(record.currentIndex));
            viewRef.context.$implicit = record.item;
        });
    };
    /**
     * @param {?} view
     * @param {?} record
     * @return {?}
     */
    NgForOf.prototype._perViewChange = /**
     * @param {?} view
     * @param {?} record
     * @return {?}
     */
    function (view, record) {
        view.context.$implicit = record.item;
    };
    NgForOf.decorators = [
        { type: Directive, args: [{ selector: '[ngFor][ngForOf]' },] },
    ];
    /** @nocollapse */
    NgForOf.ctorParameters = function () { return [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: IterableDiffers, },
    ]; };
    NgForOf.propDecorators = {
        "ngForOf": [{ type: Input },],
        "ngForTrackBy": [{ type: Input },],
        "ngForTemplate": [{ type: Input },],
    };
    return NgForOf;
}());
export { NgForOf };
function NgForOf_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    NgForOf.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    NgForOf.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    NgForOf.propDecorators;
    /** @type {?} */
    NgForOf.prototype.ngForOf;
    /** @type {?} */
    NgForOf.prototype._differ;
    /** @type {?} */
    NgForOf.prototype._trackByFn;
    /** @type {?} */
    NgForOf.prototype._viewContainer;
    /** @type {?} */
    NgForOf.prototype._template;
    /** @type {?} */
    NgForOf.prototype._differs;
}
/**
 * @template T
 */
var /**
 * @template T
 */
RecordViewTuple = /** @class */ (function () {
    function RecordViewTuple(record, view) {
        this.record = record;
        this.view = view;
    }
    return RecordViewTuple;
}());
function RecordViewTuple_tsickle_Closure_declarations() {
    /** @type {?} */
    RecordViewTuple.prototype.record;
    /** @type {?} */
    RecordViewTuple.prototype.view;
}
/**
 * @param {?} type
 * @return {?}
 */
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=ng_for_of.js.map