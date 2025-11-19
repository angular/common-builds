/**
 * @license Angular v21.0.0-rc.3+sha-28c1a2d
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { inject, Injectable, InjectionToken, DOCUMENT, Optional, Inject, ɵɵinject as __inject } from '@angular/core';
import { Subject } from 'rxjs';

let _DOM = null;
function getDOM() {
  return _DOM;
}
function setRootDomAdapter(adapter) {
  _DOM ??= adapter;
}
class DomAdapter {}

class PlatformLocation {
  historyGo(relativePosition) {
    throw new Error(ngDevMode ? 'Not implemented' : '');
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: PlatformLocation,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: PlatformLocation,
    providedIn: 'platform',
    useFactory: () => inject(BrowserPlatformLocation)
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.3+sha-28c1a2d",
  ngImport: i0,
  type: PlatformLocation,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'platform',
      useFactory: () => inject(BrowserPlatformLocation)
    }]
  }]
});
const LOCATION_INITIALIZED = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'Location Initialized' : '');
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
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: BrowserPlatformLocation,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: BrowserPlatformLocation,
    providedIn: 'platform',
    useFactory: () => new BrowserPlatformLocation()
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.3+sha-28c1a2d",
  ngImport: i0,
  type: BrowserPlatformLocation,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'platform',
      useFactory: () => new BrowserPlatformLocation()
    }]
  }],
  ctorParameters: () => []
});

function joinWithSlash(start, end) {
  if (!start) return end;
  if (!end) return start;
  if (start.endsWith('/')) {
    return end.startsWith('/') ? start + end.slice(1) : start + end;
  }
  return end.startsWith('/') ? start + end : `${start}/${end}`;
}
function stripTrailingSlash(url) {
  const pathEndIdx = url.search(/#|\?|$/);
  return url[pathEndIdx - 1] === '/' ? url.slice(0, pathEndIdx - 1) + url.slice(pathEndIdx) : url;
}
function normalizeQueryParams(params) {
  return params && params[0] !== '?' ? `?${params}` : params;
}

class LocationStrategy {
  historyGo(relativePosition) {
    throw new Error(ngDevMode ? 'Not implemented' : '');
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: LocationStrategy,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: LocationStrategy,
    providedIn: 'root',
    useFactory: () => inject(PathLocationStrategy)
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.3+sha-28c1a2d",
  ngImport: i0,
  type: LocationStrategy,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useFactory: () => inject(PathLocationStrategy)
    }]
  }]
});
const APP_BASE_HREF = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'appBaseHref' : '');
class PathLocationStrategy extends LocationStrategy {
  _platformLocation;
  _baseHref;
  _removeListenerFns = [];
  constructor(_platformLocation, href) {
    super();
    this._platformLocation = _platformLocation;
    this._baseHref = href ?? this._platformLocation.getBaseHrefFromDOM() ?? inject(DOCUMENT).location?.origin ?? '';
  }
  ngOnDestroy() {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()();
    }
  }
  onPopState(fn) {
    this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
  }
  getBaseHref() {
    return this._baseHref;
  }
  prepareExternalUrl(internal) {
    return joinWithSlash(this._baseHref, internal);
  }
  path(includeHash = false) {
    const pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
    const hash = this._platformLocation.hash;
    return hash && includeHash ? `${pathname}${hash}` : pathname;
  }
  pushState(state, title, url, queryParams) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.pushState(state, title, externalUrl);
  }
  replaceState(state, title, url, queryParams) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.replaceState(state, title, externalUrl);
  }
  forward() {
    this._platformLocation.forward();
  }
  back() {
    this._platformLocation.back();
  }
  getState() {
    return this._platformLocation.getState();
  }
  historyGo(relativePosition = 0) {
    this._platformLocation.historyGo?.(relativePosition);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: PathLocationStrategy,
    deps: [{
      token: PlatformLocation
    }, {
      token: APP_BASE_HREF,
      optional: true
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: PathLocationStrategy,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.3+sha-28c1a2d",
  ngImport: i0,
  type: PathLocationStrategy,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => [{
    type: PlatformLocation
  }, {
    type: undefined,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [APP_BASE_HREF]
    }]
  }]
});

class Location {
  _subject = new Subject();
  _basePath;
  _locationStrategy;
  _urlChangeListeners = [];
  _urlChangeSubscription = null;
  constructor(locationStrategy) {
    this._locationStrategy = locationStrategy;
    const baseHref = this._locationStrategy.getBaseHref();
    this._basePath = _stripOrigin(stripTrailingSlash(_stripIndexHtml(baseHref)));
    this._locationStrategy.onPopState(ev => {
      this._subject.next({
        'url': this.path(true),
        'pop': true,
        'state': ev.state,
        'type': ev.type
      });
    });
  }
  ngOnDestroy() {
    this._urlChangeSubscription?.unsubscribe();
    this._urlChangeListeners = [];
  }
  path(includeHash = false) {
    return this.normalize(this._locationStrategy.path(includeHash));
  }
  getState() {
    return this._locationStrategy.getState();
  }
  isCurrentPathEqualTo(path, query = '') {
    return this.path() == this.normalize(path + normalizeQueryParams(query));
  }
  normalize(url) {
    return Location.stripTrailingSlash(_stripBasePath(this._basePath, _stripIndexHtml(url)));
  }
  prepareExternalUrl(url) {
    if (url && url[0] !== '/') {
      url = '/' + url;
    }
    return this._locationStrategy.prepareExternalUrl(url);
  }
  go(path, query = '', state = null) {
    this._locationStrategy.pushState(state, '', path, query);
    this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }
  replaceState(path, query = '', state = null) {
    this._locationStrategy.replaceState(state, '', path, query);
    this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }
  forward() {
    this._locationStrategy.forward();
  }
  back() {
    this._locationStrategy.back();
  }
  historyGo(relativePosition = 0) {
    this._locationStrategy.historyGo?.(relativePosition);
  }
  onUrlChange(fn) {
    this._urlChangeListeners.push(fn);
    this._urlChangeSubscription ??= this.subscribe(v => {
      this._notifyUrlChangeListeners(v.url, v.state);
    });
    return () => {
      const fnIndex = this._urlChangeListeners.indexOf(fn);
      this._urlChangeListeners.splice(fnIndex, 1);
      if (this._urlChangeListeners.length === 0) {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeSubscription = null;
      }
    };
  }
  _notifyUrlChangeListeners(url = '', state) {
    this._urlChangeListeners.forEach(fn => fn(url, state));
  }
  subscribe(onNext, onThrow, onReturn) {
    return this._subject.subscribe({
      next: onNext,
      error: onThrow ?? undefined,
      complete: onReturn ?? undefined
    });
  }
  static normalizeQueryParams = normalizeQueryParams;
  static joinWithSlash = joinWithSlash;
  static stripTrailingSlash = stripTrailingSlash;
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: Location,
    deps: [{
      token: LocationStrategy
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.0-rc.3+sha-28c1a2d",
    ngImport: i0,
    type: Location,
    providedIn: 'root',
    useFactory: createLocation
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.3+sha-28c1a2d",
  ngImport: i0,
  type: Location,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useFactory: createLocation
    }]
  }],
  ctorParameters: () => [{
    type: LocationStrategy
  }]
});
function createLocation() {
  return new Location(__inject(LocationStrategy));
}
function _stripBasePath(basePath, url) {
  if (!basePath || !url.startsWith(basePath)) {
    return url;
  }
  const strippedUrl = url.substring(basePath.length);
  if (strippedUrl === '' || ['/', ';', '?', '#'].includes(strippedUrl[0])) {
    return strippedUrl;
  }
  return url;
}
function _stripIndexHtml(url) {
  return url.replace(/\/index.html$/, '');
}
function _stripOrigin(baseHref) {
  const isAbsoluteUrl = new RegExp('^(https?:)?//').test(baseHref);
  if (isAbsoluteUrl) {
    const [, pathname] = baseHref.split(/\/\/[^\/]+/);
    return pathname;
  }
  return baseHref;
}

export { APP_BASE_HREF, BrowserPlatformLocation, DomAdapter, LOCATION_INITIALIZED, Location, LocationStrategy, PathLocationStrategy, PlatformLocation, getDOM, joinWithSlash, normalizeQueryParams, setRootDomAdapter };
//# sourceMappingURL=_location-chunk.mjs.map
