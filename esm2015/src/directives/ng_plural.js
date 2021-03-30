/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Attribute, Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { getPluralCategory, NgLocalization } from '../i18n/localization';
import { SwitchView } from './ng_switch';
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">there is nothing</ng-template>
 *   <ng-template ngPluralCase="=1">there is one</ng-template>
 *   <ng-template ngPluralCase="few">there are a few</ng-template>
 * </some-element>
 * ```
 *
 * @description
 *
 * Adds / removes DOM sub-trees based on a numeric value. Tailored for pluralization.
 *
 * Displays DOM sub-trees that match the switch expression value, or failing that, DOM sub-trees
 * that match the switch expression's pluralization category.
 *
 * To use this directive you must provide a container element that sets the `[ngPlural]` attribute
 * to a switch expression. Inner elements with a `[ngPluralCase]` will display based on their
 * expression:
 * - if `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 *   matches the switch expression exactly,
 * - otherwise, the view will be treated as a "category match", and will only display if exact
 *   value matches aren't found and the value maps to its category for the defined locale.
 *
 * See http://cldr.unicode.org/index/cldr-spec/plural-rules
 *
 * @publicApi
 */
let NgPlural = /** @class */ (() => {
    class NgPlural {
        constructor(_localization) {
            this._localization = _localization;
            this._caseViews = {};
        }
        set ngPlural(value) {
            this._switchValue = value;
            this._updateView();
        }
        addCase(value, switchView) {
            this._caseViews[value] = switchView;
        }
        _updateView() {
            this._clearViews();
            const cases = Object.keys(this._caseViews);
            const key = getPluralCategory(this._switchValue, cases, this._localization);
            this._activateView(this._caseViews[key]);
        }
        _clearViews() {
            if (this._activeView)
                this._activeView.destroy();
        }
        _activateView(view) {
            if (view) {
                this._activeView = view;
                this._activeView.create();
            }
        }
    }
    NgPlural.decorators = [
        { type: Directive, args: [{ selector: '[ngPlural]' },] }
    ];
    /** @nocollapse */
    NgPlural.ctorParameters = () => [
        { type: NgLocalization }
    ];
    NgPlural.propDecorators = {
        ngPlural: [{ type: Input }]
    };
    return NgPlural;
})();
export { NgPlural };
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that will be added/removed from the parent {@link NgPlural} when the
 * given expression matches the plural expression according to CLDR rules.
 *
 * @usageNotes
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">...</ng-template>
 *   <ng-template ngPluralCase="other">...</ng-template>
 * </some-element>
 *```
 *
 * See {@link NgPlural} for more details and example.
 *
 * @publicApi
 */
let NgPluralCase = /** @class */ (() => {
    class NgPluralCase {
        constructor(value, template, viewContainer, ngPlural) {
            this.value = value;
            const isANumber = !isNaN(Number(value));
            ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
        }
    }
    NgPluralCase.decorators = [
        { type: Directive, args: [{ selector: '[ngPluralCase]' },] }
    ];
    /** @nocollapse */
    NgPluralCase.ctorParameters = () => [
        { type: String, decorators: [{ type: Attribute, args: ['ngPluralCase',] }] },
        { type: TemplateRef },
        { type: ViewContainerRef },
        { type: NgPlural, decorators: [{ type: Host }] }
    ];
    return NgPluralCase;
})();
export { NgPluralCase };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUd2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0g7SUFBQSxNQUNhLFFBQVE7UUFPbkIsWUFBb0IsYUFBNkI7WUFBN0Isa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBRnpDLGVBQVUsR0FBOEIsRUFBRSxDQUFDO1FBRUMsQ0FBQztRQUVyRCxJQUNJLFFBQVEsQ0FBQyxLQUFhO1lBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQWEsRUFBRSxVQUFzQjtZQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQztRQUN0QyxDQUFDO1FBRU8sV0FBVztZQUNqQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFbkIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0MsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFTyxXQUFXO1lBQ2pCLElBQUksSUFBSSxDQUFDLFdBQVc7Z0JBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuRCxDQUFDO1FBRU8sYUFBYSxDQUFDLElBQWdCO1lBQ3BDLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzNCO1FBQ0gsQ0FBQzs7O2dCQXJDRixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFDOzs7O2dCQXBDUixjQUFjOzs7MkJBOEN0QyxLQUFLOztJQTRCUixlQUFDO0tBQUE7U0FyQ1ksUUFBUTtBQXVDckI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSDtJQUFBLE1BQ2EsWUFBWTtRQUN2QixZQUNzQyxLQUFhLEVBQUUsUUFBNkIsRUFDOUUsYUFBK0IsRUFBVSxRQUFrQjtZQUR6QixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBRWpELE1BQU0sU0FBUyxHQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2pELFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQzs7O2dCQVBGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQzs7Ozs2Q0FHaEMsU0FBUyxTQUFDLGNBQWM7Z0JBckdZLFdBQVc7Z0JBQUUsZ0JBQWdCO2dCQXNHZixRQUFRLHVCQUF6QixJQUFJOztJQUk1QyxtQkFBQztLQUFBO1NBUFksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0F0dHJpYnV0ZSwgRGlyZWN0aXZlLCBIb3N0LCBJbnB1dCwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2dldFBsdXJhbENhdGVnb3J5LCBOZ0xvY2FsaXphdGlvbn0gZnJvbSAnLi4vaTE4bi9sb2NhbGl6YXRpb24nO1xuXG5pbXBvcnQge1N3aXRjaFZpZXd9IGZyb20gJy4vbmdfc3dpdGNoJztcblxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1BsdXJhbF09XCJ2YWx1ZVwiPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj50aGVyZSBpcyBub3RoaW5nPC9uZy10ZW1wbGF0ZT5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIj0xXCI+dGhlcmUgaXMgb25lPC9uZy10ZW1wbGF0ZT5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cImZld1wiPnRoZXJlIGFyZSBhIGZldzwvbmctdGVtcGxhdGU+XG4gKiA8L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFkZHMgLyByZW1vdmVzIERPTSBzdWItdHJlZXMgYmFzZWQgb24gYSBudW1lcmljIHZhbHVlLiBUYWlsb3JlZCBmb3IgcGx1cmFsaXphdGlvbi5cbiAqXG4gKiBEaXNwbGF5cyBET00gc3ViLXRyZWVzIHRoYXQgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uIHZhbHVlLCBvciBmYWlsaW5nIHRoYXQsIERPTSBzdWItdHJlZXNcbiAqIHRoYXQgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uJ3MgcGx1cmFsaXphdGlvbiBjYXRlZ29yeS5cbiAqXG4gKiBUbyB1c2UgdGhpcyBkaXJlY3RpdmUgeW91IG11c3QgcHJvdmlkZSBhIGNvbnRhaW5lciBlbGVtZW50IHRoYXQgc2V0cyB0aGUgYFtuZ1BsdXJhbF1gIGF0dHJpYnV0ZVxuICogdG8gYSBzd2l0Y2ggZXhwcmVzc2lvbi4gSW5uZXIgZWxlbWVudHMgd2l0aCBhIGBbbmdQbHVyYWxDYXNlXWAgd2lsbCBkaXNwbGF5IGJhc2VkIG9uIHRoZWlyXG4gKiBleHByZXNzaW9uOlxuICogLSBpZiBgW25nUGx1cmFsQ2FzZV1gIGlzIHNldCB0byBhIHZhbHVlIHN0YXJ0aW5nIHdpdGggYD1gLCBpdCB3aWxsIG9ubHkgZGlzcGxheSBpZiB0aGUgdmFsdWVcbiAqICAgbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb24gZXhhY3RseSxcbiAqIC0gb3RoZXJ3aXNlLCB0aGUgdmlldyB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBcImNhdGVnb3J5IG1hdGNoXCIsIGFuZCB3aWxsIG9ubHkgZGlzcGxheSBpZiBleGFjdFxuICogICB2YWx1ZSBtYXRjaGVzIGFyZW4ndCBmb3VuZCBhbmQgdGhlIHZhbHVlIG1hcHMgdG8gaXRzIGNhdGVnb3J5IGZvciB0aGUgZGVmaW5lZCBsb2NhbGUuXG4gKlxuICogU2VlIGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL2luZGV4L2NsZHItc3BlYy9wbHVyYWwtcnVsZXNcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nUGx1cmFsXSd9KVxuZXhwb3J0IGNsYXNzIE5nUGx1cmFsIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3N3aXRjaFZhbHVlITogbnVtYmVyO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfYWN0aXZlVmlldyE6IFN3aXRjaFZpZXc7XG4gIHByaXZhdGUgX2Nhc2VWaWV3czoge1trOiBzdHJpbmddOiBTd2l0Y2hWaWV3fSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24pIHt9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nUGx1cmFsKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9zd2l0Y2hWYWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIGFkZENhc2UodmFsdWU6IHN0cmluZywgc3dpdGNoVmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIHRoaXMuX2Nhc2VWaWV3c1t2YWx1ZV0gPSBzd2l0Y2hWaWV3O1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGVhclZpZXdzKCk7XG5cbiAgICBjb25zdCBjYXNlcyA9IE9iamVjdC5rZXlzKHRoaXMuX2Nhc2VWaWV3cyk7XG4gICAgY29uc3Qga2V5ID0gZ2V0UGx1cmFsQ2F0ZWdvcnkodGhpcy5fc3dpdGNoVmFsdWUsIGNhc2VzLCB0aGlzLl9sb2NhbGl6YXRpb24pO1xuICAgIHRoaXMuX2FjdGl2YXRlVmlldyh0aGlzLl9jYXNlVmlld3Nba2V5XSk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhclZpZXdzKCkge1xuICAgIGlmICh0aGlzLl9hY3RpdmVWaWV3KSB0aGlzLl9hY3RpdmVWaWV3LmRlc3Ryb3koKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FjdGl2YXRlVmlldyh2aWV3OiBTd2l0Y2hWaWV3KSB7XG4gICAgaWYgKHZpZXcpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXcgPSB2aWV3O1xuICAgICAgdGhpcy5fYWN0aXZlVmlldy5jcmVhdGUoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ3JlYXRlcyBhIHZpZXcgdGhhdCB3aWxsIGJlIGFkZGVkL3JlbW92ZWQgZnJvbSB0aGUgcGFyZW50IHtAbGluayBOZ1BsdXJhbH0gd2hlbiB0aGVcbiAqIGdpdmVuIGV4cHJlc3Npb24gbWF0Y2hlcyB0aGUgcGx1cmFsIGV4cHJlc3Npb24gYWNjb3JkaW5nIHRvIENMRFIgcnVsZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdQbHVyYWxdPVwidmFsdWVcIj5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIj0wXCI+Li4uPC9uZy10ZW1wbGF0ZT5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIm90aGVyXCI+Li4uPC9uZy10ZW1wbGF0ZT5cbiAqIDwvc29tZS1lbGVtZW50PlxuICpgYGBcbiAqXG4gKiBTZWUge0BsaW5rIE5nUGx1cmFsfSBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdQbHVyYWxDYXNlXSd9KVxuZXhwb3J0IGNsYXNzIE5nUGx1cmFsQ2FzZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEF0dHJpYnV0ZSgnbmdQbHVyYWxDYXNlJykgcHVibGljIHZhbHVlOiBzdHJpbmcsIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgQEhvc3QoKSBuZ1BsdXJhbDogTmdQbHVyYWwpIHtcbiAgICBjb25zdCBpc0FOdW1iZXI6IGJvb2xlYW4gPSAhaXNOYU4oTnVtYmVyKHZhbHVlKSk7XG4gICAgbmdQbHVyYWwuYWRkQ2FzZShpc0FOdW1iZXIgPyBgPSR7dmFsdWV9YCA6IHZhbHVlLCBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZSkpO1xuICB9XG59XG4iXX0=