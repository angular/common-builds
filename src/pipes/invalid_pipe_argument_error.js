/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseError } from '../facade/errors';
import { stringify } from '../facade/lang';
export class InvalidPipeArgumentError extends BaseError {
    /**
     * @param {?} type
     * @param {?} value
     */
    constructor(type, value) {
        super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
    }
}
//# sourceMappingURL=invalid_pipe_argument_error.js.map