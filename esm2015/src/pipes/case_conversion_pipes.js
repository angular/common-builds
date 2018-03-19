/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
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
 * Transforms text to lowercase.
 *
 * {\@example  common/pipes/ts/lowerupper_pipe.ts region='LowerUpperPipe' }
 *
 * \@stable
 */
export class LowerCasePipe {
    /**
     * @param {?} value
     * @return {?}
     */
    transform(value) {
        if (!value)
            return value;
        if (typeof value !== 'string') {
            throw invalidPipeArgumentError(LowerCasePipe, value);
        }
        return value.toLowerCase();
    }
}
LowerCasePipe.decorators = [
    { type: Pipe, args: [{ name: 'lowercase' },] },
];
/** @nocollapse */
LowerCasePipe.ctorParameters = () => [];
function LowerCasePipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    LowerCasePipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    LowerCasePipe.ctorParameters;
}
/**
 * Helper method to transform a single word to titlecase.
 *
 * \@stable
 * @param {?} word
 * @return {?}
 */
function titleCaseWord(word) {
    if (!word)
        return word;
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
}
/**
 * Transforms text to titlecase.
 *
 * \@stable
 */
export class TitleCasePipe {
    /**
     * @param {?} value
     * @return {?}
     */
    transform(value) {
        if (!value)
            return value;
        if (typeof value !== 'string') {
            throw invalidPipeArgumentError(TitleCasePipe, value);
        }
        return value.split(/\b/g).map(word => titleCaseWord(word)).join('');
    }
}
TitleCasePipe.decorators = [
    { type: Pipe, args: [{ name: 'titlecase' },] },
];
/** @nocollapse */
TitleCasePipe.ctorParameters = () => [];
function TitleCasePipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    TitleCasePipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    TitleCasePipe.ctorParameters;
}
/**
 * Transforms text to uppercase.
 *
 * \@stable
 */
export class UpperCasePipe {
    /**
     * @param {?} value
     * @return {?}
     */
    transform(value) {
        if (!value)
            return value;
        if (typeof value !== 'string') {
            throw invalidPipeArgumentError(UpperCasePipe, value);
        }
        return value.toUpperCase();
    }
}
UpperCasePipe.decorators = [
    { type: Pipe, args: [{ name: 'uppercase' },] },
];
/** @nocollapse */
UpperCasePipe.ctorParameters = () => [];
function UpperCasePipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    UpperCasePipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    UpperCasePipe.ctorParameters;
}
//# sourceMappingURL=case_conversion_pipes.js.map