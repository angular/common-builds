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
        ɵɵallocHostVars(1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsU0FBUyxFQUFXLEtBQUssRUFBZ0IsZUFBZSxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV0SCxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBaUJqRSxNQUFNLE9BQU8sNkJBQTZCLEdBQUcsU0FBUzs7QUFDdEQsTUFBTSxPQUFPLDJCQUEyQixHQUFHLFNBQVM7Ozs7Ozs7QUFNNUMsY0FBWSxDQUFDOzs7Ozs7QUFFTCxVQUFTLEVBQWdCLEVBQUUsR0FBUSxFQUFFLE9BQWU7SUFDaEUsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1FBQzVCLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNwQjtJQUNELElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FDNUI7QUFDSCxDQUFDOztBQVZILE1BQU0sT0FBTyw4QkFBOEIsR0FBRyxpQkFBaUIsQ0FBQztJQUM5RCxJQUFJLEVBQUUseUJBQW9CO0lBQzFCLFNBQVMsRUFBRSxtQkFBQSxJQUFJLEVBQU87SUFDdEIsWUFBWSxNQU9YO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLE9BQU8sNEJBQTRCOzs7QUFBRyxjQUFZLENBQUMsQ0FBQTs7QUFFekQsTUFBTSxPQUFPLG1CQUFtQixHQUFHLDZCQUE2Qjs7QUFDaEUsTUFBTSxPQUFPLGlCQUFpQixHQUFHLDZCQUE2Qjs7Ozs7Ozs7Ozs7Ozs7O0FBZ0I5RCxNQUFNLE9BQU8sV0FBVzs7OztJQUl0QixZQUFzQixTQUFzQjtRQUF0QixjQUFTLEdBQVQsU0FBUyxDQUFhO0lBQUcsQ0FBQzs7OztJQUVoRCxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFMekMsMEJBQWMsR0FBUSxtQkFBbUIsQ0FBQztBQUMxQyxxQkFBUyxHQUFRLGlCQUFpQixDQUFDOzs7SUFEMUMsMkJBQWlEOztJQUNqRCxzQkFBMEM7Ozs7O0lBRTlCLGdDQUFnQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQzlDLE1BQU0sT0FBTyxPQUFRLFNBQVEsV0FBVzs7OztJQUN0QyxZQUFZLFFBQXFCLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFdkQsSUFDSSxPQUFPLENBQUMsS0FBa0MsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFckYsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7WUFQL0MsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDOzs7O1lBcEc1RCxXQUFXOzs7c0JBd0doQixLQUFLLFNBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBJbnB1dCwgybVSZW5kZXJGbGFncywgybXJtWFsbG9jSG9zdFZhcnMsIMm1ybVkZWZpbmVEaXJlY3RpdmUsIMm1ybVzdHlsZU1hcH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdTdHlsZUltcGwsIE5nU3R5bGVJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfc3R5bGVfaW1wbCc7XG5cblxuXG4vKlxuICogTmdTdHlsZSAoYXMgd2VsbCBhcyBOZ0NsYXNzKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nU3R5bGUgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRmFjdG9yeURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5cbi8vIHVzZWQgd2hlbiB0aGUgVkUgaXMgbm90IHByZXNlbnQgKG5vdGUgdGhlIGRpcmVjdGl2ZSB3aWxsXG4vLyBuZXZlciBiZSBpbnN0YW50aWF0ZWQgbm9ybWFsbHkgYmVjYXVzZSBpdCBpcyBhcGFydCBvZiBhXG4vLyBiYXNlIGNsYXNzKVxuZXhwb3J0IGNvbnN0IG5nU3R5bGVEaXJlY3RpdmVEZWZfX1BPU1RfUjNfXyA9IMm1ybVkZWZpbmVEaXJlY3RpdmUoe1xuICB0eXBlOiBmdW5jdGlvbigpIHt9IGFzIGFueSxcbiAgc2VsZWN0b3JzOiBudWxsIGFzIGFueSxcbiAgaG9zdEJpbmRpbmdzOiBmdW5jdGlvbihyZjogybVSZW5kZXJGbGFncywgY3R4OiBhbnksIGVsSW5kZXg6IG51bWJlcikge1xuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuQ3JlYXRlKSB7XG4gICAgICDJtcm1YWxsb2NIb3N0VmFycygxKTtcbiAgICB9XG4gICAgaWYgKHJmICYgybVSZW5kZXJGbGFncy5VcGRhdGUpIHtcbiAgICAgIMm1ybVzdHlsZU1hcChjdHguZ2V0VmFsdWUoKSk7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGNvbnN0IG5nU3R5bGVGYWN0b3J5RGVmX19QT1NUX1IzX18gPSBmdW5jdGlvbigpIHt9O1xuXG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZiA9IG5nU3R5bGVEaXJlY3RpdmVEZWZfX1BSRV9SM19fO1xuZXhwb3J0IGNvbnN0IG5nU3R5bGVGYWN0b3J5RGVmID0gbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5cbi8qKlxuICogU2VydmVzIGFzIHRoZSBiYXNlIG5vbi1WRSBjb250YWluZXIgZm9yIE5nU3R5bGUuXG4gKlxuICogV2hpbGUgdGhpcyBpcyBhIGJhc2UgY2xhc3MgdGhhdCBOZ1N0eWxlIGV4dGVuZHMgZnJvbSwgdGhlXG4gKiBjbGFzcyBpdHNlbGYgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3Igbm9uLVZFIGNvZGUgdG8gc2V0dXBcbiAqIGEgbGluayB0byB0aGUgYFtzdHlsZV1gIGhvc3QgYmluZGluZyAodmlhIHRoZSBzdGF0aWNcbiAqIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkgb24gdGhlIGNsYXNzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkncyBjb2RlIGlzIHN3aXRjaGVkXG4gKiBkZXBlbmRpbmcgaWYgVkUgaXMgcHJlc2VudCBvciBub3QgKHRoaXMgYWxsb3dzIGZvciB0aGVcbiAqIGJpbmRpbmcgY29kZSB0byBiZSBzZXQgb25seSBmb3IgbmV3ZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdTdHlsZUJhc2Uge1xuICBzdGF0aWMgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG5nU3R5bGVEaXJlY3RpdmVEZWY7XG4gIHN0YXRpYyBuZ0ZhY3Rvcnk6IGFueSA9IG5nU3R5bGVGYWN0b3J5RGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nU3R5bGVJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFNldCB0aGUgZm9udCBvZiB0aGUgY29udGFpbmluZyBlbGVtZW50IHRvIHRoZSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGVFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBTZXQgdGhlIHdpZHRoIG9mIHRoZSBjb250YWluaW5nIGVsZW1lbnQgdG8gYSBwaXhlbCB2YWx1ZSByZXR1cm5lZCBieSBhbiBleHByZXNzaW9uLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J21heC13aWR0aC5weCc6IHdpZHRoRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogU2V0IGEgY29sbGVjdGlvbiBvZiBzdHlsZSB2YWx1ZXMgdXNpbmcgYW4gZXhwcmVzc2lvbiB0aGF0IHJldHVybnMga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFuIGF0dHJpYnV0ZSBkaXJlY3RpdmUgdGhhdCB1cGRhdGVzIHN0eWxlcyBmb3IgdGhlIGNvbnRhaW5pbmcgSFRNTCBlbGVtZW50LlxuICogU2V0cyBvbmUgb3IgbW9yZSBzdHlsZSBwcm9wZXJ0aWVzLCBzcGVjaWZpZWQgYXMgY29sb24tc2VwYXJhdGVkIGtleS12YWx1ZSBwYWlycy5cbiAqIFRoZSBrZXkgaXMgYSBzdHlsZSBuYW1lLCB3aXRoIGFuIG9wdGlvbmFsIGAuPHVuaXQ+YCBzdWZmaXhcbiAqIChzdWNoIGFzICd0b3AucHgnLCAnZm9udC1zdHlsZS5lbScpLlxuICogVGhlIHZhbHVlIGlzIGFuIGV4cHJlc3Npb24gdG8gYmUgZXZhbHVhdGVkLlxuICogVGhlIHJlc3VsdGluZyBub24tbnVsbCB2YWx1ZSwgZXhwcmVzc2VkIGluIHRoZSBnaXZlbiB1bml0LFxuICogaXMgYXNzaWduZWQgdG8gdGhlIGdpdmVuIHN0eWxlIHByb3BlcnR5LlxuICogSWYgdGhlIHJlc3VsdCBvZiBldmFsdWF0aW9uIGlzIG51bGwsIHRoZSBjb3JyZXNwb25kaW5nIHN0eWxlIGlzIHJlbW92ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N0eWxlXScsIHByb3ZpZGVyczogW05nU3R5bGVJbXBsUHJvdmlkZXJdfSlcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlIGV4dGVuZHMgTmdTdHlsZUJhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IE5nU3R5bGVJbXBsKSB7IHN1cGVyKGRlbGVnYXRlKTsgfVxuXG4gIEBJbnB1dCgnbmdTdHlsZScpXG4gIHNldCBuZ1N0eWxlKHZhbHVlOiB7W2tsYXNzOiBzdHJpbmddOiBhbnl9fG51bGwpIHsgdGhpcy5fZGVsZWdhdGUuc2V0TmdTdHlsZSh2YWx1ZSk7IH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=