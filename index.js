/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */
export { PlatformLocation, LocationStrategy, APP_BASE_HREF, HashLocationStrategy, PathLocationStrategy, Location } from './src/location';
export { NgLocalization } from './src/localization';
export { CommonModule } from './src/common_module';
export { NgClass, NgFor, NgIf, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from './src/directives/index';
export { AsyncPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, JsonPipe, LowerCasePipe, CurrencyPipe, DecimalPipe, PercentPipe, SlicePipe, UpperCasePipe } from './src/pipes/index';
import { Version } from '@angular/core';
/**
 * @stable
 */
export var /** @type {?} */ VERSION = new Version('2.3.0-rc.0-d46b8de');
//# sourceMappingURL=index.js.map