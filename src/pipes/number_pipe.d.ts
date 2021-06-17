/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a value according to digit options and locale rules.
 * Locale determines group sizing and separator,
 * decimal point character, and other locale-specific configurations.
 *
 * @see `formatNumber()`
 *
 * @usageNotes
 *
 * ### digitsInfo
 *
 * The value's decimal representation is specified by the `digitsInfo`
 * parameter, written in the following format:<br>
 *
 * ```
 * {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
 * ```
 *
 *  - `minIntegerDigits`:
 * The minimum number of integer digits before the decimal point.
 * Default is 1.
 *
 * - `minFractionDigits`:
 * The minimum number of digits after the decimal point.
 * Default is 0.
 *
 *  - `maxFractionDigits`:
 * The maximum number of digits after the decimal point.
 * Default is 3.
 *
 * If the formatted value is truncated it will be rounded using the "to-nearest" method:
 *
 * ```
 * {{3.6 | number: '1.0-0'}}
 * <!--will output '4'-->
 *
 * {{-3.6 | number:'1.0-0'}}
 * <!--will output '-4'-->
 * ```
 *
 * ### locale
 *
 * `locale` will format a value according to locale rules.
 * Locale determines group sizing and separator,
 * decimal point character, and other locale-specific configurations.
 *
 * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
 *
 * See [Setting your app locale](guide/i18n#setting-up-the-locale-of-your-app).
 *
 * ### Example
 *
 * The following code shows how the pipe transforms values
 * according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * <code-example path="common/pipes/ts/number_pipe.ts" region='NumberPipe'></code-example>
 *
 * @publicApi
 */
export declare class DecimalPipe implements PipeTransform {
    private _locale;
    constructor(_locale: string);
    transform(value: number | string, digitsInfo?: string, locale?: string): string | null;
    transform(value: null | undefined, digitsInfo?: string, locale?: string): null;
    transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<DecimalPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<DecimalPipe, "number">;
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a percentage
 * string, formatted according to locale rules that determine group sizing and
 * separator, decimal-point character, and other locale-specific
 * configurations.
 *
 * @see `formatPercent()`
 *
 * @usageNotes
 * The following code shows how the pipe transforms numbers
 * into text strings, according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * <code-example path="common/pipes/ts/percent_pipe.ts" region='PercentPipe'></code-example>
 *
 * @publicApi
 */
export declare class PercentPipe implements PipeTransform {
    private _locale;
    constructor(_locale: string);
    transform(value: number | string, digitsInfo?: string, locale?: string): string | null;
    transform(value: null | undefined, digitsInfo?: string, locale?: string): null;
    transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<PercentPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PercentPipe, "percent">;
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a currency string, formatted according to locale rules
 * that determine group sizing and separator, decimal-point character,
 * and other locale-specific configurations.
 *
 * {@a currency-code-deprecation}
 * <div class="alert is-helpful">
 *
 * **Deprecation notice:**
 *
 * The default currency code is currently always `USD` but this is deprecated from v9.
 *
 * **In v11 the default currency code will be taken from the current locale identified by
 * the `LOCALE_ID` token. See the [i18n guide](guide/i18n#setting-up-the-locale-of-your-app) for
 * more information.**
 *
 * If you need the previous behavior then set it by creating a `DEFAULT_CURRENCY_CODE` provider in
 * your application `NgModule`:
 *
 * ```ts
 * {provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'}
 * ```
 *
 * </div>
 *
 * @see `getCurrencySymbol()`
 * @see `formatCurrency()`
 *
 * @usageNotes
 * The following code shows how the pipe transforms numbers
 * into text strings, according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * <code-example path="common/pipes/ts/currency_pipe.ts" region='CurrencyPipe'></code-example>
 *
 * @publicApi
 */
export declare class CurrencyPipe implements PipeTransform {
    private _locale;
    private _defaultCurrencyCode;
    constructor(_locale: string, _defaultCurrencyCode?: string);
    transform(value: number | string, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): string | null;
    transform(value: null | undefined, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): null;
    transform(value: number | string | null | undefined, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean, digitsInfo?: string, locale?: string): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<CurrencyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<CurrencyPipe, "currency">;
}
