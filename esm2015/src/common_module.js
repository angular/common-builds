/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
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
/** @nocollapse */ CommonModule.ngModuleDef = i0.ɵdefineNgModule({ type: CommonModule });
/** @nocollapse */ CommonModule.ngInjectorDef = i0.defineInjector({ factory: function CommonModule_Factory(t) { return new (t || CommonModule)(); }, providers: [
        { provide: NgLocalization, useClass: NgLocaleLocalization },
    ] });
/*@__PURE__*/ i0.ɵsetNgModuleScope(CommonModule, { declarations: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe], exports: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe] });
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
/** @nocollapse */ DeprecatedI18NPipesModule.ngModuleDef = i0.ɵdefineNgModule({ type: DeprecatedI18NPipesModule });
/** @nocollapse */ DeprecatedI18NPipesModule.ngInjectorDef = i0.defineInjector({ factory: function DeprecatedI18NPipesModule_Factory(t) { return new (t || DeprecatedI18NPipesModule)(); }, providers: [{ provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase }] });
/*@__PURE__*/ i0.ɵsetNgModuleScope(DeprecatedI18NPipesModule, { declarations: [i18.DeprecatedDecimalPipe, i18.DeprecatedPercentPipe, i18.DeprecatedCurrencyPipe, i19.DeprecatedDatePipe], exports: [i18.DeprecatedDecimalPipe, i18.DeprecatedPercentPipe, i18.DeprecatedCurrencyPipe, i19.DeprecatedDatePipe] });
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedI18NPipesModule, [{
        type: NgModule,
        args: [{
                declarations: [COMMON_DEPRECATED_I18N_PIPES],
                exports: [COMMON_DEPRECATED_I18N_PIPES],
                providers: [{ provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase }],
            }]
    }], null, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvY29tbW9uX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzlHLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QjNDLE1BQU0sT0FBTyxZQUFZOzs7WUFQeEIsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztnQkFDL0MsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO2dCQUMxQyxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztpQkFDMUQ7YUFDRjs7c0RBQ1ksWUFBWTs4R0FBWixZQUFZLG1CQUpaO1FBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztLQUMxRDttQ0FFVSxZQUFZO21DQUFaLFlBQVk7Y0FQeEIsUUFBUTtlQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztnQkFDL0MsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO2dCQUMxQyxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztpQkFDMUQ7YUFDRjs7Ozs7Ozs7QUFlRCxNQUFNLE9BQU8seUJBQXlCOzs7WUFMckMsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLDRCQUE0QixDQUFDO2dCQUM1QyxPQUFPLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztnQkFDdkMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDO2FBQ3RFOzttRUFDWSx5QkFBeUI7d0lBQXpCLHlCQUF5QixtQkFGekIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7bUNBRTFELHlCQUF5QjttQ0FBekIseUJBQXlCO2NBTHJDLFFBQVE7ZUFBQztnQkFDUixZQUFZLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztnQkFDNUMsT0FBTyxFQUFFLENBQUMsNEJBQTRCLENBQUM7Z0JBQ3ZDLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQzthQUN0RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NPTU1PTl9ESVJFQ1RJVkVTfSBmcm9tICcuL2RpcmVjdGl2ZXMvaW5kZXgnO1xuaW1wb3J0IHtERVBSRUNBVEVEX1BMVVJBTF9GTiwgTmdMb2NhbGVMb2NhbGl6YXRpb24sIE5nTG9jYWxpemF0aW9uLCBnZXRQbHVyYWxDYXNlfSBmcm9tICcuL2kxOG4vbG9jYWxpemF0aW9uJztcbmltcG9ydCB7Q09NTU9OX0RFUFJFQ0FURURfSTE4Tl9QSVBFU30gZnJvbSAnLi9waXBlcy9kZXByZWNhdGVkL2luZGV4JztcbmltcG9ydCB7Q09NTU9OX1BJUEVTfSBmcm9tICcuL3BpcGVzL2luZGV4JztcblxuXG4vLyBOb3RlOiBUaGlzIGRvZXMgbm90IGNvbnRhaW4gdGhlIGxvY2F0aW9uIHByb3ZpZGVycyxcbi8vIGFzIHRoZXkgbmVlZCBzb21lIHBsYXRmb3JtIHNwZWNpZmljIGltcGxlbWVudGF0aW9ucyB0byB3b3JrLlxuLyoqXG4gKiBFeHBvcnRzIGFsbCB0aGUgYmFzaWMgQW5ndWxhciBkaXJlY3RpdmVzIGFuZCBwaXBlcyxcbiAqIHN1Y2ggYXMgYE5nSWZgLCBgTmdGb3JPZmAsIGBEZWNpbWFsUGlwZWAsIGFuZCBzbyBvbi5cbiAqIFJlLWV4cG9ydGVkIGJ5IGBCcm93c2VyTW9kdWxlYCwgd2hpY2ggaXMgaW5jbHVkZWQgYXV0b21hdGljYWxseSBpbiB0aGUgcm9vdFxuICogYEFwcE1vZHVsZWAgd2hlbiB5b3UgY3JlYXRlIGEgbmV3IGFwcCB3aXRoIHRoZSBDTEkgYG5ld2AgY29tbWFuZC5cbiAqXG4gKiAqIFRoZSBgcHJvdmlkZXJzYCBvcHRpb25zIGNvbmZpZ3VyZSB0aGUgTmdNb2R1bGUncyBpbmplY3RvciB0byBwcm92aWRlXG4gKiBsb2NhbGl6YXRpb24gZGVwZW5kZW5jaWVzIHRvIG1lbWJlcnMuXG4gKiAqIFRoZSBgZXhwb3J0c2Agb3B0aW9ucyBtYWtlIHRoZSBkZWNsYXJlZCBkaXJlY3RpdmVzIGFuZCBwaXBlcyBhdmFpbGFibGUgZm9yIGltcG9ydFxuICogYnkgb3RoZXIgTmdNb2R1bGVzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbQ09NTU9OX0RJUkVDVElWRVMsIENPTU1PTl9QSVBFU10sXG4gIGV4cG9ydHM6IFtDT01NT05fRElSRUNUSVZFUywgQ09NTU9OX1BJUEVTXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IE5nTG9jYWxpemF0aW9uLCB1c2VDbGFzczogTmdMb2NhbGVMb2NhbGl6YXRpb259LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDb21tb25Nb2R1bGUge1xufVxuXG4vKipcbiAqIEEgbW9kdWxlIHRoYXQgY29udGFpbnMgdGhlIGRlcHJlY2F0ZWQgaTE4biBwaXBlcy5cbiAqXG4gKiBAZGVwcmVjYXRlZCBmcm9tIHY1XG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW0NPTU1PTl9ERVBSRUNBVEVEX0kxOE5fUElQRVNdLFxuICBleHBvcnRzOiBbQ09NTU9OX0RFUFJFQ0FURURfSTE4Tl9QSVBFU10sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBERVBSRUNBVEVEX1BMVVJBTF9GTiwgdXNlVmFsdWU6IGdldFBsdXJhbENhc2V9XSxcbn0pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZEkxOE5QaXBlc01vZHVsZSB7XG59XG4iXX0=