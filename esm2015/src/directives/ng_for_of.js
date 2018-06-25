/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, isDevMode } from '@angular/core';
export class NgForOfContext {
    constructor($implicit, ngForOf, index, count) {
        this.$implicit = $implicit;
        this.ngForOf = ngForOf;
        this.index = index;
        this.count = count;
    }
    get first() { return this.index === 0; }
    get last() { return this.index === this.count - 1; }
    get even() { return this.index % 2 === 0; }
    get odd() { return !this.even; }
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
 */
let NgForOf = class NgForOf {
    constructor(_viewContainer, _template, _differs) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this._ngForOfDirty = true;
        this._differ = null;
    }
    set ngForOf(ngForOf) {
        this._ngForOf = ngForOf;
        this._ngForOfDirty = true;
    }
    set ngForTrackBy(fn) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            // TODO(vicb): use a log service once there is a public one available
            if (console && console.warn) {
                console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }
    get ngForTrackBy() { return this._trackByFn; }
    set ngForTemplate(value) {
        // TODO(TS2.1): make TemplateRef<Partial<NgForRowOf<T>>> once we move to TS v2.1
        // The current type is too restrictive; a template that just uses index, for example,
        // should be acceptable.
        if (value) {
            this._template = value;
        }
    }
    ngDoCheck() {
        if (this._ngForOfDirty) {
            this._ngForOfDirty = false;
            // React on ngForOf changes only once all inputs have been initialized
            const value = this._ngForOf;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.ngForTrackBy);
                }
                catch (e) {
                    throw new Error(`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
        if (this._differ) {
            const changes = this._differ.diff(this._ngForOf);
            if (changes)
                this._applyChanges(changes);
        }
    }
    _applyChanges(changes) {
        const insertTuples = [];
        changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
            if (item.previousIndex == null) {
                const view = this._viewContainer.createEmbeddedView(this._template, new NgForOfContext(null, this._ngForOf, -1, -1), currentIndex);
                const tuple = new RecordViewTuple(item, view);
                insertTuples.push(tuple);
            }
            else if (currentIndex == null) {
                this._viewContainer.remove(adjustedPreviousIndex);
            }
            else {
                const view = this._viewContainer.get(adjustedPreviousIndex);
                this._viewContainer.move(view, currentIndex);
                const tuple = new RecordViewTuple(item, view);
                insertTuples.push(tuple);
            }
        });
        for (let i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
        for (let i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
            const viewRef = this._viewContainer.get(i);
            viewRef.context.index = i;
            viewRef.context.count = ilen;
        }
        changes.forEachIdentityChange((record) => {
            const viewRef = this._viewContainer.get(record.currentIndex);
            viewRef.context.$implicit = record.item;
        });
    }
    _perViewChange(view, record) {
        view.context.$implicit = record.item;
    }
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
export { NgForOf };
class RecordViewTuple {
    constructor(record, view) {
        this.record = record;
        this.view = view;
    }
}
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFvQixTQUFTLEVBQTRCLEtBQUssRUFBeUQsZUFBZSxFQUFjLFdBQVcsRUFBbUIsZ0JBQWdCLEVBQWMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZQLE1BQU07SUFDSixZQUNXLFNBQVksRUFBUyxPQUFzQixFQUFTLEtBQWEsRUFDakUsS0FBYTtRQURiLGNBQVMsR0FBVCxTQUFTLENBQUc7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNqRSxVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUcsQ0FBQztJQUU1QixJQUFJLEtBQUssS0FBYyxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqRCxJQUFJLElBQUksS0FBYyxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdELElBQUksSUFBSSxLQUFjLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVwRCxJQUFJLEdBQUcsS0FBYyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDMUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUVHO0FBRUgsSUFBYSxPQUFPLEdBQXBCO0lBNEJFLFlBQ1ksY0FBZ0MsRUFBVSxTQUF5QyxFQUNuRixRQUF5QjtRQUR6QixtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7UUFB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LENBQUMsQ0FBQztZQUNyRixPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGNBQWMsQ0FDbEIsSUFBd0MsRUFBRSxNQUFpQztRQUM3RSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3ZDLENBQUM7Q0FDRixDQUFBO0FBcEdDO0lBREMsS0FBSyxFQUFFOzs7c0NBSVA7QUFFRDtJQURDLEtBQUssRUFBRTs7OzJDQVdQO0FBZ0JEO0lBREMsS0FBSyxFQUFFO3NDQUNpQixXQUFXOzZDQUFYLFdBQVc7NENBT25DO0FBeENVLE9BQU87SUFEbkIsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFDLENBQUM7NkNBOEJaLGdCQUFnQixFQUFxQixXQUFXO1FBQ3RELGVBQWU7R0E5QjFCLE9BQU8sQ0FzR25CO1NBdEdZLE9BQU87QUF3R3BCO0lBQ0UsWUFBbUIsTUFBVyxFQUFTLElBQXdDO1FBQTVELFdBQU0sR0FBTixNQUFNLENBQUs7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFvQztJQUFHLENBQUM7Q0FDcEY7QUFFRCxNQUFNLGtDQUFrQyxJQUFTO0lBQy9DLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWYsIERpcmVjdGl2ZSwgRG9DaGVjaywgRW1iZWRkZWRWaWV3UmVmLCBJbnB1dCwgSXRlcmFibGVDaGFuZ2VSZWNvcmQsIEl0ZXJhYmxlQ2hhbmdlcywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgTmdJdGVyYWJsZSwgVGVtcGxhdGVSZWYsIFRyYWNrQnlGdW5jdGlvbiwgVmlld0NvbnRhaW5lclJlZiwgZm9yd2FyZFJlZiwgaXNEZXZNb2RlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNsYXNzIE5nRm9yT2ZDb250ZXh0PFQ+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgJGltcGxpY2l0OiBULCBwdWJsaWMgbmdGb3JPZjogTmdJdGVyYWJsZTxUPiwgcHVibGljIGluZGV4OiBudW1iZXIsXG4gICAgICBwdWJsaWMgY291bnQ6IG51bWJlcikge31cblxuICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmluZGV4ID09PSAwOyB9XG5cbiAgZ2V0IGxhc3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmluZGV4ID09PSB0aGlzLmNvdW50IC0gMTsgfVxuXG4gIGdldCBldmVuKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7IH1cblxuICBnZXQgb2RkKCk6IGJvb2xlYW4geyByZXR1cm4gIXRoaXMuZXZlbjsgfVxufVxuXG4vKipcbiAqIFRoZSBgTmdGb3JPZmAgZGlyZWN0aXZlIGluc3RhbnRpYXRlcyBhIHRlbXBsYXRlIG9uY2UgcGVyIGl0ZW0gZnJvbSBhbiBpdGVyYWJsZS4gVGhlIGNvbnRleHRcbiAqIGZvciBlYWNoIGluc3RhbnRpYXRlZCB0ZW1wbGF0ZSBpbmhlcml0cyBmcm9tIHRoZSBvdXRlciBjb250ZXh0IHdpdGggdGhlIGdpdmVuIGxvb3AgdmFyaWFibGVcbiAqIHNldCB0byB0aGUgY3VycmVudCBpdGVtIGZyb20gdGhlIGl0ZXJhYmxlLlxuICpcbiAqICMjIyBMb2NhbCBWYXJpYWJsZXNcbiAqXG4gKiBgTmdGb3JPZmAgcHJvdmlkZXMgc2V2ZXJhbCBleHBvcnRlZCB2YWx1ZXMgdGhhdCBjYW4gYmUgYWxpYXNlZCB0byBsb2NhbCB2YXJpYWJsZXM6XG4gKlxuICogLSBgJGltcGxpY2l0OiBUYDogVGhlIHZhbHVlIG9mIHRoZSBpbmRpdmlkdWFsIGl0ZW1zIGluIHRoZSBpdGVyYWJsZSAoYG5nRm9yT2ZgKS5cbiAqIC0gYG5nRm9yT2Y6IE5nSXRlcmFibGU8VD5gOiBUaGUgdmFsdWUgb2YgdGhlIGl0ZXJhYmxlIGV4cHJlc3Npb24uIFVzZWZ1bCB3aGVuIHRoZSBleHByZXNzaW9uIGlzXG4gKiBtb3JlIGNvbXBsZXggdGhlbiBhIHByb3BlcnR5IGFjY2VzcywgZm9yIGV4YW1wbGUgd2hlbiB1c2luZyB0aGUgYXN5bmMgcGlwZSAoYHVzZXJTdHJlYW1zIHxcbiAqIGFzeW5jYCkuXG4gKiAtIGBpbmRleDogbnVtYmVyYDogVGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgZmlyc3Q6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaXMgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgbGFzdDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBpcyB0aGUgbGFzdCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGV2ZW46IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaGFzIGFuIGV2ZW4gaW5kZXggaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgb2RkOiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGhhcyBhbiBvZGQgaW5kZXggaW4gdGhlIGl0ZXJhYmxlLlxuICpcbiAqIGBgYFxuICogPGxpICpuZ0Zvcj1cImxldCB1c2VyIG9mIHVzZXJPYnNlcnZhYmxlIHwgYXN5bmMgYXMgdXNlcnM7IGluZGV4IGFzIGk7IGZpcnN0IGFzIGlzRmlyc3RcIj5cbiAqICAgIHt7aX19L3t7dXNlcnMubGVuZ3RofX0uIHt7dXNlcn19IDxzcGFuICpuZ0lmPVwiaXNGaXJzdFwiPmRlZmF1bHQ8L3NwYW4+XG4gKiA8L2xpPlxuICogYGBgXG4gKlxuICogIyMjIENoYW5nZSBQcm9wYWdhdGlvblxuICpcbiAqIFdoZW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBpdGVyYXRvciBjaGFuZ2VzLCBgTmdGb3JPZmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKiAqIE90aGVyd2lzZSwgdGhlIERPTSBlbGVtZW50IGZvciB0aGF0IGl0ZW0gd2lsbCByZW1haW4gdGhlIHNhbWUuXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHMgKHN1Y2ggYXMgYDxpbnB1dD5gIGVsZW1lbnRzIHdoaWNoIGFjY2VwdCB1c2VyIGlucHV0KSB0aGF0IGFyZSBwcmVzZW50LiBJbnNlcnRlZCByb3dzIGNhblxuICogYmUgYW5pbWF0ZWQgaW4sIGRlbGV0ZWQgcm93cyBjYW4gYmUgYW5pbWF0ZWQgb3V0LCBhbmQgdW5jaGFuZ2VkIHJvd3MgcmV0YWluIGFueSB1bnNhdmVkIHN0YXRlXG4gKiBzdWNoIGFzIHVzZXIgaW5wdXQuXG4gKlxuICogSXQgaXMgcG9zc2libGUgZm9yIHRoZSBpZGVudGl0aWVzIG9mIGVsZW1lbnRzIGluIHRoZSBpdGVyYXRvciB0byBjaGFuZ2Ugd2hpbGUgdGhlIGRhdGEgZG9lcyBub3QuXG4gKiBUaGlzIGNhbiBoYXBwZW4sIGZvciBleGFtcGxlLCBpZiB0aGUgaXRlcmF0b3IgcHJvZHVjZWQgZnJvbSBhbiBSUEMgdG8gdGhlIHNlcnZlciwgYW5kIHRoYXRcbiAqIFJQQyBpcyByZS1ydW4uIEV2ZW4gaWYgdGhlIGRhdGEgaGFzbid0IGNoYW5nZWQsIHRoZSBzZWNvbmQgcmVzcG9uc2Ugd2lsbCBwcm9kdWNlIG9iamVjdHMgd2l0aFxuICogZGlmZmVyZW50IGlkZW50aXRpZXMsIGFuZCBBbmd1bGFyIHdpbGwgdGVhciBkb3duIHRoZSBlbnRpcmUgRE9NIGFuZCByZWJ1aWxkIGl0IChhcyBpZiBhbGwgb2xkXG4gKiBlbGVtZW50cyB3ZXJlIGRlbGV0ZWQgYW5kIGFsbCBuZXcgZWxlbWVudHMgaW5zZXJ0ZWQpLiBUaGlzIGlzIGFuIGV4cGVuc2l2ZSBvcGVyYXRpb24gYW5kIHNob3VsZFxuICogYmUgYXZvaWRlZCBpZiBwb3NzaWJsZS5cbiAqXG4gKiBUbyBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJhY2tpbmcgYWxnb3JpdGhtLCBgTmdGb3JPZmAgc3VwcG9ydHMgYHRyYWNrQnlgIG9wdGlvbi5cbiAqIGB0cmFja0J5YCB0YWtlcyBhIGZ1bmN0aW9uIHdoaWNoIGhhcyB0d28gYXJndW1lbnRzOiBgaW5kZXhgIGFuZCBgaXRlbWAuXG4gKiBJZiBgdHJhY2tCeWAgaXMgZ2l2ZW4sIEFuZ3VsYXIgdHJhY2tzIGNoYW5nZXMgYnkgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24uXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgaW5kZXggYXMgaTsgdHJhY2tCeTogdHJhY2tCeUZuXCI+Li4uPC9saT5gXG4gKlxuICogV2l0aCBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudDpcbiAqXG4gKiBgYGBcbiAqIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtaXRlbSBbbmdGb3JPZl09XCJpdGVtc1wiIGxldC1pPVwiaW5kZXhcIiBbbmdGb3JUcmFja0J5XT1cInRyYWNrQnlGblwiPlxuICogICA8bGk+Li4uPC9saT5cbiAqIDwvbmctdGVtcGxhdGU+XG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFNlZSBhIFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tWdVh4RHAwcWluR0R5bzMwN1FXP3A9cHJldmlldykgZm9yIGEgbW9yZSBkZXRhaWxlZFxuICogZXhhbXBsZS5cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0Zvcl1bbmdGb3JPZl0nfSlcbmV4cG9ydCBjbGFzcyBOZ0Zvck9mPFQ+IGltcGxlbWVudHMgRG9DaGVjayB7XG4gIEBJbnB1dCgpXG4gIHNldCBuZ0Zvck9mKG5nRm9yT2Y6IE5nSXRlcmFibGU8VD4pIHtcbiAgICB0aGlzLl9uZ0Zvck9mID0gbmdGb3JPZjtcbiAgICB0aGlzLl9uZ0Zvck9mRGlydHkgPSB0cnVlO1xuICB9XG4gIEBJbnB1dCgpXG4gIHNldCBuZ0ZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xuICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gVE9ETyh2aWNiKTogdXNlIGEgbG9nIHNlcnZpY2Ugb25jZSB0aGVyZSBpcyBhIHB1YmxpYyBvbmUgYXZhaWxhYmxlXG4gICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXG4gICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl90cmFja0J5Rm4gPSBmbjtcbiAgfVxuXG4gIGdldCBuZ0ZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHsgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjsgfVxuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9uZ0Zvck9mICE6IE5nSXRlcmFibGU8VD47XG4gIHByaXZhdGUgX25nRm9yT2ZEaXJ0eTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX2RpZmZlcjogSXRlcmFibGVEaWZmZXI8VD58bnVsbCA9IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF90cmFja0J5Rm4gITogVHJhY2tCeUZ1bmN0aW9uPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQ+PixcbiAgICAgIHByaXZhdGUgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycykge31cblxuICBASW5wdXQoKVxuICBzZXQgbmdGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7XG4gICAgLy8gVE9ETyhUUzIuMSk6IG1ha2UgVGVtcGxhdGVSZWY8UGFydGlhbDxOZ0ZvclJvd09mPFQ+Pj4gb25jZSB3ZSBtb3ZlIHRvIFRTIHYyLjFcbiAgICAvLyBUaGUgY3VycmVudCB0eXBlIGlzIHRvbyByZXN0cmljdGl2ZTsgYSB0ZW1wbGF0ZSB0aGF0IGp1c3QgdXNlcyBpbmRleCwgZm9yIGV4YW1wbGUsXG4gICAgLy8gc2hvdWxkIGJlIGFjY2VwdGFibGUuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbmdGb3JPZkRpcnR5KSB7XG4gICAgICB0aGlzLl9uZ0Zvck9mRGlydHkgPSBmYWxzZTtcbiAgICAgIC8vIFJlYWN0IG9uIG5nRm9yT2YgY2hhbmdlcyBvbmx5IG9uY2UgYWxsIGlucHV0cyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWRcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fbmdGb3JPZjtcbiAgICAgIGlmICghdGhpcy5fZGlmZmVyICYmIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5uZ0ZvclRyYWNrQnkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7dmFsdWV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHZhbHVlKX0nLiBOZ0ZvciBvbmx5IHN1cHBvcnRzIGJpbmRpbmcgdG8gSXRlcmFibGVzIHN1Y2ggYXMgQXJyYXlzLmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9kaWZmZXIpIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9uZ0Zvck9mKTtcbiAgICAgIGlmIChjaGFuZ2VzKSB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxUPikge1xuICAgIGNvbnN0IGluc2VydFR1cGxlczogUmVjb3JkVmlld1R1cGxlPFQ+W10gPSBbXTtcbiAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oXG4gICAgICAgIChpdGVtOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxhbnk+LCBhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbS5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZSwgbmV3IE5nRm9yT2ZDb250ZXh0PFQ+KG51bGwgISwgdGhpcy5fbmdGb3JPZiwgLTEsIC0xKSwgY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IHR1cGxlID0gbmV3IFJlY29yZFZpZXdUdXBsZTxUPihpdGVtLCB2aWV3KTtcbiAgICAgICAgICAgIGluc2VydFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLnJlbW92ZShhZGp1c3RlZFByZXZpb3VzSW5kZXgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5nZXQoYWRqdXN0ZWRQcmV2aW91c0luZGV4KSAhO1xuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5tb3ZlKHZpZXcsIGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgICBjb25zdCB0dXBsZSA9IG5ldyBSZWNvcmRWaWV3VHVwbGUoaXRlbSwgPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxUPj4+dmlldyk7XG4gICAgICAgICAgICBpbnNlcnRUdXBsZXMucHVzaCh0dXBsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zZXJ0VHVwbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9wZXJWaWV3Q2hhbmdlKGluc2VydFR1cGxlc1tpXS52aWV3LCBpbnNlcnRUdXBsZXNbaV0ucmVjb3JkKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgaWxlbiA9IHRoaXMuX3ZpZXdDb250YWluZXIubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICBjb25zdCB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxUPj4+dGhpcy5fdmlld0NvbnRhaW5lci5nZXQoaSk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuaW5kZXggPSBpO1xuICAgICAgdmlld1JlZi5jb250ZXh0LmNvdW50ID0gaWxlbjtcbiAgICB9XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPVxuICAgICAgICAgIDxFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+PnRoaXMuX3ZpZXdDb250YWluZXIuZ2V0KHJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgdmlld1JlZi5jb250ZXh0LiRpbXBsaWNpdCA9IHJlY29yZC5pdGVtO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGVyVmlld0NoYW5nZShcbiAgICAgIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxUPj4sIHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8YW55Pikge1xuICAgIHZpZXcuY29udGV4dC4kaW1wbGljaXQgPSByZWNvcmQuaXRlbTtcbiAgfVxufVxuXG5jbGFzcyBSZWNvcmRWaWV3VHVwbGU8VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjb3JkOiBhbnksIHB1YmxpYyB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVbJ25hbWUnXSB8fCB0eXBlb2YgdHlwZTtcbn1cbiJdfQ==