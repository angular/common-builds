import * as tslib_1 from "tslib";
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, KeyValueDiffers, Renderer2 } from '@angular/core';
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 *
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 *
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * Update an HTML element styles.
 *
 * The styles are updated according to the value of the expression evaluation:
 * - keys are style names with an optional `.<unit>` suffix (ie 'top.px', 'font-style.em'),
 * - values are the values assigned to those properties (expressed in the given unit).
 *
 *
 */
var NgStyle = /** @class */ (function () {
    function NgStyle(_differs, _ngEl, _renderer) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
    }
    Object.defineProperty(NgStyle.prototype, "ngStyle", {
        set: function (v) {
            this._ngStyle = v;
            if (!this._differ && v) {
                this._differ = this._differs.find(v).create();
            }
        },
        enumerable: true,
        configurable: true
    });
    NgStyle.prototype.ngDoCheck = function () {
        if (this._differ) {
            var changes = this._differ.diff(this._ngStyle);
            if (changes) {
                this._applyChanges(changes);
            }
        }
    };
    NgStyle.prototype._applyChanges = function (changes) {
        var _this = this;
        changes.forEachRemovedItem(function (record) { return _this._setStyle(record.key, null); });
        changes.forEachAddedItem(function (record) { return _this._setStyle(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { return _this._setStyle(record.key, record.currentValue); });
    };
    NgStyle.prototype._setStyle = function (nameAndUnit, value) {
        var _a = tslib_1.__read(nameAndUnit.split('.'), 2), name = _a[0], unit = _a[1];
        value = value != null && unit ? "" + value + unit : value;
        if (value != null) {
            this._renderer.setStyle(this._ngEl.nativeElement, name, value);
        }
        else {
            this._renderer.removeStyle(this._ngEl.nativeElement, name);
        }
    };
    NgStyle.ngDirectiveDef = i0.ɵdefineDirective({ type: NgStyle, selectors: [["", "ngStyle", ""]], factory: function NgStyle_Factory() { return new NgStyle(i0.ɵdirectiveInject(KeyValueDiffers), i0.ɵinjectElementRef(), i0.ɵdirectiveInject(Renderer2)); }, inputs: { ngStyle: "ngStyle" } });
    return NgStyle;
}());
export { NgStyle };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBRSxLQUFLLEVBQW1DLGVBQWUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFakk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNIO0lBT0UsaUJBQ1ksUUFBeUIsRUFBVSxLQUFpQixFQUFVLFNBQW9CO1FBQWxGLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDO0lBRWxHLHNCQUNJLDRCQUFPO2FBRFgsVUFDWSxDQUEwQjtZQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDL0M7UUFDSCxDQUFDOzs7T0FBQTtJQUVELDJCQUFTLEdBQVQ7UUFDRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pELElBQUksT0FBTyxFQUFFO2dCQUNYLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7SUFFTywrQkFBYSxHQUFyQixVQUFzQixPQUErQztRQUFyRSxpQkFJQztRQUhDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQS9DLENBQStDLENBQUMsQ0FBQztRQUN0RixPQUFPLENBQUMsa0JBQWtCLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVPLDJCQUFTLEdBQWpCLFVBQWtCLFdBQW1CLEVBQUUsS0FBbUM7UUFDbEUsSUFBQSw4Q0FBcUMsRUFBcEMsWUFBSSxFQUFFLFlBQUksQ0FBMkI7UUFDNUMsS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFHLEtBQUssR0FBRyxJQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUUxRCxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQWUsQ0FBQyxDQUFDO1NBQzFFO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM1RDtJQUNILENBQUM7eURBekNVLE9BQU8scUZBQVAsT0FBTyxxQkFPSSxlQUFlLCtDQUFnRCxTQUFTO2tCQXhDaEc7Q0EyRUMsQUEzQ0QsSUEyQ0M7U0ExQ1ksT0FBTyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEVsZW1lbnRSZWYsIElucHV0LCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlcnMsIFJlbmRlcmVyMn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGVFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J21heC13aWR0aC5weCc6IHdpZHRoRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwib2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVcGRhdGUgYW4gSFRNTCBlbGVtZW50IHN0eWxlcy5cbiAqXG4gKiBUaGUgc3R5bGVzIGFyZSB1cGRhdGVkIGFjY29yZGluZyB0byB0aGUgdmFsdWUgb2YgdGhlIGV4cHJlc3Npb24gZXZhbHVhdGlvbjpcbiAqIC0ga2V5cyBhcmUgc3R5bGUgbmFtZXMgd2l0aCBhbiBvcHRpb25hbCBgLjx1bml0PmAgc3VmZml4IChpZSAndG9wLnB4JywgJ2ZvbnQtc3R5bGUuZW0nKSxcbiAqIC0gdmFsdWVzIGFyZSB0aGUgdmFsdWVzIGFzc2lnbmVkIHRvIHRob3NlIHByb3BlcnRpZXMgKGV4cHJlc3NlZCBpbiB0aGUgZ2l2ZW4gdW5pdCkuXG4gKlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTdHlsZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9uZ1N0eWxlICE6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZGlmZmVyICE6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgc3RyaW5nfG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9kaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nU3R5bGUodjoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHtcbiAgICB0aGlzLl9uZ1N0eWxlID0gdjtcbiAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2KSB7XG4gICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodikuY3JlYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmICh0aGlzLl9kaWZmZXIpIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9uZ1N0eWxlKTtcbiAgICAgIGlmIChjaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogS2V5VmFsdWVDaGFuZ2VzPHN0cmluZywgc3RyaW5nfG51bWJlcj4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCBudWxsKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gIH1cblxuICBwcml2YXRlIF9zZXRTdHlsZShuYW1lQW5kVW5pdDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfG51bWJlcnxudWxsfHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGNvbnN0IFtuYW1lLCB1bml0XSA9IG5hbWVBbmRVbml0LnNwbGl0KCcuJyk7XG4gICAgdmFsdWUgPSB2YWx1ZSAhPSBudWxsICYmIHVuaXQgPyBgJHt2YWx1ZX0ke3VuaXR9YCA6IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgbmFtZSwgdmFsdWUgYXMgc3RyaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlU3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBuYW1lKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==