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
import * as i0 from "@angular/core";
import * as i1 from "../i18n/localization";
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
class NgPlural {
    constructor(_localization) {
        this._localization = _localization;
        this._caseViews = {};
    }
    set ngPlural(value) {
        this._updateView(value);
    }
    addCase(value, switchView) {
        this._caseViews[value] = switchView;
    }
    _updateView(switchValue) {
        this._clearViews();
        const cases = Object.keys(this._caseViews);
        const key = getPluralCategory(switchValue, cases, this._localization);
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
NgPlural.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-2312eb5", ngImport: i0, type: NgPlural, deps: [{ token: i1.NgLocalization }], target: i0.ɵɵFactoryTarget.Directive });
NgPlural.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-next.1+sha-2312eb5", type: NgPlural, isStandalone: true, selector: "[ngPlural]", inputs: { ngPlural: "ngPlural" }, ngImport: i0 });
export { NgPlural };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-2312eb5", ngImport: i0, type: NgPlural, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngPlural]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i1.NgLocalization }]; }, propDecorators: { ngPlural: [{
                type: Input
            }] } });
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
class NgPluralCase {
    constructor(value, template, viewContainer, ngPlural) {
        this.value = value;
        const isANumber = !isNaN(Number(value));
        ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
    }
}
NgPluralCase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-2312eb5", ngImport: i0, type: NgPluralCase, deps: [{ token: 'ngPluralCase', attribute: true }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: NgPlural, host: true }], target: i0.ɵɵFactoryTarget.Directive });
NgPluralCase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-next.1+sha-2312eb5", type: NgPluralCase, isStandalone: true, selector: "[ngPluralCase]", ngImport: i0 });
export { NgPluralCase };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-2312eb5", ngImport: i0, type: NgPluralCase, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngPluralCase]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Attribute,
                    args: ['ngPluralCase']
                }] }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: NgPlural, decorators: [{
                    type: Host
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7O0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSCxNQUlhLFFBQVE7SUFJbkIsWUFBb0IsYUFBNkI7UUFBN0Isa0JBQWEsR0FBYixhQUFhLENBQWdCO1FBRnpDLGVBQVUsR0FBOEIsRUFBRSxDQUFDO0lBRUMsQ0FBQztJQUVyRCxJQUNJLFFBQVEsQ0FBQyxLQUFhO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFhLEVBQUUsVUFBc0I7UUFDM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDdEMsQ0FBQztJQUVPLFdBQVcsQ0FBQyxXQUFtQjtRQUNyQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbkIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0MsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVPLFdBQVc7UUFDakIsSUFBSSxJQUFJLENBQUMsV0FBVztZQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUFnQjtRQUNwQyxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDOztnSEFoQ1UsUUFBUTtvR0FBUixRQUFRO1NBQVIsUUFBUTtzR0FBUixRQUFRO2tCQUpwQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxZQUFZO29CQUN0QixVQUFVLEVBQUUsSUFBSTtpQkFDakI7cUdBUUssUUFBUTtzQkFEWCxLQUFLOztBQTZCUjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILE1BSWEsWUFBWTtJQUN2QixZQUNzQyxLQUFhLEVBQUUsUUFBNkIsRUFDOUUsYUFBK0IsRUFBVSxRQUFrQjtRQUR6QixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBRWpELE1BQU0sU0FBUyxHQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pELFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQzs7b0hBTlUsWUFBWSxrQkFFUixjQUFjO3dHQUZsQixZQUFZO1NBQVosWUFBWTtzR0FBWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBR00sU0FBUzsyQkFBQyxjQUFjOzswQkFDUyxJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXR0cmlidXRlLCBEaXJlY3RpdmUsIEhvc3QsIElucHV0LCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Z2V0UGx1cmFsQ2F0ZWdvcnksIE5nTG9jYWxpemF0aW9ufSBmcm9tICcuLi9pMThuL2xvY2FsaXphdGlvbic7XG5cbmltcG9ydCB7U3dpdGNoVmlld30gZnJvbSAnLi9uZ19zd2l0Y2gnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1BsdXJhbF09XCJ2YWx1ZVwiPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj50aGVyZSBpcyBub3RoaW5nPC9uZy10ZW1wbGF0ZT5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIj0xXCI+dGhlcmUgaXMgb25lPC9uZy10ZW1wbGF0ZT5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cImZld1wiPnRoZXJlIGFyZSBhIGZldzwvbmctdGVtcGxhdGU+XG4gKiA8L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFkZHMgLyByZW1vdmVzIERPTSBzdWItdHJlZXMgYmFzZWQgb24gYSBudW1lcmljIHZhbHVlLiBUYWlsb3JlZCBmb3IgcGx1cmFsaXphdGlvbi5cbiAqXG4gKiBEaXNwbGF5cyBET00gc3ViLXRyZWVzIHRoYXQgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uIHZhbHVlLCBvciBmYWlsaW5nIHRoYXQsIERPTSBzdWItdHJlZXNcbiAqIHRoYXQgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uJ3MgcGx1cmFsaXphdGlvbiBjYXRlZ29yeS5cbiAqXG4gKiBUbyB1c2UgdGhpcyBkaXJlY3RpdmUgeW91IG11c3QgcHJvdmlkZSBhIGNvbnRhaW5lciBlbGVtZW50IHRoYXQgc2V0cyB0aGUgYFtuZ1BsdXJhbF1gIGF0dHJpYnV0ZVxuICogdG8gYSBzd2l0Y2ggZXhwcmVzc2lvbi4gSW5uZXIgZWxlbWVudHMgd2l0aCBhIGBbbmdQbHVyYWxDYXNlXWAgd2lsbCBkaXNwbGF5IGJhc2VkIG9uIHRoZWlyXG4gKiBleHByZXNzaW9uOlxuICogLSBpZiBgW25nUGx1cmFsQ2FzZV1gIGlzIHNldCB0byBhIHZhbHVlIHN0YXJ0aW5nIHdpdGggYD1gLCBpdCB3aWxsIG9ubHkgZGlzcGxheSBpZiB0aGUgdmFsdWVcbiAqICAgbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb24gZXhhY3RseSxcbiAqIC0gb3RoZXJ3aXNlLCB0aGUgdmlldyB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBcImNhdGVnb3J5IG1hdGNoXCIsIGFuZCB3aWxsIG9ubHkgZGlzcGxheSBpZiBleGFjdFxuICogICB2YWx1ZSBtYXRjaGVzIGFyZW4ndCBmb3VuZCBhbmQgdGhlIHZhbHVlIG1hcHMgdG8gaXRzIGNhdGVnb3J5IGZvciB0aGUgZGVmaW5lZCBsb2NhbGUuXG4gKlxuICogU2VlIGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL2luZGV4L2NsZHItc3BlYy9wbHVyYWwtcnVsZXNcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ1BsdXJhbF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ1BsdXJhbCB7XG4gIHByaXZhdGUgX2FjdGl2ZVZpZXc/OiBTd2l0Y2hWaWV3O1xuICBwcml2YXRlIF9jYXNlVmlld3M6IHtbazogc3RyaW5nXTogU3dpdGNoVmlld30gPSB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ1BsdXJhbCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fdXBkYXRlVmlldyh2YWx1ZSk7XG4gIH1cblxuICBhZGRDYXNlKHZhbHVlOiBzdHJpbmcsIHN3aXRjaFZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICB0aGlzLl9jYXNlVmlld3NbdmFsdWVdID0gc3dpdGNoVmlldztcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZpZXcoc3dpdGNoVmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2NsZWFyVmlld3MoKTtcblxuICAgIGNvbnN0IGNhc2VzID0gT2JqZWN0LmtleXModGhpcy5fY2FzZVZpZXdzKTtcbiAgICBjb25zdCBrZXkgPSBnZXRQbHVyYWxDYXRlZ29yeShzd2l0Y2hWYWx1ZSwgY2FzZXMsIHRoaXMuX2xvY2FsaXphdGlvbik7XG4gICAgdGhpcy5fYWN0aXZhdGVWaWV3KHRoaXMuX2Nhc2VWaWV3c1trZXldKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyVmlld3MoKSB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVZpZXcpIHRoaXMuX2FjdGl2ZVZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWN0aXZhdGVWaWV3KHZpZXc6IFN3aXRjaFZpZXcpIHtcbiAgICBpZiAodmlldykge1xuICAgICAgdGhpcy5fYWN0aXZlVmlldyA9IHZpZXc7XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3LmNyZWF0ZSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgdmlldyB0aGF0IHdpbGwgYmUgYWRkZWQvcmVtb3ZlZCBmcm9tIHRoZSBwYXJlbnQge0BsaW5rIE5nUGx1cmFsfSB3aGVuIHRoZVxuICogZ2l2ZW4gZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSBwbHVyYWwgZXhwcmVzc2lvbiBhY2NvcmRpbmcgdG8gQ0xEUiBydWxlcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1BsdXJhbF09XCJ2YWx1ZVwiPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj4uLi48L25nLXRlbXBsYXRlPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwib3RoZXJcIj4uLi48L25nLXRlbXBsYXRlPlxuICogPC9zb21lLWVsZW1lbnQ+XG4gKmBgYFxuICpcbiAqIFNlZSB7QGxpbmsgTmdQbHVyYWx9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdQbHVyYWxDYXNlXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nUGx1cmFsQ2FzZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEF0dHJpYnV0ZSgnbmdQbHVyYWxDYXNlJykgcHVibGljIHZhbHVlOiBzdHJpbmcsIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgQEhvc3QoKSBuZ1BsdXJhbDogTmdQbHVyYWwpIHtcbiAgICBjb25zdCBpc0FOdW1iZXI6IGJvb2xlYW4gPSAhaXNOYU4oTnVtYmVyKHZhbHVlKSk7XG4gICAgbmdQbHVyYWwuYWRkQ2FzZShpc0FOdW1iZXIgPyBgPSR7dmFsdWV9YCA6IHZhbHVlLCBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZSkpO1xuICB9XG59XG4iXX0=