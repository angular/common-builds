/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { XhrFactory } from '@angular/common';
import { Injectable, ɵRuntimeError as RuntimeError } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpHeaders } from './headers';
import { HTTP_STATUS_CODE_NO_CONTENT, HTTP_STATUS_CODE_OK, HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse, } from './response';
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
            throw new RuntimeError(-2800 /* RuntimeErrorCode.MISSING_JSONP_MODULE */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                `Cannot make a JSONP request without JSONP support. To fix the problem, either add the \`withJsonpSupport()\` call (if \`provideHttpClient()\` is used) or import the \`HttpClientJsonpModule\` in the root NgModule.`);
        }
        // Check whether this factory has a special function to load an XHR implementation
        // for various non-browser environments. We currently limit it to only `ServerXhr`
        // class, which needs to load an XHR implementation.
        const xhrFactory = this.xhrFactory;
        const source = xhrFactory.ɵloadImpl
            ? from(xhrFactory.ɵloadImpl())
            : of(null);
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
                    xhr.responseType = (responseType !== 'json' ? responseType : 'text');
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
                    headerResponse = new HttpHeaderResponse({ headers, status: xhr.status, statusText, url });
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
                    if (status !== HTTP_STATUS_CODE_NO_CONTENT) {
                        // Use XMLHttpRequest.response if set, responseText otherwise.
                        body = typeof xhr.response === 'undefined' ? xhr.responseText : xhr.response;
                    }
                    // Normalize another potential bug (this one comes from CORS).
                    if (status === 0) {
                        status = !!body ? HTTP_STATUS_CODE_OK : 0;
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
                // Fire the request, and notify the event stream that it was fired.
                xhr.send(reqBody);
                observer.next({ type: HttpEventType.Sent });
                // This is the return from the Observable function, which is the
                // request cancellation handler.
                return () => {
                    // On a cancellation, remove all registered event listeners.
                    xhr.removeEventListener('error', onError);
                    xhr.removeEventListener('abort', onError);
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
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14+sha-98db109", ngImport: i0, type: HttpXhrBackend, deps: [{ token: i1.XhrFactory }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.14+sha-98db109", ngImport: i0, type: HttpXhrBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14+sha-98db109", ngImport: i0, type: HttpXhrBackend, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.XhrFactory }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFDLFVBQVUsRUFBRSxhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFZLEVBQUUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFJekMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQ0wsMkJBQTJCLEVBQzNCLG1CQUFtQixFQUVuQixpQkFBaUIsRUFFakIsYUFBYSxFQUNiLGtCQUFrQixFQUVsQixZQUFZLEdBRWIsTUFBTSxZQUFZLENBQUM7OztBQUVwQixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsR0FBUTtJQUM5QixJQUFJLGFBQWEsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQztJQUN6QixDQUFDO0lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pELE9BQU8sR0FBRyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sY0FBYztJQUN6QixZQUFvQixVQUFzQjtRQUF0QixlQUFVLEdBQVYsVUFB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LE9BQU8sR0FBRyxFQUFFO29CQUNWLDREQUE0RDtvQkFDNUQsR0FBRyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDMUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDMUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDeEMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFFNUMsSUFBSSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ3ZCLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7d0JBQ3BELElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ25DLEdBQUcsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO3dCQUMzRCxDQUFDO29CQUNILENBQUM7b0JBRUQsd0NBQXdDO29CQUN4QyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNoQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2QsQ0FBQztnQkFDSCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO3lIQTNTVSxjQUFjOzZIQUFkLGNBQWM7O3NHQUFkLGNBQWM7a0JBRDFCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7WGhyRmFjdG9yeX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbSwgT2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIG9mfSBmcm9tICdyeGpzJztcbmltcG9ydCB7c3dpdGNoTWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtcbiAgSFRUUF9TVEFUVVNfQ09ERV9OT19DT05URU5ULFxuICBIVFRQX1NUQVRVU19DT0RFX09LLFxuICBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50LFxuICBIdHRwRXJyb3JSZXNwb25zZSxcbiAgSHR0cEV2ZW50LFxuICBIdHRwRXZlbnRUeXBlLFxuICBIdHRwSGVhZGVyUmVzcG9uc2UsXG4gIEh0dHBKc29uUGFyc2VFcnJvcixcbiAgSHR0cFJlc3BvbnNlLFxuICBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudCxcbn0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmNvbnN0IFhTU0lfUFJFRklYID0gL15cXClcXF1cXH0nLD9cXG4vO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiBYTUxIdHRwUmVxdWVzdC5yZXNwb25zZVVSTCBvciB0aGUgWC1SZXF1ZXN0LVVSTCBoZWFkZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlVXJsKHhocjogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICgncmVzcG9uc2VVUkwnIGluIHhociAmJiB4aHIucmVzcG9uc2VVUkwpIHtcbiAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMO1xuICB9XG4gIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFVzZXMgYFhNTEh0dHBSZXF1ZXN0YCB0byBzZW5kIHJlcXVlc3RzIHRvIGEgYmFja2VuZCBzZXJ2ZXIuXG4gKiBAc2VlIHtAbGluayBIdHRwSGFuZGxlcn1cbiAqIEBzZWUge0BsaW5rIEpzb25wQ2xpZW50QmFja2VuZH1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwWGhyQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB4aHJGYWN0b3J5OiBYaHJGYWN0b3J5KSB7fVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgYSByZXF1ZXN0IGFuZCByZXR1cm5zIGEgc3RyZWFtIG9mIHJlc3BvbnNlIGV2ZW50cy5cbiAgICogQHBhcmFtIHJlcSBUaGUgcmVxdWVzdCBvYmplY3QuXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIHJlc3BvbnNlIGV2ZW50cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gUXVpY2sgY2hlY2sgdG8gZ2l2ZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHdoZW4gYSB1c2VyIGF0dGVtcHRzIHRvIHVzZVxuICAgIC8vIEh0dHBDbGllbnQuanNvbnAoKSB3aXRob3V0IGluc3RhbGxpbmcgdGhlIEh0dHBDbGllbnRKc29ucE1vZHVsZVxuICAgIGlmIChyZXEubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfSlNPTlBfTU9EVUxFLFxuICAgICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgICAgIGBDYW5ub3QgbWFrZSBhIEpTT05QIHJlcXVlc3Qgd2l0aG91dCBKU09OUCBzdXBwb3J0LiBUbyBmaXggdGhlIHByb2JsZW0sIGVpdGhlciBhZGQgdGhlIFxcYHdpdGhKc29ucFN1cHBvcnQoKVxcYCBjYWxsIChpZiBcXGBwcm92aWRlSHR0cENsaWVudCgpXFxgIGlzIHVzZWQpIG9yIGltcG9ydCB0aGUgXFxgSHR0cENsaWVudEpzb25wTW9kdWxlXFxgIGluIHRoZSByb290IE5nTW9kdWxlLmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhpcyBmYWN0b3J5IGhhcyBhIHNwZWNpYWwgZnVuY3Rpb24gdG8gbG9hZCBhbiBYSFIgaW1wbGVtZW50YXRpb25cbiAgICAvLyBmb3IgdmFyaW91cyBub24tYnJvd3NlciBlbnZpcm9ubWVudHMuIFdlIGN1cnJlbnRseSBsaW1pdCBpdCB0byBvbmx5IGBTZXJ2ZXJYaHJgXG4gICAgLy8gY2xhc3MsIHdoaWNoIG5lZWRzIHRvIGxvYWQgYW4gWEhSIGltcGxlbWVudGF0aW9uLlxuICAgIGNvbnN0IHhockZhY3Rvcnk6IFhockZhY3RvcnkgJiB7ybVsb2FkSW1wbD86ICgpID0+IFByb21pc2U8dm9pZD59ID0gdGhpcy54aHJGYWN0b3J5O1xuICAgIGNvbnN0IHNvdXJjZTogT2JzZXJ2YWJsZTx2b2lkIHwgbnVsbD4gPSB4aHJGYWN0b3J5Lsm1bG9hZEltcGxcbiAgICAgID8gZnJvbSh4aHJGYWN0b3J5Lsm1bG9hZEltcGwoKSlcbiAgICAgIDogb2YobnVsbCk7XG5cbiAgICByZXR1cm4gc291cmNlLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4ge1xuICAgICAgICAvLyBFdmVyeXRoaW5nIGhhcHBlbnMgb24gT2JzZXJ2YWJsZSBzdWJzY3JpcHRpb24uXG4gICAgICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgICAgIC8vIFN0YXJ0IGJ5IHNldHRpbmcgdXAgdGhlIFhIUiBvYmplY3Qgd2l0aCByZXF1ZXN0IG1ldGhvZCwgVVJMLCBhbmQgd2l0aENyZWRlbnRpYWxzXG4gICAgICAgICAgLy8gZmxhZy5cbiAgICAgICAgICBjb25zdCB4aHIgPSB4aHJGYWN0b3J5LmJ1aWxkKCk7XG4gICAgICAgICAgeGhyLm9wZW4ocmVxLm1ldGhvZCwgcmVxLnVybFdpdGhQYXJhbXMpO1xuICAgICAgICAgIGlmIChyZXEud2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBZGQgYWxsIHRoZSByZXF1ZXN0ZWQgaGVhZGVycy5cbiAgICAgICAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgICAgICAgIC8vIEFkZCBhbiBBY2NlcHQgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0FjY2VwdCcpKSB7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEF1dG8tZGV0ZWN0IHRoZSBDb250ZW50LVR5cGUgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICAgICAgICBjb25zdCBkZXRlY3RlZFR5cGUgPSByZXEuZGV0ZWN0Q29udGVudFR5cGVIZWFkZXIoKTtcbiAgICAgICAgICAgIC8vIFNvbWV0aW1lcyBDb250ZW50LVR5cGUgZGV0ZWN0aW9uIGZhaWxzLlxuICAgICAgICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgZGV0ZWN0ZWRUeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTZXQgdGhlIHJlc3BvbnNlVHlwZSBpZiBvbmUgd2FzIHJlcXVlc3RlZC5cbiAgICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VUeXBlID0gcmVxLnJlc3BvbnNlVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAvLyBKU09OIHJlc3BvbnNlcyBuZWVkIHRvIGJlIHByb2Nlc3NlZCBhcyB0ZXh0LiBUaGlzIGlzIGJlY2F1c2UgaWYgdGhlIHNlcnZlclxuICAgICAgICAgICAgLy8gcmV0dXJucyBhbiBYU1NJLXByZWZpeGVkIEpTT04gcmVzcG9uc2UsIHRoZSBicm93c2VyIHdpbGwgZmFpbCB0byBwYXJzZSBpdCxcbiAgICAgICAgICAgIC8vIHhoci5yZXNwb25zZSB3aWxsIGJlIG51bGwsIGFuZCB4aHIucmVzcG9uc2VUZXh0IGNhbm5vdCBiZSBhY2Nlc3NlZCB0b1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIHByZWZpeGVkIEpTT04gZGF0YSBpbiBvcmRlciB0byBzdHJpcCB0aGUgcHJlZml4LiBUaHVzLCBhbGwgSlNPTlxuICAgICAgICAgICAgLy8gaXMgcGFyc2VkIGJ5IGZpcnN0IHJlcXVlc3RpbmcgdGV4dCBhbmQgdGhlbiBhcHBseWluZyBKU09OLnBhcnNlLlxuICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IChyZXNwb25zZVR5cGUgIT09ICdqc29uJyA/IHJlc3BvbnNlVHlwZSA6ICd0ZXh0JykgYXMgYW55O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNlcmlhbGl6ZSB0aGUgcmVxdWVzdCBib2R5IGlmIG9uZSBpcyBwcmVzZW50LiBJZiBub3QsIHRoaXMgd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAgICAgICAgICBjb25zdCByZXFCb2R5ID0gcmVxLnNlcmlhbGl6ZUJvZHkoKTtcblxuICAgICAgICAgIC8vIElmIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZCwgcmVzcG9uc2UgaGVhZGVycyB3aWxsIGJlIGRlbGl2ZXJlZFxuICAgICAgICAgIC8vIGluIHR3byBldmVudHMgLSB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGV2ZW50IGFuZCB0aGUgZnVsbCBIdHRwUmVzcG9uc2VcbiAgICAgICAgICAvLyBldmVudC4gSG93ZXZlciwgc2luY2UgcmVzcG9uc2UgaGVhZGVycyBkb24ndCBjaGFuZ2UgaW4gYmV0d2VlbiB0aGVzZVxuICAgICAgICAgIC8vIHR3byBldmVudHMsIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSB0byBwYXJzZSB0aGVtIHR3aWNlLiBTbyBoZWFkZXJSZXNwb25zZVxuICAgICAgICAgIC8vIGNhY2hlcyB0aGUgZGF0YSBleHRyYWN0ZWQgZnJvbSB0aGUgcmVzcG9uc2Ugd2hlbmV2ZXIgaXQncyBmaXJzdCBwYXJzZWQsXG4gICAgICAgICAgLy8gdG8gZW5zdXJlIHBhcnNpbmcgaXNuJ3QgZHVwbGljYXRlZC5cbiAgICAgICAgICBsZXQgaGVhZGVyUmVzcG9uc2U6IEh0dHBIZWFkZXJSZXNwb25zZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgLy8gcGFydGlhbEZyb21YaHIgZXh0cmFjdHMgdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBmcm9tIHRoZSBjdXJyZW50IFhNTEh0dHBSZXF1ZXN0XG4gICAgICAgICAgLy8gc3RhdGUsIGFuZCBtZW1vaXplcyBpdCBpbnRvIGhlYWRlclJlc3BvbnNlLlxuICAgICAgICAgIGNvbnN0IHBhcnRpYWxGcm9tWGhyID0gKCk6IEh0dHBIZWFkZXJSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAoaGVhZGVyUmVzcG9uc2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQgfHwgJ09LJztcblxuICAgICAgICAgICAgLy8gUGFyc2UgaGVhZGVycyBmcm9tIFhNTEh0dHBSZXF1ZXN0IC0gdGhpcyBzdGVwIGlzIGxhenkuXG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG5cbiAgICAgICAgICAgIC8vIFJlYWQgdGhlIHJlc3BvbnNlIFVSTCBmcm9tIHRoZSBYTUxIdHRwUmVzcG9uc2UgaW5zdGFuY2UgYW5kIGZhbGwgYmFjayBvbiB0aGVcbiAgICAgICAgICAgIC8vIHJlcXVlc3QgVVJMLlxuICAgICAgICAgICAgY29uc3QgdXJsID0gZ2V0UmVzcG9uc2VVcmwoeGhyKSB8fCByZXEudXJsO1xuXG4gICAgICAgICAgICAvLyBDb25zdHJ1Y3QgdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBhbmQgbWVtb2l6ZSBpdC5cbiAgICAgICAgICAgIGhlYWRlclJlc3BvbnNlID0gbmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7aGVhZGVycywgc3RhdHVzOiB4aHIuc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KTtcbiAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gTmV4dCwgYSBmZXcgY2xvc3VyZXMgYXJlIGRlZmluZWQgZm9yIHRoZSB2YXJpb3VzIGV2ZW50cyB3aGljaCBYTUxIdHRwUmVxdWVzdCBjYW5cbiAgICAgICAgICAvLyBlbWl0LiBUaGlzIGFsbG93cyB0aGVtIHRvIGJlIHVucmVnaXN0ZXJlZCBhcyBldmVudCBsaXN0ZW5lcnMgbGF0ZXIuXG5cbiAgICAgICAgICAvLyBGaXJzdCB1cCBpcyB0aGUgbG9hZCBldmVudCwgd2hpY2ggcmVwcmVzZW50cyBhIHJlc3BvbnNlIGJlaW5nIGZ1bGx5IGF2YWlsYWJsZS5cbiAgICAgICAgICBjb25zdCBvbkxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAvLyBSZWFkIHJlc3BvbnNlIHN0YXRlIGZyb20gdGhlIG1lbW9pemVkIHBhcnRpYWwgZGF0YS5cbiAgICAgICAgICAgIGxldCB7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9ID0gcGFydGlhbEZyb21YaHIoKTtcblxuICAgICAgICAgICAgLy8gVGhlIGJvZHkgd2lsbCBiZSByZWFkIG91dCBpZiBwcmVzZW50LlxuICAgICAgICAgICAgbGV0IGJvZHk6IGFueSB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoc3RhdHVzICE9PSBIVFRQX1NUQVRVU19DT0RFX05PX0NPTlRFTlQpIHtcbiAgICAgICAgICAgICAgLy8gVXNlIFhNTEh0dHBSZXF1ZXN0LnJlc3BvbnNlIGlmIHNldCwgcmVzcG9uc2VUZXh0IG90aGVyd2lzZS5cbiAgICAgICAgICAgICAgYm9keSA9IHR5cGVvZiB4aHIucmVzcG9uc2UgPT09ICd1bmRlZmluZWQnID8geGhyLnJlc3BvbnNlVGV4dCA6IHhoci5yZXNwb25zZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTm9ybWFsaXplIGFub3RoZXIgcG90ZW50aWFsIGJ1ZyAodGhpcyBvbmUgY29tZXMgZnJvbSBDT1JTKS5cbiAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgICAgICAgc3RhdHVzID0gISFib2R5ID8gSFRUUF9TVEFUVVNfQ09ERV9PSyA6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG9rIGRldGVybWluZXMgd2hldGhlciB0aGUgcmVzcG9uc2Ugd2lsbCBiZSB0cmFuc21pdHRlZCBvbiB0aGUgZXZlbnQgb3JcbiAgICAgICAgICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAgICAgICAgIC8vIGJ1dCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgY2FuIHN0aWxsIHJlc3VsdCBpbiBhbiBlcnJvciBpZiB0aGUgdXNlclxuICAgICAgICAgICAgLy8gYXNrZWQgZm9yIEpTT04gZGF0YSBhbmQgdGhlIGJvZHkgY2Fubm90IGJlIHBhcnNlZCBhcyBzdWNoLlxuICAgICAgICAgICAgbGV0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgbmVlZHMgdG8gYmUgcGFyc2VkIGFzIEpTT04gKGluIG1hbnkgY2FzZXMgdGhlIGJyb3dzZXJcbiAgICAgICAgICAgIC8vIHdpbGwgaGF2ZSBkb25lIHRoYXQgYWxyZWFkeSkuXG4gICAgICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nICYmIHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCBib2R5LCBiZWZvcmUgYXR0ZW1wdGluZyBYU1NJIHByZWZpeCBzdHJpcHBpbmcuXG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQm9keSA9IGJvZHk7XG4gICAgICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBBdHRlbXB0IHRoZSBwYXJzZS4gSWYgaXQgZmFpbHMsIGEgcGFyc2UgZXJyb3Igc2hvdWxkIGJlIGRlbGl2ZXJlZCB0byB0aGVcbiAgICAgICAgICAgICAgICAvLyB1c2VyLlxuICAgICAgICAgICAgICAgIGJvZHkgPSBib2R5ICE9PSAnJyA/IEpTT04ucGFyc2UoYm9keSkgOiBudWxsO1xuICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBKU09OLnBhcnNlIGZhaWxlZCwgaXQncyByZWFzb25hYmxlIHRvIGFzc3VtZSB0aGlzIG1pZ2h0IG5vdCBoYXZlXG4gICAgICAgICAgICAgICAgLy8gYmVlbiBhIEpTT04gcmVzcG9uc2UuIFJlc3RvcmUgdGhlIG9yaWdpbmFsIGJvZHkgKGluY2x1ZGluZyBhbnkgWFNTSSBwcmVmaXgpXG4gICAgICAgICAgICAgICAgLy8gdG8gZGVsaXZlciBhIGJldHRlciBlcnJvciByZXNwb25zZS5cbiAgICAgICAgICAgICAgICBib2R5ID0gb3JpZ2luYWxCb2R5O1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyB3YXMgYW4gZXJyb3IgcmVxdWVzdCB0byBiZWdpbiB3aXRoLCBsZWF2ZSBpdCBhcyBhIHN0cmluZywgaXRcbiAgICAgICAgICAgICAgICAvLyBwcm9iYWJseSBqdXN0IGlzbid0IEpTT04uIE90aGVyd2lzZSwgZGVsaXZlciB0aGUgcGFyc2luZyBlcnJvciB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgICAgIC8vIEV2ZW4gdGhvdWdoIHRoZSByZXNwb25zZSBzdGF0dXMgd2FzIDJ4eCwgdGhpcyBpcyBzdGlsbCBhbiBlcnJvci5cbiAgICAgICAgICAgICAgICAgIG9rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgcGFyc2UgZXJyb3IgY29udGFpbnMgdGhlIHRleHQgb2YgdGhlIGJvZHkgdGhhdCBmYWlsZWQgdG8gcGFyc2UuXG4gICAgICAgICAgICAgICAgICBib2R5ID0ge2Vycm9yLCB0ZXh0OiBib2R5fSBhcyBIdHRwSnNvblBhcnNlRXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvaykge1xuICAgICAgICAgICAgICAvLyBBIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgaXMgZGVsaXZlcmVkIG9uIHRoZSBldmVudCBzdHJlYW0uXG4gICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoXG4gICAgICAgICAgICAgICAgbmV3IEh0dHBSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgICAgICAgICB1cmw6IHVybCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgICAgICAgICAgLy8gYXJlIHBvc3NpYmxlLiBUaGlzIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBBbiB1bnN1Y2Nlc3NmdWwgcmVxdWVzdCBpcyBkZWxpdmVyZWQgb24gdGhlIGVycm9yIGNoYW5uZWwuXG4gICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKFxuICAgICAgICAgICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgZXJyb3IgaW4gdGhpcyBjYXNlIGlzIHRoZSByZXNwb25zZSBib2R5IChlcnJvciBmcm9tIHRoZSBzZXJ2ZXIpLlxuICAgICAgICAgICAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gVGhlIG9uRXJyb3IgY2FsbGJhY2sgaXMgY2FsbGVkIHdoZW4gc29tZXRoaW5nIGdvZXMgd3JvbmcgYXQgdGhlIG5ldHdvcmsgbGV2ZWwuXG4gICAgICAgICAgLy8gQ29ubmVjdGlvbiB0aW1lb3V0LCBETlMgZXJyb3IsIG9mZmxpbmUsIGV0Yy4gVGhlc2UgYXJlIGFjdHVhbCBlcnJvcnMsIGFuZCBhcmVcbiAgICAgICAgICAvLyB0cmFuc21pdHRlZCBvbiB0aGUgZXJyb3IgY2hhbm5lbC5cbiAgICAgICAgICBjb25zdCBvbkVycm9yID0gKGVycm9yOiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7dXJsfSA9IHBhcnRpYWxGcm9tWGhyKCk7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzIHx8IDAsXG4gICAgICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0IHx8ICdVbmtub3duIEVycm9yJyxcbiAgICAgICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYnNlcnZlci5lcnJvcihyZXMpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBUaGUgc2VudEhlYWRlcnMgZmxhZyB0cmFja3Mgd2hldGhlciB0aGUgSHR0cFJlc3BvbnNlSGVhZGVycyBldmVudFxuICAgICAgICAgIC8vIGhhcyBiZWVuIHNlbnQgb24gdGhlIHN0cmVhbS4gVGhpcyBpcyBuZWNlc3NhcnkgdG8gdHJhY2sgaWYgcHJvZ3Jlc3NcbiAgICAgICAgICAvLyBpcyBlbmFibGVkIHNpbmNlIHRoZSBldmVudCB3aWxsIGJlIHNlbnQgb24gb25seSB0aGUgZmlyc3QgZG93bmxvYWRcbiAgICAgICAgICAvLyBwcm9ncmVzcyBldmVudC5cbiAgICAgICAgICBsZXQgc2VudEhlYWRlcnMgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgICAgICAvLyBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQuXG4gICAgICAgICAgY29uc3Qgb25Eb3duUHJvZ3Jlc3MgPSAoZXZlbnQ6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIFNlbmQgdGhlIEh0dHBSZXNwb25zZUhlYWRlcnMgZXZlbnQgaWYgaXQgaGFzbid0IGJlZW4gc2VudCBhbHJlYWR5LlxuICAgICAgICAgICAgaWYgKCFzZW50SGVhZGVycykge1xuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHBhcnRpYWxGcm9tWGhyKCkpO1xuICAgICAgICAgICAgICBzZW50SGVhZGVycyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN0YXJ0IGJ1aWxkaW5nIHRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCB0byBkZWxpdmVyIG9uIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgLy8gZXZlbnQgc3RyZWFtLlxuICAgICAgICAgICAgbGV0IHByb2dyZXNzRXZlbnQ6IEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQgPSB7XG4gICAgICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcyxcbiAgICAgICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBTZXQgdGhlIHRvdGFsIG51bWJlciBvZiBieXRlcyBpbiB0aGUgZXZlbnQgaWYgaXQncyBhdmFpbGFibGUuXG4gICAgICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICBwcm9ncmVzc0V2ZW50LnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBmb3IgdGV4dCBjb250ZW50IGFuZCBhIHBhcnRpYWwgcmVzcG9uc2UgaXNcbiAgICAgICAgICAgIC8vIGF2YWlsYWJsZSBvbiBYTUxIdHRwUmVxdWVzdCwgaW5jbHVkZSBpdCBpbiB0aGUgcHJvZ3Jlc3MgZXZlbnRcbiAgICAgICAgICAgIC8vIHRvIGFsbG93IGZvciBzdHJlYW1pbmcgcmVhZHMuXG4gICAgICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnICYmICEheGhyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgICAgICBwcm9ncmVzc0V2ZW50LnBhcnRpYWxUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluYWxseSwgZmlyZSB0aGUgZXZlbnQuXG4gICAgICAgICAgICBvYnNlcnZlci5uZXh0KHByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBUaGUgdXBsb2FkIHByb2dyZXNzIGV2ZW50IGhhbmRsZXIsIHdoaWNoIGlzIG9ubHkgcmVnaXN0ZXJlZCBpZlxuICAgICAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgICAgICBjb25zdCBvblVwUHJvZ3Jlc3MgPSAoZXZlbnQ6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBldmVudHMgYXJlIHNpbXBsZXIuIEJlZ2luIGJ1aWxkaW5nIHRoZSBwcm9ncmVzc1xuICAgICAgICAgICAgLy8gZXZlbnQuXG4gICAgICAgICAgICBsZXQgcHJvZ3Jlc3M6IEh0dHBVcGxvYWRQcm9ncmVzc0V2ZW50ID0ge1xuICAgICAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzLFxuICAgICAgICAgICAgICBsb2FkZWQ6IGV2ZW50LmxvYWRlZCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgYmVpbmcgdXBsb2FkZWQgaXMgYXZhaWxhYmxlLCBpbmNsdWRlXG4gICAgICAgICAgICAvLyBpdC5cbiAgICAgICAgICAgIGlmIChldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgIHByb2dyZXNzLnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlbmQgdGhlIGV2ZW50LlxuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChwcm9ncmVzcyk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIEJ5IGRlZmF1bHQsIHJlZ2lzdGVyIGZvciBsb2FkIGFuZCBlcnJvciBldmVudHMuXG4gICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCd0aW1lb3V0Jywgb25FcnJvcik7XG4gICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25FcnJvcik7XG5cbiAgICAgICAgICAvLyBQcm9ncmVzcyBldmVudHMgYXJlIG9ubHkgZW5hYmxlZCBpZiByZXF1ZXN0ZWQuXG4gICAgICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgICAgLy8gRG93bmxvYWQgcHJvZ3Jlc3MgaXMgYWx3YXlzIGVuYWJsZWQgaWYgcmVxdWVzdGVkLlxuICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Eb3duUHJvZ3Jlc3MpO1xuXG4gICAgICAgICAgICAvLyBVcGxvYWQgcHJvZ3Jlc3MgZGVwZW5kcyBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgYm9keSB0byB1cGxvYWQuXG4gICAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblVwUHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZpcmUgdGhlIHJlcXVlc3QsIGFuZCBub3RpZnkgdGhlIGV2ZW50IHN0cmVhbSB0aGF0IGl0IHdhcyBmaXJlZC5cbiAgICAgICAgICB4aHIuc2VuZChyZXFCb2R5ISk7XG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG4gICAgICAgICAgLy8gVGhpcyBpcyB0aGUgcmV0dXJuIGZyb20gdGhlIE9ic2VydmFibGUgZnVuY3Rpb24sIHdoaWNoIGlzIHRoZVxuICAgICAgICAgIC8vIHJlcXVlc3QgY2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIC8vIE9uIGEgY2FuY2VsbGF0aW9uLCByZW1vdmUgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkVycm9yKTtcbiAgICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCd0aW1lb3V0Jywgb25FcnJvcik7XG5cbiAgICAgICAgICAgIGlmIChyZXEucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Eb3duUHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICAgICAgeGhyLnVwbG9hZC5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uVXBQcm9ncmVzcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluYWxseSwgYWJvcnQgdGhlIGluLWZsaWdodCByZXF1ZXN0LlxuICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlICE9PSB4aHIuRE9ORSkge1xuICAgICAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==