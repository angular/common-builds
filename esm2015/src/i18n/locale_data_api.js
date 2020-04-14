/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/i18n/locale_data_api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵfindLocaleData, ɵgetLocaleCurrencyCode, ɵgetLocalePluralCase, ɵLocaleDataIndex } from '@angular/core';
import { CURRENCIES_EN } from './currencies';
/** @enum {number} */
const NumberFormatStyle = {
    Decimal: 0,
    Percent: 1,
    Currency: 2,
    Scientific: 3,
};
export { NumberFormatStyle };
NumberFormatStyle[NumberFormatStyle.Decimal] = 'Decimal';
NumberFormatStyle[NumberFormatStyle.Percent] = 'Percent';
NumberFormatStyle[NumberFormatStyle.Currency] = 'Currency';
NumberFormatStyle[NumberFormatStyle.Scientific] = 'Scientific';
/** @enum {number} */
const Plural = {
    Zero: 0,
    One: 1,
    Two: 2,
    Few: 3,
    Many: 4,
    Other: 5,
};
export { Plural };
Plural[Plural.Zero] = 'Zero';
Plural[Plural.One] = 'One';
Plural[Plural.Two] = 'Two';
Plural[Plural.Few] = 'Few';
Plural[Plural.Many] = 'Many';
Plural[Plural.Other] = 'Other';
/** @enum {number} */
const FormStyle = {
    Format: 0,
    Standalone: 1,
};
export { FormStyle };
FormStyle[FormStyle.Format] = 'Format';
FormStyle[FormStyle.Standalone] = 'Standalone';
/** @enum {number} */
const TranslationWidth = {
    /** 1 character for `en-US`. For example: 'S' */
    Narrow: 0,
    /** 3 characters for `en-US`. For example: 'Sun' */
    Abbreviated: 1,
    /** Full length for `en-US`. For example: "Sunday" */
    Wide: 2,
    /** 2 characters for `en-US`, For example: "Su" */
    Short: 3,
};
export { TranslationWidth };
TranslationWidth[TranslationWidth.Narrow] = 'Narrow';
TranslationWidth[TranslationWidth.Abbreviated] = 'Abbreviated';
TranslationWidth[TranslationWidth.Wide] = 'Wide';
TranslationWidth[TranslationWidth.Short] = 'Short';
/** @enum {number} */
const FormatWidth = {
    /**
     * For `en-US`, 'M/d/yy, h:mm a'`
     * (Example: `6/15/15, 9:03 AM`)
     */
    Short: 0,
    /**
     * For `en-US`, `'MMM d, y, h:mm:ss a'`
     * (Example: `Jun 15, 2015, 9:03:01 AM`)
     */
    Medium: 1,
    /**
     * For `en-US`, `'MMMM d, y, h:mm:ss a z'`
     * (Example: `June 15, 2015 at 9:03:01 AM GMT+1`)
     */
    Long: 2,
    /**
     * For `en-US`, `'EEEE, MMMM d, y, h:mm:ss a zzzz'`
     * (Example: `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00`)
     */
    Full: 3,
};
export { FormatWidth };
FormatWidth[FormatWidth.Short] = 'Short';
FormatWidth[FormatWidth.Medium] = 'Medium';
FormatWidth[FormatWidth.Long] = 'Long';
FormatWidth[FormatWidth.Full] = 'Full';
/** @enum {number} */
const NumberSymbol = {
    /**
     * Decimal separator.
     * For `en-US`, the dot character.
     * Example : 2,345`.`67
     */
    Decimal: 0,
    /**
     * Grouping separator, typically for thousands.
     * For `en-US`, the comma character.
     * Example: 2`,`345.67
     */
    Group: 1,
    /**
     * List-item separator.
     * Example: "one, two, and three"
     */
    List: 2,
    /**
     * Sign for percentage (out of 100).
     * Example: 23.4%
     */
    PercentSign: 3,
    /**
     * Sign for positive numbers.
     * Example: +23
     */
    PlusSign: 4,
    /**
     * Sign for negative numbers.
     * Example: -23
     */
    MinusSign: 5,
    /**
     * Computer notation for exponential value (n times a power of 10).
     * Example: 1.2E3
     */
    Exponential: 6,
    /**
     * Human-readable format of exponential.
     * Example: 1.2x103
     */
    SuperscriptingExponent: 7,
    /**
     * Sign for permille (out of 1000).
     * Example: 23.4‰
     */
    PerMille: 8,
    /**
     * Infinity, can be used with plus and minus.
     * Example: ∞, +∞, -∞
     */
    Infinity: 9,
    /**
     * Not a number.
     * Example: NaN
     */
    NaN: 10,
    /**
     * Symbol used between time units.
     * Example: 10:52
     */
    TimeSeparator: 11,
    /**
     * Decimal separator for currency values (fallback to `Decimal`).
     * Example: $2,345.67
     */
    CurrencyDecimal: 12,
    /**
     * Group separator for currency values (fallback to `Group`).
     * Example: $2,345.67
     */
    CurrencyGroup: 13,
};
export { NumberSymbol };
NumberSymbol[NumberSymbol.Decimal] = 'Decimal';
NumberSymbol[NumberSymbol.Group] = 'Group';
NumberSymbol[NumberSymbol.List] = 'List';
NumberSymbol[NumberSymbol.PercentSign] = 'PercentSign';
NumberSymbol[NumberSymbol.PlusSign] = 'PlusSign';
NumberSymbol[NumberSymbol.MinusSign] = 'MinusSign';
NumberSymbol[NumberSymbol.Exponential] = 'Exponential';
NumberSymbol[NumberSymbol.SuperscriptingExponent] = 'SuperscriptingExponent';
NumberSymbol[NumberSymbol.PerMille] = 'PerMille';
NumberSymbol[NumberSymbol.Infinity] = 'Infinity';
NumberSymbol[NumberSymbol.NaN] = 'NaN';
NumberSymbol[NumberSymbol.TimeSeparator] = 'TimeSeparator';
NumberSymbol[NumberSymbol.CurrencyDecimal] = 'CurrencyDecimal';
NumberSymbol[NumberSymbol.CurrencyGroup] = 'CurrencyGroup';
/** @enum {number} */
const WeekDay = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};
export { WeekDay };
WeekDay[WeekDay.Sunday] = 'Sunday';
WeekDay[WeekDay.Monday] = 'Monday';
WeekDay[WeekDay.Tuesday] = 'Tuesday';
WeekDay[WeekDay.Wednesday] = 'Wednesday';
WeekDay[WeekDay.Thursday] = 'Thursday';
WeekDay[WeekDay.Friday] = 'Friday';
WeekDay[WeekDay.Saturday] = 'Saturday';
/**
 * Retrieves the locale ID from the currently loaded locale.
 * The loaded locale could be, for example, a global one rather than a regional one.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code, such as `fr-FR`.
 * @return {?} The locale code. For example, `fr`.
 */
export function getLocaleId(locale) {
    return ɵfindLocaleData(locale)[ɵLocaleDataIndex.LocaleId];
}
/**
 * Retrieves day period strings for the given locale.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} formStyle The required grammatical form.
 * @param {?} width The required character width.
 * @return {?} An array of localized period strings. For example, `[AM, PM]` for `en-US`.
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    /** @type {?} */
    const amPmData = (/** @type {?} */ ([
        data[ɵLocaleDataIndex.DayPeriodsFormat], data[ɵLocaleDataIndex.DayPeriodsStandalone]
    ]));
    /** @type {?} */
    const amPm = getLastDefinedValue(amPmData, formStyle);
    return getLastDefinedValue(amPm, width);
}
/**
 * Retrieves days of the week for the given locale, using the Gregorian calendar.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} formStyle The required grammatical form.
 * @param {?} width The required character width.
 * @return {?} An array of localized name strings.
 * For example,`[Sunday, Monday, ... Saturday]` for `en-US`.
 */
export function getLocaleDayNames(locale, formStyle, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    /** @type {?} */
    const daysData = (/** @type {?} */ ([data[ɵLocaleDataIndex.DaysFormat], data[ɵLocaleDataIndex.DaysStandalone]]));
    /** @type {?} */
    const days = getLastDefinedValue(daysData, formStyle);
    return getLastDefinedValue(days, width);
}
/**
 * Retrieves months of the year for the given locale, using the Gregorian calendar.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} formStyle The required grammatical form.
 * @param {?} width The required character width.
 * @return {?} An array of localized name strings.
 * For example,  `[January, February, ...]` for `en-US`.
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    /** @type {?} */
    const monthsData = (/** @type {?} */ ([data[ɵLocaleDataIndex.MonthsFormat], data[ɵLocaleDataIndex.MonthsStandalone]]));
    /** @type {?} */
    const months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Retrieves Gregorian-calendar eras for the given locale.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} width The required character width.
 * @return {?} An array of localized era strings.
 * For example, `[AD, BC]` for `en-US`.
 */
export function getLocaleEraNames(locale, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    /** @type {?} */
    const erasData = (/** @type {?} */ (data[ɵLocaleDataIndex.Eras]));
    return getLastDefinedValue(erasData, width);
}
/**
 * Retrieves the first day of the week for the given locale.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @return {?} A day index number, using the 0-based week-day index for `en-US`
 * (Sunday = 0, Monday = 1, ...).
 * For example, for `fr-FR`, returns 1 to indicate that the first day is Monday.
 */
export function getLocaleFirstDayOfWeek(locale) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.FirstDayOfWeek];
}
/**
 * Range of week days that are considered the week-end for the given locale.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @return {?} The range of day values, `[startDay, endDay]`.
 */
export function getLocaleWeekEndRange(locale) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.WeekendRange];
}
/**
 * Retrieves a localized date-value formating string.
 *
 * @see `FormatWidth` / [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} width The format type.
 * @return {?} The localized formating string.
 */
export function getLocaleDateFormat(locale, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.DateFormat], width);
}
/**
 * Retrieves a localized time-value formatting string.
 *
 * @see `FormatWidth` / [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} width The format type.
 * @return {?} The localized formatting string.
 */
export function getLocaleTimeFormat(locale, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.TimeFormat], width);
}
/**
 * Retrieves a localized date-time formatting string.
 *
 * @see `FormatWidth` / [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} width The format type.
 * @return {?} The localized formatting string.
 */
export function getLocaleDateTimeFormat(locale, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    /** @type {?} */
    const dateTimeFormatData = (/** @type {?} */ (data[ɵLocaleDataIndex.DateTimeFormat]));
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Retrieves a localized number symbol that can be used to replace placeholders in number formats.
 * @see `NumberSymbol` / [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale The locale code.
 * @param {?} symbol The symbol to localize.
 * @return {?} The character for the localized symbol.
 */
export function getLocaleNumberSymbol(locale, symbol) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    /** @type {?} */
    const res = data[ɵLocaleDataIndex.NumberSymbols][symbol];
    if (typeof res === 'undefined') {
        if (symbol === NumberSymbol.CurrencyDecimal) {
            return data[ɵLocaleDataIndex.NumberSymbols][NumberSymbol.Decimal];
        }
        else if (symbol === NumberSymbol.CurrencyGroup) {
            return data[ɵLocaleDataIndex.NumberSymbols][NumberSymbol.Group];
        }
    }
    return res;
}
/**
 * Retrieves a number format for a given locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,678". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders
 * that stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders. For example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the appropriate `NumberSymbol` for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | Replaced by a currency symbol, such as $ or USD. |
 * | % | Marks a percent format. The % symbol may change position, but must be retained. |
 * | E | Marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * @see `NumberFormatStyle` / [CLDR website](http://cldr.unicode.org/translation/number-patterns) / [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} type The type of numeric value to be formatted (such as `Decimal` or `Currency`.)
 * @return {?} The localized format string.
 */
export function getLocaleNumberFormat(locale, type) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.NumberFormats][type];
}
/**
 * Retrieves the symbol used to represent the currency for the main country
 * corresponding to a given locale. For example, '$' for `en-US`.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @return {?} The localized symbol character,
 * or `null` if the main country cannot be determined.
 */
export function getLocaleCurrencySymbol(locale) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencySymbol] || null;
}
/**
 * Retrieves the name of the currency for the main country corresponding
 * to a given locale. For example, 'US Dollar' for `en-US`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @return {?} The currency name,
 * or `null` if the main country cannot be determined.
 */
export function getLocaleCurrencyName(locale) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencyName] || null;
}
/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * \@publicApi
 * @param {?} locale The code of the locale whose currency code we want.
 * @return {?} The code of the default currency for the given locale.
 *
 */
export function getLocaleCurrencyCode(locale) {
    return ɵgetLocaleCurrencyCode(locale);
}
/**
 * Retrieves the currency values for a given locale.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 * @param {?} locale A locale code for the locale format rules to use.
 * @return {?} The currency values.
 */
function getLocaleCurrencies(locale) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.Currencies];
}
/**
 * \@alias core/ɵgetLocalePluralCase
 * \@publicApi
 * @type {?}
 */
export const getLocalePluralCase = ɵgetLocalePluralCase;
/**
 * @param {?} data
 * @return {?}
 */
function checkFullData(data) {
    if (!data[ɵLocaleDataIndex.ExtraData]) {
        throw new Error(`Missing extra locale data for the locale "${data[ɵLocaleDataIndex
            .LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
    }
}
/**
 * Retrieves locale-specific rules used to determine which day period to use
 * when more than one period is defined for a locale.
 *
 * There is a rule for each defined day period. The
 * first rule is applied to the first day period and so on.
 * Fall back to AM/PM when no rules are available.
 *
 * A rule can specify a period as time range, or as a single time value.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes).
 *
 * @see `getLocaleExtraDayPeriods()` / [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @return {?} The rules for the locale, a single time value or array of *from-time, to-time*,
 * or null if no periods are available.
 *
 */
export function getLocaleExtraDayPeriodRules(locale) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    checkFullData(data);
    /** @type {?} */
    const rules = data[ɵLocaleDataIndex.ExtraData][2 /* ExtraDayPeriodsRules */] || [];
    return rules.map((/**
     * @param {?} rule
     * @return {?}
     */
    (rule) => {
        if (typeof rule === 'string') {
            return extractTime(rule);
        }
        return [extractTime(rule[0]), extractTime(rule[1])];
    }));
}
/**
 * Retrieves locale-specific day periods, which indicate roughly how a day is broken up
 * in different languages.
 * For example, for `en-US`, periods are morning, noon, afternoon, evening, and midnight.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes).
 *
 * @see `getLocaleExtraDayPeriodRules()` / [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} locale A locale code for the locale format rules to use.
 * @param {?} formStyle The required grammatical form.
 * @param {?} width The required character width.
 * @return {?} The translated day-period strings.
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    checkFullData(data);
    /** @type {?} */
    const dayPeriodsData = (/** @type {?} */ ([
        data[ɵLocaleDataIndex.ExtraData][0 /* ExtraDayPeriodFormats */],
        data[ɵLocaleDataIndex.ExtraData][1 /* ExtraDayPeriodStandalone */]
    ]));
    /** @type {?} */
    const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Retrieves the writing direction of a specified locale
 * \@publicApi
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 * @param {?} locale A locale code for the locale format rules to use.
 * @return {?} 'rtl' or 'ltr'
 */
export function getLocaleDirection(locale) {
    /** @type {?} */
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.Directionality];
}
/**
 * Retrieves the first value that is defined in an array, going backwards from an index position.
 *
 * To avoid repeating the same data (as when the "format" and "standalone" forms are the same)
 * add the first value to the locale data arrays, and add other values only if they are different.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @template T
 * @param {?} data The data array to retrieve from.
 * @param {?} index A 0-based index into the array to start from.
 * @return {?} The value immediately before the given index position.
 */
function getLastDefinedValue(data, index) {
    for (let i = index; i > -1; i--) {
        if (typeof data[i] !== 'undefined') {
            return data[i];
        }
    }
    throw new Error('Locale data API: locale data undefined');
}
/**
 * Extracts the hours and minutes from a string like "15:45"
 * @param {?} time
 * @return {?}
 */
function extractTime(time) {
    const [h, m] = time.split(':');
    return { hours: +h, minutes: +m };
}
/**
 * Retrieves the currency symbol for a given currency code.
 *
 * For example, for the default `en-US` locale, the code `USD` can
 * be represented by the narrow symbol `$` or the wide symbol `US$`.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} code The currency code.
 * @param {?} format The format, `wide` or `narrow`.
 * @param {?=} locale A locale code for the locale format rules to use.
 *
 * @return {?} The symbol, or the currency code if no symbol is available.
 */
export function getCurrencySymbol(code, format, locale = 'en') {
    /** @type {?} */
    const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    /** @type {?} */
    const symbolNarrow = currency[1 /* SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
/** @type {?} */
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Reports the number of decimal digits for a given currency.
 * The value depends upon the presence of cents in that particular currency.
 *
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * \@publicApi
 * @param {?} code The currency code.
 * @return {?} The number of decimal digits, typically 0 or 2.
 */
export function getNumberOfCurrencyDigits(code) {
    /** @type {?} */
    let digits;
    /** @type {?} */
    const currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQXdDLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVySixPQUFPLEVBQUMsYUFBYSxFQUFvQixNQUFNLGNBQWMsQ0FBQzs7QUFVOUQsTUFBWSxpQkFBaUI7SUFDM0IsT0FBTyxHQUFBO0lBQ1AsT0FBTyxHQUFBO0lBQ1AsUUFBUSxHQUFBO0lBQ1IsVUFBVSxHQUFBO0VBQ1g7Ozs7Ozs7QUFXRCxNQUFZLE1BQU07SUFDaEIsSUFBSSxHQUFJO0lBQ1IsR0FBRyxHQUFJO0lBQ1AsR0FBRyxHQUFJO0lBQ1AsR0FBRyxHQUFJO0lBQ1AsSUFBSSxHQUFJO0lBQ1IsS0FBSyxHQUFJO0VBQ1Y7Ozs7Ozs7OztBQVdELE1BQVksU0FBUztJQUNuQixNQUFNLEdBQUE7SUFDTixVQUFVLEdBQUE7RUFDWDs7Ozs7QUFTRCxNQUFZLGdCQUFnQjtJQUMxQixnREFBZ0Q7SUFDaEQsTUFBTSxHQUFBO0lBQ04sbURBQW1EO0lBQ25ELFdBQVcsR0FBQTtJQUNYLHFEQUFxRDtJQUNyRCxJQUFJLEdBQUE7SUFDSixrREFBa0Q7SUFDbEQsS0FBSyxHQUFBO0VBQ047Ozs7Ozs7QUFhRCxNQUFZLFdBQVc7SUFDckI7OztPQUdHO0lBQ0gsS0FBSyxHQUFBO0lBQ0w7OztPQUdHO0lBQ0gsTUFBTSxHQUFBO0lBQ047OztPQUdHO0lBQ0gsSUFBSSxHQUFBO0lBQ0o7OztPQUdHO0lBQ0gsSUFBSSxHQUFBO0VBQ0w7Ozs7Ozs7QUFXRCxNQUFZLFlBQVk7SUFDdEI7Ozs7T0FJRztJQUNILE9BQU8sR0FBQTtJQUNQOzs7O09BSUc7SUFDSCxLQUFLLEdBQUE7SUFDTDs7O09BR0c7SUFDSCxJQUFJLEdBQUE7SUFDSjs7O09BR0c7SUFDSCxXQUFXLEdBQUE7SUFDWDs7O09BR0c7SUFDSCxRQUFRLEdBQUE7SUFDUjs7O09BR0c7SUFDSCxTQUFTLEdBQUE7SUFDVDs7O09BR0c7SUFDSCxXQUFXLEdBQUE7SUFDWDs7O09BR0c7SUFDSCxzQkFBc0IsR0FBQTtJQUN0Qjs7O09BR0c7SUFDSCxRQUFRLEdBQUE7SUFDUjs7O09BR0c7SUFDSCxRQUFRLEdBQUE7SUFDUjs7O09BR0c7SUFDSCxHQUFHLElBQUE7SUFDSDs7O09BR0c7SUFDSCxhQUFhLElBQUE7SUFDYjs7O09BR0c7SUFDSCxlQUFlLElBQUE7SUFDZjs7O09BR0c7SUFDSCxhQUFhLElBQUE7RUFDZDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFPRCxNQUFZLE9BQU87SUFDakIsTUFBTSxHQUFJO0lBQ1YsTUFBTSxHQUFBO0lBQ04sT0FBTyxHQUFBO0lBQ1AsU0FBUyxHQUFBO0lBQ1QsUUFBUSxHQUFBO0lBQ1IsTUFBTSxHQUFBO0lBQ04sUUFBUSxHQUFBO0VBQ1Q7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVdELE1BQU0sVUFBVSxXQUFXLENBQUMsTUFBYztJQUN4QyxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1RCxDQUFDOzs7Ozs7Ozs7Ozs7QUFhRCxNQUFNLFVBQVUsbUJBQW1CLENBQy9CLE1BQWMsRUFBRSxTQUFvQixFQUFFLEtBQXVCOztVQUN6RCxJQUFJLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQzs7VUFDOUIsUUFBUSxHQUFHLG1CQUFzQjtRQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUM7S0FDckYsRUFBQTs7VUFDSyxJQUFJLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQztJQUNyRCxPQUFPLG1CQUFtQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FBY0QsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixNQUFjLEVBQUUsU0FBb0IsRUFBRSxLQUF1Qjs7VUFDekQsSUFBSSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7O1VBQzlCLFFBQVEsR0FDVixtQkFBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBQTs7VUFDdEYsSUFBSSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUM7SUFDckQsT0FBTyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWNELE1BQU0sVUFBVSxtQkFBbUIsQ0FDL0IsTUFBYyxFQUFFLFNBQW9CLEVBQUUsS0FBdUI7O1VBQ3pELElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDOztVQUM5QixVQUFVLEdBQ1osbUJBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBQTs7VUFDMUYsTUFBTSxHQUFHLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUM7SUFDekQsT0FBTyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsQ0FBQzs7Ozs7Ozs7Ozs7QUFjRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsTUFBYyxFQUFFLEtBQXVCOztVQUNqRSxJQUFJLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQzs7VUFDOUIsUUFBUSxHQUFHLG1CQUFvQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUE7SUFDaEUsT0FBTyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FBYUQsTUFBTSxVQUFVLHVCQUF1QixDQUFDLE1BQWM7O1VBQzlDLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQ3BDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQy9DLENBQUM7Ozs7Ozs7Ozs7QUFXRCxNQUFNLFVBQVUscUJBQXFCLENBQUMsTUFBYzs7VUFDNUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDcEMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0MsQ0FBQzs7Ozs7Ozs7Ozs7QUFhRCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsTUFBYyxFQUFFLEtBQWtCOztVQUM5RCxJQUFJLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUNwQyxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN2RSxDQUFDOzs7Ozs7Ozs7O0FBYUQsTUFBTSxVQUFVLG1CQUFtQixDQUFDLE1BQWMsRUFBRSxLQUFrQjs7VUFDOUQsSUFBSSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDcEMsT0FBTyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdkUsQ0FBQzs7Ozs7Ozs7Ozs7QUFhRCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsTUFBYyxFQUFFLEtBQWtCOztVQUNsRSxJQUFJLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQzs7VUFDOUIsa0JBQWtCLEdBQUcsbUJBQVUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxFQUFBO0lBQzFFLE9BQU8sbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEQsQ0FBQzs7Ozs7Ozs7OztBQVlELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxNQUFjLEVBQUUsTUFBb0I7O1VBQ2xFLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDOztVQUM5QixHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN4RCxJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsRUFBRTtRQUM5QixJQUFJLE1BQU0sS0FBSyxZQUFZLENBQUMsZUFBZSxFQUFFO1lBQzNDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuRTthQUFNLElBQUksTUFBTSxLQUFLLFlBQVksQ0FBQyxhQUFhLEVBQUU7WUFDaEQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pFO0tBQ0Y7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQ0QsTUFBTSxVQUFVLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxJQUF1Qjs7VUFDckUsSUFBSSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDcEMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsQ0FBQzs7Ozs7Ozs7Ozs7O0FBYUQsTUFBTSxVQUFVLHVCQUF1QixDQUFDLE1BQWM7O1VBQzlDLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQ3BDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQztBQUN2RCxDQUFDOzs7Ozs7Ozs7OztBQVlELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxNQUFjOztVQUM1QyxJQUFJLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUNwQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDckQsQ0FBQzs7Ozs7Ozs7Ozs7QUFZRCxNQUFNLFVBQVUscUJBQXFCLENBQUMsTUFBYztJQUNsRCxPQUFPLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUM7Ozs7Ozs7QUFRRCxTQUFTLG1CQUFtQixDQUFDLE1BQWM7O1VBQ25DLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQ3BDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLENBQUM7Ozs7OztBQU1ELE1BQU0sT0FBTyxtQkFBbUIsR0FDNUIsb0JBQW9COzs7OztBQUV4QixTQUFTLGFBQWEsQ0FBQyxJQUFTO0lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FDWixJQUFJLENBQUMsZ0JBQWdCO2FBQ1gsUUFBUSxDQUFDLGdHQUFnRyxDQUFDLENBQUM7S0FDMUg7QUFDSCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JELE1BQU0sVUFBVSw0QkFBNEIsQ0FBQyxNQUFjOztVQUNuRCxJQUFJLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUNwQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7O1VBQ2QsS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsOEJBQTRDLElBQUksRUFBRTtJQUNoRyxPQUFPLEtBQUssQ0FBQyxHQUFHOzs7O0lBQUMsQ0FBQyxJQUE2QixFQUFFLEVBQUU7UUFDakQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDNUIsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDMUI7UUFDRCxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUMsRUFBQyxDQUFDO0FBQ0wsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkQsTUFBTSxVQUFVLHdCQUF3QixDQUNwQyxNQUFjLEVBQUUsU0FBb0IsRUFBRSxLQUF1Qjs7VUFDekQsSUFBSSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDcEMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDOztVQUNkLGNBQWMsR0FBRyxtQkFBYztRQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLCtCQUE2QztRQUM3RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGtDQUFnRDtLQUNqRixFQUFBOztVQUNLLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRTtJQUN2RSxPQUFPLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEQsQ0FBQzs7Ozs7Ozs7QUFTRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsTUFBYzs7VUFDekMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDcEMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDL0MsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBZUQsU0FBUyxtQkFBbUIsQ0FBSSxJQUFTLEVBQUUsS0FBYTtJQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDL0IsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLEVBQUU7WUFDbEMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7S0FDRjtJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUM1RCxDQUFDOzs7Ozs7QUFlRCxTQUFTLFdBQVcsQ0FBQyxJQUFZO1VBQ3pCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO0lBQzlCLE9BQU8sRUFBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUM7QUFDbEMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQW1CRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsSUFBWSxFQUFFLE1BQXVCLEVBQUUsTUFBTSxHQUFHLElBQUk7O1VBQzlFLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTs7VUFDekUsWUFBWSxHQUFHLFFBQVEsc0JBQTZCO0lBRTFELElBQUksTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7UUFDM0QsT0FBTyxZQUFZLENBQUM7S0FDckI7SUFFRCxPQUFPLFFBQVEsZ0JBQXVCLElBQUksSUFBSSxDQUFDO0FBQ2pELENBQUM7OztNQUdLLDZCQUE2QixHQUFHLENBQUM7Ozs7Ozs7Ozs7O0FBWXZDLE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxJQUFZOztRQUNoRCxNQUFNOztVQUNKLFFBQVEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO0lBQ3BDLElBQUksUUFBUSxFQUFFO1FBQ1osTUFBTSxHQUFHLFFBQVEsb0JBQTJCLENBQUM7S0FDOUM7SUFDRCxPQUFPLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQztBQUM3RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1Q3VycmVuY3lJbmRleCwgybVFeHRyYUxvY2FsZURhdGFJbmRleCwgybVmaW5kTG9jYWxlRGF0YSwgybVnZXRMb2NhbGVDdXJyZW5jeUNvZGUsIMm1Z2V0TG9jYWxlUGx1cmFsQ2FzZSwgybVMb2NhbGVEYXRhSW5kZXh9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0NVUlJFTkNJRVNfRU4sIEN1cnJlbmNpZXNTeW1ib2xzfSBmcm9tICcuL2N1cnJlbmNpZXMnO1xuXG5cbi8qKlxuICogRm9ybWF0IHN0eWxlcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcHJlc2VudCBudW1iZXJzLlxuICogQHNlZSBgZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KClgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIE51bWJlckZvcm1hdFN0eWxlIHtcbiAgRGVjaW1hbCxcbiAgUGVyY2VudCxcbiAgQ3VycmVuY3ksXG4gIFNjaWVudGlmaWNcbn1cblxuLyoqXG4gKiBQbHVyYWxpdHkgY2FzZXMgdXNlZCBmb3IgdHJhbnNsYXRpbmcgcGx1cmFscyB0byBkaWZmZXJlbnQgbGFuZ3VhZ2VzLlxuICpcbiAqIEBzZWUgYE5nUGx1cmFsYFxuICogQHNlZSBgTmdQbHVyYWxDYXNlYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIFBsdXJhbCB7XG4gIFplcm8gPSAwLFxuICBPbmUgPSAxLFxuICBUd28gPSAyLFxuICBGZXcgPSAzLFxuICBNYW55ID0gNCxcbiAgT3RoZXIgPSA1LFxufVxuXG4vKipcbiAqIENvbnRleHQtZGVwZW5kYW50IHRyYW5zbGF0aW9uIGZvcm1zIGZvciBzdHJpbmdzLlxuICogVHlwaWNhbGx5IHRoZSBzdGFuZGFsb25lIHZlcnNpb24gaXMgZm9yIHRoZSBub21pbmF0aXZlIGZvcm0gb2YgdGhlIHdvcmQsXG4gKiBhbmQgdGhlIGZvcm1hdCB2ZXJzaW9uIGlzIHVzZWQgZm9yIHRoZSBnZW5pdGl2ZSBjYXNlLlxuICogQHNlZSBbQ0xEUiB3ZWJzaXRlXShodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9kYXRlLXRpbWUjVE9DLVN0YW5kLUFsb25lLXZzLi1Gb3JtYXQtU3R5bGVzKVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEZvcm1TdHlsZSB7XG4gIEZvcm1hdCxcbiAgU3RhbmRhbG9uZVxufVxuXG4vKipcbiAqIFN0cmluZyB3aWR0aHMgYXZhaWxhYmxlIGZvciB0cmFuc2xhdGlvbnMuXG4gKiBUaGUgc3BlY2lmaWMgY2hhcmFjdGVyIHdpZHRocyBhcmUgbG9jYWxlLXNwZWNpZmljLlxuICogRXhhbXBsZXMgYXJlIGdpdmVuIGZvciB0aGUgd29yZCBcIlN1bmRheVwiIGluIEVuZ2xpc2guXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBUcmFuc2xhdGlvbldpZHRoIHtcbiAgLyoqIDEgY2hhcmFjdGVyIGZvciBgZW4tVVNgLiBGb3IgZXhhbXBsZTogJ1MnICovXG4gIE5hcnJvdyxcbiAgLyoqIDMgY2hhcmFjdGVycyBmb3IgYGVuLVVTYC4gRm9yIGV4YW1wbGU6ICdTdW4nICovXG4gIEFiYnJldmlhdGVkLFxuICAvKiogRnVsbCBsZW5ndGggZm9yIGBlbi1VU2AuIEZvciBleGFtcGxlOiBcIlN1bmRheVwiICovXG4gIFdpZGUsXG4gIC8qKiAyIGNoYXJhY3RlcnMgZm9yIGBlbi1VU2AsIEZvciBleGFtcGxlOiBcIlN1XCIgKi9cbiAgU2hvcnRcbn1cblxuLyoqXG4gKiBTdHJpbmcgd2lkdGhzIGF2YWlsYWJsZSBmb3IgZGF0ZS10aW1lIGZvcm1hdHMuXG4gKiBUaGUgc3BlY2lmaWMgY2hhcmFjdGVyIHdpZHRocyBhcmUgbG9jYWxlLXNwZWNpZmljLlxuICogRXhhbXBsZXMgYXJlIGdpdmVuIGZvciBgZW4tVVNgLlxuICpcbiAqIEBzZWUgYGdldExvY2FsZURhdGVGb3JtYXQoKWBcbiAqIEBzZWUgYGdldExvY2FsZVRpbWVGb3JtYXQoKWBgXG4gKiBAc2VlIGBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdCgpYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gRm9ybWF0V2lkdGgge1xuICAvKipcbiAgICogRm9yIGBlbi1VU2AsICdNL2QveXksIGg6bW0gYSdgXG4gICAqIChFeGFtcGxlOiBgNi8xNS8xNSwgOTowMyBBTWApXG4gICAqL1xuICBTaG9ydCxcbiAgLyoqXG4gICAqIEZvciBgZW4tVVNgLCBgJ01NTSBkLCB5LCBoOm1tOnNzIGEnYFxuICAgKiAoRXhhbXBsZTogYEp1biAxNSwgMjAxNSwgOTowMzowMSBBTWApXG4gICAqL1xuICBNZWRpdW0sXG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgYCdNTU1NIGQsIHksIGg6bW06c3MgYSB6J2BcbiAgICogKEV4YW1wbGU6IGBKdW5lIDE1LCAyMDE1IGF0IDk6MDM6MDEgQU0gR01UKzFgKVxuICAgKi9cbiAgTG9uZyxcbiAgLyoqXG4gICAqIEZvciBgZW4tVVNgLCBgJ0VFRUUsIE1NTU0gZCwgeSwgaDptbTpzcyBhIHp6enonYFxuICAgKiAoRXhhbXBsZTogYE1vbmRheSwgSnVuZSAxNSwgMjAxNSBhdCA5OjAzOjAxIEFNIEdNVCswMTowMGApXG4gICAqL1xuICBGdWxsXG59XG5cbi8qKlxuICogU3ltYm9scyB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIG51bWJlciBwYXR0ZXJucy5cbiAqIEV4YW1wbGVzIGFyZSBiYXNlZCBvbiBgZW4tVVNgIHZhbHVlcy5cbiAqXG4gKiBAc2VlIGBnZXRMb2NhbGVOdW1iZXJTeW1ib2woKWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBOdW1iZXJTeW1ib2wge1xuICAvKipcbiAgICogRGVjaW1hbCBzZXBhcmF0b3IuXG4gICAqIEZvciBgZW4tVVNgLCB0aGUgZG90IGNoYXJhY3Rlci5cbiAgICogRXhhbXBsZSA6IDIsMzQ1YC5gNjdcbiAgICovXG4gIERlY2ltYWwsXG4gIC8qKlxuICAgKiBHcm91cGluZyBzZXBhcmF0b3IsIHR5cGljYWxseSBmb3IgdGhvdXNhbmRzLlxuICAgKiBGb3IgYGVuLVVTYCwgdGhlIGNvbW1hIGNoYXJhY3Rlci5cbiAgICogRXhhbXBsZTogMmAsYDM0NS42N1xuICAgKi9cbiAgR3JvdXAsXG4gIC8qKlxuICAgKiBMaXN0LWl0ZW0gc2VwYXJhdG9yLlxuICAgKiBFeGFtcGxlOiBcIm9uZSwgdHdvLCBhbmQgdGhyZWVcIlxuICAgKi9cbiAgTGlzdCxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcmNlbnRhZ2UgKG91dCBvZiAxMDApLlxuICAgKiBFeGFtcGxlOiAyMy40JVxuICAgKi9cbiAgUGVyY2VudFNpZ24sXG4gIC8qKlxuICAgKiBTaWduIGZvciBwb3NpdGl2ZSBudW1iZXJzLlxuICAgKiBFeGFtcGxlOiArMjNcbiAgICovXG4gIFBsdXNTaWduLFxuICAvKipcbiAgICogU2lnbiBmb3IgbmVnYXRpdmUgbnVtYmVycy5cbiAgICogRXhhbXBsZTogLTIzXG4gICAqL1xuICBNaW51c1NpZ24sXG4gIC8qKlxuICAgKiBDb21wdXRlciBub3RhdGlvbiBmb3IgZXhwb25lbnRpYWwgdmFsdWUgKG4gdGltZXMgYSBwb3dlciBvZiAxMCkuXG4gICAqIEV4YW1wbGU6IDEuMkUzXG4gICAqL1xuICBFeHBvbmVudGlhbCxcbiAgLyoqXG4gICAqIEh1bWFuLXJlYWRhYmxlIGZvcm1hdCBvZiBleHBvbmVudGlhbC5cbiAgICogRXhhbXBsZTogMS4yeDEwM1xuICAgKi9cbiAgU3VwZXJzY3JpcHRpbmdFeHBvbmVudCxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcm1pbGxlIChvdXQgb2YgMTAwMCkuXG4gICAqIEV4YW1wbGU6IDIzLjTigLBcbiAgICovXG4gIFBlck1pbGxlLFxuICAvKipcbiAgICogSW5maW5pdHksIGNhbiBiZSB1c2VkIHdpdGggcGx1cyBhbmQgbWludXMuXG4gICAqIEV4YW1wbGU6IOKIniwgK+KIniwgLeKInlxuICAgKi9cbiAgSW5maW5pdHksXG4gIC8qKlxuICAgKiBOb3QgYSBudW1iZXIuXG4gICAqIEV4YW1wbGU6IE5hTlxuICAgKi9cbiAgTmFOLFxuICAvKipcbiAgICogU3ltYm9sIHVzZWQgYmV0d2VlbiB0aW1lIHVuaXRzLlxuICAgKiBFeGFtcGxlOiAxMDo1MlxuICAgKi9cbiAgVGltZVNlcGFyYXRvcixcbiAgLyoqXG4gICAqIERlY2ltYWwgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBEZWNpbWFsYCkuXG4gICAqIEV4YW1wbGU6ICQyLDM0NS42N1xuICAgKi9cbiAgQ3VycmVuY3lEZWNpbWFsLFxuICAvKipcbiAgICogR3JvdXAgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBHcm91cGApLlxuICAgKiBFeGFtcGxlOiAkMiwzNDUuNjdcbiAgICovXG4gIEN1cnJlbmN5R3JvdXBcbn1cblxuLyoqXG4gKiBUaGUgdmFsdWUgZm9yIGVhY2ggZGF5IG9mIHRoZSB3ZWVrLCBiYXNlZCBvbiB0aGUgYGVuLVVTYCBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIFdlZWtEYXkge1xuICBTdW5kYXkgPSAwLFxuICBNb25kYXksXG4gIFR1ZXNkYXksXG4gIFdlZG5lc2RheSxcbiAgVGh1cnNkYXksXG4gIEZyaWRheSxcbiAgU2F0dXJkYXlcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGxvY2FsZSBJRCBmcm9tIHRoZSBjdXJyZW50bHkgbG9hZGVkIGxvY2FsZS5cbiAqIFRoZSBsb2FkZWQgbG9jYWxlIGNvdWxkIGJlLCBmb3IgZXhhbXBsZSwgYSBnbG9iYWwgb25lIHJhdGhlciB0aGFuIGEgcmVnaW9uYWwgb25lLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlLCBzdWNoIGFzIGBmci1GUmAuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxlIGNvZGUuIEZvciBleGFtcGxlLCBgZnJgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVJZChsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSlbybVMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBkYXkgcGVyaW9kIHN0cmluZ3MgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgcGVyaW9kIHN0cmluZ3MuIEZvciBleGFtcGxlLCBgW0FNLCBQTV1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXlQZXJpb2RzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgYW1QbURhdGEgPSA8W3N0cmluZywgc3RyaW5nXVtdW10+W1xuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5UGVyaW9kc0Zvcm1hdF0sIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5UGVyaW9kc1N0YW5kYWxvbmVdXG4gIF07XG4gIGNvbnN0IGFtUG0gPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGFtUG1EYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShhbVBtLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGRheXMgb2YgdGhlIHdlZWsgZm9yIHRoZSBnaXZlbiBsb2NhbGUsIHVzaW5nIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgbmFtZSBzdHJpbmdzLlxuICogRm9yIGV4YW1wbGUsYFtTdW5kYXksIE1vbmRheSwgLi4uIFNhdHVyZGF5XWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURheU5hbWVzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRheXNEYXRhID1cbiAgICAgIDxzdHJpbmdbXVtdW10+W2RhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5c0Zvcm1hdF0sIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5c1N0YW5kYWxvbmVdXTtcbiAgY29uc3QgZGF5cyA9IGdldExhc3REZWZpbmVkVmFsdWUoZGF5c0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXMsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgbW9udGhzIG9mIHRoZSB5ZWFyIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLCB1c2luZyB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIG5hbWUgc3RyaW5ncy5cbiAqIEZvciBleGFtcGxlLCAgYFtKYW51YXJ5LCBGZWJydWFyeSwgLi4uXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU1vbnRoTmFtZXMoXG4gICAgbG9jYWxlOiBzdHJpbmcsIGZvcm1TdHlsZTogRm9ybVN0eWxlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCk6IHN0cmluZ1tdIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgbW9udGhzRGF0YSA9XG4gICAgICA8c3RyaW5nW11bXVtdPltkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk1vbnRoc0Zvcm1hdF0sIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTW9udGhzU3RhbmRhbG9uZV1dO1xuICBjb25zdCBtb250aHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRoc0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRocywgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBHcmVnb3JpYW4tY2FsZW5kYXIgZXJhcyBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgZXJhIHN0cmluZ3MuXG4gKiBGb3IgZXhhbXBsZSwgYFtBRCwgQkNdYCBmb3IgYGVuLVVTYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXJhTmFtZXMobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGVyYXNEYXRhID0gPFtzdHJpbmcsIHN0cmluZ11bXT5kYXRhW8m1TG9jYWxlRGF0YUluZGV4LkVyYXNdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShlcmFzRGF0YSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgQSBkYXkgaW5kZXggbnVtYmVyLCB1c2luZyB0aGUgMC1iYXNlZCB3ZWVrLWRheSBpbmRleCBmb3IgYGVuLVVTYFxuICogKFN1bmRheSA9IDAsIE1vbmRheSA9IDEsIC4uLikuXG4gKiBGb3IgZXhhbXBsZSwgZm9yIGBmci1GUmAsIHJldHVybnMgMSB0byBpbmRpY2F0ZSB0aGF0IHRoZSBmaXJzdCBkYXkgaXMgTW9uZGF5LlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVGaXJzdERheU9mV2Vlayhsb2NhbGU6IHN0cmluZyk6IFdlZWtEYXkge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5GaXJzdERheU9mV2Vla107XG59XG5cbi8qKlxuICogUmFuZ2Ugb2Ygd2VlayBkYXlzIHRoYXQgYXJlIGNvbnNpZGVyZWQgdGhlIHdlZWstZW5kIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIHJhbmdlIG9mIGRheSB2YWx1ZXMsIGBbc3RhcnREYXksIGVuZERheV1gLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVXZWVrRW5kUmFuZ2UobG9jYWxlOiBzdHJpbmcpOiBbV2Vla0RheSwgV2Vla0RheV0ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5XZWVrZW5kUmFuZ2VdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCBkYXRlLXZhbHVlIGZvcm1hdGluZyBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gd2lkdGggVGhlIGZvcm1hdCB0eXBlLlxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXRpbmcgc3RyaW5nLlxuICogQHNlZSBgRm9ybWF0V2lkdGhgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF0ZUZvcm1hdF0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgdGltZS12YWx1ZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgZm9ybWF0IHR5cGUuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdHRpbmcgc3RyaW5nLlxuICogQHNlZSBgRm9ybWF0V2lkdGhgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRhW8m1TG9jYWxlRGF0YUluZGV4LlRpbWVGb3JtYXRdLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIGRhdGUtdGltZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgZm9ybWF0IHR5cGUuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdHRpbmcgc3RyaW5nLlxuICogQHNlZSBgRm9ybWF0V2lkdGhgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBkYXRlVGltZUZvcm1hdERhdGEgPSA8c3RyaW5nW10+ZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXRlVGltZUZvcm1hdF07XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGVUaW1lRm9ybWF0RGF0YSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCBudW1iZXIgc3ltYm9sIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gbnVtYmVyIGZvcm1hdHMuXG4gKiBAcGFyYW0gbG9jYWxlIFRoZSBsb2NhbGUgY29kZS5cbiAqIEBwYXJhbSBzeW1ib2wgVGhlIHN5bWJvbCB0byBsb2NhbGl6ZS5cbiAqIEByZXR1cm5zIFRoZSBjaGFyYWN0ZXIgZm9yIHRoZSBsb2NhbGl6ZWQgc3ltYm9sLlxuICogQHNlZSBgTnVtYmVyU3ltYm9sYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlOiBzdHJpbmcsIHN5bWJvbDogTnVtYmVyU3ltYm9sKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgcmVzID0gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtzeW1ib2xdO1xuICBpZiAodHlwZW9mIHJlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoc3ltYm9sID09PSBOdW1iZXJTeW1ib2wuQ3VycmVuY3lEZWNpbWFsKSB7XG4gICAgICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuRGVjaW1hbF07XG4gICAgfSBlbHNlIGlmIChzeW1ib2wgPT09IE51bWJlclN5bWJvbC5DdXJyZW5jeUdyb3VwKSB7XG4gICAgICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuR3JvdXBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIG51bWJlciBmb3JtYXQgZm9yIGEgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIE51bWJlcnMgYXJlIGZvcm1hdHRlZCB1c2luZyBwYXR0ZXJucywgbGlrZSBgIywjIyMuMDBgLiBGb3IgZXhhbXBsZSwgdGhlIHBhdHRlcm4gYCMsIyMjLjAwYFxuICogd2hlbiB1c2VkIHRvIGZvcm1hdCB0aGUgbnVtYmVyIDEyMzQ1LjY3OCBjb3VsZCByZXN1bHQgaW4gXCIxMiczNDUsNjc4XCIuIFRoYXQgd291bGQgaGFwcGVuIGlmIHRoZVxuICogZ3JvdXBpbmcgc2VwYXJhdG9yIGZvciB5b3VyIGxhbmd1YWdlIGlzIGFuIGFwb3N0cm9waGUsIGFuZCB0aGUgZGVjaW1hbCBzZXBhcmF0b3IgaXMgYSBjb21tYS5cbiAqXG4gKiA8Yj5JbXBvcnRhbnQ6PC9iPiBUaGUgY2hhcmFjdGVycyBgLmAgYCxgIGAwYCBgI2AgKGFuZCBvdGhlcnMgYmVsb3cpIGFyZSBzcGVjaWFsIHBsYWNlaG9sZGVyc1xuICogdGhhdCBzdGFuZCBmb3IgdGhlIGRlY2ltYWwgc2VwYXJhdG9yLCBhbmQgc28gb24sIGFuZCBhcmUgTk9UIHJlYWwgY2hhcmFjdGVycy5cbiAqIFlvdSBtdXN0IE5PVCBcInRyYW5zbGF0ZVwiIHRoZSBwbGFjZWhvbGRlcnMuIEZvciBleGFtcGxlLCBkb24ndCBjaGFuZ2UgYC5gIHRvIGAsYCBldmVuIHRob3VnaCBpblxuICogeW91ciBsYW5ndWFnZSB0aGUgZGVjaW1hbCBwb2ludCBpcyB3cml0dGVuIHdpdGggYSBjb21tYS4gVGhlIHN5bWJvbHMgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5IHRoZVxuICogbG9jYWwgZXF1aXZhbGVudHMsIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBgTnVtYmVyU3ltYm9sYCBmb3IgeW91ciBsYW5ndWFnZS5cbiAqXG4gKiBIZXJlIGFyZSB0aGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHVzZWQgaW4gbnVtYmVyIHBhdHRlcm5zOlxuICpcbiAqIHwgU3ltYm9sIHwgTWVhbmluZyB8XG4gKiB8LS0tLS0tLS18LS0tLS0tLS0tfFxuICogfCAuIHwgUmVwbGFjZWQgYXV0b21hdGljYWxseSBieSB0aGUgY2hhcmFjdGVyIHVzZWQgZm9yIHRoZSBkZWNpbWFsIHBvaW50LiB8XG4gKiB8ICwgfCBSZXBsYWNlZCBieSB0aGUgXCJncm91cGluZ1wiICh0aG91c2FuZHMpIHNlcGFyYXRvci4gfFxuICogfCAwIHwgUmVwbGFjZWQgYnkgYSBkaWdpdCAob3IgemVybyBpZiB0aGVyZSBhcmVuJ3QgZW5vdWdoIGRpZ2l0cykuIHxcbiAqIHwgIyB8IFJlcGxhY2VkIGJ5IGEgZGlnaXQgKG9yIG5vdGhpbmcgaWYgdGhlcmUgYXJlbid0IGVub3VnaCkuIHxcbiAqIHwgwqQgfCBSZXBsYWNlZCBieSBhIGN1cnJlbmN5IHN5bWJvbCwgc3VjaCBhcyAkIG9yIFVTRC4gfFxuICogfCAlIHwgTWFya3MgYSBwZXJjZW50IGZvcm1hdC4gVGhlICUgc3ltYm9sIG1heSBjaGFuZ2UgcG9zaXRpb24sIGJ1dCBtdXN0IGJlIHJldGFpbmVkLiB8XG4gKiB8IEUgfCBNYXJrcyBhIHNjaWVudGlmaWMgZm9ybWF0LiBUaGUgRSBzeW1ib2wgbWF5IGNoYW5nZSBwb3NpdGlvbiwgYnV0IG11c3QgYmUgcmV0YWluZWQuIHxcbiAqIHwgJyB8IFNwZWNpYWwgY2hhcmFjdGVycyB1c2VkIGFzIGxpdGVyYWwgY2hhcmFjdGVycyBhcmUgcXVvdGVkIHdpdGggQVNDSUkgc2luZ2xlIHF1b3Rlcy4gfFxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgbnVtZXJpYyB2YWx1ZSB0byBiZSBmb3JtYXR0ZWQgKHN1Y2ggYXMgYERlY2ltYWxgIG9yIGBDdXJyZW5jeWAuKVxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXQgc3RyaW5nLlxuICogQHNlZSBgTnVtYmVyRm9ybWF0U3R5bGVgXG4gKiBAc2VlIFtDTERSIHdlYnNpdGVdKGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL251bWJlci1wYXR0ZXJucylcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB0eXBlOiBOdW1iZXJGb3JtYXRTdHlsZSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlckZvcm1hdHNdW3R5cGVdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgc3ltYm9sIHVzZWQgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW5jeSBmb3IgdGhlIG1haW4gY291bnRyeVxuICogY29ycmVzcG9uZGluZyB0byBhIGdpdmVuIGxvY2FsZS4gRm9yIGV4YW1wbGUsICckJyBmb3IgYGVuLVVTYC5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgc3ltYm9sIGNoYXJhY3RlcixcbiAqIG9yIGBudWxsYCBpZiB0aGUgbWFpbiBjb3VudHJ5IGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeVN5bWJvbChsb2NhbGU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguQ3VycmVuY3lTeW1ib2xdIHx8IG51bGw7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBuYW1lIG9mIHRoZSBjdXJyZW5jeSBmb3IgdGhlIG1haW4gY291bnRyeSBjb3JyZXNwb25kaW5nXG4gKiB0byBhIGdpdmVuIGxvY2FsZS4gRm9yIGV4YW1wbGUsICdVUyBEb2xsYXInIGZvciBgZW4tVVNgLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgY3VycmVuY3kgbmFtZSxcbiAqIG9yIGBudWxsYCBpZiB0aGUgbWFpbiBjb3VudHJ5IGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeU5hbWUobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5TmFtZV0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGRlZmF1bHQgY3VycmVuY3kgY29kZSBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBUaGUgZGVmYXVsdCBpcyBkZWZpbmVkIGFzIHRoZSBmaXJzdCBjdXJyZW5jeSB3aGljaCBpcyBzdGlsbCBpbiB1c2UuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBUaGUgY29kZSBvZiB0aGUgbG9jYWxlIHdob3NlIGN1cnJlbmN5IGNvZGUgd2Ugd2FudC5cbiAqIEByZXR1cm5zIFRoZSBjb2RlIG9mIHRoZSBkZWZhdWx0IGN1cnJlbmN5IGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUN1cnJlbmN5Q29kZShsb2NhbGU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgcmV0dXJuIMm1Z2V0TG9jYWxlQ3VycmVuY3lDb2RlKGxvY2FsZSk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW5jeSB2YWx1ZXMgZm9yIGEgZ2l2ZW4gbG9jYWxlLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgY3VycmVuY3kgdmFsdWVzLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqL1xuZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY2llcyhsb2NhbGU6IHN0cmluZyk6IHtbY29kZTogc3RyaW5nXTogQ3VycmVuY2llc1N5bWJvbHN9IHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguQ3VycmVuY2llc107XG59XG5cbi8qKlxuICogQGFsaWFzIGNvcmUvybVnZXRMb2NhbGVQbHVyYWxDYXNlXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRMb2NhbGVQbHVyYWxDYXNlOiAobG9jYWxlOiBzdHJpbmcpID0+ICgodmFsdWU6IG51bWJlcikgPT4gUGx1cmFsKSA9XG4gICAgybVnZXRMb2NhbGVQbHVyYWxDYXNlO1xuXG5mdW5jdGlvbiBjaGVja0Z1bGxEYXRhKGRhdGE6IGFueSkge1xuICBpZiAoIWRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBleHRyYSBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7XG4gICAgICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXhcbiAgICAgICAgICAgICAgICAgLkxvY2FsZUlkXX1cIi4gVXNlIFwicmVnaXN0ZXJMb2NhbGVEYXRhXCIgdG8gbG9hZCBuZXcgZGF0YS4gU2VlIHRoZSBcIkkxOG4gZ3VpZGVcIiBvbiBhbmd1bGFyLmlvIHRvIGtub3cgbW9yZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHJpZXZlcyBsb2NhbGUtc3BlY2lmaWMgcnVsZXMgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggZGF5IHBlcmlvZCB0byB1c2VcbiAqIHdoZW4gbW9yZSB0aGFuIG9uZSBwZXJpb2QgaXMgZGVmaW5lZCBmb3IgYSBsb2NhbGUuXG4gKlxuICogVGhlcmUgaXMgYSBydWxlIGZvciBlYWNoIGRlZmluZWQgZGF5IHBlcmlvZC4gVGhlXG4gKiBmaXJzdCBydWxlIGlzIGFwcGxpZWQgdG8gdGhlIGZpcnN0IGRheSBwZXJpb2QgYW5kIHNvIG9uLlxuICogRmFsbCBiYWNrIHRvIEFNL1BNIHdoZW4gbm8gcnVsZXMgYXJlIGF2YWlsYWJsZS5cbiAqXG4gKiBBIHJ1bGUgY2FuIHNwZWNpZnkgYSBwZXJpb2QgYXMgdGltZSByYW5nZSwgb3IgYXMgYSBzaW5nbGUgdGltZSB2YWx1ZS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgb25seSBhdmFpbGFibGUgd2hlbiB5b3UgaGF2ZSBsb2FkZWQgdGhlIGZ1bGwgbG9jYWxlIGRhdGEuXG4gKiBTZWUgdGhlIFtcIkkxOG4gZ3VpZGVcIl0oZ3VpZGUvaTE4biNpMThuLXBpcGVzKS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBydWxlcyBmb3IgdGhlIGxvY2FsZSwgYSBzaW5nbGUgdGltZSB2YWx1ZSBvciBhcnJheSBvZiAqZnJvbS10aW1lLCB0by10aW1lKixcbiAqIG9yIG51bGwgaWYgbm8gcGVyaW9kcyBhcmUgYXZhaWxhYmxlLlxuICpcbiAqIEBzZWUgYGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcygpYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKGxvY2FsZTogc3RyaW5nKTogKFRpbWV8W1RpbWUsIFRpbWVdKVtdIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgcnVsZXMgPSBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV1bybVFeHRyYUxvY2FsZURhdGFJbmRleC5FeHRyYURheVBlcmlvZHNSdWxlc10gfHwgW107XG4gIHJldHVybiBydWxlcy5tYXAoKHJ1bGU6IHN0cmluZ3xbc3RyaW5nLCBzdHJpbmddKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGV4dHJhY3RUaW1lKHJ1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gW2V4dHJhY3RUaW1lKHJ1bGVbMF0pLCBleHRyYWN0VGltZShydWxlWzFdKV07XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBsb2NhbGUtc3BlY2lmaWMgZGF5IHBlcmlvZHMsIHdoaWNoIGluZGljYXRlIHJvdWdobHkgaG93IGEgZGF5IGlzIGJyb2tlbiB1cFxuICogaW4gZGlmZmVyZW50IGxhbmd1YWdlcy5cbiAqIEZvciBleGFtcGxlLCBmb3IgYGVuLVVTYCwgcGVyaW9kcyBhcmUgbW9ybmluZywgbm9vbiwgYWZ0ZXJub29uLCBldmVuaW5nLCBhbmQgbWlkbmlnaHQuXG4gKlxuICogVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4geW91IGhhdmUgbG9hZGVkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbXCJJMThuIGd1aWRlXCJdKGd1aWRlL2kxOG4jaTE4bi1waXBlcykuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBUaGUgdHJhbnNsYXRlZCBkYXktcGVyaW9kIHN0cmluZ3MuXG4gKiBAc2VlIGBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKClgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjaGVja0Z1bGxEYXRhKGRhdGEpO1xuICBjb25zdCBkYXlQZXJpb2RzRGF0YSA9IDxzdHJpbmdbXVtdW10+W1xuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVvJtUV4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kRm9ybWF0c10sXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW8m1RXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RTdGFuZGFsb25lXVxuICBdO1xuICBjb25zdCBkYXlQZXJpb2RzID0gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlQZXJpb2RzRGF0YSwgZm9ybVN0eWxlKSB8fCBbXTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF5UGVyaW9kcywgd2lkdGgpIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgd3JpdGluZyBkaXJlY3Rpb24gb2YgYSBzcGVjaWZpZWQgbG9jYWxlXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwdWJsaWNBcGlcbiAqIEByZXR1cm5zICdydGwnIG9yICdsdHInXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGlyZWN0aW9uKGxvY2FsZTogc3RyaW5nKTogJ2x0cid8J3J0bCcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EaXJlY3Rpb25hbGl0eV07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBmaXJzdCB2YWx1ZSB0aGF0IGlzIGRlZmluZWQgaW4gYW4gYXJyYXksIGdvaW5nIGJhY2t3YXJkcyBmcm9tIGFuIGluZGV4IHBvc2l0aW9uLlxuICpcbiAqIFRvIGF2b2lkIHJlcGVhdGluZyB0aGUgc2FtZSBkYXRhIChhcyB3aGVuIHRoZSBcImZvcm1hdFwiIGFuZCBcInN0YW5kYWxvbmVcIiBmb3JtcyBhcmUgdGhlIHNhbWUpXG4gKiBhZGQgdGhlIGZpcnN0IHZhbHVlIHRvIHRoZSBsb2NhbGUgZGF0YSBhcnJheXMsIGFuZCBhZGQgb3RoZXIgdmFsdWVzIG9ubHkgaWYgdGhleSBhcmUgZGlmZmVyZW50LlxuICpcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIGFycmF5IHRvIHJldHJpZXZlIGZyb20uXG4gKiBAcGFyYW0gaW5kZXggQSAwLWJhc2VkIGluZGV4IGludG8gdGhlIGFycmF5IHRvIHN0YXJ0IGZyb20uXG4gKiBAcmV0dXJucyBUaGUgdmFsdWUgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBnaXZlbiBpbmRleCBwb3NpdGlvbi5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5mdW5jdGlvbiBnZXRMYXN0RGVmaW5lZFZhbHVlPFQ+KGRhdGE6IFRbXSwgaW5kZXg6IG51bWJlcik6IFQge1xuICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPiAtMTsgaS0tKSB7XG4gICAgaWYgKHR5cGVvZiBkYXRhW2ldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGRhdGFbaV07XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignTG9jYWxlIGRhdGEgQVBJOiBsb2NhbGUgZGF0YSB1bmRlZmluZWQnKTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdGltZSB2YWx1ZSB3aXRoIGhvdXJzIGFuZCBtaW51dGVzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgVGltZSA9IHtcbiAgaG91cnM6IG51bWJlcixcbiAgbWludXRlczogbnVtYmVyXG59O1xuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBob3VycyBhbmQgbWludXRlcyBmcm9tIGEgc3RyaW5nIGxpa2UgXCIxNTo0NVwiXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RUaW1lKHRpbWU6IHN0cmluZyk6IFRpbWUge1xuICBjb25zdCBbaCwgbV0gPSB0aW1lLnNwbGl0KCc6Jyk7XG4gIHJldHVybiB7aG91cnM6ICtoLCBtaW51dGVzOiArbX07XG59XG5cblxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgY3VycmVuY3kgc3ltYm9sIGZvciBhIGdpdmVuIGN1cnJlbmN5IGNvZGUuXG4gKlxuICogRm9yIGV4YW1wbGUsIGZvciB0aGUgZGVmYXVsdCBgZW4tVVNgIGxvY2FsZSwgdGhlIGNvZGUgYFVTRGAgY2FuXG4gKiBiZSByZXByZXNlbnRlZCBieSB0aGUgbmFycm93IHN5bWJvbCBgJGAgb3IgdGhlIHdpZGUgc3ltYm9sIGBVUyRgLlxuICpcbiAqIEBwYXJhbSBjb2RlIFRoZSBjdXJyZW5jeSBjb2RlLlxuICogQHBhcmFtIGZvcm1hdCBUaGUgZm9ybWF0LCBgd2lkZWAgb3IgYG5hcnJvd2AuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgc3ltYm9sLCBvciB0aGUgY3VycmVuY3kgY29kZSBpZiBubyBzeW1ib2wgaXMgYXZhaWxhYmxlLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW5jeVN5bWJvbChjb2RlOiBzdHJpbmcsIGZvcm1hdDogJ3dpZGUnfCduYXJyb3cnLCBsb2NhbGUgPSAnZW4nKTogc3RyaW5nIHtcbiAgY29uc3QgY3VycmVuY3kgPSBnZXRMb2NhbGVDdXJyZW5jaWVzKGxvY2FsZSlbY29kZV0gfHwgQ1VSUkVOQ0lFU19FTltjb2RlXSB8fCBbXTtcbiAgY29uc3Qgc3ltYm9sTmFycm93ID0gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4LlN5bWJvbE5hcnJvd107XG5cbiAgaWYgKGZvcm1hdCA9PT0gJ25hcnJvdycgJiYgdHlwZW9mIHN5bWJvbE5hcnJvdyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3ltYm9sTmFycm93O1xuICB9XG5cbiAgcmV0dXJuIGN1cnJlbmN5W8m1Q3VycmVuY3lJbmRleC5TeW1ib2xdIHx8IGNvZGU7XG59XG5cbi8vIE1vc3QgY3VycmVuY2llcyBoYXZlIGNlbnRzLCB0aGF0J3Mgd2h5IHRoZSBkZWZhdWx0IGlzIDJcbmNvbnN0IERFRkFVTFRfTkJfT0ZfQ1VSUkVOQ1lfRElHSVRTID0gMjtcblxuLyoqXG4gKiBSZXBvcnRzIHRoZSBudW1iZXIgb2YgZGVjaW1hbCBkaWdpdHMgZm9yIGEgZ2l2ZW4gY3VycmVuY3kuXG4gKiBUaGUgdmFsdWUgZGVwZW5kcyB1cG9uIHRoZSBwcmVzZW5jZSBvZiBjZW50cyBpbiB0aGF0IHBhcnRpY3VsYXIgY3VycmVuY3kuXG4gKlxuICogQHBhcmFtIGNvZGUgVGhlIGN1cnJlbmN5IGNvZGUuXG4gKiBAcmV0dXJucyBUaGUgbnVtYmVyIG9mIGRlY2ltYWwgZGlnaXRzLCB0eXBpY2FsbHkgMCBvciAyLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROdW1iZXJPZkN1cnJlbmN5RGlnaXRzKGNvZGU6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBkaWdpdHM7XG4gIGNvbnN0IGN1cnJlbmN5ID0gQ1VSUkVOQ0lFU19FTltjb2RlXTtcbiAgaWYgKGN1cnJlbmN5KSB7XG4gICAgZGlnaXRzID0gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4Lk5iT2ZEaWdpdHNdO1xuICB9XG4gIHJldHVybiB0eXBlb2YgZGlnaXRzID09PSAnbnVtYmVyJyA/IGRpZ2l0cyA6IERFRkFVTFRfTkJfT0ZfQ1VSUkVOQ1lfRElHSVRTO1xufVxuIl19