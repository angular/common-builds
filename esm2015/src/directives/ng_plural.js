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
    NgPlural.ɵfac = function NgPlural_Factory(t) { return new (t || NgPlural)(i0.ɵɵdirectiveInject(i1.NgLocalization)); };
    NgPlural.ɵdir = i0.ɵɵdefineDirective({ type: NgPlural, selectors: [["", "ngPlural", ""]], inputs: { ngPlural: "ngPlural" } });
    return NgPlural;
})();
export { NgPlural };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgPlural, [{
        type: Directive,
        args: [{ selector: '[ngPlural]' }]
    }], function () { return [{ type: i1.NgLocalization }]; }, { ngPlural: [{
            type: Input
        }] }); })();
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
    NgPluralCase.ɵfac = function NgPluralCase_Factory(t) { return new (t || NgPluralCase)(i0.ɵɵinjectAttribute('ngPluralCase'), i0.ɵɵdirectiveInject(i0.TemplateRef), i0.ɵɵdirectiveInject(i0.ViewContainerRef), i0.ɵɵdirectiveInject(NgPlural, 1)); };
    NgPluralCase.ɵdir = i0.ɵɵdefineDirective({ type: NgPluralCase, selectors: [["", "ngPluralCase", ""]] });
    return NgPluralCase;
})();
export { NgPluralCase };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgPluralCase, [{
        type: Directive,
        args: [{ selector: '[ngPluralCase]' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Attribute,
                args: ['ngPluralCase']
            }] }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: NgPlural, decorators: [{
                type: Host
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7O0FBR3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUFBLE1BQ2EsUUFBUTtRQU9uQixZQUFvQixhQUE2QjtZQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFGekMsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFFQyxDQUFDO1FBRXJELElBQ0ksUUFBUSxDQUFDLEtBQWE7WUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBYSxFQUFFLFVBQXNCO1lBQzNDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBQ3RDLENBQUM7UUFFTyxXQUFXO1lBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVuQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQyxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVPLFdBQVc7WUFDakIsSUFBSSxJQUFJLENBQUMsV0FBVztnQkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25ELENBQUM7UUFFTyxhQUFhLENBQUMsSUFBZ0I7WUFDcEMsSUFBSSxJQUFJLEVBQUU7Z0JBQ1IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDM0I7UUFDSCxDQUFDOztvRUFwQ1UsUUFBUTtpREFBUixRQUFRO21CQS9DckI7S0FvRkM7U0FyQ1ksUUFBUTtrREFBUixRQUFRO2NBRHBCLFNBQVM7ZUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUM7O2tCQVVoQyxLQUFLOztBQThCUjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNIO0lBQUEsTUFDYSxZQUFZO1FBQ3ZCLFlBQ3NDLEtBQWEsRUFBRSxRQUE2QixFQUM5RSxhQUErQixFQUFVLFFBQWtCO1lBRHpCLFVBQUssR0FBTCxLQUFLLENBQVE7WUFFakQsTUFBTSxTQUFTLEdBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDakQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDOzs0RUFOVSxZQUFZLHVCQUVSLGNBQWMseUdBQzBCLFFBQVE7cURBSHBELFlBQVk7dUJBM0d6QjtLQWtIQztTQVBZLFlBQVk7a0RBQVosWUFBWTtjQUR4QixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUM7O3NCQUdoQyxTQUFTO3VCQUFDLGNBQWM7bUZBQzBCLFFBQVE7c0JBQXpCLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtnZXRQbHVyYWxDYXRlZ29yeSwgTmdMb2NhbGl6YXRpb259IGZyb20gJy4uL2kxOG4vbG9jYWxpemF0aW9uJztcblxuaW1wb3J0IHtTd2l0Y2hWaWV3fSBmcm9tICcuL25nX3N3aXRjaCc7XG5cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdQbHVyYWxdPVwidmFsdWVcIj5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIj0wXCI+dGhlcmUgaXMgbm90aGluZzwvbmctdGVtcGxhdGU+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MVwiPnRoZXJlIGlzIG9uZTwvbmctdGVtcGxhdGU+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJmZXdcIj50aGVyZSBhcmUgYSBmZXc8L25nLXRlbXBsYXRlPlxuICogPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIC8gcmVtb3ZlcyBET00gc3ViLXRyZWVzIGJhc2VkIG9uIGEgbnVtZXJpYyB2YWx1ZS4gVGFpbG9yZWQgZm9yIHBsdXJhbGl6YXRpb24uXG4gKlxuICogRGlzcGxheXMgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgb3IgZmFpbGluZyB0aGF0LCBET00gc3ViLXRyZWVzXG4gKiB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbidzIHBsdXJhbGl6YXRpb24gY2F0ZWdvcnkuXG4gKlxuICogVG8gdXNlIHRoaXMgZGlyZWN0aXZlIHlvdSBtdXN0IHByb3ZpZGUgYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHNldHMgdGhlIGBbbmdQbHVyYWxdYCBhdHRyaWJ1dGVcbiAqIHRvIGEgc3dpdGNoIGV4cHJlc3Npb24uIElubmVyIGVsZW1lbnRzIHdpdGggYSBgW25nUGx1cmFsQ2FzZV1gIHdpbGwgZGlzcGxheSBiYXNlZCBvbiB0aGVpclxuICogZXhwcmVzc2lvbjpcbiAqIC0gaWYgYFtuZ1BsdXJhbENhc2VdYCBpcyBzZXQgdG8gYSB2YWx1ZSBzdGFydGluZyB3aXRoIGA9YCwgaXQgd2lsbCBvbmx5IGRpc3BsYXkgaWYgdGhlIHZhbHVlXG4gKiAgIG1hdGNoZXMgdGhlIHN3aXRjaCBleHByZXNzaW9uIGV4YWN0bHksXG4gKiAtIG90aGVyd2lzZSwgdGhlIHZpZXcgd2lsbCBiZSB0cmVhdGVkIGFzIGEgXCJjYXRlZ29yeSBtYXRjaFwiLCBhbmQgd2lsbCBvbmx5IGRpc3BsYXkgaWYgZXhhY3RcbiAqICAgdmFsdWUgbWF0Y2hlcyBhcmVuJ3QgZm91bmQgYW5kIHRoZSB2YWx1ZSBtYXBzIHRvIGl0cyBjYXRlZ29yeSBmb3IgdGhlIGRlZmluZWQgbG9jYWxlLlxuICpcbiAqIFNlZSBodHRwOi8vY2xkci51bmljb2RlLm9yZy9pbmRleC9jbGRyLXNwZWMvcGx1cmFsLXJ1bGVzXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1BsdXJhbF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1BsdXJhbCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9zd2l0Y2hWYWx1ZSE6IG51bWJlcjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2FjdGl2ZVZpZXchOiBTd2l0Y2hWaWV3O1xuICBwcml2YXRlIF9jYXNlVmlld3M6IHtbazogc3RyaW5nXTogU3dpdGNoVmlld30gPSB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ1BsdXJhbCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc3dpdGNoVmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVWaWV3KCk7XG4gIH1cblxuICBhZGRDYXNlKHZhbHVlOiBzdHJpbmcsIHN3aXRjaFZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICB0aGlzLl9jYXNlVmlld3NbdmFsdWVdID0gc3dpdGNoVmlldztcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJWaWV3cygpO1xuXG4gICAgY29uc3QgY2FzZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9jYXNlVmlld3MpO1xuICAgIGNvbnN0IGtleSA9IGdldFBsdXJhbENhdGVnb3J5KHRoaXMuX3N3aXRjaFZhbHVlLCBjYXNlcywgdGhpcy5fbG9jYWxpemF0aW9uKTtcbiAgICB0aGlzLl9hY3RpdmF0ZVZpZXcodGhpcy5fY2FzZVZpZXdzW2tleV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYXJWaWV3cygpIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlVmlldykgdGhpcy5fYWN0aXZlVmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIF9hY3RpdmF0ZVZpZXcodmlldzogU3dpdGNoVmlldykge1xuICAgIGlmICh2aWV3KSB7XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3ID0gdmlldztcbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXcuY3JlYXRlKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgd2lsbCBiZSBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIHBhcmVudCB7QGxpbmsgTmdQbHVyYWx9IHdoZW4gdGhlXG4gKiBnaXZlbiBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHBsdXJhbCBleHByZXNzaW9uIGFjY29yZGluZyB0byBDTERSIHJ1bGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MFwiPi4uLjwvbmctdGVtcGxhdGU+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJvdGhlclwiPi4uLjwvbmctdGVtcGxhdGU+XG4gKiA8L3NvbWUtZWxlbWVudD5cbiAqYGBgXG4gKlxuICogU2VlIHtAbGluayBOZ1BsdXJhbH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nUGx1cmFsQ2FzZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ1BsdXJhbENhc2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBBdHRyaWJ1dGUoJ25nUGx1cmFsQ2FzZScpIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIEBIb3N0KCkgbmdQbHVyYWw6IE5nUGx1cmFsKSB7XG4gICAgY29uc3QgaXNBTnVtYmVyOiBib29sZWFuID0gIWlzTmFOKE51bWJlcih2YWx1ZSkpO1xuICAgIG5nUGx1cmFsLmFkZENhc2UoaXNBTnVtYmVyID8gYD0ke3ZhbHVlfWAgOiB2YWx1ZSwgbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGUpKTtcbiAgfVxufVxuIl19