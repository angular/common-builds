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
import { BrowserXhr, HttpXhrBackend, XhrFactory } from './xhr';
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
let HttpInterceptingHandler = /** @class */ (() => {
    class HttpInterceptingHandler {
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
    HttpInterceptingHandler.ɵprov = i0.ɵɵdefineInjectable({ token: HttpInterceptingHandler, factory: HttpInterceptingHandler.ɵfac });
    return HttpInterceptingHandler;
})();
export { HttpInterceptingHandler };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpInterceptingHandler, [{
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
let HttpClientXsrfModule = /** @class */ (() => {
    class HttpClientXsrfModule {
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
    HttpClientXsrfModule.ɵmod = i0.ɵɵdefineNgModule({ type: HttpClientXsrfModule });
    HttpClientXsrfModule.ɵinj = i0.ɵɵdefineInjector({ factory: function HttpClientXsrfModule_Factory(t) { return new (t || HttpClientXsrfModule)(); }, providers: [
            HttpXsrfInterceptor,
            { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
            { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
            { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
            { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
        ] });
    return HttpClientXsrfModule;
})();
export { HttpClientXsrfModule };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpClientXsrfModule, [{
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
let HttpClientModule = /** @class */ (() => {
    class HttpClientModule {
    }
    HttpClientModule.ɵmod = i0.ɵɵdefineNgModule({ type: HttpClientModule });
    HttpClientModule.ɵinj = i0.ɵɵdefineInjector({ factory: function HttpClientModule_Factory(t) { return new (t || HttpClientModule)(); }, providers: [
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
})();
export { HttpClientModule };
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(HttpClientModule, { imports: [HttpClientXsrfModule] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpClientModule, [{
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
    }], null, null); })();
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
let HttpClientJsonpModule = /** @class */ (() => {
    class HttpClientJsonpModule {
    }
    HttpClientJsonpModule.ɵmod = i0.ɵɵdefineNgModule({ type: HttpClientJsonpModule });
    HttpClientJsonpModule.ɵinj = i0.ɵɵdefineInjector({ factory: function HttpClientJsonpModule_Factory(t) { return new (t || HttpClientJsonpModule)(); }, providers: [
            JsonpClientBackend,
            { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
            { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
        ] });
    return HttpClientJsonpModule;
})();
export { HttpClientJsonpModule };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpClientJsonpModule, [{
        type: NgModule,
        args: [{
                providers: [
                    JsonpClientBackend,
                    { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
                    { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
                ],
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBdUIsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2xGLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ25ELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFDLGlCQUFpQixFQUFtQixzQkFBc0IsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUcsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR25GLE9BQU8sRUFBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM3RCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxRQUFRLENBQUM7OztBQUVoSTs7Ozs7Ozs7R0FRRztBQUNIO0lBQUEsTUFDYSx1QkFBdUI7UUFHbEMsWUFBb0IsT0FBb0IsRUFBVSxRQUFrQjtZQUFoRCxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUY1RCxVQUFLLEdBQXFCLElBQUksQ0FBQztRQUVnQyxDQUFDO1FBRXhFLE1BQU0sQ0FBQyxHQUFxQjtZQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUN2QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFD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QUFDSDtJQUFBLE1BT2EscUJBQXFCOzs2REFBckIscUJBQXFCOzZIQUFyQixxQkFBcUIsbUJBTnJCO1lBQ1Qsa0JBQWtCO1lBQ2xCLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQztZQUNqRSxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztTQUN0RTtnQ0F4TEg7S0EyTEM7U0FEWSxxQkFBcUI7a0RBQXJCLHFCQUFxQjtjQVBqQyxRQUFRO2VBQUM7Z0JBQ1IsU0FBUyxFQUFFO29CQUNULGtCQUFrQjtvQkFDbEIsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFDO29CQUNqRSxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztpQkFDdEU7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdG9yLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cENsaWVudH0gZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHtIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cEludGVyY2VwdG9yLCBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyLCBOb29wSW50ZXJjZXB0b3J9IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtKc29ucENhbGxiYWNrQ29udGV4dCwgSnNvbnBDbGllbnRCYWNrZW5kLCBKc29ucEludGVyY2VwdG9yfSBmcm9tICcuL2pzb25wJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5pbXBvcnQge0Jyb3dzZXJYaHIsIEh0dHBYaHJCYWNrZW5kLCBYaHJGYWN0b3J5fSBmcm9tICcuL3hocic7XG5pbXBvcnQge0h0dHBYc3JmQ29va2llRXh0cmFjdG9yLCBIdHRwWHNyZkludGVyY2VwdG9yLCBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCBYU1JGX0NPT0tJRV9OQU1FLCBYU1JGX0hFQURFUl9OQU1FfSBmcm9tICcuL3hzcmYnO1xuXG4vKipcbiAqIEFuIGluamVjdGFibGUgYEh0dHBIYW5kbGVyYCB0aGF0IGFwcGxpZXMgbXVsdGlwbGUgaW50ZXJjZXB0b3JzXG4gKiB0byBhIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlIGdpdmVuIGBIdHRwQmFja2VuZGAuXG4gKlxuICogVGhlIGludGVyY2VwdG9ycyBhcmUgbG9hZGVkIGxhemlseSBmcm9tIHRoZSBpbmplY3RvciwgdG8gYWxsb3dcbiAqIGludGVyY2VwdG9ycyB0byB0aGVtc2VsdmVzIGluamVjdCBjbGFzc2VzIGRlcGVuZGluZyBpbmRpcmVjdGx5XG4gKiBvbiBgSHR0cEludGVyY2VwdGluZ0hhbmRsZXJgIGl0c2VsZi5cbiAqIEBzZWUgYEh0dHBJbnRlcmNlcHRvcmBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyIGltcGxlbWVudHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBIdHRwSGFuZGxlcnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge31cblxuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSB0aGlzLmluamVjdG9yLmdldChIVFRQX0lOVEVSQ0VQVE9SUywgW10pO1xuICAgICAgdGhpcy5jaGFpbiA9IGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgICAgICAobmV4dCwgaW50ZXJjZXB0b3IpID0+IG5ldyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyKG5leHQsIGludGVyY2VwdG9yKSwgdGhpcy5iYWNrZW5kKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4uaGFuZGxlKHJlcSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIGBIdHRwSGFuZGxlcmAgdGhhdCBhcHBsaWVzIGludGVyY2VwdG9yc1xuICogdG8gYSByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZSBnaXZlbiBgSHR0cEJhY2tlbmRgLlxuICpcbiAqIFVzZSBhcyBhIGZhY3RvcnkgZnVuY3Rpb24gd2l0aGluIGBIdHRwQ2xpZW50TW9kdWxlYC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJjZXB0aW5nSGFuZGxlcihcbiAgICBiYWNrZW5kOiBIdHRwQmFja2VuZCwgaW50ZXJjZXB0b3JzOiBIdHRwSW50ZXJjZXB0b3JbXXxudWxsID0gW10pOiBIdHRwSGFuZGxlciB7XG4gIGlmICghaW50ZXJjZXB0b3JzKSB7XG4gICAgcmV0dXJuIGJhY2tlbmQ7XG4gIH1cbiAgcmV0dXJuIGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgIChuZXh0LCBpbnRlcmNlcHRvcikgPT4gbmV3IEh0dHBJbnRlcmNlcHRvckhhbmRsZXIobmV4dCwgaW50ZXJjZXB0b3IpLCBiYWNrZW5kKTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGVyZSB0byBzdG9yZSBKU09OUCBjYWxsYmFja3MuXG4gKlxuICogT3JkaW5hcmlseSBKU09OUCBjYWxsYmFja3MgYXJlIHN0b3JlZCBvbiB0aGUgYHdpbmRvd2Agb2JqZWN0LCBidXQgdGhpcyBtYXkgbm90IGV4aXN0XG4gKiBpbiB0ZXN0IGVudmlyb25tZW50cy4gSW4gdGhhdCBjYXNlLCBjYWxsYmFja3MgYXJlIHN0b3JlZCBvbiBhbiBhbm9ueW1vdXMgb2JqZWN0IGluc3RlYWQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpzb25wQ2FsbGJhY2tDb250ZXh0KCk6IE9iamVjdCB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cbiAgcmV0dXJuIHt9O1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZXMgWFNSRiBwcm90ZWN0aW9uIHN1cHBvcnQgZm9yIG91dGdvaW5nIHJlcXVlc3RzLlxuICpcbiAqIEZvciBhIHNlcnZlciB0aGF0IHN1cHBvcnRzIGEgY29va2llLWJhc2VkIFhTUkYgcHJvdGVjdGlvbiBzeXN0ZW0sXG4gKiB1c2UgZGlyZWN0bHkgdG8gY29uZmlndXJlIFhTUkYgcHJvdGVjdGlvbiB3aXRoIHRoZSBjb3JyZWN0XG4gKiBjb29raWUgYW5kIGhlYWRlciBuYW1lcy5cbiAqXG4gKiBJZiBubyBuYW1lcyBhcmUgc3VwcGxpZWQsIHRoZSBkZWZhdWx0IGNvb2tpZSBuYW1lIGlzIGBYU1JGLVRPS0VOYFxuICogYW5kIHRoZSBkZWZhdWx0IGhlYWRlciBuYW1lIGlzIGBYLVhTUkYtVE9LRU5gLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgSHR0cFhzcmZJbnRlcmNlcHRvcixcbiAgICB7cHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsIHVzZUV4aXN0aW5nOiBIdHRwWHNyZkludGVyY2VwdG9yLCBtdWx0aTogdHJ1ZX0sXG4gICAge3Byb3ZpZGU6IEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsIHVzZUNsYXNzOiBIdHRwWHNyZkNvb2tpZUV4dHJhY3Rvcn0sXG4gICAge3Byb3ZpZGU6IFhTUkZfQ09PS0lFX05BTUUsIHVzZVZhbHVlOiAnWFNSRi1UT0tFTid9LFxuICAgIHtwcm92aWRlOiBYU1JGX0hFQURFUl9OQU1FLCB1c2VWYWx1ZTogJ1gtWFNSRi1UT0tFTid9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50WHNyZk1vZHVsZSB7XG4gIC8qKlxuICAgKiBEaXNhYmxlIHRoZSBkZWZhdWx0IFhTUkYgcHJvdGVjdGlvbi5cbiAgICovXG4gIHN0YXRpYyBkaXNhYmxlKCk6IE1vZHVsZVdpdGhQcm92aWRlcnM8SHR0cENsaWVudFhzcmZNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtwcm92aWRlOiBIdHRwWHNyZkludGVyY2VwdG9yLCB1c2VDbGFzczogTm9vcEludGVyY2VwdG9yfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBjYW4gc3BlY2lmeSBlaXRoZXIgb3IgYm90aFxuICAgKiBjb29raWUgbmFtZSBvciBoZWFkZXIgbmFtZS5cbiAgICogLSBDb29raWUgbmFtZSBkZWZhdWx0IGlzIGBYU1JGLVRPS0VOYC5cbiAgICogLSBIZWFkZXIgbmFtZSBkZWZhdWx0IGlzIGBYLVhTUkYtVE9LRU5gLlxuICAgKlxuICAgKi9cbiAgc3RhdGljIHdpdGhPcHRpb25zKG9wdGlvbnM6IHtcbiAgICBjb29raWVOYW1lPzogc3RyaW5nLFxuICAgIGhlYWRlck5hbWU/OiBzdHJpbmcsXG4gIH0gPSB7fSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8SHR0cENsaWVudFhzcmZNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIG9wdGlvbnMuY29va2llTmFtZSA/IHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogb3B0aW9ucy5jb29raWVOYW1lfSA6IFtdLFxuICAgICAgICBvcHRpb25zLmhlYWRlck5hbWUgPyB7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6IG9wdGlvbnMuaGVhZGVyTmFtZX0gOiBbXSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIFtkZXBlbmRlbmN5IGluamVjdG9yXShndWlkZS9nbG9zc2FyeSNpbmplY3RvcikgZm9yIGBIdHRwQ2xpZW50YFxuICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBYU1JGLiBBdXRvbWF0aWNhbGx5IGltcG9ydGVkIGJ5IGBIdHRwQ2xpZW50TW9kdWxlYC5cbiAqXG4gKiBZb3UgY2FuIGFkZCBpbnRlcmNlcHRvcnMgdG8gdGhlIGNoYWluIGJlaGluZCBgSHR0cENsaWVudGAgYnkgYmluZGluZyB0aGVtIHRvIHRoZVxuICogbXVsdGlwcm92aWRlciBmb3IgYnVpbHQtaW4gW0RJIHRva2VuXShndWlkZS9nbG9zc2FyeSNkaS10b2tlbikgYEhUVFBfSU5URVJDRVBUT1JTYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIC8qKlxuICAgKiBPcHRpb25hbCBjb25maWd1cmF0aW9uIGZvciBYU1JGIHByb3RlY3Rpb24uXG4gICAqL1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudFhzcmZNb2R1bGUud2l0aE9wdGlvbnMoe1xuICAgICAgY29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICAgICAgaGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG4gICAgfSksXG4gIF0sXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBbZGVwZW5kZW5jeSBpbmplY3Rvcl0oZ3VpZGUvZ2xvc3NhcnkjaW5qZWN0b3IpIHdoZXJlIGl0IGlzIGltcG9ydGVkXG4gICAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgSFRUUCBjb21tdW5pY2F0aW9ucy5cbiAgICovXG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBDbGllbnQsXG4gICAge3Byb3ZpZGU6IEh0dHBIYW5kbGVyLCB1c2VDbGFzczogSHR0cEludGVyY2VwdGluZ0hhbmRsZXJ9LFxuICAgIEh0dHBYaHJCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBIdHRwQmFja2VuZCwgdXNlRXhpc3Rpbmc6IEh0dHBYaHJCYWNrZW5kfSxcbiAgICBCcm93c2VyWGhyLFxuICAgIHtwcm92aWRlOiBYaHJGYWN0b3J5LCB1c2VFeGlzdGluZzogQnJvd3Nlclhocn0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRNb2R1bGUge1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIFtkZXBlbmRlbmN5IGluamVjdG9yXShndWlkZS9nbG9zc2FyeSNpbmplY3RvcikgZm9yIGBIdHRwQ2xpZW50YFxuICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBKU09OUC5cbiAqIFdpdGhvdXQgdGhpcyBtb2R1bGUsIEpzb25wIHJlcXVlc3RzIHJlYWNoIHRoZSBiYWNrZW5kXG4gKiB3aXRoIG1ldGhvZCBKU09OUCwgd2hlcmUgdGhleSBhcmUgcmVqZWN0ZWQuXG4gKlxuICogWW91IGNhbiBhZGQgaW50ZXJjZXB0b3JzIHRvIHRoZSBjaGFpbiBiZWhpbmQgYEh0dHBDbGllbnRgIGJ5IGJpbmRpbmcgdGhlbSB0byB0aGVcbiAqIG11bHRpcHJvdmlkZXIgZm9yIGJ1aWx0LWluIFtESSB0b2tlbl0oZ3VpZGUvZ2xvc3NhcnkjZGktdG9rZW4pIGBIVFRQX0lOVEVSQ0VQVE9SU2AuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBKc29ucENsaWVudEJhY2tlbmQsXG4gICAge3Byb3ZpZGU6IEpzb25wQ2FsbGJhY2tDb250ZXh0LCB1c2VGYWN0b3J5OiBqc29ucENhbGxiYWNrQ29udGV4dH0sXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VDbGFzczogSnNvbnBJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50SnNvbnBNb2R1bGUge1xufVxuIl19