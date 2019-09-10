import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ɵɵdefineDirective, ɵɵstyleMap, ɵɵstyling, ɵɵstylingApply } from '@angular/core';
import { NgStyleImpl, NgStyleImplProvider } from './ng_style_impl';
import * as i0 from "@angular/core";
import * as i1 from "./ng_style_impl";
/*
 * NgStyle (as well as NgClass) behaves differently when loaded in the VE and when not.
 *
 * If the VE is present (which is for older versions of Angular) then NgStyle will inject
 * the legacy diffing algorithm as a service and delegate all styling changes to that.
 *
 * If the VE is not present then NgStyle will normalize (through the injected service) and
 * then write all styling changes to the `[style]` binding directly (through a host binding).
 * Then Angular will notice the host binding change and treat the changes as styling
 * changes and apply them via the core styling instructions that exist within Angular.
 */
// used when the VE is present
export var ngStyleDirectiveDef__PRE_R3__ = undefined;
export var ngStyleFactoryDef__PRE_R3__ = undefined;
// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export var ngStyleDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: function () { },
    selectors: null,
    hostBindings: function (rf, ctx, elIndex) {
        if (rf & 1 /* Create */) {
            ɵɵstyling();
        }
        if (rf & 2 /* Update */) {
            ɵɵstyleMap(ctx.getValue());
            ɵɵstylingApply();
        }
    }
});
export var ngStyleFactoryDef__POST_R3__ = function () { };
export var ngStyleDirectiveDef = ngStyleDirectiveDef__POST_R3__;
export var ngStyleFactoryDef = ngStyleDirectiveDef__POST_R3__;
/**
 * Serves as the base non-VE container for NgStyle.
 *
 * While this is a base class that NgStyle extends from, the
 * class itself acts as a container for non-VE code to setup
 * a link to the `[style]` host binding (via the static
 * `ngDirectiveDef` property on the class).
 *
 * Note that the `ngDirectiveDef` property's code is switched
 * depending if VE is present or not (this allows for the
 * binding code to be set only for newer versions of Angular).
 *
 * @publicApi
 */
var NgStyleBase = /** @class */ (function () {
    function NgStyleBase(_delegate) {
        this._delegate = _delegate;
    }
    NgStyleBase.prototype.getValue = function () { return this._delegate.getValue(); };
    NgStyleBase.ngDirectiveDef = ngStyleDirectiveDef;
    NgStyleBase.ngFactory = ngStyleFactoryDef;
    return NgStyleBase;
}());
export { NgStyleBase };
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 *
 * Set the font of the containing element to the result of an expression.
 *
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 * ```
 *
 * Set the width of the containing element to a pixel value returned by an expression.
 *
 * ```
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 * ```
 *
 * Set a collection of style values using an expression that returns key-value pairs.
 *
 * ```
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * An attribute directive that updates styles for the containing HTML element.
 * Sets one or more style properties, specified as colon-separated key-value pairs.
 * The key is a style name, with an optional `.<unit>` suffix
 * (such as 'top.px', 'font-style.em').
 * The value is an expression to be evaluated.
 * The resulting non-null value, expressed in the given unit,
 * is assigned to the given style property.
 * If the result of evaluation is null, the corresponding style is removed.
 *
 * @publicApi
 */
var NgStyle = /** @class */ (function (_super) {
    tslib_1.__extends(NgStyle, _super);
    function NgStyle(delegate) {
        return _super.call(this, delegate) || this;
    }
    Object.defineProperty(NgStyle.prototype, "ngStyle", {
        set: function (value) { this._delegate.setNgStyle(value); },
        enumerable: true,
        configurable: true
    });
    NgStyle.prototype.ngDoCheck = function () { this._delegate.applyChanges(); };
    NgStyle.ngFactoryDef = function NgStyle_Factory(t) { return new (t || NgStyle)(i0.ɵɵdirectiveInject(i1.NgStyleImpl)); };
    NgStyle.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgStyle, selectors: [["", "ngStyle", ""]], inputs: { ngStyle: "ngStyle" }, features: [i0.ɵɵProvidersFeature([NgStyleImplProvider]), i0.ɵɵInheritDefinitionFeature] });
    return NgStyle;
}(NgStyleBase));
export { NgStyle };
/*@__PURE__*/ i0.ɵsetClassMetadata(NgStyle, [{
        type: Directive,
        args: [{ selector: '[ngStyle]', providers: [NgStyleImplProvider] }]
    }], function () { return [{ type: i1.NgStyleImpl }]; }, { ngStyle: [{
            type: Input,
            args: ['ngStyle']
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFnQixpQkFBaUIsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVoSSxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQUlqRTs7Ozs7Ozs7OztHQVVHO0FBRUgsOEJBQThCO0FBQzlCLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztBQUN2RCxNQUFNLENBQUMsSUFBTSwyQkFBMkIsR0FBRyxTQUFTLENBQUM7QUFFckQsMkRBQTJEO0FBQzNELDBEQUEwRDtBQUMxRCxjQUFjO0FBQ2QsTUFBTSxDQUFDLElBQU0sOEJBQThCLEdBQUcsaUJBQWlCLENBQUM7SUFDOUQsSUFBSSxFQUFFLGNBQVksQ0FBUTtJQUMxQixTQUFTLEVBQUUsSUFBVztJQUN0QixZQUFZLEVBQUUsVUFBUyxFQUFnQixFQUFFLEdBQVEsRUFBRSxPQUFlO1FBQ2hFLElBQUksRUFBRSxpQkFBc0IsRUFBRTtZQUM1QixTQUFTLEVBQUUsQ0FBQztTQUNiO1FBQ0QsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1lBQzVCLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMzQixjQUFjLEVBQUUsQ0FBQztTQUNsQjtJQUNILENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsSUFBTSw0QkFBNEIsR0FBRyxjQUFZLENBQUMsQ0FBQztBQUUxRCxNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FoQm5CLDhCQWdCbUQsQ0FBQztBQUNqRSxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FqQmpCLDhCQWlCaUQsQ0FBQztBQUUvRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0g7SUFJRSxxQkFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7SUFFaEQsOEJBQVEsR0FBUixjQUFhLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFMekMsMEJBQWMsR0FBUSxtQkFBbUIsQ0FBQztJQUMxQyxxQkFBUyxHQUFRLGlCQUFpQixDQUFDO0lBSzVDLGtCQUFDO0NBQUEsQUFQRCxJQU9DO1NBUFksV0FBVztBQVN4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQ0c7QUFDSDtJQUM2QixtQ0FBVztJQUN0QyxpQkFBWSxRQUFxQjtlQUFJLGtCQUFNLFFBQVEsQ0FBQztJQUFFLENBQUM7SUFFdkQsc0JBQ0ksNEJBQU87YUFEWCxVQUNZLEtBQWtDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVyRiwyQkFBUyxHQUFULGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7MEVBTm5DLE9BQU87MERBQVAsT0FBTyxxR0FEMEIsQ0FBQyxtQkFBbUIsQ0FBQztrQkE5R25FO0NBc0hDLEFBUkQsQ0FDNkIsV0FBVyxHQU92QztTQVBZLE9BQU87bUNBQVAsT0FBTztjQURuQixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUM7O2tCQUlqRSxLQUFLO21CQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSW5wdXQsIMm1UmVuZGVyRmxhZ3MsIMm1ybVkZWZpbmVEaXJlY3RpdmUsIMm1ybVzdHlsZU1hcCwgybXJtXN0eWxpbmcsIMm1ybVzdHlsaW5nQXBwbHl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge05nU3R5bGVJbXBsLCBOZ1N0eWxlSW1wbFByb3ZpZGVyfSBmcm9tICcuL25nX3N0eWxlX2ltcGwnO1xuXG5cblxuLypcbiAqIE5nU3R5bGUgKGFzIHdlbGwgYXMgTmdDbGFzcykgYmVoYXZlcyBkaWZmZXJlbnRseSB3aGVuIGxvYWRlZCBpbiB0aGUgVkUgYW5kIHdoZW4gbm90LlxuICpcbiAqIElmIHRoZSBWRSBpcyBwcmVzZW50ICh3aGljaCBpcyBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikgdGhlbiBOZ1N0eWxlIHdpbGwgaW5qZWN0XG4gKiB0aGUgbGVnYWN5IGRpZmZpbmcgYWxnb3JpdGhtIGFzIGEgc2VydmljZSBhbmQgZGVsZWdhdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGF0LlxuICpcbiAqIElmIHRoZSBWRSBpcyBub3QgcHJlc2VudCB0aGVuIE5nU3R5bGUgd2lsbCBub3JtYWxpemUgKHRocm91Z2ggdGhlIGluamVjdGVkIHNlcnZpY2UpIGFuZFxuICogdGhlbiB3cml0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoZSBgW3N0eWxlXWAgYmluZGluZyBkaXJlY3RseSAodGhyb3VnaCBhIGhvc3QgYmluZGluZykuXG4gKiBUaGVuIEFuZ3VsYXIgd2lsbCBub3RpY2UgdGhlIGhvc3QgYmluZGluZyBjaGFuZ2UgYW5kIHRyZWF0IHRoZSBjaGFuZ2VzIGFzIHN0eWxpbmdcbiAqIGNoYW5nZXMgYW5kIGFwcGx5IHRoZW0gdmlhIHRoZSBjb3JlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIHRoYXQgZXhpc3Qgd2l0aGluIEFuZ3VsYXIuXG4gKi9cblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBwcmVzZW50XG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIG5vdCBwcmVzZW50IChub3RlIHRoZSBkaXJlY3RpdmUgd2lsbFxuLy8gbmV2ZXIgYmUgaW5zdGFudGlhdGVkIG5vcm1hbGx5IGJlY2F1c2UgaXQgaXMgYXBhcnQgb2YgYVxuLy8gYmFzZSBjbGFzcylcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QT1NUX1IzX18gPSDJtcm1ZGVmaW5lRGlyZWN0aXZlKHtcbiAgdHlwZTogZnVuY3Rpb24oKSB7fSBhcyBhbnksXG4gIHNlbGVjdG9yczogbnVsbCBhcyBhbnksXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLkNyZWF0ZSkge1xuICAgICAgybXJtXN0eWxpbmcoKTtcbiAgICB9XG4gICAgaWYgKHJmICYgybVSZW5kZXJGbGFncy5VcGRhdGUpIHtcbiAgICAgIMm1ybVzdHlsZU1hcChjdHguZ2V0VmFsdWUoKSk7XG4gICAgICDJtcm1c3R5bGluZ0FwcGx5KCk7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGNvbnN0IG5nU3R5bGVGYWN0b3J5RGVmX19QT1NUX1IzX18gPSBmdW5jdGlvbigpIHt9O1xuXG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZiA9IG5nU3R5bGVEaXJlY3RpdmVEZWZfX1BSRV9SM19fO1xuZXhwb3J0IGNvbnN0IG5nU3R5bGVGYWN0b3J5RGVmID0gbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5cbi8qKlxuICogU2VydmVzIGFzIHRoZSBiYXNlIG5vbi1WRSBjb250YWluZXIgZm9yIE5nU3R5bGUuXG4gKlxuICogV2hpbGUgdGhpcyBpcyBhIGJhc2UgY2xhc3MgdGhhdCBOZ1N0eWxlIGV4dGVuZHMgZnJvbSwgdGhlXG4gKiBjbGFzcyBpdHNlbGYgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3Igbm9uLVZFIGNvZGUgdG8gc2V0dXBcbiAqIGEgbGluayB0byB0aGUgYFtzdHlsZV1gIGhvc3QgYmluZGluZyAodmlhIHRoZSBzdGF0aWNcbiAqIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkgb24gdGhlIGNsYXNzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkncyBjb2RlIGlzIHN3aXRjaGVkXG4gKiBkZXBlbmRpbmcgaWYgVkUgaXMgcHJlc2VudCBvciBub3QgKHRoaXMgYWxsb3dzIGZvciB0aGVcbiAqIGJpbmRpbmcgY29kZSB0byBiZSBzZXQgb25seSBmb3IgbmV3ZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdTdHlsZUJhc2Uge1xuICBzdGF0aWMgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG5nU3R5bGVEaXJlY3RpdmVEZWY7XG4gIHN0YXRpYyBuZ0ZhY3Rvcnk6IGFueSA9IG5nU3R5bGVGYWN0b3J5RGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nU3R5bGVJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFNldCB0aGUgZm9udCBvZiB0aGUgY29udGFpbmluZyBlbGVtZW50IHRvIHRoZSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGVFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBTZXQgdGhlIHdpZHRoIG9mIHRoZSBjb250YWluaW5nIGVsZW1lbnQgdG8gYSBwaXhlbCB2YWx1ZSByZXR1cm5lZCBieSBhbiBleHByZXNzaW9uLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J21heC13aWR0aC5weCc6IHdpZHRoRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogU2V0IGEgY29sbGVjdGlvbiBvZiBzdHlsZSB2YWx1ZXMgdXNpbmcgYW4gZXhwcmVzc2lvbiB0aGF0IHJldHVybnMga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFuIGF0dHJpYnV0ZSBkaXJlY3RpdmUgdGhhdCB1cGRhdGVzIHN0eWxlcyBmb3IgdGhlIGNvbnRhaW5pbmcgSFRNTCBlbGVtZW50LlxuICogU2V0cyBvbmUgb3IgbW9yZSBzdHlsZSBwcm9wZXJ0aWVzLCBzcGVjaWZpZWQgYXMgY29sb24tc2VwYXJhdGVkIGtleS12YWx1ZSBwYWlycy5cbiAqIFRoZSBrZXkgaXMgYSBzdHlsZSBuYW1lLCB3aXRoIGFuIG9wdGlvbmFsIGAuPHVuaXQ+YCBzdWZmaXhcbiAqIChzdWNoIGFzICd0b3AucHgnLCAnZm9udC1zdHlsZS5lbScpLlxuICogVGhlIHZhbHVlIGlzIGFuIGV4cHJlc3Npb24gdG8gYmUgZXZhbHVhdGVkLlxuICogVGhlIHJlc3VsdGluZyBub24tbnVsbCB2YWx1ZSwgZXhwcmVzc2VkIGluIHRoZSBnaXZlbiB1bml0LFxuICogaXMgYXNzaWduZWQgdG8gdGhlIGdpdmVuIHN0eWxlIHByb3BlcnR5LlxuICogSWYgdGhlIHJlc3VsdCBvZiBldmFsdWF0aW9uIGlzIG51bGwsIHRoZSBjb3JyZXNwb25kaW5nIHN0eWxlIGlzIHJlbW92ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N0eWxlXScsIHByb3ZpZGVyczogW05nU3R5bGVJbXBsUHJvdmlkZXJdfSlcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlIGV4dGVuZHMgTmdTdHlsZUJhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IE5nU3R5bGVJbXBsKSB7IHN1cGVyKGRlbGVnYXRlKTsgfVxuXG4gIEBJbnB1dCgnbmdTdHlsZScpXG4gIHNldCBuZ1N0eWxlKHZhbHVlOiB7W2tsYXNzOiBzdHJpbmddOiBhbnl9fG51bGwpIHsgdGhpcy5fZGVsZWdhdGUuc2V0TmdTdHlsZSh2YWx1ZSk7IH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=