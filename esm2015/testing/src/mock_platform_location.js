/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/testing/src/mock_platform_location.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Parser from https://tools.ietf.org/html/rfc3986#appendix-B
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 *
 * Example: http://www.ics.uci.edu/pub/ietf/uri/#Related
 *
 * Results in:
 *
 * $1 = http:
 * $2 = http
 * $3 = //www.ics.uci.edu
 * $4 = www.ics.uci.edu
 * $5 = /pub/ietf/uri/
 * $6 = <undefined>
 * $7 = <undefined>
 * $8 = #Related
 * $9 = Related
 * @type {?}
 */
const urlParse = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
/**
 * @param {?} urlStr
 * @param {?} baseHref
 * @return {?}
 */
function parseUrl(urlStr, baseHref) {
    /** @type {?} */
    const verifyProtocol = /^((http[s]?|ftp):\/\/)/;
    /** @type {?} */
    let serverBase;
    // URL class requires full URL. If the URL string doesn't start with protocol, we need to add
    // an arbitrary base URL which can be removed afterward.
    if (!verifyProtocol.test(urlStr)) {
        serverBase = 'http://empty.com/';
    }
    /** @type {?} */
    let parsedUrl;
    try {
        parsedUrl = new URL(urlStr, serverBase);
    }
    catch (e) {
        /** @type {?} */
        const result = urlParse.exec(serverBase || '' + urlStr);
        if (!result) {
            throw new Error(`Invalid URL: ${urlStr} with base: ${baseHref}`);
        }
        /** @type {?} */
        const hostSplit = result[4].split(':');
        parsedUrl = {
            protocol: result[1],
            hostname: hostSplit[0],
            port: hostSplit[1] || '',
            pathname: result[5],
            search: result[6],
            hash: result[8],
        };
    }
    if (parsedUrl.pathname && parsedUrl.pathname.indexOf(baseHref) === 0) {
        parsedUrl.pathname = parsedUrl.pathname.substring(baseHref.length);
    }
    return {
        hostname: !serverBase && parsedUrl.hostname || '',
        protocol: !serverBase && parsedUrl.protocol || '',
        port: !serverBase && parsedUrl.port || '',
        pathname: parsedUrl.pathname || '/',
        search: parsedUrl.search || '',
        hash: parsedUrl.hash || '',
    };
}
/**
 * Mock platform location config
 *
 * \@publicApi
 * @record
 */
export function MockPlatformLocationConfig() { }
if (false) {
    /** @type {?|undefined} */
    MockPlatformLocationConfig.prototype.startUrl;
    /** @type {?|undefined} */
    MockPlatformLocationConfig.prototype.appBaseHref;
}
/**
 * Provider for mock platform location config
 *
 * \@publicApi
 * @type {?}
 */
export const MOCK_PLATFORM_LOCATION_CONFIG = new InjectionToken('MOCK_PLATFORM_LOCATION_CONFIG');
/**
 * Mock implementation of URL state.
 *
 * \@publicApi
 */
export class MockPlatformLocation {
    /**
     * @param {?=} config
     */
    constructor(config) {
        this.baseHref = '';
        this.hashUpdate = new Subject();
        this.urlChanges = [{ hostname: '', protocol: '', port: '', pathname: '/', search: '', hash: '', state: null }];
        if (config) {
            this.baseHref = config.appBaseHref || '';
            /** @type {?} */
            const parsedChanges = this.parseChanges(null, config.startUrl || 'http://<empty>/', this.baseHref);
            this.urlChanges[0] = Object.assign({}, parsedChanges);
        }
    }
    /**
     * @return {?}
     */
    get hostname() { return this.urlChanges[0].hostname; }
    /**
     * @return {?}
     */
    get protocol() { return this.urlChanges[0].protocol; }
    /**
     * @return {?}
     */
    get port() { return this.urlChanges[0].port; }
    /**
     * @return {?}
     */
    get pathname() { return this.urlChanges[0].pathname; }
    /**
     * @return {?}
     */
    get search() { return this.urlChanges[0].search; }
    /**
     * @return {?}
     */
    get hash() { return this.urlChanges[0].hash; }
    /**
     * @return {?}
     */
    get state() { return this.urlChanges[0].state; }
    /**
     * @return {?}
     */
    getBaseHrefFromDOM() { return this.baseHref; }
    /**
     * @param {?} fn
     * @return {?}
     */
    onPopState(fn) {
        // No-op: a state stack is not implemented, so
        // no events will ever come.
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onHashChange(fn) { this.hashUpdate.subscribe(fn); }
    /**
     * @return {?}
     */
    get href() {
        /** @type {?} */
        let url = `${this.protocol}//${this.hostname}${this.port ? ':' + this.port : ''}`;
        url += `${this.pathname === '/' ? '' : this.pathname}${this.search}${this.hash}`;
        return url;
    }
    /**
     * @return {?}
     */
    get url() { return `${this.pathname}${this.search}${this.hash}`; }
    /**
     * @private
     * @param {?} state
     * @param {?} url
     * @param {?=} baseHref
     * @return {?}
     */
    parseChanges(state, url, baseHref = '') {
        // When the `history.state` value is stored, it is always copied.
        state = JSON.parse(JSON.stringify(state));
        return Object.assign(Object.assign({}, parseUrl(url, baseHref)), { state });
    }
    /**
     * @param {?} state
     * @param {?} title
     * @param {?} newUrl
     * @return {?}
     */
    replaceState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        this.urlChanges[0] = Object.assign(Object.assign({}, this.urlChanges[0]), { pathname, search, hash, state: parsedState });
    }
    /**
     * @param {?} state
     * @param {?} title
     * @param {?} newUrl
     * @return {?}
     */
    pushState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        this.urlChanges.unshift(Object.assign(Object.assign({}, this.urlChanges[0]), { pathname, search, hash, state: parsedState }));
    }
    /**
     * @return {?}
     */
    forward() { throw new Error('Not implemented'); }
    /**
     * @return {?}
     */
    back() {
        /** @type {?} */
        const oldUrl = this.url;
        /** @type {?} */
        const oldHash = this.hash;
        this.urlChanges.shift();
        /** @type {?} */
        const newHash = this.hash;
        if (oldHash !== newHash) {
            scheduleMicroTask((/**
             * @return {?}
             */
            () => this.hashUpdate.next((/** @type {?} */ ({
                type: 'hashchange', state: null, oldUrl, newUrl: this.url
            })))));
        }
    }
    /**
     * @return {?}
     */
    getState() { return this.state; }
}
MockPlatformLocation.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MockPlatformLocation.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MOCK_PLATFORM_LOCATION_CONFIG,] }, { type: Optional }] }
];
/** @nocollapse */ MockPlatformLocation.ɵfac = function MockPlatformLocation_Factory(t) { return new (t || MockPlatformLocation)(i0.ɵɵinject(MOCK_PLATFORM_LOCATION_CONFIG, 8)); };
/** @nocollapse */ MockPlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ token: MockPlatformLocation, factory: MockPlatformLocation.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MockPlatformLocation, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [MOCK_PLATFORM_LOCATION_CONFIG]
            }, {
                type: Optional
            }] }]; }, null); })();
if (false) {
    /**
     * @type {?}
     * @private
     */
    MockPlatformLocation.prototype.baseHref;
    /**
     * @type {?}
     * @private
     */
    MockPlatformLocation.prototype.hashUpdate;
    /**
     * @type {?}
     * @private
     */
    MockPlatformLocation.prototype.urlChanges;
}
/**
 * @param {?} cb
 * @return {?}
 */
export function scheduleMicroTask(cb) {
    Promise.resolve(null).then(cb);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBU0EsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXFCdkIsUUFBUSxHQUFHLCtEQUErRDs7Ozs7O0FBRWhGLFNBQVMsUUFBUSxDQUFDLE1BQWMsRUFBRSxRQUFnQjs7VUFDMUMsY0FBYyxHQUFHLHdCQUF3Qjs7UUFDM0MsVUFBNEI7SUFFaEMsNkZBQTZGO0lBQzdGLHdEQUF3RDtJQUN4RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNoQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7S0FDbEM7O1FBQ0csU0FPSDtJQUNELElBQUk7UUFDRixTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3pDO0lBQUMsT0FBTyxDQUFDLEVBQUU7O2NBQ0osTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDdkQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE1BQU0sZUFBZSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2xFOztjQUNLLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN0QyxTQUFTLEdBQUc7WUFDVixRQUFRLEVBQUUsTUFBTSxDQUFDLENB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UUFFekIsSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFO1lBQ3ZCLGlCQUFpQjs7O1lBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQUE7Z0JBQzNDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHO2FBQzFELEVBQXVCLENBQUMsRUFBQyxDQUFDO1NBQzVCO0lBQ0gsQ0FBQzs7OztJQUVELFFBQVEsS0FBYyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7WUFuRjNDLFVBQVU7Ozs7NENBY0ksTUFBTSxTQUFDLDZCQUE2QixjQUFHLFFBQVE7O3dGQWJqRCxvQkFBb0IsY0FhWCw2QkFBNkI7NERBYnRDLG9CQUFvQixXQUFwQixvQkFBb0I7a0RBQXBCLG9CQUFvQjtjQURoQyxVQUFVOztzQkFjSSxNQUFNO3VCQUFDLDZCQUE2Qjs7c0JBQUcsUUFBUTs7Ozs7OztJQVo1RCx3Q0FBOEI7Ozs7O0lBQzlCLDBDQUF3RDs7Ozs7SUFDeEQsMENBUWlHOzs7Ozs7QUEwRW5HLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxFQUFhO0lBQzdDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb25DaGFuZ2VFdmVudCwgTG9jYXRpb25DaGFuZ2VMaXN0ZW5lciwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBQYXJzZXIgZnJvbSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNhcHBlbmRpeC1CXG4gKiBeKChbXjovPyNdKyk6KT8oLy8oW14vPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/XG4gKiAgMTIgICAgICAgICAgICAzICA0ICAgICAgICAgIDUgICAgICAgNiAgNyAgICAgICAgOCA5XG4gKlxuICogRXhhbXBsZTogaHR0cDovL3d3dy5pY3MudWNpLmVkdS9wdWIvaWV0Zi91cmkvI1JlbGF0ZWRcbiAqXG4gKiBSZXN1bHRzIGluOlxuICpcbiAqICQxID0gaHR0cDpcbiAqICQyID0gaHR0cFxuICogJDMgPSAvL3d3dy5pY3MudWNpLmVkdVxuICogJDQgPSB3d3cuaWNzLnVjaS5lZHVcbiAqICQ1ID0gL3B1Yi9pZXRmL3VyaS9cbiAqICQ2ID0gPHVuZGVmaW5lZD5cbiAqICQ3ID0gPHVuZGVmaW5lZD5cbiAqICQ4ID0gI1JlbGF0ZWRcbiAqICQ5ID0gUmVsYXRlZFxuICovXG5jb25zdCB1cmxQYXJzZSA9IC9eKChbXjpcXC8/I10rKTopPyhcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT8vO1xuXG5mdW5jdGlvbiBwYXJzZVVybCh1cmxTdHI6IHN0cmluZywgYmFzZUhyZWY6IHN0cmluZykge1xuICBjb25zdCB2ZXJpZnlQcm90b2NvbCA9IC9eKChodHRwW3NdP3xmdHApOlxcL1xcLykvO1xuICBsZXQgc2VydmVyQmFzZTogc3RyaW5nfHVuZGVmaW5lZDtcblxuICAvLyBVUkwgY2xhc3MgcmVxdWlyZXMgZnVsbCBVUkwuIElmIHRoZSBVUkwgc3RyaW5nIGRvZXNuJ3Qgc3RhcnQgd2l0aCBwcm90b2NvbCwgd2UgbmVlZCB0byBhZGRcbiAgLy8gYW4gYXJiaXRyYXJ5IGJhc2UgVVJMIHdoaWNoIGNhbiBiZSByZW1vdmVkIGFmdGVyd2FyZC5cbiAgaWYgKCF2ZXJpZnlQcm90b2NvbC50ZXN0KHVybFN0cikpIHtcbiAgICBzZXJ2ZXJCYXNlID0gJ2h0dHA6Ly9lbXB0eS5jb20vJztcbiAgfVxuICBsZXQgcGFyc2VkVXJsOiB7XG4gICAgcHJvdG9jb2w6IHN0cmluZyxcbiAgICBob3N0bmFtZTogc3RyaW5nLFxuICAgIHBvcnQ6IHN0cmluZyxcbiAgICBwYXRobmFtZTogc3RyaW5nLFxuICAgIHNlYXJjaDogc3RyaW5nLFxuICAgIGhhc2g6IHN0cmluZ1xuICB9O1xuICB0cnkge1xuICAgIHBhcnNlZFVybCA9IG5ldyBVUkwodXJsU3RyLCBzZXJ2ZXJCYXNlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHVybFBhcnNlLmV4ZWMoc2VydmVyQmFzZSB8fCAnJyArIHVybFN0cik7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBVUkw6ICR7dXJsU3RyfSB3aXRoIGJhc2U6ICR7YmFzZUhyZWZ9YCk7XG4gICAgfVxuICAgIGNvbnN0IGhvc3RTcGxpdCA9IHJlc3VsdFs0XS5zcGxpdCgnOicpO1xuICAgIHBhcnNlZFVybCA9IHtcbiAgICAgIHByb3RvY29sOiByZXN1bHRbMV0sXG4gICAgICBob3N0bmFtZTogaG9zdFNwbGl0WzBdLFxuICAgICAgcG9ydDogaG9zdFNwbGl0WzFdIHx8ICcnLFxuICAgICAgcGF0aG5hbWU6IHJlc3VsdFs1XSxcbiAgICAgIHNlYXJjaDogcmVzdWx0WzZdLFxuICAgICAgaGFzaDogcmVzdWx0WzhdLFxuICAgIH07XG4gIH1cbiAgaWYgKHBhcnNlZFVybC5wYXRobmFtZSAmJiBwYXJzZWRVcmwucGF0aG5hbWUuaW5kZXhPZihiYXNlSHJlZikgPT09IDApIHtcbiAgICBwYXJzZWRVcmwucGF0aG5hbWUgPSBwYXJzZWRVcmwucGF0aG5hbWUuc3Vic3RyaW5nKGJhc2VIcmVmLmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBob3N0bmFtZTogIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLmhvc3RuYW1lIHx8ICcnLFxuICAgIHByb3RvY29sOiAhc2VydmVyQmFzZSAmJiBwYXJzZWRVcmwucHJvdG9jb2wgfHwgJycsXG4gICAgcG9ydDogIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLnBvcnQgfHwgJycsXG4gICAgcGF0aG5hbWU6IHBhcnNlZFVybC5wYXRobmFtZSB8fCAnLycsXG4gICAgc2VhcmNoOiBwYXJzZWRVcmwuc2VhcmNoIHx8ICcnLFxuICAgIGhhc2g6IHBhcnNlZFVybC5oYXNoIHx8ICcnLFxuICB9O1xufVxuXG4vKipcbiAqIE1vY2sgcGxhdGZvcm0gbG9jYXRpb24gY29uZmlnXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnIHtcbiAgc3RhcnRVcmw/OiBzdHJpbmc7XG4gIGFwcEJhc2VIcmVmPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFByb3ZpZGVyIGZvciBtb2NrIHBsYXRmb3JtIGxvY2F0aW9uIGNvbmZpZ1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IE1PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TW9ja1BsYXRmb3JtTG9jYXRpb25Db25maWc+KCdNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRycpO1xuXG4vKipcbiAqIE1vY2sgaW1wbGVtZW50YXRpb24gb2YgVVJMIHN0YXRlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tQbGF0Zm9ybUxvY2F0aW9uIGltcGxlbWVudHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHByaXZhdGUgYmFzZUhyZWY6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIGhhc2hVcGRhdGUgPSBuZXcgU3ViamVjdDxMb2NhdGlvbkNoYW5nZUV2ZW50PigpO1xuICBwcml2YXRlIHVybENoYW5nZXM6IHtcbiAgICBob3N0bmFtZTogc3RyaW5nLFxuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgcG9ydDogc3RyaW5nLFxuICAgIHBhdGhuYW1lOiBzdHJpbmcsXG4gICAgc2VhcmNoOiBzdHJpbmcsXG4gICAgaGFzaDogc3RyaW5nLFxuICAgIHN0YXRlOiB1bmtub3duXG4gIH1bXSA9IFt7aG9zdG5hbWU6ICcnLCBwcm90b2NvbDogJycsIHBvcnQ6ICcnLCBwYXRobmFtZTogJy8nLCBzZWFyY2g6ICcnLCBoYXNoOiAnJywgc3RhdGU6IG51bGx9XTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KE1PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHKSBAT3B0aW9uYWwoKSBjb25maWc/OlxuICAgICAgICAgICAgICAgICAgTW9ja1BsYXRmb3JtTG9jYXRpb25Db25maWcpIHtcbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICB0aGlzLmJhc2VIcmVmID0gY29uZmlnLmFwcEJhc2VIcmVmIHx8ICcnO1xuXG4gICAgICBjb25zdCBwYXJzZWRDaGFuZ2VzID1cbiAgICAgICAgICB0aGlzLnBhcnNlQ2hhbmdlcyhudWxsLCBjb25maWcuc3RhcnRVcmwgfHwgJ2h0dHA6Ly88ZW1wdHk+LycsIHRoaXMuYmFzZUhyZWYpO1xuICAgICAgdGhpcy51cmxDaGFuZ2VzWzBdID0gey4uLnBhcnNlZENoYW5nZXN9O1xuICAgIH1cbiAgfVxuXG4gIGdldCBob3N0bmFtZSgpIHsgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1swXS5ob3N0bmFtZTsgfVxuICBnZXQgcHJvdG9jb2woKSB7IHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0ucHJvdG9jb2w7IH1cbiAgZ2V0IHBvcnQoKSB7IHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0ucG9ydDsgfVxuICBnZXQgcGF0aG5hbWUoKSB7IHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0ucGF0aG5hbWU7IH1cbiAgZ2V0IHNlYXJjaCgpIHsgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1swXS5zZWFyY2g7IH1cbiAgZ2V0IGhhc2goKSB7IHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0uaGFzaDsgfVxuICBnZXQgc3RhdGUoKSB7IHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0uc3RhdGU7IH1cblxuXG4gIGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5iYXNlSHJlZjsgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICAvLyBOby1vcDogYSBzdGF0ZSBzdGFjayBpcyBub3QgaW1wbGVtZW50ZWQsIHNvXG4gICAgLy8gbm8gZXZlbnRzIHdpbGwgZXZlciBjb21lLlxuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZCB7IHRoaXMuaGFzaFVwZGF0ZS5zdWJzY3JpYmUoZm4pOyB9XG5cbiAgZ2V0IGhyZWYoKTogc3RyaW5nIHtcbiAgICBsZXQgdXJsID0gYCR7dGhpcy5wcm90b2NvbH0vLyR7dGhpcy5ob3N0bmFtZX0ke3RoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnfWA7XG4gICAgdXJsICs9IGAke3RoaXMucGF0aG5hbWUgPT09ICcvJyA/ICcnIDogdGhpcy5wYXRobmFtZX0ke3RoaXMuc2VhcmNofSR7dGhpcy5oYXNofWA7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIGdldCB1cmwoKTogc3RyaW5nIHsgcmV0dXJuIGAke3RoaXMucGF0aG5hbWV9JHt0aGlzLnNlYXJjaH0ke3RoaXMuaGFzaH1gOyB9XG5cbiAgcHJpdmF0ZSBwYXJzZUNoYW5nZXMoc3RhdGU6IHVua25vd24sIHVybDogc3RyaW5nLCBiYXNlSHJlZjogc3RyaW5nID0gJycpIHtcbiAgICAvLyBXaGVuIHRoZSBgaGlzdG9yeS5zdGF0ZWAgdmFsdWUgaXMgc3RvcmVkLCBpdCBpcyBhbHdheXMgY29waWVkLlxuICAgIHN0YXRlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzdGF0ZSkpO1xuICAgIHJldHVybiB7Li4ucGFyc2VVcmwodXJsLCBiYXNlSHJlZiksIHN0YXRlfTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtwYXRobmFtZSwgc2VhcmNoLCBzdGF0ZTogcGFyc2VkU3RhdGUsIGhhc2h9ID0gdGhpcy5wYXJzZUNoYW5nZXMoc3RhdGUsIG5ld1VybCk7XG5cbiAgICB0aGlzLnVybENoYW5nZXNbMF0gPSB7Li4udGhpcy51cmxDaGFuZ2VzWzBdLCBwYXRobmFtZSwgc2VhcmNoLCBoYXNoLCBzdGF0ZTogcGFyc2VkU3RhdGV9O1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIG5ld1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qge3BhdGhuYW1lLCBzZWFyY2gsIHN0YXRlOiBwYXJzZWRTdGF0ZSwgaGFzaH0gPSB0aGlzLnBhcnNlQ2hhbmdlcyhzdGF0ZSwgbmV3VXJsKTtcbiAgICB0aGlzLnVybENoYW5nZXMudW5zaGlmdCh7Li4udGhpcy51cmxDaGFuZ2VzWzBdLCBwYXRobmFtZSwgc2VhcmNoLCBoYXNoLCBzdGF0ZTogcGFyc2VkU3RhdGV9KTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7IH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsO1xuICAgIGNvbnN0IG9sZEhhc2ggPSB0aGlzLmhhc2g7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnNoaWZ0KCk7XG4gICAgY29uc3QgbmV3SGFzaCA9IHRoaXMuaGFzaDtcblxuICAgIGlmIChvbGRIYXNoICE9PSBuZXdIYXNoKSB7XG4gICAgICBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB0aGlzLmhhc2hVcGRhdGUubmV4dCh7XG4gICAgICAgIHR5cGU6ICdoYXNoY2hhbmdlJywgc3RhdGU6IG51bGwsIG9sZFVybCwgbmV3VXJsOiB0aGlzLnVybFxuICAgICAgfSBhcyBMb2NhdGlvbkNoYW5nZUV2ZW50KSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7IHJldHVybiB0aGlzLnN0YXRlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZU1pY3JvVGFzayhjYjogKCkgPT4gYW55KSB7XG4gIFByb21pc2UucmVzb2x2ZShudWxsKS50aGVuKGNiKTtcbn0iXX0=