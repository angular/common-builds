/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TestRequest } from './request';
/**
 * A testing backend for `HttpClient` which both acts as an `HttpBackend`
 * and as the `HttpTestingController`.
 *
 * `HttpClientTestingBackend` works by keeping a list of all open requests.
 * As requests come in, they're added to the list. Users can assert that specific
 * requests were made and then flush them. In the end, a verify() method asserts
 * that no unexpected requests were made.
 *
 * \@stable
 */
export class HttpClientTestingBackend {
    constructor() {
        /**
         * List of pending requests which have not yet been expected.
         */
        this.open = [];
    }
    /**
     * Handle an incoming request by queueing it in the list of open requests.
     * @param {?} req
     * @return {?}
     */
    handle(req) {
        return new Observable((observer) => {
            const /** @type {?} */ testReq = new TestRequest(req, observer);
            this.open.push(testReq);
            observer.next(/** @type {?} */ ({ type: HttpEventType.Sent }));
            return () => { testReq._cancelled = true; };
        });
    }
    /**
     * Helper function to search for requests in the list of open requests.
     * @param {?} match
     * @return {?}
     */
    _match(match) {
        if (typeof match === 'string') {
            return this.open.filter(testReq => testReq.request.urlWithParams === match);
        }
        else if (typeof match === 'function') {
            return this.open.filter(testReq => match(testReq.request));
        }
        else {
            return this.open.filter(testReq => (!match.method || testReq.request.method === match.method.toUpperCase()) &&
                (!match.url || testReq.request.urlWithParams === match.url));
        }
    }
    /**
     * Search for requests in the list of open requests, and return all that match
     * without asserting anything about the number of matches.
     * @param {?} match
     * @return {?}
     */
    match(match) {
        const /** @type {?} */ results = this._match(match);
        results.forEach(result => {
            const /** @type {?} */ index = this.open.indexOf(result);
            if (index !== -1) {
                this.open.splice(index, 1);
            }
        });
        return results;
    }
    /**
     * Expect that a single outstanding request matches the given matcher, and return
     * it.
     *
     * Requests returned through this API will no longer be in the list of open requests,
     * and thus will not match twice.
     * @param {?} match
     * @param {?=} description
     * @return {?}
     */
    expectOne(match, description) {
        description = description || this.descriptionFromMatcher(match);
        const /** @type {?} */ matches = this.match(match);
        if (matches.length > 1) {
            throw new Error(`Expected one matching request for criteria "${description}", found ${matches.length} requests.`);
        }
        if (matches.length === 0) {
            throw new Error(`Expected one matching request for criteria "${description}", found none.`);
        }
        return matches[0];
    }
    /**
     * Expect that no outstanding requests match the given matcher, and throw an error
     * if any do.
     * @param {?} match
     * @param {?=} description
     * @return {?}
     */
    expectNone(match, description) {
        description = description || this.descriptionFromMatcher(match);
        const /** @type {?} */ matches = this.match(match);
        if (matches.length > 0) {
            throw new Error(`Expected zero matching requests for criteria "${description}", found ${matches.length}.`);
        }
    }
    /**
     * Validate that there are no outstanding requests.
     * @param {?=} opts
     * @return {?}
     */
    verify(opts = {}) {
        let /** @type {?} */ open = this.open;
        // It's possible that some requests may be cancelled, and this is expected.
        // The user can ask to ignore open requests which have been cancelled.
        if (opts.ignoreCancelled) {
            open = open.filter(testReq => !testReq.cancelled);
        }
        if (open.length > 0) {
            // Show the methods and URLs of open requests in the error, for convenience.
            const /** @type {?} */ requests = open.map(testReq => {
                const /** @type {?} */ url = testReq.request.urlWithParams.split('?')[0];
                const /** @type {?} */ method = testReq.request.method;
                return `${method} ${url}`;
            })
                .join(', ');
            throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
        }
    }
    /**
     * @param {?} matcher
     * @return {?}
     */
    descriptionFromMatcher(matcher) {
        if (typeof matcher === 'string') {
            return `Match URL: ${matcher}`;
        }
        else if (typeof matcher === 'object') {
            const /** @type {?} */ method = matcher.method || '(any)';
            const /** @type {?} */ url = matcher.url || '(any)';
            return `Match method: ${method}, URL: ${url}`;
        }
        else {
            return `Match by function: ${matcher.name}`;
        }
    }
}
HttpClientTestingBackend.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpClientTestingBackend.ctorParameters = () => [];
function HttpClientTestingBackend_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    HttpClientTestingBackend.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    HttpClientTestingBackend.ctorParameters;
    /**
     * List of pending requests which have not yet been expected.
     * @type {?}
     */
    HttpClientTestingBackend.prototype.open;
}
//# sourceMappingURL=backend.js.map