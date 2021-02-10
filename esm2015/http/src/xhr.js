/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
import * as i0 from "@angular/core";
const XSSI_PREFIX = /^\)\]\}',?\n/;
/**
 * Determine an appropriate URL for the response, by checking either
 * XMLHttpRequest.responseURL or the X-Request-URL header.
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
 * @publicApi
 */
export class XhrFactory {
}
/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 *
 */
export class BrowserXhr {
    constructor() { }
    build() {
        return (new XMLHttpRequest());
    }
}
BrowserXhr.ɵfac = function BrowserXhr_Factory(t) { return new (t || BrowserXhr)(); };
BrowserXhr.ɵprov = i0.ɵɵdefineInjectable({ token: BrowserXhr, factory: BrowserXhr.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BrowserXhr, [{
        type: Injectable
    }], function () { return []; }, null); })();
/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see `HttpHandler`
 * @see `JsonpClientBackend`
 *
 * @publicApi
 */
export class HttpXhrBackend {
    constructor(xhrFactory) {
        this.xhrFactory = xhrFactory;
    }
    /**
     * Processes a request and returns a stream of response events.
     * @param req The request object.
     * @returns An observable of the response events.
     */
    handle(req) {
        // Quick check to give a better error message when a user attempts to use
        // HttpClient.jsonp() without installing the HttpClientJsonpModule
        if (req.method === 'JSONP') {
            throw new Error(`Attempted to construct Jsonp request without HttpClientJsonpModule installed.`);
        }
        // Everything happens on Observable subscription.
        return new Observable((observer) => {
            // Start by setting up the XHR object with request method, URL, and withCredentials flag.
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
                const detectedType = req.detectContentTypeHeader();
                // Sometimes Content-Type detection fails.
                if (detectedType !== null) {
                    xhr.setRequestHeader('Content-Type', detectedType);
                }
            }
            // Set the responseType if one was requested.
            if (req.responseType) {
                const responseType = req.responseType.toLowerCase();
                // JSON responses need to be processed as text. This is because if the server
                // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
                // xhr.response will be null, and xhr.responseText cannot be accessed to
                // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
                // is parsed by first requesting text and then applying JSON.parse.
                xhr.responseType = ((responseType !== 'json') ? responseType : 'text');
            }
            // Serialize the request body if one is present. If not, this will be set to null.
            const reqBody = req.serializeBody();
            // If progress events are enabled, response headers will be delivered
            // in two events - the HttpHeaderResponse event and the full HttpResponse
            // event. However, since response headers don't change in between these
            // two events, it doesn't make sense to parse them twice. So headerResponse
            // caches the data extracted from the response whenever it's first parsed,
            // to ensure parsing isn't duplicated.
            let headerResponse = null;
            // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
            // state, and memoizes it into headerResponse.
            const partialFromXhr = () => {
                if (headerResponse !== null) {
                    return headerResponse;
                }
                // Read status and normalize an IE9 bug (https://bugs.jquery.com/ticket/1450).
                const status = xhr.status === 1223 ? 204 /* NoContent */ : xhr.status;
                const statusText = xhr.statusText || 'OK';
                // Parse headers from XMLHttpRequest - this step is lazy.
                const headers = new HttpHeaders(xhr.getAllResponseHeaders());
                // Read the response URL from the XMLHttpResponse instance and fall back on the
                // request URL.
                const url = getResponseUrl(xhr) || req.url;
                // Construct the HttpHeaderResponse and memoize it.
                headerResponse = new HttpHeaderResponse({ headers, status, statusText, url });
                return headerResponse;
            };
            // Next, a few closures are defined for the various events which XMLHttpRequest can
            // emit. This allows them to be unregistered as event listeners later.
            // First up is the load event, which represents a response being fully available.
            const onLoad = () => {
                // Read response state from the memoized partial data.
                let { headers, status, statusText, url } = partialFromXhr();
                // The body will be read out if present.
                let body = null;
                if (status !== 204 /* NoContent */) {
                    // Use XMLHttpRequest.response if set, responseText otherwise.
                    body = (typeof xhr.response === 'undefined') ? xhr.responseText : xhr.response;
                }
                // Normalize another potential bug (this one comes from CORS).
                if (status === 0) {
                    status = !!body ? 200 /* Ok */ : 0;
                }
                // ok determines whether the response will be transmitted on the event or
                // error channel. Unsuccessful status codes (not 2xx) will always be errors,
                // but a successful status code can still result in an error if the user
                // asked for JSON data and the body cannot be parsed as such.
                let ok = status >= 200 && status < 300;
                // Check whether the body needs to be parsed as JSON (in many cases the browser
                // will have done that already).
                if (req.responseType === 'json' && typeof body === 'string') {
                    // Save the original body, before attempting XSSI prefix stripping.
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
                            body = { error, text: body };
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
            // The onError callback is called when something goes wrong at the network level.
            // Connection timeout, DNS error, offline, etc. These are actual errors, and are
            // transmitted on the error channel.
            const onError = (error) => {
                const { url } = partialFromXhr();
                const res = new HttpErrorResponse({
                    error,
                    status: xhr.status || 0,
                    statusText: xhr.statusText || 'Unknown Error',
                    url: url || undefined,
                });
                observer.error(res);
            };
            // The sentHeaders flag tracks whether the HttpResponseHeaders event
            // has been sent on the stream. This is necessary to track if progress
            // is enabled since the event will be sent on only the first download
            // progerss event.
            let sentHeaders = false;
            // The download progress event handler, which is only registered if
            // progress events are enabled.
            const onDownProgress = (event) => {
                // Send the HttpResponseHeaders event if it hasn't been sent already.
                if (!sentHeaders) {
                    observer.next(partialFromXhr());
                    sentHeaders = true;
                }
                // Start building the download progress event to deliver on the response
                // event stream.
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
            // The upload progress event handler, which is only registered if
            // progress events are enabled.
            const onUpProgress = (event) => {
                // Upload progress events are simpler. Begin building the progress
                // event.
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
            xhr.addEventListener('timeout', onError);
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
            xhr.send(reqBody);
            observer.next({ type: HttpEventType.Sent });
            // This is the return from the Observable function, which is the
            // request cancellation handler.
            return () => {
                // On a cancellation, remove all registered event listeners.
                xhr.removeEventListener('error', onError);
                xhr.removeEventListener('load', onLoad);
                xhr.removeEventListener('timeout', onError);
                if (req.reportProgress) {
                    xhr.removeEventListener('progress', onDownProgress);
                    if (reqBody !== null && xhr.upload) {
                        xhr.upload.removeEventListener('progress', onUpProgress);
                    }
                }
                // Finally, abort the in-flight request.
                if (xhr.readyState !== xhr.DONE) {
                    xhr.abort();
                }
            };
        });
    }
}
HttpXhrBackend.ɵfac = function HttpXhrBackend_Factory(t) { return new (t || HttpXhrBackend)(i0.ɵɵinject(XhrFactory)); };
HttpXhrBackend.ɵprov = i0.ɵɵdefineInjectable({ token: HttpXhrBackend, factory: HttpXhrBackend.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HttpXhrBackend, [{
        type: Injectable
    }], function () { return [{ type: XhrFactory }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBc0IsWUFBWSxFQUEwQyxNQUFNLFlBQVksQ0FBQzs7QUFHak0sTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLEdBQVE7SUFDOUIsSUFBSSxhQUFhLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDM0MsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRTtRQUN4RCxPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLFVBQVU7Q0FFL0I7QUFFRDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sVUFBVTtJQUNyQixnQkFBZSxDQUFDO0lBQ2hCLEtBQUs7UUFDSCxPQUFZLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7O29FQUpVLFVBQVU7a0RBQVYsVUFBVSxXQUFWLFVBQVU7dUZBQVYsVUFBVTtjQUR0QixVQUFVOztBQWtCWDs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sY0FBYztJ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Q0gsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs0RUF0UlUsY0FBYyxjQUNPLFVBQVU7c0RBRC9CLGNBQWMsV0FBZCxjQUFjO3VGQUFkLGNBQWM7Y0FEMUIsVUFBVTtzQ0FFdUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCwgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cEhlYWRlclJlc3BvbnNlLCBIdHRwSnNvblBhcnNlRXJyb3IsIEh0dHBSZXNwb25zZSwgSHR0cFN0YXR1c0NvZGUsIEh0dHBVcGxvYWRQcm9ncmVzc0V2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogWE1MSHR0cFJlcXVlc3QucmVzcG9uc2VVUkwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybCh4aHI6IGFueSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyICYmIHhoci5yZXNwb25zZVVSTCkge1xuICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkw7XG4gIH1cbiAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBYaHJGYWN0b3J5IHtcbiAgYWJzdHJhY3QgYnVpbGQoKTogWE1MSHR0cFJlcXVlc3Q7XG59XG5cbi8qKlxuICogQSBmYWN0b3J5IGZvciBgSHR0cFhockJhY2tlbmRgIHRoYXQgdXNlcyB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBicm93c2VyIEFQSS5cbiAqXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VyWGhyIGltcGxlbWVudHMgWGhyRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKCkge31cbiAgYnVpbGQoKTogYW55IHtcbiAgICByZXR1cm4gPGFueT4obmV3IFhNTEh0dHBSZXF1ZXN0KCkpO1xuICB9XG59XG5cbi8qKlxuICogVHJhY2tzIGEgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyIHRoYXQgZG9lcyBub3QgeWV0IGhhdmUgYSBib2R5LlxuICovXG5pbnRlcmZhY2UgUGFydGlhbFJlc3BvbnNlIHtcbiAgaGVhZGVyczogSHR0cEhlYWRlcnM7XG4gIHN0YXR1czogbnVtYmVyO1xuICBzdGF0dXNUZXh0OiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFVzZXMgYFhNTEh0dHBSZXF1ZXN0YCB0byBzZW5kIHJlcXVlc3RzIHRvIGEgYmFja2VuZCBzZXJ2ZXIuXG4gKiBAc2VlIGBIdHRwSGFuZGxlcmBcbiAqIEBzZWUgYEpzb25wQ2xpZW50QmFja2VuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwWGhyQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB4aHJGYWN0b3J5OiBYaHJGYWN0b3J5KSB7fVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgYSByZXF1ZXN0IGFuZCByZXR1cm5zIGEgc3RyZWFtIG9mIHJlc3BvbnNlIGV2ZW50cy5cbiAgICogQHBhcmFtIHJlcSBUaGUgcmVxdWVzdCBvYmplY3QuXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIHJlc3BvbnNlIGV2ZW50cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gUXVpY2sgY2hlY2sgdG8gZ2l2ZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHdoZW4gYSB1c2VyIGF0dGVtcHRzIHRvIHVzZVxuICAgIC8vIEh0dHBDbGllbnQuanNvbnAoKSB3aXRob3V0IGluc3RhbGxpbmcgdGhlIEh0dHBDbGllbnRKc29ucE1vZHVsZVxuICAgIGlmIChyZXEubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEF0dGVtcHRlZCB0byBjb25zdHJ1Y3QgSnNvbnAgcmVxdWVzdCB3aXRob3V0IEh0dHBDbGllbnRKc29ucE1vZHVsZSBpbnN0YWxsZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBoYXBwZW5zIG9uIE9ic2VydmFibGUgc3Vic2NyaXB0aW9uLlxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgLy8gU3RhcnQgYnkgc2V0dGluZyB1cCB0aGUgWEhSIG9iamVjdCB3aXRoIHJlcXVlc3QgbWV0aG9kLCBVUkwsIGFuZCB3aXRoQ3JlZGVudGlhbHMgZmxhZy5cbiAgICAgIGNvbnN0IHhociA9IHRoaXMueGhyRmFjdG9yeS5idWlsZCgpO1xuICAgICAgeGhyLm9wZW4ocmVxLm1ldGhvZCwgcmVxLnVybFdpdGhQYXJhbXMpO1xuICAgICAgaWYgKCEhcmVxLndpdGhDcmVkZW50aWFscykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFsbCB0aGUgcmVxdWVzdGVkIGhlYWRlcnMuXG4gICAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKicpO1xuICAgICAgfVxuXG4gICAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBkZXRlY3RlZFR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2VUeXBlIGlmIG9uZSB3YXMgcmVxdWVzdGVkLlxuICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VUeXBlID0gcmVxLnJlc3BvbnNlVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIC8vIEpTT04gcmVzcG9uc2VzIG5lZWQgdG8gYmUgcHJvY2Vzc2VkIGFzIHRleHQuIFRoaXMgaXMgYmVjYXVzZSBpZiB0aGUgc2VydmVyXG4gICAgICAgIC8vIHJldHVybnMgYW4gWFNTSS1wcmVmaXhlZCBKU09OIHJlc3BvbnNlLCB0aGUgYnJvd3NlciB3aWxsIGZhaWwgdG8gcGFyc2UgaXQsXG4gICAgICAgIC8vIHhoci5yZXNwb25zZSB3aWxsIGJlIG51bGwsIGFuZCB4aHIucmVzcG9uc2VUZXh0IGNhbm5vdCBiZSBhY2Nlc3NlZCB0b1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgcHJlZml4ZWQgSlNPTiBkYXRhIGluIG9yZGVyIHRvIHN0cmlwIHRoZSBwcmVmaXguIFRodXMsIGFsbCBKU09OXG4gICAgICAgIC8vIGlzIHBhcnNlZCBieSBmaXJzdCByZXF1ZXN0aW5nIHRleHQgYW5kIHRoZW4gYXBwbHlpbmcgSlNPTi5wYXJzZS5cbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICgocmVzcG9uc2VUeXBlICE9PSAnanNvbicpID8gcmVzcG9uc2VUeXBlIDogJ3RleHQnKSBhcyBhbnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlcmlhbGl6ZSB0aGUgcmVxdWVzdCBib2R5IGlmIG9uZSBpcyBwcmVzZW50LiBJZiBub3QsIHRoaXMgd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAgICAgIGNvbnN0IHJlcUJvZHkgPSByZXEuc2VyaWFsaXplQm9keSgpO1xuXG4gICAgICAvLyBJZiBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQsIHJlc3BvbnNlIGhlYWRlcnMgd2lsbCBiZSBkZWxpdmVyZWRcbiAgICAgIC8vIGluIHR3byBldmVudHMgLSB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGV2ZW50IGFuZCB0aGUgZnVsbCBIdHRwUmVzcG9uc2VcbiAgICAgIC8vIGV2ZW50LiBIb3dldmVyLCBzaW5jZSByZXNwb25zZSBoZWFkZXJzIGRvbid0IGNoYW5nZSBpbiBiZXR3ZWVuIHRoZXNlXG4gICAgICAvLyB0d28gZXZlbnRzLCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gcGFyc2UgdGhlbSB0d2ljZS4gU28gaGVhZGVyUmVzcG9uc2VcbiAgICAgIC8vIGNhY2hlcyB0aGUgZGF0YSBleHRyYWN0ZWQgZnJvbSB0aGUgcmVzcG9uc2Ugd2hlbmV2ZXIgaXQncyBmaXJzdCBwYXJzZWQsXG4gICAgICAvLyB0byBlbnN1cmUgcGFyc2luZyBpc24ndCBkdXBsaWNhdGVkLlxuICAgICAgbGV0IGhlYWRlclJlc3BvbnNlOiBIdHRwSGVhZGVyUmVzcG9uc2V8bnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIHBhcnRpYWxGcm9tWGhyIGV4dHJhY3RzIHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgZnJvbSB0aGUgY3VycmVudCBYTUxIdHRwUmVxdWVzdFxuICAgICAgLy8gc3RhdGUsIGFuZCBtZW1vaXplcyBpdCBpbnRvIGhlYWRlclJlc3BvbnNlLlxuICAgICAgY29uc3QgcGFydGlhbEZyb21YaHIgPSAoKTogSHR0cEhlYWRlclJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKGhlYWRlclJlc3BvbnNlICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVhZCBzdGF0dXMgYW5kIG5vcm1hbGl6ZSBhbiBJRTkgYnVnIChodHRwczovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTQ1MCkuXG4gICAgICAgIGNvbnN0IHN0YXR1czogbnVtYmVyID0geGhyLnN0YXR1cyA9PT0gMTIyMyA/IEh0dHBTdGF0dXNDb2RlLk5vQ29udGVudCA6IHhoci5zdGF0dXM7XG4gICAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSB4aHIuc3RhdHVzVGV4dCB8fCAnT0snO1xuXG4gICAgICAgIC8vIFBhcnNlIGhlYWRlcnMgZnJvbSBYTUxIdHRwUmVxdWVzdCAtIHRoaXMgc3RlcCBpcyBsYXp5LlxuICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG5cbiAgICAgICAgLy8gUmVhZCB0aGUgcmVzcG9uc2UgVVJMIGZyb20gdGhlIFhNTEh0dHBSZXNwb25zZSBpbnN0YW5jZSBhbmQgZmFsbCBiYWNrIG9uIHRoZVxuICAgICAgICAvLyByZXF1ZXN0IFVSTC5cbiAgICAgICAgY29uc3QgdXJsID0gZ2V0UmVzcG9uc2VVcmwoeGhyKSB8fCByZXEudXJsO1xuXG4gICAgICAgIC8vIENvbnN0cnVjdCB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGFuZCBtZW1vaXplIGl0LlxuICAgICAgICBoZWFkZXJSZXNwb25zZSA9IG5ldyBIdHRwSGVhZGVyUmVzcG9uc2Uoe2hlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSk7XG4gICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIE5leHQsIGEgZmV3IGNsb3N1cmVzIGFyZSBkZWZpbmVkIGZvciB0aGUgdmFyaW91cyBldmVudHMgd2hpY2ggWE1MSHR0cFJlcXVlc3QgY2FuXG4gICAgICAvLyBlbWl0LiBUaGlzIGFsbG93cyB0aGVtIHRvIGJlIHVucmVnaXN0ZXJlZCBhcyBldmVudCBsaXN0ZW5lcnMgbGF0ZXIuXG5cbiAgICAgIC8vIEZpcnN0IHVwIGlzIHRoZSBsb2FkIGV2ZW50LCB3aGljaCByZXByZXNlbnRzIGEgcmVzcG9uc2UgYmVpbmcgZnVsbHkgYXZhaWxhYmxlLlxuICAgICAgY29uc3Qgb25Mb2FkID0gKCkgPT4ge1xuICAgICAgICAvLyBSZWFkIHJlc3BvbnNlIHN0YXRlIGZyb20gdGhlIG1lbW9pemVkIHBhcnRpYWwgZGF0YS5cbiAgICAgICAgbGV0IHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0gPSBwYXJ0aWFsRnJvbVhocigpO1xuXG4gICAgICAgIC8vIFRoZSBib2R5IHdpbGwgYmUgcmVhZCBvdXQgaWYgcHJlc2VudC5cbiAgICAgICAgbGV0IGJvZHk6IGFueXxudWxsID0gbnVsbDtcblxuICAgICAgICBpZiAoc3RhdHVzICE9PSBIdHRwU3RhdHVzQ29kZS5Ob0NvbnRlbnQpIHtcbiAgICAgICAgICAvLyBVc2UgWE1MSHR0cFJlcXVlc3QucmVzcG9uc2UgaWYgc2V0LCByZXNwb25zZVRleHQgb3RoZXJ3aXNlLlxuICAgICAgICAgIGJvZHkgPSAodHlwZW9mIHhoci5yZXNwb25zZSA9PT0gJ3VuZGVmaW5lZCcpID8geGhyLnJlc3BvbnNlVGV4dCA6IHhoci5yZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBhbm90aGVyIHBvdGVudGlhbCBidWcgKHRoaXMgb25lIGNvbWVzIGZyb20gQ09SUykuXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgICBzdGF0dXMgPSAhIWJvZHkgPyBIdHRwU3RhdHVzQ29kZS5PayA6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAgICAgLy8gYnV0IGEgc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZSBjYW4gc3RpbGwgcmVzdWx0IGluIGFuIGVycm9yIGlmIHRoZSB1c2VyXG4gICAgICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICAgICAgbGV0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgYm9keSBuZWVkcyB0byBiZSBwYXJzZWQgYXMgSlNPTiAoaW4gbWFueSBjYXNlcyB0aGUgYnJvd3NlclxuICAgICAgICAvLyB3aWxsIGhhdmUgZG9uZSB0aGF0IGFscmVhZHkpLlxuICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nICYmIHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIGJvZHksIGJlZm9yZSBhdHRlbXB0aW5nIFhTU0kgcHJlZml4IHN0cmlwcGluZy5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbEJvZHkgPSBib2R5O1xuICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQXR0ZW1wdCB0aGUgcGFyc2UuIElmIGl0IGZhaWxzLCBhIHBhcnNlIGVycm9yIHNob3VsZCBiZSBkZWxpdmVyZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBib2R5ID0gYm9keSAhPT0gJycgPyBKU09OLnBhcnNlKGJvZHkpIDogbnVsbDtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gU2luY2UgdGhlIEpTT04ucGFyc2UgZmFpbGVkLCBpdCdzIHJlYXNvbmFibGUgdG8gYXNzdW1lIHRoaXMgbWlnaHQgbm90IGhhdmUgYmVlbiBhXG4gICAgICAgICAgICAvLyBKU09OIHJlc3BvbnNlLiBSZXN0b3JlIHRoZSBvcmlnaW5hbCBib2R5IChpbmNsdWRpbmcgYW55IFhTU0kgcHJlZml4KSB0byBkZWxpdmVyXG4gICAgICAgICAgICAvLyBhIGJldHRlciBlcnJvciByZXNwb25zZS5cbiAgICAgICAgICAgIGJvZHkgPSBvcmlnaW5hbEJvZHk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoaXMgd2FzIGFuIGVycm9yIHJlcXVlc3QgdG8gYmVnaW4gd2l0aCwgbGVhdmUgaXQgYXMgYSBzdHJpbmcsIGl0IHByb2JhYmx5XG4gICAgICAgICAgICAvLyBqdXN0IGlzbid0IEpTT04uIE90aGVyd2lzZSwgZGVsaXZlciB0aGUgcGFyc2luZyBlcnJvciB0byB0aGUgdXNlci5cbiAgICAgICAgICAgIGlmIChvaykge1xuICAgICAgICAgICAgICAvLyBFdmVuIHRob3VnaCB0aGUgcmVzcG9uc2Ugc3RhdHVzIHdhcyAyeHgsIHRoaXMgaXMgc3RpbGwgYW4gZXJyb3IuXG4gICAgICAgICAgICAgIG9rID0gZmFsc2U7XG4gICAgICAgICAgICAgIC8vIFRoZSBwYXJzZSBlcnJvciBjb250YWlucyB0aGUgdGV4dCBvZiB0aGUgYm9keSB0aGF0IGZhaWxlZCB0byBwYXJzZS5cbiAgICAgICAgICAgICAgYm9keSA9IHtlcnJvciwgdGV4dDogYm9keX0gYXMgSHR0cEpzb25QYXJzZUVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvaykge1xuICAgICAgICAgIC8vIEEgc3VjY2Vzc2Z1bCByZXNwb25zZSBpcyBkZWxpdmVyZWQgb24gdGhlIGV2ZW50IHN0cmVhbS5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICAvLyBUaGUgZnVsbCBib2R5IGhhcyBiZWVuIHJlY2VpdmVkIGFuZCBkZWxpdmVyZWQsIG5vIGZ1cnRoZXIgZXZlbnRzXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlLiBUaGlzIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBBbiB1bnN1Y2Nlc3NmdWwgcmVxdWVzdCBpcyBkZWxpdmVyZWQgb24gdGhlIGVycm9yIGNoYW5uZWwuXG4gICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICAgIC8vIFRoZSBlcnJvciBpbiB0aGlzIGNhc2UgaXMgdGhlIHJlc3BvbnNlIGJvZHkgKGVycm9yIGZyb20gdGhlIHNlcnZlcikuXG4gICAgICAgICAgICBlcnJvcjogYm9keSxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gVGhlIG9uRXJyb3IgY2FsbGJhY2sgaXMgY2FsbGVkIHdoZW4gc29tZXRoaW5nIGdvZXMgd3JvbmcgYXQgdGhlIG5ldHdvcmsgbGV2ZWwuXG4gICAgICAvLyBDb25uZWN0aW9uIHRpbWVvdXQsIEROUyBlcnJvciwgb2ZmbGluZSwgZXRjLiBUaGVzZSBhcmUgYWN0dWFsIGVycm9ycywgYW5kIGFyZVxuICAgICAgLy8gdHJhbnNtaXR0ZWQgb24gdGhlIGVycm9yIGNoYW5uZWwuXG4gICAgICBjb25zdCBvbkVycm9yID0gKGVycm9yOiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHt1cmx9ID0gcGFydGlhbEZyb21YaHIoKTtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMgfHwgMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCB8fCAnVW5rbm93biBFcnJvcicsXG4gICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IocmVzKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSBzZW50SGVhZGVycyBmbGFnIHRyYWNrcyB3aGV0aGVyIHRoZSBIdHRwUmVzcG9uc2VIZWFkZXJzIGV2ZW50XG4gICAgICAvLyBoYXMgYmVlbiBzZW50IG9uIHRoZSBzdHJlYW0uIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHRyYWNrIGlmIHByb2dyZXNzXG4gICAgICAvLyBpcyBlbmFibGVkIHNpbmNlIHRoZSBldmVudCB3aWxsIGJlIHNlbnQgb24gb25seSB0aGUgZmlyc3QgZG93bmxvYWRcbiAgICAgIC8vIHByb2dlcnNzIGV2ZW50LlxuICAgICAgbGV0IHNlbnRIZWFkZXJzID0gZmFsc2U7XG5cbiAgICAgIC8vIFRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgIGNvbnN0IG9uRG93blByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIC8vIFNlbmQgdGhlIEh0dHBSZXNwb25zZUhlYWRlcnMgZXZlbnQgaWYgaXQgaGFzbid0IGJlZW4gc2VudCBhbHJlYWR5LlxuICAgICAgICBpZiAoIXNlbnRIZWFkZXJzKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChwYXJ0aWFsRnJvbVhocigpKTtcbiAgICAgICAgICBzZW50SGVhZGVycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCBidWlsZGluZyB0aGUgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgdG8gZGVsaXZlciBvbiB0aGUgcmVzcG9uc2VcbiAgICAgICAgLy8gZXZlbnQgc3RyZWFtLlxuICAgICAgICBsZXQgcHJvZ3Jlc3NFdmVudDogSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU2V0IHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgaW4gdGhlIGV2ZW50IGlmIGl0J3MgYXZhaWxhYmxlLlxuICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHByb2dyZXNzRXZlbnQudG90YWwgPSBldmVudC50b3RhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBmb3IgdGV4dCBjb250ZW50IGFuZCBhIHBhcnRpYWwgcmVzcG9uc2UgaXNcbiAgICAgICAgLy8gYXZhaWxhYmxlIG9uIFhNTEh0dHBSZXF1ZXN0LCBpbmNsdWRlIGl0IGluIHRoZSBwcm9ncmVzcyBldmVudFxuICAgICAgICAvLyB0byBhbGxvdyBmb3Igc3RyZWFtaW5nIHJlYWRzLlxuICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnICYmICEheGhyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgIHByb2dyZXNzRXZlbnQucGFydGlhbFRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgZmlyZSB0aGUgZXZlbnQuXG4gICAgICAgIG9ic2VydmVyLm5leHQocHJvZ3Jlc3NFdmVudCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgdXBsb2FkIHByb2dyZXNzIGV2ZW50IGhhbmRsZXIsIHdoaWNoIGlzIG9ubHkgcmVnaXN0ZXJlZCBpZlxuICAgICAgLy8gcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLlxuICAgICAgY29uc3Qgb25VcFByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBldmVudHMgYXJlIHNpbXBsZXIuIEJlZ2luIGJ1aWxkaW5nIHRoZSBwcm9ncmVzc1xuICAgICAgICAvLyBldmVudC5cbiAgICAgICAgbGV0IHByb2dyZXNzOiBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzLFxuICAgICAgICAgIGxvYWRlZDogZXZlbnQubG9hZGVkLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIElmIHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgYmVpbmcgdXBsb2FkZWQgaXMgYXZhaWxhYmxlLCBpbmNsdWRlXG4gICAgICAgIC8vIGl0LlxuICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHByb2dyZXNzLnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZW5kIHRoZSBldmVudC5cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChwcm9ncmVzcyk7XG4gICAgICB9O1xuXG4gICAgICAvLyBCeSBkZWZhdWx0LCByZWdpc3RlciBmb3IgbG9hZCBhbmQgZXJyb3IgZXZlbnRzLlxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigndGltZW91dCcsIG9uRXJyb3IpO1xuXG4gICAgICAvLyBQcm9ncmVzcyBldmVudHMgYXJlIG9ubHkgZW5hYmxlZCBpZiByZXF1ZXN0ZWQuXG4gICAgICBpZiAocmVxLnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgIC8vIERvd25sb2FkIHByb2dyZXNzIGlzIGFsd2F5cyBlbmFibGVkIGlmIHJlcXVlc3RlZC5cbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Eb3duUHJvZ3Jlc3MpO1xuXG4gICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSBib2R5IHRvIHVwbG9hZC5cbiAgICAgICAgaWYgKHJlcUJvZHkgIT09IG51bGwgJiYgeGhyLnVwbG9hZCkge1xuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblVwUHJvZ3Jlc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcmUgdGhlIHJlcXVlc3QsIGFuZCBub3RpZnkgdGhlIGV2ZW50IHN0cmVhbSB0aGF0IGl0IHdhcyBmaXJlZC5cbiAgICAgIHhoci5zZW5kKHJlcUJvZHkhKTtcbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICAvLyBUaGlzIGlzIHRoZSByZXR1cm4gZnJvbSB0aGUgT2JzZXJ2YWJsZSBmdW5jdGlvbiwgd2hpY2ggaXMgdGhlXG4gICAgICAvLyByZXF1ZXN0IGNhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgLy8gT24gYSBjYW5jZWxsYXRpb24sIHJlbW92ZSBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCd0aW1lb3V0Jywgb25FcnJvcik7XG4gICAgICAgIGlmIChyZXEucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvbkRvd25Qcm9ncmVzcyk7XG4gICAgICAgICAgaWYgKHJlcUJvZHkgIT09IG51bGwgJiYgeGhyLnVwbG9hZCkge1xuICAgICAgICAgICAgeGhyLnVwbG9hZC5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uVXBQcm9ncmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgYWJvcnQgdGhlIGluLWZsaWdodCByZXF1ZXN0LlxuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgIT09IHhoci5ET05FKSB7XG4gICAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==