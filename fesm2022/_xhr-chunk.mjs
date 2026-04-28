/**
 * @license Angular v22.0.0-next.9+sha-52bcec1
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { Injectable } from '@angular/core';

function parseCookieValue(cookieStr, name) {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(';')) {
    const eqIndex = cookie.indexOf('=');
    const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

class BrowserXhr {
  build() {
    return new XMLHttpRequest();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "22.0.0-next.9+sha-52bcec1",
    ngImport: i0,
    type: BrowserXhr,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "22.0.0-next.9+sha-52bcec1",
    ngImport: i0,
    type: BrowserXhr,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "22.0.0-next.9+sha-52bcec1",
  ngImport: i0,
  type: BrowserXhr,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }]
});
class XhrFactory {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "22.0.0-next.9+sha-52bcec1",
    ngImport: i0,
    type: XhrFactory,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "22.0.0-next.9+sha-52bcec1",
    ngImport: i0,
    type: XhrFactory,
    providedIn: 'root',
    useExisting: BrowserXhr
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "22.0.0-next.9+sha-52bcec1",
  ngImport: i0,
  type: XhrFactory,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useExisting: BrowserXhr
    }]
  }]
});

export { XhrFactory, parseCookieValue };
//# sourceMappingURL=_xhr-chunk.mjs.map
