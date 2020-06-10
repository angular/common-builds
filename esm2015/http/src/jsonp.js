/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpResponse } from './response';
// Every request made through JSONP needs a callback name that's unique across the
// whole page. Each request is assigned an id and the callback name is constructed
// from that. The next id to be assigned is tracked in a global variable here that
// is shared among all applications on the page.
let nextRequestId = 0;
// Error text given when a JSONP script is injected, but doesn't invoke the callback
// passed in its URL.
export const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
// Error text given when a request is passed to the JsonpClientBackend that doesn't
// have a request method JSONP.
export const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
export const JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';
/**
 * DI token/abstract type representing a map of JSONP callbacks.
 *
 * In the browser, this should always be the `window` object.
 *
 *
 */
export class JsonpCallbackContext {
}
/**
 * Processes an `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 * @see `HttpHandler`
 * @see `HttpXhrBackend`
 *
 * @publicApi
 */
let JsonpClientBackend = /** @class */ (() => {
    class JsonpClientBackend {
        constructor(callbackMap, document) {
            this.callbackMap = callbackMap;
            this.document = document;
        }
        /**
         * Get the name of the next callback method, by incrementing the global `nextRequestId`.
         */
        nextCallback() {
            return `ng_jsonp_callback_${nextRequestId++}`;
        }
        /**
         * Processes a JSONP request and returns an event stream of the results.
         * @param req The request object.
         * @returns An observable of the response events.
         *
         */
        handle(req) {
            // Firstly, check both the method and response type. If either doesn't match
            // then the request was improperly routed here and cannot be handled.
            if (req.method !== 'JSONP') {
                throw new Error(JSONP_ERR_WRONG_METHOD);
            }
            else if (req.responseType !== 'json') {
                throw new Error(JSONP_ERR_WRONG_RESPONSE_TYPE);
            }
            // Everything else happens inside the Observable boundary.
            return new Observable((observer) => {
                // The first step to make a request is to generate the callback name, and replace the
                // callback placeholder in the URL with the name. Care has to be taken here to ensure
                // a trailing &, if matched, gets inserted back into the URL in the correct place.
                const callback = this.nextCallback();
                const url = req.urlWithParams.replace(/=JSONP_CALLBACK(&|$)/, `=${callback}$1`);
                // Construct the <script> tag and point it at the URL.
                const node = this.document.createElement('script');
                node.src = url;
                // A JSONP request requires waiting for multiple callbacks. These variables
                // are closed over and track state across those callbacks.
                // The response object, if one has been received, or null otherwise.
                let body = null;
                // Whether the response callback has been called.
                let finished = false;
                // Whether the request has been cancelled (and thus any other callbacks)
                // should be ignored.
                let cancelled = false;
                // Set the response callback in this.callbackMap (which will be the window
                // object in the browser. The script being loaded via the <script> tag will
                // eventually call this callback.
                this.callbackMap[callback] = (data) => {
                    // Data has been received from the JSONP script. Firstly, delete this callback.
                    delete this.callbackMap[callback];
                    // Next, make sure the request wasn't cancelled in the meantime.
                    if (cancelled) {
                        return;
                    }
                    // Set state to indicate data was received.
                    body = data;
                    finished = true;
                };
                // cleanup() is a utility closure that removes the <script> from the page and
                // the response callback from the window. This logic is used in both the
                // success, error, and cancellation paths, so it's extracted out for convenience.
                const cleanup = () => {
                    // Remove the <script> tag if it's still on the page.
                    if (node.parentNode) {
                        node.parentNode.removeChild(node);
                    }
                    // Remove the response callback from the callbackMap (window object in the
                    // browser).
                    delete this.callbackMap[callback];
                };
                // onLoad() is the success callback which runs after the response callback
                // if the JSONP script loads successfully. The event itself is unimportant.
                // If something went wrong, onLoad() may run without the response callback
                // having been invoked.
                const onLoad = (event) => {
                    // Do nothing if the request has been cancelled.
                    if (cancelled) {
                        return;
                    }
                    // Cleanup the page.
                    cleanup();
                    // Check whether the response callback has run.
                    if (!finished) {
                        // It hasn't, something went wrong with the request. Return an error via
                        // the Observable error path. All JSONP errors have status 0.
                        observer.error(new HttpErrorResponse({
                            url,
                            status: 0,
                            statusText: 'JSONP Error',
                            error: new Error(JSONP_ERR_NO_CALLBACK),
                        }));
                        return;
                    }
                    // Success. body either contains the response body or null if none was
                    // returned.
                    observer.next(new HttpResponse({
                        body,
                        status: 200,
                        statusText: 'OK',
                        url,
                    }));
                    // Complete the stream, the response is over.
                    observer.complete();
                };
                // onError() is the error callback, which runs if the script returned generates
                // a Javascript error. It emits the error via the Observable error channel as
                // a HttpErrorResponse.
                const onError = (error) => {
                    // If the request was already cancelled, no need to emit anything.
                    if (cancelled) {
                        return;
                    }
                    cleanup();
                    // Wrap the error in a HttpErrorResponse.
                    observer.error(new HttpErrorResponse({
                        error,
                        status: 0,
                        statusText: 'JSONP Error',
                        url,
                    }));
                };
                // Subscribe to both the success (load) and error events on the <script> tag,
                // and add it to the page.
                node.addEventListener('load', onLoad);
                node.addEventListener('error', onError);
                this.document.body.appendChild(node);
                // The request has now been successfully sent.
                observer.next({ type: HttpEventType.Sent });
                // Cancellation handler.
                return () => {
                    // Track the cancellation so event listeners won't do anything even if already scheduled.
                    cancelled = true;
                    // Remove the event listeners so they won't run if the events later fire.
                    node.removeEventListener('load', onLoad);
                    node.removeEventListener('error', onError);
                    // And finally, clean up the page.
                    cleanup();
                };
            });
        }
    }
    JsonpClientBackend.decorators = [
        { type: Injectable }
    ];
    JsonpClientBackend.ctorParameters = () => [
        { type: JsonpCallbackContext },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ];
    return JsonpClientBackend;
})();
export { JsonpClientBackend };
/**
 * Identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * @see `HttpInterceptor`
 *
 * @publicApi
 */
let JsonpInterceptor = /** @class */ (() => {
    class JsonpInterceptor {
        constructor(jsonp) {
            this.jsonp = jsonp;
        }
        /**
         * Identifies and handles a given JSONP request.
         * @param req The outgoing request object to handle.
         * @param next The next interceptor in the chain, or the backend
         * if no interceptors remain in the chain.
         * @returns An observable of the event stream.
         */
        intercept(req, next) {
            if (req.method === 'JSONP') {
                return this.jsonp.handle(req);
            }
            // Fall through for normal HTTP requests.
            return next.handle(req);
        }
    }
    JsonpInterceptor.decorators = [
        { type: Injectable }
    ];
    JsonpInterceptor.ctorParameters = () => [
        { type: JsonpClientBackend }
    ];
    return JsonpInterceptor;
})();
export { JsonpInterceptor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFJMUMsT0FBTyxFQUFDLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFckYsa0ZBQWtGO0FBQ2xGLGtGQUFrRjtBQUNsRixrRkFBa0Y7QUFDbEYsZ0RBQWdEO0FBQ2hELElBQUksYUFBYSxHQUFXLENBQUMsQ0FBQztBQUU5QixvRkFBb0Y7QUFDcEYscUJBQXFCO0FBQ3JCLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLGdEQUFnRCxDQUFDO0FBRXRGLG1GQUFtRjtBQUNuRiwrQkFBK0I7QUFDL0IsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsK0NBQStDLENBQUM7QUFDdEYsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsNkNBQTZDLENBQUM7QUFFM0Y7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFnQixvQkFBb0I7Q0FFekM7QUFFRDs7Ozs7OztHQU9HO0FBQ0g7SUFBQSxNQUNhLGtCQUFrQjtRQUM3QixZQUFvQixXQUFpQyxFQUE0QixRQUFhO1lBQTFFLGdCQUFXLEdBQVgsV0FBVyxDQUFzQjtZQUE0QixhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQUcsQ0FBQztRQUVsRzs7V0FFRztRQUNLLFlBQVk7WUFDbEIsT0FBTyxxQkFBcUIsYUFBYSxFQUFFLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCxNQUFNLENBQUMsR0FB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Q0FBQztvQkFDekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFFM0Msa0NBQWtDO29CQUNsQyxPQUFPLEVBQUUsQ0FBQztnQkFDWixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7OztnQkFsS0YsVUFBVTs7O2dCQUV3QixvQkFBb0I7Z0RBQUcsTUFBTSxTQUFDLFFBQVE7O0lBaUt6RSx5QkFBQztLQUFBO1NBbEtZLGtCQUFrQjtBQW9LL0I7Ozs7Ozs7R0FPRztBQUNIO0lBQUEsTUFDYSxnQkFBZ0I7UUFDM0IsWUFBb0IsS0FBeUI7WUFBekIsVUFBSyxHQUFMLEtBQUssQ0FBb0I7UUFBRyxDQUFDO1FBRWpEOzs7Ozs7V0FNRztRQUNILFNBQVMsQ0FBQyxHQUFxQixFQUFFLElBQWlCO1lBQ2hELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUU7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBeUIsQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QseUNBQXlDO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixDQUFDOzs7Z0JBakJGLFVBQVU7OztnQkFFa0Isa0JBQWtCOztJQWdCL0MsdUJBQUM7S0FBQTtTQWpCWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXNwb25zZX0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbi8vIEV2ZXJ5IHJlcXVlc3QgbWFkZSB0aHJvdWdoIEpTT05QIG5lZWRzIGEgY2FsbGJhY2sgbmFtZSB0aGF0J3MgdW5pcXVlIGFjcm9zcyB0aGVcbi8vIHdob2xlIHBhZ2UuIEVhY2ggcmVxdWVzdCBpcyBhc3NpZ25lZCBhbiBpZCBhbmQgdGhlIGNhbGxiYWNrIG5hbWUgaXMgY29uc3RydWN0ZWRcbi8vIGZyb20gdGhhdC4gVGhlIG5leHQgaWQgdG8gYmUgYXNzaWduZWQgaXMgdHJhY2tlZCBpbiBhIGdsb2JhbCB2YXJpYWJsZSBoZXJlIHRoYXRcbi8vIGlzIHNoYXJlZCBhbW9uZyBhbGwgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxubGV0IG5leHRSZXF1ZXN0SWQ6IG51bWJlciA9IDA7XG5cbi8vIEVycm9yIHRleHQgZ2l2ZW4gd2hlbiBhIEpTT05QIHNjcmlwdCBpcyBpbmplY3RlZCwgYnV0IGRvZXNuJ3QgaW52b2tlIHRoZSBjYWxsYmFja1xuLy8gcGFzc2VkIGluIGl0cyBVUkwuXG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX05PX0NBTExCQUNLID0gJ0pTT05QIGluamVjdGVkIHNjcmlwdCBkaWQgbm90IGludm9rZSBjYWxsYmFjay4nO1xuXG4vLyBFcnJvciB0ZXh0IGdpdmVuIHdoZW4gYSByZXF1ZXN0IGlzIHBhc3NlZCB0byB0aGUgSnNvbnBDbGllbnRCYWNrZW5kIHRoYXQgZG9lc24ndFxuLy8gaGF2ZSBhIHJlcXVlc3QgbWV0aG9kIEpTT05QLlxuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9XUk9OR19NRVRIT0QgPSAnSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgSlNPTlAgcmVxdWVzdCBtZXRob2QuJztcbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfV1JPTkdfUkVTUE9OU0VfVFlQRSA9ICdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBKc29uIHJlc3BvbnNlIHR5cGUuJztcblxuLyoqXG4gKiBESSB0b2tlbi9hYnN0cmFjdCB0eXBlIHJlcHJlc2VudGluZyBhIG1hcCBvZiBKU09OUCBjYWxsYmFja3MuXG4gKlxuICogSW4gdGhlIGJyb3dzZXIsIHRoaXMgc2hvdWxkIGFsd2F5cyBiZSB0aGUgYHdpbmRvd2Agb2JqZWN0LlxuICpcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKc29ucENhbGxiYWNrQ29udGV4dCB7XG4gIFtrZXk6IHN0cmluZ106IChkYXRhOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8qKlxuICogUHJvY2Vzc2VzIGFuIGBIdHRwUmVxdWVzdGAgd2l0aCB0aGUgSlNPTlAgbWV0aG9kLFxuICogYnkgcGVyZm9ybWluZyBKU09OUCBzdHlsZSByZXF1ZXN0cy5cbiAqIEBzZWUgYEh0dHBIYW5kbGVyYFxuICogQHNlZSBgSHR0cFhockJhY2tlbmRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvbnBDbGllbnRCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbGxiYWNrTWFwOiBKc29ucENhbGxiYWNrQ29udGV4dCwgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2N1bWVudDogYW55KSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5hbWUgb2YgdGhlIG5leHQgY2FsbGJhY2sgbWV0aG9kLCBieSBpbmNyZW1lbnRpbmcgdGhlIGdsb2JhbCBgbmV4dFJlcXVlc3RJZGAuXG4gICAqL1xuICBwcml2YXRlIG5leHRDYWxsYmFjaygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbmdfanNvbnBfY2FsbGJhY2tfJHtuZXh0UmVxdWVzdElkKyt9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgYSBKU09OUCByZXF1ZXN0IGFuZCByZXR1cm5zIGFuIGV2ZW50IHN0cmVhbSBvZiB0aGUgcmVzdWx0cy5cbiAgICogQHBhcmFtIHJlcSBUaGUgcmVxdWVzdCBvYmplY3QuXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIHJlc3BvbnNlIGV2ZW50cy5cbiAgICpcbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PG5ldmVyPik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBGaXJzdGx5LCBjaGVjayBib3RoIHRoZSBtZXRob2QgYW5kIHJlc3BvbnNlIHR5cGUuIElmIGVpdGhlciBkb2Vzbid0IG1hdGNoXG4gICAgLy8gdGhlbiB0aGUgcmVxdWVzdCB3YXMgaW1wcm9wZXJseSByb3V0ZWQgaGVyZSBhbmQgY2Fubm90IGJlIGhhbmRsZWQuXG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdKU09OUCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfTUVUSE9EKTtcbiAgICB9IGVsc2UgaWYgKHJlcS5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGVsc2UgaGFwcGVucyBpbnNpZGUgdGhlIE9ic2VydmFibGUgYm91bmRhcnkuXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pigob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgLy8gVGhlIGZpcnN0IHN0ZXAgdG8gbWFrZSBhIHJlcXVlc3QgaXMgdG8gZ2VuZXJhdGUgdGhlIGNhbGxiYWNrIG5hbWUsIGFuZCByZXBsYWNlIHRoZVxuICAgICAgLy8gY2FsbGJhY2sgcGxhY2Vob2xkZXIgaW4gdGhlIFVSTCB3aXRoIHRoZSBuYW1lLiBDYXJlIGhhcyB0byBiZSB0YWtlbiBoZXJlIHRvIGVuc3VyZVxuICAgICAgLy8gYSB0cmFpbGluZyAmLCBpZiBtYXRjaGVkLCBnZXRzIGluc2VydGVkIGJhY2sgaW50byB0aGUgVVJMIGluIHRoZSBjb3JyZWN0IHBsYWNlLlxuICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLm5leHRDYWxsYmFjaygpO1xuICAgICAgY29uc3QgdXJsID0gcmVxLnVybFdpdGhQYXJhbXMucmVwbGFjZSgvPUpTT05QX0NBTExCQUNLKCZ8JCkvLCBgPSR7Y2FsbGJhY2t9JDFgKTtcblxuICAgICAgLy8gQ29uc3RydWN0IHRoZSA8c2NyaXB0PiB0YWcgYW5kIHBvaW50IGl0IGF0IHRoZSBVUkwuXG4gICAgICBjb25zdCBub2RlID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIG5vZGUuc3JjID0gdXJsO1xuXG4gICAgICAvLyBBIEpTT05QIHJlcXVlc3QgcmVxdWlyZXMgd2FpdGluZyBmb3IgbXVsdGlwbGUgY2FsbGJhY2tzLiBUaGVzZSB2YXJpYWJsZXNcbiAgICAgIC8vIGFyZSBjbG9zZWQgb3ZlciBhbmQgdHJhY2sgc3RhdGUgYWNyb3NzIHRob3NlIGNhbGxiYWNrcy5cblxuICAgICAgLy8gVGhlIHJlc3BvbnNlIG9iamVjdCwgaWYgb25lIGhhcyBiZWVuIHJlY2VpdmVkLCBvciBudWxsIG90aGVyd2lzZS5cbiAgICAgIGxldCBib2R5OiBhbnl8bnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIFdoZXRoZXIgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGhhcyBiZWVuIGNhbGxlZC5cbiAgICAgIGxldCBmaW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGNhbmNlbGxlZCAoYW5kIHRodXMgYW55IG90aGVyIGNhbGxiYWNrcylcbiAgICAgIC8vIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgICAgbGV0IGNhbmNlbGxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAvLyBTZXQgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGluIHRoaXMuY2FsbGJhY2tNYXAgKHdoaWNoIHdpbGwgYmUgdGhlIHdpbmRvd1xuICAgICAgLy8gb2JqZWN0IGluIHRoZSBicm93c2VyLiBUaGUgc2NyaXB0IGJlaW5nIGxvYWRlZCB2aWEgdGhlIDxzY3JpcHQ+IHRhZyB3aWxsXG4gICAgICAvLyBldmVudHVhbGx5IGNhbGwgdGhpcyBjYWxsYmFjay5cbiAgICAgIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdID0gKGRhdGE/OiBhbnkpID0+IHtcbiAgICAgICAgLy8gRGF0YSBoYXMgYmVlbiByZWNlaXZlZCBmcm9tIHRoZSBKU09OUCBzY3JpcHQuIEZpcnN0bHksIGRlbGV0ZSB0aGlzIGNhbGxiYWNrLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG5cbiAgICAgICAgLy8gTmV4dCwgbWFrZSBzdXJlIHRoZSByZXF1ZXN0IHdhc24ndCBjYW5jZWxsZWQgaW4gdGhlIG1lYW50aW1lLlxuICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHN0YXRlIHRvIGluZGljYXRlIGRhdGEgd2FzIHJlY2VpdmVkLlxuICAgICAgICBib2R5ID0gZGF0YTtcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgfTtcblxuICAgICAgLy8gY2xlYW51cCgpIGlzIGEgdXRpbGl0eSBjbG9zdXJlIHRoYXQgcmVtb3ZlcyB0aGUgPHNjcmlwdD4gZnJvbSB0aGUgcGFnZSBhbmRcbiAgICAgIC8vIHRoZSByZXNwb25zZSBjYWxsYmFjayBmcm9tIHRoZSB3aW5kb3cuIFRoaXMgbG9naWMgaXMgdXNlZCBpbiBib3RoIHRoZVxuICAgICAgLy8gc3VjY2VzcywgZXJyb3IsIGFuZCBjYW5jZWxsYXRpb24gcGF0aHMsIHNvIGl0J3MgZXh0cmFjdGVkIG91dCBmb3IgY29udmVuaWVuY2UuXG4gICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xuICAgICAgICAvLyBSZW1vdmUgdGhlIDxzY3JpcHQ+IHRhZyBpZiBpdCdzIHN0aWxsIG9uIHRoZSBwYWdlLlxuICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSByZXNwb25zZSBjYWxsYmFjayBmcm9tIHRoZSBjYWxsYmFja01hcCAod2luZG93IG9iamVjdCBpbiB0aGVcbiAgICAgICAgLy8gYnJvd3NlcikuXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXTtcbiAgICAgIH07XG5cbiAgICAgIC8vIG9uTG9hZCgpIGlzIHRoZSBzdWNjZXNzIGNhbGxiYWNrIHdoaWNoIHJ1bnMgYWZ0ZXIgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAvLyBpZiB0aGUgSlNPTlAgc2NyaXB0IGxvYWRzIHN1Y2Nlc3NmdWxseS4gVGhlIGV2ZW50IGl0c2VsZiBpcyB1bmltcG9ydGFudC5cbiAgICAgIC8vIElmIHNvbWV0aGluZyB3ZW50IHdyb25nLCBvbkxvYWQoKSBtYXkgcnVuIHdpdGhvdXQgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAvLyBoYXZpbmcgYmVlbiBpbnZva2VkLlxuICAgICAgY29uc3Qgb25Mb2FkID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGNhbmNlbGxlZC5cbiAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFudXAgdGhlIHBhZ2UuXG4gICAgICAgIGNsZWFudXAoKTtcblxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgcnVuLlxuICAgICAgICBpZiAoIWZpbmlzaGVkKSB7XG4gICAgICAgICAgLy8gSXQgaGFzbid0LCBzb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSByZXF1ZXN0LiBSZXR1cm4gYW4gZXJyb3IgdmlhXG4gICAgICAgICAgLy8gdGhlIE9ic2VydmFibGUgZXJyb3IgcGF0aC4gQWxsIEpTT05QIGVycm9ycyBoYXZlIHN0YXR1cyAwLlxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLFxuICAgICAgICAgICAgZXJyb3I6IG5ldyBFcnJvcihKU09OUF9FUlJfTk9fQ0FMTEJBQ0spLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdWNjZXNzLiBib2R5IGVpdGhlciBjb250YWlucyB0aGUgcmVzcG9uc2UgYm9keSBvciBudWxsIGlmIG5vbmUgd2FzXG4gICAgICAgIC8vIHJldHVybmVkLlxuICAgICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgIGJvZHksXG4gICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogJ09LJyxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBDb21wbGV0ZSB0aGUgc3RyZWFtLCB0aGUgcmVzcG9uc2UgaXMgb3Zlci5cbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIG9uRXJyb3IoKSBpcyB0aGUgZXJyb3IgY2FsbGJhY2ssIHdoaWNoIHJ1bnMgaWYgdGhlIHNjcmlwdCByZXR1cm5lZCBnZW5lcmF0ZXNcbiAgICAgIC8vIGEgSmF2YXNjcmlwdCBlcnJvci4gSXQgZW1pdHMgdGhlIGVycm9yIHZpYSB0aGUgT2JzZXJ2YWJsZSBlcnJvciBjaGFubmVsIGFzXG4gICAgICAvLyBhIEh0dHBFcnJvclJlc3BvbnNlLlxuICAgICAgY29uc3Qgb25FcnJvcjogYW55ID0gKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgcmVxdWVzdCB3YXMgYWxyZWFkeSBjYW5jZWxsZWQsIG5vIG5lZWQgdG8gZW1pdCBhbnl0aGluZy5cbiAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgLy8gV3JhcCB0aGUgZXJyb3IgaW4gYSBIdHRwRXJyb3JSZXNwb25zZS5cbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogJ0pTT05QIEVycm9yJyxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0pKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN1YnNjcmliZSB0byBib3RoIHRoZSBzdWNjZXNzIChsb2FkKSBhbmQgZXJyb3IgZXZlbnRzIG9uIHRoZSA8c2NyaXB0PiB0YWcsXG4gICAgICAvLyBhbmQgYWRkIGl0IHRvIHRoZSBwYWdlLlxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgIHRoaXMuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaGFzIG5vdyBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50LlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIGNhbmNlbGxhdGlvbiBzbyBldmVudCBsaXN0ZW5lcnMgd29uJ3QgZG8gYW55dGhpbmcgZXZlbiBpZiBhbHJlYWR5IHNjaGVkdWxlZC5cbiAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVycyBzbyB0aGV5IHdvbid0IHJ1biBpZiB0aGUgZXZlbnRzIGxhdGVyIGZpcmUuXG4gICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcblxuICAgICAgICAvLyBBbmQgZmluYWxseSwgY2xlYW4gdXAgdGhlIHBhZ2UuXG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIHJlcXVlc3RzIHdpdGggdGhlIG1ldGhvZCBKU09OUCBhbmRcbiAqIHNoaWZ0cyB0aGVtIHRvIHRoZSBgSnNvbnBDbGllbnRCYWNrZW5kYC5cbiAqXG4gKiBAc2VlIGBIdHRwSW50ZXJjZXB0b3JgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvbnBJbnRlcmNlcHRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUganNvbnA6IEpzb25wQ2xpZW50QmFja2VuZCkge31cblxuICAvKipcbiAgICogSWRlbnRpZmllcyBhbmQgaGFuZGxlcyBhIGdpdmVuIEpTT05QIHJlcXVlc3QuXG4gICAqIEBwYXJhbSByZXEgVGhlIG91dGdvaW5nIHJlcXVlc3Qgb2JqZWN0IHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIG5leHQgVGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBvciB0aGUgYmFja2VuZFxuICAgKiBpZiBubyBpbnRlcmNlcHRvcnMgcmVtYWluIGluIHRoZSBjaGFpbi5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgKi9cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmpzb25wLmhhbmRsZShyZXEgYXMgSHR0cFJlcXVlc3Q8bmV2ZXI+KTtcbiAgICB9XG4gICAgLy8gRmFsbCB0aHJvdWdoIGZvciBub3JtYWwgSFRUUCByZXF1ZXN0cy5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgfVxufVxuIl19