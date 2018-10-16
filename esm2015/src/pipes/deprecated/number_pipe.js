/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { NUMBER_FORMAT_REGEXP, parseIntAutoRadix } from '../../i18n/format_number';
import { NumberFormatStyle } from '../../i18n/locale_data_api';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { NumberFormatter } from './intl';
/**
 * @param {?} pipe
 * @param {?} locale
 * @param {?} value
 * @param {?} style
 * @param {?=} digits
 * @param {?=} currency
 * @param {?=} currencyAsSymbol
 * @return {?}
 */
function formatNumber(pipe, locale, value, style, digits, currency = null, currencyAsSymbol = false) {
    if (value == null)
        return null;
    // Convert strings to numbers
    value = typeof value === 'string' && !isNaN(+value - parseFloat(value)) ? +value : value;
    if (typeof value !== 'number') {
        throw invalidPipeArgumentError(pipe, value);
    }
    /** @type {?} */
    let minInt;
    /** @type {?} */
    let minFraction;
    /** @type {?} */
    let maxFraction;
    if (style !== NumberFormatStyle.Currency) {
        // rely on Intl default for currency
        minInt = 1;
        minFraction = 0;
        maxFraction = 3;
    }
    if (digits) {
        /** @type {?} */
        const parts = digits.match(NUMBER_FORMAT_REGEXP);
        if (parts === null) {
            throw new Error(`${digits} is not a valid digit info for number pipes`);
        }
        if (parts[1] != null) { // min integer digits
            // min integer digits
            minInt = parseIntAutoRadix(parts[1]);
        }
        if (parts[3] != null) { // min fraction digits
            // min fraction digits
            minFraction = parseIntAutoRadix(parts[3]);
        }
        if (parts[5] != null) { // max fraction digits
            // max fraction digits
            maxFraction = parseIntAutoRadix(parts[5]);
        }
    }
    return NumberFormatter.format(/** @type {?} */ (value), locale, style, {
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
 * \@usageNotes
 *
 * ### Example
 *
 * {\@example common/pipes/ts/number_pipe.ts region='DeprecatedNumberPipe'}
 *
 * \@ngModule CommonModule
 */
export class DeprecatedDecimalPipe {
    /**
     * @param {?} _locale
     */
    constructor(_locale) {
        this._locale = _locale;
    }
    /**
     * @param {?} value
     * @param {?=} digits
     * @return {?}
     */
    transform(value, digits) {
        return formatNumber(DeprecatedDecimalPipe, this._locale, value, NumberFormatStyle.Decimal, digits);
    }
}
DeprecatedDecimalPipe.decorators = [
    { type: Pipe, args: [{ name: 'number' },] }
];
/** @nocollapse */
DeprecatedDecimalPipe.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
if (false) {
    /** @type {?} */
    DeprecatedDecimalPipe.prototype._locale;
}
/**
 * \@ngModule CommonModule
 *
 * \@description
 *
 * Formats a number as percentage according to locale rules.
 *
 * - `digitInfo` See {\@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * \@usageNotes
 *
 * ### Example
 *
 * {\@example common/pipes/ts/percent_pipe.ts region='DeprecatedPercentPipe'}
 *
 *
 */
export class DeprecatedPercentPipe {
    /**
     * @param {?} _locale
     */
    constructor(_locale) {
        this._locale = _locale;
    }
    /**
     * @param {?} value
     * @param {?=} digits
     * @return {?}
     */
    transform(value, digits) {
        return formatNumber(DeprecatedPercentPipe, this._locale, value, NumberFormatStyle.Percent, digits);
    }
}
DeprecatedPercentPipe.decorators = [
    { type: Pipe, args: [{ name: 'percent' },] }
];
/** @nocollapse */
DeprecatedPercentPipe.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
if (false) {
    /** @type {?} */
    DeprecatedPercentPipe.prototype._locale;
}
/**
 * \@ngModule CommonModule
 * \@description
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
 * - `digitInfo` See {\@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * \@usageNotes
 *
 * ### Example
 *
 * {\@example common/pipes/ts/currency_pipe.ts region='DeprecatedCurrencyPipe'}
 *
 *
 */
export class DeprecatedCurrencyPipe {
    /**
     * @param {?} _locale
     */
    constructor(_locale) {
        this._locale = _locale;
    }
    /**
     * @param {?} value
     * @param {?=} currencyCode
     * @param {?=} symbolDisplay
     * @param {?=} digits
     * @return {?}
     */
    transform(value, currencyCode = 'USD', symbolDisplay = false, digits) {
        return formatNumber(DeprecatedCurrencyPipe, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    }
}
DeprecatedCurrencyPipe.decorators = [
    { type: Pipe, args: [{ name: 'currency' },] }
];
/** @nocollapse */
DeprecatedCurrencyPipe.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
if (false) {
    /** @type {?} */
    DeprecatedCurrencyPipe.prototype._locale;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL2RlcHJlY2F0ZWQvbnVtYmVyX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2pGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7O0FBRXZDLFNBQVMsWUFBWSxDQUNqQixJQUFlLEVBQUUsTUFBYyxFQUFFLEtBQXNCLEVBQUUsS0FBd0IsRUFDakYsTUFBc0IsRUFBRSxXQUEwQixJQUFJLEVBQ3RELG1CQUE0QixLQUFLO0lBQ25DLElBQUksS0FBSyxJQUFJLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQzs7SUFHL0IsS0FBSyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUN6RixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixNQUFNLHdCQUF3QixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM3Qzs7SUFFRCxJQUFJLE1BQU0sQ0FBbUI7O0lBQzdCLElBQUksV0FBVyxDQUFtQjs7SUFDbEMsSUFBSSxXQUFXLENBQW1CO0lBQ2xDLElB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QUFFLFVBQVUsRUFBQzs7Ozt5Q0FFVCxNQUFNLFNBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIExPQ0FMRV9JRCwgUGlwZSwgUGlwZVRyYW5zZm9ybSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge05VTUJFUl9GT1JNQVRfUkVHRVhQLCBwYXJzZUludEF1dG9SYWRpeH0gZnJvbSAnLi4vLi4vaTE4bi9mb3JtYXRfbnVtYmVyJztcbmltcG9ydCB7TnVtYmVyRm9ybWF0U3R5bGV9IGZyb20gJy4uLy4uL2kxOG4vbG9jYWxlX2RhdGFfYXBpJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuaW1wb3J0IHtOdW1iZXJGb3JtYXR0ZXJ9IGZyb20gJy4vaW50bCc7XG5cbmZ1bmN0aW9uIGZvcm1hdE51bWJlcihcbiAgICBwaXBlOiBUeXBlPGFueT4sIGxvY2FsZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nLCBzdHlsZTogTnVtYmVyRm9ybWF0U3R5bGUsXG4gICAgZGlnaXRzPzogc3RyaW5nIHwgbnVsbCwgY3VycmVuY3k6IHN0cmluZyB8IG51bGwgPSBudWxsLFxuICAgIGN1cnJlbmN5QXNTeW1ib2w6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gIC8vIENvbnZlcnQgc3RyaW5ncyB0byBudW1iZXJzXG4gIHZhbHVlID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhaXNOYU4oK3ZhbHVlIC0gcGFyc2VGbG9hdCh2YWx1ZSkpID8gK3ZhbHVlIDogdmFsdWU7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKHBpcGUsIHZhbHVlKTtcbiAgfVxuXG4gIGxldCBtaW5JbnQ6IG51bWJlcnx1bmRlZmluZWQ7XG4gIGxldCBtaW5GcmFjdGlvbjogbnVtYmVyfHVuZGVmaW5lZDtcbiAgbGV0IG1heEZyYWN0aW9uOiBudW1iZXJ8dW5kZWZpbmVkO1xuICBpZiAoc3R5bGUgIT09IE51bWJlckZvcm1hdFN0eWxlLkN1cnJlbmN5KSB7XG4gICAgLy8gcmVseSBvbiBJbnRsIGRlZmF1bHQgZm9yIGN1cnJlbmN5XG4gICAgbWluSW50ID0gMTtcbiAgICBtaW5GcmFjdGlvbiA9IDA7XG4gICAgbWF4RnJhY3Rpb24gPSAzO1xuICB9XG5cbiAgaWYgKGRpZ2l0cykge1xuICAgIGNvbnN0IHBhcnRzID0gZGlnaXRzLm1hdGNoKE5VTUJFUl9GT1JNQVRfUkVHRVhQKTtcbiAgICBpZiAocGFydHMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkaWdpdHN9IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm8gZm9yIG51bWJlciBwaXBlc2ApO1xuICAgIH1cbiAgICBpZiAocGFydHNbMV0gIT0gbnVsbCkgeyAgLy8gbWluIGludGVnZXIgZGlnaXRzXG4gICAgICBtaW5JbnQgPSBwYXJzZUludEF1dG9SYWRpeChwYXJ0c1sxXSk7XG4gICAgfVxuICAgIGlmIChwYXJ0c1szXSAhPSBudWxsKSB7ICAvLyBtaW4gZnJhY3Rpb24gZGlnaXRzXG4gICAgICBtaW5GcmFjdGlvbiA9IHBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzNdKTtcbiAgICB9XG4gICAgaWYgKHBhcnRzWzVdICE9IG51bGwpIHsgIC8vIG1heCBmcmFjdGlvbiBkaWdpdHNcbiAgICAgIG1heEZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgocGFydHNbNV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBOdW1iZXJGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlIGFzIG51bWJlciwgbG9jYWxlLCBzdHlsZSwge1xuICAgIG1pbmltdW1JbnRlZ2VyRGlnaXRzOiBtaW5JbnQsXG4gICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiBtaW5GcmFjdGlvbixcbiAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IG1heEZyYWN0aW9uLFxuICAgIGN1cnJlbmN5OiBjdXJyZW5jeSxcbiAgICBjdXJyZW5jeUFzU3ltYm9sOiBjdXJyZW5jeUFzU3ltYm9sLFxuICB9KTtcbn1cblxuLyoqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIHRleHQuIEdyb3VwIHNpemluZyBhbmQgc2VwYXJhdG9yIGFuZCBvdGhlciBsb2NhbGUtc3BlY2lmaWNcbiAqIGNvbmZpZ3VyYXRpb25zIGFyZSBiYXNlZCBvbiB0aGUgYWN0aXZlIGxvY2FsZS5cbiAqXG4gKiB3aGVyZSBgZXhwcmVzc2lvbmAgaXMgYSBudW1iZXI6XG4gKiAgLSBgZGlnaXRJbmZvYCBpcyBhIGBzdHJpbmdgIHdoaWNoIGhhcyBhIGZvbGxvd2luZyBmb3JtYXQ6IDxicj5cbiAqICAgICA8Y29kZT57bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9PC9jb2RlPlxuICogICAtIGBtaW5JbnRlZ2VyRGlnaXRzYCBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgdG8gdXNlLiBEZWZhdWx0cyB0byBgMWAuXG4gKiAgIC0gYG1pbkZyYWN0aW9uRGlnaXRzYCBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byBgMGAuXG4gKiAgIC0gYG1heEZyYWN0aW9uRGlnaXRzYCBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byBgM2AuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIGFjY2VwdGFibGUgcmFuZ2UgZm9yIGVhY2ggb2YgdGhlc2UgbnVtYmVycyBhbmQgb3RoZXJcbiAqIGRldGFpbHMgc2VlIHlvdXIgbmF0aXZlIGludGVybmF0aW9uYWxpemF0aW9uIGxpYnJhcnkuXG4gKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSSB3aGljaCBpcyBub3QgeWV0IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnNcbiAqIGFuZCBtYXkgcmVxdWlyZSBhIHBvbHlmaWxsLiBTZWUgW0Jyb3dzZXIgU3VwcG9ydF0oZ3VpZGUvYnJvd3Nlci1zdXBwb3J0KSBmb3IgZGV0YWlscy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9udW1iZXJfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWROdW1iZXJQaXBlJ31cbiAqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKi9cbkBQaXBlKHtuYW1lOiAnbnVtYmVyJ30pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZERlY2ltYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgZGlnaXRzPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIHJldHVybiBmb3JtYXROdW1iZXIoXG4gICAgICAgIERlcHJlY2F0ZWREZWNpbWFsUGlwZSwgdGhpcy5fbG9jYWxlLCB2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuRGVjaW1hbCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIHBlcmNlbnRhZ2UgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiAtIGBkaWdpdEluZm9gIFNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9IGZvciBkZXRhaWxlZCBkZXNjcmlwdGlvbi5cbiAqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJIHdoaWNoIGlzIG5vdCB5ZXQgYXZhaWxhYmxlIGluIGFsbCBicm93c2Vyc1xuICogYW5kIG1heSByZXF1aXJlIGEgcG9seWZpbGwuIFNlZSBbQnJvd3NlciBTdXBwb3J0XShndWlkZS9icm93c2VyLXN1cHBvcnQpIGZvciBkZXRhaWxzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL3BlcmNlbnRfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWRQZXJjZW50UGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdwZXJjZW50J30pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZFBlcmNlbnRQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgZGlnaXRzPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIHJldHVybiBmb3JtYXROdW1iZXIoXG4gICAgICAgIERlcHJlY2F0ZWRQZXJjZW50UGlwZSwgdGhpcy5fbG9jYWxlLCB2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuUGVyY2VudCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgY3VycmVuY3kgdXNpbmcgbG9jYWxlIHJ1bGVzLlxuICpcbiAqIFVzZSBgY3VycmVuY3lgIHRvIGZvcm1hdCBhIG51bWJlciBhcyBjdXJyZW5jeS5cbiAqXG4gKiAtIGBjdXJyZW5jeUNvZGVgIGlzIHRoZSBbSVNPIDQyMTddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT180MjE3KSBjdXJyZW5jeSBjb2RlLCBzdWNoXG4gKiAgICBhcyBgVVNEYCBmb3IgdGhlIFVTIGRvbGxhciBhbmQgYEVVUmAgZm9yIHRoZSBldXJvLlxuICogLSBgc3ltYm9sRGlzcGxheWAgaXMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0byB1c2UgdGhlIGN1cnJlbmN5IHN5bWJvbCBvciBjb2RlLlxuICogICAtIGB0cnVlYDogdXNlIHN5bWJvbCAoZS5nLiBgJGApLlxuICogICAtIGBmYWxzZWAoZGVmYXVsdCk6IHVzZSBjb2RlIChlLmcuIGBVU0RgKS5cbiAqIC0gYGRpZ2l0SW5mb2AgU2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIGRldGFpbGVkIGRlc2NyaXB0aW9uLlxuICpcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgd2hpY2ggaXMgbm90IHlldCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzXG4gKiBhbmQgbWF5IHJlcXVpcmUgYSBwb2x5ZmlsbC4gU2VlIFtCcm93c2VyIFN1cHBvcnRdKGd1aWRlL2Jyb3dzZXItc3VwcG9ydCkgZm9yIGRldGFpbHMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvY3VycmVuY3lfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWRDdXJyZW5jeVBpcGUnfVxuICpcbiAqXG4gKi9cbkBQaXBlKHtuYW1lOiAnY3VycmVuY3knfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkQ3VycmVuY3lQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0oXG4gICAgICB2YWx1ZTogYW55LCBjdXJyZW5jeUNvZGU6IHN0cmluZyA9ICdVU0QnLCBzeW1ib2xEaXNwbGF5OiBib29sZWFuID0gZmFsc2UsXG4gICAgICBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZEN1cnJlbmN5UGlwZSwgdGhpcy5fbG9jYWxlLCB2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3ksIGRpZ2l0cyxcbiAgICAgICAgY3VycmVuY3lDb2RlLCBzeW1ib2xEaXNwbGF5KTtcbiAgfVxufVxuIl19