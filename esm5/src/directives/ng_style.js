import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ɵdefineDirective, ɵelementStyling, ɵelementStylingApply, ɵelementStylingMap } from '@angular/core';
import { NgStyleImpl, NgStyleImplProvider } from './ng_style_impl';
import * as i0 from "@angular/core";
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
// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export var ngStyleDirectiveDef__POST_R3__ = ɵdefineDirective({
    type: function () { },
    selectors: null,
    factory: function () { },
    hostBindings: function (rf, ctx, elIndex) {
        if (rf & 1 /* Create */) {
            ɵelementStyling(null, null, null, ctx);
        }
        if (rf & 2 /* Update */) {
            ɵelementStylingMap(elIndex, null, ctx.getValue(), ctx);
            ɵelementStylingApply(elIndex, ctx);
        }
    }
});
export var ngStyleDirectiveDef = ngStyleDirectiveDef__POST_R3__;
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
    NgStyle.ngDirectiveDef = i0.ɵdefineDirective({ type: NgStyle, selectors: [["", "ngStyle", ""]], factory: function NgStyle_Factory(t) { return new (t || NgStyle)(i0.ɵdirectiveInject(NgStyleImpl)); }, inputs: { ngStyle: "ngStyle" }, features: [i0.ɵProvidersFeature([NgStyleImplProvider]), i0.ɵInheritDefinitionFeature] });
    return NgStyle;
}(NgStyleBase));
export { NgStyle };
/*@__PURE__*/ i0.ɵsetClassMetadata(NgStyle, [{
        type: Directive,
        args: [{ selector: '[ngStyle]', providers: [NgStyleImplProvider] }]
    }], function () { return [{
        type: NgStyleImpl
    }]; }, { ngStyle: [{
            type: Input,
            args: ['ngStyle']
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFnQixnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkosT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUlqRTs7Ozs7Ozs7OztHQVVHO0FBRUgsOEJBQThCO0FBQzlCLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztBQUV2RCwyREFBMkQ7QUFDM0QsMERBQTBEO0FBQzFELGNBQWM7QUFDZCxNQUFNLENBQUMsSUFBTSw4QkFBOEIsR0FBRyxnQkFBZ0IsQ0FBQztJQUM3RCxJQUFJLEVBQUUsY0FBWSxDQUFRO0lBQzFCLFNBQVMsRUFBRSxJQUFXO0lBQ3RCLE9BQU8sRUFBRSxjQUFPLENBQUM7SUFDakIsWUFBWSxFQUFFLFVBQVMsRUFBZ0IsRUFBRSxHQUFRLEVBQUUsT0FBZTtRQUNoRSxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7WUFDNUIsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1lBQzVCLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELG9CQUFvQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FmbkIsOEJBZW1ELENBQUM7QUFFakU7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNIO0lBR0UscUJBQXNCLFNBQXNCO1FBQXRCLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDO0lBRWhELDhCQUFRLEdBQVIsY0FBYSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBSnpDLDBCQUFjLEdBQVEsbUJBQW1CLENBQUM7SUFLbkQsa0JBQUM7Q0FBQSxBQU5ELElBTUM7U0FOWSxXQUFXO0FBUXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1DRztBQUNIO0lBQzZCLG1DQUFXO0lBQ3RDLGlCQUFZLFFBQXFCO2VBQUksa0JBQU0sUUFBUSxDQUFDO0lBQUUsQ0FBQztJQUV2RCxzQkFDSSw0QkFBTzthQURYLFVBQ1ksS0FBa0MsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRXJGLDJCQUFTLEdBQVQsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQzt5REFObkMsT0FBTyw0RkFBUCxPQUFPLHNCQWxHWixXQUFXLHVFQWlHMkIsQ0FBQyxtQkFBbUIsQ0FBQztrQkExR25FO0NBa0hDLEFBUkQsQ0FDNkIsV0FBVyxHQU92QztTQVBZLE9BQU87bUNBQVAsT0FBTztjQURuQixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUM7O2NBakc1RCxXQUFXOztrQkFxR2hCLEtBQUs7bUJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBJbnB1dCwgybVSZW5kZXJGbGFncywgybVkZWZpbmVEaXJlY3RpdmUsIMm1ZWxlbWVudFN0eWxpbmcsIMm1ZWxlbWVudFN0eWxpbmdBcHBseSwgybVlbGVtZW50U3R5bGluZ01hcH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdTdHlsZUltcGwsIE5nU3R5bGVJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfc3R5bGVfaW1wbCc7XG5cblxuXG4vKlxuICogTmdTdHlsZSAoYXMgd2VsbCBhcyBOZ0NsYXNzKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nU3R5bGUgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gybVkZWZpbmVEaXJlY3RpdmUoe1xuICB0eXBlOiBmdW5jdGlvbigpIHt9IGFzIGFueSxcbiAgc2VsZWN0b3JzOiBudWxsIGFzIGFueSxcbiAgZmFjdG9yeTogKCkgPT4ge30sXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLkNyZWF0ZSkge1xuICAgICAgybVlbGVtZW50U3R5bGluZyhudWxsLCBudWxsLCBudWxsLCBjdHgpO1xuICAgIH1cbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybVlbGVtZW50U3R5bGluZ01hcChlbEluZGV4LCBudWxsLCBjdHguZ2V0VmFsdWUoKSwgY3R4KTtcbiAgICAgIMm1ZWxlbWVudFN0eWxpbmdBcHBseShlbEluZGV4LCBjdHgpO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmID0gbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5cbi8qKlxuICogU2VydmVzIGFzIHRoZSBiYXNlIG5vbi1WRSBjb250YWluZXIgZm9yIE5nU3R5bGUuXG4gKlxuICogV2hpbGUgdGhpcyBpcyBhIGJhc2UgY2xhc3MgdGhhdCBOZ1N0eWxlIGV4dGVuZHMgZnJvbSwgdGhlXG4gKiBjbGFzcyBpdHNlbGYgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3Igbm9uLVZFIGNvZGUgdG8gc2V0dXBcbiAqIGEgbGluayB0byB0aGUgYFtzdHlsZV1gIGhvc3QgYmluZGluZyAodmlhIHRoZSBzdGF0aWNcbiAqIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkgb24gdGhlIGNsYXNzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkncyBjb2RlIGlzIHN3aXRjaGVkXG4gKiBkZXBlbmRpbmcgaWYgVkUgaXMgcHJlc2VudCBvciBub3QgKHRoaXMgYWxsb3dzIGZvciB0aGVcbiAqIGJpbmRpbmcgY29kZSB0byBiZSBzZXQgb25seSBmb3IgbmV3ZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdTdHlsZUJhc2Uge1xuICBzdGF0aWMgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG5nU3R5bGVEaXJlY3RpdmVEZWY7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9kZWxlZ2F0ZTogTmdTdHlsZUltcGwpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5nZXRWYWx1ZSgpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogU2V0IHRoZSBmb250IG9mIHRoZSBjb250YWluaW5nIGVsZW1lbnQgdG8gdGhlIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZUV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFNldCB0aGUgd2lkdGggb2YgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCB0byBhIHBpeGVsIHZhbHVlIHJldHVybmVkIGJ5IGFuIGV4cHJlc3Npb24uXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnbWF4LXdpZHRoLnB4Jzogd2lkdGhFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBTZXQgYSBjb2xsZWN0aW9uIG9mIHN0eWxlIHZhbHVlcyB1c2luZyBhbiBleHByZXNzaW9uIHRoYXQgcmV0dXJucyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cIm9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYXR0cmlidXRlIGRpcmVjdGl2ZSB0aGF0IHVwZGF0ZXMgc3R5bGVzIGZvciB0aGUgY29udGFpbmluZyBIVE1MIGVsZW1lbnQuXG4gKiBTZXRzIG9uZSBvciBtb3JlIHN0eWxlIHByb3BlcnRpZXMsIHNwZWNpZmllZCBhcyBjb2xvbi1zZXBhcmF0ZWQga2V5LXZhbHVlIHBhaXJzLlxuICogVGhlIGtleSBpcyBhIHN0eWxlIG5hbWUsIHdpdGggYW4gb3B0aW9uYWwgYC48dW5pdD5gIHN1ZmZpeFxuICogKHN1Y2ggYXMgJ3RvcC5weCcsICdmb250LXN0eWxlLmVtJykuXG4gKiBUaGUgdmFsdWUgaXMgYW4gZXhwcmVzc2lvbiB0byBiZSBldmFsdWF0ZWQuXG4gKiBUaGUgcmVzdWx0aW5nIG5vbi1udWxsIHZhbHVlLCBleHByZXNzZWQgaW4gdGhlIGdpdmVuIHVuaXQsXG4gKiBpcyBhc3NpZ25lZCB0byB0aGUgZ2l2ZW4gc3R5bGUgcHJvcGVydHkuXG4gKiBJZiB0aGUgcmVzdWx0IG9mIGV2YWx1YXRpb24gaXMgbnVsbCwgdGhlIGNvcnJlc3BvbmRpbmcgc3R5bGUgaXMgcmVtb3ZlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3R5bGVdJywgcHJvdmlkZXJzOiBbTmdTdHlsZUltcGxQcm92aWRlcl19KVxuZXhwb3J0IGNsYXNzIE5nU3R5bGUgZXh0ZW5kcyBOZ1N0eWxlQmFzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogTmdTdHlsZUltcGwpIHsgc3VwZXIoZGVsZWdhdGUpOyB9XG5cbiAgQElucHV0KCduZ1N0eWxlJylcbiAgc2V0IG5nU3R5bGUodmFsdWU6IHtba2xhc3M6IHN0cmluZ106IGFueX18bnVsbCkgeyB0aGlzLl9kZWxlZ2F0ZS5zZXROZ1N0eWxlKHZhbHVlKTsgfVxuXG4gIG5nRG9DaGVjaygpIHsgdGhpcy5fZGVsZWdhdGUuYXBwbHlDaGFuZ2VzKCk7IH1cbn1cbiJdfQ==