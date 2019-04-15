/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Register global data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale data.
 *
 * @publicApi
 */
export declare function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void;
/**
 * Index of each type of locale data from the extra locale data array
 */
export declare const enum ExtraLocaleDataIndex {
    ExtraDayPeriodFormats = 0,
    ExtraDayPeriodStandalone = 1,
    ExtraDayPeriodsRules = 2
}
/**
 * Index of each value in currency data (used to describe CURRENCIES_EN in currencies.ts)
 */
export declare const enum CurrencyIndex {
    Symbol = 0,
    SymbolNarrow = 1,
    NbOfDigits = 2
}
