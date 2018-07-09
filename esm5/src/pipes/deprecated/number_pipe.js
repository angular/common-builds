/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { NUMBER_FORMAT_REGEXP, parseIntAutoRadix } from '../../i18n/format_number';
import { NumberFormatStyle } from '../../i18n/locale_data_api';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { NumberFormatter } from './intl';
function formatNumber(pipe, locale, value, style, digits, currency, currencyAsSymbol) {
    if (currency === void 0) { currency = null; }
    if (currencyAsSymbol === void 0) { currencyAsSymbol = false; }
    if (value == null)
        return null;
    // Convert strings to numbers
    value = typeof value === 'string' && !isNaN(+value - parseFloat(value)) ? +value : value;
    if (typeof value !== 'number') {
        throw invalidPipeArgumentError(pipe, value);
    }
    var minInt;
    var minFraction;
    var maxFraction;
    if (style !== NumberFormatStyle.Currency) {
        // rely on Intl default for currency
        minInt = 1;
        minFraction = 0;
        maxFraction = 3;
    }
    if (digits) {
        var parts = digits.match(NUMBER_FORMAT_REGEXP);
        if (parts === null) {
            throw new Error(digits + " is not a valid digit info for number pipes");
        }
        if (parts[1] != null) {
            minInt = parseIntAutoRadix(parts[1]);
        }
        if (parts[3] != null) {
            minFraction = parseIntAutoRadix(parts[3]);
        }
        if (parts[5] != null) {
            maxFraction = parseIntAutoRadix(parts[5]);
        }
    }
    return NumberFormatter.format(value, locale, style, {
        minimumIntegerDigits: minInt,
        minimumFractionDigits: minFraction,
        maximumFractionDigits: maxFraction,
        currency: currency,
        currencyAsSymbol: currencyAsSymbol,
    });
}
/**
 * @ngModule CommonModule
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 * where `expression` is a number:
 *  - `digitInfo` is a `string` which has a following format: <br>
 *     <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>
 *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
 *   - `minFractionDigits` is the minimum number of digits after fraction. Defaults to `0`.
 *   - `maxFractionDigits` is the maximum number of digits after fraction. Defaults to `3`.
 *
 * For more information on the acceptable range for each of these numbers and other
 * details see your native internationalization library.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='DeprecatedNumberPipe'}
 *
 *
 */
var DeprecatedDecimalPipe = /** @class */ (function () {
    function DeprecatedDecimalPipe(_locale) {
        this._locale = _locale;
    }
    DeprecatedDecimalPipe_1 = DeprecatedDecimalPipe;
    DeprecatedDecimalPipe.prototype.transform = function (value, digits) {
        return formatNumber(DeprecatedDecimalPipe_1, this._locale, value, NumberFormatStyle.Decimal, digits);
    };
    DeprecatedDecimalPipe = DeprecatedDecimalPipe_1 = tslib_1.__decorate([
        Pipe({ name: 'number' }),
        tslib_1.__param(0, Inject(LOCALE_ID)),
        tslib_1.__metadata("design:paramtypes", [String])
    ], DeprecatedDecimalPipe);
    return DeprecatedDecimalPipe;
    var DeprecatedDecimalPipe_1;
}());
export { DeprecatedDecimalPipe };
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Formats a number as percentage according to locale rules.
 *
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * ### Example
 *
 * {@example common/pipes/ts/percent_pipe.ts region='DeprecatedPercentPipe'}
 *
 *
 */
var DeprecatedPercentPipe = /** @class */ (function () {
    function DeprecatedPercentPipe(_locale) {
        this._locale = _locale;
    }
    DeprecatedPercentPipe_1 = DeprecatedPercentPipe;
    DeprecatedPercentPipe.prototype.transform = function (value, digits) {
        return formatNumber(DeprecatedPercentPipe_1, this._locale, value, NumberFormatStyle.Percent, digits);
    };
    DeprecatedPercentPipe = DeprecatedPercentPipe_1 = tslib_1.__decorate([
        Pipe({ name: 'percent' }),
        tslib_1.__param(0, Inject(LOCALE_ID)),
        tslib_1.__metadata("design:paramtypes", [String])
    ], DeprecatedPercentPipe);
    return DeprecatedPercentPipe;
    var DeprecatedPercentPipe_1;
}());
export { DeprecatedPercentPipe };
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * Use `currency` to format a number as currency.
 *
 * - `currencyCode` is the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code, such
 *    as `USD` for the US dollar and `EUR` for the euro.
 * - `symbolDisplay` is a boolean indicating whether to use the currency symbol or code.
 *   - `true`: use symbol (e.g. `$`).
 *   - `false`(default): use code (e.g. `USD`).
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * ### Example
 *
 * {@example common/pipes/ts/currency_pipe.ts region='DeprecatedCurrencyPipe'}
 *
 *
 */
var DeprecatedCurrencyPipe = /** @class */ (function () {
    function DeprecatedCurrencyPipe(_locale) {
        this._locale = _locale;
    }
    DeprecatedCurrencyPipe_1 = DeprecatedCurrencyPipe;
    DeprecatedCurrencyPipe.prototype.transform = function (value, currencyCode, symbolDisplay, digits) {
        if (currencyCode === void 0) { currencyCode = 'USD'; }
        if (symbolDisplay === void 0) { symbolDisplay = false; }
        return formatNumber(DeprecatedCurrencyPipe_1, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    };
    DeprecatedCurrencyPipe = DeprecatedCurrencyPipe_1 = tslib_1.__decorate([
        Pipe({ name: 'currency' }),
        tslib_1.__param(0, Inject(LOCALE_ID)),
        tslib_1.__metadata("design:paramtypes", [String])
    ], DeprecatedCurrencyPipe);
    return DeprecatedCurrencyPipe;
    var DeprecatedCurrencyPipe_1;
}());
export { DeprecatedCurrencyPipe };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL2RlcHJlY2F0ZWQvbnVtYmVyX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBc0IsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDeEUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUV2QyxzQkFDSSxJQUFlLEVBQUUsTUFBYyxFQUFFLEtBQXNCLEVBQUUsS0FBd0IsRUFDakYsTUFBc0IsRUFBRSxRQUE4QixFQUN0RCxnQkFBaUM7SUFEVCx5QkFBQSxFQUFBLGVBQThCO0lBQ3RELGlDQUFBLEVBQUEsd0JBQWlDO0lBQ25DLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBRS9CLDZCQUE2QjtJQUM3QixLQUFLLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3pGLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7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TSxDQUFDLFNBQVMsQ0FBQyxDQUFBOztPQURuQixxQkFBcUIsQ0FPakM7SUFBRCw0QkFBQzs7Q0FBQSxBQVBELElBT0M7U0FQWSxxQkFBcUI7QUFTbEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBRUg7SUFDRSxnQ0FBdUMsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDOytCQUQvQyxzQkFBc0I7SUFHakMsMENBQVMsR0FBVCxVQUNJLEtBQVUsRUFBRSxZQUE0QixFQUFFLGFBQThCLEVBQ3hFLE1BQWU7UUFESCw2QkFBQSxFQUFBLG9CQUE0QjtRQUFFLDhCQUFBLEVBQUEscUJBQThCO1FBRTFFLE1BQU0sQ0FBQyxZQUFZLENBQ2Ysd0JBQXNCLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFDL0UsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFUVSxzQkFBc0I7UUFEbEMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxDQUFDO1FBRVYsbUJBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBOztPQURuQixzQkFBc0IsQ0FVbEM7SUFBRCw2QkFBQzs7Q0FBQSxBQVZELElBVUM7U0FWWSxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBMT0NBTEVfSUQsIFBpcGUsIFBpcGVUcmFuc2Zvcm0sIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOVU1CRVJfRk9STUFUX1JFR0VYUCwgcGFyc2VJbnRBdXRvUmFkaXh9IGZyb20gJy4uLy4uL2kxOG4vZm9ybWF0X251bWJlcic7XG5pbXBvcnQge051bWJlckZvcm1hdFN0eWxlfSBmcm9tICcuLi8uLi9pMThuL2xvY2FsZV9kYXRhX2FwaSc7XG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcbmltcG9ydCB7TnVtYmVyRm9ybWF0dGVyfSBmcm9tICcuL2ludGwnO1xuXG5mdW5jdGlvbiBmb3JtYXROdW1iZXIoXG4gICAgcGlwZTogVHlwZTxhbnk+LCBsb2NhbGU6IHN0cmluZywgdmFsdWU6IG51bWJlciB8IHN0cmluZywgc3R5bGU6IE51bWJlckZvcm1hdFN0eWxlLFxuICAgIGRpZ2l0cz86IHN0cmluZyB8IG51bGwsIGN1cnJlbmN5OiBzdHJpbmcgfCBudWxsID0gbnVsbCxcbiAgICBjdXJyZW5jeUFzU3ltYm9sOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAvLyBDb252ZXJ0IHN0cmluZ3MgdG8gbnVtYmVyc1xuICB2YWx1ZSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKCt2YWx1ZSAtIHBhcnNlRmxvYXQodmFsdWUpKSA/ICt2YWx1ZSA6IHZhbHVlO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihwaXBlLCB2YWx1ZSk7XG4gIH1cblxuICBsZXQgbWluSW50OiBudW1iZXJ8dW5kZWZpbmVkO1xuICBsZXQgbWluRnJhY3Rpb246IG51bWJlcnx1bmRlZmluZWQ7XG4gIGxldCBtYXhGcmFjdGlvbjogbnVtYmVyfHVuZGVmaW5lZDtcbiAgaWYgKHN0eWxlICE9PSBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSkge1xuICAgIC8vIHJlbHkgb24gSW50bCBkZWZhdWx0IGZvciBjdXJyZW5jeVxuICAgIG1pbkludCA9IDE7XG4gICAgbWluRnJhY3Rpb24gPSAwO1xuICAgIG1heEZyYWN0aW9uID0gMztcbiAgfVxuXG4gIGlmIChkaWdpdHMpIHtcbiAgICBjb25zdCBwYXJ0cyA9IGRpZ2l0cy5tYXRjaChOVU1CRVJfRk9STUFUX1JFR0VYUCk7XG4gICAgaWYgKHBhcnRzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGlnaXRzfSBpcyBub3QgYSB2YWxpZCBkaWdpdCBpbmZvIGZvciBudW1iZXIgcGlwZXNgKTtcbiAgICB9XG4gICAgaWYgKHBhcnRzWzFdICE9IG51bGwpIHsgIC8vIG1pbiBpbnRlZ2VyIGRpZ2l0c1xuICAgICAgbWluSW50ID0gcGFyc2VJbnRBdXRvUmFkaXgocGFydHNbMV0pO1xuICAgIH1cbiAgICBpZiAocGFydHNbM10gIT0gbnVsbCkgeyAgLy8gbWluIGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgbWluRnJhY3Rpb24gPSBwYXJzZUludEF1dG9SYWRpeChwYXJ0c1szXSk7XG4gICAgfVxuICAgIGlmIChwYXJ0c1s1XSAhPSBudWxsKSB7ICAvLyBtYXggZnJhY3Rpb24gZGlnaXRzXG4gICAgICBtYXhGcmFjdGlvbiA9IHBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzVdKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gTnVtYmVyRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSBhcyBudW1iZXIsIGxvY2FsZSwgc3R5bGUsIHtcbiAgICBtaW5pbXVtSW50ZWdlckRpZ2l0czogbWluSW50LFxuICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogbWluRnJhY3Rpb24sXG4gICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBtYXhGcmFjdGlvbixcbiAgICBjdXJyZW5jeTogY3VycmVuY3ksXG4gICAgY3VycmVuY3lBc1N5bWJvbDogY3VycmVuY3lBc1N5bWJvbCxcbiAgfSk7XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgdGV4dC4gR3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpY1xuICogY29uZmlndXJhdGlvbnMgYXJlIGJhc2VkIG9uIHRoZSBhY3RpdmUgbG9jYWxlLlxuICpcbiAqIHdoZXJlIGBleHByZXNzaW9uYCBpcyBhIG51bWJlcjpcbiAqICAtIGBkaWdpdEluZm9gIGlzIGEgYHN0cmluZ2Agd2hpY2ggaGFzIGEgZm9sbG93aW5nIGZvcm1hdDogPGJyPlxuICogICAgIDxjb2RlPnttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c308L2NvZGU+XG4gKiAgIC0gYG1pbkludGVnZXJEaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBpbnRlZ2VyIGRpZ2l0cyB0byB1c2UuIERlZmF1bHRzIHRvIGAxYC5cbiAqICAgLSBgbWluRnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIGAwYC5cbiAqICAgLSBgbWF4RnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIGAzYC5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgYWNjZXB0YWJsZSByYW5nZSBmb3IgZWFjaCBvZiB0aGVzZSBudW1iZXJzIGFuZCBvdGhlclxuICogZGV0YWlscyBzZWUgeW91ciBuYXRpdmUgaW50ZXJuYXRpb25hbGl6YXRpb24gbGlicmFyeS5cbiAqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJIHdoaWNoIGlzIG5vdCB5ZXQgYXZhaWxhYmxlIGluIGFsbCBicm93c2Vyc1xuICogYW5kIG1heSByZXF1aXJlIGEgcG9seWZpbGwuIFNlZSBbQnJvd3NlciBTdXBwb3J0XShndWlkZS9icm93c2VyLXN1cHBvcnQpIGZvciBkZXRhaWxzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9udW1iZXJfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWROdW1iZXJQaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ251bWJlcid9KVxuZXhwb3J0IGNsYXNzIERlcHJlY2F0ZWREZWNpbWFsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGRpZ2l0cz86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gZm9ybWF0TnVtYmVyKFxuICAgICAgICBEZXByZWNhdGVkRGVjaW1hbFBpcGUsIHRoaXMuX2xvY2FsZSwgdmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLkRlY2ltYWwsIGRpZ2l0cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBwZXJjZW50YWdlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogLSBgZGlnaXRJbmZvYCBTZWUge0BsaW5rIERlY2ltYWxQaXBlfSBmb3IgZGV0YWlsZWQgZGVzY3JpcHRpb24uXG4gKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSSB3aGljaCBpcyBub3QgeWV0IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnNcbiAqIGFuZCBtYXkgcmVxdWlyZSBhIHBvbHlmaWxsLiBTZWUgW0Jyb3dzZXIgU3VwcG9ydF0oZ3VpZGUvYnJvd3Nlci1zdXBwb3J0KSBmb3IgZGV0YWlscy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvcGVyY2VudF9waXBlLnRzIHJlZ2lvbj0nRGVwcmVjYXRlZFBlcmNlbnRQaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ3BlcmNlbnQnfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkUGVyY2VudFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZFBlcmNlbnRQaXBlLCB0aGlzLl9sb2NhbGUsIHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5QZXJjZW50LCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBjdXJyZW5jeSB1c2luZyBsb2NhbGUgcnVsZXMuXG4gKlxuICogVXNlIGBjdXJyZW5jeWAgdG8gZm9ybWF0IGEgbnVtYmVyIGFzIGN1cnJlbmN5LlxuICpcbiAqIC0gYGN1cnJlbmN5Q29kZWAgaXMgdGhlIFtJU08gNDIxN10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTcpIGN1cnJlbmN5IGNvZGUsIHN1Y2hcbiAqICAgIGFzIGBVU0RgIGZvciB0aGUgVVMgZG9sbGFyIGFuZCBgRVVSYCBmb3IgdGhlIGV1cm8uXG4gKiAtIGBzeW1ib2xEaXNwbGF5YCBpcyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSB0aGUgY3VycmVuY3kgc3ltYm9sIG9yIGNvZGUuXG4gKiAgIC0gYHRydWVgOiB1c2Ugc3ltYm9sIChlLmcuIGAkYCkuXG4gKiAgIC0gYGZhbHNlYChkZWZhdWx0KTogdXNlIGNvZGUgKGUuZy4gYFVTRGApLlxuICogLSBgZGlnaXRJbmZvYCBTZWUge0BsaW5rIERlY2ltYWxQaXBlfSBmb3IgZGV0YWlsZWQgZGVzY3JpcHRpb24uXG4gKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSSB3aGljaCBpcyBub3QgeWV0IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnNcbiAqIGFuZCBtYXkgcmVxdWlyZSBhIHBvbHlmaWxsLiBTZWUgW0Jyb3dzZXIgU3VwcG9ydF0oZ3VpZGUvYnJvd3Nlci1zdXBwb3J0KSBmb3IgZGV0YWlscy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvY3VycmVuY3lfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWRDdXJyZW5jeVBpcGUnfVxuICpcbiAqXG4gKi9cbkBQaXBlKHtuYW1lOiAnY3VycmVuY3knfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkQ3VycmVuY3lQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0oXG4gICAgICB2YWx1ZTogYW55LCBjdXJyZW5jeUNvZGU6IHN0cmluZyA9ICdVU0QnLCBzeW1ib2xEaXNwbGF5OiBib29sZWFuID0gZmFsc2UsXG4gICAgICBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZEN1cnJlbmN5UGlwZSwgdGhpcy5fbG9jYWxlLCB2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3ksIGRpZ2l0cyxcbiAgICAgICAgY3VycmVuY3lDb2RlLCBzeW1ib2xEaXNwbGF5KTtcbiAgfVxufVxuIl19