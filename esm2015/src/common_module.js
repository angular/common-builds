/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { NgModule } from '@angular/core';
import { COMMON_DIRECTIVES } from './directives/index';
import { NgLocaleLocalization, NgLocalization } from './i18n/localization';
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
/** @nocollapse */ CommonModule.ɵmod = i0.ɵɵdefineNgModule({ type: CommonModule });
/** @nocollapse */ CommonModule.ɵinj = i0.ɵɵdefineInjector({ factory: function CommonModule_Factory(t) { return new (t || CommonModule)(); }, providers: [
        { provide: NgLocalization, useClass: NgLocaleLocalization },
    ] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(CommonModule, { declarations: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe], exports: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe] }); })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvY29tbW9uX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QjNDLE1BQU0sT0FBTyxZQUFZOzs7WUFQeEIsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztnQkFDL0MsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO2dCQUMxQyxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztpQkFDMUQ7YUFDRjs7Z0RBQ1ksWUFBWTt1R0FBWixZQUFZLG1CQUpaO1FBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztLQUMxRDt3RkFFVSxZQUFZO21DQUFaLFlBQVk7Y0FQeEIsUUFBUTtlQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztnQkFDL0MsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO2dCQUMxQyxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztpQkFDMUQ7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NPTU1PTl9ESVJFQ1RJVkVTfSBmcm9tICcuL2RpcmVjdGl2ZXMvaW5kZXgnO1xuaW1wb3J0IHtOZ0xvY2FsZUxvY2FsaXphdGlvbiwgTmdMb2NhbGl6YXRpb259IGZyb20gJy4vaTE4bi9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHtDT01NT05fUElQRVN9IGZyb20gJy4vcGlwZXMvaW5kZXgnO1xuXG5cbi8vIE5vdGU6IFRoaXMgZG9lcyBub3QgY29udGFpbiB0aGUgbG9jYXRpb24gcHJvdmlkZXJzLFxuLy8gYXMgdGhleSBuZWVkIHNvbWUgcGxhdGZvcm0gc3BlY2lmaWMgaW1wbGVtZW50YXRpb25zIHRvIHdvcmsuXG4vKipcbiAqIEV4cG9ydHMgYWxsIHRoZSBiYXNpYyBBbmd1bGFyIGRpcmVjdGl2ZXMgYW5kIHBpcGVzLFxuICogc3VjaCBhcyBgTmdJZmAsIGBOZ0Zvck9mYCwgYERlY2ltYWxQaXBlYCwgYW5kIHNvIG9uLlxuICogUmUtZXhwb3J0ZWQgYnkgYEJyb3dzZXJNb2R1bGVgLCB3aGljaCBpcyBpbmNsdWRlZCBhdXRvbWF0aWNhbGx5IGluIHRoZSByb290XG4gKiBgQXBwTW9kdWxlYCB3aGVuIHlvdSBjcmVhdGUgYSBuZXcgYXBwIHdpdGggdGhlIENMSSBgbmV3YCBjb21tYW5kLlxuICpcbiAqICogVGhlIGBwcm92aWRlcnNgIG9wdGlvbnMgY29uZmlndXJlIHRoZSBOZ01vZHVsZSdzIGluamVjdG9yIHRvIHByb3ZpZGVcbiAqIGxvY2FsaXphdGlvbiBkZXBlbmRlbmNpZXMgdG8gbWVtYmVycy5cbiAqICogVGhlIGBleHBvcnRzYCBvcHRpb25zIG1ha2UgdGhlIGRlY2xhcmVkIGRpcmVjdGl2ZXMgYW5kIHBpcGVzIGF2YWlsYWJsZSBmb3IgaW1wb3J0XG4gKiBieSBvdGhlciBOZ01vZHVsZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtDT01NT05fRElSRUNUSVZFUywgQ09NTU9OX1BJUEVTXSxcbiAgZXhwb3J0czogW0NPTU1PTl9ESVJFQ1RJVkVTLCBDT01NT05fUElQRVNdLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTmdMb2NhbGl6YXRpb24sIHVzZUNsYXNzOiBOZ0xvY2FsZUxvY2FsaXphdGlvbn0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENvbW1vbk1vZHVsZSB7XG59XG4iXX0=