/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpParams } from './params';
/**
 * An outgoing HTTP request with an optional typed body.
 *
 * `HttpRequest` represents an outgoing request, including URL, method,
 * headers, body, and other request configuration options. Instances should be
 * assumed to be immutable. To modify a `HttpRequest`, the `clone`
 * method should be used.
 *
 * @publicApi
 */
export declare class HttpRequest<T> {
    readonly url: string;
    /**
     * The request body, or `null` if one isn't set.
     *
     * Bodies are not enforced to be immutable, as they can include a reference to any
     * user-defined data type. However, interceptors should take care to preserve
     * idempotence by treating them as such.
     */
    readonly body: T | null;
    /**
     * Outgoing headers for this request.
     */
    readonly headers: HttpHeaders;
    /**
     * Shared and mutable context that can be used by interceptors
     */
    readonly context: HttpContext;
    /**
     * Whether this request should be made in a way that exposes progress events.
     *
     * Progress events are expensive (change detection runs on each event) and so
     * they should only be requested if the consumer intends to monitor them.
     */
    readonly reportProgress: boolean;
    /**
     * Whether this request should be sent with outgoing credentials (cookies).
     */
    readonly withCredentials: boolean;
    /**
     * The expected response type of the server.
     *
     * This is used to parse the response appropriately before returning it to
     * the requestee.
     */
    readonly responseType: 'arraybuffer' | 'blob' | 'json' | 'text';
    /**
     * The outgoing HTTP request method.
     */
    readonly method: string;
    /**
     * Outgoing URL parameters.
     *
     * To pass a string representation of HTTP parameters in the URL-query-string format,
     * the `HttpParamsOptions`' `fromString` may be used. For example:
     *
     * ```
     * new HttpParams({fromString: 'angular=awesome'})
     * ```
     */
    readonly params: HttpParams;
    /**
     * The outgoing URL with all URL parameters set.
     */
    readonly urlWithParams: string;
    constructor(method: 'DELETE' | 'GET' | 'HEAD' | 'JSONP' | 'OPTIONS', url: string, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    });
    constructor(method: 'POST' | 'PUT' | 'PATCH', url: string, body: T | null, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    });
    constructor(method: string, url: string, body: T | null, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    });
    /**
     * Transform the free-form body into a serialized format suitable for
     * transmission to the server.
     */
    serializeBody(): ArrayBuffer | Blob | FormData | string | null;
    /**
     * Examine the body and attempt to infer an appropriate MIME type
     * for it.
     *
     * If no such type can be inferred, this method will return `null`.
     */
    detectContentTypeHeader(): string | null;
    clone(): HttpRequest<T>;
    clone(update: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        body?: T | null;
        method?: string;
        url?: string;
        setHeaders?: {
            [name: string]: string | string[];
        };
        setParams?: {
            [param: string]: string;
        };
    }): HttpRequest<T>;
    clone<V>(update: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        body?: V | null;
        method?: string;
        url?: string;
        setHeaders?: {
            [name: string]: string | string[];
        };
        setParams?: {
            [param: string]: string;
        };
    }): HttpRequest<V>;
}
