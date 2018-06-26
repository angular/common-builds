/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Injectable, Injector, NgModule } from '@angular/core';
import { HttpBackend, HttpHandler } from './backend';
import { HttpClient } from './client';
import { HTTP_INTERCEPTORS, HttpInterceptorHandler, NoopInterceptor } from './interceptor';
import { JsonpCallbackContext, JsonpClientBackend, JsonpInterceptor } from './jsonp';
import { BrowserXhr, HttpXhrBackend, XhrFactory } from './xhr';
import { HttpXsrfCookieExtractor, HttpXsrfInterceptor, HttpXsrfTokenExtractor, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from './xsrf';
/**
 * An injectable `HttpHandler` that applies multiple interceptors
 * to a request before passing it to the given `HttpBackend`.
 *
 * The interceptors are loaded lazily from the injector, to allow
 * interceptors to themselves inject classes depending indirectly
 * on `HttpInterceptingHandler` itself.
 * @see `HttpInterceptor`
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
    HttpInterceptingHandler = tslib_1.__decorate([
        Injectable(),
        tslib_1.__metadata("design:paramtypes", [HttpBackend, Injector])
    ], HttpInterceptingHandler);
    return HttpInterceptingHandler;
}());
export { HttpInterceptingHandler };
/**
 * Constructs an `HttpHandler` that applies interceptors
 * to a request before passing it to the given `HttpBackend`.
 *
 * Use as a factory function within `HttpClientModule`.
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
 * An NgModule that adds XSRF protection support to outgoing requests.
 *
 * For a server that supports a cookie-based XSRF protection system,
 * use directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no names are supplied, the default cookie name is `XSRF-TOKEN`
 * and the default header name is `X-XSRF-TOKEN`.
 *
 *
 */
var HttpClientXsrfModule = /** @class */ (function () {
    function HttpClientXsrfModule() {
    }
    HttpClientXsrfModule_1 = HttpClientXsrfModule;
    /**
     * Disable the default XSRF protection.
     */
    HttpClientXsrfModule.disable = function () {
        return {
            ngModule: HttpClientXsrfModule_1,
            providers: [
                { provide: HttpXsrfInterceptor, useClass: NoopInterceptor },
            ],
        };
    };
    /**
     * Configure XSRF protection.
     * @param options An object that can specify either or both
     * cookie name or header name.
     * - Cookie name default is `XSRF-TOKEN`.
     * - Header name default is `X-XSRF-TOKEN`.
     *
     */
    HttpClientXsrfModule.withOptions = function (options) {
        if (options === void 0) { options = {}; }
        return {
            ngModule: HttpClientXsrfModule_1,
            providers: [
                options.cookieName ? { provide: XSRF_COOKIE_NAME, useValue: options.cookieName } : [],
                options.headerName ? { provide: XSRF_HEADER_NAME, useValue: options.headerName } : [],
            ],
        };
    };
    HttpClientXsrfModule = HttpClientXsrfModule_1 = tslib_1.__decorate([
        NgModule({
            providers: [
                HttpXsrfInterceptor,
                { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
                { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
                { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
                { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
            ],
        })
    ], HttpClientXsrfModule);
    return HttpClientXsrfModule;
    var HttpClientXsrfModule_1;
}());
export { HttpClientXsrfModule };
/**
 * An NgModule that provides the `HttpClient` and associated services.
 *
 * Interceptors can be added to the chain behind `HttpClient` by binding them
 * to the multiprovider for `HTTP_INTERCEPTORS`.
 *
 *
 */
var HttpClientModule = /** @class */ (function () {
    function HttpClientModule() {
    }
    HttpClientModule = tslib_1.__decorate([
        NgModule({
            /**
             * Optional configuration for XSRF protection.
             */
            imports: [
                HttpClientXsrfModule.withOptions({
                    cookieName: 'XSRF-TOKEN',
                    headerName: 'X-XSRF-TOKEN',
                }),
            ],
            /**
             * The module provides `HttpClient` itself, and supporting services.
             */
            providers: [
                HttpClient,
                { provide: HttpHandler, useClass: HttpInterceptingHandler },
                HttpXhrBackend,
                { provide: HttpBackend, useExisting: HttpXhrBackend },
                BrowserXhr,
                { provide: XhrFactory, useExisting: BrowserXhr },
            ],
        })
    ], HttpClientModule);
    return HttpClientModule;
}());
export { HttpClientModule };
/**
 * An NgModule that enables JSONP support in `HttpClient`.
 *
 * Without this module, Jsonp requests will reach the backend
 * with method JSONP, where they'll be rejected.
 *
 *
 */
var HttpClientJsonpModule = /** @class */ (function () {
    function HttpClientJsonpModule() {
    }
    HttpClientJsonpModule = tslib_1.__decorate([
        NgModule({
            providers: [
                JsonpClientBackend,
                { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
                { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
            ],
        })
    ], HttpClientJsonpModule);
    return HttpClientJsonpModule;
}());
export { HttpClientJsonpModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQXVCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdsRixPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNuRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxpQkFBaUIsRUFBbUIsc0JBQXNCLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFHLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUduRixPQUFPLEVBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDN0QsT0FBTyxFQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRWhJOzs7Ozs7OztHQVFHO0FBRUg7SUFHRSxpQ0FBb0IsT0FBb0IsRUFBVSxRQUFrQjtRQUFoRCxZQUFPLEdBQVAsT0FBTyxDQUFhO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUY1RCxVQUFLLEdBQXFCLElBQUksQ0FBQztJQUVnQyxDQUFDO0lBRXhFLHdDQUFNLEdBQU4sVUFBTyxHQUFxQjtRQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlE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RUFBRSxZQUFZO29CQUN4QixVQUFVLEVBQUUsY0FBYztpQkFDM0IsQ0FBQzthQUNIO1lBQ0Q7O2VBRUc7WUFDSCxTQUFTLEVBQUU7Z0JBQ1QsVUFBVTtnQkFDVixFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFDO2dCQUN6RCxjQUFjO2dCQUNkLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFDO2dCQUNuRCxVQUFVO2dCQUNWLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDO2FBQy9DO1NBQ0YsQ0FBQztPQUNXLGdCQUFnQixDQUM1QjtJQUFELHVCQUFDO0NBQUEsQUFERCxJQUNDO1NBRFksZ0JBQWdCO0FBRzdCOzs7Ozs7O0dBT0c7QUFRSDtJQUFBO0lBQ0EsQ0FBQztJQURZLHFCQUFxQjtRQVBqQyxRQUFRLENBQUM7WUFDUixTQUFTLEVBQUU7Z0JBQ1Qsa0JBQWtCO2dCQUNsQixFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUM7Z0JBQ2pFLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO2FBQ3RFO1NBQ0YsQ0FBQztPQUNXLHFCQUFxQixDQUNqQztJQUFELDRCQUFDO0NBQUEsQUFERCxJQUNDO1NBRFkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdG9yLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cENsaWVudH0gZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHtIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cEludGVyY2VwdG9yLCBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyLCBOb29wSW50ZXJjZXB0b3J9IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtKc29ucENhbGxiYWNrQ29udGV4dCwgSnNvbnBDbGllbnRCYWNrZW5kLCBKc29ucEludGVyY2VwdG9yfSBmcm9tICcuL2pzb25wJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5pbXBvcnQge0Jyb3dzZXJYaHIsIEh0dHBYaHJCYWNrZW5kLCBYaHJGYWN0b3J5fSBmcm9tICcuL3hocic7XG5pbXBvcnQge0h0dHBYc3JmQ29va2llRXh0cmFjdG9yLCBIdHRwWHNyZkludGVyY2VwdG9yLCBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCBYU1JGX0NPT0tJRV9OQU1FLCBYU1JGX0hFQURFUl9OQU1FfSBmcm9tICcuL3hzcmYnO1xuXG4vKipcbiAqIEFuIGluamVjdGFibGUgYEh0dHBIYW5kbGVyYCB0aGF0IGFwcGxpZXMgbXVsdGlwbGUgaW50ZXJjZXB0b3JzXG4gKiB0byBhIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlIGdpdmVuIGBIdHRwQmFja2VuZGAuXG4gKlxuICogVGhlIGludGVyY2VwdG9ycyBhcmUgbG9hZGVkIGxhemlseSBmcm9tIHRoZSBpbmplY3RvciwgdG8gYWxsb3dcbiAqIGludGVyY2VwdG9ycyB0byB0aGVtc2VsdmVzIGluamVjdCBjbGFzc2VzIGRlcGVuZGluZyBpbmRpcmVjdGx5XG4gKiBvbiBgSHR0cEludGVyY2VwdGluZ0hhbmRsZXJgIGl0c2VsZi5cbiAqIEBzZWUgYEh0dHBJbnRlcmNlcHRvcmBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyIGltcGxlbWVudHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBIdHRwSGFuZGxlcnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge31cblxuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSB0aGlzLmluamVjdG9yLmdldChIVFRQX0lOVEVSQ0VQVE9SUywgW10pO1xuICAgICAgdGhpcy5jaGFpbiA9IGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgICAgICAobmV4dCwgaW50ZXJjZXB0b3IpID0+IG5ldyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyKG5leHQsIGludGVyY2VwdG9yKSwgdGhpcy5iYWNrZW5kKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4uaGFuZGxlKHJlcSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIGBIdHRwSGFuZGxlcmAgdGhhdCBhcHBsaWVzIGludGVyY2VwdG9yc1xuICogdG8gYSByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZSBnaXZlbiBgSHR0cEJhY2tlbmRgLlxuICpcbiAqIFVzZSBhcyBhIGZhY3RvcnkgZnVuY3Rpb24gd2l0aGluIGBIdHRwQ2xpZW50TW9kdWxlYC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJjZXB0aW5nSGFuZGxlcihcbiAgICBiYWNrZW5kOiBIdHRwQmFja2VuZCwgaW50ZXJjZXB0b3JzOiBIdHRwSW50ZXJjZXB0b3JbXSB8IG51bGwgPSBbXSk6IEh0dHBIYW5kbGVyIHtcbiAgaWYgKCFpbnRlcmNlcHRvcnMpIHtcbiAgICByZXR1cm4gYmFja2VuZDtcbiAgfVxuICByZXR1cm4gaW50ZXJjZXB0b3JzLnJlZHVjZVJpZ2h0KFxuICAgICAgKG5leHQsIGludGVyY2VwdG9yKSA9PiBuZXcgSHR0cEludGVyY2VwdG9ySGFuZGxlcihuZXh0LCBpbnRlcmNlcHRvciksIGJhY2tlbmQpO1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXJlIHRvIHN0b3JlIEpTT05QIGNhbGxiYWNrcy5cbiAqXG4gKiBPcmRpbmFyaWx5IEpTT05QIGNhbGxiYWNrcyBhcmUgc3RvcmVkIG9uIHRoZSBgd2luZG93YCBvYmplY3QsIGJ1dCB0aGlzIG1heSBub3QgZXhpc3RcbiAqIGluIHRlc3QgZW52aXJvbm1lbnRzLiBJbiB0aGF0IGNhc2UsIGNhbGxiYWNrcyBhcmUgc3RvcmVkIG9uIGFuIGFub255bW91cyBvYmplY3QgaW5zdGVhZC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24ganNvbnBDYWxsYmFja0NvbnRleHQoKTogT2JqZWN0IHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuICByZXR1cm4ge307XG59XG5cbi8qKlxuICogQW4gTmdNb2R1bGUgdGhhdCBhZGRzIFhTUkYgcHJvdGVjdGlvbiBzdXBwb3J0IHRvIG91dGdvaW5nIHJlcXVlc3RzLlxuICpcbiAqIEZvciBhIHNlcnZlciB0aGF0IHN1cHBvcnRzIGEgY29va2llLWJhc2VkIFhTUkYgcHJvdGVjdGlvbiBzeXN0ZW0sXG4gKiB1c2UgZGlyZWN0bHkgdG8gY29uZmlndXJlIFhTUkYgcHJvdGVjdGlvbiB3aXRoIHRoZSBjb3JyZWN0XG4gKiBjb29raWUgYW5kIGhlYWRlciBuYW1lcy5cbiAqXG4gKiBJZiBubyBuYW1lcyBhcmUgc3VwcGxpZWQsIHRoZSBkZWZhdWx0IGNvb2tpZSBuYW1lIGlzIGBYU1JGLVRPS0VOYFxuICogYW5kIHRoZSBkZWZhdWx0IGhlYWRlciBuYW1lIGlzIGBYLVhTUkYtVE9LRU5gLlxuICpcbiAqXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBYc3JmSW50ZXJjZXB0b3IsXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VFeGlzdGluZzogSHR0cFhzcmZJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICAgIHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogJ1hTUkYtVE9LRU4nfSxcbiAgICB7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6ICdYLVhTUkYtVE9LRU4nfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFhzcmZNb2R1bGUge1xuICAvKipcbiAgICogRGlzYWJsZSB0aGUgZGVmYXVsdCBYU1JGIHByb3RlY3Rpb24uXG4gICAqL1xuICBzdGF0aWMgZGlzYWJsZSgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtwcm92aWRlOiBIdHRwWHNyZkludGVyY2VwdG9yLCB1c2VDbGFzczogTm9vcEludGVyY2VwdG9yfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBjYW4gc3BlY2lmeSBlaXRoZXIgb3IgYm90aFxuICAgKiBjb29raWUgbmFtZSBvciBoZWFkZXIgbmFtZS5cbiAgICogLSBDb29raWUgbmFtZSBkZWZhdWx0IGlzIGBYU1JGLVRPS0VOYC5cbiAgICogLSBIZWFkZXIgbmFtZSBkZWZhdWx0IGlzIGBYLVhTUkYtVE9LRU5gLlxuICAgKlxuICAgKi9cbiAgc3RhdGljIHdpdGhPcHRpb25zKG9wdGlvbnM6IHtcbiAgICBjb29raWVOYW1lPzogc3RyaW5nLFxuICAgIGhlYWRlck5hbWU/OiBzdHJpbmcsXG4gIH0gPSB7fSk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgb3B0aW9ucy5jb29raWVOYW1lID8ge3Byb3ZpZGU6IFhTUkZfQ09PS0lFX05BTUUsIHVzZVZhbHVlOiBvcHRpb25zLmNvb2tpZU5hbWV9IDogW10sXG4gICAgICAgIG9wdGlvbnMuaGVhZGVyTmFtZSA/IHtwcm92aWRlOiBYU1JGX0hFQURFUl9OQU1FLCB1c2VWYWx1ZTogb3B0aW9ucy5oZWFkZXJOYW1lfSA6IFtdLFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQW4gTmdNb2R1bGUgdGhhdCBwcm92aWRlcyB0aGUgYEh0dHBDbGllbnRgIGFuZCBhc3NvY2lhdGVkIHNlcnZpY2VzLlxuICpcbiAqIEludGVyY2VwdG9ycyBjYW4gYmUgYWRkZWQgdG8gdGhlIGNoYWluIGJlaGluZCBgSHR0cENsaWVudGAgYnkgYmluZGluZyB0aGVtXG4gKiB0byB0aGUgbXVsdGlwcm92aWRlciBmb3IgYEhUVFBfSU5URVJDRVBUT1JTYC5cbiAqXG4gKlxuICovXG5ATmdNb2R1bGUoe1xuICAvKipcbiAgICogT3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgWFNSRiBwcm90ZWN0aW9uLlxuICAgKi9cbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRYc3JmTW9kdWxlLndpdGhPcHRpb25zKHtcbiAgICAgIGNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgICAgIGhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuICAgIH0pLFxuICBdLFxuICAvKipcbiAgICogVGhlIG1vZHVsZSBwcm92aWRlcyBgSHR0cENsaWVudGAgaXRzZWxmLCBhbmQgc3VwcG9ydGluZyBzZXJ2aWNlcy5cbiAgICovXG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBDbGllbnQsXG4gICAge3Byb3ZpZGU6IEh0dHBIYW5kbGVyLCB1c2VDbGFzczogSHR0cEludGVyY2VwdGluZ0hhbmRsZXJ9LFxuICAgIEh0dHBYaHJCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBIdHRwQmFja2VuZCwgdXNlRXhpc3Rpbmc6IEh0dHBYaHJCYWNrZW5kfSxcbiAgICBCcm93c2VyWGhyLFxuICAgIHtwcm92aWRlOiBYaHJGYWN0b3J5LCB1c2VFeGlzdGluZzogQnJvd3Nlclhocn0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRNb2R1bGUge1xufVxuXG4vKipcbiAqIEFuIE5nTW9kdWxlIHRoYXQgZW5hYmxlcyBKU09OUCBzdXBwb3J0IGluIGBIdHRwQ2xpZW50YC5cbiAqXG4gKiBXaXRob3V0IHRoaXMgbW9kdWxlLCBKc29ucCByZXF1ZXN0cyB3aWxsIHJlYWNoIHRoZSBiYWNrZW5kXG4gKiB3aXRoIG1ldGhvZCBKU09OUCwgd2hlcmUgdGhleSdsbCBiZSByZWplY3RlZC5cbiAqXG4gKlxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBKc29ucENsaWVudEJhY2tlbmQsXG4gICAge3Byb3ZpZGU6IEpzb25wQ2FsbGJhY2tDb250ZXh0LCB1c2VGYWN0b3J5OiBqc29ucENhbGxiYWNrQ29udGV4dH0sXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VDbGFzczogSnNvbnBJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50SnNvbnBNb2R1bGUge1xufVxuIl19