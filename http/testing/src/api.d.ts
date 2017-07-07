/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpRequest } from '@angular/common/http';
import { TestRequest } from './request';
/**
 * Defines a matcher for requests based on URL, method, or both.
 *
 * @experimental
 */
export interface RequestMatch {
    method?: string;
    url?: string;
}
/**
 * Controller to be injected into tests, that allows for mocking and flushing
 * of requests.
 *
 * @experimental
 */
export declare abstract class HttpTestingController {
    /**
     * Search for requests that match the given parameter, without any expectations.
     */
    abstract match(match: string | RequestMatch | ((req: HttpRequest<any>) => boolean)): TestRequest[];
    abstract expectOne(url: string): TestRequest;
    abstract expectOne(params: RequestMatch): TestRequest;
    abstract expectOne(matchFn: ((req: HttpRequest<any>) => boolean)): TestRequest;
    abstract expectOne(match: string | RequestMatch | ((req: HttpRequest<any>) => boolean)): TestRequest;
    abstract expectNone(url: string): void;
    abstract expectNone(params: RequestMatch): void;
    abstract expectNone(matchFn: ((req: HttpRequest<any>) => boolean)): void;
    abstract expectNone(match: string | RequestMatch | ((req: HttpRequest<any>) => boolean)): void;
    abstract verify(opts?: {
        ignoreCancelled?: boolean;
    }): void;
}
