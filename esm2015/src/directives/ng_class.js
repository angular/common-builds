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
import { Directive, Input, ɵɵallocHostVars, ɵɵclassMap, ɵɵdefineDirective, ɵɵstyling, ɵɵstylingApply } from '@angular/core';
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
        ɵɵallocHostVars(1);
        ɵɵstyling();
    }
    if (rf & 2 /* Update */) {
        ɵɵclassMap(ctx.getValue());
        ɵɵstylingApply();
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
 * `ngDirectiveDef` property on the class).
 *
 * Note that the `ngDirectiveDef` property's code is switched
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
/** @nocollapse */ NgClassBase.ngDirectiveDef = ngClassDirectiveDef;
/** @nocollapse */ NgClassBase.ngFactoryDef = ngClassFactoryDef;
if (false) {
    /** @nocollapse @type {?} */
    NgClassBase.ngDirectiveDef;
    /** @nocollapse @type {?} */
    NgClassBase.ngFactoryDef;
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
    constructor(delegate) { super(delegate); }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsU0FBUyxFQUFXLEtBQUssRUFBZ0IsZUFBZSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWpKLE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFpQmpFLE1BQU0sT0FBTyw2QkFBNkIsR0FBRyxTQUFTOzs7Ozs7O0FBTTlDLGNBQVksQ0FBQzs7Ozs7O0FBRUwsVUFBUyxFQUFnQixFQUFFLEdBQVEsRUFBRSxPQUFlO0lBQ2hFLElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsU0FBUyxFQUFFLENBQUM7S0FDYjtJQUNELElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0IsY0FBYyxFQUFFLENBQUM7S0FDbEI7QUFDSCxDQUFDOztBQVpILE1BQU0sT0FBTyw4QkFBOEIsR0FBRyxpQkFBaUIsQ0FBQztJQUM5RCxJQUFJLEVBQUUseUJBQW9CO0lBQzFCLFNBQVMsRUFBRSxtQkFBQSxJQUFJLEVBQU87SUFDdEIsWUFBWSxNQVNYO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLE9BQU8sbUJBQW1CLEdBQUcsNkJBQTZCOztBQUVoRSxNQUFNLE9BQU8sMkJBQTJCLEdBQUcsU0FBUzs7QUFDcEQsTUFBTSxPQUFPLDRCQUE0Qjs7O0FBQUcsY0FBWSxDQUFDLENBQUE7O0FBQ3pELE1BQU0sT0FBTyxpQkFBaUIsR0FBRywyQkFBMkI7Ozs7Ozs7Ozs7Ozs7OztBQWdCNUQsTUFBTSxPQUFPLFdBQVc7Ozs7SUFJdEIsWUFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7Ozs7SUFFaEQsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBTHpDLDBCQUFjLEdBQVEsbUJBQW1CLENBQUM7QUFDMUMsd0JBQVksR0FBUSxpQkFBaUIsQ0FBQzs7O0lBRDdDLDJCQUFpRDs7SUFDakQseUJBQTZDOzs7OztJQUVqQyxnQ0FBZ0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtDOUMsTUFBTSxPQUFPLE9BQVEsU0FBUSxXQUFXOzs7O0lBQ3RDLFlBQVksUUFBcUIsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUV2RCxJQUNJLEtBQUssQ0FBQyxLQUFhLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUU1RCxJQUNJLE9BQU8sQ0FBQyxLQUF5RDtRQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDOzs7O0lBRUQsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7WUFaL0MsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDOzs7O1lBOUY1RCxXQUFXOzs7b0JBa0doQixLQUFLLFNBQUMsT0FBTztzQkFHYixLQUFLLFNBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBJbnB1dCwgybVSZW5kZXJGbGFncywgybXJtWFsbG9jSG9zdFZhcnMsIMm1ybVjbGFzc01hcCwgybXJtWRlZmluZURpcmVjdGl2ZSwgybXJtXN0eWxpbmcsIMm1ybVzdHlsaW5nQXBwbHl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge05nQ2xhc3NJbXBsLCBOZ0NsYXNzSW1wbFByb3ZpZGVyfSBmcm9tICcuL25nX2NsYXNzX2ltcGwnO1xuXG5cblxuLypcbiAqIE5nQ2xhc3MgKGFzIHdlbGwgYXMgTmdTdHlsZSkgYmVoYXZlcyBkaWZmZXJlbnRseSB3aGVuIGxvYWRlZCBpbiB0aGUgVkUgYW5kIHdoZW4gbm90LlxuICpcbiAqIElmIHRoZSBWRSBpcyBwcmVzZW50ICh3aGljaCBpcyBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikgdGhlbiBOZ0NsYXNzIHdpbGwgaW5qZWN0XG4gKiB0aGUgbGVnYWN5IGRpZmZpbmcgYWxnb3JpdGhtIGFzIGEgc2VydmljZSBhbmQgZGVsZWdhdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGF0LlxuICpcbiAqIElmIHRoZSBWRSBpcyBub3QgcHJlc2VudCB0aGVuIE5nU3R5bGUgd2lsbCBub3JtYWxpemUgKHRocm91Z2ggdGhlIGluamVjdGVkIHNlcnZpY2UpIGFuZFxuICogdGhlbiB3cml0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoZSBgW3N0eWxlXWAgYmluZGluZyBkaXJlY3RseSAodGhyb3VnaCBhIGhvc3QgYmluZGluZykuXG4gKiBUaGVuIEFuZ3VsYXIgd2lsbCBub3RpY2UgdGhlIGhvc3QgYmluZGluZyBjaGFuZ2UgYW5kIHRyZWF0IHRoZSBjaGFuZ2VzIGFzIHN0eWxpbmdcbiAqIGNoYW5nZXMgYW5kIGFwcGx5IHRoZW0gdmlhIHRoZSBjb3JlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIHRoYXQgZXhpc3Qgd2l0aGluIEFuZ3VsYXIuXG4gKi9cblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBwcmVzZW50XG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5cbi8vIHVzZWQgd2hlbiB0aGUgVkUgaXMgbm90IHByZXNlbnQgKG5vdGUgdGhlIGRpcmVjdGl2ZSB3aWxsXG4vLyBuZXZlciBiZSBpbnN0YW50aWF0ZWQgbm9ybWFsbHkgYmVjYXVzZSBpdCBpcyBhcGFydCBvZiBhXG4vLyBiYXNlIGNsYXNzKVxuZXhwb3J0IGNvbnN0IG5nQ2xhc3NEaXJlY3RpdmVEZWZfX1BPU1RfUjNfXyA9IMm1ybVkZWZpbmVEaXJlY3RpdmUoe1xuICB0eXBlOiBmdW5jdGlvbigpIHt9IGFzIGFueSxcbiAgc2VsZWN0b3JzOiBudWxsIGFzIGFueSxcbiAgaG9zdEJpbmRpbmdzOiBmdW5jdGlvbihyZjogybVSZW5kZXJGbGFncywgY3R4OiBhbnksIGVsSW5kZXg6IG51bWJlcikge1xuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuQ3JlYXRlKSB7XG4gICAgICDJtcm1YWxsb2NIb3N0VmFycygxKTtcbiAgICAgIMm1ybVzdHlsaW5nKCk7XG4gICAgfVxuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuVXBkYXRlKSB7XG4gICAgICDJtcm1Y2xhc3NNYXAoY3R4LmdldFZhbHVlKCkpO1xuICAgICAgybXJtXN0eWxpbmdBcHBseSgpO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmID0gbmdDbGFzc0RpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5cbmV4cG9ydCBjb25zdCBuZ0NsYXNzRmFjdG9yeURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5leHBvcnQgY29uc3QgbmdDbGFzc0ZhY3RvcnlEZWZfX1BPU1RfUjNfXyA9IGZ1bmN0aW9uKCkge307XG5leHBvcnQgY29uc3QgbmdDbGFzc0ZhY3RvcnlEZWYgPSBuZ0NsYXNzRmFjdG9yeURlZl9fUFJFX1IzX187XG5cbi8qKlxuICogU2VydmVzIGFzIHRoZSBiYXNlIG5vbi1WRSBjb250YWluZXIgZm9yIE5nQ2xhc3MuXG4gKlxuICogV2hpbGUgdGhpcyBpcyBhIGJhc2UgY2xhc3MgdGhhdCBOZ0NsYXNzIGV4dGVuZHMgZnJvbSwgdGhlXG4gKiBjbGFzcyBpdHNlbGYgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3Igbm9uLVZFIGNvZGUgdG8gc2V0dXBcbiAqIGEgbGluayB0byB0aGUgYFtjbGFzc11gIGhvc3QgYmluZGluZyAodmlhIHRoZSBzdGF0aWNcbiAqIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkgb24gdGhlIGNsYXNzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkncyBjb2RlIGlzIHN3aXRjaGVkXG4gKiBkZXBlbmRpbmcgaWYgVkUgaXMgcHJlc2VudCBvciBub3QgKHRoaXMgYWxsb3dzIGZvciB0aGVcbiAqIGJpbmRpbmcgY29kZSB0byBiZSBzZXQgb25seSBmb3IgbmV3ZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdDbGFzc0Jhc2Uge1xuICBzdGF0aWMgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG5nQ2xhc3NEaXJlY3RpdmVEZWY7XG4gIHN0YXRpYyBuZ0ZhY3RvcnlEZWY6IGFueSA9IG5nQ2xhc3NGYWN0b3J5RGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nQ2xhc3NJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nLCBwcm92aWRlcnM6IFtOZ0NsYXNzSW1wbFByb3ZpZGVyXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBleHRlbmRzIE5nQ2xhc3NCYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBOZ0NsYXNzSW1wbCkgeyBzdXBlcihkZWxlZ2F0ZSk7IH1cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fZGVsZWdhdGUuc2V0Q2xhc3ModmFsdWUpOyB9XG5cbiAgQElucHV0KCduZ0NsYXNzJylcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fZGVsZWdhdGUuc2V0TmdDbGFzcyh2YWx1ZSk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=