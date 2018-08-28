import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
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
NgSwitch.ngDirectiveDef = i0.ɵdefineDirective({ type: NgSwitch, selectors: [["", "ngSwitch", ""]], factory: function NgSwitch_Factory(t) { return new (t || NgSwitch)(); }, inputs: { ngSwitch: "ngSwitch" }, features: [i0.ɵPublicFeature] });
if (false) {
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
NgSwitchCase.ngDirectiveDef = i0.ɵdefineDirective({ type: NgSwitchCase, selectors: [["", "ngSwitchCase", ""]], factory: function NgSwitchCase_Factory(t) { return new (t || NgSwitchCase)(i0.ɵinjectViewContainerRef(), i0.ɵinjectTemplateRef(), i0.ɵdirectiveInject(NgSwitch, 1)); }, inputs: { ngSwitchCase: "ngSwitchCase" }, features: [i0.ɵPublicFeature] });
if (false) {
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
NgSwitchDefault.ngDirectiveDef = i0.ɵdefineDirective({ type: NgSwitchDefault, selectors: [["", "ngSwitchDefault", ""]], factory: function NgSwitchDefault_Factory(t) { return new (t || NgSwitchDefault)(i0.ɵinjectViewContainerRef(), i0.ɵinjectTemplateRef(), i0.ɵdirectiveInject(NgSwitch, 1)); }, features: [i0.ɵPublicFeature] });

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFXLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7O0FBRTdGLE1BQU0sT0FBTyxVQUFVOzs7OztJQUdyQixZQUNZLG1CQUE2QyxZQUFpQztRQUE5RSxzQkFBaUIsR0FBakIsaUJBQWlCO1FBQTRCLGlCQUFZLEdBQVosWUFBWSxDQUFxQjt3QkFIdkUsS0FBSztLQUdzRTs7OztJQUU5RixNQUFNO1FBQ0osSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUM5RDs7OztJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDaEM7Ozs7O0lBRUQsWUFBWSxDQUFDLE9BQWdCO1FBQzNCLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNwQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEI7S0FDRjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkNELE1BQU0sT0FBTyxRQUFROzs0QkFHSSxLQUFLOzBCQUNQLENBQUM7bUNBQ1EsQ0FBQztpQ0FDSCxLQUFLOzs7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LGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0tBQ2xFOzs7WUFORixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUM7Ozs7WUF2TFksZ0JBQWdCO1lBQTdCLFdBQVc7WUEyTDVCLFFBQVEsdUJBQXpCLElBQUk7OzZEQUhFLGVBQWUsNEdBQWYsZUFBZSw2RUFHSixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNsYXNzIFN3aXRjaFZpZXcge1xuICBwcml2YXRlIF9jcmVhdGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge31cblxuICBjcmVhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICB9XG5cbiAgZW5mb3JjZVN0YXRlKGNyZWF0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoY3JlYXRlZCAmJiAhdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9IGVsc2UgaWYgKCFjcmVhdGVkICYmIHRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzJcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+XG4gKiAgICAgICAgIDwhLS0gdXNlIGEgbmctY29udGFpbmVyIHRvIGdyb3VwIG11bHRpcGxlIHJvb3Qgbm9kZXMgLS0+XG4gKiAgICAgICAgIDxpbm5lci1lbGVtZW50PjwvaW5uZXItZWxlbWVudD5cbiAqICAgICAgICAgPGlubmVyLW90aGVyLWVsZW1lbnQ+PC9pbm5lci1vdGhlci1lbGVtZW50PlxuICogICAgICAgPC9uZy1jb250YWluZXI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyAvIHJlbW92ZXMgRE9NIHN1Yi10cmVlcyB3aGVuIHRoZSBuZXN0IG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoZXMgdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIGBOZ1N3aXRjaGAgc3RhbXBzIG91dCBuZXN0ZWQgdmlld3Mgd2hlbiB0aGVpciBtYXRjaCBleHByZXNzaW9uIHZhbHVlIG1hdGNoZXMgdGhlIHZhbHVlIG9mIHRoZVxuICogc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogSW4gb3RoZXIgd29yZHM6XG4gKiAtIHlvdSBkZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCAod2hlcmUgeW91IHBsYWNlIHRoZSBkaXJlY3RpdmUgd2l0aCBhIHN3aXRjaCBleHByZXNzaW9uIG9uIHRoZVxuICogYFtuZ1N3aXRjaF09XCIuLi5cImAgYXR0cmlidXRlKVxuICogLSB5b3UgZGVmaW5lIGlubmVyIHZpZXdzIGluc2lkZSB0aGUgYE5nU3dpdGNoYCBhbmQgcGxhY2UgYSBgKm5nU3dpdGNoQ2FzZWAgYXR0cmlidXRlIG9uIHRoZSB2aWV3XG4gKiByb290IGVsZW1lbnRzLlxuICpcbiAqIEVsZW1lbnRzIHdpdGhpbiBgTmdTd2l0Y2hgIGJ1dCBvdXRzaWRlIG9mIGEgYE5nU3dpdGNoQ2FzZWAgb3IgYE5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlcyB3aWxsXG4gKiBiZSBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uLlxuICpcbiAqIFRoZSBgbmdTd2l0Y2hDYXNlYCBkaXJlY3RpdmUgaW5mb3JtcyB0aGUgcGFyZW50IGBOZ1N3aXRjaGAgb2Ygd2hpY2ggdmlldyB0byBkaXNwbGF5IHdoZW4gdGhlXG4gKiBleHByZXNzaW9uIGlzIGV2YWx1YXRlZC5cbiAqIFdoZW4gbm8gbWF0Y2hpbmcgZXhwcmVzc2lvbiBpcyBmb3VuZCBvbiBhIGBuZ1N3aXRjaENhc2VgIHZpZXcsIHRoZSBgbmdTd2l0Y2hEZWZhdWx0YCB2aWV3IGlzXG4gKiBzdGFtcGVkIG91dC5cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9kZWZhdWx0Vmlld3MgITogU3dpdGNoVmlld1tdO1xuICBwcml2YXRlIF9kZWZhdWx0VXNlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9jYXNlQ291bnQgPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZUNoZWNrSW5kZXggPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX25nU3dpdGNoOiBhbnk7XG5cbiAgQElucHV0KClcbiAgc2V0IG5nU3dpdGNoKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9uZ1N3aXRjaCA9IG5ld1ZhbHVlO1xuICAgIGlmICh0aGlzLl9jYXNlQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURlZmF1bHRDYXNlcyh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRDYXNlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9jYXNlQ291bnQrKzsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZERlZmF1bHQodmlldzogU3dpdGNoVmlldykge1xuICAgIGlmICghdGhpcy5fZGVmYXVsdFZpZXdzKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0Vmlld3MgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fZGVmYXVsdFZpZXdzLnB1c2godmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaENhc2UodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1hdGNoZWQgPSB2YWx1ZSA9PSB0aGlzLl9uZ1N3aXRjaDtcbiAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCB8fCBtYXRjaGVkO1xuICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCsrO1xuICAgIGlmICh0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXggPT09IHRoaXMuX2Nhc2VDb3VudCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKCF0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkKTtcbiAgICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gICAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRGVmYXVsdENhc2VzKHVzZURlZmF1bHQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fZGVmYXVsdFZpZXdzICYmIHVzZURlZmF1bHQgIT09IHRoaXMuX2RlZmF1bHRVc2VkKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0VXNlZCA9IHVzZURlZmF1bHQ7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2RlZmF1bHRWaWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBkZWZhdWx0VmlldyA9IHRoaXMuX2RlZmF1bHRWaWV3c1tpXTtcbiAgICAgICAgZGVmYXVsdFZpZXcuZW5mb3JjZVN0YXRlKHVzZURlZmF1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqYGBgXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgdmlldyB0aGF0IHdpbGwgYmUgYWRkZWQvcmVtb3ZlZCBmcm9tIHRoZSBwYXJlbnQge0BsaW5rIE5nU3dpdGNofSB3aGVuIHRoZVxuICogZ2l2ZW4gZXhwcmVzc2lvbiBldmFsdWF0ZSB0byByZXNwZWN0aXZlbHkgdGhlIHNhbWUvZGlmZmVyZW50IHZhbHVlIGFzIHRoZSBzd2l0Y2hcbiAqIGV4cHJlc3Npb24uXG4gKlxuICogSW5zZXJ0IHRoZSBzdWItdHJlZSB3aGVuIHRoZSBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgZW5jbG9zaW5nIHN3aXRjaFxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBJZiBtdWx0aXBsZSBtYXRjaCBleHByZXNzaW9ucyBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIGFsbCBvZiB0aGVtIGFyZSBkaXNwbGF5ZWQuXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaENhc2VdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hDYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIHByaXZhdGUgX3ZpZXc6IFN3aXRjaFZpZXc7XG5cbiAgQElucHV0KClcbiAgbmdTd2l0Y2hDYXNlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgcHJpdmF0ZSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBuZ1N3aXRjaC5fYWRkQ2FzZSgpO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX3ZpZXcuZW5mb3JjZVN0YXRlKHRoaXMubmdTd2l0Y2guX21hdGNoQ2FzZSh0aGlzLm5nU3dpdGNoQ2FzZSkpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgaXMgYWRkZWQgdG8gdGhlIHBhcmVudCB7QGxpbmsgTmdTd2l0Y2h9IHdoZW4gbm8gY2FzZSBleHByZXNzaW9uc1xuICogbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIEluc2VydCB0aGUgc3ViLXRyZWUgd2hlbiBubyBjYXNlIGV4cHJlc3Npb25zIGV2YWx1YXRlIHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBlbmNsb3Npbmcgc3dpdGNoXG4gKiBleHByZXNzaW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIG5nU3dpdGNoLl9hZGREZWZhdWx0KG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKSk7XG4gIH1cbn1cbiJdfQ==