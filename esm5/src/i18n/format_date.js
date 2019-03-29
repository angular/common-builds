/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { FormStyle, FormatWidth, NumberSymbol, TranslationWidth, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat } from './locale_data_api';
export var ISO8601_DATE_REGEX = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
var NAMED_FORMATS = {};
var DATE_FORMATS_SPLIT = /((?:[^GyMLwWdEabBhHmsSzZO']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
var ZoneWidth;
(function (ZoneWidth) {
    ZoneWidth[ZoneWidth["Short"] = 0] = "Short";
    ZoneWidth[ZoneWidth["ShortGMT"] = 1] = "ShortGMT";
    ZoneWidth[ZoneWidth["Long"] = 2] = "Long";
    ZoneWidth[ZoneWidth["Extended"] = 3] = "Extended";
})(ZoneWidth || (ZoneWidth = {}));
var DateType;
(function (DateType) {
    DateType[DateType["FullYear"] = 0] = "FullYear";
    DateType[DateType["Month"] = 1] = "Month";
    DateType[DateType["Date"] = 2] = "Date";
    DateType[DateType["Hours"] = 3] = "Hours";
    DateType[DateType["Minutes"] = 4] = "Minutes";
    DateType[DateType["Seconds"] = 5] = "Seconds";
    DateType[DateType["FractionalSeconds"] = 6] = "FractionalSeconds";
    DateType[DateType["Day"] = 7] = "Day";
})(DateType || (DateType = {}));
var TranslationType;
(function (TranslationType) {
    TranslationType[TranslationType["DayPeriods"] = 0] = "DayPeriods";
    TranslationType[TranslationType["Days"] = 1] = "Days";
    TranslationType[TranslationType["Months"] = 2] = "Months";
    TranslationType[TranslationType["Eras"] = 3] = "Eras";
})(TranslationType || (TranslationType = {}));
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date according to locale rules.
 *
 * @param value The date to format, as a number (milliseconds since UTC epoch)
 * or an [ISO date-time string](https://www.w3.org/TR/NOTE-datetime).
 * @param format The date-time components to include. See `DatePipe` for details.
 * @param locale A locale code for the locale format rules to use.
 * @param timezone The time zone. A time zone offset from GMT (such as `'+0430'`),
 * or a standard UTC/GMT or continental US time zone abbreviation.
 * If not specified, uses host system settings.
 *
 * @returns The formatted date string.
 *
 * @see `DatePipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function formatDate(value, format, locale, timezone) {
    var date = toDate(value);
    var namedFormat = getNamedFormat(locale, format);
    format = namedFormat || format;
    var parts = [];
    var match;
    while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
            parts = parts.concat(match.slice(1));
            var part = parts.pop();
            if (!part) {
                break;
            }
            format = part;
        }
        else {
            parts.push(format);
            break;
        }
    }
    var dateTimezoneOffset = date.getTimezoneOffset();
    if (timezone) {
        dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
        date = convertTimezoneToLocal(date, timezone, true);
    }
    var text = '';
    parts.forEach(function (value) {
        var dateFormatter = getDateFormatter(value);
        text += dateFormatter ?
            dateFormatter(date, locale, dateTimezoneOffset) :
            value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
    });
    return text;
}
function getNamedFormat(locale, format) {
    var localeId = getLocaleId(locale);
    NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};
    if (NAMED_FORMATS[localeId][format]) {
        return NAMED_FORMATS[localeId][format];
    }
    var formatValue = '';
    switch (format) {
        case 'shortDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
            break;
        case 'mediumDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Medium);
            break;
        case 'longDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Long);
            break;
        case 'fullDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Full);
            break;
        case 'shortTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
            break;
        case 'mediumTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
            break;
        case 'longTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
            break;
        case 'fullTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
            break;
        case 'short':
            var shortTime = getNamedFormat(locale, 'shortTime');
            var shortDate = getNamedFormat(locale, 'shortDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
            break;
        case 'medium':
            var mediumTime = getNamedFormat(locale, 'mediumTime');
            var mediumDate = getNamedFormat(locale, 'mediumDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
            break;
        case 'long':
            var longTime = getNamedFormat(locale, 'longTime');
            var longDate = getNamedFormat(locale, 'longDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
            break;
        case 'full':
            var fullTime = getNamedFormat(locale, 'fullTime');
            var fullDate = getNamedFormat(locale, 'fullDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
            break;
    }
    if (formatValue) {
        NAMED_FORMATS[localeId][format] = formatValue;
    }
    return formatValue;
}
function formatDateTime(str, opt_values) {
    if (opt_values) {
        str = str.replace(/\{([^}]+)}/g, function (match, key) {
            return (opt_values != null && key in opt_values) ? opt_values[key] : match;
        });
    }
    return str;
}
function padNumber(num, digits, minusSign, trim, negWrap) {
    if (minusSign === void 0) { minusSign = '-'; }
    var neg = '';
    if (num < 0 || (negWrap && num <= 0)) {
        if (negWrap) {
            num = -num + 1;
        }
        else {
            num = -num;
            neg = minusSign;
        }
    }
    var strNum = String(num);
    while (strNum.length < digits) {
        strNum = '0' + strNum;
    }
    if (trim) {
        strNum = strNum.substr(strNum.length - digits);
    }
    return neg + strNum;
}
function formatFractionalSeconds(milliseconds, digits) {
    var strMs = padNumber(milliseconds, 3);
    return strMs.substr(0, digits);
}
/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(name, size, offset, trim, negWrap) {
    if (offset === void 0) { offset = 0; }
    if (trim === void 0) { trim = false; }
    if (negWrap === void 0) { negWrap = false; }
    return function (date, locale) {
        var part = getDatePart(name, date);
        if (offset > 0 || part > -offset) {
            part += offset;
        }
        if (name === DateType.Hours) {
            if (part === 0 && offset === -12) {
                part = 12;
            }
        }
        else if (name === DateType.FractionalSeconds) {
            return formatFractionalSeconds(part, size);
        }
        var localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        return padNumber(part, size, localeMinus, trim, negWrap);
    };
}
function getDatePart(part, date) {
    switch (part) {
        case DateType.FullYear:
            return date.getFullYear();
        case DateType.Month:
            return date.getMonth();
        case DateType.Date:
            return date.getDate();
        case DateType.Hours:
            return date.getHours();
        case DateType.Minutes:
            return date.getMinutes();
        case DateType.Seconds:
            return date.getSeconds();
        case DateType.FractionalSeconds:
            return date.getMilliseconds();
        case DateType.Day:
            return date.getDay();
        default:
            throw new Error("Unknown DateType value \"" + part + "\".");
    }
}
/**
 * Returns a date formatter that transforms a date into its locale string representation
 */
function dateStrGetter(name, width, form, extended) {
    if (form === void 0) { form = FormStyle.Format; }
    if (extended === void 0) { extended = false; }
    return function (date, locale) {
        return getDateTranslation(date, locale, name, width, form, extended);
    };
}
/**
 * Returns the locale translation of a date for a given form, type and width
 */
function getDateTranslation(date, locale, name, width, form, extended) {
    switch (name) {
        case TranslationType.Months:
            return getLocaleMonthNames(locale, form, width)[date.getMonth()];
        case TranslationType.Days:
            return getLocaleDayNames(locale, form, width)[date.getDay()];
        case TranslationType.DayPeriods:
            var currentHours_1 = date.getHours();
            var currentMinutes_1 = date.getMinutes();
            if (extended) {
                var rules = getLocaleExtraDayPeriodRules(locale);
                var dayPeriods_1 = getLocaleExtraDayPeriods(locale, form, width);
                var result_1;
                rules.forEach(function (rule, index) {
                    if (Array.isArray(rule)) {
                        // morning, afternoon, evening, night
                        var _a = rule[0], hoursFrom = _a.hours, minutesFrom = _a.minutes;
                        var _b = rule[1], hoursTo = _b.hours, minutesTo = _b.minutes;
                        if (currentHours_1 >= hoursFrom && currentMinutes_1 >= minutesFrom &&
                            (currentHours_1 < hoursTo ||
                                (currentHours_1 === hoursTo && currentMinutes_1 < minutesTo))) {
                            result_1 = dayPeriods_1[index];
                        }
                    }
                    else { // noon or midnight
                        var hours = rule.hours, minutes = rule.minutes;
                        if (hours === currentHours_1 && minutes === currentMinutes_1) {
                            result_1 = dayPeriods_1[index];
                        }
                    }
                });
                if (result_1) {
                    return result_1;
                }
            }
            // if no rules for the day periods, we use am/pm by default
            return getLocaleDayPeriods(locale, form, width)[currentHours_1 < 12 ? 0 : 1];
        case TranslationType.Eras:
            return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
        default:
            // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
            // However Closure Compiler does not understand that and reports an error in typed mode.
            // The `throw new Error` below works around the problem, and the unexpected: never variable
            // makes sure tsc still checks this code is unreachable.
            var unexpected = name;
            throw new Error("unexpected translation type " + unexpected);
    }
}
/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 */
function timeZoneGetter(width) {
    return function (date, locale, offset) {
        var zone = -1 * offset;
        var minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        var hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
        switch (width) {
            case ZoneWidth.Short:
                return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) +
                    padNumber(Math.abs(zone % 60), 2, minusSign);
            case ZoneWidth.ShortGMT:
                return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 1, minusSign);
            case ZoneWidth.Long:
                return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
                    padNumber(Math.abs(zone % 60), 2, minusSign);
            case ZoneWidth.Extended:
                if (offset === 0) {
                    return 'Z';
                }
                else {
                    return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
                        padNumber(Math.abs(zone % 60), 2, minusSign);
                }
            default:
                throw new Error("Unknown zone width \"" + width + "\"");
        }
    };
}
var JANUARY = 0;
var THURSDAY = 4;
function getFirstThursdayOfYear(year) {
    var firstDayOfYear = (new Date(year, JANUARY, 1)).getDay();
    return new Date(year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
function getThursdayThisWeek(datetime) {
    return new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (THURSDAY - datetime.getDay()));
}
function weekGetter(size, monthBased) {
    if (monthBased === void 0) { monthBased = false; }
    return function (date, locale) {
        var result;
        if (monthBased) {
            var nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
            var today = date.getDate();
            result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
        }
        else {
            var firstThurs = getFirstThursdayOfYear(date.getFullYear());
            var thisThurs = getThursdayThisWeek(date);
            var diff = thisThurs.getTime() - firstThurs.getTime();
            result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
        }
        return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    };
}
var DATE_FORMATS = {};
// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: Y, U, Q, D, F, e, c, j, J, C, A, v, V, X, x
function getDateFormatter(format) {
    if (DATE_FORMATS[format]) {
        return DATE_FORMATS[format];
    }
    var formatter;
    switch (format) {
        // Era name (AD/BC)
        case 'G':
        case 'GG':
        case 'GGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Abbreviated);
            break;
        case 'GGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Wide);
            break;
        case 'GGGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Narrow);
            break;
        // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
        case 'y':
            formatter = dateGetter(DateType.FullYear, 1, 0, false, true);
            break;
        // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yy':
            formatter = dateGetter(DateType.FullYear, 2, 0, true, true);
            break;
        // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yyy':
            formatter = dateGetter(DateType.FullYear, 3, 0, false, true);
            break;
        // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
        case 'yyyy':
            formatter = dateGetter(DateType.FullYear, 4, 0, false, true);
            break;
        // Month of the year (1-12), numeric
        case 'M':
        case 'L':
            formatter = dateGetter(DateType.Month, 1, 1);
            break;
        case 'MM':
        case 'LL':
            formatter = dateGetter(DateType.Month, 2, 1);
            break;
        // Month of the year (January, ...), string, format
        case 'MMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated);
            break;
        case 'MMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide);
            break;
        case 'MMMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow);
            break;
        // Month of the year (January, ...), string, standalone
        case 'LLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'LLLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'LLLLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Narrow, FormStyle.Standalone);
            break;
        // Week of the year (1, ... 52)
        case 'w':
            formatter = weekGetter(1);
            break;
        case 'ww':
            formatter = weekGetter(2);
            break;
        // Week of the month (1, ...)
        case 'W':
            formatter = weekGetter(1, true);
            break;
        // Day of the month (1-31)
        case 'd':
            formatter = dateGetter(DateType.Date, 1);
            break;
        case 'dd':
            formatter = dateGetter(DateType.Date, 2);
            break;
        // Day of the Week
        case 'E':
        case 'EE':
        case 'EEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated);
            break;
        case 'EEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide);
            break;
        case 'EEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow);
            break;
        case 'EEEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short);
            break;
        // Generic period of the day (am-pm)
        case 'a':
        case 'aa':
        case 'aaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated);
            break;
        case 'aaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide);
            break;
        case 'aaaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow);
            break;
        // Extended period of the day (midnight, at night, ...), standalone
        case 'b':
        case 'bb':
        case 'bbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
            break;
        case 'bbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Standalone, true);
            break;
        case 'bbbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Standalone, true);
            break;
        // Extended period of the day (midnight, night, ...), standalone
        case 'B':
        case 'BB':
        case 'BBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Format, true);
            break;
        case 'BBBB':
            formatter =
                dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
            break;
        case 'BBBBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Format, true);
            break;
        // Hour in AM/PM, (1-12)
        case 'h':
            formatter = dateGetter(DateType.Hours, 1, -12);
            break;
        case 'hh':
            formatter = dateGetter(DateType.Hours, 2, -12);
            break;
        // Hour of the day (0-23)
        case 'H':
            formatter = dateGetter(DateType.Hours, 1);
            break;
        // Hour in day, padded (00-23)
        case 'HH':
            formatter = dateGetter(DateType.Hours, 2);
            break;
        // Minute of the hour (0-59)
        case 'm':
            formatter = dateGetter(DateType.Minutes, 1);
            break;
        case 'mm':
            formatter = dateGetter(DateType.Minutes, 2);
            break;
        // Second of the minute (0-59)
        case 's':
            formatter = dateGetter(DateType.Seconds, 1);
            break;
        case 'ss':
            formatter = dateGetter(DateType.Seconds, 2);
            break;
        // Fractional second
        case 'S':
            formatter = dateGetter(DateType.FractionalSeconds, 1);
            break;
        case 'SS':
            formatter = dateGetter(DateType.FractionalSeconds, 2);
            break;
        case 'SSS':
            formatter = dateGetter(DateType.FractionalSeconds, 3);
            break;
        // Timezone ISO8601 short format (-0430)
        case 'Z':
        case 'ZZ':
        case 'ZZZ':
            formatter = timeZoneGetter(ZoneWidth.Short);
            break;
        // Timezone ISO8601 extended format (-04:30)
        case 'ZZZZZ':
            formatter = timeZoneGetter(ZoneWidth.Extended);
            break;
        // Timezone GMT short format (GMT+4)
        case 'O':
        case 'OO':
        case 'OOO':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'z':
        case 'zz':
        case 'zzz':
            formatter = timeZoneGetter(ZoneWidth.ShortGMT);
            break;
        // Timezone GMT long format (GMT+0430)
        case 'OOOO':
        case 'ZZZZ':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'zzzz':
            formatter = timeZoneGetter(ZoneWidth.Long);
            break;
        default:
            return null;
    }
    DATE_FORMATS[format] = formatter;
    return formatter;
}
function timezoneToOffset(timezone, fallback) {
    // Support: IE 9-11 only, Edge 13-15+
    // IE/Edge do not "understand" colon (`:`) in timezone
    timezone = timezone.replace(/:/g, '');
    var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
function convertTimezoneToLocal(date, timezone, reverse) {
    var reverseValue = reverse ? -1 : 1;
    var dateTimezoneOffset = date.getTimezoneOffset();
    var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
/**
 * Converts a value to date.
 *
 * Supported input formats:
 * - `Date`
 * - number: timestamp
 * - string: numeric (e.g. "1234"), ISO and date strings in a format supported by
 *   [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *   Note: ISO strings without time return a date without timeoffset.
 *
 * Throws if unable to convert to a date.
 */
export function toDate(value) {
    if (isDate(value)) {
        return value;
    }
    if (typeof value === 'number' && !isNaN(value)) {
        return new Date(value);
    }
    if (typeof value === 'string') {
        value = value.trim();
        var parsedNb = parseFloat(value);
        // any string that only contains numbers, like "1234" but not like "1234hello"
        if (!isNaN(value - parsedNb)) {
            return new Date(parsedNb);
        }
        if (/^(\d{4}-\d{1,2}-\d{1,2})$/.test(value)) {
            /* For ISO Strings without time the day, month and year must be extracted from the ISO String
            before Date creation to avoid time offset and errors in the new Date.
            If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
            date, some browsers (e.g. IE 9) will throw an invalid Date error.
            If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
            is applied.
            Note: ISO months are 0 for January, 1 for February, ... */
            var _a = tslib_1.__read(value.split('-').map(function (val) { return +val; }), 3), y = _a[0], m = _a[1], d = _a[2];
            return new Date(y, m - 1, d);
        }
        var match = void 0;
        if (match = value.match(ISO8601_DATE_REGEX)) {
            return isoStringToDate(match);
        }
    }
    var date = new Date(value);
    if (!isDate(date)) {
        throw new Error("Unable to convert \"" + value + "\" into a date");
    }
    return date;
}
/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 */
export function isoStringToDate(match) {
    var date = new Date(0);
    var tzHour = 0;
    var tzMin = 0;
    // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
    var dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
    var timeSetter = match[8] ? date.setUTCHours : date.setHours;
    // if there is a timezone defined like "+01:00" or "+0100"
    if (match[9]) {
        tzHour = Number(match[9] + match[10]);
        tzMin = Number(match[9] + match[11]);
    }
    dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    var h = Number(match[4] || 0) - tzHour;
    var m = Number(match[5] || 0) - tzMin;
    var s = Number(match[6] || 0);
    var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
}
export function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X2RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2kxOG4vZm9ybWF0X2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBUSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSw0QkFBNEIsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUU5VSxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FDM0Isc0dBQXNHLENBQUM7QUFDM0csZ0dBQWdHO0FBQ2hHLElBQU0sYUFBYSxHQUFxRCxFQUFFLENBQUM7QUFDM0UsSUFBTSxrQkFBa0IsR0FDcEIsbU1BQW1NLENBQUM7QUFFeE0sSUFBSyxTQUtKO0FBTEQsV0FBSyxTQUFTO0lBQ1osMkNBQUssQ0FBQTtJQUNMLGlEQUFRLENBQUE7SUFDUix5Q0FBSSxDQUFBO0lBQ0osaURBQVEsQ0FBQTtBQUNWLENBQUMsRUFMSSxTQUFTLEtBQVQsU0FBUyxRQUtiO0FBRUQsSUFBSyxRQVNKO0FBVEQsV0FBSyxRQUFRO0lBQ1gsK0NBQVEsQ0FBQTtJQUNSLHlDQUFLLENBQUE7SUFDTCx1Q0FBSSxDQUFBO0lBQ0oseUNBQUssQ0FBQTtJQUNMLDZDQUFPLENBQUE7SUFDUCw2Q0FBTyxDQUFBO0lBQ1AsaUVBQWlCLENBQUE7SUFDakIscUNBQUcsQ0FBQTtBQUNMLENBQUMsRUFUSSxRQUFRLEtBQVIsUUFBUSxRQVNaO0FBRUQsSUFBSyxlQUtKO0FBTEQsV0FBSyxlQUFlO0lBQ2xCLGlFQUFVLENBQUE7SUFDVixxREFBSSxDQUFBO0lBQ0os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QUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRixJQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUN6QyxJQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN4QyxJQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sVUFBVSxNQUFNLENBQUMsS0FBVTtJQUMvQixPQUFPLEtBQUssWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDMUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtGb3JtU3R5bGUsIEZvcm1hdFdpZHRoLCBOdW1iZXJTeW1ib2wsIFRpbWUsIFRyYW5zbGF0aW9uV2lkdGgsIGdldExvY2FsZURhdGVGb3JtYXQsIGdldExvY2FsZURhdGVUaW1lRm9ybWF0LCBnZXRMb2NhbGVEYXlOYW1lcywgZ2V0TG9jYWxlRGF5UGVyaW9kcywgZ2V0TG9jYWxlRXJhTmFtZXMsIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMsIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcywgZ2V0TG9jYWxlSWQsIGdldExvY2FsZU1vbnRoTmFtZXMsIGdldExvY2FsZU51bWJlclN5bWJvbCwgZ2V0TG9jYWxlVGltZUZvcm1hdH0gZnJvbSAnLi9sb2NhbGVfZGF0YV9hcGknO1xuXG5leHBvcnQgY29uc3QgSVNPODYwMV9EQVRFX1JFR0VYID1cbiAgICAvXihcXGR7NH0pLT8oXFxkXFxkKS0/KFxcZFxcZCkoPzpUKFxcZFxcZCkoPzo6PyhcXGRcXGQpKD86Oj8oXFxkXFxkKSg/OlxcLihcXGQrKSk/KT8pPyhafChbKy1dKShcXGRcXGQpOj8oXFxkXFxkKSk/KT8kLztcbi8vICAgIDEgICAgICAgIDIgICAgICAgMyAgICAgICAgIDQgICAgICAgICAgNSAgICAgICAgICA2ICAgICAgICAgIDcgICAgICAgICAgOCAgOSAgICAgMTAgICAgICAxMVxuY29uc3QgTkFNRURfRk9STUFUUzoge1tsb2NhbGVJZDogc3RyaW5nXToge1tmb3JtYXQ6IHN0cmluZ106IHN0cmluZ319ID0ge307XG5jb25zdCBEQVRFX0ZPUk1BVFNfU1BMSVQgPVxuICAgIC8oKD86W15HeU1Md1dkRWFiQmhIbXNTelpPJ10rKXwoPzonKD86W14nXXwnJykqJyl8KD86R3sxLDV9fHl7MSw0fXxNezEsNX18THsxLDV9fHd7MSwyfXxXezF9fGR7MSwyfXxFezEsNn18YXsxLDV9fGJ7MSw1fXxCezEsNX18aHsxLDJ9fEh7MSwyfXxtezEsMn18c3sxLDJ9fFN7MSwzfXx6ezEsNH18WnsxLDV9fE97MSw0fSkpKFtcXHNcXFNdKikvO1xuXG5lbnVtIFpvbmVXaWR0aCB7XG4gIFNob3J0LFxuICBTaG9ydEdNVCxcbiAgTG9uZyxcbiAgRXh0ZW5kZWRcbn1cblxuZW51bSBEYXRlVHlwZSB7XG4gIEZ1bGxZZWFyLFxuICBNb250aCxcbiAgRGF0ZSxcbiAgSG91cnMsXG4gIE1pbnV0ZXMsXG4gIFNlY29uZHMsXG4gIEZyYWN0aW9uYWxTZWNvbmRzLFxuICBEYXlcbn1cblxuZW51bSBUcmFuc2xhdGlvblR5cGUge1xuICBEYXlQZXJpb2RzLFxuICBEYXlzLFxuICBNb250aHMsXG4gIEVyYXNcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgZGF0ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0ZSB0byBmb3JtYXQsIGFzIGEgbnVtYmVyIChtaWxsaXNlY29uZHMgc2luY2UgVVRDIGVwb2NoKVxuICogb3IgYW4gW0lTTyBkYXRlLXRpbWUgc3RyaW5nXShodHRwczovL3d3dy53My5vcmcvVFIvTk9URS1kYXRldGltZSkuXG4gKiBAcGFyYW0gZm9ybWF0IFRoZSBkYXRlLXRpbWUgY29tcG9uZW50cyB0byBpbmNsdWRlLiBTZWUgYERhdGVQaXBlYCBmb3IgZGV0YWlscy5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHRpbWV6b25lIFRoZSB0aW1lIHpvbmUuIEEgdGltZSB6b25lIG9mZnNldCBmcm9tIEdNVCAoc3VjaCBhcyBgJyswNDMwJ2ApLFxuICogb3IgYSBzdGFuZGFyZCBVVEMvR01UIG9yIGNvbnRpbmVudGFsIFVTIHRpbWUgem9uZSBhYmJyZXZpYXRpb24uXG4gKiBJZiBub3Qgc3BlY2lmaWVkLCB1c2VzIGhvc3Qgc3lzdGVtIHNldHRpbmdzLlxuICpcbiAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgZGF0ZSBzdHJpbmcuXG4gKlxuICogQHNlZSBgRGF0ZVBpcGVgXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERhdGUoXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IERhdGUsIGZvcm1hdDogc3RyaW5nLCBsb2NhbGU6IHN0cmluZywgdGltZXpvbmU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgZGF0ZSA9IHRvRGF0ZSh2YWx1ZSk7XG4gIGNvbnN0IG5hbWVkRm9ybWF0ID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCBmb3JtYXQpO1xuICBmb3JtYXQgPSBuYW1lZEZvcm1hdCB8fCBmb3JtYXQ7XG5cbiAgbGV0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgbWF0Y2g7XG4gIHdoaWxlIChmb3JtYXQpIHtcbiAgICBtYXRjaCA9IERBVEVfRk9STUFUU19TUExJVC5leGVjKGZvcm1hdCk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBwYXJ0cyA9IHBhcnRzLmNvbmNhdChtYXRjaC5zbGljZSgxKSk7XG4gICAgICBjb25zdCBwYXJ0ID0gcGFydHMucG9wKCk7XG4gICAgICBpZiAoIXBhcnQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBmb3JtYXQgPSBwYXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cy5wdXNoKGZvcm1hdCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBsZXQgZGF0ZVRpbWV6b25lT2Zmc2V0ID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICBpZiAodGltZXpvbmUpIHtcbiAgICBkYXRlVGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lLCBkYXRlVGltZXpvbmVPZmZzZXQpO1xuICAgIGRhdGUgPSBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lLCB0cnVlKTtcbiAgfVxuXG4gIGxldCB0ZXh0ID0gJyc7XG4gIHBhcnRzLmZvckVhY2godmFsdWUgPT4ge1xuICAgIGNvbnN0IGRhdGVGb3JtYXR0ZXIgPSBnZXREYXRlRm9ybWF0dGVyKHZhbHVlKTtcbiAgICB0ZXh0ICs9IGRhdGVGb3JtYXR0ZXIgP1xuICAgICAgICBkYXRlRm9ybWF0dGVyKGRhdGUsIGxvY2FsZSwgZGF0ZVRpbWV6b25lT2Zmc2V0KSA6XG4gICAgICAgIHZhbHVlID09PSAnXFwnXFwnJyA/ICdcXCcnIDogdmFsdWUucmVwbGFjZSgvKF4nfCckKS9nLCAnJykucmVwbGFjZSgvJycvZywgJ1xcJycpO1xuICB9KTtcblxuICByZXR1cm4gdGV4dDtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZWRGb3JtYXQobG9jYWxlOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbG9jYWxlSWQgPSBnZXRMb2NhbGVJZChsb2NhbGUpO1xuICBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXSA9IE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdIHx8IHt9O1xuXG4gIGlmIChOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXVtmb3JtYXRdKSB7XG4gICAgcmV0dXJuIE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdW2Zvcm1hdF07XG4gIH1cblxuICBsZXQgZm9ybWF0VmFsdWUgPSAnJztcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICBjYXNlICdzaG9ydERhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWVkaXVtRGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZ0RhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmdWxsRGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5GdWxsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3J0VGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW1UaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLk1lZGl1bSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb25nVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5Mb25nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Z1bGxUaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkZ1bGwpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2hvcnQnOlxuICAgICAgY29uc3Qgc2hvcnRUaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnc2hvcnRUaW1lJyk7XG4gICAgICBjb25zdCBzaG9ydERhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdzaG9ydERhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID0gZm9ybWF0RGF0ZVRpbWUoXG4gICAgICAgICAgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5TaG9ydCksIFtzaG9ydFRpbWUsIHNob3J0RGF0ZV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWVkaXVtJzpcbiAgICAgIGNvbnN0IG1lZGl1bVRpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdtZWRpdW1UaW1lJyk7XG4gICAgICBjb25zdCBtZWRpdW1EYXRlID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbWVkaXVtRGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPSBmb3JtYXREYXRlVGltZShcbiAgICAgICAgICBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLk1lZGl1bSksIFttZWRpdW1UaW1lLCBtZWRpdW1EYXRlXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb25nJzpcbiAgICAgIGNvbnN0IGxvbmdUaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbG9uZ1RpbWUnKTtcbiAgICAgIGNvbnN0IGxvbmdEYXRlID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbG9uZ0RhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID1cbiAgICAgICAgICBmb3JtYXREYXRlVGltZShnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkxvbmcpLCBbbG9uZ1RpbWUsIGxvbmdEYXRlXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmdWxsJzpcbiAgICAgIGNvbnN0IGZ1bGxUaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnZnVsbFRpbWUnKTtcbiAgICAgIGNvbnN0IGZ1bGxEYXRlID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnZnVsbERhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID1cbiAgICAgICAgICBmb3JtYXREYXRlVGltZShnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkZ1bGwpLCBbZnVsbFRpbWUsIGZ1bGxEYXRlXSk7XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoZm9ybWF0VmFsdWUpIHtcbiAgICBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXVtmb3JtYXRdID0gZm9ybWF0VmFsdWU7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdFZhbHVlO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlVGltZShzdHI6IHN0cmluZywgb3B0X3ZhbHVlczogc3RyaW5nW10pIHtcbiAgaWYgKG9wdF92YWx1ZXMpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFx7KFtefV0rKX0vZywgZnVuY3Rpb24obWF0Y2gsIGtleSkge1xuICAgICAgcmV0dXJuIChvcHRfdmFsdWVzICE9IG51bGwgJiYga2V5IGluIG9wdF92YWx1ZXMpID8gb3B0X3ZhbHVlc1trZXldIDogbWF0Y2g7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gcGFkTnVtYmVyKFxuICAgIG51bTogbnVtYmVyLCBkaWdpdHM6IG51bWJlciwgbWludXNTaWduID0gJy0nLCB0cmltPzogYm9vbGVhbiwgbmVnV3JhcD86IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgbmVnID0gJyc7XG4gIGlmIChudW0gPCAwIHx8IChuZWdXcmFwICYmIG51bSA8PSAwKSkge1xuICAgIGlmIChuZWdXcmFwKSB7XG4gICAgICBudW0gPSAtbnVtICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtID0gLW51bTtcbiAgICAgIG5lZyA9IG1pbnVzU2lnbjtcbiAgICB9XG4gIH1cbiAgbGV0IHN0ck51bSA9IFN0cmluZyhudW0pO1xuICB3aGlsZSAoc3RyTnVtLmxlbmd0aCA8IGRpZ2l0cykge1xuICAgIHN0ck51bSA9ICcwJyArIHN0ck51bTtcbiAgfVxuICBpZiAodHJpbSkge1xuICAgIHN0ck51bSA9IHN0ck51bS5zdWJzdHIoc3RyTnVtLmxlbmd0aCAtIGRpZ2l0cyk7XG4gIH1cbiAgcmV0dXJuIG5lZyArIHN0ck51bTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnJhY3Rpb25hbFNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RyTXMgPSBwYWROdW1iZXIobWlsbGlzZWNvbmRzLCAzKTtcbiAgcmV0dXJuIHN0ck1zLnN1YnN0cigwLCBkaWdpdHMpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHRyYW5zZm9ybXMgYSBkYXRlIGludG8gaXRzIGxvY2FsZSBkaWdpdCByZXByZXNlbnRhdGlvblxuICovXG5mdW5jdGlvbiBkYXRlR2V0dGVyKFxuICAgIG5hbWU6IERhdGVUeXBlLCBzaXplOiBudW1iZXIsIG9mZnNldDogbnVtYmVyID0gMCwgdHJpbSA9IGZhbHNlLFxuICAgIG5lZ1dyYXAgPSBmYWxzZSk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24oZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBwYXJ0ID0gZ2V0RGF0ZVBhcnQobmFtZSwgZGF0ZSk7XG4gICAgaWYgKG9mZnNldCA+IDAgfHwgcGFydCA+IC1vZmZzZXQpIHtcbiAgICAgIHBhcnQgKz0gb2Zmc2V0O1xuICAgIH1cblxuICAgIGlmIChuYW1lID09PSBEYXRlVHlwZS5Ib3Vycykge1xuICAgICAgaWYgKHBhcnQgPT09IDAgJiYgb2Zmc2V0ID09PSAtMTIpIHtcbiAgICAgICAgcGFydCA9IDEyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMpIHtcbiAgICAgIHJldHVybiBmb3JtYXRGcmFjdGlvbmFsU2Vjb25kcyhwYXJ0LCBzaXplKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NhbGVNaW51cyA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pO1xuICAgIHJldHVybiBwYWROdW1iZXIocGFydCwgc2l6ZSwgbG9jYWxlTWludXMsIHRyaW0sIG5lZ1dyYXApO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXREYXRlUGFydChwYXJ0OiBEYXRlVHlwZSwgZGF0ZTogRGF0ZSk6IG51bWJlciB7XG4gIHN3aXRjaCAocGFydCkge1xuICAgIGNhc2UgRGF0ZVR5cGUuRnVsbFllYXI6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgIGNhc2UgRGF0ZVR5cGUuTW9udGg6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRNb250aCgpO1xuICAgIGNhc2UgRGF0ZVR5cGUuRGF0ZTpcbiAgICAgIHJldHVybiBkYXRlLmdldERhdGUoKTtcbiAgICBjYXNlIERhdGVUeXBlLkhvdXJzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKTtcbiAgICBjYXNlIERhdGVUeXBlLk1pbnV0ZXM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5TZWNvbmRzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0U2Vjb25kcygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKTtcbiAgICBjYXNlIERhdGVUeXBlLkRheTpcbiAgICAgIHJldHVybiBkYXRlLmdldERheSgpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gRGF0ZVR5cGUgdmFsdWUgXCIke3BhcnR9XCIuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBpbnRvIGl0cyBsb2NhbGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gKi9cbmZ1bmN0aW9uIGRhdGVTdHJHZXR0ZXIoXG4gICAgbmFtZTogVHJhbnNsYXRpb25UeXBlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCwgZm9ybTogRm9ybVN0eWxlID0gRm9ybVN0eWxlLkZvcm1hdCxcbiAgICBleHRlbmRlZCA9IGZhbHNlKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldERhdGVUcmFuc2xhdGlvbihkYXRlLCBsb2NhbGUsIG5hbWUsIHdpZHRoLCBmb3JtLCBleHRlbmRlZCk7XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbG9jYWxlIHRyYW5zbGF0aW9uIG9mIGEgZGF0ZSBmb3IgYSBnaXZlbiBmb3JtLCB0eXBlIGFuZCB3aWR0aFxuICovXG5mdW5jdGlvbiBnZXREYXRlVHJhbnNsYXRpb24oXG4gICAgZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcsIG5hbWU6IFRyYW5zbGF0aW9uVHlwZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsIGZvcm06IEZvcm1TdHlsZSxcbiAgICBleHRlbmRlZDogYm9vbGVhbikge1xuICBzd2l0Y2ggKG5hbWUpIHtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5Nb250aHM6XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlTW9udGhOYW1lcyhsb2NhbGUsIGZvcm0sIHdpZHRoKVtkYXRlLmdldE1vbnRoKCldO1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLkRheXM6XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlRGF5TmFtZXMobG9jYWxlLCBmb3JtLCB3aWR0aClbZGF0ZS5nZXREYXkoKV07XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kczpcbiAgICAgIGNvbnN0IGN1cnJlbnRIb3VycyA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRNaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgICBpZiAoZXh0ZW5kZWQpIHtcbiAgICAgICAgY29uc3QgcnVsZXMgPSBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKGxvY2FsZSk7XG4gICAgICAgIGNvbnN0IGRheVBlcmlvZHMgPSBnZXRMb2NhbGVFeHRyYURheVBlcmlvZHMobG9jYWxlLCBmb3JtLCB3aWR0aCk7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIHJ1bGVzLmZvckVhY2goKHJ1bGU6IFRpbWUgfCBbVGltZSwgVGltZV0sIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShydWxlKSkge1xuICAgICAgICAgICAgLy8gbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodFxuICAgICAgICAgICAgY29uc3Qge2hvdXJzOiBob3Vyc0Zyb20sIG1pbnV0ZXM6IG1pbnV0ZXNGcm9tfSA9IHJ1bGVbMF07XG4gICAgICAgICAgICBjb25zdCB7aG91cnM6IGhvdXJzVG8sIG1pbnV0ZXM6IG1pbnV0ZXNUb30gPSBydWxlWzFdO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRIb3VycyA+PSBob3Vyc0Zyb20gJiYgY3VycmVudE1pbnV0ZXMgPj0gbWludXRlc0Zyb20gJiZcbiAgICAgICAgICAgICAgICAoY3VycmVudEhvdXJzIDwgaG91cnNUbyB8fFxuICAgICAgICAgICAgICAgICAoY3VycmVudEhvdXJzID09PSBob3Vyc1RvICYmIGN1cnJlbnRNaW51dGVzIDwgbWludXRlc1RvKSkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZGF5UGVyaW9kc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHsgIC8vIG5vb24gb3IgbWlkbmlnaHRcbiAgICAgICAgICAgIGNvbnN0IHtob3VycywgbWludXRlc30gPSBydWxlO1xuICAgICAgICAgICAgaWYgKGhvdXJzID09PSBjdXJyZW50SG91cnMgJiYgbWludXRlcyA9PT0gY3VycmVudE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZGF5UGVyaW9kc1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGlmIG5vIHJ1bGVzIGZvciB0aGUgZGF5IHBlcmlvZHMsIHdlIHVzZSBhbS9wbSBieSBkZWZhdWx0XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlRGF5UGVyaW9kcyhsb2NhbGUsIGZvcm0sIDxUcmFuc2xhdGlvbldpZHRoPndpZHRoKVtjdXJyZW50SG91cnMgPCAxMiA/IDAgOiAxXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5FcmFzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZUVyYU5hbWVzKGxvY2FsZSwgPFRyYW5zbGF0aW9uV2lkdGg+d2lkdGgpW2RhdGUuZ2V0RnVsbFllYXIoKSA8PSAwID8gMCA6IDFdO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBUaGlzIGRlZmF1bHQgY2FzZSBpcyBub3QgbmVlZGVkIGJ5IFR5cGVTY3JpcHQgY29tcGlsZXIsIGFzIHRoZSBzd2l0Y2ggaXMgZXhoYXVzdGl2ZS5cbiAgICAgIC8vIEhvd2V2ZXIgQ2xvc3VyZSBDb21waWxlciBkb2VzIG5vdCB1bmRlcnN0YW5kIHRoYXQgYW5kIHJlcG9ydHMgYW4gZXJyb3IgaW4gdHlwZWQgbW9kZS5cbiAgICAgIC8vIFRoZSBgdGhyb3cgbmV3IEVycm9yYCBiZWxvdyB3b3JrcyBhcm91bmQgdGhlIHByb2JsZW0sIGFuZCB0aGUgdW5leHBlY3RlZDogbmV2ZXIgdmFyaWFibGVcbiAgICAgIC8vIG1ha2VzIHN1cmUgdHNjIHN0aWxsIGNoZWNrcyB0aGlzIGNvZGUgaXMgdW5yZWFjaGFibGUuXG4gICAgICBjb25zdCB1bmV4cGVjdGVkOiBuZXZlciA9IG5hbWU7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuZXhwZWN0ZWQgdHJhbnNsYXRpb24gdHlwZSAke3VuZXhwZWN0ZWR9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBhbmQgYW4gb2Zmc2V0IGludG8gYSB0aW1lem9uZSB3aXRoIElTTzg2MDEgb3JcbiAqIEdNVCBmb3JtYXQgZGVwZW5kaW5nIG9uIHRoZSB3aWR0aCAoZWc6IHNob3J0ID0gKzA0MzAsIHNob3J0OkdNVCA9IEdNVCs0LCBsb25nID0gR01UKzA0OjMwLFxuICogZXh0ZW5kZWQgPSArMDQ6MzApXG4gKi9cbmZ1bmN0aW9uIHRpbWVab25lR2V0dGVyKHdpZHRoOiBab25lV2lkdGgpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcikge1xuICAgIGNvbnN0IHpvbmUgPSAtMSAqIG9mZnNldDtcbiAgICBjb25zdCBtaW51c1NpZ24gPSBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKTtcbiAgICBjb25zdCBob3VycyA9IHpvbmUgPiAwID8gTWF0aC5mbG9vcih6b25lIC8gNjApIDogTWF0aC5jZWlsKHpvbmUgLyA2MCk7XG4gICAgc3dpdGNoICh3aWR0aCkge1xuICAgICAgY2FzZSBab25lV2lkdGguU2hvcnQ6XG4gICAgICAgIHJldHVybiAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDIsIG1pbnVzU2lnbikgK1xuICAgICAgICAgICAgcGFkTnVtYmVyKE1hdGguYWJzKHpvbmUgJSA2MCksIDIsIG1pbnVzU2lnbik7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5TaG9ydEdNVDpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgKCh6b25lID49IDApID8gJysnIDogJycpICsgcGFkTnVtYmVyKGhvdXJzLCAxLCBtaW51c1NpZ24pO1xuICAgICAgY2FzZSBab25lV2lkdGguTG9uZzpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgKCh6b25lID49IDApID8gJysnIDogJycpICsgcGFkTnVtYmVyKGhvdXJzLCAyLCBtaW51c1NpZ24pICsgJzonICtcbiAgICAgICAgICAgIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyLCBtaW51c1NpZ24pO1xuICAgICAgY2FzZSBab25lV2lkdGguRXh0ZW5kZWQ6XG4gICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gJ1onO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDIsIG1pbnVzU2lnbikgKyAnOicgK1xuICAgICAgICAgICAgICBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMiwgbWludXNTaWduKTtcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHpvbmUgd2lkdGggXCIke3dpZHRofVwiYCk7XG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBKQU5VQVJZID0gMDtcbmNvbnN0IFRIVVJTREFZID0gNDtcbmZ1bmN0aW9uIGdldEZpcnN0VGh1cnNkYXlPZlllYXIoeWVhcjogbnVtYmVyKSB7XG4gIGNvbnN0IGZpcnN0RGF5T2ZZZWFyID0gKG5ldyBEYXRlKHllYXIsIEpBTlVBUlksIDEpKS5nZXREYXkoKTtcbiAgcmV0dXJuIG5ldyBEYXRlKFxuICAgICAgeWVhciwgMCwgMSArICgoZmlyc3REYXlPZlllYXIgPD0gVEhVUlNEQVkpID8gVEhVUlNEQVkgOiBUSFVSU0RBWSArIDcpIC0gZmlyc3REYXlPZlllYXIpO1xufVxuXG5mdW5jdGlvbiBnZXRUaHVyc2RheVRoaXNXZWVrKGRhdGV0aW1lOiBEYXRlKSB7XG4gIHJldHVybiBuZXcgRGF0ZShcbiAgICAgIGRhdGV0aW1lLmdldEZ1bGxZZWFyKCksIGRhdGV0aW1lLmdldE1vbnRoKCksXG4gICAgICBkYXRldGltZS5nZXREYXRlKCkgKyAoVEhVUlNEQVkgLSBkYXRldGltZS5nZXREYXkoKSkpO1xufVxuXG5mdW5jdGlvbiB3ZWVrR2V0dGVyKHNpemU6IG51bWJlciwgbW9udGhCYXNlZCA9IGZhbHNlKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZykge1xuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKG1vbnRoQmFzZWQpIHtcbiAgICAgIGNvbnN0IG5iRGF5c0JlZm9yZTFzdERheU9mTW9udGggPVxuICAgICAgICAgIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSAtIDE7XG4gICAgICBjb25zdCB0b2RheSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgcmVzdWx0ID0gMSArIE1hdGguZmxvb3IoKHRvZGF5ICsgbmJEYXlzQmVmb3JlMXN0RGF5T2ZNb250aCkgLyA3KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZmlyc3RUaHVycyA9IGdldEZpcnN0VGh1cnNkYXlPZlllYXIoZGF0ZS5nZXRGdWxsWWVhcigpKTtcbiAgICAgIGNvbnN0IHRoaXNUaHVycyA9IGdldFRodXJzZGF5VGhpc1dlZWsoZGF0ZSk7XG4gICAgICBjb25zdCBkaWZmID0gdGhpc1RodXJzLmdldFRpbWUoKSAtIGZpcnN0VGh1cnMuZ2V0VGltZSgpO1xuICAgICAgcmVzdWx0ID0gMSArIE1hdGgucm91bmQoZGlmZiAvIDYuMDQ4ZTgpOyAgLy8gNi4wNDhlOCBtcyBwZXIgd2Vla1xuICAgIH1cblxuICAgIHJldHVybiBwYWROdW1iZXIocmVzdWx0LCBzaXplLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSk7XG4gIH07XG59XG5cbnR5cGUgRGF0ZUZvcm1hdHRlciA9IChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZywgb2Zmc2V0PzogbnVtYmVyKSA9PiBzdHJpbmc7XG5cbmNvbnN0IERBVEVfRk9STUFUUzoge1tmb3JtYXQ6IHN0cmluZ106IERhdGVGb3JtYXR0ZXJ9ID0ge307XG5cbi8vIEJhc2VkIG9uIENMRFIgZm9ybWF0czpcbi8vIFNlZSBjb21wbGV0ZSBsaXN0OiBodHRwOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9GaWVsZF9TeW1ib2xfVGFibGVcbi8vIFNlZSBhbHNvIGV4cGxhbmF0aW9uczogaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vZGF0ZS10aW1lXG4vLyBUT0RPKG9jb21iZSk6IHN1cHBvcnQgYWxsIG1pc3NpbmcgY2xkciBmb3JtYXRzOiBZLCBVLCBRLCBELCBGLCBlLCBjLCBqLCBKLCBDLCBBLCB2LCBWLCBYLCB4XG5mdW5jdGlvbiBnZXREYXRlRm9ybWF0dGVyKGZvcm1hdDogc3RyaW5nKTogRGF0ZUZvcm1hdHRlcnxudWxsIHtcbiAgaWYgKERBVEVfRk9STUFUU1tmb3JtYXRdKSB7XG4gICAgcmV0dXJuIERBVEVfRk9STUFUU1tmb3JtYXRdO1xuICB9XG4gIGxldCBmb3JtYXR0ZXI7XG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgLy8gRXJhIG5hbWUgKEFEL0JDKVxuICAgIGNhc2UgJ0cnOlxuICAgIGNhc2UgJ0dHJzpcbiAgICBjYXNlICdHR0cnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRXJhcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHR0dHJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkVyYXMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHR0dHRyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5FcmFzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIDEgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIsIGUuZy4gKEFEIDEgPT4gMSwgQUQgMTk5ID0+IDE5OSlcbiAgICBjYXNlICd5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDEsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDIgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIsIHBhZGRlZCAoMDAtOTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRCAyMDEwID0+IDEwKVxuICAgIGNhc2UgJ3l5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDIsIDAsIHRydWUsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gMyBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgcGFkZGVkICgwMDAtOTk5KS4gKGUuZy4gQUQgMjAwMSA9PiAwMSwgQUQgMjAxMCA9PiAxMClcbiAgICBjYXNlICd5eXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMywgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gNCBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciAoZS5nLiBBRCAxID0+IDAwMDEsIEFEIDIwMTAgPT4gMjAxMClcbiAgICBjYXNlICd5eXl5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDQsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTW9udGggb2YgdGhlIHllYXIgKDEtMTIpLCBudW1lcmljXG4gICAgY2FzZSAnTSc6XG4gICAgY2FzZSAnTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1vbnRoLCAxLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NJzpcbiAgICBjYXNlICdMTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1vbnRoLCAyLCAxKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTW9udGggb2YgdGhlIHllYXIgKEphbnVhcnksIC4uLiksIHN0cmluZywgZm9ybWF0XG4gICAgY2FzZSAnTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoSmFudWFyeSwgLi4uKSwgc3RyaW5nLCBzdGFuZGFsb25lXG4gICAgY2FzZSAnTExMJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdMTExMJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUsIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xMTExMJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdywgRm9ybVN0eWxlLlN0YW5kYWxvbmUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBXZWVrIG9mIHRoZSB5ZWFyICgxLCAuLi4gNTIpXG4gICAgY2FzZSAndyc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrR2V0dGVyKDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnd3cnOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla0dldHRlcigyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gV2VlayBvZiB0aGUgbW9udGggKDEsIC4uLilcbiAgICBjYXNlICdXJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtHZXR0ZXIoMSwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIERheSBvZiB0aGUgbW9udGggKDEtMzEpXG4gICAgY2FzZSAnZCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkRhdGUsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGQnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5EYXRlLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRGF5IG9mIHRoZSBXZWVrXG4gICAgY2FzZSAnRSc6XG4gICAgY2FzZSAnRUUnOlxuICAgIGNhc2UgJ0VFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUVFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gR2VuZXJpYyBwZXJpb2Qgb2YgdGhlIGRheSAoYW0tcG0pXG4gICAgY2FzZSAnYSc6XG4gICAgY2FzZSAnYWEnOlxuICAgIGNhc2UgJ2FhYSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FhYWEnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FhYWFhJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRXh0ZW5kZWQgcGVyaW9kIG9mIHRoZSBkYXkgKG1pZG5pZ2h0LCBhdCBuaWdodCwgLi4uKSwgc3RhbmRhbG9uZVxuICAgIGNhc2UgJ2InOlxuICAgIGNhc2UgJ2JiJzpcbiAgICBjYXNlICdiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCwgRm9ybVN0eWxlLlN0YW5kYWxvbmUsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmJiYic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUsIEZvcm1TdHlsZS5TdGFuZGFsb25lLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JiYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LCBGb3JtU3R5bGUuU3RhbmRhbG9uZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEV4dGVuZGVkIHBlcmlvZCBvZiB0aGUgZGF5IChtaWRuaWdodCwgbmlnaHQsIC4uLiksIHN0YW5kYWxvbmVcbiAgICBjYXNlICdCJzpcbiAgICBjYXNlICdCQic6XG4gICAgY2FzZSAnQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsIEZvcm1TdHlsZS5Gb3JtYXQsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQkJCQic6XG4gICAgICBmb3JtYXR0ZXIgPVxuICAgICAgICAgIGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSwgRm9ybVN0eWxlLkZvcm1hdCwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdCQkJCQic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdywgRm9ybVN0eWxlLkZvcm1hdCwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEhvdXIgaW4gQU0vUE0sICgxLTEyKVxuICAgIGNhc2UgJ2gnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMSwgLTEyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2hoJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDIsIC0xMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIEhvdXIgb2YgdGhlIGRheSAoMC0yMylcbiAgICBjYXNlICdIJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gSG91ciBpbiBkYXksIHBhZGRlZCAoMDAtMjMpXG4gICAgY2FzZSAnSEgnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIE1pbnV0ZSBvZiB0aGUgaG91ciAoMC01OSlcbiAgICBjYXNlICdtJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTWludXRlcywgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtbSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1pbnV0ZXMsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBTZWNvbmQgb2YgdGhlIG1pbnV0ZSAoMC01OSlcbiAgICBjYXNlICdzJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuU2Vjb25kcywgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzcyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLlNlY29uZHMsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBGcmFjdGlvbmFsIHNlY29uZFxuICAgIGNhc2UgJ1MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kcywgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdTUyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzLCAyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1NTUyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzLCAzKTtcbiAgICAgIGJyZWFrO1xuXG5cbiAgICAvLyBUaW1lem9uZSBJU084NjAxIHNob3J0IGZvcm1hdCAoLTA0MzApXG4gICAgY2FzZSAnWic6XG4gICAgY2FzZSAnWlonOlxuICAgIGNhc2UgJ1paWic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVGltZXpvbmUgSVNPODYwMSBleHRlbmRlZCBmb3JtYXQgKC0wNDozMClcbiAgICBjYXNlICdaWlpaWic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguRXh0ZW5kZWQpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBUaW1lem9uZSBHTVQgc2hvcnQgZm9ybWF0IChHTVQrNClcbiAgICBjYXNlICdPJzpcbiAgICBjYXNlICdPTyc6XG4gICAgY2FzZSAnT09PJzpcbiAgICAvLyBTaG91bGQgYmUgbG9jYXRpb24sIGJ1dCBmYWxsYmFjayB0byBmb3JtYXQgTyBpbnN0ZWFkIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSB0aGUgZGF0YSB5ZXRcbiAgICBjYXNlICd6JzpcbiAgICBjYXNlICd6eic6XG4gICAgY2FzZSAnenp6JzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5TaG9ydEdNVCk7XG4gICAgICBicmVhaztcbiAgICAvLyBUaW1lem9uZSBHTVQgbG9uZyBmb3JtYXQgKEdNVCswNDMwKVxuICAgIGNhc2UgJ09PT08nOlxuICAgIGNhc2UgJ1paWlonOlxuICAgIC8vIFNob3VsZCBiZSBsb2NhdGlvbiwgYnV0IGZhbGxiYWNrIHRvIGZvcm1hdCBPIGluc3RlYWQgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRoZSBkYXRhIHlldFxuICAgIGNhc2UgJ3p6enonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLkxvbmcpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG4gIERBVEVfRk9STUFUU1tmb3JtYXRdID0gZm9ybWF0dGVyO1xuICByZXR1cm4gZm9ybWF0dGVyO1xufVxuXG5mdW5jdGlvbiB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lOiBzdHJpbmcsIGZhbGxiYWNrOiBudW1iZXIpOiBudW1iZXIge1xuICAvLyBTdXBwb3J0OiBJRSA5LTExIG9ubHksIEVkZ2UgMTMtMTUrXG4gIC8vIElFL0VkZ2UgZG8gbm90IFwidW5kZXJzdGFuZFwiIGNvbG9uIChgOmApIGluIHRpbWV6b25lXG4gIHRpbWV6b25lID0gdGltZXpvbmUucmVwbGFjZSgvOi9nLCAnJyk7XG4gIGNvbnN0IHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0ID0gRGF0ZS5wYXJzZSgnSmFuIDAxLCAxOTcwIDAwOjAwOjAwICcgKyB0aW1lem9uZSkgLyA2MDAwMDtcbiAgcmV0dXJuIGlzTmFOKHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0KSA/IGZhbGxiYWNrIDogcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQ7XG59XG5cbmZ1bmN0aW9uIGFkZERhdGVNaW51dGVzKGRhdGU6IERhdGUsIG1pbnV0ZXM6IG51bWJlcikge1xuICBkYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO1xuICBkYXRlLnNldE1pbnV0ZXMoZGF0ZS5nZXRNaW51dGVzKCkgKyBtaW51dGVzKTtcbiAgcmV0dXJuIGRhdGU7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZTogRGF0ZSwgdGltZXpvbmU6IHN0cmluZywgcmV2ZXJzZTogYm9vbGVhbik6IERhdGUge1xuICBjb25zdCByZXZlcnNlVmFsdWUgPSByZXZlcnNlID8gLTEgOiAxO1xuICBjb25zdCBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIGNvbnN0IHRpbWV6b25lT2Zmc2V0ID0gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZSwgZGF0ZVRpbWV6b25lT2Zmc2V0KTtcbiAgcmV0dXJuIGFkZERhdGVNaW51dGVzKGRhdGUsIHJldmVyc2VWYWx1ZSAqICh0aW1lem9uZU9mZnNldCAtIGRhdGVUaW1lem9uZU9mZnNldCkpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgdmFsdWUgdG8gZGF0ZS5cbiAqXG4gKiBTdXBwb3J0ZWQgaW5wdXQgZm9ybWF0czpcbiAqIC0gYERhdGVgXG4gKiAtIG51bWJlcjogdGltZXN0YW1wXG4gKiAtIHN0cmluZzogbnVtZXJpYyAoZS5nLiBcIjEyMzRcIiksIElTTyBhbmQgZGF0ZSBzdHJpbmdzIGluIGEgZm9ybWF0IHN1cHBvcnRlZCBieVxuICogICBbRGF0ZS5wYXJzZSgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9EYXRlL3BhcnNlKS5cbiAqICAgTm90ZTogSVNPIHN0cmluZ3Mgd2l0aG91dCB0aW1lIHJldHVybiBhIGRhdGUgd2l0aG91dCB0aW1lb2Zmc2V0LlxuICpcbiAqIFRocm93cyBpZiB1bmFibGUgdG8gY29udmVydCB0byBhIGRhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0RhdGUodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IERhdGUpOiBEYXRlIHtcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS50cmltKCk7XG5cbiAgICBjb25zdCBwYXJzZWROYiA9IHBhcnNlRmxvYXQodmFsdWUpO1xuXG4gICAgLy8gYW55IHN0cmluZyB0aGF0IG9ubHkgY29udGFpbnMgbnVtYmVycywgbGlrZSBcIjEyMzRcIiBidXQgbm90IGxpa2UgXCIxMjM0aGVsbG9cIlxuICAgIGlmICghaXNOYU4odmFsdWUgYXMgYW55IC0gcGFyc2VkTmIpKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUocGFyc2VkTmIpO1xuICAgIH1cblxuICAgIGlmICgvXihcXGR7NH0tXFxkezEsMn0tXFxkezEsMn0pJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgIC8qIEZvciBJU08gU3RyaW5ncyB3aXRob3V0IHRpbWUgdGhlIGRheSwgbW9udGggYW5kIHllYXIgbXVzdCBiZSBleHRyYWN0ZWQgZnJvbSB0aGUgSVNPIFN0cmluZ1xuICAgICAgYmVmb3JlIERhdGUgY3JlYXRpb24gdG8gYXZvaWQgdGltZSBvZmZzZXQgYW5kIGVycm9ycyBpbiB0aGUgbmV3IERhdGUuXG4gICAgICBJZiB3ZSBvbmx5IHJlcGxhY2UgJy0nIHdpdGggJywnIGluIHRoZSBJU08gU3RyaW5nIChcIjIwMTUsMDEsMDFcIiksIGFuZCB0cnkgdG8gY3JlYXRlIGEgbmV3XG4gICAgICBkYXRlLCBzb21lIGJyb3dzZXJzIChlLmcuIElFIDkpIHdpbGwgdGhyb3cgYW4gaW52YWxpZCBEYXRlIGVycm9yLlxuICAgICAgSWYgd2UgbGVhdmUgdGhlICctJyAoXCIyMDE1LTAxLTAxXCIpIGFuZCB0cnkgdG8gY3JlYXRlIGEgbmV3IERhdGUoXCIyMDE1LTAxLTAxXCIpIHRoZSB0aW1lb2Zmc2V0XG4gICAgICBpcyBhcHBsaWVkLlxuICAgICAgTm90ZTogSVNPIG1vbnRocyBhcmUgMCBmb3IgSmFudWFyeSwgMSBmb3IgRmVicnVhcnksIC4uLiAqL1xuICAgICAgY29uc3QgW3ksIG0sIGRdID0gdmFsdWUuc3BsaXQoJy0nKS5tYXAoKHZhbDogc3RyaW5nKSA9PiArdmFsKTtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSh5LCBtIC0gMSwgZCk7XG4gICAgfVxuXG4gICAgbGV0IG1hdGNoOiBSZWdFeHBNYXRjaEFycmF5fG51bGw7XG4gICAgaWYgKG1hdGNoID0gdmFsdWUubWF0Y2goSVNPODYwMV9EQVRFX1JFR0VYKSkge1xuICAgICAgcmV0dXJuIGlzb1N0cmluZ1RvRGF0ZShtYXRjaCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlIGFzIGFueSk7XG4gIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY29udmVydCBcIiR7dmFsdWV9XCIgaW50byBhIGRhdGVgKTtcbiAgfVxuICByZXR1cm4gZGF0ZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGRhdGUgaW4gSVNPODYwMSB0byBhIERhdGUuXG4gKiBVc2VkIGluc3RlYWQgb2YgYERhdGUucGFyc2VgIGJlY2F1c2Ugb2YgYnJvd3NlciBkaXNjcmVwYW5jaWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNvU3RyaW5nVG9EYXRlKG1hdGNoOiBSZWdFeHBNYXRjaEFycmF5KTogRGF0ZSB7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgbGV0IHR6SG91ciA9IDA7XG4gIGxldCB0ek1pbiA9IDA7XG5cbiAgLy8gbWF0Y2hbOF0gbWVhbnMgdGhhdCB0aGUgc3RyaW5nIGNvbnRhaW5zIFwiWlwiIChVVEMpIG9yIGEgdGltZXpvbmUgbGlrZSBcIiswMTowMFwiIG9yIFwiKzAxMDBcIlxuICBjb25zdCBkYXRlU2V0dGVyID0gbWF0Y2hbOF0gPyBkYXRlLnNldFVUQ0Z1bGxZZWFyIDogZGF0ZS5zZXRGdWxsWWVhcjtcbiAgY29uc3QgdGltZVNldHRlciA9IG1hdGNoWzhdID8gZGF0ZS5zZXRVVENIb3VycyA6IGRhdGUuc2V0SG91cnM7XG5cbiAgLy8gaWYgdGhlcmUgaXMgYSB0aW1lem9uZSBkZWZpbmVkIGxpa2UgXCIrMDE6MDBcIiBvciBcIiswMTAwXCJcbiAgaWYgKG1hdGNoWzldKSB7XG4gICAgdHpIb3VyID0gTnVtYmVyKG1hdGNoWzldICsgbWF0Y2hbMTBdKTtcbiAgICB0ek1pbiA9IE51bWJlcihtYXRjaFs5XSArIG1hdGNoWzExXSk7XG4gIH1cbiAgZGF0ZVNldHRlci5jYWxsKGRhdGUsIE51bWJlcihtYXRjaFsxXSksIE51bWJlcihtYXRjaFsyXSkgLSAxLCBOdW1iZXIobWF0Y2hbM10pKTtcbiAgY29uc3QgaCA9IE51bWJlcihtYXRjaFs0XSB8fCAwKSAtIHR6SG91cjtcbiAgY29uc3QgbSA9IE51bWJlcihtYXRjaFs1XSB8fCAwKSAtIHR6TWluO1xuICBjb25zdCBzID0gTnVtYmVyKG1hdGNoWzZdIHx8IDApO1xuICBjb25zdCBtcyA9IE1hdGgucm91bmQocGFyc2VGbG9hdCgnMC4nICsgKG1hdGNoWzddIHx8IDApKSAqIDEwMDApO1xuICB0aW1lU2V0dGVyLmNhbGwoZGF0ZSwgaCwgbSwgcywgbXMpO1xuICByZXR1cm4gZGF0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRGF0ZSB7XG4gIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgJiYgIWlzTmFOKHZhbHVlLnZhbHVlT2YoKSk7XG59XG4iXX0=