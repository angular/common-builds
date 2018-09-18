import * as i0 from "@angular/core";
import * as i1 from "./directives/ng_class";
import * as i2 from "./directives/ng_component_outlet";
import * as i3 from "./directives/ng_for_of";
import * as i4 from "./directives/ng_if";
import * as i5 from "./directives/ng_template_outlet";
import * as i6 from "./directives/ng_style";
import * as i7 from "./directives/ng_switch";
import * as i8 from "./directives/ng_plural";
import * as i9 from "./pipes/async_pipe";
import * as i10 from "./pipes/case_conversion_pipes";
import * as i11 from "./pipes/json_pipe";
import * as i12 from "./pipes/slice_pipe";
import * as i13 from "./pipes/number_pipe";
import * as i14 from "./pipes/date_pipe";
import * as i15 from "./pipes/i18n_plural_pipe";
import * as i16 from "./pipes/i18n_select_pipe";
import * as i17 from "./pipes/keyvalue_pipe";
import * as i18 from "./pipes/deprecated/number_pipe";
import * as i19 from "./pipes/deprecated/date_pipe";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { COMMON_DIRECTIVES } from './directives/index';
import { DEPRECATED_PLURAL_FN, NgLocaleLocalization, NgLocalization, getPluralCase } from './i18n/localization';
import { COMMON_DEPRECATED_I18N_PIPES } from './pipes/deprecated/index';
import { COMMON_PIPES } from './pipes/index';
/**
 * The module that includes all the basic Angular directives like {\@link NgIf}, {\@link NgForOf}, ...
 *
 *
 */
export class CommonModule {
}
CommonModule.decorators = [
    { type: NgModule, args: [{
                declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
                exports: [COMMON_DIRECTIVES, COMMON_PIPES],
                providers: [
                    { provide: NgLocalization, useClass: NgLocaleLocalization },
                ],
            },] },
];
CommonModule.ngModuleDef = i0.ɵdefineNgModule({ type: CommonModule, bootstrap: [], declarations: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe], imports: [], exports: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe] });
CommonModule.ngInjectorDef = i0.defineInjector({ factory: function CommonModule_Factory() { return new CommonModule(); }, providers: [
        { provide: NgLocalization, useClass: NgLocaleLocalization },
    ], imports: [[COMMON_DIRECTIVES, COMMON_PIPES]] });
/**
 * A module that contains the deprecated i18n pipes.
 *
 * @deprecated from v5
 */
export class DeprecatedI18NPipesModule {
}
DeprecatedI18NPipesModule.decorators = [
    { type: NgModule, args: [{
                declarations: [COMMON_DEPRECATED_I18N_PIPES],
                exports: [COMMON_DEPRECATED_I18N_PIPES],
                providers: [{ provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase }],
            },] },
];
DeprecatedI18NPipesModule.ngModuleDef = i0.ɵdefineNgModule({ type: DeprecatedI18NPipesModule, bootstrap: [], declarations: [i18.DeprecatedDecimalPipe, i18.DeprecatedPercentPipe, i18.DeprecatedCurrencyPipe, i19.DeprecatedDatePipe], imports: [], exports: [i18.DeprecatedDecimalPipe, i18.DeprecatedPercentPipe, i18.DeprecatedCurrencyPipe, i19.DeprecatedDatePipe] });
DeprecatedI18NPipesModule.ngInjectorDef = i0.defineInjector({ factory: function DeprecatedI18NPipesModule_Factory() { return new DeprecatedI18NPipesModule(); }, providers: [{ provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase }], imports: [[COMMON_DEPRECATED_I18N_PIPES]] });

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvY29tbW9uX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzlHLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7OztBQWlCM0MsTUFBTTs7O1lBUEwsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztnQkFDL0MsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO2dCQUMxQyxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztpQkFDMUQ7YUFDRjs7c0RBQ1ksWUFBWTt1R0FBWixZQUFZLGtCQUpaO1FBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztLQUMxRCxZQUhRLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDOzs7Ozs7QUFrQjVDLE1BQU07OztZQUxMLFFBQVEsU0FBQztnQkFDUixZQUFZLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztnQkFDNUMsT0FBTyxFQUFFLENBQUMsNEJBQTRCLENBQUM7Z0JBQ3ZDLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQzthQUN0RTs7bUVBQ1kseUJBQXlCO2lJQUF6Qix5QkFBeUIsa0JBRnpCLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDLFlBRDVELENBQUMsNEJBQTRCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDT01NT05fRElSRUNUSVZFU30gZnJvbSAnLi9kaXJlY3RpdmVzL2luZGV4JztcbmltcG9ydCB7REVQUkVDQVRFRF9QTFVSQUxfRk4sIE5nTG9jYWxlTG9jYWxpemF0aW9uLCBOZ0xvY2FsaXphdGlvbiwgZ2V0UGx1cmFsQ2FzZX0gZnJvbSAnLi9pMThuL2xvY2FsaXphdGlvbic7XG5pbXBvcnQge0NPTU1PTl9ERVBSRUNBVEVEX0kxOE5fUElQRVN9IGZyb20gJy4vcGlwZXMvZGVwcmVjYXRlZC9pbmRleCc7XG5pbXBvcnQge0NPTU1PTl9QSVBFU30gZnJvbSAnLi9waXBlcy9pbmRleCc7XG5cblxuLy8gTm90ZTogVGhpcyBkb2VzIG5vdCBjb250YWluIHRoZSBsb2NhdGlvbiBwcm92aWRlcnMsXG4vLyBhcyB0aGV5IG5lZWQgc29tZSBwbGF0Zm9ybSBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbnMgdG8gd29yay5cbi8qKlxuICogVGhlIG1vZHVsZSB0aGF0IGluY2x1ZGVzIGFsbCB0aGUgYmFzaWMgQW5ndWxhciBkaXJlY3RpdmVzIGxpa2Uge0BsaW5rIE5nSWZ9LCB7QGxpbmsgTmdGb3JPZn0sIC4uLlxuICpcbiAqXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW0NPTU1PTl9ESVJFQ1RJVkVTLCBDT01NT05fUElQRVNdLFxuICBleHBvcnRzOiBbQ09NTU9OX0RJUkVDVElWRVMsIENPTU1PTl9QSVBFU10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBOZ0xvY2FsaXphdGlvbiwgdXNlQ2xhc3M6IE5nTG9jYWxlTG9jYWxpemF0aW9ufSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ29tbW9uTW9kdWxlIHtcbn1cblxuLyoqXG4gKiBBIG1vZHVsZSB0aGF0IGNvbnRhaW5zIHRoZSBkZXByZWNhdGVkIGkxOG4gcGlwZXMuXG4gKlxuICogQGRlcHJlY2F0ZWQgZnJvbSB2NVxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtDT01NT05fREVQUkVDQVRFRF9JMThOX1BJUEVTXSxcbiAgZXhwb3J0czogW0NPTU1PTl9ERVBSRUNBVEVEX0kxOE5fUElQRVNdLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogREVQUkVDQVRFRF9QTFVSQUxfRk4sIHVzZVZhbHVlOiBnZXRQbHVyYWxDYXNlfV0sXG59KVxuZXhwb3J0IGNsYXNzIERlcHJlY2F0ZWRJMThOUGlwZXNNb2R1bGUge1xufVxuIl19