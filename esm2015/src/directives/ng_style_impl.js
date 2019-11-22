/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/directives/ng_style_impl.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, Injectable, KeyValueDiffers, Renderer2 } from '@angular/core';
import { StylingDiffer } from './styling_differ';
import * as i0 from "@angular/core";
/**
 * Used as a token for an injected service within the NgStyle directive.
 *
 * NgStyle behaves differenly whether or not VE is being used or not. If
 * present then the legacy ngClass diffing algorithm will be used as an
 * injected service. Otherwise the new diffing algorithm (which delegates
 * to the `[style]` binding) will be used. This toggle behavior is done so
 * via the ivy_switch mechanism.
 * @abstract
 */
export class NgStyleImpl {
}
if (false) {
    /**
     * @abstract
     * @return {?}
     */
    NgStyleImpl.prototype.getValue = function () { };
    /**
     * @abstract
     * @param {?} value
     * @return {?}
     */
    NgStyleImpl.prototype.setNgStyle = function (value) { };
    /**
     * @abstract
     * @return {?}
     */
    NgStyleImpl.prototype.applyChanges = function () { };
}
export class NgStyleR2Impl {
    /**
     * @param {?} _ngEl
     * @param {?} _differs
     * @param {?} _renderer
     */
    constructor(_ngEl, _differs, _renderer) {
        this._ngEl = _ngEl;
        this._differs = _differs;
        this._renderer = _renderer;
    }
    /**
     * @return {?}
     */
    getValue() { return null; }
    /**
     * A map of style properties, specified as colon-separated
     * key-value pairs.
     * * The key is a style name, with an optional `.<unit>` suffix
     *    (such as 'top.px', 'font-style.em').
     * * The value is an expression to be evaluated.
     * @param {?} values
     * @return {?}
     */
    setNgStyle(values) {
        this._ngStyle = values;
        if (!this._differ && values) {
            this._differ = this._differs.find(values).create();
        }
    }
    /**
     * Applies the new styles if needed.
     * @return {?}
     */
    applyChanges() {
        if (this._differ) {
            /** @type {?} */
            const changes = this._differ.diff(this._ngStyle);
            if (changes) {
                this._applyChanges(changes);
            }
        }
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyChanges(changes) {
        changes.forEachRemovedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => this._setStyle(record.key, null)));
        changes.forEachAddedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => this._setStyle(record.key, record.currentValue)));
        changes.forEachChangedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => this._setStyle(record.key, record.currentValue)));
    }
    /**
     * @private
     * @param {?} nameAndUnit
     * @param {?} value
     * @return {?}
     */
    _setStyle(nameAndUnit, value) {
        const [name, unit] = nameAndUnit.split('.');
        value = value != null && unit ? `${value}${unit}` : value;
        if (value != null) {
            this._renderer.setStyle(this._ngEl.nativeElement, name, (/** @type {?} */ (value)));
        }
        else {
            this._renderer.removeStyle(this._ngEl.nativeElement, name);
        }
    }
}
NgStyleR2Impl.decorators = [
    { type: Injectable },
];
/** @nocollapse */
NgStyleR2Impl.ctorParameters = () => [
    { type: ElementRef },
    { type: KeyValueDiffers },
    { type: Renderer2 }
];
/** @nocollapse */ NgStyleR2Impl.ɵfac = function NgStyleR2Impl_Factory(t) { return new (t || NgStyleR2Impl)(i0.ɵɵinject(i0.ElementRef), i0.ɵɵinject(i0.KeyValueDiffers), i0.ɵɵinject(i0.Renderer2)); };
/** @nocollapse */ NgStyleR2Impl.ɵprov = i0.ɵɵdefineInjectable({ token: NgStyleR2Impl, factory: function (t) { return NgStyleR2Impl.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgStyleR2Impl, [{
        type: Injectable
    }], function () { return [{ type: i0.ElementRef }, { type: i0.KeyValueDiffers }, { type: i0.Renderer2 }]; }, null); })();
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgStyleR2Impl.prototype._ngStyle;
    /**
     * @type {?}
     * @private
     */
    NgStyleR2Impl.prototype._differ;
    /**
     * @type {?}
     * @private
     */
    NgStyleR2Impl.prototype._ngEl;
    /**
     * @type {?}
     * @private
     */
    NgStyleR2Impl.prototype._differs;
    /**
     * @type {?}
     * @private
     */
    NgStyleR2Impl.prototype._renderer;
}
export class NgStyleR3Impl {
    constructor() {
        this._differ = new StylingDiffer('NgStyle', 8 /* AllowUnits */);
        this._value = null;
    }
    /**
     * @return {?}
     */
    getValue() { return this._value; }
    /**
     * @param {?} value
     * @return {?}
     */
    setNgStyle(value) { this._differ.setValue(value); }
    /**
     * @return {?}
     */
    applyChanges() {
        if (this._differ.hasValueChanged()) {
            this._value = this._differ.value;
        }
    }
}
NgStyleR3Impl.decorators = [
    { type: Injectable },
];
/** @nocollapse */ NgStyleR3Impl.ɵfac = function NgStyleR3Impl_Factory(t) { return new (t || NgStyleR3Impl)(); };
/** @nocollapse */ NgStyleR3Impl.ɵprov = i0.ɵɵdefineInjectable({ token: NgStyleR3Impl, factory: function (t) { return NgStyleR3Impl.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgStyleR3Impl, [{
        type: Injectable
    }], null, null); })();
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgStyleR3Impl.prototype._differ;
    /**
     * @type {?}
     * @private
     */
    NgStyleR3Impl.prototype._value;
}
// the implementation for both NgClassR2Impl and NgClassR3Impl are
// not ivy_switch'd away, instead they are only hooked up into the
// DI via NgStyle's directive's provider property.
/** @type {?} */
export const NgStyleImplProvider__PRE_R3__ = {
    provide: NgStyleImpl,
    useClass: NgStyleR2Impl
};
/** @type {?} */
export const NgStyleImplProvider__POST_R3__ = {
    provide: NgStyleImpl,
    useClass: NgStyleR3Impl
};
/** @type {?} */
export const NgStyleImplProvider = NgStyleImplProvider__POST_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGVfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19zdHlsZV9pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFtQyxlQUFlLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWxILE9BQU8sRUFBQyxhQUFhLEVBQXVCLE1BQU0sa0JBQWtCLENBQUM7Ozs7Ozs7Ozs7OztBQVdyRSxNQUFNLE9BQWdCLFdBQVc7Q0FJaEM7Ozs7OztJQUhDLGlEQUErQzs7Ozs7O0lBQy9DLHdEQUE0RDs7Ozs7SUFDNUQscURBQThCOztBQUloQyxNQUFNLE9BQU8sYUFBYTs7Ozs7O0lBTXhCLFlBQ1ksS0FBaUIsRUFBVSxRQUF5QixFQUFVLFNBQW9CO1FBQWxGLFVBQUssR0FBTCxLQUFLLENBQVk7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDOzs7O0lBRWxHLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7SUFTM0IsVUFBVSxDQUFDLE1BQStCO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sRUFBRTtZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3BEO0lBQ0gsQ0FBQzs7Ozs7SUFLRCxZQUFZO1FBQ1YsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOztrQkFDVixPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FB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OEJBS21EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlcnMsIFJlbmRlcmVyMn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7U3R5bGluZ0RpZmZlciwgU3R5bGluZ0RpZmZlck9wdGlvbnN9IGZyb20gJy4vc3R5bGluZ19kaWZmZXInO1xuXG4vKipcbiAqIFVzZWQgYXMgYSB0b2tlbiBmb3IgYW4gaW5qZWN0ZWQgc2VydmljZSB3aXRoaW4gdGhlIE5nU3R5bGUgZGlyZWN0aXZlLlxuICpcbiAqIE5nU3R5bGUgYmVoYXZlcyBkaWZmZXJlbmx5IHdoZXRoZXIgb3Igbm90IFZFIGlzIGJlaW5nIHVzZWQgb3Igbm90LiBJZlxuICogcHJlc2VudCB0aGVuIHRoZSBsZWdhY3kgbmdDbGFzcyBkaWZmaW5nIGFsZ29yaXRobSB3aWxsIGJlIHVzZWQgYXMgYW5cbiAqIGluamVjdGVkIHNlcnZpY2UuIE90aGVyd2lzZSB0aGUgbmV3IGRpZmZpbmcgYWxnb3JpdGhtICh3aGljaCBkZWxlZ2F0ZXNcbiAqIHRvIHRoZSBgW3N0eWxlXWAgYmluZGluZykgd2lsbCBiZSB1c2VkLiBUaGlzIHRvZ2dsZSBiZWhhdmlvciBpcyBkb25lIHNvXG4gKiB2aWEgdGhlIGl2eV9zd2l0Y2ggbWVjaGFuaXNtLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdTdHlsZUltcGwge1xuICBhYnN0cmFjdCBnZXRWYWx1ZSgpOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsO1xuICBhYnN0cmFjdCBzZXROZ1N0eWxlKHZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsKTogdm9pZDtcbiAgYWJzdHJhY3QgYXBwbHlDaGFuZ2VzKCk6IHZvaWQ7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlUjJJbXBsIGltcGxlbWVudHMgTmdTdHlsZUltcGwge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfbmdTdHlsZSAhOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2RpZmZlciAhOiBLZXlWYWx1ZURpZmZlcjxzdHJpbmcsIHN0cmluZ3xudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyKSB7fVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIC8qKlxuICAgKiBBIG1hcCBvZiBzdHlsZSBwcm9wZXJ0aWVzLCBzcGVjaWZpZWQgYXMgY29sb24tc2VwYXJhdGVkXG4gICAqIGtleS12YWx1ZSBwYWlycy5cbiAgICogKiBUaGUga2V5IGlzIGEgc3R5bGUgbmFtZSwgd2l0aCBhbiBvcHRpb25hbCBgLjx1bml0PmAgc3VmZml4XG4gICAqICAgIChzdWNoIGFzICd0b3AucHgnLCAnZm9udC1zdHlsZS5lbScpLlxuICAgKiAqIFRoZSB2YWx1ZSBpcyBhbiBleHByZXNzaW9uIHRvIGJlIGV2YWx1YXRlZC5cbiAgICovXG4gIHNldE5nU3R5bGUodmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuX25nU3R5bGUgPSB2YWx1ZXM7XG4gICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWVzKSB7XG4gICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWVzKS5jcmVhdGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgbmV3IHN0eWxlcyBpZiBuZWVkZWQuXG4gICAqL1xuICBhcHBseUNoYW5nZXMoKSB7XG4gICAgaWYgKHRoaXMuX2RpZmZlcikge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nU3R5bGUpO1xuICAgICAgaWYgKGNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBLZXlWYWx1ZUNoYW5nZXM8c3RyaW5nLCBzdHJpbmd8bnVtYmVyPik6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIG51bGwpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFN0eWxlKG5hbWVBbmRVbml0OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd8bnVtYmVyfG51bGx8dW5kZWZpbmVkKTogdm9pZCB7XG4gICAgY29uc3QgW25hbWUsIHVuaXRdID0gbmFtZUFuZFVuaXQuc3BsaXQoJy4nKTtcbiAgICB2YWx1ZSA9IHZhbHVlICE9IG51bGwgJiYgdW5pdCA/IGAke3ZhbHVlfSR7dW5pdH1gIDogdmFsdWU7XG5cbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBuYW1lLCB2YWx1ZSBhcyBzdHJpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdTdHlsZVIzSW1wbCBpbXBsZW1lbnRzIE5nU3R5bGVJbXBsIHtcbiAgcHJpdmF0ZSBfZGlmZmVyID1cbiAgICAgIG5ldyBTdHlsaW5nRGlmZmVyPHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGw+KCdOZ1N0eWxlJywgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dVbml0cyk7XG5cbiAgcHJpdmF0ZSBfdmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwgPSBudWxsO1xuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fdmFsdWU7IH1cblxuICBzZXROZ1N0eWxlKHZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsKSB7IHRoaXMuX2RpZmZlci5zZXRWYWx1ZSh2YWx1ZSk7IH1cblxuICBhcHBseUNoYW5nZXMoKSB7XG4gICAgaWYgKHRoaXMuX2RpZmZlci5oYXNWYWx1ZUNoYW5nZWQoKSkge1xuICAgICAgdGhpcy5fdmFsdWUgPSB0aGlzLl9kaWZmZXIudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbi8vIHRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgYm90aCBOZ0NsYXNzUjJJbXBsIGFuZCBOZ0NsYXNzUjNJbXBsIGFyZVxuLy8gbm90IGl2eV9zd2l0Y2gnZCBhd2F5LCBpbnN0ZWFkIHRoZXkgYXJlIG9ubHkgaG9va2VkIHVwIGludG8gdGhlXG4vLyBESSB2aWEgTmdTdHlsZSdzIGRpcmVjdGl2ZSdzIHByb3ZpZGVyIHByb3BlcnR5LlxuZXhwb3J0IGNvbnN0IE5nU3R5bGVJbXBsUHJvdmlkZXJfX1BSRV9SM19fID0ge1xuICBwcm92aWRlOiBOZ1N0eWxlSW1wbCxcbiAgdXNlQ2xhc3M6IE5nU3R5bGVSMkltcGxcbn07XG5cbmV4cG9ydCBjb25zdCBOZ1N0eWxlSW1wbFByb3ZpZGVyX19QT1NUX1IzX18gPSB7XG4gIHByb3ZpZGU6IE5nU3R5bGVJbXBsLFxuICB1c2VDbGFzczogTmdTdHlsZVIzSW1wbFxufTtcblxuZXhwb3J0IGNvbnN0IE5nU3R5bGVJbXBsUHJvdmlkZXIgPSBOZ1N0eWxlSW1wbFByb3ZpZGVyX19QUkVfUjNfXztcbiJdfQ==