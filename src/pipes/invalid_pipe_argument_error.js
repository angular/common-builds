/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var errors_1 = require('../facade/errors');
var lang_1 = require('../facade/lang');
var InvalidPipeArgumentError = (function (_super) {
    __extends(InvalidPipeArgumentError, _super);
    function InvalidPipeArgumentError(type, value) {
        _super.call(this, "Invalid argument '" + value + "' for pipe '" + lang_1.stringify(type) + "'");
    }
    return InvalidPipeArgumentError;
}(errors_1.BaseError));
exports.InvalidPipeArgumentError = InvalidPipeArgumentError;
//# sourceMappingURL=invalid_pipe_argument_error.js.map