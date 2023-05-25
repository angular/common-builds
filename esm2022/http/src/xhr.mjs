/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { XhrFactory } from '@angular/common';
import { Injectable, ɵRuntimeError as RuntimeError } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
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
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see {@link HttpHandler}
 * @see {@link JsonpClientBackend}
 *
 * @publicApi
 */
class HttpXhrBackend {
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
            throw new RuntimeError(-2800 /* RuntimeErrorCode.MISSING_JSONP_MODULE */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                `Cannot make a JSONP request without JSONP support. To fix the problem, either add the \`withJsonpSupport()\` call (if \`provideHttpClient()\` is used) or import the \`HttpClientJsonpModule\` in the root NgModule.`);
        }
        // Schedule a macrotask. This will cause NgZone.isStable to be set to false,
        // Which delays server rendering until the request is completed.
        const macroTaskCanceller = createBackgroundMacroTask();
        // Check whether this factory has a special function to load an XHR implementation
        // for various non-browser environments. We currently limit it to only `ServerXhr`
        // class, which needs to load an XHR implementation.
        const xhrFactory = this.xhrFactory;
        const source = xhrFactory.ɵloadImpl ? from(xhrFactory.ɵloadImpl()) : of(null);
        return source.pipe(switchMap(() => {
            // Everything happens on Observable subscription.
            return new Observable((observer) => {
                // Start by setting up the XHR object with request method, URL, and withCredentials
                // flag.
                const xhr = xhrFactory.build();
                xhr.open(req.method, req.urlWithParams);
                if (req.withCredentials) {
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
                    const statusText = xhr.statusText || 'OK';
                    // Parse headers from XMLHttpRequest - this step is lazy.
                    const headers = new HttpHeaders(xhr.getAllResponseHeaders());
                    // Read the response URL from the XMLHttpResponse instance and fall back on the
                    // request URL.
                    const url = getResponseUrl(xhr) || req.url;
                    // Construct the HttpHeaderResponse and memoize it.
                    headerResponse =
                        new HttpHeaderResponse({ headers, status: xhr.status, statusText, url });
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
                    if (status !== 204 /* HttpStatusCode.NoContent */) {
                        // Use XMLHttpRequest.response if set, responseText otherwise.
                        body = (typeof xhr.response === 'undefined') ? xhr.responseText : xhr.response;
                    }
                    // Normalize another potential bug (this one comes from CORS).
                    if (status === 0) {
                        status = !!body ? 200 /* HttpStatusCode.Ok */ : 0;
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
                            // Attempt the parse. If it fails, a parse error should be delivered to the
                            // user.
                            body = body !== '' ? JSON.parse(body) : null;
                        }
                        catch (error) {
                            // Since the JSON.parse failed, it's reasonable to assume this might not have
                            // been a JSON response. Restore the original body (including any XSSI prefix)
                            // to deliver a better error response.
                            body = originalBody;
                            // If this was an error request to begin with, leave it as a string, it
                            // probably just isn't JSON. Otherwise, deliver the parsing error to the user.
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
                    // Cancel the background macrotask.
                    macroTaskCanceller();
                };
                // The sentHeaders flag tracks whether the HttpResponseHeaders event
                // has been sent on the stream. This is necessary to track if progress
                // is enabled since the event will be sent on only the first download
                // progress event.
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
                xhr.addEventListener('abort', onError);
                // Progress events are only enabled if requested.
                if (req.reportProgress) {
                    // Download progress is always enabled if requested.
                    xhr.addEventListener('progress', onDownProgress);
                    // Upload progress depends on whether there is a body to upload.
                    if (reqBody !== null && xhr.upload) {
                        xhr.upload.addEventListener('progress', onUpProgress);
                    }
                }
                /** Tear down logic to cancel the backround macrotask. */
                const onLoadEnd = () => macroTaskCanceller();
                xhr.addEventListener('loadend', onLoadEnd);
                // Fire the request, and notify the event stream that it was fired.
                try {
                    xhr.send(reqBody);
                }
                catch (e) {
                    onError(e);
                }
                observer.next({ type: HttpEventType.Sent });
                // This is the return from the Observable function, which is the
                // request cancellation handler.
                return () => {
                    // On a cancellation, remove all registered event listeners.
                    xhr.removeEventListener('loadend', onLoadEnd);
                    xhr.removeEventListener('error', onError);
                    xhr.removeEventListener('abort', onError);
                    xhr.removeEventListener('load', onLoad);
                    xhr.removeEventListener('timeout', onError);
                    // Cancel the background macrotask.
                    macroTaskCanceller();
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
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.2+sha-4f5f496", ngImport: i0, type: HttpXhrBackend, deps: [{ token: i1.XhrFactory }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.1.0-next.2+sha-4f5f496", ngImport: i0, type: HttpXhrBackend }); }
}
export { HttpXhrBackend };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.2+sha-4f5f496", ngImport: i0, type: HttpXhrBackend, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.XhrFactory }]; } });
/**
 * A method that creates a background macrotask using Zone.js.
 *
 * This is so that Zone.js can intercept HTTP calls, this is important for server rendering,
 * as the application is only rendered once the application is stabilized, meaning there are pending
 * macro and micro tasks.
 *
 * @returns a callback method to cancel the macrotask.
 */
function createBackgroundMacroTask() {
    // We use Zone.js when it's defined as otherwise a `setTimeout` will leave open timers which
    // causes `fakeAsync` tests to fail.
    const noop = () => { };
    if (typeof Zone !== 'undefined') {
        const zoneCurrent = Zone.current;
        const task = zoneCurrent.scheduleMacroTask('httpMacroTask', noop, undefined, noop, noop);
        return () => zoneCurrent.cancelTask(task);
    }
    return noop;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFDLFVBQVUsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFZLEVBQUUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFJekMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBc0IsWUFBWSxFQUEwQyxNQUFNLFlBQVksQ0FBQzs7O0FBR2pNLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQztBQUVuQzs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxHQUFRO0lBQzlCLElBQUksYUFBYSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFO1FBQzNDLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQztLQUN4QjtJQUNELElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEVBQUU7UUFDeEQsT0FBTyxHQUFHLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDL0M7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUNhLGNBQWM7SUFDekIsWUFBb0IsVUFBc0I7UUFBdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUFHLENBQUM7SUFFOUM7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxHQUFx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LElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7SUFDdEIsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7UUFDL0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpGLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1hockZhY3Rvcnl9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdGFibGUsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb20sIE9ic2VydmFibGUsIE9ic2VydmVyLCBvZn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N3aXRjaE1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCwgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cEhlYWRlclJlc3BvbnNlLCBIdHRwSnNvblBhcnNlRXJyb3IsIEh0dHBSZXNwb25zZSwgSHR0cFN0YXR1c0NvZGUsIEh0dHBVcGxvYWRQcm9ncmVzc0V2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogWE1MSHR0cFJlcXVlc3QucmVzcG9uc2VVUkwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybCh4aHI6IGFueSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyICYmIHhoci5yZXNwb25zZVVSTCkge1xuICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkw7XG4gIH1cbiAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogVXNlcyBgWE1MSHR0cFJlcXVlc3RgIHRvIHNlbmQgcmVxdWVzdHMgdG8gYSBiYWNrZW5kIHNlcnZlci5cbiAqIEBzZWUge0BsaW5rIEh0dHBIYW5kbGVyfVxuICogQHNlZSB7QGxpbmsgSnNvbnBDbGllbnRCYWNrZW5kfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBYaHJCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHhockZhY3Rvcnk6IFhockZhY3RvcnkpIHt9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyBhIHJlcXVlc3QgYW5kIHJldHVybnMgYSBzdHJlYW0gb2YgcmVzcG9uc2UgZXZlbnRzLlxuICAgKiBAcGFyYW0gcmVxIFRoZSByZXF1ZXN0IG9iamVjdC5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgcmVzcG9uc2UgZXZlbnRzLlxuICAgKi9cbiAgaGFuZGxlKHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBRdWljayBjaGVjayB0byBnaXZlIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2Ugd2hlbiBhIHVzZXIgYXR0ZW1wdHMgdG8gdXNlXG4gICAgLy8gSHR0cENsaWVudC5qc29ucCgpIHdpdGhvdXQgaW5zdGFsbGluZyB0aGUgSHR0cENsaWVudEpzb25wTW9kdWxlXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX0pTT05QX01PRFVMRSxcbiAgICAgICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgICAgICAgICBgQ2Fubm90IG1ha2UgYSBKU09OUCByZXF1ZXN0IHdpdGhvdXQgSlNPTlAgc3VwcG9ydC4gVG8gZml4IHRoZSBwcm9ibGVtLCBlaXRoZXIgYWRkIHRoZSBcXGB3aXRoSnNvbnBTdXBwb3J0KClcXGAgY2FsbCAoaWYgXFxgcHJvdmlkZUh0dHBDbGllbnQoKVxcYCBpcyB1c2VkKSBvciBpbXBvcnQgdGhlIFxcYEh0dHBDbGllbnRKc29ucE1vZHVsZVxcYCBpbiB0aGUgcm9vdCBOZ01vZHVsZS5gKTtcbiAgICB9XG5cbiAgICAvLyBTY2hlZHVsZSBhIG1hY3JvdGFzay4gVGhpcyB3aWxsIGNhdXNlIE5nWm9uZS5pc1N0YWJsZSB0byBiZSBzZXQgdG8gZmFsc2UsXG4gICAgLy8gV2hpY2ggZGVsYXlzIHNlcnZlciByZW5kZXJpbmcgdW50aWwgdGhlIHJlcXVlc3QgaXMgY29tcGxldGVkLlxuICAgIGNvbnN0IG1hY3JvVGFza0NhbmNlbGxlciA9IGNyZWF0ZUJhY2tncm91bmRNYWNyb1Rhc2soKTtcblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhpcyBmYWN0b3J5IGhhcyBhIHNwZWNpYWwgZnVuY3Rpb24gdG8gbG9hZCBhbiBYSFIgaW1wbGVtZW50YXRpb25cbiAgICAvLyBmb3IgdmFyaW91cyBub24tYnJvd3NlciBlbnZpcm9ubWVudHMuIFdlIGN1cnJlbnRseSBsaW1pdCBpdCB0byBvbmx5IGBTZXJ2ZXJYaHJgXG4gICAgLy8gY2xhc3MsIHdoaWNoIG5lZWRzIHRvIGxvYWQgYW4gWEhSIGltcGxlbWVudGF0aW9uLlxuICAgIGNvbnN0IHhockZhY3Rvcnk6IFhockZhY3Rvcnkme8m1bG9hZEltcGw/OiAoKSA9PiBQcm9taXNlPHZvaWQ+fSA9IHRoaXMueGhyRmFjdG9yeTtcbiAgICBjb25zdCBzb3VyY2U6IE9ic2VydmFibGU8dm9pZHxudWxsPiA9XG4gICAgICAgIHhockZhY3RvcnkuybVsb2FkSW1wbCA/IGZyb20oeGhyRmFjdG9yeS7JtWxvYWRJbXBsKCkpIDogb2YobnVsbCk7XG5cbiAgICByZXR1cm4gc291cmNlLnBpcGUoXG4gICAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XG4gICAgICAgICAgLy8gRXZlcnl0aGluZyBoYXBwZW5zIG9uIE9ic2VydmFibGUgc3Vic2NyaXB0aW9uLlxuICAgICAgICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgICAgICAgLy8gU3RhcnQgYnkgc2V0dGluZyB1cCB0aGUgWEhSIG9iamVjdCB3aXRoIHJlcXVlc3QgbWV0aG9kLCBVUkwsIGFuZCB3aXRoQ3JlZGVudGlhbHNcbiAgICAgICAgICAgIC8vIGZsYWcuXG4gICAgICAgICAgICBjb25zdCB4aHIgPSB4aHJGYWN0b3J5LmJ1aWxkKCk7XG4gICAgICAgICAgICB4aHIub3BlbihyZXEubWV0aG9kLCByZXEudXJsV2l0aFBhcmFtcyk7XG4gICAgICAgICAgICBpZiAocmVxLndpdGhDcmVkZW50aWFscykge1xuICAgICAgICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGFsbCB0aGUgcmVxdWVzdGVkIGhlYWRlcnMuXG4gICAgICAgICAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgICAgICAgICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgICAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xuICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgICAgICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgICAgICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgICAgICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBkZXRlY3RlZFR5cGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2VUeXBlIGlmIG9uZSB3YXMgcmVxdWVzdGVkLlxuICAgICAgICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VUeXBlID0gcmVxLnJlc3BvbnNlVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgIC8vIEpTT04gcmVzcG9uc2VzIG5lZWQgdG8gYmUgcHJvY2Vzc2VkIGFzIHRleHQuIFRoaXMgaXMgYmVjYXVzZSBpZiB0aGUgc2VydmVyXG4gICAgICAgICAgICAgIC8vIHJldHVybnMgYW4gWFNTSS1wcmVmaXhlZCBKU09OIHJlc3BvbnNlLCB0aGUgYnJvd3NlciB3aWxsIGZhaWwgdG8gcGFyc2UgaXQsXG4gICAgICAgICAgICAgIC8vIHhoci5yZXNwb25zZSB3aWxsIGJlIG51bGwsIGFuZCB4aHIucmVzcG9uc2VUZXh0IGNhbm5vdCBiZSBhY2Nlc3NlZCB0b1xuICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgcHJlZml4ZWQgSlNPTiBkYXRhIGluIG9yZGVyIHRvIHN0cmlwIHRoZSBwcmVmaXguIFRodXMsIGFsbCBKU09OXG4gICAgICAgICAgICAgIC8vIGlzIHBhcnNlZCBieSBmaXJzdCByZXF1ZXN0aW5nIHRleHQgYW5kIHRoZW4gYXBwbHlpbmcgSlNPTi5wYXJzZS5cbiAgICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICgocmVzcG9uc2VUeXBlICE9PSAnanNvbicpID8gcmVzcG9uc2VUeXBlIDogJ3RleHQnKSBhcyBhbnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlcmlhbGl6ZSB0aGUgcmVxdWVzdCBib2R5IGlmIG9uZSBpcyBwcmVzZW50LiBJZiBub3QsIHRoaXMgd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAgICAgICAgICAgIGNvbnN0IHJlcUJvZHkgPSByZXEuc2VyaWFsaXplQm9keSgpO1xuXG4gICAgICAgICAgICAvLyBJZiBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQsIHJlc3BvbnNlIGhlYWRlcnMgd2lsbCBiZSBkZWxpdmVyZWRcbiAgICAgICAgICAgIC8vIGluIHR3byBldmVudHMgLSB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGV2ZW50IGFuZCB0aGUgZnVsbCBIdHRwUmVzcG9uc2VcbiAgICAgICAgICAgIC8vIGV2ZW50LiBIb3dldmVyLCBzaW5jZSByZXNwb25zZSBoZWFkZXJzIGRvbid0IGNoYW5nZSBpbiBiZXR3ZWVuIHRoZXNlXG4gICAgICAgICAgICAvLyB0d28gZXZlbnRzLCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gcGFyc2UgdGhlbSB0d2ljZS4gU28gaGVhZGVyUmVzcG9uc2VcbiAgICAgICAgICAgIC8vIGNhY2hlcyB0aGUgZGF0YSBleHRyYWN0ZWQgZnJvbSB0aGUgcmVzcG9uc2Ugd2hlbmV2ZXIgaXQncyBmaXJzdCBwYXJzZWQsXG4gICAgICAgICAgICAvLyB0byBlbnN1cmUgcGFyc2luZyBpc24ndCBkdXBsaWNhdGVkLlxuICAgICAgICAgICAgbGV0IGhlYWRlclJlc3BvbnNlOiBIdHRwSGVhZGVyUmVzcG9uc2V8bnVsbCA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIHBhcnRpYWxGcm9tWGhyIGV4dHJhY3RzIHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgZnJvbSB0aGUgY3VycmVudCBYTUxIdHRwUmVxdWVzdFxuICAgICAgICAgICAgLy8gc3RhdGUsIGFuZCBtZW1vaXplcyBpdCBpbnRvIGhlYWRlclJlc3BvbnNlLlxuICAgICAgICAgICAgY29uc3QgcGFydGlhbEZyb21YaHIgPSAoKTogSHR0cEhlYWRlclJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgaWYgKGhlYWRlclJlc3BvbnNlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0IHx8ICdPSyc7XG5cbiAgICAgICAgICAgICAgLy8gUGFyc2UgaGVhZGVycyBmcm9tIFhNTEh0dHBSZXF1ZXN0IC0gdGhpcyBzdGVwIGlzIGxhenkuXG4gICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcblxuICAgICAgICAgICAgICAvLyBSZWFkIHRoZSByZXNwb25zZSBVUkwgZnJvbSB0aGUgWE1MSHR0cFJlc3BvbnNlIGluc3RhbmNlIGFuZCBmYWxsIGJhY2sgb24gdGhlXG4gICAgICAgICAgICAgIC8vIHJlcXVlc3QgVVJMLlxuICAgICAgICAgICAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybCh4aHIpIHx8IHJlcS51cmw7XG5cbiAgICAgICAgICAgICAgLy8gQ29uc3RydWN0IHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgYW5kIG1lbW9pemUgaXQuXG4gICAgICAgICAgICAgIGhlYWRlclJlc3BvbnNlID1cbiAgICAgICAgICAgICAgICAgIG5ldyBIdHRwSGVhZGVyUmVzcG9uc2Uoe2hlYWRlcnMsIHN0YXR1czogeGhyLnN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSk7XG4gICAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIE5leHQsIGEgZmV3IGNsb3N1cmVzIGFyZSBkZWZpbmVkIGZvciB0aGUgdmFyaW91cyBldmVudHMgd2hpY2ggWE1MSHR0cFJlcXVlc3QgY2FuXG4gICAgICAgICAgICAvLyBlbWl0LiBUaGlzIGFsbG93cyB0aGVtIHRvIGJlIHVucmVnaXN0ZXJlZCBhcyBldmVudCBsaXN0ZW5lcnMgbGF0ZXIuXG5cbiAgICAgICAgICAgIC8vIEZpcnN0IHVwIGlzIHRoZSBsb2FkIGV2ZW50LCB3aGljaCByZXByZXNlbnRzIGEgcmVzcG9uc2UgYmVpbmcgZnVsbHkgYXZhaWxhYmxlLlxuICAgICAgICAgICAgY29uc3Qgb25Mb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBSZWFkIHJlc3BvbnNlIHN0YXRlIGZyb20gdGhlIG1lbW9pemVkIHBhcnRpYWwgZGF0YS5cbiAgICAgICAgICAgICAgbGV0IHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0gPSBwYXJ0aWFsRnJvbVhocigpO1xuXG4gICAgICAgICAgICAgIC8vIFRoZSBib2R5IHdpbGwgYmUgcmVhZCBvdXQgaWYgcHJlc2VudC5cbiAgICAgICAgICAgICAgbGV0IGJvZHk6IGFueXxudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICBpZiAoc3RhdHVzICE9PSBIdHRwU3RhdHVzQ29kZS5Ob0NvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBVc2UgWE1MSHR0cFJlcXVlc3QucmVzcG9uc2UgaWYgc2V0LCByZXNwb25zZVRleHQgb3RoZXJ3aXNlLlxuICAgICAgICAgICAgICAgIGJvZHkgPSAodHlwZW9mIHhoci5yZXNwb25zZSA9PT0gJ3VuZGVmaW5lZCcpID8geGhyLnJlc3BvbnNlVGV4dCA6IHhoci5yZXNwb25zZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIE5vcm1hbGl6ZSBhbm90aGVyIHBvdGVudGlhbCBidWcgKHRoaXMgb25lIGNvbWVzIGZyb20gQ09SUykuXG4gICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAhIWJvZHkgPyBIdHRwU3RhdHVzQ29kZS5PayA6IDA7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgICAgICAgICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAgICAgICAgICAgLy8gYnV0IGEgc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZSBjYW4gc3RpbGwgcmVzdWx0IGluIGFuIGVycm9yIGlmIHRoZSB1c2VyXG4gICAgICAgICAgICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICAgICAgICAgICAgbGV0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgYm9keSBuZWVkcyB0byBiZSBwYXJzZWQgYXMgSlNPTiAoaW4gbWFueSBjYXNlcyB0aGUgYnJvd3NlclxuICAgICAgICAgICAgICAvLyB3aWxsIGhhdmUgZG9uZSB0aGF0IGFscmVhZHkpLlxuICAgICAgICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nICYmIHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIGJvZHksIGJlZm9yZSBhdHRlbXB0aW5nIFhTU0kgcHJlZml4IHN0cmlwcGluZy5cbiAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbEJvZHkgPSBib2R5O1xuICAgICAgICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgLy8gQXR0ZW1wdCB0aGUgcGFyc2UuIElmIGl0IGZhaWxzLCBhIHBhcnNlIGVycm9yIHNob3VsZCBiZSBkZWxpdmVyZWQgdG8gdGhlXG4gICAgICAgICAgICAgICAgICAvLyB1c2VyLlxuICAgICAgICAgICAgICAgICAgYm9keSA9IGJvZHkgIT09ICcnID8gSlNPTi5wYXJzZShib2R5KSA6IG51bGw7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBKU09OLnBhcnNlIGZhaWxlZCwgaXQncyByZWFzb25hYmxlIHRvIGFzc3VtZSB0aGlzIG1pZ2h0IG5vdCBoYXZlXG4gICAgICAgICAgICAgICAgICAvLyBiZWVuIGEgSlNPTiByZXNwb25zZS4gUmVzdG9yZSB0aGUgb3JpZ2luYWwgYm9keSAoaW5jbHVkaW5nIGFueSBYU1NJIHByZWZpeClcbiAgICAgICAgICAgICAgICAgIC8vIHRvIGRlbGl2ZXIgYSBiZXR0ZXIgZXJyb3IgcmVzcG9uc2UuXG4gICAgICAgICAgICAgICAgICBib2R5ID0gb3JpZ2luYWxCb2R5O1xuXG4gICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIHdhcyBhbiBlcnJvciByZXF1ZXN0IHRvIGJlZ2luIHdpdGgsIGxlYXZlIGl0IGFzIGEgc3RyaW5nLCBpdFxuICAgICAgICAgICAgICAgICAgLy8gcHJvYmFibHkganVzdCBpc24ndCBKU09OLiBPdGhlcndpc2UsIGRlbGl2ZXIgdGhlIHBhcnNpbmcgZXJyb3IgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRXZlbiB0aG91Z2ggdGhlIHJlc3BvbnNlIHN0YXR1cyB3YXMgMnh4LCB0aGlzIGlzIHN0aWxsIGFuIGVycm9yLlxuICAgICAgICAgICAgICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcGFyc2UgZXJyb3IgY29udGFpbnMgdGhlIHRleHQgb2YgdGhlIGJvZHkgdGhhdCBmYWlsZWQgdG8gcGFyc2UuXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSB7ZXJyb3IsIHRleHQ6IGJvZHl9IGFzIEh0dHBKc29uUGFyc2VFcnJvcjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgICAvLyBBIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgaXMgZGVsaXZlcmVkIG9uIHRoZSBldmVudCBzdHJlYW0uXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGZ1bGwgYm9keSBoYXMgYmVlbiByZWNlaXZlZCBhbmQgZGVsaXZlcmVkLCBubyBmdXJ0aGVyIGV2ZW50c1xuICAgICAgICAgICAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQW4gdW5zdWNjZXNzZnVsIHJlcXVlc3QgaXMgZGVsaXZlcmVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgZXJyb3IgaW4gdGhpcyBjYXNlIGlzIHRoZSByZXNwb25zZSBib2R5IChlcnJvciBmcm9tIHRoZSBzZXJ2ZXIpLlxuICAgICAgICAgICAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFRoZSBvbkVycm9yIGNhbGxiYWNrIGlzIGNhbGxlZCB3aGVuIHNvbWV0aGluZyBnb2VzIHdyb25nIGF0IHRoZSBuZXR3b3JrIGxldmVsLlxuICAgICAgICAgICAgLy8gQ29ubmVjdGlvbiB0aW1lb3V0LCBETlMgZXJyb3IsIG9mZmxpbmUsIGV0Yy4gVGhlc2UgYXJlIGFjdHVhbCBlcnJvcnMsIGFuZCBhcmVcbiAgICAgICAgICAgIC8vIHRyYW5zbWl0dGVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgICAgICAgY29uc3Qgb25FcnJvciA9IChlcnJvcjogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB7dXJsfSA9IHBhcnRpYWxGcm9tWGhyKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHJlcyA9IG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzIHx8IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQgfHwgJ1Vua25vd24gRXJyb3InLFxuICAgICAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IocmVzKTtcblxuICAgICAgICAgICAgICAvLyBDYW5jZWwgdGhlIGJhY2tncm91bmQgbWFjcm90YXNrLlxuICAgICAgICAgICAgICBtYWNyb1Rhc2tDYW5jZWxsZXIoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFRoZSBzZW50SGVhZGVycyBmbGFnIHRyYWNrcyB3aGV0aGVyIHRoZSBIdHRwUmVzcG9uc2VIZWFkZXJzIGV2ZW50XG4gICAgICAgICAgICAvLyBoYXMgYmVlbiBzZW50IG9uIHRoZSBzdHJlYW0uIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHRyYWNrIGlmIHByb2dyZXNzXG4gICAgICAgICAgICAvLyBpcyBlbmFibGVkIHNpbmNlIHRoZSBldmVudCB3aWxsIGJlIHNlbnQgb24gb25seSB0aGUgZmlyc3QgZG93bmxvYWRcbiAgICAgICAgICAgIC8vIHByb2dyZXNzIGV2ZW50LlxuICAgICAgICAgICAgbGV0IHNlbnRIZWFkZXJzID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIFRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgICAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgICAgICAgIGNvbnN0IG9uRG93blByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIC8vIFNlbmQgdGhlIEh0dHBSZXNwb25zZUhlYWRlcnMgZXZlbnQgaWYgaXQgaGFzbid0IGJlZW4gc2VudCBhbHJlYWR5LlxuICAgICAgICAgICAgICBpZiAoIXNlbnRIZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChwYXJ0aWFsRnJvbVhocigpKTtcbiAgICAgICAgICAgICAgICBzZW50SGVhZGVycyA9IHRydWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBTdGFydCBidWlsZGluZyB0aGUgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgdG8gZGVsaXZlciBvbiB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgLy8gZXZlbnQgc3RyZWFtLlxuICAgICAgICAgICAgICBsZXQgcHJvZ3Jlc3NFdmVudDogSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgLy8gU2V0IHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgaW4gdGhlIGV2ZW50IGlmIGl0J3MgYXZhaWxhYmxlLlxuICAgICAgICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzRXZlbnQudG90YWwgPSBldmVudC50b3RhbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBmb3IgdGV4dCBjb250ZW50IGFuZCBhIHBhcnRpYWwgcmVzcG9uc2UgaXNcbiAgICAgICAgICAgICAgLy8gYXZhaWxhYmxlIG9uIFhNTEh0dHBSZXF1ZXN0LCBpbmNsdWRlIGl0IGluIHRoZSBwcm9ncmVzcyBldmVudFxuICAgICAgICAgICAgICAvLyB0byBhbGxvdyBmb3Igc3RyZWFtaW5nIHJlYWRzLlxuICAgICAgICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnICYmICEheGhyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzRXZlbnQucGFydGlhbFRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gRmluYWxseSwgZmlyZSB0aGUgZXZlbnQuXG4gICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBUaGUgdXBsb2FkIHByb2dyZXNzIGV2ZW50IGhhbmRsZXIsIHdoaWNoIGlzIG9ubHkgcmVnaXN0ZXJlZCBpZlxuICAgICAgICAgICAgLy8gcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLlxuICAgICAgICAgICAgY29uc3Qgb25VcFByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBldmVudHMgYXJlIHNpbXBsZXIuIEJlZ2luIGJ1aWxkaW5nIHRoZSBwcm9ncmVzc1xuICAgICAgICAgICAgICAvLyBldmVudC5cbiAgICAgICAgICAgICAgbGV0IHByb2dyZXNzOiBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzLFxuICAgICAgICAgICAgICAgIGxvYWRlZDogZXZlbnQubG9hZGVkLFxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIC8vIElmIHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgYmVpbmcgdXBsb2FkZWQgaXMgYXZhaWxhYmxlLCBpbmNsdWRlXG4gICAgICAgICAgICAgIC8vIGl0LlxuICAgICAgICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzLnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBTZW5kIHRoZSBldmVudC5cbiAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChwcm9ncmVzcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCByZWdpc3RlciBmb3IgbG9hZCBhbmQgZXJyb3IgZXZlbnRzLlxuICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigndGltZW91dCcsIG9uRXJyb3IpO1xuICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25FcnJvcik7XG5cbiAgICAgICAgICAgIC8vIFByb2dyZXNzIGV2ZW50cyBhcmUgb25seSBlbmFibGVkIGlmIHJlcXVlc3RlZC5cbiAgICAgICAgICAgIGlmIChyZXEucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgLy8gRG93bmxvYWQgcHJvZ3Jlc3MgaXMgYWx3YXlzIGVuYWJsZWQgaWYgcmVxdWVzdGVkLlxuICAgICAgICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvbkRvd25Qcm9ncmVzcyk7XG5cbiAgICAgICAgICAgICAgLy8gVXBsb2FkIHByb2dyZXNzIGRlcGVuZHMgb24gd2hldGhlciB0aGVyZSBpcyBhIGJvZHkgdG8gdXBsb2FkLlxuICAgICAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uVXBQcm9ncmVzcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqIFRlYXIgZG93biBsb2dpYyB0byBjYW5jZWwgdGhlIGJhY2tyb3VuZCBtYWNyb3Rhc2suICovXG4gICAgICAgICAgICBjb25zdCBvbkxvYWRFbmQgPSAoKSA9PiBtYWNyb1Rhc2tDYW5jZWxsZXIoKTtcblxuICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlbmQnLCBvbkxvYWRFbmQpO1xuXG4gICAgICAgICAgICAvLyBGaXJlIHRoZSByZXF1ZXN0LCBhbmQgbm90aWZ5IHRoZSBldmVudCBzdHJlYW0gdGhhdCBpdCB3YXMgZmlyZWQuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB4aHIuc2VuZChyZXFCb2R5ISk7XG4gICAgICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICAgICAgb25FcnJvcihlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSByZXR1cm4gZnJvbSB0aGUgT2JzZXJ2YWJsZSBmdW5jdGlvbiwgd2hpY2ggaXMgdGhlXG4gICAgICAgICAgICAvLyByZXF1ZXN0IGNhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gT24gYSBjYW5jZWxsYXRpb24sIHJlbW92ZSBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkZW5kJywgb25Mb2FkRW5kKTtcbiAgICAgICAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uRXJyb3IpO1xuICAgICAgICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCd0aW1lb3V0Jywgb25FcnJvcik7XG5cbiAgICAgICAgICAgICAgLy8gQ2FuY2VsIHRoZSBiYWNrZ3JvdW5kIG1hY3JvdGFzay5cbiAgICAgICAgICAgICAgbWFjcm9UYXNrQ2FuY2VsbGVyKCk7XG5cbiAgICAgICAgICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uRG93blByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICAgICAgICB4aHIudXBsb2FkLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25VcFByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBGaW5hbGx5LCBhYm9ydCB0aGUgaW4tZmxpZ2h0IHJlcXVlc3QuXG4gICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSAhPT0geGhyLkRPTkUpIHtcbiAgICAgICAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSksXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbWV0aG9kIHRoYXQgY3JlYXRlcyBhIGJhY2tncm91bmQgbWFjcm90YXNrIHVzaW5nIFpvbmUuanMuXG4gKlxuICogVGhpcyBpcyBzbyB0aGF0IFpvbmUuanMgY2FuIGludGVyY2VwdCBIVFRQIGNhbGxzLCB0aGlzIGlzIGltcG9ydGFudCBmb3Igc2VydmVyIHJlbmRlcmluZyxcbiAqIGFzIHRoZSBhcHBsaWNhdGlvbiBpcyBvbmx5IHJlbmRlcmVkIG9uY2UgdGhlIGFwcGxpY2F0aW9uIGlzIHN0YWJpbGl6ZWQsIG1lYW5pbmcgdGhlcmUgYXJlIHBlbmRpbmdcbiAqIG1hY3JvIGFuZCBtaWNybyB0YXNrcy5cbiAqXG4gKiBAcmV0dXJucyBhIGNhbGxiYWNrIG1ldGhvZCB0byBjYW5jZWwgdGhlIG1hY3JvdGFzay5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFja2dyb3VuZE1hY3JvVGFzaygpOiBWb2lkRnVuY3Rpb24ge1xuICAvLyBXZSB1c2UgWm9uZS5qcyB3aGVuIGl0J3MgZGVmaW5lZCBhcyBvdGhlcndpc2UgYSBgc2V0VGltZW91dGAgd2lsbCBsZWF2ZSBvcGVuIHRpbWVycyB3aGljaFxuICAvLyBjYXVzZXMgYGZha2VBc3luY2AgdGVzdHMgdG8gZmFpbC5cbiAgY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuICBpZiAodHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29uc3Qgem9uZUN1cnJlbnQgPSBab25lLmN1cnJlbnQ7XG4gICAgY29uc3QgdGFzayA9IHpvbmVDdXJyZW50LnNjaGVkdWxlTWFjcm9UYXNrKCdodHRwTWFjcm9UYXNrJywgbm9vcCwgdW5kZWZpbmVkLCBub29wLCBub29wKTtcblxuICAgIHJldHVybiAoKSA9PiB6b25lQ3VycmVudC5jYW5jZWxUYXNrKHRhc2spO1xuICB9XG5cbiAgcmV0dXJuIG5vb3A7XG59XG4iXX0=