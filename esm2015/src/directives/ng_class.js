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
import * as i0 from "@angular/core";
import * as i1 from "./ng_class_impl";
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
/** @type {?} */
export const ngClassDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: (/** @type {?} */ ((/**
     * @return {?}
     */
    function () { }))),
    selectors: (/** @type {?} */ (null)),
    factory: (/**
     * @return {?}
     */
    () => { }),
    hostBindings: (/**
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
    })
});
/** @type {?} */
export const ngClassDirectiveDef = ngClassDirectiveDef__POST_R3__;
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
if (false) {
    /** @nocollapse @type {?} */
    NgClassBase.ngDirectiveDef;
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
    { type: Directive, args: [{ selector: '[ngClass]', providers: [NgClassImplProvider] },] },
];
/** @nocollapse */
NgClass.ctorParameters = () => [
    { type: NgClassImpl }
];
NgClass.propDecorators = {
    klass: [{ type: Input, args: ['class',] }],
    ngClass: [{ type: Input, args: ['ngClass',] }]
};
/** @nocollapse */ NgClass.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgClass, selectors: [["", "ngClass", ""]], factory: function NgClass_Factory(t) { return new (t || NgClass)(i0.ɵɵdirectiveInject(i1.NgClassImpl)); }, inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, features: [i0.ɵɵProvidersFeature([NgClassImplProvider]), i0.ɵɵInheritDefinitionFeature] });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgClass, [{
        type: Directive,
        args: [{ selector: '[ngClass]', providers: [NgClassImplProvider] }]
    }], function () { return [{ type: i1.NgClassImpl }]; }, { klass: [{
            type: Input,
            args: ['class']
        }], ngClass: [{
            type: Input,
            args: ['ngClass']
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsU0FBUyxFQUFXLEtBQUssRUFBZ0IsZUFBZSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWpKLE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCakUsTUFBTSxPQUFPLDZCQUE2QixHQUFHLFNBQVM7Ozs7O0FBS3RELE1BQU0sT0FBTyw4QkFBOEIsR0FBRyxpQkFBaUIsQ0FBQztJQUM5RCxJQUFJLEVBQUU7OztJQUFBLGNBQVksQ0FBQyxHQUFPO0lBQzFCLFNBQVMsRUFBRSxtQkFBQSxJQUFJLEVBQU87SUFDdEIsT0FBTzs7O0lBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFBO0lBQ2pCLFlBQVk7Ozs7OztJQUFFLFVBQVMsRUFBZ0IsRUFBRSxHQUFRLEVBQUUsT0FBZTtRQUNoRSxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7WUFDNUIsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLFNBQVMsRUFBRSxDQUFDO1NBQ2I7UUFDRCxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7WUFDNUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLGNBQWMsRUFBRSxDQUFDO1NBQ2xCO0lBQ0gsQ0FBQyxDQUFBO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLE9BQU8sbUJBQW1CLEdBaEJuQiw4QkFnQm1EOzs7Ozs7Ozs7Ozs7Ozs7QUFnQmhFLE1BQU0sT0FBTyxXQUFXOzs7O0lBR3RCLFlBQXNCLFNBQXNCO1FBQXRCLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDOzs7O0lBRWhELFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUp6QywwQkFBYyxHQUFRLG1CQUFtQixDQUFDOzs7SUFBakQsMkJBQWlEOzs7OztJQUVyQyxnQ0FBZ0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtDOUMsTUFBTSxPQUFPLE9BQVEsU0FBUSxXQUFXOzs7O0lBQ3RDLFlBQVksUUFBcUIsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUV2RCxJQUNJLEtBQUssQ0FBQyxLQUFhLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUU1RCxJQUNJLE9BQU8sQ0FBQyxLQUF5RDtRQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDOzs7O0lBRUQsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7WUFaL0MsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDOzs7O1lBMUY1RCxXQUFXOzs7b0JBOEZoQixLQUFLLFNBQUMsT0FBTztzQkFHYixLQUFLLFNBQUMsU0FBUzs7c0RBTkwsT0FBTyw0RkFBUCxPQUFPLHdJQUQwQixDQUFDLG1CQUFtQixDQUFDO21DQUN0RCxPQUFPO2NBRG5CLFNBQVM7ZUFBQyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBQzs7a0JBSWpFLEtBQUs7bUJBQUMsT0FBTzs7a0JBR2IsS0FBSzttQkFBQyxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIElucHV0LCDJtVJlbmRlckZsYWdzLCDJtcm1YWxsb2NIb3N0VmFycywgybXJtWNsYXNzTWFwLCDJtcm1ZGVmaW5lRGlyZWN0aXZlLCDJtcm1c3R5bGluZywgybXJtXN0eWxpbmdBcHBseX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdDbGFzc0ltcGwsIE5nQ2xhc3NJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfY2xhc3NfaW1wbCc7XG5cblxuXG4vKlxuICogTmdDbGFzcyAoYXMgd2VsbCBhcyBOZ1N0eWxlKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nQ2xhc3Mgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gybXJtWRlZmluZURpcmVjdGl2ZSh7XG4gIHR5cGU6IGZ1bmN0aW9uKCkge30gYXMgYW55LFxuICBzZWxlY3RvcnM6IG51bGwgYXMgYW55LFxuICBmYWN0b3J5OiAoKSA9PiB7fSxcbiAgaG9zdEJpbmRpbmdzOiBmdW5jdGlvbihyZjogybVSZW5kZXJGbGFncywgY3R4OiBhbnksIGVsSW5kZXg6IG51bWJlcikge1xuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuQ3JlYXRlKSB7XG4gICAgICDJtcm1YWxsb2NIb3N0VmFycygxKTtcbiAgICAgIMm1ybVzdHlsaW5nKCk7XG4gICAgfVxuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuVXBkYXRlKSB7XG4gICAgICDJtcm1Y2xhc3NNYXAoY3R4LmdldFZhbHVlKCkpO1xuICAgICAgybXJtXN0eWxpbmdBcHBseSgpO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmID0gbmdDbGFzc0RpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5cbi8qKlxuICogU2VydmVzIGFzIHRoZSBiYXNlIG5vbi1WRSBjb250YWluZXIgZm9yIE5nQ2xhc3MuXG4gKlxuICogV2hpbGUgdGhpcyBpcyBhIGJhc2UgY2xhc3MgdGhhdCBOZ0NsYXNzIGV4dGVuZHMgZnJvbSwgdGhlXG4gKiBjbGFzcyBpdHNlbGYgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3Igbm9uLVZFIGNvZGUgdG8gc2V0dXBcbiAqIGEgbGluayB0byB0aGUgYFtjbGFzc11gIGhvc3QgYmluZGluZyAodmlhIHRoZSBzdGF0aWNcbiAqIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkgb24gdGhlIGNsYXNzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkncyBjb2RlIGlzIHN3aXRjaGVkXG4gKiBkZXBlbmRpbmcgaWYgVkUgaXMgcHJlc2VudCBvciBub3QgKHRoaXMgYWxsb3dzIGZvciB0aGVcbiAqIGJpbmRpbmcgY29kZSB0byBiZSBzZXQgb25seSBmb3IgbmV3ZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdDbGFzc0Jhc2Uge1xuICBzdGF0aWMgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG5nQ2xhc3NEaXJlY3RpdmVEZWY7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9kZWxlZ2F0ZTogTmdDbGFzc0ltcGwpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5nZXRWYWx1ZSgpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIidmaXJzdCBzZWNvbmQnXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwiWydmaXJzdCcsICdzZWNvbmQnXVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInsnZmlyc3QnOiB0cnVlLCAnc2Vjb25kJzogdHJ1ZSwgJ3RoaXJkJzogZmFsc2V9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwic3RyaW5nRXhwfGFycmF5RXhwfG9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInsnY2xhc3MxIGNsYXNzMiBjbGFzczMnIDogdHJ1ZX1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFkZHMgYW5kIHJlbW92ZXMgQ1NTIGNsYXNzZXMgb24gYW4gSFRNTCBlbGVtZW50LlxuICpcbiAqIFRoZSBDU1MgY2xhc3NlcyBhcmUgdXBkYXRlZCBhcyBmb2xsb3dzLCBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdGhlIGV4cHJlc3Npb24gZXZhbHVhdGlvbjpcbiAqIC0gYHN0cmluZ2AgLSB0aGUgQ1NTIGNsYXNzZXMgbGlzdGVkIGluIHRoZSBzdHJpbmcgKHNwYWNlIGRlbGltaXRlZCkgYXJlIGFkZGVkLFxuICogLSBgQXJyYXlgIC0gdGhlIENTUyBjbGFzc2VzIGRlY2xhcmVkIGFzIEFycmF5IGVsZW1lbnRzIGFyZSBhZGRlZCxcbiAqIC0gYE9iamVjdGAgLSBrZXlzIGFyZSBDU1MgY2xhc3NlcyB0aGF0IGdldCBhZGRlZCB3aGVuIHRoZSBleHByZXNzaW9uIGdpdmVuIGluIHRoZSB2YWx1ZVxuICogICAgICAgICAgICAgIGV2YWx1YXRlcyB0byBhIHRydXRoeSB2YWx1ZSwgb3RoZXJ3aXNlIHRoZXkgYXJlIHJlbW92ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0NsYXNzXScsIHByb3ZpZGVyczogW05nQ2xhc3NJbXBsUHJvdmlkZXJdfSlcbmV4cG9ydCBjbGFzcyBOZ0NsYXNzIGV4dGVuZHMgTmdDbGFzc0Jhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IE5nQ2xhc3NJbXBsKSB7IHN1cGVyKGRlbGVnYXRlKTsgfVxuXG4gIEBJbnB1dCgnY2xhc3MnKVxuICBzZXQga2xhc3ModmFsdWU6IHN0cmluZykgeyB0aGlzLl9kZWxlZ2F0ZS5zZXRDbGFzcyh2YWx1ZSk7IH1cblxuICBASW5wdXQoJ25nQ2xhc3MnKVxuICBzZXQgbmdDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5zZXROZ0NsYXNzKHZhbHVlKTtcbiAgfVxuXG4gIG5nRG9DaGVjaygpIHsgdGhpcy5fZGVsZWdhdGUuYXBwbHlDaGFuZ2VzKCk7IH1cbn1cbiJdfQ==