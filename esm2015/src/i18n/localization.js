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
export class NgLocaleLocalization extends NgLocalization {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFNOUQsTUFBTSxPQUFnQixjQUFjO0NBRW5DOzs7Ozs7OztJQURDLDBFQUFnRTs7Ozs7Ozs7Ozs7O0FBU2xFLE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsS0FBYSxFQUFFLEtBQWUsRUFBRSxjQUE4QixFQUFFLE1BQWU7O1FBQzdFLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRTtJQUVyQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELEdBQUcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXRELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMzQixPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQy9CLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNsRSxDQUFDOzs7Ozs7QUFRRCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsY0FBYzs7OztJQUN0RCxZQUF5QyxNQUFjO1FBQ3JELEtBQUssRUFBRSxDQUFDO1FBRCtCLFdBQU0sR0FBTixNQUFNLENBQVE7SUFFdkQsQ0FBQzs7Ozs7O0lBRUQsaUJBQWlCLENBQUMsS0FBVSxFQUFFLE1BQWU7O2NBQ3JDLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVoRSxRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssTUFBTSxDQUFDLElBQUk7Z0JBQ2QsT0FBTyxNQUFNLENBQUM7WUFDaEIsS0FBSyxNQUFNLENBQUMsR0FBRztnQkFDYixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLEdBQUc7Z0JBQ2IsT0FBTyxLQUFLLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNiLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSTtnQkFDZCxPQUFPLE1BQU0sQ0FBQztZQUNoQjtnQkFDRSxPQUFPLE9BQU8sQ0FBQztTQUNsQjtJQUNILENBQUM7OztZQXZCRixVQUFVOzs7O3lDQUVJLE1BQU0sU0FBQyxTQUFTOzsyR0FEbEIsb0JBQW9CLGNBQ1gsU0FBUzsrRUFEbEIsb0JBQW9CLFdBQXBCLG9CQUFvQjtrREFBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O3NCQUVJLE1BQU07dUJBQUMsU0FBUzs7Ozs7OztJQUFqQixzQ0FBMkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBMT0NBTEVfSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2dldExvY2FsZVBsdXJhbENhc2UsIFBsdXJhbH0gZnJvbSAnLi9sb2NhbGVfZGF0YV9hcGknO1xuXG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdMb2NhbGl6YXRpb24ge1xuICBhYnN0cmFjdCBnZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZTogYW55LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwbHVyYWwgY2F0ZWdvcnkgZm9yIGEgZ2l2ZW4gdmFsdWUuXG4gKiAtIFwiPXZhbHVlXCIgd2hlbiB0aGUgY2FzZSBleGlzdHMsXG4gKiAtIHRoZSBwbHVyYWwgY2F0ZWdvcnkgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQbHVyYWxDYXRlZ29yeShcbiAgICB2YWx1ZTogbnVtYmVyLCBjYXNlczogc3RyaW5nW10sIG5nTG9jYWxpemF0aW9uOiBOZ0xvY2FsaXphdGlvbiwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGtleSA9IGA9JHt2YWx1ZX1gO1xuXG4gIGlmIChjYXNlcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBrZXkgPSBuZ0xvY2FsaXphdGlvbi5nZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZSwgbG9jYWxlKTtcblxuICBpZiAoY2FzZXMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAgaWYgKGNhc2VzLmluZGV4T2YoJ290aGVyJykgPiAtMSkge1xuICAgIHJldHVybiAnb3RoZXInO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBObyBwbHVyYWwgbWVzc2FnZSBmb3VuZCBmb3IgdmFsdWUgXCIke3ZhbHVlfVwiYCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhc2UgYmFzZWQgb24gdGhlIGxvY2FsZVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nTG9jYWxlTG9jYWxpemF0aW9uIGV4dGVuZHMgTmdMb2NhbGl6YXRpb24ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJvdGVjdGVkIGxvY2FsZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnksIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcGx1cmFsID0gZ2V0TG9jYWxlUGx1cmFsQ2FzZShsb2NhbGUgfHwgdGhpcy5sb2NhbGUpKHZhbHVlKTtcblxuICAgIHN3aXRjaCAocGx1cmFsKSB7XG4gICAgICBjYXNlIFBsdXJhbC5aZXJvOlxuICAgICAgICByZXR1cm4gJ3plcm8nO1xuICAgICAgY2FzZSBQbHVyYWwuT25lOlxuICAgICAgICByZXR1cm4gJ29uZSc7XG4gICAgICBjYXNlIFBsdXJhbC5Ud286XG4gICAgICAgIHJldHVybiAndHdvJztcbiAgICAgIGNhc2UgUGx1cmFsLkZldzpcbiAgICAgICAgcmV0dXJuICdmZXcnO1xuICAgICAgY2FzZSBQbHVyYWwuTWFueTpcbiAgICAgICAgcmV0dXJuICdtYW55JztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnb3RoZXInO1xuICAgIH1cbiAgfVxufVxuIl19