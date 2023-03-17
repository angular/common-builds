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
export const DATE_PIPE_DEFAULT_TIMEZONE = new InjectionToken('DATE_PIPE_DEFAULT_TIMEZONE');
/**
 * DI token that allows to provide default configuration for the `DatePipe` instances in an
 * application. The value is an object which can include the following fields:
 * - `dateFormat`: configures the default date format. If not provided, the `DatePipe`
 * will use the 'mediumDate' as a value.
 * - `timezone`: configures the default timezone. If not provided, the `DatePipe` will
 * use the end-user's local system timezone.
 *
 * @see `DatePipeConfig`
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
export const DATE_PIPE_DEFAULT_OPTIONS = new InjectionToken('DATE_PIPE_DEFAULT_OPTIONS');
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
 * @see `formatDate()`
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
 *  | Field type          | Format      | Description                                                   | Example Value                                              |
 *  |-------------------- |-------------|---------------------------------------------------------------|------------------------------------------------------------|
 *  | Era                 | G, GG & GGG | Abbreviated                                                   | AD                                                         |
 *  |                     | GGGG        | Wide                                                          | Anno Domini                                                |
 *  |                     | GGGGG       | Narrow                                                        | A                                                          |
 *  | Year                | y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                     | yy          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                     | yyy         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                     | yyyy        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Week-numbering year | Y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                     | YY          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                     | YYY         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                     | YYYY        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Month               | M           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                     | MM          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                     | MMM         | Abbreviated                                                   | Sep                                                        |
 *  |                     | MMMM        | Wide                                                          | September                                                  |
 *  |                     | MMMMM       | Narrow                                                        | S                                                          |
 *  | Month standalone    | L           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                     | LL          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                     | LLL         | Abbreviated                                                   | Sep                                                        |
 *  |                     | LLLL        | Wide                                                          | September                                                  |
 *  |                     | LLLLL       | Narrow                                                        | S                                                          |
 *  | Week of year        | w           | Numeric: minimum digits                                       | 1... 53                                                    |
 *  |                     | ww          | Numeric: 2 digits + zero padded                               | 01... 53                                                   |
 *  | Week of month       | W           | Numeric: 1 digit                                              | 1... 5                                                     |
 *  | Day of month        | d           | Numeric: minimum digits                                       | 1                                                          |
 *  |                     | dd          | Numeric: 2 digits + zero padded                               | 01                                                         |
 *  | Week day            | E, EE & EEE | Abbreviated                                                   | Tue                                                        |
 *  |                     | EEEE        | Wide                                                          | Tuesday                                                    |
 *  |                     | EEEEE       | Narrow                                                        | T                                                          |
 *  |                     | EEEEEE      | Short                                                         | Tu                                                         |
 *  | Week day standalone | c, cc       | Numeric: 1 digit                                              | 2                                                          |
 *  |                     | ccc         | Abbreviated                                                   | Tue                                                        |
 *  |                     | cccc        | Wide                                                          | Tuesday                                                    |
 *  |                     | ccccc       | Narrow                                                        | T                                                          |
 *  |                     | cccccc      | Short                                                         | Tu                                                         |
 *  | Period              | a, aa & aaa | Abbreviated                                                   | am/pm or AM/PM                                             |
 *  |                     | aaaa        | Wide (fallback to `a` when missing)                           | ante meridiem/post meridiem                                |
 *  |                     | aaaaa       | Narrow                                                        | a/p                                                        |
 *  | Period*             | B, BB & BBB | Abbreviated                                                   | mid.                                                       |
 *  |                     | BBBB        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                     | BBBBB       | Narrow                                                        | md                                                         |
 *  | Period standalone*  | b, bb & bbb | Abbreviated                                                   | mid.                                                       |
 *  |                     | bbbb        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                     | bbbbb       | Narrow                                                        | md                                                         |
 *  | Hour 1-12           | h           | Numeric: minimum digits                                       | 1, 12                                                      |
 *  |                     | hh          | Numeric: 2 digits + zero padded                               | 01, 12                                                     |
 *  | Hour 0-23           | H           | Numeric: minimum digits                                       | 0, 23                                                      |
 *  |                     | HH          | Numeric: 2 digits + zero padded                               | 00, 23                                                     |
 *  | Minute              | m           | Numeric: minimum digits                                       | 8, 59                                                      |
 *  |                     | mm          | Numeric: 2 digits + zero padded                               | 08, 59                                                     |
 *  | Second              | s           | Numeric: minimum digits                                       | 0... 59                                                    |
 *  |                     | ss          | Numeric: 2 digits + zero padded                               | 00... 59                                                   |
 *  | Fractional seconds  | S           | Numeric: 1 digit                                              | 0... 9                                                     |
 *  |                     | SS          | Numeric: 2 digits + zero padded                               | 00... 99                                                   |
 *  |                     | SSS         | Numeric: 3 digits + zero padded (= milliseconds)              | 000... 999                                                 |
 *  | Zone                | z, zz & zzz | Short specific non location format (fallback to O)            | GMT-8                                                      |
 *  |                     | zzzz        | Long specific non location format (fallback to OOOO)          | GMT-08:00                                                  |
 *  |                     | Z, ZZ & ZZZ | ISO8601 basic format                                          | -0800                                                      |
 *  |                     | ZZZZ        | Long localized GMT format                                     | GMT-8:00                                                   |
 *  |                     | ZZZZZ       | ISO8601 extended format + Z indicator for offset 0 (= XXXXX)  | -08:00                                                     |
 *  |                     | O, OO & OOO | Short localized GMT format                                    | GMT-8                                                      |
 *  |                     | OOOO        | Long localized GMT format                                     | GMT-08:00                                                  |
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
class DatePipe {
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
}
DatePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-fa023dd", ngImport: i0, type: DatePipe, deps: [{ token: LOCALE_ID }, { token: DATE_PIPE_DEFAULT_TIMEZONE, optional: true }, { token: DATE_PIPE_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Pipe });
DatePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.0.0-next.3+sha-fa023dd", ngImport: i0, type: DatePipe, isStandalone: true, name: "date" });
export { DatePipe };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-fa023dd", ngImport: i0, type: DatePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'date',
                    pure: true,
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
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
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9kYXRlX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRS9GLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxPQUFPLEVBQWlCLG1CQUFtQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBRXZFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxjQUFjLENBQVMsNEJBQTRCLENBQUMsQ0FBQztBQUVuRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0gsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQ2xDLElBQUksY0FBYyxDQUFpQiwyQkFBMkIsQ0FBQyxDQUFDO0FBRXBFLG1CQUFtQjtBQUNuQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEpHO0FBQ0gsa0JBQWtCO0FBQ2xCLE1BS2EsUUFBUTtJQUNuQixZQUMrQixNQUFjLEVBQ2UsZUFBNkIsRUFDOUIsY0FBb0M7UUFGaEUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNlLG9CQUFlLEdBQWYsZUFBZSxDQUFjO1FBQzlCLG1CQUFjLEdBQWQsY0FBYyxDQUFzQjtJQUM1RixDQUFDO0lBMkJKLFNBQVMsQ0FDTCxLQUF3QyxFQUFFLE1BQWUsRUFBRSxRQUFpQixFQUM1RSxNQUFlO1FBQ2pCLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxLQUFLO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFbEUsSUFBSTtZQUNGLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsSUFBSSxtQkFBbUIsQ0FBQztZQUNqRixNQUFNLFNBQVMsR0FDWCxRQUFRLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxRQUFRLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxTQUFTLENBQUM7WUFDbkYsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNyRTtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsTUFBTSx3QkFBd0IsQ0FBQyxRQUFRLEVBQUcsS0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3BFO0lBQ0gsQ0FBQzs7Z0hBN0NVLFFBQVEsa0JBRVAsU0FBUyxhQUNULDBCQUEwQiw2QkFDMUIseUJBQXlCOzhHQUoxQixRQUFRO1NBQVIsUUFBUTtzR0FBUixRQUFRO2tCQUxwQixJQUFJO21CQUFDO29CQUNKLElBQUksRUFBRSxNQUFNO29CQUNaLElBQUksRUFBRSxJQUFJO29CQUNWLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBR00sTUFBTTsyQkFBQyxTQUFTOzswQkFDaEIsTUFBTTsyQkFBQywwQkFBMEI7OzBCQUFHLFFBQVE7OzBCQUM1QyxNQUFNOzJCQUFDLHlCQUF5Qjs7MEJBQUcsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0aW9uVG9rZW4sIExPQ0FMRV9JRCwgT3B0aW9uYWwsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2Zvcm1hdERhdGV9IGZyb20gJy4uL2kxOG4vZm9ybWF0X2RhdGUnO1xuXG5pbXBvcnQge0RhdGVQaXBlQ29uZmlnLCBERUZBVUxUX0RBVEVfRk9STUFUfSBmcm9tICcuL2RhdGVfcGlwZV9jb25maWcnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBPcHRpb25hbGx5LXByb3ZpZGVkIGRlZmF1bHQgdGltZXpvbmUgdG8gdXNlIGZvciBhbGwgaW5zdGFuY2VzIG9mIGBEYXRlUGlwZWAgKHN1Y2ggYXMgYCcrMDQzMCdgKS5cbiAqIElmIHRoZSB2YWx1ZSBpc24ndCBwcm92aWRlZCwgdGhlIGBEYXRlUGlwZWAgd2lsbCB1c2UgdGhlIGVuZC11c2VyJ3MgbG9jYWwgc3lzdGVtIHRpbWV6b25lLlxuICpcbiAqIEBkZXByZWNhdGVkIHVzZSBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TIHRva2VuIHRvIGNvbmZpZ3VyZSBEYXRlUGlwZVxuICovXG5leHBvcnQgY29uc3QgREFURV9QSVBFX0RFRkFVTFRfVElNRVpPTkUgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignREFURV9QSVBFX0RFRkFVTFRfVElNRVpPTkUnKTtcblxuLyoqXG4gKiBESSB0b2tlbiB0aGF0IGFsbG93cyB0byBwcm92aWRlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBmb3IgdGhlIGBEYXRlUGlwZWAgaW5zdGFuY2VzIGluIGFuXG4gKiBhcHBsaWNhdGlvbi4gVGhlIHZhbHVlIGlzIGFuIG9iamVjdCB3aGljaCBjYW4gaW5jbHVkZSB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqIC0gYGRhdGVGb3JtYXRgOiBjb25maWd1cmVzIHRoZSBkZWZhdWx0IGRhdGUgZm9ybWF0LiBJZiBub3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgXG4gKiB3aWxsIHVzZSB0aGUgJ21lZGl1bURhdGUnIGFzIGEgdmFsdWUuXG4gKiAtIGB0aW1lem9uZWA6IGNvbmZpZ3VyZXMgdGhlIGRlZmF1bHQgdGltZXpvbmUuIElmIG5vdCBwcm92aWRlZCwgdGhlIGBEYXRlUGlwZWAgd2lsbFxuICogdXNlIHRoZSBlbmQtdXNlcidzIGxvY2FsIHN5c3RlbSB0aW1lem9uZS5cbiAqXG4gKiBAc2VlIGBEYXRlUGlwZUNvbmZpZ2BcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFZhcmlvdXMgZGF0ZSBwaXBlIGRlZmF1bHQgdmFsdWVzIGNhbiBiZSBvdmVyd3JpdHRlbiBieSBwcm92aWRpbmcgdGhpcyB0b2tlbiB3aXRoXG4gKiB0aGUgdmFsdWUgdGhhdCBoYXMgdGhpcyBpbnRlcmZhY2UuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgZGF0ZSBmb3JtYXQgYnkgcHJvdmlkaW5nIGEgdmFsdWUgdXNpbmcgdGhlIHRva2VuOlxuICogYGBgdHlwZXNjcmlwdFxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHtwcm92aWRlOiBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TLCB1c2VWYWx1ZToge2RhdGVGb3JtYXQ6ICdzaG9ydERhdGUnfX1cbiAqIF1cbiAqIGBgYFxuICpcbiAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHRpbWV6b25lIGJ5IHByb3ZpZGluZyBhIHZhbHVlIHVzaW5nIHRoZSB0b2tlbjpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHByb3ZpZGVyczogW1xuICogICB7cHJvdmlkZTogREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUywgdXNlVmFsdWU6IHt0aW1lem9uZTogJy0xMjAwJ319XG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IERBVEVfUElQRV9ERUZBVUxUX09QVElPTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxEYXRlUGlwZUNvbmZpZz4oJ0RBVEVfUElQRV9ERUZBVUxUX09QVElPTlMnKTtcblxuLy8gY2xhbmctZm9ybWF0IG9mZlxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgZGF0ZSB2YWx1ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIGBEYXRlUGlwZWAgaXMgZXhlY3V0ZWQgb25seSB3aGVuIGl0IGRldGVjdHMgYSBwdXJlIGNoYW5nZSB0byB0aGUgaW5wdXQgdmFsdWUuXG4gKiBBIHB1cmUgY2hhbmdlIGlzIGVpdGhlciBhIGNoYW5nZSB0byBhIHByaW1pdGl2ZSBpbnB1dCB2YWx1ZVxuICogKHN1Y2ggYXMgYFN0cmluZ2AsIGBOdW1iZXJgLCBgQm9vbGVhbmAsIG9yIGBTeW1ib2xgKSxcbiAqIG9yIGEgY2hhbmdlZCBvYmplY3QgcmVmZXJlbmNlIChzdWNoIGFzIGBEYXRlYCwgYEFycmF5YCwgYEZ1bmN0aW9uYCwgb3IgYE9iamVjdGApLlxuICpcbiAqIE5vdGUgdGhhdCBtdXRhdGluZyBhIGBEYXRlYCBvYmplY3QgZG9lcyBub3QgY2F1c2UgdGhlIHBpcGUgdG8gYmUgcmVuZGVyZWQgYWdhaW4uXG4gKiBUbyBlbnN1cmUgdGhhdCB0aGUgcGlwZSBpcyBleGVjdXRlZCwgeW91IG11c3QgY3JlYXRlIGEgbmV3IGBEYXRlYCBvYmplY3QuXG4gKlxuICogT25seSB0aGUgYGVuLVVTYCBsb2NhbGUgZGF0YSBjb21lcyB3aXRoIEFuZ3VsYXIuIFRvIGxvY2FsaXplIGRhdGVzXG4gKiBpbiBhbm90aGVyIGxhbmd1YWdlLCB5b3UgbXVzdCBpbXBvcnQgdGhlIGNvcnJlc3BvbmRpbmcgbG9jYWxlIGRhdGEuXG4gKiBTZWUgdGhlIFtJMThuIGd1aWRlXShndWlkZS9pMThuLWNvbW1vbi1mb3JtYXQtZGF0YS1sb2NhbGUpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIFRoZSB0aW1lIHpvbmUgb2YgdGhlIGZvcm1hdHRlZCB2YWx1ZSBjYW4gYmUgc3BlY2lmaWVkIGVpdGhlciBieSBwYXNzaW5nIGl0IGluIGFzIHRoZSBzZWNvbmRcbiAqIHBhcmFtZXRlciBvZiB0aGUgcGlwZSwgb3IgYnkgc2V0dGluZyB0aGUgZGVmYXVsdCB0aHJvdWdoIHRoZSBgREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OU2BcbiAqIGluamVjdGlvbiB0b2tlbi4gVGhlIHZhbHVlIHRoYXQgaXMgcGFzc2VkIGluIGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRha2VzIHByZWNlZGVuY2Ugb3ZlclxuICogdGhlIG9uZSBkZWZpbmVkIHVzaW5nIHRoZSBpbmplY3Rpb24gdG9rZW4uXG4gKlxuICogQHNlZSBgZm9ybWF0RGF0ZSgpYFxuICpcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSByZXN1bHQgb2YgdGhpcyBwaXBlIGlzIG5vdCByZWV2YWx1YXRlZCB3aGVuIHRoZSBpbnB1dCBpcyBtdXRhdGVkLiBUbyBhdm9pZCB0aGUgbmVlZCB0b1xuICogcmVmb3JtYXQgdGhlIGRhdGUgb24gZXZlcnkgY2hhbmdlLWRldGVjdGlvbiBjeWNsZSwgdHJlYXQgdGhlIGRhdGUgYXMgYW4gaW1tdXRhYmxlIG9iamVjdFxuICogYW5kIGNoYW5nZSB0aGUgcmVmZXJlbmNlIHdoZW4gdGhlIHBpcGUgbmVlZHMgdG8gcnVuIGFnYWluLlxuICpcbiAqICMjIyBQcmUtZGVmaW5lZCBmb3JtYXQgb3B0aW9uc1xuICpcbiAqIHwgT3B0aW9uICAgICAgICB8IEVxdWl2YWxlbnQgdG8gICAgICAgICAgICAgICAgICAgICAgIHwgRXhhbXBsZXMgKGdpdmVuIGluIGBlbi1VU2AgbG9jYWxlKSAgICAgICAgICAgICAgfFxuICogfC0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8IGAnc2hvcnQnYCAgICAgfCBgJ00vZC95eSwgaDptbSBhJ2AgICAgICAgICAgICAgICAgICB8IGA2LzE1LzE1LCA5OjAzIEFNYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdtZWRpdW0nYCAgICB8IGAnTU1NIGQsIHksIGg6bW06c3MgYSdgICAgICAgICAgICAgIHwgYEp1biAxNSwgMjAxNSwgOTowMzowMSBBTWAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ2xvbmcnYCAgICAgIHwgYCdNTU1NIGQsIHksIGg6bW06c3MgYSB6J2AgICAgICAgICAgfCBgSnVuZSAxNSwgMjAxNSBhdCA5OjAzOjAxIEFNIEdNVCsxYCAgICAgICAgICAgICB8XG4gKiB8IGAnZnVsbCdgICAgICAgfCBgJ0VFRUUsIE1NTU0gZCwgeSwgaDptbTpzcyBhIHp6enonYCB8IGBNb25kYXksIEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMDE6MDBgIHxcbiAqIHwgYCdzaG9ydERhdGUnYCB8IGAnTS9kL3l5J2AgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYDYvMTUvMTVgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ21lZGl1bURhdGUnYHwgYCdNTU0gZCwgeSdgICAgICAgICAgICAgICAgICAgICAgICAgfCBgSnVuIDE1LCAyMDE1YCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbG9uZ0RhdGUnYCAgfCBgJ01NTU0gZCwgeSdgICAgICAgICAgICAgICAgICAgICAgICB8IGBKdW5lIDE1LCAyMDE1YCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdmdWxsRGF0ZSdgICB8IGAnRUVFRSwgTU1NTSBkLCB5J2AgICAgICAgICAgICAgICAgIHwgYE1vbmRheSwgSnVuZSAxNSwgMjAxNWAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ3Nob3J0VGltZSdgIHwgYCdoOm1tIGEnYCAgICAgICAgICAgICAgICAgICAgICAgICAgfCBgOTowMyBBTWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbWVkaXVtVGltZSdgfCBgJ2g6bW06c3MgYSdgICAgICAgICAgICAgICAgICAgICAgICB8IGA5OjAzOjAxIEFNYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdsb25nVGltZSdgICB8IGAnaDptbTpzcyBhIHonYCAgICAgICAgICAgICAgICAgICAgIHwgYDk6MDM6MDEgQU0gR01UKzFgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ2Z1bGxUaW1lJ2AgIHwgYCdoOm1tOnNzIGEgenp6eidgICAgICAgICAgICAgICAgICAgfCBgOTowMzowMSBBTSBHTVQrMDE6MDBgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKlxuICogIyMjIEN1c3RvbSBmb3JtYXQgb3B0aW9uc1xuICpcbiAqIFlvdSBjYW4gY29uc3RydWN0IGEgZm9ybWF0IHN0cmluZyB1c2luZyBzeW1ib2xzIHRvIHNwZWNpZnkgdGhlIGNvbXBvbmVudHNcbiAqIG9mIGEgZGF0ZS10aW1lIHZhbHVlLCBhcyBkZXNjcmliZWQgaW4gdGhlIGZvbGxvd2luZyB0YWJsZS5cbiAqIEZvcm1hdCBkZXRhaWxzIGRlcGVuZCBvbiB0aGUgbG9jYWxlLlxuICogRmllbGRzIG1hcmtlZCB3aXRoICgqKSBhcmUgb25seSBhdmFpbGFibGUgaW4gdGhlIGV4dHJhIGRhdGEgc2V0IGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqICB8IEZpZWxkIHR5cGUgICAgICAgICAgfCBGb3JtYXQgICAgICB8IERlc2NyaXB0aW9uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBFeGFtcGxlIFZhbHVlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8LS0tLS0tLS0tLS0tLS0tLS0tLS0gfC0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAqICB8IEVyYSAgICAgICAgICAgICAgICAgfCBHLCBHRyAmIEdHRyB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBBRCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBHR0dHICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBBbm5vIERvbWluaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBHR0dHRyAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBBICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFllYXIgICAgICAgICAgICAgICAgfCB5ICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAyLCAyMCwgMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCB5eSAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMiwgMjAsIDAxLCAxNywgNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCB5eXkgICAgICAgICB8IE51bWVyaWM6IDMgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMDIsIDAyMCwgMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCB5eXl5ICAgICAgICB8IE51bWVyaWM6IDQgZGlnaXRzIG9yIG1vcmUgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgfCAwMDAyLCAwMDIwLCAwMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFdlZWstbnVtYmVyaW5nIHllYXIgfCBZICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAyLCAyMCwgMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBZWSAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMiwgMjAsIDAxLCAxNywgNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBZWVkgICAgICAgICB8IE51bWVyaWM6IDMgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMDIsIDAyMCwgMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBZWVlZICAgICAgICB8IE51bWVyaWM6IDQgZGlnaXRzIG9yIG1vcmUgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgfCAwMDAyLCAwMDIwLCAwMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IE1vbnRoICAgICAgICAgICAgICAgfCBNICAgICAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCA5LCAxMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBNTSAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwOSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBNTU0gICAgICAgICB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTZXAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBNTU1NICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTZXB0ZW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBNTU1NTSAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IE1vbnRoIHN0YW5kYWxvbmUgICAgfCBMICAgICAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCA5LCAxMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBMTCAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwOSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBMTEwgICAgICAgICB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTZXAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBMTExMICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTZXB0ZW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBMTExMTCAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFdlZWsgb2YgeWVhciAgICAgICAgfCB3ICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxLi4uIDUzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCB3dyAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMS4uLiA1MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFdlZWsgb2YgbW9udGggICAgICAgfCBXICAgICAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxLi4uIDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IERheSBvZiBtb250aCAgICAgICAgfCBkICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBkZCAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFdlZWsgZGF5ICAgICAgICAgICAgfCBFLCBFRSAmIEVFRSB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBFRUVFICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdWVzZGF5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBFRUVFRSAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBFRUVFRUUgICAgICB8IFNob3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFdlZWsgZGF5IHN0YW5kYWxvbmUgfCBjLCBjYyAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBjY2MgICAgICAgICB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBjY2NjICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdWVzZGF5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBjY2NjYyAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBjY2NjY2MgICAgICB8IFNob3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFBlcmlvZCAgICAgICAgICAgICAgfCBhLCBhYSAmIGFhYSB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbS9wbSBvciBBTS9QTSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBhYWFhICAgICAgICB8IFdpZGUgKGZhbGxiYWNrIHRvIGBhYCB3aGVuIG1pc3NpbmcpICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbnRlIG1lcmlkaWVtL3Bvc3QgbWVyaWRpZW0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBhYWFhYSAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhL3AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFBlcmlvZCogICAgICAgICAgICAgfCBCLCBCQiAmIEJCQiB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtaWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBCQkJCICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbSwgcG0sIG1pZG5pZ2h0LCBub29uLCBtb3JuaW5nLCBhZnRlcm5vb24sIGV2ZW5pbmcsIG5pZ2h0IHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBCQkJCQiAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFBlcmlvZCBzdGFuZGFsb25lKiAgfCBiLCBiYiAmIGJiYiB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtaWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBiYmJiICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbSwgcG0sIG1pZG5pZ2h0LCBub29uLCBtb3JuaW5nLCBhZnRlcm5vb24sIGV2ZW5pbmcsIG5pZ2h0IHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBiYmJiYiAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IEhvdXIgMS0xMiAgICAgICAgICAgfCBoICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxLCAxMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBoaCAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IEhvdXIgMC0yMyAgICAgICAgICAgfCBIICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwLCAyMyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBISCAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMCwgMjMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IE1pbnV0ZSAgICAgICAgICAgICAgfCBtICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCA4LCA1OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBtbSAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwOCwgNTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFNlY29uZCAgICAgICAgICAgICAgfCBzICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwLi4uIDU5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBzcyAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMC4uLiA1OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IEZyYWN0aW9uYWwgc2Vjb25kcyAgfCBTICAgICAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwLi4uIDkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBTUyAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMC4uLiA5OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBTU1MgICAgICAgICB8IE51bWVyaWM6IDMgZGlnaXRzICsgemVybyBwYWRkZWQgKD0gbWlsbGlzZWNvbmRzKSAgICAgICAgICAgICAgfCAwMDAuLi4gOTk5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFpvbmUgICAgICAgICAgICAgICAgfCB6LCB6eiAmIHp6eiB8IFNob3J0IHNwZWNpZmljIG5vbiBsb2NhdGlvbiBmb3JtYXQgKGZhbGxiYWNrIHRvIE8pICAgICAgICAgICAgfCBHTVQtOCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCB6enp6ICAgICAgICB8IExvbmcgc3BlY2lmaWMgbm9uIGxvY2F0aW9uIGZvcm1hdCAoZmFsbGJhY2sgdG8gT09PTykgICAgICAgICAgfCBHTVQtMDg6MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBaLCBaWiAmIFpaWiB8IElTTzg2MDEgYmFzaWMgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAtMDgwMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBaWlpaICAgICAgICB8IExvbmcgbG9jYWxpemVkIEdNVCBmb3JtYXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBHTVQtODowMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBaWlpaWiAgICAgICB8IElTTzg2MDEgZXh0ZW5kZWQgZm9ybWF0ICsgWiBpbmRpY2F0b3IgZm9yIG9mZnNldCAwICg9IFhYWFhYKSAgfCAtMDg6MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBPLCBPTyAmIE9PTyB8IFNob3J0IGxvY2FsaXplZCBHTVQgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBHTVQtOCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgfCBPT09PICAgICAgICB8IExvbmcgbG9jYWxpemVkIEdNVCBmb3JtYXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBHTVQtMDg6MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqXG4gKlxuICogIyMjIEZvcm1hdCBleGFtcGxlc1xuICpcbiAqIFRoZXNlIGV4YW1wbGVzIHRyYW5zZm9ybSBhIGRhdGUgaW50byB2YXJpb3VzIGZvcm1hdHMsXG4gKiBhc3N1bWluZyB0aGF0IGBkYXRlT2JqYCBpcyBhIEphdmFTY3JpcHQgYERhdGVgIG9iamVjdCBmb3JcbiAqIHllYXI6IDIwMTUsIG1vbnRoOiA2LCBkYXk6IDE1LCBob3VyOiAyMSwgbWludXRlOiA0Mywgc2Vjb25kOiAxMSxcbiAqIGdpdmVuIGluIHRoZSBsb2NhbCB0aW1lIGZvciB0aGUgYGVuLVVTYCBsb2NhbGUuXG4gKlxuICogYGBgXG4gKiB7eyBkYXRlT2JqIHwgZGF0ZSB9fSAgICAgICAgICAgICAgIC8vIG91dHB1dCBpcyAnSnVuIDE1LCAyMDE1J1xuICoge3sgZGF0ZU9iaiB8IGRhdGU6J21lZGl1bScgfX0gICAgICAvLyBvdXRwdXQgaXMgJ0p1biAxNSwgMjAxNSwgOTo0MzoxMSBQTSdcbiAqIHt7IGRhdGVPYmogfCBkYXRlOidzaG9ydFRpbWUnIH19ICAgLy8gb3V0cHV0IGlzICc5OjQzIFBNJ1xuICoge3sgZGF0ZU9iaiB8IGRhdGU6J21tOnNzJyB9fSAgICAgICAvLyBvdXRwdXQgaXMgJzQzOjExJ1xuICogYGBgXG4gKlxuICogIyMjIFVzYWdlIGV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGNvbXBvbmVudCB1c2VzIGEgZGF0ZSBwaXBlIHRvIGRpc3BsYXkgdGhlIGN1cnJlbnQgZGF0ZSBpbiBkaWZmZXJlbnQgZm9ybWF0cy5cbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAnZGF0ZS1waXBlJyxcbiAqICB0ZW1wbGF0ZTogYDxkaXY+XG4gKiAgICA8cD5Ub2RheSBpcyB7e3RvZGF5IHwgZGF0ZX19PC9wPlxuICogICAgPHA+T3IgaWYgeW91IHByZWZlciwge3t0b2RheSB8IGRhdGU6J2Z1bGxEYXRlJ319PC9wPlxuICogICAgPHA+VGhlIHRpbWUgaXMge3t0b2RheSB8IGRhdGU6J2g6bW0gYSB6J319PC9wPlxuICogIDwvZGl2PmBcbiAqIH0pXG4gKiAvLyBHZXQgdGhlIGN1cnJlbnQgZGF0ZSBhbmQgdGltZSBhcyBhIGRhdGUtdGltZSB2YWx1ZS5cbiAqIGV4cG9ydCBjbGFzcyBEYXRlUGlwZUNvbXBvbmVudCB7XG4gKiAgIHRvZGF5OiBudW1iZXIgPSBEYXRlLm5vdygpO1xuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG4vLyBjbGFuZy1mb3JtYXQgb25cbkBQaXBlKHtcbiAgbmFtZTogJ2RhdGUnLFxuICBwdXJlOiB0cnVlLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBEYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIGxvY2FsZTogc3RyaW5nLFxuICAgICAgQEluamVjdChEQVRFX1BJUEVfREVGQVVMVF9USU1FWk9ORSkgQE9wdGlvbmFsKCkgcHJpdmF0ZSBkZWZhdWx0VGltZXpvbmU/OiBzdHJpbmd8bnVsbCxcbiAgICAgIEBJbmplY3QoREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUykgQE9wdGlvbmFsKCkgcHJpdmF0ZSBkZWZhdWx0T3B0aW9ucz86IERhdGVQaXBlQ29uZmlnfG51bGwsXG4gICkge31cblxuICAvKipcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBkYXRlIGV4cHJlc3Npb246IGEgYERhdGVgIG9iamVjdCwgIGEgbnVtYmVyXG4gICAqIChtaWxsaXNlY29uZHMgc2luY2UgVVRDIGVwb2NoKSwgb3IgYW4gSVNPIHN0cmluZyAoaHR0cHM6Ly93d3cudzMub3JnL1RSL05PVEUtZGF0ZXRpbWUpLlxuICAgKiBAcGFyYW0gZm9ybWF0IFRoZSBkYXRlL3RpbWUgY29tcG9uZW50cyB0byBpbmNsdWRlLCB1c2luZyBwcmVkZWZpbmVkIG9wdGlvbnMgb3IgYVxuICAgKiBjdXN0b20gZm9ybWF0IHN0cmluZy4gIFdoZW4gbm90IHByb3ZpZGVkLCB0aGUgYERhdGVQaXBlYCBsb29rcyBmb3IgdGhlIHZhbHVlIHVzaW5nIHRoZVxuICAgKiBgREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OU2AgaW5qZWN0aW9uIHRva2VuIChhbmQgcmVhZHMgdGhlIGBkYXRlRm9ybWF0YCBwcm9wZXJ0eSkuXG4gICAqIElmIHRoZSB0b2tlbiBpcyBub3QgY29uZmlndXJlZCwgdGhlIGBtZWRpdW1EYXRlYCBpcyB1c2VkIGFzIGEgdmFsdWUuXG4gICAqIEBwYXJhbSB0aW1lem9uZSBBIHRpbWV6b25lIG9mZnNldCAoc3VjaCBhcyBgJyswNDMwJ2ApLCBvciBhIHN0YW5kYXJkIFVUQy9HTVQsIG9yIGNvbnRpbmVudGFsIFVTXG4gICAqIHRpbWV6b25lIGFiYnJldmlhdGlvbi4gV2hlbiBub3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgIGxvb2tzIGZvciB0aGUgdmFsdWUgdXNpbmcgdGhlXG4gICAqIGBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TYCBpbmplY3Rpb24gdG9rZW4gKGFuZCByZWFkcyB0aGUgYHRpbWV6b25lYCBwcm9wZXJ0eSkuIElmIHRoZSB0b2tlblxuICAgKiBpcyBub3QgY29uZmlndXJlZCwgdGhlIGVuZC11c2VyJ3MgbG9jYWwgc3lzdGVtIHRpbWV6b25lIGlzIHVzZWQgYXMgYSB2YWx1ZS5cbiAgICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gICAqIFdoZW4gbm90IHN1cHBsaWVkLCB1c2VzIHRoZSB2YWx1ZSBvZiBgTE9DQUxFX0lEYCwgd2hpY2ggaXMgYGVuLVVTYCBieSBkZWZhdWx0LlxuICAgKiBTZWUgW1NldHRpbmcgeW91ciBhcHAgbG9jYWxlXShndWlkZS9pMThuLWNvbW1vbi1sb2NhbGUtaWQpLlxuICAgKlxuICAgKiBAc2VlIGBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TYFxuICAgKlxuICAgKiBAcmV0dXJucyBBIGRhdGUgc3RyaW5nIGluIHRoZSBkZXNpcmVkIGZvcm1hdC5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogRGF0ZXxzdHJpbmd8bnVtYmVyLCBmb3JtYXQ/OiBzdHJpbmcsIHRpbWV6b25lPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmdcbiAgICAgIHxudWxsO1xuICB0cmFuc2Zvcm0odmFsdWU6IG51bGx8dW5kZWZpbmVkLCBmb3JtYXQ/OiBzdHJpbmcsIHRpbWV6b25lPzogc3RyaW5nLCBsb2NhbGU/OiBzdHJpbmcpOiBudWxsO1xuICB0cmFuc2Zvcm0oXG4gICAgICB2YWx1ZTogRGF0ZXxzdHJpbmd8bnVtYmVyfG51bGx8dW5kZWZpbmVkLCBmb3JtYXQ/OiBzdHJpbmcsIHRpbWV6b25lPzogc3RyaW5nLFxuICAgICAgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGw7XG4gIHRyYW5zZm9ybShcbiAgICAgIHZhbHVlOiBEYXRlfHN0cmluZ3xudW1iZXJ8bnVsbHx1bmRlZmluZWQsIGZvcm1hdD86IHN0cmluZywgdGltZXpvbmU/OiBzdHJpbmcsXG4gICAgICBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlICE9PSB2YWx1ZSkgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgX2Zvcm1hdCA9IGZvcm1hdCA/PyB0aGlzLmRlZmF1bHRPcHRpb25zPy5kYXRlRm9ybWF0ID8/IERFRkFVTFRfREFURV9GT1JNQVQ7XG4gICAgICBjb25zdCBfdGltZXpvbmUgPVxuICAgICAgICAgIHRpbWV6b25lID8/IHRoaXMuZGVmYXVsdE9wdGlvbnM/LnRpbWV6b25lID8/IHRoaXMuZGVmYXVsdFRpbWV6b25lID8/IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiBmb3JtYXREYXRlKHZhbHVlLCBfZm9ybWF0LCBsb2NhbGUgfHwgdGhpcy5sb2NhbGUsIF90aW1lem9uZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihEYXRlUGlwZSwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==