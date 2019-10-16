/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM apis, which allows the Router to be platform
 * agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that angular supports. For example, `@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `@angular/platform-webworker` provides
 * one suitable for use with web workers.
 *
 * The `PlatformLocation` class is used directly by all implementations of {@link LocationStrategy}
 * when they need to interact with the DOM apis like pushState, popState, etc...
 *
 * {@link LocationStrategy} in turn is used by the {@link Location} service which is used directly
 * by the {@link Router} in order to navigate between routes. Since all interactions between {@link
 * Router} /
 * {@link Location} / {@link LocationStrategy} and DOM apis flow through the `PlatformLocation`
 * class they are all platform independent.
 *
 * @publicApi
 */
export declare abstract class PlatformLocation {
    abstract getBaseHrefFromDOM(): string;
    abstract getState(): unknown;
    abstract onPopState(fn: LocationChangeListener): void;
    abstract onHashChange(fn: LocationChangeListener): void;
    abstract readonly href: string;
    abstract readonly protocol: string;
    abstract readonly hostname: string;
    abstract readonly port: string;
    abstract readonly pathname: string;
    abstract readonly search: string;
    abstract readonly hash: string;
    abstract replaceState(state: any, title: string, url: string): void;
    abstract pushState(state: any, title: string, url: string): void;
    abstract forward(): void;
    abstract back(): void;
    static ɵfac: i0.ɵɵFactoryDef<PlatformLocation>;
    static ɵprov: i0.ɵɵInjectableDef<PlatformLocation>;
}
export declare function useBrowserPlatformLocation(): BrowserPlatformLocation;
/**
 * @description
 * Indicates when a location is initialized.
 *
 * @publicApi
 */
export declare const LOCATION_INITIALIZED: InjectionToken<Promise<any>>;
/**
 * @description
 * A serializable version of the event from `onPopState` or `onHashChange`
 *
 * @publicApi
 */
export interface LocationChangeEvent {
    type: string;
    state: any;
}
/**
 * @publicApi
 */
export interface LocationChangeListener {
    (event: LocationChangeEvent): any;
}
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
export declare class BrowserPlatformLocation extends PlatformLocation {
    private _doc;
    readonly location: Location;
    private _history;
    constructor(_doc: any);
    getBaseHrefFromDOM(): string;
    onPopState(fn: LocationChangeListener): void;
    onHashChange(fn: LocationChangeListener): void;
    readonly href: string;
    readonly protocol: string;
    readonly hostname: string;
    readonly port: string;
    pathname: string;
    readonly search: string;
    readonly hash: string;
    pushState(state: any, title: string, url: string): void;
    replaceState(state: any, title: string, url: string): void;
    forward(): void;
    back(): void;
    getState(): unknown;
    static ɵfac: i0.ɵɵFactoryDef<BrowserPlatformLocation>;
    static ɵprov: i0.ɵɵInjectableDef<BrowserPlatformLocation>;
}
export declare function supportsState(): boolean;
export declare function createBrowserPlatformLocation(): BrowserPlatformLocation;
