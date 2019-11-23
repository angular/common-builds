/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read } from "tslib";
import { ɵLocaleDataIndex, ɵfindLocaleData, ɵgetLocalePluralCase } from '@angular/core';
import { CURRENCIES_EN } from './currencies';
/**
 * Format styles that can be used to represent numbers.
 * @see `getLocaleNumberFormat()`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
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
 * @see `NgPlural`
 * @see `NgPluralCase`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
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
 * @see [CLDR website](http://cldr.unicode.org/translation/date-time#TOC-Stand-Alone-vs.-Format-Styles)
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
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
 * @see `getLocaleDateFormat()`
 * @see `getLocaleTimeFormat()``
 * @see `getLocaleDateTimeFormat()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
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
 * @see `getLocaleNumberSymbol()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export var NumberSymbol;
(function (NumberSymbol) {
    /**
     * Decimal separator.
     * For `en-US`, the dot character.
     * Example : 2,345`.`67
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
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
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
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    var data = ɵfindLocaleData(locale);
    var amPmData = [data[ɵLocaleDataIndex.DayPeriodsFormat], data[ɵLocaleDataIndex.DayPeriodsStandalone]];
    var amPm = getLastDefinedValue(amPmData, formStyle);
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
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleDayNames(locale, formStyle, width) {
    var data = ɵfindLocaleData(locale);
    var daysData = [data[ɵLocaleDataIndex.DaysFormat], data[ɵLocaleDataIndex.DaysStandalone]];
    var days = getLastDefinedValue(daysData, formStyle);
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
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    var data = ɵfindLocaleData(locale);
    var monthsData = [data[ɵLocaleDataIndex.MonthsFormat], data[ɵLocaleDataIndex.MonthsStandalone]];
    var months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Retrieves Gregorian-calendar eras for the given locale.
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.

 * @returns An array of localized era strings.
 * For example, `[AD, BC]` for `en-US`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleEraNames(locale, width) {
    var data = ɵfindLocaleData(locale);
    var erasData = data[ɵLocaleDataIndex.Eras];
    return getLastDefinedValue(erasData, width);
}
/**
 * Retrieves the first day of the week for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns A day index number, using the 0-based week-day index for `en-US`
 * (Sunday = 0, Monday = 1, ...).
 * For example, for `fr-FR`, returns 1 to indicate that the first day is Monday.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleFirstDayOfWeek(locale) {
    var data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.FirstDayOfWeek];
}
/**
 * Range of week days that are considered the week-end for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The range of day values, `[startDay, endDay]`.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleWeekEndRange(locale) {
    var data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.WeekendRange];
}
/**
 * Retrieves a localized date-value formating string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formating string.
 * @see `FormatWidth`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleDateFormat(locale, width) {
    var data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.DateFormat], width);
}
/**
 * Retrieves a localized time-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see `FormatWidth`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)

 * @publicApi
 */
export function getLocaleTimeFormat(locale, width) {
    var data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.TimeFormat], width);
}
/**
 * Retrieves a localized date-time formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see `FormatWidth`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleDateTimeFormat(locale, width) {
    var data = ɵfindLocaleData(locale);
    var dateTimeFormatData = data[ɵLocaleDataIndex.DateTimeFormat];
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Retrieves a localized number symbol that can be used to replace placeholders in number formats.
 * @param locale The locale code.
 * @param symbol The symbol to localize.
 * @returns The character for the localized symbol.
 * @see `NumberSymbol`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleNumberSymbol(locale, symbol) {
    var data = ɵfindLocaleData(locale);
    var res = data[ɵLocaleDataIndex.NumberSymbols][symbol];
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
 * @see `NumberFormatStyle`
 * @see [CLDR website](http://cldr.unicode.org/translation/number-patterns)
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleNumberFormat(locale, type) {
    var data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.NumberFormats][type];
}
/**
 * Retrieves the symbol used to represent the currency for the main country
 * corresponding to a given locale. For example, '$' for `en-US`.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The localized symbol character,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleCurrencySymbol(locale) {
    var data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencySymbol] || null;
}
/**
 * Retrieves the name of the currency for the main country corresponding
 * to a given locale. For example, 'US Dollar' for `en-US`.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency name,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleCurrencyName(locale) {
    var data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencyName] || null;
}
/**
 * Retrieves the currency values for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency values.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 */
function getLocaleCurrencies(locale) {
    var data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.Currencies];
}
/**
 * @alias core/ɵgetLocalePluralCase
 * @publicApi
 */
export var getLocalePluralCase = ɵgetLocalePluralCase;
function checkFullData(data) {
    if (!data[ɵLocaleDataIndex.ExtraData]) {
        throw new Error("Missing extra locale data for the locale \"" + data[ɵLocaleDataIndex.LocaleId] + "\". Use \"registerLocaleData\" to load new data. See the \"I18n guide\" on angular.io to know more.");
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
 * @param locale A locale code for the locale format rules to use.
 * @returns The rules for the locale, a single time value or array of *from-time, to-time*,
 * or null if no periods are available.
 *
 * @see `getLocaleExtraDayPeriods()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriodRules(locale) {
    var data = ɵfindLocaleData(locale);
    checkFullData(data);
    var rules = data[ɵLocaleDataIndex.ExtraData][2 /* ExtraDayPeriodsRules */] || [];
    return rules.map(function (rule) {
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
 * See the ["I18n guide"](guide/i18n#i18n-pipes).
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns The translated day-period strings.
 * @see `getLocaleExtraDayPeriodRules()`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    var data = ɵfindLocaleData(locale);
    checkFullData(data);
    var dayPeriodsData = [
        data[ɵLocaleDataIndex.ExtraData][0 /* ExtraDayPeriodFormats */],
        data[ɵLocaleDataIndex.ExtraData][1 /* ExtraDayPeriodStandalone */]
    ];
    var dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
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
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
function getLastDefinedValue(data, index) {
    for (var i = index; i > -1; i--) {
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
    var _a = __read(time.split(':'), 2), h = _a[0], m = _a[1];
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
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getCurrencySymbol(code, format, locale) {
    if (locale === void 0) { locale = 'en'; }
    var currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    var symbolNarrow = currency[1 /* SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
var DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Reports the number of decimal digits for a given currency.
 * The value depends upon the presence of cents in that particular currency.
 *
 * @param code The currency code.
 * @returns The number of decimal digits, typically 0 or 2.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function getNumberOfCurrencyDigits(code) {
    var digits;
    var currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUF3QyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0gsT0FBTyxFQUFDLGFBQWEsRUFBb0IsTUFBTSxjQUFjLENBQUM7QUFFOUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFOLElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUMzQiwrREFBTyxDQUFBO0lBQ1AsK0RBQU8sQ0FBQTtJQUNQLGlFQUFRLENBQUE7SUFDUixxRUFBVSxDQUFBO0FBQ1osQ0FBQyxFQUxXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFLNUI7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBTixJQUFZLE1BT1g7QUFQRCxXQUFZLE1BQU07SUFDaEIsbUNBQVEsQ0FBQTtJQUNSLGlDQUFPLENBQUE7SUFDUCxpQ0FBTyxDQUFBO0lBQ1AsaUNBQU8sQ0FBQTtJQUNQLG1DQUFRLENBQUE7SUFDUixxQ0FBUyxDQUFBO0FBQ1gsQ0FBQyxFQVBXLE1BQU0sS0FBTixNQUFNLFFBT2pCO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQU4sSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ25CLDZDQUFNLENBQUE7SUFDTixxREFBVSxDQUFBO0FBQ1osQ0FBQyxFQUhXLFNBQVMsS0FBVCxTQUFTLFFBR3BCO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFOLElBQVksZ0JBU1g7QUFURCxXQUFZLGdCQUFnQjtJQUMxQixnREFBZ0Q7SUFDaEQsMkRBQU0sQ0FBQTtJQUNOLG1EQUFtRDtJQUNuRCxxRUFBVyxDQUFBO0lBQ1gscURBQXFE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QVEsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7UUFDM0QsT0FBTyxZQUFZLENBQUM7S0FDckI7SUFFRCxPQUFPLFFBQVEsZ0JBQXVCLElBQUksSUFBSSxDQUFDO0FBQ2pELENBQUM7QUFFRCwwREFBMEQ7QUFDMUQsSUFBTSw2QkFBNkIsR0FBRyxDQUFDLENBQUM7QUFFeEM7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUFDLElBQVk7SUFDcEQsSUFBSSxNQUFNLENBQUM7SUFDWCxJQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsSUFBSSxRQUFRLEVBQUU7UUFDWixNQUFNLEdBQUcsUUFBUSxvQkFBMkIsQ0FBQztLQUM5QztJQUNELE9BQU8sT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDO0FBQzdFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVDdXJyZW5jeUluZGV4LCDJtUV4dHJhTG9jYWxlRGF0YUluZGV4LCDJtUxvY2FsZURhdGFJbmRleCwgybVmaW5kTG9jYWxlRGF0YSwgybVnZXRMb2NhbGVQbHVyYWxDYXNlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q1VSUkVOQ0lFU19FTiwgQ3VycmVuY2llc1N5bWJvbHN9IGZyb20gJy4vY3VycmVuY2llcyc7XG5cbi8qKlxuICogRm9ybWF0IHN0eWxlcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcHJlc2VudCBudW1iZXJzLlxuICogQHNlZSBgZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KClgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIE51bWJlckZvcm1hdFN0eWxlIHtcbiAgRGVjaW1hbCxcbiAgUGVyY2VudCxcbiAgQ3VycmVuY3ksXG4gIFNjaWVudGlmaWNcbn1cblxuLyoqXG4gKiBQbHVyYWxpdHkgY2FzZXMgdXNlZCBmb3IgdHJhbnNsYXRpbmcgcGx1cmFscyB0byBkaWZmZXJlbnQgbGFuZ3VhZ2VzLlxuICpcbiAqIEBzZWUgYE5nUGx1cmFsYFxuICogQHNlZSBgTmdQbHVyYWxDYXNlYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIFBsdXJhbCB7XG4gIFplcm8gPSAwLFxuICBPbmUgPSAxLFxuICBUd28gPSAyLFxuICBGZXcgPSAzLFxuICBNYW55ID0gNCxcbiAgT3RoZXIgPSA1LFxufVxuXG4vKipcbiAqIENvbnRleHQtZGVwZW5kYW50IHRyYW5zbGF0aW9uIGZvcm1zIGZvciBzdHJpbmdzLlxuICogVHlwaWNhbGx5IHRoZSBzdGFuZGFsb25lIHZlcnNpb24gaXMgZm9yIHRoZSBub21pbmF0aXZlIGZvcm0gb2YgdGhlIHdvcmQsXG4gKiBhbmQgdGhlIGZvcm1hdCB2ZXJzaW9uIGlzIHVzZWQgZm9yIHRoZSBnZW5pdGl2ZSBjYXNlLlxuICogQHNlZSBbQ0xEUiB3ZWJzaXRlXShodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9kYXRlLXRpbWUjVE9DLVN0YW5kLUFsb25lLXZzLi1Gb3JtYXQtU3R5bGVzKVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEZvcm1TdHlsZSB7XG4gIEZvcm1hdCxcbiAgU3RhbmRhbG9uZVxufVxuXG4vKipcbiAqIFN0cmluZyB3aWR0aHMgYXZhaWxhYmxlIGZvciB0cmFuc2xhdGlvbnMuXG4gKiBUaGUgc3BlY2lmaWMgY2hhcmFjdGVyIHdpZHRocyBhcmUgbG9jYWxlLXNwZWNpZmljLlxuICogRXhhbXBsZXMgYXJlIGdpdmVuIGZvciB0aGUgd29yZCBcIlN1bmRheVwiIGluIEVuZ2xpc2guXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBUcmFuc2xhdGlvbldpZHRoIHtcbiAgLyoqIDEgY2hhcmFjdGVyIGZvciBgZW4tVVNgLiBGb3IgZXhhbXBsZTogJ1MnICovXG4gIE5hcnJvdyxcbiAgLyoqIDMgY2hhcmFjdGVycyBmb3IgYGVuLVVTYC4gRm9yIGV4YW1wbGU6ICdTdW4nICovXG4gIEFiYnJldmlhdGVkLFxuICAvKiogRnVsbCBsZW5ndGggZm9yIGBlbi1VU2AuIEZvciBleGFtcGxlOiBcIlN1bmRheVwiICovXG4gIFdpZGUsXG4gIC8qKiAyIGNoYXJhY3RlcnMgZm9yIGBlbi1VU2AsIEZvciBleGFtcGxlOiBcIlN1XCIgKi9cbiAgU2hvcnRcbn1cblxuLyoqXG4gKiBTdHJpbmcgd2lkdGhzIGF2YWlsYWJsZSBmb3IgZGF0ZS10aW1lIGZvcm1hdHMuXG4gKiBUaGUgc3BlY2lmaWMgY2hhcmFjdGVyIHdpZHRocyBhcmUgbG9jYWxlLXNwZWNpZmljLlxuICogRXhhbXBsZXMgYXJlIGdpdmVuIGZvciBgZW4tVVNgLlxuICpcbiAqIEBzZWUgYGdldExvY2FsZURhdGVGb3JtYXQoKWBcbiAqIEBzZWUgYGdldExvY2FsZVRpbWVGb3JtYXQoKWBgXG4gKiBAc2VlIGBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdCgpYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gRm9ybWF0V2lkdGgge1xuICAvKipcbiAgICogRm9yIGBlbi1VU2AsICdNL2QveXksIGg6bW0gYSdgXG4gICAqIChFeGFtcGxlOiBgNi8xNS8xNSwgOTowMyBBTWApXG4gICAqL1xuICBTaG9ydCxcbiAgLyoqXG4gICAqIEZvciBgZW4tVVNgLCBgJ01NTSBkLCB5LCBoOm1tOnNzIGEnYFxuICAgKiAoRXhhbXBsZTogYEp1biAxNSwgMjAxNSwgOTowMzowMSBBTWApXG4gICAqL1xuICBNZWRpdW0sXG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgYCdNTU1NIGQsIHksIGg6bW06c3MgYSB6J2BcbiAgICogKEV4YW1wbGU6IGBKdW5lIDE1LCAyMDE1IGF0IDk6MDM6MDEgQU0gR01UKzFgKVxuICAgKi9cbiAgTG9uZyxcbiAgLyoqXG4gICAqIEZvciBgZW4tVVNgLCBgJ0VFRUUsIE1NTU0gZCwgeSwgaDptbTpzcyBhIHp6enonYFxuICAgKiAoRXhhbXBsZTogYE1vbmRheSwgSnVuZSAxNSwgMjAxNSBhdCA5OjAzOjAxIEFNIEdNVCswMTowMGApXG4gICAqL1xuICBGdWxsXG59XG5cbi8qKlxuICogU3ltYm9scyB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIG51bWJlciBwYXR0ZXJucy5cbiAqIEV4YW1wbGVzIGFyZSBiYXNlZCBvbiBgZW4tVVNgIHZhbHVlcy5cbiAqXG4gKiBAc2VlIGBnZXRMb2NhbGVOdW1iZXJTeW1ib2woKWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBOdW1iZXJTeW1ib2wge1xuICAvKipcbiAgICogRGVjaW1hbCBzZXBhcmF0b3IuXG4gICAqIEZvciBgZW4tVVNgLCB0aGUgZG90IGNoYXJhY3Rlci5cbiAgICogRXhhbXBsZSA6IDIsMzQ1YC5gNjdcbiAgICovXG4gIERlY2ltYWwsXG4gIC8qKlxuICAgKiBHcm91cGluZyBzZXBhcmF0b3IsIHR5cGljYWxseSBmb3IgdGhvdXNhbmRzLlxuICAgKiBGb3IgYGVuLVVTYCwgdGhlIGNvbW1hIGNoYXJhY3Rlci5cbiAgICogRXhhbXBsZTogMmAsYDM0NS42N1xuICAgKi9cbiAgR3JvdXAsXG4gIC8qKlxuICAgKiBMaXN0LWl0ZW0gc2VwYXJhdG9yLlxuICAgKiBFeGFtcGxlOiBcIm9uZSwgdHdvLCBhbmQgdGhyZWVcIlxuICAgKi9cbiAgTGlzdCxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcmNlbnRhZ2UgKG91dCBvZiAxMDApLlxuICAgKiBFeGFtcGxlOiAyMy40JVxuICAgKi9cbiAgUGVyY2VudFNpZ24sXG4gIC8qKlxuICAgKiBTaWduIGZvciBwb3NpdGl2ZSBudW1iZXJzLlxuICAgKiBFeGFtcGxlOiArMjNcbiAgICovXG4gIFBsdXNTaWduLFxuICAvKipcbiAgICogU2lnbiBmb3IgbmVnYXRpdmUgbnVtYmVycy5cbiAgICogRXhhbXBsZTogLTIzXG4gICAqL1xuICBNaW51c1NpZ24sXG4gIC8qKlxuICAgKiBDb21wdXRlciBub3RhdGlvbiBmb3IgZXhwb25lbnRpYWwgdmFsdWUgKG4gdGltZXMgYSBwb3dlciBvZiAxMCkuXG4gICAqIEV4YW1wbGU6IDEuMkUzXG4gICAqL1xuICBFeHBvbmVudGlhbCxcbiAgLyoqXG4gICAqIEh1bWFuLXJlYWRhYmxlIGZvcm1hdCBvZiBleHBvbmVudGlhbC5cbiAgICogRXhhbXBsZTogMS4yeDEwM1xuICAgKi9cbiAgU3VwZXJzY3JpcHRpbmdFeHBvbmVudCxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIHBlcm1pbGxlIChvdXQgb2YgMTAwMCkuXG4gICAqIEV4YW1wbGU6IDIzLjTigLBcbiAgICovXG4gIFBlck1pbGxlLFxuICAvKipcbiAgICogSW5maW5pdHksIGNhbiBiZSB1c2VkIHdpdGggcGx1cyBhbmQgbWludXMuXG4gICAqIEV4YW1wbGU6IOKIniwgK+KIniwgLeKInlxuICAgKi9cbiAgSW5maW5pdHksXG4gIC8qKlxuICAgKiBOb3QgYSBudW1iZXIuXG4gICAqIEV4YW1wbGU6IE5hTlxuICAgKi9cbiAgTmFOLFxuICAvKipcbiAgICogU3ltYm9sIHVzZWQgYmV0d2VlbiB0aW1lIHVuaXRzLlxuICAgKiBFeGFtcGxlOiAxMDo1MlxuICAgKi9cbiAgVGltZVNlcGFyYXRvcixcbiAgLyoqXG4gICAqIERlY2ltYWwgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBEZWNpbWFsYCkuXG4gICAqIEV4YW1wbGU6ICQyLDM0NS42N1xuICAgKi9cbiAgQ3VycmVuY3lEZWNpbWFsLFxuICAvKipcbiAgICogR3JvdXAgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBHcm91cGApLlxuICAgKiBFeGFtcGxlOiAkMiwzNDUuNjdcbiAgICovXG4gIEN1cnJlbmN5R3JvdXBcbn1cblxuLyoqXG4gKiBUaGUgdmFsdWUgZm9yIGVhY2ggZGF5IG9mIHRoZSB3ZWVrLCBiYXNlZCBvbiB0aGUgYGVuLVVTYCBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIFdlZWtEYXkge1xuICBTdW5kYXkgPSAwLFxuICBNb25kYXksXG4gIFR1ZXNkYXksXG4gIFdlZG5lc2RheSxcbiAgVGh1cnNkYXksXG4gIEZyaWRheSxcbiAgU2F0dXJkYXlcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGxvY2FsZSBJRCBmcm9tIHRoZSBjdXJyZW50bHkgbG9hZGVkIGxvY2FsZS5cbiAqIFRoZSBsb2FkZWQgbG9jYWxlIGNvdWxkIGJlLCBmb3IgZXhhbXBsZSwgYSBnbG9iYWwgb25lIHJhdGhlciB0aGFuIGEgcmVnaW9uYWwgb25lLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlLCBzdWNoIGFzIGBmci1GUmAuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxlIGNvZGUuIEZvciBleGFtcGxlLCBgZnJgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVJZChsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSlbybVMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBkYXkgcGVyaW9kIHN0cmluZ3MgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgcGVyaW9kIHN0cmluZ3MuIEZvciBleGFtcGxlLCBgW0FNLCBQTV1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXlQZXJpb2RzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgYW1QbURhdGEgPSA8W1xuICAgIHN0cmluZywgc3RyaW5nXG4gIF1bXVtdPltkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRheVBlcmlvZHNGb3JtYXRdLCBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRheVBlcmlvZHNTdGFuZGFsb25lXV07XG4gIGNvbnN0IGFtUG0gPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGFtUG1EYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShhbVBtLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGRheXMgb2YgdGhlIHdlZWsgZm9yIHRoZSBnaXZlbiBsb2NhbGUsIHVzaW5nIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgbmFtZSBzdHJpbmdzLlxuICogRm9yIGV4YW1wbGUsYFtTdW5kYXksIE1vbmRheSwgLi4uIFNhdHVyZGF5XWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURheU5hbWVzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRheXNEYXRhID1cbiAgICAgIDxzdHJpbmdbXVtdW10+W2RhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5c0Zvcm1hdF0sIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5c1N0YW5kYWxvbmVdXTtcbiAgY29uc3QgZGF5cyA9IGdldExhc3REZWZpbmVkVmFsdWUoZGF5c0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXMsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgbW9udGhzIG9mIHRoZSB5ZWFyIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLCB1c2luZyB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgbG9jYWxpemVkIG5hbWUgc3RyaW5ncy5cbiAqIEZvciBleGFtcGxlLCAgYFtKYW51YXJ5LCBGZWJydWFyeSwgLi4uXWAgZm9yIGBlbi1VU2AuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU1vbnRoTmFtZXMoXG4gICAgbG9jYWxlOiBzdHJpbmcsIGZvcm1TdHlsZTogRm9ybVN0eWxlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCk6IHN0cmluZ1tdIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgbW9udGhzRGF0YSA9XG4gICAgICA8c3RyaW5nW11bXVtdPltkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk1vbnRoc0Zvcm1hdF0sIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTW9udGhzU3RhbmRhbG9uZV1dO1xuICBjb25zdCBtb250aHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRoc0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRocywgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBHcmVnb3JpYW4tY2FsZW5kYXIgZXJhcyBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGZvcm1TdHlsZSBUaGUgcmVxdWlyZWQgZ3JhbW1hdGljYWwgZm9ybS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgcmVxdWlyZWQgY2hhcmFjdGVyIHdpZHRoLlxuXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgZXJhIHN0cmluZ3MuXG4gKiBGb3IgZXhhbXBsZSwgYFtBRCwgQkNdYCBmb3IgYGVuLVVTYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXJhTmFtZXMobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGVyYXNEYXRhID0gPFtzdHJpbmcsIHN0cmluZ11bXT5kYXRhW8m1TG9jYWxlRGF0YUluZGV4LkVyYXNdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShlcmFzRGF0YSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgQSBkYXkgaW5kZXggbnVtYmVyLCB1c2luZyB0aGUgMC1iYXNlZCB3ZWVrLWRheSBpbmRleCBmb3IgYGVuLVVTYFxuICogKFN1bmRheSA9IDAsIE1vbmRheSA9IDEsIC4uLikuXG4gKiBGb3IgZXhhbXBsZSwgZm9yIGBmci1GUmAsIHJldHVybnMgMSB0byBpbmRpY2F0ZSB0aGF0IHRoZSBmaXJzdCBkYXkgaXMgTW9uZGF5LlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVGaXJzdERheU9mV2Vlayhsb2NhbGU6IHN0cmluZyk6IFdlZWtEYXkge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5GaXJzdERheU9mV2Vla107XG59XG5cbi8qKlxuICogUmFuZ2Ugb2Ygd2VlayBkYXlzIHRoYXQgYXJlIGNvbnNpZGVyZWQgdGhlIHdlZWstZW5kIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIHJhbmdlIG9mIGRheSB2YWx1ZXMsIGBbc3RhcnREYXksIGVuZERheV1gLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVXZWVrRW5kUmFuZ2UobG9jYWxlOiBzdHJpbmcpOiBbV2Vla0RheSwgV2Vla0RheV0ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5XZWVrZW5kUmFuZ2VdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCBkYXRlLXZhbHVlIGZvcm1hdGluZyBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gd2lkdGggVGhlIGZvcm1hdCB0eXBlLlxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXRpbmcgc3RyaW5nLlxuICogQHNlZSBgRm9ybWF0V2lkdGhgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF0ZUZvcm1hdF0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgdGltZS12YWx1ZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgZm9ybWF0IHR5cGUuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdHRpbmcgc3RyaW5nLlxuICogQHNlZSBgRm9ybWF0V2lkdGhgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRhW8m1TG9jYWxlRGF0YUluZGV4LlRpbWVGb3JtYXRdLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIGRhdGUtdGltZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgZm9ybWF0IHR5cGUuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdHRpbmcgc3RyaW5nLlxuICogQHNlZSBgRm9ybWF0V2lkdGhgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBkYXRlVGltZUZvcm1hdERhdGEgPSA8c3RyaW5nW10+ZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXRlVGltZUZvcm1hdF07XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGVUaW1lRm9ybWF0RGF0YSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIGxvY2FsaXplZCBudW1iZXIgc3ltYm9sIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gbnVtYmVyIGZvcm1hdHMuXG4gKiBAcGFyYW0gbG9jYWxlIFRoZSBsb2NhbGUgY29kZS5cbiAqIEBwYXJhbSBzeW1ib2wgVGhlIHN5bWJvbCB0byBsb2NhbGl6ZS5cbiAqIEByZXR1cm5zIFRoZSBjaGFyYWN0ZXIgZm9yIHRoZSBsb2NhbGl6ZWQgc3ltYm9sLlxuICogQHNlZSBgTnVtYmVyU3ltYm9sYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlOiBzdHJpbmcsIHN5bWJvbDogTnVtYmVyU3ltYm9sKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgcmVzID0gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtzeW1ib2xdO1xuICBpZiAodHlwZW9mIHJlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoc3ltYm9sID09PSBOdW1iZXJTeW1ib2wuQ3VycmVuY3lEZWNpbWFsKSB7XG4gICAgICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuRGVjaW1hbF07XG4gICAgfSBlbHNlIGlmIChzeW1ib2wgPT09IE51bWJlclN5bWJvbC5DdXJyZW5jeUdyb3VwKSB7XG4gICAgICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuR3JvdXBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIG51bWJlciBmb3JtYXQgZm9yIGEgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIE51bWJlcnMgYXJlIGZvcm1hdHRlZCB1c2luZyBwYXR0ZXJucywgbGlrZSBgIywjIyMuMDBgLiBGb3IgZXhhbXBsZSwgdGhlIHBhdHRlcm4gYCMsIyMjLjAwYFxuICogd2hlbiB1c2VkIHRvIGZvcm1hdCB0aGUgbnVtYmVyIDEyMzQ1LjY3OCBjb3VsZCByZXN1bHQgaW4gXCIxMiczNDUsNjc4XCIuIFRoYXQgd291bGQgaGFwcGVuIGlmIHRoZVxuICogZ3JvdXBpbmcgc2VwYXJhdG9yIGZvciB5b3VyIGxhbmd1YWdlIGlzIGFuIGFwb3N0cm9waGUsIGFuZCB0aGUgZGVjaW1hbCBzZXBhcmF0b3IgaXMgYSBjb21tYS5cbiAqXG4gKiA8Yj5JbXBvcnRhbnQ6PC9iPiBUaGUgY2hhcmFjdGVycyBgLmAgYCxgIGAwYCBgI2AgKGFuZCBvdGhlcnMgYmVsb3cpIGFyZSBzcGVjaWFsIHBsYWNlaG9sZGVyc1xuICogdGhhdCBzdGFuZCBmb3IgdGhlIGRlY2ltYWwgc2VwYXJhdG9yLCBhbmQgc28gb24sIGFuZCBhcmUgTk9UIHJlYWwgY2hhcmFjdGVycy5cbiAqIFlvdSBtdXN0IE5PVCBcInRyYW5zbGF0ZVwiIHRoZSBwbGFjZWhvbGRlcnMuIEZvciBleGFtcGxlLCBkb24ndCBjaGFuZ2UgYC5gIHRvIGAsYCBldmVuIHRob3VnaCBpblxuICogeW91ciBsYW5ndWFnZSB0aGUgZGVjaW1hbCBwb2ludCBpcyB3cml0dGVuIHdpdGggYSBjb21tYS4gVGhlIHN5bWJvbHMgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5IHRoZVxuICogbG9jYWwgZXF1aXZhbGVudHMsIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBgTnVtYmVyU3ltYm9sYCBmb3IgeW91ciBsYW5ndWFnZS5cbiAqXG4gKiBIZXJlIGFyZSB0aGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHVzZWQgaW4gbnVtYmVyIHBhdHRlcm5zOlxuICpcbiAqIHwgU3ltYm9sIHwgTWVhbmluZyB8XG4gKiB8LS0tLS0tLS18LS0tLS0tLS0tfFxuICogfCAuIHwgUmVwbGFjZWQgYXV0b21hdGljYWxseSBieSB0aGUgY2hhcmFjdGVyIHVzZWQgZm9yIHRoZSBkZWNpbWFsIHBvaW50LiB8XG4gKiB8ICwgfCBSZXBsYWNlZCBieSB0aGUgXCJncm91cGluZ1wiICh0aG91c2FuZHMpIHNlcGFyYXRvci4gfFxuICogfCAwIHwgUmVwbGFjZWQgYnkgYSBkaWdpdCAob3IgemVybyBpZiB0aGVyZSBhcmVuJ3QgZW5vdWdoIGRpZ2l0cykuIHxcbiAqIHwgIyB8IFJlcGxhY2VkIGJ5IGEgZGlnaXQgKG9yIG5vdGhpbmcgaWYgdGhlcmUgYXJlbid0IGVub3VnaCkuIHxcbiAqIHwgwqQgfCBSZXBsYWNlZCBieSBhIGN1cnJlbmN5IHN5bWJvbCwgc3VjaCBhcyAkIG9yIFVTRC4gfFxuICogfCAlIHwgTWFya3MgYSBwZXJjZW50IGZvcm1hdC4gVGhlICUgc3ltYm9sIG1heSBjaGFuZ2UgcG9zaXRpb24sIGJ1dCBtdXN0IGJlIHJldGFpbmVkLiB8XG4gKiB8IEUgfCBNYXJrcyBhIHNjaWVudGlmaWMgZm9ybWF0LiBUaGUgRSBzeW1ib2wgbWF5IGNoYW5nZSBwb3NpdGlvbiwgYnV0IG11c3QgYmUgcmV0YWluZWQuIHxcbiAqIHwgJyB8IFNwZWNpYWwgY2hhcmFjdGVycyB1c2VkIGFzIGxpdGVyYWwgY2hhcmFjdGVycyBhcmUgcXVvdGVkIHdpdGggQVNDSUkgc2luZ2xlIHF1b3Rlcy4gfFxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgbnVtZXJpYyB2YWx1ZSB0byBiZSBmb3JtYXR0ZWQgKHN1Y2ggYXMgYERlY2ltYWxgIG9yIGBDdXJyZW5jeWAuKVxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXQgc3RyaW5nLlxuICogQHNlZSBgTnVtYmVyRm9ybWF0U3R5bGVgXG4gKiBAc2VlIFtDTERSIHdlYnNpdGVdKGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL251bWJlci1wYXR0ZXJucylcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB0eXBlOiBOdW1iZXJGb3JtYXRTdHlsZSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlckZvcm1hdHNdW3R5cGVdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgc3ltYm9sIHVzZWQgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW5jeSBmb3IgdGhlIG1haW4gY291bnRyeVxuICogY29ycmVzcG9uZGluZyB0byBhIGdpdmVuIGxvY2FsZS4gRm9yIGV4YW1wbGUsICckJyBmb3IgYGVuLVVTYC5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgc3ltYm9sIGNoYXJhY3RlcixcbiAqIG9yIGBudWxsYCBpZiB0aGUgbWFpbiBjb3VudHJ5IGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeVN5bWJvbChsb2NhbGU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguQ3VycmVuY3lTeW1ib2xdIHx8IG51bGw7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBuYW1lIG9mIHRoZSBjdXJyZW5jeSBmb3IgdGhlIG1haW4gY291bnRyeSBjb3JyZXNwb25kaW5nXG4gKiB0byBhIGdpdmVuIGxvY2FsZS4gRm9yIGV4YW1wbGUsICdVUyBEb2xsYXInIGZvciBgZW4tVVNgLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgY3VycmVuY3kgbmFtZSxcbiAqIG9yIGBudWxsYCBpZiB0aGUgbWFpbiBjb3VudHJ5IGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeU5hbWUobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5TmFtZV0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbmN5IHZhbHVlcyBmb3IgYSBnaXZlbiBsb2NhbGUuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBjdXJyZW5jeSB2YWx1ZXMuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICovXG5mdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jaWVzKGxvY2FsZTogc3RyaW5nKToge1tjb2RlOiBzdHJpbmddOiBDdXJyZW5jaWVzU3ltYm9sc30ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5DdXJyZW5jaWVzXTtcbn1cblxuLyoqXG4gKiBAYWxpYXMgY29yZS/JtWdldExvY2FsZVBsdXJhbENhc2VcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IGdldExvY2FsZVBsdXJhbENhc2U6IChsb2NhbGU6IHN0cmluZykgPT4gKCh2YWx1ZTogbnVtYmVyKSA9PiBQbHVyYWwpID1cbiAgICDJtWdldExvY2FsZVBsdXJhbENhc2U7XG5cbmZ1bmN0aW9uIGNoZWNrRnVsbERhdGEoZGF0YTogYW55KSB7XG4gIGlmICghZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTWlzc2luZyBleHRyYSBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7ZGF0YVvJtUxvY2FsZURhdGFJbmRleC5Mb2NhbGVJZF19XCIuIFVzZSBcInJlZ2lzdGVyTG9jYWxlRGF0YVwiIHRvIGxvYWQgbmV3IGRhdGEuIFNlZSB0aGUgXCJJMThuIGd1aWRlXCIgb24gYW5ndWxhci5pbyB0byBrbm93IG1vcmUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgbG9jYWxlLXNwZWNpZmljIHJ1bGVzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGRheSBwZXJpb2QgdG8gdXNlXG4gKiB3aGVuIG1vcmUgdGhhbiBvbmUgcGVyaW9kIGlzIGRlZmluZWQgZm9yIGEgbG9jYWxlLlxuICpcbiAqIFRoZXJlIGlzIGEgcnVsZSBmb3IgZWFjaCBkZWZpbmVkIGRheSBwZXJpb2QuIFRoZVxuICogZmlyc3QgcnVsZSBpcyBhcHBsaWVkIHRvIHRoZSBmaXJzdCBkYXkgcGVyaW9kIGFuZCBzbyBvbi5cbiAqIEZhbGwgYmFjayB0byBBTS9QTSB3aGVuIG5vIHJ1bGVzIGFyZSBhdmFpbGFibGUuXG4gKlxuICogQSBydWxlIGNhbiBzcGVjaWZ5IGEgcGVyaW9kIGFzIHRpbWUgcmFuZ2UsIG9yIGFzIGEgc2luZ2xlIHRpbWUgdmFsdWUuXG4gKlxuICogVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4geW91IGhhdmUgbG9hZGVkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbXCJJMThuIGd1aWRlXCJdKGd1aWRlL2kxOG4jaTE4bi1waXBlcykuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgcnVsZXMgZm9yIHRoZSBsb2NhbGUsIGEgc2luZ2xlIHRpbWUgdmFsdWUgb3IgYXJyYXkgb2YgKmZyb20tdGltZSwgdG8tdGltZSosXG4gKiBvciBudWxsIGlmIG5vIHBlcmlvZHMgYXJlIGF2YWlsYWJsZS5cbiAqXG4gKiBAc2VlIGBnZXRMb2NhbGVFeHRyYURheVBlcmlvZHMoKWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcyhsb2NhbGU6IHN0cmluZyk6IChUaW1lIHwgW1RpbWUsIFRpbWVdKVtdIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgcnVsZXMgPSBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV1bybVFeHRyYUxvY2FsZURhdGFJbmRleC5FeHRyYURheVBlcmlvZHNSdWxlc10gfHwgW107XG4gIHJldHVybiBydWxlcy5tYXAoKHJ1bGU6IHN0cmluZyB8IFtzdHJpbmcsIHN0cmluZ10pID0+IHtcbiAgICBpZiAodHlwZW9mIHJ1bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZXh0cmFjdFRpbWUocnVsZSk7XG4gICAgfVxuICAgIHJldHVybiBbZXh0cmFjdFRpbWUocnVsZVswXSksIGV4dHJhY3RUaW1lKHJ1bGVbMV0pXTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGxvY2FsZS1zcGVjaWZpYyBkYXkgcGVyaW9kcywgd2hpY2ggaW5kaWNhdGUgcm91Z2hseSBob3cgYSBkYXkgaXMgYnJva2VuIHVwXG4gKiBpbiBkaWZmZXJlbnQgbGFuZ3VhZ2VzLlxuICogRm9yIGV4YW1wbGUsIGZvciBgZW4tVVNgLCBwZXJpb2RzIGFyZSBtb3JuaW5nLCBub29uLCBhZnRlcm5vb24sIGV2ZW5pbmcsIGFuZCBtaWRuaWdodC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgb25seSBhdmFpbGFibGUgd2hlbiB5b3UgaGF2ZSBsb2FkZWQgdGhlIGZ1bGwgbG9jYWxlIGRhdGEuXG4gKiBTZWUgdGhlIFtcIkkxOG4gZ3VpZGVcIl0oZ3VpZGUvaTE4biNpMThuLXBpcGVzKS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIFRoZSB0cmFuc2xhdGVkIGRheS1wZXJpb2Qgc3RyaW5ncy5cbiAqIEBzZWUgYGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMoKWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNoZWNrRnVsbERhdGEoZGF0YSk7XG4gIGNvbnN0IGRheVBlcmlvZHNEYXRhID0gPHN0cmluZ1tdW11bXT5bXG4gICAgICBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV1bybVFeHRyYUxvY2FsZURhdGFJbmRleC5FeHRyYURheVBlcmlvZEZvcm1hdHNdLFxuICAgICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW8m1RXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RTdGFuZGFsb25lXVxuICBdO1xuICBjb25zdCBkYXlQZXJpb2RzID0gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlQZXJpb2RzRGF0YSwgZm9ybVN0eWxlKSB8fCBbXTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF5UGVyaW9kcywgd2lkdGgpIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZmlyc3QgdmFsdWUgdGhhdCBpcyBkZWZpbmVkIGluIGFuIGFycmF5LCBnb2luZyBiYWNrd2FyZHMgZnJvbSBhbiBpbmRleCBwb3NpdGlvbi5cbiAqXG4gKiBUbyBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgZGF0YSAoYXMgd2hlbiB0aGUgXCJmb3JtYXRcIiBhbmQgXCJzdGFuZGFsb25lXCIgZm9ybXMgYXJlIHRoZSBzYW1lKVxuICogYWRkIHRoZSBmaXJzdCB2YWx1ZSB0byB0aGUgbG9jYWxlIGRhdGEgYXJyYXlzLCBhbmQgYWRkIG90aGVyIHZhbHVlcyBvbmx5IGlmIHRoZXkgYXJlIGRpZmZlcmVudC5cbiAqXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSBhcnJheSB0byByZXRyaWV2ZSBmcm9tLlxuICogQHBhcmFtIGluZGV4IEEgMC1iYXNlZCBpbmRleCBpbnRvIHRoZSBhcnJheSB0byBzdGFydCBmcm9tLlxuICogQHJldHVybnMgVGhlIHZhbHVlIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZ2l2ZW4gaW5kZXggcG9zaXRpb24uXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZnVuY3Rpb24gZ2V0TGFzdERlZmluZWRWYWx1ZTxUPihkYXRhOiBUW10sIGluZGV4OiBudW1iZXIpOiBUIHtcbiAgZm9yIChsZXQgaSA9IGluZGV4OyBpID4gLTE7IGktLSkge1xuICAgIGlmICh0eXBlb2YgZGF0YVtpXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBkYXRhW2ldO1xuICAgIH1cbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBkYXRhIEFQSTogbG9jYWxlIGRhdGEgdW5kZWZpbmVkJyk7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRpbWUgdmFsdWUgd2l0aCBob3VycyBhbmQgbWludXRlcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFRpbWUgPSB7XG4gIGhvdXJzOiBudW1iZXIsXG4gIG1pbnV0ZXM6IG51bWJlclxufTtcblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgaG91cnMgYW5kIG1pbnV0ZXMgZnJvbSBhIHN0cmluZyBsaWtlIFwiMTU6NDVcIlxuICovXG5mdW5jdGlvbiBleHRyYWN0VGltZSh0aW1lOiBzdHJpbmcpOiBUaW1lIHtcbiAgY29uc3QgW2gsIG1dID0gdGltZS5zcGxpdCgnOicpO1xuICByZXR1cm4ge2hvdXJzOiAraCwgbWludXRlczogK219O1xufVxuXG5cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbmN5IHN5bWJvbCBmb3IgYSBnaXZlbiBjdXJyZW5jeSBjb2RlLlxuICpcbiAqIEZvciBleGFtcGxlLCBmb3IgdGhlIGRlZmF1bHQgYGVuLVVTYCBsb2NhbGUsIHRoZSBjb2RlIGBVU0RgIGNhblxuICogYmUgcmVwcmVzZW50ZWQgYnkgdGhlIG5hcnJvdyBzeW1ib2wgYCRgIG9yIHRoZSB3aWRlIHN5bWJvbCBgVVMkYC5cbiAqXG4gKiBAcGFyYW0gY29kZSBUaGUgY3VycmVuY3kgY29kZS5cbiAqIEBwYXJhbSBmb3JtYXQgVGhlIGZvcm1hdCwgYHdpZGVgIG9yIGBuYXJyb3dgLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKlxuICogQHJldHVybnMgVGhlIHN5bWJvbCwgb3IgdGhlIGN1cnJlbmN5IGNvZGUgaWYgbm8gc3ltYm9sIGlzIGF2YWlsYWJsZS5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVuY3lTeW1ib2woY29kZTogc3RyaW5nLCBmb3JtYXQ6ICd3aWRlJyB8ICduYXJyb3cnLCBsb2NhbGUgPSAnZW4nKTogc3RyaW5nIHtcbiAgY29uc3QgY3VycmVuY3kgPSBnZXRMb2NhbGVDdXJyZW5jaWVzKGxvY2FsZSlbY29kZV0gfHwgQ1VSUkVOQ0lFU19FTltjb2RlXSB8fCBbXTtcbiAgY29uc3Qgc3ltYm9sTmFycm93ID0gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4LlN5bWJvbE5hcnJvd107XG5cbiAgaWYgKGZvcm1hdCA9PT0gJ25hcnJvdycgJiYgdHlwZW9mIHN5bWJvbE5hcnJvdyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3ltYm9sTmFycm93O1xuICB9XG5cbiAgcmV0dXJuIGN1cnJlbmN5W8m1Q3VycmVuY3lJbmRleC5TeW1ib2xdIHx8IGNvZGU7XG59XG5cbi8vIE1vc3QgY3VycmVuY2llcyBoYXZlIGNlbnRzLCB0aGF0J3Mgd2h5IHRoZSBkZWZhdWx0IGlzIDJcbmNvbnN0IERFRkFVTFRfTkJfT0ZfQ1VSUkVOQ1lfRElHSVRTID0gMjtcblxuLyoqXG4gKiBSZXBvcnRzIHRoZSBudW1iZXIgb2YgZGVjaW1hbCBkaWdpdHMgZm9yIGEgZ2l2ZW4gY3VycmVuY3kuXG4gKiBUaGUgdmFsdWUgZGVwZW5kcyB1cG9uIHRoZSBwcmVzZW5jZSBvZiBjZW50cyBpbiB0aGF0IHBhcnRpY3VsYXIgY3VycmVuY3kuXG4gKlxuICogQHBhcmFtIGNvZGUgVGhlIGN1cnJlbmN5IGNvZGUuXG4gKiBAcmV0dXJucyBUaGUgbnVtYmVyIG9mIGRlY2ltYWwgZGlnaXRzLCB0eXBpY2FsbHkgMCBvciAyLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROdW1iZXJPZkN1cnJlbmN5RGlnaXRzKGNvZGU6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBkaWdpdHM7XG4gIGNvbnN0IGN1cnJlbmN5ID0gQ1VSUkVOQ0lFU19FTltjb2RlXTtcbiAgaWYgKGN1cnJlbmN5KSB7XG4gICAgZGlnaXRzID0gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4Lk5iT2ZEaWdpdHNdO1xuICB9XG4gIHJldHVybiB0eXBlb2YgZGlnaXRzID09PSAnbnVtYmVyJyA/IGRpZ2l0cyA6IERFRkFVTFRfTkJfT0ZfQ1VSUkVOQ1lfRElHSVRTO1xufVxuIl19