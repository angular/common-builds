/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
/**
 * @deprecated from v5
 */
export declare const USE_V4_PLURALS: InjectionToken<boolean>;
/**
 * @experimental
 */
export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any, locale?: string): string;
}
/**
 * Returns the plural case based on the locale
 *
 * @experimental
 */
export declare class NgLocaleLocalization extends NgLocalization {
    protected locale: string;
    protected useV4Plurals: boolean;
    constructor(locale: string, useV4Plurals?: boolean);
    getPluralCategory(value: any, locale?: string): string;
}
