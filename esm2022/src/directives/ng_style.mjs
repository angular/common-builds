/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, KeyValueDiffers, Renderer2, RendererStyleFlags2, } from '@angular/core';
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
export class NgStyle {
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
        const flags = name.indexOf('-') === -1 ? undefined : RendererStyleFlags2.DashCase;
        if (value != null) {
            this._renderer.setStyle(this._ngEl.nativeElement, name, unit ? `${value}${unit}` : value, flags);
        }
        else {
            this._renderer.removeStyle(this._ngEl.nativeElement, name, flags);
        }
    }
    _applyChanges(changes) {
        changes.forEachRemovedItem((record) => this._setStyle(record.key, null));
        changes.forEachAddedItem((record) => this._setStyle(record.key, record.currentValue));
        changes.forEachChangedItem((record) => this._setStyle(record.key, record.currentValue));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgStyle, deps: [{ token: i0.ElementRef }, { token: i0.KeyValueDiffers }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", type: NgStyle, isStandalone: true, selector: "[ngStyle]", inputs: { ngStyle: "ngStyle" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgStyle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngStyle]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.KeyValueDiffers }, { type: i0.Renderer2 }], propDecorators: { ngStyle: [{
                type: Input,
                args: ['ngStyle']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUNMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsS0FBSyxFQUdMLGVBQWUsRUFDZixTQUFTLEVBQ1QsbUJBQW1CLEdBQ3BCLE1BQU0sZUFBZSxDQUFDOztBQUV2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQ0c7QUFLSCxNQUFNLE9BQU8sT0FBTztJQUlsQixZQUNVLEtBQWlCLEVBQ2pCLFFBQXlCLEVBQ3pCLFNBQW9CO1FBRnBCLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDakIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFDekIsY0FBUyxHQUFULFNBQVMsQ0FBVztRQU50QixhQUFRLEdBQStDLElBQUksQ0FBQztRQUM1RCxZQUFPLEdBQW1ELElBQUksQ0FBQztJQU1wRSxDQUFDO0lBRUosSUFDSSxPQUFPLENBQUMsTUFBaUQ7UUFDM0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNyRCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVM7UUFDUCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUyxDQUFDLENBQUM7WUFDbEQsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDWixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLFNBQVMsQ0FBQyxXQUFtQixFQUFFLEtBQXlDO1FBQzlFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFFLG1CQUFtQixDQUFDLFFBQW1CLENBQUM7UUFFOUYsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUN4QixJQUFJLEVBQ0osSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUNoQyxLQUFLLENBQ04sQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BFLENBQUM7SUFDSCxDQUFDO0lBRU8sYUFBYSxDQUFDLE9BQWlEO1FBQ3JFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDdEYsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQzt5SEEvQ1UsT0FBTzs2R0FBUCxPQUFPOztzR0FBUCxPQUFPO2tCQUpuQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxXQUFXO29CQUNyQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7cUlBWUssT0FBTztzQkFEVixLQUFLO3VCQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgSW5wdXQsXG4gIEtleVZhbHVlQ2hhbmdlcyxcbiAgS2V5VmFsdWVEaWZmZXIsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgUmVuZGVyZXIyLFxuICBSZW5kZXJlclN0eWxlRmxhZ3MyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBTZXQgdGhlIGZvbnQgb2YgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCB0byB0aGUgcmVzdWx0IG9mIGFuIGV4cHJlc3Npb24uXG4gKlxuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlRXhwfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogU2V0IHRoZSB3aWR0aCBvZiB0aGUgY29udGFpbmluZyBlbGVtZW50IHRvIGEgcGl4ZWwgdmFsdWUgcmV0dXJuZWQgYnkgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwieydtYXgtd2lkdGgucHgnOiB3aWR0aEV4cH1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFNldCBhIGNvbGxlY3Rpb24gb2Ygc3R5bGUgdmFsdWVzIHVzaW5nIGFuIGV4cHJlc3Npb24gdGhhdCByZXR1cm5zIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nU3R5bGVdPVwib2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHRoYXQgdXBkYXRlcyBzdHlsZXMgZm9yIHRoZSBjb250YWluaW5nIEhUTUwgZWxlbWVudC5cbiAqIFNldHMgb25lIG9yIG1vcmUgc3R5bGUgcHJvcGVydGllcywgc3BlY2lmaWVkIGFzIGNvbG9uLXNlcGFyYXRlZCBrZXktdmFsdWUgcGFpcnMuXG4gKiBUaGUga2V5IGlzIGEgc3R5bGUgbmFtZSwgd2l0aCBhbiBvcHRpb25hbCBgLjx1bml0PmAgc3VmZml4XG4gKiAoc3VjaCBhcyAndG9wLnB4JywgJ2ZvbnQtc3R5bGUuZW0nKS5cbiAqIFRoZSB2YWx1ZSBpcyBhbiBleHByZXNzaW9uIHRvIGJlIGV2YWx1YXRlZC5cbiAqIFRoZSByZXN1bHRpbmcgbm9uLW51bGwgdmFsdWUsIGV4cHJlc3NlZCBpbiB0aGUgZ2l2ZW4gdW5pdCxcbiAqIGlzIGFzc2lnbmVkIHRvIHRoZSBnaXZlbiBzdHlsZSBwcm9wZXJ0eS5cbiAqIElmIHRoZSByZXN1bHQgb2YgZXZhbHVhdGlvbiBpcyBudWxsLCB0aGUgY29ycmVzcG9uZGluZyBzdHlsZSBpcyByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nU3R5bGVdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdTdHlsZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIF9uZ1N0eWxlOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB8IG51bGwgfCB1bmRlZmluZWQgPSBudWxsO1xuICBwcml2YXRlIF9kaWZmZXI6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSBfZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICkge31cblxuICBASW5wdXQoJ25nU3R5bGUnKVxuICBzZXQgbmdTdHlsZSh2YWx1ZXM6IHtba2xhc3M6IHN0cmluZ106IGFueX0gfCBudWxsIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fbmdTdHlsZSA9IHZhbHVlcztcbiAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZXMpIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZXMpLmNyZWF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdTdHlsZSEpO1xuICAgICAgaWYgKGNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFN0eWxlKG5hbWVBbmRVbml0OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgY29uc3QgW25hbWUsIHVuaXRdID0gbmFtZUFuZFVuaXQuc3BsaXQoJy4nKTtcbiAgICBjb25zdCBmbGFncyA9IG5hbWUuaW5kZXhPZignLScpID09PSAtMSA/IHVuZGVmaW5lZCA6IChSZW5kZXJlclN0eWxlRmxhZ3MyLkRhc2hDYXNlIGFzIG51bWJlcik7XG5cbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUoXG4gICAgICAgIHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdW5pdCA/IGAke3ZhbHVlfSR7dW5pdH1gIDogdmFsdWUsXG4gICAgICAgIGZsYWdzLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlU3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBuYW1lLCBmbGFncyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxzdHJpbmcsIHN0cmluZyB8IG51bWJlcj4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCBudWxsKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gIH1cbn1cbiJdfQ==