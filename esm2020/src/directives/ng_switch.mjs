/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Host, Input, Optional, TemplateRef, ViewContainerRef, ɵRuntimeError as RuntimeError } from '@angular/core';
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
export class NgSwitch {
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
NgSwitch.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.4+sha-b6a950c", ngImport: i0, type: NgSwitch, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgSwitch.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.4+sha-b6a950c", type: NgSwitch, isStandalone: true, selector: "[ngSwitch]", inputs: { ngSwitch: "ngSwitch" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.4+sha-b6a950c", ngImport: i0, type: NgSwitch, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngSwitch]',
                    standalone: true,
                }]
        }], propDecorators: { ngSwitch: [{
                type: Input
            }] } });
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
export class NgSwitchCase {
    constructor(viewContainer, templateRef, ngSwitch) {
        this.ngSwitch = ngSwitch;
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && !ngSwitch) {
            throwNgSwitchProviderNotFoundError('ngSwitchCase', 'NgSwitchCase');
        }
        ngSwitch._addCase();
        this._view = new SwitchView(viewContainer, templateRef);
    }
    /**
     * Performs case matching. For internal use only.
     * @nodoc
     */
    ngDoCheck() {
        this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase));
    }
}
NgSwitchCase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.4+sha-b6a950c", ngImport: i0, type: NgSwitchCase, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: NgSwitch, host: true, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
NgSwitchCase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.4+sha-b6a950c", type: NgSwitchCase, isStandalone: true, selector: "[ngSwitchCase]", inputs: { ngSwitchCase: "ngSwitchCase" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.4+sha-b6a950c", ngImport: i0, type: NgSwitchCase, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngSwitchCase]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                    type: Optional
                }, {
                    type: Host
                }] }]; }, propDecorators: { ngSwitchCase: [{
                type: Input
            }] } });
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
export class NgSwitchDefault {
    constructor(viewContainer, templateRef, ngSwitch) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && !ngSwitch) {
            throwNgSwitchProviderNotFoundError('ngSwitchDefault', 'NgSwitchDefault');
        }
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
}
NgSwitchDefault.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.4+sha-b6a950c", ngImport: i0, type: NgSwitchDefault, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: NgSwitch, host: true, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
NgSwitchDefault.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.4+sha-b6a950c", type: NgSwitchDefault, isStandalone: true, selector: "[ngSwitchDefault]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.4+sha-b6a950c", ngImport: i0, type: NgSwitchDefault, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngSwitchDefault]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                    type: Optional
                }, {
                    type: Host
                }] }]; } });
function throwNgSwitchProviderNotFoundError(attrName, directiveName) {
    throw new RuntimeError(2000 /* RuntimeErrorCode.PARENT_NG_SWITCH_NOT_FOUND */, `An element with the "${attrName}" attribute ` +
        `(matching the "${directiveName}" directive) must be located inside an element with the "ngSwitch" attribute ` +
        `(matching "NgSwitch" directive)`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFXLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUl0SSxNQUFNLE9BQU8sVUFBVTtJQUdyQixZQUNZLGlCQUFtQyxFQUFVLFlBQWlDO1FBQTlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFIbEYsYUFBUSxHQUFHLEtBQUssQ0FBQztJQUdvRSxDQUFDO0lBRTlGLE1BQU07UUFDSixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBZ0I7UUFDM0IsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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IEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEhvc3QsIElucHV0LCBPcHRpb25hbCwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWYsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcblxuZXhwb3J0IGNsYXNzIFN3aXRjaFZpZXcge1xuICBwcml2YXRlIF9jcmVhdGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge31cblxuICBjcmVhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICB9XG5cbiAgZW5mb3JjZVN0YXRlKGNyZWF0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoY3JlYXRlZCAmJiAhdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9IGVsc2UgaWYgKCFjcmVhdGVkICYmIHRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBgW25nU3dpdGNoXWAgZGlyZWN0aXZlIG9uIGEgY29udGFpbmVyIHNwZWNpZmllcyBhbiBleHByZXNzaW9uIHRvIG1hdGNoIGFnYWluc3QuXG4gKiBUaGUgZXhwcmVzc2lvbnMgdG8gbWF0Y2ggYXJlIHByb3ZpZGVkIGJ5IGBuZ1N3aXRjaENhc2VgIGRpcmVjdGl2ZXMgb24gdmlld3Mgd2l0aGluIHRoZSBjb250YWluZXIuXG4gKiAtIEV2ZXJ5IHZpZXcgdGhhdCBtYXRjaGVzIGlzIHJlbmRlcmVkLlxuICogLSBJZiB0aGVyZSBhcmUgbm8gbWF0Y2hlcywgYSB2aWV3IHdpdGggdGhlIGBuZ1N3aXRjaERlZmF1bHRgIGRpcmVjdGl2ZSBpcyByZW5kZXJlZC5cbiAqIC0gRWxlbWVudHMgd2l0aGluIHRoZSBgW05nU3dpdGNoXWAgc3RhdGVtZW50IGJ1dCBvdXRzaWRlIG9mIGFueSBgTmdTd2l0Y2hDYXNlYFxuICogb3IgYG5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlIGFyZSBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBEZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCBmb3IgdGhlIGRpcmVjdGl2ZSwgYW5kIHNwZWNpZnkgdGhlIHN3aXRjaCBleHByZXNzaW9uXG4gKiB0byBtYXRjaCBhZ2FpbnN0IGFzIGFuIGF0dHJpYnV0ZTpcbiAqXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqIGBgYFxuICpcbiAqIFdpdGhpbiB0aGUgY29udGFpbmVyLCBgKm5nU3dpdGNoQ2FzZWAgc3RhdGVtZW50cyBzcGVjaWZ5IHRoZSBtYXRjaCBleHByZXNzaW9uc1xuICogYXMgYXR0cmlidXRlcy4gSW5jbHVkZSBgKm5nU3dpdGNoRGVmYXVsdGAgYXMgdGhlIGZpbmFsIGNhc2UuXG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIC4uLlxuICogICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gdXNlIG1vcmUgdGhhbiBvbmUgY2FzZSB0byBkaXNwbGF5IHRoZSBzYW1lIHZpZXc6XG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDwhLS0gdGhlIHNhbWUgdmlldyBjYW4gYmUgc2hvd24gaW4gbW9yZSB0aGFuIG9uZSBjYXNlIC0tPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8yXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogICA8IS0tZGVmYXVsdCBjYXNlIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoZXMgLS0+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IGNhc2VzIGNhbiBiZSBuZXN0ZWQ6XG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8yXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgICA8c29tZS1vdGhlci1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj4uLi48L3NvbWUtb3RoZXItZWxlbWVudD5cbiAqICAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPlxuICogICAgICAgICA8IS0tIHVzZSBhIG5nLWNvbnRhaW5lciB0byBncm91cCBtdWx0aXBsZSByb290IG5vZGVzIC0tPlxuICogICAgICAgICA8aW5uZXItZWxlbWVudD48L2lubmVyLWVsZW1lbnQ+XG4gKiAgICAgICAgIDxpbm5lci1vdGhlci1lbGVtZW50PjwvaW5uZXItb3RoZXItZWxlbWVudD5cbiAqICAgICAgIDwvbmctY29udGFpbmVyPlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAc2VlIGBOZ1N3aXRjaENhc2VgXG4gKiBAc2VlIGBOZ1N3aXRjaERlZmF1bHRgXG4gKiBAc2VlIFtTdHJ1Y3R1cmFsIERpcmVjdGl2ZXNdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcylcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ1N3aXRjaF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9kZWZhdWx0Vmlld3MhOiBTd2l0Y2hWaWV3W107XG4gIHByaXZhdGUgX2RlZmF1bHRVc2VkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Nhc2VDb3VudCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfbmdTd2l0Y2g6IGFueTtcblxuICBASW5wdXQoKVxuICBzZXQgbmdTd2l0Y2gobmV3VmFsdWU6IGFueSkge1xuICAgIHRoaXMuX25nU3dpdGNoID0gbmV3VmFsdWU7XG4gICAgaWYgKHRoaXMuX2Nhc2VDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZENhc2UoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY2FzZUNvdW50Kys7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGREZWZhdWx0KHZpZXc6IFN3aXRjaFZpZXcpIHtcbiAgICBpZiAoIXRoaXMuX2RlZmF1bHRWaWV3cykge1xuICAgICAgdGhpcy5fZGVmYXVsdFZpZXdzID0gW107XG4gICAgfVxuICAgIHRoaXMuX2RlZmF1bHRWaWV3cy5wdXNoKHZpZXcpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF0Y2hDYXNlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICBjb25zdCBtYXRjaGVkID0gdmFsdWUgPT0gdGhpcy5fbmdTd2l0Y2g7XG4gICAgdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCA9IHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgfHwgbWF0Y2hlZDtcbiAgICB0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXgrKztcbiAgICBpZiAodGhpcy5fbGFzdENhc2VDaGVja0luZGV4ID09PSB0aGlzLl9jYXNlQ291bnQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURlZmF1bHRDYXNlcyghdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCk7XG4gICAgICB0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXggPSAwO1xuICAgICAgdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlZDtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZURlZmF1bHRDYXNlcyh1c2VEZWZhdWx0OiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuX2RlZmF1bHRWaWV3cyAmJiB1c2VEZWZhdWx0ICE9PSB0aGlzLl9kZWZhdWx0VXNlZCkge1xuICAgICAgdGhpcy5fZGVmYXVsdFVzZWQgPSB1c2VEZWZhdWx0O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9kZWZhdWx0Vmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdFZpZXcgPSB0aGlzLl9kZWZhdWx0Vmlld3NbaV07XG4gICAgICAgIGRlZmF1bHRWaWV3LmVuZm9yY2VTdGF0ZSh1c2VEZWZhdWx0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlcyBhIHN3aXRjaCBjYXNlIGV4cHJlc3Npb24gdG8gbWF0Y2ggYWdhaW5zdCBhbiBlbmNsb3NpbmcgYG5nU3dpdGNoYCBleHByZXNzaW9uLlxuICogV2hlbiB0aGUgZXhwcmVzc2lvbnMgbWF0Y2gsIHRoZSBnaXZlbiBgTmdTd2l0Y2hDYXNlYCB0ZW1wbGF0ZSBpcyByZW5kZXJlZC5cbiAqIElmIG11bHRpcGxlIG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgYWxsIG9mIHRoZW0gYXJlIGRpc3BsYXllZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFdpdGhpbiBhIHN3aXRjaCBjb250YWluZXIsIGAqbmdTd2l0Y2hDYXNlYCBzdGF0ZW1lbnRzIHNwZWNpZnkgdGhlIG1hdGNoIGV4cHJlc3Npb25zXG4gKiBhcyBhdHRyaWJ1dGVzLiBJbmNsdWRlIGAqbmdTd2l0Y2hEZWZhdWx0YCBhcyB0aGUgZmluYWwgY2FzZS5cbiAqXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIC4uLlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogRWFjaCBzd2l0Y2gtY2FzZSBzdGF0ZW1lbnQgY29udGFpbnMgYW4gaW4tbGluZSBIVE1MIHRlbXBsYXRlIG9yIHRlbXBsYXRlIHJlZmVyZW5jZVxuICogdGhhdCBkZWZpbmVzIHRoZSBzdWJ0cmVlIHRvIGJlIHNlbGVjdGVkIGlmIHRoZSB2YWx1ZSBvZiB0aGUgbWF0Y2ggZXhwcmVzc2lvblxuICogbWF0Y2hlcyB0aGUgdmFsdWUgb2YgdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIFVubGlrZSBKYXZhU2NyaXB0LCB3aGljaCB1c2VzIHN0cmljdCBlcXVhbGl0eSwgQW5ndWxhciB1c2VzIGxvb3NlIGVxdWFsaXR5LlxuICogVGhpcyBtZWFucyB0aGF0IHRoZSBlbXB0eSBzdHJpbmcsIGBcIlwiYCBtYXRjaGVzIDAuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSBgTmdTd2l0Y2hgXG4gKiBAc2VlIGBOZ1N3aXRjaERlZmF1bHRgXG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdTd2l0Y2hDYXNlXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoQ2FzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIF92aWV3OiBTd2l0Y2hWaWV3O1xuICAvKipcbiAgICogU3RvcmVzIHRoZSBIVE1MIHRlbXBsYXRlIHRvIGJlIHNlbGVjdGVkIG9uIG1hdGNoLlxuICAgKi9cbiAgQElucHV0KCkgbmdTd2l0Y2hDYXNlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBPcHRpb25hbCgpIEBIb3N0KCkgcHJpdmF0ZSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgIW5nU3dpdGNoKSB7XG4gICAgICB0aHJvd05nU3dpdGNoUHJvdmlkZXJOb3RGb3VuZEVycm9yKCduZ1N3aXRjaENhc2UnLCAnTmdTd2l0Y2hDYXNlJyk7XG4gICAgfVxuXG4gICAgbmdTd2l0Y2guX2FkZENhc2UoKTtcbiAgICB0aGlzLl92aWV3ID0gbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGNhc2UgbWF0Y2hpbmcuIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICogQG5vZG9jXG4gICAqL1xuICBuZ0RvQ2hlY2soKSB7XG4gICAgdGhpcy5fdmlldy5lbmZvcmNlU3RhdGUodGhpcy5uZ1N3aXRjaC5fbWF0Y2hDYXNlKHRoaXMubmdTd2l0Y2hDYXNlKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ3JlYXRlcyBhIHZpZXcgdGhhdCBpcyByZW5kZXJlZCB3aGVuIG5vIGBOZ1N3aXRjaENhc2VgIGV4cHJlc3Npb25zXG4gKiBtYXRjaCB0aGUgYE5nU3dpdGNoYCBleHByZXNzaW9uLlxuICogVGhpcyBzdGF0ZW1lbnQgc2hvdWxkIGJlIHRoZSBmaW5hbCBjYXNlIGluIGFuIGBOZ1N3aXRjaGAuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSBgTmdTd2l0Y2hgXG4gKiBAc2VlIGBOZ1N3aXRjaENhc2VgXG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBAT3B0aW9uYWwoKSBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiAhbmdTd2l0Y2gpIHtcbiAgICAgIHRocm93TmdTd2l0Y2hQcm92aWRlck5vdEZvdW5kRXJyb3IoJ25nU3dpdGNoRGVmYXVsdCcsICdOZ1N3aXRjaERlZmF1bHQnKTtcbiAgICB9XG5cbiAgICBuZ1N3aXRjaC5fYWRkRGVmYXVsdChuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZikpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRocm93TmdTd2l0Y2hQcm92aWRlck5vdEZvdW5kRXJyb3IoYXR0ck5hbWU6IHN0cmluZywgZGlyZWN0aXZlTmFtZTogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5QQVJFTlRfTkdfU1dJVENIX05PVF9GT1VORCxcbiAgICAgIGBBbiBlbGVtZW50IHdpdGggdGhlIFwiJHthdHRyTmFtZX1cIiBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgYChtYXRjaGluZyB0aGUgXCIke1xuICAgICAgICAgICAgICBkaXJlY3RpdmVOYW1lfVwiIGRpcmVjdGl2ZSkgbXVzdCBiZSBsb2NhdGVkIGluc2lkZSBhbiBlbGVtZW50IHdpdGggdGhlIFwibmdTd2l0Y2hcIiBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgYChtYXRjaGluZyBcIk5nU3dpdGNoXCIgZGlyZWN0aXZlKWApO1xufVxuIl19