/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable } from '@angular/core';
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
                    observer.next({
                        type: HttpEventType.DownloadProgress,
                        total: contentLength ? +contentLength : undefined,
                        loaded: receivedLength,
                        partialText,
                    });
                }
            }
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.0-next.1+sha-4782336", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.0-next.1+sha-4782336", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.0-next.1+sha-4782336", ngImport: i0, type: FetchBackend, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBVyxNQUFNLE1BQU0sQ0FBQztBQUcxQyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRXRDLE9BQU8sRUFBNEIsaUJBQWlCLEVBQWEsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBaUIsTUFBTSxZQUFZLENBQUM7O0FBRXBKLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQztBQUVuQyxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQztBQUUzQzs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxRQUFrQjtJQUN4QyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7UUFDaEIsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDO0tBQ3JCO0lBQ0QsaUNBQWlDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0QsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFFSCxNQUFNLE9BQU8sWUFBWTtJQUR6QjtRQUVFLDJGQUEyRjtRQUMxRSxjQUFTLEdBQ3RCLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsRUFBRSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQStMN0U7SUE3TEMsTUFBTSxDQUFDLE9BQXlCO1FBQzlCLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxD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QUMsTUFBb0IsRUFBRSxXQUFtQjtRQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDMUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0IsUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDMUI7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO3lIQWpNVSxZQUFZOzZIQUFaLFlBQVk7O3NHQUFaLFlBQVk7a0JBRHhCLFVBQVU7O0FBcU1YOztHQUVHO0FBQ0gsTUFBTSxPQUFnQixZQUFZO0NBRWpDO0FBRUQsU0FBUyxJQUFJLEtBQVUsQ0FBQztBQUV4Qjs7Ozs7R0FLRztBQUNILFNBQVMsMkNBQTJDLENBQUMsT0FBeUI7SUFDNUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50LCBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwSGVhZGVyUmVzcG9uc2UsIEh0dHBSZXNwb25zZSwgSHR0cFN0YXR1c0NvZGV9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuY29uc3QgUkVRVUVTVF9VUkxfSEVBREVSID0gYFgtUmVxdWVzdC1VUkxgO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiByZXNwb25zZSB1cmwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybChyZXNwb25zZTogUmVzcG9uc2UpOiBzdHJpbmd8bnVsbCB7XG4gIGlmIChyZXNwb25zZS51cmwpIHtcbiAgICByZXR1cm4gcmVzcG9uc2UudXJsO1xuICB9XG4gIC8vIHN0b3JlZCBhcyBsb3dlcmNhc2UgaW4gdGhlIG1hcFxuICBjb25zdCB4UmVxdWVzdFVybCA9IFJFUVVFU1RfVVJMX0hFQURFUi50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICByZXR1cm4gcmVzcG9uc2UuaGVhZGVycy5nZXQoeFJlcXVlc3RVcmwpO1xufVxuXG4vKipcbiAqIFVzZXMgYGZldGNoYCB0byBzZW5kIHJlcXVlc3RzIHRvIGEgYmFja2VuZCBzZXJ2ZXIuXG4gKlxuICogVGhpcyBgRmV0Y2hCYWNrZW5kYCByZXF1aXJlcyB0aGUgc3VwcG9ydCBvZiB0aGVcbiAqIFtGZXRjaCBBUEldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9GZXRjaF9BUEkpIHdoaWNoIGlzIGF2YWlsYWJsZSBvbiBhbGxcbiAqIHN1cHBvcnRlZCBicm93c2VycyBhbmQgb24gTm9kZS5qcyB2MTggb3IgbGF0ZXIuXG4gKlxuICogQHNlZSB7QGxpbmsgSHR0cEhhbmRsZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICogQGRldmVsb3BlclByZXZpZXdcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEZldGNoQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgLy8gV2UgbmVlZCB0byBiaW5kIHRoZSBuYXRpdmUgZmV0Y2ggdG8gaXRzIGNvbnRleHQgb3IgaXQgd2lsbCB0aHJvdyBhbiBcImlsbGVnYWwgaW52b2NhdGlvblwiXG4gIHByaXZhdGUgcmVhZG9ubHkgZmV0Y2hJbXBsID1cbiAgICAgIGluamVjdChGZXRjaEZhY3RvcnksIHtvcHRpb25hbDogdHJ1ZX0pPy5mZXRjaCA/PyBmZXRjaC5iaW5kKGdsb2JhbFRoaXMpO1xuXG4gIGhhbmRsZShyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgICBjb25zdCBhYm9ydGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgdGhpcy5kb1JlcXVlc3QocmVxdWVzdCwgYWJvcnRlci5zaWduYWwsIG9ic2VydmVyKVxuICAgICAgICAgIC50aGVuKG5vb3AsIGVycm9yID0+IG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7ZXJyb3J9KSkpO1xuICAgICAgcmV0dXJuICgpID0+IGFib3J0ZXIuYWJvcnQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9SZXF1ZXN0KFxuICAgICAgcmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Piwgc2lnbmFsOiBBYm9ydFNpZ25hbCxcbiAgICAgIG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBpbml0ID0gdGhpcy5jcmVhdGVSZXF1ZXN0SW5pdChyZXF1ZXN0KTtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmV0Y2hQcm9taXNlID0gdGhpcy5mZXRjaEltcGwocmVxdWVzdC51cmxXaXRoUGFyYW1zLCB7c2lnbmFsLCAuLi5pbml0fSk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBab25lLmpzIGRvZXNuJ3QgdHJpZ2dlciBmYWxzZS1wb3NpdGl2ZSB1bmhhbmRsZWQgcHJvbWlzZVxuICAgICAgLy8gZXJyb3IgaW4gY2FzZSB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCBzeW5jaHJvbm91c2x5LiBTZWUgZnVuY3Rpb25cbiAgICAgIC8vIGRlc2NyaXB0aW9uIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICAgICAgc2lsZW5jZVN1cGVyZmx1b3VzVW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbihmZXRjaFByb21pc2UpO1xuXG4gICAgICAvLyBTZW5kIHRoZSBgU2VudGAgZXZlbnQgYmVmb3JlIGF3YWl0aW5nIHRoZSByZXNwb25zZS5cbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoUHJvbWlzZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICBlcnJvcixcbiAgICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgPz8gMCxcbiAgICAgICAgc3RhdHVzVGV4dDogZXJyb3Iuc3RhdHVzVGV4dCxcbiAgICAgICAgdXJsOiByZXF1ZXN0LnVybFdpdGhQYXJhbXMsXG4gICAgICAgIGhlYWRlcnM6IGVycm9yLmhlYWRlcnMsXG4gICAgICB9KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKTtcbiAgICBjb25zdCBzdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dDtcbiAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybChyZXNwb25zZSkgPz8gcmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuXG4gICAgbGV0IHN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgICBsZXQgYm9keTogc3RyaW5nfEFycmF5QnVmZmVyfEJsb2J8b2JqZWN0fG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHJlcXVlc3QucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgIG9ic2VydmVyLm5leHQobmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KSk7XG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLmJvZHkpIHtcbiAgICAgIC8vIFJlYWQgUHJvZ3Jlc3NcbiAgICAgIGNvbnN0IGNvbnRlbnRMZW5ndGggPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC1sZW5ndGgnKTtcbiAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XG4gICAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LmdldFJlYWRlcigpO1xuICAgICAgbGV0IHJlY2VpdmVkTGVuZ3RoID0gMDtcblxuICAgICAgbGV0IGRlY29kZXI6IFRleHREZWNvZGVyO1xuICAgICAgbGV0IHBhcnRpYWxUZXh0OiBzdHJpbmd8dW5kZWZpbmVkO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCB7ZG9uZSwgdmFsdWV9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcblxuICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2h1bmtzLnB1c2godmFsdWUpO1xuICAgICAgICByZWNlaXZlZExlbmd0aCArPSB2YWx1ZS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHJlcXVlc3QucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICBwYXJ0aWFsVGV4dCA9IHJlcXVlc3QucmVzcG9uc2VUeXBlID09PSAndGV4dCcgP1xuICAgICAgICAgICAgICAocGFydGlhbFRleHQgPz8gJycpICsgKGRlY29kZXIgPz89IG5ldyBUZXh0RGVjb2RlcikuZGVjb2RlKHZhbHVlLCB7c3RyZWFtOiB0cnVlfSkgOlxuICAgICAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHtcbiAgICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcyxcbiAgICAgICAgICAgIHRvdGFsOiBjb250ZW50TGVuZ3RoID8gK2NvbnRlbnRMZW5ndGggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBsb2FkZWQ6IHJlY2VpdmVkTGVuZ3RoLFxuICAgICAgICAgICAgcGFydGlhbFRleHQsXG4gICAgICAgICAgfSBhcyBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDb21iaW5lIGFsbCBjaHVua3MuXG4gICAgICBjb25zdCBjaHVua3NBbGwgPSB0aGlzLmNvbmNhdENodW5rcyhjaHVua3MsIHJlY2VpdmVkTGVuZ3RoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGJvZHkgPSB0aGlzLnBhcnNlQm9keShyZXF1ZXN0LCBjaHVua3NBbGwpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gQm9keSBsb2FkaW5nIG9yIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgaGVhZGVyczogbmV3IEh0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpLFxuICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgdXJsOiBnZXRSZXNwb25zZVVybChyZXNwb25zZSkgPz8gcmVxdWVzdC51cmxXaXRoUGFyYW1zLFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTYW1lIGJlaGF2aW9yIGFzIHRoZSBYaHJCYWNrZW5kXG4gICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgc3RhdHVzID0gYm9keSA/IEh0dHBTdGF0dXNDb2RlLk9rIDogMDtcbiAgICB9XG5cbiAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgLy8gZXJyb3IgY2hhbm5lbC4gVW5zdWNjZXNzZnVsIHN0YXR1cyBjb2RlcyAobm90IDJ4eCkgd2lsbCBhbHdheXMgYmUgZXJyb3JzLFxuICAgIC8vIGJ1dCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgY2FuIHN0aWxsIHJlc3VsdCBpbiBhbiBlcnJvciBpZiB0aGUgdXNlclxuICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICBjb25zdCBvayA9IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuXG4gICAgaWYgKG9rKSB7XG4gICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICBib2R5LFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgIHVybCxcbiAgICAgIH0pKTtcblxuICAgICAgLy8gVGhlIGZ1bGwgYm9keSBoYXMgYmVlbiByZWNlaXZlZCBhbmQgZGVsaXZlcmVkLCBubyBmdXJ0aGVyIGV2ZW50c1xuICAgICAgLy8gYXJlIHBvc3NpYmxlLiBUaGlzIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICBlcnJvcjogYm9keSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICB1cmwsXG4gICAgICB9KSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUJvZHkocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgYmluQ29udGVudDogVWludDhBcnJheSk6IHN0cmluZ3xBcnJheUJ1ZmZlcnxCbG9iXG4gICAgICB8b2JqZWN0fG51bGwge1xuICAgIHN3aXRjaCAocmVxdWVzdC5yZXNwb25zZVR5cGUpIHtcbiAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAvLyBzdHJpcHBpbmcgdGhlIFhTU0kgd2hlbiBwcmVzZW50XG4gICAgICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYmluQ29udGVudCkucmVwbGFjZShYU1NJX1BSRUZJWCwgJycpO1xuICAgICAgICByZXR1cm4gdGV4dCA9PT0gJycgPyBudWxsIDogSlNPTi5wYXJzZSh0ZXh0KSBhcyBvYmplY3Q7XG4gICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShiaW5Db250ZW50KTtcbiAgICAgIGNhc2UgJ2Jsb2InOlxuICAgICAgICByZXR1cm4gbmV3IEJsb2IoW2JpbkNvbnRlbnRdKTtcbiAgICAgIGNhc2UgJ2FycmF5YnVmZmVyJzpcbiAgICAgICAgcmV0dXJuIGJpbkNvbnRlbnQuYnVmZmVyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVxdWVzdEluaXQocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogUmVxdWVzdEluaXQge1xuICAgIC8vIFdlIGNvdWxkIHNoYXJlIHNvbWUgb2YgdGhpcyBsb2dpYyB3aXRoIHRoZSBYaHJCYWNrZW5kXG5cbiAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3QgY3JlZGVudGlhbHM6IFJlcXVlc3RDcmVkZW50aWFsc3x1bmRlZmluZWQgPSByZXEud2l0aENyZWRlbnRpYWxzID8gJ2luY2x1ZGUnIDogdW5kZWZpbmVkO1xuXG4gICAgLy8gU2V0dGluZyBhbGwgdGhlIHJlcXVlc3RlZCBoZWFkZXJzLlxuICAgIHJlcS5oZWFkZXJzLmZvckVhY2goKG5hbWUsIHZhbHVlcykgPT4gKGhlYWRlcnNbbmFtZV0gPSB2YWx1ZXMuam9pbignLCcpKSk7XG5cbiAgICAvLyBBZGQgYW4gQWNjZXB0IGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGhlYWRlcnNbJ0FjY2VwdCddID8/PSAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJztcblxuICAgIC8vIEF1dG8tZGV0ZWN0IHRoZSBDb250ZW50LVR5cGUgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgaWYgKCFoZWFkZXJzWydDb250ZW50LVR5cGUnXSkge1xuICAgICAgY29uc3QgZGV0ZWN0ZWRUeXBlID0gcmVxLmRldGVjdENvbnRlbnRUeXBlSGVhZGVyKCk7XG4gICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgIGlmIChkZXRlY3RlZFR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBkZXRlY3RlZFR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJvZHk6IHJlcS5zZXJpYWxpemVCb2R5KCksXG4gICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICBoZWFkZXJzLFxuICAgICAgY3JlZGVudGlhbHMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29uY2F0Q2h1bmtzKGNodW5rczogVWludDhBcnJheVtdLCB0b3RhbExlbmd0aDogbnVtYmVyKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgY2h1bmtzQWxsID0gbmV3IFVpbnQ4QXJyYXkodG90YWxMZW5ndGgpO1xuICAgIGxldCBwb3NpdGlvbiA9IDA7XG4gICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgIGNodW5rc0FsbC5zZXQoY2h1bmssIHBvc2l0aW9uKTtcbiAgICAgIHBvc2l0aW9uICs9IGNodW5rLmxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2h1bmtzQWxsO1xuICB9XG59XG5cbi8qKlxuICogQWJzdHJhY3QgY2xhc3MgdG8gcHJvdmlkZSBhIG1vY2tlZCBpbXBsZW1lbnRhdGlvbiBvZiBgZmV0Y2goKWBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZldGNoRmFjdG9yeSB7XG4gIGFic3RyYWN0IGZldGNoOiB0eXBlb2YgZmV0Y2g7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKTogdm9pZCB7fVxuXG4vKipcbiAqIFpvbmUuanMgdHJlYXRzIGEgcmVqZWN0ZWQgcHJvbWlzZSB0aGF0IGhhcyBub3QgeWV0IGJlZW4gYXdhaXRlZFxuICogYXMgYW4gdW5oYW5kbGVkIGVycm9yLiBUaGlzIGZ1bmN0aW9uIGFkZHMgYSBub29wIGAudGhlbmAgdG8gbWFrZVxuICogc3VyZSB0aGF0IFpvbmUuanMgZG9lc24ndCB0aHJvdyBhbiBlcnJvciBpZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZFxuICogc3luY2hyb25vdXNseS5cbiAqL1xuZnVuY3Rpb24gc2lsZW5jZVN1cGVyZmx1b3VzVW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbihwcm9taXNlOiBQcm9taXNlPHVua25vd24+KSB7XG4gIHByb21pc2UudGhlbihub29wLCBub29wKTtcbn1cbiJdfQ==