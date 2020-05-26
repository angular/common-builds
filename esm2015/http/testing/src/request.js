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
 * @publicApi
 */
export class TestRequest {
    constructor(request, observer) {
        this.request = request;
        this.observer = observer;
        /**
         * @internal set by `HttpClientTestingBackend`
         */
        this._cancelled = false;
    }
    /**
     * Whether the request was cancelled after it was sent.
     */
    get cancelled() {
        return this._cancelled;
    }
    /**
     * Resolve the request by returning a body plus additional HTTP information (such as response
     * headers) if provided.
     * If the request specifies an expected body type, the body is converted into the requested type.
     * Otherwise, the body is converted to `JSON` by default.
     *
     * Both successful and unsuccessful responses can be delivered via `flush()`.
     */
    flush(body, opts = {}) {
        if (this.cancelled) {
            throw new Error(`Cannot flush a cancelled request.`);
        }
        const url = this.request.urlWithParams;
        const headers = (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
        body = _maybeConvertBody(this.request.responseType, body);
        let statusText = opts.statusText;
        let status = opts.status !== undefined ? opts.status : 200;
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
            this.observer.next(new HttpResponse({ body, headers, status, statusText, url }));
            this.observer.complete();
        }
        else {
            this.observer.error(new HttpErrorResponse({ error: body, headers, status, statusText, url }));
        }
    }
    /**
     * Resolve the request by returning an `ErrorEvent` (e.g. simulating a network failure).
     */
    error(error, opts = {}) {
        if (this.cancelled) {
            throw new Error(`Cannot return an error for a cancelled request.`);
        }
        if (opts.status && opts.status >= 200 && opts.status < 300) {
            throw new Error(`error() called with a successful status.`);
        }
        const headers = (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
        this.observer.error(new HttpErrorResponse({
            error,
            headers,
            status: opts.status || 0,
            statusText: opts.statusText || '',
            url: this.request.urlWithParams,
        }));
    }
    /**
     * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
     * request.
     */
    event(event) {
        if (this.cancelled) {
            throw new Error(`Cannot send events to a cancelled request.`);
        }
        this.observer.next(event);
    }
}
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
function _toJsonBody(body, format = 'JSON') {
    if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
        throw new Error(`Automatic conversion to ${format} is not supported for ArrayBuffers.`);
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
        throw new Error(`Automatic conversion to ${format} is not supported for Blobs.`);
    }
    if (typeof body === 'string' || typeof body === 'number' || typeof body === 'object' ||
        Array.isArray(body)) {
        return body;
    }
    throw new Error(`Automatic conversion to ${format} is not supported for response type.`);
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
            throw new Error(`Unsupported responseType: ${responseType}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL3JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFhLFdBQVcsRUFBZSxZQUFZLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUcxRzs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxPQUFPLFdBQVc7SUFhdEIsWUFBbUIsT0FBeUIsRUFBVSxRQUFrQztRQUFyRSxZQUFPLEdBQVAsT0FBTyxDQUFrQjtRQUFVLGFBQVEsR0FBUixRQUFRLENBQTBCO1FBTHhGOztXQUVHO1FBQ0gsZUFBVSxHQUFHLEtBQUssQ0FBQztJQUV3RSxDQUFDO0lBWjVGOztPQUVHO0lBQ0gsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFTRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLElBQThFLEVBQUUsT0FJbEYsRUFBRTtRQUNKLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7U0FDdEQ7UUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FDVCxDQUFDLElBQUksQ0FBQyxPQUFPLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6RixJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxVQUFVLEdBQXFCLElBQUksQ0FBQyxVQUFV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NUIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELElBQUksT0FBTyxXQUFXLEtBQUssV0FBVyxJQUFJLElBQUksWUFBWSxXQUFXLEVBQUU7UUFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO0tBQ3BGO0lBQ0QsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxZQUFZLElBQUksRUFBRTtRQUN2RCxNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7S0FDN0U7SUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsaUJBQWlCLENBQ3RCLFlBQW9CLEVBQ3BCLElBQ0k7SUFDTixJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDakIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELFFBQVEsWUFBWSxFQUFFO1FBQ3BCLEtBQUssYUFBYTtZQUNoQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLEtBQUssTUFBTTtZQUNULE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLEtBQUssTUFBTTtZQUNULE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLEtBQUssTUFBTTtZQUNULE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsWUFBWSxFQUFFLENBQUMsQ0FBQztLQUNoRTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEhlYWRlcnMsIEh0dHBSZXF1ZXN0LCBIdHRwUmVzcG9uc2V9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7T2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIEEgbW9jayByZXF1ZXN0cyB0aGF0IHdhcyByZWNlaXZlZCBhbmQgaXMgcmVhZHkgdG8gYmUgYW5zd2VyZWQuXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgYWxsb3dzIGFjY2VzcyB0byB0aGUgdW5kZXJseWluZyBgSHR0cFJlcXVlc3RgLCBhbmQgYWxsb3dzXG4gKiByZXNwb25kaW5nIHdpdGggYEh0dHBFdmVudGBzIG9yIGBIdHRwRXJyb3JSZXNwb25zZWBzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFRlc3RSZXF1ZXN0IHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJlcXVlc3Qgd2FzIGNhbmNlbGxlZCBhZnRlciBpdCB3YXMgc2VudC5cbiAgICovXG4gIGdldCBjYW5jZWxsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbmNlbGxlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWwgc2V0IGJ5IGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgXG4gICAqL1xuICBfY2FuY2VsbGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIHByaXZhdGUgb2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+Pikge31cblxuICAvKipcbiAgICogUmVzb2x2ZSB0aGUgcmVxdWVzdCBieSByZXR1cm5pbmcgYSBib2R5IHBsdXMgYWRkaXRpb25hbCBIVFRQIGluZm9ybWF0aW9uIChzdWNoIGFzIHJlc3BvbnNlXG4gICAqIGhlYWRlcnMpIGlmIHByb3ZpZGVkLlxuICAgKiBJZiB0aGUgcmVxdWVzdCBzcGVjaWZpZXMgYW4gZXhwZWN0ZWQgYm9keSB0eXBlLCB0aGUgYm9keSBpcyBjb252ZXJ0ZWQgaW50byB0aGUgcmVxdWVzdGVkIHR5cGUuXG4gICAqIE90aGVyd2lzZSwgdGhlIGJvZHkgaXMgY29udmVydGVkIHRvIGBKU09OYCBieSBkZWZhdWx0LlxuICAgKlxuICAgKiBCb3RoIHN1Y2Nlc3NmdWwgYW5kIHVuc3VjY2Vzc2Z1bCByZXNwb25zZXMgY2FuIGJlIGRlbGl2ZXJlZCB2aWEgYGZsdXNoKClgLlxuICAgKi9cbiAgZmx1c2goYm9keTogQXJyYXlCdWZmZXJ8QmxvYnxzdHJpbmd8bnVtYmVyfE9iamVjdHwoc3RyaW5nfG51bWJlcnxPYmplY3R8bnVsbClbXXxudWxsLCBvcHRzOiB7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzfHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119LFxuICAgIHN0YXR1cz86IG51bWJlcixcbiAgICBzdGF0dXNUZXh0Pzogc3RyaW5nLFxuICB9ID0ge30pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZsdXNoIGEgY2FuY2VsbGVkIHJlcXVlc3QuYCk7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IHRoaXMucmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuICAgIGNvbnN0IGhlYWRlcnMgPVxuICAgICAgICAob3B0cy5oZWFkZXJzIGluc3RhbmNlb2YgSHR0cEhlYWRlcnMpID8gb3B0cy5oZWFkZXJzIDogbmV3IEh0dHBIZWFkZXJzKG9wdHMuaGVhZGVycyk7XG4gICAgYm9keSA9IF9tYXliZUNvbnZlcnRCb2R5KHRoaXMucmVxdWVzdC5yZXNwb25zZVR5cGUsIGJvZHkpO1xuICAgIGxldCBzdGF0dXNUZXh0OiBzdHJpbmd8dW5kZWZpbmVkID0gb3B0cy5zdGF0dXNUZXh0O1xuICAgIGxldCBzdGF0dXM6IG51bWJlciA9IG9wdHMuc3RhdHVzICE9PSB1bmRlZmluZWQgPyBvcHRzLnN0YXR1cyA6IDIwMDtcbiAgICBpZiAob3B0cy5zdGF0dXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGJvZHkgPT09IG51bGwpIHtcbiAgICAgICAgc3RhdHVzID0gMjA0O1xuICAgICAgICBzdGF0dXNUZXh0ID0gc3RhdHVzVGV4dCB8fCAnTm8gQ29udGVudCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0dXNUZXh0ID0gc3RhdHVzVGV4dCB8fCAnT0snO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RhdHVzVGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0YXR1c1RleHQgaXMgcmVxdWlyZWQgd2hlbiBzZXR0aW5nIGEgY3VzdG9tIHN0YXR1cy4nKTtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwKSB7XG4gICAgICB0aGlzLm9ic2VydmVyLm5leHQobmV3IEh0dHBSZXNwb25zZTxhbnk+KHtib2R5LCBoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICAgIHRoaXMub2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe2Vycm9yOiBib2R5LCBoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZSB0aGUgcmVxdWVzdCBieSByZXR1cm5pbmcgYW4gYEVycm9yRXZlbnRgIChlLmcuIHNpbXVsYXRpbmcgYSBuZXR3b3JrIGZhaWx1cmUpLlxuICAgKi9cbiAgZXJyb3IoZXJyb3I6IEVycm9yRXZlbnQsIG9wdHM6IHtcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnN8e1tuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0sXG4gICAgc3RhdHVzPzogbnVtYmVyLFxuICAgIHN0YXR1c1RleHQ/OiBzdHJpbmcsXG4gIH0gPSB7fSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNhbmNlbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmV0dXJuIGFuIGVycm9yIGZvciBhIGNhbmNlbGxlZCByZXF1ZXN0LmApO1xuICAgIH1cbiAgICBpZiAob3B0cy5zdGF0dXMgJiYgb3B0cy5zdGF0dXMgPj0gMjAwICYmIG9wdHMuc3RhdHVzIDwgMzAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVycm9yKCkgY2FsbGVkIHdpdGggYSBzdWNjZXNzZnVsIHN0YXR1cy5gKTtcbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9XG4gICAgICAgIChvcHRzLmhlYWRlcnMgaW5zdGFuY2VvZiBIdHRwSGVhZGVycykgPyBvcHRzLmhlYWRlcnMgOiBuZXcgSHR0cEhlYWRlcnMob3B0cy5oZWFkZXJzKTtcbiAgICB0aGlzLm9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICBlcnJvcixcbiAgICAgIGhlYWRlcnMsXG4gICAgICBzdGF0dXM6IG9wdHMuc3RhdHVzIHx8IDAsXG4gICAgICBzdGF0dXNUZXh0OiBvcHRzLnN0YXR1c1RleHQgfHwgJycsXG4gICAgICB1cmw6IHRoaXMucmVxdWVzdC51cmxXaXRoUGFyYW1zLFxuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxpdmVyIGFuIGFyYml0cmFyeSBgSHR0cEV2ZW50YCAoc3VjaCBhcyBhIHByb2dyZXNzIGV2ZW50KSBvbiB0aGUgcmVzcG9uc2Ugc3RyZWFtIGZvciB0aGlzXG4gICAqIHJlcXVlc3QuXG4gICAqL1xuICBldmVudChldmVudDogSHR0cEV2ZW50PGFueT4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNlbmQgZXZlbnRzIHRvIGEgY2FuY2VsbGVkIHJlcXVlc3QuYCk7XG4gICAgfVxuICAgIHRoaXMub2JzZXJ2ZXIubmV4dChldmVudCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IGEgcmVzcG9uc2UgYm9keSB0byBhbiBBcnJheUJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gX3RvQXJyYXlCdWZmZXJCb2R5KGJvZHk6IEFycmF5QnVmZmVyfEJsb2J8c3RyaW5nfG51bWJlcnxPYmplY3R8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IG51bGwpW10pOiBBcnJheUJ1ZmZlciB7XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBcnJheUJ1ZmZlciByZXNwb25zZXMgYXJlIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBwbGF0Zm9ybS4nKTtcbiAgfVxuICBpZiAoYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdBdXRvbWF0aWMgY29udmVyc2lvbiB0byBBcnJheUJ1ZmZlciBpcyBub3Qgc3VwcG9ydGVkIGZvciByZXNwb25zZSB0eXBlLicpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IGEgcmVzcG9uc2UgYm9keSB0byBhIEJsb2IuXG4gKi9cbmZ1bmN0aW9uIF90b0Jsb2IoYm9keTogQXJyYXlCdWZmZXJ8QmxvYnxzdHJpbmd8bnVtYmVyfE9iamVjdHxcbiAgICAgICAgICAgICAgICAgKHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IG51bGwpW10pOiBCbG9iIHtcbiAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBFcnJvcignQmxvYiByZXNwb25zZXMgYXJlIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBwbGF0Zm9ybS4nKTtcbiAgfVxuICBpZiAoYm9keSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuICBpZiAoQXJyYXlCdWZmZXIgJiYgYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtib2R5XSk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdBdXRvbWF0aWMgY29udmVyc2lvbiB0byBCbG9iIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHJlc3BvbnNlIHR5cGUuJyk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgYSByZXNwb25zZSBib2R5IHRvIEpTT04gZGF0YS5cbiAqL1xuZnVuY3Rpb24gX3RvSnNvbkJvZHkoXG4gICAgYm9keTogQXJyYXlCdWZmZXJ8QmxvYnxzdHJpbmd8bnVtYmVyfE9iamVjdHwoc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgbnVsbClbXSxcbiAgICBmb3JtYXQ6IHN0cmluZyA9ICdKU09OJyk6IE9iamVjdHxzdHJpbmd8bnVtYmVyfChPYmplY3QgfCBzdHJpbmcgfCBudW1iZXIpW10ge1xuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEF1dG9tYXRpYyBjb252ZXJzaW9uIHRvICR7Zm9ybWF0fSBpcyBub3Qgc3VwcG9ydGVkIGZvciBBcnJheUJ1ZmZlcnMuYCk7XG4gIH1cbiAgaWYgKHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJyAmJiBib2R5IGluc3RhbmNlb2YgQmxvYikge1xuICAgIHRocm93IG5ldyBFcnJvcihgQXV0b21hdGljIGNvbnZlcnNpb24gdG8gJHtmb3JtYXR9IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIEJsb2JzLmApO1xuICB9XG4gIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGJvZHkgPT09ICdudW1iZXInIHx8IHR5cGVvZiBib2R5ID09PSAnb2JqZWN0JyB8fFxuICAgICAgQXJyYXkuaXNBcnJheShib2R5KSkge1xuICAgIHJldHVybiBib2R5O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgQXV0b21hdGljIGNvbnZlcnNpb24gdG8gJHtmb3JtYXR9IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHJlc3BvbnNlIHR5cGUuYCk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgYSByZXNwb25zZSBib2R5IHRvIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBfdG9UZXh0Qm9keShib2R5OiBBcnJheUJ1ZmZlcnxCbG9ifHN0cmluZ3xudW1iZXJ8T2JqZWN0fFxuICAgICAgICAgICAgICAgICAgICAgKHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IG51bGwpW10pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdXRvbWF0aWMgY29udmVyc2lvbiB0byB0ZXh0IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIEFycmF5QnVmZmVycy4nKTtcbiAgfVxuICBpZiAodHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnICYmIGJvZHkgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdXRvbWF0aWMgY29udmVyc2lvbiB0byB0ZXh0IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIEJsb2JzLicpO1xuICB9XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShfdG9Kc29uQm9keShib2R5LCAndGV4dCcpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVzcG9uc2UgYm9keSB0byB0aGUgcmVxdWVzdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIF9tYXliZUNvbnZlcnRCb2R5KFxuICAgIHJlc3BvbnNlVHlwZTogc3RyaW5nLFxuICAgIGJvZHk6IEFycmF5QnVmZmVyfEJsb2J8c3RyaW5nfG51bWJlcnxPYmplY3R8KHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IG51bGwpW118XG4gICAgbnVsbCk6IEFycmF5QnVmZmVyfEJsb2J8c3RyaW5nfG51bWJlcnxPYmplY3R8KHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IG51bGwpW118bnVsbCB7XG4gIGlmIChib2R5ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgc3dpdGNoIChyZXNwb25zZVR5cGUpIHtcbiAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICByZXR1cm4gX3RvQXJyYXlCdWZmZXJCb2R5KGJvZHkpO1xuICAgIGNhc2UgJ2Jsb2InOlxuICAgICAgcmV0dXJuIF90b0Jsb2IoYm9keSk7XG4gICAgY2FzZSAnanNvbic6XG4gICAgICByZXR1cm4gX3RvSnNvbkJvZHkoYm9keSk7XG4gICAgY2FzZSAndGV4dCc6XG4gICAgICByZXR1cm4gX3RvVGV4dEJvZHkoYm9keSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgcmVzcG9uc2VUeXBlOiAke3Jlc3BvbnNlVHlwZX1gKTtcbiAgfVxufVxuIl19