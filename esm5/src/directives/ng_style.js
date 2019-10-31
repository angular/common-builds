import { __decorate, __extends, __metadata } from "tslib";
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
        ɵɵallocHostVars(2);
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
 * `ɵdir` property on the class).
 *
 * Note that the `ɵdir` property's code is switched
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
    NgStyleBase.ɵdir = ngStyleDirectiveDef;
    NgStyleBase.ɵfac = ngStyleFactoryDef;
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
    __extends(NgStyle, _super);
    function NgStyle(delegate) {
        return _super.call(this, delegate) || this;
    }
    Object.defineProperty(NgStyle.prototype, "ngStyle", {
        set: function (value) { this._delegate.setNgStyle(value); },
        enumerable: true,
        configurable: true
    });
    NgStyle.prototype.ngDoCheck = function () { this._delegate.applyChanges(); };
    __decorate([
        Input('ngStyle'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], NgStyle.prototype, "ngStyle", null);
    NgStyle = __decorate([
        Directive({ selector: '[ngStyle]', providers: [NgStyleImplProvider] }),
        __metadata("design:paramtypes", [NgStyleImpl])
    ], NgStyle);
    return NgStyle;
}(NgStyleBase));
export { NgStyle };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFnQixlQUFlLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRILE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUlqRTs7Ozs7Ozs7OztHQVVHO0FBRUgsOEJBQThCO0FBQzlCLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztBQUN2RCxNQUFNLENBQUMsSUFBTSwyQkFBMkIsR0FBRyxTQUFTLENBQUM7U0FNN0MsY0FBWSxDQUFDLE9BRUwsVUFBUyxFQUFnQixFQUFFLEdBQVEsRUFBRSxPQUFlO0lBQ2hFLElBQUksRUFBRSxpQkFBc0IsRUFBRTtRQUM1QixlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEI7SUFDRCxJQUFJLEVBQUUsaUJBQXNCLEVBQUU7UUFDNUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQzVCO0FBQ0gsQ0FBQztBQWJILDJEQUEyRDtBQUMzRCwwREFBMEQ7QUFDMUQsY0FBYztBQUNkLE1BQU0sQ0FBQyxJQUFNLDhCQUE4QixHQUFHLGlCQUFpQixDQUFDO0lBQzlELElBQUksRUFBRSxFQUFvQjtJQUMxQixTQUFTLEVBQUUsSUFBVztJQUN0QixZQUFZLElBT1g7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsSUFBTSw0QkFBNEIsR0FBRyxjQUFZLENBQUMsQ0FBQztBQUUxRCxNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FBRyw2QkFBNkIsQ0FBQztBQUNqRSxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyw2QkFBNkIsQ0FBQztBQUUvRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0g7SUFJRSxxQkFBc0IsU0FBc0I7UUFBdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtJQUFHLENBQUM7SUFFaEQsOEJBQVEsR0FBUixjQUFhLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFMekMsZ0JBQUksR0FBUSxtQkFBbUIsQ0FBQztJQUNoQyxnQkFBSSxHQUFRLGlCQUFpQixDQUFDO0lBS3ZDLGtCQUFDO0NBQUEsQUFQRCxJQU9DO1NBUFksV0FBVztBQVN4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQ0c7QUFFSDtJQUE2QiwyQkFBVztJQUN0QyxpQkFBWSxRQUFxQjtlQUFJLGtCQUFNLFFBQVEsQ0FBQztJQUFFLENBQUM7SUFHdkQsc0JBQUksNEJBQU87YUFBWCxVQUFZLEtBQWtDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVyRiwyQkFBUyxHQUFULGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFGOUM7UUFEQyxLQUFLLENBQUMsU0FBUyxDQUFDOzs7MENBQ29FO0lBSjFFLE9BQU87UUFEbkIsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLENBQUM7eUNBRTdDLFdBQVc7T0FEdEIsT0FBTyxDQU9uQjtJQUFELGNBQUM7Q0FBQSxBQVBELENBQTZCLFdBQVcsR0FPdkM7U0FQWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIElucHV0LCDJtVJlbmRlckZsYWdzLCDJtcm1YWxsb2NIb3N0VmFycywgybXJtWRlZmluZURpcmVjdGl2ZSwgybXJtXN0eWxlTWFwfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtOZ1N0eWxlSW1wbCwgTmdTdHlsZUltcGxQcm92aWRlcn0gZnJvbSAnLi9uZ19zdHlsZV9pbXBsJztcblxuXG5cbi8qXG4gKiBOZ1N0eWxlIChhcyB3ZWxsIGFzIE5nQ2xhc3MpIGJlaGF2ZXMgZGlmZmVyZW50bHkgd2hlbiBsb2FkZWQgaW4gdGhlIFZFIGFuZCB3aGVuIG5vdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgcHJlc2VudCAod2hpY2ggaXMgZm9yIG9sZGVyIHZlcnNpb25zIG9mIEFuZ3VsYXIpIHRoZW4gTmdTdHlsZSB3aWxsIGluamVjdFxuICogdGhlIGxlZ2FjeSBkaWZmaW5nIGFsZ29yaXRobSBhcyBhIHNlcnZpY2UgYW5kIGRlbGVnYXRlIGFsbCBzdHlsaW5nIGNoYW5nZXMgdG8gdGhhdC5cbiAqXG4gKiBJZiB0aGUgVkUgaXMgbm90IHByZXNlbnQgdGhlbiBOZ1N0eWxlIHdpbGwgbm9ybWFsaXplICh0aHJvdWdoIHRoZSBpbmplY3RlZCBzZXJ2aWNlKSBhbmRcbiAqIHRoZW4gd3JpdGUgYWxsIHN0eWxpbmcgY2hhbmdlcyB0byB0aGUgYFtzdHlsZV1gIGJpbmRpbmcgZGlyZWN0bHkgKHRocm91Z2ggYSBob3N0IGJpbmRpbmcpLlxuICogVGhlbiBBbmd1bGFyIHdpbGwgbm90aWNlIHRoZSBob3N0IGJpbmRpbmcgY2hhbmdlIGFuZCB0cmVhdCB0aGUgY2hhbmdlcyBhcyBzdHlsaW5nXG4gKiBjaGFuZ2VzIGFuZCBhcHBseSB0aGVtIHZpYSB0aGUgY29yZSBzdHlsaW5nIGluc3RydWN0aW9ucyB0aGF0IGV4aXN0IHdpdGhpbiBBbmd1bGFyLlxuICovXG5cbi8vIHVzZWQgd2hlbiB0aGUgVkUgaXMgcHJlc2VudFxuZXhwb3J0IGNvbnN0IG5nU3R5bGVEaXJlY3RpdmVEZWZfX1BSRV9SM19fID0gdW5kZWZpbmVkO1xuZXhwb3J0IGNvbnN0IG5nU3R5bGVGYWN0b3J5RGVmX19QUkVfUjNfXyA9IHVuZGVmaW5lZDtcblxuLy8gdXNlZCB3aGVuIHRoZSBWRSBpcyBub3QgcHJlc2VudCAobm90ZSB0aGUgZGlyZWN0aXZlIHdpbGxcbi8vIG5ldmVyIGJlIGluc3RhbnRpYXRlZCBub3JtYWxseSBiZWNhdXNlIGl0IGlzIGFwYXJ0IG9mIGFcbi8vIGJhc2UgY2xhc3MpXG5leHBvcnQgY29uc3QgbmdTdHlsZURpcmVjdGl2ZURlZl9fUE9TVF9SM19fID0gybXJtWRlZmluZURpcmVjdGl2ZSh7XG4gIHR5cGU6IGZ1bmN0aW9uKCkge30gYXMgYW55LFxuICBzZWxlY3RvcnM6IG51bGwgYXMgYW55LFxuICBob3N0QmluZGluZ3M6IGZ1bmN0aW9uKHJmOiDJtVJlbmRlckZsYWdzLCBjdHg6IGFueSwgZWxJbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKHJmICYgybVSZW5kZXJGbGFncy5DcmVhdGUpIHtcbiAgICAgIMm1ybVhbGxvY0hvc3RWYXJzKDIpO1xuICAgIH1cbiAgICBpZiAocmYgJiDJtVJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICAgICAgybXJtXN0eWxlTWFwKGN0eC5nZXRWYWx1ZSgpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWZfX1BPU1RfUjNfXyA9IGZ1bmN0aW9uKCkge307XG5cbmV4cG9ydCBjb25zdCBuZ1N0eWxlRGlyZWN0aXZlRGVmID0gbmdTdHlsZURpcmVjdGl2ZURlZl9fUFJFX1IzX187XG5leHBvcnQgY29uc3QgbmdTdHlsZUZhY3RvcnlEZWYgPSBuZ1N0eWxlRGlyZWN0aXZlRGVmX19QUkVfUjNfXztcblxuLyoqXG4gKiBTZXJ2ZXMgYXMgdGhlIGJhc2Ugbm9uLVZFIGNvbnRhaW5lciBmb3IgTmdTdHlsZS5cbiAqXG4gKiBXaGlsZSB0aGlzIGlzIGEgYmFzZSBjbGFzcyB0aGF0IE5nU3R5bGUgZXh0ZW5kcyBmcm9tLCB0aGVcbiAqIGNsYXNzIGl0c2VsZiBhY3RzIGFzIGEgY29udGFpbmVyIGZvciBub24tVkUgY29kZSB0byBzZXR1cFxuICogYSBsaW5rIHRvIHRoZSBgW3N0eWxlXWAgaG9zdCBiaW5kaW5nICh2aWEgdGhlIHN0YXRpY1xuICogYMm1ZGlyYCBwcm9wZXJ0eSBvbiB0aGUgY2xhc3MpLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgYMm1ZGlyYCBwcm9wZXJ0eSdzIGNvZGUgaXMgc3dpdGNoZWRcbiAqIGRlcGVuZGluZyBpZiBWRSBpcyBwcmVzZW50IG9yIG5vdCAodGhpcyBhbGxvd3MgZm9yIHRoZVxuICogYmluZGluZyBjb2RlIHRvIGJlIHNldCBvbmx5IGZvciBuZXdlciB2ZXJzaW9ucyBvZiBBbmd1bGFyKS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1N0eWxlQmFzZSB7XG4gIHN0YXRpYyDJtWRpcjogYW55ID0gbmdTdHlsZURpcmVjdGl2ZURlZjtcbiAgc3RhdGljIMm1ZmFjOiBhbnkgPSBuZ1N0eWxlRmFjdG9yeURlZjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2RlbGVnYXRlOiBOZ1N0eWxlSW1wbCkge31cblxuICBnZXRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLmdldFZhbHVlKCk7IH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBTZXQgdGhlIGZvbnQgb2YgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCB0byB0aGUgcmVzdWx0IG9mIGFuIGV4cHJlc3Npb24uXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogU2V0IHRoZSB3aWR0aCBvZiB0aGUgY29udGFpbmluZyBlbGVtZW50IHRvIGEgcGl4ZWwgdmFsdWUgcmV0dXJuZWQgYnkgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydtYXgtd2lkdGgucHgnOiB3aWR0aEV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFNldCBhIGNvbGxlY3Rpb24gb2Ygc3R5bGUgdmFsdWVzIHVzaW5nIGFuIGV4cHJlc3Npb24gdGhhdCByZXR1cm5zIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwib2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHRoYXQgdXBkYXRlcyBzdHlsZXMgZm9yIHRoZSBjb250YWluaW5nIEhUTUwgZWxlbWVudC5cbiAqIFNldHMgb25lIG9yIG1vcmUgc3R5bGUgcHJvcGVydGllcywgc3BlY2lmaWVkIGFzIGNvbG9uLXNlcGFyYXRlZCBrZXktdmFsdWUgcGFpcnMuXG4gKiBUaGUga2V5IGlzIGEgc3R5bGUgbmFtZSwgd2l0aCBhbiBvcHRpb25hbCBgLjx1bml0PmAgc3VmZml4XG4gKiAoc3VjaCBhcyAndG9wLnB4JywgJ2ZvbnQtc3R5bGUuZW0nKS5cbiAqIFRoZSB2YWx1ZSBpcyBhbiBleHByZXNzaW9uIHRvIGJlIGV2YWx1YXRlZC5cbiAqIFRoZSByZXN1bHRpbmcgbm9uLW51bGwgdmFsdWUsIGV4cHJlc3NlZCBpbiB0aGUgZ2l2ZW4gdW5pdCxcbiAqIGlzIGFzc2lnbmVkIHRvIHRoZSBnaXZlbiBzdHlsZSBwcm9wZXJ0eS5cbiAqIElmIHRoZSByZXN1bHQgb2YgZXZhbHVhdGlvbiBpcyBudWxsLCB0aGUgY29ycmVzcG9uZGluZyBzdHlsZSBpcyByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTdHlsZV0nLCBwcm92aWRlcnM6IFtOZ1N0eWxlSW1wbFByb3ZpZGVyXX0pXG5leHBvcnQgY2xhc3MgTmdTdHlsZSBleHRlbmRzIE5nU3R5bGVCYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIGNvbnN0cnVjdG9yKGRlbGVnYXRlOiBOZ1N0eWxlSW1wbCkgeyBzdXBlcihkZWxlZ2F0ZSk7IH1cblxuICBASW5wdXQoJ25nU3R5bGUnKVxuICBzZXQgbmdTdHlsZSh2YWx1ZToge1trbGFzczogc3RyaW5nXTogYW55fXxudWxsKSB7IHRoaXMuX2RlbGVnYXRlLnNldE5nU3R5bGUodmFsdWUpOyB9XG5cbiAgbmdEb0NoZWNrKCkgeyB0aGlzLl9kZWxlZ2F0ZS5hcHBseUNoYW5nZXMoKTsgfVxufVxuIl19