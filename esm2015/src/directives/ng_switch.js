/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export class SwitchView {
    /**
     * @param {?} _viewContainerRef
     * @param {?} _templateRef
     */
    constructor(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
        this._created = false;
    }
    /**
     * @return {?}
     */
    create() {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    }
    /**
     * @return {?}
     */
    destroy() {
        this._created = false;
        this._viewContainerRef.clear();
    }
    /**
     * @param {?} created
     * @return {?}
     */
    enforceState(created) {
        if (created && !this._created) {
            this.create();
        }
        else if (!created && this._created) {
            this.destroy();
        }
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    SwitchView.prototype._created;
    /**
     * @type {?}
     * @private
     */
    SwitchView.prototype._viewContainerRef;
    /**
     * @type {?}
     * @private
     */
    SwitchView.prototype._templateRef;
}
/**
 * \@ngModule CommonModule
 *
 * \@description A structural directive that adds or removes templates (displaying or hiding views)
 * when the next match expression matches the switch expression.
 *
 * The `[ngSwitch]` directive on a container specifies an expression to match against.
 * The expressions to match are provided by `ngSwitchCase` directives on views within the container.
 * - Every view that matches is rendered.
 * - If there are no matches, a view with the `ngSwitchDefault` directive is rendered.
 * - Elements within the `[NgSwitch]` statement but outside of any `NgSwitchCase`
 * or `ngSwitchDefault` directive are preserved at the location.
 *
 * \@usageNotes
 * Define a container element for the directive, and specify the switch expression
 * to match against as an attribute:
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 * ```
 *
 * Within the container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *    <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * ...
 *    <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * ### Usage Examples
 *
 * The following example shows how to use more than one case to display the same view:
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <!-- the same view can be shown in more than one case -->
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *   <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *   <!--default case when there are no matches -->
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * The following example shows how cases can be nested:
 * ```
 * <container-element [ngSwitch]="switch_expression">
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
 *
 * \@publicApi
 * @see `NgSwitchCase`
 * @see `NgSwitchDefault`
 * @see [Structural Directives](guide/structural-directives)
 *
 */
export class NgSwitch {
    constructor() {
        this._defaultUsed = false;
        this._caseCount = 0;
        this._lastCaseCheckIndex = 0;
        this._lastCasesMatched = false;
    }
    /**
     * @param {?} newValue
     * @return {?}
     */
    set ngSwitch(newValue) {
        this._ngSwitch = newValue;
        if (this._caseCount === 0) {
            this._updateDefaultCases(true);
        }
    }
    /**
     * \@internal
     * @return {?}
     */
    _addCase() { return this._caseCount++; }
    /**
     * \@internal
     * @param {?} view
     * @return {?}
     */
    _addDefault(view) {
        if (!this._defaultViews) {
            this._defaultViews = [];
        }
        this._defaultViews.push(view);
    }
    /**
     * \@internal
     * @param {?} value
     * @return {?}
     */
    _matchCase(value) {
        /** @type {?} */
        const matched = value == this._ngSwitch;
        this._lastCasesMatched = this._lastCasesMatched || matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        return matched;
    }
    /**
     * @private
     * @param {?} useDefault
     * @return {?}
     */
    _updateDefaultCases(useDefault) {
        if (this._defaultViews && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (let i = 0; i < this._defaultViews.length; i++) {
                /** @type {?} */
                const defaultView = this._defaultViews[i];
                defaultView.enforceState(useDefault);
            }
        }
    }
}
NgSwitch.decorators = [
    { type: Directive, args: [{ selector: '[ngSwitch]' },] },
];
NgSwitch.propDecorators = {
    ngSwitch: [{ type: Input }]
};
/** @nocollapse */ NgSwitch.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgSwitch, selectors: [["", "ngSwitch", ""]], factory: function NgSwitch_Factory(t) { return new (t || NgSwitch)(); }, inputs: { ngSwitch: "ngSwitch" } });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgSwitch, [{
        type: Directive,
        args: [{ selector: '[ngSwitch]' }]
    }], null, { ngSwitch: [{
            type: Input
        }] });
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._defaultViews;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._defaultUsed;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._caseCount;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._lastCaseCheckIndex;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._lastCasesMatched;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._ngSwitch;
}
/**
 * \@ngModule CommonModule
 *
 * \@description
 * Provides a switch case expression to match against an enclosing `ngSwitch` expression.
 * When the expressions match, the given `NgSwitchCase` template is rendered.
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * \@usageNotes
 *
 * Within a switch container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   ...
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * Each switch-case statement contains an in-line HTML template or template reference
 * that defines the subtree to be selected if the value of the match expression
 * matches the value of the switch expression.
 *
 * Unlike JavaScript, which uses strict equality, Angular uses loose equality.
 * This means that the empty string, `""` matches 0.
 *
 * \@publicApi
 * @see `NgSwitch`
 * @see `NgSwitchDefault`
 *
 */
export class NgSwitchCase {
    /**
     * @param {?} viewContainer
     * @param {?} templateRef
     * @param {?} ngSwitch
     */
    constructor(viewContainer, templateRef, ngSwitch) {
        this.ngSwitch = ngSwitch;
        ngSwitch._addCase();
        this._view = new SwitchView(viewContainer, templateRef);
    }
    /**
     * Performs case matching. For internal use only.
     * @return {?}
     */
    ngDoCheck() { this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase)); }
}
NgSwitchCase.decorators = [
    { type: Directive, args: [{ selector: '[ngSwitchCase]' },] },
];
/** @nocollapse */
NgSwitchCase.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: TemplateRef },
    { type: NgSwitch, decorators: [{ type: Host }] }
];
NgSwitchCase.propDecorators = {
    ngSwitchCase: [{ type: Input }]
};
/** @nocollapse */ NgSwitchCase.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgSwitchCase, selectors: [["", "ngSwitchCase", ""]], factory: function NgSwitchCase_Factory(t) { return new (t || NgSwitchCase)(i0.ɵɵdirectiveInject(i0.ViewContainerRef), i0.ɵɵdirectiveInject(i0.TemplateRef), i0.ɵɵdirectiveInject(NgSwitch, 1)); }, inputs: { ngSwitchCase: "ngSwitchCase" } });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgSwitchCase, [{
        type: Directive,
        args: [{ selector: '[ngSwitchCase]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                type: Host
            }] }]; }, { ngSwitchCase: [{
            type: Input
        }] });
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgSwitchCase.prototype._view;
    /**
     * Stores the HTML template to be selected on match.
     * @type {?}
     */
    NgSwitchCase.prototype.ngSwitchCase;
    /**
     * @type {?}
     * @private
     */
    NgSwitchCase.prototype.ngSwitch;
}
/**
 * \@ngModule CommonModule
 *
 * \@description
 *
 * Creates a view that is rendered when no `NgSwitchCase` expressions
 * match the `NgSwitch` expression.
 * This statement should be the final case in an `NgSwitch`.
 *
 * \@publicApi
 * @see `NgSwitch`
 * @see `NgSwitchCase`
 *
 */
export class NgSwitchDefault {
    /**
     * @param {?} viewContainer
     * @param {?} templateRef
     * @param {?} ngSwitch
     */
    constructor(viewContainer, templateRef, ngSwitch) {
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
}
NgSwitchDefault.decorators = [
    { type: Directive, args: [{ selector: '[ngSwitchDefault]' },] },
];
/** @nocollapse */
NgSwitchDefault.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: TemplateRef },
    { type: NgSwitch, decorators: [{ type: Host }] }
];
/** @nocollapse */ NgSwitchDefault.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgSwitchDefault, selectors: [["", "ngSwitchDefault", ""]], factory: function NgSwitchDefault_Factory(t) { return new (t || NgSwitchDefault)(i0.ɵɵdirectiveInject(i0.ViewContainerRef), i0.ɵɵdirectiveInject(i0.TemplateRef), i0.ɵɵdirectiveInject(NgSwitch, 1)); } });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgSwitchDefault, [{
        type: Directive,
        args: [{ selector: '[ngSwitchDefault]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                type: Host
            }] }]; }, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBVyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7O0FBRTdGLE1BQU0sT0FBTyxVQUFVOzs7OztJQUdyQixZQUNZLGlCQUFtQyxFQUFVLFlBQWlDO1FBQTlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFIbEYsYUFBUSxHQUFHLEtBQUssQ0FBQztJQUdvRSxDQUFDOzs7O0lBRTlGLE1BQU07UUFDSixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7Ozs7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7Ozs7O0lBRUQsWUFBWSxDQUFDLE9BQWdCO1FBQzNCLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNwQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEI7SUFDSCxDQUFDO0NBQ0Y7Ozs7OztJQXRCQyw4QkFBeUI7Ozs7O0lBR3JCLHVDQUEyQzs7Ozs7SUFBRSxrQ0FBeUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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Q0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O1lBbkJ0RixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUM7Ozs7WUFyTGUsZ0JBQWdCO1lBQTdCLFdBQVc7WUFnTXBCLFFBQVEsdUJBQWpDLElBQUk7OzsyQkFMUixLQUFLOzsyREFMSyxZQUFZLHNHQUFaLFlBQVksd0dBVU8sUUFBUTttQ0FWM0IsWUFBWTtjQUR4QixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUM7K0ZBV1AsUUFBUTtzQkFBakMsSUFBSTs7a0JBTFIsS0FBSzs7Ozs7OztJQUpOLDZCQUEwQjs7Ozs7SUFJMUIsb0NBQ2tCOzs7OztJQUlkLGdDQUFrQzs7Ozs7Ozs7Ozs7Ozs7OztBQTBCeEMsTUFBTSxPQUFPLGVBQWU7Ozs7OztJQUMxQixZQUNJLGFBQStCLEVBQUUsV0FBZ0MsRUFDekQsUUFBa0I7UUFDNUIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDOzs7WUFORixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUM7Ozs7WUF6TlksZ0JBQWdCO1lBQTdCLFdBQVc7WUE2TjVCLFFBQVEsdUJBQXpCLElBQUk7OzhEQUhFLGVBQWUsNEdBQWYsZUFBZSx3R0FHSixRQUFRO21DQUhuQixlQUFlO2NBRDNCLFNBQVM7ZUFBQyxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBQzsrRkFJbEIsUUFBUTtzQkFBekIsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEhvc3QsIElucHV0LCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBjbGFzcyBTd2l0Y2hWaWV3IHtcbiAgcHJpdmF0ZSBfY3JlYXRlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4pIHt9XG5cbiAgY3JlYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2NyZWF0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMuX3RlbXBsYXRlUmVmKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgfVxuXG4gIGVuZm9yY2VTdGF0ZShjcmVhdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKGNyZWF0ZWQgJiYgIXRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuY3JlYXRlKCk7XG4gICAgfSBlbHNlIGlmICghY3JlYXRlZCAmJiB0aGlzLl9jcmVhdGVkKSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uIEEgc3RydWN0dXJhbCBkaXJlY3RpdmUgdGhhdCBhZGRzIG9yIHJlbW92ZXMgdGVtcGxhdGVzIChkaXNwbGF5aW5nIG9yIGhpZGluZyB2aWV3cylcbiAqIHdoZW4gdGhlIG5leHQgbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBUaGUgYFtuZ1N3aXRjaF1gIGRpcmVjdGl2ZSBvbiBhIGNvbnRhaW5lciBzcGVjaWZpZXMgYW4gZXhwcmVzc2lvbiB0byBtYXRjaCBhZ2FpbnN0LlxuICogVGhlIGV4cHJlc3Npb25zIHRvIG1hdGNoIGFyZSBwcm92aWRlZCBieSBgbmdTd2l0Y2hDYXNlYCBkaXJlY3RpdmVzIG9uIHZpZXdzIHdpdGhpbiB0aGUgY29udGFpbmVyLlxuICogLSBFdmVyeSB2aWV3IHRoYXQgbWF0Y2hlcyBpcyByZW5kZXJlZC5cbiAqIC0gSWYgdGhlcmUgYXJlIG5vIG1hdGNoZXMsIGEgdmlldyB3aXRoIHRoZSBgbmdTd2l0Y2hEZWZhdWx0YCBkaXJlY3RpdmUgaXMgcmVuZGVyZWQuXG4gKiAtIEVsZW1lbnRzIHdpdGhpbiB0aGUgYFtOZ1N3aXRjaF1gIHN0YXRlbWVudCBidXQgb3V0c2lkZSBvZiBhbnkgYE5nU3dpdGNoQ2FzZWBcbiAqIG9yIGBuZ1N3aXRjaERlZmF1bHRgIGRpcmVjdGl2ZSBhcmUgcHJlc2VydmVkIGF0IHRoZSBsb2NhdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogRGVmaW5lIGEgY29udGFpbmVyIGVsZW1lbnQgZm9yIHRoZSBkaXJlY3RpdmUsIGFuZCBzcGVjaWZ5IHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdG8gbWF0Y2ggYWdhaW5zdCBhcyBhbiBhdHRyaWJ1dGU6XG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiBgYGBcbiAqXG4gKiBXaXRoaW4gdGhlIGNvbnRhaW5lciwgYCpuZ1N3aXRjaENhc2VgIHN0YXRlbWVudHMgc3BlY2lmeSB0aGUgbWF0Y2ggZXhwcmVzc2lvbnNcbiAqIGFzIGF0dHJpYnV0ZXMuIEluY2x1ZGUgYCpuZ1N3aXRjaERlZmF1bHRgIGFzIHRoZSBmaW5hbCBjYXNlLlxuICpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAuLi5cbiAqICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNhZ2UgRXhhbXBsZXNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIHVzZSBtb3JlIHRoYW4gb25lIGNhc2UgdG8gZGlzcGxheSB0aGUgc2FtZSB2aWV3OlxuICpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8IS0tIHRoZSBzYW1lIHZpZXcgY2FuIGJlIHNob3duIGluIG1vcmUgdGhhbiBvbmUgY2FzZSAtLT5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMlwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICA8c29tZS1vdGhlci1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj4uLi48L3NvbWUtb3RoZXItZWxlbWVudD5cbiAqICAgPCEtLWRlZmF1bHQgY2FzZSB3aGVuIHRoZXJlIGFyZSBubyBtYXRjaGVzIC0tPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyBjYXNlcyBjYW4gYmUgbmVzdGVkOlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMlwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+Li4uPC9zb21lLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8bmctY29udGFpbmVyICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj5cbiAqICAgICAgICAgPCEtLSB1c2UgYSBuZy1jb250YWluZXIgdG8gZ3JvdXAgbXVsdGlwbGUgcm9vdCBub2RlcyAtLT5cbiAqICAgICAgICAgPGlubmVyLWVsZW1lbnQ+PC9pbm5lci1lbGVtZW50PlxuICogICAgICAgICA8aW5uZXItb3RoZXItZWxlbWVudD48L2lubmVyLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSBgTmdTd2l0Y2hDYXNlYFxuICogQHNlZSBgTmdTd2l0Y2hEZWZhdWx0YFxuICogQHNlZSBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9kZWZhdWx0Vmlld3MgITogU3dpdGNoVmlld1tdO1xuICBwcml2YXRlIF9kZWZhdWx0VXNlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9jYXNlQ291bnQgPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZUNoZWNrSW5kZXggPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX25nU3dpdGNoOiBhbnk7XG5cbiAgQElucHV0KClcbiAgc2V0IG5nU3dpdGNoKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9uZ1N3aXRjaCA9IG5ld1ZhbHVlO1xuICAgIGlmICh0aGlzLl9jYXNlQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURlZmF1bHRDYXNlcyh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRDYXNlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9jYXNlQ291bnQrKzsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZERlZmF1bHQodmlldzogU3dpdGNoVmlldykge1xuICAgIGlmICghdGhpcy5fZGVmYXVsdFZpZXdzKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0Vmlld3MgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fZGVmYXVsdFZpZXdzLnB1c2godmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaENhc2UodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1hdGNoZWQgPSB2YWx1ZSA9PSB0aGlzLl9uZ1N3aXRjaDtcbiAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCB8fCBtYXRjaGVkO1xuICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCsrO1xuICAgIGlmICh0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXggPT09IHRoaXMuX2Nhc2VDb3VudCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKCF0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkKTtcbiAgICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gICAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRGVmYXVsdENhc2VzKHVzZURlZmF1bHQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fZGVmYXVsdFZpZXdzICYmIHVzZURlZmF1bHQgIT09IHRoaXMuX2RlZmF1bHRVc2VkKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0VXNlZCA9IHVzZURlZmF1bHQ7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2RlZmF1bHRWaWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBkZWZhdWx0VmlldyA9IHRoaXMuX2RlZmF1bHRWaWV3c1tpXTtcbiAgICAgICAgZGVmYXVsdFZpZXcuZW5mb3JjZVN0YXRlKHVzZURlZmF1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVzIGEgc3dpdGNoIGNhc2UgZXhwcmVzc2lvbiB0byBtYXRjaCBhZ2FpbnN0IGFuIGVuY2xvc2luZyBgbmdTd2l0Y2hgIGV4cHJlc3Npb24uXG4gKiBXaGVuIHRoZSBleHByZXNzaW9ucyBtYXRjaCwgdGhlIGdpdmVuIGBOZ1N3aXRjaENhc2VgIHRlbXBsYXRlIGlzIHJlbmRlcmVkLlxuICogSWYgbXVsdGlwbGUgbWF0Y2ggZXhwcmVzc2lvbnMgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uIHZhbHVlLCBhbGwgb2YgdGhlbSBhcmUgZGlzcGxheWVkLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogV2l0aGluIGEgc3dpdGNoIGNvbnRhaW5lciwgYCpuZ1N3aXRjaENhc2VgIHN0YXRlbWVudHMgc3BlY2lmeSB0aGUgbWF0Y2ggZXhwcmVzc2lvbnNcbiAqIGFzIGF0dHJpYnV0ZXMuIEluY2x1ZGUgYCpuZ1N3aXRjaERlZmF1bHRgIGFzIHRoZSBmaW5hbCBjYXNlLlxuICpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgLi4uXG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBFYWNoIHN3aXRjaC1jYXNlIHN0YXRlbWVudCBjb250YWlucyBhbiBpbi1saW5lIEhUTUwgdGVtcGxhdGUgb3IgdGVtcGxhdGUgcmVmZXJlbmNlXG4gKiB0aGF0IGRlZmluZXMgdGhlIHN1YnRyZWUgdG8gYmUgc2VsZWN0ZWQgaWYgdGhlIHZhbHVlIG9mIHRoZSBtYXRjaCBleHByZXNzaW9uXG4gKiBtYXRjaGVzIHRoZSB2YWx1ZSBvZiB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogVW5saWtlIEphdmFTY3JpcHQsIHdoaWNoIHVzZXMgc3RyaWN0IGVxdWFsaXR5LCBBbmd1bGFyIHVzZXMgbG9vc2UgZXF1YWxpdHkuXG4gKiBUaGlzIG1lYW5zIHRoYXQgdGhlIGVtcHR5IHN0cmluZywgYFwiXCJgIG1hdGNoZXMgMC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAc2VlIGBOZ1N3aXRjaGBcbiAqIEBzZWUgYE5nU3dpdGNoRGVmYXVsdGBcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoQ2FzZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaENhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBfdmlldzogU3dpdGNoVmlldztcbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgSFRNTCB0ZW1wbGF0ZSB0byBiZSBzZWxlY3RlZCBvbiBtYXRjaC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIG5nU3dpdGNoQ2FzZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBASG9zdCgpIHByaXZhdGUgbmdTd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgbmdTd2l0Y2guX2FkZENhc2UoKTtcbiAgICB0aGlzLl92aWV3ID0gbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGNhc2UgbWF0Y2hpbmcuIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICovXG4gIG5nRG9DaGVjaygpIHsgdGhpcy5fdmlldy5lbmZvcmNlU3RhdGUodGhpcy5uZ1N3aXRjaC5fbWF0Y2hDYXNlKHRoaXMubmdTd2l0Y2hDYXNlKSk7IH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ3JlYXRlcyBhIHZpZXcgdGhhdCBpcyByZW5kZXJlZCB3aGVuIG5vIGBOZ1N3aXRjaENhc2VgIGV4cHJlc3Npb25zXG4gKiBtYXRjaCB0aGUgYE5nU3dpdGNoYCBleHByZXNzaW9uLlxuICogVGhpcyBzdGF0ZW1lbnQgc2hvdWxkIGJlIHRoZSBmaW5hbCBjYXNlIGluIGFuIGBOZ1N3aXRjaGAuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSBgTmdTd2l0Y2hgXG4gKiBAc2VlIGBOZ1N3aXRjaENhc2VgXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaERlZmF1bHRdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hEZWZhdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgbmdTd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgbmdTd2l0Y2guX2FkZERlZmF1bHQobmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpKTtcbiAgfVxufVxuIl19