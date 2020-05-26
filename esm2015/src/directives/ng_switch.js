/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export class SwitchView {
    constructor(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
        this._created = false;
    }
    create() {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    }
    destroy() {
        this._created = false;
        this._viewContainerRef.clear();
    }
    enforceState(created) {
        if (created && !this._created) {
            this.create();
        }
        else if (!created && this._created) {
            this.destroy();
        }
    }
}
/**
 * @ngModule CommonModule
 *
 * @description
 * The `[ngSwitch]` directive on a container specifies an expression to match against.
 * The expressions to match are provided by `ngSwitchCase` directives on views within the container.
 * - Every view that matches is rendered.
 * - If there are no matches, a view with the `ngSwitchDefault` directive is rendered.
 * - Elements within the `[NgSwitch]` statement but outside of any `NgSwitchCase`
 * or `ngSwitchDefault` directive are preserved at the location.
 *
 * @usageNotes
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
 * @publicApi
 * @see `NgSwitchCase`
 * @see `NgSwitchDefault`
 * @see [Structural Directives](guide/structural-directives)
 *
 */
let NgSwitch = /** @class */ (() => {
    class NgSwitch {
        constructor() {
            this._defaultUsed = false;
            this._caseCount = 0;
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        set ngSwitch(newValue) {
            this._ngSwitch = newValue;
            if (this._caseCount === 0) {
                this._updateDefaultCases(true);
            }
        }
        /** @internal */
        _addCase() {
            return this._caseCount++;
        }
        /** @internal */
        _addDefault(view) {
            if (!this._defaultViews) {
                this._defaultViews = [];
            }
            this._defaultViews.push(view);
        }
        /** @internal */
        _matchCase(value) {
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
        _updateDefaultCases(useDefault) {
            if (this._defaultViews && useDefault !== this._defaultUsed) {
                this._defaultUsed = useDefault;
                for (let i = 0; i < this._defaultViews.length; i++) {
                    const defaultView = this._defaultViews[i];
                    defaultView.enforceState(useDefault);
                }
            }
        }
    }
    NgSwitch.ɵfac = function NgSwitch_Factory(t) { return new (t || NgSwitch)(); };
    NgSwitch.ɵdir = i0.ɵɵdefineDirective({ type: NgSwitch, selectors: [["", "ngSwitch", ""]], inputs: { ngSwitch: "ngSwitch" } });
    return NgSwitch;
})();
export { NgSwitch };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgSwitch, [{
        type: Directive,
        args: [{ selector: '[ngSwitch]' }]
    }], null, { ngSwitch: [{
            type: Input
        }] }); })();
/**
 * @ngModule CommonModule
 *
 * @description
 * Provides a switch case expression to match against an enclosing `ngSwitch` expression.
 * When the expressions match, the given `NgSwitchCase` template is rendered.
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * @usageNotes
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
 * @publicApi
 * @see `NgSwitch`
 * @see `NgSwitchDefault`
 *
 */
let NgSwitchCase = /** @class */ (() => {
    class NgSwitchCase {
        constructor(viewContainer, templateRef, ngSwitch) {
            this.ngSwitch = ngSwitch;
            ngSwitch._addCase();
            this._view = new SwitchView(viewContainer, templateRef);
        }
        /**
         * Performs case matching. For internal use only.
         */
        ngDoCheck() {
            this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase));
        }
    }
    NgSwitchCase.ɵfac = function NgSwitchCase_Factory(t) { return new (t || NgSwitchCase)(i0.ɵɵdirectiveInject(i0.ViewContainerRef), i0.ɵɵdirectiveInject(i0.TemplateRef), i0.ɵɵdirectiveInject(NgSwitch, 1)); };
    NgSwitchCase.ɵdir = i0.ɵɵdefineDirective({ type: NgSwitchCase, selectors: [["", "ngSwitchCase", ""]], inputs: { ngSwitchCase: "ngSwitchCase" } });
    return NgSwitchCase;
})();
export { NgSwitchCase };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgSwitchCase, [{
        type: Directive,
        args: [{ selector: '[ngSwitchCase]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                type: Host
            }] }]; }, { ngSwitchCase: [{
            type: Input
        }] }); })();
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that is rendered when no `NgSwitchCase` expressions
 * match the `NgSwitch` expression.
 * This statement should be the final case in an `NgSwitch`.
 *
 * @publicApi
 * @see `NgSwitch`
 * @see `NgSwitchCase`
 *
 */
let NgSwitchDefault = /** @class */ (() => {
    class NgSwitchDefault {
        constructor(viewContainer, templateRef, ngSwitch) {
            ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
        }
    }
    NgSwitchDefault.ɵfac = function NgSwitchDefault_Factory(t) { return new (t || NgSwitchDefault)(i0.ɵɵdirectiveInject(i0.ViewContainerRef), i0.ɵɵdirectiveInject(i0.TemplateRef), i0.ɵɵdirectiveInject(NgSwitch, 1)); };
    NgSwitchDefault.ɵdir = i0.ɵɵdefineDirective({ type: NgSwitchDefault, selectors: [["", "ngSwitchDefault", ""]] });
    return NgSwitchDefault;
})();
export { NgSwitchDefault };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgSwitchDefault, [{
        type: Directive,
        args: [{ selector: '[ngSwitchDefault]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                type: Host
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFXLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUU3RixNQUFNLE9BQU8sVUFBVTtJQUdyQixZQUNZLGlCQUFtQyxFQUFVLFlBQWlDO1FBQTlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFIbEYsYUFBUSxHQUFHLEtBQUssQ0FBQztJQUdvRSxDQUFDO0lBRTlGLE1BQU07UUFDSixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBZ0I7UUFDM0IsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlFRztBQUNIO0lB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QjtLQWtOQztTQXBCWSxZQUFZO2tEQUFaLFlBQVk7Y0FEeEIsU0FBUztlQUFDLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDOytGQVVQLFFBQVE7c0JBQWpDLElBQUk7O2tCQUpSLEtBQUs7O0FBaUJSOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSDtJQUFBLE1BQ2EsZUFBZTtRQUMxQixZQUNJLGFBQStCLEVBQUUsV0FBZ0MsRUFDekQsUUFBa0I7WUFDNUIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDOztrRkFMVSxlQUFlLHdHQUdKLFFBQVE7d0RBSG5CLGVBQWU7MEJBbk81QjtLQXlPQztTQU5ZLGVBQWU7a0RBQWYsZUFBZTtjQUQzQixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUM7K0ZBSWxCLFFBQVE7c0JBQXpCLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBIb3N0LCBJbnB1dCwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgU3dpdGNoVmlldyB7XG4gIHByaXZhdGUgX2NyZWF0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+KSB7fVxuXG4gIGNyZWF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gdHJ1ZTtcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2NyZWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7XG4gIH1cblxuICBlbmZvcmNlU3RhdGUoY3JlYXRlZDogYm9vbGVhbikge1xuICAgIGlmIChjcmVhdGVkICYmICF0aGlzLl9jcmVhdGVkKSB7XG4gICAgICB0aGlzLmNyZWF0ZSgpO1xuICAgIH0gZWxzZSBpZiAoIWNyZWF0ZWQgJiYgdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIGBbbmdTd2l0Y2hdYCBkaXJlY3RpdmUgb24gYSBjb250YWluZXIgc3BlY2lmaWVzIGFuIGV4cHJlc3Npb24gdG8gbWF0Y2ggYWdhaW5zdC5cbiAqIFRoZSBleHByZXNzaW9ucyB0byBtYXRjaCBhcmUgcHJvdmlkZWQgYnkgYG5nU3dpdGNoQ2FzZWAgZGlyZWN0aXZlcyBvbiB2aWV3cyB3aXRoaW4gdGhlIGNvbnRhaW5lci5cbiAqIC0gRXZlcnkgdmlldyB0aGF0IG1hdGNoZXMgaXMgcmVuZGVyZWQuXG4gKiAtIElmIHRoZXJlIGFyZSBubyBtYXRjaGVzLCBhIHZpZXcgd2l0aCB0aGUgYG5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlIGlzIHJlbmRlcmVkLlxuICogLSBFbGVtZW50cyB3aXRoaW4gdGhlIGBbTmdTd2l0Y2hdYCBzdGF0ZW1lbnQgYnV0IG91dHNpZGUgb2YgYW55IGBOZ1N3aXRjaENhc2VgXG4gKiBvciBgbmdTd2l0Y2hEZWZhdWx0YCBkaXJlY3RpdmUgYXJlIHByZXNlcnZlZCBhdCB0aGUgbG9jYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIERlZmluZSBhIGNvbnRhaW5lciBlbGVtZW50IGZvciB0aGUgZGlyZWN0aXZlLCBhbmQgc3BlY2lmeSB0aGUgc3dpdGNoIGV4cHJlc3Npb25cbiAqIHRvIG1hdGNoIGFnYWluc3QgYXMgYW4gYXR0cmlidXRlOlxuICpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogYGBgXG4gKlxuICogV2l0aGluIHRoZSBjb250YWluZXIsIGAqbmdTd2l0Y2hDYXNlYCBzdGF0ZW1lbnRzIHNwZWNpZnkgdGhlIG1hdGNoIGV4cHJlc3Npb25zXG4gKiBhcyBhdHRyaWJ1dGVzLiBJbmNsdWRlIGAqbmdTd2l0Y2hEZWZhdWx0YCBhcyB0aGUgZmluYWwgY2FzZS5cbiAqXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogLi4uXG4gKiAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogIyMjIFVzYWdlIEV4YW1wbGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byB1c2UgbW9yZSB0aGFuIG9uZSBjYXNlIHRvIGRpc3BsYXkgdGhlIHNhbWUgdmlldzpcbiAqXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgPCEtLSB0aGUgc2FtZSB2aWV3IGNhbiBiZSBzaG93biBpbiBtb3JlIHRoYW4gb25lIGNhc2UgLS0+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzJcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+Li4uPC9zb21lLW90aGVyLWVsZW1lbnQ+XG4gKiAgIDwhLS1kZWZhdWx0IGNhc2Ugd2hlbiB0aGVyZSBhcmUgbm8gbWF0Y2hlcyAtLT5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgY2FzZXMgY2FuIGJlIG5lc3RlZDpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzJcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+XG4gKiAgICAgICAgIDwhLS0gdXNlIGEgbmctY29udGFpbmVyIHRvIGdyb3VwIG11bHRpcGxlIHJvb3Qgbm9kZXMgLS0+XG4gKiAgICAgICAgIDxpbm5lci1lbGVtZW50PjwvaW5uZXItZWxlbWVudD5cbiAqICAgICAgICAgPGlubmVyLW90aGVyLWVsZW1lbnQ+PC9pbm5lci1vdGhlci1lbGVtZW50PlxuICogICAgICAgPC9uZy1jb250YWluZXI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBzZWUgYE5nU3dpdGNoQ2FzZWBcbiAqIEBzZWUgYE5nU3dpdGNoRGVmYXVsdGBcbiAqIEBzZWUgW1N0cnVjdHVyYWwgRGlyZWN0aXZlc10oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzKVxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2gge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZGVmYXVsdFZpZXdzITogU3dpdGNoVmlld1tdO1xuICBwcml2YXRlIF9kZWZhdWx0VXNlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9jYXNlQ291bnQgPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZUNoZWNrSW5kZXggPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX25nU3dpdGNoOiBhbnk7XG5cbiAgQElucHV0KClcbiAgc2V0IG5nU3dpdGNoKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9uZ1N3aXRjaCA9IG5ld1ZhbHVlO1xuICAgIGlmICh0aGlzLl9jYXNlQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURlZmF1bHRDYXNlcyh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRDYXNlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2Nhc2VDb3VudCsrO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkRGVmYXVsdCh2aWV3OiBTd2l0Y2hWaWV3KSB7XG4gICAgaWYgKCF0aGlzLl9kZWZhdWx0Vmlld3MpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRWaWV3cyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9kZWZhdWx0Vmlld3MucHVzaCh2aWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21hdGNoQ2FzZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgbWF0Y2hlZCA9IHZhbHVlID09IHRoaXMuX25nU3dpdGNoO1xuICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkIHx8IG1hdGNoZWQ7XG4gICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4Kys7XG4gICAgaWYgKHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9PT0gdGhpcy5fY2FzZUNvdW50KSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWZhdWx0Q2FzZXMoIXRoaXMuX2xhc3RDYXNlc01hdGNoZWQpO1xuICAgICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4ID0gMDtcbiAgICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZWQ7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVEZWZhdWx0Q2FzZXModXNlRGVmYXVsdDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl9kZWZhdWx0Vmlld3MgJiYgdXNlRGVmYXVsdCAhPT0gdGhpcy5fZGVmYXVsdFVzZWQpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRVc2VkID0gdXNlRGVmYXVsdDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZGVmYXVsdFZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWaWV3ID0gdGhpcy5fZGVmYXVsdFZpZXdzW2ldO1xuICAgICAgICBkZWZhdWx0Vmlldy5lbmZvcmNlU3RhdGUodXNlRGVmYXVsdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXMgYSBzd2l0Y2ggY2FzZSBleHByZXNzaW9uIHRvIG1hdGNoIGFnYWluc3QgYW4gZW5jbG9zaW5nIGBuZ1N3aXRjaGAgZXhwcmVzc2lvbi5cbiAqIFdoZW4gdGhlIGV4cHJlc3Npb25zIG1hdGNoLCB0aGUgZ2l2ZW4gYE5nU3dpdGNoQ2FzZWAgdGVtcGxhdGUgaXMgcmVuZGVyZWQuXG4gKiBJZiBtdWx0aXBsZSBtYXRjaCBleHByZXNzaW9ucyBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIGFsbCBvZiB0aGVtIGFyZSBkaXNwbGF5ZWQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBXaXRoaW4gYSBzd2l0Y2ggY29udGFpbmVyLCBgKm5nU3dpdGNoQ2FzZWAgc3RhdGVtZW50cyBzcGVjaWZ5IHRoZSBtYXRjaCBleHByZXNzaW9uc1xuICogYXMgYXR0cmlidXRlcy4gSW5jbHVkZSBgKm5nU3dpdGNoRGVmYXVsdGAgYXMgdGhlIGZpbmFsIGNhc2UuXG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAuLi5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEVhY2ggc3dpdGNoLWNhc2Ugc3RhdGVtZW50IGNvbnRhaW5zIGFuIGluLWxpbmUgSFRNTCB0ZW1wbGF0ZSBvciB0ZW1wbGF0ZSByZWZlcmVuY2VcbiAqIHRoYXQgZGVmaW5lcyB0aGUgc3VidHJlZSB0byBiZSBzZWxlY3RlZCBpZiB0aGUgdmFsdWUgb2YgdGhlIG1hdGNoIGV4cHJlc3Npb25cbiAqIG1hdGNoZXMgdGhlIHZhbHVlIG9mIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBVbmxpa2UgSmF2YVNjcmlwdCwgd2hpY2ggdXNlcyBzdHJpY3QgZXF1YWxpdHksIEFuZ3VsYXIgdXNlcyBsb29zZSBlcXVhbGl0eS5cbiAqIFRoaXMgbWVhbnMgdGhhdCB0aGUgZW1wdHkgc3RyaW5nLCBgXCJcImAgbWF0Y2hlcyAwLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBzZWUgYE5nU3dpdGNoYFxuICogQHNlZSBgTmdTd2l0Y2hEZWZhdWx0YFxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hDYXNlXSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoQ2FzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIF92aWV3OiBTd2l0Y2hWaWV3O1xuICAvKipcbiAgICogU3RvcmVzIHRoZSBIVE1MIHRlbXBsYXRlIHRvIGJlIHNlbGVjdGVkIG9uIG1hdGNoLlxuICAgKi9cbiAgQElucHV0KCkgbmdTd2l0Y2hDYXNlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgcHJpdmF0ZSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBuZ1N3aXRjaC5fYWRkQ2FzZSgpO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgY2FzZSBtYXRjaGluZy4gRm9yIGludGVybmFsIHVzZSBvbmx5LlxuICAgKi9cbiAgbmdEb0NoZWNrKCkge1xuICAgIHRoaXMuX3ZpZXcuZW5mb3JjZVN0YXRlKHRoaXMubmdTd2l0Y2guX21hdGNoQ2FzZSh0aGlzLm5nU3dpdGNoQ2FzZSkpO1xuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgaXMgcmVuZGVyZWQgd2hlbiBubyBgTmdTd2l0Y2hDYXNlYCBleHByZXNzaW9uc1xuICogbWF0Y2ggdGhlIGBOZ1N3aXRjaGAgZXhwcmVzc2lvbi5cbiAqIFRoaXMgc3RhdGVtZW50IHNob3VsZCBiZSB0aGUgZmluYWwgY2FzZSBpbiBhbiBgTmdTd2l0Y2hgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBzZWUgYE5nU3dpdGNoYFxuICogQHNlZSBgTmdTd2l0Y2hDYXNlYFxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIG5nU3dpdGNoLl9hZGREZWZhdWx0KG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKSk7XG4gIH1cbn1cbiJdfQ==