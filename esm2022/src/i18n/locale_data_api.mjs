/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵfindLocaleData, ɵgetLocaleCurrencyCode, ɵgetLocalePluralCase, ɵLocaleDataIndex, } from '@angular/core';
import { CURRENCIES_EN } from './currencies';
/**
 * Format styles that can be used to represent numbers.
 * @see {@link getLocaleNumberFormat}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export var NumberFormatStyle;
(function (NumberFormatStyle) {
    NumberFormatStyle[NumberFormatStyle["Decimal"] = 0] = "Decimal";
    NumberFormatStyle[NumberFormatStyle["Percent"] = 1] = "Percent";
    NumberFormatStyle[NumberFormatStyle["Currency"] = 2] = "Currency";
    NumberFormatStyle[NumberFormatStyle["Scientific"] = 3] = "Scientific";
})(NumberFormatStyle || (NumberFormatStyle = {}));
/**
 * Plurality cases used for translating plurals to different languages.
 *
 * @see {@link NgPlural}
 * @see {@link NgPluralCase}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export var Plural;
(function (Plural) {
    Plural[Plural["Zero"] = 0] = "Zero";
    Plural[Plural["One"] = 1] = "One";
    Plural[Plural["Two"] = 2] = "Two";
    Plural[Plural["Few"] = 3] = "Few";
    Plural[Plural["Many"] = 4] = "Many";
    Plural[Plural["Other"] = 5] = "Other";
})(Plural || (Plural = {}));
/**
 * Context-dependant translation forms for strings.
 * Typically the standalone version is for the nominative form of the word,
 * and the format version is used for the genitive case.
 * @see [CLDR website](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles)
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export var FormStyle;
(function (FormStyle) {
    FormStyle[FormStyle["Format"] = 0] = "Format";
    FormStyle[FormStyle["Standalone"] = 1] = "Standalone";
})(FormStyle || (FormStyle = {}));
/**
 * String widths available for translations.
 * The specific character widths are locale-specific.
 * Examples are given for the word "Sunday" in English.
 *
 * @publicApi
 */
export var TranslationWidth;
(function (TranslationWidth) {
    /** 1 character for `en-US`. For example: 'S' */
    TranslationWidth[TranslationWidth["Narrow"] = 0] = "Narrow";
    /** 3 characters for `en-US`. For example: 'Sun' */
    TranslationWidth[TranslationWidth["Abbreviated"] = 1] = "Abbreviated";
    /** Full length for `en-US`. For example: "Sunday" */
    TranslationWidth[TranslationWidth["Wide"] = 2] = "Wide";
    /** 2 characters for `en-US`, For example: "Su" */
    TranslationWidth[TranslationWidth["Short"] = 3] = "Short";
})(TranslationWidth || (TranslationWidth = {}));
/**
 * String widths available for date-time formats.
 * The specific character widths are locale-specific.
 * Examples are given for `en-US`.
 *
 * @see {@link getLocaleDateFormat}
 * @see {@link getLocaleTimeFormat}
 * @see {@link getLocaleDateTimeFormat}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 * @publicApi
 */
export var FormatWidth;
(function (FormatWidth) {
    /**
     * For `en-US`, 'M/d/yy, h:mm a'`
     * (Example: `6/15/15, 9:03 AM`)
     */
    FormatWidth[FormatWidth["Short"] = 0] = "Short";
    /**
     * For `en-US`, `'MMM d, y, h:mm:ss a'`
     * (Example: `Jun 15, 2015, 9:03:01 AM`)
     */
    FormatWidth[FormatWidth["Medium"] = 1] = "Medium";
    /**
     * For `en-US`, `'MMMM d, y, h:mm:ss a z'`
     * (Example: `June 15, 2015 at 9:03:01 AM GMT+1`)
     */
    FormatWidth[FormatWidth["Long"] = 2] = "Long";
    /**
     * For `en-US`, `'EEEE, MMMM d, y, h:mm:ss a zzzz'`
     * (Example: `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00`)
     */
    FormatWidth[FormatWidth["Full"] = 3] = "Full";
})(FormatWidth || (FormatWidth = {}));
/**
 * Symbols that can be used to replace placeholders in number patterns.
 * Examples are based on `en-US` values.
 *
 * @see {@link getLocaleNumberSymbol}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export var NumberSymbol;
(function (NumberSymbol) {
    /**
     * Decimal separator.
     * For `en-US`, the dot character.
     * Example: 2,345`.`67
     */
    NumberSymbol[NumberSymbol["Decimal"] = 0] = "Decimal";
    /**
     * Grouping separator, typically for thousands.
     * For `en-US`, the comma character.
     * Example: 2`,`345.67
     */
    NumberSymbol[NumberSymbol["Group"] = 1] = "Group";
    /**
     * List-item separator.
     * Example: "one, two, and three"
     */
    NumberSymbol[NumberSymbol["List"] = 2] = "List";
    /**
     * Sign for percentage (out of 100).
     * Example: 23.4%
     */
    NumberSymbol[NumberSymbol["PercentSign"] = 3] = "PercentSign";
    /**
     * Sign for positive numbers.
     * Example: +23
     */
    NumberSymbol[NumberSymbol["PlusSign"] = 4] = "PlusSign";
    /**
     * Sign for negative numbers.
     * Example: -23
     */
    NumberSymbol[NumberSymbol["MinusSign"] = 5] = "MinusSign";
    /**
     * Computer notation for exponential value (n times a power of 10).
     * Example: 1.2E3
     */
    NumberSymbol[NumberSymbol["Exponential"] = 6] = "Exponential";
    /**
     * Human-readable format of exponential.
     * Example: 1.2x103
     */
    NumberSymbol[NumberSymbol["SuperscriptingExponent"] = 7] = "SuperscriptingExponent";
    /**
     * Sign for permille (out of 1000).
     * Example: 23.4‰
     */
    NumberSymbol[NumberSymbol["PerMille"] = 8] = "PerMille";
    /**
     * Infinity, can be used with plus and minus.
     * Example: ∞, +∞, -∞
     */
    NumberSymbol[NumberSymbol["Infinity"] = 9] = "Infinity";
    /**
     * Not a number.
     * Example: NaN
     */
    NumberSymbol[NumberSymbol["NaN"] = 10] = "NaN";
    /**
     * Symbol used between time units.
     * Example: 10:52
     */
    NumberSymbol[NumberSymbol["TimeSeparator"] = 11] = "TimeSeparator";
    /**
     * Decimal separator for currency values (fallback to `Decimal`).
     * Example: $2,345.67
     */
    NumberSymbol[NumberSymbol["CurrencyDecimal"] = 12] = "CurrencyDecimal";
    /**
     * Group separator for currency values (fallback to `Group`).
     * Example: $2,345.67
     */
    NumberSymbol[NumberSymbol["CurrencyGroup"] = 13] = "CurrencyGroup";
})(NumberSymbol || (NumberSymbol = {}));
/**
 * The value for each day of the week, based on the `en-US` locale
 *
 * @publicApi
 */
export var WeekDay;
(function (WeekDay) {
    WeekDay[WeekDay["Sunday"] = 0] = "Sunday";
    WeekDay[WeekDay["Monday"] = 1] = "Monday";
    WeekDay[WeekDay["Tuesday"] = 2] = "Tuesday";
    WeekDay[WeekDay["Wednesday"] = 3] = "Wednesday";
    WeekDay[WeekDay["Thursday"] = 4] = "Thursday";
    WeekDay[WeekDay["Friday"] = 5] = "Friday";
    WeekDay[WeekDay["Saturday"] = 6] = "Saturday";
})(WeekDay || (WeekDay = {}));
/**
 * Retrieves the locale ID from the currently loaded locale.
 * The loaded locale could be, for example, a global one rather than a regional one.
 * @param locale A locale code, such as `fr-FR`.
 * @returns The locale code. For example, `fr`.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleId(locale) {
    return ɵfindLocaleData(locale)[ɵLocaleDataIndex.LocaleId];
}
/**
 * Retrieves day period strings for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized period strings. For example, `[AM, PM]` for `en-US`.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    const amPmData = [
        data[ɵLocaleDataIndex.DayPeriodsFormat],
        data[ɵLocaleDataIndex.DayPeriodsStandalone],
    ];
    const amPm = getLastDefinedValue(amPmData, formStyle);
    return getLastDefinedValue(amPm, width);
}
/**
 * Retrieves days of the week for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,`[Sunday, Monday, ... Saturday]` for `en-US`.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDayNames(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    const daysData = [
        data[ɵLocaleDataIndex.DaysFormat],
        data[ɵLocaleDataIndex.DaysStandalone],
    ];
    const days = getLastDefinedValue(daysData, formStyle);
    return getLastDefinedValue(days, width);
}
/**
 * Retrieves months of the year for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,  `[January, February, ...]` for `en-US`.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    const monthsData = [
        data[ɵLocaleDataIndex.MonthsFormat],
        data[ɵLocaleDataIndex.MonthsStandalone],
    ];
    const months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Retrieves Gregorian-calendar eras for the given locale.
 * @param locale A locale code for the locale format rules to use.
 * @param width The required character width.

 * @returns An array of localized era strings.
 * For example, `[AD, BC]` for `en-US`.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleEraNames(locale, width) {
    const data = ɵfindLocaleData(locale);
    const erasData = data[ɵLocaleDataIndex.Eras];
    return getLastDefinedValue(erasData, width);
}
/**
 * Retrieves the first day of the week for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns A day index number, using the 0-based week-day index for `en-US`
 * (Sunday = 0, Monday = 1, ...).
 * For example, for `fr-FR`, returns 1 to indicate that the first day is Monday.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleFirstDayOfWeek(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.FirstDayOfWeek];
}
/**
 * Range of week days that are considered the week-end for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The range of day values, `[startDay, endDay]`.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleWeekEndRange(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.WeekendRange];
}
/**
 * Retrieves a localized date-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDateFormat(locale, width) {
    const data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.DateFormat], width);
}
/**
 * Retrieves a localized time-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)

 * @publicApi
 */
export function getLocaleTimeFormat(locale, width) {
    const data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.TimeFormat], width);
}
/**
 * Retrieves a localized date-time formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleDateTimeFormat(locale, width) {
    const data = ɵfindLocaleData(locale);
    const dateTimeFormatData = data[ɵLocaleDataIndex.DateTimeFormat];
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Retrieves a localized number symbol that can be used to replace placeholders in number formats.
 * @param locale The locale code.
 * @param symbol The symbol to localize.
 * @returns The character for the localized symbol.
 * @see {@link NumberSymbol}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleNumberSymbol(locale, symbol) {
    const data = ɵfindLocaleData(locale);
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
 * @param locale A locale code for the locale format rules to use.
 * @param type The type of numeric value to be formatted (such as `Decimal` or `Currency`.)
 * @returns The localized format string.
 * @see {@link NumberFormatStyle}
 * @see [CLDR website](http://cldr.unicode.org/translation/number-patterns)
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleNumberFormat(locale, type) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.NumberFormats][type];
}
/**
 * Retrieves the symbol used to represent the currency for the main country
 * corresponding to a given locale. For example, '$' for `en-US`.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The localized symbol character,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleCurrencySymbol(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencySymbol] || null;
}
/**
 * Retrieves the name of the currency for the main country corresponding
 * to a given locale. For example, 'US Dollar' for `en-US`.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency name,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleCurrencyName(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencyName] || null;
}
/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 * @publicApi
 */
export function getLocaleCurrencyCode(locale) {
    return ɵgetLocaleCurrencyCode(locale);
}
/**
 * Retrieves the currency values for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency values.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 */
function getLocaleCurrencies(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.Currencies];
}
/**
 * @alias core/ɵgetLocalePluralCase
 * @publicApi
 */
export const getLocalePluralCase = ɵgetLocalePluralCase;
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
 * See the ["I18n guide"](guide/i18n-common-format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The rules for the locale, a single time value or array of *from-time, to-time*,
 * or null if no periods are available.
 *
 * @see {@link getLocaleExtraDayPeriods}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriodRules(locale) {
    const data = ɵfindLocaleData(locale);
    checkFullData(data);
    const rules = data[ɵLocaleDataIndex.ExtraData][2 /* ɵExtraLocaleDataIndex.ExtraDayPeriodsRules */] || [];
    return rules.map((rule) => {
        if (typeof rule === 'string') {
            return extractTime(rule);
        }
        return [extractTime(rule[0]), extractTime(rule[1])];
    });
}
/**
 * Retrieves locale-specific day periods, which indicate roughly how a day is broken up
 * in different languages.
 * For example, for `en-US`, periods are morning, noon, afternoon, evening, and midnight.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n-common-format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns The translated day-period strings.
 * @see {@link getLocaleExtraDayPeriodRules}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    checkFullData(data);
    const dayPeriodsData = [
        data[ɵLocaleDataIndex.ExtraData][0 /* ɵExtraLocaleDataIndex.ExtraDayPeriodFormats */],
        data[ɵLocaleDataIndex.ExtraData][1 /* ɵExtraLocaleDataIndex.ExtraDayPeriodStandalone */],
    ];
    const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Retrieves the writing direction of a specified locale
 * @param locale A locale code for the locale format rules to use.
 * @publicApi
 * @returns 'rtl' or 'ltr'
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 */
export function getLocaleDirection(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.Directionality];
}
/**
 * Retrieves the first value that is defined in an array, going backwards from an index position.
 *
 * To avoid repeating the same data (as when the "format" and "standalone" forms are the same)
 * add the first value to the locale data arrays, and add other values only if they are different.
 *
 * @param data The data array to retrieve from.
 * @param index A 0-based index into the array to start from.
 * @returns The value immediately before the given index position.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
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
 * @param code The currency code.
 * @param format The format, `wide` or `narrow`.
 * @param locale A locale code for the locale format rules to use.
 *
 * @returns The symbol, or the currency code if no symbol is available.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getCurrencySymbol(code, format, locale = 'en') {
    const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    const symbolNarrow = currency[1 /* ɵCurrencyIndex.SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* ɵCurrencyIndex.Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Reports the number of decimal digits for a given currency.
 * The value depends upon the presence of cents in that particular currency.
 *
 * @param code The currency code.
 * @returns The number of decimal digits, typically 0 or 2.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function getNumberOfCurrencyDigits(code) {
    let digits;
    const currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* ɵCurrencyIndex.NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBR0wsZUFBZSxFQUNmLHNCQUFzQixFQUN0QixvQkFBb0IsRUFDcEIsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxhQUFhLEVBQW9CLE1BQU0sY0FBYyxDQUFDO0FBRTlEOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBTixJQUFZLGlCQUtYO0FBTEQsV0FBWSxpQkFBaUI7SUFDM0IsK0RBQU8sQ0FBQTtJQUNQLCtEQUFPLENBQUE7SUFDUCxpRUFBUSxDQUFBO0lBQ1IscUVBQVUsQ0FBQTtBQUNaLENBQUMsRUFMVyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBSzVCO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQU4sSUFBWSxNQU9YO0FBUEQsV0FBWSxNQUFNO0lBQ2hCLG1DQUFRLENBQUE7SUFDUixpQ0FBTyxDQUFBO0lBQ1AsaUNBQU8sQ0FBQTtJQUNQLGlDQUFPLENBQUE7SUFDUCxtQ0FBUSxDQUFBO0lBQ1IscUNBQVMsQ0FBQTtBQUNYLENBQUMsRUFQVyxNQUFNLEtBQU4sTUFBTSxRQU9qQjtBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFOLElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQiw2Q0FBTSxDQUFBO0lBQ04scURBQVUsQ0FBQTtBQUNaLENBQUMsRUFIVyxTQUFTLEtBQVQsU0FBUyxRQUdwQjtBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBTixJQUFZLGdCQVNYO0FBVEQsV0FBWSxnQkFBZ0I7SUFDMUIsZ0RBQWdEO0lBQ2hELDJEQUFNLENBQUE7SUFDTixtREFBbUQ7SUFDbkQscUVBQVcsQ0FBQTtJQUNYLHFE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LEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixPQUFPLEVBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDO0FBQ2xDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsTUFBeUIsRUFBRSxNQUFNLEdBQUcsSUFBSTtJQUN0RixNQUFNLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hGLE1BQU0sWUFBWSxHQUFHLFFBQVEscUNBQTZCLENBQUM7SUFFM0QsSUFBSSxNQUFNLEtBQUssUUFBUSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzVELE9BQU8sWUFBWSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxPQUFPLFFBQVEsK0JBQXVCLElBQUksSUFBSSxDQUFDO0FBQ2pELENBQUM7QUFFRCwwREFBMEQ7QUFDMUQsTUFBTSw2QkFBNkIsR0FBRyxDQUFDLENBQUM7QUFFeEM7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUFDLElBQVk7SUFDcEQsSUFBSSxNQUFNLENBQUM7SUFDWCxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLE1BQU0sR0FBRyxRQUFRLG1DQUEyQixDQUFDO0lBQy9DLENBQUM7SUFDRCxPQUFPLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQztBQUM3RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIMm1Q3VycmVuY3lJbmRleCxcbiAgybVFeHRyYUxvY2FsZURhdGFJbmRleCxcbiAgybVmaW5kTG9jYWxlRGF0YSxcbiAgybVnZXRMb2NhbGVDdXJyZW5jeUNvZGUsXG4gIMm1Z2V0TG9jYWxlUGx1cmFsQ2FzZSxcbiAgybVMb2NhbGVEYXRhSW5kZXgsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0NVUlJFTkNJRVNfRU4sIEN1cnJlbmNpZXNTeW1ib2xzfSBmcm9tICcuL2N1cnJlbmNpZXMnO1xuXG4vKipcbiAqIEZvcm1hdCBzdHlsZXMgdGhhdCBjYW4gYmUgdXNlZCB0byByZXByZXNlbnQgbnVtYmVycy5cbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZU51bWJlckZvcm1hdH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBOdW1iZXJGb3JtYXRTdHlsZSB7XG4gIERlY2ltYWwsXG4gIFBlcmNlbnQsXG4gIEN1cnJlbmN5LFxuICBTY2llbnRpZmljLFxufVxuXG4vKipcbiAqIFBsdXJhbGl0eSBjYXNlcyB1c2VkIGZvciB0cmFuc2xhdGluZyBwbHVyYWxzIHRvIGRpZmZlcmVudCBsYW5ndWFnZXMuXG4gKlxuICogQHNlZSB7QGxpbmsgTmdQbHVyYWx9XG4gKiBAc2VlIHtAbGluayBOZ1BsdXJhbENhc2V9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gUGx1cmFsIHtcbiAgWmVybyA9IDAsXG4gIE9uZSA9IDEsXG4gIFR3byA9IDIsXG4gIEZldyA9IDMsXG4gIE1hbnkgPSA0LFxuICBPdGhlciA9IDUsXG59XG5cbi8qKlxuICogQ29udGV4dC1kZXBlbmRhbnQgdHJhbnNsYXRpb24gZm9ybXMgZm9yIHN0cmluZ3MuXG4gKiBUeXBpY2FsbHkgdGhlIHN0YW5kYWxvbmUgdmVyc2lvbiBpcyBmb3IgdGhlIG5vbWluYXRpdmUgZm9ybSBvZiB0aGUgd29yZCxcbiAqIGFuZCB0aGUgZm9ybWF0IHZlcnNpb24gaXMgdXNlZCBmb3IgdGhlIGdlbml0aXZlIGNhc2UuXG4gKiBAc2VlIFtDTERSIHdlYnNpdGVdKGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL2RhdGUtdGltZS0xL2RhdGUtdGltZSNUT0MtU3RhbmRhbG9uZS12cy4tRm9ybWF0LVN0eWxlcylcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBGb3JtU3R5bGUge1xuICBGb3JtYXQsXG4gIFN0YW5kYWxvbmUsXG59XG5cbi8qKlxuICogU3RyaW5nIHdpZHRocyBhdmFpbGFibGUgZm9yIHRyYW5zbGF0aW9ucy5cbiAqIFRoZSBzcGVjaWZpYyBjaGFyYWN0ZXIgd2lkdGhzIGFyZSBsb2NhbGUtc3BlY2lmaWMuXG4gKiBFeGFtcGxlcyBhcmUgZ2l2ZW4gZm9yIHRoZSB3b3JkIFwiU3VuZGF5XCIgaW4gRW5nbGlzaC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIFRyYW5zbGF0aW9uV2lkdGgge1xuICAvKiogMSBjaGFyYWN0ZXIgZm9yIGBlbi1VU2AuIEZvciBleGFtcGxlOiAnUycgKi9cbiAgTmFycm93LFxuICAvKiogMyBjaGFyYWN0ZXJzIGZvciBgZW4tVVNgLiBGb3IgZXhhbXBsZTogJ1N1bicgKi9cbiAgQWJicmV2aWF0ZWQsXG4gIC8qKiBGdWxsIGxlbmd0aCBmb3IgYGVuLVVTYC4gRm9yIGV4YW1wbGU6IFwiU3VuZGF5XCIgKi9cbiAgV2lkZSxcbiAgLyoqIDIgY2hhcmFjdGVycyBmb3IgYGVuLVVTYCwgRm9yIGV4YW1wbGU6IFwiU3VcIiAqL1xuICBTaG9ydCxcbn1cblxuLyoqXG4gKiBTdHJpbmcgd2lkdGhzIGF2YWlsYWJsZSBmb3IgZGF0ZS10aW1lIGZvcm1hdHMuXG4gKiBUaGUgc3BlY2lmaWMgY2hhcmFjdGVyIHdpZHRocyBhcmUgbG9jYWxlLXNwZWNpZmljLlxuICogRXhhbXBsZXMgYXJlIGdpdmVuIGZvciBgZW4tVVNgLlxuICpcbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZURhdGVGb3JtYXR9XG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVUaW1lRm9ybWF0fVxuICogQHNlZSB7QGxpbmsgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXR9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBGb3JtYXRXaWR0aCB7XG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgJ00vZC95eSwgaDptbSBhJ2BcbiAgICogKEV4YW1wbGU6IGA2LzE1LzE1LCA5OjAzIEFNYClcbiAgICovXG4gIFNob3J0LFxuICAvKipcbiAgICogRm9yIGBlbi1VU2AsIGAnTU1NIGQsIHksIGg6bW06c3MgYSdgXG4gICAqIChFeGFtcGxlOiBgSnVuIDE1LCAyMDE1LCA5OjAzOjAxIEFNYClcbiAgICovXG4gIE1lZGl1bSxcbiAgLyoqXG4gICAqIEZvciBgZW4tVVNgLCBgJ01NTU0gZCwgeSwgaDptbTpzcyBhIHonYFxuICAgKiAoRXhhbXBsZTogYEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMWApXG4gICAqL1xuICBMb25nLFxuICAvKipcbiAgICogRm9yIGBlbi1VU2AsIGAnRUVFRSwgTU1NTSBkLCB5LCBoOm1tOnNzIGEgenp6eidgXG4gICAqIChFeGFtcGxlOiBgTW9uZGF5LCBKdW5lIDE1LCAyMDE1IGF0IDk6MDM6MDEgQU0gR01UKzAxOjAwYClcbiAgICovXG4gIEZ1bGwsXG59XG5cbi8qKlxuICogU3ltYm9scyB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIG51bWJlciBwYXR0ZXJucy5cbiAqIEV4YW1wbGVzIGFyZSBiYXNlZCBvbiBgZW4tVVNgIHZhbHVlcy5cbiAqXG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVOdW1iZXJTeW1ib2x9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gTnVtYmVyU3ltYm9sIHtcbiAgLyoqXG4gICAqIERlY2ltYWwgc2VwYXJhdG9yLlxuICAgKiBGb3IgYGVuLVVTYCwgdGhlIGRvdCBjaGFyYWN0ZXIuXG4gICAqIEV4YW1wbGU6IDIsMzQ1YC5gNjdcbiAgICovXG4gIERlY2ltYWwsXG4gIC8qKlxuICAgKiBHcm91cGluZyBzZXBhcmF0b3IsIHR5cGljYWxseSBmb3IgdGhvdXNhbmRzLlxuICAgKiBGb3IgYGVuLVVTYCwgdGhlIGNvbW1hIGNoYXJhY3Rlci5cbiAgICogRXhhbXBsZTogMmAsYDM0NS42N1xuICAgKi9cbiAgR3JvdXAsXG4gIC8qKlxuICAgKiBMaXN0LWl0ZW0gc2VwYXJhdG9yLlxuICAgKiBFeGFtcGxlOiBcIm9uZSwgdHdvLCBhbmQgdGhyZWVcIlxuICAgKi9cbiAgTGlzdCxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcmNlbnRhZ2UgKG91dCBvZiAxMDApLlxuICAgKiBFeGFtcGxlOiAyMy40JVxuICAgKi9cbiAgUGVyY2VudFNpZ24sXG4gIC8qKlxuICAgKiBTaWduIGZvciBwb3NpdGl2ZSBudW1iZXJzLlxuICAgKiBFeGFtcGxlOiArMjNcbiAgICovXG4gIFBsdXNTaWduLFxuICAvKipcbiAgICogU2lnbiBmb3IgbmVnYXRpdmUgbnVtYmVycy5cbiAgICogRXhhbXBsZTogLTIzXG4gICAqL1xuICBNaW51c1NpZ24sXG4gIC8qKlxuICAgKiBDb21wdXRlciBub3RhdGlvbiBmb3IgZXhwb25lbnRpYWwgdmFsdWUgKG4gdGltZXMgYSBwb3dlciBvZiAxMCkuXG4gICAqIEV4YW1wbGU6IDEuMkUzXG4gICAqL1xuICBFeHBvbmVudGlhbCxcbiAgLyoqXG4gICAqIEh1bWFuLXJlYWRhYmxlIGZvcm1hdCBvZiBleHBvbmVudGlhbC5cbiAgICogRXhhbXBsZTogMS4yeDEwM1xuICAgKi9cbiAgU3VwZXJzY3JpcHRpbmdFeHBvbmVudCxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcm1pbGxlIChvdXQgb2YgMTAwMCkuXG4gICAqIEV4YW1wbGU6IDIzLjTigLBcbiAgICovXG4gIFBlck1pbGxlLFxuICAvKipcbiAgICogSW5maW5pdHksIGNhbiBiZSB1c2VkIHdpdGggcGx1cyBhbmQgbWludXMuXG4gICAqIEV4YW1wbGU6IOKIniwgK+KIniwgLeKInlxuICAgKi9cbiAgSW5maW5pdHksXG4gIC8qKlxuICAgKiBOb3QgYSBudW1iZXIuXG4gICAqIEV4YW1wbGU6IE5hTlxuICAgKi9cbiAgTmFOLFxuICAvKipcbiAgICogU3ltYm9sIHVzZWQgYmV0d2VlbiB0aW1lIHVuaXRzLlxuICAgKiBFeGFtcGxlOiAxMDo1MlxuICAgKi9cbiAgVGltZVNlcGFyYXRvcixcbiAgLyoqXG4gICAqIERlY2ltYWwgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBEZWNpbWFsYCkuXG4gICAqIEV4YW1wbGU6ICQyLDM0NS42N1xuICAgKi9cbiAgQ3VycmVuY3lEZWNpbWFsLFxuICAvKipcbiAgICogR3JvdXAgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBHcm91cGApLlxuICAgKiBFeGFtcGxlOiAkMiwzNDUuNjdcbiAgICovXG4gIEN1cnJlbmN5R3JvdXAsXG59XG5cbi8qKlxuICogVGhlIHZhbHVlIGZvciBlYWNoIGRheSBvZiB0aGUgd2VlaywgYmFzZWQgb24gdGhlIGBlbi1VU2AgbG9jYWxlXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcbiAgU3VuZGF5ID0gMCxcbiAgTW9uZGF5LFxuICBUdWVzZGF5LFxuICBXZWRuZXNkYXksXG4gIFRodXJzZGF5LFxuICBGcmlkYXksXG4gIFNhdHVyZGF5LFxufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbG9jYWxlIElEIGZyb20gdGhlIGN1cnJlbnRseSBsb2FkZWQgbG9jYWxlLlxuICogVGhlIGxvYWRlZCBsb2NhbGUgY291bGQgYmUsIGZvciBleGFtcGxlLCBhIGdsb2JhbCBvbmUgcmF0aGVyIHRoYW4gYSByZWdpb25hbCBvbmUuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUsIHN1Y2ggYXMgYGZyLUZSYC5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGUgY29kZS4gRm9yIGV4YW1wbGUsIGBmcmAuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUlkKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIMm1ZmluZExvY2FsZURhdGEobG9jYWxlKVvJtUxvY2FsZURhdGFJbmRleC5Mb2NhbGVJZF07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGRheSBwZXJpb2Qgc3RyaW5ncyBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGxvY2FsaXplZCBwZXJpb2Qgc3RyaW5ncy4gRm9yIGV4YW1wbGUsIGBbQU0sIFBNXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURheVBlcmlvZHMoXG4gIGxvY2FsZTogc3RyaW5nLFxuICBmb3JtU3R5bGU6IEZvcm1TdHlsZSxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4pOiBSZWFkb25seTxbc3RyaW5nLCBzdHJpbmddPiB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGFtUG1EYXRhID0gPFtzdHJpbmcsIHN0cmluZ11bXVtdPltcbiAgICBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRheVBlcmlvZHNGb3JtYXRdLFxuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5UGVyaW9kc1N0YW5kYWxvbmVdLFxuICBdO1xuICBjb25zdCBhbVBtID0gZ2V0TGFzdERlZmluZWRWYWx1ZShhbVBtRGF0YSwgZm9ybVN0eWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoYW1QbSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBkYXlzIG9mIHRoZSB3ZWVrIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLCB1c2luZyB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIG5hbWUgc3RyaW5ncy5cbiAqIEZvciBleGFtcGxlLGBbU3VuZGF5LCBNb25kYXksIC4uLiBTYXR1cmRheV1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXSgvZ3VpZGUvaTE4bi1vdmVydmlldylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXlOYW1lcyhcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIGZvcm1TdHlsZTogRm9ybVN0eWxlLFxuICB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCxcbik6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRheXNEYXRhID0gPHN0cmluZ1tdW11bXT5bXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXlzRm9ybWF0XSxcbiAgICBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRheXNTdGFuZGFsb25lXSxcbiAgXTtcbiAgY29uc3QgZGF5cyA9IGdldExhc3REZWZpbmVkVmFsdWUoZGF5c0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXMsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgbW9udGhzIG9mIHRoZSB5ZWFyIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLCB1c2luZyB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIG5hbWUgc3RyaW5ncy5cbiAqIEZvciBleGFtcGxlLCAgYFtKYW51YXJ5LCBGZWJydWFyeSwgLi4uXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU1vbnRoTmFtZXMoXG4gIGxvY2FsZTogc3RyaW5nLFxuICBmb3JtU3R5bGU6IEZvcm1TdHlsZSxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4pOiBSZWFkb25seUFycmF5PHN0cmluZz4ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBtb250aHNEYXRhID0gPHN0cmluZ1tdW11bXT5bXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5Nb250aHNGb3JtYXRdLFxuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTW9udGhzU3RhbmRhbG9uZV0sXG4gIF07XG4gIGNvbnN0IG1vbnRocyA9IGdldExhc3REZWZpbmVkVmFsdWUobW9udGhzRGF0YSwgZm9ybVN0eWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUobW9udGhzLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIEdyZWdvcmlhbi1jYWxlbmRhciBlcmFzIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cblxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIGVyYSBzdHJpbmdzLlxuICogRm9yIGV4YW1wbGUsIGBbQUQsIEJDXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUVyYU5hbWVzKFxuICBsb2NhbGU6IHN0cmluZyxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4pOiBSZWFkb25seTxbc3RyaW5nLCBzdHJpbmddPiB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGVyYXNEYXRhID0gPFtzdHJpbmcsIHN0cmluZ11bXT5kYXRhW8m1TG9jYWxlRGF0YUluZGV4LkVyYXNdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShlcmFzRGF0YSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgQSBkYXkgaW5kZXggbnVtYmVyLCB1c2luZyB0aGUgMC1iYXNlZCB3ZWVrLWRheSBpbmRleCBmb3IgYGVuLVVTYFxuICogKFN1bmRheSA9IDAsIE1vbmRheSA9IDEsIC4uLikuXG4gKiBGb3IgZXhhbXBsZSwgZm9yIGBmci1GUmAsIHJldHVybnMgMSB0byBpbmRpY2F0ZSB0aGF0IHRoZSBmaXJzdCBkYXkgaXMgTW9uZGF5LlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXSgvZ3VpZGUvaTE4bi1vdmVydmlldylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVGaXJzdERheU9mV2Vlayhsb2NhbGU6IHN0cmluZyk6IFdlZWtEYXkge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5GaXJzdERheU9mV2Vla107XG59XG5cbi8qKlxuICogUmFuZ2Ugb2Ygd2VlayBkYXlzIHRoYXQgYXJlIGNvbnNpZGVyZWQgdGhlIHdlZWstZW5kIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIHJhbmdlIG9mIGRheSB2YWx1ZXMsIGBbc3RhcnREYXksIGVuZERheV1gLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXSgvZ3VpZGUvaTE4bi1vdmVydmlldylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVXZWVrRW5kUmFuZ2UobG9jYWxlOiBzdHJpbmcpOiBbV2Vla0RheSwgV2Vla0RheV0ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5XZWVrZW5kUmFuZ2VdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCBkYXRlLXZhbHVlIGZvcm1hdHRpbmcgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHdpZHRoIFRoZSBmb3JtYXQgdHlwZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgZm9ybWF0dGluZyBzdHJpbmcuXG4gKiBAc2VlIHtAbGluayBGb3JtYXRXaWR0aH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGU6IHN0cmluZywgd2lkdGg6IEZvcm1hdFdpZHRoKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXRlRm9ybWF0XSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCB0aW1lLXZhbHVlIGZvcm1hdHRpbmcgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHdpZHRoIFRoZSBmb3JtYXQgdHlwZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgZm9ybWF0dGluZyBzdHJpbmcuXG4gKiBAc2VlIHtAbGluayBGb3JtYXRXaWR0aH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGFbybVMb2NhbGVEYXRhSW5kZXguVGltZUZvcm1hdF0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgZGF0ZS10aW1lIGZvcm1hdHRpbmcgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHdpZHRoIFRoZSBmb3JtYXQgdHlwZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgZm9ybWF0dGluZyBzdHJpbmcuXG4gKiBAc2VlIHtAbGluayBGb3JtYXRXaWR0aH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRhdGVUaW1lRm9ybWF0RGF0YSA9IDxzdHJpbmdbXT5kYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRhdGVUaW1lRm9ybWF0XTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0ZVRpbWVGb3JtYXREYXRhLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIG51bWJlciBzeW1ib2wgdGhhdCBjYW4gYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBudW1iZXIgZm9ybWF0cy5cbiAqIEBwYXJhbSBsb2NhbGUgVGhlIGxvY2FsZSBjb2RlLlxuICogQHBhcmFtIHN5bWJvbCBUaGUgc3ltYm9sIHRvIGxvY2FsaXplLlxuICogQHJldHVybnMgVGhlIGNoYXJhY3RlciBmb3IgdGhlIGxvY2FsaXplZCBzeW1ib2wuXG4gKiBAc2VlIHtAbGluayBOdW1iZXJTeW1ib2x9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGU6IHN0cmluZywgc3ltYm9sOiBOdW1iZXJTeW1ib2wpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCByZXMgPSBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW3N5bWJvbF07XG4gIGlmICh0eXBlb2YgcmVzID09PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChzeW1ib2wgPT09IE51bWJlclN5bWJvbC5DdXJyZW5jeURlY2ltYWwpIHtcbiAgICAgIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW051bWJlclN5bWJvbC5EZWNpbWFsXTtcbiAgICB9IGVsc2UgaWYgKHN5bWJvbCA9PT0gTnVtYmVyU3ltYm9sLkN1cnJlbmN5R3JvdXApIHtcbiAgICAgIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW051bWJlclN5bWJvbC5Hcm91cF07XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbnVtYmVyIGZvcm1hdCBmb3IgYSBnaXZlbiBsb2NhbGUuXG4gKlxuICogTnVtYmVycyBhcmUgZm9ybWF0dGVkIHVzaW5nIHBhdHRlcm5zLCBsaWtlIGAjLCMjIy4wMGAuIEZvciBleGFtcGxlLCB0aGUgcGF0dGVybiBgIywjIyMuMDBgXG4gKiB3aGVuIHVzZWQgdG8gZm9ybWF0IHRoZSBudW1iZXIgMTIzNDUuNjc4IGNvdWxkIHJlc3VsdCBpbiBcIjEyJzM0NSw2NzhcIi4gVGhhdCB3b3VsZCBoYXBwZW4gaWYgdGhlXG4gKiBncm91cGluZyBzZXBhcmF0b3IgZm9yIHlvdXIgbGFuZ3VhZ2UgaXMgYW4gYXBvc3Ryb3BoZSwgYW5kIHRoZSBkZWNpbWFsIHNlcGFyYXRvciBpcyBhIGNvbW1hLlxuICpcbiAqIDxiPkltcG9ydGFudDo8L2I+IFRoZSBjaGFyYWN0ZXJzIGAuYCBgLGAgYDBgIGAjYCAoYW5kIG90aGVycyBiZWxvdykgYXJlIHNwZWNpYWwgcGxhY2Vob2xkZXJzXG4gKiB0aGF0IHN0YW5kIGZvciB0aGUgZGVjaW1hbCBzZXBhcmF0b3IsIGFuZCBzbyBvbiwgYW5kIGFyZSBOT1QgcmVhbCBjaGFyYWN0ZXJzLlxuICogWW91IG11c3QgTk9UIFwidHJhbnNsYXRlXCIgdGhlIHBsYWNlaG9sZGVycy4gRm9yIGV4YW1wbGUsIGRvbid0IGNoYW5nZSBgLmAgdG8gYCxgIGV2ZW4gdGhvdWdoIGluXG4gKiB5b3VyIGxhbmd1YWdlIHRoZSBkZWNpbWFsIHBvaW50IGlzIHdyaXR0ZW4gd2l0aCBhIGNvbW1hLiBUaGUgc3ltYm9scyBzaG91bGQgYmUgcmVwbGFjZWQgYnkgdGhlXG4gKiBsb2NhbCBlcXVpdmFsZW50cywgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIGBOdW1iZXJTeW1ib2xgIGZvciB5b3VyIGxhbmd1YWdlLlxuICpcbiAqIEhlcmUgYXJlIHRoZSBzcGVjaWFsIGNoYXJhY3RlcnMgdXNlZCBpbiBudW1iZXIgcGF0dGVybnM6XG4gKlxuICogfCBTeW1ib2wgfCBNZWFuaW5nIHxcbiAqIHwtLS0tLS0tLXwtLS0tLS0tLS18XG4gKiB8IC4gfCBSZXBsYWNlZCBhdXRvbWF0aWNhbGx5IGJ5IHRoZSBjaGFyYWN0ZXIgdXNlZCBmb3IgdGhlIGRlY2ltYWwgcG9pbnQuIHxcbiAqIHwgLCB8IFJlcGxhY2VkIGJ5IHRoZSBcImdyb3VwaW5nXCIgKHRob3VzYW5kcykgc2VwYXJhdG9yLiB8XG4gKiB8IDAgfCBSZXBsYWNlZCBieSBhIGRpZ2l0IChvciB6ZXJvIGlmIHRoZXJlIGFyZW4ndCBlbm91Z2ggZGlnaXRzKS4gfFxuICogfCAjIHwgUmVwbGFjZWQgYnkgYSBkaWdpdCAob3Igbm90aGluZyBpZiB0aGVyZSBhcmVuJ3QgZW5vdWdoKS4gfFxuICogfCDCpCB8IFJlcGxhY2VkIGJ5IGEgY3VycmVuY3kgc3ltYm9sLCBzdWNoIGFzICQgb3IgVVNELiB8XG4gKiB8ICUgfCBNYXJrcyBhIHBlcmNlbnQgZm9ybWF0LiBUaGUgJSBzeW1ib2wgbWF5IGNoYW5nZSBwb3NpdGlvbiwgYnV0IG11c3QgYmUgcmV0YWluZWQuIHxcbiAqIHwgRSB8IE1hcmtzIGEgc2NpZW50aWZpYyBmb3JtYXQuIFRoZSBFIHN5bWJvbCBtYXkgY2hhbmdlIHBvc2l0aW9uLCBidXQgbXVzdCBiZSByZXRhaW5lZC4gfFxuICogfCAnIHwgU3BlY2lhbCBjaGFyYWN0ZXJzIHVzZWQgYXMgbGl0ZXJhbCBjaGFyYWN0ZXJzIGFyZSBxdW90ZWQgd2l0aCBBU0NJSSBzaW5nbGUgcXVvdGVzLiB8XG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBudW1lcmljIHZhbHVlIHRvIGJlIGZvcm1hdHRlZCAoc3VjaCBhcyBgRGVjaW1hbGAgb3IgYEN1cnJlbmN5YC4pXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdCBzdHJpbmcuXG4gKiBAc2VlIHtAbGluayBOdW1iZXJGb3JtYXRTdHlsZX1cbiAqIEBzZWUgW0NMRFIgd2Vic2l0ZV0oaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vbnVtYmVyLXBhdHRlcm5zKVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXSgvZ3VpZGUvaTE4bi1vdmVydmlldylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVOdW1iZXJGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHR5cGU6IE51bWJlckZvcm1hdFN0eWxlKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTnVtYmVyRm9ybWF0c11bdHlwZV07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBzeW1ib2wgdXNlZCB0byByZXByZXNlbnQgdGhlIGN1cnJlbmN5IGZvciB0aGUgbWFpbiBjb3VudHJ5XG4gKiBjb3JyZXNwb25kaW5nIHRvIGEgZ2l2ZW4gbG9jYWxlLiBGb3IgZXhhbXBsZSwgJyQnIGZvciBgZW4tVVNgLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBzeW1ib2wgY2hhcmFjdGVyLFxuICogb3IgYG51bGxgIGlmIHRoZSBtYWluIGNvdW50cnkgY2Fubm90IGJlIGRldGVybWluZWQuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUN1cnJlbmN5U3ltYm9sKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5U3ltYm9sXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGUgY3VycmVuY3kgZm9yIHRoZSBtYWluIGNvdW50cnkgY29ycmVzcG9uZGluZ1xuICogdG8gYSBnaXZlbiBsb2NhbGUuIEZvciBleGFtcGxlLCAnVVMgRG9sbGFyJyBmb3IgYGVuLVVTYC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIGN1cnJlbmN5IG5hbWUsXG4gKiBvciBgbnVsbGAgaWYgdGhlIG1haW4gY291bnRyeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY3lOYW1lKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5TmFtZV0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGRlZmF1bHQgY3VycmVuY3kgY29kZSBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBUaGUgZGVmYXVsdCBpcyBkZWZpbmVkIGFzIHRoZSBmaXJzdCBjdXJyZW5jeSB3aGljaCBpcyBzdGlsbCBpbiB1c2UuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBUaGUgY29kZSBvZiB0aGUgbG9jYWxlIHdob3NlIGN1cnJlbmN5IGNvZGUgd2Ugd2FudC5cbiAqIEByZXR1cm5zIFRoZSBjb2RlIG9mIHRoZSBkZWZhdWx0IGN1cnJlbmN5IGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUN1cnJlbmN5Q29kZShsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICByZXR1cm4gybVnZXRMb2NhbGVDdXJyZW5jeUNvZGUobG9jYWxlKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbmN5IHZhbHVlcyBmb3IgYSBnaXZlbiBsb2NhbGUuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBjdXJyZW5jeSB2YWx1ZXMuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICovXG5mdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jaWVzKGxvY2FsZTogc3RyaW5nKToge1tjb2RlOiBzdHJpbmddOiBDdXJyZW5jaWVzU3ltYm9sc30ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5DdXJyZW5jaWVzXTtcbn1cblxuLyoqXG4gKiBAYWxpYXMgY29yZS/JtWdldExvY2FsZVBsdXJhbENhc2VcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IGdldExvY2FsZVBsdXJhbENhc2U6IChsb2NhbGU6IHN0cmluZykgPT4gKHZhbHVlOiBudW1iZXIpID0+IFBsdXJhbCA9XG4gIMm1Z2V0TG9jYWxlUGx1cmFsQ2FzZTtcblxuZnVuY3Rpb24gY2hlY2tGdWxsRGF0YShkYXRhOiBhbnkpIHtcbiAgaWYgKCFkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgTWlzc2luZyBleHRyYSBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7XG4gICAgICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdXG4gICAgICB9XCIuIFVzZSBcInJlZ2lzdGVyTG9jYWxlRGF0YVwiIHRvIGxvYWQgbmV3IGRhdGEuIFNlZSB0aGUgXCJJMThuIGd1aWRlXCIgb24gYW5ndWxhci5pbyB0byBrbm93IG1vcmUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGxvY2FsZS1zcGVjaWZpYyBydWxlcyB1c2VkIHRvIGRldGVybWluZSB3aGljaCBkYXkgcGVyaW9kIHRvIHVzZVxuICogd2hlbiBtb3JlIHRoYW4gb25lIHBlcmlvZCBpcyBkZWZpbmVkIGZvciBhIGxvY2FsZS5cbiAqXG4gKiBUaGVyZSBpcyBhIHJ1bGUgZm9yIGVhY2ggZGVmaW5lZCBkYXkgcGVyaW9kLiBUaGVcbiAqIGZpcnN0IHJ1bGUgaXMgYXBwbGllZCB0byB0aGUgZmlyc3QgZGF5IHBlcmlvZCBhbmQgc28gb24uXG4gKiBGYWxsIGJhY2sgdG8gQU0vUE0gd2hlbiBubyBydWxlcyBhcmUgYXZhaWxhYmxlLlxuICpcbiAqIEEgcnVsZSBjYW4gc3BlY2lmeSBhIHBlcmlvZCBhcyB0aW1lIHJhbmdlLCBvciBhcyBhIHNpbmdsZSB0aW1lIHZhbHVlLlxuICpcbiAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHlvdSBoYXZlIGxvYWRlZCB0aGUgZnVsbCBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW1wiSTE4biBndWlkZVwiXShndWlkZS9pMThuLWNvbW1vbi1mb3JtYXQtZGF0YS1sb2NhbGUpLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIHJ1bGVzIGZvciB0aGUgbG9jYWxlLCBhIHNpbmdsZSB0aW1lIHZhbHVlIG9yIGFycmF5IG9mICpmcm9tLXRpbWUsIHRvLXRpbWUqLFxuICogb3IgbnVsbCBpZiBubyBwZXJpb2RzIGFyZSBhdmFpbGFibGUuXG4gKlxuICogQHNlZSB7QGxpbmsgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzfVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXSgvZ3VpZGUvaTE4bi1vdmVydmlldylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKGxvY2FsZTogc3RyaW5nKTogKFRpbWUgfCBbVGltZSwgVGltZV0pW10ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjaGVja0Z1bGxEYXRhKGRhdGEpO1xuICBjb25zdCBydWxlcyA9IGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVvJtUV4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kc1J1bGVzXSB8fCBbXTtcbiAgcmV0dXJuIHJ1bGVzLm1hcCgocnVsZTogc3RyaW5nIHwgW3N0cmluZywgc3RyaW5nXSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBleHRyYWN0VGltZShydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIFtleHRyYWN0VGltZShydWxlWzBdKSwgZXh0cmFjdFRpbWUocnVsZVsxXSldO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgbG9jYWxlLXNwZWNpZmljIGRheSBwZXJpb2RzLCB3aGljaCBpbmRpY2F0ZSByb3VnaGx5IGhvdyBhIGRheSBpcyBicm9rZW4gdXBcbiAqIGluIGRpZmZlcmVudCBsYW5ndWFnZXMuXG4gKiBGb3IgZXhhbXBsZSwgZm9yIGBlbi1VU2AsIHBlcmlvZHMgYXJlIG1vcm5pbmcsIG5vb24sIGFmdGVybm9vbiwgZXZlbmluZywgYW5kIG1pZG5pZ2h0LlxuICpcbiAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHlvdSBoYXZlIGxvYWRlZCB0aGUgZnVsbCBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW1wiSTE4biBndWlkZVwiXShndWlkZS9pMThuLWNvbW1vbi1mb3JtYXQtZGF0YS1sb2NhbGUpLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuICogQHJldHVybnMgVGhlIHRyYW5zbGF0ZWQgZGF5LXBlcmlvZCBzdHJpbmdzLlxuICogQHNlZSB7QGxpbmsgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlc31cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzKFxuICBsb2NhbGU6IHN0cmluZyxcbiAgZm9ybVN0eWxlOiBGb3JtU3R5bGUsXG4gIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLFxuKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjaGVja0Z1bGxEYXRhKGRhdGEpO1xuICBjb25zdCBkYXlQZXJpb2RzRGF0YSA9IDxzdHJpbmdbXVtdW10+W1xuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVvJtUV4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kRm9ybWF0c10sXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW8m1RXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RTdGFuZGFsb25lXSxcbiAgXTtcbiAgY29uc3QgZGF5UGVyaW9kcyA9IGdldExhc3REZWZpbmVkVmFsdWUoZGF5UGVyaW9kc0RhdGEsIGZvcm1TdHlsZSkgfHwgW107XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheVBlcmlvZHMsIHdpZHRoKSB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHdyaXRpbmcgZGlyZWN0aW9uIG9mIGEgc3BlY2lmaWVkIGxvY2FsZVxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcHVibGljQXBpXG4gKiBAcmV0dXJucyAncnRsJyBvciAnbHRyJ1xuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXSgvZ3VpZGUvaTE4bi1vdmVydmlldylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURpcmVjdGlvbihsb2NhbGU6IHN0cmluZyk6ICdsdHInIHwgJ3J0bCcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EaXJlY3Rpb25hbGl0eV07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBmaXJzdCB2YWx1ZSB0aGF0IGlzIGRlZmluZWQgaW4gYW4gYXJyYXksIGdvaW5nIGJhY2t3YXJkcyBmcm9tIGFuIGluZGV4IHBvc2l0aW9uLlxuICpcbiAqIFRvIGF2b2lkIHJlcGVhdGluZyB0aGUgc2FtZSBkYXRhIChhcyB3aGVuIHRoZSBcImZvcm1hdFwiIGFuZCBcInN0YW5kYWxvbmVcIiBmb3JtcyBhcmUgdGhlIHNhbWUpXG4gKiBhZGQgdGhlIGZpcnN0IHZhbHVlIHRvIHRoZSBsb2NhbGUgZGF0YSBhcnJheXMsIGFuZCBhZGQgb3RoZXIgdmFsdWVzIG9ubHkgaWYgdGhleSBhcmUgZGlmZmVyZW50LlxuICpcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIGFycmF5IHRvIHJldHJpZXZlIGZyb20uXG4gKiBAcGFyYW0gaW5kZXggQSAwLWJhc2VkIGluZGV4IGludG8gdGhlIGFycmF5IHRvIHN0YXJ0IGZyb20uXG4gKiBAcmV0dXJucyBUaGUgdmFsdWUgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBnaXZlbiBpbmRleCBwb3NpdGlvbi5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5mdW5jdGlvbiBnZXRMYXN0RGVmaW5lZFZhbHVlPFQ+KGRhdGE6IFRbXSwgaW5kZXg6IG51bWJlcik6IFQge1xuICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPiAtMTsgaS0tKSB7XG4gICAgaWYgKHR5cGVvZiBkYXRhW2ldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGRhdGFbaV07XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignTG9jYWxlIGRhdGEgQVBJOiBsb2NhbGUgZGF0YSB1bmRlZmluZWQnKTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdGltZSB2YWx1ZSB3aXRoIGhvdXJzIGFuZCBtaW51dGVzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgVGltZSA9IHtcbiAgaG91cnM6IG51bWJlcjtcbiAgbWludXRlczogbnVtYmVyO1xufTtcblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgaG91cnMgYW5kIG1pbnV0ZXMgZnJvbSBhIHN0cmluZyBsaWtlIFwiMTU6NDVcIlxuICovXG5mdW5jdGlvbiBleHRyYWN0VGltZSh0aW1lOiBzdHJpbmcpOiBUaW1lIHtcbiAgY29uc3QgW2gsIG1dID0gdGltZS5zcGxpdCgnOicpO1xuICByZXR1cm4ge2hvdXJzOiAraCwgbWludXRlczogK219O1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgY3VycmVuY3kgc3ltYm9sIGZvciBhIGdpdmVuIGN1cnJlbmN5IGNvZGUuXG4gKlxuICogRm9yIGV4YW1wbGUsIGZvciB0aGUgZGVmYXVsdCBgZW4tVVNgIGxvY2FsZSwgdGhlIGNvZGUgYFVTRGAgY2FuXG4gKiBiZSByZXByZXNlbnRlZCBieSB0aGUgbmFycm93IHN5bWJvbCBgJGAgb3IgdGhlIHdpZGUgc3ltYm9sIGBVUyRgLlxuICpcbiAqIEBwYXJhbSBjb2RlIFRoZSBjdXJyZW5jeSBjb2RlLlxuICogQHBhcmFtIGZvcm1hdCBUaGUgZm9ybWF0LCBgd2lkZWAgb3IgYG5hcnJvd2AuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgc3ltYm9sLCBvciB0aGUgY3VycmVuY3kgY29kZSBpZiBubyBzeW1ib2wgaXMgYXZhaWxhYmxlLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXSgvZ3VpZGUvaTE4bi1vdmVydmlldylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW5jeVN5bWJvbChjb2RlOiBzdHJpbmcsIGZvcm1hdDogJ3dpZGUnIHwgJ25hcnJvdycsIGxvY2FsZSA9ICdlbicpOiBzdHJpbmcge1xuICBjb25zdCBjdXJyZW5jeSA9IGdldExvY2FsZUN1cnJlbmNpZXMobG9jYWxlKVtjb2RlXSB8fCBDVVJSRU5DSUVTX0VOW2NvZGVdIHx8IFtdO1xuICBjb25zdCBzeW1ib2xOYXJyb3cgPSBjdXJyZW5jeVvJtUN1cnJlbmN5SW5kZXguU3ltYm9sTmFycm93XTtcblxuICBpZiAoZm9ybWF0ID09PSAnbmFycm93JyAmJiB0eXBlb2Ygc3ltYm9sTmFycm93ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzeW1ib2xOYXJyb3c7XG4gIH1cblxuICByZXR1cm4gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4LlN5bWJvbF0gfHwgY29kZTtcbn1cblxuLy8gTW9zdCBjdXJyZW5jaWVzIGhhdmUgY2VudHMsIHRoYXQncyB3aHkgdGhlIGRlZmF1bHQgaXMgMlxuY29uc3QgREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFMgPSAyO1xuXG4vKipcbiAqIFJlcG9ydHMgdGhlIG51bWJlciBvZiBkZWNpbWFsIGRpZ2l0cyBmb3IgYSBnaXZlbiBjdXJyZW5jeS5cbiAqIFRoZSB2YWx1ZSBkZXBlbmRzIHVwb24gdGhlIHByZXNlbmNlIG9mIGNlbnRzIGluIHRoYXQgcGFydGljdWxhciBjdXJyZW5jeS5cbiAqXG4gKiBAcGFyYW0gY29kZSBUaGUgY3VycmVuY3kgY29kZS5cbiAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgZGVjaW1hbCBkaWdpdHMsIHR5cGljYWxseSAwIG9yIDIuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMoY29kZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGRpZ2l0cztcbiAgY29uc3QgY3VycmVuY3kgPSBDVVJSRU5DSUVTX0VOW2NvZGVdO1xuICBpZiAoY3VycmVuY3kpIHtcbiAgICBkaWdpdHMgPSBjdXJyZW5jeVvJtUN1cnJlbmN5SW5kZXguTmJPZkRpZ2l0c107XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBkaWdpdHMgPT09ICdudW1iZXInID8gZGlnaXRzIDogREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFM7XG59XG4iXX0=