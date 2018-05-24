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
 * @ngModule CommonModule
 * @description
 *
 * Generic selector that displays the string that matches the current value.
 *
 * If none of the keys of the `mapping` match the `value`, then the content
 * of the `other` key is returned when present, otherwise an empty string is returned.
 *
 * ## Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nSelectPipeComponent'}
 *
 * @experimental
 */
var I18nSelectPipe = /** @class */ (function () {
    function I18nSelectPipe() {
    }
    /**
     * @param value a string to be internationalized.
     * @param mapping an object that indicates the text that should be displayed
     * for different values of the provided `value`.
     */
    /**
       * @param value a string to be internationalized.
       * @param mapping an object that indicates the text that should be displayed
       * for different values of the provided `value`.
       */
    I18nSelectPipe.prototype.transform = /**
       * @param value a string to be internationalized.
       * @param mapping an object that indicates the text that should be displayed
       * for different values of the provided `value`.
       */
    function (value, mapping) {
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
    };
    I18nSelectPipe.decorators = [
        { type: Pipe, args: [{ name: 'i18nSelect', pure: true },] }
    ];
    return I18nSelectPipe;
}());
export { I18nSelectPipe };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9zZWxlY3RfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9zZWxlY3RfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBUUEsT0FBTyxFQUFDLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDbEQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtQnJFOzs7O09BSUc7Ozs7OztJQUNILGtDQUFTOzs7OztJQUFULFVBQVUsS0FBNEIsRUFBRSxPQUFnQztRQUN0RSxJQUFJLEtBQUssSUFBSSxJQUFJO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFN0IsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzVELE1BQU0sd0JBQXdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsT0FBTyxFQUFFLENBQUM7S0FDWDs7Z0JBdkJGLElBQUksU0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQzs7eUJBMUJ0Qzs7U0EyQmEsY0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogR2VuZXJpYyBzZWxlY3RvciB0aGF0IGRpc3BsYXlzIHRoZSBzdHJpbmcgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHZhbHVlLlxuICpcbiAqIElmIG5vbmUgb2YgdGhlIGtleXMgb2YgdGhlIGBtYXBwaW5nYCBtYXRjaCB0aGUgYHZhbHVlYCwgdGhlbiB0aGUgY29udGVudFxuICogb2YgdGhlIGBvdGhlcmAga2V5IGlzIHJldHVybmVkIHdoZW4gcHJlc2VudCwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZC5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9pMThuX3BpcGUudHMgcmVnaW9uPSdJMThuU2VsZWN0UGlwZUNvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5AUGlwZSh7bmFtZTogJ2kxOG5TZWxlY3QnLCBwdXJlOiB0cnVlfSlcbmV4cG9ydCBjbGFzcyBJMThuU2VsZWN0UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAvKipcbiAgICogQHBhcmFtIHZhbHVlIGEgc3RyaW5nIHRvIGJlIGludGVybmF0aW9uYWxpemVkLlxuICAgKiBAcGFyYW0gbWFwcGluZyBhbiBvYmplY3QgdGhhdCBpbmRpY2F0ZXMgdGhlIHRleHQgdGhhdCBzaG91bGQgYmUgZGlzcGxheWVkXG4gICAqIGZvciBkaWZmZXJlbnQgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBgdmFsdWVgLlxuICAgKi9cbiAgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmd8bnVsbHx1bmRlZmluZWQsIG1hcHBpbmc6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogc3RyaW5nIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICcnO1xuXG4gICAgaWYgKHR5cGVvZiBtYXBwaW5nICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoSTE4blNlbGVjdFBpcGUsIG1hcHBpbmcpO1xuICAgIH1cblxuICAgIGlmIChtYXBwaW5nLmhhc093blByb3BlcnR5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIG1hcHBpbmdbdmFsdWVdO1xuICAgIH1cblxuICAgIGlmIChtYXBwaW5nLmhhc093blByb3BlcnR5KCdvdGhlcicpKSB7XG4gICAgICByZXR1cm4gbWFwcGluZ1snb3RoZXInXTtcbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbiJdfQ==