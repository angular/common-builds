/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/directives/ng_template_outlet.ts
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
let NgTemplateOutlet = /** @class */ (() => {
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
    class NgTemplateOutlet {
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
    return NgTemplateOutlet;
})();
export { NgTemplateOutlet };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFtQixLQUFLLEVBQXVELGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJ2STs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLE1BQ2EsZ0JBQWdCOzs7O1FBZ0IzQixZQUFvQixpQkFBbUM7WUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtZQWYvQyxhQUFRLEdBQThCLElBQUksQ0FBQzs7Ozs7OztZQVFuQyw0QkFBdUIsR0FBZ0IsSUFBSSxDQUFDOzs7O1lBSzVDLHFCQUFnQixHQUEwQixJQUFJLENBQUM7UUFFTCxDQUFDOzs7OztRQUUzRCxXQUFXLENBQUMsT0FBc0I7O2tCQUMxQixZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztZQUV0RCxJQUFJLFlBQVksRUFBRTs7c0JBQ1YsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQjtnQkFFL0MsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNqQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNsRTtnQkFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNuQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztvQkFDMUYsSUFBSSxDQUFDO2FBQ1Y7aUJBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDeEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQzNEO1FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7UUFZTyxtQkFBbUIsQ0FBQyxPQUFzQjs7a0JBQzFDLFNBQVMsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUM7WUFDcEQsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDakcsQ0FBQzs7Ozs7O1FBRU8sdUJBQXVCLENBQUMsU0FBdUI7O2tCQUMvQyxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQzs7a0JBQ3hELFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO1lBRTdELElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUM3QyxLQUFLLElBQUksUUFBUSxJQUFJLFdBQVcsRUFBRTtvQkFDaEMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUN4QyxPQUFPLElBQUksQ0FBQztxQkFDYjtpQkFDRjtnQkFDRCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDOzs7Ozs7UUFFTyxzQkFBc0IsQ0FBQyxHQUFXO1lBQ3hDLEtBQUssSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDckMsQ0FBQyxtQkFBSyxtQkFBQSxJQUFJLENBQUMsUUFBUSxFQUFDLENBQUMsT0FBTyxFQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLG1CQUFLLElBQUksQ0FBQyx1QkFBdUIsRUFBQSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDekY7UUFDSCxDQUFDOzs7Z0JBdkVGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBQzs7OztnQkExQnFELGdCQUFnQjs7OzBDQW9DN0csS0FBSzttQ0FLTCxLQUFLOztJQXlEUix1QkFBQztLQUFBO1NBdkVZLGdCQUFnQjs7Ozs7O0lBQzNCLG9DQUFtRDs7Ozs7Ozs7SUFRbkQsbURBQTREOzs7OztJQUs1RCw0Q0FBK0Q7Ozs7O0lBRW5ELDZDQUEyQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVtYmVkZGVkVmlld1JlZiwgSW5wdXQsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEluc2VydHMgYW4gZW1iZWRkZWQgdmlldyBmcm9tIGEgcHJlcGFyZWQgYFRlbXBsYXRlUmVmYC5cbiAqXG4gKiBZb3UgY2FuIGF0dGFjaCBhIGNvbnRleHQgb2JqZWN0IHRvIHRoZSBgRW1iZWRkZWRWaWV3UmVmYCBieSBzZXR0aW5nIGBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdYC5cbiAqIGBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdYCBzaG91bGQgYmUgYW4gb2JqZWN0LCB0aGUgb2JqZWN0J3Mga2V5cyB3aWxsIGJlIGF2YWlsYWJsZSBmb3IgYmluZGluZ1xuICogYnkgdGhlIGxvY2FsIHRlbXBsYXRlIGBsZXRgIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwidGVtcGxhdGVSZWZFeHA7IGNvbnRleHQ6IGNvbnRleHRFeHBcIj48L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFVzaW5nIHRoZSBrZXkgYCRpbXBsaWNpdGAgaW4gdGhlIGNvbnRleHQgb2JqZWN0IHdpbGwgc2V0IGl0cyB2YWx1ZSBhcyBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ1RlbXBsYXRlT3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J05nVGVtcGxhdGVPdXRsZXQnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdUZW1wbGF0ZU91dGxldF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1RlbXBsYXRlT3V0bGV0IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBfdmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEEgY29udGV4dCBvYmplY3QgdG8gYXR0YWNoIHRvIHRoZSB7QGxpbmsgRW1iZWRkZWRWaWV3UmVmfS4gVGhpcyBzaG91bGQgYmUgYW5cbiAgICogb2JqZWN0LCB0aGUgb2JqZWN0J3Mga2V5cyB3aWxsIGJlIGF2YWlsYWJsZSBmb3IgYmluZGluZyBieSB0aGUgbG9jYWwgdGVtcGxhdGUgYGxldGBcbiAgICogZGVjbGFyYXRpb25zLlxuICAgKiBVc2luZyB0aGUga2V5IGAkaW1wbGljaXRgIGluIHRoZSBjb250ZXh0IG9iamVjdCB3aWxsIHNldCBpdHMgdmFsdWUgYXMgZGVmYXVsdC5cbiAgICovXG4gIEBJbnB1dCgpIHB1YmxpYyBuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dDogT2JqZWN0fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBIHN0cmluZyBkZWZpbmluZyB0aGUgdGVtcGxhdGUgcmVmZXJlbmNlIGFuZCBvcHRpb25hbGx5IHRoZSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgQElucHV0KCkgcHVibGljIG5nVGVtcGxhdGVPdXRsZXQ6IFRlbXBsYXRlUmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgcmVjcmVhdGVWaWV3ID0gdGhpcy5fc2hvdWxkUmVjcmVhdGVWaWV3KGNoYW5nZXMpO1xuXG4gICAgaWYgKHJlY3JlYXRlVmlldykge1xuICAgICAgY29uc3Qgdmlld0NvbnRhaW5lclJlZiA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWY7XG5cbiAgICAgIGlmICh0aGlzLl92aWV3UmVmKSB7XG4gICAgICAgIHZpZXdDb250YWluZXJSZWYucmVtb3ZlKHZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLl92aWV3UmVmKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3ZpZXdSZWYgPSB0aGlzLm5nVGVtcGxhdGVPdXRsZXQgP1xuICAgICAgICAgIHZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMubmdUZW1wbGF0ZU91dGxldCwgdGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCkgOlxuICAgICAgICAgIG51bGw7XG4gICAgfSBlbHNlIGlmICh0aGlzLl92aWV3UmVmICYmIHRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUV4aXN0aW5nQ29udGV4dCh0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2UgbmVlZCB0byByZS1jcmVhdGUgZXhpc3RpbmcgZW1iZWRkZWQgdmlldyBpZjpcbiAgICogLSB0ZW1wbGF0ZVJlZiBoYXMgY2hhbmdlZFxuICAgKiAtIGNvbnRleHQgaGFzIGNoYW5nZXNcbiAgICpcbiAgICogV2UgbWFyayBjb250ZXh0IG9iamVjdCBhcyBjaGFuZ2VkIHdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgb2JqZWN0XG4gICAqIHNoYXBlIGNoYW5nZXMgKG5ldyBwcm9wZXJ0aWVzIGFyZSBhZGRlZCBvciBleGlzdGluZyBwcm9wZXJ0aWVzIGFyZSByZW1vdmVkKS5cbiAgICogSW4gb3RoZXIgd29yZHMgd2UgY29uc2lkZXIgY29udGV4dCB3aXRoIHRoZSBzYW1lIHByb3BlcnRpZXMgYXMgXCJ0aGUgc2FtZVwiIGV2ZW5cbiAgICogaWYgb2JqZWN0IHJlZmVyZW5jZSBjaGFuZ2VzIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTM0MDcpLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2hvdWxkUmVjcmVhdGVWaWV3KGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiBib29sZWFuIHtcbiAgICBjb25zdCBjdHhDaGFuZ2UgPSBjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCddO1xuICAgIHJldHVybiAhIWNoYW5nZXNbJ25nVGVtcGxhdGVPdXRsZXQnXSB8fCAoY3R4Q2hhbmdlICYmIHRoaXMuX2hhc0NvbnRleHRTaGFwZUNoYW5nZWQoY3R4Q2hhbmdlKSk7XG4gIH1cblxuICBwcml2YXRlIF9oYXNDb250ZXh0U2hhcGVDaGFuZ2VkKGN0eENoYW5nZTogU2ltcGxlQ2hhbmdlKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJldkN0eEtleXMgPSBPYmplY3Qua2V5cyhjdHhDaGFuZ2UucHJldmlvdXNWYWx1ZSB8fCB7fSk7XG4gICAgY29uc3QgY3VyckN0eEtleXMgPSBPYmplY3Qua2V5cyhjdHhDaGFuZ2UuY3VycmVudFZhbHVlIHx8IHt9KTtcblxuICAgIGlmIChwcmV2Q3R4S2V5cy5sZW5ndGggPT09IGN1cnJDdHhLZXlzLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgcHJvcE5hbWUgb2YgY3VyckN0eEtleXMpIHtcbiAgICAgICAgaWYgKHByZXZDdHhLZXlzLmluZGV4T2YocHJvcE5hbWUpID09PSAtMSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRXhpc3RpbmdDb250ZXh0KGN0eDogT2JqZWN0KTogdm9pZCB7XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgb2YgT2JqZWN0LmtleXMoY3R4KSkge1xuICAgICAgKDxhbnk+dGhpcy5fdmlld1JlZiEuY29udGV4dClbcHJvcE5hbWVdID0gKDxhbnk+dGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dClbcHJvcE5hbWVdO1xuICAgIH1cbiAgfVxufVxuIl19