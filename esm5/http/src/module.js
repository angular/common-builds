/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Injector, NgModule } from '@angular/core';
import { HttpBackend, HttpHandler } from './backend';
import { HttpClient } from './client';
import { HTTP_INTERCEPTORS, HttpInterceptorHandler, NoopInterceptor } from './interceptor';
import { JsonpCallbackContext, JsonpClientBackend, JsonpInterceptor } from './jsonp';
import { BrowserXhr, HttpXhrBackend, XhrFactory } from './xhr';
import { HttpXsrfCookieExtractor, HttpXsrfInterceptor, HttpXsrfTokenExtractor, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from './xsrf';
/**
 * An `HttpHandler` that applies a bunch of `HttpInterceptor`s
 * to a request before passing it to the given `HttpBackend`.
 *
 * The interceptors are loaded lazily from the injector, to allow
 * interceptors to themselves inject classes depending indirectly
 * on `HttpInterceptingHandler` itself.
 */
var HttpInterceptingHandler = /** @class */ (function () {
    function HttpInterceptingHandler(backend, injector) {
        this.backend = backend;
        this.injector = injector;
        this.chain = null;
    }
    HttpInterceptingHandler.prototype.handle = function (req) {
        if (this.chain === null) {
            var interceptors = this.injector.get(HTTP_INTERCEPTORS, []);
            this.chain = interceptors.reduceRight(function (next, interceptor) { return new HttpInterceptorHandler(next, interceptor); }, this.backend);
        }
        return this.chain.handle(req);
    };
    HttpInterceptingHandler.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    HttpInterceptingHandler.ctorParameters = function () { return [
        { type: HttpBackend, },
        { type: Injector, },
    ]; };
    return HttpInterceptingHandler;
}());
export { HttpInterceptingHandler };
/**
 * Constructs an `HttpHandler` that applies a bunch of `HttpInterceptor`s
 * to a request before passing it to the given `HttpBackend`.
 *
 * Meant to be used as a factory function within `HttpClientModule`.
 *
 *
 */
export function interceptingHandler(backend, interceptors) {
    if (interceptors === void 0) { interceptors = []; }
    if (!interceptors) {
        return backend;
    }
    return interceptors.reduceRight(function (next, interceptor) { return new HttpInterceptorHandler(next, interceptor); }, backend);
}
/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 *
 */
export function jsonpCallbackContext() {
    if (typeof window === 'object') {
        return window;
    }
    return {};
}
/**
 * `NgModule` which adds XSRF protection support to outgoing requests.
 *
 * Provided the server supports a cookie-based XSRF protection system, this
 * module can be used directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no such names are provided, the default is to use `X-XSRF-TOKEN` for
 * the header name and `XSRF-TOKEN` for the cookie name.
 *
 *
 */
var HttpClientXsrfModule = /** @class */ (function () {
    function HttpClientXsrfModule() {
    }
    /**
     * Disable the default XSRF protection.
     */
    /**
       * Disable the default XSRF protection.
       */
    HttpClientXsrfModule.disable = /**
       * Disable the default XSRF protection.
       */
    function () {
        return {
            ngModule: HttpClientXsrfModule,
            providers: [
                { provide: HttpXsrfInterceptor, useClass: NoopInterceptor },
            ],
        };
    };
    /**
     * Configure XSRF protection to use the given cookie name or header name,
     * or the default names (as described above) if not provided.
     */
    /**
       * Configure XSRF protection to use the given cookie name or header name,
       * or the default names (as described above) if not provided.
       */
    HttpClientXsrfModule.withOptions = /**
       * Configure XSRF protection to use the given cookie name or header name,
       * or the default names (as described above) if not provided.
       */
    function (options) {
        if (options === void 0) { options = {}; }
        return {
            ngModule: HttpClientXsrfModule,
            providers: [
                options.cookieName ? { provide: XSRF_COOKIE_NAME, useValue: options.cookieName } : [],
                options.headerName ? { provide: XSRF_HEADER_NAME, useValue: options.headerName } : [],
            ],
        };
    };
    HttpClientXsrfModule.decorators = [
        { type: NgModule, args: [{
                    providers: [
                        HttpXsrfInterceptor,
                        { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
                        { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
                        { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
                        { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
                    ],
                },] }
    ];
    return HttpClientXsrfModule;
}());
export { HttpClientXsrfModule };
/**
 * `NgModule` which provides the `HttpClient` and associated services.
 *
 * Interceptors can be added to the chain behind `HttpClient` by binding them
 * to the multiprovider for `HTTP_INTERCEPTORS`.
 *
 *
 */
var HttpClientModule = /** @class */ (function () {
    function HttpClientModule() {
    }
    HttpClientModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        HttpClientXsrfModule.withOptions({
                            cookieName: 'XSRF-TOKEN',
                            headerName: 'X-XSRF-TOKEN',
                        }),
                    ],
                    providers: [
                        HttpClient,
                        { provide: HttpHandler, useClass: HttpInterceptingHandler },
                        HttpXhrBackend,
                        { provide: HttpBackend, useExisting: HttpXhrBackend },
                        BrowserXhr,
                        { provide: XhrFactory, useExisting: BrowserXhr },
                    ],
                },] }
    ];
    return HttpClientModule;
}());
export { HttpClientModule };
/**
 * `NgModule` which enables JSONP support in `HttpClient`.
 *
 * Without this module, Jsonp requests will reach the backend
 * with method JSONP, where they'll be rejected.
 *
 *
 */
var HttpClientJsonpModule = /** @class */ (function () {
    function HttpClientJsonpModule() {
    }
    HttpClientJsonpModule.decorators = [
        { type: NgModule, args: [{
                    providers: [
                        JsonpClientBackend,
                        { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
                        { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
                    ],
                },] }
    ];
    return HttpClientJsonpModule;
}());
export { HttpClientJsonpModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBUUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQXVCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdsRixPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNuRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxpQkFBaUIsRUFBbUIsc0JBQXNCLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFHLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUduRixPQUFPLEVBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDN0QsT0FBTyxFQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7Ozs7O0lBYzlILGlDQUFvQixPQUFvQixFQUFVLFFBQWtCO1FBQWhELFlBQU8sR0FBUCxPQUFPLENBQWE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFVO3FCQUZsQyxJQUFJO0tBRWtDO0lBRXhFLHdDQUFNLEdBQU4sVUFBTyxHQUFxQjtRQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FDakMs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O2lCQUNGOzsyQkF2SkQ7O1NBd0phLGdCQUFnQjs7Ozs7Ozs7Ozs7OztnQkFXNUIsUUFBUSxTQUFDO29CQUNSLFNBQVMsRUFBRTt3QkFDVCxrQkFBa0I7d0JBQ2xCLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQzt3QkFDakUsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7cUJBQ3RFO2lCQUNGOztnQ0F6S0Q7O1NBMEthLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3RvciwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBDbGllbnR9IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7SFRUUF9JTlRFUkNFUFRPUlMsIEh0dHBJbnRlcmNlcHRvciwgSHR0cEludGVyY2VwdG9ySGFuZGxlciwgTm9vcEludGVyY2VwdG9yfSBmcm9tICcuL2ludGVyY2VwdG9yJztcbmltcG9ydCB7SnNvbnBDYWxsYmFja0NvbnRleHQsIEpzb25wQ2xpZW50QmFja2VuZCwgSnNvbnBJbnRlcmNlcHRvcn0gZnJvbSAnLi9qc29ucCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuaW1wb3J0IHtCcm93c2VyWGhyLCBIdHRwWGhyQmFja2VuZCwgWGhyRmFjdG9yeX0gZnJvbSAnLi94aHInO1xuaW1wb3J0IHtIdHRwWHNyZkNvb2tpZUV4dHJhY3RvciwgSHR0cFhzcmZJbnRlcmNlcHRvciwgSHR0cFhzcmZUb2tlbkV4dHJhY3RvciwgWFNSRl9DT09LSUVfTkFNRSwgWFNSRl9IRUFERVJfTkFNRX0gZnJvbSAnLi94c3JmJztcblxuLyoqXG4gKiBBbiBgSHR0cEhhbmRsZXJgIHRoYXQgYXBwbGllcyBhIGJ1bmNoIG9mIGBIdHRwSW50ZXJjZXB0b3Jgc1xuICogdG8gYSByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZSBnaXZlbiBgSHR0cEJhY2tlbmRgLlxuICpcbiAqIFRoZSBpbnRlcmNlcHRvcnMgYXJlIGxvYWRlZCBsYXppbHkgZnJvbSB0aGUgaW5qZWN0b3IsIHRvIGFsbG93XG4gKiBpbnRlcmNlcHRvcnMgdG8gdGhlbXNlbHZlcyBpbmplY3QgY2xhc3NlcyBkZXBlbmRpbmcgaW5kaXJlY3RseVxuICogb24gYEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyYCBpdHNlbGYuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwSW50ZXJjZXB0aW5nSGFuZGxlciBpbXBsZW1lbnRzIEh0dHBIYW5kbGVyIHtcbiAgcHJpdmF0ZSBjaGFpbjogSHR0cEhhbmRsZXJ8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiYWNrZW5kOiBIdHRwQmFja2VuZCwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgaGFuZGxlKHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAodGhpcy5jaGFpbiA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gdGhpcy5pbmplY3Rvci5nZXQoSFRUUF9JTlRFUkNFUFRPUlMsIFtdKTtcbiAgICAgIHRoaXMuY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgKG5leHQsIGludGVyY2VwdG9yKSA9PiBuZXcgSHR0cEludGVyY2VwdG9ySGFuZGxlcihuZXh0LCBpbnRlcmNlcHRvciksIHRoaXMuYmFja2VuZCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNoYWluLmhhbmRsZShyZXEpO1xuICB9XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhbiBgSHR0cEhhbmRsZXJgIHRoYXQgYXBwbGllcyBhIGJ1bmNoIG9mIGBIdHRwSW50ZXJjZXB0b3Jgc1xuICogdG8gYSByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZSBnaXZlbiBgSHR0cEJhY2tlbmRgLlxuICpcbiAqIE1lYW50IHRvIGJlIHVzZWQgYXMgYSBmYWN0b3J5IGZ1bmN0aW9uIHdpdGhpbiBgSHR0cENsaWVudE1vZHVsZWAuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludGVyY2VwdGluZ0hhbmRsZXIoXG4gICAgYmFja2VuZDogSHR0cEJhY2tlbmQsIGludGVyY2VwdG9yczogSHR0cEludGVyY2VwdG9yW10gfCBudWxsID0gW10pOiBIdHRwSGFuZGxlciB7XG4gIGlmICghaW50ZXJjZXB0b3JzKSB7XG4gICAgcmV0dXJuIGJhY2tlbmQ7XG4gIH1cbiAgcmV0dXJuIGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgIChuZXh0LCBpbnRlcmNlcHRvcikgPT4gbmV3IEh0dHBJbnRlcmNlcHRvckhhbmRsZXIobmV4dCwgaW50ZXJjZXB0b3IpLCBiYWNrZW5kKTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGVyZSB0byBzdG9yZSBKU09OUCBjYWxsYmFja3MuXG4gKlxuICogT3JkaW5hcmlseSBKU09OUCBjYWxsYmFja3MgYXJlIHN0b3JlZCBvbiB0aGUgYHdpbmRvd2Agb2JqZWN0LCBidXQgdGhpcyBtYXkgbm90IGV4aXN0XG4gKiBpbiB0ZXN0IGVudmlyb25tZW50cy4gSW4gdGhhdCBjYXNlLCBjYWxsYmFja3MgYXJlIHN0b3JlZCBvbiBhbiBhbm9ueW1vdXMgb2JqZWN0IGluc3RlYWQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpzb25wQ2FsbGJhY2tDb250ZXh0KCk6IE9iamVjdCB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cbiAgcmV0dXJuIHt9O1xufVxuXG4vKipcbiAqIGBOZ01vZHVsZWAgd2hpY2ggYWRkcyBYU1JGIHByb3RlY3Rpb24gc3VwcG9ydCB0byBvdXRnb2luZyByZXF1ZXN0cy5cbiAqXG4gKiBQcm92aWRlZCB0aGUgc2VydmVyIHN1cHBvcnRzIGEgY29va2llLWJhc2VkIFhTUkYgcHJvdGVjdGlvbiBzeXN0ZW0sIHRoaXNcbiAqIG1vZHVsZSBjYW4gYmUgdXNlZCBkaXJlY3RseSB0byBjb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uIHdpdGggdGhlIGNvcnJlY3RcbiAqIGNvb2tpZSBhbmQgaGVhZGVyIG5hbWVzLlxuICpcbiAqIElmIG5vIHN1Y2ggbmFtZXMgYXJlIHByb3ZpZGVkLCB0aGUgZGVmYXVsdCBpcyB0byB1c2UgYFgtWFNSRi1UT0tFTmAgZm9yXG4gKiB0aGUgaGVhZGVyIG5hbWUgYW5kIGBYU1JGLVRPS0VOYCBmb3IgdGhlIGNvb2tpZSBuYW1lLlxuICpcbiAqXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBYc3JmSW50ZXJjZXB0b3IsXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VFeGlzdGluZzogSHR0cFhzcmZJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICAgIHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogJ1hTUkYtVE9LRU4nfSxcbiAgICB7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6ICdYLVhTUkYtVE9LRU4nfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFhzcmZNb2R1bGUge1xuICAvKipcbiAgICogRGlzYWJsZSB0aGUgZGVmYXVsdCBYU1JGIHByb3RlY3Rpb24uXG4gICAqL1xuICBzdGF0aWMgZGlzYWJsZSgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtwcm92aWRlOiBIdHRwWHNyZkludGVyY2VwdG9yLCB1c2VDbGFzczogTm9vcEludGVyY2VwdG9yfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uIHRvIHVzZSB0aGUgZ2l2ZW4gY29va2llIG5hbWUgb3IgaGVhZGVyIG5hbWUsXG4gICAqIG9yIHRoZSBkZWZhdWx0IG5hbWVzIChhcyBkZXNjcmliZWQgYWJvdmUpIGlmIG5vdCBwcm92aWRlZC5cbiAgICovXG4gIHN0YXRpYyB3aXRoT3B0aW9ucyhvcHRpb25zOiB7XG4gICAgY29va2llTmFtZT86IHN0cmluZyxcbiAgICBoZWFkZXJOYW1lPzogc3RyaW5nLFxuICB9ID0ge30pOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIG9wdGlvbnMuY29va2llTmFtZSA/IHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogb3B0aW9ucy5jb29raWVOYW1lfSA6IFtdLFxuICAgICAgICBvcHRpb25zLmhlYWRlck5hbWUgPyB7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6IG9wdGlvbnMuaGVhZGVyTmFtZX0gOiBbXSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIGBOZ01vZHVsZWAgd2hpY2ggcHJvdmlkZXMgdGhlIGBIdHRwQ2xpZW50YCBhbmQgYXNzb2NpYXRlZCBzZXJ2aWNlcy5cbiAqXG4gKiBJbnRlcmNlcHRvcnMgY2FuIGJlIGFkZGVkIHRvIHRoZSBjaGFpbiBiZWhpbmQgYEh0dHBDbGllbnRgIGJ5IGJpbmRpbmcgdGhlbVxuICogdG8gdGhlIG11bHRpcHJvdmlkZXIgZm9yIGBIVFRQX0lOVEVSQ0VQVE9SU2AuXG4gKlxuICpcbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRYc3JmTW9kdWxlLndpdGhPcHRpb25zKHtcbiAgICAgIGNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgICAgIGhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuICAgIH0pLFxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICBIdHRwQ2xpZW50LFxuICAgIHtwcm92aWRlOiBIdHRwSGFuZGxlciwgdXNlQ2xhc3M6IEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyfSxcbiAgICBIdHRwWGhyQmFja2VuZCxcbiAgICB7cHJvdmlkZTogSHR0cEJhY2tlbmQsIHVzZUV4aXN0aW5nOiBIdHRwWGhyQmFja2VuZH0sXG4gICAgQnJvd3NlclhocixcbiAgICB7cHJvdmlkZTogWGhyRmFjdG9yeSwgdXNlRXhpc3Rpbmc6IEJyb3dzZXJYaHJ9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50TW9kdWxlIHtcbn1cblxuLyoqXG4gKiBgTmdNb2R1bGVgIHdoaWNoIGVuYWJsZXMgSlNPTlAgc3VwcG9ydCBpbiBgSHR0cENsaWVudGAuXG4gKlxuICogV2l0aG91dCB0aGlzIG1vZHVsZSwgSnNvbnAgcmVxdWVzdHMgd2lsbCByZWFjaCB0aGUgYmFja2VuZFxuICogd2l0aCBtZXRob2QgSlNPTlAsIHdoZXJlIHRoZXknbGwgYmUgcmVqZWN0ZWQuXG4gKlxuICpcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgSnNvbnBDbGllbnRCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBKc29ucENhbGxiYWNrQ29udGV4dCwgdXNlRmFjdG9yeToganNvbnBDYWxsYmFja0NvbnRleHR9LFxuICAgIHtwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUywgdXNlQ2xhc3M6IEpzb25wSW50ZXJjZXB0b3IsIG11bHRpOiB0cnVlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudEpzb25wTW9kdWxlIHtcbn1cbiJdfQ==