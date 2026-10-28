/**
 * @license Angular v20.3.34+sha-59ee277
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { inject, Injectable, InjectionToken, DOCUMENT } from '@angular/core';

let _DOM = null;
function getDOM() {
    return _DOM;
}
function setRootDomAdapter(adapter) {
    _DOM ??= adapter;
}
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
class DomAdapter {
}

/**
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM APIs, which allows the Router to be
 * platform-agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms that Angular supports. For example, `@angular/platform-browser` provides an
 * implementation specific to the browser environment, while `@angular/platform-server` provides
 * one suitable for use with server-side rendering.
 *
 * The `PlatformLocation` class is used directly by all implementations of {@link LocationStrategy}
 * when they need to interact with the DOM APIs like pushState, popState, etc.
 *
 * {@link LocationStrategy} in turn is used by the {@link Location} service which is used directly
 * by the {@link /api/router/Router Router} in order to navigate between routes. Since all interactions between
 * {@link /api/router/Router Router} /
 * {@link Location} / {@link LocationStrategy} and DOM APIs flow through the `PlatformLocation`
 * class, they are all platform-agnostic.
 *
 * @publicApi
 */
class PlatformLocation {
    historyGo(relativePosition) {
        throw new Error(ngDevMode ? 'Not implemented' : '');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.34+sha-59ee277", ngImport: i0, type: PlatformLocation, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.34+sha-59ee277", ngImport: i0, type: PlatformLocation, providedIn: 'platform', useFactory: () => inject(BrowserPlatformLocation) });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.34+sha-59ee277", ngImport: i0, type: PlatformLocation, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'platform', useFactory: () => inject(BrowserPlatformLocation) }]
        }] });
/**
 * @description
 * Indicates when a location is initialized.
 *
 * @publicApi
 */
const LOCATION_INITIALIZED = new InjectionToken(ngDevMode ? 'Location Initialized' : '');
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * @publicApi
 */
class BrowserPlatformLocation extends PlatformLocation {
    _location;
    _history;
    _doc = inject(DOCUMENT);
    constructor() {
        super();
        this._location = window.location;
        this._history = window.history;
    }
    getBaseHrefFromDOM() {
        return getDOM().getBaseHref(this._doc);
    }
    onPopState(fn) {
        const window = getDOM().getGlobalEventTarget(this._doc, 'window');
        window.addEventListener('popstate', fn, false);
        return () => window.removeEventListener('popstate', fn);
    }
    onHashChange(fn) {
        const window = getDOM().getGlobalEventTarget(this._doc, 'window');
        window.addEventListener('hashchange', fn, false);
        return () => window.removeEventListener('hashchange', fn);
    }
    get href() {
        return this._location.href;
    }
    get protocol() {
        return this._location.protocol;
    }
    get hostname() {
        return this._location.hostname;
    }
    get port() {
        return this._location.port;
    }
    get pathname() {
        return this._location.pathname;
    }
    get search() {
        return this._location.search;
    }
    get hash() {
        return this._location.hash;
    }
    set pathname(newPath) {
        this._location.pathname = newPath;
    }
    pushState(state, title, url) {
        this._history.pushState(state, title, url);
    }
    replaceState(state, title, url) {
        this._history.replaceState(state, title, url);
    }
    forward() {
        this._history.forward();
    }
    back() {
        this._history.back();
    }
    historyGo(relativePosition = 0) {
        this._history.go(relativePosition);
    }
    getState() {
        return this._history.state;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.34+sha-59ee277", ngImport: i0, type: BrowserPlatformLocation, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.34+sha-59ee277", ngImport: i0, type: BrowserPlatformLocation, providedIn: 'platform', useFactory: () => new BrowserPlatformLocation() });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.34+sha-59ee277", ngImport: i0, type: BrowserPlatformLocation, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'platform',
                    useFactory: () => new BrowserPlatformLocation(),
                }]
        }], ctorParameters: () => [] });

export { BrowserPlatformLocation, DomAdapter, LOCATION_INITIALIZED, PlatformLocation, getDOM, setRootDomAdapter };
//# sourceMappingURL=platform_location.mjs.map
