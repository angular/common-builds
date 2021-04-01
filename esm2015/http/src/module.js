/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Injector, NgModule } from '@angular/core';
import { HttpBackend, HttpHandler } from './backend';
import { HttpClient } from './client';
import { HTTP_INTERCEPTORS, HttpInterceptorHandler, NoopInterceptor } from './interceptor';
import { JsonpCallbackContext, JsonpClientBackend, JsonpInterceptor } from './jsonp';
import { HttpXhrBackend } from './xhr';
import { HttpXsrfCookieExtractor, HttpXsrfInterceptor, HttpXsrfTokenExtractor, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from './xsrf';
import * as i0 from "@angular/core";
import * as i1 from "./backend";
/**
 * An injectable `HttpHandler` that applies multiple interceptors
 * to a request before passing it to the given `HttpBackend`.
 *
 * The interceptors are loaded lazily from the injector, to allow
 * interceptors to themselves inject classes depending indirectly
 * on `HttpInterceptingHandler` itself.
 * @see `HttpInterceptor`
 */
export class HttpInterceptingHandler {
    constructor(backend, injector) {
        this.backend = backend;
        this.injector = injector;
        this.chain = null;
    }
    handle(req) {
        if (this.chain === null) {
            const interceptors = this.injector.get(HTTP_INTERCEPTORS, []);
            this.chain = interceptors.reduceRight((next, interceptor) => new HttpInterceptorHandler(next, interceptor), this.backend);
        }
        return this.chain.handle(req);
    }
}
HttpInterceptingHandler.ɵfac = function HttpInterceptingHandler_Factory(t) { return new (t || HttpInterceptingHandler)(i0.ɵɵinject(i1.HttpBackend), i0.ɵɵinject(i0.Injector)); };
HttpInterceptingHandler.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: HttpInterceptingHandler, factory: HttpInterceptingHandler.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HttpInterceptingHandler, [{
        type: Injectable
    }], function () { return [{ type: i1.HttpBackend }, { type: i0.Injector }]; }, null); })();
/**
 * Constructs an `HttpHandler` that applies interceptors
 * to a request before passing it to the given `HttpBackend`.
 *
 * Use as a factory function within `HttpClientModule`.
 *
 *
 */
export function interceptingHandler(backend, interceptors = []) {
    if (!interceptors) {
        return backend;
    }
    return interceptors.reduceRight((next, interceptor) => new HttpInterceptorHandler(next, interceptor), backend);
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
export class HttpClientXsrfModule {
    /**
     * Disable the default XSRF protection.
     */
    static disable() {
        return {
            ngModule: HttpClientXsrfModule,
            providers: [
                { provide: HttpXsrfInterceptor, useClass: NoopInterceptor },
            ],
        };
    }
    /**
     * Configure XSRF protection.
     * @param options An object that can specify either or both
     * cookie name or header name.
     * - Cookie name default is `XSRF-TOKEN`.
     * - Header name default is `X-XSRF-TOKEN`.
     *
     */
    static withOptions(options = {}) {
        return {
            ngModule: HttpClientXsrfModule,
            providers: [
                options.cookieName ? { provide: XSRF_COOKIE_NAME, useValue: options.cookieName } : [],
                options.headerName ? { provide: XSRF_HEADER_NAME, useValue: options.headerName } : [],
            ],
        };
    }
}
HttpClientXsrfModule.ɵfac = function HttpClientXsrfModule_Factory(t) { return new (t || HttpClientXsrfModule)(); };
HttpClientXsrfModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: HttpClientXsrfModule });
HttpClientXsrfModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
        HttpXsrfInterceptor,
        { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
        { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
        { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
        { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
    ] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HttpClientXsrfModule, [{
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
    }], null, null); })();
/**
 * Configures the [dependency injector](guide/glossary#injector) for `HttpClient`
 * with supporting services for XSRF. Automatically imported by `HttpClientModule`.
 *
 * You can add interceptors to the chain behind `HttpClient` by binding them to the
 * multiprovider for built-in [DI token](guide/glossary#di-token) `HTTP_INTERCEPTORS`.
 *
 * @publicApi
 */
export class HttpClientModule {
}
HttpClientModule.ɵfac = function HttpClientModule_Factory(t) { return new (t || HttpClientModule)(); };
HttpClientModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: HttpClientModule });
HttpClientModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
        HttpClient,
        { provide: HttpHandler, useClass: HttpInterceptingHandler },
        HttpXhrBackend,
        { provide: HttpBackend, useExisting: HttpXhrBackend },
    ], imports: [[
            HttpClientXsrfModule.withOptions({
                cookieName: 'XSRF-TOKEN',
                headerName: 'X-XSRF-TOKEN',
            }),
        ]] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HttpClientModule, [{
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
                ],
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(HttpClientModule, { imports: [HttpClientXsrfModule] }); })();
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
export class HttpClientJsonpModule {
}
HttpClientJsonpModule.ɵfac = function HttpClientJsonpModule_Factory(t) { return new (t || HttpClientJsonpModule)(); };
HttpClientJsonpModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: HttpClientJsonpModule });
HttpClientJsonpModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
        JsonpClientBackend,
        { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
        { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
    ] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HttpClientJsonpModule, [{
        type: NgModule,
        args: [{
                providers: [
                    JsonpClientBackend,
                    { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
                    { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
                ],
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBdUIsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2xGLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ25ELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFDLGlCQUFpQixFQUFtQixzQkFBc0IsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUcsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR25GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDckMsT0FBTyxFQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7QUFFaEk7Ozs7Ozs7O0dBUUc7QUFFSCxNQUFNLE9BQU8sdUJBQXVCO0lBR2xDLFlBQW9CLE9BQW9CLEVBQVUsUUFBa0I7UUFBaEQsWUFBTyxHQUFQLE9BQU8sQ0FBYTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7UUFGNUQsVUFBSyxHQUFxQixJQUFJLENBQUM7SUFFZ0MsQ0FBQztJQUV4RSxNQUFNLENBQUMsR0FBcUI7UUFDMUIsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtZQUN2QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsS0FBSyxHQUFH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O2dCQUNSLFNBQVMsRUFBRTtvQkFDVCxrQkFBa0I7b0JBQ2xCLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQztvQkFDakUsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7aUJBQ3RFO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3RvciwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBDbGllbnR9IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7SFRUUF9JTlRFUkNFUFRPUlMsIEh0dHBJbnRlcmNlcHRvciwgSHR0cEludGVyY2VwdG9ySGFuZGxlciwgTm9vcEludGVyY2VwdG9yfSBmcm9tICcuL2ludGVyY2VwdG9yJztcbmltcG9ydCB7SnNvbnBDYWxsYmFja0NvbnRleHQsIEpzb25wQ2xpZW50QmFja2VuZCwgSnNvbnBJbnRlcmNlcHRvcn0gZnJvbSAnLi9qc29ucCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuaW1wb3J0IHtIdHRwWGhyQmFja2VuZH0gZnJvbSAnLi94aHInO1xuaW1wb3J0IHtIdHRwWHNyZkNvb2tpZUV4dHJhY3RvciwgSHR0cFhzcmZJbnRlcmNlcHRvciwgSHR0cFhzcmZUb2tlbkV4dHJhY3RvciwgWFNSRl9DT09LSUVfTkFNRSwgWFNSRl9IRUFERVJfTkFNRX0gZnJvbSAnLi94c3JmJztcblxuLyoqXG4gKiBBbiBpbmplY3RhYmxlIGBIdHRwSGFuZGxlcmAgdGhhdCBhcHBsaWVzIG11bHRpcGxlIGludGVyY2VwdG9yc1xuICogdG8gYSByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZSBnaXZlbiBgSHR0cEJhY2tlbmRgLlxuICpcbiAqIFRoZSBpbnRlcmNlcHRvcnMgYXJlIGxvYWRlZCBsYXppbHkgZnJvbSB0aGUgaW5qZWN0b3IsIHRvIGFsbG93XG4gKiBpbnRlcmNlcHRvcnMgdG8gdGhlbXNlbHZlcyBpbmplY3QgY2xhc3NlcyBkZXBlbmRpbmcgaW5kaXJlY3RseVxuICogb24gYEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyYCBpdHNlbGYuXG4gKiBAc2VlIGBIdHRwSW50ZXJjZXB0b3JgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwSW50ZXJjZXB0aW5nSGFuZGxlciBpbXBsZW1lbnRzIEh0dHBIYW5kbGVyIHtcbiAgcHJpdmF0ZSBjaGFpbjogSHR0cEhhbmRsZXJ8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiYWNrZW5kOiBIdHRwQmFja2VuZCwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgaGFuZGxlKHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAodGhpcy5jaGFpbiA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gdGhpcy5pbmplY3Rvci5nZXQoSFRUUF9JTlRFUkNFUFRPUlMsIFtdKTtcbiAgICAgIHRoaXMuY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgKG5leHQsIGludGVyY2VwdG9yKSA9PiBuZXcgSHR0cEludGVyY2VwdG9ySGFuZGxlcihuZXh0LCBpbnRlcmNlcHRvciksIHRoaXMuYmFja2VuZCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNoYWluLmhhbmRsZShyZXEpO1xuICB9XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhbiBgSHR0cEhhbmRsZXJgIHRoYXQgYXBwbGllcyBpbnRlcmNlcHRvcnNcbiAqIHRvIGEgcmVxdWVzdCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGUgZ2l2ZW4gYEh0dHBCYWNrZW5kYC5cbiAqXG4gKiBVc2UgYXMgYSBmYWN0b3J5IGZ1bmN0aW9uIHdpdGhpbiBgSHR0cENsaWVudE1vZHVsZWAuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludGVyY2VwdGluZ0hhbmRsZXIoXG4gICAgYmFja2VuZDogSHR0cEJhY2tlbmQsIGludGVyY2VwdG9yczogSHR0cEludGVyY2VwdG9yW118bnVsbCA9IFtdKTogSHR0cEhhbmRsZXIge1xuICBpZiAoIWludGVyY2VwdG9ycykge1xuICAgIHJldHVybiBiYWNrZW5kO1xuICB9XG4gIHJldHVybiBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAobmV4dCwgaW50ZXJjZXB0b3IpID0+IG5ldyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyKG5leHQsIGludGVyY2VwdG9yKSwgYmFja2VuZCk7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hlcmUgdG8gc3RvcmUgSlNPTlAgY2FsbGJhY2tzLlxuICpcbiAqIE9yZGluYXJpbHkgSlNPTlAgY2FsbGJhY2tzIGFyZSBzdG9yZWQgb24gdGhlIGB3aW5kb3dgIG9iamVjdCwgYnV0IHRoaXMgbWF5IG5vdCBleGlzdFxuICogaW4gdGVzdCBlbnZpcm9ubWVudHMuIEluIHRoYXQgY2FzZSwgY2FsbGJhY2tzIGFyZSBzdG9yZWQgb24gYW4gYW5vbnltb3VzIG9iamVjdCBpbnN0ZWFkLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqc29ucENhbGxiYWNrQ29udGV4dCgpOiBPYmplY3Qge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gd2luZG93O1xuICB9XG4gIHJldHVybiB7fTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIFhTUkYgcHJvdGVjdGlvbiBzdXBwb3J0IGZvciBvdXRnb2luZyByZXF1ZXN0cy5cbiAqXG4gKiBGb3IgYSBzZXJ2ZXIgdGhhdCBzdXBwb3J0cyBhIGNvb2tpZS1iYXNlZCBYU1JGIHByb3RlY3Rpb24gc3lzdGVtLFxuICogdXNlIGRpcmVjdGx5IHRvIGNvbmZpZ3VyZSBYU1JGIHByb3RlY3Rpb24gd2l0aCB0aGUgY29ycmVjdFxuICogY29va2llIGFuZCBoZWFkZXIgbmFtZXMuXG4gKlxuICogSWYgbm8gbmFtZXMgYXJlIHN1cHBsaWVkLCB0aGUgZGVmYXVsdCBjb29raWUgbmFtZSBpcyBgWFNSRi1UT0tFTmBcbiAqIGFuZCB0aGUgZGVmYXVsdCBoZWFkZXIgbmFtZSBpcyBgWC1YU1JGLVRPS0VOYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBYc3JmSW50ZXJjZXB0b3IsXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VFeGlzdGluZzogSHR0cFhzcmZJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICAgIHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogJ1hTUkYtVE9LRU4nfSxcbiAgICB7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6ICdYLVhTUkYtVE9LRU4nfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFhzcmZNb2R1bGUge1xuICAvKipcbiAgICogRGlzYWJsZSB0aGUgZGVmYXVsdCBYU1JGIHByb3RlY3Rpb24uXG4gICAqL1xuICBzdGF0aWMgZGlzYWJsZSgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEh0dHBDbGllbnRYc3JmTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBIdHRwQ2xpZW50WHNyZk1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7cHJvdmlkZTogSHR0cFhzcmZJbnRlcmNlcHRvciwgdXNlQ2xhc3M6IE5vb3BJbnRlcmNlcHRvcn0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIFhTUkYgcHJvdGVjdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgY2FuIHNwZWNpZnkgZWl0aGVyIG9yIGJvdGhcbiAgICogY29va2llIG5hbWUgb3IgaGVhZGVyIG5hbWUuXG4gICAqIC0gQ29va2llIG5hbWUgZGVmYXVsdCBpcyBgWFNSRi1UT0tFTmAuXG4gICAqIC0gSGVhZGVyIG5hbWUgZGVmYXVsdCBpcyBgWC1YU1JGLVRPS0VOYC5cbiAgICpcbiAgICovXG4gIHN0YXRpYyB3aXRoT3B0aW9ucyhvcHRpb25zOiB7XG4gICAgY29va2llTmFtZT86IHN0cmluZyxcbiAgICBoZWFkZXJOYW1lPzogc3RyaW5nLFxuICB9ID0ge30pOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEh0dHBDbGllbnRYc3JmTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBIdHRwQ2xpZW50WHNyZk1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBvcHRpb25zLmNvb2tpZU5hbWUgPyB7cHJvdmlkZTogWFNSRl9DT09LSUVfTkFNRSwgdXNlVmFsdWU6IG9wdGlvbnMuY29va2llTmFtZX0gOiBbXSxcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJOYW1lID8ge3Byb3ZpZGU6IFhTUkZfSEVBREVSX05BTUUsIHVzZVZhbHVlOiBvcHRpb25zLmhlYWRlck5hbWV9IDogW10sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBbZGVwZW5kZW5jeSBpbmplY3Rvcl0oZ3VpZGUvZ2xvc3NhcnkjaW5qZWN0b3IpIGZvciBgSHR0cENsaWVudGBcbiAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgWFNSRi4gQXV0b21hdGljYWxseSBpbXBvcnRlZCBieSBgSHR0cENsaWVudE1vZHVsZWAuXG4gKlxuICogWW91IGNhbiBhZGQgaW50ZXJjZXB0b3JzIHRvIHRoZSBjaGFpbiBiZWhpbmQgYEh0dHBDbGllbnRgIGJ5IGJpbmRpbmcgdGhlbSB0byB0aGVcbiAqIG11bHRpcHJvdmlkZXIgZm9yIGJ1aWx0LWluIFtESSB0b2tlbl0oZ3VpZGUvZ2xvc3NhcnkjZGktdG9rZW4pIGBIVFRQX0lOVEVSQ0VQVE9SU2AuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICAvKipcbiAgICogT3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgWFNSRiBwcm90ZWN0aW9uLlxuICAgKi9cbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRYc3JmTW9kdWxlLndpdGhPcHRpb25zKHtcbiAgICAgIGNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgICAgIGhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuICAgIH0pLFxuICBdLFxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgW2RlcGVuZGVuY3kgaW5qZWN0b3JdKGd1aWRlL2dsb3NzYXJ5I2luamVjdG9yKSB3aGVyZSBpdCBpcyBpbXBvcnRlZFxuICAgKiB3aXRoIHN1cHBvcnRpbmcgc2VydmljZXMgZm9yIEhUVFAgY29tbXVuaWNhdGlvbnMuXG4gICAqL1xuICBwcm92aWRlcnM6IFtcbiAgICBIdHRwQ2xpZW50LFxuICAgIHtwcm92aWRlOiBIdHRwSGFuZGxlciwgdXNlQ2xhc3M6IEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyfSxcbiAgICBIdHRwWGhyQmFja2VuZCxcbiAgICB7cHJvdmlkZTogSHR0cEJhY2tlbmQsIHVzZUV4aXN0aW5nOiBIdHRwWGhyQmFja2VuZH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRNb2R1bGUge1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIFtkZXBlbmRlbmN5IGluamVjdG9yXShndWlkZS9nbG9zc2FyeSNpbmplY3RvcikgZm9yIGBIdHRwQ2xpZW50YFxuICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBKU09OUC5cbiAqIFdpdGhvdXQgdGhpcyBtb2R1bGUsIEpzb25wIHJlcXVlc3RzIHJlYWNoIHRoZSBiYWNrZW5kXG4gKiB3aXRoIG1ldGhvZCBKU09OUCwgd2hlcmUgdGhleSBhcmUgcmVqZWN0ZWQuXG4gKlxuICogWW91IGNhbiBhZGQgaW50ZXJjZXB0b3JzIHRvIHRoZSBjaGFpbiBiZWhpbmQgYEh0dHBDbGllbnRgIGJ5IGJpbmRpbmcgdGhlbSB0byB0aGVcbiAqIG11bHRpcHJvdmlkZXIgZm9yIGJ1aWx0LWluIFtESSB0b2tlbl0oZ3VpZGUvZ2xvc3NhcnkjZGktdG9rZW4pIGBIVFRQX0lOVEVSQ0VQVE9SU2AuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBKc29ucENsaWVudEJhY2tlbmQsXG4gICAge3Byb3ZpZGU6IEpzb25wQ2FsbGJhY2tDb250ZXh0LCB1c2VGYWN0b3J5OiBqc29ucENhbGxiYWNrQ29udGV4dH0sXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VDbGFzczogSnNvbnBJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50SnNvbnBNb2R1bGUge1xufVxuIl19