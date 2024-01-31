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
        hostname: (!serverBase && parsedUrl.hostname) || '',
        protocol: (!serverBase && parsedUrl.protocol) || '',
        port: (!serverBase && parsedUrl.port) || '',
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
export class MockPlatformLocation {
    constructor(config) {
        this.baseHref = '';
        this.hashUpdate = new Subject();
        this.popStateSubject = new Subject();
        this.urlChangeIndex = 0;
        this.urlChanges = [{ hostname: '', protocol: '', port: '', pathname: '/', search: '', hash: '', state: null }];
        if (config) {
            this.baseHref = config.appBaseHref || '';
            const parsedChanges = this.parseChanges(null, config.startUrl || 'http://_empty_/', this.baseHref);
            this.urlChanges[0] = { ...parsedChanges };
        }
    }
    get hostname() {
        return this.urlChanges[this.urlChangeIndex].hostname;
    }
    get protocol() {
        return this.urlChanges[this.urlChangeIndex].protocol;
    }
    get port() {
        return this.urlChanges[this.urlChangeIndex].port;
    }
    get pathname() {
        return this.urlChanges[this.urlChangeIndex].pathname;
    }
    get search() {
        return this.urlChanges[this.urlChangeIndex].search;
    }
    get hash() {
        return this.urlChanges[this.urlChangeIndex].hash;
    }
    get state() {
        return this.urlChanges[this.urlChangeIndex].state;
    }
    getBaseHrefFromDOM() {
        return this.baseHref;
    }
    onPopState(fn) {
        const subscription = this.popStateSubject.subscribe(fn);
        return () => subscription.unsubscribe();
    }
    onHashChange(fn) {
        const subscription = this.hashUpdate.subscribe(fn);
        return () => subscription.unsubscribe();
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
        return { ...parseUrl(url, baseHref), state };
    }
    replaceState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        this.urlChanges[this.urlChangeIndex] = {
            ...this.urlChanges[this.urlChangeIndex],
            pathname,
            search,
            hash,
            state: parsedState,
        };
    }
    pushState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        if (this.urlChangeIndex > 0) {
            this.urlChanges.splice(this.urlChangeIndex + 1);
        }
        this.urlChanges.push({
            ...this.urlChanges[this.urlChangeIndex],
            pathname,
            search,
            hash,
            state: parsedState,
        });
        this.urlChangeIndex = this.urlChanges.length - 1;
    }
    forward() {
        const oldUrl = this.url;
        const oldHash = this.hash;
        if (this.urlChangeIndex < this.urlChanges.length) {
            this.urlChangeIndex++;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    back() {
        const oldUrl = this.url;
        const oldHash = this.hash;
        if (this.urlChangeIndex > 0) {
            this.urlChangeIndex--;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    historyGo(relativePosition = 0) {
        const oldUrl = this.url;
        const oldHash = this.hash;
        const nextPageIndex = this.urlChangeIndex + relativePosition;
        if (nextPageIndex >= 0 && nextPageIndex < this.urlChanges.length) {
            this.urlChangeIndex = nextPageIndex;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    getState() {
        return this.state;
    }
    /**
     * Browsers are inconsistent in when they fire events and perform the state updates
     * The most easiest thing to do in our mock is synchronous and that happens to match
     * Firefox and Chrome, at least somewhat closely
     *
     * https://github.com/WICG/navigation-api#watching-for-navigations
     * https://docs.google.com/document/d/1Pdve-DJ1JCGilj9Yqf5HxRJyBKSel5owgOvUJqTauwU/edit#heading=h.3ye4v71wsz94
     * popstate is always sent before hashchange:
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event#when_popstate_is_sent
     */
    emitEvents(oldHash, oldUrl) {
        this.popStateSubject.next({
            type: 'popstate',
            state: this.getState(),
            oldUrl,
            newUrl: this.url,
        });
        if (oldHash !== this.hash) {
            this.hashUpdate.next({
                type: 'hashchange',
                state: null,
                oldUrl,
                newUrl: this.url,
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.2+sha-57cb448", ngImport: i0, type: MockPlatformLocation, deps: [{ token: MOCK_PLATFORM_LOCATION_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.2+sha-57cb448", ngImport: i0, type: MockPlatformLocation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.2+sha-57cb448", ngImport: i0, type: MockPlatformLocation, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MOCK_PLATFORM_LOCATION_CONFIG]
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQzs7QUFFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sUUFBUSxHQUFHLCtEQUErRCxDQUFDO0FBRWpGLFNBQVMsUUFBUSxDQUFDLE1BQWMsRUFBRSxRQUFnQjtJQUNoRCxNQUFNLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQztJQUNoRCxJQUFJLFVBQThCLENBQUM7SUFFbkMsNkZBQTZGO0lBQzdGLHdEQUF3RDtJQUN4RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pDLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQztJQUNuQyxDQUFDO0lBQ0QsSUFBSSxTQU9ILENBQUM7SUFDRixJQUFJLENBQUM7UUFDSCxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1gsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE1BQU0sZUFBZSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FB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QkFEaEMsVUFBVTs7MEJBaUJOLE1BQU07MkJBQUMsNkJBQTZCOzswQkFBRyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb25DaGFuZ2VFdmVudCwgTG9jYXRpb25DaGFuZ2VMaXN0ZW5lciwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBQYXJzZXIgZnJvbSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNhcHBlbmRpeC1CXG4gKiBeKChbXjovPyNdKyk6KT8oLy8oW14vPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/XG4gKiAgMTIgICAgICAgICAgICAzICA0ICAgICAgICAgIDUgICAgICAgNiAgNyAgICAgICAgOCA5XG4gKlxuICogRXhhbXBsZTogaHR0cDovL3d3dy5pY3MudWNpLmVkdS9wdWIvaWV0Zi91cmkvI1JlbGF0ZWRcbiAqXG4gKiBSZXN1bHRzIGluOlxuICpcbiAqICQxID0gaHR0cDpcbiAqICQyID0gaHR0cFxuICogJDMgPSAvL3d3dy5pY3MudWNpLmVkdVxuICogJDQgPSB3d3cuaWNzLnVjaS5lZHVcbiAqICQ1ID0gL3B1Yi9pZXRmL3VyaS9cbiAqICQ2ID0gPHVuZGVmaW5lZD5cbiAqICQ3ID0gPHVuZGVmaW5lZD5cbiAqICQ4ID0gI1JlbGF0ZWRcbiAqICQ5ID0gUmVsYXRlZFxuICovXG5jb25zdCB1cmxQYXJzZSA9IC9eKChbXjpcXC8/I10rKTopPyhcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT8vO1xuXG5mdW5jdGlvbiBwYXJzZVVybCh1cmxTdHI6IHN0cmluZywgYmFzZUhyZWY6IHN0cmluZykge1xuICBjb25zdCB2ZXJpZnlQcm90b2NvbCA9IC9eKChodHRwW3NdP3xmdHApOlxcL1xcLykvO1xuICBsZXQgc2VydmVyQmFzZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gIC8vIFVSTCBjbGFzcyByZXF1aXJlcyBmdWxsIFVSTC4gSWYgdGhlIFVSTCBzdHJpbmcgZG9lc24ndCBzdGFydCB3aXRoIHByb3RvY29sLCB3ZSBuZWVkIHRvIGFkZFxuICAvLyBhbiBhcmJpdHJhcnkgYmFzZSBVUkwgd2hpY2ggY2FuIGJlIHJlbW92ZWQgYWZ0ZXJ3YXJkLlxuICBpZiAoIXZlcmlmeVByb3RvY29sLnRlc3QodXJsU3RyKSkge1xuICAgIHNlcnZlckJhc2UgPSAnaHR0cDovL2VtcHR5LmNvbS8nO1xuICB9XG4gIGxldCBwYXJzZWRVcmw6IHtcbiAgICBwcm90b2NvbDogc3RyaW5nO1xuICAgIGhvc3RuYW1lOiBzdHJpbmc7XG4gICAgcG9ydDogc3RyaW5nO1xuICAgIHBhdGhuYW1lOiBzdHJpbmc7XG4gICAgc2VhcmNoOiBzdHJpbmc7XG4gICAgaGFzaDogc3RyaW5nO1xuICB9O1xuICB0cnkge1xuICAgIHBhcnNlZFVybCA9IG5ldyBVUkwodXJsU3RyLCBzZXJ2ZXJCYXNlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHVybFBhcnNlLmV4ZWMoc2VydmVyQmFzZSB8fCAnJyArIHVybFN0cik7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBVUkw6ICR7dXJsU3RyfSB3aXRoIGJhc2U6ICR7YmFzZUhyZWZ9YCk7XG4gICAgfVxuICAgIGNvbnN0IGhvc3RTcGxpdCA9IHJlc3VsdFs0XS5zcGxpdCgnOicpO1xuICAgIHBhcnNlZFVybCA9IHtcbiAgICAgIHByb3RvY29sOiByZXN1bHRbMV0sXG4gICAgICBob3N0bmFtZTogaG9zdFNwbGl0WzBdLFxuICAgICAgcG9ydDogaG9zdFNwbGl0WzFdIHx8ICcnLFxuICAgICAgcGF0aG5hbWU6IHJlc3VsdFs1XSxcbiAgICAgIHNlYXJjaDogcmVzdWx0WzZdLFxuICAgICAgaGFzaDogcmVzdWx0WzhdLFxuICAgIH07XG4gIH1cbiAgaWYgKHBhcnNlZFVybC5wYXRobmFtZSAmJiBwYXJzZWRVcmwucGF0aG5hbWUuaW5kZXhPZihiYXNlSHJlZikgPT09IDApIHtcbiAgICBwYXJzZWRVcmwucGF0aG5hbWUgPSBwYXJzZWRVcmwucGF0aG5hbWUuc3Vic3RyaW5nKGJhc2VIcmVmLmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBob3N0bmFtZTogKCFzZXJ2ZXJCYXNlICYmIHBhcnNlZFVybC5ob3N0bmFtZSkgfHwgJycsXG4gICAgcHJvdG9jb2w6ICghc2VydmVyQmFzZSAmJiBwYXJzZWRVcmwucHJvdG9jb2wpIHx8ICcnLFxuICAgIHBvcnQ6ICghc2VydmVyQmFzZSAmJiBwYXJzZWRVcmwucG9ydCkgfHwgJycsXG4gICAgcGF0aG5hbWU6IHBhcnNlZFVybC5wYXRobmFtZSB8fCAnLycsXG4gICAgc2VhcmNoOiBwYXJzZWRVcmwuc2VhcmNoIHx8ICcnLFxuICAgIGhhc2g6IHBhcnNlZFVybC5oYXNoIHx8ICcnLFxuICB9O1xufVxuXG4vKipcbiAqIE1vY2sgcGxhdGZvcm0gbG9jYXRpb24gY29uZmlnXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnIHtcbiAgc3RhcnRVcmw/OiBzdHJpbmc7XG4gIGFwcEJhc2VIcmVmPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFByb3ZpZGVyIGZvciBtb2NrIHBsYXRmb3JtIGxvY2F0aW9uIGNvbmZpZ1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IE1PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuPE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnPihcbiAgJ01PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHJyxcbik7XG5cbi8qKlxuICogTW9jayBpbXBsZW1lbnRhdGlvbiBvZiBVUkwgc3RhdGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja1BsYXRmb3JtTG9jYXRpb24gaW1wbGVtZW50cyBQbGF0Zm9ybUxvY2F0aW9uIHtcbiAgcHJpdmF0ZSBiYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgaGFzaFVwZGF0ZSA9IG5ldyBTdWJqZWN0PExvY2F0aW9uQ2hhbmdlRXZlbnQ+KCk7XG4gIHByaXZhdGUgcG9wU3RhdGVTdWJqZWN0ID0gbmV3IFN1YmplY3Q8TG9jYXRpb25DaGFuZ2VFdmVudD4oKTtcbiAgcHJpdmF0ZSB1cmxDaGFuZ2VJbmRleDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSB1cmxDaGFuZ2VzOiB7XG4gICAgaG9zdG5hbWU6IHN0cmluZztcbiAgICBwcm90b2NvbDogc3RyaW5nO1xuICAgIHBvcnQ6IHN0cmluZztcbiAgICBwYXRobmFtZTogc3RyaW5nO1xuICAgIHNlYXJjaDogc3RyaW5nO1xuICAgIGhhc2g6IHN0cmluZztcbiAgICBzdGF0ZTogdW5rbm93bjtcbiAgfVtdID0gW3tob3N0bmFtZTogJycsIHByb3RvY29sOiAnJywgcG9ydDogJycsIHBhdGhuYW1lOiAnLycsIHNlYXJjaDogJycsIGhhc2g6ICcnLCBzdGF0ZTogbnVsbH1dO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcpIEBPcHRpb25hbCgpIGNvbmZpZz86IE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnLFxuICApIHtcbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICB0aGlzLmJhc2VIcmVmID0gY29uZmlnLmFwcEJhc2VIcmVmIHx8ICcnO1xuXG4gICAgICBjb25zdCBwYXJzZWRDaGFuZ2VzID0gdGhpcy5wYXJzZUNoYW5nZXMoXG4gICAgICAgIG51bGwsXG4gICAgICAgIGNvbmZpZy5zdGFydFVybCB8fCAnaHR0cDovL19lbXB0eV8vJyxcbiAgICAgICAgdGhpcy5iYXNlSHJlZixcbiAgICAgICk7XG4gICAgICB0aGlzLnVybENoYW5nZXNbMF0gPSB7Li4ucGFyc2VkQ2hhbmdlc307XG4gICAgfVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0uaG9zdG5hbWU7XG4gIH1cbiAgZ2V0IHByb3RvY29sKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0ucHJvdG9jb2w7XG4gIH1cbiAgZ2V0IHBvcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5wb3J0O1xuICB9XG4gIGdldCBwYXRobmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLnBhdGhuYW1lO1xuICB9XG4gIGdldCBzZWFyY2goKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5zZWFyY2g7XG4gIH1cbiAgZ2V0IGhhc2goKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5oYXNoO1xuICB9XG4gIGdldCBzdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLnN0YXRlO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuYmFzZUhyZWY7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogVm9pZEZ1bmN0aW9uIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLnBvcFN0YXRlU3ViamVjdC5zdWJzY3JpYmUoZm4pO1xuICAgIHJldHVybiAoKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIG9uSGFzaENoYW5nZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IFZvaWRGdW5jdGlvbiB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5oYXNoVXBkYXRlLnN1YnNjcmliZShmbik7XG4gICAgcmV0dXJuICgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgZ2V0IGhyZWYoKTogc3RyaW5nIHtcbiAgICBsZXQgdXJsID0gYCR7dGhpcy5wcm90b2NvbH0vLyR7dGhpcy5ob3N0bmFtZX0ke3RoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnfWA7XG4gICAgdXJsICs9IGAke3RoaXMucGF0aG5hbWUgPT09ICcvJyA/ICcnIDogdGhpcy5wYXRobmFtZX0ke3RoaXMuc2VhcmNofSR7dGhpcy5oYXNofWA7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIGdldCB1cmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5wYXRobmFtZX0ke3RoaXMuc2VhcmNofSR7dGhpcy5oYXNofWA7XG4gIH1cblxuICBwcml2YXRlIHBhcnNlQ2hhbmdlcyhzdGF0ZTogdW5rbm93biwgdXJsOiBzdHJpbmcsIGJhc2VIcmVmOiBzdHJpbmcgPSAnJykge1xuICAgIC8vIFdoZW4gdGhlIGBoaXN0b3J5LnN0YXRlYCB2YWx1ZSBpcyBzdG9yZWQsIGl0IGlzIGFsd2F5cyBjb3BpZWQuXG4gICAgc3RhdGUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHN0YXRlKSk7XG4gICAgcmV0dXJuIHsuLi5wYXJzZVVybCh1cmwsIGJhc2VIcmVmKSwgc3RhdGV9O1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIG5ld1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qge3BhdGhuYW1lLCBzZWFyY2gsIHN0YXRlOiBwYXJzZWRTdGF0ZSwgaGFzaH0gPSB0aGlzLnBhcnNlQ2hhbmdlcyhzdGF0ZSwgbmV3VXJsKTtcblxuICAgIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XSA9IHtcbiAgICAgIC4uLnRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XSxcbiAgICAgIHBhdGhuYW1lLFxuICAgICAgc2VhcmNoLFxuICAgICAgaGFzaCxcbiAgICAgIHN0YXRlOiBwYXJzZWRTdGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIG5ld1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qge3BhdGhuYW1lLCBzZWFyY2gsIHN0YXRlOiBwYXJzZWRTdGF0ZSwgaGFzaH0gPSB0aGlzLnBhcnNlQ2hhbmdlcyhzdGF0ZSwgbmV3VXJsKTtcbiAgICBpZiAodGhpcy51cmxDaGFuZ2VJbmRleCA+IDApIHtcbiAgICAgIHRoaXMudXJsQ2hhbmdlcy5zcGxpY2UodGhpcy51cmxDaGFuZ2VJbmRleCArIDEpO1xuICAgIH1cbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCh7XG4gICAgICAuLi50aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0sXG4gICAgICBwYXRobmFtZSxcbiAgICAgIHNlYXJjaCxcbiAgICAgIGhhc2gsXG4gICAgICBzdGF0ZTogcGFyc2VkU3RhdGUsXG4gICAgfSk7XG4gICAgdGhpcy51cmxDaGFuZ2VJbmRleCA9IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGggLSAxO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybDtcbiAgICBjb25zdCBvbGRIYXNoID0gdGhpcy5oYXNoO1xuICAgIGlmICh0aGlzLnVybENoYW5nZUluZGV4IDwgdGhpcy51cmxDaGFuZ2VzLmxlbmd0aCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VJbmRleCsrO1xuICAgIH1cbiAgICB0aGlzLmVtaXRFdmVudHMob2xkSGFzaCwgb2xkVXJsKTtcbiAgfVxuXG4gIGJhY2soKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkVXJsID0gdGhpcy51cmw7XG4gICAgY29uc3Qgb2xkSGFzaCA9IHRoaXMuaGFzaDtcbiAgICBpZiAodGhpcy51cmxDaGFuZ2VJbmRleCA+IDApIHtcbiAgICAgIHRoaXMudXJsQ2hhbmdlSW5kZXgtLTtcbiAgICB9XG4gICAgdGhpcy5lbWl0RXZlbnRzKG9sZEhhc2gsIG9sZFVybCk7XG4gIH1cblxuICBoaXN0b3J5R28ocmVsYXRpdmVQb3NpdGlvbjogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsO1xuICAgIGNvbnN0IG9sZEhhc2ggPSB0aGlzLmhhc2g7XG4gICAgY29uc3QgbmV4dFBhZ2VJbmRleCA9IHRoaXMudXJsQ2hhbmdlSW5kZXggKyByZWxhdGl2ZVBvc2l0aW9uO1xuICAgIGlmIChuZXh0UGFnZUluZGV4ID49IDAgJiYgbmV4dFBhZ2VJbmRleCA8IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudXJsQ2hhbmdlSW5kZXggPSBuZXh0UGFnZUluZGV4O1xuICAgIH1cbiAgICB0aGlzLmVtaXRFdmVudHMob2xkSGFzaCwgb2xkVXJsKTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEJyb3dzZXJzIGFyZSBpbmNvbnNpc3RlbnQgaW4gd2hlbiB0aGV5IGZpcmUgZXZlbnRzIGFuZCBwZXJmb3JtIHRoZSBzdGF0ZSB1cGRhdGVzXG4gICAqIFRoZSBtb3N0IGVhc2llc3QgdGhpbmcgdG8gZG8gaW4gb3VyIG1vY2sgaXMgc3luY2hyb25vdXMgYW5kIHRoYXQgaGFwcGVucyB0byBtYXRjaFxuICAgKiBGaXJlZm94IGFuZCBDaHJvbWUsIGF0IGxlYXN0IHNvbWV3aGF0IGNsb3NlbHlcbiAgICpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL1dJQ0cvbmF2aWdhdGlvbi1hcGkjd2F0Y2hpbmctZm9yLW5hdmlnYXRpb25zXG4gICAqIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMVBkdmUtREoxSkNHaWxqOVlxZjVIeFJKeUJLU2VsNW93Z092VUpxVGF1d1UvZWRpdCNoZWFkaW5nPWguM3llNHY3MXdzejk0XG4gICAqIHBvcHN0YXRlIGlzIGFsd2F5cyBzZW50IGJlZm9yZSBoYXNoY2hhbmdlOlxuICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93L3BvcHN0YXRlX2V2ZW50I3doZW5fcG9wc3RhdGVfaXNfc2VudFxuICAgKi9cbiAgcHJpdmF0ZSBlbWl0RXZlbnRzKG9sZEhhc2g6IHN0cmluZywgb2xkVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLnBvcFN0YXRlU3ViamVjdC5uZXh0KHtcbiAgICAgIHR5cGU6ICdwb3BzdGF0ZScsXG4gICAgICBzdGF0ZTogdGhpcy5nZXRTdGF0ZSgpLFxuICAgICAgb2xkVXJsLFxuICAgICAgbmV3VXJsOiB0aGlzLnVybCxcbiAgICB9IGFzIExvY2F0aW9uQ2hhbmdlRXZlbnQpO1xuICAgIGlmIChvbGRIYXNoICE9PSB0aGlzLmhhc2gpIHtcbiAgICAgIHRoaXMuaGFzaFVwZGF0ZS5uZXh0KHtcbiAgICAgICAgdHlwZTogJ2hhc2hjaGFuZ2UnLFxuICAgICAgICBzdGF0ZTogbnVsbCxcbiAgICAgICAgb2xkVXJsLFxuICAgICAgICBuZXdVcmw6IHRoaXMudXJsLFxuICAgICAgfSBhcyBMb2NhdGlvbkNoYW5nZUV2ZW50KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==