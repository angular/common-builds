/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef } from '@angular/core';
/**
 * \@ngModule CommonModule
 *
 * \@description
 *
 * Inserts an embedded view from a prepared `TemplateRef`.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * \@usageNotes
 * ```
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * Using the key `$implicit` in the context object will set its value as default.
 *
 * ### Example
 *
 * {\@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * \@publicApi
 */
export class NgTemplateOutlet {
    /**
     * @param {?} _viewContainerRef
     */
    constructor(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
        this._viewRef = null;
        /**
         * A context object to attach to the {\@link EmbeddedViewRef}. This should be an
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
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        /** @type {?} */
        const recreateView = this._shouldRecreateView(changes);
        if (recreateView) {
            /** @type {?} */
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
     * @private
     * @param {?} changes
     * @return {?}
     */
    _shouldRecreateView(changes) {
        /** @type {?} */
        const ctxChange = changes['ngTemplateOutletContext'];
        return !!changes['ngTemplateOutlet'] || (ctxChange && this._hasContextShapeChanged(ctxChange));
    }
    /**
     * @private
     * @param {?} ctxChange
     * @return {?}
     */
    _hasContextShapeChanged(ctxChange) {
        /** @type {?} */
        const prevCtxKeys = Object.keys(ctxChange.previousValue || {});
        /** @type {?} */
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
    /**
     * @private
     * @param {?} ctx
     * @return {?}
     */
    _updateExistingContext(ctx) {
        for (let propName of Object.keys(ctx)) {
            ((/** @type {?} */ ((/** @type {?} */ (this._viewRef)).context)))[propName] = ((/** @type {?} */ (this.ngTemplateOutletContext)))[propName];
        }
    }
}
NgTemplateOutlet.decorators = [
    { type: Directive, args: [{ selector: '[ngTemplateOutlet]' },] }
];
/** @nocollapse */
NgTemplateOutlet.ctorParameters = () => [
    { type: ViewContainerRef }
];
NgTemplateOutlet.propDecorators = {
    ngTemplateOutletContext: [{ type: Input }],
    ngTemplateOutlet: [{ type: Input }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgTemplateOutlet.prototype._viewRef;
    /**
     * A context object to attach to the {\@link EmbeddedViewRef}. This should be an
     * object, the object's keys will be available for binding by the local template `let`
     * declarations.
     * Using the key `$implicit` in the context object will set its value as default.
     * @type {?}
     */
    NgTemplateOutlet.prototype.ngTemplateOutletContext;
    /**
     * A string defining the template reference and optionally the context object for the template.
     * @type {?}
     */
    NgTemplateOutlet.prototype.ngTemplateOutlet;
    /**
     * @type {?}
     * @private
     */
    NgTemplateOutlet.prototype._viewContainerRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQW1CLEtBQUssRUFBdUQsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQnZJLE1BQU0sT0FBTyxnQkFBZ0I7Ozs7SUFnQjNCLFlBQW9CLGlCQUFtQztRQUFuQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBZi9DLGFBQVEsR0FBOEIsSUFBSSxDQUFDOzs7Ozs7O1FBUW5DLDRCQUF1QixHQUFnQixJQUFJLENBQUM7Ozs7UUFLNUMscUJBQWdCLEdBQTBCLElBQUksQ0FBQztJQUVMLENBQUM7Ozs7O0lBRTNELFdBQVcsQ0FBQyxPQUFzQjs7Y0FDMUIsWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUM7UUFFdEQsSUFBSSxZQUFZLEVBQUU7O2tCQUNWLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUI7WUFFL0MsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNqQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ2xFO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDbkMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLElBQUksQ0FBQztTQUNWO2FBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUN4RCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDM0Q7SUFDSCxDQUFDOzs7Ozs7Ozs7Ozs7OztJQVlPLG1CQUFtQixDQUFDLE9BQXNCOztjQUMxQyxTQUFTLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDO1FBQ3BELE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7Ozs7OztJQUVPLHVCQUF1QixDQUFDLFNBQXVCOztjQUMvQyxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQzs7Y0FDeEQsV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7UUFFN0QsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDN0MsS0FBSyxJQUFJLFFBQVEsSUFBSSxXQUFXLEVBQUU7Z0JBQ2hDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDeEMsT0FBTyxJQUFJLENBQUM7aUJBQ2I7YUFDRjtZQUNELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Ozs7OztJQUVPLHNCQUFzQixDQUFDLEdBQVc7UUFDeEMsS0FBSyxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3JDLENBQUMsbUJBQUssbUJBQUEsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBQSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQkFBSyxJQUFJLENBQUMsdUJBQXVCLEVBQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzFGO0lBQ0gsQ0FBQzs7O1lBdkVGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBQzs7OztZQTFCcUQsZ0JBQWdCOzs7c0NBb0M3RyxLQUFLOytCQUtMLEtBQUs7Ozs7Ozs7SUFiTixvQ0FBbUQ7Ozs7Ozs7O0lBUW5ELG1EQUE0RDs7Ozs7SUFLNUQsNENBQStEOzs7OztJQUVuRCw2Q0FBMkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbWJlZGRlZFZpZXdSZWYsIElucHV0LCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBJbnNlcnRzIGFuIGVtYmVkZGVkIHZpZXcgZnJvbSBhIHByZXBhcmVkIGBUZW1wbGF0ZVJlZmAuXG4gKlxuICogWW91IGNhbiBhdHRhY2ggYSBjb250ZXh0IG9iamVjdCB0byB0aGUgYEVtYmVkZGVkVmlld1JlZmAgYnkgc2V0dGluZyBgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XWAuXG4gKiBgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XWAgc2hvdWxkIGJlIGFuIG9iamVjdCwgdGhlIG9iamVjdCdzIGtleXMgd2lsbCBiZSBhdmFpbGFibGUgZm9yIGJpbmRpbmdcbiAqIGJ5IHRoZSBsb2NhbCB0ZW1wbGF0ZSBgbGV0YCBkZWNsYXJhdGlvbnMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cInRlbXBsYXRlUmVmRXhwOyBjb250ZXh0OiBjb250ZXh0RXhwXCI+PC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBVc2luZyB0aGUga2V5IGAkaW1wbGljaXRgIGluIHRoZSBjb250ZXh0IG9iamVjdCB3aWxsIHNldCBpdHMgdmFsdWUgYXMgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdUZW1wbGF0ZU91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ1RlbXBsYXRlT3V0bGV0J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nVGVtcGxhdGVPdXRsZXRdJ30pXG5leHBvcnQgY2xhc3MgTmdUZW1wbGF0ZU91dGxldCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByaXZhdGUgX3ZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBIGNvbnRleHQgb2JqZWN0IHRvIGF0dGFjaCB0byB0aGUge0BsaW5rIEVtYmVkZGVkVmlld1JlZn0uIFRoaXMgc2hvdWxkIGJlIGFuXG4gICAqIG9iamVjdCwgdGhlIG9iamVjdCdzIGtleXMgd2lsbCBiZSBhdmFpbGFibGUgZm9yIGJpbmRpbmcgYnkgdGhlIGxvY2FsIHRlbXBsYXRlIGBsZXRgXG4gICAqIGRlY2xhcmF0aW9ucy5cbiAgICogVXNpbmcgdGhlIGtleSBgJGltcGxpY2l0YCBpbiB0aGUgY29udGV4dCBvYmplY3Qgd2lsbCBzZXQgaXRzIHZhbHVlIGFzIGRlZmF1bHQuXG4gICAqL1xuICBASW5wdXQoKSBwdWJsaWMgbmdUZW1wbGF0ZU91dGxldENvbnRleHQ6IE9iamVjdHxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQSBzdHJpbmcgZGVmaW5pbmcgdGhlIHRlbXBsYXRlIHJlZmVyZW5jZSBhbmQgb3B0aW9uYWxseSB0aGUgY29udGV4dCBvYmplY3QgZm9yIHRoZSB0ZW1wbGF0ZS5cbiAgICovXG4gIEBJbnB1dCgpIHB1YmxpYyBuZ1RlbXBsYXRlT3V0bGV0OiBUZW1wbGF0ZVJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHJlY3JlYXRlVmlldyA9IHRoaXMuX3Nob3VsZFJlY3JlYXRlVmlldyhjaGFuZ2VzKTtcblxuICAgIGlmIChyZWNyZWF0ZVZpZXcpIHtcbiAgICAgIGNvbnN0IHZpZXdDb250YWluZXJSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmO1xuXG4gICAgICBpZiAodGhpcy5fdmlld1JlZikge1xuICAgICAgICB2aWV3Q29udGFpbmVyUmVmLnJlbW92ZSh2aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy5fdmlld1JlZikpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl92aWV3UmVmID0gdGhpcy5uZ1RlbXBsYXRlT3V0bGV0ID9cbiAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLm5nVGVtcGxhdGVPdXRsZXQsIHRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQpIDpcbiAgICAgICAgICBudWxsO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fdmlld1JlZiAmJiB0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KSB7XG4gICAgICB0aGlzLl91cGRhdGVFeGlzdGluZ0NvbnRleHQodGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdlIG5lZWQgdG8gcmUtY3JlYXRlIGV4aXN0aW5nIGVtYmVkZGVkIHZpZXcgaWY6XG4gICAqIC0gdGVtcGxhdGVSZWYgaGFzIGNoYW5nZWRcbiAgICogLSBjb250ZXh0IGhhcyBjaGFuZ2VzXG4gICAqXG4gICAqIFdlIG1hcmsgY29udGV4dCBvYmplY3QgYXMgY2hhbmdlZCB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIG9iamVjdFxuICAgKiBzaGFwZSBjaGFuZ2VzIChuZXcgcHJvcGVydGllcyBhcmUgYWRkZWQgb3IgZXhpc3RpbmcgcHJvcGVydGllcyBhcmUgcmVtb3ZlZCkuXG4gICAqIEluIG90aGVyIHdvcmRzIHdlIGNvbnNpZGVyIGNvbnRleHQgd2l0aCB0aGUgc2FtZSBwcm9wZXJ0aWVzIGFzIFwidGhlIHNhbWVcIiBldmVuXG4gICAqIGlmIG9iamVjdCByZWZlcmVuY2UgY2hhbmdlcyAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEzNDA3KS5cbiAgICovXG4gIHByaXZhdGUgX3Nob3VsZFJlY3JlYXRlVmlldyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY3R4Q2hhbmdlID0gY2hhbmdlc1snbmdUZW1wbGF0ZU91dGxldENvbnRleHQnXTtcbiAgICByZXR1cm4gISFjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0J10gfHwgKGN0eENoYW5nZSAmJiB0aGlzLl9oYXNDb250ZXh0U2hhcGVDaGFuZ2VkKGN0eENoYW5nZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFzQ29udGV4dFNoYXBlQ2hhbmdlZChjdHhDaGFuZ2U6IFNpbXBsZUNoYW5nZSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByZXZDdHhLZXlzID0gT2JqZWN0LmtleXMoY3R4Q2hhbmdlLnByZXZpb3VzVmFsdWUgfHwge30pO1xuICAgIGNvbnN0IGN1cnJDdHhLZXlzID0gT2JqZWN0LmtleXMoY3R4Q2hhbmdlLmN1cnJlbnRWYWx1ZSB8fCB7fSk7XG5cbiAgICBpZiAocHJldkN0eEtleXMubGVuZ3RoID09PSBjdXJyQ3R4S2V5cy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IHByb3BOYW1lIG9mIGN1cnJDdHhLZXlzKSB7XG4gICAgICAgIGlmIChwcmV2Q3R4S2V5cy5pbmRleE9mKHByb3BOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUV4aXN0aW5nQ29udGV4dChjdHg6IE9iamVjdCk6IHZvaWQge1xuICAgIGZvciAobGV0IHByb3BOYW1lIG9mIE9iamVjdC5rZXlzKGN0eCkpIHtcbiAgICAgICg8YW55PnRoaXMuX3ZpZXdSZWYgIS5jb250ZXh0KVtwcm9wTmFtZV0gPSAoPGFueT50aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KVtwcm9wTmFtZV07XG4gICAgfVxuICB9XG59XG4iXX0=