/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { EnvironmentInjector, Inject, inject, Injectable, runInInjectionContext, } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpResponse, HttpStatusCode, } from './response';
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
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 *
 */
export function jsonpCallbackContext() {
    if (typeof window === 'object') {
        return window;
    }
    return {};
}
/**
 * Processes an `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 * @see {@link HttpHandler}
 * @see {@link HttpXhrBackend}
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
                        status: HttpStatusCode.Ok,
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
        foreignDocument ??= this.document.implementation.createHTMLDocument();
        foreignDocument.adoptNode(script);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f39cb06", ngImport: i0, type: JsonpClientBackend, deps: [{ token: JsonpCallbackContext }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f39cb06", ngImport: i0, type: JsonpClientBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f39cb06", ngImport: i0, type: JsonpClientBackend, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: JsonpCallbackContext }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
/**
 * Identifies requests with the method JSONP and shifts them to the `JsonpClientBackend`.
 */
export function jsonpInterceptorFn(req, next) {
    if (req.method === 'JSONP') {
        return inject(JsonpClientBackend).handle(req);
    }
    // Fall through for normal HTTP requests.
    return next(req);
}
/**
 * Identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * @see {@link HttpInterceptor}
 *
 * @publicApi
 */
export class JsonpInterceptor {
    constructor(injector) {
        this.injector = injector;
    }
    /**
     * Identifies and handles a given JSONP request.
     * @param initialRequest The outgoing request object to handle.
     * @param next The next interceptor in the chain, or the backend
     * if no interceptors remain in the chain.
     * @returns An observable of the event stream.
     */
    intercept(initialRequest, next) {
        return runInInjectionContext(this.injector, () => jsonpInterceptorFn(initialRequest, (downstreamRequest) => next.handle(downstreamRequest)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f39cb06", ngImport: i0, type: JsonpInterceptor, deps: [{ token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f39cb06", ngImport: i0, type: JsonpInterceptor }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f39cb06", ngImport: i0, type: JsonpInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFDTCxtQkFBbUIsRUFDbkIsTUFBTSxFQUNOLE1BQU0sRUFDTixVQUFVLEVBQ1YscUJBQXFCLEdBQ3RCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFLMUMsT0FBTyxFQUNMLGlCQUFpQixFQUVqQixhQUFhLEVBQ2IsWUFBWSxFQUNaLGNBQWMsR0FDZixNQUFNLFlBQVksQ0FBQzs7QUFFcEIsa0ZBQWtGO0FBQ2xGLGtGQUFrRjtBQUNsRixrRkFBa0Y7QUFDbEYsZ0RBQWdEO0FBQ2hELElBQUksYUFBYSxHQUFXLENBQUMsQ0FBQztBQUU5Qjs7O0dBR0c7QUFDSCxJQUFJLGVBQXFDLENBQUM7QUFFMUMsb0ZBQW9GO0FBQ3BGLHFCQUFxQjtBQUNyQixNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxnREFBZ0QsQ0FBQztBQUV0RixtRkFBbUY7QUFDbkYsK0JBQStCO0FBQy9CLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLCtDQUErQyxDQUFDO0FBQ3RGLE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFHLDZDQUE2QyxDQUFDO0FBRTNGLCtFQUErRTtBQUMvRSxjQUFjO0FBQ2QsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQUcsd0NBQXdDLENBQUM7QUFFeEY7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFnQixvQkFBb0I7Q0FFekM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQjtJQUNsQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQy9C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QXlDO0lBQ3pDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUFvQixRQUE2QjtRQUE3QixhQUFRLEdBQVIsUUFBUSxDQUFxQjtJQUFHLENBQUM7SUFFckQ7Ozs7OztPQU1HO0lBQ0gsU0FBUyxDQUFDLGNBQWdDLEVBQUUsSUFBaUI7UUFDM0QsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUMvQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQzFGLENBQUM7SUFDSixDQUFDO3lIQWRVLGdCQUFnQjs2SEFBaEIsZ0JBQWdCOztzR0FBaEIsZ0JBQWdCO2tCQUQ1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBFbnZpcm9ubWVudEluamVjdG9yLFxuICBJbmplY3QsXG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgcnVuSW5JbmplY3Rpb25Db250ZXh0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhhbmRsZXJGbn0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtcbiAgSHR0cEVycm9yUmVzcG9uc2UsXG4gIEh0dHBFdmVudCxcbiAgSHR0cEV2ZW50VHlwZSxcbiAgSHR0cFJlc3BvbnNlLFxuICBIdHRwU3RhdHVzQ29kZSxcbn0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbi8vIEV2ZXJ5IHJlcXVlc3QgbWFkZSB0aHJvdWdoIEpTT05QIG5lZWRzIGEgY2FsbGJhY2sgbmFtZSB0aGF0J3MgdW5pcXVlIGFjcm9zcyB0aGVcbi8vIHdob2xlIHBhZ2UuIEVhY2ggcmVxdWVzdCBpcyBhc3NpZ25lZCBhbiBpZCBhbmQgdGhlIGNhbGxiYWNrIG5hbWUgaXMgY29uc3RydWN0ZWRcbi8vIGZyb20gdGhhdC4gVGhlIG5leHQgaWQgdG8gYmUgYXNzaWduZWQgaXMgdHJhY2tlZCBpbiBhIGdsb2JhbCB2YXJpYWJsZSBoZXJlIHRoYXRcbi8vIGlzIHNoYXJlZCBhbW9uZyBhbGwgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxubGV0IG5leHRSZXF1ZXN0SWQ6IG51bWJlciA9IDA7XG5cbi8qKlxuICogV2hlbiBhIHBlbmRpbmcgPHNjcmlwdD4gaXMgdW5zdWJzY3JpYmVkIHdlJ2xsIG1vdmUgaXQgdG8gdGhpcyBkb2N1bWVudCwgc28gaXQgd29uJ3QgYmVcbiAqIGV4ZWN1dGVkLlxuICovXG5sZXQgZm9yZWlnbkRvY3VtZW50OiBEb2N1bWVudCB8IHVuZGVmaW5lZDtcblxuLy8gRXJyb3IgdGV4dCBnaXZlbiB3aGVuIGEgSlNPTlAgc2NyaXB0IGlzIGluamVjdGVkLCBidXQgZG9lc24ndCBpbnZva2UgdGhlIGNhbGxiYWNrXG4vLyBwYXNzZWQgaW4gaXRzIFVSTC5cbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfTk9fQ0FMTEJBQ0sgPSAnSlNPTlAgaW5qZWN0ZWQgc2NyaXB0IGRpZCBub3QgaW52b2tlIGNhbGxiYWNrLic7XG5cbi8vIEVycm9yIHRleHQgZ2l2ZW4gd2hlbiBhIHJlcXVlc3QgaXMgcGFzc2VkIHRvIHRoZSBKc29ucENsaWVudEJhY2tlbmQgdGhhdCBkb2Vzbid0XG4vLyBoYXZlIGEgcmVxdWVzdCBtZXRob2QgSlNPTlAuXG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX1dST05HX01FVEhPRCA9ICdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBKU09OUCByZXF1ZXN0IG1ldGhvZC4nO1xuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFID0gJ0pTT05QIHJlcXVlc3RzIG11c3QgdXNlIEpzb24gcmVzcG9uc2UgdHlwZS4nO1xuXG4vLyBFcnJvciB0ZXh0IGdpdmVuIHdoZW4gYSByZXF1ZXN0IGlzIHBhc3NlZCB0byB0aGUgSnNvbnBDbGllbnRCYWNrZW5kIHRoYXQgaGFzXG4vLyBoZWFkZXJzIHNldFxuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9IRUFERVJTX05PVF9TVVBQT1JURUQgPSAnSlNPTlAgcmVxdWVzdHMgZG8gbm90IHN1cHBvcnQgaGVhZGVycy4nO1xuXG4vKipcbiAqIERJIHRva2VuL2Fic3RyYWN0IHR5cGUgcmVwcmVzZW50aW5nIGEgbWFwIG9mIEpTT05QIGNhbGxiYWNrcy5cbiAqXG4gKiBJbiB0aGUgYnJvd3NlciwgdGhpcyBzaG91bGQgYWx3YXlzIGJlIHRoZSBgd2luZG93YCBvYmplY3QuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpzb25wQ2FsbGJhY2tDb250ZXh0IHtcbiAgW2tleTogc3RyaW5nXTogKGRhdGE6IGFueSkgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGVyZSB0byBzdG9yZSBKU09OUCBjYWxsYmFja3MuXG4gKlxuICogT3JkaW5hcmlseSBKU09OUCBjYWxsYmFja3MgYXJlIHN0b3JlZCBvbiB0aGUgYHdpbmRvd2Agb2JqZWN0LCBidXQgdGhpcyBtYXkgbm90IGV4aXN0XG4gKiBpbiB0ZXN0IGVudmlyb25tZW50cy4gSW4gdGhhdCBjYXNlLCBjYWxsYmFja3MgYXJlIHN0b3JlZCBvbiBhbiBhbm9ueW1vdXMgb2JqZWN0IGluc3RlYWQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGpzb25wQ2FsbGJhY2tDb250ZXh0KCk6IE9iamVjdCB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cbiAgcmV0dXJuIHt9O1xufVxuXG4vKipcbiAqIFByb2Nlc3NlcyBhbiBgSHR0cFJlcXVlc3RgIHdpdGggdGhlIEpTT05QIG1ldGhvZCxcbiAqIGJ5IHBlcmZvcm1pbmcgSlNPTlAgc3R5bGUgcmVxdWVzdHMuXG4gKiBAc2VlIHtAbGluayBIdHRwSGFuZGxlcn1cbiAqIEBzZWUge0BsaW5rIEh0dHBYaHJCYWNrZW5kfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25wQ2xpZW50QmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgLyoqXG4gICAqIEEgcmVzb2x2ZWQgcHJvbWlzZSB0aGF0IGNhbiBiZSB1c2VkIHRvIHNjaGVkdWxlIG1pY3JvdGFza3MgaW4gdGhlIGV2ZW50IGhhbmRsZXJzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSByZXNvbHZlZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNhbGxiYWNrTWFwOiBKc29ucENhbGxiYWNrQ29udGV4dCxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvY3VtZW50OiBhbnksXG4gICkge31cblxuICAvKipcbiAgICogR2V0IHRoZSBuYW1lIG9mIHRoZSBuZXh0IGNhbGxiYWNrIG1ldGhvZCwgYnkgaW5jcmVtZW50aW5nIHRoZSBnbG9iYWwgYG5leHRSZXF1ZXN0SWRgLlxuICAgKi9cbiAgcHJpdmF0ZSBuZXh0Q2FsbGJhY2soKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG5nX2pzb25wX2NhbGxiYWNrXyR7bmV4dFJlcXVlc3RJZCsrfWA7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIGEgSlNPTlAgcmVxdWVzdCBhbmQgcmV0dXJucyBhbiBldmVudCBzdHJlYW0gb2YgdGhlIHJlc3VsdHMuXG4gICAqIEBwYXJhbSByZXEgVGhlIHJlcXVlc3Qgb2JqZWN0LlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSByZXNwb25zZSBldmVudHMuXG4gICAqXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxuZXZlcj4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gRmlyc3RseSwgY2hlY2sgYm90aCB0aGUgbWV0aG9kIGFuZCByZXNwb25zZSB0eXBlLiBJZiBlaXRoZXIgZG9lc24ndCBtYXRjaFxuICAgIC8vIHRoZW4gdGhlIHJlcXVlc3Qgd2FzIGltcHJvcGVybHkgcm91dGVkIGhlcmUgYW5kIGNhbm5vdCBiZSBoYW5kbGVkLlxuICAgIGlmIChyZXEubWV0aG9kICE9PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTlBfRVJSX1dST05HX01FVEhPRCk7XG4gICAgfSBlbHNlIGlmIChyZXEucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfUkVTUE9OU0VfVFlQRSk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIHJlcXVlc3QgaGVhZGVycy4gSlNPTlAgZG9lc24ndCBzdXBwb3J0IGhlYWRlcnMgYW5kXG4gICAgLy8gY2Fubm90IHNldCBhbnkgdGhhdCB3ZXJlIHN1cHBsaWVkLlxuICAgIGlmIChyZXEuaGVhZGVycy5rZXlzKCkubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT05QX0VSUl9IRUFERVJTX05PVF9TVVBQT1JURUQpO1xuICAgIH1cblxuICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZSBoYXBwZW5zIGluc2lkZSB0aGUgT2JzZXJ2YWJsZSBib3VuZGFyeS5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+KChvYnNlcnZlcjogT2JzZXJ2ZXI8SHR0cEV2ZW50PGFueT4+KSA9PiB7XG4gICAgICAvLyBUaGUgZmlyc3Qgc3RlcCB0byBtYWtlIGEgcmVxdWVzdCBpcyB0byBnZW5lcmF0ZSB0aGUgY2FsbGJhY2sgbmFtZSwgYW5kIHJlcGxhY2UgdGhlXG4gICAgICAvLyBjYWxsYmFjayBwbGFjZWhvbGRlciBpbiB0aGUgVVJMIHdpdGggdGhlIG5hbWUuIENhcmUgaGFzIHRvIGJlIHRha2VuIGhlcmUgdG8gZW5zdXJlXG4gICAgICAvLyBhIHRyYWlsaW5nICYsIGlmIG1hdGNoZWQsIGdldHMgaW5zZXJ0ZWQgYmFjayBpbnRvIHRoZSBVUkwgaW4gdGhlIGNvcnJlY3QgcGxhY2UuXG4gICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMubmV4dENhbGxiYWNrKCk7XG4gICAgICBjb25zdCB1cmwgPSByZXEudXJsV2l0aFBhcmFtcy5yZXBsYWNlKC89SlNPTlBfQ0FMTEJBQ0soJnwkKS8sIGA9JHtjYWxsYmFja30kMWApO1xuXG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIDxzY3JpcHQ+IHRhZyBhbmQgcG9pbnQgaXQgYXQgdGhlIFVSTC5cbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgbm9kZS5zcmMgPSB1cmw7XG5cbiAgICAgIC8vIEEgSlNPTlAgcmVxdWVzdCByZXF1aXJlcyB3YWl0aW5nIGZvciBtdWx0aXBsZSBjYWxsYmFja3MuIFRoZXNlIHZhcmlhYmxlc1xuICAgICAgLy8gYXJlIGNsb3NlZCBvdmVyIGFuZCB0cmFjayBzdGF0ZSBhY3Jvc3MgdGhvc2UgY2FsbGJhY2tzLlxuXG4gICAgICAvLyBUaGUgcmVzcG9uc2Ugb2JqZWN0LCBpZiBvbmUgaGFzIGJlZW4gcmVjZWl2ZWQsIG9yIG51bGwgb3RoZXJ3aXNlLlxuICAgICAgbGV0IGJvZHk6IGFueSB8IG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgYmVlbiBjYWxsZWQuXG4gICAgICBsZXQgZmluaXNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gU2V0IHRoZSByZXNwb25zZSBjYWxsYmFjayBpbiB0aGlzLmNhbGxiYWNrTWFwICh3aGljaCB3aWxsIGJlIHRoZSB3aW5kb3dcbiAgICAgIC8vIG9iamVjdCBpbiB0aGUgYnJvd3Nlci4gVGhlIHNjcmlwdCBiZWluZyBsb2FkZWQgdmlhIHRoZSA8c2NyaXB0PiB0YWcgd2lsbFxuICAgICAgLy8gZXZlbnR1YWxseSBjYWxsIHRoaXMgY2FsbGJhY2suXG4gICAgICB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXSA9IChkYXRhPzogYW55KSA9PiB7XG4gICAgICAgIC8vIERhdGEgaGFzIGJlZW4gcmVjZWl2ZWQgZnJvbSB0aGUgSlNPTlAgc2NyaXB0LiBGaXJzdGx5LCBkZWxldGUgdGhpcyBjYWxsYmFjay5cbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdO1xuXG4gICAgICAgIC8vIFNldCBzdGF0ZSB0byBpbmRpY2F0ZSBkYXRhIHdhcyByZWNlaXZlZC5cbiAgICAgICAgYm9keSA9IGRhdGE7XG4gICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIGNsZWFudXAoKSBpcyBhIHV0aWxpdHkgY2xvc3VyZSB0aGF0IHJlbW92ZXMgdGhlIDxzY3JpcHQ+IGZyb20gdGhlIHBhZ2UgYW5kXG4gICAgICAvLyB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgd2luZG93LiBUaGlzIGxvZ2ljIGlzIHVzZWQgaW4gYm90aCB0aGVcbiAgICAgIC8vIHN1Y2Nlc3MsIGVycm9yLCBhbmQgY2FuY2VsbGF0aW9uIHBhdGhzLCBzbyBpdCdzIGV4dHJhY3RlZCBvdXQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSA8c2NyaXB0PiB0YWcgaWYgaXQncyBzdGlsbCBvbiB0aGUgcGFnZS5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgY2FsbGJhY2tNYXAgKHdpbmRvdyBvYmplY3QgaW4gdGhlXG4gICAgICAgIC8vIGJyb3dzZXIpLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkxvYWQoKSBpcyB0aGUgc3VjY2VzcyBjYWxsYmFjayB3aGljaCBydW5zIGFmdGVyIHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaWYgdGhlIEpTT05QIHNjcmlwdCBsb2FkcyBzdWNjZXNzZnVsbHkuIFRoZSBldmVudCBpdHNlbGYgaXMgdW5pbXBvcnRhbnQuXG4gICAgICAvLyBJZiBzb21ldGhpbmcgd2VudCB3cm9uZywgb25Mb2FkKCkgbWF5IHJ1biB3aXRob3V0IHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaGF2aW5nIGJlZW4gaW52b2tlZC5cbiAgICAgIGNvbnN0IG9uTG9hZCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgLy8gV2Ugd3JhcCBpdCBpbiBhbiBleHRyYSBQcm9taXNlLCB0byBlbnN1cmUgdGhlIG1pY3JvdGFza1xuICAgICAgICAvLyBpcyBzY2hlZHVsZWQgYWZ0ZXIgdGhlIGxvYWRlZCBlbmRwb2ludCBoYXMgZXhlY3V0ZWQgYW55IHBvdGVudGlhbCBtaWNyb3Rhc2sgaXRzZWxmLFxuICAgICAgICAvLyB3aGljaCBpcyBub3QgZ3VhcmFudGVlZCBpbiBJbnRlcm5ldCBFeHBsb3JlciBhbmQgRWRnZUhUTUwuIFNlZSBpc3N1ZSAjMzk0OTZcbiAgICAgICAgdGhpcy5yZXNvbHZlZFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gQ2xlYW51cCB0aGUgcGFnZS5cbiAgICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgcnVuLlxuICAgICAgICAgIGlmICghZmluaXNoZWQpIHtcbiAgICAgICAgICAgIC8vIEl0IGhhc24ndCwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgcmVxdWVzdC4gUmV0dXJuIGFuIGVycm9yIHZpYVxuICAgICAgICAgICAgLy8gdGhlIE9ic2VydmFibGUgZXJyb3IgcGF0aC4gQWxsIEpTT05QIGVycm9ycyBoYXZlIHN0YXR1cyAwLlxuICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICAgIHN0YXR1czogMCxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLFxuICAgICAgICAgICAgICAgIGVycm9yOiBuZXcgRXJyb3IoSlNPTlBfRVJSX05PX0NBTExCQUNLKSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFN1Y2Nlc3MuIGJvZHkgZWl0aGVyIGNvbnRhaW5zIHRoZSByZXNwb25zZSBib2R5IG9yIG51bGwgaWYgbm9uZSB3YXNcbiAgICAgICAgICAvLyByZXR1cm5lZC5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KFxuICAgICAgICAgICAgbmV3IEh0dHBSZXNwb25zZSh7XG4gICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgIHN0YXR1czogSHR0cFN0YXR1c0NvZGUuT2ssXG4gICAgICAgICAgICAgIHN0YXR1c1RleHQ6ICdPSycsXG4gICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyBDb21wbGV0ZSB0aGUgc3RyZWFtLCB0aGUgcmVzcG9uc2UgaXMgb3Zlci5cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIC8vIG9uRXJyb3IoKSBpcyB0aGUgZXJyb3IgY2FsbGJhY2ssIHdoaWNoIHJ1bnMgaWYgdGhlIHNjcmlwdCByZXR1cm5lZCBnZW5lcmF0ZXNcbiAgICAgIC8vIGEgSmF2YXNjcmlwdCBlcnJvci4gSXQgZW1pdHMgdGhlIGVycm9yIHZpYSB0aGUgT2JzZXJ2YWJsZSBlcnJvciBjaGFubmVsIGFzXG4gICAgICAvLyBhIEh0dHBFcnJvclJlc3BvbnNlLlxuICAgICAgY29uc3Qgb25FcnJvcjogYW55ID0gKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgLy8gV3JhcCB0aGUgZXJyb3IgaW4gYSBIdHRwRXJyb3JSZXNwb25zZS5cbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgICAgbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogJ0pTT05QIEVycm9yJyxcbiAgICAgICAgICAgIHVybCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN1YnNjcmliZSB0byBib3RoIHRoZSBzdWNjZXNzIChsb2FkKSBhbmQgZXJyb3IgZXZlbnRzIG9uIHRoZSA8c2NyaXB0PiB0YWcsXG4gICAgICAvLyBhbmQgYWRkIGl0IHRvIHRoZSBwYWdlLlxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgIHRoaXMuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaGFzIG5vdyBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50LlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKCFmaW5pc2hlZCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQW5kIGZpbmFsbHksIGNsZWFuIHVwIHRoZSBwYWdlLlxuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVMaXN0ZW5lcnMoc2NyaXB0OiBIVE1MU2NyaXB0RWxlbWVudCk6IHZvaWQge1xuICAgIC8vIElzc3VlICMzNDgxOFxuICAgIC8vIENoYW5naW5nIDxzY3JpcHQ+J3Mgb3duZXJEb2N1bWVudCB3aWxsIHByZXZlbnQgaXQgZnJvbSBleGVjdXRpb24uXG4gICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc2NyaXB0aW5nLmh0bWwjZXhlY3V0ZS10aGUtc2NyaXB0LWJsb2NrXG4gICAgZm9yZWlnbkRvY3VtZW50ID8/PSAodGhpcy5kb2N1bWVudC5pbXBsZW1lbnRhdGlvbiBhcyBET01JbXBsZW1lbnRhdGlvbikuY3JlYXRlSFRNTERvY3VtZW50KCk7XG5cbiAgICBmb3JlaWduRG9jdW1lbnQuYWRvcHROb2RlKHNjcmlwdCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIHJlcXVlc3RzIHdpdGggdGhlIG1ldGhvZCBKU09OUCBhbmQgc2hpZnRzIHRoZW0gdG8gdGhlIGBKc29ucENsaWVudEJhY2tlbmRgLlxuICovXG5leHBvcnQgZnVuY3Rpb24ganNvbnBJbnRlcmNlcHRvckZuKFxuICByZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LFxuICBuZXh0OiBIdHRwSGFuZGxlckZuLFxuKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+IHtcbiAgaWYgKHJlcS5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICByZXR1cm4gaW5qZWN0KEpzb25wQ2xpZW50QmFja2VuZCkuaGFuZGxlKHJlcSBhcyBIdHRwUmVxdWVzdDxuZXZlcj4pO1xuICB9XG5cbiAgLy8gRmFsbCB0aHJvdWdoIGZvciBub3JtYWwgSFRUUCByZXF1ZXN0cy5cbiAgcmV0dXJuIG5leHQocmVxKTtcbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIHJlcXVlc3RzIHdpdGggdGhlIG1ldGhvZCBKU09OUCBhbmRcbiAqIHNoaWZ0cyB0aGVtIHRvIHRoZSBgSnNvbnBDbGllbnRCYWNrZW5kYC5cbiAqXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3J9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvbnBJbnRlcmNlcHRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IpIHt9XG5cbiAgLyoqXG4gICAqIElkZW50aWZpZXMgYW5kIGhhbmRsZXMgYSBnaXZlbiBKU09OUCByZXF1ZXN0LlxuICAgKiBAcGFyYW0gaW5pdGlhbFJlcXVlc3QgVGhlIG91dGdvaW5nIHJlcXVlc3Qgb2JqZWN0IHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIG5leHQgVGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBvciB0aGUgYmFja2VuZFxuICAgKiBpZiBubyBpbnRlcmNlcHRvcnMgcmVtYWluIGluIHRoZSBjaGFpbi5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgKi9cbiAgaW50ZXJjZXB0KGluaXRpYWxSZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICByZXR1cm4gcnVuSW5JbmplY3Rpb25Db250ZXh0KHRoaXMuaW5qZWN0b3IsICgpID0+XG4gICAgICBqc29ucEludGVyY2VwdG9yRm4oaW5pdGlhbFJlcXVlc3QsIChkb3duc3RyZWFtUmVxdWVzdCkgPT4gbmV4dC5oYW5kbGUoZG93bnN0cmVhbVJlcXVlc3QpKSxcbiAgICApO1xuICB9XG59XG4iXX0=