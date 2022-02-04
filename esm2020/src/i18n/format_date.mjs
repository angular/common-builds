/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FormatWidth, FormStyle, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat, NumberSymbol, TranslationWidth } from './locale_data_api';
export const ISO8601_DATE_REGEX = /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
const NAMED_FORMATS = {};
const DATE_FORMATS_SPLIT = /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
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
 * @param value The date to format, as a Date, or a number (milliseconds since UTC epoch)
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
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n-overview)
 *
 * @publicApi
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
        text += dateFormatter ? dateFormatter(date, locale, dateTimezoneOffset) :
            value === '\'\'' ? '\'' :
                value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
    });
    return text;
}
/**
 * Create a new Date object with the given date value, and the time set to midnight.
 *
 * We cannot use `new Date(year, month, date)` because it maps years between 0 and 99 to 1900-1999.
 * See: https://github.com/angular/angular/issues/40377
 *
 * Note that this function returns a Date object whose time is midnight in the current locale's
 * timezone. In the future we might want to change this to be midnight in UTC, but this would be a
 * considerable breaking change.
 */
function createDate(year, month, date) {
    // The `newDate` is set to midnight (UTC) on January 1st 1970.
    // - In PST this will be December 31st 1969 at 4pm.
    // - In GMT this will be January 1st 1970 at 1am.
    // Note that they even have different years, dates and months!
    const newDate = new Date(0);
    // `setFullYear()` allows years like 0001 to be set correctly. This function does not
    // change the internal time of the date.
    // Consider calling `setFullYear(2019, 8, 20)` (September 20, 2019).
    // - In PST this will now be September 20, 2019 at 4pm
    // - In GMT this will now be September 20, 2019 at 1am
    newDate.setFullYear(year, month, date);
    // We want the final date to be at local midnight, so we reset the time.
    // - In PST this will now be September 20, 2019 at 12am
    // - In GMT this will now be September 20, 2019 at 12am
    newDate.setHours(0, 0, 0);
    return newDate;
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
function formatFractionalSeconds(milliseconds, digits) {
    const strMs = padNumber(milliseconds, 3);
    return strMs.substr(0, digits);
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
            return formatFractionalSeconds(part, size);
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
                const index = rules.findIndex(rule => {
                    if (Array.isArray(rule)) {
                        // morning, afternoon, evening, night
                        const [from, to] = rule;
                        const afterFrom = currentHours >= from.hours && currentMinutes >= from.minutes;
                        const beforeTo = (currentHours < to.hours ||
                            (currentHours === to.hours && currentMinutes < to.minutes));
                        // We must account for normal rules that span a period during the day (e.g. 6am-9am)
                        // where `from` is less (earlier) than `to`. But also rules that span midnight (e.g.
                        // 10pm - 5am) where `from` is greater (later!) than `to`.
                        //
                        // In the first case the current time must be BOTH after `from` AND before `to`
                        // (e.g. 8am is after 6am AND before 10am).
                        //
                        // In the second case the current time must be EITHER after `from` OR before `to`
                        // (e.g. 4am is before 5am but not after 10pm; and 11pm is not before 5am but it is
                        // after 10pm).
                        if (from.hours < to.hours) {
                            if (afterFrom && beforeTo) {
                                return true;
                            }
                        }
                        else if (afterFrom || beforeTo) {
                            return true;
                        }
                    }
                    else { // noon or midnight
                        if (rule.hours === currentHours && rule.minutes === currentMinutes) {
                            return true;
                        }
                    }
                    return false;
                });
                if (index !== -1) {
                    return dayPeriods[index];
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
    const firstDayOfYear = createDate(year, JANUARY, 1).getDay();
    return createDate(year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
function getThursdayThisWeek(datetime) {
    return createDate(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (THURSDAY - datetime.getDay()));
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
            const thisThurs = getThursdayThisWeek(date);
            // Some days of a year are part of next year according to ISO 8601.
            // Compute the firstThurs from the year of this week's Thursday
            const firstThurs = getFirstThursdayOfYear(thisThurs.getFullYear());
            const diff = thisThurs.getTime() - firstThurs.getTime();
            result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
        }
        return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    };
}
/**
 * Returns a date formatter that provides the week-numbering year for the input date.
 */
function weekNumberingYearGetter(size, trim = false) {
    return function (date, locale) {
        const thisThurs = getThursdayThisWeek(date);
        const weekNumberingYear = thisThurs.getFullYear();
        return padNumber(weekNumberingYear, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim);
    };
}
const DATE_FORMATS = {};
// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: U, Q, D, F, e, j, J, C, A, v, V, X, x
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
        // 1 digit representation of the week-numbering year, e.g. (AD 1 => 1, AD 199 => 199)
        case 'Y':
            formatter = weekNumberingYearGetter(1);
            break;
        // 2 digit representation of the week-numbering year, padded (00-99). (e.g. AD 2001 => 01, AD
        // 2010 => 10)
        case 'YY':
            formatter = weekNumberingYearGetter(2, true);
            break;
        // 3 digit representation of the week-numbering year, padded (000-999). (e.g. AD 1 => 001, AD
        // 2010 => 2010)
        case 'YYY':
            formatter = weekNumberingYearGetter(3);
            break;
        // 4 digit representation of the week-numbering year (e.g. AD 1 => 0001, AD 2010 => 2010)
        case 'YYYY':
            formatter = weekNumberingYearGetter(4);
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
        // Day of the Week StandAlone (1, 1, Mon, Monday, M, Mo)
        case 'c':
        case 'cc':
            formatter = dateGetter(DateType.Day, 1);
            break;
        case 'ccc':
            formatter =
                dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'cccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'ccccc':
            formatter =
                dateStrGetter(TranslationType.Days, TranslationWidth.Narrow, FormStyle.Standalone);
            break;
        case 'cccccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short, FormStyle.Standalone);
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
    // Support: IE 11 only, Edge 13-15+
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
        if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(value)) {
            /* For ISO Strings without time the day, month and year must be extracted from the ISO String
            before Date creation to avoid time offset and errors in the new Date.
            If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
            date, some browsers (e.g. IE 9) will throw an invalid Date error.
            If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
            is applied.
            Note: ISO months are 0 for January, 1 for February, ... */
            const [y, m = 1, d = 1] = value.split('-').map((val) => +val);
            return createDate(y, m - 1, d);
        }
        const parsedNb = parseFloat(value);
        // any string that only contains numbers, like "1234" but not like "1234hello"
        if (!isNaN(value - parsedNb)) {
            return new Date(parsedNb);
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
    // The ECMAScript specification (https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.11)
    // defines that `DateTime` milliseconds should always be rounded down, so that `999.9ms`
    // becomes `999ms`.
    const ms = Math.floor(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
}
export function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X2RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2kxOG4vZm9ybWF0X2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsNEJBQTRCLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBUSxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRTlVLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUMzQix1R0FBdUcsQ0FBQztBQUM1RyxnR0FBZ0c7QUFDaEcsTUFBTSxhQUFhLEdBQXFELEVBQUUsQ0FBQztBQUMzRSxNQUFNLGtCQUFrQixHQUNwQixtTkFBbU4sQ0FBQztBQUV4TixJQUFLLFNBS0o7QUFMRCxXQUFLLFNBQVM7SUFDWiwyQ0FBSyxDQUFBO0lBQ0wsaURBQVEsQ0FBQTtJQUNSLHlDQUFJLENBQUE7SUFDSixpREFBUSxDQUFBO0FBQ1YsQ0FBQyxFQUxJLFNBQVMsS0FBVCxTQUFTLFFBS2I7QUFFRCxJQUFLLFFBU0o7QUFURCxXQUFLLFFBQVE7SUFDWCwrQ0FBUSxDQUFBO0lBQ1IseUNBQUssQ0FBQTtJQUNMLHVDQUFJLENBQUE7SUFDSix5Q0FBSyxDQUFBO0lBQ0wsNkNBQU8sQ0FBQTtJQUNQLDZDQUFPLENBQUE7SUFDUCxpRUFBaUIsQ0FBQTtJQUNqQixxQ0FBRyxDQUFBO0FBQ0wsQ0FBQyxFQVRJLFFBQVEsS0FBUixRQUFRLFFBU1o7QUFFRCxJQUFLLGVBS0o7QUFMRCxXQUFLLGVBQWU7SUFDbEIsaUVBQVUsQ0FBQTtJQUNWLHFEQUFJLENBQUE7SUFDSix5REFBTSxDQUFB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ZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9ybWF0V2lkdGgsIEZvcm1TdHlsZSwgZ2V0TG9jYWxlRGF0ZUZvcm1hdCwgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQsIGdldExvY2FsZURheU5hbWVzLCBnZXRMb2NhbGVEYXlQZXJpb2RzLCBnZXRMb2NhbGVFcmFOYW1lcywgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcywgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzLCBnZXRMb2NhbGVJZCwgZ2V0TG9jYWxlTW9udGhOYW1lcywgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sLCBnZXRMb2NhbGVUaW1lRm9ybWF0LCBOdW1iZXJTeW1ib2wsIFRpbWUsIFRyYW5zbGF0aW9uV2lkdGh9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuZXhwb3J0IGNvbnN0IElTTzg2MDFfREFURV9SRUdFWCA9XG4gICAgL14oXFxkezQsfSktPyhcXGRcXGQpLT8oXFxkXFxkKSg/OlQoXFxkXFxkKSg/Ojo/KFxcZFxcZCkoPzo6PyhcXGRcXGQpKD86XFwuKFxcZCspKT8pPyk/KFp8KFsrLV0pKFxcZFxcZCk6PyhcXGRcXGQpKT8pPyQvO1xuLy8gICAgMSAgICAgICAgMiAgICAgICAzICAgICAgICAgNCAgICAgICAgICA1ICAgICAgICAgIDYgICAgICAgICAgNyAgICAgICAgICA4ICA5ICAgICAxMCAgICAgIDExXG5jb25zdCBOQU1FRF9GT1JNQVRTOiB7W2xvY2FsZUlkOiBzdHJpbmddOiB7W2Zvcm1hdDogc3RyaW5nXTogc3RyaW5nfX0gPSB7fTtcbmNvbnN0IERBVEVfRk9STUFUU19TUExJVCA9XG4gICAgLygoPzpbXkJFR0hMTU9TV1laYWJjZGhtc3d5eiddKyl8KD86Jyg/OlteJ118JycpKicpfCg/Okd7MSw1fXx5ezEsNH18WXsxLDR9fE17MSw1fXxMezEsNX18d3sxLDJ9fFd7MX18ZHsxLDJ9fEV7MSw2fXxjezEsNn18YXsxLDV9fGJ7MSw1fXxCezEsNX18aHsxLDJ9fEh7MSwyfXxtezEsMn18c3sxLDJ9fFN7MSwzfXx6ezEsNH18WnsxLDV9fE97MSw0fSkpKFtcXHNcXFNdKikvO1xuXG5lbnVtIFpvbmVXaWR0aCB7XG4gIFNob3J0LFxuICBTaG9ydEdNVCxcbiAgTG9uZyxcbiAgRXh0ZW5kZWRcbn1cblxuZW51bSBEYXRlVHlwZSB7XG4gIEZ1bGxZZWFyLFxuICBNb250aCxcbiAgRGF0ZSxcbiAgSG91cnMsXG4gIE1pbnV0ZXMsXG4gIFNlY29uZHMsXG4gIEZyYWN0aW9uYWxTZWNvbmRzLFxuICBEYXlcbn1cblxuZW51bSBUcmFuc2xhdGlvblR5cGUge1xuICBEYXlQZXJpb2RzLFxuICBEYXlzLFxuICBNb250aHMsXG4gIEVyYXNcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgZGF0ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0ZSB0byBmb3JtYXQsIGFzIGEgRGF0ZSwgb3IgYSBudW1iZXIgKG1pbGxpc2Vjb25kcyBzaW5jZSBVVEMgZXBvY2gpXG4gKiBvciBhbiBbSVNPIGRhdGUtdGltZSBzdHJpbmddKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9OT1RFLWRhdGV0aW1lKS5cbiAqIEBwYXJhbSBmb3JtYXQgVGhlIGRhdGUtdGltZSBjb21wb25lbnRzIHRvIGluY2x1ZGUuIFNlZSBgRGF0ZVBpcGVgIGZvciBkZXRhaWxzLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gdGltZXpvbmUgVGhlIHRpbWUgem9uZS4gQSB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gR01UIChzdWNoIGFzIGAnKzA0MzAnYCksXG4gKiBvciBhIHN0YW5kYXJkIFVUQy9HTVQgb3IgY29udGluZW50YWwgVVMgdGltZSB6b25lIGFiYnJldmlhdGlvbi5cbiAqIElmIG5vdCBzcGVjaWZpZWQsIHVzZXMgaG9zdCBzeXN0ZW0gc2V0dGluZ3MuXG4gKlxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBkYXRlIHN0cmluZy5cbiAqXG4gKiBAc2VlIGBEYXRlUGlwZWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4tb3ZlcnZpZXcpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZShcbiAgICB2YWx1ZTogc3RyaW5nfG51bWJlcnxEYXRlLCBmb3JtYXQ6IHN0cmluZywgbG9jYWxlOiBzdHJpbmcsIHRpbWV6b25lPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGRhdGUgPSB0b0RhdGUodmFsdWUpO1xuICBjb25zdCBuYW1lZEZvcm1hdCA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgZm9ybWF0KTtcbiAgZm9ybWF0ID0gbmFtZWRGb3JtYXQgfHwgZm9ybWF0O1xuXG4gIGxldCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAoZm9ybWF0KSB7XG4gICAgbWF0Y2ggPSBEQVRFX0ZPUk1BVFNfU1BMSVQuZXhlYyhmb3JtYXQpO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgcGFydHMgPSBwYXJ0cy5jb25jYXQobWF0Y2guc2xpY2UoMSkpO1xuICAgICAgY29uc3QgcGFydCA9IHBhcnRzLnBvcCgpO1xuICAgICAgaWYgKCFwYXJ0KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZm9ybWF0ID0gcGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMucHVzaChmb3JtYXQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgbGV0IGRhdGVUaW1lem9uZU9mZnNldCA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgaWYgKHRpbWV6b25lKSB7XG4gICAgZGF0ZVRpbWV6b25lT2Zmc2V0ID0gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZSwgZGF0ZVRpbWV6b25lT2Zmc2V0KTtcbiAgICBkYXRlID0gY29udmVydFRpbWV6b25lVG9Mb2NhbChkYXRlLCB0aW1lem9uZSwgdHJ1ZSk7XG4gIH1cblxuICBsZXQgdGV4dCA9ICcnO1xuICBwYXJ0cy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICBjb25zdCBkYXRlRm9ybWF0dGVyID0gZ2V0RGF0ZUZvcm1hdHRlcih2YWx1ZSk7XG4gICAgdGV4dCArPSBkYXRlRm9ybWF0dGVyID8gZGF0ZUZvcm1hdHRlcihkYXRlLCBsb2NhbGUsIGRhdGVUaW1lem9uZU9mZnNldCkgOlxuICAgICAgICB2YWx1ZSA9PT0gJ1xcJ1xcJycgID8gJ1xcJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnJlcGxhY2UoLyheJ3wnJCkvZywgJycpLnJlcGxhY2UoLycnL2csICdcXCcnKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IERhdGUgb2JqZWN0IHdpdGggdGhlIGdpdmVuIGRhdGUgdmFsdWUsIGFuZCB0aGUgdGltZSBzZXQgdG8gbWlkbmlnaHQuXG4gKlxuICogV2UgY2Fubm90IHVzZSBgbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpYCBiZWNhdXNlIGl0IG1hcHMgeWVhcnMgYmV0d2VlbiAwIGFuZCA5OSB0byAxOTAwLTE5OTkuXG4gKiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzQwMzc3XG4gKlxuICogTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIERhdGUgb2JqZWN0IHdob3NlIHRpbWUgaXMgbWlkbmlnaHQgaW4gdGhlIGN1cnJlbnQgbG9jYWxlJ3NcbiAqIHRpbWV6b25lLiBJbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IHdhbnQgdG8gY2hhbmdlIHRoaXMgdG8gYmUgbWlkbmlnaHQgaW4gVVRDLCBidXQgdGhpcyB3b3VsZCBiZSBhXG4gKiBjb25zaWRlcmFibGUgYnJlYWtpbmcgY2hhbmdlLlxuICovXG5mdW5jdGlvbiBjcmVhdGVEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyKTogRGF0ZSB7XG4gIC8vIFRoZSBgbmV3RGF0ZWAgaXMgc2V0IHRvIG1pZG5pZ2h0IChVVEMpIG9uIEphbnVhcnkgMXN0IDE5NzAuXG4gIC8vIC0gSW4gUFNUIHRoaXMgd2lsbCBiZSBEZWNlbWJlciAzMXN0IDE5NjkgYXQgNHBtLlxuICAvLyAtIEluIEdNVCB0aGlzIHdpbGwgYmUgSmFudWFyeSAxc3QgMTk3MCBhdCAxYW0uXG4gIC8vIE5vdGUgdGhhdCB0aGV5IGV2ZW4gaGF2ZSBkaWZmZXJlbnQgeWVhcnMsIGRhdGVzIGFuZCBtb250aHMhXG4gIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgwKTtcblxuICAvLyBgc2V0RnVsbFllYXIoKWAgYWxsb3dzIHllYXJzIGxpa2UgMDAwMSB0byBiZSBzZXQgY29ycmVjdGx5LiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90XG4gIC8vIGNoYW5nZSB0aGUgaW50ZXJuYWwgdGltZSBvZiB0aGUgZGF0ZS5cbiAgLy8gQ29uc2lkZXIgY2FsbGluZyBgc2V0RnVsbFllYXIoMjAxOSwgOCwgMjApYCAoU2VwdGVtYmVyIDIwLCAyMDE5KS5cbiAgLy8gLSBJbiBQU1QgdGhpcyB3aWxsIG5vdyBiZSBTZXB0ZW1iZXIgMjAsIDIwMTkgYXQgNHBtXG4gIC8vIC0gSW4gR01UIHRoaXMgd2lsbCBub3cgYmUgU2VwdGVtYmVyIDIwLCAyMDE5IGF0IDFhbVxuXG4gIG5ld0RhdGUuc2V0RnVsbFllYXIoeWVhciwgbW9udGgsIGRhdGUpO1xuICAvLyBXZSB3YW50IHRoZSBmaW5hbCBkYXRlIHRvIGJlIGF0IGxvY2FsIG1pZG5pZ2h0LCBzbyB3ZSByZXNldCB0aGUgdGltZS5cbiAgLy8gLSBJbiBQU1QgdGhpcyB3aWxsIG5vdyBiZSBTZXB0ZW1iZXIgMjAsIDIwMTkgYXQgMTJhbVxuICAvLyAtIEluIEdNVCB0aGlzIHdpbGwgbm93IGJlIFNlcHRlbWJlciAyMCwgMjAxOSBhdCAxMmFtXG4gIG5ld0RhdGUuc2V0SG91cnMoMCwgMCwgMCk7XG5cbiAgcmV0dXJuIG5ld0RhdGU7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVkRm9ybWF0KGxvY2FsZTogc3RyaW5nLCBmb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxvY2FsZUlkID0gZ2V0TG9jYWxlSWQobG9jYWxlKTtcbiAgTkFNRURfRk9STUFUU1tsb2NhbGVJZF0gPSBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXSB8fCB7fTtcblxuICBpZiAoTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XSkge1xuICAgIHJldHVybiBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXVtmb3JtYXRdO1xuICB9XG5cbiAgbGV0IGZvcm1hdFZhbHVlID0gJyc7XG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgY2FzZSAnc2hvcnREYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bURhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmdEYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkxvbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbERhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG9ydFRpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWVkaXVtVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZ1RpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmdWxsVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5GdWxsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3J0JzpcbiAgICAgIGNvbnN0IHNob3J0VGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ3Nob3J0VGltZScpO1xuICAgICAgY29uc3Qgc2hvcnREYXRlID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnc2hvcnREYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9IGZvcm1hdERhdGVUaW1lKFxuICAgICAgICAgIGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpLCBbc2hvcnRUaW1lLCBzaG9ydERhdGVdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICBjb25zdCBtZWRpdW1UaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbWVkaXVtVGltZScpO1xuICAgICAgY29uc3QgbWVkaXVtRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ21lZGl1bURhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID0gZm9ybWF0RGF0ZVRpbWUoXG4gICAgICAgICAgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pLCBbbWVkaXVtVGltZSwgbWVkaXVtRGF0ZV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZyc6XG4gICAgICBjb25zdCBsb25nVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2xvbmdUaW1lJyk7XG4gICAgICBjb25zdCBsb25nRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2xvbmdEYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9XG4gICAgICAgICAgZm9ybWF0RGF0ZVRpbWUoZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5Mb25nKSwgW2xvbmdUaW1lLCBsb25nRGF0ZV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbCc6XG4gICAgICBjb25zdCBmdWxsVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2Z1bGxUaW1lJyk7XG4gICAgICBjb25zdCBmdWxsRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2Z1bGxEYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9XG4gICAgICAgICAgZm9ybWF0RGF0ZVRpbWUoZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5GdWxsKSwgW2Z1bGxUaW1lLCBmdWxsRGF0ZV0pO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGZvcm1hdFZhbHVlKSB7XG4gICAgTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XSA9IGZvcm1hdFZhbHVlO1xuICB9XG4gIHJldHVybiBmb3JtYXRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWUoc3RyOiBzdHJpbmcsIG9wdF92YWx1ZXM6IHN0cmluZ1tdKSB7XG4gIGlmIChvcHRfdmFsdWVzKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xceyhbXn1dKyl9L2csIGZ1bmN0aW9uKG1hdGNoLCBrZXkpIHtcbiAgICAgIHJldHVybiAob3B0X3ZhbHVlcyAhPSBudWxsICYmIGtleSBpbiBvcHRfdmFsdWVzKSA/IG9wdF92YWx1ZXNba2V5XSA6IG1hdGNoO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIHBhZE51bWJlcihcbiAgICBudW06IG51bWJlciwgZGlnaXRzOiBudW1iZXIsIG1pbnVzU2lnbiA9ICctJywgdHJpbT86IGJvb2xlYW4sIG5lZ1dyYXA/OiBib29sZWFuKTogc3RyaW5nIHtcbiAgbGV0IG5lZyA9ICcnO1xuICBpZiAobnVtIDwgMCB8fCAobmVnV3JhcCAmJiBudW0gPD0gMCkpIHtcbiAgICBpZiAobmVnV3JhcCkge1xuICAgICAgbnVtID0gLW51bSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIG51bSA9IC1udW07XG4gICAgICBuZWcgPSBtaW51c1NpZ247XG4gICAgfVxuICB9XG4gIGxldCBzdHJOdW0gPSBTdHJpbmcobnVtKTtcbiAgd2hpbGUgKHN0ck51bS5sZW5ndGggPCBkaWdpdHMpIHtcbiAgICBzdHJOdW0gPSAnMCcgKyBzdHJOdW07XG4gIH1cbiAgaWYgKHRyaW0pIHtcbiAgICBzdHJOdW0gPSBzdHJOdW0uc3Vic3RyKHN0ck51bS5sZW5ndGggLSBkaWdpdHMpO1xuICB9XG4gIHJldHVybiBuZWcgKyBzdHJOdW07XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEZyYWN0aW9uYWxTZWNvbmRzKG1pbGxpc2Vjb25kczogbnVtYmVyLCBkaWdpdHM6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IHN0ck1zID0gcGFkTnVtYmVyKG1pbGxpc2Vjb25kcywgMyk7XG4gIHJldHVybiBzdHJNcy5zdWJzdHIoMCwgZGlnaXRzKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBpbnRvIGl0cyBsb2NhbGUgZGlnaXQgcmVwcmVzZW50YXRpb25cbiAqL1xuZnVuY3Rpb24gZGF0ZUdldHRlcihcbiAgICBuYW1lOiBEYXRlVHlwZSwgc2l6ZTogbnVtYmVyLCBvZmZzZXQ6IG51bWJlciA9IDAsIHRyaW0gPSBmYWxzZSxcbiAgICBuZWdXcmFwID0gZmFsc2UpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgcGFydCA9IGdldERhdGVQYXJ0KG5hbWUsIGRhdGUpO1xuICAgIGlmIChvZmZzZXQgPiAwIHx8IHBhcnQgPiAtb2Zmc2V0KSB7XG4gICAgICBwYXJ0ICs9IG9mZnNldDtcbiAgICB9XG5cbiAgICBpZiAobmFtZSA9PT0gRGF0ZVR5cGUuSG91cnMpIHtcbiAgICAgIGlmIChwYXJ0ID09PSAwICYmIG9mZnNldCA9PT0gLTEyKSB7XG4gICAgICAgIHBhcnQgPSAxMjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09IERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RnJhY3Rpb25hbFNlY29uZHMocGFydCwgc2l6ZSk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9jYWxlTWludXMgPSBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKTtcbiAgICByZXR1cm4gcGFkTnVtYmVyKHBhcnQsIHNpemUsIGxvY2FsZU1pbnVzLCB0cmltLCBuZWdXcmFwKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0RGF0ZVBhcnQocGFydDogRGF0ZVR5cGUsIGRhdGU6IERhdGUpOiBudW1iZXIge1xuICBzd2l0Y2ggKHBhcnQpIHtcbiAgICBjYXNlIERhdGVUeXBlLkZ1bGxZZWFyOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICBjYXNlIERhdGVUeXBlLk1vbnRoOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TW9udGgoKTtcbiAgICBjYXNlIERhdGVUeXBlLkRhdGU6XG4gICAgICByZXR1cm4gZGF0ZS5nZXREYXRlKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5Ib3VyczpcbiAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5NaW51dGVzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuU2Vjb25kczpcbiAgICAgIHJldHVybiBkYXRlLmdldFNlY29uZHMoKTtcbiAgICBjYXNlIERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5EYXk6XG4gICAgICByZXR1cm4gZGF0ZS5nZXREYXkoKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIERhdGVUeXBlIHZhbHVlIFwiJHtwYXJ0fVwiLmApO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGRhdGUgZm9ybWF0dGVyIHRoYXQgdHJhbnNmb3JtcyBhIGRhdGUgaW50byBpdHMgbG9jYWxlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICovXG5mdW5jdGlvbiBkYXRlU3RyR2V0dGVyKFxuICAgIG5hbWU6IFRyYW5zbGF0aW9uVHlwZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsIGZvcm06IEZvcm1TdHlsZSA9IEZvcm1TdHlsZS5Gb3JtYXQsXG4gICAgZXh0ZW5kZWQgPSBmYWxzZSk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24oZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXREYXRlVHJhbnNsYXRpb24oZGF0ZSwgbG9jYWxlLCBuYW1lLCB3aWR0aCwgZm9ybSwgZXh0ZW5kZWQpO1xuICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxvY2FsZSB0cmFuc2xhdGlvbiBvZiBhIGRhdGUgZm9yIGEgZ2l2ZW4gZm9ybSwgdHlwZSBhbmQgd2lkdGhcbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZVRyYW5zbGF0aW9uKFxuICAgIGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBuYW1lOiBUcmFuc2xhdGlvblR5cGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLCBmb3JtOiBGb3JtU3R5bGUsXG4gICAgZXh0ZW5kZWQ6IGJvb2xlYW4pIHtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuTW9udGhzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZU1vbnRoTmFtZXMobG9jYWxlLCBmb3JtLCB3aWR0aClbZGF0ZS5nZXRNb250aCgpXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5EYXlzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZURheU5hbWVzKGxvY2FsZSwgZm9ybSwgd2lkdGgpW2RhdGUuZ2V0RGF5KCldO1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHM6XG4gICAgICBjb25zdCBjdXJyZW50SG91cnMgPSBkYXRlLmdldEhvdXJzKCk7XG4gICAgICBjb25zdCBjdXJyZW50TWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpO1xuICAgICAgaWYgKGV4dGVuZGVkKSB7XG4gICAgICAgIGNvbnN0IHJ1bGVzID0gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcyhsb2NhbGUpO1xuICAgICAgICBjb25zdCBkYXlQZXJpb2RzID0gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzKGxvY2FsZSwgZm9ybSwgd2lkdGgpO1xuICAgICAgICBjb25zdCBpbmRleCA9IHJ1bGVzLmZpbmRJbmRleChydWxlID0+IHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShydWxlKSkge1xuICAgICAgICAgICAgLy8gbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodFxuICAgICAgICAgICAgY29uc3QgW2Zyb20sIHRvXSA9IHJ1bGU7XG4gICAgICAgICAgICBjb25zdCBhZnRlckZyb20gPSBjdXJyZW50SG91cnMgPj0gZnJvbS5ob3VycyAmJiBjdXJyZW50TWludXRlcyA+PSBmcm9tLm1pbnV0ZXM7XG4gICAgICAgICAgICBjb25zdCBiZWZvcmVUbyA9XG4gICAgICAgICAgICAgICAgKGN1cnJlbnRIb3VycyA8IHRvLmhvdXJzIHx8XG4gICAgICAgICAgICAgICAgIChjdXJyZW50SG91cnMgPT09IHRvLmhvdXJzICYmIGN1cnJlbnRNaW51dGVzIDwgdG8ubWludXRlcykpO1xuICAgICAgICAgICAgLy8gV2UgbXVzdCBhY2NvdW50IGZvciBub3JtYWwgcnVsZXMgdGhhdCBzcGFuIGEgcGVyaW9kIGR1cmluZyB0aGUgZGF5IChlLmcuIDZhbS05YW0pXG4gICAgICAgICAgICAvLyB3aGVyZSBgZnJvbWAgaXMgbGVzcyAoZWFybGllcikgdGhhbiBgdG9gLiBCdXQgYWxzbyBydWxlcyB0aGF0IHNwYW4gbWlkbmlnaHQgKGUuZy5cbiAgICAgICAgICAgIC8vIDEwcG0gLSA1YW0pIHdoZXJlIGBmcm9tYCBpcyBncmVhdGVyIChsYXRlciEpIHRoYW4gYHRvYC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJbiB0aGUgZmlyc3QgY2FzZSB0aGUgY3VycmVudCB0aW1lIG11c3QgYmUgQk9USCBhZnRlciBgZnJvbWAgQU5EIGJlZm9yZSBgdG9gXG4gICAgICAgICAgICAvLyAoZS5nLiA4YW0gaXMgYWZ0ZXIgNmFtIEFORCBiZWZvcmUgMTBhbSkuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gSW4gdGhlIHNlY29uZCBjYXNlIHRoZSBjdXJyZW50IHRpbWUgbXVzdCBiZSBFSVRIRVIgYWZ0ZXIgYGZyb21gIE9SIGJlZm9yZSBgdG9gXG4gICAgICAgICAgICAvLyAoZS5nLiA0YW0gaXMgYmVmb3JlIDVhbSBidXQgbm90IGFmdGVyIDEwcG07IGFuZCAxMXBtIGlzIG5vdCBiZWZvcmUgNWFtIGJ1dCBpdCBpc1xuICAgICAgICAgICAgLy8gYWZ0ZXIgMTBwbSkuXG4gICAgICAgICAgICBpZiAoZnJvbS5ob3VycyA8IHRvLmhvdXJzKSB7XG4gICAgICAgICAgICAgIGlmIChhZnRlckZyb20gJiYgYmVmb3JlVG8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhZnRlckZyb20gfHwgYmVmb3JlVG8pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHsgIC8vIG5vb24gb3IgbWlkbmlnaHRcbiAgICAgICAgICAgIGlmIChydWxlLmhvdXJzID09PSBjdXJyZW50SG91cnMgJiYgcnVsZS5taW51dGVzID09PSBjdXJyZW50TWludXRlcykge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBkYXlQZXJpb2RzW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWYgbm8gcnVsZXMgZm9yIHRoZSBkYXkgcGVyaW9kcywgd2UgdXNlIGFtL3BtIGJ5IGRlZmF1bHRcbiAgICAgIHJldHVybiBnZXRMb2NhbGVEYXlQZXJpb2RzKGxvY2FsZSwgZm9ybSwgPFRyYW5zbGF0aW9uV2lkdGg+d2lkdGgpW2N1cnJlbnRIb3VycyA8IDEyID8gMCA6IDFdO1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLkVyYXM6XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlRXJhTmFtZXMobG9jYWxlLCA8VHJhbnNsYXRpb25XaWR0aD53aWR0aClbZGF0ZS5nZXRGdWxsWWVhcigpIDw9IDAgPyAwIDogMV07XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIFRoaXMgZGVmYXVsdCBjYXNlIGlzIG5vdCBuZWVkZWQgYnkgVHlwZVNjcmlwdCBjb21waWxlciwgYXMgdGhlIHN3aXRjaCBpcyBleGhhdXN0aXZlLlxuICAgICAgLy8gSG93ZXZlciBDbG9zdXJlIENvbXBpbGVyIGRvZXMgbm90IHVuZGVyc3RhbmQgdGhhdCBhbmQgcmVwb3J0cyBhbiBlcnJvciBpbiB0eXBlZCBtb2RlLlxuICAgICAgLy8gVGhlIGB0aHJvdyBuZXcgRXJyb3JgIGJlbG93IHdvcmtzIGFyb3VuZCB0aGUgcHJvYmxlbSwgYW5kIHRoZSB1bmV4cGVjdGVkOiBuZXZlciB2YXJpYWJsZVxuICAgICAgLy8gbWFrZXMgc3VyZSB0c2Mgc3RpbGwgY2hlY2tzIHRoaXMgY29kZSBpcyB1bnJlYWNoYWJsZS5cbiAgICAgIGNvbnN0IHVuZXhwZWN0ZWQ6IG5ldmVyID0gbmFtZTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5leHBlY3RlZCB0cmFuc2xhdGlvbiB0eXBlICR7dW5leHBlY3RlZH1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHRyYW5zZm9ybXMgYSBkYXRlIGFuZCBhbiBvZmZzZXQgaW50byBhIHRpbWV6b25lIHdpdGggSVNPODYwMSBvclxuICogR01UIGZvcm1hdCBkZXBlbmRpbmcgb24gdGhlIHdpZHRoIChlZzogc2hvcnQgPSArMDQzMCwgc2hvcnQ6R01UID0gR01UKzQsIGxvbmcgPSBHTVQrMDQ6MzAsXG4gKiBleHRlbmRlZCA9ICswNDozMClcbiAqL1xuZnVuY3Rpb24gdGltZVpvbmVHZXR0ZXIod2lkdGg6IFpvbmVXaWR0aCk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24oZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKSB7XG4gICAgY29uc3Qgem9uZSA9IC0xICogb2Zmc2V0O1xuICAgIGNvbnN0IG1pbnVzU2lnbiA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pO1xuICAgIGNvbnN0IGhvdXJzID0gem9uZSA+IDAgPyBNYXRoLmZsb29yKHpvbmUgLyA2MCkgOiBNYXRoLmNlaWwoem9uZSAvIDYwKTtcbiAgICBzd2l0Y2ggKHdpZHRoKSB7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5TaG9ydDpcbiAgICAgICAgcmV0dXJuICgoem9uZSA+PSAwKSA/ICcrJyA6ICcnKSArIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArXG4gICAgICAgICAgICBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMiwgbWludXNTaWduKTtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLlNob3J0R01UOlxuICAgICAgICByZXR1cm4gJ0dNVCcgKyAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDEsIG1pbnVzU2lnbik7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5Mb25nOlxuICAgICAgICByZXR1cm4gJ0dNVCcgKyAoKHpvbmUgPj0gMCkgPyAnKycgOiAnJykgKyBwYWROdW1iZXIoaG91cnMsIDIsIG1pbnVzU2lnbikgKyAnOicgK1xuICAgICAgICAgICAgcGFkTnVtYmVyKE1hdGguYWJzKHpvbmUgJSA2MCksIDIsIG1pbnVzU2lnbik7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5FeHRlbmRlZDpcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAnWic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICgoem9uZSA+PSAwKSA/ICcrJyA6ICcnKSArIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArICc6JyArXG4gICAgICAgICAgICAgIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyLCBtaW51c1NpZ24pO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gem9uZSB3aWR0aCBcIiR7d2lkdGh9XCJgKTtcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IEpBTlVBUlkgPSAwO1xuY29uc3QgVEhVUlNEQVkgPSA0O1xuZnVuY3Rpb24gZ2V0Rmlyc3RUaHVyc2RheU9mWWVhcih5ZWFyOiBudW1iZXIpIHtcbiAgY29uc3QgZmlyc3REYXlPZlllYXIgPSBjcmVhdGVEYXRlKHllYXIsIEpBTlVBUlksIDEpLmdldERheSgpO1xuICByZXR1cm4gY3JlYXRlRGF0ZShcbiAgICAgIHllYXIsIDAsIDEgKyAoKGZpcnN0RGF5T2ZZZWFyIDw9IFRIVVJTREFZKSA/IFRIVVJTREFZIDogVEhVUlNEQVkgKyA3KSAtIGZpcnN0RGF5T2ZZZWFyKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGh1cnNkYXlUaGlzV2VlayhkYXRldGltZTogRGF0ZSkge1xuICByZXR1cm4gY3JlYXRlRGF0ZShcbiAgICAgIGRhdGV0aW1lLmdldEZ1bGxZZWFyKCksIGRhdGV0aW1lLmdldE1vbnRoKCksXG4gICAgICBkYXRldGltZS5nZXREYXRlKCkgKyAoVEhVUlNEQVkgLSBkYXRldGltZS5nZXREYXkoKSkpO1xufVxuXG5mdW5jdGlvbiB3ZWVrR2V0dGVyKHNpemU6IG51bWJlciwgbW9udGhCYXNlZCA9IGZhbHNlKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZykge1xuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKG1vbnRoQmFzZWQpIHtcbiAgICAgIGNvbnN0IG5iRGF5c0JlZm9yZTFzdERheU9mTW9udGggPVxuICAgICAgICAgIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSAtIDE7XG4gICAgICBjb25zdCB0b2RheSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgcmVzdWx0ID0gMSArIE1hdGguZmxvb3IoKHRvZGF5ICsgbmJEYXlzQmVmb3JlMXN0RGF5T2ZNb250aCkgLyA3KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdGhpc1RodXJzID0gZ2V0VGh1cnNkYXlUaGlzV2VlayhkYXRlKTtcbiAgICAgIC8vIFNvbWUgZGF5cyBvZiBhIHllYXIgYXJlIHBhcnQgb2YgbmV4dCB5ZWFyIGFjY29yZGluZyB0byBJU08gODYwMS5cbiAgICAgIC8vIENvbXB1dGUgdGhlIGZpcnN0VGh1cnMgZnJvbSB0aGUgeWVhciBvZiB0aGlzIHdlZWsncyBUaHVyc2RheVxuICAgICAgY29uc3QgZmlyc3RUaHVycyA9IGdldEZpcnN0VGh1cnNkYXlPZlllYXIodGhpc1RodXJzLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgY29uc3QgZGlmZiA9IHRoaXNUaHVycy5nZXRUaW1lKCkgLSBmaXJzdFRodXJzLmdldFRpbWUoKTtcbiAgICAgIHJlc3VsdCA9IDEgKyBNYXRoLnJvdW5kKGRpZmYgLyA2LjA0OGU4KTsgIC8vIDYuMDQ4ZTggbXMgcGVyIHdlZWtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFkTnVtYmVyKHJlc3VsdCwgc2l6ZSwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHByb3ZpZGVzIHRoZSB3ZWVrLW51bWJlcmluZyB5ZWFyIGZvciB0aGUgaW5wdXQgZGF0ZS5cbiAqL1xuZnVuY3Rpb24gd2Vla051bWJlcmluZ1llYXJHZXR0ZXIoc2l6ZTogbnVtYmVyLCB0cmltID0gZmFsc2UpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKSB7XG4gICAgY29uc3QgdGhpc1RodXJzID0gZ2V0VGh1cnNkYXlUaGlzV2VlayhkYXRlKTtcbiAgICBjb25zdCB3ZWVrTnVtYmVyaW5nWWVhciA9IHRoaXNUaHVycy5nZXRGdWxsWWVhcigpO1xuICAgIHJldHVybiBwYWROdW1iZXIoXG4gICAgICAgIHdlZWtOdW1iZXJpbmdZZWFyLCBzaXplLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSwgdHJpbSk7XG4gIH07XG59XG5cbnR5cGUgRGF0ZUZvcm1hdHRlciA9IChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpID0+IHN0cmluZztcblxuY29uc3QgREFURV9GT1JNQVRTOiB7W2Zvcm1hdDogc3RyaW5nXTogRGF0ZUZvcm1hdHRlcn0gPSB7fTtcblxuLy8gQmFzZWQgb24gQ0xEUiBmb3JtYXRzOlxuLy8gU2VlIGNvbXBsZXRlIGxpc3Q6IGh0dHA6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0ZpZWxkX1N5bWJvbF9UYWJsZVxuLy8gU2VlIGFsc28gZXhwbGFuYXRpb25zOiBodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9kYXRlLXRpbWVcbi8vIFRPRE8ob2NvbWJlKTogc3VwcG9ydCBhbGwgbWlzc2luZyBjbGRyIGZvcm1hdHM6IFUsIFEsIEQsIEYsIGUsIGosIEosIEMsIEEsIHYsIFYsIFgsIHhcbmZ1bmN0aW9uIGdldERhdGVGb3JtYXR0ZXIoZm9ybWF0OiBzdHJpbmcpOiBEYXRlRm9ybWF0dGVyfG51bGwge1xuICBpZiAoREFURV9GT1JNQVRTW2Zvcm1hdF0pIHtcbiAgICByZXR1cm4gREFURV9GT1JNQVRTW2Zvcm1hdF07XG4gIH1cbiAgbGV0IGZvcm1hdHRlcjtcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAvLyBFcmEgbmFtZSAoQUQvQkMpXG4gICAgY2FzZSAnRyc6XG4gICAgY2FzZSAnR0cnOlxuICAgIGNhc2UgJ0dHRyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5FcmFzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dHR0cnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRXJhcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dHR0dHJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkVyYXMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gMSBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgZS5nLiAoQUQgMSA9PiAxLCBBRCAxOTkgPT4gMTk5KVxuICAgIGNhc2UgJ3knOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMSwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gMiBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgcGFkZGVkICgwMC05OSkuIChlLmcuIEFEIDIwMDEgPT4gMDEsIEFEIDIwMTAgPT4gMTApXG4gICAgY2FzZSAneXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMiwgMCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyAzIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyLCBwYWRkZWQgKDAwMC05OTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRCAyMDEwID0+IDEwKVxuICAgIGNhc2UgJ3l5eSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZ1bGxZZWFyLCAzLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyA0IGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyIChlLmcuIEFEIDEgPT4gMDAwMSwgQUQgMjAxMCA9PiAyMDEwKVxuICAgIGNhc2UgJ3l5eXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgNCwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyAxIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB3ZWVrLW51bWJlcmluZyB5ZWFyLCBlLmcuIChBRCAxID0+IDEsIEFEIDE5OSA9PiAxOTkpXG4gICAgY2FzZSAnWSc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrTnVtYmVyaW5nWWVhckdldHRlcigxKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDIgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHdlZWstbnVtYmVyaW5nIHllYXIsIHBhZGRlZCAoMDAtOTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRFxuICAgIC8vIDIwMTAgPT4gMTApXG4gICAgY2FzZSAnWVknOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla051bWJlcmluZ1llYXJHZXR0ZXIoMiwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyAzIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB3ZWVrLW51bWJlcmluZyB5ZWFyLCBwYWRkZWQgKDAwMC05OTkpLiAoZS5nLiBBRCAxID0+IDAwMSwgQURcbiAgICAvLyAyMDEwID0+IDIwMTApXG4gICAgY2FzZSAnWVlZJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtOdW1iZXJpbmdZZWFyR2V0dGVyKDMpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gNCBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgd2Vlay1udW1iZXJpbmcgeWVhciAoZS5nLiBBRCAxID0+IDAwMDEsIEFEIDIwMTAgPT4gMjAxMClcbiAgICBjYXNlICdZWVlZJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtOdW1iZXJpbmdZZWFyR2V0dGVyKDQpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoMS0xMiksIG51bWVyaWNcbiAgICBjYXNlICdNJzpcbiAgICBjYXNlICdMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTW9udGgsIDEsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTU0nOlxuICAgIGNhc2UgJ0xMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTW9udGgsIDIsIDEpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoSmFudWFyeSwgLi4uKSwgc3RyaW5nLCBmb3JtYXRcbiAgICBjYXNlICdNTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTU1NTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIE1vbnRoIG9mIHRoZSB5ZWFyIChKYW51YXJ5LCAuLi4pLCBzdHJpbmcsIHN0YW5kYWxvbmVcbiAgICBjYXNlICdMTEwnOlxuICAgICAgZm9ybWF0dGVyID1cbiAgICAgICAgICBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xMTEwnOlxuICAgICAgZm9ybWF0dGVyID1cbiAgICAgICAgICBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSwgRm9ybVN0eWxlLlN0YW5kYWxvbmUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTExMTEwnOlxuICAgICAgZm9ybWF0dGVyID1cbiAgICAgICAgICBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFdlZWsgb2YgdGhlIHllYXIgKDEsIC4uLiA1MilcbiAgICBjYXNlICd3JzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtHZXR0ZXIoMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3dyc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrR2V0dGVyKDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBXZWVrIG9mIHRoZSBtb250aCAoMSwgLi4uKVxuICAgIGNhc2UgJ1cnOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla0dldHRlcigxLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRGF5IG9mIHRoZSBtb250aCAoMS0zMSlcbiAgICBjYXNlICdkJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRGF0ZSwgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkRhdGUsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBEYXkgb2YgdGhlIFdlZWsgU3RhbmRBbG9uZSAoMSwgMSwgTW9uLCBNb25kYXksIE0sIE1vKVxuICAgIGNhc2UgJ2MnOlxuICAgIGNhc2UgJ2NjJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRGF5LCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NjYyc6XG4gICAgICBmb3JtYXR0ZXIgPVxuICAgICAgICAgIGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NjY2MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5XaWRlLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjY2NjYyc6XG4gICAgICBmb3JtYXR0ZXIgPVxuICAgICAgICAgIGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjY2NjY2MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5TaG9ydCwgRm9ybVN0eWxlLlN0YW5kYWxvbmUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBEYXkgb2YgdGhlIFdlZWtcbiAgICBjYXNlICdFJzpcbiAgICBjYXNlICdFRSc6XG4gICAgY2FzZSAnRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRUVFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRUVFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRUVFRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBHZW5lcmljIHBlcmlvZCBvZiB0aGUgZGF5IChhbS1wbSlcbiAgICBjYXNlICdhJzpcbiAgICBjYXNlICdhYSc6XG4gICAgY2FzZSAnYWFhJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWFhYSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWFhYWEnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBFeHRlbmRlZCBwZXJpb2Qgb2YgdGhlIGRheSAobWlkbmlnaHQsIGF0IG5pZ2h0LCAuLi4pLCBzdGFuZGFsb25lXG4gICAgY2FzZSAnYic6XG4gICAgY2FzZSAnYmInOlxuICAgIGNhc2UgJ2JiYic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSwgRm9ybVN0eWxlLlN0YW5kYWxvbmUsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmJiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3csIEZvcm1TdHlsZS5TdGFuZGFsb25lLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRXh0ZW5kZWQgcGVyaW9kIG9mIHRoZSBkYXkgKG1pZG5pZ2h0LCBuaWdodCwgLi4uKSwgc3RhbmRhbG9uZVxuICAgIGNhc2UgJ0InOlxuICAgIGNhc2UgJ0JCJzpcbiAgICBjYXNlICdCQkInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCwgRm9ybVN0eWxlLkZvcm1hdCwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdCQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9XG4gICAgICAgICAgZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlLCBGb3JtU3R5bGUuRm9ybWF0LCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0JCQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LCBGb3JtU3R5bGUuRm9ybWF0LCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gSG91ciBpbiBBTS9QTSwgKDEtMTIpXG4gICAgY2FzZSAnaCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAxLCAtMTIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaGgnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMiwgLTEyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gSG91ciBvZiB0aGUgZGF5ICgwLTIzKVxuICAgIGNhc2UgJ0gnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMSk7XG4gICAgICBicmVhaztcbiAgICAvLyBIb3VyIGluIGRheSwgcGFkZGVkICgwMC0yMylcbiAgICBjYXNlICdISCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTWludXRlIG9mIHRoZSBob3VyICgwLTU5KVxuICAgIGNhc2UgJ20nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5NaW51dGVzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21tJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTWludXRlcywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIFNlY29uZCBvZiB0aGUgbWludXRlICgwLTU5KVxuICAgIGNhc2UgJ3MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5TZWNvbmRzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NzJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuU2Vjb25kcywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIEZyYWN0aW9uYWwgc2Vjb25kXG4gICAgY2FzZSAnUyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1NTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1NTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDMpO1xuICAgICAgYnJlYWs7XG5cblxuICAgIC8vIFRpbWV6b25lIElTTzg2MDEgc2hvcnQgZm9ybWF0ICgtMDQzMClcbiAgICBjYXNlICdaJzpcbiAgICBjYXNlICdaWic6XG4gICAgY2FzZSAnWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICAvLyBUaW1lem9uZSBJU084NjAxIGV4dGVuZGVkIGZvcm1hdCAoLTA0OjMwKVxuICAgIGNhc2UgJ1paWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5FeHRlbmRlZCk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFRpbWV6b25lIEdNVCBzaG9ydCBmb3JtYXQgKEdNVCs0KVxuICAgIGNhc2UgJ08nOlxuICAgIGNhc2UgJ09PJzpcbiAgICBjYXNlICdPT08nOlxuICAgIC8vIFNob3VsZCBiZSBsb2NhdGlvbiwgYnV0IGZhbGxiYWNrIHRvIGZvcm1hdCBPIGluc3RlYWQgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRoZSBkYXRhIHlldFxuICAgIGNhc2UgJ3onOlxuICAgIGNhc2UgJ3p6JzpcbiAgICBjYXNlICd6enonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLlNob3J0R01UKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRpbWV6b25lIEdNVCBsb25nIGZvcm1hdCAoR01UKzA0MzApXG4gICAgY2FzZSAnT09PTyc6XG4gICAgY2FzZSAnWlpaWic6XG4gICAgLy8gU2hvdWxkIGJlIGxvY2F0aW9uLCBidXQgZmFsbGJhY2sgdG8gZm9ybWF0IE8gaW5zdGVhZCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGRhdGEgeWV0XG4gICAgY2FzZSAnenp6eic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgREFURV9GT1JNQVRTW2Zvcm1hdF0gPSBmb3JtYXR0ZXI7XG4gIHJldHVybiBmb3JtYXR0ZXI7XG59XG5cbmZ1bmN0aW9uIHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmU6IHN0cmluZywgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gIC8vIFN1cHBvcnQ6IElFIDExIG9ubHksIEVkZ2UgMTMtMTUrXG4gIC8vIElFL0VkZ2UgZG8gbm90IFwidW5kZXJzdGFuZFwiIGNvbG9uIChgOmApIGluIHRpbWV6b25lXG4gIHRpbWV6b25lID0gdGltZXpvbmUucmVwbGFjZSgvOi9nLCAnJyk7XG4gIGNvbnN0IHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0ID0gRGF0ZS5wYXJzZSgnSmFuIDAxLCAxOTcwIDAwOjAwOjAwICcgKyB0aW1lem9uZSkgLyA2MDAwMDtcbiAgcmV0dXJuIGlzTmFOKHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0KSA/IGZhbGxiYWNrIDogcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQ7XG59XG5cbmZ1bmN0aW9uIGFkZERhdGVNaW51dGVzKGRhdGU6IERhdGUsIG1pbnV0ZXM6IG51bWJlcikge1xuICBkYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO1xuICBkYXRlLnNldE1pbnV0ZXMoZGF0ZS5nZXRNaW51dGVzKCkgKyBtaW51dGVzKTtcbiAgcmV0dXJuIGRhdGU7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZTogRGF0ZSwgdGltZXpvbmU6IHN0cmluZywgcmV2ZXJzZTogYm9vbGVhbik6IERhdGUge1xuICBjb25zdCByZXZlcnNlVmFsdWUgPSByZXZlcnNlID8gLTEgOiAxO1xuICBjb25zdCBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIGNvbnN0IHRpbWV6b25lT2Zmc2V0ID0gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZSwgZGF0ZVRpbWV6b25lT2Zmc2V0KTtcbiAgcmV0dXJuIGFkZERhdGVNaW51dGVzKGRhdGUsIHJldmVyc2VWYWx1ZSAqICh0aW1lem9uZU9mZnNldCAtIGRhdGVUaW1lem9uZU9mZnNldCkpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgdmFsdWUgdG8gZGF0ZS5cbiAqXG4gKiBTdXBwb3J0ZWQgaW5wdXQgZm9ybWF0czpcbiAqIC0gYERhdGVgXG4gKiAtIG51bWJlcjogdGltZXN0YW1wXG4gKiAtIHN0cmluZzogbnVtZXJpYyAoZS5nLiBcIjEyMzRcIiksIElTTyBhbmQgZGF0ZSBzdHJpbmdzIGluIGEgZm9ybWF0IHN1cHBvcnRlZCBieVxuICogICBbRGF0ZS5wYXJzZSgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9EYXRlL3BhcnNlKS5cbiAqICAgTm90ZTogSVNPIHN0cmluZ3Mgd2l0aG91dCB0aW1lIHJldHVybiBhIGRhdGUgd2l0aG91dCB0aW1lb2Zmc2V0LlxuICpcbiAqIFRocm93cyBpZiB1bmFibGUgdG8gY29udmVydCB0byBhIGRhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0RhdGUodmFsdWU6IHN0cmluZ3xudW1iZXJ8RGF0ZSk6IERhdGUge1xuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSkpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodmFsdWUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKTtcblxuICAgIGlmICgvXihcXGR7NH0oLVxcZHsxLDJ9KC1cXGR7MSwyfSk/KT8pJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgIC8qIEZvciBJU08gU3RyaW5ncyB3aXRob3V0IHRpbWUgdGhlIGRheSwgbW9udGggYW5kIHllYXIgbXVzdCBiZSBleHRyYWN0ZWQgZnJvbSB0aGUgSVNPIFN0cmluZ1xuICAgICAgYmVmb3JlIERhdGUgY3JlYXRpb24gdG8gYXZvaWQgdGltZSBvZmZzZXQgYW5kIGVycm9ycyBpbiB0aGUgbmV3IERhdGUuXG4gICAgICBJZiB3ZSBvbmx5IHJlcGxhY2UgJy0nIHdpdGggJywnIGluIHRoZSBJU08gU3RyaW5nIChcIjIwMTUsMDEsMDFcIiksIGFuZCB0cnkgdG8gY3JlYXRlIGEgbmV3XG4gICAgICBkYXRlLCBzb21lIGJyb3dzZXJzIChlLmcuIElFIDkpIHdpbGwgdGhyb3cgYW4gaW52YWxpZCBEYXRlIGVycm9yLlxuICAgICAgSWYgd2UgbGVhdmUgdGhlICctJyAoXCIyMDE1LTAxLTAxXCIpIGFuZCB0cnkgdG8gY3JlYXRlIGEgbmV3IERhdGUoXCIyMDE1LTAxLTAxXCIpIHRoZSB0aW1lb2Zmc2V0XG4gICAgICBpcyBhcHBsaWVkLlxuICAgICAgTm90ZTogSVNPIG1vbnRocyBhcmUgMCBmb3IgSmFudWFyeSwgMSBmb3IgRmVicnVhcnksIC4uLiAqL1xuICAgICAgY29uc3QgW3ksIG0gPSAxLCBkID0gMV0gPSB2YWx1ZS5zcGxpdCgnLScpLm1hcCgodmFsOiBzdHJpbmcpID0+ICt2YWwpO1xuICAgICAgcmV0dXJuIGNyZWF0ZURhdGUoeSwgbSAtIDEsIGQpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlZE5iID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG5cbiAgICAvLyBhbnkgc3RyaW5nIHRoYXQgb25seSBjb250YWlucyBudW1iZXJzLCBsaWtlIFwiMTIzNFwiIGJ1dCBub3QgbGlrZSBcIjEyMzRoZWxsb1wiXG4gICAgaWYgKCFpc05hTih2YWx1ZSBhcyBhbnkgLSBwYXJzZWROYikpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJzZWROYik7XG4gICAgfVxuXG4gICAgbGV0IG1hdGNoOiBSZWdFeHBNYXRjaEFycmF5fG51bGw7XG4gICAgaWYgKG1hdGNoID0gdmFsdWUubWF0Y2goSVNPODYwMV9EQVRFX1JFR0VYKSkge1xuICAgICAgcmV0dXJuIGlzb1N0cmluZ1RvRGF0ZShtYXRjaCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlIGFzIGFueSk7XG4gIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY29udmVydCBcIiR7dmFsdWV9XCIgaW50byBhIGRhdGVgKTtcbiAgfVxuICByZXR1cm4gZGF0ZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGRhdGUgaW4gSVNPODYwMSB0byBhIERhdGUuXG4gKiBVc2VkIGluc3RlYWQgb2YgYERhdGUucGFyc2VgIGJlY2F1c2Ugb2YgYnJvd3NlciBkaXNjcmVwYW5jaWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNvU3RyaW5nVG9EYXRlKG1hdGNoOiBSZWdFeHBNYXRjaEFycmF5KTogRGF0ZSB7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgbGV0IHR6SG91ciA9IDA7XG4gIGxldCB0ek1pbiA9IDA7XG5cbiAgLy8gbWF0Y2hbOF0gbWVhbnMgdGhhdCB0aGUgc3RyaW5nIGNvbnRhaW5zIFwiWlwiIChVVEMpIG9yIGEgdGltZXpvbmUgbGlrZSBcIiswMTowMFwiIG9yIFwiKzAxMDBcIlxuICBjb25zdCBkYXRlU2V0dGVyID0gbWF0Y2hbOF0gPyBkYXRlLnNldFVUQ0Z1bGxZZWFyIDogZGF0ZS5zZXRGdWxsWWVhcjtcbiAgY29uc3QgdGltZVNldHRlciA9IG1hdGNoWzhdID8gZGF0ZS5zZXRVVENIb3VycyA6IGRhdGUuc2V0SG91cnM7XG5cbiAgLy8gaWYgdGhlcmUgaXMgYSB0aW1lem9uZSBkZWZpbmVkIGxpa2UgXCIrMDE6MDBcIiBvciBcIiswMTAwXCJcbiAgaWYgKG1hdGNoWzldKSB7XG4gICAgdHpIb3VyID0gTnVtYmVyKG1hdGNoWzldICsgbWF0Y2hbMTBdKTtcbiAgICB0ek1pbiA9IE51bWJlcihtYXRjaFs5XSArIG1hdGNoWzExXSk7XG4gIH1cbiAgZGF0ZVNldHRlci5jYWxsKGRhdGUsIE51bWJlcihtYXRjaFsxXSksIE51bWJlcihtYXRjaFsyXSkgLSAxLCBOdW1iZXIobWF0Y2hbM10pKTtcbiAgY29uc3QgaCA9IE51bWJlcihtYXRjaFs0XSB8fCAwKSAtIHR6SG91cjtcbiAgY29uc3QgbSA9IE51bWJlcihtYXRjaFs1XSB8fCAwKSAtIHR6TWluO1xuICBjb25zdCBzID0gTnVtYmVyKG1hdGNoWzZdIHx8IDApO1xuICAvLyBUaGUgRUNNQVNjcmlwdCBzcGVjaWZpY2F0aW9uIChodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTE1LjkuMS4xMSlcbiAgLy8gZGVmaW5lcyB0aGF0IGBEYXRlVGltZWAgbWlsbGlzZWNvbmRzIHNob3VsZCBhbHdheXMgYmUgcm91bmRlZCBkb3duLCBzbyB0aGF0IGA5OTkuOW1zYFxuICAvLyBiZWNvbWVzIGA5OTltc2AuXG4gIGNvbnN0IG1zID0gTWF0aC5mbG9vcihwYXJzZUZsb2F0KCcwLicgKyAobWF0Y2hbN10gfHwgMCkpICogMTAwMCk7XG4gIHRpbWVTZXR0ZXIuY2FsbChkYXRlLCBoLCBtLCBzLCBtcyk7XG4gIHJldHVybiBkYXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBEYXRlIHtcbiAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4odmFsdWUudmFsdWVPZigpKTtcbn1cbiJdfQ==