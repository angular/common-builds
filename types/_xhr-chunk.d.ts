/**
 * @license Angular v22.1.2+sha-4413711
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
declare abstract class XhrFactory {
    abstract build(): XMLHttpRequest;
    static ɵfac: i0.ɵɵFactoryDeclaration<XhrFactory, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<XhrFactory>;
}

export { XhrFactory };
