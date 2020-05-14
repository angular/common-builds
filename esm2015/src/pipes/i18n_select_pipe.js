/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/pipes/i18n_select_pipe.ts
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
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Generic selector that displays the string that matches the current value.
 *
 * If none of the keys of the `mapping` match the `value`, then the content
 * of the `other` key is returned when present, otherwise an empty string is returned.
 *
 * \@usageNotes
 *
 * ### Example
 *
 * {\@example common/pipes/ts/i18n_pipe.ts region='I18nSelectPipeComponent'}
 *
 * \@publicApi
 */
let I18nSelectPipe = /** @class */ (() => {
    /**
     * \@ngModule CommonModule
     * \@description
     *
     * Generic selector that displays the string that matches the current value.
     *
     * If none of the keys of the `mapping` match the `value`, then the content
     * of the `other` key is returned when present, otherwise an empty string is returned.
     *
     * \@usageNotes
     *
     * ### Example
     *
     * {\@example common/pipes/ts/i18n_pipe.ts region='I18nSelectPipeComponent'}
     *
     * \@publicApi
     */
    class I18nSelectPipe {
        /**
         * @param {?} value a string to be internationalized.
         * @param {?} mapping an object that indicates the text that should be displayed
         * for different values of the provided `value`.
         * @return {?}
         */
        transform(value, mapping) {
            if (value == null)
                return '';
            if (typeof mapping !== 'object' || typeof value !== 'string') {
                throw invalidPipeArgumentError(I18nSelectPipe, mapping);
            }
            if (mapping.hasOwnProperty(value)) {
                return mapping[value];
            }
            if (mapping.hasOwnProperty('other')) {
                return mapping['other'];
            }
            return '';
        }
    }
    I18nSelectPipe.decorators = [
        { type: Pipe, args: [{ name: 'i18nSelect', pure: true },] }
    ];
    return I18nSelectPipe;
})();
export { I18nSelectPipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9zZWxlY3RfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9zZWxlY3RfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJ2RTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsTUFDYSxjQUFjOzs7Ozs7O1FBTXpCLFNBQVMsQ0FBQyxLQUE0QixFQUFFLE9BQWdDO1lBQ3RFLElBQUksS0FBSyxJQUFJLElBQUk7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFFN0IsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUM1RCxNQUFNLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUN6RDtZQUVELElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkI7WUFFRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pCO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDOzs7Z0JBdkJGLElBQUksU0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQzs7SUF3QnRDLHFCQUFDO0tBQUE7U0F2QlksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogR2VuZXJpYyBzZWxlY3RvciB0aGF0IGRpc3BsYXlzIHRoZSBzdHJpbmcgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHZhbHVlLlxuICpcbiAqIElmIG5vbmUgb2YgdGhlIGtleXMgb2YgdGhlIGBtYXBwaW5nYCBtYXRjaCB0aGUgYHZhbHVlYCwgdGhlbiB0aGUgY29udGVudFxuICogb2YgdGhlIGBvdGhlcmAga2V5IGlzIHJldHVybmVkIHdoZW4gcHJlc2VudCwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9pMThuX3BpcGUudHMgcmVnaW9uPSdJMThuU2VsZWN0UGlwZUNvbXBvbmVudCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2kxOG5TZWxlY3QnLCBwdXJlOiB0cnVlfSlcbmV4cG9ydCBjbGFzcyBJMThuU2VsZWN0UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAvKipcbiAgICogQHBhcmFtIHZhbHVlIGEgc3RyaW5nIHRvIGJlIGludGVybmF0aW9uYWxpemVkLlxuICAgKiBAcGFyYW0gbWFwcGluZyBhbiBvYmplY3QgdGhhdCBpbmRpY2F0ZXMgdGhlIHRleHQgdGhhdCBzaG91bGQgYmUgZGlzcGxheWVkXG4gICAqIGZvciBkaWZmZXJlbnQgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBgdmFsdWVgLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmd8bnVsbHx1bmRlZmluZWQsIG1hcHBpbmc6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogc3RyaW5nIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICcnO1xuXG4gICAgaWYgKHR5cGVvZiBtYXBwaW5nICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoSTE4blNlbGVjdFBpcGUsIG1hcHBpbmcpO1xuICAgIH1cblxuICAgIGlmIChtYXBwaW5nLmhhc093blByb3BlcnR5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIG1hcHBpbmdbdmFsdWVdO1xuICAgIH1cblxuICAgIGlmIChtYXBwaW5nLmhhc093blByb3BlcnR5KCdvdGhlcicpKSB7XG4gICAgICByZXR1cm4gbWFwcGluZ1snb3RoZXInXTtcbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbiJdfQ==