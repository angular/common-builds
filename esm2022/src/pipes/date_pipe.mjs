/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, InjectionToken, LOCALE_ID, Optional, Pipe } from '@angular/core';
import { formatDate } from '../i18n/format_date';
import { DEFAULT_DATE_FORMAT } from './date_pipe_config';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
/**
 * Optionally-provided default timezone to use for all instances of `DatePipe` (such as `'+0430'`).
 * If the value isn't provided, the `DatePipe` will use the end-user's local system timezone.
 *
 * @deprecated use DATE_PIPE_DEFAULT_OPTIONS token to configure DatePipe
 */
export const DATE_PIPE_DEFAULT_TIMEZONE = new InjectionToken(ngDevMode ? 'DATE_PIPE_DEFAULT_TIMEZONE' : '');
/**
 * DI token that allows to provide default configuration for the `DatePipe` instances in an
 * application. The value is an object which can include the following fields:
 * - `dateFormat`: configures the default date format. If not provided, the `DatePipe`
 * will use the 'mediumDate' as a value.
 * - `timezone`: configures the default timezone. If not provided, the `DatePipe` will
 * use the end-user's local system timezone.
 *
 * @see {@link DatePipeConfig}
 *
 * @usageNotes
 *
 * Various date pipe default values can be overwritten by providing this token with
 * the value that has this interface.
 *
 * For example:
 *
 * Override the default date format by providing a value using the token:
 * ```typescript
 * providers: [
 *   {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {dateFormat: 'shortDate'}}
 * ]
 * ```
 *
 * Override the default timezone by providing a value using the token:
 * ```typescript
 * providers: [
 *   {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {timezone: '-1200'}}
 * ]
 * ```
 */
export const DATE_PIPE_DEFAULT_OPTIONS = new InjectionToken(ngDevMode ? 'DATE_PIPE_DEFAULT_OPTIONS' : '');
// clang-format off
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date value according to locale rules.
 *
 * `DatePipe` is executed only when it detects a pure change to the input value.
 * A pure change is either a change to a primitive input value
 * (such as `String`, `Number`, `Boolean`, or `Symbol`),
 * or a changed object reference (such as `Date`, `Array`, `Function`, or `Object`).
 *
 * Note that mutating a `Date` object does not cause the pipe to be rendered again.
 * To ensure that the pipe is executed, you must create a new `Date` object.
 *
 * Only the `en-US` locale data comes with Angular. To localize dates
 * in another language, you must import the corresponding locale data.
 * See the [I18n guide](guide/i18n-common-format-data-locale) for more information.
 *
 * The time zone of the formatted value can be specified either by passing it in as the second
 * parameter of the pipe, or by setting the default through the `DATE_PIPE_DEFAULT_OPTIONS`
 * injection token. The value that is passed in as the second parameter takes precedence over
 * the one defined using the injection token.
 *
 * @see {@link formatDate}
 *
 *
 * @usageNotes
 *
 * The result of this pipe is not reevaluated when the input is mutated. To avoid the need to
 * reformat the date on every change-detection cycle, treat the date as an immutable object
 * and change the reference when the pipe needs to run again.
 *
 * ### Pre-defined format options
 *
 * | Option        | Equivalent to                       | Examples (given in `en-US` locale)              |
 * |---------------|-------------------------------------|-------------------------------------------------|
 * | `'short'`     | `'M/d/yy, h:mm a'`                  | `6/15/15, 9:03 AM`                              |
 * | `'medium'`    | `'MMM d, y, h:mm:ss a'`             | `Jun 15, 2015, 9:03:01 AM`                      |
 * | `'long'`      | `'MMMM d, y, h:mm:ss a z'`          | `June 15, 2015 at 9:03:01 AM GMT+1`             |
 * | `'full'`      | `'EEEE, MMMM d, y, h:mm:ss a zzzz'` | `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00` |
 * | `'shortDate'` | `'M/d/yy'`                          | `6/15/15`                                       |
 * | `'mediumDate'`| `'MMM d, y'`                        | `Jun 15, 2015`                                  |
 * | `'longDate'`  | `'MMMM d, y'`                       | `June 15, 2015`                                 |
 * | `'fullDate'`  | `'EEEE, MMMM d, y'`                 | `Monday, June 15, 2015`                         |
 * | `'shortTime'` | `'h:mm a'`                          | `9:03 AM`                                       |
 * | `'mediumTime'`| `'h:mm:ss a'`                       | `9:03:01 AM`                                    |
 * | `'longTime'`  | `'h:mm:ss a z'`                     | `9:03:01 AM GMT+1`                              |
 * | `'fullTime'`  | `'h:mm:ss a zzzz'`                  | `9:03:01 AM GMT+01:00`                          |
 *
 * ### Custom format options
 *
 * You can construct a format string using symbols to specify the components
 * of a date-time value, as described in the following table.
 * Format details depend on the locale.
 * Fields marked with (*) are only available in the extra data set for the given locale.
 *
 *  | Field type              | Format      | Description                                                   | Example Value                                              |
 *  |-------------------------|-------------|---------------------------------------------------------------|------------------------------------------------------------|
 *  | Era                     | G, GG & GGG | Abbreviated                                                   | AD                                                         |
 *  |                         | GGGG        | Wide                                                          | Anno Domini                                                |
 *  |                         | GGGGG       | Narrow                                                        | A                                                          |
 *  | Year                    | y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                         | yy          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                         | yyy         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                         | yyyy        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | ISO Week-numbering year | Y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                         | YY          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                         | YYY         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                         | YYYY        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Month                   | M           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                         | MM          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                         | MMM         | Abbreviated                                                   | Sep                                                        |
 *  |                         | MMMM        | Wide                                                          | September                                                  |
 *  |                         | MMMMM       | Narrow                                                        | S                                                          |
 *  | Month standalone        | L           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                         | LL          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                         | LLL         | Abbreviated                                                   | Sep                                                        |
 *  |                         | LLLL        | Wide                                                          | September                                                  |
 *  |                         | LLLLL       | Narrow                                                        | S                                                          |
 *  | ISO Week of year        | w           | Numeric: minimum digits                                       | 1... 53                                                    |
 *  |                         | ww          | Numeric: 2 digits + zero padded                               | 01... 53                                                   |
 *  | Week of month           | W           | Numeric: 1 digit                                              | 1... 5                                                     |
 *  | Day of month            | d           | Numeric: minimum digits                                       | 1                                                          |
 *  |                         | dd          | Numeric: 2 digits + zero padded                               | 01                                                         |
 *  | Week day                | E, EE & EEE | Abbreviated                                                   | Tue                                                        |
 *  |                         | EEEE        | Wide                                                          | Tuesday                                                    |
 *  |                         | EEEEE       | Narrow                                                        | T                                                          |
 *  |                         | EEEEEE      | Short                                                         | Tu                                                         |
 *  | Week day standalone     | c, cc       | Numeric: 1 digit                                              | 2                                                          |
 *  |                         | ccc         | Abbreviated                                                   | Tue                                                        |
 *  |                         | cccc        | Wide                                                          | Tuesday                                                    |
 *  |                         | ccccc       | Narrow                                                        | T                                                          |
 *  |                         | cccccc      | Short                                                         | Tu                                                         |
 *  | Period                  | a, aa & aaa | Abbreviated                                                   | am/pm or AM/PM                                             |
 *  |                         | aaaa        | Wide (fallback to `a` when missing)                           | ante meridiem/post meridiem                                |
 *  |                         | aaaaa       | Narrow                                                        | a/p                                                        |
 *  | Period*                 | B, BB & BBB | Abbreviated                                                   | mid.                                                       |
 *  |                         | BBBB        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                         | BBBBB       | Narrow                                                        | md                                                         |
 *  | Period standalone*      | b, bb & bbb | Abbreviated                                                   | mid.                                                       |
 *  |                         | bbbb        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                         | bbbbb       | Narrow                                                        | md                                                         |
 *  | Hour 1-12               | h           | Numeric: minimum digits                                       | 1, 12                                                      |
 *  |                         | hh          | Numeric: 2 digits + zero padded                               | 01, 12                                                     |
 *  | Hour 0-23               | H           | Numeric: minimum digits                                       | 0, 23                                                      |
 *  |                         | HH          | Numeric: 2 digits + zero padded                               | 00, 23                                                     |
 *  | Minute                  | m           | Numeric: minimum digits                                       | 8, 59                                                      |
 *  |                         | mm          | Numeric: 2 digits + zero padded                               | 08, 59                                                     |
 *  | Second                  | s           | Numeric: minimum digits                                       | 0... 59                                                    |
 *  |                         | ss          | Numeric: 2 digits + zero padded                               | 00... 59                                                   |
 *  | Fractional seconds      | S           | Numeric: 1 digit                                              | 0... 9                                                     |
 *  |                         | SS          | Numeric: 2 digits + zero padded                               | 00... 99                                                   |
 *  |                         | SSS         | Numeric: 3 digits + zero padded (= milliseconds)              | 000... 999                                                 |
 *  | Zone                    | z, zz & zzz | Short specific non location format (fallback to O)            | GMT-8                                                      |
 *  |                         | zzzz        | Long specific non location format (fallback to OOOO)          | GMT-08:00                                                  |
 *  |                         | Z, ZZ & ZZZ | ISO8601 basic format                                          | -0800                                                      |
 *  |                         | ZZZZ        | Long localized GMT format                                     | GMT-8:00                                                   |
 *  |                         | ZZZZZ       | ISO8601 extended format + Z indicator for offset 0 (= XXXXX)  | -08:00                                                     |
 *  |                         | O, OO & OOO | Short localized GMT format                                    | GMT-8                                                      |
 *  |                         | OOOO        | Long localized GMT format                                     | GMT-08:00                                                  |
 *
 *
 * ### Format examples
 *
 * These examples transform a date into various formats,
 * assuming that `dateObj` is a JavaScript `Date` object for
 * year: 2015, month: 6, day: 15, hour: 21, minute: 43, second: 11,
 * given in the local time for the `en-US` locale.
 *
 * ```
 * {{ dateObj | date }}               // output is 'Jun 15, 2015'
 * {{ dateObj | date:'medium' }}      // output is 'Jun 15, 2015, 9:43:11 PM'
 * {{ dateObj | date:'shortTime' }}   // output is '9:43 PM'
 * {{ dateObj | date:'mm:ss' }}       // output is '43:11'
 * {{ dateObj | date:"MMM dd, yyyy 'at' hh:mm a" }}  // output is 'Jun 15, 2015 at 09:43 PM'
 * ```
 *
 * ### Usage example
 *
 * The following component uses a date pipe to display the current date in different formats.
 *
 * ```
 * @Component({
 *  selector: 'date-pipe',
 *  template: `<div>
 *    <p>Today is {{today | date}}</p>
 *    <p>Or if you prefer, {{today | date:'fullDate'}}</p>
 *    <p>The time is {{today | date:'h:mm a z'}}</p>
 *  </div>`
 * })
 * // Get the current date and time as a date-time value.
 * export class DatePipeComponent {
 *   today: number = Date.now();
 * }
 * ```
 *
 * @publicApi
 */
// clang-format on
export class DatePipe {
    constructor(locale, defaultTimezone, defaultOptions) {
        this.locale = locale;
        this.defaultTimezone = defaultTimezone;
        this.defaultOptions = defaultOptions;
    }
    transform(value, format, timezone, locale) {
        if (value == null || value === '' || value !== value)
            return null;
        try {
            const _format = format ?? this.defaultOptions?.dateFormat ?? DEFAULT_DATE_FORMAT;
            const _timezone = timezone ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? undefined;
            return formatDate(value, _format, locale || this.locale, _timezone);
        }
        catch (error) {
            throw invalidPipeArgumentError(DatePipe, error.message);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.1+sha-0461bff", ngImport: i0, type: DatePipe, deps: [{ token: LOCALE_ID }, { token: DATE_PIPE_DEFAULT_TIMEZONE, optional: true }, { token: DATE_PIPE_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.0.0-next.1+sha-0461bff", ngImport: i0, type: DatePipe, isStandalone: true, name: "date" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.1+sha-0461bff", ngImport: i0, type: DatePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'date',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DATE_PIPE_DEFAULT_TIMEZONE]
                }, {
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DATE_PIPE_DEFAULT_OPTIONS]
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9kYXRlX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRS9GLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxPQUFPLEVBQWlCLG1CQUFtQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBRXZFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxjQUFjLENBQzFELFNBQVMsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDOUMsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLGNBQWMsQ0FDekQsU0FBUyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM3QyxDQUFDO0FBRUYsbUJBQW1CO0FBQ25COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkpHO0FBQ0gsa0JBQWtCO0FBS2xCLE1BQU0sT0FBTyxRQUFRO0lBQ25CLFlBQzZCLE1BQWMsRUFDZSxlQUErQixFQUNoQyxjQUFzQztRQUZsRSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2Usb0JBQWUsR0FBZixlQUFlLENBQWdCO1FBQ2hDLG1CQUFjLEdBQWQsY0FBYyxDQUF3QjtJQUM1RixDQUFDO0lBa0NKLFNBQVMsQ0FDUCxLQUFnRCxFQUNoRCxNQUFlLEVBQ2YsUUFBaUIsRUFDakIsTUFBZTtRQUVmLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxLQUFLO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFbEUsSUFBSSxDQUFDO1lBQ0gsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxJQUFJLG1CQUFtQixDQUFDO1lBQ2pGLE1BQU0sU0FBUyxHQUNiLFFBQVEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQztZQUNqRixPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsTUFBTSx3QkFBd0IsQ0FBQyxRQUFRLEVBQUcsS0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLENBQUM7SUFDSCxDQUFDO3lIQXZEVSxRQUFRLGtCQUVULFNBQVMsYUFDVCwwQkFBMEIsNkJBQzFCLHlCQUF5Qjt1SEFKeEIsUUFBUTs7c0dBQVIsUUFBUTtrQkFKcEIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsTUFBTTtvQkFDWixVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQUdJLE1BQU07MkJBQUMsU0FBUzs7MEJBQ2hCLE1BQU07MkJBQUMsMEJBQTBCOzswQkFBRyxRQUFROzswQkFDNUMsTUFBTTsyQkFBQyx5QkFBeUI7OzBCQUFHLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCBMT0NBTEVfSUQsIE9wdGlvbmFsLCBQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtmb3JtYXREYXRlfSBmcm9tICcuLi9pMThuL2Zvcm1hdF9kYXRlJztcblxuaW1wb3J0IHtEYXRlUGlwZUNvbmZpZywgREVGQVVMVF9EQVRFX0ZPUk1BVH0gZnJvbSAnLi9kYXRlX3BpcGVfY29uZmlnJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbi8qKlxuICogT3B0aW9uYWxseS1wcm92aWRlZCBkZWZhdWx0IHRpbWV6b25lIHRvIHVzZSBmb3IgYWxsIGluc3RhbmNlcyBvZiBgRGF0ZVBpcGVgIChzdWNoIGFzIGAnKzA0MzAnYCkuXG4gKiBJZiB0aGUgdmFsdWUgaXNuJ3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgIHdpbGwgdXNlIHRoZSBlbmQtdXNlcidzIGxvY2FsIHN5c3RlbSB0aW1lem9uZS5cbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUyB0b2tlbiB0byBjb25maWd1cmUgRGF0ZVBpcGVcbiAqL1xuZXhwb3J0IGNvbnN0IERBVEVfUElQRV9ERUZBVUxUX1RJTUVaT05FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oXG4gIG5nRGV2TW9kZSA/ICdEQVRFX1BJUEVfREVGQVVMVF9USU1FWk9ORScgOiAnJyxcbik7XG5cbi8qKlxuICogREkgdG9rZW4gdGhhdCBhbGxvd3MgdG8gcHJvdmlkZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBgRGF0ZVBpcGVgIGluc3RhbmNlcyBpbiBhblxuICogYXBwbGljYXRpb24uIFRoZSB2YWx1ZSBpcyBhbiBvYmplY3Qgd2hpY2ggY2FuIGluY2x1ZGUgdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKiAtIGBkYXRlRm9ybWF0YDogY29uZmlndXJlcyB0aGUgZGVmYXVsdCBkYXRlIGZvcm1hdC4gSWYgbm90IHByb3ZpZGVkLCB0aGUgYERhdGVQaXBlYFxuICogd2lsbCB1c2UgdGhlICdtZWRpdW1EYXRlJyBhcyBhIHZhbHVlLlxuICogLSBgdGltZXpvbmVgOiBjb25maWd1cmVzIHRoZSBkZWZhdWx0IHRpbWV6b25lLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgIHdpbGxcbiAqIHVzZSB0aGUgZW5kLXVzZXIncyBsb2NhbCBzeXN0ZW0gdGltZXpvbmUuXG4gKlxuICogQHNlZSB7QGxpbmsgRGF0ZVBpcGVDb25maWd9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBWYXJpb3VzIGRhdGUgcGlwZSBkZWZhdWx0IHZhbHVlcyBjYW4gYmUgb3ZlcndyaXR0ZW4gYnkgcHJvdmlkaW5nIHRoaXMgdG9rZW4gd2l0aFxuICogdGhlIHZhbHVlIHRoYXQgaGFzIHRoaXMgaW50ZXJmYWNlLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IGRhdGUgZm9ybWF0IGJ5IHByb3ZpZGluZyBhIHZhbHVlIHVzaW5nIHRoZSB0b2tlbjpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHByb3ZpZGVyczogW1xuICogICB7cHJvdmlkZTogREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUywgdXNlVmFsdWU6IHtkYXRlRm9ybWF0OiAnc2hvcnREYXRlJ319XG4gKiBdXG4gKiBgYGBcbiAqXG4gKiBPdmVycmlkZSB0aGUgZGVmYXVsdCB0aW1lem9uZSBieSBwcm92aWRpbmcgYSB2YWx1ZSB1c2luZyB0aGUgdG9rZW46XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBwcm92aWRlcnM6IFtcbiAqICAge3Byb3ZpZGU6IERBVEVfUElQRV9ERUZBVUxUX09QVElPTlMsIHVzZVZhbHVlOiB7dGltZXpvbmU6ICctMTIwMCd9fVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPERhdGVQaXBlQ29uZmlnPihcbiAgbmdEZXZNb2RlID8gJ0RBVEVfUElQRV9ERUZBVUxUX09QVElPTlMnIDogJycsXG4pO1xuXG4vLyBjbGFuZy1mb3JtYXQgb2ZmXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBkYXRlIHZhbHVlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogYERhdGVQaXBlYCBpcyBleGVjdXRlZCBvbmx5IHdoZW4gaXQgZGV0ZWN0cyBhIHB1cmUgY2hhbmdlIHRvIHRoZSBpbnB1dCB2YWx1ZS5cbiAqIEEgcHVyZSBjaGFuZ2UgaXMgZWl0aGVyIGEgY2hhbmdlIHRvIGEgcHJpbWl0aXZlIGlucHV0IHZhbHVlXG4gKiAoc3VjaCBhcyBgU3RyaW5nYCwgYE51bWJlcmAsIGBCb29sZWFuYCwgb3IgYFN5bWJvbGApLFxuICogb3IgYSBjaGFuZ2VkIG9iamVjdCByZWZlcmVuY2UgKHN1Y2ggYXMgYERhdGVgLCBgQXJyYXlgLCBgRnVuY3Rpb25gLCBvciBgT2JqZWN0YCkuXG4gKlxuICogTm90ZSB0aGF0IG11dGF0aW5nIGEgYERhdGVgIG9iamVjdCBkb2VzIG5vdCBjYXVzZSB0aGUgcGlwZSB0byBiZSByZW5kZXJlZCBhZ2Fpbi5cbiAqIFRvIGVuc3VyZSB0aGF0IHRoZSBwaXBlIGlzIGV4ZWN1dGVkLCB5b3UgbXVzdCBjcmVhdGUgYSBuZXcgYERhdGVgIG9iamVjdC5cbiAqXG4gKiBPbmx5IHRoZSBgZW4tVVNgIGxvY2FsZSBkYXRhIGNvbWVzIHdpdGggQW5ndWxhci4gVG8gbG9jYWxpemUgZGF0ZXNcbiAqIGluIGFub3RoZXIgbGFuZ3VhZ2UsIHlvdSBtdXN0IGltcG9ydCB0aGUgY29ycmVzcG9uZGluZyBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW0kxOG4gZ3VpZGVdKGd1aWRlL2kxOG4tY29tbW9uLWZvcm1hdC1kYXRhLWxvY2FsZSkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogVGhlIHRpbWUgem9uZSBvZiB0aGUgZm9ybWF0dGVkIHZhbHVlIGNhbiBiZSBzcGVjaWZpZWQgZWl0aGVyIGJ5IHBhc3NpbmcgaXQgaW4gYXMgdGhlIHNlY29uZFxuICogcGFyYW1ldGVyIG9mIHRoZSBwaXBlLCBvciBieSBzZXR0aW5nIHRoZSBkZWZhdWx0IHRocm91Z2ggdGhlIGBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TYFxuICogaW5qZWN0aW9uIHRva2VuLiBUaGUgdmFsdWUgdGhhdCBpcyBwYXNzZWQgaW4gYXMgdGhlIHNlY29uZCBwYXJhbWV0ZXIgdGFrZXMgcHJlY2VkZW5jZSBvdmVyXG4gKiB0aGUgb25lIGRlZmluZWQgdXNpbmcgdGhlIGluamVjdGlvbiB0b2tlbi5cbiAqXG4gKiBAc2VlIHtAbGluayBmb3JtYXREYXRlfVxuICpcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSByZXN1bHQgb2YgdGhpcyBwaXBlIGlzIG5vdCByZWV2YWx1YXRlZCB3aGVuIHRoZSBpbnB1dCBpcyBtdXRhdGVkLiBUbyBhdm9pZCB0aGUgbmVlZCB0b1xuICogcmVmb3JtYXQgdGhlIGRhdGUgb24gZXZlcnkgY2hhbmdlLWRldGVjdGlvbiBjeWNsZSwgdHJlYXQgdGhlIGRhdGUgYXMgYW4gaW1tdXRhYmxlIG9iamVjdFxuICogYW5kIGNoYW5nZSB0aGUgcmVmZXJlbmNlIHdoZW4gdGhlIHBpcGUgbmVlZHMgdG8gcnVuIGFnYWluLlxuICpcbiAqICMjIyBQcmUtZGVmaW5lZCBmb3JtYXQgb3B0aW9uc1xuICpcbiAqIHwgT3B0aW9uICAgICAgICB8IEVxdWl2YWxlbnQgdG8gICAgICAgICAgICAgICAgICAgICAgIHwgRXhhbXBsZXMgKGdpdmVuIGluIGBlbi1VU2AgbG9jYWxlKSAgICAgICAgICAgICAgfFxuICogfC0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8IGAnc2hvcnQnYCAgICAgfCBgJ00vZC95eSwgaDptbSBhJ2AgICAgICAgICAgICAgICAgICB8IGA2LzE1LzE1LCA5OjAzIEFNYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdtZWRpdW0nYCAgICB8IGAnTU1NIGQsIHksIGg6bW06c3MgYSdgICAgICAgICAgICAgIHwgYEp1biAxNSwgMjAxNSwgOTowMzowMSBBTWAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ2xvbmcnYCAgICAgIHwgYCdNTU1NIGQsIHksIGg6bW06c3MgYSB6J2AgICAgICAgICAgfCBgSnVuZSAxNSwgMjAxNSBhdCA5OjAzOjAxIEFNIEdNVCsxYCAgICAgICAgICAgICB8XG4gKiB8IGAnZnVsbCdgICAgICAgfCBgJ0VFRUUsIE1NTU0gZCwgeSwgaDptbTpzcyBhIHp6enonYCB8IGBNb25kYXksIEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMDE6MDBgIHxcbiAqIHwgYCdzaG9ydERhdGUnYCB8IGAnTS9kL3l5J2AgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYDYvMTUvMTVgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ21lZGl1bURhdGUnYHwgYCdNTU0gZCwgeSdgICAgICAgICAgICAgICAgICAgICAgICAgfCBgSnVuIDE1LCAyMDE1YCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbG9uZ0RhdGUnYCAgfCBgJ01NTU0gZCwgeSdgICAgICAgICAgICAgICAgICAgICAgICB8IGBKdW5lIDE1LCAyMDE1YCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdmdWxsRGF0ZSdgICB8IGAnRUVFRSwgTU1NTSBkLCB5J2AgICAgICAgICAgICAgICAgIHwgYE1vbmRheSwgSnVuZSAxNSwgMjAxNWAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ3Nob3J0VGltZSdgIHwgYCdoOm1tIGEnYCAgICAgICAgICAgICAgICAgICAgICAgICAgfCBgOTowMyBBTWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbWVkaXVtVGltZSdgfCBgJ2g6bW06c3MgYSdgICAgICAgICAgICAgICAgICAgICAgICB8IGA5OjAzOjAxIEFNYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdsb25nVGltZSdgICB8IGAnaDptbTpzcyBhIHonYCAgICAgICAgICAgICAgICAgICAgIHwgYDk6MDM6MDEgQU0gR01UKzFgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ2Z1bGxUaW1lJ2AgIHwgYCdoOm1tOnNzIGEgenp6eidgICAgICAgICAgICAgICAgICAgfCBgOTowMzowMSBBTSBHTVQrMDE6MDBgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKlxuICogIyMjIEN1c3RvbSBmb3JtYXQgb3B0aW9uc1xuICpcbiAqIFlvdSBjYW4gY29uc3RydWN0IGEgZm9ybWF0IHN0cmluZyB1c2luZyBzeW1ib2xzIHRvIHNwZWNpZnkgdGhlIGNvbXBvbmVudHNcbiAqIG9mIGEgZGF0ZS10aW1lIHZhbHVlLCBhcyBkZXNjcmliZWQgaW4gdGhlIGZvbGxvd2luZyB0YWJsZS5cbiAqIEZvcm1hdCBkZXRhaWxzIGRlcGVuZCBvbiB0aGUgbG9jYWxlLlxuICogRmllbGRzIG1hcmtlZCB3aXRoICgqKSBhcmUgb25seSBhdmFpbGFibGUgaW4gdGhlIGV4dHJhIGRhdGEgc2V0IGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqICB8IEZpZWxkIHR5cGUgICAgICAgICAgICAgIHwgRm9ybWF0ICAgICAgfCBEZXNjcmlwdGlvbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgRXhhbXBsZSBWYWx1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICogIHwgRXJhICAgICAgICAgICAgICAgICAgICAgfCBHLCBHRyAmIEdHRyB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBBRCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgR0dHRyAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQW5ubyBEb21pbmkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IEdHR0dHICAgICAgIHwgTmFycm93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgWWVhciAgICAgICAgICAgICAgICAgICAgfCB5ICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAyLCAyMCwgMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgeXkgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDIsIDIwLCAwMSwgMTcsIDczICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IHl5eSAgICAgICAgIHwgTnVtZXJpYzogMyBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAwMiwgMDIwLCAyMDEsIDIwMTcsIDIwMTczICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCB5eXl5ICAgICAgICB8IE51bWVyaWM6IDQgZGlnaXRzIG9yIG1vcmUgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgfCAwMDAyLCAwMDIwLCAwMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IElTTyBXZWVrLW51bWJlcmluZyB5ZWFyIHwgWSAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMiwgMjAsIDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IFlZICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAyLCAyMCwgMDEsIDE3LCA3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBZWVkgICAgICAgICB8IE51bWVyaWM6IDMgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMDIsIDAyMCwgMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgWVlZWSAgICAgICAgfCBOdW1lcmljOiA0IGRpZ2l0cyBvciBtb3JlICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgIHwgMDAwMiwgMDAyMCwgMDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBNb250aCAgICAgICAgICAgICAgICAgICB8IE0gICAgICAgICAgIHwgTnVtZXJpYzogMSBkaWdpdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDksIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBNTSAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwOSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgTU1NICAgICAgICAgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU2VwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IE1NTU0gICAgICAgIHwgV2lkZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFNlcHRlbWJlciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBNTU1NTSAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IE1vbnRoIHN0YW5kYWxvbmUgICAgICAgIHwgTCAgICAgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgOSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IExMICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDA5LCAxMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBMTEwgICAgICAgICB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTZXAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgTExMTCAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU2VwdGVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IExMTExMICAgICAgIHwgTmFycm93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgSVNPIFdlZWsgb2YgeWVhciAgICAgICAgfCB3ICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxLi4uIDUzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgd3cgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDEuLi4gNTMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBXZWVrIG9mIG1vbnRoICAgICAgICAgICB8IFcgICAgICAgICAgIHwgTnVtZXJpYzogMSBkaWdpdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDEuLi4gNSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgRGF5IG9mIG1vbnRoICAgICAgICAgICAgfCBkICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgZGQgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBXZWVrIGRheSAgICAgICAgICAgICAgICB8IEUsIEVFICYgRUVFIHwgQWJicmV2aWF0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFR1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBFRUVFICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdWVzZGF5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgRUVFRUUgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IEVFRUVFRSAgICAgIHwgU2hvcnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFR1ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgV2VlayBkYXkgc3RhbmRhbG9uZSAgICAgfCBjLCBjYyAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgY2NjICAgICAgICAgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHVlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IGNjY2MgICAgICAgIHwgV2lkZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFR1ZXNkYXkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBjY2NjYyAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgY2NjY2NjICAgICAgfCBTaG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBQZXJpb2QgICAgICAgICAgICAgICAgICB8IGEsIGFhICYgYWFhIHwgQWJicmV2aWF0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGFtL3BtIG9yIEFNL1BNICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBhYWFhICAgICAgICB8IFdpZGUgKGZhbGxiYWNrIHRvIGBhYCB3aGVuIG1pc3NpbmcpICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbnRlIG1lcmlkaWVtL3Bvc3QgbWVyaWRpZW0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgYWFhYWEgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYS9wICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBQZXJpb2QqICAgICAgICAgICAgICAgICB8IEIsIEJCICYgQkJCIHwgQWJicmV2aWF0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IG1pZC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBCQkJCICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbSwgcG0sIG1pZG5pZ2h0LCBub29uLCBtb3JuaW5nLCBhZnRlcm5vb24sIGV2ZW5pbmcsIG5pZ2h0IHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgQkJCQkIgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBQZXJpb2Qgc3RhbmRhbG9uZSogICAgICB8IGIsIGJiICYgYmJiIHwgQWJicmV2aWF0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IG1pZC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBiYmJiICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbSwgcG0sIG1pZG5pZ2h0LCBub29uLCBtb3JuaW5nLCBhZnRlcm5vb24sIGV2ZW5pbmcsIG5pZ2h0IHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgYmJiYmIgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBIb3VyIDEtMTIgICAgICAgICAgICAgICB8IGggICAgICAgICAgIHwgTnVtZXJpYzogbWluaW11bSBkaWdpdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDEsIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBoaCAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IEhvdXIgMC0yMyAgICAgICAgICAgICAgIHwgSCAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMCwgMjMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IEhIICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAwLCAyMyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgTWludXRlICAgICAgICAgICAgICAgICAgfCBtICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCA4LCA1OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgbW0gICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDgsIDU5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBTZWNvbmQgICAgICAgICAgICAgICAgICB8IHMgICAgICAgICAgIHwgTnVtZXJpYzogbWluaW11bSBkaWdpdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAuLi4gNTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBzcyAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMC4uLiA1OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IEZyYWN0aW9uYWwgc2Vjb25kcyAgICAgIHwgUyAgICAgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMC4uLiA5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IFNTICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAwLi4uIDk5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBTU1MgICAgICAgICB8IE51bWVyaWM6IDMgZGlnaXRzICsgemVybyBwYWRkZWQgKD0gbWlsbGlzZWNvbmRzKSAgICAgICAgICAgICAgfCAwMDAuLi4gOTk5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFpvbmUgICAgICAgICAgICAgICAgICAgIHwgeiwgenogJiB6enogfCBTaG9ydCBzcGVjaWZpYyBub24gbG9jYXRpb24gZm9ybWF0IChmYWxsYmFjayB0byBPKSAgICAgICAgICAgIHwgR01ULTggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IHp6enogICAgICAgIHwgTG9uZyBzcGVjaWZpYyBub24gbG9jYXRpb24gZm9ybWF0IChmYWxsYmFjayB0byBPT09PKSAgICAgICAgICB8IEdNVC0wODowMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBaLCBaWiAmIFpaWiB8IElTTzg2MDEgYmFzaWMgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAtMDgwMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgWlpaWiAgICAgICAgfCBMb25nIGxvY2FsaXplZCBHTVQgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR01ULTg6MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IFpaWlpaICAgICAgIHwgSVNPODYwMSBleHRlbmRlZCBmb3JtYXQgKyBaIGluZGljYXRvciBmb3Igb2Zmc2V0IDAgKD0gWFhYWFgpICB8IC0wODowMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBPLCBPTyAmIE9PTyB8IFNob3J0IGxvY2FsaXplZCBHTVQgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBHTVQtOCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgT09PTyAgICAgICAgfCBMb25nIGxvY2FsaXplZCBHTVQgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR01ULTA4OjAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKlxuICpcbiAqICMjIyBGb3JtYXQgZXhhbXBsZXNcbiAqXG4gKiBUaGVzZSBleGFtcGxlcyB0cmFuc2Zvcm0gYSBkYXRlIGludG8gdmFyaW91cyBmb3JtYXRzLFxuICogYXNzdW1pbmcgdGhhdCBgZGF0ZU9iamAgaXMgYSBKYXZhU2NyaXB0IGBEYXRlYCBvYmplY3QgZm9yXG4gKiB5ZWFyOiAyMDE1LCBtb250aDogNiwgZGF5OiAxNSwgaG91cjogMjEsIG1pbnV0ZTogNDMsIHNlY29uZDogMTEsXG4gKiBnaXZlbiBpbiB0aGUgbG9jYWwgdGltZSBmb3IgdGhlIGBlbi1VU2AgbG9jYWxlLlxuICpcbiAqIGBgYFxuICoge3sgZGF0ZU9iaiB8IGRhdGUgfX0gICAgICAgICAgICAgICAvLyBvdXRwdXQgaXMgJ0p1biAxNSwgMjAxNSdcbiAqIHt7IGRhdGVPYmogfCBkYXRlOidtZWRpdW0nIH19ICAgICAgLy8gb3V0cHV0IGlzICdKdW4gMTUsIDIwMTUsIDk6NDM6MTEgUE0nXG4gKiB7eyBkYXRlT2JqIHwgZGF0ZTonc2hvcnRUaW1lJyB9fSAgIC8vIG91dHB1dCBpcyAnOTo0MyBQTSdcbiAqIHt7IGRhdGVPYmogfCBkYXRlOidtbTpzcycgfX0gICAgICAgLy8gb3V0cHV0IGlzICc0MzoxMSdcbiAqIHt7IGRhdGVPYmogfCBkYXRlOlwiTU1NIGRkLCB5eXl5ICdhdCcgaGg6bW0gYVwiIH19ICAvLyBvdXRwdXQgaXMgJ0p1biAxNSwgMjAxNSBhdCAwOTo0MyBQTSdcbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBleGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBjb21wb25lbnQgdXNlcyBhIGRhdGUgcGlwZSB0byBkaXNwbGF5IHRoZSBjdXJyZW50IGRhdGUgaW4gZGlmZmVyZW50IGZvcm1hdHMuXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ2RhdGUtcGlwZScsXG4gKiAgdGVtcGxhdGU6IGA8ZGl2PlxuICogICAgPHA+VG9kYXkgaXMge3t0b2RheSB8IGRhdGV9fTwvcD5cbiAqICAgIDxwPk9yIGlmIHlvdSBwcmVmZXIsIHt7dG9kYXkgfCBkYXRlOidmdWxsRGF0ZSd9fTwvcD5cbiAqICAgIDxwPlRoZSB0aW1lIGlzIHt7dG9kYXkgfCBkYXRlOidoOm1tIGEgeid9fTwvcD5cbiAqICA8L2Rpdj5gXG4gKiB9KVxuICogLy8gR2V0IHRoZSBjdXJyZW50IGRhdGUgYW5kIHRpbWUgYXMgYSBkYXRlLXRpbWUgdmFsdWUuXG4gKiBleHBvcnQgY2xhc3MgRGF0ZVBpcGVDb21wb25lbnQge1xuICogICB0b2RheTogbnVtYmVyID0gRGF0ZS5ub3coKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuLy8gY2xhbmctZm9ybWF0IG9uXG5AUGlwZSh7XG4gIG5hbWU6ICdkYXRlJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgbG9jYWxlOiBzdHJpbmcsXG4gICAgQEluamVjdChEQVRFX1BJUEVfREVGQVVMVF9USU1FWk9ORSkgQE9wdGlvbmFsKCkgcHJpdmF0ZSBkZWZhdWx0VGltZXpvbmU/OiBzdHJpbmcgfCBudWxsLFxuICAgIEBJbmplY3QoREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUykgQE9wdGlvbmFsKCkgcHJpdmF0ZSBkZWZhdWx0T3B0aW9ucz86IERhdGVQaXBlQ29uZmlnIHwgbnVsbCxcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIGRhdGUgZXhwcmVzc2lvbjogYSBgRGF0ZWAgb2JqZWN0LCAgYSBudW1iZXJcbiAgICogKG1pbGxpc2Vjb25kcyBzaW5jZSBVVEMgZXBvY2gpLCBvciBhbiBJU08gc3RyaW5nIChodHRwczovL3d3dy53My5vcmcvVFIvTk9URS1kYXRldGltZSkuXG4gICAqIEBwYXJhbSBmb3JtYXQgVGhlIGRhdGUvdGltZSBjb21wb25lbnRzIHRvIGluY2x1ZGUsIHVzaW5nIHByZWRlZmluZWQgb3B0aW9ucyBvciBhXG4gICAqIGN1c3RvbSBmb3JtYXQgc3RyaW5nLiAgV2hlbiBub3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgIGxvb2tzIGZvciB0aGUgdmFsdWUgdXNpbmcgdGhlXG4gICAqIGBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TYCBpbmplY3Rpb24gdG9rZW4gKGFuZCByZWFkcyB0aGUgYGRhdGVGb3JtYXRgIHByb3BlcnR5KS5cbiAgICogSWYgdGhlIHRva2VuIGlzIG5vdCBjb25maWd1cmVkLCB0aGUgYG1lZGl1bURhdGVgIGlzIHVzZWQgYXMgYSB2YWx1ZS5cbiAgICogQHBhcmFtIHRpbWV6b25lIEEgdGltZXpvbmUgb2Zmc2V0IChzdWNoIGFzIGAnKzA0MzAnYCksIG9yIGEgc3RhbmRhcmQgVVRDL0dNVCwgb3IgY29udGluZW50YWwgVVNcbiAgICogdGltZXpvbmUgYWJicmV2aWF0aW9uLiBXaGVuIG5vdCBwcm92aWRlZCwgdGhlIGBEYXRlUGlwZWAgbG9va3MgZm9yIHRoZSB2YWx1ZSB1c2luZyB0aGVcbiAgICogYERBVEVfUElQRV9ERUZBVUxUX09QVElPTlNgIGluamVjdGlvbiB0b2tlbiAoYW5kIHJlYWRzIHRoZSBgdGltZXpvbmVgIHByb3BlcnR5KS4gSWYgdGhlIHRva2VuXG4gICAqIGlzIG5vdCBjb25maWd1cmVkLCB0aGUgZW5kLXVzZXIncyBsb2NhbCBzeXN0ZW0gdGltZXpvbmUgaXMgdXNlZCBhcyBhIHZhbHVlLlxuICAgKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAgICogV2hlbiBub3Qgc3VwcGxpZWQsIHVzZXMgdGhlIHZhbHVlIG9mIGBMT0NBTEVfSURgLCB3aGljaCBpcyBgZW4tVVNgIGJ5IGRlZmF1bHQuXG4gICAqIFNlZSBbU2V0dGluZyB5b3VyIGFwcCBsb2NhbGVdKGd1aWRlL2kxOG4tY29tbW9uLWxvY2FsZS1pZCkuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIERBVEVfUElQRV9ERUZBVUxUX09QVElPTlN9XG4gICAqXG4gICAqIEByZXR1cm5zIEEgZGF0ZSBzdHJpbmcgaW4gdGhlIGRlc2lyZWQgZm9ybWF0LlxuICAgKi9cbiAgdHJhbnNmb3JtKFxuICAgIHZhbHVlOiBEYXRlIHwgc3RyaW5nIHwgbnVtYmVyLFxuICAgIGZvcm1hdD86IHN0cmluZyxcbiAgICB0aW1lem9uZT86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGw7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVsbCB8IHVuZGVmaW5lZCwgZm9ybWF0Pzogc3RyaW5nLCB0aW1lem9uZT86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogbnVsbDtcbiAgdHJhbnNmb3JtKFxuICAgIHZhbHVlOiBEYXRlIHwgc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBmb3JtYXQ/OiBzdHJpbmcsXG4gICAgdGltZXpvbmU/OiBzdHJpbmcsXG4gICAgbG9jYWxlPzogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBudWxsO1xuICB0cmFuc2Zvcm0oXG4gICAgdmFsdWU6IERhdGUgfCBzdHJpbmcgfCBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGZvcm1hdD86IHN0cmluZyxcbiAgICB0aW1lem9uZT86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSAhPT0gdmFsdWUpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IF9mb3JtYXQgPSBmb3JtYXQgPz8gdGhpcy5kZWZhdWx0T3B0aW9ucz8uZGF0ZUZvcm1hdCA/PyBERUZBVUxUX0RBVEVfRk9STUFUO1xuICAgICAgY29uc3QgX3RpbWV6b25lID1cbiAgICAgICAgdGltZXpvbmUgPz8gdGhpcy5kZWZhdWx0T3B0aW9ucz8udGltZXpvbmUgPz8gdGhpcy5kZWZhdWx0VGltZXpvbmUgPz8gdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIGZvcm1hdERhdGUodmFsdWUsIF9mb3JtYXQsIGxvY2FsZSB8fCB0aGlzLmxvY2FsZSwgX3RpbWV6b25lKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKERhdGVQaXBlLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuIl19