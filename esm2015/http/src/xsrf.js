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
export const XSRF_COOKIE_NAME = new InjectionToken('XSRF_COOKIE_NAME');
export const XSRF_HEADER_NAME = new InjectionToken('XSRF_HEADER_NAME');
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
let HttpXsrfCookieExtractor = /** @class */ (() => {
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
    }
    HttpXsrfCookieExtractor.ɵfac = function HttpXsrfCookieExtractor_Factory(t) { return new (t || HttpXsrfCookieExtractor)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(PLATFORM_ID), i0.ɵɵinject(XSRF_COOKIE_NAME)); };
    HttpXsrfCookieExtractor.ɵprov = i0.ɵɵdefineInjectable({ token: HttpXsrfCookieExtractor, factory: HttpXsrfCookieExtractor.ɵfac });
    return HttpXsrfCookieExtractor;
})();
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
let HttpXsrfInterceptor = /** @class */ (() => {
    class HttpXsrfInterceptor {
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
    }
    HttpXsrfInterceptor.ɵfac = function HttpXsrfInterceptor_Factory(t) { return new (t || HttpXsrfInterceptor)(i0.ɵɵinject(HttpXsrfTokenExtractor), i0.ɵɵinject(XSRF_HEADER_NAME)); };
    HttpXsrfInterceptor.ɵprov = i0.ɵɵdefineInjectable({ token: HttpXsrfInterceptor, factory: HttpXsrfInterceptor.ɵfac });
    return HttpXsrfInterceptor;
})();
export { HttpXsrfInterceptor };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpXsrfInterceptor, [{
        type: Injectable
    }], function () { return [{ type: HttpXsrfTokenExtractor }, { type: undefined, decorators: [{
                type: Inject,
                args: [XSRF_HEADER_NAME]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHNyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy94c3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRixPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQVE5RSxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsQ0FBQyxDQUFDO0FBQy9FLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFTLGtCQUFrQixDQUFDLENBQUM7QUFFL0U7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0Isc0JBQXNCO0NBTzNDO0FBRUQ7O0dBRUc7QUFDSDtJQUFBLE1BQ2EsdUJBQXVCO1FBU2xDLFlBQzhCLEdBQVEsRUFBK0IsUUFBZ0IsRUFDL0MsVUFBa0I7WUFEMUIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUErQixhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQy9DLGVBQVUsR0FBVixVQUFVLENBQVE7WUFWaEQscUJBQWdCLEdBQVcsRUFBRSxDQUFDO1lBQzlCLGNBQVMsR0FBZ0IsSUFBSSxDQUFDO1lBRXRDOztlQUVHO1lBQ0gsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUlvQyxDQUFDO1FBRTVELFFBQVE7WUFDTixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUM5QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1lBQzNDLElBQUksWUFBWSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7YUFDdEM7WUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDeEIsQ0FBQzs7a0dBeEJVLHVCQUF1QixjQVV0QixRQUFRLGVBQTRCLFdBQVcsZUFDL0MsZ0JBQWdCO21FQVhqQix1QkFBdUIsV0FBdkIsdUJBQXVCO2tDQXRDcEM7S0ErREM7U0F6QlksdUJBQXVCO2tEQUF2Qix1QkFBdUI7Y0FEbkMsVUFBVTs7c0JBV0osTUFBTTt1QkFBQyxRQUFROztzQkFBcUIsTUFBTTt1QkFBQyxXQUFXOztzQkFDdEQsTUFBTTt1QkFBQyxnQkFBZ0I7O0FBZ0I5Qjs7R0FFRztBQUNIO0lBQUEsTUFDYSxtQkFBbUI7UUFDOUIsWUFDWSxZQUFvQyxFQUNWLFVBQWtCO1lBRDVDLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtZQUNWLGVBQVUsR0FBVixVQUFVLENBQVE7UUFBRyxDQUFDO1FBRTVELFNBQVMsQ0FBQyxHQUFxQixFQUFFLElBQWlCO1lBQ2hELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEMscURBQXFEO1lBQ3JELDBGQUEwRjtZQUMxRiwyQkFBMkI7WUFDM0IseUVBQXlFO1lBQ3pFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxLQUFLLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7Z0JBQzVFLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN6QjtZQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFM0MsbUVBQW1FO1lBQ25FLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDdkQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUM7YUFDckU7WUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQzs7MEZBdEJVLG1CQUFtQixjQUVKLHNCQUFzQixlQUNwQyxnQkFBZ0I7K0RBSGpCLG1CQUFtQixXQUFuQixtQkFBbUI7OEJBckVoQztLQTRGQztTQXZCWSxtQkFBbUI7a0RBQW5CLG1CQUFtQjtjQUQvQixVQUFVO3NDQUdpQixzQkFBc0I7c0JBQzNDLE1BQU07dUJBQUMsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5ULCDJtXBhcnNlQ29va2llVmFsdWUgYXMgcGFyc2VDb29raWVWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgUExBVEZPUk1fSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEludGVyY2VwdG9yfSBmcm9tICcuL2ludGVyY2VwdG9yJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmV4cG9ydCBjb25zdCBYU1JGX0NPT0tJRV9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ1hTUkZfQ09PS0lFX05BTUUnKTtcbmV4cG9ydCBjb25zdCBYU1JGX0hFQURFUl9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ1hTUkZfSEVBREVSX05BTUUnKTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgWFNSRiB0b2tlbiB0byB1c2Ugd2l0aCB0aGUgbmV4dCBvdXRnb2luZyByZXF1ZXN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3Ige1xuICAvKipcbiAgICogR2V0IHRoZSBYU1JGIHRva2VuIHRvIHVzZSB3aXRoIGFuIG91dGdvaW5nIHJlcXVlc3QuXG4gICAqXG4gICAqIFdpbGwgYmUgY2FsbGVkIGZvciBldmVyeSByZXF1ZXN0LCBzbyB0aGUgdG9rZW4gbWF5IGNoYW5nZSBiZXR3ZWVuIHJlcXVlc3RzLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0VG9rZW4oKTogc3RyaW5nfG51bGw7XG59XG5cbi8qKlxuICogYEh0dHBYc3JmVG9rZW5FeHRyYWN0b3JgIHdoaWNoIHJldHJpZXZlcyB0aGUgdG9rZW4gZnJvbSBhIGNvb2tpZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYc3JmQ29va2llRXh0cmFjdG9yIGltcGxlbWVudHMgSHR0cFhzcmZUb2tlbkV4dHJhY3RvciB7XG4gIHByaXZhdGUgbGFzdENvb2tpZVN0cmluZzogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgbGFzdFRva2VuOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbCBmb3IgdGVzdGluZ1xuICAgKi9cbiAgcGFyc2VDb3VudDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jOiBhbnksIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcGxhdGZvcm06IHN0cmluZyxcbiAgICAgIEBJbmplY3QoWFNSRl9DT09LSUVfTkFNRSkgcHJpdmF0ZSBjb29raWVOYW1lOiBzdHJpbmcpIHt9XG5cbiAgZ2V0VG9rZW4oKTogc3RyaW5nfG51bGwge1xuICAgIGlmICh0aGlzLnBsYXRmb3JtID09PSAnc2VydmVyJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvb2tpZVN0cmluZyA9IHRoaXMuZG9jLmNvb2tpZSB8fCAnJztcbiAgICBpZiAoY29va2llU3RyaW5nICE9PSB0aGlzLmxhc3RDb29raWVTdHJpbmcpIHtcbiAgICAgIHRoaXMucGFyc2VDb3VudCsrO1xuICAgICAgdGhpcy5sYXN0VG9rZW4gPSBwYXJzZUNvb2tpZVZhbHVlKGNvb2tpZVN0cmluZywgdGhpcy5jb29raWVOYW1lKTtcbiAgICAgIHRoaXMubGFzdENvb2tpZVN0cmluZyA9IGNvb2tpZVN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubGFzdFRva2VuO1xuICB9XG59XG5cbi8qKlxuICogYEh0dHBJbnRlcmNlcHRvcmAgd2hpY2ggYWRkcyBhbiBYU1JGIHRva2VuIHRvIGVsaWdpYmxlIG91dGdvaW5nIHJlcXVlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhzcmZJbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSB0b2tlblNlcnZpY2U6IEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsXG4gICAgICBASW5qZWN0KFhTUkZfSEVBREVSX05BTUUpIHByaXZhdGUgaGVhZGVyTmFtZTogc3RyaW5nKSB7fVxuXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGNvbnN0IGxjVXJsID0gcmVxLnVybC50b0xvd2VyQ2FzZSgpO1xuICAgIC8vIFNraXAgYm90aCBub24tbXV0YXRpbmcgcmVxdWVzdHMgYW5kIGFic29sdXRlIFVSTHMuXG4gICAgLy8gTm9uLW11dGF0aW5nIHJlcXVlc3RzIGRvbid0IHJlcXVpcmUgYSB0b2tlbiwgYW5kIGFic29sdXRlIFVSTHMgcmVxdWlyZSBzcGVjaWFsIGhhbmRsaW5nXG4gICAgLy8gYW55d2F5IGFzIHRoZSBjb29raWUgc2V0XG4gICAgLy8gb24gb3VyIG9yaWdpbiBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIHRva2VuIGV4cGVjdGVkIGJ5IGFub3RoZXIgb3JpZ2luLlxuICAgIGlmIChyZXEubWV0aG9kID09PSAnR0VUJyB8fCByZXEubWV0aG9kID09PSAnSEVBRCcgfHwgbGNVcmwuc3RhcnRzV2l0aCgnaHR0cDovLycpIHx8XG4gICAgICAgIGxjVXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykpIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICAgIH1cbiAgICBjb25zdCB0b2tlbiA9IHRoaXMudG9rZW5TZXJ2aWNlLmdldFRva2VuKCk7XG5cbiAgICAvLyBCZSBjYXJlZnVsIG5vdCB0byBvdmVyd3JpdGUgYW4gZXhpc3RpbmcgaGVhZGVyIG9mIHRoZSBzYW1lIG5hbWUuXG4gICAgaWYgKHRva2VuICE9PSBudWxsICYmICFyZXEuaGVhZGVycy5oYXModGhpcy5oZWFkZXJOYW1lKSkge1xuICAgICAgcmVxID0gcmVxLmNsb25lKHtoZWFkZXJzOiByZXEuaGVhZGVycy5zZXQodGhpcy5oZWFkZXJOYW1lLCB0b2tlbil9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XG4gIH1cbn1cbiJdfQ==