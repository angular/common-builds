/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, ɵRuntimeError as RuntimeError } from '@angular/core';
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
 * For further discussion, see
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
class NgForOf {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-bb6a3e8", ngImport: i0, type: NgForOf, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: i0.IterableDiffers }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.1.0-next.0+sha-bb6a3e8", type: NgForOf, isStandalone: true, selector: "[ngFor][ngForOf]", inputs: { ngForOf: "ngForOf", ngForTrackBy: "ngForTrackBy", ngForTemplate: "ngForTemplate" }, ngImport: i0 }); }
}
export { NgForOf };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-bb6a3e8", ngImport: i0, type: NgForOf, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngFor][ngForOf]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: i0.IterableDiffers }]; }, propDecorators: { ngForOf: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUE0QixLQUFLLEVBQXlELGVBQWUsRUFBYyxXQUFXLEVBQW1CLGdCQUFnQixFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBSzVPOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFDekIsWUFBbUIsU0FBWSxFQUFTLE9BQVUsRUFBUyxLQUFhLEVBQVMsS0FBYTtRQUEzRSxjQUFTLEdBQVQsU0FBUyxDQUFHO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBRztRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUcsQ0FBQztJQUVsRyxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxJQUFJLEdBQUc7UUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlHRztBQUNILE1BSWEsT0FBTztJQUNsQjs7O09BR0c7SUFDSCxJ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c291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbWJlZGRlZFZpZXdSZWYsIElucHV0LCBJdGVyYWJsZUNoYW5nZVJlY29yZCwgSXRlcmFibGVDaGFuZ2VzLCBJdGVyYWJsZURpZmZlciwgSXRlcmFibGVEaWZmZXJzLCBOZ0l0ZXJhYmxlLCBUZW1wbGF0ZVJlZiwgVHJhY2tCeUZ1bmN0aW9uLCBWaWV3Q29udGFpbmVyUmVmLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ0Zvck9mQ29udGV4dDxULCBVIGV4dGVuZHMgTmdJdGVyYWJsZTxUPiA9IE5nSXRlcmFibGU8VD4+IHtcbiAgY29uc3RydWN0b3IocHVibGljICRpbXBsaWNpdDogVCwgcHVibGljIG5nRm9yT2Y6IFUsIHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgY291bnQ6IG51bWJlcikge31cblxuICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IDA7XG4gIH1cblxuICBnZXQgbGFzdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleCA9PT0gdGhpcy5jb3VudCAtIDE7XG4gIH1cblxuICBnZXQgZXZlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7XG4gIH1cblxuICBnZXQgb2RkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5ldmVuO1xuICB9XG59XG5cbi8qKlxuICogQSBbc3RydWN0dXJhbCBkaXJlY3RpdmVdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcykgdGhhdCByZW5kZXJzXG4gKiBhIHRlbXBsYXRlIGZvciBlYWNoIGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICogVGhlIGRpcmVjdGl2ZSBpcyBwbGFjZWQgb24gYW4gZWxlbWVudCwgd2hpY2ggYmVjb21lcyB0aGUgcGFyZW50XG4gKiBvZiB0aGUgY2xvbmVkIHRlbXBsYXRlcy5cbiAqXG4gKiBUaGUgYG5nRm9yT2ZgIGRpcmVjdGl2ZSBpcyBnZW5lcmFsbHkgdXNlZCBpbiB0aGVcbiAqIFtzaG9ydGhhbmQgZm9ybV0oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzI2FzdGVyaXNrKSBgKm5nRm9yYC5cbiAqIEluIHRoaXMgZm9ybSwgdGhlIHRlbXBsYXRlIHRvIGJlIHJlbmRlcmVkIGZvciBlYWNoIGl0ZXJhdGlvbiBpcyB0aGUgY29udGVudFxuICogb2YgYW4gYW5jaG9yIGVsZW1lbnQgY29udGFpbmluZyB0aGUgZGlyZWN0aXZlLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyB0aGUgc2hvcnRoYW5kIHN5bnRheCB3aXRoIHNvbWUgb3B0aW9ucyxcbiAqIGNvbnRhaW5lZCBpbiBhbiBgPGxpPmAgZWxlbWVudC5cbiAqXG4gKiBgYGBcbiAqIDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgaW5kZXggYXMgaTsgdHJhY2tCeTogdHJhY2tCeUZuXCI+Li4uPC9saT5cbiAqIGBgYFxuICpcbiAqIFRoZSBzaG9ydGhhbmQgZm9ybSBleHBhbmRzIGludG8gYSBsb25nIGZvcm0gdGhhdCB1c2VzIHRoZSBgbmdGb3JPZmAgc2VsZWN0b3JcbiAqIG9uIGFuIGA8bmctdGVtcGxhdGU+YCBlbGVtZW50LlxuICogVGhlIGNvbnRlbnQgb2YgdGhlIGA8bmctdGVtcGxhdGU+YCBlbGVtZW50IGlzIHRoZSBgPGxpPmAgZWxlbWVudCB0aGF0IGhlbGQgdGhlXG4gKiBzaG9ydC1mb3JtIGRpcmVjdGl2ZS5cbiAqXG4gKiBIZXJlIGlzIHRoZSBleHBhbmRlZCB2ZXJzaW9uIG9mIHRoZSBzaG9ydC1mb3JtIGV4YW1wbGUuXG4gKlxuICogYGBgXG4gKiA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIiBsZXQtaT1cImluZGV4XCIgW25nRm9yVHJhY2tCeV09XCJ0cmFja0J5Rm5cIj5cbiAqICAgPGxpPi4uLjwvbGk+XG4gKiA8L25nLXRlbXBsYXRlPlxuICogYGBgXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IGV4cGFuZHMgdGhlIHNob3J0aGFuZCBzeW50YXggYXMgaXQgY29tcGlsZXMgdGhlIHRlbXBsYXRlLlxuICogVGhlIGNvbnRleHQgZm9yIGVhY2ggZW1iZWRkZWQgdmlldyBpcyBsb2dpY2FsbHkgbWVyZ2VkIHRvIHRoZSBjdXJyZW50IGNvbXBvbmVudFxuICogY29udGV4dCBhY2NvcmRpbmcgdG8gaXRzIGxleGljYWwgcG9zaXRpb24uXG4gKlxuICogV2hlbiB1c2luZyB0aGUgc2hvcnRoYW5kIHN5bnRheCwgQW5ndWxhciBhbGxvd3Mgb25seSBbb25lIHN0cnVjdHVyYWwgZGlyZWN0aXZlXG4gKiBvbiBhbiBlbGVtZW50XShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjb25lLXBlci1lbGVtZW50KS5cbiAqIElmIHlvdSB3YW50IHRvIGl0ZXJhdGUgY29uZGl0aW9uYWxseSwgZm9yIGV4YW1wbGUsXG4gKiBwdXQgdGhlIGAqbmdJZmAgb24gYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIHRoZSBgKm5nRm9yYCBlbGVtZW50LlxuICogRm9yIGZ1cnRoZXIgZGlzY3Vzc2lvbiwgc2VlXG4gKiBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjb25lLXBlci1lbGVtZW50KS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBMb2NhbCB2YXJpYWJsZXNcbiAqXG4gKiBgTmdGb3JPZmAgcHJvdmlkZXMgZXhwb3J0ZWQgdmFsdWVzIHRoYXQgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzLlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogIGBgYFxuICogPGxpICpuZ0Zvcj1cImxldCB1c2VyIG9mIHVzZXJzOyBpbmRleCBhcyBpOyBmaXJzdCBhcyBpc0ZpcnN0XCI+XG4gKiAgICB7e2l9fS97e3VzZXJzLmxlbmd0aH19LiB7e3VzZXJ9fSA8c3BhbiAqbmdJZj1cImlzRmlyc3RcIj5kZWZhdWx0PC9zcGFuPlxuICogPC9saT5cbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhwb3J0ZWQgdmFsdWVzIGNhbiBiZSBhbGlhc2VkIHRvIGxvY2FsIHZhcmlhYmxlczpcbiAqXG4gKiAtIGAkaW1wbGljaXQ6IFRgOiBUaGUgdmFsdWUgb2YgdGhlIGluZGl2aWR1YWwgaXRlbXMgaW4gdGhlIGl0ZXJhYmxlIChgbmdGb3JPZmApLlxuICogLSBgbmdGb3JPZjogTmdJdGVyYWJsZTxUPmA6IFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbi4gVXNlZnVsIHdoZW4gdGhlIGV4cHJlc3Npb24gaXNcbiAqIG1vcmUgY29tcGxleCB0aGVuIGEgcHJvcGVydHkgYWNjZXNzLCBmb3IgZXhhbXBsZSB3aGVuIHVzaW5nIHRoZSBhc3luYyBwaXBlIChgdXNlclN0cmVhbXMgfFxuICogYXN5bmNgKS5cbiAqIC0gYGluZGV4OiBudW1iZXJgOiBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBjb3VudDogbnVtYmVyYDogVGhlIGxlbmd0aCBvZiB0aGUgaXRlcmFibGUuXG4gKiAtIGBmaXJzdDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBpcyB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBsYXN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgZXZlbjogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gZXZlbiBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBvZGQ6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaGFzIGFuIG9kZCBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKlxuICogIyMjIENoYW5nZSBwcm9wYWdhdGlvblxuICpcbiAqIFdoZW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBpdGVyYXRvciBjaGFuZ2VzLCBgTmdGb3JPZmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHMgdGhhdCBhcmUgcHJlc2VudCwgc3VjaCBhcyBgPGlucHV0PmAgZWxlbWVudHMgdGhhdCBhY2NlcHQgdXNlciBpbnB1dC4gSW5zZXJ0ZWQgcm93cyBjYW5cbiAqIGJlIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZVxuICogc3VjaCBhcyB1c2VyIGlucHV0LlxuICogRm9yIG1vcmUgb24gYW5pbWF0aW9ucywgc2VlIFtUcmFuc2l0aW9ucyBhbmQgVHJpZ2dlcnNdKGd1aWRlL3RyYW5zaXRpb24tYW5kLXRyaWdnZXJzKS5cbiAqXG4gKiBUaGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgY2FuIGNoYW5nZSB3aGlsZSB0aGUgZGF0YSBkb2VzIG5vdC5cbiAqIFRoaXMgY2FuIGhhcHBlbiwgZm9yIGV4YW1wbGUsIGlmIHRoZSBpdGVyYXRvciBpcyBwcm9kdWNlZCBmcm9tIGFuIFJQQyB0byB0aGUgc2VydmVyLCBhbmQgdGhhdFxuICogUlBDIGlzIHJlLXJ1bi4gRXZlbiBpZiB0aGUgZGF0YSBoYXNuJ3QgY2hhbmdlZCwgdGhlIHNlY29uZCByZXNwb25zZSBwcm9kdWNlcyBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciBtdXN0IHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS5cbiAqXG4gKiBUbyBhdm9pZCB0aGlzIGV4cGVuc2l2ZSBvcGVyYXRpb24sIHlvdSBjYW4gY3VzdG9taXplIHRoZSBkZWZhdWx0IHRyYWNraW5nIGFsZ29yaXRobS5cbiAqIGJ5IHN1cHBseWluZyB0aGUgYHRyYWNrQnlgIG9wdGlvbiB0byBgTmdGb3JPZmAuXG4gKiBgdHJhY2tCeWAgdGFrZXMgYSBmdW5jdGlvbiB0aGF0IGhhcyB0d28gYXJndW1lbnRzOiBgaW5kZXhgIGFuZCBgaXRlbWAuXG4gKiBJZiBgdHJhY2tCeWAgaXMgZ2l2ZW4sIEFuZ3VsYXIgdHJhY2tzIGNoYW5nZXMgYnkgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24uXG4gKlxuICogQHNlZSBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0Zvcl1bbmdGb3JPZl0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvck9mPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+ID0gTmdJdGVyYWJsZTxUPj4gaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqXG4gICAqIFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbiwgd2hpY2ggY2FuIGJlIHVzZWQgYXMgYVxuICAgKiBbdGVtcGxhdGUgaW5wdXQgdmFyaWFibGVdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNzaG9ydGhhbmQpLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yT2YobmdGb3JPZjogVSZOZ0l0ZXJhYmxlPFQ+fHVuZGVmaW5lZHxudWxsKSB7XG4gICAgdGhpcy5fbmdGb3JPZiA9IG5nRm9yT2Y7XG4gICAgdGhpcy5fbmdGb3JPZkRpcnR5ID0gdHJ1ZTtcbiAgfVxuICAvKipcbiAgICogU3BlY2lmaWVzIGEgY3VzdG9tIGBUcmFja0J5RnVuY3Rpb25gIHRvIGNvbXB1dGUgdGhlIGlkZW50aXR5IG9mIGl0ZW1zIGluIGFuIGl0ZXJhYmxlLlxuICAgKlxuICAgKiBJZiBhIGN1c3RvbSBgVHJhY2tCeUZ1bmN0aW9uYCBpcyBub3QgcHJvdmlkZWQsIGBOZ0Zvck9mYCB3aWxsIHVzZSB0aGUgaXRlbSdzIFtvYmplY3RcbiAgICogaWRlbnRpdHldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9pcylcbiAgICogYXMgdGhlIGtleS5cbiAgICpcbiAgICogYE5nRm9yT2ZgIHVzZXMgdGhlIGNvbXB1dGVkIGtleSB0byBhc3NvY2lhdGUgaXRlbXMgaW4gYW4gaXRlcmFibGUgd2l0aCBET00gZWxlbWVudHNcbiAgICogaXQgcHJvZHVjZXMgZm9yIHRoZXNlIGl0ZW1zLlxuICAgKlxuICAgKiBBIGN1c3RvbSBgVHJhY2tCeUZ1bmN0aW9uYCBpcyB1c2VmdWwgdG8gcHJvdmlkZSBnb29kIHVzZXIgZXhwZXJpZW5jZSBpbiBjYXNlcyB3aGVuIGl0ZW1zIGluIGFuXG4gICAqIGl0ZXJhYmxlIHJlbmRlcmVkIHVzaW5nIGBOZ0Zvck9mYCBoYXZlIGEgbmF0dXJhbCBpZGVudGlmaWVyIChmb3IgZXhhbXBsZSwgY3VzdG9tIElEIG9yIGFcbiAgICogcHJpbWFyeSBrZXkpLCBhbmQgdGhpcyBpdGVyYWJsZSBjb3VsZCBiZSB1cGRhdGVkIHdpdGggbmV3IG9iamVjdCBpbnN0YW5jZXMgdGhhdCBzdGlsbFxuICAgKiByZXByZXNlbnQgdGhlIHNhbWUgdW5kZXJseWluZyBlbnRpdHkgKGZvciBleGFtcGxlLCB3aGVuIGRhdGEgaXMgcmUtZmV0Y2hlZCBmcm9tIHRoZSBzZXJ2ZXIsXG4gICAqIGFuZCB0aGUgaXRlcmFibGUgaXMgcmVjcmVhdGVkIGFuZCByZS1yZW5kZXJlZCwgYnV0IG1vc3Qgb2YgdGhlIGRhdGEgaXMgc3RpbGwgdGhlIHNhbWUpLlxuICAgKlxuICAgKiBAc2VlIGBUcmFja0J5RnVuY3Rpb25gXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbmdGb3JUcmFja0J5KGZuOiBUcmFja0J5RnVuY3Rpb248VD4pIHtcbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgZm4gIT0gbnVsbCAmJiB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xuICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9jb21tb24vTmdGb3JPZiNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XG4gICAgfVxuICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xuICB9XG5cbiAgZ2V0IG5nRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xuICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XG4gIH1cblxuICBwcml2YXRlIF9uZ0Zvck9mOiBVfHVuZGVmaW5lZHxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbmdGb3JPZkRpcnR5OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPnxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnISdcbiAgLy8gd2FpdGluZyBmb3IgbWljcm9zb2Z0L3R5cGVzY3JpcHQjNDM2NjIgdG8gYWxsb3cgdGhlIHJldHVybiB0eXBlIGBUcmFja0J5RnVuY3Rpb258dW5kZWZpbmVkYCBmb3JcbiAgLy8gdGhlIGdldHRlclxuICBwcml2YXRlIF90cmFja0J5Rm4hOiBUcmFja0J5RnVuY3Rpb248VD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgcHJpdmF0ZSBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+PiwgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzKSB7fVxuXG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgdGVtcGxhdGUgdGhhdCBpcyBzdGFtcGVkIG91dCBmb3IgZWFjaCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAgICogQHNlZSBbdGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlXShndWlkZS90ZW1wbGF0ZS1yZWZlcmVuY2UtdmFyaWFibGVzKVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pikge1xuICAgIC8vIFRPRE8oVFMyLjEpOiBtYWtlIFRlbXBsYXRlUmVmPFBhcnRpYWw8TmdGb3JSb3dPZjxUPj4+IG9uY2Ugd2UgbW92ZSB0byBUUyB2Mi4xXG4gICAgLy8gVGhlIGN1cnJlbnQgdHlwZSBpcyB0b28gcmVzdHJpY3RpdmU7IGEgdGVtcGxhdGUgdGhhdCBqdXN0IHVzZXMgaW5kZXgsIGZvciBleGFtcGxlLFxuICAgIC8vIHNob3VsZCBiZSBhY2NlcHRhYmxlLlxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgY2hhbmdlcyB3aGVuIG5lZWRlZC5cbiAgICogQG5vZG9jXG4gICAqL1xuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX25nRm9yT2ZEaXJ0eSkge1xuICAgICAgdGhpcy5fbmdGb3JPZkRpcnR5ID0gZmFsc2U7XG4gICAgICAvLyBSZWFjdCBvbiBuZ0Zvck9mIGNoYW5nZXMgb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX25nRm9yT2Y7XG4gICAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENBVVRJT046IHRoaXMgbG9naWMgaXMgZHVwbGljYXRlZCBmb3IgcHJvZHVjdGlvbiBtb2RlIGJlbG93LCBhcyB0aGUgdHJ5LWNhdGNoXG4gICAgICAgICAgICAvLyBpcyBvbmx5IHByZXNlbnQgaW4gZGV2ZWxvcG1lbnQgYnVpbGRzLlxuICAgICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5uZ0ZvclRyYWNrQnkpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHt2YWx1ZX0nIG9mIHR5cGUgJ2AgK1xuICAgICAgICAgICAgICAgIGAke2dldFR5cGVOYW1lKHZhbHVlKX0nLiBOZ0ZvciBvbmx5IHN1cHBvcnRzIGJpbmRpbmcgdG8gSXRlcmFibGVzLCBzdWNoIGFzIEFycmF5cy5gO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlICs9ICcgRGlkIHlvdSBtZWFuIHRvIHVzZSB0aGUga2V5dmFsdWUgcGlwZT8nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLk5HX0ZPUl9NSVNTSU5HX0RJRkZFUiwgZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ0FVVElPTjogdGhpcyBsb2dpYyBpcyBkdXBsaWNhdGVkIGZvciBkZXZlbG9wbWVudCBtb2RlIGFib3ZlLCBhcyB0aGUgdHJ5LWNhdGNoXG4gICAgICAgICAgLy8gaXMgb25seSBwcmVzZW50IGluIGRldmVsb3BtZW50IGJ1aWxkcy5cbiAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLm5nRm9yVHJhY2tCeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX2RpZmZlcikge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nRm9yT2YpO1xuICAgICAgaWYgKGNoYW5nZXMpIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XG4gICAgY29uc3Qgdmlld0NvbnRhaW5lciA9IHRoaXMuX3ZpZXdDb250YWluZXI7XG4gICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKFxuICAgICAgICAoaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8VD4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyfG51bGwsXG4gICAgICAgICBjdXJyZW50SW5kZXg6IG51bWJlcnxudWxsKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBOZ0Zvck9mIGlzIG5ldmVyIFwibnVsbFwiIG9yIFwidW5kZWZpbmVkXCIgaGVyZSBiZWNhdXNlIHRoZSBkaWZmZXIgZGV0ZWN0ZWRcbiAgICAgICAgICAgIC8vIHRoYXQgYSBuZXcgaXRlbSBuZWVkcyB0byBiZSBpbnNlcnRlZCBmcm9tIHRoZSBpdGVyYWJsZS4gVGhpcyBpbXBsaWVzIHRoYXRcbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIGFuIGl0ZXJhYmxlIHZhbHVlIGZvciBcIl9uZ0Zvck9mXCIuXG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZSwgbmV3IE5nRm9yT2ZDb250ZXh0PFQsIFU+KGl0ZW0uaXRlbSwgdGhpcy5fbmdGb3JPZiEsIC0xLCAtMSksXG4gICAgICAgICAgICAgICAgY3VycmVudEluZGV4ID09PSBudWxsID8gdW5kZWZpbmVkIDogY3VycmVudEluZGV4KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyLnJlbW92ZShcbiAgICAgICAgICAgICAgICBhZGp1c3RlZFByZXZpb3VzSW5kZXggPT09IG51bGwgPyB1bmRlZmluZWQgOiBhZGp1c3RlZFByZXZpb3VzSW5kZXgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYWRqdXN0ZWRQcmV2aW91c0luZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gdmlld0NvbnRhaW5lci5nZXQoYWRqdXN0ZWRQcmV2aW91c0luZGV4KSE7XG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyLm1vdmUodmlldywgY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGFwcGx5Vmlld0NoYW5nZSh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4sIGl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgaWxlbiA9IHZpZXdDb250YWluZXIubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICBjb25zdCB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4+dmlld0NvbnRhaW5lci5nZXQoaSk7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdmlld1JlZi5jb250ZXh0O1xuICAgICAgY29udGV4dC5pbmRleCA9IGk7XG4gICAgICBjb250ZXh0LmNvdW50ID0gaWxlbjtcbiAgICAgIGNvbnRleHQubmdGb3JPZiA9IHRoaXMuX25nRm9yT2YhO1xuICAgIH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xuICAgICAgY29uc3Qgdmlld1JlZiA9IDxFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VCwgVT4+PnZpZXdDb250YWluZXIuZ2V0KHJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgYXBwbHlWaWV3Q2hhbmdlKHZpZXdSZWYsIHJlY29yZCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBjb250ZXh0IGZvciB0aGUgdGVtcGxhdGUgdGhhdCBgTmdGb3JPZmAgd2lsbCByZW5kZXIuXG4gICAqXG4gICAqIFRoZSBwcmVzZW5jZSBvZiB0aGlzIG1ldGhvZCBpcyBhIHNpZ25hbCB0byB0aGUgSXZ5IHRlbXBsYXRlIHR5cGUtY2hlY2sgY29tcGlsZXIgdGhhdCB0aGVcbiAgICogYE5nRm9yT2ZgIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHJlbmRlcnMgaXRzIHRlbXBsYXRlIHdpdGggYSBzcGVjaWZpYyBjb250ZXh0IHR5cGUuXG4gICAqL1xuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxULCBVIGV4dGVuZHMgTmdJdGVyYWJsZTxUPj4oZGlyOiBOZ0Zvck9mPFQsIFU+LCBjdHg6IGFueSk6XG4gICAgICBjdHggaXMgTmdGb3JPZkNvbnRleHQ8VCwgVT4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8vIEFsc28gZXhwb3J0IHRoZSBgTmdGb3JPZmAgY2xhc3MgYXMgYE5nRm9yYCB0byBpbXByb3ZlIHRoZSBEWCBmb3Jcbi8vIGNhc2VzIHdoZW4gdGhlIGRpcmVjdGl2ZSBpcyB1c2VkIGFzIHN0YW5kYWxvbmUsIHNvIHRoZSBjbGFzcyBuYW1lXG4vLyBtYXRjaGVzIHRoZSBDU1Mgc2VsZWN0b3IgKCpuZ0ZvcikuXG5leHBvcnQge05nRm9yT2YgYXMgTmdGb3J9O1xuXG5mdW5jdGlvbiBhcHBseVZpZXdDaGFuZ2U8VD4oXG4gICAgdmlldzogRW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+PiwgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxUPikge1xuICB2aWV3LmNvbnRleHQuJGltcGxpY2l0ID0gcmVjb3JkLml0ZW07XG59XG5cbmZ1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGU6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XG59XG4iXX0=