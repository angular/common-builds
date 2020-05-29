/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
    class HttpClientTestingBackend {
        constructor() {
            /**
             * List of pending requests which have not yet been expected.
             */
            this.open = [];
        }
        /**
         * Handle an incoming request by queueing it in the list of open requests.
         */
        handle(req) {
            return new Observable((observer) => {
                const testReq = new TestRequest(req, observer);
                this.open.push(testReq);
                observer.next({ type: HttpEventType.Sent });
                return () => {
                    testReq._cancelled = true;
                };
            });
        }
        /**
         * Helper function to search for requests in the list of open requests.
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
         */
        match(match) {
            const results = this._match(match);
            results.forEach(result => {
                const index = this.open.indexOf(result);
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
         */
        expectOne(match, description) {
            description = description || this.descriptionFromMatcher(match);
            const matches = this.match(match);
            if (matches.length > 1) {
                throw new Error(`Expected one matching request for criteria "${description}", found ${matches.length} requests.`);
            }
            if (matches.length === 0) {
                let message = `Expected one matching request for criteria "${description}", found none.`;
                if (this.open.length > 0) {
                    // Show the methods and URLs of open requests in the error, for convenience.
                    const requests = this.open
                        .map(testReq => {
                        const url = testReq.request.urlWithParams;
                        const method = testReq.request.method;
                        return `${method} ${url}`;
                    })
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
         */
        expectNone(match, description) {
            description = description || this.descriptionFromMatcher(match);
            const matches = this.match(match);
            if (matches.length > 0) {
                throw new Error(`Expected zero matching requests for criteria "${description}", found ${matches.length}.`);
            }
        }
        /**
         * Validate that there are no outstanding requests.
         */
        verify(opts = {}) {
            let open = this.open;
            // It's possible that some requests may be cancelled, and this is expected.
            // The user can ask to ignore open requests which have been cancelled.
            if (opts.ignoreCancelled) {
                open = open.filter(testReq => !testReq.cancelled);
            }
            if (open.length > 0) {
                // Show the methods and URLs of open requests in the error, for convenience.
                const requests = open.map(testReq => {
                    const url = testReq.request.urlWithParams.split('?')[0];
                    const method = testReq.request.method;
                    return `${method} ${url}`;
                })
                    .join(', ');
                throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
            }
        }
        descriptionFromMatcher(matcher) {
            if (typeof matcher === 'string') {
                return `Match URL: ${matcher}`;
            }
            else if (typeof matcher === 'object') {
                const method = matcher.method || '(any)';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUF5QixhQUFhLEVBQWMsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUd0Qzs7Ozs7Ozs7OztHQVVHO0FBQ0g7SUFBQSxNQUNhLHdCQUF3QjtRQURyQztZQUVFOztlQUVHO1lBQ0ssU0FBSSxHQUFrQixFQUFFLENBQUM7UUErSG5DLENBQUM7UUE3SEM7O1dBRUc7UUFDSCxNQUFNLENBQUMsR0FBcUI7WUFDMUIsT0FBTyxJQUFJLFVBQVUsQ0FBQyxDQUFDLFFBQXVCLEVBQUUsRUFBRTtnQkFDaEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFtQixDQUFDLENBQUM7Z0JBQzVELE9BQU8sR0FBRyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRDs7V0FFRztRQUNLLE1BQU0sQ0FBQyxLQUErRDtZQUM1RSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsT0FBTyxJQUFJLENBQUMsSUFBSSxD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S0FBSyxRQUFRLEVBQUU7Z0JBQy9CLE9BQU8sY0FBYyxPQUFPLEVBQUUsQ0FBQzthQUNoQztpQkFBTSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtnQkFDdEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUM7Z0JBQ3pDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDO2dCQUNuQyxPQUFPLGlCQUFpQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7YUFDL0M7aUJBQU07Z0JBQ0wsT0FBTyxzQkFBc0IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQzdDO1FBQ0gsQ0FBQzs7O2dCQW5JRixVQUFVOztJQW9JWCwrQkFBQztLQUFBO1NBbklZLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXF1ZXN0fSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cFRlc3RpbmdDb250cm9sbGVyLCBSZXF1ZXN0TWF0Y2h9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7VGVzdFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5cblxuLyoqXG4gKiBBIHRlc3RpbmcgYmFja2VuZCBmb3IgYEh0dHBDbGllbnRgIHdoaWNoIGJvdGggYWN0cyBhcyBhbiBgSHR0cEJhY2tlbmRgXG4gKiBhbmQgYXMgdGhlIGBIdHRwVGVzdGluZ0NvbnRyb2xsZXJgLlxuICpcbiAqIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIHdvcmtzIGJ5IGtlZXBpbmcgYSBsaXN0IG9mIGFsbCBvcGVuIHJlcXVlc3RzLlxuICogQXMgcmVxdWVzdHMgY29tZSBpbiwgdGhleSdyZSBhZGRlZCB0byB0aGUgbGlzdC4gVXNlcnMgY2FuIGFzc2VydCB0aGF0IHNwZWNpZmljXG4gKiByZXF1ZXN0cyB3ZXJlIG1hZGUgYW5kIHRoZW4gZmx1c2ggdGhlbS4gSW4gdGhlIGVuZCwgYSB2ZXJpZnkoKSBtZXRob2QgYXNzZXJ0c1xuICogdGhhdCBubyB1bmV4cGVjdGVkIHJlcXVlc3RzIHdlcmUgbWFkZS5cbiAqXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQsIEh0dHBUZXN0aW5nQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIHBlbmRpbmcgcmVxdWVzdHMgd2hpY2ggaGF2ZSBub3QgeWV0IGJlZW4gZXhwZWN0ZWQuXG4gICAqL1xuICBwcml2YXRlIG9wZW46IFRlc3RSZXF1ZXN0W10gPSBbXTtcblxuICAvKipcbiAgICogSGFuZGxlIGFuIGluY29taW5nIHJlcXVlc3QgYnkgcXVldWVpbmcgaXQgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8YW55PikgPT4ge1xuICAgICAgY29uc3QgdGVzdFJlcSA9IG5ldyBUZXN0UmVxdWVzdChyZXEsIG9ic2VydmVyKTtcbiAgICAgIHRoaXMub3Blbi5wdXNoKHRlc3RSZXEpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSBhcyBIdHRwRXZlbnQ8YW55Pik7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB0ZXN0UmVxLl9jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gc2VhcmNoIGZvciByZXF1ZXN0cyBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLlxuICAgKi9cbiAgcHJpdmF0ZSBfbWF0Y2gobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pKTogVGVzdFJlcXVlc3RbXSB7XG4gICAgaWYgKHR5cGVvZiBtYXRjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gdGVzdFJlcS5yZXF1ZXN0LnVybFdpdGhQYXJhbXMgPT09IG1hdGNoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtYXRjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMub3Blbi5maWx0ZXIodGVzdFJlcSA9PiBtYXRjaCh0ZXN0UmVxLnJlcXVlc3QpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMub3Blbi5maWx0ZXIoXG4gICAgICAgICAgdGVzdFJlcSA9PiAoIW1hdGNoLm1ldGhvZCB8fCB0ZXN0UmVxLnJlcXVlc3QubWV0aG9kID09PSBtYXRjaC5tZXRob2QudG9VcHBlckNhc2UoKSkgJiZcbiAgICAgICAgICAgICAgKCFtYXRjaC51cmwgfHwgdGVzdFJlcS5yZXF1ZXN0LnVybFdpdGhQYXJhbXMgPT09IG1hdGNoLnVybCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggZm9yIHJlcXVlc3RzIGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMsIGFuZCByZXR1cm4gYWxsIHRoYXQgbWF0Y2hcbiAgICogd2l0aG91dCBhc3NlcnRpbmcgYW55dGhpbmcgYWJvdXQgdGhlIG51bWJlciBvZiBtYXRjaGVzLlxuICAgKi9cbiAgbWF0Y2gobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pKTogVGVzdFJlcXVlc3RbXSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IHRoaXMuX21hdGNoKG1hdGNoKTtcbiAgICByZXN1bHRzLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5vcGVuLmluZGV4T2YocmVzdWx0KTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKipcbiAgICogRXhwZWN0IHRoYXQgYSBzaW5nbGUgb3V0c3RhbmRpbmcgcmVxdWVzdCBtYXRjaGVzIHRoZSBnaXZlbiBtYXRjaGVyLCBhbmQgcmV0dXJuXG4gICAqIGl0LlxuICAgKlxuICAgKiBSZXF1ZXN0cyByZXR1cm5lZCB0aHJvdWdoIHRoaXMgQVBJIHdpbGwgbm8gbG9uZ2VyIGJlIGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMsXG4gICAqIGFuZCB0aHVzIHdpbGwgbm90IG1hdGNoIHR3aWNlLlxuICAgKi9cbiAgZXhwZWN0T25lKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSwgZGVzY3JpcHRpb24/OiBzdHJpbmcpOlxuICAgICAgVGVzdFJlcXVlc3Qge1xuICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24gfHwgdGhpcy5kZXNjcmlwdGlvbkZyb21NYXRjaGVyKG1hdGNoKTtcbiAgICBjb25zdCBtYXRjaGVzID0gdGhpcy5tYXRjaChtYXRjaCk7XG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBvbmUgbWF0Y2hpbmcgcmVxdWVzdCBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCAke1xuICAgICAgICAgIG1hdGNoZXMubGVuZ3RofSByZXF1ZXN0cy5gKTtcbiAgICB9XG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9IGBFeHBlY3RlZCBvbmUgbWF0Y2hpbmcgcmVxdWVzdCBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCBub25lLmA7XG4gICAgICBpZiAodGhpcy5vcGVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgbWV0aG9kcyBhbmQgVVJMcyBvZiBvcGVuIHJlcXVlc3RzIGluIHRoZSBlcnJvciwgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgICBjb25zdCByZXF1ZXN0cyA9IHRoaXMub3BlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHRlc3RSZXEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IHRlc3RSZXEucmVxdWVzdC5tZXRob2Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZH0gJHt1cmx9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgIG1lc3NhZ2UgKz0gYCBSZXF1ZXN0cyByZWNlaXZlZCBhcmU6ICR7cmVxdWVzdHN9LmA7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVzWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IG5vIG91dHN0YW5kaW5nIHJlcXVlc3RzIG1hdGNoIHRoZSBnaXZlbiBtYXRjaGVyLCBhbmQgdGhyb3cgYW4gZXJyb3JcbiAgICogaWYgYW55IGRvLlxuICAgKi9cbiAgZXhwZWN0Tm9uZShtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTpcbiAgICAgIHZvaWQge1xuICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24gfHwgdGhpcy5kZXNjcmlwdGlvbkZyb21NYXRjaGVyKG1hdGNoKTtcbiAgICBjb25zdCBtYXRjaGVzID0gdGhpcy5tYXRjaChtYXRjaCk7XG4gICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB6ZXJvIG1hdGNoaW5nIHJlcXVlc3RzIGZvciBjcml0ZXJpYSBcIiR7ZGVzY3JpcHRpb259XCIsIGZvdW5kICR7XG4gICAgICAgICAgbWF0Y2hlcy5sZW5ndGh9LmApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSB0aGF0IHRoZXJlIGFyZSBubyBvdXRzdGFuZGluZyByZXF1ZXN0cy5cbiAgICovXG4gIHZlcmlmeShvcHRzOiB7aWdub3JlQ2FuY2VsbGVkPzogYm9vbGVhbn0gPSB7fSk6IHZvaWQge1xuICAgIGxldCBvcGVuID0gdGhpcy5vcGVuO1xuICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCBzb21lIHJlcXVlc3RzIG1heSBiZSBjYW5jZWxsZWQsIGFuZCB0aGlzIGlzIGV4cGVjdGVkLlxuICAgIC8vIFRoZSB1c2VyIGNhbiBhc2sgdG8gaWdub3JlIG9wZW4gcmVxdWVzdHMgd2hpY2ggaGF2ZSBiZWVuIGNhbmNlbGxlZC5cbiAgICBpZiAob3B0cy5pZ25vcmVDYW5jZWxsZWQpIHtcbiAgICAgIG9wZW4gPSBvcGVuLmZpbHRlcih0ZXN0UmVxID0+ICF0ZXN0UmVxLmNhbmNlbGxlZCk7XG4gICAgfVxuICAgIGlmIChvcGVuLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFNob3cgdGhlIG1ldGhvZHMgYW5kIFVSTHMgb2Ygb3BlbiByZXF1ZXN0cyBpbiB0aGUgZXJyb3IsIGZvciBjb252ZW5pZW5jZS5cbiAgICAgIGNvbnN0IHJlcXVlc3RzID0gb3Blbi5tYXAodGVzdFJlcSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zLnNwbGl0KCc/JylbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IHRlc3RSZXEucmVxdWVzdC5tZXRob2Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHttZXRob2R9ICR7dXJsfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIG5vIG9wZW4gcmVxdWVzdHMsIGZvdW5kICR7b3Blbi5sZW5ndGh9OiAke3JlcXVlc3RzfWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaGVyOiBzdHJpbmd8UmVxdWVzdE1hdGNofFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIG1hdGNoZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gYE1hdGNoIFVSTDogJHttYXRjaGVyfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IG1hdGNoZXIubWV0aG9kIHx8ICcoYW55KSc7XG4gICAgICBjb25zdCB1cmwgPSBtYXRjaGVyLnVybCB8fCAnKGFueSknO1xuICAgICAgcmV0dXJuIGBNYXRjaCBtZXRob2Q6ICR7bWV0aG9kfSwgVVJMOiAke3VybH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYE1hdGNoIGJ5IGZ1bmN0aW9uOiAke21hdGNoZXIubmFtZX1gO1xuICAgIH1cbiAgfVxufVxuIl19