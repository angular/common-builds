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
import { HttpHeaders } from './headers';
/** @enum {number} */
var HttpEventType = {
    /**
       * The request was sent out over the wire.
       */
    Sent: 0,
    /**
       * An upload progress event was received.
       */
    UploadProgress: 1,
    /**
       * The response status code and headers were received.
       */
    ResponseHeader: 2,
    /**
       * A download progress event was received.
       */
    DownloadProgress: 3,
    /**
       * The full response including the body was received.
       */
    Response: 4,
    /**
       * A custom event from an interceptor or a backend.
       */
    User: 5,
};
export { HttpEventType };
HttpEventType[HttpEventType.Sent] = 'Sent';
HttpEventType[HttpEventType.UploadProgress] = 'UploadProgress';
HttpEventType[HttpEventType.ResponseHeader] = 'ResponseHeader';
HttpEventType[HttpEventType.DownloadProgress] = 'DownloadProgress';
HttpEventType[HttpEventType.Response] = 'Response';
HttpEventType[HttpEventType.User] = 'User';
/**
 * Base interface for progress events.
 *
 *
 * @record
 */
export function HttpProgressEvent() { }
/**
 * Progress event type is either upload or download.
 * @type {?}
 */
HttpProgressEvent.prototype.type;
/**
 * Number of bytes uploaded or downloaded.
 * @type {?}
 */
HttpProgressEvent.prototype.loaded;
/**
 * Total number of bytes to upload or download. Depending on the request or
 * response, this may not be computable and thus may not be present.
 * @type {?|undefined}
 */
HttpProgressEvent.prototype.total;
/**
 * A download progress event.
 *
 *
 * @record
 */
export function HttpDownloadProgressEvent() { }
/** @type {?} */
HttpDownloadProgressEvent.prototype.type;
/**
 * The partial response body as downloaded so far.
 *
 * Only present if the responseType was `text`.
 * @type {?|undefined}
 */
HttpDownloadProgressEvent.prototype.partialText;
/**
 * An upload progress event.
 *
 *
 * @record
 */
export function HttpUploadProgressEvent() { }
/** @type {?} */
HttpUploadProgressEvent.prototype.type;
/**
 * An event indicating that the request was sent to the server. Useful
 * when a request may be retried multiple times, to distinguish between
 * retries on the final event stream.
 *
 *
 * @record
 */
export function HttpSentEvent() { }
/** @type {?} */
HttpSentEvent.prototype.type;
/**
 * A user-defined event.
 *
 * Grouping all custom events under this type ensures they will be handled
 * and forwarded by all implementations of interceptors.
 *
 *
 * @record
 * @template T
 */
export function HttpUserEvent() { }
/** @type {?} */
HttpUserEvent.prototype.type;
/**
 * An error that represents a failed attempt to JSON.parse text coming back
 * from the server.
 *
 * It bundles the Error object with the actual response body that failed to parse.
 *
 *
 * @record
 */
export function HttpJsonParseError() { }
/** @type {?} */
HttpJsonParseError.prototype.error;
/** @type {?} */
HttpJsonParseError.prototype.text;
/** @typedef {?} */
var HttpEvent;
export { HttpEvent };
/**
 * Base class for both `HttpResponse` and `HttpHeaderResponse`.
 *
 *
 * @abstract
 */
export class HttpResponseBase {
    /**
     * Super-constructor for all responses.
     *
     * The single parameter accepted is an initialization hash. Any properties
     * of the response passed there will override the default values.
     * @param {?} init
     * @param {?=} defaultStatus
     * @param {?=} defaultStatusText
     */
    constructor(init, defaultStatus = 200, defaultStatusText = 'OK') {
        // If the hash has values passed, use them to initialize the response.
        // Otherwise use the default values.
        this.headers = init.headers || new HttpHeaders();
        this.status = init.status !== undefined ? init.status : defaultStatus;
        this.statusText = init.statusText || defaultStatusText;
        this.url = init.url || null;
        // Cache the ok value to avoid defining a getter.
        this.ok = this.status >= 200 && this.status < 300;
    }
}
if (false) {
    /**
     * All response headers.
     * @type {?}
     */
    HttpResponseBase.prototype.headers;
    /**
     * Response status code.
     * @type {?}
     */
    HttpResponseBase.prototype.status;
    /**
     * Textual description of response status code.
     *
     * Do not depend on this.
     * @type {?}
     */
    HttpResponseBase.prototype.statusText;
    /**
     * URL of the resource retrieved, or null if not available.
     * @type {?}
     */
    HttpResponseBase.prototype.url;
    /**
     * Whether the status code falls in the 2xx range.
     * @type {?}
     */
    HttpResponseBase.prototype.ok;
    /**
     * Type of the response, narrowed to either the full response or the header.
     * @type {?}
     */
    HttpResponseBase.prototype.type;
}
/**
 * A partial HTTP response which only includes the status and header data,
 * but no response body.
 *
 * `HttpHeaderResponse` is a `HttpEvent` available on the response
 * event stream, only when progress events are requested.
 *
 *
 */
export class HttpHeaderResponse extends HttpResponseBase {
    /**
     * Create a new `HttpHeaderResponse` with the given parameters.
     * @param {?=} init
     */
    constructor(init = {}) {
        super(init);
        this.type = HttpEventType.ResponseHeader;
    }
    /**
     * Copy this `HttpHeaderResponse`, overriding its contents with the
     * given parameter hash.
     * @param {?=} update
     * @return {?}
     */
    clone(update = {}) {
        // Perform a straightforward initialization of the new HttpHeaderResponse,
        // overriding the current parameters with new ones if given.
        return new HttpHeaderResponse({
            headers: update.headers || this.headers,
            status: update.status !== undefined ? update.status : this.status,
            statusText: update.statusText || this.statusText,
            url: update.url || this.url || undefined,
        });
    }
}
if (false) {
    /** @type {?} */
    HttpHeaderResponse.prototype.type;
}
/**
 * A full HTTP response, including a typed response body (which may be `null`
 * if one was not returned).
 *
 * `HttpResponse` is a `HttpEvent` available on the response event
 * stream.
 *
 *
 * @template T
 */
export class HttpResponse extends HttpResponseBase {
    /**
     * Construct a new `HttpResponse`.
     * @param {?=} init
     */
    constructor(init = {}) {
        super(init);
        this.type = HttpEventType.Response;
        this.body = init.body !== undefined ? init.body : null;
    }
    /**
     * @param {?=} update
     * @return {?}
     */
    clone(update = {}) {
        return new HttpResponse({
            body: (update.body !== undefined) ? update.body : this.body,
            headers: update.headers || this.headers,
            status: (update.status !== undefined) ? update.status : this.status,
            statusText: update.statusText || this.statusText,
            url: update.url || this.url || undefined,
        });
    }
}
if (false) {
    /**
     * The response body, or `null` if one was not returned.
     * @type {?}
     */
    HttpResponse.prototype.body;
    /** @type {?} */
    HttpResponse.prototype.type;
}
/**
 * A response that represents an error or failure, either from a
 * non-successful HTTP status, an error while executing the request,
 * or some other failure which occurred during the parsing of the response.
 *
 * Any error returned on the `Observable` response stream will be
 * wrapped in an `HttpErrorResponse` to provide additional context about
 * the state of the HTTP layer when the error occurred. The error property
 * will contain either a wrapped Error object or the error response returned
 * from the server.
 *
 *
 */
export class HttpErrorResponse extends HttpResponseBase {
    /**
     * @param {?} init
     */
    constructor(init) {
        // Initialize with a default status of 0 / Unknown Error.
        super(init, 0, 'Unknown Error');
        this.name = 'HttpErrorResponse';
        /**
         * Errors are never okay, even when the status code is in the 2xx success range.
         */
        this.ok = false;
        // If the response was successful, then this was a parse error. Otherwise, it was
        // a protocol-level failure of some sort. Either the request failed in transit
        // or the server returned an unsuccessful status code.
        if (this.status >= 200 && this.status < 300) {
            this.message = `Http failure during parsing for ${init.url || '(unknown url)'}`;
        }
        else {
            this.message =
                `Http failure response for ${init.url || '(unknown url)'}: ${init.status} ${init.statusText}`;
        }
        this.error = init.error || null;
    }
}
if (false) {
    /** @type {?} */
    HttpErrorResponse.prototype.name;
    /** @type {?} */
    HttpErrorResponse.prototype.message;
    /** @type {?} */
    HttpErrorResponse.prototype.error;
    /**
     * Errors are never okay, even when the status code is in the 2xx success range.
     * @type {?}
     */
    HttpErrorResponse.prototype.ok;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvcmVzcG9uc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDOzs7Ozs7SUFXcEMsT0FBSTs7OztJQUtKLGlCQUFjOzs7O0lBS2QsaUJBQWM7Ozs7SUFLZCxtQkFBZ0I7Ozs7SUFLaEIsV0FBUTs7OztJQUtSLE9BQUk7Ozs0QkF6QkosSUFBSTs0QkFLSixjQUFjOzRCQUtkLGNBQWM7NEJBS2QsZ0JBQWdCOzRCQUtoQixRQUFROzRCQUtSLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtHTixNQUFNLE9BQWdCLGdCQUFnQjs7Ozs7Ozs7OztJQXdDcEMsWUFDSSxJQUtDLEVBQ0QsZ0JBQXdCLEdBQUcsRUFBRSxvQkFBNEIsSUFBSTs7O1FBRy9ELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUN0RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksaUJBQWlCLENBQUM7UUFDdkQsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQzs7UUFHNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztLQUNuRDtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVdELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxnQkFBZ0I7Ozs7O0lBSXRELFlBQVksT0FLUixFQUFFO1FBQ0osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUdnQyxhQUFhLENBQUMsY0FBYztLQUZ6RTs7Ozs7OztJQVFELEtBQUssQ0FBQyxTQUF1RixFQUFFOzs7UUFJN0YsT0FBTyxJQUFJLGtCQUFrQixDQUFDO1lBQzVCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPO1lBQ3ZDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU07WUFDakUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVU7WUFDaEQsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxTQUFTO1NBQ3pDLENBQUMsQ0FBQztLQUNKO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7OztBQVdELE1BQU0sT0FBTyxZQUFnQixTQUFRLGdCQUFnQjs7Ozs7SUFTbkQsWUFBWSxPQUVSLEVBQUU7UUFDSixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBSTBCLGFBQWEsQ0FBQyxRQUFRO1FBSDVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztLQUN4RDs7Ozs7SUFVRCxLQUFLLENBQUMsU0FFRixFQUFFO1FBQ0osT0FBTyxJQUFJLFlBQVksQ0FBTTtZQUMzQixJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUMzRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTztZQUN2QyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUNuRSxVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVTtZQUNoRCxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLFNBQVM7U0FDekMsQ0FBQyxDQUFDO0tBQ0o7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlRCxNQUFNLE9BQU8saUJBQWtCLFNBQVEsZ0JBQWdCOzs7O0lBVXJELFlBQVksSUFFWDs7UUFFQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztvQkFibEIsbUJBQW1COzs7O2tCQU9yQixLQUFLOzs7O1FBV2pCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7WUFDM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxtQ0FBbUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztTQUNqRjthQUFNO1lBQ0wsSUFBSSxDQUFDLE9BQU87Z0JBQ1IsNkJBQTZCLElBQUksQ0FBQyxHQUFHLElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ25HO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztLQUNqQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuXG4vKipcbiAqIFR5cGUgZW51bWVyYXRpb24gZm9yIHRoZSBkaWZmZXJlbnQga2luZHMgb2YgYEh0dHBFdmVudGAuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGVudW0gSHR0cEV2ZW50VHlwZSB7XG4gIC8qKlxuICAgKiBUaGUgcmVxdWVzdCB3YXMgc2VudCBvdXQgb3ZlciB0aGUgd2lyZS5cbiAgICovXG4gIFNlbnQsXG5cbiAgLyoqXG4gICAqIEFuIHVwbG9hZCBwcm9ncmVzcyBldmVudCB3YXMgcmVjZWl2ZWQuXG4gICAqL1xuICBVcGxvYWRQcm9ncmVzcyxcblxuICAvKipcbiAgICogVGhlIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGFuZCBoZWFkZXJzIHdlcmUgcmVjZWl2ZWQuXG4gICAqL1xuICBSZXNwb25zZUhlYWRlcixcblxuICAvKipcbiAgICogQSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCB3YXMgcmVjZWl2ZWQuXG4gICAqL1xuICBEb3dubG9hZFByb2dyZXNzLFxuXG4gIC8qKlxuICAgKiBUaGUgZnVsbCByZXNwb25zZSBpbmNsdWRpbmcgdGhlIGJvZHkgd2FzIHJlY2VpdmVkLlxuICAgKi9cbiAgUmVzcG9uc2UsXG5cbiAgLyoqXG4gICAqIEEgY3VzdG9tIGV2ZW50IGZyb20gYW4gaW50ZXJjZXB0b3Igb3IgYSBiYWNrZW5kLlxuICAgKi9cbiAgVXNlcixcbn1cblxuLyoqXG4gKiBCYXNlIGludGVyZmFjZSBmb3IgcHJvZ3Jlc3MgZXZlbnRzLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cFByb2dyZXNzRXZlbnQge1xuICAvKipcbiAgICogUHJvZ3Jlc3MgZXZlbnQgdHlwZSBpcyBlaXRoZXIgdXBsb2FkIG9yIGRvd25sb2FkLlxuICAgKi9cbiAgdHlwZTogSHR0cEV2ZW50VHlwZS5Eb3dubG9hZFByb2dyZXNzfEh0dHBFdmVudFR5cGUuVXBsb2FkUHJvZ3Jlc3M7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBieXRlcyB1cGxvYWRlZCBvciBkb3dubG9hZGVkLlxuICAgKi9cbiAgbG9hZGVkOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRvdGFsIG51bWJlciBvZiBieXRlcyB0byB1cGxvYWQgb3IgZG93bmxvYWQuIERlcGVuZGluZyBvbiB0aGUgcmVxdWVzdCBvclxuICAgKiByZXNwb25zZSwgdGhpcyBtYXkgbm90IGJlIGNvbXB1dGFibGUgYW5kIHRodXMgbWF5IG5vdCBiZSBwcmVzZW50LlxuICAgKi9cbiAgdG90YWw/OiBudW1iZXI7XG59XG5cbi8qKlxuICogQSBkb3dubG9hZCBwcm9ncmVzcyBldmVudC5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQgZXh0ZW5kcyBIdHRwUHJvZ3Jlc3NFdmVudCB7XG4gIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcztcblxuICAvKipcbiAgICogVGhlIHBhcnRpYWwgcmVzcG9uc2UgYm9keSBhcyBkb3dubG9hZGVkIHNvIGZhci5cbiAgICpcbiAgICogT25seSBwcmVzZW50IGlmIHRoZSByZXNwb25zZVR5cGUgd2FzIGB0ZXh0YC5cbiAgICovXG4gIHBhcnRpYWxUZXh0Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEFuIHVwbG9hZCBwcm9ncmVzcyBldmVudC5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBVcGxvYWRQcm9ncmVzc0V2ZW50IGV4dGVuZHMgSHR0cFByb2dyZXNzRXZlbnQge1xuICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzO1xufVxuXG4vKipcbiAqIEFuIGV2ZW50IGluZGljYXRpbmcgdGhhdCB0aGUgcmVxdWVzdCB3YXMgc2VudCB0byB0aGUgc2VydmVyLiBVc2VmdWxcbiAqIHdoZW4gYSByZXF1ZXN0IG1heSBiZSByZXRyaWVkIG11bHRpcGxlIHRpbWVzLCB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuXG4gKiByZXRyaWVzIG9uIHRoZSBmaW5hbCBldmVudCBzdHJlYW0uXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwU2VudEV2ZW50IHsgdHlwZTogSHR0cEV2ZW50VHlwZS5TZW50OyB9XG5cbi8qKlxuICogQSB1c2VyLWRlZmluZWQgZXZlbnQuXG4gKlxuICogR3JvdXBpbmcgYWxsIGN1c3RvbSBldmVudHMgdW5kZXIgdGhpcyB0eXBlIGVuc3VyZXMgdGhleSB3aWxsIGJlIGhhbmRsZWRcbiAqIGFuZCBmb3J3YXJkZWQgYnkgYWxsIGltcGxlbWVudGF0aW9ucyBvZiBpbnRlcmNlcHRvcnMuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwVXNlckV2ZW50PFQ+IHsgdHlwZTogSHR0cEV2ZW50VHlwZS5Vc2VyOyB9XG5cbi8qKlxuICogQW4gZXJyb3IgdGhhdCByZXByZXNlbnRzIGEgZmFpbGVkIGF0dGVtcHQgdG8gSlNPTi5wYXJzZSB0ZXh0IGNvbWluZyBiYWNrXG4gKiBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogSXQgYnVuZGxlcyB0aGUgRXJyb3Igb2JqZWN0IHdpdGggdGhlIGFjdHVhbCByZXNwb25zZSBib2R5IHRoYXQgZmFpbGVkIHRvIHBhcnNlLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cEpzb25QYXJzZUVycm9yIHtcbiAgZXJyb3I6IEVycm9yO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogVW5pb24gdHlwZSBmb3IgYWxsIHBvc3NpYmxlIGV2ZW50cyBvbiB0aGUgcmVzcG9uc2Ugc3RyZWFtLlxuICpcbiAqIFR5cGVkIGFjY29yZGluZyB0byB0aGUgZXhwZWN0ZWQgdHlwZSBvZiB0aGUgcmVzcG9uc2UuXG4gKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEV2ZW50PFQ+ID1cbiAgICBIdHRwU2VudEV2ZW50IHwgSHR0cEhlYWRlclJlc3BvbnNlIHwgSHR0cFJlc3BvbnNlPFQ+fCBIdHRwUHJvZ3Jlc3NFdmVudCB8IEh0dHBVc2VyRXZlbnQ8VD47XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYm90aCBgSHR0cFJlc3BvbnNlYCBhbmQgYEh0dHBIZWFkZXJSZXNwb25zZWAuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEh0dHBSZXNwb25zZUJhc2Uge1xuICAvKipcbiAgICogQWxsIHJlc3BvbnNlIGhlYWRlcnMuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJzOiBIdHRwSGVhZGVycztcblxuICAvKipcbiAgICogUmVzcG9uc2Ugc3RhdHVzIGNvZGUuXG4gICAqL1xuICByZWFkb25seSBzdGF0dXM6IG51bWJlcjtcblxuICAvKipcbiAgICogVGV4dHVhbCBkZXNjcmlwdGlvbiBvZiByZXNwb25zZSBzdGF0dXMgY29kZS5cbiAgICpcbiAgICogRG8gbm90IGRlcGVuZCBvbiB0aGlzLlxuICAgKi9cbiAgcmVhZG9ubHkgc3RhdHVzVGV4dDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBVUkwgb2YgdGhlIHJlc291cmNlIHJldHJpZXZlZCwgb3IgbnVsbCBpZiBub3QgYXZhaWxhYmxlLlxuICAgKi9cbiAgcmVhZG9ubHkgdXJsOiBzdHJpbmd8bnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RhdHVzIGNvZGUgZmFsbHMgaW4gdGhlIDJ4eCByYW5nZS5cbiAgICovXG4gIHJlYWRvbmx5IG9rOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUeXBlIG9mIHRoZSByZXNwb25zZSwgbmFycm93ZWQgdG8gZWl0aGVyIHRoZSBmdWxsIHJlc3BvbnNlIG9yIHRoZSBoZWFkZXIuXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVhZG9ubHkgdHlwZSAhOiBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlIHwgSHR0cEV2ZW50VHlwZS5SZXNwb25zZUhlYWRlcjtcblxuICAvKipcbiAgICogU3VwZXItY29uc3RydWN0b3IgZm9yIGFsbCByZXNwb25zZXMuXG4gICAqXG4gICAqIFRoZSBzaW5nbGUgcGFyYW1ldGVyIGFjY2VwdGVkIGlzIGFuIGluaXRpYWxpemF0aW9uIGhhc2guIEFueSBwcm9wZXJ0aWVzXG4gICAqIG9mIHRoZSByZXNwb25zZSBwYXNzZWQgdGhlcmUgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCB2YWx1ZXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGluaXQ6IHtcbiAgICAgICAgaGVhZGVycz86IEh0dHBIZWFkZXJzLFxuICAgICAgICBzdGF0dXM/OiBudW1iZXIsXG4gICAgICAgIHN0YXR1c1RleHQ/OiBzdHJpbmcsXG4gICAgICAgIHVybD86IHN0cmluZyxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0U3RhdHVzOiBudW1iZXIgPSAyMDAsIGRlZmF1bHRTdGF0dXNUZXh0OiBzdHJpbmcgPSAnT0snKSB7XG4gICAgLy8gSWYgdGhlIGhhc2ggaGFzIHZhbHVlcyBwYXNzZWQsIHVzZSB0aGVtIHRvIGluaXRpYWxpemUgdGhlIHJlc3BvbnNlLlxuICAgIC8vIE90aGVyd2lzZSB1c2UgdGhlIGRlZmF1bHQgdmFsdWVzLlxuICAgIHRoaXMuaGVhZGVycyA9IGluaXQuaGVhZGVycyB8fCBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICB0aGlzLnN0YXR1cyA9IGluaXQuc3RhdHVzICE9PSB1bmRlZmluZWQgPyBpbml0LnN0YXR1cyA6IGRlZmF1bHRTdGF0dXM7XG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gaW5pdC5zdGF0dXNUZXh0IHx8IGRlZmF1bHRTdGF0dXNUZXh0O1xuICAgIHRoaXMudXJsID0gaW5pdC51cmwgfHwgbnVsbDtcblxuICAgIC8vIENhY2hlIHRoZSBvayB2YWx1ZSB0byBhdm9pZCBkZWZpbmluZyBhIGdldHRlci5cbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwO1xuICB9XG59XG5cbi8qKlxuICogQSBwYXJ0aWFsIEhUVFAgcmVzcG9uc2Ugd2hpY2ggb25seSBpbmNsdWRlcyB0aGUgc3RhdHVzIGFuZCBoZWFkZXIgZGF0YSxcbiAqIGJ1dCBubyByZXNwb25zZSBib2R5LlxuICpcbiAqIGBIdHRwSGVhZGVyUmVzcG9uc2VgIGlzIGEgYEh0dHBFdmVudGAgYXZhaWxhYmxlIG9uIHRoZSByZXNwb25zZVxuICogZXZlbnQgc3RyZWFtLCBvbmx5IHdoZW4gcHJvZ3Jlc3MgZXZlbnRzIGFyZSByZXF1ZXN0ZWQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBIZWFkZXJSZXNwb25zZSBleHRlbmRzIEh0dHBSZXNwb25zZUJhc2Uge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBIdHRwSGVhZGVyUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIHBhcmFtZXRlcnMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihpbml0OiB7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzLFxuICAgIHN0YXR1cz86IG51bWJlcixcbiAgICBzdGF0dXNUZXh0Pzogc3RyaW5nLFxuICAgIHVybD86IHN0cmluZyxcbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoaW5pdCk7XG4gIH1cblxuICByZWFkb25seSB0eXBlOiBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlSGVhZGVyID0gSHR0cEV2ZW50VHlwZS5SZXNwb25zZUhlYWRlcjtcblxuICAvKipcbiAgICogQ29weSB0aGlzIGBIdHRwSGVhZGVyUmVzcG9uc2VgLCBvdmVycmlkaW5nIGl0cyBjb250ZW50cyB3aXRoIHRoZVxuICAgKiBnaXZlbiBwYXJhbWV0ZXIgaGFzaC5cbiAgICovXG4gIGNsb25lKHVwZGF0ZToge2hlYWRlcnM/OiBIdHRwSGVhZGVyczsgc3RhdHVzPzogbnVtYmVyOyBzdGF0dXNUZXh0Pzogc3RyaW5nOyB1cmw/OiBzdHJpbmc7fSA9IHt9KTpcbiAgICAgIEh0dHBIZWFkZXJSZXNwb25zZSB7XG4gICAgLy8gUGVyZm9ybSBhIHN0cmFpZ2h0Zm9yd2FyZCBpbml0aWFsaXphdGlvbiBvZiB0aGUgbmV3IEh0dHBIZWFkZXJSZXNwb25zZSxcbiAgICAvLyBvdmVycmlkaW5nIHRoZSBjdXJyZW50IHBhcmFtZXRlcnMgd2l0aCBuZXcgb25lcyBpZiBnaXZlbi5cbiAgICByZXR1cm4gbmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7XG4gICAgICBoZWFkZXJzOiB1cGRhdGUuaGVhZGVycyB8fCB0aGlzLmhlYWRlcnMsXG4gICAgICBzdGF0dXM6IHVwZGF0ZS5zdGF0dXMgIT09IHVuZGVmaW5lZCA/IHVwZGF0ZS5zdGF0dXMgOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHVwZGF0ZS5zdGF0dXNUZXh0IHx8IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIHVybDogdXBkYXRlLnVybCB8fCB0aGlzLnVybCB8fCB1bmRlZmluZWQsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGZ1bGwgSFRUUCByZXNwb25zZSwgaW5jbHVkaW5nIGEgdHlwZWQgcmVzcG9uc2UgYm9keSAod2hpY2ggbWF5IGJlIGBudWxsYFxuICogaWYgb25lIHdhcyBub3QgcmV0dXJuZWQpLlxuICpcbiAqIGBIdHRwUmVzcG9uc2VgIGlzIGEgYEh0dHBFdmVudGAgYXZhaWxhYmxlIG9uIHRoZSByZXNwb25zZSBldmVudFxuICogc3RyZWFtLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwUmVzcG9uc2U8VD4gZXh0ZW5kcyBIdHRwUmVzcG9uc2VCYXNlIHtcbiAgLyoqXG4gICAqIFRoZSByZXNwb25zZSBib2R5LCBvciBgbnVsbGAgaWYgb25lIHdhcyBub3QgcmV0dXJuZWQuXG4gICAqL1xuICByZWFkb25seSBib2R5OiBUfG51bGw7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBgSHR0cFJlc3BvbnNlYC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGluaXQ6IHtcbiAgICBib2R5PzogVCB8IG51bGwsIGhlYWRlcnM/OiBIdHRwSGVhZGVyczsgc3RhdHVzPzogbnVtYmVyOyBzdGF0dXNUZXh0Pzogc3RyaW5nOyB1cmw/OiBzdHJpbmc7XG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKGluaXQpO1xuICAgIHRoaXMuYm9keSA9IGluaXQuYm9keSAhPT0gdW5kZWZpbmVkID8gaW5pdC5ib2R5IDogbnVsbDtcbiAgfVxuXG4gIHJlYWRvbmx5IHR5cGU6IEh0dHBFdmVudFR5cGUuUmVzcG9uc2UgPSBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlO1xuXG4gIGNsb25lKCk6IEh0dHBSZXNwb25zZTxUPjtcbiAgY2xvbmUodXBkYXRlOiB7aGVhZGVycz86IEh0dHBIZWFkZXJzOyBzdGF0dXM/OiBudW1iZXI7IHN0YXR1c1RleHQ/OiBzdHJpbmc7IHVybD86IHN0cmluZzt9KTpcbiAgICAgIEh0dHBSZXNwb25zZTxUPjtcbiAgY2xvbmU8Vj4odXBkYXRlOiB7XG4gICAgYm9keT86IFYgfCBudWxsLCBoZWFkZXJzPzogSHR0cEhlYWRlcnM7IHN0YXR1cz86IG51bWJlcjsgc3RhdHVzVGV4dD86IHN0cmluZzsgdXJsPzogc3RyaW5nO1xuICB9KTogSHR0cFJlc3BvbnNlPFY+O1xuICBjbG9uZSh1cGRhdGU6IHtcbiAgICBib2R5PzogYW55IHwgbnVsbDsgaGVhZGVycz86IEh0dHBIZWFkZXJzOyBzdGF0dXM/OiBudW1iZXI7IHN0YXR1c1RleHQ/OiBzdHJpbmc7IHVybD86IHN0cmluZztcbiAgfSA9IHt9KTogSHR0cFJlc3BvbnNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgSHR0cFJlc3BvbnNlPGFueT4oe1xuICAgICAgYm9keTogKHVwZGF0ZS5ib2R5ICE9PSB1bmRlZmluZWQpID8gdXBkYXRlLmJvZHkgOiB0aGlzLmJvZHksXG4gICAgICBoZWFkZXJzOiB1cGRhdGUuaGVhZGVycyB8fCB0aGlzLmhlYWRlcnMsXG4gICAgICBzdGF0dXM6ICh1cGRhdGUuc3RhdHVzICE9PSB1bmRlZmluZWQpID8gdXBkYXRlLnN0YXR1cyA6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdXBkYXRlLnN0YXR1c1RleHQgfHwgdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgdXJsOiB1cGRhdGUudXJsIHx8IHRoaXMudXJsIHx8IHVuZGVmaW5lZCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgcmVzcG9uc2UgdGhhdCByZXByZXNlbnRzIGFuIGVycm9yIG9yIGZhaWx1cmUsIGVpdGhlciBmcm9tIGFcbiAqIG5vbi1zdWNjZXNzZnVsIEhUVFAgc3RhdHVzLCBhbiBlcnJvciB3aGlsZSBleGVjdXRpbmcgdGhlIHJlcXVlc3QsXG4gKiBvciBzb21lIG90aGVyIGZhaWx1cmUgd2hpY2ggb2NjdXJyZWQgZHVyaW5nIHRoZSBwYXJzaW5nIG9mIHRoZSByZXNwb25zZS5cbiAqXG4gKiBBbnkgZXJyb3IgcmV0dXJuZWQgb24gdGhlIGBPYnNlcnZhYmxlYCByZXNwb25zZSBzdHJlYW0gd2lsbCBiZVxuICogd3JhcHBlZCBpbiBhbiBgSHR0cEVycm9yUmVzcG9uc2VgIHRvIHByb3ZpZGUgYWRkaXRpb25hbCBjb250ZXh0IGFib3V0XG4gKiB0aGUgc3RhdGUgb2YgdGhlIEhUVFAgbGF5ZXIgd2hlbiB0aGUgZXJyb3Igb2NjdXJyZWQuIFRoZSBlcnJvciBwcm9wZXJ0eVxuICogd2lsbCBjb250YWluIGVpdGhlciBhIHdyYXBwZWQgRXJyb3Igb2JqZWN0IG9yIHRoZSBlcnJvciByZXNwb25zZSByZXR1cm5lZFxuICogZnJvbSB0aGUgc2VydmVyLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwRXJyb3JSZXNwb25zZSBleHRlbmRzIEh0dHBSZXNwb25zZUJhc2UgaW1wbGVtZW50cyBFcnJvciB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnSHR0cEVycm9yUmVzcG9uc2UnO1xuICByZWFkb25seSBtZXNzYWdlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGVycm9yOiBhbnl8bnVsbDtcblxuICAvKipcbiAgICogRXJyb3JzIGFyZSBuZXZlciBva2F5LCBldmVuIHdoZW4gdGhlIHN0YXR1cyBjb2RlIGlzIGluIHRoZSAyeHggc3VjY2VzcyByYW5nZS5cbiAgICovXG4gIHJlYWRvbmx5IG9rID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoaW5pdDoge1xuICAgIGVycm9yPzogYW55OyBoZWFkZXJzPzogSHR0cEhlYWRlcnM7IHN0YXR1cz86IG51bWJlcjsgc3RhdHVzVGV4dD86IHN0cmluZzsgdXJsPzogc3RyaW5nO1xuICB9KSB7XG4gICAgLy8gSW5pdGlhbGl6ZSB3aXRoIGEgZGVmYXVsdCBzdGF0dXMgb2YgMCAvIFVua25vd24gRXJyb3IuXG4gICAgc3VwZXIoaW5pdCwgMCwgJ1Vua25vd24gRXJyb3InKTtcblxuICAgIC8vIElmIHRoZSByZXNwb25zZSB3YXMgc3VjY2Vzc2Z1bCwgdGhlbiB0aGlzIHdhcyBhIHBhcnNlIGVycm9yLiBPdGhlcndpc2UsIGl0IHdhc1xuICAgIC8vIGEgcHJvdG9jb2wtbGV2ZWwgZmFpbHVyZSBvZiBzb21lIHNvcnQuIEVpdGhlciB0aGUgcmVxdWVzdCBmYWlsZWQgaW4gdHJhbnNpdFxuICAgIC8vIG9yIHRoZSBzZXJ2ZXIgcmV0dXJuZWQgYW4gdW5zdWNjZXNzZnVsIHN0YXR1cyBjb2RlLlxuICAgIGlmICh0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHRoaXMubWVzc2FnZSA9IGBIdHRwIGZhaWx1cmUgZHVyaW5nIHBhcnNpbmcgZm9yICR7aW5pdC51cmwgfHwgJyh1bmtub3duIHVybCknfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWVzc2FnZSA9XG4gICAgICAgICAgYEh0dHAgZmFpbHVyZSByZXNwb25zZSBmb3IgJHtpbml0LnVybCB8fCAnKHVua25vd24gdXJsKSd9OiAke2luaXQuc3RhdHVzfSAke2luaXQuc3RhdHVzVGV4dH1gO1xuICAgIH1cbiAgICB0aGlzLmVycm9yID0gaW5pdC5lcnJvciB8fCBudWxsO1xuICB9XG59XG4iXX0=