/**
 * @license Angular v8.0.0-beta.11+75.sha-f98093a.with-local-changes
 * (c) 2010-2019 Google LLC. https://angular.io/
 * License: MIT
 */

import { Location } from '@angular/common';
import { LocationStrategy } from '@angular/common';
import { SubscriptionLike } from 'rxjs';

/**
 * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * @publicApi
 */
export declare class MockLocationStrategy extends LocationStrategy {
    internalBaseHref: string;
    internalPath: string;
    internalTitle: string;
    urlChanges: string[];
    constructor();
    simulatePopState(url: string): void;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(ctx: any, title: string, path: string, query: string): void;
    replaceState(ctx: any, title: string, path: string, query: string): void;
    onPopState(fn: (value: any) => void): void;
    getBaseHref(): string;
    back(): void;
    forward(): void;
}

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
    private state;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    simulateUrlPop(pathname: string): void;
    simulateHashChange(pathname: string): void;
    prepareExternalUrl(url: string): string;
    go(path: string, query?: string, state?: any): void;
    replaceState(path: string, query?: string, state?: any): void;
    forward(): void;
    back(): void;
    subscribe(onNext: (value: any) => void, onThrow?: ((error: any) => void) | null, onReturn?: (() => void) | null): SubscriptionLike;
    normalize(url: string): string;
}

export { }
