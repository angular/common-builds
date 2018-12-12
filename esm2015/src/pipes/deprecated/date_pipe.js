/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
  */
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { ISO8601_DATE_REGEX, isoStringToDate } from '../../i18n/format_date';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { DateFormatter } from './intl';
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a date according to locale rules.
 *
 * Where:
 * - `expression` is a date object or a number (milliseconds since UTC epoch) or an ISO string
 * (https://www.w3.org/TR/NOTE-datetime).
 * - `format` indicates which date/time components to include. The format can be predefined as
 *   shown below or custom as shown in the table.
 *   - `'medium'`: equivalent to `'yMMMdjms'` (e.g. `Sep 3, 2010, 12:05:08 PM` for `en-US`)
 *   - `'short'`: equivalent to `'yMdjm'` (e.g. `9/3/2010, 12:05 PM` for `en-US`)
 *   - `'fullDate'`: equivalent to `'yMMMMEEEEd'` (e.g. `Friday, September 3, 2010` for `en-US`)
 *   - `'longDate'`: equivalent to `'yMMMMd'` (e.g. `September 3, 2010` for `en-US`)
 *   - `'mediumDate'`: equivalent to `'yMMMd'` (e.g. `Sep 3, 2010` for `en-US`)
 *   - `'shortDate'`: equivalent to `'yMd'` (e.g. `9/3/2010` for `en-US`)
 *   - `'mediumTime'`: equivalent to `'jms'` (e.g. `12:05:08 PM` for `en-US`)
 *   - `'shortTime'`: equivalent to `'jm'` (e.g. `12:05 PM` for `en-US`)
 *
 *
 *  | Component | Symbol | Narrow | Short Form   | Long Form         | Numeric   | 2-digit   |
 *  |-----------|:------:|--------|--------------|-------------------|-----------|-----------|
 *  | era       |   G    | G (A)  | GGG (AD)     | GGGG (Anno Domini)| -         | -         |
 *  | year      |   y    | -      | -            | -                 | y (2015)  | yy (15)   |
 *  | month     |   M    | L (S)  | MMM (Sep)    | MMMM (September)  | M (9)     | MM (09)   |
 *  | day       |   d    | -      | -            | -                 | d (3)     | dd (03)   |
 *  | weekday   |   E    | E (S)  | EEE (Sun)    | EEEE (Sunday)     | -         | -         |
 *  | hour      |   j    | -      | -            | -                 | j (13)    | jj (13)   |
 *  | hour12    |   h    | -      | -            | -                 | h (1 PM)  | hh (01 PM)|
 *  | hour24    |   H    | -      | -            | -                 | H (13)    | HH (13)   |
 *  | minute    |   m    | -      | -            | -                 | m (5)     | mm (05)   |
 *  | second    |   s    | -      | -            | -                 | s (9)     | ss (09)   |
 *  | timezone  |   z    | -      | -            | z (Pacific Standard Time)| -  | -         |
 *  | timezone  |   Z    | -      | Z (GMT-8:00) | -                 | -         | -         |
 *  | timezone  |   a    | -      | a (PM)       | -                 | -         | -         |
 *
 * In javascript, only the components specified will be respected (not the ordering,
 * punctuations, ...) and details of the formatting will be dependent on the locale.
 *
 * Timezone of the formatted text will be the local system timezone of the end-user's machine.
 *
 * When the expression is a ISO string without time (e.g. 2016-09-19) the time zone offset is not
 * applied and the formatted text will have the same day, month and year of the expression.
 *
 * WARNINGS:
 * - this pipe is marked as pure hence it will not be re-evaluated when the input is mutated.
 *   Instead users should treat the date as an immutable object and change the reference when the
 *   pipe needs to re-run (this is to avoid reformatting the date on every change detection run
 *   which would be an expensive operation).
 * - this pipe uses the Internationalization API. Therefore it is only reliable in Chrome and Opera
 *   browsers.
 *
 * \@usageNotes
 *
 * ### Examples
 *
 * Assuming `dateObj` is (year: 2010, month: 9, day: 3, hour: 12 PM, minute: 05, second: 08)
 * in the _local_ time and locale is 'en-US':
 *
 * {\@example common/pipes/ts/date_pipe.ts region='DeprecatedDatePipe'}
 *
 * \@publicApi
 */
export class DeprecatedDatePipe {
    /**
     * @param {?} _locale
     */
    constructor(_locale) {
        this._locale = _locale;
    }
    /**
     * @param {?} value
     * @param {?=} pattern
     * @return {?}
     */
    transform(value, pattern = 'mediumDate') {
        if (value == null || value === '' || value !== value)
            return null;
        /** @type {?} */
        let date;
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (isDate(value)) {
            date = value;
        }
        else if (!isNaN(value - parseFloat(value))) {
            date = new Date(parseFloat(value));
        }
        else if (typeof value === 'string' && /^(\d{4}-\d{1,2}-\d{1,2})$/.test(value)) {
            const [y, m, d] = value.split('-').map((val) => parseInt(val, 10));
            date = new Date(y, m - 1, d);
        }
        else {
            date = new Date(value);
        }
        if (!isDate(date)) {
            /** @type {?} */
            let match;
            if ((typeof value === 'string') && (match = value.match(ISO8601_DATE_REGEX))) {
                date = isoStringToDate(match);
            }
            else {
                throw invalidPipeArgumentError(DeprecatedDatePipe, value);
            }
        }
        return DateFormatter.format(date, this._locale, DeprecatedDatePipe._ALIASES[pattern] || pattern);
    }
}
/**
 * \@internal
 */
DeprecatedDatePipe._ALIASES = {
    'medium': 'yMMMdjms',
    'short': 'yMdjm',
    'fullDate': 'yMMMMEEEEd',
    'longDate': 'yMMMMd',
    'mediumDate': 'yMMMd',
    'shortDate': 'yMd',
    'mediumTime': 'jms',
    'shortTime': 'jm'
};
DeprecatedDatePipe.decorators = [
    { type: Pipe, args: [{ name: 'date', pure: true },] }
];
/** @nocollapse */
DeprecatedDatePipe.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    DeprecatedDatePipe._ALIASES;
    /** @type {?} */
    DeprecatedDatePipe.prototype._locale;
}
/**
 * @param {?} value
 * @return {?}
 */
function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9kZXByZWNhdGVkL2RhdGVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzNFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUVyQyxNQUFNLE9BQU8sa0JBQWtCOzs7O0lBYTdCLFlBQXVDLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO0tBQUk7Ozs7OztJQUUxRCxTQUFTLENBQUMsS0FBVSxFQUFFLFVBQWtCLFlBQVk7UUFDbEQsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUs7WUFBRSxPQUFPLElBQUksQ0FBQzs7UUFFbEUsSUFBSSxJQUFJLENBQU87UUFFZixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM3QixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3RCO1FBRUQsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakIsSUFBSSxHQUFHLEtBQUssQ0FBQztTQUNkO2FBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDNUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3BDO2FBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBVy9FLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0UsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzlCO2FBQU07WUFDTCxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFOztZQUNqQixJQUFJLEtBQUssQ0FBd0I7WUFDakMsSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFO2dCQUM1RSxJQUFJLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9CO2lCQUFNO2dCQUNMLE1BQU0sd0JBQXdCLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDM0Q7U0FDRjtRQUVELE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FDdkIsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDO0tBQzFFOzs7OztBQXRERCw4QkFBMkM7SUFDekMsUUFBUSxFQUFFLFVBQVU7SUFDcEIsT0FBTyxFQUFFLE9BQU87SUFDaEIsVUFBVSxFQUFFLFlBQVk7SUFDeEIsVUFBVSxFQUFFLFFBQVE7SUFDcEIsWUFBWSxFQUFFLE9BQU87SUFDckIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsWUFBWSxFQUFFLEtBQUs7SUFDbkIsV0FBVyxFQUFFLElBQUk7Q0FDbEIsQ0FBQzs7WUFaSCxJQUFJLFNBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7Ozs7eUNBY2pCLE1BQU0sU0FBQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7QUE4Qy9CLFNBQVMsTUFBTSxDQUFDLEtBQVU7SUFDeEIsT0FBTyxLQUFLLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0NBQ3pEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4qIEBsaWNlbnNlXG4qIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuKlxuKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gICovXG5cbmltcG9ydCB7SW5qZWN0LCBMT0NBTEVfSUQsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtJU084NjAxX0RBVEVfUkVHRVgsIGlzb1N0cmluZ1RvRGF0ZX0gZnJvbSAnLi4vLi4vaTE4bi9mb3JtYXRfZGF0ZSc7XG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcbmltcG9ydCB7RGF0ZUZvcm1hdHRlcn0gZnJvbSAnLi9pbnRsJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgZGF0ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIFdoZXJlOlxuICogLSBgZXhwcmVzc2lvbmAgaXMgYSBkYXRlIG9iamVjdCBvciBhIG51bWJlciAobWlsbGlzZWNvbmRzIHNpbmNlIFVUQyBlcG9jaCkgb3IgYW4gSVNPIHN0cmluZ1xuICogKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9OT1RFLWRhdGV0aW1lKS5cbiAqIC0gYGZvcm1hdGAgaW5kaWNhdGVzIHdoaWNoIGRhdGUvdGltZSBjb21wb25lbnRzIHRvIGluY2x1ZGUuIFRoZSBmb3JtYXQgY2FuIGJlIHByZWRlZmluZWQgYXNcbiAqICAgc2hvd24gYmVsb3cgb3IgY3VzdG9tIGFzIHNob3duIGluIHRoZSB0YWJsZS5cbiAqICAgLSBgJ21lZGl1bSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTWRqbXMnYCAoZS5nLiBgU2VwIDMsIDIwMTAsIDEyOjA1OjA4IFBNYCBmb3IgYGVuLVVTYClcbiAqICAgLSBgJ3Nob3J0J2A6IGVxdWl2YWxlbnQgdG8gYCd5TWRqbSdgIChlLmcuIGA5LzMvMjAxMCwgMTI6MDUgUE1gIGZvciBgZW4tVVNgKVxuICogICAtIGAnZnVsbERhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNTU1NRUVFRWQnYCAoZS5nLiBgRnJpZGF5LCBTZXB0ZW1iZXIgMywgMjAxMGAgZm9yIGBlbi1VU2ApXG4gKiAgIC0gYCdsb25nRGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTU1kJ2AgKGUuZy4gYFNlcHRlbWJlciAzLCAyMDEwYCBmb3IgYGVuLVVTYClcbiAqICAgLSBgJ21lZGl1bURhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNTU1kJ2AgKGUuZy4gYFNlcCAzLCAyMDEwYCBmb3IgYGVuLVVTYClcbiAqICAgLSBgJ3Nob3J0RGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1kJ2AgKGUuZy4gYDkvMy8yMDEwYCBmb3IgYGVuLVVTYClcbiAqICAgLSBgJ21lZGl1bVRpbWUnYDogZXF1aXZhbGVudCB0byBgJ2ptcydgIChlLmcuIGAxMjowNTowOCBQTWAgZm9yIGBlbi1VU2ApXG4gKiAgIC0gYCdzaG9ydFRpbWUnYDogZXF1aXZhbGVudCB0byBgJ2ptJ2AgKGUuZy4gYDEyOjA1IFBNYCBmb3IgYGVuLVVTYClcbiAqXG4gKlxuICogIHwgQ29tcG9uZW50IHwgU3ltYm9sIHwgTmFycm93IHwgU2hvcnQgRm9ybSAgIHwgTG9uZyBGb3JtICAgICAgICAgfCBOdW1lcmljICAgfCAyLWRpZ2l0ICAgfFxuICogIHwtLS0tLS0tLS0tLXw6LS0tLS0tOnwtLS0tLS0tLXwtLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tfFxuICogIHwgZXJhICAgICAgIHwgICBHICAgIHwgRyAoQSkgIHwgR0dHIChBRCkgICAgIHwgR0dHRyAoQW5ubyBEb21pbmkpfCAtICAgICAgICAgfCAtICAgICAgICAgfFxuICogIHwgeWVhciAgICAgIHwgICB5ICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCB5ICgyMDE1KSAgfCB5eSAoMTUpICAgfFxuICogIHwgbW9udGggICAgIHwgICBNICAgIHwgTCAoUykgIHwgTU1NIChTZXApICAgIHwgTU1NTSAoU2VwdGVtYmVyKSAgfCBNICg5KSAgICAgfCBNTSAoMDkpICAgfFxuICogIHwgZGF5ICAgICAgIHwgICBkICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBkICgzKSAgICAgfCBkZCAoMDMpICAgfFxuICogIHwgd2Vla2RheSAgIHwgICBFICAgIHwgRSAoUykgIHwgRUVFIChTdW4pICAgIHwgRUVFRSAoU3VuZGF5KSAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgfFxuICogIHwgaG91ciAgICAgIHwgICBqICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBqICgxMykgICAgfCBqaiAoMTMpICAgfFxuICogIHwgaG91cjEyICAgIHwgICBoICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBoICgxIFBNKSAgfCBoaCAoMDEgUE0pfFxuICogIHwgaG91cjI0ICAgIHwgICBIICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBIICgxMykgICAgfCBISCAoMTMpICAgfFxuICogIHwgbWludXRlICAgIHwgICBtICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBtICg1KSAgICAgfCBtbSAoMDUpICAgfFxuICogIHwgc2Vjb25kICAgIHwgICBzICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBzICg5KSAgICAgfCBzcyAoMDkpICAgfFxuICogIHwgdGltZXpvbmUgIHwgICB6ICAgIHwgLSAgICAgIHwgLSAgICAgICAgICAgIHwgeiAoUGFjaWZpYyBTdGFuZGFyZCBUaW1lKXwgLSAgfCAtICAgICAgICAgfFxuICogIHwgdGltZXpvbmUgIHwgICBaICAgIHwgLSAgICAgIHwgWiAoR01ULTg6MDApIHwgLSAgICAgICAgICAgICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgfFxuICogIHwgdGltZXpvbmUgIHwgICBhICAgIHwgLSAgICAgIHwgYSAoUE0pICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgfFxuICpcbiAqIEluIGphdmFzY3JpcHQsIG9ubHkgdGhlIGNvbXBvbmVudHMgc3BlY2lmaWVkIHdpbGwgYmUgcmVzcGVjdGVkIChub3QgdGhlIG9yZGVyaW5nLFxuICogcHVuY3R1YXRpb25zLCAuLi4pIGFuZCBkZXRhaWxzIG9mIHRoZSBmb3JtYXR0aW5nIHdpbGwgYmUgZGVwZW5kZW50IG9uIHRoZSBsb2NhbGUuXG4gKlxuICogVGltZXpvbmUgb2YgdGhlIGZvcm1hdHRlZCB0ZXh0IHdpbGwgYmUgdGhlIGxvY2FsIHN5c3RlbSB0aW1lem9uZSBvZiB0aGUgZW5kLXVzZXIncyBtYWNoaW5lLlxuICpcbiAqIFdoZW4gdGhlIGV4cHJlc3Npb24gaXMgYSBJU08gc3RyaW5nIHdpdGhvdXQgdGltZSAoZS5nLiAyMDE2LTA5LTE5KSB0aGUgdGltZSB6b25lIG9mZnNldCBpcyBub3RcbiAqIGFwcGxpZWQgYW5kIHRoZSBmb3JtYXR0ZWQgdGV4dCB3aWxsIGhhdmUgdGhlIHNhbWUgZGF5LCBtb250aCBhbmQgeWVhciBvZiB0aGUgZXhwcmVzc2lvbi5cbiAqXG4gKiBXQVJOSU5HUzpcbiAqIC0gdGhpcyBwaXBlIGlzIG1hcmtlZCBhcyBwdXJlIGhlbmNlIGl0IHdpbGwgbm90IGJlIHJlLWV2YWx1YXRlZCB3aGVuIHRoZSBpbnB1dCBpcyBtdXRhdGVkLlxuICogICBJbnN0ZWFkIHVzZXJzIHNob3VsZCB0cmVhdCB0aGUgZGF0ZSBhcyBhbiBpbW11dGFibGUgb2JqZWN0IGFuZCBjaGFuZ2UgdGhlIHJlZmVyZW5jZSB3aGVuIHRoZVxuICogICBwaXBlIG5lZWRzIHRvIHJlLXJ1biAodGhpcyBpcyB0byBhdm9pZCByZWZvcm1hdHRpbmcgdGhlIGRhdGUgb24gZXZlcnkgY2hhbmdlIGRldGVjdGlvbiBydW5cbiAqICAgd2hpY2ggd291bGQgYmUgYW4gZXhwZW5zaXZlIG9wZXJhdGlvbikuXG4gKiAtIHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmFcbiAqICAgYnJvd3NlcnMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBBc3N1bWluZyBgZGF0ZU9iamAgaXMgKHllYXI6IDIwMTAsIG1vbnRoOiA5LCBkYXk6IDMsIGhvdXI6IDEyIFBNLCBtaW51dGU6IDA1LCBzZWNvbmQ6IDA4KVxuICogaW4gdGhlIF9sb2NhbF8gdGltZSBhbmQgbG9jYWxlIGlzICdlbi1VUyc6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9kYXRlX3BpcGUudHMgcmVnaW9uPSdEZXByZWNhdGVkRGF0ZVBpcGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe25hbWU6ICdkYXRlJywgcHVyZTogdHJ1ZX0pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZERhdGVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9BTElBU0VTOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAnbWVkaXVtJzogJ3lNTU1kam1zJyxcbiAgICAnc2hvcnQnOiAneU1kam0nLFxuICAgICdmdWxsRGF0ZSc6ICd5TU1NTUVFRUVkJyxcbiAgICAnbG9uZ0RhdGUnOiAneU1NTU1kJyxcbiAgICAnbWVkaXVtRGF0ZSc6ICd5TU1NZCcsXG4gICAgJ3Nob3J0RGF0ZSc6ICd5TWQnLFxuICAgICdtZWRpdW1UaW1lJzogJ2ptcycsXG4gICAgJ3Nob3J0VGltZSc6ICdqbSdcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIHBhdHRlcm46IHN0cmluZyA9ICdtZWRpdW1EYXRlJyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgIT09IHZhbHVlKSByZXR1cm4gbnVsbDtcblxuICAgIGxldCBkYXRlOiBEYXRlO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgIH1cblxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICBkYXRlID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmICghaXNOYU4odmFsdWUgLSBwYXJzZUZsb2F0KHZhbHVlKSkpIHtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShwYXJzZUZsb2F0KHZhbHVlKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIC9eKFxcZHs0fS1cXGR7MSwyfS1cXGR7MSwyfSkkLy50ZXN0KHZhbHVlKSkge1xuICAgICAgLyoqXG4gICAgICAgKiBGb3IgSVNPIFN0cmluZ3Mgd2l0aG91dCB0aW1lIHRoZSBkYXksIG1vbnRoIGFuZCB5ZWFyIG11c3QgYmUgZXh0cmFjdGVkIGZyb20gdGhlIElTTyBTdHJpbmdcbiAgICAgICAqIGJlZm9yZSBEYXRlIGNyZWF0aW9uIHRvIGF2b2lkIHRpbWUgb2Zmc2V0IGFuZCBlcnJvcnMgaW4gdGhlIG5ldyBEYXRlLlxuICAgICAgICogSWYgd2Ugb25seSByZXBsYWNlICctJyB3aXRoICcsJyBpbiB0aGUgSVNPIFN0cmluZyAoXCIyMDE1LDAxLDAxXCIpLCBhbmQgdHJ5IHRvIGNyZWF0ZSBhIG5ld1xuICAgICAgICogZGF0ZSwgc29tZSBicm93c2VycyAoZS5nLiBJRSA5KSB3aWxsIHRocm93IGFuIGludmFsaWQgRGF0ZSBlcnJvclxuICAgICAgICogSWYgd2UgbGVhdmUgdGhlICctJyAoXCIyMDE1LTAxLTAxXCIpIGFuZCB0cnkgdG8gY3JlYXRlIGEgbmV3IERhdGUoXCIyMDE1LTAxLTAxXCIpIHRoZVxuICAgICAgICogdGltZW9mZnNldFxuICAgICAgICogaXMgYXBwbGllZFxuICAgICAgICogTm90ZTogSVNPIG1vbnRocyBhcmUgMCBmb3IgSmFudWFyeSwgMSBmb3IgRmVicnVhcnksIC4uLlxuICAgICAgICovXG4gICAgICBjb25zdCBbeSwgbSwgZF0gPSB2YWx1ZS5zcGxpdCgnLScpLm1hcCgodmFsOiBzdHJpbmcpID0+IHBhcnNlSW50KHZhbCwgMTApKTtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSh5LCBtIC0gMSwgZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICAgIGxldCBtYXRjaDogUmVnRXhwTWF0Y2hBcnJheXxudWxsO1xuICAgICAgaWYgKCh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSAmJiAobWF0Y2ggPSB2YWx1ZS5tYXRjaChJU084NjAxX0RBVEVfUkVHRVgpKSkge1xuICAgICAgICBkYXRlID0gaXNvU3RyaW5nVG9EYXRlKG1hdGNoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihEZXByZWNhdGVkRGF0ZVBpcGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gRGF0ZUZvcm1hdHRlci5mb3JtYXQoXG4gICAgICAgIGRhdGUsIHRoaXMuX2xvY2FsZSwgRGVwcmVjYXRlZERhdGVQaXBlLl9BTElBU0VTW3BhdHRlcm5dIHx8IHBhdHRlcm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRGF0ZSB7XG4gIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgJiYgIWlzTmFOKHZhbHVlLnZhbHVlT2YoKSk7XG59XG4iXX0=