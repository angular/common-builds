/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/pipes/i18n_select_pipe.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Pipe } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
        { type: Pipe, args: [{ name: 'i18nSelect', pure: true },] },
    ];
    /** @nocollapse */ I18nSelectPipe.ɵfac = function I18nSelectPipe_Factory(t) { return new (t || I18nSelectPipe)(); };
    /** @nocollapse */ I18nSelectPipe.ɵpipe = i0.ɵɵdefinePipe({ name: "i18nSelect", type: I18nSelectPipe, pure: true });
    return I18nSelectPipe;
})();
export { I18nSelectPipe };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(I18nSelectPipe, [{
        type: Pipe,
        args: [{ name: 'i18nSelect', pure: true }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9zZWxlY3RfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9zZWxlY3RfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQVFBLE9BQU8sRUFBQyxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBQ2xELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CdkU7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLE1BQ2EsY0FBYzs7Ozs7OztRQU16QixTQUFTLENBQUMsS0FBNEIsRUFBRSxPQUFnQztZQUN0RSxJQUFJLEtBQUssSUFBSSxJQUFJO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBRTdCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDNUQsTUFBTSx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDekQ7WUFFRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN6QjtZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQzs7O2dCQXZCRixJQUFJLFNBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7O21HQUN6QixjQUFjOzBGQUFkLGNBQWM7eUJBN0IzQjtLQW9EQztTQXZCWSxjQUFjO2tEQUFkLGNBQWM7Y0FEMUIsSUFBSTtlQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBHZW5lcmljIHNlbGVjdG9yIHRoYXQgZGlzcGxheXMgdGhlIHN0cmluZyB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgdmFsdWUuXG4gKlxuICogSWYgbm9uZSBvZiB0aGUga2V5cyBvZiB0aGUgYG1hcHBpbmdgIG1hdGNoIHRoZSBgdmFsdWVgLCB0aGVuIHRoZSBjb250ZW50XG4gKiBvZiB0aGUgYG90aGVyYCBrZXkgaXMgcmV0dXJuZWQgd2hlbiBwcmVzZW50LCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2kxOG5fcGlwZS50cyByZWdpb249J0kxOG5TZWxlY3RQaXBlQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAnaTE4blNlbGVjdCcsIHB1cmU6IHRydWV9KVxuZXhwb3J0IGNsYXNzIEkxOG5TZWxlY3RQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgYSBzdHJpbmcgdG8gYmUgaW50ZXJuYXRpb25hbGl6ZWQuXG4gICAqIEBwYXJhbSBtYXBwaW5nIGFuIG9iamVjdCB0aGF0IGluZGljYXRlcyB0aGUgdGV4dCB0aGF0IHNob3VsZCBiZSBkaXNwbGF5ZWRcbiAgICogZm9yIGRpZmZlcmVudCB2YWx1ZXMgb2YgdGhlIHByb3ZpZGVkIGB2YWx1ZWAuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZ3xudWxsfHVuZGVmaW5lZCwgbWFwcGluZzoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiBzdHJpbmcge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgICBpZiAodHlwZW9mIG1hcHBpbmcgIT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihJMThuU2VsZWN0UGlwZSwgbWFwcGluZyk7XG4gICAgfVxuXG4gICAgaWYgKG1hcHBpbmcuaGFzT3duUHJvcGVydHkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gbWFwcGluZ1t2YWx1ZV07XG4gICAgfVxuXG4gICAgaWYgKG1hcHBpbmcuaGFzT3duUHJvcGVydHkoJ290aGVyJykpIHtcbiAgICAgIHJldHVybiBtYXBwaW5nWydvdGhlciddO1xuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxufVxuIl19