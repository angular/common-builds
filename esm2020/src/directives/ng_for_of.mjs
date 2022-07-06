/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, ɵRuntimeError as RuntimeError } from '@angular/core';
import * as i0 from "@angular/core";
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;
/**
 * @publicApi
 */
export class NgForOfContext {
    constructor($implicit, ngForOf, index, count) {
        this.$implicit = $implicit;
        this.ngForOf = ngForOf;
        this.index = index;
        this.count = count;
    }
    get first() {
        return this.index === 0;
    }
    get last() {
        return this.index === this.count - 1;
    }
    get even() {
        return this.index % 2 === 0;
    }
    get odd() {
        return !this.even;
    }
}
/**
 * A [structural directive](guide/structural-directives) that renders
 * a template for each item in a collection.
 * The directive is placed on an element, which becomes the parent
 * of the cloned templates.
 *
 * The `ngForOf` directive is generally used in the
 * [shorthand form](guide/structural-directives#asterisk) `*ngFor`.
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
 * on an element](guide/structural-directives#one-per-element).
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
 * - `count: number`: The length of the iterable.
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
export class NgForOf {
    constructor(_viewContainer, _template, _differs) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this._ngForOf = null;
        this._ngForOfDirty = true;
        this._differ = null;
    }
    /**
     * The value of the iterable expression, which can be used as a
     * [template input variable](guide/structural-directives#shorthand).
     */
    set ngForOf(ngForOf) {
        this._ngForOf = ngForOf;
        this._ngForOfDirty = true;
    }
    /**
     * Specifies a custom `TrackByFunction` to compute the identity of items in an iterable.
     *
     * If a custom `TrackByFunction` is not provided, `NgForOf` will use the item's [object
     * identity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
     * as the key.
     *
     * `NgForOf` uses the computed key to associate items in an iterable with DOM elements
     * it produces for these items.
     *
     * A custom `TrackByFunction` is useful to provide good user experience in cases when items in an
     * iterable rendered using `NgForOf` have a natural identifier (for example, custom ID or a
     * primary key), and this iterable could be updated with new object instances that still
     * represent the same underlying entity (for example, when data is re-fetched from the server,
     * and the iterable is recreated and re-rendered, but most of the data is still the same).
     *
     * @see `TrackByFunction`
     */
    set ngForTrackBy(fn) {
        if (NG_DEV_MODE && fn != null && typeof fn !== 'function') {
            // TODO(vicb): use a log service once there is a public one available
            if (console && console.warn) {
                console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/api/common/NgForOf#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }
    get ngForTrackBy() {
        return this._trackByFn;
    }
    /**
     * A reference to the template that is stamped out for each item in the iterable.
     * @see [template reference variable](guide/template-reference-variables)
     */
    set ngForTemplate(value) {
        // TODO(TS2.1): make TemplateRef<Partial<NgForRowOf<T>>> once we move to TS v2.1
        // The current type is too restrictive; a template that just uses index, for example,
        // should be acceptable.
        if (value) {
            this._template = value;
        }
    }
    /**
     * Applies the changes when needed.
     * @nodoc
     */
    ngDoCheck() {
        if (this._ngForOfDirty) {
            this._ngForOfDirty = false;
            // React on ngForOf changes only once all inputs have been initialized
            const value = this._ngForOf;
            if (!this._differ && value) {
                if (NG_DEV_MODE) {
                    try {
                        // CAUTION: this logic is duplicated for production mode below, as the try-catch
                        // is only present in development builds.
                        this._differ = this._differs.find(value).create(this.ngForTrackBy);
                    }
                    catch {
                        let errorMessage = `Cannot find a differ supporting object '${value}' of type '` +
                            `${getTypeName(value)}'. NgFor only supports binding to Iterables, such as Arrays.`;
                        if (typeof value === 'object') {
                            errorMessage += ' Did you mean to use the keyvalue pipe?';
                        }
                        throw new RuntimeError(-2200 /* RuntimeErrorCode.NG_FOR_MISSING_DIFFER */, errorMessage);
                    }
                }
                else {
                    // CAUTION: this logic is duplicated for development mode above, as the try-catch
                    // is only present in development builds.
                    this._differ = this._differs.find(value).create(this.ngForTrackBy);
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
        const viewContainer = this._viewContainer;
        changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
            if (item.previousIndex == null) {
                // NgForOf is never "null" or "undefined" here because the differ detected
                // that a new item needs to be inserted from the iterable. This implies that
                // there is an iterable value for "_ngForOf".
                viewContainer.createEmbeddedView(this._template, new NgForOfContext(item.item, this._ngForOf, -1, -1), currentIndex === null ? undefined : currentIndex);
            }
            else if (currentIndex == null) {
                viewContainer.remove(adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);
            }
            else if (adjustedPreviousIndex !== null) {
                const view = viewContainer.get(adjustedPreviousIndex);
                viewContainer.move(view, currentIndex);
                applyViewChange(view, item);
            }
        });
        for (let i = 0, ilen = viewContainer.length; i < ilen; i++) {
            const viewRef = viewContainer.get(i);
            const context = viewRef.context;
            context.index = i;
            context.count = ilen;
            context.ngForOf = this._ngForOf;
        }
        changes.forEachIdentityChange((record) => {
            const viewRef = viewContainer.get(record.currentIndex);
            applyViewChange(viewRef, record);
        });
    }
    /**
     * Asserts the correct type of the context for the template that `NgForOf` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `NgForOf` structural directive renders its template with a specific context type.
     */
    static ngTemplateContextGuard(dir, ctx) {
        return true;
    }
}
NgForOf.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.5+sha-ae1264b", ngImport: i0, type: NgForOf, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: i0.IterableDiffers }], target: i0.ɵɵFactoryTarget.Directive });
NgForOf.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.5+sha-ae1264b", type: NgForOf, selector: "[ngFor][ngForOf]", inputs: { ngForOf: "ngForOf", ngForTrackBy: "ngForTrackBy", ngForTemplate: "ngForTemplate" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.5+sha-ae1264b", ngImport: i0, type: NgForOf, decorators: [{
            type: Directive,
            args: [{ selector: '[ngFor][ngForOf]' }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: i0.IterableDiffers }]; }, propDecorators: { ngForOf: [{
                type: Input
            }], ngForTrackBy: [{
                type: Input
            }], ngForTemplate: [{
                type: Input
            }] } });
function applyViewChange(view, record) {
    view.context.$implicit = record.item;
}
function getTypeName(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUE0QixLQUFLLEVBQXlELGVBQWUsRUFBYyxXQUFXLEVBQW1CLGdCQUFnQixFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBSTVPLE1BQU0sV0FBVyxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO0FBRXBFOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFDekIsWUFBbUIsU0FBWSxFQUFTLE9BQVUsRUFBUyxLQUFhLEVBQVMsS0FBYTtRQUEzRSxjQUFTLEdBQVQsU0FBUyxDQUFHO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBRztRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUcsQ0FBQztJQUVsRyxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxJQUFJLEdBQUc7UUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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eXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbWJlZGRlZFZpZXdSZWYsIElucHV0LCBJdGVyYWJsZUNoYW5nZVJlY29yZCwgSXRlcmFibGVDaGFuZ2VzLCBJdGVyYWJsZURpZmZlciwgSXRlcmFibGVEaWZmZXJzLCBOZ0l0ZXJhYmxlLCBUZW1wbGF0ZVJlZiwgVHJhY2tCeUZ1bmN0aW9uLCBWaWV3Q29udGFpbmVyUmVmLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5cbmNvbnN0IE5HX0RFVl9NT0RFID0gdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgISFuZ0Rldk1vZGU7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdGb3JPZkNvbnRleHQ8VCwgVSBleHRlbmRzIE5nSXRlcmFibGU8VD4gPSBOZ0l0ZXJhYmxlPFQ+PiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyAkaW1wbGljaXQ6IFQsIHB1YmxpYyBuZ0Zvck9mOiBVLCBwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGNvdW50OiBudW1iZXIpIHt9XG5cbiAgZ2V0IGZpcnN0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmluZGV4ID09PSAwO1xuICB9XG5cbiAgZ2V0IGxhc3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IHRoaXMuY291bnQgLSAxO1xuICB9XG5cbiAgZ2V0IGV2ZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggJSAyID09PSAwO1xuICB9XG5cbiAgZ2V0IG9kZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuZXZlbjtcbiAgfVxufVxuXG4vKipcbiAqIEEgW3N0cnVjdHVyYWwgZGlyZWN0aXZlXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpIHRoYXQgcmVuZGVyc1xuICogYSB0ZW1wbGF0ZSBmb3IgZWFjaCBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAqIFRoZSBkaXJlY3RpdmUgaXMgcGxhY2VkIG9uIGFuIGVsZW1lbnQsIHdoaWNoIGJlY29tZXMgdGhlIHBhcmVudFxuICogb2YgdGhlIGNsb25lZCB0ZW1wbGF0ZXMuXG4gKlxuICogVGhlIGBuZ0Zvck9mYCBkaXJlY3RpdmUgaXMgZ2VuZXJhbGx5IHVzZWQgaW4gdGhlXG4gKiBbc2hvcnRoYW5kIGZvcm1dKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNhc3RlcmlzaykgYCpuZ0ZvcmAuXG4gKiBJbiB0aGlzIGZvcm0sIHRoZSB0ZW1wbGF0ZSB0byBiZSByZW5kZXJlZCBmb3IgZWFjaCBpdGVyYXRpb24gaXMgdGhlIGNvbnRlbnRcbiAqIG9mIGFuIGFuY2hvciBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgdGhlIHNob3J0aGFuZCBzeW50YXggd2l0aCBzb21lIG9wdGlvbnMsXG4gKiBjb250YWluZWQgaW4gYW4gYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogYGBgXG4gKiA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXM7IGluZGV4IGFzIGk7IHRyYWNrQnk6IHRyYWNrQnlGblwiPi4uLjwvbGk+XG4gKiBgYGBcbiAqXG4gKiBUaGUgc2hvcnRoYW5kIGZvcm0gZXhwYW5kcyBpbnRvIGEgbG9uZyBmb3JtIHRoYXQgdXNlcyB0aGUgYG5nRm9yT2ZgIHNlbGVjdG9yXG4gKiBvbiBhbiBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudC5cbiAqIFRoZSBjb250ZW50IG9mIHRoZSBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudCBpcyB0aGUgYDxsaT5gIGVsZW1lbnQgdGhhdCBoZWxkIHRoZVxuICogc2hvcnQtZm9ybSBkaXJlY3RpdmUuXG4gKlxuICogSGVyZSBpcyB0aGUgZXhwYW5kZWQgdmVyc2lvbiBvZiB0aGUgc2hvcnQtZm9ybSBleGFtcGxlLlxuICpcbiAqIGBgYFxuICogPG5nLXRlbXBsYXRlIG5nRm9yIGxldC1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCIgbGV0LWk9XCJpbmRleFwiIFtuZ0ZvclRyYWNrQnldPVwidHJhY2tCeUZuXCI+XG4gKiAgIDxsaT4uLi48L2xpPlxuICogPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBleHBhbmRzIHRoZSBzaG9ydGhhbmQgc3ludGF4IGFzIGl0IGNvbXBpbGVzIHRoZSB0ZW1wbGF0ZS5cbiAqIFRoZSBjb250ZXh0IGZvciBlYWNoIGVtYmVkZGVkIHZpZXcgaXMgbG9naWNhbGx5IG1lcmdlZCB0byB0aGUgY3VycmVudCBjb21wb25lbnRcbiAqIGNvbnRleHQgYWNjb3JkaW5nIHRvIGl0cyBsZXhpY2FsIHBvc2l0aW9uLlxuICpcbiAqIFdoZW4gdXNpbmcgdGhlIHNob3J0aGFuZCBzeW50YXgsIEFuZ3VsYXIgYWxsb3dzIG9ubHkgW29uZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZVxuICogb24gYW4gZWxlbWVudF0oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzI29uZS1wZXItZWxlbWVudCkuXG4gKiBJZiB5b3Ugd2FudCB0byBpdGVyYXRlIGNvbmRpdGlvbmFsbHksIGZvciBleGFtcGxlLFxuICogcHV0IHRoZSBgKm5nSWZgIG9uIGEgY29udGFpbmVyIGVsZW1lbnQgdGhhdCB3cmFwcyB0aGUgYCpuZ0ZvcmAgZWxlbWVudC5cbiAqIEZvciBmdXRoZXIgZGlzY3Vzc2lvbiwgc2VlXG4gKiBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjb25lLXBlci1lbGVtZW50KS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBMb2NhbCB2YXJpYWJsZXNcbiAqXG4gKiBgTmdGb3JPZmAgcHJvdmlkZXMgZXhwb3J0ZWQgdmFsdWVzIHRoYXQgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzLlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogIGBgYFxuICogPGxpICpuZ0Zvcj1cImxldCB1c2VyIG9mIHVzZXJzOyBpbmRleCBhcyBpOyBmaXJzdCBhcyBpc0ZpcnN0XCI+XG4gKiAgICB7e2l9fS97e3VzZXJzLmxlbmd0aH19LiB7e3VzZXJ9fSA8c3BhbiAqbmdJZj1cImlzRmlyc3RcIj5kZWZhdWx0PC9zcGFuPlxuICogPC9saT5cbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhwb3J0ZWQgdmFsdWVzIGNhbiBiZSBhbGlhc2VkIHRvIGxvY2FsIHZhcmlhYmxlczpcbiAqXG4gKiAtIGAkaW1wbGljaXQ6IFRgOiBUaGUgdmFsdWUgb2YgdGhlIGluZGl2aWR1YWwgaXRlbXMgaW4gdGhlIGl0ZXJhYmxlIChgbmdGb3JPZmApLlxuICogLSBgbmdGb3JPZjogTmdJdGVyYWJsZTxUPmA6IFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbi4gVXNlZnVsIHdoZW4gdGhlIGV4cHJlc3Npb24gaXNcbiAqIG1vcmUgY29tcGxleCB0aGVuIGEgcHJvcGVydHkgYWNjZXNzLCBmb3IgZXhhbXBsZSB3aGVuIHVzaW5nIHRoZSBhc3luYyBwaXBlIChgdXNlclN0cmVhbXMgfFxuICogYXN5bmNgKS5cbiAqIC0gYGluZGV4OiBudW1iZXJgOiBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBjb3VudDogbnVtYmVyYDogVGhlIGxlbmd0aCBvZiB0aGUgaXRlcmFibGUuXG4gKiAtIGBmaXJzdDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBpcyB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBsYXN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgZXZlbjogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gZXZlbiBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBvZGQ6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaGFzIGFuIG9kZCBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKlxuICogIyMjIENoYW5nZSBwcm9wYWdhdGlvblxuICpcbiAqIFdoZW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBpdGVyYXRvciBjaGFuZ2VzLCBgTmdGb3JPZmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHMgdGhhdCBhcmUgcHJlc2VudCwgc3VjaCBhcyBgPGlucHV0PmAgZWxlbWVudHMgdGhhdCBhY2NlcHQgdXNlciBpbnB1dC4gSW5zZXJ0ZWQgcm93cyBjYW5cbiAqIGJlIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZVxuICogc3VjaCBhcyB1c2VyIGlucHV0LlxuICogRm9yIG1vcmUgb24gYW5pbWF0aW9ucywgc2VlIFtUcmFuc2l0aW9ucyBhbmQgVHJpZ2dlcnNdKGd1aWRlL3RyYW5zaXRpb24tYW5kLXRyaWdnZXJzKS5cbiAqXG4gKiBUaGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgY2FuIGNoYW5nZSB3aGlsZSB0aGUgZGF0YSBkb2VzIG5vdC5cbiAqIFRoaXMgY2FuIGhhcHBlbiwgZm9yIGV4YW1wbGUsIGlmIHRoZSBpdGVyYXRvciBpcyBwcm9kdWNlZCBmcm9tIGFuIFJQQyB0byB0aGUgc2VydmVyLCBhbmQgdGhhdFxuICogUlBDIGlzIHJlLXJ1bi4gRXZlbiBpZiB0aGUgZGF0YSBoYXNuJ3QgY2hhbmdlZCwgdGhlIHNlY29uZCByZXNwb25zZSBwcm9kdWNlcyBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciBtdXN0IHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS5cbiAqXG4gKiBUbyBhdm9pZCB0aGlzIGV4cGVuc2l2ZSBvcGVyYXRpb24sIHlvdSBjYW4gY3VzdG9taXplIHRoZSBkZWZhdWx0IHRyYWNraW5nIGFsZ29yaXRobS5cbiAqIGJ5IHN1cHBseWluZyB0aGUgYHRyYWNrQnlgIG9wdGlvbiB0byBgTmdGb3JPZmAuXG4gKiBgdHJhY2tCeWAgdGFrZXMgYSBmdW5jdGlvbiB0aGF0IGhhcyB0d28gYXJndW1lbnRzOiBgaW5kZXhgIGFuZCBgaXRlbWAuXG4gKiBJZiBgdHJhY2tCeWAgaXMgZ2l2ZW4sIEFuZ3VsYXIgdHJhY2tzIGNoYW5nZXMgYnkgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24uXG4gKlxuICogQHNlZSBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nRm9yXVtuZ0Zvck9mXSd9KVxuZXhwb3J0IGNsYXNzIE5nRm9yT2Y8VCwgVSBleHRlbmRzIE5nSXRlcmFibGU8VD4gPSBOZ0l0ZXJhYmxlPFQ+PiBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICAvKipcbiAgICogVGhlIHZhbHVlIG9mIHRoZSBpdGVyYWJsZSBleHByZXNzaW9uLCB3aGljaCBjYW4gYmUgdXNlZCBhcyBhXG4gICAqIFt0ZW1wbGF0ZSBpbnB1dCB2YXJpYWJsZV0oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzI3Nob3J0aGFuZCkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbmdGb3JPZihuZ0Zvck9mOiBVJk5nSXRlcmFibGU8VD58dW5kZWZpbmVkfG51bGwpIHtcbiAgICB0aGlzLl9uZ0Zvck9mID0gbmdGb3JPZjtcbiAgICB0aGlzLl9uZ0Zvck9mRGlydHkgPSB0cnVlO1xuICB9XG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSBjdXN0b20gYFRyYWNrQnlGdW5jdGlvbmAgdG8gY29tcHV0ZSB0aGUgaWRlbnRpdHkgb2YgaXRlbXMgaW4gYW4gaXRlcmFibGUuXG4gICAqXG4gICAqIElmIGEgY3VzdG9tIGBUcmFja0J5RnVuY3Rpb25gIGlzIG5vdCBwcm92aWRlZCwgYE5nRm9yT2ZgIHdpbGwgdXNlIHRoZSBpdGVtJ3MgW29iamVjdFxuICAgKiBpZGVudGl0eV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2lzKVxuICAgKiBhcyB0aGUga2V5LlxuICAgKlxuICAgKiBgTmdGb3JPZmAgdXNlcyB0aGUgY29tcHV0ZWQga2V5IHRvIGFzc29jaWF0ZSBpdGVtcyBpbiBhbiBpdGVyYWJsZSB3aXRoIERPTSBlbGVtZW50c1xuICAgKiBpdCBwcm9kdWNlcyBmb3IgdGhlc2UgaXRlbXMuXG4gICAqXG4gICAqIEEgY3VzdG9tIGBUcmFja0J5RnVuY3Rpb25gIGlzIHVzZWZ1bCB0byBwcm92aWRlIGdvb2QgdXNlciBleHBlcmllbmNlIGluIGNhc2VzIHdoZW4gaXRlbXMgaW4gYW5cbiAgICogaXRlcmFibGUgcmVuZGVyZWQgdXNpbmcgYE5nRm9yT2ZgIGhhdmUgYSBuYXR1cmFsIGlkZW50aWZpZXIgKGZvciBleGFtcGxlLCBjdXN0b20gSUQgb3IgYVxuICAgKiBwcmltYXJ5IGtleSksIGFuZCB0aGlzIGl0ZXJhYmxlIGNvdWxkIGJlIHVwZGF0ZWQgd2l0aCBuZXcgb2JqZWN0IGluc3RhbmNlcyB0aGF0IHN0aWxsXG4gICAqIHJlcHJlc2VudCB0aGUgc2FtZSB1bmRlcmx5aW5nIGVudGl0eSAoZm9yIGV4YW1wbGUsIHdoZW4gZGF0YSBpcyByZS1mZXRjaGVkIGZyb20gdGhlIHNlcnZlcixcbiAgICogYW5kIHRoZSBpdGVyYWJsZSBpcyByZWNyZWF0ZWQgYW5kIHJlLXJlbmRlcmVkLCBidXQgbW9zdCBvZiB0aGUgZGF0YSBpcyBzdGlsbCB0aGUgc2FtZSkuXG4gICAqXG4gICAqIEBzZWUgYFRyYWNrQnlGdW5jdGlvbmBcbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0ZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xuICAgIGlmIChOR19ERVZfTU9ERSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gVE9ETyh2aWNiKTogdXNlIGEgbG9nIHNlcnZpY2Ugb25jZSB0aGVyZSBpcyBhIHB1YmxpYyBvbmUgYXZhaWxhYmxlXG4gICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXG4gICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9hcGkvY29tbW9uL05nRm9yT2YjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl90cmFja0J5Rm4gPSBmbjtcbiAgfVxuXG4gIGdldCBuZ0ZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuO1xuICB9XG5cbiAgcHJpdmF0ZSBfbmdGb3JPZjogVXx1bmRlZmluZWR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX25nRm9yT2ZEaXJ0eTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX2RpZmZlcjogSXRlcmFibGVEaWZmZXI8VD58bnVsbCA9IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF90cmFja0J5Rm4hOiBUcmFja0J5RnVuY3Rpb248VD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgcHJpdmF0ZSBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+PiwgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzKSB7fVxuXG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgdGVtcGxhdGUgdGhhdCBpcyBzdGFtcGVkIG91dCBmb3IgZWFjaCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAgICogQHNlZSBbdGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlXShndWlkZS90ZW1wbGF0ZS1yZWZlcmVuY2UtdmFyaWFibGVzKVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pikge1xuICAgIC8vIFRPRE8oVFMyLjEpOiBtYWtlIFRlbXBsYXRlUmVmPFBhcnRpYWw8TmdGb3JSb3dPZjxUPj4+IG9uY2Ugd2UgbW92ZSB0byBUUyB2Mi4xXG4gICAgLy8gVGhlIGN1cnJlbnQgdHlwZSBpcyB0b28gcmVzdHJpY3RpdmU7IGEgdGVtcGxhdGUgdGhhdCBqdXN0IHVzZXMgaW5kZXgsIGZvciBleGFtcGxlLFxuICAgIC8vIHNob3VsZCBiZSBhY2NlcHRhYmxlLlxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgY2hhbmdlcyB3aGVuIG5lZWRlZC5cbiAgICogQG5vZG9jXG4gICAqL1xuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX25nRm9yT2ZEaXJ0eSkge1xuICAgICAgdGhpcy5fbmdGb3JPZkRpcnR5ID0gZmFsc2U7XG4gICAgICAvLyBSZWFjdCBvbiBuZ0Zvck9mIGNoYW5nZXMgb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX25nRm9yT2Y7XG4gICAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZSkge1xuICAgICAgICBpZiAoTkdfREVWX01PREUpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ0FVVElPTjogdGhpcyBsb2dpYyBpcyBkdXBsaWNhdGVkIGZvciBwcm9kdWN0aW9uIG1vZGUgYmVsb3csIGFzIHRoZSB0cnktY2F0Y2hcbiAgICAgICAgICAgIC8vIGlzIG9ubHkgcHJlc2VudCBpbiBkZXZlbG9wbWVudCBidWlsZHMuXG4gICAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLm5nRm9yVHJhY2tCeSk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnYCArXG4gICAgICAgICAgICAgICAgYCR7Z2V0VHlwZU5hbWUodmFsdWUpfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMsIHN1Y2ggYXMgQXJyYXlzLmA7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgKz0gJyBEaWQgeW91IG1lYW4gdG8gdXNlIHRoZSBrZXl2YWx1ZSBwaXBlPyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFJ1bnRpbWVFcnJvckNvZGUuTkdfRk9SX01JU1NJTkdfRElGRkVSLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDQVVUSU9OOiB0aGlzIGxvZ2ljIGlzIGR1cGxpY2F0ZWQgZm9yIGRldmVsb3BtZW50IG1vZGUgYWJvdmUsIGFzIHRoZSB0cnktY2F0Y2hcbiAgICAgICAgICAvLyBpcyBvbmx5IHByZXNlbnQgaW4gZGV2ZWxvcG1lbnQgYnVpbGRzLlxuICAgICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZSkuY3JlYXRlKHRoaXMubmdGb3JUcmFja0J5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdGb3JPZik7XG4gICAgICBpZiAoY2hhbmdlcykgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8VD4pIHtcbiAgICBjb25zdCB2aWV3Q29udGFpbmVyID0gdGhpcy5fdmlld0NvbnRhaW5lcjtcbiAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oXG4gICAgICAgIChpdGVtOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxUPiwgYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXJ8bnVsbCxcbiAgICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyfG51bGwpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbS5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIE5nRm9yT2YgaXMgbmV2ZXIgXCJudWxsXCIgb3IgXCJ1bmRlZmluZWRcIiBoZXJlIGJlY2F1c2UgdGhlIGRpZmZlciBkZXRlY3RlZFxuICAgICAgICAgICAgLy8gdGhhdCBhIG5ldyBpdGVtIG5lZWRzIHRvIGJlIGluc2VydGVkIGZyb20gdGhlIGl0ZXJhYmxlLiBUaGlzIGltcGxpZXMgdGhhdFxuICAgICAgICAgICAgLy8gdGhlcmUgaXMgYW4gaXRlcmFibGUgdmFsdWUgZm9yIFwiX25nRm9yT2ZcIi5cbiAgICAgICAgICAgIHZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlLCBuZXcgTmdGb3JPZkNvbnRleHQ8VCwgVT4oaXRlbS5pdGVtLCB0aGlzLl9uZ0Zvck9mISwgLTEsIC0xKSxcbiAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXggPT09IG51bGwgPyB1bmRlZmluZWQgOiBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZpZXdDb250YWluZXIucmVtb3ZlKFxuICAgICAgICAgICAgICAgIGFkanVzdGVkUHJldmlvdXNJbmRleCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGFkanVzdGVkUHJldmlvdXNJbmRleCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhZGp1c3RlZFByZXZpb3VzSW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSB2aWV3Q29udGFpbmVyLmdldChhZGp1c3RlZFByZXZpb3VzSW5kZXgpITtcbiAgICAgICAgICAgIHZpZXdDb250YWluZXIubW92ZSh2aWV3LCBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgICAgYXBwbHlWaWV3Q2hhbmdlKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+PiwgaXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwLCBpbGVuID0gdmlld0NvbnRhaW5lci5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pj52aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB2aWV3UmVmLmNvbnRleHQ7XG4gICAgICBjb250ZXh0LmluZGV4ID0gaTtcbiAgICAgIGNvbnRleHQuY291bnQgPSBpbGVuO1xuICAgICAgY29udGV4dC5uZ0Zvck9mID0gdGhpcy5fbmdGb3JPZiE7XG4gICAgfVxuXG4gICAgY2hhbmdlcy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogYW55KSA9PiB7XG4gICAgICBjb25zdCB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4+dmlld0NvbnRhaW5lci5nZXQocmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICBhcHBseVZpZXdDaGFuZ2Uodmlld1JlZiwgcmVjb3JkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoZSBjb3JyZWN0IHR5cGUgb2YgdGhlIGNvbnRleHQgZm9yIHRoZSB0ZW1wbGF0ZSB0aGF0IGBOZ0Zvck9mYCB3aWxsIHJlbmRlci5cbiAgICpcbiAgICogVGhlIHByZXNlbmNlIG9mIHRoaXMgbWV0aG9kIGlzIGEgc2lnbmFsIHRvIHRoZSBJdnkgdGVtcGxhdGUgdHlwZS1jaGVjayBjb21waWxlciB0aGF0IHRoZVxuICAgKiBgTmdGb3JPZmAgc3RydWN0dXJhbCBkaXJlY3RpdmUgcmVuZGVycyBpdHMgdGVtcGxhdGUgd2l0aCBhIHNwZWNpZmljIGNvbnRleHQgdHlwZS5cbiAgICovXG4gIHN0YXRpYyBuZ1RlbXBsYXRlQ29udGV4dEd1YXJkPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+PihkaXI6IE5nRm9yT2Y8VCwgVT4sIGN0eDogYW55KTpcbiAgICAgIGN0eCBpcyBOZ0Zvck9mQ29udGV4dDxULCBVPiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlWaWV3Q2hhbmdlPFQ+KFxuICAgIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxUPj4sIHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8VD4pIHtcbiAgdmlldy5jb250ZXh0LiRpbXBsaWNpdCA9IHJlY29yZC5pdGVtO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlTmFtZSh0eXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xufVxuIl19