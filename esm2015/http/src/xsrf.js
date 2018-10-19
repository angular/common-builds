import { DOCUMENT, ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @type {?} */
export const XSRF_COOKIE_NAME = new InjectionToken('XSRF_COOKIE_NAME');
/** @type {?} */
export const XSRF_HEADER_NAME = new InjectionToken('XSRF_HEADER_NAME');
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * \@publicApi
 * @abstract
 */
export class HttpXsrfTokenExtractor {
}
if (false) {
    /**
     * Get the XSRF token to use with an outgoing request.
     *
     * Will be called for every request, so the token may change between requests.
     * @abstract
     * @return {?}
     */
    HttpXsrfTokenExtractor.prototype.getToken = function () { };
}
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
export class HttpXsrfCookieExtractor {
    /**
     * @param {?} doc
     * @param {?} platform
     * @param {?} cookieName
     */
    constructor(doc, platform, cookieName) {
        this.doc = doc;
        this.platform = platform;
        this.cookieName = cookieName;
        this.lastCookieString = '';
        this.lastToken = null;
        /**
         * \@internal for testing
         */
        this.parseCount = 0;
    }
    /**
     * @return {?}
     */
    getToken() {
        if (this.platform === 'server') {
            return null;
        }
        /** @type {?} */
        const cookieString = this.doc.cookie || '';
        if (cookieString !== this.lastCookieString) {
            this.parseCount++;
            this.lastToken = parseCookieValue(cookieString, this.cookieName);
            this.lastCookieString = cookieString;
        }
        return this.lastToken;
    }
}
HttpXsrfCookieExtractor.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpXsrfCookieExtractor.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: String, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: String, decorators: [{ type: Inject, args: [XSRF_COOKIE_NAME,] }] }
];
HttpXsrfCookieExtractor.ngInjectableDef = i0.defineInjectable({ token: HttpXsrfCookieExtractor, factory: function HttpXsrfCookieExtractor_Factory(t) { return new (t || HttpXsrfCookieExtractor)(i0.inject(DOCUMENT), i0.inject(PLATFORM_ID), i0.inject(XSRF_COOKIE_NAME)); }, providedIn: null });
if (false) {
    /** @type {?} */
    HttpXsrfCookieExtractor.prototype.lastCookieString;
    /** @type {?} */
    HttpXsrfCookieExtractor.prototype.lastToken;
    /**
     * \@internal for testing
     * @type {?}
     */
    HttpXsrfCookieExtractor.prototype.parseCount;
    /** @type {?} */
    HttpXsrfCookieExtractor.prototype.doc;
    /** @type {?} */
    HttpXsrfCookieExtractor.prototype.platform;
    /** @type {?} */
    HttpXsrfCookieExtractor.prototype.cookieName;
}
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
export class HttpXsrfInterceptor {
    /**
     * @param {?} tokenService
     * @param {?} headerName
     */
    constructor(tokenService, headerName) {
        this.tokenService = tokenService;
        this.headerName = headerName;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    intercept(req, next) {
        /** @type {?} */
        const lcUrl = req.url.toLowerCase();
        // Skip both non-mutating requests and absolute URLs.
        // Non-mutating requests don't require a token, and absolute URLs require special handling
        // anyway as the cookie set
        // on our origin is not the same as the token expected by another origin.
        if (req.method === 'GET' || req.method === 'HEAD' || lcUrl.startsWith('http://') ||
            lcUrl.startsWith('https://')) {
            return next.handle(req);
        }
        /** @type {?} */
        const token = this.tokenService.getToken();
        // Be careful not to overwrite an existing header of the same name.
        if (token !== null && !req.headers.has(this.headerName)) {
            req = req.clone({ headers: req.headers.set(this.headerName, token) });
        }
        return next.handle(req);
    }
}
HttpXsrfInterceptor.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpXsrfInterceptor.ctorParameters = () => [
    { type: HttpXsrfTokenExtractor },
    { type: String, decorators: [{ type: Inject, args: [XSRF_HEADER_NAME,] }] }
];
HttpXsrfInterceptor.ngInjectableDef = i0.defineInjectable({ token: HttpXsrfInterceptor, factory: function HttpXsrfInterceptor_Factory(t) { return new (t || HttpXsrfInterceptor)(i0.inject(HttpXsrfTokenExtractor), i0.inject(XSRF_HEADER_NAME)); }, providedIn: null });
if (false) {
    /** @type {?} */
    HttpXsrfInterceptor.prototype.tokenService;
    /** @type {?} */
    HttpXsrfInterceptor.prototype.headerName;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHNyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy94c3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRixPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7OztBQVE5RSxhQUFhLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFTLGtCQUFrQixDQUFDLENBQUM7O0FBQy9FLGFBQWEsZ0JBQWdCLEdBQUcsSUFBSSxjQUFjLENBQVMsa0JBQWtCLENBQUMsQ0FBQzs7Ozs7OztBQU8vRSxNQUFNLE9BQWdCLHNCQUFzQjtDQU8zQzs7Ozs7Ozs7Ozs7Ozs7QUFNRCxNQUFNLE9BQU8sdUJBQXVCOzs7Ozs7SUFTbEMsWUFDOEIsR0FBUSxFQUErQixRQUFnQixFQUMvQyxVQUFrQjtRQUQxQixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQStCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDL0MsZUFBVSxHQUFWLFVBQVUsQ0FBUTtnQ0FWckIsRUFBRTt5QkFDSixJQUFJOzs7O1FBS3JDLGtCQUFxQixDQUFDLENBQUM7S0FJcUM7Ozs7SUFFNUQsUUFBUTtRQUNOLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUM7U0FDYjs7UUFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDM0MsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQzFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQztTQUN0QztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN2Qjs7O1lBekJGLFVBQVU7Ozs7NENBV0osTUFBTSxTQUFDLFFBQVE7eUNBQXFCLE1BQU0sU0FBQyxXQUFXO3lDQUN0RCxNQUFNLFNBQUMsZ0JBQWdCOzt1RUFYakIsdUJBQXVCLDBFQUF2Qix1QkFBdUIsWUFVdEIsUUFBUSxhQUE0QixXQUFXLGFBQy9DLGdCQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0I5QixNQUFNLE9BQU8sbUJBQW1COzs7OztJQUM5QixZQUNZLGNBQzBCLFVBQWtCO1FBRDVDLGlCQUFZLEdBQVosWUFBWTtRQUNjLGVBQVUsR0FBVixVQUFVLENBQVE7S0FBSTs7Ozs7O0lBRTVELFNBQVMsQ0FBQyxHQUFxQixFQUFFLElBQWlCOztRQUNoRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDOzs7OztRQUtwQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO1lBQzVFLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3pCOztRQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7O1FBRzNDLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN2RCxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQztTQUNyRTtRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN6Qjs7O1lBdkJGLFVBQVU7Ozs7WUFHaUIsc0JBQXNCO3lDQUMzQyxNQUFNLFNBQUMsZ0JBQWdCOzttRUFIakIsbUJBQW1CLHNFQUFuQixtQkFBbUIsWUFFSixzQkFBc0IsYUFDcEMsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5ULCDJtXBhcnNlQ29va2llVmFsdWUgYXMgcGFyc2VDb29raWVWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgUExBVEZPUk1fSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEludGVyY2VwdG9yfSBmcm9tICcuL2ludGVyY2VwdG9yJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmV4cG9ydCBjb25zdCBYU1JGX0NPT0tJRV9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ1hTUkZfQ09PS0lFX05BTUUnKTtcbmV4cG9ydCBjb25zdCBYU1JGX0hFQURFUl9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ1hTUkZfSEVBREVSX05BTUUnKTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgWFNSRiB0b2tlbiB0byB1c2Ugd2l0aCB0aGUgbmV4dCBvdXRnb2luZyByZXF1ZXN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3Ige1xuICAvKipcbiAgICogR2V0IHRoZSBYU1JGIHRva2VuIHRvIHVzZSB3aXRoIGFuIG91dGdvaW5nIHJlcXVlc3QuXG4gICAqXG4gICAqIFdpbGwgYmUgY2FsbGVkIGZvciBldmVyeSByZXF1ZXN0LCBzbyB0aGUgdG9rZW4gbWF5IGNoYW5nZSBiZXR3ZWVuIHJlcXVlc3RzLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0VG9rZW4oKTogc3RyaW5nfG51bGw7XG59XG5cbi8qKlxuICogYEh0dHBYc3JmVG9rZW5FeHRyYWN0b3JgIHdoaWNoIHJldHJpZXZlcyB0aGUgdG9rZW4gZnJvbSBhIGNvb2tpZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYc3JmQ29va2llRXh0cmFjdG9yIGltcGxlbWVudHMgSHR0cFhzcmZUb2tlbkV4dHJhY3RvciB7XG4gIHByaXZhdGUgbGFzdENvb2tpZVN0cmluZzogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgbGFzdFRva2VuOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbCBmb3IgdGVzdGluZ1xuICAgKi9cbiAgcGFyc2VDb3VudDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jOiBhbnksIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcGxhdGZvcm06IHN0cmluZyxcbiAgICAgIEBJbmplY3QoWFNSRl9DT09LSUVfTkFNRSkgcHJpdmF0ZSBjb29raWVOYW1lOiBzdHJpbmcpIHt9XG5cbiAgZ2V0VG9rZW4oKTogc3RyaW5nfG51bGwge1xuICAgIGlmICh0aGlzLnBsYXRmb3JtID09PSAnc2VydmVyJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvb2tpZVN0cmluZyA9IHRoaXMuZG9jLmNvb2tpZSB8fCAnJztcbiAgICBpZiAoY29va2llU3RyaW5nICE9PSB0aGlzLmxhc3RDb29raWVTdHJpbmcpIHtcbiAgICAgIHRoaXMucGFyc2VDb3VudCsrO1xuICAgICAgdGhpcy5sYXN0VG9rZW4gPSBwYXJzZUNvb2tpZVZhbHVlKGNvb2tpZVN0cmluZywgdGhpcy5jb29raWVOYW1lKTtcbiAgICAgIHRoaXMubGFzdENvb2tpZVN0cmluZyA9IGNvb2tpZVN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubGFzdFRva2VuO1xuICB9XG59XG5cbi8qKlxuICogYEh0dHBJbnRlcmNlcHRvcmAgd2hpY2ggYWRkcyBhbiBYU1JGIHRva2VuIHRvIGVsaWdpYmxlIG91dGdvaW5nIHJlcXVlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhzcmZJbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSB0b2tlblNlcnZpY2U6IEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsXG4gICAgICBASW5qZWN0KFhTUkZfSEVBREVSX05BTUUpIHByaXZhdGUgaGVhZGVyTmFtZTogc3RyaW5nKSB7fVxuXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGNvbnN0IGxjVXJsID0gcmVxLnVybC50b0xvd2VyQ2FzZSgpO1xuICAgIC8vIFNraXAgYm90aCBub24tbXV0YXRpbmcgcmVxdWVzdHMgYW5kIGFic29sdXRlIFVSTHMuXG4gICAgLy8gTm9uLW11dGF0aW5nIHJlcXVlc3RzIGRvbid0IHJlcXVpcmUgYSB0b2tlbiwgYW5kIGFic29sdXRlIFVSTHMgcmVxdWlyZSBzcGVjaWFsIGhhbmRsaW5nXG4gICAgLy8gYW55d2F5IGFzIHRoZSBjb29raWUgc2V0XG4gICAgLy8gb24gb3VyIG9yaWdpbiBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIHRva2VuIGV4cGVjdGVkIGJ5IGFub3RoZXIgb3JpZ2luLlxuICAgIGlmIChyZXEubWV0aG9kID09PSAnR0VUJyB8fCByZXEubWV0aG9kID09PSAnSEVBRCcgfHwgbGNVcmwuc3RhcnRzV2l0aCgnaHR0cDovLycpIHx8XG4gICAgICAgIGxjVXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykpIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICAgIH1cbiAgICBjb25zdCB0b2tlbiA9IHRoaXMudG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XG5cbiAgICAvLyBCZSBjYXJlZnVsIG5vdCB0byBvdmVyd3JpdGUgYW4gZXhpc3RpbmcgaGVhZGVyIG9mIHRoZSBzYW1lIG5hbWUuXG4gICAgaWYgKHRva2VuICE9PSBudWxsICYmICFyZXEuaGVhZGVycy5oYXModGhpcy5oZWFkZXJOYW1lKSkge1xuICAgICAgcmVxID0gcmVxLmNsb25lKHtoZWFkZXJzOiByZXEuaGVhZGVycy5zZXQodGhpcy5oZWFkZXJOYW1lLCB0b2tlbil9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XG4gIH1cbn1cbiJdfQ==