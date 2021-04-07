/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnDestroy } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import { LocationChangeListener, PlatformLocation } from './platform_location';
import * as i0 from "@angular/core";
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/hash_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
export declare class HashLocationStrategy extends LocationStrategy implements OnDestroy {
    private _platformLocation;
    private _baseHref;
    private _removeListenerFns;
    constructor(_platformLocation: PlatformLocation, _baseHref?: string);
    ngOnDestroy(): void;
    onPopState(fn: LocationChangeListener): void;
    getBaseHref(): string;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, path: string, queryParams: string): void;
    replaceState(state: any, title: string, path: string, queryParams: string): void;
    forward(): void;
    back(): void;
    historyGo(relativePosition?: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HashLocationStrategy, [null, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HashLocationStrategy>;
}
