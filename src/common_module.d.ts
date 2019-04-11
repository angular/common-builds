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
 * @publicApi
 */
export declare class CommonModule {
    static ngModuleDef: i0.ɵɵNgModuleDefWithMeta<CommonModule, [typeof i1.NgClass, typeof i2.NgComponentOutlet, typeof i3.NgForOf, typeof i4.NgIf, typeof i5.NgTemplateOutlet, typeof i6.NgStyle, typeof i7.NgSwitch, typeof i7.NgSwitchCase, typeof i7.NgSwitchDefault, typeof i8.NgPlural, typeof i8.NgPluralCase, typeof i9.AsyncPipe, typeof i10.UpperCasePipe, typeof i10.LowerCasePipe, typeof i11.JsonPipe, typeof i12.SlicePipe, typeof i13.DecimalPipe, typeof i13.PercentPipe, typeof i10.TitleCasePipe, typeof i13.CurrencyPipe, typeof i14.DatePipe, typeof i15.I18nPluralPipe, typeof i16.I18nSelectPipe, typeof i17.KeyValuePipe], never, [typeof i1.NgClass, typeof i2.NgComponentOutlet, typeof i3.NgForOf, typeof i4.NgIf, typeof i5.NgTemplateOutlet, typeof i6.NgStyle, typeof i7.NgSwitch, typeof i7.NgSwitchCase, typeof i7.NgSwitchDefault, typeof i8.NgPlural, typeof i8.NgPluralCase, typeof i9.AsyncPipe, typeof i10.UpperCasePipe, typeof i10.LowerCasePipe, typeof i11.JsonPipe, typeof i12.SlicePipe, typeof i13.DecimalPipe, typeof i13.PercentPipe, typeof i10.TitleCasePipe, typeof i13.CurrencyPipe, typeof i14.DatePipe, typeof i15.I18nPluralPipe, typeof i16.I18nSelectPipe, typeof i17.KeyValuePipe]>;
    static ngInjectorDef: i0.ɵɵInjectorDef<CommonModule>;
}
/**
 * A module that contains the deprecated i18n pipes.
 *
 * @deprecated from v5
 * @publicApi
 */
export declare class DeprecatedI18NPipesModule {
    static ngModuleDef: i0.ɵɵNgModuleDefWithMeta<DeprecatedI18NPipesModule, [typeof i18.DeprecatedDecimalPipe, typeof i18.DeprecatedPercentPipe, typeof i18.DeprecatedCurrencyPipe, typeof i19.DeprecatedDatePipe], never, [typeof i18.DeprecatedDecimalPipe, typeof i18.DeprecatedPercentPipe, typeof i18.DeprecatedCurrencyPipe, typeof i19.DeprecatedDatePipe]>;
    static ngInjectorDef: i0.ɵɵInjectorDef<DeprecatedI18NPipesModule>;
}
