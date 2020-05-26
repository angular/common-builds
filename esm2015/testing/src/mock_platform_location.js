import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
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
    class MockPlatformLocation {
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
    }
    MockPlatformLocation.ɵfac = function MockPlatformLocation_Factory(t) { return new (t || MockPlatformLocation)(i0.ɵɵinject(MOCK_PLATFORM_LOCATION_CONFIG, 8)); };
    MockPlatformLocation.ɵprov = i0.ɵɵdefineInjectable({ token: MockPlatformLocation, factory: MockPlatformLocation.ɵfac });
    return MockPlatformLocation;
})();
export { MockPlatformLocation };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MockPlatformLocation, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [MOCK_PLATFORM_LOCATION_CONFIG]
            }, {
                type: Optional
            }] }]; }, null); })();
export function scheduleMicroTask(cb) {
    Promise.resolve(null).then(cb);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQzs7QUFFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sUUFBUSxHQUFHLCtEQUErRCxDQUFDO0FBRWpGLFNBQVMsUUFBUSxDQUFDLE1BQWMsRUFBRSxRQUFnQjtJQUNoRCxNQUFNLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQztJQUNoRCxJQUFJLFVBQTRCLENBQUM7SUFFakMsNkZBQTZGO0lBQzdGLHdEQUF3RDtJQUN4RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNoQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7S0FDbEM7SUFDRCxJQUFJLFNBT0gsQ0FBQztJQUNGLElBQUk7UUFDRixTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3pDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE1BQU0sZUFBZSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2xFO1FBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxTQUFTLEdBQUc7WUFDVixRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuQixRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDeEIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDakIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDaEIsQ0FBQztLQUNIO0lBQ0QsSUFBSSxTQUFTLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNwRSxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNwRTtJQUNELE9BQU87UUFDTCxRQUFRLEVBQUUsQ0FBQyxVQUFVLElBQUksU0FBUyxDQUFDLFFBQVEsSUFBSSxFQUFFO1FBQ2pELFFBQVEsRUFBRSxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUMsUUFBUSxJQUFJLEVBQUU7UUFDakQsSUFBSSxFQUFFLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQyxJQUFJLElBQUksRUFBRTtRQUN6QyxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsSUFBSSxHQUFHO1FBQ25DLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxJQUFJLEVBQUU7UUFDOUIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLElBQUksRUFBRTtLQUMzQixDQUFDO0FBQ0osQ0FBQztBQVlEOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FDdEMsSUFBSSxjQUFjLENBQTZCLCtCQUErQixDQUFDLENBQUM7QUFFcEY7Ozs7R0FJRztBQUNIO0lBQUEsTUFDYSxvQkFBb0I7UUFhL0IsWUFBK0QsTUFDckI7WUFibEMsYUFBUSxHQUFXLEVBQUUsQ0FBQztZQUN0QixlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQXVCLENBQUM7WUFDaEQsZUFBVSxHQVFaLENBQUMsRUFBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUkvRixJQUFJLE1BQU0sRUFBRTtnQkFDVixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO2dCQUV6QyxNQUFNLGFBQWEsR0FDZixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxJQUFJLGlCQUFpQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDakYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMscUJBQU8sYUFBYSxDQUFDLENBQUM7YUFDekM7UUFDSCxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsSUFBSSxRQUFRO1lBQ1YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsSUFBSSxJQUFJO1lBQ04sT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxRQUFRO1lBQ1YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsSUFBSSxNQUFNO1lBQ1IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxDQUFDO1FBQ0QsSUFBSSxJQUFJO1lBQ04sT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxLQUFLO1lBQ1AsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNsQyxDQUFDO1FBR0Qsa0JBQWtCO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN2QixDQUFDO1FBRUQsVUFBVSxDQUFDLEVBQTBCO1lBQ25DLDhDQUE4QztZQUM5Qyw0QkFBNEI7UUFDOUIsQ0FBQztRQUVELFlBQVksQ0FBQyxFQUEwQjtZQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ04sSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xGLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakYsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBRUQsSUFBSSxHQUFHO1lBQ0wsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVPLFlBQVksQ0FBQyxLQUFjLEVBQUUsR0FBVyxFQUFFLFdBQW1CLEVBQUU7WUFDckUsaUVBQWlFO1lBQ2pFLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMxQyx1Q0FBVyxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxLQUFFLEtBQUssSUFBRTtRQUM3QyxDQUFDO1FBRUQsWUFBWSxDQUFDLEtBQVUsRUFBRSxLQUFhLEVBQUUsTUFBYztZQUNwRCxNQUFNLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXRGLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLG1DQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsR0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFRCxTQUFTLENBQUMsS0FBVSxFQUFFLEtBQWEsRUFBRSxNQUFjO1lBQ2pELE1BQU0sRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLGlDQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsSUFBRSxDQUFDO1FBQy9GLENBQUM7UUFFRCxPQUFPO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJO1lBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUN4QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUUxQixJQUFJLE9BQU8sS0FBSyxPQUFPLEVBQUU7Z0JBQ3ZCLGlCQUFpQixDQUNiLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUN0QixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQXdCLENBQUMsQ0FBQyxDQUFDO2FBQzlGO1FBQ0gsQ0FBQztRQUVELFFBQVE7WUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDcEIsQ0FBQzs7NEZBMUdVLG9CQUFvQixjQWFYLDZCQUE2QjtnRUFidEMsb0JBQW9CLFdBQXBCLG9CQUFvQjsrQkF4R2pDO0tBbU5DO1NBM0dZLG9CQUFvQjtrREFBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O3NCQWNJLE1BQU07dUJBQUMsNkJBQTZCOztzQkFBRyxRQUFROztBQWdHOUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEVBQWE7SUFDN0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uQ2hhbmdlRXZlbnQsIExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIsIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogUGFyc2VyIGZyb20gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjYXBwZW5kaXgtQlxuICogXigoW146Lz8jXSspOik/KC8vKFteLz8jXSopKT8oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpP1xuICogIDEyICAgICAgICAgICAgMyAgNCAgICAgICAgICA1ICAgICAgIDYgIDcgICAgICAgIDggOVxuICpcbiAqIEV4YW1wbGU6IGh0dHA6Ly93d3cuaWNzLnVjaS5lZHUvcHViL2lldGYvdXJpLyNSZWxhdGVkXG4gKlxuICogUmVzdWx0cyBpbjpcbiAqXG4gKiAkMSA9IGh0dHA6XG4gKiAkMiA9IGh0dHBcbiAqICQzID0gLy93d3cuaWNzLnVjaS5lZHVcbiAqICQ0ID0gd3d3Lmljcy51Y2kuZWR1XG4gKiAkNSA9IC9wdWIvaWV0Zi91cmkvXG4gKiAkNiA9IDx1bmRlZmluZWQ+XG4gKiAkNyA9IDx1bmRlZmluZWQ+XG4gKiAkOCA9ICNSZWxhdGVkXG4gKiAkOSA9IFJlbGF0ZWRcbiAqL1xuY29uc3QgdXJsUGFyc2UgPSAvXigoW146XFwvPyNdKyk6KT8oXFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/LztcblxuZnVuY3Rpb24gcGFyc2VVcmwodXJsU3RyOiBzdHJpbmcsIGJhc2VIcmVmOiBzdHJpbmcpIHtcbiAgY29uc3QgdmVyaWZ5UHJvdG9jb2wgPSAvXigoaHR0cFtzXT98ZnRwKTpcXC9cXC8pLztcbiAgbGV0IHNlcnZlckJhc2U6IHN0cmluZ3x1bmRlZmluZWQ7XG5cbiAgLy8gVVJMIGNsYXNzIHJlcXVpcmVzIGZ1bGwgVVJMLiBJZiB0aGUgVVJMIHN0cmluZyBkb2Vzbid0IHN0YXJ0IHdpdGggcHJvdG9jb2wsIHdlIG5lZWQgdG8gYWRkXG4gIC8vIGFuIGFyYml0cmFyeSBiYXNlIFVSTCB3aGljaCBjYW4gYmUgcmVtb3ZlZCBhZnRlcndhcmQuXG4gIGlmICghdmVyaWZ5UHJvdG9jb2wudGVzdCh1cmxTdHIpKSB7XG4gICAgc2VydmVyQmFzZSA9ICdodHRwOi8vZW1wdHkuY29tLyc7XG4gIH1cbiAgbGV0IHBhcnNlZFVybDoge1xuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgaG9zdG5hbWU6IHN0cmluZyxcbiAgICBwb3J0OiBzdHJpbmcsXG4gICAgcGF0aG5hbWU6IHN0cmluZyxcbiAgICBzZWFyY2g6IHN0cmluZyxcbiAgICBoYXNoOiBzdHJpbmdcbiAgfTtcbiAgdHJ5IHtcbiAgICBwYXJzZWRVcmwgPSBuZXcgVVJMKHVybFN0ciwgc2VydmVyQmFzZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zdCByZXN1bHQgPSB1cmxQYXJzZS5leGVjKHNlcnZlckJhc2UgfHwgJycgKyB1cmxTdHIpO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgVVJMOiAke3VybFN0cn0gd2l0aCBiYXNlOiAke2Jhc2VIcmVmfWApO1xuICAgIH1cbiAgICBjb25zdCBob3N0U3BsaXQgPSByZXN1bHRbNF0uc3BsaXQoJzonKTtcbiAgICBwYXJzZWRVcmwgPSB7XG4gICAgICBwcm90b2NvbDogcmVzdWx0WzFdLFxuICAgICAgaG9zdG5hbWU6IGhvc3RTcGxpdFswXSxcbiAgICAgIHBvcnQ6IGhvc3RTcGxpdFsxXSB8fCAnJyxcbiAgICAgIHBhdGhuYW1lOiByZXN1bHRbNV0sXG4gICAgICBzZWFyY2g6IHJlc3VsdFs2XSxcbiAgICAgIGhhc2g6IHJlc3VsdFs4XSxcbiAgICB9O1xuICB9XG4gIGlmIChwYXJzZWRVcmwucGF0aG5hbWUgJiYgcGFyc2VkVXJsLnBhdGhuYW1lLmluZGV4T2YoYmFzZUhyZWYpID09PSAwKSB7XG4gICAgcGFyc2VkVXJsLnBhdGhuYW1lID0gcGFyc2VkVXJsLnBhdGhuYW1lLnN1YnN0cmluZyhiYXNlSHJlZi5sZW5ndGgpO1xuICB9XG4gIHJldHVybiB7XG4gICAgaG9zdG5hbWU6ICFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5ob3N0bmFtZSB8fCAnJyxcbiAgICBwcm90b2NvbDogIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLnByb3RvY29sIHx8ICcnLFxuICAgIHBvcnQ6ICFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5wb3J0IHx8ICcnLFxuICAgIHBhdGhuYW1lOiBwYXJzZWRVcmwucGF0aG5hbWUgfHwgJy8nLFxuICAgIHNlYXJjaDogcGFyc2VkVXJsLnNlYXJjaCB8fCAnJyxcbiAgICBoYXNoOiBwYXJzZWRVcmwuaGFzaCB8fCAnJyxcbiAgfTtcbn1cblxuLyoqXG4gKiBNb2NrIHBsYXRmb3JtIGxvY2F0aW9uIGNvbmZpZ1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZyB7XG4gIHN0YXJ0VXJsPzogc3RyaW5nO1xuICBhcHBCYXNlSHJlZj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcm92aWRlciBmb3IgbW9jayBwbGF0Zm9ybSBsb2NhdGlvbiBjb25maWdcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnPignTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcnKTtcblxuLyoqXG4gKiBNb2NrIGltcGxlbWVudGF0aW9uIG9mIFVSTCBzdGF0ZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrUGxhdGZvcm1Mb2NhdGlvbiBpbXBsZW1lbnRzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwcml2YXRlIGJhc2VIcmVmOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBoYXNoVXBkYXRlID0gbmV3IFN1YmplY3Q8TG9jYXRpb25DaGFuZ2VFdmVudD4oKTtcbiAgcHJpdmF0ZSB1cmxDaGFuZ2VzOiB7XG4gICAgaG9zdG5hbWU6IHN0cmluZyxcbiAgICBwcm90b2NvbDogc3RyaW5nLFxuICAgIHBvcnQ6IHN0cmluZyxcbiAgICBwYXRobmFtZTogc3RyaW5nLFxuICAgIHNlYXJjaDogc3RyaW5nLFxuICAgIGhhc2g6IHN0cmluZyxcbiAgICBzdGF0ZTogdW5rbm93blxuICB9W10gPSBbe2hvc3RuYW1lOiAnJywgcHJvdG9jb2w6ICcnLCBwb3J0OiAnJywgcGF0aG5hbWU6ICcvJywgc2VhcmNoOiAnJywgaGFzaDogJycsIHN0YXRlOiBudWxsfV07XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRykgQE9wdGlvbmFsKCkgY29uZmlnPzpcbiAgICAgICAgICAgICAgICAgIE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnKSB7XG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgdGhpcy5iYXNlSHJlZiA9IGNvbmZpZy5hcHBCYXNlSHJlZiB8fCAnJztcblxuICAgICAgY29uc3QgcGFyc2VkQ2hhbmdlcyA9XG4gICAgICAgICAgdGhpcy5wYXJzZUNoYW5nZXMobnVsbCwgY29uZmlnLnN0YXJ0VXJsIHx8ICdodHRwOi8vPGVtcHR5Pi8nLCB0aGlzLmJhc2VIcmVmKTtcbiAgICAgIHRoaXMudXJsQ2hhbmdlc1swXSA9IHsuLi5wYXJzZWRDaGFuZ2VzfTtcbiAgICB9XG4gIH1cblxuICBnZXQgaG9zdG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1swXS5ob3N0bmFtZTtcbiAgfVxuICBnZXQgcHJvdG9jb2woKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1swXS5wcm90b2NvbDtcbiAgfVxuICBnZXQgcG9ydCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnBvcnQ7XG4gIH1cbiAgZ2V0IHBhdGhuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0ucGF0aG5hbWU7XG4gIH1cbiAgZ2V0IHNlYXJjaCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLnNlYXJjaDtcbiAgfVxuICBnZXQgaGFzaCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzWzBdLmhhc2g7XG4gIH1cbiAgZ2V0IHN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbMF0uc3RhdGU7XG4gIH1cblxuXG4gIGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmJhc2VIcmVmO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIC8vIE5vLW9wOiBhIHN0YXRlIHN0YWNrIGlzIG5vdCBpbXBsZW1lbnRlZCwgc29cbiAgICAvLyBubyBldmVudHMgd2lsbCBldmVyIGNvbWUuXG4gIH1cblxuICBvbkhhc2hDaGFuZ2UoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLmhhc2hVcGRhdGUuc3Vic2NyaWJlKGZuKTtcbiAgfVxuXG4gIGdldCBocmVmKCk6IHN0cmluZyB7XG4gICAgbGV0IHVybCA9IGAke3RoaXMucHJvdG9jb2x9Ly8ke3RoaXMuaG9zdG5hbWV9JHt0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJ31gO1xuICAgIHVybCArPSBgJHt0aGlzLnBhdGhuYW1lID09PSAnLycgPyAnJyA6IHRoaXMucGF0aG5hbWV9JHt0aGlzLnNlYXJjaH0ke3RoaXMuaGFzaH1gO1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICBnZXQgdXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMucGF0aG5hbWV9JHt0aGlzLnNlYXJjaH0ke3RoaXMuaGFzaH1gO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUNoYW5nZXMoc3RhdGU6IHVua25vd24sIHVybDogc3RyaW5nLCBiYXNlSHJlZjogc3RyaW5nID0gJycpIHtcbiAgICAvLyBXaGVuIHRoZSBgaGlzdG9yeS5zdGF0ZWAgdmFsdWUgaXMgc3RvcmVkLCBpdCBpcyBhbHdheXMgY29waWVkLlxuICAgIHN0YXRlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzdGF0ZSkpO1xuICAgIHJldHVybiB7Li4ucGFyc2VVcmwodXJsLCBiYXNlSHJlZiksIHN0YXRlfTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtwYXRobmFtZSwgc2VhcmNoLCBzdGF0ZTogcGFyc2VkU3RhdGUsIGhhc2h9ID0gdGhpcy5wYXJzZUNoYW5nZXMoc3RhdGUsIG5ld1VybCk7XG5cbiAgICB0aGlzLnVybENoYW5nZXNbMF0gPSB7Li4udGhpcy51cmxDaGFuZ2VzWzBdLCBwYXRobmFtZSwgc2VhcmNoLCBoYXNoLCBzdGF0ZTogcGFyc2VkU3RhdGV9O1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIG5ld1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qge3BhdGhuYW1lLCBzZWFyY2gsIHN0YXRlOiBwYXJzZWRTdGF0ZSwgaGFzaH0gPSB0aGlzLnBhcnNlQ2hhbmdlcyhzdGF0ZSwgbmV3VXJsKTtcbiAgICB0aGlzLnVybENoYW5nZXMudW5zaGlmdCh7Li4udGhpcy51cmxDaGFuZ2VzWzBdLCBwYXRobmFtZSwgc2VhcmNoLCBoYXNoLCBzdGF0ZTogcGFyc2VkU3RhdGV9KTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGJhY2soKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkVXJsID0gdGhpcy51cmw7XG4gICAgY29uc3Qgb2xkSGFzaCA9IHRoaXMuaGFzaDtcbiAgICB0aGlzLnVybENoYW5nZXMuc2hpZnQoKTtcbiAgICBjb25zdCBuZXdIYXNoID0gdGhpcy5oYXNoO1xuXG4gICAgaWYgKG9sZEhhc2ggIT09IG5ld0hhc2gpIHtcbiAgICAgIHNjaGVkdWxlTWljcm9UYXNrKFxuICAgICAgICAgICgpID0+IHRoaXMuaGFzaFVwZGF0ZS5uZXh0KFxuICAgICAgICAgICAgICB7dHlwZTogJ2hhc2hjaGFuZ2UnLCBzdGF0ZTogbnVsbCwgb2xkVXJsLCBuZXdVcmw6IHRoaXMudXJsfSBhcyBMb2NhdGlvbkNoYW5nZUV2ZW50KSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlTWljcm9UYXNrKGNiOiAoKSA9PiBhbnkpIHtcbiAgUHJvbWlzZS5yZXNvbHZlKG51bGwpLnRoZW4oY2IpO1xufVxuIl19