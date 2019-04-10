import * as tslib_1 from "tslib";
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
var NgTemplateOutlet = /** @class */ (function () {
    function NgTemplateOutlet(_viewContainerRef) {
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
    NgTemplateOutlet.prototype._shouldRecreateView = function (changes) {
        var ctxChange = changes['ngTemplateOutletContext'];
        return !!changes['ngTemplateOutlet'] || (ctxChange && this._hasContextShapeChanged(ctxChange));
    };
    NgTemplateOutlet.prototype._hasContextShapeChanged = function (ctxChange) {
        var e_1, _a;
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
    };
    NgTemplateOutlet.prototype._updateExistingContext = function (ctx) {
        var e_2, _a;
        try {
            for (var _b = tslib_1.__values(Object.keys(ctx)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var propName = _c.value;
                this._viewRef.context[propName] = this.ngTemplateOutletContext[propName];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    NgTemplateOutlet.ngDirectiveDef = i0.ΔdefineDirective({ type: NgTemplateOutlet, selectors: [["", "ngTemplateOutlet", ""]], factory: function NgTemplateOutlet_Factory(t) { return new (t || NgTemplateOutlet)(i0.ΔdirectiveInject(i0.ViewContainerRef)); }, inputs: { ngTemplateOutletContext: "ngTemplateOutletContext", ngTemplateOutlet: "ngTemplateOutlet" }, features: [i0.ΔNgOnChangesFeature()] });
    return NgTemplateOutlet;
}());
export { NgTemplateOutlet };
/*@__PURE__*/ i0.ɵsetClassMetadata(NgTemplateOutlet, [{
        type: Directive,
        args: [{ selector: '[ngTemplateOutlet]' }]
    }], function () { return [{ type: i0.ViewContainerRef }]; }, { ngTemplateOutletContext: [{
            type: Input
        }], ngTemplateOutlet: [{
            type: Input
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBbUIsS0FBSyxFQUF1RCxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFdkk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0g7SUFpQkUsMEJBQW9CLGlCQUFtQztRQUFuQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBZi9DLGFBQVEsR0FBOEIsSUFBSSxDQUFDO1FBRW5EOzs7OztXQUtHO1FBQ2EsNEJBQXVCLEdBQWdCLElBQUksQ0FBQztRQUU1RDs7V0FFRztRQUNhLHFCQUFnQixHQUEwQixJQUFJLENBQUM7SUFFTCxDQUFDO0lBRTNELHNDQUFXLEdBQVgsVUFBWSxPQUFzQjtRQUNoQyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdkQsSUFBSSxZQUFZLEVBQUU7WUFDaEIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNqQixJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDOUU7WUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQ3JELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUMxRDtTQUNGO2FBQU07WUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO2dCQUNqRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7YUFDM0Q7U0FDRjtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSyw4Q0FBbUIsR0FBM0IsVUFBNEIsT0FBc0I7UUFDaEQsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVPLGtEQUF1QixHQUEvQixVQUFnQyxTQUF1Qjs7UUFDckQsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUU5RCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFBRTs7Z0JBQzdDLEtBQXFCLElBQUEsZ0JBQUEsaUJBQUEsV0FBVyxDQUFBLHdDQUFBLGlFQUFFO29CQUE3QixJQUFJLFFBQVEsd0JBQUE7b0JBQ2YsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUN4QyxPQUFPLElBQUksQ0FBQztxQkFDYjtpQkFDRjs7Ozs7Ozs7O1lBQ0QsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFFTyxpREFBc0IsR0FBOUIsVUFBK0IsR0FBVzs7O1lBQ3hDLEtBQXFCLElBQUEsS0FBQSxpQkFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO2dCQUFsQyxJQUFJLFFBQVEsV0FBQTtnQkFDVCxJQUFJLENBQUMsUUFBVSxDQUFDLE9BQVEsQ0FBQyxRQUFRLENBQUMsR0FBUyxJQUFJLENBQUMsdUJBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDMUY7Ozs7Ozs7OztJQUNILENBQUM7a0VBeEVVLGdCQUFnQiw4R0FBaEIsZ0JBQWdCOzJCQW5DN0I7Q0E0R0MsQUExRUQsSUEwRUM7U0F6RVksZ0JBQWdCO21DQUFoQixnQkFBZ0I7Y0FENUIsU0FBUztlQUFDLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFDOztrQkFVeEMsS0FBSzs7a0JBS0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVtYmVkZGVkVmlld1JlZiwgSW5wdXQsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEluc2VydHMgYW4gZW1iZWRkZWQgdmlldyBmcm9tIGEgcHJlcGFyZWQgYFRlbXBsYXRlUmVmYC5cbiAqXG4gKiBZb3UgY2FuIGF0dGFjaCBhIGNvbnRleHQgb2JqZWN0IHRvIHRoZSBgRW1iZWRkZWRWaWV3UmVmYCBieSBzZXR0aW5nIGBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdYC5cbiAqIGBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdYCBzaG91bGQgYmUgYW4gb2JqZWN0LCB0aGUgb2JqZWN0J3Mga2V5cyB3aWxsIGJlIGF2YWlsYWJsZSBmb3IgYmluZGluZ1xuICogYnkgdGhlIGxvY2FsIHRlbXBsYXRlIGBsZXRgIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwidGVtcGxhdGVSZWZFeHA7IGNvbnRleHQ6IGNvbnRleHRFeHBcIj48L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFVzaW5nIHRoZSBrZXkgYCRpbXBsaWNpdGAgaW4gdGhlIGNvbnRleHQgb2JqZWN0IHdpbGwgc2V0IGl0cyB2YWx1ZSBhcyBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ1RlbXBsYXRlT3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J05nVGVtcGxhdGVPdXRsZXQnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdUZW1wbGF0ZU91dGxldF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1RlbXBsYXRlT3V0bGV0IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBfdmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEEgY29udGV4dCBvYmplY3QgdG8gYXR0YWNoIHRvIHRoZSB7QGxpbmsgRW1iZWRkZWRWaWV3UmVmfS4gVGhpcyBzaG91bGQgYmUgYW5cbiAgICogb2JqZWN0LCB0aGUgb2JqZWN0J3Mga2V5cyB3aWxsIGJlIGF2YWlsYWJsZSBmb3IgYmluZGluZyBieSB0aGUgbG9jYWwgdGVtcGxhdGUgYGxldGBcbiAgICogZGVjbGFyYXRpb25zLlxuICAgKiBVc2luZyB0aGUga2V5IGAkaW1wbGljaXRgIGluIHRoZSBjb250ZXh0IG9iamVjdCB3aWxsIHNldCBpdHMgdmFsdWUgYXMgZGVmYXVsdC5cbiAgICovXG4gIEBJbnB1dCgpIHB1YmxpYyBuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dDogT2JqZWN0fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBIHN0cmluZyBkZWZpbmluZyB0aGUgdGVtcGxhdGUgcmVmZXJlbmNlIGFuZCBvcHRpb25hbGx5IHRoZSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgQElucHV0KCkgcHVibGljIG5nVGVtcGxhdGVPdXRsZXQ6IFRlbXBsYXRlUmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgcmVjcmVhdGVWaWV3ID0gdGhpcy5fc2hvdWxkUmVjcmVhdGVWaWV3KGNoYW5nZXMpO1xuXG4gICAgaWYgKHJlY3JlYXRlVmlldykge1xuICAgICAgaWYgKHRoaXMuX3ZpZXdSZWYpIHtcbiAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5yZW1vdmUodGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMuX3ZpZXdSZWYpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubmdUZW1wbGF0ZU91dGxldCkge1xuICAgICAgICB0aGlzLl92aWV3UmVmID0gdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcoXG4gICAgICAgICAgICB0aGlzLm5nVGVtcGxhdGVPdXRsZXQsIHRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fdmlld1JlZiAmJiB0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUV4aXN0aW5nQ29udGV4dCh0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2UgbmVlZCB0byByZS1jcmVhdGUgZXhpc3RpbmcgZW1iZWRkZWQgdmlldyBpZjpcbiAgICogLSB0ZW1wbGF0ZVJlZiBoYXMgY2hhbmdlZFxuICAgKiAtIGNvbnRleHQgaGFzIGNoYW5nZXNcbiAgICpcbiAgICogV2UgbWFyayBjb250ZXh0IG9iamVjdCBhcyBjaGFuZ2VkIHdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgb2JqZWN0XG4gICAqIHNoYXBlIGNoYW5nZXMgKG5ldyBwcm9wZXJ0aWVzIGFyZSBhZGRlZCBvciBleGlzdGluZyBwcm9wZXJ0aWVzIGFyZSByZW1vdmVkKS5cbiAgICogSW4gb3RoZXIgd29yZHMgd2UgY29uc2lkZXIgY29udGV4dCB3aXRoIHRoZSBzYW1lIHByb3BlcnRpZXMgYXMgXCJ0aGUgc2FtZVwiIGV2ZW5cbiAgICogaWYgb2JqZWN0IHJlZmVyZW5jZSBjaGFuZ2VzIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTM0MDcpLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2hvdWxkUmVjcmVhdGVWaWV3KGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiBib29sZWFuIHtcbiAgICBjb25zdCBjdHhDaGFuZ2UgPSBjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCddO1xuICAgIHJldHVybiAhIWNoYW5nZXNbJ25nVGVtcGxhdGVPdXRsZXQnXSB8fCAoY3R4Q2hhbmdlICYmIHRoaXMuX2hhc0NvbnRleHRTaGFwZUNoYW5nZWQoY3R4Q2hhbmdlKSk7XG4gIH1cblxuICBwcml2YXRlIF9oYXNDb250ZXh0U2hhcGVDaGFuZ2VkKGN0eENoYW5nZTogU2ltcGxlQ2hhbmdlKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJldkN0eEtleXMgPSBPYmplY3Qua2V5cyhjdHhDaGFuZ2UucHJldmlvdXNWYWx1ZSB8fCB7fSk7XG4gICAgY29uc3QgY3VyckN0eEtleXMgPSBPYmplY3Qua2V5cyhjdHhDaGFuZ2UuY3VycmVudFZhbHVlIHx8IHt9KTtcblxuICAgIGlmIChwcmV2Q3R4S2V5cy5sZW5ndGggPT09IGN1cnJDdHhLZXlzLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgcHJvcE5hbWUgb2YgY3VyckN0eEtleXMpIHtcbiAgICAgICAgaWYgKHByZXZDdHhLZXlzLmluZGV4T2YocHJvcE5hbWUpID09PSAtMSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUV4aXN0aW5nQ29udGV4dChjdHg6IE9iamVjdCk6IHZvaWQge1xuICAgIGZvciAobGV0IHByb3BOYW1lIG9mIE9iamVjdC5rZXlzKGN0eCkpIHtcbiAgICAgICg8YW55PnRoaXMuX3ZpZXdSZWYgIS5jb250ZXh0KVtwcm9wTmFtZV0gPSAoPGFueT50aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KVtwcm9wTmFtZV07XG4gICAgfVxuICB9XG59XG4iXX0=