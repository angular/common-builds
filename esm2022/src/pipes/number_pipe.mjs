/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DEFAULT_CURRENCY_CODE, Inject, LOCALE_ID, Pipe } from '@angular/core';
import { formatCurrency, formatNumber, formatPercent } from '../i18n/format_number';
import { getCurrencySymbol } from '../i18n/locale_data_api';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a value according to digit options and locale rules.
 * Locale determines group sizing and separator,
 * decimal point character, and other locale-specific configurations.
 *
 * @see {@link formatNumber}
 *
 * @usageNotes
 *
 * ### digitsInfo
 *
 * The value's decimal representation is specified by the `digitsInfo`
 * parameter, written in the following format:<br>
 *
 * ```
 * {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
 * ```
 *
 *  - `minIntegerDigits`:
 * The minimum number of integer digits before the decimal point.
 * Default is 1.
 *
 * - `minFractionDigits`:
 * The minimum number of digits after the decimal point.
 * Default is 0.
 *
 *  - `maxFractionDigits`:
 * The maximum number of digits after the decimal point.
 * Default is 3.
 *
 * If the formatted value is truncated it will be rounded using the "to-nearest" method:
 *
 * ```
 * {{3.6 | number: '1.0-0'}}
 * <!--will output '4'-->
 *
 * {{-3.6 | number:'1.0-0'}}
 * <!--will output '-4'-->
 * ```
 *
 * ### locale
 *
 * `locale` will format a value according to locale rules.
 * Locale determines group sizing and separator,
 * decimal point character, and other locale-specific configurations.
 *
 * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
 *
 * See [Setting your app locale](guide/i18n-common-locale-id).
 *
 * ### Example
 *
 * The following code shows how the pipe transforms values
 * according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * <code-example path="common/pipes/ts/number_pipe.ts" region='NumberPipe'></code-example>
 *
 * @publicApi
 */
export class DecimalPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    /**
     * @param value The value to be formatted.
     * @param digitsInfo Sets digit and decimal representation.
     * [See more](#digitsinfo).
     * @param locale Specifies what locale format rules to use.
     * [See more](#locale).
     */
    transform(value, digitsInfo, locale) {
        if (!isValue(value))
            return null;
        locale ||= this._locale;
        try {
            const num = strToNumber(value);
            return formatNumber(num, locale, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(DecimalPipe, error.message);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: DecimalPipe, deps: [{ token: LOCALE_ID }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: DecimalPipe, isStandalone: true, name: "number" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: DecimalPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'number',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }] });
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a percentage
 * string, formatted according to locale rules that determine group sizing and
 * separator, decimal-point character, and other locale-specific
 * configurations.
 *
 * @see {@link formatPercent}
 *
 * @usageNotes
 * The following code shows how the pipe transforms numbers
 * into text strings, according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * <code-example path="common/pipes/ts/percent_pipe.ts" region='PercentPipe'></code-example>
 *
 * @publicApi
 */
export class PercentPipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    /**
     *
     * @param value The number to be formatted as a percentage.
     * @param digitsInfo Decimal representation options, specified by a string
     * in the following format:<br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
     * Default is `1`.
     *   - `minFractionDigits`: The minimum number of digits after the decimal point.
     * Default is `0`.
     *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
     * Default is `0`.
     * @param locale A locale code for the locale format rules to use.
     * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
     * See [Setting your app locale](guide/i18n-common-locale-id).
     */
    transform(value, digitsInfo, locale) {
        if (!isValue(value))
            return null;
        locale ||= this._locale;
        try {
            const num = strToNumber(value);
            return formatPercent(num, locale, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(PercentPipe, error.message);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: PercentPipe, deps: [{ token: LOCALE_ID }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: PercentPipe, isStandalone: true, name: "percent" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: PercentPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'percent',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }] });
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a currency string, formatted according to locale rules
 * that determine group sizing and separator, decimal-point character,
 * and other locale-specific configurations.
 *
 *
 * @see {@link getCurrencySymbol}
 * @see {@link formatCurrency}
 *
 * @usageNotes
 * The following code shows how the pipe transforms numbers
 * into text strings, according to various format specifications,
 * where the caller's default locale is `en-US`.
 *
 * <code-example path="common/pipes/ts/currency_pipe.ts" region='CurrencyPipe'></code-example>
 *
 * @publicApi
 */
export class CurrencyPipe {
    constructor(_locale, _defaultCurrencyCode = 'USD') {
        this._locale = _locale;
        this._defaultCurrencyCode = _defaultCurrencyCode;
    }
    /**
     *
     * @param value The number to be formatted as currency.
     * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code,
     * such as `USD` for the US dollar and `EUR` for the euro. The default currency code can be
     * configured using the `DEFAULT_CURRENCY_CODE` injection token.
     * @param display The format for the currency indicator. One of the following:
     *   - `code`: Show the code (such as `USD`).
     *   - `symbol`(default): Show the symbol (such as `$`).
     *   - `symbol-narrow`: Use the narrow symbol for locales that have two symbols for their
     * currency.
     * For example, the Canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`. If the
     * locale has no narrow symbol, uses the standard symbol for the locale.
     *   - String: Use the given string value instead of a code or a symbol.
     * For example, an empty string will suppress the currency & symbol.
     *   - Boolean (marked deprecated in v5): `true` for symbol and false for `code`.
     *
     * @param digitsInfo Decimal representation options, specified by a string
     * in the following format:<br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
     * Default is `1`.
     *   - `minFractionDigits`: The minimum number of digits after the decimal point.
     * Default is `2`.
     *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
     * Default is `2`.
     * If not provided, the number will be formatted with the proper amount of digits,
     * depending on what the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) specifies.
     * For example, the Canadian dollar has 2 digits, whereas the Chilean peso has none.
     * @param locale A locale code for the locale format rules to use.
     * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
     * See [Setting your app locale](guide/i18n-common-locale-id).
     */
    transform(value, currencyCode = this._defaultCurrencyCode, display = 'symbol', digitsInfo, locale) {
        if (!isValue(value))
            return null;
        locale ||= this._locale;
        if (typeof display === 'boolean') {
            if ((typeof ngDevMode === 'undefined' || ngDevMode) && console && console.warn) {
                console.warn(`Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
            }
            display = display ? 'symbol' : 'code';
        }
        let currency = currencyCode || this._defaultCurrencyCode;
        if (display !== 'code') {
            if (display === 'symbol' || display === 'symbol-narrow') {
                currency = getCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow', locale);
            }
            else {
                currency = display;
            }
        }
        try {
            const num = strToNumber(value);
            return formatCurrency(num, locale, currency, currencyCode, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(CurrencyPipe, error.message);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: CurrencyPipe, deps: [{ token: LOCALE_ID }, { token: DEFAULT_CURRENCY_CODE }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: CurrencyPipe, isStandalone: true, name: "currency" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.2+sha-79a3281", ngImport: i0, type: CurrencyPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'currency',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DEFAULT_CURRENCY_CODE]
                }] }] });
function isValue(value) {
    return !(value == null || value === '' || value !== value);
}
/**
 * Transforms a string into a number (if needed).
 */
function strToNumber(value) {
    // Convert strings to numbers
    if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
        return Number(value);
    }
    if (typeof value !== 'number') {
        throw new Error(`${value} is not a number`);
    }
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFFNUYsT0FBTyxFQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFMUQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBRXZFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThERztBQUtILE1BQU0sT0FBTyxXQUFXO0lBQ3RCLFlBQXVDLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQztJQVMxRDs7Ozs7O09BTUc7SUFDSCxTQUFTLENBQ1AsS0FBeUMsRUFDekMsVUFBbUIsRUFDbkIsTUFBZTtRQUVmLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFakMsTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFeEIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE9BQU8sWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixNQUFNLHdCQUF3QixDQUFDLFdBQVcsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7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Z2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7REVGQVVMVF9DVVJSRU5DWV9DT0RFLCBJbmplY3QsIExPQ0FMRV9JRCwgUGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Zm9ybWF0Q3VycmVuY3ksIGZvcm1hdE51bWJlciwgZm9ybWF0UGVyY2VudH0gZnJvbSAnLi4vaTE4bi9mb3JtYXRfbnVtYmVyJztcbmltcG9ydCB7Z2V0Q3VycmVuY3lTeW1ib2x9IGZyb20gJy4uL2kxOG4vbG9jYWxlX2RhdGFfYXBpJztcblxuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgdmFsdWUgYWNjb3JkaW5nIHRvIGRpZ2l0IG9wdGlvbnMgYW5kIGxvY2FsZSBydWxlcy5cbiAqIExvY2FsZSBkZXRlcm1pbmVzIGdyb3VwIHNpemluZyBhbmQgc2VwYXJhdG9yLFxuICogZGVjaW1hbCBwb2ludCBjaGFyYWN0ZXIsIGFuZCBvdGhlciBsb2NhbGUtc3BlY2lmaWMgY29uZmlndXJhdGlvbnMuXG4gKlxuICogQHNlZSB7QGxpbmsgZm9ybWF0TnVtYmVyfVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIGRpZ2l0c0luZm9cbiAqXG4gKiBUaGUgdmFsdWUncyBkZWNpbWFsIHJlcHJlc2VudGF0aW9uIGlzIHNwZWNpZmllZCBieSB0aGUgYGRpZ2l0c0luZm9gXG4gKiBwYXJhbWV0ZXIsIHdyaXR0ZW4gaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6PGJyPlxuICpcbiAqIGBgYFxuICoge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfVxuICogYGBgXG4gKlxuICogIC0gYG1pbkludGVnZXJEaWdpdHNgOlxuICogVGhlIG1pbmltdW0gbnVtYmVyIG9mIGludGVnZXIgZGlnaXRzIGJlZm9yZSB0aGUgZGVjaW1hbCBwb2ludC5cbiAqIERlZmF1bHQgaXMgMS5cbiAqXG4gKiAtIGBtaW5GcmFjdGlvbkRpZ2l0c2A6XG4gKiBUaGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LlxuICogRGVmYXVsdCBpcyAwLlxuICpcbiAqICAtIGBtYXhGcmFjdGlvbkRpZ2l0c2A6XG4gKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LlxuICogRGVmYXVsdCBpcyAzLlxuICpcbiAqIElmIHRoZSBmb3JtYXR0ZWQgdmFsdWUgaXMgdHJ1bmNhdGVkIGl0IHdpbGwgYmUgcm91bmRlZCB1c2luZyB0aGUgXCJ0by1uZWFyZXN0XCIgbWV0aG9kOlxuICpcbiAqIGBgYFxuICoge3szLjYgfCBudW1iZXI6ICcxLjAtMCd9fVxuICogPCEtLXdpbGwgb3V0cHV0ICc0Jy0tPlxuICpcbiAqIHt7LTMuNiB8IG51bWJlcjonMS4wLTAnfX1cbiAqIDwhLS13aWxsIG91dHB1dCAnLTQnLS0+XG4gKiBgYGBcbiAqXG4gKiAjIyMgbG9jYWxlXG4gKlxuICogYGxvY2FsZWAgd2lsbCBmb3JtYXQgYSB2YWx1ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICogTG9jYWxlIGRldGVybWluZXMgZ3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IsXG4gKiBkZWNpbWFsIHBvaW50IGNoYXJhY3RlciwgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpYyBjb25maWd1cmF0aW9ucy5cbiAqXG4gKiBXaGVuIG5vdCBzdXBwbGllZCwgdXNlcyB0aGUgdmFsdWUgb2YgYExPQ0FMRV9JRGAsIHdoaWNoIGlzIGBlbi1VU2AgYnkgZGVmYXVsdC5cbiAqXG4gKiBTZWUgW1NldHRpbmcgeW91ciBhcHAgbG9jYWxlXShndWlkZS9pMThuLWNvbW1vbi1sb2NhbGUtaWQpLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBjb2RlIHNob3dzIGhvdyB0aGUgcGlwZSB0cmFuc2Zvcm1zIHZhbHVlc1xuICogYWNjb3JkaW5nIHRvIHZhcmlvdXMgZm9ybWF0IHNwZWNpZmljYXRpb25zLFxuICogd2hlcmUgdGhlIGNhbGxlcidzIGRlZmF1bHQgbG9jYWxlIGlzIGBlbi1VU2AuXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPVwiY29tbW9uL3BpcGVzL3RzL251bWJlcl9waXBlLnRzXCIgcmVnaW9uPSdOdW1iZXJQaXBlJz48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ251bWJlcicsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIERlY2ltYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0odmFsdWU6IG51bWJlciB8IHN0cmluZywgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbDtcbiAgdHJhbnNmb3JtKHZhbHVlOiBudWxsIHwgdW5kZWZpbmVkLCBkaWdpdHNJbmZvPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBudWxsO1xuICB0cmFuc2Zvcm0oXG4gICAgdmFsdWU6IG51bWJlciB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgZGlnaXRzSW5mbz86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGw7XG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIGZvcm1hdHRlZC5cbiAgICogQHBhcmFtIGRpZ2l0c0luZm8gU2V0cyBkaWdpdCBhbmQgZGVjaW1hbCByZXByZXNlbnRhdGlvbi5cbiAgICogW1NlZSBtb3JlXSgjZGlnaXRzaW5mbykuXG4gICAqIEBwYXJhbSBsb2NhbGUgU3BlY2lmaWVzIHdoYXQgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gICAqIFtTZWUgbW9yZV0oI2xvY2FsZSkuXG4gICAqL1xuICB0cmFuc2Zvcm0oXG4gICAgdmFsdWU6IG51bWJlciB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgZGlnaXRzSW5mbz86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICghaXNWYWx1ZSh2YWx1ZSkpIHJldHVybiBudWxsO1xuXG4gICAgbG9jYWxlIHx8PSB0aGlzLl9sb2NhbGU7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gc3RyVG9OdW1iZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGZvcm1hdE51bWJlcihudW0sIGxvY2FsZSwgZGlnaXRzSW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihEZWNpbWFsUGlwZSwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBUcmFuc2Zvcm1zIGEgbnVtYmVyIHRvIGEgcGVyY2VudGFnZVxuICogc3RyaW5nLCBmb3JtYXR0ZWQgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcyB0aGF0IGRldGVybWluZSBncm91cCBzaXppbmcgYW5kXG4gKiBzZXBhcmF0b3IsIGRlY2ltYWwtcG9pbnQgY2hhcmFjdGVyLCBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljXG4gKiBjb25maWd1cmF0aW9ucy5cbiAqXG4gKiBAc2VlIHtAbGluayBmb3JtYXRQZXJjZW50fVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgZm9sbG93aW5nIGNvZGUgc2hvd3MgaG93IHRoZSBwaXBlIHRyYW5zZm9ybXMgbnVtYmVyc1xuICogaW50byB0ZXh0IHN0cmluZ3MsIGFjY29yZGluZyB0byB2YXJpb3VzIGZvcm1hdCBzcGVjaWZpY2F0aW9ucyxcbiAqIHdoZXJlIHRoZSBjYWxsZXIncyBkZWZhdWx0IGxvY2FsZSBpcyBgZW4tVVNgLlxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD1cImNvbW1vbi9waXBlcy90cy9wZXJjZW50X3BpcGUudHNcIiByZWdpb249J1BlcmNlbnRQaXBlJz48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ3BlcmNlbnQnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBQZXJjZW50UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcsIGRpZ2l0c0luZm8/OiBzdHJpbmcsIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB8IG51bGw7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVsbCB8IHVuZGVmaW5lZCwgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogbnVsbDtcbiAgdHJhbnNmb3JtKFxuICAgIHZhbHVlOiBudW1iZXIgfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGRpZ2l0c0luZm8/OiBzdHJpbmcsXG4gICAgbG9jYWxlPzogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBudWxsO1xuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBudW1iZXIgdG8gYmUgZm9ybWF0dGVkIGFzIGEgcGVyY2VudGFnZS5cbiAgICogQHBhcmFtIGRpZ2l0c0luZm8gRGVjaW1hbCByZXByZXNlbnRhdGlvbiBvcHRpb25zLCBzcGVjaWZpZWQgYnkgYSBzdHJpbmdcbiAgICogaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6PGJyPlxuICAgKiA8Y29kZT57bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9PC9jb2RlPi5cbiAgICogICAtIGBtaW5JbnRlZ2VyRGlnaXRzYDogVGhlIG1pbmltdW0gbnVtYmVyIG9mIGludGVnZXIgZGlnaXRzIGJlZm9yZSB0aGUgZGVjaW1hbCBwb2ludC5cbiAgICogRGVmYXVsdCBpcyBgMWAuXG4gICAqICAgLSBgbWluRnJhY3Rpb25EaWdpdHNgOiBUaGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LlxuICAgKiBEZWZhdWx0IGlzIGAwYC5cbiAgICogICAtIGBtYXhGcmFjdGlvbkRpZ2l0c2A6IFRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuXG4gICAqIERlZmF1bHQgaXMgYDBgLlxuICAgKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAgICogV2hlbiBub3Qgc3VwcGxpZWQsIHVzZXMgdGhlIHZhbHVlIG9mIGBMT0NBTEVfSURgLCB3aGljaCBpcyBgZW4tVVNgIGJ5IGRlZmF1bHQuXG4gICAqIFNlZSBbU2V0dGluZyB5b3VyIGFwcCBsb2NhbGVdKGd1aWRlL2kxOG4tY29tbW9uLWxvY2FsZS1pZCkuXG4gICAqL1xuICB0cmFuc2Zvcm0oXG4gICAgdmFsdWU6IG51bWJlciB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgZGlnaXRzSW5mbz86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICghaXNWYWx1ZSh2YWx1ZSkpIHJldHVybiBudWxsO1xuICAgIGxvY2FsZSB8fD0gdGhpcy5fbG9jYWxlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBudW0gPSBzdHJUb051bWJlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gZm9ybWF0UGVyY2VudChudW0sIGxvY2FsZSwgZGlnaXRzSW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihQZXJjZW50UGlwZSwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBUcmFuc2Zvcm1zIGEgbnVtYmVyIHRvIGEgY3VycmVuY3kgc3RyaW5nLCBmb3JtYXR0ZWQgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlc1xuICogdGhhdCBkZXRlcm1pbmUgZ3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IsIGRlY2ltYWwtcG9pbnQgY2hhcmFjdGVyLFxuICogYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpYyBjb25maWd1cmF0aW9ucy5cbiAqXG4gKlxuICogQHNlZSB7QGxpbmsgZ2V0Q3VycmVuY3lTeW1ib2x9XG4gKiBAc2VlIHtAbGluayBmb3JtYXRDdXJyZW5jeX1cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGZvbGxvd2luZyBjb2RlIHNob3dzIGhvdyB0aGUgcGlwZSB0cmFuc2Zvcm1zIG51bWJlcnNcbiAqIGludG8gdGV4dCBzdHJpbmdzLCBhY2NvcmRpbmcgdG8gdmFyaW91cyBmb3JtYXQgc3BlY2lmaWNhdGlvbnMsXG4gKiB3aGVyZSB0aGUgY2FsbGVyJ3MgZGVmYXVsdCBsb2NhbGUgaXMgYGVuLVVTYC5cbiAqXG4gKiA8Y29kZS1leGFtcGxlIHBhdGg9XCJjb21tb24vcGlwZXMvdHMvY3VycmVuY3lfcGlwZS50c1wiIHJlZ2lvbj0nQ3VycmVuY3lQaXBlJz48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ2N1cnJlbmN5JyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZyxcbiAgICBASW5qZWN0KERFRkFVTFRfQ1VSUkVOQ1lfQ09ERSkgcHJpdmF0ZSBfZGVmYXVsdEN1cnJlbmN5Q29kZTogc3RyaW5nID0gJ1VTRCcsXG4gICkge31cblxuICB0cmFuc2Zvcm0oXG4gICAgdmFsdWU6IG51bWJlciB8IHN0cmluZyxcbiAgICBjdXJyZW5jeUNvZGU/OiBzdHJpbmcsXG4gICAgZGlzcGxheT86ICdjb2RlJyB8ICdzeW1ib2wnIHwgJ3N5bWJvbC1uYXJyb3cnIHwgc3RyaW5nIHwgYm9vbGVhbixcbiAgICBkaWdpdHNJbmZvPzogc3RyaW5nLFxuICAgIGxvY2FsZT86IHN0cmluZyxcbiAgKTogc3RyaW5nIHwgbnVsbDtcbiAgdHJhbnNmb3JtKFxuICAgIHZhbHVlOiBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGN1cnJlbmN5Q29kZT86IHN0cmluZyxcbiAgICBkaXNwbGF5PzogJ2NvZGUnIHwgJ3N5bWJvbCcgfCAnc3ltYm9sLW5hcnJvdycgfCBzdHJpbmcgfCBib29sZWFuLFxuICAgIGRpZ2l0c0luZm8/OiBzdHJpbmcsXG4gICAgbG9jYWxlPzogc3RyaW5nLFxuICApOiBudWxsO1xuICB0cmFuc2Zvcm0oXG4gICAgdmFsdWU6IG51bWJlciB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgY3VycmVuY3lDb2RlPzogc3RyaW5nLFxuICAgIGRpc3BsYXk/OiAnY29kZScgfCAnc3ltYm9sJyB8ICdzeW1ib2wtbmFycm93JyB8IHN0cmluZyB8IGJvb2xlYW4sXG4gICAgZGlnaXRzSW5mbz86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGw7XG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG51bWJlciB0byBiZSBmb3JtYXR0ZWQgYXMgY3VycmVuY3kuXG4gICAqIEBwYXJhbSBjdXJyZW5jeUNvZGUgVGhlIFtJU08gNDIxN10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTcpIGN1cnJlbmN5IGNvZGUsXG4gICAqIHN1Y2ggYXMgYFVTRGAgZm9yIHRoZSBVUyBkb2xsYXIgYW5kIGBFVVJgIGZvciB0aGUgZXVyby4gVGhlIGRlZmF1bHQgY3VycmVuY3kgY29kZSBjYW4gYmVcbiAgICogY29uZmlndXJlZCB1c2luZyB0aGUgYERFRkFVTFRfQ1VSUkVOQ1lfQ09ERWAgaW5qZWN0aW9uIHRva2VuLlxuICAgKiBAcGFyYW0gZGlzcGxheSBUaGUgZm9ybWF0IGZvciB0aGUgY3VycmVuY3kgaW5kaWNhdG9yLiBPbmUgb2YgdGhlIGZvbGxvd2luZzpcbiAgICogICAtIGBjb2RlYDogU2hvdyB0aGUgY29kZSAoc3VjaCBhcyBgVVNEYCkuXG4gICAqICAgLSBgc3ltYm9sYChkZWZhdWx0KTogU2hvdyB0aGUgc3ltYm9sIChzdWNoIGFzIGAkYCkuXG4gICAqICAgLSBgc3ltYm9sLW5hcnJvd2A6IFVzZSB0aGUgbmFycm93IHN5bWJvbCBmb3IgbG9jYWxlcyB0aGF0IGhhdmUgdHdvIHN5bWJvbHMgZm9yIHRoZWlyXG4gICAqIGN1cnJlbmN5LlxuICAgKiBGb3IgZXhhbXBsZSwgdGhlIENhbmFkaWFuIGRvbGxhciBDQUQgaGFzIHRoZSBzeW1ib2wgYENBJGAgYW5kIHRoZSBzeW1ib2wtbmFycm93IGAkYC4gSWYgdGhlXG4gICAqIGxvY2FsZSBoYXMgbm8gbmFycm93IHN5bWJvbCwgdXNlcyB0aGUgc3RhbmRhcmQgc3ltYm9sIGZvciB0aGUgbG9jYWxlLlxuICAgKiAgIC0gU3RyaW5nOiBVc2UgdGhlIGdpdmVuIHN0cmluZyB2YWx1ZSBpbnN0ZWFkIG9mIGEgY29kZSBvciBhIHN5bWJvbC5cbiAgICogRm9yIGV4YW1wbGUsIGFuIGVtcHR5IHN0cmluZyB3aWxsIHN1cHByZXNzIHRoZSBjdXJyZW5jeSAmIHN5bWJvbC5cbiAgICogICAtIEJvb2xlYW4gKG1hcmtlZCBkZXByZWNhdGVkIGluIHY1KTogYHRydWVgIGZvciBzeW1ib2wgYW5kIGZhbHNlIGZvciBgY29kZWAuXG4gICAqXG4gICAqIEBwYXJhbSBkaWdpdHNJbmZvIERlY2ltYWwgcmVwcmVzZW50YXRpb24gb3B0aW9ucywgc3BlY2lmaWVkIGJ5IGEgc3RyaW5nXG4gICAqIGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0Ojxicj5cbiAgICogPGNvZGU+e21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfTwvY29kZT4uXG4gICAqICAgLSBgbWluSW50ZWdlckRpZ2l0c2A6IFRoZSBtaW5pbXVtIG51bWJlciBvZiBpbnRlZ2VyIGRpZ2l0cyBiZWZvcmUgdGhlIGRlY2ltYWwgcG9pbnQuXG4gICAqIERlZmF1bHQgaXMgYDFgLlxuICAgKiAgIC0gYG1pbkZyYWN0aW9uRGlnaXRzYDogVGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciB0aGUgZGVjaW1hbCBwb2ludC5cbiAgICogRGVmYXVsdCBpcyBgMmAuXG4gICAqICAgLSBgbWF4RnJhY3Rpb25EaWdpdHNgOiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LlxuICAgKiBEZWZhdWx0IGlzIGAyYC5cbiAgICogSWYgbm90IHByb3ZpZGVkLCB0aGUgbnVtYmVyIHdpbGwgYmUgZm9ybWF0dGVkIHdpdGggdGhlIHByb3BlciBhbW91bnQgb2YgZGlnaXRzLFxuICAgKiBkZXBlbmRpbmcgb24gd2hhdCB0aGUgW0lTTyA0MjE3XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fNDIxNykgc3BlY2lmaWVzLlxuICAgKiBGb3IgZXhhbXBsZSwgdGhlIENhbmFkaWFuIGRvbGxhciBoYXMgMiBkaWdpdHMsIHdoZXJlYXMgdGhlIENoaWxlYW4gcGVzbyBoYXMgbm9uZS5cbiAgICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gICAqIFdoZW4gbm90IHN1cHBsaWVkLCB1c2VzIHRoZSB2YWx1ZSBvZiBgTE9DQUxFX0lEYCwgd2hpY2ggaXMgYGVuLVVTYCBieSBkZWZhdWx0LlxuICAgKiBTZWUgW1NldHRpbmcgeW91ciBhcHAgbG9jYWxlXShndWlkZS9pMThuLWNvbW1vbi1sb2NhbGUtaWQpLlxuICAgKi9cbiAgdHJhbnNmb3JtKFxuICAgIHZhbHVlOiBudW1iZXIgfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGN1cnJlbmN5Q29kZTogc3RyaW5nID0gdGhpcy5fZGVmYXVsdEN1cnJlbmN5Q29kZSxcbiAgICBkaXNwbGF5OiAnY29kZScgfCAnc3ltYm9sJyB8ICdzeW1ib2wtbmFycm93JyB8IHN0cmluZyB8IGJvb2xlYW4gPSAnc3ltYm9sJyxcbiAgICBkaWdpdHNJbmZvPzogc3RyaW5nLFxuICAgIGxvY2FsZT86IHN0cmluZyxcbiAgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCFpc1ZhbHVlKHZhbHVlKSkgcmV0dXJuIG51bGw7XG5cbiAgICBsb2NhbGUgfHw9IHRoaXMuX2xvY2FsZTtcblxuICAgIGlmICh0eXBlb2YgZGlzcGxheSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgV2FybmluZzogdGhlIGN1cnJlbmN5IHBpcGUgaGFzIGJlZW4gY2hhbmdlZCBpbiBBbmd1bGFyIHY1LiBUaGUgc3ltYm9sRGlzcGxheSBvcHRpb24gKHRoaXJkIHBhcmFtZXRlcikgaXMgbm93IGEgc3RyaW5nIGluc3RlYWQgb2YgYSBib29sZWFuLiBUaGUgYWNjZXB0ZWQgdmFsdWVzIGFyZSBcImNvZGVcIiwgXCJzeW1ib2xcIiBvciBcInN5bWJvbC1uYXJyb3dcIi5gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZGlzcGxheSA9IGRpc3BsYXkgPyAnc3ltYm9sJyA6ICdjb2RlJztcbiAgICB9XG5cbiAgICBsZXQgY3VycmVuY3k6IHN0cmluZyA9IGN1cnJlbmN5Q29kZSB8fCB0aGlzLl9kZWZhdWx0Q3VycmVuY3lDb2RlO1xuICAgIGlmIChkaXNwbGF5ICE9PSAnY29kZScpIHtcbiAgICAgIGlmIChkaXNwbGF5ID09PSAnc3ltYm9sJyB8fCBkaXNwbGF5ID09PSAnc3ltYm9sLW5hcnJvdycpIHtcbiAgICAgICAgY3VycmVuY3kgPSBnZXRDdXJyZW5jeVN5bWJvbChjdXJyZW5jeSwgZGlzcGxheSA9PT0gJ3N5bWJvbCcgPyAnd2lkZScgOiAnbmFycm93JywgbG9jYWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbmN5ID0gZGlzcGxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gc3RyVG9OdW1iZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGZvcm1hdEN1cnJlbmN5KG51bSwgbG9jYWxlLCBjdXJyZW5jeSwgY3VycmVuY3lDb2RlLCBkaWdpdHNJbmZvKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEN1cnJlbmN5UGlwZSwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWx1ZSh2YWx1ZTogbnVtYmVyIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHZhbHVlIGlzIG51bWJlciB8IHN0cmluZyB7XG4gIHJldHVybiAhKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlICE9PSB2YWx1ZSk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIHN0cmluZyBpbnRvIGEgbnVtYmVyIChpZiBuZWVkZWQpLlxuICovXG5mdW5jdGlvbiBzdHJUb051bWJlcih2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcbiAgLy8gQ29udmVydCBzdHJpbmdzIHRvIG51bWJlcnNcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKE51bWJlcih2YWx1ZSkgLSBwYXJzZUZsb2F0KHZhbHVlKSkpIHtcbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHt2YWx1ZX0gaXMgbm90IGEgbnVtYmVyYCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuIl19