/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var core_1 = require('@angular/core');
var intl_1 = require('../facade/intl');
var lang_1 = require('../facade/lang');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
var _NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(\-(\d+))?)?$/;
function formatNumber(pipe, locale, value, style, digits, currency, currencyAsSymbol) {
    if (currency === void 0) { currency = null; }
    if (currencyAsSymbol === void 0) { currencyAsSymbol = false; }
    if (lang_1.isBlank(value))
        return null;
    // Convert strings to numbers
    value = lang_1.isString(value) && lang_1.NumberWrapper.isNumeric(value) ? +value : value;
    if (!lang_1.isNumber(value)) {
        throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(pipe, value);
    }
    var minInt;
    var minFraction;
    var maxFraction;
    if (style !== intl_1.NumberFormatStyle.Currency) {
        // rely on Intl default for currency
        minInt = 1;
        minFraction = 0;
        maxFraction = 3;
    }
    if (lang_1.isPresent(digits)) {
        var parts = digits.match(_NUMBER_FORMAT_REGEXP);
        if (parts === null) {
            throw new Error(digits + " is not a valid digit info for number pipes");
        }
        if (lang_1.isPresent(parts[1])) {
            minInt = lang_1.NumberWrapper.parseIntAutoRadix(parts[1]);
        }
        if (lang_1.isPresent(parts[3])) {
            minFraction = lang_1.NumberWrapper.parseIntAutoRadix(parts[3]);
        }
        if (lang_1.isPresent(parts[5])) {
            maxFraction = lang_1.NumberWrapper.parseIntAutoRadix(parts[5]);
        }
    }
    return intl_1.NumberFormatter.format(value, locale, style, {
        minimumIntegerDigits: minInt,
        minimumFractionDigits: minFraction,
        maximumFractionDigits: maxFraction,
        currency: currency,
        currencyAsSymbol: currencyAsSymbol
    });
}
var DecimalPipe = (function () {
    function DecimalPipe(_locale) {
        this._locale = _locale;
    }
    DecimalPipe.prototype.transform = function (value, digits) {
        if (digits === void 0) { digits = null; }
        return formatNumber(DecimalPipe, this._locale, value, intl_1.NumberFormatStyle.Decimal, digits);
    };
    /** @nocollapse */
    DecimalPipe.decorators = [
        { type: core_1.Pipe, args: [{ name: 'number' },] },
    ];
    /** @nocollapse */
    DecimalPipe.ctorParameters = [
        { type: undefined, decorators: [{ type: core_1.Inject, args: [core_1.LOCALE_ID,] },] },
    ];
    return DecimalPipe;
}());
exports.DecimalPipe = DecimalPipe;
var PercentPipe = (function () {
    function PercentPipe(_locale) {
        this._locale = _locale;
    }
    PercentPipe.prototype.transform = function (value, digits) {
        if (digits === void 0) { digits = null; }
        return formatNumber(PercentPipe, this._locale, value, intl_1.NumberFormatStyle.Percent, digits);
    };
    /** @nocollapse */
    PercentPipe.decorators = [
        { type: core_1.Pipe, args: [{ name: 'percent' },] },
    ];
    /** @nocollapse */
    PercentPipe.ctorParameters = [
        { type: undefined, decorators: [{ type: core_1.Inject, args: [core_1.LOCALE_ID,] },] },
    ];
    return PercentPipe;
}());
exports.PercentPipe = PercentPipe;
var CurrencyPipe = (function () {
    function CurrencyPipe(_locale) {
        this._locale = _locale;
    }
    CurrencyPipe.prototype.transform = function (value, currencyCode, symbolDisplay, digits) {
        if (currencyCode === void 0) { currencyCode = 'USD'; }
        if (symbolDisplay === void 0) { symbolDisplay = false; }
        if (digits === void 0) { digits = null; }
        return formatNumber(CurrencyPipe, this._locale, value, intl_1.NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    };
    /** @nocollapse */
    CurrencyPipe.decorators = [
        { type: core_1.Pipe, args: [{ name: 'currency' },] },
    ];
    /** @nocollapse */
    CurrencyPipe.ctorParameters = [
        { type: undefined, decorators: [{ type: core_1.Inject, args: [core_1.LOCALE_ID,] },] },
    ];
    return CurrencyPipe;
}());
exports.CurrencyPipe = CurrencyPipe;
//# sourceMappingURL=number_pipe.js.map