/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Host, Input, Optional, TemplateRef, ViewContainerRef, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { NG_SWITCH_USE_STRICT_EQUALS } from './ng_switch_equality';
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
 * @see {@link NgSwitchCase}
 * @see {@link NgSwitchDefault}
 * @see [Structural Directives](guide/structural-directives)
 *
 */
export class NgSwitch {
    constructor() {
        this._defaultViews = [];
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
        this._defaultViews.push(view);
    }
    /** @internal */
    _matchCase(value) {
        const matched = NG_SWITCH_USE_STRICT_EQUALS
            ? value === this._ngSwitch
            : value == this._ngSwitch;
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && matched !== (value == this._ngSwitch)) {
            console.warn(formatRuntimeError(2001 /* RuntimeErrorCode.EQUALITY_NG_SWITCH_DIFFERENCE */, 'As of Angular v17 the NgSwitch directive uses strict equality comparison === instead of == to match different cases. ' +
                `Previously the case value "${stringifyValue(value)}" matched switch expression value "${stringifyValue(this._ngSwitch)}", but this is no longer the case with the stricter equality check. ` +
                'Your comparison results return different results using === vs. == and you should adjust your ngSwitch expression and / or values to conform with the strict equality requirements.'));
        }
        this._lastCasesMatched ||= matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        return matched;
    }
    _updateDefaultCases(useDefault) {
        if (this._defaultViews.length > 0 && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (const defaultView of this._defaultViews) {
                defaultView.enforceState(useDefault);
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-07d5e42", ngImport: i0, type: NgSwitch, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.0-next.1+sha-07d5e42", type: NgSwitch, isStandalone: true, selector: "[ngSwitch]", inputs: { ngSwitch: "ngSwitch" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-07d5e42", ngImport: i0, type: NgSwitch, decorators: [{
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
 * As of Angular v17 the NgSwitch directive uses strict equality comparison (`===`) instead of
 * loose equality (`==`) to match different cases.
 *
 * @publicApi
 * @see {@link NgSwitch}
 * @see {@link NgSwitchDefault}
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-07d5e42", ngImport: i0, type: NgSwitchCase, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: NgSwitch, host: true, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.0-next.1+sha-07d5e42", type: NgSwitchCase, isStandalone: true, selector: "[ngSwitchCase]", inputs: { ngSwitchCase: "ngSwitchCase" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-07d5e42", ngImport: i0, type: NgSwitchCase, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngSwitchCase]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                    type: Optional
                }, {
                    type: Host
                }] }], propDecorators: { ngSwitchCase: [{
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
 * @see {@link NgSwitch}
 * @see {@link NgSwitchCase}
 *
 */
export class NgSwitchDefault {
    constructor(viewContainer, templateRef, ngSwitch) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && !ngSwitch) {
            throwNgSwitchProviderNotFoundError('ngSwitchDefault', 'NgSwitchDefault');
        }
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-07d5e42", ngImport: i0, type: NgSwitchDefault, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }, { token: NgSwitch, host: true, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.0-next.1+sha-07d5e42", type: NgSwitchDefault, isStandalone: true, selector: "[ngSwitchDefault]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-07d5e42", ngImport: i0, type: NgSwitchDefault, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngSwitchDefault]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }, { type: NgSwitch, decorators: [{
                    type: Optional
                }, {
                    type: Host
                }] }] });
function throwNgSwitchProviderNotFoundError(attrName, directiveName) {
    throw new RuntimeError(2000 /* RuntimeErrorCode.PARENT_NG_SWITCH_NOT_FOUND */, `An element with the "${attrName}" attribute ` +
        `(matching the "${directiveName}" directive) must be located inside an element with the "ngSwitch" attribute ` +
        `(matching "NgSwitch" directive)`);
}
function stringifyValue(value) {
    return typeof value === 'string' ? `'${value}'` : String(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUVULElBQUksRUFDSixLQUFLLEVBQ0wsUUFBUSxFQUNSLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsbUJBQW1CLElBQUksa0JBQWtCLEVBQ3pDLGFBQWEsSUFBSSxZQUFZLEdBQzlCLE1BQU0sZUFBZSxDQUFDO0FBSXZCLE9BQU8sRUFBQywyQkFBMkIsRUFBQyxNQUFNLHNCQUFzQixDQUFDOztBQUVqRSxNQUFNLE9BQU8sVUFBVTtJQUdyQixZQUNVLGlCQUFtQyxFQUNuQyxZQUFpQztRQURqQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ25DLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUpuQyxhQUFRLEdBQUcsS0FBSyxDQUFDO0lBS3RCLENBQUM7SUFFSixNQUFNO1FBQ0osSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsWUFBWSxDQUFDLE9BQWdCO1FBQzNCLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQixDQUFDO2FBQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpRUc7QUFLSCxNQUFNLE9BQU8sUUFBUTtJQUpyQjtRQUtVLGtCQUFhLEdBQWlCLEVBQUUsQ0FBQztRQUNqQyxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2Ysd0JBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztLQTBEbkM7SUF2REMsSUFDSSxRQUFRLENBQUMsUUFBYTtRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLFdBQVcsQ0FBQyxJQUFnQjtRQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLFVBQVUsQ0FBQyxLQUFVO1FBQ25CLE1BQU0sT0FBTyxHQUFHLDJCQUEyQjtZQUN6QyxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxTQUFTO1lBQzFCLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUM3RixPQUFPLENBQUMsSUFBSSxDQUNWLGtCQUFrQiw0REFFaEIsdUhBQXVIO2dCQUNySCw4QkFBOEIsY0FBYyxDQUMxQyxLQUFLLENBQ04sc0NBQXNDLGNBQWMsQ0FDbkQsSUFBSSxDQUFDLFNBQVMsQ0FDZixzRUFBc0U7Z0JBQ3ZFLG9MQUFvTCxDQUN2TCxDQUNGLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixLQUFLLE9BQU8sQ0FBQztRQUNuQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRU8sbUJBQW1CLENBQUMsVUFBbUI7UUFDN0MsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0RSxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztZQUMvQixLQUFLLE1BQU0sV0FBVyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDN0MsV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7eUhBOURVLFFBQVE7NkdBQVIsUUFBUTs7c0dBQVIsUUFBUTtrQkFKcEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsWUFBWTtvQkFDdEIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzhCQVVLLFFBQVE7c0JBRFgsS0FBSzs7QUF5RFI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0NHO0FBS0gsTUFBTSxPQUFPLFlBQVk7SUFPdkIsWUFDRSxhQUErQixFQUMvQixXQUFnQyxFQUNKLFFBQWtCO1FBQWxCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFOUMsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pFLGtDQUFrQyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTO1FBQ1AsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQzt5SEExQlUsWUFBWTs2R0FBWixZQUFZOztzR0FBWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBV0ksUUFBUTs7MEJBQUksSUFBSTt5Q0FMVixZQUFZO3NCQUFwQixLQUFLOztBQXdCUjs7Ozs7Ozs7Ozs7OztHQWFHO0FBS0gsTUFBTSxPQUFPLGVBQWU7SUFDMUIsWUFDRSxhQUErQixFQUMvQixXQUFnQyxFQUNaLFFBQWtCO1FBRXRDLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqRSxrQ0FBa0MsQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7eUhBWFUsZUFBZTs2R0FBZixlQUFlOztzR0FBZixlQUFlO2tCQUozQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBS0ksUUFBUTs7MEJBQUksSUFBSTs7QUFVckIsU0FBUyxrQ0FBa0MsQ0FBQyxRQUFnQixFQUFFLGFBQXFCO0lBQ2pGLE1BQU0sSUFBSSxZQUFZLHlEQUVwQix3QkFBd0IsUUFBUSxjQUFjO1FBQzVDLGtCQUFrQixhQUFhLCtFQUErRTtRQUM5RyxpQ0FBaUMsQ0FDcEMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxLQUFjO0lBQ3BDLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEhvc3QsXG4gIElucHV0LFxuICBPcHRpb25hbCxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuXG5pbXBvcnQge05HX1NXSVRDSF9VU0VfU1RSSUNUX0VRVUFMU30gZnJvbSAnLi9uZ19zd2l0Y2hfZXF1YWxpdHknO1xuXG5leHBvcnQgY2xhc3MgU3dpdGNoVmlldyB7XG4gIHByaXZhdGUgX2NyZWF0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICApIHt9XG5cbiAgY3JlYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2NyZWF0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMuX3RlbXBsYXRlUmVmKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgfVxuXG4gIGVuZm9yY2VTdGF0ZShjcmVhdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKGNyZWF0ZWQgJiYgIXRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuY3JlYXRlKCk7XG4gICAgfSBlbHNlIGlmICghY3JlYXRlZCAmJiB0aGlzLl9jcmVhdGVkKSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgYFtuZ1N3aXRjaF1gIGRpcmVjdGl2ZSBvbiBhIGNvbnRhaW5lciBzcGVjaWZpZXMgYW4gZXhwcmVzc2lvbiB0byBtYXRjaCBhZ2FpbnN0LlxuICogVGhlIGV4cHJlc3Npb25zIHRvIG1hdGNoIGFyZSBwcm92aWRlZCBieSBgbmdTd2l0Y2hDYXNlYCBkaXJlY3RpdmVzIG9uIHZpZXdzIHdpdGhpbiB0aGUgY29udGFpbmVyLlxuICogLSBFdmVyeSB2aWV3IHRoYXQgbWF0Y2hlcyBpcyByZW5kZXJlZC5cbiAqIC0gSWYgdGhlcmUgYXJlIG5vIG1hdGNoZXMsIGEgdmlldyB3aXRoIHRoZSBgbmdTd2l0Y2hEZWZhdWx0YCBkaXJlY3RpdmUgaXMgcmVuZGVyZWQuXG4gKiAtIEVsZW1lbnRzIHdpdGhpbiB0aGUgYFtOZ1N3aXRjaF1gIHN0YXRlbWVudCBidXQgb3V0c2lkZSBvZiBhbnkgYE5nU3dpdGNoQ2FzZWBcbiAqIG9yIGBuZ1N3aXRjaERlZmF1bHRgIGRpcmVjdGl2ZSBhcmUgcHJlc2VydmVkIGF0IHRoZSBsb2NhdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogRGVmaW5lIGEgY29udGFpbmVyIGVsZW1lbnQgZm9yIHRoZSBkaXJlY3RpdmUsIGFuZCBzcGVjaWZ5IHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdG8gbWF0Y2ggYWdhaW5zdCBhcyBhbiBhdHRyaWJ1dGU6XG4gKlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiBgYGBcbiAqXG4gKiBXaXRoaW4gdGhlIGNvbnRhaW5lciwgYCpuZ1N3aXRjaENhc2VgIHN0YXRlbWVudHMgc3BlY2lmeSB0aGUgbWF0Y2ggZXhwcmVzc2lvbnNcbiAqIGFzIGF0dHJpYnV0ZXMuIEluY2x1ZGUgYCpuZ1N3aXRjaERlZmF1bHRgIGFzIHRoZSBmaW5hbCBjYXNlLlxuICpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAuLi5cbiAqICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNhZ2UgRXhhbXBsZXNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIHVzZSBtb3JlIHRoYW4gb25lIGNhc2UgdG8gZGlzcGxheSB0aGUgc2FtZSB2aWV3OlxuICpcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8IS0tIHRoZSBzYW1lIHZpZXcgY2FuIGJlIHNob3duIGluIG1vcmUgdGhhbiBvbmUgY2FzZSAtLT5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMlwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICA8c29tZS1vdGhlci1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj4uLi48L3NvbWUtb3RoZXItZWxlbWVudD5cbiAqICAgPCEtLWRlZmF1bHQgY2FzZSB3aGVuIHRoZXJlIGFyZSBubyBtYXRjaGVzIC0tPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyBjYXNlcyBjYW4gYmUgbmVzdGVkOlxuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMlwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+Li4uPC9zb21lLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8bmctY29udGFpbmVyICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj5cbiAqICAgICAgICAgPCEtLSB1c2UgYSBuZy1jb250YWluZXIgdG8gZ3JvdXAgbXVsdGlwbGUgcm9vdCBub2RlcyAtLT5cbiAqICAgICAgICAgPGlubmVyLWVsZW1lbnQ+PC9pbm5lci1lbGVtZW50PlxuICogICAgICAgICA8aW5uZXItb3RoZXItZWxlbWVudD48L2lubmVyLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSB7QGxpbmsgTmdTd2l0Y2hDYXNlfVxuICogQHNlZSB7QGxpbmsgTmdTd2l0Y2hEZWZhdWx0fVxuICogQHNlZSBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdTd2l0Y2hdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2gge1xuICBwcml2YXRlIF9kZWZhdWx0Vmlld3M6IFN3aXRjaFZpZXdbXSA9IFtdO1xuICBwcml2YXRlIF9kZWZhdWx0VXNlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9jYXNlQ291bnQgPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZUNoZWNrSW5kZXggPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX25nU3dpdGNoOiBhbnk7XG5cbiAgQElucHV0KClcbiAgc2V0IG5nU3dpdGNoKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9uZ1N3aXRjaCA9IG5ld1ZhbHVlO1xuICAgIGlmICh0aGlzLl9jYXNlQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURlZmF1bHRDYXNlcyh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRDYXNlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2Nhc2VDb3VudCsrO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkRGVmYXVsdCh2aWV3OiBTd2l0Y2hWaWV3KSB7XG4gICAgdGhpcy5fZGVmYXVsdFZpZXdzLnB1c2godmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaENhc2UodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1hdGNoZWQgPSBOR19TV0lUQ0hfVVNFX1NUUklDVF9FUVVBTFNcbiAgICAgID8gdmFsdWUgPT09IHRoaXMuX25nU3dpdGNoXG4gICAgICA6IHZhbHVlID09IHRoaXMuX25nU3dpdGNoO1xuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiBtYXRjaGVkICE9PSAodmFsdWUgPT0gdGhpcy5fbmdTd2l0Y2gpKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkVRVUFMSVRZX05HX1NXSVRDSF9ESUZGRVJFTkNFLFxuICAgICAgICAgICdBcyBvZiBBbmd1bGFyIHYxNyB0aGUgTmdTd2l0Y2ggZGlyZWN0aXZlIHVzZXMgc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb24gPT09IGluc3RlYWQgb2YgPT0gdG8gbWF0Y2ggZGlmZmVyZW50IGNhc2VzLiAnICtcbiAgICAgICAgICAgIGBQcmV2aW91c2x5IHRoZSBjYXNlIHZhbHVlIFwiJHtzdHJpbmdpZnlWYWx1ZShcbiAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICApfVwiIG1hdGNoZWQgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUgXCIke3N0cmluZ2lmeVZhbHVlKFxuICAgICAgICAgICAgICB0aGlzLl9uZ1N3aXRjaCxcbiAgICAgICAgICAgICl9XCIsIGJ1dCB0aGlzIGlzIG5vIGxvbmdlciB0aGUgY2FzZSB3aXRoIHRoZSBzdHJpY3RlciBlcXVhbGl0eSBjaGVjay4gYCArXG4gICAgICAgICAgICAnWW91ciBjb21wYXJpc29uIHJlc3VsdHMgcmV0dXJuIGRpZmZlcmVudCByZXN1bHRzIHVzaW5nID09PSB2cy4gPT0gYW5kIHlvdSBzaG91bGQgYWRqdXN0IHlvdXIgbmdTd2l0Y2ggZXhwcmVzc2lvbiBhbmQgLyBvciB2YWx1ZXMgdG8gY29uZm9ybSB3aXRoIHRoZSBzdHJpY3QgZXF1YWxpdHkgcmVxdWlyZW1lbnRzLicsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkIHx8PSBtYXRjaGVkO1xuICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCsrO1xuICAgIGlmICh0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXggPT09IHRoaXMuX2Nhc2VDb3VudCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKCF0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkKTtcbiAgICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gICAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRGVmYXVsdENhc2VzKHVzZURlZmF1bHQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fZGVmYXVsdFZpZXdzLmxlbmd0aCA+IDAgJiYgdXNlRGVmYXVsdCAhPT0gdGhpcy5fZGVmYXVsdFVzZWQpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRVc2VkID0gdXNlRGVmYXVsdDtcbiAgICAgIGZvciAoY29uc3QgZGVmYXVsdFZpZXcgb2YgdGhpcy5fZGVmYXVsdFZpZXdzKSB7XG4gICAgICAgIGRlZmF1bHRWaWV3LmVuZm9yY2VTdGF0ZSh1c2VEZWZhdWx0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlcyBhIHN3aXRjaCBjYXNlIGV4cHJlc3Npb24gdG8gbWF0Y2ggYWdhaW5zdCBhbiBlbmNsb3NpbmcgYG5nU3dpdGNoYCBleHByZXNzaW9uLlxuICogV2hlbiB0aGUgZXhwcmVzc2lvbnMgbWF0Y2gsIHRoZSBnaXZlbiBgTmdTd2l0Y2hDYXNlYCB0ZW1wbGF0ZSBpcyByZW5kZXJlZC5cbiAqIElmIG11bHRpcGxlIG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgYWxsIG9mIHRoZW0gYXJlIGRpc3BsYXllZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFdpdGhpbiBhIHN3aXRjaCBjb250YWluZXIsIGAqbmdTd2l0Y2hDYXNlYCBzdGF0ZW1lbnRzIHNwZWNpZnkgdGhlIG1hdGNoIGV4cHJlc3Npb25zXG4gKiBhcyBhdHRyaWJ1dGVzLiBJbmNsdWRlIGAqbmdTd2l0Y2hEZWZhdWx0YCBhcyB0aGUgZmluYWwgY2FzZS5cbiAqXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIC4uLlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogRWFjaCBzd2l0Y2gtY2FzZSBzdGF0ZW1lbnQgY29udGFpbnMgYW4gaW4tbGluZSBIVE1MIHRlbXBsYXRlIG9yIHRlbXBsYXRlIHJlZmVyZW5jZVxuICogdGhhdCBkZWZpbmVzIHRoZSBzdWJ0cmVlIHRvIGJlIHNlbGVjdGVkIGlmIHRoZSB2YWx1ZSBvZiB0aGUgbWF0Y2ggZXhwcmVzc2lvblxuICogbWF0Y2hlcyB0aGUgdmFsdWUgb2YgdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIEFzIG9mIEFuZ3VsYXIgdjE3IHRoZSBOZ1N3aXRjaCBkaXJlY3RpdmUgdXNlcyBzdHJpY3QgZXF1YWxpdHkgY29tcGFyaXNvbiAoYD09PWApIGluc3RlYWQgb2ZcbiAqIGxvb3NlIGVxdWFsaXR5IChgPT1gKSB0byBtYXRjaCBkaWZmZXJlbnQgY2FzZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSB7QGxpbmsgTmdTd2l0Y2h9XG4gKiBAc2VlIHtAbGluayBOZ1N3aXRjaERlZmF1bHR9XG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdTd2l0Y2hDYXNlXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoQ2FzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIF92aWV3OiBTd2l0Y2hWaWV3O1xuICAvKipcbiAgICogU3RvcmVzIHRoZSBIVE1MIHRlbXBsYXRlIHRvIGJlIHNlbGVjdGVkIG9uIG1hdGNoLlxuICAgKi9cbiAgQElucHV0KCkgbmdTd2l0Y2hDYXNlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZixcbiAgICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICBAT3B0aW9uYWwoKSBASG9zdCgpIHByaXZhdGUgbmdTd2l0Y2g6IE5nU3dpdGNoLFxuICApIHtcbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgIW5nU3dpdGNoKSB7XG4gICAgICB0aHJvd05nU3dpdGNoUHJvdmlkZXJOb3RGb3VuZEVycm9yKCduZ1N3aXRjaENhc2UnLCAnTmdTd2l0Y2hDYXNlJyk7XG4gICAgfVxuXG4gICAgbmdTd2l0Y2guX2FkZENhc2UoKTtcbiAgICB0aGlzLl92aWV3ID0gbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGNhc2UgbWF0Y2hpbmcuIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiAgICogQG5vZG9jXG4gICAqL1xuICBuZ0RvQ2hlY2soKSB7XG4gICAgdGhpcy5fdmlldy5lbmZvcmNlU3RhdGUodGhpcy5uZ1N3aXRjaC5fbWF0Y2hDYXNlKHRoaXMubmdTd2l0Y2hDYXNlKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ3JlYXRlcyBhIHZpZXcgdGhhdCBpcyByZW5kZXJlZCB3aGVuIG5vIGBOZ1N3aXRjaENhc2VgIGV4cHJlc3Npb25zXG4gKiBtYXRjaCB0aGUgYE5nU3dpdGNoYCBleHByZXNzaW9uLlxuICogVGhpcyBzdGF0ZW1lbnQgc2hvdWxkIGJlIHRoZSBmaW5hbCBjYXNlIGluIGFuIGBOZ1N3aXRjaGAuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSB7QGxpbmsgTmdTd2l0Y2h9XG4gKiBAc2VlIHtAbGluayBOZ1N3aXRjaENhc2V9XG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsXG4gICAgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgQE9wdGlvbmFsKCkgQEhvc3QoKSBuZ1N3aXRjaDogTmdTd2l0Y2gsXG4gICkge1xuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiAhbmdTd2l0Y2gpIHtcbiAgICAgIHRocm93TmdTd2l0Y2hQcm92aWRlck5vdEZvdW5kRXJyb3IoJ25nU3dpdGNoRGVmYXVsdCcsICdOZ1N3aXRjaERlZmF1bHQnKTtcbiAgICB9XG5cbiAgICBuZ1N3aXRjaC5fYWRkRGVmYXVsdChuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZikpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRocm93TmdTd2l0Y2hQcm92aWRlck5vdEZvdW5kRXJyb3IoYXR0ck5hbWU6IHN0cmluZywgZGlyZWN0aXZlTmFtZTogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgIFJ1bnRpbWVFcnJvckNvZGUuUEFSRU5UX05HX1NXSVRDSF9OT1RfRk9VTkQsXG4gICAgYEFuIGVsZW1lbnQgd2l0aCB0aGUgXCIke2F0dHJOYW1lfVwiIGF0dHJpYnV0ZSBgICtcbiAgICAgIGAobWF0Y2hpbmcgdGhlIFwiJHtkaXJlY3RpdmVOYW1lfVwiIGRpcmVjdGl2ZSkgbXVzdCBiZSBsb2NhdGVkIGluc2lkZSBhbiBlbGVtZW50IHdpdGggdGhlIFwibmdTd2l0Y2hcIiBhdHRyaWJ1dGUgYCArXG4gICAgICBgKG1hdGNoaW5nIFwiTmdTd2l0Y2hcIiBkaXJlY3RpdmUpYCxcbiAgKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5VmFsdWUodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IGAnJHt2YWx1ZX0nYCA6IFN0cmluZyh2YWx1ZSk7XG59XG4iXX0=