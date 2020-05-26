/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Directive, Input, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
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
let NgForOf = /** @class */ (() => {
    let NgForOf = class NgForOf {
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
         * [template input variable](guide/structural-directives#template-input-variable).
         */
        set ngForOf(ngForOf) {
            this._ngForOf = ngForOf;
            this._ngForOfDirty = true;
        }
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
        set ngForTrackBy(fn) {
            if (isDevMode() && fn != null && typeof fn !== 'function') {
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
         * @see [template reference variable](guide/template-syntax#template-reference-variables--var-)
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
         */
        ngDoCheck() {
            if (this._ngForOfDirty) {
                this._ngForOfDirty = false;
                // React on ngForOf changes only once all inputs have been initialized
                const value = this._ngForOf;
                if (!this._differ && value) {
                    try {
                        this._differ = this._differs.find(value).create(this.ngForTrackBy);
                    }
                    catch (_a) {
                        throw new Error(`Cannot find a differ supporting object '${value}' of type '${getTypeName(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
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
                    // NgForOf is never "null" or "undefined" here because the differ detected
                    // that a new item needs to be inserted from the iterable. This implies that
                    // there is an iterable value for "_ngForOf".
                    const view = this._viewContainer.createEmbeddedView(this._template, new NgForOfContext(null, this._ngForOf, -1, -1), currentIndex === null ? undefined : currentIndex);
                    const tuple = new RecordViewTuple(item, view);
                    insertTuples.push(tuple);
                }
                else if (currentIndex == null) {
                    this._viewContainer.remove(adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);
                }
                else if (adjustedPreviousIndex !== null) {
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
                viewRef.context.ngForOf = this._ngForOf;
            }
            changes.forEachIdentityChange((record) => {
                const viewRef = this._viewContainer.get(record.currentIndex);
                viewRef.context.$implicit = record.item;
            });
        }
        _perViewChange(view, record) {
            view.context.$implicit = record.item;
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
        __metadata("design:paramtypes", [ViewContainerRef,
            TemplateRef, IterableDiffers])
    ], NgForOf);
    return NgForOf;
})();
export { NgForOf };
class RecordViewTuple {
    constructor(record, view) {
        this.record = record;
        this.view = view;
    }
}
function getTypeName(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBNEIsS0FBSyxFQUFFLFNBQVMsRUFBeUQsZUFBZSxFQUFjLFdBQVcsRUFBbUIsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFeE47O0dBRUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQUN6QixZQUFtQixTQUFZLEVBQVMsT0FBVSxFQUFTLEtBQWEsRUFBUyxLQUFhO1FBQTNFLGNBQVMsR0FBVCxTQUFTLENBQUc7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFHO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7SUFBRyxDQUFDO0lBRWxHLElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQUksR0FBRztRQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUdHO0FBRUg7SUFBQSxJQUFhLE9BQU8sR0FBcEIsTUFBYSxPQUFPO1FBa0RsQixZ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RixPQUFPLENBcUpuQjtJQUFELGNBQUM7S0FBQTtTQXJKWSxPQUFPO0FBdUpwQixNQUFNLGVBQWU7SUFDbkIsWUFBbUIsTUFBVyxFQUFTLElBQTJDO1FBQS9ELFdBQU0sR0FBTixNQUFNLENBQUs7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUF1QztJQUFHLENBQUM7Q0FDdkY7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFTO0lBQzVCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEVtYmVkZGVkVmlld1JlZiwgSW5wdXQsIGlzRGV2TW9kZSwgSXRlcmFibGVDaGFuZ2VSZWNvcmQsIEl0ZXJhYmxlQ2hhbmdlcywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgTmdJdGVyYWJsZSwgVGVtcGxhdGVSZWYsIFRyYWNrQnlGdW5jdGlvbiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdGb3JPZkNvbnRleHQ8VCwgVSBleHRlbmRzIE5nSXRlcmFibGU8VD4gPSBOZ0l0ZXJhYmxlPFQ+PiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyAkaW1wbGljaXQ6IFQsIHB1YmxpYyBuZ0Zvck9mOiBVLCBwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGNvdW50OiBudW1iZXIpIHt9XG5cbiAgZ2V0IGZpcnN0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmluZGV4ID09PSAwO1xuICB9XG5cbiAgZ2V0IGxhc3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IHRoaXMuY291bnQgLSAxO1xuICB9XG5cbiAgZ2V0IGV2ZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggJSAyID09PSAwO1xuICB9XG5cbiAgZ2V0IG9kZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuZXZlbjtcbiAgfVxufVxuXG4vKipcbiAqIEEgW3N0cnVjdHVyYWwgZGlyZWN0aXZlXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpIHRoYXQgcmVuZGVyc1xuICogYSB0ZW1wbGF0ZSBmb3IgZWFjaCBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAqIFRoZSBkaXJlY3RpdmUgaXMgcGxhY2VkIG9uIGFuIGVsZW1lbnQsIHdoaWNoIGJlY29tZXMgdGhlIHBhcmVudFxuICogb2YgdGhlIGNsb25lZCB0ZW1wbGF0ZXMuXG4gKlxuICogVGhlIGBuZ0Zvck9mYCBkaXJlY3RpdmUgaXMgZ2VuZXJhbGx5IHVzZWQgaW4gdGhlXG4gKiBbc2hvcnRoYW5kIGZvcm1dKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyN0aGUtYXN0ZXJpc2stLXByZWZpeCkgYCpuZ0ZvcmAuXG4gKiBJbiB0aGlzIGZvcm0sIHRoZSB0ZW1wbGF0ZSB0byBiZSByZW5kZXJlZCBmb3IgZWFjaCBpdGVyYXRpb24gaXMgdGhlIGNvbnRlbnRcbiAqIG9mIGFuIGFuY2hvciBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgdGhlIHNob3J0aGFuZCBzeW50YXggd2l0aCBzb21lIG9wdGlvbnMsXG4gKiBjb250YWluZWQgaW4gYW4gYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogYGBgXG4gKiA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXM7IGluZGV4IGFzIGk7IHRyYWNrQnk6IHRyYWNrQnlGblwiPi4uLjwvbGk+XG4gKiBgYGBcbiAqXG4gKiBUaGUgc2hvcnRoYW5kIGZvcm0gZXhwYW5kcyBpbnRvIGEgbG9uZyBmb3JtIHRoYXQgdXNlcyB0aGUgYG5nRm9yT2ZgIHNlbGVjdG9yXG4gKiBvbiBhbiBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudC5cbiAqIFRoZSBjb250ZW50IG9mIHRoZSBgPG5nLXRlbXBsYXRlPmAgZWxlbWVudCBpcyB0aGUgYDxsaT5gIGVsZW1lbnQgdGhhdCBoZWxkIHRoZVxuICogc2hvcnQtZm9ybSBkaXJlY3RpdmUuXG4gKlxuICogSGVyZSBpcyB0aGUgZXhwYW5kZWQgdmVyc2lvbiBvZiB0aGUgc2hvcnQtZm9ybSBleGFtcGxlLlxuICpcbiAqIGBgYFxuICogPG5nLXRlbXBsYXRlIG5nRm9yIGxldC1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCIgbGV0LWk9XCJpbmRleFwiIFtuZ0ZvclRyYWNrQnldPVwidHJhY2tCeUZuXCI+XG4gKiAgIDxsaT4uLi48L2xpPlxuICogPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBleHBhbmRzIHRoZSBzaG9ydGhhbmQgc3ludGF4IGFzIGl0IGNvbXBpbGVzIHRoZSB0ZW1wbGF0ZS5cbiAqIFRoZSBjb250ZXh0IGZvciBlYWNoIGVtYmVkZGVkIHZpZXcgaXMgbG9naWNhbGx5IG1lcmdlZCB0byB0aGUgY3VycmVudCBjb21wb25lbnRcbiAqIGNvbnRleHQgYWNjb3JkaW5nIHRvIGl0cyBsZXhpY2FsIHBvc2l0aW9uLlxuICpcbiAqIFdoZW4gdXNpbmcgdGhlIHNob3J0aGFuZCBzeW50YXgsIEFuZ3VsYXIgYWxsb3dzIG9ubHkgW29uZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZVxuICogb24gYW4gZWxlbWVudF0oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzI29uZS1zdHJ1Y3R1cmFsLWRpcmVjdGl2ZS1wZXItaG9zdC1lbGVtZW50KS5cbiAqIElmIHlvdSB3YW50IHRvIGl0ZXJhdGUgY29uZGl0aW9uYWxseSwgZm9yIGV4YW1wbGUsXG4gKiBwdXQgdGhlIGAqbmdJZmAgb24gYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIHRoZSBgKm5nRm9yYCBlbGVtZW50LlxuICogRm9yIGZ1dGhlciBkaXNjdXNzaW9uLCBzZWVcbiAqIFtTdHJ1Y3R1cmFsIERpcmVjdGl2ZXNdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNvbmUtcGVyLWVsZW1lbnQpLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIExvY2FsIHZhcmlhYmxlc1xuICpcbiAqIGBOZ0Zvck9mYCBwcm92aWRlcyBleHBvcnRlZCB2YWx1ZXMgdGhhdCBjYW4gYmUgYWxpYXNlZCB0byBsb2NhbCB2YXJpYWJsZXMuXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgYGBgXG4gKiA8bGkgKm5nRm9yPVwibGV0IHVzZXIgb2YgdXNlcnM7IGluZGV4IGFzIGk7IGZpcnN0IGFzIGlzRmlyc3RcIj5cbiAqICAgIHt7aX19L3t7dXNlcnMubGVuZ3RofX0uIHt7dXNlcn19IDxzcGFuICpuZ0lmPVwiaXNGaXJzdFwiPmRlZmF1bHQ8L3NwYW4+XG4gKiA8L2xpPlxuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBleHBvcnRlZCB2YWx1ZXMgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzOlxuICpcbiAqIC0gYCRpbXBsaWNpdDogVGA6IFRoZSB2YWx1ZSBvZiB0aGUgaW5kaXZpZHVhbCBpdGVtcyBpbiB0aGUgaXRlcmFibGUgKGBuZ0Zvck9mYCkuXG4gKiAtIGBuZ0Zvck9mOiBOZ0l0ZXJhYmxlPFQ+YDogVGhlIHZhbHVlIG9mIHRoZSBpdGVyYWJsZSBleHByZXNzaW9uLiBVc2VmdWwgd2hlbiB0aGUgZXhwcmVzc2lvbiBpc1xuICogbW9yZSBjb21wbGV4IHRoZW4gYSBwcm9wZXJ0eSBhY2Nlc3MsIGZvciBleGFtcGxlIHdoZW4gdXNpbmcgdGhlIGFzeW5jIHBpcGUgKGB1c2VyU3RyZWFtcyB8XG4gKiBhc3luY2ApLlxuICogLSBgaW5kZXg6IG51bWJlcmA6IFRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGNvdW50OiBudW1iZXJgOiBUaGUgbGVuZ3RoIG9mIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGZpcnN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYGxhc3Q6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaXMgdGhlIGxhc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBldmVuOiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGhhcyBhbiBldmVuIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqIC0gYG9kZDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gb2RkIGluZGV4IGluIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiAjIyMgQ2hhbmdlIHByb3BhZ2F0aW9uXG4gKlxuICogV2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGl0ZXJhdG9yIGNoYW5nZXMsIGBOZ0Zvck9mYCBtYWtlcyB0aGUgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIHRoZSBET006XG4gKlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgYWRkZWQsIGEgbmV3IGluc3RhbmNlIG9mIHRoZSB0ZW1wbGF0ZSBpcyBhZGRlZCB0byB0aGUgRE9NLlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgcmVtb3ZlZCwgaXRzIHRlbXBsYXRlIGluc3RhbmNlIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICogKiBXaGVuIGl0ZW1zIGFyZSByZW9yZGVyZWQsIHRoZWlyIHJlc3BlY3RpdmUgdGVtcGxhdGVzIGFyZSByZW9yZGVyZWQgaW4gdGhlIERPTS5cbiAqXG4gKiBBbmd1bGFyIHVzZXMgb2JqZWN0IGlkZW50aXR5IHRvIHRyYWNrIGluc2VydGlvbnMgYW5kIGRlbGV0aW9ucyB3aXRoaW4gdGhlIGl0ZXJhdG9yIGFuZCByZXByb2R1Y2VcbiAqIHRob3NlIGNoYW5nZXMgaW4gdGhlIERPTS4gVGhpcyBoYXMgaW1wb3J0YW50IGltcGxpY2F0aW9ucyBmb3IgYW5pbWF0aW9ucyBhbmQgYW55IHN0YXRlZnVsXG4gKiBjb250cm9scyB0aGF0IGFyZSBwcmVzZW50LCBzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB0aGF0IGFjY2VwdCB1c2VyIGlucHV0LiBJbnNlcnRlZCByb3dzIGNhblxuICogYmUgYW5pbWF0ZWQgaW4sIGRlbGV0ZWQgcm93cyBjYW4gYmUgYW5pbWF0ZWQgb3V0LCBhbmQgdW5jaGFuZ2VkIHJvd3MgcmV0YWluIGFueSB1bnNhdmVkIHN0YXRlXG4gKiBzdWNoIGFzIHVzZXIgaW5wdXQuXG4gKiBGb3IgbW9yZSBvbiBhbmltYXRpb25zLCBzZWUgW1RyYW5zaXRpb25zIGFuZCBUcmlnZ2Vyc10oZ3VpZGUvdHJhbnNpdGlvbi1hbmQtdHJpZ2dlcnMpLlxuICpcbiAqIFRoZSBpZGVudGl0aWVzIG9mIGVsZW1lbnRzIGluIHRoZSBpdGVyYXRvciBjYW4gY2hhbmdlIHdoaWxlIHRoZSBkYXRhIGRvZXMgbm90LlxuICogVGhpcyBjYW4gaGFwcGVuLCBmb3IgZXhhbXBsZSwgaWYgdGhlIGl0ZXJhdG9yIGlzIHByb2R1Y2VkIGZyb20gYW4gUlBDIHRvIHRoZSBzZXJ2ZXIsIGFuZCB0aGF0XG4gKiBSUEMgaXMgcmUtcnVuLiBFdmVuIGlmIHRoZSBkYXRhIGhhc24ndCBjaGFuZ2VkLCB0aGUgc2Vjb25kIHJlc3BvbnNlIHByb2R1Y2VzIG9iamVjdHMgd2l0aFxuICogZGlmZmVyZW50IGlkZW50aXRpZXMsIGFuZCBBbmd1bGFyIG11c3QgdGVhciBkb3duIHRoZSBlbnRpcmUgRE9NIGFuZCByZWJ1aWxkIGl0IChhcyBpZiBhbGwgb2xkXG4gKiBlbGVtZW50cyB3ZXJlIGRlbGV0ZWQgYW5kIGFsbCBuZXcgZWxlbWVudHMgaW5zZXJ0ZWQpLlxuICpcbiAqIFRvIGF2b2lkIHRoaXMgZXhwZW5zaXZlIG9wZXJhdGlvbiwgeW91IGNhbiBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJhY2tpbmcgYWxnb3JpdGhtLlxuICogYnkgc3VwcGx5aW5nIHRoZSBgdHJhY2tCeWAgb3B0aW9uIHRvIGBOZ0Zvck9mYC5cbiAqIGB0cmFja0J5YCB0YWtlcyBhIGZ1bmN0aW9uIHRoYXQgaGFzIHR3byBhcmd1bWVudHM6IGBpbmRleGAgYW5kIGBpdGVtYC5cbiAqIElmIGB0cmFja0J5YCBpcyBnaXZlbiwgQW5ndWxhciB0cmFja3MgY2hhbmdlcyBieSB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbi5cbiAqXG4gKiBAc2VlIFtTdHJ1Y3R1cmFsIERpcmVjdGl2ZXNdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcylcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdGb3JdW25nRm9yT2ZdJ30pXG5leHBvcnQgY2xhc3MgTmdGb3JPZjxULCBVIGV4dGVuZHMgTmdJdGVyYWJsZTxUPiA9IE5nSXRlcmFibGU8VD4+IGltcGxlbWVudHMgRG9DaGVjayB7XG4gIC8qKlxuICAgKiBUaGUgdmFsdWUgb2YgdGhlIGl0ZXJhYmxlIGV4cHJlc3Npb24sIHdoaWNoIGNhbiBiZSB1c2VkIGFzIGFcbiAgICogW3RlbXBsYXRlIGlucHV0IHZhcmlhYmxlXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjdGVtcGxhdGUtaW5wdXQtdmFyaWFibGUpLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yT2YobmdGb3JPZjogVSZOZ0l0ZXJhYmxlPFQ+fHVuZGVmaW5lZHxudWxsKSB7XG4gICAgdGhpcy5fbmdGb3JPZiA9IG5nRm9yT2Y7XG4gICAgdGhpcy5fbmdGb3JPZkRpcnR5ID0gdHJ1ZTtcbiAgfVxuICAvKipcbiAgICogQSBmdW5jdGlvbiB0aGF0IGRlZmluZXMgaG93IHRvIHRyYWNrIGNoYW5nZXMgZm9yIGl0ZW1zIGluIHRoZSBpdGVyYWJsZS5cbiAgICpcbiAgICogV2hlbiBpdGVtcyBhcmUgYWRkZWQsIG1vdmVkLCBvciByZW1vdmVkIGluIHRoZSBpdGVyYWJsZSxcbiAgICogdGhlIGRpcmVjdGl2ZSBtdXN0IHJlLXJlbmRlciB0aGUgYXBwcm9wcmlhdGUgRE9NIG5vZGVzLlxuICAgKiBUbyBtaW5pbWl6ZSBjaHVybiBpbiB0aGUgRE9NLCBvbmx5IG5vZGVzIHRoYXQgaGF2ZSBjaGFuZ2VkXG4gICAqIGFyZSByZS1yZW5kZXJlZC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgdGhlIGNoYW5nZSBkZXRlY3RvciBhc3N1bWVzIHRoYXRcbiAgICogdGhlIG9iamVjdCBpbnN0YW5jZSBpZGVudGlmaWVzIHRoZSBub2RlIGluIHRoZSBpdGVyYWJsZS5cbiAgICogV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIHN1cHBsaWVkLCB0aGUgZGlyZWN0aXZlIHVzZXNcbiAgICogdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoaXMgZnVuY3Rpb24gdG8gaWRlbnRpZnkgdGhlIGl0ZW0gbm9kZSxcbiAgICogcmF0aGVyIHRoYW4gdGhlIGlkZW50aXR5IG9mIHRoZSBvYmplY3QgaXRzZWxmLlxuICAgKlxuICAgKiBUaGUgZnVuY3Rpb24gcmVjZWl2ZXMgdHdvIGlucHV0cyxcbiAgICogdGhlIGl0ZXJhdGlvbiBpbmRleCBhbmQgdGhlIG5vZGUgb2JqZWN0IElELlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUT0RPKHZpY2IpOiB1c2UgYSBsb2cgc2VydmljZSBvbmNlIHRoZXJlIGlzIGEgcHVibGljIG9uZSBhdmFpbGFibGVcbiAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcbiAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9jb21tb24vTmdGb3JPZiNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xuICB9XG5cbiAgZ2V0IG5nRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xuICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XG4gIH1cblxuICBwcml2YXRlIF9uZ0Zvck9mOiBVfHVuZGVmaW5lZHxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbmdGb3JPZkRpcnR5OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPnxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3RyYWNrQnlGbiE6IFRyYWNrQnlGdW5jdGlvbjxUPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICBwcml2YXRlIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8TmdGb3JPZkNvbnRleHQ8VCwgVT4+LCBwcml2YXRlIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMpIHt9XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSB0ZW1wbGF0ZSB0aGF0IGlzIHN0YW1wZWQgb3V0IGZvciBlYWNoIGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICAgKiBAc2VlIFt0ZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGVdKGd1aWRlL3RlbXBsYXRlLXN5bnRheCN0ZW1wbGF0ZS1yZWZlcmVuY2UtdmFyaWFibGVzLS12YXItKVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pikge1xuICAgIC8vIFRPRE8oVFMyLjEpOiBtYWtlIFRlbXBsYXRlUmVmPFBhcnRpYWw8TmdGb3JSb3dPZjxUPj4+IG9uY2Ugd2UgbW92ZSB0byBUUyB2Mi4xXG4gICAgLy8gVGhlIGN1cnJlbnQgdHlwZSBpcyB0b28gcmVzdHJpY3RpdmU7IGEgdGVtcGxhdGUgdGhhdCBqdXN0IHVzZXMgaW5kZXgsIGZvciBleGFtcGxlLFxuICAgIC8vIHNob3VsZCBiZSBhY2NlcHRhYmxlLlxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgY2hhbmdlcyB3aGVuIG5lZWRlZC5cbiAgICovXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbmdGb3JPZkRpcnR5KSB7XG4gICAgICB0aGlzLl9uZ0Zvck9mRGlydHkgPSBmYWxzZTtcbiAgICAgIC8vIFJlYWN0IG9uIG5nRm9yT2YgY2hhbmdlcyBvbmx5IG9uY2UgYWxsIGlucHV0cyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWRcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fbmdGb3JPZjtcbiAgICAgIGlmICghdGhpcy5fZGlmZmVyICYmIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5uZ0ZvclRyYWNrQnkpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtcbiAgICAgICAgICAgICAgZ2V0VHlwZU5hbWUodmFsdWUpfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMgc3VjaCBhcyBBcnJheXMuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX2RpZmZlcikge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nRm9yT2YpO1xuICAgICAgaWYgKGNoYW5nZXMpIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XG4gICAgY29uc3QgaW5zZXJ0VHVwbGVzOiBSZWNvcmRWaWV3VHVwbGU8VCwgVT5bXSA9IFtdO1xuICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbihcbiAgICAgICAgKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyfG51bGwsXG4gICAgICAgICBjdXJyZW50SW5kZXg6IG51bWJlcnxudWxsKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBOZ0Zvck9mIGlzIG5ldmVyIFwibnVsbFwiIG9yIFwidW5kZWZpbmVkXCIgaGVyZSBiZWNhdXNlIHRoZSBkaWZmZXIgZGV0ZWN0ZWRcbiAgICAgICAgICAgIC8vIHRoYXQgYSBuZXcgaXRlbSBuZWVkcyB0byBiZSBpbnNlcnRlZCBmcm9tIHRoZSBpdGVyYWJsZS4gVGhpcyBpbXBsaWVzIHRoYXRcbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIGFuIGl0ZXJhYmxlIHZhbHVlIGZvciBcIl9uZ0Zvck9mXCIuXG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcoXG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUsIG5ldyBOZ0Zvck9mQ29udGV4dDxULCBVPihudWxsISwgdGhpcy5fbmdGb3JPZiEsIC0xLCAtMSksXG4gICAgICAgICAgICAgICAgY3VycmVudEluZGV4ID09PSBudWxsID8gdW5kZWZpbmVkIDogY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IHR1cGxlID0gbmV3IFJlY29yZFZpZXdUdXBsZTxULCBVPihpdGVtLCB2aWV3KTtcbiAgICAgICAgICAgIGluc2VydFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLnJlbW92ZShcbiAgICAgICAgICAgICAgICBhZGp1c3RlZFByZXZpb3VzSW5kZXggPT09IG51bGwgPyB1bmRlZmluZWQgOiBhZGp1c3RlZFByZXZpb3VzSW5kZXgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYWRqdXN0ZWRQcmV2aW91c0luZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5nZXQoYWRqdXN0ZWRQcmV2aW91c0luZGV4KSE7XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLm1vdmUodmlldywgY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IHR1cGxlID0gbmV3IFJlY29yZFZpZXdUdXBsZShpdGVtLCA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pj52aWV3KTtcbiAgICAgICAgICAgIGluc2VydFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnNlcnRUdXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3BlclZpZXdDaGFuZ2UoaW5zZXJ0VHVwbGVzW2ldLnZpZXcsIGluc2VydFR1cGxlc1tpXS5yZWNvcmQpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwLCBpbGVuID0gdGhpcy5fdmlld0NvbnRhaW5lci5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQsIFU+Pj50aGlzLl92aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC5pbmRleCA9IGk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuY291bnQgPSBpbGVuO1xuICAgICAgdmlld1JlZi5jb250ZXh0Lm5nRm9yT2YgPSB0aGlzLl9uZ0Zvck9mITtcbiAgICB9XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPVxuICAgICAgICAgIDxFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VCwgVT4+PnRoaXMuX3ZpZXdDb250YWluZXIuZ2V0KHJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgdmlld1JlZi5jb250ZXh0LiRpbXBsaWNpdCA9IHJlY29yZC5pdGVtO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGVyVmlld0NoYW5nZShcbiAgICAgIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4sIHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8YW55Pikge1xuICAgIHZpZXcuY29udGV4dC4kaW1wbGljaXQgPSByZWNvcmQuaXRlbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoZSBjb3JyZWN0IHR5cGUgb2YgdGhlIGNvbnRleHQgZm9yIHRoZSB0ZW1wbGF0ZSB0aGF0IGBOZ0Zvck9mYCB3aWxsIHJlbmRlci5cbiAgICpcbiAgICogVGhlIHByZXNlbmNlIG9mIHRoaXMgbWV0aG9kIGlzIGEgc2lnbmFsIHRvIHRoZSBJdnkgdGVtcGxhdGUgdHlwZS1jaGVjayBjb21waWxlciB0aGF0IHRoZVxuICAgKiBgTmdGb3JPZmAgc3RydWN0dXJhbCBkaXJlY3RpdmUgcmVuZGVycyBpdHMgdGVtcGxhdGUgd2l0aCBhIHNwZWNpZmljIGNvbnRleHQgdHlwZS5cbiAgICovXG4gIHN0YXRpYyBuZ1RlbXBsYXRlQ29udGV4dEd1YXJkPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+PihkaXI6IE5nRm9yT2Y8VCwgVT4sIGN0eDogYW55KTpcbiAgICAgIGN0eCBpcyBOZ0Zvck9mQ29udGV4dDxULCBVPiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuY2xhc3MgUmVjb3JkVmlld1R1cGxlPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+PiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWNvcmQ6IGFueSwgcHVibGljIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxOZ0Zvck9mQ29udGV4dDxULCBVPj4pIHt9XG59XG5cbmZ1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGU6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XG59XG4iXX0=