/**
 * @license Angular v21.1.0-next.0+sha-f80b51a
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { Injectable, Optional, Inject, ɵfindLocaleData as _findLocaleData, ɵLocaleDataIndex as _LocaleDataIndex, ɵgetLocaleCurrencyCode as _getLocaleCurrencyCode, ɵgetLocalePluralCase as _getLocalePluralCase, ɵRuntimeError as _RuntimeError, ɵformatRuntimeError as _formatRuntimeError, inject, LOCALE_ID, ɵstringify as _stringify, Directive, Input, createNgModule, NgModuleRef, Host, Attribute, RendererStyleFlags2, ɵINTERNAL_APPLICATION_ERROR_HANDLER as _INTERNAL_APPLICATION_ERROR_HANDLER, ɵisPromise as _isPromise, ɵisSubscribable as _isSubscribable, Pipe, untracked, InjectionToken, DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { LocationStrategy, joinWithSlash, normalizeQueryParams, PlatformLocation, APP_BASE_HREF } from './_location-chunk.mjs';

class HashLocationStrategy extends LocationStrategy {
  _platformLocation;
  _baseHref = '';
  _removeListenerFns = [];
  constructor(_platformLocation, _baseHref) {
    super();
    this._platformLocation = _platformLocation;
    if (_baseHref != null) {
      this._baseHref = _baseHref;
    }
  }
  ngOnDestroy() {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()();
    }
  }
  onPopState(fn) {
    this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
  }
  getBaseHref() {
    return this._baseHref;
  }
  path(includeHash = false) {
    const path = this._platformLocation.hash ?? '#';
    return path.length > 0 ? path.substring(1) : path;
  }
  prepareExternalUrl(internal) {
    const url = joinWithSlash(this._baseHref, internal);
    return url.length > 0 ? '#' + url : url;
  }
  pushState(state, title, path, queryParams) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams)) || this._platformLocation.pathname;
    this._platformLocation.pushState(state, title, url);
  }
  replaceState(state, title, path, queryParams) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams)) || this._platformLocation.pathname;
    this._platformLocation.replaceState(state, title, url);
  }
  forward() {
    this._platformLocation.forward();
  }
  back() {
    this._platformLocation.back();
  }
  getState() {
    return this._platformLocation.getState();
  }
  historyGo(relativePosition = 0) {
    this._platformLocation.historyGo?.(relativePosition);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: HashLocationStrategy,
    deps: [{
      token: PlatformLocation
    }, {
      token: APP_BASE_HREF,
      optional: true
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: HashLocationStrategy
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: HashLocationStrategy,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => [{
    type: PlatformLocation
  }, {
    type: undefined,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [APP_BASE_HREF]
    }]
  }]
});

const CURRENCIES_EN = {
  "ADP": [undefined, undefined, 0],
  "AFN": [undefined, "؋", 0],
  "ALL": [undefined, undefined, 0],
  "AMD": [undefined, "֏", 2],
  "AOA": [undefined, "Kz"],
  "ARS": [undefined, "$"],
  "AUD": ["A$", "$"],
  "AZN": [undefined, "₼"],
  "BAM": [undefined, "KM"],
  "BBD": [undefined, "$"],
  "BDT": [undefined, "৳"],
  "BHD": [undefined, undefined, 3],
  "BIF": [undefined, undefined, 0],
  "BMD": [undefined, "$"],
  "BND": [undefined, "$"],
  "BOB": [undefined, "Bs"],
  "BRL": ["R$"],
  "BSD": [undefined, "$"],
  "BWP": [undefined, "P"],
  "BYN": [undefined, undefined, 2],
  "BYR": [undefined, undefined, 0],
  "BZD": [undefined, "$"],
  "CAD": ["CA$", "$", 2],
  "CHF": [undefined, undefined, 2],
  "CLF": [undefined, undefined, 4],
  "CLP": [undefined, "$", 0],
  "CNY": ["CN¥", "¥"],
  "COP": [undefined, "$", 2],
  "CRC": [undefined, "₡", 2],
  "CUC": [undefined, "$"],
  "CUP": [undefined, "$"],
  "CZK": [undefined, "Kč", 2],
  "DJF": [undefined, undefined, 0],
  "DKK": [undefined, "kr", 2],
  "DOP": [undefined, "$"],
  "EGP": [undefined, "E£"],
  "ESP": [undefined, "₧", 0],
  "EUR": ["€"],
  "FJD": [undefined, "$"],
  "FKP": [undefined, "£"],
  "GBP": ["£"],
  "GEL": [undefined, "₾"],
  "GHS": [undefined, "GH₵"],
  "GIP": [undefined, "£"],
  "GNF": [undefined, "FG", 0],
  "GTQ": [undefined, "Q"],
  "GYD": [undefined, "$", 2],
  "HKD": ["HK$", "$"],
  "HNL": [undefined, "L"],
  "HRK": [undefined, "kn"],
  "HUF": [undefined, "Ft", 2],
  "IDR": [undefined, "Rp", 2],
  "ILS": ["₪"],
  "INR": ["₹"],
  "IQD": [undefined, undefined, 0],
  "IRR": [undefined, undefined, 0],
  "ISK": [undefined, "kr", 0],
  "ITL": [undefined, undefined, 0],
  "JMD": [undefined, "$"],
  "JOD": [undefined, undefined, 3],
  "JPY": ["¥", undefined, 0],
  "KGS": [undefined, "⃀"],
  "KHR": [undefined, "៛"],
  "KMF": [undefined, "CF", 0],
  "KPW": [undefined, "₩", 0],
  "KRW": ["₩", undefined, 0],
  "KWD": [undefined, undefined, 3],
  "KYD": [undefined, "$"],
  "KZT": [undefined, "₸"],
  "LAK": [undefined, "₭", 0],
  "LBP": [undefined, "L£", 0],
  "LKR": [undefined, "Rs"],
  "LRD": [undefined, "$"],
  "LTL": [undefined, "Lt"],
  "LUF": [undefined, undefined, 0],
  "LVL": [undefined, "Ls"],
  "LYD": [undefined, undefined, 3],
  "MGA": [undefined, "Ar", 0],
  "MGF": [undefined, undefined, 0],
  "MMK": [undefined, "K", 0],
  "MNT": [undefined, "₮", 2],
  "MRO": [undefined, undefined, 0],
  "MUR": [undefined, "Rs", 2],
  "MXN": ["MX$", "$"],
  "MYR": [undefined, "RM"],
  "NAD": [undefined, "$"],
  "NGN": [undefined, "₦"],
  "NIO": [undefined, "C$"],
  "NOK": [undefined, "kr", 2],
  "NPR": [undefined, "Rs"],
  "NZD": ["NZ$", "$"],
  "OMR": [undefined, undefined, 3],
  "PHP": ["₱"],
  "PKR": [undefined, "Rs", 2],
  "PLN": [undefined, "zł"],
  "PYG": [undefined, "₲", 0],
  "RON": [undefined, "lei"],
  "RSD": [undefined, undefined, 0],
  "RUB": [undefined, "₽"],
  "RWF": [undefined, "RF", 0],
  "SBD": [undefined, "$"],
  "SEK": [undefined, "kr", 2],
  "SGD": [undefined, "$"],
  "SHP": [undefined, "£"],
  "SLE": [undefined, undefined, 2],
  "SLL": [undefined, undefined, 0],
  "SOS": [undefined, undefined, 0],
  "SRD": [undefined, "$"],
  "SSP": [undefined, "£"],
  "STD": [undefined, undefined, 0],
  "STN": [undefined, "Db"],
  "SYP": [undefined, "£", 0],
  "THB": [undefined, "฿"],
  "TMM": [undefined, undefined, 0],
  "TND": [undefined, undefined, 3],
  "TOP": [undefined, "T$"],
  "TRL": [undefined, undefined, 0],
  "TRY": [undefined, "₺"],
  "TTD": [undefined, "$"],
  "TWD": ["NT$", "$", 2],
  "TZS": [undefined, undefined, 2],
  "UAH": [undefined, "₴"],
  "UGX": [undefined, undefined, 0],
  "USD": ["$"],
  "UYI": [undefined, undefined, 0],
  "UYU": [undefined, "$"],
  "UYW": [undefined, undefined, 4],
  "UZS": [undefined, undefined, 2],
  "VEF": [undefined, "Bs", 2],
  "VND": ["₫", undefined, 0],
  "VUV": [undefined, undefined, 0],
  "XAF": ["FCFA", undefined, 0],
  "XCD": ["EC$", "$"],
  "XCG": ["Cg."],
  "XOF": ["F CFA", undefined, 0],
  "XPF": ["CFPF", undefined, 0],
  "XXX": ["¤"],
  "YER": [undefined, undefined, 0],
  "ZAR": [undefined, "R"],
  "ZMK": [undefined, undefined, 0],
  "ZMW": [undefined, "ZK"],
  "ZWD": [undefined, undefined, 0]
};

var NumberFormatStyle;
(function (NumberFormatStyle) {
  NumberFormatStyle[NumberFormatStyle["Decimal"] = 0] = "Decimal";
  NumberFormatStyle[NumberFormatStyle["Percent"] = 1] = "Percent";
  NumberFormatStyle[NumberFormatStyle["Currency"] = 2] = "Currency";
  NumberFormatStyle[NumberFormatStyle["Scientific"] = 3] = "Scientific";
})(NumberFormatStyle || (NumberFormatStyle = {}));
var Plural;
(function (Plural) {
  Plural[Plural["Zero"] = 0] = "Zero";
  Plural[Plural["One"] = 1] = "One";
  Plural[Plural["Two"] = 2] = "Two";
  Plural[Plural["Few"] = 3] = "Few";
  Plural[Plural["Many"] = 4] = "Many";
  Plural[Plural["Other"] = 5] = "Other";
})(Plural || (Plural = {}));
var FormStyle;
(function (FormStyle) {
  FormStyle[FormStyle["Format"] = 0] = "Format";
  FormStyle[FormStyle["Standalone"] = 1] = "Standalone";
})(FormStyle || (FormStyle = {}));
var TranslationWidth;
(function (TranslationWidth) {
  TranslationWidth[TranslationWidth["Narrow"] = 0] = "Narrow";
  TranslationWidth[TranslationWidth["Abbreviated"] = 1] = "Abbreviated";
  TranslationWidth[TranslationWidth["Wide"] = 2] = "Wide";
  TranslationWidth[TranslationWidth["Short"] = 3] = "Short";
})(TranslationWidth || (TranslationWidth = {}));
var FormatWidth;
(function (FormatWidth) {
  FormatWidth[FormatWidth["Short"] = 0] = "Short";
  FormatWidth[FormatWidth["Medium"] = 1] = "Medium";
  FormatWidth[FormatWidth["Long"] = 2] = "Long";
  FormatWidth[FormatWidth["Full"] = 3] = "Full";
})(FormatWidth || (FormatWidth = {}));
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
  CurrencyGroup: 13
};
var WeekDay;
(function (WeekDay) {
  WeekDay[WeekDay["Sunday"] = 0] = "Sunday";
  WeekDay[WeekDay["Monday"] = 1] = "Monday";
  WeekDay[WeekDay["Tuesday"] = 2] = "Tuesday";
  WeekDay[WeekDay["Wednesday"] = 3] = "Wednesday";
  WeekDay[WeekDay["Thursday"] = 4] = "Thursday";
  WeekDay[WeekDay["Friday"] = 5] = "Friday";
  WeekDay[WeekDay["Saturday"] = 6] = "Saturday";
})(WeekDay || (WeekDay = {}));
function getLocaleId(locale) {
  return _findLocaleData(locale)[_LocaleDataIndex.LocaleId];
}
function getLocaleDayPeriods(locale, formStyle, width) {
  const data = _findLocaleData(locale);
  const amPmData = [data[_LocaleDataIndex.DayPeriodsFormat], data[_LocaleDataIndex.DayPeriodsStandalone]];
  const amPm = getLastDefinedValue(amPmData, formStyle);
  return getLastDefinedValue(amPm, width);
}
function getLocaleDayNames(locale, formStyle, width) {
  const data = _findLocaleData(locale);
  const daysData = [data[_LocaleDataIndex.DaysFormat], data[_LocaleDataIndex.DaysStandalone]];
  const days = getLastDefinedValue(daysData, formStyle);
  return getLastDefinedValue(days, width);
}
function getLocaleMonthNames(locale, formStyle, width) {
  const data = _findLocaleData(locale);
  const monthsData = [data[_LocaleDataIndex.MonthsFormat], data[_LocaleDataIndex.MonthsStandalone]];
  const months = getLastDefinedValue(monthsData, formStyle);
  return getLastDefinedValue(months, width);
}
function getLocaleEraNames(locale, width) {
  const data = _findLocaleData(locale);
  const erasData = data[_LocaleDataIndex.Eras];
  return getLastDefinedValue(erasData, width);
}
function getLocaleFirstDayOfWeek(locale) {
  const data = _findLocaleData(locale);
  return data[_LocaleDataIndex.FirstDayOfWeek];
}
function getLocaleWeekEndRange(locale) {
  const data = _findLocaleData(locale);
  return data[_LocaleDataIndex.WeekendRange];
}
function getLocaleDateFormat(locale, width) {
  const data = _findLocaleData(locale);
  return getLastDefinedValue(data[_LocaleDataIndex.DateFormat], width);
}
function getLocaleTimeFormat(locale, width) {
  const data = _findLocaleData(locale);
  return getLastDefinedValue(data[_LocaleDataIndex.TimeFormat], width);
}
function getLocaleDateTimeFormat(locale, width) {
  const data = _findLocaleData(locale);
  const dateTimeFormatData = data[_LocaleDataIndex.DateTimeFormat];
  return getLastDefinedValue(dateTimeFormatData, width);
}
function getLocaleNumberSymbol(locale, symbol) {
  const data = _findLocaleData(locale);
  const res = data[_LocaleDataIndex.NumberSymbols][symbol];
  if (typeof res === 'undefined') {
    if (symbol === NumberSymbol.CurrencyDecimal) {
      return data[_LocaleDataIndex.NumberSymbols][NumberSymbol.Decimal];
    } else if (symbol === NumberSymbol.CurrencyGroup) {
      return data[_LocaleDataIndex.NumberSymbols][NumberSymbol.Group];
    }
  }
  return res;
}
function getLocaleNumberFormat(locale, type) {
  const data = _findLocaleData(locale);
  return data[_LocaleDataIndex.NumberFormats][type];
}
function getLocaleCurrencySymbol(locale) {
  const data = _findLocaleData(locale);
  return data[_LocaleDataIndex.CurrencySymbol] || null;
}
function getLocaleCurrencyName(locale) {
  const data = _findLocaleData(locale);
  return data[_LocaleDataIndex.CurrencyName] || null;
}
function getLocaleCurrencyCode(locale) {
  return _getLocaleCurrencyCode(locale);
}
function getLocaleCurrencies(locale) {
  const data = _findLocaleData(locale);
  return data[_LocaleDataIndex.Currencies];
}
const getLocalePluralCase = _getLocalePluralCase;
function checkFullData(data) {
  if (!data[_LocaleDataIndex.ExtraData]) {
    throw new _RuntimeError(2303, ngDevMode && `Missing extra locale data for the locale "${data[_LocaleDataIndex.LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
  }
}
function getLocaleExtraDayPeriodRules(locale) {
  const data = _findLocaleData(locale);
  checkFullData(data);
  const rules = data[_LocaleDataIndex.ExtraData][2] || [];
  return rules.map(rule => {
    if (typeof rule === 'string') {
      return extractTime(rule);
    }
    return [extractTime(rule[0]), extractTime(rule[1])];
  });
}
function getLocaleExtraDayPeriods(locale, formStyle, width) {
  const data = _findLocaleData(locale);
  checkFullData(data);
  const dayPeriodsData = [data[_LocaleDataIndex.ExtraData][0], data[_LocaleDataIndex.ExtraData][1]];
  const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
  return getLastDefinedValue(dayPeriods, width) || [];
}
function getLocaleDirection(locale) {
  const data = _findLocaleData(locale);
  return data[_LocaleDataIndex.Directionality];
}
function getLastDefinedValue(data, index) {
  for (let i = index; i > -1; i--) {
    if (typeof data[i] !== 'undefined') {
      return data[i];
    }
  }
  throw new _RuntimeError(2304, ngDevMode && 'Locale data API: locale data undefined');
}
function extractTime(time) {
  const [h, m] = time.split(':');
  return {
    hours: +h,
    minutes: +m
  };
}
function getCurrencySymbol(code, format, locale = 'en') {
  const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
  const symbolNarrow = currency[1];
  if (format === 'narrow' && typeof symbolNarrow === 'string') {
    return symbolNarrow;
  }
  return currency[0] || code;
}
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
function getNumberOfCurrencyDigits(code) {
  let digits;
  const currency = CURRENCIES_EN[code];
  if (currency) {
    digits = currency[2];
  }
  return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}

const ISO8601_DATE_REGEX = /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
const NAMED_FORMATS = {};
const DATE_FORMATS_SPLIT = /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
function formatDate(value, format, locale, timezone) {
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
    } else {
      parts.push(format);
      break;
    }
  }
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertValidDateFormat(parts);
  }
  let dateTimezoneOffset = date.getTimezoneOffset();
  if (timezone) {
    dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    date = convertTimezoneToLocal(date, timezone);
  }
  let text = '';
  parts.forEach(value => {
    const dateFormatter = getDateFormatter(value);
    text += dateFormatter ? dateFormatter(date, locale, dateTimezoneOffset) : value === "''" ? "'" : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
  });
  return text;
}
function assertValidDateFormat(parts) {
  if (parts.some(part => /^Y+$/.test(part)) && !parts.some(part => /^w+$/.test(part))) {
    const message = `Suspicious use of week-based year "Y" in date pattern "${parts.join('')}". Did you mean to use calendar year "y" instead?`;
    if (parts.length === 1) {
      console.error(_formatRuntimeError(2300, message));
    } else {
      throw new _RuntimeError(2300, message);
    }
  }
}
function createDate(year, month, date) {
  const newDate = new Date(0);
  newDate.setFullYear(year, month, date);
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
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
      break;
    case 'full':
      const fullTime = getNamedFormat(locale, 'fullTime');
      const fullDate = getNamedFormat(locale, 'fullDate');
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
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
  if (num < 0 || negWrap && num <= 0) {
    if (negWrap) {
      num = -num + 1;
    } else {
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
function dateGetter(name, size, offset = 0, trim = false, negWrap = false) {
  return function (date, locale) {
    let part = getDatePart(name, date);
    if (offset > 0 || part > -offset) {
      part += offset;
    }
    if (name === 3) {
      if (part === 0 && offset === -12) {
        part = 12;
      }
    } else if (name === 6) {
      return formatFractionalSeconds(part, size);
    }
    const localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    return padNumber(part, size, localeMinus, trim, negWrap);
  };
}
function getDatePart(part, date) {
  switch (part) {
    case 0:
      return date.getFullYear();
    case 1:
      return date.getMonth();
    case 2:
      return date.getDate();
    case 3:
      return date.getHours();
    case 4:
      return date.getMinutes();
    case 5:
      return date.getSeconds();
    case 6:
      return date.getMilliseconds();
    case 7:
      return date.getDay();
    default:
      throw new _RuntimeError(2301, ngDevMode && `Unknown DateType value "${part}".`);
  }
}
function dateStrGetter(name, width, form = FormStyle.Format, extended = false) {
  return function (date, locale) {
    return getDateTranslation(date, locale, name, width, form, extended);
  };
}
function getDateTranslation(date, locale, name, width, form, extended) {
  switch (name) {
    case 2:
      return getLocaleMonthNames(locale, form, width)[date.getMonth()];
    case 1:
      return getLocaleDayNames(locale, form, width)[date.getDay()];
    case 0:
      const currentHours = date.getHours();
      const currentMinutes = date.getMinutes();
      if (extended) {
        const rules = getLocaleExtraDayPeriodRules(locale);
        const dayPeriods = getLocaleExtraDayPeriods(locale, form, width);
        const index = rules.findIndex(rule => {
          if (Array.isArray(rule)) {
            const [from, to] = rule;
            const afterFrom = currentHours >= from.hours && currentMinutes >= from.minutes;
            const beforeTo = currentHours < to.hours || currentHours === to.hours && currentMinutes < to.minutes;
            if (from.hours < to.hours) {
              if (afterFrom && beforeTo) {
                return true;
              }
            } else if (afterFrom || beforeTo) {
              return true;
            }
          } else {
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
      return getLocaleDayPeriods(locale, form, width)[currentHours < 12 ? 0 : 1];
    case 3:
      return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
    default:
      const unexpected = name;
      throw new _RuntimeError(2302, ngDevMode && `unexpected translation type ${unexpected}`);
  }
}
function timeZoneGetter(width) {
  return function (date, locale, offset) {
    const zone = -1 * offset;
    const minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
    switch (width) {
      case 0:
        return (zone >= 0 ? '+' : '') + padNumber(hours, 2, minusSign) + padNumber(Math.abs(zone % 60), 2, minusSign);
      case 1:
        return 'GMT' + (zone >= 0 ? '+' : '') + padNumber(hours, 1, minusSign);
      case 2:
        return 'GMT' + (zone >= 0 ? '+' : '') + padNumber(hours, 2, minusSign) + ':' + padNumber(Math.abs(zone % 60), 2, minusSign);
      case 3:
        if (offset === 0) {
          return 'Z';
        } else {
          return (zone >= 0 ? '+' : '') + padNumber(hours, 2, minusSign) + ':' + padNumber(Math.abs(zone % 60), 2, minusSign);
        }
      default:
        throw new _RuntimeError(2310, ngDevMode && `Unknown zone width "${width}"`);
    }
  };
}
const JANUARY = 0;
const THURSDAY = 4;
function getFirstThursdayOfYear(year) {
  const firstDayOfYear = createDate(year, JANUARY, 1).getDay();
  return createDate(year, 0, 1 + (firstDayOfYear <= THURSDAY ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
function getThursdayThisIsoWeek(datetime) {
  const currentDay = datetime.getDay();
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
    } else {
      const thisThurs = getThursdayThisIsoWeek(date);
      const firstThurs = getFirstThursdayOfYear(thisThurs.getFullYear());
      const diff = thisThurs.getTime() - firstThurs.getTime();
      result = 1 + Math.round(diff / 6.048e8);
    }
    return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  };
}
function weekNumberingYearGetter(size, trim = false) {
  return function (date, locale) {
    const thisThurs = getThursdayThisIsoWeek(date);
    const weekNumberingYear = thisThurs.getFullYear();
    return padNumber(weekNumberingYear, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim);
  };
}
const DATE_FORMATS = {};
function getDateFormatter(format) {
  if (DATE_FORMATS[format]) {
    return DATE_FORMATS[format];
  }
  let formatter;
  switch (format) {
    case 'G':
    case 'GG':
    case 'GGG':
      formatter = dateStrGetter(3, TranslationWidth.Abbreviated);
      break;
    case 'GGGG':
      formatter = dateStrGetter(3, TranslationWidth.Wide);
      break;
    case 'GGGGG':
      formatter = dateStrGetter(3, TranslationWidth.Narrow);
      break;
    case 'y':
      formatter = dateGetter(0, 1, 0, false, true);
      break;
    case 'yy':
      formatter = dateGetter(0, 2, 0, true, true);
      break;
    case 'yyy':
      formatter = dateGetter(0, 3, 0, false, true);
      break;
    case 'yyyy':
      formatter = dateGetter(0, 4, 0, false, true);
      break;
    case 'Y':
      formatter = weekNumberingYearGetter(1);
      break;
    case 'YY':
      formatter = weekNumberingYearGetter(2, true);
      break;
    case 'YYY':
      formatter = weekNumberingYearGetter(3);
      break;
    case 'YYYY':
      formatter = weekNumberingYearGetter(4);
      break;
    case 'M':
    case 'L':
      formatter = dateGetter(1, 1, 1);
      break;
    case 'MM':
    case 'LL':
      formatter = dateGetter(1, 2, 1);
      break;
    case 'MMM':
      formatter = dateStrGetter(2, TranslationWidth.Abbreviated);
      break;
    case 'MMMM':
      formatter = dateStrGetter(2, TranslationWidth.Wide);
      break;
    case 'MMMMM':
      formatter = dateStrGetter(2, TranslationWidth.Narrow);
      break;
    case 'LLL':
      formatter = dateStrGetter(2, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case 'LLLL':
      formatter = dateStrGetter(2, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case 'LLLLL':
      formatter = dateStrGetter(2, TranslationWidth.Narrow, FormStyle.Standalone);
      break;
    case 'w':
      formatter = weekGetter(1);
      break;
    case 'ww':
      formatter = weekGetter(2);
      break;
    case 'W':
      formatter = weekGetter(1, true);
      break;
    case 'd':
      formatter = dateGetter(2, 1);
      break;
    case 'dd':
      formatter = dateGetter(2, 2);
      break;
    case 'c':
    case 'cc':
      formatter = dateGetter(7, 1);
      break;
    case 'ccc':
      formatter = dateStrGetter(1, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case 'cccc':
      formatter = dateStrGetter(1, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case 'ccccc':
      formatter = dateStrGetter(1, TranslationWidth.Narrow, FormStyle.Standalone);
      break;
    case 'cccccc':
      formatter = dateStrGetter(1, TranslationWidth.Short, FormStyle.Standalone);
      break;
    case 'E':
    case 'EE':
    case 'EEE':
      formatter = dateStrGetter(1, TranslationWidth.Abbreviated);
      break;
    case 'EEEE':
      formatter = dateStrGetter(1, TranslationWidth.Wide);
      break;
    case 'EEEEE':
      formatter = dateStrGetter(1, TranslationWidth.Narrow);
      break;
    case 'EEEEEE':
      formatter = dateStrGetter(1, TranslationWidth.Short);
      break;
    case 'a':
    case 'aa':
    case 'aaa':
      formatter = dateStrGetter(0, TranslationWidth.Abbreviated);
      break;
    case 'aaaa':
      formatter = dateStrGetter(0, TranslationWidth.Wide);
      break;
    case 'aaaaa':
      formatter = dateStrGetter(0, TranslationWidth.Narrow);
      break;
    case 'b':
    case 'bb':
    case 'bbb':
      formatter = dateStrGetter(0, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
      break;
    case 'bbbb':
      formatter = dateStrGetter(0, TranslationWidth.Wide, FormStyle.Standalone, true);
      break;
    case 'bbbbb':
      formatter = dateStrGetter(0, TranslationWidth.Narrow, FormStyle.Standalone, true);
      break;
    case 'B':
    case 'BB':
    case 'BBB':
      formatter = dateStrGetter(0, TranslationWidth.Abbreviated, FormStyle.Format, true);
      break;
    case 'BBBB':
      formatter = dateStrGetter(0, TranslationWidth.Wide, FormStyle.Format, true);
      break;
    case 'BBBBB':
      formatter = dateStrGetter(0, TranslationWidth.Narrow, FormStyle.Format, true);
      break;
    case 'h':
      formatter = dateGetter(3, 1, -12);
      break;
    case 'hh':
      formatter = dateGetter(3, 2, -12);
      break;
    case 'H':
      formatter = dateGetter(3, 1);
      break;
    case 'HH':
      formatter = dateGetter(3, 2);
      break;
    case 'm':
      formatter = dateGetter(4, 1);
      break;
    case 'mm':
      formatter = dateGetter(4, 2);
      break;
    case 's':
      formatter = dateGetter(5, 1);
      break;
    case 'ss':
      formatter = dateGetter(5, 2);
      break;
    case 'S':
      formatter = dateGetter(6, 1);
      break;
    case 'SS':
      formatter = dateGetter(6, 2);
      break;
    case 'SSS':
      formatter = dateGetter(6, 3);
      break;
    case 'Z':
    case 'ZZ':
    case 'ZZZ':
      formatter = timeZoneGetter(0);
      break;
    case 'ZZZZZ':
      formatter = timeZoneGetter(3);
      break;
    case 'O':
    case 'OO':
    case 'OOO':
    case 'z':
    case 'zz':
    case 'zzz':
      formatter = timeZoneGetter(1);
      break;
    case 'OOOO':
    case 'ZZZZ':
    case 'zzzz':
      formatter = timeZoneGetter(2);
      break;
    default:
      return null;
  }
  DATE_FORMATS[format] = formatter;
  return formatter;
}
function timezoneToOffset(timezone, fallback) {
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
  const reverseValue = -1 ;
  const dateTimezoneOffset = date.getTimezoneOffset();
  const timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
  return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
function toDate(value) {
  if (isDate(value)) {
    return value;
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return new Date(value);
  }
  if (typeof value === 'string') {
    value = value.trim();
    if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(value)) {
      const [y, m = 1, d = 1] = value.split('-').map(val => +val);
      return createDate(y, m - 1, d);
    }
    const parsedNb = parseFloat(value);
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
    throw new _RuntimeError(2311, ngDevMode && `Unable to convert "${value}" into a date`);
  }
  return date;
}
function isoStringToDate(match) {
  const date = new Date(0);
  let tzHour = 0;
  let tzMin = 0;
  const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
  const timeSetter = match[8] ? date.setUTCHours : date.setHours;
  if (match[9]) {
    tzHour = Number(match[9] + match[10]);
    tzMin = Number(match[9] + match[11]);
  }
  dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const h = Number(match[4] || 0) - tzHour;
  const m = Number(match[5] || 0) - tzMin;
  const s = Number(match[6] || 0);
  const ms = Math.floor(parseFloat('0.' + (match[7] || 0)) * 1000);
  timeSetter.call(date, h, m, s, ms);
  return date;
}
function isDate(value) {
  return value instanceof Date && !isNaN(value.valueOf());
}

const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const MAX_DIGITS = 22;
const DECIMAL_SEP = '.';
const ZERO_CHAR = '0';
const PATTERN_SEP = ';';
const GROUP_SEP = ',';
const DIGIT_CHAR = '#';
const CURRENCY_CHAR = '¤';
const PERCENT_CHAR = '%';
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent = false) {
  let formattedText = '';
  let isZero = false;
  if (!isFinite(value)) {
    formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
  } else {
    let parsedNumber = parseNumber(value);
    if (isPercent) {
      parsedNumber = toPercent(parsedNumber);
    }
    let minInt = pattern.minInt;
    let minFraction = pattern.minFrac;
    let maxFraction = pattern.maxFrac;
    if (digitsInfo) {
      const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
      if (parts === null) {
        throw new _RuntimeError(2306, ngDevMode && `${digitsInfo} is not a valid digit info`);
      }
      const minIntPart = parts[1];
      const minFractionPart = parts[3];
      const maxFractionPart = parts[5];
      if (minIntPart != null) {
        minInt = parseIntAutoRadix(minIntPart);
      }
      if (minFractionPart != null) {
        minFraction = parseIntAutoRadix(minFractionPart);
      }
      if (maxFractionPart != null) {
        maxFraction = parseIntAutoRadix(maxFractionPart);
      } else if (minFractionPart != null && minFraction > maxFraction) {
        maxFraction = minFraction;
      }
    }
    roundNumber(parsedNumber, minFraction, maxFraction);
    let digits = parsedNumber.digits;
    let integerLen = parsedNumber.integerLen;
    const exponent = parsedNumber.exponent;
    let decimals = [];
    isZero = digits.every(d => !d);
    for (; integerLen < minInt; integerLen++) {
      digits.unshift(0);
    }
    for (; integerLen < 0; integerLen++) {
      digits.unshift(0);
    }
    if (integerLen > 0) {
      decimals = digits.splice(integerLen, digits.length);
    } else {
      decimals = digits;
      digits = [0];
    }
    const groups = [];
    if (digits.length >= pattern.lgSize) {
      groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
    }
    while (digits.length > pattern.gSize) {
      groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
    }
    if (digits.length) {
      groups.unshift(digits.join(''));
    }
    formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));
    if (decimals.length) {
      formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join('');
    }
    if (exponent) {
      formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + '+' + exponent;
    }
  }
  if (value < 0 && !isZero) {
    formattedText = pattern.negPre + formattedText + pattern.negSuf;
  } else {
    formattedText = pattern.posPre + formattedText + pattern.posSuf;
  }
  return formattedText;
}
function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  pattern.minFrac = getNumberOfCurrencyDigits(currencyCode);
  pattern.maxFrac = pattern.minFrac;
  const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
  return res.replace(CURRENCY_CHAR, currency).replace(CURRENCY_CHAR, '').trim();
}
function formatPercent(value, locale, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
  return res.replace(new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
function formatNumber(value, locale, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
function parseNumberFormat(format, minusSign = '-') {
  const p = {
    minInt: 1,
    minFrac: 0,
    maxFrac: 0,
    posPre: '',
    posSuf: '',
    negPre: '',
    negSuf: '',
    gSize: 0,
    lgSize: 0
  };
  const patternParts = format.split(PATTERN_SEP);
  const positive = patternParts[0];
  const negative = patternParts[1];
  const positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ? positive.split(DECIMAL_SEP) : [positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1), positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)],
    integer = positiveParts[0],
    fraction = positiveParts[1] || '';
  p.posPre = integer.substring(0, integer.indexOf(DIGIT_CHAR));
  for (let i = 0; i < fraction.length; i++) {
    const ch = fraction.charAt(i);
    if (ch === ZERO_CHAR) {
      p.minFrac = p.maxFrac = i + 1;
    } else if (ch === DIGIT_CHAR) {
      p.maxFrac = i + 1;
    } else {
      p.posSuf += ch;
    }
  }
  const groups = integer.split(GROUP_SEP);
  p.gSize = groups[1] ? groups[1].length : 0;
  p.lgSize = groups[2] || groups[1] ? (groups[2] || groups[1]).length : 0;
  if (negative) {
    const trunkLen = positive.length - p.posPre.length - p.posSuf.length,
      pos = negative.indexOf(DIGIT_CHAR);
    p.negPre = negative.substring(0, pos).replace(/'/g, '');
    p.negSuf = negative.slice(pos + trunkLen).replace(/'/g, '');
  } else {
    p.negPre = minusSign + p.posPre;
    p.negSuf = p.posSuf;
  }
  return p;
}
function toPercent(parsedNumber) {
  if (parsedNumber.digits[0] === 0) {
    return parsedNumber;
  }
  const fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
  if (parsedNumber.exponent) {
    parsedNumber.exponent += 2;
  } else {
    if (fractionLen === 0) {
      parsedNumber.digits.push(0, 0);
    } else if (fractionLen === 1) {
      parsedNumber.digits.push(0);
    }
    parsedNumber.integerLen += 2;
  }
  return parsedNumber;
}
function parseNumber(num) {
  let numStr = Math.abs(num) + '';
  let exponent = 0,
    digits,
    integerLen;
  let i, j, zeros;
  if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
    numStr = numStr.replace(DECIMAL_SEP, '');
  }
  if ((i = numStr.search(/e/i)) > 0) {
    if (integerLen < 0) integerLen = i;
    integerLen += +numStr.slice(i + 1);
    numStr = numStr.substring(0, i);
  } else if (integerLen < 0) {
    integerLen = numStr.length;
  }
  for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) {}
  if (i === (zeros = numStr.length)) {
    digits = [0];
    integerLen = 1;
  } else {
    zeros--;
    while (numStr.charAt(zeros) === ZERO_CHAR) zeros--;
    integerLen -= i;
    digits = [];
    for (j = 0; i <= zeros; i++, j++) {
      digits[j] = Number(numStr.charAt(i));
    }
  }
  if (integerLen > MAX_DIGITS) {
    digits = digits.splice(0, MAX_DIGITS - 1);
    exponent = integerLen - 1;
    integerLen = 1;
  }
  return {
    digits,
    exponent,
    integerLen
  };
}
function roundNumber(parsedNumber, minFrac, maxFrac) {
  if (minFrac > maxFrac) {
    throw new _RuntimeError(2307, ngDevMode && `The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
  }
  let digits = parsedNumber.digits;
  let fractionLen = digits.length - parsedNumber.integerLen;
  const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
  let roundAt = fractionSize + parsedNumber.integerLen;
  let digit = digits[roundAt];
  if (roundAt > 0) {
    digits.splice(Math.max(parsedNumber.integerLen, roundAt));
    for (let j = roundAt; j < digits.length; j++) {
      digits[j] = 0;
    }
  } else {
    fractionLen = Math.max(0, fractionLen);
    parsedNumber.integerLen = 1;
    digits.length = Math.max(1, roundAt = fractionSize + 1);
    digits[0] = 0;
    for (let i = 1; i < roundAt; i++) digits[i] = 0;
  }
  if (digit >= 5) {
    if (roundAt - 1 < 0) {
      for (let k = 0; k > roundAt; k--) {
        digits.unshift(0);
        parsedNumber.integerLen++;
      }
      digits.unshift(1);
      parsedNumber.integerLen++;
    } else {
      digits[roundAt - 1]++;
    }
  }
  for (; fractionLen < Math.max(0, fractionSize); fractionLen++) digits.push(0);
  let dropTrailingZeros = fractionSize !== 0;
  const minLen = minFrac + parsedNumber.integerLen;
  const carry = digits.reduceRight(function (carry, d, i, digits) {
    d = d + carry;
    digits[i] = d < 10 ? d : d - 10;
    if (dropTrailingZeros) {
      if (digits[i] === 0 && i >= minLen) {
        digits.pop();
      } else {
        dropTrailingZeros = false;
      }
    }
    return d >= 10 ? 1 : 0;
  }, 0);
  if (carry) {
    digits.unshift(carry);
    parsedNumber.integerLen++;
  }
}
function parseIntAutoRadix(text) {
  const result = parseInt(text);
  if (isNaN(result)) {
    throw new _RuntimeError(2305, ngDevMode && 'Invalid integer literal when parsing ' + text);
  }
  return result;
}

class NgLocalization {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgLocalization,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgLocalization,
    providedIn: 'root',
    useFactory: () => new NgLocaleLocalization(inject(LOCALE_ID))
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgLocalization,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useFactory: () => new NgLocaleLocalization(inject(LOCALE_ID))
    }]
  }]
});
function getPluralCategory(value, cases, ngLocalization, locale) {
  let key = `=${value}`;
  if (cases.indexOf(key) > -1) {
    return key;
  }
  key = ngLocalization.getPluralCategory(value, locale);
  if (cases.indexOf(key) > -1) {
    return key;
  }
  if (cases.indexOf('other') > -1) {
    return 'other';
  }
  throw new _RuntimeError(2308, ngDevMode && `No plural message found for value "${value}"`);
}
class NgLocaleLocalization extends NgLocalization {
  locale;
  constructor(locale) {
    super();
    this.locale = locale;
  }
  getPluralCategory(value, locale) {
    const plural = getLocalePluralCase(locale || this.locale)(value);
    switch (plural) {
      case Plural.Zero:
        return 'zero';
      case Plural.One:
        return 'one';
      case Plural.Two:
        return 'two';
      case Plural.Few:
        return 'few';
      case Plural.Many:
        return 'many';
      default:
        return 'other';
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgLocaleLocalization,
    deps: [{
      token: LOCALE_ID
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgLocaleLocalization
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgLocaleLocalization,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => [{
    type: undefined,
    decorators: [{
      type: Inject,
      args: [LOCALE_ID]
    }]
  }]
});

const WS_REGEXP = /\s+/;
const EMPTY_ARRAY = [];
class NgClass {
  _ngEl;
  _renderer;
  initialClasses = EMPTY_ARRAY;
  rawClass;
  stateMap = new Map();
  constructor(_ngEl, _renderer) {
    this._ngEl = _ngEl;
    this._renderer = _renderer;
  }
  set klass(value) {
    this.initialClasses = value != null ? value.trim().split(WS_REGEXP) : EMPTY_ARRAY;
  }
  set ngClass(value) {
    this.rawClass = typeof value === 'string' ? value.trim().split(WS_REGEXP) : value;
  }
  ngDoCheck() {
    for (const klass of this.initialClasses) {
      this._updateState(klass, true);
    }
    const rawClass = this.rawClass;
    if (Array.isArray(rawClass) || rawClass instanceof Set) {
      for (const klass of rawClass) {
        this._updateState(klass, true);
      }
    } else if (rawClass != null) {
      for (const klass of Object.keys(rawClass)) {
        this._updateState(klass, Boolean(rawClass[klass]));
      }
    }
    this._applyStateDiff();
  }
  _updateState(klass, nextEnabled) {
    const state = this.stateMap.get(klass);
    if (state !== undefined) {
      if (state.enabled !== nextEnabled) {
        state.changed = true;
        state.enabled = nextEnabled;
      }
      state.touched = true;
    } else {
      this.stateMap.set(klass, {
        enabled: nextEnabled,
        changed: true,
        touched: true
      });
    }
  }
  _applyStateDiff() {
    for (const stateEntry of this.stateMap) {
      const klass = stateEntry[0];
      const state = stateEntry[1];
      if (state.changed) {
        this._toggleClass(klass, state.enabled);
        state.changed = false;
      } else if (!state.touched) {
        if (state.enabled) {
          this._toggleClass(klass, false);
        }
        this.stateMap.delete(klass);
      }
      state.touched = false;
    }
  }
  _toggleClass(klass, enabled) {
    if (ngDevMode) {
      if (typeof klass !== 'string') {
        throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${_stringify(klass)}`);
      }
    }
    klass = klass.trim();
    if (klass.length > 0) {
      klass.split(WS_REGEXP).forEach(klass => {
        if (enabled) {
          this._renderer.addClass(this._ngEl.nativeElement, klass);
        } else {
          this._renderer.removeClass(this._ngEl.nativeElement, klass);
        }
      });
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgClass,
    deps: [{
      token: i0.ElementRef
    }, {
      token: i0.Renderer2
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgClass,
    isStandalone: true,
    selector: "[ngClass]",
    inputs: {
      klass: ["class", "klass"],
      ngClass: "ngClass"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgClass,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngClass]'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ElementRef
  }, {
    type: i0.Renderer2
  }],
  propDecorators: {
    klass: [{
      type: Input,
      args: ['class']
    }],
    ngClass: [{
      type: Input,
      args: ['ngClass']
    }]
  }
});

class NgComponentOutlet {
  _viewContainerRef;
  ngComponentOutlet = null;
  ngComponentOutletInputs;
  ngComponentOutletInjector;
  ngComponentOutletEnvironmentInjector;
  ngComponentOutletContent;
  ngComponentOutletNgModule;
  _componentRef;
  _moduleRef;
  _inputsUsed = new Map();
  get componentInstance() {
    return this._componentRef?.instance ?? null;
  }
  constructor(_viewContainerRef) {
    this._viewContainerRef = _viewContainerRef;
  }
  _needToReCreateNgModuleInstance(changes) {
    return changes['ngComponentOutletNgModule'] !== undefined || changes['ngComponentOutletNgModuleFactory'] !== undefined;
  }
  _needToReCreateComponentInstance(changes) {
    return changes['ngComponentOutlet'] !== undefined || changes['ngComponentOutletContent'] !== undefined || changes['ngComponentOutletInjector'] !== undefined || changes['ngComponentOutletEnvironmentInjector'] !== undefined || this._needToReCreateNgModuleInstance(changes);
  }
  ngOnChanges(changes) {
    if (this._needToReCreateComponentInstance(changes)) {
      this._viewContainerRef.clear();
      this._inputsUsed.clear();
      this._componentRef = undefined;
      if (this.ngComponentOutlet) {
        const injector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;
        if (this._needToReCreateNgModuleInstance(changes)) {
          this._moduleRef?.destroy();
          if (this.ngComponentOutletNgModule) {
            this._moduleRef = createNgModule(this.ngComponentOutletNgModule, getParentInjector(injector));
          } else {
            this._moduleRef = undefined;
          }
        }
        this._componentRef = this._viewContainerRef.createComponent(this.ngComponentOutlet, {
          injector,
          ngModuleRef: this._moduleRef,
          projectableNodes: this.ngComponentOutletContent,
          environmentInjector: this.ngComponentOutletEnvironmentInjector
        });
      }
    }
  }
  ngDoCheck() {
    if (this._componentRef) {
      if (this.ngComponentOutletInputs) {
        for (const inputName of Object.keys(this.ngComponentOutletInputs)) {
          this._inputsUsed.set(inputName, true);
        }
      }
      this._applyInputStateDiff(this._componentRef);
    }
  }
  ngOnDestroy() {
    this._moduleRef?.destroy();
  }
  _applyInputStateDiff(componentRef) {
    for (const [inputName, touched] of this._inputsUsed) {
      if (!touched) {
        componentRef.setInput(inputName, undefined);
        this._inputsUsed.delete(inputName);
      } else {
        componentRef.setInput(inputName, this.ngComponentOutletInputs[inputName]);
        this._inputsUsed.set(inputName, false);
      }
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgComponentOutlet,
    deps: [{
      token: i0.ViewContainerRef
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgComponentOutlet,
    isStandalone: true,
    selector: "[ngComponentOutlet]",
    inputs: {
      ngComponentOutlet: "ngComponentOutlet",
      ngComponentOutletInputs: "ngComponentOutletInputs",
      ngComponentOutletInjector: "ngComponentOutletInjector",
      ngComponentOutletEnvironmentInjector: "ngComponentOutletEnvironmentInjector",
      ngComponentOutletContent: "ngComponentOutletContent",
      ngComponentOutletNgModule: "ngComponentOutletNgModule"
    },
    exportAs: ["ngComponentOutlet"],
    usesOnChanges: true,
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgComponentOutlet,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngComponentOutlet]',
      exportAs: 'ngComponentOutlet'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ViewContainerRef
  }],
  propDecorators: {
    ngComponentOutlet: [{
      type: Input
    }],
    ngComponentOutletInputs: [{
      type: Input
    }],
    ngComponentOutletInjector: [{
      type: Input
    }],
    ngComponentOutletEnvironmentInjector: [{
      type: Input
    }],
    ngComponentOutletContent: [{
      type: Input
    }],
    ngComponentOutletNgModule: [{
      type: Input
    }]
  }
});
function getParentInjector(injector) {
  const parentNgModule = injector.get(NgModuleRef);
  return parentNgModule.injector;
}

class NgForOfContext {
  $implicit;
  ngForOf;
  index;
  count;
  constructor($implicit, ngForOf, index, count) {
    this.$implicit = $implicit;
    this.ngForOf = ngForOf;
    this.index = index;
    this.count = count;
  }
  get first() {
    return this.index === 0;
  }
  get last() {
    return this.index === this.count - 1;
  }
  get even() {
    return this.index % 2 === 0;
  }
  get odd() {
    return !this.even;
  }
}
class NgForOf {
  _viewContainer;
  _template;
  _differs;
  set ngForOf(ngForOf) {
    this._ngForOf = ngForOf;
    this._ngForOfDirty = true;
  }
  set ngForTrackBy(fn) {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && fn != null && typeof fn !== 'function') {
      console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` + `See https://angular.dev/api/common/NgForOf#change-propagation for more information.`);
    }
    this._trackByFn = fn;
  }
  get ngForTrackBy() {
    return this._trackByFn;
  }
  _ngForOf = null;
  _ngForOfDirty = true;
  _differ = null;
  _trackByFn;
  constructor(_viewContainer, _template, _differs) {
    this._viewContainer = _viewContainer;
    this._template = _template;
    this._differs = _differs;
  }
  set ngForTemplate(value) {
    if (value) {
      this._template = value;
    }
  }
  ngDoCheck() {
    if (this._ngForOfDirty) {
      this._ngForOfDirty = false;
      const value = this._ngForOf;
      if (!this._differ && value) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          try {
            this._differ = this._differs.find(value).create(this.ngForTrackBy);
          } catch {
            let errorMessage = `Cannot find a differ supporting object '${value}' of type '` + `${getTypeName(value)}'. NgFor only supports binding to Iterables, such as Arrays.`;
            if (typeof value === 'object') {
              errorMessage += ' Did you mean to use the keyvalue pipe?';
            }
            throw new _RuntimeError(-2200, errorMessage);
          }
        } else {
          this._differ = this._differs.find(value).create(this.ngForTrackBy);
        }
      }
    }
    if (this._differ) {
      const changes = this._differ.diff(this._ngForOf);
      if (changes) this._applyChanges(changes);
    }
  }
  _applyChanges(changes) {
    const viewContainer = this._viewContainer;
    changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
      if (item.previousIndex == null) {
        viewContainer.createEmbeddedView(this._template, new NgForOfContext(item.item, this._ngForOf, -1, -1), currentIndex === null ? undefined : currentIndex);
      } else if (currentIndex == null) {
        viewContainer.remove(adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);
      } else if (adjustedPreviousIndex !== null) {
        const view = viewContainer.get(adjustedPreviousIndex);
        viewContainer.move(view, currentIndex);
        applyViewChange(view, item);
      }
    });
    for (let i = 0, ilen = viewContainer.length; i < ilen; i++) {
      const viewRef = viewContainer.get(i);
      const context = viewRef.context;
      context.index = i;
      context.count = ilen;
      context.ngForOf = this._ngForOf;
    }
    changes.forEachIdentityChange(record => {
      const viewRef = viewContainer.get(record.currentIndex);
      applyViewChange(viewRef, record);
    });
  }
  static ngTemplateContextGuard(dir, ctx) {
    return true;
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgForOf,
    deps: [{
      token: i0.ViewContainerRef
    }, {
      token: i0.TemplateRef
    }, {
      token: i0.IterableDiffers
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgForOf,
    isStandalone: true,
    selector: "[ngFor][ngForOf]",
    inputs: {
      ngForOf: "ngForOf",
      ngForTrackBy: "ngForTrackBy",
      ngForTemplate: "ngForTemplate"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgForOf,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngFor][ngForOf]'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ViewContainerRef
  }, {
    type: i0.TemplateRef
  }, {
    type: i0.IterableDiffers
  }],
  propDecorators: {
    ngForOf: [{
      type: Input
    }],
    ngForTrackBy: [{
      type: Input
    }],
    ngForTemplate: [{
      type: Input
    }]
  }
});
function applyViewChange(view, record) {
  view.context.$implicit = record.item;
}
function getTypeName(type) {
  return type['name'] || typeof type;
}

class NgIf {
  _viewContainer;
  _context = new NgIfContext();
  _thenTemplateRef = null;
  _elseTemplateRef = null;
  _thenViewRef = null;
  _elseViewRef = null;
  constructor(_viewContainer, templateRef) {
    this._viewContainer = _viewContainer;
    this._thenTemplateRef = templateRef;
  }
  set ngIf(condition) {
    this._context.$implicit = this._context.ngIf = condition;
    this._updateView();
  }
  set ngIfThen(templateRef) {
    assertTemplate(templateRef, (typeof ngDevMode === 'undefined' || ngDevMode) && 'ngIfThen');
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null;
    this._updateView();
  }
  set ngIfElse(templateRef) {
    assertTemplate(templateRef, (typeof ngDevMode === 'undefined' || ngDevMode) && 'ngIfElse');
    this._elseTemplateRef = templateRef;
    this._elseViewRef = null;
    this._updateView();
  }
  _updateView() {
    if (this._context.$implicit) {
      if (!this._thenViewRef) {
        this._viewContainer.clear();
        this._elseViewRef = null;
        if (this._thenTemplateRef) {
          this._thenViewRef = this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
        }
      }
    } else {
      if (!this._elseViewRef) {
        this._viewContainer.clear();
        this._thenViewRef = null;
        if (this._elseTemplateRef) {
          this._elseViewRef = this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
        }
      }
    }
  }
  static ngIfUseIfTypeGuard;
  static ngTemplateGuard_ngIf;
  static ngTemplateContextGuard(dir, ctx) {
    return true;
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgIf,
    deps: [{
      token: i0.ViewContainerRef
    }, {
      token: i0.TemplateRef
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgIf,
    isStandalone: true,
    selector: "[ngIf]",
    inputs: {
      ngIf: "ngIf",
      ngIfThen: "ngIfThen",
      ngIfElse: "ngIfElse"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgIf,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngIf]'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ViewContainerRef
  }, {
    type: i0.TemplateRef
  }],
  propDecorators: {
    ngIf: [{
      type: Input
    }],
    ngIfThen: [{
      type: Input
    }],
    ngIfElse: [{
      type: Input
    }]
  }
});
class NgIfContext {
  $implicit = null;
  ngIf = null;
}
function assertTemplate(templateRef, property) {
  if (templateRef && !templateRef.createEmbeddedView) {
    throw new _RuntimeError(2020, (typeof ngDevMode === 'undefined' || ngDevMode) && `${property} must be a TemplateRef, but received '${_stringify(templateRef)}'.`);
  }
}

class SwitchView {
  _viewContainerRef;
  _templateRef;
  _created = false;
  constructor(_viewContainerRef, _templateRef) {
    this._viewContainerRef = _viewContainerRef;
    this._templateRef = _templateRef;
  }
  create() {
    this._created = true;
    this._viewContainerRef.createEmbeddedView(this._templateRef);
  }
  destroy() {
    this._created = false;
    this._viewContainerRef.clear();
  }
  enforceState(created) {
    if (created && !this._created) {
      this.create();
    } else if (!created && this._created) {
      this.destroy();
    }
  }
}
class NgSwitch {
  _defaultViews = [];
  _defaultUsed = false;
  _caseCount = 0;
  _lastCaseCheckIndex = 0;
  _lastCasesMatched = false;
  _ngSwitch;
  set ngSwitch(newValue) {
    this._ngSwitch = newValue;
    if (this._caseCount === 0) {
      this._updateDefaultCases(true);
    }
  }
  _addCase() {
    return this._caseCount++;
  }
  _addDefault(view) {
    this._defaultViews.push(view);
  }
  _matchCase(value) {
    const matched = value === this._ngSwitch;
    this._lastCasesMatched ||= matched;
    this._lastCaseCheckIndex++;
    if (this._lastCaseCheckIndex === this._caseCount) {
      this._updateDefaultCases(!this._lastCasesMatched);
      this._lastCaseCheckIndex = 0;
      this._lastCasesMatched = false;
    }
    return matched;
  }
  _updateDefaultCases(useDefault) {
    if (this._defaultViews.length > 0 && useDefault !== this._defaultUsed) {
      this._defaultUsed = useDefault;
      for (const defaultView of this._defaultViews) {
        defaultView.enforceState(useDefault);
      }
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgSwitch,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgSwitch,
    isStandalone: true,
    selector: "[ngSwitch]",
    inputs: {
      ngSwitch: "ngSwitch"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgSwitch,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngSwitch]'
    }]
  }],
  propDecorators: {
    ngSwitch: [{
      type: Input
    }]
  }
});
class NgSwitchCase {
  ngSwitch;
  _view;
  ngSwitchCase;
  constructor(viewContainer, templateRef, ngSwitch) {
    this.ngSwitch = ngSwitch;
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError('ngSwitchCase', 'NgSwitchCase');
    }
    ngSwitch._addCase();
    this._view = new SwitchView(viewContainer, templateRef);
  }
  ngDoCheck() {
    this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgSwitchCase,
    deps: [{
      token: i0.ViewContainerRef
    }, {
      token: i0.TemplateRef
    }, {
      token: NgSwitch,
      host: true,
      optional: true
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgSwitchCase,
    isStandalone: true,
    selector: "[ngSwitchCase]",
    inputs: {
      ngSwitchCase: "ngSwitchCase"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgSwitchCase,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngSwitchCase]'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ViewContainerRef
  }, {
    type: i0.TemplateRef
  }, {
    type: NgSwitch,
    decorators: [{
      type: Optional
    }, {
      type: Host
    }]
  }],
  propDecorators: {
    ngSwitchCase: [{
      type: Input
    }]
  }
});
class NgSwitchDefault {
  constructor(viewContainer, templateRef, ngSwitch) {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError('ngSwitchDefault', 'NgSwitchDefault');
    }
    ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgSwitchDefault,
    deps: [{
      token: i0.ViewContainerRef
    }, {
      token: i0.TemplateRef
    }, {
      token: NgSwitch,
      host: true,
      optional: true
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgSwitchDefault,
    isStandalone: true,
    selector: "[ngSwitchDefault]",
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgSwitchDefault,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngSwitchDefault]'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ViewContainerRef
  }, {
    type: i0.TemplateRef
  }, {
    type: NgSwitch,
    decorators: [{
      type: Optional
    }, {
      type: Host
    }]
  }]
});
function throwNgSwitchProviderNotFoundError(attrName, directiveName) {
  throw new _RuntimeError(2000, `An element with the "${attrName}" attribute ` + `(matching the "${directiveName}" directive) must be located inside an element with the "ngSwitch" attribute ` + `(matching "NgSwitch" directive)`);
}

class NgPlural {
  _localization;
  _activeView;
  _caseViews = {};
  constructor(_localization) {
    this._localization = _localization;
  }
  set ngPlural(value) {
    this._updateView(value);
  }
  addCase(value, switchView) {
    this._caseViews[value] = switchView;
  }
  _updateView(switchValue) {
    this._clearViews();
    const cases = Object.keys(this._caseViews);
    const key = getPluralCategory(switchValue, cases, this._localization);
    this._activateView(this._caseViews[key]);
  }
  _clearViews() {
    if (this._activeView) this._activeView.destroy();
  }
  _activateView(view) {
    if (view) {
      this._activeView = view;
      this._activeView.create();
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgPlural,
    deps: [{
      token: NgLocalization
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgPlural,
    isStandalone: true,
    selector: "[ngPlural]",
    inputs: {
      ngPlural: "ngPlural"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgPlural,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngPlural]'
    }]
  }],
  ctorParameters: () => [{
    type: NgLocalization
  }],
  propDecorators: {
    ngPlural: [{
      type: Input
    }]
  }
});
class NgPluralCase {
  value;
  constructor(value, template, viewContainer, ngPlural) {
    this.value = value;
    const isANumber = !isNaN(Number(value));
    ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgPluralCase,
    deps: [{
      token: 'ngPluralCase',
      attribute: true
    }, {
      token: i0.TemplateRef
    }, {
      token: i0.ViewContainerRef
    }, {
      token: NgPlural,
      host: true
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgPluralCase,
    isStandalone: true,
    selector: "[ngPluralCase]",
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgPluralCase,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngPluralCase]'
    }]
  }],
  ctorParameters: () => [{
    type: undefined,
    decorators: [{
      type: Attribute,
      args: ['ngPluralCase']
    }]
  }, {
    type: i0.TemplateRef
  }, {
    type: i0.ViewContainerRef
  }, {
    type: NgPlural,
    decorators: [{
      type: Host
    }]
  }]
});

class NgStyle {
  _ngEl;
  _differs;
  _renderer;
  _ngStyle = null;
  _differ = null;
  constructor(_ngEl, _differs, _renderer) {
    this._ngEl = _ngEl;
    this._differs = _differs;
    this._renderer = _renderer;
  }
  set ngStyle(values) {
    this._ngStyle = values;
    if (!this._differ && values) {
      this._differ = this._differs.find(values).create();
    }
  }
  ngDoCheck() {
    if (this._differ) {
      const changes = this._differ.diff(this._ngStyle);
      if (changes) {
        this._applyChanges(changes);
      }
    }
  }
  _setStyle(nameAndUnit, value) {
    const [name, unit] = nameAndUnit.split('.');
    const flags = name.indexOf('-') === -1 ? undefined : RendererStyleFlags2.DashCase;
    if (value != null) {
      this._renderer.setStyle(this._ngEl.nativeElement, name, unit ? `${value}${unit}` : value, flags);
    } else {
      this._renderer.removeStyle(this._ngEl.nativeElement, name, flags);
    }
  }
  _applyChanges(changes) {
    changes.forEachRemovedItem(record => this._setStyle(record.key, null));
    changes.forEachAddedItem(record => this._setStyle(record.key, record.currentValue));
    changes.forEachChangedItem(record => this._setStyle(record.key, record.currentValue));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgStyle,
    deps: [{
      token: i0.ElementRef
    }, {
      token: i0.KeyValueDiffers
    }, {
      token: i0.Renderer2
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgStyle,
    isStandalone: true,
    selector: "[ngStyle]",
    inputs: {
      ngStyle: "ngStyle"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgStyle,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngStyle]'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ElementRef
  }, {
    type: i0.KeyValueDiffers
  }, {
    type: i0.Renderer2
  }],
  propDecorators: {
    ngStyle: [{
      type: Input,
      args: ['ngStyle']
    }]
  }
});

class NgTemplateOutlet {
  _viewContainerRef;
  _viewRef = null;
  ngTemplateOutletContext = null;
  ngTemplateOutlet = null;
  ngTemplateOutletInjector = null;
  constructor(_viewContainerRef) {
    this._viewContainerRef = _viewContainerRef;
  }
  ngOnChanges(changes) {
    if (this._shouldRecreateView(changes)) {
      const viewContainerRef = this._viewContainerRef;
      if (this._viewRef) {
        viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
      }
      if (!this.ngTemplateOutlet) {
        this._viewRef = null;
        return;
      }
      const viewContext = this._createContextForwardProxy();
      this._viewRef = viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, viewContext, {
        injector: this.ngTemplateOutletInjector ?? undefined
      });
    }
  }
  _shouldRecreateView(changes) {
    return !!changes['ngTemplateOutlet'] || !!changes['ngTemplateOutletInjector'];
  }
  _createContextForwardProxy() {
    return new Proxy({}, {
      set: (_target, prop, newValue) => {
        if (!this.ngTemplateOutletContext) {
          return false;
        }
        return Reflect.set(this.ngTemplateOutletContext, prop, newValue);
      },
      get: (_target, prop, receiver) => {
        if (!this.ngTemplateOutletContext) {
          return undefined;
        }
        return Reflect.get(this.ngTemplateOutletContext, prop, receiver);
      }
    });
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: NgTemplateOutlet,
    deps: [{
      token: i0.ViewContainerRef
    }],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    type: NgTemplateOutlet,
    isStandalone: true,
    selector: "[ngTemplateOutlet]",
    inputs: {
      ngTemplateOutletContext: "ngTemplateOutletContext",
      ngTemplateOutlet: "ngTemplateOutlet",
      ngTemplateOutletInjector: "ngTemplateOutletInjector"
    },
    usesOnChanges: true,
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: NgTemplateOutlet,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[ngTemplateOutlet]'
    }]
  }],
  ctorParameters: () => [{
    type: i0.ViewContainerRef
  }],
  propDecorators: {
    ngTemplateOutletContext: [{
      type: Input
    }],
    ngTemplateOutlet: [{
      type: Input
    }],
    ngTemplateOutletInjector: [{
      type: Input
    }]
  }
});

const COMMON_DIRECTIVES = [NgClass, NgComponentOutlet, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase];

function invalidPipeArgumentError(type, value) {
  return new _RuntimeError(2100, ngDevMode && `InvalidPipeArgument: '${value}' for pipe '${_stringify(type)}'`);
}

class SubscribableStrategy {
  createSubscription(async, updateLatestValue, onError) {
    return untracked(() => async.subscribe({
      next: updateLatestValue,
      error: onError
    }));
  }
  dispose(subscription) {
    untracked(() => subscription.unsubscribe());
  }
}
class PromiseStrategy {
  createSubscription(async, updateLatestValue, onError) {
    async.then(v => updateLatestValue?.(v), e => onError?.(e));
    return {
      unsubscribe: () => {
        updateLatestValue = null;
        onError = null;
      }
    };
  }
  dispose(subscription) {
    subscription.unsubscribe();
  }
}
const _promiseStrategy = new PromiseStrategy();
const _subscribableStrategy = new SubscribableStrategy();
class AsyncPipe {
  _ref;
  _latestValue = null;
  markForCheckOnValueUpdate = true;
  _subscription = null;
  _obj = null;
  _strategy = null;
  applicationErrorHandler = inject(_INTERNAL_APPLICATION_ERROR_HANDLER);
  constructor(ref) {
    this._ref = ref;
  }
  ngOnDestroy() {
    if (this._subscription) {
      this._dispose();
    }
    this._ref = null;
  }
  transform(obj) {
    if (!this._obj) {
      if (obj) {
        try {
          this.markForCheckOnValueUpdate = false;
          this._subscribe(obj);
        } finally {
          this.markForCheckOnValueUpdate = true;
        }
      }
      return this._latestValue;
    }
    if (obj !== this._obj) {
      this._dispose();
      return this.transform(obj);
    }
    return this._latestValue;
  }
  _subscribe(obj) {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(obj, value => this._updateLatestValue(obj, value), e => this.applicationErrorHandler(e));
  }
  _selectStrategy(obj) {
    if (_isPromise(obj)) {
      return _promiseStrategy;
    }
    if (_isSubscribable(obj)) {
      return _subscribableStrategy;
    }
    throw invalidPipeArgumentError(AsyncPipe, obj);
  }
  _dispose() {
    this._strategy.dispose(this._subscription);
    this._latestValue = null;
    this._subscription = null;
    this._obj = null;
  }
  _updateLatestValue(async, value) {
    if (async === this._obj) {
      this._latestValue = value;
      if (this.markForCheckOnValueUpdate) {
        this._ref?.markForCheck();
      }
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: AsyncPipe,
    deps: [{
      token: i0.ChangeDetectorRef
    }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: AsyncPipe,
    isStandalone: true,
    name: "async",
    pure: false
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: AsyncPipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'async',
      pure: false
    }]
  }],
  ctorParameters: () => [{
    type: i0.ChangeDetectorRef
  }]
});

class LowerCasePipe {
  transform(value) {
    if (value == null) return null;
    if (typeof value !== 'string') {
      throw invalidPipeArgumentError(LowerCasePipe, value);
    }
    return value.toLowerCase();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: LowerCasePipe,
    deps: [],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: LowerCasePipe,
    isStandalone: true,
    name: "lowercase"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: LowerCasePipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'lowercase'
    }]
  }]
});
const unicodeWordMatch = /(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])\S*/g;
class TitleCasePipe {
  transform(value) {
    if (value == null) return null;
    if (typeof value !== 'string') {
      throw invalidPipeArgumentError(TitleCasePipe, value);
    }
    return value.replace(unicodeWordMatch, txt => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: TitleCasePipe,
    deps: [],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: TitleCasePipe,
    isStandalone: true,
    name: "titlecase"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: TitleCasePipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'titlecase'
    }]
  }]
});
class UpperCasePipe {
  transform(value) {
    if (value == null) return null;
    if (typeof value !== 'string') {
      throw invalidPipeArgumentError(UpperCasePipe, value);
    }
    return value.toUpperCase();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: UpperCasePipe,
    deps: [],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: UpperCasePipe,
    isStandalone: true,
    name: "uppercase"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: UpperCasePipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'uppercase'
    }]
  }]
});

const DEFAULT_DATE_FORMAT = 'mediumDate';

const DATE_PIPE_DEFAULT_TIMEZONE = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'DATE_PIPE_DEFAULT_TIMEZONE' : '');
const DATE_PIPE_DEFAULT_OPTIONS = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'DATE_PIPE_DEFAULT_OPTIONS' : '');
class DatePipe {
  locale;
  defaultTimezone;
  defaultOptions;
  constructor(locale, defaultTimezone, defaultOptions) {
    this.locale = locale;
    this.defaultTimezone = defaultTimezone;
    this.defaultOptions = defaultOptions;
  }
  transform(value, format, timezone, locale) {
    if (value == null || value === '' || value !== value) return null;
    try {
      const _format = format ?? this.defaultOptions?.dateFormat ?? DEFAULT_DATE_FORMAT;
      const _timezone = timezone ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? undefined;
      return formatDate(value, _format, locale || this.locale, _timezone);
    } catch (error) {
      throw invalidPipeArgumentError(DatePipe, error.message);
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: DatePipe,
    deps: [{
      token: LOCALE_ID
    }, {
      token: DATE_PIPE_DEFAULT_TIMEZONE,
      optional: true
    }, {
      token: DATE_PIPE_DEFAULT_OPTIONS,
      optional: true
    }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: DatePipe,
    isStandalone: true,
    name: "date"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: DatePipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'date'
    }]
  }],
  ctorParameters: () => [{
    type: undefined,
    decorators: [{
      type: Inject,
      args: [LOCALE_ID]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: Inject,
      args: [DATE_PIPE_DEFAULT_TIMEZONE]
    }, {
      type: Optional
    }]
  }, {
    type: undefined,
    decorators: [{
      type: Inject,
      args: [DATE_PIPE_DEFAULT_OPTIONS]
    }, {
      type: Optional
    }]
  }]
});

const _INTERPOLATION_REGEXP = /#/g;
class I18nPluralPipe {
  _localization;
  constructor(_localization) {
    this._localization = _localization;
  }
  transform(value, pluralMap, locale) {
    if (value == null) return '';
    if (typeof pluralMap !== 'object' || pluralMap === null) {
      throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
    }
    const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
    return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: I18nPluralPipe,
    deps: [{
      token: NgLocalization
    }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: I18nPluralPipe,
    isStandalone: true,
    name: "i18nPlural"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: I18nPluralPipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'i18nPlural'
    }]
  }],
  ctorParameters: () => [{
    type: NgLocalization
  }]
});

class I18nSelectPipe {
  transform(value, mapping) {
    if (value == null) return '';
    if (typeof mapping !== 'object' || typeof value !== 'string') {
      throw invalidPipeArgumentError(I18nSelectPipe, mapping);
    }
    if (mapping.hasOwnProperty(value)) {
      return mapping[value];
    }
    if (mapping.hasOwnProperty('other')) {
      return mapping['other'];
    }
    return '';
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: I18nSelectPipe,
    deps: [],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: I18nSelectPipe,
    isStandalone: true,
    name: "i18nSelect"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: I18nSelectPipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'i18nSelect'
    }]
  }]
});

class JsonPipe {
  transform(value) {
    return JSON.stringify(value, null, 2);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: JsonPipe,
    deps: [],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: JsonPipe,
    isStandalone: true,
    name: "json",
    pure: false
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: JsonPipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'json',
      pure: false
    }]
  }]
});

function makeKeyValuePair(key, value) {
  return {
    key: key,
    value: value
  };
}
class KeyValuePipe {
  differs;
  constructor(differs) {
    this.differs = differs;
  }
  differ;
  keyValues = [];
  compareFn = defaultComparator;
  transform(input, compareFn = defaultComparator) {
    if (!input || !(input instanceof Map) && typeof input !== 'object') {
      return null;
    }
    this.differ ??= this.differs.find(input).create();
    const differChanges = this.differ.diff(input);
    const compareFnChanged = compareFn !== this.compareFn;
    if (differChanges) {
      this.keyValues = [];
      differChanges.forEachItem(r => {
        this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
      });
    }
    if (differChanges || compareFnChanged) {
      if (compareFn) {
        this.keyValues.sort(compareFn);
      }
      this.compareFn = compareFn;
    }
    return this.keyValues;
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: KeyValuePipe,
    deps: [{
      token: i0.KeyValueDiffers
    }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: KeyValuePipe,
    isStandalone: true,
    name: "keyvalue",
    pure: false
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: KeyValuePipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'keyvalue',
      pure: false
    }]
  }],
  ctorParameters: () => [{
    type: i0.KeyValueDiffers
  }]
});
function defaultComparator(keyValueA, keyValueB) {
  const a = keyValueA.key;
  const b = keyValueB.key;
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a == 'string' && typeof b == 'string') {
    return a < b ? -1 : 1;
  }
  if (typeof a == 'number' && typeof b == 'number') {
    return a - b;
  }
  if (typeof a == 'boolean' && typeof b == 'boolean') {
    return a < b ? -1 : 1;
  }
  const aString = String(a);
  const bString = String(b);
  return aString == bString ? 0 : aString < bString ? -1 : 1;
}

class DecimalPipe {
  _locale;
  constructor(_locale) {
    this._locale = _locale;
  }
  transform(value, digitsInfo, locale) {
    if (!isValue(value)) return null;
    locale ||= this._locale;
    try {
      const num = strToNumber(value);
      return formatNumber(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(DecimalPipe, error.message);
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: DecimalPipe,
    deps: [{
      token: LOCALE_ID
    }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: DecimalPipe,
    isStandalone: true,
    name: "number"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: DecimalPipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'number'
    }]
  }],
  ctorParameters: () => [{
    type: undefined,
    decorators: [{
      type: Inject,
      args: [LOCALE_ID]
    }]
  }]
});
class PercentPipe {
  _locale;
  constructor(_locale) {
    this._locale = _locale;
  }
  transform(value, digitsInfo, locale) {
    if (!isValue(value)) return null;
    locale ||= this._locale;
    try {
      const num = strToNumber(value);
      return formatPercent(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(PercentPipe, error.message);
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: PercentPipe,
    deps: [{
      token: LOCALE_ID
    }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: PercentPipe,
    isStandalone: true,
    name: "percent"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: PercentPipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'percent'
    }]
  }],
  ctorParameters: () => [{
    type: undefined,
    decorators: [{
      type: Inject,
      args: [LOCALE_ID]
    }]
  }]
});
class CurrencyPipe {
  _locale;
  _defaultCurrencyCode;
  constructor(_locale, _defaultCurrencyCode = 'USD') {
    this._locale = _locale;
    this._defaultCurrencyCode = _defaultCurrencyCode;
  }
  transform(value, currencyCode = this._defaultCurrencyCode, display = 'symbol', digitsInfo, locale) {
    if (!isValue(value)) return null;
    locale ||= this._locale;
    if (typeof display === 'boolean') {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(`Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
      }
      display = display ? 'symbol' : 'code';
    }
    let currency = currencyCode || this._defaultCurrencyCode;
    if (display !== 'code') {
      if (display === 'symbol' || display === 'symbol-narrow') {
        currency = getCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow', locale);
      } else {
        currency = display;
      }
    }
    try {
      const num = strToNumber(value);
      return formatCurrency(num, locale, currency, currencyCode, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(CurrencyPipe, error.message);
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: CurrencyPipe,
    deps: [{
      token: LOCALE_ID
    }, {
      token: DEFAULT_CURRENCY_CODE
    }],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: CurrencyPipe,
    isStandalone: true,
    name: "currency"
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: CurrencyPipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'currency'
    }]
  }],
  ctorParameters: () => [{
    type: undefined,
    decorators: [{
      type: Inject,
      args: [LOCALE_ID]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: Inject,
      args: [DEFAULT_CURRENCY_CODE]
    }]
  }]
});
function isValue(value) {
  return !(value == null || value === '' || value !== value);
}
function strToNumber(value) {
  if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
    return Number(value);
  }
  if (typeof value !== 'number') {
    throw new _RuntimeError(2309, ngDevMode && `${value} is not a number`);
  }
  return value;
}

class SlicePipe {
  transform(value, start, end) {
    if (value == null) return null;
    const supports = typeof value === 'string' || Array.isArray(value);
    if (!supports) {
      throw invalidPipeArgumentError(SlicePipe, value);
    }
    return value.slice(start, end);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: SlicePipe,
    deps: [],
    target: i0.ɵɵFactoryTarget.Pipe
  });
  static ɵpipe = i0.ɵɵngDeclarePipe({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: SlicePipe,
    isStandalone: true,
    name: "slice",
    pure: false
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: SlicePipe,
  decorators: [{
    type: Pipe,
    args: [{
      name: 'slice',
      pure: false
    }]
  }]
});

const COMMON_PIPES = [AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, KeyValuePipe];

class CommonModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: CommonModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: CommonModule,
    imports: [NgClass, NgComponentOutlet, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase, AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, KeyValuePipe],
    exports: [NgClass, NgComponentOutlet, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase, AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, KeyValuePipe]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-f80b51a",
    ngImport: i0,
    type: CommonModule
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-f80b51a",
  ngImport: i0,
  type: CommonModule,
  decorators: [{
    type: NgModule,
    args: [{
      imports: [COMMON_DIRECTIVES, COMMON_PIPES],
      exports: [COMMON_DIRECTIVES, COMMON_PIPES]
    }]
  }]
});

export { AsyncPipe, CommonModule, CurrencyPipe, DATE_PIPE_DEFAULT_OPTIONS, DATE_PIPE_DEFAULT_TIMEZONE, DatePipe, DecimalPipe, FormStyle, FormatWidth, HashLocationStrategy, I18nPluralPipe, I18nSelectPipe, JsonPipe, KeyValuePipe, LowerCasePipe, NgClass, NgComponentOutlet, NgForOf, NgForOfContext, NgIf, NgIfContext, NgLocaleLocalization, NgLocalization, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet, NumberFormatStyle, NumberSymbol, PercentPipe, Plural, SlicePipe, TitleCasePipe, TranslationWidth, UpperCasePipe, WeekDay, formatCurrency, formatDate, formatNumber, formatPercent, getCurrencySymbol, getLocaleCurrencyCode, getLocaleCurrencyName, getLocaleCurrencySymbol, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleDirection, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleFirstDayOfWeek, getLocaleId, getLocaleMonthNames, getLocaleNumberFormat, getLocaleNumberSymbol, getLocalePluralCase, getLocaleTimeFormat, getLocaleWeekEndRange, getNumberOfCurrencyDigits };
//# sourceMappingURL=_common_module-chunk.mjs.map
