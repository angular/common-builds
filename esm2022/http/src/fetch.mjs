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
        // We use an arrow function to always reference the current global implementation of `fetch`.
        // This is helpful for cases when the global `fetch` implementation is modified by external code,
        // see https://github.com/angular/angular/issues/57527.
        this.fetchImpl = inject(FetchFactory, { optional: true })?.fetch ?? ((...args) => globalThis.fetch(...args));
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.4+sha-cd97054", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.4+sha-cd97054", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.4+sha-cd97054", ngImport: i0, type: FetchBackend, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQ0wsbUJBQW1CLEVBRW5CLGlCQUFpQixFQUVqQixhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLFlBQVksR0FDYixNQUFNLFlBQVksQ0FBQzs7QUFFcEIsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBRTNDOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFFBQWtCO0lBQ3hDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsaUNBQWlDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0QsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBRHpCO1FBRUUsNkZBQTZGO1FBQzdGLGlHQUFpRztRQUNqRyx1REFBdUQ7UUFDdEMsY0FBUyxHQUN4QixNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDM0UsV0FBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQWtPMUM7SUFoT0MsTUFBTSxDQUFDLE9BQXlCO1FBQzlCLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQ3JFLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FDL0MsQ0FBQztZQUNGLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxTQUFTLENBQ3JCLE9BQXlCLEVBQ3pCLE1BQW1CLEVBQ25CLFFBQWtDO1FBRWxDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxJQUFJLFFBQVEsQ0FBQztRQUViLElBQUksQ0FBQztZQUNILHFDQUFxQztZQUNyQyxzR0FBc0c7WUFDdEcsa0ZBQWtGO1lBQ2xGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQ3RELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBQyxDQUFDLENBQ3pELENBQUM7WUFFRixxRUFBcUU7WUFDckUsb0VBQW9FO1lBQ3BFLDBDQUEwQztZQUMxQywyQ0FBMkMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxRCxzREFBc0Q7WUFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUUxQyxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUM7UUFDaEMsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDcEIsUUFBUSxDQUFDLEtBQUssQ0FDWixJQUFJLGlCQUFpQixDQUFDO2dCQUNwQixLQUFLO2dCQUNMLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQ3pCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtnQkFDNUIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxhQUFhO2dCQUMxQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87YUFDdkIsQ0FBQyxDQUNILENBQUM7WUFDRixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1FBQ3ZDLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDO1FBRTlELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDN0IsSUFBSSxJQUFJLEdBQWdELElBQUksQ0FBQztRQUU3RCxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMzQixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVELElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xCLGdCQUFnQjtZQUNoQixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELE1BQU0sTUFBTSxHQUFpQixFQUFFLENBQUM7WUFDaEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7WUFFdkIsSUFBSSxPQUFvQixDQUFDO1lBQ3pCLElBQUksV0FBK0IsQ0FBQztZQUVwQyw4RkFBOEY7WUFDOUYsMkJBQTJCO1lBQzNCLE1BQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBRTVELHlEQUF5RDtZQUN6RCx5REFBeUQ7WUFDekQsNkZBQTZGO1lBQzdGLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDN0MsT0FBTyxJQUFJLEVBQUUsQ0FBQztvQkFDWixNQUFNLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUUxQyxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNULE1BQU07b0JBQ1IsQ0FBQztvQkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNuQixjQUFjLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFFL0IsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQzNCLFdBQVc7NEJBQ1QsT0FBTyxDQUFDLFlBQVksS0FBSyxNQUFNO2dDQUM3QixDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO29DQUNuQixDQUFDLE9BQU8sS0FBSyxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQztnQ0FDL0QsQ0FBQyxDQUFDLFNBQVMsQ0FBQzt3QkFFaEIsTUFBTSxjQUFjLEdBQUcsR0FBRyxFQUFFLENBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUM7NEJBQ1osSUFBSSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0I7NEJBQ3BDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTOzRCQUNqRCxNQUFNLEVBQUUsY0FBYzs0QkFDdEIsV0FBVzt5QkFDaUIsQ0FBQyxDQUFDO3dCQUNsQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUMzRCxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILHNCQUFzQjtZQUN0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMvRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNmLGlDQUFpQztnQkFDakMsUUFBUSxDQUFDLEtBQUssQ0FDWixJQUFJLGlCQUFpQixDQUFDO29CQUNwQixLQUFLO29CQUNMLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO29CQUMxQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07b0JBQ3ZCLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTtvQkFDL0IsR0FBRyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYTtpQkFDdkQsQ0FBQyxDQUNILENBQUM7Z0JBQ0YsT0FBTztZQUNULENBQUM7UUFDSCxDQUFDO1FBRUQsa0NBQWtDO1FBQ2xDLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2pCLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELHlFQUF5RTtRQUN6RSw0RUFBNEU7UUFDNUUsd0VBQXdFO1FBQ3hFLDZEQUE2RDtRQUM3RCxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFFekMsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNQLFFBQVEsQ0FBQyxJQUFJLENBQ1gsSUFBSSxZQUFZLENBQUM7Z0JBQ2YsSUFBSTtnQkFDSixPQUFPO2dCQUNQLE1BQU07Z0JBQ04sVUFBVTtnQkFDVixHQUFHO2FBQ0osQ0FBQyxDQUNILENBQUM7WUFFRixtRUFBbUU7WUFDbkUsMENBQTBDO1lBQzFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QixDQUFDO2FBQU0sQ0FBQztZQUNOLFFBQVEsQ0FBQyxLQUFLLENBQ1osSUFBSSxpQkFBaUIsQ0FBQztnQkFDcEIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsT0FBTztnQkFDUCxNQUFNO2dCQUNOLFVBQVU7Z0JBQ1YsR0FBRzthQUNKLENBQUMsQ0FDSCxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFTyxTQUFTLENBQ2YsT0FBeUIsRUFDekIsVUFBc0IsRUFDdEIsV0FBbUI7UUFFbkIsUUFBUSxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDN0IsS0FBSyxNQUFNO2dCQUNULGtDQUFrQztnQkFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0UsT0FBTyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFZLENBQUM7WUFDM0QsS0FBSyxNQUFNO2dCQUNULE9BQU8sSUFBSSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUMsS0FBSyxNQUFNO2dCQUNULE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FBQyxDQUFDO1lBQ3JELEtBQUssYUFBYTtnQkFDaEIsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQzdCLENBQUM7SUFDSCxDQUFDO0lBRU8saUJBQWlCLENBQUMsR0FBcUI7UUFDN0Msd0RBQXdEO1FBRXhELE1BQU0sT0FBTyxHQUEyQixFQUFFLENBQUM7UUFDM0MsTUFBTSxXQUFXLEdBQW1DLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWhHLHFDQUFxQztRQUNyQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFFLHFEQUFxRDtRQUNyRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUMvQixPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsbUNBQW1DLENBQUM7UUFDMUQsQ0FBQztRQUVELG9FQUFvRTtRQUNwRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUNyQyxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNuRCwwQ0FBMEM7WUFDMUMsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxZQUFZLENBQUM7WUFDekMsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUcsQ0FBQyxhQUFhLEVBQUU7WUFDekIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLE9BQU87WUFDUCxXQUFXO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFFTyxZQUFZLENBQUMsTUFBb0IsRUFBRSxXQUFtQjtRQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQixRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQzt5SEF2T1UsWUFBWTs2SEFBWixZQUFZOztzR0FBWixZQUFZO2tCQUR4QixVQUFVOztBQTJPWDs7R0FFRztBQUNILE1BQU0sT0FBZ0IsWUFBWTtDQUVqQztBQUVELFNBQVMsSUFBSSxLQUFVLENBQUM7QUFFeEI7Ozs7O0dBS0c7QUFDSCxTQUFTLDJDQUEyQyxDQUFDLE9BQXlCO0lBQzVFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmplY3QsIEluamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtcbiAgSFRUUF9TVEFUVVNfQ09ERV9PSyxcbiAgSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCxcbiAgSHR0cEVycm9yUmVzcG9uc2UsXG4gIEh0dHBFdmVudCxcbiAgSHR0cEV2ZW50VHlwZSxcbiAgSHR0cEhlYWRlclJlc3BvbnNlLFxuICBIdHRwUmVzcG9uc2UsXG59IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuY29uc3QgUkVRVUVTVF9VUkxfSEVBREVSID0gYFgtUmVxdWVzdC1VUkxgO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiByZXNwb25zZSB1cmwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybChyZXNwb25zZTogUmVzcG9uc2UpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKHJlc3BvbnNlLnVybCkge1xuICAgIHJldHVybiByZXNwb25zZS51cmw7XG4gIH1cbiAgLy8gc3RvcmVkIGFzIGxvd2VyY2FzZSBpbiB0aGUgbWFwXG4gIGNvbnN0IHhSZXF1ZXN0VXJsID0gUkVRVUVTVF9VUkxfSEVBREVSLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gIHJldHVybiByZXNwb25zZS5oZWFkZXJzLmdldCh4UmVxdWVzdFVybCk7XG59XG5cbi8qKlxuICogVXNlcyBgZmV0Y2hgIHRvIHNlbmQgcmVxdWVzdHMgdG8gYSBiYWNrZW5kIHNlcnZlci5cbiAqXG4gKiBUaGlzIGBGZXRjaEJhY2tlbmRgIHJlcXVpcmVzIHRoZSBzdXBwb3J0IG9mIHRoZVxuICogW0ZldGNoIEFQSV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0ZldGNoX0FQSSkgd2hpY2ggaXMgYXZhaWxhYmxlIG9uIGFsbFxuICogc3VwcG9ydGVkIGJyb3dzZXJzIGFuZCBvbiBOb2RlLmpzIHYxOCBvciBsYXRlci5cbiAqXG4gKiBAc2VlIHtAbGluayBIdHRwSGFuZGxlcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGZXRjaEJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIC8vIFdlIHVzZSBhbiBhcnJvdyBmdW5jdGlvbiB0byBhbHdheXMgcmVmZXJlbmNlIHRoZSBjdXJyZW50IGdsb2JhbCBpbXBsZW1lbnRhdGlvbiBvZiBgZmV0Y2hgLlxuICAvLyBUaGlzIGlzIGhlbHBmdWwgZm9yIGNhc2VzIHdoZW4gdGhlIGdsb2JhbCBgZmV0Y2hgIGltcGxlbWVudGF0aW9uIGlzIG1vZGlmaWVkIGJ5IGV4dGVybmFsIGNvZGUsXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy81NzUyNy5cbiAgcHJpdmF0ZSByZWFkb25seSBmZXRjaEltcGwgPVxuICAgIGluamVjdChGZXRjaEZhY3RvcnksIHtvcHRpb25hbDogdHJ1ZX0pPy5mZXRjaCA/PyAoKC4uLmFyZ3MpID0+IGdsb2JhbFRoaXMuZmV0Y2goLi4uYXJncykpO1xuICBwcml2YXRlIHJlYWRvbmx5IG5nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIGhhbmRsZShyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgIGNvbnN0IGFib3J0ZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICB0aGlzLmRvUmVxdWVzdChyZXF1ZXN0LCBhYm9ydGVyLnNpZ25hbCwgb2JzZXJ2ZXIpLnRoZW4obm9vcCwgKGVycm9yKSA9PlxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe2Vycm9yfSkpLFxuICAgICAgKTtcbiAgICAgIHJldHVybiAoKSA9PiBhYm9ydGVyLmFib3J0KCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRvUmVxdWVzdChcbiAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIHNpZ25hbDogQWJvcnRTaWduYWwsXG4gICAgb2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaW5pdCA9IHRoaXMuY3JlYXRlUmVxdWVzdEluaXQocmVxdWVzdCk7XG4gICAgbGV0IHJlc3BvbnNlO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFJ1biBmZXRjaCBvdXRzaWRlIG9mIEFuZ3VsYXIgem9uZS5cbiAgICAgIC8vIFRoaXMgaXMgZHVlIHRvIE5vZGUuanMgZmV0Y2ggaW1wbGVtZW50YXRpb24gKFVuZGljaSkgd2hpY2ggdXNlcyBhIG51bWJlciBvZiBzZXRUaW1lb3V0cyB0byBjaGVjayBpZlxuICAgICAgLy8gdGhlIHJlc3BvbnNlIHNob3VsZCBldmVudHVhbGx5IHRpbWVvdXQgd2hpY2ggY2F1c2VzIGV4dHJhIENEIGN5Y2xlcyBldmVyeSA1MDBtc1xuICAgICAgY29uc3QgZmV0Y2hQcm9taXNlID0gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgICAgdGhpcy5mZXRjaEltcGwocmVxdWVzdC51cmxXaXRoUGFyYW1zLCB7c2lnbmFsLCAuLi5pbml0fSksXG4gICAgICApO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgWm9uZS5qcyBkb2Vzbid0IHRyaWdnZXIgZmFsc2UtcG9zaXRpdmUgdW5oYW5kbGVkIHByb21pc2VcbiAgICAgIC8vIGVycm9yIGluIGNhc2UgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWQgc3luY2hyb25vdXNseS4gU2VlIGZ1bmN0aW9uXG4gICAgICAvLyBkZXNjcmlwdGlvbiBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICAgIHNpbGVuY2VTdXBlcmZsdW91c1VuaGFuZGxlZFByb21pc2VSZWplY3Rpb24oZmV0Y2hQcm9taXNlKTtcblxuICAgICAgLy8gU2VuZCB0aGUgYFNlbnRgIGV2ZW50IGJlZm9yZSBhd2FpdGluZyB0aGUgcmVzcG9uc2UuXG4gICAgICBvYnNlcnZlci5uZXh0KHt0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnR9KTtcblxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaFByb21pc2U7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgPz8gMCxcbiAgICAgICAgICBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0LFxuICAgICAgICAgIHVybDogcmVxdWVzdC51cmxXaXRoUGFyYW1zLFxuICAgICAgICAgIGhlYWRlcnM6IGVycm9yLmhlYWRlcnMsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpO1xuICAgIGNvbnN0IHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0dXNUZXh0O1xuICAgIGNvbnN0IHVybCA9IGdldFJlc3BvbnNlVXJsKHJlc3BvbnNlKSA/PyByZXF1ZXN0LnVybFdpdGhQYXJhbXM7XG5cbiAgICBsZXQgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgIGxldCBib2R5OiBzdHJpbmcgfCBBcnJheUJ1ZmZlciB8IEJsb2IgfCBvYmplY3QgfCBudWxsID0gbnVsbDtcblxuICAgIGlmIChyZXF1ZXN0LnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwSGVhZGVyUmVzcG9uc2Uoe2hlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dCwgdXJsfSkpO1xuICAgIH1cblxuICAgIGlmIChyZXNwb25zZS5ib2R5KSB7XG4gICAgICAvLyBSZWFkIFByb2dyZXNzXG4gICAgICBjb25zdCBjb250ZW50TGVuZ3RoID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtbGVuZ3RoJyk7XG4gICAgICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcbiAgICAgIGxldCByZWNlaXZlZExlbmd0aCA9IDA7XG5cbiAgICAgIGxldCBkZWNvZGVyOiBUZXh0RGVjb2RlcjtcbiAgICAgIGxldCBwYXJ0aWFsVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgICAvLyBXZSBoYXZlIHRvIGNoZWNrIHdoZXRoZXIgdGhlIFpvbmUgaXMgZGVmaW5lZCBpbiB0aGUgZ2xvYmFsIHNjb3BlIGJlY2F1c2UgdGhpcyBtYXkgYmUgY2FsbGVkXG4gICAgICAvLyB3aGVuIHRoZSB6b25lIGlzIG5vb3BlZC5cbiAgICAgIGNvbnN0IHJlcVpvbmUgPSB0eXBlb2YgWm9uZSAhPT0gJ3VuZGVmaW5lZCcgJiYgWm9uZS5jdXJyZW50O1xuXG4gICAgICAvLyBQZXJmb3JtIHJlc3BvbnNlIHByb2Nlc3Npbmcgb3V0c2lkZSBvZiBBbmd1bGFyIHpvbmUgdG9cbiAgICAgIC8vIGVuc3VyZSBubyBleGNlc3NpdmUgY2hhbmdlIGRldGVjdGlvbiBydW5zIGFyZSBleGVjdXRlZFxuICAgICAgLy8gSGVyZSBjYWxsaW5nIHRoZSBhc3luYyBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIucmVhZCgpIGlzIHJlc3BvbnNpYmxlIGZvciB0cmlnZ2VyaW5nIENEXG4gICAgICBhd2FpdCB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihhc3luYyAoKSA9PiB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY29uc3Qge2RvbmUsIHZhbHVlfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cbiAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2h1bmtzLnB1c2godmFsdWUpO1xuICAgICAgICAgIHJlY2VpdmVkTGVuZ3RoICs9IHZhbHVlLmxlbmd0aDtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0LnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgICAgICBwYXJ0aWFsVGV4dCA9XG4gICAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID09PSAndGV4dCdcbiAgICAgICAgICAgICAgICA/IChwYXJ0aWFsVGV4dCA/PyAnJykgK1xuICAgICAgICAgICAgICAgICAgKGRlY29kZXIgPz89IG5ldyBUZXh0RGVjb2RlcigpKS5kZWNvZGUodmFsdWUsIHtzdHJlYW06IHRydWV9KVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBjb25zdCByZXBvcnRQcm9ncmVzcyA9ICgpID0+XG4gICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoe1xuICAgICAgICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcyxcbiAgICAgICAgICAgICAgICB0b3RhbDogY29udGVudExlbmd0aCA/ICtjb250ZW50TGVuZ3RoIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGxvYWRlZDogcmVjZWl2ZWRMZW5ndGgsXG4gICAgICAgICAgICAgICAgcGFydGlhbFRleHQsXG4gICAgICAgICAgICAgIH0gYXMgSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCk7XG4gICAgICAgICAgICByZXFab25lID8gcmVxWm9uZS5ydW4ocmVwb3J0UHJvZ3Jlc3MpIDogcmVwb3J0UHJvZ3Jlc3MoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb21iaW5lIGFsbCBjaHVua3MuXG4gICAgICBjb25zdCBjaHVua3NBbGwgPSB0aGlzLmNvbmNhdENodW5rcyhjaHVua3MsIHJlY2VpdmVkTGVuZ3RoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpID8/ICcnO1xuICAgICAgICBib2R5ID0gdGhpcy5wYXJzZUJvZHkocmVxdWVzdCwgY2h1bmtzQWxsLCBjb250ZW50VHlwZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBCb2R5IGxvYWRpbmcgb3IgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgICAgbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgaGVhZGVyczogbmV3IEh0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpLFxuICAgICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgICAgdXJsOiBnZXRSZXNwb25zZVVybChyZXNwb25zZSkgPz8gcmVxdWVzdC51cmxXaXRoUGFyYW1zLFxuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2FtZSBiZWhhdmlvciBhcyB0aGUgWGhyQmFja2VuZFxuICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgIHN0YXR1cyA9IGJvZHkgPyBIVFRQX1NUQVRVU19DT0RFX09LIDogMDtcbiAgICB9XG5cbiAgICAvLyBvayBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlc3BvbnNlIHdpbGwgYmUgdHJhbnNtaXR0ZWQgb24gdGhlIGV2ZW50IG9yXG4gICAgLy8gZXJyb3IgY2hhbm5lbC4gVW5zdWNjZXNzZnVsIHN0YXR1cyBjb2RlcyAobm90IDJ4eCkgd2lsbCBhbHdheXMgYmUgZXJyb3JzLFxuICAgIC8vIGJ1dCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgY2FuIHN0aWxsIHJlc3VsdCBpbiBhbiBlcnJvciBpZiB0aGUgdXNlclxuICAgIC8vIGFza2VkIGZvciBKU09OIGRhdGEgYW5kIHRoZSBib2R5IGNhbm5vdCBiZSBwYXJzZWQgYXMgc3VjaC5cbiAgICBjb25zdCBvayA9IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuXG4gICAgaWYgKG9rKSB7XG4gICAgICBvYnNlcnZlci5uZXh0KFxuICAgICAgICBuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICBib2R5LFxuICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IoXG4gICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBhcnNlQm9keShcbiAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIGJpbkNvbnRlbnQ6IFVpbnQ4QXJyYXksXG4gICAgY29udGVudFR5cGU6IHN0cmluZyxcbiAgKTogc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBCbG9iIHwgb2JqZWN0IHwgbnVsbCB7XG4gICAgc3dpdGNoIChyZXF1ZXN0LnJlc3BvbnNlVHlwZSkge1xuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIC8vIHN0cmlwcGluZyB0aGUgWFNTSSB3aGVuIHByZXNlbnRcbiAgICAgICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShiaW5Db250ZW50KS5yZXBsYWNlKFhTU0lfUFJFRklYLCAnJyk7XG4gICAgICAgIHJldHVybiB0ZXh0ID09PSAnJyA/IG51bGwgOiAoSlNPTi5wYXJzZSh0ZXh0KSBhcyBvYmplY3QpO1xuICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYmluQ29udGVudCk7XG4gICAgICBjYXNlICdibG9iJzpcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKFtiaW5Db250ZW50XSwge3R5cGU6IGNvbnRlbnRUeXBlfSk7XG4gICAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICAgIHJldHVybiBiaW5Db250ZW50LmJ1ZmZlcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlcXVlc3RJbml0KHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IFJlcXVlc3RJbml0IHtcbiAgICAvLyBXZSBjb3VsZCBzaGFyZSBzb21lIG9mIHRoaXMgbG9naWMgd2l0aCB0aGUgWGhyQmFja2VuZFxuXG4gICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGNyZWRlbnRpYWxzOiBSZXF1ZXN0Q3JlZGVudGlhbHMgfCB1bmRlZmluZWQgPSByZXEud2l0aENyZWRlbnRpYWxzID8gJ2luY2x1ZGUnIDogdW5kZWZpbmVkO1xuXG4gICAgLy8gU2V0dGluZyBhbGwgdGhlIHJlcXVlc3RlZCBoZWFkZXJzLlxuICAgIHJlcS5oZWFkZXJzLmZvckVhY2goKG5hbWUsIHZhbHVlcykgPT4gKGhlYWRlcnNbbmFtZV0gPSB2YWx1ZXMuam9pbignLCcpKSk7XG5cbiAgICAvLyBBZGQgYW4gQWNjZXB0IGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdBY2NlcHQnKSkge1xuICAgICAgaGVhZGVyc1snQWNjZXB0J10gPSAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJztcbiAgICB9XG5cbiAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSkge1xuICAgICAgY29uc3QgZGV0ZWN0ZWRUeXBlID0gcmVxLmRldGVjdENvbnRlbnRUeXBlSGVhZGVyKCk7XG4gICAgICAvLyBTb21ldGltZXMgQ29udGVudC1UeXBlIGRldGVjdGlvbiBmYWlscy5cbiAgICAgIGlmIChkZXRlY3RlZFR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBkZXRlY3RlZFR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJvZHk6IHJlcS5zZXJpYWxpemVCb2R5KCksXG4gICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICBoZWFkZXJzLFxuICAgICAgY3JlZGVudGlhbHMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29uY2F0Q2h1bmtzKGNodW5rczogVWludDhBcnJheVtdLCB0b3RhbExlbmd0aDogbnVtYmVyKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgY2h1bmtzQWxsID0gbmV3IFVpbnQ4QXJyYXkodG90YWxMZW5ndGgpO1xuICAgIGxldCBwb3NpdGlvbiA9IDA7XG4gICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgIGNodW5rc0FsbC5zZXQoY2h1bmssIHBvc2l0aW9uKTtcbiAgICAgIHBvc2l0aW9uICs9IGNodW5rLmxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2h1bmtzQWxsO1xuICB9XG59XG5cbi8qKlxuICogQWJzdHJhY3QgY2xhc3MgdG8gcHJvdmlkZSBhIG1vY2tlZCBpbXBsZW1lbnRhdGlvbiBvZiBgZmV0Y2goKWBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZldGNoRmFjdG9yeSB7XG4gIGFic3RyYWN0IGZldGNoOiB0eXBlb2YgZmV0Y2g7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKTogdm9pZCB7fVxuXG4vKipcbiAqIFpvbmUuanMgdHJlYXRzIGEgcmVqZWN0ZWQgcHJvbWlzZSB0aGF0IGhhcyBub3QgeWV0IGJlZW4gYXdhaXRlZFxuICogYXMgYW4gdW5oYW5kbGVkIGVycm9yLiBUaGlzIGZ1bmN0aW9uIGFkZHMgYSBub29wIGAudGhlbmAgdG8gbWFrZVxuICogc3VyZSB0aGF0IFpvbmUuanMgZG9lc24ndCB0aHJvdyBhbiBlcnJvciBpZiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZFxuICogc3luY2hyb25vdXNseS5cbiAqL1xuZnVuY3Rpb24gc2lsZW5jZVN1cGVyZmx1b3VzVW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbihwcm9taXNlOiBQcm9taXNlPHVua25vd24+KSB7XG4gIHByb21pc2UudGhlbihub29wLCBub29wKTtcbn1cbiJdfQ==