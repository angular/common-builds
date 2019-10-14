/**
 * @fileoverview added by tsickle
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
/** @nocollapse */ NgStyleR2Impl.ngInjectableDef = i0.ɵɵdefineInjectable({ token: NgStyleR2Impl, factory: function (t) { return NgStyleR2Impl.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgStyleR2Impl, [{
        type: Injectable
    }], function () { return [{ type: i0.ElementRef }, { type: i0.KeyValueDiffers }, { type: i0.Renderer2 }]; }, null);
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
/** @nocollapse */ NgStyleR3Impl.ngInjectableDef = i0.ɵɵdefineInjectable({ token: NgStyleR3Impl, factory: function (t) { return NgStyleR3Impl.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgStyleR3Impl, [{
        type: Injectable
    }], null, null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGVfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19zdHlsZV9pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQW1DLGVBQWUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbEgsT0FBTyxFQUFDLGFBQWEsRUFBdUIsTUFBTSxrQkFBa0IsQ0FBQzs7Ozs7Ozs7Ozs7O0FBV3JFLE1BQU0sT0FBZ0IsV0FBVztDQUloQzs7Ozs7O0lBSEMsaURBQStDOzs7Ozs7SUFDL0Msd0RBQTREOzs7OztJQUM1RCxxREFBOEI7O0FBSWhDLE1BQU0sT0FBTyxhQUFhOzs7Ozs7SUFNeEIsWUFDWSxLQUFpQixFQUFVLFFBQXlCLEVBQVUsU0FBb0I7UUFBbEYsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBVztJQUFHLENBQUM7Ozs7SUFFbEcsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7OztJQVMzQixVQUFVLENBQUMsTUFBK0I7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxFQUFFO1lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDcEQ7SUFDSCxDQUFDOzs7OztJQUtELFlBQVk7UUFDVixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7O2tCQUNWLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFD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QkFLbUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0VsZW1lbnRSZWYsIEluamVjdGFibGUsIEtleVZhbHVlQ2hhbmdlcywgS2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVycywgUmVuZGVyZXIyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtTdHlsaW5nRGlmZmVyLCBTdHlsaW5nRGlmZmVyT3B0aW9uc30gZnJvbSAnLi9zdHlsaW5nX2RpZmZlcic7XG5cbi8qKlxuICogVXNlZCBhcyBhIHRva2VuIGZvciBhbiBpbmplY3RlZCBzZXJ2aWNlIHdpdGhpbiB0aGUgTmdTdHlsZSBkaXJlY3RpdmUuXG4gKlxuICogTmdTdHlsZSBiZWhhdmVzIGRpZmZlcmVubHkgd2hldGhlciBvciBub3QgVkUgaXMgYmVpbmcgdXNlZCBvciBub3QuIElmXG4gKiBwcmVzZW50IHRoZW4gdGhlIGxlZ2FjeSBuZ0NsYXNzIGRpZmZpbmcgYWxnb3JpdGhtIHdpbGwgYmUgdXNlZCBhcyBhblxuICogaW5qZWN0ZWQgc2VydmljZS4gT3RoZXJ3aXNlIHRoZSBuZXcgZGlmZmluZyBhbGdvcml0aG0gKHdoaWNoIGRlbGVnYXRlc1xuICogdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nKSB3aWxsIGJlIHVzZWQuIFRoaXMgdG9nZ2xlIGJlaGF2aW9yIGlzIGRvbmUgc29cbiAqIHZpYSB0aGUgaXZ5X3N3aXRjaCBtZWNoYW5pc20uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ1N0eWxlSW1wbCB7XG4gIGFic3RyYWN0IGdldFZhbHVlKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGw7XG4gIGFic3RyYWN0IHNldE5nU3R5bGUodmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwpOiB2b2lkO1xuICBhYnN0cmFjdCBhcHBseUNoYW5nZXMoKTogdm9pZDtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nU3R5bGVSMkltcGwgaW1wbGVtZW50cyBOZ1N0eWxlSW1wbCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9uZ1N0eWxlICE6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZGlmZmVyICE6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgc3RyaW5nfG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLCBwcml2YXRlIF9kaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiBudWxsOyB9XG5cbiAgLyoqXG4gICAqIEEgbWFwIG9mIHN0eWxlIHByb3BlcnRpZXMsIHNwZWNpZmllZCBhcyBjb2xvbi1zZXBhcmF0ZWRcbiAgICoga2V5LXZhbHVlIHBhaXJzLlxuICAgKiAqIFRoZSBrZXkgaXMgYSBzdHlsZSBuYW1lLCB3aXRoIGFuIG9wdGlvbmFsIGAuPHVuaXQ+YCBzdWZmaXhcbiAgICogICAgKHN1Y2ggYXMgJ3RvcC5weCcsICdmb250LXN0eWxlLmVtJykuXG4gICAqICogVGhlIHZhbHVlIGlzIGFuIGV4cHJlc3Npb24gdG8gYmUgZXZhbHVhdGVkLlxuICAgKi9cbiAgc2V0TmdTdHlsZSh2YWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgdGhpcy5fbmdTdHlsZSA9IHZhbHVlcztcbiAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZXMpIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZXMpLmNyZWF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBuZXcgc3R5bGVzIGlmIG5lZWRlZC5cbiAgICovXG4gIGFwcGx5Q2hhbmdlcygpIHtcbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdTdHlsZSk7XG4gICAgICBpZiAoY2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxzdHJpbmcsIHN0cmluZ3xudW1iZXI+KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgbnVsbCkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0U3R5bGUobmFtZUFuZFVuaXQ6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudW1iZXJ8bnVsbHx1bmRlZmluZWQpOiB2b2lkIHtcbiAgICBjb25zdCBbbmFtZSwgdW5pdF0gPSBuYW1lQW5kVW5pdC5zcGxpdCgnLicpO1xuICAgIHZhbHVlID0gdmFsdWUgIT0gbnVsbCAmJiB1bml0ID8gYCR7dmFsdWV9JHt1bml0fWAgOiB2YWx1ZTtcblxuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbHVlIGFzIHN0cmluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZVN0eWxlKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgbmFtZSk7XG4gICAgfVxuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlUjNJbXBsIGltcGxlbWVudHMgTmdTdHlsZUltcGwge1xuICBwcml2YXRlIF9kaWZmZXIgPVxuICAgICAgbmV3IFN0eWxpbmdEaWZmZXI8e1trZXk6IHN0cmluZ106IGFueX18bnVsbD4oJ05nU3R5bGUnLCBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1VuaXRzKTtcblxuICBwcml2YXRlIF92YWx1ZToge1trZXk6IHN0cmluZ106IGFueX18bnVsbCA9IG51bGw7XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl92YWx1ZTsgfVxuXG4gIHNldE5nU3R5bGUodmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwpIHsgdGhpcy5fZGlmZmVyLnNldFZhbHVlKHZhbHVlKTsgfVxuXG4gIGFwcGx5Q2hhbmdlcygpIHtcbiAgICBpZiAodGhpcy5fZGlmZmVyLmhhc1ZhbHVlQ2hhbmdlZCgpKSB7XG4gICAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX2RpZmZlci52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuLy8gdGhlIGltcGxlbWVudGF0aW9uIGZvciBib3RoIE5nQ2xhc3NSMkltcGwgYW5kIE5nQ2xhc3NSM0ltcGwgYXJlXG4vLyBub3QgaXZ5X3N3aXRjaCdkIGF3YXksIGluc3RlYWQgdGhleSBhcmUgb25seSBob29rZWQgdXAgaW50byB0aGVcbi8vIERJIHZpYSBOZ1N0eWxlJ3MgZGlyZWN0aXZlJ3MgcHJvdmlkZXIgcHJvcGVydHkuXG5leHBvcnQgY29uc3QgTmdTdHlsZUltcGxQcm92aWRlcl9fUFJFX1IzX18gPSB7XG4gIHByb3ZpZGU6IE5nU3R5bGVJbXBsLFxuICB1c2VDbGFzczogTmdTdHlsZVIySW1wbFxufTtcblxuZXhwb3J0IGNvbnN0IE5nU3R5bGVJbXBsUHJvdmlkZXJfX1BPU1RfUjNfXyA9IHtcbiAgcHJvdmlkZTogTmdTdHlsZUltcGwsXG4gIHVzZUNsYXNzOiBOZ1N0eWxlUjNJbXBsXG59O1xuXG5leHBvcnQgY29uc3QgTmdTdHlsZUltcGxQcm92aWRlciA9IE5nU3R5bGVJbXBsUHJvdmlkZXJfX1BSRV9SM19fO1xuIl19