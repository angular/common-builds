/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT, ɵPlatformNavigation as PlatformNavigation, } from '@angular/common';
import { Inject, inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { FakeNavigation } from './navigation/fake_navigation';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: MockPlatformLocation, deps: [{ token: MOCK_PLATFORM_LOCATION_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: MockPlatformLocation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: MockPlatformLocation, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MOCK_PLATFORM_LOCATION_CONFIG]
                }, {
                    type: Optional
                }] }] });
/**
 * Mock implementation of URL state.
 */
export class FakeNavigationPlatformLocation {
    constructor() {
        this._platformNavigation = inject(PlatformNavigation);
        this.window = inject(DOCUMENT).defaultView;
        this.config = inject(MOCK_PLATFORM_LOCATION_CONFIG, { optional: true });
        if (!(this._platformNavigation instanceof FakeNavigation)) {
            throw new Error('FakePlatformNavigation cannot be used without FakeNavigation. Use ' +
                '`provideFakeNavigation` to have all these services provided together.');
        }
    }
    getBaseHrefFromDOM() {
        return this.config?.appBaseHref ?? '';
    }
    onPopState(fn) {
        this.window.addEventListener('popstate', fn);
        return () => this.window.removeEventListener('popstate', fn);
    }
    onHashChange(fn) {
        this.window.addEventListener('hashchange', fn);
        return () => this.window.removeEventListener('hashchange', fn);
    }
    get href() {
        return this._platformNavigation.currentEntry.url;
    }
    get protocol() {
        return new URL(this._platformNavigation.currentEntry.url).protocol;
    }
    get hostname() {
        return new URL(this._platformNavigation.currentEntry.url).hostname;
    }
    get port() {
        return new URL(this._platformNavigation.currentEntry.url).port;
    }
    get pathname() {
        return new URL(this._platformNavigation.currentEntry.url).pathname;
    }
    get search() {
        return new URL(this._platformNavigation.currentEntry.url).search;
    }
    get hash() {
        return new URL(this._platformNavigation.currentEntry.url).hash;
    }
    pushState(state, title, url) {
        this._platformNavigation.pushState(state, title, url);
    }
    replaceState(state, title, url) {
        this._platformNavigation.replaceState(state, title, url);
    }
    forward() {
        this._platformNavigation.forward();
    }
    back() {
        this._platformNavigation.back();
    }
    historyGo(relativePosition = 0) {
        this._platformNavigation.go(relativePosition);
    }
    getState() {
        return this._platformNavigation.currentEntry.getHistoryState();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: FakeNavigationPlatformLocation, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: FakeNavigationPlatformLocation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: FakeNavigationPlatformLocation, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxRQUFRLEVBSVIsbUJBQW1CLElBQUksa0JBQWtCLEdBQzFDLE1BQU0saUJBQWlCLENBQUM7QUFDekIsT0FBTyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU3QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sOEJBQThCLENBQUM7O0FBRTVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFNLFFBQVEsR0FBRywrREFBK0QsQ0FBQztBQUVqRixTQUFTLFFBQVEsQ0FBQyxNQUFjLEVBQUUsUUFBZ0I7SUFDaEQsTUFBTSxjQUFjLEdBQUcsd0JBQXdCLENBQUM7SUFDaEQsSUFBSSxVQUE4QixDQUFDO0lBRW5DLDZGQUE2RjtJQUM3Rix3REFBd0Q7SUFDeEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7SUFDbkMsQ0FBQztJQUNELElBQUksU0FPSCxDQUFDO0lBQ0YsSUFBSSxDQUFDO1FBQ0gsU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztR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QUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxFQUFTLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQztJQUNwRCxDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNsRSxDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwRSxDQUFDO0lBQ0QsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLEdBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNsRSxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQVUsRUFBRSxLQUFhLEVBQUUsR0FBVztRQUM5QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELFlBQVksQ0FBQyxLQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVc7UUFDakQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxTQUFTLENBQUMsbUJBQTJCLENBQUM7UUFDcEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2pFLENBQUM7eUhBeEVVLDhCQUE4Qjs2SEFBOUIsOEJBQThCOztzR0FBOUIsOEJBQThCO2tCQUQxQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERPQ1VNRU5ULFxuICBMb2NhdGlvbkNoYW5nZUV2ZW50LFxuICBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyLFxuICBQbGF0Zm9ybUxvY2F0aW9uLFxuICDJtVBsYXRmb3JtTmF2aWdhdGlvbiBhcyBQbGF0Zm9ybU5hdmlnYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtGYWtlTmF2aWdhdGlvbn0gZnJvbSAnLi9uYXZpZ2F0aW9uL2Zha2VfbmF2aWdhdGlvbic7XG5cbi8qKlxuICogUGFyc2VyIGZyb20gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjYXBwZW5kaXgtQlxuICogXigoW146Lz8jXSspOik/KC8vKFteLz8jXSopKT8oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpP1xuICogIDEyICAgICAgICAgICAgMyAgNCAgICAgICAgICA1ICAgICAgIDYgIDcgICAgICAgIDggOVxuICpcbiAqIEV4YW1wbGU6IGh0dHA6Ly93d3cuaWNzLnVjaS5lZHUvcHViL2lldGYvdXJpLyNSZWxhdGVkXG4gKlxuICogUmVzdWx0cyBpbjpcbiAqXG4gKiAkMSA9IGh0dHA6XG4gKiAkMiA9IGh0dHBcbiAqICQzID0gLy93d3cuaWNzLnVjaS5lZHVcbiAqICQ0ID0gd3d3Lmljcy51Y2kuZWR1XG4gKiAkNSA9IC9wdWIvaWV0Zi91cmkvXG4gKiAkNiA9IDx1bmRlZmluZWQ+XG4gKiAkNyA9IDx1bmRlZmluZWQ+XG4gKiAkOCA9ICNSZWxhdGVkXG4gKiAkOSA9IFJlbGF0ZWRcbiAqL1xuY29uc3QgdXJsUGFyc2UgPSAvXigoW146XFwvPyNdKyk6KT8oXFwvXFwvKFteXFwvPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/LztcblxuZnVuY3Rpb24gcGFyc2VVcmwodXJsU3RyOiBzdHJpbmcsIGJhc2VIcmVmOiBzdHJpbmcpIHtcbiAgY29uc3QgdmVyaWZ5UHJvdG9jb2wgPSAvXigoaHR0cFtzXT98ZnRwKTpcXC9cXC8pLztcbiAgbGV0IHNlcnZlckJhc2U6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAvLyBVUkwgY2xhc3MgcmVxdWlyZXMgZnVsbCBVUkwuIElmIHRoZSBVUkwgc3RyaW5nIGRvZXNuJ3Qgc3RhcnQgd2l0aCBwcm90b2NvbCwgd2UgbmVlZCB0byBhZGRcbiAgLy8gYW4gYXJiaXRyYXJ5IGJhc2UgVVJMIHdoaWNoIGNhbiBiZSByZW1vdmVkIGFmdGVyd2FyZC5cbiAgaWYgKCF2ZXJpZnlQcm90b2NvbC50ZXN0KHVybFN0cikpIHtcbiAgICBzZXJ2ZXJCYXNlID0gJ2h0dHA6Ly9lbXB0eS5jb20vJztcbiAgfVxuICBsZXQgcGFyc2VkVXJsOiB7XG4gICAgcHJvdG9jb2w6IHN0cmluZztcbiAgICBob3N0bmFtZTogc3RyaW5nO1xuICAgIHBvcnQ6IHN0cmluZztcbiAgICBwYXRobmFtZTogc3RyaW5nO1xuICAgIHNlYXJjaDogc3RyaW5nO1xuICAgIGhhc2g6IHN0cmluZztcbiAgfTtcbiAgdHJ5IHtcbiAgICBwYXJzZWRVcmwgPSBuZXcgVVJMKHVybFN0ciwgc2VydmVyQmFzZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zdCByZXN1bHQgPSB1cmxQYXJzZS5leGVjKHNlcnZlckJhc2UgfHwgJycgKyB1cmxTdHIpO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgVVJMOiAke3VybFN0cn0gd2l0aCBiYXNlOiAke2Jhc2VIcmVmfWApO1xuICAgIH1cbiAgICBjb25zdCBob3N0U3BsaXQgPSByZXN1bHRbNF0uc3BsaXQoJzonKTtcbiAgICBwYXJzZWRVcmwgPSB7XG4gICAgICBwcm90b2NvbDogcmVzdWx0WzFdLFxuICAgICAgaG9zdG5hbWU6IGhvc3RTcGxpdFswXSxcbiAgICAgIHBvcnQ6IGhvc3RTcGxpdFsxXSB8fCAnJyxcbiAgICAgIHBhdGhuYW1lOiByZXN1bHRbNV0sXG4gICAgICBzZWFyY2g6IHJlc3VsdFs2XSxcbiAgICAgIGhhc2g6IHJlc3VsdFs4XSxcbiAgICB9O1xuICB9XG4gIGlmIChwYXJzZWRVcmwucGF0aG5hbWUgJiYgcGFyc2VkVXJsLnBhdGhuYW1lLmluZGV4T2YoYmFzZUhyZWYpID09PSAwKSB7XG4gICAgcGFyc2VkVXJsLnBhdGhuYW1lID0gcGFyc2VkVXJsLnBhdGhuYW1lLnN1YnN0cmluZyhiYXNlSHJlZi5sZW5ndGgpO1xuICB9XG4gIHJldHVybiB7XG4gICAgaG9zdG5hbWU6ICghc2VydmVyQmFzZSAmJiBwYXJzZWRVcmwuaG9zdG5hbWUpIHx8ICcnLFxuICAgIHByb3RvY29sOiAoIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLnByb3RvY29sKSB8fCAnJyxcbiAgICBwb3J0OiAoIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLnBvcnQpIHx8ICcnLFxuICAgIHBhdGhuYW1lOiBwYXJzZWRVcmwucGF0aG5hbWUgfHwgJy8nLFxuICAgIHNlYXJjaDogcGFyc2VkVXJsLnNlYXJjaCB8fCAnJyxcbiAgICBoYXNoOiBwYXJzZWRVcmwuaGFzaCB8fCAnJyxcbiAgfTtcbn1cblxuLyoqXG4gKiBNb2NrIHBsYXRmb3JtIGxvY2F0aW9uIGNvbmZpZ1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZyB7XG4gIHN0YXJ0VXJsPzogc3RyaW5nO1xuICBhcHBCYXNlSHJlZj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcm92aWRlciBmb3IgbW9jayBwbGF0Zm9ybSBsb2NhdGlvbiBjb25maWdcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZz4oXG4gICdNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRycsXG4pO1xuXG4vKipcbiAqIE1vY2sgaW1wbGVtZW50YXRpb24gb2YgVVJMIHN0YXRlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tQbGF0Zm9ybUxvY2F0aW9uIGltcGxlbWVudHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHByaXZhdGUgYmFzZUhyZWY6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIGhhc2hVcGRhdGUgPSBuZXcgU3ViamVjdDxMb2NhdGlvbkNoYW5nZUV2ZW50PigpO1xuICBwcml2YXRlIHBvcFN0YXRlU3ViamVjdCA9IG5ldyBTdWJqZWN0PExvY2F0aW9uQ2hhbmdlRXZlbnQ+KCk7XG4gIHByaXZhdGUgdXJsQ2hhbmdlSW5kZXg6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgdXJsQ2hhbmdlczoge1xuICAgIGhvc3RuYW1lOiBzdHJpbmc7XG4gICAgcHJvdG9jb2w6IHN0cmluZztcbiAgICBwb3J0OiBzdHJpbmc7XG4gICAgcGF0aG5hbWU6IHN0cmluZztcbiAgICBzZWFyY2g6IHN0cmluZztcbiAgICBoYXNoOiBzdHJpbmc7XG4gICAgc3RhdGU6IHVua25vd247XG4gIH1bXSA9IFt7aG9zdG5hbWU6ICcnLCBwcm90b2NvbDogJycsIHBvcnQ6ICcnLCBwYXRobmFtZTogJy8nLCBzZWFyY2g6ICcnLCBoYXNoOiAnJywgc3RhdGU6IG51bGx9XTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KE1PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHKSBAT3B0aW9uYWwoKSBjb25maWc/OiBNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZyxcbiAgKSB7XG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgdGhpcy5iYXNlSHJlZiA9IGNvbmZpZy5hcHBCYXNlSHJlZiB8fCAnJztcblxuICAgICAgY29uc3QgcGFyc2VkQ2hhbmdlcyA9IHRoaXMucGFyc2VDaGFuZ2VzKFxuICAgICAgICBudWxsLFxuICAgICAgICBjb25maWcuc3RhcnRVcmwgfHwgJ2h0dHA6Ly9fZW1wdHlfLycsXG4gICAgICAgIHRoaXMuYmFzZUhyZWYsXG4gICAgICApO1xuICAgICAgdGhpcy51cmxDaGFuZ2VzWzBdID0gey4uLnBhcnNlZENoYW5nZXN9O1xuICAgIH1cbiAgfVxuXG4gIGdldCBob3N0bmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLmhvc3RuYW1lO1xuICB9XG4gIGdldCBwcm90b2NvbCgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLnByb3RvY29sO1xuICB9XG4gIGdldCBwb3J0KCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0ucG9ydDtcbiAgfVxuICBnZXQgcGF0aG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5wYXRobmFtZTtcbiAgfVxuICBnZXQgc2VhcmNoKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0uc2VhcmNoO1xuICB9XG4gIGdldCBoYXNoKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0uaGFzaDtcbiAgfVxuICBnZXQgc3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5zdGF0ZTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmJhc2VIcmVmO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IFZvaWRGdW5jdGlvbiB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5wb3BTdGF0ZVN1YmplY3Quc3Vic2NyaWJlKGZuKTtcbiAgICByZXR1cm4gKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBvbkhhc2hDaGFuZ2UoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiBWb2lkRnVuY3Rpb24ge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuaGFzaFVwZGF0ZS5zdWJzY3JpYmUoZm4pO1xuICAgIHJldHVybiAoKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIGdldCBocmVmKCk6IHN0cmluZyB7XG4gICAgbGV0IHVybCA9IGAke3RoaXMucHJvdG9jb2x9Ly8ke3RoaXMuaG9zdG5hbWV9JHt0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJ31gO1xuICAgIHVybCArPSBgJHt0aGlzLnBhdGhuYW1lID09PSAnLycgPyAnJyA6IHRoaXMucGF0aG5hbWV9JHt0aGlzLnNlYXJjaH0ke3RoaXMuaGFzaH1gO1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICBnZXQgdXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMucGF0aG5hbWV9JHt0aGlzLnNlYXJjaH0ke3RoaXMuaGFzaH1gO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUNoYW5nZXMoc3RhdGU6IHVua25vd24sIHVybDogc3RyaW5nLCBiYXNlSHJlZjogc3RyaW5nID0gJycpIHtcbiAgICAvLyBXaGVuIHRoZSBgaGlzdG9yeS5zdGF0ZWAgdmFsdWUgaXMgc3RvcmVkLCBpdCBpcyBhbHdheXMgY29waWVkLlxuICAgIHN0YXRlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzdGF0ZSkpO1xuICAgIHJldHVybiB7Li4ucGFyc2VVcmwodXJsLCBiYXNlSHJlZiksIHN0YXRlfTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtwYXRobmFtZSwgc2VhcmNoLCBzdGF0ZTogcGFyc2VkU3RhdGUsIGhhc2h9ID0gdGhpcy5wYXJzZUNoYW5nZXMoc3RhdGUsIG5ld1VybCk7XG5cbiAgICB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0gPSB7XG4gICAgICAuLi50aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0sXG4gICAgICBwYXRobmFtZSxcbiAgICAgIHNlYXJjaCxcbiAgICAgIGhhc2gsXG4gICAgICBzdGF0ZTogcGFyc2VkU3RhdGUsXG4gICAgfTtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtwYXRobmFtZSwgc2VhcmNoLCBzdGF0ZTogcGFyc2VkU3RhdGUsIGhhc2h9ID0gdGhpcy5wYXJzZUNoYW5nZXMoc3RhdGUsIG5ld1VybCk7XG4gICAgaWYgKHRoaXMudXJsQ2hhbmdlSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLnVybENoYW5nZXMuc3BsaWNlKHRoaXMudXJsQ2hhbmdlSW5kZXggKyAxKTtcbiAgICB9XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goe1xuICAgICAgLi4udGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLFxuICAgICAgcGF0aG5hbWUsXG4gICAgICBzZWFyY2gsXG4gICAgICBoYXNoLFxuICAgICAgc3RhdGU6IHBhcnNlZFN0YXRlLFxuICAgIH0pO1xuICAgIHRoaXMudXJsQ2hhbmdlSW5kZXggPSB0aGlzLnVybENoYW5nZXMubGVuZ3RoIC0gMTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkVXJsID0gdGhpcy51cmw7XG4gICAgY29uc3Qgb2xkSGFzaCA9IHRoaXMuaGFzaDtcbiAgICBpZiAodGhpcy51cmxDaGFuZ2VJbmRleCA8IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudXJsQ2hhbmdlSW5kZXgrKztcbiAgICB9XG4gICAgdGhpcy5lbWl0RXZlbnRzKG9sZEhhc2gsIG9sZFVybCk7XG4gIH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsO1xuICAgIGNvbnN0IG9sZEhhc2ggPSB0aGlzLmhhc2g7XG4gICAgaWYgKHRoaXMudXJsQ2hhbmdlSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLnVybENoYW5nZUluZGV4LS07XG4gICAgfVxuICAgIHRoaXMuZW1pdEV2ZW50cyhvbGRIYXNoLCBvbGRVcmwpO1xuICB9XG5cbiAgaGlzdG9yeUdvKHJlbGF0aXZlUG9zaXRpb246IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybDtcbiAgICBjb25zdCBvbGRIYXNoID0gdGhpcy5oYXNoO1xuICAgIGNvbnN0IG5leHRQYWdlSW5kZXggPSB0aGlzLnVybENoYW5nZUluZGV4ICsgcmVsYXRpdmVQb3NpdGlvbjtcbiAgICBpZiAobmV4dFBhZ2VJbmRleCA+PSAwICYmIG5leHRQYWdlSW5kZXggPCB0aGlzLnVybENoYW5nZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVybENoYW5nZUluZGV4ID0gbmV4dFBhZ2VJbmRleDtcbiAgICB9XG4gICAgdGhpcy5lbWl0RXZlbnRzKG9sZEhhc2gsIG9sZFVybCk7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCcm93c2VycyBhcmUgaW5jb25zaXN0ZW50IGluIHdoZW4gdGhleSBmaXJlIGV2ZW50cyBhbmQgcGVyZm9ybSB0aGUgc3RhdGUgdXBkYXRlc1xuICAgKiBUaGUgbW9zdCBlYXNpZXN0IHRoaW5nIHRvIGRvIGluIG91ciBtb2NrIGlzIHN5bmNocm9ub3VzIGFuZCB0aGF0IGhhcHBlbnMgdG8gbWF0Y2hcbiAgICogRmlyZWZveCBhbmQgQ2hyb21lLCBhdCBsZWFzdCBzb21ld2hhdCBjbG9zZWx5XG4gICAqXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL25hdmlnYXRpb24tYXBpI3dhdGNoaW5nLWZvci1uYXZpZ2F0aW9uc1xuICAgKiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFQZHZlLURKMUpDR2lsajlZcWY1SHhSSnlCS1NlbDVvd2dPdlVKcVRhdXdVL2VkaXQjaGVhZGluZz1oLjN5ZTR2NzF3c3o5NFxuICAgKiBwb3BzdGF0ZSBpcyBhbHdheXMgc2VudCBiZWZvcmUgaGFzaGNoYW5nZTpcbiAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy9wb3BzdGF0ZV9ldmVudCN3aGVuX3BvcHN0YXRlX2lzX3NlbnRcbiAgICovXG4gIHByaXZhdGUgZW1pdEV2ZW50cyhvbGRIYXNoOiBzdHJpbmcsIG9sZFVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5wb3BTdGF0ZVN1YmplY3QubmV4dCh7XG4gICAgICB0eXBlOiAncG9wc3RhdGUnLFxuICAgICAgc3RhdGU6IHRoaXMuZ2V0U3RhdGUoKSxcbiAgICAgIG9sZFVybCxcbiAgICAgIG5ld1VybDogdGhpcy51cmwsXG4gICAgfSBhcyBMb2NhdGlvbkNoYW5nZUV2ZW50KTtcbiAgICBpZiAob2xkSGFzaCAhPT0gdGhpcy5oYXNoKSB7XG4gICAgICB0aGlzLmhhc2hVcGRhdGUubmV4dCh7XG4gICAgICAgIHR5cGU6ICdoYXNoY2hhbmdlJyxcbiAgICAgICAgc3RhdGU6IG51bGwsXG4gICAgICAgIG9sZFVybCxcbiAgICAgICAgbmV3VXJsOiB0aGlzLnVybCxcbiAgICAgIH0gYXMgTG9jYXRpb25DaGFuZ2VFdmVudCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTW9jayBpbXBsZW1lbnRhdGlvbiBvZiBVUkwgc3RhdGUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGYWtlTmF2aWdhdGlvblBsYXRmb3JtTG9jYXRpb24gaW1wbGVtZW50cyBQbGF0Zm9ybUxvY2F0aW9uIHtcbiAgcHJpdmF0ZSBfcGxhdGZvcm1OYXZpZ2F0aW9uID0gaW5qZWN0KFBsYXRmb3JtTmF2aWdhdGlvbikgYXMgRmFrZU5hdmlnYXRpb247XG4gIHByaXZhdGUgd2luZG93ID0gaW5qZWN0KERPQ1VNRU5UKS5kZWZhdWx0VmlldyE7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgaWYgKCEodGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uIGluc3RhbmNlb2YgRmFrZU5hdmlnYXRpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdGYWtlUGxhdGZvcm1OYXZpZ2F0aW9uIGNhbm5vdCBiZSB1c2VkIHdpdGhvdXQgRmFrZU5hdmlnYXRpb24uIFVzZSAnICtcbiAgICAgICAgICAnYHByb3ZpZGVGYWtlTmF2aWdhdGlvbmAgdG8gaGF2ZSBhbGwgdGhlc2Ugc2VydmljZXMgcHJvdmlkZWQgdG9nZXRoZXIuJyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb25maWcgPSBpbmplY3QoTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc/LmFwcEJhc2VIcmVmID8/ICcnO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IFZvaWRGdW5jdGlvbiB7XG4gICAgdGhpcy53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmbik7XG4gICAgcmV0dXJuICgpID0+IHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZm4pO1xuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogVm9pZEZ1bmN0aW9uIHtcbiAgICB0aGlzLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZm4gYXMgYW55KTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy53aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZuIGFzIGFueSk7XG4gIH1cblxuICBnZXQgaHJlZigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wbGF0Zm9ybU5hdmlnYXRpb24uY3VycmVudEVudHJ5LnVybCE7XG4gIH1cbiAgZ2V0IHByb3RvY29sKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBVUkwodGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmN1cnJlbnRFbnRyeS51cmwhKS5wcm90b2NvbDtcbiAgfVxuICBnZXQgaG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmV3IFVSTCh0aGlzLl9wbGF0Zm9ybU5hdmlnYXRpb24uY3VycmVudEVudHJ5LnVybCEpLmhvc3RuYW1lO1xuICB9XG4gIGdldCBwb3J0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBVUkwodGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmN1cnJlbnRFbnRyeS51cmwhKS5wb3J0O1xuICB9XG4gIGdldCBwYXRobmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVVJMKHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5jdXJyZW50RW50cnkudXJsISkucGF0aG5hbWU7XG4gIH1cbiAgZ2V0IHNlYXJjaCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVVJMKHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5jdXJyZW50RW50cnkudXJsISkuc2VhcmNoO1xuICB9XG4gIGdldCBoYXNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBVUkwodGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmN1cnJlbnRFbnRyeS51cmwhKS5oYXNoO1xuICB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybU5hdmlnYXRpb24ucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmZvcndhcmQoKTtcbiAgfVxuXG4gIGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmJhY2soKTtcbiAgfVxuXG4gIGhpc3RvcnlHbyhyZWxhdGl2ZVBvc2l0aW9uOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1OYXZpZ2F0aW9uLmdvKHJlbGF0aXZlUG9zaXRpb24pO1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtTmF2aWdhdGlvbi5jdXJyZW50RW50cnkuZ2V0SGlzdG9yeVN0YXRlKCk7XG4gIH1cbn1cbiJdfQ==