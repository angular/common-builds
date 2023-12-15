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
import * as i0 from "@angular/core";
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
                const requests = this.open.map(describeRequest).join(', ');
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
            const requests = open.map(describeRequest).join(', ');
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.4+sha-7bb312f", ngImport: i0, type: HttpClientTestingBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.4+sha-7bb312f", ngImport: i0, type: HttpClientTestingBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.4+sha-7bb312f", ngImport: i0, type: HttpClientTestingBackend, decorators: [{
            type: Injectable
        }] });
function describeRequest(testRequest) {
    const url = testRequest.request.urlWithParams;
    const method = testRequest.request.method;
    return `${method} ${url}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUF5QixhQUFhLEVBQWMsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7QUFHdEM7Ozs7Ozs7Ozs7R0FVRztBQUVILE1BQU0sT0FBTyx3QkFBd0I7SUFEckM7UUFFRTs7V0FFRztRQUNLLFNBQUksR0FBa0IsRUFBRSxDQUFDO0tBb0hsQztJQWxIQzs7T0FFRztJQUNILE1BQU0sQ0FBQyxHQUFxQjtRQUMxQixPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsUUFBdUIsRUFBRSxFQUFFO1lBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQW1CLENBQUMsQ0FBQztZQUM1RCxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUM1QixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLE1BQU0sQ0FBQyxLQUErRDtRQUM1RSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzlCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxN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LENBQUM7UUFDOUMsQ0FBQztJQUNILENBQUM7eUhBdkhVLHdCQUF3Qjs2SEFBeEIsd0JBQXdCOztzR0FBeEIsd0JBQXdCO2tCQURwQyxVQUFVOztBQTJIWCxTQUFTLGVBQWUsQ0FBQyxXQUF3QjtJQUMvQyxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUM5QyxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUMxQyxPQUFPLEdBQUcsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzVCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwUmVxdWVzdH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBUZXN0aW5nQ29udHJvbGxlciwgUmVxdWVzdE1hdGNofSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge1Rlc3RSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuXG5cbi8qKlxuICogQSB0ZXN0aW5nIGJhY2tlbmQgZm9yIGBIdHRwQ2xpZW50YCB3aGljaCBib3RoIGFjdHMgYXMgYW4gYEh0dHBCYWNrZW5kYFxuICogYW5kIGFzIHRoZSBgSHR0cFRlc3RpbmdDb250cm9sbGVyYC5cbiAqXG4gKiBgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kYCB3b3JrcyBieSBrZWVwaW5nIGEgbGlzdCBvZiBhbGwgb3BlbiByZXF1ZXN0cy5cbiAqIEFzIHJlcXVlc3RzIGNvbWUgaW4sIHRoZXkncmUgYWRkZWQgdG8gdGhlIGxpc3QuIFVzZXJzIGNhbiBhc3NlcnQgdGhhdCBzcGVjaWZpY1xuICogcmVxdWVzdHMgd2VyZSBtYWRlIGFuZCB0aGVuIGZsdXNoIHRoZW0uIEluIHRoZSBlbmQsIGEgdmVyaWZ5KCkgbWV0aG9kIGFzc2VydHNcbiAqIHRoYXQgbm8gdW5leHBlY3RlZCByZXF1ZXN0cyB3ZXJlIG1hZGUuXG4gKlxuICpcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kLCBIdHRwVGVzdGluZ0NvbnRyb2xsZXIge1xuICAvKipcbiAgICogTGlzdCBvZiBwZW5kaW5nIHJlcXVlc3RzIHdoaWNoIGhhdmUgbm90IHlldCBiZWVuIGV4cGVjdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBvcGVuOiBUZXN0UmVxdWVzdFtdID0gW107XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhbiBpbmNvbWluZyByZXF1ZXN0IGJ5IHF1ZXVlaW5nIGl0IGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMuXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPGFueT4pID0+IHtcbiAgICAgIGNvbnN0IHRlc3RSZXEgPSBuZXcgVGVzdFJlcXVlc3QocmVxLCBvYnNlcnZlcik7XG4gICAgICB0aGlzLm9wZW4ucHVzaCh0ZXN0UmVxKTtcbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0gYXMgSHR0cEV2ZW50PGFueT4pO1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgdGVzdFJlcS5fY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIHNlYXJjaCBmb3IgcmVxdWVzdHMgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIHByaXZhdGUgX21hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcih0ZXN0UmVxID0+IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gbWF0Y2godGVzdFJlcS5yZXF1ZXN0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKFxuICAgICAgICAgIHRlc3RSZXEgPT4gKCFtYXRjaC5tZXRob2QgfHwgdGVzdFJlcS5yZXF1ZXN0Lm1ldGhvZCA9PT0gbWF0Y2gubWV0aG9kLnRvVXBwZXJDYXNlKCkpICYmXG4gICAgICAgICAgICAgICghbWF0Y2gudXJsIHx8IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaC51cmwpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIGZvciByZXF1ZXN0cyBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLCBhbmQgcmV0dXJuIGFsbCB0aGF0IG1hdGNoXG4gICAqIHdpdGhvdXQgYXNzZXJ0aW5nIGFueXRoaW5nIGFib3V0IHRoZSBudW1iZXIgb2YgbWF0Y2hlcy5cbiAgICovXG4gIG1hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLl9tYXRjaChtYXRjaCk7XG4gICAgcmVzdWx0cy5mb3JFYWNoKHJlc3VsdCA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMub3Blbi5pbmRleE9mKHJlc3VsdCk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3Blbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IGEgc2luZ2xlIG91dHN0YW5kaW5nIHJlcXVlc3QgbWF0Y2hlcyB0aGUgZ2l2ZW4gbWF0Y2hlciwgYW5kIHJldHVyblxuICAgKiBpdC5cbiAgICpcbiAgICogUmVxdWVzdHMgcmV0dXJuZWQgdGhyb3VnaCB0aGlzIEFQSSB3aWxsIG5vIGxvbmdlciBiZSBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLFxuICAgKiBhbmQgdGh1cyB3aWxsIG5vdCBtYXRjaCB0d2ljZS5cbiAgICovXG4gIGV4cGVjdE9uZShtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTpcbiAgICAgIFRlc3RSZXF1ZXN0IHtcbiAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uIHx8IHRoaXMuZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaCk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMubWF0Y2gobWF0Y2gpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgJHtcbiAgICAgICAgICBtYXRjaGVzLmxlbmd0aH0gcmVxdWVzdHMuYCk7XG4gICAgfVxuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSBgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgbm9uZS5gO1xuICAgICAgaWYgKHRoaXMub3Blbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIG1ldGhvZHMgYW5kIFVSTHMgb2Ygb3BlbiByZXF1ZXN0cyBpbiB0aGUgZXJyb3IsIGZvciBjb252ZW5pZW5jZS5cbiAgICAgICAgY29uc3QgcmVxdWVzdHMgPSB0aGlzLm9wZW4ubWFwKGRlc2NyaWJlUmVxdWVzdCkuam9pbignLCAnKTtcbiAgICAgICAgbWVzc2FnZSArPSBgIFJlcXVlc3RzIHJlY2VpdmVkIGFyZTogJHtyZXF1ZXN0c30uYDtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZXNbMF07XG4gIH1cblxuICAvKipcbiAgICogRXhwZWN0IHRoYXQgbm8gb3V0c3RhbmRpbmcgcmVxdWVzdHMgbWF0Y2ggdGhlIGdpdmVuIG1hdGNoZXIsIGFuZCB0aHJvdyBhbiBlcnJvclxuICAgKiBpZiBhbnkgZG8uXG4gICAqL1xuICBleHBlY3ROb25lKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSwgZGVzY3JpcHRpb24/OiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbiB8fCB0aGlzLmRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2gpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLm1hdGNoKG1hdGNoKTtcbiAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHplcm8gbWF0Y2hpbmcgcmVxdWVzdHMgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgJHtcbiAgICAgICAgICBtYXRjaGVzLmxlbmd0aH0uYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoYXQgdGhlcmUgYXJlIG5vIG91dHN0YW5kaW5nIHJlcXVlc3RzLlxuICAgKi9cbiAgdmVyaWZ5KG9wdHM6IHtpZ25vcmVDYW5jZWxsZWQ/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgbGV0IG9wZW4gPSB0aGlzLm9wZW47XG4gICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHNvbWUgcmVxdWVzdHMgbWF5IGJlIGNhbmNlbGxlZCwgYW5kIHRoaXMgaXMgZXhwZWN0ZWQuXG4gICAgLy8gVGhlIHVzZXIgY2FuIGFzayB0byBpZ25vcmUgb3BlbiByZXF1ZXN0cyB3aGljaCBoYXZlIGJlZW4gY2FuY2VsbGVkLlxuICAgIGlmIChvcHRzLmlnbm9yZUNhbmNlbGxlZCkge1xuICAgICAgb3BlbiA9IG9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gIXRlc3RSZXEuY2FuY2VsbGVkKTtcbiAgICB9XG4gICAgaWYgKG9wZW4ubGVuZ3RoID4gMCkge1xuICAgICAgLy8gU2hvdyB0aGUgbWV0aG9kcyBhbmQgVVJMcyBvZiBvcGVuIHJlcXVlc3RzIGluIHRoZSBlcnJvciwgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgcmVxdWVzdHMgPSBvcGVuLm1hcChkZXNjcmliZVJlcXVlc3QpLmpvaW4oJywgJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIG5vIG9wZW4gcmVxdWVzdHMsIGZvdW5kICR7b3Blbi5sZW5ndGh9OiAke3JlcXVlc3RzfWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaGVyOiBzdHJpbmd8UmVxdWVzdE1hdGNofFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIG1hdGNoZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gYE1hdGNoIFVSTDogJHttYXRjaGVyfWA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IG1hdGNoZXIubWV0aG9kIHx8ICcoYW55KSc7XG4gICAgICBjb25zdCB1cmwgPSBtYXRjaGVyLnVybCB8fCAnKGFueSknO1xuICAgICAgcmV0dXJuIGBNYXRjaCBtZXRob2Q6ICR7bWV0aG9kfSwgVVJMOiAke3VybH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYE1hdGNoIGJ5IGZ1bmN0aW9uOiAke21hdGNoZXIubmFtZX1gO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZXNjcmliZVJlcXVlc3QodGVzdFJlcXVlc3Q6IFRlc3RSZXF1ZXN0KTogc3RyaW5nIHtcbiAgY29uc3QgdXJsID0gdGVzdFJlcXVlc3QucmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuICBjb25zdCBtZXRob2QgPSB0ZXN0UmVxdWVzdC5yZXF1ZXN0Lm1ldGhvZDtcbiAgcmV0dXJuIGAke21ldGhvZH0gJHt1cmx9YDtcbn1cbiJdfQ==