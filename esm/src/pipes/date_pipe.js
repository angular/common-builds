/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { StringMapWrapper } from '../facade/collection';
import { DateFormatter } from '../facade/intl';
import { DateWrapper, NumberWrapper, isBlank, isDate, isString } from '../facade/lang';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
export class DatePipe {
    constructor(_locale) {
        this._locale = _locale;
    }
    transform(value, pattern = 'mediumDate') {
        if (isBlank(value))
            return null;
        if (!this.supports(value)) {
            throw new InvalidPipeArgumentException(DatePipe, value);
        }
        if (NumberWrapper.isNumeric(value)) {
            value = DateWrapper.fromMillis(parseFloat(value));
        }
        else if (isString(value)) {
            value = DateWrapper.fromISOString(value);
        }
        if (StringMapWrapper.contains(DatePipe._ALIASES, pattern)) {
            pattern = StringMapWrapper.get(DatePipe._ALIASES, pattern);
        }
        return DateFormatter.format(value, this._locale, pattern);
    }
    supports(obj) {
        if (isDate(obj) || NumberWrapper.isNumeric(obj)) {
            return true;
        }
        if (isString(obj) && isDate(DateWrapper.fromISOString(obj))) {
            return true;
        }
        return false;
    }
}
/** @internal */
DatePipe._ALIASES = {
    'medium': 'yMMMdjms',
    'short': 'yMdjm',
    'fullDate': 'yMMMMEEEEd',
    'longDate': 'yMMMMd',
    'mediumDate': 'yMMMd',
    'shortDate': 'yMd',
    'mediumTime': 'jms',
    'shortTime': 'jm'
};
/** @nocollapse */
DatePipe.decorators = [
    { type: Pipe, args: [{ name: 'date', pure: true },] },
];
/** @nocollapse */
DatePipe.ctorParameters = [
    { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
];
//# sourceMappingURL=date_pipe.js.map