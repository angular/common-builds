/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DOCUMENT, ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { EnvironmentInjector, Inject, inject, Injectable, InjectionToken, PLATFORM_ID, runInInjectionContext, } from '@angular/core';
import * as i0 from "@angular/core";
export const XSRF_ENABLED = new InjectionToken(ngDevMode ? 'XSRF_ENABLED' : '');
export const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
export const XSRF_COOKIE_NAME = new InjectionToken(ngDevMode ? 'XSRF_COOKIE_NAME' : '', {
    providedIn: 'root',
    factory: () => XSRF_DEFAULT_COOKIE_NAME,
});
export const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';
export const XSRF_HEADER_NAME = new InjectionToken(ngDevMode ? 'XSRF_HEADER_NAME' : '', {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.9+sha-69dce38", ngImport: i0, type: HttpXsrfCookieExtractor, deps: [{ token: DOCUMENT }, { token: PLATFORM_ID }, { token: XSRF_COOKIE_NAME }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.9+sha-69dce38", ngImport: i0, type: HttpXsrfCookieExtractor }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.9+sha-69dce38", ngImport: i0, type: HttpXsrfCookieExtractor, decorators: [{
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
    if (!inject(XSRF_ENABLED) ||
        req.method === 'GET' ||
        req.method === 'HEAD' ||
        lcUrl.startsWith('http://') ||
        lcUrl.startsWith('https://')) {
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
        return runInInjectionContext(this.injector, () => xsrfInterceptorFn(initialRequest, (downstreamRequest) => next.handle(downstreamRequest)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.9+sha-69dce38", ngImport: i0, type: HttpXsrfInterceptor, deps: [{ token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.9+sha-69dce38", ngImport: i0, type: HttpXsrfInterceptor }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.9+sha-69dce38", ngImport: i0, type: HttpXsrfInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHNyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy94c3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRixPQUFPLEVBQ0wsbUJBQW1CLEVBQ25CLE1BQU0sRUFDTixNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxXQUFXLEVBQ1gscUJBQXFCLEdBQ3RCLE1BQU0sZUFBZSxDQUFDOztBQVF2QixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQVUsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRXpGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLFlBQVksQ0FBQztBQUNyRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxTQUFTLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDOUYsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLHdCQUF3QjtDQUN4QyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRyxjQUFjLENBQUM7QUFDdkQsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxjQUFjLENBQVMsU0FBUyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0lBQzlGLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyx3QkFBd0I7Q0FDeEMsQ0FBQyxDQUFDO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0Isc0JBQXNCO0NB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QUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUN6RixDQUFDO0lBQ0osQ0FBQzt5SEFQVSxtQkFBbUI7NkhBQW5CLG1CQUFtQjs7c0dBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVCwgybVwYXJzZUNvb2tpZVZhbHVlIGFzIHBhcnNlQ29va2llVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBFbnZpcm9ubWVudEluamVjdG9yLFxuICBJbmplY3QsXG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIFBMQVRGT1JNX0lELFxuICBydW5JbkluamVjdGlvbkNvbnRleHQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhhbmRsZXJGbiwgSHR0cEludGVyY2VwdG9yfSBmcm9tICcuL2ludGVyY2VwdG9yJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmV4cG9ydCBjb25zdCBYU1JGX0VOQUJMRUQgPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4obmdEZXZNb2RlID8gJ1hTUkZfRU5BQkxFRCcgOiAnJyk7XG5cbmV4cG9ydCBjb25zdCBYU1JGX0RFRkFVTFRfQ09PS0lFX05BTUUgPSAnWFNSRi1UT0tFTic7XG5leHBvcnQgY29uc3QgWFNSRl9DT09LSUVfTkFNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KG5nRGV2TW9kZSA/ICdYU1JGX0NPT0tJRV9OQU1FJyA6ICcnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gWFNSRl9ERUZBVUxUX0NPT0tJRV9OQU1FLFxufSk7XG5cbmV4cG9ydCBjb25zdCBYU1JGX0RFRkFVTFRfSEVBREVSX05BTUUgPSAnWC1YU1JGLVRPS0VOJztcbmV4cG9ydCBjb25zdCBYU1JGX0hFQURFUl9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4obmdEZXZNb2RlID8gJ1hTUkZfSEVBREVSX05BTUUnIDogJycsIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICBmYWN0b3J5OiAoKSA9PiBYU1JGX0RFRkFVTFRfSEVBREVSX05BTUUsXG59KTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgWFNSRiB0b2tlbiB0byB1c2Ugd2l0aCB0aGUgbmV4dCBvdXRnb2luZyByZXF1ZXN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3Ige1xuICAvKipcbiAgICogR2V0IHRoZSBYU1JGIHRva2VuIHRvIHVzZSB3aXRoIGFuIG91dGdvaW5nIHJlcXVlc3QuXG4gICAqXG4gICAqIFdpbGwgYmUgY2FsbGVkIGZvciBldmVyeSByZXF1ZXN0LCBzbyB0aGUgdG9rZW4gbWF5IGNoYW5nZSBiZXR3ZWVuIHJlcXVlc3RzLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0VG9rZW4oKTogc3RyaW5nIHwgbnVsbDtcbn1cblxuLyoqXG4gKiBgSHR0cFhzcmZUb2tlbkV4dHJhY3RvcmAgd2hpY2ggcmV0cmlldmVzIHRoZSB0b2tlbiBmcm9tIGEgY29va2llLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhzcmZDb29raWVFeHRyYWN0b3IgaW1wbGVtZW50cyBIdHRwWHNyZlRva2VuRXh0cmFjdG9yIHtcbiAgcHJpdmF0ZSBsYXN0Q29va2llU3RyaW5nOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBsYXN0VG9rZW46IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgZm9yIHRlc3RpbmdcbiAgICovXG4gIHBhcnNlQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2M6IGFueSxcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtOiBzdHJpbmcsXG4gICAgQEluamVjdChYU1JGX0NPT0tJRV9OQU1FKSBwcml2YXRlIGNvb2tpZU5hbWU6IHN0cmluZyxcbiAgKSB7fVxuXG4gIGdldFRva2VuKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh0aGlzLnBsYXRmb3JtID09PSAnc2VydmVyJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvb2tpZVN0cmluZyA9IHRoaXMuZG9jLmNvb2tpZSB8fCAnJztcbiAgICBpZiAoY29va2llU3RyaW5nICE9PSB0aGlzLmxhc3RDb29raWVTdHJpbmcpIHtcbiAgICAgIHRoaXMucGFyc2VDb3VudCsrO1xuICAgICAgdGhpcy5sYXN0VG9rZW4gPSBwYXJzZUNvb2tpZVZhbHVlKGNvb2tpZVN0cmluZywgdGhpcy5jb29raWVOYW1lKTtcbiAgICAgIHRoaXMubGFzdENvb2tpZVN0cmluZyA9IGNvb2tpZVN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubGFzdFRva2VuO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB4c3JmSW50ZXJjZXB0b3JGbihcbiAgcmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPixcbiAgbmV4dDogSHR0cEhhbmRsZXJGbixcbik6IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PiB7XG4gIGNvbnN0IGxjVXJsID0gcmVxLnVybC50b0xvd2VyQ2FzZSgpO1xuICAvLyBTa2lwIGJvdGggbm9uLW11dGF0aW5nIHJlcXVlc3RzIGFuZCBhYnNvbHV0ZSBVUkxzLlxuICAvLyBOb24tbXV0YXRpbmcgcmVxdWVzdHMgZG9uJ3QgcmVxdWlyZSBhIHRva2VuLCBhbmQgYWJzb2x1dGUgVVJMcyByZXF1aXJlIHNwZWNpYWwgaGFuZGxpbmdcbiAgLy8gYW55d2F5IGFzIHRoZSBjb29raWUgc2V0XG4gIC8vIG9uIG91ciBvcmlnaW4gaXMgbm90IHRoZSBzYW1lIGFzIHRoZSB0b2tlbiBleHBlY3RlZCBieSBhbm90aGVyIG9yaWdpbi5cbiAgaWYgKFxuICAgICFpbmplY3QoWFNSRl9FTkFCTEVEKSB8fFxuICAgIHJlcS5tZXRob2QgPT09ICdHRVQnIHx8XG4gICAgcmVxLm1ldGhvZCA9PT0gJ0hFQUQnIHx8XG4gICAgbGNVcmwuc3RhcnRzV2l0aCgnaHR0cDovLycpIHx8XG4gICAgbGNVcmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKVxuICApIHtcbiAgICByZXR1cm4gbmV4dChyZXEpO1xuICB9XG5cbiAgY29uc3QgdG9rZW4gPSBpbmplY3QoSHR0cFhzcmZUb2tlbkV4dHJhY3RvcikuZ2V0VG9rZW4oKTtcbiAgY29uc3QgaGVhZGVyTmFtZSA9IGluamVjdChYU1JGX0hFQURFUl9OQU1FKTtcblxuICAvLyBCZSBjYXJlZnVsIG5vdCB0byBvdmVyd3JpdGUgYW4gZXhpc3RpbmcgaGVhZGVyIG9mIHRoZSBzYW1lIG5hbWUuXG4gIGlmICh0b2tlbiAhPSBudWxsICYmICFyZXEuaGVhZGVycy5oYXMoaGVhZGVyTmFtZSkpIHtcbiAgICByZXEgPSByZXEuY2xvbmUoe2hlYWRlcnM6IHJlcS5oZWFkZXJzLnNldChoZWFkZXJOYW1lLCB0b2tlbil9KTtcbiAgfVxuICByZXR1cm4gbmV4dChyZXEpO1xufVxuXG4vKipcbiAqIGBIdHRwSW50ZXJjZXB0b3JgIHdoaWNoIGFkZHMgYW4gWFNSRiB0b2tlbiB0byBlbGlnaWJsZSBvdXRnb2luZyByZXF1ZXN0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYc3JmSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKSB7fVxuXG4gIGludGVyY2VwdChpbml0aWFsUmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIHJ1bkluSW5qZWN0aW9uQ29udGV4dCh0aGlzLmluamVjdG9yLCAoKSA9PlxuICAgICAgeHNyZkludGVyY2VwdG9yRm4oaW5pdGlhbFJlcXVlc3QsIChkb3duc3RyZWFtUmVxdWVzdCkgPT4gbmV4dC5oYW5kbGUoZG93bnN0cmVhbVJlcXVlc3QpKSxcbiAgICApO1xuICB9XG59XG4iXX0=