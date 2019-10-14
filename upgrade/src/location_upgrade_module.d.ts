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
    /**
     * Configures whether the location upgrade module should use the `HashLocationStrategy`
     * or the `PathLocationStrategy`
     */
    useHash?: boolean;
    /**
     * Configures the hash prefix used in the URL when using the `HashLocationStrategy`
     */
    hashPrefix?: string;
    /**
     * Configures the URL codec for encoding and decoding URLs. Default is the `AngularJSCodec`
     */
    urlCodec?: typeof UrlCodec;
    /**
     * Configures the base href when used in server-side rendered applications
     */
    serverBaseHref?: string;
    /**
     * Configures the base href when used in client-side rendered applications
     */
    appBaseHref?: string;
}
/**
 * A provider token used to configure the location upgrade module.
 *
 * @publicApi
 */
export declare const LOCATION_UPGRADE_CONFIGURATION: InjectionToken<LocationUpgradeConfig>;
/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](guide/upgrade#using-the-unified-angular-location-service)
 *
 * @publicApi
 */
export declare class LocationUpgradeModule {
    static config(config?: LocationUpgradeConfig): ModuleWithProviders<LocationUpgradeModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<LocationUpgradeModule, never, [typeof i1.CommonModule], never>;
    static ngInjectorDef: i0.ɵɵInjectorDef<LocationUpgradeModule>;
}
export declare function provideAppBaseHref(config: LocationUpgradeConfig, appBaseHref?: string): string;
export declare function provideUrlCodec(config: LocationUpgradeConfig): any;
export declare function provideLocationStrategy(platformLocation: PlatformLocation, baseHref: string, options?: LocationUpgradeConfig): HashLocationStrategy | PathLocationStrategy;
export declare function provide$location(ngUpgrade: UpgradeModule, location: Location, platformLocation: PlatformLocation, urlCodec: UrlCodec, locationStrategy: LocationStrategy): $locationShim;
