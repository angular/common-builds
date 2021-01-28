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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBc0IsWUFBWSxFQUEwQyxNQUFNLFlBQVksQ0FBQzs7QUFHak0sTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLEdBQVE7SUFDOUIsSUFBSSxhQUFhLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDM0MsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRTtRQUN4RCxPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLFVBQVU7Q0FFL0I7QUFFRDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sVUFBVTtJQUNyQixnQkFBZSxDQUFDO0lBQ2hCLEtBQUs7UUFDSCxPQUFZLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7O29FQUpVLFVBQVU7a0RBQVYsVUFBVSxXQUFWLFVBQVU7dUZBQVYsVUFBVTtjQUR0QixVQUFVOztBQWtCWDs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sY0FBYztJ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QVU7c0NBRXVCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwSGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQsIEh0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBIZWFkZXJSZXNwb25zZSwgSHR0cEpzb25QYXJzZUVycm9yLCBIdHRwUmVzcG9uc2UsIEh0dHBTdGF0dXNDb2RlLCBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cblxuY29uc3QgWFNTSV9QUkVGSVggPSAvXlxcKVxcXVxcfScsP1xcbi87XG5cbi8qKlxuICogRGV0ZXJtaW5lIGFuIGFwcHJvcHJpYXRlIFVSTCBmb3IgdGhlIHJlc3BvbnNlLCBieSBjaGVja2luZyBlaXRoZXJcbiAqIFhNTEh0dHBSZXF1ZXN0LnJlc3BvbnNlVVJMIG9yIHRoZSBYLVJlcXVlc3QtVVJMIGhlYWRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVzcG9uc2VVcmwoeGhyOiBhbnkpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICgncmVzcG9uc2VVUkwnIGluIHhociAmJiB4aHIucmVzcG9uc2VVUkwpIHtcbiAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMO1xuICB9XG4gIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEEgd3JhcHBlciBhcm91bmQgdGhlIGBYTUxIdHRwUmVxdWVzdGAgY29uc3RydWN0b3IuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgWGhyRmFjdG9yeSB7XG4gIGFic3RyYWN0IGJ1aWxkKCk6IFhNTEh0dHBSZXF1ZXN0O1xufVxuXG4vKipcbiAqIEEgZmFjdG9yeSBmb3IgYEh0dHBYaHJCYWNrZW5kYCB0aGF0IHVzZXMgdGhlIGBYTUxIdHRwUmVxdWVzdGAgYnJvd3NlciBBUEkuXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3NlclhociBpbXBsZW1lbnRzIFhockZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIGJ1aWxkKCk6IGFueSB7XG4gICAgcmV0dXJuIDxhbnk+KG5ldyBYTUxIdHRwUmVxdWVzdCgpKTtcbiAgfVxufVxuXG4vKipcbiAqIFRyYWNrcyBhIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciB0aGF0IGRvZXMgbm90IHlldCBoYXZlIGEgYm9keS5cbiAqL1xuaW50ZXJmYWNlIFBhcnRpYWxSZXNwb25zZSB7XG4gIGhlYWRlcnM6IEh0dHBIZWFkZXJzO1xuICBzdGF0dXM6IG51bWJlcjtcbiAgc3RhdHVzVGV4dDogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBVc2VzIGBYTUxIdHRwUmVxdWVzdGAgdG8gc2VuZCByZXF1ZXN0cyB0byBhIGJhY2tlbmQgc2VydmVyLlxuICogQHNlZSBgSHR0cEhhbmRsZXJgXG4gKiBAc2VlIGBKc29ucENsaWVudEJhY2tlbmRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhockJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgeGhyRmFjdG9yeTogWGhyRmFjdG9yeSkge31cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIGEgcmVxdWVzdCBhbmQgcmV0dXJucyBhIHN0cmVhbSBvZiByZXNwb25zZSBldmVudHMuXG4gICAqIEBwYXJhbSByZXEgVGhlIHJlcXVlc3Qgb2JqZWN0LlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSByZXNwb25zZSBldmVudHMuXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIC8vIFF1aWNrIGNoZWNrIHRvIGdpdmUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSB3aGVuIGEgdXNlciBhdHRlbXB0cyB0byB1c2VcbiAgICAvLyBIdHRwQ2xpZW50Lmpzb25wKCkgd2l0aG91dCBpbnN0YWxsaW5nIHRoZSBIdHRwQ2xpZW50SnNvbnBNb2R1bGVcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBdHRlbXB0ZWQgdG8gY29uc3RydWN0IEpzb25wIHJlcXVlc3Qgd2l0aG91dCBIdHRwQ2xpZW50SnNvbnBNb2R1bGUgaW5zdGFsbGVkLmApO1xuICAgIH1cblxuICAgIC8vIEV2ZXJ5dGhpbmcgaGFwcGVucyBvbiBPYnNlcnZhYmxlIHN1YnNjcmlwdGlvbi5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pID0+IHtcbiAgICAgIC8vIFN0YXJ0IGJ5IHNldHRpbmcgdXAgdGhlIFhIUiBvYmplY3Qgd2l0aCByZXF1ZXN0IG1ldGhvZCwgVVJMLCBhbmQgd2l0aENyZWRlbnRpYWxzIGZsYWcuXG4gICAgICBjb25zdCB4aHIgPSB0aGlzLnhockZhY3RvcnkuYnVpbGQoKTtcbiAgICAgIHhoci5vcGVuKHJlcS5tZXRob2QsIHJlcS51cmxXaXRoUGFyYW1zKTtcbiAgICAgIGlmICghIXJlcS53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhbGwgdGhlIHJlcXVlc3RlZCBoZWFkZXJzLlxuICAgICAgcmVxLmhlYWRlcnMuZm9yRWFjaCgobmFtZSwgdmFsdWVzKSA9PiB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZXMuam9pbignLCcpKSk7XG5cbiAgICAgIC8vIEFkZCBhbiBBY2NlcHQgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgICBpZiAoIXJlcS5oZWFkZXJzLmhhcygnQWNjZXB0JykpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonKTtcbiAgICAgIH1cblxuICAgICAgLy8gQXV0by1kZXRlY3QgdGhlIENvbnRlbnQtVHlwZSBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSkge1xuICAgICAgICBjb25zdCBkZXRlY3RlZFR5cGUgPSByZXEuZGV0ZWN0Q29udGVudFR5cGVIZWFkZXIoKTtcbiAgICAgICAgLy8gU29tZXRpbWVzIENvbnRlbnQtVHlwZSBkZXRlY3Rpb24gZmFpbHMuXG4gICAgICAgIGlmIChkZXRlY3RlZFR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgZGV0ZWN0ZWRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIHJlc3BvbnNlVHlwZSBpZiBvbmUgd2FzIHJlcXVlc3RlZC5cbiAgICAgIGlmIChyZXEucmVzcG9uc2VUeXBlKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlVHlwZSA9IHJlcS5yZXNwb25zZVR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAvLyBKU09OIHJlc3BvbnNlcyBuZWVkIHRvIGJlIHByb2Nlc3NlZCBhcyB0ZXh0LiBUaGlzIGlzIGJlY2F1c2UgaWYgdGhlIHNlcnZlclxuICAgICAgICAvLyByZXR1cm5zIGFuIFhTU0ktcHJlZml4ZWQgSlNPTiByZXNwb25zZSwgdGhlIGJyb3dzZXIgd2lsbCBmYWlsIHRvIHBhcnNlIGl0LFxuICAgICAgICAvLyB4aHIucmVzcG9uc2Ugd2lsbCBiZSBudWxsLCBhbmQgeGhyLnJlc3BvbnNlVGV4dCBjYW5ub3QgYmUgYWNjZXNzZWQgdG9cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIHByZWZpeGVkIEpTT04gZGF0YSBpbiBvcmRlciB0byBzdHJpcCB0aGUgcHJlZml4LiBUaHVzLCBhbGwgSlNPTlxuICAgICAgICAvLyBpcyBwYXJzZWQgYnkgZmlyc3QgcmVxdWVzdGluZyB0ZXh0IGFuZCB0aGVuIGFwcGx5aW5nIEpTT04ucGFyc2UuXG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAoKHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSA/IHJlc3BvbnNlVHlwZSA6ICd0ZXh0JykgYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBTZXJpYWxpemUgdGhlIHJlcXVlc3QgYm9keSBpZiBvbmUgaXMgcHJlc2VudC4gSWYgbm90LCB0aGlzIHdpbGwgYmUgc2V0IHRvIG51bGwuXG4gICAgICBjb25zdCByZXFCb2R5ID0gcmVxLnNlcmlhbGl6ZUJvZHkoKTtcblxuICAgICAgLy8gSWYgcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLCByZXNwb25zZSBoZWFkZXJzIHdpbGwgYmUgZGVsaXZlcmVkXG4gICAgICAvLyBpbiB0d28gZXZlbnRzIC0gdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBldmVudCBhbmQgdGhlIGZ1bGwgSHR0cFJlc3BvbnNlXG4gICAgICAvLyBldmVudC4gSG93ZXZlciwgc2luY2UgcmVzcG9uc2UgaGVhZGVycyBkb24ndCBjaGFuZ2UgaW4gYmV0d2VlbiB0aGVzZVxuICAgICAgLy8gdHdvIGV2ZW50cywgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIHBhcnNlIHRoZW0gdHdpY2UuIFNvIGhlYWRlclJlc3BvbnNlXG4gICAgICAvLyBjYWNoZXMgdGhlIGRhdGEgZXh0cmFjdGVkIGZyb20gdGhlIHJlc3BvbnNlIHdoZW5ldmVyIGl0J3MgZmlyc3QgcGFyc2VkLFxuICAgICAgLy8gdG8gZW5zdXJlIHBhcnNpbmcgaXNuJ3QgZHVwbGljYXRlZC5cbiAgICAgIGxldCBoZWFkZXJSZXNwb25zZTogSHR0cEhlYWRlclJlc3BvbnNlfG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBwYXJ0aWFsRnJvbVhociBleHRyYWN0cyB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGZyb20gdGhlIGN1cnJlbnQgWE1MSHR0cFJlcXVlc3RcbiAgICAgIC8vIHN0YXRlLCBhbmQgbWVtb2l6ZXMgaXQgaW50byBoZWFkZXJSZXNwb25zZS5cbiAgICAgIGNvbnN0IHBhcnRpYWxGcm9tWGhyID0gKCk6IEh0dHBIZWFkZXJSZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChoZWFkZXJSZXNwb25zZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgc3RhdHVzIGFuZCBub3JtYWxpemUgYW4gSUU5IGJ1ZyAoaHR0cHM6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzE0NTApLlxuICAgICAgICBjb25zdCBzdGF0dXM6IG51bWJlciA9IHhoci5zdGF0dXMgPT09IDEyMjMgPyBIdHRwU3RhdHVzQ29kZS5Ob0NvbnRlbnQgOiB4aHIuc3RhdHVzO1xuICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQgfHwgJ09LJztcblxuICAgICAgICAvLyBQYXJzZSBoZWFkZXJzIGZyb20gWE1MSHR0cFJlcXVlc3QgLSB0aGlzIHN0ZXAgaXMgbGF6eS5cbiAgICAgICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuXG4gICAgICAgIC8vIFJlYWQgdGhlIHJlc3BvbnNlIFVSTCBmcm9tIHRoZSBYTUxIdHRwUmVzcG9uc2UgaW5zdGFuY2UgYW5kIGZhbGwgYmFjayBvbiB0aGVcbiAgICAgICAgLy8gcmVxdWVzdCBVUkwuXG4gICAgICAgIGNvbnN0IHVybCA9IGdldFJlc3BvbnNlVXJsKHhocikgfHwgcmVxLnVybDtcblxuICAgICAgICAvLyBDb25zdHJ1Y3QgdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBhbmQgbWVtb2l6ZSBpdC5cbiAgICAgICAgaGVhZGVyUmVzcG9uc2UgPSBuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pO1xuICAgICAgICByZXR1cm4gaGVhZGVyUmVzcG9uc2U7XG4gICAgICB9O1xuXG4gICAgICAvLyBOZXh0LCBhIGZldyBjbG9zdXJlcyBhcmUgZGVmaW5lZCBmb3IgdGhlIHZhcmlvdXMgZXZlbnRzIHdoaWNoIFhNTEh0dHBSZXF1ZXN0IGNhblxuICAgICAgLy8gZW1pdC4gVGhpcyBhbGxvd3MgdGhlbSB0byBiZSB1bnJlZ2lzdGVyZWQgYXMgZXZlbnQgbGlzdGVuZXJzIGxhdGVyLlxuXG4gICAgICAvLyBGaXJzdCB1cCBpcyB0aGUgbG9hZCBldmVudCwgd2hpY2ggcmVwcmVzZW50cyBhIHJlc3BvbnNlIGJlaW5nIGZ1bGx5IGF2YWlsYWJsZS5cbiAgICAgIGNvbnN0IG9uTG9hZCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVhZCByZXNwb25zZSBzdGF0ZSBmcm9tIHRoZSBtZW1vaXplZCBwYXJ0aWFsIGRhdGEuXG4gICAgICAgIGxldCB7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9ID0gcGFydGlhbEZyb21YaHIoKTtcblxuICAgICAgICAvLyBUaGUgYm9keSB3aWxsIGJlIHJlYWQgb3V0IGlmIHByZXNlbnQuXG4gICAgICAgIGxldCBib2R5OiBhbnl8bnVsbCA9IG51bGw7XG5cbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gSHR0cFN0YXR1c0NvZGUuTm9Db250ZW50KSB7XG4gICAgICAgICAgLy8gVXNlIFhNTEh0dHBSZXF1ZXN0LnJlc3BvbnNlIGlmIHNldCwgcmVzcG9uc2VUZXh0IG90aGVyd2lzZS5cbiAgICAgICAgICBib2R5ID0gKHR5cGVvZiB4aHIucmVzcG9uc2UgPT09ICd1bmRlZmluZWQnKSA/IHhoci5yZXNwb25zZVRleHQgOiB4aHIucmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3JtYWxpemUgYW5vdGhlciBwb3RlbnRpYWwgYnVnICh0aGlzIG9uZSBjb21lcyBmcm9tIENPUlMpLlxuICAgICAgICBpZiAoc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgc3RhdHVzID0gISFib2R5ID8gSHR0cFN0YXR1c0NvZGUuT2sgOiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb2sgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZXNwb25zZSB3aWxsIGJlIHRyYW5zbWl0dGVkIG9uIHRoZSBldmVudCBvclxuICAgICAgICAvLyBlcnJvciBjaGFubmVsLiBVbnN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGVzIChub3QgMnh4KSB3aWxsIGFsd2F5cyBiZSBlcnJvcnMsXG4gICAgICAgIC8vIGJ1dCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgY2FuIHN0aWxsIHJlc3VsdCBpbiBhbiBlcnJvciBpZiB0aGUgdXNlclxuICAgICAgICAvLyBhc2tlZCBmb3IgSlNPTiBkYXRhIGFuZCB0aGUgYm9keSBjYW5ub3QgYmUgcGFyc2VkIGFzIHN1Y2guXG4gICAgICAgIGxldCBvayA9IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuXG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgbmVlZHMgdG8gYmUgcGFyc2VkIGFzIEpTT04gKGluIG1hbnkgY2FzZXMgdGhlIGJyb3dzZXJcbiAgICAgICAgLy8gd2lsbCBoYXZlIGRvbmUgdGhhdCBhbHJlYWR5KS5cbiAgICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUgPT09ICdqc29uJyAmJiB0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCBib2R5LCBiZWZvcmUgYXR0ZW1wdGluZyBYU1NJIHByZWZpeCBzdHJpcHBpbmcuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxCb2R5ID0gYm9keTtcbiAgICAgICAgICBib2R5ID0gYm9keS5yZXBsYWNlKFhTU0lfUFJFRklYLCAnJyk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEF0dGVtcHQgdGhlIHBhcnNlLiBJZiBpdCBmYWlscywgYSBwYXJzZSBlcnJvciBzaG91bGQgYmUgZGVsaXZlcmVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgYm9keSA9IGJvZHkgIT09ICcnID8gSlNPTi5wYXJzZShib2R5KSA6IG51bGw7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBKU09OLnBhcnNlIGZhaWxlZCwgaXQncyByZWFzb25hYmxlIHRvIGFzc3VtZSB0aGlzIG1pZ2h0IG5vdCBoYXZlIGJlZW4gYVxuICAgICAgICAgICAgLy8gSlNPTiByZXNwb25zZS4gUmVzdG9yZSB0aGUgb3JpZ2luYWwgYm9keSAoaW5jbHVkaW5nIGFueSBYU1NJIHByZWZpeCkgdG8gZGVsaXZlclxuICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZXJyb3IgcmVzcG9uc2UuXG4gICAgICAgICAgICBib2R5ID0gb3JpZ2luYWxCb2R5O1xuXG4gICAgICAgICAgICAvLyBJZiB0aGlzIHdhcyBhbiBlcnJvciByZXF1ZXN0IHRvIGJlZ2luIHdpdGgsIGxlYXZlIGl0IGFzIGEgc3RyaW5nLCBpdCBwcm9iYWJseVxuICAgICAgICAgICAgLy8ganVzdCBpc24ndCBKU09OLiBPdGhlcndpc2UsIGRlbGl2ZXIgdGhlIHBhcnNpbmcgZXJyb3IgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgLy8gRXZlbiB0aG91Z2ggdGhlIHJlc3BvbnNlIHN0YXR1cyB3YXMgMnh4LCB0aGlzIGlzIHN0aWxsIGFuIGVycm9yLlxuICAgICAgICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICAgICAgICAvLyBUaGUgcGFyc2UgZXJyb3IgY29udGFpbnMgdGhlIHRleHQgb2YgdGhlIGJvZHkgdGhhdCBmYWlsZWQgdG8gcGFyc2UuXG4gICAgICAgICAgICAgIGJvZHkgPSB7ZXJyb3IsIHRleHQ6IGJvZHl9IGFzIEh0dHBKc29uUGFyc2VFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAvLyBBIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgaXMgZGVsaXZlcmVkIG9uIHRoZSBldmVudCBzdHJlYW0uXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgLy8gVGhlIGZ1bGwgYm9keSBoYXMgYmVlbiByZWNlaXZlZCBhbmQgZGVsaXZlcmVkLCBubyBmdXJ0aGVyIGV2ZW50c1xuICAgICAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQW4gdW5zdWNjZXNzZnVsIHJlcXVlc3QgaXMgZGVsaXZlcmVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAvLyBUaGUgZXJyb3IgaW4gdGhpcyBjYXNlIGlzIHRoZSByZXNwb25zZSBib2R5IChlcnJvciBmcm9tIHRoZSBzZXJ2ZXIpLlxuICAgICAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSBvbkVycm9yIGNhbGxiYWNrIGlzIGNhbGxlZCB3aGVuIHNvbWV0aGluZyBnb2VzIHdyb25nIGF0IHRoZSBuZXR3b3JrIGxldmVsLlxuICAgICAgLy8gQ29ubmVjdGlvbiB0aW1lb3V0LCBETlMgZXJyb3IsIG9mZmxpbmUsIGV0Yy4gVGhlc2UgYXJlIGFjdHVhbCBlcnJvcnMsIGFuZCBhcmVcbiAgICAgIC8vIHRyYW5zbWl0dGVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgY29uc3Qgb25FcnJvciA9IChlcnJvcjogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7dXJsfSA9IHBhcnRpYWxGcm9tWGhyKCk7XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzIHx8IDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQgfHwgJ1Vua25vd24gRXJyb3InLFxuICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLmVycm9yKHJlcyk7XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgc2VudEhlYWRlcnMgZmxhZyB0cmFja3Mgd2hldGhlciB0aGUgSHR0cFJlc3BvbnNlSGVhZGVycyBldmVudFxuICAgICAgLy8gaGFzIGJlZW4gc2VudCBvbiB0aGUgc3RyZWFtLiBUaGlzIGlzIG5lY2Vzc2FyeSB0byB0cmFjayBpZiBwcm9ncmVzc1xuICAgICAgLy8gaXMgZW5hYmxlZCBzaW5jZSB0aGUgZXZlbnQgd2lsbCBiZSBzZW50IG9uIG9ubHkgdGhlIGZpcnN0IGRvd25sb2FkXG4gICAgICAvLyBwcm9nZXJzcyBldmVudC5cbiAgICAgIGxldCBzZW50SGVhZGVycyA9IGZhbHNlO1xuXG4gICAgICAvLyBUaGUgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciwgd2hpY2ggaXMgb25seSByZWdpc3RlcmVkIGlmXG4gICAgICAvLyBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQuXG4gICAgICBjb25zdCBvbkRvd25Qcm9ncmVzcyA9IChldmVudDogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICAvLyBTZW5kIHRoZSBIdHRwUmVzcG9uc2VIZWFkZXJzIGV2ZW50IGlmIGl0IGhhc24ndCBiZWVuIHNlbnQgYWxyZWFkeS5cbiAgICAgICAgaWYgKCFzZW50SGVhZGVycykge1xuICAgICAgICAgIG9ic2VydmVyLm5leHQocGFydGlhbEZyb21YaHIoKSk7XG4gICAgICAgICAgc2VudEhlYWRlcnMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgYnVpbGRpbmcgdGhlIGRvd25sb2FkIHByb2dyZXNzIGV2ZW50IHRvIGRlbGl2ZXIgb24gdGhlIHJlc3BvbnNlXG4gICAgICAgIC8vIGV2ZW50IHN0cmVhbS5cbiAgICAgICAgbGV0IHByb2dyZXNzRXZlbnQ6IEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQgPSB7XG4gICAgICAgICAgdHlwZTogSHR0cEV2ZW50VHlwZS5Eb3dubG9hZFByb2dyZXNzLFxuICAgICAgICAgIGxvYWRlZDogZXZlbnQubG9hZGVkLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB0aGUgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIGluIHRoZSBldmVudCBpZiBpdCdzIGF2YWlsYWJsZS5cbiAgICAgICAgaWYgKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICBwcm9ncmVzc0V2ZW50LnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgcmVxdWVzdCB3YXMgZm9yIHRleHQgY29udGVudCBhbmQgYSBwYXJ0aWFsIHJlc3BvbnNlIGlzXG4gICAgICAgIC8vIGF2YWlsYWJsZSBvbiBYTUxIdHRwUmVxdWVzdCwgaW5jbHVkZSBpdCBpbiB0aGUgcHJvZ3Jlc3MgZXZlbnRcbiAgICAgICAgLy8gdG8gYWxsb3cgZm9yIHN0cmVhbWluZyByZWFkcy5cbiAgICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyAmJiAhIXhoci5yZXNwb25zZVRleHQpIHtcbiAgICAgICAgICBwcm9ncmVzc0V2ZW50LnBhcnRpYWxUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIGZpcmUgdGhlIGV2ZW50LlxuICAgICAgICBvYnNlcnZlci5uZXh0KHByb2dyZXNzRXZlbnQpO1xuICAgICAgfTtcblxuICAgICAgLy8gVGhlIHVwbG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgIGNvbnN0IG9uVXBQcm9ncmVzcyA9IChldmVudDogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICAvLyBVcGxvYWQgcHJvZ3Jlc3MgZXZlbnRzIGFyZSBzaW1wbGVyLiBCZWdpbiBidWlsZGluZyB0aGUgcHJvZ3Jlc3NcbiAgICAgICAgLy8gZXZlbnQuXG4gICAgICAgIGxldCBwcm9ncmVzczogSHR0cFVwbG9hZFByb2dyZXNzRXZlbnQgPSB7XG4gICAgICAgICAgdHlwZTogSHR0cEV2ZW50VHlwZS5VcGxvYWRQcm9ncmVzcyxcbiAgICAgICAgICBsb2FkZWQ6IGV2ZW50LmxvYWRlZCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJZiB0aGUgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIGJlaW5nIHVwbG9hZGVkIGlzIGF2YWlsYWJsZSwgaW5jbHVkZVxuICAgICAgICAvLyBpdC5cbiAgICAgICAgaWYgKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICBwcm9ncmVzcy50b3RhbCA9IGV2ZW50LnRvdGFsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2VuZCB0aGUgZXZlbnQuXG4gICAgICAgIG9ic2VydmVyLm5leHQocHJvZ3Jlc3MpO1xuICAgICAgfTtcblxuICAgICAgLy8gQnkgZGVmYXVsdCwgcmVnaXN0ZXIgZm9yIGxvYWQgYW5kIGVycm9yIGV2ZW50cy5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuXG4gICAgICAvLyBQcm9ncmVzcyBldmVudHMgYXJlIG9ubHkgZW5hYmxlZCBpZiByZXF1ZXN0ZWQuXG4gICAgICBpZiAocmVxLnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgIC8vIERvd25sb2FkIHByb2dyZXNzIGlzIGFsd2F5cyBlbmFibGVkIGlmIHJlcXVlc3RlZC5cbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Eb3duUHJvZ3Jlc3MpO1xuXG4gICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSBib2R5IHRvIHVwbG9hZC5cbiAgICAgICAgaWYgKHJlcUJvZHkgIT09IG51bGwgJiYgeGhyLnVwbG9hZCkge1xuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblVwUHJvZ3Jlc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcmUgdGhlIHJlcXVlc3QsIGFuZCBub3RpZnkgdGhlIGV2ZW50IHN0cmVhbSB0aGF0IGl0IHdhcyBmaXJlZC5cbiAgICAgIHhoci5zZW5kKHJlcUJvZHkhKTtcbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICAvLyBUaGlzIGlzIHRoZSByZXR1cm4gZnJvbSB0aGUgT2JzZXJ2YWJsZSBmdW5jdGlvbiwgd2hpY2ggaXMgdGhlXG4gICAgICAvLyByZXF1ZXN0IGNhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgLy8gT24gYSBjYW5jZWxsYXRpb24sIHJlbW92ZSBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIGlmIChyZXEucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvbkRvd25Qcm9ncmVzcyk7XG4gICAgICAgICAgaWYgKHJlcUJvZHkgIT09IG51bGwgJiYgeGhyLnVwbG9hZCkge1xuICAgICAgICAgICAgeGhyLnVwbG9hZC5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uVXBQcm9ncmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgYWJvcnQgdGhlIGluLWZsaWdodCByZXF1ZXN0LlxuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgIT09IHhoci5ET05FKSB7XG4gICAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==