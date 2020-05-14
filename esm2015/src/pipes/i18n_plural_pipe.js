/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/pipes/i18n_plural_pipe.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Pipe } from '@angular/core';
import { getPluralCategory, NgLocalization } from '../i18n/localization';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
import * as i1 from "../i18n/localization";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
        { type: Pipe, args: [{ name: 'i18nPlural', pure: true },] },
    ];
    /** @nocollapse */
    I18nPluralPipe.ctorParameters = () => [
        { type: NgLocalization }
    ];
    /** @nocollapse */ I18nPluralPipe.ɵfac = function I18nPluralPipe_Factory(t) { return new (t || I18nPluralPipe)(i0.ɵɵdirectiveInject(i1.NgLocalization)); };
    /** @nocollapse */ I18nPluralPipe.ɵpipe = i0.ɵɵdefinePipe({ name: "i18nPlural", type: I18nPluralPipe, pure: true });
    return I18nPluralPipe;
})();
export { I18nPluralPipe };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(I18nPluralPipe, [{
        type: Pipe,
        args: [{ name: 'i18nPlural', pure: true }]
    }], function () { return [{ type: i1.NgLocalization }]; }, null); })();
if (false) {
    /**
     * @type {?}
     * @private
     */
    I18nPluralPipe.prototype._localization;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQVFBLE9BQU8sRUFBQyxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRWxELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxjQUFjLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUV2RSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7Ozs7Ozs7Ozs7TUFFakUscUJBQXFCLEdBQVcsSUFBSTs7Ozs7Ozs7Ozs7Ozs7O0FBZ0IxQzs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsTUFDYSxjQUFjOzs7O1FBQ3pCLFlBQW9CLGFBQTZCO1lBQTdCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtRQUFHLENBQUM7Ozs7Ozs7OztRQVNyRCxTQUFTLENBQUMsS0FBYSxFQUFFLFNBQW9DLEVBQUUsTUFBZTtZQUM1RSxJQUFJLEtBQUssSUFBSSxJQUFJO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBRTdCLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZELE1BQU0sd0JBQXdCLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQzNEOztrQkFFSyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUM7WUFFeEYsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7OztnQkFyQkYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDOzs7O2dCQXBCWCxjQUFjOzttR0FxQjVCLGNBQWM7MEZBQWQsY0FBYzt5QkEvQjNCO0tBb0RDO1NBckJZLGNBQWM7a0RBQWQsY0FBYztjQUQxQixJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7Ozs7Ozs7SUFFeEIsdUNBQXFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2dldFBsdXJhbENhdGVnb3J5LCBOZ0xvY2FsaXphdGlvbn0gZnJvbSAnLi4vaTE4bi9sb2NhbGl6YXRpb24nO1xuXG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG5jb25zdCBfSU5URVJQT0xBVElPTl9SRUdFWFA6IFJlZ0V4cCA9IC8jL2c7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogTWFwcyBhIHZhbHVlIHRvIGEgc3RyaW5nIHRoYXQgcGx1cmFsaXplcyB0aGUgdmFsdWUgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9pMThuX3BpcGUudHMgcmVnaW9uPSdJMThuUGx1cmFsUGlwZUNvbXBvbmVudCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2kxOG5QbHVyYWwnLCBwdXJlOiB0cnVlfSlcbmV4cG9ydCBjbGFzcyBJMThuUGx1cmFsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIG51bWJlciB0byBiZSBmb3JtYXR0ZWRcbiAgICogQHBhcmFtIHBsdXJhbE1hcCBhbiBvYmplY3QgdGhhdCBtaW1pY3MgdGhlIElDVSBmb3JtYXQsIHNlZVxuICAgKiBodHRwOi8vdXNlcmd1aWRlLmljdS1wcm9qZWN0Lm9yZy9mb3JtYXRwYXJzZS9tZXNzYWdlcy5cbiAgICogQHBhcmFtIGxvY2FsZSBhIGBzdHJpbmdgIGRlZmluaW5nIHRoZSBsb2NhbGUgdG8gdXNlICh1c2VzIHRoZSBjdXJyZW50IHtAbGluayBMT0NBTEVfSUR9IGJ5XG4gICAqIGRlZmF1bHQpLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXIsIHBsdXJhbE1hcDoge1tjb3VudDogc3RyaW5nXTogc3RyaW5nfSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwbHVyYWxNYXAgIT09ICdvYmplY3QnIHx8IHBsdXJhbE1hcCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEkxOG5QbHVyYWxQaXBlLCBwbHVyYWxNYXApO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlLCBPYmplY3Qua2V5cyhwbHVyYWxNYXApLCB0aGlzLl9sb2NhbGl6YXRpb24sIGxvY2FsZSk7XG5cbiAgICByZXR1cm4gcGx1cmFsTWFwW2tleV0ucmVwbGFjZShfSU5URVJQT0xBVElPTl9SRUdFWFAsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICB9XG59XG4iXX0=