/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Plural, getLocalePluralCase } from './locale_data_api';
/**
 * @publicApi
 */
var NgLocalization = /** @class */ (function () {
    function NgLocalization() {
    }
    return NgLocalization;
}());
export { NgLocalization };
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
    var key = "=" + value;
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
    throw new Error("No plural message found for value \"" + value + "\"");
}
/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
var NgLocaleLocalization = /** @class */ (function (_super) {
    tslib_1.__extends(NgLocaleLocalization, _super);
    function NgLocaleLocalization(locale) {
        var _this = _super.call(this) || this;
        _this.locale = locale;
        return _this;
    }
    NgLocaleLocalization.prototype.getPluralCategory = function (value, locale) {
        var plural = getLocalePluralCase(locale || this.locale)(value);
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
    };
    NgLocaleLocalization = tslib_1.__decorate([
        Injectable(),
        tslib_1.__param(0, Inject(LOCALE_ID)),
        tslib_1.__metadata("design:paramtypes", [String])
    ], NgLocaleLocalization);
    return NgLocaleLocalization;
}(NgLocalization));
export { NgLocaleLocalization };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxNQUFNLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUc5RDs7R0FFRztBQUNIO0lBQUE7SUFFQSxDQUFDO0lBQUQscUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQzs7QUFHRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixLQUFhLEVBQUUsS0FBZSxFQUFFLGNBQThCLEVBQUUsTUFBZTtJQUNqRixJQUFJLEdBQUcsR0FBRyxNQUFJLEtBQU8sQ0FBQztJQUV0QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELEdBQUcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXRELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMzQixPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQy9CLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBc0MsS0FBSyxPQUFHLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUVIO0lBQTBDLGdEQUFjO0lBQ3RELDhCQUF5QyxNQUFjO1FBQXZELFlBQTJELGlCQUFPLFNBQUc7UUFBNUIsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7SUFBYSxDQUFDO0lBRXJFLGdEQUFpQixHQUFqQixVQUFrQixLQUFVLEVBQUUsTUFBZTtRQUMzQyxJQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpFLFFBQVEsTUFBTSxFQUFFO1lBQ2QsS0FBSyxNQUFNLENBQUMsSUFBSTtnQkFDZCxPQUFPLE1BQU0sQ0FBQztZQUNoQixLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNiLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsR0FBRztnQkFDYixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLEdBQUc7Z0JBQ2IsT0FBTyxLQUFLLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJO2dCQUNkLE9BQU8sTUFBTSxDQUFDO1lBQ2hCO2dCQUNFLE9BQU8sT0FBTyxDQUFDO1NBQ2xCO0lBQ0gsQ0FBQztJQXBCVSxvQkFBb0I7UUFEaEMsVUFBVSxFQUFFO1FBRUUsbUJBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBOztPQURuQixvQkFBb0IsQ0FxQmhDO0lBQUQsMkJBQUM7Q0FBQSxBQXJCRCxDQUEwQyxjQUFjLEdBcUJ2RDtTQXJCWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBMT0NBTEVfSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQbHVyYWwsIGdldExvY2FsZVBsdXJhbENhc2V9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nTG9jYWxpemF0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhdGVnb3J5IGZvciBhIGdpdmVuIHZhbHVlLlxuICogLSBcIj12YWx1ZVwiIHdoZW4gdGhlIGNhc2UgZXhpc3RzLFxuICogLSB0aGUgcGx1cmFsIGNhdGVnb3J5IG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1cmFsQ2F0ZWdvcnkoXG4gICAgdmFsdWU6IG51bWJlciwgY2FzZXM6IHN0cmluZ1tdLCBuZ0xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24sIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBrZXkgPSBgPSR7dmFsdWV9YDtcblxuICBpZiAoY2FzZXMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAga2V5ID0gbmdMb2NhbGl6YXRpb24uZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIGxvY2FsZSk7XG5cbiAgaWYgKGNhc2VzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGlmIChjYXNlcy5pbmRleE9mKCdvdGhlcicpID4gLTEpIHtcbiAgICByZXR1cm4gJ290aGVyJztcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgTm8gcGx1cmFsIG1lc3NhZ2UgZm91bmQgZm9yIHZhbHVlIFwiJHt2YWx1ZX1cImApO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBsdXJhbCBjYXNlIGJhc2VkIG9uIHRoZSBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZ0xvY2FsZUxvY2FsaXphdGlvbiBleHRlbmRzIE5nTG9jYWxpemF0aW9uIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByb3RlY3RlZCBsb2NhbGU6IHN0cmluZykgeyBzdXBlcigpOyB9XG5cbiAgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwbHVyYWwgPSBnZXRMb2NhbGVQbHVyYWxDYXNlKGxvY2FsZSB8fCB0aGlzLmxvY2FsZSkodmFsdWUpO1xuXG4gICAgc3dpdGNoIChwbHVyYWwpIHtcbiAgICAgIGNhc2UgUGx1cmFsLlplcm86XG4gICAgICAgIHJldHVybiAnemVybyc7XG4gICAgICBjYXNlIFBsdXJhbC5PbmU6XG4gICAgICAgIHJldHVybiAnb25lJztcbiAgICAgIGNhc2UgUGx1cmFsLlR3bzpcbiAgICAgICAgcmV0dXJuICd0d28nO1xuICAgICAgY2FzZSBQbHVyYWwuRmV3OlxuICAgICAgICByZXR1cm4gJ2Zldyc7XG4gICAgICBjYXNlIFBsdXJhbC5NYW55OlxuICAgICAgICByZXR1cm4gJ21hbnknO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdvdGhlcic7XG4gICAgfVxuICB9XG59XG4iXX0=