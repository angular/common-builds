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
export class NgPlural {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgPlural, deps: [{ token: i1.NgLocalization }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", type: NgPlural, isStandalone: true, selector: "[ngPlural]", inputs: { ngPlural: "ngPlural" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgPlural, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngPlural]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.NgLocalization }], propDecorators: { ngPlural: [{
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
export class NgPluralCase {
    constructor(value, template, viewContainer, ngPlural) {
        this.value = value;
        const isANumber = !isNaN(Number(value));
        ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgPluralCase, deps: [{ token: 'ngPluralCase', attribute: true }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: NgPlural, host: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", type: NgPluralCase, isStandalone: true, selector: "[ngPluralCase]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgPluralCase, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngPluralCase]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Attribute,
                    args: ['ngPluralCase']
                }] }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: NgPlural, decorators: [{
                    type: Host
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7O0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFLSCxNQUFNLE9BQU8sUUFBUTtJQUluQixZQUFvQixhQUE2QjtRQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFGekMsZUFBVSxHQUE4QixFQUFFLENBQUM7SUFFQyxDQUFDO0lBRXJELElBQ0ksUUFBUSxDQUFDLEtBQWE7UUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsT0FBTyxDQUFDLEtBQWEsRUFBRSxVQUFzQjtRQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQztJQUN0QyxDQUFDO0lBRU8sV0FBVyxDQUFDLFdBQW1CO1FBQ3JDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQyxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sV0FBVztRQUNqQixJQUFJLElBQUksQ0FBQyxXQUFXO1lBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRU8sYUFBYSxDQUFDLElBQWdCO1FBQ3BDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO3lIQWhDVSxRQUFROzZHQUFSLFFBQVE7O3NHQUFSLFFBQVE7a0JBSnBCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjttRkFRSyxRQUFRO3NCQURYLEtBQUs7O0FBNkJSOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBS0gsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFDb0MsS0FBYSxFQUMvQyxRQUE2QixFQUM3QixhQUErQixFQUN2QixRQUFrQjtRQUhRLFVBQUssR0FBTCxLQUFLLENBQVE7UUFLL0MsTUFBTSxTQUFTLEdBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO3lIQVRVLFlBQVksa0JBRVYsY0FBYzs2R0FGaEIsWUFBWTs7c0dBQVosWUFBWTtrQkFKeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQUdJLFNBQVM7MkJBQUMsY0FBYzs7MEJBR3hCLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtnZXRQbHVyYWxDYXRlZ29yeSwgTmdMb2NhbGl6YXRpb259IGZyb20gJy4uL2kxOG4vbG9jYWxpemF0aW9uJztcblxuaW1wb3J0IHtTd2l0Y2hWaWV3fSBmcm9tICcuL25nX3N3aXRjaCc7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MFwiPnRoZXJlIGlzIG5vdGhpbmc8L25nLXRlbXBsYXRlPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTFcIj50aGVyZSBpcyBvbmU8L25nLXRlbXBsYXRlPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiZmV3XCI+dGhlcmUgYXJlIGEgZmV3PC9uZy10ZW1wbGF0ZT5cbiAqIDwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyAvIHJlbW92ZXMgRE9NIHN1Yi10cmVlcyBiYXNlZCBvbiBhIG51bWVyaWMgdmFsdWUuIFRhaWxvcmVkIGZvciBwbHVyYWxpemF0aW9uLlxuICpcbiAqIERpc3BsYXlzIERPTSBzdWItdHJlZXMgdGhhdCBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIG9yIGZhaWxpbmcgdGhhdCwgRE9NIHN1Yi10cmVlc1xuICogdGhhdCBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24ncyBwbHVyYWxpemF0aW9uIGNhdGVnb3J5LlxuICpcbiAqIFRvIHVzZSB0aGlzIGRpcmVjdGl2ZSB5b3UgbXVzdCBwcm92aWRlIGEgY29udGFpbmVyIGVsZW1lbnQgdGhhdCBzZXRzIHRoZSBgW25nUGx1cmFsXWAgYXR0cmlidXRlXG4gKiB0byBhIHN3aXRjaCBleHByZXNzaW9uLiBJbm5lciBlbGVtZW50cyB3aXRoIGEgYFtuZ1BsdXJhbENhc2VdYCB3aWxsIGRpc3BsYXkgYmFzZWQgb24gdGhlaXJcbiAqIGV4cHJlc3Npb246XG4gKiAtIGlmIGBbbmdQbHVyYWxDYXNlXWAgaXMgc2V0IHRvIGEgdmFsdWUgc3RhcnRpbmcgd2l0aCBgPWAsIGl0IHdpbGwgb25seSBkaXNwbGF5IGlmIHRoZSB2YWx1ZVxuICogICBtYXRjaGVzIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiBleGFjdGx5LFxuICogLSBvdGhlcndpc2UsIHRoZSB2aWV3IHdpbGwgYmUgdHJlYXRlZCBhcyBhIFwiY2F0ZWdvcnkgbWF0Y2hcIiwgYW5kIHdpbGwgb25seSBkaXNwbGF5IGlmIGV4YWN0XG4gKiAgIHZhbHVlIG1hdGNoZXMgYXJlbid0IGZvdW5kIGFuZCB0aGUgdmFsdWUgbWFwcyB0byBpdHMgY2F0ZWdvcnkgZm9yIHRoZSBkZWZpbmVkIGxvY2FsZS5cbiAqXG4gKiBTZWUgaHR0cDovL2NsZHIudW5pY29kZS5vcmcvaW5kZXgvY2xkci1zcGVjL3BsdXJhbC1ydWxlc1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nUGx1cmFsXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nUGx1cmFsIHtcbiAgcHJpdmF0ZSBfYWN0aXZlVmlldz86IFN3aXRjaFZpZXc7XG4gIHByaXZhdGUgX2Nhc2VWaWV3czoge1trOiBzdHJpbmddOiBTd2l0Y2hWaWV3fSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24pIHt9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nUGx1cmFsKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl91cGRhdGVWaWV3KHZhbHVlKTtcbiAgfVxuXG4gIGFkZENhc2UodmFsdWU6IHN0cmluZywgc3dpdGNoVmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIHRoaXMuX2Nhc2VWaWV3c1t2YWx1ZV0gPSBzd2l0Y2hWaWV3O1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVmlldyhzd2l0Y2hWYWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJWaWV3cygpO1xuXG4gICAgY29uc3QgY2FzZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9jYXNlVmlld3MpO1xuICAgIGNvbnN0IGtleSA9IGdldFBsdXJhbENhdGVnb3J5KHN3aXRjaFZhbHVlLCBjYXNlcywgdGhpcy5fbG9jYWxpemF0aW9uKTtcbiAgICB0aGlzLl9hY3RpdmF0ZVZpZXcodGhpcy5fY2FzZVZpZXdzW2tleV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYXJWaWV3cygpIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlVmlldykgdGhpcy5fYWN0aXZlVmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIF9hY3RpdmF0ZVZpZXcodmlldzogU3dpdGNoVmlldykge1xuICAgIGlmICh2aWV3KSB7XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3ID0gdmlldztcbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXcuY3JlYXRlKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgd2lsbCBiZSBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIHBhcmVudCB7QGxpbmsgTmdQbHVyYWx9IHdoZW4gdGhlXG4gKiBnaXZlbiBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHBsdXJhbCBleHByZXNzaW9uIGFjY29yZGluZyB0byBDTERSIHJ1bGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MFwiPi4uLjwvbmctdGVtcGxhdGU+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJvdGhlclwiPi4uLjwvbmctdGVtcGxhdGU+XG4gKiA8L3NvbWUtZWxlbWVudD5cbiAqYGBgXG4gKlxuICogU2VlIHtAbGluayBOZ1BsdXJhbH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ1BsdXJhbENhc2VdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdQbHVyYWxDYXNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgQEF0dHJpYnV0ZSgnbmdQbHVyYWxDYXNlJykgcHVibGljIHZhbHVlOiBzdHJpbmcsXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZixcbiAgICBASG9zdCgpIG5nUGx1cmFsOiBOZ1BsdXJhbCxcbiAgKSB7XG4gICAgY29uc3QgaXNBTnVtYmVyOiBib29sZWFuID0gIWlzTmFOKE51bWJlcih2YWx1ZSkpO1xuICAgIG5nUGx1cmFsLmFkZENhc2UoaXNBTnVtYmVyID8gYD0ke3ZhbHVlfWAgOiB2YWx1ZSwgbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGUpKTtcbiAgfVxufVxuIl19