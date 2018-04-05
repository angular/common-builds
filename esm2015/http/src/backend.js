/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Transforms an `HttpRequest` into a stream of `HttpEvent`s, one of which will likely be a
 * `HttpResponse`.
 *
 * `HttpHandler` is injectable. When injected, the handler instance dispatches requests to the
 * first interceptor in the chain, which dispatches to the second, etc, eventually reaching the
 * `HttpBackend`.
 *
 * In an `HttpInterceptor`, the `HttpHandler` parameter is the next interceptor in the chain.
 *
 * \@stable
 * @abstract
 */
export class HttpHandler {
}
function HttpHandler_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} req
     * @return {?}
     */
    HttpHandler.prototype.handle = function (req) { };
}
/**
 * A final `HttpHandler` which will dispatch the request via browser HTTP APIs to a backend.
 *
 * Interceptors sit between the `HttpClient` interface and the `HttpBackend`.
 *
 * When injected, `HttpBackend` dispatches requests directly to the backend, without going
 * through the interceptor chain.
 *
 * \@stable
 * @abstract
 */
export class HttpBackend {
}
function HttpBackend_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} req
     * @return {?}
     */
    HttpBackend.prototype.handle = function (req) { };
}
//# sourceMappingURL=backend.js.map