/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { XhrFactory } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpBackend } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
import * as i0 from "@angular/core";
/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see `HttpHandler`
 * @see `JsonpClientBackend`
 *
 * @publicApi
 */
export declare class HttpXhrBackend implements HttpBackend {
    private xhrFactory;
    constructor(xhrFactory: XhrFactory);
    /**
     * Processes a request and returns a stream of response events.
     * @param req The request object.
     * @returns An observable of the response events.
     */
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HttpXhrBackend, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HttpXhrBackend>;
}
