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
var DeprecatedDecimalPipe_1, DeprecatedPercentPipe_1, DeprecatedCurrencyPipe_1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL2RlcHJlY2F0ZWQvbnVtYmVyX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBc0IsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDeEUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUV2QyxzQkFDSSxJQUFlLEVBQUUsTUFBYyxFQUFFLEtBQXNCLEVBQUUsS0FBd0IsRUFDakYsTUFBc0IsRUFBRSxXQUEwQixJQUFJLEVBQ3RELG1CQUE0QixLQUFLO0lBQ25DLElBQUksS0FBSyxJQUFJLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQztJQUUvQiw2QkFBNkI7SUFDN0IsS0FBSyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUN6RixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixNQUFNLHdCQUF3QixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM3QztJQUVELElBQUksTUFBd0IsQ0FBQztJQUM3QixJQUFJLFdBQTZCLENBQUM7SUFDbEMsSUFBSSxXQUE2QixDQUFDO0lBQ2xDLElBQUksS0FB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QWU7UUFDakIsT0FBTyxZQUFZLENBQ2Ysd0JBQXNCLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFDL0UsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDRixDQUFBO0FBVlksc0JBQXNCO0lBRGxDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUMsQ0FBQztJQUVWLG1CQUFBLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTs7R0FEbkIsc0JBQXNCLENBVWxDO1NBVlksc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgTE9DQUxFX0lELCBQaXBlLCBQaXBlVHJhbnNmb3JtLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TlVNQkVSX0ZPUk1BVF9SRUdFWFAsIHBhcnNlSW50QXV0b1JhZGl4fSBmcm9tICcuLi8uLi9pMThuL2Zvcm1hdF9udW1iZXInO1xuaW1wb3J0IHtOdW1iZXJGb3JtYXRTdHlsZX0gZnJvbSAnLi4vLi4vaTE4bi9sb2NhbGVfZGF0YV9hcGknO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4uL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5pbXBvcnQge051bWJlckZvcm1hdHRlcn0gZnJvbSAnLi9pbnRsJztcblxuZnVuY3Rpb24gZm9ybWF0TnVtYmVyKFxuICAgIHBpcGU6IFR5cGU8YW55PiwgbG9jYWxlOiBzdHJpbmcsIHZhbHVlOiBudW1iZXIgfCBzdHJpbmcsIHN0eWxlOiBOdW1iZXJGb3JtYXRTdHlsZSxcbiAgICBkaWdpdHM/OiBzdHJpbmcgfCBudWxsLCBjdXJyZW5jeTogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4gICAgY3VycmVuY3lBc1N5bWJvbDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nfG51bGwge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgLy8gQ29udmVydCBzdHJpbmdzIHRvIG51bWJlcnNcbiAgdmFsdWUgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICFpc05hTigrdmFsdWUgLSBwYXJzZUZsb2F0KHZhbHVlKSkgPyArdmFsdWUgOiB2YWx1ZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IocGlwZSwgdmFsdWUpO1xuICB9XG5cbiAgbGV0IG1pbkludDogbnVtYmVyfHVuZGVmaW5lZDtcbiAgbGV0IG1pbkZyYWN0aW9uOiBudW1iZXJ8dW5kZWZpbmVkO1xuICBsZXQgbWF4RnJhY3Rpb246IG51bWJlcnx1bmRlZmluZWQ7XG4gIGlmIChzdHlsZSAhPT0gTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3kpIHtcbiAgICAvLyByZWx5IG9uIEludGwgZGVmYXVsdCBmb3IgY3VycmVuY3lcbiAgICBtaW5JbnQgPSAxO1xuICAgIG1pbkZyYWN0aW9uID0gMDtcbiAgICBtYXhGcmFjdGlvbiA9IDM7XG4gIH1cblxuICBpZiAoZGlnaXRzKSB7XG4gICAgY29uc3QgcGFydHMgPSBkaWdpdHMubWF0Y2goTlVNQkVSX0ZPUk1BVF9SRUdFWFApO1xuICAgIGlmIChwYXJ0cyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpZ2l0c30gaXMgbm90IGEgdmFsaWQgZGlnaXQgaW5mbyBmb3IgbnVtYmVyIHBpcGVzYCk7XG4gICAgfVxuICAgIGlmIChwYXJ0c1sxXSAhPSBudWxsKSB7ICAvLyBtaW4gaW50ZWdlciBkaWdpdHNcbiAgICAgIG1pbkludCA9IHBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzFdKTtcbiAgICB9XG4gICAgaWYgKHBhcnRzWzNdICE9IG51bGwpIHsgIC8vIG1pbiBmcmFjdGlvbiBkaWdpdHNcbiAgICAgIG1pbkZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgocGFydHNbM10pO1xuICAgIH1cbiAgICBpZiAocGFydHNbNV0gIT0gbnVsbCkgeyAgLy8gbWF4IGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgbWF4RnJhY3Rpb24gPSBwYXJzZUludEF1dG9SYWRpeChwYXJ0c1s1XSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE51bWJlckZvcm1hdHRlci5mb3JtYXQodmFsdWUgYXMgbnVtYmVyLCBsb2NhbGUsIHN0eWxlLCB7XG4gICAgbWluaW11bUludGVnZXJEaWdpdHM6IG1pbkludCxcbiAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IG1pbkZyYWN0aW9uLFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogbWF4RnJhY3Rpb24sXG4gICAgY3VycmVuY3k6IGN1cnJlbmN5LFxuICAgIGN1cnJlbmN5QXNTeW1ib2w6IGN1cnJlbmN5QXNTeW1ib2wsXG4gIH0pO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIHRleHQuIEdyb3VwIHNpemluZyBhbmQgc2VwYXJhdG9yIGFuZCBvdGhlciBsb2NhbGUtc3BlY2lmaWNcbiAqIGNvbmZpZ3VyYXRpb25zIGFyZSBiYXNlZCBvbiB0aGUgYWN0aXZlIGxvY2FsZS5cbiAqXG4gKiB3aGVyZSBgZXhwcmVzc2lvbmAgaXMgYSBudW1iZXI6XG4gKiAgLSBgZGlnaXRJbmZvYCBpcyBhIGBzdHJpbmdgIHdoaWNoIGhhcyBhIGZvbGxvd2luZyBmb3JtYXQ6IDxicj5cbiAqICAgICA8Y29kZT57bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9PC9jb2RlPlxuICogICAtIGBtaW5JbnRlZ2VyRGlnaXRzYCBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgdG8gdXNlLiBEZWZhdWx0cyB0byBgMWAuXG4gKiAgIC0gYG1pbkZyYWN0aW9uRGlnaXRzYCBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byBgMGAuXG4gKiAgIC0gYG1heEZyYWN0aW9uRGlnaXRzYCBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byBgM2AuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIGFjY2VwdGFibGUgcmFuZ2UgZm9yIGVhY2ggb2YgdGhlc2UgbnVtYmVycyBhbmQgb3RoZXJcbiAqIGRldGFpbHMgc2VlIHlvdXIgbmF0aXZlIGludGVybmF0aW9uYWxpemF0aW9uIGxpYnJhcnkuXG4gKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSSB3aGljaCBpcyBub3QgeWV0IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnNcbiAqIGFuZCBtYXkgcmVxdWlyZSBhIHBvbHlmaWxsLiBTZWUgW0Jyb3dzZXIgU3VwcG9ydF0oZ3VpZGUvYnJvd3Nlci1zdXBwb3J0KSBmb3IgZGV0YWlscy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvbnVtYmVyX3BpcGUudHMgcmVnaW9uPSdEZXByZWNhdGVkTnVtYmVyUGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdudW1iZXInfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkRGVjaW1hbFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZERlY2ltYWxQaXBlLCB0aGlzLl9sb2NhbGUsIHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsLCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgcGVyY2VudGFnZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIC0gYGRpZ2l0SW5mb2AgU2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIGRldGFpbGVkIGRlc2NyaXB0aW9uLlxuICpcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgd2hpY2ggaXMgbm90IHlldCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzXG4gKiBhbmQgbWF5IHJlcXVpcmUgYSBwb2x5ZmlsbC4gU2VlIFtCcm93c2VyIFN1cHBvcnRdKGd1aWRlL2Jyb3dzZXItc3VwcG9ydCkgZm9yIGRldGFpbHMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL3BlcmNlbnRfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWRQZXJjZW50UGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdwZXJjZW50J30pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZFBlcmNlbnRQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgZGlnaXRzPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIHJldHVybiBmb3JtYXROdW1iZXIoXG4gICAgICAgIERlcHJlY2F0ZWRQZXJjZW50UGlwZSwgdGhpcy5fbG9jYWxlLCB2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuUGVyY2VudCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgY3VycmVuY3kgdXNpbmcgbG9jYWxlIHJ1bGVzLlxuICpcbiAqIFVzZSBgY3VycmVuY3lgIHRvIGZvcm1hdCBhIG51bWJlciBhcyBjdXJyZW5jeS5cbiAqXG4gKiAtIGBjdXJyZW5jeUNvZGVgIGlzIHRoZSBbSVNPIDQyMTddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT180MjE3KSBjdXJyZW5jeSBjb2RlLCBzdWNoXG4gKiAgICBhcyBgVVNEYCBmb3IgdGhlIFVTIGRvbGxhciBhbmQgYEVVUmAgZm9yIHRoZSBldXJvLlxuICogLSBgc3ltYm9sRGlzcGxheWAgaXMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0byB1c2UgdGhlIGN1cnJlbmN5IHN5bWJvbCBvciBjb2RlLlxuICogICAtIGB0cnVlYDogdXNlIHN5bWJvbCAoZS5nLiBgJGApLlxuICogICAtIGBmYWxzZWAoZGVmYXVsdCk6IHVzZSBjb2RlIChlLmcuIGBVU0RgKS5cbiAqIC0gYGRpZ2l0SW5mb2AgU2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIGRldGFpbGVkIGRlc2NyaXB0aW9uLlxuICpcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgd2hpY2ggaXMgbm90IHlldCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzXG4gKiBhbmQgbWF5IHJlcXVpcmUgYSBwb2x5ZmlsbC4gU2VlIFtCcm93c2VyIFN1cHBvcnRdKGd1aWRlL2Jyb3dzZXItc3VwcG9ydCkgZm9yIGRldGFpbHMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2N1cnJlbmN5X3BpcGUudHMgcmVnaW9uPSdEZXByZWNhdGVkQ3VycmVuY3lQaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ2N1cnJlbmN5J30pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZEN1cnJlbmN5UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgdHJhbnNmb3JtKFxuICAgICAgdmFsdWU6IGFueSwgY3VycmVuY3lDb2RlOiBzdHJpbmcgPSAnVVNEJywgc3ltYm9sRGlzcGxheTogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgZGlnaXRzPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIHJldHVybiBmb3JtYXROdW1iZXIoXG4gICAgICAgIERlcHJlY2F0ZWRDdXJyZW5jeVBpcGUsIHRoaXMuX2xvY2FsZSwgdmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLkN1cnJlbmN5LCBkaWdpdHMsXG4gICAgICAgIGN1cnJlbmN5Q29kZSwgc3ltYm9sRGlzcGxheSk7XG4gIH1cbn1cbiJdfQ==