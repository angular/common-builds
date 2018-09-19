import * as i0 from '@angular/core';
import * as i1 from './pipes/deprecated/number_pipe';
import * as i2 from './pipes/deprecated/date_pipe';
import * as i3 from './directives/ng_class';
import * as i4 from './directives/ng_component_outlet';
import * as i5 from './directives/ng_for_of';
import * as i6 from './directives/ng_if';
import * as i7 from './directives/ng_template_outlet';
import * as i8 from './directives/ng_style';
import * as i9 from './directives/ng_switch';
import * as i10 from './directives/ng_plural';
import * as i11 from './pipes/async_pipe';
import * as i12 from './pipes/case_conversion_pipes';
import * as i13 from './pipes/json_pipe';
import * as i14 from './pipes/slice_pipe';
import * as i15 from './pipes/number_pipe';
import * as i16 from './pipes/date_pipe';
import * as i17 from './pipes/i18n_plural_pipe';
import * as i18 from './pipes/i18n_select_pipe';
import * as i19 from './pipes/keyvalue_pipe';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * The module that includes all the basic Angular directives like {@link NgIf}, {@link NgForOf}, ...
 *
 *
 */
export declare class CommonModule {
    static ngModuleDef: i0.ɵNgModuleDef<CommonModule, [typeof i3.NgClass,typeof i4.NgComponentOutlet,typeof i5.NgForOf,typeof i6.NgIf,typeof i7.NgTemplateOutlet,typeof i8.NgStyle,typeof i9.NgSwitch,typeof i9.NgSwitchCase,typeof i9.NgSwitchDefault,typeof i10.NgPlural,typeof i10.NgPluralCase,typeof i11.AsyncPipe,typeof i12.UpperCasePipe,typeof i12.LowerCasePipe,typeof i13.JsonPipe,typeof i14.SlicePipe,typeof i15.DecimalPipe,typeof i15.PercentPipe,typeof i12.TitleCasePipe,typeof i15.CurrencyPipe,typeof i16.DatePipe,typeof i17.I18nPluralPipe,typeof i18.I18nSelectPipe,typeof i19.KeyValuePipe], never, [typeof i3.NgClass,typeof i4.NgComponentOutlet,typeof i5.NgForOf,typeof i6.NgIf,typeof i7.NgTemplateOutlet,typeof i8.NgStyle,typeof i9.NgSwitch,typeof i9.NgSwitchCase,typeof i9.NgSwitchDefault,typeof i10.NgPlural,typeof i10.NgPluralCase,typeof i11.AsyncPipe,typeof i12.UpperCasePipe,typeof i12.LowerCasePipe,typeof i13.JsonPipe,typeof i14.SlicePipe,typeof i15.DecimalPipe,typeof i15.PercentPipe,typeof i12.TitleCasePipe,typeof i15.CurrencyPipe,typeof i16.DatePipe,typeof i17.I18nPluralPipe,typeof i18.I18nSelectPipe,typeof i19.KeyValuePipe]>;
    static ngInjectorDef: i0.ɵInjectorDef<CommonModule>;
}
/**
 * A module that contains the deprecated i18n pipes.
 *
 * @deprecated from v5
 */
export declare class DeprecatedI18NPipesModule {
    static ngModuleDef: i0.ɵNgModuleDef<DeprecatedI18NPipesModule, [typeof i1.DeprecatedDecimalPipe,typeof i1.DeprecatedPercentPipe,typeof i1.DeprecatedCurrencyPipe,typeof i2.DeprecatedDatePipe], never, [typeof i1.DeprecatedDecimalPipe,typeof i1.DeprecatedPercentPipe,typeof i1.DeprecatedCurrencyPipe,typeof i2.DeprecatedDatePipe]>;
    static ngInjectorDef: i0.ɵInjectorDef<DeprecatedI18NPipesModule>;
}
