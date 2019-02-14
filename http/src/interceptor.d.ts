/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHandler } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
/**
 * Intercepts `HttpRequest` or `HttpResponse` and handles them.
 *
 * Most interceptors transform the outgoing request before passing it to the
 * next interceptor in the chain, by calling `next.handle(transformedReq)`.
 * An interceptor may transform the
 * response event stream as well, by applying additional RxJS operators on the stream
 * returned by `next.handle()`.
 *
 * More rarely, an interceptor may handle the request entirely,
 * and compose a new event stream instead of invoking `next.handle()`. This is an
 * acceptable behavior, but keep in mind that further interceptors will be skipped entirely.
 *
 * It is also rare but valid for an interceptor to return multiple responses on the
 * event stream for a single request.
 *
 * @publicApi
 *
 * @see [HTTP Guide](guide/http#intercepting-requests-and-responses)
 *
 * @usageNotes
 *
 * To use the same instance of `HttpInterceptors` for the entire app, import the `HttpClientModule`
 * only in your `AppModule`, and add the interceptors to the root application injector .
 * If you import `HttpClientModule` multiple times across different modules (for example, in lazy
 * loading modules), each import creates a new copy of the `HttpClientModule`, which overwrites the interceptors
 * provided in the root module.
 *
 */
export interface HttpInterceptor {
    /**
     * * **req**: The outgoing request to handle
     * * **next**: The next interceptor in the chain, or the backend if no interceptors in the chain.
     *
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
/**
 * `HttpHandler` which applies an `HttpInterceptor` to an `HttpRequest`.
 *
 *
 */
export declare class HttpInterceptorHandler implements HttpHandler {
    private next;
    private interceptor;
    constructor(next: HttpHandler, interceptor: HttpInterceptor);
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
/**
 * A multi-provider token which represents the array of `HttpInterceptor`s that
 * are registered.
 *
 * @publicApi
 */
export declare const HTTP_INTERCEPTORS: InjectionToken<HttpInterceptor[]>;
export declare class NoopInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
