/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Pipe } from '@angular/core';
import { NgLocalization, getPluralCategory } from '../i18n/localization';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
import * as i1 from "../i18n/localization";
var _INTERPOLATION_REGEXP = /#/g;
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
var I18nPluralPipe = /** @class */ (function () {
    function I18nPluralPipe(_localization) {
        this._localization = _localization;
    }
    /**
     * @param value the number to be formatted
     * @param pluralMap an object that mimics the ICU format, see
     * http://userguide.icu-project.org/formatparse/messages.
     * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
     * default).
     */
    I18nPluralPipe.prototype.transform = function (value, pluralMap, locale) {
        if (value == null)
            return '';
        if (typeof pluralMap !== 'object' || pluralMap === null) {
            throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
        }
        var key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
        return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
    };
    I18nPluralPipe.ngInjectableDef = i0.ɵɵdefineInjectable({ token: I18nPluralPipe, factory: function I18nPluralPipe_Factory(t) { return new (t || I18nPluralPipe)(i0.ɵɵinject(i1.NgLocalization)); }, providedIn: null });
    I18nPluralPipe.ngPipeDef = i0.ɵɵdefinePipe({ name: "i18nPlural", type: I18nPluralPipe, factory: function I18nPluralPipe_Factory(t) { return new (t || I18nPluralPipe)(i0.ɵɵdirectiveInject(i1.NgLocalization)); }, pure: true });
    return I18nPluralPipe;
}());
export { I18nPluralPipe };
/*@__PURE__*/ i0.ɵsetClassMetadata(I18nPluralPipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'i18nPlural', pure: true }]
    }], function () { return [{ type: i1.NgLocalization }]; }, null);
/*@__PURE__*/ i0.ɵsetClassMetadata(I18nPluralPipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'i18nPlural', pure: true }]
    }], function () { return [{ type: i1.NgLocalization }]; }, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFhLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDekUsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDOzs7QUFFdkUsSUFBTSxxQkFBcUIsR0FBVyxJQUFJLENBQUM7QUFFM0M7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNIO0lBR0Usd0JBQW9CLGFBQTZCO1FBQTdCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtJQUFHLENBQUM7SUFFckQ7Ozs7OztPQU1HO0lBQ0gsa0NBQVMsR0FBVCxVQUFVLEtBQWEsRUFBRSxTQUFvQyxFQUFFLE1BQWU7UUFDNUUsSUFBSSxLQUFLLElBQUksSUFBSTtZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRTdCLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDdkQsTUFBTSx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDM0Q7UUFFRCxJQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXpGLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN6RSxDQUFDO29FQXBCVSxjQUFjLGlFQUFkLGNBQWM7MkVBQWQsY0FBYyxpRUFBZCxjQUFjO3lCQTlCM0I7Q0FtREMsQUF2QkQsSUF1QkM7U0FyQlksY0FBYzttQ0FBZCxjQUFjO2NBRjFCLFVBQVU7O2NBQ1YsSUFBSTtlQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDOzttQ0FDekIsY0FBYztjQUYxQixVQUFVOztjQUNWLElBQUk7ZUFBQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBMT0NBTEVfSUQsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOZ0xvY2FsaXphdGlvbiwgZ2V0UGx1cmFsQ2F0ZWdvcnl9IGZyb20gJy4uL2kxOG4vbG9jYWxpemF0aW9uJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmNvbnN0IF9JTlRFUlBPTEFUSU9OX1JFR0VYUDogUmVnRXhwID0gLyMvZztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBNYXBzIGEgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBwbHVyYWxpemVzIHRoZSB2YWx1ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2kxOG5fcGlwZS50cyByZWdpb249J0kxOG5QbHVyYWxQaXBlQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbkBQaXBlKHtuYW1lOiAnaTE4blBsdXJhbCcsIHB1cmU6IHRydWV9KVxuZXhwb3J0IGNsYXNzIEkxOG5QbHVyYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xvY2FsaXphdGlvbjogTmdMb2NhbGl6YXRpb24pIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSB0aGUgbnVtYmVyIHRvIGJlIGZvcm1hdHRlZFxuICAgKiBAcGFyYW0gcGx1cmFsTWFwIGFuIG9iamVjdCB0aGF0IG1pbWljcyB0aGUgSUNVIGZvcm1hdCwgc2VlXG4gICAqIGh0dHA6Ly91c2VyZ3VpZGUuaWN1LXByb2plY3Qub3JnL2Zvcm1hdHBhcnNlL21lc3NhZ2VzLlxuICAgKiBAcGFyYW0gbG9jYWxlIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UgKHVzZXMgdGhlIGN1cnJlbnQge0BsaW5rIExPQ0FMRV9JRH0gYnlcbiAgICogZGVmYXVsdCkuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IG51bWJlciwgcGx1cmFsTWFwOiB7W2NvdW50OiBzdHJpbmddOiBzdHJpbmd9LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgICBpZiAodHlwZW9mIHBsdXJhbE1hcCAhPT0gJ29iamVjdCcgfHwgcGx1cmFsTWFwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoSTE4blBsdXJhbFBpcGUsIHBsdXJhbE1hcCk7XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIE9iamVjdC5rZXlzKHBsdXJhbE1hcCksIHRoaXMuX2xvY2FsaXphdGlvbiwgbG9jYWxlKTtcblxuICAgIHJldHVybiBwbHVyYWxNYXBba2V5XS5yZXBsYWNlKF9JTlRFUlBPTEFUSU9OX1JFR0VYUCwgdmFsdWUudG9TdHJpbmcoKSk7XG4gIH1cbn1cbiJdfQ==