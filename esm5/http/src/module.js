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
import * as i0 from "@angular/core";
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
    HttpInterceptingHandler.ngInjectableDef = i0.defineInjectable({ token: HttpInterceptingHandler, factory: function HttpInterceptingHandler_Factory(t) { return new (t || HttpInterceptingHandler)(i0.inject(HttpBackend), i0.inject(Injector)); }, providedIn: null });
    return HttpInterceptingHandler;
}());
export { HttpInterceptingHandler };
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpInterceptingHandler, [{
        type: Injectable
    }], function () { return [{
        type: HttpBackend
    }, {
        type: Injector
    }]; }, null);
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
 * Configures XSRF protection support for outgoing requests.
 *
 * For a server that supports a cookie-based XSRF protection system,
 * use directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no names are supplied, the default cookie name is `XSRF-TOKEN`
 * and the default header name is `X-XSRF-TOKEN`.
 *
 * @publicApi
 */
var HttpClientXsrfModule = /** @class */ (function () {
    function HttpClientXsrfModule() {
    }
    /**
     * Disable the default XSRF protection.
     */
    HttpClientXsrfModule.disable = function () {
        return {
            ngModule: HttpClientXsrfModule,
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
            ngModule: HttpClientXsrfModule,
            providers: [
                options.cookieName ? { provide: XSRF_COOKIE_NAME, useValue: options.cookieName } : [],
                options.headerName ? { provide: XSRF_HEADER_NAME, useValue: options.headerName } : [],
            ],
        };
    };
    HttpClientXsrfModule.ngModuleDef = i0.ɵdefineNgModule({ type: HttpClientXsrfModule });
    HttpClientXsrfModule.ngInjectorDef = i0.defineInjector({ factory: function HttpClientXsrfModule_Factory(t) { return new (t || HttpClientXsrfModule)(); }, providers: [
            HttpXsrfInterceptor,
            { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
            { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
            { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
            { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
        ], imports: [] });
    return HttpClientXsrfModule;
}());
export { HttpClientXsrfModule };
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpClientXsrfModule, [{
        type: NgModule,
        args: [{
                providers: [
                    HttpXsrfInterceptor,
                    { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
                    { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
                    { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
                    { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
                ],
            }]
    }], null, null);
/**
 * Configures the [dependency injector](guide/glossary#injector) for `HttpClient`
 * with supporting services for XSRF. Automatically imported by `HttpClientModule`.
 *
 * You can add interceptors to the chain behind `HttpClient` by binding them to the
 * multiprovider for built-in [DI token](guide/glossary#di-token) `HTTP_INTERCEPTORS`.
 *
 * @publicApi
 */
var HttpClientModule = /** @class */ (function () {
    function HttpClientModule() {
    }
    HttpClientModule.ngModuleDef = i0.ɵdefineNgModule({ type: HttpClientModule, imports: [HttpClientXsrfModule] });
    HttpClientModule.ngInjectorDef = i0.defineInjector({ factory: function HttpClientModule_Factory(t) { return new (t || HttpClientModule)(); }, providers: [
            HttpClient,
            { provide: HttpHandler, useClass: HttpInterceptingHandler },
            HttpXhrBackend,
            { provide: HttpBackend, useExisting: HttpXhrBackend },
            BrowserXhr,
            { provide: XhrFactory, useExisting: BrowserXhr },
        ], imports: [[
                HttpClientXsrfModule.withOptions({
                    cookieName: 'XSRF-TOKEN',
                    headerName: 'X-XSRF-TOKEN',
                }),
            ]] });
    return HttpClientModule;
}());
export { HttpClientModule };
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpClientModule, [{
        type: NgModule,
        args: [{
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
                 * Configures the [dependency injector](guide/glossary#injector) where it is imported
                 * with supporting services for HTTP communications.
                 */
                providers: [
                    HttpClient,
                    { provide: HttpHandler, useClass: HttpInterceptingHandler },
                    HttpXhrBackend,
                    { provide: HttpBackend, useExisting: HttpXhrBackend },
                    BrowserXhr,
                    { provide: XhrFactory, useExisting: BrowserXhr },
                ],
            }]
    }], null, null);
/**
 * Configures the [dependency injector](guide/glossary#injector) for `HttpClient`
 * with supporting services for JSONP.
 * Without this module, Jsonp requests reach the backend
 * with method JSONP, where they are rejected.
 *
 * You can add interceptors to the chain behind `HttpClient` by binding them to the
 * multiprovider for built-in [DI token](guide/glossary#di-token) `HTTP_INTERCEPTORS`.
 *
 * @publicApi
 */
var HttpClientJsonpModule = /** @class */ (function () {
    function HttpClientJsonpModule() {
    }
    HttpClientJsonpModule.ngModuleDef = i0.ɵdefineNgModule({ type: HttpClientJsonpModule });
    HttpClientJsonpModule.ngInjectorDef = i0.defineInjector({ factory: function HttpClientJsonpModule_Factory(t) { return new (t || HttpClientJsonpModule)(); }, providers: [
            JsonpClientBackend,
            { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
            { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
        ], imports: [] });
    return HttpClientJsonpModule;
}());
export { HttpClientJsonpModule };
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpClientJsonpModule, [{
        type: NgModule,
        args: [{
                providers: [
                    JsonpClientBackend,
                    { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
                    { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
                ],
            }]
    }], null, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBdUIsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2xGLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ25ELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFDLGlCQUFpQixFQUFtQixzQkFBc0IsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUcsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR25GLE9BQU8sRUFBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM3RCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRWhJOzs7Ozs7OztHQVFHO0FBQ0g7SUFJRSxpQ0FBb0IsT0FBb0IsRUFBVSxRQUFrQjtRQUFoRCxZQUFPLEdBQVAsT0FBTyxDQUFhO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUY1RCxVQUFLLEdBQXFCLElBQUksQ0FBQztJQUVnQyxDQUFDO0lBRXhFLHdDQUFNLEdBQU4sVUFBTyxHQUFxQjtRQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlE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QU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBQztpQkFDL0M7YUFDRjs7QUFJRDs7Ozs7Ozs7OztHQVVHO0FBQ0g7SUFBQTtLQVFDO21FQURZLHFCQUFxQjtvSUFBckIscUJBQXFCLG1CQU5yQjtZQUNULGtCQUFrQjtZQUNsQixFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUM7WUFDakUsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7U0FDdEU7Z0NBeExIO0NBMkxDLEFBUkQsSUFRQztTQURZLHFCQUFxQjttQ0FBckIscUJBQXFCO2NBUGpDLFFBQVE7ZUFBQztnQkFDUixTQUFTLEVBQUU7b0JBQ1Qsa0JBQWtCO29CQUNsQixFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUM7b0JBQ2pFLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO2lCQUN0RTthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdG9yLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cENsaWVudH0gZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHtIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cEludGVyY2VwdG9yLCBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyLCBOb29wSW50ZXJjZXB0b3J9IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtKc29ucENhbGxiYWNrQ29udGV4dCwgSnNvbnBDbGllbnRCYWNrZW5kLCBKc29ucEludGVyY2VwdG9yfSBmcm9tICcuL2pzb25wJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5pbXBvcnQge0Jyb3dzZXJYaHIsIEh0dHBYaHJCYWNrZW5kLCBYaHJGYWN0b3J5fSBmcm9tICcuL3hocic7XG5pbXBvcnQge0h0dHBYc3JmQ29va2llRXh0cmFjdG9yLCBIdHRwWHNyZkludGVyY2VwdG9yLCBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCBYU1JGX0NPT0tJRV9OQU1FLCBYU1JGX0hFQURFUl9OQU1FfSBmcm9tICcuL3hzcmYnO1xuXG4vKipcbiAqIEFuIGluamVjdGFibGUgYEh0dHBIYW5kbGVyYCB0aGF0IGFwcGxpZXMgbXVsdGlwbGUgaW50ZXJjZXB0b3JzXG4gKiB0byBhIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlIGdpdmVuIGBIdHRwQmFja2VuZGAuXG4gKlxuICogVGhlIGludGVyY2VwdG9ycyBhcmUgbG9hZGVkIGxhemlseSBmcm9tIHRoZSBpbmplY3RvciwgdG8gYWxsb3dcbiAqIGludGVyY2VwdG9ycyB0byB0aGVtc2VsdmVzIGluamVjdCBjbGFzc2VzIGRlcGVuZGluZyBpbmRpcmVjdGx5XG4gKiBvbiBgSHR0cEludGVyY2VwdGluZ0hhbmRsZXJgIGl0c2VsZi5cbiAqIEBzZWUgYEh0dHBJbnRlcmNlcHRvcmBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyIGltcGxlbWVudHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBIdHRwSGFuZGxlcnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge31cblxuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSB0aGlzLmluamVjdG9yLmdldChIVFRQX0lOVEVSQ0VQVE9SUywgW10pO1xuICAgICAgdGhpcy5jaGFpbiA9IGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgICAgICAobmV4dCwgaW50ZXJjZXB0b3IpID0+IG5ldyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyKG5leHQsIGludGVyY2VwdG9yKSwgdGhpcy5iYWNrZW5kKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4uaGFuZGxlKHJlcSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIGBIdHRwSGFuZGxlcmAgdGhhdCBhcHBsaWVzIGludGVyY2VwdG9yc1xuICogdG8gYSByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZSBnaXZlbiBgSHR0cEJhY2tlbmRgLlxuICpcbiAqIFVzZSBhcyBhIGZhY3RvcnkgZnVuY3Rpb24gd2l0aGluIGBIdHRwQ2xpZW50TW9kdWxlYC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJjZXB0aW5nSGFuZGxlcihcbiAgICBiYWNrZW5kOiBIdHRwQmFja2VuZCwgaW50ZXJjZXB0b3JzOiBIdHRwSW50ZXJjZXB0b3JbXSB8IG51bGwgPSBbXSk6IEh0dHBIYW5kbGVyIHtcbiAgaWYgKCFpbnRlcmNlcHRvcnMpIHtcbiAgICByZXR1cm4gYmFja2VuZDtcbiAgfVxuICByZXR1cm4gaW50ZXJjZXB0b3JzLnJlZHVjZVJpZ2h0KFxuICAgICAgKG5leHQsIGludGVyY2VwdG9yKSA9PiBuZXcgSHR0cEludGVyY2VwdG9ySGFuZGxlcihuZXh0LCBpbnRlcmNlcHRvciksIGJhY2tlbmQpO1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXJlIHRvIHN0b3JlIEpTT05QIGNhbGxiYWNrcy5cbiAqXG4gKiBPcmRpbmFyaWx5IEpTT05QIGNhbGxiYWNrcyBhcmUgc3RvcmVkIG9uIHRoZSBgd2luZG93YCBvYmplY3QsIGJ1dCB0aGlzIG1heSBub3QgZXhpc3RcbiAqIGluIHRlc3QgZW52aXJvbm1lbnRzLiBJbiB0aGF0IGNhc2UsIGNhbGxiYWNrcyBhcmUgc3RvcmVkIG9uIGFuIGFub255bW91cyBvYmplY3QgaW5zdGVhZC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24ganNvbnBDYWxsYmFja0NvbnRleHQoKTogT2JqZWN0IHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuICByZXR1cm4ge307XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBYU1JGIHByb3RlY3Rpb24gc3VwcG9ydCBmb3Igb3V0Z29pbmcgcmVxdWVzdHMuXG4gKlxuICogRm9yIGEgc2VydmVyIHRoYXQgc3VwcG9ydHMgYSBjb29raWUtYmFzZWQgWFNSRiBwcm90ZWN0aW9uIHN5c3RlbSxcbiAqIHVzZSBkaXJlY3RseSB0byBjb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uIHdpdGggdGhlIGNvcnJlY3RcbiAqIGNvb2tpZSBhbmQgaGVhZGVyIG5hbWVzLlxuICpcbiAqIElmIG5vIG5hbWVzIGFyZSBzdXBwbGllZCwgdGhlIGRlZmF1bHQgY29va2llIG5hbWUgaXMgYFhTUkYtVE9LRU5gXG4gKiBhbmQgdGhlIGRlZmF1bHQgaGVhZGVyIG5hbWUgaXMgYFgtWFNSRi1UT0tFTmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBIdHRwWHNyZkludGVyY2VwdG9yLFxuICAgIHtwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUywgdXNlRXhpc3Rpbmc6IEh0dHBYc3JmSW50ZXJjZXB0b3IsIG11bHRpOiB0cnVlfSxcbiAgICB7cHJvdmlkZTogSHR0cFhzcmZUb2tlbkV4dHJhY3RvciwgdXNlQ2xhc3M6IEh0dHBYc3JmQ29va2llRXh0cmFjdG9yfSxcbiAgICB7cHJvdmlkZTogWFNSRl9DT09LSUVfTkFNRSwgdXNlVmFsdWU6ICdYU1JGLVRPS0VOJ30sXG4gICAge3Byb3ZpZGU6IFhTUkZfSEVBREVSX05BTUUsIHVzZVZhbHVlOiAnWC1YU1JGLVRPS0VOJ30sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRYc3JmTW9kdWxlIHtcbiAgLyoqXG4gICAqIERpc2FibGUgdGhlIGRlZmF1bHQgWFNSRiBwcm90ZWN0aW9uLlxuICAgKi9cbiAgc3RhdGljIGRpc2FibGUoKTogTW9kdWxlV2l0aFByb3ZpZGVyczxIdHRwQ2xpZW50WHNyZk1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge3Byb3ZpZGU6IEh0dHBYc3JmSW50ZXJjZXB0b3IsIHVzZUNsYXNzOiBOb29wSW50ZXJjZXB0b3J9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSBYU1JGIHByb3RlY3Rpb24uXG4gICAqIEBwYXJhbSBvcHRpb25zIEFuIG9iamVjdCB0aGF0IGNhbiBzcGVjaWZ5IGVpdGhlciBvciBib3RoXG4gICAqIGNvb2tpZSBuYW1lIG9yIGhlYWRlciBuYW1lLlxuICAgKiAtIENvb2tpZSBuYW1lIGRlZmF1bHQgaXMgYFhTUkYtVE9LRU5gLlxuICAgKiAtIEhlYWRlciBuYW1lIGRlZmF1bHQgaXMgYFgtWFNSRi1UT0tFTmAuXG4gICAqXG4gICAqL1xuICBzdGF0aWMgd2l0aE9wdGlvbnMob3B0aW9uczoge1xuICAgIGNvb2tpZU5hbWU/OiBzdHJpbmcsXG4gICAgaGVhZGVyTmFtZT86IHN0cmluZyxcbiAgfSA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxIdHRwQ2xpZW50WHNyZk1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgb3B0aW9ucy5jb29raWVOYW1lID8ge3Byb3ZpZGU6IFhTUkZfQ09PS0lFX05BTUUsIHVzZVZhbHVlOiBvcHRpb25zLmNvb2tpZU5hbWV9IDogW10sXG4gICAgICAgIG9wdGlvbnMuaGVhZGVyTmFtZSA/IHtwcm92aWRlOiBYU1JGX0hFQURFUl9OQU1FLCB1c2VWYWx1ZTogb3B0aW9ucy5oZWFkZXJOYW1lfSA6IFtdLFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgW2RlcGVuZGVuY3kgaW5qZWN0b3JdKGd1aWRlL2dsb3NzYXJ5I2luamVjdG9yKSBmb3IgYEh0dHBDbGllbnRgXG4gKiB3aXRoIHN1cHBvcnRpbmcgc2VydmljZXMgZm9yIFhTUkYuIEF1dG9tYXRpY2FsbHkgaW1wb3J0ZWQgYnkgYEh0dHBDbGllbnRNb2R1bGVgLlxuICpcbiAqIFlvdSBjYW4gYWRkIGludGVyY2VwdG9ycyB0byB0aGUgY2hhaW4gYmVoaW5kIGBIdHRwQ2xpZW50YCBieSBiaW5kaW5nIHRoZW0gdG8gdGhlXG4gKiBtdWx0aXByb3ZpZGVyIGZvciBidWlsdC1pbiBbREkgdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuKSBgSFRUUF9JTlRFUkNFUFRPUlNgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgLyoqXG4gICAqIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gZm9yIFhTUkYgcHJvdGVjdGlvbi5cbiAgICovXG4gIGltcG9ydHM6IFtcbiAgICBIdHRwQ2xpZW50WHNyZk1vZHVsZS53aXRoT3B0aW9ucyh7XG4gICAgICBjb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gICAgICBoZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcbiAgICB9KSxcbiAgXSxcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIFtkZXBlbmRlbmN5IGluamVjdG9yXShndWlkZS9nbG9zc2FyeSNpbmplY3Rvcikgd2hlcmUgaXQgaXMgaW1wb3J0ZWRcbiAgICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBIVFRQIGNvbW11bmljYXRpb25zLlxuICAgKi9cbiAgcHJvdmlkZXJzOiBbXG4gICAgSHR0cENsaWVudCxcbiAgICB7cHJvdmlkZTogSHR0cEhhbmRsZXIsIHVzZUNsYXNzOiBIdHRwSW50ZXJjZXB0aW5nSGFuZGxlcn0sXG4gICAgSHR0cFhockJhY2tlbmQsXG4gICAge3Byb3ZpZGU6IEh0dHBCYWNrZW5kLCB1c2VFeGlzdGluZzogSHR0cFhockJhY2tlbmR9LFxuICAgIEJyb3dzZXJYaHIsXG4gICAge3Byb3ZpZGU6IFhockZhY3RvcnksIHVzZUV4aXN0aW5nOiBCcm93c2VyWGhyfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudE1vZHVsZSB7XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgW2RlcGVuZGVuY3kgaW5qZWN0b3JdKGd1aWRlL2dsb3NzYXJ5I2luamVjdG9yKSBmb3IgYEh0dHBDbGllbnRgXG4gKiB3aXRoIHN1cHBvcnRpbmcgc2VydmljZXMgZm9yIEpTT05QLlxuICogV2l0aG91dCB0aGlzIG1vZHVsZSwgSnNvbnAgcmVxdWVzdHMgcmVhY2ggdGhlIGJhY2tlbmRcbiAqIHdpdGggbWV0aG9kIEpTT05QLCB3aGVyZSB0aGV5IGFyZSByZWplY3RlZC5cbiAqXG4gKiBZb3UgY2FuIGFkZCBpbnRlcmNlcHRvcnMgdG8gdGhlIGNoYWluIGJlaGluZCBgSHR0cENsaWVudGAgYnkgYmluZGluZyB0aGVtIHRvIHRoZVxuICogbXVsdGlwcm92aWRlciBmb3IgYnVpbHQtaW4gW0RJIHRva2VuXShndWlkZS9nbG9zc2FyeSNkaS10b2tlbikgYEhUVFBfSU5URVJDRVBUT1JTYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIEpzb25wQ2xpZW50QmFja2VuZCxcbiAgICB7cHJvdmlkZTogSnNvbnBDYWxsYmFja0NvbnRleHQsIHVzZUZhY3Rvcnk6IGpzb25wQ2FsbGJhY2tDb250ZXh0fSxcbiAgICB7cHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsIHVzZUNsYXNzOiBKc29ucEludGVyY2VwdG9yLCBtdWx0aTogdHJ1ZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRKc29ucE1vZHVsZSB7XG59XG4iXX0=