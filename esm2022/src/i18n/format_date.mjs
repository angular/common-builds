/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FormatWidth, FormStyle, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat, NumberSymbol, TranslationWidth, } from './locale_data_api';
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
 * @param timezone The time zone. A time zone offset from GMT (such as `'+0430'`).
 * If not specified, uses host system settings.
 *
 * @returns The formatted date string.
 *
 * @see {@link DatePipe}
 * @see [Internationalization (i18n) Guide](guide/i18n)
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
    parts.forEach((value) => {
        const dateFormatter = getDateFormatter(value);
        text += dateFormatter
            ? dateFormatter(date, locale, dateTimezoneOffset)
            : value === "''"
                ? "'"
                : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
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
    NAMED_FORMATS[localeId] ??= {};
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
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [
                shortTime,
                shortDate,
            ]);
            break;
        case 'medium':
            const mediumTime = getNamedFormat(locale, 'mediumTime');
            const mediumDate = getNamedFormat(locale, 'mediumDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [
                mediumTime,
                mediumDate,
            ]);
            break;
        case 'long':
            const longTime = getNamedFormat(locale, 'longTime');
            const longDate = getNamedFormat(locale, 'longDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [
                longTime,
                longDate,
            ]);
            break;
        case 'full':
            const fullTime = getNamedFormat(locale, 'fullTime');
            const fullDate = getNamedFormat(locale, 'fullDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [
                fullTime,
                fullDate,
            ]);
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
            return opt_values != null && key in opt_values ? opt_values[key] : match;
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
        strNum = strNum.slice(strNum.length - digits);
    }
    return neg + strNum;
}
function formatFractionalSeconds(milliseconds, digits) {
    const strMs = padNumber(milliseconds, 3);
    return strMs.substring(0, digits);
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
                const index = rules.findIndex((rule) => {
                    if (Array.isArray(rule)) {
                        // morning, afternoon, evening, night
                        const [from, to] = rule;
                        const afterFrom = currentHours >= from.hours && currentMinutes >= from.minutes;
                        const beforeTo = currentHours < to.hours || (currentHours === to.hours && currentMinutes < to.minutes);
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
                    else {
                        // noon or midnight
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
                return ((zone >= 0 ? '+' : '') +
                    padNumber(hours, 2, minusSign) +
                    padNumber(Math.abs(zone % 60), 2, minusSign));
            case ZoneWidth.ShortGMT:
                return 'GMT' + (zone >= 0 ? '+' : '') + padNumber(hours, 1, minusSign);
            case ZoneWidth.Long:
                return ('GMT' +
                    (zone >= 0 ? '+' : '') +
                    padNumber(hours, 2, minusSign) +
                    ':' +
                    padNumber(Math.abs(zone % 60), 2, minusSign));
            case ZoneWidth.Extended:
                if (offset === 0) {
                    return 'Z';
                }
                else {
                    return ((zone >= 0 ? '+' : '') +
                        padNumber(hours, 2, minusSign) +
                        ':' +
                        padNumber(Math.abs(zone % 60), 2, minusSign));
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
    return createDate(year, 0, 1 + (firstDayOfYear <= THURSDAY ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
/**
 *  ISO Week starts on day 1 (Monday) and ends with day 0 (Sunday)
 */
export function getThursdayThisIsoWeek(datetime) {
    // getDay returns 0-6 range with sunday as 0.
    const currentDay = datetime.getDay();
    // On a Sunday, read the previous Thursday since ISO weeks start on Monday.
    const deltaToThursday = currentDay === 0 ? -3 : THURSDAY - currentDay;
    return createDate(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + deltaToThursday);
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
            const thisThurs = getThursdayThisIsoWeek(date);
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
        const thisThurs = getThursdayThisIsoWeek(date);
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
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'LLLL':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'LLLLL':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow, FormStyle.Standalone);
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
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'cccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'ccccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow, FormStyle.Standalone);
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
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
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
        if ((match = value.match(ISO8601_DATE_REGEX))) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X2RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2kxOG4vZm9ybWF0X2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFdBQVcsRUFDWCxTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsbUJBQW1CLEVBQ25CLGlCQUFpQixFQUNqQiw0QkFBNEIsRUFDNUIsd0JBQXdCLEVBQ3hCLFdBQVcsRUFDWCxtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLG1CQUFtQixFQUNuQixZQUFZLEVBRVosZ0JBQWdCLEdBQ2pCLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQzdCLHVHQUF1RyxDQUFDO0FBQzFHLGdHQUFnRztBQUNoRyxNQUFNLGFBQWEsR0FBcUQsRUFBRSxDQUFDO0FBQzNFLE1BQU0sa0JBQWtCLEdBQ3RCLG1OQUFtTixDQUFDO0FBRXROLElBQUssU0FLSjtBQUxELFdBQUssU0FBUztJQUNaLDJDQUFLLENBQUE7SUFDTCxpREFBUSxDQUFBO0lBQ1IseUNBQUksQ0FBQTtJQUNKLGlEQUFRLENBQUE7QUFDVixDQUFDLEVBTEksU0FBUyxLQUFULFNBQVMsUUFLYjtBQUVELElBQUssUUFTSjtBQVRELFdBQUssUUFBUTtJQUNYLCtDQUFRLENBQUE7SUFDUix5Q0FBSyxDQUFBO0lBQ0wsdUNBQUksQ0FBQTtJQUNKLHlDQUFLLENBQUE7SUFDTCw2Q0FBTyxDQUFBO0lBQ1AsNkNBQU8sQ0FBQTtJQUNQLGlFQUFpQixDQUFBO0lBQ2pCLHFDQUFHLENBQUE7QUFDTCxDQUFDLEVBVEksUUFBUSxLQUFSLFFBQVEsUUFTWjtBQUVELElBQUssZUFLSjtBQUxELFdBQUssZUFBZTtJQUNsQixpRUFBVSxDQUFBO0lBQ1YscURBQUksQ0FBQTtJQUNKLHlEQUFNLENBQUE7SUFDTixxREFBSSxDQUFBO0FBQ04sQ0FBQyxFQUxJLGVBQWUsS0FBZixlQUFlLFFBS25CO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFNLFVBQVUsVUFBVSxDQUN4QixLQUE2QixFQUM3QixNQUFjLEVBQ2QsTUFBYyxFQUNkLFFBQWlCO0lBRWpCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELE1BQU0sR0FBRyxXQUFXLElBQUksTUFBTSxDQUFDO0lBRS9CLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUN6QixJQUFJLEtBQUssQ0FBQztJQUNWLE9BQU8sTUFBTSxFQUFFLENBQUM7UUFDZCxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDVixNQUFNO1lBQ1IsQ0FBQztZQUNELE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDaEIsQ0FBQzthQUFNLENBQUM7WUFDTixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25CLE1BQU07UUFDUixDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3BFLElBQUksR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDdEIsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUMsSUFBSSxJQUFJLGFBQWE7WUFDbkIsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDO1lBQ2pELENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSTtnQkFDZCxDQUFDLENBQUMsR0FBRztnQkFDTCxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxRCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILFNBQVMsVUFBVSxDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsSUFBWTtJQUMzRCw4REFBOEQ7SUFDOUQsbURBQW1EO0lBQ25ELGlEQUFpRDtJQUNqRCw4REFBOEQ7SUFDOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFNUIscUZBQXFGO0lBQ3JGLHdDQUF3QztJQUN4QyxvRUFBb0U7SUFDcEUsc0RBQXNEO0lBQ3RELHNEQUFzRDtJQUV0RCxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsd0VBQXdFO0lBQ3hFLHVEQUF1RDtJQUN2RCx1REFBdUQ7SUFDdkQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFCLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxNQUFjLEVBQUUsTUFBYztJQUNwRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUUvQixJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3BDLE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDckIsUUFBUSxNQUFNLEVBQUUsQ0FBQztRQUNmLEtBQUssV0FBVztZQUNkLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdELE1BQU07UUFDUixLQUFLLFlBQVk7WUFDZixXQUFXLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5RCxNQUFNO1FBQ1IsS0FBSyxVQUFVO1lBQ2IsV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsTUFBTTtRQUNSLEtBQUssVUFBVTtZQUNiLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVELE1BQU07UUFDUixLQUFLLFdBQVc7WUFDZCxXQUFXLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3RCxNQUFNO1FBQ1IsS0FBSyxZQUFZO1lBQ2YsV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUQsTUFBTTtRQUNSLEtBQUssVUFBVTtZQUNiLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVELE1BQU07UUFDUixLQUFLLFVBQVU7WUFDYixXQUFXLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN0RCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RELFdBQVcsR0FBRyxjQUFjLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0UsU0FBUztnQkFDVCxTQUFTO2FBQ1YsQ0FBQyxDQUFDO1lBQ0gsTUFBTTtRQUNSLEtBQUssUUFBUTtZQUNYLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDeEQsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN4RCxXQUFXLEdBQUcsY0FBYyxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hGLFVBQVU7Z0JBQ1YsVUFBVTthQUNYLENBQUMsQ0FBQztZQUNILE1BQU07UUFDUixLQUFLLE1BQU07WUFDVCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEQsV0FBVyxHQUFHLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5RSxRQUFRO2dCQUNSLFFBQVE7YUFDVCxDQUFDLENBQUM7WUFDSCxNQUFNO1FBQ1IsS0FBSyxNQUFNO1lBQ1QsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwRCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELFdBQVcsR0FBRyxjQUFjLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUUsUUFBUTtnQkFDUixRQUFRO2FBQ1QsQ0FBQyxDQUFDO1lBQ0gsTUFBTTtJQUNWLENBQUM7SUFDRCxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2hCLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxXQUFXLENBQUM7SUFDaEQsQ0FBQztJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFXLEVBQUUsVUFBb0I7SUFDdkQsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNmLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFVLEtBQUssRUFBRSxHQUFHO1lBQ25ELE9BQU8sVUFBVSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FDaEIsR0FBVyxFQUNYLE1BQWMsRUFDZCxTQUFTLEdBQUcsR0FBRyxFQUNmLElBQWMsRUFDZCxPQUFpQjtJQUVqQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckMsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQzthQUFNLENBQUM7WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFDWCxHQUFHLEdBQUcsU0FBUyxDQUFDO1FBQ2xCLENBQUM7SUFDSCxDQUFDO0lBQ0QsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLE9BQU8sTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUM5QixNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNULE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNELE9BQU8sR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUN0QixDQUFDO0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxZQUFvQixFQUFFLE1BQWM7SUFDbkUsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsVUFBVSxDQUNqQixJQUFjLEVBQ2QsSUFBWSxFQUNaLFNBQWlCLENBQUMsRUFDbEIsSUFBSSxHQUFHLEtBQUssRUFDWixPQUFPLEdBQUcsS0FBSztJQUVmLE9BQU8sVUFBVSxJQUFVLEVBQUUsTUFBYztRQUN6QyxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQyxJQUFJLElBQUksTUFBTSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLElBQUksS0FBSyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDNUIsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ1osQ0FBQztRQUNILENBQUM7YUFBTSxJQUFJLElBQUksS0FBSyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMvQyxPQUFPLHVCQUF1QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLElBQWMsRUFBRSxJQUFVO0lBQzdDLFFBQVEsSUFBSSxFQUFFLENBQUM7UUFDYixLQUFLLFFBQVEsQ0FBQyxRQUFRO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVCLEtBQUssUUFBUSxDQUFDLEtBQUs7WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekIsS0FBSyxRQUFRLENBQUMsSUFBSTtZQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QixLQUFLLFFBQVEsQ0FBQyxLQUFLO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLEtBQUssUUFBUSxDQUFDLE9BQU87WUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDM0IsS0FBSyxRQUFRLENBQUMsT0FBTztZQUNuQixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixLQUFLLFFBQVEsQ0FBQyxpQkFBaUI7WUFDN0IsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDaEMsS0FBSyxRQUFRLENBQUMsR0FBRztZQUNmLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUN6RCxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxhQUFhLENBQ3BCLElBQXFCLEVBQ3JCLEtBQXVCLEVBQ3ZCLE9BQWtCLFNBQVMsQ0FBQyxNQUFNLEVBQ2xDLFFBQVEsR0FBRyxLQUFLO0lBRWhCLE9BQU8sVUFBVSxJQUFVLEVBQUUsTUFBYztRQUN6QyxPQUFPLGtCQUFrQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkUsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxrQkFBa0IsQ0FDekIsSUFBVSxFQUNWLE1BQWMsRUFDZCxJQUFxQixFQUNyQixLQUF1QixFQUN2QixJQUFlLEVBQ2YsUUFBaUI7SUFFakIsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUNiLEtBQUssZUFBZSxDQUFDLE1BQU07WUFDekIsT0FBTyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLEtBQUssZUFBZSxDQUFDLElBQUk7WUFDdkIsT0FBTyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELEtBQUssZUFBZSxDQUFDLFVBQVU7WUFDN0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN6QyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNiLE1BQU0sS0FBSyxHQUFHLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ3JDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUN4QixxQ0FBcUM7d0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUN4QixNQUFNLFNBQVMsR0FBRyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxjQUFjLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQzt3QkFDL0UsTUFBTSxRQUFRLEdBQ1osWUFBWSxHQUFHLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDLEtBQUssSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN4RixvRkFBb0Y7d0JBQ3BGLG9GQUFvRjt3QkFDcEYsMERBQTBEO3dCQUMxRCxFQUFFO3dCQUNGLCtFQUErRTt3QkFDL0UsMkNBQTJDO3dCQUMzQyxFQUFFO3dCQUNGLGlGQUFpRjt3QkFDakYsbUZBQW1GO3dCQUNuRixlQUFlO3dCQUNmLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQzFCLElBQUksU0FBUyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dDQUMxQixPQUFPLElBQUksQ0FBQzs0QkFDZCxDQUFDO3dCQUNILENBQUM7NkJBQU0sSUFBSSxTQUFTLElBQUksUUFBUSxFQUFFLENBQUM7NEJBQ2pDLE9BQU8sSUFBSSxDQUFDO3dCQUNkLENBQUM7b0JBQ0gsQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLG1CQUFtQjt3QkFDbkIsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLGNBQWMsRUFBRSxDQUFDOzRCQUNuRSxPQUFPLElBQUksQ0FBQzt3QkFDZCxDQUFDO29CQUNILENBQUM7b0JBQ0QsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDakIsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNCLENBQUM7WUFDSCxDQUFDO1lBQ0QsMkRBQTJEO1lBQzNELE9BQU8sbUJBQW1CLENBQUMsTUFBTSxFQUFFLElBQUksRUFBb0IsS0FBSyxDQUFDLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRixLQUFLLGVBQWUsQ0FBQyxJQUFJO1lBQ3ZCLE9BQU8saUJBQWlCLENBQUMsTUFBTSxFQUFvQixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGO1lBQ0UsdUZBQXVGO1lBQ3ZGLHdGQUF3RjtZQUN4RiwyRkFBMkY7WUFDM0Ysd0RBQXdEO1lBQ3hELE1BQU0sVUFBVSxHQUFVLElBQUksQ0FBQztZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsY0FBYyxDQUFDLEtBQWdCO0lBQ3RDLE9BQU8sVUFBVSxJQUFVLEVBQUUsTUFBYyxFQUFFLE1BQWM7UUFDekQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3pCLE1BQU0sU0FBUyxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDZCxLQUFLLFNBQVMsQ0FBQyxLQUFLO2dCQUNsQixPQUFPLENBQ0wsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDdEIsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDO29CQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUM3QyxDQUFDO1lBQ0osS0FBSyxTQUFTLENBQUMsUUFBUTtnQkFDckIsT0FBTyxLQUFLLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pFLEtBQUssU0FBUyxDQUFDLElBQUk7Z0JBQ2pCLE9BQU8sQ0FDTCxLQUFLO29CQUNMLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3RCLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztvQkFDOUIsR0FBRztvQkFDSCxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUM3QyxDQUFDO1lBQ0osS0FBSyxTQUFTLENBQUMsUUFBUTtnQkFDckIsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ2pCLE9BQU8sR0FBRyxDQUFDO2dCQUNiLENBQUM7cUJBQU0sQ0FBQztvQkFDTixPQUFPLENBQ0wsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDdEIsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDO3dCQUM5QixHQUFHO3dCQUNILFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQzdDLENBQUM7Z0JBQ0osQ0FBQztZQUNIO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDckQsQ0FBQztJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDbEIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFNBQVMsc0JBQXNCLENBQUMsSUFBWTtJQUMxQyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3RCxPQUFPLFVBQVUsQ0FDZixJQUFJLEVBQ0osQ0FBQyxFQUNELENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FDNUUsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxRQUFjO0lBQ25ELDZDQUE2QztJQUM3QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFckMsMkVBQTJFO0lBQzNFLE1BQU0sZUFBZSxHQUFHLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0lBRXRFLE9BQU8sVUFBVSxDQUNmLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFDdEIsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUNuQixRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsZUFBZSxDQUNyQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLElBQVksRUFBRSxVQUFVLEdBQUcsS0FBSztJQUNsRCxPQUFPLFVBQVUsSUFBVSxFQUFFLE1BQWM7UUFDekMsSUFBSSxNQUFNLENBQUM7UUFDWCxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2YsTUFBTSx5QkFBeUIsR0FDN0IsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDaEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzdCLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsbUVBQW1FO1lBQ25FLCtEQUErRDtZQUMvRCxNQUFNLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUNuRSxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hELE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7UUFDakUsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsdUJBQXVCLENBQUMsSUFBWSxFQUFFLElBQUksR0FBRyxLQUFLO0lBQ3pELE9BQU8sVUFBVSxJQUFVLEVBQUUsTUFBYztRQUN6QyxNQUFNLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxNQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsRCxPQUFPLFNBQVMsQ0FDZCxpQkFBaUIsRUFDakIsSUFBSSxFQUNKLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQ3JELElBQUksQ0FDTCxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUlELE1BQU0sWUFBWSxHQUFzQyxFQUFFLENBQUM7QUFFM0QseUJBQXlCO0FBQ3pCLGlHQUFpRztBQUNqRyx1RUFBdUU7QUFDdkUsd0ZBQXdGO0FBQ3hGLFNBQVMsZ0JBQWdCLENBQUMsTUFBYztJQUN0QyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFJLFNBQVMsQ0FBQztJQUNkLFFBQVEsTUFBTSxFQUFFLENBQUM7UUFDZixtQkFBbUI7UUFDbkIsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSztZQUNSLFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5RSxNQUFNO1FBQ1IsS0FBSyxNQUFNO1lBQ1QsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZFLE1BQU07UUFDUixLQUFLLE9BQU87WUFDVixTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekUsTUFBTTtRQUVSLHNFQUFzRTtRQUN0RSxLQUFLLEdBQUc7WUFDTixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTTtRQUNSLDBGQUEwRjtRQUMxRixLQUFLLElBQUk7WUFDUCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUQsTUFBTTtRQUNSLDRGQUE0RjtRQUM1RixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTTtRQUNSLDBFQUEwRTtRQUMxRSxLQUFLLE1BQU07WUFDVCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTTtRQUVSLHFGQUFxRjtRQUNyRixLQUFLLEdBQUc7WUFDTixTQUFTLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTTtRQUNSLDZGQUE2RjtRQUM3RixjQUFjO1FBQ2QsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLHVCQUF1QixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3QyxNQUFNO1FBQ1IsNkZBQTZGO1FBQzdGLGdCQUFnQjtRQUNoQixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTTtRQUNSLHlGQUF5RjtRQUN6RixLQUFLLE1BQU07WUFDVCxTQUFTLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTTtRQUVSLG9DQUFvQztRQUNwQyxLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssR0FBRztZQUNOLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsTUFBTTtRQUNSLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNO1FBRVIsbURBQW1EO1FBQ25ELEtBQUssS0FBSztZQUNSLFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoRixNQUFNO1FBQ1IsS0FBSyxNQUFNO1lBQ1QsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pFLE1BQU07UUFDUixLQUFLLE9BQU87WUFDVixTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0UsTUFBTTtRQUVSLHVEQUF1RDtRQUN2RCxLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsYUFBYSxDQUN2QixlQUFlLENBQUMsTUFBTSxFQUN0QixnQkFBZ0IsQ0FBQyxXQUFXLEVBQzVCLFNBQVMsQ0FBQyxVQUFVLENBQ3JCLENBQUM7WUFDRixNQUFNO1FBQ1IsS0FBSyxNQUFNO1lBQ1QsU0FBUyxHQUFHLGFBQWEsQ0FDdkIsZUFBZSxDQUFDLE1BQU0sRUFDdEIsZ0JBQWdCLENBQUMsSUFBSSxFQUNyQixTQUFTLENBQUMsVUFBVSxDQUNyQixDQUFDO1lBQ0YsTUFBTTtRQUNSLEtBQUssT0FBTztZQUNWLFNBQVMsR0FBRyxhQUFhLENBQ3ZCLGVBQWUsQ0FBQyxNQUFNLEVBQ3RCLGdCQUFnQixDQUFDLE1BQU0sRUFDdkIsU0FBUyxDQUFDLFVBQVUsQ0FDckIsQ0FBQztZQUNGLE1BQU07UUFFUiwrQkFBK0I7UUFDL0IsS0FBSyxHQUFHO1lBQ04sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNO1FBQ1IsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNO1FBRVIsNkJBQTZCO1FBQzdCLEtBQUssR0FBRztZQUNOLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU07UUFFUiwwQkFBMEI7UUFDMUIsS0FBSyxHQUFHO1lBQ04sU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU07UUFDUixLQUFLLElBQUk7WUFDUCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekMsTUFBTTtRQUVSLHdEQUF3RDtRQUN4RCxLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssSUFBSTtZQUNQLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNO1FBQ1IsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLGFBQWEsQ0FDdkIsZUFBZSxDQUFDLElBQUksRUFDcEIsZ0JBQWdCLENBQUMsV0FBVyxFQUM1QixTQUFTLENBQUMsVUFBVSxDQUNyQixDQUFDO1lBQ0YsTUFBTTtRQUNSLEtBQUssTUFBTTtZQUNULFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdGLE1BQU07UUFDUixLQUFLLE9BQU87WUFDVixTQUFTLEdBQUcsYUFBYSxDQUN2QixlQUFlLENBQUMsSUFBSSxFQUNwQixnQkFBZ0IsQ0FBQyxNQUFNLEVBQ3ZCLFNBQVMsQ0FBQyxVQUFVLENBQ3JCLENBQUM7WUFDRixNQUFNO1FBQ1IsS0FBSyxRQUFRO1lBQ1gsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUYsTUFBTTtRQUVSLGtCQUFrQjtRQUNsQixLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlFLE1BQU07UUFDUixLQUFLLE1BQU07WUFDVCxTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkUsTUFBTTtRQUNSLEtBQUssT0FBTztZQUNWLFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RSxNQUFNO1FBQ1IsS0FBSyxRQUFRO1lBQ1gsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLE1BQU07UUFFUixvQ0FBb0M7UUFDcEMsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSztZQUNSLFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwRixNQUFNO1FBQ1IsS0FBSyxNQUFNO1lBQ1QsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdFLE1BQU07UUFDUixLQUFLLE9BQU87WUFDVixTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0UsTUFBTTtRQUVSLG1FQUFtRTtRQUNuRSxLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLGFBQWEsQ0FDdkIsZUFBZSxDQUFDLFVBQVUsRUFDMUIsZ0JBQWdCLENBQUMsV0FBVyxFQUM1QixTQUFTLENBQUMsVUFBVSxFQUNwQixJQUFJLENBQ0wsQ0FBQztZQUNGLE1BQU07UUFDUixLQUFLLE1BQU07WUFDVCxTQUFTLEdBQUcsYUFBYSxDQUN2QixlQUFlLENBQUMsVUFBVSxFQUMxQixnQkFBZ0IsQ0FBQyxJQUFJLEVBQ3JCLFNBQVMsQ0FBQyxVQUFVLEVBQ3BCLElBQUksQ0FDTCxDQUFDO1lBQ0YsTUFBTTtRQUNSLEtBQUssT0FBTztZQUNWLFNBQVMsR0FBRyxhQUFhLENBQ3ZCLGVBQWUsQ0FBQyxVQUFVLEVBQzFCLGdCQUFnQixDQUFDLE1BQU0sRUFDdkIsU0FBUyxDQUFDLFVBQVUsRUFDcEIsSUFBSSxDQUNMLENBQUM7WUFDRixNQUFNO1FBRVIsZ0VBQWdFO1FBQ2hFLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsYUFBYSxDQUN2QixlQUFlLENBQUMsVUFBVSxFQUMxQixnQkFBZ0IsQ0FBQyxXQUFXLEVBQzVCLFNBQVMsQ0FBQyxNQUFNLEVBQ2hCLElBQUksQ0FDTCxDQUFDO1lBQ0YsTUFBTTtRQUNSLEtBQUssTUFBTTtZQUNULFNBQVMsR0FBRyxhQUFhLENBQ3ZCLGVBQWUsQ0FBQyxVQUFVLEVBQzFCLGdCQUFnQixDQUFDLElBQUksRUFDckIsU0FBUyxDQUFDLE1BQU0sRUFDaEIsSUFBSSxDQUNMLENBQUM7WUFDRixNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsU0FBUyxHQUFHLGFBQWEsQ0FDdkIsZUFBZSxDQUFDLFVBQVUsRUFDMUIsZ0JBQWdCLENBQUMsTUFBTSxFQUN2QixTQUFTLENBQUMsTUFBTSxFQUNoQixJQUFJLENBQ0wsQ0FBQztZQUNGLE1BQU07UUFFUix3QkFBd0I7UUFDeEIsS0FBSyxHQUFHO1lBQ04sU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLE1BQU07UUFDUixLQUFLLElBQUk7WUFDUCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0MsTUFBTTtRQUVSLHlCQUF5QjtRQUN6QixLQUFLLEdBQUc7WUFDTixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTTtRQUNSLDhCQUE4QjtRQUM5QixLQUFLLElBQUk7WUFDUCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTTtRQUVSLDRCQUE0QjtRQUM1QixLQUFLLEdBQUc7WUFDTixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTTtRQUNSLEtBQUssSUFBSTtZQUNQLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxNQUFNO1FBRVIsOEJBQThCO1FBQzlCLEtBQUssR0FBRztZQUNOLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxNQUFNO1FBQ1IsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU07UUFFUixvQkFBb0I7UUFDcEIsS0FBSyxHQUFHO1lBQ04sU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEQsTUFBTTtRQUNSLEtBQUssSUFBSTtZQUNQLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU07UUFDUixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNO1FBRVIsd0NBQXdDO1FBQ3hDLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QyxNQUFNO1FBQ1IsNENBQTRDO1FBQzVDLEtBQUssT0FBTztZQUNWLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLE1BQU07UUFFUixvQ0FBb0M7UUFDcEMsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSyxDQUFDO1FBQ1gsMEZBQTBGO1FBQzFGLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxNQUFNO1FBQ1Isc0NBQXNDO1FBQ3RDLEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxNQUFNLENBQUM7UUFDWiwwRkFBMEY7UUFDMUYsS0FBSyxNQUFNO1lBQ1QsU0FBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsTUFBTTtRQUNSO1lBQ0UsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDakMsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjtJQUMxRCxtQ0FBbUM7SUFDbkMsc0RBQXNEO0lBQ3RELFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN0QyxNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3hGLE9BQU8sS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUM7QUFDN0UsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLElBQVUsRUFBRSxPQUFlO0lBQ2pELElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUM3QyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLHNCQUFzQixDQUFDLElBQVUsRUFBRSxRQUFnQixFQUFFLE9BQWdCO0lBQzVFLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0QyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3BELE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3RFLE9BQU8sY0FBYyxDQUFDLElBQUksRUFBRSxZQUFZLEdBQUcsQ0FBQyxjQUFjLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxNQUFNLENBQUMsS0FBNkI7SUFDbEQsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNsQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQy9DLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDOUIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVyQixJQUFJLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2xEOzs7Ozs7c0VBTTBEO1lBQzFELE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEUsT0FBTyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVuQyw4RUFBOEU7UUFDOUUsSUFBSSxDQUFDLEtBQUssQ0FBRSxLQUFhLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJLEtBQThCLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBWSxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLEtBQUssZUFBZSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsS0FBdUI7SUFDckQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBRWQsMkZBQTJGO0lBQzNGLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUNyRSxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFFL0QsMERBQTBEO0lBQzFELElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDYixNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0QyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEYsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDekMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDeEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoQyxnR0FBZ0c7SUFDaEcsd0ZBQXdGO0lBQ3hGLG1CQUFtQjtJQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNqRSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNuQyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUFDLEtBQVU7SUFDL0IsT0FBTyxLQUFLLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRm9ybWF0V2lkdGgsXG4gIEZvcm1TdHlsZSxcbiAgZ2V0TG9jYWxlRGF0ZUZvcm1hdCxcbiAgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQsXG4gIGdldExvY2FsZURheU5hbWVzLFxuICBnZXRMb2NhbGVEYXlQZXJpb2RzLFxuICBnZXRMb2NhbGVFcmFOYW1lcyxcbiAgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcyxcbiAgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzLFxuICBnZXRMb2NhbGVJZCxcbiAgZ2V0TG9jYWxlTW9udGhOYW1lcyxcbiAgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sLFxuICBnZXRMb2NhbGVUaW1lRm9ybWF0LFxuICBOdW1iZXJTeW1ib2wsXG4gIFRpbWUsXG4gIFRyYW5zbGF0aW9uV2lkdGgsXG59IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuZXhwb3J0IGNvbnN0IElTTzg2MDFfREFURV9SRUdFWCA9XG4gIC9eKFxcZHs0LH0pLT8oXFxkXFxkKS0/KFxcZFxcZCkoPzpUKFxcZFxcZCkoPzo6PyhcXGRcXGQpKD86Oj8oXFxkXFxkKSg/OlxcLihcXGQrKSk/KT8pPyhafChbKy1dKShcXGRcXGQpOj8oXFxkXFxkKSk/KT8kLztcbi8vICAgIDEgICAgICAgIDIgICAgICAgMyAgICAgICAgIDQgICAgICAgICAgNSAgICAgICAgICA2ICAgICAgICAgIDcgICAgICAgICAgOCAgOSAgICAgMTAgICAgICAxMVxuY29uc3QgTkFNRURfRk9STUFUUzoge1tsb2NhbGVJZDogc3RyaW5nXToge1tmb3JtYXQ6IHN0cmluZ106IHN0cmluZ319ID0ge307XG5jb25zdCBEQVRFX0ZPUk1BVFNfU1BMSVQgPVxuICAvKCg/OlteQkVHSExNT1NXWVphYmNkaG1zd3l6J10rKXwoPzonKD86W14nXXwnJykqJyl8KD86R3sxLDV9fHl7MSw0fXxZezEsNH18TXsxLDV9fEx7MSw1fXx3ezEsMn18V3sxfXxkezEsMn18RXsxLDZ9fGN7MSw2fXxhezEsNX18YnsxLDV9fEJ7MSw1fXxoezEsMn18SHsxLDJ9fG17MSwyfXxzezEsMn18U3sxLDN9fHp7MSw0fXxaezEsNX18T3sxLDR9KSkoW1xcc1xcU10qKS87XG5cbmVudW0gWm9uZVdpZHRoIHtcbiAgU2hvcnQsXG4gIFNob3J0R01ULFxuICBMb25nLFxuICBFeHRlbmRlZCxcbn1cblxuZW51bSBEYXRlVHlwZSB7XG4gIEZ1bGxZZWFyLFxuICBNb250aCxcbiAgRGF0ZSxcbiAgSG91cnMsXG4gIE1pbnV0ZXMsXG4gIFNlY29uZHMsXG4gIEZyYWN0aW9uYWxTZWNvbmRzLFxuICBEYXksXG59XG5cbmVudW0gVHJhbnNsYXRpb25UeXBlIHtcbiAgRGF5UGVyaW9kcyxcbiAgRGF5cyxcbiAgTW9udGhzLFxuICBFcmFzLFxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBkYXRlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSBkYXRlIHRvIGZvcm1hdCwgYXMgYSBEYXRlLCBvciBhIG51bWJlciAobWlsbGlzZWNvbmRzIHNpbmNlIFVUQyBlcG9jaClcbiAqIG9yIGFuIFtJU08gZGF0ZS10aW1lIHN0cmluZ10oaHR0cHM6Ly93d3cudzMub3JnL1RSL05PVEUtZGF0ZXRpbWUpLlxuICogQHBhcmFtIGZvcm1hdCBUaGUgZGF0ZS10aW1lIGNvbXBvbmVudHMgdG8gaW5jbHVkZS4gU2VlIGBEYXRlUGlwZWAgZm9yIGRldGFpbHMuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB0aW1lem9uZSBUaGUgdGltZSB6b25lLiBBIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBHTVQgKHN1Y2ggYXMgYCcrMDQzMCdgKS5cbiAqIElmIG5vdCBzcGVjaWZpZWQsIHVzZXMgaG9zdCBzeXN0ZW0gc2V0dGluZ3MuXG4gKlxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBkYXRlIHN0cmluZy5cbiAqXG4gKiBAc2VlIHtAbGluayBEYXRlUGlwZX1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlKFxuICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSxcbiAgZm9ybWF0OiBzdHJpbmcsXG4gIGxvY2FsZTogc3RyaW5nLFxuICB0aW1lem9uZT86IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIGxldCBkYXRlID0gdG9EYXRlKHZhbHVlKTtcbiAgY29uc3QgbmFtZWRGb3JtYXQgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsIGZvcm1hdCk7XG4gIGZvcm1hdCA9IG5hbWVkRm9ybWF0IHx8IGZvcm1hdDtcblxuICBsZXQgcGFydHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBtYXRjaDtcbiAgd2hpbGUgKGZvcm1hdCkge1xuICAgIG1hdGNoID0gREFURV9GT1JNQVRTX1NQTElULmV4ZWMoZm9ybWF0KTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHBhcnRzID0gcGFydHMuY29uY2F0KG1hdGNoLnNsaWNlKDEpKTtcbiAgICAgIGNvbnN0IHBhcnQgPSBwYXJ0cy5wb3AoKTtcbiAgICAgIGlmICghcGFydCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGZvcm1hdCA9IHBhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnB1c2goZm9ybWF0KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGxldCBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIGlmICh0aW1lem9uZSkge1xuICAgIGRhdGVUaW1lem9uZU9mZnNldCA9IHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGRhdGVUaW1lem9uZU9mZnNldCk7XG4gICAgZGF0ZSA9IGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZSwgdGltZXpvbmUsIHRydWUpO1xuICB9XG5cbiAgbGV0IHRleHQgPSAnJztcbiAgcGFydHMuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICBjb25zdCBkYXRlRm9ybWF0dGVyID0gZ2V0RGF0ZUZvcm1hdHRlcih2YWx1ZSk7XG4gICAgdGV4dCArPSBkYXRlRm9ybWF0dGVyXG4gICAgICA/IGRhdGVGb3JtYXR0ZXIoZGF0ZSwgbG9jYWxlLCBkYXRlVGltZXpvbmVPZmZzZXQpXG4gICAgICA6IHZhbHVlID09PSBcIicnXCJcbiAgICAgICAgPyBcIidcIlxuICAgICAgICA6IHZhbHVlLnJlcGxhY2UoLyheJ3wnJCkvZywgJycpLnJlcGxhY2UoLycnL2csIFwiJ1wiKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IERhdGUgb2JqZWN0IHdpdGggdGhlIGdpdmVuIGRhdGUgdmFsdWUsIGFuZCB0aGUgdGltZSBzZXQgdG8gbWlkbmlnaHQuXG4gKlxuICogV2UgY2Fubm90IHVzZSBgbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpYCBiZWNhdXNlIGl0IG1hcHMgeWVhcnMgYmV0d2VlbiAwIGFuZCA5OSB0byAxOTAwLTE5OTkuXG4gKiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzQwMzc3XG4gKlxuICogTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIERhdGUgb2JqZWN0IHdob3NlIHRpbWUgaXMgbWlkbmlnaHQgaW4gdGhlIGN1cnJlbnQgbG9jYWxlJ3NcbiAqIHRpbWV6b25lLiBJbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IHdhbnQgdG8gY2hhbmdlIHRoaXMgdG8gYmUgbWlkbmlnaHQgaW4gVVRDLCBidXQgdGhpcyB3b3VsZCBiZSBhXG4gKiBjb25zaWRlcmFibGUgYnJlYWtpbmcgY2hhbmdlLlxuICovXG5mdW5jdGlvbiBjcmVhdGVEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyKTogRGF0ZSB7XG4gIC8vIFRoZSBgbmV3RGF0ZWAgaXMgc2V0IHRvIG1pZG5pZ2h0IChVVEMpIG9uIEphbnVhcnkgMXN0IDE5NzAuXG4gIC8vIC0gSW4gUFNUIHRoaXMgd2lsbCBiZSBEZWNlbWJlciAzMXN0IDE5NjkgYXQgNHBtLlxuICAvLyAtIEluIEdNVCB0aGlzIHdpbGwgYmUgSmFudWFyeSAxc3QgMTk3MCBhdCAxYW0uXG4gIC8vIE5vdGUgdGhhdCB0aGV5IGV2ZW4gaGF2ZSBkaWZmZXJlbnQgeWVhcnMsIGRhdGVzIGFuZCBtb250aHMhXG4gIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgwKTtcblxuICAvLyBgc2V0RnVsbFllYXIoKWAgYWxsb3dzIHllYXJzIGxpa2UgMDAwMSB0byBiZSBzZXQgY29ycmVjdGx5LiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90XG4gIC8vIGNoYW5nZSB0aGUgaW50ZXJuYWwgdGltZSBvZiB0aGUgZGF0ZS5cbiAgLy8gQ29uc2lkZXIgY2FsbGluZyBgc2V0RnVsbFllYXIoMjAxOSwgOCwgMjApYCAoU2VwdGVtYmVyIDIwLCAyMDE5KS5cbiAgLy8gLSBJbiBQU1QgdGhpcyB3aWxsIG5vdyBiZSBTZXB0ZW1iZXIgMjAsIDIwMTkgYXQgNHBtXG4gIC8vIC0gSW4gR01UIHRoaXMgd2lsbCBub3cgYmUgU2VwdGVtYmVyIDIwLCAyMDE5IGF0IDFhbVxuXG4gIG5ld0RhdGUuc2V0RnVsbFllYXIoeWVhciwgbW9udGgsIGRhdGUpO1xuICAvLyBXZSB3YW50IHRoZSBmaW5hbCBkYXRlIHRvIGJlIGF0IGxvY2FsIG1pZG5pZ2h0LCBzbyB3ZSByZXNldCB0aGUgdGltZS5cbiAgLy8gLSBJbiBQU1QgdGhpcyB3aWxsIG5vdyBiZSBTZXB0ZW1iZXIgMjAsIDIwMTkgYXQgMTJhbVxuICAvLyAtIEluIEdNVCB0aGlzIHdpbGwgbm93IGJlIFNlcHRlbWJlciAyMCwgMjAxOSBhdCAxMmFtXG4gIG5ld0RhdGUuc2V0SG91cnMoMCwgMCwgMCk7XG5cbiAgcmV0dXJuIG5ld0RhdGU7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVkRm9ybWF0KGxvY2FsZTogc3RyaW5nLCBmb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxvY2FsZUlkID0gZ2V0TG9jYWxlSWQobG9jYWxlKTtcbiAgTkFNRURfRk9STUFUU1tsb2NhbGVJZF0gPz89IHt9O1xuXG4gIGlmIChOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXVtmb3JtYXRdKSB7XG4gICAgcmV0dXJuIE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdW2Zvcm1hdF07XG4gIH1cblxuICBsZXQgZm9ybWF0VmFsdWUgPSAnJztcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICBjYXNlICdzaG9ydERhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWVkaXVtRGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZ0RhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmdWxsRGF0ZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5GdWxsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3J0VGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW1UaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLk1lZGl1bSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb25nVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5Mb25nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Z1bGxUaW1lJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkZ1bGwpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2hvcnQnOlxuICAgICAgY29uc3Qgc2hvcnRUaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnc2hvcnRUaW1lJyk7XG4gICAgICBjb25zdCBzaG9ydERhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdzaG9ydERhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID0gZm9ybWF0RGF0ZVRpbWUoZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5TaG9ydCksIFtcbiAgICAgICAgc2hvcnRUaW1lLFxuICAgICAgICBzaG9ydERhdGUsXG4gICAgICBdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICBjb25zdCBtZWRpdW1UaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbWVkaXVtVGltZScpO1xuICAgICAgY29uc3QgbWVkaXVtRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ21lZGl1bURhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID0gZm9ybWF0RGF0ZVRpbWUoZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pLCBbXG4gICAgICAgIG1lZGl1bVRpbWUsXG4gICAgICAgIG1lZGl1bURhdGUsXG4gICAgICBdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmcnOlxuICAgICAgY29uc3QgbG9uZ1RpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdsb25nVGltZScpO1xuICAgICAgY29uc3QgbG9uZ0RhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdsb25nRGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPSBmb3JtYXREYXRlVGltZShnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkxvbmcpLCBbXG4gICAgICAgIGxvbmdUaW1lLFxuICAgICAgICBsb25nRGF0ZSxcbiAgICAgIF0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbCc6XG4gICAgICBjb25zdCBmdWxsVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2Z1bGxUaW1lJyk7XG4gICAgICBjb25zdCBmdWxsRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2Z1bGxEYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9IGZvcm1hdERhdGVUaW1lKGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCksIFtcbiAgICAgICAgZnVsbFRpbWUsXG4gICAgICAgIGZ1bGxEYXRlLFxuICAgICAgXSk7XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoZm9ybWF0VmFsdWUpIHtcbiAgICBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXVtmb3JtYXRdID0gZm9ybWF0VmFsdWU7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdFZhbHVlO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlVGltZShzdHI6IHN0cmluZywgb3B0X3ZhbHVlczogc3RyaW5nW10pIHtcbiAgaWYgKG9wdF92YWx1ZXMpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFx7KFtefV0rKX0vZywgZnVuY3Rpb24gKG1hdGNoLCBrZXkpIHtcbiAgICAgIHJldHVybiBvcHRfdmFsdWVzICE9IG51bGwgJiYga2V5IGluIG9wdF92YWx1ZXMgPyBvcHRfdmFsdWVzW2tleV0gOiBtYXRjaDtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBwYWROdW1iZXIoXG4gIG51bTogbnVtYmVyLFxuICBkaWdpdHM6IG51bWJlcixcbiAgbWludXNTaWduID0gJy0nLFxuICB0cmltPzogYm9vbGVhbixcbiAgbmVnV3JhcD86IGJvb2xlYW4sXG4pOiBzdHJpbmcge1xuICBsZXQgbmVnID0gJyc7XG4gIGlmIChudW0gPCAwIHx8IChuZWdXcmFwICYmIG51bSA8PSAwKSkge1xuICAgIGlmIChuZWdXcmFwKSB7XG4gICAgICBudW0gPSAtbnVtICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtID0gLW51bTtcbiAgICAgIG5lZyA9IG1pbnVzU2lnbjtcbiAgICB9XG4gIH1cbiAgbGV0IHN0ck51bSA9IFN0cmluZyhudW0pO1xuICB3aGlsZSAoc3RyTnVtLmxlbmd0aCA8IGRpZ2l0cykge1xuICAgIHN0ck51bSA9ICcwJyArIHN0ck51bTtcbiAgfVxuICBpZiAodHJpbSkge1xuICAgIHN0ck51bSA9IHN0ck51bS5zbGljZShzdHJOdW0ubGVuZ3RoIC0gZGlnaXRzKTtcbiAgfVxuICByZXR1cm4gbmVnICsgc3RyTnVtO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRGcmFjdGlvbmFsU2Vjb25kcyhtaWxsaXNlY29uZHM6IG51bWJlciwgZGlnaXRzOiBudW1iZXIpOiBzdHJpbmcge1xuICBjb25zdCBzdHJNcyA9IHBhZE51bWJlcihtaWxsaXNlY29uZHMsIDMpO1xuICByZXR1cm4gc3RyTXMuc3Vic3RyaW5nKDAsIGRpZ2l0cyk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGRhdGUgZm9ybWF0dGVyIHRoYXQgdHJhbnNmb3JtcyBhIGRhdGUgaW50byBpdHMgbG9jYWxlIGRpZ2l0IHJlcHJlc2VudGF0aW9uXG4gKi9cbmZ1bmN0aW9uIGRhdGVHZXR0ZXIoXG4gIG5hbWU6IERhdGVUeXBlLFxuICBzaXplOiBudW1iZXIsXG4gIG9mZnNldDogbnVtYmVyID0gMCxcbiAgdHJpbSA9IGZhbHNlLFxuICBuZWdXcmFwID0gZmFsc2UsXG4pOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHBhcnQgPSBnZXREYXRlUGFydChuYW1lLCBkYXRlKTtcbiAgICBpZiAob2Zmc2V0ID4gMCB8fCBwYXJ0ID4gLW9mZnNldCkge1xuICAgICAgcGFydCArPSBvZmZzZXQ7XG4gICAgfVxuXG4gICAgaWYgKG5hbWUgPT09IERhdGVUeXBlLkhvdXJzKSB7XG4gICAgICBpZiAocGFydCA9PT0gMCAmJiBvZmZzZXQgPT09IC0xMikge1xuICAgICAgICBwYXJ0ID0gMTI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChuYW1lID09PSBEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kcykge1xuICAgICAgcmV0dXJuIGZvcm1hdEZyYWN0aW9uYWxTZWNvbmRzKHBhcnQsIHNpemUpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsZU1pbnVzID0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbik7XG4gICAgcmV0dXJuIHBhZE51bWJlcihwYXJ0LCBzaXplLCBsb2NhbGVNaW51cywgdHJpbSwgbmVnV3JhcCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldERhdGVQYXJ0KHBhcnQ6IERhdGVUeXBlLCBkYXRlOiBEYXRlKTogbnVtYmVyIHtcbiAgc3dpdGNoIChwYXJ0KSB7XG4gICAgY2FzZSBEYXRlVHlwZS5GdWxsWWVhcjpcbiAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5Nb250aDpcbiAgICAgIHJldHVybiBkYXRlLmdldE1vbnRoKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5EYXRlOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0RGF0ZSgpO1xuICAgIGNhc2UgRGF0ZVR5cGUuSG91cnM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRIb3VycygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuTWludXRlczpcbiAgICAgIHJldHVybiBkYXRlLmdldE1pbnV0ZXMoKTtcbiAgICBjYXNlIERhdGVUeXBlLlNlY29uZHM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRTZWNvbmRzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kczpcbiAgICAgIHJldHVybiBkYXRlLmdldE1pbGxpc2Vjb25kcygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuRGF5OlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0RGF5KCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBEYXRlVHlwZSB2YWx1ZSBcIiR7cGFydH1cIi5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHRyYW5zZm9ybXMgYSBkYXRlIGludG8gaXRzIGxvY2FsZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAqL1xuZnVuY3Rpb24gZGF0ZVN0ckdldHRlcihcbiAgbmFtZTogVHJhbnNsYXRpb25UeXBlLFxuICB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCxcbiAgZm9ybTogRm9ybVN0eWxlID0gRm9ybVN0eWxlLkZvcm1hdCxcbiAgZXh0ZW5kZWQgPSBmYWxzZSxcbik6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24gKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZ2V0RGF0ZVRyYW5zbGF0aW9uKGRhdGUsIGxvY2FsZSwgbmFtZSwgd2lkdGgsIGZvcm0sIGV4dGVuZGVkKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsb2NhbGUgdHJhbnNsYXRpb24gb2YgYSBkYXRlIGZvciBhIGdpdmVuIGZvcm0sIHR5cGUgYW5kIHdpZHRoXG4gKi9cbmZ1bmN0aW9uIGdldERhdGVUcmFuc2xhdGlvbihcbiAgZGF0ZTogRGF0ZSxcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIG5hbWU6IFRyYW5zbGF0aW9uVHlwZSxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4gIGZvcm06IEZvcm1TdHlsZSxcbiAgZXh0ZW5kZWQ6IGJvb2xlYW4sXG4pIHtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuTW9udGhzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZU1vbnRoTmFtZXMobG9jYWxlLCBmb3JtLCB3aWR0aClbZGF0ZS5nZXRNb250aCgpXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5EYXlzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZURheU5hbWVzKGxvY2FsZSwgZm9ybSwgd2lkdGgpW2RhdGUuZ2V0RGF5KCldO1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHM6XG4gICAgICBjb25zdCBjdXJyZW50SG91cnMgPSBkYXRlLmdldEhvdXJzKCk7XG4gICAgICBjb25zdCBjdXJyZW50TWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpO1xuICAgICAgaWYgKGV4dGVuZGVkKSB7XG4gICAgICAgIGNvbnN0IHJ1bGVzID0gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcyhsb2NhbGUpO1xuICAgICAgICBjb25zdCBkYXlQZXJpb2RzID0gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzKGxvY2FsZSwgZm9ybSwgd2lkdGgpO1xuICAgICAgICBjb25zdCBpbmRleCA9IHJ1bGVzLmZpbmRJbmRleCgocnVsZSkgPT4ge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJ1bGUpKSB7XG4gICAgICAgICAgICAvLyBtb3JuaW5nLCBhZnRlcm5vb24sIGV2ZW5pbmcsIG5pZ2h0XG4gICAgICAgICAgICBjb25zdCBbZnJvbSwgdG9dID0gcnVsZTtcbiAgICAgICAgICAgIGNvbnN0IGFmdGVyRnJvbSA9IGN1cnJlbnRIb3VycyA+PSBmcm9tLmhvdXJzICYmIGN1cnJlbnRNaW51dGVzID49IGZyb20ubWludXRlcztcbiAgICAgICAgICAgIGNvbnN0IGJlZm9yZVRvID1cbiAgICAgICAgICAgICAgY3VycmVudEhvdXJzIDwgdG8uaG91cnMgfHwgKGN1cnJlbnRIb3VycyA9PT0gdG8uaG91cnMgJiYgY3VycmVudE1pbnV0ZXMgPCB0by5taW51dGVzKTtcbiAgICAgICAgICAgIC8vIFdlIG11c3QgYWNjb3VudCBmb3Igbm9ybWFsIHJ1bGVzIHRoYXQgc3BhbiBhIHBlcmlvZCBkdXJpbmcgdGhlIGRheSAoZS5nLiA2YW0tOWFtKVxuICAgICAgICAgICAgLy8gd2hlcmUgYGZyb21gIGlzIGxlc3MgKGVhcmxpZXIpIHRoYW4gYHRvYC4gQnV0IGFsc28gcnVsZXMgdGhhdCBzcGFuIG1pZG5pZ2h0IChlLmcuXG4gICAgICAgICAgICAvLyAxMHBtIC0gNWFtKSB3aGVyZSBgZnJvbWAgaXMgZ3JlYXRlciAobGF0ZXIhKSB0aGFuIGB0b2AuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gSW4gdGhlIGZpcnN0IGNhc2UgdGhlIGN1cnJlbnQgdGltZSBtdXN0IGJlIEJPVEggYWZ0ZXIgYGZyb21gIEFORCBiZWZvcmUgYHRvYFxuICAgICAgICAgICAgLy8gKGUuZy4gOGFtIGlzIGFmdGVyIDZhbSBBTkQgYmVmb3JlIDEwYW0pLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEluIHRoZSBzZWNvbmQgY2FzZSB0aGUgY3VycmVudCB0aW1lIG11c3QgYmUgRUlUSEVSIGFmdGVyIGBmcm9tYCBPUiBiZWZvcmUgYHRvYFxuICAgICAgICAgICAgLy8gKGUuZy4gNGFtIGlzIGJlZm9yZSA1YW0gYnV0IG5vdCBhZnRlciAxMHBtOyBhbmQgMTFwbSBpcyBub3QgYmVmb3JlIDVhbSBidXQgaXQgaXNcbiAgICAgICAgICAgIC8vIGFmdGVyIDEwcG0pLlxuICAgICAgICAgICAgaWYgKGZyb20uaG91cnMgPCB0by5ob3Vycykge1xuICAgICAgICAgICAgICBpZiAoYWZ0ZXJGcm9tICYmIGJlZm9yZVRvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWZ0ZXJGcm9tIHx8IGJlZm9yZVRvKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBub29uIG9yIG1pZG5pZ2h0XG4gICAgICAgICAgICBpZiAocnVsZS5ob3VycyA9PT0gY3VycmVudEhvdXJzICYmIHJ1bGUubWludXRlcyA9PT0gY3VycmVudE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gZGF5UGVyaW9kc1tpbmRleF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGlmIG5vIHJ1bGVzIGZvciB0aGUgZGF5IHBlcmlvZHMsIHdlIHVzZSBhbS9wbSBieSBkZWZhdWx0XG4gICAgICByZXR1cm4gZ2V0TG9jYWxlRGF5UGVyaW9kcyhsb2NhbGUsIGZvcm0sIDxUcmFuc2xhdGlvbldpZHRoPndpZHRoKVtjdXJyZW50SG91cnMgPCAxMiA/IDAgOiAxXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5FcmFzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZUVyYU5hbWVzKGxvY2FsZSwgPFRyYW5zbGF0aW9uV2lkdGg+d2lkdGgpW2RhdGUuZ2V0RnVsbFllYXIoKSA8PSAwID8gMCA6IDFdO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBUaGlzIGRlZmF1bHQgY2FzZSBpcyBub3QgbmVlZGVkIGJ5IFR5cGVTY3JpcHQgY29tcGlsZXIsIGFzIHRoZSBzd2l0Y2ggaXMgZXhoYXVzdGl2ZS5cbiAgICAgIC8vIEhvd2V2ZXIgQ2xvc3VyZSBDb21waWxlciBkb2VzIG5vdCB1bmRlcnN0YW5kIHRoYXQgYW5kIHJlcG9ydHMgYW4gZXJyb3IgaW4gdHlwZWQgbW9kZS5cbiAgICAgIC8vIFRoZSBgdGhyb3cgbmV3IEVycm9yYCBiZWxvdyB3b3JrcyBhcm91bmQgdGhlIHByb2JsZW0sIGFuZCB0aGUgdW5leHBlY3RlZDogbmV2ZXIgdmFyaWFibGVcbiAgICAgIC8vIG1ha2VzIHN1cmUgdHNjIHN0aWxsIGNoZWNrcyB0aGlzIGNvZGUgaXMgdW5yZWFjaGFibGUuXG4gICAgICBjb25zdCB1bmV4cGVjdGVkOiBuZXZlciA9IG5hbWU7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuZXhwZWN0ZWQgdHJhbnNsYXRpb24gdHlwZSAke3VuZXhwZWN0ZWR9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBhbmQgYW4gb2Zmc2V0IGludG8gYSB0aW1lem9uZSB3aXRoIElTTzg2MDEgb3JcbiAqIEdNVCBmb3JtYXQgZGVwZW5kaW5nIG9uIHRoZSB3aWR0aCAoZWc6IHNob3J0ID0gKzA0MzAsIHNob3J0OkdNVCA9IEdNVCs0LCBsb25nID0gR01UKzA0OjMwLFxuICogZXh0ZW5kZWQgPSArMDQ6MzApXG4gKi9cbmZ1bmN0aW9uIHRpbWVab25lR2V0dGVyKHdpZHRoOiBab25lV2lkdGgpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpIHtcbiAgICBjb25zdCB6b25lID0gLTEgKiBvZmZzZXQ7XG4gICAgY29uc3QgbWludXNTaWduID0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbik7XG4gICAgY29uc3QgaG91cnMgPSB6b25lID4gMCA/IE1hdGguZmxvb3Ioem9uZSAvIDYwKSA6IE1hdGguY2VpbCh6b25lIC8gNjApO1xuICAgIHN3aXRjaCAod2lkdGgpIHtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLlNob3J0OlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICh6b25lID49IDAgPyAnKycgOiAnJykgK1xuICAgICAgICAgIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArXG4gICAgICAgICAgcGFkTnVtYmVyKE1hdGguYWJzKHpvbmUgJSA2MCksIDIsIG1pbnVzU2lnbilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLlNob3J0R01UOlxuICAgICAgICByZXR1cm4gJ0dNVCcgKyAoem9uZSA+PSAwID8gJysnIDogJycpICsgcGFkTnVtYmVyKGhvdXJzLCAxLCBtaW51c1NpZ24pO1xuICAgICAgY2FzZSBab25lV2lkdGguTG9uZzpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAnR01UJyArXG4gICAgICAgICAgKHpvbmUgPj0gMCA/ICcrJyA6ICcnKSArXG4gICAgICAgICAgcGFkTnVtYmVyKGhvdXJzLCAyLCBtaW51c1NpZ24pICtcbiAgICAgICAgICAnOicgK1xuICAgICAgICAgIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyLCBtaW51c1NpZ24pXG4gICAgICAgICk7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5FeHRlbmRlZDpcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiAnWic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICh6b25lID49IDAgPyAnKycgOiAnJykgK1xuICAgICAgICAgICAgcGFkTnVtYmVyKGhvdXJzLCAyLCBtaW51c1NpZ24pICtcbiAgICAgICAgICAgICc6JyArXG4gICAgICAgICAgICBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMiwgbWludXNTaWduKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB6b25lIHdpZHRoIFwiJHt3aWR0aH1cImApO1xuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgSkFOVUFSWSA9IDA7XG5jb25zdCBUSFVSU0RBWSA9IDQ7XG5mdW5jdGlvbiBnZXRGaXJzdFRodXJzZGF5T2ZZZWFyKHllYXI6IG51bWJlcikge1xuICBjb25zdCBmaXJzdERheU9mWWVhciA9IGNyZWF0ZURhdGUoeWVhciwgSkFOVUFSWSwgMSkuZ2V0RGF5KCk7XG4gIHJldHVybiBjcmVhdGVEYXRlKFxuICAgIHllYXIsXG4gICAgMCxcbiAgICAxICsgKGZpcnN0RGF5T2ZZZWFyIDw9IFRIVVJTREFZID8gVEhVUlNEQVkgOiBUSFVSU0RBWSArIDcpIC0gZmlyc3REYXlPZlllYXIsXG4gICk7XG59XG5cbi8qKlxuICogIElTTyBXZWVrIHN0YXJ0cyBvbiBkYXkgMSAoTW9uZGF5KSBhbmQgZW5kcyB3aXRoIGRheSAwIChTdW5kYXkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUaHVyc2RheVRoaXNJc29XZWVrKGRhdGV0aW1lOiBEYXRlKSB7XG4gIC8vIGdldERheSByZXR1cm5zIDAtNiByYW5nZSB3aXRoIHN1bmRheSBhcyAwLlxuICBjb25zdCBjdXJyZW50RGF5ID0gZGF0ZXRpbWUuZ2V0RGF5KCk7XG5cbiAgLy8gT24gYSBTdW5kYXksIHJlYWQgdGhlIHByZXZpb3VzIFRodXJzZGF5IHNpbmNlIElTTyB3ZWVrcyBzdGFydCBvbiBNb25kYXkuXG4gIGNvbnN0IGRlbHRhVG9UaHVyc2RheSA9IGN1cnJlbnREYXkgPT09IDAgPyAtMyA6IFRIVVJTREFZIC0gY3VycmVudERheTtcblxuICByZXR1cm4gY3JlYXRlRGF0ZShcbiAgICBkYXRldGltZS5nZXRGdWxsWWVhcigpLFxuICAgIGRhdGV0aW1lLmdldE1vbnRoKCksXG4gICAgZGF0ZXRpbWUuZ2V0RGF0ZSgpICsgZGVsdGFUb1RodXJzZGF5LFxuICApO1xufVxuXG5mdW5jdGlvbiB3ZWVrR2V0dGVyKHNpemU6IG51bWJlciwgbW9udGhCYXNlZCA9IGZhbHNlKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmIChtb250aEJhc2VkKSB7XG4gICAgICBjb25zdCBuYkRheXNCZWZvcmUxc3REYXlPZk1vbnRoID1cbiAgICAgICAgbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpLmdldERheSgpIC0gMTtcbiAgICAgIGNvbnN0IHRvZGF5ID0gZGF0ZS5nZXREYXRlKCk7XG4gICAgICByZXN1bHQgPSAxICsgTWF0aC5mbG9vcigodG9kYXkgKyBuYkRheXNCZWZvcmUxc3REYXlPZk1vbnRoKSAvIDcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0aGlzVGh1cnMgPSBnZXRUaHVyc2RheVRoaXNJc29XZWVrKGRhdGUpO1xuICAgICAgLy8gU29tZSBkYXlzIG9mIGEgeWVhciBhcmUgcGFydCBvZiBuZXh0IHllYXIgYWNjb3JkaW5nIHRvIElTTyA4NjAxLlxuICAgICAgLy8gQ29tcHV0ZSB0aGUgZmlyc3RUaHVycyBmcm9tIHRoZSB5ZWFyIG9mIHRoaXMgd2VlaydzIFRodXJzZGF5XG4gICAgICBjb25zdCBmaXJzdFRodXJzID0gZ2V0Rmlyc3RUaHVyc2RheU9mWWVhcih0aGlzVGh1cnMuZ2V0RnVsbFllYXIoKSk7XG4gICAgICBjb25zdCBkaWZmID0gdGhpc1RodXJzLmdldFRpbWUoKSAtIGZpcnN0VGh1cnMuZ2V0VGltZSgpO1xuICAgICAgcmVzdWx0ID0gMSArIE1hdGgucm91bmQoZGlmZiAvIDYuMDQ4ZTgpOyAvLyA2LjA0OGU4IG1zIHBlciB3ZWVrXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhZE51bWJlcihyZXN1bHQsIHNpemUsIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCBwcm92aWRlcyB0aGUgd2Vlay1udW1iZXJpbmcgeWVhciBmb3IgdGhlIGlucHV0IGRhdGUuXG4gKi9cbmZ1bmN0aW9uIHdlZWtOdW1iZXJpbmdZZWFyR2V0dGVyKHNpemU6IG51bWJlciwgdHJpbSA9IGZhbHNlKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0aGlzVGh1cnMgPSBnZXRUaHVyc2RheVRoaXNJc29XZWVrKGRhdGUpO1xuICAgIGNvbnN0IHdlZWtOdW1iZXJpbmdZZWFyID0gdGhpc1RodXJzLmdldEZ1bGxZZWFyKCk7XG4gICAgcmV0dXJuIHBhZE51bWJlcihcbiAgICAgIHdlZWtOdW1iZXJpbmdZZWFyLFxuICAgICAgc2l6ZSxcbiAgICAgIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pLFxuICAgICAgdHJpbSxcbiAgICApO1xuICB9O1xufVxuXG50eXBlIERhdGVGb3JtYXR0ZXIgPSAoZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKSA9PiBzdHJpbmc7XG5cbmNvbnN0IERBVEVfRk9STUFUUzoge1tmb3JtYXQ6IHN0cmluZ106IERhdGVGb3JtYXR0ZXJ9ID0ge307XG5cbi8vIEJhc2VkIG9uIENMRFIgZm9ybWF0czpcbi8vIFNlZSBjb21wbGV0ZSBsaXN0OiBodHRwOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9GaWVsZF9TeW1ib2xfVGFibGVcbi8vIFNlZSBhbHNvIGV4cGxhbmF0aW9uczogaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vZGF0ZS10aW1lXG4vLyBUT0RPKG9jb21iZSk6IHN1cHBvcnQgYWxsIG1pc3NpbmcgY2xkciBmb3JtYXRzOiBVLCBRLCBELCBGLCBlLCBqLCBKLCBDLCBBLCB2LCBWLCBYLCB4XG5mdW5jdGlvbiBnZXREYXRlRm9ybWF0dGVyKGZvcm1hdDogc3RyaW5nKTogRGF0ZUZvcm1hdHRlciB8IG51bGwge1xuICBpZiAoREFURV9GT1JNQVRTW2Zvcm1hdF0pIHtcbiAgICByZXR1cm4gREFURV9GT1JNQVRTW2Zvcm1hdF07XG4gIH1cbiAgbGV0IGZvcm1hdHRlcjtcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAvLyBFcmEgbmFtZSAoQUQvQkMpXG4gICAgY2FzZSAnRyc6XG4gICAgY2FzZSAnR0cnOlxuICAgIGNhc2UgJ0dHRyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5FcmFzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dHR0cnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRXJhcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dHR0dHJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkVyYXMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gMSBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgZS5nLiAoQUQgMSA9PiAxLCBBRCAxOTkgPT4gMTk5KVxuICAgIGNhc2UgJ3knOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMSwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gMiBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgcGFkZGVkICgwMC05OSkuIChlLmcuIEFEIDIwMDEgPT4gMDEsIEFEIDIwMTAgPT4gMTApXG4gICAgY2FzZSAneXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMiwgMCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyAzIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyLCBwYWRkZWQgKDAwMC05OTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRCAyMDEwID0+IDEwKVxuICAgIGNhc2UgJ3l5eSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZ1bGxZZWFyLCAzLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyA0IGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyIChlLmcuIEFEIDEgPT4gMDAwMSwgQUQgMjAxMCA9PiAyMDEwKVxuICAgIGNhc2UgJ3l5eXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgNCwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyAxIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB3ZWVrLW51bWJlcmluZyB5ZWFyLCBlLmcuIChBRCAxID0+IDEsIEFEIDE5OSA9PiAxOTkpXG4gICAgY2FzZSAnWSc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrTnVtYmVyaW5nWWVhckdldHRlcigxKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDIgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHdlZWstbnVtYmVyaW5nIHllYXIsIHBhZGRlZCAoMDAtOTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRFxuICAgIC8vIDIwMTAgPT4gMTApXG4gICAgY2FzZSAnWVknOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla051bWJlcmluZ1llYXJHZXR0ZXIoMiwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyAzIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB3ZWVrLW51bWJlcmluZyB5ZWFyLCBwYWRkZWQgKDAwMC05OTkpLiAoZS5nLiBBRCAxID0+IDAwMSwgQURcbiAgICAvLyAyMDEwID0+IDIwMTApXG4gICAgY2FzZSAnWVlZJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtOdW1iZXJpbmdZZWFyR2V0dGVyKDMpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gNCBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgd2Vlay1udW1iZXJpbmcgeWVhciAoZS5nLiBBRCAxID0+IDAwMDEsIEFEIDIwMTAgPT4gMjAxMClcbiAgICBjYXNlICdZWVlZJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtOdW1iZXJpbmdZZWFyR2V0dGVyKDQpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoMS0xMiksIG51bWVyaWNcbiAgICBjYXNlICdNJzpcbiAgICBjYXNlICdMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTW9udGgsIDEsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTU0nOlxuICAgIGNhc2UgJ0xMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTW9udGgsIDIsIDEpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoSmFudWFyeSwgLi4uKSwgc3RyaW5nLCBmb3JtYXRcbiAgICBjYXNlICdNTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTU1NTU0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuTW9udGhzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIE1vbnRoIG9mIHRoZSB5ZWFyIChKYW51YXJ5LCAuLi4pLCBzdHJpbmcsIHN0YW5kYWxvbmVcbiAgICBjYXNlICdMTEwnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLk1vbnRocyxcbiAgICAgICAgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCxcbiAgICAgICAgRm9ybVN0eWxlLlN0YW5kYWxvbmUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTExMTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICBUcmFuc2xhdGlvblR5cGUuTW9udGhzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLldpZGUsXG4gICAgICAgIEZvcm1TdHlsZS5TdGFuZGFsb25lLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xMTExMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LFxuICAgICAgICBGb3JtU3R5bGUuU3RhbmRhbG9uZSxcbiAgICAgICk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFdlZWsgb2YgdGhlIHllYXIgKDEsIC4uLiA1MilcbiAgICBjYXNlICd3JzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtHZXR0ZXIoMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3dyc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrR2V0dGVyKDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBXZWVrIG9mIHRoZSBtb250aCAoMSwgLi4uKVxuICAgIGNhc2UgJ1cnOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla0dldHRlcigxLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRGF5IG9mIHRoZSBtb250aCAoMS0zMSlcbiAgICBjYXNlICdkJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRGF0ZSwgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkRhdGUsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBEYXkgb2YgdGhlIFdlZWsgU3RhbmRBbG9uZSAoMSwgMSwgTW9uLCBNb25kYXksIE0sIE1vKVxuICAgIGNhc2UgJ2MnOlxuICAgIGNhc2UgJ2NjJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRGF5LCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NjYyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5cyxcbiAgICAgICAgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCxcbiAgICAgICAgRm9ybVN0eWxlLlN0YW5kYWxvbmUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2NjYyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUsIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NjY2NjJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyxcbiAgICAgICAgRm9ybVN0eWxlLlN0YW5kYWxvbmUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2NjY2NjJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguU2hvcnQsIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRGF5IG9mIHRoZSBXZWVrXG4gICAgY2FzZSAnRSc6XG4gICAgY2FzZSAnRUUnOlxuICAgIGNhc2UgJ0VFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VFRUVFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gR2VuZXJpYyBwZXJpb2Qgb2YgdGhlIGRheSAoYW0tcG0pXG4gICAgY2FzZSAnYSc6XG4gICAgY2FzZSAnYWEnOlxuICAgIGNhc2UgJ2FhYSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FhYWEnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FhYWFhJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRXh0ZW5kZWQgcGVyaW9kIG9mIHRoZSBkYXkgKG1pZG5pZ2h0LCBhdCBuaWdodCwgLi4uKSwgc3RhbmRhbG9uZVxuICAgIGNhc2UgJ2InOlxuICAgIGNhc2UgJ2JiJzpcbiAgICBjYXNlICdiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsXG4gICAgICAgIEZvcm1TdHlsZS5TdGFuZGFsb25lLFxuICAgICAgICB0cnVlLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguV2lkZSxcbiAgICAgICAgRm9ybVN0eWxlLlN0YW5kYWxvbmUsXG4gICAgICAgIHRydWUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmJiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LFxuICAgICAgICBGb3JtU3R5bGUuU3RhbmRhbG9uZSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEV4dGVuZGVkIHBlcmlvZCBvZiB0aGUgZGF5IChtaWRuaWdodCwgbmlnaHQsIC4uLiksIHN0YW5kYWxvbmVcbiAgICBjYXNlICdCJzpcbiAgICBjYXNlICdCQic6XG4gICAgY2FzZSAnQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkLFxuICAgICAgICBGb3JtU3R5bGUuRm9ybWF0LFxuICAgICAgICB0cnVlLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0JCQkInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguV2lkZSxcbiAgICAgICAgRm9ybVN0eWxlLkZvcm1hdCxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdCQkJCQic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcyxcbiAgICAgICAgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3csXG4gICAgICAgIEZvcm1TdHlsZS5Gb3JtYXQsXG4gICAgICAgIHRydWUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBIb3VyIGluIEFNL1BNLCAoMS0xMilcbiAgICBjYXNlICdoJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDEsIC0xMik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdoaCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAyLCAtMTIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBIb3VyIG9mIHRoZSBkYXkgKDAtMjMpXG4gICAgY2FzZSAnSCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIEhvdXIgaW4gZGF5LCBwYWRkZWQgKDAwLTIzKVxuICAgIGNhc2UgJ0hIJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNaW51dGUgb2YgdGhlIGhvdXIgKDAtNTkpXG4gICAgY2FzZSAnbSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1pbnV0ZXMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5NaW51dGVzLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gU2Vjb25kIG9mIHRoZSBtaW51dGUgKDAtNTkpXG4gICAgY2FzZSAncyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLlNlY29uZHMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5TZWNvbmRzLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRnJhY3Rpb25hbCBzZWNvbmRcbiAgICBjYXNlICdTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kcywgMik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdTU1MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kcywgMyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFRpbWV6b25lIElTTzg2MDEgc2hvcnQgZm9ybWF0ICgtMDQzMClcbiAgICBjYXNlICdaJzpcbiAgICBjYXNlICdaWic6XG4gICAgY2FzZSAnWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcbiAgICAvLyBUaW1lem9uZSBJU084NjAxIGV4dGVuZGVkIGZvcm1hdCAoLTA0OjMwKVxuICAgIGNhc2UgJ1paWlpaJzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5FeHRlbmRlZCk7XG4gICAgICBicmVhaztcblxuICAgIC8vIFRpbWV6b25lIEdNVCBzaG9ydCBmb3JtYXQgKEdNVCs0KVxuICAgIGNhc2UgJ08nOlxuICAgIGNhc2UgJ09PJzpcbiAgICBjYXNlICdPT08nOlxuICAgIC8vIFNob3VsZCBiZSBsb2NhdGlvbiwgYnV0IGZhbGxiYWNrIHRvIGZvcm1hdCBPIGluc3RlYWQgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRoZSBkYXRhIHlldFxuICAgIGNhc2UgJ3onOlxuICAgIGNhc2UgJ3p6JzpcbiAgICBjYXNlICd6enonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLlNob3J0R01UKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRpbWV6b25lIEdNVCBsb25nIGZvcm1hdCAoR01UKzA0MzApXG4gICAgY2FzZSAnT09PTyc6XG4gICAgY2FzZSAnWlpaWic6XG4gICAgLy8gU2hvdWxkIGJlIGxvY2F0aW9uLCBidXQgZmFsbGJhY2sgdG8gZm9ybWF0IE8gaW5zdGVhZCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGRhdGEgeWV0XG4gICAgY2FzZSAnenp6eic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgREFURV9GT1JNQVRTW2Zvcm1hdF0gPSBmb3JtYXR0ZXI7XG4gIHJldHVybiBmb3JtYXR0ZXI7XG59XG5cbmZ1bmN0aW9uIHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmU6IHN0cmluZywgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gIC8vIFN1cHBvcnQ6IElFIDExIG9ubHksIEVkZ2UgMTMtMTUrXG4gIC8vIElFL0VkZ2UgZG8gbm90IFwidW5kZXJzdGFuZFwiIGNvbG9uIChgOmApIGluIHRpbWV6b25lXG4gIHRpbWV6b25lID0gdGltZXpvbmUucmVwbGFjZSgvOi9nLCAnJyk7XG4gIGNvbnN0IHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0ID0gRGF0ZS5wYXJzZSgnSmFuIDAxLCAxOTcwIDAwOjAwOjAwICcgKyB0aW1lem9uZSkgLyA2MDAwMDtcbiAgcmV0dXJuIGlzTmFOKHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0KSA/IGZhbGxiYWNrIDogcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQ7XG59XG5cbmZ1bmN0aW9uIGFkZERhdGVNaW51dGVzKGRhdGU6IERhdGUsIG1pbnV0ZXM6IG51bWJlcikge1xuICBkYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO1xuICBkYXRlLnNldE1pbnV0ZXMoZGF0ZS5nZXRNaW51dGVzKCkgKyBtaW51dGVzKTtcbiAgcmV0dXJuIGRhdGU7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZTogRGF0ZSwgdGltZXpvbmU6IHN0cmluZywgcmV2ZXJzZTogYm9vbGVhbik6IERhdGUge1xuICBjb25zdCByZXZlcnNlVmFsdWUgPSByZXZlcnNlID8gLTEgOiAxO1xuICBjb25zdCBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIGNvbnN0IHRpbWV6b25lT2Zmc2V0ID0gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZSwgZGF0ZVRpbWV6b25lT2Zmc2V0KTtcbiAgcmV0dXJuIGFkZERhdGVNaW51dGVzKGRhdGUsIHJldmVyc2VWYWx1ZSAqICh0aW1lem9uZU9mZnNldCAtIGRhdGVUaW1lem9uZU9mZnNldCkpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgdmFsdWUgdG8gZGF0ZS5cbiAqXG4gKiBTdXBwb3J0ZWQgaW5wdXQgZm9ybWF0czpcbiAqIC0gYERhdGVgXG4gKiAtIG51bWJlcjogdGltZXN0YW1wXG4gKiAtIHN0cmluZzogbnVtZXJpYyAoZS5nLiBcIjEyMzRcIiksIElTTyBhbmQgZGF0ZSBzdHJpbmdzIGluIGEgZm9ybWF0IHN1cHBvcnRlZCBieVxuICogICBbRGF0ZS5wYXJzZSgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9EYXRlL3BhcnNlKS5cbiAqICAgTm90ZTogSVNPIHN0cmluZ3Mgd2l0aG91dCB0aW1lIHJldHVybiBhIGRhdGUgd2l0aG91dCB0aW1lb2Zmc2V0LlxuICpcbiAqIFRocm93cyBpZiB1bmFibGUgdG8gY29udmVydCB0byBhIGRhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0RhdGUodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IERhdGUpOiBEYXRlIHtcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS50cmltKCk7XG5cbiAgICBpZiAoL14oXFxkezR9KC1cXGR7MSwyfSgtXFxkezEsMn0pPyk/KSQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAvKiBGb3IgSVNPIFN0cmluZ3Mgd2l0aG91dCB0aW1lIHRoZSBkYXksIG1vbnRoIGFuZCB5ZWFyIG11c3QgYmUgZXh0cmFjdGVkIGZyb20gdGhlIElTTyBTdHJpbmdcbiAgICAgIGJlZm9yZSBEYXRlIGNyZWF0aW9uIHRvIGF2b2lkIHRpbWUgb2Zmc2V0IGFuZCBlcnJvcnMgaW4gdGhlIG5ldyBEYXRlLlxuICAgICAgSWYgd2Ugb25seSByZXBsYWNlICctJyB3aXRoICcsJyBpbiB0aGUgSVNPIFN0cmluZyAoXCIyMDE1LDAxLDAxXCIpLCBhbmQgdHJ5IHRvIGNyZWF0ZSBhIG5ld1xuICAgICAgZGF0ZSwgc29tZSBicm93c2VycyAoZS5nLiBJRSA5KSB3aWxsIHRocm93IGFuIGludmFsaWQgRGF0ZSBlcnJvci5cbiAgICAgIElmIHdlIGxlYXZlIHRoZSAnLScgKFwiMjAxNS0wMS0wMVwiKSBhbmQgdHJ5IHRvIGNyZWF0ZSBhIG5ldyBEYXRlKFwiMjAxNS0wMS0wMVwiKSB0aGUgdGltZW9mZnNldFxuICAgICAgaXMgYXBwbGllZC5cbiAgICAgIE5vdGU6IElTTyBtb250aHMgYXJlIDAgZm9yIEphbnVhcnksIDEgZm9yIEZlYnJ1YXJ5LCAuLi4gKi9cbiAgICAgIGNvbnN0IFt5LCBtID0gMSwgZCA9IDFdID0gdmFsdWUuc3BsaXQoJy0nKS5tYXAoKHZhbDogc3RyaW5nKSA9PiArdmFsKTtcbiAgICAgIHJldHVybiBjcmVhdGVEYXRlKHksIG0gLSAxLCBkKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZWROYiA9IHBhcnNlRmxvYXQodmFsdWUpO1xuXG4gICAgLy8gYW55IHN0cmluZyB0aGF0IG9ubHkgY29udGFpbnMgbnVtYmVycywgbGlrZSBcIjEyMzRcIiBidXQgbm90IGxpa2UgXCIxMjM0aGVsbG9cIlxuICAgIGlmICghaXNOYU4oKHZhbHVlIGFzIGFueSkgLSBwYXJzZWROYikpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJzZWROYik7XG4gICAgfVxuXG4gICAgbGV0IG1hdGNoOiBSZWdFeHBNYXRjaEFycmF5IHwgbnVsbDtcbiAgICBpZiAoKG1hdGNoID0gdmFsdWUubWF0Y2goSVNPODYwMV9EQVRFX1JFR0VYKSkpIHtcbiAgICAgIHJldHVybiBpc29TdHJpbmdUb0RhdGUobWF0Y2gpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSBhcyBhbnkpO1xuICBpZiAoIWlzRGF0ZShkYXRlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNvbnZlcnQgXCIke3ZhbHVlfVwiIGludG8gYSBkYXRlYCk7XG4gIH1cbiAgcmV0dXJuIGRhdGU7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBkYXRlIGluIElTTzg2MDEgdG8gYSBEYXRlLlxuICogVXNlZCBpbnN0ZWFkIG9mIGBEYXRlLnBhcnNlYCBiZWNhdXNlIG9mIGJyb3dzZXIgZGlzY3JlcGFuY2llcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzb1N0cmluZ1RvRGF0ZShtYXRjaDogUmVnRXhwTWF0Y2hBcnJheSk6IERhdGUge1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUoMCk7XG4gIGxldCB0ekhvdXIgPSAwO1xuICBsZXQgdHpNaW4gPSAwO1xuXG4gIC8vIG1hdGNoWzhdIG1lYW5zIHRoYXQgdGhlIHN0cmluZyBjb250YWlucyBcIlpcIiAoVVRDKSBvciBhIHRpbWV6b25lIGxpa2UgXCIrMDE6MDBcIiBvciBcIiswMTAwXCJcbiAgY29uc3QgZGF0ZVNldHRlciA9IG1hdGNoWzhdID8gZGF0ZS5zZXRVVENGdWxsWWVhciA6IGRhdGUuc2V0RnVsbFllYXI7XG4gIGNvbnN0IHRpbWVTZXR0ZXIgPSBtYXRjaFs4XSA/IGRhdGUuc2V0VVRDSG91cnMgOiBkYXRlLnNldEhvdXJzO1xuXG4gIC8vIGlmIHRoZXJlIGlzIGEgdGltZXpvbmUgZGVmaW5lZCBsaWtlIFwiKzAxOjAwXCIgb3IgXCIrMDEwMFwiXG4gIGlmIChtYXRjaFs5XSkge1xuICAgIHR6SG91ciA9IE51bWJlcihtYXRjaFs5XSArIG1hdGNoWzEwXSk7XG4gICAgdHpNaW4gPSBOdW1iZXIobWF0Y2hbOV0gKyBtYXRjaFsxMV0pO1xuICB9XG4gIGRhdGVTZXR0ZXIuY2FsbChkYXRlLCBOdW1iZXIobWF0Y2hbMV0pLCBOdW1iZXIobWF0Y2hbMl0pIC0gMSwgTnVtYmVyKG1hdGNoWzNdKSk7XG4gIGNvbnN0IGggPSBOdW1iZXIobWF0Y2hbNF0gfHwgMCkgLSB0ekhvdXI7XG4gIGNvbnN0IG0gPSBOdW1iZXIobWF0Y2hbNV0gfHwgMCkgLSB0ek1pbjtcbiAgY29uc3QgcyA9IE51bWJlcihtYXRjaFs2XSB8fCAwKTtcbiAgLy8gVGhlIEVDTUFTY3JpcHQgc3BlY2lmaWNhdGlvbiAoaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy0xNS45LjEuMTEpXG4gIC8vIGRlZmluZXMgdGhhdCBgRGF0ZVRpbWVgIG1pbGxpc2Vjb25kcyBzaG91bGQgYWx3YXlzIGJlIHJvdW5kZWQgZG93biwgc28gdGhhdCBgOTk5Ljltc2BcbiAgLy8gYmVjb21lcyBgOTk5bXNgLlxuICBjb25zdCBtcyA9IE1hdGguZmxvb3IocGFyc2VGbG9hdCgnMC4nICsgKG1hdGNoWzddIHx8IDApKSAqIDEwMDApO1xuICB0aW1lU2V0dGVyLmNhbGwoZGF0ZSwgaCwgbSwgcywgbXMpO1xuICByZXR1cm4gZGF0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRGF0ZSB7XG4gIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgJiYgIWlzTmFOKHZhbHVlLnZhbHVlT2YoKSk7XG59XG4iXX0=