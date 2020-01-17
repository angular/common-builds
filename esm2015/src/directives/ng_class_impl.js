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
import * as i0 from "@angular/core";
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
    { type: Injectable },
];
/** @nocollapse */
NgClassR2Impl.ctorParameters = () => [
    { type: IterableDiffers },
    { type: KeyValueDiffers },
    { type: ElementRef },
    { type: Renderer2 }
];
/** @nocollapse */ NgClassR2Impl.ɵfac = function NgClassR2Impl_Factory(t) { return new (t || NgClassR2Impl)(i0.ɵɵinject(i0.IterableDiffers), i0.ɵɵinject(i0.KeyValueDiffers), i0.ɵɵinject(i0.ElementRef), i0.ɵɵinject(i0.Renderer2)); };
/** @nocollapse */ NgClassR2Impl.ɵprov = i0.ɵɵdefineInjectable({ token: NgClassR2Impl, factory: NgClassR2Impl.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgClassR2Impl, [{
        type: Injectable
    }], function () { return [{ type: i0.IterableDiffers }, { type: i0.KeyValueDiffers }, { type: i0.ElementRef }, { type: i0.Renderer2 }]; }, null); })();
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
    { type: Injectable },
];
/** @nocollapse */ NgClassR3Impl.ɵfac = function NgClassR3Impl_Factory(t) { return ɵNgClassR3Impl_BaseFactory(t || NgClassR3Impl); };
/** @nocollapse */ NgClassR3Impl.ɵprov = i0.ɵɵdefineInjectable({ token: NgClassR3Impl, factory: NgClassR3Impl.ɵfac });
const ɵNgClassR3Impl_BaseFactory = i0.ɵɵgetInheritedFactory(NgClassR3Impl);
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgClassR3Impl, [{
        type: Injectable
    }], null, null); })();
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
export const NgClassImplProvider = NgClassImplProvider__POST_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3NfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jbGFzc19pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFtQyxlQUFlLEVBQW1DLGVBQWUsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV4TyxPQUFPLEVBQUMsYUFBYSxFQUF1QixNQUFNLGtCQUFrQixDQUFDOzs7Ozs7Ozs7Ozs7QUFXckUsTUFBTSxPQUFnQixXQUFXO0NBS2hDOzs7Ozs7O0lBSkMsc0RBQXVDOzs7Ozs7SUFDdkMsd0RBQXFGOzs7OztJQUNyRixxREFBOEI7Ozs7O0lBQzlCLGlEQUErQzs7QUFJakQsTUFBTSxPQUFPLGFBQWMsU0FBUSxXQUFXOzs7Ozs7O0lBUzVDLFlBQ1ksZ0JBQWlDLEVBQVUsZ0JBQWlDLEVBQzVFLEtBQWlCLEVBQVUsU0FBb0I7UUFDekQsS0FBSyxFQUFFLENBQUM7UUFGRSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtRQUM1RSxVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBVztRQU5uRCxvQkFBZSxHQUFhLEVBQUUsQ0FBQztJQVF2QyxDQUFDOzs7O0lBRUQsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFM0IsUUFBUSxDQUFDLEtBQWE7UUFDcEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUss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QU0sR0FBRyxDQUFDLFVBQVUsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLGlDQUFLLFVBQVUsR0FBSyxZQUFZLEVBQUUsQ0FBQztnQkFDbEMsVUFBVSxJQUFJLFlBQVksQ0FBQztTQUN6RTtJQUNILENBQUM7OztZQXJDRixVQUFVOztnR0FDRSxhQUFhO3FEQUFiLGFBQWEsV0FBYixhQUFhOzREQUFiLGFBQWE7a0RBQWIsYUFBYTtjQUR6QixVQUFVOzs7Ozs7O0lBRVQsK0JBQXFEOzs7OztJQUNyRCx1Q0FHc0Y7Ozs7O0lBQ3RGLDJDQUE2RTs7Ozs7O0FBb0MvRSxNQUFNLE9BQU8sNkJBQTZCLEdBQUc7SUFDM0MsT0FBTyxFQUFFLFdBQVc7SUFDcEIsUUFBUSxFQUFFLGFBQWE7Q0FDeEI7O0FBRUQsTUFBTSxPQUFPLDhCQUE4QixHQUFHO0lBQzVDLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFFBQVEsRUFBRSxhQUFhO0NBQ3hCOztBQUVELE1BQU0sT0FBTyxtQkFBbUIsR0FMbkIsOEJBS21EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBJdGVyYWJsZUNoYW5nZXMsIEl0ZXJhYmxlRGlmZmVyLCBJdGVyYWJsZURpZmZlcnMsIEtleVZhbHVlQ2hhbmdlcywgS2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVycywgUmVuZGVyZXIyLCDJtWlzTGlzdExpa2VJdGVyYWJsZSBhcyBpc0xpc3RMaWtlSXRlcmFibGUsIMm1c3RyaW5naWZ5IGFzIHN0cmluZ2lmeX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7U3R5bGluZ0RpZmZlciwgU3R5bGluZ0RpZmZlck9wdGlvbnN9IGZyb20gJy4vc3R5bGluZ19kaWZmZXInO1xuXG4vKipcbiAqIFVzZWQgYXMgYSB0b2tlbiBmb3IgYW4gaW5qZWN0ZWQgc2VydmljZSB3aXRoaW4gdGhlIE5nQ2xhc3MgZGlyZWN0aXZlLlxuICpcbiAqIE5nQ2xhc3MgYmVoYXZlcyBkaWZmZXJlbmx5IHdoZXRoZXIgb3Igbm90IFZFIGlzIGJlaW5nIHVzZWQgb3Igbm90LiBJZlxuICogcHJlc2VudCB0aGVuIHRoZSBsZWdhY3kgbmdDbGFzcyBkaWZmaW5nIGFsZ29yaXRobSB3aWxsIGJlIHVzZWQgYXMgYW5cbiAqIGluamVjdGVkIHNlcnZpY2UuIE90aGVyd2lzZSB0aGUgbmV3IGRpZmZpbmcgYWxnb3JpdGhtICh3aGljaCBkZWxlZ2F0ZXNcbiAqIHRvIHRoZSBgW2NsYXNzXWAgYmluZGluZykgd2lsbCBiZSB1c2VkLiBUaGlzIHRvZ2dsZSBiZWhhdmlvciBpcyBkb25lIHNvXG4gKiB2aWEgdGhlIGl2eV9zd2l0Y2ggbWVjaGFuaXNtLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdDbGFzc0ltcGwge1xuICBhYnN0cmFjdCBzZXRDbGFzcyh2YWx1ZTogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3Qgc2V0TmdDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pOiB2b2lkO1xuICBhYnN0cmFjdCBhcHBseUNoYW5nZXMoKTogdm9pZDtcbiAgYWJzdHJhY3QgZ2V0VmFsdWUoKToge1trZXk6IHN0cmluZ106IGFueX18bnVsbDtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3NSMkltcGwgZXh0ZW5kcyBOZ0NsYXNzSW1wbCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9pdGVyYWJsZURpZmZlciAhOiBJdGVyYWJsZURpZmZlcjxzdHJpbmc+fCBudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfa2V5VmFsdWVEaWZmZXIgITogS2V5VmFsdWVEaWZmZXI8c3RyaW5nLCBhbnk+fCBudWxsO1xuICBwcml2YXRlIF9pbml0aWFsQ2xhc3Nlczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3Jhd0NsYXNzICE6IHN0cmluZ1tdIHwgU2V0PHN0cmluZz58IHtba2xhc3M6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9pdGVyYWJsZURpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycywgcHJpdmF0ZSBfa2V5VmFsdWVEaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsXG4gICAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHNldENsYXNzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yZW1vdmVDbGFzc2VzKHRoaXMuX2luaXRpYWxDbGFzc2VzKTtcbiAgICB0aGlzLl9pbml0aWFsQ2xhc3NlcyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS5zcGxpdCgvXFxzKy8pIDogW107XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHRoaXMuX2luaXRpYWxDbGFzc2VzKTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5fcmF3Q2xhc3MpO1xuICB9XG5cblxuICBzZXROZ0NsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX3JlbW92ZUNsYXNzZXModGhpcy5fcmF3Q2xhc3MpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG5cbiAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IG51bGw7XG4gICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fcmF3Q2xhc3MgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUuc3BsaXQoL1xccysvKSA6IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMuX3Jhd0NsYXNzKSB7XG4gICAgICBpZiAoaXNMaXN0TGlrZUl0ZXJhYmxlKHRoaXMuX3Jhd0NsYXNzKSkge1xuICAgICAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVycy5maW5kKHRoaXMuX3Jhd0NsYXNzKS5jcmVhdGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2tleVZhbHVlRGlmZmVyID0gdGhpcy5fa2V5VmFsdWVEaWZmZXJzLmZpbmQodGhpcy5fcmF3Q2xhc3MpLmNyZWF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFwcGx5Q2hhbmdlcygpIHtcbiAgICBpZiAodGhpcy5faXRlcmFibGVEaWZmZXIpIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlQ2hhbmdlcyA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MgYXMgc3RyaW5nW10pO1xuICAgICAgaWYgKGl0ZXJhYmxlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhpdGVyYWJsZUNoYW5nZXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fa2V5VmFsdWVEaWZmZXIpIHtcbiAgICAgIGNvbnN0IGtleVZhbHVlQ2hhbmdlcyA9IHRoaXMuX2tleVZhbHVlRGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MgYXN7W2s6IHN0cmluZ106IGFueX0pO1xuICAgICAgaWYgKGtleVZhbHVlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLl9hcHBseUtleVZhbHVlQ2hhbmdlcyhrZXlWYWx1ZUNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxzdHJpbmcsIGFueT4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB7XG4gICAgICBpZiAocmVjb3JkLnByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlJdGVyYWJsZUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPHN0cmluZz4pOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiByZWNvcmQuaXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYE5nQ2xhc3MgY2FuIG9ubHkgdG9nZ2xlIENTUyBjbGFzc2VzIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBnb3Q6ICR7c3RyaW5naWZ5KHJlY29yZC5pdGVtKX1gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCBmYWxzZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBjb2xsZWN0aW9uIG9mIENTUyBjbGFzc2VzIHRvIHRoZSBET00gZWxlbWVudC5cbiAgICpcbiAgICogRm9yIGFyZ3VtZW50IG9mIHR5cGUgU2V0IGFuZCBBcnJheSBDU1MgY2xhc3MgbmFtZXMgY29udGFpbmVkIGluIHRob3NlIGNvbGxlY3Rpb25zIGFyZSBhbHdheXNcbiAgICogYWRkZWQuXG4gICAqIEZvciBhcmd1bWVudCBvZiB0eXBlIE1hcCBDU1MgY2xhc3MgbmFtZSBpbiB0aGUgbWFwJ3Mga2V5IGlzIHRvZ2dsZWQgYmFzZWQgb24gdGhlIHZhbHVlIChhZGRlZFxuICAgKiBmb3IgdHJ1dGh5IGFuZCByZW1vdmVkIGZvciBmYWxzeSkuXG4gICAqL1xuICBwcml2YXRlIF9hcHBseUNsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAocmF3Q2xhc3NWYWwpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0NsYXNzVmFsKSB8fCByYXdDbGFzc1ZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAoPGFueT5yYXdDbGFzc1ZhbCkuZm9yRWFjaCgoa2xhc3M6IHN0cmluZykgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIHRydWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJhd0NsYXNzVmFsKS5mb3JFYWNoKGtsYXNzID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCAhIXJhd0NsYXNzVmFsW2tsYXNzXSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgY29sbGVjdGlvbiBvZiBDU1MgY2xhc3NlcyBmcm9tIHRoZSBET00gZWxlbWVudC4gVGhpcyBpcyBtb3N0bHkgdXNlZnVsIGZvciBjbGVhbnVwXG4gICAqIHB1cnBvc2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlQ2xhc3NlcyhyYXdDbGFzc1ZhbDogc3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIGlmIChyYXdDbGFzc1ZhbCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmF3Q2xhc3NWYWwpIHx8IHJhd0NsYXNzVmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICg8YW55PnJhd0NsYXNzVmFsKS5mb3JFYWNoKChrbGFzczogc3RyaW5nKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgZmFsc2UpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJhd0NsYXNzVmFsKS5mb3JFYWNoKGtsYXNzID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBmYWxzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RvZ2dsZUNsYXNzKGtsYXNzOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBrbGFzcyA9IGtsYXNzLnRyaW0oKTtcbiAgICBpZiAoa2xhc3MpIHtcbiAgICAgIGtsYXNzLnNwbGl0KC9cXHMrL2cpLmZvckVhY2goa2xhc3MgPT4ge1xuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3NSM0ltcGwgZXh0ZW5kcyBOZ0NsYXNzSW1wbCB7XG4gIHByaXZhdGUgX3ZhbHVlOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn18bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX25nQ2xhc3NEaWZmZXIgPSBuZXcgU3R5bGluZ0RpZmZlcjx7W2tleTogc3RyaW5nXTogdHJ1ZX0+KFxuICAgICAgJ05nQ2xhc3MnLCBTdHlsaW5nRGlmZmVyT3B0aW9ucy5UcmltUHJvcGVydGllc3xcbiAgICAgICAgICAgICAgICAgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dTdWJLZXlzfFxuICAgICAgICAgICAgICAgICBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1N0cmluZ1ZhbHVlfFN0eWxpbmdEaWZmZXJPcHRpb25zLkZvcmNlQXNNYXApO1xuICBwcml2YXRlIF9jbGFzc1N0cmluZ0RpZmZlcjogU3R5bGluZ0RpZmZlcjx7W2tleTogc3RyaW5nXTogdHJ1ZX0+fG51bGwgPSBudWxsO1xuXG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5fdmFsdWU7IH1cblxuICBzZXRDbGFzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgLy8gZWFybHkgZXhpdCBpbmNhc2UgdGhlIGJpbmRpbmcgZ2V0cyBlbWl0dGVkIGFzIGFuIGVtcHR5IHZhbHVlIHdoaWNoXG4gICAgLy8gbWVhbnMgdGhlcmUgaXMgbm8gcmVhc29uIHRvIGluc3RhbnRpYXRlIGFuZCBkaWZmIHRoZSB2YWx1ZXMuLi5cbiAgICBpZiAoIXZhbHVlICYmICF0aGlzLl9jbGFzc1N0cmluZ0RpZmZlcikgcmV0dXJuO1xuXG4gICAgdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIgPSB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlciB8fFxuICAgICAgICBuZXcgU3R5bGluZ0RpZmZlcignY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1N0cmluZ1ZhbHVlIHwgU3R5bGluZ0RpZmZlck9wdGlvbnMuRm9yY2VBc01hcCk7XG4gICAgdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIuc2V0SW5wdXQodmFsdWUpO1xuICB9XG5cbiAgc2V0TmdDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLl9uZ0NsYXNzRGlmZmVyLnNldElucHV0KHZhbHVlKTtcbiAgfVxuXG4gIGFwcGx5Q2hhbmdlcygpIHtcbiAgICBjb25zdCBjbGFzc0NoYW5nZWQgPSB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlciA/IHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyLnVwZGF0ZVZhbHVlKCkgOiBmYWxzZTtcbiAgICBjb25zdCBuZ0NsYXNzQ2hhbmdlZCA9IHRoaXMuX25nQ2xhc3NEaWZmZXIudXBkYXRlVmFsdWUoKTtcbiAgICBpZiAoY2xhc3NDaGFuZ2VkIHx8IG5nQ2xhc3NDaGFuZ2VkKSB7XG4gICAgICBsZXQgbmdDbGFzc1ZhbHVlID0gdGhpcy5fbmdDbGFzc0RpZmZlci52YWx1ZTtcbiAgICAgIGxldCBjbGFzc1ZhbHVlID0gdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIgPyB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlci52YWx1ZSA6IG51bGw7XG5cbiAgICAgIC8vIG1lcmdlIGNsYXNzVmFsdWUgYW5kIG5nQ2xhc3NWYWx1ZSBhbmQgc2V0IHZhbHVlXG4gICAgICB0aGlzLl92YWx1ZSA9IChjbGFzc1ZhbHVlICYmIG5nQ2xhc3NWYWx1ZSkgPyB7Li4uY2xhc3NWYWx1ZSwgLi4ubmdDbGFzc1ZhbHVlfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc1ZhbHVlIHx8IG5nQ2xhc3NWYWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuLy8gdGhlIGltcGxlbWVudGF0aW9uIGZvciBib3RoIE5nU3R5bGVSMkltcGwgYW5kIE5nU3R5bGVSM0ltcGwgYXJlXG4vLyBub3QgaXZ5X3N3aXRjaCdkIGF3YXksIGluc3RlYWQgdGhleSBhcmUgb25seSBob29rZWQgdXAgaW50byB0aGVcbi8vIERJIHZpYSBOZ1N0eWxlJ3MgZGlyZWN0aXZlJ3MgcHJvdmlkZXIgcHJvcGVydHkuXG5leHBvcnQgY29uc3QgTmdDbGFzc0ltcGxQcm92aWRlcl9fUFJFX1IzX18gPSB7XG4gIHByb3ZpZGU6IE5nQ2xhc3NJbXBsLFxuICB1c2VDbGFzczogTmdDbGFzc1IySW1wbFxufTtcblxuZXhwb3J0IGNvbnN0IE5nQ2xhc3NJbXBsUHJvdmlkZXJfX1BPU1RfUjNfXyA9IHtcbiAgcHJvdmlkZTogTmdDbGFzc0ltcGwsXG4gIHVzZUNsYXNzOiBOZ0NsYXNzUjNJbXBsXG59O1xuXG5leHBvcnQgY29uc3QgTmdDbGFzc0ltcGxQcm92aWRlciA9IE5nQ2xhc3NJbXBsUHJvdmlkZXJfX1BSRV9SM19fO1xuIl19