import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, KeyValueDiffers, Renderer2 } from '@angular/core';
import * as i0 from "@angular/core";
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
 * @publicApi
 */
var NgStyle = /** @class */ (function () {
    function NgStyle(_differs, _ngEl, _renderer) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
    }
    Object.defineProperty(NgStyle.prototype, "ngStyle", {
        set: function (values) {
            this._ngStyle = values;
            if (!this._differ && values) {
                this._differ = this._differs.find(values).create();
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
    NgStyle.ngDirectiveDef = i0.ɵdefineDirective({ type: NgStyle, selectors: [["", "ngStyle", ""]], factory: function NgStyle_Factory(t) { return new (t || NgStyle)(i0.ɵdirectiveInject(KeyValueDiffers), i0.ɵdirectiveInject(ElementRef), i0.ɵdirectiveInject(Renderer2)); }, inputs: { ngStyle: "ngStyle" } });
    return NgStyle;
}());
export { NgStyle };
/*@__PURE__*/ i0.ɵsetClassMetadata(NgStyle, [{
        type: Directive,
        args: [{ selector: '[ngStyle]' }]
    }], [{
        type: KeyValueDiffers
    }, {
        type: ElementRef
    }, {
        type: Renderer2
    }], { ngStyle: [{
            type: Input
        }] });

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFFLEtBQUssRUFBbUMsZUFBZSxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFakk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNIO0lBT0UsaUJBQ1ksUUFBeUIsRUFBVSxLQUFpQixFQUFVLFNBQW9CO1FBQWxGLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDO0lBRWxHLHNCQUNJLDRCQUFPO2FBRFgsVUFDWSxNQUErQjtZQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDcEQ7UUFDSCxDQUFDOzs7T0FBQTtJQUVELDJCQUFTLEdBQVQ7UUFDRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pELElBQUksT0FBTyxFQUFFO2dCQUNYLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7SUFFTywrQkFBYSxHQUFyQixVQUFzQixPQUErQztRQUFyRSxpQkFJQztRQUhDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQS9DLENBQStDLENBQUMsQ0FBQztRQUN0RixPQUFPLENBQUMsa0JBQWtCLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVPLDJCQUFTLEdBQWpCLFVBQWtCLFdBQW1CLEVBQUUsS0FBbUM7UUFDbEUsSUFBQSw4Q0FBcUMsRUFBcEMsWUFBSSxFQUFFLFlBQThCLENBQUM7UUFDNUMsS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFHLEtBQUssR0FBRyxJQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUUxRCxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQWUsQ0FBQyxDQUFDO1NBQzFFO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM1RDtJQUNILENBQUM7eURBekNVLE9BQU8sNEZBQVAsT0FBTyxzQkFPSSxlQUFlLHVCQUFpQixVQUFVLHVCQUFxQixTQUFTO2tCQXhDaEc7Q0EyRUMsQUEzQ0QsSUEyQ0M7U0ExQ1ksT0FBTzttQ0FBUCxPQUFPO2NBRG5CLFNBQVM7ZUFBQyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUM7O2NBUVYsZUFBZTs7Y0FBaUIsVUFBVTs7Y0FBcUIsU0FBUzs7a0JBRTdGLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBJbnB1dCwgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydtYXgtd2lkdGgucHgnOiB3aWR0aEV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cIm9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVXBkYXRlIGFuIEhUTUwgZWxlbWVudCBzdHlsZXMuXG4gKlxuICogVGhlIHN0eWxlcyBhcmUgdXBkYXRlZCBhY2NvcmRpbmcgdG8gdGhlIHZhbHVlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGtleXMgYXJlIHN0eWxlIG5hbWVzIHdpdGggYW4gb3B0aW9uYWwgYC48dW5pdD5gIHN1ZmZpeCAoaWUgJ3RvcC5weCcsICdmb250LXN0eWxlLmVtJyksXG4gKiAtIHZhbHVlcyBhcmUgdGhlIHZhbHVlcyBhc3NpZ25lZCB0byB0aG9zZSBwcm9wZXJ0aWVzIChleHByZXNzZWQgaW4gdGhlIGdpdmVuIHVuaXQpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTdHlsZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9uZ1N0eWxlICE6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZGlmZmVyICE6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgc3RyaW5nfG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9kaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nU3R5bGUodmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuX25nU3R5bGUgPSB2YWx1ZXM7XG4gICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWVzKSB7XG4gICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWVzKS5jcmVhdGUoKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKHRoaXMuX2RpZmZlcikge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nU3R5bGUpO1xuICAgICAgaWYgKGNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBLZXlWYWx1ZUNoYW5nZXM8c3RyaW5nLCBzdHJpbmd8bnVtYmVyPik6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIG51bGwpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFN0eWxlKG5hbWVBbmRVbml0OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd8bnVtYmVyfG51bGx8dW5kZWZpbmVkKTogdm9pZCB7XG4gICAgY29uc3QgW25hbWUsIHVuaXRdID0gbmFtZUFuZFVuaXQuc3BsaXQoJy4nKTtcbiAgICB2YWx1ZSA9IHZhbHVlICE9IG51bGwgJiYgdW5pdCA/IGAke3ZhbHVlfSR7dW5pdH1gIDogdmFsdWU7XG5cbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBuYW1lLCB2YWx1ZSBhcyBzdHJpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUpO1xuICAgIH1cbiAgfVxufVxuIl19