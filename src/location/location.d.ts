/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SubscriptionLike } from 'rxjs';
import { LocationStrategy } from './location_strategy';
/** @publicApi */
export interface PopStateEvent {
    pop?: boolean;
    state?: any;
    type?: string;
    url?: string;
}
/**
 * @description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on the {@link LocationStrategy} used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use the {@link Router#navigate} service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
export declare class Location {
    constructor(platformStrategy: LocationStrategy);
    /**
     * Returns the normalized URL path.
     *
     * @param includeHash Whether path has an anchor fragment.
     *
     * @returns The normalized URL path.
     */
    path(includeHash?: boolean): string;
    /**
     * Normalizes the given path and compares to the current normalized path.
     *
     * @param path The given URL path
     * @param query Query parameters
     *
     * @returns `true` if the given URL path is equal to the current normalized path, `false`
     * otherwise.
     */
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    /**
     * Given a string representing a URL, returns the URL path after stripping the
     * trailing slashes.
     *
     * @param url String representing a URL.
     *
     * @returns Normalized URL string.
     */
    normalize(url: string): string;
    /**
     * Given a string representing a URL, returns the platform-specific external URL path.
     * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
     * before normalizing. This method also adds a hash if `HashLocationStrategy` is
     * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
     *
     *
     * @param url String representing a URL.
     *
     * @returns  A normalized platform-specific URL.
     */
    prepareExternalUrl(url: string): string;
    /**
     * Changes the browsers URL to a normalized version of the given URL, and pushes a
     * new item onto the platform's history.
     *
     * @param path  URL path to normalizze
     * @param query Query parameters
     * @param state Location history state
     *
     */
    go(path: string, query?: string, state?: any): void;
    /**
     * Changes the browser's URL to a normalized version of the given URL, and replaces
     * the top item on the platform's history stack.
     *
     * @param path  URL path to normalizze
     * @param query Query parameters
     * @param state Location history state
     */
    replaceState(path: string, query?: string, state?: any): void;
    /**
     * Navigates forward in the platform's history.
     */
    forward(): void;
    /**
     * Navigates back in the platform's history.
     */
    back(): void;
    /**
     * Subscribe to the platform's `popState` events.
     *
     * @param value Event that is triggered when the state history changes.
     * @param exception The exception to throw.
     *
     * @returns Subscribed events.
     */
    subscribe(onNext: (value: PopStateEvent) => void, onThrow?: ((exception: any) => void) | null, onReturn?: (() => void) | null): SubscriptionLike;
    /**
     * Given a string of url parameters, prepend with `?` if needed, otherwise return the
     * parameters as is.
     *
     *  @param  params String of URL parameters
     *
     *  @returns URL parameters prepended with `?` or the parameters as is.
     */
    static normalizeQueryParams(params: string): string;
    /**
     * Given 2 parts of a URL, join them with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @returns Given URL strings joined with a slash, if needed.
     */
    static joinWithSlash(start: string, end: string): string;
    /**
     * If URL has a trailing slash, remove it, otherwise return the URL as is. The
     * method looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string
     *
     * @returns Returns a URL string after removing the trailing slash if one exists, otherwise
     * returns the string as is.
     */
    static stripTrailingSlash(url: string): string;
}
