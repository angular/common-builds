import * as i0 from "@angular/core";
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
    SwitchView.prototype.create = function () {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    };
    SwitchView.prototype.destroy = function () {
        this._created = false;
        this._viewContainerRef.clear();
    };
    SwitchView.prototype.enforceState = function (created) {
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
/**
 * @ngModule CommonModule
 *
 * @usageNotes
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
 * @description
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
var NgSwitch = /** @class */ (function () {
    function NgSwitch() {
        this._defaultUsed = false;
        this._caseCount = 0;
        this._lastCaseCheckIndex = 0;
        this._lastCasesMatched = false;
    }
    Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
        set: function (newValue) {
            this._ngSwitch = newValue;
            if (this._caseCount === 0) {
                this._updateDefaultCases(true);
            }
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    NgSwitch.prototype._addCase = function () { return this._caseCount++; };
    /** @internal */
    NgSwitch.prototype._addDefault = function (view) {
        if (!this._defaultViews) {
            this._defaultViews = [];
        }
        this._defaultViews.push(view);
    };
    /** @internal */
    NgSwitch.prototype._matchCase = function (value) {
        var matched = value == this._ngSwitch;
        this._lastCasesMatched = this._lastCasesMatched || matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        return matched;
    };
    NgSwitch.prototype._updateDefaultCases = function (useDefault) {
        if (this._defaultViews && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (var i = 0; i < this._defaultViews.length; i++) {
                var defaultView = this._defaultViews[i];
                defaultView.enforceState(useDefault);
            }
        }
    };
    NgSwitch.ngDirectiveDef = i0.ɵdefineDirective({ type: NgSwitch, selectors: [["", "ngSwitch", ""]], factory: function NgSwitch_Factory() { return new NgSwitch(); }, inputs: { ngSwitch: "ngSwitch" }, features: [i0.ɵPublicFeature] });
    return NgSwitch;
}());
export { NgSwitch };
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * </container-element>
 *```
 * @description
 *
 * Creates a view that will be added/removed from the parent {@link NgSwitch} when the
 * given expression evaluate to respectively the same/different value as the switch
 * expression.
 *
 * Insert the sub-tree when the expression evaluates to the same value as the enclosing switch
 * expression.
 *
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 *
 *
 */
var NgSwitchCase = /** @class */ (function () {
    function NgSwitchCase(viewContainer, templateRef, ngSwitch) {
        this.ngSwitch = ngSwitch;
        ngSwitch._addCase();
        this._view = new SwitchView(viewContainer, templateRef);
    }
    NgSwitchCase.prototype.ngDoCheck = function () { this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase)); };
    NgSwitchCase.ngDirectiveDef = i0.ɵdefineDirective({ type: NgSwitchCase, selectors: [["", "ngSwitchCase", ""]], factory: function NgSwitchCase_Factory() { return new NgSwitchCase(i0.ɵinjectViewContainerRef(), i0.ɵinjectTemplateRef(), i0.ɵdirectiveInject(NgSwitch, 1)); }, inputs: { ngSwitchCase: "ngSwitchCase" }, features: [i0.ɵPublicFeature] });
    return NgSwitchCase;
}());
export { NgSwitchCase };
/**
 * @ngModule CommonModule
 * @usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-other-element *ngSwitchDefault>...</some-other-element>
 * </container-element>
 * ```
 *
 * @description
 *
 * Creates a view that is added to the parent {@link NgSwitch} when no case expressions
 * match the switch expression.
 *
 * Insert the sub-tree when no case expressions evaluate to the same value as the enclosing switch
 * expression.
 *
 * See {@link NgSwitch} for more details and example.
 *
 *
 */
var NgSwitchDefault = /** @class */ (function () {
    function NgSwitchDefault(viewContainer, templateRef, ngSwitch) {
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
    NgSwitchDefault.ngDirectiveDef = i0.ɵdefineDirective({ type: NgSwitchDefault, selectors: [["", "ngSwitchDefault", ""]], factory: function NgSwitchDefault_Factory() { return new NgSwitchDefault(i0.ɵinjectViewContainerRef(), i0.ɵinjectTemplateRef(), i0.ɵdirectiveInject(NgSwitch, 1)); }, features: [i0.ɵPublicFeature] });
    return NgSwitchDefault;
}());
export { NgSwitchDefault };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RjtJQUdFLG9CQUNZLGlCQUFtQyxFQUFVLFlBQWlDO1FBQTlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFIbEYsYUFBUSxHQUFHLEtBQUssQ0FBQztJQUdvRSxDQUFDO0lBRTlGLDJCQUFNLEdBQU47UUFDRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCw0QkFBTyxHQUFQO1FBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxpQ0FBWSxHQUFaLFVBQWEsT0FBZ0I7UUFDM0IsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUF2QkQsSUF1QkM7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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O0dBcUJHO0FBQ0g7SUFFRSx5QkFDSSxhQUErQixFQUFFLFdBQWdDLEVBQ3pELFFBQWtCO1FBQzVCLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxVQUFVLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztpRUFMVSxlQUFlLHFHQUFmLGVBQWUsNEVBR0osUUFBUTswQkFuTWhDO0NBc01DLEFBUEQsSUFPQztTQU5ZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBIb3N0LCBJbnB1dCwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgU3dpdGNoVmlldyB7XG4gIHByaXZhdGUgX2NyZWF0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+KSB7fVxuXG4gIGNyZWF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gdHJ1ZTtcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2NyZWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7XG4gIH1cblxuICBlbmZvcmNlU3RhdGUoY3JlYXRlZDogYm9vbGVhbikge1xuICAgIGlmIChjcmVhdGVkICYmICF0aGlzLl9jcmVhdGVkKSB7XG4gICAgICB0aGlzLmNyZWF0ZSgpO1xuICAgIH0gZWxzZSBpZiAoIWNyZWF0ZWQgJiYgdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqICAgICA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMlwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+Li4uPC9zb21lLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8bmctY29udGFpbmVyICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj5cbiAqICAgICAgICAgPCEtLSB1c2UgYSBuZy1jb250YWluZXIgdG8gZ3JvdXAgbXVsdGlwbGUgcm9vdCBub2RlcyAtLT5cbiAqICAgICAgICAgPGlubmVyLWVsZW1lbnQ+PC9pbm5lci1lbGVtZW50PlxuICogICAgICAgICA8aW5uZXItb3RoZXItZWxlbWVudD48L2lubmVyLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIC8gcmVtb3ZlcyBET00gc3ViLXRyZWVzIHdoZW4gdGhlIG5lc3QgbWF0Y2ggZXhwcmVzc2lvbnMgbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogYE5nU3dpdGNoYCBzdGFtcHMgb3V0IG5lc3RlZCB2aWV3cyB3aGVuIHRoZWlyIG1hdGNoIGV4cHJlc3Npb24gdmFsdWUgbWF0Y2hlcyB0aGUgdmFsdWUgb2YgdGhlXG4gKiBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBJbiBvdGhlciB3b3JkczpcbiAqIC0geW91IGRlZmluZSBhIGNvbnRhaW5lciBlbGVtZW50ICh3aGVyZSB5b3UgcGxhY2UgdGhlIGRpcmVjdGl2ZSB3aXRoIGEgc3dpdGNoIGV4cHJlc3Npb24gb24gdGhlXG4gKiBgW25nU3dpdGNoXT1cIi4uLlwiYCBhdHRyaWJ1dGUpXG4gKiAtIHlvdSBkZWZpbmUgaW5uZXIgdmlld3MgaW5zaWRlIHRoZSBgTmdTd2l0Y2hgIGFuZCBwbGFjZSBhIGAqbmdTd2l0Y2hDYXNlYCBhdHRyaWJ1dGUgb24gdGhlIHZpZXdcbiAqIHJvb3QgZWxlbWVudHMuXG4gKlxuICogRWxlbWVudHMgd2l0aGluIGBOZ1N3aXRjaGAgYnV0IG91dHNpZGUgb2YgYSBgTmdTd2l0Y2hDYXNlYCBvciBgTmdTd2l0Y2hEZWZhdWx0YCBkaXJlY3RpdmVzIHdpbGxcbiAqIGJlIHByZXNlcnZlZCBhdCB0aGUgbG9jYXRpb24uXG4gKlxuICogVGhlIGBuZ1N3aXRjaENhc2VgIGRpcmVjdGl2ZSBpbmZvcm1zIHRoZSBwYXJlbnQgYE5nU3dpdGNoYCBvZiB3aGljaCB2aWV3IHRvIGRpc3BsYXkgd2hlbiB0aGVcbiAqIGV4cHJlc3Npb24gaXMgZXZhbHVhdGVkLlxuICogV2hlbiBubyBtYXRjaGluZyBleHByZXNzaW9uIGlzIGZvdW5kIG9uIGEgYG5nU3dpdGNoQ2FzZWAgdmlldywgdGhlIGBuZ1N3aXRjaERlZmF1bHRgIHZpZXcgaXNcbiAqIHN0YW1wZWQgb3V0LlxuICpcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoXSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2RlZmF1bHRWaWV3cyAhOiBTd2l0Y2hWaWV3W107XG4gIHByaXZhdGUgX2RlZmF1bHRVc2VkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Nhc2VDb3VudCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfbmdTd2l0Y2g6IGFueTtcblxuICBASW5wdXQoKVxuICBzZXQgbmdTd2l0Y2gobmV3VmFsdWU6IGFueSkge1xuICAgIHRoaXMuX25nU3dpdGNoID0gbmV3VmFsdWU7XG4gICAgaWYgKHRoaXMuX2Nhc2VDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZENhc2UoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2Nhc2VDb3VudCsrOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkRGVmYXVsdCh2aWV3OiBTd2l0Y2hWaWV3KSB7XG4gICAgaWYgKCF0aGlzLl9kZWZhdWx0Vmlld3MpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRWaWV3cyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9kZWZhdWx0Vmlld3MucHVzaCh2aWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21hdGNoQ2FzZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgbWF0Y2hlZCA9IHZhbHVlID09IHRoaXMuX25nU3dpdGNoO1xuICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkIHx8IG1hdGNoZWQ7XG4gICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4Kys7XG4gICAgaWYgKHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9PT0gdGhpcy5fY2FzZUNvdW50KSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWZhdWx0Q2FzZXMoIXRoaXMuX2xhc3RDYXNlc01hdGNoZWQpO1xuICAgICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4ID0gMDtcbiAgICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZWQ7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVEZWZhdWx0Q2FzZXModXNlRGVmYXVsdDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl9kZWZhdWx0Vmlld3MgJiYgdXNlRGVmYXVsdCAhPT0gdGhpcy5fZGVmYXVsdFVzZWQpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRVc2VkID0gdXNlRGVmYXVsdDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZGVmYXVsdFZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWaWV3ID0gdGhpcy5fZGVmYXVsdFZpZXdzW2ldO1xuICAgICAgICBkZWZhdWx0Vmlldy5lbmZvcmNlU3RhdGUodXNlRGVmYXVsdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICpgYGBcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgd2lsbCBiZSBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIHBhcmVudCB7QGxpbmsgTmdTd2l0Y2h9IHdoZW4gdGhlXG4gKiBnaXZlbiBleHByZXNzaW9uIGV2YWx1YXRlIHRvIHJlc3BlY3RpdmVseSB0aGUgc2FtZS9kaWZmZXJlbnQgdmFsdWUgYXMgdGhlIHN3aXRjaFxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBJbnNlcnQgdGhlIHN1Yi10cmVlIHdoZW4gdGhlIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBlbmNsb3Npbmcgc3dpdGNoXG4gKiBleHByZXNzaW9uLlxuICpcbiAqIElmIG11bHRpcGxlIG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgYWxsIG9mIHRoZW0gYXJlIGRpc3BsYXllZC5cbiAqXG4gKiBTZWUge0BsaW5rIE5nU3dpdGNofSBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlLlxuICpcbiAqXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoQ2FzZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaENhc2UgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBfdmlldzogU3dpdGNoVmlldztcblxuICBASW5wdXQoKVxuICBuZ1N3aXRjaENhc2U6IGFueTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgQEhvc3QoKSBwcml2YXRlIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIG5nU3dpdGNoLl9hZGRDYXNlKCk7XG4gICAgdGhpcy5fdmlldyA9IG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKTtcbiAgfVxuXG4gIG5nRG9DaGVjaygpIHsgdGhpcy5fdmlldy5lbmZvcmNlU3RhdGUodGhpcy5uZ1N3aXRjaC5fbWF0Y2hDYXNlKHRoaXMubmdTd2l0Y2hDYXNlKSk7IH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICA8c29tZS1vdGhlci1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLW90aGVyLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ3JlYXRlcyBhIHZpZXcgdGhhdCBpcyBhZGRlZCB0byB0aGUgcGFyZW50IHtAbGluayBOZ1N3aXRjaH0gd2hlbiBubyBjYXNlIGV4cHJlc3Npb25zXG4gKiBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogSW5zZXJ0IHRoZSBzdWItdHJlZSB3aGVuIG5vIGNhc2UgZXhwcmVzc2lvbnMgZXZhbHVhdGUgdG8gdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGVuY2xvc2luZyBzd2l0Y2hcbiAqIGV4cHJlc3Npb24uXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaERlZmF1bHRdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hEZWZhdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgbmdTd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgbmdTd2l0Y2guX2FkZERlZmF1bHQobmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpKTtcbiAgfVxufVxuIl19