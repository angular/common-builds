/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
import * as i0 from "@angular/core";
const XSSI_PREFIX = /^\)\]\}',?\n/;
const REQUEST_URL_HEADER = `X-Request-URL`;
/**
 * Determine an appropriate URL for the response, by checking either
 * response url or the X-Request-URL header.
 */
function getResponseUrl(response) {
    if (response.url) {
        return response.url;
    }
    // stored as lowercase in the map
    const xRequestUrl = REQUEST_URL_HEADER.toLocaleLowerCase();
    return response.headers.get(xRequestUrl);
}
/**
 * Uses `fetch` to send requests to a backend server.
 *
 * This `FetchBackend` requires the support of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which is available on all
 * supported browsers and on Node.js v18 or later.
 *
 * @see {@link HttpHandler}
 *
 * @publicApi
 * @developerPreview
 */
export class FetchBackend {
    constructor() {
        // We need to bind the native fetch to its context or it will throw an "illegal invocation"
        this.fetchImpl = inject(FetchFactory, { optional: true })?.fetch ?? fetch.bind(globalThis);
        this.ngZone = inject(NgZone);
    }
    handle(request) {
        return new Observable(observer => {
            const aborter = new AbortController();
            this.doRequest(request, aborter.signal, observer)
                .then(noop, error => observer.error(new HttpErrorResponse({ error })));
            return () => aborter.abort();
        });
    }
    async doRequest(request, signal, observer) {
        const init = this.createRequestInit(request);
        let response;
        try {
            const fetchPromise = this.fetchImpl(request.urlWithParams, { signal, ...init });
            // Make sure Zone.js doesn't trigger false-positive unhandled promise
            // error in case the Promise is rejected synchronously. See function
            // description for additional information.
            silenceSuperfluousUnhandledPromiseRejection(fetchPromise);
            // Send the `Sent` event before awaiting the response.
            observer.next({ type: HttpEventType.Sent });
            response = await fetchPromise;
        }
        catch (error) {
            observer.error(new HttpErrorResponse({
                error,
                status: error.status ?? 0,
                statusText: error.statusText,
                url: request.urlWithParams,
                headers: error.headers,
            }));
            return;
        }
        const headers = new HttpHeaders(response.headers);
        const statusText = response.statusText;
        const url = getResponseUrl(response) ?? request.urlWithParams;
        let status = response.status;
        let body = null;
        if (request.reportProgress) {
            observer.next(new HttpHeaderResponse({ headers, status, statusText, url }));
        }
        if (response.body) {
            // Read Progress
            const contentLength = response.headers.get('content-length');
            const chunks = [];
            const reader = response.body.getReader();
            let receivedLength = 0;
            let decoder;
            let partialText;
            const reqZone = Zone.current;
            // Perform response processing outside of Angular zone to
            // ensure no excessive change detection runs are executed
            // Here calling the async ReadableStreamDefaultReader.read() is responsible for triggering CD
            await this.ngZone.runOutsideAngular(async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    chunks.push(value);
                    receivedLength += value.length;
                    if (request.reportProgress) {
                        partialText = request.responseType === 'text' ?
                            (partialText ?? '') + (decoder ??= new TextDecoder).decode(value, { stream: true }) :
                            undefined;
                        reqZone.run(() => observer.next({
                            type: HttpEventType.DownloadProgress,
                            total: contentLength ? +contentLength : undefined,
                            loaded: receivedLength,
                            partialText,
                        }));
                    }
                }
            });
            // Combine all chunks.
            const chunksAll = this.concatChunks(chunks, receivedLength);
            try {
                body = this.parseBody(request, chunksAll);
            }
            catch (error) {
                // Body loading or parsing failed
                observer.error(new HttpErrorResponse({
                    error,
                    headers: new HttpHeaders(response.headers),
                    status: response.status,
                    statusText: response.statusText,
                    url: getResponseUrl(response) ?? request.urlWithParams,
                }));
                return;
            }
        }
        // Same behavior as the XhrBackend
        if (status === 0) {
            status = body ? 200 /* HttpStatusCode.Ok */ : 0;
        }
        // ok determines whether the response will be transmitted on the event or
        // error channel. Unsuccessful status codes (not 2xx) will always be errors,
        // but a successful status code can still result in an error if the user
        // asked for JSON data and the body cannot be parsed as such.
        const ok = status >= 200 && status < 300;
        if (ok) {
            observer.next(new HttpResponse({
                body,
                headers,
                status,
                statusText,
                url,
            }));
            // The full body has been received and delivered, no further events
            // are possible. This request is complete.
            observer.complete();
        }
        else {
            observer.error(new HttpErrorResponse({
                error: body,
                headers,
                status,
                statusText,
                url,
            }));
        }
    }
    parseBody(request, binContent) {
        switch (request.responseType) {
            case 'json':
                // stripping the XSSI when present
                const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX, '');
                return text === '' ? null : JSON.parse(text);
            case 'text':
                return new TextDecoder().decode(binContent);
            case 'blob':
                return new Blob([binContent]);
            case 'arraybuffer':
                return binContent.buffer;
        }
    }
    createRequestInit(req) {
        // We could share some of this logic with the XhrBackend
        const headers = {};
        const credentials = req.withCredentials ? 'include' : undefined;
        // Setting all the requested headers.
        req.headers.forEach((name, values) => (headers[name] = values.join(',')));
        // Add an Accept header if one isn't present already.
        headers['Accept'] ??= 'application/json, text/plain, */*';
        // Auto-detect the Content-Type header if one isn't present already.
        if (!headers['Content-Type']) {
            const detectedType = req.detectContentTypeHeader();
            // Sometimes Content-Type detection fails.
            if (detectedType !== null) {
                headers['Content-Type'] = detectedType;
            }
        }
        return {
            body: req.serializeBody(),
            method: req.method,
            headers,
            credentials,
        };
    }
    concatChunks(chunks, totalLength) {
        const chunksAll = new Uint8Array(totalLength);
        let position = 0;
        for (const chunk of chunks) {
            chunksAll.set(chunk, position);
            position += chunk.length;
        }
        return chunksAll;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.0-next.2+sha-b76088d", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.0-next.2+sha-b76088d", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.0-next.2+sha-b76088d", ngImport: i0, type: FetchBackend, decorators: [{
            type: Injectable
        }] });
/**
 * Abstract class to provide a mocked implementation of `fetch()`
 */
export class FetchFactory {
}
function noop() { }
/**
 * Zone.js treats a rejected promise that has not yet been awaited
 * as an unhandled error. This function adds a noop `.then` to make
 * sure that Zone.js doesn't throw an error if the Promise is rejected
 * synchronously.
 */
function silenceSuperfluousUnhandledPromiseRejection(promise) {
    promise.then(noop, noop);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQWlCLE1BQU0sWUFBWSxDQUFDOztBQUVwSixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7QUFFbkMsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7QUFFM0M7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsUUFBa0I7SUFDeEMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFO1FBQ2hCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQztLQUNyQjtJQUNELGlDQUFpQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzNELE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBRUgsTUFBTSxPQUFPLFlBQVk7SUFEekI7UUFFRSwyRkFBMkY7UUFDMUUsY0FBUyxHQUN0QixNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0QsV0FBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQXNNMUM7SUFw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QUFHLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNuRCwwQ0FBMEM7WUFDMUMsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO2dCQUN6QixPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsWUFBWSxDQUFDO2FBQ3hDO1NBQ0Y7UUFFRCxPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUcsQ0FBQyxhQUFhLEVBQUU7WUFDekIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLE9BQU87WUFDUCxXQUFXO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFFTyxZQUFZLENBQUMsTUFBb0IsRUFBRSxXQUFtQjtRQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDMUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0IsUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDMUI7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO3lIQXpNVSxZQUFZOzZIQUFaLFlBQVk7O3NHQUFaLFlBQVk7a0JBRHhCLFVBQVU7O0FBNk1YOztHQUVHO0FBQ0gsTUFBTSxPQUFnQixZQUFZO0NBRWpDO0FBRUQsU0FBUyxJQUFJLEtBQVUsQ0FBQztBQUV4Qjs7Ozs7R0FLRztBQUNILFNBQVMsMkNBQTJDLENBQUMsT0FBeUI7SUFDNUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luamVjdCwgSW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwSGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQsIEh0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBFdmVudFR5cGUsIEh0dHBIZWFkZXJSZXNwb25zZSwgSHR0cFJlc3BvbnNlLCBIdHRwU3RhdHVzQ29kZX0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmNvbnN0IFhTU0lfUFJFRklYID0gL15cXClcXF1cXH0nLD9cXG4vO1xuXG5jb25zdCBSRVFVRVNUX1VSTF9IRUFERVIgPSBgWC1SZXF1ZXN0LVVSTGA7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGFuIGFwcHJvcHJpYXRlIFVSTCBmb3IgdGhlIHJlc3BvbnNlLCBieSBjaGVja2luZyBlaXRoZXJcbiAqIHJlc3BvbnNlIHVybCBvciB0aGUgWC1SZXF1ZXN0LVVSTCBoZWFkZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlVXJsKHJlc3BvbnNlOiBSZXNwb25zZSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKHJlc3BvbnNlLnVybCkge1xuICAgIHJldHVybiByZXNwb25zZS51cmw7XG4gIH1cbiAgLy8gc3RvcmVkIGFzIGxvd2VyY2FzZSBpbiB0aGUgbWFwXG4gIGNvbnN0IHhSZXF1ZXN0VXJsID0gUkVRVUVTVF9VUkxfSEVBREVSLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gIHJldHVybiByZXNwb25zZS5oZWFkZXJzLmdldCh4UmVxdWVzdFVybCk7XG59XG5cbi8qKlxuICogVXNlcyBgZmV0Y2hgIHRvIHNlbmQgcmVxdWVzdHMgdG8gYSBiYWNrZW5kIHNlcnZlci5cbiAqXG4gKiBUaGlzIGBGZXRjaEJhY2tlbmRgIHJlcXVpcmVzIHRoZSBzdXBwb3J0IG9mIHRoZVxuICogW0ZldGNoIEFQSV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0ZldGNoX0FQSSkgd2hpY2ggaXMgYXZhaWxhYmxlIG9uIGFsbFxuICogc3VwcG9ydGVkIGJyb3dzZXJzIGFuZCBvbiBOb2RlLmpzIHYxOCBvciBsYXRlci5cbiAqXG4gKiBAc2VlIHtAbGluayBIdHRwSGFuZGxlcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmV0Y2hCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICAvLyBXZSBuZWVkIHRvIGJpbmQgdGhlIG5hdGl2ZSBmZXRjaCB0byBpdHMgY29udGV4dCBvciBpdCB3aWxsIHRocm93IGFuIFwiaWxsZWdhbCBpbnZvY2F0aW9uXCJcbiAgcHJpdmF0ZSByZWFkb25seSBmZXRjaEltcGwgPVxuICAgICAgaW5qZWN0KEZldGNoRmFjdG9yeSwge29wdGlvbmFsOiB0cnVlfSk/LmZldGNoID8/IGZldGNoLmJpbmQoZ2xvYmFsVGhpcyk7XG4gIHByaXZhdGUgcmVhZG9ubHkgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgaGFuZGxlKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICAgIGNvbnN0IGFib3J0ZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICB0aGlzLmRvUmVxdWVzdChyZXF1ZXN0LCBhYm9ydGVyLnNpZ25hbCwgb2JzZXJ2ZXIpXG4gICAgICAgICAgLnRoZW4obm9vcCwgZXJyb3IgPT4gb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtlcnJvcn0pKSk7XG4gICAgICByZXR1cm4gKCkgPT4gYWJvcnRlci5hYm9ydCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBkb1JlcXVlc3QoXG4gICAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBzaWduYWw6IEFib3J0U2lnbmFsLFxuICAgICAgb2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+Pik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGluaXQgPSB0aGlzLmNyZWF0ZVJlcXVlc3RJbml0KHJlcXVlc3QpO1xuICAgIGxldCByZXNwb25zZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmZXRjaFByb21pc2UgPSB0aGlzLmZldGNoSW1wbChyZXF1ZXN0LnVybFdpdGhQYXJhbXMsIHtzaWduYWwsIC4uLmluaXR9KTtcblxuICAgICAgLy8gTWFrZSBzdXJlIFpvbmUuanMgZG9lc24ndCB0cmlnZ2VyIGZhbHNlLXBvc2l0aXZlIHVuaGFuZGxlZCBwcm9taXNlXG4gICAgICAvLyBlcnJvciBpbiBjYXNlIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkIHN5bmNocm9ub3VzbHkuIFNlZSBmdW5jdGlvblxuICAgICAgLy8gZGVzY3JpcHRpb24gZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAgICBzaWxlbmNlU3VwZXJmbHVvdXNVbmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uKGZldGNoUHJvbWlzZSk7XG5cbiAgICAgIC8vIFNlbmQgdGhlIGBTZW50YCBldmVudCBiZWZvcmUgYXdhaXRpbmcgdGhlIHJlc3BvbnNlLlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hQcm9taXNlO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgIGVycm9yLFxuICAgICAgICBzdGF0dXM6IGVycm9yLnN0YXR1cyA/PyAwLFxuICAgICAgICBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0LFxuICAgICAgICB1cmw6IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgaGVhZGVyczogZXJyb3IuaGVhZGVycyxcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpO1xuICAgIGNvbnN0IHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0dXNUZXh0O1xuICAgIGNvbnN0IHVybCA9IGdldFJlc3BvbnNlVXJsKHJlc3BvbnNlKSA/PyByZXF1ZXN0LnVybFdpdGhQYXJhbXM7XG5cbiAgICBsZXQgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgIGxldCBib2R5OiBzdHJpbmd8QXJyYXlCdWZmZXJ8QmxvYnxvYmplY3R8bnVsbCA9IG51bGw7XG5cbiAgICBpZiAocmVxdWVzdC5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UuYm9keSkge1xuICAgICAgLy8gUmVhZCBQcm9ncmVzc1xuICAgICAgY29uc3QgY29udGVudExlbmd0aCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LWxlbmd0aCcpO1xuICAgICAgY29uc3QgY2h1bmtzOiBVaW50OEFycmF5W10gPSBbXTtcbiAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG4gICAgICBsZXQgcmVjZWl2ZWRMZW5ndGggPSAwO1xuXG4gICAgICBsZXQgZGVjb2RlcjogVGV4dERlY29kZXI7XG4gICAgICBsZXQgcGFydGlhbFRleHQ6IHN0cmluZ3x1bmRlZmluZWQ7XG5cbiAgICAgIGNvbnN0IHJlcVpvbmUgPSBab25lLmN1cnJlbnQ7XG5cbiAgICAgIC8vIFBlcmZvcm0gcmVzcG9uc2UgcHJvY2Vzc2luZyBvdXRzaWRlIG9mIEFuZ3VsYXIgem9uZSB0b1xuICAgICAgLy8gZW5zdXJlIG5vIGV4Y2Vzc2l2ZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgYXJlIGV4ZWN1dGVkXG4gICAgICAvLyBIZXJlIGNhbGxpbmcgdGhlIGFzeW5jIFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlci5yZWFkKCkgaXMgcmVzcG9uc2libGUgZm9yIHRyaWdnZXJpbmcgQ0RcbiAgICAgIGF3YWl0IHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGFzeW5jICgpID0+IHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCB7ZG9uZSwgdmFsdWV9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcblxuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjaHVua3MucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgcmVjZWl2ZWRMZW5ndGggKz0gdmFsdWUubGVuZ3RoO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHBhcnRpYWxUZXh0ID0gcmVxdWVzdC5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/XG4gICAgICAgICAgICAgICAgKHBhcnRpYWxUZXh0ID8/ICcnKSArIChkZWNvZGVyID8/PSBuZXcgVGV4dERlY29kZXIpLmRlY29kZSh2YWx1ZSwge3N0cmVhbTogdHJ1ZX0pIDpcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHJlcVpvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQoe1xuICAgICAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgIHRvdGFsOiBjb250ZW50TGVuZ3RoID8gK2NvbnRlbnRMZW5ndGggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIGxvYWRlZDogcmVjZWl2ZWRMZW5ndGgsXG4gICAgICAgICAgICAgIHBhcnRpYWxUZXh0LFxuICAgICAgICAgICAgfSBhcyBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQ29tYmluZSBhbGwgY2h1bmtzLlxuICAgICAgY29uc3QgY2h1bmtzQWxsID0gdGhpcy5jb25jYXRDaHVua3MoY2h1bmtzLCByZWNlaXZlZExlbmd0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBib2R5ID0gdGhpcy5wYXJzZUJvZHkocmVxdWVzdCwgY2h1bmtzQWxsKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIEJvZHkgbG9hZGluZyBvciBwYXJzaW5nIGZhaWxlZFxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKSxcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgIHVybDogZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2UpID8/IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2FtZSBiZWhhdmlvciBhcyB0aGUgWGhyQmFja2VuZFxuICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgIHN0YXR1cyA9IGJvZHkgPyBIdHRwU3RhdHVzQ29kZS5PayA6IDA7XG4gICAgfVxuXG4gICAgLy8gb2sgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZXNwb25zZSB3aWxsIGJlIHRyYW5zbWl0dGVkIG9uIHRoZSBldmVudCBvclxuICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAvLyBidXQgYSBzdWNjZXNzZnVsIHN0YXR1cyBjb2RlIGNhbiBzdGlsbCByZXN1bHQgaW4gYW4gZXJyb3IgaWYgdGhlIHVzZXJcbiAgICAvLyBhc2tlZCBmb3IgSlNPTiBkYXRhIGFuZCB0aGUgYm9keSBjYW5ub3QgYmUgcGFyc2VkIGFzIHN1Y2guXG4gICAgY29uc3Qgb2sgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcblxuICAgIGlmIChvaykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgYm9keSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICB1cmwsXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgdXJsLFxuICAgICAgfSkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VCb2R5KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIGJpbkNvbnRlbnQ6IFVpbnQ4QXJyYXkpOiBzdHJpbmd8QXJyYXlCdWZmZXJ8QmxvYlxuICAgICAgfG9iamVjdHxudWxsIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QucmVzcG9uc2VUeXBlKSB7XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgLy8gc3RyaXBwaW5nIHRoZSBYU1NJIHdoZW4gcHJlc2VudFxuICAgICAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJpbkNvbnRlbnQpLnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgcmV0dXJuIHRleHQgPT09ICcnID8gbnVsbCA6IEpTT04ucGFyc2UodGV4dCkgYXMgb2JqZWN0O1xuICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYmluQ29udGVudCk7XG4gICAgICBjYXNlICdibG9iJzpcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKFtiaW5Db250ZW50XSk7XG4gICAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICAgIHJldHVybiBiaW5Db250ZW50LmJ1ZmZlcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlcXVlc3RJbml0KHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IFJlcXVlc3RJbml0IHtcbiAgICAvLyBXZSBjb3VsZCBzaGFyZSBzb21lIG9mIHRoaXMgbG9naWMgd2l0aCB0aGUgWGhyQmFja2VuZFxuXG4gICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGNyZWRlbnRpYWxzOiBSZXF1ZXN0Q3JlZGVudGlhbHN8dW5kZWZpbmVkID0gcmVxLndpdGhDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6IHVuZGVmaW5lZDtcblxuICAgIC8vIFNldHRpbmcgYWxsIHRoZSByZXF1ZXN0ZWQgaGVhZGVycy5cbiAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IChoZWFkZXJzW25hbWVdID0gdmFsdWVzLmpvaW4oJywnKSkpO1xuXG4gICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICBoZWFkZXJzWydBY2NlcHQnXSA/Pz0gJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKic7XG5cbiAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGlmICghaGVhZGVyc1snQ29udGVudC1UeXBlJ10pIHtcbiAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgLy8gU29tZXRpbWVzIENvbnRlbnQtVHlwZSBkZXRlY3Rpb24gZmFpbHMuXG4gICAgICBpZiAoZGV0ZWN0ZWRUeXBlICE9PSBudWxsKSB7XG4gICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gZGV0ZWN0ZWRUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBib2R5OiByZXEuc2VyaWFsaXplQm9keSgpLFxuICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGNyZWRlbnRpYWxzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbmNhdENodW5rcyhjaHVua3M6IFVpbnQ4QXJyYXlbXSwgdG90YWxMZW5ndGg6IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IGNodW5rc0FsbCA9IG5ldyBVaW50OEFycmF5KHRvdGFsTGVuZ3RoKTtcbiAgICBsZXQgcG9zaXRpb24gPSAwO1xuICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICBjaHVua3NBbGwuc2V0KGNodW5rLCBwb3NpdGlvbik7XG4gICAgICBwb3NpdGlvbiArPSBjaHVuay5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNodW5rc0FsbDtcbiAgfVxufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHRvIHByb3ZpZGUgYSBtb2NrZWQgaW1wbGVtZW50YXRpb24gb2YgYGZldGNoKClgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGZXRjaEZhY3Rvcnkge1xuICBhYnN0cmFjdCBmZXRjaDogdHlwZW9mIGZldGNoO1xufVxuXG5mdW5jdGlvbiBub29wKCk6IHZvaWQge31cblxuLyoqXG4gKiBab25lLmpzIHRyZWF0cyBhIHJlamVjdGVkIHByb21pc2UgdGhhdCBoYXMgbm90IHlldCBiZWVuIGF3YWl0ZWRcbiAqIGFzIGFuIHVuaGFuZGxlZCBlcnJvci4gVGhpcyBmdW5jdGlvbiBhZGRzIGEgbm9vcCBgLnRoZW5gIHRvIG1ha2VcbiAqIHN1cmUgdGhhdCBab25lLmpzIGRvZXNuJ3QgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIHN5bmNocm9ub3VzbHkuXG4gKi9cbmZ1bmN0aW9uIHNpbGVuY2VTdXBlcmZsdW91c1VuaGFuZGxlZFByb21pc2VSZWplY3Rpb24ocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPikge1xuICBwcm9taXNlLnRoZW4obm9vcCwgbm9vcCk7XG59XG4iXX0=