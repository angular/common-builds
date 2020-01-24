/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/directives/ng_class_impl.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, Injectable, IterableDiffers, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify } from '@angular/core';
import { StylingDiffer } from './styling_differ';
/**
 * Used as a token for an injected service within the NgClass directive.
 *
 * NgClass behaves differenly whether or not VE is being used or not. If
 * present then the legacy ngClass diffing algorithm will be used as an
 * injected service. Otherwise the new diffing algorithm (which delegates
 * to the `[class]` binding) will be used. This toggle behavior is done so
 * via the ivy_switch mechanism.
 * @abstract
 */
export class NgClassImpl {
}
if (false) {
    /**
     * @abstract
     * @param {?} value
     * @return {?}
     */
    NgClassImpl.prototype.setClass = function (value) { };
    /**
     * @abstract
     * @param {?} value
     * @return {?}
     */
    NgClassImpl.prototype.setNgClass = function (value) { };
    /**
     * @abstract
     * @return {?}
     */
    NgClassImpl.prototype.applyChanges = function () { };
    /**
     * @abstract
     * @return {?}
     */
    NgClassImpl.prototype.getValue = function () { };
}
export class NgClassR2Impl extends NgClassImpl {
    /**
     * @param {?} _iterableDiffers
     * @param {?} _keyValueDiffers
     * @param {?} _ngEl
     * @param {?} _renderer
     */
    constructor(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        super();
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    /**
     * @return {?}
     */
    getValue() { return null; }
    /**
     * @param {?} value
     * @return {?}
     */
    setClass(value) {
        this._removeClasses(this._initialClasses);
        this._initialClasses = typeof value === 'string' ? value.split(/\s+/) : [];
        this._applyClasses(this._initialClasses);
        this._applyClasses(this._rawClass);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setNgClass(value) {
        this._removeClasses(this._rawClass);
        this._applyClasses(this._initialClasses);
        this._iterableDiffer = null;
        this._keyValueDiffer = null;
        this._rawClass = typeof value === 'string' ? value.split(/\s+/) : value;
        if (this._rawClass) {
            if (isListLikeIterable(this._rawClass)) {
                this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
            }
            else {
                this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
            }
        }
    }
    /**
     * @return {?}
     */
    applyChanges() {
        if (this._iterableDiffer) {
            /** @type {?} */
            const iterableChanges = this._iterableDiffer.diff((/** @type {?} */ (this._rawClass)));
            if (iterableChanges) {
                this._applyIterableChanges(iterableChanges);
            }
        }
        else if (this._keyValueDiffer) {
            /** @type {?} */
            const keyValueChanges = this._keyValueDiffer.diff((/** @type {?} */ (this._rawClass)));
            if (keyValueChanges) {
                this._applyKeyValueChanges(keyValueChanges);
            }
        }
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyKeyValueChanges(changes) {
        changes.forEachAddedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => this._toggleClass(record.key, record.currentValue)));
        changes.forEachChangedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => this._toggleClass(record.key, record.currentValue)));
        changes.forEachRemovedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => {
            if (record.previousValue) {
                this._toggleClass(record.key, false);
            }
        }));
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyIterableChanges(changes) {
        changes.forEachAddedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => {
            if (typeof record.item === 'string') {
                this._toggleClass(record.item, true);
            }
            else {
                throw new Error(`NgClass can only toggle CSS classes expressed as strings, got: ${stringify(record.item)}`);
            }
        }));
        changes.forEachRemovedItem((/**
         * @param {?} record
         * @return {?}
         */
        (record) => this._toggleClass(record.item, false)));
    }
    /**
     * Applies a collection of CSS classes to the DOM element.
     *
     * For argument of type Set and Array CSS class names contained in those collections are always
     * added.
     * For argument of type Map CSS class name in the map's key is toggled based on the value (added
     * for truthy and removed for falsy).
     * @private
     * @param {?} rawClassVal
     * @return {?}
     */
    _applyClasses(rawClassVal) {
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                ((/** @type {?} */ (rawClassVal))).forEach((/**
                 * @param {?} klass
                 * @return {?}
                 */
                (klass) => this._toggleClass(klass, true)));
            }
            else {
                Object.keys(rawClassVal).forEach((/**
                 * @param {?} klass
                 * @return {?}
                 */
                klass => this._toggleClass(klass, !!rawClassVal[klass])));
            }
        }
    }
    /**
     * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
     * purposes.
     * @private
     * @param {?} rawClassVal
     * @return {?}
     */
    _removeClasses(rawClassVal) {
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                ((/** @type {?} */ (rawClassVal))).forEach((/**
                 * @param {?} klass
                 * @return {?}
                 */
                (klass) => this._toggleClass(klass, false)));
            }
            else {
                Object.keys(rawClassVal).forEach((/**
                 * @param {?} klass
                 * @return {?}
                 */
                klass => this._toggleClass(klass, false)));
            }
        }
    }
    /**
     * @private
     * @param {?} klass
     * @param {?} enabled
     * @return {?}
     */
    _toggleClass(klass, enabled) {
        klass = klass.trim();
        if (klass) {
            klass.split(/\s+/g).forEach((/**
             * @param {?} klass
             * @return {?}
             */
            klass => {
                if (enabled) {
                    this._renderer.addClass(this._ngEl.nativeElement, klass);
                }
                else {
                    this._renderer.removeClass(this._ngEl.nativeElement, klass);
                }
            }));
        }
    }
}
NgClassR2Impl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
NgClassR2Impl.ctorParameters = () => [
    { type: IterableDiffers },
    { type: KeyValueDiffers },
    { type: ElementRef },
    { type: Renderer2 }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._iterableDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._keyValueDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._initialClasses;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._rawClass;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._iterableDiffers;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._keyValueDiffers;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._ngEl;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._renderer;
}
export class NgClassR3Impl extends NgClassImpl {
    constructor() {
        super(...arguments);
        this._value = null;
        this._ngClassDiffer = new StylingDiffer('NgClass', 1 /* TrimProperties */ |
            2 /* AllowSubKeys */ |
            4 /* AllowStringValue */ | 16 /* ForceAsMap */);
        this._classStringDiffer = null;
    }
    /**
     * @return {?}
     */
    getValue() { return this._value; }
    /**
     * @param {?} value
     * @return {?}
     */
    setClass(value) {
        // early exit incase the binding gets emitted as an empty value which
        // means there is no reason to instantiate and diff the values...
        if (!value && !this._classStringDiffer)
            return;
        this._classStringDiffer = this._classStringDiffer ||
            new StylingDiffer('class', 4 /* AllowStringValue */ | 16 /* ForceAsMap */);
        this._classStringDiffer.setInput(value);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setNgClass(value) {
        this._ngClassDiffer.setInput(value);
    }
    /**
     * @return {?}
     */
    applyChanges() {
        /** @type {?} */
        const classChanged = this._classStringDiffer ? this._classStringDiffer.updateValue() : false;
        /** @type {?} */
        const ngClassChanged = this._ngClassDiffer.updateValue();
        if (classChanged || ngClassChanged) {
            /** @type {?} */
            let ngClassValue = this._ngClassDiffer.value;
            /** @type {?} */
            let classValue = this._classStringDiffer ? this._classStringDiffer.value : null;
            // merge classValue and ngClassValue and set value
            this._value = (classValue && ngClassValue) ? Object.assign(Object.assign({}, classValue), ngClassValue) :
                classValue || ngClassValue;
        }
    }
}
NgClassR3Impl.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgClassR3Impl.prototype._value;
    /**
     * @type {?}
     * @private
     */
    NgClassR3Impl.prototype._ngClassDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClassR3Impl.prototype._classStringDiffer;
}
// the implementation for both NgStyleR2Impl and NgStyleR3Impl are
// not ivy_switch'd away, instead they are only hooked up into the
// DI via NgStyle's directive's provider property.
/** @type {?} */
export const NgClassImplProvider__PRE_R3__ = {
    provide: NgClassImpl,
    useClass: NgClassR2Impl
};
/** @type {?} */
export const NgClassImplProvider__POST_R3__ = {
    provide: NgClassImpl,
    useClass: NgClassR3Impl
};
/** @type {?} */
export const NgClassImplProvider = NgClassImplProvider__PRE_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3NfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jbGFzc19pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFtQyxlQUFlLEVBQW1DLGVBQWUsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV4TyxPQUFPLEVBQUMsYUFBYSxFQUF1QixNQUFNLGtCQUFrQixDQUFDOzs7Ozs7Ozs7OztBQVdyRSxNQUFNLE9BQWdCLFdBQVc7Q0FLaEM7Ozs7Ozs7SUFKQyxzREFBdUM7Ozs7OztJQUN2Qyx3REFBcUY7Ozs7O0lBQ3JGLHFEQUE4Qjs7Ozs7SUFDOUIsaURBQStDOztBQUlqRCxNQUFNLE9BQU8sYUFBYyxTQUFRLFdBQVc7Ozs7Ozs7SUFTNUMsWUFDWSxnQkFBaUMsRUFBVSxnQkFBaUMsRUFDNUUsS0FBaUIsRUFBVSxTQUFvQjtRQUN6RCxLQUFLLEVBQUUsQ0FBQztRQUZFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBaUI7UUFBVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBQzVFLFVBQUssR0FBTCxLQUFLLENBQVk7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBTm5ELG9CQUFlLEdBQWEsRUFBRSxDQUFDO0lBUXZDLENBQUM7Ozs7SUFFRCxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7OztJQUUzQixRQUFRLENBQUMsS0FBYTtRQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxD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QVUsR0FBSyxZQUFZLEVBQUUsQ0FBQztnQkFDbEMsVUFBVSxJQUFJLFlBQVksQ0FBQztTQUN6RTtJQUNILENBQUM7OztZQXJDRixVQUFVOzs7Ozs7O0lBRVQsK0JBQXFEOzs7OztJQUNyRCx1Q0FHc0Y7Ozs7O0lBQ3RGLDJDQUE2RTs7Ozs7O0FBb0MvRSxNQUFNLE9BQU8sNkJBQTZCLEdBQUc7SUFDM0MsT0FBTyxFQUFFLFdBQVc7SUFDcEIsUUFBUSxFQUFFLGFBQWE7Q0FDeEI7O0FBRUQsTUFBTSxPQUFPLDhCQUE4QixHQUFHO0lBQzVDLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFFBQVEsRUFBRSxhQUFhO0NBQ3hCOztBQUVELE1BQU0sT0FBTyxtQkFBbUIsR0FBRyw2QkFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0VsZW1lbnRSZWYsIEluamVjdGFibGUsIEl0ZXJhYmxlQ2hhbmdlcywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjIsIMm1aXNMaXN0TGlrZUl0ZXJhYmxlIGFzIGlzTGlzdExpa2VJdGVyYWJsZSwgybVzdHJpbmdpZnkgYXMgc3RyaW5naWZ5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtTdHlsaW5nRGlmZmVyLCBTdHlsaW5nRGlmZmVyT3B0aW9uc30gZnJvbSAnLi9zdHlsaW5nX2RpZmZlcic7XG5cbi8qKlxuICogVXNlZCBhcyBhIHRva2VuIGZvciBhbiBpbmplY3RlZCBzZXJ2aWNlIHdpdGhpbiB0aGUgTmdDbGFzcyBkaXJlY3RpdmUuXG4gKlxuICogTmdDbGFzcyBiZWhhdmVzIGRpZmZlcmVubHkgd2hldGhlciBvciBub3QgVkUgaXMgYmVpbmcgdXNlZCBvciBub3QuIElmXG4gKiBwcmVzZW50IHRoZW4gdGhlIGxlZ2FjeSBuZ0NsYXNzIGRpZmZpbmcgYWxnb3JpdGhtIHdpbGwgYmUgdXNlZCBhcyBhblxuICogaW5qZWN0ZWQgc2VydmljZS4gT3RoZXJ3aXNlIHRoZSBuZXcgZGlmZmluZyBhbGdvcml0aG0gKHdoaWNoIGRlbGVnYXRlc1xuICogdG8gdGhlIGBbY2xhc3NdYCBiaW5kaW5nKSB3aWxsIGJlIHVzZWQuIFRoaXMgdG9nZ2xlIGJlaGF2aW9yIGlzIGRvbmUgc29cbiAqIHZpYSB0aGUgaXZ5X3N3aXRjaCBtZWNoYW5pc20uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0NsYXNzSW1wbCB7XG4gIGFic3RyYWN0IHNldENsYXNzKHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCBzZXROZ0NsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSk6IHZvaWQ7XG4gIGFic3RyYWN0IGFwcGx5Q2hhbmdlcygpOiB2b2lkO1xuICBhYnN0cmFjdCBnZXRWYWx1ZSgpOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdDbGFzc1IySW1wbCBleHRlbmRzIE5nQ2xhc3NJbXBsIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyICE6IEl0ZXJhYmxlRGlmZmVyPHN0cmluZz58IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9rZXlWYWx1ZURpZmZlciAhOiBLZXlWYWx1ZURpZmZlcjxzdHJpbmcsIGFueT58IG51bGw7XG4gIHByaXZhdGUgX2luaXRpYWxDbGFzc2VzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfcmF3Q2xhc3MgITogc3RyaW5nW10gfCBTZXQ8c3RyaW5nPnwge1trbGFzczogc3RyaW5nXTogYW55fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIF9rZXlWYWx1ZURpZmZlcnM6IEtleVZhbHVlRGlmZmVycyxcbiAgICAgIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiBudWxsOyB9XG5cbiAgc2V0Q2xhc3ModmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3JlbW92ZUNsYXNzZXModGhpcy5faW5pdGlhbENsYXNzZXMpO1xuICAgIHRoaXMuX2luaXRpYWxDbGFzc2VzID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnNwbGl0KC9cXHMrLykgOiBbXTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5faW5pdGlhbENsYXNzZXMpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7XG4gIH1cblxuXG4gIHNldE5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fcmVtb3ZlQ2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHRoaXMuX2luaXRpYWxDbGFzc2VzKTtcblxuICAgIHRoaXMuX2l0ZXJhYmxlRGlmZmVyID0gbnVsbDtcbiAgICB0aGlzLl9rZXlWYWx1ZURpZmZlciA9IG51bGw7XG5cbiAgICB0aGlzLl9yYXdDbGFzcyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS5zcGxpdCgvXFxzKy8pIDogdmFsdWU7XG5cbiAgICBpZiAodGhpcy5fcmF3Q2xhc3MpIHtcbiAgICAgIGlmIChpc0xpc3RMaWtlSXRlcmFibGUodGhpcy5fcmF3Q2xhc3MpKSB7XG4gICAgICAgIHRoaXMuX2l0ZXJhYmxlRGlmZmVyID0gdGhpcy5faXRlcmFibGVEaWZmZXJzLmZpbmQodGhpcy5fcmF3Q2xhc3MpLmNyZWF0ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSB0aGlzLl9rZXlWYWx1ZURpZmZlcnMuZmluZCh0aGlzLl9yYXdDbGFzcykuY3JlYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXBwbHlDaGFuZ2VzKCkge1xuICAgIGlmICh0aGlzLl9pdGVyYWJsZURpZmZlcikge1xuICAgICAgY29uc3QgaXRlcmFibGVDaGFuZ2VzID0gdGhpcy5faXRlcmFibGVEaWZmZXIuZGlmZih0aGlzLl9yYXdDbGFzcyBhcyBzdHJpbmdbXSk7XG4gICAgICBpZiAoaXRlcmFibGVDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGl0ZXJhYmxlQ2hhbmdlcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9rZXlWYWx1ZURpZmZlcikge1xuICAgICAgY29uc3Qga2V5VmFsdWVDaGFuZ2VzID0gdGhpcy5fa2V5VmFsdWVEaWZmZXIuZGlmZih0aGlzLl9yYXdDbGFzcyBhc3tbazogc3RyaW5nXTogYW55fSk7XG4gICAgICBpZiAoa2V5VmFsdWVDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGtleVZhbHVlQ2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlLZXlWYWx1ZUNoYW5nZXMoY2hhbmdlczogS2V5VmFsdWVDaGFuZ2VzPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHtcbiAgICAgIGlmIChyZWNvcmQucHJldmlvdXNWYWx1ZSkge1xuICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8c3RyaW5nPik6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHJlY29yZC5pdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgTmdDbGFzcyBjYW4gb25seSB0b2dnbGUgQ1NTIGNsYXNzZXMgZXhwcmVzc2VkIGFzIHN0cmluZ3MsIGdvdDogJHtzdHJpbmdpZnkocmVjb3JkLml0ZW0pfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIGZhbHNlKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBhIGNvbGxlY3Rpb24gb2YgQ1NTIGNsYXNzZXMgdG8gdGhlIERPTSBlbGVtZW50LlxuICAgKlxuICAgKiBGb3IgYXJndW1lbnQgb2YgdHlwZSBTZXQgYW5kIEFycmF5IENTUyBjbGFzcyBuYW1lcyBjb250YWluZWQgaW4gdGhvc2UgY29sbGVjdGlvbnMgYXJlIGFsd2F5c1xuICAgKiBhZGRlZC5cbiAgICogRm9yIGFyZ3VtZW50IG9mIHR5cGUgTWFwIENTUyBjbGFzcyBuYW1lIGluIHRoZSBtYXAncyBrZXkgaXMgdG9nZ2xlZCBiYXNlZCBvbiB0aGUgdmFsdWUgKGFkZGVkXG4gICAqIGZvciB0cnV0aHkgYW5kIHJlbW92ZWQgZm9yIGZhbHN5KS5cbiAgICovXG4gIHByaXZhdGUgX2FwcGx5Q2xhc3NlcyhyYXdDbGFzc1ZhbDogc3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIGlmIChyYXdDbGFzc1ZhbCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmF3Q2xhc3NWYWwpIHx8IHJhd0NsYXNzVmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICg8YW55PnJhd0NsYXNzVmFsKS5mb3JFYWNoKChrbGFzczogc3RyaW5nKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgdHJ1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmtleXMocmF3Q2xhc3NWYWwpLmZvckVhY2goa2xhc3MgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsICEhcmF3Q2xhc3NWYWxba2xhc3NdKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjb2xsZWN0aW9uIG9mIENTUyBjbGFzc2VzIGZyb20gdGhlIERPTSBlbGVtZW50LiBUaGlzIGlzIG1vc3RseSB1c2VmdWwgZm9yIGNsZWFudXBcbiAgICogcHVycG9zZXMuXG4gICAqL1xuICBwcml2YXRlIF9yZW1vdmVDbGFzc2VzKHJhd0NsYXNzVmFsOiBzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgaWYgKHJhd0NsYXNzVmFsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdDbGFzc1ZhbCkgfHwgcmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxhbnk+cmF3Q2xhc3NWYWwpLmZvckVhY2goKGtsYXNzOiBzdHJpbmcpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBmYWxzZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmtleXMocmF3Q2xhc3NWYWwpLmZvckVhY2goa2xhc3MgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIGZhbHNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3Moa2xhc3M6IHN0cmluZywgZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGtsYXNzID0ga2xhc3MudHJpbSgpO1xuICAgIGlmIChrbGFzcykge1xuICAgICAga2xhc3Muc3BsaXQoL1xccysvZykuZm9yRWFjaChrbGFzcyA9PiB7XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5fcmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBrbGFzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBrbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdDbGFzc1IzSW1wbCBleHRlbmRzIE5nQ2xhc3NJbXBsIHtcbiAgcHJpdmF0ZSBfdmFsdWU6IHtba2V5OiBzdHJpbmddOiBib29sZWFufXxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbmdDbGFzc0RpZmZlciA9IG5ldyBTdHlsaW5nRGlmZmVyPHtba2V5OiBzdHJpbmddOiB0cnVlfT4oXG4gICAgICAnTmdDbGFzcycsIFN0eWxpbmdEaWZmZXJPcHRpb25zLlRyaW1Qcm9wZXJ0aWVzfFxuICAgICAgICAgICAgICAgICBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1N1YktleXN8XG4gICAgICAgICAgICAgICAgIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3RyaW5nVmFsdWV8U3R5bGluZ0RpZmZlck9wdGlvbnMuRm9yY2VBc01hcCk7XG4gIHByaXZhdGUgX2NsYXNzU3RyaW5nRGlmZmVyOiBTdHlsaW5nRGlmZmVyPHtba2V5OiBzdHJpbmddOiB0cnVlfT58bnVsbCA9IG51bGw7XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl92YWx1ZTsgfVxuXG4gIHNldENsYXNzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAvLyBlYXJseSBleGl0IGluY2FzZSB0aGUgYmluZGluZyBnZXRzIGVtaXR0ZWQgYXMgYW4gZW1wdHkgdmFsdWUgd2hpY2hcbiAgICAvLyBtZWFucyB0aGVyZSBpcyBubyByZWFzb24gdG8gaW5zdGFudGlhdGUgYW5kIGRpZmYgdGhlIHZhbHVlcy4uLlxuICAgIGlmICghdmFsdWUgJiYgIXRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyKSByZXR1cm47XG5cbiAgICB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlciA9IHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyIHx8XG4gICAgICAgIG5ldyBTdHlsaW5nRGlmZmVyKCdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3RyaW5nVmFsdWUgfCBTdHlsaW5nRGlmZmVyT3B0aW9ucy5Gb3JjZUFzTWFwKTtcbiAgICB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlci5zZXRJbnB1dCh2YWx1ZSk7XG4gIH1cblxuICBzZXROZ0NsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX25nQ2xhc3NEaWZmZXIuc2V0SW5wdXQodmFsdWUpO1xuICB9XG5cbiAgYXBwbHlDaGFuZ2VzKCkge1xuICAgIGNvbnN0IGNsYXNzQ2hhbmdlZCA9IHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyID8gdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIudXBkYXRlVmFsdWUoKSA6IGZhbHNlO1xuICAgIGNvbnN0IG5nQ2xhc3NDaGFuZ2VkID0gdGhpcy5fbmdDbGFzc0RpZmZlci51cGRhdGVWYWx1ZSgpO1xuICAgIGlmIChjbGFzc0NoYW5nZWQgfHwgbmdDbGFzc0NoYW5nZWQpIHtcbiAgICAgIGxldCBuZ0NsYXNzVmFsdWUgPSB0aGlzLl9uZ0NsYXNzRGlmZmVyLnZhbHVlO1xuICAgICAgbGV0IGNsYXNzVmFsdWUgPSB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlciA/IHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyLnZhbHVlIDogbnVsbDtcblxuICAgICAgLy8gbWVyZ2UgY2xhc3NWYWx1ZSBhbmQgbmdDbGFzc1ZhbHVlIGFuZCBzZXQgdmFsdWVcbiAgICAgIHRoaXMuX3ZhbHVlID0gKGNsYXNzVmFsdWUgJiYgbmdDbGFzc1ZhbHVlKSA/IHsuLi5jbGFzc1ZhbHVlLCAuLi5uZ0NsYXNzVmFsdWV9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzVmFsdWUgfHwgbmdDbGFzc1ZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG4vLyB0aGUgaW1wbGVtZW50YXRpb24gZm9yIGJvdGggTmdTdHlsZVIySW1wbCBhbmQgTmdTdHlsZVIzSW1wbCBhcmVcbi8vIG5vdCBpdnlfc3dpdGNoJ2QgYXdheSwgaW5zdGVhZCB0aGV5IGFyZSBvbmx5IGhvb2tlZCB1cCBpbnRvIHRoZVxuLy8gREkgdmlhIE5nU3R5bGUncyBkaXJlY3RpdmUncyBwcm92aWRlciBwcm9wZXJ0eS5cbmV4cG9ydCBjb25zdCBOZ0NsYXNzSW1wbFByb3ZpZGVyX19QUkVfUjNfXyA9IHtcbiAgcHJvdmlkZTogTmdDbGFzc0ltcGwsXG4gIHVzZUNsYXNzOiBOZ0NsYXNzUjJJbXBsXG59O1xuXG5leHBvcnQgY29uc3QgTmdDbGFzc0ltcGxQcm92aWRlcl9fUE9TVF9SM19fID0ge1xuICBwcm92aWRlOiBOZ0NsYXNzSW1wbCxcbiAgdXNlQ2xhc3M6IE5nQ2xhc3NSM0ltcGxcbn07XG5cbmV4cG9ydCBjb25zdCBOZ0NsYXNzSW1wbFByb3ZpZGVyID0gTmdDbGFzc0ltcGxQcm92aWRlcl9fUFJFX1IzX187XG4iXX0=