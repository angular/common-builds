/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ΔclassMap, ΔdefineDirective, Δstyling, ΔstylingApply } from '@angular/core';
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
export const ngClassDirectiveDef__POST_R3__ = ΔdefineDirective({
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
            Δstyling();
        }
        if (rf & 2 /* Update */) {
            ΔclassMap(ctx.getValue());
            ΔstylingApply();
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
/** @nocollapse */ NgClass.ngDirectiveDef = i0.ΔdefineDirective({ type: NgClass, selectors: [["", "ngClass", ""]], factory: function NgClass_Factory(t) { return new (t || NgClass)(i0.ΔdirectiveInject(i1.NgClassImpl)); }, inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, features: [i0.ΔProvidersFeature([NgClassImplProvider]), i0.ΔInheritDefinitionFeature] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsU0FBUyxFQUFXLEtBQUssRUFBZ0IsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUgsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FBaUJqRSxNQUFNLE9BQU8sNkJBQTZCLEdBQUcsU0FBUzs7Ozs7QUFLdEQsTUFBTSxPQUFPLDhCQUE4QixHQUFHLGdCQUFnQixDQUFDO0lBQzdELElBQUksRUFBRTs7O0lBQUEsY0FBWSxDQUFDLEdBQU87SUFDMUIsU0FBUyxFQUFFLG1CQUFBLElBQUksRUFBTztJQUN0QixPQUFPOzs7SUFBRSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUE7SUFDakIsWUFBWTs7Ozs7O0lBQUUsVUFBUyxFQUFnQixFQUFFLEdBQVEsRUFBRSxPQUFlO1FBQ2hFLElBQUksRUFBRSxpQkFBc0IsRUFBRTtZQUM1QixRQUFRLEVBQUUsQ0FBQztTQUNaO1FBQ0QsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1lBQzVCLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMxQixhQUFhLEVBQUUsQ0FBQztTQUNqQjtJQUNILENBQUMsQ0FBQTtDQUNGLENBQUM7O0FBRUYsTUFBTSxPQUFPLG1CQUFtQixHQWZuQiw4QkFlbUQ7Ozs7Ozs7Ozs7Ozs7OztBQWdCaEUsTUFBTSxPQUFPLFdBQVc7Ozs7SUFHdEIsWUFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7Ozs7SUFFaEQsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBSnpDLDBCQUFjLEdBQVEsbUJBQW1CLENBQUM7OztJQUFqRCwyQkFBaUQ7Ozs7O0lBRXJDLGdDQUFnQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0M5QyxNQUFNLE9BQU8sT0FBUSxTQUFRLFdBQVc7Ozs7SUFDdEMsWUFBWSxRQUFxQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRXZELElBQ0ksS0FBSyxDQUFDLEtBQWEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRTVELElBQ0ksT0FBTyxDQUFDLEtBQXlEO1FBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7Ozs7SUFFRCxTQUFTLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztZQVovQyxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUM7Ozs7WUF6RjVELFdBQVc7OztvQkE2RmhCLEtBQUssU0FBQyxPQUFPO3NCQUdiLEtBQUssU0FBQyxTQUFTOztxREFOTCxPQUFPLDRGQUFQLE9BQU8sc0lBRDBCLENBQUMsbUJBQW1CLENBQUM7bUNBQ3RELE9BQU87Y0FEbkIsU0FBUztlQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDOztrQkFJakUsS0FBSzttQkFBQyxPQUFPOztrQkFHYixLQUFLO21CQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSW5wdXQsIMm1UmVuZGVyRmxhZ3MsIM6UY2xhc3NNYXAsIM6UZGVmaW5lRGlyZWN0aXZlLCDOlHN0eWxpbmcsIM6Uc3R5bGluZ0FwcGx5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtOZ0NsYXNzSW1wbCwgTmdDbGFzc0ltcGxQcm92aWRlcn0gZnJvbSAnLi9uZ19jbGFzc19pbXBsJztcblxuXG5cbi8qXG4gKiBOZ0NsYXNzIChhcyB3ZWxsIGFzIE5nU3R5bGUpIGJlaGF2ZXMgZGlmZmVyZW50bHkgd2hlbiBsb2FkZWQgaW4gdGhlIFZFIGFuZCB3aGVuIG5vdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgcHJlc2VudCAod2hpY2ggaXMgZm9yIG9sZGVyIHZlcnNpb25zIG9mIEFuZ3VsYXIpIHRoZW4gTmdDbGFzcyB3aWxsIGluamVjdFxuICogdGhlIGxlZ2FjeSBkaWZmaW5nIGFsZ29yaXRobSBhcyBhIHNlcnZpY2UgYW5kIGRlbGVnYXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhhdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgbm90IHByZXNlbnQgdGhlbiBOZ1N0eWxlIHdpbGwgbm9ybWFsaXplICh0aHJvdWdoIHRoZSBpbmplY3RlZCBzZXJ2aWNlKSBhbmRcbiAqIHRoZW4gd3JpdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGUgYFtzdHlsZV1gIGJpbmRpbmcgZGlyZWN0bHkgKHRocm91Z2ggYSBob3N0IGJpbmRpbmcpLlxuICogVGhlbiBBbmd1bGFyIHdpbGwgbm90aWNlIHRoZSBob3N0IGJpbmRpbmcgY2hhbmdlIGFuZCB0cmVhdCB0aGUgY2hhbmdlcyBhcyBzdHlsaW5nXG4gKiBjaGFuZ2VzIGFuZCBhcHBseSB0aGVtIHZpYSB0aGUgY29yZSBzdHlsaW5nIGluc3RydWN0aW9ucyB0aGF0IGV4aXN0IHdpdGhpbiBBbmd1bGFyLlxuICovXG5cbi8vIHVzZWQgd2hlbiB0aGUgVkUgaXMgcHJlc2VudFxuZXhwb3J0IGNvbnN0IG5nQ2xhc3NEaXJlY3RpdmVEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIG5vdCBwcmVzZW50IChub3RlIHRoZSBkaXJlY3RpdmUgd2lsbFxuLy8gbmV2ZXIgYmUgaW5zdGFudGlhdGVkIG5vcm1hbGx5IGJlY2F1c2UgaXQgaXMgYXBhcnQgb2YgYVxuLy8gYmFzZSBjbGFzcylcbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QT1NUX1IzX18gPSDOlGRlZmluZURpcmVjdGl2ZSh7XG4gIHR5cGU6IGZ1bmN0aW9uKCkge30gYXMgYW55LFxuICBzZWxlY3RvcnM6IG51bGwgYXMgYW55LFxuICBmYWN0b3J5OiAoKSA9PiB7fSxcbiAgaG9zdEJpbmRpbmdzOiBmdW5jdGlvbihyZjogybVSZW5kZXJGbGFncywgY3R4OiBhbnksIGVsSW5kZXg6IG51bWJlcikge1xuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuQ3JlYXRlKSB7XG4gICAgICDOlHN0eWxpbmcoKTtcbiAgICB9XG4gICAgaWYgKHJmICYgybVSZW5kZXJGbGFncy5VcGRhdGUpIHtcbiAgICAgIM6UY2xhc3NNYXAoY3R4LmdldFZhbHVlKCkpO1xuICAgICAgzpRzdHlsaW5nQXBwbHkoKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZiA9IG5nQ2xhc3NEaXJlY3RpdmVEZWZfX1BSRV9SM19fO1xuXG4vKipcbiAqIFNlcnZlcyBhcyB0aGUgYmFzZSBub24tVkUgY29udGFpbmVyIGZvciBOZ0NsYXNzLlxuICpcbiAqIFdoaWxlIHRoaXMgaXMgYSBiYXNlIGNsYXNzIHRoYXQgTmdDbGFzcyBleHRlbmRzIGZyb20sIHRoZVxuICogY2xhc3MgaXRzZWxmIGFjdHMgYXMgYSBjb250YWluZXIgZm9yIG5vbi1WRSBjb2RlIHRvIHNldHVwXG4gKiBhIGxpbmsgdG8gdGhlIGBbY2xhc3NdYCBob3N0IGJpbmRpbmcgKHZpYSB0aGUgc3RhdGljXG4gKiBgbmdEaXJlY3RpdmVEZWZgIHByb3BlcnR5IG9uIHRoZSBjbGFzcykuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBgbmdEaXJlY3RpdmVEZWZgIHByb3BlcnR5J3MgY29kZSBpcyBzd2l0Y2hlZFxuICogZGVwZW5kaW5nIGlmIFZFIGlzIHByZXNlbnQgb3Igbm90ICh0aGlzIGFsbG93cyBmb3IgdGhlXG4gKiBiaW5kaW5nIGNvZGUgdG8gYmUgc2V0IG9ubHkgZm9yIG5ld2VyIHZlcnNpb25zIG9mIEFuZ3VsYXIpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5nQ2xhc3NCYXNlIHtcbiAgc3RhdGljIG5nRGlyZWN0aXZlRGVmOiBhbnkgPSBuZ0NsYXNzRGlyZWN0aXZlRGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nQ2xhc3NJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nLCBwcm92aWRlcnM6IFtOZ0NsYXNzSW1wbFByb3ZpZGVyXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBleHRlbmRzIE5nQ2xhc3NCYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBOZ0NsYXNzSW1wbCkgeyBzdXBlcihkZWxlZ2F0ZSk7IH1cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fZGVsZWdhdGUuc2V0Q2xhc3ModmFsdWUpOyB9XG5cbiAgQElucHV0KCduZ0NsYXNzJylcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fZGVsZWdhdGUuc2V0TmdDbGFzcyh2YWx1ZSk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=