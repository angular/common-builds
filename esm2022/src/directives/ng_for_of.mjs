/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, ɵRuntimeError as RuntimeError, } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @publicApi
 */
export class NgForOfContext {
    constructor(
    /** Reference to the current item from the collection. */
    $implicit, 
    /**
     * The value of the iterable expression. Useful when the expression is
     * more complex then a property access, for example when using the async pipe
     * (`userStreams | async`).
     */
    ngForOf, 
    /** Returns an index of the current item in the collection. */
    index, 
    /** Returns total amount of items in the collection. */
    count) {
        this.$implicit = $implicit;
        this.ngForOf = ngForOf;
        this.index = index;
        this.count = count;
    }
    // Indicates whether this is the first item in the collection.
    get first() {
        return this.index === 0;
    }
    // Indicates whether this is the last item in the collection.
    get last() {
        return this.index === this.count - 1;
    }
    // Indicates whether an index of this item in the collection is even.
    get even() {
        return this.index % 2 === 0;
    }
    // Indicates whether an index of this item in the collection is odd.
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
     * @see [template reference variable](guide/templates/variables#template-reference-variables)
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.12+sha-06d70a2", ngImport: i0, type: NgForOf, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: i0.IterableDiffers }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.12+sha-06d70a2", type: NgForOf, isStandalone: true, selector: "[ngFor][ngForOf]", inputs: { ngForOf: "ngForOf", ngForTrackBy: "ngForTrackBy", ngForTemplate: "ngForTemplate" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.12+sha-06d70a2", ngImport: i0, type: NgForOf, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUdULEtBQUssRUFJTCxlQUFlLEVBRWYsV0FBVyxFQUVYLGdCQUFnQixFQUNoQixhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQzs7QUFJdkI7O0dBRUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQUN6QjtJQUNFLHlEQUF5RDtJQUNsRCxTQUFZO0lBRW5COzs7O09BSUc7SUFDSSxPQUFVO0lBRWpCLDhEQUE4RDtJQUN2RCxLQUFhO0lBRXBCLHVEQUF1RDtJQUNoRCxLQUFhO1FBYmIsY0FBUyxHQUFULFNBQVMsQ0FBRztRQU9aLFlBQU8sR0FBUCxPQUFPLENBQUc7UUFHVixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBR2IsVUFBSyxHQUFMLEtBQUssQ0FBUTtJQUNuQixDQUFDO0lBRUosOERBQThEO0lBQzlELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELDZEQUE2RDtJQUM3RCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELHFFQUFxRTtJQUNyRSxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsb0VBQW9FO0lBQ3BFLElBQUksR0FBRztRQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QXFDO0FBQ3JDLE9BQU8sRUFBQyxPQUFPLElBQUksS0FBSyxFQUFDLENBQUM7QUFFMUIsU0FBUyxlQUFlLENBQ3RCLElBQXdDLEVBQ3hDLE1BQStCO0lBRS9CLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDdkMsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLElBQVM7SUFDNUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUM7QUFDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIElucHV0LFxuICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcbiAgSXRlcmFibGVDaGFuZ2VzLFxuICBJdGVyYWJsZURpZmZlcixcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBOZ0l0ZXJhYmxlLFxuICBUZW1wbGF0ZVJlZixcbiAgVHJhY2tCeUZ1bmN0aW9uLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdGb3JPZkNvbnRleHQ8VCwgVSBleHRlbmRzIE5nSXRlcmFibGU8VD4gPSBOZ0l0ZXJhYmxlPFQ+PiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaXRlbSBmcm9tIHRoZSBjb2xsZWN0aW9uLiAqL1xuICAgIHB1YmxpYyAkaW1wbGljaXQ6IFQsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdmFsdWUgb2YgdGhlIGl0ZXJhYmxlIGV4cHJlc3Npb24uIFVzZWZ1bCB3aGVuIHRoZSBleHByZXNzaW9uIGlzXG4gICAgICogbW9yZSBjb21wbGV4IHRoZW4gYSBwcm9wZXJ0eSBhY2Nlc3MsIGZvciBleGFtcGxlIHdoZW4gdXNpbmcgdGhlIGFzeW5jIHBpcGVcbiAgICAgKiAoYHVzZXJTdHJlYW1zIHwgYXN5bmNgKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgbmdGb3JPZjogVSxcblxuICAgIC8qKiBSZXR1cm5zIGFuIGluZGV4IG9mIHRoZSBjdXJyZW50IGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb24uICovXG4gICAgcHVibGljIGluZGV4OiBudW1iZXIsXG5cbiAgICAvKiogUmV0dXJucyB0b3RhbCBhbW91bnQgb2YgaXRlbXMgaW4gdGhlIGNvbGxlY3Rpb24uICovXG4gICAgcHVibGljIGNvdW50OiBudW1iZXIsXG4gICkge31cblxuICAvLyBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGlzIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBjb2xsZWN0aW9uLlxuICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IDA7XG4gIH1cblxuICAvLyBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb24uXG4gIGdldCBsYXN0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmluZGV4ID09PSB0aGlzLmNvdW50IC0gMTtcbiAgfVxuXG4gIC8vIEluZGljYXRlcyB3aGV0aGVyIGFuIGluZGV4IG9mIHRoaXMgaXRlbSBpbiB0aGUgY29sbGVjdGlvbiBpcyBldmVuLlxuICBnZXQgZXZlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7XG4gIH1cblxuICAvLyBJbmRpY2F0ZXMgd2hldGhlciBhbiBpbmRleCBvZiB0aGlzIGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb24gaXMgb2RkLlxuICBnZXQgb2RkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5ldmVuO1xuICB9XG59XG5cbi8qKlxuICogQSBbc3RydWN0dXJhbCBkaXJlY3RpdmVdKGd1aWRlL2RpcmVjdGl2ZXMvc3RydWN0dXJhbC1kaXJlY3RpdmVzKSB0aGF0IHJlbmRlcnNcbiAqIGEgdGVtcGxhdGUgZm9yIGVhY2ggaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gKiBUaGUgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBlbGVtZW50LCB3aGljaCBiZWNvbWVzIHRoZSBwYXJlbnRcbiAqIG9mIHRoZSBjbG9uZWQgdGVtcGxhdGVzLlxuICpcbiAqIFRoZSBgbmdGb3JPZmAgZGlyZWN0aXZlIGlzIGdlbmVyYWxseSB1c2VkIGluIHRoZVxuICogW3Nob3J0aGFuZCBmb3JtXShndWlkZS9kaXJlY3RpdmVzL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNhc3RlcmlzaykgYCpuZ0ZvcmAuXG4gKiBJbiB0aGlzIGZvcm0sIHRoZSB0ZW1wbGF0ZSB0byBiZSByZW5kZXJlZCBmb3IgZWFjaCBpdGVyYXRpb24gaXMgdGhlIGNvbnRlbnRcbiAqIG9mIGFuIGFuY2hvciBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgdGhlIHNob3J0aGFuZCBzeW50YXggd2l0aCBzb21lIG9wdGlvbnMsXG4gKiBjb250YWluZWQgaW4gYW4gYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogYGBgXG4gKiA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXM7IGluZGV4IGFzIGk7IHRyYWNrQnk6IHRyYWNrQnlGblwiPi4uLjwvbGk+XG4gKiBgYGBcbiAqXG4gKiBUaGUgc2hvcnRoYW5kIGZvcm0gZXhwYW5kcyBpbnRvIGEgbG9uZyBmb3JtIHRoYXQgdXNlcyB0aGUgYG5nRm9yT2ZgIHNlbGVjdG9yXG4gKiBvbiBhbiBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudC5cbiAqIFRoZSBjb250ZW50IG9mIHRoZSBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudCBpcyB0aGUgYDxsaT5gIGVsZW1lbnQgdGhhdCBoZWxkIHRoZVxuICogc2hvcnQtZm9ybSBkaXJlY3RpdmUuXG4gKlxuICogSGVyZSBpcyB0aGUgZXhwYW5kZWQgdmVyc2lvbiBvZiB0aGUgc2hvcnQtZm9ybSBleGFtcGxlLlxuICpcbiAqIGBgYFxuICogPG5nLXRlbXBsYXRlIG5nRm9yIGxldC1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCIgbGV0LWk9XCJpbmRleFwiIFtuZ0ZvclRyYWNrQnldPVwidHJhY2tCeUZuXCI+XG4gKiAgIDxsaT4uLi48L2xpPlxuICogPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBleHBhbmRzIHRoZSBzaG9ydGhhbmQgc3ludGF4IGFzIGl0IGNvbXBpbGVzIHRoZSB0ZW1wbGF0ZS5cbiAqIFRoZSBjb250ZXh0IGZvciBlYWNoIGVtYmVkZGVkIHZpZXcgaXMgbG9naWNhbGx5IG1lcmdlZCB0byB0aGUgY3VycmVudCBjb21wb25lbnRcbiAqIGNvbnRleHQgYWNjb3JkaW5nIHRvIGl0cyBsZXhpY2FsIHBvc2l0aW9uLlxuICpcbiAqIFdoZW4gdXNpbmcgdGhlIHNob3J0aGFuZCBzeW50YXgsIEFuZ3VsYXIgYWxsb3dzIG9ubHkgW29uZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZVxuICogb24gYW4gZWxlbWVudF0oZ3VpZGUvZGlyZWN0aXZlcy9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjb25lLXBlci1lbGVtZW50KS5cbiAqIElmIHlvdSB3YW50IHRvIGl0ZXJhdGUgY29uZGl0aW9uYWxseSwgZm9yIGV4YW1wbGUsXG4gKiBwdXQgdGhlIGAqbmdJZmAgb24gYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIHRoZSBgKm5nRm9yYCBlbGVtZW50LlxuICogRm9yIGZ1cnRoZXIgZGlzY3Vzc2lvbiwgc2VlXG4gKiBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9kaXJlY3RpdmVzL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNvbmUtcGVyLWVsZW1lbnQpLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIExvY2FsIHZhcmlhYmxlc1xuICpcbiAqIGBOZ0Zvck9mYCBwcm92aWRlcyBleHBvcnRlZCB2YWx1ZXMgdGhhdCBjYW4gYmUgYWxpYXNlZCB0byBsb2NhbCB2YXJpYWJsZXMuXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgYGBgXG4gKiA8bGkgKm5nRm9yPVwibGV0IHVzZXIgb2YgdXNlcnM7IGluZGV4IGFzIGk7IGZpcnN0IGFzIGlzRmlyc3RcIj5cbiAqICAgIHt7aX19L3t7dXNlcnMubGVuZ3RofX0uIHt7dXNlcn19IDxzcGFuICpuZ0lmPVwiaXNGaXJzdFwiPmRlZmF1bHQ8L3NwYW4+XG4gKiA8L2xpPlxuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBleHBvcnRlZCB2YWx1ZXMgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzOlxuICpcbiAqIC0gYCRpbXBsaWNpdDogVGA6IFRoZSB2YWx1ZSBvZiB0aGUgaW5kaXZpZHVhbCBpdGVtcyBpbiB0aGUgaXRlcmFibGUgKGBuZ0Zvck9mYCkuXG4gKiAtIGBuZ0Zvck9mOiBOZ0l0ZXJhYmxlPFQ+YDogVGhlIHZhbHVlIG9mIHRoZSBpdGVyYWJsZSBleHByZXNzaW9uLiBVc2VmdWwgd2hlbiB0aGUgZXhwcmVzc2lvbiBpc1xuICogbW9yZSBjb21wbGV4IHRoZW4gYSBwcm9wZXJ0eSBhY2Nlc3MsIGZvciBleGFtcGxlIHdoZW4gdXNpbmcgdGhlIGFzeW5jIHBpcGUgKGB1c2VyU3RyZWFtcyB8XG4gKiBhc3luY2ApLlxuICogLSBgaW5kZXg6IG51bWJlcmA6IFRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGNvdW50OiBudW1iZXJgOiBUaGUgbGVuZ3RoIG9mIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGZpcnN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGxhc3Q6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaXMgdGhlIGxhc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBldmVuOiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGhhcyBhbiBldmVuIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYG9kZDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gb2RkIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiAjIyMgQ2hhbmdlIHByb3BhZ2F0aW9uXG4gKlxuICogV2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGl0ZXJhdG9yIGNoYW5nZXMsIGBOZ0Zvck9mYCBtYWtlcyB0aGUgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIHRoZSBET006XG4gKlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgYWRkZWQsIGEgbmV3IGluc3RhbmNlIG9mIHRoZSB0ZW1wbGF0ZSBpcyBhZGRlZCB0byB0aGUgRE9NLlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgcmVtb3ZlZCwgaXRzIHRlbXBsYXRlIGluc3RhbmNlIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICogKiBXaGVuIGl0ZW1zIGFyZSByZW9yZGVyZWQsIHRoZWlyIHJlc3BlY3RpdmUgdGVtcGxhdGVzIGFyZSByZW9yZGVyZWQgaW4gdGhlIERPTS5cbiAqXG4gKiBBbmd1bGFyIHVzZXMgb2JqZWN0IGlkZW50aXR5IHRvIHRyYWNrIGluc2VydGlvbnMgYW5kIGRlbGV0aW9ucyB3aXRoaW4gdGhlIGl0ZXJhdG9yIGFuZCByZXByb2R1Y2VcbiAqIHRob3NlIGNoYW5nZXMgaW4gdGhlIERPTS4gVGhpcyBoYXMgaW1wb3J0YW50IGltcGxpY2F0aW9ucyBmb3IgYW5pbWF0aW9ucyBhbmQgYW55IHN0YXRlZnVsXG4gKiBjb250cm9scyB0aGF0IGFyZSBwcmVzZW50LCBzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB0aGF0IGFjY2VwdCB1c2VyIGlucHV0LiBJbnNlcnRlZCByb3dzIGNhblxuICogYmUgYW5pbWF0ZWQgaW4sIGRlbGV0ZWQgcm93cyBjYW4gYmUgYW5pbWF0ZWQgb3V0LCBhbmQgdW5jaGFuZ2VkIHJvd3MgcmV0YWluIGFueSB1bnNhdmVkIHN0YXRlXG4gKiBzdWNoIGFzIHVzZXIgaW5wdXQuXG4gKiBGb3IgbW9yZSBvbiBhbmltYXRpb25zLCBzZWUgW1RyYW5zaXRpb25zIGFuZCBUcmlnZ2Vyc10oZ3VpZGUvYW5pbWF0aW9ucy90cmFuc2l0aW9uLWFuZC10cmlnZ2VycykuXG4gKlxuICogVGhlIGlkZW50aXRpZXMgb2YgZWxlbWVudHMgaW4gdGhlIGl0ZXJhdG9yIGNhbiBjaGFuZ2Ugd2hpbGUgdGhlIGRhdGEgZG9lcyBub3QuXG4gKiBUaGlzIGNhbiBoYXBwZW4sIGZvciBleGFtcGxlLCBpZiB0aGUgaXRlcmF0b3IgaXMgcHJvZHVjZWQgZnJvbSBhbiBSUEMgdG8gdGhlIHNlcnZlciwgYW5kIHRoYXRcbiAqIFJQQyBpcyByZS1ydW4uIEV2ZW4gaWYgdGhlIGRhdGEgaGFzbid0IGNoYW5nZWQsIHRoZSBzZWNvbmQgcmVzcG9uc2UgcHJvZHVjZXMgb2JqZWN0cyB3aXRoXG4gKiBkaWZmZXJlbnQgaWRlbnRpdGllcywgYW5kIEFuZ3VsYXIgbXVzdCB0ZWFyIGRvd24gdGhlIGVudGlyZSBET00gYW5kIHJlYnVpbGQgaXQgKGFzIGlmIGFsbCBvbGRcbiAqIGVsZW1lbnRzIHdlcmUgZGVsZXRlZCBhbmQgYWxsIG5ldyBlbGVtZW50cyBpbnNlcnRlZCkuXG4gKlxuICogVG8gYXZvaWQgdGhpcyBleHBlbnNpdmUgb3BlcmF0aW9uLCB5b3UgY2FuIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCB0cmFja2luZyBhbGdvcml0aG0uXG4gKiBieSBzdXBwbHlpbmcgdGhlIGB0cmFja0J5YCBvcHRpb24gdG8gYE5nRm9yT2ZgLlxuICogYHRyYWNrQnlgIHRha2VzIGEgZnVuY3Rpb24gdGhhdCBoYXMgdHdvIGFyZ3VtZW50czogYGluZGV4YCBhbmQgYGl0ZW1gLlxuICogSWYgYHRyYWNrQnlgIGlzIGdpdmVuLCBBbmd1bGFyIHRyYWNrcyBjaGFuZ2VzIGJ5IHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uLlxuICpcbiAqIEBzZWUgW1N0cnVjdHVyYWwgRGlyZWN0aXZlc10oZ3VpZGUvZGlyZWN0aXZlcy9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0Zvcl1bbmdGb3JPZl0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvck9mPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+ID0gTmdJdGVyYWJsZTxUPj4gaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqXG4gICAqIFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbiwgd2hpY2ggY2FuIGJlIHVzZWQgYXMgYVxuICAgKiBbdGVtcGxhdGUgaW5wdXQgdmFyaWFibGVdKGd1aWRlL2RpcmVjdGl2ZXMvc3RydWN0dXJhbC1kaXJlY3RpdmVzI3Nob3J0aGFuZCkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbmdGb3JPZihuZ0Zvck9mOiAoVSAmIE5nSXRlcmFibGU8VD4pIHwgdW5kZWZpbmVkIHwgbnVsbCkge1xuICAgIHRoaXMuX25nRm9yT2YgPSBuZ0Zvck9mO1xuICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IHRydWU7XG4gIH1cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhIGN1c3RvbSBgVHJhY2tCeUZ1bmN0aW9uYCB0byBjb21wdXRlIHRoZSBpZGVudGl0eSBvZiBpdGVtcyBpbiBhbiBpdGVyYWJsZS5cbiAgICpcbiAgICogSWYgYSBjdXN0b20gYFRyYWNrQnlGdW5jdGlvbmAgaXMgbm90IHByb3ZpZGVkLCBgTmdGb3JPZmAgd2lsbCB1c2UgdGhlIGl0ZW0ncyBbb2JqZWN0XG4gICAqIGlkZW50aXR5XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvaXMpXG4gICAqIGFzIHRoZSBrZXkuXG4gICAqXG4gICAqIGBOZ0Zvck9mYCB1c2VzIHRoZSBjb21wdXRlZCBrZXkgdG8gYXNzb2NpYXRlIGl0ZW1zIGluIGFuIGl0ZXJhYmxlIHdpdGggRE9NIGVsZW1lbnRzXG4gICAqIGl0IHByb2R1Y2VzIGZvciB0aGVzZSBpdGVtcy5cbiAgICpcbiAgICogQSBjdXN0b20gYFRyYWNrQnlGdW5jdGlvbmAgaXMgdXNlZnVsIHRvIHByb3ZpZGUgZ29vZCB1c2VyIGV4cGVyaWVuY2UgaW4gY2FzZXMgd2hlbiBpdGVtcyBpbiBhblxuICAgKiBpdGVyYWJsZSByZW5kZXJlZCB1c2luZyBgTmdGb3JPZmAgaGF2ZSBhIG5hdHVyYWwgaWRlbnRpZmllciAoZm9yIGV4YW1wbGUsIGN1c3RvbSBJRCBvciBhXG4gICAqIHByaW1hcnkga2V5KSwgYW5kIHRoaXMgaXRlcmFibGUgY291bGQgYmUgdXBkYXRlZCB3aXRoIG5ldyBvYmplY3QgaW5zdGFuY2VzIHRoYXQgc3RpbGxcbiAgICogcmVwcmVzZW50IHRoZSBzYW1lIHVuZGVybHlpbmcgZW50aXR5IChmb3IgZXhhbXBsZSwgd2hlbiBkYXRhIGlzIHJlLWZldGNoZWQgZnJvbSB0aGUgc2VydmVyLFxuICAgKiBhbmQgdGhlIGl0ZXJhYmxlIGlzIHJlY3JlYXRlZCBhbmQgcmUtcmVuZGVyZWQsIGJ1dCBtb3N0IG9mIHRoZSBkYXRhIGlzIHN0aWxsIHRoZSBzYW1lKS5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgVHJhY2tCeUZ1bmN0aW9ufVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXG4gICAgICAgICAgYFNlZSBodHRwczovL2FuZ3VsYXIuaW8vYXBpL2NvbW1vbi9OZ0Zvck9mI2NoYW5nZS1wcm9wYWdhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XG4gIH1cblxuICBnZXQgbmdGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcbiAgfVxuXG4gIHByaXZhdGUgX25nRm9yT2Y6IFUgfCB1bmRlZmluZWQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbmdGb3JPZkRpcnR5OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPiB8IG51bGwgPSBudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJ1xuICAvLyB3YWl0aW5nIGZvciBtaWNyb3NvZnQvdHlwZXNjcmlwdCM0MzY2MiB0byBhbGxvdyB0aGUgcmV0dXJuIHR5cGUgYFRyYWNrQnlGdW5jdGlvbnx1bmRlZmluZWRgIGZvclxuICAvLyB0aGUgZ2V0dGVyXG4gIHByaXZhdGUgX3RyYWNrQnlGbiE6IFRyYWNrQnlGdW5jdGlvbjxUPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4sXG4gICAgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICApIHt9XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSB0ZW1wbGF0ZSB0aGF0IGlzIHN0YW1wZWQgb3V0IGZvciBlYWNoIGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICAgKiBAc2VlIFt0ZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGVdKGd1aWRlL3RlbXBsYXRlcy92YXJpYWJsZXMjdGVtcGxhdGUtcmVmZXJlbmNlLXZhcmlhYmxlcylcbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0ZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4pIHtcbiAgICAvLyBUT0RPKFRTMi4xKTogbWFrZSBUZW1wbGF0ZVJlZjxQYXJ0aWFsPE5nRm9yUm93T2Y8VD4+PiBvbmNlIHdlIG1vdmUgdG8gVFMgdjIuMVxuICAgIC8vIFRoZSBjdXJyZW50IHR5cGUgaXMgdG9vIHJlc3RyaWN0aXZlOyBhIHRlbXBsYXRlIHRoYXQganVzdCB1c2VzIGluZGV4LCBmb3IgZXhhbXBsZSxcbiAgICAvLyBzaG91bGQgYmUgYWNjZXB0YWJsZS5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIGNoYW5nZXMgd2hlbiBuZWVkZWQuXG4gICAqIEBub2RvY1xuICAgKi9cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9uZ0Zvck9mRGlydHkpIHtcbiAgICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IGZhbHNlO1xuICAgICAgLy8gUmVhY3Qgb24gbmdGb3JPZiBjaGFuZ2VzIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9uZ0Zvck9mO1xuICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDQVVUSU9OOiB0aGlzIGxvZ2ljIGlzIGR1cGxpY2F0ZWQgZm9yIHByb2R1Y3Rpb24gbW9kZSBiZWxvdywgYXMgdGhlIHRyeS1jYXRjaFxuICAgICAgICAgICAgLy8gaXMgb25seSBwcmVzZW50IGluIGRldmVsb3BtZW50IGJ1aWxkcy5cbiAgICAgICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZSkuY3JlYXRlKHRoaXMubmdGb3JUcmFja0J5KTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGxldCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7dmFsdWV9JyBvZiB0eXBlICdgICtcbiAgICAgICAgICAgICAgYCR7Z2V0VHlwZU5hbWUodmFsdWUpfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMsIHN1Y2ggYXMgQXJyYXlzLmA7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgKz0gJyBEaWQgeW91IG1lYW4gdG8gdXNlIHRoZSBrZXl2YWx1ZSBwaXBlPyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFJ1bnRpbWVFcnJvckNvZGUuTkdfRk9SX01JU1NJTkdfRElGRkVSLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDQVVUSU9OOiB0aGlzIGxvZ2ljIGlzIGR1cGxpY2F0ZWQgZm9yIGRldmVsb3BtZW50IG1vZGUgYWJvdmUsIGFzIHRoZSB0cnktY2F0Y2hcbiAgICAgICAgICAvLyBpcyBvbmx5IHByZXNlbnQgaW4gZGV2ZWxvcG1lbnQgYnVpbGRzLlxuICAgICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZSkuY3JlYXRlKHRoaXMubmdGb3JUcmFja0J5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdGb3JPZik7XG4gICAgICBpZiAoY2hhbmdlcykgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8VD4pIHtcbiAgICBjb25zdCB2aWV3Q29udGFpbmVyID0gdGhpcy5fdmlld0NvbnRhaW5lcjtcbiAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oXG4gICAgICAoXG4gICAgICAgIGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFQ+LFxuICAgICAgICBhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciB8IG51bGwsXG4gICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgICAgICkgPT4ge1xuICAgICAgICBpZiAoaXRlbS5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAvLyBOZ0Zvck9mIGlzIG5ldmVyIFwibnVsbFwiIG9yIFwidW5kZWZpbmVkXCIgaGVyZSBiZWNhdXNlIHRoZSBkaWZmZXIgZGV0ZWN0ZWRcbiAgICAgICAgICAvLyB0aGF0IGEgbmV3IGl0ZW0gbmVlZHMgdG8gYmUgaW5zZXJ0ZWQgZnJvbSB0aGUgaXRlcmFibGUuIFRoaXMgaW1wbGllcyB0aGF0XG4gICAgICAgICAgLy8gdGhlcmUgaXMgYW4gaXRlcmFibGUgdmFsdWUgZm9yIFwiX25nRm9yT2ZcIi5cbiAgICAgICAgICB2aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlLFxuICAgICAgICAgICAgbmV3IE5nRm9yT2ZDb250ZXh0PFQsIFU+KGl0ZW0uaXRlbSwgdGhpcy5fbmdGb3JPZiEsIC0xLCAtMSksXG4gICAgICAgICAgICBjdXJyZW50SW5kZXggPT09IG51bGwgPyB1bmRlZmluZWQgOiBjdXJyZW50SW5kZXgsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgIHZpZXdDb250YWluZXIucmVtb3ZlKGFkanVzdGVkUHJldmlvdXNJbmRleCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGFkanVzdGVkUHJldmlvdXNJbmRleCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWRqdXN0ZWRQcmV2aW91c0luZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgdmlldyA9IHZpZXdDb250YWluZXIuZ2V0KGFkanVzdGVkUHJldmlvdXNJbmRleCkhO1xuICAgICAgICAgIHZpZXdDb250YWluZXIubW92ZSh2aWV3LCBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgIGFwcGx5Vmlld0NoYW5nZSh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4sIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICk7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgaWxlbiA9IHZpZXdDb250YWluZXIubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICBjb25zdCB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4+dmlld0NvbnRhaW5lci5nZXQoaSk7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdmlld1JlZi5jb250ZXh0O1xuICAgICAgY29udGV4dC5pbmRleCA9IGk7XG4gICAgICBjb250ZXh0LmNvdW50ID0gaWxlbjtcbiAgICAgIGNvbnRleHQubmdGb3JPZiA9IHRoaXMuX25nRm9yT2YhO1xuICAgIH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xuICAgICAgY29uc3Qgdmlld1JlZiA9IDxFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VCwgVT4+PnZpZXdDb250YWluZXIuZ2V0KHJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgYXBwbHlWaWV3Q2hhbmdlKHZpZXdSZWYsIHJlY29yZCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBjb250ZXh0IGZvciB0aGUgdGVtcGxhdGUgdGhhdCBgTmdGb3JPZmAgd2lsbCByZW5kZXIuXG4gICAqXG4gICAqIFRoZSBwcmVzZW5jZSBvZiB0aGlzIG1ldGhvZCBpcyBhIHNpZ25hbCB0byB0aGUgSXZ5IHRlbXBsYXRlIHR5cGUtY2hlY2sgY29tcGlsZXIgdGhhdCB0aGVcbiAgICogYE5nRm9yT2ZgIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHJlbmRlcnMgaXRzIHRlbXBsYXRlIHdpdGggYSBzcGVjaWZpYyBjb250ZXh0IHR5cGUuXG4gICAqL1xuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxULCBVIGV4dGVuZHMgTmdJdGVyYWJsZTxUPj4oXG4gICAgZGlyOiBOZ0Zvck9mPFQsIFU+LFxuICAgIGN0eDogYW55LFxuICApOiBjdHggaXMgTmdGb3JPZkNvbnRleHQ8VCwgVT4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8vIEFsc28gZXhwb3J0IHRoZSBgTmdGb3JPZmAgY2xhc3MgYXMgYE5nRm9yYCB0byBpbXByb3ZlIHRoZSBEWCBmb3Jcbi8vIGNhc2VzIHdoZW4gdGhlIGRpcmVjdGl2ZSBpcyB1c2VkIGFzIHN0YW5kYWxvbmUsIHNvIHRoZSBjbGFzcyBuYW1lXG4vLyBtYXRjaGVzIHRoZSBDU1Mgc2VsZWN0b3IgKCpuZ0ZvcikuXG5leHBvcnQge05nRm9yT2YgYXMgTmdGb3J9O1xuXG5mdW5jdGlvbiBhcHBseVZpZXdDaGFuZ2U8VD4oXG4gIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxUPj4sXG4gIHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8VD4sXG4pIHtcbiAgdmlldy5jb250ZXh0LiRpbXBsaWNpdCA9IHJlY29yZC5pdGVtO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlTmFtZSh0eXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xufVxuIl19