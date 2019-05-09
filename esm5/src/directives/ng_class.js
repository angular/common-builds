import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ɵɵclassMap, ɵɵdefineDirective, ɵɵstyling, ɵɵstylingApply } from '@angular/core';
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
export var ngClassDirectiveDef__PRE_R3__ = undefined;
// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export var ngClassDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: function () { },
    selectors: null,
    factory: function () { },
    hostBindings: function (rf, ctx, elIndex) {
        if (rf & 1 /* Create */) {
            ɵɵstyling();
        }
        if (rf & 2 /* Update */) {
            ɵɵclassMap(ctx.getValue());
            ɵɵstylingApply();
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
    NgClass.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgClass, selectors: [["", "ngClass", ""]], factory: function NgClass_Factory(t) { return new (t || NgClass)(i0.ɵɵdirectiveInject(i1.NgClassImpl)); }, inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, features: [i0.ɵɵProvidersFeature([NgClassImplProvider]), i0.ɵɵInheritDefinitionFeature] });
    return NgClass;
}(NgClassBase));
export { NgClass };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFnQixVQUFVLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVoSSxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQUlqRTs7Ozs7Ozs7OztHQVVHO0FBRUgsOEJBQThCO0FBQzlCLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztBQUV2RCwyREFBMkQ7QUFDM0QsMERBQTBEO0FBQzFELGNBQWM7QUFDZCxNQUFNLENBQUMsSUFBTSw4QkFBOEIsR0FBRyxpQkFBaUIsQ0FBQztJQUM5RCxJQUFJLEVBQUUsY0FBWSxDQUFRO0lBQzFCLFNBQVMsRUFBRSxJQUFXO0lBQ3RCLE9BQU8sRUFBRSxjQUFPLENBQUM7SUFDakIsWUFBWSxFQUFFLFVBQVMsRUFBZ0IsRUFBRSxHQUFRLEVBQUUsT0FBZTtRQUNoRSxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7WUFDNUIsU0FBUyxFQUFFLENBQUM7U0FDYjtRQUNELElBQUksRUFBRSxpQkFBc0IsRUFBRTtZQUM1QixVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDM0IsY0FBYyxFQUFFLENBQUM7U0FDbEI7SUFDSCxDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLElBQU0sbUJBQW1CLEdBZm5CLDhCQWVtRCxDQUFDO0FBRWpFOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSDtJQUdFLHFCQUFzQixTQUFzQjtRQUF0QixjQUFTLEdBQVQsU0FBUyxDQUFhO0lBQUcsQ0FBQztJQUVoRCw4QkFBUSxHQUFSLGNBQWEsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUp6QywwQkFBYyxHQUFRLG1CQUFtQixDQUFDO0lBS25ELGtCQUFDO0NBQUEsQUFORCxJQU1DO1NBTlksV0FBVztBQVF4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBQ0g7SUFDNkIsbUNBQVc7SUFDdEMsaUJBQVksUUFBcUI7ZUFBSSxrQkFBTSxRQUFRLENBQUM7SUFBRSxDQUFDO0lBRXZELHNCQUNJLDBCQUFLO2FBRFQsVUFDVSxLQUFhLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUU1RCxzQkFDSSw0QkFBTzthQURYLFVBQ1ksS0FBeUQ7WUFDbkUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQzs7O09BQUE7SUFFRCwyQkFBUyxHQUFULGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7MERBWG5DLE9BQU8sNEZBQVAsT0FBTyx3SUFEMEIsQ0FBQyxtQkFBbUIsQ0FBQztrQkFsR25FO0NBK0dDLEFBYkQsQ0FDNkIsV0FBVyxHQVl2QztTQVpZLE9BQU87bUNBQVAsT0FBTztjQURuQixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUM7O2tCQUlqRSxLQUFLO21CQUFDLE9BQU87O2tCQUdiLEtBQUs7bUJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBJbnB1dCwgybVSZW5kZXJGbGFncywgybXJtWNsYXNzTWFwLCDJtcm1ZGVmaW5lRGlyZWN0aXZlLCDJtcm1c3R5bGluZywgybXJtXN0eWxpbmdBcHBseX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdDbGFzc0ltcGwsIE5nQ2xhc3NJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfY2xhc3NfaW1wbCc7XG5cblxuXG4vKlxuICogTmdDbGFzcyAoYXMgd2VsbCBhcyBOZ1N0eWxlKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nQ2xhc3Mgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gybXJtWRlZmluZURpcmVjdGl2ZSh7XG4gIHR5cGU6IGZ1bmN0aW9uKCkge30gYXMgYW55LFxuICBzZWxlY3RvcnM6IG51bGwgYXMgYW55LFxuICBmYWN0b3J5OiAoKSA9PiB7fSxcbiAgaG9zdEJpbmRpbmdzOiBmdW5jdGlvbihyZjogybVSZW5kZXJGbGFncywgY3R4OiBhbnksIGVsSW5kZXg6IG51bWJlcikge1xuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuQ3JlYXRlKSB7XG4gICAgICDJtcm1c3R5bGluZygpO1xuICAgIH1cbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybXJtWNsYXNzTWFwKGN0eC5nZXRWYWx1ZSgpKTtcbiAgICAgIMm1ybVzdHlsaW5nQXBwbHkoKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZiA9IG5nQ2xhc3NEaXJlY3RpdmVEZWZfX1BSRV9SM19fO1xuXG4vKipcbiAqIFNlcnZlcyBhcyB0aGUgYmFzZSBub24tVkUgY29udGFpbmVyIGZvciBOZ0NsYXNzLlxuICpcbiAqIFdoaWxlIHRoaXMgaXMgYSBiYXNlIGNsYXNzIHRoYXQgTmdDbGFzcyBleHRlbmRzIGZyb20sIHRoZVxuICogY2xhc3MgaXRzZWxmIGFjdHMgYXMgYSBjb250YWluZXIgZm9yIG5vbi1WRSBjb2RlIHRvIHNldHVwXG4gKiBhIGxpbmsgdG8gdGhlIGBbY2xhc3NdYCBob3N0IGJpbmRpbmcgKHZpYSB0aGUgc3RhdGljXG4gKiBgbmdEaXJlY3RpdmVEZWZgIHByb3BlcnR5IG9uIHRoZSBjbGFzcykuXG4gKlxuICogTm90ZSB0aGF0IHRoZSBgbmdEaXJlY3RpdmVEZWZgIHByb3BlcnR5J3MgY29kZSBpcyBzd2l0Y2hlZFxuICogZGVwZW5kaW5nIGlmIFZFIGlzIHByZXNlbnQgb3Igbm90ICh0aGlzIGFsbG93cyBmb3IgdGhlXG4gKiBiaW5kaW5nIGNvZGUgdG8gYmUgc2V0IG9ubHkgZm9yIG5ld2VyIHZlcnNpb25zIG9mIEFuZ3VsYXIpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5nQ2xhc3NCYXNlIHtcbiAgc3RhdGljIG5nRGlyZWN0aXZlRGVmOiBhbnkgPSBuZ0NsYXNzRGlyZWN0aXZlRGVmO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IE5nQ2xhc3NJbXBsKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0VmFsdWUoKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nLCBwcm92aWRlcnM6IFtOZ0NsYXNzSW1wbFByb3ZpZGVyXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBleHRlbmRzIE5nQ2xhc3NCYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBOZ0NsYXNzSW1wbCkgeyBzdXBlcihkZWxlZ2F0ZSk7IH1cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5fZGVsZWdhdGUuc2V0Q2xhc3ModmFsdWUpOyB9XG5cbiAgQElucHV0KCduZ0NsYXNzJylcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fZGVsZWdhdGUuc2V0TmdDbGFzcyh2YWx1ZSk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX2RlbGVnYXRlLmFwcGx5Q2hhbmdlcygpOyB9XG59XG4iXX0=