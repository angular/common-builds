/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Attribute, Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgLocalization, getPluralCategory } from '../i18n/localization';
import { SwitchView } from './ng_switch';
import * as i0 from "@angular/core";
import * as i1 from "../i18n/localization";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">there is nothing</ng-template>
 *   <ng-template ngPluralCase="=1">there is one</ng-template>
 *   <ng-template ngPluralCase="few">there are a few</ng-template>
 * </some-element>
 * ```
 *
 * \@description
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
 * \@publicApi
 */
export class NgPlural {
    /**
     * @param {?} _localization
     */
    constructor(_localization) {
        this._localization = _localization;
        this._caseViews = {};
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set ngPlural(value) {
        this._switchValue = value;
        this._updateView();
    }
    /**
     * @param {?} value
     * @param {?} switchView
     * @return {?}
     */
    addCase(value, switchView) { this._caseViews[value] = switchView; }
    /**
     * @private
     * @return {?}
     */
    _updateView() {
        this._clearViews();
        /** @type {?} */
        const cases = Object.keys(this._caseViews);
        /** @type {?} */
        const key = getPluralCategory(this._switchValue, cases, this._localization);
        this._activateView(this._caseViews[key]);
    }
    /**
     * @private
     * @return {?}
     */
    _clearViews() {
        if (this._activeView)
            this._activeView.destroy();
    }
    /**
     * @private
     * @param {?} view
     * @return {?}
     */
    _activateView(view) {
        if (view) {
            this._activeView = view;
            this._activeView.create();
        }
    }
}
NgPlural.decorators = [
    { type: Directive, args: [{ selector: '[ngPlural]' },] },
];
/** @nocollapse */
NgPlural.ctorParameters = () => [
    { type: NgLocalization }
];
NgPlural.propDecorators = {
    ngPlural: [{ type: Input }]
};
/** @nocollapse */ NgPlural.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgPlural, selectors: [["", "ngPlural", ""]], factory: function NgPlural_Factory(t) { return new (t || NgPlural)(i0.ɵɵdirectiveInject(i1.NgLocalization)); }, inputs: { ngPlural: "ngPlural" } });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgPlural, [{
        type: Directive,
        args: [{ selector: '[ngPlural]' }]
    }], function () { return [{ type: i1.NgLocalization }]; }, { ngPlural: [{
            type: Input
        }] });
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgPlural.prototype._switchValue;
    /**
     * @type {?}
     * @private
     */
    NgPlural.prototype._activeView;
    /**
     * @type {?}
     * @private
     */
    NgPlural.prototype._caseViews;
    /**
     * @type {?}
     * @private
     */
    NgPlural.prototype._localization;
}
/**
 * \@ngModule CommonModule
 *
 * \@description
 *
 * Creates a view that will be added/removed from the parent {\@link NgPlural} when the
 * given expression matches the plural expression according to CLDR rules.
 *
 * \@usageNotes
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">...</ng-template>
 *   <ng-template ngPluralCase="other">...</ng-template>
 * </some-element>
 * ```
 *
 * See {\@link NgPlural} for more details and example.
 *
 * \@publicApi
 */
export class NgPluralCase {
    /**
     * @param {?} value
     * @param {?} template
     * @param {?} viewContainer
     * @param {?} ngPlural
     */
    constructor(value, template, viewContainer, ngPlural) {
        this.value = value;
        /** @type {?} */
        const isANumber = !isNaN(Number(value));
        ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
    }
}
NgPluralCase.decorators = [
    { type: Directive, args: [{ selector: '[ngPluralCase]' },] },
];
/** @nocollapse */
NgPluralCase.ctorParameters = () => [
    { type: String, decorators: [{ type: Attribute, args: ['ngPluralCase',] }] },
    { type: TemplateRef },
    { type: ViewContainerRef },
    { type: NgPlural, decorators: [{ type: Host }] }
];
/** @nocollapse */ NgPluralCase.ngDirectiveDef = i0.ɵɵdefineDirective({ type: NgPluralCase, selectors: [["", "ngPluralCase", ""]], factory: function NgPluralCase_Factory(t) { return new (t || NgPluralCase)(i0.ɵɵinjectAttribute('ngPluralCase'), i0.ɵɵdirectiveInject(i0.TemplateRef), i0.ɵɵdirectiveInject(i0.ViewContainerRef), i0.ɵɵdirectiveInject(NgPlural, 1)); } });
/*@__PURE__*/ i0.ɵsetClassMetadata(NgPluralCase, [{
        type: Directive,
        args: [{ selector: '[ngPluralCase]' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Attribute,
                args: ['ngPluralCase']
            }] }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: NgPlural, decorators: [{
                type: Host
            }] }]; }, null);
if (false) {
    /** @type {?} */
    NgPluralCase.prototype.value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFL0YsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXZFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUN2QyxNQUFNLE9BQU8sUUFBUTs7OztJQU9uQixZQUFvQixhQUE2QjtRQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFGekMsZUFBVSxHQUE4QixFQUFFLENBQUM7SUFFQyxDQUFDOzs7OztJQUVyRCxJQUNJLFFBQVEsQ0FBQyxLQUFhO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDOzs7Ozs7SUFFRCxPQUFPLENBQUMsS0FBYSxFQUFFLFVBQXNCLElBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDOzs7OztJQUVyRixXQUFXO1FBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7Y0FFYixLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDOztjQUNwQyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDOzs7OztJQUVPLFdBQVc7UUFDakIsSUFBSSxJQUFJLENBQUMsV0FBVztZQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkQsQ0FBQzs7Ozs7O0lBRU8sYUFBYSxDQUFDLElBQWdCO1FBQ3BDLElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUM7OztZQW5DRixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFDOzs7O1lBcEMzQixjQUFjOzs7dUJBOENuQixLQUFLOzt1REFUSyxRQUFRLDhGQUFSLFFBQVE7bUNBQVIsUUFBUTtjQURwQixTQUFTO2VBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFDOztrQkFVaEMsS0FBSzs7Ozs7OztJQVBOLGdDQUErQjs7Ozs7SUFFL0IsK0JBQWtDOzs7OztJQUNsQyw4QkFBbUQ7Ozs7O0lBRXZDLGlDQUFxQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1EbkQsTUFBTSxPQUFPLFlBQVk7Ozs7Ozs7SUFDdkIsWUFDc0MsS0FBYSxFQUFFLFFBQTZCLEVBQzlFLGFBQStCLEVBQVUsUUFBa0I7UUFEekIsVUFBSyxHQUFMLEtBQUssQ0FBUTs7Y0FFM0MsU0FBUyxHQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7OztZQVBGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQzs7Ozt5Q0FHaEMsU0FBUyxTQUFDLGNBQWM7WUFuR1ksV0FBVztZQUFFLGdCQUFnQjtZQW9HZixRQUFRLHVCQUF6QixJQUFJOzsyREFIL0IsWUFBWSxzR0FBWixZQUFZLHVCQUVSLGNBQWMseUdBQzBCLFFBQVE7bUNBSHBELFlBQVk7Y0FEeEIsU0FBUztlQUFDLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDOztzQkFHaEMsU0FBUzt1QkFBQyxjQUFjO21GQUMwQixRQUFRO3NCQUF6QixJQUFJOzs7O0lBRHRDLDZCQUErQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtOZ0xvY2FsaXphdGlvbiwgZ2V0UGx1cmFsQ2F0ZWdvcnl9IGZyb20gJy4uL2kxOG4vbG9jYWxpemF0aW9uJztcblxuaW1wb3J0IHtTd2l0Y2hWaWV3fSBmcm9tICcuL25nX3N3aXRjaCc7XG5cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPHNvbWUtZWxlbWVudCBbbmdQbHVyYWxdPVwidmFsdWVcIj5cbiAqICAgPG5nLXRlbXBsYXRlIG5nUGx1cmFsQ2FzZT1cIj0wXCI+dGhlcmUgaXMgbm90aGluZzwvbmctdGVtcGxhdGU+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MVwiPnRoZXJlIGlzIG9uZTwvbmctdGVtcGxhdGU+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJmZXdcIj50aGVyZSBhcmUgYSBmZXc8L25nLXRlbXBsYXRlPlxuICogPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIC8gcmVtb3ZlcyBET00gc3ViLXRyZWVzIGJhc2VkIG9uIGEgbnVtZXJpYyB2YWx1ZS4gVGFpbG9yZWQgZm9yIHBsdXJhbGl6YXRpb24uXG4gKlxuICogRGlzcGxheXMgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgb3IgZmFpbGluZyB0aGF0LCBET00gc3ViLXRyZWVzXG4gKiB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbidzIHBsdXJhbGl6YXRpb24gY2F0ZWdvcnkuXG4gKlxuICogVG8gdXNlIHRoaXMgZGlyZWN0aXZlIHlvdSBtdXN0IHByb3ZpZGUgYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHNldHMgdGhlIGBbbmdQbHVyYWxdYCBhdHRyaWJ1dGVcbiAqIHRvIGEgc3dpdGNoIGV4cHJlc3Npb24uIElubmVyIGVsZW1lbnRzIHdpdGggYSBgW25nUGx1cmFsQ2FzZV1gIHdpbGwgZGlzcGxheSBiYXNlZCBvbiB0aGVpclxuICogZXhwcmVzc2lvbjpcbiAqIC0gaWYgYFtuZ1BsdXJhbENhc2VdYCBpcyBzZXQgdG8gYSB2YWx1ZSBzdGFydGluZyB3aXRoIGA9YCwgaXQgd2lsbCBvbmx5IGRpc3BsYXkgaWYgdGhlIHZhbHVlXG4gKiAgIG1hdGNoZXMgdGhlIHN3aXRjaCBleHByZXNzaW9uIGV4YWN0bHksXG4gKiAtIG90aGVyd2lzZSwgdGhlIHZpZXcgd2lsbCBiZSB0cmVhdGVkIGFzIGEgXCJjYXRlZ29yeSBtYXRjaFwiLCBhbmQgd2lsbCBvbmx5IGRpc3BsYXkgaWYgZXhhY3RcbiAqICAgdmFsdWUgbWF0Y2hlcyBhcmVuJ3QgZm91bmQgYW5kIHRoZSB2YWx1ZSBtYXBzIHRvIGl0cyBjYXRlZ29yeSBmb3IgdGhlIGRlZmluZWQgbG9jYWxlLlxuICpcbiAqIFNlZSBodHRwOi8vY2xkci51bmljb2RlLm9yZy9pbmRleC9jbGRyLXNwZWMvcGx1cmFsLXJ1bGVzXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1BsdXJhbF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1BsdXJhbCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9zd2l0Y2hWYWx1ZSAhOiBudW1iZXI7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9hY3RpdmVWaWV3ICE6IFN3aXRjaFZpZXc7XG4gIHByaXZhdGUgX2Nhc2VWaWV3czoge1trOiBzdHJpbmddOiBTd2l0Y2hWaWV3fSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24pIHt9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nUGx1cmFsKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9zd2l0Y2hWYWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIGFkZENhc2UodmFsdWU6IHN0cmluZywgc3dpdGNoVmlldzogU3dpdGNoVmlldyk6IHZvaWQgeyB0aGlzLl9jYXNlVmlld3NbdmFsdWVdID0gc3dpdGNoVmlldzsgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJWaWV3cygpO1xuXG4gICAgY29uc3QgY2FzZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9jYXNlVmlld3MpO1xuICAgIGNvbnN0IGtleSA9IGdldFBsdXJhbENhdGVnb3J5KHRoaXMuX3N3aXRjaFZhbHVlLCBjYXNlcywgdGhpcy5fbG9jYWxpemF0aW9uKTtcbiAgICB0aGlzLl9hY3RpdmF0ZVZpZXcodGhpcy5fY2FzZVZpZXdzW2tleV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYXJWaWV3cygpIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlVmlldykgdGhpcy5fYWN0aXZlVmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIF9hY3RpdmF0ZVZpZXcodmlldzogU3dpdGNoVmlldykge1xuICAgIGlmICh2aWV3KSB7XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3ID0gdmlldztcbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXcuY3JlYXRlKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgd2lsbCBiZSBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIHBhcmVudCB7QGxpbmsgTmdQbHVyYWx9IHdoZW4gdGhlXG4gKiBnaXZlbiBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHBsdXJhbCBleHByZXNzaW9uIGFjY29yZGluZyB0byBDTERSIHJ1bGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MFwiPi4uLjwvbmctdGVtcGxhdGU+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJvdGhlclwiPi4uLjwvbmctdGVtcGxhdGU+XG4gKiA8L3NvbWUtZWxlbWVudD5cbiAqYGBgXG4gKlxuICogU2VlIHtAbGluayBOZ1BsdXJhbH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nUGx1cmFsQ2FzZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ1BsdXJhbENhc2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBBdHRyaWJ1dGUoJ25nUGx1cmFsQ2FzZScpIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIEBIb3N0KCkgbmdQbHVyYWw6IE5nUGx1cmFsKSB7XG4gICAgY29uc3QgaXNBTnVtYmVyOiBib29sZWFuID0gIWlzTmFOKE51bWJlcih2YWx1ZSkpO1xuICAgIG5nUGx1cmFsLmFkZENhc2UoaXNBTnVtYmVyID8gYD0ke3ZhbHVlfWAgOiB2YWx1ZSwgbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGUpKTtcbiAgfVxufVxuIl19