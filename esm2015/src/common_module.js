import { NgModule } from '@angular/core';
import { COMMON_DIRECTIVES } from './directives/index';
import { DEPRECATED_PLURAL_FN, NgLocaleLocalization, NgLocalization, getPluralCase } from './i18n/localization';
import { COMMON_DEPRECATED_I18N_PIPES } from './pipes/deprecated/index';
import { COMMON_PIPES } from './pipes/index';
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
/**
 * Exports all the basic Angular directives and pipes,
 * such as `NgIf`, `NgForOf`, `DecimalPipe`, and so on.
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command.
 *
 * * The `providers` options configure the NgModule's injector to provide
 * localization dependencies to members.
 * * The `exports` options make the declared directives and pipes available for import
 * by other NgModules.
 *
 * \@publicApi
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
CommonModule.ngInjectorDef = i0.defineInjector({ factory: function CommonModule_Factory(t) { return new (t || CommonModule)(); }, providers: [
        { provide: NgLocalization, useClass: NgLocaleLocalization },
    ], imports: [[COMMON_DIRECTIVES, COMMON_PIPES]] });
/*@__PURE__*/ i0.ɵsetClassMetadata(CommonModule, [{
        type: NgModule,
        args: [{
                declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
                exports: [COMMON_DIRECTIVES, COMMON_PIPES],
                providers: [
                    { provide: NgLocalization, useClass: NgLocaleLocalization },
                ],
            }]
    }], null, null);
/**
 * A module that contains the deprecated i18n pipes.
 *
 * @deprecated from v5
 * \@publicApi
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
DeprecatedI18NPipesModule.ngInjectorDef = i0.defineInjector({ factory: function DeprecatedI18NPipesModule_Factory(t) { return new (t || DeprecatedI18NPipesModule)(); }, providers: [{ provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase }], imports: [[COMMON_DEPRECATED_I18N_PIPES]] });
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedI18NPipesModule, [{
        type: NgModule,
        args: [{
                declarations: [COMMON_DEPRECATED_I18N_PIPES],
                exports: [COMMON_DEPRECATED_I18N_PIPES],
                providers: [{ provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase }],
            }]
    }], null, null);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbW1vbi9zcmMvY29tbW9uX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDOUcsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDdEUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUIzQyxNQUFNLE9BQU8sWUFBWTs7O1lBUHhCLFFBQVEsU0FBQztnQkFDUixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7Z0JBQy9DLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztnQkFDMUMsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUM7aUJBQzFEO2FBQ0Y7O3NEQUNZLFlBQVk7OEdBQVosWUFBWSxtQkFKWjtRQUNULEVBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUM7S0FDMUQsWUFIUSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQzttQ0FLL0IsWUFBWTtjQVB4QixRQUFRO2VBQUM7Z0JBQ1IsWUFBWSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO2dCQUMvQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7Z0JBQzFDLFNBQVMsRUFBRTtvQkFDVCxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFDO2lCQUMxRDthQUNGOzs7Ozs7OztBQWVELE1BQU0sT0FBTyx5QkFBeUI7OztZQUxyQyxRQUFRLFNBQUM7Z0JBQ1IsWUFBWSxFQUFFLENBQUMsNEJBQTRCLENBQUM7Z0JBQzVDLE9BQU8sRUFBRSxDQUFDLDRCQUE0QixDQUFDO2dCQUN2QyxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7YUFDdEU7O21FQUNZLHlCQUF5Qjt3SUFBekIseUJBQXlCLG1CQUZ6QixDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQyxZQUQ1RCxDQUFDLDRCQUE0QixDQUFDO21DQUc1Qix5QkFBeUI7Y0FMckMsUUFBUTtlQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLDRCQUE0QixDQUFDO2dCQUM1QyxPQUFPLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztnQkFDdkMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDO2FBQ3RFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q09NTU9OX0RJUkVDVElWRVN9IGZyb20gJy4vZGlyZWN0aXZlcy9pbmRleCc7XG5pbXBvcnQge0RFUFJFQ0FURURfUExVUkFMX0ZOLCBOZ0xvY2FsZUxvY2FsaXphdGlvbiwgTmdMb2NhbGl6YXRpb24sIGdldFBsdXJhbENhc2V9IGZyb20gJy4vaTE4bi9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHtDT01NT05fREVQUkVDQVRFRF9JMThOX1BJUEVTfSBmcm9tICcuL3BpcGVzL2RlcHJlY2F0ZWQvaW5kZXgnO1xuaW1wb3J0IHtDT01NT05fUElQRVN9IGZyb20gJy4vcGlwZXMvaW5kZXgnO1xuXG5cbi8vIE5vdGU6IFRoaXMgZG9lcyBub3QgY29udGFpbiB0aGUgbG9jYXRpb24gcHJvdmlkZXJzLFxuLy8gYXMgdGhleSBuZWVkIHNvbWUgcGxhdGZvcm0gc3BlY2lmaWMgaW1wbGVtZW50YXRpb25zIHRvIHdvcmsuXG4vKipcbiAqIEV4cG9ydHMgYWxsIHRoZSBiYXNpYyBBbmd1bGFyIGRpcmVjdGl2ZXMgYW5kIHBpcGVzLFxuICogc3VjaCBhcyBgTmdJZmAsIGBOZ0Zvck9mYCwgYERlY2ltYWxQaXBlYCwgYW5kIHNvIG9uLlxuICogUmUtZXhwb3J0ZWQgYnkgYEJyb3dzZXJNb2R1bGVgLCB3aGljaCBpcyBpbmNsdWRlZCBhdXRvbWF0aWNhbGx5IGluIHRoZSByb290XG4gKiBgQXBwTW9kdWxlYCB3aGVuIHlvdSBjcmVhdGUgYSBuZXcgYXBwIHdpdGggdGhlIENMSSBgbmV3YCBjb21tYW5kLlxuICpcbiAqICogVGhlIGBwcm92aWRlcnNgIG9wdGlvbnMgY29uZmlndXJlIHRoZSBOZ01vZHVsZSdzIGluamVjdG9yIHRvIHByb3ZpZGVcbiAqIGxvY2FsaXphdGlvbiBkZXBlbmRlbmNpZXMgdG8gbWVtYmVycy5cbiAqICogVGhlIGBleHBvcnRzYCBvcHRpb25zIG1ha2UgdGhlIGRlY2xhcmVkIGRpcmVjdGl2ZXMgYW5kIHBpcGVzIGF2YWlsYWJsZSBmb3IgaW1wb3J0XG4gKiBieSBvdGhlciBOZ01vZHVsZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtDT01NT05fRElSRUNUSVZFUywgQ09NTU9OX1BJUEVTXSxcbiAgZXhwb3J0czogW0NPTU1PTl9ESVJFQ1RJVkVTLCBDT01NT05fUElQRVNdLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTmdMb2NhbGl6YXRpb24sIHVzZUNsYXNzOiBOZ0xvY2FsZUxvY2FsaXphdGlvbn0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENvbW1vbk1vZHVsZSB7XG59XG5cbi8qKlxuICogQSBtb2R1bGUgdGhhdCBjb250YWlucyB0aGUgZGVwcmVjYXRlZCBpMThuIHBpcGVzLlxuICpcbiAqIEBkZXByZWNhdGVkIGZyb20gdjVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbQ09NTU9OX0RFUFJFQ0FURURfSTE4Tl9QSVBFU10sXG4gIGV4cG9ydHM6IFtDT01NT05fREVQUkVDQVRFRF9JMThOX1BJUEVTXSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IERFUFJFQ0FURURfUExVUkFMX0ZOLCB1c2VWYWx1ZTogZ2V0UGx1cmFsQ2FzZX1dLFxufSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkSTE4TlBpcGVzTW9kdWxlIHtcbn1cbiJdfQ==