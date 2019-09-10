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
        ɵɵallocHostVars(1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsU0FBUyxFQUFXLEtBQUssRUFBZ0IsZUFBZSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV0SCxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBaUJqRSxNQUFNLE9BQU8sNkJBQTZCLEdBQUcsU0FBUzs7Ozs7OztBQU05QyxjQUFZLENBQUM7Ozs7OztBQUVMLFVBQVMsRUFBZ0IsRUFBRSxHQUFRLEVBQUUsT0FBZTtJQUNoRSxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7UUFDNUIsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BCO0lBQ0QsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1FBQzVCLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUM1QjtBQUNILENBQUM7O0FBVkgsTUFBTSxPQUFPLDhCQUE4QixHQUFHLGlCQUFpQixDQUFDO0lBQzlELElBQUksRUFBRSx5QkFBb0I7SUFDMUIsU0FBUyxFQUFFLG1CQUFBLElBQUksRUFBTztJQUN0QixZQUFZLE1BT1g7Q0FDRixDQUFDOztBQUVGLE1BQU0sT0FBTyxtQkFBbUIsR0FBRyw2QkFBNkI7O0FBRWhFLE1BQU0sT0FBTywyQkFBMkIsR0FBRyxTQUFTOztBQUNwRCxNQUFNLE9BQU8sNEJBQTRCOzs7QUFBRyxjQUFZLENBQUMsQ0FBQTs7QUFDekQsTUFBTSxPQUFPLGlCQUFpQixHQUFHLDJCQUEyQjs7Ozs7Ozs7Ozs7Ozs7O0FBZ0I1RCxNQUFNLE9BQU8sV0FBVzs7OztJQUl0QixZQUFzQixTQUFzQjtRQUF0QixjQUFTLEdBQVQsU0FBUyxDQUFhO0lBQUcsQ0FBQzs7OztJQUVoRCxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFMekMsMEJBQWMsR0FBUSxtQkFBbUIsQ0FBQztBQUMxQyx3QkFBWSxHQUFRLGlCQUFpQixDQUFDOzs7SUFEN0MsMkJBQWlEOztJQUNqRCx5QkFBNkM7Ozs7O0lBRWpDLGdDQUFnQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0M5QyxNQUFNLE9BQU8sT0FBUSxTQUFRLFdBQVc7Ozs7SUFDdEMsWUFBWSxRQUFxQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRXZELElBQ0ksS0FBSyxDQUFDLEtBQWEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRTVELElBQ0ksT0FBTyxDQUFDLEtBQXlEO1FBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7Ozs7SUFFRCxTQUFTLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztZQVovQyxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUM7Ozs7WUE1RjVELFdBQVc7OztvQkFnR2hCLEtBQUssU0FBQyxPQUFPO3NCQUdiLEtBQUssU0FBQyxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIElucHV0LCDJtVJlbmRlckZsYWdzLCDJtcm1YWxsb2NIb3N0VmFycywgybXJtWNsYXNzTWFwLCDJtcm1ZGVmaW5lRGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtOZ0NsYXNzSW1wbCwgTmdDbGFzc0ltcGxQcm92aWRlcn0gZnJvbSAnLi9uZ19jbGFzc19pbXBsJztcblxuXG5cbi8qXG4gKiBOZ0NsYXNzIChhcyB3ZWxsIGFzIE5nU3R5bGUpIGJlaGF2ZXMgZGlmZmVyZW50bHkgd2hlbiBsb2FkZWQgaW4gdGhlIFZFIGFuZCB3aGVuIG5vdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgcHJlc2VudCAod2hpY2ggaXMgZm9yIG9sZGVyIHZlcnNpb25zIG9mIEFuZ3VsYXIpIHRoZW4gTmdDbGFzcyB3aWxsIGluamVjdFxuICogdGhlIGxlZ2FjeSBkaWZmaW5nIGFsZ29yaXRobSBhcyBhIHNlcnZpY2UgYW5kIGRlbGVnYXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhhdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgbm90IHByZXNlbnQgdGhlbiBOZ1N0eWxlIHdpbGwgbm9ybWFsaXplICh0aHJvdWdoIHRoZSBpbmplY3RlZCBzZXJ2aWNlKSBhbmRcbiAqIHRoZW4gd3JpdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGUgYFtzdHlsZV1gIGJpbmRpbmcgZGlyZWN0bHkgKHRocm91Z2ggYSBob3N0IGJpbmRpbmcpLlxuICogVGhlbiBBbmd1bGFyIHdpbGwgbm90aWNlIHRoZSBob3N0IGJpbmRpbmcgY2hhbmdlIGFuZCB0cmVhdCB0aGUgY2hhbmdlcyBhcyBzdHlsaW5nXG4gKiBjaGFuZ2VzIGFuZCBhcHBseSB0aGVtIHZpYSB0aGUgY29yZSBzdHlsaW5nIGluc3RydWN0aW9ucyB0aGF0IGV4aXN0IHdpdGhpbiBBbmd1bGFyLlxuICovXG5cbi8vIHVzZWQgd2hlbiB0aGUgVkUgaXMgcHJlc2VudFxuZXhwb3J0IGNvbnN0IG5nQ2xhc3NEaXJlY3RpdmVEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIG5vdCBwcmVzZW50IChub3RlIHRoZSBkaXJlY3RpdmUgd2lsbFxuLy8gbmV2ZXIgYmUgaW5zdGFudGlhdGVkIG5vcm1hbGx5IGJlY2F1c2UgaXQgaXMgYXBhcnQgb2YgYVxuLy8gYmFzZSBjbGFzcylcbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QT1NUX1IzX18gPSDJtcm1ZGVmaW5lRGlyZWN0aXZlKHtcbiAgdHlwZTogZnVuY3Rpb24oKSB7fSBhcyBhbnksXG4gIHNlbGVjdG9yczogbnVsbCBhcyBhbnksXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLkNyZWF0ZSkge1xuICAgICAgybXJtWFsbG9jSG9zdFZhcnMoMSk7XG4gICAgfVxuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuVXBkYXRlKSB7XG4gICAgICDJtcm1Y2xhc3NNYXAoY3R4LmdldFZhbHVlKCkpO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmID0gbmdDbGFzc0RpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5cbmV4cG9ydCBjb25zdCBuZ0NsYXNzRmFjdG9yeURlZl9fUFJFX1IzX18gPSB1bmRlZmluZWQ7XG5leHBvcnQgY29uc3QgbmdDbGFzc0ZhY3RvcnlEZWZfX1BPU1RfUjNfXyA9IGZ1bmN0aW9uKCkge307XG5leHBvcnQgY29uc3QgbmdDbGFzc0ZhY3RvcnlEZWYgPSBuZ0NsYXNzRmFjdG9yeURlZl9fUFJFX1IzX187XG5cbi8qKlxuICogU2VydmVzIGFzIHRoZSBiYXNlIG5vbi1WRSBjb250YWluZXIgZm9yIE5nQ2xhc3MuXG4gKlxuICogV2hpbGUgdGhpcyBpcyBhIGJhc2UgY2xhc3MgdGhhdCBOZ0NsYXNzIGV4dGVuZHMgZnJvbSwgdGhlXG4gKiBjbGFzcyBpdHNlbGYgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3Igbm9uLVZFIGNvZGUgdG8gc2V0dXBcbiAqIGEgbGluayB0byB0aGUgYFtjbGFzc11gIGhvc3QgYmluZGluZyAodmlhIHRoZSBzdGF0aWNcbiAqIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkgb24gdGhlIGNsYXNzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkncyBjb2RlIGlzIHN3aXRjaGVkXG4gKiBkZXBlbmRpbmcgaWYgVkUgaXMgcHJlc2VudCBvciBub3QgKHRoaXMgYWxsb3dzIGZvciB0aGVcbiAqIGJpbmRpbmcgY29kZSB0byBiZSBzZXQgb25seSBmb3IgbmV3ZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdDbGFzc0Jhc2Uge1xuICBzdGF0aWMgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG5nQ2xhc3NEaXJlY3RpdmVEZWY7XG4gIHN0YXRpYyBuZ0ZhY3RvcnlEZWY6IGFueSA9IG5nQ2xhc3NGYWN0b3J5RGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nQ2xhc3NJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nLCBwcm92aWRlcnM6IFtOZ0NsYXNzSW1wbFByb3ZpZGVyXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBleHRlbmRzIE5nQ2xhc3NCYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBOZ0NsYXNzSW1wbCkgeyBzdXBlcihkZWxlZ2F0ZSk7IH1cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fZGVsZWdhdGUuc2V0Q2xhc3ModmFsdWUpOyB9XG5cbiAgQElucHV0KCduZ0NsYXNzJylcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fZGVsZWdhdGUuc2V0TmdDbGFzcyh2YWx1ZSk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=