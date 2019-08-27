/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable, Pipe } from '@angular/core';
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
export class I18nSelectPipe {
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
    { type: Injectable },
    { type: Pipe, args: [{ name: 'i18nSelect', pure: true },] },
];
/** @nocollapse */ I18nSelectPipe.ngInjectableDef = i0.ɵɵdefineInjectable({ token: I18nSelectPipe, factory: function I18nSelectPipe_Factory(t) { return new (t || I18nSelectPipe)(); }, providedIn: null });
/** @nocollapse */ I18nSelectPipe.ngFactoryDef = function I18nSelectPipe_Factory(t) { return new (t || I18nSelectPipe)(); };
/** @nocollapse */ I18nSelectPipe.ngPipeDef = i0.ɵɵdefinePipe({ name: "i18nSelect", type: I18nSelectPipe, pure: true });
/*@__PURE__*/ i0.ɵsetClassMetadata(I18nSelectPipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'i18nSelect', pure: true }]
    }], null, null);
/*@__PURE__*/ i0.ɵsetClassMetadata(I18nSelectPipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'i18nSelect', pure: true }]
    }], null, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9zZWxlY3RfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9zZWxlY3RfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCdkUsTUFBTSxPQUFPLGNBQWM7Ozs7Ozs7SUFNekIsU0FBUyxDQUFDLEtBQTRCLEVBQUUsT0FBZ0M7UUFDdEUsSUFBSSxLQUFLLElBQUksSUFBSTtZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRTdCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM1RCxNQUFNLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN6RDtRQUVELElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QjtRQUVELElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNuQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN6QjtRQUVELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQzs7O1lBeEJGLFVBQVU7WUFDVixJQUFJLFNBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7O2dFQUN6QixjQUFjLGlFQUFkLGNBQWM7b0ZBQWQsY0FBYzt1RUFBZCxjQUFjO21DQUFkLGNBQWM7Y0FGMUIsVUFBVTs7Y0FDVixJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7O21DQUN6QixjQUFjO2NBRjFCLFVBQVU7O2NBQ1YsSUFBSTtlQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBHZW5lcmljIHNlbGVjdG9yIHRoYXQgZGlzcGxheXMgdGhlIHN0cmluZyB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgdmFsdWUuXG4gKlxuICogSWYgbm9uZSBvZiB0aGUga2V5cyBvZiB0aGUgYG1hcHBpbmdgIG1hdGNoIHRoZSBgdmFsdWVgLCB0aGVuIHRoZSBjb250ZW50XG4gKiBvZiB0aGUgYG90aGVyYCBrZXkgaXMgcmV0dXJuZWQgd2hlbiBwcmVzZW50LCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2kxOG5fcGlwZS50cyByZWdpb249J0kxOG5TZWxlY3RQaXBlQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbkBQaXBlKHtuYW1lOiAnaTE4blNlbGVjdCcsIHB1cmU6IHRydWV9KVxuZXhwb3J0IGNsYXNzIEkxOG5TZWxlY3RQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgYSBzdHJpbmcgdG8gYmUgaW50ZXJuYXRpb25hbGl6ZWQuXG4gICAqIEBwYXJhbSBtYXBwaW5nIGFuIG9iamVjdCB0aGF0IGluZGljYXRlcyB0aGUgdGV4dCB0aGF0IHNob3VsZCBiZSBkaXNwbGF5ZWRcbiAgICogZm9yIGRpZmZlcmVudCB2YWx1ZXMgb2YgdGhlIHByb3ZpZGVkIGB2YWx1ZWAuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZ3xudWxsfHVuZGVmaW5lZCwgbWFwcGluZzoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiBzdHJpbmcge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgICBpZiAodHlwZW9mIG1hcHBpbmcgIT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihJMThuU2VsZWN0UGlwZSwgbWFwcGluZyk7XG4gICAgfVxuXG4gICAgaWYgKG1hcHBpbmcuaGFzT3duUHJvcGVydHkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gbWFwcGluZ1t2YWx1ZV07XG4gICAgfVxuXG4gICAgaWYgKG1hcHBpbmcuaGFzT3duUHJvcGVydHkoJ290aGVyJykpIHtcbiAgICAgIHJldHVybiBtYXBwaW5nWydvdGhlciddO1xuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxufVxuIl19