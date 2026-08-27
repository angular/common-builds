/**
 * @license Angular v22.2.0-next.4+sha-4fc45a9
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
