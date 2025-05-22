/**
 * @license Angular v19.2.12+sha-a6d5479
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

export { DOCUMENT };
//# sourceMappingURL=dom_tokens-rA0ACyx7.mjs.map
