/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/http/testing/src/backend.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TestRequest } from './request';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A testing backend for `HttpClient` which both acts as an `HttpBackend`
 * and as the `HttpTestingController`.
 *
 * `HttpClientTestingBackend` works by keeping a list of all open requests.
 * As requests come in, they're added to the list. Users can assert that specific
 * requests were made and then flush them. In the end, a verify() method asserts
 * that no unexpected requests were made.
 *
 *
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
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        (observer) => {
            /** @type {?} */
            const testReq = new TestRequest(req, observer);
            this.open.push(testReq);
            observer.next((/** @type {?} */ ({ type: HttpEventType.Sent })));
            return (/**
             * @return {?}
             */
            () => { testReq._cancelled = true; });
        }));
    }
    /**
     * Helper function to search for requests in the list of open requests.
     * @private
     * @param {?} match
     * @return {?}
     */
    _match(match) {
        if (typeof match === 'string') {
            return this.open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => testReq.request.urlWithParams === match));
        }
        else if (typeof match === 'function') {
            return this.open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => match(testReq.request)));
        }
        else {
            return this.open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => (!match.method || testReq.request.method === match.method.toUpperCase()) &&
                (!match.url || testReq.request.urlWithParams === match.url)));
        }
    }
    /**
     * Search for requests in the list of open requests, and return all that match
     * without asserting anything about the number of matches.
     * @param {?} match
     * @return {?}
     */
    match(match) {
        /** @type {?} */
        const results = this._match(match);
        results.forEach((/**
         * @param {?} result
         * @return {?}
         */
        result => {
            /** @type {?} */
            const index = this.open.indexOf(result);
            if (index !== -1) {
                this.open.splice(index, 1);
            }
        }));
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
        /** @type {?} */
        const matches = this.match(match);
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
        /** @type {?} */
        const matches = this.match(match);
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
        /** @type {?} */
        let open = this.open;
        // It's possible that some requests may be cancelled, and this is expected.
        // The user can ask to ignore open requests which have been cancelled.
        if (opts.ignoreCancelled) {
            open = open.filter((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => !testReq.cancelled));
        }
        if (open.length > 0) {
            // Show the methods and URLs of open requests in the error, for convenience.
            /** @type {?} */
            const requests = open.map((/**
             * @param {?} testReq
             * @return {?}
             */
            testReq => {
                /** @type {?} */
                const url = testReq.request.urlWithParams.split('?')[0];
                /** @type {?} */
                const method = testReq.request.method;
                return `${method} ${url}`;
            }))
                .join(', ');
            throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
        }
    }
    /**
     * @private
     * @param {?} matcher
     * @return {?}
     */
    descriptionFromMatcher(matcher) {
        if (typeof matcher === 'string') {
            return `Match URL: ${matcher}`;
        }
        else if (typeof matcher === 'object') {
            /** @type {?} */
            const method = matcher.method || '(any)';
            /** @type {?} */
            const url = matcher.url || '(any)';
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
/** @nocollapse */ HttpClientTestingBackend.ɵfac = function HttpClientTestingBackend_Factory(t) { return new (t || HttpClientTestingBackend)(); };
/** @nocollapse */ HttpClientTestingBackend.ɵprov = i0.ɵɵdefineInjectable({ token: HttpClientTestingBackend, factory: function (t) { return HttpClientTestingBackend.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpClientTestingBackend, [{
        type: Injectable
    }], null, null); })();
if (false) {
    /**
     * List of pending requests which have not yet been expected.
     * @type {?}
     * @private
     */
    HttpClientTestingBackend.prototype.open;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFRQSxPQUFPLEVBQXlCLGFBQWEsRUFBYyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hGLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLFVBQVUsRUFBVyxNQUFNLE1BQU0sQ0FBQztBQUcxQyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWV0QyxNQUFNLE9BQU8sd0JBQXdCO0lBRHJDOzs7O1FBS1UsU0FBSSxHQUFrQixFQUFFLENBQUM7S0FpSGxDOzs7Ozs7SUE1R0MsTUFBTSxDQUFDLEdBQXFCO1FBQzFCLE9BQU8sSUFBSSxVQUFVOzs7O1FBQUMsQ0FBQyxRQUF1QixFQUFFLEVBQUU7O2tCQUMxQyxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQztZQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFBLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBa0IsQ0FBQyxDQUFDO1lBQzlEOzs7WUFBTyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQztRQUM5QyxDQUFDLEVBQUMsQ0FBQztJQUNMLENBQUM7Ozs7Ozs7SUFLTyxNQUFNLENBQUMsS0FBK0Q7UUFDNUUsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDN0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07Ozs7WUFBQyxPQUFPLENBQUMsRUFBRSxD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QyxPQUFPLENBQUMsRUFBRTs7c0JBQ1AsR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O3NCQUNqRCxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNO2dCQUNyQyxPQUFPLEdBQUcsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzVCLENBQUMsRUFBQztpQkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUMsQ0FBQztTQUNqRjtJQUNILENBQUM7Ozs7OztJQUVPLHNCQUFzQixDQUFDLE9BQ29DO1FBQ2pFLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQy9CLE9BQU8sY0FBYyxPQUFPLEVBQUUsQ0FBQztTQUNoQzthQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFOztrQkFDaEMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTzs7a0JBQ2xDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLE9BQU87WUFDbEMsT0FBTyxpQkFBaUIsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQy9DO2FBQU07WUFDTCxPQUFPLHNCQUFzQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDN0M7SUFDSCxDQUFDOzs7WUFySEYsVUFBVTs7Z0dBQ0Usd0JBQXdCO2dFQUF4Qix3QkFBd0IsaUNBQXhCLHdCQUF3QjtrREFBeEIsd0JBQXdCO2NBRHBDLFVBQVU7Ozs7Ozs7O0lBS1Qsd0NBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXF1ZXN0fSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cFRlc3RpbmdDb250cm9sbGVyLCBSZXF1ZXN0TWF0Y2h9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7VGVzdFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5cblxuLyoqXG4gKiBBIHRlc3RpbmcgYmFja2VuZCBmb3IgYEh0dHBDbGllbnRgIHdoaWNoIGJvdGggYWN0cyBhcyBhbiBgSHR0cEJhY2tlbmRgXG4gKiBhbmQgYXMgdGhlIGBIdHRwVGVzdGluZ0NvbnRyb2xsZXJgLlxuICpcbiAqIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIHdvcmtzIGJ5IGtlZXBpbmcgYSBsaXN0IG9mIGFsbCBvcGVuIHJlcXVlc3RzLlxuICogQXMgcmVxdWVzdHMgY29tZSBpbiwgdGhleSdyZSBhZGRlZCB0byB0aGUgbGlzdC4gVXNlcnMgY2FuIGFzc2VydCB0aGF0IHNwZWNpZmljXG4gKiByZXF1ZXN0cyB3ZXJlIG1hZGUgYW5kIHRoZW4gZmx1c2ggdGhlbS4gSW4gdGhlIGVuZCwgYSB2ZXJpZnkoKSBtZXRob2QgYXNzZXJ0c1xuICogdGhhdCBubyB1bmV4cGVjdGVkIHJlcXVlc3RzIHdlcmUgbWFkZS5cbiAqXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQsIEh0dHBUZXN0aW5nQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIHBlbmRpbmcgcmVxdWVzdHMgd2hpY2ggaGF2ZSBub3QgeWV0IGJlZW4gZXhwZWN0ZWQuXG4gICAqL1xuICBwcml2YXRlIG9wZW46IFRlc3RSZXF1ZXN0W10gPSBbXTtcblxuICAvKipcbiAgICogSGFuZGxlIGFuIGluY29taW5nIHJlcXVlc3QgYnkgcXVldWVpbmcgaXQgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8YW55PikgPT4ge1xuICAgICAgY29uc3QgdGVzdFJlcSA9IG5ldyBUZXN0UmVxdWVzdChyZXEsIG9ic2VydmVyKTtcbiAgICAgIHRoaXMub3Blbi5wdXNoKHRlc3RSZXEpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7IHR5cGU6IEh0dHBFdmVudFR5cGUuU2VudCB9IGFzIEh0dHBFdmVudDxhbnk+KTtcbiAgICAgIHJldHVybiAoKSA9PiB7IHRlc3RSZXEuX2NhbmNlbGxlZCA9IHRydWU7IH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIHNlYXJjaCBmb3IgcmVxdWVzdHMgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIHByaXZhdGUgX21hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcih0ZXN0UmVxID0+IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gbWF0Y2godGVzdFJlcS5yZXF1ZXN0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKFxuICAgICAgICAgIHRlc3RSZXEgPT4gKCFtYXRjaC5tZXRob2QgfHwgdGVzdFJlcS5yZXF1ZXN0Lm1ldGhvZCA9PT0gbWF0Y2gubWV0aG9kLnRvVXBwZXJDYXNlKCkpICYmXG4gICAgICAgICAgICAgICghbWF0Y2gudXJsIHx8IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaC51cmwpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIGZvciByZXF1ZXN0cyBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLCBhbmQgcmV0dXJuIGFsbCB0aGF0IG1hdGNoXG4gICAqIHdpdGhvdXQgYXNzZXJ0aW5nIGFueXRoaW5nIGFib3V0IHRoZSBudW1iZXIgb2YgbWF0Y2hlcy5cbiAgICovXG4gIG1hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLl9tYXRjaChtYXRjaCk7XG4gICAgcmVzdWx0cy5mb3JFYWNoKHJlc3VsdCA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMub3Blbi5pbmRleE9mKHJlc3VsdCk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3Blbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IGEgc2luZ2xlIG91dHN0YW5kaW5nIHJlcXVlc3QgbWF0Y2hlcyB0aGUgZ2l2ZW4gbWF0Y2hlciwgYW5kIHJldHVyblxuICAgKiBpdC5cbiAgICpcbiAgICogUmVxdWVzdHMgcmV0dXJuZWQgdGhyb3VnaCB0aGlzIEFQSSB3aWxsIG5vIGxvbmdlciBiZSBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLFxuICAgKiBhbmQgdGh1cyB3aWxsIG5vdCBtYXRjaCB0d2ljZS5cbiAgICovXG4gIGV4cGVjdE9uZShtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTpcbiAgICAgIFRlc3RSZXF1ZXN0IHtcbiAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uIHx8IHRoaXMuZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaCk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMubWF0Y2gobWF0Y2gpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgJHttYXRjaGVzLmxlbmd0aH0gcmVxdWVzdHMuYCk7XG4gICAgfVxuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBvbmUgbWF0Y2hpbmcgcmVxdWVzdCBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCBub25lLmApO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBubyBvdXRzdGFuZGluZyByZXF1ZXN0cyBtYXRjaCB0aGUgZ2l2ZW4gbWF0Y2hlciwgYW5kIHRocm93IGFuIGVycm9yXG4gICAqIGlmIGFueSBkby5cbiAgICovXG4gIGV4cGVjdE5vbmUobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6XG4gICAgICB2b2lkIHtcbiAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uIHx8IHRoaXMuZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaCk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMubWF0Y2gobWF0Y2gpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXhwZWN0ZWQgemVybyBtYXRjaGluZyByZXF1ZXN0cyBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCAke21hdGNoZXMubGVuZ3RofS5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgdGhhdCB0aGVyZSBhcmUgbm8gb3V0c3RhbmRpbmcgcmVxdWVzdHMuXG4gICAqL1xuICB2ZXJpZnkob3B0czoge2lnbm9yZUNhbmNlbGxlZD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBsZXQgb3BlbiA9IHRoaXMub3BlbjtcbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgc29tZSByZXF1ZXN0cyBtYXkgYmUgY2FuY2VsbGVkLCBhbmQgdGhpcyBpcyBleHBlY3RlZC5cbiAgICAvLyBUaGUgdXNlciBjYW4gYXNrIHRvIGlnbm9yZSBvcGVuIHJlcXVlc3RzIHdoaWNoIGhhdmUgYmVlbiBjYW5jZWxsZWQuXG4gICAgaWYgKG9wdHMuaWdub3JlQ2FuY2VsbGVkKSB7XG4gICAgICBvcGVuID0gb3Blbi5maWx0ZXIodGVzdFJlcSA9PiAhdGVzdFJlcS5jYW5jZWxsZWQpO1xuICAgIH1cbiAgICBpZiAob3Blbi5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBTaG93IHRoZSBtZXRob2RzIGFuZCBVUkxzIG9mIG9wZW4gcmVxdWVzdHMgaW4gdGhlIGVycm9yLCBmb3IgY29udmVuaWVuY2UuXG4gICAgICBjb25zdCByZXF1ZXN0cyA9IG9wZW4ubWFwKHRlc3RSZXEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcy5zcGxpdCgnPycpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSB0ZXN0UmVxLnJlcXVlc3QubWV0aG9kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kfSAke3VybH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBubyBvcGVuIHJlcXVlc3RzLCBmb3VuZCAke29wZW4ubGVuZ3RofTogJHtyZXF1ZXN0c31gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2hlcjogc3RyaW5nfFJlcXVlc3RNYXRjaHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBtYXRjaGVyID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGBNYXRjaCBVUkw6ICR7bWF0Y2hlcn1gO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1hdGNoZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCBtZXRob2QgPSBtYXRjaGVyLm1ldGhvZCB8fCAnKGFueSknO1xuICAgICAgY29uc3QgdXJsID0gbWF0Y2hlci51cmwgfHwgJyhhbnkpJztcbiAgICAgIHJldHVybiBgTWF0Y2ggbWV0aG9kOiAke21ldGhvZH0sIFVSTDogJHt1cmx9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBNYXRjaCBieSBmdW5jdGlvbjogJHttYXRjaGVyLm5hbWV9YDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==