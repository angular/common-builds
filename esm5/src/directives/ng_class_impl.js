import { __assign, __decorate, __extends, __metadata } from "tslib";
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
 */
var NgClassImpl = /** @class */ (function () {
    function NgClassImpl() {
    }
    return NgClassImpl;
}());
export { NgClassImpl };
var NgClassR2Impl = /** @class */ (function (_super) {
    __extends(NgClassR2Impl, _super);
    function NgClassR2Impl(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        var _this = _super.call(this) || this;
        _this._iterableDiffers = _iterableDiffers;
        _this._keyValueDiffers = _keyValueDiffers;
        _this._ngEl = _ngEl;
        _this._renderer = _renderer;
        _this._initialClasses = [];
        return _this;
    }
    NgClassR2Impl.prototype.getValue = function () { return null; };
    NgClassR2Impl.prototype.setClass = function (value) {
        this._removeClasses(this._initialClasses);
        this._initialClasses = typeof value === 'string' ? value.split(/\s+/) : [];
        this._applyClasses(this._initialClasses);
        this._applyClasses(this._rawClass);
    };
    NgClassR2Impl.prototype.setNgClass = function (value) {
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
    };
    NgClassR2Impl.prototype.applyChanges = function () {
        if (this._iterableDiffer) {
            var iterableChanges = this._iterableDiffer.diff(this._rawClass);
            if (iterableChanges) {
                this._applyIterableChanges(iterableChanges);
            }
        }
        else if (this._keyValueDiffer) {
            var keyValueChanges = this._keyValueDiffer.diff(this._rawClass);
            if (keyValueChanges) {
                this._applyKeyValueChanges(keyValueChanges);
            }
        }
    };
    NgClassR2Impl.prototype._applyKeyValueChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { return _this._toggleClass(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { return _this._toggleClass(record.key, record.currentValue); });
        changes.forEachRemovedItem(function (record) {
            if (record.previousValue) {
                _this._toggleClass(record.key, false);
            }
        });
    };
    NgClassR2Impl.prototype._applyIterableChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) {
            if (typeof record.item === 'string') {
                _this._toggleClass(record.item, true);
            }
            else {
                throw new Error("NgClass can only toggle CSS classes expressed as strings, got: " + stringify(record.item));
            }
        });
        changes.forEachRemovedItem(function (record) { return _this._toggleClass(record.item, false); });
    };
    /**
     * Applies a collection of CSS classes to the DOM element.
     *
     * For argument of type Set and Array CSS class names contained in those collections are always
     * added.
     * For argument of type Map CSS class name in the map's key is toggled based on the value (added
     * for truthy and removed for falsy).
     */
    NgClassR2Impl.prototype._applyClasses = function (rawClassVal) {
        var _this = this;
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                rawClassVal.forEach(function (klass) { return _this._toggleClass(klass, true); });
            }
            else {
                Object.keys(rawClassVal).forEach(function (klass) { return _this._toggleClass(klass, !!rawClassVal[klass]); });
            }
        }
    };
    /**
     * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
     * purposes.
     */
    NgClassR2Impl.prototype._removeClasses = function (rawClassVal) {
        var _this = this;
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                rawClassVal.forEach(function (klass) { return _this._toggleClass(klass, false); });
            }
            else {
                Object.keys(rawClassVal).forEach(function (klass) { return _this._toggleClass(klass, false); });
            }
        }
    };
    NgClassR2Impl.prototype._toggleClass = function (klass, enabled) {
        var _this = this;
        klass = klass.trim();
        if (klass) {
            klass.split(/\s+/g).forEach(function (klass) {
                if (enabled) {
                    _this._renderer.addClass(_this._ngEl.nativeElement, klass);
                }
                else {
                    _this._renderer.removeClass(_this._ngEl.nativeElement, klass);
                }
            });
        }
    };
    NgClassR2Impl = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [IterableDiffers, KeyValueDiffers,
            ElementRef, Renderer2])
    ], NgClassR2Impl);
    return NgClassR2Impl;
}(NgClassImpl));
export { NgClassR2Impl };
var NgClassR3Impl = /** @class */ (function (_super) {
    __extends(NgClassR3Impl, _super);
    function NgClassR3Impl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._value = null;
        _this._ngClassDiffer = new StylingDiffer('NgClass', 1 /* TrimProperties */ |
            2 /* AllowSubKeys */ |
            4 /* AllowStringValue */ | 16 /* ForceAsMap */);
        _this._classStringDiffer = null;
        return _this;
    }
    NgClassR3Impl.prototype.getValue = function () { return this._value; };
    NgClassR3Impl.prototype.setClass = function (value) {
        // early exit incase the binding gets emitted as an empty value which
        // means there is no reason to instantiate and diff the values...
        if (!value && !this._classStringDiffer)
            return;
        this._classStringDiffer = this._classStringDiffer ||
            new StylingDiffer('class', 4 /* AllowStringValue */ | 16 /* ForceAsMap */);
        this._classStringDiffer.setInput(value);
    };
    NgClassR3Impl.prototype.setNgClass = function (value) {
        this._ngClassDiffer.setInput(value);
    };
    NgClassR3Impl.prototype.applyChanges = function () {
        var classChanged = this._classStringDiffer ? this._classStringDiffer.updateValue() : false;
        var ngClassChanged = this._ngClassDiffer.updateValue();
        if (classChanged || ngClassChanged) {
            var ngClassValue = this._ngClassDiffer.value;
            var classValue = this._classStringDiffer ? this._classStringDiffer.value : null;
            // merge classValue and ngClassValue and set value
            this._value = (classValue && ngClassValue) ? __assign(__assign({}, classValue), ngClassValue) :
                classValue || ngClassValue;
        }
    };
    NgClassR3Impl = __decorate([
        Injectable()
    ], NgClassR3Impl);
    return NgClassR3Impl;
}(NgClassImpl));
export { NgClassR3Impl };
// the implementation for both NgStyleR2Impl and NgStyleR3Impl are
// not ivy_switch'd away, instead they are only hooked up into the
// DI via NgStyle's directive's provider property.
export var NgClassImplProvider__PRE_R3__ = {
    provide: NgClassImpl,
    useClass: NgClassR2Impl
};
export var NgClassImplProvider__POST_R3__ = {
    provide: NgClassImpl,
    useClass: NgClassR3Impl
};
export var NgClassImplProvider = NgClassImplProvider__PRE_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3NfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jbGFzc19pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBbUMsZUFBZSxFQUFtQyxlQUFlLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFeE8sT0FBTyxFQUFDLGFBQWEsRUFBdUIsTUFBTSxrQkFBa0IsQ0FBQztBQUVyRTs7Ozs7Ozs7R0FRRztBQUNIO0lBQUE7SUFLQSxDQUFDO0lBQUQsa0JBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQzs7QUFHRDtJQUFtQyxpQ0FBVztJQVM1Qyx1QkFDWSxnQkFBaUMsRUFBVSxnQkFBaUMsRUFDNUUsS0FBaUIsRUFBVSxTQUFvQjtRQUYzRCxZQUdFLGlCQUFPLFNBQ1I7UUFIVyxzQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBQVUsc0JBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtRQUM1RSxXQUFLLEdBQUwsS0FBSyxDQUFZO1FBQVUsZUFBUyxHQUFULFNBQVMsQ0FBVztRQU5uRCxxQkFBZSxHQUFhLEVBQUUsQ0FBQzs7SUFRdkMsQ0FBQztJQUVELGdDQUFRLEdBQVIsY0FBYSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFM0IsZ0NBQVEsR0FBUixVQUFTLEtBQWE7UUFDcEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFD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LEVBQUUsQ0FBQztnQkFDbEMsVUFBVSxJQUFJLFlBQVksQ0FBQztTQUN6RTtJQUNILENBQUM7SUFwQ1UsYUFBYTtRQUR6QixVQUFVLEVBQUU7T0FDQSxhQUFhLENBcUN6QjtJQUFELG9CQUFDO0NBQUEsQUFyQ0QsQ0FBbUMsV0FBVyxHQXFDN0M7U0FyQ1ksYUFBYTtBQXVDMUIsa0VBQWtFO0FBQ2xFLGtFQUFrRTtBQUNsRSxrREFBa0Q7QUFDbEQsTUFBTSxDQUFDLElBQU0sNkJBQTZCLEdBQUc7SUFDM0MsT0FBTyxFQUFFLFdBQVc7SUFDcEIsUUFBUSxFQUFFLGFBQWE7Q0FDeEIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLDhCQUE4QixHQUFHO0lBQzVDLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFFBQVEsRUFBRSxhQUFhO0NBQ3hCLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FBRyw2QkFBNkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RWxlbWVudFJlZiwgSW5qZWN0YWJsZSwgSXRlcmFibGVDaGFuZ2VzLCBJdGVyYWJsZURpZmZlciwgSXRlcmFibGVEaWZmZXJzLCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlcnMsIFJlbmRlcmVyMiwgybVpc0xpc3RMaWtlSXRlcmFibGUgYXMgaXNMaXN0TGlrZUl0ZXJhYmxlLCDJtXN0cmluZ2lmeSBhcyBzdHJpbmdpZnl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1N0eWxpbmdEaWZmZXIsIFN0eWxpbmdEaWZmZXJPcHRpb25zfSBmcm9tICcuL3N0eWxpbmdfZGlmZmVyJztcblxuLyoqXG4gKiBVc2VkIGFzIGEgdG9rZW4gZm9yIGFuIGluamVjdGVkIHNlcnZpY2Ugd2l0aGluIHRoZSBOZ0NsYXNzIGRpcmVjdGl2ZS5cbiAqXG4gKiBOZ0NsYXNzIGJlaGF2ZXMgZGlmZmVyZW5seSB3aGV0aGVyIG9yIG5vdCBWRSBpcyBiZWluZyB1c2VkIG9yIG5vdC4gSWZcbiAqIHByZXNlbnQgdGhlbiB0aGUgbGVnYWN5IG5nQ2xhc3MgZGlmZmluZyBhbGdvcml0aG0gd2lsbCBiZSB1c2VkIGFzIGFuXG4gKiBpbmplY3RlZCBzZXJ2aWNlLiBPdGhlcndpc2UgdGhlIG5ldyBkaWZmaW5nIGFsZ29yaXRobSAod2hpY2ggZGVsZWdhdGVzXG4gKiB0byB0aGUgYFtjbGFzc11gIGJpbmRpbmcpIHdpbGwgYmUgdXNlZC4gVGhpcyB0b2dnbGUgYmVoYXZpb3IgaXMgZG9uZSBzb1xuICogdmlhIHRoZSBpdnlfc3dpdGNoIG1lY2hhbmlzbS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nQ2xhc3NJbXBsIHtcbiAgYWJzdHJhY3Qgc2V0Q2xhc3ModmFsdWU6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IHNldE5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KTogdm9pZDtcbiAgYWJzdHJhY3QgYXBwbHlDaGFuZ2VzKCk6IHZvaWQ7XG4gIGFic3RyYWN0IGdldFZhbHVlKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGw7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ0NsYXNzUjJJbXBsIGV4dGVuZHMgTmdDbGFzc0ltcGwge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfaXRlcmFibGVEaWZmZXIgITogSXRlcmFibGVEaWZmZXI8c3RyaW5nPnwgbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2tleVZhbHVlRGlmZmVyICE6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgYW55PnwgbnVsbDtcbiAgcHJpdmF0ZSBfaW5pdGlhbENsYXNzZXM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9yYXdDbGFzcyAhOiBzdHJpbmdbXSB8IFNldDxzdHJpbmc+fCB7W2tsYXNzOiBzdHJpbmddOiBhbnl9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfaXRlcmFibGVEaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsIHByaXZhdGUgX2tleVZhbHVlRGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgICAgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXRWYWx1ZSgpIHsgcmV0dXJuIG51bGw7IH1cblxuICBzZXRDbGFzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcmVtb3ZlQ2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUuc3BsaXQoL1xccysvKSA6IFtdO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9pbml0aWFsQ2xhc3Nlcyk7XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTtcbiAgfVxuXG5cbiAgc2V0TmdDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLl9yZW1vdmVDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5faW5pdGlhbENsYXNzZXMpO1xuXG4gICAgdGhpcy5faXRlcmFibGVEaWZmZXIgPSBudWxsO1xuICAgIHRoaXMuX2tleVZhbHVlRGlmZmVyID0gbnVsbDtcblxuICAgIHRoaXMuX3Jhd0NsYXNzID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnNwbGl0KC9cXHMrLykgOiB2YWx1ZTtcblxuICAgIGlmICh0aGlzLl9yYXdDbGFzcykge1xuICAgICAgaWYgKGlzTGlzdExpa2VJdGVyYWJsZSh0aGlzLl9yYXdDbGFzcykpIHtcbiAgICAgICAgdGhpcy5faXRlcmFibGVEaWZmZXIgPSB0aGlzLl9pdGVyYWJsZURpZmZlcnMuZmluZCh0aGlzLl9yYXdDbGFzcykuY3JlYXRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9rZXlWYWx1ZURpZmZlciA9IHRoaXMuX2tleVZhbHVlRGlmZmVycy5maW5kKHRoaXMuX3Jhd0NsYXNzKS5jcmVhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhcHBseUNoYW5nZXMoKSB7XG4gICAgaWYgKHRoaXMuX2l0ZXJhYmxlRGlmZmVyKSB7XG4gICAgICBjb25zdCBpdGVyYWJsZUNoYW5nZXMgPSB0aGlzLl9pdGVyYWJsZURpZmZlci5kaWZmKHRoaXMuX3Jhd0NsYXNzIGFzIHN0cmluZ1tdKTtcbiAgICAgIGlmIChpdGVyYWJsZUNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlJdGVyYWJsZUNoYW5nZXMoaXRlcmFibGVDaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX2tleVZhbHVlRGlmZmVyKSB7XG4gICAgICBjb25zdCBrZXlWYWx1ZUNoYW5nZXMgPSB0aGlzLl9rZXlWYWx1ZURpZmZlci5kaWZmKHRoaXMuX3Jhd0NsYXNzIGFze1trOiBzdHJpbmddOiBhbnl9KTtcbiAgICAgIGlmIChrZXlWYWx1ZUNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMoa2V5VmFsdWVDaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzOiBLZXlWYWx1ZUNoYW5nZXM8c3RyaW5nLCBhbnk+KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4ge1xuICAgICAgaWYgKHJlY29yZC5wcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxzdHJpbmc+KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgcmVjb3JkLml0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBOZ0NsYXNzIGNhbiBvbmx5IHRvZ2dsZSBDU1MgY2xhc3NlcyBleHByZXNzZWQgYXMgc3RyaW5ncywgZ290OiAke3N0cmluZ2lmeShyZWNvcmQuaXRlbSl9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgZmFsc2UpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGEgY29sbGVjdGlvbiBvZiBDU1MgY2xhc3NlcyB0byB0aGUgRE9NIGVsZW1lbnQuXG4gICAqXG4gICAqIEZvciBhcmd1bWVudCBvZiB0eXBlIFNldCBhbmQgQXJyYXkgQ1NTIGNsYXNzIG5hbWVzIGNvbnRhaW5lZCBpbiB0aG9zZSBjb2xsZWN0aW9ucyBhcmUgYWx3YXlzXG4gICAqIGFkZGVkLlxuICAgKiBGb3IgYXJndW1lbnQgb2YgdHlwZSBNYXAgQ1NTIGNsYXNzIG5hbWUgaW4gdGhlIG1hcCdzIGtleSBpcyB0b2dnbGVkIGJhc2VkIG9uIHRoZSB2YWx1ZSAoYWRkZWRcbiAgICogZm9yIHRydXRoeSBhbmQgcmVtb3ZlZCBmb3IgZmFsc3kpLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXBwbHlDbGFzc2VzKHJhd0NsYXNzVmFsOiBzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgaWYgKHJhd0NsYXNzVmFsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdDbGFzc1ZhbCkgfHwgcmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxhbnk+cmF3Q2xhc3NWYWwpLmZvckVhY2goKGtsYXNzOiBzdHJpbmcpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCB0cnVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3Qua2V5cyhyYXdDbGFzc1ZhbCkuZm9yRWFjaChrbGFzcyA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgISFyYXdDbGFzc1ZhbFtrbGFzc10pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGNvbGxlY3Rpb24gb2YgQ1NTIGNsYXNzZXMgZnJvbSB0aGUgRE9NIGVsZW1lbnQuIFRoaXMgaXMgbW9zdGx5IHVzZWZ1bCBmb3IgY2xlYW51cFxuICAgKiBwdXJwb3Nlcy5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZUNsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAocmF3Q2xhc3NWYWwpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0NsYXNzVmFsKSB8fCByYXdDbGFzc1ZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAoPGFueT5yYXdDbGFzc1ZhbCkuZm9yRWFjaCgoa2xhc3M6IHN0cmluZykgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIGZhbHNlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3Qua2V5cyhyYXdDbGFzc1ZhbCkuZm9yRWFjaChrbGFzcyA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgZmFsc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90b2dnbGVDbGFzcyhrbGFzczogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAga2xhc3MgPSBrbGFzcy50cmltKCk7XG4gICAgaWYgKGtsYXNzKSB7XG4gICAgICBrbGFzcy5zcGxpdCgvXFxzKy9nKS5mb3JFYWNoKGtsYXNzID0+IHtcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ0NsYXNzUjNJbXBsIGV4dGVuZHMgTmdDbGFzc0ltcGwge1xuICBwcml2YXRlIF92YWx1ZToge1trZXk6IHN0cmluZ106IGJvb2xlYW59fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9uZ0NsYXNzRGlmZmVyID0gbmV3IFN0eWxpbmdEaWZmZXI8e1trZXk6IHN0cmluZ106IHRydWV9PihcbiAgICAgICdOZ0NsYXNzJywgU3R5bGluZ0RpZmZlck9wdGlvbnMuVHJpbVByb3BlcnRpZXN8XG4gICAgICAgICAgICAgICAgIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3ViS2V5c3xcbiAgICAgICAgICAgICAgICAgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dTdHJpbmdWYWx1ZXxTdHlsaW5nRGlmZmVyT3B0aW9ucy5Gb3JjZUFzTWFwKTtcbiAgcHJpdmF0ZSBfY2xhc3NTdHJpbmdEaWZmZXI6IFN0eWxpbmdEaWZmZXI8e1trZXk6IHN0cmluZ106IHRydWV9PnxudWxsID0gbnVsbDtcblxuICBnZXRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG5cbiAgc2V0Q2xhc3ModmFsdWU6IHN0cmluZykge1xuICAgIC8vIGVhcmx5IGV4aXQgaW5jYXNlIHRoZSBiaW5kaW5nIGdldHMgZW1pdHRlZCBhcyBhbiBlbXB0eSB2YWx1ZSB3aGljaFxuICAgIC8vIG1lYW5zIHRoZXJlIGlzIG5vIHJlYXNvbiB0byBpbnN0YW50aWF0ZSBhbmQgZGlmZiB0aGUgdmFsdWVzLi4uXG4gICAgaWYgKCF2YWx1ZSAmJiAhdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIpIHJldHVybjtcblxuICAgIHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyID0gdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIgfHxcbiAgICAgICAgbmV3IFN0eWxpbmdEaWZmZXIoJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dTdHJpbmdWYWx1ZSB8IFN0eWxpbmdEaWZmZXJPcHRpb25zLkZvcmNlQXNNYXApO1xuICAgIHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyLnNldElucHV0KHZhbHVlKTtcbiAgfVxuXG4gIHNldE5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fbmdDbGFzc0RpZmZlci5zZXRJbnB1dCh2YWx1ZSk7XG4gIH1cblxuICBhcHBseUNoYW5nZXMoKSB7XG4gICAgY29uc3QgY2xhc3NDaGFuZ2VkID0gdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIgPyB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlci51cGRhdGVWYWx1ZSgpIDogZmFsc2U7XG4gICAgY29uc3QgbmdDbGFzc0NoYW5nZWQgPSB0aGlzLl9uZ0NsYXNzRGlmZmVyLnVwZGF0ZVZhbHVlKCk7XG4gICAgaWYgKGNsYXNzQ2hhbmdlZCB8fCBuZ0NsYXNzQ2hhbmdlZCkge1xuICAgICAgbGV0IG5nQ2xhc3NWYWx1ZSA9IHRoaXMuX25nQ2xhc3NEaWZmZXIudmFsdWU7XG4gICAgICBsZXQgY2xhc3NWYWx1ZSA9IHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyID8gdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIudmFsdWUgOiBudWxsO1xuXG4gICAgICAvLyBtZXJnZSBjbGFzc1ZhbHVlIGFuZCBuZ0NsYXNzVmFsdWUgYW5kIHNldCB2YWx1ZVxuICAgICAgdGhpcy5fdmFsdWUgPSAoY2xhc3NWYWx1ZSAmJiBuZ0NsYXNzVmFsdWUpID8gey4uLmNsYXNzVmFsdWUsIC4uLm5nQ2xhc3NWYWx1ZX0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NWYWx1ZSB8fCBuZ0NsYXNzVmFsdWU7XG4gICAgfVxuICB9XG59XG5cbi8vIHRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgYm90aCBOZ1N0eWxlUjJJbXBsIGFuZCBOZ1N0eWxlUjNJbXBsIGFyZVxuLy8gbm90IGl2eV9zd2l0Y2gnZCBhd2F5LCBpbnN0ZWFkIHRoZXkgYXJlIG9ubHkgaG9va2VkIHVwIGludG8gdGhlXG4vLyBESSB2aWEgTmdTdHlsZSdzIGRpcmVjdGl2ZSdzIHByb3ZpZGVyIHByb3BlcnR5LlxuZXhwb3J0IGNvbnN0IE5nQ2xhc3NJbXBsUHJvdmlkZXJfX1BSRV9SM19fID0ge1xuICBwcm92aWRlOiBOZ0NsYXNzSW1wbCxcbiAgdXNlQ2xhc3M6IE5nQ2xhc3NSMkltcGxcbn07XG5cbmV4cG9ydCBjb25zdCBOZ0NsYXNzSW1wbFByb3ZpZGVyX19QT1NUX1IzX18gPSB7XG4gIHByb3ZpZGU6IE5nQ2xhc3NJbXBsLFxuICB1c2VDbGFzczogTmdDbGFzc1IzSW1wbFxufTtcblxuZXhwb3J0IGNvbnN0IE5nQ2xhc3NJbXBsUHJvdmlkZXIgPSBOZ0NsYXNzSW1wbFByb3ZpZGVyX19QUkVfUjNfXztcbiJdfQ==