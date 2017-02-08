/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef } from '@angular/core';
/**
 * \@ngModule CommonModule
 *
 * \@whatItDoes Inserts an embedded view from a prepared `TemplateRef`
 *
 * \@howToUse
 * ```
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * \@description
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * Note: using the key `$implicit` in the context object will set it's value as default.
 *
 * # Example
 *
 * {\@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * \@experimental
 */
var NgTemplateOutlet = (function () {
    /**
     * @param {?} _viewContainerRef
     */
    function NgTemplateOutlet(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
    }
    Object.defineProperty(NgTemplateOutlet.prototype, "ngOutletContext", {
        /**
         * @deprecated v4.0.0 - Renamed to ngTemplateOutletContext.
         * @param {?} context
         * @return {?}
         */
        set: function (context) { this.ngTemplateOutletContext = context; },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} changes
     * @return {?}
     */
    NgTemplateOutlet.prototype.ngOnChanges = function (changes) {
        if (this._viewRef) {
            this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
        }
        if (this.ngTemplateOutlet) {
            this._viewRef = this._viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, this.ngTemplateOutletContext);
        }
    };
    return NgTemplateOutlet;
}());
export { NgTemplateOutlet };
NgTemplateOutlet.decorators = [
    { type: Directive, args: [{ selector: '[ngTemplateOutlet]' },] },
];
/** @nocollapse */
NgTemplateOutlet.ctorParameters = function () { return [
    { type: ViewContainerRef, },
]; };
NgTemplateOutlet.propDecorators = {
    'ngTemplateOutletContext': [{ type: Input },],
    'ngTemplateOutlet': [{ type: Input },],
    'ngOutletContext': [{ type: Input },],
};
function NgTemplateOutlet_tsickle_Closure_declarations() {
    /** @type {?} */
    NgTemplateOutlet.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    NgTemplateOutlet.ctorParameters;
    /** @type {?} */
    NgTemplateOutlet.propDecorators;
    /** @type {?} */
    NgTemplateOutlet.prototype._viewRef;
    /** @type {?} */
    NgTemplateOutlet.prototype.ngTemplateOutletContext;
    /** @type {?} */
    NgTemplateOutlet.prototype.ngTemplateOutlet;
    /** @type {?} */
    NgTemplateOutlet.prototype._viewContainerRef;
}
//# sourceMappingURL=ng_template_outlet.js.map