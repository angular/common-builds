/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { InjectionToken, ModuleWithProviders } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { $locationShim } from './location_shim';
import { UrlCodec } from './params';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
/**
 * Configuration options for LocationUpgrade.
 *
 * @publicApi
 */
export interface LocationUpgradeConfig {
    useHash?: boolean;
    hashPrefix?: string;
    urlCodec?: typeof UrlCodec;
    serverBaseHref?: string;
    appBaseHref?: string;
}
/**
 * Is used in DI to configure the location upgrade package.
 *
 * @publicApi
 */
export declare const LOCATION_UPGRADE_CONFIGURATION: InjectionToken<LocationUpgradeConfig>;
/**
 * Module used for configuring Angular's LocationUpgradeService.
 *
 * @publicApi
 */
export declare class LocationUpgradeModule {
    static config(config?: LocationUpgradeConfig): ModuleWithProviders<LocationUpgradeModule>;
    static ngModuleDef: i0.ɵɵNgModuleDefWithMeta<LocationUpgradeModule, never, [typeof i1.CommonModule], never>;
    static ngInjectorDef: i0.ɵɵInjectorDef<LocationUpgradeModule>;
}
export declare function provideAppBaseHref(config: LocationUpgradeConfig, appBaseHref?: string): string;
export declare function provideUrlCodec(config: LocationUpgradeConfig): any;
export declare function provideLocationStrategy(platformLocation: PlatformLocation, baseHref: string, options?: LocationUpgradeConfig): HashLocationStrategy | PathLocationStrategy;
export declare function provide$location(ngUpgrade: UpgradeModule, location: Location, platformLocation: PlatformLocation, urlCodec: UrlCodec, locationStrategy: LocationStrategy): $locationShim;
