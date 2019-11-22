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
/** @nocollapse */ MockPlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ token: MockPlatformLocation, factory: function (t) { return MockPlatformLocation.ɵfac(t); }, providedIn: null });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBU0EsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXFCdkIsUUFBUSxHQUFHLCtEQUErRDs7Ozs7O0FBRWhGLFNBQVMsUUFBUSxDQUFDLE1BQWMsRUFBRSxRQUFnQjs7VUFDMUMsY0FBYyxHQUFHLHdCQUF3Qjs7UUFDM0MsVUFBNEI7SUFFaEMsNkZBQTZGO0lBQzdGLHdEQUF3RDtJQUN4RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNoQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7S0FDbEM7O1FBQ0csU0FPSDtJQUNELElBQUk7UUFDRixTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3pDO0lBQUMsT0FBTyxDQUFDLEVBQUU7O2NBQ0osTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDdkQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE1BQU0sZUFBZSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2xFOztjQUNLLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN0QyxTQUFTLEdBQUc7WUFDVixRQUFRLEVBQUUsTUFBTSxDQUFDLENB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UUFFekIsSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFO1lBQ3ZCLGlCQUFpQjs7O1lBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQUE7Z0JBQzNDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHO2FBQzFELEVBQXVCLENBQUMsRUFBQyxDQUFDO1NBQzVCO0lBQ0gsQ0FBQzs7OztJQUVELFFBQVEsS0FBYyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7WUFuRjNDLFVBQVU7Ozs7NENBY0ksTUFBTSxTQUFDLDZCQUE2QixjQUFHLFFBQVE7O3dGQWJqRCxvQkFBb0IsY0FhWCw2QkFBNkI7NERBYnRDLG9CQUFvQixpQ0FBcEIsb0JBQW9CO2tEQUFwQixvQkFBb0I7Y0FEaEMsVUFBVTs7c0JBY0ksTUFBTTt1QkFBQyw2QkFBNkI7O3NCQUFHLFFBQVE7Ozs7Ozs7SUFaNUQsd0NBQThCOzs7OztJQUM5QiwwQ0FBd0Q7Ozs7O0lBQ3hELDBDQVFpRzs7Ozs7O0FBMEVuRyxNQUFNLFVBQVUsaUJBQWlCLENBQUMsRUFBYTtJQUM3QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uQ2hhbmdlRXZlbnQsIExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIsIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogUGFyc2VyIGZyb20gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjYXBwZW5kaXgtQlxuICogXigoW146Lz8jXSspOik/KC8vKFteLz8jXSopKT8oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpP1xuICogIDEyICAgICAgICAgICAgMyAgNCAgICAgICAgICA1ICAgICAgIDYgIDcgICAgICAgIDggOVxuICpcbiAqIEV4YW1wbGU6IGh0dHA6Ly93d3cuaWNzLnVjaS5lZHUvcHViL2lldGYvdXJpLyNSZWxhdGVkXG4gKlxuICogUmVzdWx0cyBpbjpcbiAqXG4gKiAkMSA9IGh0dHA6XG4gKiAkMiA9IGh0dHBcbiAqICQzID0gLy93d3cuaWNzLnVjaS5lZHVcbiAqICQ0ID0gd3d3Lmljcy51Y2kuZWR1XG4gKiAkNSA9IC9wdWIvaWV0Zi91cmkvXG4gKiAkNiA9IDx1bmRlZmluZWQ+XG4gKiAkNyA9IDx1bmRlZmluZWQ+XG4gKiAkOCA9ICNSZWxhdGVkXG4gKiAkOSA9IFJlbGF0ZWRcbiAqL1xuY29uc3QgdXJsUGFyc2UgPSAvXigoW146XFwvPyNdKyk6KT8oXFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/LztcblxuZnVuY3Rpb24gcGFyc2VVcmwodXJsU3RyOiBzdHJpbmcsIGJhc2VIcmVmOiBzdHJpbmcpIHtcbiAgY29uc3QgdmVyaWZ5UHJvdG9jb2wgPSAvXigoaHR0cFtzXT98ZnRwKTpcXC9cXC8pLztcbiAgbGV0IHNlcnZlckJhc2U6IHN0cmluZ3x1bmRlZmluZWQ7XG5cbiAgLy8gVVJMIGNsYXNzIHJlcXVpcmVzIGZ1bGwgVVJMLiBJZiB0aGUgVVJMIHN0cmluZyBkb2Vzbid0IHN0YXJ0IHdpdGggcHJvdG9jb2wsIHdlIG5lZWQgdG8gYWRkXG4gIC8vIGFuIGFyYml0cmFyeSBiYXNlIFVSTCB3aGljaCBjYW4gYmUgcmVtb3ZlZCBhZnRlcndhcmQuXG4gIGlmICghdmVyaWZ5UHJvdG9jb2wudGVzdCh1cmxTdHIpKSB7XG4gICAgc2VydmVyQmFzZSA9ICdodHRwOi8vZW1wdHkuY29tLyc7XG4gIH1cbiAgbGV0IHBhcnNlZFVybDoge1xuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgaG9zdG5hbWU6IHN0cmluZyxcbiAgICBwb3J0OiBzdHJpbmcsXG4gICAgcGF0aG5hbWU6IHN0cmluZyxcbiAgICBzZWFyY2g6IHN0cmluZyxcbiAgICBoYXNoOiBzdHJpbmdcbiAgfTtcbiAgdHJ5IHtcbiAgICBwYXJzZWRVcmwgPSBuZXcgVVJMKHVybFN0ciwgc2VydmVyQmFzZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zdCByZXN1bHQgPSB1cmxQYXJzZS5leGVjKHNlcnZlckJhc2UgfHwgJycgKyB1cmxTdHIpO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgVVJMOiAke3VybFN0cn0gd2l0aCBiYXNlOiAke2Jhc2VIcmVmfWApO1xuICAgIH1cbiAgICBjb25zdCBob3N0U3BsaXQgPSByZXN1bHRbNF0uc3BsaXQoJzonKTtcbiAgICBwYXJzZWRVcmwgPSB7XG4gICAgICBwcm90b2NvbDogcmVzdWx0WzFdLFxuICAgICAgaG9zdG5hbWU6IGhvc3RTcGxpdFswXSxcbiAgICAgIHBvcnQ6IGhvc3RTcGxpdFsxXSB8fCAnJyxcbiAgICAgIHBhdGhuYW1lOiByZXN1bHRbNV0sXG4gICAgICBzZWFyY2g6IHJlc3VsdFs2XSxcbiAgICAgIGhhc2g6IHJlc3VsdFs4XSxcbiAgICB9O1xuICB9XG4gIGlmIChwYXJzZWRVcmwucGF0aG5hbWUgJiYgcGFyc2VkVXJsLnBhdGhuYW1lLmluZGV4T2YoYmFzZUhyZWYpID09PSAwKSB7XG4gICAgcGFyc2VkVXJsLnBhdGhuYW1lID0gcGFyc2VkVXJsLnBhdGhuYW1lLnN1YnN0cmluZyhiYXNlSHJlZi5sZW5ndGgpO1xuICB9XG4gIHJldHVybiB7XG4gICAgaG9zdG5hbWU6ICFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5ob3N0bmFtZSB8fCAnJyxcbiAgICBwcm90b2NvbDogIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLnByb3RvY29sIHx8ICcnLFxuICAgIHBvcnQ6ICFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5wb3J0IHx8ICcnLFxuICAgIHBhdGhuYW1lOiBwYXJzZWRVcmwucGF0aG5hbWUgfHwgJy8nLFxuICAgIHNlYXJjaDogcGFyc2VkVXJsLnNlYXJjaCB8fCAnJyxcbiAgICBoYXNoOiBwYXJzZWRVcmwuaGFzaCB8fCAnJyxcbiAgfTtcbn1cblxuLyoqXG4gKiBNb2NrIHBsYXRmb3JtIGxvY2F0aW9uIGNvbmZpZ1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZyB7XG4gIHN0YXJ0VXJsPzogc3RyaW5nO1xuICBhcHBCYXNlSHJlZj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcm92aWRlciBmb3IgbW9jayBwbGF0Zm9ybSBsb2NhdGlvbiBjb25maWdcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnPignTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcnKTtcblxuLyoqXG4gKiBNb2NrIGltcGxlbWVudGF0aW9uIG9mIFVSTCBzdGF0ZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrUGxhdGZvcm1Mb2NhdGlvbiBpbXBsZW1lbnRzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwcml2YXRlIGJhc2VIcmVmOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBoYXNoVXBkYXRlID0gbmV3IFN1YmplY3Q8TG9jYXRpb25DaGFuZ2VFdmVudD4oKTtcbiAgcHJpdmF0ZSB1cmxDaGFuZ2VzOiB7XG4gICAgaG9zdG5hbWU6IHN0cmluZyxcbiAgICBwcm90b2NvbDogc3RyaW5nLFxuICAgIHBvcnQ6IHN0cmluZyxcbiAgICBwYXRobmFtZTogc3RyaW5nLFxuICAgIHNlYXJjaDogc3RyaW5nLFxuICAgIGhhc2g6IHN0cmluZyxcbiAgICBzdGF0ZTogdW5rbm93blxuICB9W10gPSBbe2hvc3RuYW1lOiAnJywgcHJvdG9jb2w6ICcnLCBwb3J0OiAnJywgcGF0aG5hbWU6ICcvJywgc2VhcmNoOiAnJywgaGFzaDogJycsIHN0YXRlOiBudWxsfV07XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRykgQE9wdGlvbmFsKCkgY29uZmlnPzpcbiAgICAgICAgICAgICAgICAgIE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnKSB7XG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgdGhpcy5iYXNlSHJlZiA9IGNvbmZpZy5hcHBCYXNlSHJlZiB8fCAnJztcblxuICAgICAgY29uc3QgcGFyc2VkQ2hhbmdlcyA9XG4gICAgICAgICAgdGhpcy5wYXJzZUNoYW5nZXMobnVsbCwgY29uZmlnLnN0YXJ0VXJsIHx8ICdodHRwOi8vPGVtcHR5Pi8nLCB0aGlzLmJhc2VIcmVmKTtcbiAgICAgIHRoaXMudXJsQ2hhbmdlc1swXSA9IHsuLi5wYXJzZWRDaGFuZ2VzfTtcbiAgICB9XG4gIH1cblxuICBnZXQgaG9zdG5hbWUoKSB7IHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0uaG9zdG5hbWU7IH1cbiAgZ2V0IHByb3RvY29sKCkgeyByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnByb3RvY29sOyB9XG4gIGdldCBwb3J0KCkgeyByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnBvcnQ7IH1cbiAgZ2V0IHBhdGhuYW1lKCkgeyByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnBhdGhuYW1lOyB9XG4gIGdldCBzZWFyY2goKSB7IHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0uc2VhcmNoOyB9XG4gIGdldCBoYXNoKCkgeyByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLmhhc2g7IH1cbiAgZ2V0IHN0YXRlKCkgeyByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnN0YXRlOyB9XG5cblxuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuYmFzZUhyZWY7IH1cblxuICBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgLy8gTm8tb3A6IGEgc3RhdGUgc3RhY2sgaXMgbm90IGltcGxlbWVudGVkLCBzb1xuICAgIC8vIG5vIGV2ZW50cyB3aWxsIGV2ZXIgY29tZS5cbiAgfVxuXG4gIG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQgeyB0aGlzLmhhc2hVcGRhdGUuc3Vic2NyaWJlKGZuKTsgfVxuXG4gIGdldCBocmVmKCk6IHN0cmluZyB7XG4gICAgbGV0IHVybCA9IGAke3RoaXMucHJvdG9jb2x9Ly8ke3RoaXMuaG9zdG5hbWV9JHt0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJ31gO1xuICAgIHVybCArPSBgJHt0aGlzLnBhdGhuYW1lID09PSAnLycgPyAnJyA6IHRoaXMucGF0aG5hbWV9JHt0aGlzLnNlYXJjaH0ke3RoaXMuaGFzaH1gO1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICBnZXQgdXJsKCk6IHN0cmluZyB7IHJldHVybiBgJHt0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDsgfVxuXG4gIHByaXZhdGUgcGFyc2VDaGFuZ2VzKHN0YXRlOiB1bmtub3duLCB1cmw6IHN0cmluZywgYmFzZUhyZWY6IHN0cmluZyA9ICcnKSB7XG4gICAgLy8gV2hlbiB0aGUgYGhpc3Rvcnkuc3RhdGVgIHZhbHVlIGlzIHN0b3JlZCwgaXQgaXMgYWx3YXlzIGNvcGllZC5cbiAgICBzdGF0ZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3RhdGUpKTtcbiAgICByZXR1cm4gey4uLnBhcnNlVXJsKHVybCwgYmFzZUhyZWYpLCBzdGF0ZX07XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgbmV3VXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7cGF0aG5hbWUsIHNlYXJjaCwgc3RhdGU6IHBhcnNlZFN0YXRlLCBoYXNofSA9IHRoaXMucGFyc2VDaGFuZ2VzKHN0YXRlLCBuZXdVcmwpO1xuXG4gICAgdGhpcy51cmxDaGFuZ2VzWzBdID0gey4uLnRoaXMudXJsQ2hhbmdlc1swXSwgcGF0aG5hbWUsIHNlYXJjaCwgaGFzaCwgc3RhdGU6IHBhcnNlZFN0YXRlfTtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtwYXRobmFtZSwgc2VhcmNoLCBzdGF0ZTogcGFyc2VkU3RhdGUsIGhhc2h9ID0gdGhpcy5wYXJzZUNoYW5nZXMoc3RhdGUsIG5ld1VybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnVuc2hpZnQoey4uLnRoaXMudXJsQ2hhbmdlc1swXSwgcGF0aG5hbWUsIHNlYXJjaCwgaGFzaCwgc3RhdGU6IHBhcnNlZFN0YXRlfSk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQgeyB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybDtcbiAgICBjb25zdCBvbGRIYXNoID0gdGhpcy5oYXNoO1xuICAgIHRoaXMudXJsQ2hhbmdlcy5zaGlmdCgpO1xuICAgIGNvbnN0IG5ld0hhc2ggPSB0aGlzLmhhc2g7XG5cbiAgICBpZiAob2xkSGFzaCAhPT0gbmV3SGFzaCkge1xuICAgICAgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4gdGhpcy5oYXNoVXBkYXRlLm5leHQoe1xuICAgICAgICB0eXBlOiAnaGFzaGNoYW5nZScsIHN0YXRlOiBudWxsLCBvbGRVcmwsIG5ld1VybDogdGhpcy51cmxcbiAgICAgIH0gYXMgTG9jYXRpb25DaGFuZ2VFdmVudCkpO1xuICAgIH1cbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24geyByZXR1cm4gdGhpcy5zdGF0ZTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVNaWNyb1Rhc2soY2I6ICgpID0+IGFueSkge1xuICBQcm9taXNlLnJlc29sdmUobnVsbCkudGhlbihjYik7XG59Il19