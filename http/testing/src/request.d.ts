/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observer } from 'rxjs/Observer';
/**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 * @experimental
 */
export declare class TestRequest {
    request: HttpRequest<any>;
    private observer;
    /**
     * Whether the request was cancelled after it was sent.
     */
    readonly cancelled: boolean;
    constructor(request: HttpRequest<any>, observer: Observer<HttpEvent<any>>);
    flush(body: ArrayBuffer | Blob | string | number | Object | (string | number | Object | null)[] | null, opts?: {
        headers?: HttpHeaders | {
            [name: string]: string | string[];
        };
        status?: number;
        statusText?: string;
    }): void;
    error(error: ErrorEvent, opts?: {
        headers?: HttpHeaders | {
            [name: string]: string | string[];
        };
        status?: number;
        statusText?: string;
    }): void;
    event(event: HttpEvent<any>): void;
}
