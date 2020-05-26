/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Pipe } from '@angular/core';
import { getPluralCategory, NgLocalization } from '../i18n/localization';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
const _INTERPOLATION_REGEXP = /#/g;
/**
 * @ngModule CommonModule
 * @description
 *
 * Maps a value to a string that pluralizes the value according to locale rules.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
 *
 * @publicApi
 */
let I18nPluralPipe = /** @class */ (() => {
    var I18nPluralPipe_1;
    let I18nPluralPipe = I18nPluralPipe_1 = class I18nPluralPipe {
        constructor(_localization) {
            this._localization = _localization;
        }
        /**
         * @param value the number to be formatted
         * @param pluralMap an object that mimics the ICU format, see
         * http://userguide.icu-project.org/formatparse/messages.
         * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
         * default).
         */
        transform(value, pluralMap, locale) {
            if (value == null)
                return '';
            if (typeof pluralMap !== 'object' || pluralMap === null) {
                throw invalidPipeArgumentError(I18nPluralPipe_1, pluralMap);
            }
            const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
            return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
        }
    };
    I18nPluralPipe = I18nPluralPipe_1 = __decorate([
        Pipe({ name: 'i18nPlural', pure: true }),
        __metadata("design:paramtypes", [NgLocalization])
    ], I18nPluralPipe);
    return I18nPluralPipe;
})();
export { I18nPluralPipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFFbEQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGNBQWMsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXZFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBRXZFLE1BQU0scUJBQXFCLEdBQVcsSUFBSSxDQUFDO0FBRTNDOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSDs7SUFBQSxJQUFhLGNBQWMsc0JBQTNCLE1BQWEsY0FBYztRQUN6QixZQUFvQixhQUE2QjtZQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFBRyxDQUFDO1FBRXJEOzs7Ozs7V0FNRztRQUNILFNBQVMsQ0FBQyxLQUFhLEVBQUUsU0FBb0MsRUFBRSxNQUFlO1lBQzVFLElBQUksS0FBSyxJQUFJLElBQUk7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFFN0IsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtnQkFDdkQsTUFBTSx3QkFBd0IsQ0FBQyxnQkFBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV6RixPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDekUsQ0FBQztLQUNGLENBQUE7SUFyQlksY0FBYztRQUQxQixJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQzt5Q0FFRixjQUFjO09BRHRDLGNBQWMsQ0FxQjFCO0lBQUQscUJBQUM7S0FBQTtTQXJCWSxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Z2V0UGx1cmFsQ2F0ZWdvcnksIE5nTG9jYWxpemF0aW9ufSBmcm9tICcuLi9pMThuL2xvY2FsaXphdGlvbic7XG5cbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmNvbnN0IF9JTlRFUlBPTEFUSU9OX1JFR0VYUDogUmVnRXhwID0gLyMvZztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBNYXBzIGEgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBwbHVyYWxpemVzIHRoZSB2YWx1ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2kxOG5fcGlwZS50cyByZWdpb249J0kxOG5QbHVyYWxQaXBlQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAnaTE4blBsdXJhbCcsIHB1cmU6IHRydWV9KVxuZXhwb3J0IGNsYXNzIEkxOG5QbHVyYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24pIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSB0aGUgbnVtYmVyIHRvIGJlIGZvcm1hdHRlZFxuICAgKiBAcGFyYW0gcGx1cmFsTWFwIGFuIG9iamVjdCB0aGF0IG1pbWljcyB0aGUgSUNVIGZvcm1hdCwgc2VlXG4gICAqIGh0dHA6Ly91c2VyZ3VpZGUuaWN1LXByb2plY3Qub3JnL2Zvcm1hdHBhcnNlL21lc3NhZ2VzLlxuICAgKiBAcGFyYW0gbG9jYWxlIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UgKHVzZXMgdGhlIGN1cnJlbnQge0BsaW5rIExPQ0FMRV9JRH0gYnlcbiAgICogZGVmYXVsdCkuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IG51bWJlciwgcGx1cmFsTWFwOiB7W2NvdW50OiBzdHJpbmddOiBzdHJpbmd9LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgICBpZiAodHlwZW9mIHBsdXJhbE1hcCAhPT0gJ29iamVjdCcgfHwgcGx1cmFsTWFwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoSTE4blBsdXJhbFBpcGUsIHBsdXJhbE1hcCk7XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIE9iamVjdC5rZXlzKHBsdXJhbE1hcCksIHRoaXMuX2xvY2FsaXphdGlvbiwgbG9jYWxlKTtcblxuICAgIHJldHVybiBwbHVyYWxNYXBba2V5XS5yZXBsYWNlKF9JTlRFUlBPTEFUSU9OX1JFR0VYUCwgdmFsdWUudG9TdHJpbmcoKSk7XG4gIH1cbn1cbiJdfQ==