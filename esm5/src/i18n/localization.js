import { __extends } from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Plural, getLocalePluralCase } from './locale_data_api';
import * as i0 from "@angular/core";
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
    __extends(NgLocaleLocalization, _super);
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
    NgLocaleLocalization.ɵfac = function NgLocaleLocalization_Factory(t) { return new (t || NgLocaleLocalization)(i0.ɵɵinject(LOCALE_ID)); };
    NgLocaleLocalization.ɵprov = i0.ɵɵdefineInjectable({ token: NgLocaleLocalization, factory: function (t) { return NgLocaleLocalization.ɵfac(t); }, providedIn: null });
    return NgLocaleLocalization;
}(NgLocalization));
export { NgLocaleLocalization };
/*@__PURE__*/ i0.ɵsetClassMetadata(NgLocaleLocalization, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxNQUFNLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQzs7QUFHOUQ7O0dBRUc7QUFDSDtJQUFBO0lBRUEsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7O0FBR0Q7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsS0FBYSxFQUFFLEtBQWUsRUFBRSxjQUE4QixFQUFFLE1BQWU7SUFDakYsSUFBSSxHQUFHLEdBQUcsTUFBSSxLQUFPLENBQUM7SUFFdEIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQzNCLE9BQU8sR0FBRyxDQUFDO0tBQ1o7SUFFRCxHQUFHLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUV0RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMvQixPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXNDLEtBQUssT0FBRyxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSDtJQUMwQyx3Q0FBYztJQUN0RCw4QkFBeUMsTUFBYztRQUF2RCxZQUEyRCxpQkFBTyxTQUFHO1FBQTVCLFlBQU0sR0FBTixNQUFNLENBQVE7O0lBQWEsQ0FBQztJQUVyRSxnREFBaUIsR0FBakIsVUFBa0IsS0FBVSxFQUFFLE1BQWU7UUFDM0MsSUFBTSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqRSxRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssTUFBTSxDQUFDLElBQUk7Z0JBQ2QsT0FBTyxNQUFNLENBQUM7WUFDaEIsS0FBSyxNQUFNLENBQUMsR0FBRztnQkFDYixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLEdBQUc7Z0JBQ2IsT0FBTyxLQUFLLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNiLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSTtnQkFDZCxPQUFPLE1BQU0sQ0FBQztZQUNoQjtnQkFDRSxPQUFPLE9BQU8sQ0FBQztTQUNsQjtJQUNILENBQUM7NEZBcEJVLG9CQUFvQixjQUNYLFNBQVM7Z0VBRGxCLG9CQUFvQixpQ0FBcEIsb0JBQW9COytCQXBEakM7Q0F5RUMsQUF0QkQsQ0FDMEMsY0FBYyxHQXFCdkQ7U0FyQlksb0JBQW9CO21DQUFwQixvQkFBb0I7Y0FEaEMsVUFBVTs7c0JBRUksTUFBTTt1QkFBQyxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgTE9DQUxFX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UGx1cmFsLCBnZXRMb2NhbGVQbHVyYWxDYXNlfSBmcm9tICcuL2xvY2FsZV9kYXRhX2FwaSc7XG5cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0xvY2FsaXphdGlvbiB7XG4gIGFic3RyYWN0IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnksIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZztcbn1cblxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBsdXJhbCBjYXRlZ29yeSBmb3IgYSBnaXZlbiB2YWx1ZS5cbiAqIC0gXCI9dmFsdWVcIiB3aGVuIHRoZSBjYXNlIGV4aXN0cyxcbiAqIC0gdGhlIHBsdXJhbCBjYXRlZ29yeSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsdXJhbENhdGVnb3J5KFxuICAgIHZhbHVlOiBudW1iZXIsIGNhc2VzOiBzdHJpbmdbXSwgbmdMb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQga2V5ID0gYD0ke3ZhbHVlfWA7XG5cbiAgaWYgKGNhc2VzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGtleSA9IG5nTG9jYWxpemF0aW9uLmdldFBsdXJhbENhdGVnb3J5KHZhbHVlLCBsb2NhbGUpO1xuXG4gIGlmIChjYXNlcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBpZiAoY2FzZXMuaW5kZXhPZignb3RoZXInKSA+IC0xKSB7XG4gICAgcmV0dXJuICdvdGhlcic7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYE5vIHBsdXJhbCBtZXNzYWdlIGZvdW5kIGZvciB2YWx1ZSBcIiR7dmFsdWV9XCJgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwbHVyYWwgY2FzZSBiYXNlZCBvbiB0aGUgbG9jYWxlXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdMb2NhbGVMb2NhbGl6YXRpb24gZXh0ZW5kcyBOZ0xvY2FsaXphdGlvbiB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcm90ZWN0ZWQgbG9jYWxlOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuXG4gIGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnksIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcGx1cmFsID0gZ2V0TG9jYWxlUGx1cmFsQ2FzZShsb2NhbGUgfHwgdGhpcy5sb2NhbGUpKHZhbHVlKTtcblxuICAgIHN3aXRjaCAocGx1cmFsKSB7XG4gICAgICBjYXNlIFBsdXJhbC5aZXJvOlxuICAgICAgICByZXR1cm4gJ3plcm8nO1xuICAgICAgY2FzZSBQbHVyYWwuT25lOlxuICAgICAgICByZXR1cm4gJ29uZSc7XG4gICAgICBjYXNlIFBsdXJhbC5Ud286XG4gICAgICAgIHJldHVybiAndHdvJztcbiAgICAgIGNhc2UgUGx1cmFsLkZldzpcbiAgICAgICAgcmV0dXJuICdmZXcnO1xuICAgICAgY2FzZSBQbHVyYWwuTWFueTpcbiAgICAgICAgcmV0dXJuICdtYW55JztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnb3RoZXInO1xuICAgIH1cbiAgfVxufVxuIl19