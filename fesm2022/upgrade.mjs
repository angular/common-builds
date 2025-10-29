/**
 * @license Angular v21.1.0-next.0+sha-fb569ef
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { ɵisPromise as _isPromise, InjectionToken, NgModule, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { UpgradeModule } from '@angular/upgrade/static';
import { CommonModule, HashLocationStrategy } from './_common_module-chunk.mjs';
import { Location, LocationStrategy, APP_BASE_HREF, PlatformLocation, PathLocationStrategy } from './_location-chunk.mjs';

function deepEqual(a, b) {
  if (a === b) {
    return true;
  } else if (!a || !b) {
    return false;
  } else {
    try {
      if (a.prototype !== b.prototype || Array.isArray(a) && Array.isArray(b)) {
        return false;
      }
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (e) {
      return false;
    }
  }
}
function isAnchor(el) {
  return el.href !== undefined;
}

const PATH_MATCH = /^([^?#]*)(\?([^#]*))?(#(.*))?$/;
const DOUBLE_SLASH_REGEX = /^\s*[\\/]{2,}/;
const IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i;
const DEFAULT_PORTS = {
  'http:': 80,
  'https:': 443,
  'ftp:': 21
};
class $locationShim {
  location;
  platformLocation;
  urlCodec;
  locationStrategy;
  initializing = true;
  updateBrowser = false;
  $$absUrl = '';
  $$url = '';
  $$protocol;
  $$host = '';
  $$port;
  $$replace = false;
  $$path = '';
  $$search = '';
  $$hash = '';
  $$state;
  $$changeListeners = [];
  cachedState = null;
  urlChanges = new ReplaySubject(1);
  removeOnUrlChangeFn;
  constructor($injector, location, platformLocation, urlCodec, locationStrategy) {
    this.location = location;
    this.platformLocation = platformLocation;
    this.urlCodec = urlCodec;
    this.locationStrategy = locationStrategy;
    const initialUrl = this.browserUrl();
    let parsedUrl = this.urlCodec.parse(initialUrl);
    if (typeof parsedUrl === 'string') {
      throw 'Invalid URL';
    }
    this.$$protocol = parsedUrl.protocol;
    this.$$host = parsedUrl.hostname;
    this.$$port = parseInt(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null;
    this.$$parseLinkUrl(initialUrl, initialUrl);
    this.cacheState();
    this.$$state = this.browserState();
    this.removeOnUrlChangeFn = this.location.onUrlChange((newUrl, newState) => {
      this.urlChanges.next({
        newUrl,
        newState
      });
    });
    if (_isPromise($injector)) {
      $injector.then($i => this.initialize($i));
    } else {
      this.initialize($injector);
    }
  }
  initialize($injector) {
    const $rootScope = $injector.get('$rootScope');
    const $rootElement = $injector.get('$rootElement');
    $rootElement.on('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.which === 2 || event.button === 2) {
        return;
      }
      let elm = event.target;
      while (elm && elm.nodeName.toLowerCase() !== 'a') {
        if (elm === $rootElement[0] || !(elm = elm.parentNode)) {
          return;
        }
      }
      if (!isAnchor(elm)) {
        return;
      }
      const absHref = elm.href;
      const relHref = elm.getAttribute('href');
      if (IGNORE_URI_REGEXP.test(absHref)) {
        return;
      }
      if (absHref && !elm.getAttribute('target') && !event.isDefaultPrevented()) {
        if (this.$$parseLinkUrl(absHref, relHref)) {
          event.preventDefault();
          if (this.absUrl() !== this.browserUrl()) {
            $rootScope.$apply();
          }
        }
      }
    });
    this.urlChanges.subscribe(({
      newUrl,
      newState
    }) => {
      const oldUrl = this.absUrl();
      const oldState = this.$$state;
      this.$$parse(newUrl);
      newUrl = this.absUrl();
      this.$$state = newState;
      const defaultPrevented = $rootScope.$broadcast('$locationChangeStart', newUrl, oldUrl, newState, oldState).defaultPrevented;
      if (this.absUrl() !== newUrl) return;
      if (defaultPrevented) {
        this.$$parse(oldUrl);
        this.state(oldState);
        this.setBrowserUrlWithFallback(oldUrl, false, oldState);
        this.$$notifyChangeListeners(this.url(), this.$$state, oldUrl, oldState);
      } else {
        this.initializing = false;
        $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, newState, oldState);
        this.resetBrowserUpdate();
      }
      if (!$rootScope.$$phase) {
        $rootScope.$digest();
      }
    });
    $rootScope.$watch(() => {
      if (this.initializing || this.updateBrowser) {
        this.updateBrowser = false;
        const oldUrl = this.browserUrl();
        const newUrl = this.absUrl();
        const oldState = this.browserState();
        let currentReplace = this.$$replace;
        const urlOrStateChanged = !this.urlCodec.areEqual(oldUrl, newUrl) || oldState !== this.$$state;
        if (this.initializing || urlOrStateChanged) {
          this.initializing = false;
          $rootScope.$evalAsync(() => {
            const newUrl = this.absUrl();
            const defaultPrevented = $rootScope.$broadcast('$locationChangeStart', newUrl, oldUrl, this.$$state, oldState).defaultPrevented;
            if (this.absUrl() !== newUrl) return;
            if (defaultPrevented) {
              this.$$parse(oldUrl);
              this.$$state = oldState;
            } else {
              if (urlOrStateChanged) {
                this.setBrowserUrlWithFallback(newUrl, currentReplace, oldState === this.$$state ? null : this.$$state);
                this.$$replace = false;
              }
              $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, this.$$state, oldState);
              if (urlOrStateChanged) {
                this.$$notifyChangeListeners(this.url(), this.$$state, oldUrl, oldState);
              }
            }
          });
        }
      }
      this.$$replace = false;
    });
    $rootScope.$on('$destroy', () => {
      this.removeOnUrlChangeFn();
      this.urlChanges.complete();
    });
  }
  resetBrowserUpdate() {
    this.$$replace = false;
    this.$$state = this.browserState();
    this.updateBrowser = false;
    this.lastBrowserUrl = this.browserUrl();
  }
  lastHistoryState;
  lastBrowserUrl = '';
  browserUrl(url, replace, state) {
    if (typeof state === 'undefined') {
      state = null;
    }
    if (url) {
      let sameState = this.lastHistoryState === state;
      url = this.urlCodec.parse(url).href;
      if (this.lastBrowserUrl === url && sameState) {
        return this;
      }
      this.lastBrowserUrl = url;
      this.lastHistoryState = state;
      url = this.stripBaseUrl(this.getServerBase(), url) || url;
      if (replace) {
        this.locationStrategy.replaceState(state, '', url, '');
      } else {
        this.locationStrategy.pushState(state, '', url, '');
      }
      this.cacheState();
      return this;
    } else {
      return this.platformLocation.href;
    }
  }
  lastCachedState = null;
  cacheState() {
    this.cachedState = this.platformLocation.getState();
    if (typeof this.cachedState === 'undefined') {
      this.cachedState = null;
    }
    if (deepEqual(this.cachedState, this.lastCachedState)) {
      this.cachedState = this.lastCachedState;
    }
    this.lastCachedState = this.cachedState;
    this.lastHistoryState = this.cachedState;
  }
  browserState() {
    return this.cachedState;
  }
  stripBaseUrl(base, url) {
    if (url.startsWith(base)) {
      return url.slice(base.length);
    }
    return undefined;
  }
  getServerBase() {
    const {
      protocol,
      hostname,
      port
    } = this.platformLocation;
    const baseHref = this.locationStrategy.getBaseHref();
    let url = `${protocol}//${hostname}${port ? ':' + port : ''}${baseHref || '/'}`;
    return url.endsWith('/') ? url : url + '/';
  }
  parseAppUrl(url) {
    if (DOUBLE_SLASH_REGEX.test(url)) {
      throw new Error(`Bad Path - URL cannot start with double slashes: ${url}`);
    }
    let prefixed = url.charAt(0) !== '/';
    if (prefixed) {
      url = '/' + url;
    }
    let match = this.urlCodec.parse(url, this.getServerBase());
    if (typeof match === 'string') {
      throw new Error(`Bad URL - Cannot parse URL: ${url}`);
    }
    let path = prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname;
    this.$$path = this.urlCodec.decodePath(path);
    this.$$search = this.urlCodec.decodeSearch(match.search);
    this.$$hash = this.urlCodec.decodeHash(match.hash);
    if (this.$$path && this.$$path.charAt(0) !== '/') {
      this.$$path = '/' + this.$$path;
    }
  }
  onChange(fn, err = e => {}) {
    this.$$changeListeners.push([fn, err]);
  }
  $$notifyChangeListeners(url = '', state, oldUrl = '', oldState) {
    this.$$changeListeners.forEach(([fn, err]) => {
      try {
        fn(url, state, oldUrl, oldState);
      } catch (e) {
        err(e);
      }
    });
  }
  $$parse(url) {
    let pathUrl;
    if (url.startsWith('/')) {
      pathUrl = url;
    } else {
      pathUrl = this.stripBaseUrl(this.getServerBase(), url);
    }
    if (typeof pathUrl === 'undefined') {
      throw new Error(`Invalid url "${url}", missing path prefix "${this.getServerBase()}".`);
    }
    this.parseAppUrl(pathUrl);
    this.$$path ||= '/';
    this.composeUrls();
  }
  $$parseLinkUrl(url, relHref) {
    if (relHref && relHref[0] === '#') {
      this.hash(relHref.slice(1));
      return true;
    }
    let rewrittenUrl;
    let appUrl = this.stripBaseUrl(this.getServerBase(), url);
    if (typeof appUrl !== 'undefined') {
      rewrittenUrl = this.getServerBase() + appUrl;
    } else if (this.getServerBase() === url + '/') {
      rewrittenUrl = this.getServerBase();
    }
    if (rewrittenUrl) {
      this.$$parse(rewrittenUrl);
    }
    return !!rewrittenUrl;
  }
  setBrowserUrlWithFallback(url, replace, state) {
    const oldUrl = this.url();
    const oldState = this.$$state;
    try {
      this.browserUrl(url, replace, state);
      this.$$state = this.browserState();
    } catch (e) {
      this.url(oldUrl);
      this.$$state = oldState;
      throw e;
    }
  }
  composeUrls() {
    this.$$url = this.urlCodec.normalize(this.$$path, this.$$search, this.$$hash);
    this.$$absUrl = this.getServerBase() + this.$$url.slice(1);
    this.updateBrowser = true;
  }
  absUrl() {
    return this.$$absUrl;
  }
  url(url) {
    if (typeof url === 'string') {
      if (!url.length) {
        url = '/';
      }
      const match = PATH_MATCH.exec(url);
      if (!match) return this;
      if (match[1] || url === '') this.path(this.urlCodec.decodePath(match[1]));
      if (match[2] || match[1] || url === '') this.search(match[3] || '');
      this.hash(match[5] || '');
      return this;
    }
    return this.$$url;
  }
  protocol() {
    return this.$$protocol;
  }
  host() {
    return this.$$host;
  }
  port() {
    return this.$$port;
  }
  path(path) {
    if (typeof path === 'undefined') {
      return this.$$path;
    }
    path = path !== null ? path.toString() : '';
    path = path.charAt(0) === '/' ? path : '/' + path;
    this.$$path = path;
    this.composeUrls();
    return this;
  }
  search(search, paramValue) {
    switch (arguments.length) {
      case 0:
        return this.$$search;
      case 1:
        if (typeof search === 'string' || typeof search === 'number') {
          this.$$search = this.urlCodec.decodeSearch(search.toString());
        } else if (typeof search === 'object' && search !== null) {
          search = {
            ...search
          };
          for (const key in search) {
            if (search[key] == null) delete search[key];
          }
          this.$$search = search;
        } else {
          throw new Error('LocationProvider.search(): First argument must be a string or an object.');
        }
        break;
      default:
        if (typeof search === 'string') {
          const currentSearch = this.search();
          if (typeof paramValue === 'undefined' || paramValue === null) {
            delete currentSearch[search];
            return this.search(currentSearch);
          } else {
            currentSearch[search] = paramValue;
            return this.search(currentSearch);
          }
        }
    }
    this.composeUrls();
    return this;
  }
  hash(hash) {
    if (typeof hash === 'undefined') {
      return this.$$hash;
    }
    this.$$hash = hash !== null ? hash.toString() : '';
    this.composeUrls();
    return this;
  }
  replace() {
    this.$$replace = true;
    return this;
  }
  state(state) {
    if (typeof state === 'undefined') {
      return this.$$state;
    }
    this.$$state = state;
    return this;
  }
}
class $locationShimProvider {
  ngUpgrade;
  location;
  platformLocation;
  urlCodec;
  locationStrategy;
  constructor(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
    this.ngUpgrade = ngUpgrade;
    this.location = location;
    this.platformLocation = platformLocation;
    this.urlCodec = urlCodec;
    this.locationStrategy = locationStrategy;
  }
  $get() {
    return new $locationShim(this.ngUpgrade.$injector, this.location, this.platformLocation, this.urlCodec, this.locationStrategy);
  }
  hashPrefix(prefix) {
    throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
  }
  html5Mode(mode) {
    throw new Error('Configure LocationUpgrade through LocationUpgradeModule.config method.');
  }
}

class UrlCodec {}
class AngularJSUrlCodec {
  encodePath(path) {
    const segments = path.split('/');
    let i = segments.length;
    while (i--) {
      segments[i] = encodeUriSegment(segments[i].replace(/%2F/g, '/'));
    }
    path = segments.join('/');
    return _stripIndexHtml((path && path[0] !== '/' && '/' || '') + path);
  }
  encodeSearch(search) {
    if (typeof search === 'string') {
      search = parseKeyValue(search);
    }
    search = toKeyValue(search);
    return search ? '?' + search : '';
  }
  encodeHash(hash) {
    hash = encodeUriSegment(hash);
    return hash ? '#' + hash : '';
  }
  decodePath(path, html5Mode = true) {
    const segments = path.split('/');
    let i = segments.length;
    while (i--) {
      segments[i] = decodeURIComponent(segments[i]);
      if (html5Mode) {
        segments[i] = segments[i].replace(/\//g, '%2F');
      }
    }
    return segments.join('/');
  }
  decodeSearch(search) {
    return parseKeyValue(search);
  }
  decodeHash(hash) {
    hash = decodeURIComponent(hash);
    return hash[0] === '#' ? hash.substring(1) : hash;
  }
  normalize(pathOrHref, search, hash, baseUrl) {
    if (arguments.length === 1) {
      const parsed = this.parse(pathOrHref, baseUrl);
      if (typeof parsed === 'string') {
        return parsed;
      }
      const serverUrl = `${parsed.protocol}://${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}`;
      return this.normalize(this.decodePath(parsed.pathname), this.decodeSearch(parsed.search), this.decodeHash(parsed.hash), serverUrl);
    } else {
      const encPath = this.encodePath(pathOrHref);
      const encSearch = search && this.encodeSearch(search) || '';
      const encHash = hash && this.encodeHash(hash) || '';
      let joinedPath = (baseUrl || '') + encPath;
      if (!joinedPath.length || joinedPath[0] !== '/') {
        joinedPath = '/' + joinedPath;
      }
      return joinedPath + encSearch + encHash;
    }
  }
  areEqual(valA, valB) {
    return this.normalize(valA) === this.normalize(valB);
  }
  parse(url, base) {
    try {
      const parsed = !base ? new URL(url) : new URL(url, base);
      return {
        href: parsed.href,
        protocol: parsed.protocol ? parsed.protocol.replace(/:$/, '') : '',
        host: parsed.host,
        search: parsed.search ? parsed.search.replace(/^\?/, '') : '',
        hash: parsed.hash ? parsed.hash.replace(/^#/, '') : '',
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname.charAt(0) === '/' ? parsed.pathname : '/' + parsed.pathname
      };
    } catch (e) {
      throw new Error(`Invalid URL (${url}) with base (${base})`);
    }
  }
}
function _stripIndexHtml(url) {
  return url.replace(/\/index.html$/, '');
}
function tryDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return undefined;
  }
}
function parseKeyValue(keyValue) {
  const obj = {};
  (keyValue || '').split('&').forEach(keyValue => {
    let splitPoint, key, val;
    if (keyValue) {
      key = keyValue = keyValue.replace(/\+/g, '%20');
      splitPoint = keyValue.indexOf('=');
      if (splitPoint !== -1) {
        key = keyValue.substring(0, splitPoint);
        val = keyValue.substring(splitPoint + 1);
      }
      key = tryDecodeURIComponent(key);
      if (typeof key !== 'undefined') {
        val = typeof val !== 'undefined' ? tryDecodeURIComponent(val) : true;
        if (!obj.hasOwnProperty(key)) {
          obj[key] = val;
        } else if (Array.isArray(obj[key])) {
          obj[key].push(val);
        } else {
          obj[key] = [obj[key], val];
        }
      }
    }
  });
  return obj;
}
function toKeyValue(obj) {
  const parts = [];
  for (const key in obj) {
    let value = obj[key];
    if (Array.isArray(value)) {
      value.forEach(arrayValue => {
        parts.push(encodeUriQuery(key, true) + (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
      });
    } else {
      parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
    }
  }
  return parts.length ? parts.join('&') : '';
}
function encodeUriSegment(val) {
  return encodeUriQuery(val, true).replace(/%26/g, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
}
function encodeUriQuery(val, pctEncodeSpaces = false) {
  return encodeURIComponent(val).replace(/%40/g, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%3B/gi, ';').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
}

const LOCATION_UPGRADE_CONFIGURATION = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'LOCATION_UPGRADE_CONFIGURATION' : '');
const APP_BASE_HREF_RESOLVED = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'APP_BASE_HREF_RESOLVED' : '');
class LocationUpgradeModule {
  static config(config) {
    return {
      ngModule: LocationUpgradeModule,
      providers: [Location, {
        provide: $locationShim,
        useFactory: provide$location
      }, {
        provide: LOCATION_UPGRADE_CONFIGURATION,
        useValue: config ? config : {}
      }, {
        provide: UrlCodec,
        useFactory: provideUrlCodec
      }, {
        provide: APP_BASE_HREF_RESOLVED,
        useFactory: provideAppBaseHref
      }, {
        provide: LocationStrategy,
        useFactory: provideLocationStrategy
      }]
    };
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: LocationUpgradeModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: LocationUpgradeModule,
    imports: [CommonModule]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: LocationUpgradeModule,
    imports: [CommonModule]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-fb569ef",
  ngImport: i0,
  type: LocationUpgradeModule,
  decorators: [{
    type: NgModule,
    args: [{
      imports: [CommonModule]
    }]
  }]
});
function provideAppBaseHref() {
  const config = inject(LOCATION_UPGRADE_CONFIGURATION);
  const appBaseHref = inject(APP_BASE_HREF, {
    optional: true
  });
  if (config && config.appBaseHref != null) {
    return config.appBaseHref;
  } else if (appBaseHref != null) {
    return appBaseHref;
  }
  return '';
}
function provideUrlCodec() {
  const config = inject(LOCATION_UPGRADE_CONFIGURATION);
  const codec = config && config.urlCodec || AngularJSUrlCodec;
  return new codec();
}
function provideLocationStrategy() {
  const platformLocation = inject(PlatformLocation);
  const baseHref = inject(APP_BASE_HREF_RESOLVED);
  const options = inject(LOCATION_UPGRADE_CONFIGURATION);
  return options.useHash ? new HashLocationStrategy(platformLocation, baseHref) : new PathLocationStrategy(platformLocation, baseHref);
}
function provide$location() {
  const $locationProvider = new $locationShimProvider(inject(UpgradeModule), inject(Location), inject(PlatformLocation), inject(UrlCodec), inject(LocationStrategy));
  return $locationProvider.$get();
}

export { $locationShim, $locationShimProvider, AngularJSUrlCodec, LOCATION_UPGRADE_CONFIGURATION, LocationUpgradeModule, UrlCodec };
//# sourceMappingURL=upgrade.mjs.map
