/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/http/testing/src/backend.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
import { Observable } from 'rxjs';
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
        { type: Injectable }
    ];
    return HttpClientTestingBackend;
})();
export { HttpClientTestingBackend };
if (false) {
    /**
     * List of pending requests which have not yet been expected.
     * @type {?}
     * @private
     */
    HttpClientTestingBackend.prototype.open;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUF5QixhQUFhLEVBQWMsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7O0FBY3RDOzs7Ozs7Ozs7Ozs7SUFBQSxNQUNhLHdCQUF3QjtRQURyQzs7OztZQUtVLFNBQUksR0FBa0IsRUFBRSxDQUFDO1FBK0huQyxDQUFDOzs7Ozs7UUExSEMsTUFBTSxDQUFDLEdBQXFCO1lBQzFCLE9BQU8sSUFBSSxVQUFVOzs7O1lBQUMsQ0FBQyxRQUF1QixFQUFFLEVBQUU7O3NCQUMxQyxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQUEsRUFBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBQyxFQUFrQixDQUFDLENBQUM7Z0JBQzVEOzs7Z0JBQU8sR0FBRyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixDQUFDLEVBQUM7WUFDSixDQUFDLEVBQUMsQ0FBQztRQUNMLENBQUM7Ozs7Ozs7UUFLTyxNQUFNLENBQUMsS0FBK0Q7WUFDNUUsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNOzs7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O3NCQUNsQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxPQUFPO2dCQUNsQyxPQUFPLGlCQUFpQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7YUFDL0M7aUJBQU07Z0JBQ0wsT0FBTyxzQkFBc0IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQzdDO1FBQ0gsQ0FBQzs7O2dCQW5JRixVQUFVOztJQW9JWCwrQkFBQztLQUFBO1NBbklZLHdCQUF3Qjs7Ozs7OztJQUluQyx3Q0FBaUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cFJlcXVlc3R9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwVGVzdGluZ0NvbnRyb2xsZXIsIFJlcXVlc3RNYXRjaH0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtUZXN0UmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcblxuXG4vKipcbiAqIEEgdGVzdGluZyBiYWNrZW5kIGZvciBgSHR0cENsaWVudGAgd2hpY2ggYm90aCBhY3RzIGFzIGFuIGBIdHRwQmFja2VuZGBcbiAqIGFuZCBhcyB0aGUgYEh0dHBUZXN0aW5nQ29udHJvbGxlcmAuXG4gKlxuICogYEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZGAgd29ya3MgYnkga2VlcGluZyBhIGxpc3Qgb2YgYWxsIG9wZW4gcmVxdWVzdHMuXG4gKiBBcyByZXF1ZXN0cyBjb21lIGluLCB0aGV5J3JlIGFkZGVkIHRvIHRoZSBsaXN0LiBVc2VycyBjYW4gYXNzZXJ0IHRoYXQgc3BlY2lmaWNcbiAqIHJlcXVlc3RzIHdlcmUgbWFkZSBhbmQgdGhlbiBmbHVzaCB0aGVtLiBJbiB0aGUgZW5kLCBhIHZlcmlmeSgpIG1ldGhvZCBhc3NlcnRzXG4gKiB0aGF0IG5vIHVuZXhwZWN0ZWQgcmVxdWVzdHMgd2VyZSBtYWRlLlxuICpcbiAqXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCwgSHR0cFRlc3RpbmdDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIExpc3Qgb2YgcGVuZGluZyByZXF1ZXN0cyB3aGljaCBoYXZlIG5vdCB5ZXQgYmVlbiBleHBlY3RlZC5cbiAgICovXG4gIHByaXZhdGUgb3BlbjogVGVzdFJlcXVlc3RbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgYW4gaW5jb21pbmcgcmVxdWVzdCBieSBxdWV1ZWluZyBpdCBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLlxuICAgKi9cbiAgaGFuZGxlKHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxhbnk+KSA9PiB7XG4gICAgICBjb25zdCB0ZXN0UmVxID0gbmV3IFRlc3RSZXF1ZXN0KHJlcSwgb2JzZXJ2ZXIpO1xuICAgICAgdGhpcy5vcGVuLnB1c2godGVzdFJlcSk7XG4gICAgICBvYnNlcnZlci5uZXh0KHt0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnR9IGFzIEh0dHBFdmVudDxhbnk+KTtcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHRlc3RSZXEuX2NhbmNlbGxlZCA9IHRydWU7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBzZWFyY2ggZm9yIHJlcXVlc3RzIGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMuXG4gICAqL1xuICBwcml2YXRlIF9tYXRjaChtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbikpOiBUZXN0UmVxdWVzdFtdIHtcbiAgICBpZiAodHlwZW9mIG1hdGNoID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXMub3Blbi5maWx0ZXIodGVzdFJlcSA9PiB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcyA9PT0gbWF0Y2gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1hdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcih0ZXN0UmVxID0+IG1hdGNoKHRlc3RSZXEucmVxdWVzdCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcihcbiAgICAgICAgICB0ZXN0UmVxID0+ICghbWF0Y2gubWV0aG9kIHx8IHRlc3RSZXEucmVxdWVzdC5tZXRob2QgPT09IG1hdGNoLm1ldGhvZC50b1VwcGVyQ2FzZSgpKSAmJlxuICAgICAgICAgICAgICAoIW1hdGNoLnVybCB8fCB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcyA9PT0gbWF0Y2gudXJsKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCBmb3IgcmVxdWVzdHMgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cywgYW5kIHJldHVybiBhbGwgdGhhdCBtYXRjaFxuICAgKiB3aXRob3V0IGFzc2VydGluZyBhbnl0aGluZyBhYm91dCB0aGUgbnVtYmVyIG9mIG1hdGNoZXMuXG4gICAqL1xuICBtYXRjaChtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbikpOiBUZXN0UmVxdWVzdFtdIHtcbiAgICBjb25zdCByZXN1bHRzID0gdGhpcy5fbWF0Y2gobWF0Y2gpO1xuICAgIHJlc3VsdHMuZm9yRWFjaChyZXN1bHQgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLm9wZW4uaW5kZXhPZihyZXN1bHQpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBhIHNpbmdsZSBvdXRzdGFuZGluZyByZXF1ZXN0IG1hdGNoZXMgdGhlIGdpdmVuIG1hdGNoZXIsIGFuZCByZXR1cm5cbiAgICogaXQuXG4gICAqXG4gICAqIFJlcXVlc3RzIHJldHVybmVkIHRocm91Z2ggdGhpcyBBUEkgd2lsbCBubyBsb25nZXIgYmUgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cyxcbiAgICogYW5kIHRodXMgd2lsbCBub3QgbWF0Y2ggdHdpY2UuXG4gICAqL1xuICBleHBlY3RPbmUobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6XG4gICAgICBUZXN0UmVxdWVzdCB7XG4gICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbiB8fCB0aGlzLmRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2gpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLm1hdGNoKG1hdGNoKTtcbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIG9uZSBtYXRjaGluZyByZXF1ZXN0IGZvciBjcml0ZXJpYSBcIiR7ZGVzY3JpcHRpb259XCIsIGZvdW5kICR7XG4gICAgICAgICAgbWF0Y2hlcy5sZW5ndGh9IHJlcXVlc3RzLmApO1xuICAgIH1cbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGxldCBtZXNzYWdlID0gYEV4cGVjdGVkIG9uZSBtYXRjaGluZyByZXF1ZXN0IGZvciBjcml0ZXJpYSBcIiR7ZGVzY3JpcHRpb259XCIsIGZvdW5kIG5vbmUuYDtcbiAgICAgIGlmICh0aGlzLm9wZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBTaG93IHRoZSBtZXRob2RzIGFuZCBVUkxzIG9mIG9wZW4gcmVxdWVzdHMgaW4gdGhlIGVycm9yLCBmb3IgY29udmVuaWVuY2UuXG4gICAgICAgIGNvbnN0IHJlcXVlc3RzID0gdGhpcy5vcGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAodGVzdFJlcSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gdGVzdFJlcS5yZXF1ZXN0LnVybFdpdGhQYXJhbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gdGVzdFJlcS5yZXF1ZXN0Lm1ldGhvZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kfSAke3VybH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgbWVzc2FnZSArPSBgIFJlcXVlc3RzIHJlY2VpdmVkIGFyZTogJHtyZXF1ZXN0c30uYDtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZXNbMF07XG4gIH1cblxuICAvKipcbiAgICogRXhwZWN0IHRoYXQgbm8gb3V0c3RhbmRpbmcgcmVxdWVzdHMgbWF0Y2ggdGhlIGdpdmVuIG1hdGNoZXIsIGFuZCB0aHJvdyBhbiBlcnJvclxuICAgKiBpZiBhbnkgZG8uXG4gICAqL1xuICBleHBlY3ROb25lKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSwgZGVzY3JpcHRpb24/OiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbiB8fCB0aGlzLmRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2gpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLm1hdGNoKG1hdGNoKTtcbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHplcm8gbWF0Y2hpbmcgcmVxdWVzdHMgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgJHtcbiAgICAgICAgICBtYXRjaGVzLmxlbmd0aH0uYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoYXQgdGhlcmUgYXJlIG5vIG91dHN0YW5kaW5nIHJlcXVlc3RzLlxuICAgKi9cbiAgdmVyaWZ5KG9wdHM6IHtpZ25vcmVDYW5jZWxsZWQ/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgbGV0IG9wZW4gPSB0aGlzLm9wZW47XG4gICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHNvbWUgcmVxdWVzdHMgbWF5IGJlIGNhbmNlbGxlZCwgYW5kIHRoaXMgaXMgZXhwZWN0ZWQuXG4gICAgLy8gVGhlIHVzZXIgY2FuIGFzayB0byBpZ25vcmUgb3BlbiByZXF1ZXN0cyB3aGljaCBoYXZlIGJlZW4gY2FuY2VsbGVkLlxuICAgIGlmIChvcHRzLmlnbm9yZUNhbmNlbGxlZCkge1xuICAgICAgb3BlbiA9IG9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gIXRlc3RSZXEuY2FuY2VsbGVkKTtcbiAgICB9XG4gICAgaWYgKG9wZW4ubGVuZ3RoID4gMCkge1xuICAgICAgLy8gU2hvdyB0aGUgbWV0aG9kcyBhbmQgVVJMcyBvZiBvcGVuIHJlcXVlc3RzIGluIHRoZSBlcnJvciwgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgcmVxdWVzdHMgPSBvcGVuLm1hcCh0ZXN0UmVxID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gdGVzdFJlcS5yZXF1ZXN0LnVybFdpdGhQYXJhbXMuc3BsaXQoJz8nKVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gdGVzdFJlcS5yZXF1ZXN0Lm1ldGhvZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZH0gJHt1cmx9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgbm8gb3BlbiByZXF1ZXN0cywgZm91bmQgJHtvcGVuLmxlbmd0aH06ICR7cmVxdWVzdHN9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZXNjcmlwdGlvbkZyb21NYXRjaGVyKG1hdGNoZXI6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbikpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBgTWF0Y2ggVVJMOiAke21hdGNoZXJ9YDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtYXRjaGVyID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgbWV0aG9kID0gbWF0Y2hlci5tZXRob2QgfHwgJyhhbnkpJztcbiAgICAgIGNvbnN0IHVybCA9IG1hdGNoZXIudXJsIHx8ICcoYW55KSc7XG4gICAgICByZXR1cm4gYE1hdGNoIG1ldGhvZDogJHttZXRob2R9LCBVUkw6ICR7dXJsfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgTWF0Y2ggYnkgZnVuY3Rpb246ICR7bWF0Y2hlci5uYW1lfWA7XG4gICAgfVxuICB9XG59XG4iXX0=