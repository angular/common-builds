/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { NumberFormatStyle, NumberFormatter } from '../facade/intl';
import { NumberWrapper, isBlank, isNumber, isPresent, isString } from '../facade/lang';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
const _NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(\-(\d+))?)?$/;
function formatNumber(pipe, locale, value, style, digits, currency = null, currencyAsSymbol = false) {
    if (isBlank(value))
        return null;
    // Convert strings to numbers
    value = isString(value) && NumberWrapper.isNumeric(value) ? +value : value;
    if (!isNumber(value)) {
        throw new InvalidPipeArgumentException(pipe, value);
    }
    let minInt;
    let minFraction;
    let maxFraction;
    if (style !== NumberFormatStyle.Currency) {
        // rely on Intl default for currency
        minInt = 1;
        minFraction = 0;
        maxFraction = 3;
    }
    if (isPresent(digits)) {
        var parts = digits.match(_NUMBER_FORMAT_REGEXP);
        if (parts === null) {
            throw new Error(`${digits} is not a valid digit info for number pipes`);
        }
        if (isPresent(parts[1])) {
            minInt = NumberWrapper.parseIntAutoRadix(parts[1]);
        }
        if (isPresent(parts[3])) {
            minFraction = NumberWrapper.parseIntAutoRadix(parts[3]);
        }
        if (isPresent(parts[5])) {
            maxFraction = NumberWrapper.parseIntAutoRadix(parts[5]);
        }
    }
    return NumberFormatter.format(value, locale, style, {
        minimumIntegerDigits: minInt,
        minimumFractionDigits: minFraction,
        maximumFractionDigits: maxFraction,
        currency: currency,
        currencyAsSymbol: currencyAsSymbol
    });
}
export class DecimalPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    transform(value, digits = null) {
        return formatNumber(DecimalPipe, this._locale, value, NumberFormatStyle.Decimal, digits);
    }
}
/** @nocollapse */
DecimalPipe.decorators = [
    { type: Pipe, args: [{ name: 'number' },] },
];
/** @nocollapse */
DecimalPipe.ctorParameters = [
    { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
];
export class PercentPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    transform(value, digits = null) {
        return formatNumber(PercentPipe, this._locale, value, NumberFormatStyle.Percent, digits);
    }
}
/** @nocollapse */
PercentPipe.decorators = [
    { type: Pipe, args: [{ name: 'percent' },] },
];
/** @nocollapse */
PercentPipe.ctorParameters = [
    { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
];
export class CurrencyPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    transform(value, currencyCode = 'USD', symbolDisplay = false, digits = null) {
        return formatNumber(CurrencyPipe, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    }
}
/** @nocollapse */
CurrencyPipe.decorators = [
    { type: Pipe, args: [{ name: 'currency' },] },
];
/** @nocollapse */
CurrencyPipe.ctorParameters = [
    { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
];
//# sourceMappingURL=number_pipe.js.map