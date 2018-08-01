/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { DOCUMENT, ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
export const XSRF_COOKIE_NAME = new InjectionToken('XSRF_COOKIE_NAME');
export const XSRF_HEADER_NAME = new InjectionToken('XSRF_HEADER_NAME');
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 *
 */
export class HttpXsrfTokenExtractor {
}
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
let HttpXsrfCookieExtractor = class HttpXsrfCookieExtractor {
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
};
HttpXsrfCookieExtractor = tslib_1.__decorate([
    Injectable(),
    tslib_1.__param(0, Inject(DOCUMENT)), tslib_1.__param(1, Inject(PLATFORM_ID)),
    tslib_1.__param(2, Inject(XSRF_COOKIE_NAME)),
    tslib_1.__metadata("design:paramtypes", [Object, String, String])
], HttpXsrfCookieExtractor);
export { HttpXsrfCookieExtractor };
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
let HttpXsrfInterceptor = class HttpXsrfInterceptor {
    constructor(tokenService, headerName) {
        this.tokenService = tokenService;
        this.headerName = headerName;
    }
    intercept(req, next) {
        const lcUrl = req.url.toLowerCase();
        // Skip both non-mutating requests and absolute URLs.
        // Non-mutating requests don't require a token, and absolute URLs require special handling
        // anyway as the cookie set
        // on our origin is not the same as the token expected by another origin.
        if (req.method === 'GET' || req.method === 'HEAD' || lcUrl.startsWith('http://') ||
            lcUrl.startsWith('https://')) {
            return next.handle(req);
        }
        const token = this.tokenService.getToken();
        // Be careful not to overwrite an existing header of the same name.
        if (token !== null && !req.headers.has(this.headerName)) {
            req = req.clone({ headers: req.headers.set(this.headerName, token) });
        }
        return next.handle(req);
    }
};
HttpXsrfInterceptor = tslib_1.__decorate([
    Injectable(),
    tslib_1.__param(1, Inject(XSRF_HEADER_NAME)),
    tslib_1.__metadata("design:paramtypes", [HttpXsrfTokenExtractor, String])
], HttpXsrfInterceptor);
export { HttpXsrfInterceptor };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHNyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy94c3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFFLGlCQUFpQixJQUFJLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDaEYsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQVE5RSxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsQ0FBQyxDQUFDO0FBQy9FLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFTLGtCQUFrQixDQUFDLENBQUM7QUFFL0U7Ozs7R0FJRztBQUNILE1BQU07Q0FPTDtBQUVEOztHQUVHO0FBRUgsSUFBYSx1QkFBdUIsR0FBcEM7SUFTRSxZQUM4QixHQUFRLEVBQStCLFFBQWdCLEVBQy9DLFVBQWtCO1FBRDFCLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBK0IsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUMvQyxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBVmhELHFCQUFnQixHQUFXLEVBQUUsQ0FBQztRQUM5QixjQUFTLEdBQWdCLElBQUksQ0FBQztRQUV0Qzs7V0FFRztRQUNILGVBQVUsR0FBVyxDQUFDLENBQUM7SUFJb0MsQ0FBQztJQUU1RCxRQUFRO1FBQ04sSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQzNDLElBQUksWUFBWSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUMxQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7U0FDdEM7UUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztDQUNGLENBQUE7QUF6QlksdUJBQXVCO0lBRG5DLFVBQVUsRUFBRTtJQVdOLG1CQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQSxFQUFvQixtQkFBQSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDdkQsbUJBQUEsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0dBWGxCLHVCQUF1QixDQXlCbkM7U0F6QlksdUJBQXVCO0FBMkJwQzs7R0FFRztBQUVILElBQWEsbUJBQW1CLEdBQWhDO0lBQ0UsWUFDWSxZQUFvQyxFQUNWLFVBQWtCO1FBRDVDLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtRQUNWLGVBQVUsR0FBVixVQUFVLENBQVE7SUFBRyxDQUFDO0lBRTVELFNBQVMsQ0FBQyxHQUFxQixFQUFFLElBQWlCO1FBQ2hELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMscURBQXFEO1FBQ3JELDBGQUEwRjtRQUMxRiwyQkFBMkI7UUFDM0IseUVBQXlFO1FBQ3pFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxLQUFLLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7WUFDNUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNoQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTNDLG1FQUFtRTtRQUNuRSxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDdkQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUM7U0FDckU7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQztDQUNGLENBQUE7QUF2QlksbUJBQW1CO0lBRC9CLFVBQVUsRUFBRTtJQUlOLG1CQUFBLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOzZDQURILHNCQUFzQjtHQUZyQyxtQkFBbUIsQ0F1Qi9CO1NBdkJZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVCwgybVwYXJzZUNvb2tpZVZhbHVlIGFzIHBhcnNlQ29va2llVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIFBMQVRGT1JNX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBJbnRlcmNlcHRvcn0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5leHBvcnQgY29uc3QgWFNSRl9DT09LSUVfTkFNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdYU1JGX0NPT0tJRV9OQU1FJyk7XG5leHBvcnQgY29uc3QgWFNSRl9IRUFERVJfTkFNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdYU1JGX0hFQURFUl9OQU1FJyk7XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW50IFhTUkYgdG9rZW4gdG8gdXNlIHdpdGggdGhlIG5leHQgb3V0Z29pbmcgcmVxdWVzdC5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSHR0cFhzcmZUb2tlbkV4dHJhY3RvciB7XG4gIC8qKlxuICAgKiBHZXQgdGhlIFhTUkYgdG9rZW4gdG8gdXNlIHdpdGggYW4gb3V0Z29pbmcgcmVxdWVzdC5cbiAgICpcbiAgICogV2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IHJlcXVlc3QsIHNvIHRoZSB0b2tlbiBtYXkgY2hhbmdlIGJldHdlZW4gcmVxdWVzdHMuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRUb2tlbigpOiBzdHJpbmd8bnVsbDtcbn1cblxuLyoqXG4gKiBgSHR0cFhzcmZUb2tlbkV4dHJhY3RvcmAgd2hpY2ggcmV0cmlldmVzIHRoZSB0b2tlbiBmcm9tIGEgY29va2llLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhzcmZDb29raWVFeHRyYWN0b3IgaW1wbGVtZW50cyBIdHRwWHNyZlRva2VuRXh0cmFjdG9yIHtcbiAgcHJpdmF0ZSBsYXN0Q29va2llU3RyaW5nOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBsYXN0VG9rZW46IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQGludGVybmFsIGZvciB0ZXN0aW5nXG4gICAqL1xuICBwYXJzZUNvdW50OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2M6IGFueSwgQEluamVjdChQTEFURk9STV9JRCkgcHJpdmF0ZSBwbGF0Zm9ybTogc3RyaW5nLFxuICAgICAgQEluamVjdChYU1JGX0NPT0tJRV9OQU1FKSBwcml2YXRlIGNvb2tpZU5hbWU6IHN0cmluZykge31cblxuICBnZXRUb2tlbigpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHRoaXMucGxhdGZvcm0gPT09ICdzZXJ2ZXInKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29va2llU3RyaW5nID0gdGhpcy5kb2MuY29va2llIHx8ICcnO1xuICAgIGlmIChjb29raWVTdHJpbmcgIT09IHRoaXMubGFzdENvb2tpZVN0cmluZykge1xuICAgICAgdGhpcy5wYXJzZUNvdW50Kys7XG4gICAgICB0aGlzLmxhc3RUb2tlbiA9IHBhcnNlQ29va2llVmFsdWUoY29va2llU3RyaW5nLCB0aGlzLmNvb2tpZU5hbWUpO1xuICAgICAgdGhpcy5sYXN0Q29va2llU3RyaW5nID0gY29va2llU3RyaW5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sYXN0VG9rZW47XG4gIH1cbn1cblxuLyoqXG4gKiBgSHR0cEludGVyY2VwdG9yYCB3aGljaCBhZGRzIGFuIFhTUkYgdG9rZW4gdG8gZWxpZ2libGUgb3V0Z29pbmcgcmVxdWVzdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwWHNyZkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHRva2VuU2VydmljZTogSHR0cFhzcmZUb2tlbkV4dHJhY3RvcixcbiAgICAgIEBJbmplY3QoWFNSRl9IRUFERVJfTkFNRSkgcHJpdmF0ZSBoZWFkZXJOYW1lOiBzdHJpbmcpIHt9XG5cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgY29uc3QgbGNVcmwgPSByZXEudXJsLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gU2tpcCBib3RoIG5vbi1tdXRhdGluZyByZXF1ZXN0cyBhbmQgYWJzb2x1dGUgVVJMcy5cbiAgICAvLyBOb24tbXV0YXRpbmcgcmVxdWVzdHMgZG9uJ3QgcmVxdWlyZSBhIHRva2VuLCBhbmQgYWJzb2x1dGUgVVJMcyByZXF1aXJlIHNwZWNpYWwgaGFuZGxpbmdcbiAgICAvLyBhbnl3YXkgYXMgdGhlIGNvb2tpZSBzZXRcbiAgICAvLyBvbiBvdXIgb3JpZ2luIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgdG9rZW4gZXhwZWN0ZWQgYnkgYW5vdGhlciBvcmlnaW4uXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdHRVQnIHx8IHJlcS5tZXRob2QgPT09ICdIRUFEJyB8fCBsY1VybC5zdGFydHNXaXRoKCdodHRwOi8vJykgfHxcbiAgICAgICAgbGNVcmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XG4gICAgfVxuICAgIGNvbnN0IHRva2VuID0gdGhpcy50b2tlblNlcnZpY2UuZ2V0VG9rZW4oKTtcblxuICAgIC8vIEJlIGNhcmVmdWwgbm90IHRvIG92ZXJ3cml0ZSBhbiBleGlzdGluZyBoZWFkZXIgb2YgdGhlIHNhbWUgbmFtZS5cbiAgICBpZiAodG9rZW4gIT09IG51bGwgJiYgIXJlcS5oZWFkZXJzLmhhcyh0aGlzLmhlYWRlck5hbWUpKSB7XG4gICAgICByZXEgPSByZXEuY2xvbmUoe2hlYWRlcnM6IHJlcS5oZWFkZXJzLnNldCh0aGlzLmhlYWRlck5hbWUsIHRva2VuKX0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgfVxufVxuIl19