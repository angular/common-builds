/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var core_1 = require('@angular/core');
var common_directives_1 = require('./common_directives');
var localization_1 = require('./localization');
var common_pipes_1 = require('./pipes/common_pipes');
var CommonModule = (function () {
    function CommonModule() {
    }
    /** @nocollapse */
    CommonModule.decorators = [
        { type: core_1.NgModule, args: [{
                    declarations: [common_directives_1.COMMON_DIRECTIVES, common_pipes_1.COMMON_PIPES],
                    exports: [common_directives_1.COMMON_DIRECTIVES, common_pipes_1.COMMON_PIPES],
                    providers: [
                        { provide: localization_1.NgLocalization, useClass: localization_1.NgLocaleLocalization },
                    ],
                },] },
    ];
    return CommonModule;
}());
exports.CommonModule = CommonModule;
//# sourceMappingURL=common_module.js.map