/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { getLocalePluralCase, Plural } from './locale_data_api';
import * as i0 from "@angular/core";
/**
 * @publicApi
 */
export class NgLocalization {
}
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
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
 * @publicApi
 */
let NgLocaleLocalization = /** @class */ (() => {
    class NgLocaleLocalization extends NgLocalization {
        constructor(locale) {
            super();
            this.locale = locale;
        }
        getPluralCategory(value, locale) {
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
    NgLocaleLocalization.ɵfac = function NgLocaleLocalization_Factory(t) { return new (t || NgLocaleLocalization)(i0.ɵɵinject(LOCALE_ID)); };
    NgLocaleLocalization.ɵprov = i0.ɵɵdefineInjectable({ token: NgLocaleLocalization, factory: NgLocaleLocalization.ɵfac });
    return NgLocaleLocalization;
})();
export { NgLocaleLocalization };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgLocaleLocalization, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUc5RDs7R0FFRztBQUNILE1BQU0sT0FBZ0IsY0FBYztDQUVuQztBQUdEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQzdCLEtBQWEsRUFBRSxLQUFlLEVBQUUsY0FBOEIsRUFBRSxNQUFlO0lBQ2pGLElBQUksR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7SUFFdEIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQzNCLE9BQU8sR0FBRyxDQUFDO0tBQ1o7SUFFRCxHQUFHLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUV0RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMvQixPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSDtJQUFBLE1BQ2Esb0JBQXFCLFNBQVEsY0FBYztRQUN0RCxZQUF5QyxNQUFjO1lBQ3JELEtBQUssRUFBRSxDQUFDO1lBRCtCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFdkQsQ0FBQztRQUVELGlCQUFpQixDQUFDLEtBQVUsRUFBRSxNQUFlO1lBQzNDLE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakUsUUFBUSxNQUFNLEVBQUU7Z0JBQ2QsS0FBSyxNQUFNLENBQUMsSUFBSTtvQkFDZCxPQUFPLE1BQU0sQ0FBQztnQkFDaEIsS0FBSyxNQUFNLENBQUMsR0FBRztvQkFDYixPQUFPLEtBQUssQ0FBQztnQkFDZixLQUFLLE1BQU0sQ0FBQyxHQUFHO29CQUNiLE9BQU8sS0FBSyxDQUFDO2dCQUNmLEtBQUssTUFBTSxDQUFDLEdBQUc7b0JBQ2IsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSTtvQkFDZCxPQUFPLE1BQU0sQ0FBQztnQkFDaEI7b0JBQ0UsT0FBTyxPQUFPLENBQUM7YUFDbEI7UUFDSCxDQUFDOzs0RkF0QlUsb0JBQW9CLGNBQ1gsU0FBUztnRUFEbEIsb0JBQW9CLFdBQXBCLG9CQUFvQjsrQkFyRGpDO0tBNEVDO1NBdkJZLG9CQUFvQjtrREFBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O3NCQUVJLE1BQU07dUJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgTE9DQUxFX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtnZXRMb2NhbGVQbHVyYWxDYXNlLCBQbHVyYWx9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nTG9jYWxpemF0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhdGVnb3J5IGZvciBhIGdpdmVuIHZhbHVlLlxuICogLSBcIj12YWx1ZVwiIHdoZW4gdGhlIGNhc2UgZXhpc3RzLFxuICogLSB0aGUgcGx1cmFsIGNhdGVnb3J5IG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1cmFsQ2F0ZWdvcnkoXG4gICAgdmFsdWU6IG51bWJlciwgY2FzZXM6IHN0cmluZ1tdLCBuZ0xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24sIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBrZXkgPSBgPSR7dmFsdWV9YDtcblxuICBpZiAoY2FzZXMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAga2V5ID0gbmdMb2NhbGl6YXRpb24uZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIGxvY2FsZSk7XG5cbiAgaWYgKGNhc2VzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGlmIChjYXNlcy5pbmRleE9mKCdvdGhlcicpID4gLTEpIHtcbiAgICByZXR1cm4gJ290aGVyJztcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgTm8gcGx1cmFsIG1lc3NhZ2UgZm91bmQgZm9yIHZhbHVlIFwiJHt2YWx1ZX1cImApO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBsdXJhbCBjYXNlIGJhc2VkIG9uIHRoZSBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ0xvY2FsZUxvY2FsaXphdGlvbiBleHRlbmRzIE5nTG9jYWxpemF0aW9uIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByb3RlY3RlZCBsb2NhbGU6IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZTogYW55LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBsdXJhbCA9IGdldExvY2FsZVBsdXJhbENhc2UobG9jYWxlIHx8IHRoaXMubG9jYWxlKSh2YWx1ZSk7XG5cbiAgICBzd2l0Y2ggKHBsdXJhbCkge1xuICAgICAgY2FzZSBQbHVyYWwuWmVybzpcbiAgICAgICAgcmV0dXJuICd6ZXJvJztcbiAgICAgIGNhc2UgUGx1cmFsLk9uZTpcbiAgICAgICAgcmV0dXJuICdvbmUnO1xuICAgICAgY2FzZSBQbHVyYWwuVHdvOlxuICAgICAgICByZXR1cm4gJ3R3byc7XG4gICAgICBjYXNlIFBsdXJhbC5GZXc6XG4gICAgICAgIHJldHVybiAnZmV3JztcbiAgICAgIGNhc2UgUGx1cmFsLk1hbnk6XG4gICAgICAgIHJldHVybiAnbWFueSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ290aGVyJztcbiAgICB9XG4gIH1cbn1cbiJdfQ==