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
        // Note: binding fetch directly causes an "illegal invocation" error
        // We use an arrow function to always reference the current global implementation of fetch
        // In case it has been (monkey)patched after the FetchBackend has been created
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.1+sha-36aa3af", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.1+sha-36aa3af", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.1+sha-36aa3af", ngImport: i0, type: FetchBackend, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQ0wsbUJBQW1CLEVBRW5CLGlCQUFpQixFQUVqQixhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLFlBQVksR0FDYixNQUFNLFlBQVksQ0FBQzs7QUFFcEIsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBRTNDOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFFBQWtCO0lBQ3hDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsaUNBQWlDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0QsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBRHpCO1FBRUUsb0VBQW9FO1FBQ3BFLDBGQUEwRjtRQUMxRiw4RUFBOEU7UUFDN0QsY0FBUyxHQUN4QixNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsVUFB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LEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLE9BQU87WUFDUCxXQUFXO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFFTyxZQUFZLENBQUMsTUFBb0IsRUFBRSxXQUFtQjtRQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQixRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQzt5SEF2T1UsWUFBWTs2SEFBWixZQUFZOztzR0FBWixZQUFZO2tCQUR4QixVQUFVOztBQTJPWDs7R0FFRztBQUNILE1BQU0sT0FBZ0IsWUFBWTtDQUVqQztBQUVELFNBQVMsSUFBSSxLQUFVLENBQUM7QUFFeEI7Ozs7O0dBS0c7QUFDSCxTQUFTLDJDQUEyQyxDQUFDLE9BQXlCO0lBQzVFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmplY3QsIEluamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtcbiAgSFRUUF9TVEFUVVNfQ09ERV9PSyxcbiAgSHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCxcbiAgSHR0cEVycm9yUmVzcG9uc2UsXG4gIEh0dHBFdmVudCxcbiAgSHR0cEV2ZW50VHlwZSxcbiAgSHR0cEhlYWRlclJlc3BvbnNlLFxuICBIdHRwUmVzcG9uc2UsXG59IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuY29uc3QgUkVRVUVTVF9VUkxfSEVBREVSID0gYFgtUmVxdWVzdC1VUkxgO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiByZXNwb25zZSB1cmwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybChyZXNwb25zZTogUmVzcG9uc2UpOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKHJlc3BvbnNlLnVybCkge1xuICAgIHJldHVybiByZXNwb25zZS51cmw7XG4gIH1cbiAgLy8gc3RvcmVkIGFzIGxvd2VyY2FzZSBpbiB0aGUgbWFwXG4gIGNvbnN0IHhSZXF1ZXN0VXJsID0gUkVRVUVTVF9VUkxfSEVBREVSLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gIHJldHVybiByZXNwb25zZS5oZWFkZXJzLmdldCh4UmVxdWVzdFVybCk7XG59XG5cbi8qKlxuICogVXNlcyBgZmV0Y2hgIHRvIHNlbmQgcmVxdWVzdHMgdG8gYSBiYWNrZW5kIHNlcnZlci5cbiAqXG4gKiBUaGlzIGBGZXRjaEJhY2tlbmRgIHJlcXVpcmVzIHRoZSBzdXBwb3J0IG9mIHRoZVxuICogW0ZldGNoIEFQSV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0ZldGNoX0FQSSkgd2hpY2ggaXMgYXZhaWxhYmxlIG9uIGFsbFxuICogc3VwcG9ydGVkIGJyb3dzZXJzIGFuZCBvbiBOb2RlLmpzIHYxOCBvciBsYXRlci5cbiAqXG4gKiBAc2VlIHtAbGluayBIdHRwSGFuZGxlcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGZXRjaEJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIC8vIE5vdGU6IGJpbmRpbmcgZmV0Y2ggZGlyZWN0bHkgY2F1c2VzIGFuIFwiaWxsZWdhbCBpbnZvY2F0aW9uXCIgZXJyb3JcbiAgLy8gV2UgdXNlIGFuIGFycm93IGZ1bmN0aW9uIHRvIGFsd2F5cyByZWZlcmVuY2UgdGhlIGN1cnJlbnQgZ2xvYmFsIGltcGxlbWVudGF0aW9uIG9mIGZldGNoXG4gIC8vIEluIGNhc2UgaXQgaGFzIGJlZW4gKG1vbmtleSlwYXRjaGVkIGFmdGVyIHRoZSBGZXRjaEJhY2tlbmQgaGFzIGJlZW4gY3JlYXRlZFxuICBwcml2YXRlIHJlYWRvbmx5IGZldGNoSW1wbCA9XG4gICAgaW5qZWN0KEZldGNoRmFjdG9yeSwge29wdGlvbmFsOiB0cnVlfSk/LmZldGNoID8/ICgoLi4uYXJncykgPT4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKSk7XG4gIHByaXZhdGUgcmVhZG9ubHkgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgaGFuZGxlKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcikgPT4ge1xuICAgICAgY29uc3QgYWJvcnRlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgIHRoaXMuZG9SZXF1ZXN0KHJlcXVlc3QsIGFib3J0ZXIuc2lnbmFsLCBvYnNlcnZlcikudGhlbihub29wLCAoZXJyb3IpID0+XG4gICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7ZXJyb3J9KSksXG4gICAgICApO1xuICAgICAgcmV0dXJuICgpID0+IGFib3J0ZXIuYWJvcnQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9SZXF1ZXN0KFxuICAgIHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sXG4gICAgc2lnbmFsOiBBYm9ydFNpZ25hbCxcbiAgICBvYnNlcnZlcjogT2JzZXJ2ZXI8SHR0cEV2ZW50PGFueT4+LFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBpbml0ID0gdGhpcy5jcmVhdGVSZXF1ZXN0SW5pdChyZXF1ZXN0KTtcbiAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICB0cnkge1xuICAgICAgLy8gUnVuIGZldGNoIG91dHNpZGUgb2YgQW5ndWxhciB6b25lLlxuICAgICAgLy8gVGhpcyBpcyBkdWUgdG8gTm9kZS5qcyBmZXRjaCBpbXBsZW1lbnRhdGlvbiAoVW5kaWNpKSB3aGljaCB1c2VzIGEgbnVtYmVyIG9mIHNldFRpbWVvdXRzIHRvIGNoZWNrIGlmXG4gICAgICAvLyB0aGUgcmVzcG9uc2Ugc2hvdWxkIGV2ZW50dWFsbHkgdGltZW91dCB3aGljaCBjYXVzZXMgZXh0cmEgQ0QgY3ljbGVzIGV2ZXJ5IDUwMG1zXG4gICAgICBjb25zdCBmZXRjaFByb21pc2UgPSB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICB0aGlzLmZldGNoSW1wbChyZXF1ZXN0LnVybFdpdGhQYXJhbXMsIHtzaWduYWwsIC4uLmluaXR9KSxcbiAgICAgICk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBab25lLmpzIGRvZXNuJ3QgdHJpZ2dlciBmYWxzZS1wb3NpdGl2ZSB1bmhhbmRsZWQgcHJvbWlzZVxuICAgICAgLy8gZXJyb3IgaW4gY2FzZSB0aGUgUHJvbWlzZSBpcyByZWplY3RlZCBzeW5jaHJvbm91c2x5LiBTZWUgZnVuY3Rpb25cbiAgICAgIC8vIGRlc2NyaXB0aW9uIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICAgICAgc2lsZW5jZVN1cGVyZmx1b3VzVW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbihmZXRjaFByb21pc2UpO1xuXG4gICAgICAvLyBTZW5kIHRoZSBgU2VudGAgZXZlbnQgYmVmb3JlIGF3YWl0aW5nIHRoZSByZXNwb25zZS5cbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoUHJvbWlzZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBvYnNlcnZlci5lcnJvcihcbiAgICAgICAgbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBzdGF0dXM6IGVycm9yLnN0YXR1cyA/PyAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IGVycm9yLnN0YXR1c1RleHQsXG4gICAgICAgICAgdXJsOiByZXF1ZXN0LnVybFdpdGhQYXJhbXMsXG4gICAgICAgICAgaGVhZGVyczogZXJyb3IuaGVhZGVycyxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMocmVzcG9uc2UuaGVhZGVycyk7XG4gICAgY29uc3Qgc3RhdHVzVGV4dCA9IHJlc3BvbnNlLnN0YXR1c1RleHQ7XG4gICAgY29uc3QgdXJsID0gZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2UpID8/IHJlcXVlc3QudXJsV2l0aFBhcmFtcztcblxuICAgIGxldCBzdGF0dXMgPSByZXNwb25zZS5zdGF0dXM7XG4gICAgbGV0IGJvZHk6IHN0cmluZyB8IEFycmF5QnVmZmVyIHwgQmxvYiB8IG9iamVjdCB8IG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHJlcXVlc3QucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgIG9ic2VydmVyLm5leHQobmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KSk7XG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLmJvZHkpIHtcbiAgICAgIC8vIFJlYWQgUHJvZ3Jlc3NcbiAgICAgIGNvbnN0IGNvbnRlbnRMZW5ndGggPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC1sZW5ndGgnKTtcbiAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XG4gICAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LmdldFJlYWRlcigpO1xuICAgICAgbGV0IHJlY2VpdmVkTGVuZ3RoID0gMDtcblxuICAgICAgbGV0IGRlY29kZXI6IFRleHREZWNvZGVyO1xuICAgICAgbGV0IHBhcnRpYWxUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIFdlIGhhdmUgdG8gY2hlY2sgd2hldGhlciB0aGUgWm9uZSBpcyBkZWZpbmVkIGluIHRoZSBnbG9iYWwgc2NvcGUgYmVjYXVzZSB0aGlzIG1heSBiZSBjYWxsZWRcbiAgICAgIC8vIHdoZW4gdGhlIHpvbmUgaXMgbm9vcGVkLlxuICAgICAgY29uc3QgcmVxWm9uZSA9IHR5cGVvZiBab25lICE9PSAndW5kZWZpbmVkJyAmJiBab25lLmN1cnJlbnQ7XG5cbiAgICAgIC8vIFBlcmZvcm0gcmVzcG9uc2UgcHJvY2Vzc2luZyBvdXRzaWRlIG9mIEFuZ3VsYXIgem9uZSB0b1xuICAgICAgLy8gZW5zdXJlIG5vIGV4Y2Vzc2l2ZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgYXJlIGV4ZWN1dGVkXG4gICAgICAvLyBIZXJlIGNhbGxpbmcgdGhlIGFzeW5jIFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlci5yZWFkKCkgaXMgcmVzcG9uc2libGUgZm9yIHRyaWdnZXJpbmcgQ0RcbiAgICAgIGF3YWl0IHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGFzeW5jICgpID0+IHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCB7ZG9uZSwgdmFsdWV9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcblxuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjaHVua3MucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgcmVjZWl2ZWRMZW5ndGggKz0gdmFsdWUubGVuZ3RoO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHBhcnRpYWxUZXh0ID1cbiAgICAgICAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgICAgICAgID8gKHBhcnRpYWxUZXh0ID8/ICcnKSArXG4gICAgICAgICAgICAgICAgICAoZGVjb2RlciA/Pz0gbmV3IFRleHREZWNvZGVyKCkpLmRlY29kZSh2YWx1ZSwge3N0cmVhbTogdHJ1ZX0pXG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcG9ydFByb2dyZXNzID0gKCkgPT5cbiAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7XG4gICAgICAgICAgICAgICAgdHlwZTogSHR0cEV2ZW50VHlwZS5Eb3dubG9hZFByb2dyZXNzLFxuICAgICAgICAgICAgICAgIHRvdGFsOiBjb250ZW50TGVuZ3RoID8gK2NvbnRlbnRMZW5ndGggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgbG9hZGVkOiByZWNlaXZlZExlbmd0aCxcbiAgICAgICAgICAgICAgICBwYXJ0aWFsVGV4dCxcbiAgICAgICAgICAgICAgfSBhcyBIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50KTtcbiAgICAgICAgICAgIHJlcVpvbmUgPyByZXFab25lLnJ1bihyZXBvcnRQcm9ncmVzcykgOiByZXBvcnRQcm9ncmVzcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIENvbWJpbmUgYWxsIGNodW5rcy5cbiAgICAgIGNvbnN0IGNodW5rc0FsbCA9IHRoaXMuY29uY2F0Q2h1bmtzKGNodW5rcywgcmVjZWl2ZWRMZW5ndGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgPz8gJyc7XG4gICAgICAgIGJvZHkgPSB0aGlzLnBhcnNlQm9keShyZXF1ZXN0LCBjaHVua3NBbGwsIGNvbnRlbnRUeXBlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIEJvZHkgbG9hZGluZyBvciBwYXJzaW5nIGZhaWxlZFxuICAgICAgICBvYnNlcnZlci5lcnJvcihcbiAgICAgICAgICBuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICBoZWFkZXJzOiBuZXcgSHR0cEhlYWRlcnMocmVzcG9uc2UuaGVhZGVycyksXG4gICAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgICB1cmw6IGdldFJlc3BvbnNlVXJsKHJlc3BvbnNlKSA/PyByZXF1ZXN0LnVybFdpdGhQYXJhbXMsXG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTYW1lIGJlaGF2aW9yIGFzIHRoZSBYaHJCYWNrZW5kXG4gICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgc3RhdHVzID0gYm9keSA/IEhUVFBfU1RBVFVTX0NPREVfT0sgOiAwO1xuICAgIH1cblxuICAgIC8vIG9rIGRldGVybWluZXMgd2hldGhlciB0aGUgcmVzcG9uc2Ugd2lsbCBiZSB0cmFuc21pdHRlZCBvbiB0aGUgZXZlbnQgb3JcbiAgICAvLyBlcnJvciBjaGFubmVsLiBVbnN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGVzIChub3QgMnh4KSB3aWxsIGFsd2F5cyBiZSBlcnJvcnMsXG4gICAgLy8gYnV0IGEgc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZSBjYW4gc3RpbGwgcmVzdWx0IGluIGFuIGVycm9yIGlmIHRoZSB1c2VyXG4gICAgLy8gYXNrZWQgZm9yIEpTT04gZGF0YSBhbmQgdGhlIGJvZHkgY2Fubm90IGJlIHBhcnNlZCBhcyBzdWNoLlxuICAgIGNvbnN0IG9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG5cbiAgICBpZiAob2spIHtcbiAgICAgIG9ic2VydmVyLm5leHQoXG4gICAgICAgIG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgIGJvZHksXG4gICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICB1cmwsXG4gICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgICAgLy8gVGhlIGZ1bGwgYm9keSBoYXMgYmVlbiByZWNlaXZlZCBhbmQgZGVsaXZlcmVkLCBubyBmdXJ0aGVyIGV2ZW50c1xuICAgICAgLy8gYXJlIHBvc3NpYmxlLiBUaGlzIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYnNlcnZlci5lcnJvcihcbiAgICAgICAgbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgICBlcnJvcjogYm9keSxcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VCb2R5KFxuICAgIHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sXG4gICAgYmluQ29udGVudDogVWludDhBcnJheSxcbiAgICBjb250ZW50VHlwZTogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBBcnJheUJ1ZmZlciB8IEJsb2IgfCBvYmplY3QgfCBudWxsIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QucmVzcG9uc2VUeXBlKSB7XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgLy8gc3RyaXBwaW5nIHRoZSBYU1NJIHdoZW4gcHJlc2VudFxuICAgICAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJpbkNvbnRlbnQpLnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgcmV0dXJuIHRleHQgPT09ICcnID8gbnVsbCA6IChKU09OLnBhcnNlKHRleHQpIGFzIG9iamVjdCk7XG4gICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShiaW5Db250ZW50KTtcbiAgICAgIGNhc2UgJ2Jsb2InOlxuICAgICAgICByZXR1cm4gbmV3IEJsb2IoW2JpbkNvbnRlbnRdLCB7dHlwZTogY29udGVudFR5cGV9KTtcbiAgICAgIGNhc2UgJ2FycmF5YnVmZmVyJzpcbiAgICAgICAgcmV0dXJuIGJpbkNvbnRlbnQuYnVmZmVyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVxdWVzdEluaXQocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogUmVxdWVzdEluaXQge1xuICAgIC8vIFdlIGNvdWxkIHNoYXJlIHNvbWUgb2YgdGhpcyBsb2dpYyB3aXRoIHRoZSBYaHJCYWNrZW5kXG5cbiAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3QgY3JlZGVudGlhbHM6IFJlcXVlc3RDcmVkZW50aWFscyB8IHVuZGVmaW5lZCA9IHJlcS53aXRoQ3JlZGVudGlhbHMgPyAnaW5jbHVkZScgOiB1bmRlZmluZWQ7XG5cbiAgICAvLyBTZXR0aW5nIGFsbCB0aGUgcmVxdWVzdGVkIGhlYWRlcnMuXG4gICAgcmVxLmhlYWRlcnMuZm9yRWFjaCgobmFtZSwgdmFsdWVzKSA9PiAoaGVhZGVyc1tuYW1lXSA9IHZhbHVlcy5qb2luKCcsJykpKTtcblxuICAgIC8vIEFkZCBhbiBBY2NlcHQgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0FjY2VwdCcpKSB7XG4gICAgICBoZWFkZXJzWydBY2NlcHQnXSA9ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonO1xuICAgIH1cblxuICAgIC8vIEF1dG8tZGV0ZWN0IHRoZSBDb250ZW50LVR5cGUgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICBjb25zdCBkZXRlY3RlZFR5cGUgPSByZXEuZGV0ZWN0Q29udGVudFR5cGVIZWFkZXIoKTtcbiAgICAgIC8vIFNvbWV0aW1lcyBDb250ZW50LVR5cGUgZGV0ZWN0aW9uIGZhaWxzLlxuICAgICAgaWYgKGRldGVjdGVkVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IGRldGVjdGVkVHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYm9keTogcmVxLnNlcmlhbGl6ZUJvZHkoKSxcbiAgICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBjcmVkZW50aWFscyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb25jYXRDaHVua3MoY2h1bmtzOiBVaW50OEFycmF5W10sIHRvdGFsTGVuZ3RoOiBudW1iZXIpOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCBjaHVua3NBbGwgPSBuZXcgVWludDhBcnJheSh0b3RhbExlbmd0aCk7XG4gICAgbGV0IHBvc2l0aW9uID0gMDtcbiAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xuICAgICAgY2h1bmtzQWxsLnNldChjaHVuaywgcG9zaXRpb24pO1xuICAgICAgcG9zaXRpb24gKz0gY2h1bmsubGVuZ3RoO1xuICAgIH1cblxuICAgIHJldHVybiBjaHVua3NBbGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyB0byBwcm92aWRlIGEgbW9ja2VkIGltcGxlbWVudGF0aW9uIG9mIGBmZXRjaCgpYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRmV0Y2hGYWN0b3J5IHtcbiAgYWJzdHJhY3QgZmV0Y2g6IHR5cGVvZiBmZXRjaDtcbn1cblxuZnVuY3Rpb24gbm9vcCgpOiB2b2lkIHt9XG5cbi8qKlxuICogWm9uZS5qcyB0cmVhdHMgYSByZWplY3RlZCBwcm9taXNlIHRoYXQgaGFzIG5vdCB5ZXQgYmVlbiBhd2FpdGVkXG4gKiBhcyBhbiB1bmhhbmRsZWQgZXJyb3IuIFRoaXMgZnVuY3Rpb24gYWRkcyBhIG5vb3AgYC50aGVuYCB0byBtYWtlXG4gKiBzdXJlIHRoYXQgWm9uZS5qcyBkb2Vzbid0IHRocm93IGFuIGVycm9yIGlmIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkXG4gKiBzeW5jaHJvbm91c2x5LlxuICovXG5mdW5jdGlvbiBzaWxlbmNlU3VwZXJmbHVvdXNVbmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uKHByb21pc2U6IFByb21pc2U8dW5rbm93bj4pIHtcbiAgcHJvbWlzZS50aGVuKG5vb3AsIG5vb3ApO1xufVxuIl19