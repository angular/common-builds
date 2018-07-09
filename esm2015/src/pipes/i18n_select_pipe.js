/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
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
let I18nSelectPipe = I18nSelectPipe_1 = class I18nSelectPipe {
    /**
     * @param value a string to be internationalized.
     * @param mapping an object that indicates the text that should be displayed
     * for different values of the provided `value`.
     */
    transform(value, mapping) {
        if (value == null)
            return '';
        if (typeof mapping !== 'object' || typeof value !== 'string') {
            throw invalidPipeArgumentError(I18nSelectPipe_1, mapping);
        }
        if (mapping.hasOwnProperty(value)) {
            return mapping[value];
        }
        if (mapping.hasOwnProperty('other')) {
            return mapping['other'];
        }
        return '';
    }
};
I18nSelectPipe = I18nSelectPipe_1 = tslib_1.__decorate([
    Pipe({ name: 'i18nSelect', pure: true })
], I18nSelectPipe);
export { I18nSelectPipe };
var I18nSelectPipe_1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9zZWxlY3RfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvaTE4bl9zZWxlY3RfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDbEQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFFdkU7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFFSCxJQUFhLGNBQWMsc0JBQTNCO0lBQ0U7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxLQUE0QixFQUFFLE9BQWdDO1FBQ3RFLElBQUksS0FBSyxJQUFJLElBQUk7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUU3QixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDNUQsTUFBTSx3QkFBd0IsQ0FBQyxnQkFBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0YsQ0FBQTtBQXZCWSxjQUFjO0lBRDFCLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDO0dBQzFCLGNBQWMsQ0F1QjFCO1NBdkJZLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEdlbmVyaWMgc2VsZWN0b3IgdGhhdCBkaXNwbGF5cyB0aGUgc3RyaW5nIHRoYXQgbWF0Y2hlcyB0aGUgY3VycmVudCB2YWx1ZS5cbiAqXG4gKiBJZiBub25lIG9mIHRoZSBrZXlzIG9mIHRoZSBgbWFwcGluZ2AgbWF0Y2ggdGhlIGB2YWx1ZWAsIHRoZW4gdGhlIGNvbnRlbnRcbiAqIG9mIHRoZSBgb3RoZXJgIGtleSBpcyByZXR1cm5lZCB3aGVuIHByZXNlbnQsIG90aGVyd2lzZSBhbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQuXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvaTE4bl9waXBlLnRzIHJlZ2lvbj0nSTE4blNlbGVjdFBpcGVDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQFBpcGUoe25hbWU6ICdpMThuU2VsZWN0JywgcHVyZTogdHJ1ZX0pXG5leHBvcnQgY2xhc3MgSTE4blNlbGVjdFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBhIHN0cmluZyB0byBiZSBpbnRlcm5hdGlvbmFsaXplZC5cbiAgICogQHBhcmFtIG1hcHBpbmcgYW4gb2JqZWN0IHRoYXQgaW5kaWNhdGVzIHRoZSB0ZXh0IHRoYXQgc2hvdWxkIGJlIGRpc3BsYXllZFxuICAgKiBmb3IgZGlmZmVyZW50IHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgYHZhbHVlYC5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nfG51bGx8dW5kZWZpbmVkLCBtYXBwaW5nOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZyB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiAnJztcblxuICAgIGlmICh0eXBlb2YgbWFwcGluZyAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKEkxOG5TZWxlY3RQaXBlLCBtYXBwaW5nKTtcbiAgICB9XG5cbiAgICBpZiAobWFwcGluZy5oYXNPd25Qcm9wZXJ0eSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBtYXBwaW5nW3ZhbHVlXTtcbiAgICB9XG5cbiAgICBpZiAobWFwcGluZy5oYXNPd25Qcm9wZXJ0eSgnb3RoZXInKSkge1xuICAgICAgcmV0dXJuIG1hcHBpbmdbJ290aGVyJ107XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG59XG4iXX0=