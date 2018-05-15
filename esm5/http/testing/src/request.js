/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
/**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 *
 */
var /**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 *
 */
TestRequest = /** @class */ (function () {
    function TestRequest(request, observer) {
        this.request = request;
        this.observer = observer;
        /**
           * @internal set by `HttpClientTestingBackend`
           */
        this._cancelled = false;
    }
    Object.defineProperty(TestRequest.prototype, "cancelled", {
        /**
         * Whether the request was cancelled after it was sent.
         */
        get: /**
           * Whether the request was cancelled after it was sent.
           */
        function () { return this._cancelled; },
        enumerable: true,
        configurable: true
    });
    /**
     * Resolve the request by returning a body plus additional HTTP information (such as response
     * headers) if provided.
     *
     * Both successful and unsuccessful responses can be delivered via `flush()`.
     */
    /**
       * Resolve the request by returning a body plus additional HTTP information (such as response
       * headers) if provided.
       *
       * Both successful and unsuccessful responses can be delivered via `flush()`.
       */
    TestRequest.prototype.flush = /**
       * Resolve the request by returning a body plus additional HTTP information (such as response
       * headers) if provided.
       *
       * Both successful and unsuccessful responses can be delivered via `flush()`.
       */
    function (body, opts) {
        if (opts === void 0) { opts = {}; }
        if (this.cancelled) {
            throw new Error("Cannot flush a cancelled request.");
        }
        var url = this.request.urlWithParams;
        var headers = (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
        body = _maybeConvertBody(this.request.responseType, body);
        var statusText = opts.statusText;
        var status = opts.status !== undefined ? opts.status : 200;
        if (opts.status === undefined) {
            if (body === null) {
                status = 204;
                statusText = statusText || 'No Content';
            }
            else {
                statusText = statusText || 'OK';
            }
        }
        if (statusText === undefined) {
            throw new Error('statusText is required when setting a custom status.');
        }
        if (status >= 200 && status < 300) {
            this.observer.next(new HttpResponse({ body: body, headers: headers, status: status, statusText: statusText, url: url }));
            this.observer.complete();
        }
        else {
            this.observer.error(new HttpErrorResponse({ error: body, headers: headers, status: status, statusText: statusText, url: url }));
        }
    };
    /**
     * Resolve the request by returning an `ErrorEvent` (e.g. simulating a network failure).
     */
    /**
       * Resolve the request by returning an `ErrorEvent` (e.g. simulating a network failure).
       */
    TestRequest.prototype.error = /**
       * Resolve the request by returning an `ErrorEvent` (e.g. simulating a network failure).
       */
    function (error, opts) {
        if (opts === void 0) { opts = {}; }
        if (this.cancelled) {
            throw new Error("Cannot return an error for a cancelled request.");
        }
        if (opts.status && opts.status >= 200 && opts.status < 300) {
            throw new Error("error() called with a successful status.");
        }
        var headers = (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
        this.observer.error(new HttpErrorResponse({
            error: error,
            headers: headers,
            status: opts.status || 0,
            statusText: opts.statusText || '',
            url: this.request.urlWithParams,
        }));
    };
    /**
     * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
     * request.
     */
    /**
       * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
       * request.
       */
    TestRequest.prototype.event = /**
       * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
       * request.
       */
    function (event) {
        if (this.cancelled) {
            throw new Error("Cannot send events to a cancelled request.");
        }
        this.observer.next(event);
    };
    return TestRequest;
}());
/**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 *
 */
export { TestRequest };
/**
 * Helper function to convert a response body to an ArrayBuffer.
 */
function _toArrayBufferBody(body) {
    if (typeof ArrayBuffer === 'undefined') {
        throw new Error('ArrayBuffer responses are not supported on this platform.');
    }
    if (body instanceof ArrayBuffer) {
        return body;
    }
    throw new Error('Automatic conversion to ArrayBuffer is not supported for response type.');
}
/**
 * Helper function to convert a response body to a Blob.
 */
function _toBlob(body) {
    if (typeof Blob === 'undefined') {
        throw new Error('Blob responses are not supported on this platform.');
    }
    if (body instanceof Blob) {
        return body;
    }
    if (ArrayBuffer && body instanceof ArrayBuffer) {
        return new Blob([body]);
    }
    throw new Error('Automatic conversion to Blob is not supported for response type.');
}
/**
 * Helper function to convert a response body to JSON data.
 */
function _toJsonBody(body, format) {
    if (format === void 0) { format = 'JSON'; }
    if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
        throw new Error("Automatic conversion to " + format + " is not supported for ArrayBuffers.");
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
        throw new Error("Automatic conversion to " + format + " is not supported for Blobs.");
    }
    if (typeof body === 'string' || typeof body === 'number' || typeof body === 'object' ||
        Array.isArray(body)) {
        return body;
    }
    throw new Error("Automatic conversion to " + format + " is not supported for response type.");
}
/**
 * Helper function to convert a response body to a string.
 */
function _toTextBody(body) {
    if (typeof body === 'string') {
        return body;
    }
    if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
        throw new Error('Automatic conversion to text is not supported for ArrayBuffers.');
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
        throw new Error('Automatic conversion to text is not supported for Blobs.');
    }
    return JSON.stringify(_toJsonBody(body, 'text'));
}
/**
 * Convert a response body to the requested type.
 */
function _maybeConvertBody(responseType, body) {
    if (body === null) {
        return null;
    }
    switch (responseType) {
        case 'arraybuffer':
            return _toArrayBufferBody(body);
        case 'blob':
            return _toBlob(body);
        case 'json':
            return _toJsonBody(body);
        case 'text':
            return _toTextBody(body);
        default:
            throw new Error("Unsupported responseType: " + responseType);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL3JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBYSxXQUFXLEVBQWUsWUFBWSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7Ozs7Ozs7OztBQVcxRzs7Ozs7Ozs7QUFBQTtJQVdFLHFCQUFtQixPQUF5QixFQUFVLFFBQWtDO1FBQXJFLFlBQU8sR0FBUCxPQUFPLENBQWtCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7Ozs7MEJBRjNFLEtBQUs7S0FFMEU7SUFQNUYsc0JBQUksa0NBQVM7UUFIYjs7V0FFRzs7OztRQUNILGNBQTJCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFOzs7T0FBQTtJQVNwRDs7Ozs7T0FLRzs7Ozs7OztJQUNILDJCQUFLOzs7Ozs7SUFBTCxVQUFNLElBQThFLEVBQUUsSUFJaEY7UUFKZ0YscUJBQUEsRUFBQSxTQUloRjtRQUNKLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUN2QyxJQUFNLE9BQU8sR0FDVCxDQUFDLElBQUksQ0FBQyxPQUFPLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6RixJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxVQUFVLEdBQXFC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QzFGOzs7O0FBS0QscUJBQ0ksSUFDbUM7SUFDckMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELElBQUksT0FBTyxXQUFXLEtBQUssV0FBVyxJQUFJLElBQUksWUFBWSxXQUFXLEVBQUU7UUFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO0tBQ3BGO0lBQ0QsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxZQUFZLElBQUksRUFBRTtRQUN2RCxNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7S0FDN0U7SUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0NBQ2xEOzs7O0FBS0QsMkJBQ0ksWUFBb0IsRUFBRSxJQUN3QjtJQUVoRCxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDakIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELFFBQVEsWUFBWSxFQUFFO1FBQ3BCLEtBQUssYUFBYTtZQUNoQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLEtBQUssTUFBTTtZQUNULE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLEtBQUssTUFBTTtZQUNULE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLEtBQUssTUFBTTtZQUNULE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBNkIsWUFBYyxDQUFDLENBQUM7S0FDaEU7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwSGVhZGVycywgSHR0cFJlcXVlc3QsIEh0dHBSZXNwb25zZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHtPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogQSBtb2NrIHJlcXVlc3RzIHRoYXQgd2FzIHJlY2VpdmVkIGFuZCBpcyByZWFkeSB0byBiZSBhbnN3ZXJlZC5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBhbGxvd3MgYWNjZXNzIHRvIHRoZSB1bmRlcmx5aW5nIGBIdHRwUmVxdWVzdGAsIGFuZCBhbGxvd3NcbiAqIHJlc3BvbmRpbmcgd2l0aCBgSHR0cEV2ZW50YHMgb3IgYEh0dHBFcnJvclJlc3BvbnNlYHMuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIFRlc3RSZXF1ZXN0IHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJlcXVlc3Qgd2FzIGNhbmNlbGxlZCBhZnRlciBpdCB3YXMgc2VudC5cbiAgICovXG4gIGdldCBjYW5jZWxsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9jYW5jZWxsZWQ7IH1cblxuICAvKipcbiAgICogQGludGVybmFsIHNldCBieSBgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kYFxuICAgKi9cbiAgX2NhbmNlbGxlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBwcml2YXRlIG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pIHt9XG5cbiAgLyoqXG4gICAqIFJlc29sdmUgdGhlIHJlcXVlc3QgYnkgcmV0dXJuaW5nIGEgYm9keSBwbHVzIGFkZGl0aW9uYWwgSFRUUCBpbmZvcm1hdGlvbiAoc3VjaCBhcyByZXNwb25zZVxuICAgKiBoZWFkZXJzKSBpZiBwcm92aWRlZC5cbiAgICpcbiAgICogQm90aCBzdWNjZXNzZnVsIGFuZCB1bnN1Y2Nlc3NmdWwgcmVzcG9uc2VzIGNhbiBiZSBkZWxpdmVyZWQgdmlhIGBmbHVzaCgpYC5cbiAgICovXG4gIGZsdXNoKGJvZHk6IEFycmF5QnVmZmVyfEJsb2J8c3RyaW5nfG51bWJlcnxPYmplY3R8KHN0cmluZ3xudW1iZXJ8T2JqZWN0fG51bGwpW118bnVsbCwgb3B0czoge1xuICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycyB8IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119LFxuICAgIHN0YXR1cz86IG51bWJlcixcbiAgICBzdGF0dXNUZXh0Pzogc3RyaW5nLFxuICB9ID0ge30pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZsdXNoIGEgY2FuY2VsbGVkIHJlcXVlc3QuYCk7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IHRoaXMucmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuICAgIGNvbnN0IGhlYWRlcnMgPVxuICAgICAgICAob3B0cy5oZWFkZXJzIGluc3RhbmNlb2YgSHR0cEhlYWRlcnMpID8gb3B0cy5oZWFkZXJzIDogbmV3IEh0dHBIZWFkZXJzKG9wdHMuaGVhZGVycyk7XG4gICAgYm9keSA9IF9tYXliZUNvbnZlcnRCb2R5KHRoaXMucmVxdWVzdC5yZXNwb25zZVR5cGUsIGJvZHkpO1xuICAgIGxldCBzdGF0dXNUZXh0OiBzdHJpbmd8dW5kZWZpbmVkID0gb3B0cy5zdGF0dXNUZXh0O1xuICAgIGxldCBzdGF0dXM6IG51bWJlciA9IG9wdHMuc3RhdHVzICE9PSB1bmRlZmluZWQgPyBvcHRzLnN0YXR1cyA6IDIwMDtcbiAgICBpZiAob3B0cy5zdGF0dXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGJvZHkgPT09IG51bGwpIHtcbiAgICAgICAgc3RhdHVzID0gMjA0O1xuICAgICAgICBzdGF0dXNUZXh0ID0gc3RhdHVzVGV4dCB8fCAnTm8gQ29udGVudCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0dXNUZXh0ID0gc3RhdHVzVGV4dCB8fCAnT0snO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RhdHVzVGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0YXR1c1RleHQgaXMgcmVxdWlyZWQgd2hlbiBzZXR0aW5nIGEgY3VzdG9tIHN0YXR1cy4nKTtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwKSB7XG4gICAgICB0aGlzLm9ic2VydmVyLm5leHQobmV3IEh0dHBSZXNwb25zZTxhbnk+KHtib2R5LCBoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICAgIHRoaXMub2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe2Vycm9yOiBib2R5LCBoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZSB0aGUgcmVxdWVzdCBieSByZXR1cm5pbmcgYW4gYEVycm9yRXZlbnRgIChlLmcuIHNpbXVsYXRpbmcgYSBuZXR3b3JrIGZhaWx1cmUpLlxuICAgKi9cbiAgZXJyb3IoZXJyb3I6IEVycm9yRXZlbnQsIG9wdHM6IHtcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnMgfCB7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSxcbiAgICBzdGF0dXM/OiBudW1iZXIsXG4gICAgc3RhdHVzVGV4dD86IHN0cmluZyxcbiAgfSA9IHt9KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXR1cm4gYW4gZXJyb3IgZm9yIGEgY2FuY2VsbGVkIHJlcXVlc3QuYCk7XG4gICAgfVxuICAgIGlmIChvcHRzLnN0YXR1cyAmJiBvcHRzLnN0YXR1cyA+PSAyMDAgJiYgb3B0cy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZXJyb3IoKSBjYWxsZWQgd2l0aCBhIHN1Y2Nlc3NmdWwgc3RhdHVzLmApO1xuICAgIH1cbiAgICBjb25zdCBoZWFkZXJzID1cbiAgICAgICAgKG9wdHMuaGVhZGVycyBpbnN0YW5jZW9mIEh0dHBIZWFkZXJzKSA/IG9wdHMuaGVhZGVycyA6IG5ldyBIdHRwSGVhZGVycyhvcHRzLmhlYWRlcnMpO1xuICAgIHRoaXMub2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgIGVycm9yLFxuICAgICAgaGVhZGVycyxcbiAgICAgIHN0YXR1czogb3B0cy5zdGF0dXMgfHwgMCxcbiAgICAgIHN0YXR1c1RleHQ6IG9wdHMuc3RhdHVzVGV4dCB8fCAnJyxcbiAgICAgIHVybDogdGhpcy5yZXF1ZXN0LnVybFdpdGhQYXJhbXMsXG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGl2ZXIgYW4gYXJiaXRyYXJ5IGBIdHRwRXZlbnRgIChzdWNoIGFzIGEgcHJvZ3Jlc3MgZXZlbnQpIG9uIHRoZSByZXNwb25zZSBzdHJlYW0gZm9yIHRoaXNcbiAgICogcmVxdWVzdC5cbiAgICovXG4gIGV2ZW50KGV2ZW50OiBIdHRwRXZlbnQ8YW55Pik6IHZvaWQge1xuICAgIGlmICh0aGlzLmNhbmNlbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2VuZCBldmVudHMgdG8gYSBjYW5jZWxsZWQgcmVxdWVzdC5gKTtcbiAgICB9XG4gICAgdGhpcy5vYnNlcnZlci5uZXh0KGV2ZW50KTtcbiAgfVxufVxuXG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgYSByZXNwb25zZSBib2R5IHRvIGFuIEFycmF5QnVmZmVyLlxuICovXG5mdW5jdGlvbiBfdG9BcnJheUJ1ZmZlckJvZHkoXG4gICAgYm9keTogQXJyYXlCdWZmZXIgfCBCbG9iIHwgc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHxcbiAgICAoc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgbnVsbClbXSk6IEFycmF5QnVmZmVyIHtcbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0FycmF5QnVmZmVyIHJlc3BvbnNlcyBhcmUgbm90IHN1cHBvcnRlZCBvbiB0aGlzIHBsYXRmb3JtLicpO1xuICB9XG4gIGlmIChib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0F1dG9tYXRpYyBjb252ZXJzaW9uIHRvIEFycmF5QnVmZmVyIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHJlc3BvbnNlIHR5cGUuJyk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgYSByZXNwb25zZSBib2R5IHRvIGEgQmxvYi5cbiAqL1xuZnVuY3Rpb24gX3RvQmxvYihcbiAgICBib2R5OiBBcnJheUJ1ZmZlciB8IEJsb2IgfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfFxuICAgIChzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCBudWxsKVtdKTogQmxvYiB7XG4gIGlmICh0eXBlb2YgQmxvYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jsb2IgcmVzcG9uc2VzIGFyZSBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgcGxhdGZvcm0uJyk7XG4gIH1cbiAgaWYgKGJvZHkgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgaWYgKEFycmF5QnVmZmVyICYmIGJvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBuZXcgQmxvYihbYm9keV0pO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignQXV0b21hdGljIGNvbnZlcnNpb24gdG8gQmxvYiBpcyBub3Qgc3VwcG9ydGVkIGZvciByZXNwb25zZSB0eXBlLicpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IGEgcmVzcG9uc2UgYm9keSB0byBKU09OIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIF90b0pzb25Cb2R5KFxuICAgIGJvZHk6IEFycmF5QnVmZmVyIHwgQmxvYiB8IHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IChzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCBudWxsKVtdLFxuICAgIGZvcm1hdDogc3RyaW5nID0gJ0pTT04nKTogT2JqZWN0fHN0cmluZ3xudW1iZXJ8KE9iamVjdCB8IHN0cmluZyB8IG51bWJlcilbXSB7XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIGJvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgQXV0b21hdGljIGNvbnZlcnNpb24gdG8gJHtmb3JtYXR9IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIEFycmF5QnVmZmVycy5gKTtcbiAgfVxuICBpZiAodHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnICYmIGJvZHkgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBBdXRvbWF0aWMgY29udmVyc2lvbiB0byAke2Zvcm1hdH0gaXMgbm90IHN1cHBvcnRlZCBmb3IgQmxvYnMuYCk7XG4gIH1cbiAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYm9keSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGJvZHkgPT09ICdvYmplY3QnIHx8XG4gICAgICBBcnJheS5pc0FycmF5KGJvZHkpKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBBdXRvbWF0aWMgY29udmVyc2lvbiB0byAke2Zvcm1hdH0gaXMgbm90IHN1cHBvcnRlZCBmb3IgcmVzcG9uc2UgdHlwZS5gKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBhIHJlc3BvbnNlIGJvZHkgdG8gYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIF90b1RleHRCb2R5KFxuICAgIGJvZHk6IEFycmF5QnVmZmVyIHwgQmxvYiB8IHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8XG4gICAgKHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IG51bGwpW10pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdXRvbWF0aWMgY29udmVyc2lvbiB0byB0ZXh0IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIEFycmF5QnVmZmVycy4nKTtcbiAgfVxuICBpZiAodHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnICYmIGJvZHkgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdXRvbWF0aWMgY29udmVyc2lvbiB0byB0ZXh0IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIEJsb2JzLicpO1xuICB9XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShfdG9Kc29uQm9keShib2R5LCAndGV4dCcpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVzcG9uc2UgYm9keSB0byB0aGUgcmVxdWVzdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIF9tYXliZUNvbnZlcnRCb2R5KFxuICAgIHJlc3BvbnNlVHlwZTogc3RyaW5nLCBib2R5OiBBcnJheUJ1ZmZlciB8IEJsb2IgfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfFxuICAgICAgICAoc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgbnVsbClbXSB8IG51bGwpOiBBcnJheUJ1ZmZlcnxCbG9ifHN0cmluZ3xudW1iZXJ8T2JqZWN0fFxuICAgIChzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCBudWxsKVtdfG51bGwge1xuICBpZiAoYm9keSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHN3aXRjaCAocmVzcG9uc2VUeXBlKSB7XG4gICAgY2FzZSAnYXJyYXlidWZmZXInOlxuICAgICAgcmV0dXJuIF90b0FycmF5QnVmZmVyQm9keShib2R5KTtcbiAgICBjYXNlICdibG9iJzpcbiAgICAgIHJldHVybiBfdG9CbG9iKGJvZHkpO1xuICAgIGNhc2UgJ2pzb24nOlxuICAgICAgcmV0dXJuIF90b0pzb25Cb2R5KGJvZHkpO1xuICAgIGNhc2UgJ3RleHQnOlxuICAgICAgcmV0dXJuIF90b1RleHRCb2R5KGJvZHkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHJlc3BvbnNlVHlwZTogJHtyZXNwb25zZVR5cGV9YCk7XG4gIH1cbn1cbiJdfQ==