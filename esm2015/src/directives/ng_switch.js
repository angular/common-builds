/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
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
    NgSwitch.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitch]' },] }
    ];
    NgSwitch.propDecorators = {
        ngSwitch: [{ type: Input }]
    };
    return NgSwitch;
})();
export { NgSwitch };
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
    NgSwitchCase.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitchCase]' },] }
    ];
    NgSwitchCase.ctorParameters = () => [
        { type: ViewContainerRef },
        { type: TemplateRef },
        { type: NgSwitch, decorators: [{ type: Host }] }
    ];
    NgSwitchCase.propDecorators = {
        ngSwitchCase: [{ type: Input }]
    };
    return NgSwitchCase;
})();
export { NgSwitchCase };
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
    NgSwitchDefault.decorators = [
        { type: Directive, args: [{ selector: '[ngSwitchDefault]' },] }
    ];
    NgSwitchDefault.ctorParameters = () => [
        { type: ViewContainerRef },
        { type: TemplateRef },
        { type: NgSwitch, decorators: [{ type: Host }] }
    ];
    return NgSwitchDefault;
})();
export { NgSwitchDefault };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFXLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTdGLE1BQU0sT0FBTyxVQUFVO0lBR3JCLFlBQ1ksaUJBQW1DLEVBQVUsWUFBaUM7UUFBOUUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUhsRixhQUFRLEdBQUcsS0FBSyxDQUFDO0lBR29FLENBQUM7SUFFOUYsTUFBTTtRQUNKLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELFlBQVksQ0FBQyxPQUFnQjtRQUMzQixJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2Y7YUFBTSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDcEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUVHO0FBQ0g7SUFB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N0IsV0FBVztnQkErTHBCLFFBQVEsdUJBQWpDLElBQUk7OzsrQkFKUixLQUFLOztJQWVSLG1CQUFDO0tBQUE7U0FwQlksWUFBWTtBQXNCekI7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNIO0lBQUEsTUFDYSxlQUFlO1FBQzFCLFlBQ0ksYUFBK0IsRUFBRSxXQUFnQyxFQUN6RCxRQUFrQjtZQUM1QixRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7OztnQkFORixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUM7OztnQkExTlksZ0JBQWdCO2dCQUE3QixXQUFXO2dCQThONUIsUUFBUSx1QkFBekIsSUFBSTs7SUFHWCxzQkFBQztLQUFBO1NBTlksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNsYXNzIFN3aXRjaFZpZXcge1xuICBwcml2YXRlIF9jcmVhdGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge31cblxuICBjcmVhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICB9XG5cbiAgZW5mb3JjZVN0YXRlKGNyZWF0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoY3JlYXRlZCAmJiAhdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9IGVsc2UgaWYgKCFjcmVhdGVkICYmIHRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBgW25nU3dpdGNoXWAgZGlyZWN0aXZlIG9uIGEgY29udGFpbmVyIHNwZWNpZmllcyBhbiBleHByZXNzaW9uIHRvIG1hdGNoIGFnYWluc3QuXG4gKiBUaGUgZXhwcmVzc2lvbnMgdG8gbWF0Y2ggYXJlIHByb3ZpZGVkIGJ5IGBuZ1N3aXRjaENhc2VgIGRpcmVjdGl2ZXMgb24gdmlld3Mgd2l0aGluIHRoZSBjb250YWluZXIuXG4gKiAtIEV2ZXJ5IHZpZXcgdGhhdCBtYXRjaGVzIGlzIHJlbmRlcmVkLlxuICogLSBJZiB0aGVyZSBhcmUgbm8gbWF0Y2hlcywgYSB2aWV3IHdpdGggdGhlIGBuZ1N3aXRjaERlZmF1bHRgIGRpcmVjdGl2ZSBpcyByZW5kZXJlZC5cbiAqIC0gRWxlbWVudHMgd2l0aGluIHRoZSBgW05nU3dpdGNoXWAgc3RhdGVtZW50IGJ1dCBvdXRzaWRlIG9mIGFueSBgTmdTd2l0Y2hDYXNlYFxuICogb3IgYG5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlIGFyZSBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBEZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCBmb3IgdGhlIGRpcmVjdGl2ZSwgYW5kIHNwZWNpZnkgdGhlIHN3aXRjaCBleHByZXNzaW9uXG4gKiB0byBtYXRjaCBhZ2FpbnN0IGFzIGFuIGF0dHJpYnV0ZTpcbiAqXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqIGBgYFxuICpcbiAqIFdpdGhpbiB0aGUgY29udGFpbmVyLCBgKm5nU3dpdGNoQ2FzZWAgc3RhdGVtZW50cyBzcGVjaWZ5IHRoZSBtYXRjaCBleHByZXNzaW9uc1xuICogYXMgYXR0cmlidXRlcy4gSW5jbHVkZSBgKm5nU3dpdGNoRGVmYXVsdGAgYXMgdGhlIGZpbmFsIGNhc2UuXG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIC4uLlxuICogICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gdXNlIG1vcmUgdGhhbiBvbmUgY2FzZSB0byBkaXNwbGF5IHRoZSBzYW1lIHZpZXc6XG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDwhLS0gdGhlIHNhbWUgdmlldyBjYW4gYmUgc2hvd24gaW4gbW9yZSB0aGFuIG9uZSBjYXNlIC0tPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8yXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogICA8IS0tZGVmYXVsdCBjYXNlIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoZXMgLS0+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IGNhc2VzIGNhbiBiZSBuZXN0ZWQ6XG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8yXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgICA8c29tZS1vdGhlci1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj4uLi48L3NvbWUtb3RoZXItZWxlbWVudD5cbiAqICAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPlxuICogICAgICAgICA8IS0tIHVzZSBhIG5nLWNvbnRhaW5lciB0byBncm91cCBtdWx0aXBsZSByb290IG5vZGVzIC0tPlxuICogICAgICAgICA8aW5uZXItZWxlbWVudD48L2lubmVyLWVsZW1lbnQ+XG4gKiAgICAgICAgIDxpbm5lci1vdGhlci1lbGVtZW50PjwvaW5uZXItb3RoZXItZWxlbWVudD5cbiAqICAgICAgIDwvbmctY29udGFpbmVyPlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAc2VlIGBOZ1N3aXRjaENhc2VgXG4gKiBAc2VlIGBOZ1N3aXRjaERlZmF1bHRgXG4gKiBAc2VlIFtTdHJ1Y3R1cmFsIERpcmVjdGl2ZXNdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcylcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoXSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2RlZmF1bHRWaWV3cyE6IFN3aXRjaFZpZXdbXTtcbiAgcHJpdmF0ZSBfZGVmYXVsdFVzZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfY2FzZUNvdW50ID0gMDtcbiAgcHJpdmF0ZSBfbGFzdENhc2VDaGVja0luZGV4ID0gMDtcbiAgcHJpdmF0ZSBfbGFzdENhc2VzTWF0Y2hlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9uZ1N3aXRjaDogYW55O1xuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ1N3aXRjaChuZXdWYWx1ZTogYW55KSB7XG4gICAgdGhpcy5fbmdTd2l0Y2ggPSBuZXdWYWx1ZTtcbiAgICBpZiAodGhpcy5fY2FzZUNvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWZhdWx0Q2FzZXModHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkQ2FzZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jYXNlQ291bnQrKztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZERlZmF1bHQodmlldzogU3dpdGNoVmlldykge1xuICAgIGlmICghdGhpcy5fZGVmYXVsdFZpZXdzKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0Vmlld3MgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fZGVmYXVsdFZpZXdzLnB1c2godmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaENhc2UodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1hdGNoZWQgPSB2YWx1ZSA9PSB0aGlzLl9uZ1N3aXRjaDtcbiAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCB8fCBtYXRjaGVkO1xuICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCsrO1xuICAgIGlmICh0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXggPT09IHRoaXMuX2Nhc2VDb3VudCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKCF0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkKTtcbiAgICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gICAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRGVmYXVsdENhc2VzKHVzZURlZmF1bHQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fZGVmYXVsdFZpZXdzICYmIHVzZURlZmF1bHQgIT09IHRoaXMuX2RlZmF1bHRVc2VkKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0VXNlZCA9IHVzZURlZmF1bHQ7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2RlZmF1bHRWaWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBkZWZhdWx0VmlldyA9IHRoaXMuX2RlZmF1bHRWaWV3c1tpXTtcbiAgICAgICAgZGVmYXVsdFZpZXcuZW5mb3JjZVN0YXRlKHVzZURlZmF1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVzIGEgc3dpdGNoIGNhc2UgZXhwcmVzc2lvbiB0byBtYXRjaCBhZ2FpbnN0IGFuIGVuY2xvc2luZyBgbmdTd2l0Y2hgIGV4cHJlc3Npb24uXG4gKiBXaGVuIHRoZSBleHByZXNzaW9ucyBtYXRjaCwgdGhlIGdpdmVuIGBOZ1N3aXRjaENhc2VgIHRlbXBsYXRlIGlzIHJlbmRlcmVkLlxuICogSWYgbXVsdGlwbGUgbWF0Y2ggZXhwcmVzc2lvbnMgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uIHZhbHVlLCBhbGwgb2YgdGhlbSBhcmUgZGlzcGxheWVkLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogV2l0aGluIGEgc3dpdGNoIGNvbnRhaW5lciwgYCpuZ1N3aXRjaENhc2VgIHN0YXRlbWVudHMgc3BlY2lmeSB0aGUgbWF0Y2ggZXhwcmVzc2lvbnNcbiAqIGFzIGF0dHJpYnV0ZXMuIEluY2x1ZGUgYCpuZ1N3aXRjaERlZmF1bHRgIGFzIHRoZSBmaW5hbCBjYXNlLlxuICpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgLi4uXG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBFYWNoIHN3aXRjaC1jYXNlIHN0YXRlbWVudCBjb250YWlucyBhbiBpbi1saW5lIEhUTUwgdGVtcGxhdGUgb3IgdGVtcGxhdGUgcmVmZXJlbmNlXG4gKiB0aGF0IGRlZmluZXMgdGhlIHN1YnRyZWUgdG8gYmUgc2VsZWN0ZWQgaWYgdGhlIHZhbHVlIG9mIHRoZSBtYXRjaCBleHByZXNzaW9uXG4gKiBtYXRjaGVzIHRoZSB2YWx1ZSBvZiB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogVW5saWtlIEphdmFTY3JpcHQsIHdoaWNoIHVzZXMgc3RyaWN0IGVxdWFsaXR5LCBBbmd1bGFyIHVzZXMgbG9vc2UgZXF1YWxpdHkuXG4gKiBUaGlzIG1lYW5zIHRoYXQgdGhlIGVtcHR5IHN0cmluZywgYFwiXCJgIG1hdGNoZXMgMC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAc2VlIGBOZ1N3aXRjaGBcbiAqIEBzZWUgYE5nU3dpdGNoRGVmYXVsdGBcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoQ2FzZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaENhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBfdmlldzogU3dpdGNoVmlldztcbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgSFRNTCB0ZW1wbGF0ZSB0byBiZSBzZWxlY3RlZCBvbiBtYXRjaC5cbiAgICovXG4gIEBJbnB1dCgpIG5nU3dpdGNoQ2FzZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBASG9zdCgpIHByaXZhdGUgbmdTd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgbmdTd2l0Y2guX2FkZENhc2UoKTtcbiAgICB0aGlzLl92aWV3ID0gbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGNhc2UgbWF0Y2hpbmcuIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICovXG4gIG5nRG9DaGVjaygpIHtcbiAgICB0aGlzLl92aWV3LmVuZm9yY2VTdGF0ZSh0aGlzLm5nU3dpdGNoLl9tYXRjaENhc2UodGhpcy5uZ1N3aXRjaENhc2UpKTtcbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgdmlldyB0aGF0IGlzIHJlbmRlcmVkIHdoZW4gbm8gYE5nU3dpdGNoQ2FzZWAgZXhwcmVzc2lvbnNcbiAqIG1hdGNoIHRoZSBgTmdTd2l0Y2hgIGV4cHJlc3Npb24uXG4gKiBUaGlzIHN0YXRlbWVudCBzaG91bGQgYmUgdGhlIGZpbmFsIGNhc2UgaW4gYW4gYE5nU3dpdGNoYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAc2VlIGBOZ1N3aXRjaGBcbiAqIEBzZWUgYE5nU3dpdGNoQ2FzZWBcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoRGVmYXVsdF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaERlZmF1bHQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgQEhvc3QoKSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBuZ1N3aXRjaC5fYWRkRGVmYXVsdChuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZikpO1xuICB9XG59XG4iXX0=