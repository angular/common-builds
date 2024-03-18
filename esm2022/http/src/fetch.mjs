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
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse, HttpStatusCode, } from './response';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.0+sha-314112d", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-next.0+sha-314112d", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.0+sha-314112d", ngImport: i0, type: FetchBackend, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBRUwsaUJBQWlCLEVBRWpCLGFBQWEsRUFDYixrQkFBa0IsRUFDbEIsWUFBWSxFQUNaLGNBQWMsR0FDZixNQUFNLFlBQVksQ0FBQzs7QUFFcEIsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBRTNDOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFFBQWtCO0lBQ3hDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsaUNBQWlDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0QsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBRHpCO1FBRUUsMkZBQTJGO1FBQzFFLGNBQVMsR0FDeEIsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELFdBQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxD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QUFDLENBQUM7WUFDL0IsUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDM0IsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7eUhBOU5VLFlBQVk7NkhBQVosWUFBWTs7c0dBQVosWUFBWTtrQkFEeEIsVUFBVTs7QUFrT1g7O0dBRUc7QUFDSCxNQUFNLE9BQWdCLFlBQVk7Q0FFakM7QUFFRCxTQUFTLElBQUksS0FBVSxDQUFDO0FBRXhCOzs7OztHQUtHO0FBQ0gsU0FBUywyQ0FBMkMsQ0FBQyxPQUF5QjtJQUM1RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7XG4gIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQsXG4gIEh0dHBFcnJvclJlc3BvbnNlLFxuICBIdHRwRXZlbnQsXG4gIEh0dHBFdmVudFR5cGUsXG4gIEh0dHBIZWFkZXJSZXNwb25zZSxcbiAgSHR0cFJlc3BvbnNlLFxuICBIdHRwU3RhdHVzQ29kZSxcbn0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbmNvbnN0IFhTU0lfUFJFRklYID0gL15cXClcXF1cXH0nLD9cXG4vO1xuXG5jb25zdCBSRVFVRVNUX1VSTF9IRUFERVIgPSBgWC1SZXF1ZXN0LVVSTGA7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGFuIGFwcHJvcHJpYXRlIFVSTCBmb3IgdGhlIHJlc3BvbnNlLCBieSBjaGVja2luZyBlaXRoZXJcbiAqIHJlc3BvbnNlIHVybCBvciB0aGUgWC1SZXF1ZXN0LVVSTCBoZWFkZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlVXJsKHJlc3BvbnNlOiBSZXNwb25zZSk6IHN0cmluZyB8IG51bGwge1xuICBpZiAocmVzcG9uc2UudXJsKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnVybDtcbiAgfVxuICAvLyBzdG9yZWQgYXMgbG93ZXJjYXNlIGluIHRoZSBtYXBcbiAgY29uc3QgeFJlcXVlc3RVcmwgPSBSRVFVRVNUX1VSTF9IRUFERVIudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgcmV0dXJuIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KHhSZXF1ZXN0VXJsKTtcbn1cblxuLyoqXG4gKiBVc2VzIGBmZXRjaGAgdG8gc2VuZCByZXF1ZXN0cyB0byBhIGJhY2tlbmQgc2VydmVyLlxuICpcbiAqIFRoaXMgYEZldGNoQmFja2VuZGAgcmVxdWlyZXMgdGhlIHN1cHBvcnQgb2YgdGhlXG4gKiBbRmV0Y2ggQVBJXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJKSB3aGljaCBpcyBhdmFpbGFibGUgb24gYWxsXG4gKiBzdXBwb3J0ZWQgYnJvd3NlcnMgYW5kIG9uIE5vZGUuanMgdjE4IG9yIGxhdGVyLlxuICpcbiAqIEBzZWUge0BsaW5rIEh0dHBIYW5kbGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEZldGNoQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kIHtcbiAgLy8gV2UgbmVlZCB0byBiaW5kIHRoZSBuYXRpdmUgZmV0Y2ggdG8gaXRzIGNvbnRleHQgb3IgaXQgd2lsbCB0aHJvdyBhbiBcImlsbGVnYWwgaW52b2NhdGlvblwiXG4gIHByaXZhdGUgcmVhZG9ubHkgZmV0Y2hJbXBsID1cbiAgICBpbmplY3QoRmV0Y2hGYWN0b3J5LCB7b3B0aW9uYWw6IHRydWV9KT8uZmV0Y2ggPz8gZmV0Y2guYmluZChnbG9iYWxUaGlzKTtcbiAgcHJpdmF0ZSByZWFkb25seSBuZ1pvbmUgPSBpbmplY3QoTmdab25lKTtcblxuICBoYW5kbGUocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyKSA9PiB7XG4gICAgICBjb25zdCBhYm9ydGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgdGhpcy5kb1JlcXVlc3QocmVxdWVzdCwgYWJvcnRlci5zaWduYWwsIG9ic2VydmVyKS50aGVuKG5vb3AsIChlcnJvcikgPT5cbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtlcnJvcn0pKSxcbiAgICAgICk7XG4gICAgICByZXR1cm4gKCkgPT4gYWJvcnRlci5hYm9ydCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBkb1JlcXVlc3QoXG4gICAgcmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PixcbiAgICBzaWduYWw6IEFib3J0U2lnbmFsLFxuICAgIG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGluaXQgPSB0aGlzLmNyZWF0ZVJlcXVlc3RJbml0KHJlcXVlc3QpO1xuICAgIGxldCByZXNwb25zZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmZXRjaFByb21pc2UgPSB0aGlzLmZldGNoSW1wbChyZXF1ZXN0LnVybFdpdGhQYXJhbXMsIHtzaWduYWwsIC4uLmluaXR9KTtcblxuICAgICAgLy8gTWFrZSBzdXJlIFpvbmUuanMgZG9lc24ndCB0cmlnZ2VyIGZhbHNlLXBvc2l0aXZlIHVuaGFuZGxlZCBwcm9taXNlXG4gICAgICAvLyBlcnJvciBpbiBjYXNlIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkIHN5bmNocm9ub3VzbHkuIFNlZSBmdW5jdGlvblxuICAgICAgLy8gZGVzY3JpcHRpb24gZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAgICBzaWxlbmNlU3VwZXJmbHVvdXNVbmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uKGZldGNoUHJvbWlzZSk7XG5cbiAgICAgIC8vIFNlbmQgdGhlIGBTZW50YCBldmVudCBiZWZvcmUgYXdhaXRpbmcgdGhlIHJlc3BvbnNlLlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hQcm9taXNlO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIG9ic2VydmVyLmVycm9yKFxuICAgICAgICBuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHN0YXR1czogZXJyb3Iuc3RhdHVzID8/IDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogZXJyb3Iuc3RhdHVzVGV4dCxcbiAgICAgICAgICB1cmw6IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgICBoZWFkZXJzOiBlcnJvci5oZWFkZXJzLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKTtcbiAgICBjb25zdCBzdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dDtcbiAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybChyZXNwb25zZSkgPz8gcmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuXG4gICAgbGV0IHN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgICBsZXQgYm9keTogc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBCbG9iIHwgb2JqZWN0IHwgbnVsbCA9IG51bGw7XG5cbiAgICBpZiAocmVxdWVzdC5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UuYm9keSkge1xuICAgICAgLy8gUmVhZCBQcm9ncmVzc1xuICAgICAgY29uc3QgY29udGVudExlbmd0aCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LWxlbmd0aCcpO1xuICAgICAgY29uc3QgY2h1bmtzOiBVaW50OEFycmF5W10gPSBbXTtcbiAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG4gICAgICBsZXQgcmVjZWl2ZWRMZW5ndGggPSAwO1xuXG4gICAgICBsZXQgZGVjb2RlcjogVGV4dERlY29kZXI7XG4gICAgICBsZXQgcGFydGlhbFRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgLy8gV2UgaGF2ZSB0byBjaGVjayB3aGV0aGVyIHRoZSBab25lIGlzIGRlZmluZWQgaW4gdGhlIGdsb2JhbCBzY29wZSBiZWNhdXNlIHRoaXMgbWF5IGJlIGNhbGxlZFxuICAgICAgLy8gd2hlbiB0aGUgem9uZSBpcyBub29wZWQuXG4gICAgICBjb25zdCByZXFab25lID0gdHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnICYmIFpvbmUuY3VycmVudDtcblxuICAgICAgLy8gUGVyZm9ybSByZXNwb25zZSBwcm9jZXNzaW5nIG91dHNpZGUgb2YgQW5ndWxhciB6b25lIHRvXG4gICAgICAvLyBlbnN1cmUgbm8gZXhjZXNzaXZlIGNoYW5nZSBkZXRlY3Rpb24gcnVucyBhcmUgZXhlY3V0ZWRcbiAgICAgIC8vIEhlcmUgY2FsbGluZyB0aGUgYXN5bmMgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyLnJlYWQoKSBpcyByZXNwb25zaWJsZSBmb3IgdHJpZ2dlcmluZyBDRFxuICAgICAgYXdhaXQgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoYXN5bmMgKCkgPT4ge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHtkb25lLCB2YWx1ZX0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuXG4gICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNodW5rcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICByZWNlaXZlZExlbmd0aCArPSB2YWx1ZS5sZW5ndGg7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgICAgcGFydGlhbFRleHQgPVxuICAgICAgICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnXG4gICAgICAgICAgICAgICAgPyAocGFydGlhbFRleHQgPz8gJycpICtcbiAgICAgICAgICAgICAgICAgIChkZWNvZGVyID8/PSBuZXcgVGV4dERlY29kZXIoKSkuZGVjb2RlKHZhbHVlLCB7c3RyZWFtOiB0cnVlfSlcbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgY29uc3QgcmVwb3J0UHJvZ3Jlc3MgPSAoKSA9PlxuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgdG90YWw6IGNvbnRlbnRMZW5ndGggPyArY29udGVudExlbmd0aCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBsb2FkZWQ6IHJlY2VpdmVkTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHBhcnRpYWxUZXh0LFxuICAgICAgICAgICAgICB9IGFzIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgICAgcmVxWm9uZSA/IHJlcVpvbmUucnVuKHJlcG9ydFByb2dyZXNzKSA6IHJlcG9ydFByb2dyZXNzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQ29tYmluZSBhbGwgY2h1bmtzLlxuICAgICAgY29uc3QgY2h1bmtzQWxsID0gdGhpcy5jb25jYXRDaHVua3MoY2h1bmtzLCByZWNlaXZlZExlbmd0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSA/PyAnJztcbiAgICAgICAgYm9keSA9IHRoaXMucGFyc2VCb2R5KHJlcXVlc3QsIGNodW5rc0FsbCwgY29udGVudFR5cGUpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gQm9keSBsb2FkaW5nIG9yIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgIG9ic2VydmVyLmVycm9yKFxuICAgICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKSxcbiAgICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2UpID8/IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNhbWUgYmVoYXZpb3IgYXMgdGhlIFhockJhY2tlbmRcbiAgICBpZiAoc3RhdHVzID09PSAwKSB7XG4gICAgICBzdGF0dXMgPSBib2R5ID8gSHR0cFN0YXR1c0NvZGUuT2sgOiAwO1xuICAgIH1cblxuICAgIC8vIG9rIGRldGVybWluZXMgd2hldGhlciB0aGUgcmVzcG9uc2Ugd2lsbCBiZSB0cmFuc21pdHRlZCBvbiB0aGUgZXZlbnQgb3JcbiAgICAvLyBlcnJvciBjaGFubmVsLiBVbnN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGVzIChub3QgMnh4KSB3aWxsIGFsd2F5cyBiZSBlcnJvcnMsXG4gICAgLy8gYnV0IGEgc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZSBjYW4gc3RpbGwgcmVzdWx0IGluIGFuIGVycm9yIGlmIHRoZSB1c2VyXG4gICAgLy8gYXNrZWQgZm9yIEpTT04gZGF0YSBhbmQgdGhlIGJvZHkgY2Fubm90IGJlIHBhcnNlZCBhcyBzdWNoLlxuICAgIGNvbnN0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICBpZiAob2spIHtcbiAgICAgIG9ic2VydmVyLm5leHQoXG4gICAgICAgIG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgIGJvZHksXG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgICAgLy8gVGhlIGZ1bGwgYm9keSBoYXMgYmVlbiByZWNlaXZlZCBhbmQgZGVsaXZlcmVkLCBubyBmdXJ0aGVyIGV2ZW50c1xuICAgICAgLy8gYXJlIHBvc3NpYmxlLiBUaGlzIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYnNlcnZlci5lcnJvcihcbiAgICAgICAgbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcjogYm9keSxcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VCb2R5KFxuICAgIHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sXG4gICAgYmluQ29udGVudDogVWludDhBcnJheSxcbiAgICBjb250ZW50VHlwZTogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBBcnJheUJ1ZmZlciB8IEJsb2IgfCBvYmplY3QgfCBudWxsIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QucmVzcG9uc2VUeXBlKSB7XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgLy8gc3RyaXBwaW5nIHRoZSBYU1NJIHdoZW4gcHJlc2VudFxuICAgICAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJpbkNvbnRlbnQpLnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgcmV0dXJuIHRleHQgPT09ICcnID8gbnVsbCA6IChKU09OLnBhcnNlKHRleHQpIGFzIG9iamVjdCk7XG4gICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShiaW5Db250ZW50KTtcbiAgICAgIGNhc2UgJ2Jsb2InOlxuICAgICAgICByZXR1cm4gbmV3IEJsb2IoW2JpbkNvbnRlbnRdLCB7dHlwZTogY29udGVudFR5cGV9KTtcbiAgICAgIGNhc2UgJ2FycmF5YnVmZmVyJzpcbiAgICAgICAgcmV0dXJuIGJpbkNvbnRlbnQuYnVmZmVyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVxdWVzdEluaXQocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogUmVxdWVzdEluaXQge1xuICAgIC8vIFdlIGNvdWxkIHNoYXJlIHNvbWUgb2YgdGhpcyBsb2dpYyB3aXRoIHRoZSBYaHJCYWNrZW5kXG5cbiAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3QgY3JlZGVudGlhbHM6IFJlcXVlc3RDcmVkZW50aWFscyB8IHVuZGVmaW5lZCA9IHJlcS53aXRoQ3JlZGVudGlhbHMgPyAnaW5jbHVkZScgOiB1bmRlZmluZWQ7XG5cbiAgICAvLyBTZXR0aW5nIGFsbCB0aGUgcmVxdWVzdGVkIGhlYWRlcnMuXG4gICAgcmVxLmhlYWRlcnMuZm9yRWFjaCgobmFtZSwgdmFsdWVzKSA9PiAoaGVhZGVyc1tuYW1lXSA9IHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgIC8vIEFkZCBhbiBBY2NlcHQgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgaGVhZGVyc1snQWNjZXB0J10gPz89ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonO1xuXG4gICAgLy8gQXV0by1kZXRlY3QgdGhlIENvbnRlbnQtVHlwZSBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICBpZiAoIWhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSB7XG4gICAgICBjb25zdCBkZXRlY3RlZFR5cGUgPSByZXEuZGV0ZWN0Q29udGVudFR5cGVIZWFkZXIoKTtcbiAgICAgIC8vIFNvbWV0aW1lcyBDb250ZW50LVR5cGUgZGV0ZWN0aW9uIGZhaWxzLlxuICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IGRldGVjdGVkVHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYm9keTogcmVxLnNlcmlhbGl6ZUJvZHkoKSxcbiAgICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBjcmVkZW50aWFscyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb25jYXRDaHVua3MoY2h1bmtzOiBVaW50OEFycmF5W10sIHRvdGFsTGVuZ3RoOiBudW1iZXIpOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCBjaHVua3NBbGwgPSBuZXcgVWludDhBcnJheSh0b3RhbExlbmd0aCk7XG4gICAgbGV0IHBvc2l0aW9uID0gMDtcbiAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xuICAgICAgY2h1bmtzQWxsLnNldChjaHVuaywgcG9zaXRpb24pO1xuICAgICAgcG9zaXRpb24gKz0gY2h1bmsubGVuZ3RoO1xuICAgIH1cblxuICAgIHJldHVybiBjaHVua3NBbGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyB0byBwcm92aWRlIGEgbW9ja2VkIGltcGxlbWVudGF0aW9uIG9mIGBmZXRjaCgpYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRmV0Y2hGYWN0b3J5IHtcbiAgYWJzdHJhY3QgZmV0Y2g6IHR5cGVvZiBmZXRjaDtcbn1cblxuZnVuY3Rpb24gbm9vcCgpOiB2b2lkIHt9XG5cbi8qKlxuICogWm9uZS5qcyB0cmVhdHMgYSByZWplY3RlZCBwcm9taXNlIHRoYXQgaGFzIG5vdCB5ZXQgYmVlbiBhd2FpdGVkXG4gKiBhcyBhbiB1bmhhbmRsZWQgZXJyb3IuIFRoaXMgZnVuY3Rpb24gYWRkcyBhIG5vb3AgYC50aGVuYCB0byBtYWtlXG4gKiBzdXJlIHRoYXQgWm9uZS5qcyBkb2Vzbid0IHRocm93IGFuIGVycm9yIGlmIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkXG4gKiBzeW5jaHJvbm91c2x5LlxuICovXG5mdW5jdGlvbiBzaWxlbmNlU3VwZXJmbHVvdXNVbmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uKHByb21pc2U6IFByb21pc2U8dW5rbm93bj4pIHtcbiAgcHJvbWlzZS50aGVuKG5vb3AsIG5vb3ApO1xufVxuIl19