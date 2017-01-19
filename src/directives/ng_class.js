/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, IterableDiffers, KeyValueDiffers, Renderer } from '@angular/core/index';
import { isListLikeIterable } from '../facade/collection';
import { stringify } from '../facade/lang';
/**
 * \@ngModule CommonModule
 *
 * \@whatItDoes Adds and removes CSS classes on an HTML element.
 *
 * \@howToUse
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * \@description
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * \@stable
 */
export class NgClass {
    /**
     * @param {?} _iterableDiffers
     * @param {?} _keyValueDiffers
     * @param {?} _ngEl
     * @param {?} _renderer
     */
    constructor(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set klass(v) {
        this._applyInitialClasses(true);
        this._initialClasses = typeof v === 'string' ? v.split(/\s+/) : [];
        this._applyInitialClasses(false);
        this._applyClasses(this._rawClass, false);
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set ngClass(v) {
        this._cleanupClasses(this._rawClass);
        this._iterableDiffer = null;
        this._keyValueDiffer = null;
        this._rawClass = typeof v === 'string' ? v.split(/\s+/) : v;
        if (this._rawClass) {
            if (isListLikeIterable(this._rawClass)) {
                this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create(null);
            }
            else {
                this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create(null);
            }
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (this._iterableDiffer) {
            const /** @type {?} */ iterableChanges = this._iterableDiffer.diff(/** @type {?} */ (this._rawClass));
            if (iterableChanges) {
                this._applyIterableChanges(iterableChanges);
            }
        }
        else if (this._keyValueDiffer) {
            const /** @type {?} */ keyValueChanges = this._keyValueDiffer.diff(/** @type {?} */ (this._rawClass));
            if (keyValueChanges) {
                this._applyKeyValueChanges(keyValueChanges);
            }
        }
    }
    /**
     * @param {?} rawClassVal
     * @return {?}
     */
    _cleanupClasses(rawClassVal) {
        this._applyClasses(rawClassVal, true);
        this._applyInitialClasses(false);
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    _applyKeyValueChanges(changes) {
        changes.forEachAddedItem((record) => this._toggleClass(record.key, record.currentValue));
        changes.forEachChangedItem((record) => this._toggleClass(record.key, record.currentValue));
        changes.forEachRemovedItem((record) => {
            if (record.previousValue) {
                this._toggleClass(record.key, false);
            }
        });
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    _applyIterableChanges(changes) {
        changes.forEachAddedItem((record) => {
            if (typeof record.item === 'string') {
                this._toggleClass(record.item, true);
            }
            else {
                throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${stringify(record.item)}`);
            }
        });
        changes.forEachRemovedItem((record) => this._toggleClass(record.item, false));
    }
    /**
     * @param {?} isCleanup
     * @return {?}
     */
    _applyInitialClasses(isCleanup) {
        this._initialClasses.forEach(klass => this._toggleClass(klass, !isCleanup));
    }
    /**
     * @param {?} rawClassVal
     * @param {?} isCleanup
     * @return {?}
     */
    _applyClasses(rawClassVal, isCleanup) {
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                ((rawClassVal)).forEach((klass) => this._toggleClass(klass, !isCleanup));
            }
            else {
                Object.keys(rawClassVal).forEach(klass => {
                    if (rawClassVal[klass] != null)
                        this._toggleClass(klass, !isCleanup);
                });
            }
        }
    }
    /**
     * @param {?} klass
     * @param {?} enabled
     * @return {?}
     */
    _toggleClass(klass, enabled) {
        klass = klass.trim();
        if (klass) {
            klass.split(/\s+/g).forEach(klass => { this._renderer.setElementClass(this._ngEl.nativeElement, klass, !!enabled); });
        }
    }
}
NgClass.decorators = [
    { type: Directive, args: [{ selector: '[ngClass]' },] },
];
/** @nocollapse */
NgClass.ctorParameters = () => [
    { type: IterableDiffers, },
    { type: KeyValueDiffers, },
    { type: ElementRef, },
    { type: Renderer, },
];
NgClass.propDecorators = {
    'klass': [{ type: Input, args: ['class',] },],
    'ngClass': [{ type: Input },],
};
function NgClass_tsickle_Closure_declarations() {
    /** @type {?} */
    NgClass.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    NgClass.ctorParameters;
    /** @type {?} */
    NgClass.propDecorators;
    /** @type {?} */
    NgClass.prototype._iterableDiffer;
    /** @type {?} */
    NgClass.prototype._keyValueDiffer;
    /** @type {?} */
    NgClass.prototype._initialClasses;
    /** @type {?} */
    NgClass.prototype._rawClass;
    /** @type {?} */
    NgClass.prototype._iterableDiffers;
    /** @type {?} */
    NgClass.prototype._keyValueDiffers;
    /** @type {?} */
    NgClass.prototype._ngEl;
    /** @type {?} */
    NgClass.prototype._renderer;
}
//# sourceMappingURL=ng_class.js.map