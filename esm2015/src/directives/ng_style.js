/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/directives/ng_style.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ɵɵallocHostVars, ɵɵdefineDirective, ɵɵstyleMap } from '@angular/core';
import { NgStyleImpl, NgStyleImplProvider } from './ng_style_impl';
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
const ɵ0 = /**
 * @return {?}
 */
function () { }, ɵ1 = /**
 * @param {?} rf
 * @param {?} ctx
 * @param {?} elIndex
 * @return {?}
 */
function (rf, ctx, elIndex) {
    if (rf & 1 /* Create */) {
        ɵɵallocHostVars(2);
    }
    if (rf & 2 /* Update */) {
        ɵɵstyleMap(ctx.getValue());
    }
};
/** @type {?} */
export const ngStyleDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: (/** @type {?} */ ((ɵ0))),
    selectors: (/** @type {?} */ (null)),
    hostBindings: (ɵ1)
});
/** @type {?} */
export const ngStyleFactoryDef__POST_R3__ = (/**
 * @return {?}
 */
function () { });
/** @type {?} */
export const ngStyleDirectiveDef = ngStyleDirectiveDef__PRE_R3__;
/** @type {?} */
export const ngStyleFactoryDef = ngStyleDirectiveDef__PRE_R3__;
/**
 * Serves as the base non-VE container for NgStyle.
 *
 * While this is a base class that NgStyle extends from, the
 * class itself acts as a container for non-VE code to setup
 * a link to the `[style]` host binding (via the static
 * `ɵdir` property on the class).
 *
 * Note that the `ɵdir` property's code is switched
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
/** @nocollapse */ NgStyleBase.ɵdir = ngStyleDirectiveDef;
/** @nocollapse */ NgStyleBase.ɵfac = ngStyleFactoryDef;
if (false) {
    /** @nocollapse @type {?} */
    NgStyleBase.ɵdir;
    /** @nocollapse @type {?} */
    NgStyleBase.ɵfac;
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
    constructor(delegate) {
        super(delegate);
    }
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
    { type: Directive, args: [{ selector: '[ngStyle]', providers: [NgStyleImplProvider] },] }
];
/** @nocollapse */
NgStyle.ctorParameters = () => [
    { type: NgStyleImpl }
];
NgStyle.propDecorators = {
    ngStyle: [{ type: Input, args: ['ngStyle',] }]
};
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFNBQVMsRUFBVyxLQUFLLEVBQWdCLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdEgsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7Ozs7Ozs7Ozs7OztBQWlCakUsTUFBTSxPQUFPLDZCQUE2QixHQUFHLFNBQVM7O0FBQ3RELE1BQU0sT0FBTywyQkFBMkIsR0FBRyxTQUFTOzs7Ozs7O0FBTTVDLGNBQVksQ0FBQzs7Ozs7O0FBRUwsVUFBUyxFQUFnQixFQUFFLEdBQVEsRUFBRSxPQUFlO0lBQ2hFLElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEI7SUFDRCxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7UUFDNUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQzVCO0FBQ0gsQ0FBQzs7QUFWSCxNQUFNLE9BQU8sOEJBQThCLEdBQUcsaUJBQWlCLENBQUM7SUFDOUQsSUFBSSxFQUFFLHlCQUFvQjtJQUMxQixTQUFTLEVBQUUsbUJBQUEsSUFBSSxFQUFPO0lBQ3RCLFlBQVksTUFPWDtDQUNGLENBQUM7O0FBRUYsTUFBTSxPQUFPLDRCQUE0Qjs7O0FBQUcsY0FBWSxDQUFDLENBQUE7O0FBRXpELE1BQU0sT0FBTyxtQkFBbUIsR0FBRyw2QkFBNkI7O0FBQ2hFLE1BQU0sT0FBTyxpQkFBaUIsR0FBRyw2QkFBNkI7Ozs7Ozs7Ozs7Ozs7OztBQWdCOUQsTUFBTSxPQUFPLFdBQVc7Ozs7SUFJdEIsWUFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7Ozs7SUFFaEQsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBTHpDLGdCQUFJLEdBQVEsbUJBQW1CLENBQUM7QUFDaEMsZ0JBQUksR0FBUSxpQkFBaUIsQ0FBQzs7O0lBRHJDLGlCQUF1Qzs7SUFDdkMsaUJBQXFDOzs7OztJQUV6QixnQ0FBZ0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEM5QyxNQUFNLE9BQU8sT0FBUSxTQUFRLFdBQVc7Ozs7SUFDdEMsWUFBWSxRQUFxQjtRQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUFDLENBQUM7Ozs7O0lBRXZELElBQ0ksT0FBTyxDQUFDLEtBQWtDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBRXJGLFNBQVMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQzs7O1lBUC9DLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBQzs7OztZQXBHNUQsV0FBVzs7O3NCQXdHaEIsS0FBSyxTQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSW5wdXQsIMm1UmVuZGVyRmxhZ3MsIMm1ybVhbGxvY0hvc3RWYXJzLCDJtcm1ZGVmaW5lRGlyZWN0aXZlLCDJtcm1c3R5bGVNYXB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge05nU3R5bGVJbXBsLCBOZ1N0eWxlSW1wbFByb3ZpZGVyfSBmcm9tICcuL25nX3N0eWxlX2ltcGwnO1xuXG5cblxuLypcbiAqIE5nU3R5bGUgKGFzIHdlbGwgYXMgTmdDbGFzcykgYmVoYXZlcyBkaWZmZXJlbnRseSB3aGVuIGxvYWRlZCBpbiB0aGUgVkUgYW5kIHdoZW4gbm90LlxuICpcbiAqIElmIHRoZSBWRSBpcyBwcmVzZW50ICh3aGljaCBpcyBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikgdGhlbiBOZ1N0eWxlIHdpbGwgaW5qZWN0XG4gKiB0aGUgbGVnYWN5IGRpZmZpbmcgYWxnb3JpdGhtIGFzIGEgc2VydmljZSBhbmQgZGVsZWdhdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGF0LlxuICpcbiAqIElmIHRoZSBWRSBpcyBub3QgcHJlc2VudCB0aGVuIE5nU3R5bGUgd2lsbCBub3JtYWxpemUgKHRocm91Z2ggdGhlIGluamVjdGVkIHNlcnZpY2UpIGFuZFxuICogdGhlbiB3cml0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoZSBgW3N0eWxlXWAgYmluZGluZyBkaXJlY3RseSAodGhyb3VnaCBhIGhvc3QgYmluZGluZykuXG4gKiBUaGVuIEFuZ3VsYXIgd2lsbCBub3RpY2UgdGhlIGhvc3QgYmluZGluZyBjaGFuZ2UgYW5kIHRyZWF0IHRoZSBjaGFuZ2VzIGFzIHN0eWxpbmdcbiAqIGNoYW5nZXMgYW5kIGFwcGx5IHRoZW0gdmlhIHRoZSBjb3JlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIHRoYXQgZXhpc3Qgd2l0aGluIEFuZ3VsYXIuXG4gKi9cblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBwcmVzZW50XG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIG5vdCBwcmVzZW50IChub3RlIHRoZSBkaXJlY3RpdmUgd2lsbFxuLy8gbmV2ZXIgYmUgaW5zdGFudGlhdGVkIG5vcm1hbGx5IGJlY2F1c2UgaXQgaXMgYXBhcnQgb2YgYVxuLy8gYmFzZSBjbGFzcylcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QT1NUX1IzX18gPSDJtcm1ZGVmaW5lRGlyZWN0aXZlKHtcbiAgdHlwZTogZnVuY3Rpb24oKSB7fSBhcyBhbnksXG4gIHNlbGVjdG9yczogbnVsbCBhcyBhbnksXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLkNyZWF0ZSkge1xuICAgICAgybXJtWFsbG9jSG9zdFZhcnMoMik7XG4gICAgfVxuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuVXBkYXRlKSB7XG4gICAgICDJtcm1c3R5bGVNYXAoY3R4LmdldFZhbHVlKCkpO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBuZ1N0eWxlRmFjdG9yeURlZl9fUE9TVF9SM19fID0gZnVuY3Rpb24oKSB7fTtcblxuZXhwb3J0IGNvbnN0IG5nU3R5bGVEaXJlY3RpdmVEZWYgPSBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXztcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRmFjdG9yeURlZiA9IG5nU3R5bGVEaXJlY3RpdmVEZWZfX1BSRV9SM19fO1xuXG4vKipcbiAqIFNlcnZlcyBhcyB0aGUgYmFzZSBub24tVkUgY29udGFpbmVyIGZvciBOZ1N0eWxlLlxuICpcbiAqIFdoaWxlIHRoaXMgaXMgYSBiYXNlIGNsYXNzIHRoYXQgTmdTdHlsZSBleHRlbmRzIGZyb20sIHRoZVxuICogY2xhc3MgaXRzZWxmIGFjdHMgYXMgYSBjb250YWluZXIgZm9yIG5vbi1WRSBjb2RlIHRvIHNldHVwXG4gKiBhIGxpbmsgdG8gdGhlIGBbc3R5bGVdYCBob3N0IGJpbmRpbmcgKHZpYSB0aGUgc3RhdGljXG4gKiBgybVkaXJgIHByb3BlcnR5IG9uIHRoZSBjbGFzcykuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBgybVkaXJgIHByb3BlcnR5J3MgY29kZSBpcyBzd2l0Y2hlZFxuICogZGVwZW5kaW5nIGlmIFZFIGlzIHByZXNlbnQgb3Igbm90ICh0aGlzIGFsbG93cyBmb3IgdGhlXG4gKiBiaW5kaW5nIGNvZGUgdG8gYmUgc2V0IG9ubHkgZm9yIG5ld2VyIHZlcnNpb25zIG9mIEFuZ3VsYXIpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5nU3R5bGVCYXNlIHtcbiAgc3RhdGljIMm1ZGlyOiBhbnkgPSBuZ1N0eWxlRGlyZWN0aXZlRGVmO1xuICBzdGF0aWMgybVmYWM6IGFueSA9IG5nU3R5bGVGYWN0b3J5RGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nU3R5bGVJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFNldCB0aGUgZm9udCBvZiB0aGUgY29udGFpbmluZyBlbGVtZW50IHRvIHRoZSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGVFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBTZXQgdGhlIHdpZHRoIG9mIHRoZSBjb250YWluaW5nIGVsZW1lbnQgdG8gYSBwaXhlbCB2YWx1ZSByZXR1cm5lZCBieSBhbiBleHByZXNzaW9uLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J21heC13aWR0aC5weCc6IHdpZHRoRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogU2V0IGEgY29sbGVjdGlvbiBvZiBzdHlsZSB2YWx1ZXMgdXNpbmcgYW4gZXhwcmVzc2lvbiB0aGF0IHJldHVybnMga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFuIGF0dHJpYnV0ZSBkaXJlY3RpdmUgdGhhdCB1cGRhdGVzIHN0eWxlcyBmb3IgdGhlIGNvbnRhaW5pbmcgSFRNTCBlbGVtZW50LlxuICogU2V0cyBvbmUgb3IgbW9yZSBzdHlsZSBwcm9wZXJ0aWVzLCBzcGVjaWZpZWQgYXMgY29sb24tc2VwYXJhdGVkIGtleS12YWx1ZSBwYWlycy5cbiAqIFRoZSBrZXkgaXMgYSBzdHlsZSBuYW1lLCB3aXRoIGFuIG9wdGlvbmFsIGAuPHVuaXQ+YCBzdWZmaXhcbiAqIChzdWNoIGFzICd0b3AucHgnLCAnZm9udC1zdHlsZS5lbScpLlxuICogVGhlIHZhbHVlIGlzIGFuIGV4cHJlc3Npb24gdG8gYmUgZXZhbHVhdGVkLlxuICogVGhlIHJlc3VsdGluZyBub24tbnVsbCB2YWx1ZSwgZXhwcmVzc2VkIGluIHRoZSBnaXZlbiB1bml0LFxuICogaXMgYXNzaWduZWQgdG8gdGhlIGdpdmVuIHN0eWxlIHByb3BlcnR5LlxuICogSWYgdGhlIHJlc3VsdCBvZiBldmFsdWF0aW9uIGlzIG51bGwsIHRoZSBjb3JyZXNwb25kaW5nIHN0eWxlIGlzIHJlbW92ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N0eWxlXScsIHByb3ZpZGVyczogW05nU3R5bGVJbXBsUHJvdmlkZXJdfSlcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlIGV4dGVuZHMgTmdTdHlsZUJhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IE5nU3R5bGVJbXBsKSB7IHN1cGVyKGRlbGVnYXRlKTsgfVxuXG4gIEBJbnB1dCgnbmdTdHlsZScpXG4gIHNldCBuZ1N0eWxlKHZhbHVlOiB7W2tsYXNzOiBzdHJpbmddOiBhbnl9fG51bGwpIHsgdGhpcy5fZGVsZWdhdGUuc2V0TmdTdHlsZSh2YWx1ZSk7IH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=