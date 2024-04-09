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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
// This needs to be an object literal, rather than an enum, because TypeScript 5.4+
// doesn't allow numeric keys and we have `Infinity` and `NaN`.
/**
 * Symbols that can be used to replace placeholders in number patterns.
 * Examples are based on `en-US` values.
 *
 * @see {@link getLocaleNumberSymbol}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 * @object-literal-as-enum
 */
export const NumberSymbol = {
    /**
     * Decimal separator.
     * For `en-US`, the dot character.
     * Example: 2,345`.`67
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)

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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @param symbol The symbol to localize. Must be one of `NumberSymbol`.
 * @returns The character for the localized symbol.
 * @see {@link NumberSymbol}
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * See the ["I18n guide"](guide/i18n/format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The rules for the locale, a single time value or array of *from-time, to-time*,
 * or null if no periods are available.
 *
 * @see {@link getLocaleExtraDayPeriods}
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * See the ["I18n guide"](guide/i18n/format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns The translated day-period strings.
 * @see {@link getLocaleExtraDayPeriodRules}
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBR0wsZUFBZSxFQUNmLHNCQUFzQixFQUN0QixvQkFBb0IsRUFDcEIsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxhQUFhLEVBQW9CLE1BQU0sY0FBYyxDQUFDO0FBRTlEOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBTixJQUFZLGlCQUtYO0FBTEQsV0FBWSxpQkFBaUI7SUFDM0IsK0RBQU8sQ0FBQTtJQUNQLCtEQUFPLENBQUE7SUFDUCxpRUFBUSxDQUFBO0lBQ1IscUVBQVUsQ0FBQTtBQUNaLENBQUMsRUFMVyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBSzVCO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQU4sSUFBWSxNQU9YO0FBUEQsV0FBWSxNQUFNO0lBQ2hCLG1DQUFRLENBQUE7SUFDUixpQ0FBTyxDQUFBO0lBQ1AsaUNBQU8sQ0FBQTtJQUNQLGlDQUFPLENBQUE7SUFDUCxtQ0FBUSxDQUFBO0lBQ1IscUNBQVMsQ0FBQTtBQUNYLENBQUMsRUFQVyxNQUFNLEtBQU4sTUFBTSxRQU9qQjtBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFOLElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQiw2Q0FBTSxDQUFBO0lBQ04scURBQVUsQ0FBQTtBQUNaLENBQUMsRUFIVyxTQUFTLEtBQVQsU0FBUyxRQUdwQjtBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBTixJQUFZLGdCQVNYO0FBVEQsV0FBWSxnQkFBZ0I7SUFDMUIsZ0RBQWdEO0lBQ2hELDJEQUFNLENBQUE7SUFDTixtREFBbUQ7SUFDbkQscUVBQVcsQ0FBQTtJQUNYLHFE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dCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICDJtUN1cnJlbmN5SW5kZXgsXG4gIMm1RXh0cmFMb2NhbGVEYXRhSW5kZXgsXG4gIMm1ZmluZExvY2FsZURhdGEsXG4gIMm1Z2V0TG9jYWxlQ3VycmVuY3lDb2RlLFxuICDJtWdldExvY2FsZVBsdXJhbENhc2UsXG4gIMm1TG9jYWxlRGF0YUluZGV4LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDVVJSRU5DSUVTX0VOLCBDdXJyZW5jaWVzU3ltYm9sc30gZnJvbSAnLi9jdXJyZW5jaWVzJztcblxuLyoqXG4gKiBGb3JtYXQgc3R5bGVzIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVwcmVzZW50IG51bWJlcnMuXG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVOdW1iZXJGb3JtYXR9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBOdW1iZXJGb3JtYXRTdHlsZSB7XG4gIERlY2ltYWwsXG4gIFBlcmNlbnQsXG4gIEN1cnJlbmN5LFxuICBTY2llbnRpZmljLFxufVxuXG4vKipcbiAqIFBsdXJhbGl0eSBjYXNlcyB1c2VkIGZvciB0cmFuc2xhdGluZyBwbHVyYWxzIHRvIGRpZmZlcmVudCBsYW5ndWFnZXMuXG4gKlxuICogQHNlZSB7QGxpbmsgTmdQbHVyYWx9XG4gKiBAc2VlIHtAbGluayBOZ1BsdXJhbENhc2V9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBQbHVyYWwge1xuICBaZXJvID0gMCxcbiAgT25lID0gMSxcbiAgVHdvID0gMixcbiAgRmV3ID0gMyxcbiAgTWFueSA9IDQsXG4gIE90aGVyID0gNSxcbn1cblxuLyoqXG4gKiBDb250ZXh0LWRlcGVuZGFudCB0cmFuc2xhdGlvbiBmb3JtcyBmb3Igc3RyaW5ncy5cbiAqIFR5cGljYWxseSB0aGUgc3RhbmRhbG9uZSB2ZXJzaW9uIGlzIGZvciB0aGUgbm9taW5hdGl2ZSBmb3JtIG9mIHRoZSB3b3JkLFxuICogYW5kIHRoZSBmb3JtYXQgdmVyc2lvbiBpcyB1c2VkIGZvciB0aGUgZ2VuaXRpdmUgY2FzZS5cbiAqIEBzZWUgW0NMRFIgd2Vic2l0ZV0oaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vZGF0ZS10aW1lLTEvZGF0ZS10aW1lI1RPQy1TdGFuZGFsb25lLXZzLi1Gb3JtYXQtU3R5bGVzKVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gRm9ybVN0eWxlIHtcbiAgRm9ybWF0LFxuICBTdGFuZGFsb25lLFxufVxuXG4vKipcbiAqIFN0cmluZyB3aWR0aHMgYXZhaWxhYmxlIGZvciB0cmFuc2xhdGlvbnMuXG4gKiBUaGUgc3BlY2lmaWMgY2hhcmFjdGVyIHdpZHRocyBhcmUgbG9jYWxlLXNwZWNpZmljLlxuICogRXhhbXBsZXMgYXJlIGdpdmVuIGZvciB0aGUgd29yZCBcIlN1bmRheVwiIGluIEVuZ2xpc2guXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBUcmFuc2xhdGlvbldpZHRoIHtcbiAgLyoqIDEgY2hhcmFjdGVyIGZvciBgZW4tVVNgLiBGb3IgZXhhbXBsZTogJ1MnICovXG4gIE5hcnJvdyxcbiAgLyoqIDMgY2hhcmFjdGVycyBmb3IgYGVuLVVTYC4gRm9yIGV4YW1wbGU6ICdTdW4nICovXG4gIEFiYnJldmlhdGVkLFxuICAvKiogRnVsbCBsZW5ndGggZm9yIGBlbi1VU2AuIEZvciBleGFtcGxlOiBcIlN1bmRheVwiICovXG4gIFdpZGUsXG4gIC8qKiAyIGNoYXJhY3RlcnMgZm9yIGBlbi1VU2AsIEZvciBleGFtcGxlOiBcIlN1XCIgKi9cbiAgU2hvcnQsXG59XG5cbi8qKlxuICogU3RyaW5nIHdpZHRocyBhdmFpbGFibGUgZm9yIGRhdGUtdGltZSBmb3JtYXRzLlxuICogVGhlIHNwZWNpZmljIGNoYXJhY3RlciB3aWR0aHMgYXJlIGxvY2FsZS1zcGVjaWZpYy5cbiAqIEV4YW1wbGVzIGFyZSBnaXZlbiBmb3IgYGVuLVVTYC5cbiAqXG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVEYXRlRm9ybWF0fVxuICogQHNlZSB7QGxpbmsgZ2V0TG9jYWxlVGltZUZvcm1hdH1cbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZURhdGVUaW1lRm9ybWF0fVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBGb3JtYXRXaWR0aCB7XG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgJ00vZC95eSwgaDptbSBhJ2BcbiAgICogKEV4YW1wbGU6IGA2LzE1LzE1LCA5OjAzIEFNYClcbiAgICovXG4gIFNob3J0LFxuICAvKipcbiAgICogRm9yIGBlbi1VU2AsIGAnTU1NIGQsIHksIGg6bW06c3MgYSdgXG4gICAqIChFeGFtcGxlOiBgSnVuIDE1LCAyMDE1LCA5OjAzOjAxIEFNYClcbiAgICovXG4gIE1lZGl1bSxcbiAgLyoqXG4gICAqIEZvciBgZW4tVVNgLCBgJ01NTU0gZCwgeSwgaDptbTpzcyBhIHonYFxuICAgKiAoRXhhbXBsZTogYEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMWApXG4gICAqL1xuICBMb25nLFxuICAvKipcbiAgICogRm9yIGBlbi1VU2AsIGAnRUVFRSwgTU1NTSBkLCB5LCBoOm1tOnNzIGEgenp6eidgXG4gICAqIChFeGFtcGxlOiBgTW9uZGF5LCBKdW5lIDE1LCAyMDE1IGF0IDk6MDM6MDEgQU0gR01UKzAxOjAwYClcbiAgICovXG4gIEZ1bGwsXG59XG5cbi8vIFRoaXMgbmVlZHMgdG8gYmUgYW4gb2JqZWN0IGxpdGVyYWwsIHJhdGhlciB0aGFuIGFuIGVudW0sIGJlY2F1c2UgVHlwZVNjcmlwdCA1LjQrXG4vLyBkb2Vzbid0IGFsbG93IG51bWVyaWMga2V5cyBhbmQgd2UgaGF2ZSBgSW5maW5pdHlgIGFuZCBgTmFOYC5cbi8qKlxuICogU3ltYm9scyB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIG51bWJlciBwYXR0ZXJucy5cbiAqIEV4YW1wbGVzIGFyZSBiYXNlZCBvbiBgZW4tVVNgIHZhbHVlcy5cbiAqXG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVOdW1iZXJTeW1ib2x9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICogQG9iamVjdC1saXRlcmFsLWFzLWVudW1cbiAqL1xuZXhwb3J0IGNvbnN0IE51bWJlclN5bWJvbCA9IHtcbiAgLyoqXG4gICAqIERlY2ltYWwgc2VwYXJhdG9yLlxuICAgKiBGb3IgYGVuLVVTYCwgdGhlIGRvdCBjaGFyYWN0ZXIuXG4gICAqIEV4YW1wbGU6IDIsMzQ1YC5gNjdcbiAgICovXG4gIERlY2ltYWw6IDAsXG4gIC8qKlxuICAgKiBHcm91cGluZyBzZXBhcmF0b3IsIHR5cGljYWxseSBmb3IgdGhvdXNhbmRzLlxuICAgKiBGb3IgYGVuLVVTYCwgdGhlIGNvbW1hIGNoYXJhY3Rlci5cbiAgICogRXhhbXBsZTogMmAsYDM0NS42N1xuICAgKi9cbiAgR3JvdXA6IDEsXG4gIC8qKlxuICAgKiBMaXN0LWl0ZW0gc2VwYXJhdG9yLlxuICAgKiBFeGFtcGxlOiBcIm9uZSwgdHdvLCBhbmQgdGhyZWVcIlxuICAgKi9cbiAgTGlzdDogMixcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcmNlbnRhZ2UgKG91dCBvZiAxMDApLlxuICAgKiBFeGFtcGxlOiAyMy40JVxuICAgKi9cbiAgUGVyY2VudFNpZ246IDMsXG4gIC8qKlxuICAgKiBTaWduIGZvciBwb3NpdGl2ZSBudW1iZXJzLlxuICAgKiBFeGFtcGxlOiArMjNcbiAgICovXG4gIFBsdXNTaWduOiA0LFxuICAvKipcbiAgICogU2lnbiBmb3IgbmVnYXRpdmUgbnVtYmVycy5cbiAgICogRXhhbXBsZTogLTIzXG4gICAqL1xuICBNaW51c1NpZ246IDUsXG4gIC8qKlxuICAgKiBDb21wdXRlciBub3RhdGlvbiBmb3IgZXhwb25lbnRpYWwgdmFsdWUgKG4gdGltZXMgYSBwb3dlciBvZiAxMCkuXG4gICAqIEV4YW1wbGU6IDEuMkUzXG4gICAqL1xuICBFeHBvbmVudGlhbDogNixcbiAgLyoqXG4gICAqIEh1bWFuLXJlYWRhYmxlIGZvcm1hdCBvZiBleHBvbmVudGlhbC5cbiAgICogRXhhbXBsZTogMS4yeDEwM1xuICAgKi9cbiAgU3VwZXJzY3JpcHRpbmdFeHBvbmVudDogNyxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcm1pbGxlIChvdXQgb2YgMTAwMCkuXG4gICAqIEV4YW1wbGU6IDIzLjTigLBcbiAgICovXG4gIFBlck1pbGxlOiA4LFxuICAvKipcbiAgICogSW5maW5pdHksIGNhbiBiZSB1c2VkIHdpdGggcGx1cyBhbmQgbWludXMuXG4gICAqIEV4YW1wbGU6IOKIniwgK+KIniwgLeKInlxuICAgKi9cbiAgSW5maW5pdHk6IDksXG4gIC8qKlxuICAgKiBOb3QgYSBudW1iZXIuXG4gICAqIEV4YW1wbGU6IE5hTlxuICAgKi9cbiAgTmFOOiAxMCxcbiAgLyoqXG4gICAqIFN5bWJvbCB1c2VkIGJldHdlZW4gdGltZSB1bml0cy5cbiAgICogRXhhbXBsZTogMTA6NTJcbiAgICovXG4gIFRpbWVTZXBhcmF0b3I6IDExLFxuICAvKipcbiAgICogRGVjaW1hbCBzZXBhcmF0b3IgZm9yIGN1cnJlbmN5IHZhbHVlcyAoZmFsbGJhY2sgdG8gYERlY2ltYWxgKS5cbiAgICogRXhhbXBsZTogJDIsMzQ1LjY3XG4gICAqL1xuICBDdXJyZW5jeURlY2ltYWw6IDEyLFxuICAvKipcbiAgICogR3JvdXAgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBHcm91cGApLlxuICAgKiBFeGFtcGxlOiAkMiwzNDUuNjdcbiAgICovXG4gIEN1cnJlbmN5R3JvdXA6IDEzLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgTnVtYmVyU3ltYm9sID0gKHR5cGVvZiBOdW1iZXJTeW1ib2wpW2tleW9mIHR5cGVvZiBOdW1iZXJTeW1ib2xdO1xuXG4vKipcbiAqIFRoZSB2YWx1ZSBmb3IgZWFjaCBkYXkgb2YgdGhlIHdlZWssIGJhc2VkIG9uIHRoZSBgZW4tVVNgIGxvY2FsZVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gV2Vla0RheSB7XG4gIFN1bmRheSA9IDAsXG4gIE1vbmRheSxcbiAgVHVlc2RheSxcbiAgV2VkbmVzZGF5LFxuICBUaHVyc2RheSxcbiAgRnJpZGF5LFxuICBTYXR1cmRheSxcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGxvY2FsZSBJRCBmcm9tIHRoZSBjdXJyZW50bHkgbG9hZGVkIGxvY2FsZS5cbiAqIFRoZSBsb2FkZWQgbG9jYWxlIGNvdWxkIGJlLCBmb3IgZXhhbXBsZSwgYSBnbG9iYWwgb25lIHJhdGhlciB0aGFuIGEgcmVnaW9uYWwgb25lLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlLCBzdWNoIGFzIGBmci1GUmAuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxlIGNvZGUuIEZvciBleGFtcGxlLCBgZnJgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUlkKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIMm1ZmluZExvY2FsZURhdGEobG9jYWxlKVvJtUxvY2FsZURhdGFJbmRleC5Mb2NhbGVJZF07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGRheSBwZXJpb2Qgc3RyaW5ncyBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGxvY2FsaXplZCBwZXJpb2Qgc3RyaW5ncy4gRm9yIGV4YW1wbGUsIGBbQU0sIFBNXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF5UGVyaW9kcyhcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIGZvcm1TdHlsZTogRm9ybVN0eWxlLFxuICB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCxcbik6IFJlYWRvbmx5PFtzdHJpbmcsIHN0cmluZ10+IHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgYW1QbURhdGEgPSA8W3N0cmluZywgc3RyaW5nXVtdW10+W1xuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5UGVyaW9kc0Zvcm1hdF0sXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXlQZXJpb2RzU3RhbmRhbG9uZV0sXG4gIF07XG4gIGNvbnN0IGFtUG0gPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGFtUG1EYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShhbVBtLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGRheXMgb2YgdGhlIHdlZWsgZm9yIHRoZSBnaXZlbiBsb2NhbGUsIHVzaW5nIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgbmFtZSBzdHJpbmdzLlxuICogRm9yIGV4YW1wbGUsYFtTdW5kYXksIE1vbmRheSwgLi4uIFNhdHVyZGF5XWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF5TmFtZXMoXG4gIGxvY2FsZTogc3RyaW5nLFxuICBmb3JtU3R5bGU6IEZvcm1TdHlsZSxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4pOiBSZWFkb25seUFycmF5PHN0cmluZz4ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBkYXlzRGF0YSA9IDxzdHJpbmdbXVtdW10+W1xuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5c0Zvcm1hdF0sXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXlzU3RhbmRhbG9uZV0sXG4gIF07XG4gIGNvbnN0IGRheXMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXNEYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlzLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIG1vbnRocyBvZiB0aGUgeWVhciBmb3IgdGhlIGdpdmVuIGxvY2FsZSwgdXNpbmcgdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGxvY2FsaXplZCBuYW1lIHN0cmluZ3MuXG4gKiBGb3IgZXhhbXBsZSwgIGBbSmFudWFyeSwgRmVicnVhcnksIC4uLl1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU1vbnRoTmFtZXMoXG4gIGxvY2FsZTogc3RyaW5nLFxuICBmb3JtU3R5bGU6IEZvcm1TdHlsZSxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4pOiBSZWFkb25seUFycmF5PHN0cmluZz4ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBtb250aHNEYXRhID0gPHN0cmluZ1tdW11bXT5bXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5Nb250aHNGb3JtYXRdLFxuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTW9udGhzU3RhbmRhbG9uZV0sXG4gIF07XG4gIGNvbnN0IG1vbnRocyA9IGdldExhc3REZWZpbmVkVmFsdWUobW9udGhzRGF0YSwgZm9ybVN0eWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUobW9udGhzLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIEdyZWdvcmlhbi1jYWxlbmRhciBlcmFzIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cblxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIGVyYSBzdHJpbmdzLlxuICogRm9yIGV4YW1wbGUsIGBbQUQsIEJDXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXJhTmFtZXMoXG4gIGxvY2FsZTogc3RyaW5nLFxuICB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCxcbik6IFJlYWRvbmx5PFtzdHJpbmcsIHN0cmluZ10+IHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgZXJhc0RhdGEgPSA8W3N0cmluZywgc3RyaW5nXVtdPmRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXJhc107XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGVyYXNEYXRhLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBBIGRheSBpbmRleCBudW1iZXIsIHVzaW5nIHRoZSAwLWJhc2VkIHdlZWstZGF5IGluZGV4IGZvciBgZW4tVVNgXG4gKiAoU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSwgLi4uKS5cbiAqIEZvciBleGFtcGxlLCBmb3IgYGZyLUZSYCwgcmV0dXJucyAxIHRvIGluZGljYXRlIHRoYXQgdGhlIGZpcnN0IGRheSBpcyBNb25kYXkuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRmlyc3REYXlPZldlZWsobG9jYWxlOiBzdHJpbmcpOiBXZWVrRGF5IHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRmlyc3REYXlPZldlZWtdO1xufVxuXG4vKipcbiAqIFJhbmdlIG9mIHdlZWsgZGF5cyB0aGF0IGFyZSBjb25zaWRlcmVkIHRoZSB3ZWVrLWVuZCBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSByYW5nZSBvZiBkYXkgdmFsdWVzLCBgW3N0YXJ0RGF5LCBlbmREYXldYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVXZWVrRW5kUmFuZ2UobG9jYWxlOiBzdHJpbmcpOiBbV2Vla0RheSwgV2Vla0RheV0ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5XZWVrZW5kUmFuZ2VdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCBkYXRlLXZhbHVlIGZvcm1hdHRpbmcgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHdpZHRoIFRoZSBmb3JtYXQgdHlwZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgZm9ybWF0dGluZyBzdHJpbmcuXG4gKiBAc2VlIHtAbGluayBGb3JtYXRXaWR0aH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRhdGVGb3JtYXRdLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIHRpbWUtdmFsdWUgZm9ybWF0dGluZyBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gd2lkdGggVGhlIGZvcm1hdCB0eXBlLlxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXR0aW5nIHN0cmluZy5cbiAqIEBzZWUge0BsaW5rIEZvcm1hdFdpZHRofVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRhW8m1TG9jYWxlRGF0YUluZGV4LlRpbWVGb3JtYXRdLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIGRhdGUtdGltZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgZm9ybWF0IHR5cGUuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdHRpbmcgc3RyaW5nLlxuICogQHNlZSB7QGxpbmsgRm9ybWF0V2lkdGh9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRhdGVUaW1lRm9ybWF0RGF0YSA9IDxzdHJpbmdbXT5kYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRhdGVUaW1lRm9ybWF0XTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0ZVRpbWVGb3JtYXREYXRhLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIG51bWJlciBzeW1ib2wgdGhhdCBjYW4gYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBudW1iZXIgZm9ybWF0cy5cbiAqIEBwYXJhbSBsb2NhbGUgVGhlIGxvY2FsZSBjb2RlLlxuICogQHBhcmFtIHN5bWJvbCBUaGUgc3ltYm9sIHRvIGxvY2FsaXplLiBNdXN0IGJlIG9uZSBvZiBgTnVtYmVyU3ltYm9sYC5cbiAqIEByZXR1cm5zIFRoZSBjaGFyYWN0ZXIgZm9yIHRoZSBsb2NhbGl6ZWQgc3ltYm9sLlxuICogQHNlZSB7QGxpbmsgTnVtYmVyU3ltYm9sfVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGU6IHN0cmluZywgc3ltYm9sOiBOdW1iZXJTeW1ib2wpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCByZXMgPSBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW3N5bWJvbF07XG4gIGlmICh0eXBlb2YgcmVzID09PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChzeW1ib2wgPT09IE51bWJlclN5bWJvbC5DdXJyZW5jeURlY2ltYWwpIHtcbiAgICAgIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW051bWJlclN5bWJvbC5EZWNpbWFsXTtcbiAgICB9IGVsc2UgaWYgKHN5bWJvbCA9PT0gTnVtYmVyU3ltYm9sLkN1cnJlbmN5R3JvdXApIHtcbiAgICAgIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW051bWJlclN5bWJvbC5Hcm91cF07XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbnVtYmVyIGZvcm1hdCBmb3IgYSBnaXZlbiBsb2NhbGUuXG4gKlxuICogTnVtYmVycyBhcmUgZm9ybWF0dGVkIHVzaW5nIHBhdHRlcm5zLCBsaWtlIGAjLCMjIy4wMGAuIEZvciBleGFtcGxlLCB0aGUgcGF0dGVybiBgIywjIyMuMDBgXG4gKiB3aGVuIHVzZWQgdG8gZm9ybWF0IHRoZSBudW1iZXIgMTIzNDUuNjc4IGNvdWxkIHJlc3VsdCBpbiBcIjEyJzM0NSw2NzhcIi4gVGhhdCB3b3VsZCBoYXBwZW4gaWYgdGhlXG4gKiBncm91cGluZyBzZXBhcmF0b3IgZm9yIHlvdXIgbGFuZ3VhZ2UgaXMgYW4gYXBvc3Ryb3BoZSwgYW5kIHRoZSBkZWNpbWFsIHNlcGFyYXRvciBpcyBhIGNvbW1hLlxuICpcbiAqIDxiPkltcG9ydGFudDo8L2I+IFRoZSBjaGFyYWN0ZXJzIGAuYCBgLGAgYDBgIGAjYCAoYW5kIG90aGVycyBiZWxvdykgYXJlIHNwZWNpYWwgcGxhY2Vob2xkZXJzXG4gKiB0aGF0IHN0YW5kIGZvciB0aGUgZGVjaW1hbCBzZXBhcmF0b3IsIGFuZCBzbyBvbiwgYW5kIGFyZSBOT1QgcmVhbCBjaGFyYWN0ZXJzLlxuICogWW91IG11c3QgTk9UIFwidHJhbnNsYXRlXCIgdGhlIHBsYWNlaG9sZGVycy4gRm9yIGV4YW1wbGUsIGRvbid0IGNoYW5nZSBgLmAgdG8gYCxgIGV2ZW4gdGhvdWdoIGluXG4gKiB5b3VyIGxhbmd1YWdlIHRoZSBkZWNpbWFsIHBvaW50IGlzIHdyaXR0ZW4gd2l0aCBhIGNvbW1hLiBUaGUgc3ltYm9scyBzaG91bGQgYmUgcmVwbGFjZWQgYnkgdGhlXG4gKiBsb2NhbCBlcXVpdmFsZW50cywgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIGBOdW1iZXJTeW1ib2xgIGZvciB5b3VyIGxhbmd1YWdlLlxuICpcbiAqIEhlcmUgYXJlIHRoZSBzcGVjaWFsIGNoYXJhY3RlcnMgdXNlZCBpbiBudW1iZXIgcGF0dGVybnM6XG4gKlxuICogfCBTeW1ib2wgfCBNZWFuaW5nIHxcbiAqIHwtLS0tLS0tLXwtLS0tLS0tLS18XG4gKiB8IC4gfCBSZXBsYWNlZCBhdXRvbWF0aWNhbGx5IGJ5IHRoZSBjaGFyYWN0ZXIgdXNlZCBmb3IgdGhlIGRlY2ltYWwgcG9pbnQuIHxcbiAqIHwgLCB8IFJlcGxhY2VkIGJ5IHRoZSBcImdyb3VwaW5nXCIgKHRob3VzYW5kcykgc2VwYXJhdG9yLiB8XG4gKiB8IDAgfCBSZXBsYWNlZCBieSBhIGRpZ2l0IChvciB6ZXJvIGlmIHRoZXJlIGFyZW4ndCBlbm91Z2ggZGlnaXRzKS4gfFxuICogfCAjIHwgUmVwbGFjZWQgYnkgYSBkaWdpdCAob3Igbm90aGluZyBpZiB0aGVyZSBhcmVuJ3QgZW5vdWdoKS4gfFxuICogfCDCpCB8IFJlcGxhY2VkIGJ5IGEgY3VycmVuY3kgc3ltYm9sLCBzdWNoIGFzICQgb3IgVVNELiB8XG4gKiB8ICUgfCBNYXJrcyBhIHBlcmNlbnQgZm9ybWF0LiBUaGUgJSBzeW1ib2wgbWF5IGNoYW5nZSBwb3NpdGlvbiwgYnV0IG11c3QgYmUgcmV0YWluZWQuIHxcbiAqIHwgRSB8IE1hcmtzIGEgc2NpZW50aWZpYyBmb3JtYXQuIFRoZSBFIHN5bWJvbCBtYXkgY2hhbmdlIHBvc2l0aW9uLCBidXQgbXVzdCBiZSByZXRhaW5lZC4gfFxuICogfCAnIHwgU3BlY2lhbCBjaGFyYWN0ZXJzIHVzZWQgYXMgbGl0ZXJhbCBjaGFyYWN0ZXJzIGFyZSBxdW90ZWQgd2l0aCBBU0NJSSBzaW5nbGUgcXVvdGVzLiB8XG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBudW1lcmljIHZhbHVlIHRvIGJlIGZvcm1hdHRlZCAoc3VjaCBhcyBgRGVjaW1hbGAgb3IgYEN1cnJlbmN5YC4pXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdCBzdHJpbmcuXG4gKiBAc2VlIHtAbGluayBOdW1iZXJGb3JtYXRTdHlsZX1cbiAqIEBzZWUgW0NMRFIgd2Vic2l0ZV0oaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vbnVtYmVyLXBhdHRlcm5zKVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU51bWJlckZvcm1hdChsb2NhbGU6IHN0cmluZywgdHlwZTogTnVtYmVyRm9ybWF0U3R5bGUpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJGb3JtYXRzXVt0eXBlXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHN5bWJvbCB1c2VkIHRvIHJlcHJlc2VudCB0aGUgY3VycmVuY3kgZm9yIHRoZSBtYWluIGNvdW50cnlcbiAqIGNvcnJlc3BvbmRpbmcgdG8gYSBnaXZlbiBsb2NhbGUuIEZvciBleGFtcGxlLCAnJCcgZm9yIGBlbi1VU2AuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIHN5bWJvbCBjaGFyYWN0ZXIsXG4gKiBvciBgbnVsbGAgaWYgdGhlIG1haW4gY291bnRyeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeVN5bWJvbChsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5DdXJyZW5jeVN5bWJvbF0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbmN5IGZvciB0aGUgbWFpbiBjb3VudHJ5IGNvcnJlc3BvbmRpbmdcbiAqIHRvIGEgZ2l2ZW4gbG9jYWxlLiBGb3IgZXhhbXBsZSwgJ1VTIERvbGxhcicgZm9yIGBlbi1VU2AuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBjdXJyZW5jeSBuYW1lLFxuICogb3IgYG51bGxgIGlmIHRoZSBtYWluIGNvdW50cnkgY2Fubm90IGJlIGRldGVybWluZWQuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY3lOYW1lKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5TmFtZV0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGRlZmF1bHQgY3VycmVuY3kgY29kZSBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBUaGUgZGVmYXVsdCBpcyBkZWZpbmVkIGFzIHRoZSBmaXJzdCBjdXJyZW5jeSB3aGljaCBpcyBzdGlsbCBpbiB1c2UuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBUaGUgY29kZSBvZiB0aGUgbG9jYWxlIHdob3NlIGN1cnJlbmN5IGNvZGUgd2Ugd2FudC5cbiAqIEByZXR1cm5zIFRoZSBjb2RlIG9mIHRoZSBkZWZhdWx0IGN1cnJlbmN5IGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUN1cnJlbmN5Q29kZShsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICByZXR1cm4gybVnZXRMb2NhbGVDdXJyZW5jeUNvZGUobG9jYWxlKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbmN5IHZhbHVlcyBmb3IgYSBnaXZlbiBsb2NhbGUuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBjdXJyZW5jeSB2YWx1ZXMuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKi9cbmZ1bmN0aW9uIGdldExvY2FsZUN1cnJlbmNpZXMobG9jYWxlOiBzdHJpbmcpOiB7W2NvZGU6IHN0cmluZ106IEN1cnJlbmNpZXNTeW1ib2xzfSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmNpZXNdO1xufVxuXG4vKipcbiAqIEBhbGlhcyBjb3JlL8m1Z2V0TG9jYWxlUGx1cmFsQ2FzZVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgZ2V0TG9jYWxlUGx1cmFsQ2FzZTogKGxvY2FsZTogc3RyaW5nKSA9PiAodmFsdWU6IG51bWJlcikgPT4gUGx1cmFsID1cbiAgybVnZXRMb2NhbGVQbHVyYWxDYXNlO1xuXG5mdW5jdGlvbiBjaGVja0Z1bGxEYXRhKGRhdGE6IGFueSkge1xuICBpZiAoIWRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBNaXNzaW5nIGV4dHJhIGxvY2FsZSBkYXRhIGZvciB0aGUgbG9jYWxlIFwiJHtcbiAgICAgICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5Mb2NhbGVJZF1cbiAgICAgIH1cIi4gVXNlIFwicmVnaXN0ZXJMb2NhbGVEYXRhXCIgdG8gbG9hZCBuZXcgZGF0YS4gU2VlIHRoZSBcIkkxOG4gZ3VpZGVcIiBvbiBhbmd1bGFyLmlvIHRvIGtub3cgbW9yZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgbG9jYWxlLXNwZWNpZmljIHJ1bGVzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGRheSBwZXJpb2QgdG8gdXNlXG4gKiB3aGVuIG1vcmUgdGhhbiBvbmUgcGVyaW9kIGlzIGRlZmluZWQgZm9yIGEgbG9jYWxlLlxuICpcbiAqIFRoZXJlIGlzIGEgcnVsZSBmb3IgZWFjaCBkZWZpbmVkIGRheSBwZXJpb2QuIFRoZVxuICogZmlyc3QgcnVsZSBpcyBhcHBsaWVkIHRvIHRoZSBmaXJzdCBkYXkgcGVyaW9kIGFuZCBzbyBvbi5cbiAqIEZhbGwgYmFjayB0byBBTS9QTSB3aGVuIG5vIHJ1bGVzIGFyZSBhdmFpbGFibGUuXG4gKlxuICogQSBydWxlIGNhbiBzcGVjaWZ5IGEgcGVyaW9kIGFzIHRpbWUgcmFuZ2UsIG9yIGFzIGEgc2luZ2xlIHRpbWUgdmFsdWUuXG4gKlxuICogVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4geW91IGhhdmUgbG9hZGVkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbXCJJMThuIGd1aWRlXCJdKGd1aWRlL2kxOG4vZm9ybWF0LWRhdGEtbG9jYWxlKS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBydWxlcyBmb3IgdGhlIGxvY2FsZSwgYSBzaW5nbGUgdGltZSB2YWx1ZSBvciBhcnJheSBvZiAqZnJvbS10aW1lLCB0by10aW1lKixcbiAqIG9yIG51bGwgaWYgbm8gcGVyaW9kcyBhcmUgYXZhaWxhYmxlLlxuICpcbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kc31cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKGxvY2FsZTogc3RyaW5nKTogKFRpbWUgfCBbVGltZSwgVGltZV0pW10ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjaGVja0Z1bGxEYXRhKGRhdGEpO1xuICBjb25zdCBydWxlcyA9IGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVvJtUV4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kc1J1bGVzXSB8fCBbXTtcbiAgcmV0dXJuIHJ1bGVzLm1hcCgocnVsZTogc3RyaW5nIHwgW3N0cmluZywgc3RyaW5nXSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBleHRyYWN0VGltZShydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIFtleHRyYWN0VGltZShydWxlWzBdKSwgZXh0cmFjdFRpbWUocnVsZVsxXSldO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgbG9jYWxlLXNwZWNpZmljIGRheSBwZXJpb2RzLCB3aGljaCBpbmRpY2F0ZSByb3VnaGx5IGhvdyBhIGRheSBpcyBicm9rZW4gdXBcbiAqIGluIGRpZmZlcmVudCBsYW5ndWFnZXMuXG4gKiBGb3IgZXhhbXBsZSwgZm9yIGBlbi1VU2AsIHBlcmlvZHMgYXJlIG1vcm5pbmcsIG5vb24sIGFmdGVybm9vbiwgZXZlbmluZywgYW5kIG1pZG5pZ2h0LlxuICpcbiAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHlvdSBoYXZlIGxvYWRlZCB0aGUgZnVsbCBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW1wiSTE4biBndWlkZVwiXShndWlkZS9pMThuL2Zvcm1hdC1kYXRhLWxvY2FsZSkuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBUaGUgdHJhbnNsYXRlZCBkYXktcGVyaW9kIHN0cmluZ3MuXG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzfVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIGZvcm1TdHlsZTogRm9ybVN0eWxlLFxuICB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCxcbik6IHN0cmluZ1tdIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgZGF5UGVyaW9kc0RhdGEgPSA8c3RyaW5nW11bXVtdPltcbiAgICBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV1bybVFeHRyYUxvY2FsZURhdGFJbmRleC5FeHRyYURheVBlcmlvZEZvcm1hdHNdLFxuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVvJtUV4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kU3RhbmRhbG9uZV0sXG4gIF07XG4gIGNvbnN0IGRheVBlcmlvZHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheVBlcmlvZHNEYXRhLCBmb3JtU3R5bGUpIHx8IFtdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlQZXJpb2RzLCB3aWR0aCkgfHwgW107XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB3cml0aW5nIGRpcmVjdGlvbiBvZiBhIHNwZWNpZmllZCBsb2NhbGVcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHB1YmxpY0FwaVxuICogQHJldHVybnMgJ3J0bCcgb3IgJ2x0cidcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURpcmVjdGlvbihsb2NhbGU6IHN0cmluZyk6ICdsdHInIHwgJ3J0bCcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EaXJlY3Rpb25hbGl0eV07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBmaXJzdCB2YWx1ZSB0aGF0IGlzIGRlZmluZWQgaW4gYW4gYXJyYXksIGdvaW5nIGJhY2t3YXJkcyBmcm9tIGFuIGluZGV4IHBvc2l0aW9uLlxuICpcbiAqIFRvIGF2b2lkIHJlcGVhdGluZyB0aGUgc2FtZSBkYXRhIChhcyB3aGVuIHRoZSBcImZvcm1hdFwiIGFuZCBcInN0YW5kYWxvbmVcIiBmb3JtcyBhcmUgdGhlIHNhbWUpXG4gKiBhZGQgdGhlIGZpcnN0IHZhbHVlIHRvIHRoZSBsb2NhbGUgZGF0YSBhcnJheXMsIGFuZCBhZGQgb3RoZXIgdmFsdWVzIG9ubHkgaWYgdGhleSBhcmUgZGlmZmVyZW50LlxuICpcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIGFycmF5IHRvIHJldHJpZXZlIGZyb20uXG4gKiBAcGFyYW0gaW5kZXggQSAwLWJhc2VkIGluZGV4IGludG8gdGhlIGFycmF5IHRvIHN0YXJ0IGZyb20uXG4gKiBAcmV0dXJucyBUaGUgdmFsdWUgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBnaXZlbiBpbmRleCBwb3NpdGlvbi5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmZ1bmN0aW9uIGdldExhc3REZWZpbmVkVmFsdWU8VD4oZGF0YTogVFtdLCBpbmRleDogbnVtYmVyKTogVCB7XG4gIGZvciAobGV0IGkgPSBpbmRleDsgaSA+IC0xOyBpLS0pIHtcbiAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZGF0YVtpXTtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgZGF0YSBBUEk6IGxvY2FsZSBkYXRhIHVuZGVmaW5lZCcpO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0aW1lIHZhbHVlIHdpdGggaG91cnMgYW5kIG1pbnV0ZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBUaW1lID0ge1xuICBob3VyczogbnVtYmVyO1xuICBtaW51dGVzOiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBob3VycyBhbmQgbWludXRlcyBmcm9tIGEgc3RyaW5nIGxpa2UgXCIxNTo0NVwiXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RUaW1lKHRpbWU6IHN0cmluZyk6IFRpbWUge1xuICBjb25zdCBbaCwgbV0gPSB0aW1lLnNwbGl0KCc6Jyk7XG4gIHJldHVybiB7aG91cnM6ICtoLCBtaW51dGVzOiArbX07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW5jeSBzeW1ib2wgZm9yIGEgZ2l2ZW4gY3VycmVuY3kgY29kZS5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgZm9yIHRoZSBkZWZhdWx0IGBlbi1VU2AgbG9jYWxlLCB0aGUgY29kZSBgVVNEYCBjYW5cbiAqIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSBuYXJyb3cgc3ltYm9sIGAkYCBvciB0aGUgd2lkZSBzeW1ib2wgYFVTJGAuXG4gKlxuICogQHBhcmFtIGNvZGUgVGhlIGN1cnJlbmN5IGNvZGUuXG4gKiBAcGFyYW0gZm9ybWF0IFRoZSBmb3JtYXQsIGB3aWRlYCBvciBgbmFycm93YC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICpcbiAqIEByZXR1cm5zIFRoZSBzeW1ib2wsIG9yIHRoZSBjdXJyZW5jeSBjb2RlIGlmIG5vIHN5bWJvbCBpcyBhdmFpbGFibGUuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVuY3lTeW1ib2woY29kZTogc3RyaW5nLCBmb3JtYXQ6ICd3aWRlJyB8ICduYXJyb3cnLCBsb2NhbGUgPSAnZW4nKTogc3RyaW5nIHtcbiAgY29uc3QgY3VycmVuY3kgPSBnZXRMb2NhbGVDdXJyZW5jaWVzKGxvY2FsZSlbY29kZV0gfHwgQ1VSUkVOQ0lFU19FTltjb2RlXSB8fCBbXTtcbiAgY29uc3Qgc3ltYm9sTmFycm93ID0gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4LlN5bWJvbE5hcnJvd107XG5cbiAgaWYgKGZvcm1hdCA9PT0gJ25hcnJvdycgJiYgdHlwZW9mIHN5bWJvbE5hcnJvdyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3ltYm9sTmFycm93O1xuICB9XG5cbiAgcmV0dXJuIGN1cnJlbmN5W8m1Q3VycmVuY3lJbmRleC5TeW1ib2xdIHx8IGNvZGU7XG59XG5cbi8vIE1vc3QgY3VycmVuY2llcyBoYXZlIGNlbnRzLCB0aGF0J3Mgd2h5IHRoZSBkZWZhdWx0IGlzIDJcbmNvbnN0IERFRkFVTFRfTkJfT0ZfQ1VSUkVOQ1lfRElHSVRTID0gMjtcblxuLyoqXG4gKiBSZXBvcnRzIHRoZSBudW1iZXIgb2YgZGVjaW1hbCBkaWdpdHMgZm9yIGEgZ2l2ZW4gY3VycmVuY3kuXG4gKiBUaGUgdmFsdWUgZGVwZW5kcyB1cG9uIHRoZSBwcmVzZW5jZSBvZiBjZW50cyBpbiB0aGF0IHBhcnRpY3VsYXIgY3VycmVuY3kuXG4gKlxuICogQHBhcmFtIGNvZGUgVGhlIGN1cnJlbmN5IGNvZGUuXG4gKiBAcmV0dXJucyBUaGUgbnVtYmVyIG9mIGRlY2ltYWwgZGlnaXRzLCB0eXBpY2FsbHkgMCBvciAyLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMoY29kZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGRpZ2l0cztcbiAgY29uc3QgY3VycmVuY3kgPSBDVVJSRU5DSUVTX0VOW2NvZGVdO1xuICBpZiAoY3VycmVuY3kpIHtcbiAgICBkaWdpdHMgPSBjdXJyZW5jeVvJtUN1cnJlbmN5SW5kZXguTmJPZkRpZ2l0c107XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBkaWdpdHMgPT09ICdudW1iZXInID8gZGlnaXRzIDogREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFM7XG59XG4iXX0=