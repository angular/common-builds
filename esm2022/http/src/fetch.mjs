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
import { HTTP_STATUS_CODE_OK, HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse, } from './response';
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
        return new Observable((observer) => {
            const aborter = new AbortController();
            this.doRequest(request, aborter.signal, observer).then(noop, (error) => observer.error(new HttpErrorResponse({ error })));
            return () => aborter.abort();
        });
    }
    async doRequest(request, signal, observer) {
        const init = this.createRequestInit(request);
        let response;
        try {
            // Run fetch outside of Angular zone.
            // This is due to Node.js fetch implementation (Undici) which uses a number of setTimeouts to check if
            // the response should eventually timeout which causes extra CD cycles every 500ms
            const fetchPromise = this.ngZone.runOutsideAngular(() => this.fetchImpl(request.urlWithParams, { signal, ...init }));
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
                        partialText =
                            request.responseType === 'text'
                                ? (partialText ?? '') +
                                    (decoder ??= new TextDecoder()).decode(value, { stream: true })
                                : undefined;
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
            status = body ? HTTP_STATUS_CODE_OK : 0;
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
        if (!req.headers.has('Accept')) {
            headers['Accept'] = 'application/json, text/plain, */*';
        }
        // Auto-detect the Content-Type header if one isn't present already.
        if (!req.headers.has('Content-Type')) {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.1+sha-d97aee6", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.1+sha-d97aee6", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.1+sha-d97aee6", ngImport: i0, type: FetchBackend, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQ0wsbUJBQW1CLEVBRW5CLGlCQUFpQixFQUVqQixhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLFlBQVksR0FDYixNQUFNLFlBQVksQ0FBQzs7QUFFcEIsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBRTNDOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFFBQWtCO0lBQ3hDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsaUNBQWlDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0QsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBRHpCO1FBRUUsMkZBQTJGO1FBQzFFLGNBQVMsR0FDeEIsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELFdBQU0sR0FBRyxNQUFNLENBQUMsTUFB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LE1BQW9CLEVBQUUsV0FBbUI7UUFDNUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7WUFDM0IsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0IsUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDM0IsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7eUhBck9VLFlBQVk7NkhBQVosWUFBWTs7c0dBQVosWUFBWTtrQkFEeEIsVUFBVTs7QUF5T1g7O0dBRUc7QUFDSCxNQUFNLE9BQWdCLFlBQVk7Q0FFakM7QUFFRCxTQUFTLElBQUksS0FBVSxDQUFDO0FBRXhCOzs7OztHQUtHO0FBQ0gsU0FBUywyQ0FBMkMsQ0FBQyxPQUF5QjtJQUM1RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7XG4gIEhUVFBfU1RBVFVTX0NPREVfT0ssXG4gIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQsXG4gIEh0dHBFcnJvclJlc3BvbnNlLFxuICBIdHRwRXZlbnQsXG4gIEh0dHBFdmVudFR5cGUsXG4gIEh0dHBIZWFkZXJSZXNwb25zZSxcbiAgSHR0cFJlc3BvbnNlLFxufSBmcm9tICcuL3Jlc3BvbnNlJztcblxuY29uc3QgWFNTSV9QUkVGSVggPSAvXlxcKVxcXVxcfScsP1xcbi87XG5cbmNvbnN0IFJFUVVFU1RfVVJMX0hFQURFUiA9IGBYLVJlcXVlc3QtVVJMYDtcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogcmVzcG9uc2UgdXJsIG9yIHRoZSBYLVJlcXVlc3QtVVJMIGhlYWRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2U6IFJlc3BvbnNlKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChyZXNwb25zZS51cmwpIHtcbiAgICByZXR1cm4gcmVzcG9uc2UudXJsO1xuICB9XG4gIC8vIHN0b3JlZCBhcyBsb3dlcmNhc2UgaW4gdGhlIG1hcFxuICBjb25zdCB4UmVxdWVzdFVybCA9IFJFUVVFU1RfVVJMX0hFQURFUi50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICByZXR1cm4gcmVzcG9uc2UuaGVhZGVycy5nZXQoeFJlcXVlc3RVcmwpO1xufVxuXG4vKipcbiAqIFVzZXMgYGZldGNoYCB0byBzZW5kIHJlcXVlc3RzIHRvIGEgYmFja2VuZCBzZXJ2ZXIuXG4gKlxuICogVGhpcyBgRmV0Y2hCYWNrZW5kYCByZXF1aXJlcyB0aGUgc3VwcG9ydCBvZiB0aGVcbiAqIFtGZXRjaCBBUEldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9GZXRjaF9BUEkpIHdoaWNoIGlzIGF2YWlsYWJsZSBvbiBhbGxcbiAqIHN1cHBvcnRlZCBicm93c2VycyBhbmQgb24gTm9kZS5qcyB2MTggb3IgbGF0ZXIuXG4gKlxuICogQHNlZSB7QGxpbmsgSHR0cEhhbmRsZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmV0Y2hCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICAvLyBXZSBuZWVkIHRvIGJpbmQgdGhlIG5hdGl2ZSBmZXRjaCB0byBpdHMgY29udGV4dCBvciBpdCB3aWxsIHRocm93IGFuIFwiaWxsZWdhbCBpbnZvY2F0aW9uXCJcbiAgcHJpdmF0ZSByZWFkb25seSBmZXRjaEltcGwgPVxuICAgIGluamVjdChGZXRjaEZhY3RvcnksIHtvcHRpb25hbDogdHJ1ZX0pPy5mZXRjaCA/PyBmZXRjaC5iaW5kKGdsb2JhbFRoaXMpO1xuICBwcml2YXRlIHJlYWRvbmx5IG5nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIGhhbmRsZShyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgIGNvbnN0IGFib3J0ZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICB0aGlzLmRvUmVxdWVzdChyZXF1ZXN0LCBhYm9ydGVyLnNpZ25hbCwgb2JzZXJ2ZXIpLnRoZW4obm9vcCwgKGVycm9yKSA9PlxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe2Vycm9yfSkpLFxuICAgICAgKTtcbiAgICAgIHJldHVybiAoKSA9PiBhYm9ydGVyLmFib3J0KCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRvUmVxdWVzdChcbiAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIHNpZ25hbDogQWJvcnRTaWduYWwsXG4gICAgb2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaW5pdCA9IHRoaXMuY3JlYXRlUmVxdWVzdEluaXQocmVxdWVzdCk7XG4gICAgbGV0IHJlc3BvbnNlO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFJ1biBmZXRjaCBvdXRzaWRlIG9mIEFuZ3VsYXIgem9uZS5cbiAgICAgIC8vIFRoaXMgaXMgZHVlIHRvIE5vZGUuanMgZmV0Y2ggaW1wbGVtZW50YXRpb24gKFVuZGljaSkgd2hpY2ggdXNlcyBhIG51bWJlciBvZiBzZXRUaW1lb3V0cyB0byBjaGVjayBpZlxuICAgICAgLy8gdGhlIHJlc3BvbnNlIHNob3VsZCBldmVudHVhbGx5IHRpbWVvdXQgd2hpY2ggY2F1c2VzIGV4dHJhIENEIGN5Y2xlcyBldmVyeSA1MDBtc1xuICAgICAgY29uc3QgZmV0Y2hQcm9taXNlID0gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgICAgdGhpcy5mZXRjaEltcGwocmVxdWVzdC51cmxXaXRoUGFyYW1zLCB7c2lnbmFsLCAuLi5pbml0fSksXG4gICAgICApO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgWm9uZS5qcyBkb2Vzbid0IHRyaWdnZXIgZmFsc2UtcG9zaXRpdmUgdW5oYW5kbGVkIHByb21pc2VcbiAgICAgIC8vIGVycm9yIGluIGNhc2UgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWQgc3luY2hyb25vdXNseS4gU2VlIGZ1bmN0aW9uXG4gICAgICAvLyBkZXNjcmlwdGlvbiBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICAgIHNpbGVuY2VTdXBlcmZsdW91c1VuaGFuZGxlZFByb21pc2VSZWplY3Rpb24oZmV0Y2hQcm9taXNlKTtcblxuICAgICAgLy8gU2VuZCB0aGUgYFNlbnRgIGV2ZW50IGJlZm9yZSBhd2FpdGluZyB0aGUgcmVzcG9uc2UuXG4gICAgICBvYnNlcnZlci5uZXh0KHt0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnR9KTtcblxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFByb21pc2U7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgPz8gMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0LFxuICAgICAgICAgIHVybDogcmVxdWVzdC51cmxXaXRoUGFyYW1zLFxuICAgICAgICAgIGhlYWRlcnM6IGVycm9yLmhlYWRlcnMsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpO1xuICAgIGNvbnN0IHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0dXNUZXh0O1xuICAgIGNvbnN0IHVybCA9IGdldFJlc3BvbnNlVXJsKHJlc3BvbnNlKSA/PyByZXF1ZXN0LnVybFdpdGhQYXJhbXM7XG5cbiAgICBsZXQgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgIGxldCBib2R5OiBzdHJpbmcgfCBBcnJheUJ1ZmZlciB8IEJsb2IgfCBvYmplY3QgfCBudWxsID0gbnVsbDtcblxuICAgIGlmIChyZXF1ZXN0LnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwSGVhZGVyUmVzcG9uc2Uoe2hlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSkpO1xuICAgIH1cblxuICAgIGlmIChyZXNwb25zZS5ib2R5KSB7XG4gICAgICAvLyBSZWFkIFByb2dyZXNzXG4gICAgICBjb25zdCBjb250ZW50TGVuZ3RoID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtbGVuZ3RoJyk7XG4gICAgICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcbiAgICAgIGxldCByZWNlaXZlZExlbmd0aCA9IDA7XG5cbiAgICAgIGxldCBkZWNvZGVyOiBUZXh0RGVjb2RlcjtcbiAgICAgIGxldCBwYXJ0aWFsVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgICAvLyBXZSBoYXZlIHRvIGNoZWNrIHdoZXRoZXIgdGhlIFpvbmUgaXMgZGVmaW5lZCBpbiB0aGUgZ2xvYmFsIHNjb3BlIGJlY2F1c2UgdGhpcyBtYXkgYmUgY2FsbGVkXG4gICAgICAvLyB3aGVuIHRoZSB6b25lIGlzIG5vb3BlZC5cbiAgICAgIGNvbnN0IHJlcVpvbmUgPSB0eXBlb2YgWm9uZSAhPT0gJ3VuZGVmaW5lZCcgJiYgWm9uZS5jdXJyZW50O1xuXG4gICAgICAvLyBQZXJmb3JtIHJlc3BvbnNlIHByb2Nlc3Npbmcgb3V0c2lkZSBvZiBBbmd1bGFyIHpvbmUgdG9cbiAgICAgIC8vIGVuc3VyZSBubyBleGNlc3NpdmUgY2hhbmdlIGRldGVjdGlvbiBydW5zIGFyZSBleGVjdXRlZFxuICAgICAgLy8gSGVyZSBjYWxsaW5nIHRoZSBhc3luYyBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIucmVhZCgpIGlzIHJlc3BvbnNpYmxlIGZvciB0cmlnZ2VyaW5nIENEXG4gICAgICBhd2FpdCB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihhc3luYyAoKSA9PiB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY29uc3Qge2RvbmUsIHZhbHVlfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cbiAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2h1bmtzLnB1c2godmFsdWUpO1xuICAgICAgICAgIHJlY2VpdmVkTGVuZ3RoICs9IHZhbHVlLmxlbmd0aDtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0LnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgICAgICBwYXJ0aWFsVGV4dCA9XG4gICAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID09PSAndGV4dCdcbiAgICAgICAgICAgICAgICA/IChwYXJ0aWFsVGV4dCA/PyAnJykgK1xuICAgICAgICAgICAgICAgICAgKGRlY29kZXIgPz89IG5ldyBUZXh0RGVjb2RlcigpKS5kZWNvZGUodmFsdWUsIHtzdHJlYW06IHRydWV9KVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBjb25zdCByZXBvcnRQcm9ncmVzcyA9ICgpID0+XG4gICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoe1xuICAgICAgICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcyxcbiAgICAgICAgICAgICAgICB0b3RhbDogY29udGVudExlbmd0aCA/ICtjb250ZW50TGVuZ3RoIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGxvYWRlZDogcmVjZWl2ZWRMZW5ndGgsXG4gICAgICAgICAgICAgICAgcGFydGlhbFRleHQsXG4gICAgICAgICAgICAgIH0gYXMgSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgICByZXFab25lID8gcmVxWm9uZS5ydW4ocmVwb3J0UHJvZ3Jlc3MpIDogcmVwb3J0UHJvZ3Jlc3MoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb21iaW5lIGFsbCBjaHVua3MuXG4gICAgICBjb25zdCBjaHVua3NBbGwgPSB0aGlzLmNvbmNhdENodW5rcyhjaHVua3MsIHJlY2VpdmVkTGVuZ3RoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpID8/ICcnO1xuICAgICAgICBib2R5ID0gdGhpcy5wYXJzZUJvZHkocmVxdWVzdCwgY2h1bmtzQWxsLCBjb250ZW50VHlwZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBCb2R5IGxvYWRpbmcgb3IgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgICAgbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgaGVhZGVyczogbmV3IEh0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpLFxuICAgICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiBnZXRSZXNwb25zZVVybChyZXNwb25zZSkgPz8gcmVxdWVzdC51cmxXaXRoUGFyYW1zLFxuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2FtZSBiZWhhdmlvciBhcyB0aGUgWGhyQmFja2VuZFxuICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgIHN0YXR1cyA9IGJvZHkgPyBIVFRQX1NUQVRVU19DT0RFX09LIDogMDtcbiAgICB9XG5cbiAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgLy8gZXJyb3IgY2hhbm5lbC4gVW5zdWNjZXNzZnVsIHN0YXR1cyBjb2RlcyAobm90IDJ4eCkgd2lsbCBhbHdheXMgYmUgZXJyb3JzLFxuICAgIC8vIGJ1dCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgY2FuIHN0aWxsIHJlc3VsdCBpbiBhbiBlcnJvciBpZiB0aGUgdXNlclxuICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICBjb25zdCBvayA9IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuXG4gICAgaWYgKG9rKSB7XG4gICAgICBvYnNlcnZlci5uZXh0KFxuICAgICAgICBuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICBib2R5LFxuICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBhcnNlQm9keShcbiAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIGJpbkNvbnRlbnQ6IFVpbnQ4QXJyYXksXG4gICAgY29udGVudFR5cGU6IHN0cmluZyxcbiAgKTogc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBCbG9iIHwgb2JqZWN0IHwgbnVsbCB7XG4gICAgc3dpdGNoIChyZXF1ZXN0LnJlc3BvbnNlVHlwZSkge1xuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIC8vIHN0cmlwcGluZyB0aGUgWFNTSSB3aGVuIHByZXNlbnRcbiAgICAgICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShiaW5Db250ZW50KS5yZXBsYWNlKFhTU0lfUFJFRklYLCAnJyk7XG4gICAgICAgIHJldHVybiB0ZXh0ID09PSAnJyA/IG51bGwgOiAoSlNPTi5wYXJzZSh0ZXh0KSBhcyBvYmplY3QpO1xuICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYmluQ29udGVudCk7XG4gICAgICBjYXNlICdibG9iJzpcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKFtiaW5Db250ZW50XSwge3R5cGU6IGNvbnRlbnRUeXBlfSk7XG4gICAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICAgIHJldHVybiBiaW5Db250ZW50LmJ1ZmZlcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlcXVlc3RJbml0KHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IFJlcXVlc3RJbml0IHtcbiAgICAvLyBXZSBjb3VsZCBzaGFyZSBzb21lIG9mIHRoaXMgbG9naWMgd2l0aCB0aGUgWGhyQmFja2VuZFxuXG4gICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGNyZWRlbnRpYWxzOiBSZXF1ZXN0Q3JlZGVudGlhbHMgfCB1bmRlZmluZWQgPSByZXEud2l0aENyZWRlbnRpYWxzID8gJ2luY2x1ZGUnIDogdW5kZWZpbmVkO1xuXG4gICAgLy8gU2V0dGluZyBhbGwgdGhlIHJlcXVlc3RlZCBoZWFkZXJzLlxuICAgIHJlcS5oZWFkZXJzLmZvckVhY2goKG5hbWUsIHZhbHVlcykgPT4gKGhlYWRlcnNbbmFtZV0gPSB2YWx1ZXMuam9pbignLCcpKSk7XG5cbiAgICAvLyBBZGQgYW4gQWNjZXB0IGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xuICAgICAgaGVhZGVyc1snQWNjZXB0J10gPSAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJztcbiAgICB9XG5cbiAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSkge1xuICAgICAgY29uc3QgZGV0ZWN0ZWRUeXBlID0gcmVxLmRldGVjdENvbnRlbnRUeXBlSGVhZGVyKCk7XG4gICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgIGlmIChkZXRlY3RlZFR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBkZXRlY3RlZFR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJvZHk6IHJlcS5zZXJpYWxpemVCb2R5KCksXG4gICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICBoZWFkZXJzLFxuICAgICAgY3JlZGVudGlhbHMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29uY2F0Q2h1bmtzKGNodW5rczogVWludDhBcnJheVtdLCB0b3RhbExlbmd0aDogbnVtYmVyKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgY2h1bmtzQWxsID0gbmV3IFVpbnQ4QXJyYXkodG90YWxMZW5ndGgpO1xuICAgIGxldCBwb3NpdGlvbiA9IDA7XG4gICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgIGNodW5rc0FsbC5zZXQoY2h1bmssIHBvc2l0aW9uKTtcbiAgICAgIHBvc2l0aW9uICs9IGNodW5rLmxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2h1bmtzQWxsO1xuICB9XG59XG5cbi8qKlxuICogQWJzdHJhY3QgY2xhc3MgdG8gcHJvdmlkZSBhIG1vY2tlZCBpbXBsZW1lbnRhdGlvbiBvZiBgZmV0Y2goKWBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZldGNoRmFjdG9yeSB7XG4gIGFic3RyYWN0IGZldGNoOiB0eXBlb2YgZmV0Y2g7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKTogdm9pZCB7fVxuXG4vKipcbiAqIFpvbmUuanMgdHJlYXRzIGEgcmVqZWN0ZWQgcHJvbWlzZSB0aGF0IGhhcyBub3QgeWV0IGJlZW4gYXdhaXRlZFxuICogYXMgYW4gdW5oYW5kbGVkIGVycm9yLiBUaGlzIGZ1bmN0aW9uIGFkZHMgYSBub29wIGAudGhlbmAgdG8gbWFrZVxuICogc3VyZSB0aGF0IFpvbmUuanMgZG9lc24ndCB0aHJvdyBhbiBlcnJvciBpZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZFxuICogc3luY2hyb25vdXNseS5cbiAqL1xuZnVuY3Rpb24gc2lsZW5jZVN1cGVyZmx1b3VzVW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbihwcm9taXNlOiBQcm9taXNlPHVua25vd24+KSB7XG4gIHByb21pc2UudGhlbihub29wLCBub29wKTtcbn1cbiJdfQ==