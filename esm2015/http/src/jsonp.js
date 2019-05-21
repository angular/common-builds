/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
 * `HttpBackend` that only processes `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
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
/** @nocollapse */ JsonpClientBackend.ngInjectableDef = i0.ɵɵdefineInjectable({ token: JsonpClientBackend, factory: function JsonpClientBackend_Factory(t) { return new (t || JsonpClientBackend)(i0.ɵɵinject(JsonpCallbackContext), i0.ɵɵinject(DOCUMENT)); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(JsonpClientBackend, [{
        type: Injectable
    }], function () { return [{ type: JsonpCallbackContext }, { type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }]; }, null);
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
 * An `HttpInterceptor` which identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
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
     * @param {?} req
     * @param {?} next
     * @return {?}
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
/** @nocollapse */ JsonpInterceptor.ngInjectableDef = i0.ɵɵdefineInjectable({ token: JsonpInterceptor, factory: function JsonpInterceptor_Factory(t) { return new (t || JsonpInterceptor)(i0.ɵɵinject(JsonpClientBackend)); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(JsonpInterceptor, [{
        type: Injectable
    }], function () { return [{ type: JsonpClientBackend }]; }, null);
if (false) {
    /**
     * @type {?}
     * @private
     */
    JsonpInterceptor.prototype.jsonp;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBSTFDLE9BQU8sRUFBQyxpQkFBaUIsRUFBYSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7OztJQU1qRixhQUFhLEdBQVcsQ0FBQzs7OztBQUk3QixNQUFNLE9BQU8scUJBQXFCLEdBQUcsZ0RBQWdEOzs7O0FBSXJGLE1BQU0sT0FBTyxzQkFBc0IsR0FBRywrQ0FBK0M7O0FBQ3JGLE1BQU0sT0FBTyw2QkFBNkIsR0FBRyw2Q0FBNkM7Ozs7Ozs7OztBQVMxRixNQUFNLE9BQWdCLG9CQUFvQjtDQUF3Qzs7Ozs7OztBQVNsRixNQUFNLE9BQU8sa0JBQWtCOzs7OztJQUM3QixZQUFvQixXQUFpQyxFQUE0QixRQUFhO1FBQTFFLGdCQUFXLEdBQVgsV0FBVyxDQUFzQjtRQUE0QixhQUFRLEdBQVIsUUFBUSxDQUFLO0lBQUcsQ0FBQzs7Ozs7O0lBSzFGLFlBQVksS0FBYSxPQUFPLHFCQUFxQixhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7O0lBS2pGLE1BQU0sQ0FBQyxHQUF1QjtRQUM1Qiw0RUFBNEU7UUFDNUUscUVBQXFFO1FBQ3JFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3pDO2FBQU0sSUFBSSxHQUFHLENBQUMsWUFBWSxLQUFLLE1BQU0sRUFBRTtZQUN0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QUFLLE9BQU8sRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFBLEdBQUcsRUFBc0IsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QseUNBQXlDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDOzs7WUFWRixVQUFVOzs7O1lBRWtCLGtCQUFrQjs7a0VBRGxDLGdCQUFnQixtRUFBaEIsZ0JBQWdCLGNBQ0Esa0JBQWtCO21DQURsQyxnQkFBZ0I7Y0FENUIsVUFBVTtzQ0FFa0Isa0JBQWtCOzs7Ozs7SUFBakMsaUNBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cFJlc3BvbnNlfSBmcm9tICcuL3Jlc3BvbnNlJztcblxuLy8gRXZlcnkgcmVxdWVzdCBtYWRlIHRocm91Z2ggSlNPTlAgbmVlZHMgYSBjYWxsYmFjayBuYW1lIHRoYXQncyB1bmlxdWUgYWNyb3NzIHRoZVxuLy8gd2hvbGUgcGFnZS4gRWFjaCByZXF1ZXN0IGlzIGFzc2lnbmVkIGFuIGlkIGFuZCB0aGUgY2FsbGJhY2sgbmFtZSBpcyBjb25zdHJ1Y3RlZFxuLy8gZnJvbSB0aGF0LiBUaGUgbmV4dCBpZCB0byBiZSBhc3NpZ25lZCBpcyB0cmFja2VkIGluIGEgZ2xvYmFsIHZhcmlhYmxlIGhlcmUgdGhhdFxuLy8gaXMgc2hhcmVkIGFtb25nIGFsbCBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2UuXG5sZXQgbmV4dFJlcXVlc3RJZDogbnVtYmVyID0gMDtcblxuLy8gRXJyb3IgdGV4dCBnaXZlbiB3aGVuIGEgSlNPTlAgc2NyaXB0IGlzIGluamVjdGVkLCBidXQgZG9lc24ndCBpbnZva2UgdGhlIGNhbGxiYWNrXG4vLyBwYXNzZWQgaW4gaXRzIFVSTC5cbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfTk9fQ0FMTEJBQ0sgPSAnSlNPTlAgaW5qZWN0ZWQgc2NyaXB0IGRpZCBub3QgaW52b2tlIGNhbGxiYWNrLic7XG5cbi8vIEVycm9yIHRleHQgZ2l2ZW4gd2hlbiBhIHJlcXVlc3QgaXMgcGFzc2VkIHRvIHRoZSBKc29ucENsaWVudEJhY2tlbmQgdGhhdCBkb2Vzbid0XG4vLyBoYXZlIGEgcmVxdWVzdCBtZXRob2QgSlNPTlAuXG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX1dST05HX01FVEhPRCA9ICdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBKU09OUCByZXF1ZXN0IG1ldGhvZC4nO1xuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFID0gJ0pTT05QIHJlcXVlc3RzIG11c3QgdXNlIEpzb24gcmVzcG9uc2UgdHlwZS4nO1xuXG4vKipcbiAqIERJIHRva2VuL2Fic3RyYWN0IHR5cGUgcmVwcmVzZW50aW5nIGEgbWFwIG9mIEpTT05QIGNhbGxiYWNrcy5cbiAqXG4gKiBJbiB0aGUgYnJvd3NlciwgdGhpcyBzaG91bGQgYWx3YXlzIGJlIHRoZSBgd2luZG93YCBvYmplY3QuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpzb25wQ2FsbGJhY2tDb250ZXh0IHsgW2tleTogc3RyaW5nXTogKGRhdGE6IGFueSkgPT4gdm9pZDsgfVxuXG4vKipcbiAqIGBIdHRwQmFja2VuZGAgdGhhdCBvbmx5IHByb2Nlc3NlcyBgSHR0cFJlcXVlc3RgIHdpdGggdGhlIEpTT05QIG1ldGhvZCxcbiAqIGJ5IHBlcmZvcm1pbmcgSlNPTlAgc3R5bGUgcmVxdWVzdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvbnBDbGllbnRCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbGxiYWNrTWFwOiBKc29ucENhbGxiYWNrQ29udGV4dCwgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2N1bWVudDogYW55KSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5hbWUgb2YgdGhlIG5leHQgY2FsbGJhY2sgbWV0aG9kLCBieSBpbmNyZW1lbnRpbmcgdGhlIGdsb2JhbCBgbmV4dFJlcXVlc3RJZGAuXG4gICAqL1xuICBwcml2YXRlIG5leHRDYWxsYmFjaygpOiBzdHJpbmcgeyByZXR1cm4gYG5nX2pzb25wX2NhbGxiYWNrXyR7bmV4dFJlcXVlc3RJZCsrfWA7IH1cblxuICAvKipcbiAgICogUHJvY2VzcyBhIEpTT05QIHJlcXVlc3QgYW5kIHJldHVybiBhbiBldmVudCBzdHJlYW0gb2YgdGhlIHJlc3VsdHMuXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxuZXZlcj4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gRmlyc3RseSwgY2hlY2sgYm90aCB0aGUgbWV0aG9kIGFuZCByZXNwb25zZSB0eXBlLiBJZiBlaXRoZXIgZG9lc24ndCBtYXRjaFxuICAgIC8vIHRoZW4gdGhlIHJlcXVlc3Qgd2FzIGltcHJvcGVybHkgcm91dGVkIGhlcmUgYW5kIGNhbm5vdCBiZSBoYW5kbGVkLlxuICAgIGlmIChyZXEubWV0aG9kICE9PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTlBfRVJSX1dST05HX01FVEhPRCk7XG4gICAgfSBlbHNlIGlmIChyZXEucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfUkVTUE9OU0VfVFlQRSk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBlbHNlIGhhcHBlbnMgaW5zaWRlIHRoZSBPYnNlcnZhYmxlIGJvdW5kYXJ5LlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4oKG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pID0+IHtcbiAgICAgIC8vIFRoZSBmaXJzdCBzdGVwIHRvIG1ha2UgYSByZXF1ZXN0IGlzIHRvIGdlbmVyYXRlIHRoZSBjYWxsYmFjayBuYW1lLCBhbmQgcmVwbGFjZSB0aGVcbiAgICAgIC8vIGNhbGxiYWNrIHBsYWNlaG9sZGVyIGluIHRoZSBVUkwgd2l0aCB0aGUgbmFtZS4gQ2FyZSBoYXMgdG8gYmUgdGFrZW4gaGVyZSB0byBlbnN1cmVcbiAgICAgIC8vIGEgdHJhaWxpbmcgJiwgaWYgbWF0Y2hlZCwgZ2V0cyBpbnNlcnRlZCBiYWNrIGludG8gdGhlIFVSTCBpbiB0aGUgY29ycmVjdCBwbGFjZS5cbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5uZXh0Q2FsbGJhY2soKTtcbiAgICAgIGNvbnN0IHVybCA9IHJlcS51cmxXaXRoUGFyYW1zLnJlcGxhY2UoLz1KU09OUF9DQUxMQkFDSygmfCQpLywgYD0ke2NhbGxiYWNrfSQxYCk7XG5cbiAgICAgIC8vIENvbnN0cnVjdCB0aGUgPHNjcmlwdD4gdGFnIGFuZCBwb2ludCBpdCBhdCB0aGUgVVJMLlxuICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBub2RlLnNyYyA9IHVybDtcblxuICAgICAgLy8gQSBKU09OUCByZXF1ZXN0IHJlcXVpcmVzIHdhaXRpbmcgZm9yIG11bHRpcGxlIGNhbGxiYWNrcy4gVGhlc2UgdmFyaWFibGVzXG4gICAgICAvLyBhcmUgY2xvc2VkIG92ZXIgYW5kIHRyYWNrIHN0YXRlIGFjcm9zcyB0aG9zZSBjYWxsYmFja3MuXG5cbiAgICAgIC8vIFRoZSByZXNwb25zZSBvYmplY3QsIGlmIG9uZSBoYXMgYmVlbiByZWNlaXZlZCwgb3IgbnVsbCBvdGhlcndpc2UuXG4gICAgICBsZXQgYm9keTogYW55fG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgYmVlbiBjYWxsZWQuXG4gICAgICBsZXQgZmluaXNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gV2hldGhlciB0aGUgcmVxdWVzdCBoYXMgYmVlbiBjYW5jZWxsZWQgKGFuZCB0aHVzIGFueSBvdGhlciBjYWxsYmFja3MpXG4gICAgICAvLyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICAgIGxldCBjYW5jZWxsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgLy8gU2V0IHRoZSByZXNwb25zZSBjYWxsYmFjayBpbiB0aGlzLmNhbGxiYWNrTWFwICh3aGljaCB3aWxsIGJlIHRoZSB3aW5kb3dcbiAgICAgIC8vIG9iamVjdCBpbiB0aGUgYnJvd3Nlci4gVGhlIHNjcmlwdCBiZWluZyBsb2FkZWQgdmlhIHRoZSA8c2NyaXB0PiB0YWcgd2lsbFxuICAgICAgLy8gZXZlbnR1YWxseSBjYWxsIHRoaXMgY2FsbGJhY2suXG4gICAgICB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXSA9IChkYXRhPzogYW55KSA9PiB7XG4gICAgICAgIC8vIERhdGEgaGFzIGJlZW4gcmVjZWl2ZWQgZnJvbSB0aGUgSlNPTlAgc2NyaXB0LiBGaXJzdGx5LCBkZWxldGUgdGhpcyBjYWxsYmFjay5cbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdO1xuXG4gICAgICAgIC8vIE5leHQsIG1ha2Ugc3VyZSB0aGUgcmVxdWVzdCB3YXNuJ3QgY2FuY2VsbGVkIGluIHRoZSBtZWFudGltZS5cbiAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBzdGF0ZSB0byBpbmRpY2F0ZSBkYXRhIHdhcyByZWNlaXZlZC5cbiAgICAgICAgYm9keSA9IGRhdGE7XG4gICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIGNsZWFudXAoKSBpcyBhIHV0aWxpdHkgY2xvc3VyZSB0aGF0IHJlbW92ZXMgdGhlIDxzY3JpcHQ+IGZyb20gdGhlIHBhZ2UgYW5kXG4gICAgICAvLyB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgd2luZG93LiBUaGlzIGxvZ2ljIGlzIHVzZWQgaW4gYm90aCB0aGVcbiAgICAgIC8vIHN1Y2Nlc3MsIGVycm9yLCBhbmQgY2FuY2VsbGF0aW9uIHBhdGhzLCBzbyBpdCdzIGV4dHJhY3RlZCBvdXQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSA8c2NyaXB0PiB0YWcgaWYgaXQncyBzdGlsbCBvbiB0aGUgcGFnZS5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgZnJvbSB0aGUgY2FsbGJhY2tNYXAgKHdpbmRvdyBvYmplY3QgaW4gdGhlXG4gICAgICAgIC8vIGJyb3dzZXIpLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkxvYWQoKSBpcyB0aGUgc3VjY2VzcyBjYWxsYmFjayB3aGljaCBydW5zIGFmdGVyIHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaWYgdGhlIEpTT05QIHNjcmlwdCBsb2FkcyBzdWNjZXNzZnVsbHkuIFRoZSBldmVudCBpdHNlbGYgaXMgdW5pbXBvcnRhbnQuXG4gICAgICAvLyBJZiBzb21ldGhpbmcgd2VudCB3cm9uZywgb25Mb2FkKCkgbWF5IHJ1biB3aXRob3V0IHRoZSByZXNwb25zZSBjYWxsYmFja1xuICAgICAgLy8gaGF2aW5nIGJlZW4gaW52b2tlZC5cbiAgICAgIGNvbnN0IG9uTG9hZCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiB0aGUgcmVxdWVzdCBoYXMgYmVlbiBjYW5jZWxsZWQuXG4gICAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhbnVwIHRoZSBwYWdlLlxuICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgcmVzcG9uc2UgY2FsbGJhY2sgaGFzIHJ1bi5cbiAgICAgICAgaWYgKCFmaW5pc2hlZCkge1xuICAgICAgICAgIC8vIEl0IGhhc24ndCwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgcmVxdWVzdC4gUmV0dXJuIGFuIGVycm9yIHZpYVxuICAgICAgICAgIC8vIHRoZSBPYnNlcnZhYmxlIGVycm9yIHBhdGguIEFsbCBKU09OUCBlcnJvcnMgaGF2ZSBzdGF0dXMgMC5cbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogJ0pTT05QIEVycm9yJyxcbiAgICAgICAgICAgIGVycm9yOiBuZXcgRXJyb3IoSlNPTlBfRVJSX05PX0NBTExCQUNLKSxcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3VjY2Vzcy4gYm9keSBlaXRoZXIgY29udGFpbnMgdGhlIHJlc3BvbnNlIGJvZHkgb3IgbnVsbCBpZiBub25lIHdhc1xuICAgICAgICAvLyByZXR1cm5lZC5cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICBib2R5LFxuICAgICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6ICdPSycsIHVybCxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIENvbXBsZXRlIHRoZSBzdHJlYW0sIHRoZSByZXNwb25zZSBpcyBvdmVyLlxuICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgfTtcblxuICAgICAgLy8gb25FcnJvcigpIGlzIHRoZSBlcnJvciBjYWxsYmFjaywgd2hpY2ggcnVucyBpZiB0aGUgc2NyaXB0IHJldHVybmVkIGdlbmVyYXRlc1xuICAgICAgLy8gYSBKYXZhc2NyaXB0IGVycm9yLiBJdCBlbWl0cyB0aGUgZXJyb3IgdmlhIHRoZSBPYnNlcnZhYmxlIGVycm9yIGNoYW5uZWwgYXNcbiAgICAgIC8vIGEgSHR0cEVycm9yUmVzcG9uc2UuXG4gICAgICBjb25zdCBvbkVycm9yOiBhbnkgPSAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBhbHJlYWR5IGNhbmNlbGxlZCwgbm8gbmVlZCB0byBlbWl0IGFueXRoaW5nLlxuICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNsZWFudXAoKTtcblxuICAgICAgICAvLyBXcmFwIHRoZSBlcnJvciBpbiBhIEh0dHBFcnJvclJlc3BvbnNlLlxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHN0YXR1czogMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLCB1cmwsXG4gICAgICAgIH0pKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFN1YnNjcmliZSB0byBib3RoIHRoZSBzdWNjZXNzIChsb2FkKSBhbmQgZXJyb3IgZXZlbnRzIG9uIHRoZSA8c2NyaXB0PiB0YWcsXG4gICAgICAvLyBhbmQgYWRkIGl0IHRvIHRoZSBwYWdlLlxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgIHRoaXMuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgLy8gVGhlIHJlcXVlc3QgaGFzIG5vdyBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50LlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIGNhbmNlbGxhdGlvbiBzbyBldmVudCBsaXN0ZW5lcnMgd29uJ3QgZG8gYW55dGhpbmcgZXZlbiBpZiBhbHJlYWR5IHNjaGVkdWxlZC5cbiAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVycyBzbyB0aGV5IHdvbid0IHJ1biBpZiB0aGUgZXZlbnRzIGxhdGVyIGZpcmUuXG4gICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcblxuICAgICAgICAvLyBBbmQgZmluYWxseSwgY2xlYW4gdXAgdGhlIHBhZ2UuXG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBgSHR0cEludGVyY2VwdG9yYCB3aGljaCBpZGVudGlmaWVzIHJlcXVlc3RzIHdpdGggdGhlIG1ldGhvZCBKU09OUCBhbmRcbiAqIHNoaWZ0cyB0aGVtIHRvIHRoZSBgSnNvbnBDbGllbnRCYWNrZW5kYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBqc29ucDogSnNvbnBDbGllbnRCYWNrZW5kKSB7fVxuXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmIChyZXEubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICByZXR1cm4gdGhpcy5qc29ucC5oYW5kbGUocmVxIGFzIEh0dHBSZXF1ZXN0PG5ldmVyPik7XG4gICAgfVxuICAgIC8vIEZhbGwgdGhyb3VnaCBmb3Igbm9ybWFsIEhUVFAgcmVxdWVzdHMuXG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XG4gIH1cbn1cbiJdfQ==