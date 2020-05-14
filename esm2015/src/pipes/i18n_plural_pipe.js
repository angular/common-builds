/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/pipes/i18n_plural_pipe.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
import { getPluralCategory, NgLocalization } from '../i18n/localization';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/** @type {?} */
const _INTERPOLATION_REGEXP = /#/g;
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Maps a value to a string that pluralizes the value according to locale rules.
 *
 * \@usageNotes
 *
 * ### Example
 *
 * {\@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
 *
 * \@publicApi
 */
let I18nPluralPipe = /** @class */ (() => {
    /**
     * \@ngModule CommonModule
     * \@description
     *
     * Maps a value to a string that pluralizes the value according to locale rules.
     *
     * \@usageNotes
     *
     * ### Example
     *
     * {\@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
     *
     * \@publicApi
     */
    class I18nPluralPipe {
        /**
         * @param {?} _localization
         */
        constructor(_localization) {
            this._localization = _localization;
        }
        /**
         * @param {?} value the number to be formatted
         * @param {?} pluralMap an object that mimics the ICU format, see
         * http://userguide.icu-project.org/formatparse/messages.
         * @param {?=} locale a `string` defining the locale to use (uses the current {\@link LOCALE_ID} by
         * default).
         * @return {?}
         */
        transform(value, pluralMap, locale) {
            if (value == null)
                return '';
            if (typeof pluralMap !== 'object' || pluralMap === null) {
                throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
            }
            /** @type {?} */
            const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
            return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
        }
    }
    I18nPluralPipe.decorators = [
        { type: Pipe, args: [{ name: 'i18nPlural', pure: true },] }
    ];
    /** @nocollapse */
    I18nPluralPipe.ctorParameters = () => [
        { type: NgLocalization }
    ];
    return I18nPluralPipe;
})();
export { I18nPluralPipe };
if (false) {
    /**
     * @type {?}
     * @private
     */
    I18nPluralPipe.prototype._localization;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUVsRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O01BRWpFLHFCQUFxQixHQUFXLElBQUk7Ozs7Ozs7Ozs7Ozs7OztBQWdCMUM7Ozs7Ozs7Ozs7Ozs7OztJQUFBLE1BQ2EsY0FBYzs7OztRQUN6QixZQUFvQixhQUE2QjtZQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFBRyxDQUFDOzs7Ozs7Ozs7UUFTckQsU0FBUyxDQUFDLEtBQWEsRUFBRSxTQUFvQyxFQUFFLE1BQWU7WUFDNUUsSUFBSSxLQUFLLElBQUksSUFBSTtnQkFBRSxPQUFPLEVBQUUsQ0FBQztZQUU3QixJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUN2RCxNQUFNLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUMzRDs7a0JBRUssR0FBRyxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDO1lBRXhGLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6RSxDQUFDOzs7Z0JBckJGLElBQUksU0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQzs7OztnQkFwQlgsY0FBYzs7SUEwQ3pDLHFCQUFDO0tBQUE7U0FyQlksY0FBYzs7Ozs7O0lBQ2IsdUNBQXFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2dldFBsdXJhbENhdGVnb3J5LCBOZ0xvY2FsaXphdGlvbn0gZnJvbSAnLi4vaTE4bi9sb2NhbGl6YXRpb24nO1xuXG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG5jb25zdCBfSU5URVJQT0xBVElPTl9SRUdFWFA6IFJlZ0V4cCA9IC8jL2c7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogTWFwcyBhIHZhbHVlIHRvIGEgc3RyaW5nIHRoYXQgcGx1cmFsaXplcyB0aGUgdmFsdWUgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9pMThuX3BpcGUudHMgcmVnaW9uPSdJMThuUGx1cmFsUGlwZUNvbXBvbmVudCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2kxOG5QbHVyYWwnLCBwdXJlOiB0cnVlfSlcbmV4cG9ydCBjbGFzcyBJMThuUGx1cmFsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIG51bWJlciB0byBiZSBmb3JtYXR0ZWRcbiAgICogQHBhcmFtIHBsdXJhbE1hcCBhbiBvYmplY3QgdGhhdCBtaW1pY3MgdGhlIElDVSBmb3JtYXQsIHNlZVxuICAgKiBodHRwOi8vdXNlcmd1aWRlLmljdS1wcm9qZWN0Lm9yZy9mb3JtYXRwYXJzZS9tZXNzYWdlcy5cbiAgICogQHBhcmFtIGxvY2FsZSBhIGBzdHJpbmdgIGRlZmluaW5nIHRoZSBsb2NhbGUgdG8gdXNlICh1c2VzIHRoZSBjdXJyZW50IHtAbGluayBMT0NBTEVfSUR9IGJ5XG4gICAqIGRlZmF1bHQpLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXIsIHBsdXJhbE1hcDoge1tjb3VudDogc3RyaW5nXTogc3RyaW5nfSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwbHVyYWxNYXAgIT09ICdvYmplY3QnIHx8IHBsdXJhbE1hcCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEkxOG5QbHVyYWxQaXBlLCBwbHVyYWxNYXApO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlLCBPYmplY3Qua2V5cyhwbHVyYWxNYXApLCB0aGlzLl9sb2NhbGl6YXRpb24sIGxvY2FsZSk7XG5cbiAgICByZXR1cm4gcGx1cmFsTWFwW2tleV0ucmVwbGFjZShfSU5URVJQT0xBVElPTl9SRUdFWFAsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICB9XG59XG4iXX0=