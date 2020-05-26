/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Subject } from 'rxjs';
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
 */
const urlParse = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
function parseUrl(urlStr, baseHref) {
    const verifyProtocol = /^((http[s]?|ftp):\/\/)/;
    let serverBase;
    // URL class requires full URL. If the URL string doesn't start with protocol, we need to add
    // an arbitrary base URL which can be removed afterward.
    if (!verifyProtocol.test(urlStr)) {
        serverBase = 'http://empty.com/';
    }
    let parsedUrl;
    try {
        parsedUrl = new URL(urlStr, serverBase);
    }
    catch (e) {
        const result = urlParse.exec(serverBase || '' + urlStr);
        if (!result) {
            throw new Error(`Invalid URL: ${urlStr} with base: ${baseHref}`);
        }
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
 * Provider for mock platform location config
 *
 * @publicApi
 */
export const MOCK_PLATFORM_LOCATION_CONFIG = new InjectionToken('MOCK_PLATFORM_LOCATION_CONFIG');
/**
 * Mock implementation of URL state.
 *
 * @publicApi
 */
let MockPlatformLocation = /** @class */ (() => {
    let MockPlatformLocation = class MockPlatformLocation {
        constructor(config) {
            this.baseHref = '';
            this.hashUpdate = new Subject();
            this.urlChanges = [{ hostname: '', protocol: '', port: '', pathname: '/', search: '', hash: '', state: null }];
            if (config) {
                this.baseHref = config.appBaseHref || '';
                const parsedChanges = this.parseChanges(null, config.startUrl || 'http://<empty>/', this.baseHref);
                this.urlChanges[0] = Object.assign({}, parsedChanges);
            }
        }
        get hostname() {
            return this.urlChanges[0].hostname;
        }
        get protocol() {
            return this.urlChanges[0].protocol;
        }
        get port() {
            return this.urlChanges[0].port;
        }
        get pathname() {
            return this.urlChanges[0].pathname;
        }
        get search() {
            return this.urlChanges[0].search;
        }
        get hash() {
            return this.urlChanges[0].hash;
        }
        get state() {
            return this.urlChanges[0].state;
        }
        getBaseHrefFromDOM() {
            return this.baseHref;
        }
        onPopState(fn) {
            // No-op: a state stack is not implemented, so
            // no events will ever come.
        }
        onHashChange(fn) {
            this.hashUpdate.subscribe(fn);
        }
        get href() {
            let url = `${this.protocol}//${this.hostname}${this.port ? ':' + this.port : ''}`;
            url += `${this.pathname === '/' ? '' : this.pathname}${this.search}${this.hash}`;
            return url;
        }
        get url() {
            return `${this.pathname}${this.search}${this.hash}`;
        }
        parseChanges(state, url, baseHref = '') {
            // When the `history.state` value is stored, it is always copied.
            state = JSON.parse(JSON.stringify(state));
            return Object.assign(Object.assign({}, parseUrl(url, baseHref)), { state });
        }
        replaceState(state, title, newUrl) {
            const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
            this.urlChanges[0] = Object.assign(Object.assign({}, this.urlChanges[0]), { pathname, search, hash, state: parsedState });
        }
        pushState(state, title, newUrl) {
            const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
            this.urlChanges.unshift(Object.assign(Object.assign({}, this.urlChanges[0]), { pathname, search, hash, state: parsedState }));
        }
        forward() {
            throw new Error('Not implemented');
        }
        back() {
            const oldUrl = this.url;
            const oldHash = this.hash;
            this.urlChanges.shift();
            const newHash = this.hash;
            if (oldHash !== newHash) {
                scheduleMicroTask(() => this.hashUpdate.next({ type: 'hashchange', state: null, oldUrl, newUrl: this.url }));
            }
        }
        getState() {
            return this.state;
        }
    };
    MockPlatformLocation = __decorate([
        Injectable(),
        __param(0, Inject(MOCK_PLATFORM_LOCATION_CONFIG)), __param(0, Optional()),
        __metadata("design:paramtypes", [Object])
    ], MockPlatformLocation);
    return MockPlatformLocation;
})();
export { MockPlatformLocation };
export function scheduleMicroTask(cb) {
    Promise.resolve(null).then(cb);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sUUFBUSxHQUFHLCtEQUErRCxDQUFDO0FBRWpGLFNBQVMsUUFBUSxDQUFDLE1BQWMsRUFBRSxRQUFnQjtJQUNoRCxNQUFNLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQztJQUNoRCxJQUFJLFVBQTRCLENBQUM7SUFFakMsNkZBQTZGO0lBQzdGLHdEQUF3RDtJQUN4RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNoQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7S0FDbEM7SUFDRCxJQUFJLFNBT0gsQ0FBQztJQUNGLElBQUk7UUFDRixTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3pDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE1BQU0sZUFBZSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2xFO1FBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FB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QUMsS0FBSyxFQUFFLENBQUM7WUFDeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUUxQixJQUFJLE9BQU8sS0FBSyxPQUFPLEVBQUU7Z0JBQ3ZCLGlCQUFpQixDQUNiLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUN0QixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQXdCLENBQUMsQ0FBQyxDQUFDO2FBQzlGO1FBQ0gsQ0FBQztRQUVELFFBQVE7WUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUNGLENBQUE7SUEzR1ksb0JBQW9CO1FBRGhDLFVBQVUsRUFBRTtRQWNFLFdBQUEsTUFBTSxDQUFDLDZCQUE2QixDQUFDLENBQUEsRUFBRSxXQUFBLFFBQVEsRUFBRSxDQUFBOztPQWJuRCxvQkFBb0IsQ0EyR2hDO0lBQUQsMkJBQUM7S0FBQTtTQTNHWSxvQkFBb0I7QUE2R2pDLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxFQUFhO0lBQzdDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvbkNoYW5nZUV2ZW50LCBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyLCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIFBhcnNlciBmcm9tIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I2FwcGVuZGl4LUJcbiAqIF4oKFteOi8/I10rKTopPygvLyhbXi8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT9cbiAqICAxMiAgICAgICAgICAgIDMgIDQgICAgICAgICAgNSAgICAgICA2ICA3ICAgICAgICA4IDlcbiAqXG4gKiBFeGFtcGxlOiBodHRwOi8vd3d3Lmljcy51Y2kuZWR1L3B1Yi9pZXRmL3VyaS8jUmVsYXRlZFxuICpcbiAqIFJlc3VsdHMgaW46XG4gKlxuICogJDEgPSBodHRwOlxuICogJDIgPSBodHRwXG4gKiAkMyA9IC8vd3d3Lmljcy51Y2kuZWR1XG4gKiAkNCA9IHd3dy5pY3MudWNpLmVkdVxuICogJDUgPSAvcHViL2lldGYvdXJpL1xuICogJDYgPSA8dW5kZWZpbmVkPlxuICogJDcgPSA8dW5kZWZpbmVkPlxuICogJDggPSAjUmVsYXRlZFxuICogJDkgPSBSZWxhdGVkXG4gKi9cbmNvbnN0IHVybFBhcnNlID0gL14oKFteOlxcLz8jXSspOik/KFxcL1xcLyhbXlxcLz8jXSopKT8oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpPy87XG5cbmZ1bmN0aW9uIHBhcnNlVXJsKHVybFN0cjogc3RyaW5nLCBiYXNlSHJlZjogc3RyaW5nKSB7XG4gIGNvbnN0IHZlcmlmeVByb3RvY29sID0gL14oKGh0dHBbc10/fGZ0cCk6XFwvXFwvKS87XG4gIGxldCBzZXJ2ZXJCYXNlOiBzdHJpbmd8dW5kZWZpbmVkO1xuXG4gIC8vIFVSTCBjbGFzcyByZXF1aXJlcyBmdWxsIFVSTC4gSWYgdGhlIFVSTCBzdHJpbmcgZG9lc24ndCBzdGFydCB3aXRoIHByb3RvY29sLCB3ZSBuZWVkIHRvIGFkZFxuICAvLyBhbiBhcmJpdHJhcnkgYmFzZSBVUkwgd2hpY2ggY2FuIGJlIHJlbW92ZWQgYWZ0ZXJ3YXJkLlxuICBpZiAoIXZlcmlmeVByb3RvY29sLnRlc3QodXJsU3RyKSkge1xuICAgIHNlcnZlckJhc2UgPSAnaHR0cDovL2VtcHR5LmNvbS8nO1xuICB9XG4gIGxldCBwYXJzZWRVcmw6IHtcbiAgICBwcm90b2NvbDogc3RyaW5nLFxuICAgIGhvc3RuYW1lOiBzdHJpbmcsXG4gICAgcG9ydDogc3RyaW5nLFxuICAgIHBhdGhuYW1lOiBzdHJpbmcsXG4gICAgc2VhcmNoOiBzdHJpbmcsXG4gICAgaGFzaDogc3RyaW5nXG4gIH07XG4gIHRyeSB7XG4gICAgcGFyc2VkVXJsID0gbmV3IFVSTCh1cmxTdHIsIHNlcnZlckJhc2UpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdXJsUGFyc2UuZXhlYyhzZXJ2ZXJCYXNlIHx8ICcnICsgdXJsU3RyKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFVSTDogJHt1cmxTdHJ9IHdpdGggYmFzZTogJHtiYXNlSHJlZn1gKTtcbiAgICB9XG4gICAgY29uc3QgaG9zdFNwbGl0ID0gcmVzdWx0WzRdLnNwbGl0KCc6Jyk7XG4gICAgcGFyc2VkVXJsID0ge1xuICAgICAgcHJvdG9jb2w6IHJlc3VsdFsxXSxcbiAgICAgIGhvc3RuYW1lOiBob3N0U3BsaXRbMF0sXG4gICAgICBwb3J0OiBob3N0U3BsaXRbMV0gfHwgJycsXG4gICAgICBwYXRobmFtZTogcmVzdWx0WzVdLFxuICAgICAgc2VhcmNoOiByZXN1bHRbNl0sXG4gICAgICBoYXNoOiByZXN1bHRbOF0sXG4gICAgfTtcbiAgfVxuICBpZiAocGFyc2VkVXJsLnBhdGhuYW1lICYmIHBhcnNlZFVybC5wYXRobmFtZS5pbmRleE9mKGJhc2VIcmVmKSA9PT0gMCkge1xuICAgIHBhcnNlZFVybC5wYXRobmFtZSA9IHBhcnNlZFVybC5wYXRobmFtZS5zdWJzdHJpbmcoYmFzZUhyZWYubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGhvc3RuYW1lOiAhc2VydmVyQmFzZSAmJiBwYXJzZWRVcmwuaG9zdG5hbWUgfHwgJycsXG4gICAgcHJvdG9jb2w6ICFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5wcm90b2NvbCB8fCAnJyxcbiAgICBwb3J0OiAhc2VydmVyQmFzZSAmJiBwYXJzZWRVcmwucG9ydCB8fCAnJyxcbiAgICBwYXRobmFtZTogcGFyc2VkVXJsLnBhdGhuYW1lIHx8ICcvJyxcbiAgICBzZWFyY2g6IHBhcnNlZFVybC5zZWFyY2ggfHwgJycsXG4gICAgaGFzaDogcGFyc2VkVXJsLmhhc2ggfHwgJycsXG4gIH07XG59XG5cbi8qKlxuICogTW9jayBwbGF0Zm9ybSBsb2NhdGlvbiBjb25maWdcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTW9ja1BsYXRmb3JtTG9jYXRpb25Db25maWcge1xuICBzdGFydFVybD86IHN0cmluZztcbiAgYXBwQmFzZUhyZWY/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUHJvdmlkZXIgZm9yIG1vY2sgcGxhdGZvcm0gbG9jYXRpb24gY29uZmlnXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZz4oJ01PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHJyk7XG5cbi8qKlxuICogTW9jayBpbXBsZW1lbnRhdGlvbiBvZiBVUkwgc3RhdGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja1BsYXRmb3JtTG9jYXRpb24gaW1wbGVtZW50cyBQbGF0Zm9ybUxvY2F0aW9uIHtcbiAgcHJpdmF0ZSBiYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgaGFzaFVwZGF0ZSA9IG5ldyBTdWJqZWN0PExvY2F0aW9uQ2hhbmdlRXZlbnQ+KCk7XG4gIHByaXZhdGUgdXJsQ2hhbmdlczoge1xuICAgIGhvc3RuYW1lOiBzdHJpbmcsXG4gICAgcHJvdG9jb2w6IHN0cmluZyxcbiAgICBwb3J0OiBzdHJpbmcsXG4gICAgcGF0aG5hbWU6IHN0cmluZyxcbiAgICBzZWFyY2g6IHN0cmluZyxcbiAgICBoYXNoOiBzdHJpbmcsXG4gICAgc3RhdGU6IHVua25vd25cbiAgfVtdID0gW3tob3N0bmFtZTogJycsIHByb3RvY29sOiAnJywgcG9ydDogJycsIHBhdGhuYW1lOiAnLycsIHNlYXJjaDogJycsIGhhc2g6ICcnLCBzdGF0ZTogbnVsbH1dO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcpIEBPcHRpb25hbCgpIGNvbmZpZz86XG4gICAgICAgICAgICAgICAgICBNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZykge1xuICAgIGlmIChjb25maWcpIHtcbiAgICAgIHRoaXMuYmFzZUhyZWYgPSBjb25maWcuYXBwQmFzZUhyZWYgfHwgJyc7XG5cbiAgICAgIGNvbnN0IHBhcnNlZENoYW5nZXMgPVxuICAgICAgICAgIHRoaXMucGFyc2VDaGFuZ2VzKG51bGwsIGNvbmZpZy5zdGFydFVybCB8fCAnaHR0cDovLzxlbXB0eT4vJywgdGhpcy5iYXNlSHJlZik7XG4gICAgICB0aGlzLnVybENoYW5nZXNbMF0gPSB7Li4ucGFyc2VkQ2hhbmdlc307XG4gICAgfVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0uaG9zdG5hbWU7XG4gIH1cbiAgZ2V0IHByb3RvY29sKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0ucHJvdG9jb2w7XG4gIH1cbiAgZ2V0IHBvcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1swXS5wb3J0O1xuICB9XG4gIGdldCBwYXRobmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnBhdGhuYW1lO1xuICB9XG4gIGdldCBzZWFyY2goKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1swXS5zZWFyY2g7XG4gIH1cbiAgZ2V0IGhhc2goKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1swXS5oYXNoO1xuICB9XG4gIGdldCBzdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnN0YXRlO1xuICB9XG5cblxuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5iYXNlSHJlZjtcbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICAvLyBOby1vcDogYSBzdGF0ZSBzdGFjayBpcyBub3QgaW1wbGVtZW50ZWQsIHNvXG4gICAgLy8gbm8gZXZlbnRzIHdpbGwgZXZlciBjb21lLlxuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgdGhpcy5oYXNoVXBkYXRlLnN1YnNjcmliZShmbik7XG4gIH1cblxuICBnZXQgaHJlZigpOiBzdHJpbmcge1xuICAgIGxldCB1cmwgPSBgJHt0aGlzLnByb3RvY29sfS8vJHt0aGlzLmhvc3RuYW1lfSR7dGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyd9YDtcbiAgICB1cmwgKz0gYCR7dGhpcy5wYXRobmFtZSA9PT0gJy8nID8gJycgOiB0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgZ2V0IHVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VDaGFuZ2VzKHN0YXRlOiB1bmtub3duLCB1cmw6IHN0cmluZywgYmFzZUhyZWY6IHN0cmluZyA9ICcnKSB7XG4gICAgLy8gV2hlbiB0aGUgYGhpc3Rvcnkuc3RhdGVgIHZhbHVlIGlzIHN0b3JlZCwgaXQgaXMgYWx3YXlzIGNvcGllZC5cbiAgICBzdGF0ZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3RhdGUpKTtcbiAgICByZXR1cm4gey4uLnBhcnNlVXJsKHVybCwgYmFzZUhyZWYpLCBzdGF0ZX07XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgbmV3VXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7cGF0aG5hbWUsIHNlYXJjaCwgc3RhdGU6IHBhcnNlZFN0YXRlLCBoYXNofSA9IHRoaXMucGFyc2VDaGFuZ2VzKHN0YXRlLCBuZXdVcmwpO1xuXG4gICAgdGhpcy51cmxDaGFuZ2VzWzBdID0gey4uLnRoaXMudXJsQ2hhbmdlc1swXSwgcGF0aG5hbWUsIHNlYXJjaCwgaGFzaCwgc3RhdGU6IHBhcnNlZFN0YXRlfTtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtwYXRobmFtZSwgc2VhcmNoLCBzdGF0ZTogcGFyc2VkU3RhdGUsIGhhc2h9ID0gdGhpcy5wYXJzZUNoYW5nZXMoc3RhdGUsIG5ld1VybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnVuc2hpZnQoey4uLnRoaXMudXJsQ2hhbmdlc1swXSwgcGF0aG5hbWUsIHNlYXJjaCwgaGFzaCwgc3RhdGU6IHBhcnNlZFN0YXRlfSk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsO1xuICAgIGNvbnN0IG9sZEhhc2ggPSB0aGlzLmhhc2g7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnNoaWZ0KCk7XG4gICAgY29uc3QgbmV3SGFzaCA9IHRoaXMuaGFzaDtcblxuICAgIGlmIChvbGRIYXNoICE9PSBuZXdIYXNoKSB7XG4gICAgICBzY2hlZHVsZU1pY3JvVGFzayhcbiAgICAgICAgICAoKSA9PiB0aGlzLmhhc2hVcGRhdGUubmV4dChcbiAgICAgICAgICAgICAge3R5cGU6ICdoYXNoY2hhbmdlJywgc3RhdGU6IG51bGwsIG9sZFVybCwgbmV3VXJsOiB0aGlzLnVybH0gYXMgTG9jYXRpb25DaGFuZ2VFdmVudCkpO1xuICAgIH1cbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZU1pY3JvVGFzayhjYjogKCkgPT4gYW55KSB7XG4gIFByb21pc2UucmVzb2x2ZShudWxsKS50aGVuKGNiKTtcbn1cbiJdfQ==