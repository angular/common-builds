/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT, ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import * as i0 from "@angular/core";
export var XSRF_COOKIE_NAME = new InjectionToken('XSRF_COOKIE_NAME');
export var XSRF_HEADER_NAME = new InjectionToken('XSRF_HEADER_NAME');
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
var HttpXsrfTokenExtractor = /** @class */ (function () {
    function HttpXsrfTokenExtractor() {
    }
    return HttpXsrfTokenExtractor;
}());
export { HttpXsrfTokenExtractor };
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
var HttpXsrfCookieExtractor = /** @class */ (function () {
    function HttpXsrfCookieExtractor(doc, platform, cookieName) {
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
    HttpXsrfCookieExtractor.prototype.getToken = function () {
        if (this.platform === 'server') {
            return null;
        }
        var cookieString = this.doc.cookie || '';
        if (cookieString !== this.lastCookieString) {
            this.parseCount++;
            this.lastToken = parseCookieValue(cookieString, this.cookieName);
            this.lastCookieString = cookieString;
        }
        return this.lastToken;
    };
    HttpXsrfCookieExtractor.ɵfac = function HttpXsrfCookieExtractor_Factory(t) { return new (t || HttpXsrfCookieExtractor)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(PLATFORM_ID), i0.ɵɵinject(XSRF_COOKIE_NAME)); };
    HttpXsrfCookieExtractor.ɵprov = i0.ɵɵdefineInjectable({ token: HttpXsrfCookieExtractor, factory: HttpXsrfCookieExtractor.ɵfac, providedIn: null });
    return HttpXsrfCookieExtractor;
}());
export { HttpXsrfCookieExtractor };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpXsrfCookieExtractor, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [XSRF_COOKIE_NAME]
            }] }]; }, null); })();
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
var HttpXsrfInterceptor = /** @class */ (function () {
    function HttpXsrfInterceptor(tokenService, headerName) {
        this.tokenService = tokenService;
        this.headerName = headerName;
    }
    HttpXsrfInterceptor.prototype.intercept = function (req, next) {
        var lcUrl = req.url.toLowerCase();
        // Skip both non-mutating requests and absolute URLs.
        // Non-mutating requests don't require a token, and absolute URLs require special handling
        // anyway as the cookie set
        // on our origin is not the same as the token expected by another origin.
        if (req.method === 'GET' || req.method === 'HEAD' || lcUrl.startsWith('http://') ||
            lcUrl.startsWith('https://')) {
            return next.handle(req);
        }
        var token = this.tokenService.getToken();
        // Be careful not to overwrite an existing header of the same name.
        if (token !== null && !req.headers.has(this.headerName)) {
            req = req.clone({ headers: req.headers.set(this.headerName, token) });
        }
        return next.handle(req);
    };
    HttpXsrfInterceptor.ɵfac = function HttpXsrfInterceptor_Factory(t) { return new (t || HttpXsrfInterceptor)(i0.ɵɵinject(HttpXsrfTokenExtractor), i0.ɵɵinject(XSRF_HEADER_NAME)); };
    HttpXsrfInterceptor.ɵprov = i0.ɵɵdefineInjectable({ token: HttpXsrfInterceptor, factory: HttpXsrfInterceptor.ɵfac, providedIn: null });
    return HttpXsrfInterceptor;
}());
export { HttpXsrfInterceptor };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpXsrfInterceptor, [{
        type: Injectable
    }], function () { return [{ type: HttpXsrfTokenExtractor }, { type: undefined, decorators: [{
                type: Inject,
                args: [XSRF_HEADER_NAME]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHNyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy94c3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRixPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQVE5RSxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsQ0FBQyxDQUFDO0FBQy9FLE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFTLGtCQUFrQixDQUFDLENBQUM7QUFFL0U7Ozs7R0FJRztBQUNIO0lBQUE7SUFPQSxDQUFDO0lBQUQsNkJBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQzs7QUFFRDs7R0FFRztBQUNIO0lBVUUsaUNBQzhCLEdBQVEsRUFBK0IsUUFBZ0IsRUFDL0MsVUFBa0I7UUFEMUIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUErQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQy9DLGVBQVUsR0FBVixVQUFVLENBQVE7UUFWaEQscUJBQWdCLEdBQVcsRUFBRSxDQUFDO1FBQzlCLGNBQVMsR0FBZ0IsSUFBSSxDQUFDO1FBRXRDOztXQUVHO1FBQ0gsZUFBVSxHQUFXLENBQUMsQ0FBQztJQUlvQyxDQUFDO0lBRTVELDBDQUFRLEdBQVI7UUFDRSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDM0MsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQzFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQztTQUN0QztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO2tHQXhCVSx1QkFBdUIsY0FVdEIsUUFBUSxlQUE0QixXQUFXLGVBQy9DLGdCQUFnQjttRUFYakIsdUJBQXVCLFdBQXZCLHVCQUF1QjtrQ0F0Q3BDO0NBK0RDLEFBMUJELElBMEJDO1NBekJZLHVCQUF1QjtrREFBdkIsdUJBQXVCO2NBRG5DLFVBQVU7O3NCQVdKLE1BQU07dUJBQUMsUUFBUTs7c0JBQXFCLE1BQU07dUJBQUMsV0FBVzs7c0JBQ3RELE1BQU07dUJBQUMsZ0JBQWdCOztBQWdCOUI7O0dBRUc7QUFDSDtJQUVFLDZCQUNZLFlBQW9DLEVBQ1YsVUFBa0I7UUFENUMsaUJBQVksR0FBWixZQUFZLENBQXdCO1FBQ1YsZUFBVSxHQUFWLFVBQVUsQ0FBUTtJQUFHLENBQUM7SUFFNUQsdUNBQVMsR0FBVCxVQUFVLEdBQXFCLEVBQUUsSUFBaUI7UUFDaEQsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQyxxREFBcUQ7UUFDckQsMEZBQTBGO1FBQzFGLDJCQUEyQjtRQUMzQix5RUFBeUU7UUFDekUsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztZQUM1RSxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFM0MsbUVBQW1FO1FBQ25FLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN2RCxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQztTQUNyRTtRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDOzBGQXRCVSxtQkFBbUIsY0FFSixzQkFBc0IsZUFDcEMsZ0JBQWdCOytEQUhqQixtQkFBbUIsV0FBbkIsbUJBQW1COzhCQXJFaEM7Q0E0RkMsQUF4QkQsSUF3QkM7U0F2QlksbUJBQW1CO2tEQUFuQixtQkFBbUI7Y0FEL0IsVUFBVTtzQ0FHaUIsc0JBQXNCO3NCQUMzQyxNQUFNO3VCQUFDLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVCwgybVwYXJzZUNvb2tpZVZhbHVlIGFzIHBhcnNlQ29va2llVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIFBMQVRGT1JNX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBJbnRlcmNlcHRvcn0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5leHBvcnQgY29uc3QgWFNSRl9DT09LSUVfTkFNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdYU1JGX0NPT0tJRV9OQU1FJyk7XG5leHBvcnQgY29uc3QgWFNSRl9IRUFERVJfTkFNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdYU1JGX0hFQURFUl9OQU1FJyk7XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW50IFhTUkYgdG9rZW4gdG8gdXNlIHdpdGggdGhlIG5leHQgb3V0Z29pbmcgcmVxdWVzdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIdHRwWHNyZlRva2VuRXh0cmFjdG9yIHtcbiAgLyoqXG4gICAqIEdldCB0aGUgWFNSRiB0b2tlbiB0byB1c2Ugd2l0aCBhbiBvdXRnb2luZyByZXF1ZXN0LlxuICAgKlxuICAgKiBXaWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgcmVxdWVzdCwgc28gdGhlIHRva2VuIG1heSBjaGFuZ2UgYmV0d2VlbiByZXF1ZXN0cy5cbiAgICovXG4gIGFic3RyYWN0IGdldFRva2VuKCk6IHN0cmluZ3xudWxsO1xufVxuXG4vKipcbiAqIGBIdHRwWHNyZlRva2VuRXh0cmFjdG9yYCB3aGljaCByZXRyaWV2ZXMgdGhlIHRva2VuIGZyb20gYSBjb29raWUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwWHNyZkNvb2tpZUV4dHJhY3RvciBpbXBsZW1lbnRzIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3Ige1xuICBwcml2YXRlIGxhc3RDb29raWVTdHJpbmc6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIGxhc3RUb2tlbjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgZm9yIHRlc3RpbmdcbiAgICovXG4gIHBhcnNlQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvYzogYW55LCBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtOiBzdHJpbmcsXG4gICAgICBASW5qZWN0KFhTUkZfQ09PS0lFX05BTUUpIHByaXZhdGUgY29va2llTmFtZTogc3RyaW5nKSB7fVxuXG4gIGdldFRva2VuKCk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodGhpcy5wbGF0Zm9ybSA9PT0gJ3NlcnZlcicpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb29raWVTdHJpbmcgPSB0aGlzLmRvYy5jb29raWUgfHwgJyc7XG4gICAgaWYgKGNvb2tpZVN0cmluZyAhPT0gdGhpcy5sYXN0Q29va2llU3RyaW5nKSB7XG4gICAgICB0aGlzLnBhcnNlQ291bnQrKztcbiAgICAgIHRoaXMubGFzdFRva2VuID0gcGFyc2VDb29raWVWYWx1ZShjb29raWVTdHJpbmcsIHRoaXMuY29va2llTmFtZSk7XG4gICAgICB0aGlzLmxhc3RDb29raWVTdHJpbmcgPSBjb29raWVTdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxhc3RUb2tlbjtcbiAgfVxufVxuXG4vKipcbiAqIGBIdHRwSW50ZXJjZXB0b3JgIHdoaWNoIGFkZHMgYW4gWFNSRiB0b2tlbiB0byBlbGlnaWJsZSBvdXRnb2luZyByZXF1ZXN0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYc3JmSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgdG9rZW5TZXJ2aWNlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLFxuICAgICAgQEluamVjdChYU1JGX0hFQURFUl9OQU1FKSBwcml2YXRlIGhlYWRlck5hbWU6IHN0cmluZykge31cblxuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBjb25zdCBsY1VybCA9IHJlcS51cmwudG9Mb3dlckNhc2UoKTtcbiAgICAvLyBTa2lwIGJvdGggbm9uLW11dGF0aW5nIHJlcXVlc3RzIGFuZCBhYnNvbHV0ZSBVUkxzLlxuICAgIC8vIE5vbi1tdXRhdGluZyByZXF1ZXN0cyBkb24ndCByZXF1aXJlIGEgdG9rZW4sIGFuZCBhYnNvbHV0ZSBVUkxzIHJlcXVpcmUgc3BlY2lhbCBoYW5kbGluZ1xuICAgIC8vIGFueXdheSBhcyB0aGUgY29va2llIHNldFxuICAgIC8vIG9uIG91ciBvcmlnaW4gaXMgbm90IHRoZSBzYW1lIGFzIHRoZSB0b2tlbiBleHBlY3RlZCBieSBhbm90aGVyIG9yaWdpbi5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ0hFQUQnIHx8IGxjVXJsLnN0YXJ0c1dpdGgoJ2h0dHA6Ly8nKSB8fFxuICAgICAgICBsY1VybC5zdGFydHNXaXRoKCdodHRwczovLycpKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgICB9XG4gICAgY29uc3QgdG9rZW4gPSB0aGlzLnRva2VuU2VydmljZS5nZXRUb2tlbigpO1xuXG4gICAgLy8gQmUgY2FyZWZ1bCBub3QgdG8gb3ZlcndyaXRlIGFuIGV4aXN0aW5nIGhlYWRlciBvZiB0aGUgc2FtZSBuYW1lLlxuICAgIGlmICh0b2tlbiAhPT0gbnVsbCAmJiAhcmVxLmhlYWRlcnMuaGFzKHRoaXMuaGVhZGVyTmFtZSkpIHtcbiAgICAgIHJlcSA9IHJlcS5jbG9uZSh7aGVhZGVyczogcmVxLmhlYWRlcnMuc2V0KHRoaXMuaGVhZGVyTmFtZSwgdG9rZW4pfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICB9XG59XG4iXX0=