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
let HttpClientTestingBackend = /** @class */ (() => {
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
    class HttpClientTestingBackend {
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
                () => {
                    testReq._cancelled = true;
                });
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
                /** @type {?} */
                let message = `Expected one matching request for criteria "${description}", found none.`;
                if (this.open.length > 0) {
                    // Show the methods and URLs of open requests in the error, for convenience.
                    /** @type {?} */
                    const requests = this.open
                        .map((/**
                     * @param {?} testReq
                     * @return {?}
                     */
                    testReq => {
                        /** @type {?} */
                        const url = testReq.request.urlWithParams;
                        /** @type {?} */
                        const method = testReq.request.method;
                        return `${method} ${url}`;
                    }))
                        .join(', ');
                    message += ` Requests received are: ${requests}.`;
                }
                throw new Error(message);
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
    /** @nocollapse */ HttpClientTestingBackend.ɵprov = i0.ɵɵdefineInjectable({ token: HttpClientTestingBackend, factory: HttpClientTestingBackend.ɵfac });
    return HttpClientTestingBackend;
})();
export { HttpClientTestingBackend };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFRQSxPQUFPLEVBQXlCLGFBQWEsRUFBYyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hGLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLFVBQVUsRUFBVyxNQUFNLE1BQU0sQ0FBQztBQUcxQyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWN0Qzs7Ozs7Ozs7Ozs7O0lBQUEsTUFDYSx3QkFBd0I7UUFEckM7Ozs7WUFLVSxTQUFJLEdBQWtCLEVBQUUsQ0FBQztTQStIbEM7Ozs7OztRQTFIQyxNQUFNLENBQUMsR0FBcUI7WUFDMUIsT0FBTyxJQUFJLFVBQVU7Ozs7WUFBQyxDQUFDLFFBQXVCLEVBQUUsRUFBRTs7c0JBQzFDLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBQSxFQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFDLEVBQWtCLENBQUMsQ0FBQztnQkFDNUQ7OztnQkFBTyxHQUFHLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQzVCLENBQUMsRUFBQztZQUNKLENBQUMsRUFBQyxDQUFDO1FBQ0wsQ0FBQzs7Ozs7OztRQUtPLE1BQU0sQ0FBQyxLQUErRDtZQUM1RSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07Ozs7Z0JB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Q2xDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLE9BQU87Z0JBQ2xDLE9BQU8saUJBQWlCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQzthQUMvQztpQkFBTTtnQkFDTCxPQUFPLHNCQUFzQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDN0M7UUFDSCxDQUFDOzs7Z0JBbklGLFVBQVU7O3VIQUNFLHdCQUF3Qjt1RkFBeEIsd0JBQXdCLFdBQXhCLHdCQUF3QjttQ0E1QnJDO0tBK0pDO1NBbklZLHdCQUF3QjtrREFBeEIsd0JBQXdCO2NBRHBDLFVBQVU7Ozs7Ozs7O0lBS1Qsd0NBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXF1ZXN0fSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cFRlc3RpbmdDb250cm9sbGVyLCBSZXF1ZXN0TWF0Y2h9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7VGVzdFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5cblxuLyoqXG4gKiBBIHRlc3RpbmcgYmFja2VuZCBmb3IgYEh0dHBDbGllbnRgIHdoaWNoIGJvdGggYWN0cyBhcyBhbiBgSHR0cEJhY2tlbmRgXG4gKiBhbmQgYXMgdGhlIGBIdHRwVGVzdGluZ0NvbnRyb2xsZXJgLlxuICpcbiAqIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIHdvcmtzIGJ5IGtlZXBpbmcgYSBsaXN0IG9mIGFsbCBvcGVuIHJlcXVlc3RzLlxuICogQXMgcmVxdWVzdHMgY29tZSBpbiwgdGhleSdyZSBhZGRlZCB0byB0aGUgbGlzdC4gVXNlcnMgY2FuIGFzc2VydCB0aGF0IHNwZWNpZmljXG4gKiByZXF1ZXN0cyB3ZXJlIG1hZGUgYW5kIHRoZW4gZmx1c2ggdGhlbS4gSW4gdGhlIGVuZCwgYSB2ZXJpZnkoKSBtZXRob2QgYXNzZXJ0c1xuICogdGhhdCBubyB1bmV4cGVjdGVkIHJlcXVlc3RzIHdlcmUgbWFkZS5cbiAqXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQsIEh0dHBUZXN0aW5nQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIHBlbmRpbmcgcmVxdWVzdHMgd2hpY2ggaGF2ZSBub3QgeWV0IGJlZW4gZXhwZWN0ZWQuXG4gICAqL1xuICBwcml2YXRlIG9wZW46IFRlc3RSZXF1ZXN0W10gPSBbXTtcblxuICAvKipcbiAgICogSGFuZGxlIGFuIGluY29taW5nIHJlcXVlc3QgYnkgcXVldWVpbmcgaXQgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8YW55PikgPT4ge1xuICAgICAgY29uc3QgdGVzdFJlcSA9IG5ldyBUZXN0UmVxdWVzdChyZXEsIG9ic2VydmVyKTtcbiAgICAgIHRoaXMub3Blbi5wdXNoKHRlc3RSZXEpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSBhcyBIdHRwRXZlbnQ8YW55Pik7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB0ZXN0UmVxLl9jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gc2VhcmNoIGZvciByZXF1ZXN0cyBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLlxuICAgKi9cbiAgcHJpdmF0ZSBfbWF0Y2gobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pKTogVGVzdFJlcXVlc3RbXSB7XG4gICAgaWYgKHR5cGVvZiBtYXRjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gdGVzdFJlcS5yZXF1ZXN0LnVybFdpdGhQYXJhbXMgPT09IG1hdGNoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtYXRjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMub3Blbi5maWx0ZXIodGVzdFJlcSA9PiBtYXRjaCh0ZXN0UmVxLnJlcXVlc3QpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMub3Blbi5maWx0ZXIoXG4gICAgICAgICAgdGVzdFJlcSA9PiAoIW1hdGNoLm1ldGhvZCB8fCB0ZXN0UmVxLnJlcXVlc3QubWV0aG9kID09PSBtYXRjaC5tZXRob2QudG9VcHBlckNhc2UoKSkgJiZcbiAgICAgICAgICAgICAgKCFtYXRjaC51cmwgfHwgdGVzdFJlcS5yZXF1ZXN0LnVybFdpdGhQYXJhbXMgPT09IG1hdGNoLnVybCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggZm9yIHJlcXVlc3RzIGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMsIGFuZCByZXR1cm4gYWxsIHRoYXQgbWF0Y2hcbiAgICogd2l0aG91dCBhc3NlcnRpbmcgYW55dGhpbmcgYWJvdXQgdGhlIG51bWJlciBvZiBtYXRjaGVzLlxuICAgKi9cbiAgbWF0Y2gobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pKTogVGVzdFJlcXVlc3RbXSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IHRoaXMuX21hdGNoKG1hdGNoKTtcbiAgICByZXN1bHRzLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5vcGVuLmluZGV4T2YocmVzdWx0KTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKipcbiAgICogRXhwZWN0IHRoYXQgYSBzaW5nbGUgb3V0c3RhbmRpbmcgcmVxdWVzdCBtYXRjaGVzIHRoZSBnaXZlbiBtYXRjaGVyLCBhbmQgcmV0dXJuXG4gICAqIGl0LlxuICAgKlxuICAgKiBSZXF1ZXN0cyByZXR1cm5lZCB0aHJvdWdoIHRoaXMgQVBJIHdpbGwgbm8gbG9uZ2VyIGJlIGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMsXG4gICAqIGFuZCB0aHVzIHdpbGwgbm90IG1hdGNoIHR3aWNlLlxuICAgKi9cbiAgZXhwZWN0T25lKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSwgZGVzY3JpcHRpb24/OiBzdHJpbmcpOlxuICAgICAgVGVzdFJlcXVlc3Qge1xuICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24gfHwgdGhpcy5kZXNjcmlwdGlvbkZyb21NYXRjaGVyKG1hdGNoKTtcbiAgICBjb25zdCBtYXRjaGVzID0gdGhpcy5tYXRjaChtYXRjaCk7XG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBvbmUgbWF0Y2hpbmcgcmVxdWVzdCBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCAke1xuICAgICAgICAgIG1hdGNoZXMubGVuZ3RofSByZXF1ZXN0cy5gKTtcbiAgICB9XG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9IGBFeHBlY3RlZCBvbmUgbWF0Y2hpbmcgcmVxdWVzdCBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCBub25lLmA7XG4gICAgICBpZiAodGhpcy5vcGVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgbWV0aG9kcyBhbmQgVVJMcyBvZiBvcGVuIHJlcXVlc3RzIGluIHRoZSBlcnJvciwgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgICBjb25zdCByZXF1ZXN0cyA9IHRoaXMub3BlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHRlc3RSZXEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IHRlc3RSZXEucmVxdWVzdC5tZXRob2Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZH0gJHt1cmx9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgIG1lc3NhZ2UgKz0gYCBSZXF1ZXN0cyByZWNlaXZlZCBhcmU6ICR7cmVxdWVzdHN9LmA7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVzWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IG5vIG91dHN0YW5kaW5nIHJlcXVlc3RzIG1hdGNoIHRoZSBnaXZlbiBtYXRjaGVyLCBhbmQgdGhyb3cgYW4gZXJyb3JcbiAgICogaWYgYW55IGRvLlxuICAgKi9cbiAgZXhwZWN0Tm9uZShtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTpcbiAgICAgIHZvaWQge1xuICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24gfHwgdGhpcy5kZXNjcmlwdGlvbkZyb21NYXRjaGVyKG1hdGNoKTtcbiAgICBjb25zdCBtYXRjaGVzID0gdGhpcy5tYXRjaChtYXRjaCk7XG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB6ZXJvIG1hdGNoaW5nIHJlcXVlc3RzIGZvciBjcml0ZXJpYSBcIiR7ZGVzY3JpcHRpb259XCIsIGZvdW5kICR7XG4gICAgICAgICAgbWF0Y2hlcy5sZW5ndGh9LmApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSB0aGF0IHRoZXJlIGFyZSBubyBvdXRzdGFuZGluZyByZXF1ZXN0cy5cbiAgICovXG4gIHZlcmlmeShvcHRzOiB7aWdub3JlQ2FuY2VsbGVkPzogYm9vbGVhbn0gPSB7fSk6IHZvaWQge1xuICAgIGxldCBvcGVuID0gdGhpcy5vcGVuO1xuICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCBzb21lIHJlcXVlc3RzIG1heSBiZSBjYW5jZWxsZWQsIGFuZCB0aGlzIGlzIGV4cGVjdGVkLlxuICAgIC8vIFRoZSB1c2VyIGNhbiBhc2sgdG8gaWdub3JlIG9wZW4gcmVxdWVzdHMgd2hpY2ggaGF2ZSBiZWVuIGNhbmNlbGxlZC5cbiAgICBpZiAob3B0cy5pZ25vcmVDYW5jZWxsZWQpIHtcbiAgICAgIG9wZW4gPSBvcGVuLmZpbHRlcih0ZXN0UmVxID0+ICF0ZXN0UmVxLmNhbmNlbGxlZCk7XG4gICAgfVxuICAgIGlmIChvcGVuLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFNob3cgdGhlIG1ldGhvZHMgYW5kIFVSTHMgb2Ygb3BlbiByZXF1ZXN0cyBpbiB0aGUgZXJyb3IsIGZvciBjb252ZW5pZW5jZS5cbiAgICAgIGNvbnN0IHJlcXVlc3RzID0gb3Blbi5tYXAodGVzdFJlcSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zLnNwbGl0KCc/JylbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IHRlc3RSZXEucmVxdWVzdC5tZXRob2Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHttZXRob2R9ICR7dXJsfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIG5vIG9wZW4gcmVxdWVzdHMsIGZvdW5kICR7b3Blbi5sZW5ndGh9OiAke3JlcXVlc3RzfWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaGVyOiBzdHJpbmd8UmVxdWVzdE1hdGNofFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIG1hdGNoZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gYE1hdGNoIFVSTDogJHttYXRjaGVyfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IG1hdGNoZXIubWV0aG9kIHx8ICcoYW55KSc7XG4gICAgICBjb25zdCB1cmwgPSBtYXRjaGVyLnVybCB8fCAnKGFueSknO1xuICAgICAgcmV0dXJuIGBNYXRjaCBtZXRob2Q6ICR7bWV0aG9kfSwgVVJMOiAke3VybH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYE1hdGNoIGJ5IGZ1bmN0aW9uOiAke21hdGNoZXIubmFtZX1gO1xuICAgIH1cbiAgfVxufVxuIl19