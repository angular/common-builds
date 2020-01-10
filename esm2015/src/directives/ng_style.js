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
import { Directive, Input, ɵɵdefineDirective, ɵɵstyleMap } from '@angular/core';
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
    if (rf & 2 /* Update */) {
        ɵɵstyleMap(ctx.getValue());
    }
};
/** @type {?} */
export const ngStyleDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: (/** @type {?} */ ((ɵ0))),
    selectors: (/** @type {?} */ (null)),
    hostVars: 2,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFNBQVMsRUFBVyxLQUFLLEVBQWdCLGlCQUFpQixFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVyRyxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBaUJqRSxNQUFNLE9BQU8sNkJBQTZCLEdBQUcsU0FBUzs7QUFDdEQsTUFBTSxPQUFPLDJCQUEyQixHQUFHLFNBQVM7Ozs7Ozs7QUFNNUMsY0FBWSxDQUFDOzs7Ozs7QUFHTCxVQUFTLEVBQWdCLEVBQUUsR0FBUSxFQUFFLE9BQWU7SUFDaEUsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1FBQzVCLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUM1QjtBQUNILENBQUM7O0FBUkgsTUFBTSxPQUFPLDhCQUE4QixHQUFHLGlCQUFpQixDQUFDO0lBQzlELElBQUksRUFBRSx5QkFBb0I7SUFDMUIsU0FBUyxFQUFFLG1CQUFBLElBQUksRUFBTztJQUN0QixRQUFRLEVBQUUsQ0FBQztJQUNYLFlBQVksTUFJWDtDQUNGLENBQUM7O0FBRUYsTUFBTSxPQUFPLDRCQUE0Qjs7O0FBQUcsY0FBWSxDQUFDLENBQUE7O0FBRXpELE1BQU0sT0FBTyxtQkFBbUIsR0FBRyw2QkFBNkI7O0FBQ2hFLE1BQU0sT0FBTyxpQkFBaUIsR0FBRyw2QkFBNkI7Ozs7Ozs7Ozs7Ozs7OztBQWdCOUQsTUFBTSxPQUFPLFdBQVc7Ozs7SUFJdEIsWUFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7Ozs7SUFFaEQsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBTHpDLGdCQUFJLEdBQVEsbUJBQW1CLENBQUM7QUFDaEMsZ0JBQUksR0FBUSxpQkFBaUIsQ0FBQzs7O0lBRHJDLGlCQUF1Qzs7SUFDdkMsaUJBQXFDOzs7OztJQUV6QixnQ0FBZ0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEM5QyxNQUFNLE9BQU8sT0FBUSxTQUFRLFdBQVc7Ozs7SUFDdEMsWUFBWSxRQUFxQjtRQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUFDLENBQUM7Ozs7O0lBRXZELElBQ0ksT0FBTyxDQUFDLEtBQWtDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBRXJGLFNBQVMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQzs7O1lBUC9DLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBQzs7OztZQWxHNUQsV0FBVzs7O3NCQXNHaEIsS0FBSyxTQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSW5wdXQsIMm1UmVuZGVyRmxhZ3MsIMm1ybVkZWZpbmVEaXJlY3RpdmUsIMm1ybVzdHlsZU1hcH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdTdHlsZUltcGwsIE5nU3R5bGVJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfc3R5bGVfaW1wbCc7XG5cblxuXG4vKlxuICogTmdTdHlsZSAoYXMgd2VsbCBhcyBOZ0NsYXNzKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nU3R5bGUgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcbmV4cG9ydCBjb25zdCBuZ1N0eWxlRmFjdG9yeURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5cbi8vIHVzZWQgd2hlbiB0aGUgVkUgaXMgbm90IHByZXNlbnQgKG5vdGUgdGhlIGRpcmVjdGl2ZSB3aWxsXG4vLyBuZXZlciBiZSBpbnN0YW50aWF0ZWQgbm9ybWFsbHkgYmVjYXVzZSBpdCBpcyBhcGFydCBvZiBhXG4vLyBiYXNlIGNsYXNzKVxuZXhwb3J0IGNvbnN0IG5nU3R5bGVEaXJlY3RpdmVEZWZfX1BPU1RfUjNfXyA9IMm1ybVkZWZpbmVEaXJlY3RpdmUoe1xuICB0eXBlOiBmdW5jdGlvbigpIHt9IGFzIGFueSxcbiAgc2VsZWN0b3JzOiBudWxsIGFzIGFueSxcbiAgaG9zdFZhcnM6IDIsXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybXJtXN0eWxlTWFwKGN0eC5nZXRWYWx1ZSgpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWZfX1BPU1RfUjNfXyA9IGZ1bmN0aW9uKCkge307XG5cbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmID0gbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWYgPSBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXztcblxuLyoqXG4gKiBTZXJ2ZXMgYXMgdGhlIGJhc2Ugbm9uLVZFIGNvbnRhaW5lciBmb3IgTmdTdHlsZS5cbiAqXG4gKiBXaGlsZSB0aGlzIGlzIGEgYmFzZSBjbGFzcyB0aGF0IE5nU3R5bGUgZXh0ZW5kcyBmcm9tLCB0aGVcbiAqIGNsYXNzIGl0c2VsZiBhY3RzIGFzIGEgY29udGFpbmVyIGZvciBub24tVkUgY29kZSB0byBzZXR1cFxuICogYSBsaW5rIHRvIHRoZSBgW3N0eWxlXWAgaG9zdCBiaW5kaW5nICh2aWEgdGhlIHN0YXRpY1xuICogYMm1ZGlyYCBwcm9wZXJ0eSBvbiB0aGUgY2xhc3MpLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgYMm1ZGlyYCBwcm9wZXJ0eSdzIGNvZGUgaXMgc3dpdGNoZWRcbiAqIGRlcGVuZGluZyBpZiBWRSBpcyBwcmVzZW50IG9yIG5vdCAodGhpcyBhbGxvd3MgZm9yIHRoZVxuICogYmluZGluZyBjb2RlIHRvIGJlIHNldCBvbmx5IGZvciBuZXdlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1N0eWxlQmFzZSB7XG4gIHN0YXRpYyDJtWRpcjogYW55ID0gbmdTdHlsZURpcmVjdGl2ZURlZjtcbiAgc3RhdGljIMm1ZmFjOiBhbnkgPSBuZ1N0eWxlRmFjdG9yeURlZjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2RlbGVnYXRlOiBOZ1N0eWxlSW1wbCkge31cblxuICBnZXRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLmdldFZhbHVlKCk7IH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBTZXQgdGhlIGZvbnQgb2YgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCB0byB0aGUgcmVzdWx0IG9mIGFuIGV4cHJlc3Npb24uXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogU2V0IHRoZSB3aWR0aCBvZiB0aGUgY29udGFpbmluZyBlbGVtZW50IHRvIGEgcGl4ZWwgdmFsdWUgcmV0dXJuZWQgYnkgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydtYXgtd2lkdGgucHgnOiB3aWR0aEV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFNldCBhIGNvbGxlY3Rpb24gb2Ygc3R5bGUgdmFsdWVzIHVzaW5nIGFuIGV4cHJlc3Npb24gdGhhdCByZXR1cm5zIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwib2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHRoYXQgdXBkYXRlcyBzdHlsZXMgZm9yIHRoZSBjb250YWluaW5nIEhUTUwgZWxlbWVudC5cbiAqIFNldHMgb25lIG9yIG1vcmUgc3R5bGUgcHJvcGVydGllcywgc3BlY2lmaWVkIGFzIGNvbG9uLXNlcGFyYXRlZCBrZXktdmFsdWUgcGFpcnMuXG4gKiBUaGUga2V5IGlzIGEgc3R5bGUgbmFtZSwgd2l0aCBhbiBvcHRpb25hbCBgLjx1bml0PmAgc3VmZml4XG4gKiAoc3VjaCBhcyAndG9wLnB4JywgJ2ZvbnQtc3R5bGUuZW0nKS5cbiAqIFRoZSB2YWx1ZSBpcyBhbiBleHByZXNzaW9uIHRvIGJlIGV2YWx1YXRlZC5cbiAqIFRoZSByZXN1bHRpbmcgbm9uLW51bGwgdmFsdWUsIGV4cHJlc3NlZCBpbiB0aGUgZ2l2ZW4gdW5pdCxcbiAqIGlzIGFzc2lnbmVkIHRvIHRoZSBnaXZlbiBzdHlsZSBwcm9wZXJ0eS5cbiAqIElmIHRoZSByZXN1bHQgb2YgZXZhbHVhdGlvbiBpcyBudWxsLCB0aGUgY29ycmVzcG9uZGluZyBzdHlsZSBpcyByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTdHlsZV0nLCBwcm92aWRlcnM6IFtOZ1N0eWxlSW1wbFByb3ZpZGVyXX0pXG5leHBvcnQgY2xhc3MgTmdTdHlsZSBleHRlbmRzIE5nU3R5bGVCYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBOZ1N0eWxlSW1wbCkgeyBzdXBlcihkZWxlZ2F0ZSk7IH1cblxuICBASW5wdXQoJ25nU3R5bGUnKVxuICBzZXQgbmdTdHlsZSh2YWx1ZToge1trbGFzczogc3RyaW5nXTogYW55fXxudWxsKSB7IHRoaXMuX2RlbGVnYXRlLnNldE5nU3R5bGUodmFsdWUpOyB9XG5cbiAgbmdEb0NoZWNrKCkgeyB0aGlzLl9kZWxlZ2F0ZS5hcHBseUNoYW5nZXMoKTsgfVxufVxuIl19