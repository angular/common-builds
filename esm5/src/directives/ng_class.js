import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ɵdefineDirective, ɵelementStyling, ɵelementStylingApply, ɵelementStylingMap } from '@angular/core';
import { NgClassImpl, NgClassImplProvider } from './ng_class_impl';
import * as i0 from "@angular/core";
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
export var ngClassDirectiveDef__PRE_R3__ = undefined;
// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export var ngClassDirectiveDef__POST_R3__ = ɵdefineDirective({
    type: function () { },
    selectors: null,
    factory: function () { },
    hostBindings: function (rf, ctx, elIndex) {
        if (rf & 1 /* Create */) {
            ɵelementStyling(null, null, null, ctx);
        }
        if (rf & 2 /* Update */) {
            ɵelementStylingMap(elIndex, ctx.getValue(), null, ctx);
            ɵelementStylingApply(elIndex, ctx);
        }
    }
});
export var ngClassDirectiveDef = ngClassDirectiveDef__POST_R3__;
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
 * @publicApi
 */
var NgClassBase = /** @class */ (function () {
    function NgClassBase(_delegate) {
        this._delegate = _delegate;
    }
    NgClassBase.prototype.getValue = function () { return this._delegate.getValue(); };
    NgClassBase.ngDirectiveDef = ngClassDirectiveDef;
    return NgClassBase;
}());
export { NgClassBase };
/**
 * @ngModule CommonModule
 *
 * @usageNotes
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
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @publicApi
 */
var NgClass = /** @class */ (function (_super) {
    tslib_1.__extends(NgClass, _super);
    function NgClass(delegate) {
        return _super.call(this, delegate) || this;
    }
    Object.defineProperty(NgClass.prototype, "klass", {
        set: function (value) { this._delegate.setClass(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgClass.prototype, "ngClass", {
        set: function (value) {
            this._delegate.setNgClass(value);
        },
        enumerable: true,
        configurable: true
    });
    NgClass.prototype.ngDoCheck = function () { this._delegate.applyChanges(); };
    NgClass.ngDirectiveDef = i0.ɵdefineDirective({ type: NgClass, selectors: [["", "ngClass", ""]], factory: function NgClass_Factory(t) { return new (t || NgClass)(i0.ɵdirectiveInject(NgClassImpl)); }, inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, features: [i0.ɵProvidersFeature([NgClassImplProvider]), i0.ɵInheritDefinitionFeature] });
    return NgClass;
}(NgClassBase));
export { NgClass };
/*@__PURE__*/ i0.ɵsetClassMetadata(NgClass, [{
        type: Directive,
        args: [{ selector: '[ngClass]', providers: [NgClassImplProvider] }]
    }], function () { return [{
        type: NgClassImpl
    }]; }, { klass: [{
            type: Input,
            args: ['class']
        }], ngClass: [{
            type: Input,
            args: ['ngClass']
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFnQixnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkosT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUlqRTs7Ozs7Ozs7OztHQVVHO0FBRUgsOEJBQThCO0FBQzlCLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztBQUV2RCwyREFBMkQ7QUFDM0QsMERBQTBEO0FBQzFELGNBQWM7QUFDZCxNQUFNLENBQUMsSUFBTSw4QkFBOEIsR0FBRyxnQkFBZ0IsQ0FBQztJQUM3RCxJQUFJLEVBQUUsY0FBWSxDQUFRO0lBQzFCLFNBQVMsRUFBRSxJQUFXO0lBQ3RCLE9BQU8sRUFBRSxjQUFPLENBQUM7SUFDakIsWUFBWSxFQUFFLFVBQVMsRUFBZ0IsRUFBRSxHQUFRLEVBQUUsT0FBZTtRQUNoRSxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7WUFDNUIsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1lBQzVCLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELG9CQUFvQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FmbkIsOEJBZW1ELENBQUM7QUFFakU7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNIO0lBR0UscUJBQXNCLFNBQXNCO1FBQXRCLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDO0lBRWhELDhCQUFRLEdBQVIsY0FBYSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBSnpDLDBCQUFjLEdBQVEsbUJBQW1CLENBQUM7SUFLbkQsa0JBQUM7Q0FBQSxBQU5ELElBTUM7U0FOWSxXQUFXO0FBUXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQkc7QUFDSDtJQUM2QixtQ0FBVztJQUN0QyxpQkFBWSxRQUFxQjtlQUFJLGtCQUFNLFFBQVEsQ0FBQztJQUFFLENBQUM7SUFFdkQsc0JBQ0ksMEJBQUs7YUFEVCxVQUNVLEtBQWEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRTVELHNCQUNJLDRCQUFPO2FBRFgsVUFDWSxLQUF5RDtZQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDOzs7T0FBQTtJQUVELDJCQUFTLEdBQVQsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQzt5REFYbkMsT0FBTyw0RkFBUCxPQUFPLHNCQUNJLFdBQVcsa0dBRlcsQ0FBQyxtQkFBbUIsQ0FBQztrQkFsR25FO0NBK0dDLEFBYkQsQ0FDNkIsV0FBVyxHQVl2QztTQVpZLE9BQU87bUNBQVAsT0FBTztjQURuQixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUM7O2NBRTVDLFdBQVc7O2tCQUVoQyxLQUFLO21CQUFDLE9BQU87O2tCQUdiLEtBQUs7bUJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBJbnB1dCwgybVSZW5kZXJGbGFncywgybVkZWZpbmVEaXJlY3RpdmUsIMm1ZWxlbWVudFN0eWxpbmcsIMm1ZWxlbWVudFN0eWxpbmdBcHBseSwgybVlbGVtZW50U3R5bGluZ01hcH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdDbGFzc0ltcGwsIE5nQ2xhc3NJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfY2xhc3NfaW1wbCc7XG5cblxuXG4vKlxuICogTmdDbGFzcyAoYXMgd2VsbCBhcyBOZ1N0eWxlKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nQ2xhc3Mgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gybVkZWZpbmVEaXJlY3RpdmUoe1xuICB0eXBlOiBmdW5jdGlvbigpIHt9IGFzIGFueSxcbiAgc2VsZWN0b3JzOiBudWxsIGFzIGFueSxcbiAgZmFjdG9yeTogKCkgPT4ge30sXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLkNyZWF0ZSkge1xuICAgICAgybVlbGVtZW50U3R5bGluZyhudWxsLCBudWxsLCBudWxsLCBjdHgpO1xuICAgIH1cbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybVlbGVtZW50U3R5bGluZ01hcChlbEluZGV4LCBjdHguZ2V0VmFsdWUoKSwgbnVsbCwgY3R4KTtcbiAgICAgIMm1ZWxlbWVudFN0eWxpbmdBcHBseShlbEluZGV4LCBjdHgpO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmID0gbmdDbGFzc0RpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5cbi8qKlxuICogU2VydmVzIGFzIHRoZSBiYXNlIG5vbi1WRSBjb250YWluZXIgZm9yIE5nQ2xhc3MuXG4gKlxuICogV2hpbGUgdGhpcyBpcyBhIGJhc2UgY2xhc3MgdGhhdCBOZ0NsYXNzIGV4dGVuZHMgZnJvbSwgdGhlXG4gKiBjbGFzcyBpdHNlbGYgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3Igbm9uLVZFIGNvZGUgdG8gc2V0dXBcbiAqIGEgbGluayB0byB0aGUgYFtjbGFzc11gIGhvc3QgYmluZGluZyAodmlhIHRoZSBzdGF0aWNcbiAqIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkgb24gdGhlIGNsYXNzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGBuZ0RpcmVjdGl2ZURlZmAgcHJvcGVydHkncyBjb2RlIGlzIHN3aXRjaGVkXG4gKiBkZXBlbmRpbmcgaWYgVkUgaXMgcHJlc2VudCBvciBub3QgKHRoaXMgYWxsb3dzIGZvciB0aGVcbiAqIGJpbmRpbmcgY29kZSB0byBiZSBzZXQgb25seSBmb3IgbmV3ZXIgdmVyc2lvbnMgb2YgQW5ndWxhcikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdDbGFzc0Jhc2Uge1xuICBzdGF0aWMgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG5nQ2xhc3NEaXJlY3RpdmVEZWY7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9kZWxlZ2F0ZTogTmdDbGFzc0ltcGwpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5nZXRWYWx1ZSgpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIidmaXJzdCBzZWNvbmQnXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwiWydmaXJzdCcsICdzZWNvbmQnXVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInsnZmlyc3QnOiB0cnVlLCAnc2Vjb25kJzogdHJ1ZSwgJ3RoaXJkJzogZmFsc2V9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwic3RyaW5nRXhwfGFycmF5RXhwfG9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInsnY2xhc3MxIGNsYXNzMiBjbGFzczMnIDogdHJ1ZX1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFkZHMgYW5kIHJlbW92ZXMgQ1NTIGNsYXNzZXMgb24gYW4gSFRNTCBlbGVtZW50LlxuICpcbiAqIFRoZSBDU1MgY2xhc3NlcyBhcmUgdXBkYXRlZCBhcyBmb2xsb3dzLCBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdGhlIGV4cHJlc3Npb24gZXZhbHVhdGlvbjpcbiAqIC0gYHN0cmluZ2AgLSB0aGUgQ1NTIGNsYXNzZXMgbGlzdGVkIGluIHRoZSBzdHJpbmcgKHNwYWNlIGRlbGltaXRlZCkgYXJlIGFkZGVkLFxuICogLSBgQXJyYXlgIC0gdGhlIENTUyBjbGFzc2VzIGRlY2xhcmVkIGFzIEFycmF5IGVsZW1lbnRzIGFyZSBhZGRlZCxcbiAqIC0gYE9iamVjdGAgLSBrZXlzIGFyZSBDU1MgY2xhc3NlcyB0aGF0IGdldCBhZGRlZCB3aGVuIHRoZSBleHByZXNzaW9uIGdpdmVuIGluIHRoZSB2YWx1ZVxuICogICAgICAgICAgICAgIGV2YWx1YXRlcyB0byBhIHRydXRoeSB2YWx1ZSwgb3RoZXJ3aXNlIHRoZXkgYXJlIHJlbW92ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0NsYXNzXScsIHByb3ZpZGVyczogW05nQ2xhc3NJbXBsUHJvdmlkZXJdfSlcbmV4cG9ydCBjbGFzcyBOZ0NsYXNzIGV4dGVuZHMgTmdDbGFzc0Jhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IE5nQ2xhc3NJbXBsKSB7IHN1cGVyKGRlbGVnYXRlKTsgfVxuXG4gIEBJbnB1dCgnY2xhc3MnKVxuICBzZXQga2xhc3ModmFsdWU6IHN0cmluZykgeyB0aGlzLl9kZWxlZ2F0ZS5zZXRDbGFzcyh2YWx1ZSk7IH1cblxuICBASW5wdXQoJ25nQ2xhc3MnKVxuICBzZXQgbmdDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZS5zZXROZ0NsYXNzKHZhbHVlKTtcbiAgfVxuXG4gIG5nRG9DaGVjaygpIHsgdGhpcy5fZGVsZWdhdGUuYXBwbHlDaGFuZ2VzKCk7IH1cbn1cbiJdfQ==