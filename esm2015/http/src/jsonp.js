/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/http/src/jsonp.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpResponse } from './response';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Every request made through JSONP needs a callback name that's unique across the
// whole page. Each request is assigned an id and the callback name is constructed
// from that. The next id to be assigned is tracked in a global variable here that
// is shared among all applications on the page.
/** @type {?} */
let nextRequestId = 0;
// Error text given when a JSONP script is injected, but doesn't invoke the callback
// passed in its URL.
/** @type {?} */
export const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
// Error text given when a request is passed to the JsonpClientBackend that doesn't
// have a request method JSONP.
/** @type {?} */
export const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
/** @type {?} */
export const JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';
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
 * Processes an `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 * @see `HttpHandler`
 * @see `HttpXhrBackend`
 *
 * \@publicApi
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
     * @private
     * @return {?}
     */
    nextCallback() { return `ng_jsonp_callback_${nextRequestId++}`; }
    /**
     * Processes a JSONP request and returns an event stream of the results.
     * @param {?} req The request object.
     * @return {?} An observable of the response events.
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
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        (observer) => {
            // The first step to make a request is to generate the callback name, and replace the
            // callback placeholder in the URL with the name. Care has to be taken here to ensure
            // a trailing &, if matched, gets inserted back into the URL in the correct place.
            /** @type {?} */
            const callback = this.nextCallback();
            /** @type {?} */
            const url = req.urlWithParams.replace(/=JSONP_CALLBACK(&|$)/, `=${callback}$1`);
            // Construct the <script> tag and point it at the URL.
            /** @type {?} */
            const node = this.document.createElement('script');
            node.src = url;
            // A JSONP request requires waiting for multiple callbacks. These variables
            // are closed over and track state across those callbacks.
            // The response object, if one has been received, or null otherwise.
            /** @type {?} */
            let body = null;
            // Whether the response callback has been called.
            /** @type {?} */
            let finished = false;
            // Whether the request has been cancelled (and thus any other callbacks)
            // should be ignored.
            /** @type {?} */
            let cancelled = false;
            // Set the response callback in this.callbackMap (which will be the window
            // object in the browser. The script being loaded via the <script> tag will
            // eventually call this callback.
            this.callbackMap[callback] = (/**
             * @param {?=} data
             * @return {?}
             */
            (data) => {
                // Data has been received from the JSONP script. Firstly, delete this callback.
                delete this.callbackMap[callback];
                // Next, make sure the request wasn't cancelled in the meantime.
                if (cancelled) {
                    return;
                }
                // Set state to indicate data was received.
                body = data;
                finished = true;
            });
            // cleanup() is a utility closure that removes the <script> from the page and
            // the response callback from the window. This logic is used in both the
            // success, error, and cancellation paths, so it's extracted out for convenience.
            /** @type {?} */
            const cleanup = (/**
             * @return {?}
             */
            () => {
                // Remove the <script> tag if it's still on the page.
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                // Remove the response callback from the callbackMap (window object in the
                // browser).
                delete this.callbackMap[callback];
            });
            // onLoad() is the success callback which runs after the response callback
            // if the JSONP script loads successfully. The event itself is unimportant.
            // If something went wrong, onLoad() may run without the response callback
            // having been invoked.
            /** @type {?} */
            const onLoad = (/**
             * @param {?} event
             * @return {?}
             */
            (event) => {
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
            });
            // onError() is the error callback, which runs if the script returned generates
            // a Javascript error. It emits the error via the Observable error channel as
            // a HttpErrorResponse.
            /** @type {?} */
            const onError = (/**
             * @param {?} error
             * @return {?}
             */
            (error) => {
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
            });
            // Subscribe to both the success (load) and error events on the <script> tag,
            // and add it to the page.
            node.addEventListener('load', onLoad);
            node.addEventListener('error', onError);
            this.document.body.appendChild(node);
            // The request has now been successfully sent.
            observer.next({ type: HttpEventType.Sent });
            // Cancellation handler.
            return (/**
             * @return {?}
             */
            () => {
                // Track the cancellation so event listeners won't do anything even if already scheduled.
                cancelled = true;
                // Remove the event listeners so they won't run if the events later fire.
                node.removeEventListener('load', onLoad);
                node.removeEventListener('error', onError);
                // And finally, clean up the page.
                cleanup();
            });
        }));
    }
}
JsonpClientBackend.decorators = [
    { type: Injectable },
];
/** @nocollapse */
JsonpClientBackend.ctorParameters = () => [
    { type: JsonpCallbackContext },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** @nocollapse */ JsonpClientBackend.ɵfac = function JsonpClientBackend_Factory(t) { return new (t || JsonpClientBackend)(i0.ɵɵinject(JsonpCallbackContext), i0.ɵɵinject(DOCUMENT)); };
/** @nocollapse */ JsonpClientBackend.ɵprov = i0.ɵɵdefineInjectable({ token: JsonpClientBackend, factory: JsonpClientBackend.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(JsonpClientBackend, [{
        type: Injectable
    }], function () { return [{ type: JsonpCallbackContext }, { type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }]; }, null); })();
if (false) {
    /**
     * @type {?}
     * @private
     */
    JsonpClientBackend.prototype.callbackMap;
    /**
     * @type {?}
     * @private
     */
    JsonpClientBackend.prototype.document;
}
/**
 * Identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * @see `HttpInterceptor`
 *
 * \@publicApi
 */
export class JsonpInterceptor {
    /**
     * @param {?} jsonp
     */
    constructor(jsonp) {
        this.jsonp = jsonp;
    }
    /**
     * Identifies and handles a given JSONP request.
     * @param {?} req The outgoing request object to handle.
     * @param {?} next The next interceptor in the chain, or the backend
     * if no interceptors remain in the chain.
     * @return {?} An observable of the event stream.
     */
    intercept(req, next) {
        if (req.method === 'JSONP') {
            return this.jsonp.handle((/** @type {?} */ (req)));
        }
        // Fall through for normal HTTP requests.
        return next.handle(req);
    }
}
JsonpInterceptor.decorators = [
    { type: Injectable },
];
/** @nocollapse */
JsonpInterceptor.ctorParameters = () => [
    { type: JsonpClientBackend }
];
/** @nocollapse */ JsonpInterceptor.ɵfac = function JsonpInterceptor_Factory(t) { return new (t || JsonpInterceptor)(i0.ɵɵinject(JsonpClientBackend)); };
/** @nocollapse */ JsonpInterceptor.ɵprov = i0.ɵɵdefineInjectable({ token: JsonpInterceptor, factory: JsonpInterceptor.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(JsonpInterceptor, [{
        type: Injectable
    }], function () { return [{ type: JsonpClientBackend }]; }, null); })();
if (false) {
    /**
     * @type {?}
     * @private
     */
    JsonpInterceptor.prototype.jsonp;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBVyxNQUFNLE1BQU0sQ0FBQztBQUkxQyxPQUFPLEVBQUMsaUJBQWlCLEVBQWEsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7SUFNakYsYUFBYSxHQUFXLENBQUM7Ozs7QUFJN0IsTUFBTSxPQUFPLHFCQUFxQixHQUFHLGdEQUFnRDs7OztBQUlyRixNQUFNLE9BQU8sc0JBQXNCLEdBQUcsK0NBQStDOztBQUNyRixNQUFNLE9BQU8sNkJBQTZCLEdBQUcsNkNBQTZDOzs7Ozs7Ozs7QUFTMUYsTUFBTSxPQUFnQixvQkFBb0I7Q0FBd0M7Ozs7Ozs7OztBQVdsRixNQUFNLE9BQU8sa0JBQWtCOzs7OztJQUM3QixZQUFvQixXQUFpQyxFQUE0QixRQUFhO1FBQTFFLGdCQUFXLEdBQVgsV0FBVyxDQUFzQjtRQUE0QixhQUFRLEdBQVIsUUFBUSxDQUFLO0lBQUcsQ0FBQzs7Ozs7O0lBSzFGLFlBQVksS0FBYSxPQUFPLHFCQUFxQixhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7OztJQVFqRixNQUFNLENBQUMsR0FBdUI7UUFDNUIsNEVBQTRFO1FBQzVFLHFFQUFxRTtRQUNyRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QzthQUFNLElBQUksR0FBRyxDQUFDLFlBQVksS0FBSyxNQUFNLEVBQUU7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SUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE9BQU8sRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFBLEdBQUcsRUFBc0IsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QseUNBQXlDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDOzs7WUFqQkYsVUFBVTs7OztZQUVrQixrQkFBa0I7O2dGQURsQyxnQkFBZ0IsY0FDQSxrQkFBa0I7d0RBRGxDLGdCQUFnQixXQUFoQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUQ1QixVQUFVO3NDQUVrQixrQkFBa0I7Ozs7OztJQUFqQyxpQ0FBaUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwUmVzcG9uc2V9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vLyBFdmVyeSByZXF1ZXN0IG1hZGUgdGhyb3VnaCBKU09OUCBuZWVkcyBhIGNhbGxiYWNrIG5hbWUgdGhhdCdzIHVuaXF1ZSBhY3Jvc3MgdGhlXG4vLyB3aG9sZSBwYWdlLiBFYWNoIHJlcXVlc3QgaXMgYXNzaWduZWQgYW4gaWQgYW5kIHRoZSBjYWxsYmFjayBuYW1lIGlzIGNvbnN0cnVjdGVkXG4vLyBmcm9tIHRoYXQuIFRoZSBuZXh0IGlkIHRvIGJlIGFzc2lnbmVkIGlzIHRyYWNrZWQgaW4gYSBnbG9iYWwgdmFyaWFibGUgaGVyZSB0aGF0XG4vLyBpcyBzaGFyZWQgYW1vbmcgYWxsIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS5cbmxldCBuZXh0UmVxdWVzdElkOiBudW1iZXIgPSAwO1xuXG4vLyBFcnJvciB0ZXh0IGdpdmVuIHdoZW4gYSBKU09OUCBzY3JpcHQgaXMgaW5qZWN0ZWQsIGJ1dCBkb2Vzbid0IGludm9rZSB0aGUgY2FsbGJhY2tcbi8vIHBhc3NlZCBpbiBpdHMgVVJMLlxuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9OT19DQUxMQkFDSyA9ICdKU09OUCBpbmplY3RlZCBzY3JpcHQgZGlkIG5vdCBpbnZva2UgY2FsbGJhY2suJztcblxuLy8gRXJyb3IgdGV4dCBnaXZlbiB3aGVuIGEgcmVxdWVzdCBpcyBwYXNzZWQgdG8gdGhlIEpzb25wQ2xpZW50QmFja2VuZCB0aGF0IGRvZXNuJ3Rcbi8vIGhhdmUgYSByZXF1ZXN0IG1ldGhvZCBKU09OUC5cbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfV1JPTkdfTUVUSE9EID0gJ0pTT05QIHJlcXVlc3RzIG11c3QgdXNlIEpTT05QIHJlcXVlc3QgbWV0aG9kLic7XG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX1dST05HX1JFU1BPTlNFX1RZUEUgPSAnSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgSnNvbiByZXNwb25zZSB0eXBlLic7XG5cbi8qKlxuICogREkgdG9rZW4vYWJzdHJhY3QgdHlwZSByZXByZXNlbnRpbmcgYSBtYXAgb2YgSlNPTlAgY2FsbGJhY2tzLlxuICpcbiAqIEluIHRoZSBicm93c2VyLCB0aGlzIHNob3VsZCBhbHdheXMgYmUgdGhlIGB3aW5kb3dgIG9iamVjdC5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSnNvbnBDYWxsYmFja0NvbnRleHQgeyBba2V5OiBzdHJpbmddOiAoZGF0YTogYW55KSA9PiB2b2lkOyB9XG5cbi8qKlxuICogUHJvY2Vzc2VzIGFuIGBIdHRwUmVxdWVzdGAgd2l0aCB0aGUgSlNPTlAgbWV0aG9kLFxuICogYnkgcGVyZm9ybWluZyBKU09OUCBzdHlsZSByZXF1ZXN0cy5cbiAqIEBzZWUgYEh0dHBIYW5kbGVyYFxuICogQHNlZSBgSHR0cFhockJhY2tlbmRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvbnBDbGllbnRCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbGxiYWNrTWFwOiBKc29ucENhbGxiYWNrQ29udGV4dCwgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2N1bWVudDogYW55KSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5hbWUgb2YgdGhlIG5leHQgY2FsbGJhY2sgbWV0aG9kLCBieSBpbmNyZW1lbnRpbmcgdGhlIGdsb2JhbCBgbmV4dFJlcXVlc3RJZGAuXG4gICAqL1xuICBwcml2YXRlIG5leHRDYWxsYmFjaygpOiBzdHJpbmcgeyByZXR1cm4gYG5nX2pzb25wX2NhbGxiYWNrXyR7bmV4dFJlcXVlc3RJZCsrfWA7IH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIGEgSlNPTlAgcmVxdWVzdCBhbmQgcmV0dXJucyBhbiBldmVudCBzdHJlYW0gb2YgdGhlIHJlc3VsdHMuXG4gICAqIEBwYXJhbSByZXEgVGhlIHJlcXVlc3Qgb2JqZWN0LlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSByZXNwb25zZSBldmVudHMuXG4gICAqXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxuZXZlcj4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gRmlyc3RseSwgY2hlY2sgYm90aCB0aGUgbWV0aG9kIGFuZCByZXNwb25zZSB0eXBlLiBJZiBlaXRoZXIgZG9lc24ndCBtYXRjaFxuICAgIC8vIHRoZW4gdGhlIHJlcXVlc3Qgd2FzIGltcHJvcGVybHkgcm91dGVkIGhlcmUgYW5kIGNhbm5vdCBiZSBoYW5kbGVkLlxuICAgIGlmIChyZXEubWV0aG9kICE9PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTlBfRVJSX1dST05HX01FVEhPRCk7XG4gICAgfSBlbHNlIGlmIChyZXEucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfUkVTUE9OU0VfVFlQRSk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBlbHNlIGhhcHBlbnMgaW5zaWRlIHRoZSBPYnNlcnZhYmxlIGJvdW5kYXJ5LlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4oKG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pID0+IHtcbiAgICAgIC8vIFRoZSBmaXJzdCBzdGVwIHRvIG1ha2UgYSByZXF1ZXN0IGlzIHRvIGdlbmVyYXRlIHRoZSBjYWxsYmFjayBuYW1lLCBhbmQgcmVwbGFjZSB0aGVcbiAgICAgIC8vIGNhbGxiYWNrIHBsYWNlaG9sZGVyIGluIHRoZSBVUkwgd2l0aCB0aGUgbmFtZS4gQ2FyZSBoYXMgdG8gYmUgdGFrZW4gaGVyZSB0byBlbnN1cmVcbiAgICAgIC8vIGEgdHJhaWxpbmcgJiwgaWYgbWF0Y2hlZCwgZ2V0cyBpbnNlcnRlZCBiYWNrIGludG8gdGhlIFVSTCBpbiB0aGUgY29ycmVjdCBwbGFjZS5cbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5uZXh0Q2FsbGJhY2soKTtcbiAgICAgIGNvbnN0IHVybCA9IHJlcS51cmxXaXRoUGFyYW1zLnJlcGxhY2UoLz1KU09OUF9DQUxMQkFDSygmfCQpLywgYD0ke2NhbGxiYWNrfSQxYCk7XG5cbiAgICAgIC8vIENvbnN0cnVjdCB0aGUgPHNjcmlwdD4gdGFnIGFuZCBwb2ludCBpdCBhdCB0aGUgVVJMLlxuICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBub2RlLnNyYyA9IHVybDtcblxuICAgICAgLy8gQSBKU09OUCByZXF1ZXN0IHJlcXVpcmVzIHdhaXRpbmcgZm9yIG11bHRpcGxlIGNhbGxiYWNrcy4gVGhlc2UgdmFyaWFibGVzXG4gICAgICAvLyBhcmUgY2xvc2VkIG92ZXIgYW5kIHRyYWNrIHN0YXRlIGFjcm9zcyB0aG9zZSBjYWxsYmFja3MuXG5cbiAgICAgIC8vIFRoZSByZXNwb25zZSBvYmplY3QsIGlmIG9uZSBoYXMgYmVlbiByZWNlaXZlZCwgb3IgbnVsbCBvdGhlcndpc2UuXG4gICAgICBsZXQgYm9keTogYW55fG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgYmVlbiBjYWxsZWQuXG4gICAgICBsZXQgZmluaXNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gV2hldGhlciB0aGUgcmVxdWVzdCBoYXMgYmVlbiBjYW5jZWxsZWQgKGFuZCB0aHVzIGFueSBvdGhlciBjYWxsYmFja3MpXG4gICAgICAvLyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICAgIGxldCBjYW5jZWxsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gU2V0IHRoZSByZXNwb25zZSBjYWxsYmFjayBpbiB0aGlzLmNhbGxiYWNrTWFwICh3aGljaCB3aWxsIGJlIHRoZSB3aW5kb3dcbiAgICAgIC8vIG9iamVjdCBpbiB0aGUgYnJvd3Nlci4gVGhlIHNjcmlwdCBiZWluZyBsb2FkZWQgdmlhIHRoZSA8c2NyaXB0PiB0YWcgd2lsbFxuICAgICAgLy8gZXZlbnR1YWxseSBjYWxsIHRoaXMgY2FsbGJhY2suXG4gICAgICB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXSA9IChkYXRhPzogYW55KSA9PiB7XG4gICAgICAgIC8vIERhdGEgaGFzIGJlZW4gcmVjZWl2ZWQgZnJvbSB0aGUgSlNPTlAgc2NyaXB0LiBGaXJzdGx5LCBkZWxldGUgdGhpcyBjYWxsYmFjay5cbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdO1xuXG4gICAgICAgIC8vIE5leHQsIG1ha2Ugc3VyZSB0aGUgcmVxdWVzdCB3YXNuJ3QgY2FuY2VsbGVkIGluIHRoZSBtZWFudGltZS5cbiAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBzdGF0ZSB0byBpbmRpY2F0ZSBkYXRhIHdhcyByZWNlaXZlZC5cbiAgICAgICAgYm9keSA9IGRhdGE7XG4gICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIGNsZWFudXAoKSBpcyBhIHV0aWxpdHkgY2xvc3VyZSB0aGF0IHJlbW92ZXMgdGhlIDxzY3JpcHQ+IGZyb20gdGhlIHBhZ2UgYW5kXG4gICAgICAvLyB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgd2luZG93LiBUaGlzIGxvZ2ljIGlzIHVzZWQgaW4gYm90aCB0aGVcbiAgICAgIC8vIHN1Y2Nlc3MsIGVycm9yLCBhbmQgY2FuY2VsbGF0aW9uIHBhdGhzLCBzbyBpdCdzIGV4dHJhY3RlZCBvdXQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSA8c2NyaXB0PiB0YWcgaWYgaXQncyBzdGlsbCBvbiB0aGUgcGFnZS5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgY2FsbGJhY2tNYXAgKHdpbmRvdyBvYmplY3QgaW4gdGhlXG4gICAgICAgIC8vIGJyb3dzZXIpLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkxvYWQoKSBpcyB0aGUgc3VjY2VzcyBjYWxsYmFjayB3aGljaCBydW5zIGFmdGVyIHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaWYgdGhlIEpTT05QIHNjcmlwdCBsb2FkcyBzdWNjZXNzZnVsbHkuIFRoZSBldmVudCBpdHNlbGYgaXMgdW5pbXBvcnRhbnQuXG4gICAgICAvLyBJZiBzb21ldGhpbmcgd2VudCB3cm9uZywgb25Mb2FkKCkgbWF5IHJ1biB3aXRob3V0IHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaGF2aW5nIGJlZW4gaW52b2tlZC5cbiAgICAgIGNvbnN0IG9uTG9hZCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiB0aGUgcmVxdWVzdCBoYXMgYmVlbiBjYW5jZWxsZWQuXG4gICAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhbnVwIHRoZSBwYWdlLlxuICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgaGFzIHJ1bi5cbiAgICAgICAgaWYgKCFmaW5pc2hlZCkge1xuICAgICAgICAgIC8vIEl0IGhhc24ndCwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgcmVxdWVzdC4gUmV0dXJuIGFuIGVycm9yIHZpYVxuICAgICAgICAgIC8vIHRoZSBPYnNlcnZhYmxlIGVycm9yIHBhdGguIEFsbCBKU09OUCBlcnJvcnMgaGF2ZSBzdGF0dXMgMC5cbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogJ0pTT05QIEVycm9yJyxcbiAgICAgICAgICAgIGVycm9yOiBuZXcgRXJyb3IoSlNPTlBfRVJSX05PX0NBTExCQUNLKSxcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3VjY2Vzcy4gYm9keSBlaXRoZXIgY29udGFpbnMgdGhlIHJlc3BvbnNlIGJvZHkgb3IgbnVsbCBpZiBub25lIHdhc1xuICAgICAgICAvLyByZXR1cm5lZC5cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICBib2R5LFxuICAgICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6ICdPSycsIHVybCxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIENvbXBsZXRlIHRoZSBzdHJlYW0sIHRoZSByZXNwb25zZSBpcyBvdmVyLlxuICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgfTtcblxuICAgICAgLy8gb25FcnJvcigpIGlzIHRoZSBlcnJvciBjYWxsYmFjaywgd2hpY2ggcnVucyBpZiB0aGUgc2NyaXB0IHJldHVybmVkIGdlbmVyYXRlc1xuICAgICAgLy8gYSBKYXZhc2NyaXB0IGVycm9yLiBJdCBlbWl0cyB0aGUgZXJyb3IgdmlhIHRoZSBPYnNlcnZhYmxlIGVycm9yIGNoYW5uZWwgYXNcbiAgICAgIC8vIGEgSHR0cEVycm9yUmVzcG9uc2UuXG4gICAgICBjb25zdCBvbkVycm9yOiBhbnkgPSAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBhbHJlYWR5IGNhbmNlbGxlZCwgbm8gbmVlZCB0byBlbWl0IGFueXRoaW5nLlxuICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNsZWFudXAoKTtcblxuICAgICAgICAvLyBXcmFwIHRoZSBlcnJvciBpbiBhIEh0dHBFcnJvclJlc3BvbnNlLlxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHN0YXR1czogMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLCB1cmwsXG4gICAgICAgIH0pKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN1YnNjcmliZSB0byBib3RoIHRoZSBzdWNjZXNzIChsb2FkKSBhbmQgZXJyb3IgZXZlbnRzIG9uIHRoZSA8c2NyaXB0PiB0YWcsXG4gICAgICAvLyBhbmQgYWRkIGl0IHRvIHRoZSBwYWdlLlxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgIHRoaXMuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaGFzIG5vdyBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50LlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIGNhbmNlbGxhdGlvbiBzbyBldmVudCBsaXN0ZW5lcnMgd29uJ3QgZG8gYW55dGhpbmcgZXZlbiBpZiBhbHJlYWR5IHNjaGVkdWxlZC5cbiAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVycyBzbyB0aGV5IHdvbid0IHJ1biBpZiB0aGUgZXZlbnRzIGxhdGVyIGZpcmUuXG4gICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcblxuICAgICAgICAvLyBBbmQgZmluYWxseSwgY2xlYW4gdXAgdGhlIHBhZ2UuXG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIHJlcXVlc3RzIHdpdGggdGhlIG1ldGhvZCBKU09OUCBhbmRcbiAqIHNoaWZ0cyB0aGVtIHRvIHRoZSBgSnNvbnBDbGllbnRCYWNrZW5kYC5cbiAqXG4gKiBAc2VlIGBIdHRwSW50ZXJjZXB0b3JgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvbnBJbnRlcmNlcHRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUganNvbnA6IEpzb25wQ2xpZW50QmFja2VuZCkge31cblxuICAvKipcbiAgICogSWRlbnRpZmllcyBhbmQgaGFuZGxlcyBhIGdpdmVuIEpTT05QIHJlcXVlc3QuXG4gICAqIEBwYXJhbSByZXEgVGhlIG91dGdvaW5nIHJlcXVlc3Qgb2JqZWN0IHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIG5leHQgVGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBvciB0aGUgYmFja2VuZFxuICAgKiBpZiBubyBpbnRlcmNlcHRvcnMgcmVtYWluIGluIHRoZSBjaGFpbi5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgKi9cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmpzb25wLmhhbmRsZShyZXEgYXMgSHR0cFJlcXVlc3Q8bmV2ZXI+KTtcbiAgICB9XG4gICAgLy8gRmFsbCB0aHJvdWdoIGZvciBub3JtYWwgSFRUUCByZXF1ZXN0cy5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgfVxufVxuIl19