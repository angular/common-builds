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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBQ3JFLE9BQU8sRUFBQyxjQUFjLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBRXZFOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUg7SUFDRSxxQkFBdUMsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO29CQUQvQyxXQUFXO0lBR3RCOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsK0JBQVMsR0FBVCxVQUFVLEtBQVUsRUFBRSxVQUFtQixFQUFFLE1BQWU7UUFDeEQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUVoQyxNQUFNLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFaEMsSUFBSSxDQUFDO1lBQ0gsSUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNmLE1BQU0sd0JBQXdCLENBQUMsYUFBVyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztR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biAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBMT0NBTEVfSUQsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmb3JtYXRDdXJyZW5jeSwgZm9ybWF0TnVtYmVyLCBmb3JtYXRQZXJjZW50fSBmcm9tICcuLi9pMThuL2Zvcm1hdF9udW1iZXInO1xuaW1wb3J0IHtnZXRDdXJyZW5jeVN5bWJvbH0gZnJvbSAnLi4vaTE4bi9sb2NhbGVfZGF0YV9hcGknO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVc2VzIHRoZSBmdW5jdGlvbiB7QGxpbmsgZm9ybWF0TnVtYmVyfSB0byBmb3JtYXQgYSBudW1iZXIgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIHRleHQuIEdyb3VwIHNpemluZyBhbmQgc2VwYXJhdG9yIGFuZCBvdGhlciBsb2NhbGUtc3BlY2lmaWNcbiAqIGNvbmZpZ3VyYXRpb25zIGFyZSBiYXNlZCBvbiB0aGUgbG9jYWxlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9udW1iZXJfcGlwZS50cyByZWdpb249J051bWJlclBpcGUnfVxuICpcbiAqXG4gKi9cbkBQaXBlKHtuYW1lOiAnbnVtYmVyJ30pXG5leHBvcnQgY2xhc3MgRGVjaW1hbFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgYSBudW1iZXIgdG8gYmUgZm9ybWF0dGVkLlxuICAgKiBAcGFyYW0gZGlnaXRzSW5mbyBhIGBzdHJpbmdgIHdoaWNoIGhhcyBhIGZvbGxvd2luZyBmb3JtYXQ6IDxicj5cbiAgICogPGNvZGU+e21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfTwvY29kZT4uXG4gICAqICAgLSBgbWluSW50ZWdlckRpZ2l0c2AgaXMgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGludGVnZXIgZGlnaXRzIHRvIHVzZS4gRGVmYXVsdHMgdG8gYDFgLlxuICAgKiAgIC0gYG1pbkZyYWN0aW9uRGlnaXRzYCBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LiBEZWZhdWx0cyB0b1xuICAgKiBgMGAuXG4gICAqICAgLSBgbWF4RnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuIERlZmF1bHRzIHRvXG4gICAqIGAzYC5cbiAgICogQHBhcmFtIGxvY2FsZSBhIGBzdHJpbmdgIGRlZmluaW5nIHRoZSBsb2NhbGUgdG8gdXNlICh1c2VzIHRoZSBjdXJyZW50IHtAbGluayBMT0NBTEVfSUR9IGJ5XG4gICAqIGRlZmF1bHQpLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGRpZ2l0c0luZm8/OiBzdHJpbmcsIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHJldHVybiBudWxsO1xuXG4gICAgbG9jYWxlID0gbG9jYWxlIHx8IHRoaXMuX2xvY2FsZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBudW0gPSBzdHJUb051bWJlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gZm9ybWF0TnVtYmVyKG51bSwgbG9jYWxlLCBkaWdpdHNJbmZvKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKERlY2ltYWxQaXBlLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVc2VzIHRoZSBmdW5jdGlvbiB7QGxpbmsgZm9ybWF0UGVyY2VudH0gdG8gZm9ybWF0IGEgbnVtYmVyIGFzIGEgcGVyY2VudGFnZSBhY2NvcmRpbmdcbiAqIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvcGVyY2VudF9waXBlLnRzIHJlZ2lvbj0nUGVyY2VudFBpcGUnfVxuICpcbiAqXG4gKi9cbkBQaXBlKHtuYW1lOiAncGVyY2VudCd9KVxuZXhwb3J0IGNsYXNzIFBlcmNlbnRQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIGEgbnVtYmVyIHRvIGJlIGZvcm1hdHRlZCBhcyBhIHBlcmNlbnRhZ2UuXG4gICAqIEBwYXJhbSBkaWdpdHNJbmZvIHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9IGZvciBtb3JlIGRldGFpbHMuXG4gICAqIEBwYXJhbSBsb2NhbGUgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZSAodXNlcyB0aGUgY3VycmVudCB7QGxpbmsgTE9DQUxFX0lEfSBieVxuICogZGVmYXVsdCkuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmIChpc0VtcHR5KHZhbHVlKSkgcmV0dXJuIG51bGw7XG5cbiAgICBsb2NhbGUgPSBsb2NhbGUgfHwgdGhpcy5fbG9jYWxlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG51bSA9IHN0clRvTnVtYmVyKHZhbHVlKTtcbiAgICAgIHJldHVybiBmb3JtYXRQZXJjZW50KG51bSwgbG9jYWxlLCBkaWdpdHNJbmZvKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKFBlcmNlbnRQaXBlLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVc2VzIHRoZSBmdW5jdGlvbnMge0BsaW5rIGdldEN1cnJlbmN5U3ltYm9sfSBhbmQge0BsaW5rIGZvcm1hdEN1cnJlbmN5fSB0byBmb3JtYXQgYVxuICogbnVtYmVyIGFzIGN1cnJlbmN5IHVzaW5nIGxvY2FsZSBydWxlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvY3VycmVuY3lfcGlwZS50cyByZWdpb249J0N1cnJlbmN5UGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdjdXJyZW5jeSd9KVxuZXhwb3J0IGNsYXNzIEN1cnJlbmN5UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBhIG51bWJlciB0byBiZSBmb3JtYXR0ZWQgYXMgY3VycmVuY3kuXG4gICAqIEBwYXJhbSBjdXJyZW5jeUNvZGVpcyB0aGUgW0lTTyA0MjE3XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fNDIxNykgY3VycmVuY3kgY29kZSxcbiAgICogc3VjaCBhcyBgVVNEYCBmb3IgdGhlIFVTIGRvbGxhciBhbmQgYEVVUmAgZm9yIHRoZSBldXJvLlxuICAgKiBAcGFyYW0gZGlzcGxheSBpbmRpY2F0ZXMgd2hldGhlciB0byBzaG93IHRoZSBjdXJyZW5jeSBzeW1ib2wsIHRoZSBjb2RlIG9yIGEgY3VzdG9tIHZhbHVlOlxuICAgKiAgIC0gYGNvZGVgOiB1c2UgY29kZSAoZS5nLiBgVVNEYCkuXG4gICAqICAgLSBgc3ltYm9sYChkZWZhdWx0KTogdXNlIHN5bWJvbCAoZS5nLiBgJGApLlxuICAgKiAgIC0gYHN5bWJvbC1uYXJyb3dgOiBzb21lIGNvdW50cmllcyBoYXZlIHR3byBzeW1ib2xzIGZvciB0aGVpciBjdXJyZW5jeSwgb25lIHJlZ3VsYXIgYW5kIG9uZVxuICAgKiAgICAgbmFycm93IChlLmcuIHRoZSBjYW5hZGlhbiBkb2xsYXIgQ0FEIGhhcyB0aGUgc3ltYm9sIGBDQSRgIGFuZCB0aGUgc3ltYm9sLW5hcnJvdyBgJGApLlxuICAgKiAgIC0gYHN0cmluZ2A6IHVzZSB0aGlzIHZhbHVlIGluc3RlYWQgb2YgYSBjb2RlIG9yIGEgc3ltYm9sLlxuICAgKiAgIC0gYm9vbGVhbiAoZGVwcmVjYXRlZCBmcm9tIHY1KTogYHRydWVgIGZvciBzeW1ib2wgYW5kIGZhbHNlIGZvciBgY29kZWAuXG4gICAqICAgSWYgdGhlcmUgaXMgbm8gbmFycm93IHN5bWJvbCBmb3IgdGhlIGNob3NlbiBjdXJyZW5jeSwgdGhlIHJlZ3VsYXIgc3ltYm9sIHdpbGwgYmUgdXNlZC5cbiAgICogQHBhcmFtIGRpZ2l0c0luZm8gc2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIG1vcmUgZGV0YWlscy5cbiAgICogQHBhcmFtIGxvY2FsZSBhIGBzdHJpbmdgIGRlZmluaW5nIHRoZSBsb2NhbGUgdG8gdXNlICh1c2VzIHRoZSBjdXJyZW50IHtAbGluayBMT0NBTEVfSUR9IGJ5XG4gICAqIGRlZmF1bHQpLlxuICAgKi9cbiAgdHJhbnNmb3JtKFxuICAgICAgdmFsdWU6IGFueSwgY3VycmVuY3lDb2RlPzogc3RyaW5nLFxuICAgICAgZGlzcGxheTogJ2NvZGUnfCdzeW1ib2wnfCdzeW1ib2wtbmFycm93J3xzdHJpbmd8Ym9vbGVhbiA9ICdzeW1ib2wnLCBkaWdpdHNJbmZvPzogc3RyaW5nLFxuICAgICAgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmIChpc0VtcHR5KHZhbHVlKSkgcmV0dXJuIG51bGw7XG5cbiAgICBsb2NhbGUgPSBsb2NhbGUgfHwgdGhpcy5fbG9jYWxlO1xuXG4gICAgaWYgKHR5cGVvZiBkaXNwbGF5ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYFdhcm5pbmc6IHRoZSBjdXJyZW5jeSBwaXBlIGhhcyBiZWVuIGNoYW5nZWQgaW4gQW5ndWxhciB2NS4gVGhlIHN5bWJvbERpc3BsYXkgb3B0aW9uICh0aGlyZCBwYXJhbWV0ZXIpIGlzIG5vdyBhIHN0cmluZyBpbnN0ZWFkIG9mIGEgYm9vbGVhbi4gVGhlIGFjY2VwdGVkIHZhbHVlcyBhcmUgXCJjb2RlXCIsIFwic3ltYm9sXCIgb3IgXCJzeW1ib2wtbmFycm93XCIuYCk7XG4gICAgICB9XG4gICAgICBkaXNwbGF5ID0gZGlzcGxheSA/ICdzeW1ib2wnIDogJ2NvZGUnO1xuICAgIH1cblxuICAgIGxldCBjdXJyZW5jeTogc3RyaW5nID0gY3VycmVuY3lDb2RlIHx8ICdVU0QnO1xuICAgIGlmIChkaXNwbGF5ICE9PSAnY29kZScpIHtcbiAgICAgIGlmIChkaXNwbGF5ID09PSAnc3ltYm9sJyB8fCBkaXNwbGF5ID09PSAnc3ltYm9sLW5hcnJvdycpIHtcbiAgICAgICAgY3VycmVuY3kgPSBnZXRDdXJyZW5jeVN5bWJvbChjdXJyZW5jeSwgZGlzcGxheSA9PT0gJ3N5bWJvbCcgPyAnd2lkZScgOiAnbmFycm93JywgbG9jYWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbmN5ID0gZGlzcGxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gc3RyVG9OdW1iZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGZvcm1hdEN1cnJlbmN5KG51bSwgbG9jYWxlLCBjdXJyZW5jeSwgY3VycmVuY3lDb2RlLCBkaWdpdHNJbmZvKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEN1cnJlbmN5UGlwZSwgZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgIT09IHZhbHVlO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgYSBzdHJpbmcgaW50byBhIG51bWJlciAoaWYgbmVlZGVkKVxuICovXG5mdW5jdGlvbiBzdHJUb051bWJlcih2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcbiAgLy8gQ29udmVydCBzdHJpbmdzIHRvIG51bWJlcnNcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKE51bWJlcih2YWx1ZSkgLSBwYXJzZUZsb2F0KHZhbHVlKSkpIHtcbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHt2YWx1ZX0gaXMgbm90IGEgbnVtYmVyYCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuIl19