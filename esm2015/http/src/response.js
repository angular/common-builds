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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvcmVzcG9uc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDOzs7Ozs7SUFXcEMsT0FBSTs7OztJQUtKLGlCQUFjOzs7O0lBS2QsaUJBQWM7Ozs7SUFLZCxtQkFBZ0I7Ozs7SUFLaEIsV0FBUTs7OztJQUtSLE9BQUk7Ozs0QkF6QkosSUFBSTs0QkFLSixjQUFjOzRCQUtkLGNBQWM7NEJBS2QsZ0JBQWdCOzRCQUtoQixRQUFROzRCQUtSLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtHTixNQUFNLE9BQWdCLGdCQUFnQjs7Ozs7Ozs7OztJQXdDcEMsWUFDSSxJQUtDLEVBQ0QsZ0JBQXdCLEdBQUcsRUFBRSxvQkFBNEIsSUFBSTs7O1FBRy9ELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUN0RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksaUJBQWlCLENBQUM7UUFDdkQsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQzs7UUFHNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEdB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cHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwSGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcblxuLyoqXG4gKiBUeXBlIGVudW1lcmF0aW9uIGZvciB0aGUgZGlmZmVyZW50IGtpbmRzIG9mIGBIdHRwRXZlbnRgLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBlbnVtIEh0dHBFdmVudFR5cGUge1xuICAvKipcbiAgICogVGhlIHJlcXVlc3Qgd2FzIHNlbnQgb3V0IG92ZXIgdGhlIHdpcmUuXG4gICAqL1xuICBTZW50LFxuXG4gIC8qKlxuICAgKiBBbiB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnQgd2FzIHJlY2VpdmVkLlxuICAgKi9cbiAgVXBsb2FkUHJvZ3Jlc3MsXG5cbiAgLyoqXG4gICAqIFRoZSByZXNwb25zZSBzdGF0dXMgY29kZSBhbmQgaGVhZGVycyB3ZXJlIHJlY2VpdmVkLlxuICAgKi9cbiAgUmVzcG9uc2VIZWFkZXIsXG5cbiAgLyoqXG4gICAqIEEgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgd2FzIHJlY2VpdmVkLlxuICAgKi9cbiAgRG93bmxvYWRQcm9ncmVzcyxcblxuICAvKipcbiAgICogVGhlIGZ1bGwgcmVzcG9uc2UgaW5jbHVkaW5nIHRoZSBib2R5IHdhcyByZWNlaXZlZC5cbiAgICovXG4gIFJlc3BvbnNlLFxuXG4gIC8qKlxuICAgKiBBIGN1c3RvbSBldmVudCBmcm9tIGFuIGludGVyY2VwdG9yIG9yIGEgYmFja2VuZC5cbiAgICovXG4gIFVzZXIsXG59XG5cbi8qKlxuICogQmFzZSBpbnRlcmZhY2UgZm9yIHByb2dyZXNzIGV2ZW50cy5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBQcm9ncmVzc0V2ZW50IHtcbiAgLyoqXG4gICAqIFByb2dyZXNzIGV2ZW50IHR5cGUgaXMgZWl0aGVyIHVwbG9hZCBvciBkb3dubG9hZC5cbiAgICovXG4gIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzc3xIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzO1xuXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgYnl0ZXMgdXBsb2FkZWQgb3IgZG93bmxvYWRlZC5cbiAgICovXG4gIGxvYWRlZDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUb3RhbCBudW1iZXIgb2YgYnl0ZXMgdG8gdXBsb2FkIG9yIGRvd25sb2FkLiBEZXBlbmRpbmcgb24gdGhlIHJlcXVlc3Qgb3JcbiAgICogcmVzcG9uc2UsIHRoaXMgbWF5IG5vdCBiZSBjb21wdXRhYmxlIGFuZCB0aHVzIG1heSBub3QgYmUgcHJlc2VudC5cbiAgICovXG4gIHRvdGFsPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEEgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50IGV4dGVuZHMgSHR0cFByb2dyZXNzRXZlbnQge1xuICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3M7XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJ0aWFsIHJlc3BvbnNlIGJvZHkgYXMgZG93bmxvYWRlZCBzbyBmYXIuXG4gICAqXG4gICAqIE9ubHkgcHJlc2VudCBpZiB0aGUgcmVzcG9uc2VUeXBlIHdhcyBgdGV4dGAuXG4gICAqL1xuICBwYXJ0aWFsVGV4dD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBbiB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudCBleHRlbmRzIEh0dHBQcm9ncmVzc0V2ZW50IHtcbiAgdHlwZTogSHR0cEV2ZW50VHlwZS5VcGxvYWRQcm9ncmVzcztcbn1cblxuLyoqXG4gKiBBbiBldmVudCBpbmRpY2F0aW5nIHRoYXQgdGhlIHJlcXVlc3Qgd2FzIHNlbnQgdG8gdGhlIHNlcnZlci4gVXNlZnVsXG4gKiB3aGVuIGEgcmVxdWVzdCBtYXkgYmUgcmV0cmllZCBtdWx0aXBsZSB0aW1lcywgdG8gZGlzdGluZ3Vpc2ggYmV0d2VlblxuICogcmV0cmllcyBvbiB0aGUgZmluYWwgZXZlbnQgc3RyZWFtLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cFNlbnRFdmVudCB7IHR5cGU6IEh0dHBFdmVudFR5cGUuU2VudDsgfVxuXG4vKipcbiAqIEEgdXNlci1kZWZpbmVkIGV2ZW50LlxuICpcbiAqIEdyb3VwaW5nIGFsbCBjdXN0b20gZXZlbnRzIHVuZGVyIHRoaXMgdHlwZSBlbnN1cmVzIHRoZXkgd2lsbCBiZSBoYW5kbGVkXG4gKiBhbmQgZm9yd2FyZGVkIGJ5IGFsbCBpbXBsZW1lbnRhdGlvbnMgb2YgaW50ZXJjZXB0b3JzLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cFVzZXJFdmVudDxUPiB7IHR5cGU6IEh0dHBFdmVudFR5cGUuVXNlcjsgfVxuXG4vKipcbiAqIEFuIGVycm9yIHRoYXQgcmVwcmVzZW50cyBhIGZhaWxlZCBhdHRlbXB0IHRvIEpTT04ucGFyc2UgdGV4dCBjb21pbmcgYmFja1xuICogZnJvbSB0aGUgc2VydmVyLlxuICpcbiAqIEl0IGJ1bmRsZXMgdGhlIEVycm9yIG9iamVjdCB3aXRoIHRoZSBhY3R1YWwgcmVzcG9uc2UgYm9keSB0aGF0IGZhaWxlZCB0byBwYXJzZS5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBKc29uUGFyc2VFcnJvciB7XG4gIGVycm9yOiBFcnJvcjtcbiAgdGV4dDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFVuaW9uIHR5cGUgZm9yIGFsbCBwb3NzaWJsZSBldmVudHMgb24gdGhlIHJlc3BvbnNlIHN0cmVhbS5cbiAqXG4gKiBUeXBlZCBhY2NvcmRpbmcgdG8gdGhlIGV4cGVjdGVkIHR5cGUgb2YgdGhlIHJlc3BvbnNlLlxuICpcbiAqXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBFdmVudDxUPiA9XG4gICAgSHR0cFNlbnRFdmVudCB8IEh0dHBIZWFkZXJSZXNwb25zZSB8IEh0dHBSZXNwb25zZTxUPnwgSHR0cFByb2dyZXNzRXZlbnQgfCBIdHRwVXNlckV2ZW50PFQ+O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGJvdGggYEh0dHBSZXNwb25zZWAgYW5kIGBIdHRwSGVhZGVyUmVzcG9uc2VgLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIdHRwUmVzcG9uc2VCYXNlIHtcbiAgLyoqXG4gICAqIEFsbCByZXNwb25zZSBoZWFkZXJzLlxuICAgKi9cbiAgcmVhZG9ubHkgaGVhZGVyczogSHR0cEhlYWRlcnM7XG5cbiAgLyoqXG4gICAqIFJlc3BvbnNlIHN0YXR1cyBjb2RlLlxuICAgKi9cbiAgcmVhZG9ubHkgc3RhdHVzOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRleHR1YWwgZGVzY3JpcHRpb24gb2YgcmVzcG9uc2Ugc3RhdHVzIGNvZGUuXG4gICAqXG4gICAqIERvIG5vdCBkZXBlbmQgb24gdGhpcy5cbiAgICovXG4gIHJlYWRvbmx5IHN0YXR1c1RleHQ6IHN0cmluZztcblxuICAvKipcbiAgICogVVJMIG9mIHRoZSByZXNvdXJjZSByZXRyaWV2ZWQsIG9yIG51bGwgaWYgbm90IGF2YWlsYWJsZS5cbiAgICovXG4gIHJlYWRvbmx5IHVybDogc3RyaW5nfG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHN0YXR1cyBjb2RlIGZhbGxzIGluIHRoZSAyeHggcmFuZ2UuXG4gICAqL1xuICByZWFkb25seSBvazogYm9vbGVhbjtcblxuICAvKipcbiAgICogVHlwZSBvZiB0aGUgcmVzcG9uc2UsIG5hcnJvd2VkIHRvIGVpdGhlciB0aGUgZnVsbCByZXNwb25zZSBvciB0aGUgaGVhZGVyLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlYWRvbmx5IHR5cGUgITogSHR0cEV2ZW50VHlwZS5SZXNwb25zZSB8IEh0dHBFdmVudFR5cGUuUmVzcG9uc2VIZWFkZXI7XG5cbiAgLyoqXG4gICAqIFN1cGVyLWNvbnN0cnVjdG9yIGZvciBhbGwgcmVzcG9uc2VzLlxuICAgKlxuICAgKiBUaGUgc2luZ2xlIHBhcmFtZXRlciBhY2NlcHRlZCBpcyBhbiBpbml0aWFsaXphdGlvbiBoYXNoLiBBbnkgcHJvcGVydGllc1xuICAgKiBvZiB0aGUgcmVzcG9uc2UgcGFzc2VkIHRoZXJlIHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgdmFsdWVzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBpbml0OiB7XG4gICAgICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycyxcbiAgICAgICAgc3RhdHVzPzogbnVtYmVyLFxuICAgICAgICBzdGF0dXNUZXh0Pzogc3RyaW5nLFxuICAgICAgICB1cmw/OiBzdHJpbmcsXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFN0YXR1czogbnVtYmVyID0gMjAwLCBkZWZhdWx0U3RhdHVzVGV4dDogc3RyaW5nID0gJ09LJykge1xuICAgIC8vIElmIHRoZSBoYXNoIGhhcyB2YWx1ZXMgcGFzc2VkLCB1c2UgdGhlbSB0byBpbml0aWFsaXplIHRoZSByZXNwb25zZS5cbiAgICAvLyBPdGhlcndpc2UgdXNlIHRoZSBkZWZhdWx0IHZhbHVlcy5cbiAgICB0aGlzLmhlYWRlcnMgPSBpbml0LmhlYWRlcnMgfHwgbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgdGhpcy5zdGF0dXMgPSBpbml0LnN0YXR1cyAhPT0gdW5kZWZpbmVkID8gaW5pdC5zdGF0dXMgOiBkZWZhdWx0U3RhdHVzO1xuICAgIHRoaXMuc3RhdHVzVGV4dCA9IGluaXQuc3RhdHVzVGV4dCB8fCBkZWZhdWx0U3RhdHVzVGV4dDtcbiAgICB0aGlzLnVybCA9IGluaXQudXJsIHx8IG51bGw7XG5cbiAgICAvLyBDYWNoZSB0aGUgb2sgdmFsdWUgdG8gYXZvaWQgZGVmaW5pbmcgYSBnZXR0ZXIuXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMDtcbiAgfVxufVxuXG4vKipcbiAqIEEgcGFydGlhbCBIVFRQIHJlc3BvbnNlIHdoaWNoIG9ubHkgaW5jbHVkZXMgdGhlIHN0YXR1cyBhbmQgaGVhZGVyIGRhdGEsXG4gKiBidXQgbm8gcmVzcG9uc2UgYm9keS5cbiAqXG4gKiBgSHR0cEhlYWRlclJlc3BvbnNlYCBpcyBhIGBIdHRwRXZlbnRgIGF2YWlsYWJsZSBvbiB0aGUgcmVzcG9uc2VcbiAqIGV2ZW50IHN0cmVhbSwgb25seSB3aGVuIHByb2dyZXNzIGV2ZW50cyBhcmUgcmVxdWVzdGVkLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwSGVhZGVyUmVzcG9uc2UgZXh0ZW5kcyBIdHRwUmVzcG9uc2VCYXNlIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgSHR0cEhlYWRlclJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoaW5pdDoge1xuICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycyxcbiAgICBzdGF0dXM/OiBudW1iZXIsXG4gICAgc3RhdHVzVGV4dD86IHN0cmluZyxcbiAgICB1cmw/OiBzdHJpbmcsXG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKGluaXQpO1xuICB9XG5cbiAgcmVhZG9ubHkgdHlwZTogSHR0cEV2ZW50VHlwZS5SZXNwb25zZUhlYWRlciA9IEh0dHBFdmVudFR5cGUuUmVzcG9uc2VIZWFkZXI7XG5cbiAgLyoqXG4gICAqIENvcHkgdGhpcyBgSHR0cEhlYWRlclJlc3BvbnNlYCwgb3ZlcnJpZGluZyBpdHMgY29udGVudHMgd2l0aCB0aGVcbiAgICogZ2l2ZW4gcGFyYW1ldGVyIGhhc2guXG4gICAqL1xuICBjbG9uZSh1cGRhdGU6IHtoZWFkZXJzPzogSHR0cEhlYWRlcnM7IHN0YXR1cz86IG51bWJlcjsgc3RhdHVzVGV4dD86IHN0cmluZzsgdXJsPzogc3RyaW5nO30gPSB7fSk6XG4gICAgICBIdHRwSGVhZGVyUmVzcG9uc2Uge1xuICAgIC8vIFBlcmZvcm0gYSBzdHJhaWdodGZvcndhcmQgaW5pdGlhbGl6YXRpb24gb2YgdGhlIG5ldyBIdHRwSGVhZGVyUmVzcG9uc2UsXG4gICAgLy8gb3ZlcnJpZGluZyB0aGUgY3VycmVudCBwYXJhbWV0ZXJzIHdpdGggbmV3IG9uZXMgaWYgZ2l2ZW4uXG4gICAgcmV0dXJuIG5ldyBIdHRwSGVhZGVyUmVzcG9uc2Uoe1xuICAgICAgaGVhZGVyczogdXBkYXRlLmhlYWRlcnMgfHwgdGhpcy5oZWFkZXJzLFxuICAgICAgc3RhdHVzOiB1cGRhdGUuc3RhdHVzICE9PSB1bmRlZmluZWQgPyB1cGRhdGUuc3RhdHVzIDogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB1cGRhdGUuc3RhdHVzVGV4dCB8fCB0aGlzLnN0YXR1c1RleHQsXG4gICAgICB1cmw6IHVwZGF0ZS51cmwgfHwgdGhpcy51cmwgfHwgdW5kZWZpbmVkLFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQSBmdWxsIEhUVFAgcmVzcG9uc2UsIGluY2x1ZGluZyBhIHR5cGVkIHJlc3BvbnNlIGJvZHkgKHdoaWNoIG1heSBiZSBgbnVsbGBcbiAqIGlmIG9uZSB3YXMgbm90IHJldHVybmVkKS5cbiAqXG4gKiBgSHR0cFJlc3BvbnNlYCBpcyBhIGBIdHRwRXZlbnRgIGF2YWlsYWJsZSBvbiB0aGUgcmVzcG9uc2UgZXZlbnRcbiAqIHN0cmVhbS5cbiAqXG4gKlxuICovXG5leHBvcnQgY2xhc3MgSHR0cFJlc3BvbnNlPFQ+IGV4dGVuZHMgSHR0cFJlc3BvbnNlQmFzZSB7XG4gIC8qKlxuICAgKiBUaGUgcmVzcG9uc2UgYm9keSwgb3IgYG51bGxgIGlmIG9uZSB3YXMgbm90IHJldHVybmVkLlxuICAgKi9cbiAgcmVhZG9ubHkgYm9keTogVHxudWxsO1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgYEh0dHBSZXNwb25zZWAuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihpbml0OiB7XG4gICAgYm9keT86IFQgfCBudWxsLCBoZWFkZXJzPzogSHR0cEhlYWRlcnM7IHN0YXR1cz86IG51bWJlcjsgc3RhdHVzVGV4dD86IHN0cmluZzsgdXJsPzogc3RyaW5nO1xuICB9ID0ge30pIHtcbiAgICBzdXBlcihpbml0KTtcbiAgICB0aGlzLmJvZHkgPSBpbml0LmJvZHkgIT09IHVuZGVmaW5lZCA/IGluaXQuYm9keSA6IG51bGw7XG4gIH1cblxuICByZWFkb25seSB0eXBlOiBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlID0gSHR0cEV2ZW50VHlwZS5SZXNwb25zZTtcblxuICBjbG9uZSgpOiBIdHRwUmVzcG9uc2U8VD47XG4gIGNsb25lKHVwZGF0ZToge2hlYWRlcnM/OiBIdHRwSGVhZGVyczsgc3RhdHVzPzogbnVtYmVyOyBzdGF0dXNUZXh0Pzogc3RyaW5nOyB1cmw/OiBzdHJpbmc7fSk6XG4gICAgICBIdHRwUmVzcG9uc2U8VD47XG4gIGNsb25lPFY+KHVwZGF0ZToge1xuICAgIGJvZHk/OiBWIHwgbnVsbCwgaGVhZGVycz86IEh0dHBIZWFkZXJzOyBzdGF0dXM/OiBudW1iZXI7IHN0YXR1c1RleHQ/OiBzdHJpbmc7IHVybD86IHN0cmluZztcbiAgfSk6IEh0dHBSZXNwb25zZTxWPjtcbiAgY2xvbmUodXBkYXRlOiB7XG4gICAgYm9keT86IGFueSB8IG51bGw7IGhlYWRlcnM/OiBIdHRwSGVhZGVyczsgc3RhdHVzPzogbnVtYmVyOyBzdGF0dXNUZXh0Pzogc3RyaW5nOyB1cmw/OiBzdHJpbmc7XG4gIH0gPSB7fSk6IEh0dHBSZXNwb25zZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IEh0dHBSZXNwb25zZTxhbnk+KHtcbiAgICAgIGJvZHk6ICh1cGRhdGUuYm9keSAhPT0gdW5kZWZpbmVkKSA/IHVwZGF0ZS5ib2R5IDogdGhpcy5ib2R5LFxuICAgICAgaGVhZGVyczogdXBkYXRlLmhlYWRlcnMgfHwgdGhpcy5oZWFkZXJzLFxuICAgICAgc3RhdHVzOiAodXBkYXRlLnN0YXR1cyAhPT0gdW5kZWZpbmVkKSA/IHVwZGF0ZS5zdGF0dXMgOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHVwZGF0ZS5zdGF0dXNUZXh0IHx8IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIHVybDogdXBkYXRlLnVybCB8fCB0aGlzLnVybCB8fCB1bmRlZmluZWQsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHJlc3BvbnNlIHRoYXQgcmVwcmVzZW50cyBhbiBlcnJvciBvciBmYWlsdXJlLCBlaXRoZXIgZnJvbSBhXG4gKiBub24tc3VjY2Vzc2Z1bCBIVFRQIHN0YXR1cywgYW4gZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHRoZSByZXF1ZXN0LFxuICogb3Igc29tZSBvdGhlciBmYWlsdXJlIHdoaWNoIG9jY3VycmVkIGR1cmluZyB0aGUgcGFyc2luZyBvZiB0aGUgcmVzcG9uc2UuXG4gKlxuICogQW55IGVycm9yIHJldHVybmVkIG9uIHRoZSBgT2JzZXJ2YWJsZWAgcmVzcG9uc2Ugc3RyZWFtIHdpbGwgYmVcbiAqIHdyYXBwZWQgaW4gYW4gYEh0dHBFcnJvclJlc3BvbnNlYCB0byBwcm92aWRlIGFkZGl0aW9uYWwgY29udGV4dCBhYm91dFxuICogdGhlIHN0YXRlIG9mIHRoZSBIVFRQIGxheWVyIHdoZW4gdGhlIGVycm9yIG9jY3VycmVkLiBUaGUgZXJyb3IgcHJvcGVydHlcbiAqIHdpbGwgY29udGFpbiBlaXRoZXIgYSB3cmFwcGVkIEVycm9yIG9iamVjdCBvciB0aGUgZXJyb3IgcmVzcG9uc2UgcmV0dXJuZWRcbiAqIGZyb20gdGhlIHNlcnZlci5cbiAqXG4gKlxuICovXG5leHBvcnQgY2xhc3MgSHR0cEVycm9yUmVzcG9uc2UgZXh0ZW5kcyBIdHRwUmVzcG9uc2VCYXNlIGltcGxlbWVudHMgRXJyb3Ige1xuICByZWFkb25seSBuYW1lID0gJ0h0dHBFcnJvclJlc3BvbnNlJztcbiAgcmVhZG9ubHkgbWVzc2FnZTogc3RyaW5nO1xuICByZWFkb25seSBlcnJvcjogYW55fG51bGw7XG5cbiAgLyoqXG4gICAqIEVycm9ycyBhcmUgbmV2ZXIgb2theSwgZXZlbiB3aGVuIHRoZSBzdGF0dXMgY29kZSBpcyBpbiB0aGUgMnh4IHN1Y2Nlc3MgcmFuZ2UuXG4gICAqL1xuICByZWFkb25seSBvayA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKGluaXQ6IHtcbiAgICBlcnJvcj86IGFueTsgaGVhZGVycz86IEh0dHBIZWFkZXJzOyBzdGF0dXM/OiBudW1iZXI7IHN0YXR1c1RleHQ/OiBzdHJpbmc7IHVybD86IHN0cmluZztcbiAgfSkge1xuICAgIC8vIEluaXRpYWxpemUgd2l0aCBhIGRlZmF1bHQgc3RhdHVzIG9mIDAgLyBVbmtub3duIEVycm9yLlxuICAgIHN1cGVyKGluaXQsIDAsICdVbmtub3duIEVycm9yJyk7XG5cbiAgICAvLyBJZiB0aGUgcmVzcG9uc2Ugd2FzIHN1Y2Nlc3NmdWwsIHRoZW4gdGhpcyB3YXMgYSBwYXJzZSBlcnJvci4gT3RoZXJ3aXNlLCBpdCB3YXNcbiAgICAvLyBhIHByb3RvY29sLWxldmVsIGZhaWx1cmUgb2Ygc29tZSBzb3J0LiBFaXRoZXIgdGhlIHJlcXVlc3QgZmFpbGVkIGluIHRyYW5zaXRcbiAgICAvLyBvciB0aGUgc2VydmVyIHJldHVybmVkIGFuIHVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZS5cbiAgICBpZiAodGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwKSB7XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBgSHR0cCBmYWlsdXJlIGR1cmluZyBwYXJzaW5nIGZvciAke2luaXQudXJsIHx8ICcodW5rbm93biB1cmwpJ31gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1lc3NhZ2UgPVxuICAgICAgICAgIGBIdHRwIGZhaWx1cmUgcmVzcG9uc2UgZm9yICR7aW5pdC51cmwgfHwgJyh1bmtub3duIHVybCknfTogJHtpbml0LnN0YXR1c30gJHtpbml0LnN0YXR1c1RleHR9YDtcbiAgICB9XG4gICAgdGhpcy5lcnJvciA9IGluaXQuZXJyb3IgfHwgbnVsbDtcbiAgfVxufVxuIl19