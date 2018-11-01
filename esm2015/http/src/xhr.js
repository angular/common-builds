import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
import * as i0 from "@angular/core";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
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
 * A factory for \@{link HttpXhrBackend} that uses the `XMLHttpRequest` browser API.
 *
 *
 */
export class BrowserXhr {
    constructor() { }
    /**
     * @return {?}
     */
    build() { return /** @type {?} */ ((new XMLHttpRequest())); }
}
BrowserXhr.decorators = [
    { type: Injectable },
];
/** @nocollapse */
BrowserXhr.ctorParameters = () => [];
BrowserXhr.ngInjectableDef = i0.defineInjectable({ token: BrowserXhr, factory: function BrowserXhr_Factory(t) { return new (t || BrowserXhr)(); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(BrowserXhr, [{
        type: Injectable
    }], [], null);
/**
 * Tracks a response from the server that does not yet have a body.
 * @record
 */
function PartialResponse() { }
/** @type {?} */
PartialResponse.prototype.headers;
/** @type {?} */
PartialResponse.prototype.status;
/** @type {?} */
PartialResponse.prototype.statusText;
/** @type {?} */
PartialResponse.prototype.url;
/**
 * An `HttpBackend` which uses the XMLHttpRequest API to send
 * requests to a backend server.
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
     * Process a request and return a stream of response events.
     * @param {?} req
     * @return {?}
     */
    handle(req) {
        // Quick check to give a better error message when a user attempts to use
        // HttpClient.jsonp() without installing the JsonpClientModule
        if (req.method === 'JSONP') {
            throw new Error(`Attempted to construct Jsonp request without JsonpClientModule installed.`);
        }
        // Everything happens on Observable subscription.
        return new Observable((observer) => {
            /** @type {?} */
            const xhr = this.xhrFactory.build();
            xhr.open(req.method, req.urlWithParams);
            if (!!req.withCredentials) {
                xhr.withCredentials = true;
            }
            // Add all the requested headers.
            req.headers.forEach((name, values) => xhr.setRequestHeader(name, values.join(',')));
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
                xhr.responseType = /** @type {?} */ (((responseType !== 'json') ? responseType : 'text'));
            }
            /** @type {?} */
            const reqBody = req.serializeBody();
            /** @type {?} */
            let headerResponse = null;
            /** @type {?} */
            const partialFromXhr = () => {
                if (headerResponse !== null) {
                    return headerResponse;
                }
                /** @type {?} */
                const status = xhr.status === 1223 ? 204 : xhr.status;
                /** @type {?} */
                const statusText = xhr.statusText || 'OK';
                /** @type {?} */
                const headers = new HttpHeaders(xhr.getAllResponseHeaders());
                /** @type {?} */
                const url = getResponseUrl(xhr) || req.url;
                // Construct the HttpHeaderResponse and memoize it.
                headerResponse = new HttpHeaderResponse({ headers, status, statusText, url });
                return headerResponse;
            };
            /** @type {?} */
            const onLoad = () => {
                let { headers, status, statusText, url } = partialFromXhr();
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
                /** @type {?} */
                let ok = status >= 200 && status < 300;
                // Check whether the body needs to be parsed as JSON (in many cases the browser
                // will have done that already).
                if (req.responseType === 'json' && typeof body === 'string') {
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
                            body = /** @type {?} */ ({ error, text: body });
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
            };
            /** @type {?} */
            const onError = (error) => {
                /** @type {?} */
                const res = new HttpErrorResponse({
                    error,
                    status: xhr.status || 0,
                    statusText: xhr.statusText || 'Unknown Error',
                });
                observer.error(res);
            };
            /** @type {?} */
            let sentHeaders = false;
            /** @type {?} */
            const onDownProgress = (event) => {
                // Send the HttpResponseHeaders event if it hasn't been sent already.
                if (!sentHeaders) {
                    observer.next(partialFromXhr());
                    sentHeaders = true;
                }
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
            };
            /** @type {?} */
            const onUpProgress = (event) => {
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
            };
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
            xhr.send(/** @type {?} */ ((reqBody)));
            observer.next({ type: HttpEventType.Sent });
            // This is the return from the Observable function, which is the
            // request cancellation handler.
            return () => {
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
            };
        });
    }
}
HttpXhrBackend.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpXhrBackend.ctorParameters = () => [
    { type: XhrFactory }
];
HttpXhrBackend.ngInjectableDef = i0.defineInjectable({ token: HttpXhrBackend, factory: function HttpXhrBackend_Factory(t) { return new (t || HttpXhrBackend)(i0.inject(XhrFactory)); }, providedIn: null });
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpXhrBackend, [{
        type: Injectable
    }], [{
        type: XhrFactory
    }], null);
if (false) {
    /** @type {?} */
    HttpXhrBackend.prototype.xhrFactory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBc0IsWUFBWSxFQUEwQixNQUFNLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFFakwsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDOzs7Ozs7O0FBTW5DLFNBQVMsY0FBYyxDQUFDLEdBQVE7SUFDOUIsSUFBSSxhQUFhLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDM0MsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRTtRQUN4RCxPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7QUFPRCxNQUFNLE9BQWdCLFVBQVU7Q0FBc0M7Ozs7Ozs7Ozs7Ozs7QUFRdEUsTUFBTSxPQUFPLFVBQVU7SUFDckIsaUJBQWdCOzs7O0lBQ2hCLEtBQUssS0FBVSx5QkFBWSxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsRUFBQyxFQUFFOzs7WUFIckQsVUFBVTs7OzswREFDRSxVQUFVLDZEQUFWLFVBQVU7bUNBQVYsVUFBVTtjQUR0QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QlgsTUFBTSxPQUFPLGNBQWM7Ozs7SUFDekIsWUFBb0IsVUFB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SUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDOzs7WUFJMUMsT0FBTyxHQUFHLEVBQUU7O2dCQUVWLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksR0FBRyxDQUFDLGNBQWMsRUFBRTtvQkFDdEIsR0FBRyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7d0JBQ2xDLEdBQUcsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO3FCQUMxRDtpQkFDRjs7Z0JBR0QsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2IsQ0FBQztTQUNILENBQUMsQ0FBQztLQUNKOzs7WUE5UUYsVUFBVTs7OztZQUV1QixVQUFVOzs4REFEL0IsY0FBYyxpRUFBZCxjQUFjLFlBQ08sVUFBVTttQ0FEL0IsY0FBYztjQUQxQixVQUFVOztjQUV1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCwgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cEhlYWRlclJlc3BvbnNlLCBIdHRwSnNvblBhcnNlRXJyb3IsIEh0dHBSZXNwb25zZSwgSHR0cFVwbG9hZFByb2dyZXNzRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogWE1MSHR0cFJlcXVlc3QucmVzcG9uc2VVUkwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybCh4aHI6IGFueSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyICYmIHhoci5yZXNwb25zZVVSTCkge1xuICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkw7XG4gIH1cbiAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBYaHJGYWN0b3J5IHsgYWJzdHJhY3QgYnVpbGQoKTogWE1MSHR0cFJlcXVlc3Q7IH1cblxuLyoqXG4gKiBBIGZhY3RvcnkgZm9yIEB7bGluayBIdHRwWGhyQmFja2VuZH0gdGhhdCB1c2VzIHRoZSBgWE1MSHR0cFJlcXVlc3RgIGJyb3dzZXIgQVBJLlxuICpcbiAqXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VyWGhyIGltcGxlbWVudHMgWGhyRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKCkge31cbiAgYnVpbGQoKTogYW55IHsgcmV0dXJuIDxhbnk+KG5ldyBYTUxIdHRwUmVxdWVzdCgpKTsgfVxufVxuXG4vKipcbiAqIFRyYWNrcyBhIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciB0aGF0IGRvZXMgbm90IHlldCBoYXZlIGEgYm9keS5cbiAqL1xuaW50ZXJmYWNlIFBhcnRpYWxSZXNwb25zZSB7XG4gIGhlYWRlcnM6IEh0dHBIZWFkZXJzO1xuICBzdGF0dXM6IG51bWJlcjtcbiAgc3RhdHVzVGV4dDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBbiBgSHR0cEJhY2tlbmRgIHdoaWNoIHVzZXMgdGhlIFhNTEh0dHBSZXF1ZXN0IEFQSSB0byBzZW5kXG4gKiByZXF1ZXN0cyB0byBhIGJhY2tlbmQgc2VydmVyLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYaHJCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHhockZhY3Rvcnk6IFhockZhY3RvcnkpIHt9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgYSByZXF1ZXN0IGFuZCByZXR1cm4gYSBzdHJlYW0gb2YgcmVzcG9uc2UgZXZlbnRzLlxuICAgKi9cbiAgaGFuZGxlKHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBRdWljayBjaGVjayB0byBnaXZlIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2Ugd2hlbiBhIHVzZXIgYXR0ZW1wdHMgdG8gdXNlXG4gICAgLy8gSHR0cENsaWVudC5qc29ucCgpIHdpdGhvdXQgaW5zdGFsbGluZyB0aGUgSnNvbnBDbGllbnRNb2R1bGVcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdHRlbXB0ZWQgdG8gY29uc3RydWN0IEpzb25wIHJlcXVlc3Qgd2l0aG91dCBKc29ucENsaWVudE1vZHVsZSBpbnN0YWxsZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBoYXBwZW5zIG9uIE9ic2VydmFibGUgc3Vic2NyaXB0aW9uLlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgLy8gU3RhcnQgYnkgc2V0dGluZyB1cCB0aGUgWEhSIG9iamVjdCB3aXRoIHJlcXVlc3QgbWV0aG9kLCBVUkwsIGFuZCB3aXRoQ3JlZGVudGlhbHMgZmxhZy5cbiAgICAgIGNvbnN0IHhociA9IHRoaXMueGhyRmFjdG9yeS5idWlsZCgpO1xuICAgICAgeGhyLm9wZW4ocmVxLm1ldGhvZCwgcmVxLnVybFdpdGhQYXJhbXMpO1xuICAgICAgaWYgKCEhcmVxLndpdGhDcmVkZW50aWFscykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFsbCB0aGUgcmVxdWVzdGVkIGhlYWRlcnMuXG4gICAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKicpO1xuICAgICAgfVxuXG4gICAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBkZXRlY3RlZFR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2VUeXBlIGlmIG9uZSB3YXMgcmVxdWVzdGVkLlxuICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VUeXBlID0gcmVxLnJlc3BvbnNlVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIC8vIEpTT04gcmVzcG9uc2VzIG5lZWQgdG8gYmUgcHJvY2Vzc2VkIGFzIHRleHQuIFRoaXMgaXMgYmVjYXVzZSBpZiB0aGUgc2VydmVyXG4gICAgICAgIC8vIHJldHVybnMgYW4gWFNTSS1wcmVmaXhlZCBKU09OIHJlc3BvbnNlLCB0aGUgYnJvd3NlciB3aWxsIGZhaWwgdG8gcGFyc2UgaXQsXG4gICAgICAgIC8vIHhoci5yZXNwb25zZSB3aWxsIGJlIG51bGwsIGFuZCB4aHIucmVzcG9uc2VUZXh0IGNhbm5vdCBiZSBhY2Nlc3NlZCB0b1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgcHJlZml4ZWQgSlNPTiBkYXRhIGluIG9yZGVyIHRvIHN0cmlwIHRoZSBwcmVmaXguIFRodXMsIGFsbCBKU09OXG4gICAgICAgIC8vIGlzIHBhcnNlZCBieSBmaXJzdCByZXF1ZXN0aW5nIHRleHQgYW5kIHRoZW4gYXBwbHlpbmcgSlNPTi5wYXJzZS5cbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICgocmVzcG9uc2VUeXBlICE9PSAnanNvbicpID8gcmVzcG9uc2VUeXBlIDogJ3RleHQnKSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlcmlhbGl6ZSB0aGUgcmVxdWVzdCBib2R5IGlmIG9uZSBpcyBwcmVzZW50LiBJZiBub3QsIHRoaXMgd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAgICAgIGNvbnN0IHJlcUJvZHkgPSByZXEuc2VyaWFsaXplQm9keSgpO1xuXG4gICAgICAvLyBJZiBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQsIHJlc3BvbnNlIGhlYWRlcnMgd2lsbCBiZSBkZWxpdmVyZWRcbiAgICAgIC8vIGluIHR3byBldmVudHMgLSB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGV2ZW50IGFuZCB0aGUgZnVsbCBIdHRwUmVzcG9uc2VcbiAgICAgIC8vIGV2ZW50LiBIb3dldmVyLCBzaW5jZSByZXNwb25zZSBoZWFkZXJzIGRvbid0IGNoYW5nZSBpbiBiZXR3ZWVuIHRoZXNlXG4gICAgICAvLyB0d28gZXZlbnRzLCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gcGFyc2UgdGhlbSB0d2ljZS4gU28gaGVhZGVyUmVzcG9uc2VcbiAgICAgIC8vIGNhY2hlcyB0aGUgZGF0YSBleHRyYWN0ZWQgZnJvbSB0aGUgcmVzcG9uc2Ugd2hlbmV2ZXIgaXQncyBmaXJzdCBwYXJzZWQsXG4gICAgICAvLyB0byBlbnN1cmUgcGFyc2luZyBpc24ndCBkdXBsaWNhdGVkLlxuICAgICAgbGV0IGhlYWRlclJlc3BvbnNlOiBIdHRwSGVhZGVyUmVzcG9uc2V8bnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIHBhcnRpYWxGcm9tWGhyIGV4dHJhY3RzIHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgZnJvbSB0aGUgY3VycmVudCBYTUxIdHRwUmVxdWVzdFxuICAgICAgLy8gc3RhdGUsIGFuZCBtZW1vaXplcyBpdCBpbnRvIGhlYWRlclJlc3BvbnNlLlxuICAgICAgY29uc3QgcGFydGlhbEZyb21YaHIgPSAoKTogSHR0cEhlYWRlclJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKGhlYWRlclJlc3BvbnNlICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBzdGF0dXMgYW5kIG5vcm1hbGl6ZSBhbiBJRTkgYnVnIChodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xNDUwKS5cbiAgICAgICAgY29uc3Qgc3RhdHVzOiBudW1iZXIgPSB4aHIuc3RhdHVzID09PSAxMjIzID8gMjA0IDogeGhyLnN0YXR1cztcbiAgICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0IHx8ICdPSyc7XG5cbiAgICAgICAgLy8gUGFyc2UgaGVhZGVycyBmcm9tIFhNTEh0dHBSZXF1ZXN0IC0gdGhpcyBzdGVwIGlzIGxhenkuXG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcblxuICAgICAgICAvLyBSZWFkIHRoZSByZXNwb25zZSBVUkwgZnJvbSB0aGUgWE1MSHR0cFJlc3BvbnNlIGluc3RhbmNlIGFuZCBmYWxsIGJhY2sgb24gdGhlXG4gICAgICAgIC8vIHJlcXVlc3QgVVJMLlxuICAgICAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybCh4aHIpIHx8IHJlcS51cmw7XG5cbiAgICAgICAgLy8gQ29uc3RydWN0IHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgYW5kIG1lbW9pemUgaXQuXG4gICAgICAgIGhlYWRlclJlc3BvbnNlID0gbmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KTtcbiAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgfTtcblxuICAgICAgLy8gTmV4dCwgYSBmZXcgY2xvc3VyZXMgYXJlIGRlZmluZWQgZm9yIHRoZSB2YXJpb3VzIGV2ZW50cyB3aGljaCBYTUxIdHRwUmVxdWVzdCBjYW5cbiAgICAgIC8vIGVtaXQuIFRoaXMgYWxsb3dzIHRoZW0gdG8gYmUgdW5yZWdpc3RlcmVkIGFzIGV2ZW50IGxpc3RlbmVycyBsYXRlci5cblxuICAgICAgLy8gRmlyc3QgdXAgaXMgdGhlIGxvYWQgZXZlbnQsIHdoaWNoIHJlcHJlc2VudHMgYSByZXNwb25zZSBiZWluZyBmdWxseSBhdmFpbGFibGUuXG4gICAgICBjb25zdCBvbkxvYWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFJlYWQgcmVzcG9uc2Ugc3RhdGUgZnJvbSB0aGUgbWVtb2l6ZWQgcGFydGlhbCBkYXRhLlxuICAgICAgICBsZXQge2hlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSA9IHBhcnRpYWxGcm9tWGhyKCk7XG5cbiAgICAgICAgLy8gVGhlIGJvZHkgd2lsbCBiZSByZWFkIG91dCBpZiBwcmVzZW50LlxuICAgICAgICBsZXQgYm9keTogYW55fG51bGwgPSBudWxsO1xuXG4gICAgICAgIGlmIChzdGF0dXMgIT09IDIwNCkge1xuICAgICAgICAgIC8vIFVzZSBYTUxIdHRwUmVxdWVzdC5yZXNwb25zZSBpZiBzZXQsIHJlc3BvbnNlVGV4dCBvdGhlcndpc2UuXG4gICAgICAgICAgYm9keSA9ICh0eXBlb2YgeGhyLnJlc3BvbnNlID09PSAndW5kZWZpbmVkJykgPyB4aHIucmVzcG9uc2VUZXh0IDogeGhyLnJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9ybWFsaXplIGFub3RoZXIgcG90ZW50aWFsIGJ1ZyAodGhpcyBvbmUgY29tZXMgZnJvbSBDT1JTKS5cbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgIHN0YXR1cyA9ICEhYm9keSA/IDIwMCA6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAgICAgLy8gYnV0IGEgc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZSBjYW4gc3RpbGwgcmVzdWx0IGluIGFuIGVycm9yIGlmIHRoZSB1c2VyXG4gICAgICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICAgICAgbGV0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgYm9keSBuZWVkcyB0byBiZSBwYXJzZWQgYXMgSlNPTiAoaW4gbWFueSBjYXNlcyB0aGUgYnJvd3NlclxuICAgICAgICAvLyB3aWxsIGhhdmUgZG9uZSB0aGF0IGFscmVhZHkpLlxuICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nICYmIHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIGJvZHksIGJlZm9yZSBhdHRlbXB0aW5nIFhTU0kgcHJlZml4IHN0cmlwcGluZy5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbEJvZHkgPSBib2R5O1xuICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQXR0ZW1wdCB0aGUgcGFyc2UuIElmIGl0IGZhaWxzLCBhIHBhcnNlIGVycm9yIHNob3VsZCBiZSBkZWxpdmVyZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBib2R5ID0gYm9keSAhPT0gJycgPyBKU09OLnBhcnNlKGJvZHkpIDogbnVsbDtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gU2luY2UgdGhlIEpTT04ucGFyc2UgZmFpbGVkLCBpdCdzIHJlYXNvbmFibGUgdG8gYXNzdW1lIHRoaXMgbWlnaHQgbm90IGhhdmUgYmVlbiBhXG4gICAgICAgICAgICAvLyBKU09OIHJlc3BvbnNlLiBSZXN0b3JlIHRoZSBvcmlnaW5hbCBib2R5IChpbmNsdWRpbmcgYW55IFhTU0kgcHJlZml4KSB0byBkZWxpdmVyXG4gICAgICAgICAgICAvLyBhIGJldHRlciBlcnJvciByZXNwb25zZS5cbiAgICAgICAgICAgIGJvZHkgPSBvcmlnaW5hbEJvZHk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoaXMgd2FzIGFuIGVycm9yIHJlcXVlc3QgdG8gYmVnaW4gd2l0aCwgbGVhdmUgaXQgYXMgYSBzdHJpbmcsIGl0IHByb2JhYmx5XG4gICAgICAgICAgICAvLyBqdXN0IGlzbid0IEpTT04uIE90aGVyd2lzZSwgZGVsaXZlciB0aGUgcGFyc2luZyBlcnJvciB0byB0aGUgdXNlci5cbiAgICAgICAgICAgIGlmIChvaykge1xuICAgICAgICAgICAgICAvLyBFdmVuIHRob3VnaCB0aGUgcmVzcG9uc2Ugc3RhdHVzIHdhcyAyeHgsIHRoaXMgaXMgc3RpbGwgYW4gZXJyb3IuXG4gICAgICAgICAgICAgIG9rID0gZmFsc2U7XG4gICAgICAgICAgICAgIC8vIFRoZSBwYXJzZSBlcnJvciBjb250YWlucyB0aGUgdGV4dCBvZiB0aGUgYm9keSB0aGF0IGZhaWxlZCB0byBwYXJzZS5cbiAgICAgICAgICAgICAgYm9keSA9IHsgZXJyb3IsIHRleHQ6IGJvZHkgfSBhcyBIdHRwSnNvblBhcnNlRXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9rKSB7XG4gICAgICAgICAgLy8gQSBzdWNjZXNzZnVsIHJlc3BvbnNlIGlzIGRlbGl2ZXJlZCBvbiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgICAgICAgIG9ic2VydmVyLm5leHQobmV3IEh0dHBSZXNwb25zZSh7XG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgICB1cmw6IHVybCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgICAgICAvLyBhcmUgcG9zc2libGUuIFRoaXMgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEFuIHVuc3VjY2Vzc2Z1bCByZXF1ZXN0IGlzIGRlbGl2ZXJlZCBvbiB0aGUgZXJyb3IgY2hhbm5lbC5cbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgICAgLy8gVGhlIGVycm9yIGluIHRoaXMgY2FzZSBpcyB0aGUgcmVzcG9uc2UgYm9keSAoZXJyb3IgZnJvbSB0aGUgc2VydmVyKS5cbiAgICAgICAgICAgIGVycm9yOiBib2R5LFxuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgICB1cmw6IHVybCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgb25FcnJvciBjYWxsYmFjayBpcyBjYWxsZWQgd2hlbiBzb21ldGhpbmcgZ29lcyB3cm9uZyBhdCB0aGUgbmV0d29yayBsZXZlbC5cbiAgICAgIC8vIENvbm5lY3Rpb24gdGltZW91dCwgRE5TIGVycm9yLCBvZmZsaW5lLCBldGMuIFRoZXNlIGFyZSBhY3R1YWwgZXJyb3JzLCBhbmQgYXJlXG4gICAgICAvLyB0cmFuc21pdHRlZCBvbiB0aGUgZXJyb3IgY2hhbm5lbC5cbiAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZXJyb3I6IEVycm9yRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMgfHwgMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCB8fCAnVW5rbm93biBFcnJvcicsXG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5lcnJvcihyZXMpO1xuICAgICAgfTtcblxuICAgICAgLy8gVGhlIHNlbnRIZWFkZXJzIGZsYWcgdHJhY2tzIHdoZXRoZXIgdGhlIEh0dHBSZXNwb25zZUhlYWRlcnMgZXZlbnRcbiAgICAgIC8vIGhhcyBiZWVuIHNlbnQgb24gdGhlIHN0cmVhbS4gVGhpcyBpcyBuZWNlc3NhcnkgdG8gdHJhY2sgaWYgcHJvZ3Jlc3NcbiAgICAgIC8vIGlzIGVuYWJsZWQgc2luY2UgdGhlIGV2ZW50IHdpbGwgYmUgc2VudCBvbiBvbmx5IHRoZSBmaXJzdCBkb3dubG9hZFxuICAgICAgLy8gcHJvZ2Vyc3MgZXZlbnQuXG4gICAgICBsZXQgc2VudEhlYWRlcnMgPSBmYWxzZTtcblxuICAgICAgLy8gVGhlIGRvd25sb2FkIHByb2dyZXNzIGV2ZW50IGhhbmRsZXIsIHdoaWNoIGlzIG9ubHkgcmVnaXN0ZXJlZCBpZlxuICAgICAgLy8gcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLlxuICAgICAgY29uc3Qgb25Eb3duUHJvZ3Jlc3MgPSAoZXZlbnQ6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgLy8gU2VuZCB0aGUgSHR0cFJlc3BvbnNlSGVhZGVycyBldmVudCBpZiBpdCBoYXNuJ3QgYmVlbiBzZW50IGFscmVhZHkuXG4gICAgICAgIGlmICghc2VudEhlYWRlcnMpIHtcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHBhcnRpYWxGcm9tWGhyKCkpO1xuICAgICAgICAgIHNlbnRIZWFkZXJzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IGJ1aWxkaW5nIHRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCB0byBkZWxpdmVyIG9uIHRoZSByZXNwb25zZVxuICAgICAgICAvLyBldmVudCBzdHJlYW0uXG4gICAgICAgIGxldCBwcm9ncmVzc0V2ZW50OiBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50ID0ge1xuICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcyxcbiAgICAgICAgICBsb2FkZWQ6IGV2ZW50LmxvYWRlZCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZXQgdGhlIHRvdGFsIG51bWJlciBvZiBieXRlcyBpbiB0aGUgZXZlbnQgaWYgaXQncyBhdmFpbGFibGUuXG4gICAgICAgIGlmIChldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgcHJvZ3Jlc3NFdmVudC50b3RhbCA9IGV2ZW50LnRvdGFsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3Qgd2FzIGZvciB0ZXh0IGNvbnRlbnQgYW5kIGEgcGFydGlhbCByZXNwb25zZSBpc1xuICAgICAgICAvLyBhdmFpbGFibGUgb24gWE1MSHR0cFJlcXVlc3QsIGluY2x1ZGUgaXQgaW4gdGhlIHByb2dyZXNzIGV2ZW50XG4gICAgICAgIC8vIHRvIGFsbG93IGZvciBzdHJlYW1pbmcgcmVhZHMuXG4gICAgICAgIGlmIChyZXEucmVzcG9uc2VUeXBlID09PSAndGV4dCcgJiYgISF4aHIucmVzcG9uc2VUZXh0KSB7XG4gICAgICAgICAgcHJvZ3Jlc3NFdmVudC5wYXJ0aWFsVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBmaXJlIHRoZSBldmVudC5cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChwcm9ncmVzc0V2ZW50KTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciwgd2hpY2ggaXMgb25seSByZWdpc3RlcmVkIGlmXG4gICAgICAvLyBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQuXG4gICAgICBjb25zdCBvblVwUHJvZ3Jlc3MgPSAoZXZlbnQ6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgLy8gVXBsb2FkIHByb2dyZXNzIGV2ZW50cyBhcmUgc2ltcGxlci4gQmVnaW4gYnVpbGRpbmcgdGhlIHByb2dyZXNzXG4gICAgICAgIC8vIGV2ZW50LlxuICAgICAgICBsZXQgcHJvZ3Jlc3M6IEh0dHBVcGxvYWRQcm9ncmVzc0V2ZW50ID0ge1xuICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuVXBsb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSWYgdGhlIHRvdGFsIG51bWJlciBvZiBieXRlcyBiZWluZyB1cGxvYWRlZCBpcyBhdmFpbGFibGUsIGluY2x1ZGVcbiAgICAgICAgLy8gaXQuXG4gICAgICAgIGlmIChldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgcHJvZ3Jlc3MudG90YWwgPSBldmVudC50b3RhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlbmQgdGhlIGV2ZW50LlxuICAgICAgICBvYnNlcnZlci5uZXh0KHByb2dyZXNzKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIEJ5IGRlZmF1bHQsIHJlZ2lzdGVyIGZvciBsb2FkIGFuZCBlcnJvciBldmVudHMuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcblxuICAgICAgLy8gUHJvZ3Jlc3MgZXZlbnRzIGFyZSBvbmx5IGVuYWJsZWQgaWYgcmVxdWVzdGVkLlxuICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAvLyBEb3dubG9hZCBwcm9ncmVzcyBpcyBhbHdheXMgZW5hYmxlZCBpZiByZXF1ZXN0ZWQuXG4gICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uRG93blByb2dyZXNzKTtcblxuICAgICAgICAvLyBVcGxvYWQgcHJvZ3Jlc3MgZGVwZW5kcyBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgYm9keSB0byB1cGxvYWQuXG4gICAgICAgIGlmIChyZXFCb2R5ICE9PSBudWxsICYmIHhoci51cGxvYWQpIHtcbiAgICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25VcFByb2dyZXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBGaXJlIHRoZSByZXF1ZXN0LCBhbmQgbm90aWZ5IHRoZSBldmVudCBzdHJlYW0gdGhhdCBpdCB3YXMgZmlyZWQuXG4gICAgICB4aHIuc2VuZChyZXFCb2R5ICEpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIFRoaXMgaXMgdGhlIHJldHVybiBmcm9tIHRoZSBPYnNlcnZhYmxlIGZ1bmN0aW9uLCB3aGljaCBpcyB0aGVcbiAgICAgIC8vIHJlcXVlc3QgY2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBPbiBhIGNhbmNlbGxhdGlvbiwgcmVtb3ZlIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uRG93blByb2dyZXNzKTtcbiAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICB4aHIudXBsb2FkLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25VcFByb2dyZXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBhYm9ydCB0aGUgaW4tZmxpZ2h0IHJlcXVlc3QuXG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19