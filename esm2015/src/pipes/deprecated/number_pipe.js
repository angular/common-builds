/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { NUMBER_FORMAT_REGEXP, parseIntAutoRadix } from '../../i18n/format_number';
import { NumberFormatStyle } from '../../i18n/locale_data_api';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { NumberFormatter } from './intl';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
            minInt = parseIntAutoRadix(parts[1]);
        }
        if (parts[3] != null) { // min fraction digits
            minFraction = parseIntAutoRadix(parts[3]);
        }
        if (parts[5] != null) { // max fraction digits
            maxFraction = parseIntAutoRadix(parts[5]);
        }
    }
    return NumberFormatter.format((/** @type {?} */ (value)), locale, style, {
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
 * \@publicApi
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
    { type: Pipe, args: [{ name: 'number' },] },
];
/** @nocollapse */
DeprecatedDecimalPipe.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
/** @nocollapse */ DeprecatedDecimalPipe.ngPipeDef = i0.ΔdefinePipe({ name: "number", type: DeprecatedDecimalPipe, factory: function DeprecatedDecimalPipe_Factory(t) { return new (t || DeprecatedDecimalPipe)(i0.ΔdirectiveInject(LOCALE_ID)); }, pure: true });
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedDecimalPipe, [{
        type: Pipe,
        args: [{ name: 'number' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null);
if (false) {
    /**
     * @type {?}
     * @private
     */
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
 * \@publicApi
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
    { type: Pipe, args: [{ name: 'percent' },] },
];
/** @nocollapse */
DeprecatedPercentPipe.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
/** @nocollapse */ DeprecatedPercentPipe.ngPipeDef = i0.ΔdefinePipe({ name: "percent", type: DeprecatedPercentPipe, factory: function DeprecatedPercentPipe_Factory(t) { return new (t || DeprecatedPercentPipe)(i0.ΔdirectiveInject(LOCALE_ID)); }, pure: true });
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedPercentPipe, [{
        type: Pipe,
        args: [{ name: 'percent' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null);
if (false) {
    /**
     * @type {?}
     * @private
     */
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
 * \@publicApi
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
    { type: Pipe, args: [{ name: 'currency' },] },
];
/** @nocollapse */
DeprecatedCurrencyPipe.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
/** @nocollapse */ DeprecatedCurrencyPipe.ngPipeDef = i0.ΔdefinePipe({ name: "currency", type: DeprecatedCurrencyPipe, factory: function DeprecatedCurrencyPipe_Factory(t) { return new (t || DeprecatedCurrencyPipe)(i0.ΔdirectiveInject(LOCALE_ID)); }, pure: true });
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedCurrencyPipe, [{
        type: Pipe,
        args: [{ name: 'currency' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null);
if (false) {
    /**
     * @type {?}
     * @private
     */
    DeprecatedCurrencyPipe.prototype._locale;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL2RlcHJlY2F0ZWQvbnVtYmVyX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBc0IsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDeEUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV2QyxTQUFTLFlBQVksQ0FDakIsSUFBZSxFQUFFLE1BQWMsRUFBRSxLQUFzQixFQUFFLEtBQXdCLEVBQ2pGLE1BQXNCLEVBQUUsV0FBMEIsSUFBSSxFQUN0RCxtQkFBNEIsS0FBSztJQUNuQyxJQUFJLEtBQUssSUFBSSxJQUFJO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFL0IsNkJBQTZCO0lBQzdCLEtBQUssR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDekYsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsTUFBTSx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDN0M7O1FBRUcsTUFBd0I7O1FBQ3hCLFdBQTZCOztRQUM3QixXQUE2QjtJQUNqQyxJQUFJLEtBQUssS0FBSyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUU7UUFDeEMsb0NBQW9DO1FBQ3BDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLFdBQVcsR0FBRyxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFJLE1BQU0sRUFBRTs7Y0FDSixLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztRQUNoRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLE1BQU0sNkNBQTZDLENBQUMsQ0FBQztTQUN6RTtRQUNELElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFHLHFCQUFxQjtZQUM1QyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRyxzQkFBc0I7WUFDN0MsV0FBVyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUcsc0JBQXNCO1lBQzdDLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQztLQUNGO0lBRUQsT0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLG1CQUFBLEtBQUssRUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7UUFDNUQsb0JBQW9CLEVBQUUsTUFBTTtRQUM1QixxQkFBcUIsRUFBRSxXQUFXO1FBQ2xDLHFCQUFxQixFQUFFLFdBQVc7UUFDbEMsUUFBUSxFQUFFLFFBQVE7UUFDbEIsZ0JBQWdCLEVBQUUsZ0JBQWdCO0tBQ25DLENBQUMsQ0FBQztBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCRCxNQUFNLE9BQU8scUJBQXFCOzs7O0lBQ2hDLFlBQXVDLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQzs7Ozs7O0lBRTFELFNBQVMsQ0FBQyxLQUFVLEVBQUUsTUFBZTtRQUNuQyxPQUFPLFlBQVksQ0FDZixxQkFBcUIsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDckYsQ0FBQzs7O1lBUEYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQzs7Ozt5Q0FFUCxNQUFNLFNBQUMsU0FBUzs7eUVBRGxCLHFCQUFxQix3RUFBckIscUJBQXFCLHNCQUNaLFNBQVM7bUNBRGxCLHFCQUFxQjtjQURqQyxJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDOztzQkFFUCxNQUFNO3VCQUFDLFNBQVM7Ozs7Ozs7SUFBakIsd0NBQTBDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJ4RCxNQUFNLE9BQU8scUJBQXFCOzs7O0lBQ2hDLFlBQXVDLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQzs7Ozs7O0lBRTFELFNBQVMsQ0FBQyxLQUFVLEVBQUUsTUFBZTtRQUNuQyxPQUFPLFlBQVksQ0FDZixxQkFBcUIsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDckYsQ0FBQzs7O1lBUEYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQzs7Ozt5Q0FFUixNQUFNLFNBQUMsU0FBUzs7MEVBRGxCLHFCQUFxQix3RUFBckIscUJBQXFCLHNCQUNaLFNBQVM7bUNBRGxCLHFCQUFxQjtjQURqQyxJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDOztzQkFFUixNQUFNO3VCQUFDLFNBQVM7Ozs7Ozs7SUFBakIsd0NBQTBDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUN4RCxNQUFNLE9BQU8sc0JBQXNCOzs7O0lBQ2pDLFlBQXVDLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQzs7Ozs7Ozs7SUFFMUQsU0FBUyxDQUNMLEtBQVUsRUFBRSxlQUF1QixLQUFLLEVBQUUsZ0JBQXlCLEtBQUssRUFDeEUsTUFBZTtRQUNqQixPQUFPLFlBQVksQ0FDZixzQkFBc0IsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUMvRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7O1lBVkYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQzs7Ozt5Q0FFVCxNQUFNLFNBQUMsU0FBUzs7NEVBRGxCLHNCQUFzQix5RUFBdEIsc0JBQXNCLHNCQUNiLFNBQVM7bUNBRGxCLHNCQUFzQjtjQURsQyxJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDOztzQkFFVCxNQUFNO3VCQUFDLFNBQVM7Ozs7Ozs7SUFBakIseUNBQTBDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgTE9DQUxFX0lELCBQaXBlLCBQaXBlVHJhbnNmb3JtLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TlVNQkVSX0ZPUk1BVF9SRUdFWFAsIHBhcnNlSW50QXV0b1JhZGl4fSBmcm9tICcuLi8uLi9pMThuL2Zvcm1hdF9udW1iZXInO1xuaW1wb3J0IHtOdW1iZXJGb3JtYXRTdHlsZX0gZnJvbSAnLi4vLi4vaTE4bi9sb2NhbGVfZGF0YV9hcGknO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4uL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5pbXBvcnQge051bWJlckZvcm1hdHRlcn0gZnJvbSAnLi9pbnRsJztcblxuZnVuY3Rpb24gZm9ybWF0TnVtYmVyKFxuICAgIHBpcGU6IFR5cGU8YW55PiwgbG9jYWxlOiBzdHJpbmcsIHZhbHVlOiBudW1iZXIgfCBzdHJpbmcsIHN0eWxlOiBOdW1iZXJGb3JtYXRTdHlsZSxcbiAgICBkaWdpdHM/OiBzdHJpbmcgfCBudWxsLCBjdXJyZW5jeTogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4gICAgY3VycmVuY3lBc1N5bWJvbDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nfG51bGwge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgLy8gQ29udmVydCBzdHJpbmdzIHRvIG51bWJlcnNcbiAgdmFsdWUgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICFpc05hTigrdmFsdWUgLSBwYXJzZUZsb2F0KHZhbHVlKSkgPyArdmFsdWUgOiB2YWx1ZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IocGlwZSwgdmFsdWUpO1xuICB9XG5cbiAgbGV0IG1pbkludDogbnVtYmVyfHVuZGVmaW5lZDtcbiAgbGV0IG1pbkZyYWN0aW9uOiBudW1iZXJ8dW5kZWZpbmVkO1xuICBsZXQgbWF4RnJhY3Rpb246IG51bWJlcnx1bmRlZmluZWQ7XG4gIGlmIChzdHlsZSAhPT0gTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3kpIHtcbiAgICAvLyByZWx5IG9uIEludGwgZGVmYXVsdCBmb3IgY3VycmVuY3lcbiAgICBtaW5JbnQgPSAxO1xuICAgIG1pbkZyYWN0aW9uID0gMDtcbiAgICBtYXhGcmFjdGlvbiA9IDM7XG4gIH1cblxuICBpZiAoZGlnaXRzKSB7XG4gICAgY29uc3QgcGFydHMgPSBkaWdpdHMubWF0Y2goTlVNQkVSX0ZPUk1BVF9SRUdFWFApO1xuICAgIGlmIChwYXJ0cyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpZ2l0c30gaXMgbm90IGEgdmFsaWQgZGlnaXQgaW5mbyBmb3IgbnVtYmVyIHBpcGVzYCk7XG4gICAgfVxuICAgIGlmIChwYXJ0c1sxXSAhPSBudWxsKSB7ICAvLyBtaW4gaW50ZWdlciBkaWdpdHNcbiAgICAgIG1pbkludCA9IHBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzFdKTtcbiAgICB9XG4gICAgaWYgKHBhcnRzWzNdICE9IG51bGwpIHsgIC8vIG1pbiBmcmFjdGlvbiBkaWdpdHNcbiAgICAgIG1pbkZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgocGFydHNbM10pO1xuICAgIH1cbiAgICBpZiAocGFydHNbNV0gIT0gbnVsbCkgeyAgLy8gbWF4IGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgbWF4RnJhY3Rpb24gPSBwYXJzZUludEF1dG9SYWRpeChwYXJ0c1s1XSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE51bWJlckZvcm1hdHRlci5mb3JtYXQodmFsdWUgYXMgbnVtYmVyLCBsb2NhbGUsIHN0eWxlLCB7XG4gICAgbWluaW11bUludGVnZXJEaWdpdHM6IG1pbkludCxcbiAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IG1pbkZyYWN0aW9uLFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogbWF4RnJhY3Rpb24sXG4gICAgY3VycmVuY3k6IGN1cnJlbmN5LFxuICAgIGN1cnJlbmN5QXNTeW1ib2w6IGN1cnJlbmN5QXNTeW1ib2wsXG4gIH0pO1xufVxuXG4vKipcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgdGV4dC4gR3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpY1xuICogY29uZmlndXJhdGlvbnMgYXJlIGJhc2VkIG9uIHRoZSBhY3RpdmUgbG9jYWxlLlxuICpcbiAqIHdoZXJlIGBleHByZXNzaW9uYCBpcyBhIG51bWJlcjpcbiAqICAtIGBkaWdpdEluZm9gIGlzIGEgYHN0cmluZ2Agd2hpY2ggaGFzIGEgZm9sbG93aW5nIGZvcm1hdDogPGJyPlxuICogICAgIDxjb2RlPnttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c308L2NvZGU+XG4gKiAgIC0gYG1pbkludGVnZXJEaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBpbnRlZ2VyIGRpZ2l0cyB0byB1c2UuIERlZmF1bHRzIHRvIGAxYC5cbiAqICAgLSBgbWluRnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIGAwYC5cbiAqICAgLSBgbWF4RnJhY3Rpb25EaWdpdHNgIGlzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIGAzYC5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgYWNjZXB0YWJsZSByYW5nZSBmb3IgZWFjaCBvZiB0aGVzZSBudW1iZXJzIGFuZCBvdGhlclxuICogZGV0YWlscyBzZWUgeW91ciBuYXRpdmUgaW50ZXJuYXRpb25hbGl6YXRpb24gbGlicmFyeS5cbiAqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJIHdoaWNoIGlzIG5vdCB5ZXQgYXZhaWxhYmxlIGluIGFsbCBicm93c2Vyc1xuICogYW5kIG1heSByZXF1aXJlIGEgcG9seWZpbGwuIFNlZSBbQnJvd3NlciBTdXBwb3J0XShndWlkZS9icm93c2VyLXN1cHBvcnQpIGZvciBkZXRhaWxzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL251bWJlcl9waXBlLnRzIHJlZ2lvbj0nRGVwcmVjYXRlZE51bWJlclBpcGUnfVxuICpcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe25hbWU6ICdudW1iZXInfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkRGVjaW1hbFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZERlY2ltYWxQaXBlLCB0aGlzLl9sb2NhbGUsIHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsLCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgcGVyY2VudGFnZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIC0gYGRpZ2l0SW5mb2AgU2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIGRldGFpbGVkIGRlc2NyaXB0aW9uLlxuICpcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgd2hpY2ggaXMgbm90IHlldCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzXG4gKiBhbmQgbWF5IHJlcXVpcmUgYSBwb2x5ZmlsbC4gU2VlIFtCcm93c2VyIFN1cHBvcnRdKGd1aWRlL2Jyb3dzZXItc3VwcG9ydCkgZm9yIGRldGFpbHMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvcGVyY2VudF9waXBlLnRzIHJlZ2lvbj0nRGVwcmVjYXRlZFBlcmNlbnRQaXBlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAncGVyY2VudCd9KVxuZXhwb3J0IGNsYXNzIERlcHJlY2F0ZWRQZXJjZW50UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGRpZ2l0cz86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gZm9ybWF0TnVtYmVyKFxuICAgICAgICBEZXByZWNhdGVkUGVyY2VudFBpcGUsIHRoaXMuX2xvY2FsZSwgdmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLlBlcmNlbnQsIGRpZ2l0cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGN1cnJlbmN5IHVzaW5nIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBVc2UgYGN1cnJlbmN5YCB0byBmb3JtYXQgYSBudW1iZXIgYXMgY3VycmVuY3kuXG4gKlxuICogLSBgY3VycmVuY3lDb2RlYCBpcyB0aGUgW0lTTyA0MjE3XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fNDIxNykgY3VycmVuY3kgY29kZSwgc3VjaFxuICogICAgYXMgYFVTRGAgZm9yIHRoZSBVUyBkb2xsYXIgYW5kIGBFVVJgIGZvciB0aGUgZXVyby5cbiAqIC0gYHN5bWJvbERpc3BsYXlgIGlzIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gdXNlIHRoZSBjdXJyZW5jeSBzeW1ib2wgb3IgY29kZS5cbiAqICAgLSBgdHJ1ZWA6IHVzZSBzeW1ib2wgKGUuZy4gYCRgKS5cbiAqICAgLSBgZmFsc2VgKGRlZmF1bHQpOiB1c2UgY29kZSAoZS5nLiBgVVNEYCkuXG4gKiAtIGBkaWdpdEluZm9gIFNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9IGZvciBkZXRhaWxlZCBkZXNjcmlwdGlvbi5cbiAqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJIHdoaWNoIGlzIG5vdCB5ZXQgYXZhaWxhYmxlIGluIGFsbCBicm93c2Vyc1xuICogYW5kIG1heSByZXF1aXJlIGEgcG9seWZpbGwuIFNlZSBbQnJvd3NlciBTdXBwb3J0XShndWlkZS9icm93c2VyLXN1cHBvcnQpIGZvciBkZXRhaWxzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2N1cnJlbmN5X3BpcGUudHMgcmVnaW9uPSdEZXByZWNhdGVkQ3VycmVuY3lQaXBlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAnY3VycmVuY3knfSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkQ3VycmVuY3lQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0oXG4gICAgICB2YWx1ZTogYW55LCBjdXJyZW5jeUNvZGU6IHN0cmluZyA9ICdVU0QnLCBzeW1ib2xEaXNwbGF5OiBib29sZWFuID0gZmFsc2UsXG4gICAgICBkaWdpdHM/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGZvcm1hdE51bWJlcihcbiAgICAgICAgRGVwcmVjYXRlZEN1cnJlbmN5UGlwZSwgdGhpcy5fbG9jYWxlLCB2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3ksIGRpZ2l0cyxcbiAgICAgICAgY3VycmVuY3lDb2RlLCBzeW1ib2xEaXNwbGF5KTtcbiAgfVxufVxuIl19