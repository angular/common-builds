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
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse, HttpStatusCode } from './response';
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
            // We have to check whether the Zone is defined in the global scope because this may be called
            // when the zone is nooped.
            const reqZone = typeof Zone !== 'undefined' && Zone.current;
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
                        const reportProgress = () => observer.next({
                            type: HttpEventType.DownloadProgress,
                            total: contentLength ? +contentLength : undefined,
                            loaded: receivedLength,
                            partialText,
                        });
                        reqZone ? reqZone.run(reportProgress) : reportProgress();
                    }
                }
            });
            // Combine all chunks.
            const chunksAll = this.concatChunks(chunks, receivedLength);
            try {
                const contentType = response.headers.get('Content-Type') ?? '';
                body = this.parseBody(request, chunksAll, contentType);
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
            status = body ? HttpStatusCode.Ok : 0;
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
    parseBody(request, binContent, contentType) {
        switch (request.responseType) {
            case 'json':
                // stripping the XSSI when present
                const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX, '');
                return text === '' ? null : JSON.parse(text);
            case 'text':
                return new TextDecoder().decode(binContent);
            case 'blob':
                return new Blob([binContent], { type: contentType });
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-9384537", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-9384537", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-9384537", ngImport: i0, type: FetchBackend, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFDLE1BQU0sWUFBWSxDQUFDOztBQUVwSixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7QUFFbkMsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7QUFFM0M7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsUUFBa0I7SUFDeEMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDakIsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxpQ0FBaUM7SUFDakMsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMzRCxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBRUgsTUFBTSxPQUFPLFlBQVk7SUFEekI7UUFFRSwyRkFBMkY7UUFDMUUsY0FBUyxHQUN0QixNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0QsV0FBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENB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QUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDM0IsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7eUhBN01VLFlBQVk7NkhBQVosWUFBWTs7c0dBQVosWUFBWTtrQkFEeEIsVUFBVTs7QUFpTlg7O0dBRUc7QUFDSCxNQUFNLE9BQWdCLFlBQVk7Q0FFakM7QUFFRCxTQUFTLElBQUksS0FBVSxDQUFDO0FBRXhCOzs7OztHQUtHO0FBQ0gsU0FBUywyQ0FBMkMsQ0FBQyxPQUF5QjtJQUM1RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCwgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cEhlYWRlclJlc3BvbnNlLCBIdHRwUmVzcG9uc2UsIEh0dHBTdGF0dXNDb2RlfSBmcm9tICcuL3Jlc3BvbnNlJztcblxuY29uc3QgWFNTSV9QUkVGSVggPSAvXlxcKVxcXVxcfScsP1xcbi87XG5cbmNvbnN0IFJFUVVFU1RfVVJMX0hFQURFUiA9IGBYLVJlcXVlc3QtVVJMYDtcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogcmVzcG9uc2UgdXJsIG9yIHRoZSBYLVJlcXVlc3QtVVJMIGhlYWRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2U6IFJlc3BvbnNlKTogc3RyaW5nfG51bGwge1xuICBpZiAocmVzcG9uc2UudXJsKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnVybDtcbiAgfVxuICAvLyBzdG9yZWQgYXMgbG93ZXJjYXNlIGluIHRoZSBtYXBcbiAgY29uc3QgeFJlcXVlc3RVcmwgPSBSRVFVRVNUX1VSTF9IRUFERVIudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgcmV0dXJuIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KHhSZXF1ZXN0VXJsKTtcbn1cblxuLyoqXG4gKiBVc2VzIGBmZXRjaGAgdG8gc2VuZCByZXF1ZXN0cyB0byBhIGJhY2tlbmQgc2VydmVyLlxuICpcbiAqIFRoaXMgYEZldGNoQmFja2VuZGAgcmVxdWlyZXMgdGhlIHN1cHBvcnQgb2YgdGhlXG4gKiBbRmV0Y2ggQVBJXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJKSB3aGljaCBpcyBhdmFpbGFibGUgb24gYWxsXG4gKiBzdXBwb3J0ZWQgYnJvd3NlcnMgYW5kIG9uIE5vZGUuanMgdjE4IG9yIGxhdGVyLlxuICpcbiAqIEBzZWUge0BsaW5rIEh0dHBIYW5kbGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEZldGNoQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgLy8gV2UgbmVlZCB0byBiaW5kIHRoZSBuYXRpdmUgZmV0Y2ggdG8gaXRzIGNvbnRleHQgb3IgaXQgd2lsbCB0aHJvdyBhbiBcImlsbGVnYWwgaW52b2NhdGlvblwiXG4gIHByaXZhdGUgcmVhZG9ubHkgZmV0Y2hJbXBsID1cbiAgICAgIGluamVjdChGZXRjaEZhY3RvcnksIHtvcHRpb25hbDogdHJ1ZX0pPy5mZXRjaCA/PyBmZXRjaC5iaW5kKGdsb2JhbFRoaXMpO1xuICBwcml2YXRlIHJlYWRvbmx5IG5nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIGhhbmRsZShyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgICBjb25zdCBhYm9ydGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgdGhpcy5kb1JlcXVlc3QocmVxdWVzdCwgYWJvcnRlci5zaWduYWwsIG9ic2VydmVyKVxuICAgICAgICAgIC50aGVuKG5vb3AsIGVycm9yID0+IG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7ZXJyb3J9KSkpO1xuICAgICAgcmV0dXJuICgpID0+IGFib3J0ZXIuYWJvcnQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9SZXF1ZXN0KFxuICAgICAgcmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Piwgc2lnbmFsOiBBYm9ydFNpZ25hbCxcbiAgICAgIG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBpbml0ID0gdGhpcy5jcmVhdGVSZXF1ZXN0SW5pdChyZXF1ZXN0KTtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmV0Y2hQcm9taXNlID0gdGhpcy5mZXRjaEltcGwocmVxdWVzdC51cmxXaXRoUGFyYW1zLCB7c2lnbmFsLCAuLi5pbml0fSk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBab25lLmpzIGRvZXNuJ3QgdHJpZ2dlciBmYWxzZS1wb3NpdGl2ZSB1bmhhbmRsZWQgcHJvbWlzZVxuICAgICAgLy8gZXJyb3IgaW4gY2FzZSB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCBzeW5jaHJvbm91c2x5LiBTZWUgZnVuY3Rpb25cbiAgICAgIC8vIGRlc2NyaXB0aW9uIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICAgICAgc2lsZW5jZVN1cGVyZmx1b3VzVW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbihmZXRjaFByb21pc2UpO1xuXG4gICAgICAvLyBTZW5kIHRoZSBgU2VudGAgZXZlbnQgYmVmb3JlIGF3YWl0aW5nIHRoZSByZXNwb25zZS5cbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoUHJvbWlzZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICBlcnJvcixcbiAgICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgPz8gMCxcbiAgICAgICAgc3RhdHVzVGV4dDogZXJyb3Iuc3RhdHVzVGV4dCxcbiAgICAgICAgdXJsOiByZXF1ZXN0LnVybFdpdGhQYXJhbXMsXG4gICAgICAgIGhlYWRlcnM6IGVycm9yLmhlYWRlcnMsXG4gICAgICB9KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKTtcbiAgICBjb25zdCBzdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dDtcbiAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybChyZXNwb25zZSkgPz8gcmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuXG4gICAgbGV0IHN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgICBsZXQgYm9keTogc3RyaW5nfEFycmF5QnVmZmVyfEJsb2J8b2JqZWN0fG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHJlcXVlc3QucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgIG9ic2VydmVyLm5leHQobmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KSk7XG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLmJvZHkpIHtcbiAgICAgIC8vIFJlYWQgUHJvZ3Jlc3NcbiAgICAgIGNvbnN0IGNvbnRlbnRMZW5ndGggPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC1sZW5ndGgnKTtcbiAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XG4gICAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LmdldFJlYWRlcigpO1xuICAgICAgbGV0IHJlY2VpdmVkTGVuZ3RoID0gMDtcblxuICAgICAgbGV0IGRlY29kZXI6IFRleHREZWNvZGVyO1xuICAgICAgbGV0IHBhcnRpYWxUZXh0OiBzdHJpbmd8dW5kZWZpbmVkO1xuXG4gICAgICAvLyBXZSBoYXZlIHRvIGNoZWNrIHdoZXRoZXIgdGhlIFpvbmUgaXMgZGVmaW5lZCBpbiB0aGUgZ2xvYmFsIHNjb3BlIGJlY2F1c2UgdGhpcyBtYXkgYmUgY2FsbGVkXG4gICAgICAvLyB3aGVuIHRoZSB6b25lIGlzIG5vb3BlZC5cbiAgICAgIGNvbnN0IHJlcVpvbmUgPSB0eXBlb2YgWm9uZSAhPT0gJ3VuZGVmaW5lZCcgJiYgWm9uZS5jdXJyZW50O1xuXG4gICAgICAvLyBQZXJmb3JtIHJlc3BvbnNlIHByb2Nlc3Npbmcgb3V0c2lkZSBvZiBBbmd1bGFyIHpvbmUgdG9cbiAgICAgIC8vIGVuc3VyZSBubyBleGNlc3NpdmUgY2hhbmdlIGRldGVjdGlvbiBydW5zIGFyZSBleGVjdXRlZFxuICAgICAgLy8gSGVyZSBjYWxsaW5nIHRoZSBhc3luYyBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIucmVhZCgpIGlzIHJlc3BvbnNpYmxlIGZvciB0cmlnZ2VyaW5nIENEXG4gICAgICBhd2FpdCB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihhc3luYyAoKSA9PiB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY29uc3Qge2RvbmUsIHZhbHVlfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cbiAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2h1bmtzLnB1c2godmFsdWUpO1xuICAgICAgICAgIHJlY2VpdmVkTGVuZ3RoICs9IHZhbHVlLmxlbmd0aDtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0LnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgICAgICBwYXJ0aWFsVGV4dCA9IHJlcXVlc3QucmVzcG9uc2VUeXBlID09PSAndGV4dCcgP1xuICAgICAgICAgICAgICAgIChwYXJ0aWFsVGV4dCA/PyAnJykgKyAoZGVjb2RlciA/Pz0gbmV3IFRleHREZWNvZGVyKS5kZWNvZGUodmFsdWUsIHtzdHJlYW06IHRydWV9KSA6XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBjb25zdCByZXBvcnRQcm9ncmVzcyA9ICgpID0+IG9ic2VydmVyLm5leHQoe1xuICAgICAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgIHRvdGFsOiBjb250ZW50TGVuZ3RoID8gK2NvbnRlbnRMZW5ndGggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIGxvYWRlZDogcmVjZWl2ZWRMZW5ndGgsXG4gICAgICAgICAgICAgIHBhcnRpYWxUZXh0LFxuICAgICAgICAgICAgfSBhcyBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgICAgIHJlcVpvbmUgPyByZXFab25lLnJ1bihyZXBvcnRQcm9ncmVzcykgOiByZXBvcnRQcm9ncmVzcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIENvbWJpbmUgYWxsIGNodW5rcy5cbiAgICAgIGNvbnN0IGNodW5rc0FsbCA9IHRoaXMuY29uY2F0Q2h1bmtzKGNodW5rcywgcmVjZWl2ZWRMZW5ndGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgPz8gJyc7XG4gICAgICAgIGJvZHkgPSB0aGlzLnBhcnNlQm9keShyZXF1ZXN0LCBjaHVua3NBbGwsIGNvbnRlbnRUeXBlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIEJvZHkgbG9hZGluZyBvciBwYXJzaW5nIGZhaWxlZFxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKSxcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgIHVybDogZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2UpID8/IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2FtZSBiZWhhdmlvciBhcyB0aGUgWGhyQmFja2VuZFxuICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgIHN0YXR1cyA9IGJvZHkgPyBIdHRwU3RhdHVzQ29kZS5PayA6IDA7XG4gICAgfVxuXG4gICAgLy8gb2sgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZXNwb25zZSB3aWxsIGJlIHRyYW5zbWl0dGVkIG9uIHRoZSBldmVudCBvclxuICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAvLyBidXQgYSBzdWNjZXNzZnVsIHN0YXR1cyBjb2RlIGNhbiBzdGlsbCByZXN1bHQgaW4gYW4gZXJyb3IgaWYgdGhlIHVzZXJcbiAgICAvLyBhc2tlZCBmb3IgSlNPTiBkYXRhIGFuZCB0aGUgYm9keSBjYW5ub3QgYmUgcGFyc2VkIGFzIHN1Y2guXG4gICAgY29uc3Qgb2sgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcblxuICAgIGlmIChvaykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgYm9keSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICB1cmwsXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgdXJsLFxuICAgICAgfSkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VCb2R5KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIGJpbkNvbnRlbnQ6IFVpbnQ4QXJyYXksIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBzdHJpbmdcbiAgICAgIHxBcnJheUJ1ZmZlcnxCbG9ifG9iamVjdHxudWxsIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QucmVzcG9uc2VUeXBlKSB7XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgLy8gc3RyaXBwaW5nIHRoZSBYU1NJIHdoZW4gcHJlc2VudFxuICAgICAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJpbkNvbnRlbnQpLnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgcmV0dXJuIHRleHQgPT09ICcnID8gbnVsbCA6IEpTT04ucGFyc2UodGV4dCkgYXMgb2JqZWN0O1xuICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYmluQ29udGVudCk7XG4gICAgICBjYXNlICdibG9iJzpcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKFtiaW5Db250ZW50XSwge3R5cGU6IGNvbnRlbnRUeXBlfSk7XG4gICAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICAgIHJldHVybiBiaW5Db250ZW50LmJ1ZmZlcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlcXVlc3RJbml0KHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IFJlcXVlc3RJbml0IHtcbiAgICAvLyBXZSBjb3VsZCBzaGFyZSBzb21lIG9mIHRoaXMgbG9naWMgd2l0aCB0aGUgWGhyQmFja2VuZFxuXG4gICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGNyZWRlbnRpYWxzOiBSZXF1ZXN0Q3JlZGVudGlhbHN8dW5kZWZpbmVkID0gcmVxLndpdGhDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6IHVuZGVmaW5lZDtcblxuICAgIC8vIFNldHRpbmcgYWxsIHRoZSByZXF1ZXN0ZWQgaGVhZGVycy5cbiAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IChoZWFkZXJzW25hbWVdID0gdmFsdWVzLmpvaW4oJywnKSkpO1xuXG4gICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICBoZWFkZXJzWydBY2NlcHQnXSA/Pz0gJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKic7XG5cbiAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGlmICghaGVhZGVyc1snQ29udGVudC1UeXBlJ10pIHtcbiAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgLy8gU29tZXRpbWVzIENvbnRlbnQtVHlwZSBkZXRlY3Rpb24gZmFpbHMuXG4gICAgICBpZiAoZGV0ZWN0ZWRUeXBlICE9PSBudWxsKSB7XG4gICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gZGV0ZWN0ZWRUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBib2R5OiByZXEuc2VyaWFsaXplQm9keSgpLFxuICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGNyZWRlbnRpYWxzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbmNhdENodW5rcyhjaHVua3M6IFVpbnQ4QXJyYXlbXSwgdG90YWxMZW5ndGg6IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IGNodW5rc0FsbCA9IG5ldyBVaW50OEFycmF5KHRvdGFsTGVuZ3RoKTtcbiAgICBsZXQgcG9zaXRpb24gPSAwO1xuICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICBjaHVua3NBbGwuc2V0KGNodW5rLCBwb3NpdGlvbik7XG4gICAgICBwb3NpdGlvbiArPSBjaHVuay5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNodW5rc0FsbDtcbiAgfVxufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHRvIHByb3ZpZGUgYSBtb2NrZWQgaW1wbGVtZW50YXRpb24gb2YgYGZldGNoKClgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGZXRjaEZhY3Rvcnkge1xuICBhYnN0cmFjdCBmZXRjaDogdHlwZW9mIGZldGNoO1xufVxuXG5mdW5jdGlvbiBub29wKCk6IHZvaWQge31cblxuLyoqXG4gKiBab25lLmpzIHRyZWF0cyBhIHJlamVjdGVkIHByb21pc2UgdGhhdCBoYXMgbm90IHlldCBiZWVuIGF3YWl0ZWRcbiAqIGFzIGFuIHVuaGFuZGxlZCBlcnJvci4gVGhpcyBmdW5jdGlvbiBhZGRzIGEgbm9vcCBgLnRoZW5gIHRvIG1ha2VcbiAqIHN1cmUgdGhhdCBab25lLmpzIGRvZXNuJ3QgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIHN5bmNocm9ub3VzbHkuXG4gKi9cbmZ1bmN0aW9uIHNpbGVuY2VTdXBlcmZsdW91c1VuaGFuZGxlZFByb21pc2VSZWplY3Rpb24ocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPikge1xuICBwcm9taXNlLnRoZW4obm9vcCwgbm9vcCk7XG59XG4iXX0=