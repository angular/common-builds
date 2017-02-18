/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { COMMON_DEPRECATED_DIRECTIVES, COMMON_DIRECTIVES } from './directives/index';
import { NgLocaleLocalization, NgLocalization } from './localization';
import { COMMON_PIPES } from './pipes/index';
/**
 * The module that includes all the basic Angular directives like {\@link NgIf}, {\@link NgForOf}, ...
 *
 * \@stable
 */
var CommonModule = (function () {
    function CommonModule() {
    }
    return CommonModule;
}());
export { CommonModule };
CommonModule.decorators = [
    { type: NgModule, args: [{
                declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
                exports: [COMMON_DIRECTIVES, COMMON_PIPES],
                providers: [
                    { provide: NgLocalization, useClass: NgLocaleLocalization },
                ],
            },] },
];
/** @nocollapse */
CommonModule.ctorParameters = function () { return []; };
function CommonModule_tsickle_Closure_declarations() {
    /** @type {?} */
    CommonModule.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    CommonModule.ctorParameters;
}
/**
 * A module to contain deprecated directives.
 *
 * @deprecated
 */
var DeprecatedCommonModule = (function () {
    function DeprecatedCommonModule() {
    }
    return DeprecatedCommonModule;
}());
export { DeprecatedCommonModule };
DeprecatedCommonModule.decorators = [
    { type: NgModule, args: [{ declarations: [COMMON_DEPRECATED_DIRECTIVES], exports: [COMMON_DEPRECATED_DIRECTIVES] },] },
];
/** @nocollapse */
DeprecatedCommonModule.ctorParameters = function () { return []; };
function DeprecatedCommonModule_tsickle_Closure_declarations() {
    /** @type {?} */
    DeprecatedCommonModule.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    DeprecatedCommonModule.ctorParameters;
}
//# sourceMappingURL=common_module.js.map