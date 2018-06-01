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
            throw invalidPipeArgumentError(DecimalPipe, error.message);
        }
    };
    DecimalPipe.decorators = [
        { type: Pipe, args: [{ name: 'number' },] }
    ];
    /** @nocollapse */
    DecimalPipe.ctorParameters = function () { return [
        { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
    ]; };
    return DecimalPipe;
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
            throw invalidPipeArgumentError(PercentPipe, error.message);
        }
    };
    PercentPipe.decorators = [
        { type: Pipe, args: [{ name: 'percent' },] }
    ];
    /** @nocollapse */
    PercentPipe.ctorParameters = function () { return [
        { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
    ]; };
    return PercentPipe;
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
            throw invalidPipeArgumentError(CurrencyPipe, error.message);
        }
    };
    CurrencyPipe.decorators = [
        { type: Pipe, args: [{ name: 'currency' },] }
    ];
    /** @nocollapse */
    CurrencyPipe.ctorParameters = function () { return [
        { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
    ]; };
    return CurrencyPipe;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDMUQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFFdkU7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSDtJQUVFLHFCQUF1QyxPQUFlO1FBQWYsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFHLENBQUM7SUFFMUQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCwrQkFBUyxHQUFULFVBQVUsS0FBVSxFQUFFLFVBQW1CLEVBQUUsTUFBZTtRQUN4RCxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVoQyxNQUFNLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFaEMsSUFBSTtZQUNGLElBQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixPQUFPLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxNQUFNLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUQ7SUFDSCxDQUFDOztnQkEzQkYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQzs7Ozs2Q0FFUCxN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LElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQztBQUMxRCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxxQkFBcUIsS0FBc0I7SUFDekMsNkJBQTZCO0lBQzdCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUMxRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN0QjtJQUNELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUksS0FBSyxxQkFBa0IsQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgTE9DQUxFX0lELCBQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Zm9ybWF0Q3VycmVuY3ksIGZvcm1hdE51bWJlciwgZm9ybWF0UGVyY2VudH0gZnJvbSAnLi4vaTE4bi9mb3JtYXRfbnVtYmVyJztcbmltcG9ydCB7Z2V0Q3VycmVuY3lTeW1ib2x9IGZyb20gJy4uL2kxOG4vbG9jYWxlX2RhdGFfYXBpJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVXNlcyB0aGUgZnVuY3Rpb24ge0BsaW5rIGZvcm1hdE51bWJlcn0gdG8gZm9ybWF0IGEgbnVtYmVyIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyB0ZXh0LiBHcm91cCBzaXppbmcgYW5kIHNlcGFyYXRvciBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljXG4gKiBjb25maWd1cmF0aW9ucyBhcmUgYmFzZWQgb24gdGhlIGxvY2FsZS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvbnVtYmVyX3BpcGUudHMgcmVnaW9uPSdOdW1iZXJQaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ251bWJlcid9KVxuZXhwb3J0IGNsYXNzIERlY2ltYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICAvKipcbiAgICogQHBhcmFtIHZhbHVlIGEgbnVtYmVyIHRvIGJlIGZvcm1hdHRlZC5cbiAgICogQHBhcmFtIGRpZ2l0c0luZm8gYSBgc3RyaW5nYCB3aGljaCBoYXMgYSBmb2xsb3dpbmcgZm9ybWF0OiA8YnI+XG4gICAqIDxjb2RlPnttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c308L2NvZGU+LlxuICAgKiAgIC0gYG1pbkludGVnZXJEaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBpbnRlZ2VyIGRpZ2l0cyB0byB1c2UuIERlZmF1bHRzIHRvIGAxYC5cbiAgICogICAtIGBtaW5GcmFjdGlvbkRpZ2l0c2AgaXMgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciB0aGUgZGVjaW1hbCBwb2ludC4gRGVmYXVsdHMgdG9cbiAgICogYDBgLlxuICAgKiAgIC0gYG1heEZyYWN0aW9uRGlnaXRzYCBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LiBEZWZhdWx0cyB0b1xuICAgKiBgM2AuXG4gICAqIEBwYXJhbSBsb2NhbGUgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZSAodXNlcyB0aGUgY3VycmVudCB7QGxpbmsgTE9DQUxFX0lEfSBieVxuICAgKiBkZWZhdWx0KS5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBkaWdpdHNJbmZvPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKGlzRW1wdHkodmFsdWUpKSByZXR1cm4gbnVsbDtcblxuICAgIGxvY2FsZSA9IGxvY2FsZSB8fCB0aGlzLl9sb2NhbGU7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gc3RyVG9OdW1iZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGZvcm1hdE51bWJlcihudW0sIGxvY2FsZSwgZGlnaXRzSW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihEZWNpbWFsUGlwZSwgZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVXNlcyB0aGUgZnVuY3Rpb24ge0BsaW5rIGZvcm1hdFBlcmNlbnR9IHRvIGZvcm1hdCBhIG51bWJlciBhcyBhIHBlcmNlbnRhZ2UgYWNjb3JkaW5nXG4gKiB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL3BlcmNlbnRfcGlwZS50cyByZWdpb249J1BlcmNlbnRQaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ3BlcmNlbnQnfSlcbmV4cG9ydCBjbGFzcyBQZXJjZW50UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBhIG51bWJlciB0byBiZSBmb3JtYXR0ZWQgYXMgYSBwZXJjZW50YWdlLlxuICAgKiBAcGFyYW0gZGlnaXRzSW5mbyBzZWUge0BsaW5rIERlY2ltYWxQaXBlfSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKiBAcGFyYW0gbG9jYWxlIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UgKHVzZXMgdGhlIGN1cnJlbnQge0BsaW5rIExPQ0FMRV9JRH0gYnlcbiAqIGRlZmF1bHQpLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGRpZ2l0c0luZm8/OiBzdHJpbmcsIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHJldHVybiBudWxsO1xuXG4gICAgbG9jYWxlID0gbG9jYWxlIHx8IHRoaXMuX2xvY2FsZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBudW0gPSBzdHJUb051bWJlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gZm9ybWF0UGVyY2VudChudW0sIGxvY2FsZSwgZGlnaXRzSW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihQZXJjZW50UGlwZSwgZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVXNlcyB0aGUgZnVuY3Rpb25zIHtAbGluayBnZXRDdXJyZW5jeVN5bWJvbH0gYW5kIHtAbGluayBmb3JtYXRDdXJyZW5jeX0gdG8gZm9ybWF0IGFcbiAqIG51bWJlciBhcyBjdXJyZW5jeSB1c2luZyBsb2NhbGUgcnVsZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2N1cnJlbmN5X3BpcGUudHMgcmVnaW9uPSdDdXJyZW5jeVBpcGUnfVxuICpcbiAqXG4gKi9cbkBQaXBlKHtuYW1lOiAnY3VycmVuY3knfSlcbmV4cG9ydCBjbGFzcyBDdXJyZW5jeVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgYSBudW1iZXIgdG8gYmUgZm9ybWF0dGVkIGFzIGN1cnJlbmN5LlxuICAgKiBAcGFyYW0gY3VycmVuY3lDb2RlaXMgdGhlIFtJU08gNDIxN10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTcpIGN1cnJlbmN5IGNvZGUsXG4gICAqIHN1Y2ggYXMgYFVTRGAgZm9yIHRoZSBVUyBkb2xsYXIgYW5kIGBFVVJgIGZvciB0aGUgZXVyby5cbiAgICogQHBhcmFtIGRpc3BsYXkgaW5kaWNhdGVzIHdoZXRoZXIgdG8gc2hvdyB0aGUgY3VycmVuY3kgc3ltYm9sLCB0aGUgY29kZSBvciBhIGN1c3RvbSB2YWx1ZTpcbiAgICogICAtIGBjb2RlYDogdXNlIGNvZGUgKGUuZy4gYFVTRGApLlxuICAgKiAgIC0gYHN5bWJvbGAoZGVmYXVsdCk6IHVzZSBzeW1ib2wgKGUuZy4gYCRgKS5cbiAgICogICAtIGBzeW1ib2wtbmFycm93YDogc29tZSBjb3VudHJpZXMgaGF2ZSB0d28gc3ltYm9scyBmb3IgdGhlaXIgY3VycmVuY3ksIG9uZSByZWd1bGFyIGFuZCBvbmVcbiAgICogICAgIG5hcnJvdyAoZS5nLiB0aGUgY2FuYWRpYW4gZG9sbGFyIENBRCBoYXMgdGhlIHN5bWJvbCBgQ0EkYCBhbmQgdGhlIHN5bWJvbC1uYXJyb3cgYCRgKS5cbiAgICogICAtIGBzdHJpbmdgOiB1c2UgdGhpcyB2YWx1ZSBpbnN0ZWFkIG9mIGEgY29kZSBvciBhIHN5bWJvbC5cbiAgICogICAtIGJvb2xlYW4gKGRlcHJlY2F0ZWQgZnJvbSB2NSk6IGB0cnVlYCBmb3Igc3ltYm9sIGFuZCBmYWxzZSBmb3IgYGNvZGVgLlxuICAgKiAgIElmIHRoZXJlIGlzIG5vIG5hcnJvdyBzeW1ib2wgZm9yIHRoZSBjaG9zZW4gY3VycmVuY3ksIHRoZSByZWd1bGFyIHN5bWJvbCB3aWxsIGJlIHVzZWQuXG4gICAqIEBwYXJhbSBkaWdpdHNJbmZvIHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9IGZvciBtb3JlIGRldGFpbHMuXG4gICAqIEBwYXJhbSBsb2NhbGUgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZSAodXNlcyB0aGUgY3VycmVudCB7QGxpbmsgTE9DQUxFX0lEfSBieVxuICAgKiBkZWZhdWx0KS5cbiAgICovXG4gIHRyYW5zZm9ybShcbiAgICAgIHZhbHVlOiBhbnksIGN1cnJlbmN5Q29kZT86IHN0cmluZyxcbiAgICAgIGRpc3BsYXk6ICdjb2RlJ3wnc3ltYm9sJ3wnc3ltYm9sLW5hcnJvdyd8c3RyaW5nfGJvb2xlYW4gPSAnc3ltYm9sJywgZGlnaXRzSW5mbz86IHN0cmluZyxcbiAgICAgIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHJldHVybiBudWxsO1xuXG4gICAgbG9jYWxlID0gbG9jYWxlIHx8IHRoaXMuX2xvY2FsZTtcblxuICAgIGlmICh0eXBlb2YgZGlzcGxheSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGBXYXJuaW5nOiB0aGUgY3VycmVuY3kgcGlwZSBoYXMgYmVlbiBjaGFuZ2VkIGluIEFuZ3VsYXIgdjUuIFRoZSBzeW1ib2xEaXNwbGF5IG9wdGlvbiAodGhpcmQgcGFyYW1ldGVyKSBpcyBub3cgYSBzdHJpbmcgaW5zdGVhZCBvZiBhIGJvb2xlYW4uIFRoZSBhY2NlcHRlZCB2YWx1ZXMgYXJlIFwiY29kZVwiLCBcInN5bWJvbFwiIG9yIFwic3ltYm9sLW5hcnJvd1wiLmApO1xuICAgICAgfVxuICAgICAgZGlzcGxheSA9IGRpc3BsYXkgPyAnc3ltYm9sJyA6ICdjb2RlJztcbiAgICB9XG5cbiAgICBsZXQgY3VycmVuY3k6IHN0cmluZyA9IGN1cnJlbmN5Q29kZSB8fCAnVVNEJztcbiAgICBpZiAoZGlzcGxheSAhPT0gJ2NvZGUnKSB7XG4gICAgICBpZiAoZGlzcGxheSA9PT0gJ3N5bWJvbCcgfHwgZGlzcGxheSA9PT0gJ3N5bWJvbC1uYXJyb3cnKSB7XG4gICAgICAgIGN1cnJlbmN5ID0gZ2V0Q3VycmVuY3lTeW1ib2woY3VycmVuY3ksIGRpc3BsYXkgPT09ICdzeW1ib2wnID8gJ3dpZGUnIDogJ25hcnJvdycsIGxvY2FsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW5jeSA9IGRpc3BsYXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG51bSA9IHN0clRvTnVtYmVyKHZhbHVlKTtcbiAgICAgIHJldHVybiBmb3JtYXRDdXJyZW5jeShudW0sIGxvY2FsZSwgY3VycmVuY3ksIGN1cnJlbmN5Q29kZSwgZGlnaXRzSW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihDdXJyZW5jeVBpcGUsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlICE9PSB2YWx1ZTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgc3RyaW5nIGludG8gYSBudW1iZXIgKGlmIG5lZWRlZClcbiAqL1xuZnVuY3Rpb24gc3RyVG9OdW1iZXIodmFsdWU6IG51bWJlciB8IHN0cmluZyk6IG51bWJlciB7XG4gIC8vIENvbnZlcnQgc3RyaW5ncyB0byBudW1iZXJzXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICFpc05hTihOdW1iZXIodmFsdWUpIC0gcGFyc2VGbG9hdCh2YWx1ZSkpKSB7XG4gICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dmFsdWV9IGlzIG5vdCBhIG51bWJlcmApO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cbiJdfQ==