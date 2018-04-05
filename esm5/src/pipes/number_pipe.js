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
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { formatCurrency, formatNumber, formatPercent } from '../i18n/format_number';
import { getCurrencySymbol } from '../i18n/locale_data_api';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Uses the function {\@link formatNumber} to format a number according to locale rules.
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the locale.
 *
 * ### Example
 *
 * {\@example common/pipes/ts/number_pipe.ts region='NumberPipe'}
 *
 * \@stable
 */
var DecimalPipe = /** @class */ (function () {
    function DecimalPipe(_locale) {
        this._locale = _locale;
    }
    /**
     * @param value a number to be formatted.
     * @param digitsInfo a `string` which has a following format: <br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
     *   - `minFractionDigits` is the minimum number of digits after the decimal point. Defaults to
     * `0`.
     *   - `maxFractionDigits` is the maximum number of digits after the decimal point. Defaults to
     * `3`.
     * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
     * default).
     */
    /**
     * @param {?} value a number to be formatted.
     * @param {?=} digitsInfo a `string` which has a following format: <br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
     *   - `minFractionDigits` is the minimum number of digits after the decimal point. Defaults to
     * `0`.
     *   - `maxFractionDigits` is the maximum number of digits after the decimal point. Defaults to
     * `3`.
     * @param {?=} locale a `string` defining the locale to use (uses the current {\@link LOCALE_ID} by
     * default).
     * @return {?}
     */
    DecimalPipe.prototype.transform = /**
     * @param {?} value a number to be formatted.
     * @param {?=} digitsInfo a `string` which has a following format: <br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
     *   - `minFractionDigits` is the minimum number of digits after the decimal point. Defaults to
     * `0`.
     *   - `maxFractionDigits` is the maximum number of digits after the decimal point. Defaults to
     * `3`.
     * @param {?=} locale a `string` defining the locale to use (uses the current {\@link LOCALE_ID} by
     * default).
     * @return {?}
     */
    function (value, digitsInfo, locale) {
        if (isEmpty(value))
            return null;
        locale = locale || this._locale;
        try {
            var /** @type {?} */ num = strToNumber(value);
            return formatNumber(num, locale, digitsInfo);
        }
        catch (/** @type {?} */ error) {
            throw invalidPipeArgumentError(DecimalPipe, error.message);
        }
    };
    DecimalPipe.decorators = [
        { type: Pipe, args: [{ name: 'number' },] },
    ];
    /** @nocollapse */
    DecimalPipe.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
    ]; };
    return DecimalPipe;
}());
export { DecimalPipe };
function DecimalPipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    DecimalPipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    DecimalPipe.ctorParameters;
    /** @type {?} */
    DecimalPipe.prototype._locale;
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Uses the function {\@link formatPercent} to format a number as a percentage according
 * to locale rules.
 *
 * ### Example
 *
 * {\@example common/pipes/ts/percent_pipe.ts region='PercentPipe'}
 *
 * \@stable
 */
var PercentPipe = /** @class */ (function () {
    function PercentPipe(_locale) {
        this._locale = _locale;
    }
    /**
     *
     * @param value a number to be formatted as a percentage.
     * @param digitsInfo see {@link DecimalPipe} for more details.
     * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
   * default).
     */
    /**
     *
     * @param {?} value a number to be formatted as a percentage.
     * @param {?=} digitsInfo see {\@link DecimalPipe} for more details.
     * @param {?=} locale a `string` defining the locale to use (uses the current {\@link LOCALE_ID} by
     * default).
     * @return {?}
     */
    PercentPipe.prototype.transform = /**
     *
     * @param {?} value a number to be formatted as a percentage.
     * @param {?=} digitsInfo see {\@link DecimalPipe} for more details.
     * @param {?=} locale a `string` defining the locale to use (uses the current {\@link LOCALE_ID} by
     * default).
     * @return {?}
     */
    function (value, digitsInfo, locale) {
        if (isEmpty(value))
            return null;
        locale = locale || this._locale;
        try {
            var /** @type {?} */ num = strToNumber(value);
            return formatPercent(num, locale, digitsInfo);
        }
        catch (/** @type {?} */ error) {
            throw invalidPipeArgumentError(PercentPipe, error.message);
        }
    };
    PercentPipe.decorators = [
        { type: Pipe, args: [{ name: 'percent' },] },
    ];
    /** @nocollapse */
    PercentPipe.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
    ]; };
    return PercentPipe;
}());
export { PercentPipe };
function PercentPipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    PercentPipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    PercentPipe.ctorParameters;
    /** @type {?} */
    PercentPipe.prototype._locale;
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Uses the functions {\@link getCurrencySymbol} and {\@link formatCurrency} to format a
 * number as currency using locale rules.
 *
 * ### Example
 *
 * {\@example common/pipes/ts/currency_pipe.ts region='CurrencyPipe'}
 *
 * \@stable
 */
var CurrencyPipe = /** @class */ (function () {
    function CurrencyPipe(_locale) {
        this._locale = _locale;
    }
    /**
     *
     * @param value a number to be formatted as currency.
     * @param currencyCodeis the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code,
     * such as `USD` for the US dollar and `EUR` for the euro.
     * @param display indicates whether to show the currency symbol, the code or a custom value:
     *   - `code`: use code (e.g. `USD`).
     *   - `symbol`(default): use symbol (e.g. `$`).
     *   - `symbol-narrow`: some countries have two symbols for their currency, one regular and one
     *     narrow (e.g. the canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`).
     *   - `string`: use this value instead of a code or a symbol.
     *   - boolean (deprecated from v5): `true` for symbol and false for `code`.
     *   If there is no narrow symbol for the chosen currency, the regular symbol will be used.
     * @param digitsInfo see {@link DecimalPipe} for more details.
     * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
     * default).
     */
    /**
     *
     * @param {?} value a number to be formatted as currency.
     * @param {?=} currencyCode
     * @param {?=} display indicates whether to show the currency symbol, the code or a custom value:
     *   - `code`: use code (e.g. `USD`).
     *   - `symbol`(default): use symbol (e.g. `$`).
     *   - `symbol-narrow`: some countries have two symbols for their currency, one regular and one
     *     narrow (e.g. the canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`).
     *   - `string`: use this value instead of a code or a symbol.
     *   - boolean (deprecated from v5): `true` for symbol and false for `code`.
     *   If there is no narrow symbol for the chosen currency, the regular symbol will be used.
     * @param {?=} digitsInfo see {\@link DecimalPipe} for more details.
     * @param {?=} locale a `string` defining the locale to use (uses the current {\@link LOCALE_ID} by
     * default).
     * @return {?}
     */
    CurrencyPipe.prototype.transform = /**
     *
     * @param {?} value a number to be formatted as currency.
     * @param {?=} currencyCode
     * @param {?=} display indicates whether to show the currency symbol, the code or a custom value:
     *   - `code`: use code (e.g. `USD`).
     *   - `symbol`(default): use symbol (e.g. `$`).
     *   - `symbol-narrow`: some countries have two symbols for their currency, one regular and one
     *     narrow (e.g. the canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`).
     *   - `string`: use this value instead of a code or a symbol.
     *   - boolean (deprecated from v5): `true` for symbol and false for `code`.
     *   If there is no narrow symbol for the chosen currency, the regular symbol will be used.
     * @param {?=} digitsInfo see {\@link DecimalPipe} for more details.
     * @param {?=} locale a `string` defining the locale to use (uses the current {\@link LOCALE_ID} by
     * default).
     * @return {?}
     */
    function (value, currencyCode, display, digitsInfo, locale) {
        if (display === void 0) { display = 'symbol'; }
        if (isEmpty(value))
            return null;
        locale = locale || this._locale;
        if (typeof display === 'boolean') {
            if (/** @type {?} */ (console) && /** @type {?} */ (console.warn)) {
                console.warn("Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are \"code\", \"symbol\" or \"symbol-narrow\".");
            }
            display = display ? 'symbol' : 'code';
        }
        var /** @type {?} */ currency = currencyCode || 'USD';
        if (display !== 'code') {
            if (display === 'symbol' || display === 'symbol-narrow') {
                currency = getCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow', locale);
            }
            else {
                currency = display;
            }
        }
        try {
            var /** @type {?} */ num = strToNumber(value);
            return formatCurrency(num, locale, currency, currencyCode, digitsInfo);
        }
        catch (/** @type {?} */ error) {
            throw invalidPipeArgumentError(CurrencyPipe, error.message);
        }
    };
    CurrencyPipe.decorators = [
        { type: Pipe, args: [{ name: 'currency' },] },
    ];
    /** @nocollapse */
    CurrencyPipe.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
    ]; };
    return CurrencyPipe;
}());
export { CurrencyPipe };
function CurrencyPipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    CurrencyPipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    CurrencyPipe.ctorParameters;
    /** @type {?} */
    CurrencyPipe.prototype._locale;
}
/**
 * @param {?} value
 * @return {?}
 */
function isEmpty(value) {
    return value == null || value === '' || value !== value;
}
/**
 * Transforms a string into a number (if needed)
 * @param {?} value
 * @return {?}
 */
function strToNumber(value) {
    // Convert strings to numbers
    if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
        return Number(value);
    }
    if (typeof value !== 'number') {
        throw new Error(value + " is not a number");
    }
    return value;
}
//# sourceMappingURL=number_pipe.js.map