/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
var SwitchView = /** @class */ (function () {
    function SwitchView(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
        this._created = false;
    }
    /**
     * @return {?}
     */
    SwitchView.prototype.create = /**
     * @return {?}
     */
    function () {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    };
    /**
     * @return {?}
     */
    SwitchView.prototype.destroy = /**
     * @return {?}
     */
    function () {
        this._created = false;
        this._viewContainerRef.clear();
    };
    /**
     * @param {?} created
     * @return {?}
     */
    SwitchView.prototype.enforceState = /**
     * @param {?} created
     * @return {?}
     */
    function (created) {
        if (created && !this._created) {
            this.create();
        }
        else if (!created && this._created) {
            this.destroy();
        }
    };
    return SwitchView;
}());
export { SwitchView };
function SwitchView_tsickle_Closure_declarations() {
    /** @type {?} */
    SwitchView.prototype._created;
    /** @type {?} */
    SwitchView.prototype._viewContainerRef;
    /** @type {?} */
    SwitchView.prototype._templateRef;
}
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
 * ```
 *     <container-element [ngSwitch]="switch_expression">
 *       <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *       <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *       <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *       <ng-container *ngSwitchCase="match_expression_3">
 *         <!-- use a ng-container to group multiple root nodes -->
 *         <inner-element></inner-element>
 *         <inner-other-element></inner-other-element>
 *       </ng-container>
 *       <some-element *ngSwitchDefault>...</some-element>
 *     </container-element>
 * ```
 * \@description
 *
 * Adds / removes DOM sub-trees when the nest match expressions matches the switch expression.
 *
 * `NgSwitch` stamps out nested views when their match expression value matches the value of the
 * switch expression.
 *
 * In other words:
 * - you define a container element (where you place the directive with a switch expression on the
 * `[ngSwitch]="..."` attribute)
 * - you define inner views inside the `NgSwitch` and place a `*ngSwitchCase` attribute on the view
 * root elements.
 *
 * Elements within `NgSwitch` but outside of a `NgSwitchCase` or `NgSwitchDefault` directives will
 * be preserved at the location.
 *
 * The `ngSwitchCase` directive informs the parent `NgSwitch` of which view to display when the
 * expression is evaluated.
 * When no matching expression is found on a `ngSwitchCase` view, the `ngSwitchDefault` view is
 * stamped out.
 *
 * \@stable
 */
var NgSwitch = /** @class */ (function () {
    function NgSwitch() {
        this._defaultUsed = false;
        this._caseCount = 0;
        this._lastCaseCheckIndex = 0;
        this._lastCasesMatched = false;
    }
    Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
        set: /**
         * @param {?} newValue
         * @return {?}
         */
        function (newValue) {
            this._ngSwitch = newValue;
            if (this._caseCount === 0) {
                this._updateDefaultCases(true);
            }
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    /**
     * \@internal
     * @return {?}
     */
    NgSwitch.prototype._addCase = /**
     * \@internal
     * @return {?}
     */
    function () { return this._caseCount++; };
    /** @internal */
    /**
     * \@internal
     * @param {?} view
     * @return {?}
     */
    NgSwitch.prototype._addDefault = /**
     * \@internal
     * @param {?} view
     * @return {?}
     */
    function (view) {
        if (!this._defaultViews) {
            this._defaultViews = [];
        }
        this._defaultViews.push(view);
    };
    /** @internal */
    /**
     * \@internal
     * @param {?} value
     * @return {?}
     */
    NgSwitch.prototype._matchCase = /**
     * \@internal
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var /** @type {?} */ matched = value == this._ngSwitch;
        this._lastCasesMatched = this._lastCasesMatched || matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        return matched;
    };
    /**
     * @param {?} useDefault
     * @return {?}
     */
    NgSwitch.prototype._updateDefaultCases = /**
     * @param {?} useDefault
     * @return {?}
     */
    function (useDefault) {
        if (this._defaultViews && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (var /** @type {?} */ i = 0; i < this._defaultViews.length; i++) {
                var /** @type {?} */ defaultView = this._defaultViews[i];
                defaultView.enforceState(useDefault);
            }
        }
    };
    NgSwitch.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitch]' },] },
    ];
    /** @nocollapse */
    NgSwitch.ctorParameters = function () { return []; };
    NgSwitch.propDecorators = {
        "ngSwitch": [{ type: Input },],
    };
    return NgSwitch;
}());
export { NgSwitch };
function NgSwitch_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    NgSwitch.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    NgSwitch.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    NgSwitch.propDecorators;
    /** @type {?} */
    NgSwitch.prototype._defaultViews;
    /** @type {?} */
    NgSwitch.prototype._defaultUsed;
    /** @type {?} */
    NgSwitch.prototype._caseCount;
    /** @type {?} */
    NgSwitch.prototype._lastCaseCheckIndex;
    /** @type {?} */
    NgSwitch.prototype._lastCasesMatched;
    /** @type {?} */
    NgSwitch.prototype._ngSwitch;
}
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * </container-element>
 * ```
 * \@description
 *
 * Creates a view that will be added/removed from the parent {\@link NgSwitch} when the
 * given expression evaluate to respectively the same/different value as the switch
 * expression.
 *
 * Insert the sub-tree when the expression evaluates to the same value as the enclosing switch
 * expression.
 *
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * See {\@link NgSwitch} for more details and example.
 *
 * \@stable
 */
var NgSwitchCase = /** @class */ (function () {
    function NgSwitchCase(viewContainer, templateRef, ngSwitch) {
        this.ngSwitch = ngSwitch;
        ngSwitch._addCase();
        this._view = new SwitchView(viewContainer, templateRef);
    }
    /**
     * @return {?}
     */
    NgSwitchCase.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () { this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase)); };
    NgSwitchCase.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitchCase]' },] },
    ];
    /** @nocollapse */
    NgSwitchCase.ctorParameters = function () { return [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: NgSwitch, decorators: [{ type: Host },] },
    ]; };
    NgSwitchCase.propDecorators = {
        "ngSwitchCase": [{ type: Input },],
    };
    return NgSwitchCase;
}());
export { NgSwitchCase };
function NgSwitchCase_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    NgSwitchCase.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    NgSwitchCase.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    NgSwitchCase.propDecorators;
    /** @type {?} */
    NgSwitchCase.prototype._view;
    /** @type {?} */
    NgSwitchCase.prototype.ngSwitchCase;
    /** @type {?} */
    NgSwitchCase.prototype.ngSwitch;
}
/**
 * \@ngModule CommonModule
 * \@usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-other-element *ngSwitchDefault>...</some-other-element>
 * </container-element>
 * ```
 *
 * \@description
 *
 * Creates a view that is added to the parent {\@link NgSwitch} when no case expressions
 * match the switch expression.
 *
 * Insert the sub-tree when no case expressions evaluate to the same value as the enclosing switch
 * expression.
 *
 * See {\@link NgSwitch} for more details and example.
 *
 * \@stable
 */
var NgSwitchDefault = /** @class */ (function () {
    function NgSwitchDefault(viewContainer, templateRef, ngSwitch) {
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
    NgSwitchDefault.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitchDefault]' },] },
    ];
    /** @nocollapse */
    NgSwitchDefault.ctorParameters = function () { return [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: NgSwitch, decorators: [{ type: Host },] },
    ]; };
    return NgSwitchDefault;
}());
export { NgSwitchDefault };
function NgSwitchDefault_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    NgSwitchDefault.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    NgSwitchDefault.ctorParameters;
}
//# sourceMappingURL=ng_switch.js.map