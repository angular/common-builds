/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpHeaders } from './headers';
/**
 * Type enumeration for the different kinds of `HttpEvent`.
 *
 * @publicApi
 */
export var HttpEventType;
(function (HttpEventType) {
    /**
     * The request was sent out over the wire.
     */
    HttpEventType[HttpEventType["Sent"] = 0] = "Sent";
    /**
     * An upload progress event was received.
     *
     * Note: The `FetchBackend` doesn't support progress report on uploads.
     */
    HttpEventType[HttpEventType["UploadProgress"] = 1] = "UploadProgress";
    /**
     * The response status code and headers were received.
     */
    HttpEventType[HttpEventType["ResponseHeader"] = 2] = "ResponseHeader";
    /**
     * A download progress event was received.
     */
    HttpEventType[HttpEventType["DownloadProgress"] = 3] = "DownloadProgress";
    /**
     * The full response including the body was received.
     */
    HttpEventType[HttpEventType["Response"] = 4] = "Response";
    /**
     * A custom event from an interceptor or a backend.
     */
    HttpEventType[HttpEventType["User"] = 5] = "User";
})(HttpEventType || (HttpEventType = {}));
/**
 * Base class for both `HttpResponse` and `HttpHeaderResponse`.
 *
 * @publicApi
 */
export class HttpResponseBase {
    /**
     * Super-constructor for all responses.
     *
     * The single parameter accepted is an initialization hash. Any properties
     * of the response passed there will override the default values.
     */
    constructor(init, defaultStatus = HttpStatusCode.Ok, defaultStatusText = 'OK') {
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
/**
 * A partial HTTP response which only includes the status and header data,
 * but no response body.
 *
 * `HttpHeaderResponse` is a `HttpEvent` available on the response
 * event stream, only when progress events are requested.
 *
 * @publicApi
 */
export class HttpHeaderResponse extends HttpResponseBase {
    /**
     * Create a new `HttpHeaderResponse` with the given parameters.
     */
    constructor(init = {}) {
        super(init);
        this.type = HttpEventType.ResponseHeader;
    }
    /**
     * Copy this `HttpHeaderResponse`, overriding its contents with the
     * given parameter hash.
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
/**
 * A full HTTP response, including a typed response body (which may be `null`
 * if one was not returned).
 *
 * `HttpResponse` is a `HttpEvent` available on the response event
 * stream.
 *
 * @publicApi
 */
export class HttpResponse extends HttpResponseBase {
    /**
     * Construct a new `HttpResponse`.
     */
    constructor(init = {}) {
        super(init);
        this.type = HttpEventType.Response;
        this.body = init.body !== undefined ? init.body : null;
    }
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
 * @publicApi
 */
export class HttpErrorResponse extends HttpResponseBase {
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
            this.message = `Http failure response for ${init.url || '(unknown url)'}: ${init.status} ${init.statusText}`;
        }
        this.error = init.error || null;
    }
}
/**
 * Http status codes.
 * As per https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
 * @publicApi
 */
export var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["Continue"] = 100] = "Continue";
    HttpStatusCode[HttpStatusCode["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    HttpStatusCode[HttpStatusCode["Processing"] = 102] = "Processing";
    HttpStatusCode[HttpStatusCode["EarlyHints"] = 103] = "EarlyHints";
    HttpStatusCode[HttpStatusCode["Ok"] = 200] = "Ok";
    HttpStatusCode[HttpStatusCode["Created"] = 201] = "Created";
    HttpStatusCode[HttpStatusCode["Accepted"] = 202] = "Accepted";
    HttpStatusCode[HttpStatusCode["NonAuthoritativeInformation"] = 203] = "NonAuthoritativeInformation";
    HttpStatusCode[HttpStatusCode["NoContent"] = 204] = "NoContent";
    HttpStatusCode[HttpStatusCode["ResetContent"] = 205] = "ResetContent";
    HttpStatusCode[HttpStatusCode["PartialContent"] = 206] = "PartialContent";
    HttpStatusCode[HttpStatusCode["MultiStatus"] = 207] = "MultiStatus";
    HttpStatusCode[HttpStatusCode["AlreadyReported"] = 208] = "AlreadyReported";
    HttpStatusCode[HttpStatusCode["ImUsed"] = 226] = "ImUsed";
    HttpStatusCode[HttpStatusCode["MultipleChoices"] = 300] = "MultipleChoices";
    HttpStatusCode[HttpStatusCode["MovedPermanently"] = 301] = "MovedPermanently";
    HttpStatusCode[HttpStatusCode["Found"] = 302] = "Found";
    HttpStatusCode[HttpStatusCode["SeeOther"] = 303] = "SeeOther";
    HttpStatusCode[HttpStatusCode["NotModified"] = 304] = "NotModified";
    HttpStatusCode[HttpStatusCode["UseProxy"] = 305] = "UseProxy";
    HttpStatusCode[HttpStatusCode["Unused"] = 306] = "Unused";
    HttpStatusCode[HttpStatusCode["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpStatusCode[HttpStatusCode["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpStatusCode[HttpStatusCode["BadRequest"] = 400] = "BadRequest";
    HttpStatusCode[HttpStatusCode["Unauthorized"] = 401] = "Unauthorized";
    HttpStatusCode[HttpStatusCode["PaymentRequired"] = 402] = "PaymentRequired";
    HttpStatusCode[HttpStatusCode["Forbidden"] = 403] = "Forbidden";
    HttpStatusCode[HttpStatusCode["NotFound"] = 404] = "NotFound";
    HttpStatusCode[HttpStatusCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpStatusCode[HttpStatusCode["NotAcceptable"] = 406] = "NotAcceptable";
    HttpStatusCode[HttpStatusCode["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpStatusCode[HttpStatusCode["RequestTimeout"] = 408] = "RequestTimeout";
    HttpStatusCode[HttpStatusCode["Conflict"] = 409] = "Conflict";
    HttpStatusCode[HttpStatusCode["Gone"] = 410] = "Gone";
    HttpStatusCode[HttpStatusCode["LengthRequired"] = 411] = "LengthRequired";
    HttpStatusCode[HttpStatusCode["PreconditionFailed"] = 412] = "PreconditionFailed";
    HttpStatusCode[HttpStatusCode["PayloadTooLarge"] = 413] = "PayloadTooLarge";
    HttpStatusCode[HttpStatusCode["UriTooLong"] = 414] = "UriTooLong";
    HttpStatusCode[HttpStatusCode["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    HttpStatusCode[HttpStatusCode["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
    HttpStatusCode[HttpStatusCode["ExpectationFailed"] = 417] = "ExpectationFailed";
    HttpStatusCode[HttpStatusCode["ImATeapot"] = 418] = "ImATeapot";
    HttpStatusCode[HttpStatusCode["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    HttpStatusCode[HttpStatusCode["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    HttpStatusCode[HttpStatusCode["Locked"] = 423] = "Locked";
    HttpStatusCode[HttpStatusCode["FailedDependency"] = 424] = "FailedDependency";
    HttpStatusCode[HttpStatusCode["TooEarly"] = 425] = "TooEarly";
    HttpStatusCode[HttpStatusCode["UpgradeRequired"] = 426] = "UpgradeRequired";
    HttpStatusCode[HttpStatusCode["PreconditionRequired"] = 428] = "PreconditionRequired";
    HttpStatusCode[HttpStatusCode["TooManyRequests"] = 429] = "TooManyRequests";
    HttpStatusCode[HttpStatusCode["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    HttpStatusCode[HttpStatusCode["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    HttpStatusCode[HttpStatusCode["InternalServerError"] = 500] = "InternalServerError";
    HttpStatusCode[HttpStatusCode["NotImplemented"] = 501] = "NotImplemented";
    HttpStatusCode[HttpStatusCode["BadGateway"] = 502] = "BadGateway";
    HttpStatusCode[HttpStatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpStatusCode[HttpStatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
    HttpStatusCode[HttpStatusCode["HttpVersionNotSupported"] = 505] = "HttpVersionNotSupported";
    HttpStatusCode[HttpStatusCode["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    HttpStatusCode[HttpStatusCode["InsufficientStorage"] = 507] = "InsufficientStorage";
    HttpStatusCode[HttpStatusCode["LoopDetected"] = 508] = "LoopDetected";
    HttpStatusCode[HttpStatusCode["NotExtended"] = 510] = "NotExtended";
    HttpStatusCode[HttpStatusCode["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(HttpStatusCode || (HttpStatusCode = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvcmVzcG9uc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0Qzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFOLElBQVksYUFnQ1g7QUFoQ0QsV0FBWSxhQUFhO0lBQ3ZCOztPQUVHO0lBQ0gsaURBQUksQ0FBQTtJQUVKOzs7O09BSUc7SUFDSCxxRUFBYyxDQUFBO0lBRWQ7O09BRUc7SUFDSCxxRUFBYyxDQUFBO0lBRWQ7O09BRUc7SUFDSCx5RUFBZ0IsQ0FBQTtJQUVoQjs7T0FFRztJQUNILHlEQUFRLENBQUE7SUFFUjs7T0FFRztJQUNILGlEQUFJLENBQUE7QUFDTixDQUFDLEVBaENXLGFBQWEsS0FBYixhQUFhLFFBZ0N4QjtBQWtHRDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixnQkFBZ0I7SUFrQ3BDOzs7OztPQUtHO0lBQ0gsWUFDSSxJQUtDLEVBQ0QsZ0JBQXdCLGNBQWMsQ0FBQyxFQUFFLEVBQUUsb0JBQTRCLElBQUk7UUFDN0Usc0VBQXNFO1FBQ3RFLG9DQUFvQztRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDdEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLGlCQUFpQixDQUFDO1FBQ3ZELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUM7UUFFNUIsaURBQWlEO1FB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O0lBQzFCLG1GQUF5QixDQUFBO0lBQ3pCLCtFQUF1QixDQUFBO0lBQ3ZCLCtEQUFlLENBQUE7SUFDZixpRkFBd0IsQ0FBQTtJQUN4QixtRkFBeUIsQ0FBQTtJQUN6Qix5REFBWSxDQUFBO0lBQ1osNkVBQXNCLENBQUE7SUFDdEIsNkRBQWMsQ0FBQTtJQUNkLDJFQUFxQixDQUFBO0lBQ3JCLHFGQUEwQixDQUFBO0lBQzFCLDJFQUFxQixDQUFBO0lBQ3JCLG1HQUFpQyxDQUFBO0lBQ2pDLGlHQUFnQyxDQUFBO0lBRWhDLG1GQUF5QixDQUFBO0lBQ3pCLHlFQUFvQixDQUFBO0lBQ3BCLGlFQUFnQixDQUFBO0lBQ2hCLGlGQUF3QixDQUFBO0lBQ3hCLHlFQUFvQixDQUFBO0lBQ3BCLDJGQUE2QixDQUFBO0lBQzdCLHVGQUEyQixDQUFBO0lBQzNCLG1GQUF5QixDQUFBO0lBQ3pCLHFFQUFrQixDQUFBO0lBQ2xCLG1FQUFpQixDQUFBO0lBQ2pCLHVHQUFtQyxDQUFBO0FBQ3JDLENBQUMsRUFwRVcsY0FBYyxLQUFkLGNBQWMsUUFvRXpCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5cbi8qKlxuICogVHlwZSBlbnVtZXJhdGlvbiBmb3IgdGhlIGRpZmZlcmVudCBraW5kcyBvZiBgSHR0cEV2ZW50YC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEh0dHBFdmVudFR5cGUge1xuICAvKipcbiAgICogVGhlIHJlcXVlc3Qgd2FzIHNlbnQgb3V0IG92ZXIgdGhlIHdpcmUuXG4gICAqL1xuICBTZW50LFxuXG4gIC8qKlxuICAgKiBBbiB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnQgd2FzIHJlY2VpdmVkLlxuICAgKlxuICAgKiBOb3RlOiBUaGUgYEZldGNoQmFja2VuZGAgZG9lc24ndCBzdXBwb3J0IHByb2dyZXNzIHJlcG9ydCBvbiB1cGxvYWRzLlxuICAgKi9cbiAgVXBsb2FkUHJvZ3Jlc3MsXG5cbiAgLyoqXG4gICAqIFRoZSByZXNwb25zZSBzdGF0dXMgY29kZSBhbmQgaGVhZGVycyB3ZXJlIHJlY2VpdmVkLlxuICAgKi9cbiAgUmVzcG9uc2VIZWFkZXIsXG5cbiAgLyoqXG4gICAqIEEgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgd2FzIHJlY2VpdmVkLlxuICAgKi9cbiAgRG93bmxvYWRQcm9ncmVzcyxcblxuICAvKipcbiAgICogVGhlIGZ1bGwgcmVzcG9uc2UgaW5jbHVkaW5nIHRoZSBib2R5IHdhcyByZWNlaXZlZC5cbiAgICovXG4gIFJlc3BvbnNlLFxuXG4gIC8qKlxuICAgKiBBIGN1c3RvbSBldmVudCBmcm9tIGFuIGludGVyY2VwdG9yIG9yIGEgYmFja2VuZC5cbiAgICovXG4gIFVzZXIsXG59XG5cbi8qKlxuICogQmFzZSBpbnRlcmZhY2UgZm9yIHByb2dyZXNzIGV2ZW50cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cFByb2dyZXNzRXZlbnQge1xuICAvKipcbiAgICogUHJvZ3Jlc3MgZXZlbnQgdHlwZSBpcyBlaXRoZXIgdXBsb2FkIG9yIGRvd25sb2FkLlxuICAgKi9cbiAgdHlwZTogSHR0cEV2ZW50VHlwZS5Eb3dubG9hZFByb2dyZXNzfEh0dHBFdmVudFR5cGUuVXBsb2FkUHJvZ3Jlc3M7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBieXRlcyB1cGxvYWRlZCBvciBkb3dubG9hZGVkLlxuICAgKi9cbiAgbG9hZGVkOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRvdGFsIG51bWJlciBvZiBieXRlcyB0byB1cGxvYWQgb3IgZG93bmxvYWQuIERlcGVuZGluZyBvbiB0aGUgcmVxdWVzdCBvclxuICAgKiByZXNwb25zZSwgdGhpcyBtYXkgbm90IGJlIGNvbXB1dGFibGUgYW5kIHRodXMgbWF5IG5vdCBiZSBwcmVzZW50LlxuICAgKi9cbiAgdG90YWw/OiBudW1iZXI7XG59XG5cbi8qKlxuICogQSBkb3dubG9hZCBwcm9ncmVzcyBldmVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCBleHRlbmRzIEh0dHBQcm9ncmVzc0V2ZW50IHtcbiAgdHlwZTogSHR0cEV2ZW50VHlwZS5Eb3dubG9hZFByb2dyZXNzO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFydGlhbCByZXNwb25zZSBib2R5IGFzIGRvd25sb2FkZWQgc28gZmFyLlxuICAgKlxuICAgKiBPbmx5IHByZXNlbnQgaWYgdGhlIHJlc3BvbnNlVHlwZSB3YXMgYHRleHRgLlxuICAgKi9cbiAgcGFydGlhbFRleHQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQW4gdXBsb2FkIHByb2dyZXNzIGV2ZW50LlxuICpcbiAqIE5vdGU6IFRoZSBgRmV0Y2hCYWNrZW5kYCBkb2Vzbid0IHN1cHBvcnQgcHJvZ3Jlc3MgcmVwb3J0IG9uIHVwbG9hZHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBVcGxvYWRQcm9ncmVzc0V2ZW50IGV4dGVuZHMgSHR0cFByb2dyZXNzRXZlbnQge1xuICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzO1xufVxuXG4vKipcbiAqIEFuIGV2ZW50IGluZGljYXRpbmcgdGhhdCB0aGUgcmVxdWVzdCB3YXMgc2VudCB0byB0aGUgc2VydmVyLiBVc2VmdWxcbiAqIHdoZW4gYSByZXF1ZXN0IG1heSBiZSByZXRyaWVkIG11bHRpcGxlIHRpbWVzLCB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuXG4gKiByZXRyaWVzIG9uIHRoZSBmaW5hbCBldmVudCBzdHJlYW0uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBTZW50RXZlbnQge1xuICB0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnQ7XG59XG5cbi8qKlxuICogQSB1c2VyLWRlZmluZWQgZXZlbnQuXG4gKlxuICogR3JvdXBpbmcgYWxsIGN1c3RvbSBldmVudHMgdW5kZXIgdGhpcyB0eXBlIGVuc3VyZXMgdGhleSB3aWxsIGJlIGhhbmRsZWRcbiAqIGFuZCBmb3J3YXJkZWQgYnkgYWxsIGltcGxlbWVudGF0aW9ucyBvZiBpbnRlcmNlcHRvcnMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBVc2VyRXZlbnQ8VD4ge1xuICB0eXBlOiBIdHRwRXZlbnRUeXBlLlVzZXI7XG59XG5cbi8qKlxuICogQW4gZXJyb3IgdGhhdCByZXByZXNlbnRzIGEgZmFpbGVkIGF0dGVtcHQgdG8gSlNPTi5wYXJzZSB0ZXh0IGNvbWluZyBiYWNrXG4gKiBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogSXQgYnVuZGxlcyB0aGUgRXJyb3Igb2JqZWN0IHdpdGggdGhlIGFjdHVhbCByZXNwb25zZSBib2R5IHRoYXQgZmFpbGVkIHRvIHBhcnNlLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cEpzb25QYXJzZUVycm9yIHtcbiAgZXJyb3I6IEVycm9yO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogVW5pb24gdHlwZSBmb3IgYWxsIHBvc3NpYmxlIGV2ZW50cyBvbiB0aGUgcmVzcG9uc2Ugc3RyZWFtLlxuICpcbiAqIFR5cGVkIGFjY29yZGluZyB0byB0aGUgZXhwZWN0ZWQgdHlwZSBvZiB0aGUgcmVzcG9uc2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBIdHRwRXZlbnQ8VD4gPVxuICAgIEh0dHBTZW50RXZlbnR8SHR0cEhlYWRlclJlc3BvbnNlfEh0dHBSZXNwb25zZTxUPnxIdHRwUHJvZ3Jlc3NFdmVudHxIdHRwVXNlckV2ZW50PFQ+O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGJvdGggYEh0dHBSZXNwb25zZWAgYW5kIGBIdHRwSGVhZGVyUmVzcG9uc2VgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEh0dHBSZXNwb25zZUJhc2Uge1xuICAvKipcbiAgICogQWxsIHJlc3BvbnNlIGhlYWRlcnMuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJzOiBIdHRwSGVhZGVycztcblxuICAvKipcbiAgICogUmVzcG9uc2Ugc3RhdHVzIGNvZGUuXG4gICAqL1xuICByZWFkb25seSBzdGF0dXM6IG51bWJlcjtcblxuICAvKipcbiAgICogVGV4dHVhbCBkZXNjcmlwdGlvbiBvZiByZXNwb25zZSBzdGF0dXMgY29kZSwgZGVmYXVsdHMgdG8gT0suXG4gICAqXG4gICAqIERvIG5vdCBkZXBlbmQgb24gdGhpcy5cbiAgICovXG4gIHJlYWRvbmx5IHN0YXR1c1RleHQ6IHN0cmluZztcblxuICAvKipcbiAgICogVVJMIG9mIHRoZSByZXNvdXJjZSByZXRyaWV2ZWQsIG9yIG51bGwgaWYgbm90IGF2YWlsYWJsZS5cbiAgICovXG4gIHJlYWRvbmx5IHVybDogc3RyaW5nfG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHN0YXR1cyBjb2RlIGZhbGxzIGluIHRoZSAyeHggcmFuZ2UuXG4gICAqL1xuICByZWFkb25seSBvazogYm9vbGVhbjtcblxuICAvKipcbiAgICogVHlwZSBvZiB0aGUgcmVzcG9uc2UsIG5hcnJvd2VkIHRvIGVpdGhlciB0aGUgZnVsbCByZXNwb25zZSBvciB0aGUgaGVhZGVyLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlYWRvbmx5IHR5cGUhOiBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlfEh0dHBFdmVudFR5cGUuUmVzcG9uc2VIZWFkZXI7XG5cbiAgLyoqXG4gICAqIFN1cGVyLWNvbnN0cnVjdG9yIGZvciBhbGwgcmVzcG9uc2VzLlxuICAgKlxuICAgKiBUaGUgc2luZ2xlIHBhcmFtZXRlciBhY2NlcHRlZCBpcyBhbiBpbml0aWFsaXphdGlvbiBoYXNoLiBBbnkgcHJvcGVydGllc1xuICAgKiBvZiB0aGUgcmVzcG9uc2UgcGFzc2VkIHRoZXJlIHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgdmFsdWVzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBpbml0OiB7XG4gICAgICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycyxcbiAgICAgICAgc3RhdHVzPzogbnVtYmVyLFxuICAgICAgICBzdGF0dXNUZXh0Pzogc3RyaW5nLFxuICAgICAgICB1cmw/OiBzdHJpbmcsXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFN0YXR1czogbnVtYmVyID0gSHR0cFN0YXR1c0NvZGUuT2ssIGRlZmF1bHRTdGF0dXNUZXh0OiBzdHJpbmcgPSAnT0snKSB7XG4gICAgLy8gSWYgdGhlIGhhc2ggaGFzIHZhbHVlcyBwYXNzZWQsIHVzZSB0aGVtIHRvIGluaXRpYWxpemUgdGhlIHJlc3BvbnNlLlxuICAgIC8vIE90aGVyd2lzZSB1c2UgdGhlIGRlZmF1bHQgdmFsdWVzLlxuICAgIHRoaXMuaGVhZGVycyA9IGluaXQuaGVhZGVycyB8fCBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICB0aGlzLnN0YXR1cyA9IGluaXQuc3RhdHVzICE9PSB1bmRlZmluZWQgPyBpbml0LnN0YXR1cyA6IGRlZmF1bHRTdGF0dXM7XG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gaW5pdC5zdGF0dXNUZXh0IHx8IGRlZmF1bHRTdGF0dXNUZXh0O1xuICAgIHRoaXMudXJsID0gaW5pdC51cmwgfHwgbnVsbDtcblxuICAgIC8vIENhY2hlIHRoZSBvayB2YWx1ZSB0byBhdm9pZCBkZWZpbmluZyBhIGdldHRlci5cbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwO1xuICB9XG59XG5cbi8qKlxuICogQSBwYXJ0aWFsIEhUVFAgcmVzcG9uc2Ugd2hpY2ggb25seSBpbmNsdWRlcyB0aGUgc3RhdHVzIGFuZCBoZWFkZXIgZGF0YSxcbiAqIGJ1dCBubyByZXNwb25zZSBib2R5LlxuICpcbiAqIGBIdHRwSGVhZGVyUmVzcG9uc2VgIGlzIGEgYEh0dHBFdmVudGAgYXZhaWxhYmxlIG9uIHRoZSByZXNwb25zZVxuICogZXZlbnQgc3RyZWFtLCBvbmx5IHdoZW4gcHJvZ3Jlc3MgZXZlbnRzIGFyZSByZXF1ZXN0ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cEhlYWRlclJlc3BvbnNlIGV4dGVuZHMgSHR0cFJlc3BvbnNlQmFzZSB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYEh0dHBIZWFkZXJSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGluaXQ6IHtcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnMsXG4gICAgc3RhdHVzPzogbnVtYmVyLFxuICAgIHN0YXR1c1RleHQ/OiBzdHJpbmcsXG4gICAgdXJsPzogc3RyaW5nLFxuICB9ID0ge30pIHtcbiAgICBzdXBlcihpbml0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGU6IEh0dHBFdmVudFR5cGUuUmVzcG9uc2VIZWFkZXIgPSBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlSGVhZGVyO1xuXG4gIC8qKlxuICAgKiBDb3B5IHRoaXMgYEh0dHBIZWFkZXJSZXNwb25zZWAsIG92ZXJyaWRpbmcgaXRzIGNvbnRlbnRzIHdpdGggdGhlXG4gICAqIGdpdmVuIHBhcmFtZXRlciBoYXNoLlxuICAgKi9cbiAgY2xvbmUodXBkYXRlOiB7aGVhZGVycz86IEh0dHBIZWFkZXJzOyBzdGF0dXM/OiBudW1iZXI7IHN0YXR1c1RleHQ/OiBzdHJpbmc7IHVybD86IHN0cmluZzt9ID0ge30pOlxuICAgICAgSHR0cEhlYWRlclJlc3BvbnNlIHtcbiAgICAvLyBQZXJmb3JtIGEgc3RyYWlnaHRmb3J3YXJkIGluaXRpYWxpemF0aW9uIG9mIHRoZSBuZXcgSHR0cEhlYWRlclJlc3BvbnNlLFxuICAgIC8vIG92ZXJyaWRpbmcgdGhlIGN1cnJlbnQgcGFyYW1ldGVycyB3aXRoIG5ldyBvbmVzIGlmIGdpdmVuLlxuICAgIHJldHVybiBuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtcbiAgICAgIGhlYWRlcnM6IHVwZGF0ZS5oZWFkZXJzIHx8IHRoaXMuaGVhZGVycyxcbiAgICAgIHN0YXR1czogdXBkYXRlLnN0YXR1cyAhPT0gdW5kZWZpbmVkID8gdXBkYXRlLnN0YXR1cyA6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdXBkYXRlLnN0YXR1c1RleHQgfHwgdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgdXJsOiB1cGRhdGUudXJsIHx8IHRoaXMudXJsIHx8IHVuZGVmaW5lZCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZnVsbCBIVFRQIHJlc3BvbnNlLCBpbmNsdWRpbmcgYSB0eXBlZCByZXNwb25zZSBib2R5ICh3aGljaCBtYXkgYmUgYG51bGxgXG4gKiBpZiBvbmUgd2FzIG5vdCByZXR1cm5lZCkuXG4gKlxuICogYEh0dHBSZXNwb25zZWAgaXMgYSBgSHR0cEV2ZW50YCBhdmFpbGFibGUgb24gdGhlIHJlc3BvbnNlIGV2ZW50XG4gKiBzdHJlYW0uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cFJlc3BvbnNlPFQ+IGV4dGVuZHMgSHR0cFJlc3BvbnNlQmFzZSB7XG4gIC8qKlxuICAgKiBUaGUgcmVzcG9uc2UgYm9keSwgb3IgYG51bGxgIGlmIG9uZSB3YXMgbm90IHJldHVybmVkLlxuICAgKi9cbiAgcmVhZG9ubHkgYm9keTogVHxudWxsO1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgYEh0dHBSZXNwb25zZWAuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihpbml0OiB7XG4gICAgYm9keT86IFR8bnVsbCxcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnM7XG4gICAgc3RhdHVzPzogbnVtYmVyO1xuICAgIHN0YXR1c1RleHQ/OiBzdHJpbmc7XG4gICAgdXJsPzogc3RyaW5nO1xuICB9ID0ge30pIHtcbiAgICBzdXBlcihpbml0KTtcbiAgICB0aGlzLmJvZHkgPSBpbml0LmJvZHkgIT09IHVuZGVmaW5lZCA/IGluaXQuYm9keSA6IG51bGw7XG4gIH1cblxuICBvdmVycmlkZSByZWFkb25seSB0eXBlOiBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlID0gSHR0cEV2ZW50VHlwZS5SZXNwb25zZTtcblxuICBjbG9uZSgpOiBIdHRwUmVzcG9uc2U8VD47XG4gIGNsb25lKHVwZGF0ZToge2hlYWRlcnM/OiBIdHRwSGVhZGVyczsgc3RhdHVzPzogbnVtYmVyOyBzdGF0dXNUZXh0Pzogc3RyaW5nOyB1cmw/OiBzdHJpbmc7fSk6XG4gICAgICBIdHRwUmVzcG9uc2U8VD47XG4gIGNsb25lPFY+KHVwZGF0ZToge1xuICAgIGJvZHk/OiBWfG51bGwsXG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgIHN0YXR1cz86IG51bWJlcjtcbiAgICBzdGF0dXNUZXh0Pzogc3RyaW5nO1xuICAgIHVybD86IHN0cmluZztcbiAgfSk6IEh0dHBSZXNwb25zZTxWPjtcbiAgY2xvbmUodXBkYXRlOiB7XG4gICAgYm9keT86IGFueXxudWxsO1xuICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycztcbiAgICBzdGF0dXM/OiBudW1iZXI7XG4gICAgc3RhdHVzVGV4dD86IHN0cmluZztcbiAgICB1cmw/OiBzdHJpbmc7XG4gIH0gPSB7fSk6IEh0dHBSZXNwb25zZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IEh0dHBSZXNwb25zZTxhbnk+KHtcbiAgICAgIGJvZHk6ICh1cGRhdGUuYm9keSAhPT0gdW5kZWZpbmVkKSA/IHVwZGF0ZS5ib2R5IDogdGhpcy5ib2R5LFxuICAgICAgaGVhZGVyczogdXBkYXRlLmhlYWRlcnMgfHwgdGhpcy5oZWFkZXJzLFxuICAgICAgc3RhdHVzOiAodXBkYXRlLnN0YXR1cyAhPT0gdW5kZWZpbmVkKSA/IHVwZGF0ZS5zdGF0dXMgOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHVwZGF0ZS5zdGF0dXNUZXh0IHx8IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIHVybDogdXBkYXRlLnVybCB8fCB0aGlzLnVybCB8fCB1bmRlZmluZWQsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHJlc3BvbnNlIHRoYXQgcmVwcmVzZW50cyBhbiBlcnJvciBvciBmYWlsdXJlLCBlaXRoZXIgZnJvbSBhXG4gKiBub24tc3VjY2Vzc2Z1bCBIVFRQIHN0YXR1cywgYW4gZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHRoZSByZXF1ZXN0LFxuICogb3Igc29tZSBvdGhlciBmYWlsdXJlIHdoaWNoIG9jY3VycmVkIGR1cmluZyB0aGUgcGFyc2luZyBvZiB0aGUgcmVzcG9uc2UuXG4gKlxuICogQW55IGVycm9yIHJldHVybmVkIG9uIHRoZSBgT2JzZXJ2YWJsZWAgcmVzcG9uc2Ugc3RyZWFtIHdpbGwgYmVcbiAqIHdyYXBwZWQgaW4gYW4gYEh0dHBFcnJvclJlc3BvbnNlYCB0byBwcm92aWRlIGFkZGl0aW9uYWwgY29udGV4dCBhYm91dFxuICogdGhlIHN0YXRlIG9mIHRoZSBIVFRQIGxheWVyIHdoZW4gdGhlIGVycm9yIG9jY3VycmVkLiBUaGUgZXJyb3IgcHJvcGVydHlcbiAqIHdpbGwgY29udGFpbiBlaXRoZXIgYSB3cmFwcGVkIEVycm9yIG9iamVjdCBvciB0aGUgZXJyb3IgcmVzcG9uc2UgcmV0dXJuZWRcbiAqIGZyb20gdGhlIHNlcnZlci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwRXJyb3JSZXNwb25zZSBleHRlbmRzIEh0dHBSZXNwb25zZUJhc2UgaW1wbGVtZW50cyBFcnJvciB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnSHR0cEVycm9yUmVzcG9uc2UnO1xuICByZWFkb25seSBtZXNzYWdlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGVycm9yOiBhbnl8bnVsbDtcblxuICAvKipcbiAgICogRXJyb3JzIGFyZSBuZXZlciBva2F5LCBldmVuIHdoZW4gdGhlIHN0YXR1cyBjb2RlIGlzIGluIHRoZSAyeHggc3VjY2VzcyByYW5nZS5cbiAgICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IG9rID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoaW5pdDoge1xuICAgIGVycm9yPzogYW55O1xuICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycztcbiAgICBzdGF0dXM/OiBudW1iZXI7XG4gICAgc3RhdHVzVGV4dD86IHN0cmluZztcbiAgICB1cmw/OiBzdHJpbmc7XG4gIH0pIHtcbiAgICAvLyBJbml0aWFsaXplIHdpdGggYSBkZWZhdWx0IHN0YXR1cyBvZiAwIC8gVW5rbm93biBFcnJvci5cbiAgICBzdXBlcihpbml0LCAwLCAnVW5rbm93biBFcnJvcicpO1xuXG4gICAgLy8gSWYgdGhlIHJlc3BvbnNlIHdhcyBzdWNjZXNzZnVsLCB0aGVuIHRoaXMgd2FzIGEgcGFyc2UgZXJyb3IuIE90aGVyd2lzZSwgaXQgd2FzXG4gICAgLy8gYSBwcm90b2NvbC1sZXZlbCBmYWlsdXJlIG9mIHNvbWUgc29ydC4gRWl0aGVyIHRoZSByZXF1ZXN0IGZhaWxlZCBpbiB0cmFuc2l0XG4gICAgLy8gb3IgdGhlIHNlcnZlciByZXR1cm5lZCBhbiB1bnN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUuXG4gICAgaWYgKHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgdGhpcy5tZXNzYWdlID0gYEh0dHAgZmFpbHVyZSBkdXJpbmcgcGFyc2luZyBmb3IgJHtpbml0LnVybCB8fCAnKHVua25vd24gdXJsKSd9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tZXNzYWdlID0gYEh0dHAgZmFpbHVyZSByZXNwb25zZSBmb3IgJHtpbml0LnVybCB8fCAnKHVua25vd24gdXJsKSd9OiAke2luaXQuc3RhdHVzfSAke1xuICAgICAgICAgIGluaXQuc3RhdHVzVGV4dH1gO1xuICAgIH1cbiAgICB0aGlzLmVycm9yID0gaW5pdC5lcnJvciB8fCBudWxsO1xuICB9XG59XG5cbi8qKlxuICogSHR0cCBzdGF0dXMgY29kZXMuXG4gKiBBcyBwZXIgaHR0cHM6Ly93d3cuaWFuYS5vcmcvYXNzaWdubWVudHMvaHR0cC1zdGF0dXMtY29kZXMvaHR0cC1zdGF0dXMtY29kZXMueGh0bWxcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gSHR0cFN0YXR1c0NvZGUge1xuICBDb250aW51ZSA9IDEwMCxcbiAgU3dpdGNoaW5nUHJvdG9jb2xzID0gMTAxLFxuICBQcm9jZXNzaW5nID0gMTAyLFxuICBFYXJseUhpbnRzID0gMTAzLFxuXG4gIE9rID0gMjAwLFxuICBDcmVhdGVkID0gMjAxLFxuICBBY2NlcHRlZCA9IDIwMixcbiAgTm9uQXV0aG9yaXRhdGl2ZUluZm9ybWF0aW9uID0gMjAzLFxuICBOb0NvbnRlbnQgPSAyMDQsXG4gIFJlc2V0Q29udGVudCA9IDIwNSxcbiAgUGFydGlhbENvbnRlbnQgPSAyMDYsXG4gIE11bHRpU3RhdHVzID0gMjA3LFxuICBBbHJlYWR5UmVwb3J0ZWQgPSAyMDgsXG4gIEltVXNlZCA9IDIyNixcblxuICBNdWx0aXBsZUNob2ljZXMgPSAzMDAsXG4gIE1vdmVkUGVybWFuZW50bHkgPSAzMDEsXG4gIEZvdW5kID0gMzAyLFxuICBTZWVPdGhlciA9IDMwMyxcbiAgTm90TW9kaWZpZWQgPSAzMDQsXG4gIFVzZVByb3h5ID0gMzA1LFxuICBVbnVzZWQgPSAzMDYsXG4gIFRlbXBvcmFyeVJlZGlyZWN0ID0gMzA3LFxuICBQZXJtYW5lbnRSZWRpcmVjdCA9IDMwOCxcblxuICBCYWRSZXF1ZXN0ID0gNDAwLFxuICBVbmF1dGhvcml6ZWQgPSA0MDEsXG4gIFBheW1lbnRSZXF1aXJlZCA9IDQwMixcbiAgRm9yYmlkZGVuID0gNDAzLFxuICBOb3RGb3VuZCA9IDQwNCxcbiAgTWV0aG9kTm90QWxsb3dlZCA9IDQwNSxcbiAgTm90QWNjZXB0YWJsZSA9IDQwNixcbiAgUHJveHlBdXRoZW50aWNhdGlvblJlcXVpcmVkID0gNDA3LFxuICBSZXF1ZXN0VGltZW91dCA9IDQwOCxcbiAgQ29uZmxpY3QgPSA0MDksXG4gIEdvbmUgPSA0MTAsXG4gIExlbmd0aFJlcXVpcmVkID0gNDExLFxuICBQcmVjb25kaXRpb25GYWlsZWQgPSA0MTIsXG4gIFBheWxvYWRUb29MYXJnZSA9IDQxMyxcbiAgVXJpVG9vTG9uZyA9IDQxNCxcbiAgVW5zdXBwb3J0ZWRNZWRpYVR5cGUgPSA0MTUsXG4gIFJhbmdlTm90U2F0aXNmaWFibGUgPSA0MTYsXG4gIEV4cGVjdGF0aW9uRmFpbGVkID0gNDE3LFxuICBJbUFUZWFwb3QgPSA0MTgsXG4gIE1pc2RpcmVjdGVkUmVxdWVzdCA9IDQyMSxcbiAgVW5wcm9jZXNzYWJsZUVudGl0eSA9IDQyMixcbiAgTG9ja2VkID0gNDIzLFxuICBGYWlsZWREZXBlbmRlbmN5ID0gNDI0LFxuICBUb29FYXJseSA9IDQyNSxcbiAgVXBncmFkZVJlcXVpcmVkID0gNDI2LFxuICBQcmVjb25kaXRpb25SZXF1aXJlZCA9IDQyOCxcbiAgVG9vTWFueVJlcXVlc3RzID0gNDI5LFxuICBSZXF1ZXN0SGVhZGVyRmllbGRzVG9vTGFyZ2UgPSA0MzEsXG4gIFVuYXZhaWxhYmxlRm9yTGVnYWxSZWFzb25zID0gNDUxLFxuXG4gIEludGVybmFsU2VydmVyRXJyb3IgPSA1MDAsXG4gIE5vdEltcGxlbWVudGVkID0gNTAxLFxuICBCYWRHYXRld2F5ID0gNTAyLFxuICBTZXJ2aWNlVW5hdmFpbGFibGUgPSA1MDMsXG4gIEdhdGV3YXlUaW1lb3V0ID0gNTA0LFxuICBIdHRwVmVyc2lvbk5vdFN1cHBvcnRlZCA9IDUwNSxcbiAgVmFyaWFudEFsc29OZWdvdGlhdGVzID0gNTA2LFxuICBJbnN1ZmZpY2llbnRTdG9yYWdlID0gNTA3LFxuICBMb29wRGV0ZWN0ZWQgPSA1MDgsXG4gIE5vdEV4dGVuZGVkID0gNTEwLFxuICBOZXR3b3JrQXV0aGVudGljYXRpb25SZXF1aXJlZCA9IDUxMVxufVxuIl19