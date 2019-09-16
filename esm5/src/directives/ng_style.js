import * as tslib_1 from "tslib";
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
export var ngStyleDirectiveDef__PRE_R3__ = undefined;
export var ngStyleFactoryDef__PRE_R3__ = undefined;
var ɵ0 = function () { }, ɵ1 = function (rf, ctx, elIndex) {
    if (rf & 1 /* Create */) {
        ɵɵallocHostVars(1);
    }
    if (rf & 2 /* Update */) {
        ɵɵstyleMap(ctx.getValue());
    }
};
// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export var ngStyleDirectiveDef__POST_R3__ = ɵɵdefineDirective({
    type: ɵ0,
    selectors: null,
    hostBindings: ɵ1
});
export var ngStyleFactoryDef__POST_R3__ = function () { };
export var ngStyleDirectiveDef = ngStyleDirectiveDef__PRE_R3__;
export var ngStyleFactoryDef = ngStyleDirectiveDef__PRE_R3__;
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
 * @publicApi
 */
var NgStyleBase = /** @class */ (function () {
    function NgStyleBase(_delegate) {
        this._delegate = _delegate;
    }
    NgStyleBase.prototype.getValue = function () { return this._delegate.getValue(); };
    NgStyleBase.ngDirectiveDef = ngStyleDirectiveDef;
    NgStyleBase.ngFactory = ngStyleFactoryDef;
    return NgStyleBase;
}());
export { NgStyleBase };
/**
 * @ngModule CommonModule
 *
 * @usageNotes
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
 * @description
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
 * @publicApi
 */
var NgStyle = /** @class */ (function (_super) {
    tslib_1.__extends(NgStyle, _super);
    function NgStyle(delegate) {
        return _super.call(this, delegate) || this;
    }
    Object.defineProperty(NgStyle.prototype, "ngStyle", {
        set: function (value) { this._delegate.setNgStyle(value); },
        enumerable: true,
        configurable: true
    });
    NgStyle.prototype.ngDoCheck = function () { this._delegate.applyChanges(); };
    tslib_1.__decorate([
        Input('ngStyle'),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], NgStyle.prototype, "ngStyle", null);
    NgStyle = tslib_1.__decorate([
        Directive({ selector: '[ngStyle]', providers: [NgStyleImplProvider] }),
        tslib_1.__metadata("design:paramtypes", [NgStyleImpl])
    ], NgStyle);
    return NgStyle;
}(NgStyleBase));
export { NgStyle };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFnQixlQUFlLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRILE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUlqRTs7Ozs7Ozs7OztHQVVHO0FBRUgsOEJBQThCO0FBQzlCLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztBQUN2RCxNQUFNLENBQUMsSUFBTSwyQkFBMkIsR0FBRyxTQUFTLENBQUM7U0FNN0MsY0FBWSxDQUFDLE9BRUwsVUFBUyxFQUFnQixFQUFFLEdBQVEsRUFBRSxPQUFlO0lBQ2hFLElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEI7SUFDRCxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7UUFDNUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQzVCO0FBQ0gsQ0FBQztBQWJILDJEQUEyRDtBQUMzRCwwREFBMEQ7QUFDMUQsY0FBYztBQUNkLE1BQU0sQ0FBQyxJQUFNLDhCQUE4QixHQUFHLGlCQUFpQixDQUFDO0lBQzlELElBQUksRUFBRSxFQUFvQjtJQUMxQixTQUFTLEVBQUUsSUFBVztJQUN0QixZQUFZLElBT1g7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsSUFBTSw0QkFBNEIsR0FBRyxjQUFZLENBQUMsQ0FBQztBQUUxRCxNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FBRyw2QkFBNkIsQ0FBQztBQUNqRSxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyw2QkFBNkIsQ0FBQztBQUUvRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0g7SUFJRSxxQkFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7SUFFaEQsOEJBQVEsR0FBUixjQUFhLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFMekMsMEJBQWMsR0FBUSxtQkFBbUIsQ0FBQztJQUMxQyxxQkFBUyxHQUFRLGlCQUFpQixDQUFDO0lBSzVDLGtCQUFDO0NBQUEsQUFQRCxJQU9DO1NBUFksV0FBVztBQVN4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQ0c7QUFFSDtJQUE2QixtQ0FBVztJQUN0QyxpQkFBWSxRQUFxQjtlQUFJLGtCQUFNLFFBQVEsQ0FBQztJQUFFLENBQUM7SUFHdkQsc0JBQUksNEJBQU87YUFBWCxVQUFZLEtBQWtDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVyRiwyQkFBUyxHQUFULGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFGOUM7UUFEQyxLQUFLLENBQUMsU0FBUyxDQUFDOzs7MENBQ29FO0lBSjFFLE9BQU87UUFEbkIsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLENBQUM7aURBRTdDLFdBQVc7T0FEdEIsT0FBTyxDQU9uQjtJQUFELGNBQUM7Q0FBQSxBQVBELENBQTZCLFdBQVcsR0FPdkM7U0FQWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIElucHV0LCDJtVJlbmRlckZsYWdzLCDJtcm1YWxsb2NIb3N0VmFycywgybXJtWRlZmluZURpcmVjdGl2ZSwgybXJtXN0eWxlTWFwfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtOZ1N0eWxlSW1wbCwgTmdTdHlsZUltcGxQcm92aWRlcn0gZnJvbSAnLi9uZ19zdHlsZV9pbXBsJztcblxuXG5cbi8qXG4gKiBOZ1N0eWxlIChhcyB3ZWxsIGFzIE5nQ2xhc3MpIGJlaGF2ZXMgZGlmZmVyZW50bHkgd2hlbiBsb2FkZWQgaW4gdGhlIFZFIGFuZCB3aGVuIG5vdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgcHJlc2VudCAod2hpY2ggaXMgZm9yIG9sZGVyIHZlcnNpb25zIG9mIEFuZ3VsYXIpIHRoZW4gTmdTdHlsZSB3aWxsIGluamVjdFxuICogdGhlIGxlZ2FjeSBkaWZmaW5nIGFsZ29yaXRobSBhcyBhIHNlcnZpY2UgYW5kIGRlbGVnYXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhhdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgbm90IHByZXNlbnQgdGhlbiBOZ1N0eWxlIHdpbGwgbm9ybWFsaXplICh0aHJvdWdoIHRoZSBpbmplY3RlZCBzZXJ2aWNlKSBhbmRcbiAqIHRoZW4gd3JpdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGUgYFtzdHlsZV1gIGJpbmRpbmcgZGlyZWN0bHkgKHRocm91Z2ggYSBob3N0IGJpbmRpbmcpLlxuICogVGhlbiBBbmd1bGFyIHdpbGwgbm90aWNlIHRoZSBob3N0IGJpbmRpbmcgY2hhbmdlIGFuZCB0cmVhdCB0aGUgY2hhbmdlcyBhcyBzdHlsaW5nXG4gKiBjaGFuZ2VzIGFuZCBhcHBseSB0aGVtIHZpYSB0aGUgY29yZSBzdHlsaW5nIGluc3RydWN0aW9ucyB0aGF0IGV4aXN0IHdpdGhpbiBBbmd1bGFyLlxuICovXG5cbi8vIHVzZWQgd2hlbiB0aGUgVkUgaXMgcHJlc2VudFxuZXhwb3J0IGNvbnN0IG5nU3R5bGVEaXJlY3RpdmVEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuZXhwb3J0IGNvbnN0IG5nU3R5bGVGYWN0b3J5RGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gybXJtWRlZmluZURpcmVjdGl2ZSh7XG4gIHR5cGU6IGZ1bmN0aW9uKCkge30gYXMgYW55LFxuICBzZWxlY3RvcnM6IG51bGwgYXMgYW55LFxuICBob3N0QmluZGluZ3M6IGZ1bmN0aW9uKHJmOiDJtVJlbmRlckZsYWdzLCBjdHg6IGFueSwgZWxJbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKHJmICYgybVSZW5kZXJGbGFncy5DcmVhdGUpIHtcbiAgICAgIMm1ybVhbGxvY0hvc3RWYXJzKDEpO1xuICAgIH1cbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybXJtXN0eWxlTWFwKGN0eC5nZXRWYWx1ZSgpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWZfX1BPU1RfUjNfXyA9IGZ1bmN0aW9uKCkge307XG5cbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmID0gbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWYgPSBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXztcblxuLyoqXG4gKiBTZXJ2ZXMgYXMgdGhlIGJhc2Ugbm9uLVZFIGNvbnRhaW5lciBmb3IgTmdTdHlsZS5cbiAqXG4gKiBXaGlsZSB0aGlzIGlzIGEgYmFzZSBjbGFzcyB0aGF0IE5nU3R5bGUgZXh0ZW5kcyBmcm9tLCB0aGVcbiAqIGNsYXNzIGl0c2VsZiBhY3RzIGFzIGEgY29udGFpbmVyIGZvciBub24tVkUgY29kZSB0byBzZXR1cFxuICogYSBsaW5rIHRvIHRoZSBgW3N0eWxlXWAgaG9zdCBiaW5kaW5nICh2aWEgdGhlIHN0YXRpY1xuICogYG5nRGlyZWN0aXZlRGVmYCBwcm9wZXJ0eSBvbiB0aGUgY2xhc3MpLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgYG5nRGlyZWN0aXZlRGVmYCBwcm9wZXJ0eSdzIGNvZGUgaXMgc3dpdGNoZWRcbiAqIGRlcGVuZGluZyBpZiBWRSBpcyBwcmVzZW50IG9yIG5vdCAodGhpcyBhbGxvd3MgZm9yIHRoZVxuICogYmluZGluZyBjb2RlIHRvIGJlIHNldCBvbmx5IGZvciBuZXdlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1N0eWxlQmFzZSB7XG4gIHN0YXRpYyBuZ0RpcmVjdGl2ZURlZjogYW55ID0gbmdTdHlsZURpcmVjdGl2ZURlZjtcbiAgc3RhdGljIG5nRmFjdG9yeTogYW55ID0gbmdTdHlsZUZhY3RvcnlEZWY7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF9kZWxlZ2F0ZTogTmdTdHlsZUltcGwpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5nZXRWYWx1ZSgpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogU2V0IHRoZSBmb250IG9mIHRoZSBjb250YWluaW5nIGVsZW1lbnQgdG8gdGhlIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZUV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFNldCB0aGUgd2lkdGggb2YgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCB0byBhIHBpeGVsIHZhbHVlIHJldHVybmVkIGJ5IGFuIGV4cHJlc3Npb24uXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnbWF4LXdpZHRoLnB4Jzogd2lkdGhFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBTZXQgYSBjb2xsZWN0aW9uIG9mIHN0eWxlIHZhbHVlcyB1c2luZyBhbiBleHByZXNzaW9uIHRoYXQgcmV0dXJucyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cIm9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYXR0cmlidXRlIGRpcmVjdGl2ZSB0aGF0IHVwZGF0ZXMgc3R5bGVzIGZvciB0aGUgY29udGFpbmluZyBIVE1MIGVsZW1lbnQuXG4gKiBTZXRzIG9uZSBvciBtb3JlIHN0eWxlIHByb3BlcnRpZXMsIHNwZWNpZmllZCBhcyBjb2xvbi1zZXBhcmF0ZWQga2V5LXZhbHVlIHBhaXJzLlxuICogVGhlIGtleSBpcyBhIHN0eWxlIG5hbWUsIHdpdGggYW4gb3B0aW9uYWwgYC48dW5pdD5gIHN1ZmZpeFxuICogKHN1Y2ggYXMgJ3RvcC5weCcsICdmb250LXN0eWxlLmVtJykuXG4gKiBUaGUgdmFsdWUgaXMgYW4gZXhwcmVzc2lvbiB0byBiZSBldmFsdWF0ZWQuXG4gKiBUaGUgcmVzdWx0aW5nIG5vbi1udWxsIHZhbHVlLCBleHByZXNzZWQgaW4gdGhlIGdpdmVuIHVuaXQsXG4gKiBpcyBhc3NpZ25lZCB0byB0aGUgZ2l2ZW4gc3R5bGUgcHJvcGVydHkuXG4gKiBJZiB0aGUgcmVzdWx0IG9mIGV2YWx1YXRpb24gaXMgbnVsbCwgdGhlIGNvcnJlc3BvbmRpbmcgc3R5bGUgaXMgcmVtb3ZlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3R5bGVdJywgcHJvdmlkZXJzOiBbTmdTdHlsZUltcGxQcm92aWRlcl19KVxuZXhwb3J0IGNsYXNzIE5nU3R5bGUgZXh0ZW5kcyBOZ1N0eWxlQmFzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZTogTmdTdHlsZUltcGwpIHsgc3VwZXIoZGVsZWdhdGUpOyB9XG5cbiAgQElucHV0KCduZ1N0eWxlJylcbiAgc2V0IG5nU3R5bGUodmFsdWU6IHtba2xhc3M6IHN0cmluZ106IGFueX18bnVsbCkgeyB0aGlzLl9kZWxlZ2F0ZS5zZXROZ1N0eWxlKHZhbHVlKTsgfVxuXG4gIG5nRG9DaGVjaygpIHsgdGhpcy5fZGVsZWdhdGUuYXBwbHlDaGFuZ2VzKCk7IH1cbn1cbiJdfQ==