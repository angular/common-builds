/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
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
 * \@stable
 */
var /**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 * \@stable
 */
TestRequest = /** @class */ (function () {
    function TestRequest(request, observer) {
        this.request = request;
        this.observer = observer;
        /**
         * \@internal set by `HttpClientTestingBackend`
         */
        this._cancelled = false;
    }
    Object.defineProperty(TestRequest.prototype, "cancelled", {
        /**
         * Whether the request was cancelled after it was sent.
         */
        get: /**
         * Whether the request was cancelled after it was sent.
         * @return {?}
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
     * @param {?} body
     * @param {?=} opts
     * @return {?}
     */
    TestRequest.prototype.flush = /**
     * Resolve the request by returning a body plus additional HTTP information (such as response
     * headers) if provided.
     *
     * Both successful and unsuccessful responses can be delivered via `flush()`.
     * @param {?} body
     * @param {?=} opts
     * @return {?}
     */
    function (body, opts) {
        if (opts === void 0) { opts = {}; }
        if (this.cancelled) {
            throw new Error("Cannot flush a cancelled request.");
        }
        var /** @type {?} */ url = this.request.urlWithParams;
        var /** @type {?} */ headers = (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
        body = _maybeConvertBody(this.request.responseType, body);
        var /** @type {?} */ statusText = opts.statusText;
        var /** @type {?} */ status = opts.status !== undefined ? opts.status : 200;
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
     * @param {?} error
     * @param {?=} opts
     * @return {?}
     */
    TestRequest.prototype.error = /**
     * Resolve the request by returning an `ErrorEvent` (e.g. simulating a network failure).
     * @param {?} error
     * @param {?=} opts
     * @return {?}
     */
    function (error, opts) {
        if (opts === void 0) { opts = {}; }
        if (this.cancelled) {
            throw new Error("Cannot return an error for a cancelled request.");
        }
        if (opts.status && opts.status >= 200 && opts.status < 300) {
            throw new Error("error() called with a successful status.");
        }
        var /** @type {?} */ headers = (opts.headers instanceof HttpHeaders) ? opts.headers : new HttpHeaders(opts.headers);
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
     * @param {?} event
     * @return {?}
     */
    TestRequest.prototype.event = /**
     * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
     * request.
     * @param {?} event
     * @return {?}
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
 * \@stable
 */
export { TestRequest };
function TestRequest_tsickle_Closure_declarations() {
    /**
     * \@internal set by `HttpClientTestingBackend`
     * @type {?}
     */
    TestRequest.prototype._cancelled;
    /** @type {?} */
    TestRequest.prototype.request;
    /** @type {?} */
    TestRequest.prototype.observer;
}
/**
 * Helper function to convert a response body to an ArrayBuffer.
 * @param {?} body
 * @return {?}
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
 * @param {?} body
 * @return {?}
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
 * @param {?} body
 * @param {?=} format
 * @return {?}
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
 * @param {?} body
 * @return {?}
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
 * @param {?} responseType
 * @param {?} body
 * @return {?}
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
//# sourceMappingURL=request.js.map