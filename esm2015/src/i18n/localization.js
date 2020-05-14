/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/i18n/localization.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { getLocalePluralCase, Plural } from './locale_data_api';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@publicApi
 * @abstract
 */
export class NgLocalization {
}
if (false) {
    /**
     * @abstract
     * @param {?} value
     * @param {?=} locale
     * @return {?}
     */
    NgLocalization.prototype.getPluralCategory = function (value, locale) { };
}
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 * @param {?} value
 * @param {?} cases
 * @param {?} ngLocalization
 * @param {?=} locale
 * @return {?}
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
    /** @type {?} */
    let key = `=${value}`;
    if (cases.indexOf(key) > -1) {
        return key;
    }
    key = ngLocalization.getPluralCategory(value, locale);
    if (cases.indexOf(key) > -1) {
        return key;
    }
    if (cases.indexOf('other') > -1) {
        return 'other';
    }
    throw new Error(`No plural message found for value "${value}"`);
}
/**
 * Returns the plural case based on the locale
 *
 * \@publicApi
 */
let NgLocaleLocalization = /** @class */ (() => {
    /**
     * Returns the plural case based on the locale
     *
     * \@publicApi
     */
    class NgLocaleLocalization extends NgLocalization {
        /**
         * @param {?} locale
         */
        constructor(locale) {
            super();
            this.locale = locale;
        }
        /**
         * @param {?} value
         * @param {?=} locale
         * @return {?}
         */
        getPluralCategory(value, locale) {
            /** @type {?} */
            const plural = getLocalePluralCase(locale || this.locale)(value);
            switch (plural) {
                case Plural.Zero:
                    return 'zero';
                case Plural.One:
                    return 'one';
                case Plural.Two:
                    return 'two';
                case Plural.Few:
                    return 'few';
                case Plural.Many:
                    return 'many';
                default:
                    return 'other';
            }
        }
    }
    NgLocaleLocalization.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    NgLocaleLocalization.ctorParameters = () => [
        { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
    ];
    /** @nocollapse */ NgLocaleLocalization.ɵfac = function NgLocaleLocalization_Factory(t) { return new (t || NgLocaleLocalization)(i0.ɵɵinject(LOCALE_ID)); };
    /** @nocollapse */ NgLocaleLocalization.ɵprov = i0.ɵɵdefineInjectable({ token: NgLocaleLocalization, factory: NgLocaleLocalization.ɵfac });
    return NgLocaleLocalization;
})();
export { NgLocaleLocalization };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgLocaleLocalization, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null); })();
if (false) {
    /**
     * @type {?}
     * @protected
     */
    NgLocaleLocalization.prototype.locale;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFNOUQsTUFBTSxPQUFnQixjQUFjO0NBRW5DOzs7Ozs7OztJQURDLDBFQUFnRTs7Ozs7Ozs7Ozs7O0FBU2xFLE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsS0FBYSxFQUFFLEtBQWUsRUFBRSxjQUE4QixFQUFFLE1BQWU7O1FBQzdFLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRTtJQUVyQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELEdBQUcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXRELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMzQixPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQy9CLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNsRSxDQUFDOzs7Ozs7QUFPRDs7Ozs7O0lBQUEsTUFDYSxvQkFBcUIsU0FBUSxjQUFjOzs7O1FBQ3RELFlBQXlDLE1BQWM7WUFDckQsS0FBSyxFQUFFLENBQUM7WUFEK0IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUV2RCxDQUFDOzs7Ozs7UUFFRCxpQkFBaUIsQ0FBQyxLQUFVLEVBQUUsTUFBZTs7a0JBQ3JDLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUVoRSxRQUFRLE1BQU0sRUFBRTtnQkFDZCxLQUFLLE1BQU0sQ0FBQyxJQUFJO29CQUNkLE9BQU8sTUFBTSxDQUFDO2dCQUNoQixLQUFLLE1BQU0sQ0FBQyxHQUFHO29CQUNiLE9BQU8sS0FBSyxDQUFDO2dCQUNmLEtBQUssTUFBTSxDQUFDLEdBQUc7b0JBQ2IsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsS0FBSyxNQUFNLENBQUMsR0FBRztvQkFDYixPQUFPLEtBQUssQ0FBQztnQkFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJO29CQUNkLE9BQU8sTUFBTSxDQUFDO2dCQUNoQjtvQkFDRSxPQUFPLE9BQU8sQ0FBQzthQUNsQjtRQUNILENBQUM7OztnQkF2QkYsVUFBVTs7Ozs2Q0FFSSxNQUFNLFNBQUMsU0FBUzs7K0dBRGxCLG9CQUFvQixjQUNYLFNBQVM7bUZBRGxCLG9CQUFvQixXQUFwQixvQkFBb0I7K0JBckRqQztLQTRFQztTQXZCWSxvQkFBb0I7a0RBQXBCLG9CQUFvQjtjQURoQyxVQUFVOztzQkFFSSxNQUFNO3VCQUFDLFNBQVM7Ozs7Ozs7SUFBakIsc0NBQTJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgTE9DQUxFX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtnZXRMb2NhbGVQbHVyYWxDYXNlLCBQbHVyYWx9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nTG9jYWxpemF0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhdGVnb3J5IGZvciBhIGdpdmVuIHZhbHVlLlxuICogLSBcIj12YWx1ZVwiIHdoZW4gdGhlIGNhc2UgZXhpc3RzLFxuICogLSB0aGUgcGx1cmFsIGNhdGVnb3J5IG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1cmFsQ2F0ZWdvcnkoXG4gICAgdmFsdWU6IG51bWJlciwgY2FzZXM6IHN0cmluZ1tdLCBuZ0xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24sIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBrZXkgPSBgPSR7dmFsdWV9YDtcblxuICBpZiAoY2FzZXMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAga2V5ID0gbmdMb2NhbGl6YXRpb24uZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIGxvY2FsZSk7XG5cbiAgaWYgKGNhc2VzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGlmIChjYXNlcy5pbmRleE9mKCdvdGhlcicpID4gLTEpIHtcbiAgICByZXR1cm4gJ290aGVyJztcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgTm8gcGx1cmFsIG1lc3NhZ2UgZm91bmQgZm9yIHZhbHVlIFwiJHt2YWx1ZX1cImApO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBsdXJhbCBjYXNlIGJhc2VkIG9uIHRoZSBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ0xvY2FsZUxvY2FsaXphdGlvbiBleHRlbmRzIE5nTG9jYWxpemF0aW9uIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByb3RlY3RlZCBsb2NhbGU6IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZTogYW55LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBsdXJhbCA9IGdldExvY2FsZVBsdXJhbENhc2UobG9jYWxlIHx8IHRoaXMubG9jYWxlKSh2YWx1ZSk7XG5cbiAgICBzd2l0Y2ggKHBsdXJhbCkge1xuICAgICAgY2FzZSBQbHVyYWwuWmVybzpcbiAgICAgICAgcmV0dXJuICd6ZXJvJztcbiAgICAgIGNhc2UgUGx1cmFsLk9uZTpcbiAgICAgICAgcmV0dXJuICdvbmUnO1xuICAgICAgY2FzZSBQbHVyYWwuVHdvOlxuICAgICAgICByZXR1cm4gJ3R3byc7XG4gICAgICBjYXNlIFBsdXJhbC5GZXc6XG4gICAgICAgIHJldHVybiAnZmV3JztcbiAgICAgIGNhc2UgUGx1cmFsLk1hbnk6XG4gICAgICAgIHJldHVybiAnbWFueSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ290aGVyJztcbiAgICB9XG4gIH1cbn1cbiJdfQ==