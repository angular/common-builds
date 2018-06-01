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
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpResponse } from './response';
// Every request made through JSONP needs a callback name that's unique across the
// whole page. Each request is assigned an id and the callback name is constructed
// from that. The next id to be assigned is tracked in a global variable here that
// is shared among all applications on the page.
let /** @type {?} */ nextRequestId = 0;
// Error text given when a JSONP script is injected, but doesn't invoke the callback
// passed in its URL.
export const /** @type {?} */ JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
// Error text given when a request is passed to the JsonpClientBackend that doesn't
// have a request method JSONP.
export const /** @type {?} */ JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
export const /** @type {?} */ JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';
/**
 * DI token/abstract type representing a map of JSONP callbacks.
 *
 * In the browser, this should always be the `window` object.
 *
 *
 * @abstract
 */
export class JsonpCallbackContext {
}
/**
 * `HttpBackend` that only processes `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 *
 *
 */
export class JsonpClientBackend {
    /**
     * @param {?} callbackMap
     * @param {?} document
     */
    constructor(callbackMap, document) {
        this.callbackMap = callbackMap;
        this.document = document;
    }
    /**
     * Get the name of the next callback method, by incrementing the global `nextRequestId`.
     * @return {?}
     */
    nextCallback() { return `ng_jsonp_callback_${nextRequestId++}`; }
    /**
     * Process a JSONP request and return an event stream of the results.
     * @param {?} req
     * @return {?}
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
            const /** @type {?} */ callback = this.nextCallback();
            const /** @type {?} */ url = req.urlWithParams.replace(/=JSONP_CALLBACK(&|$)/, `=${callback}$1`);
            // Construct the <script> tag and point it at the URL.
            const /** @type {?} */ node = this.document.createElement('script');
            node.src = url;
            // A JSONP request requires waiting for multiple callbacks. These variables
            // are closed over and track state across those callbacks.
            // The response object, if one has been received, or null otherwise.
            let /** @type {?} */ body = null;
            // Whether the response callback has been called.
            let /** @type {?} */ finished = false;
            // Whether the request has been cancelled (and thus any other callbacks)
            // should be ignored.
            let /** @type {?} */ cancelled = false;
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
            const /** @type {?} */ cleanup = () => {
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
            const /** @type {?} */ onLoad = (event) => {
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
                    statusText: 'OK', url,
                }));
                // Complete the stream, the response is over.
                observer.complete();
            };
            // onError() is the error callback, which runs if the script returned generates
            // a Javascript error. It emits the error via the Observable error channel as
            // a HttpErrorResponse.
            const /** @type {?} */ onError = (error) => {
                // If the request was already cancelled, no need to emit anything.
                if (cancelled) {
                    return;
                }
                cleanup();
                // Wrap the error in a HttpErrorResponse.
                observer.error(new HttpErrorResponse({
                    error,
                    status: 0,
                    statusText: 'JSONP Error', url,
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
/** @nocollapse */
JsonpClientBackend.ctorParameters = () => [
    { type: JsonpCallbackContext },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
function JsonpClientBackend_tsickle_Closure_declarations() {
    /** @type {?} */
    JsonpClientBackend.prototype.callbackMap;
    /** @type {?} */
    JsonpClientBackend.prototype.document;
}
/**
 * An `HttpInterceptor` which identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 *
 */
export class JsonpInterceptor {
    /**
     * @param {?} jsonp
     */
    constructor(jsonp) {
        this.jsonp = jsonp;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    intercept(req, next) {
        if (req.method === 'JSONP') {
            return this.jsonp.handle(/** @type {?} */ (req));
        }
        // Fall through for normal HTTP requests.
        return next.handle(req);
    }
}
JsonpInterceptor.decorators = [
    { type: Injectable }
];
/** @nocollapse */
JsonpInterceptor.ctorParameters = () => [
    { type: JsonpClientBackend }
];
function JsonpInterceptor_tsickle_Closure_declarations() {
    /** @type {?} */
    JsonpInterceptor.prototype.jsonp;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBVyxNQUFNLE1BQU0sQ0FBQztBQUkxQyxPQUFPLEVBQUMsaUJBQWlCLEVBQWEsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFlBQVksQ0FBQzs7Ozs7QUFNckYscUJBQUksYUFBYSxHQUFXLENBQUMsQ0FBQzs7O0FBSTlCLE1BQU0sQ0FBQyx1QkFBTSxxQkFBcUIsR0FBRyxnREFBZ0QsQ0FBQzs7O0FBSXRGLE1BQU0sQ0FBQyx1QkFBTSxzQkFBc0IsR0FBRywrQ0FBK0MsQ0FBQztBQUN0RixNQUFNLENBQUMsdUJBQU0sNkJBQTZCLEdBQUcsNkNBQTZDLENBQUM7Ozs7Ozs7OztBQVMzRixNQUFNO0NBQTRFOzs7Ozs7O0FBU2xGLE1BQU07Ozs7O0lBQ0osWUFBb0IsV0FBaUMsRUFBNEIsUUFBYTtRQUExRSxnQkFBVyxHQUFYLFdBQVcsQ0FBc0I7UUFBNEIsYUFBUSxHQUFSLFFBQVEsQ0FBSztLQUFJOzs7OztJQUsxRixZQUFZLEtBQWEsT0FBTyxxQkFBcUIsYUFBYSxFQUFFLEVBQUUsQ0FBQzs7Ozs7O0lBSy9FLE1BQU0sQ0FBQyxHQUF1Qjs7O1FBRzVCLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3pDO2FBQU0sSUFBSSxHQUFHLENBQUMsWUFBWSxLQUFLLE1BQU0sRUFBRTtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2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LEVBQUU7O2dCQUVWLFNBQVMsR0FBRyxJQUFJLENBQUM7O2dCQUdqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztnQkFHM0MsT0FBTyxFQUFFLENBQUM7YUFDWCxDQUFDO1NBQ0gsQ0FBQyxDQUFDO0tBQ0o7OztZQTNKRixVQUFVOzs7O1lBRXdCLG9CQUFvQjs0Q0FBRyxNQUFNLFNBQUMsUUFBUTs7Ozs7Ozs7Ozs7Ozs7QUFtS3pFLE1BQU07Ozs7SUFDSixZQUFvQixLQUF5QjtRQUF6QixVQUFLLEdBQUwsS0FBSyxDQUFvQjtLQUFJOzs7Ozs7SUFFakQsU0FBUyxDQUFDLEdBQXFCLEVBQUUsSUFBaUI7UUFDaEQsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE9BQU8sRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxtQkFBQyxHQUF5QixFQUFDLENBQUM7U0FDckQ7O1FBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3pCOzs7WUFWRixVQUFVOzs7O1lBRWtCLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXNwb25zZX0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbi8vIEV2ZXJ5IHJlcXVlc3QgbWFkZSB0aHJvdWdoIEpTT05QIG5lZWRzIGEgY2FsbGJhY2sgbmFtZSB0aGF0J3MgdW5pcXVlIGFjcm9zcyB0aGVcbi8vIHdob2xlIHBhZ2UuIEVhY2ggcmVxdWVzdCBpcyBhc3NpZ25lZCBhbiBpZCBhbmQgdGhlIGNhbGxiYWNrIG5hbWUgaXMgY29uc3RydWN0ZWRcbi8vIGZyb20gdGhhdC4gVGhlIG5leHQgaWQgdG8gYmUgYXNzaWduZWQgaXMgdHJhY2tlZCBpbiBhIGdsb2JhbCB2YXJpYWJsZSBoZXJlIHRoYXRcbi8vIGlzIHNoYXJlZCBhbW9uZyBhbGwgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxubGV0IG5leHRSZXF1ZXN0SWQ6IG51bWJlciA9IDA7XG5cbi8vIEVycm9yIHRleHQgZ2l2ZW4gd2hlbiBhIEpTT05QIHNjcmlwdCBpcyBpbmplY3RlZCwgYnV0IGRvZXNuJ3QgaW52b2tlIHRoZSBjYWxsYmFja1xuLy8gcGFzc2VkIGluIGl0cyBVUkwuXG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX05PX0NBTExCQUNLID0gJ0pTT05QIGluamVjdGVkIHNjcmlwdCBkaWQgbm90IGludm9rZSBjYWxsYmFjay4nO1xuXG4vLyBFcnJvciB0ZXh0IGdpdmVuIHdoZW4gYSByZXF1ZXN0IGlzIHBhc3NlZCB0byB0aGUgSnNvbnBDbGllbnRCYWNrZW5kIHRoYXQgZG9lc24ndFxuLy8gaGF2ZSBhIHJlcXVlc3QgbWV0aG9kIEpTT05QLlxuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9XUk9OR19NRVRIT0QgPSAnSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgSlNPTlAgcmVxdWVzdCBtZXRob2QuJztcbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfV1JPTkdfUkVTUE9OU0VfVFlQRSA9ICdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBKc29uIHJlc3BvbnNlIHR5cGUuJztcblxuLyoqXG4gKiBESSB0b2tlbi9hYnN0cmFjdCB0eXBlIHJlcHJlc2VudGluZyBhIG1hcCBvZiBKU09OUCBjYWxsYmFja3MuXG4gKlxuICogSW4gdGhlIGJyb3dzZXIsIHRoaXMgc2hvdWxkIGFsd2F5cyBiZSB0aGUgYHdpbmRvd2Agb2JqZWN0LlxuICpcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKc29ucENhbGxiYWNrQ29udGV4dCB7IFtrZXk6IHN0cmluZ106IChkYXRhOiBhbnkpID0+IHZvaWQ7IH1cblxuLyoqXG4gKiBgSHR0cEJhY2tlbmRgIHRoYXQgb25seSBwcm9jZXNzZXMgYEh0dHBSZXF1ZXN0YCB3aXRoIHRoZSBKU09OUCBtZXRob2QsXG4gKiBieSBwZXJmb3JtaW5nIEpTT05QIHN0eWxlIHJlcXVlc3RzLlxuICpcbiAqXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucENsaWVudEJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FsbGJhY2tNYXA6IEpzb25wQ2FsbGJhY2tDb250ZXh0LCBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvY3VtZW50OiBhbnkpIHt9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmFtZSBvZiB0aGUgbmV4dCBjYWxsYmFjayBtZXRob2QsIGJ5IGluY3JlbWVudGluZyB0aGUgZ2xvYmFsIGBuZXh0UmVxdWVzdElkYC5cbiAgICovXG4gIHByaXZhdGUgbmV4dENhbGxiYWNrKCk6IHN0cmluZyB7IHJldHVybiBgbmdfanNvbnBfY2FsbGJhY2tfJHtuZXh0UmVxdWVzdElkKyt9YDsgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIGEgSlNPTlAgcmVxdWVzdCBhbmQgcmV0dXJuIGFuIGV2ZW50IHN0cmVhbSBvZiB0aGUgcmVzdWx0cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PG5ldmVyPik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBGaXJzdGx5LCBjaGVjayBib3RoIHRoZSBtZXRob2QgYW5kIHJlc3BvbnNlIHR5cGUuIElmIGVpdGhlciBkb2Vzbid0IG1hdGNoXG4gICAgLy8gdGhlbiB0aGUgcmVxdWVzdCB3YXMgaW1wcm9wZXJseSByb3V0ZWQgaGVyZSBhbmQgY2Fubm90IGJlIGhhbmRsZWQuXG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdKU09OUCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfTUVUSE9EKTtcbiAgICB9IGVsc2UgaWYgKHJlcS5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGVsc2UgaGFwcGVucyBpbnNpZGUgdGhlIE9ic2VydmFibGUgYm91bmRhcnkuXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pigob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgLy8gVGhlIGZpcnN0IHN0ZXAgdG8gbWFrZSBhIHJlcXVlc3QgaXMgdG8gZ2VuZXJhdGUgdGhlIGNhbGxiYWNrIG5hbWUsIGFuZCByZXBsYWNlIHRoZVxuICAgICAgLy8gY2FsbGJhY2sgcGxhY2Vob2xkZXIgaW4gdGhlIFVSTCB3aXRoIHRoZSBuYW1lLiBDYXJlIGhhcyB0byBiZSB0YWtlbiBoZXJlIHRvIGVuc3VyZVxuICAgICAgLy8gYSB0cmFpbGluZyAmLCBpZiBtYXRjaGVkLCBnZXRzIGluc2VydGVkIGJhY2sgaW50byB0aGUgVVJMIGluIHRoZSBjb3JyZWN0IHBsYWNlLlxuICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLm5leHRDYWxsYmFjaygpO1xuICAgICAgY29uc3QgdXJsID0gcmVxLnVybFdpdGhQYXJhbXMucmVwbGFjZSgvPUpTT05QX0NBTExCQUNLKCZ8JCkvLCBgPSR7Y2FsbGJhY2t9JDFgKTtcblxuICAgICAgLy8gQ29uc3RydWN0IHRoZSA8c2NyaXB0PiB0YWcgYW5kIHBvaW50IGl0IGF0IHRoZSBVUkwuXG4gICAgICBjb25zdCBub2RlID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIG5vZGUuc3JjID0gdXJsO1xuXG4gICAgICAvLyBBIEpTT05QIHJlcXVlc3QgcmVxdWlyZXMgd2FpdGluZyBmb3IgbXVsdGlwbGUgY2FsbGJhY2tzLiBUaGVzZSB2YXJpYWJsZXNcbiAgICAgIC8vIGFyZSBjbG9zZWQgb3ZlciBhbmQgdHJhY2sgc3RhdGUgYWNyb3NzIHRob3NlIGNhbGxiYWNrcy5cblxuICAgICAgLy8gVGhlIHJlc3BvbnNlIG9iamVjdCwgaWYgb25lIGhhcyBiZWVuIHJlY2VpdmVkLCBvciBudWxsIG90aGVyd2lzZS5cbiAgICAgIGxldCBib2R5OiBhbnl8bnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIFdoZXRoZXIgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGhhcyBiZWVuIGNhbGxlZC5cbiAgICAgIGxldCBmaW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGNhbmNlbGxlZCAoYW5kIHRodXMgYW55IG90aGVyIGNhbGxiYWNrcylcbiAgICAgIC8vIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgICAgbGV0IGNhbmNlbGxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAvLyBTZXQgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGluIHRoaXMuY2FsbGJhY2tNYXAgKHdoaWNoIHdpbGwgYmUgdGhlIHdpbmRvd1xuICAgICAgLy8gb2JqZWN0IGluIHRoZSBicm93c2VyLiBUaGUgc2NyaXB0IGJlaW5nIGxvYWRlZCB2aWEgdGhlIDxzY3JpcHQ+IHRhZyB3aWxsXG4gICAgICAvLyBldmVudHVhbGx5IGNhbGwgdGhpcyBjYWxsYmFjay5cbiAgICAgIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdID0gKGRhdGE/OiBhbnkpID0+IHtcbiAgICAgICAgLy8gRGF0YSBoYXMgYmVlbiByZWNlaXZlZCBmcm9tIHRoZSBKU09OUCBzY3JpcHQuIEZpcnN0bHksIGRlbGV0ZSB0aGlzIGNhbGxiYWNrLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG5cbiAgICAgICAgLy8gTmV4dCwgbWFrZSBzdXJlIHRoZSByZXF1ZXN0IHdhc24ndCBjYW5jZWxsZWQgaW4gdGhlIG1lYW50aW1lLlxuICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHN0YXRlIHRvIGluZGljYXRlIGRhdGEgd2FzIHJlY2VpdmVkLlxuICAgICAgICBib2R5ID0gZGF0YTtcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgfTtcblxuICAgICAgLy8gY2xlYW51cCgpIGlzIGEgdXRpbGl0eSBjbG9zdXJlIHRoYXQgcmVtb3ZlcyB0aGUgPHNjcmlwdD4gZnJvbSB0aGUgcGFnZSBhbmRcbiAgICAgIC8vIHRoZSByZXNwb25zZSBjYWxsYmFjayBmcm9tIHRoZSB3aW5kb3cuIFRoaXMgbG9naWMgaXMgdXNlZCBpbiBib3RoIHRoZVxuICAgICAgLy8gc3VjY2VzcywgZXJyb3IsIGFuZCBjYW5jZWxsYXRpb24gcGF0aHMsIHNvIGl0J3MgZXh0cmFjdGVkIG91dCBmb3IgY29udmVuaWVuY2UuXG4gICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xuICAgICAgICAvLyBSZW1vdmUgdGhlIDxzY3JpcHQ+IHRhZyBpZiBpdCdzIHN0aWxsIG9uIHRoZSBwYWdlLlxuICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSByZXNwb25zZSBjYWxsYmFjayBmcm9tIHRoZSBjYWxsYmFja01hcCAod2luZG93IG9iamVjdCBpbiB0aGVcbiAgICAgICAgLy8gYnJvd3NlcikuXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXTtcbiAgICAgIH07XG5cbiAgICAgIC8vIG9uTG9hZCgpIGlzIHRoZSBzdWNjZXNzIGNhbGxiYWNrIHdoaWNoIHJ1bnMgYWZ0ZXIgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAvLyBpZiB0aGUgSlNPTlAgc2NyaXB0IGxvYWRzIHN1Y2Nlc3NmdWxseS4gVGhlIGV2ZW50IGl0c2VsZiBpcyB1bmltcG9ydGFudC5cbiAgICAgIC8vIElmIHNvbWV0aGluZyB3ZW50IHdyb25nLCBvbkxvYWQoKSBtYXkgcnVuIHdpdGhvdXQgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAvLyBoYXZpbmcgYmVlbiBpbnZva2VkLlxuICAgICAgY29uc3Qgb25Mb2FkID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGNhbmNlbGxlZC5cbiAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFudXAgdGhlIHBhZ2UuXG4gICAgICAgIGNsZWFudXAoKTtcblxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgcnVuLlxuICAgICAgICBpZiAoIWZpbmlzaGVkKSB7XG4gICAgICAgICAgLy8gSXQgaGFzbid0LCBzb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSByZXF1ZXN0LiBSZXR1cm4gYW4gZXJyb3IgdmlhXG4gICAgICAgICAgLy8gdGhlIE9ic2VydmFibGUgZXJyb3IgcGF0aC4gQWxsIEpTT05QIGVycm9ycyBoYXZlIHN0YXR1cyAwLlxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLFxuICAgICAgICAgICAgZXJyb3I6IG5ldyBFcnJvcihKU09OUF9FUlJfTk9fQ0FMTEJBQ0spLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdWNjZXNzLiBib2R5IGVpdGhlciBjb250YWlucyB0aGUgcmVzcG9uc2UgYm9keSBvciBudWxsIGlmIG5vbmUgd2FzXG4gICAgICAgIC8vIHJldHVybmVkLlxuICAgICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgIGJvZHksXG4gICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogJ09LJywgdXJsLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gQ29tcGxldGUgdGhlIHN0cmVhbSwgdGhlIHJlc3BvbnNlIGlzIG92ZXIuXG4gICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkVycm9yKCkgaXMgdGhlIGVycm9yIGNhbGxiYWNrLCB3aGljaCBydW5zIGlmIHRoZSBzY3JpcHQgcmV0dXJuZWQgZ2VuZXJhdGVzXG4gICAgICAvLyBhIEphdmFzY3JpcHQgZXJyb3IuIEl0IGVtaXRzIHRoZSBlcnJvciB2aWEgdGhlIE9ic2VydmFibGUgZXJyb3IgY2hhbm5lbCBhc1xuICAgICAgLy8gYSBIdHRwRXJyb3JSZXNwb25zZS5cbiAgICAgIGNvbnN0IG9uRXJyb3I6IGFueSA9IChlcnJvcjogRXJyb3IpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3Qgd2FzIGFscmVhZHkgY2FuY2VsbGVkLCBubyBuZWVkIHRvIGVtaXQgYW55dGhpbmcuXG4gICAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2xlYW51cCgpO1xuXG4gICAgICAgIC8vIFdyYXAgdGhlIGVycm9yIGluIGEgSHR0cEVycm9yUmVzcG9uc2UuXG4gICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6ICdKU09OUCBFcnJvcicsIHVybCxcbiAgICAgICAgfSkpO1xuICAgICAgfTtcblxuICAgICAgLy8gU3Vic2NyaWJlIHRvIGJvdGggdGhlIHN1Y2Nlc3MgKGxvYWQpIGFuZCBlcnJvciBldmVudHMgb24gdGhlIDxzY3JpcHQ+IHRhZyxcbiAgICAgIC8vIGFuZCBhZGQgaXQgdG8gdGhlIHBhZ2UuXG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgdGhpcy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBoYXMgbm93IGJlZW4gc3VjY2Vzc2Z1bGx5IHNlbnQuXG4gICAgICBvYnNlcnZlci5uZXh0KHt0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnR9KTtcblxuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBUcmFjayB0aGUgY2FuY2VsbGF0aW9uIHNvIGV2ZW50IGxpc3RlbmVycyB3b24ndCBkbyBhbnl0aGluZyBldmVuIGlmIGFscmVhZHkgc2NoZWR1bGVkLlxuICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJzIHNvIHRoZXkgd29uJ3QgcnVuIGlmIHRoZSBldmVudHMgbGF0ZXIgZmlyZS5cbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuXG4gICAgICAgIC8vIEFuZCBmaW5hbGx5LCBjbGVhbiB1cCB0aGUgcGFnZS5cbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGBIdHRwSW50ZXJjZXB0b3JgIHdoaWNoIGlkZW50aWZpZXMgcmVxdWVzdHMgd2l0aCB0aGUgbWV0aG9kIEpTT05QIGFuZFxuICogc2hpZnRzIHRoZW0gdG8gdGhlIGBKc29ucENsaWVudEJhY2tlbmRgLlxuICpcbiAqXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBqc29ucDogSnNvbnBDbGllbnRCYWNrZW5kKSB7fVxuXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmIChyZXEubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICByZXR1cm4gdGhpcy5qc29ucC5oYW5kbGUocmVxIGFzIEh0dHBSZXF1ZXN0PG5ldmVyPik7XG4gICAgfVxuICAgIC8vIEZhbGwgdGhyb3VnaCBmb3Igbm9ybWFsIEhUVFAgcmVxdWVzdHMuXG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XG4gIH1cbn1cbiJdfQ==