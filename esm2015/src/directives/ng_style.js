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
import { Directive, Input, ɵɵdefineDirective, ɵɵstyleMap } from '@angular/core';
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
/** @type {?} */
export const ngStyleDirectiveDef__PRE_R3__ = undefined;
/** @type {?} */
export const ngStyleFactoryDef__PRE_R3__ = undefined;
// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
/** @type {?} */
export const ngStyleDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: (/** @type {?} */ ((/**
     * @return {?}
     */
    function () { }))),
    selectors: (/** @type {?} */ (null)),
    hostBindings: (/**
     * @param {?} rf
     * @param {?} ctx
     * @param {?} elIndex
     * @return {?}
     */
    function (rf, ctx, elIndex) {
        if (rf & 2 /* Update */) {
            ɵɵstyleMap(ctx.getValue());
        }
    })
});
/** @type {?} */
export const ngStyleFactoryDef__POST_R3__ = (/**
 * @return {?}
 */
function () { });
/** @type {?} */
export const ngStyleDirectiveDef = ngStyleDirectiveDef__POST_R3__;
/** @type {?} */
export const ngStyleFactoryDef = ngStyleDirectiveDef__POST_R3__;
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
 * \@publicApi
 */
export class NgStyleBase {
    /**
     * @param {?} _delegate
     */
    constructor(_delegate) {
        this._delegate = _delegate;
    }
    /**
     * @return {?}
     */
    getValue() { return this._delegate.getValue(); }
}
/** @nocollapse */ NgStyleBase.ngDirectiveDef = ngStyleDirectiveDef;
NgStyleBase.ngFactory = ngStyleFactoryDef;
if (false) {
    /** @nocollapse @type {?} */
    NgStyleBase.ngDirectiveDef;
    /** @type {?} */
    NgStyleBase.ngFactory;
    /**
     * @type {?}
     * @protected
     */
    NgStyleBase.prototype._delegate;
}
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
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
 * \@description
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
 * \@publicApi
 */
export class NgStyle extends NgStyleBase {
    /**
     * @param {?} delegate
     */
    constructor(delegate) { super(delegate); }
    /**
     * @param {?} value
     * @return {?}
     */
    set ngStyle(value) { this._delegate.setNgStyle(value); }
    /**
     * @return {?}
     */
    ngDoCheck() { this._delegate.applyChanges(); }
}
NgStyle.decorators = [
    { type: Directive, args: [{ selector: '[ngStyle]', providers: [NgStyleImplProvider] },] },
];
/** @nocollapse */
NgStyle.ctorParameters = () => [
    { type: NgStyleImpl }
];
NgStyle.propDecorators = {
    ngStyle: [{ type: Input, args: ['ngStyle',] }]
};
/** @nocollapse */ NgStyle.ngFactoryDef = function NgStyle_Factory(t) { return new (t || NgStyle)(i0.ɵɵdirectiveInject(i1.NgStyleImpl)); };
/** @nocollapse */ NgStyle.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgStyle, selectors: [["", "ngStyle", ""]], inputs: { ngStyle: "ngStyle" }, features: [i0.ɵɵProvidersFeature([NgStyleImplProvider]), i0.ɵɵInheritDefinitionFeature] });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgStyle, [{
        type: Directive,
        args: [{ selector: '[ngStyle]', providers: [NgStyleImplProvider] }]
    }], function () { return [{ type: i1.NgStyleImpl }]; }, { ngStyle: [{
            type: Input,
            args: ['ngStyle']
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsU0FBUyxFQUFXLEtBQUssRUFBZ0IsaUJBQWlCLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXJHLE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCakUsTUFBTSxPQUFPLDZCQUE2QixHQUFHLFNBQVM7O0FBQ3RELE1BQU0sT0FBTywyQkFBMkIsR0FBRyxTQUFTOzs7OztBQUtwRCxNQUFNLE9BQU8sOEJBQThCLEdBQUcsaUJBQWlCLENBQUM7SUFDOUQsSUFBSSxFQUFFOzs7SUFBQSxjQUFZLENBQUMsR0FBTztJQUMxQixTQUFTLEVBQUUsbUJBQUEsSUFBSSxFQUFPO0lBQ3RCLFlBQVk7Ozs7OztJQUFFLFVBQVMsRUFBZ0IsRUFBRSxHQUFRLEVBQUUsT0FBZTtRQUNoRSxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7WUFDNUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQzVCO0lBQ0gsQ0FBQyxDQUFBO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLE9BQU8sNEJBQTRCOzs7QUFBRyxjQUFZLENBQUMsQ0FBQTs7QUFFekQsTUFBTSxPQUFPLG1CQUFtQixHQVpuQiw4QkFZbUQ7O0FBQ2hFLE1BQU0sT0FBTyxpQkFBaUIsR0FiakIsOEJBYWlEOzs7Ozs7Ozs7Ozs7Ozs7QUFnQjlELE1BQU0sT0FBTyxXQUFXOzs7O0lBSXRCLFlBQXNCLFNBQXNCO1FBQXRCLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDOzs7O0lBRWhELFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUx6QywwQkFBYyxHQUFRLG1CQUFtQixDQUFDO0FBQzFDLHFCQUFTLEdBQVEsaUJBQWlCLENBQUM7OztJQUQxQywyQkFBaUQ7O0lBQ2pELHNCQUEwQzs7Ozs7SUFFOUIsZ0NBQWdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBDOUMsTUFBTSxPQUFPLE9BQVEsU0FBUSxXQUFXOzs7O0lBQ3RDLFlBQVksUUFBcUIsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUV2RCxJQUNJLE9BQU8sQ0FBQyxLQUFrQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUVyRixTQUFTLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztZQVAvQyxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUM7Ozs7WUFqRzVELFdBQVc7OztzQkFxR2hCLEtBQUssU0FBQyxTQUFTOztzRUFITCxPQUFPO3NEQUFQLE9BQU8scUdBRDBCLENBQUMsbUJBQW1CLENBQUM7bUNBQ3RELE9BQU87Y0FEbkIsU0FBUztlQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDOztrQkFJakUsS0FBSzttQkFBQyxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIElucHV0LCDJtVJlbmRlckZsYWdzLCDJtcm1ZGVmaW5lRGlyZWN0aXZlLCDJtcm1c3R5bGVNYXB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge05nU3R5bGVJbXBsLCBOZ1N0eWxlSW1wbFByb3ZpZGVyfSBmcm9tICcuL25nX3N0eWxlX2ltcGwnO1xuXG5cblxuLypcbiAqIE5nU3R5bGUgKGFzIHdlbGwgYXMgTmdDbGFzcykgYmVoYXZlcyBkaWZmZXJlbnRseSB3aGVuIGxvYWRlZCBpbiB0aGUgVkUgYW5kIHdoZW4gbm90LlxuICpcbiAqIElmIHRoZSBWRSBpcyBwcmVzZW50ICh3aGljaCBpcyBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikgdGhlbiBOZ1N0eWxlIHdpbGwgaW5qZWN0XG4gKiB0aGUgbGVnYWN5IGRpZmZpbmcgYWxnb3JpdGhtIGFzIGEgc2VydmljZSBhbmQgZGVsZWdhdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGF0LlxuICpcbiAqIElmIHRoZSBWRSBpcyBub3QgcHJlc2VudCB0aGVuIE5nU3R5bGUgd2lsbCBub3JtYWxpemUgKHRocm91Z2ggdGhlIGluamVjdGVkIHNlcnZpY2UpIGFuZFxuICogdGhlbiB3cml0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoZSBgW3N0eWxlXWAgYmluZGluZyBkaXJlY3RseSAodGhyb3VnaCBhIGhvc3QgYmluZGluZykuXG4gKiBUaGVuIEFuZ3VsYXIgd2lsbCBub3RpY2UgdGhlIGhvc3QgYmluZGluZyBjaGFuZ2UgYW5kIHRyZWF0IHRoZSBjaGFuZ2VzIGFzIHN0eWxpbmdcbiAqIGNoYW5nZXMgYW5kIGFwcGx5IHRoZW0gdmlhIHRoZSBjb3JlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIHRoYXQgZXhpc3Qgd2l0aGluIEFuZ3VsYXIuXG4gKi9cblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBwcmVzZW50XG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIG5vdCBwcmVzZW50IChub3RlIHRoZSBkaXJlY3RpdmUgd2lsbFxuLy8gbmV2ZXIgYmUgaW5zdGFudGlhdGVkIG5vcm1hbGx5IGJlY2F1c2UgaXQgaXMgYXBhcnQgb2YgYVxuLy8gYmFzZSBjbGFzcylcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QT1NUX1IzX18gPSDJtcm1ZGVmaW5lRGlyZWN0aXZlKHtcbiAgdHlwZTogZnVuY3Rpb24oKSB7fSBhcyBhbnksXG4gIHNlbGVjdG9yczogbnVsbCBhcyBhbnksXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybXJtXN0eWxlTWFwKGN0eC5nZXRWYWx1ZSgpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWZfX1BPU1RfUjNfXyA9IGZ1bmN0aW9uKCkge307XG5cbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmID0gbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWYgPSBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXztcblxuLyoqXG4gKiBTZXJ2ZXMgYXMgdGhlIGJhc2Ugbm9uLVZFIGNvbnRhaW5lciBmb3IgTmdTdHlsZS5cbiAqXG4gKiBXaGlsZSB0aGlzIGlzIGEgYmFzZSBjbGFzcyB0aGF0IE5nU3R5bGUgZXh0ZW5kcyBmcm9tLCB0aGVcbiAqIGNsYXNzIGl0c2VsZiBhY3RzIGFzIGEgY29udGFpbmVyIGZvciBub24tVkUgY29kZSB0byBzZXR1cFxuICogYSBsaW5rIHRvIHRoZSBgW3N0eWxlXWAgaG9zdCBiaW5kaW5nICh2aWEgdGhlIHN0YXRpY1xuICogYG5nRGlyZWN0aXZlRGVmYCBwcm9wZXJ0eSBvbiB0aGUgY2xhc3MpLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgYG5nRGlyZWN0aXZlRGVmYCBwcm9wZXJ0eSdzIGNvZGUgaXMgc3dpdGNoZWRcbiAqIGRlcGVuZGluZyBpZiBWRSBpcyBwcmVzZW50IG9yIG5vdCAodGhpcyBhbGxvd3MgZm9yIHRoZVxuICogYmluZGluZyBjb2RlIHRvIGJlIHNldCBvbmx5IGZvciBuZXdlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1N0eWxlQmFzZSB7XG4gIHN0YXRpYyBuZ0RpcmVjdGl2ZURlZjogYW55ID0gbmdTdHlsZURpcmVjdGl2ZURlZjtcbiAgc3RhdGljIG5nRmFjdG9yeTogYW55ID0gbmdTdHlsZUZhY3RvcnlEZWY7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9kZWxlZ2F0ZTogTmdTdHlsZUltcGwpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5nZXRWYWx1ZSgpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogU2V0IHRoZSBmb250IG9mIHRoZSBjb250YWluaW5nIGVsZW1lbnQgdG8gdGhlIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZUV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFNldCB0aGUgd2lkdGggb2YgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCB0byBhIHBpeGVsIHZhbHVlIHJldHVybmVkIGJ5IGFuIGV4cHJlc3Npb24uXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnbWF4LXdpZHRoLnB4Jzogd2lkdGhFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBTZXQgYSBjb2xsZWN0aW9uIG9mIHN0eWxlIHZhbHVlcyB1c2luZyBhbiBleHByZXNzaW9uIHRoYXQgcmV0dXJucyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cIm9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYXR0cmlidXRlIGRpcmVjdGl2ZSB0aGF0IHVwZGF0ZXMgc3R5bGVzIGZvciB0aGUgY29udGFpbmluZyBIVE1MIGVsZW1lbnQuXG4gKiBTZXRzIG9uZSBvciBtb3JlIHN0eWxlIHByb3BlcnRpZXMsIHNwZWNpZmllZCBhcyBjb2xvbi1zZXBhcmF0ZWQga2V5LXZhbHVlIHBhaXJzLlxuICogVGhlIGtleSBpcyBhIHN0eWxlIG5hbWUsIHdpdGggYW4gb3B0aW9uYWwgYC48dW5pdD5gIHN1ZmZpeFxuICogKHN1Y2ggYXMgJ3RvcC5weCcsICdmb250LXN0eWxlLmVtJykuXG4gKiBUaGUgdmFsdWUgaXMgYW4gZXhwcmVzc2lvbiB0byBiZSBldmFsdWF0ZWQuXG4gKiBUaGUgcmVzdWx0aW5nIG5vbi1udWxsIHZhbHVlLCBleHByZXNzZWQgaW4gdGhlIGdpdmVuIHVuaXQsXG4gKiBpcyBhc3NpZ25lZCB0byB0aGUgZ2l2ZW4gc3R5bGUgcHJvcGVydHkuXG4gKiBJZiB0aGUgcmVzdWx0IG9mIGV2YWx1YXRpb24gaXMgbnVsbCwgdGhlIGNvcnJlc3BvbmRpbmcgc3R5bGUgaXMgcmVtb3ZlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3R5bGVdJywgcHJvdmlkZXJzOiBbTmdTdHlsZUltcGxQcm92aWRlcl19KVxuZXhwb3J0IGNsYXNzIE5nU3R5bGUgZXh0ZW5kcyBOZ1N0eWxlQmFzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogTmdTdHlsZUltcGwpIHsgc3VwZXIoZGVsZWdhdGUpOyB9XG5cbiAgQElucHV0KCduZ1N0eWxlJylcbiAgc2V0IG5nU3R5bGUodmFsdWU6IHtba2xhc3M6IHN0cmluZ106IGFueX18bnVsbCkgeyB0aGlzLl9kZWxlZ2F0ZS5zZXROZ1N0eWxlKHZhbHVlKTsgfVxuXG4gIG5nRG9DaGVjaygpIHsgdGhpcy5fZGVsZWdhdGUuYXBwbHlDaGFuZ2VzKCk7IH1cbn1cbiJdfQ==