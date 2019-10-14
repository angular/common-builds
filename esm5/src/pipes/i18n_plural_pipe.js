/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
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
    I18nPluralPipe.ɵfac = function I18nPluralPipe_Factory(t) { return new (t || I18nPluralPipe)(i0.ɵɵdirectiveInject(i1.NgLocalization)); };
    I18nPluralPipe.ɵpipe = i0.ɵɵdefinePipe({ name: "i18nPlural", type: I18nPluralPipe, pure: true });
    return I18nPluralPipe;
}());
export { I18nPluralPipe };
/*@__PURE__*/ i0.ɵsetClassMetadata(I18nPluralPipe, [{
        type: Pipe,
        args: [{ name: 'i18nPlural', pure: true }]
    }], function () { return [{ type: i1.NgLocalization }]; }, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7OztBQUV2RSxJQUFNLHFCQUFxQixHQUFXLElBQUksQ0FBQztBQUUzQzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0g7SUFFRSx3QkFBb0IsYUFBNkI7UUFBN0Isa0JBQWEsR0FBYixhQUFhLENBQWdCO0lBQUcsQ0FBQztJQUVyRDs7Ozs7O09BTUc7SUFDSCxrQ0FBUyxHQUFULFVBQVUsS0FBYSxFQUFFLFNBQW9DLEVBQUUsTUFBZTtRQUM1RSxJQUFJLEtBQUssSUFBSSxJQUFJO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFN0IsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtZQUN2RCxNQUFNLHdCQUF3QixDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUMzRDtRQUVELElBQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFekYsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7Z0ZBcEJVLGNBQWM7dUVBQWQsY0FBYzt5QkE3QjNCO0NBa0RDLEFBdEJELElBc0JDO1NBckJZLGNBQWM7bUNBQWQsY0FBYztjQUQxQixJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge05nTG9jYWxpemF0aW9uLCBnZXRQbHVyYWxDYXRlZ29yeX0gZnJvbSAnLi4vaTE4bi9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuY29uc3QgX0lOVEVSUE9MQVRJT05fUkVHRVhQOiBSZWdFeHAgPSAvIy9nO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIE1hcHMgYSB2YWx1ZSB0byBhIHN0cmluZyB0aGF0IHBsdXJhbGl6ZXMgdGhlIHZhbHVlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvaTE4bl9waXBlLnRzIHJlZ2lvbj0nSTE4blBsdXJhbFBpcGVDb21wb25lbnQnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe25hbWU6ICdpMThuUGx1cmFsJywgcHVyZTogdHJ1ZX0pXG5leHBvcnQgY2xhc3MgSTE4blBsdXJhbFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbG9jYWxpemF0aW9uOiBOZ0xvY2FsaXphdGlvbikge31cblxuICAvKipcbiAgICogQHBhcmFtIHZhbHVlIHRoZSBudW1iZXIgdG8gYmUgZm9ybWF0dGVkXG4gICAqIEBwYXJhbSBwbHVyYWxNYXAgYW4gb2JqZWN0IHRoYXQgbWltaWNzIHRoZSBJQ1UgZm9ybWF0LCBzZWVcbiAgICogaHR0cDovL3VzZXJndWlkZS5pY3UtcHJvamVjdC5vcmcvZm9ybWF0cGFyc2UvbWVzc2FnZXMuXG4gICAqIEBwYXJhbSBsb2NhbGUgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZSAodXNlcyB0aGUgY3VycmVudCB7QGxpbmsgTE9DQUxFX0lEfSBieVxuICAgKiBkZWZhdWx0KS5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVtYmVyLCBwbHVyYWxNYXA6IHtbY291bnQ6IHN0cmluZ106IHN0cmluZ30sIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiAnJztcblxuICAgIGlmICh0eXBlb2YgcGx1cmFsTWFwICE9PSAnb2JqZWN0JyB8fCBwbHVyYWxNYXAgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihJMThuUGx1cmFsUGlwZSwgcGx1cmFsTWFwKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBnZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZSwgT2JqZWN0LmtleXMocGx1cmFsTWFwKSwgdGhpcy5fbG9jYWxpemF0aW9uLCBsb2NhbGUpO1xuXG4gICAgcmV0dXJuIHBsdXJhbE1hcFtrZXldLnJlcGxhY2UoX0lOVEVSUE9MQVRJT05fUkVHRVhQLCB2YWx1ZS50b1N0cmluZygpKTtcbiAgfVxufVxuIl19