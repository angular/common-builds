/**
 * @license Angular v19.2.4+sha-f90dc69
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import { InjectionToken } from '@angular/core';

/**
 * A DI Token representing the main rendering context.
 * In a browser and SSR this is the DOM Document.
 * When using SSR, that document is created by [Domino](https://github.com/angular/domino).
 *
 * @publicApi
 */
const DOCUMENT = new InjectionToken(ngDevMode ? 'DocumentToken' : '');

export { DOCUMENT as D };
//# sourceMappingURL=dom_tokens-CNpAxedO.mjs.map
