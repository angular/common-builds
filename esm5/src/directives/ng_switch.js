/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
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
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], NgSwitch.prototype, "ngSwitch", null);
    NgSwitch = tslib_1.__decorate([
        Directive({ selector: '[ngSwitch]' })
    ], NgSwitch);
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
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], NgSwitchCase.prototype, "ngSwitchCase", void 0);
    NgSwitchCase = tslib_1.__decorate([
        Directive({ selector: '[ngSwitchCase]' }),
        tslib_1.__param(2, Host()),
        tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
            NgSwitch])
    ], NgSwitchCase);
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
    NgSwitchDefault = tslib_1.__decorate([
        Directive({ selector: '[ngSwitchDefault]' }),
        tslib_1.__param(2, Host()),
        tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
            NgSwitch])
    ], NgSwitchDefault);
    return NgSwitchDefault;
}());
export { NgSwitchDefault };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RjtJQUdFLG9CQUNZLGlCQUFtQyxFQUFVLFlBQWlDO1FBQTlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFIbEYsYUFBUSxHQUFHLEtBQUssQ0FBQztJQUdvRSxDQUFDO0lBRTlGLDJCQUFNLEdBQU47UUFDRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCw0QkFBTyxHQUFQO1FBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxpQ0FBWSxHQUFaLFVBQWEsT0FBZ0I7UUFDM0IsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDO0lBQ0gsaUJBQUM7QUFB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LEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELGdDQUFTLEdBQVQsY0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFUckY7UUFEQyxLQUFLLEVBQUU7O3NEQUNVO0lBSlAsWUFBWTtRQUR4QixTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQztRQVNqQyxtQkFBQSxJQUFJLEVBQUUsQ0FBQTtpREFEUSxnQkFBZ0IsRUFBZSxXQUFXO1lBQy9CLFFBQVE7T0FSM0IsWUFBWSxDQWN4QjtJQUFELG1CQUFDO0NBQUEsQUFkRCxJQWNDO1NBZFksWUFBWTtBQWdCekI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUVIO0lBQ0UseUJBQ0ksYUFBK0IsRUFBRSxXQUFnQyxFQUN6RCxRQUFrQjtRQUM1QixRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFMVSxlQUFlO1FBRDNCLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBQyxDQUFDO1FBSXBDLG1CQUFBLElBQUksRUFBRSxDQUFBO2lEQURRLGdCQUFnQixFQUFlLFdBQVc7WUFDdkMsUUFBUTtPQUhuQixlQUFlLENBTTNCO0lBQUQsc0JBQUM7Q0FBQSxBQU5ELElBTUM7U0FOWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNsYXNzIFN3aXRjaFZpZXcge1xuICBwcml2YXRlIF9jcmVhdGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge31cblxuICBjcmVhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICB9XG5cbiAgZW5mb3JjZVN0YXRlKGNyZWF0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoY3JlYXRlZCAmJiAhdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9IGVsc2UgaWYgKCFjcmVhdGVkICYmIHRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzJcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+XG4gKiAgICAgICAgIDwhLS0gdXNlIGEgbmctY29udGFpbmVyIHRvIGdyb3VwIG11bHRpcGxlIHJvb3Qgbm9kZXMgLS0+XG4gKiAgICAgICAgIDxpbm5lci1lbGVtZW50PjwvaW5uZXItZWxlbWVudD5cbiAqICAgICAgICAgPGlubmVyLW90aGVyLWVsZW1lbnQ+PC9pbm5lci1vdGhlci1lbGVtZW50PlxuICogICAgICAgPC9uZy1jb250YWluZXI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyAvIHJlbW92ZXMgRE9NIHN1Yi10cmVlcyB3aGVuIHRoZSBuZXN0IG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoZXMgdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIGBOZ1N3aXRjaGAgc3RhbXBzIG91dCBuZXN0ZWQgdmlld3Mgd2hlbiB0aGVpciBtYXRjaCBleHByZXNzaW9uIHZhbHVlIG1hdGNoZXMgdGhlIHZhbHVlIG9mIHRoZVxuICogc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogSW4gb3RoZXIgd29yZHM6XG4gKiAtIHlvdSBkZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCAod2hlcmUgeW91IHBsYWNlIHRoZSBkaXJlY3RpdmUgd2l0aCBhIHN3aXRjaCBleHByZXNzaW9uIG9uIHRoZVxuICogYFtuZ1N3aXRjaF09XCIuLi5cImAgYXR0cmlidXRlKVxuICogLSB5b3UgZGVmaW5lIGlubmVyIHZpZXdzIGluc2lkZSB0aGUgYE5nU3dpdGNoYCBhbmQgcGxhY2UgYSBgKm5nU3dpdGNoQ2FzZWAgYXR0cmlidXRlIG9uIHRoZSB2aWV3XG4gKiByb290IGVsZW1lbnRzLlxuICpcbiAqIEVsZW1lbnRzIHdpdGhpbiBgTmdTd2l0Y2hgIGJ1dCBvdXRzaWRlIG9mIGEgYE5nU3dpdGNoQ2FzZWAgb3IgYE5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlcyB3aWxsXG4gKiBiZSBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uLlxuICpcbiAqIFRoZSBgbmdTd2l0Y2hDYXNlYCBkaXJlY3RpdmUgaW5mb3JtcyB0aGUgcGFyZW50IGBOZ1N3aXRjaGAgb2Ygd2hpY2ggdmlldyB0byBkaXNwbGF5IHdoZW4gdGhlXG4gKiBleHByZXNzaW9uIGlzIGV2YWx1YXRlZC5cbiAqIFdoZW4gbm8gbWF0Y2hpbmcgZXhwcmVzc2lvbiBpcyBmb3VuZCBvbiBhIGBuZ1N3aXRjaENhc2VgIHZpZXcsIHRoZSBgbmdTd2l0Y2hEZWZhdWx0YCB2aWV3IGlzXG4gKiBzdGFtcGVkIG91dC5cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaCB7XG4gIHByaXZhdGUgX2RlZmF1bHRWaWV3czogU3dpdGNoVmlld1tdO1xuICBwcml2YXRlIF9kZWZhdWx0VXNlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9jYXNlQ291bnQgPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZUNoZWNrSW5kZXggPSAwO1xuICBwcml2YXRlIF9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX25nU3dpdGNoOiBhbnk7XG5cbiAgQElucHV0KClcbiAgc2V0IG5nU3dpdGNoKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9uZ1N3aXRjaCA9IG5ld1ZhbHVlO1xuICAgIGlmICh0aGlzLl9jYXNlQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURlZmF1bHRDYXNlcyh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRDYXNlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9jYXNlQ291bnQrKzsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZERlZmF1bHQodmlldzogU3dpdGNoVmlldykge1xuICAgIGlmICghdGhpcy5fZGVmYXVsdFZpZXdzKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0Vmlld3MgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fZGVmYXVsdFZpZXdzLnB1c2godmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaENhc2UodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1hdGNoZWQgPSB2YWx1ZSA9PSB0aGlzLl9uZ1N3aXRjaDtcbiAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCB8fCBtYXRjaGVkO1xuICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCsrO1xuICAgIGlmICh0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXggPT09IHRoaXMuX2Nhc2VDb3VudCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKCF0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkKTtcbiAgICAgIHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gICAgICB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRGVmYXVsdENhc2VzKHVzZURlZmF1bHQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fZGVmYXVsdFZpZXdzICYmIHVzZURlZmF1bHQgIT09IHRoaXMuX2RlZmF1bHRVc2VkKSB7XG4gICAgICB0aGlzLl9kZWZhdWx0VXNlZCA9IHVzZURlZmF1bHQ7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2RlZmF1bHRWaWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBkZWZhdWx0VmlldyA9IHRoaXMuX2RlZmF1bHRWaWV3c1tpXTtcbiAgICAgICAgZGVmYXVsdFZpZXcuZW5mb3JjZVN0YXRlKHVzZURlZmF1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqYGBgXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgdmlldyB0aGF0IHdpbGwgYmUgYWRkZWQvcmVtb3ZlZCBmcm9tIHRoZSBwYXJlbnQge0BsaW5rIE5nU3dpdGNofSB3aGVuIHRoZVxuICogZ2l2ZW4gZXhwcmVzc2lvbiBldmFsdWF0ZSB0byByZXNwZWN0aXZlbHkgdGhlIHNhbWUvZGlmZmVyZW50IHZhbHVlIGFzIHRoZSBzd2l0Y2hcbiAqIGV4cHJlc3Npb24uXG4gKlxuICogSW5zZXJ0IHRoZSBzdWItdHJlZSB3aGVuIHRoZSBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgZW5jbG9zaW5nIHN3aXRjaFxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBJZiBtdWx0aXBsZSBtYXRjaCBleHByZXNzaW9ucyBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIGFsbCBvZiB0aGVtIGFyZSBkaXNwbGF5ZWQuXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqXG4gKlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaENhc2VdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hDYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIHByaXZhdGUgX3ZpZXc6IFN3aXRjaFZpZXc7XG5cbiAgQElucHV0KClcbiAgbmdTd2l0Y2hDYXNlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgcHJpdmF0ZSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBuZ1N3aXRjaC5fYWRkQ2FzZSgpO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX3ZpZXcuZW5mb3JjZVN0YXRlKHRoaXMubmdTd2l0Y2guX21hdGNoQ2FzZSh0aGlzLm5nU3dpdGNoQ2FzZSkpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgaXMgYWRkZWQgdG8gdGhlIHBhcmVudCB7QGxpbmsgTmdTd2l0Y2h9IHdoZW4gbm8gY2FzZSBleHByZXNzaW9uc1xuICogbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIEluc2VydCB0aGUgc3ViLXRyZWUgd2hlbiBubyBjYXNlIGV4cHJlc3Npb25zIGV2YWx1YXRlIHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBlbmNsb3Npbmcgc3dpdGNoXG4gKiBleHByZXNzaW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIG5nU3dpdGNoLl9hZGREZWZhdWx0KG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKSk7XG4gIH1cbn1cbiJdfQ==