/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { LocationChangeListener, PlatformLocation } from '@angular/common';
import { InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Mock platform location config
 *
 * @publicApi
 */
export interface MockPlatformLocationConfig {
    startUrl?: string;
    appBaseHref?: string;
}
/**
 * Provider for mock platform location config
 *
 * @publicApi
 */
export declare const MOCK_PLATFORM_LOCATION_CONFIG: InjectionToken<MockPlatformLocationConfig>;
/**
 * Mock implementation of URL state.
 *
 * @publicApi
 */
export declare class MockPlatformLocation implements PlatformLocation {
    private baseHref;
    private hashUpdate;
    private urlChanges;
    constructor(config?: MockPlatformLocationConfig);
    get hostname(): string;
    get protocol(): string;
    get port(): string;
    get pathname(): string;
    get search(): string;
    get hash(): string;
    get state(): unknown;
    getBaseHrefFromDOM(): string;
    onPopState(fn: LocationChangeListener): VoidFunction;
    onHashChange(fn: LocationChangeListener): VoidFunction;
    get href(): string;
    get url(): string;
    private parseChanges;
    replaceState(state: any, title: string, newUrl: string): void;
    pushState(state: any, title: string, newUrl: string): void;
    forward(): void;
    back(): void;
    getState(): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<MockPlatformLocation, [{ optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDef<MockPlatformLocation>;
}
export declare function scheduleMicroTask(cb: () => any): void;
