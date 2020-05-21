/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Inserts an embedded view from a prepared `TemplateRef`.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * @usageNotes
 * ```
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * Using the key `$implicit` in the context object will set its value as default.
 *
 * ### Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * @publicApi
 */
let NgTemplateOutlet = /** @class */ (() => {
    class NgTemplateOutlet {
        constructor(_viewContainerRef) {
            this._viewContainerRef = _viewContainerRef;
            this._viewRef = null;
            /**
             * A context object to attach to the {@link EmbeddedViewRef}. This should be an
             * object, the object's keys will be available for binding by the local template `let`
             * declarations.
             * Using the key `$implicit` in the context object will set its value as default.
             */
            this.ngTemplateOutletContext = null;
            /**
             * A string defining the template reference and optionally the context object for the template.
             */
            this.ngTemplateOutlet = null;
        }
        ngOnChanges(changes) {
            const recreateView = this._shouldRecreateView(changes);
            if (recreateView) {
                const viewContainerRef = this._viewContainerRef;
                if (this._viewRef) {
                    viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
                }
                this._viewRef = this.ngTemplateOutlet ?
                    viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, this.ngTemplateOutletContext) :
                    null;
            }
            else if (this._viewRef && this.ngTemplateOutletContext) {
                this._updateExistingContext(this.ngTemplateOutletContext);
            }
        }
        /**
         * We need to re-create existing embedded view if:
         * - templateRef has changed
         * - context has changes
         *
         * We mark context object as changed when the corresponding object
         * shape changes (new properties are added or existing properties are removed).
         * In other words we consider context with the same properties as "the same" even
         * if object reference changes (see https://github.com/angular/angular/issues/13407).
         */
        _shouldRecreateView(changes) {
            const ctxChange = changes['ngTemplateOutletContext'];
            return !!changes['ngTemplateOutlet'] || (ctxChange && this._hasContextShapeChanged(ctxChange));
        }
        _hasContextShapeChanged(ctxChange) {
            const prevCtxKeys = Object.keys(ctxChange.previousValue || {});
            const currCtxKeys = Object.keys(ctxChange.currentValue || {});
            if (prevCtxKeys.length === currCtxKeys.length) {
                for (let propName of currCtxKeys) {
                    if (prevCtxKeys.indexOf(propName) === -1) {
                        return true;
                    }
                }
                return false;
            }
            return true;
        }
        _updateExistingContext(ctx) {
            for (let propName of Object.keys(ctx)) {
                this._viewRef.context[propName] = this.ngTemplateOutletContext[propName];
            }
        }
    }
    NgTemplateOutlet.ɵfac = function NgTemplateOutlet_Factory(t) { return new (t || NgTemplateOutlet)(i0.ɵɵdirectiveInject(i0.ViewContainerRef)); };
    NgTemplateOutlet.ɵdir = i0.ɵɵdefineDirective({ type: NgTemplateOutlet, selectors: [["", "ngTemplateOutlet", ""]], inputs: { ngTemplateOutletContext: "ngTemplateOutletContext", ngTemplateOutlet: "ngTemplateOutlet" }, features: [i0.ɵɵNgOnChangesFeature] });
    return NgTemplateOutlet;
})();
export { NgTemplateOutlet };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgTemplateOutlet, [{
        type: Directive,
        args: [{ selector: '[ngTemplateOutlet]' }]
    }], function () { return [{ type: i0.ViewContainerRef }]; }, { ngTemplateOutletContext: [{
            type: Input
        }], ngTemplateOutlet: [{
            type: Input
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFtQixLQUFLLEVBQXVELGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUV2STs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSDtJQUFBLE1BQ2EsZ0JBQWdCO1FBZ0IzQixZQUFvQixpQkFBbUM7WUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtZQWYvQyxhQUFRLEdBQThCLElBQUksQ0FBQztZQUVuRDs7Ozs7ZUFLRztZQUNhLDRCQUF1QixHQUFnQixJQUFJLENBQUM7WUFFNUQ7O2VBRUc7WUFDYSxxQkFBZ0IsR0FBMEIsSUFBSSxDQUFDO1FBRUwsQ0FBQztRQUUzRCxXQUFXLENBQUMsT0FBc0I7WUFDaEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXZELElBQUksWUFBWSxFQUFFO2dCQUNoQixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztnQkFFaEQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNqQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNsRTtnQkFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNuQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztvQkFDMUYsSUFBSSxDQUFDO2FBQ1Y7aUJBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDeEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQzNEO1FBQ0gsQ0FBQztRQUVEOzs7Ozs7Ozs7V0FTRztRQUNLLG1CQUFtQixDQUFDLE9BQXNCO1lBQ2hELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxTQUF1QjtZQUNyRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDLENBQUM7WUFDL0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTlELElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUM3QyxLQUFLLElBQUksUUFBUSxJQUFJLFdBQVcsRUFBRTtvQkFDaEMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUN4QyxPQUFPLElBQUksQ0FBQztxQkFDYjtpQkFDRjtnQkFDRCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRU8sc0JBQXNCLENBQUMsR0FBVztZQUN4QyxLQUFLLElBQUksUUFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxRQUFTLENBQUMsT0FBUSxDQUFDLFFBQVEsQ0FBQyxHQUFTLElBQUksQ0FBQyx1QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN6RjtRQUNILENBQUM7O29GQXRFVSxnQkFBZ0I7eURBQWhCLGdCQUFnQjsyQkFuQzdCO0tBMEdDO1NBdkVZLGdCQUFnQjtrREFBaEIsZ0JBQWdCO2NBRDVCLFNBQVM7ZUFBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBQzs7a0JBVXhDLEtBQUs7O2tCQUtMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbWJlZGRlZFZpZXdSZWYsIElucHV0LCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBJbnNlcnRzIGFuIGVtYmVkZGVkIHZpZXcgZnJvbSBhIHByZXBhcmVkIGBUZW1wbGF0ZVJlZmAuXG4gKlxuICogWW91IGNhbiBhdHRhY2ggYSBjb250ZXh0IG9iamVjdCB0byB0aGUgYEVtYmVkZGVkVmlld1JlZmAgYnkgc2V0dGluZyBgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XWAuXG4gKiBgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XWAgc2hvdWxkIGJlIGFuIG9iamVjdCwgdGhlIG9iamVjdCdzIGtleXMgd2lsbCBiZSBhdmFpbGFibGUgZm9yIGJpbmRpbmdcbiAqIGJ5IHRoZSBsb2NhbCB0ZW1wbGF0ZSBgbGV0YCBkZWNsYXJhdGlvbnMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cInRlbXBsYXRlUmVmRXhwOyBjb250ZXh0OiBjb250ZXh0RXhwXCI+PC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBVc2luZyB0aGUga2V5IGAkaW1wbGljaXRgIGluIHRoZSBjb250ZXh0IG9iamVjdCB3aWxsIHNldCBpdHMgdmFsdWUgYXMgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdUZW1wbGF0ZU91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ1RlbXBsYXRlT3V0bGV0J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nVGVtcGxhdGVPdXRsZXRdJ30pXG5leHBvcnQgY2xhc3MgTmdUZW1wbGF0ZU91dGxldCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByaXZhdGUgX3ZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBIGNvbnRleHQgb2JqZWN0IHRvIGF0dGFjaCB0byB0aGUge0BsaW5rIEVtYmVkZGVkVmlld1JlZn0uIFRoaXMgc2hvdWxkIGJlIGFuXG4gICAqIG9iamVjdCwgdGhlIG9iamVjdCdzIGtleXMgd2lsbCBiZSBhdmFpbGFibGUgZm9yIGJpbmRpbmcgYnkgdGhlIGxvY2FsIHRlbXBsYXRlIGBsZXRgXG4gICAqIGRlY2xhcmF0aW9ucy5cbiAgICogVXNpbmcgdGhlIGtleSBgJGltcGxpY2l0YCBpbiB0aGUgY29udGV4dCBvYmplY3Qgd2lsbCBzZXQgaXRzIHZhbHVlIGFzIGRlZmF1bHQuXG4gICAqL1xuICBASW5wdXQoKSBwdWJsaWMgbmdUZW1wbGF0ZU91dGxldENvbnRleHQ6IE9iamVjdHxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQSBzdHJpbmcgZGVmaW5pbmcgdGhlIHRlbXBsYXRlIHJlZmVyZW5jZSBhbmQgb3B0aW9uYWxseSB0aGUgY29udGV4dCBvYmplY3QgZm9yIHRoZSB0ZW1wbGF0ZS5cbiAgICovXG4gIEBJbnB1dCgpIHB1YmxpYyBuZ1RlbXBsYXRlT3V0bGV0OiBUZW1wbGF0ZVJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHJlY3JlYXRlVmlldyA9IHRoaXMuX3Nob3VsZFJlY3JlYXRlVmlldyhjaGFuZ2VzKTtcblxuICAgIGlmIChyZWNyZWF0ZVZpZXcpIHtcbiAgICAgIGNvbnN0IHZpZXdDb250YWluZXJSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmO1xuXG4gICAgICBpZiAodGhpcy5fdmlld1JlZikge1xuICAgICAgICB2aWV3Q29udGFpbmVyUmVmLnJlbW92ZSh2aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy5fdmlld1JlZikpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl92aWV3UmVmID0gdGhpcy5uZ1RlbXBsYXRlT3V0bGV0ID9cbiAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLm5nVGVtcGxhdGVPdXRsZXQsIHRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQpIDpcbiAgICAgICAgICBudWxsO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fdmlld1JlZiAmJiB0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KSB7XG4gICAgICB0aGlzLl91cGRhdGVFeGlzdGluZ0NvbnRleHQodGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdlIG5lZWQgdG8gcmUtY3JlYXRlIGV4aXN0aW5nIGVtYmVkZGVkIHZpZXcgaWY6XG4gICAqIC0gdGVtcGxhdGVSZWYgaGFzIGNoYW5nZWRcbiAgICogLSBjb250ZXh0IGhhcyBjaGFuZ2VzXG4gICAqXG4gICAqIFdlIG1hcmsgY29udGV4dCBvYmplY3QgYXMgY2hhbmdlZCB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIG9iamVjdFxuICAgKiBzaGFwZSBjaGFuZ2VzIChuZXcgcHJvcGVydGllcyBhcmUgYWRkZWQgb3IgZXhpc3RpbmcgcHJvcGVydGllcyBhcmUgcmVtb3ZlZCkuXG4gICAqIEluIG90aGVyIHdvcmRzIHdlIGNvbnNpZGVyIGNvbnRleHQgd2l0aCB0aGUgc2FtZSBwcm9wZXJ0aWVzIGFzIFwidGhlIHNhbWVcIiBldmVuXG4gICAqIGlmIG9iamVjdCByZWZlcmVuY2UgY2hhbmdlcyAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEzNDA3KS5cbiAgICovXG4gIHByaXZhdGUgX3Nob3VsZFJlY3JlYXRlVmlldyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY3R4Q2hhbmdlID0gY2hhbmdlc1snbmdUZW1wbGF0ZU91dGxldENvbnRleHQnXTtcbiAgICByZXR1cm4gISFjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0J10gfHwgKGN0eENoYW5nZSAmJiB0aGlzLl9oYXNDb250ZXh0U2hhcGVDaGFuZ2VkKGN0eENoYW5nZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFzQ29udGV4dFNoYXBlQ2hhbmdlZChjdHhDaGFuZ2U6IFNpbXBsZUNoYW5nZSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByZXZDdHhLZXlzID0gT2JqZWN0LmtleXMoY3R4Q2hhbmdlLnByZXZpb3VzVmFsdWUgfHwge30pO1xuICAgIGNvbnN0IGN1cnJDdHhLZXlzID0gT2JqZWN0LmtleXMoY3R4Q2hhbmdlLmN1cnJlbnRWYWx1ZSB8fCB7fSk7XG5cbiAgICBpZiAocHJldkN0eEtleXMubGVuZ3RoID09PSBjdXJyQ3R4S2V5cy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IHByb3BOYW1lIG9mIGN1cnJDdHhLZXlzKSB7XG4gICAgICAgIGlmIChwcmV2Q3R4S2V5cy5pbmRleE9mKHByb3BOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUV4aXN0aW5nQ29udGV4dChjdHg6IE9iamVjdCk6IHZvaWQge1xuICAgIGZvciAobGV0IHByb3BOYW1lIG9mIE9iamVjdC5rZXlzKGN0eCkpIHtcbiAgICAgICg8YW55PnRoaXMuX3ZpZXdSZWYhLmNvbnRleHQpW3Byb3BOYW1lXSA9ICg8YW55PnRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQpW3Byb3BOYW1lXTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==