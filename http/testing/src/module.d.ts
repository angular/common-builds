import * as i0 from '@angular/core';
import * as i1 from '@angular/common/http';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Configures `HttpClientTestingBackend` as the `HttpBackend` used by `HttpClient`.
 *
 * Inject `HttpTestingController` to expect and flush requests in your tests.
 *
 *
 */
export declare class HttpClientTestingModule {
    static ngModuleDef: i0.ɵNgModuleDefWithMeta<HttpClientTestingModule, never, [typeof i1.HttpClientModule], never>;
    static ngInjectorDef: i0.ɵInjectorDef<HttpClientTestingModule>;
}
