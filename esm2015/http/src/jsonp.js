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
import * as i0 from "@angular/core";
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
export class JsonpClientBackend {
    constructor(callbackMap, document) {
        this.callbackMap = callbackMap;
        this.document = document;
        /**
         * A resolved promise that can be used to schedule microtasks in the event handlers.
         */
        this.resolvedPromise = Promise.resolve();
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
                // We wrap it in an extra Promise, to ensure the microtask
                // is scheduled after the loaded endpoint has executed any potential microtask itself,
                // which is not guaranteed in Internet Explorer and EdgeHTML. See issue #39496
                this.resolvedPromise.then(() => {
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
                        status: 200 /* Ok */,
                        statusText: 'OK',
                        url,
                    }));
                    // Complete the stream, the response is over.
                    observer.complete();
                });
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
JsonpClientBackend.ɵfac = function JsonpClientBackend_Factory(t) { return new (t || JsonpClientBackend)(i0.ɵɵinject(JsonpCallbackContext), i0.ɵɵinject(DOCUMENT)); };
JsonpClientBackend.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: JsonpClientBackend, factory: JsonpClientBackend.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(JsonpClientBackend, [{
        type: Injectable
    }], function () { return [{ type: JsonpCallbackContext }, { type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }]; }, null); })();
/**
 * Identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * @see `HttpInterceptor`
 *
 * @publicApi
 */
export class JsonpInterceptor {
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
JsonpInterceptor.ɵfac = function JsonpInterceptor_Factory(t) { return new (t || JsonpInterceptor)(i0.ɵɵinject(JsonpClientBackend)); };
JsonpInterceptor.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: JsonpInterceptor, factory: JsonpInterceptor.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(JsonpInterceptor, [{
        type: Injectable
    }], function () { return [{ type: JsonpClientBackend }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFJMUMsT0FBTyxFQUFDLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxZQUFZLEVBQWlCLE1BQU0sWUFBWSxDQUFDOztBQUdyRyxrRkFBa0Y7QUFDbEYsa0ZBQWtGO0FBQ2xGLGtGQUFrRjtBQUNsRixnREFBZ0Q7QUFDaEQsSUFBSSxhQUFhLEdBQVcsQ0FBQyxDQUFDO0FBRTlCLG9GQUFvRjtBQUNwRixxQkFBcUI7QUFDckIsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsZ0RBQWdELENBQUM7QUFFdEYsbUZBQW1GO0FBQ25GLCtCQUErQjtBQUMvQixNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRywrQ0FBK0MsQ0FBQztBQUN0RixNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyw2Q0FBNkMsQ0FBQztBQUUzRjs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQWdCLG9CQUFvQjtDQUV6QztBQUVEOzs7Ozs7O0dBT0c7QUFFSCxNQUFNLE9BQU8sa0JBQWtCO0lBTTdCLFlBQW9CLFdBQWlDLEVBQTRCLFFBQWE7UUFBMUUsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1FBQTRCLGFBQVEsR0FBUixRQUFRLENBQUs7UUFMOUY7O1dBRUc7UUFDYyxvQkFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUU0QyxDQUFDO0lBRWxHOztPQUVHO0lBQ0ssWUFBWTtRQUNsQixPQUFPLHFCQUFxQixhQUFhLEVB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R0FBRyxFQUFFO2dCQUNWLHlGQUF5RjtnQkFDekYsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFFakIseUVBQXlFO2dCQUN6RSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUUzQyxrQ0FBa0M7Z0JBQ2xDLE9BQU8sRUFBRSxDQUFDO1lBQ1osQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOztvRkEzS1Usa0JBQWtCLGNBTUksb0JBQW9CLGVBQVUsUUFBUTt3RUFONUQsa0JBQWtCLFdBQWxCLGtCQUFrQjt1RkFBbEIsa0JBQWtCO2NBRDlCLFVBQVU7c0NBT3dCLG9CQUFvQjtzQkFBRyxNQUFNO3VCQUFDLFFBQVE7O0FBd0t6RTs7Ozs7OztHQU9HO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUFvQixLQUF5QjtRQUF6QixVQUFLLEdBQUwsS0FBSyxDQUFvQjtJQUFHLENBQUM7SUFFakQ7Ozs7OztPQU1HO0lBQ0gsU0FBUyxDQUFDLEdBQXFCLEVBQUUsSUFBaUI7UUFDaEQsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE9BQU8sRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQXlCLENBQUMsQ0FBQztTQUNyRDtRQUNELHlDQUF5QztRQUN6QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQzs7Z0ZBaEJVLGdCQUFnQixjQUNBLGtCQUFrQjtzRUFEbEMsZ0JBQWdCLFdBQWhCLGdCQUFnQjt1RkFBaEIsZ0JBQWdCO2NBRDVCLFVBQVU7c0NBRWtCLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cFJlc3BvbnNlLCBIdHRwU3RhdHVzQ29kZX0gZnJvbSAnLi9yZXNwb25zZSc7XG5cblxuLy8gRXZlcnkgcmVxdWVzdCBtYWRlIHRocm91Z2ggSlNPTlAgbmVlZHMgYSBjYWxsYmFjayBuYW1lIHRoYXQncyB1bmlxdWUgYWNyb3NzIHRoZVxuLy8gd2hvbGUgcGFnZS4gRWFjaCByZXF1ZXN0IGlzIGFzc2lnbmVkIGFuIGlkIGFuZCB0aGUgY2FsbGJhY2sgbmFtZSBpcyBjb25zdHJ1Y3RlZFxuLy8gZnJvbSB0aGF0LiBUaGUgbmV4dCBpZCB0byBiZSBhc3NpZ25lZCBpcyB0cmFja2VkIGluIGEgZ2xvYmFsIHZhcmlhYmxlIGhlcmUgdGhhdFxuLy8gaXMgc2hhcmVkIGFtb25nIGFsbCBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2UuXG5sZXQgbmV4dFJlcXVlc3RJZDogbnVtYmVyID0gMDtcblxuLy8gRXJyb3IgdGV4dCBnaXZlbiB3aGVuIGEgSlNPTlAgc2NyaXB0IGlzIGluamVjdGVkLCBidXQgZG9lc24ndCBpbnZva2UgdGhlIGNhbGxiYWNrXG4vLyBwYXNzZWQgaW4gaXRzIFVSTC5cbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfTk9fQ0FMTEJBQ0sgPSAnSlNPTlAgaW5qZWN0ZWQgc2NyaXB0IGRpZCBub3QgaW52b2tlIGNhbGxiYWNrLic7XG5cbi8vIEVycm9yIHRleHQgZ2l2ZW4gd2hlbiBhIHJlcXVlc3QgaXMgcGFzc2VkIHRvIHRoZSBKc29ucENsaWVudEJhY2tlbmQgdGhhdCBkb2Vzbid0XG4vLyBoYXZlIGEgcmVxdWVzdCBtZXRob2QgSlNPTlAuXG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX1dST05HX01FVEhPRCA9ICdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBKU09OUCByZXF1ZXN0IG1ldGhvZC4nO1xuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFID0gJ0pTT05QIHJlcXVlc3RzIG11c3QgdXNlIEpzb24gcmVzcG9uc2UgdHlwZS4nO1xuXG4vKipcbiAqIERJIHRva2VuL2Fic3RyYWN0IHR5cGUgcmVwcmVzZW50aW5nIGEgbWFwIG9mIEpTT05QIGNhbGxiYWNrcy5cbiAqXG4gKiBJbiB0aGUgYnJvd3NlciwgdGhpcyBzaG91bGQgYWx3YXlzIGJlIHRoZSBgd2luZG93YCBvYmplY3QuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpzb25wQ2FsbGJhY2tDb250ZXh0IHtcbiAgW2tleTogc3RyaW5nXTogKGRhdGE6IGFueSkgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBQcm9jZXNzZXMgYW4gYEh0dHBSZXF1ZXN0YCB3aXRoIHRoZSBKU09OUCBtZXRob2QsXG4gKiBieSBwZXJmb3JtaW5nIEpTT05QIHN0eWxlIHJlcXVlc3RzLlxuICogQHNlZSBgSHR0cEhhbmRsZXJgXG4gKiBAc2VlIGBIdHRwWGhyQmFja2VuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucENsaWVudEJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIC8qKlxuICAgKiBBIHJlc29sdmVkIHByb21pc2UgdGhhdCBjYW4gYmUgdXNlZCB0byBzY2hlZHVsZSBtaWNyb3Rhc2tzIGluIHRoZSBldmVudCBoYW5kbGVycy5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzb2x2ZWRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjYWxsYmFja01hcDogSnNvbnBDYWxsYmFja0NvbnRleHQsIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jdW1lbnQ6IGFueSkge31cblxuICAvKipcbiAgICogR2V0IHRoZSBuYW1lIG9mIHRoZSBuZXh0IGNhbGxiYWNrIG1ldGhvZCwgYnkgaW5jcmVtZW50aW5nIHRoZSBnbG9iYWwgYG5leHRSZXF1ZXN0SWRgLlxuICAgKi9cbiAgcHJpdmF0ZSBuZXh0Q2FsbGJhY2soKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG5nX2pzb25wX2NhbGxiYWNrXyR7bmV4dFJlcXVlc3RJZCsrfWA7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIGEgSlNPTlAgcmVxdWVzdCBhbmQgcmV0dXJucyBhbiBldmVudCBzdHJlYW0gb2YgdGhlIHJlc3VsdHMuXG4gICAqIEBwYXJhbSByZXEgVGhlIHJlcXVlc3Qgb2JqZWN0LlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSByZXNwb25zZSBldmVudHMuXG4gICAqXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxuZXZlcj4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gRmlyc3RseSwgY2hlY2sgYm90aCB0aGUgbWV0aG9kIGFuZCByZXNwb25zZSB0eXBlLiBJZiBlaXRoZXIgZG9lc24ndCBtYXRjaFxuICAgIC8vIHRoZW4gdGhlIHJlcXVlc3Qgd2FzIGltcHJvcGVybHkgcm91dGVkIGhlcmUgYW5kIGNhbm5vdCBiZSBoYW5kbGVkLlxuICAgIGlmIChyZXEubWV0aG9kICE9PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTlBfRVJSX1dST05HX01FVEhPRCk7XG4gICAgfSBlbHNlIGlmIChyZXEucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfUkVTUE9OU0VfVFlQRSk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBlbHNlIGhhcHBlbnMgaW5zaWRlIHRoZSBPYnNlcnZhYmxlIGJvdW5kYXJ5LlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4oKG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pID0+IHtcbiAgICAgIC8vIFRoZSBmaXJzdCBzdGVwIHRvIG1ha2UgYSByZXF1ZXN0IGlzIHRvIGdlbmVyYXRlIHRoZSBjYWxsYmFjayBuYW1lLCBhbmQgcmVwbGFjZSB0aGVcbiAgICAgIC8vIGNhbGxiYWNrIHBsYWNlaG9sZGVyIGluIHRoZSBVUkwgd2l0aCB0aGUgbmFtZS4gQ2FyZSBoYXMgdG8gYmUgdGFrZW4gaGVyZSB0byBlbnN1cmVcbiAgICAgIC8vIGEgdHJhaWxpbmcgJiwgaWYgbWF0Y2hlZCwgZ2V0cyBpbnNlcnRlZCBiYWNrIGludG8gdGhlIFVSTCBpbiB0aGUgY29ycmVjdCBwbGFjZS5cbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5uZXh0Q2FsbGJhY2soKTtcbiAgICAgIGNvbnN0IHVybCA9IHJlcS51cmxXaXRoUGFyYW1zLnJlcGxhY2UoLz1KU09OUF9DQUxMQkFDSygmfCQpLywgYD0ke2NhbGxiYWNrfSQxYCk7XG5cbiAgICAgIC8vIENvbnN0cnVjdCB0aGUgPHNjcmlwdD4gdGFnIGFuZCBwb2ludCBpdCBhdCB0aGUgVVJMLlxuICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBub2RlLnNyYyA9IHVybDtcblxuICAgICAgLy8gQSBKU09OUCByZXF1ZXN0IHJlcXVpcmVzIHdhaXRpbmcgZm9yIG11bHRpcGxlIGNhbGxiYWNrcy4gVGhlc2UgdmFyaWFibGVzXG4gICAgICAvLyBhcmUgY2xvc2VkIG92ZXIgYW5kIHRyYWNrIHN0YXRlIGFjcm9zcyB0aG9zZSBjYWxsYmFja3MuXG5cbiAgICAgIC8vIFRoZSByZXNwb25zZSBvYmplY3QsIGlmIG9uZSBoYXMgYmVlbiByZWNlaXZlZCwgb3IgbnVsbCBvdGhlcndpc2UuXG4gICAgICBsZXQgYm9keTogYW55fG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgYmVlbiBjYWxsZWQuXG4gICAgICBsZXQgZmluaXNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gV2hldGhlciB0aGUgcmVxdWVzdCBoYXMgYmVlbiBjYW5jZWxsZWQgKGFuZCB0aHVzIGFueSBvdGhlciBjYWxsYmFja3MpXG4gICAgICAvLyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICAgIGxldCBjYW5jZWxsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gU2V0IHRoZSByZXNwb25zZSBjYWxsYmFjayBpbiB0aGlzLmNhbGxiYWNrTWFwICh3aGljaCB3aWxsIGJlIHRoZSB3aW5kb3dcbiAgICAgIC8vIG9iamVjdCBpbiB0aGUgYnJvd3Nlci4gVGhlIHNjcmlwdCBiZWluZyBsb2FkZWQgdmlhIHRoZSA8c2NyaXB0PiB0YWcgd2lsbFxuICAgICAgLy8gZXZlbnR1YWxseSBjYWxsIHRoaXMgY2FsbGJhY2suXG4gICAgICB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXSA9IChkYXRhPzogYW55KSA9PiB7XG4gICAgICAgIC8vIERhdGEgaGFzIGJlZW4gcmVjZWl2ZWQgZnJvbSB0aGUgSlNPTlAgc2NyaXB0LiBGaXJzdGx5LCBkZWxldGUgdGhpcyBjYWxsYmFjay5cbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdO1xuXG4gICAgICAgIC8vIE5leHQsIG1ha2Ugc3VyZSB0aGUgcmVxdWVzdCB3YXNuJ3QgY2FuY2VsbGVkIGluIHRoZSBtZWFudGltZS5cbiAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBzdGF0ZSB0byBpbmRpY2F0ZSBkYXRhIHdhcyByZWNlaXZlZC5cbiAgICAgICAgYm9keSA9IGRhdGE7XG4gICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIGNsZWFudXAoKSBpcyBhIHV0aWxpdHkgY2xvc3VyZSB0aGF0IHJlbW92ZXMgdGhlIDxzY3JpcHQ+IGZyb20gdGhlIHBhZ2UgYW5kXG4gICAgICAvLyB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgd2luZG93LiBUaGlzIGxvZ2ljIGlzIHVzZWQgaW4gYm90aCB0aGVcbiAgICAgIC8vIHN1Y2Nlc3MsIGVycm9yLCBhbmQgY2FuY2VsbGF0aW9uIHBhdGhzLCBzbyBpdCdzIGV4dHJhY3RlZCBvdXQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSA8c2NyaXB0PiB0YWcgaWYgaXQncyBzdGlsbCBvbiB0aGUgcGFnZS5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgY2FsbGJhY2tNYXAgKHdpbmRvdyBvYmplY3QgaW4gdGhlXG4gICAgICAgIC8vIGJyb3dzZXIpLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkxvYWQoKSBpcyB0aGUgc3VjY2VzcyBjYWxsYmFjayB3aGljaCBydW5zIGFmdGVyIHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaWYgdGhlIEpTT05QIHNjcmlwdCBsb2FkcyBzdWNjZXNzZnVsbHkuIFRoZSBldmVudCBpdHNlbGYgaXMgdW5pbXBvcnRhbnQuXG4gICAgICAvLyBJZiBzb21ldGhpbmcgd2VudCB3cm9uZywgb25Mb2FkKCkgbWF5IHJ1biB3aXRob3V0IHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaGF2aW5nIGJlZW4gaW52b2tlZC5cbiAgICAgIGNvbnN0IG9uTG9hZCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiB0aGUgcmVxdWVzdCBoYXMgYmVlbiBjYW5jZWxsZWQuXG4gICAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSB3cmFwIGl0IGluIGFuIGV4dHJhIFByb21pc2UsIHRvIGVuc3VyZSB0aGUgbWljcm90YXNrXG4gICAgICAgIC8vIGlzIHNjaGVkdWxlZCBhZnRlciB0aGUgbG9hZGVkIGVuZHBvaW50IGhhcyBleGVjdXRlZCBhbnkgcG90ZW50aWFsIG1pY3JvdGFzayBpdHNlbGYsXG4gICAgICAgIC8vIHdoaWNoIGlzIG5vdCBndWFyYW50ZWVkIGluIEludGVybmV0IEV4cGxvcmVyIGFuZCBFZGdlSFRNTC4gU2VlIGlzc3VlICMzOTQ5NlxuICAgICAgICB0aGlzLnJlc29sdmVkUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAvLyBDbGVhbnVwIHRoZSBwYWdlLlxuICAgICAgICAgIGNsZWFudXAoKTtcblxuICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGhhcyBydW4uXG4gICAgICAgICAgaWYgKCFmaW5pc2hlZCkge1xuICAgICAgICAgICAgLy8gSXQgaGFzbid0LCBzb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSByZXF1ZXN0LiBSZXR1cm4gYW4gZXJyb3IgdmlhXG4gICAgICAgICAgICAvLyB0aGUgT2JzZXJ2YWJsZSBlcnJvciBwYXRoLiBBbGwgSlNPTlAgZXJyb3JzIGhhdmUgc3RhdHVzIDAuXG4gICAgICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgIHN0YXR1czogMCxcbiAgICAgICAgICAgICAgc3RhdHVzVGV4dDogJ0pTT05QIEVycm9yJyxcbiAgICAgICAgICAgICAgZXJyb3I6IG5ldyBFcnJvcihKU09OUF9FUlJfTk9fQ0FMTEJBQ0spLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFN1Y2Nlc3MuIGJvZHkgZWl0aGVyIGNvbnRhaW5zIHRoZSByZXNwb25zZSBib2R5IG9yIG51bGwgaWYgbm9uZSB3YXNcbiAgICAgICAgICAvLyByZXR1cm5lZC5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIHN0YXR1czogSHR0cFN0YXR1c0NvZGUuT2ssXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiAnT0snLFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgIH0pKTtcblxuICAgICAgICAgIC8vIENvbXBsZXRlIHRoZSBzdHJlYW0sIHRoZSByZXNwb25zZSBpcyBvdmVyLlxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgLy8gb25FcnJvcigpIGlzIHRoZSBlcnJvciBjYWxsYmFjaywgd2hpY2ggcnVucyBpZiB0aGUgc2NyaXB0IHJldHVybmVkIGdlbmVyYXRlc1xuICAgICAgLy8gYSBKYXZhc2NyaXB0IGVycm9yLiBJdCBlbWl0cyB0aGUgZXJyb3IgdmlhIHRoZSBPYnNlcnZhYmxlIGVycm9yIGNoYW5uZWwgYXNcbiAgICAgIC8vIGEgSHR0cEVycm9yUmVzcG9uc2UuXG4gICAgICBjb25zdCBvbkVycm9yOiBhbnkgPSAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBhbHJlYWR5IGNhbmNlbGxlZCwgbm8gbmVlZCB0byBlbWl0IGFueXRoaW5nLlxuICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNsZWFudXAoKTtcblxuICAgICAgICAvLyBXcmFwIHRoZSBlcnJvciBpbiBhIEh0dHBFcnJvclJlc3BvbnNlLlxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHN0YXR1czogMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSkpO1xuICAgICAgfTtcblxuICAgICAgLy8gU3Vic2NyaWJlIHRvIGJvdGggdGhlIHN1Y2Nlc3MgKGxvYWQpIGFuZCBlcnJvciBldmVudHMgb24gdGhlIDxzY3JpcHQ+IHRhZyxcbiAgICAgIC8vIGFuZCBhZGQgaXQgdG8gdGhlIHBhZ2UuXG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgdGhpcy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBoYXMgbm93IGJlZW4gc3VjY2Vzc2Z1bGx5IHNlbnQuXG4gICAgICBvYnNlcnZlci5uZXh0KHt0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnR9KTtcblxuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBUcmFjayB0aGUgY2FuY2VsbGF0aW9uIHNvIGV2ZW50IGxpc3RlbmVycyB3b24ndCBkbyBhbnl0aGluZyBldmVuIGlmIGFscmVhZHkgc2NoZWR1bGVkLlxuICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJzIHNvIHRoZXkgd29uJ3QgcnVuIGlmIHRoZSBldmVudHMgbGF0ZXIgZmlyZS5cbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuXG4gICAgICAgIC8vIEFuZCBmaW5hbGx5LCBjbGVhbiB1cCB0aGUgcGFnZS5cbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIElkZW50aWZpZXMgcmVxdWVzdHMgd2l0aCB0aGUgbWV0aG9kIEpTT05QIGFuZFxuICogc2hpZnRzIHRoZW0gdG8gdGhlIGBKc29ucENsaWVudEJhY2tlbmRgLlxuICpcbiAqIEBzZWUgYEh0dHBJbnRlcmNlcHRvcmBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBqc29ucDogSnNvbnBDbGllbnRCYWNrZW5kKSB7fVxuXG4gIC8qKlxuICAgKiBJZGVudGlmaWVzIGFuZCBoYW5kbGVzIGEgZ2l2ZW4gSlNPTlAgcmVxdWVzdC5cbiAgICogQHBhcmFtIHJlcSBUaGUgb3V0Z29pbmcgcmVxdWVzdCBvYmplY3QgdG8gaGFuZGxlLlxuICAgKiBAcGFyYW0gbmV4dCBUaGUgbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIG9yIHRoZSBiYWNrZW5kXG4gICAqIGlmIG5vIGludGVyY2VwdG9ycyByZW1haW4gaW4gdGhlIGNoYWluLlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSBldmVudCBzdHJlYW0uXG4gICAqL1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgcmV0dXJuIHRoaXMuanNvbnAuaGFuZGxlKHJlcSBhcyBIdHRwUmVxdWVzdDxuZXZlcj4pO1xuICAgIH1cbiAgICAvLyBGYWxsIHRocm91Z2ggZm9yIG5vcm1hbCBIVFRQIHJlcXVlc3RzLlxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICB9XG59XG4iXX0=