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
                        status: 200 /* HttpStatusCode.Ok */,
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
JsonpClientBackend.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.3+sha-1096ad2", ngImport: i0, type: JsonpClientBackend, deps: [{ token: JsonpCallbackContext }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
JsonpClientBackend.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.3+sha-1096ad2", ngImport: i0, type: JsonpClientBackend });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.3+sha-1096ad2", ngImport: i0, type: JsonpClientBackend, decorators: [{
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
JsonpInterceptor.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.3+sha-1096ad2", ngImport: i0, type: JsonpInterceptor, deps: [{ token: JsonpClientBackend }], target: i0.ɵɵFactoryTarget.Injectable });
JsonpInterceptor.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.3+sha-1096ad2", ngImport: i0, type: JsonpInterceptor });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.3+sha-1096ad2", ngImport: i0, type: JsonpInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: JsonpClientBackend }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFJMUMsT0FBTyxFQUFDLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxZQUFZLEVBQWlCLE1BQU0sWUFBWSxDQUFDOztBQUdyRyxrRkFBa0Y7QUFDbEYsa0ZBQWtGO0FBQ2xGLGtGQUFrRjtBQUNsRixnREFBZ0Q7QUFDaEQsSUFBSSxhQUFhLEdBQVcsQ0FBQyxDQUFDO0FBRTlCOzs7R0FHRztBQUNILElBQUksZUFBbUMsQ0FBQztBQUV4QyxvRkFBb0Y7QUFDcEYscUJBQXFCO0FBQ3JCLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLGdEQUFnRCxDQUFDO0FBRXRGLG1GQUFtRjtBQUNuRiwrQkFBK0I7QUFDL0IsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsK0NBQStDLENBQUM7QUFDdEYsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsNkNBQTZDLENBQUM7QUFFM0YsK0VBQStFO0FBQy9FLGNBQWM7QUFDZCxNQUFNLENBQUMsTUFBTSwrQkFBK0IsR0FBRyx3Q0FBd0MsQ0FBQztBQUV4Rjs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQWdCLG9CQUFvQjtDQUV6QztBQUVEOzs7Ozs7O0dBT0c7QUFFSCxNQUFNLE9BQU8sa0JBQWtCO0lBTTdCLFlBQW9CLFdBQWlDLEVBQTRCLFFBQWE7UUFBMUUsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1FBQTRCLGFBQVEsR0FBUixRQUFRLENBQUs7UUFMOUY7O1dB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RWtCLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cFJlc3BvbnNlLCBIdHRwU3RhdHVzQ29kZX0gZnJvbSAnLi9yZXNwb25zZSc7XG5cblxuLy8gRXZlcnkgcmVxdWVzdCBtYWRlIHRocm91Z2ggSlNPTlAgbmVlZHMgYSBjYWxsYmFjayBuYW1lIHRoYXQncyB1bmlxdWUgYWNyb3NzIHRoZVxuLy8gd2hvbGUgcGFnZS4gRWFjaCByZXF1ZXN0IGlzIGFzc2lnbmVkIGFuIGlkIGFuZCB0aGUgY2FsbGJhY2sgbmFtZSBpcyBjb25zdHJ1Y3RlZFxuLy8gZnJvbSB0aGF0LiBUaGUgbmV4dCBpZCB0byBiZSBhc3NpZ25lZCBpcyB0cmFja2VkIGluIGEgZ2xvYmFsIHZhcmlhYmxlIGhlcmUgdGhhdFxuLy8gaXMgc2hhcmVkIGFtb25nIGFsbCBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2UuXG5sZXQgbmV4dFJlcXVlc3RJZDogbnVtYmVyID0gMDtcblxuLyoqXG4gKiBXaGVuIGEgcGVuZGluZyA8c2NyaXB0PiBpcyB1bnN1YnNjcmliZWQgd2UnbGwgbW92ZSBpdCB0byB0aGlzIGRvY3VtZW50LCBzbyBpdCB3b24ndCBiZVxuICogZXhlY3V0ZWQuXG4gKi9cbmxldCBmb3JlaWduRG9jdW1lbnQ6IERvY3VtZW50fHVuZGVmaW5lZDtcblxuLy8gRXJyb3IgdGV4dCBnaXZlbiB3aGVuIGEgSlNPTlAgc2NyaXB0IGlzIGluamVjdGVkLCBidXQgZG9lc24ndCBpbnZva2UgdGhlIGNhbGxiYWNrXG4vLyBwYXNzZWQgaW4gaXRzIFVSTC5cbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfTk9fQ0FMTEJBQ0sgPSAnSlNPTlAgaW5qZWN0ZWQgc2NyaXB0IGRpZCBub3QgaW52b2tlIGNhbGxiYWNrLic7XG5cbi8vIEVycm9yIHRleHQgZ2l2ZW4gd2hlbiBhIHJlcXVlc3QgaXMgcGFzc2VkIHRvIHRoZSBKc29ucENsaWVudEJhY2tlbmQgdGhhdCBkb2Vzbid0XG4vLyBoYXZlIGEgcmVxdWVzdCBtZXRob2QgSlNPTlAuXG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX1dST05HX01FVEhPRCA9ICdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBKU09OUCByZXF1ZXN0IG1ldGhvZC4nO1xuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFID0gJ0pTT05QIHJlcXVlc3RzIG11c3QgdXNlIEpzb24gcmVzcG9uc2UgdHlwZS4nO1xuXG4vLyBFcnJvciB0ZXh0IGdpdmVuIHdoZW4gYSByZXF1ZXN0IGlzIHBhc3NlZCB0byB0aGUgSnNvbnBDbGllbnRCYWNrZW5kIHRoYXQgaGFzXG4vLyBoZWFkZXJzIHNldFxuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9IRUFERVJTX05PVF9TVVBQT1JURUQgPSAnSlNPTlAgcmVxdWVzdHMgZG8gbm90IHN1cHBvcnQgaGVhZGVycy4nO1xuXG4vKipcbiAqIERJIHRva2VuL2Fic3RyYWN0IHR5cGUgcmVwcmVzZW50aW5nIGEgbWFwIG9mIEpTT05QIGNhbGxiYWNrcy5cbiAqXG4gKiBJbiB0aGUgYnJvd3NlciwgdGhpcyBzaG91bGQgYWx3YXlzIGJlIHRoZSBgd2luZG93YCBvYmplY3QuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpzb25wQ2FsbGJhY2tDb250ZXh0IHtcbiAgW2tleTogc3RyaW5nXTogKGRhdGE6IGFueSkgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBQcm9jZXNzZXMgYW4gYEh0dHBSZXF1ZXN0YCB3aXRoIHRoZSBKU09OUCBtZXRob2QsXG4gKiBieSBwZXJmb3JtaW5nIEpTT05QIHN0eWxlIHJlcXVlc3RzLlxuICogQHNlZSBgSHR0cEhhbmRsZXJgXG4gKiBAc2VlIGBIdHRwWGhyQmFja2VuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucENsaWVudEJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIC8qKlxuICAgKiBBIHJlc29sdmVkIHByb21pc2UgdGhhdCBjYW4gYmUgdXNlZCB0byBzY2hlZHVsZSBtaWNyb3Rhc2tzIGluIHRoZSBldmVudCBoYW5kbGVycy5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzb2x2ZWRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjYWxsYmFja01hcDogSnNvbnBDYWxsYmFja0NvbnRleHQsIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jdW1lbnQ6IGFueSkge31cblxuICAvKipcbiAgICogR2V0IHRoZSBuYW1lIG9mIHRoZSBuZXh0IGNhbGxiYWNrIG1ldGhvZCwgYnkgaW5jcmVtZW50aW5nIHRoZSBnbG9iYWwgYG5leHRSZXF1ZXN0SWRgLlxuICAgKi9cbiAgcHJpdmF0ZSBuZXh0Q2FsbGJhY2soKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG5nX2pzb25wX2NhbGxiYWNrXyR7bmV4dFJlcXVlc3RJZCsrfWA7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIGEgSlNPTlAgcmVxdWVzdCBhbmQgcmV0dXJucyBhbiBldmVudCBzdHJlYW0gb2YgdGhlIHJlc3VsdHMuXG4gICAqIEBwYXJhbSByZXEgVGhlIHJlcXVlc3Qgb2JqZWN0LlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSByZXNwb25zZSBldmVudHMuXG4gICAqXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxuZXZlcj4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gRmlyc3RseSwgY2hlY2sgYm90aCB0aGUgbWV0aG9kIGFuZCByZXNwb25zZSB0eXBlLiBJZiBlaXRoZXIgZG9lc24ndCBtYXRjaFxuICAgIC8vIHRoZW4gdGhlIHJlcXVlc3Qgd2FzIGltcHJvcGVybHkgcm91dGVkIGhlcmUgYW5kIGNhbm5vdCBiZSBoYW5kbGVkLlxuICAgIGlmIChyZXEubWV0aG9kICE9PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTlBfRVJSX1dST05HX01FVEhPRCk7XG4gICAgfSBlbHNlIGlmIChyZXEucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfUkVTUE9OU0VfVFlQRSk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIHJlcXVlc3QgaGVhZGVycy4gSlNPTlAgZG9lc24ndCBzdXBwb3J0IGhlYWRlcnMgYW5kXG4gICAgLy8gY2Fubm90IHNldCBhbnkgdGhhdCB3ZXJlIHN1cHBsaWVkLlxuICAgIGlmIChyZXEuaGVhZGVycy5rZXlzKCkubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT05QX0VSUl9IRUFERVJTX05PVF9TVVBQT1JURUQpO1xuICAgIH1cblxuICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZSBoYXBwZW5zIGluc2lkZSB0aGUgT2JzZXJ2YWJsZSBib3VuZGFyeS5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+KChvYnNlcnZlcjogT2JzZXJ2ZXI8SHR0cEV2ZW50PGFueT4+KSA9PiB7XG4gICAgICAvLyBUaGUgZmlyc3Qgc3RlcCB0byBtYWtlIGEgcmVxdWVzdCBpcyB0byBnZW5lcmF0ZSB0aGUgY2FsbGJhY2sgbmFtZSwgYW5kIHJlcGxhY2UgdGhlXG4gICAgICAvLyBjYWxsYmFjayBwbGFjZWhvbGRlciBpbiB0aGUgVVJMIHdpdGggdGhlIG5hbWUuIENhcmUgaGFzIHRvIGJlIHRha2VuIGhlcmUgdG8gZW5zdXJlXG4gICAgICAvLyBhIHRyYWlsaW5nICYsIGlmIG1hdGNoZWQsIGdldHMgaW5zZXJ0ZWQgYmFjayBpbnRvIHRoZSBVUkwgaW4gdGhlIGNvcnJlY3QgcGxhY2UuXG4gICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMubmV4dENhbGxiYWNrKCk7XG4gICAgICBjb25zdCB1cmwgPSByZXEudXJsV2l0aFBhcmFtcy5yZXBsYWNlKC89SlNPTlBfQ0FMTEJBQ0soJnwkKS8sIGA9JHtjYWxsYmFja30kMWApO1xuXG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIDxzY3JpcHQ+IHRhZyBhbmQgcG9pbnQgaXQgYXQgdGhlIFVSTC5cbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgbm9kZS5zcmMgPSB1cmw7XG5cbiAgICAgIC8vIEEgSlNPTlAgcmVxdWVzdCByZXF1aXJlcyB3YWl0aW5nIGZvciBtdWx0aXBsZSBjYWxsYmFja3MuIFRoZXNlIHZhcmlhYmxlc1xuICAgICAgLy8gYXJlIGNsb3NlZCBvdmVyIGFuZCB0cmFjayBzdGF0ZSBhY3Jvc3MgdGhvc2UgY2FsbGJhY2tzLlxuXG4gICAgICAvLyBUaGUgcmVzcG9uc2Ugb2JqZWN0LCBpZiBvbmUgaGFzIGJlZW4gcmVjZWl2ZWQsIG9yIG51bGwgb3RoZXJ3aXNlLlxuICAgICAgbGV0IGJvZHk6IGFueXxudWxsID0gbnVsbDtcblxuICAgICAgLy8gV2hldGhlciB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgaGFzIGJlZW4gY2FsbGVkLlxuICAgICAgbGV0IGZpbmlzaGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgaW4gdGhpcy5jYWxsYmFja01hcCAod2hpY2ggd2lsbCBiZSB0aGUgd2luZG93XG4gICAgICAvLyBvYmplY3QgaW4gdGhlIGJyb3dzZXIuIFRoZSBzY3JpcHQgYmVpbmcgbG9hZGVkIHZpYSB0aGUgPHNjcmlwdD4gdGFnIHdpbGxcbiAgICAgIC8vIGV2ZW50dWFsbHkgY2FsbCB0aGlzIGNhbGxiYWNrLlxuICAgICAgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja10gPSAoZGF0YT86IGFueSkgPT4ge1xuICAgICAgICAvLyBEYXRhIGhhcyBiZWVuIHJlY2VpdmVkIGZyb20gdGhlIEpTT05QIHNjcmlwdC4gRmlyc3RseSwgZGVsZXRlIHRoaXMgY2FsbGJhY2suXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXTtcblxuICAgICAgICAvLyBTZXQgc3RhdGUgdG8gaW5kaWNhdGUgZGF0YSB3YXMgcmVjZWl2ZWQuXG4gICAgICAgIGJvZHkgPSBkYXRhO1xuICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICB9O1xuXG4gICAgICAvLyBjbGVhbnVwKCkgaXMgYSB1dGlsaXR5IGNsb3N1cmUgdGhhdCByZW1vdmVzIHRoZSA8c2NyaXB0PiBmcm9tIHRoZSBwYWdlIGFuZFxuICAgICAgLy8gdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGZyb20gdGhlIHdpbmRvdy4gVGhpcyBsb2dpYyBpcyB1c2VkIGluIGJvdGggdGhlXG4gICAgICAvLyBzdWNjZXNzLCBlcnJvciwgYW5kIGNhbmNlbGxhdGlvbiBwYXRocywgc28gaXQncyBleHRyYWN0ZWQgb3V0IGZvciBjb252ZW5pZW5jZS5cbiAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgPHNjcmlwdD4gdGFnIGlmIGl0J3Mgc3RpbGwgb24gdGhlIHBhZ2UuXG4gICAgICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGZyb20gdGhlIGNhbGxiYWNrTWFwICh3aW5kb3cgb2JqZWN0IGluIHRoZVxuICAgICAgICAvLyBicm93c2VyKS5cbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdO1xuICAgICAgfTtcblxuICAgICAgLy8gb25Mb2FkKCkgaXMgdGhlIHN1Y2Nlc3MgY2FsbGJhY2sgd2hpY2ggcnVucyBhZnRlciB0aGUgcmVzcG9uc2UgY2FsbGJhY2tcbiAgICAgIC8vIGlmIHRoZSBKU09OUCBzY3JpcHQgbG9hZHMgc3VjY2Vzc2Z1bGx5LiBUaGUgZXZlbnQgaXRzZWxmIGlzIHVuaW1wb3J0YW50LlxuICAgICAgLy8gSWYgc29tZXRoaW5nIHdlbnQgd3JvbmcsIG9uTG9hZCgpIG1heSBydW4gd2l0aG91dCB0aGUgcmVzcG9uc2UgY2FsbGJhY2tcbiAgICAgIC8vIGhhdmluZyBiZWVuIGludm9rZWQuXG4gICAgICBjb25zdCBvbkxvYWQgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgIC8vIFdlIHdyYXAgaXQgaW4gYW4gZXh0cmEgUHJvbWlzZSwgdG8gZW5zdXJlIHRoZSBtaWNyb3Rhc2tcbiAgICAgICAgLy8gaXMgc2NoZWR1bGVkIGFmdGVyIHRoZSBsb2FkZWQgZW5kcG9pbnQgaGFzIGV4ZWN1dGVkIGFueSBwb3RlbnRpYWwgbWljcm90YXNrIGl0c2VsZixcbiAgICAgICAgLy8gd2hpY2ggaXMgbm90IGd1YXJhbnRlZWQgaW4gSW50ZXJuZXQgRXhwbG9yZXIgYW5kIEVkZ2VIVE1MLiBTZWUgaXNzdWUgIzM5NDk2XG4gICAgICAgIHRoaXMucmVzb2x2ZWRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIC8vIENsZWFudXAgdGhlIHBhZ2UuXG4gICAgICAgICAgY2xlYW51cCgpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgaGFzIHJ1bi5cbiAgICAgICAgICBpZiAoIWZpbmlzaGVkKSB7XG4gICAgICAgICAgICAvLyBJdCBoYXNuJ3QsIHNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggdGhlIHJlcXVlc3QuIFJldHVybiBhbiBlcnJvciB2aWFcbiAgICAgICAgICAgIC8vIHRoZSBPYnNlcnZhYmxlIGVycm9yIHBhdGguIEFsbCBKU09OUCBlcnJvcnMgaGF2ZSBzdGF0dXMgMC5cbiAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLFxuICAgICAgICAgICAgICBlcnJvcjogbmV3IEVycm9yKEpTT05QX0VSUl9OT19DQUxMQkFDSyksXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU3VjY2Vzcy4gYm9keSBlaXRoZXIgY29udGFpbnMgdGhlIHJlc3BvbnNlIGJvZHkgb3IgbnVsbCBpZiBub25lIHdhc1xuICAgICAgICAgIC8vIHJldHVybmVkLlxuICAgICAgICAgIG9ic2VydmVyLm5leHQobmV3IEh0dHBSZXNwb25zZSh7XG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgc3RhdHVzOiBIdHRwU3RhdHVzQ29kZS5PayxcbiAgICAgICAgICAgIHN0YXR1c1RleHQ6ICdPSycsXG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgLy8gQ29tcGxldGUgdGhlIHN0cmVhbSwgdGhlIHJlc3BvbnNlIGlzIG92ZXIuXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkVycm9yKCkgaXMgdGhlIGVycm9yIGNhbGxiYWNrLCB3aGljaCBydW5zIGlmIHRoZSBzY3JpcHQgcmV0dXJuZWQgZ2VuZXJhdGVzXG4gICAgICAvLyBhIEphdmFzY3JpcHQgZXJyb3IuIEl0IGVtaXRzIHRoZSBlcnJvciB2aWEgdGhlIE9ic2VydmFibGUgZXJyb3IgY2hhbm5lbCBhc1xuICAgICAgLy8gYSBIdHRwRXJyb3JSZXNwb25zZS5cbiAgICAgIGNvbnN0IG9uRXJyb3I6IGFueSA9IChlcnJvcjogRXJyb3IpID0+IHtcbiAgICAgICAgY2xlYW51cCgpO1xuXG4gICAgICAgIC8vIFdyYXAgdGhlIGVycm9yIGluIGEgSHR0cEVycm9yUmVzcG9uc2UuXG4gICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6ICdKU09OUCBFcnJvcicsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9KSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBTdWJzY3JpYmUgdG8gYm90aCB0aGUgc3VjY2VzcyAobG9hZCkgYW5kIGVycm9yIGV2ZW50cyBvbiB0aGUgPHNjcmlwdD4gdGFnLFxuICAgICAgLy8gYW5kIGFkZCBpdCB0byB0aGUgcGFnZS5cbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICB0aGlzLmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGhhcyBub3cgYmVlbiBzdWNjZXNzZnVsbHkgc2VudC5cbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFuZGxlci5cbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmICghZmluaXNoZWQpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVycyhub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuZCBmaW5hbGx5LCBjbGVhbiB1cCB0aGUgcGFnZS5cbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlTGlzdGVuZXJzKHNjcmlwdDogSFRNTFNjcmlwdEVsZW1lbnQpOiB2b2lkIHtcbiAgICAvLyBJc3N1ZSAjMzQ4MThcbiAgICAvLyBDaGFuZ2luZyA8c2NyaXB0PidzIG93bmVyRG9jdW1lbnQgd2lsbCBwcmV2ZW50IGl0IGZyb20gZXhlY3V0aW9uLlxuICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3NjcmlwdGluZy5odG1sI2V4ZWN1dGUtdGhlLXNjcmlwdC1ibG9ja1xuICAgIGlmICghZm9yZWlnbkRvY3VtZW50KSB7XG4gICAgICBmb3JlaWduRG9jdW1lbnQgPSAodGhpcy5kb2N1bWVudC5pbXBsZW1lbnRhdGlvbiBhcyBET01JbXBsZW1lbnRhdGlvbikuY3JlYXRlSFRNTERvY3VtZW50KCk7XG4gICAgfVxuICAgIGZvcmVpZ25Eb2N1bWVudC5hZG9wdE5vZGUoc2NyaXB0KTtcbiAgfVxufVxuXG4vKipcbiAqIElkZW50aWZpZXMgcmVxdWVzdHMgd2l0aCB0aGUgbWV0aG9kIEpTT05QIGFuZFxuICogc2hpZnRzIHRoZW0gdG8gdGhlIGBKc29ucENsaWVudEJhY2tlbmRgLlxuICpcbiAqIEBzZWUgYEh0dHBJbnRlcmNlcHRvcmBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBqc29ucDogSnNvbnBDbGllbnRCYWNrZW5kKSB7fVxuXG4gIC8qKlxuICAgKiBJZGVudGlmaWVzIGFuZCBoYW5kbGVzIGEgZ2l2ZW4gSlNPTlAgcmVxdWVzdC5cbiAgICogQHBhcmFtIHJlcSBUaGUgb3V0Z29pbmcgcmVxdWVzdCBvYmplY3QgdG8gaGFuZGxlLlxuICAgKiBAcGFyYW0gbmV4dCBUaGUgbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIG9yIHRoZSBiYWNrZW5kXG4gICAqIGlmIG5vIGludGVyY2VwdG9ycyByZW1haW4gaW4gdGhlIGNoYWluLlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSBldmVudCBzdHJlYW0uXG4gICAqL1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgcmV0dXJuIHRoaXMuanNvbnAuaGFuZGxlKHJlcSBhcyBIdHRwUmVxdWVzdDxuZXZlcj4pO1xuICAgIH1cbiAgICAvLyBGYWxsIHRocm91Z2ggZm9yIG5vcm1hbCBIVFRQIHJlcXVlc3RzLlxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICB9XG59XG4iXX0=