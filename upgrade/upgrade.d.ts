/**
 * @license Angular v8.0.0-rc.0+12.sha-6067583.with-local-changes
 * (c) 2010-2019 Google LLC. https://angular.io/
 * License: MIT
 */

import { HashLocationStrategy } from '@angular/common';
import { InjectionToken } from '@angular/core';
import { Location } from '@angular/common';
import { LocationStrategy } from '@angular/common';
import { ModuleWithProviders } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { PlatformLocation } from '@angular/common';
import { UpgradeModule } from '@angular/upgrade/static';

/**
 * Docs TBD.
 *
 * @publicApi
 */
export declare class $locationShim {
    private location;
    private platformLocation;
    private urlCodec;
    private locationStrategy;
    private initalizing;
    private updateBrowser;
    private $$absUrl;
    private $$url;
    private $$protocol;
    private $$host;
    private $$port;
    private $$replace;
    private $$path;
    private $$search;
    private $$hash;
    private $$state;
    private cachedState;
    constructor($injector: any, location: Location, platformLocation: PlatformLocation, urlCodec: UrlCodec, locationStrategy: LocationStrategy);
    private initialize;
    private resetBrowserUpdate;
    private lastHistoryState;
    private lastBrowserUrl;
    private browserUrl;
    private lastCachedState;
    private cacheState;
    /**
     * This function emulates the $browser.state() function from AngularJS. It will cause
     * history.state to be cached unless changed with deep equality check.
     */
    private browserState;
    private stripBaseUrl;
    private getServerBase;
    private parseAppUrl;
    $$parse(url: string): void;
    $$parseLinkUrl(url: string, relHref?: string | null): boolean;
    private setBrowserUrlWithFallback;
    private composeUrls;
    /**
     * This method is getter only.
     *
     * Return full URL representation with all segments encoded according to rules specified in
     * [RFC 3986](http://www.ietf.org/rfc/rfc3986.txt).
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let absUrl = $location.absUrl();
     * // => "http://example.com/#/some/path?foo=bar&baz=xoxo"
     * ```
     */
    absUrl(): string;
    /**
     * This method is getter / setter.
     *
     * Return URL (e.g. `/path?a=b#hash`) when called without any parameter.
     *
     * Change path, search and hash, when called with parameter and return `$location`.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let url = $location.url();
     * // => "/some/path?foo=bar&baz=xoxo"
     * ```
     */
    url(): string;
    url(url: string): this;
    /**
     * This method is getter only.
     *
     * Return protocol of current URL.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let protocol = $location.protocol();
     * // => "http"
     * ```
     */
    protocol(): string;
    /**
     * This method is getter only.
     *
     * Return host of current URL.
     *
     * Note: compared to the non-AngularJS version `location.host` which returns `hostname:port`, this
     * returns the `hostname` portion only.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let host = $location.host();
     * // => "example.com"
     *
     * // given URL http://user:password@example.com:8080/#/some/path?foo=bar&baz=xoxo
     * host = $location.host();
     * // => "example.com"
     * host = location.host;
     * // => "example.com:8080"
     * ```
     */
    host(): string;
    /**
     * This method is getter only.
     *
     * Return port of current URL.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let port = $location.port();
     * // => 80
     * ```
     */
    port(): number | null;
    /**
     * This method is getter / setter.
     *
     * Return path of current URL when called without any parameter.
     *
     * Change path when called with parameter and return `$location`.
     *
     * Note: Path should always begin with forward slash (/), this method will add the forward slash
     * if it is missing.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let path = $location.path();
     * // => "/some/path"
     * ```
     */
    path(): string;
    path(path: string | number | null): this;
    /**
     * This method is getter / setter.
     *
     * Return search part (as object) of current URL when called without any parameter.
     *
     * Change search part when called with parameter and return `$location`.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
     * let searchObject = $location.search();
     * // => {foo: 'bar', baz: 'xoxo'}
     *
     * // set foo to 'yipee'
     * $location.search('foo', 'yipee');
     * // $location.search() => {foo: 'yipee', baz: 'xoxo'}
     * ```
     *
     * @param {string|Object.<string>|Object.<Array.<string>>} search New search params - string or
     * hash object.
     *
     * When called with a single argument the method acts as a setter, setting the `search` component
     * of `$location` to the specified value.
     *
     * If the argument is a hash object containing an array of values, these values will be encoded
     * as duplicate search parameters in the URL.
     *
     * @param {(string|Number|Array<string>|boolean)=} paramValue If `search` is a string or number, then `paramValue`
     * will override only a single search property.
     *
     * If `paramValue` is an array, it will override the property of the `search` component of
     * `$location` specified via the first argument.
     *
     * If `paramValue` is `null`, the property specified via the first argument will be deleted.
     *
     * If `paramValue` is `true`, the property specified via the first argument will be added with no
     * value nor trailing equal sign.
     *
     * @return {Object} If called with no arguments returns the parsed `search` object. If called with
     * one or more arguments returns `$location` object itself.
     */
    search(): {
        [key: string]: unknown;
    };
    search(search: string | number | {
        [key: string]: unknown;
    }): this;
    search(search: string | number | {
        [key: string]: unknown;
    }, paramValue: null | undefined | string | number | boolean | string[]): this;
    /**
     * This method is getter / setter.
     *
     * Returns the hash fragment when called without any parameters.
     *
     * Changes the hash fragment when called with a parameter and returns `$location`.
     *
     *
     * ```js
     * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo#hashValue
     * let hash = $location.hash();
     * // => "hashValue"
     * ```
     */
    hash(): string;
    hash(hash: string | number | null): this;
    /**
     * If called, all changes to $location during the current `$digest` will replace the current
     * history record, instead of adding a new one.
     */
    replace(): this;
    /**
     * This method is getter / setter.
     *
     * Return the history state object when called without any parameter.
     *
     * Change the history state object when called with one parameter and return `$location`.
     * The state object is later passed to `pushState` or `replaceState`.
     *
     * NOTE: This method is supported only in HTML5 mode and only in browsers supporting
     * the HTML5 History API (i.e. methods `pushState` and `replaceState`). If you need to support
     * older browsers (like IE9 or Android < 4.0), don't use this method.
     *
     */
    state(): unknown;
    state(state: unknown): this;
}

/**
 * Docs TBD.
 *
 * @publicApi
 */
export declare class $locationShimProvider {
    private ngUpgrade;
    private location;
    private platformLocation;
    private urlCodec;
    private locationStrategy;
    constructor(ngUpgrade: UpgradeModule, location: Location, platformLocation: PlatformLocation, urlCodec: UrlCodec, locationStrategy: LocationStrategy);
    $get(): $locationShim;
    /**
     * Stub method used to keep API compatible with AngularJS. This setting is configured through
     * the LocationUpgradeModule's `config` method in your Angular app.
     */
    hashPrefix(prefix?: string): void;
    /**
     * Stub method used to keep API compatible with AngularJS. This setting is configured through
     * the LocationUpgradeModule's `config` method in your Angular app.
     */
    html5Mode(mode?: any): void;
}

/**
 * A `AngularJSUrlCodec` that uses logic from AngularJS to serialize and parse URLs
 * and URL parameters
 *
 * @publicApi
 */
export declare class AngularJSUrlCodec implements UrlCodec {
    encodePath(path: string): string;
    encodeSearch(search: string | {
        [k: string]: unknown;
    }): string;
    encodeHash(hash: string): string;
    decodePath(path: string, html5Mode?: boolean): string;
    decodeSearch(search: string): {
        [k: string]: unknown;
    };
    decodeHash(hash: string): string;
    normalize(href: string): string;
    normalize(path: string, search: {
        [k: string]: unknown;
    }, hash: string, baseUrl?: string): string;
    areEqual(a: string, b: string): boolean;
    parse(url: string, base?: string): {
        href: string;
        protocol: string;
        host: string;
        search: string;
        hash: string;
        hostname: string;
        port: string;
        pathname: string;
    };
}

/**
 * Is used in DI to configure the location upgrade package.
 *
 * @publicApi
 */
export declare const LOCATION_UPGRADE_CONFIGURATION: InjectionToken<LocationUpgradeConfig>;

/**
 * Configuration options for LocationUpgrade.
 *
 * @publicApi
 */
export declare interface LocationUpgradeConfig {
    useHash?: boolean;
    hashPrefix?: string;
    urlCodec?: typeof UrlCodec;
    serverBaseHref?: string;
    appBaseHref?: string;
}

/**
 * Module used for configuring Angular's LocationUpgradeService.
 *
 * @publicApi
 */
export declare class LocationUpgradeModule {
    static config(config?: LocationUpgradeConfig): ModuleWithProviders<LocationUpgradeModule>;
}


/**
 * A codec for encoding and decoding URL parts.
 *
 * @publicApi
 **/
export declare abstract class UrlCodec {
    abstract encodePath(path: string): string;
    abstract decodePath(path: string): string;
    abstract encodeSearch(search: string | {
        [k: string]: unknown;
    }): string;
    abstract decodeSearch(search: string): {
        [k: string]: unknown;
    };
    abstract encodeHash(hash: string): string;
    abstract decodeHash(hash: string): string;
    abstract normalize(href: string): string;
    abstract normalize(path: string, search: {
        [k: string]: unknown;
    }, hash: string, baseUrl?: string): string;
    abstract areEqual(a: string, b: string): boolean;
    abstract parse(url: string, base?: string): {
        href: string;
        protocol: string;
        host: string;
        search: string;
        hash: string;
        hostname: string;
        port: string;
        pathname: string;
    };
}

export declare function ɵangular_packages_common_upgrade_upgrade_a(config: LocationUpgradeConfig, appBaseHref?: string): string;

export declare function ɵangular_packages_common_upgrade_upgrade_b(config: LocationUpgradeConfig): any;

export declare function ɵangular_packages_common_upgrade_upgrade_c(platformLocation: PlatformLocation, baseHref: string, options?: LocationUpgradeConfig): HashLocationStrategy | PathLocationStrategy;

export declare function ɵangular_packages_common_upgrade_upgrade_d(ngUpgrade: UpgradeModule, location: Location, platformLocation: PlatformLocation, urlCodec: UrlCodec, locationStrategy: LocationStrategy): $locationShim;

export { }
