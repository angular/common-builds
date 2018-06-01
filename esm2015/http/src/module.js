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
            const /** @type {?} */ interceptors = this.injector.get(HTTP_INTERCEPTORS, []);
            this.chain = interceptors.reduceRight((next, interceptor) => new HttpInterceptorHandler(next, interceptor), this.backend);
        }
        return this.chain.handle(req);
    }
}
HttpInterceptingHandler.decorators = [
    { type: Injectable }
];
/** @nocollapse */
HttpInterceptingHandler.ctorParameters = () => [
    { type: HttpBackend },
    { type: Injector }
];
function HttpInterceptingHandler_tsickle_Closure_declarations() {
    /** @type {?} */
    HttpInterceptingHandler.prototype.chain;
    /** @type {?} */
    HttpInterceptingHandler.prototype.backend;
    /** @type {?} */
    HttpInterceptingHandler.prototype.injector;
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
     * Configure XSRF protection to use the given cookie name or header name,
     * or the default names (as described above) if not provided.
     * @param {?=} options
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
            },] }
];
/**
 * `NgModule` which provides the `HttpClient` and associated services.
 *
 * Interceptors can be added to the chain behind `HttpClient` by binding them
 * to the multiprovider for `HTTP_INTERCEPTORS`.
 *
 *
 */
export class HttpClientModule {
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
/**
 * `NgModule` which enables JSONP support in `HttpClient`.
 *
 * Without this module, Jsonp requests will reach the backend
 * with method JSONP, where they'll be rejected.
 *
 *
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
            },] }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUF1QixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHbEYsT0FBTyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbkQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNwQyxPQUFPLEVBQUMsaUJBQWlCLEVBQW1CLHNCQUFzQixFQUFFLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxRyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHbkYsT0FBTyxFQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzdELE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7O0FBV2hJLE1BQU07Ozs7O0lBR0osWUFBb0IsT0FBb0IsRUFBVSxRQUFrQjtRQUFoRCxZQUFPLEdBQVAsT0FBTyxDQUFhO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtxQkFGbEMsSUFBSTtLQUVrQzs7Ozs7SUFFeEUsTUFBTSxDQUFDLEdBQXFCO1FBQzFCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDdkIsdUJBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FDakMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDekY7UUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9COzs7WUFiRixVQUFVOzs7O1lBakJILFdBQVc7WUFIQyxRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEM1QixNQUFNO0lBQ0osSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7UUFDOUIsT0FBTyxNQUFNLENBQUM7S0FDZjtJQUNELE9BQU8sRUFBRSxDQUFDO0NBQ1g7Ozs7Ozs7Ozs7Ozs7QUF1QkQsTUFBTTs7Ozs7SUFJSixNQUFNLENBQUMsT0FBTztRQUNaLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRTtnQkFDVCxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFDO2FBQzFEO1NBQ0YsQ0FBQztLQUNIOzs7Ozs7O0lBTUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUdmLEVBQUU7UUFDSixPQUFPO1lBQ0wsUUFBUSxFQUFFLG9CQUFvQjtZQUM5QixTQUFTLEVBQUU7Z0JBQ1QsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkYsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUNwRjtTQUNGLENBQUM7S0FDSDs7O1lBckNGLFFBQVEsU0FBQztnQkFDUixTQUFTLEVBQUU7b0JBQ1QsbUJBQW1CO29CQUNuQixFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztvQkFDM0UsRUFBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFDO29CQUNwRSxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDO29CQUNuRCxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFDO2lCQUN0RDthQUNGOzs7Ozs7Ozs7O0FBd0RELE1BQU07OztZQWhCTCxRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLG9CQUFvQixDQUFDLFdBQVcsQ0FBQzt3QkFDL0IsVUFBVSxFQUFFLFlBQVk7d0JBQ3hCLFVBQVUsRUFBRSxjQUFjO3FCQUMzQixDQUFDO2lCQUNIO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxVQUFVO29CQUNWLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUM7b0JBQ3pELGNBQWM7b0JBQ2QsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUM7b0JBQ25ELFVBQVU7b0JBQ1YsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUM7aUJBQy9DO2FBQ0Y7Ozs7Ozs7Ozs7QUFtQkQsTUFBTTs7O1lBUEwsUUFBUSxTQUFDO2dCQUNSLFNBQVMsRUFBRTtvQkFDVCxrQkFBa0I7b0JBQ2xCLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQztvQkFDakUsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7aUJBQ3RFO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0b3IsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwQ2xpZW50fSBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge0hUVFBfSU5URVJDRVBUT1JTLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIsIE5vb3BJbnRlcmNlcHRvcn0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge0pzb25wQ2FsbGJhY2tDb250ZXh0LCBKc29ucENsaWVudEJhY2tlbmQsIEpzb25wSW50ZXJjZXB0b3J9IGZyb20gJy4vanNvbnAnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcbmltcG9ydCB7QnJvd3NlclhociwgSHR0cFhockJhY2tlbmQsIFhockZhY3Rvcnl9IGZyb20gJy4veGhyJztcbmltcG9ydCB7SHR0cFhzcmZDb29raWVFeHRyYWN0b3IsIEh0dHBYc3JmSW50ZXJjZXB0b3IsIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsIFhTUkZfQ09PS0lFX05BTUUsIFhTUkZfSEVBREVSX05BTUV9IGZyb20gJy4veHNyZic7XG5cbi8qKlxuICogQW4gYEh0dHBIYW5kbGVyYCB0aGF0IGFwcGxpZXMgYSBidW5jaCBvZiBgSHR0cEludGVyY2VwdG9yYHNcbiAqIHRvIGEgcmVxdWVzdCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGUgZ2l2ZW4gYEh0dHBCYWNrZW5kYC5cbiAqXG4gKiBUaGUgaW50ZXJjZXB0b3JzIGFyZSBsb2FkZWQgbGF6aWx5IGZyb20gdGhlIGluamVjdG9yLCB0byBhbGxvd1xuICogaW50ZXJjZXB0b3JzIHRvIHRoZW1zZWx2ZXMgaW5qZWN0IGNsYXNzZXMgZGVwZW5kaW5nIGluZGlyZWN0bHlcbiAqIG9uIGBIdHRwSW50ZXJjZXB0aW5nSGFuZGxlcmAgaXRzZWxmLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cEludGVyY2VwdGluZ0hhbmRsZXIgaW1wbGVtZW50cyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IEh0dHBIYW5kbGVyfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYmFja2VuZDogSHR0cEJhY2tlbmQsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IHRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfSU5URVJDRVBUT1JTLCBbXSk7XG4gICAgICB0aGlzLmNoYWluID0gaW50ZXJjZXB0b3JzLnJlZHVjZVJpZ2h0KFxuICAgICAgICAgIChuZXh0LCBpbnRlcmNlcHRvcikgPT4gbmV3IEh0dHBJbnRlcmNlcHRvckhhbmRsZXIobmV4dCwgaW50ZXJjZXB0b3IpLCB0aGlzLmJhY2tlbmQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jaGFpbi5oYW5kbGUocmVxKTtcbiAgfVxufVxuXG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXJlIHRvIHN0b3JlIEpTT05QIGNhbGxiYWNrcy5cbiAqXG4gKiBPcmRpbmFyaWx5IEpTT05QIGNhbGxiYWNrcyBhcmUgc3RvcmVkIG9uIHRoZSBgd2luZG93YCBvYmplY3QsIGJ1dCB0aGlzIG1heSBub3QgZXhpc3RcbiAqIGluIHRlc3QgZW52aXJvbm1lbnRzLiBJbiB0aGF0IGNhc2UsIGNhbGxiYWNrcyBhcmUgc3RvcmVkIG9uIGFuIGFub255bW91cyBvYmplY3QgaW5zdGVhZC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24ganNvbnBDYWxsYmFja0NvbnRleHQoKTogT2JqZWN0IHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuICByZXR1cm4ge307XG59XG5cbi8qKlxuICogYE5nTW9kdWxlYCB3aGljaCBhZGRzIFhTUkYgcHJvdGVjdGlvbiBzdXBwb3J0IHRvIG91dGdvaW5nIHJlcXVlc3RzLlxuICpcbiAqIFByb3ZpZGVkIHRoZSBzZXJ2ZXIgc3VwcG9ydHMgYSBjb29raWUtYmFzZWQgWFNSRiBwcm90ZWN0aW9uIHN5c3RlbSwgdGhpc1xuICogbW9kdWxlIGNhbiBiZSB1c2VkIGRpcmVjdGx5IHRvIGNvbmZpZ3VyZSBYU1JGIHByb3RlY3Rpb24gd2l0aCB0aGUgY29ycmVjdFxuICogY29va2llIGFuZCBoZWFkZXIgbmFtZXMuXG4gKlxuICogSWYgbm8gc3VjaCBuYW1lcyBhcmUgcHJvdmlkZWQsIHRoZSBkZWZhdWx0IGlzIHRvIHVzZSBgWC1YU1JGLVRPS0VOYCBmb3JcbiAqIHRoZSBoZWFkZXIgbmFtZSBhbmQgYFhTUkYtVE9LRU5gIGZvciB0aGUgY29va2llIG5hbWUuXG4gKlxuICpcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgSHR0cFhzcmZJbnRlcmNlcHRvcixcbiAgICB7cHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsIHVzZUV4aXN0aW5nOiBIdHRwWHNyZkludGVyY2VwdG9yLCBtdWx0aTogdHJ1ZX0sXG4gICAge3Byb3ZpZGU6IEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsIHVzZUNsYXNzOiBIdHRwWHNyZkNvb2tpZUV4dHJhY3Rvcn0sXG4gICAge3Byb3ZpZGU6IFhTUkZfQ09PS0lFX05BTUUsIHVzZVZhbHVlOiAnWFNSRi1UT0tFTid9LFxuICAgIHtwcm92aWRlOiBYU1JGX0hFQURFUl9OQU1FLCB1c2VWYWx1ZTogJ1gtWFNSRi1UT0tFTid9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50WHNyZk1vZHVsZSB7XG4gIC8qKlxuICAgKiBEaXNhYmxlIHRoZSBkZWZhdWx0IFhTUkYgcHJvdGVjdGlvbi5cbiAgICovXG4gIHN0YXRpYyBkaXNhYmxlKCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge3Byb3ZpZGU6IEh0dHBYc3JmSW50ZXJjZXB0b3IsIHVzZUNsYXNzOiBOb29wSW50ZXJjZXB0b3J9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSBYU1JGIHByb3RlY3Rpb24gdG8gdXNlIHRoZSBnaXZlbiBjb29raWUgbmFtZSBvciBoZWFkZXIgbmFtZSxcbiAgICogb3IgdGhlIGRlZmF1bHQgbmFtZXMgKGFzIGRlc2NyaWJlZCBhYm92ZSkgaWYgbm90IHByb3ZpZGVkLlxuICAgKi9cbiAgc3RhdGljIHdpdGhPcHRpb25zKG9wdGlvbnM6IHtcbiAgICBjb29raWVOYW1lPzogc3RyaW5nLFxuICAgIGhlYWRlck5hbWU/OiBzdHJpbmcsXG4gIH0gPSB7fSk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgb3B0aW9ucy5jb29raWVOYW1lID8ge3Byb3ZpZGU6IFhTUkZfQ09PS0lFX05BTUUsIHVzZVZhbHVlOiBvcHRpb25zLmNvb2tpZU5hbWV9IDogW10sXG4gICAgICAgIG9wdGlvbnMuaGVhZGVyTmFtZSA/IHtwcm92aWRlOiBYU1JGX0hFQURFUl9OQU1FLCB1c2VWYWx1ZTogb3B0aW9ucy5oZWFkZXJOYW1lfSA6IFtdLFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogYE5nTW9kdWxlYCB3aGljaCBwcm92aWRlcyB0aGUgYEh0dHBDbGllbnRgIGFuZCBhc3NvY2lhdGVkIHNlcnZpY2VzLlxuICpcbiAqIEludGVyY2VwdG9ycyBjYW4gYmUgYWRkZWQgdG8gdGhlIGNoYWluIGJlaGluZCBgSHR0cENsaWVudGAgYnkgYmluZGluZyB0aGVtXG4gKiB0byB0aGUgbXVsdGlwcm92aWRlciBmb3IgYEhUVFBfSU5URVJDRVBUT1JTYC5cbiAqXG4gKlxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudFhzcmZNb2R1bGUud2l0aE9wdGlvbnMoe1xuICAgICAgY29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICAgICAgaGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG4gICAgfSksXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBDbGllbnQsXG4gICAge3Byb3ZpZGU6IEh0dHBIYW5kbGVyLCB1c2VDbGFzczogSHR0cEludGVyY2VwdGluZ0hhbmRsZXJ9LFxuICAgIEh0dHBYaHJCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBIdHRwQmFja2VuZCwgdXNlRXhpc3Rpbmc6IEh0dHBYaHJCYWNrZW5kfSxcbiAgICBCcm93c2VyWGhyLFxuICAgIHtwcm92aWRlOiBYaHJGYWN0b3J5LCB1c2VFeGlzdGluZzogQnJvd3Nlclhocn0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRNb2R1bGUge1xufVxuXG4vKipcbiAqIGBOZ01vZHVsZWAgd2hpY2ggZW5hYmxlcyBKU09OUCBzdXBwb3J0IGluIGBIdHRwQ2xpZW50YC5cbiAqXG4gKiBXaXRob3V0IHRoaXMgbW9kdWxlLCBKc29ucCByZXF1ZXN0cyB3aWxsIHJlYWNoIHRoZSBiYWNrZW5kXG4gKiB3aXRoIG1ldGhvZCBKU09OUCwgd2hlcmUgdGhleSdsbCBiZSByZWplY3RlZC5cbiAqXG4gKlxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBKc29ucENsaWVudEJhY2tlbmQsXG4gICAge3Byb3ZpZGU6IEpzb25wQ2FsbGJhY2tDb250ZXh0LCB1c2VGYWN0b3J5OiBqc29ucENhbGxiYWNrQ29udGV4dH0sXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VDbGFzczogSnNvbnBJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50SnNvbnBNb2R1bGUge1xufVxuIl19