/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT, ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { EnvironmentInjector, Inject, inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
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
class HttpXsrfCookieExtractor {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.3+sha-55244e6", ngImport: i0, type: HttpXsrfCookieExtractor, deps: [{ token: DOCUMENT }, { token: PLATFORM_ID }, { token: XSRF_COOKIE_NAME }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.3+sha-55244e6", ngImport: i0, type: HttpXsrfCookieExtractor }); }
}
export { HttpXsrfCookieExtractor };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3+sha-55244e6", ngImport: i0, type: HttpXsrfCookieExtractor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [XSRF_COOKIE_NAME]
                }] }]; } });
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
class HttpXsrfInterceptor {
    constructor(injector) {
        this.injector = injector;
    }
    intercept(initialRequest, next) {
        return this.injector.runInContext(() => xsrfInterceptorFn(initialRequest, downstreamRequest => next.handle(downstreamRequest)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.3+sha-55244e6", ngImport: i0, type: HttpXsrfInterceptor, deps: [{ token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.3+sha-55244e6", ngImport: i0, type: HttpXsrfInterceptor }); }
}
export { HttpXsrfInterceptor };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3+sha-55244e6", ngImport: i0, type: HttpXsrfInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.EnvironmentInjector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHNyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy94c3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRixPQUFPLEVBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFRM0csTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFVLGNBQWMsQ0FBQyxDQUFDO0FBRXhFLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLFlBQVksQ0FBQztBQUNyRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsRUFBRTtJQUM3RSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsd0JBQXdCO0NBQ3hDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLGNBQWMsQ0FBQztBQUN2RCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsRUFBRTtJQUM3RSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsd0JBQXdCO0NBQ3hDLENBQUMsQ0FBQztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLHNCQUFzQjtDQU8zQztBQUVEOztHQUVHO0FBQ0gsTUFDYSx1QkFBdUI7SUFTbEMsWUFDOEIsR0FBUSxFQUErQixRQUFnQixFQUMvQyxVQUFrQjtRQUQxQixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQStCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDL0MsZUFB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IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlQsIMm1cGFyc2VDb29raWVWYWx1ZSBhcyBwYXJzZUNvb2tpZVZhbHVlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yLCBJbmplY3QsIGluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIFBMQVRGT1JNX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIYW5kbGVyRm4sIEh0dHBJbnRlcmNlcHRvcn0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5leHBvcnQgY29uc3QgWFNSRl9FTkFCTEVEID0gbmV3IEluamVjdGlvblRva2VuPGJvb2xlYW4+KCdYU1JGX0VOQUJMRUQnKTtcblxuZXhwb3J0IGNvbnN0IFhTUkZfREVGQVVMVF9DT09LSUVfTkFNRSA9ICdYU1JGLVRPS0VOJztcbmV4cG9ydCBjb25zdCBYU1JGX0NPT0tJRV9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ1hTUkZfQ09PS0lFX05BTUUnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gWFNSRl9ERUZBVUxUX0NPT0tJRV9OQU1FLFxufSk7XG5cbmV4cG9ydCBjb25zdCBYU1JGX0RFRkFVTFRfSEVBREVSX05BTUUgPSAnWC1YU1JGLVRPS0VOJztcbmV4cG9ydCBjb25zdCBYU1JGX0hFQURFUl9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ1hTUkZfSEVBREVSX05BTUUnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gWFNSRl9ERUZBVUxUX0hFQURFUl9OQU1FLFxufSk7XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW50IFhTUkYgdG9rZW4gdG8gdXNlIHdpdGggdGhlIG5leHQgb3V0Z29pbmcgcmVxdWVzdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIdHRwWHNyZlRva2VuRXh0cmFjdG9yIHtcbiAgLyoqXG4gICAqIEdldCB0aGUgWFNSRiB0b2tlbiB0byB1c2Ugd2l0aCBhbiBvdXRnb2luZyByZXF1ZXN0LlxuICAgKlxuICAgKiBXaWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgcmVxdWVzdCwgc28gdGhlIHRva2VuIG1heSBjaGFuZ2UgYmV0d2VlbiByZXF1ZXN0cy5cbiAgICovXG4gIGFic3RyYWN0IGdldFRva2VuKCk6IHN0cmluZ3xudWxsO1xufVxuXG4vKipcbiAqIGBIdHRwWHNyZlRva2VuRXh0cmFjdG9yYCB3aGljaCByZXRyaWV2ZXMgdGhlIHRva2VuIGZyb20gYSBjb29raWUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwWHNyZkNvb2tpZUV4dHJhY3RvciBpbXBsZW1lbnRzIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3Ige1xuICBwcml2YXRlIGxhc3RDb29raWVTdHJpbmc6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIGxhc3RUb2tlbjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgZm9yIHRlc3RpbmdcbiAgICovXG4gIHBhcnNlQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvYzogYW55LCBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtOiBzdHJpbmcsXG4gICAgICBASW5qZWN0KFhTUkZfQ09PS0lFX05BTUUpIHByaXZhdGUgY29va2llTmFtZTogc3RyaW5nKSB7fVxuXG4gIGdldFRva2VuKCk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodGhpcy5wbGF0Zm9ybSA9PT0gJ3NlcnZlcicpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb29raWVTdHJpbmcgPSB0aGlzLmRvYy5jb29raWUgfHwgJyc7XG4gICAgaWYgKGNvb2tpZVN0cmluZyAhPT0gdGhpcy5sYXN0Q29va2llU3RyaW5nKSB7XG4gICAgICB0aGlzLnBhcnNlQ291bnQrKztcbiAgICAgIHRoaXMubGFzdFRva2VuID0gcGFyc2VDb29raWVWYWx1ZShjb29raWVTdHJpbmcsIHRoaXMuY29va2llTmFtZSk7XG4gICAgICB0aGlzLmxhc3RDb29raWVTdHJpbmcgPSBjb29raWVTdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxhc3RUb2tlbjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24geHNyZkludGVyY2VwdG9yRm4oXG4gICAgcmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDogSHR0cEhhbmRsZXJGbik6IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PiB7XG4gIGNvbnN0IGxjVXJsID0gcmVxLnVybC50b0xvd2VyQ2FzZSgpO1xuICAvLyBTa2lwIGJvdGggbm9uLW11dGF0aW5nIHJlcXVlc3RzIGFuZCBhYnNvbHV0ZSBVUkxzLlxuICAvLyBOb24tbXV0YXRpbmcgcmVxdWVzdHMgZG9uJ3QgcmVxdWlyZSBhIHRva2VuLCBhbmQgYWJzb2x1dGUgVVJMcyByZXF1aXJlIHNwZWNpYWwgaGFuZGxpbmdcbiAgLy8gYW55d2F5IGFzIHRoZSBjb29raWUgc2V0XG4gIC8vIG9uIG91ciBvcmlnaW4gaXMgbm90IHRoZSBzYW1lIGFzIHRoZSB0b2tlbiBleHBlY3RlZCBieSBhbm90aGVyIG9yaWdpbi5cbiAgaWYgKCFpbmplY3QoWFNSRl9FTkFCTEVEKSB8fCByZXEubWV0aG9kID09PSAnR0VUJyB8fCByZXEubWV0aG9kID09PSAnSEVBRCcgfHxcbiAgICAgIGxjVXJsLnN0YXJ0c1dpdGgoJ2h0dHA6Ly8nKSB8fCBsY1VybC5zdGFydHNXaXRoKCdodHRwczovLycpKSB7XG4gICAgcmV0dXJuIG5leHQocmVxKTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gaW5qZWN0KEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IpLmdldFRva2VuKCk7XG4gIGNvbnN0IGhlYWRlck5hbWUgPSBpbmplY3QoWFNSRl9IRUFERVJfTkFNRSk7XG5cbiAgLy8gQmUgY2FyZWZ1bCBub3QgdG8gb3ZlcndyaXRlIGFuIGV4aXN0aW5nIGhlYWRlciBvZiB0aGUgc2FtZSBuYW1lLlxuICBpZiAodG9rZW4gIT0gbnVsbCAmJiAhcmVxLmhlYWRlcnMuaGFzKGhlYWRlck5hbWUpKSB7XG4gICAgcmVxID0gcmVxLmNsb25lKHtoZWFkZXJzOiByZXEuaGVhZGVycy5zZXQoaGVhZGVyTmFtZSwgdG9rZW4pfSk7XG4gIH1cbiAgcmV0dXJuIG5leHQocmVxKTtcbn1cblxuLyoqXG4gKiBgSHR0cEludGVyY2VwdG9yYCB3aGljaCBhZGRzIGFuIFhTUkYgdG9rZW4gdG8gZWxpZ2libGUgb3V0Z29pbmcgcmVxdWVzdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwWHNyZkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcikge31cblxuICBpbnRlcmNlcHQoaW5pdGlhbFJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiB0aGlzLmluamVjdG9yLnJ1bkluQ29udGV4dChcbiAgICAgICAgKCkgPT5cbiAgICAgICAgICAgIHhzcmZJbnRlcmNlcHRvckZuKGluaXRpYWxSZXF1ZXN0LCBkb3duc3RyZWFtUmVxdWVzdCA9PiBuZXh0LmhhbmRsZShkb3duc3RyZWFtUmVxdWVzdCkpKTtcbiAgfVxufVxuIl19