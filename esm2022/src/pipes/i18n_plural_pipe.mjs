/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
import { getPluralCategory, NgLocalization } from '../i18n/localization';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
import * as i1 from "../i18n/localization";
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
export class I18nPluralPipe {
    constructor(_localization) {
        this._localization = _localization;
    }
    /**
     * @param value the number to be formatted
     * @param pluralMap an object that mimics the ICU format, see
     * https://unicode-org.github.io/icu/userguide/format_parse/messages/.
     * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
     * default).
     */
    transform(value, pluralMap, locale) {
        if (value == null)
            return '';
        if (typeof pluralMap !== 'object' || pluralMap === null) {
            throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
        }
        const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
        return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: I18nPluralPipe, deps: [{ token: i1.NgLocalization }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: I18nPluralPipe, isStandalone: true, name: "i18nPlural" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: I18nPluralPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'i18nPlural',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.NgLocalization }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUVsRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7OztBQUV2RSxNQUFNLHFCQUFxQixHQUFXLElBQUksQ0FBQztBQUUzQzs7Ozs7Ozs7Ozs7OztHQWFHO0FBS0gsTUFBTSxPQUFPLGNBQWM7SUFDekIsWUFBb0IsYUFBNkI7UUFBN0Isa0JBQWEsR0FBYixhQUFhLENBQWdCO0lBQUcsQ0FBQztJQUVyRDs7Ozs7O09BTUc7SUFDSCxTQUFTLENBQ1AsS0FBZ0MsRUFDaEMsU0FBb0MsRUFDcEMsTUFBZTtRQUVmLElBQUksS0FBSyxJQUFJLElBQUk7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUU3QixJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDeEQsTUFBTSx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFekYsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7eUhBeEJVLGNBQWM7dUhBQWQsY0FBYzs7c0dBQWQsY0FBYztrQkFKMUIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsWUFBWTtvQkFDbEIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Z2V0UGx1cmFsQ2F0ZWdvcnksIE5nTG9jYWxpemF0aW9ufSBmcm9tICcuLi9pMThuL2xvY2FsaXphdGlvbic7XG5cbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmNvbnN0IF9JTlRFUlBPTEFUSU9OX1JFR0VYUDogUmVnRXhwID0gLyMvZztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBNYXBzIGEgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBwbHVyYWxpemVzIHRoZSB2YWx1ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2kxOG5fcGlwZS50cyByZWdpb249J0kxOG5QbHVyYWxQaXBlQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ2kxOG5QbHVyYWwnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBJMThuUGx1cmFsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIG51bWJlciB0byBiZSBmb3JtYXR0ZWRcbiAgICogQHBhcmFtIHBsdXJhbE1hcCBhbiBvYmplY3QgdGhhdCBtaW1pY3MgdGhlIElDVSBmb3JtYXQsIHNlZVxuICAgKiBodHRwczovL3VuaWNvZGUtb3JnLmdpdGh1Yi5pby9pY3UvdXNlcmd1aWRlL2Zvcm1hdF9wYXJzZS9tZXNzYWdlcy8uXG4gICAqIEBwYXJhbSBsb2NhbGUgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZSAodXNlcyB0aGUgY3VycmVudCB7QGxpbmsgTE9DQUxFX0lEfSBieVxuICAgKiBkZWZhdWx0KS5cbiAgICovXG4gIHRyYW5zZm9ybShcbiAgICB2YWx1ZTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBwbHVyYWxNYXA6IHtbY291bnQ6IHN0cmluZ106IHN0cmluZ30sXG4gICAgbG9jYWxlPzogc3RyaW5nLFxuICApOiBzdHJpbmcge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gJyc7XG5cbiAgICBpZiAodHlwZW9mIHBsdXJhbE1hcCAhPT0gJ29iamVjdCcgfHwgcGx1cmFsTWFwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoSTE4blBsdXJhbFBpcGUsIHBsdXJhbE1hcCk7XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWUsIE9iamVjdC5rZXlzKHBsdXJhbE1hcCksIHRoaXMuX2xvY2FsaXphdGlvbiwgbG9jYWxlKTtcblxuICAgIHJldHVybiBwbHVyYWxNYXBba2V5XS5yZXBsYWNlKF9JTlRFUlBPTEFUSU9OX1JFR0VYUCwgdmFsdWUudG9TdHJpbmcoKSk7XG4gIH1cbn1cbiJdfQ==