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
 * @see `formatNumber()`
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
 * See [Setting your app locale](guide/i18n#setting-up-the-locale-of-your-app).
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
        locale = locale || this._locale;
        try {
            const num = strToNumber(value);
            return formatNumber(num, locale, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(DecimalPipe, error.message);
        }
    }
}
DecimalPipe.ɵfac = function DecimalPipe_Factory(t) { return new (t || DecimalPipe)(i0.ɵɵdirectiveInject(LOCALE_ID)); };
DecimalPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "number", type: DecimalPipe, pure: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DecimalPipe, [{
        type: Pipe,
        args: [{ name: 'number' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null); })();
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a percentage
 * string, formatted according to locale rules that determine group sizing and
 * separator, decimal-point character, and other locale-specific
 * configurations.
 *
 * @see `formatPercent()`
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
    transform(value, digitsInfo, locale) {
        if (!isValue(value))
            return null;
        locale = locale || this._locale;
        try {
            const num = strToNumber(value);
            return formatPercent(num, locale, digitsInfo);
        }
        catch (error) {
            throw invalidPipeArgumentError(PercentPipe, error.message);
        }
    }
}
PercentPipe.ɵfac = function PercentPipe_Factory(t) { return new (t || PercentPipe)(i0.ɵɵdirectiveInject(LOCALE_ID)); };
PercentPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "percent", type: PercentPipe, pure: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PercentPipe, [{
        type: Pipe,
        args: [{ name: 'percent' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null); })();
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms a number to a currency string, formatted according to locale rules
 * that determine group sizing and separator, decimal-point character,
 * and other locale-specific configurations.
 *
 * {@a currency-code-deprecation}
 * <div class="alert is-helpful">
 *
 * **Deprecation notice:**
 *
 * The default currency code is currently always `USD` but this is deprecated from v9.
 *
 * **In v11 the default currency code will be taken from the current locale identified by
 * the `LOCALE_ID` token. See the [i18n guide](guide/i18n#setting-up-the-locale-of-your-app) for
 * more information.**
 *
 * If you need the previous behavior then set it by creating a `DEFAULT_CURRENCY_CODE` provider in
 * your application `NgModule`:
 *
 * ```ts
 * {provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'}
 * ```
 *
 * </div>
 *
 * @see `getCurrencySymbol()`
 * @see `formatCurrency()`
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
    transform(value, currencyCode, display = 'symbol', digitsInfo, locale) {
        if (!isValue(value))
            return null;
        locale = locale || this._locale;
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
}
CurrencyPipe.ɵfac = function CurrencyPipe_Factory(t) { return new (t || CurrencyPipe)(i0.ɵɵdirectiveInject(LOCALE_ID), i0.ɵɵdirectiveInject(DEFAULT_CURRENCY_CODE)); };
CurrencyPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "currency", type: CurrencyPipe, pure: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CurrencyPipe, [{
        type: Pipe,
        args: [{ name: 'currency' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [DEFAULT_CURRENCY_CODE]
            }] }]; }, null); })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDNUYsT0FBTyxFQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFMUQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBR3ZFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThERztBQUVILE1BQU0sT0FBTyxXQUFXO0lBQ3RCLFlBQXVDLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQztJQUsxRDs7Ozs7O09BTUc7SUFDSCxTQUFTLENBQUMsS0FBbUMsRUFBRSxVQUFtQixFQUFFLE1BQWU7UUFFakYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVqQyxNQUFNLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFaEMsSUFBSTtZQUNGLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixPQUFPLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxNQUFNLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUQ7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O0lBQ0gsQ0FBQzs7d0VBakZVLFlBQVksdUJBRVgsU0FBUyx3QkFDVCxxQkFBcUI7NkVBSHRCLFlBQVk7dUZBQVosWUFBWTtjQUR4QixJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDOztzQkFHakIsTUFBTTt1QkFBQyxTQUFTOztzQkFDaEIsTUFBTTt1QkFBQyxxQkFBcUI7O0FBaUZuQyxTQUFTLE9BQU8sQ0FBQyxLQUFtQztJQUNsRCxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsV0FBVyxDQUFDLEtBQW9CO0lBQ3ZDLDZCQUE2QjtJQUM3QixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDMUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDdEI7SUFDRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7REVGQVVMVF9DVVJSRU5DWV9DT0RFLCBJbmplY3QsIExPQ0FMRV9JRCwgUGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zvcm1hdEN1cnJlbmN5LCBmb3JtYXROdW1iZXIsIGZvcm1hdFBlcmNlbnR9IGZyb20gJy4uL2kxOG4vZm9ybWF0X251bWJlcic7XG5pbXBvcnQge2dldEN1cnJlbmN5U3ltYm9sfSBmcm9tICcuLi9pMThuL2xvY2FsZV9kYXRhX2FwaSc7XG5cbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgdmFsdWUgYWNjb3JkaW5nIHRvIGRpZ2l0IG9wdGlvbnMgYW5kIGxvY2FsZSBydWxlcy5cbiAqIExvY2FsZSBkZXRlcm1pbmVzIGdyb3VwIHNpemluZyBhbmQgc2VwYXJhdG9yLFxuICogZGVjaW1hbCBwb2ludCBjaGFyYWN0ZXIsIGFuZCBvdGhlciBsb2NhbGUtc3BlY2lmaWMgY29uZmlndXJhdGlvbnMuXG4gKlxuICogQHNlZSBgZm9ybWF0TnVtYmVyKClgXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgZGlnaXRzSW5mb1xuICpcbiAqIFRoZSB2YWx1ZSdzIGRlY2ltYWwgcmVwcmVzZW50YXRpb24gaXMgc3BlY2lmaWVkIGJ5IHRoZSBgZGlnaXRzSW5mb2BcbiAqIHBhcmFtZXRlciwgd3JpdHRlbiBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDo8YnI+XG4gKlxuICogYGBgXG4gKiB7bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9XG4gKiBgYGBcbiAqXG4gKiAgLSBgbWluSW50ZWdlckRpZ2l0c2A6XG4gKiBUaGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgYmVmb3JlIHRoZSBkZWNpbWFsIHBvaW50LlxuICogRGVmYXVsdCBpcyAxLlxuICpcbiAqIC0gYG1pbkZyYWN0aW9uRGlnaXRzYDpcbiAqIFRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuXG4gKiBEZWZhdWx0IGlzIDAuXG4gKlxuICogIC0gYG1heEZyYWN0aW9uRGlnaXRzYDpcbiAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuXG4gKiBEZWZhdWx0IGlzIDMuXG4gKlxuICogSWYgdGhlIGZvcm1hdHRlZCB2YWx1ZSBpcyB0cnVuY2F0ZWQgaXQgd2lsbCBiZSByb3VuZGVkIHVzaW5nIHRoZSBcInRvLW5lYXJlc3RcIiBtZXRob2Q6XG4gKlxuICogYGBgXG4gKiB7ezMuNiB8IG51bWJlcjogJzEuMC0wJ319XG4gKiA8IS0td2lsbCBvdXRwdXQgJzQnLS0+XG4gKlxuICoge3stMy42IHwgbnVtYmVyOicxLjAtMCd9fVxuICogPCEtLXdpbGwgb3V0cHV0ICctNCctLT5cbiAqIGBgYFxuICpcbiAqICMjIyBsb2NhbGVcbiAqXG4gKiBgbG9jYWxlYCB3aWxsIGZvcm1hdCBhIHZhbHVlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKiBMb2NhbGUgZGV0ZXJtaW5lcyBncm91cCBzaXppbmcgYW5kIHNlcGFyYXRvcixcbiAqIGRlY2ltYWwgcG9pbnQgY2hhcmFjdGVyLCBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljIGNvbmZpZ3VyYXRpb25zLlxuICpcbiAqIFdoZW4gbm90IHN1cHBsaWVkLCB1c2VzIHRoZSB2YWx1ZSBvZiBgTE9DQUxFX0lEYCwgd2hpY2ggaXMgYGVuLVVTYCBieSBkZWZhdWx0LlxuICpcbiAqIFNlZSBbU2V0dGluZyB5b3VyIGFwcCBsb2NhbGVdKGd1aWRlL2kxOG4jc2V0dGluZy11cC10aGUtbG9jYWxlLW9mLXlvdXItYXBwKS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgY29kZSBzaG93cyBob3cgdGhlIHBpcGUgdHJhbnNmb3JtcyB2YWx1ZXNcbiAqIGFjY29yZGluZyB0byB2YXJpb3VzIGZvcm1hdCBzcGVjaWZpY2F0aW9ucyxcbiAqIHdoZXJlIHRoZSBjYWxsZXIncyBkZWZhdWx0IGxvY2FsZSBpcyBgZW4tVVNgLlxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD1cImNvbW1vbi9waXBlcy90cy9udW1iZXJfcGlwZS50c1wiIHJlZ2lvbj0nTnVtYmVyUGlwZSc+PC9jb2RlLWV4YW1wbGU+XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ251bWJlcid9KVxuZXhwb3J0IGNsYXNzIERlY2ltYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXJ8c3RyaW5nLCBkaWdpdHNJbmZvPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbiAgdHJhbnNmb3JtKHZhbHVlOiBudWxsfHVuZGVmaW5lZCwgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogbnVsbDtcbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXJ8c3RyaW5nfG51bGx8dW5kZWZpbmVkLCBkaWdpdHNJbmZvPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcblxuICAvKipcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBmb3JtYXR0ZWQuXG4gICAqIEBwYXJhbSBkaWdpdHNJbmZvIFNldHMgZGlnaXQgYW5kIGRlY2ltYWwgcmVwcmVzZW50YXRpb24uXG4gICAqIFtTZWUgbW9yZV0oI2RpZ2l0c2luZm8pLlxuICAgKiBAcGFyYW0gbG9jYWxlIFNwZWNpZmllcyB3aGF0IGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICAgKiBbU2VlIG1vcmVdKCNsb2NhbGUpLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXJ8c3RyaW5nfG51bGx8dW5kZWZpbmVkLCBkaWdpdHNJbmZvPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmdcbiAgICAgIHxudWxsIHtcbiAgICBpZiAoIWlzVmFsdWUodmFsdWUpKSByZXR1cm4gbnVsbDtcblxuICAgIGxvY2FsZSA9IGxvY2FsZSB8fCB0aGlzLl9sb2NhbGU7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gc3RyVG9OdW1iZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGZvcm1hdE51bWJlcihudW0sIGxvY2FsZSwgZGlnaXRzSW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihEZWNpbWFsUGlwZSwgZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVHJhbnNmb3JtcyBhIG51bWJlciB0byBhIHBlcmNlbnRhZ2VcbiAqIHN0cmluZywgZm9ybWF0dGVkIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMgdGhhdCBkZXRlcm1pbmUgZ3JvdXAgc2l6aW5nIGFuZFxuICogc2VwYXJhdG9yLCBkZWNpbWFsLXBvaW50IGNoYXJhY3RlciwgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpY1xuICogY29uZmlndXJhdGlvbnMuXG4gKlxuICogQHNlZSBgZm9ybWF0UGVyY2VudCgpYFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgZm9sbG93aW5nIGNvZGUgc2hvd3MgaG93IHRoZSBwaXBlIHRyYW5zZm9ybXMgbnVtYmVyc1xuICogaW50byB0ZXh0IHN0cmluZ3MsIGFjY29yZGluZyB0byB2YXJpb3VzIGZvcm1hdCBzcGVjaWZpY2F0aW9ucyxcbiAqIHdoZXJlIHRoZSBjYWxsZXIncyBkZWZhdWx0IGxvY2FsZSBpcyBgZW4tVVNgLlxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD1cImNvbW1vbi9waXBlcy90cy9wZXJjZW50X3BpcGUudHNcIiByZWdpb249J1BlcmNlbnRQaXBlJz48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAncGVyY2VudCd9KVxuZXhwb3J0IGNsYXNzIFBlcmNlbnRQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBudW1iZXIgdG8gYmUgZm9ybWF0dGVkIGFzIGEgcGVyY2VudGFnZS5cbiAgICogQHBhcmFtIGRpZ2l0c0luZm8gRGVjaW1hbCByZXByZXNlbnRhdGlvbiBvcHRpb25zLCBzcGVjaWZpZWQgYnkgYSBzdHJpbmdcbiAgICogaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6PGJyPlxuICAgKiA8Y29kZT57bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9PC9jb2RlPi5cbiAgICogICAtIGBtaW5JbnRlZ2VyRGlnaXRzYDogVGhlIG1pbmltdW0gbnVtYmVyIG9mIGludGVnZXIgZGlnaXRzIGJlZm9yZSB0aGUgZGVjaW1hbCBwb2ludC5cbiAgICogRGVmYXVsdCBpcyBgMWAuXG4gICAqICAgLSBgbWluRnJhY3Rpb25EaWdpdHNgOiBUaGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LlxuICAgKiBEZWZhdWx0IGlzIGAwYC5cbiAgICogICAtIGBtYXhGcmFjdGlvbkRpZ2l0c2A6IFRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuXG4gICAqIERlZmF1bHQgaXMgYDBgLlxuICAgKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAgICogV2hlbiBub3Qgc3VwcGxpZWQsIHVzZXMgdGhlIHZhbHVlIG9mIGBMT0NBTEVfSURgLCB3aGljaCBpcyBgZW4tVVNgIGJ5IGRlZmF1bHQuXG4gICAqIFNlZSBbU2V0dGluZyB5b3VyIGFwcCBsb2NhbGVdKGd1aWRlL2kxOG4jc2V0dGluZy11cC10aGUtbG9jYWxlLW9mLXlvdXItYXBwKS5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVtYmVyfHN0cmluZywgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGw7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVsbHx1bmRlZmluZWQsIGRpZ2l0c0luZm8/OiBzdHJpbmcsIGxvY2FsZT86IHN0cmluZyk6IG51bGw7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVtYmVyfHN0cmluZ3xudWxsfHVuZGVmaW5lZCwgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGw7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVtYmVyfHN0cmluZ3xudWxsfHVuZGVmaW5lZCwgZGlnaXRzSW5mbz86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nXG4gICAgICB8bnVsbCB7XG4gICAgaWYgKCFpc1ZhbHVlKHZhbHVlKSkgcmV0dXJuIG51bGw7XG4gICAgbG9jYWxlID0gbG9jYWxlIHx8IHRoaXMuX2xvY2FsZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gc3RyVG9OdW1iZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGZvcm1hdFBlcmNlbnQobnVtLCBsb2NhbGUsIGRpZ2l0c0luZm8pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoUGVyY2VudFBpcGUsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFRyYW5zZm9ybXMgYSBudW1iZXIgdG8gYSBjdXJyZW5jeSBzdHJpbmcsIGZvcm1hdHRlZCBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzXG4gKiB0aGF0IGRldGVybWluZSBncm91cCBzaXppbmcgYW5kIHNlcGFyYXRvciwgZGVjaW1hbC1wb2ludCBjaGFyYWN0ZXIsXG4gKiBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljIGNvbmZpZ3VyYXRpb25zLlxuICpcbiAqIHtAYSBjdXJyZW5jeS1jb2RlLWRlcHJlY2F0aW9ufVxuICogPGRpdiBjbGFzcz1cImFsZXJ0IGlzLWhlbHBmdWxcIj5cbiAqXG4gKiAqKkRlcHJlY2F0aW9uIG5vdGljZToqKlxuICpcbiAqIFRoZSBkZWZhdWx0IGN1cnJlbmN5IGNvZGUgaXMgY3VycmVudGx5IGFsd2F5cyBgVVNEYCBidXQgdGhpcyBpcyBkZXByZWNhdGVkIGZyb20gdjkuXG4gKlxuICogKipJbiB2MTEgdGhlIGRlZmF1bHQgY3VycmVuY3kgY29kZSB3aWxsIGJlIHRha2VuIGZyb20gdGhlIGN1cnJlbnQgbG9jYWxlIGlkZW50aWZpZWQgYnlcbiAqIHRoZSBgTE9DQUxFX0lEYCB0b2tlbi4gU2VlIHRoZSBbaTE4biBndWlkZV0oZ3VpZGUvaTE4biNzZXR0aW5nLXVwLXRoZS1sb2NhbGUtb2YteW91ci1hcHApIGZvclxuICogbW9yZSBpbmZvcm1hdGlvbi4qKlxuICpcbiAqIElmIHlvdSBuZWVkIHRoZSBwcmV2aW91cyBiZWhhdmlvciB0aGVuIHNldCBpdCBieSBjcmVhdGluZyBhIGBERUZBVUxUX0NVUlJFTkNZX0NPREVgIHByb3ZpZGVyIGluXG4gKiB5b3VyIGFwcGxpY2F0aW9uIGBOZ01vZHVsZWA6XG4gKlxuICogYGBgdHNcbiAqIHtwcm92aWRlOiBERUZBVUxUX0NVUlJFTkNZX0NPREUsIHVzZVZhbHVlOiAnVVNEJ31cbiAqIGBgYFxuICpcbiAqIDwvZGl2PlxuICpcbiAqIEBzZWUgYGdldEN1cnJlbmN5U3ltYm9sKClgXG4gKiBAc2VlIGBmb3JtYXRDdXJyZW5jeSgpYFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgZm9sbG93aW5nIGNvZGUgc2hvd3MgaG93IHRoZSBwaXBlIHRyYW5zZm9ybXMgbnVtYmVyc1xuICogaW50byB0ZXh0IHN0cmluZ3MsIGFjY29yZGluZyB0byB2YXJpb3VzIGZvcm1hdCBzcGVjaWZpY2F0aW9ucyxcbiAqIHdoZXJlIHRoZSBjYWxsZXIncyBkZWZhdWx0IGxvY2FsZSBpcyBgZW4tVVNgLlxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD1cImNvbW1vbi9waXBlcy90cy9jdXJyZW5jeV9waXBlLnRzXCIgcmVnaW9uPSdDdXJyZW5jeVBpcGUnPjwvY29kZS1leGFtcGxlPlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe25hbWU6ICdjdXJyZW5jeSd9KVxuZXhwb3J0IGNsYXNzIEN1cnJlbmN5UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZyxcbiAgICAgIEBJbmplY3QoREVGQVVMVF9DVVJSRU5DWV9DT0RFKSBwcml2YXRlIF9kZWZhdWx0Q3VycmVuY3lDb2RlOiBzdHJpbmcgPSAnVVNEJykge31cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBudW1iZXIgdG8gYmUgZm9ybWF0dGVkIGFzIGN1cnJlbmN5LlxuICAgKiBAcGFyYW0gY3VycmVuY3lDb2RlIFRoZSBbSVNPIDQyMTddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT180MjE3KSBjdXJyZW5jeSBjb2RlLFxuICAgKiBzdWNoIGFzIGBVU0RgIGZvciB0aGUgVVMgZG9sbGFyIGFuZCBgRVVSYCBmb3IgdGhlIGV1cm8uIFRoZSBkZWZhdWx0IGN1cnJlbmN5IGNvZGUgY2FuIGJlXG4gICAqIGNvbmZpZ3VyZWQgdXNpbmcgdGhlIGBERUZBVUxUX0NVUlJFTkNZX0NPREVgIGluamVjdGlvbiB0b2tlbi5cbiAgICogQHBhcmFtIGRpc3BsYXkgVGhlIGZvcm1hdCBmb3IgdGhlIGN1cnJlbmN5IGluZGljYXRvci4gT25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAqICAgLSBgY29kZWA6IFNob3cgdGhlIGNvZGUgKHN1Y2ggYXMgYFVTRGApLlxuICAgKiAgIC0gYHN5bWJvbGAoZGVmYXVsdCk6IFNob3cgdGhlIHN5bWJvbCAoc3VjaCBhcyBgJGApLlxuICAgKiAgIC0gYHN5bWJvbC1uYXJyb3dgOiBVc2UgdGhlIG5hcnJvdyBzeW1ib2wgZm9yIGxvY2FsZXMgdGhhdCBoYXZlIHR3byBzeW1ib2xzIGZvciB0aGVpclxuICAgKiBjdXJyZW5jeS5cbiAgICogRm9yIGV4YW1wbGUsIHRoZSBDYW5hZGlhbiBkb2xsYXIgQ0FEIGhhcyB0aGUgc3ltYm9sIGBDQSRgIGFuZCB0aGUgc3ltYm9sLW5hcnJvdyBgJGAuIElmIHRoZVxuICAgKiBsb2NhbGUgaGFzIG5vIG5hcnJvdyBzeW1ib2wsIHVzZXMgdGhlIHN0YW5kYXJkIHN5bWJvbCBmb3IgdGhlIGxvY2FsZS5cbiAgICogICAtIFN0cmluZzogVXNlIHRoZSBnaXZlbiBzdHJpbmcgdmFsdWUgaW5zdGVhZCBvZiBhIGNvZGUgb3IgYSBzeW1ib2wuXG4gICAqIEZvciBleGFtcGxlLCBhbiBlbXB0eSBzdHJpbmcgd2lsbCBzdXBwcmVzcyB0aGUgY3VycmVuY3kgJiBzeW1ib2wuXG4gICAqICAgLSBCb29sZWFuIChtYXJrZWQgZGVwcmVjYXRlZCBpbiB2NSk6IGB0cnVlYCBmb3Igc3ltYm9sIGFuZCBmYWxzZSBmb3IgYGNvZGVgLlxuICAgKlxuICAgKiBAcGFyYW0gZGlnaXRzSW5mbyBEZWNpbWFsIHJlcHJlc2VudGF0aW9uIG9wdGlvbnMsIHNwZWNpZmllZCBieSBhIHN0cmluZ1xuICAgKiBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDo8YnI+XG4gICAqIDxjb2RlPnttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c308L2NvZGU+LlxuICAgKiAgIC0gYG1pbkludGVnZXJEaWdpdHNgOiBUaGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgYmVmb3JlIHRoZSBkZWNpbWFsIHBvaW50LlxuICAgKiBEZWZhdWx0IGlzIGAxYC5cbiAgICogICAtIGBtaW5GcmFjdGlvbkRpZ2l0c2A6IFRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuXG4gICAqIERlZmF1bHQgaXMgYDJgLlxuICAgKiAgIC0gYG1heEZyYWN0aW9uRGlnaXRzYDogVGhlIG1heGltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciB0aGUgZGVjaW1hbCBwb2ludC5cbiAgICogRGVmYXVsdCBpcyBgMmAuXG4gICAqIElmIG5vdCBwcm92aWRlZCwgdGhlIG51bWJlciB3aWxsIGJlIGZvcm1hdHRlZCB3aXRoIHRoZSBwcm9wZXIgYW1vdW50IG9mIGRpZ2l0cyxcbiAgICogZGVwZW5kaW5nIG9uIHdoYXQgdGhlIFtJU08gNDIxN10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTcpIHNwZWNpZmllcy5cbiAgICogRm9yIGV4YW1wbGUsIHRoZSBDYW5hZGlhbiBkb2xsYXIgaGFzIDIgZGlnaXRzLCB3aGVyZWFzIHRoZSBDaGlsZWFuIHBlc28gaGFzIG5vbmUuXG4gICAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICAgKiBXaGVuIG5vdCBzdXBwbGllZCwgdXNlcyB0aGUgdmFsdWUgb2YgYExPQ0FMRV9JRGAsIHdoaWNoIGlzIGBlbi1VU2AgYnkgZGVmYXVsdC5cbiAgICogU2VlIFtTZXR0aW5nIHlvdXIgYXBwIGxvY2FsZV0oZ3VpZGUvaTE4biNzZXR0aW5nLXVwLXRoZS1sb2NhbGUtb2YteW91ci1hcHApLlxuICAgKi9cbiAgdHJhbnNmb3JtKFxuICAgICAgdmFsdWU6IG51bWJlcnxzdHJpbmcsIGN1cnJlbmN5Q29kZT86IHN0cmluZyxcbiAgICAgIGRpc3BsYXk/OiAnY29kZSd8J3N5bWJvbCd8J3N5bWJvbC1uYXJyb3cnfHN0cmluZ3xib29sZWFuLCBkaWdpdHNJbmZvPzogc3RyaW5nLFxuICAgICAgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGw7XG4gIHRyYW5zZm9ybShcbiAgICAgIHZhbHVlOiBudWxsfHVuZGVmaW5lZCwgY3VycmVuY3lDb2RlPzogc3RyaW5nLFxuICAgICAgZGlzcGxheT86ICdjb2RlJ3wnc3ltYm9sJ3wnc3ltYm9sLW5hcnJvdyd8c3RyaW5nfGJvb2xlYW4sIGRpZ2l0c0luZm8/OiBzdHJpbmcsXG4gICAgICBsb2NhbGU/OiBzdHJpbmcpOiBudWxsO1xuICB0cmFuc2Zvcm0oXG4gICAgICB2YWx1ZTogbnVtYmVyfHN0cmluZ3xudWxsfHVuZGVmaW5lZCwgY3VycmVuY3lDb2RlPzogc3RyaW5nLFxuICAgICAgZGlzcGxheT86ICdjb2RlJ3wnc3ltYm9sJ3wnc3ltYm9sLW5hcnJvdyd8c3RyaW5nfGJvb2xlYW4sIGRpZ2l0c0luZm8/OiBzdHJpbmcsXG4gICAgICBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbiAgdHJhbnNmb3JtKFxuICAgICAgdmFsdWU6IG51bWJlcnxzdHJpbmd8bnVsbHx1bmRlZmluZWQsIGN1cnJlbmN5Q29kZT86IHN0cmluZyxcbiAgICAgIGRpc3BsYXk6ICdjb2RlJ3wnc3ltYm9sJ3wnc3ltYm9sLW5hcnJvdyd8c3RyaW5nfGJvb2xlYW4gPSAnc3ltYm9sJywgZGlnaXRzSW5mbz86IHN0cmluZyxcbiAgICAgIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoIWlzVmFsdWUodmFsdWUpKSByZXR1cm4gbnVsbDtcblxuICAgIGxvY2FsZSA9IGxvY2FsZSB8fCB0aGlzLl9sb2NhbGU7XG5cbiAgICBpZiAodHlwZW9mIGRpc3BsYXkgPT09ICdib29sZWFuJykge1xuICAgICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIDxhbnk+Y29uc29sZSAmJiA8YW55PmNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICBgV2FybmluZzogdGhlIGN1cnJlbmN5IHBpcGUgaGFzIGJlZW4gY2hhbmdlZCBpbiBBbmd1bGFyIHY1LiBUaGUgc3ltYm9sRGlzcGxheSBvcHRpb24gKHRoaXJkIHBhcmFtZXRlcikgaXMgbm93IGEgc3RyaW5nIGluc3RlYWQgb2YgYSBib29sZWFuLiBUaGUgYWNjZXB0ZWQgdmFsdWVzIGFyZSBcImNvZGVcIiwgXCJzeW1ib2xcIiBvciBcInN5bWJvbC1uYXJyb3dcIi5gKTtcbiAgICAgIH1cbiAgICAgIGRpc3BsYXkgPSBkaXNwbGF5ID8gJ3N5bWJvbCcgOiAnY29kZSc7XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbmN5OiBzdHJpbmcgPSBjdXJyZW5jeUNvZGUgfHwgdGhpcy5fZGVmYXVsdEN1cnJlbmN5Q29kZTtcbiAgICBpZiAoZGlzcGxheSAhPT0gJ2NvZGUnKSB7XG4gICAgICBpZiAoZGlzcGxheSA9PT0gJ3N5bWJvbCcgfHwgZGlzcGxheSA9PT0gJ3N5bWJvbC1uYXJyb3cnKSB7XG4gICAgICAgIGN1cnJlbmN5ID0gZ2V0Q3VycmVuY3lTeW1ib2woY3VycmVuY3ksIGRpc3BsYXkgPT09ICdzeW1ib2wnID8gJ3dpZGUnIDogJ25hcnJvdycsIGxvY2FsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW5jeSA9IGRpc3BsYXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG51bSA9IHN0clRvTnVtYmVyKHZhbHVlKTtcbiAgICAgIHJldHVybiBmb3JtYXRDdXJyZW5jeShudW0sIGxvY2FsZSwgY3VycmVuY3ksIGN1cnJlbmN5Q29kZSwgZGlnaXRzSW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihDdXJyZW5jeVBpcGUsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbHVlKHZhbHVlOiBudW1iZXJ8c3RyaW5nfG51bGx8dW5kZWZpbmVkKTogdmFsdWUgaXMgbnVtYmVyfHN0cmluZyB7XG4gIHJldHVybiAhKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlICE9PSB2YWx1ZSk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIHN0cmluZyBpbnRvIGEgbnVtYmVyIChpZiBuZWVkZWQpLlxuICovXG5mdW5jdGlvbiBzdHJUb051bWJlcih2YWx1ZTogbnVtYmVyfHN0cmluZyk6IG51bWJlciB7XG4gIC8vIENvbnZlcnQgc3RyaW5ncyB0byBudW1iZXJzXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICFpc05hTihOdW1iZXIodmFsdWUpIC0gcGFyc2VGbG9hdCh2YWx1ZSkpKSB7XG4gICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dmFsdWV9IGlzIG5vdCBhIG51bWJlcmApO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cbiJdfQ==