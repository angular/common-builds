/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare const NUMBER_FORMAT_REGEXP: RegExp;
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param currency A string containing the currency symbol or its name,
 * such as "$" or "Canadian Dollar". Used in output string, but does not affect the operation
 * of the function.
 * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
 * currency code to use in the result string, such as `USD` for the US dollar and `EUR` for the euro.
 * @param digitInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted currency value.
 *
 * @see `formatNumber()`
 * @see `DecimalPipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export declare function formatCurrency(value: number, locale: string, currency: string, currencyCode?: string, digitsInfo?: string): string;
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted percentage value.
 *
 * @see `formatNumber()`
 * @see `DecimalPipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 * @publicApi
 *
 */
export declare function formatPercent(value: number, locale: string, digitsInfo?: string): string;
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as text, with group sizing, separator, and other
 * parameters based on the locale.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted text string.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export declare function formatNumber(value: number, locale: string, digitsInfo?: string): string;
export declare function parseIntAutoRadix(text: string): number;
