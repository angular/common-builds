/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
    abstract areEqual(valA: string, valB: string): boolean;
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
    areEqual(valA: string, valB: string): boolean;
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
