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
    { type: Injectable }
];
/** @nocollapse */
NgStyleR2Impl.ctorParameters = () => [
    { type: ElementRef },
    { type: KeyValueDiffers },
    { type: Renderer2 }
];
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
    setNgStyle(value) { this._differ.setInput(value); }
    /**
     * @return {?}
     */
    applyChanges() {
        if (this._differ.updateValue()) {
            this._value = this._differ.value;
        }
    }
}
NgStyleR3Impl.decorators = [
    { type: Injectable }
];
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
export const NgStyleImplProvider = NgStyleImplProvider__PRE_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGVfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19zdHlsZV9pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFtQyxlQUFlLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWxILE9BQU8sRUFBQyxhQUFhLEVBQXVCLE1BQU0sa0JBQWtCLENBQUM7Ozs7Ozs7Ozs7O0FBV3JFLE1BQU0sT0FBZ0IsV0FBVztDQUloQzs7Ozs7O0lBSEMsaURBQStDOzs7Ozs7SUFDL0Msd0RBQTREOzs7OztJQUM1RCxxREFBOEI7O0FBSWhDLE1BQU0sT0FBTyxhQUFhOzs7Ozs7SUFNeEIsWUFDWSxLQUFpQixFQUFVLFFBQXlCLEVBQVUsU0FBb0I7UUFBbEYsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBVztJQUFHLENBQUM7Ozs7SUFFbEcsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7OztJQVMzQixVQUFVLENBQUMsTUFBK0I7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxFQUFFO1lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDcEQ7SUFDSCxDQUFDOzs7OztJQUtELFlBQVk7UUFDVixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7O2tCQUNWLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hELElBQUksT0FBTyxFQUFFO2dCQUNYLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7Ozs7OztJQUVPLGFBQWEsQ0FBQyxPQUErQztRQUNuRSxPQUFPLENBQUMsa0JBQWtCOzs7O1FBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBQyxDQUFDO1FBQ3pFLE9BQU8sQ0FBQyxnQkFBZ0I7Ozs7UUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBQyxDQUFDO1FBQ3RGLE9BQU8sQ0FBQyxrQkFBa0I7Ozs7UUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBQyxDQUFDO0lBQzFGLENBQUM7Ozs7Ozs7SUFFTyxTQUFTLENBQUMsV0FBbUIsRUFBRSxLQUFtQztjQUNsRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUMzQyxLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFMUQsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxtQkFBQSxLQUFLLEVBQVUsQ0FBQyxDQUFDO1NBQzFFO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM1RDtJQUNILENBQUM7OztZQXJERixVQUFVOzs7O1lBbkJILFVBQVU7WUFBK0MsZUFBZTtZQUFFLFNBQVM7Ozs7Ozs7SUFzQnpGLGlDQUE0Qzs7Ozs7SUFFNUMsZ0NBQXlEOzs7OztJQUdyRCw4QkFBeUI7Ozs7O0lBQUUsaUNBQWlDOzs7OztJQUFFLGtDQUE0Qjs7QUFpRGhHLE1BQU0sT0FBTyxhQUFhO0lBRDFCO1FBRVUsWUFBTyxHQUNYLElBQUksYUFBYSxDQUF1QixTQUFTLHFCQUFrQyxDQUFDO1FBRWhGLFdBQU0sR0FBOEIsSUFBSSxDQUFDO0lBV25ELENBQUM7Ozs7SUFUQyxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFbEMsVUFBVSxDQUFDLEtBQWdDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBRTlFLFlBQVk7UUFDVixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztTQUNsQztJQUNILENBQUM7OztZQWZGLFVBQVU7Ozs7Ozs7SUFFVCxnQ0FDd0Y7Ozs7O0lBRXhGLCtCQUFpRDs7Ozs7O0FBZ0JuRCxNQUFNLE9BQU8sNkJBQTZCLEdBQUc7SUFDM0MsT0FBTyxFQUFFLFdBQVc7SUFDcEIsUUFBUSxFQUFFLGFBQWE7Q0FDeEI7O0FBRUQsTUFBTSxPQUFPLDhCQUE4QixHQUFHO0lBQzVDLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFFBQVEsRUFBRSxhQUFhO0NBQ3hCOztBQUVELE1BQU0sT0FBTyxtQkFBbUIsR0FBRyw2QkFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0VsZW1lbnRSZWYsIEluamVjdGFibGUsIEtleVZhbHVlQ2hhbmdlcywgS2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVycywgUmVuZGVyZXIyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtTdHlsaW5nRGlmZmVyLCBTdHlsaW5nRGlmZmVyT3B0aW9uc30gZnJvbSAnLi9zdHlsaW5nX2RpZmZlcic7XG5cbi8qKlxuICogVXNlZCBhcyBhIHRva2VuIGZvciBhbiBpbmplY3RlZCBzZXJ2aWNlIHdpdGhpbiB0aGUgTmdTdHlsZSBkaXJlY3RpdmUuXG4gKlxuICogTmdTdHlsZSBiZWhhdmVzIGRpZmZlcmVubHkgd2hldGhlciBvciBub3QgVkUgaXMgYmVpbmcgdXNlZCBvciBub3QuIElmXG4gKiBwcmVzZW50IHRoZW4gdGhlIGxlZ2FjeSBuZ0NsYXNzIGRpZmZpbmcgYWxnb3JpdGhtIHdpbGwgYmUgdXNlZCBhcyBhblxuICogaW5qZWN0ZWQgc2VydmljZS4gT3RoZXJ3aXNlIHRoZSBuZXcgZGlmZmluZyBhbGdvcml0aG0gKHdoaWNoIGRlbGVnYXRlc1xuICogdG8gdGhlIGBbc3R5bGVdYCBiaW5kaW5nKSB3aWxsIGJlIHVzZWQuIFRoaXMgdG9nZ2xlIGJlaGF2aW9yIGlzIGRvbmUgc29cbiAqIHZpYSB0aGUgaXZ5X3N3aXRjaCBtZWNoYW5pc20uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ1N0eWxlSW1wbCB7XG4gIGFic3RyYWN0IGdldFZhbHVlKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGw7XG4gIGFic3RyYWN0IHNldE5nU3R5bGUodmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwpOiB2b2lkO1xuICBhYnN0cmFjdCBhcHBseUNoYW5nZXMoKTogdm9pZDtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nU3R5bGVSMkltcGwgaW1wbGVtZW50cyBOZ1N0eWxlSW1wbCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9uZ1N0eWxlICE6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZGlmZmVyICE6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgc3RyaW5nfG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLCBwcml2YXRlIF9kaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiBudWxsOyB9XG5cbiAgLyoqXG4gICAqIEEgbWFwIG9mIHN0eWxlIHByb3BlcnRpZXMsIHNwZWNpZmllZCBhcyBjb2xvbi1zZXBhcmF0ZWRcbiAgICoga2V5LXZhbHVlIHBhaXJzLlxuICAgKiAqIFRoZSBrZXkgaXMgYSBzdHlsZSBuYW1lLCB3aXRoIGFuIG9wdGlvbmFsIGAuPHVuaXQ+YCBzdWZmaXhcbiAgICogICAgKHN1Y2ggYXMgJ3RvcC5weCcsICdmb250LXN0eWxlLmVtJykuXG4gICAqICogVGhlIHZhbHVlIGlzIGFuIGV4cHJlc3Npb24gdG8gYmUgZXZhbHVhdGVkLlxuICAgKi9cbiAgc2V0TmdTdHlsZSh2YWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgdGhpcy5fbmdTdHlsZSA9IHZhbHVlcztcbiAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZXMpIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZXMpLmNyZWF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBuZXcgc3R5bGVzIGlmIG5lZWRlZC5cbiAgICovXG4gIGFwcGx5Q2hhbmdlcygpIHtcbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdTdHlsZSk7XG4gICAgICBpZiAoY2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxzdHJpbmcsIHN0cmluZ3xudW1iZXI+KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgbnVsbCkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0U3R5bGUobmFtZUFuZFVuaXQ6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudW1iZXJ8bnVsbHx1bmRlZmluZWQpOiB2b2lkIHtcbiAgICBjb25zdCBbbmFtZSwgdW5pdF0gPSBuYW1lQW5kVW5pdC5zcGxpdCgnLicpO1xuICAgIHZhbHVlID0gdmFsdWUgIT0gbnVsbCAmJiB1bml0ID8gYCR7dmFsdWV9JHt1bml0fWAgOiB2YWx1ZTtcblxuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbHVlIGFzIHN0cmluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZVN0eWxlKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgbmFtZSk7XG4gICAgfVxuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlUjNJbXBsIGltcGxlbWVudHMgTmdTdHlsZUltcGwge1xuICBwcml2YXRlIF9kaWZmZXIgPVxuICAgICAgbmV3IFN0eWxpbmdEaWZmZXI8e1trZXk6IHN0cmluZ106IGFueX0+KCdOZ1N0eWxlJywgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dVbml0cyk7XG5cbiAgcHJpdmF0ZSBfdmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwgPSBudWxsO1xuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fdmFsdWU7IH1cblxuICBzZXROZ1N0eWxlKHZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsKSB7IHRoaXMuX2RpZmZlci5zZXRJbnB1dCh2YWx1ZSk7IH1cblxuICBhcHBseUNoYW5nZXMoKSB7XG4gICAgaWYgKHRoaXMuX2RpZmZlci51cGRhdGVWYWx1ZSgpKSB7XG4gICAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX2RpZmZlci52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuLy8gdGhlIGltcGxlbWVudGF0aW9uIGZvciBib3RoIE5nQ2xhc3NSMkltcGwgYW5kIE5nQ2xhc3NSM0ltcGwgYXJlXG4vLyBub3QgaXZ5X3N3aXRjaCdkIGF3YXksIGluc3RlYWQgdGhleSBhcmUgb25seSBob29rZWQgdXAgaW50byB0aGVcbi8vIERJIHZpYSBOZ1N0eWxlJ3MgZGlyZWN0aXZlJ3MgcHJvdmlkZXIgcHJvcGVydHkuXG5leHBvcnQgY29uc3QgTmdTdHlsZUltcGxQcm92aWRlcl9fUFJFX1IzX18gPSB7XG4gIHByb3ZpZGU6IE5nU3R5bGVJbXBsLFxuICB1c2VDbGFzczogTmdTdHlsZVIySW1wbFxufTtcblxuZXhwb3J0IGNvbnN0IE5nU3R5bGVJbXBsUHJvdmlkZXJfX1BPU1RfUjNfXyA9IHtcbiAgcHJvdmlkZTogTmdTdHlsZUltcGwsXG4gIHVzZUNsYXNzOiBOZ1N0eWxlUjNJbXBsXG59O1xuXG5leHBvcnQgY29uc3QgTmdTdHlsZUltcGxQcm92aWRlciA9IE5nU3R5bGVJbXBsUHJvdmlkZXJfX1BSRV9SM19fO1xuIl19