/**
 * @license Angular v22.0.0-next.8+sha-9bead58
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
