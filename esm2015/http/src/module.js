/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
    /**
     * @param {?} backend
     * @param {?} injector
     */
    constructor(backend, injector) {
        this.backend = backend;
        this.injector = injector;
        this.chain = null;
    }
    /**
     * @param {?} req
     * @return {?}
     */
    handle(req) {
        if (this.chain === null) {
            /** @type {?} */
            const interceptors = this.injector.get(HTTP_INTERCEPTORS, []);
            this.chain = interceptors.reduceRight((/**
             * @param {?} next
             * @param {?} interceptor
             * @return {?}
             */
            (next, interceptor) => new HttpInterceptorHandler(next, interceptor)), this.backend);
        }
        return this.chain.handle(req);
    }
}
HttpInterceptingHandler.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpInterceptingHandler.ctorParameters = () => [
    { type: HttpBackend },
    { type: Injector }
];
/** @nocollapse */ HttpInterceptingHandler.ɵfac = function HttpInterceptingHandler_Factory(t) { return new (t || HttpInterceptingHandler)(i0.ɵɵinject(i1.HttpBackend), i0.ɵɵinject(i0.Injector)); };
/** @nocollapse */ HttpInterceptingHandler.ɵprov = i0.ɵɵdefineInjectable({ token: HttpInterceptingHandler, factory: function (t) { return HttpInterceptingHandler.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpInterceptingHandler, [{
        type: Injectable
    }], function () { return [{ type: i1.HttpBackend }, { type: i0.Injector }]; }, null);
if (false) {
    /**
     * @type {?}
     * @private
     */
    HttpInterceptingHandler.prototype.chain;
    /**
     * @type {?}
     * @private
     */
    HttpInterceptingHandler.prototype.backend;
    /**
     * @type {?}
     * @private
     */
    HttpInterceptingHandler.prototype.injector;
}
/**
 * Constructs an `HttpHandler` that applies interceptors
 * to a request before passing it to the given `HttpBackend`.
 *
 * Use as a factory function within `HttpClientModule`.
 *
 *
 * @param {?} backend
 * @param {?=} interceptors
 * @return {?}
 */
export function interceptingHandler(backend, interceptors = []) {
    if (!interceptors) {
        return backend;
    }
    return interceptors.reduceRight((/**
     * @param {?} next
     * @param {?} interceptor
     * @return {?}
     */
    (next, interceptor) => new HttpInterceptorHandler(next, interceptor)), backend);
}
/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 *
 * @return {?}
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
 * \@publicApi
 */
export class HttpClientXsrfModule {
    /**
     * Disable the default XSRF protection.
     * @return {?}
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
     * @param {?=} options An object that can specify either or both
     * cookie name or header name.
     * - Cookie name default is `XSRF-TOKEN`.
     * - Header name default is `X-XSRF-TOKEN`.
     *
     * @return {?}
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
HttpClientXsrfModule.decorators = [
    { type: NgModule, args: [{
                providers: [
                    HttpXsrfInterceptor,
                    { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
                    { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
                    { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
                    { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
                ],
            },] },
];
/** @nocollapse */ HttpClientXsrfModule.ɵmod = i0.ɵɵdefineNgModule({ type: HttpClientXsrfModule });
/** @nocollapse */ HttpClientXsrfModule.ɵinj = i0.ɵɵdefineInjector({ factory: function HttpClientXsrfModule_Factory(t) { return new (t || HttpClientXsrfModule)(); }, providers: [
        HttpXsrfInterceptor,
        { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
        { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
        { provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN' },
        { provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN' },
    ] });
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
 * \@publicApi
 */
export class HttpClientModule {
}
HttpClientModule.decorators = [
    { type: NgModule, args: [{
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
            },] },
];
/** @nocollapse */ HttpClientModule.ɵmod = i0.ɵɵdefineNgModule({ type: HttpClientModule });
/** @nocollapse */ HttpClientModule.ɵinj = i0.ɵɵdefineInjector({ factory: function HttpClientModule_Factory(t) { return new (t || HttpClientModule)(); }, providers: [
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
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(HttpClientModule, { imports: [HttpClientXsrfModule] }); })();
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
 * \@publicApi
 */
export class HttpClientJsonpModule {
}
HttpClientJsonpModule.decorators = [
    { type: NgModule, args: [{
                providers: [
                    JsonpClientBackend,
                    { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
                    { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
                ],
            },] },
];
/** @nocollapse */ HttpClientJsonpModule.ɵmod = i0.ɵɵdefineNgModule({ type: HttpClientJsonpModule });
/** @nocollapse */ HttpClientJsonpModule.ɵinj = i0.ɵɵdefineInjector({ factory: function HttpClientJsonpModule_Factory(t) { return new (t || HttpClientJsonpModule)(); }, providers: [
        JsonpClientBackend,
        { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
        { provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true },
    ] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQXVCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdsRixPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNuRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxpQkFBaUIsRUFBbUIsc0JBQXNCLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFHLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUduRixPQUFPLEVBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDN0QsT0FBTyxFQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBWWhJLE1BQU0sT0FBTyx1QkFBdUI7Ozs7O0lBR2xDLFlBQW9CLE9BQW9CLEVBQVUsUUFBa0I7UUFBaEQsWUFBTyxHQUFQLE9BQU8sQ0FBYTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7UUFGNUQsVUFBSyxHQUFxQixJQUFJLENBQUM7SUFFZ0MsQ0FBQzs7Ozs7SUFFeEUsTUFBTSxDQUFDLEdBQXFCO1FBQzFCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7O2tCQUNqQixZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDO1lBQzdELElBQUksQ0FBQyxL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LE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztLQUN0RTttQ0FFVSxxQkFBcUI7Y0FQakMsUUFBUTtlQUFDO2dCQUNSLFNBQVMsRUFBRTtvQkFDVCxrQkFBa0I7b0JBQ2xCLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQztvQkFDakUsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7aUJBQ3RFO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0b3IsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwQ2xpZW50fSBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge0hUVFBfSU5URVJDRVBUT1JTLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIsIE5vb3BJbnRlcmNlcHRvcn0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge0pzb25wQ2FsbGJhY2tDb250ZXh0LCBKc29ucENsaWVudEJhY2tlbmQsIEpzb25wSW50ZXJjZXB0b3J9IGZyb20gJy4vanNvbnAnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcbmltcG9ydCB7QnJvd3NlclhociwgSHR0cFhockJhY2tlbmQsIFhockZhY3Rvcnl9IGZyb20gJy4veGhyJztcbmltcG9ydCB7SHR0cFhzcmZDb29raWVFeHRyYWN0b3IsIEh0dHBYc3JmSW50ZXJjZXB0b3IsIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsIFhTUkZfQ09PS0lFX05BTUUsIFhTUkZfSEVBREVSX05BTUV9IGZyb20gJy4veHNyZic7XG5cbi8qKlxuICogQW4gaW5qZWN0YWJsZSBgSHR0cEhhbmRsZXJgIHRoYXQgYXBwbGllcyBtdWx0aXBsZSBpbnRlcmNlcHRvcnNcbiAqIHRvIGEgcmVxdWVzdCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGUgZ2l2ZW4gYEh0dHBCYWNrZW5kYC5cbiAqXG4gKiBUaGUgaW50ZXJjZXB0b3JzIGFyZSBsb2FkZWQgbGF6aWx5IGZyb20gdGhlIGluamVjdG9yLCB0byBhbGxvd1xuICogaW50ZXJjZXB0b3JzIHRvIHRoZW1zZWx2ZXMgaW5qZWN0IGNsYXNzZXMgZGVwZW5kaW5nIGluZGlyZWN0bHlcbiAqIG9uIGBIdHRwSW50ZXJjZXB0aW5nSGFuZGxlcmAgaXRzZWxmLlxuICogQHNlZSBgSHR0cEludGVyY2VwdG9yYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cEludGVyY2VwdGluZ0hhbmRsZXIgaW1wbGVtZW50cyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IEh0dHBIYW5kbGVyfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYmFja2VuZDogSHR0cEJhY2tlbmQsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IHRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfSU5URVJDRVBUT1JTLCBbXSk7XG4gICAgICB0aGlzLmNoYWluID0gaW50ZXJjZXB0b3JzLnJlZHVjZVJpZ2h0KFxuICAgICAgICAgIChuZXh0LCBpbnRlcmNlcHRvcikgPT4gbmV3IEh0dHBJbnRlcmNlcHRvckhhbmRsZXIobmV4dCwgaW50ZXJjZXB0b3IpLCB0aGlzLmJhY2tlbmQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jaGFpbi5oYW5kbGUocmVxKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYW4gYEh0dHBIYW5kbGVyYCB0aGF0IGFwcGxpZXMgaW50ZXJjZXB0b3JzXG4gKiB0byBhIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlIGdpdmVuIGBIdHRwQmFja2VuZGAuXG4gKlxuICogVXNlIGFzIGEgZmFjdG9yeSBmdW5jdGlvbiB3aXRoaW4gYEh0dHBDbGllbnRNb2R1bGVgLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcmNlcHRpbmdIYW5kbGVyKFxuICAgIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBpbnRlcmNlcHRvcnM6IEh0dHBJbnRlcmNlcHRvcltdIHwgbnVsbCA9IFtdKTogSHR0cEhhbmRsZXIge1xuICBpZiAoIWludGVyY2VwdG9ycykge1xuICAgIHJldHVybiBiYWNrZW5kO1xuICB9XG4gIHJldHVybiBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAobmV4dCwgaW50ZXJjZXB0b3IpID0+IG5ldyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyKG5leHQsIGludGVyY2VwdG9yKSwgYmFja2VuZCk7XG59XG5cbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hlcmUgdG8gc3RvcmUgSlNPTlAgY2FsbGJhY2tzLlxuICpcbiAqIE9yZGluYXJpbHkgSlNPTlAgY2FsbGJhY2tzIGFyZSBzdG9yZWQgb24gdGhlIGB3aW5kb3dgIG9iamVjdCwgYnV0IHRoaXMgbWF5IG5vdCBleGlzdFxuICogaW4gdGVzdCBlbnZpcm9ubWVudHMuIEluIHRoYXQgY2FzZSwgY2FsbGJhY2tzIGFyZSBzdG9yZWQgb24gYW4gYW5vbnltb3VzIG9iamVjdCBpbnN0ZWFkLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqc29ucENhbGxiYWNrQ29udGV4dCgpOiBPYmplY3Qge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gd2luZG93O1xuICB9XG4gIHJldHVybiB7fTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIFhTUkYgcHJvdGVjdGlvbiBzdXBwb3J0IGZvciBvdXRnb2luZyByZXF1ZXN0cy5cbiAqXG4gKiBGb3IgYSBzZXJ2ZXIgdGhhdCBzdXBwb3J0cyBhIGNvb2tpZS1iYXNlZCBYU1JGIHByb3RlY3Rpb24gc3lzdGVtLFxuICogdXNlIGRpcmVjdGx5IHRvIGNvbmZpZ3VyZSBYU1JGIHByb3RlY3Rpb24gd2l0aCB0aGUgY29ycmVjdFxuICogY29va2llIGFuZCBoZWFkZXIgbmFtZXMuXG4gKlxuICogSWYgbm8gbmFtZXMgYXJlIHN1cHBsaWVkLCB0aGUgZGVmYXVsdCBjb29raWUgbmFtZSBpcyBgWFNSRi1UT0tFTmBcbiAqIGFuZCB0aGUgZGVmYXVsdCBoZWFkZXIgbmFtZSBpcyBgWC1YU1JGLVRPS0VOYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBYc3JmSW50ZXJjZXB0b3IsXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VFeGlzdGluZzogSHR0cFhzcmZJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICAgIHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogJ1hTUkYtVE9LRU4nfSxcbiAgICB7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6ICdYLVhTUkYtVE9LRU4nfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFhzcmZNb2R1bGUge1xuICAvKipcbiAgICogRGlzYWJsZSB0aGUgZGVmYXVsdCBYU1JGIHByb3RlY3Rpb24uXG4gICAqL1xuICBzdGF0aWMgZGlzYWJsZSgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEh0dHBDbGllbnRYc3JmTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBIdHRwQ2xpZW50WHNyZk1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7cHJvdmlkZTogSHR0cFhzcmZJbnRlcmNlcHRvciwgdXNlQ2xhc3M6IE5vb3BJbnRlcmNlcHRvcn0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIFhTUkYgcHJvdGVjdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgY2FuIHNwZWNpZnkgZWl0aGVyIG9yIGJvdGhcbiAgICogY29va2llIG5hbWUgb3IgaGVhZGVyIG5hbWUuXG4gICAqIC0gQ29va2llIG5hbWUgZGVmYXVsdCBpcyBgWFNSRi1UT0tFTmAuXG4gICAqIC0gSGVhZGVyIG5hbWUgZGVmYXVsdCBpcyBgWC1YU1JGLVRPS0VOYC5cbiAgICpcbiAgICovXG4gIHN0YXRpYyB3aXRoT3B0aW9ucyhvcHRpb25zOiB7XG4gICAgY29va2llTmFtZT86IHN0cmluZyxcbiAgICBoZWFkZXJOYW1lPzogc3RyaW5nLFxuICB9ID0ge30pOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEh0dHBDbGllbnRYc3JmTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBIdHRwQ2xpZW50WHNyZk1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBvcHRpb25zLmNvb2tpZU5hbWUgPyB7cHJvdmlkZTogWFNSRl9DT09LSUVfTkFNRSwgdXNlVmFsdWU6IG9wdGlvbnMuY29va2llTmFtZX0gOiBbXSxcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJOYW1lID8ge3Byb3ZpZGU6IFhTUkZfSEVBREVSX05BTUUsIHVzZVZhbHVlOiBvcHRpb25zLmhlYWRlck5hbWV9IDogW10sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBbZGVwZW5kZW5jeSBpbmplY3Rvcl0oZ3VpZGUvZ2xvc3NhcnkjaW5qZWN0b3IpIGZvciBgSHR0cENsaWVudGBcbiAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgWFNSRi4gQXV0b21hdGljYWxseSBpbXBvcnRlZCBieSBgSHR0cENsaWVudE1vZHVsZWAuXG4gKlxuICogWW91IGNhbiBhZGQgaW50ZXJjZXB0b3JzIHRvIHRoZSBjaGFpbiBiZWhpbmQgYEh0dHBDbGllbnRgIGJ5IGJpbmRpbmcgdGhlbSB0byB0aGVcbiAqIG11bHRpcHJvdmlkZXIgZm9yIGJ1aWx0LWluIFtESSB0b2tlbl0oZ3VpZGUvZ2xvc3NhcnkjZGktdG9rZW4pIGBIVFRQX0lOVEVSQ0VQVE9SU2AuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICAvKipcbiAgICogT3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgWFNSRiBwcm90ZWN0aW9uLlxuICAgKi9cbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRYc3JmTW9kdWxlLndpdGhPcHRpb25zKHtcbiAgICAgIGNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgICAgIGhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuICAgIH0pLFxuICBdLFxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgW2RlcGVuZGVuY3kgaW5qZWN0b3JdKGd1aWRlL2dsb3NzYXJ5I2luamVjdG9yKSB3aGVyZSBpdCBpcyBpbXBvcnRlZFxuICAgKiB3aXRoIHN1cHBvcnRpbmcgc2VydmljZXMgZm9yIEhUVFAgY29tbXVuaWNhdGlvbnMuXG4gICAqL1xuICBwcm92aWRlcnM6IFtcbiAgICBIdHRwQ2xpZW50LFxuICAgIHtwcm92aWRlOiBIdHRwSGFuZGxlciwgdXNlQ2xhc3M6IEh0dHBJbnRlcmNlcHRpbmdIYW5kbGVyfSxcbiAgICBIdHRwWGhyQmFja2VuZCxcbiAgICB7cHJvdmlkZTogSHR0cEJhY2tlbmQsIHVzZUV4aXN0aW5nOiBIdHRwWGhyQmFja2VuZH0sXG4gICAgQnJvd3NlclhocixcbiAgICB7cHJvdmlkZTogWGhyRmFjdG9yeSwgdXNlRXhpc3Rpbmc6IEJyb3dzZXJYaHJ9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50TW9kdWxlIHtcbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBbZGVwZW5kZW5jeSBpbmplY3Rvcl0oZ3VpZGUvZ2xvc3NhcnkjaW5qZWN0b3IpIGZvciBgSHR0cENsaWVudGBcbiAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgSlNPTlAuXG4gKiBXaXRob3V0IHRoaXMgbW9kdWxlLCBKc29ucCByZXF1ZXN0cyByZWFjaCB0aGUgYmFja2VuZFxuICogd2l0aCBtZXRob2QgSlNPTlAsIHdoZXJlIHRoZXkgYXJlIHJlamVjdGVkLlxuICpcbiAqIFlvdSBjYW4gYWRkIGludGVyY2VwdG9ycyB0byB0aGUgY2hhaW4gYmVoaW5kIGBIdHRwQ2xpZW50YCBieSBiaW5kaW5nIHRoZW0gdG8gdGhlXG4gKiBtdWx0aXByb3ZpZGVyIGZvciBidWlsdC1pbiBbREkgdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuKSBgSFRUUF9JTlRFUkNFUFRPUlNgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgSnNvbnBDbGllbnRCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBKc29ucENhbGxiYWNrQ29udGV4dCwgdXNlRmFjdG9yeToganNvbnBDYWxsYmFja0NvbnRleHR9LFxuICAgIHtwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUywgdXNlQ2xhc3M6IEpzb25wSW50ZXJjZXB0b3IsIG11bHRpOiB0cnVlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudEpzb25wTW9kdWxlIHtcbn1cbiJdfQ==