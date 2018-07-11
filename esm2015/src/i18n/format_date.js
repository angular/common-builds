/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FormStyle, FormatWidth, NumberSymbol, TranslationWidth, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat } from './locale_data_api';
export const ISO8601_DATE_REGEX = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
const NAMED_FORMATS = {};
const DATE_FORMATS_SPLIT = /((?:[^GyMLwWdEabBhHmsSzZO']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
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
 * Where:
 * - `value` is a Date, a number (milliseconds since UTC epoch) or an ISO string
 *   (https://www.w3.org/TR/NOTE-datetime).
 * - `format` indicates which date/time components to include. See {@link DatePipe} for more
 *   details.
 * - `locale` is a `string` defining the locale to use.
 * - `timezone` to be used for formatting. It understands UTC/GMT and the continental US time zone
 *   abbreviations, but for general use, use a time zone offset (e.g. `'+0430'`).
 *   If not specified, host system settings are used.
 *
 * See {@link DatePipe} for more details.
 */
export function formatDate(value, format, locale, timezone) {
    let date = toDate(value);
    const namedFormat = getNamedFormat(locale, format);
    format = namedFormat || format;
    let parts = [];
    let match;
    while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
            parts = parts.concat(match.slice(1));
            const part = parts.pop();
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
    let dateTimezoneOffset = date.getTimezoneOffset();
    if (timezone) {
        dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
        date = convertTimezoneToLocal(date, timezone, true);
    }
    let text = '';
    parts.forEach(value => {
        const dateFormatter = getDateFormatter(value);
        text += dateFormatter ?
            dateFormatter(date, locale, dateTimezoneOffset) :
            value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
    });
    return text;
}
function getNamedFormat(locale, format) {
    const localeId = getLocaleId(locale);
    NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};
    if (NAMED_FORMATS[localeId][format]) {
        return NAMED_FORMATS[localeId][format];
    }
    let formatValue = '';
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
            const shortTime = getNamedFormat(locale, 'shortTime');
            const shortDate = getNamedFormat(locale, 'shortDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
            break;
        case 'medium':
            const mediumTime = getNamedFormat(locale, 'mediumTime');
            const mediumDate = getNamedFormat(locale, 'mediumDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
            break;
        case 'long':
            const longTime = getNamedFormat(locale, 'longTime');
            const longDate = getNamedFormat(locale, 'longDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
            break;
        case 'full':
            const fullTime = getNamedFormat(locale, 'fullTime');
            const fullDate = getNamedFormat(locale, 'fullDate');
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
function padNumber(num, digits, minusSign = '-', trim, negWrap) {
    let neg = '';
    if (num < 0 || (negWrap && num <= 0)) {
        if (negWrap) {
            num = -num + 1;
        }
        else {
            num = -num;
            neg = minusSign;
        }
    }
    let strNum = String(num);
    while (strNum.length < digits) {
        strNum = '0' + strNum;
    }
    if (trim) {
        strNum = strNum.substr(strNum.length - digits);
    }
    return neg + strNum;
}
/**
 * Trim a fractional part to `digits` number of digits.
 * Right pads with "0" to fit the requested number of digits if needed.
 *
 * @param num The fractional part value
 * @param digits The width of the output
 */
function trimRPadFractional(num, digits) {
    let strNum = String(num);
    // Add padding at the end
    while (strNum.length < digits) {
        strNum = strNum + 0;
    }
    return strNum.substr(0, digits);
}
/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(name, size, offset = 0, trim = false, negWrap = false) {
    return function (date, locale) {
        let part = getDatePart(name, date);
        if (offset > 0 || part > -offset) {
            part += offset;
        }
        if (name === DateType.Hours) {
            if (part === 0 && offset === -12) {
                part = 12;
            }
        }
        else if (name === DateType.FractionalSeconds) {
            return trimRPadFractional(part, size);
        }
        const localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
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
            throw new Error(`Unknown DateType value "${part}".`);
    }
}
/**
 * Returns a date formatter that transforms a date into its locale string representation
 */
function dateStrGetter(name, width, form = FormStyle.Format, extended = false) {
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
            const currentHours = date.getHours();
            const currentMinutes = date.getMinutes();
            if (extended) {
                const rules = getLocaleExtraDayPeriodRules(locale);
                const dayPeriods = getLocaleExtraDayPeriods(locale, form, width);
                let result;
                rules.forEach((rule, index) => {
                    if (Array.isArray(rule)) {
                        // morning, afternoon, evening, night
                        const { hours: hoursFrom, minutes: minutesFrom } = rule[0];
                        const { hours: hoursTo, minutes: minutesTo } = rule[1];
                        if (currentHours >= hoursFrom && currentMinutes >= minutesFrom &&
                            (currentHours < hoursTo ||
                                (currentHours === hoursTo && currentMinutes < minutesTo))) {
                            result = dayPeriods[index];
                        }
                    }
                    else { // noon or midnight
                        const { hours, minutes } = rule;
                        if (hours === currentHours && minutes === currentMinutes) {
                            result = dayPeriods[index];
                        }
                    }
                });
                if (result) {
                    return result;
                }
            }
            // if no rules for the day periods, we use am/pm by default
            return getLocaleDayPeriods(locale, form, width)[currentHours < 12 ? 0 : 1];
        case TranslationType.Eras:
            return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
        default:
            // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
            // However Closure Compiler does not understand that and reports an error in typed mode.
            // The `throw new Error` below works around the problem, and the unexpected: never variable
            // makes sure tsc still checks this code is unreachable.
            const unexpected = name;
            throw new Error(`unexpected translation type ${unexpected}`);
    }
}
/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 */
function timeZoneGetter(width) {
    return function (date, locale, offset) {
        const zone = -1 * offset;
        const minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
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
                throw new Error(`Unknown zone width "${width}"`);
        }
    };
}
const JANUARY = 0;
const THURSDAY = 4;
function getFirstThursdayOfYear(year) {
    const firstDayOfYear = (new Date(year, JANUARY, 1)).getDay();
    return new Date(year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
function getThursdayThisWeek(datetime) {
    return new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (THURSDAY - datetime.getDay()));
}
function weekGetter(size, monthBased = false) {
    return function (date, locale) {
        let result;
        if (monthBased) {
            const nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
            const today = date.getDate();
            result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
        }
        else {
            const firstThurs = getFirstThursdayOfYear(date.getFullYear());
            const thisThurs = getThursdayThisWeek(date);
            const diff = thisThurs.getTime() - firstThurs.getTime();
            result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
        }
        return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    };
}
const DATE_FORMATS = {};
// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: Y, U, Q, D, F, e, c, j, J, C, A, v, V, X, x
function getDateFormatter(format) {
    if (DATE_FORMATS[format]) {
        return DATE_FORMATS[format];
    }
    let formatter;
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
    const requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
function convertTimezoneToLocal(date, timezone, reverse) {
    const reverseValue = reverse ? -1 : 1;
    const dateTimezoneOffset = date.getTimezoneOffset();
    const timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
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
        const parsedNb = parseFloat(value);
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
            const [y, m, d] = value.split('-').map((val) => +val);
            return new Date(y, m - 1, d);
        }
        let match;
        if (match = value.match(ISO8601_DATE_REGEX)) {
            return isoStringToDate(match);
        }
    }
    const date = new Date(value);
    if (!isDate(date)) {
        throw new Error(`Unable to convert "${value}" into a date`);
    }
    return date;
}
/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 */
export function isoStringToDate(match) {
    const date = new Date(0);
    let tzHour = 0;
    let tzMin = 0;
    // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
    const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
    const timeSetter = match[8] ? date.setUTCHours : date.setHours;
    // if there is a timezone defined like "+01:00" or "+0100"
    if (match[9]) {
        tzHour = Number(match[9] + match[10]);
        tzMin = Number(match[9] + match[11]);
    }
    dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const h = Number(match[4] || 0) - tzHour;
    const m = Number(match[5] || 0) - tzMin;
    const s = Number(match[6] || 0);
    const ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
}
export function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X2RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2kxOG4vZm9ybWF0X2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFRLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLDRCQUE0QixFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRTlVLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUMzQixzR0FBc0csQ0FBQztBQUMzRyxnR0FBZ0c7QUFDaEcsTUFBTSxhQUFhLEdBQXFELEVBQUUsQ0FBQztBQUMzRSxNQUFNLGtCQUFrQixHQUNwQixtTUFBbU0sQ0FBQztBQUV4TSxJQUFLLFNBS0o7QUFMRCxXQUFLLFNBQVM7SUFDWiwyQ0FBSyxDQUFBO0lBQ0wsaURBQVEsQ0FBQTtJQUNSLHlDQUFJLENBQUE7SUFDSixpREFBUSxDQUFBO0FBQ1YsQ0FBQyxFQUxJLFNBQVMsS0FBVCxTQUFTLFFBS2I7QUFFRCxJQUFLLFFBU0o7QUFURCxXQUFLLFFBQVE7SUFDWCwrQ0FBUSxDQUFBO0lBQ1IseUNBQUssQ0FBQTtJQUNMLHVDQUFJLENBQUE7SUFDSix5Q0FBSyxDQUFBO0lBQ0wsNkNBQU8sQ0FBQTtJQUNQLDZDQUFPLENBQUE7SUFDUCxpRUFBaUIsQ0FBQTtJQUNqQixxQ0FBRyxDQUFBO0FBQ0wsQ0FBQyxFQVRJLFFBQVEsS0FBUixRQUFRLFFBU1o7QUFFRCxJQUFLLGVBS0o7QUFMRCxXQUFLLGVBQWU7SUFDbEIsaUVBQVUsQ0FBQTtJQUNWLHFEQUFJLENBQUE7SUFDSix5REFBTSxDQUFB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QUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUN6QyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN4QyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0saUJBQWlCLEtBQVU7SUFDL0IsT0FBTyxLQUFLLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9ybVN0eWxlLCBGb3JtYXRXaWR0aCwgTnVtYmVyU3ltYm9sLCBUaW1lLCBUcmFuc2xhdGlvbldpZHRoLCBnZXRMb2NhbGVEYXRlRm9ybWF0LCBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdCwgZ2V0TG9jYWxlRGF5TmFtZXMsIGdldExvY2FsZURheVBlcmlvZHMsIGdldExvY2FsZUVyYU5hbWVzLCBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzLCBnZXRMb2NhbGVFeHRyYURheVBlcmlvZHMsIGdldExvY2FsZUlkLCBnZXRMb2NhbGVNb250aE5hbWVzLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIGdldExvY2FsZVRpbWVGb3JtYXR9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuZXhwb3J0IGNvbnN0IElTTzg2MDFfREFURV9SRUdFWCA9XG4gICAgL14oXFxkezR9KS0/KFxcZFxcZCktPyhcXGRcXGQpKD86VChcXGRcXGQpKD86Oj8oXFxkXFxkKSg/Ojo/KFxcZFxcZCkoPzpcXC4oXFxkKykpPyk/KT8oWnwoWystXSkoXFxkXFxkKTo/KFxcZFxcZCkpPyk/JC87XG4vLyAgICAxICAgICAgICAyICAgICAgIDMgICAgICAgICA0ICAgICAgICAgIDUgICAgICAgICAgNiAgICAgICAgICA3ICAgICAgICAgIDggIDkgICAgIDEwICAgICAgMTFcbmNvbnN0IE5BTUVEX0ZPUk1BVFM6IHtbbG9jYWxlSWQ6IHN0cmluZ106IHtbZm9ybWF0OiBzdHJpbmddOiBzdHJpbmd9fSA9IHt9O1xuY29uc3QgREFURV9GT1JNQVRTX1NQTElUID1cbiAgICAvKCg/OlteR3lNTHdXZEVhYkJoSG1zU3paTyddKyl8KD86Jyg/OlteJ118JycpKicpfCg/Okd7MSw1fXx5ezEsNH18TXsxLDV9fEx7MSw1fXx3ezEsMn18V3sxfXxkezEsMn18RXsxLDZ9fGF7MSw1fXxiezEsNX18QnsxLDV9fGh7MSwyfXxIezEsMn18bXsxLDJ9fHN7MSwyfXxTezEsM318ensxLDR9fFp7MSw1fXxPezEsNH0pKShbXFxzXFxTXSopLztcblxuZW51bSBab25lV2lkdGgge1xuICBTaG9ydCxcbiAgU2hvcnRHTVQsXG4gIExvbmcsXG4gIEV4dGVuZGVkXG59XG5cbmVudW0gRGF0ZVR5cGUge1xuICBGdWxsWWVhcixcbiAgTW9udGgsXG4gIERhdGUsXG4gIEhvdXJzLFxuICBNaW51dGVzLFxuICBTZWNvbmRzLFxuICBGcmFjdGlvbmFsU2Vjb25kcyxcbiAgRGF5XG59XG5cbmVudW0gVHJhbnNsYXRpb25UeXBlIHtcbiAgRGF5UGVyaW9kcyxcbiAgRGF5cyxcbiAgTW9udGhzLFxuICBFcmFzXG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIGRhdGUgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBXaGVyZTpcbiAqIC0gYHZhbHVlYCBpcyBhIERhdGUsIGEgbnVtYmVyIChtaWxsaXNlY29uZHMgc2luY2UgVVRDIGVwb2NoKSBvciBhbiBJU08gc3RyaW5nXG4gKiAgIChodHRwczovL3d3dy53My5vcmcvVFIvTk9URS1kYXRldGltZSkuXG4gKiAtIGBmb3JtYXRgIGluZGljYXRlcyB3aGljaCBkYXRlL3RpbWUgY29tcG9uZW50cyB0byBpbmNsdWRlLiBTZWUge0BsaW5rIERhdGVQaXBlfSBmb3IgbW9yZVxuICogICBkZXRhaWxzLlxuICogLSBgbG9jYWxlYCBpcyBhIGBzdHJpbmdgIGRlZmluaW5nIHRoZSBsb2NhbGUgdG8gdXNlLlxuICogLSBgdGltZXpvbmVgIHRvIGJlIHVzZWQgZm9yIGZvcm1hdHRpbmcuIEl0IHVuZGVyc3RhbmRzIFVUQy9HTVQgYW5kIHRoZSBjb250aW5lbnRhbCBVUyB0aW1lIHpvbmVcbiAqICAgYWJicmV2aWF0aW9ucywgYnV0IGZvciBnZW5lcmFsIHVzZSwgdXNlIGEgdGltZSB6b25lIG9mZnNldCAoZS5nLiBgJyswNDMwJ2ApLlxuICogICBJZiBub3Qgc3BlY2lmaWVkLCBob3N0IHN5c3RlbSBzZXR0aW5ncyBhcmUgdXNlZC5cbiAqXG4gKiBTZWUge0BsaW5rIERhdGVQaXBlfSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZShcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSwgZm9ybWF0OiBzdHJpbmcsIGxvY2FsZTogc3RyaW5nLCB0aW1lem9uZT86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBkYXRlID0gdG9EYXRlKHZhbHVlKTtcbiAgY29uc3QgbmFtZWRGb3JtYXQgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsIGZvcm1hdCk7XG4gIGZvcm1hdCA9IG5hbWVkRm9ybWF0IHx8IGZvcm1hdDtcblxuICBsZXQgcGFydHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKGZvcm1hdCkge1xuICAgIG1hdGNoID0gREFURV9GT1JNQVRTX1NQTElULmV4ZWMoZm9ybWF0KTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHBhcnRzID0gcGFydHMuY29uY2F0KG1hdGNoLnNsaWNlKDEpKTtcbiAgICAgIGNvbnN0IHBhcnQgPSBwYXJ0cy5wb3AoKTtcbiAgICAgIGlmICghcGFydCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGZvcm1hdCA9IHBhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnB1c2goZm9ybWF0KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGxldCBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIGlmICh0aW1lem9uZSkge1xuICAgIGRhdGVUaW1lem9uZU9mZnNldCA9IHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGRhdGVUaW1lem9uZU9mZnNldCk7XG4gICAgZGF0ZSA9IGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZSwgdGltZXpvbmUsIHRydWUpO1xuICB9XG5cbiAgbGV0IHRleHQgPSAnJztcbiAgcGFydHMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgY29uc3QgZGF0ZUZvcm1hdHRlciA9IGdldERhdGVGb3JtYXR0ZXIodmFsdWUpO1xuICAgIHRleHQgKz0gZGF0ZUZvcm1hdHRlciA/XG4gICAgICAgIGRhdGVGb3JtYXR0ZXIoZGF0ZSwgbG9jYWxlLCBkYXRlVGltZXpvbmVPZmZzZXQpIDpcbiAgICAgICAgdmFsdWUgPT09ICdcXCdcXCcnID8gJ1xcJycgOiB2YWx1ZS5yZXBsYWNlKC8oXid8JyQpL2csICcnKS5yZXBsYWNlKC8nJy9nLCAnXFwnJyk7XG4gIH0pO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBnZXROYW1lZEZvcm1hdChsb2NhbGU6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsb2NhbGVJZCA9IGdldExvY2FsZUlkKGxvY2FsZSk7XG4gIE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdID0gTkFNRURfRk9STUFUU1tsb2NhbGVJZF0gfHwge307XG5cbiAgaWYgKE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdW2Zvcm1hdF0pIHtcbiAgICByZXR1cm4gTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XTtcbiAgfVxuXG4gIGxldCBmb3JtYXRWYWx1ZSA9ICcnO1xuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIGNhc2UgJ3Nob3J0RGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW1EYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLk1lZGl1bSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb25nRGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5Mb25nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Z1bGxEYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkZ1bGwpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2hvcnRUaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bVRpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmdUaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkxvbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbFRpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG9ydCc6XG4gICAgICBjb25zdCBzaG9ydFRpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdzaG9ydFRpbWUnKTtcbiAgICAgIGNvbnN0IHNob3J0RGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ3Nob3J0RGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPSBmb3JtYXREYXRlVGltZShcbiAgICAgICAgICBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLlNob3J0KSwgW3Nob3J0VGltZSwgc2hvcnREYXRlXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgY29uc3QgbWVkaXVtVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ21lZGl1bVRpbWUnKTtcbiAgICAgIGNvbnN0IG1lZGl1bURhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdtZWRpdW1EYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9IGZvcm1hdERhdGVUaW1lKFxuICAgICAgICAgIGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKSwgW21lZGl1bVRpbWUsIG1lZGl1bURhdGVdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmcnOlxuICAgICAgY29uc3QgbG9uZ1RpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdsb25nVGltZScpO1xuICAgICAgY29uc3QgbG9uZ0RhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdsb25nRGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPVxuICAgICAgICAgIGZvcm1hdERhdGVUaW1lKGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTG9uZyksIFtsb25nVGltZSwgbG9uZ0RhdGVdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgY29uc3QgZnVsbFRpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdmdWxsVGltZScpO1xuICAgICAgY29uc3QgZnVsbERhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdmdWxsRGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPVxuICAgICAgICAgIGZvcm1hdERhdGVUaW1lKGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCksIFtmdWxsVGltZSwgZnVsbERhdGVdKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmIChmb3JtYXRWYWx1ZSkge1xuICAgIE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdW2Zvcm1hdF0gPSBmb3JtYXRWYWx1ZTtcbiAgfVxuICByZXR1cm4gZm9ybWF0VmFsdWU7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVUaW1lKHN0cjogc3RyaW5nLCBvcHRfdmFsdWVzOiBzdHJpbmdbXSkge1xuICBpZiAob3B0X3ZhbHVlcykge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHsoW159XSspfS9nLCBmdW5jdGlvbihtYXRjaCwga2V5KSB7XG4gICAgICByZXR1cm4gKG9wdF92YWx1ZXMgIT0gbnVsbCAmJiBrZXkgaW4gb3B0X3ZhbHVlcykgPyBvcHRfdmFsdWVzW2tleV0gOiBtYXRjaDtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBwYWROdW1iZXIoXG4gICAgbnVtOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyLCBtaW51c1NpZ24gPSAnLScsIHRyaW0/OiBib29sZWFuLCBuZWdXcmFwPzogYm9vbGVhbik6IHN0cmluZyB7XG4gIGxldCBuZWcgPSAnJztcbiAgaWYgKG51bSA8IDAgfHwgKG5lZ1dyYXAgJiYgbnVtIDw9IDApKSB7XG4gICAgaWYgKG5lZ1dyYXApIHtcbiAgICAgIG51bSA9IC1udW0gKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBudW0gPSAtbnVtO1xuICAgICAgbmVnID0gbWludXNTaWduO1xuICAgIH1cbiAgfVxuICBsZXQgc3RyTnVtID0gU3RyaW5nKG51bSk7XG4gIHdoaWxlIChzdHJOdW0ubGVuZ3RoIDwgZGlnaXRzKSB7XG4gICAgc3RyTnVtID0gJzAnICsgc3RyTnVtO1xuICB9XG4gIGlmICh0cmltKSB7XG4gICAgc3RyTnVtID0gc3RyTnVtLnN1YnN0cihzdHJOdW0ubGVuZ3RoIC0gZGlnaXRzKTtcbiAgfVxuICByZXR1cm4gbmVnICsgc3RyTnVtO1xufVxuXG4vKipcbiAqIFRyaW0gYSBmcmFjdGlvbmFsIHBhcnQgdG8gYGRpZ2l0c2AgbnVtYmVyIG9mIGRpZ2l0cy5cbiAqIFJpZ2h0IHBhZHMgd2l0aCBcIjBcIiB0byBmaXQgdGhlIHJlcXVlc3RlZCBudW1iZXIgb2YgZGlnaXRzIGlmIG5lZWRlZC5cbiAqXG4gKiBAcGFyYW0gbnVtIFRoZSBmcmFjdGlvbmFsIHBhcnQgdmFsdWVcbiAqIEBwYXJhbSBkaWdpdHMgVGhlIHdpZHRoIG9mIHRoZSBvdXRwdXRcbiAqL1xuZnVuY3Rpb24gdHJpbVJQYWRGcmFjdGlvbmFsKG51bTogbnVtYmVyLCBkaWdpdHM6IG51bWJlcik6IHN0cmluZyB7XG4gIGxldCBzdHJOdW0gPSBTdHJpbmcobnVtKTtcbiAgLy8gQWRkIHBhZGRpbmcgYXQgdGhlIGVuZFxuICB3aGlsZSAoc3RyTnVtLmxlbmd0aCA8IGRpZ2l0cykge1xuICAgIHN0ck51bSA9IHN0ck51bSArIDA7XG4gIH1cbiAgcmV0dXJuIHN0ck51bS5zdWJzdHIoMCwgZGlnaXRzKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBpbnRvIGl0cyBsb2NhbGUgZGlnaXQgcmVwcmVzZW50YXRpb25cbiAqL1xuZnVuY3Rpb24gZGF0ZUdldHRlcihcbiAgICBuYW1lOiBEYXRlVHlwZSwgc2l6ZTogbnVtYmVyLCBvZmZzZXQ6IG51bWJlciA9IDAsIHRyaW0gPSBmYWxzZSxcbiAgICBuZWdXcmFwID0gZmFsc2UpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgcGFydCA9IGdldERhdGVQYXJ0KG5hbWUsIGRhdGUpO1xuICAgIGlmIChvZmZzZXQgPiAwIHx8IHBhcnQgPiAtb2Zmc2V0KSB7XG4gICAgICBwYXJ0ICs9IG9mZnNldDtcbiAgICB9XG5cbiAgICBpZiAobmFtZSA9PT0gRGF0ZVR5cGUuSG91cnMpIHtcbiAgICAgIGlmIChwYXJ0ID09PSAwICYmIG9mZnNldCA9PT0gLTEyKSB7XG4gICAgICAgIHBhcnQgPSAxMjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09IERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzKSB7XG4gICAgICByZXR1cm4gdHJpbVJQYWRGcmFjdGlvbmFsKHBhcnQsIHNpemUpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsZU1pbnVzID0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbik7XG4gICAgcmV0dXJuIHBhZE51bWJlcihwYXJ0LCBzaXplLCBsb2NhbGVNaW51cywgdHJpbSwgbmVnV3JhcCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldERhdGVQYXJ0KHBhcnQ6IERhdGVUeXBlLCBkYXRlOiBEYXRlKTogbnVtYmVyIHtcbiAgc3dpdGNoIChwYXJ0KSB7XG4gICAgY2FzZSBEYXRlVHlwZS5GdWxsWWVhcjpcbiAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5Nb250aDpcbiAgICAgIHJldHVybiBkYXRlLmdldE1vbnRoKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5EYXRlOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0RGF0ZSgpO1xuICAgIGNhc2UgRGF0ZVR5cGUuSG91cnM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRIb3VycygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuTWludXRlczpcbiAgICAgIHJldHVybiBkYXRlLmdldE1pbnV0ZXMoKTtcbiAgICBjYXNlIERhdGVUeXBlLlNlY29uZHM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRTZWNvbmRzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kczpcbiAgICAgIHJldHVybiBkYXRlLmdldE1pbGxpc2Vjb25kcygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuRGF5OlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0RGF5KCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBEYXRlVHlwZSB2YWx1ZSBcIiR7cGFydH1cIi5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHRyYW5zZm9ybXMgYSBkYXRlIGludG8gaXRzIGxvY2FsZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAqL1xuZnVuY3Rpb24gZGF0ZVN0ckdldHRlcihcbiAgICBuYW1lOiBUcmFuc2xhdGlvblR5cGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLCBmb3JtOiBGb3JtU3R5bGUgPSBGb3JtU3R5bGUuRm9ybWF0LFxuICAgIGV4dGVuZGVkID0gZmFsc2UpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZ2V0RGF0ZVRyYW5zbGF0aW9uKGRhdGUsIGxvY2FsZSwgbmFtZSwgd2lkdGgsIGZvcm0sIGV4dGVuZGVkKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsb2NhbGUgdHJhbnNsYXRpb24gb2YgYSBkYXRlIGZvciBhIGdpdmVuIGZvcm0sIHR5cGUgYW5kIHdpZHRoXG4gKi9cbmZ1bmN0aW9uIGdldERhdGVUcmFuc2xhdGlvbihcbiAgICBkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZywgbmFtZTogVHJhbnNsYXRpb25UeXBlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCwgZm9ybTogRm9ybVN0eWxlLFxuICAgIGV4dGVuZGVkOiBib29sZWFuKSB7XG4gIHN3aXRjaCAobmFtZSkge1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLk1vbnRoczpcbiAgICAgIHJldHVybiBnZXRMb2NhbGVNb250aE5hbWVzKGxvY2FsZSwgZm9ybSwgd2lkdGgpW2RhdGUuZ2V0TW9udGgoKV07XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuRGF5czpcbiAgICAgIHJldHVybiBnZXRMb2NhbGVEYXlOYW1lcyhsb2NhbGUsIGZvcm0sIHdpZHRoKVtkYXRlLmdldERheSgpXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzOlxuICAgICAgY29uc3QgY3VycmVudEhvdXJzID0gZGF0ZS5nZXRIb3VycygpO1xuICAgICAgY29uc3QgY3VycmVudE1pbnV0ZXMgPSBkYXRlLmdldE1pbnV0ZXMoKTtcbiAgICAgIGlmIChleHRlbmRlZCkge1xuICAgICAgICBjb25zdCBydWxlcyA9IGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMobG9jYWxlKTtcbiAgICAgICAgY29uc3QgZGF5UGVyaW9kcyA9IGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhsb2NhbGUsIGZvcm0sIHdpZHRoKTtcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgcnVsZXMuZm9yRWFjaCgocnVsZTogVGltZSB8IFtUaW1lLCBUaW1lXSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJ1bGUpKSB7XG4gICAgICAgICAgICAvLyBtb3JuaW5nLCBhZnRlcm5vb24sIGV2ZW5pbmcsIG5pZ2h0XG4gICAgICAgICAgICBjb25zdCB7aG91cnM6IGhvdXJzRnJvbSwgbWludXRlczogbWludXRlc0Zyb219ID0gcnVsZVswXTtcbiAgICAgICAgICAgIGNvbnN0IHtob3VyczogaG91cnNUbywgbWludXRlczogbWludXRlc1RvfSA9IHJ1bGVbMV07XG4gICAgICAgICAgICBpZiAoY3VycmVudEhvdXJzID49IGhvdXJzRnJvbSAmJiBjdXJyZW50TWludXRlcyA+PSBtaW51dGVzRnJvbSAmJlxuICAgICAgICAgICAgICAgIChjdXJyZW50SG91cnMgPCBob3Vyc1RvIHx8XG4gICAgICAgICAgICAgICAgIChjdXJyZW50SG91cnMgPT09IGhvdXJzVG8gJiYgY3VycmVudE1pbnV0ZXMgPCBtaW51dGVzVG8pKSkge1xuICAgICAgICAgICAgICByZXN1bHQgPSBkYXlQZXJpb2RzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgeyAgLy8gbm9vbiBvciBtaWRuaWdodFxuICAgICAgICAgICAgY29uc3Qge2hvdXJzLCBtaW51dGVzfSA9IHJ1bGU7XG4gICAgICAgICAgICBpZiAoaG91cnMgPT09IGN1cnJlbnRIb3VycyAmJiBtaW51dGVzID09PSBjdXJyZW50TWludXRlcykge1xuICAgICAgICAgICAgICByZXN1bHQgPSBkYXlQZXJpb2RzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWYgbm8gcnVsZXMgZm9yIHRoZSBkYXkgcGVyaW9kcywgd2UgdXNlIGFtL3BtIGJ5IGRlZmF1bHRcbiAgICAgIHJldHVybiBnZXRMb2NhbGVEYXlQZXJpb2RzKGxvY2FsZSwgZm9ybSwgPFRyYW5zbGF0aW9uV2lkdGg+d2lkdGgpW2N1cnJlbnRIb3VycyA8IDEyID8gMCA6IDFdO1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLkVyYXM6XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlRXJhTmFtZXMobG9jYWxlLCA8VHJhbnNsYXRpb25XaWR0aD53aWR0aClbZGF0ZS5nZXRGdWxsWWVhcigpIDw9IDAgPyAwIDogMV07XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIFRoaXMgZGVmYXVsdCBjYXNlIGlzIG5vdCBuZWVkZWQgYnkgVHlwZVNjcmlwdCBjb21waWxlciwgYXMgdGhlIHN3aXRjaCBpcyBleGhhdXN0aXZlLlxuICAgICAgLy8gSG93ZXZlciBDbG9zdXJlIENvbXBpbGVyIGRvZXMgbm90IHVuZGVyc3RhbmQgdGhhdCBhbmQgcmVwb3J0cyBhbiBlcnJvciBpbiB0eXBlZCBtb2RlLlxuICAgICAgLy8gVGhlIGB0aHJvdyBuZXcgRXJyb3JgIGJlbG93IHdvcmtzIGFyb3VuZCB0aGUgcHJvYmxlbSwgYW5kIHRoZSB1bmV4cGVjdGVkOiBuZXZlciB2YXJpYWJsZVxuICAgICAgLy8gbWFrZXMgc3VyZSB0c2Mgc3RpbGwgY2hlY2tzIHRoaXMgY29kZSBpcyB1bnJlYWNoYWJsZS5cbiAgICAgIGNvbnN0IHVuZXhwZWN0ZWQ6IG5ldmVyID0gbmFtZTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5leHBlY3RlZCB0cmFuc2xhdGlvbiB0eXBlICR7dW5leHBlY3RlZH1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHRyYW5zZm9ybXMgYSBkYXRlIGFuZCBhbiBvZmZzZXQgaW50byBhIHRpbWV6b25lIHdpdGggSVNPODYwMSBvclxuICogR01UIGZvcm1hdCBkZXBlbmRpbmcgb24gdGhlIHdpZHRoIChlZzogc2hvcnQgPSArMDQzMCwgc2hvcnQ6R01UID0gR01UKzQsIGxvbmcgPSBHTVQrMDQ6MzAsXG4gKiBleHRlbmRlZCA9ICswNDozMClcbiAqL1xuZnVuY3Rpb24gdGltZVpvbmVHZXR0ZXIod2lkdGg6IFpvbmVXaWR0aCk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24oZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKSB7XG4gICAgY29uc3Qgem9uZSA9IC0xICogb2Zmc2V0O1xuICAgIGNvbnN0IG1pbnVzU2lnbiA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pO1xuICAgIGNvbnN0IGhvdXJzID0gem9uZSA+IDAgPyBNYXRoLmZsb29yKHpvbmUgLyA2MCkgOiBNYXRoLmNlaWwoem9uZSAvIDYwKTtcbiAgICBzd2l0Y2ggKHdpZHRoKSB7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5TaG9ydDpcbiAgICAgICAgcmV0dXJuICgoem9uZSA+PSAwKSA/ICcrJyA6ICcnKSArIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArXG4gICAgICAgICAgICBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMiwgbWludXNTaWduKTtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLlNob3J0R01UOlxuICAgICAgICByZXR1cm4gJ0dNVCcgKyAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDEsIG1pbnVzU2lnbik7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5Mb25nOlxuICAgICAgICByZXR1cm4gJ0dNVCcgKyAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDIsIG1pbnVzU2lnbikgKyAnOicgK1xuICAgICAgICAgICAgcGFkTnVtYmVyKE1hdGguYWJzKHpvbmUgJSA2MCksIDIsIG1pbnVzU2lnbik7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5FeHRlbmRlZDpcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAnWic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICgoem9uZSA+PSAwKSA/ICcrJyA6ICcnKSArIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArICc6JyArXG4gICAgICAgICAgICAgIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyLCBtaW51c1NpZ24pO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gem9uZSB3aWR0aCBcIiR7d2lkdGh9XCJgKTtcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IEpBTlVBUlkgPSAwO1xuY29uc3QgVEhVUlNEQVkgPSA0O1xuZnVuY3Rpb24gZ2V0Rmlyc3RUaHVyc2RheU9mWWVhcih5ZWFyOiBudW1iZXIpIHtcbiAgY29uc3QgZmlyc3REYXlPZlllYXIgPSAobmV3IERhdGUoeWVhciwgSkFOVUFSWSwgMSkpLmdldERheSgpO1xuICByZXR1cm4gbmV3IERhdGUoXG4gICAgICB5ZWFyLCAwLCAxICsgKChmaXJzdERheU9mWWVhciA8PSBUSFVSU0RBWSkgPyBUSFVSU0RBWSA6IFRIVVJTREFZICsgNykgLSBmaXJzdERheU9mWWVhcik7XG59XG5cbmZ1bmN0aW9uIGdldFRodXJzZGF5VGhpc1dlZWsoZGF0ZXRpbWU6IERhdGUpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKFxuICAgICAgZGF0ZXRpbWUuZ2V0RnVsbFllYXIoKSwgZGF0ZXRpbWUuZ2V0TW9udGgoKSxcbiAgICAgIGRhdGV0aW1lLmdldERhdGUoKSArIChUSFVSU0RBWSAtIGRhdGV0aW1lLmdldERheSgpKSk7XG59XG5cbmZ1bmN0aW9uIHdlZWtHZXR0ZXIoc2l6ZTogbnVtYmVyLCBtb250aEJhc2VkID0gZmFsc2UpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAobW9udGhCYXNlZCkge1xuICAgICAgY29uc3QgbmJEYXlzQmVmb3JlMXN0RGF5T2ZNb250aCA9XG4gICAgICAgICAgbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpLmdldERheSgpIC0gMTtcbiAgICAgIGNvbnN0IHRvZGF5ID0gZGF0ZS5nZXREYXRlKCk7XG4gICAgICByZXN1bHQgPSAxICsgTWF0aC5mbG9vcigodG9kYXkgKyBuYkRheXNCZWZvcmUxc3REYXlPZk1vbnRoKSAvIDcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmaXJzdFRodXJzID0gZ2V0Rmlyc3RUaHVyc2RheU9mWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgY29uc3QgdGhpc1RodXJzID0gZ2V0VGh1cnNkYXlUaGlzV2VlayhkYXRlKTtcbiAgICAgIGNvbnN0IGRpZmYgPSB0aGlzVGh1cnMuZ2V0VGltZSgpIC0gZmlyc3RUaHVycy5nZXRUaW1lKCk7XG4gICAgICByZXN1bHQgPSAxICsgTWF0aC5yb3VuZChkaWZmIC8gNi4wNDhlOCk7ICAvLyA2LjA0OGU4IG1zIHBlciB3ZWVrXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhZE51bWJlcihyZXN1bHQsIHNpemUsIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pKTtcbiAgfTtcbn1cblxudHlwZSBEYXRlRm9ybWF0dGVyID0gKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBvZmZzZXQ/OiBudW1iZXIpID0+IHN0cmluZztcblxuY29uc3QgREFURV9GT1JNQVRTOiB7W2Zvcm1hdDogc3RyaW5nXTogRGF0ZUZvcm1hdHRlcn0gPSB7fTtcblxuLy8gQmFzZWQgb24gQ0xEUiBmb3JtYXRzOlxuLy8gU2VlIGNvbXBsZXRlIGxpc3Q6IGh0dHA6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0ZpZWxkX1N5bWJvbF9UYWJsZVxuLy8gU2VlIGFsc28gZXhwbGFuYXRpb25zOiBodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9kYXRlLXRpbWVcbi8vIFRPRE8ob2NvbWJlKTogc3VwcG9ydCBhbGwgbWlzc2luZyBjbGRyIGZvcm1hdHM6IFksIFUsIFEsIEQsIEYsIGUsIGMsIGosIEosIEMsIEEsIHYsIFYsIFgsIHhcbmZ1bmN0aW9uIGdldERhdGVGb3JtYXR0ZXIoZm9ybWF0OiBzdHJpbmcpOiBEYXRlRm9ybWF0dGVyfG51bGwge1xuICBpZiAoREFURV9GT1JNQVRTW2Zvcm1hdF0pIHtcbiAgICByZXR1cm4gREFURV9GT1JNQVRTW2Zvcm1hdF07XG4gIH1cbiAgbGV0IGZvcm1hdHRlcjtcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAvLyBFcmEgbmFtZSAoQUQvQkMpXG4gICAgY2FzZSAnRyc6XG4gICAgY2FzZSAnR0cnOlxuICAgIGNhc2UgJ0dHRyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5FcmFzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dHR0cnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRXJhcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dHR0dHJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkVyYXMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gMSBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgZS5nLiAoQUQgMSA9PiAxLCBBRCAxOTkgPT4gMTk5KVxuICAgIGNhc2UgJ3knOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMSwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gMiBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgcGFkZGVkICgwMC05OSkuIChlLmcuIEFEIDIwMDEgPT4gMDEsIEFEIDIwMTAgPT4gMTApXG4gICAgY2FzZSAneXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMiwgMCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyAzIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyLCBwYWRkZWQgKDAwMC05OTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRCAyMDEwID0+IDEwKVxuICAgIGNhc2UgJ3l5eSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZ1bGxZZWFyLCAzLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyA0IGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyIChlLmcuIEFEIDEgPT4gMDAwMSwgQUQgMjAxMCA9PiAyMDEwKVxuICAgIGNhc2UgJ3l5eXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgNCwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoMS0xMiksIG51bWVyaWNcbiAgICBjYXNlICdNJzpcbiAgICBjYXNlICdMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTW9udGgsIDEsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTU0nOlxuICAgIGNhc2UgJ0xMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTW9udGgsIDIsIDEpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoSmFudWFyeSwgLi4uKSwgc3RyaW5nLCBmb3JtYXRcbiAgICBjYXNlICdNTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTU1NTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIE1vbnRoIG9mIHRoZSB5ZWFyIChKYW51YXJ5LCAuLi4pLCBzdHJpbmcsIHN0YW5kYWxvbmVcbiAgICBjYXNlICdMTEwnOlxuICAgICAgZm9ybWF0dGVyID1cbiAgICAgICAgICBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xMTEwnOlxuICAgICAgZm9ybWF0dGVyID1cbiAgICAgICAgICBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSwgRm9ybVN0eWxlLlN0YW5kYWxvbmUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTExMTEwnOlxuICAgICAgZm9ybWF0dGVyID1cbiAgICAgICAgICBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFdlZWsgb2YgdGhlIHllYXIgKDEsIC4uLiA1MilcbiAgICBjYXNlICd3JzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtHZXR0ZXIoMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3dyc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrR2V0dGVyKDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBXZWVrIG9mIHRoZSBtb250aCAoMSwgLi4uKVxuICAgIGNhc2UgJ1cnOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla0dldHRlcigxLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRGF5IG9mIHRoZSBtb250aCAoMS0zMSlcbiAgICBjYXNlICdkJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRGF0ZSwgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkRhdGUsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBEYXkgb2YgdGhlIFdlZWtcbiAgICBjYXNlICdFJzpcbiAgICBjYXNlICdFRSc6XG4gICAgY2FzZSAnRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRUVFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRUVFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRUVFRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBHZW5lcmljIHBlcmlvZCBvZiB0aGUgZGF5IChhbS1wbSlcbiAgICBjYXNlICdhJzpcbiAgICBjYXNlICdhYSc6XG4gICAgY2FzZSAnYWFhJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWFhYSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWFhYWEnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBFeHRlbmRlZCBwZXJpb2Qgb2YgdGhlIGRheSAobWlkbmlnaHQsIGF0IG5pZ2h0LCAuLi4pLCBzdGFuZGFsb25lXG4gICAgY2FzZSAnYic6XG4gICAgY2FzZSAnYmInOlxuICAgIGNhc2UgJ2JiYic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSwgRm9ybVN0eWxlLlN0YW5kYWxvbmUsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmJiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3csIEZvcm1TdHlsZS5TdGFuZGFsb25lLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRXh0ZW5kZWQgcGVyaW9kIG9mIHRoZSBkYXkgKG1pZG5pZ2h0LCBuaWdodCwgLi4uKSwgc3RhbmRhbG9uZVxuICAgIGNhc2UgJ0InOlxuICAgIGNhc2UgJ0JCJzpcbiAgICBjYXNlICdCQkInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCwgRm9ybVN0eWxlLkZvcm1hdCwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdCQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlLCBGb3JtU3R5bGUuRm9ybWF0LCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0JCQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LCBGb3JtU3R5bGUuRm9ybWF0LCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gSG91ciBpbiBBTS9QTSwgKDEtMTIpXG4gICAgY2FzZSAnaCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAxLCAtMTIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaGgnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMiwgLTEyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gSG91ciBvZiB0aGUgZGF5ICgwLTIzKVxuICAgIGNhc2UgJ0gnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMSk7XG4gICAgICBicmVhaztcbiAgICAvLyBIb3VyIGluIGRheSwgcGFkZGVkICgwMC0yMylcbiAgICBjYXNlICdISCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTWludXRlIG9mIHRoZSBob3VyICgwLTU5KVxuICAgIGNhc2UgJ20nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5NaW51dGVzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21tJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTWludXRlcywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIFNlY29uZCBvZiB0aGUgbWludXRlICgwLTU5KVxuICAgIGNhc2UgJ3MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5TZWNvbmRzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NzJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuU2Vjb25kcywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIEZyYWN0aW9uYWwgc2Vjb25kXG4gICAgY2FzZSAnUyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1NTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1NTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDMpO1xuICAgICAgYnJlYWs7XG5cblxuICAgIC8vIFRpbWV6b25lIElTTzg2MDEgc2hvcnQgZm9ybWF0ICgtMDQzMClcbiAgICBjYXNlICdaJzpcbiAgICBjYXNlICdaWic6XG4gICAgY2FzZSAnWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICAvLyBUaW1lem9uZSBJU084NjAxIGV4dGVuZGVkIGZvcm1hdCAoLTA0OjMwKVxuICAgIGNhc2UgJ1paWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5FeHRlbmRlZCk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFRpbWV6b25lIEdNVCBzaG9ydCBmb3JtYXQgKEdNVCs0KVxuICAgIGNhc2UgJ08nOlxuICAgIGNhc2UgJ09PJzpcbiAgICBjYXNlICdPT08nOlxuICAgIC8vIFNob3VsZCBiZSBsb2NhdGlvbiwgYnV0IGZhbGxiYWNrIHRvIGZvcm1hdCBPIGluc3RlYWQgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRoZSBkYXRhIHlldFxuICAgIGNhc2UgJ3onOlxuICAgIGNhc2UgJ3p6JzpcbiAgICBjYXNlICd6enonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLlNob3J0R01UKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRpbWV6b25lIEdNVCBsb25nIGZvcm1hdCAoR01UKzA0MzApXG4gICAgY2FzZSAnT09PTyc6XG4gICAgY2FzZSAnWlpaWic6XG4gICAgLy8gU2hvdWxkIGJlIGxvY2F0aW9uLCBidXQgZmFsbGJhY2sgdG8gZm9ybWF0IE8gaW5zdGVhZCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGRhdGEgeWV0XG4gICAgY2FzZSAnenp6eic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgREFURV9GT1JNQVRTW2Zvcm1hdF0gPSBmb3JtYXR0ZXI7XG4gIHJldHVybiBmb3JtYXR0ZXI7XG59XG5cbmZ1bmN0aW9uIHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmU6IHN0cmluZywgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gIC8vIFN1cHBvcnQ6IElFIDktMTEgb25seSwgRWRnZSAxMy0xNStcbiAgLy8gSUUvRWRnZSBkbyBub3QgXCJ1bmRlcnN0YW5kXCIgY29sb24gKGA6YCkgaW4gdGltZXpvbmVcbiAgdGltZXpvbmUgPSB0aW1lem9uZS5yZXBsYWNlKC86L2csICcnKTtcbiAgY29uc3QgcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQgPSBEYXRlLnBhcnNlKCdKYW4gMDEsIDE5NzAgMDA6MDA6MDAgJyArIHRpbWV6b25lKSAvIDYwMDAwO1xuICByZXR1cm4gaXNOYU4ocmVxdWVzdGVkVGltZXpvbmVPZmZzZXQpID8gZmFsbGJhY2sgOiByZXF1ZXN0ZWRUaW1lem9uZU9mZnNldDtcbn1cblxuZnVuY3Rpb24gYWRkRGF0ZU1pbnV0ZXMoZGF0ZTogRGF0ZSwgbWludXRlczogbnVtYmVyKSB7XG4gIGRhdGUgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XG4gIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSArIG1pbnV0ZXMpO1xuICByZXR1cm4gZGF0ZTtcbn1cblxuZnVuY3Rpb24gY29udmVydFRpbWV6b25lVG9Mb2NhbChkYXRlOiBEYXRlLCB0aW1lem9uZTogc3RyaW5nLCByZXZlcnNlOiBib29sZWFuKTogRGF0ZSB7XG4gIGNvbnN0IHJldmVyc2VWYWx1ZSA9IHJldmVyc2UgPyAtMSA6IDE7XG4gIGNvbnN0IGRhdGVUaW1lem9uZU9mZnNldCA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgY29uc3QgdGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lLCBkYXRlVGltZXpvbmVPZmZzZXQpO1xuICByZXR1cm4gYWRkRGF0ZU1pbnV0ZXMoZGF0ZSwgcmV2ZXJzZVZhbHVlICogKHRpbWV6b25lT2Zmc2V0IC0gZGF0ZVRpbWV6b25lT2Zmc2V0KSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSB2YWx1ZSB0byBkYXRlLlxuICpcbiAqIFN1cHBvcnRlZCBpbnB1dCBmb3JtYXRzOlxuICogLSBgRGF0ZWBcbiAqIC0gbnVtYmVyOiB0aW1lc3RhbXBcbiAqIC0gc3RyaW5nOiBudW1lcmljIChlLmcuIFwiMTIzNFwiKSwgSVNPIGFuZCBkYXRlIHN0cmluZ3MgaW4gYSBmb3JtYXQgc3VwcG9ydGVkIGJ5XG4gKiAgIFtEYXRlLnBhcnNlKCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0RhdGUvcGFyc2UpLlxuICogICBOb3RlOiBJU08gc3RyaW5ncyB3aXRob3V0IHRpbWUgcmV0dXJuIGEgZGF0ZSB3aXRob3V0IHRpbWVvZmZzZXQuXG4gKlxuICogVGhyb3dzIGlmIHVuYWJsZSB0byBjb252ZXJ0IHRvIGEgZGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvRGF0ZSh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSk6IERhdGUge1xuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSkpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodmFsdWUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKTtcblxuICAgIGNvbnN0IHBhcnNlZE5iID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG5cbiAgICAvLyBhbnkgc3RyaW5nIHRoYXQgb25seSBjb250YWlucyBudW1iZXJzLCBsaWtlIFwiMTIzNFwiIGJ1dCBub3QgbGlrZSBcIjEyMzRoZWxsb1wiXG4gICAgaWYgKCFpc05hTih2YWx1ZSBhcyBhbnkgLSBwYXJzZWROYikpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJzZWROYik7XG4gICAgfVxuXG4gICAgaWYgKC9eKFxcZHs0fS1cXGR7MSwyfS1cXGR7MSwyfSkkLy50ZXN0KHZhbHVlKSkge1xuICAgICAgLyogRm9yIElTTyBTdHJpbmdzIHdpdGhvdXQgdGltZSB0aGUgZGF5LCBtb250aCBhbmQgeWVhciBtdXN0IGJlIGV4dHJhY3RlZCBmcm9tIHRoZSBJU08gU3RyaW5nXG4gICAgICBiZWZvcmUgRGF0ZSBjcmVhdGlvbiB0byBhdm9pZCB0aW1lIG9mZnNldCBhbmQgZXJyb3JzIGluIHRoZSBuZXcgRGF0ZS5cbiAgICAgIElmIHdlIG9ubHkgcmVwbGFjZSAnLScgd2l0aCAnLCcgaW4gdGhlIElTTyBTdHJpbmcgKFwiMjAxNSwwMSwwMVwiKSwgYW5kIHRyeSB0byBjcmVhdGUgYSBuZXdcbiAgICAgIGRhdGUsIHNvbWUgYnJvd3NlcnMgKGUuZy4gSUUgOSkgd2lsbCB0aHJvdyBhbiBpbnZhbGlkIERhdGUgZXJyb3IuXG4gICAgICBJZiB3ZSBsZWF2ZSB0aGUgJy0nIChcIjIwMTUtMDEtMDFcIikgYW5kIHRyeSB0byBjcmVhdGUgYSBuZXcgRGF0ZShcIjIwMTUtMDEtMDFcIikgdGhlIHRpbWVvZmZzZXRcbiAgICAgIGlzIGFwcGxpZWQuXG4gICAgICBOb3RlOiBJU08gbW9udGhzIGFyZSAwIGZvciBKYW51YXJ5LCAxIGZvciBGZWJydWFyeSwgLi4uICovXG4gICAgICBjb25zdCBbeSwgbSwgZF0gPSB2YWx1ZS5zcGxpdCgnLScpLm1hcCgodmFsOiBzdHJpbmcpID0+ICt2YWwpO1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHksIG0gLSAxLCBkKTtcbiAgICB9XG5cbiAgICBsZXQgbWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXl8bnVsbDtcbiAgICBpZiAobWF0Y2ggPSB2YWx1ZS5tYXRjaChJU084NjAxX0RBVEVfUkVHRVgpKSB7XG4gICAgICByZXR1cm4gaXNvU3RyaW5nVG9EYXRlKG1hdGNoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUgYXMgYW55KTtcbiAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjb252ZXJ0IFwiJHt2YWx1ZX1cIiBpbnRvIGEgZGF0ZWApO1xuICB9XG4gIHJldHVybiBkYXRlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZGF0ZSBpbiBJU084NjAxIHRvIGEgRGF0ZS5cbiAqIFVzZWQgaW5zdGVhZCBvZiBgRGF0ZS5wYXJzZWAgYmVjYXVzZSBvZiBicm93c2VyIGRpc2NyZXBhbmNpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc29TdHJpbmdUb0RhdGUobWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXkpOiBEYXRlIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKDApO1xuICBsZXQgdHpIb3VyID0gMDtcbiAgbGV0IHR6TWluID0gMDtcblxuICAvLyBtYXRjaFs4XSBtZWFucyB0aGF0IHRoZSBzdHJpbmcgY29udGFpbnMgXCJaXCIgKFVUQykgb3IgYSB0aW1lem9uZSBsaWtlIFwiKzAxOjAwXCIgb3IgXCIrMDEwMFwiXG4gIGNvbnN0IGRhdGVTZXR0ZXIgPSBtYXRjaFs4XSA/IGRhdGUuc2V0VVRDRnVsbFllYXIgOiBkYXRlLnNldEZ1bGxZZWFyO1xuICBjb25zdCB0aW1lU2V0dGVyID0gbWF0Y2hbOF0gPyBkYXRlLnNldFVUQ0hvdXJzIDogZGF0ZS5zZXRIb3VycztcblxuICAvLyBpZiB0aGVyZSBpcyBhIHRpbWV6b25lIGRlZmluZWQgbGlrZSBcIiswMTowMFwiIG9yIFwiKzAxMDBcIlxuICBpZiAobWF0Y2hbOV0pIHtcbiAgICB0ekhvdXIgPSBOdW1iZXIobWF0Y2hbOV0gKyBtYXRjaFsxMF0pO1xuICAgIHR6TWluID0gTnVtYmVyKG1hdGNoWzldICsgbWF0Y2hbMTFdKTtcbiAgfVxuICBkYXRlU2V0dGVyLmNhbGwoZGF0ZSwgTnVtYmVyKG1hdGNoWzFdKSwgTnVtYmVyKG1hdGNoWzJdKSAtIDEsIE51bWJlcihtYXRjaFszXSkpO1xuICBjb25zdCBoID0gTnVtYmVyKG1hdGNoWzRdIHx8IDApIC0gdHpIb3VyO1xuICBjb25zdCBtID0gTnVtYmVyKG1hdGNoWzVdIHx8IDApIC0gdHpNaW47XG4gIGNvbnN0IHMgPSBOdW1iZXIobWF0Y2hbNl0gfHwgMCk7XG4gIGNvbnN0IG1zID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCcwLicgKyAobWF0Y2hbN10gfHwgMCkpICogMTAwMCk7XG4gIHRpbWVTZXR0ZXIuY2FsbChkYXRlLCBoLCBtLCBzLCBtcyk7XG4gIHJldHVybiBkYXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBEYXRlIHtcbiAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4odmFsdWUudmFsdWVPZigpKTtcbn1cbiJdfQ==