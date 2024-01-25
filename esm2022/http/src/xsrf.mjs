/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT, ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { EnvironmentInjector, Inject, inject, Injectable, InjectionToken, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import * as i0 from "@angular/core";
export const XSRF_ENABLED = new InjectionToken('XSRF_ENABLED');
export const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
export const XSRF_COOKIE_NAME = new InjectionToken('XSRF_COOKIE_NAME', {
    providedIn: 'root',
    factory: () => XSRF_DEFAULT_COOKIE_NAME,
});
export const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';
export const XSRF_HEADER_NAME = new InjectionToken('XSRF_HEADER_NAME', {
    providedIn: 'root',
    factory: () => XSRF_DEFAULT_HEADER_NAME,
});
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
export class HttpXsrfTokenExtractor {
}
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
export class HttpXsrfCookieExtractor {
    constructor(doc, platform, cookieName) {
        this.doc = doc;
        this.platform = platform;
        this.cookieName = cookieName;
        this.lastCookieString = '';
        this.lastToken = null;
        /**
         * @internal for testing
         */
        this.parseCount = 0;
    }
    getToken() {
        if (this.platform === 'server') {
            return null;
        }
        const cookieString = this.doc.cookie || '';
        if (cookieString !== this.lastCookieString) {
            this.parseCount++;
            this.lastToken = parseCookieValue(cookieString, this.cookieName);
            this.lastCookieString = cookieString;
        }
        return this.lastToken;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.1+sha-50b7901", ngImport: i0, type: HttpXsrfCookieExtractor, deps: [{ token: DOCUMENT }, { token: PLATFORM_ID }, { token: XSRF_COOKIE_NAME }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.1+sha-50b7901", ngImport: i0, type: HttpXsrfCookieExtractor }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.1+sha-50b7901", ngImport: i0, type: HttpXsrfCookieExtractor, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [XSRF_COOKIE_NAME]
                }] }] });
export function xsrfInterceptorFn(req, next) {
    const lcUrl = req.url.toLowerCase();
    // Skip both non-mutating requests and absolute URLs.
    // Non-mutating requests don't require a token, and absolute URLs require special handling
    // anyway as the cookie set
    // on our origin is not the same as the token expected by another origin.
    if (!inject(XSRF_ENABLED) || req.method === 'GET' || req.method === 'HEAD' ||
        lcUrl.startsWith('http://') || lcUrl.startsWith('https://')) {
        return next(req);
    }
    const token = inject(HttpXsrfTokenExtractor).getToken();
    const headerName = inject(XSRF_HEADER_NAME);
    // Be careful not to overwrite an existing header of the same name.
    if (token != null && !req.headers.has(headerName)) {
        req = req.clone({ headers: req.headers.set(headerName, token) });
    }
    return next(req);
}
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
export class HttpXsrfInterceptor {
    constructor(injector) {
        this.injector = injector;
    }
    intercept(initialRequest, next) {
        return runInInjectionContext(this.injector, () => xsrfInterceptorFn(initialRequest, downstreamRequest => next.handle(downstreamRequest)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.1+sha-50b7901", ngImport: i0, type: HttpXsrfInterceptor, deps: [{ token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.1+sha-50b7901", ngImport: i0, type: HttpXsrfInterceptor }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.1+sha-50b7901", ngImport: i0, type: HttpXsrfInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHNyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy94c3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRixPQUFPLEVBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFRbEksTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFVLGNBQWMsQ0FBQyxDQUFDO0FBRXhFLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLFlBQVksQ0FBQztBQUNyRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsRUFBRTtJQUM3RSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsd0JBQXdCO0NBQ3hDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLGNBQWMsQ0FBQztBQUN2RCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsRUFBRTtJQUM3RSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsd0JBQXdCO0NBQ3hDLENBQUMsQ0FBQztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLHNCQUFzQjtDQU8zQztBQUVEOztHQUVHO0FBRUgsTUFBTSxPQUFPLHVCQUF1QjtJQVNsQyxZQUM4QixHQUFRLEVBQStCLFFBQWdCLEVBQy9DLFVBQWtCO1FBRDFCLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBK0IsYUFBUSxHQUFSLFFB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dGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVCwgybVwYXJzZUNvb2tpZVZhbHVlIGFzIHBhcnNlQ29va2llVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0Vudmlyb25tZW50SW5qZWN0b3IsIEluamVjdCwgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgUExBVEZPUk1fSUQsIHJ1bkluSW5qZWN0aW9uQ29udGV4dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwSGFuZGxlckZuLCBIdHRwSW50ZXJjZXB0b3J9IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuZXhwb3J0IGNvbnN0IFhTUkZfRU5BQkxFRCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPignWFNSRl9FTkFCTEVEJyk7XG5cbmV4cG9ydCBjb25zdCBYU1JGX0RFRkFVTFRfQ09PS0lFX05BTUUgPSAnWFNSRi1UT0tFTic7XG5leHBvcnQgY29uc3QgWFNSRl9DT09LSUVfTkFNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdYU1JGX0NPT0tJRV9OQU1FJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6ICgpID0+IFhTUkZfREVGQVVMVF9DT09LSUVfTkFNRSxcbn0pO1xuXG5leHBvcnQgY29uc3QgWFNSRl9ERUZBVUxUX0hFQURFUl9OQU1FID0gJ1gtWFNSRi1UT0tFTic7XG5leHBvcnQgY29uc3QgWFNSRl9IRUFERVJfTkFNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdYU1JGX0hFQURFUl9OQU1FJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6ICgpID0+IFhTUkZfREVGQVVMVF9IRUFERVJfTkFNRSxcbn0pO1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBYU1JGIHRva2VuIHRvIHVzZSB3aXRoIHRoZSBuZXh0IG91dGdvaW5nIHJlcXVlc3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSHR0cFhzcmZUb2tlbkV4dHJhY3RvciB7XG4gIC8qKlxuICAgKiBHZXQgdGhlIFhTUkYgdG9rZW4gdG8gdXNlIHdpdGggYW4gb3V0Z29pbmcgcmVxdWVzdC5cbiAgICpcbiAgICogV2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IHJlcXVlc3QsIHNvIHRoZSB0b2tlbiBtYXkgY2hhbmdlIGJldHdlZW4gcmVxdWVzdHMuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRUb2tlbigpOiBzdHJpbmd8bnVsbDtcbn1cblxuLyoqXG4gKiBgSHR0cFhzcmZUb2tlbkV4dHJhY3RvcmAgd2hpY2ggcmV0cmlldmVzIHRoZSB0b2tlbiBmcm9tIGEgY29va2llLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhzcmZDb29raWVFeHRyYWN0b3IgaW1wbGVtZW50cyBIdHRwWHNyZlRva2VuRXh0cmFjdG9yIHtcbiAgcHJpdmF0ZSBsYXN0Q29va2llU3RyaW5nOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBsYXN0VG9rZW46IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQGludGVybmFsIGZvciB0ZXN0aW5nXG4gICAqL1xuICBwYXJzZUNvdW50OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2M6IGFueSwgQEluamVjdChQTEFURk9STV9JRCkgcHJpdmF0ZSBwbGF0Zm9ybTogc3RyaW5nLFxuICAgICAgQEluamVjdChYU1JGX0NPT0tJRV9OQU1FKSBwcml2YXRlIGNvb2tpZU5hbWU6IHN0cmluZykge31cblxuICBnZXRUb2tlbigpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHRoaXMucGxhdGZvcm0gPT09ICdzZXJ2ZXInKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29va2llU3RyaW5nID0gdGhpcy5kb2MuY29va2llIHx8ICcnO1xuICAgIGlmIChjb29raWVTdHJpbmcgIT09IHRoaXMubGFzdENvb2tpZVN0cmluZykge1xuICAgICAgdGhpcy5wYXJzZUNvdW50Kys7XG4gICAgICB0aGlzLmxhc3RUb2tlbiA9IHBhcnNlQ29va2llVmFsdWUoY29va2llU3RyaW5nLCB0aGlzLmNvb2tpZU5hbWUpO1xuICAgICAgdGhpcy5sYXN0Q29va2llU3RyaW5nID0gY29va2llU3RyaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sYXN0VG9rZW47XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHhzcmZJbnRlcmNlcHRvckZuKFxuICAgIHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6IEh0dHBIYW5kbGVyRm4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj4ge1xuICBjb25zdCBsY1VybCA9IHJlcS51cmwudG9Mb3dlckNhc2UoKTtcbiAgLy8gU2tpcCBib3RoIG5vbi1tdXRhdGluZyByZXF1ZXN0cyBhbmQgYWJzb2x1dGUgVVJMcy5cbiAgLy8gTm9uLW11dGF0aW5nIHJlcXVlc3RzIGRvbid0IHJlcXVpcmUgYSB0b2tlbiwgYW5kIGFic29sdXRlIFVSTHMgcmVxdWlyZSBzcGVjaWFsIGhhbmRsaW5nXG4gIC8vIGFueXdheSBhcyB0aGUgY29va2llIHNldFxuICAvLyBvbiBvdXIgb3JpZ2luIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgdG9rZW4gZXhwZWN0ZWQgYnkgYW5vdGhlciBvcmlnaW4uXG4gIGlmICghaW5qZWN0KFhTUkZfRU5BQkxFRCkgfHwgcmVxLm1ldGhvZCA9PT0gJ0dFVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ0hFQUQnIHx8XG4gICAgICBsY1VybC5zdGFydHNXaXRoKCdodHRwOi8vJykgfHwgbGNVcmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkge1xuICAgIHJldHVybiBuZXh0KHJlcSk7XG4gIH1cblxuICBjb25zdCB0b2tlbiA9IGluamVjdChIdHRwWHNyZlRva2VuRXh0cmFjdG9yKS5nZXRUb2tlbigpO1xuICBjb25zdCBoZWFkZXJOYW1lID0gaW5qZWN0KFhTUkZfSEVBREVSX05BTUUpO1xuXG4gIC8vIEJlIGNhcmVmdWwgbm90IHRvIG92ZXJ3cml0ZSBhbiBleGlzdGluZyBoZWFkZXIgb2YgdGhlIHNhbWUgbmFtZS5cbiAgaWYgKHRva2VuICE9IG51bGwgJiYgIXJlcS5oZWFkZXJzLmhhcyhoZWFkZXJOYW1lKSkge1xuICAgIHJlcSA9IHJlcS5jbG9uZSh7aGVhZGVyczogcmVxLmhlYWRlcnMuc2V0KGhlYWRlck5hbWUsIHRva2VuKX0pO1xuICB9XG4gIHJldHVybiBuZXh0KHJlcSk7XG59XG5cbi8qKlxuICogYEh0dHBJbnRlcmNlcHRvcmAgd2hpY2ggYWRkcyBhbiBYU1JGIHRva2VuIHRvIGVsaWdpYmxlIG91dGdvaW5nIHJlcXVlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhzcmZJbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IpIHt9XG5cbiAgaW50ZXJjZXB0KGluaXRpYWxSZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICByZXR1cm4gcnVuSW5JbmplY3Rpb25Db250ZXh0KFxuICAgICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgICAoKSA9PlxuICAgICAgICAgICAgeHNyZkludGVyY2VwdG9yRm4oaW5pdGlhbFJlcXVlc3QsIGRvd25zdHJlYW1SZXF1ZXN0ID0+IG5leHQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSkpO1xuICB9XG59XG4iXX0=