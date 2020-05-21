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
let NgStyle = /** @class */ (() => {
    class NgStyle {
        constructor(_ngEl, _differs, _renderer) {
            this._ngEl = _ngEl;
            this._differs = _differs;
            this._renderer = _renderer;
            this._ngStyle = null;
            this._differ = null;
        }
        set ngStyle(values) {
            this._ngStyle = values;
            if (!this._differ && values) {
                this._differ = this._differs.find(values).create();
            }
        }
        ngDoCheck() {
            if (this._differ) {
                const changes = this._differ.diff(this._ngStyle);
                if (changes) {
                    this._applyChanges(changes);
                }
            }
        }
        _setStyle(nameAndUnit, value) {
            const [name, unit] = nameAndUnit.split('.');
            value = value != null && unit ? `${value}${unit}` : value;
            if (value != null) {
                this._renderer.setStyle(this._ngEl.nativeElement, name, value);
            }
            else {
                this._renderer.removeStyle(this._ngEl.nativeElement, name);
            }
        }
        _applyChanges(changes) {
            changes.forEachRemovedItem((record) => this._setStyle(record.key, null));
            changes.forEachAddedItem((record) => this._setStyle(record.key, record.currentValue));
            changes.forEachChangedItem((record) => this._setStyle(record.key, record.currentValue));
        }
    }
    NgStyle.ɵfac = function NgStyle_Factory(t) { return new (t || NgStyle)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.KeyValueDiffers), i0.ɵɵdirectiveInject(i0.Renderer2)); };
    NgStyle.ɵdir = i0.ɵɵdefineDirective({ type: NgStyle, selectors: [["", "ngStyle", ""]], inputs: { ngStyle: "ngStyle" } });
    return NgStyle;
})();
export { NgStyle };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgStyle, [{
        type: Directive,
        args: [{ selector: '[ngStyle]' }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.KeyValueDiffers }, { type: i0.Renderer2 }]; }, { ngStyle: [{
            type: Input,
            args: ['ngStyle']
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsS0FBSyxFQUFtQyxlQUFlLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUdqSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQ0c7QUFDSDtJQUFBLE1BQ2EsT0FBTztRQUlsQixZQUNZLEtBQWlCLEVBQVUsUUFBeUIsRUFBVSxTQUFvQjtZQUFsRixVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFXO1lBSnRGLGFBQVEsR0FBaUMsSUFBSSxDQUFDO1lBQzlDLFlBQU8sR0FBK0MsSUFBSSxDQUFDO1FBRzhCLENBQUM7UUFFbEcsSUFDSSxPQUFPLENBQUMsTUFBbUM7WUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxFQUFFO2dCQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3BEO1FBQ0gsQ0FBQztRQUVELFNBQVM7WUFDUCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFTLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDN0I7YUFDRjtRQUNILENBQUM7UUFFTyxTQUFTLENBQUMsV0FBbUIsRUFBRSxLQUFtQztZQUN4RSxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBRTFELElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtnQkFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQWUsQ0FBQyxDQUFDO2FBQzFFO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzVEO1FBQ0gsQ0FBQztRQUVPLGFBQWEsQ0FBQyxPQUErQztZQUNuRSxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7O2tFQXZDVSxPQUFPO2dEQUFQLE9BQU87a0JBL0NwQjtLQXVGQztTQXhDWSxPQUFPO2tEQUFQLE9BQU87Y0FEbkIsU0FBUztlQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBQzs7a0JBUS9CLEtBQUs7bUJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBJbnB1dCwgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogU2V0IHRoZSBmb250IG9mIHRoZSBjb250YWluaW5nIGVsZW1lbnQgdG8gdGhlIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uLlxuICpcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdTdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZUV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFNldCB0aGUgd2lkdGggb2YgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCB0byBhIHBpeGVsIHZhbHVlIHJldHVybmVkIGJ5IGFuIGV4cHJlc3Npb24uXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnbWF4LXdpZHRoLnB4Jzogd2lkdGhFeHB9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBTZXQgYSBjb2xsZWN0aW9uIG9mIHN0eWxlIHZhbHVlcyB1c2luZyBhbiBleHByZXNzaW9uIHRoYXQgcmV0dXJucyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cIm9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYXR0cmlidXRlIGRpcmVjdGl2ZSB0aGF0IHVwZGF0ZXMgc3R5bGVzIGZvciB0aGUgY29udGFpbmluZyBIVE1MIGVsZW1lbnQuXG4gKiBTZXRzIG9uZSBvciBtb3JlIHN0eWxlIHByb3BlcnRpZXMsIHNwZWNpZmllZCBhcyBjb2xvbi1zZXBhcmF0ZWQga2V5LXZhbHVlIHBhaXJzLlxuICogVGhlIGtleSBpcyBhIHN0eWxlIG5hbWUsIHdpdGggYW4gb3B0aW9uYWwgYC48dW5pdD5gIHN1ZmZpeFxuICogKHN1Y2ggYXMgJ3RvcC5weCcsICdmb250LXN0eWxlLmVtJykuXG4gKiBUaGUgdmFsdWUgaXMgYW4gZXhwcmVzc2lvbiB0byBiZSBldmFsdWF0ZWQuXG4gKiBUaGUgcmVzdWx0aW5nIG5vbi1udWxsIHZhbHVlLCBleHByZXNzZWQgaW4gdGhlIGdpdmVuIHVuaXQsXG4gKiBpcyBhc3NpZ25lZCB0byB0aGUgZ2l2ZW4gc3R5bGUgcHJvcGVydHkuXG4gKiBJZiB0aGUgcmVzdWx0IG9mIGV2YWx1YXRpb24gaXMgbnVsbCwgdGhlIGNvcnJlc3BvbmRpbmcgc3R5bGUgaXMgcmVtb3ZlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3R5bGVdJ30pXG5leHBvcnQgY2xhc3MgTmdTdHlsZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIF9uZ1N0eWxlOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfXxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBLZXlWYWx1ZURpZmZlcjxzdHJpbmcsIHN0cmluZ3xudW1iZXI+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyKSB7fVxuXG4gIEBJbnB1dCgnbmdTdHlsZScpXG4gIHNldCBuZ1N0eWxlKHZhbHVlczoge1trbGFzczogc3RyaW5nXTogYW55fXxudWxsKSB7XG4gICAgdGhpcy5fbmdTdHlsZSA9IHZhbHVlcztcbiAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZXMpIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZXMpLmNyZWF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdTdHlsZSEpO1xuICAgICAgaWYgKGNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFN0eWxlKG5hbWVBbmRVbml0OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd8bnVtYmVyfG51bGx8dW5kZWZpbmVkKTogdm9pZCB7XG4gICAgY29uc3QgW25hbWUsIHVuaXRdID0gbmFtZUFuZFVuaXQuc3BsaXQoJy4nKTtcbiAgICB2YWx1ZSA9IHZhbHVlICE9IG51bGwgJiYgdW5pdCA/IGAke3ZhbHVlfSR7dW5pdH1gIDogdmFsdWU7XG5cbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBuYW1lLCB2YWx1ZSBhcyBzdHJpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBLZXlWYWx1ZUNoYW5nZXM8c3RyaW5nLCBzdHJpbmd8bnVtYmVyPik6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIG51bGwpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgfVxufVxuIl19