/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * @description
 *
 * Inserts an embedded view from a prepared `TemplateRef`.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * Note: using the key `$implicit` in the context object will set its value as default.
 *
 * ## Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 *
 */
var NgTemplateOutlet = /** @class */ (function () {
    function NgTemplateOutlet(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
    }
    NgTemplateOutlet.prototype.ngOnChanges = function (changes) {
        var recreateView = this._shouldRecreateView(changes);
        if (recreateView) {
            if (this._viewRef) {
                this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
            }
            if (this.ngTemplateOutlet) {
                this._viewRef = this._viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, this.ngTemplateOutletContext);
            }
        }
        else {
            if (this._viewRef && this.ngTemplateOutletContext) {
                this._updateExistingContext(this.ngTemplateOutletContext);
            }
        }
    };
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
    NgTemplateOutlet.prototype._shouldRecreateView = /**
       * We need to re-create existing embedded view if:
       * - templateRef has changed
       * - context has changes
       *
       * We mark context object as changed when the corresponding object
       * shape changes (new properties are added or existing properties are removed).
       * In other words we consider context with the same properties as "the same" even
       * if object reference changes (see https://github.com/angular/angular/issues/13407).
       */
    function (changes) {
        var ctxChange = changes['ngTemplateOutletContext'];
        return !!changes['ngTemplateOutlet'] || (ctxChange && this._hasContextShapeChanged(ctxChange));
    };
    NgTemplateOutlet.prototype._hasContextShapeChanged = function (ctxChange) {
        var prevCtxKeys = Object.keys(ctxChange.previousValue || {});
        var currCtxKeys = Object.keys(ctxChange.currentValue || {});
        if (prevCtxKeys.length === currCtxKeys.length) {
            try {
                for (var currCtxKeys_1 = tslib_1.__values(currCtxKeys), currCtxKeys_1_1 = currCtxKeys_1.next(); !currCtxKeys_1_1.done; currCtxKeys_1_1 = currCtxKeys_1.next()) {
                    var propName = currCtxKeys_1_1.value;
                    if (prevCtxKeys.indexOf(propName) === -1) {
                        return true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (currCtxKeys_1_1 && !currCtxKeys_1_1.done && (_a = currCtxKeys_1.return)) _a.call(currCtxKeys_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return false;
        }
        else {
            return true;
        }
        var e_1, _a;
    };
    NgTemplateOutlet.prototype._updateExistingContext = function (ctx) {
        try {
            for (var _a = tslib_1.__values(Object.keys(ctx)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var propName = _b.value;
                this._viewRef.context[propName] = this.ngTemplateOutletContext[propName];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var e_2, _c;
    };
    NgTemplateOutlet.decorators = [
        { type: Directive, args: [{ selector: '[ngTemplateOutlet]' },] }
    ];
    /** @nocollapse */
    NgTemplateOutlet.ctorParameters = function () { return [
        { type: ViewContainerRef, },
    ]; };
    NgTemplateOutlet.propDecorators = {
        "ngTemplateOutletContext": [{ type: Input },],
        "ngTemplateOutlet": [{ type: Input },],
    };
    return NgTemplateOutlet;
}());
export { NgTemplateOutlet };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQW1CLEtBQUssRUFBMEMsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWtDckksMEJBQW9CLGlCQUFtQztRQUFuQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO0tBQUk7SUFFM0Qsc0NBQVcsR0FBWCxVQUFZLE9BQXNCO1FBQ2hDLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2RCxJQUFJLFlBQVksRUFBRTtZQUNoQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUM5RTtZQUVELElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FDckQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQzFEO1NBQ0Y7YUFBTTtZQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUMzRDtTQUNGO0tBQ0Y7SUFFRDs7Ozs7Ozs7O09BU0c7Ozs7Ozs7Ozs7O0lBQ0ssOENBQW1COzs7Ozs7Ozs7O0lBQTNCLFVBQTRCLE9BQXNCO1FBQ2hELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0tBQ2hHO0lBRU8sa0RBQXVCLEdBQS9CLFVBQWdDLFNBQXVCO1FBQ3JELElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMvRCxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxNQUFNLEVBQUU7O2dCQUM3QyxLQUFxQixJQUFBLGdCQUFBLGlCQUFBLFdBQVcsQ0FBQSx3Q0FBQTtvQkFBM0IsSUFBSSxRQUFRLHdCQUFBO29CQUNmLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDeEMsT0FBTyxJQUFJLENBQUM7cUJBQ2I7aUJBQ0Y7Ozs7Ozs7OztZQUNELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDO1NBQ2I7O0tBQ0Y7SUFFTyxpREFBc0IsR0FBOUIsVUFBK0IsR0FBVzs7WUFDeEMsS0FBcUIsSUFBQSxLQUFBLGlCQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUEsZ0JBQUE7Z0JBQWhDLElBQUksUUFBUSxXQUFBO2dCQUNULElBQUksQ0FBQyxRQUFRLENBQUMsT0FBUSxDQUFDLFFBQVEsQ0FBQyxHQUFTLElBQUksQ0FBQyx1QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN4Rjs7Ozs7Ozs7OztLQUNGOztnQkFoRUYsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFDOzs7O2dCQTFCcUQsZ0JBQWdCOzs7NENBOEI3RyxLQUFLO3FDQUVMLEtBQUs7OzJCQXhDUjs7U0FtQ2EsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRW1iZWRkZWRWaWV3UmVmLCBJbnB1dCwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cInRlbXBsYXRlUmVmRXhwOyBjb250ZXh0OiBjb250ZXh0RXhwXCI+PC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBJbnNlcnRzIGFuIGVtYmVkZGVkIHZpZXcgZnJvbSBhIHByZXBhcmVkIGBUZW1wbGF0ZVJlZmAuXG4gKlxuICogWW91IGNhbiBhdHRhY2ggYSBjb250ZXh0IG9iamVjdCB0byB0aGUgYEVtYmVkZGVkVmlld1JlZmAgYnkgc2V0dGluZyBgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XWAuXG4gKiBgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XWAgc2hvdWxkIGJlIGFuIG9iamVjdCwgdGhlIG9iamVjdCdzIGtleXMgd2lsbCBiZSBhdmFpbGFibGUgZm9yIGJpbmRpbmdcbiAqIGJ5IHRoZSBsb2NhbCB0ZW1wbGF0ZSBgbGV0YCBkZWNsYXJhdGlvbnMuXG4gKlxuICogTm90ZTogdXNpbmcgdGhlIGtleSBgJGltcGxpY2l0YCBpbiB0aGUgY29udGV4dCBvYmplY3Qgd2lsbCBzZXQgaXRzIHZhbHVlIGFzIGRlZmF1bHQuXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdUZW1wbGF0ZU91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ1RlbXBsYXRlT3V0bGV0J31cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1RlbXBsYXRlT3V0bGV0XSd9KVxuZXhwb3J0IGNsYXNzIE5nVGVtcGxhdGVPdXRsZXQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBwcml2YXRlIF92aWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PjtcblxuICBASW5wdXQoKSBwdWJsaWMgbmdUZW1wbGF0ZU91dGxldENvbnRleHQ6IE9iamVjdDtcblxuICBASW5wdXQoKSBwdWJsaWMgbmdUZW1wbGF0ZU91dGxldDogVGVtcGxhdGVSZWY8YW55PjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCByZWNyZWF0ZVZpZXcgPSB0aGlzLl9zaG91bGRSZWNyZWF0ZVZpZXcoY2hhbmdlcyk7XG5cbiAgICBpZiAocmVjcmVhdGVWaWV3KSB7XG4gICAgICBpZiAodGhpcy5fdmlld1JlZikge1xuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLnJlbW92ZSh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy5fdmlld1JlZikpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5uZ1RlbXBsYXRlT3V0bGV0KSB7XG4gICAgICAgIHRoaXMuX3ZpZXdSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgICAgIHRoaXMubmdUZW1wbGF0ZU91dGxldCwgdGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl92aWV3UmVmICYmIHRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlRXhpc3RpbmdDb250ZXh0KHRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBuZWVkIHRvIHJlLWNyZWF0ZSBleGlzdGluZyBlbWJlZGRlZCB2aWV3IGlmOlxuICAgKiAtIHRlbXBsYXRlUmVmIGhhcyBjaGFuZ2VkXG4gICAqIC0gY29udGV4dCBoYXMgY2hhbmdlc1xuICAgKlxuICAgKiBXZSBtYXJrIGNvbnRleHQgb2JqZWN0IGFzIGNoYW5nZWQgd2hlbiB0aGUgY29ycmVzcG9uZGluZyBvYmplY3RcbiAgICogc2hhcGUgY2hhbmdlcyAobmV3IHByb3BlcnRpZXMgYXJlIGFkZGVkIG9yIGV4aXN0aW5nIHByb3BlcnRpZXMgYXJlIHJlbW92ZWQpLlxuICAgKiBJbiBvdGhlciB3b3JkcyB3ZSBjb25zaWRlciBjb250ZXh0IHdpdGggdGhlIHNhbWUgcHJvcGVydGllcyBhcyBcInRoZSBzYW1lXCIgZXZlblxuICAgKiBpZiBvYmplY3QgcmVmZXJlbmNlIGNoYW5nZXMgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMzQwNykuXG4gICAqL1xuICBwcml2YXRlIF9zaG91bGRSZWNyZWF0ZVZpZXcoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGN0eENoYW5nZSA9IGNoYW5nZXNbJ25nVGVtcGxhdGVPdXRsZXRDb250ZXh0J107XG4gICAgcmV0dXJuICEhY2hhbmdlc1snbmdUZW1wbGF0ZU91dGxldCddIHx8IChjdHhDaGFuZ2UgJiYgdGhpcy5faGFzQ29udGV4dFNoYXBlQ2hhbmdlZChjdHhDaGFuZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhc0NvbnRleHRTaGFwZUNoYW5nZWQoY3R4Q2hhbmdlOiBTaW1wbGVDaGFuZ2UpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcmV2Q3R4S2V5cyA9IE9iamVjdC5rZXlzKGN0eENoYW5nZS5wcmV2aW91c1ZhbHVlIHx8IHt9KTtcbiAgICBjb25zdCBjdXJyQ3R4S2V5cyA9IE9iamVjdC5rZXlzKGN0eENoYW5nZS5jdXJyZW50VmFsdWUgfHwge30pO1xuXG4gICAgaWYgKHByZXZDdHhLZXlzLmxlbmd0aCA9PT0gY3VyckN0eEtleXMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBwcm9wTmFtZSBvZiBjdXJyQ3R4S2V5cykge1xuICAgICAgICBpZiAocHJldkN0eEtleXMuaW5kZXhPZihwcm9wTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRXhpc3RpbmdDb250ZXh0KGN0eDogT2JqZWN0KTogdm9pZCB7XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgb2YgT2JqZWN0LmtleXMoY3R4KSkge1xuICAgICAgKDxhbnk+dGhpcy5fdmlld1JlZi5jb250ZXh0KVtwcm9wTmFtZV0gPSAoPGFueT50aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KVtwcm9wTmFtZV07XG4gICAgfVxuICB9XG59XG4iXX0=