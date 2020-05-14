/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/http/src/xhr.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
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
let BrowserXhr = /** @class */ (() => {
    /**
     * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
     *
     */
    class BrowserXhr {
        constructor() { }
        /**
         * @return {?}
         */
        build() {
            return (/** @type {?} */ ((new XMLHttpRequest())));
        }
    }
    BrowserXhr.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    BrowserXhr.ctorParameters = () => [];
    return BrowserXhr;
})();
export { BrowserXhr };
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
let HttpXhrBackend = /** @class */ (() => {
    /**
     * Uses `XMLHttpRequest` to send requests to a backend server.
     * @see `HttpHandler`
     * @see `JsonpClientBackend`
     *
     * \@publicApi
     */
    class HttpXhrBackend {
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
        { type: Injectable }
    ];
    /** @nocollapse */
    HttpXhrBackend.ctorParameters = () => [
        { type: XhrFactory }
    ];
    return HttpXhrBackend;
})();
export { HttpXhrBackend };
if (false) {
    /**
     * @type {?}
     * @private
     */
    HttpXhrBackend.prototype.xhrFactory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBc0IsWUFBWSxFQUEwQixNQUFNLFlBQVksQ0FBQzs7TUFFM0ssV0FBVyxHQUFHLGNBQWM7Ozs7Ozs7QUFNbEMsU0FBUyxjQUFjLENBQUMsR0FBUTtJQUM5QixJQUFJLGFBQWEsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRTtRQUMzQyxPQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUM7S0FDeEI7SUFDRCxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFFO1FBQ3hELE9BQU8sR0FBRyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDOzs7Ozs7O0FBT0QsTUFBTSxPQUFnQixVQUFVO0NBRS9COzs7Ozs7SUFEQyw2Q0FBaUM7Ozs7OztBQU9uQzs7Ozs7SUFBQSxNQUNhLFVBQVU7UUFDckIsZ0JBQWUsQ0FBQzs7OztRQUNoQixLQUFLO1lBQ0gsT0FBTyxtQkFBSyxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsRUFBQSxDQUFDO1FBQ3JDLENBQUM7OztnQkFMRixVQUFVOzs7O0lBTVgsaUJBQUM7S0FBQTtTQUxZLFVBQVU7Ozs7O0FBVXZCLDhCQUtDOzs7SUFKQyxrQ0FBcUI7O0lBQ3JCLGlDQUFlOztJQUNm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QUFFO3dCQUN0QixHQUFHLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO3dCQUNwRCxJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTs0QkFDbEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7eUJBQzFEO3FCQUNGO29CQUVELHdDQUF3QztvQkFDeEMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNkLENBQUMsRUFBQztZQUNKLENBQUMsRUFBQyxDQUFDO1FBQ0wsQ0FBQzs7O2dCQWxSRixVQUFVOzs7O2dCQUV1QixVQUFVOztJQWlSNUMscUJBQUM7S0FBQTtTQWxSWSxjQUFjOzs7Ozs7SUFDYixvQ0FBOEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50LCBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwSGVhZGVyUmVzcG9uc2UsIEh0dHBKc29uUGFyc2VFcnJvciwgSHR0cFJlc3BvbnNlLCBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmNvbnN0IFhTU0lfUFJFRklYID0gL15cXClcXF1cXH0nLD9cXG4vO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiBYTUxIdHRwUmVxdWVzdC5yZXNwb25zZVVSTCBvciB0aGUgWC1SZXF1ZXN0LVVSTCBoZWFkZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlVXJsKHhocjogYW55KTogc3RyaW5nfG51bGwge1xuICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgJiYgeGhyLnJlc3BvbnNlVVJMKSB7XG4gICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTDtcbiAgfVxuICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIHRoZSBgWE1MSHR0cFJlcXVlc3RgIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFhockZhY3Rvcnkge1xuICBhYnN0cmFjdCBidWlsZCgpOiBYTUxIdHRwUmVxdWVzdDtcbn1cblxuLyoqXG4gKiBBIGZhY3RvcnkgZm9yIGBIdHRwWGhyQmFja2VuZGAgdGhhdCB1c2VzIHRoZSBgWE1MSHR0cFJlcXVlc3RgIGJyb3dzZXIgQVBJLlxuICpcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJYaHIgaW1wbGVtZW50cyBYaHJGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoKSB7fVxuICBidWlsZCgpOiBhbnkge1xuICAgIHJldHVybiA8YW55PihuZXcgWE1MSHR0cFJlcXVlc3QoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFja3MgYSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIgdGhhdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIGJvZHkuXG4gKi9cbmludGVyZmFjZSBQYXJ0aWFsUmVzcG9uc2Uge1xuICBoZWFkZXJzOiBIdHRwSGVhZGVycztcbiAgc3RhdHVzOiBudW1iZXI7XG4gIHN0YXR1c1RleHQ6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVXNlcyBgWE1MSHR0cFJlcXVlc3RgIHRvIHNlbmQgcmVxdWVzdHMgdG8gYSBiYWNrZW5kIHNlcnZlci5cbiAqIEBzZWUgYEh0dHBIYW5kbGVyYFxuICogQHNlZSBgSnNvbnBDbGllbnRCYWNrZW5kYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYaHJCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHhockZhY3Rvcnk6IFhockZhY3RvcnkpIHt9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyBhIHJlcXVlc3QgYW5kIHJldHVybnMgYSBzdHJlYW0gb2YgcmVzcG9uc2UgZXZlbnRzLlxuICAgKiBAcGFyYW0gcmVxIFRoZSByZXF1ZXN0IG9iamVjdC5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgcmVzcG9uc2UgZXZlbnRzLlxuICAgKi9cbiAgaGFuZGxlKHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBRdWljayBjaGVjayB0byBnaXZlIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2Ugd2hlbiBhIHVzZXIgYXR0ZW1wdHMgdG8gdXNlXG4gICAgLy8gSHR0cENsaWVudC5qc29ucCgpIHdpdGhvdXQgaW5zdGFsbGluZyB0aGUgSnNvbnBDbGllbnRNb2R1bGVcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdHRlbXB0ZWQgdG8gY29uc3RydWN0IEpzb25wIHJlcXVlc3Qgd2l0aG91dCBKc29ucENsaWVudE1vZHVsZSBpbnN0YWxsZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBoYXBwZW5zIG9uIE9ic2VydmFibGUgc3Vic2NyaXB0aW9uLlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgLy8gU3RhcnQgYnkgc2V0dGluZyB1cCB0aGUgWEhSIG9iamVjdCB3aXRoIHJlcXVlc3QgbWV0aG9kLCBVUkwsIGFuZCB3aXRoQ3JlZGVudGlhbHMgZmxhZy5cbiAgICAgIGNvbnN0IHhociA9IHRoaXMueGhyRmFjdG9yeS5idWlsZCgpO1xuICAgICAgeGhyLm9wZW4ocmVxLm1ldGhvZCwgcmVxLnVybFdpdGhQYXJhbXMpO1xuICAgICAgaWYgKCEhcmVxLndpdGhDcmVkZW50aWFscykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFsbCB0aGUgcmVxdWVzdGVkIGhlYWRlcnMuXG4gICAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKicpO1xuICAgICAgfVxuXG4gICAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBkZXRlY3RlZFR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2VUeXBlIGlmIG9uZSB3YXMgcmVxdWVzdGVkLlxuICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VUeXBlID0gcmVxLnJlc3BvbnNlVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIC8vIEpTT04gcmVzcG9uc2VzIG5lZWQgdG8gYmUgcHJvY2Vzc2VkIGFzIHRleHQuIFRoaXMgaXMgYmVjYXVzZSBpZiB0aGUgc2VydmVyXG4gICAgICAgIC8vIHJldHVybnMgYW4gWFNTSS1wcmVmaXhlZCBKU09OIHJlc3BvbnNlLCB0aGUgYnJvd3NlciB3aWxsIGZhaWwgdG8gcGFyc2UgaXQsXG4gICAgICAgIC8vIHhoci5yZXNwb25zZSB3aWxsIGJlIG51bGwsIGFuZCB4aHIucmVzcG9uc2VUZXh0IGNhbm5vdCBiZSBhY2Nlc3NlZCB0b1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgcHJlZml4ZWQgSlNPTiBkYXRhIGluIG9yZGVyIHRvIHN0cmlwIHRoZSBwcmVmaXguIFRodXMsIGFsbCBKU09OXG4gICAgICAgIC8vIGlzIHBhcnNlZCBieSBmaXJzdCByZXF1ZXN0aW5nIHRleHQgYW5kIHRoZW4gYXBwbHlpbmcgSlNPTi5wYXJzZS5cbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICgocmVzcG9uc2VUeXBlICE9PSAnanNvbicpID8gcmVzcG9uc2VUeXBlIDogJ3RleHQnKSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlcmlhbGl6ZSB0aGUgcmVxdWVzdCBib2R5IGlmIG9uZSBpcyBwcmVzZW50LiBJZiBub3QsIHRoaXMgd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAgICAgIGNvbnN0IHJlcUJvZHkgPSByZXEuc2VyaWFsaXplQm9keSgpO1xuXG4gICAgICAvLyBJZiBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQsIHJlc3BvbnNlIGhlYWRlcnMgd2lsbCBiZSBkZWxpdmVyZWRcbiAgICAgIC8vIGluIHR3byBldmVudHMgLSB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGV2ZW50IGFuZCB0aGUgZnVsbCBIdHRwUmVzcG9uc2VcbiAgICAgIC8vIGV2ZW50LiBIb3dldmVyLCBzaW5jZSByZXNwb25zZSBoZWFkZXJzIGRvbid0IGNoYW5nZSBpbiBiZXR3ZWVuIHRoZXNlXG4gICAgICAvLyB0d28gZXZlbnRzLCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gcGFyc2UgdGhlbSB0d2ljZS4gU28gaGVhZGVyUmVzcG9uc2VcbiAgICAgIC8vIGNhY2hlcyB0aGUgZGF0YSBleHRyYWN0ZWQgZnJvbSB0aGUgcmVzcG9uc2Ugd2hlbmV2ZXIgaXQncyBmaXJzdCBwYXJzZWQsXG4gICAgICAvLyB0byBlbnN1cmUgcGFyc2luZyBpc24ndCBkdXBsaWNhdGVkLlxuICAgICAgbGV0IGhlYWRlclJlc3BvbnNlOiBIdHRwSGVhZGVyUmVzcG9uc2V8bnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIHBhcnRpYWxGcm9tWGhyIGV4dHJhY3RzIHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgZnJvbSB0aGUgY3VycmVudCBYTUxIdHRwUmVxdWVzdFxuICAgICAgLy8gc3RhdGUsIGFuZCBtZW1vaXplcyBpdCBpbnRvIGhlYWRlclJlc3BvbnNlLlxuICAgICAgY29uc3QgcGFydGlhbEZyb21YaHIgPSAoKTogSHR0cEhlYWRlclJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKGhlYWRlclJlc3BvbnNlICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBzdGF0dXMgYW5kIG5vcm1hbGl6ZSBhbiBJRTkgYnVnIChodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xNDUwKS5cbiAgICAgICAgY29uc3Qgc3RhdHVzOiBudW1iZXIgPSB4aHIuc3RhdHVzID09PSAxMjIzID8gMjA0IDogeGhyLnN0YXR1cztcbiAgICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0IHx8ICdPSyc7XG5cbiAgICAgICAgLy8gUGFyc2UgaGVhZGVycyBmcm9tIFhNTEh0dHBSZXF1ZXN0IC0gdGhpcyBzdGVwIGlzIGxhenkuXG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcblxuICAgICAgICAvLyBSZWFkIHRoZSByZXNwb25zZSBVUkwgZnJvbSB0aGUgWE1MSHR0cFJlc3BvbnNlIGluc3RhbmNlIGFuZCBmYWxsIGJhY2sgb24gdGhlXG4gICAgICAgIC8vIHJlcXVlc3QgVVJMLlxuICAgICAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybCh4aHIpIHx8IHJlcS51cmw7XG5cbiAgICAgICAgLy8gQ29uc3RydWN0IHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgYW5kIG1lbW9pemUgaXQuXG4gICAgICAgIGhlYWRlclJlc3BvbnNlID0gbmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KTtcbiAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgfTtcblxuICAgICAgLy8gTmV4dCwgYSBmZXcgY2xvc3VyZXMgYXJlIGRlZmluZWQgZm9yIHRoZSB2YXJpb3VzIGV2ZW50cyB3aGljaCBYTUxIdHRwUmVxdWVzdCBjYW5cbiAgICAgIC8vIGVtaXQuIFRoaXMgYWxsb3dzIHRoZW0gdG8gYmUgdW5yZWdpc3RlcmVkIGFzIGV2ZW50IGxpc3RlbmVycyBsYXRlci5cblxuICAgICAgLy8gRmlyc3QgdXAgaXMgdGhlIGxvYWQgZXZlbnQsIHdoaWNoIHJlcHJlc2VudHMgYSByZXNwb25zZSBiZWluZyBmdWxseSBhdmFpbGFibGUuXG4gICAgICBjb25zdCBvbkxvYWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFJlYWQgcmVzcG9uc2Ugc3RhdGUgZnJvbSB0aGUgbWVtb2l6ZWQgcGFydGlhbCBkYXRhLlxuICAgICAgICBsZXQge2hlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSA9IHBhcnRpYWxGcm9tWGhyKCk7XG5cbiAgICAgICAgLy8gVGhlIGJvZHkgd2lsbCBiZSByZWFkIG91dCBpZiBwcmVzZW50LlxuICAgICAgICBsZXQgYm9keTogYW55fG51bGwgPSBudWxsO1xuXG4gICAgICAgIGlmIChzdGF0dXMgIT09IDIwNCkge1xuICAgICAgICAgIC8vIFVzZSBYTUxIdHRwUmVxdWVzdC5yZXNwb25zZSBpZiBzZXQsIHJlc3BvbnNlVGV4dCBvdGhlcndpc2UuXG4gICAgICAgICAgYm9keSA9ICh0eXBlb2YgeGhyLnJlc3BvbnNlID09PSAndW5kZWZpbmVkJykgPyB4aHIucmVzcG9uc2VUZXh0IDogeGhyLnJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9ybWFsaXplIGFub3RoZXIgcG90ZW50aWFsIGJ1ZyAodGhpcyBvbmUgY29tZXMgZnJvbSBDT1JTKS5cbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgIHN0YXR1cyA9ICEhYm9keSA/IDIwMCA6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAgICAgLy8gYnV0IGEgc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZSBjYW4gc3RpbGwgcmVzdWx0IGluIGFuIGVycm9yIGlmIHRoZSB1c2VyXG4gICAgICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICAgICAgbGV0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgYm9keSBuZWVkcyB0byBiZSBwYXJzZWQgYXMgSlNPTiAoaW4gbWFueSBjYXNlcyB0aGUgYnJvd3NlclxuICAgICAgICAvLyB3aWxsIGhhdmUgZG9uZSB0aGF0IGFscmVhZHkpLlxuICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nICYmIHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIGJvZHksIGJlZm9yZSBhdHRlbXB0aW5nIFhTU0kgcHJlZml4IHN0cmlwcGluZy5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbEJvZHkgPSBib2R5O1xuICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQXR0ZW1wdCB0aGUgcGFyc2UuIElmIGl0IGZhaWxzLCBhIHBhcnNlIGVycm9yIHNob3VsZCBiZSBkZWxpdmVyZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBib2R5ID0gYm9keSAhPT0gJycgPyBKU09OLnBhcnNlKGJvZHkpIDogbnVsbDtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gU2luY2UgdGhlIEpTT04ucGFyc2UgZmFpbGVkLCBpdCdzIHJlYXNvbmFibGUgdG8gYXNzdW1lIHRoaXMgbWlnaHQgbm90IGhhdmUgYmVlbiBhXG4gICAgICAgICAgICAvLyBKU09OIHJlc3BvbnNlLiBSZXN0b3JlIHRoZSBvcmlnaW5hbCBib2R5IChpbmNsdWRpbmcgYW55IFhTU0kgcHJlZml4KSB0byBkZWxpdmVyXG4gICAgICAgICAgICAvLyBhIGJldHRlciBlcnJvciByZXNwb25zZS5cbiAgICAgICAgICAgIGJvZHkgPSBvcmlnaW5hbEJvZHk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoaXMgd2FzIGFuIGVycm9yIHJlcXVlc3QgdG8gYmVnaW4gd2l0aCwgbGVhdmUgaXQgYXMgYSBzdHJpbmcsIGl0IHByb2JhYmx5XG4gICAgICAgICAgICAvLyBqdXN0IGlzbid0IEpTT04uIE90aGVyd2lzZSwgZGVsaXZlciB0aGUgcGFyc2luZyBlcnJvciB0byB0aGUgdXNlci5cbiAgICAgICAgICAgIGlmIChvaykge1xuICAgICAgICAgICAgICAvLyBFdmVuIHRob3VnaCB0aGUgcmVzcG9uc2Ugc3RhdHVzIHdhcyAyeHgsIHRoaXMgaXMgc3RpbGwgYW4gZXJyb3IuXG4gICAgICAgICAgICAgIG9rID0gZmFsc2U7XG4gICAgICAgICAgICAgIC8vIFRoZSBwYXJzZSBlcnJvciBjb250YWlucyB0aGUgdGV4dCBvZiB0aGUgYm9keSB0aGF0IGZhaWxlZCB0byBwYXJzZS5cbiAgICAgICAgICAgICAgYm9keSA9IHtlcnJvciwgdGV4dDogYm9keX0gYXMgSHR0cEpzb25QYXJzZUVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvaykge1xuICAgICAgICAgIC8vIEEgc3VjY2Vzc2Z1bCByZXNwb25zZSBpcyBkZWxpdmVyZWQgb24gdGhlIGV2ZW50IHN0cmVhbS5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICAvLyBUaGUgZnVsbCBib2R5IGhhcyBiZWVuIHJlY2VpdmVkIGFuZCBkZWxpdmVyZWQsIG5vIGZ1cnRoZXIgZXZlbnRzXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlLiBUaGlzIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBBbiB1bnN1Y2Nlc3NmdWwgcmVxdWVzdCBpcyBkZWxpdmVyZWQgb24gdGhlIGVycm9yIGNoYW5uZWwuXG4gICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICAgIC8vIFRoZSBlcnJvciBpbiB0aGlzIGNhc2UgaXMgdGhlIHJlc3BvbnNlIGJvZHkgKGVycm9yIGZyb20gdGhlIHNlcnZlcikuXG4gICAgICAgICAgICBlcnJvcjogYm9keSxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gVGhlIG9uRXJyb3IgY2FsbGJhY2sgaXMgY2FsbGVkIHdoZW4gc29tZXRoaW5nIGdvZXMgd3JvbmcgYXQgdGhlIG5ldHdvcmsgbGV2ZWwuXG4gICAgICAvLyBDb25uZWN0aW9uIHRpbWVvdXQsIEROUyBlcnJvciwgb2ZmbGluZSwgZXRjLiBUaGVzZSBhcmUgYWN0dWFsIGVycm9ycywgYW5kIGFyZVxuICAgICAgLy8gdHJhbnNtaXR0ZWQgb24gdGhlIGVycm9yIGNoYW5uZWwuXG4gICAgICBjb25zdCBvbkVycm9yID0gKGVycm9yOiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHt1cmx9ID0gcGFydGlhbEZyb21YaHIoKTtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMgfHwgMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCB8fCAnVW5rbm93biBFcnJvcicsXG4gICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IocmVzKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSBzZW50SGVhZGVycyBmbGFnIHRyYWNrcyB3aGV0aGVyIHRoZSBIdHRwUmVzcG9uc2VIZWFkZXJzIGV2ZW50XG4gICAgICAvLyBoYXMgYmVlbiBzZW50IG9uIHRoZSBzdHJlYW0uIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHRyYWNrIGlmIHByb2dyZXNzXG4gICAgICAvLyBpcyBlbmFibGVkIHNpbmNlIHRoZSBldmVudCB3aWxsIGJlIHNlbnQgb24gb25seSB0aGUgZmlyc3QgZG93bmxvYWRcbiAgICAgIC8vIHByb2dlcnNzIGV2ZW50LlxuICAgICAgbGV0IHNlbnRIZWFkZXJzID0gZmFsc2U7XG5cbiAgICAgIC8vIFRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgIGNvbnN0IG9uRG93blByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIC8vIFNlbmQgdGhlIEh0dHBSZXNwb25zZUhlYWRlcnMgZXZlbnQgaWYgaXQgaGFzbid0IGJlZW4gc2VudCBhbHJlYWR5LlxuICAgICAgICBpZiAoIXNlbnRIZWFkZXJzKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChwYXJ0aWFsRnJvbVhocigpKTtcbiAgICAgICAgICBzZW50SGVhZGVycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCBidWlsZGluZyB0aGUgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgdG8gZGVsaXZlciBvbiB0aGUgcmVzcG9uc2VcbiAgICAgICAgLy8gZXZlbnQgc3RyZWFtLlxuICAgICAgICBsZXQgcHJvZ3Jlc3NFdmVudDogSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU2V0IHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgaW4gdGhlIGV2ZW50IGlmIGl0J3MgYXZhaWxhYmxlLlxuICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHByb2dyZXNzRXZlbnQudG90YWwgPSBldmVudC50b3RhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBmb3IgdGV4dCBjb250ZW50IGFuZCBhIHBhcnRpYWwgcmVzcG9uc2UgaXNcbiAgICAgICAgLy8gYXZhaWxhYmxlIG9uIFhNTEh0dHBSZXF1ZXN0LCBpbmNsdWRlIGl0IGluIHRoZSBwcm9ncmVzcyBldmVudFxuICAgICAgICAvLyB0byBhbGxvdyBmb3Igc3RyZWFtaW5nIHJlYWRzLlxuICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnICYmICEheGhyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgIHByb2dyZXNzRXZlbnQucGFydGlhbFRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgZmlyZSB0aGUgZXZlbnQuXG4gICAgICAgIG9ic2VydmVyLm5leHQocHJvZ3Jlc3NFdmVudCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgdXBsb2FkIHByb2dyZXNzIGV2ZW50IGhhbmRsZXIsIHdoaWNoIGlzIG9ubHkgcmVnaXN0ZXJlZCBpZlxuICAgICAgLy8gcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLlxuICAgICAgY29uc3Qgb25VcFByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBldmVudHMgYXJlIHNpbXBsZXIuIEJlZ2luIGJ1aWxkaW5nIHRoZSBwcm9ncmVzc1xuICAgICAgICAvLyBldmVudC5cbiAgICAgICAgbGV0IHByb2dyZXNzOiBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzLFxuICAgICAgICAgIGxvYWRlZDogZXZlbnQubG9hZGVkLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIElmIHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgYmVpbmcgdXBsb2FkZWQgaXMgYXZhaWxhYmxlLCBpbmNsdWRlXG4gICAgICAgIC8vIGl0LlxuICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHByb2dyZXNzLnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZW5kIHRoZSBldmVudC5cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChwcm9ncmVzcyk7XG4gICAgICB9O1xuXG4gICAgICAvLyBCeSBkZWZhdWx0LCByZWdpc3RlciBmb3IgbG9hZCBhbmQgZXJyb3IgZXZlbnRzLlxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG5cbiAgICAgIC8vIFByb2dyZXNzIGV2ZW50cyBhcmUgb25seSBlbmFibGVkIGlmIHJlcXVlc3RlZC5cbiAgICAgIGlmIChyZXEucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgLy8gRG93bmxvYWQgcHJvZ3Jlc3MgaXMgYWx3YXlzIGVuYWJsZWQgaWYgcmVxdWVzdGVkLlxuICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvbkRvd25Qcm9ncmVzcyk7XG5cbiAgICAgICAgLy8gVXBsb2FkIHByb2dyZXNzIGRlcGVuZHMgb24gd2hldGhlciB0aGVyZSBpcyBhIGJvZHkgdG8gdXBsb2FkLlxuICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uVXBQcm9ncmVzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRmlyZSB0aGUgcmVxdWVzdCwgYW5kIG5vdGlmeSB0aGUgZXZlbnQgc3RyZWFtIHRoYXQgaXQgd2FzIGZpcmVkLlxuICAgICAgeGhyLnNlbmQocmVxQm9keSEpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIFRoaXMgaXMgdGhlIHJldHVybiBmcm9tIHRoZSBPYnNlcnZhYmxlIGZ1bmN0aW9uLCB3aGljaCBpcyB0aGVcbiAgICAgIC8vIHJlcXVlc3QgY2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBPbiBhIGNhbmNlbGxhdGlvbiwgcmVtb3ZlIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uRG93blByb2dyZXNzKTtcbiAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICB4aHIudXBsb2FkLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25VcFByb2dyZXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBhYm9ydCB0aGUgaW4tZmxpZ2h0IHJlcXVlc3QuXG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19