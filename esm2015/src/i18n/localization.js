/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { getLocalePluralCase, Plural } from './locale_data_api';
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
    NgLocaleLocalization.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    NgLocaleLocalization.ctorParameters = () => [
        { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
    ];
    return NgLocaleLocalization;
})();
export { NgLocaleLocalization };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRzlEOztHQUVHO0FBQ0gsTUFBTSxPQUFnQixjQUFjO0NBRW5DO0FBR0Q7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsS0FBYSxFQUFFLEtBQWUsRUFBRSxjQUE4QixFQUFFLE1BQWU7SUFDakYsSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUV0QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELEdBQUcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXRELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMzQixPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQy9CLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNIO0lBQUEsTUFDYSxvQkFBcUIsU0FBUSxjQUFjO1FBQ3RELFlBQXlDLE1BQWM7WUFDckQsS0FBSyxFQUFFLENBQUM7WUFEK0IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUV2RCxDQUFDO1FBRUQsaUJBQWlCLENBQUMsS0FBVSxFQUFFLE1BQWU7WUFDM0MsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqRSxRQUFRLE1BQU0sRUFBRTtnQkFDZCxLQUFLLE1BQU0sQ0FBQyxJQUFJO29CQUNkLE9BQU8sTUFBTSxDQUFDO2dCQUNoQixLQUFLLE1BQU0sQ0FBQyxHQUFHO29CQUNiLE9BQU8sS0FBSyxDQUFDO2dCQUNmLEtBQUssTUFBTSxDQUFDLEdBQUc7b0JBQ2IsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsS0FBSyxNQUFNLENBQUMsR0FBRztvQkFDYixPQUFPLEtBQUssQ0FBQztnQkFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJO29CQUNkLE9BQU8sTUFBTSxDQUFDO2dCQUNoQjtvQkFDRSxPQUFPLE9BQU8sQ0FBQzthQUNsQjtRQUNILENBQUM7OztnQkF2QkYsVUFBVTs7Ozs2Q0FFSSxNQUFNLFNBQUMsU0FBUzs7SUFzQi9CLDJCQUFDO0tBQUE7U0F2Qlksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBMT0NBTEVfSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2dldExvY2FsZVBsdXJhbENhc2UsIFBsdXJhbH0gZnJvbSAnLi9sb2NhbGVfZGF0YV9hcGknO1xuXG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdMb2NhbGl6YXRpb24ge1xuICBhYnN0cmFjdCBnZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZTogYW55LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwbHVyYWwgY2F0ZWdvcnkgZm9yIGEgZ2l2ZW4gdmFsdWUuXG4gKiAtIFwiPXZhbHVlXCIgd2hlbiB0aGUgY2FzZSBleGlzdHMsXG4gKiAtIHRoZSBwbHVyYWwgY2F0ZWdvcnkgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQbHVyYWxDYXRlZ29yeShcbiAgICB2YWx1ZTogbnVtYmVyLCBjYXNlczogc3RyaW5nW10sIG5nTG9jYWxpemF0aW9uOiBOZ0xvY2FsaXphdGlvbiwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGtleSA9IGA9JHt2YWx1ZX1gO1xuXG4gIGlmIChjYXNlcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBrZXkgPSBuZ0xvY2FsaXphdGlvbi5nZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZSwgbG9jYWxlKTtcblxuICBpZiAoY2FzZXMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAgaWYgKGNhc2VzLmluZGV4T2YoJ290aGVyJykgPiAtMSkge1xuICAgIHJldHVybiAnb3RoZXInO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBObyBwbHVyYWwgbWVzc2FnZSBmb3VuZCBmb3IgdmFsdWUgXCIke3ZhbHVlfVwiYCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhc2UgYmFzZWQgb24gdGhlIGxvY2FsZVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nTG9jYWxlTG9jYWxpemF0aW9uIGV4dGVuZHMgTmdMb2NhbGl6YXRpb24ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJvdGVjdGVkIGxvY2FsZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnksIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcGx1cmFsID0gZ2V0TG9jYWxlUGx1cmFsQ2FzZShsb2NhbGUgfHwgdGhpcy5sb2NhbGUpKHZhbHVlKTtcblxuICAgIHN3aXRjaCAocGx1cmFsKSB7XG4gICAgICBjYXNlIFBsdXJhbC5aZXJvOlxuICAgICAgICByZXR1cm4gJ3plcm8nO1xuICAgICAgY2FzZSBQbHVyYWwuT25lOlxuICAgICAgICByZXR1cm4gJ29uZSc7XG4gICAgICBjYXNlIFBsdXJhbC5Ud286XG4gICAgICAgIHJldHVybiAndHdvJztcbiAgICAgIGNhc2UgUGx1cmFsLkZldzpcbiAgICAgICAgcmV0dXJuICdmZXcnO1xuICAgICAgY2FzZSBQbHVyYWwuTWFueTpcbiAgICAgICAgcmV0dXJuICdtYW55JztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnb3RoZXInO1xuICAgIH1cbiAgfVxufVxuIl19