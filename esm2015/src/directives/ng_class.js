/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/directives/ng_class.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ɵɵallocHostVars, ɵɵclassMap, ɵɵdefineDirective } from '@angular/core';
import { NgClassImpl, NgClassImplProvider } from './ng_class_impl';
/*
 * NgClass (as well as NgStyle) behaves differently when loaded in the VE and when not.
 *
 * If the VE is present (which is for older versions of Angular) then NgClass will inject
 * the legacy diffing algorithm as a service and delegate all styling changes to that.
 *
 * If the VE is not present then NgStyle will normalize (through the injected service) and
 * then write all styling changes to the `[style]` binding directly (through a host binding).
 * Then Angular will notice the host binding change and treat the changes as styling
 * changes and apply them via the core styling instructions that exist within Angular.
 */
// used when the VE is present
/** @type {?} */
export const ngClassDirectiveDef__PRE_R3__ = undefined;
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
        ɵɵclassMap(ctx.getValue());
    }
};
/** @type {?} */
export const ngClassDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: (/** @type {?} */ ((ɵ0))),
    selectors: (/** @type {?} */ (null)),
    hostBindings: (ɵ1)
});
/** @type {?} */
export const ngClassDirectiveDef = ngClassDirectiveDef__PRE_R3__;
/** @type {?} */
export const ngClassFactoryDef__PRE_R3__ = undefined;
/** @type {?} */
export const ngClassFactoryDef__POST_R3__ = (/**
 * @return {?}
 */
function () { });
/** @type {?} */
export const ngClassFactoryDef = ngClassFactoryDef__PRE_R3__;
/**
 * Serves as the base non-VE container for NgClass.
 *
 * While this is a base class that NgClass extends from, the
 * class itself acts as a container for non-VE code to setup
 * a link to the `[class]` host binding (via the static
 * `ɵdir` property on the class).
 *
 * Note that the `ɵdir` property's code is switched
 * depending if VE is present or not (this allows for the
 * binding code to be set only for newer versions of Angular).
 *
 * \@publicApi
 */
export class NgClassBase {
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
/** @nocollapse */ NgClassBase.ɵdir = ngClassDirectiveDef;
/** @nocollapse */ NgClassBase.ɵfac = ngClassFactoryDef;
if (false) {
    /** @nocollapse @type {?} */
    NgClassBase.ɵdir;
    /** @nocollapse @type {?} */
    NgClassBase.ɵfac;
    /**
     * @type {?}
     * @protected
     */
    NgClassBase.prototype._delegate;
}
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * \@description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * \@publicApi
 */
export class NgClass extends NgClassBase {
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
    set klass(value) { this._delegate.setClass(value); }
    /**
     * @param {?} value
     * @return {?}
     */
    set ngClass(value) {
        this._delegate.setNgClass(value);
    }
    /**
     * @return {?}
     */
    ngDoCheck() { this._delegate.applyChanges(); }
}
NgClass.decorators = [
    { type: Directive, args: [{ selector: '[ngClass]', providers: [NgClassImplProvider] },] }
];
/** @nocollapse */
NgClass.ctorParameters = () => [
    { type: NgClassImpl }
];
NgClass.propDecorators = {
    klass: [{ type: Input, args: ['class',] }],
    ngClass: [{ type: Input, args: ['ngClass',] }]
};
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFNBQVMsRUFBVyxLQUFLLEVBQWdCLGVBQWUsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdEgsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7Ozs7Ozs7Ozs7OztBQWlCakUsTUFBTSxPQUFPLDZCQUE2QixHQUFHLFNBQVM7Ozs7Ozs7QUFNOUMsY0FBWSxDQUFDOzs7Ozs7QUFFTCxVQUFTLEVBQWdCLEVBQUUsR0FBUSxFQUFFLE9BQWU7SUFDaEUsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1FBQzVCLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNwQjtJQUNELElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FDNUI7QUFDSCxDQUFDOztBQVZILE1BQU0sT0FBTyw4QkFBOEIsR0FBRyxpQkFBaUIsQ0FBQztJQUM5RCxJQUFJLEVBQUUseUJBQW9CO0lBQzFCLFNBQVMsRUFBRSxtQkFBQSxJQUFJLEVBQU87SUFDdEIsWUFBWSxNQU9YO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLE9BQU8sbUJBQW1CLEdBQUcsNkJBQTZCOztBQUVoRSxNQUFNLE9BQU8sMkJBQTJCLEdBQUcsU0FBUzs7QUFDcEQsTUFBTSxPQUFPLDRCQUE0Qjs7O0FBQUcsY0FBWSxDQUFDLENBQUE7O0FBQ3pELE1BQU0sT0FBTyxpQkFBaUIsR0FBRywyQkFBMkI7Ozs7Ozs7Ozs7Ozs7OztBQWdCNUQsTUFBTSxPQUFPLFdBQVc7Ozs7SUFJdEIsWUFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7Ozs7SUFFaEQsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBTHpDLGdCQUFJLEdBQVEsbUJBQW1CLENBQUM7QUFDaEMsZ0JBQUksR0FBUSxpQkFBaUIsQ0FBQzs7O0lBRHJDLGlCQUF1Qzs7SUFDdkMsaUJBQXFDOzs7OztJQUV6QixnQ0FBZ0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtDOUMsTUFBTSxPQUFPLE9BQVEsU0FBUSxXQUFXOzs7O0lBQ3RDLFlBQVksUUFBcUI7UUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFBQyxDQUFDOzs7OztJQUV2RCxJQUNJLEtBQUssQ0FBQyxLQUFhLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUU1RCxJQUNJLE9BQU8sQ0FBQyxLQUF5RDtRQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDOzs7O0lBRUQsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7WUFaL0MsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDOzs7O1lBNUY1RCxXQUFXOzs7b0JBZ0doQixLQUFLLFNBQUMsT0FBTztzQkFHYixLQUFLLFNBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBJbnB1dCwgybVSZW5kZXJGbGFncywgybXJtWFsbG9jSG9zdFZhcnMsIMm1ybVjbGFzc01hcCwgybXJtWRlZmluZURpcmVjdGl2ZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdDbGFzc0ltcGwsIE5nQ2xhc3NJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfY2xhc3NfaW1wbCc7XG5cblxuXG4vKlxuICogTmdDbGFzcyAoYXMgd2VsbCBhcyBOZ1N0eWxlKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nQ2xhc3Mgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gybXJtWRlZmluZURpcmVjdGl2ZSh7XG4gIHR5cGU6IGZ1bmN0aW9uKCkge30gYXMgYW55LFxuICBzZWxlY3RvcnM6IG51bGwgYXMgYW55LFxuICBob3N0QmluZGluZ3M6IGZ1bmN0aW9uKHJmOiDJtVJlbmRlckZsYWdzLCBjdHg6IGFueSwgZWxJbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKHJmICYgybVSZW5kZXJGbGFncy5DcmVhdGUpIHtcbiAgICAgIMm1ybVhbGxvY0hvc3RWYXJzKDIpO1xuICAgIH1cbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybXJtWNsYXNzTWFwKGN0eC5nZXRWYWx1ZSgpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZiA9IG5nQ2xhc3NEaXJlY3RpdmVEZWZfX1BSRV9SM19fO1xuXG5leHBvcnQgY29uc3QgbmdDbGFzc0ZhY3RvcnlEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuZXhwb3J0IGNvbnN0IG5nQ2xhc3NGYWN0b3J5RGVmX19QT1NUX1IzX18gPSBmdW5jdGlvbigpIHt9O1xuZXhwb3J0IGNvbnN0IG5nQ2xhc3NGYWN0b3J5RGVmID0gbmdDbGFzc0ZhY3RvcnlEZWZfX1BSRV9SM19fO1xuXG4vKipcbiAqIFNlcnZlcyBhcyB0aGUgYmFzZSBub24tVkUgY29udGFpbmVyIGZvciBOZ0NsYXNzLlxuICpcbiAqIFdoaWxlIHRoaXMgaXMgYSBiYXNlIGNsYXNzIHRoYXQgTmdDbGFzcyBleHRlbmRzIGZyb20sIHRoZVxuICogY2xhc3MgaXRzZWxmIGFjdHMgYXMgYSBjb250YWluZXIgZm9yIG5vbi1WRSBjb2RlIHRvIHNldHVwXG4gKiBhIGxpbmsgdG8gdGhlIGBbY2xhc3NdYCBob3N0IGJpbmRpbmcgKHZpYSB0aGUgc3RhdGljXG4gKiBgybVkaXJgIHByb3BlcnR5IG9uIHRoZSBjbGFzcykuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBgybVkaXJgIHByb3BlcnR5J3MgY29kZSBpcyBzd2l0Y2hlZFxuICogZGVwZW5kaW5nIGlmIFZFIGlzIHByZXNlbnQgb3Igbm90ICh0aGlzIGFsbG93cyBmb3IgdGhlXG4gKiBiaW5kaW5nIGNvZGUgdG8gYmUgc2V0IG9ubHkgZm9yIG5ld2VyIHZlcnNpb25zIG9mIEFuZ3VsYXIpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5nQ2xhc3NCYXNlIHtcbiAgc3RhdGljIMm1ZGlyOiBhbnkgPSBuZ0NsYXNzRGlyZWN0aXZlRGVmO1xuICBzdGF0aWMgybVmYWM6IGFueSA9IG5nQ2xhc3NGYWN0b3J5RGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nQ2xhc3NJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nLCBwcm92aWRlcnM6IFtOZ0NsYXNzSW1wbFByb3ZpZGVyXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBleHRlbmRzIE5nQ2xhc3NCYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBOZ0NsYXNzSW1wbCkgeyBzdXBlcihkZWxlZ2F0ZSk7IH1cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fZGVsZWdhdGUuc2V0Q2xhc3ModmFsdWUpOyB9XG5cbiAgQElucHV0KCduZ0NsYXNzJylcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fZGVsZWdhdGUuc2V0TmdDbGFzcyh2YWx1ZSk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=