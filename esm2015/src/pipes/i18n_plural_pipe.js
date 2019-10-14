/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Pipe } from '@angular/core';
import { NgLocalization, getPluralCategory } from '../i18n/localization';
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
export class I18nPluralPipe {
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
/*@__PURE__*/ i0.ɵsetClassMetadata(I18nPluralPipe, [{
        type: Pipe,
        args: [{ name: 'i18nPlural', pure: true }]
    }], function () { return [{ type: i1.NgLocalization }]; }, null);
if (false) {
    /**
     * @type {?}
     * @private
     */
    I18nPluralPipe.prototype._localization;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDbEQsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDOzs7Ozs7Ozs7OztNQUVqRSxxQkFBcUIsR0FBVyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7QUFpQjFDLE1BQU0sT0FBTyxjQUFjOzs7O0lBQ3pCLFlBQW9CLGFBQTZCO1FBQTdCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtJQUFHLENBQUM7Ozs7Ozs7OztJQVNyRCxTQUFTLENBQUMsS0FBYSxFQUFFLFNBQW9DLEVBQUUsTUFBZTtRQUM1RSxJQUFJLEtBQUssSUFBSSxJQUFJO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFN0IsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtZQUN2RCxNQUFNLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUMzRDs7Y0FFSyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUM7UUFFeEYsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7OztZQXJCRixJQUFJLFNBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7Ozs7WUFuQjlCLGNBQWM7OzRFQW9CVCxjQUFjO21FQUFkLGNBQWM7bUNBQWQsY0FBYztjQUQxQixJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7Ozs7Ozs7SUFFeEIsdUNBQXFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOZ0xvY2FsaXphdGlvbiwgZ2V0UGx1cmFsQ2F0ZWdvcnl9IGZyb20gJy4uL2kxOG4vbG9jYWxpemF0aW9uJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmNvbnN0IF9JTlRFUlBPTEFUSU9OX1JFR0VYUDogUmVnRXhwID0gLyMvZztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBNYXBzIGEgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBwbHVyYWxpemVzIHRoZSB2YWx1ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2kxOG5fcGlwZS50cyByZWdpb249J0kxOG5QbHVyYWxQaXBlQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAnaTE4blBsdXJhbCcsIHB1cmU6IHRydWV9KVxuZXhwb3J0IGNsYXNzIEkxOG5QbHVyYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24pIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSB0aGUgbnVtYmVyIHRvIGJlIGZvcm1hdHRlZFxuICAgKiBAcGFyYW0gcGx1cmFsTWFwIGFuIG9iamVjdCB0aGF0IG1pbWljcyB0aGUgSUNVIGZvcm1hdCwgc2VlXG4gICAqIGh0dHA6Ly91c2VyZ3VpZGUuaWN1LXByb2plY3Qub3JnL2Zvcm1hdHBhcnNlL21lc3NhZ2VzLlxuICAgKiBAcGFyYW0gbG9jYWxlIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UgKHVzZXMgdGhlIGN1cnJlbnQge0BsaW5rIExPQ0FMRV9JRH0gYnlcbiAgICogZGVmYXVsdCkuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IG51bWJlciwgcGx1cmFsTWFwOiB7W2NvdW50OiBzdHJpbmddOiBzdHJpbmd9LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgICBpZiAodHlwZW9mIHBsdXJhbE1hcCAhPT0gJ29iamVjdCcgfHwgcGx1cmFsTWFwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoSTE4blBsdXJhbFBpcGUsIHBsdXJhbE1hcCk7XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIE9iamVjdC5rZXlzKHBsdXJhbE1hcCksIHRoaXMuX2xvY2FsaXphdGlvbiwgbG9jYWxlKTtcblxuICAgIHJldHVybiBwbHVyYWxNYXBba2V5XS5yZXBsYWNlKF9JTlRFUlBPTEFUSU9OX1JFR0VYUCwgdmFsdWUudG9TdHJpbmcoKSk7XG4gIH1cbn1cbiJdfQ==