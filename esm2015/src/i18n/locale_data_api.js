/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵLocaleDataIndex, ɵfindLocaleData, ɵgetLocalePluralCase } from '@angular/core';
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
    const amPmData = (/** @type {?} */ ([data[ɵLocaleDataIndex.DayPeriodsFormat], data[ɵLocaleDataIndex.DayPeriodsStandalone]]));
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
        throw new Error(`Missing extra locale data for the locale "${data[ɵLocaleDataIndex.LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
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
 * @return {?} The symbol, or the currency code if no symbol is available.0
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBd0MsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzdILE9BQU8sRUFBQyxhQUFhLEVBQW9CLE1BQU0sY0FBYyxDQUFDOzs7SUFVNUQsVUFBTztJQUNQLFVBQU87SUFDUCxXQUFRO0lBQ1IsYUFBVTs7Ozs7Ozs7O0lBYVYsT0FBUTtJQUNSLE1BQU87SUFDUCxNQUFPO0lBQ1AsTUFBTztJQUNQLE9BQVE7SUFDUixRQUFTOzs7Ozs7Ozs7OztJQWFULFNBQU07SUFDTixhQUFVOzs7Ozs7O0lBV1YsZ0RBQWdEO0lBQ2hELFNBQU07SUFDTixtREFBbUQ7SUFDbkQsY0FBVztJQUNYLHFEQUFxRDtJQUNyRCxPQUFJO0lBQ0osa0RBQWtEO0lBQ2xELFFBQUs7Ozs7Ozs7OztJQWVMOzs7T0FHRztJQUNILFFBQUs7SUFDTDs7O09BR0c7SUFDSCxTQUFNO0lBQ047OztPQUdHO0lBQ0gsT0FBSTtJQUNKOzs7T0FHRztJQUNILE9BQUk7Ozs7Ozs7OztJQWFKOzs7O09BSUc7SUFDSCxVQUFPO0lBQ1A7Ozs7T0FJRztJQUNILFFBQUs7SUFDTDs7O09BR0c7SUFDSCxPQUFJO0lBQ0o7OztPQUdHO0lBQ0gsY0FBVztJQUNYOzs7T0FHRztJQUNILFdBQVE7SUFDUjs7O09BR0c7SUFDSCxZQUFTO0lBQ1Q7OztPQUdHO0lBQ0gsY0FBVztJQUNYOzs7T0FHRztJQUNILHlCQUFzQjtJQUN0Qjs7O09BR0c7SUFDSCxXQUFRO0lBQ1I7OztPQUdHO0lBQ0gsV0FBUTtJQUNSOzs7T0FHRztJQUNILE9BQUc7SUFDSDs7O09BR0c7SUFDSCxpQkFBYTtJQUNiOzs7T0FH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TUFBTSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQztBQUM3RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1Q3VycmVuY3lJbmRleCwgybVFeHRyYUxvY2FsZURhdGFJbmRleCwgybVMb2NhbGVEYXRhSW5kZXgsIMm1ZmluZExvY2FsZURhdGEsIMm1Z2V0TG9jYWxlUGx1cmFsQ2FzZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NVUlJFTkNJRVNfRU4sIEN1cnJlbmNpZXNTeW1ib2xzfSBmcm9tICcuL2N1cnJlbmNpZXMnO1xuXG4vKipcbiAqIEZvcm1hdCBzdHlsZXMgdGhhdCBjYW4gYmUgdXNlZCB0byByZXByZXNlbnQgbnVtYmVycy5cbiAqIEBzZWUgYGdldExvY2FsZU51bWJlckZvcm1hdCgpYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBOdW1iZXJGb3JtYXRTdHlsZSB7XG4gIERlY2ltYWwsXG4gIFBlcmNlbnQsXG4gIEN1cnJlbmN5LFxuICBTY2llbnRpZmljXG59XG5cbi8qKlxuICogUGx1cmFsaXR5IGNhc2VzIHVzZWQgZm9yIHRyYW5zbGF0aW5nIHBsdXJhbHMgdG8gZGlmZmVyZW50IGxhbmd1YWdlcy5cbiAqXG4gKiBAc2VlIGBOZ1BsdXJhbGBcbiAqIEBzZWUgYE5nUGx1cmFsQ2FzZWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBQbHVyYWwge1xuICBaZXJvID0gMCxcbiAgT25lID0gMSxcbiAgVHdvID0gMixcbiAgRmV3ID0gMyxcbiAgTWFueSA9IDQsXG4gIE90aGVyID0gNSxcbn1cblxuLyoqXG4gKiBDb250ZXh0LWRlcGVuZGFudCB0cmFuc2xhdGlvbiBmb3JtcyBmb3Igc3RyaW5ncy5cbiAqIFR5cGljYWxseSB0aGUgc3RhbmRhbG9uZSB2ZXJzaW9uIGlzIGZvciB0aGUgbm9taW5hdGl2ZSBmb3JtIG9mIHRoZSB3b3JkLFxuICogYW5kIHRoZSBmb3JtYXQgdmVyc2lvbiBpcyB1c2VkIGZvciB0aGUgZ2VuaXRpdmUgY2FzZS5cbiAqIEBzZWUgW0NMRFIgd2Vic2l0ZV0oaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vZGF0ZS10aW1lI1RPQy1TdGFuZC1BbG9uZS12cy4tRm9ybWF0LVN0eWxlcylcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBGb3JtU3R5bGUge1xuICBGb3JtYXQsXG4gIFN0YW5kYWxvbmVcbn1cblxuLyoqXG4gKiBTdHJpbmcgd2lkdGhzIGF2YWlsYWJsZSBmb3IgdHJhbnNsYXRpb25zLlxuICogVGhlIHNwZWNpZmljIGNoYXJhY3RlciB3aWR0aHMgYXJlIGxvY2FsZS1zcGVjaWZpYy5cbiAqIEV4YW1wbGVzIGFyZSBnaXZlbiBmb3IgdGhlIHdvcmQgXCJTdW5kYXlcIiBpbiBFbmdsaXNoLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gVHJhbnNsYXRpb25XaWR0aCB7XG4gIC8qKiAxIGNoYXJhY3RlciBmb3IgYGVuLVVTYC4gRm9yIGV4YW1wbGU6ICdTJyAqL1xuICBOYXJyb3csXG4gIC8qKiAzIGNoYXJhY3RlcnMgZm9yIGBlbi1VU2AuIEZvciBleGFtcGxlOiAnU3VuJyAqL1xuICBBYmJyZXZpYXRlZCxcbiAgLyoqIEZ1bGwgbGVuZ3RoIGZvciBgZW4tVVNgLiBGb3IgZXhhbXBsZTogXCJTdW5kYXlcIiAqL1xuICBXaWRlLFxuICAvKiogMiBjaGFyYWN0ZXJzIGZvciBgZW4tVVNgLCBGb3IgZXhhbXBsZTogXCJTdVwiICovXG4gIFNob3J0XG59XG5cbi8qKlxuICogU3RyaW5nIHdpZHRocyBhdmFpbGFibGUgZm9yIGRhdGUtdGltZSBmb3JtYXRzLlxuICogVGhlIHNwZWNpZmljIGNoYXJhY3RlciB3aWR0aHMgYXJlIGxvY2FsZS1zcGVjaWZpYy5cbiAqIEV4YW1wbGVzIGFyZSBnaXZlbiBmb3IgYGVuLVVTYC5cbiAqXG4gKiBAc2VlIGBnZXRMb2NhbGVEYXRlRm9ybWF0KClgXG4gKiBAc2VlIGBnZXRMb2NhbGVUaW1lRm9ybWF0KClgYFxuICogQHNlZSBgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQoKWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEZvcm1hdFdpZHRoIHtcbiAgLyoqXG4gICAqIEZvciBgZW4tVVNgLCAnTS9kL3l5LCBoOm1tIGEnYFxuICAgKiAoRXhhbXBsZTogYDYvMTUvMTUsIDk6MDMgQU1gKVxuICAgKi9cbiAgU2hvcnQsXG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgYCdNTU0gZCwgeSwgaDptbTpzcyBhJ2BcbiAgICogKEV4YW1wbGU6IGBKdW4gMTUsIDIwMTUsIDk6MDM6MDEgQU1gKVxuICAgKi9cbiAgTWVkaXVtLFxuICAvKipcbiAgICogRm9yIGBlbi1VU2AsIGAnTU1NTSBkLCB5LCBoOm1tOnNzIGEgeidgXG4gICAqIChFeGFtcGxlOiBgSnVuZSAxNSwgMjAxNSBhdCA5OjAzOjAxIEFNIEdNVCsxYClcbiAgICovXG4gIExvbmcsXG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgYCdFRUVFLCBNTU1NIGQsIHksIGg6bW06c3MgYSB6enp6J2BcbiAgICogKEV4YW1wbGU6IGBNb25kYXksIEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMDE6MDBgKVxuICAgKi9cbiAgRnVsbFxufVxuXG4vKipcbiAqIFN5bWJvbHMgdGhhdCBjYW4gYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBudW1iZXIgcGF0dGVybnMuXG4gKiBFeGFtcGxlcyBhcmUgYmFzZWQgb24gYGVuLVVTYCB2YWx1ZXMuXG4gKlxuICogQHNlZSBgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKClgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gTnVtYmVyU3ltYm9sIHtcbiAgLyoqXG4gICAqIERlY2ltYWwgc2VwYXJhdG9yLlxuICAgKiBGb3IgYGVuLVVTYCwgdGhlIGRvdCBjaGFyYWN0ZXIuXG4gICAqIEV4YW1wbGUgOiAyLDM0NWAuYDY3XG4gICAqL1xuICBEZWNpbWFsLFxuICAvKipcbiAgICogR3JvdXBpbmcgc2VwYXJhdG9yLCB0eXBpY2FsbHkgZm9yIHRob3VzYW5kcy5cbiAgICogRm9yIGBlbi1VU2AsIHRoZSBjb21tYSBjaGFyYWN0ZXIuXG4gICAqIEV4YW1wbGU6IDJgLGAzNDUuNjdcbiAgICovXG4gIEdyb3VwLFxuICAvKipcbiAgICogTGlzdC1pdGVtIHNlcGFyYXRvci5cbiAgICogRXhhbXBsZTogXCJvbmUsIHR3bywgYW5kIHRocmVlXCJcbiAgICovXG4gIExpc3QsXG4gIC8qKlxuICAgKiBTaWduIGZvciBwZXJjZW50YWdlIChvdXQgb2YgMTAwKS5cbiAgICogRXhhbXBsZTogMjMuNCVcbiAgICovXG4gIFBlcmNlbnRTaWduLFxuICAvKipcbiAgICogU2lnbiBmb3IgcG9zaXRpdmUgbnVtYmVycy5cbiAgICogRXhhbXBsZTogKzIzXG4gICAqL1xuICBQbHVzU2lnbixcbiAgLyoqXG4gICAqIFNpZ24gZm9yIG5lZ2F0aXZlIG51bWJlcnMuXG4gICAqIEV4YW1wbGU6IC0yM1xuICAgKi9cbiAgTWludXNTaWduLFxuICAvKipcbiAgICogQ29tcHV0ZXIgbm90YXRpb24gZm9yIGV4cG9uZW50aWFsIHZhbHVlIChuIHRpbWVzIGEgcG93ZXIgb2YgMTApLlxuICAgKiBFeGFtcGxlOiAxLjJFM1xuICAgKi9cbiAgRXhwb25lbnRpYWwsXG4gIC8qKlxuICAgKiBIdW1hbi1yZWFkYWJsZSBmb3JtYXQgb2YgZXhwb25lbnRpYWwuXG4gICAqIEV4YW1wbGU6IDEuMngxMDNcbiAgICovXG4gIFN1cGVyc2NyaXB0aW5nRXhwb25lbnQsXG4gIC8qKlxuICAgKiBTaWduIGZvciBwZXJtaWxsZSAob3V0IG9mIDEwMDApLlxuICAgKiBFeGFtcGxlOiAyMy404oCwXG4gICAqL1xuICBQZXJNaWxsZSxcbiAgLyoqXG4gICAqIEluZmluaXR5LCBjYW4gYmUgdXNlZCB3aXRoIHBsdXMgYW5kIG1pbnVzLlxuICAgKiBFeGFtcGxlOiDiiJ4sICviiJ4sIC3iiJ5cbiAgICovXG4gIEluZmluaXR5LFxuICAvKipcbiAgICogTm90IGEgbnVtYmVyLlxuICAgKiBFeGFtcGxlOiBOYU5cbiAgICovXG4gIE5hTixcbiAgLyoqXG4gICAqIFN5bWJvbCB1c2VkIGJldHdlZW4gdGltZSB1bml0cy5cbiAgICogRXhhbXBsZTogMTA6NTJcbiAgICovXG4gIFRpbWVTZXBhcmF0b3IsXG4gIC8qKlxuICAgKiBEZWNpbWFsIHNlcGFyYXRvciBmb3IgY3VycmVuY3kgdmFsdWVzIChmYWxsYmFjayB0byBgRGVjaW1hbGApLlxuICAgKiBFeGFtcGxlOiAkMiwzNDUuNjdcbiAgICovXG4gIEN1cnJlbmN5RGVjaW1hbCxcbiAgLyoqXG4gICAqIEdyb3VwIHNlcGFyYXRvciBmb3IgY3VycmVuY3kgdmFsdWVzIChmYWxsYmFjayB0byBgR3JvdXBgKS5cbiAgICogRXhhbXBsZTogJDIsMzQ1LjY3XG4gICAqL1xuICBDdXJyZW5jeUdyb3VwXG59XG5cbi8qKlxuICogVGhlIHZhbHVlIGZvciBlYWNoIGRheSBvZiB0aGUgd2VlaywgYmFzZWQgb24gdGhlIGBlbi1VU2AgbG9jYWxlXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcbiAgU3VuZGF5ID0gMCxcbiAgTW9uZGF5LFxuICBUdWVzZGF5LFxuICBXZWRuZXNkYXksXG4gIFRodXJzZGF5LFxuICBGcmlkYXksXG4gIFNhdHVyZGF5XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsb2NhbGUgSUQgZnJvbSB0aGUgY3VycmVudGx5IGxvYWRlZCBsb2NhbGUuXG4gKiBUaGUgbG9hZGVkIGxvY2FsZSBjb3VsZCBiZSwgZm9yIGV4YW1wbGUsIGEgZ2xvYmFsIG9uZSByYXRoZXIgdGhhbiBhIHJlZ2lvbmFsIG9uZS5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSwgc3VjaCBhcyBgZnItRlJgLlxuICogQHJldHVybnMgVGhlIGxvY2FsZSBjb2RlLiBGb3IgZXhhbXBsZSwgYGZyYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlSWQobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpW8m1TG9jYWxlRGF0YUluZGV4LkxvY2FsZUlkXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgZGF5IHBlcmlvZCBzdHJpbmdzIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIHBlcmlvZCBzdHJpbmdzLiBGb3IgZXhhbXBsZSwgYFtBTSwgUE1dYCBmb3IgYGVuLVVTYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF5UGVyaW9kcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGFtUG1EYXRhID0gPFtcbiAgICBzdHJpbmcsIHN0cmluZ1xuICBdW11bXT5bZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXlQZXJpb2RzRm9ybWF0XSwgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXlQZXJpb2RzU3RhbmRhbG9uZV1dO1xuICBjb25zdCBhbVBtID0gZ2V0TGFzdERlZmluZWRWYWx1ZShhbVBtRGF0YSwgZm9ybVN0eWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoYW1QbSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBkYXlzIG9mIHRoZSB3ZWVrIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLCB1c2luZyB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIG5hbWUgc3RyaW5ncy5cbiAqIEZvciBleGFtcGxlLGBbU3VuZGF5LCBNb25kYXksIC4uLiBTYXR1cmRheV1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXlOYW1lcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBkYXlzRGF0YSA9XG4gICAgICA8c3RyaW5nW11bXVtdPltkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRheXNGb3JtYXRdLCBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRheXNTdGFuZGFsb25lXV07XG4gIGNvbnN0IGRheXMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXNEYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlzLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIG1vbnRocyBvZiB0aGUgeWVhciBmb3IgdGhlIGdpdmVuIGxvY2FsZSwgdXNpbmcgdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGxvY2FsaXplZCBuYW1lIHN0cmluZ3MuXG4gKiBGb3IgZXhhbXBsZSwgIGBbSmFudWFyeSwgRmVicnVhcnksIC4uLl1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVNb250aE5hbWVzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IG1vbnRoc0RhdGEgPVxuICAgICAgPHN0cmluZ1tdW11bXT5bZGF0YVvJtUxvY2FsZURhdGFJbmRleC5Nb250aHNGb3JtYXRdLCBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk1vbnRoc1N0YW5kYWxvbmVdXTtcbiAgY29uc3QgbW9udGhzID0gZ2V0TGFzdERlZmluZWRWYWx1ZShtb250aHNEYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShtb250aHMsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgR3JlZ29yaWFuLWNhbGVuZGFyIGVyYXMgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cblxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIGVyYSBzdHJpbmdzLlxuICogRm9yIGV4YW1wbGUsIGBbQUQsIEJDXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUVyYU5hbWVzKGxvY2FsZTogc3RyaW5nLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBlcmFzRGF0YSA9IDxbc3RyaW5nLCBzdHJpbmddW10+ZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FcmFzXTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZXJhc0RhdGEsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGZpcnN0IGRheSBvZiB0aGUgd2VlayBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIEEgZGF5IGluZGV4IG51bWJlciwgdXNpbmcgdGhlIDAtYmFzZWQgd2Vlay1kYXkgaW5kZXggZm9yIGBlbi1VU2BcbiAqIChTdW5kYXkgPSAwLCBNb25kYXkgPSAxLCAuLi4pLlxuICogRm9yIGV4YW1wbGUsIGZvciBgZnItRlJgLCByZXR1cm5zIDEgdG8gaW5kaWNhdGUgdGhhdCB0aGUgZmlyc3QgZGF5IGlzIE1vbmRheS5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRmlyc3REYXlPZldlZWsobG9jYWxlOiBzdHJpbmcpOiBXZWVrRGF5IHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRmlyc3REYXlPZldlZWtdO1xufVxuXG4vKipcbiAqIFJhbmdlIG9mIHdlZWsgZGF5cyB0aGF0IGFyZSBjb25zaWRlcmVkIHRoZSB3ZWVrLWVuZCBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSByYW5nZSBvZiBkYXkgdmFsdWVzLCBgW3N0YXJ0RGF5LCBlbmREYXldYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlV2Vla0VuZFJhbmdlKGxvY2FsZTogc3RyaW5nKTogW1dlZWtEYXksIFdlZWtEYXldIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguV2Vla2VuZFJhbmdlXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgZGF0ZS12YWx1ZSBmb3JtYXRpbmcgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHdpZHRoIFRoZSBmb3JtYXQgdHlwZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgZm9ybWF0aW5nIHN0cmluZy5cbiAqIEBzZWUgYEZvcm1hdFdpZHRoYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRhdGVGb3JtYXRdLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIHRpbWUtdmFsdWUgZm9ybWF0dGluZyBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gd2lkdGggVGhlIGZvcm1hdCB0eXBlLlxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXR0aW5nIHN0cmluZy5cbiAqIEBzZWUgYEZvcm1hdFdpZHRoYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcblxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGU6IHN0cmluZywgd2lkdGg6IEZvcm1hdFdpZHRoKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0YVvJtUxvY2FsZURhdGFJbmRleC5UaW1lRm9ybWF0XSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCBkYXRlLXRpbWUgZm9ybWF0dGluZyBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gd2lkdGggVGhlIGZvcm1hdCB0eXBlLlxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXR0aW5nIHN0cmluZy5cbiAqIEBzZWUgYEZvcm1hdFdpZHRoYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGU6IHN0cmluZywgd2lkdGg6IEZvcm1hdFdpZHRoKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgZGF0ZVRpbWVGb3JtYXREYXRhID0gPHN0cmluZ1tdPmRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF0ZVRpbWVGb3JtYXRdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRlVGltZUZvcm1hdERhdGEsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgbnVtYmVyIHN5bWJvbCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIG51bWJlciBmb3JtYXRzLlxuICogQHBhcmFtIGxvY2FsZSBUaGUgbG9jYWxlIGNvZGUuXG4gKiBAcGFyYW0gc3ltYm9sIFRoZSBzeW1ib2wgdG8gbG9jYWxpemUuXG4gKiBAcmV0dXJucyBUaGUgY2hhcmFjdGVyIGZvciB0aGUgbG9jYWxpemVkIHN5bWJvbC5cbiAqIEBzZWUgYE51bWJlclN5bWJvbGBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZTogc3RyaW5nLCBzeW1ib2w6IE51bWJlclN5bWJvbCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IHJlcyA9IGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTnVtYmVyU3ltYm9sc11bc3ltYm9sXTtcbiAgaWYgKHR5cGVvZiByZXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHN5bWJvbCA9PT0gTnVtYmVyU3ltYm9sLkN1cnJlbmN5RGVjaW1hbCkge1xuICAgICAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTnVtYmVyU3ltYm9sc11bTnVtYmVyU3ltYm9sLkRlY2ltYWxdO1xuICAgIH0gZWxzZSBpZiAoc3ltYm9sID09PSBOdW1iZXJTeW1ib2wuQ3VycmVuY3lHcm91cCkge1xuICAgICAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTnVtYmVyU3ltYm9sc11bTnVtYmVyU3ltYm9sLkdyb3VwXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBudW1iZXIgZm9ybWF0IGZvciBhIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBOdW1iZXJzIGFyZSBmb3JtYXR0ZWQgdXNpbmcgcGF0dGVybnMsIGxpa2UgYCMsIyMjLjAwYC4gRm9yIGV4YW1wbGUsIHRoZSBwYXR0ZXJuIGAjLCMjIy4wMGBcbiAqIHdoZW4gdXNlZCB0byBmb3JtYXQgdGhlIG51bWJlciAxMjM0NS42NzggY291bGQgcmVzdWx0IGluIFwiMTInMzQ1LDY3OFwiLiBUaGF0IHdvdWxkIGhhcHBlbiBpZiB0aGVcbiAqIGdyb3VwaW5nIHNlcGFyYXRvciBmb3IgeW91ciBsYW5ndWFnZSBpcyBhbiBhcG9zdHJvcGhlLCBhbmQgdGhlIGRlY2ltYWwgc2VwYXJhdG9yIGlzIGEgY29tbWEuXG4gKlxuICogPGI+SW1wb3J0YW50OjwvYj4gVGhlIGNoYXJhY3RlcnMgYC5gIGAsYCBgMGAgYCNgIChhbmQgb3RoZXJzIGJlbG93KSBhcmUgc3BlY2lhbCBwbGFjZWhvbGRlcnNcbiAqIHRoYXQgc3RhbmQgZm9yIHRoZSBkZWNpbWFsIHNlcGFyYXRvciwgYW5kIHNvIG9uLCBhbmQgYXJlIE5PVCByZWFsIGNoYXJhY3RlcnMuXG4gKiBZb3UgbXVzdCBOT1QgXCJ0cmFuc2xhdGVcIiB0aGUgcGxhY2Vob2xkZXJzLiBGb3IgZXhhbXBsZSwgZG9uJ3QgY2hhbmdlIGAuYCB0byBgLGAgZXZlbiB0aG91Z2ggaW5cbiAqIHlvdXIgbGFuZ3VhZ2UgdGhlIGRlY2ltYWwgcG9pbnQgaXMgd3JpdHRlbiB3aXRoIGEgY29tbWEuIFRoZSBzeW1ib2xzIHNob3VsZCBiZSByZXBsYWNlZCBieSB0aGVcbiAqIGxvY2FsIGVxdWl2YWxlbnRzLCB1c2luZyB0aGUgYXBwcm9wcmlhdGUgYE51bWJlclN5bWJvbGAgZm9yIHlvdXIgbGFuZ3VhZ2UuXG4gKlxuICogSGVyZSBhcmUgdGhlIHNwZWNpYWwgY2hhcmFjdGVycyB1c2VkIGluIG51bWJlciBwYXR0ZXJuczpcbiAqXG4gKiB8IFN5bWJvbCB8IE1lYW5pbmcgfFxuICogfC0tLS0tLS0tfC0tLS0tLS0tLXxcbiAqIHwgLiB8IFJlcGxhY2VkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIGNoYXJhY3RlciB1c2VkIGZvciB0aGUgZGVjaW1hbCBwb2ludC4gfFxuICogfCAsIHwgUmVwbGFjZWQgYnkgdGhlIFwiZ3JvdXBpbmdcIiAodGhvdXNhbmRzKSBzZXBhcmF0b3IuIHxcbiAqIHwgMCB8IFJlcGxhY2VkIGJ5IGEgZGlnaXQgKG9yIHplcm8gaWYgdGhlcmUgYXJlbid0IGVub3VnaCBkaWdpdHMpLiB8XG4gKiB8ICMgfCBSZXBsYWNlZCBieSBhIGRpZ2l0IChvciBub3RoaW5nIGlmIHRoZXJlIGFyZW4ndCBlbm91Z2gpLiB8XG4gKiB8IMKkIHwgUmVwbGFjZWQgYnkgYSBjdXJyZW5jeSBzeW1ib2wsIHN1Y2ggYXMgJCBvciBVU0QuIHxcbiAqIHwgJSB8IE1hcmtzIGEgcGVyY2VudCBmb3JtYXQuIFRoZSAlIHN5bWJvbCBtYXkgY2hhbmdlIHBvc2l0aW9uLCBidXQgbXVzdCBiZSByZXRhaW5lZC4gfFxuICogfCBFIHwgTWFya3MgYSBzY2llbnRpZmljIGZvcm1hdC4gVGhlIEUgc3ltYm9sIG1heSBjaGFuZ2UgcG9zaXRpb24sIGJ1dCBtdXN0IGJlIHJldGFpbmVkLiB8XG4gKiB8ICcgfCBTcGVjaWFsIGNoYXJhY3RlcnMgdXNlZCBhcyBsaXRlcmFsIGNoYXJhY3RlcnMgYXJlIHF1b3RlZCB3aXRoIEFTQ0lJIHNpbmdsZSBxdW90ZXMuIHxcbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIG51bWVyaWMgdmFsdWUgdG8gYmUgZm9ybWF0dGVkIChzdWNoIGFzIGBEZWNpbWFsYCBvciBgQ3VycmVuY3lgLilcbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgZm9ybWF0IHN0cmluZy5cbiAqIEBzZWUgYE51bWJlckZvcm1hdFN0eWxlYFxuICogQHNlZSBbQ0xEUiB3ZWJzaXRlXShodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9udW1iZXItcGF0dGVybnMpXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU51bWJlckZvcm1hdChsb2NhbGU6IHN0cmluZywgdHlwZTogTnVtYmVyRm9ybWF0U3R5bGUpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJGb3JtYXRzXVt0eXBlXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHN5bWJvbCB1c2VkIHRvIHJlcHJlc2VudCB0aGUgY3VycmVuY3kgZm9yIHRoZSBtYWluIGNvdW50cnlcbiAqIGNvcnJlc3BvbmRpbmcgdG8gYSBnaXZlbiBsb2NhbGUuIEZvciBleGFtcGxlLCAnJCcgZm9yIGBlbi1VU2AuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIHN5bWJvbCBjaGFyYWN0ZXIsXG4gKiBvciBgbnVsbGAgaWYgdGhlIG1haW4gY291bnRyeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY3lTeW1ib2wobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5U3ltYm9sXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGUgY3VycmVuY3kgZm9yIHRoZSBtYWluIGNvdW50cnkgY29ycmVzcG9uZGluZ1xuICogdG8gYSBnaXZlbiBsb2NhbGUuIEZvciBleGFtcGxlLCAnVVMgRG9sbGFyJyBmb3IgYGVuLVVTYC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIGN1cnJlbmN5IG5hbWUsXG4gKiBvciBgbnVsbGAgaWYgdGhlIG1haW4gY291bnRyeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY3lOYW1lKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5DdXJyZW5jeU5hbWVdIHx8IG51bGw7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW5jeSB2YWx1ZXMgZm9yIGEgZ2l2ZW4gbG9jYWxlLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgY3VycmVuY3kgdmFsdWVzLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqL1xuZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY2llcyhsb2NhbGU6IHN0cmluZyk6IHtbY29kZTogc3RyaW5nXTogQ3VycmVuY2llc1N5bWJvbHN9IHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguQ3VycmVuY2llc107XG59XG5cbi8qKlxuICogQGFsaWFzIGNvcmUvybVnZXRMb2NhbGVQbHVyYWxDYXNlXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRMb2NhbGVQbHVyYWxDYXNlOiAobG9jYWxlOiBzdHJpbmcpID0+ICgodmFsdWU6IG51bWJlcikgPT4gUGx1cmFsKSA9XG4gICAgybVnZXRMb2NhbGVQbHVyYWxDYXNlO1xuXG5mdW5jdGlvbiBjaGVja0Z1bGxEYXRhKGRhdGE6IGFueSkge1xuICBpZiAoIWRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1pc3NpbmcgZXh0cmEgbG9jYWxlIGRhdGEgZm9yIHRoZSBsb2NhbGUgXCIke2RhdGFbybVMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdfVwiLiBVc2UgXCJyZWdpc3RlckxvY2FsZURhdGFcIiB0byBsb2FkIG5ldyBkYXRhLiBTZWUgdGhlIFwiSTE4biBndWlkZVwiIG9uIGFuZ3VsYXIuaW8gdG8ga25vdyBtb3JlLmApO1xuICB9XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGxvY2FsZS1zcGVjaWZpYyBydWxlcyB1c2VkIHRvIGRldGVybWluZSB3aGljaCBkYXkgcGVyaW9kIHRvIHVzZVxuICogd2hlbiBtb3JlIHRoYW4gb25lIHBlcmlvZCBpcyBkZWZpbmVkIGZvciBhIGxvY2FsZS5cbiAqXG4gKiBUaGVyZSBpcyBhIHJ1bGUgZm9yIGVhY2ggZGVmaW5lZCBkYXkgcGVyaW9kLiBUaGVcbiAqIGZpcnN0IHJ1bGUgaXMgYXBwbGllZCB0byB0aGUgZmlyc3QgZGF5IHBlcmlvZCBhbmQgc28gb24uXG4gKiBGYWxsIGJhY2sgdG8gQU0vUE0gd2hlbiBubyBydWxlcyBhcmUgYXZhaWxhYmxlLlxuICpcbiAqIEEgcnVsZSBjYW4gc3BlY2lmeSBhIHBlcmlvZCBhcyB0aW1lIHJhbmdlLCBvciBhcyBhIHNpbmdsZSB0aW1lIHZhbHVlLlxuICpcbiAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHlvdSBoYXZlIGxvYWRlZCB0aGUgZnVsbCBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW1wiSTE4biBndWlkZVwiXShndWlkZS9pMThuI2kxOG4tcGlwZXMpLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIHJ1bGVzIGZvciB0aGUgbG9jYWxlLCBhIHNpbmdsZSB0aW1lIHZhbHVlIG9yIGFycmF5IG9mICpmcm9tLXRpbWUsIHRvLXRpbWUqLFxuICogb3IgbnVsbCBpZiBubyBwZXJpb2RzIGFyZSBhdmFpbGFibGUuXG4gKlxuICogQHNlZSBgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzKClgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMobG9jYWxlOiBzdHJpbmcpOiAoVGltZSB8IFtUaW1lLCBUaW1lXSlbXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNoZWNrRnVsbERhdGEoZGF0YSk7XG4gIGNvbnN0IHJ1bGVzID0gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW8m1RXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RzUnVsZXNdIHx8IFtdO1xuICByZXR1cm4gcnVsZXMubWFwKChydWxlOiBzdHJpbmcgfCBbc3RyaW5nLCBzdHJpbmddKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGV4dHJhY3RUaW1lKHJ1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gW2V4dHJhY3RUaW1lKHJ1bGVbMF0pLCBleHRyYWN0VGltZShydWxlWzFdKV07XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBsb2NhbGUtc3BlY2lmaWMgZGF5IHBlcmlvZHMsIHdoaWNoIGluZGljYXRlIHJvdWdobHkgaG93IGEgZGF5IGlzIGJyb2tlbiB1cFxuICogaW4gZGlmZmVyZW50IGxhbmd1YWdlcy5cbiAqIEZvciBleGFtcGxlLCBmb3IgYGVuLVVTYCwgcGVyaW9kcyBhcmUgbW9ybmluZywgbm9vbiwgYWZ0ZXJub29uLCBldmVuaW5nLCBhbmQgbWlkbmlnaHQuXG4gKlxuICogVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4geW91IGhhdmUgbG9hZGVkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbXCJJMThuIGd1aWRlXCJdKGd1aWRlL2kxOG4jaTE4bi1waXBlcykuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBUaGUgdHJhbnNsYXRlZCBkYXktcGVyaW9kIHN0cmluZ3MuXG4gKiBAc2VlIGBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKClgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjaGVja0Z1bGxEYXRhKGRhdGEpO1xuICBjb25zdCBkYXlQZXJpb2RzRGF0YSA9IDxzdHJpbmdbXVtdW10+W1xuICAgICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW8m1RXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RGb3JtYXRzXSxcbiAgICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVvJtUV4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kU3RhbmRhbG9uZV1cbiAgXTtcbiAgY29uc3QgZGF5UGVyaW9kcyA9IGdldExhc3REZWZpbmVkVmFsdWUoZGF5UGVyaW9kc0RhdGEsIGZvcm1TdHlsZSkgfHwgW107XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheVBlcmlvZHMsIHdpZHRoKSB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGZpcnN0IHZhbHVlIHRoYXQgaXMgZGVmaW5lZCBpbiBhbiBhcnJheSwgZ29pbmcgYmFja3dhcmRzIGZyb20gYW4gaW5kZXggcG9zaXRpb24uXG4gKlxuICogVG8gYXZvaWQgcmVwZWF0aW5nIHRoZSBzYW1lIGRhdGEgKGFzIHdoZW4gdGhlIFwiZm9ybWF0XCIgYW5kIFwic3RhbmRhbG9uZVwiIGZvcm1zIGFyZSB0aGUgc2FtZSlcbiAqIGFkZCB0aGUgZmlyc3QgdmFsdWUgdG8gdGhlIGxvY2FsZSBkYXRhIGFycmF5cywgYW5kIGFkZCBvdGhlciB2YWx1ZXMgb25seSBpZiB0aGV5IGFyZSBkaWZmZXJlbnQuXG4gKlxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgYXJyYXkgdG8gcmV0cmlldmUgZnJvbS5cbiAqIEBwYXJhbSBpbmRleCBBIDAtYmFzZWQgaW5kZXggaW50byB0aGUgYXJyYXkgdG8gc3RhcnQgZnJvbS5cbiAqIEByZXR1cm5zIFRoZSB2YWx1ZSBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGdpdmVuIGluZGV4IHBvc2l0aW9uLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmZ1bmN0aW9uIGdldExhc3REZWZpbmVkVmFsdWU8VD4oZGF0YTogVFtdLCBpbmRleDogbnVtYmVyKTogVCB7XG4gIGZvciAobGV0IGkgPSBpbmRleDsgaSA+IC0xOyBpLS0pIHtcbiAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZGF0YVtpXTtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgZGF0YSBBUEk6IGxvY2FsZSBkYXRhIHVuZGVmaW5lZCcpO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0aW1lIHZhbHVlIHdpdGggaG91cnMgYW5kIG1pbnV0ZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBUaW1lID0ge1xuICBob3VyczogbnVtYmVyLFxuICBtaW51dGVzOiBudW1iZXJcbn07XG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIGhvdXJzIGFuZCBtaW51dGVzIGZyb20gYSBzdHJpbmcgbGlrZSBcIjE1OjQ1XCJcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFRpbWUodGltZTogc3RyaW5nKTogVGltZSB7XG4gIGNvbnN0IFtoLCBtXSA9IHRpbWUuc3BsaXQoJzonKTtcbiAgcmV0dXJuIHtob3VyczogK2gsIG1pbnV0ZXM6ICttfTtcbn1cblxuXG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW5jeSBzeW1ib2wgZm9yIGEgZ2l2ZW4gY3VycmVuY3kgY29kZS5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgZm9yIHRoZSBkZWZhdWx0IGBlbi1VU2AgbG9jYWxlLCB0aGUgY29kZSBgVVNEYCBjYW5cbiAqIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSBuYXJyb3cgc3ltYm9sIGAkYCBvciB0aGUgd2lkZSBzeW1ib2wgYFVTJGAuXG4gKlxuICogQHBhcmFtIGNvZGUgVGhlIGN1cnJlbmN5IGNvZGUuXG4gKiBAcGFyYW0gZm9ybWF0IFRoZSBmb3JtYXQsIGB3aWRlYCBvciBgbmFycm93YC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICpcbiAqIEByZXR1cm5zIFRoZSBzeW1ib2wsIG9yIHRoZSBjdXJyZW5jeSBjb2RlIGlmIG5vIHN5bWJvbCBpcyBhdmFpbGFibGUuMFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW5jeVN5bWJvbChjb2RlOiBzdHJpbmcsIGZvcm1hdDogJ3dpZGUnIHwgJ25hcnJvdycsIGxvY2FsZSA9ICdlbicpOiBzdHJpbmcge1xuICBjb25zdCBjdXJyZW5jeSA9IGdldExvY2FsZUN1cnJlbmNpZXMobG9jYWxlKVtjb2RlXSB8fCBDVVJSRU5DSUVTX0VOW2NvZGVdIHx8IFtdO1xuICBjb25zdCBzeW1ib2xOYXJyb3cgPSBjdXJyZW5jeVvJtUN1cnJlbmN5SW5kZXguU3ltYm9sTmFycm93XTtcblxuICBpZiAoZm9ybWF0ID09PSAnbmFycm93JyAmJiB0eXBlb2Ygc3ltYm9sTmFycm93ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzeW1ib2xOYXJyb3c7XG4gIH1cblxuICByZXR1cm4gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4LlN5bWJvbF0gfHwgY29kZTtcbn1cblxuLy8gTW9zdCBjdXJyZW5jaWVzIGhhdmUgY2VudHMsIHRoYXQncyB3aHkgdGhlIGRlZmF1bHQgaXMgMlxuY29uc3QgREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFMgPSAyO1xuXG4vKipcbiAqIFJlcG9ydHMgdGhlIG51bWJlciBvZiBkZWNpbWFsIGRpZ2l0cyBmb3IgYSBnaXZlbiBjdXJyZW5jeS5cbiAqIFRoZSB2YWx1ZSBkZXBlbmRzIHVwb24gdGhlIHByZXNlbmNlIG9mIGNlbnRzIGluIHRoYXQgcGFydGljdWxhciBjdXJyZW5jeS5cbiAqXG4gKiBAcGFyYW0gY29kZSBUaGUgY3VycmVuY3kgY29kZS5cbiAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgZGVjaW1hbCBkaWdpdHMsIHR5cGljYWxseSAwIG9yIDIuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMoY29kZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGRpZ2l0cztcbiAgY29uc3QgY3VycmVuY3kgPSBDVVJSRU5DSUVTX0VOW2NvZGVdO1xuICBpZiAoY3VycmVuY3kpIHtcbiAgICBkaWdpdHMgPSBjdXJyZW5jeVvJtUN1cnJlbmN5SW5kZXguTmJPZkRpZ2l0c107XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBkaWdpdHMgPT09ICdudW1iZXInID8gZGlnaXRzIDogREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFM7XG59XG4iXX0=