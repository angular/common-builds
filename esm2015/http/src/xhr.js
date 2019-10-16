/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @type {?} */
const XSSI_PREFIX = /^\)\]\}',?\n/;
/**
 * Determine an appropriate URL for the response, by checking either
 * XMLHttpRequest.responseURL or the X-Request-URL header.
 * @param {?} xhr
 * @return {?}
 */
function getResponseUrl(xhr) {
    if ('responseURL' in xhr && xhr.responseURL) {
        return xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
        return xhr.getResponseHeader('X-Request-URL');
    }
    return null;
}
/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * \@publicApi
 * @abstract
 */
export class XhrFactory {
}
if (false) {
    /**
     * @abstract
     * @return {?}
     */
    XhrFactory.prototype.build = function () { };
}
/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 *
 */
export class BrowserXhr {
    constructor() { }
    /**
     * @return {?}
     */
    build() { return (/** @type {?} */ ((new XMLHttpRequest()))); }
}
BrowserXhr.decorators = [
    { type: Injectable },
];
/** @nocollapse */
BrowserXhr.ctorParameters = () => [];
/** @nocollapse */ BrowserXhr.ɵfac = function BrowserXhr_Factory(t) { return new (t || BrowserXhr)(); };
/** @nocollapse */ BrowserXhr.ɵprov = i0.ɵɵdefineInjectable({ token: BrowserXhr, factory: function (t) { return BrowserXhr.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(BrowserXhr, [{
        type: Injectable
    }], function () { return []; }, null);
/**
 * Tracks a response from the server that does not yet have a body.
 * @record
 */
function PartialResponse() { }
if (false) {
    /** @type {?} */
    PartialResponse.prototype.headers;
    /** @type {?} */
    PartialResponse.prototype.status;
    /** @type {?} */
    PartialResponse.prototype.statusText;
    /** @type {?} */
    PartialResponse.prototype.url;
}
/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see `HttpHandler`
 * @see `JsonpClientBackend`
 *
 * \@publicApi
 */
export class HttpXhrBackend {
    /**
     * @param {?} xhrFactory
     */
    constructor(xhrFactory) {
        this.xhrFactory = xhrFactory;
    }
    /**
     * Processes a request and returns a stream of response events.
     * @param {?} req The request object.
     * @return {?} An observable of the response events.
     */
    handle(req) {
        // Quick check to give a better error message when a user attempts to use
        // HttpClient.jsonp() without installing the JsonpClientModule
        if (req.method === 'JSONP') {
            throw new Error(`Attempted to construct Jsonp request without JsonpClientModule installed.`);
        }
        // Everything happens on Observable subscription.
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        (observer) => {
            // Start by setting up the XHR object with request method, URL, and withCredentials flag.
            /** @type {?} */
            const xhr = this.xhrFactory.build();
            xhr.open(req.method, req.urlWithParams);
            if (!!req.withCredentials) {
                xhr.withCredentials = true;
            }
            // Add all the requested headers.
            req.headers.forEach((/**
             * @param {?} name
             * @param {?} values
             * @return {?}
             */
            (name, values) => xhr.setRequestHeader(name, values.join(','))));
            // Add an Accept header if one isn't present already.
            if (!req.headers.has('Accept')) {
                xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
            }
            // Auto-detect the Content-Type header if one isn't present already.
            if (!req.headers.has('Content-Type')) {
                /** @type {?} */
                const detectedType = req.detectContentTypeHeader();
                // Sometimes Content-Type detection fails.
                if (detectedType !== null) {
                    xhr.setRequestHeader('Content-Type', detectedType);
                }
            }
            // Set the responseType if one was requested.
            if (req.responseType) {
                /** @type {?} */
                const responseType = req.responseType.toLowerCase();
                // JSON responses need to be processed as text. This is because if the server
                // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
                // xhr.response will be null, and xhr.responseText cannot be accessed to
                // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
                // is parsed by first requesting text and then applying JSON.parse.
                xhr.responseType = (/** @type {?} */ (((responseType !== 'json') ? responseType : 'text')));
            }
            // Serialize the request body if one is present. If not, this will be set to null.
            /** @type {?} */
            const reqBody = req.serializeBody();
            // If progress events are enabled, response headers will be delivered
            // in two events - the HttpHeaderResponse event and the full HttpResponse
            // event. However, since response headers don't change in between these
            // two events, it doesn't make sense to parse them twice. So headerResponse
            // caches the data extracted from the response whenever it's first parsed,
            // to ensure parsing isn't duplicated.
            /** @type {?} */
            let headerResponse = null;
            // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
            // state, and memoizes it into headerResponse.
            /** @type {?} */
            const partialFromXhr = (/**
             * @return {?}
             */
            () => {
                if (headerResponse !== null) {
                    return headerResponse;
                }
                // Read status and normalize an IE9 bug (http://bugs.jquery.com/ticket/1450).
                /** @type {?} */
                const status = xhr.status === 1223 ? 204 : xhr.status;
                /** @type {?} */
                const statusText = xhr.statusText || 'OK';
                // Parse headers from XMLHttpRequest - this step is lazy.
                /** @type {?} */
                const headers = new HttpHeaders(xhr.getAllResponseHeaders());
                // Read the response URL from the XMLHttpResponse instance and fall back on the
                // request URL.
                /** @type {?} */
                const url = getResponseUrl(xhr) || req.url;
                // Construct the HttpHeaderResponse and memoize it.
                headerResponse = new HttpHeaderResponse({ headers, status, statusText, url });
                return headerResponse;
            });
            // Next, a few closures are defined for the various events which XMLHttpRequest can
            // emit. This allows them to be unregistered as event listeners later.
            // First up is the load event, which represents a response being fully available.
            /** @type {?} */
            const onLoad = (/**
             * @return {?}
             */
            () => {
                // Read response state from the memoized partial data.
                let { headers, status, statusText, url } = partialFromXhr();
                // The body will be read out if present.
                /** @type {?} */
                let body = null;
                if (status !== 204) {
                    // Use XMLHttpRequest.response if set, responseText otherwise.
                    body = (typeof xhr.response === 'undefined') ? xhr.responseText : xhr.response;
                }
                // Normalize another potential bug (this one comes from CORS).
                if (status === 0) {
                    status = !!body ? 200 : 0;
                }
                // ok determines whether the response will be transmitted on the event or
                // error channel. Unsuccessful status codes (not 2xx) will always be errors,
                // but a successful status code can still result in an error if the user
                // asked for JSON data and the body cannot be parsed as such.
                /** @type {?} */
                let ok = status >= 200 && status < 300;
                // Check whether the body needs to be parsed as JSON (in many cases the browser
                // will have done that already).
                if (req.responseType === 'json' && typeof body === 'string') {
                    // Save the original body, before attempting XSSI prefix stripping.
                    /** @type {?} */
                    const originalBody = body;
                    body = body.replace(XSSI_PREFIX, '');
                    try {
                        // Attempt the parse. If it fails, a parse error should be delivered to the user.
                        body = body !== '' ? JSON.parse(body) : null;
                    }
                    catch (error) {
                        // Since the JSON.parse failed, it's reasonable to assume this might not have been a
                        // JSON response. Restore the original body (including any XSSI prefix) to deliver
                        // a better error response.
                        body = originalBody;
                        // If this was an error request to begin with, leave it as a string, it probably
                        // just isn't JSON. Otherwise, deliver the parsing error to the user.
                        if (ok) {
                            // Even though the response status was 2xx, this is still an error.
                            ok = false;
                            // The parse error contains the text of the body that failed to parse.
                            body = (/** @type {?} */ ({ error, text: body }));
                        }
                    }
                }
                if (ok) {
                    // A successful response is delivered on the event stream.
                    observer.next(new HttpResponse({
                        body,
                        headers,
                        status,
                        statusText,
                        url: url || undefined,
                    }));
                    // The full body has been received and delivered, no further events
                    // are possible. This request is complete.
                    observer.complete();
                }
                else {
                    // An unsuccessful request is delivered on the error channel.
                    observer.error(new HttpErrorResponse({
                        // The error in this case is the response body (error from the server).
                        error: body,
                        headers,
                        status,
                        statusText,
                        url: url || undefined,
                    }));
                }
            });
            // The onError callback is called when something goes wrong at the network level.
            // Connection timeout, DNS error, offline, etc. These are actual errors, and are
            // transmitted on the error channel.
            /** @type {?} */
            const onError = (/**
             * @param {?} error
             * @return {?}
             */
            (error) => {
                const { url } = partialFromXhr();
                /** @type {?} */
                const res = new HttpErrorResponse({
                    error,
                    status: xhr.status || 0,
                    statusText: xhr.statusText || 'Unknown Error',
                    url: url || undefined,
                });
                observer.error(res);
            });
            // The sentHeaders flag tracks whether the HttpResponseHeaders event
            // has been sent on the stream. This is necessary to track if progress
            // is enabled since the event will be sent on only the first download
            // progerss event.
            /** @type {?} */
            let sentHeaders = false;
            // The download progress event handler, which is only registered if
            // progress events are enabled.
            /** @type {?} */
            const onDownProgress = (/**
             * @param {?} event
             * @return {?}
             */
            (event) => {
                // Send the HttpResponseHeaders event if it hasn't been sent already.
                if (!sentHeaders) {
                    observer.next(partialFromXhr());
                    sentHeaders = true;
                }
                // Start building the download progress event to deliver on the response
                // event stream.
                /** @type {?} */
                let progressEvent = {
                    type: HttpEventType.DownloadProgress,
                    loaded: event.loaded,
                };
                // Set the total number of bytes in the event if it's available.
                if (event.lengthComputable) {
                    progressEvent.total = event.total;
                }
                // If the request was for text content and a partial response is
                // available on XMLHttpRequest, include it in the progress event
                // to allow for streaming reads.
                if (req.responseType === 'text' && !!xhr.responseText) {
                    progressEvent.partialText = xhr.responseText;
                }
                // Finally, fire the event.
                observer.next(progressEvent);
            });
            // The upload progress event handler, which is only registered if
            // progress events are enabled.
            /** @type {?} */
            const onUpProgress = (/**
             * @param {?} event
             * @return {?}
             */
            (event) => {
                // Upload progress events are simpler. Begin building the progress
                // event.
                /** @type {?} */
                let progress = {
                    type: HttpEventType.UploadProgress,
                    loaded: event.loaded,
                };
                // If the total number of bytes being uploaded is available, include
                // it.
                if (event.lengthComputable) {
                    progress.total = event.total;
                }
                // Send the event.
                observer.next(progress);
            });
            // By default, register for load and error events.
            xhr.addEventListener('load', onLoad);
            xhr.addEventListener('error', onError);
            // Progress events are only enabled if requested.
            if (req.reportProgress) {
                // Download progress is always enabled if requested.
                xhr.addEventListener('progress', onDownProgress);
                // Upload progress depends on whether there is a body to upload.
                if (reqBody !== null && xhr.upload) {
                    xhr.upload.addEventListener('progress', onUpProgress);
                }
            }
            // Fire the request, and notify the event stream that it was fired.
            xhr.send((/** @type {?} */ (reqBody)));
            observer.next({ type: HttpEventType.Sent });
            // This is the return from the Observable function, which is the
            // request cancellation handler.
            return (/**
             * @return {?}
             */
            () => {
                // On a cancellation, remove all registered event listeners.
                xhr.removeEventListener('error', onError);
                xhr.removeEventListener('load', onLoad);
                if (req.reportProgress) {
                    xhr.removeEventListener('progress', onDownProgress);
                    if (reqBody !== null && xhr.upload) {
                        xhr.upload.removeEventListener('progress', onUpProgress);
                    }
                }
                // Finally, abort the in-flight request.
                xhr.abort();
            });
        }));
    }
}
HttpXhrBackend.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpXhrBackend.ctorParameters = () => [
    { type: XhrFactory }
];
/** @nocollapse */ HttpXhrBackend.ɵfac = function HttpXhrBackend_Factory(t) { return new (t || HttpXhrBackend)(i0.ɵɵinject(XhrFactory)); };
/** @nocollapse */ HttpXhrBackend.ɵprov = i0.ɵɵdefineInjectable({ token: HttpXhrBackend, factory: function (t) { return HttpXhrBackend.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpXhrBackend, [{
        type: Injectable
    }], function () { return [{ type: XhrFactory }]; }, null);
if (false) {
    /**
     * @type {?}
     * @private
     */
    HttpXhrBackend.prototype.xhrFactory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBRzFDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFdEMsT0FBTyxFQUE0QixpQkFBaUIsRUFBYSxhQUFhLEVBQUUsa0JBQWtCLEVBQXNCLFlBQVksRUFBMEIsTUFBTSxZQUFZLENBQUM7Ozs7Ozs7Ozs7TUFFM0ssV0FBVyxHQUFHLGNBQWM7Ozs7Ozs7QUFNbEMsU0FBUyxjQUFjLENBQUMsR0FBUTtJQUM5QixJQUFJLGFBQWEsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRTtRQUMzQyxPQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUM7S0FDeEI7SUFDRCxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFFO1FBQ3hELE9BQU8sR0FBRyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDOzs7Ozs7O0FBT0QsTUFBTSxPQUFnQixVQUFVO0NBQXNDOzs7Ozs7SUFBbkMsNkNBQWlDOzs7Ozs7QUFPcEUsTUFBTSxPQUFPLFVBQVU7SUFDckIsZ0JBQWUsQ0FBQzs7OztJQUNoQixLQUFLLEtBQVUsT0FBTyxtQkFBSyxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsRUFBQSxDQUFDLENBQUMsQ0FBQzs7O1lBSHJELFVBQVU7Ozs7b0VBQ0UsVUFBVTtrREFBVixVQUFVLGlDQUFWLFVBQVU7bUNBQVYsVUFBVTtjQUR0QixVQUFVOzs7Ozs7QUFTWCw4QkFLQzs7O0lBSkMs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bUJBQW1CLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUNwRCxJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTt3QkFDbEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7cUJBQzFEO2lCQUNGO2dCQUVELHdDQUF3QztnQkFDeEMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsQ0FBQyxFQUFDO1FBQ0osQ0FBQyxFQUFDLENBQUM7SUFDTCxDQUFDOzs7WUFsUkYsVUFBVTs7OztZQUV1QixVQUFVOzs0RUFEL0IsY0FBYyxjQUNPLFVBQVU7c0RBRC9CLGNBQWMsaUNBQWQsY0FBYzttQ0FBZCxjQUFjO2NBRDFCLFVBQVU7c0NBRXVCLFVBQVU7Ozs7OztJQUE5QixvQ0FBOEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50LCBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwSGVhZGVyUmVzcG9uc2UsIEh0dHBKc29uUGFyc2VFcnJvciwgSHR0cFJlc3BvbnNlLCBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmNvbnN0IFhTU0lfUFJFRklYID0gL15cXClcXF1cXH0nLD9cXG4vO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiBYTUxIdHRwUmVxdWVzdC5yZXNwb25zZVVSTCBvciB0aGUgWC1SZXF1ZXN0LVVSTCBoZWFkZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlVXJsKHhocjogYW55KTogc3RyaW5nfG51bGwge1xuICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgJiYgeGhyLnJlc3BvbnNlVVJMKSB7XG4gICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTDtcbiAgfVxuICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIHRoZSBgWE1MSHR0cFJlcXVlc3RgIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFhockZhY3RvcnkgeyBhYnN0cmFjdCBidWlsZCgpOiBYTUxIdHRwUmVxdWVzdDsgfVxuXG4vKipcbiAqIEEgZmFjdG9yeSBmb3IgYEh0dHBYaHJCYWNrZW5kYCB0aGF0IHVzZXMgdGhlIGBYTUxIdHRwUmVxdWVzdGAgYnJvd3NlciBBUEkuXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3NlclhociBpbXBsZW1lbnRzIFhockZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIGJ1aWxkKCk6IGFueSB7IHJldHVybiA8YW55PihuZXcgWE1MSHR0cFJlcXVlc3QoKSk7IH1cbn1cblxuLyoqXG4gKiBUcmFja3MgYSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIgdGhhdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIGJvZHkuXG4gKi9cbmludGVyZmFjZSBQYXJ0aWFsUmVzcG9uc2Uge1xuICBoZWFkZXJzOiBIdHRwSGVhZGVycztcbiAgc3RhdHVzOiBudW1iZXI7XG4gIHN0YXR1c1RleHQ6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVXNlcyBgWE1MSHR0cFJlcXVlc3RgIHRvIHNlbmQgcmVxdWVzdHMgdG8gYSBiYWNrZW5kIHNlcnZlci5cbiAqIEBzZWUgYEh0dHBIYW5kbGVyYFxuICogQHNlZSBgSnNvbnBDbGllbnRCYWNrZW5kYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYaHJCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHhockZhY3Rvcnk6IFhockZhY3RvcnkpIHt9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyBhIHJlcXVlc3QgYW5kIHJldHVybnMgYSBzdHJlYW0gb2YgcmVzcG9uc2UgZXZlbnRzLlxuICAgKiBAcGFyYW0gcmVxIFRoZSByZXF1ZXN0IG9iamVjdC5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgcmVzcG9uc2UgZXZlbnRzLlxuICAgKi9cbiAgaGFuZGxlKHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBRdWljayBjaGVjayB0byBnaXZlIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2Ugd2hlbiBhIHVzZXIgYXR0ZW1wdHMgdG8gdXNlXG4gICAgLy8gSHR0cENsaWVudC5qc29ucCgpIHdpdGhvdXQgaW5zdGFsbGluZyB0aGUgSnNvbnBDbGllbnRNb2R1bGVcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdHRlbXB0ZWQgdG8gY29uc3RydWN0IEpzb25wIHJlcXVlc3Qgd2l0aG91dCBKc29ucENsaWVudE1vZHVsZSBpbnN0YWxsZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBoYXBwZW5zIG9uIE9ic2VydmFibGUgc3Vic2NyaXB0aW9uLlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgLy8gU3RhcnQgYnkgc2V0dGluZyB1cCB0aGUgWEhSIG9iamVjdCB3aXRoIHJlcXVlc3QgbWV0aG9kLCBVUkwsIGFuZCB3aXRoQ3JlZGVudGlhbHMgZmxhZy5cbiAgICAgIGNvbnN0IHhociA9IHRoaXMueGhyRmFjdG9yeS5idWlsZCgpO1xuICAgICAgeGhyLm9wZW4ocmVxLm1ldGhvZCwgcmVxLnVybFdpdGhQYXJhbXMpO1xuICAgICAgaWYgKCEhcmVxLndpdGhDcmVkZW50aWFscykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFsbCB0aGUgcmVxdWVzdGVkIGhlYWRlcnMuXG4gICAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKicpO1xuICAgICAgfVxuXG4gICAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBkZXRlY3RlZFR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2VUeXBlIGlmIG9uZSB3YXMgcmVxdWVzdGVkLlxuICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VUeXBlID0gcmVxLnJlc3BvbnNlVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIC8vIEpTT04gcmVzcG9uc2VzIG5lZWQgdG8gYmUgcHJvY2Vzc2VkIGFzIHRleHQuIFRoaXMgaXMgYmVjYXVzZSBpZiB0aGUgc2VydmVyXG4gICAgICAgIC8vIHJldHVybnMgYW4gWFNTSS1wcmVmaXhlZCBKU09OIHJlc3BvbnNlLCB0aGUgYnJvd3NlciB3aWxsIGZhaWwgdG8gcGFyc2UgaXQsXG4gICAgICAgIC8vIHhoci5yZXNwb25zZSB3aWxsIGJlIG51bGwsIGFuZCB4aHIucmVzcG9uc2VUZXh0IGNhbm5vdCBiZSBhY2Nlc3NlZCB0b1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgcHJlZml4ZWQgSlNPTiBkYXRhIGluIG9yZGVyIHRvIHN0cmlwIHRoZSBwcmVmaXguIFRodXMsIGFsbCBKU09OXG4gICAgICAgIC8vIGlzIHBhcnNlZCBieSBmaXJzdCByZXF1ZXN0aW5nIHRleHQgYW5kIHRoZW4gYXBwbHlpbmcgSlNPTi5wYXJzZS5cbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICgocmVzcG9uc2VUeXBlICE9PSAnanNvbicpID8gcmVzcG9uc2VUeXBlIDogJ3RleHQnKSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlcmlhbGl6ZSB0aGUgcmVxdWVzdCBib2R5IGlmIG9uZSBpcyBwcmVzZW50LiBJZiBub3QsIHRoaXMgd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAgICAgIGNvbnN0IHJlcUJvZHkgPSByZXEuc2VyaWFsaXplQm9keSgpO1xuXG4gICAgICAvLyBJZiBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQsIHJlc3BvbnNlIGhlYWRlcnMgd2lsbCBiZSBkZWxpdmVyZWRcbiAgICAgIC8vIGluIHR3byBldmVudHMgLSB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGV2ZW50IGFuZCB0aGUgZnVsbCBIdHRwUmVzcG9uc2VcbiAgICAgIC8vIGV2ZW50LiBIb3dldmVyLCBzaW5jZSByZXNwb25zZSBoZWFkZXJzIGRvbid0IGNoYW5nZSBpbiBiZXR3ZWVuIHRoZXNlXG4gICAgICAvLyB0d28gZXZlbnRzLCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gcGFyc2UgdGhlbSB0d2ljZS4gU28gaGVhZGVyUmVzcG9uc2VcbiAgICAgIC8vIGNhY2hlcyB0aGUgZGF0YSBleHRyYWN0ZWQgZnJvbSB0aGUgcmVzcG9uc2Ugd2hlbmV2ZXIgaXQncyBmaXJzdCBwYXJzZWQsXG4gICAgICAvLyB0byBlbnN1cmUgcGFyc2luZyBpc24ndCBkdXBsaWNhdGVkLlxuICAgICAgbGV0IGhlYWRlclJlc3BvbnNlOiBIdHRwSGVhZGVyUmVzcG9uc2V8bnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIHBhcnRpYWxGcm9tWGhyIGV4dHJhY3RzIHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgZnJvbSB0aGUgY3VycmVudCBYTUxIdHRwUmVxdWVzdFxuICAgICAgLy8gc3RhdGUsIGFuZCBtZW1vaXplcyBpdCBpbnRvIGhlYWRlclJlc3BvbnNlLlxuICAgICAgY29uc3QgcGFydGlhbEZyb21YaHIgPSAoKTogSHR0cEhlYWRlclJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKGhlYWRlclJlc3BvbnNlICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBzdGF0dXMgYW5kIG5vcm1hbGl6ZSBhbiBJRTkgYnVnIChodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xNDUwKS5cbiAgICAgICAgY29uc3Qgc3RhdHVzOiBudW1iZXIgPSB4aHIuc3RhdHVzID09PSAxMjIzID8gMjA0IDogeGhyLnN0YXR1cztcbiAgICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0IHx8ICdPSyc7XG5cbiAgICAgICAgLy8gUGFyc2UgaGVhZGVycyBmcm9tIFhNTEh0dHBSZXF1ZXN0IC0gdGhpcyBzdGVwIGlzIGxhenkuXG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcblxuICAgICAgICAvLyBSZWFkIHRoZSByZXNwb25zZSBVUkwgZnJvbSB0aGUgWE1MSHR0cFJlc3BvbnNlIGluc3RhbmNlIGFuZCBmYWxsIGJhY2sgb24gdGhlXG4gICAgICAgIC8vIHJlcXVlc3QgVVJMLlxuICAgICAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybCh4aHIpIHx8IHJlcS51cmw7XG5cbiAgICAgICAgLy8gQ29uc3RydWN0IHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgYW5kIG1lbW9pemUgaXQuXG4gICAgICAgIGhlYWRlclJlc3BvbnNlID0gbmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KTtcbiAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgfTtcblxuICAgICAgLy8gTmV4dCwgYSBmZXcgY2xvc3VyZXMgYXJlIGRlZmluZWQgZm9yIHRoZSB2YXJpb3VzIGV2ZW50cyB3aGljaCBYTUxIdHRwUmVxdWVzdCBjYW5cbiAgICAgIC8vIGVtaXQuIFRoaXMgYWxsb3dzIHRoZW0gdG8gYmUgdW5yZWdpc3RlcmVkIGFzIGV2ZW50IGxpc3RlbmVycyBsYXRlci5cblxuICAgICAgLy8gRmlyc3QgdXAgaXMgdGhlIGxvYWQgZXZlbnQsIHdoaWNoIHJlcHJlc2VudHMgYSByZXNwb25zZSBiZWluZyBmdWxseSBhdmFpbGFibGUuXG4gICAgICBjb25zdCBvbkxvYWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFJlYWQgcmVzcG9uc2Ugc3RhdGUgZnJvbSB0aGUgbWVtb2l6ZWQgcGFydGlhbCBkYXRhLlxuICAgICAgICBsZXQge2hlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSA9IHBhcnRpYWxGcm9tWGhyKCk7XG5cbiAgICAgICAgLy8gVGhlIGJvZHkgd2lsbCBiZSByZWFkIG91dCBpZiBwcmVzZW50LlxuICAgICAgICBsZXQgYm9keTogYW55fG51bGwgPSBudWxsO1xuXG4gICAgICAgIGlmIChzdGF0dXMgIT09IDIwNCkge1xuICAgICAgICAgIC8vIFVzZSBYTUxIdHRwUmVxdWVzdC5yZXNwb25zZSBpZiBzZXQsIHJlc3BvbnNlVGV4dCBvdGhlcndpc2UuXG4gICAgICAgICAgYm9keSA9ICh0eXBlb2YgeGhyLnJlc3BvbnNlID09PSAndW5kZWZpbmVkJykgPyB4aHIucmVzcG9uc2VUZXh0IDogeGhyLnJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9ybWFsaXplIGFub3RoZXIgcG90ZW50aWFsIGJ1ZyAodGhpcyBvbmUgY29tZXMgZnJvbSBDT1JTKS5cbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgIHN0YXR1cyA9ICEhYm9keSA/IDIwMCA6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAgICAgLy8gYnV0IGEgc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZSBjYW4gc3RpbGwgcmVzdWx0IGluIGFuIGVycm9yIGlmIHRoZSB1c2VyXG4gICAgICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICAgICAgbGV0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgYm9keSBuZWVkcyB0byBiZSBwYXJzZWQgYXMgSlNPTiAoaW4gbWFueSBjYXNlcyB0aGUgYnJvd3NlclxuICAgICAgICAvLyB3aWxsIGhhdmUgZG9uZSB0aGF0IGFscmVhZHkpLlxuICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nICYmIHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIGJvZHksIGJlZm9yZSBhdHRlbXB0aW5nIFhTU0kgcHJlZml4IHN0cmlwcGluZy5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbEJvZHkgPSBib2R5O1xuICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQXR0ZW1wdCB0aGUgcGFyc2UuIElmIGl0IGZhaWxzLCBhIHBhcnNlIGVycm9yIHNob3VsZCBiZSBkZWxpdmVyZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBib2R5ID0gYm9keSAhPT0gJycgPyBKU09OLnBhcnNlKGJvZHkpIDogbnVsbDtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gU2luY2UgdGhlIEpTT04ucGFyc2UgZmFpbGVkLCBpdCdzIHJlYXNvbmFibGUgdG8gYXNzdW1lIHRoaXMgbWlnaHQgbm90IGhhdmUgYmVlbiBhXG4gICAgICAgICAgICAvLyBKU09OIHJlc3BvbnNlLiBSZXN0b3JlIHRoZSBvcmlnaW5hbCBib2R5IChpbmNsdWRpbmcgYW55IFhTU0kgcHJlZml4KSB0byBkZWxpdmVyXG4gICAgICAgICAgICAvLyBhIGJldHRlciBlcnJvciByZXNwb25zZS5cbiAgICAgICAgICAgIGJvZHkgPSBvcmlnaW5hbEJvZHk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoaXMgd2FzIGFuIGVycm9yIHJlcXVlc3QgdG8gYmVnaW4gd2l0aCwgbGVhdmUgaXQgYXMgYSBzdHJpbmcsIGl0IHByb2JhYmx5XG4gICAgICAgICAgICAvLyBqdXN0IGlzbid0IEpTT04uIE90aGVyd2lzZSwgZGVsaXZlciB0aGUgcGFyc2luZyBlcnJvciB0byB0aGUgdXNlci5cbiAgICAgICAgICAgIGlmIChvaykge1xuICAgICAgICAgICAgICAvLyBFdmVuIHRob3VnaCB0aGUgcmVzcG9uc2Ugc3RhdHVzIHdhcyAyeHgsIHRoaXMgaXMgc3RpbGwgYW4gZXJyb3IuXG4gICAgICAgICAgICAgIG9rID0gZmFsc2U7XG4gICAgICAgICAgICAgIC8vIFRoZSBwYXJzZSBlcnJvciBjb250YWlucyB0aGUgdGV4dCBvZiB0aGUgYm9keSB0aGF0IGZhaWxlZCB0byBwYXJzZS5cbiAgICAgICAgICAgICAgYm9keSA9IHsgZXJyb3IsIHRleHQ6IGJvZHkgfSBhcyBIdHRwSnNvblBhcnNlRXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9rKSB7XG4gICAgICAgICAgLy8gQSBzdWNjZXNzZnVsIHJlc3BvbnNlIGlzIGRlbGl2ZXJlZCBvbiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgICAgICAgIG9ic2VydmVyLm5leHQobmV3IEh0dHBSZXNwb25zZSh7XG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgICB1cmw6IHVybCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGUuIFRoaXMgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEFuIHVuc3VjY2Vzc2Z1bCByZXF1ZXN0IGlzIGRlbGl2ZXJlZCBvbiB0aGUgZXJyb3IgY2hhbm5lbC5cbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgICAgLy8gVGhlIGVycm9yIGluIHRoaXMgY2FzZSBpcyB0aGUgcmVzcG9uc2UgYm9keSAoZXJyb3IgZnJvbSB0aGUgc2VydmVyKS5cbiAgICAgICAgICAgIGVycm9yOiBib2R5LFxuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgICB1cmw6IHVybCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgb25FcnJvciBjYWxsYmFjayBpcyBjYWxsZWQgd2hlbiBzb21ldGhpbmcgZ29lcyB3cm9uZyBhdCB0aGUgbmV0d29yayBsZXZlbC5cbiAgICAgIC8vIENvbm5lY3Rpb24gdGltZW91dCwgRE5TIGVycm9yLCBvZmZsaW5lLCBldGMuIFRoZXNlIGFyZSBhY3R1YWwgZXJyb3JzLCBhbmQgYXJlXG4gICAgICAvLyB0cmFuc21pdHRlZCBvbiB0aGUgZXJyb3IgY2hhbm5lbC5cbiAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZXJyb3I6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qge3VybH0gPSBwYXJ0aWFsRnJvbVhocigpO1xuICAgICAgICBjb25zdCByZXMgPSBuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyB8fCAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0IHx8ICdVbmtub3duIEVycm9yJyxcbiAgICAgICAgICB1cmw6IHVybCB8fCB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5lcnJvcihyZXMpO1xuICAgICAgfTtcblxuICAgICAgLy8gVGhlIHNlbnRIZWFkZXJzIGZsYWcgdHJhY2tzIHdoZXRoZXIgdGhlIEh0dHBSZXNwb25zZUhlYWRlcnMgZXZlbnRcbiAgICAgIC8vIGhhcyBiZWVuIHNlbnQgb24gdGhlIHN0cmVhbS4gVGhpcyBpcyBuZWNlc3NhcnkgdG8gdHJhY2sgaWYgcHJvZ3Jlc3NcbiAgICAgIC8vIGlzIGVuYWJsZWQgc2luY2UgdGhlIGV2ZW50IHdpbGwgYmUgc2VudCBvbiBvbmx5IHRoZSBmaXJzdCBkb3dubG9hZFxuICAgICAgLy8gcHJvZ2Vyc3MgZXZlbnQuXG4gICAgICBsZXQgc2VudEhlYWRlcnMgPSBmYWxzZTtcblxuICAgICAgLy8gVGhlIGRvd25sb2FkIHByb2dyZXNzIGV2ZW50IGhhbmRsZXIsIHdoaWNoIGlzIG9ubHkgcmVnaXN0ZXJlZCBpZlxuICAgICAgLy8gcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLlxuICAgICAgY29uc3Qgb25Eb3duUHJvZ3Jlc3MgPSAoZXZlbnQ6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgLy8gU2VuZCB0aGUgSHR0cFJlc3BvbnNlSGVhZGVycyBldmVudCBpZiBpdCBoYXNuJ3QgYmVlbiBzZW50IGFscmVhZHkuXG4gICAgICAgIGlmICghc2VudEhlYWRlcnMpIHtcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHBhcnRpYWxGcm9tWGhyKCkpO1xuICAgICAgICAgIHNlbnRIZWFkZXJzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IGJ1aWxkaW5nIHRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCB0byBkZWxpdmVyIG9uIHRoZSByZXNwb25zZVxuICAgICAgICAvLyBldmVudCBzdHJlYW0uXG4gICAgICAgIGxldCBwcm9ncmVzc0V2ZW50OiBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50ID0ge1xuICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcyxcbiAgICAgICAgICBsb2FkZWQ6IGV2ZW50LmxvYWRlZCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZXQgdGhlIHRvdGFsIG51bWJlciBvZiBieXRlcyBpbiB0aGUgZXZlbnQgaWYgaXQncyBhdmFpbGFibGUuXG4gICAgICAgIGlmIChldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgcHJvZ3Jlc3NFdmVudC50b3RhbCA9IGV2ZW50LnRvdGFsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3Qgd2FzIGZvciB0ZXh0IGNvbnRlbnQgYW5kIGEgcGFydGlhbCByZXNwb25zZSBpc1xuICAgICAgICAvLyBhdmFpbGFibGUgb24gWE1MSHR0cFJlcXVlc3QsIGluY2x1ZGUgaXQgaW4gdGhlIHByb2dyZXNzIGV2ZW50XG4gICAgICAgIC8vIHRvIGFsbG93IGZvciBzdHJlYW1pbmcgcmVhZHMuXG4gICAgICAgIGlmIChyZXEucmVzcG9uc2VUeXBlID09PSAndGV4dCcgJiYgISF4aHIucmVzcG9uc2VUZXh0KSB7XG4gICAgICAgICAgcHJvZ3Jlc3NFdmVudC5wYXJ0aWFsVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBmaXJlIHRoZSBldmVudC5cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChwcm9ncmVzc0V2ZW50KTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciwgd2hpY2ggaXMgb25seSByZWdpc3RlcmVkIGlmXG4gICAgICAvLyBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQuXG4gICAgICBjb25zdCBvblVwUHJvZ3Jlc3MgPSAoZXZlbnQ6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgLy8gVXBsb2FkIHByb2dyZXNzIGV2ZW50cyBhcmUgc2ltcGxlci4gQmVnaW4gYnVpbGRpbmcgdGhlIHByb2dyZXNzXG4gICAgICAgIC8vIGV2ZW50LlxuICAgICAgICBsZXQgcHJvZ3Jlc3M6IEh0dHBVcGxvYWRQcm9ncmVzc0V2ZW50ID0ge1xuICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuVXBsb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSWYgdGhlIHRvdGFsIG51bWJlciBvZiBieXRlcyBiZWluZyB1cGxvYWRlZCBpcyBhdmFpbGFibGUsIGluY2x1ZGVcbiAgICAgICAgLy8gaXQuXG4gICAgICAgIGlmIChldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgcHJvZ3Jlc3MudG90YWwgPSBldmVudC50b3RhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlbmQgdGhlIGV2ZW50LlxuICAgICAgICBvYnNlcnZlci5uZXh0KHByb2dyZXNzKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIEJ5IGRlZmF1bHQsIHJlZ2lzdGVyIGZvciBsb2FkIGFuZCBlcnJvciBldmVudHMuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcblxuICAgICAgLy8gUHJvZ3Jlc3MgZXZlbnRzIGFyZSBvbmx5IGVuYWJsZWQgaWYgcmVxdWVzdGVkLlxuICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAvLyBEb3dubG9hZCBwcm9ncmVzcyBpcyBhbHdheXMgZW5hYmxlZCBpZiByZXF1ZXN0ZWQuXG4gICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uRG93blByb2dyZXNzKTtcblxuICAgICAgICAvLyBVcGxvYWQgcHJvZ3Jlc3MgZGVwZW5kcyBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgYm9keSB0byB1cGxvYWQuXG4gICAgICAgIGlmIChyZXFCb2R5ICE9PSBudWxsICYmIHhoci51cGxvYWQpIHtcbiAgICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25VcFByb2dyZXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBGaXJlIHRoZSByZXF1ZXN0LCBhbmQgbm90aWZ5IHRoZSBldmVudCBzdHJlYW0gdGhhdCBpdCB3YXMgZmlyZWQuXG4gICAgICB4aHIuc2VuZChyZXFCb2R5ICEpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIFRoaXMgaXMgdGhlIHJldHVybiBmcm9tIHRoZSBPYnNlcnZhYmxlIGZ1bmN0aW9uLCB3aGljaCBpcyB0aGVcbiAgICAgIC8vIHJlcXVlc3QgY2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBPbiBhIGNhbmNlbGxhdGlvbiwgcmVtb3ZlIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uRG93blByb2dyZXNzKTtcbiAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICB4aHIudXBsb2FkLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25VcFByb2dyZXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBhYm9ydCB0aGUgaW4tZmxpZ2h0IHJlcXVlc3QuXG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19