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
    /**
     * Encodes the path from the provided string
     *
     * @param path The path string
     */
    abstract encodePath(path: string): string;
    /**
     * Decodes the path from the provided string
     *
     * @param path The path string
     */
    abstract decodePath(path: string): string;
    /**
     * Encodes the search string from the provided string or object
     *
     * @param path The path string or object
     */
    abstract encodeSearch(search: string | {
        [k: string]: unknown;
    }): string;
    /**
     * Decodes the search objects from the provided string
     *
     * @param path The path string
     */
    abstract decodeSearch(search: string): {
        [k: string]: unknown;
    };
    /**
     * Encodes the hash from the provided string
     *
     * @param path The hash string
     */
    abstract encodeHash(hash: string): string;
    /**
     * Decodes the hash from the provided string
     *
     * @param path The hash string
     */
    abstract decodeHash(hash: string): string;
    /**
     * Normalizes the URL from the provided string
     *
     * @param path The URL string
     */
    abstract normalize(href: string): string;
    /**
     * Normalizes the URL from the provided string, search, hash, and base URL parameters
     *
     * @param path The URL path
     * @param search The search object
     * @param hash The has string
     * @param baseUrl The base URL for the URL
     */
    abstract normalize(path: string, search: {
        [k: string]: unknown;
    }, hash: string, baseUrl?: string): string;
    /**
     * Checks whether the two strings are equal
     * @param valA First string for comparison
     * @param valB Second string for comparison
     */
    abstract areEqual(valA: string, valB: string): boolean;
    /**
     * Parses the URL string based on the base URL
     *
     * @param url The full URL string
     * @param base The base for the URL
     */
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
 * A `UrlCodec` that uses logic from AngularJS to serialize and parse URLs
 * and URL parameters.
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
