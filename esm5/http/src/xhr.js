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
import * as i0 from "@angular/core";
var XSSI_PREFIX = /^\)\]\}',?\n/;
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
var XhrFactory = /** @class */ (function () {
    function XhrFactory() {
    }
    return XhrFactory;
}());
export { XhrFactory };
/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 *
 */
var BrowserXhr = /** @class */ (function () {
    function BrowserXhr() {
    }
    BrowserXhr.prototype.build = function () { return (new XMLHttpRequest()); };
    BrowserXhr.ɵfac = function BrowserXhr_Factory(t) { return new (t || BrowserXhr)(); };
    BrowserXhr.ɵprov = i0.ɵɵdefineInjectable({ token: BrowserXhr, factory: BrowserXhr.ɵfac });
    return BrowserXhr;
}());
export { BrowserXhr };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(BrowserXhr, [{
        type: Injectable
    }], function () { return []; }, null); })();
/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see `HttpHandler`
 * @see `JsonpClientBackend`
 *
 * @publicApi
 */
var HttpXhrBackend = /** @class */ (function () {
    function HttpXhrBackend(xhrFactory) {
        this.xhrFactory = xhrFactory;
    }
    /**
     * Processes a request and returns a stream of response events.
     * @param req The request object.
     * @returns An observable of the response events.
     */
    HttpXhrBackend.prototype.handle = function (req) {
        var _this = this;
        // Quick check to give a better error message when a user attempts to use
        // HttpClient.jsonp() without installing the JsonpClientModule
        if (req.method === 'JSONP') {
            throw new Error("Attempted to construct Jsonp request without JsonpClientModule installed.");
        }
        // Everything happens on Observable subscription.
        return new Observable(function (observer) {
            // Start by setting up the XHR object with request method, URL, and withCredentials flag.
            var xhr = _this.xhrFactory.build();
            xhr.open(req.method, req.urlWithParams);
            if (!!req.withCredentials) {
                xhr.withCredentials = true;
            }
            // Add all the requested headers.
            req.headers.forEach(function (name, values) { return xhr.setRequestHeader(name, values.join(',')); });
            // Add an Accept header if one isn't present already.
            if (!req.headers.has('Accept')) {
                xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
            }
            // Auto-detect the Content-Type header if one isn't present already.
            if (!req.headers.has('Content-Type')) {
                var detectedType = req.detectContentTypeHeader();
                // Sometimes Content-Type detection fails.
                if (detectedType !== null) {
                    xhr.setRequestHeader('Content-Type', detectedType);
                }
            }
            // Set the responseType if one was requested.
            if (req.responseType) {
                var responseType = req.responseType.toLowerCase();
                // JSON responses need to be processed as text. This is because if the server
                // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
                // xhr.response will be null, and xhr.responseText cannot be accessed to
                // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
                // is parsed by first requesting text and then applying JSON.parse.
                xhr.responseType = ((responseType !== 'json') ? responseType : 'text');
            }
            // Serialize the request body if one is present. If not, this will be set to null.
            var reqBody = req.serializeBody();
            // If progress events are enabled, response headers will be delivered
            // in two events - the HttpHeaderResponse event and the full HttpResponse
            // event. However, since response headers don't change in between these
            // two events, it doesn't make sense to parse them twice. So headerResponse
            // caches the data extracted from the response whenever it's first parsed,
            // to ensure parsing isn't duplicated.
            var headerResponse = null;
            // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
            // state, and memoizes it into headerResponse.
            var partialFromXhr = function () {
                if (headerResponse !== null) {
                    return headerResponse;
                }
                // Read status and normalize an IE9 bug (http://bugs.jquery.com/ticket/1450).
                var status = xhr.status === 1223 ? 204 : xhr.status;
                var statusText = xhr.statusText || 'OK';
                // Parse headers from XMLHttpRequest - this step is lazy.
                var headers = new HttpHeaders(xhr.getAllResponseHeaders());
                // Read the response URL from the XMLHttpResponse instance and fall back on the
                // request URL.
                var url = getResponseUrl(xhr) || req.url;
                // Construct the HttpHeaderResponse and memoize it.
                headerResponse = new HttpHeaderResponse({ headers: headers, status: status, statusText: statusText, url: url });
                return headerResponse;
            };
            // Next, a few closures are defined for the various events which XMLHttpRequest can
            // emit. This allows them to be unregistered as event listeners later.
            // First up is the load event, which represents a response being fully available.
            var onLoad = function () {
                // Read response state from the memoized partial data.
                var _a = partialFromXhr(), headers = _a.headers, status = _a.status, statusText = _a.statusText, url = _a.url;
                // The body will be read out if present.
                var body = null;
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
                var ok = status >= 200 && status < 300;
                // Check whether the body needs to be parsed as JSON (in many cases the browser
                // will have done that already).
                if (req.responseType === 'json' && typeof body === 'string') {
                    // Save the original body, before attempting XSSI prefix stripping.
                    var originalBody = body;
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
                            body = { error: error, text: body };
                        }
                    }
                }
                if (ok) {
                    // A successful response is delivered on the event stream.
                    observer.next(new HttpResponse({
                        body: body,
                        headers: headers,
                        status: status,
                        statusText: statusText,
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
                        headers: headers,
                        status: status,
                        statusText: statusText,
                        url: url || undefined,
                    }));
                }
            };
            // The onError callback is called when something goes wrong at the network level.
            // Connection timeout, DNS error, offline, etc. These are actual errors, and are
            // transmitted on the error channel.
            var onError = function (error) {
                var url = partialFromXhr().url;
                var res = new HttpErrorResponse({
                    error: error,
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
            var sentHeaders = false;
            // The download progress event handler, which is only registered if
            // progress events are enabled.
            var onDownProgress = function (event) {
                // Send the HttpResponseHeaders event if it hasn't been sent already.
                if (!sentHeaders) {
                    observer.next(partialFromXhr());
                    sentHeaders = true;
                }
                // Start building the download progress event to deliver on the response
                // event stream.
                var progressEvent = {
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
            var onUpProgress = function (event) {
                // Upload progress events are simpler. Begin building the progress
                // event.
                var progress = {
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
            return function () {
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
    };
    HttpXhrBackend.ɵfac = function HttpXhrBackend_Factory(t) { return new (t || HttpXhrBackend)(i0.ɵɵinject(XhrFactory)); };
    HttpXhrBackend.ɵprov = i0.ɵɵdefineInjectable({ token: HttpXhrBackend, factory: HttpXhrBackend.ɵfac });
    return HttpXhrBackend;
}());
export { HttpXhrBackend };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpXhrBackend, [{
        type: Injectable
    }], function () { return [{ type: XhrFactory }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBc0IsWUFBWSxFQUEwQixNQUFNLFlBQVksQ0FBQzs7QUFFakwsSUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLEdBQVE7SUFDOUIsSUFBSSxhQUFhLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDM0MsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRTtRQUN4RCxPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSDtJQUFBO0lBQXFFLENBQUM7SUFBRCxpQkFBQztBQUFELENBQUMsQUFBdEUsSUFBc0U7O0FBRXRFOzs7R0FHRztBQUNIO0lBRUU7SUFBZSxDQUFDO0lBQ2hCLDBCQUFLLEdBQUwsY0FBZSxPQUFZLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3RUFGekMsVUFBVTtzREFBVixVQUFVLFdBQVYsVUFBVTtxQkE1Q3ZCO0NBK0NDLEFBSkQsSUFJQztTQUhZLFVBQVU7a0RBQVYsVUFBVTtjQUR0QixVQUFVOztBQWdCWDs7Ozs7O0dBTUc7QUFDSDtJQUVFLHdCQUFvQixVQUFzQjtRQUF0QixlQUFVLEdBQVYsVUFBVSxDQUFZO0lBQUcsQ0FBQztJQUU5Qzs7OztPQUlHO0lBQ0gsK0JBQU0sR0FBTixVQUFPLEdBQXFCO1FBQTVCLGlCQXlRQztRQXhRQyx5RUFBeUU7UUFDekUsOERBQThEO1FBQzlELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO1NBQzlGO1FBRUQsaURBQWlEO1FBQ2pELE9BQU8sSUFBSSxVQUFVLENBQUMsVUFBQyxRQUFrQztZQUN2RCx5RkFBeUY7WUFDekYsSUFBTSxHQUFHLEdBQUcsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUU7Z0JBQ3pCLEdBQUcsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBRUQsaUNBQWlDO1lBQ2pDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFFLE1BQU0sSUFBSyxPQUFBLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUE1QyxDQUE0QyxDQUFDLENBQUM7WUFFcEYscURBQXFEO1lBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDOUIsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsb0VBQW9FO1lBQ3BFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDcEMsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25ELDBDQUEwQztnQkFDMUMsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO29CQUN6QixHQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUNwRDthQUNGO1lBRUQsNkNBQTZDO1lBQzdDLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRTtnQkFDcEIsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFFcEQsNkVBQTZFO2dCQUM3RSw2RUFBNkU7Z0JBQzdFLHdFQUF3RTtnQkFDeEUsK0VBQStFO2dCQUMvRSxtRUFBbUU7Z0JBQ25FLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQVEsQ0FBQzthQUMvRTtZQUVELGtGQUFrRjtZQUNsRixJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFcEMscUVBQXFFO1lBQ3JFLHlFQUF5RTtZQUN6RSx1RUFBdUU7WUFDdkUsMkVBQTJFO1lBQzNFLDBFQUEwRTtZQUMxRSxzQ0FBc0M7WUFDdEMsSUFBSSxjQUFjLEdBQTRCLElBQUksQ0FBQztZQUVuRCxpRkFBaUY7WUFDakYsOENBQThDO1lBQzlDLElBQU0sY0FBYyxHQUFHO2dCQUNyQixJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7b0JBQzNCLE9BQU8sY0FBYyxDQUFDO2lCQUN2QjtnQkFFRCw2RUFBNkU7Z0JBQzdFLElBQU0sTUFBTSxHQUFXLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzlELElBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDO2dCQUUxQyx5REFBeUQ7Z0JBQ3pELElBQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7Z0JBRTdELCtFQUErRTtnQkFDL0UsZUFBZTtnQkFDZixJQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFFM0MsbURBQW1EO2dCQUNuRCxjQUFjLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxFQUFDLE9BQU8sU0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLEdBQUcsS0FBQSxFQUFDLENBQUMsQ0FBQztnQkFDNUUsT0FBTyxjQUFjLENBQUM7WUFDeEIsQ0FBQyxDQUFDO1lBRUYsbUZBQW1GO1lBQ25GLHNFQUFzRTtZQUV0RSxpRkFBaUY7WUFDakYsSUFBTSxNQUFNLEdBQUc7Z0JBQ2Isc0RBQXNEO2dCQUNsRCxJQUFBLHFCQUFxRCxFQUFwRCxvQkFBTyxFQUFFLGtCQUFNLEVBQUUsMEJBQVUsRUFBRSxZQUF1QixDQUFDO2dCQUUxRCx3Q0FBd0M7Z0JBQ3hDLElBQUksSUFBSSxHQUFhLElBQUksQ0FBQztnQkFFMUIsSUFBSSxNQUFNLEtBQUssR0FBRyxFQUFFO29CQUNsQiw4REFBOEQ7b0JBQzlELElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztpQkFDaEY7Z0JBRUQsOERBQThEO2dCQUM5RCxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ2hCLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDM0I7Z0JBRUQseUVBQXlFO2dCQUN6RSw0RUFBNEU7Z0JBQzVFLHdFQUF3RTtnQkFDeEUsNkRBQTZEO2dCQUM3RCxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7Z0JBRXZDLCtFQUErRTtnQkFDL0UsZ0NBQWdDO2dCQUNoQyxJQUFJLEdBQUcsQ0FBQyxZQUFZLEtBQUssTUFBTSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtvQkFDM0QsbUVBQW1FO29CQUNuRSxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQzFCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDckMsSUFBSTt3QkFDRixpRkFBaUY7d0JBQ2pGLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQzlDO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNkLG9GQUFvRjt3QkFDcEYsa0ZBQWtGO3dCQUNsRiwyQkFBMkI7d0JBQzNCLElBQUksR0FBRyxZQUFZLENBQUM7d0JBRXBCLGdGQUFnRjt3QkFDaEYscUVBQXFFO3dCQUNyRSxJQUFJLEVBQUUsRUFBRTs0QkFDTixtRUFBbUU7NEJBQ25FLEVBQUUsR0FBRyxLQUFLLENBQUM7NEJBQ1gsc0VBQXNFOzRCQUN0RSxJQUFJLEdBQUcsRUFBRSxLQUFLLE9BQUEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUF3QixDQUFDO3lCQUNwRDtxQkFDRjtpQkFDRjtnQkFFRCxJQUFJLEVBQUUsRUFBRTtvQkFDTiwwREFBMEQ7b0JBQzFELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxZQUFZLENBQUM7d0JBQzdCLElBQUksTUFBQTt3QkFDSixPQUFPLFNBQUE7d0JBQ1AsTUFBTSxRQUFBO3dCQUNOLFVBQVUsWUFBQTt3QkFDVixHQUFHLEVBQUUsR0FBRyxJQUFJLFNBQVM7cUJBQ3RCLENBQUMsQ0FBQyxDQUFDO29CQUNKLG1FQUFtRTtvQkFDbkUsMENBQTBDO29CQUMxQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ3JCO3FCQUFNO29CQUNMLDZEQUE2RDtvQkFDN0QsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDO3dCQUNuQyx1RUFBdUU7d0JBQ3ZFLEtBQUssRUFBRSxJQUFJO3dCQUNYLE9BQU8sU0FBQTt3QkFDUCxNQUFNLFFBQUE7d0JBQ04sVUFBVSxZQUFBO3dCQUNWLEdBQUcsRUFBRSxHQUFHLElBQUksU0FBUztxQkFDdEIsQ0FBQyxDQUFDLENBQUM7aUJBQ0w7WUFDSCxDQUFDLENBQUM7WUFFRixpRkFBaUY7WUFDakYsZ0ZBQWdGO1lBQ2hGLG9DQUFvQztZQUNwQyxJQUFNLE9BQU8sR0FBRyxVQUFDLEtBQW9CO2dCQUM1QixJQUFBLDBCQUFHLENBQXFCO2dCQUMvQixJQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFpQixDQUFDO29CQUNoQyxLQUFLLE9BQUE7b0JBQ0wsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDdkIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLElBQUksZUFBZTtvQkFDN0MsR0FBRyxFQUFFLEdBQUcsSUFBSSxTQUFTO2lCQUN0QixDQUFDLENBQUM7Z0JBQ0gsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUM7WUFFRixvRUFBb0U7WUFDcEUsc0VBQXNFO1lBQ3RFLHFFQUFxRTtZQUNyRSxrQkFBa0I7WUFDbEIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRXhCLG1FQUFtRTtZQUNuRSwrQkFBK0I7WUFDL0IsSUFBTSxjQUFjLEdBQUcsVUFBQyxLQUFvQjtnQkFDMUMscUVBQXFFO2dCQUNyRSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNoQixRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7b0JBQ2hDLFdBQVcsR0FBRyxJQUFJLENBQUM7aUJBQ3BCO2dCQUVELHdFQUF3RTtnQkFDeEUsZ0JBQWdCO2dCQUNoQixJQUFJLGFBQWEsR0FBOEI7b0JBQzdDLElBQUksRUFBRSxhQUFhLENBQUMsZ0JBQWdCO29CQUNwQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07aUJBQ3JCLENBQUM7Z0JBRUYsZ0VBQWdFO2dCQUNoRSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDMUIsYUFBYSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUNuQztnQkFFRCxnRUFBZ0U7Z0JBQ2hFLGdFQUFnRTtnQkFDaEUsZ0NBQWdDO2dCQUNoQyxJQUFJLEdBQUcsQ0FBQyxZQUFZLEtBQUssTUFBTSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO29CQUNyRCxhQUFhLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7aUJBQzlDO2dCQUVELDJCQUEyQjtnQkFDM0IsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUM7WUFFRixpRUFBaUU7WUFDakUsK0JBQStCO1lBQy9CLElBQU0sWUFBWSxHQUFHLFVBQUMsS0FBb0I7Z0JBQ3hDLGtFQUFrRTtnQkFDbEUsU0FBUztnQkFDVCxJQUFJLFFBQVEsR0FBNEI7b0JBQ3RDLElBQUksRUFBRSxhQUFhLENBQUMsY0FBYztvQkFDbEMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO2lCQUNyQixDQUFDO2dCQUVGLG9FQUFvRTtnQkFDcEUsTUFBTTtnQkFDTixJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDMUIsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUM5QjtnQkFFRCxrQkFBa0I7Z0JBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxDQUFDO1lBRUYsa0RBQWtEO1lBQ2xELEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV2QyxpREFBaUQ7WUFDakQsSUFBSSxHQUFHLENBQUMsY0FBYyxFQUFFO2dCQUN0QixvREFBb0Q7Z0JBQ3BELEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBRWpELGdFQUFnRTtnQkFDaEUsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7b0JBQ2xDLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUN2RDthQUNGO1lBRUQsbUVBQW1FO1lBQ25FLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBUyxDQUFDLENBQUM7WUFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUUxQyxnRUFBZ0U7WUFDaEUsZ0NBQWdDO1lBQ2hDLE9BQU87Z0JBQ0wsNERBQTREO2dCQUM1RCxHQUFHLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMxQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLEdBQUcsQ0FBQyxjQUFjLEVBQUU7b0JBQ3RCLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ3BELElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFO3dCQUNsQyxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztxQkFDMUQ7aUJBQ0Y7Z0JBRUQsd0NBQXdDO2dCQUN4QyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Z0ZBalJVLGNBQWMsY0FDTyxVQUFVOzBEQUQvQixjQUFjLFdBQWQsY0FBYzt5QkFuRTNCO0NBcVZDLEFBblJELElBbVJDO1NBbFJZLGNBQWM7a0RBQWQsY0FBYztjQUQxQixVQUFVO3NDQUV1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCwgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cEhlYWRlclJlc3BvbnNlLCBIdHRwSnNvblBhcnNlRXJyb3IsIEh0dHBSZXNwb25zZSwgSHR0cFVwbG9hZFByb2dyZXNzRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogWE1MSHR0cFJlcXVlc3QucmVzcG9uc2VVUkwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybCh4aHI6IGFueSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyICYmIHhoci5yZXNwb25zZVVSTCkge1xuICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkw7XG4gIH1cbiAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBYaHJGYWN0b3J5IHsgYWJzdHJhY3QgYnVpbGQoKTogWE1MSHR0cFJlcXVlc3Q7IH1cblxuLyoqXG4gKiBBIGZhY3RvcnkgZm9yIGBIdHRwWGhyQmFja2VuZGAgdGhhdCB1c2VzIHRoZSBgWE1MSHR0cFJlcXVlc3RgIGJyb3dzZXIgQVBJLlxuICpcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJYaHIgaW1wbGVtZW50cyBYaHJGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoKSB7fVxuICBidWlsZCgpOiBhbnkgeyByZXR1cm4gPGFueT4obmV3IFhNTEh0dHBSZXF1ZXN0KCkpOyB9XG59XG5cbi8qKlxuICogVHJhY2tzIGEgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyIHRoYXQgZG9lcyBub3QgeWV0IGhhdmUgYSBib2R5LlxuICovXG5pbnRlcmZhY2UgUGFydGlhbFJlc3BvbnNlIHtcbiAgaGVhZGVyczogSHR0cEhlYWRlcnM7XG4gIHN0YXR1czogbnVtYmVyO1xuICBzdGF0dXNUZXh0OiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFVzZXMgYFhNTEh0dHBSZXF1ZXN0YCB0byBzZW5kIHJlcXVlc3RzIHRvIGEgYmFja2VuZCBzZXJ2ZXIuXG4gKiBAc2VlIGBIdHRwSGFuZGxlcmBcbiAqIEBzZWUgYEpzb25wQ2xpZW50QmFja2VuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwWGhyQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB4aHJGYWN0b3J5OiBYaHJGYWN0b3J5KSB7fVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgYSByZXF1ZXN0IGFuZCByZXR1cm5zIGEgc3RyZWFtIG9mIHJlc3BvbnNlIGV2ZW50cy5cbiAgICogQHBhcmFtIHJlcSBUaGUgcmVxdWVzdCBvYmplY3QuXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIHJlc3BvbnNlIGV2ZW50cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgLy8gUXVpY2sgY2hlY2sgdG8gZ2l2ZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHdoZW4gYSB1c2VyIGF0dGVtcHRzIHRvIHVzZVxuICAgIC8vIEh0dHBDbGllbnQuanNvbnAoKSB3aXRob3V0IGluc3RhbGxpbmcgdGhlIEpzb25wQ2xpZW50TW9kdWxlXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXR0ZW1wdGVkIHRvIGNvbnN0cnVjdCBKc29ucCByZXF1ZXN0IHdpdGhvdXQgSnNvbnBDbGllbnRNb2R1bGUgaW5zdGFsbGVkLmApO1xuICAgIH1cblxuICAgIC8vIEV2ZXJ5dGhpbmcgaGFwcGVucyBvbiBPYnNlcnZhYmxlIHN1YnNjcmlwdGlvbi5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pID0+IHtcbiAgICAgIC8vIFN0YXJ0IGJ5IHNldHRpbmcgdXAgdGhlIFhIUiBvYmplY3Qgd2l0aCByZXF1ZXN0IG1ldGhvZCwgVVJMLCBhbmQgd2l0aENyZWRlbnRpYWxzIGZsYWcuXG4gICAgICBjb25zdCB4aHIgPSB0aGlzLnhockZhY3RvcnkuYnVpbGQoKTtcbiAgICAgIHhoci5vcGVuKHJlcS5tZXRob2QsIHJlcS51cmxXaXRoUGFyYW1zKTtcbiAgICAgIGlmICghIXJlcS53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhbGwgdGhlIHJlcXVlc3RlZCBoZWFkZXJzLlxuICAgICAgcmVxLmhlYWRlcnMuZm9yRWFjaCgobmFtZSwgdmFsdWVzKSA9PiB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZXMuam9pbignLCcpKSk7XG5cbiAgICAgIC8vIEFkZCBhbiBBY2NlcHQgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgICBpZiAoIXJlcS5oZWFkZXJzLmhhcygnQWNjZXB0JykpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonKTtcbiAgICAgIH1cblxuICAgICAgLy8gQXV0by1kZXRlY3QgdGhlIENvbnRlbnQtVHlwZSBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSkge1xuICAgICAgICBjb25zdCBkZXRlY3RlZFR5cGUgPSByZXEuZGV0ZWN0Q29udGVudFR5cGVIZWFkZXIoKTtcbiAgICAgICAgLy8gU29tZXRpbWVzIENvbnRlbnQtVHlwZSBkZXRlY3Rpb24gZmFpbHMuXG4gICAgICAgIGlmIChkZXRlY3RlZFR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgZGV0ZWN0ZWRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIHJlc3BvbnNlVHlwZSBpZiBvbmUgd2FzIHJlcXVlc3RlZC5cbiAgICAgIGlmIChyZXEucmVzcG9uc2VUeXBlKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlVHlwZSA9IHJlcS5yZXNwb25zZVR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAvLyBKU09OIHJlc3BvbnNlcyBuZWVkIHRvIGJlIHByb2Nlc3NlZCBhcyB0ZXh0LiBUaGlzIGlzIGJlY2F1c2UgaWYgdGhlIHNlcnZlclxuICAgICAgICAvLyByZXR1cm5zIGFuIFhTU0ktcHJlZml4ZWQgSlNPTiByZXNwb25zZSwgdGhlIGJyb3dzZXIgd2lsbCBmYWlsIHRvIHBhcnNlIGl0LFxuICAgICAgICAvLyB4aHIucmVzcG9uc2Ugd2lsbCBiZSBudWxsLCBhbmQgeGhyLnJlc3BvbnNlVGV4dCBjYW5ub3QgYmUgYWNjZXNzZWQgdG9cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIHByZWZpeGVkIEpTT04gZGF0YSBpbiBvcmRlciB0byBzdHJpcCB0aGUgcHJlZml4LiBUaHVzLCBhbGwgSlNPTlxuICAgICAgICAvLyBpcyBwYXJzZWQgYnkgZmlyc3QgcmVxdWVzdGluZyB0ZXh0IGFuZCB0aGVuIGFwcGx5aW5nIEpTT04ucGFyc2UuXG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAoKHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSA/IHJlc3BvbnNlVHlwZSA6ICd0ZXh0JykgYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBTZXJpYWxpemUgdGhlIHJlcXVlc3QgYm9keSBpZiBvbmUgaXMgcHJlc2VudC4gSWYgbm90LCB0aGlzIHdpbGwgYmUgc2V0IHRvIG51bGwuXG4gICAgICBjb25zdCByZXFCb2R5ID0gcmVxLnNlcmlhbGl6ZUJvZHkoKTtcblxuICAgICAgLy8gSWYgcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLCByZXNwb25zZSBoZWFkZXJzIHdpbGwgYmUgZGVsaXZlcmVkXG4gICAgICAvLyBpbiB0d28gZXZlbnRzIC0gdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBldmVudCBhbmQgdGhlIGZ1bGwgSHR0cFJlc3BvbnNlXG4gICAgICAvLyBldmVudC4gSG93ZXZlciwgc2luY2UgcmVzcG9uc2UgaGVhZGVycyBkb24ndCBjaGFuZ2UgaW4gYmV0d2VlbiB0aGVzZVxuICAgICAgLy8gdHdvIGV2ZW50cywgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIHBhcnNlIHRoZW0gdHdpY2UuIFNvIGhlYWRlclJlc3BvbnNlXG4gICAgICAvLyBjYWNoZXMgdGhlIGRhdGEgZXh0cmFjdGVkIGZyb20gdGhlIHJlc3BvbnNlIHdoZW5ldmVyIGl0J3MgZmlyc3QgcGFyc2VkLFxuICAgICAgLy8gdG8gZW5zdXJlIHBhcnNpbmcgaXNuJ3QgZHVwbGljYXRlZC5cbiAgICAgIGxldCBoZWFkZXJSZXNwb25zZTogSHR0cEhlYWRlclJlc3BvbnNlfG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBwYXJ0aWFsRnJvbVhociBleHRyYWN0cyB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGZyb20gdGhlIGN1cnJlbnQgWE1MSHR0cFJlcXVlc3RcbiAgICAgIC8vIHN0YXRlLCBhbmQgbWVtb2l6ZXMgaXQgaW50byBoZWFkZXJSZXNwb25zZS5cbiAgICAgIGNvbnN0IHBhcnRpYWxGcm9tWGhyID0gKCk6IEh0dHBIZWFkZXJSZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChoZWFkZXJSZXNwb25zZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgc3RhdHVzIGFuZCBub3JtYWxpemUgYW4gSUU5IGJ1ZyAoaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTQ1MCkuXG4gICAgICAgIGNvbnN0IHN0YXR1czogbnVtYmVyID0geGhyLnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHhoci5zdGF0dXM7XG4gICAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSB4aHIuc3RhdHVzVGV4dCB8fCAnT0snO1xuXG4gICAgICAgIC8vIFBhcnNlIGhlYWRlcnMgZnJvbSBYTUxIdHRwUmVxdWVzdCAtIHRoaXMgc3RlcCBpcyBsYXp5LlxuICAgICAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG5cbiAgICAgICAgLy8gUmVhZCB0aGUgcmVzcG9uc2UgVVJMIGZyb20gdGhlIFhNTEh0dHBSZXNwb25zZSBpbnN0YW5jZSBhbmQgZmFsbCBiYWNrIG9uIHRoZVxuICAgICAgICAvLyByZXF1ZXN0IFVSTC5cbiAgICAgICAgY29uc3QgdXJsID0gZ2V0UmVzcG9uc2VVcmwoeGhyKSB8fCByZXEudXJsO1xuXG4gICAgICAgIC8vIENvbnN0cnVjdCB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGFuZCBtZW1vaXplIGl0LlxuICAgICAgICBoZWFkZXJSZXNwb25zZSA9IG5ldyBIdHRwSGVhZGVyUmVzcG9uc2Uoe2hlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSk7XG4gICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIE5leHQsIGEgZmV3IGNsb3N1cmVzIGFyZSBkZWZpbmVkIGZvciB0aGUgdmFyaW91cyBldmVudHMgd2hpY2ggWE1MSHR0cFJlcXVlc3QgY2FuXG4gICAgICAvLyBlbWl0LiBUaGlzIGFsbG93cyB0aGVtIHRvIGJlIHVucmVnaXN0ZXJlZCBhcyBldmVudCBsaXN0ZW5lcnMgbGF0ZXIuXG5cbiAgICAgIC8vIEZpcnN0IHVwIGlzIHRoZSBsb2FkIGV2ZW50LCB3aGljaCByZXByZXNlbnRzIGEgcmVzcG9uc2UgYmVpbmcgZnVsbHkgYXZhaWxhYmxlLlxuICAgICAgY29uc3Qgb25Mb2FkID0gKCkgPT4ge1xuICAgICAgICAvLyBSZWFkIHJlc3BvbnNlIHN0YXRlIGZyb20gdGhlIG1lbW9pemVkIHBhcnRpYWwgZGF0YS5cbiAgICAgICAgbGV0IHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0gPSBwYXJ0aWFsRnJvbVhocigpO1xuXG4gICAgICAgIC8vIFRoZSBib2R5IHdpbGwgYmUgcmVhZCBvdXQgaWYgcHJlc2VudC5cbiAgICAgICAgbGV0IGJvZHk6IGFueXxudWxsID0gbnVsbDtcblxuICAgICAgICBpZiAoc3RhdHVzICE9PSAyMDQpIHtcbiAgICAgICAgICAvLyBVc2UgWE1MSHR0cFJlcXVlc3QucmVzcG9uc2UgaWYgc2V0LCByZXNwb25zZVRleHQgb3RoZXJ3aXNlLlxuICAgICAgICAgIGJvZHkgPSAodHlwZW9mIHhoci5yZXNwb25zZSA9PT0gJ3VuZGVmaW5lZCcpID8geGhyLnJlc3BvbnNlVGV4dCA6IHhoci5yZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBhbm90aGVyIHBvdGVudGlhbCBidWcgKHRoaXMgb25lIGNvbWVzIGZyb20gQ09SUykuXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgICBzdGF0dXMgPSAhIWJvZHkgPyAyMDAgOiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb2sgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZXNwb25zZSB3aWxsIGJlIHRyYW5zbWl0dGVkIG9uIHRoZSBldmVudCBvclxuICAgICAgICAvLyBlcnJvciBjaGFubmVsLiBVbnN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGVzIChub3QgMnh4KSB3aWxsIGFsd2F5cyBiZSBlcnJvcnMsXG4gICAgICAgIC8vIGJ1dCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgY2FuIHN0aWxsIHJlc3VsdCBpbiBhbiBlcnJvciBpZiB0aGUgdXNlclxuICAgICAgICAvLyBhc2tlZCBmb3IgSlNPTiBkYXRhIGFuZCB0aGUgYm9keSBjYW5ub3QgYmUgcGFyc2VkIGFzIHN1Y2guXG4gICAgICAgIGxldCBvayA9IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuXG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgbmVlZHMgdG8gYmUgcGFyc2VkIGFzIEpTT04gKGluIG1hbnkgY2FzZXMgdGhlIGJyb3dzZXJcbiAgICAgICAgLy8gd2lsbCBoYXZlIGRvbmUgdGhhdCBhbHJlYWR5KS5cbiAgICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUgPT09ICdqc29uJyAmJiB0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCBib2R5LCBiZWZvcmUgYXR0ZW1wdGluZyBYU1NJIHByZWZpeCBzdHJpcHBpbmcuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxCb2R5ID0gYm9keTtcbiAgICAgICAgICBib2R5ID0gYm9keS5yZXBsYWNlKFhTU0lfUFJFRklYLCAnJyk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEF0dGVtcHQgdGhlIHBhcnNlLiBJZiBpdCBmYWlscywgYSBwYXJzZSBlcnJvciBzaG91bGQgYmUgZGVsaXZlcmVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgYm9keSA9IGJvZHkgIT09ICcnID8gSlNPTi5wYXJzZShib2R5KSA6IG51bGw7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBKU09OLnBhcnNlIGZhaWxlZCwgaXQncyByZWFzb25hYmxlIHRvIGFzc3VtZSB0aGlzIG1pZ2h0IG5vdCBoYXZlIGJlZW4gYVxuICAgICAgICAgICAgLy8gSlNPTiByZXNwb25zZS4gUmVzdG9yZSB0aGUgb3JpZ2luYWwgYm9keSAoaW5jbHVkaW5nIGFueSBYU1NJIHByZWZpeCkgdG8gZGVsaXZlclxuICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZXJyb3IgcmVzcG9uc2UuXG4gICAgICAgICAgICBib2R5ID0gb3JpZ2luYWxCb2R5O1xuXG4gICAgICAgICAgICAvLyBJZiB0aGlzIHdhcyBhbiBlcnJvciByZXF1ZXN0IHRvIGJlZ2luIHdpdGgsIGxlYXZlIGl0IGFzIGEgc3RyaW5nLCBpdCBwcm9iYWJseVxuICAgICAgICAgICAgLy8ganVzdCBpc24ndCBKU09OLiBPdGhlcndpc2UsIGRlbGl2ZXIgdGhlIHBhcnNpbmcgZXJyb3IgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgLy8gRXZlbiB0aG91Z2ggdGhlIHJlc3BvbnNlIHN0YXR1cyB3YXMgMnh4LCB0aGlzIGlzIHN0aWxsIGFuIGVycm9yLlxuICAgICAgICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICAgICAgICAvLyBUaGUgcGFyc2UgZXJyb3IgY29udGFpbnMgdGhlIHRleHQgb2YgdGhlIGJvZHkgdGhhdCBmYWlsZWQgdG8gcGFyc2UuXG4gICAgICAgICAgICAgIGJvZHkgPSB7IGVycm9yLCB0ZXh0OiBib2R5IH0gYXMgSHR0cEpzb25QYXJzZUVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvaykge1xuICAgICAgICAgIC8vIEEgc3VjY2Vzc2Z1bCByZXNwb25zZSBpcyBkZWxpdmVyZWQgb24gdGhlIGV2ZW50IHN0cmVhbS5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICAvLyBUaGUgZnVsbCBib2R5IGhhcyBiZWVuIHJlY2VpdmVkIGFuZCBkZWxpdmVyZWQsIG5vIGZ1cnRoZXIgZXZlbnRzXG4gICAgICAgICAgLy8gYXJlIHBvc3NpYmxlLiBUaGlzIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBBbiB1bnN1Y2Nlc3NmdWwgcmVxdWVzdCBpcyBkZWxpdmVyZWQgb24gdGhlIGVycm9yIGNoYW5uZWwuXG4gICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICAgIC8vIFRoZSBlcnJvciBpbiB0aGlzIGNhc2UgaXMgdGhlIHJlc3BvbnNlIGJvZHkgKGVycm9yIGZyb20gdGhlIHNlcnZlcikuXG4gICAgICAgICAgICBlcnJvcjogYm9keSxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gVGhlIG9uRXJyb3IgY2FsbGJhY2sgaXMgY2FsbGVkIHdoZW4gc29tZXRoaW5nIGdvZXMgd3JvbmcgYXQgdGhlIG5ldHdvcmsgbGV2ZWwuXG4gICAgICAvLyBDb25uZWN0aW9uIHRpbWVvdXQsIEROUyBlcnJvciwgb2ZmbGluZSwgZXRjLiBUaGVzZSBhcmUgYWN0dWFsIGVycm9ycywgYW5kIGFyZVxuICAgICAgLy8gdHJhbnNtaXR0ZWQgb24gdGhlIGVycm9yIGNoYW5uZWwuXG4gICAgICBjb25zdCBvbkVycm9yID0gKGVycm9yOiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHt1cmx9ID0gcGFydGlhbEZyb21YaHIoKTtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMgfHwgMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCB8fCAnVW5rbm93biBFcnJvcicsXG4gICAgICAgICAgdXJsOiB1cmwgfHwgdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IocmVzKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSBzZW50SGVhZGVycyBmbGFnIHRyYWNrcyB3aGV0aGVyIHRoZSBIdHRwUmVzcG9uc2VIZWFkZXJzIGV2ZW50XG4gICAgICAvLyBoYXMgYmVlbiBzZW50IG9uIHRoZSBzdHJlYW0uIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHRyYWNrIGlmIHByb2dyZXNzXG4gICAgICAvLyBpcyBlbmFibGVkIHNpbmNlIHRoZSBldmVudCB3aWxsIGJlIHNlbnQgb24gb25seSB0aGUgZmlyc3QgZG93bmxvYWRcbiAgICAgIC8vIHByb2dlcnNzIGV2ZW50LlxuICAgICAgbGV0IHNlbnRIZWFkZXJzID0gZmFsc2U7XG5cbiAgICAgIC8vIFRoZSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgIGNvbnN0IG9uRG93blByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIC8vIFNlbmQgdGhlIEh0dHBSZXNwb25zZUhlYWRlcnMgZXZlbnQgaWYgaXQgaGFzbid0IGJlZW4gc2VudCBhbHJlYWR5LlxuICAgICAgICBpZiAoIXNlbnRIZWFkZXJzKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChwYXJ0aWFsRnJvbVhocigpKTtcbiAgICAgICAgICBzZW50SGVhZGVycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCBidWlsZGluZyB0aGUgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgdG8gZGVsaXZlciBvbiB0aGUgcmVzcG9uc2VcbiAgICAgICAgLy8gZXZlbnQgc3RyZWFtLlxuICAgICAgICBsZXQgcHJvZ3Jlc3NFdmVudDogSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU2V0IHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgaW4gdGhlIGV2ZW50IGlmIGl0J3MgYXZhaWxhYmxlLlxuICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHByb2dyZXNzRXZlbnQudG90YWwgPSBldmVudC50b3RhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSByZXF1ZXN0IHdhcyBmb3IgdGV4dCBjb250ZW50IGFuZCBhIHBhcnRpYWwgcmVzcG9uc2UgaXNcbiAgICAgICAgLy8gYXZhaWxhYmxlIG9uIFhNTEh0dHBSZXF1ZXN0LCBpbmNsdWRlIGl0IGluIHRoZSBwcm9ncmVzcyBldmVudFxuICAgICAgICAvLyB0byBhbGxvdyBmb3Igc3RyZWFtaW5nIHJlYWRzLlxuICAgICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnICYmICEheGhyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgIHByb2dyZXNzRXZlbnQucGFydGlhbFRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgZmlyZSB0aGUgZXZlbnQuXG4gICAgICAgIG9ic2VydmVyLm5leHQocHJvZ3Jlc3NFdmVudCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgdXBsb2FkIHByb2dyZXNzIGV2ZW50IGhhbmRsZXIsIHdoaWNoIGlzIG9ubHkgcmVnaXN0ZXJlZCBpZlxuICAgICAgLy8gcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLlxuICAgICAgY29uc3Qgb25VcFByb2dyZXNzID0gKGV2ZW50OiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBldmVudHMgYXJlIHNpbXBsZXIuIEJlZ2luIGJ1aWxkaW5nIHRoZSBwcm9ncmVzc1xuICAgICAgICAvLyBldmVudC5cbiAgICAgICAgbGV0IHByb2dyZXNzOiBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudCA9IHtcbiAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzLFxuICAgICAgICAgIGxvYWRlZDogZXZlbnQubG9hZGVkLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIElmIHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgYmVpbmcgdXBsb2FkZWQgaXMgYXZhaWxhYmxlLCBpbmNsdWRlXG4gICAgICAgIC8vIGl0LlxuICAgICAgICBpZiAoZXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHByb2dyZXNzLnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZW5kIHRoZSBldmVudC5cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChwcm9ncmVzcyk7XG4gICAgICB9O1xuXG4gICAgICAvLyBCeSBkZWZhdWx0LCByZWdpc3RlciBmb3IgbG9hZCBhbmQgZXJyb3IgZXZlbnRzLlxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG5cbiAgICAgIC8vIFByb2dyZXNzIGV2ZW50cyBhcmUgb25seSBlbmFibGVkIGlmIHJlcXVlc3RlZC5cbiAgICAgIGlmIChyZXEucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgLy8gRG93bmxvYWQgcHJvZ3Jlc3MgaXMgYWx3YXlzIGVuYWJsZWQgaWYgcmVxdWVzdGVkLlxuICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvbkRvd25Qcm9ncmVzcyk7XG5cbiAgICAgICAgLy8gVXBsb2FkIHByb2dyZXNzIGRlcGVuZHMgb24gd2hldGhlciB0aGVyZSBpcyBhIGJvZHkgdG8gdXBsb2FkLlxuICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uVXBQcm9ncmVzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRmlyZSB0aGUgcmVxdWVzdCwgYW5kIG5vdGlmeSB0aGUgZXZlbnQgc3RyZWFtIHRoYXQgaXQgd2FzIGZpcmVkLlxuICAgICAgeGhyLnNlbmQocmVxQm9keSAhKTtcbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICAvLyBUaGlzIGlzIHRoZSByZXR1cm4gZnJvbSB0aGUgT2JzZXJ2YWJsZSBmdW5jdGlvbiwgd2hpY2ggaXMgdGhlXG4gICAgICAvLyByZXF1ZXN0IGNhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgLy8gT24gYSBjYW5jZWxsYXRpb24sIHJlbW92ZSBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIGlmIChyZXEucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvbkRvd25Qcm9ncmVzcyk7XG4gICAgICAgICAgaWYgKHJlcUJvZHkgIT09IG51bGwgJiYgeGhyLnVwbG9hZCkge1xuICAgICAgICAgICAgeGhyLnVwbG9hZC5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uVXBQcm9ncmVzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgYWJvcnQgdGhlIGluLWZsaWdodCByZXF1ZXN0LlxuICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==