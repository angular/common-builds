/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, ɵRuntimeError as RuntimeError, } from '@angular/core';
import * as i0 from "@angular/core";
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
 * A [structural directive](guide/directives/structural-directives) that renders
 * a template for each item in a collection.
 * The directive is placed on an element, which becomes the parent
 * of the cloned templates.
 *
 * The `ngForOf` directive is generally used in the
 * [shorthand form](guide/directives/structural-directives#asterisk) `*ngFor`.
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
 * on an element](guide/directives/structural-directives#one-per-element).
 * If you want to iterate conditionally, for example,
 * put the `*ngIf` on a container element that wraps the `*ngFor` element.
 * For further discussion, see
 * [Structural Directives](guide/directives/structural-directives#one-per-element).
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
 * For more on animations, see [Transitions and Triggers](guide/animations/transition-and-triggers).
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
 * @see [Structural Directives](guide/directives/structural-directives)
 * @ngModule CommonModule
 * @publicApi
 */
export class NgForOf {
    /**
     * The value of the iterable expression, which can be used as a
     * [template input variable](guide/directives/structural-directives#shorthand).
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
     * @see {@link TrackByFunction}
     */
    set ngForTrackBy(fn) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && fn != null && typeof fn !== 'function') {
            console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                `See https://angular.io/api/common/NgForOf#change-propagation for more information.`);
        }
        this._trackByFn = fn;
    }
    get ngForTrackBy() {
        return this._trackByFn;
    }
    constructor(_viewContainer, _template, _differs) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this._ngForOf = null;
        this._ngForOfDirty = true;
        this._differ = null;
    }
    /**
     * A reference to the template that is stamped out for each item in the iterable.
     * @see [template reference variable](guide/templates/reference-variables)
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
                if (typeof ngDevMode === 'undefined' || ngDevMode) {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgForOf, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: i0.IterableDiffers }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", type: NgForOf, isStandalone: true, selector: "[ngFor][ngForOf]", inputs: { ngForOf: "ngForOf", ngForTrackBy: "ngForTrackBy", ngForTemplate: "ngForTemplate" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgForOf, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngFor][ngForOf]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: i0.IterableDiffers }], propDecorators: { ngForOf: [{
                type: Input
            }], ngForTrackBy: [{
                type: Input
            }], ngForTemplate: [{
                type: Input
            }] } });
// Also export the `NgForOf` class as `NgFor` to improve the DX for
// cases when the directive is used as standalone, so the class name
// matches the CSS selector (*ngFor).
export { NgForOf as NgFor };
function applyViewChange(view, record) {
    view.context.$implicit = record.item;
}
function getTypeName(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUdULEtBQUssRUFJTCxlQUFlLEVBRWYsV0FBVyxFQUVYLGdCQUFnQixFQUNoQixhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQzs7QUFJdkI7O0dBRUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQUN6QixZQUNTLFNBQVksRUFDWixPQUFVLEVBQ1YsS0FBYSxFQUNiLEtBQWE7UUFIYixjQUFTLEdBQVQsU0FBUyxDQUFHO1FBQ1osWUFBTyxHQUFQLE9BQU8sQ0FBRztRQUNWLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQ25CLENBQUM7SUFFSixJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxJQUFJLEdBQUc7UUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlHRztBQUtILE1BQU0sT0FBTyxPQUFPO0lBQ2xCOzs7T0FHRztJQUNI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QUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFTO0lBQzVCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIElucHV0LFxuICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcbiAgSXRlcmFibGVDaGFuZ2VzLFxuICBJdGVyYWJsZURpZmZlcixcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBOZ0l0ZXJhYmxlLFxuICBUZW1wbGF0ZVJlZixcbiAgVHJhY2tCeUZ1bmN0aW9uLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdGb3JPZkNvbnRleHQ8VCwgVSBleHRlbmRzIE5nSXRlcmFibGU8VD4gPSBOZ0l0ZXJhYmxlPFQ+PiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyAkaW1wbGljaXQ6IFQsXG4gICAgcHVibGljIG5nRm9yT2Y6IFUsXG4gICAgcHVibGljIGluZGV4OiBudW1iZXIsXG4gICAgcHVibGljIGNvdW50OiBudW1iZXIsXG4gICkge31cblxuICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IDA7XG4gIH1cblxuICBnZXQgbGFzdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleCA9PT0gdGhpcy5jb3VudCAtIDE7XG4gIH1cblxuICBnZXQgZXZlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7XG4gIH1cblxuICBnZXQgb2RkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5ldmVuO1xuICB9XG59XG5cbi8qKlxuICogQSBbc3RydWN0dXJhbCBkaXJlY3RpdmVdKGd1aWRlL2RpcmVjdGl2ZXMvc3RydWN0dXJhbC1kaXJlY3RpdmVzKSB0aGF0IHJlbmRlcnNcbiAqIGEgdGVtcGxhdGUgZm9yIGVhY2ggaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gKiBUaGUgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBlbGVtZW50LCB3aGljaCBiZWNvbWVzIHRoZSBwYXJlbnRcbiAqIG9mIHRoZSBjbG9uZWQgdGVtcGxhdGVzLlxuICpcbiAqIFRoZSBgbmdGb3JPZmAgZGlyZWN0aXZlIGlzIGdlbmVyYWxseSB1c2VkIGluIHRoZVxuICogW3Nob3J0aGFuZCBmb3JtXShndWlkZS9kaXJlY3RpdmVzL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNhc3RlcmlzaykgYCpuZ0ZvcmAuXG4gKiBJbiB0aGlzIGZvcm0sIHRoZSB0ZW1wbGF0ZSB0byBiZSByZW5kZXJlZCBmb3IgZWFjaCBpdGVyYXRpb24gaXMgdGhlIGNvbnRlbnRcbiAqIG9mIGFuIGFuY2hvciBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgdGhlIHNob3J0aGFuZCBzeW50YXggd2l0aCBzb21lIG9wdGlvbnMsXG4gKiBjb250YWluZWQgaW4gYW4gYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogYGBgXG4gKiA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXM7IGluZGV4IGFzIGk7IHRyYWNrQnk6IHRyYWNrQnlGblwiPi4uLjwvbGk+XG4gKiBgYGBcbiAqXG4gKiBUaGUgc2hvcnRoYW5kIGZvcm0gZXhwYW5kcyBpbnRvIGEgbG9uZyBmb3JtIHRoYXQgdXNlcyB0aGUgYG5nRm9yT2ZgIHNlbGVjdG9yXG4gKiBvbiBhbiBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudC5cbiAqIFRoZSBjb250ZW50IG9mIHRoZSBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudCBpcyB0aGUgYDxsaT5gIGVsZW1lbnQgdGhhdCBoZWxkIHRoZVxuICogc2hvcnQtZm9ybSBkaXJlY3RpdmUuXG4gKlxuICogSGVyZSBpcyB0aGUgZXhwYW5kZWQgdmVyc2lvbiBvZiB0aGUgc2hvcnQtZm9ybSBleGFtcGxlLlxuICpcbiAqIGBgYFxuICogPG5nLXRlbXBsYXRlIG5nRm9yIGxldC1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCIgbGV0LWk9XCJpbmRleFwiIFtuZ0ZvclRyYWNrQnldPVwidHJhY2tCeUZuXCI+XG4gKiAgIDxsaT4uLi48L2xpPlxuICogPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBleHBhbmRzIHRoZSBzaG9ydGhhbmQgc3ludGF4IGFzIGl0IGNvbXBpbGVzIHRoZSB0ZW1wbGF0ZS5cbiAqIFRoZSBjb250ZXh0IGZvciBlYWNoIGVtYmVkZGVkIHZpZXcgaXMgbG9naWNhbGx5IG1lcmdlZCB0byB0aGUgY3VycmVudCBjb21wb25lbnRcbiAqIGNvbnRleHQgYWNjb3JkaW5nIHRvIGl0cyBsZXhpY2FsIHBvc2l0aW9uLlxuICpcbiAqIFdoZW4gdXNpbmcgdGhlIHNob3J0aGFuZCBzeW50YXgsIEFuZ3VsYXIgYWxsb3dzIG9ubHkgW29uZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZVxuICogb24gYW4gZWxlbWVudF0oZ3VpZGUvZGlyZWN0aXZlcy9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjb25lLXBlci1lbGVtZW50KS5cbiAqIElmIHlvdSB3YW50IHRvIGl0ZXJhdGUgY29uZGl0aW9uYWxseSwgZm9yIGV4YW1wbGUsXG4gKiBwdXQgdGhlIGAqbmdJZmAgb24gYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIHRoZSBgKm5nRm9yYCBlbGVtZW50LlxuICogRm9yIGZ1cnRoZXIgZGlzY3Vzc2lvbiwgc2VlXG4gKiBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9kaXJlY3RpdmVzL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNvbmUtcGVyLWVsZW1lbnQpLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIExvY2FsIHZhcmlhYmxlc1xuICpcbiAqIGBOZ0Zvck9mYCBwcm92aWRlcyBleHBvcnRlZCB2YWx1ZXMgdGhhdCBjYW4gYmUgYWxpYXNlZCB0byBsb2NhbCB2YXJpYWJsZXMuXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgYGBgXG4gKiA8bGkgKm5nRm9yPVwibGV0IHVzZXIgb2YgdXNlcnM7IGluZGV4IGFzIGk7IGZpcnN0IGFzIGlzRmlyc3RcIj5cbiAqICAgIHt7aX19L3t7dXNlcnMubGVuZ3RofX0uIHt7dXNlcn19IDxzcGFuICpuZ0lmPVwiaXNGaXJzdFwiPmRlZmF1bHQ8L3NwYW4+XG4gKiA8L2xpPlxuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBleHBvcnRlZCB2YWx1ZXMgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzOlxuICpcbiAqIC0gYCRpbXBsaWNpdDogVGA6IFRoZSB2YWx1ZSBvZiB0aGUgaW5kaXZpZHVhbCBpdGVtcyBpbiB0aGUgaXRlcmFibGUgKGBuZ0Zvck9mYCkuXG4gKiAtIGBuZ0Zvck9mOiBOZ0l0ZXJhYmxlPFQ+YDogVGhlIHZhbHVlIG9mIHRoZSBpdGVyYWJsZSBleHByZXNzaW9uLiBVc2VmdWwgd2hlbiB0aGUgZXhwcmVzc2lvbiBpc1xuICogbW9yZSBjb21wbGV4IHRoZW4gYSBwcm9wZXJ0eSBhY2Nlc3MsIGZvciBleGFtcGxlIHdoZW4gdXNpbmcgdGhlIGFzeW5jIHBpcGUgKGB1c2VyU3RyZWFtcyB8XG4gKiBhc3luY2ApLlxuICogLSBgaW5kZXg6IG51bWJlcmA6IFRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGNvdW50OiBudW1iZXJgOiBUaGUgbGVuZ3RoIG9mIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGZpcnN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGxhc3Q6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaXMgdGhlIGxhc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBldmVuOiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGhhcyBhbiBldmVuIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYG9kZDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gb2RkIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiAjIyMgQ2hhbmdlIHByb3BhZ2F0aW9uXG4gKlxuICogV2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGl0ZXJhdG9yIGNoYW5nZXMsIGBOZ0Zvck9mYCBtYWtlcyB0aGUgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIHRoZSBET006XG4gKlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgYWRkZWQsIGEgbmV3IGluc3RhbmNlIG9mIHRoZSB0ZW1wbGF0ZSBpcyBhZGRlZCB0byB0aGUgRE9NLlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgcmVtb3ZlZCwgaXRzIHRlbXBsYXRlIGluc3RhbmNlIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICogKiBXaGVuIGl0ZW1zIGFyZSByZW9yZGVyZWQsIHRoZWlyIHJlc3BlY3RpdmUgdGVtcGxhdGVzIGFyZSByZW9yZGVyZWQgaW4gdGhlIERPTS5cbiAqXG4gKiBBbmd1bGFyIHVzZXMgb2JqZWN0IGlkZW50aXR5IHRvIHRyYWNrIGluc2VydGlvbnMgYW5kIGRlbGV0aW9ucyB3aXRoaW4gdGhlIGl0ZXJhdG9yIGFuZCByZXByb2R1Y2VcbiAqIHRob3NlIGNoYW5nZXMgaW4gdGhlIERPTS4gVGhpcyBoYXMgaW1wb3J0YW50IGltcGxpY2F0aW9ucyBmb3IgYW5pbWF0aW9ucyBhbmQgYW55IHN0YXRlZnVsXG4gKiBjb250cm9scyB0aGF0IGFyZSBwcmVzZW50LCBzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB0aGF0IGFjY2VwdCB1c2VyIGlucHV0LiBJbnNlcnRlZCByb3dzIGNhblxuICogYmUgYW5pbWF0ZWQgaW4sIGRlbGV0ZWQgcm93cyBjYW4gYmUgYW5pbWF0ZWQgb3V0LCBhbmQgdW5jaGFuZ2VkIHJvd3MgcmV0YWluIGFueSB1bnNhdmVkIHN0YXRlXG4gKiBzdWNoIGFzIHVzZXIgaW5wdXQuXG4gKiBGb3IgbW9yZSBvbiBhbmltYXRpb25zLCBzZWUgW1RyYW5zaXRpb25zIGFuZCBUcmlnZ2Vyc10oZ3VpZGUvYW5pbWF0aW9ucy90cmFuc2l0aW9uLWFuZC10cmlnZ2VycykuXG4gKlxuICogVGhlIGlkZW50aXRpZXMgb2YgZWxlbWVudHMgaW4gdGhlIGl0ZXJhdG9yIGNhbiBjaGFuZ2Ugd2hpbGUgdGhlIGRhdGEgZG9lcyBub3QuXG4gKiBUaGlzIGNhbiBoYXBwZW4sIGZvciBleGFtcGxlLCBpZiB0aGUgaXRlcmF0b3IgaXMgcHJvZHVjZWQgZnJvbSBhbiBSUEMgdG8gdGhlIHNlcnZlciwgYW5kIHRoYXRcbiAqIFJQQyBpcyByZS1ydW4uIEV2ZW4gaWYgdGhlIGRhdGEgaGFzbid0IGNoYW5nZWQsIHRoZSBzZWNvbmQgcmVzcG9uc2UgcHJvZHVjZXMgb2JqZWN0cyB3aXRoXG4gKiBkaWZmZXJlbnQgaWRlbnRpdGllcywgYW5kIEFuZ3VsYXIgbXVzdCB0ZWFyIGRvd24gdGhlIGVudGlyZSBET00gYW5kIHJlYnVpbGQgaXQgKGFzIGlmIGFsbCBvbGRcbiAqIGVsZW1lbnRzIHdlcmUgZGVsZXRlZCBhbmQgYWxsIG5ldyBlbGVtZW50cyBpbnNlcnRlZCkuXG4gKlxuICogVG8gYXZvaWQgdGhpcyBleHBlbnNpdmUgb3BlcmF0aW9uLCB5b3UgY2FuIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCB0cmFja2luZyBhbGdvcml0aG0uXG4gKiBieSBzdXBwbHlpbmcgdGhlIGB0cmFja0J5YCBvcHRpb24gdG8gYE5nRm9yT2ZgLlxuICogYHRyYWNrQnlgIHRha2VzIGEgZnVuY3Rpb24gdGhhdCBoYXMgdHdvIGFyZ3VtZW50czogYGluZGV4YCBhbmQgYGl0ZW1gLlxuICogSWYgYHRyYWNrQnlgIGlzIGdpdmVuLCBBbmd1bGFyIHRyYWNrcyBjaGFuZ2VzIGJ5IHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uLlxuICpcbiAqIEBzZWUgW1N0cnVjdHVyYWwgRGlyZWN0aXZlc10oZ3VpZGUvZGlyZWN0aXZlcy9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0Zvcl1bbmdGb3JPZl0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvck9mPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+ID0gTmdJdGVyYWJsZTxUPj4gaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqXG4gICAqIFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbiwgd2hpY2ggY2FuIGJlIHVzZWQgYXMgYVxuICAgKiBbdGVtcGxhdGUgaW5wdXQgdmFyaWFibGVdKGd1aWRlL2RpcmVjdGl2ZXMvc3RydWN0dXJhbC1kaXJlY3RpdmVzI3Nob3J0aGFuZCkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbmdGb3JPZihuZ0Zvck9mOiAoVSAmIE5nSXRlcmFibGU8VD4pIHwgdW5kZWZpbmVkIHwgbnVsbCkge1xuICAgIHRoaXMuX25nRm9yT2YgPSBuZ0Zvck9mO1xuICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IHRydWU7XG4gIH1cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhIGN1c3RvbSBgVHJhY2tCeUZ1bmN0aW9uYCB0byBjb21wdXRlIHRoZSBpZGVudGl0eSBvZiBpdGVtcyBpbiBhbiBpdGVyYWJsZS5cbiAgICpcbiAgICogSWYgYSBjdXN0b20gYFRyYWNrQnlGdW5jdGlvbmAgaXMgbm90IHByb3ZpZGVkLCBgTmdGb3JPZmAgd2lsbCB1c2UgdGhlIGl0ZW0ncyBbb2JqZWN0XG4gICAqIGlkZW50aXR5XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvaXMpXG4gICAqIGFzIHRoZSBrZXkuXG4gICAqXG4gICAqIGBOZ0Zvck9mYCB1c2VzIHRoZSBjb21wdXRlZCBrZXkgdG8gYXNzb2NpYXRlIGl0ZW1zIGluIGFuIGl0ZXJhYmxlIHdpdGggRE9NIGVsZW1lbnRzXG4gICAqIGl0IHByb2R1Y2VzIGZvciB0aGVzZSBpdGVtcy5cbiAgICpcbiAgICogQSBjdXN0b20gYFRyYWNrQnlGdW5jdGlvbmAgaXMgdXNlZnVsIHRvIHByb3ZpZGUgZ29vZCB1c2VyIGV4cGVyaWVuY2UgaW4gY2FzZXMgd2hlbiBpdGVtcyBpbiBhblxuICAgKiBpdGVyYWJsZSByZW5kZXJlZCB1c2luZyBgTmdGb3JPZmAgaGF2ZSBhIG5hdHVyYWwgaWRlbnRpZmllciAoZm9yIGV4YW1wbGUsIGN1c3RvbSBJRCBvciBhXG4gICAqIHByaW1hcnkga2V5KSwgYW5kIHRoaXMgaXRlcmFibGUgY291bGQgYmUgdXBkYXRlZCB3aXRoIG5ldyBvYmplY3QgaW5zdGFuY2VzIHRoYXQgc3RpbGxcbiAgICogcmVwcmVzZW50IHRoZSBzYW1lIHVuZGVybHlpbmcgZW50aXR5IChmb3IgZXhhbXBsZSwgd2hlbiBkYXRhIGlzIHJlLWZldGNoZWQgZnJvbSB0aGUgc2VydmVyLFxuICAgKiBhbmQgdGhlIGl0ZXJhYmxlIGlzIHJlY3JlYXRlZCBhbmQgcmUtcmVuZGVyZWQsIGJ1dCBtb3N0IG9mIHRoZSBkYXRhIGlzIHN0aWxsIHRoZSBzYW1lKS5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgVHJhY2tCeUZ1bmN0aW9ufVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXG4gICAgICAgICAgYFNlZSBodHRwczovL2FuZ3VsYXIuaW8vYXBpL2NvbW1vbi9OZ0Zvck9mI2NoYW5nZS1wcm9wYWdhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XG4gIH1cblxuICBnZXQgbmdGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcbiAgfVxuXG4gIHByaXZhdGUgX25nRm9yT2Y6IFUgfCB1bmRlZmluZWQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbmdGb3JPZkRpcnR5OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPiB8IG51bGwgPSBudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJ1xuICAvLyB3YWl0aW5nIGZvciBtaWNyb3NvZnQvdHlwZXNjcmlwdCM0MzY2MiB0byBhbGxvdyB0aGUgcmV0dXJuIHR5cGUgYFRyYWNrQnlGdW5jdGlvbnx1bmRlZmluZWRgIGZvclxuICAvLyB0aGUgZ2V0dGVyXG4gIHByaXZhdGUgX3RyYWNrQnlGbiE6IFRyYWNrQnlGdW5jdGlvbjxUPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4sXG4gICAgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICApIHt9XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSB0ZW1wbGF0ZSB0aGF0IGlzIHN0YW1wZWQgb3V0IGZvciBlYWNoIGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICAgKiBAc2VlIFt0ZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGVdKGd1aWRlL3RlbXBsYXRlcy9yZWZlcmVuY2UtdmFyaWFibGVzKVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pikge1xuICAgIC8vIFRPRE8oVFMyLjEpOiBtYWtlIFRlbXBsYXRlUmVmPFBhcnRpYWw8TmdGb3JSb3dPZjxUPj4+IG9uY2Ugd2UgbW92ZSB0byBUUyB2Mi4xXG4gICAgLy8gVGhlIGN1cnJlbnQgdHlwZSBpcyB0b28gcmVzdHJpY3RpdmU7IGEgdGVtcGxhdGUgdGhhdCBqdXN0IHVzZXMgaW5kZXgsIGZvciBleGFtcGxlLFxuICAgIC8vIHNob3VsZCBiZSBhY2NlcHRhYmxlLlxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgY2hhbmdlcyB3aGVuIG5lZWRlZC5cbiAgICogQG5vZG9jXG4gICAqL1xuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX25nRm9yT2ZEaXJ0eSkge1xuICAgICAgdGhpcy5fbmdGb3JPZkRpcnR5ID0gZmFsc2U7XG4gICAgICAvLyBSZWFjdCBvbiBuZ0Zvck9mIGNoYW5nZXMgb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX25nRm9yT2Y7XG4gICAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENBVVRJT046IHRoaXMgbG9naWMgaXMgZHVwbGljYXRlZCBmb3IgcHJvZHVjdGlvbiBtb2RlIGJlbG93LCBhcyB0aGUgdHJ5LWNhdGNoXG4gICAgICAgICAgICAvLyBpcyBvbmx5IHByZXNlbnQgaW4gZGV2ZWxvcG1lbnQgYnVpbGRzLlxuICAgICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5uZ0ZvclRyYWNrQnkpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgIGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHt2YWx1ZX0nIG9mIHR5cGUgJ2AgK1xuICAgICAgICAgICAgICBgJHtnZXRUeXBlTmFtZSh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcywgc3VjaCBhcyBBcnJheXMuYDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSAnIERpZCB5b3UgbWVhbiB0byB1c2UgdGhlIGtleXZhbHVlIHBpcGU/JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5OR19GT1JfTUlTU0lOR19ESUZGRVIsIGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENBVVRJT046IHRoaXMgbG9naWMgaXMgZHVwbGljYXRlZCBmb3IgZGV2ZWxvcG1lbnQgbW9kZSBhYm92ZSwgYXMgdGhlIHRyeS1jYXRjaFxuICAgICAgICAgIC8vIGlzIG9ubHkgcHJlc2VudCBpbiBkZXZlbG9wbWVudCBidWlsZHMuXG4gICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5uZ0ZvclRyYWNrQnkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9kaWZmZXIpIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9uZ0Zvck9mKTtcbiAgICAgIGlmIChjaGFuZ2VzKSB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxUPikge1xuICAgIGNvbnN0IHZpZXdDb250YWluZXIgPSB0aGlzLl92aWV3Q29udGFpbmVyO1xuICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbihcbiAgICAgIChcbiAgICAgICAgaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8VD4sXG4gICAgICAgIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgICAgICAgY3VycmVudEluZGV4OiBudW1iZXIgfCBudWxsLFxuICAgICAgKSA9PiB7XG4gICAgICAgIGlmIChpdGVtLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgIC8vIE5nRm9yT2YgaXMgbmV2ZXIgXCJudWxsXCIgb3IgXCJ1bmRlZmluZWRcIiBoZXJlIGJlY2F1c2UgdGhlIGRpZmZlciBkZXRlY3RlZFxuICAgICAgICAgIC8vIHRoYXQgYSBuZXcgaXRlbSBuZWVkcyB0byBiZSBpbnNlcnRlZCBmcm9tIHRoZSBpdGVyYWJsZS4gVGhpcyBpbXBsaWVzIHRoYXRcbiAgICAgICAgICAvLyB0aGVyZSBpcyBhbiBpdGVyYWJsZSB2YWx1ZSBmb3IgXCJfbmdGb3JPZlwiLlxuICAgICAgICAgIHZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUsXG4gICAgICAgICAgICBuZXcgTmdGb3JPZkNvbnRleHQ8VCwgVT4oaXRlbS5pdGVtLCB0aGlzLl9uZ0Zvck9mISwgLTEsIC0xKSxcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGN1cnJlbnRJbmRleCxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgdmlld0NvbnRhaW5lci5yZW1vdmUoYWRqdXN0ZWRQcmV2aW91c0luZGV4ID09PSBudWxsID8gdW5kZWZpbmVkIDogYWRqdXN0ZWRQcmV2aW91c0luZGV4KTtcbiAgICAgICAgfSBlbHNlIGlmIChhZGp1c3RlZFByZXZpb3VzSW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCB2aWV3ID0gdmlld0NvbnRhaW5lci5nZXQoYWRqdXN0ZWRQcmV2aW91c0luZGV4KSE7XG4gICAgICAgICAgdmlld0NvbnRhaW5lci5tb3ZlKHZpZXcsIGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgYXBwbHlWaWV3Q2hhbmdlKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+PiwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcblxuICAgIGZvciAobGV0IGkgPSAwLCBpbGVuID0gdmlld0NvbnRhaW5lci5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pj52aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB2aWV3UmVmLmNvbnRleHQ7XG4gICAgICBjb250ZXh0LmluZGV4ID0gaTtcbiAgICAgIGNvbnRleHQuY291bnQgPSBpbGVuO1xuICAgICAgY29udGV4dC5uZ0Zvck9mID0gdGhpcy5fbmdGb3JPZiE7XG4gICAgfVxuXG4gICAgY2hhbmdlcy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogYW55KSA9PiB7XG4gICAgICBjb25zdCB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4+dmlld0NvbnRhaW5lci5nZXQocmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICBhcHBseVZpZXdDaGFuZ2Uodmlld1JlZiwgcmVjb3JkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoZSBjb3JyZWN0IHR5cGUgb2YgdGhlIGNvbnRleHQgZm9yIHRoZSB0ZW1wbGF0ZSB0aGF0IGBOZ0Zvck9mYCB3aWxsIHJlbmRlci5cbiAgICpcbiAgICogVGhlIHByZXNlbmNlIG9mIHRoaXMgbWV0aG9kIGlzIGEgc2lnbmFsIHRvIHRoZSBJdnkgdGVtcGxhdGUgdHlwZS1jaGVjayBjb21waWxlciB0aGF0IHRoZVxuICAgKiBgTmdGb3JPZmAgc3RydWN0dXJhbCBkaXJlY3RpdmUgcmVuZGVycyBpdHMgdGVtcGxhdGUgd2l0aCBhIHNwZWNpZmljIGNvbnRleHQgdHlwZS5cbiAgICovXG4gIHN0YXRpYyBuZ1RlbXBsYXRlQ29udGV4dEd1YXJkPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+PihcbiAgICBkaXI6IE5nRm9yT2Y8VCwgVT4sXG4gICAgY3R4OiBhbnksXG4gICk6IGN0eCBpcyBOZ0Zvck9mQ29udGV4dDxULCBVPiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLy8gQWxzbyBleHBvcnQgdGhlIGBOZ0Zvck9mYCBjbGFzcyBhcyBgTmdGb3JgIHRvIGltcHJvdmUgdGhlIERYIGZvclxuLy8gY2FzZXMgd2hlbiB0aGUgZGlyZWN0aXZlIGlzIHVzZWQgYXMgc3RhbmRhbG9uZSwgc28gdGhlIGNsYXNzIG5hbWVcbi8vIG1hdGNoZXMgdGhlIENTUyBzZWxlY3RvciAoKm5nRm9yKS5cbmV4cG9ydCB7TmdGb3JPZiBhcyBOZ0Zvcn07XG5cbmZ1bmN0aW9uIGFwcGx5Vmlld0NoYW5nZTxUPihcbiAgdmlldzogRW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+PixcbiAgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxUPixcbikge1xuICB2aWV3LmNvbnRleHQuJGltcGxpY2l0ID0gcmVjb3JkLml0ZW07XG59XG5cbmZ1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGU6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XG59XG4iXX0=