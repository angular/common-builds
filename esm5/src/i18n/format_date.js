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
import { FormStyle, FormatWidth, NumberSymbol, TranslationWidth, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat } from './locale_data_api';
export var /** @type {?} */ ISO8601_DATE_REGEX = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
var /** @type {?} */ NAMED_FORMATS = {};
var /** @type {?} */ DATE_FORMATS_SPLIT = /((?:[^GyMLwWdEabBhHmsSzZO']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
/** @enum {number} */
var ZoneWidth = {
    Short: 0,
    ShortGMT: 1,
    Long: 2,
    Extended: 3,
};
ZoneWidth[ZoneWidth.Short] = "Short";
ZoneWidth[ZoneWidth.ShortGMT] = "ShortGMT";
ZoneWidth[ZoneWidth.Long] = "Long";
ZoneWidth[ZoneWidth.Extended] = "Extended";
/** @enum {number} */
var DateType = {
    FullYear: 0,
    Month: 1,
    Date: 2,
    Hours: 3,
    Minutes: 4,
    Seconds: 5,
    Milliseconds: 6,
    Day: 7,
};
DateType[DateType.FullYear] = "FullYear";
DateType[DateType.Month] = "Month";
DateType[DateType.Date] = "Date";
DateType[DateType.Hours] = "Hours";
DateType[DateType.Minutes] = "Minutes";
DateType[DateType.Seconds] = "Seconds";
DateType[DateType.Milliseconds] = "Milliseconds";
DateType[DateType.Day] = "Day";
/** @enum {number} */
var TranslationType = {
    DayPeriods: 0,
    Days: 1,
    Months: 2,
    Eras: 3,
};
TranslationType[TranslationType.DayPeriods] = "DayPeriods";
TranslationType[TranslationType.Days] = "Days";
TranslationType[TranslationType.Months] = "Months";
TranslationType[TranslationType.Eras] = "Eras";
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a date according to locale rules.
 *
 * Where:
 * - `value` is a Date, a number (milliseconds since UTC epoch) or an ISO string
 *   (https://www.w3.org/TR/NOTE-datetime).
 * - `format` indicates which date/time components to include. See {\@link DatePipe} for more
 *   details.
 * - `locale` is a `string` defining the locale to use.
 * - `timezone` to be used for formatting. It understands UTC/GMT and the continental US time zone
 *   abbreviations, but for general use, use a time zone offset (e.g. `'+0430'`).
 *   If not specified, host system settings are used.
 *
 * See {\@link DatePipe} for more details.
 *
 *
 * @param {?} value
 * @param {?} format
 * @param {?} locale
 * @param {?=} timezone
 * @return {?}
 */
export function formatDate(value, format, locale, timezone) {
    var /** @type {?} */ date = toDate(value);
    var /** @type {?} */ namedFormat = getNamedFormat(locale, format);
    format = namedFormat || format;
    var /** @type {?} */ parts = [];
    var /** @type {?} */ match;
    while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
            parts = parts.concat(match.slice(1));
            var /** @type {?} */ part = parts.pop();
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
    var /** @type {?} */ dateTimezoneOffset = date.getTimezoneOffset();
    if (timezone) {
        dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
        date = convertTimezoneToLocal(date, timezone, true);
    }
    var /** @type {?} */ text = '';
    parts.forEach(function (value) {
        var /** @type {?} */ dateFormatter = getDateFormatter(value);
        text += dateFormatter ?
            dateFormatter(date, locale, dateTimezoneOffset) :
            value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
    });
    return text;
}
/**
 * @param {?} locale
 * @param {?} format
 * @return {?}
 */
function getNamedFormat(locale, format) {
    var /** @type {?} */ localeId = getLocaleId(locale);
    NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};
    if (NAMED_FORMATS[localeId][format]) {
        return NAMED_FORMATS[localeId][format];
    }
    var /** @type {?} */ formatValue = '';
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
            var /** @type {?} */ shortTime = getNamedFormat(locale, 'shortTime');
            var /** @type {?} */ shortDate = getNamedFormat(locale, 'shortDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
            break;
        case 'medium':
            var /** @type {?} */ mediumTime = getNamedFormat(locale, 'mediumTime');
            var /** @type {?} */ mediumDate = getNamedFormat(locale, 'mediumDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
            break;
        case 'long':
            var /** @type {?} */ longTime = getNamedFormat(locale, 'longTime');
            var /** @type {?} */ longDate = getNamedFormat(locale, 'longDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
            break;
        case 'full':
            var /** @type {?} */ fullTime = getNamedFormat(locale, 'fullTime');
            var /** @type {?} */ fullDate = getNamedFormat(locale, 'fullDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
            break;
    }
    if (formatValue) {
        NAMED_FORMATS[localeId][format] = formatValue;
    }
    return formatValue;
}
/**
 * @param {?} str
 * @param {?} opt_values
 * @return {?}
 */
function formatDateTime(str, opt_values) {
    if (opt_values) {
        str = str.replace(/\{([^}]+)}/g, function (match, key) {
            return (opt_values != null && key in opt_values) ? opt_values[key] : match;
        });
    }
    return str;
}
/**
 * @param {?} num
 * @param {?} digits
 * @param {?=} minusSign
 * @param {?=} trim
 * @param {?=} negWrap
 * @return {?}
 */
function padNumber(num, digits, minusSign, trim, negWrap) {
    if (minusSign === void 0) { minusSign = '-'; }
    var /** @type {?} */ neg = '';
    if (num < 0 || (negWrap && num <= 0)) {
        if (negWrap) {
            num = -num + 1;
        }
        else {
            num = -num;
            neg = minusSign;
        }
    }
    var /** @type {?} */ strNum = String(num);
    while (strNum.length < digits) {
        strNum = '0' + strNum;
    }
    if (trim) {
        strNum = strNum.substr(strNum.length - digits);
    }
    return neg + strNum;
}
/**
 * Returns a date formatter that transforms a date into its locale digit representation
 * @param {?} name
 * @param {?} size
 * @param {?=} offset
 * @param {?=} trim
 * @param {?=} negWrap
 * @return {?}
 */
function dateGetter(name, size, offset, trim, negWrap) {
    if (offset === void 0) { offset = 0; }
    if (trim === void 0) { trim = false; }
    if (negWrap === void 0) { negWrap = false; }
    return function (date, locale) {
        var /** @type {?} */ part = getDatePart(name, date, size);
        if (offset > 0 || part > -offset) {
            part += offset;
        }
        if (name === DateType.Hours && part === 0 && offset === -12) {
            part = 12;
        }
        return padNumber(part, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim, negWrap);
    };
}
/**
 * @param {?} name
 * @param {?} date
 * @param {?} size
 * @return {?}
 */
function getDatePart(name, date, size) {
    switch (name) {
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
        case DateType.Milliseconds:
            var /** @type {?} */ div = size === 1 ? 100 : (size === 2 ? 10 : 1);
            return Math.round(date.getMilliseconds() / div);
        case DateType.Day:
            return date.getDay();
        default:
            throw new Error("Unknown DateType value \"" + name + "\".");
    }
}
/**
 * Returns a date formatter that transforms a date into its locale string representation
 * @param {?} name
 * @param {?} width
 * @param {?=} form
 * @param {?=} extended
 * @return {?}
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
 * @param {?} date
 * @param {?} locale
 * @param {?} name
 * @param {?} width
 * @param {?} form
 * @param {?} extended
 * @return {?}
 */
function getDateTranslation(date, locale, name, width, form, extended) {
    switch (name) {
        case TranslationType.Months:
            return getLocaleMonthNames(locale, form, width)[date.getMonth()];
        case TranslationType.Days:
            return getLocaleDayNames(locale, form, width)[date.getDay()];
        case TranslationType.DayPeriods:
            var /** @type {?} */ currentHours_1 = date.getHours();
            var /** @type {?} */ currentMinutes_1 = date.getMinutes();
            if (extended) {
                var /** @type {?} */ rules = getLocaleExtraDayPeriodRules(locale);
                var /** @type {?} */ dayPeriods_1 = getLocaleExtraDayPeriods(locale, form, width);
                var /** @type {?} */ result_1;
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
                    else {
                        // noon or midnight
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
            return getLocaleDayPeriods(locale, form, /** @type {?} */ (width))[currentHours_1 < 12 ? 0 : 1];
        case TranslationType.Eras:
            return getLocaleEraNames(locale, /** @type {?} */ (width))[date.getFullYear() <= 0 ? 0 : 1];
        default:
            // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
            // However Closure Compiler does not understand that and reports an error in typed mode.
            // The `throw new Error` below works around the problem, and the unexpected: never variable
            // makes sure tsc still checks this code is unreachable.
            var /** @type {?} */ unexpected = name;
            throw new Error("unexpected translation type " + unexpected);
    }
}
/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 * @param {?} width
 * @return {?}
 */
function timeZoneGetter(width) {
    return function (date, locale, offset) {
        var /** @type {?} */ zone = -1 * offset;
        var /** @type {?} */ minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        var /** @type {?} */ hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
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
var /** @type {?} */ JANUARY = 0;
var /** @type {?} */ THURSDAY = 4;
/**
 * @param {?} year
 * @return {?}
 */
function getFirstThursdayOfYear(year) {
    var /** @type {?} */ firstDayOfYear = (new Date(year, JANUARY, 1)).getDay();
    return new Date(year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
/**
 * @param {?} datetime
 * @return {?}
 */
function getThursdayThisWeek(datetime) {
    return new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (THURSDAY - datetime.getDay()));
}
/**
 * @param {?} size
 * @param {?=} monthBased
 * @return {?}
 */
function weekGetter(size, monthBased) {
    if (monthBased === void 0) { monthBased = false; }
    return function (date, locale) {
        var /** @type {?} */ result;
        if (monthBased) {
            var /** @type {?} */ nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
            var /** @type {?} */ today = date.getDate();
            result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
        }
        else {
            var /** @type {?} */ firstThurs = getFirstThursdayOfYear(date.getFullYear());
            var /** @type {?} */ thisThurs = getThursdayThisWeek(date);
            var /** @type {?} */ diff = thisThurs.getTime() - firstThurs.getTime();
            result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
        }
        return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    };
}
var /** @type {?} */ DATE_FORMATS = {};
/**
 * @param {?} format
 * @return {?}
 */
function getDateFormatter(format) {
    if (DATE_FORMATS[format]) {
        return DATE_FORMATS[format];
    }
    var /** @type {?} */ formatter;
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
        // Fractional second padded (0-9)
        case 'S':
            formatter = dateGetter(DateType.Milliseconds, 1);
            break;
        case 'SS':
            formatter = dateGetter(DateType.Milliseconds, 2);
            break;
        // = millisecond
        case 'SSS':
            formatter = dateGetter(DateType.Milliseconds, 3);
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
/**
 * @param {?} timezone
 * @param {?} fallback
 * @return {?}
 */
function timezoneToOffset(timezone, fallback) {
    // Support: IE 9-11 only, Edge 13-15+
    // IE/Edge do not "understand" colon (`:`) in timezone
    timezone = timezone.replace(/:/g, '');
    var /** @type {?} */ requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
/**
 * @param {?} date
 * @param {?} minutes
 * @return {?}
 */
function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
/**
 * @param {?} date
 * @param {?} timezone
 * @param {?} reverse
 * @return {?}
 */
function convertTimezoneToLocal(date, timezone, reverse) {
    var /** @type {?} */ reverseValue = reverse ? -1 : 1;
    var /** @type {?} */ dateTimezoneOffset = date.getTimezoneOffset();
    var /** @type {?} */ timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
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
 * @param {?} value
 * @return {?}
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
        var /** @type {?} */ parsedNb = parseFloat(value);
        // any string that only contains numbers, like "1234" but not like "1234hello"
        if (!isNaN(/** @type {?} */ (value) - parsedNb)) {
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
            var _a = value.split('-').map(function (val) { return +val; }), y = _a[0], m = _a[1], d = _a[2];
            return new Date(y, m - 1, d);
        }
        var /** @type {?} */ match = void 0;
        if (match = value.match(ISO8601_DATE_REGEX)) {
            return isoStringToDate(match);
        }
    }
    var /** @type {?} */ date = new Date(/** @type {?} */ (value));
    if (!isDate(date)) {
        throw new Error("Unable to convert \"" + value + "\" into a date");
    }
    return date;
}
/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 * @param {?} match
 * @return {?}
 */
export function isoStringToDate(match) {
    var /** @type {?} */ date = new Date(0);
    var /** @type {?} */ tzHour = 0;
    var /** @type {?} */ tzMin = 0;
    // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
    var /** @type {?} */ dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
    var /** @type {?} */ timeSetter = match[8] ? date.setUTCHours : date.setHours;
    // if there is a timezone defined like "+01:00" or "+0100"
    if (match[9]) {
        tzHour = Number(match[9] + match[10]);
        tzMin = Number(match[9] + match[11]);
    }
    dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    var /** @type {?} */ h = Number(match[4] || 0) - tzHour;
    var /** @type {?} */ m = Number(match[5] || 0) - tzMin;
    var /** @type {?} */ s = Number(match[6] || 0);
    var /** @type {?} */ ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
}
/**
 * @param {?} value
 * @return {?}
 */
export function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}
//# sourceMappingURL=format_date.js.map