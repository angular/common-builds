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
var HttpClientTestingBackend = /** @class */ (function () {
    function HttpClientTestingBackend() {
        /**
           * List of pending requests which have not yet been expected.
           */
        this.open = [];
    }
    /**
     * Handle an incoming request by queueing it in the list of open requests.
     */
    /**
       * Handle an incoming request by queueing it in the list of open requests.
       */
    HttpClientTestingBackend.prototype.handle = /**
       * Handle an incoming request by queueing it in the list of open requests.
       */
    function (req) {
        var _this = this;
        return new Observable(function (observer) {
            var testReq = new TestRequest(req, observer);
            _this.open.push(testReq);
            observer.next({ type: HttpEventType.Sent });
            return function () { testReq._cancelled = true; };
        });
    };
    /**
     * Helper function to search for requests in the list of open requests.
     */
    /**
       * Helper function to search for requests in the list of open requests.
       */
    HttpClientTestingBackend.prototype._match = /**
       * Helper function to search for requests in the list of open requests.
       */
    function (match) {
        if (typeof match === 'string') {
            return this.open.filter(function (testReq) { return testReq.request.urlWithParams === match; });
        }
        else if (typeof match === 'function') {
            return this.open.filter(function (testReq) { return match(testReq.request); });
        }
        else {
            return this.open.filter(function (testReq) {
                return (!match.method || testReq.request.method === match.method.toUpperCase()) &&
                    (!match.url || testReq.request.urlWithParams === match.url);
            });
        }
    };
    /**
     * Search for requests in the list of open requests, and return all that match
     * without asserting anything about the number of matches.
     */
    /**
       * Search for requests in the list of open requests, and return all that match
       * without asserting anything about the number of matches.
       */
    HttpClientTestingBackend.prototype.match = /**
       * Search for requests in the list of open requests, and return all that match
       * without asserting anything about the number of matches.
       */
    function (match) {
        var _this = this;
        var results = this._match(match);
        results.forEach(function (result) {
            var index = _this.open.indexOf(result);
            if (index !== -1) {
                _this.open.splice(index, 1);
            }
        });
        return results;
    };
    /**
     * Expect that a single outstanding request matches the given matcher, and return
     * it.
     *
     * Requests returned through this API will no longer be in the list of open requests,
     * and thus will not match twice.
     */
    /**
       * Expect that a single outstanding request matches the given matcher, and return
       * it.
       *
       * Requests returned through this API will no longer be in the list of open requests,
       * and thus will not match twice.
       */
    HttpClientTestingBackend.prototype.expectOne = /**
       * Expect that a single outstanding request matches the given matcher, and return
       * it.
       *
       * Requests returned through this API will no longer be in the list of open requests,
       * and thus will not match twice.
       */
    function (match, description) {
        description = description || this.descriptionFromMatcher(match);
        var matches = this.match(match);
        if (matches.length > 1) {
            throw new Error("Expected one matching request for criteria \"" + description + "\", found " + matches.length + " requests.");
        }
        if (matches.length === 0) {
            throw new Error("Expected one matching request for criteria \"" + description + "\", found none.");
        }
        return matches[0];
    };
    /**
     * Expect that no outstanding requests match the given matcher, and throw an error
     * if any do.
     */
    /**
       * Expect that no outstanding requests match the given matcher, and throw an error
       * if any do.
       */
    HttpClientTestingBackend.prototype.expectNone = /**
       * Expect that no outstanding requests match the given matcher, and throw an error
       * if any do.
       */
    function (match, description) {
        description = description || this.descriptionFromMatcher(match);
        var matches = this.match(match);
        if (matches.length > 0) {
            throw new Error("Expected zero matching requests for criteria \"" + description + "\", found " + matches.length + ".");
        }
    };
    /**
     * Validate that there are no outstanding requests.
     */
    /**
       * Validate that there are no outstanding requests.
       */
    HttpClientTestingBackend.prototype.verify = /**
       * Validate that there are no outstanding requests.
       */
    function (opts) {
        if (opts === void 0) { opts = {}; }
        var open = this.open;
        // It's possible that some requests may be cancelled, and this is expected.
        // The user can ask to ignore open requests which have been cancelled.
        if (opts.ignoreCancelled) {
            open = open.filter(function (testReq) { return !testReq.cancelled; });
        }
        if (open.length > 0) {
            // Show the methods and URLs of open requests in the error, for convenience.
            var requests = open.map(function (testReq) {
                var url = testReq.request.urlWithParams.split('?')[0];
                var method = testReq.request.method;
                return method + " " + url;
            })
                .join(', ');
            throw new Error("Expected no open requests, found " + open.length + ": " + requests);
        }
    };
    HttpClientTestingBackend.prototype.descriptionFromMatcher = function (matcher) {
        if (typeof matcher === 'string') {
            return "Match URL: " + matcher;
        }
        else if (typeof matcher === 'object') {
            var method = matcher.method || '(any)';
            var url = matcher.url || '(any)';
            return "Match method: " + method + ", URL: " + url;
        }
        else {
            return "Match by function: " + matcher.name;
        }
    };
    HttpClientTestingBackend.decorators = [
        { type: Injectable }
    ];
    return HttpClientTestingBackend;
}());
export { HttpClientTestingBackend };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVFBLE9BQU8sRUFBeUIsYUFBYSxFQUFjLE1BQU0sc0JBQXNCLENBQUM7QUFDeEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBRzFDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW1CTixFQUFFOztJQUVoQzs7T0FFRzs7OztJQUNILHlDQUFNOzs7SUFBTixVQUFPLEdBQXFCO1FBQTVCLGlCQU9DO1FBTkMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxVQUFDLFFBQXVCO1lBQzVDLElBQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQyxLQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQW9CLENBQUMsQ0FBQztZQUM5RCxPQUFPLGNBQVEsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQzdDLENBQUMsQ0FBQztLQUNKO0lBRUQ7O09BRUc7Ozs7SUFDSyx5Q0FBTTs7O0lBQWQsVUFBZSxLQUErRDtRQUM1RSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssS0FBSyxF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LENBQUMsQ0FBQztTQUNuRDtRQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7O1lBRW5CLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO2dCQUNWLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ3RDLE9BQVUsTUFBTSxTQUFJLEdBQUssQ0FBQzthQUMzQixDQUFDO2lCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFvQyxJQUFJLENBQUMsTUFBTSxVQUFLLFFBQVUsQ0FBQyxDQUFDO1NBQ2pGO0tBQ0Y7SUFFTyx5REFBc0IsR0FBOUIsVUFBK0IsT0FDb0M7UUFDakUsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDL0IsT0FBTyxnQkFBYyxPQUFTLENBQUM7U0FDaEM7YUFBTSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUN0QyxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQztZQUN6QyxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQztZQUNuQyxPQUFPLG1CQUFpQixNQUFNLGVBQVUsR0FBSyxDQUFDO1NBQy9DO2FBQU07WUFDTCxPQUFPLHdCQUFzQixPQUFPLENBQUMsSUFBTSxDQUFDO1NBQzdDO0tBQ0Y7O2dCQXJIRixVQUFVOzttQ0EzQlg7O1NBNEJhLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwUmVxdWVzdH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBUZXN0aW5nQ29udHJvbGxlciwgUmVxdWVzdE1hdGNofSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge1Rlc3RSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuXG5cbi8qKlxuICogQSB0ZXN0aW5nIGJhY2tlbmQgZm9yIGBIdHRwQ2xpZW50YCB3aGljaCBib3RoIGFjdHMgYXMgYW4gYEh0dHBCYWNrZW5kYFxuICogYW5kIGFzIHRoZSBgSHR0cFRlc3RpbmdDb250cm9sbGVyYC5cbiAqXG4gKiBgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kYCB3b3JrcyBieSBrZWVwaW5nIGEgbGlzdCBvZiBhbGwgb3BlbiByZXF1ZXN0cy5cbiAqIEFzIHJlcXVlc3RzIGNvbWUgaW4sIHRoZXkncmUgYWRkZWQgdG8gdGhlIGxpc3QuIFVzZXJzIGNhbiBhc3NlcnQgdGhhdCBzcGVjaWZpY1xuICogcmVxdWVzdHMgd2VyZSBtYWRlIGFuZCB0aGVuIGZsdXNoIHRoZW0uIEluIHRoZSBlbmQsIGEgdmVyaWZ5KCkgbWV0aG9kIGFzc2VydHNcbiAqIHRoYXQgbm8gdW5leHBlY3RlZCByZXF1ZXN0cyB3ZXJlIG1hZGUuXG4gKlxuICpcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kLCBIdHRwVGVzdGluZ0NvbnRyb2xsZXIge1xuICAvKipcbiAgICogTGlzdCBvZiBwZW5kaW5nIHJlcXVlc3RzIHdoaWNoIGhhdmUgbm90IHlldCBiZWVuIGV4cGVjdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBvcGVuOiBUZXN0UmVxdWVzdFtdID0gW107XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhbiBpbmNvbWluZyByZXF1ZXN0IGJ5IHF1ZXVlaW5nIGl0IGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMuXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPGFueT4pID0+IHtcbiAgICAgIGNvbnN0IHRlc3RSZXEgPSBuZXcgVGVzdFJlcXVlc3QocmVxLCBvYnNlcnZlcik7XG4gICAgICB0aGlzLm9wZW4ucHVzaCh0ZXN0UmVxKTtcbiAgICAgIG9ic2VydmVyLm5leHQoeyB0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnQgfSBhcyBIdHRwRXZlbnQ8YW55Pik7XG4gICAgICByZXR1cm4gKCkgPT4geyB0ZXN0UmVxLl9jYW5jZWxsZWQgPSB0cnVlOyB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBzZWFyY2ggZm9yIHJlcXVlc3RzIGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMuXG4gICAqL1xuICBwcml2YXRlIF9tYXRjaChtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbikpOiBUZXN0UmVxdWVzdFtdIHtcbiAgICBpZiAodHlwZW9mIG1hdGNoID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXMub3Blbi5maWx0ZXIodGVzdFJlcSA9PiB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcyA9PT0gbWF0Y2gpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1hdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcih0ZXN0UmVxID0+IG1hdGNoKHRlc3RSZXEucmVxdWVzdCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcihcbiAgICAgICAgICB0ZXN0UmVxID0+ICghbWF0Y2gubWV0aG9kIHx8IHRlc3RSZXEucmVxdWVzdC5tZXRob2QgPT09IG1hdGNoLm1ldGhvZC50b1VwcGVyQ2FzZSgpKSAmJlxuICAgICAgICAgICAgICAoIW1hdGNoLnVybCB8fCB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcyA9PT0gbWF0Y2gudXJsKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCBmb3IgcmVxdWVzdHMgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cywgYW5kIHJldHVybiBhbGwgdGhhdCBtYXRjaFxuICAgKiB3aXRob3V0IGFzc2VydGluZyBhbnl0aGluZyBhYm91dCB0aGUgbnVtYmVyIG9mIG1hdGNoZXMuXG4gICAqL1xuICBtYXRjaChtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbikpOiBUZXN0UmVxdWVzdFtdIHtcbiAgICBjb25zdCByZXN1bHRzID0gdGhpcy5fbWF0Y2gobWF0Y2gpO1xuICAgIHJlc3VsdHMuZm9yRWFjaChyZXN1bHQgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLm9wZW4uaW5kZXhPZihyZXN1bHQpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBhIHNpbmdsZSBvdXRzdGFuZGluZyByZXF1ZXN0IG1hdGNoZXMgdGhlIGdpdmVuIG1hdGNoZXIsIGFuZCByZXR1cm5cbiAgICogaXQuXG4gICAqXG4gICAqIFJlcXVlc3RzIHJldHVybmVkIHRocm91Z2ggdGhpcyBBUEkgd2lsbCBubyBsb25nZXIgYmUgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cyxcbiAgICogYW5kIHRodXMgd2lsbCBub3QgbWF0Y2ggdHdpY2UuXG4gICAqL1xuICBleHBlY3RPbmUobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6XG4gICAgICBUZXN0UmVxdWVzdCB7XG4gICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbiB8fCB0aGlzLmRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2gpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLm1hdGNoKG1hdGNoKTtcbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEV4cGVjdGVkIG9uZSBtYXRjaGluZyByZXF1ZXN0IGZvciBjcml0ZXJpYSBcIiR7ZGVzY3JpcHRpb259XCIsIGZvdW5kICR7bWF0Y2hlcy5sZW5ndGh9IHJlcXVlc3RzLmApO1xuICAgIH1cbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgbm9uZS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZXNbMF07XG4gIH1cblxuICAvKipcbiAgICogRXhwZWN0IHRoYXQgbm8gb3V0c3RhbmRpbmcgcmVxdWVzdHMgbWF0Y2ggdGhlIGdpdmVuIG1hdGNoZXIsIGFuZCB0aHJvdyBhbiBlcnJvclxuICAgKiBpZiBhbnkgZG8uXG4gICAqL1xuICBleHBlY3ROb25lKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSwgZGVzY3JpcHRpb24/OiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbiB8fCB0aGlzLmRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2gpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLm1hdGNoKG1hdGNoKTtcbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEV4cGVjdGVkIHplcm8gbWF0Y2hpbmcgcmVxdWVzdHMgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgJHttYXRjaGVzLmxlbmd0aH0uYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoYXQgdGhlcmUgYXJlIG5vIG91dHN0YW5kaW5nIHJlcXVlc3RzLlxuICAgKi9cbiAgdmVyaWZ5KG9wdHM6IHtpZ25vcmVDYW5jZWxsZWQ/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgbGV0IG9wZW4gPSB0aGlzLm9wZW47XG4gICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHNvbWUgcmVxdWVzdHMgbWF5IGJlIGNhbmNlbGxlZCwgYW5kIHRoaXMgaXMgZXhwZWN0ZWQuXG4gICAgLy8gVGhlIHVzZXIgY2FuIGFzayB0byBpZ25vcmUgb3BlbiByZXF1ZXN0cyB3aGljaCBoYXZlIGJlZW4gY2FuY2VsbGVkLlxuICAgIGlmIChvcHRzLmlnbm9yZUNhbmNlbGxlZCkge1xuICAgICAgb3BlbiA9IG9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gIXRlc3RSZXEuY2FuY2VsbGVkKTtcbiAgICB9XG4gICAgaWYgKG9wZW4ubGVuZ3RoID4gMCkge1xuICAgICAgLy8gU2hvdyB0aGUgbWV0aG9kcyBhbmQgVVJMcyBvZiBvcGVuIHJlcXVlc3RzIGluIHRoZSBlcnJvciwgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgcmVxdWVzdHMgPSBvcGVuLm1hcCh0ZXN0UmVxID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gdGVzdFJlcS5yZXF1ZXN0LnVybFdpdGhQYXJhbXMuc3BsaXQoJz8nKVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gdGVzdFJlcS5yZXF1ZXN0Lm1ldGhvZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZH0gJHt1cmx9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgbm8gb3BlbiByZXF1ZXN0cywgZm91bmQgJHtvcGVuLmxlbmd0aH06ICR7cmVxdWVzdHN9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZXNjcmlwdGlvbkZyb21NYXRjaGVyKG1hdGNoZXI6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbikpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBgTWF0Y2ggVVJMOiAke21hdGNoZXJ9YDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtYXRjaGVyID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgbWV0aG9kID0gbWF0Y2hlci5tZXRob2QgfHwgJyhhbnkpJztcbiAgICAgIGNvbnN0IHVybCA9IG1hdGNoZXIudXJsIHx8ICcoYW55KSc7XG4gICAgICByZXR1cm4gYE1hdGNoIG1ldGhvZDogJHttZXRob2R9LCBVUkw6ICR7dXJsfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgTWF0Y2ggYnkgZnVuY3Rpb246ICR7bWF0Y2hlci5uYW1lfWA7XG4gICAgfVxuICB9XG59XG4iXX0=