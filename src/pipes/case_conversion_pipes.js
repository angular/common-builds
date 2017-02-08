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
var LowerCasePipe = (function () {
    function LowerCasePipe() {
    }
    /**
     * @param {?} value
     * @return {?}
     */
    LowerCasePipe.prototype.transform = function (value) {
        if (!value)
            return value;
        if (typeof value !== 'string') {
            throw invalidPipeArgumentError(LowerCasePipe, value);
        }
        return value.toLowerCase();
    };
    return LowerCasePipe;
}());
export { LowerCasePipe };
LowerCasePipe.decorators = [
    { type: Pipe, args: [{ name: 'lowercase' },] },
];
/** @nocollapse */
LowerCasePipe.ctorParameters = function () { return []; };
function LowerCasePipe_tsickle_Closure_declarations() {
    /** @type {?} */
    LowerCasePipe.decorators;
    /**
     * @nocollapse
     * @type {?}
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
var TitleCasePipe = (function () {
    function TitleCasePipe() {
    }
    /**
     * @param {?} value
     * @return {?}
     */
    TitleCasePipe.prototype.transform = function (value) {
        if (!value)
            return value;
        if (typeof value !== 'string') {
            throw invalidPipeArgumentError(TitleCasePipe, value);
        }
        return value.split(/\b/g).map(function (word) { return titleCaseWord(word); }).join('');
    };
    return TitleCasePipe;
}());
export { TitleCasePipe };
TitleCasePipe.decorators = [
    { type: Pipe, args: [{ name: 'titlecase' },] },
];
/** @nocollapse */
TitleCasePipe.ctorParameters = function () { return []; };
function TitleCasePipe_tsickle_Closure_declarations() {
    /** @type {?} */
    TitleCasePipe.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    TitleCasePipe.ctorParameters;
}
/**
 * Transforms text to uppercase.
 *
 * \@stable
 */
var UpperCasePipe = (function () {
    function UpperCasePipe() {
    }
    /**
     * @param {?} value
     * @return {?}
     */
    UpperCasePipe.prototype.transform = function (value) {
        if (!value)
            return value;
        if (typeof value !== 'string') {
            throw invalidPipeArgumentError(UpperCasePipe, value);
        }
        return value.toUpperCase();
    };
    return UpperCasePipe;
}());
export { UpperCasePipe };
UpperCasePipe.decorators = [
    { type: Pipe, args: [{ name: 'uppercase' },] },
];
/** @nocollapse */
UpperCasePipe.ctorParameters = function () { return []; };
function UpperCasePipe_tsickle_Closure_declarations() {
    /** @type {?} */
    UpperCasePipe.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    UpperCasePipe.ctorParameters;
}
//# sourceMappingURL=case_conversion_pipes.js.map