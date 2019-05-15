import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ΔclassMap, ΔdefineDirective, Δstyling, ΔstylingApply } from '@angular/core';
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
export var ngClassDirectiveDef__PRE_R3__ = undefined;
var ɵ0 = function () { }, ɵ1 = function () { }, ɵ2 = function (rf, ctx, elIndex) {
    if (rf & 1 /* Create */) {
        Δstyling();
    }
    if (rf & 2 /* Update */) {
        ΔclassMap(ctx.getValue());
        ΔstylingApply();
    }
};
// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export var ngClassDirectiveDef__POST_R3__ = ΔdefineDirective({
    type: ɵ0,
    selectors: null,
    factory: ɵ1,
    hostBindings: ɵ2
});
export var ngClassDirectiveDef = ngClassDirectiveDef__PRE_R3__;
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
    tslib_1.__decorate([
        Input('class'),
        tslib_1.__metadata("design:type", String),
        tslib_1.__metadata("design:paramtypes", [String])
    ], NgClass.prototype, "klass", null);
    tslib_1.__decorate([
        Input('ngClass'),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], NgClass.prototype, "ngClass", null);
    NgClass = tslib_1.__decorate([
        Directive({ selector: '[ngClass]', providers: [NgClassImplProvider] }),
        tslib_1.__metadata("design:paramtypes", [NgClassImpl])
    ], NgClass);
    return NgClass;
}(NgClassBase));
export { NgClass };
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFnQixTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1SCxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFJakU7Ozs7Ozs7Ozs7R0FVRztBQUVILDhCQUE4QjtBQUM5QixNQUFNLENBQUMsSUFBTSw2QkFBNkIsR0FBRyxTQUFTLENBQUM7U0FNL0MsY0FBWSxDQUFDLE9BRVYsY0FBTyxDQUFDLE9BQ0gsVUFBUyxFQUFnQixFQUFFLEdBQVEsRUFBRSxPQUFlO0lBQ2hFLElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixRQUFRLEVBQUUsQ0FBQztLQUNaO0lBQ0QsSUFBSSxFQUFFLGlCQUFzQixFQUFFO1FBQzVCLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMxQixhQUFhLEVBQUUsQ0FBQztLQUNqQjtBQUNILENBQUM7QUFmSCwyREFBMkQ7QUFDM0QsMERBQTBEO0FBQzFELGNBQWM7QUFDZCxNQUFNLENBQUMsSUFBTSw4QkFBOEIsR0FBRyxnQkFBZ0IsQ0FBQztJQUM3RCxJQUFJLEVBQUUsRUFBb0I7SUFDMUIsU0FBUyxFQUFFLElBQVc7SUFDdEIsT0FBTyxJQUFVO0lBQ2pCLFlBQVksSUFRWDtDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHLDZCQUE2QixDQUFDO0FBRWpFOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSDtJQUdFLHFCQUFzQixTQUFzQjtRQUF0QixjQUFTLEdBQVQsU0FBUyxDQUFhO0lBQUcsQ0FBQztJQUVoRCw4QkFBUSxHQUFSLGNBQWEsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUp6QywwQkFBYyxHQUFRLG1CQUFtQixDQUFDO0lBS25ELGtCQUFDO0NBQUEsQUFORCxJQU1DO1NBTlksV0FBVztBQVF4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBRUg7SUFBNkIsbUNBQVc7SUFDdEMsaUJBQVksUUFBcUI7ZUFBSSxrQkFBTSxRQUFRLENBQUM7SUFBRSxDQUFDO0lBR3ZELHNCQUFJLDBCQUFLO2FBQVQsVUFBVSxLQUFhLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUc1RCxzQkFBSSw0QkFBTzthQUFYLFVBQVksS0FBeUQ7WUFDbkUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQzs7O09BQUE7SUFFRCwyQkFBUyxHQUFULGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFQOUM7UUFEQyxLQUFLLENBQUMsT0FBTyxDQUFDOzs7d0NBQzZDO0lBRzVEO1FBREMsS0FBSyxDQUFDLFNBQVMsQ0FBQzs7OzBDQUdoQjtJQVRVLE9BQU87UUFEbkIsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLENBQUM7aURBRTdDLFdBQVc7T0FEdEIsT0FBTyxDQVluQjtJQUFELGNBQUM7Q0FBQSxBQVpELENBQTZCLFdBQVcsR0FZdkM7U0FaWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIElucHV0LCDJtVJlbmRlckZsYWdzLCDOlGNsYXNzTWFwLCDOlGRlZmluZURpcmVjdGl2ZSwgzpRzdHlsaW5nLCDOlHN0eWxpbmdBcHBseX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TmdDbGFzc0ltcGwsIE5nQ2xhc3NJbXBsUHJvdmlkZXJ9IGZyb20gJy4vbmdfY2xhc3NfaW1wbCc7XG5cblxuXG4vKlxuICogTmdDbGFzcyAoYXMgd2VsbCBhcyBOZ1N0eWxlKSBiZWhhdmVzIGRpZmZlcmVudGx5IHdoZW4gbG9hZGVkIGluIHRoZSBWRSBhbmQgd2hlbiBub3QuXG4gKlxuICogSWYgdGhlIFZFIGlzIHByZXNlbnQgKHdoaWNoIGlzIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKSB0aGVuIE5nQ2xhc3Mgd2lsbCBpbmplY3RcbiAqIHRoZSBsZWdhY3kgZGlmZmluZyBhbGdvcml0aG0gYXMgYSBzZXJ2aWNlIGFuZCBkZWxlZ2F0ZSBhbGwgc3R5bGluZyBjaGFuZ2VzIHRvIHRoYXQuXG4gKlxuICogSWYgdGhlIFZFIGlzIG5vdCBwcmVzZW50IHRoZW4gTmdTdHlsZSB3aWxsIG5vcm1hbGl6ZSAodGhyb3VnaCB0aGUgaW5qZWN0ZWQgc2VydmljZSkgYW5kXG4gKiB0aGVuIHdyaXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nIGRpcmVjdGx5ICh0aHJvdWdoIGEgaG9zdCBiaW5kaW5nKS5cbiAqIFRoZW4gQW5ndWxhciB3aWxsIG5vdGljZSB0aGUgaG9zdCBiaW5kaW5nIGNoYW5nZSBhbmQgdHJlYXQgdGhlIGNoYW5nZXMgYXMgc3R5bGluZ1xuICogY2hhbmdlcyBhbmQgYXBwbHkgdGhlbSB2aWEgdGhlIGNvcmUgc3R5bGluZyBpbnN0cnVjdGlvbnMgdGhhdCBleGlzdCB3aXRoaW4gQW5ndWxhci5cbiAqL1xuXG4vLyB1c2VkIHdoZW4gdGhlIFZFIGlzIHByZXNlbnRcbmV4cG9ydCBjb25zdCBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdDbGFzc0RpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gzpRkZWZpbmVEaXJlY3RpdmUoe1xuICB0eXBlOiBmdW5jdGlvbigpIHt9IGFzIGFueSxcbiAgc2VsZWN0b3JzOiBudWxsIGFzIGFueSxcbiAgZmFjdG9yeTogKCkgPT4ge30sXG4gIGhvc3RCaW5kaW5nczogZnVuY3Rpb24ocmY6IMm1UmVuZGVyRmxhZ3MsIGN0eDogYW55LCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLkNyZWF0ZSkge1xuICAgICAgzpRzdHlsaW5nKCk7XG4gICAgfVxuICAgIGlmIChyZiAmIMm1UmVuZGVyRmxhZ3MuVXBkYXRlKSB7XG4gICAgICDOlGNsYXNzTWFwKGN0eC5nZXRWYWx1ZSgpKTtcbiAgICAgIM6Uc3R5bGluZ0FwcGx5KCk7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGNvbnN0IG5nQ2xhc3NEaXJlY3RpdmVEZWYgPSBuZ0NsYXNzRGlyZWN0aXZlRGVmX19QUkVfUjNfXztcblxuLyoqXG4gKiBTZXJ2ZXMgYXMgdGhlIGJhc2Ugbm9uLVZFIGNvbnRhaW5lciBmb3IgTmdDbGFzcy5cbiAqXG4gKiBXaGlsZSB0aGlzIGlzIGEgYmFzZSBjbGFzcyB0aGF0IE5nQ2xhc3MgZXh0ZW5kcyBmcm9tLCB0aGVcbiAqIGNsYXNzIGl0c2VsZiBhY3RzIGFzIGEgY29udGFpbmVyIGZvciBub24tVkUgY29kZSB0byBzZXR1cFxuICogYSBsaW5rIHRvIHRoZSBgW2NsYXNzXWAgaG9zdCBiaW5kaW5nICh2aWEgdGhlIHN0YXRpY1xuICogYG5nRGlyZWN0aXZlRGVmYCBwcm9wZXJ0eSBvbiB0aGUgY2xhc3MpLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgYG5nRGlyZWN0aXZlRGVmYCBwcm9wZXJ0eSdzIGNvZGUgaXMgc3dpdGNoZWRcbiAqIGRlcGVuZGluZyBpZiBWRSBpcyBwcmVzZW50IG9yIG5vdCAodGhpcyBhbGxvd3MgZm9yIHRoZVxuICogYmluZGluZyBjb2RlIHRvIGJlIHNldCBvbmx5IGZvciBuZXdlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ0NsYXNzQmFzZSB7XG4gIHN0YXRpYyBuZ0RpcmVjdGl2ZURlZjogYW55ID0gbmdDbGFzc0RpcmVjdGl2ZURlZjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2RlbGVnYXRlOiBOZ0NsYXNzSW1wbCkge31cblxuICBnZXRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLmdldFZhbHVlKCk7IH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwiJ2ZpcnN0IHNlY29uZCdcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJbJ2ZpcnN0JywgJ3NlY29uZCddXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydmaXJzdCc6IHRydWUsICdzZWNvbmQnOiB0cnVlLCAndGhpcmQnOiBmYWxzZX1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJzdHJpbmdFeHB8YXJyYXlFeHB8b2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydjbGFzczEgY2xhc3MyIGNsYXNzMycgOiB0cnVlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyBhbmQgcmVtb3ZlcyBDU1MgY2xhc3NlcyBvbiBhbiBIVE1MIGVsZW1lbnQuXG4gKlxuICogVGhlIENTUyBjbGFzc2VzIGFyZSB1cGRhdGVkIGFzIGZvbGxvd3MsIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0aW9uOlxuICogLSBgc3RyaW5nYCAtIHRoZSBDU1MgY2xhc3NlcyBsaXN0ZWQgaW4gdGhlIHN0cmluZyAoc3BhY2UgZGVsaW1pdGVkKSBhcmUgYWRkZWQsXG4gKiAtIGBBcnJheWAgLSB0aGUgQ1NTIGNsYXNzZXMgZGVjbGFyZWQgYXMgQXJyYXkgZWxlbWVudHMgYXJlIGFkZGVkLFxuICogLSBgT2JqZWN0YCAtIGtleXMgYXJlIENTUyBjbGFzc2VzIHRoYXQgZ2V0IGFkZGVkIHdoZW4gdGhlIGV4cHJlc3Npb24gZ2l2ZW4gaW4gdGhlIHZhbHVlXG4gKiAgICAgICAgICAgICAgZXZhbHVhdGVzIHRvIGEgdHJ1dGh5IHZhbHVlLCBvdGhlcndpc2UgdGhleSBhcmUgcmVtb3ZlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nQ2xhc3NdJywgcHJvdmlkZXJzOiBbTmdDbGFzc0ltcGxQcm92aWRlcl19KVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3MgZXh0ZW5kcyBOZ0NsYXNzQmFzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogTmdDbGFzc0ltcGwpIHsgc3VwZXIoZGVsZWdhdGUpOyB9XG5cbiAgQElucHV0KCdjbGFzcycpXG4gIHNldCBrbGFzcyh2YWx1ZTogc3RyaW5nKSB7IHRoaXMuX2RlbGVnYXRlLnNldENsYXNzKHZhbHVlKTsgfVxuXG4gIEBJbnB1dCgnbmdDbGFzcycpXG4gIHNldCBuZ0NsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX2RlbGVnYXRlLnNldE5nQ2xhc3ModmFsdWUpO1xuICB9XG5cbiAgbmdEb0NoZWNrKCkgeyB0aGlzLl9kZWxlZ2F0ZS5hcHBseUNoYW5nZXMoKTsgfVxufVxuIl19