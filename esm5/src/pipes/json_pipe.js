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
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Converts value into string using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {\@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 *
 */
var JsonPipe = /** @class */ (function () {
    function JsonPipe() {
    }
    /**
     * @param {?} value
     * @return {?}
     */
    JsonPipe.prototype.transform = /**
     * @param {?} value
     * @return {?}
     */
    function (value) { return JSON.stringify(value, null, 2); };
    JsonPipe.decorators = [
        { type: Pipe, args: [{ name: 'json', pure: false },] },
    ];
    /** @nocollapse */
    JsonPipe.ctorParameters = function () { return []; };
    return JsonPipe;
}());
export { JsonPipe };
function JsonPipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    JsonPipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    JsonPipe.ctorParameters;
}
//# sourceMappingURL=json_pipe.js.map