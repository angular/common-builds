/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import localeEn from './locale_en';
import { LOCALE_DATA } from './locale_data';
import { CURRENCIES_EN } from './currencies';
/** @enum {number} */
const NumberFormatStyle = {
    Decimal: 0,
    Percent: 1,
    Currency: 2,
    Scientific: 3,
};
export { NumberFormatStyle };
NumberFormatStyle[NumberFormatStyle.Decimal] = "Decimal";
NumberFormatStyle[NumberFormatStyle.Percent] = "Percent";
NumberFormatStyle[NumberFormatStyle.Currency] = "Currency";
NumberFormatStyle[NumberFormatStyle.Scientific] = "Scientific";
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
Plural[Plural.Zero] = "Zero";
Plural[Plural.One] = "One";
Plural[Plural.Two] = "Two";
Plural[Plural.Few] = "Few";
Plural[Plural.Many] = "Many";
Plural[Plural.Other] = "Other";
/** @enum {number} */
const FormStyle = {
    Format: 0,
    Standalone: 1,
};
export { FormStyle };
FormStyle[FormStyle.Format] = "Format";
FormStyle[FormStyle.Standalone] = "Standalone";
/** @enum {number} */
const TranslationWidth = {
    Narrow: 0,
    Abbreviated: 1,
    Wide: 2,
    Short: 3,
};
export { TranslationWidth };
TranslationWidth[TranslationWidth.Narrow] = "Narrow";
TranslationWidth[TranslationWidth.Abbreviated] = "Abbreviated";
TranslationWidth[TranslationWidth.Wide] = "Wide";
TranslationWidth[TranslationWidth.Short] = "Short";
/** @enum {number} */
const FormatWidth = {
    Short: 0,
    Medium: 1,
    Long: 2,
    Full: 3,
};
export { FormatWidth };
FormatWidth[FormatWidth.Short] = "Short";
FormatWidth[FormatWidth.Medium] = "Medium";
FormatWidth[FormatWidth.Long] = "Long";
FormatWidth[FormatWidth.Full] = "Full";
/** @enum {number} */
const NumberSymbol = {
    Decimal: 0,
    Group: 1,
    List: 2,
    PercentSign: 3,
    PlusSign: 4,
    MinusSign: 5,
    Exponential: 6,
    SuperscriptingExponent: 7,
    PerMille: 8,
    Infinity: 9,
    NaN: 10,
    TimeSeparator: 11,
    CurrencyDecimal: 12,
    CurrencyGroup: 13,
};
export { NumberSymbol };
NumberSymbol[NumberSymbol.Decimal] = "Decimal";
NumberSymbol[NumberSymbol.Group] = "Group";
NumberSymbol[NumberSymbol.List] = "List";
NumberSymbol[NumberSymbol.PercentSign] = "PercentSign";
NumberSymbol[NumberSymbol.PlusSign] = "PlusSign";
NumberSymbol[NumberSymbol.MinusSign] = "MinusSign";
NumberSymbol[NumberSymbol.Exponential] = "Exponential";
NumberSymbol[NumberSymbol.SuperscriptingExponent] = "SuperscriptingExponent";
NumberSymbol[NumberSymbol.PerMille] = "PerMille";
NumberSymbol[NumberSymbol.Infinity] = "Infinity";
NumberSymbol[NumberSymbol.NaN] = "NaN";
NumberSymbol[NumberSymbol.TimeSeparator] = "TimeSeparator";
NumberSymbol[NumberSymbol.CurrencyDecimal] = "CurrencyDecimal";
NumberSymbol[NumberSymbol.CurrencyGroup] = "CurrencyGroup";
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
WeekDay[WeekDay.Sunday] = "Sunday";
WeekDay[WeekDay.Monday] = "Monday";
WeekDay[WeekDay.Tuesday] = "Tuesday";
WeekDay[WeekDay.Wednesday] = "Wednesday";
WeekDay[WeekDay.Thursday] = "Thursday";
WeekDay[WeekDay.Friday] = "Friday";
WeekDay[WeekDay.Saturday] = "Saturday";
/**
 * The locale id for the chosen locale (e.g `en-GB`).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleId(locale) {
    return findLocaleData(locale)[0 /* LocaleId */];
}
/**
 * Periods of the day (e.g. `[AM, PM]` for en-US).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ amPmData = /** @type {?} */ ([data[1 /* DayPeriodsFormat */], data[2 /* DayPeriodsStandalone */]]);
    const /** @type {?} */ amPm = getLastDefinedValue(amPmData, formStyle);
    return getLastDefinedValue(amPm, width);
}
/**
 * Days of the week for the Gregorian calendar (e.g. `[Sunday, Monday, ... Saturday]` for en-US).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleDayNames(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ daysData = /** @type {?} */ ([data[3 /* DaysFormat */], data[4 /* DaysStandalone */]]);
    const /** @type {?} */ days = getLastDefinedValue(daysData, formStyle);
    return getLastDefinedValue(days, width);
}
/**
 * Months of the year for the Gregorian calendar (e.g. `[January, February, ...]` for en-US).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ monthsData = /** @type {?} */ ([data[5 /* MonthsFormat */], data[6 /* MonthsStandalone */]]);
    const /** @type {?} */ months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Eras for the Gregorian calendar (e.g. AD/BC).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleEraNames(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ erasData = /** @type {?} */ (data[7 /* Eras */]);
    return getLastDefinedValue(erasData, width);
}
/**
 * First day of the week for this locale, based on english days (Sunday = 0, Monday = 1, ...).
 * For example in french the value would be 1 because the first day of the week is Monday.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleFirstDayOfWeek(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[8 /* FirstDayOfWeek */];
}
/**
 * Range of days in the week that represent the week-end for this locale, based on english days
 * (Sunday = 0, Monday = 1, ...).
 * For example in english the value would be [6,0] for Saturday to Sunday.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleWeekEndRange(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[9 /* WeekendRange */];
}
/**
 * Date format that depends on the locale.
 *
 * There are four basic date formats:
 * - `full` should contain long-weekday (EEEE), year (y), long-month (MMMM), day (d).
 *
 *  For example, English uses `EEEE, MMMM d, y`, corresponding to a date like
 *  "Tuesday, September 14, 1999".
 *
 * - `long` should contain year, long-month, day.
 *
 *  For example, `MMMM d, y`, corresponding to a date like "September 14, 1999".
 *
 * - `medium` should contain year, abbreviated-month (MMM), day.
 *
 *  For example, `MMM d, y`, corresponding to a date like "Sep 14, 1999".
 *  For languages that do not use abbreviated months, use the numeric month (MM/M). For example,
 *  `y/MM/dd`, corresponding to a date like "1999/09/14".
 *
 * - `short` should contain year, numeric-month (MM/M), and day.
 *
 *  For example, `M/d/yy`, corresponding to a date like "9/14/99".
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleDateFormat(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    return getLastDefinedValue(data[10 /* DateFormat */], width);
}
/**
 * Time format that depends on the locale.
 *
 * The standard formats include four basic time formats:
 * - `full` should contain hour (h/H), minute (mm), second (ss), and zone (zzzz).
 * - `long` should contain hour, minute, second, and zone (z)
 * - `medium` should contain hour, minute, second.
 * - `short` should contain hour, minute.
 *
 * Note: The patterns depend on whether the main country using your language uses 12-hour time or
 * not:
 * - For 12-hour time, use a pattern like `hh:mm a` using h to mean a 12-hour clock cycle running
 * 1 through 12 (midnight plus 1 minute is 12:01), or using K to mean a 12-hour clock cycle
 * running 0 through 11 (midnight plus 1 minute is 0:01).
 * - For 24-hour time, use a pattern like `HH:mm` using H to mean a 24-hour clock cycle running 0
 * through 23 (midnight plus 1 minute is 0:01), or using k to mean a 24-hour clock cycle running
 * 1 through 24 (midnight plus 1 minute is 24:01).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleTimeFormat(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    return getLastDefinedValue(data[11 /* TimeFormat */], width);
}
/**
 * Date-time format that depends on the locale.
 *
 * The date-time pattern shows how to combine separate patterns for date (represented by {1})
 * and time (represented by {0}) into a single pattern. It usually doesn't need to be changed.
 * What you want to pay attention to are:
 * - possibly removing a space for languages that don't use it, such as many East Asian languages
 * - possibly adding a comma, other punctuation, or a combining word
 *
 * For example:
 * - English uses `{1} 'at' {0}` or `{1}, {0}` (depending on date style), while Japanese uses
 *  `{1}{0}`.
 * - An English formatted date-time using the combining pattern `{1}, {0}` could be
 *  `Dec 10, 2010, 3:59:49 PM`. Notice the comma and space between the date portion and the time
 *  portion.
 *
 * There are four formats (`full`, `long`, `medium`, `short`); the determination of which to use
 * is normally based on the date style. For example, if the date has a full month and weekday
 * name, the full combining pattern will be used to combine that with a time. If the date has
 * numeric month, the short version of the combining pattern will be used to combine that with a
 * time. English uses `{1} 'at' {0}` for full and long styles, and `{1}, {0}` for medium and short
 * styles.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleDateTimeFormat(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ dateTimeFormatData = /** @type {?} */ (data[12 /* DateTimeFormat */]);
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Number symbol that can be used to replace placeholders in number formats.
 * See {\@link NumberSymbol} for more information.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} symbol
 * @return {?}
 */
export function getLocaleNumberSymbol(locale, symbol) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ res = data[13 /* NumberSymbols */][symbol];
    if (typeof res === 'undefined') {
        if (symbol === NumberSymbol.CurrencyDecimal) {
            return data[13 /* NumberSymbols */][NumberSymbol.Decimal];
        }
        else if (symbol === NumberSymbol.CurrencyGroup) {
            return data[13 /* NumberSymbols */][NumberSymbol.Group];
        }
    }
    return res;
}
/**
 * Number format that depends on the locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,67". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders;
 * they stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders; for example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the Number Symbols for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | This will be replaced by a currency symbol, such as $ or USD. |
 * | % | This marks a percent format. The % symbol may change position, but must be retained. |
 * | E | This marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * You can find more information
 * [on the CLDR website](http://cldr.unicode.org/translation/number-patterns)
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} type
 * @return {?}
 */
export function getLocaleNumberFormat(locale, type) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[14 /* NumberFormats */][type];
}
/**
 * The symbol used to represent the currency for the main country using this locale (e.g. $ for
 * the locale en-US).
 * The symbol will be `null` if the main country cannot be determined.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleCurrencySymbol(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[15 /* CurrencySymbol */] || null;
}
/**
 * The name of the currency for the main country using this locale (e.g. USD for the locale
 * en-US).
 * The name will be `null` if the main country cannot be determined.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleCurrencyName(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[16 /* CurrencyName */] || null;
}
/**
 * Returns the currency values for the locale
 * @param {?} locale
 * @return {?}
 */
function getLocaleCurrencies(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[17 /* Currencies */];
}
/**
 * The locale plural function used by ICU expressions to determine the plural case to use.
 * See {\@link NgPlural} for more information.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocalePluralCase(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[18 /* PluralCase */];
}
/**
 * @param {?} data
 * @return {?}
 */
function checkFullData(data) {
    if (!data[19 /* ExtraData */]) {
        throw new Error(`Missing extra locale data for the locale "${data[0 /* LocaleId */]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
    }
}
/**
 * Rules used to determine which day period to use (See `dayPeriods` below).
 * The rules can either be an array or a single value. If it's an array, consider it as "from"
 * and "to". If it's a single value then it means that the period is only valid at this exact
 * value.
 * There is always the same number of rules as the number of day periods, which means that the
 * first rule is applied to the first day period and so on.
 * You should fallback to AM/PM when there are no rules available.
 *
 * Note: this is only available if you load the full locale data.
 * See the {\@linkDocs guide/i18n#i18n-pipes "I18n guide"} to know how to import additional locale
 * data.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleExtraDayPeriodRules(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    checkFullData(data);
    const /** @type {?} */ rules = data[19 /* ExtraData */][2 /* ExtraDayPeriodsRules */] || [];
    return rules.map((rule) => {
        if (typeof rule === 'string') {
            return extractTime(rule);
        }
        return [extractTime(rule[0]), extractTime(rule[1])];
    });
}
/**
 * Day Periods indicate roughly how the day is broken up in different languages (e.g. morning,
 * noon, afternoon, midnight, ...).
 * You should use the function {\@link getLocaleExtraDayPeriodRules} to determine which period to
 * use.
 * You should fallback to AM/PM when there are no day periods available.
 *
 * Note: this is only available if you load the full locale data.
 * See the {\@linkDocs guide/i18n#i18n-pipes "I18n guide"} to know how to import additional locale
 * data.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    checkFullData(data);
    const /** @type {?} */ dayPeriodsData = /** @type {?} */ ([
        data[19 /* ExtraData */][0 /* ExtraDayPeriodFormats */],
        data[19 /* ExtraData */][1 /* ExtraDayPeriodStandalone */]
    ]);
    const /** @type {?} */ dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Returns the first value that is defined in an array, going backwards.
 *
 * To avoid repeating the same data (e.g. when "format" and "standalone" are the same) we only
 * add the first one to the locale data arrays, the other ones are only defined when different.
 * We use this function to retrieve the first defined value.
 *
 * \@experimental i18n support is experimental.
 * @template T
 * @param {?} data
 * @param {?} index
 * @return {?}
 */
function getLastDefinedValue(data, index) {
    for (let /** @type {?} */ i = index; i > -1; i--) {
        if (typeof data[i] !== 'undefined') {
            return data[i];
        }
    }
    throw new Error('Locale data API: locale data undefined');
}
/**
 * Extract the hours and minutes from a string like "15:45"
 * @param {?} time
 * @return {?}
 */
function extractTime(time) {
    const [h, m] = time.split(':');
    return { hours: +h, minutes: +m };
}
/**
 * Finds the locale data for a locale id
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function findLocaleData(locale) {
    const /** @type {?} */ normalizedLocale = locale.toLowerCase().replace(/_/g, '-');
    let /** @type {?} */ match = LOCALE_DATA[normalizedLocale];
    if (match) {
        return match;
    }
    // let's try to find a parent locale
    const /** @type {?} */ parentLocale = normalizedLocale.split('-')[0];
    match = LOCALE_DATA[parentLocale];
    if (match) {
        return match;
    }
    if (parentLocale === 'en') {
        return localeEn;
    }
    throw new Error(`Missing locale data for the locale "${locale}".`);
}
/**
 * Returns the currency symbol for a given currency code, or the code if no symbol available
 * (e.g.: format narrow = $, format wide = US$, code = USD)
 * If no locale is provided, it uses the locale "en" by default
 *
 * \@experimental i18n support is experimental.
 * @param {?} code
 * @param {?} format
 * @param {?=} locale
 * @return {?}
 */
export function getCurrencySymbol(code, format, locale = 'en') {
    const /** @type {?} */ currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    const /** @type {?} */ symbolNarrow = currency[1 /* SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
const /** @type {?} */ DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Returns the number of decimal digits for the given currency.
 * Its value depends upon the presence of cents in that particular currency.
 *
 * \@experimental i18n support is experimental.
 * @param {?} code
 * @return {?}
 */
export function getNumberOfCurrencyDigits(code) {
    let /** @type {?} */ digits;
    const /** @type {?} */ currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
//# sourceMappingURL=locale_data_api.js.map