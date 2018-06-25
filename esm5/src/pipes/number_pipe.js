/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { formatCurrency, formatNumber, formatPercent } from '../i18n/format_number';
import { getCurrencySymbol } from '../i18n/locale_data_api';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * @ngModule CommonModule
 * @description
 *
 * Uses the function {@link formatNumber} to format a number according to locale rules.
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the locale.
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='NumberPipe'}
 *
 *
 */
var DecimalPipe = /** @class */ (function () {
    function DecimalPipe(_locale) {
        this._locale = _locale;
    }
    DecimalPipe_1 = DecimalPipe;
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
    DecimalPipe.prototype.transform = function (value, digitsInfo, locale) {
        if (isEmpty(value))
            return null;
        locale = locale || this._locale;
        try {
            var num = strToNumber(value);
            return formatNumber(num, locale, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(DecimalPipe_1, error.message);
        }
    };
    DecimalPipe = DecimalPipe_1 = tslib_1.__decorate([
        Pipe({ name: 'number' }),
        tslib_1.__param(0, Inject(LOCALE_ID)),
        tslib_1.__metadata("design:paramtypes", [String])
    ], DecimalPipe);
    return DecimalPipe;
    var DecimalPipe_1;
}());
export { DecimalPipe };
/**
 * @ngModule CommonModule
 * @description
 *
 * Uses the function {@link formatPercent} to format a number as a percentage according
 * to locale rules.
 *
 * ### Example
 *
 * {@example common/pipes/ts/percent_pipe.ts region='PercentPipe'}
 *
 *
 */
var PercentPipe = /** @class */ (function () {
    function PercentPipe(_locale) {
        this._locale = _locale;
    }
    PercentPipe_1 = PercentPipe;
    /**
     *
     * @param value a number to be formatted as a percentage.
     * @param digitsInfo see {@link DecimalPipe} for more details.
     * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
   * default).
     */
    PercentPipe.prototype.transform = function (value, digitsInfo, locale) {
        if (isEmpty(value))
            return null;
        locale = locale || this._locale;
        try {
            var num = strToNumber(value);
            return formatPercent(num, locale, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(PercentPipe_1, error.message);
        }
    };
    PercentPipe = PercentPipe_1 = tslib_1.__decorate([
        Pipe({ name: 'percent' }),
        tslib_1.__param(0, Inject(LOCALE_ID)),
        tslib_1.__metadata("design:paramtypes", [String])
    ], PercentPipe);
    return PercentPipe;
    var PercentPipe_1;
}());
export { PercentPipe };
/**
 * @ngModule CommonModule
 * @description
 *
 * Uses the functions {@link getCurrencySymbol} and {@link formatCurrency} to format a
 * number as currency using locale rules.
 *
 * ### Example
 *
 * {@example common/pipes/ts/currency_pipe.ts region='CurrencyPipe'}
 *
 *
 */
var CurrencyPipe = /** @class */ (function () {
    function CurrencyPipe(_locale) {
        this._locale = _locale;
    }
    CurrencyPipe_1 = CurrencyPipe;
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
    CurrencyPipe.prototype.transform = function (value, currencyCode, display, digitsInfo, locale) {
        if (display === void 0) { display = 'symbol'; }
        if (isEmpty(value))
            return null;
        locale = locale || this._locale;
        if (typeof display === 'boolean') {
            if (console && console.warn) {
                console.warn("Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are \"code\", \"symbol\" or \"symbol-narrow\".");
            }
            display = display ? 'symbol' : 'code';
        }
        var currency = currencyCode || 'USD';
        if (display !== 'code') {
            if (display === 'symbol' || display === 'symbol-narrow') {
                currency = getCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow', locale);
            }
            else {
                currency = display;
            }
        }
        try {
            var num = strToNumber(value);
            return formatCurrency(num, locale, currency, currencyCode, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(CurrencyPipe_1, error.message);
        }
    };
    CurrencyPipe = CurrencyPipe_1 = tslib_1.__decorate([
        Pipe({ name: 'currency' }),
        tslib_1.__param(0, Inject(LOCALE_ID)),
        tslib_1.__metadata("design:paramtypes", [String])
    ], CurrencyPipe);
    return CurrencyPipe;
    var CurrencyPipe_1;
}());
export { CurrencyPipe };
function isEmpty(value) {
    return value == null || value === '' || value !== value;
}
/**
 * Transforms a string into a number (if needed)
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBQ3JFLE9BQU8sRUFBQyxjQUFjLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBRXZFOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUg7SUFDRSxxQkFBdUMsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO29CQUQvQyxXQUFXO0lBR3RCOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsK0JBQVMsR0FBVCxVQUFVLEtBQVUsRUFBRSxVQUFtQixFQUFFLE1BQWU7UUFDeEQsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFaEMsTUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRWhDLElBQUk7WUFDRixJQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsT0FBTyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM5QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsTUFBTSx3QkFBd0IsQ0FBQyxhQUFXLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzVEO0lBQ0gsQ0FBQztJQTFCVSxXQUFXO1FBRHZCLElBQUksQ0FBQyxFQUFDLElBQUksRUFB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QyxDQUFDO1FBRVYsbUJBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBOztPQURuQixZQUFZLENBb0R4QjtJQUFELG1CQUFDOztDQUFBLEFBcERELElBb0RDO1NBcERZLFlBQVk7QUFzRHpCLGlCQUFpQixLQUFVO0lBQ3pCLE9BQU8sS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUM7QUFDMUQsQ0FBQztBQUVEOztHQUVHO0FBQ0gscUJBQXFCLEtBQXNCO0lBQ3pDLDZCQUE2QjtJQUM3QixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDMUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDdEI7SUFDRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixNQUFNLElBQUksS0FBSyxDQUFJLEtBQUsscUJBQWtCLENBQUMsQ0FBQztLQUM3QztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIExPQ0FMRV9JRCwgUGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zvcm1hdEN1cnJlbmN5LCBmb3JtYXROdW1iZXIsIGZvcm1hdFBlcmNlbnR9IGZyb20gJy4uL2kxOG4vZm9ybWF0X251bWJlcic7XG5pbXBvcnQge2dldEN1cnJlbmN5U3ltYm9sfSBmcm9tICcuLi9pMThuL2xvY2FsZV9kYXRhX2FwaSc7XG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFVzZXMgdGhlIGZ1bmN0aW9uIHtAbGluayBmb3JtYXROdW1iZXJ9IHRvIGZvcm1hdCBhIG51bWJlciBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgdGV4dC4gR3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpY1xuICogY29uZmlndXJhdGlvbnMgYXJlIGJhc2VkIG9uIHRoZSBsb2NhbGUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL251bWJlcl9waXBlLnRzIHJlZ2lvbj0nTnVtYmVyUGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdudW1iZXInfSlcbmV4cG9ydCBjbGFzcyBEZWNpbWFsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBhIG51bWJlciB0byBiZSBmb3JtYXR0ZWQuXG4gICAqIEBwYXJhbSBkaWdpdHNJbmZvIGEgYHN0cmluZ2Agd2hpY2ggaGFzIGEgZm9sbG93aW5nIGZvcm1hdDogPGJyPlxuICAgKiA8Y29kZT57bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9PC9jb2RlPi5cbiAgICogICAtIGBtaW5JbnRlZ2VyRGlnaXRzYCBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgdG8gdXNlLiBEZWZhdWx0cyB0byBgMWAuXG4gICAqICAgLSBgbWluRnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuIERlZmF1bHRzIHRvXG4gICAqIGAwYC5cbiAgICogICAtIGBtYXhGcmFjdGlvbkRpZ2l0c2AgaXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciB0aGUgZGVjaW1hbCBwb2ludC4gRGVmYXVsdHMgdG9cbiAgICogYDNgLlxuICAgKiBAcGFyYW0gbG9jYWxlIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UgKHVzZXMgdGhlIGN1cnJlbnQge0BsaW5rIExPQ0FMRV9JRH0gYnlcbiAgICogZGVmYXVsdCkuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmIChpc0VtcHR5KHZhbHVlKSkgcmV0dXJuIG51bGw7XG5cbiAgICBsb2NhbGUgPSBsb2NhbGUgfHwgdGhpcy5fbG9jYWxlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG51bSA9IHN0clRvTnVtYmVyKHZhbHVlKTtcbiAgICAgIHJldHVybiBmb3JtYXROdW1iZXIobnVtLCBsb2NhbGUsIGRpZ2l0c0luZm8pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoRGVjaW1hbFBpcGUsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFVzZXMgdGhlIGZ1bmN0aW9uIHtAbGluayBmb3JtYXRQZXJjZW50fSB0byBmb3JtYXQgYSBudW1iZXIgYXMgYSBwZXJjZW50YWdlIGFjY29yZGluZ1xuICogdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9wZXJjZW50X3BpcGUudHMgcmVnaW9uPSdQZXJjZW50UGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdwZXJjZW50J30pXG5leHBvcnQgY2xhc3MgUGVyY2VudFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgYSBudW1iZXIgdG8gYmUgZm9ybWF0dGVkIGFzIGEgcGVyY2VudGFnZS5cbiAgICogQHBhcmFtIGRpZ2l0c0luZm8gc2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIG1vcmUgZGV0YWlscy5cbiAgICogQHBhcmFtIGxvY2FsZSBhIGBzdHJpbmdgIGRlZmluaW5nIHRoZSBsb2NhbGUgdG8gdXNlICh1c2VzIHRoZSBjdXJyZW50IHtAbGluayBMT0NBTEVfSUR9IGJ5XG4gKiBkZWZhdWx0KS5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBkaWdpdHNJbmZvPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKGlzRW1wdHkodmFsdWUpKSByZXR1cm4gbnVsbDtcblxuICAgIGxvY2FsZSA9IGxvY2FsZSB8fCB0aGlzLl9sb2NhbGU7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gc3RyVG9OdW1iZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGZvcm1hdFBlcmNlbnQobnVtLCBsb2NhbGUsIGRpZ2l0c0luZm8pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoUGVyY2VudFBpcGUsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFVzZXMgdGhlIGZ1bmN0aW9ucyB7QGxpbmsgZ2V0Q3VycmVuY3lTeW1ib2x9IGFuZCB7QGxpbmsgZm9ybWF0Q3VycmVuY3l9IHRvIGZvcm1hdCBhXG4gKiBudW1iZXIgYXMgY3VycmVuY3kgdXNpbmcgbG9jYWxlIHJ1bGVzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9jdXJyZW5jeV9waXBlLnRzIHJlZ2lvbj0nQ3VycmVuY3lQaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ2N1cnJlbmN5J30pXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIGEgbnVtYmVyIHRvIGJlIGZvcm1hdHRlZCBhcyBjdXJyZW5jeS5cbiAgICogQHBhcmFtIGN1cnJlbmN5Q29kZWlzIHRoZSBbSVNPIDQyMTddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT180MjE3KSBjdXJyZW5jeSBjb2RlLFxuICAgKiBzdWNoIGFzIGBVU0RgIGZvciB0aGUgVVMgZG9sbGFyIGFuZCBgRVVSYCBmb3IgdGhlIGV1cm8uXG4gICAqIEBwYXJhbSBkaXNwbGF5IGluZGljYXRlcyB3aGV0aGVyIHRvIHNob3cgdGhlIGN1cnJlbmN5IHN5bWJvbCwgdGhlIGNvZGUgb3IgYSBjdXN0b20gdmFsdWU6XG4gICAqICAgLSBgY29kZWA6IHVzZSBjb2RlIChlLmcuIGBVU0RgKS5cbiAgICogICAtIGBzeW1ib2xgKGRlZmF1bHQpOiB1c2Ugc3ltYm9sIChlLmcuIGAkYCkuXG4gICAqICAgLSBgc3ltYm9sLW5hcnJvd2A6IHNvbWUgY291bnRyaWVzIGhhdmUgdHdvIHN5bWJvbHMgZm9yIHRoZWlyIGN1cnJlbmN5LCBvbmUgcmVndWxhciBhbmQgb25lXG4gICAqICAgICBuYXJyb3cgKGUuZy4gdGhlIGNhbmFkaWFuIGRvbGxhciBDQUQgaGFzIHRoZSBzeW1ib2wgYENBJGAgYW5kIHRoZSBzeW1ib2wtbmFycm93IGAkYCkuXG4gICAqICAgLSBgc3RyaW5nYDogdXNlIHRoaXMgdmFsdWUgaW5zdGVhZCBvZiBhIGNvZGUgb3IgYSBzeW1ib2wuXG4gICAqICAgLSBib29sZWFuIChkZXByZWNhdGVkIGZyb20gdjUpOiBgdHJ1ZWAgZm9yIHN5bWJvbCBhbmQgZmFsc2UgZm9yIGBjb2RlYC5cbiAgICogICBJZiB0aGVyZSBpcyBubyBuYXJyb3cgc3ltYm9sIGZvciB0aGUgY2hvc2VuIGN1cnJlbmN5LCB0aGUgcmVndWxhciBzeW1ib2wgd2lsbCBiZSB1c2VkLlxuICAgKiBAcGFyYW0gZGlnaXRzSW5mbyBzZWUge0BsaW5rIERlY2ltYWxQaXBlfSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKiBAcGFyYW0gbG9jYWxlIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UgKHVzZXMgdGhlIGN1cnJlbnQge0BsaW5rIExPQ0FMRV9JRH0gYnlcbiAgICogZGVmYXVsdCkuXG4gICAqL1xuICB0cmFuc2Zvcm0oXG4gICAgICB2YWx1ZTogYW55LCBjdXJyZW5jeUNvZGU/OiBzdHJpbmcsXG4gICAgICBkaXNwbGF5OiAnY29kZSd8J3N5bWJvbCd8J3N5bWJvbC1uYXJyb3cnfHN0cmluZ3xib29sZWFuID0gJ3N5bWJvbCcsIGRpZ2l0c0luZm8/OiBzdHJpbmcsXG4gICAgICBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKGlzRW1wdHkodmFsdWUpKSByZXR1cm4gbnVsbDtcblxuICAgIGxvY2FsZSA9IGxvY2FsZSB8fCB0aGlzLl9sb2NhbGU7XG5cbiAgICBpZiAodHlwZW9mIGRpc3BsYXkgPT09ICdib29sZWFuJykge1xuICAgICAgaWYgKDxhbnk+Y29uc29sZSAmJiA8YW55PmNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICBgV2FybmluZzogdGhlIGN1cnJlbmN5IHBpcGUgaGFzIGJlZW4gY2hhbmdlZCBpbiBBbmd1bGFyIHY1LiBUaGUgc3ltYm9sRGlzcGxheSBvcHRpb24gKHRoaXJkIHBhcmFtZXRlcikgaXMgbm93IGEgc3RyaW5nIGluc3RlYWQgb2YgYSBib29sZWFuLiBUaGUgYWNjZXB0ZWQgdmFsdWVzIGFyZSBcImNvZGVcIiwgXCJzeW1ib2xcIiBvciBcInN5bWJvbC1uYXJyb3dcIi5gKTtcbiAgICAgIH1cbiAgICAgIGRpc3BsYXkgPSBkaXNwbGF5ID8gJ3N5bWJvbCcgOiAnY29kZSc7XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbmN5OiBzdHJpbmcgPSBjdXJyZW5jeUNvZGUgfHwgJ1VTRCc7XG4gICAgaWYgKGRpc3BsYXkgIT09ICdjb2RlJykge1xuICAgICAgaWYgKGRpc3BsYXkgPT09ICdzeW1ib2wnIHx8IGRpc3BsYXkgPT09ICdzeW1ib2wtbmFycm93Jykge1xuICAgICAgICBjdXJyZW5jeSA9IGdldEN1cnJlbmN5U3ltYm9sKGN1cnJlbmN5LCBkaXNwbGF5ID09PSAnc3ltYm9sJyA/ICd3aWRlJyA6ICduYXJyb3cnLCBsb2NhbGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVuY3kgPSBkaXNwbGF5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBudW0gPSBzdHJUb051bWJlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gZm9ybWF0Q3VycmVuY3kobnVtLCBsb2NhbGUsIGN1cnJlbmN5LCBjdXJyZW5jeUNvZGUsIGRpZ2l0c0luZm8pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoQ3VycmVuY3lQaXBlLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSAhPT0gdmFsdWU7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIHN0cmluZyBpbnRvIGEgbnVtYmVyIChpZiBuZWVkZWQpXG4gKi9cbmZ1bmN0aW9uIHN0clRvTnVtYmVyKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcpOiBudW1iZXIge1xuICAvLyBDb252ZXJ0IHN0cmluZ3MgdG8gbnVtYmVyc1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhaXNOYU4oTnVtYmVyKHZhbHVlKSAtIHBhcnNlRmxvYXQodmFsdWUpKSkge1xuICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke3ZhbHVlfSBpcyBub3QgYSBudW1iZXJgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG4iXX0=