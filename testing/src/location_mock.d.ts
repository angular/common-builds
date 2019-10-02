/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Location } from '@angular/common';
import { SubscriptionLike } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @publicApi
 */
export declare class SpyLocation implements Location {
    urlChanges: string[];
    private _history;
    private _historyIndex;
    setInitialPath(url: string): void;
    setBaseHref(url: string): void;
    path(): string;
    getState(): unknown;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    simulateUrlPop(pathname: string): void;
    simulateHashChange(pathname: string): void;
    prepareExternalUrl(url: string): string;
    go(path: string, query?: string, state?: any): void;
    replaceState(path: string, query?: string, state?: any): void;
    forward(): void;
    back(): void;
    onUrlChange(fn: (url: string, state: unknown) => void): void;
    subscribe(onNext: (value: any) => void, onThrow?: ((error: any) => void) | null, onReturn?: (() => void) | null): SubscriptionLike;
    normalize(url: string): string;
    static ngFactoryDef: i0.ɵɵFactoryDef<SpyLocation>;
    static ngInjectableDef: i0.ɵɵInjectableDef<SpyLocation>;
}
