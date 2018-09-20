/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
var DeprecatedDecimalPipe_1, DeprecatedPercentPipe_1, DeprecatedCurrencyPipe_1;
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { NUMBER_FORMAT_REGEXP, parseIntAutoRadix } from '../../i18n/format_number';
import { NumberFormatStyle } from '../../i18n/locale_data_api';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { NumberFormatter } from './intl';
function formatNumber(pipe, locale, value, style, digits, currency = null, currencyAsSymbol = false) {
    if (value == null)
        return null;
    // Convert strings to numbers
    value = typeof value === 'string' && !isNaN(+value - parseFloat(value)) ? +value : value;
    if (typeof value !== 'number') {
        throw invalidPipeArgumentError(pipe, value);
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
    if (digits) {
        const parts = digits.match(NUMBER_FORMAT_REGEXP);
        if (parts === null) {
            throw new Error(`${digits} is not a valid digit info for number pipes`);
        }
        if (parts[1] != null) { // min integer digits
            minInt = parseIntAutoRadix(parts[1]);
        }
        if (parts[3] != null) { // min fraction digits
            minFraction = parseIntAutoRadix(parts[3]);
        }
        if (parts[5] != null) { // max fraction digits
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
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='DeprecatedNumberPipe'}
 *
 * @ngModule CommonModule
 */
let DeprecatedDecimalPipe = DeprecatedDecimalPipe_1 = class DeprecatedDecimalPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    transform(value, digits) {
        return formatNumber(DeprecatedDecimalPipe_1, this._locale, value, NumberFormatStyle.Decimal, digits);
    }
};
DeprecatedDecimalPipe = DeprecatedDecimalPipe_1 = tslib_1.__decorate([
    Pipe({ name: 'number' }),
    tslib_1.__param(0, Inject(LOCALE_ID)),
    tslib_1.__metadata("design:paramtypes", [String])
], DeprecatedDecimalPipe);
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
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/percent_pipe.ts region='DeprecatedPercentPipe'}
 *
 *
 */
let DeprecatedPercentPipe = DeprecatedPercentPipe_1 = class DeprecatedPercentPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    transform(value, digits) {
        return formatNumber(DeprecatedPercentPipe_1, this._locale, value, NumberFormatStyle.Percent, digits);
    }
};
DeprecatedPercentPipe = DeprecatedPercentPipe_1 = tslib_1.__decorate([
    Pipe({ name: 'percent' }),
    tslib_1.__param(0, Inject(LOCALE_ID)),
    tslib_1.__metadata("design:paramtypes", [String])
], DeprecatedPercentPipe);
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
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/currency_pipe.ts region='DeprecatedCurrencyPipe'}
 *
 *
 */
let DeprecatedCurrencyPipe = DeprecatedCurrencyPipe_1 = class DeprecatedCurrencyPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    transform(value, currencyCode = 'USD', symbolDisplay = false, digits) {
        return formatNumber(DeprecatedCurrencyPipe_1, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    }
};
DeprecatedCurrencyPipe = DeprecatedCurrencyPipe_1 = tslib_1.__decorate([
    Pipe({ name: 'currency' }),
    tslib_1.__param(0, Inject(LOCALE_ID)),
    tslib_1.__metadata("design:paramtypes", [String])
], DeprecatedCurrencyPipe);
export { DeprecatedCurrencyPipe };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL2RlcHJlY2F0ZWQvbnVtYmVyX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2pGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFdkMsU0FBUyxZQUFZLENBQ2pCLElBQWUsRUFBRSxNQUFjLEVBQUUsS0FBc0IsRUFBRSxLQUF3QixFQUNqRixNQUFzQixFQUFFLFdBQTBCLElBQUksRUFDdEQsbUJBQTRCLEtBQUs7SUFDbkMsSUFBSSxLQUFLLElBQUksSUFBSTtRQUFFLE9BQU8sSUFBSSxDQUFDO0lBRS9CLDZCQUE2QjtJQUM3QixLQUFLLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3pGLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzdCLE1BQU0sd0JBQXdCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzdDO0lBRUQsSUFBSSxNQUF3QixDQUFDO0lBQzdCLElBQUksV0FBNkIsQ0FBQztJQUNsQyxJQUFJLFdBQTZCLENBQUM7SUFD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QVMsQ0FDTCxLQUFVLEVBQUUsZUFBdUIsS0FBSyxFQUFFLGdCQUF5QixLQUFLLEVBQ3hFLE1BQWU7UUFDakIsT0FBTyxZQUFZLENBQ2Ysd0JBQXNCLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFDL0UsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDRixDQUFBO0FBVlksc0JBQXNCO0lBRGxDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUMsQ0FBQztJQUVWLG1CQUFBLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTs7R0FEbkIsc0JBQXNCLENBVWxDO1NBVlksc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgTE9DQUxFX0lELCBQaXBlLCBQaXBlVHJhbnNmb3JtLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TlVNQkVSX0ZPUk1BVF9SRUdFWFAsIHBhcnNlSW50QXV0b1JhZGl4fSBmcm9tICcuLi8uLi9pMThuL2Zvcm1hdF9udW1iZXInO1xuaW1wb3J0IHtOdW1iZXJGb3JtYXRTdHlsZX0gZnJvbSAnLi4vLi4vaTE4bi9sb2NhbGVfZGF0YV9hcGknO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4uL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5pbXBvcnQge051bWJlckZvcm1hdHRlcn0gZnJvbSAnLi9pbnRsJztcblxuZnVuY3Rpb24gZm9ybWF0TnVtYmVyKFxuICAgIHBpcGU6IFR5cGU8YW55PiwgbG9jYWxlOiBzdHJpbmcsIHZhbHVlOiBudW1iZXIgfCBzdHJpbmcsIHN0eWxlOiBOdW1iZXJGb3JtYXRTdHlsZSxcbiAgICBkaWdpdHM/OiBzdHJpbmcgfCBudWxsLCBjdXJyZW5jeTogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4gICAgY3VycmVuY3lBc1N5bWJvbDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nfG51bGwge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgLy8gQ29udmVydCBzdHJpbmdzIHRvIG51bWJlcnNcbiAgdmFsdWUgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICFpc05hTigrdmFsdWUgLSBwYXJzZUZsb2F0KHZhbHVlKSkgPyArdmFsdWUgOiB2YWx1ZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IocGlwZSwgdmFsdWUpO1xuICB9XG5cbiAgbGV0IG1pbkludDogbnVtYmVyfHVuZGVmaW5lZDtcbiAgbGV0IG1pbkZyYWN0aW9uOiBudW1iZXJ8dW5kZWZpbmVkO1xuICBsZXQgbWF4RnJhY3Rpb246IG51bWJlcnx1bmRlZmluZWQ7XG4gIGlmIChzdHlsZSAhPT0gTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3kpIHtcbiAgICAvLyByZWx5IG9uIEludGwgZGVmYXVsdCBmb3IgY3VycmVuY3lcbiAgICBtaW5JbnQgPSAxO1xuICAgIG1pbkZyYWN0aW9uID0gMDtcbiAgICBtYXhGcmFjdGlvbiA9IDM7XG4gIH1cblxuICBpZiAoZGlnaXRzKSB7XG4gICAgY29uc3QgcGFydHMgPSBkaWdpdHMubWF0Y2goTlVNQkVSX0ZPUk1BVF9SRUdFWFApO1xuICAgIGlmIChwYXJ0cyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpZ2l0c30gaXMgbm90IGEgdmFsaWQgZGlnaXQgaW5mbyBmb3IgbnVtYmVyIHBpcGVzYCk7XG4gICAgfVxuICAgIGlmIChwYXJ0c1sxXSAhPSBudWxsKSB7ICAvLyBtaW4gaW50ZWdlciBkaWdpdHNcbiAgICAgIG1pbkludCA9IHBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzFdKTtcbiAgICB9XG4gICAgaWYgKHBhcnRzWzNdICE9IG51bGwpIHsgIC8vIG1pbiBmcmFjdGlvbiBkaWdpdHNcbiAgICAgIG1pbkZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgocGFydHNbM10pO1xuICAgIH1cbiAgICBpZiAocGFydHNbNV0gIT0gbnVsbCkgeyAgLy8gbWF4IGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgbWF4RnJhY3Rpb24gPSBwYXJzZUludEF1dG9SYWRpeChwYXJ0c1s1XSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE51bWJlckZvcm1hdHRlci5mb3JtYXQodmFsdWUgYXMgbnVtYmVyLCBsb2NhbGUsIHN0eWxlLCB7XG4gICAgbWluaW11bUludGVnZXJEaWdpdHM6IG1pbkludCxcbiAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IG1pbkZyYWN0aW9uLFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogbWF4RnJhY3Rpb24sXG4gICAgY3VycmVuY3k6IGN1cnJlbmN5LFxuICAgIGN1cnJlbmN5QXNTeW1ib2w6IGN1cnJlbmN5QXNTeW1ib2wsXG4gIH0pO1xufVxuXG4vKipcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgdGV4dC4gR3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpY1xuICogY29uZmlndXJhdGlvbnMgYXJlIGJhc2VkIG9uIHRoZSBhY3RpdmUgbG9jYWxlLlxuICpcbiAqIHdoZXJlIGBleHByZXNzaW9uYCBpcyBhIG51bWJlcjpcbiAqICAtIGBkaWdpdEluZm9gIGlzIGEgYHN0cmluZ2Agd2hpY2ggaGFzIGEgZm9sbG93aW5nIGZvcm1hdDogPGJyPlxuICogICAgIDxjb2RlPnttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c308L2NvZGU+XG4gKiAgIC0gYG1pbkludGVnZXJEaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBpbnRlZ2VyIGRpZ2l0cyB0byB1c2UuIERlZmF1bHRzIHRvIGAxYC5cbiAqICAgLSBgbWluRnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIGAwYC5cbiAqICAgLSBgbWF4RnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIGAzYC5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgYWNjZXB0YWJsZSByYW5nZSBmb3IgZWFjaCBvZiB0aGVzZSBudW1iZXJzIGFuZCBvdGhlclxuICogZGV0YWlscyBzZWUgeW91ciBuYXRpdmUgaW50ZXJuYXRpb25hbGl6YXRpb24gbGlicmFyeS5cbiAqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJIHdoaWNoIGlzIG5vdCB5ZXQgYXZhaWxhYmxlIGluIGFsbCBicm93c2Vyc1xuICogYW5kIG1heSByZXF1aXJlIGEgcG9seWZpbGwuIFNlZSBbQnJvd3NlciBTdXBwb3J0XShndWlkZS9icm93c2VyLXN1cHBvcnQpIGZvciBkZXRhaWxzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL251bWJlcl9waXBlLnRzIHJlZ2lvbj0nRGVwcmVjYXRlZE51bWJlclBpcGUnfVxuICpcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqL1xuQFBpcGUoe25hbWU6ICdudW1iZXInfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkRGVjaW1hbFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZERlY2ltYWxQaXBlLCB0aGlzLl9sb2NhbGUsIHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsLCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgcGVyY2VudGFnZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIC0gYGRpZ2l0SW5mb2AgU2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIGRldGFpbGVkIGRlc2NyaXB0aW9uLlxuICpcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgd2hpY2ggaXMgbm90IHlldCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzXG4gKiBhbmQgbWF5IHJlcXVpcmUgYSBwb2x5ZmlsbC4gU2VlIFtCcm93c2VyIFN1cHBvcnRdKGd1aWRlL2Jyb3dzZXItc3VwcG9ydCkgZm9yIGRldGFpbHMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvcGVyY2VudF9waXBlLnRzIHJlZ2lvbj0nRGVwcmVjYXRlZFBlcmNlbnRQaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ3BlcmNlbnQnfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkUGVyY2VudFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZFBlcmNlbnRQaXBlLCB0aGlzLl9sb2NhbGUsIHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5QZXJjZW50LCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBjdXJyZW5jeSB1c2luZyBsb2NhbGUgcnVsZXMuXG4gKlxuICogVXNlIGBjdXJyZW5jeWAgdG8gZm9ybWF0IGEgbnVtYmVyIGFzIGN1cnJlbmN5LlxuICpcbiAqIC0gYGN1cnJlbmN5Q29kZWAgaXMgdGhlIFtJU08gNDIxN10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTcpIGN1cnJlbmN5IGNvZGUsIHN1Y2hcbiAqICAgIGFzIGBVU0RgIGZvciB0aGUgVVMgZG9sbGFyIGFuZCBgRVVSYCBmb3IgdGhlIGV1cm8uXG4gKiAtIGBzeW1ib2xEaXNwbGF5YCBpcyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSB0aGUgY3VycmVuY3kgc3ltYm9sIG9yIGNvZGUuXG4gKiAgIC0gYHRydWVgOiB1c2Ugc3ltYm9sIChlLmcuIGAkYCkuXG4gKiAgIC0gYGZhbHNlYChkZWZhdWx0KTogdXNlIGNvZGUgKGUuZy4gYFVTRGApLlxuICogLSBgZGlnaXRJbmZvYCBTZWUge0BsaW5rIERlY2ltYWxQaXBlfSBmb3IgZGV0YWlsZWQgZGVzY3JpcHRpb24uXG4gKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSSB3aGljaCBpcyBub3QgeWV0IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnNcbiAqIGFuZCBtYXkgcmVxdWlyZSBhIHBvbHlmaWxsLiBTZWUgW0Jyb3dzZXIgU3VwcG9ydF0oZ3VpZGUvYnJvd3Nlci1zdXBwb3J0KSBmb3IgZGV0YWlscy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9jdXJyZW5jeV9waXBlLnRzIHJlZ2lvbj0nRGVwcmVjYXRlZEN1cnJlbmN5UGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdjdXJyZW5jeSd9KVxuZXhwb3J0IGNsYXNzIERlcHJlY2F0ZWRDdXJyZW5jeVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybShcbiAgICAgIHZhbHVlOiBhbnksIGN1cnJlbmN5Q29kZTogc3RyaW5nID0gJ1VTRCcsIHN5bWJvbERpc3BsYXk6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgIGRpZ2l0cz86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gZm9ybWF0TnVtYmVyKFxuICAgICAgICBEZXByZWNhdGVkQ3VycmVuY3lQaXBlLCB0aGlzLl9sb2NhbGUsIHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSwgZGlnaXRzLFxuICAgICAgICBjdXJyZW5jeUNvZGUsIHN5bWJvbERpc3BsYXkpO1xuICB9XG59XG4iXX0=