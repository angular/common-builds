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
/** @nocollapse */ NgStyleR2Impl.ɵprov = i0.ɵɵdefineInjectable({ token: NgStyleR2Impl, factory: NgStyleR2Impl.ɵfac });
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
/** @nocollapse */ NgStyleR3Impl.ɵprov = i0.ɵɵdefineInjectable({ token: NgStyleR3Impl, factory: NgStyleR3Impl.ɵfac });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGVfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19zdHlsZV9pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFtQyxlQUFlLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWxILE9BQU8sRUFBQyxhQUFhLEVBQXVCLE1BQU0sa0JBQWtCLENBQUM7Ozs7Ozs7Ozs7OztBQVdyRSxNQUFNLE9BQWdCLFdBQVc7Q0FJaEM7Ozs7OztJQUhDLGlEQUErQzs7Ozs7O0lBQy9DLHdEQUE0RDs7Ozs7SUFDNUQscURBQThCOztBQUloQyxNQUFNLE9BQU8sYUFBYTs7Ozs7O0lBTXhCLFlBQ1ksS0FBaUIsRUFBVSxRQUF5QixFQUFVLFNBQW9CO1FBQWxGLFVBQUssR0FBTCxLQUFLLENBQVk7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDOzs7O0lBRWxHLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7SUFTM0IsVUFBVSxDQUFDLE1BQStCO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sRUFBRTtZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3BEO0lBQ0gsQ0FBQzs7Ozs7SUFLRCxZQUFZO1FBQ1YsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOztrQkFDVixPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FB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QUttRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RWxlbWVudFJlZiwgSW5qZWN0YWJsZSwgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1N0eWxpbmdEaWZmZXIsIFN0eWxpbmdEaWZmZXJPcHRpb25zfSBmcm9tICcuL3N0eWxpbmdfZGlmZmVyJztcblxuLyoqXG4gKiBVc2VkIGFzIGEgdG9rZW4gZm9yIGFuIGluamVjdGVkIHNlcnZpY2Ugd2l0aGluIHRoZSBOZ1N0eWxlIGRpcmVjdGl2ZS5cbiAqXG4gKiBOZ1N0eWxlIGJlaGF2ZXMgZGlmZmVyZW5seSB3aGV0aGVyIG9yIG5vdCBWRSBpcyBiZWluZyB1c2VkIG9yIG5vdC4gSWZcbiAqIHByZXNlbnQgdGhlbiB0aGUgbGVnYWN5IG5nQ2xhc3MgZGlmZmluZyBhbGdvcml0aG0gd2lsbCBiZSB1c2VkIGFzIGFuXG4gKiBpbmplY3RlZCBzZXJ2aWNlLiBPdGhlcndpc2UgdGhlIG5ldyBkaWZmaW5nIGFsZ29yaXRobSAod2hpY2ggZGVsZWdhdGVzXG4gKiB0byB0aGUgYFtzdHlsZV1gIGJpbmRpbmcpIHdpbGwgYmUgdXNlZC4gVGhpcyB0b2dnbGUgYmVoYXZpb3IgaXMgZG9uZSBzb1xuICogdmlhIHRoZSBpdnlfc3dpdGNoIG1lY2hhbmlzbS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nU3R5bGVJbXBsIHtcbiAgYWJzdHJhY3QgZ2V0VmFsdWUoKToge1trZXk6IHN0cmluZ106IGFueX18bnVsbDtcbiAgYWJzdHJhY3Qgc2V0TmdTdHlsZSh2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX18bnVsbCk6IHZvaWQ7XG4gIGFic3RyYWN0IGFwcGx5Q2hhbmdlcygpOiB2b2lkO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdTdHlsZVIySW1wbCBpbXBsZW1lbnRzIE5nU3R5bGVJbXBsIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX25nU3R5bGUgIToge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9kaWZmZXIgITogS2V5VmFsdWVEaWZmZXI8c3RyaW5nLCBzdHJpbmd8bnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX2RpZmZlcnM6IEtleVZhbHVlRGlmZmVycywgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMikge31cblxuICBnZXRWYWx1ZSgpIHsgcmV0dXJuIG51bGw7IH1cblxuICAvKipcbiAgICogQSBtYXAgb2Ygc3R5bGUgcHJvcGVydGllcywgc3BlY2lmaWVkIGFzIGNvbG9uLXNlcGFyYXRlZFxuICAgKiBrZXktdmFsdWUgcGFpcnMuXG4gICAqICogVGhlIGtleSBpcyBhIHN0eWxlIG5hbWUsIHdpdGggYW4gb3B0aW9uYWwgYC48dW5pdD5gIHN1ZmZpeFxuICAgKiAgICAoc3VjaCBhcyAndG9wLnB4JywgJ2ZvbnQtc3R5bGUuZW0nKS5cbiAgICogKiBUaGUgdmFsdWUgaXMgYW4gZXhwcmVzc2lvbiB0byBiZSBldmFsdWF0ZWQuXG4gICAqL1xuICBzZXROZ1N0eWxlKHZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHtcbiAgICB0aGlzLl9uZ1N0eWxlID0gdmFsdWVzO1xuICAgIGlmICghdGhpcy5fZGlmZmVyICYmIHZhbHVlcykge1xuICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlcykuY3JlYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIG5ldyBzdHlsZXMgaWYgbmVlZGVkLlxuICAgKi9cbiAgYXBwbHlDaGFuZ2VzKCkge1xuICAgIGlmICh0aGlzLl9kaWZmZXIpIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9uZ1N0eWxlKTtcbiAgICAgIGlmIChjaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogS2V5VmFsdWVDaGFuZ2VzPHN0cmluZywgc3RyaW5nfG51bWJlcj4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCBudWxsKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gIH1cblxuICBwcml2YXRlIF9zZXRTdHlsZShuYW1lQW5kVW5pdDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfG51bWJlcnxudWxsfHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGNvbnN0IFtuYW1lLCB1bml0XSA9IG5hbWVBbmRVbml0LnNwbGl0KCcuJyk7XG4gICAgdmFsdWUgPSB2YWx1ZSAhPSBudWxsICYmIHVuaXQgPyBgJHt2YWx1ZX0ke3VuaXR9YCA6IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgbmFtZSwgdmFsdWUgYXMgc3RyaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlU3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBuYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nU3R5bGVSM0ltcGwgaW1wbGVtZW50cyBOZ1N0eWxlSW1wbCB7XG4gIHByaXZhdGUgX2RpZmZlciA9XG4gICAgICBuZXcgU3R5bGluZ0RpZmZlcjx7W2tleTogc3RyaW5nXTogYW55fXxudWxsPignTmdTdHlsZScsIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93VW5pdHMpO1xuXG4gIHByaXZhdGUgX3ZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0gbnVsbDtcblxuICBnZXRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG5cbiAgc2V0TmdTdHlsZSh2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX18bnVsbCkgeyB0aGlzLl9kaWZmZXIuc2V0VmFsdWUodmFsdWUpOyB9XG5cbiAgYXBwbHlDaGFuZ2VzKCkge1xuICAgIGlmICh0aGlzLl9kaWZmZXIuaGFzVmFsdWVDaGFuZ2VkKCkpIHtcbiAgICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5fZGlmZmVyLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG4vLyB0aGUgaW1wbGVtZW50YXRpb24gZm9yIGJvdGggTmdDbGFzc1IySW1wbCBhbmQgTmdDbGFzc1IzSW1wbCBhcmVcbi8vIG5vdCBpdnlfc3dpdGNoJ2QgYXdheSwgaW5zdGVhZCB0aGV5IGFyZSBvbmx5IGhvb2tlZCB1cCBpbnRvIHRoZVxuLy8gREkgdmlhIE5nU3R5bGUncyBkaXJlY3RpdmUncyBwcm92aWRlciBwcm9wZXJ0eS5cbmV4cG9ydCBjb25zdCBOZ1N0eWxlSW1wbFByb3ZpZGVyX19QUkVfUjNfXyA9IHtcbiAgcHJvdmlkZTogTmdTdHlsZUltcGwsXG4gIHVzZUNsYXNzOiBOZ1N0eWxlUjJJbXBsXG59O1xuXG5leHBvcnQgY29uc3QgTmdTdHlsZUltcGxQcm92aWRlcl9fUE9TVF9SM19fID0ge1xuICBwcm92aWRlOiBOZ1N0eWxlSW1wbCxcbiAgdXNlQ2xhc3M6IE5nU3R5bGVSM0ltcGxcbn07XG5cbmV4cG9ydCBjb25zdCBOZ1N0eWxlSW1wbFByb3ZpZGVyID0gTmdTdHlsZUltcGxQcm92aWRlcl9fUFJFX1IzX187XG4iXX0=