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
/**
 * When a pending <script> is unsubscribed we'll move it to this document, so it won't be
 * executed.
 */
let foreignDocument;
// Error text given when a JSONP script is injected, but doesn't invoke the callback
// passed in its URL.
export const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
// Error text given when a request is passed to the JsonpClientBackend that doesn't
// have a request method JSONP.
export const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
export const JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';
// Error text given when a request is passed to the JsonpClientBackend that has
// headers set
export const JSONP_ERR_HEADERS_NOT_SUPPORTED = 'JSONP requests do not support headers.';
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
        // Check the request headers. JSONP doesn't support headers and
        // cannot set any that were supplied.
        if (req.headers.keys().length > 0) {
            throw new Error(JSONP_ERR_HEADERS_NOT_SUPPORTED);
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
            // Set the response callback in this.callbackMap (which will be the window
            // object in the browser. The script being loaded via the <script> tag will
            // eventually call this callback.
            this.callbackMap[callback] = (data) => {
                // Data has been received from the JSONP script. Firstly, delete this callback.
                delete this.callbackMap[callback];
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
                if (!finished) {
                    this.removeListeners(node);
                }
                // And finally, clean up the page.
                cleanup();
            };
        });
    }
    removeListeners(script) {
        // Issue #34818
        // Changing <script>'s ownerDocument will prevent it from execution.
        // https://html.spec.whatwg.org/multipage/scripting.html#execute-the-script-block
        if (!foreignDocument) {
            foreignDocument = this.document.implementation.createHTMLDocument();
        }
        foreignDocument.adoptNode(script);
    }
}
JsonpClientBackend.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13+30.sha-aa966fd", ngImport: i0, type: JsonpClientBackend, deps: [{ token: JsonpCallbackContext }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
JsonpClientBackend.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.13+30.sha-aa966fd", ngImport: i0, type: JsonpClientBackend });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13+30.sha-aa966fd", ngImport: i0, type: JsonpClientBackend, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: JsonpCallbackContext }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
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
JsonpInterceptor.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13+30.sha-aa966fd", ngImport: i0, type: JsonpInterceptor, deps: [{ token: JsonpClientBackend }], target: i0.ɵɵFactoryTarget.Injectable });
JsonpInterceptor.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.13+30.sha-aa966fd", ngImport: i0, type: JsonpInterceptor });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13+30.sha-aa966fd", ngImport: i0, type: JsonpInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: JsonpClientBackend }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFJMUMsT0FBTyxFQUFDLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxZQUFZLEVBQWlCLE1BQU0sWUFBWSxDQUFDOztBQUdyRyxrRkFBa0Y7QUFDbEYsa0ZBQWtGO0FBQ2xGLGtGQUFrRjtBQUNsRixnREFBZ0Q7QUFDaEQsSUFBSSxhQUFhLEdBQVcsQ0FBQyxDQUFDO0FBRTlCOzs7R0FHRztBQUNILElBQUksZUFBbUMsQ0FBQztBQUV4QyxvRkFBb0Y7QUFDcEYscUJBQXFCO0FBQ3JCLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLGdEQUFnRCxDQUFDO0FBRXRGLG1GQUFtRjtBQUNuRiwrQkFBK0I7QUFDL0IsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsK0NBQStDLENBQUM7QUFDdEYsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsNkNBQTZDLENBQUM7QUFFM0YsK0VBQStFO0FBQy9FLGNBQWM7QUFDZCxNQUFNLENBQUMsTUFBTSwrQkFBK0IsR0FBRyx3Q0FBd0MsQ0FBQztBQUV4Rjs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQWdCLG9CQUFvQjtDQUV6QztBQUVEOzs7Ozs7O0dBT0c7QUFFSCxNQUFNLE9BQU8sa0JBQWtCO0lBTTdCLFlBQW9CLFdBQWlDLEVBQTRCLFFBQWE7UUFBMUUsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1FBQTRCLGFBQVEsR0FBUixRQUFRLENBQUs7UUFMOUY7O1dB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a0Isa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwUmVzcG9uc2UsIEh0dHBTdGF0dXNDb2RlfSBmcm9tICcuL3Jlc3BvbnNlJztcblxuXG4vLyBFdmVyeSByZXF1ZXN0IG1hZGUgdGhyb3VnaCBKU09OUCBuZWVkcyBhIGNhbGxiYWNrIG5hbWUgdGhhdCdzIHVuaXF1ZSBhY3Jvc3MgdGhlXG4vLyB3aG9sZSBwYWdlLiBFYWNoIHJlcXVlc3QgaXMgYXNzaWduZWQgYW4gaWQgYW5kIHRoZSBjYWxsYmFjayBuYW1lIGlzIGNvbnN0cnVjdGVkXG4vLyBmcm9tIHRoYXQuIFRoZSBuZXh0IGlkIHRvIGJlIGFzc2lnbmVkIGlzIHRyYWNrZWQgaW4gYSBnbG9iYWwgdmFyaWFibGUgaGVyZSB0aGF0XG4vLyBpcyBzaGFyZWQgYW1vbmcgYWxsIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS5cbmxldCBuZXh0UmVxdWVzdElkOiBudW1iZXIgPSAwO1xuXG4vKipcbiAqIFdoZW4gYSBwZW5kaW5nIDxzY3JpcHQ+IGlzIHVuc3Vic2NyaWJlZCB3ZSdsbCBtb3ZlIGl0IHRvIHRoaXMgZG9jdW1lbnQsIHNvIGl0IHdvbid0IGJlXG4gKiBleGVjdXRlZC5cbiAqL1xubGV0IGZvcmVpZ25Eb2N1bWVudDogRG9jdW1lbnR8dW5kZWZpbmVkO1xuXG4vLyBFcnJvciB0ZXh0IGdpdmVuIHdoZW4gYSBKU09OUCBzY3JpcHQgaXMgaW5qZWN0ZWQsIGJ1dCBkb2Vzbid0IGludm9rZSB0aGUgY2FsbGJhY2tcbi8vIHBhc3NlZCBpbiBpdHMgVVJMLlxuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9OT19DQUxMQkFDSyA9ICdKU09OUCBpbmplY3RlZCBzY3JpcHQgZGlkIG5vdCBpbnZva2UgY2FsbGJhY2suJztcblxuLy8gRXJyb3IgdGV4dCBnaXZlbiB3aGVuIGEgcmVxdWVzdCBpcyBwYXNzZWQgdG8gdGhlIEpzb25wQ2xpZW50QmFja2VuZCB0aGF0IGRvZXNuJ3Rcbi8vIGhhdmUgYSByZXF1ZXN0IG1ldGhvZCBKU09OUC5cbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfV1JPTkdfTUVUSE9EID0gJ0pTT05QIHJlcXVlc3RzIG11c3QgdXNlIEpTT05QIHJlcXVlc3QgbWV0aG9kLic7XG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX1dST05HX1JFU1BPTlNFX1RZUEUgPSAnSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgSnNvbiByZXNwb25zZSB0eXBlLic7XG5cbi8vIEVycm9yIHRleHQgZ2l2ZW4gd2hlbiBhIHJlcXVlc3QgaXMgcGFzc2VkIHRvIHRoZSBKc29ucENsaWVudEJhY2tlbmQgdGhhdCBoYXNcbi8vIGhlYWRlcnMgc2V0XG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX0hFQURFUlNfTk9UX1NVUFBPUlRFRCA9ICdKU09OUCByZXF1ZXN0cyBkbyBub3Qgc3VwcG9ydCBoZWFkZXJzLic7XG5cbi8qKlxuICogREkgdG9rZW4vYWJzdHJhY3QgdHlwZSByZXByZXNlbnRpbmcgYSBtYXAgb2YgSlNPTlAgY2FsbGJhY2tzLlxuICpcbiAqIEluIHRoZSBicm93c2VyLCB0aGlzIHNob3VsZCBhbHdheXMgYmUgdGhlIGB3aW5kb3dgIG9iamVjdC5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSnNvbnBDYWxsYmFja0NvbnRleHQge1xuICBba2V5OiBzdHJpbmddOiAoZGF0YTogYW55KSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIFByb2Nlc3NlcyBhbiBgSHR0cFJlcXVlc3RgIHdpdGggdGhlIEpTT05QIG1ldGhvZCxcbiAqIGJ5IHBlcmZvcm1pbmcgSlNPTlAgc3R5bGUgcmVxdWVzdHMuXG4gKiBAc2VlIGBIdHRwSGFuZGxlcmBcbiAqIEBzZWUgYEh0dHBYaHJCYWNrZW5kYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25wQ2xpZW50QmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgLyoqXG4gICAqIEEgcmVzb2x2ZWQgcHJvbWlzZSB0aGF0IGNhbiBiZSB1c2VkIHRvIHNjaGVkdWxlIG1pY3JvdGFza3MgaW4gdGhlIGV2ZW50IGhhbmRsZXJzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSByZXNvbHZlZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbGxiYWNrTWFwOiBKc29ucENhbGxiYWNrQ29udGV4dCwgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2N1bWVudDogYW55KSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5hbWUgb2YgdGhlIG5leHQgY2FsbGJhY2sgbWV0aG9kLCBieSBpbmNyZW1lbnRpbmcgdGhlIGdsb2JhbCBgbmV4dFJlcXVlc3RJZGAuXG4gICAqL1xuICBwcml2YXRlIG5leHRDYWxsYmFjaygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbmdfanNvbnBfY2FsbGJhY2tfJHtuZXh0UmVxdWVzdElkKyt9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgYSBKU09OUCByZXF1ZXN0IGFuZCByZXR1cm5zIGFuIGV2ZW50IHN0cmVhbSBvZiB0aGUgcmVzdWx0cy5cbiAgICogQHBhcmFtIHJlcSBUaGUgcmVxdWVzdCBvYmplY3QuXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIHJlc3BvbnNlIGV2ZW50cy5cbiAgICpcbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PG5ldmVyPik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBGaXJzdGx5LCBjaGVjayBib3RoIHRoZSBtZXRob2QgYW5kIHJlc3BvbnNlIHR5cGUuIElmIGVpdGhlciBkb2Vzbid0IG1hdGNoXG4gICAgLy8gdGhlbiB0aGUgcmVxdWVzdCB3YXMgaW1wcm9wZXJseSByb3V0ZWQgaGVyZSBhbmQgY2Fubm90IGJlIGhhbmRsZWQuXG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdKU09OUCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfTUVUSE9EKTtcbiAgICB9IGVsc2UgaWYgKHJlcS5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgcmVxdWVzdCBoZWFkZXJzLiBKU09OUCBkb2Vzbid0IHN1cHBvcnQgaGVhZGVycyBhbmRcbiAgICAvLyBjYW5ub3Qgc2V0IGFueSB0aGF0IHdlcmUgc3VwcGxpZWQuXG4gICAgaWYgKHJlcS5oZWFkZXJzLmtleXMoKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTlBfRVJSX0hFQURFUlNfTk9UX1NVUFBPUlRFRCk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBlbHNlIGhhcHBlbnMgaW5zaWRlIHRoZSBPYnNlcnZhYmxlIGJvdW5kYXJ5LlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4oKG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pID0+IHtcbiAgICAgIC8vIFRoZSBmaXJzdCBzdGVwIHRvIG1ha2UgYSByZXF1ZXN0IGlzIHRvIGdlbmVyYXRlIHRoZSBjYWxsYmFjayBuYW1lLCBhbmQgcmVwbGFjZSB0aGVcbiAgICAgIC8vIGNhbGxiYWNrIHBsYWNlaG9sZGVyIGluIHRoZSBVUkwgd2l0aCB0aGUgbmFtZS4gQ2FyZSBoYXMgdG8gYmUgdGFrZW4gaGVyZSB0byBlbnN1cmVcbiAgICAgIC8vIGEgdHJhaWxpbmcgJiwgaWYgbWF0Y2hlZCwgZ2V0cyBpbnNlcnRlZCBiYWNrIGludG8gdGhlIFVSTCBpbiB0aGUgY29ycmVjdCBwbGFjZS5cbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5uZXh0Q2FsbGJhY2soKTtcbiAgICAgIGNvbnN0IHVybCA9IHJlcS51cmxXaXRoUGFyYW1zLnJlcGxhY2UoLz1KU09OUF9DQUxMQkFDSygmfCQpLywgYD0ke2NhbGxiYWNrfSQxYCk7XG5cbiAgICAgIC8vIENvbnN0cnVjdCB0aGUgPHNjcmlwdD4gdGFnIGFuZCBwb2ludCBpdCBhdCB0aGUgVVJMLlxuICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBub2RlLnNyYyA9IHVybDtcblxuICAgICAgLy8gQSBKU09OUCByZXF1ZXN0IHJlcXVpcmVzIHdhaXRpbmcgZm9yIG11bHRpcGxlIGNhbGxiYWNrcy4gVGhlc2UgdmFyaWFibGVzXG4gICAgICAvLyBhcmUgY2xvc2VkIG92ZXIgYW5kIHRyYWNrIHN0YXRlIGFjcm9zcyB0aG9zZSBjYWxsYmFja3MuXG5cbiAgICAgIC8vIFRoZSByZXNwb25zZSBvYmplY3QsIGlmIG9uZSBoYXMgYmVlbiByZWNlaXZlZCwgb3IgbnVsbCBvdGhlcndpc2UuXG4gICAgICBsZXQgYm9keTogYW55fG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgYmVlbiBjYWxsZWQuXG4gICAgICBsZXQgZmluaXNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gU2V0IHRoZSByZXNwb25zZSBjYWxsYmFjayBpbiB0aGlzLmNhbGxiYWNrTWFwICh3aGljaCB3aWxsIGJlIHRoZSB3aW5kb3dcbiAgICAgIC8vIG9iamVjdCBpbiB0aGUgYnJvd3Nlci4gVGhlIHNjcmlwdCBiZWluZyBsb2FkZWQgdmlhIHRoZSA8c2NyaXB0PiB0YWcgd2lsbFxuICAgICAgLy8gZXZlbnR1YWxseSBjYWxsIHRoaXMgY2FsbGJhY2suXG4gICAgICB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXSA9IChkYXRhPzogYW55KSA9PiB7XG4gICAgICAgIC8vIERhdGEgaGFzIGJlZW4gcmVjZWl2ZWQgZnJvbSB0aGUgSlNPTlAgc2NyaXB0LiBGaXJzdGx5LCBkZWxldGUgdGhpcyBjYWxsYmFjay5cbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdO1xuXG4gICAgICAgIC8vIFNldCBzdGF0ZSB0byBpbmRpY2F0ZSBkYXRhIHdhcyByZWNlaXZlZC5cbiAgICAgICAgYm9keSA9IGRhdGE7XG4gICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIGNsZWFudXAoKSBpcyBhIHV0aWxpdHkgY2xvc3VyZSB0aGF0IHJlbW92ZXMgdGhlIDxzY3JpcHQ+IGZyb20gdGhlIHBhZ2UgYW5kXG4gICAgICAvLyB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgd2luZG93LiBUaGlzIGxvZ2ljIGlzIHVzZWQgaW4gYm90aCB0aGVcbiAgICAgIC8vIHN1Y2Nlc3MsIGVycm9yLCBhbmQgY2FuY2VsbGF0aW9uIHBhdGhzLCBzbyBpdCdzIGV4dHJhY3RlZCBvdXQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSA8c2NyaXB0PiB0YWcgaWYgaXQncyBzdGlsbCBvbiB0aGUgcGFnZS5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgY2FsbGJhY2tNYXAgKHdpbmRvdyBvYmplY3QgaW4gdGhlXG4gICAgICAgIC8vIGJyb3dzZXIpLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkxvYWQoKSBpcyB0aGUgc3VjY2VzcyBjYWxsYmFjayB3aGljaCBydW5zIGFmdGVyIHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaWYgdGhlIEpTT05QIHNjcmlwdCBsb2FkcyBzdWNjZXNzZnVsbHkuIFRoZSBldmVudCBpdHNlbGYgaXMgdW5pbXBvcnRhbnQuXG4gICAgICAvLyBJZiBzb21ldGhpbmcgd2VudCB3cm9uZywgb25Mb2FkKCkgbWF5IHJ1biB3aXRob3V0IHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaGF2aW5nIGJlZW4gaW52b2tlZC5cbiAgICAgIGNvbnN0IG9uTG9hZCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgLy8gV2Ugd3JhcCBpdCBpbiBhbiBleHRyYSBQcm9taXNlLCB0byBlbnN1cmUgdGhlIG1pY3JvdGFza1xuICAgICAgICAvLyBpcyBzY2hlZHVsZWQgYWZ0ZXIgdGhlIGxvYWRlZCBlbmRwb2ludCBoYXMgZXhlY3V0ZWQgYW55IHBvdGVudGlhbCBtaWNyb3Rhc2sgaXRzZWxmLFxuICAgICAgICAvLyB3aGljaCBpcyBub3QgZ3VhcmFudGVlZCBpbiBJbnRlcm5ldCBFeHBsb3JlciBhbmQgRWRnZUhUTUwuIFNlZSBpc3N1ZSAjMzk0OTZcbiAgICAgICAgdGhpcy5yZXNvbHZlZFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gQ2xlYW51cCB0aGUgcGFnZS5cbiAgICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgcnVuLlxuICAgICAgICAgIGlmICghZmluaXNoZWQpIHtcbiAgICAgICAgICAgIC8vIEl0IGhhc24ndCwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgcmVxdWVzdC4gUmV0dXJuIGFuIGVycm9yIHZpYVxuICAgICAgICAgICAgLy8gdGhlIE9ic2VydmFibGUgZXJyb3IgcGF0aC4gQWxsIEpTT05QIGVycm9ycyBoYXZlIHN0YXR1cyAwLlxuICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgICAgICAgIHN0YXR1c1RleHQ6ICdKU09OUCBFcnJvcicsXG4gICAgICAgICAgICAgIGVycm9yOiBuZXcgRXJyb3IoSlNPTlBfRVJSX05PX0NBTExCQUNLKSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTdWNjZXNzLiBib2R5IGVpdGhlciBjb250YWlucyB0aGUgcmVzcG9uc2UgYm9keSBvciBudWxsIGlmIG5vbmUgd2FzXG4gICAgICAgICAgLy8gcmV0dXJuZWQuXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBzdGF0dXM6IEh0dHBTdGF0dXNDb2RlLk9rLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogJ09LJyxcbiAgICAgICAgICAgIHVybCxcbiAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAvLyBDb21wbGV0ZSB0aGUgc3RyZWFtLCB0aGUgcmVzcG9uc2UgaXMgb3Zlci5cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIC8vIG9uRXJyb3IoKSBpcyB0aGUgZXJyb3IgY2FsbGJhY2ssIHdoaWNoIHJ1bnMgaWYgdGhlIHNjcmlwdCByZXR1cm5lZCBnZW5lcmF0ZXNcbiAgICAgIC8vIGEgSmF2YXNjcmlwdCBlcnJvci4gSXQgZW1pdHMgdGhlIGVycm9yIHZpYSB0aGUgT2JzZXJ2YWJsZSBlcnJvciBjaGFubmVsIGFzXG4gICAgICAvLyBhIEh0dHBFcnJvclJlc3BvbnNlLlxuICAgICAgY29uc3Qgb25FcnJvcjogYW55ID0gKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgLy8gV3JhcCB0aGUgZXJyb3IgaW4gYSBIdHRwRXJyb3JSZXNwb25zZS5cbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogJ0pTT05QIEVycm9yJyxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0pKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN1YnNjcmliZSB0byBib3RoIHRoZSBzdWNjZXNzIChsb2FkKSBhbmQgZXJyb3IgZXZlbnRzIG9uIHRoZSA8c2NyaXB0PiB0YWcsXG4gICAgICAvLyBhbmQgYWRkIGl0IHRvIHRoZSBwYWdlLlxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgIHRoaXMuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaGFzIG5vdyBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50LlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKCFmaW5pc2hlZCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQW5kIGZpbmFsbHksIGNsZWFuIHVwIHRoZSBwYWdlLlxuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVMaXN0ZW5lcnMoc2NyaXB0OiBIVE1MU2NyaXB0RWxlbWVudCk6IHZvaWQge1xuICAgIC8vIElzc3VlICMzNDgxOFxuICAgIC8vIENoYW5naW5nIDxzY3JpcHQ+J3Mgb3duZXJEb2N1bWVudCB3aWxsIHByZXZlbnQgaXQgZnJvbSBleGVjdXRpb24uXG4gICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc2NyaXB0aW5nLmh0bWwjZXhlY3V0ZS10aGUtc2NyaXB0LWJsb2NrXG4gICAgaWYgKCFmb3JlaWduRG9jdW1lbnQpIHtcbiAgICAgIGZvcmVpZ25Eb2N1bWVudCA9ICh0aGlzLmRvY3VtZW50LmltcGxlbWVudGF0aW9uIGFzIERPTUltcGxlbWVudGF0aW9uKS5jcmVhdGVIVE1MRG9jdW1lbnQoKTtcbiAgICB9XG4gICAgZm9yZWlnbkRvY3VtZW50LmFkb3B0Tm9kZShzY3JpcHQpO1xuICB9XG59XG5cbi8qKlxuICogSWRlbnRpZmllcyByZXF1ZXN0cyB3aXRoIHRoZSBtZXRob2QgSlNPTlAgYW5kXG4gKiBzaGlmdHMgdGhlbSB0byB0aGUgYEpzb25wQ2xpZW50QmFja2VuZGAuXG4gKlxuICogQHNlZSBgSHR0cEludGVyY2VwdG9yYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25wSW50ZXJjZXB0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGpzb25wOiBKc29ucENsaWVudEJhY2tlbmQpIHt9XG5cbiAgLyoqXG4gICAqIElkZW50aWZpZXMgYW5kIGhhbmRsZXMgYSBnaXZlbiBKU09OUCByZXF1ZXN0LlxuICAgKiBAcGFyYW0gcmVxIFRoZSBvdXRnb2luZyByZXF1ZXN0IG9iamVjdCB0byBoYW5kbGUuXG4gICAqIEBwYXJhbSBuZXh0IFRoZSBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgb3IgdGhlIGJhY2tlbmRcbiAgICogaWYgbm8gaW50ZXJjZXB0b3JzIHJlbWFpbiBpbiB0aGUgY2hhaW4uXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIGV2ZW50IHN0cmVhbS5cbiAgICovXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmIChyZXEubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICByZXR1cm4gdGhpcy5qc29ucC5oYW5kbGUocmVxIGFzIEh0dHBSZXF1ZXN0PG5ldmVyPik7XG4gICAgfVxuICAgIC8vIEZhbGwgdGhyb3VnaCBmb3Igbm9ybWFsIEhUVFAgcmVxdWVzdHMuXG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XG4gIH1cbn1cbiJdfQ==