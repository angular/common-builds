/**
 * @license Angular v21.0.0-rc.0+sha-ca0e77b
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { Injectable } from '@angular/core';

class PlatformNavigation {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-ca0e77b",
    ngImport: i0,
    type: PlatformNavigation,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-ca0e77b",
    ngImport: i0,
    type: PlatformNavigation,
    providedIn: 'platform',
    useFactory: () => window.navigation
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.0+sha-ca0e77b",
  ngImport: i0,
  type: PlatformNavigation,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'platform',
      useFactory: () => window.navigation
    }]
  }]
});

export { PlatformNavigation };
//# sourceMappingURL=_platform_navigation-chunk.mjs.map
