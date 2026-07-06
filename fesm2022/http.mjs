/**
 * @license Angular v20.3.25+sha-406aaa3
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import { HttpHeaders, HttpParams, HttpRequest, HttpEventType, HttpErrorResponse, HttpClient, HTTP_ROOT_INTERCEPTOR_FNS, HttpResponse } from './module.mjs';
export { FetchBackend, HTTP_INTERCEPTORS, HttpBackend, HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule, HttpContext, HttpContextToken, HttpFeatureKind, HttpHandler, HttpHeaderResponse, HttpResponseBase, HttpStatusCode, HttpUrlEncodingCodec, HttpXhrBackend, HttpXsrfTokenExtractor, JsonpClientBackend, JsonpInterceptor, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi, withJsonpSupport, withNoXsrfProtection, withRequestsMadeViaParent, withXsrfConfiguration, HttpInterceptorHandler as ɵHttpInterceptingHandler, HttpInterceptorHandler as ɵHttpInterceptorHandler, REQUESTS_CONTRIBUTE_TO_STABILITY as ɵREQUESTS_CONTRIBUTE_TO_STABILITY } from './module.mjs';
import { assertInInjectionContext, inject, Injector, ɵResourceImpl as _ResourceImpl, linkedSignal, computed, signal, ɵencapsulateResourceError as _encapsulateResourceError, ɵRuntimeError as _RuntimeError, InjectionToken, ɵperformanceMarkFeature as _performanceMarkFeature, APP_BOOTSTRAP_LISTENER, ApplicationRef, TransferState, makeStateKey, ɵtruncateMiddle as _truncateMiddle, ɵformatRuntimeError as _formatRuntimeError } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import './xhr.mjs';

/**
 * `httpResource` makes a reactive HTTP request and exposes the request status and response value as
 * a `WritableResource`. By default, it assumes that the backend will return JSON data. To make a
 * request that expects a different kind of data, you can use a sub-constructor of `httpResource`,
 * such as `httpResource.text`.
 *
 * @experimental 19.2
 * @initializerApiFunction
 */
const httpResource = (() => {
    const jsonFn = makeHttpResourceFn('json');
    jsonFn.arrayBuffer = makeHttpResourceFn('arraybuffer');
    jsonFn.blob = makeHttpResourceFn('blob');
    jsonFn.text = makeHttpResourceFn('text');
    return jsonFn;
})();
function makeHttpResourceFn(responseType) {
    return function httpResource(request, options) {
        if (ngDevMode && !options?.injector) {
            assertInInjectionContext(httpResource);
        }
        const injector = options?.injector ?? inject(Injector);
        return new HttpResourceImpl(injector, () => normalizeRequest(request, responseType), options?.defaultValue, options?.parse, options?.equal);
    };
}
function normalizeRequest(request, responseType) {
    let unwrappedRequest = typeof request === 'function' ? request() : request;
    if (unwrappedRequest === undefined) {
        return undefined;
    }
    else if (typeof unwrappedRequest === 'string') {
        unwrappedRequest = { url: unwrappedRequest };
    }
    const headers = unwrappedRequest.headers instanceof HttpHeaders
        ? unwrappedRequest.headers
        : new HttpHeaders(unwrappedRequest.headers);
    const params = unwrappedRequest.params instanceof HttpParams
        ? unwrappedRequest.params
        : new HttpParams({ fromObject: unwrappedRequest.params });
    return new HttpRequest(unwrappedRequest.method ?? 'GET', unwrappedRequest.url, unwrappedRequest.body ?? null, {
        headers,
        params,
        reportProgress: unwrappedRequest.reportProgress,
        withCredentials: unwrappedRequest.withCredentials,
        keepalive: unwrappedRequest.keepalive,
        cache: unwrappedRequest.cache,
        priority: unwrappedRequest.priority,
        mode: unwrappedRequest.mode,
        redirect: unwrappedRequest.redirect,
        responseType,
        context: unwrappedRequest.context,
        transferCache: unwrappedRequest.transferCache,
        credentials: unwrappedRequest.credentials,
        referrer: unwrappedRequest.referrer,
        integrity: unwrappedRequest.integrity,
        timeout: unwrappedRequest.timeout,
    });
}
class HttpResourceImpl extends _ResourceImpl {
    client;
    _headers = linkedSignal(...(ngDevMode ? [{ debugName: "_headers", source: this.extRequest,
            computation: () => undefined }] : [{
            source: this.extRequest,
            computation: () => undefined,
        }]));
    _progress = linkedSignal(...(ngDevMode ? [{ debugName: "_progress", source: this.extRequest,
            computation: () => undefined }] : [{
            source: this.extRequest,
            computation: () => undefined,
        }]));
    _statusCode = linkedSignal(...(ngDevMode ? [{ debugName: "_statusCode", source: this.extRequest,
            computation: () => undefined }] : [{
            source: this.extRequest,
            computation: () => undefined,
        }]));
    headers = computed(() => this.status() === 'resolved' || this.status() === 'error' ? this._headers() : undefined, ...(ngDevMode ? [{ debugName: "headers" }] : []));
    progress = this._progress.asReadonly();
    statusCode = this._statusCode.asReadonly();
    constructor(injector, request, defaultValue, parse, equal) {
        super(request, ({ params: request, abortSignal }) => {
            let sub;
            // Track the abort listener so it can be removed if the Observable completes (as a memory
            // optimization).
            const onAbort = () => sub.unsubscribe();
            abortSignal.addEventListener('abort', onAbort);
            // Start off stream as undefined.
            const stream = signal({ value: undefined }, ...(ngDevMode ? [{ debugName: "stream" }] : []));
            let resolve;
            const promise = new Promise((r) => (resolve = r));
            const send = (value) => {
                stream.set(value);
                resolve?.(stream);
                resolve = undefined;
            };
            sub = this.client.request(request).subscribe({
                next: (event) => {
                    switch (event.type) {
                        case HttpEventType.Response:
                            this._headers.set(event.headers);
                            this._statusCode.set(event.status);
                            try {
                                send({ value: parse ? parse(event.body) : event.body });
                            }
                            catch (error) {
                                send({ error: _encapsulateResourceError(error) });
                            }
                            break;
                        case HttpEventType.DownloadProgress:
                            this._progress.set(event);
                            break;
                    }
                },
                error: (error) => {
                    if (error instanceof HttpErrorResponse) {
                        this._headers.set(error.headers);
                        this._statusCode.set(error.status);
                    }
                    send({ error });
                    abortSignal.removeEventListener('abort', onAbort);
                },
                complete: () => {
                    if (resolve) {
                        send({
                            error: new _RuntimeError(991 /* ɵRuntimeErrorCode.RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE */, ngDevMode && 'Resource completed before producing a value'),
                        });
                    }
                    abortSignal.removeEventListener('abort', onAbort);
                },
            });
            return promise;
        }, defaultValue, equal, injector);
        this.client = injector.get(HttpClient);
    }
    set(value) {
        super.set(value);
        this._headers.set(undefined);
        this._progress.set(undefined);
        this._statusCode.set(undefined);
    }
}

/**
 * If your application uses different HTTP origins to make API calls (via `HttpClient`) on the server and
 * on the client, the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token allows you to establish a mapping
 * between those origins, so that `HttpTransferCache` feature can recognize those requests as the same
 * ones and reuse the data cached on the server during hydration on the client.
 *
 * **Important note**: the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token should *only* be provided in
 * the *server* code of your application (typically in the `app.server.config.ts` script). Angular throws an
 * error if it detects that the token is defined while running on the client.
 *
 * @usageNotes
 *
 * When the same API endpoint is accessed via `http://internal-domain.com:8080` on the server and
 * via `https://external-domain.com` on the client, you can use the following configuration:
 * ```ts
 * // in app.server.config.ts
 * {
 *     provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
 *     useValue: {
 *         'http://internal-domain.com:8080': 'https://external-domain.com'
 *     }
 * }
 * ```
 *
 * @publicApi
 */
const HTTP_TRANSFER_CACHE_ORIGIN_MAP = new InjectionToken(ngDevMode ? 'HTTP_TRANSFER_CACHE_ORIGIN_MAP' : '');
/**
 * Keys within cached response data structure.
 */
const BODY = 'b';
const HEADERS = 'h';
const STATUS = 's';
const STATUS_TEXT = 'st';
const REQ_URL = 'u';
const RESPONSE_TYPE = 'rt';
const CACHE_OPTIONS = new InjectionToken(ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '');
/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];
function transferCacheInterceptorFn(req, next) {
    const { isCacheActive, ...globalOptions } = inject(CACHE_OPTIONS);
    const { transferCache: requestOptions, method: requestMethod } = req;
    // In the following situations we do not want to cache the request
    if (!isCacheActive ||
        requestOptions === false ||
        // Do not cache requests sent with credentials.
        hasOutgoingCredentials(req) ||
        // POST requests are allowed either globally or at request level
        (requestMethod === 'POST' && !globalOptions.includePostRequests && !requestOptions) ||
        (requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod)) ||
        // Do not cache requests with authentication or cookie headers unless explicitly enabled.
        (!globalOptions.includeRequestsWithAuthHeaders && hasAuthHeaders(req)) ||
        // Do not cache requests that explicitly forbid caching via Cache-Control
        // or Fetch API cache mode.
        hasUncacheableCacheControl(req.headers) ||
        isNonCacheableRequest(req.cache) ||
        globalOptions.filter?.(req) === false) {
        return next(req);
    }
    const transferState = inject(TransferState);
    const originMap = inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP, {
        optional: true,
    });
    if (typeof ngServerMode !== 'undefined' && !ngServerMode && originMap) {
        throw new _RuntimeError(2803 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_USED_IN_CLIENT */, ngDevMode &&
            'Angular detected that the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token is configured and ' +
                'present in the client side code. Please ensure that this token is only provided in the ' +
                'server code of the application.');
    }
    const requestUrl = typeof ngServerMode !== 'undefined' && ngServerMode && originMap
        ? mapRequestOriginUrl(req.url, originMap)
        : req.url;
    const storeKey = makeCacheKey(req, requestUrl);
    const response = transferState.get(storeKey, null);
    let headersToInclude = globalOptions.includeHeaders;
    if (typeof requestOptions === 'object' && requestOptions.includeHeaders) {
        // Request-specific config takes precedence over the global config.
        headersToInclude = requestOptions.includeHeaders;
    }
    if (response) {
        const { [BODY]: undecodedBody, [RESPONSE_TYPE]: responseType, [HEADERS]: httpHeaders, [STATUS]: status, [STATUS_TEXT]: statusText, [REQ_URL]: url, } = response;
        // Request found in cache. Respond using it.
        let body = undecodedBody;
        switch (responseType) {
            case 'arraybuffer':
                body = new TextEncoder().encode(undecodedBody).buffer;
                break;
            case 'blob':
                body = new Blob([undecodedBody]);
                break;
        }
        // We want to warn users accessing a header provided from the cache
        // That HttpTransferCache alters the headers
        // The warning will be logged a single time by HttpHeaders instance
        let headers = new HttpHeaders(httpHeaders);
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // Append extra logic in dev mode to produce a warning when a header
            // that was not transferred to the client is accessed in the code via `get`
            // and `has` calls.
            headers = appendMissingHeadersDetection(req.url, headers, headersToInclude ?? []);
        }
        return of(new HttpResponse({
            body,
            headers,
            status,
            statusText,
            url,
        }));
    }
    const event$ = next(req);
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
        // Request not found in cache. Make the request and cache it if on the server.
        return event$.pipe(tap((event) => {
            // Only cache successful HTTP responses that do not have Cache-Control
            // directives that forbid shared caching (no-store or private).
            if (event instanceof HttpResponse && !hasUncacheableCacheControl(event.headers)) {
                transferState.set(storeKey, {
                    [BODY]: event.body,
                    [HEADERS]: getFilteredHeaders(event.headers, headersToInclude),
                    [STATUS]: event.status,
                    [STATUS_TEXT]: event.statusText,
                    [REQ_URL]: requestUrl,
                    [RESPONSE_TYPE]: req.responseType,
                });
            }
        }));
    }
    return event$;
}
/** @returns true when the request contains authentication or cookie headers. */
function hasAuthHeaders(req) {
    return (req.headers.has('authorization') ||
        req.headers.has('proxy-authorization') ||
        req.headers.has('cookie'));
}
const UNCACHEABLE_CACHE_CONTROL_DIRECTIVES = new Set(['no-store', 'private', 'no-cache']);
function hasUncacheableCacheControl(headers) {
    const cacheControl = headers.get('cache-control');
    if (!cacheControl) {
        return false;
    }
    return cacheControl.split(',').some((directive) => {
        const directiveName = directive.split('=', 1)[0].trim().toLowerCase();
        return UNCACHEABLE_CACHE_CONTROL_DIRECTIVES.has(directiveName);
    });
}
function isNonCacheableRequest(cache) {
    return cache === 'no-cache' || cache === 'no-store';
}
function hasOutgoingCredentials(req) {
    return req.withCredentials || req.credentials === 'include' || req.credentials === 'same-origin';
}
function getFilteredHeaders(headers, includeHeaders) {
    if (!includeHeaders) {
        return {};
    }
    const headersMap = {};
    for (const key of includeHeaders) {
        const values = headers.getAll(key);
        if (values !== null) {
            headersMap[key] = values;
        }
    }
    return headersMap;
}
function sortAndConcatParams(params) {
    return [...params.keys()]
        .sort()
        .map((k) => `${k}=${params.getAll(k)}`)
        .join('&');
}
function makeCacheKey(request, mappedRequestUrl) {
    // make the params encoded same as a url so it's easy to identify
    const { params, method, responseType } = request;
    const encodedParams = sortAndConcatParams(params);
    let serializedBody = request.serializeBody();
    if (serializedBody instanceof URLSearchParams) {
        serializedBody = sortAndConcatParams(serializedBody);
    }
    else if (typeof serializedBody !== 'string') {
        serializedBody = '';
    }
    const key = [method, responseType, mappedRequestUrl, serializedBody, encodedParams].join('|');
    const hash = generateHash(key);
    return makeStateKey(hash);
}
/**
 * SHA-256 Constants (first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311):
 */
const SHA256_ROUND_CONSTANTS = /* @__PURE__ */ new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);
let textEncoder;
/**
 * Generates a SHA-256 hash representation of a string.
 *
 * Note: A custom synchronous SHA-256 implementation is used here because the Web Crypto API
 * (`crypto.subtle.digest`) is strictly asynchronous (Promise-based), whereas the transfer cache
 * state lookup and interceptor flow must operate synchronously due to the HttpResource API.
 *
 * The previous DJB2 hashing logic was vulnerable to pre-image and second-preimage attacks due to
 * its small 64-bit keyspace and mathematical simplicity. An attacker could craft colliding request
 * inputs to poison the cache, potentially causing a CDN or the application to serve the wrong
 * cached response to legitimate users. SHA-256 provides strong cryptographic collision resistance,
 * preventing cache key collision attacks.
 */
function generateHash(value) {
    textEncoder ??= new TextEncoder();
    const inputBytes = textEncoder.encode(value);
    // Initial hash values (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
    let hashState0 = 0x6a09e667;
    let hashState1 = 0xbb67ae85;
    let hashState2 = 0x3c6ef372;
    let hashState3 = 0xa54ff53a;
    let hashState4 = 0x510e527f;
    let hashState5 = 0x9b05688c;
    let hashState6 = 0x1f83d9ab;
    let hashState7 = 0x5be0cd19;
    // Pre-processing (Padding):
    const messageLengthInBits = inputBytes.length * 8;
    // The total length of the padded message must be a multiple of 64 bytes (512 bits)
    const paddedLengthInBytes = (((inputBytes.length + 8) >> 6) + 1) << 6;
    const paddedBytes = new Uint8Array(paddedLengthInBytes);
    paddedBytes.set(inputBytes);
    paddedBytes[inputBytes.length] = 0x80; // Append a single '1' bit (0x80 byte)
    const paddedBytesView = new DataView(paddedBytes.buffer);
    const lowBits = messageLengthInBits >>> 0;
    const highBits = (messageLengthInBits / 0x100000000) >>> 0;
    paddedBytesView.setUint32(paddedLengthInBytes - 8, highBits, false);
    paddedBytesView.setUint32(paddedLengthInBytes - 4, lowBits, false);
    // Process the message in successive 64-byte chunks:
    const messageSchedule = new Uint32Array(64);
    for (let chunkOffset = 0; chunkOffset < paddedLengthInBytes; chunkOffset += 64) {
        // Initialize first 16 words of the message schedule:
        for (let i = 0; i < 16; i++) {
            messageSchedule[i] = paddedBytesView.getUint32(chunkOffset + i * 4, false);
        }
        // Extend to 64 words:
        for (let i = 16; i < 64; i++) {
            const prevWord15 = messageSchedule[i - 15];
            const sigma0 = (((prevWord15 >>> 7) | (prevWord15 << 25)) ^
                ((prevWord15 >>> 18) | (prevWord15 << 14)) ^
                (prevWord15 >>> 3)) >>>
                0;
            const prevWord2 = messageSchedule[i - 2];
            const sigma1 = (((prevWord2 >>> 17) | (prevWord2 << 15)) ^
                ((prevWord2 >>> 19) | (prevWord2 << 13)) ^
                (prevWord2 >>> 10)) >>>
                0;
            messageSchedule[i] =
                (messageSchedule[i - 16] + sigma0 + messageSchedule[i - 7] + sigma1) >>> 0;
        }
        // Initialize working variables to current hash values:
        let workingStateA = hashState0;
        let workingStateB = hashState1;
        let workingStateC = hashState2;
        let workingStateD = hashState3;
        let workingStateE = hashState4;
        let workingStateF = hashState5;
        let workingStateG = hashState6;
        let workingStateH = hashState7;
        // Compression function main loop:
        for (let i = 0; i < 64; i++) {
            const capitalSigma1 = (((workingStateE >>> 6) | (workingStateE << 26)) ^
                ((workingStateE >>> 11) | (workingStateE << 21)) ^
                ((workingStateE >>> 25) | (workingStateE << 7))) >>>
                0;
            const chFunction = ((workingStateE & workingStateF) ^ (~workingStateE & workingStateG)) >>> 0;
            const temp1 = (workingStateH +
                capitalSigma1 +
                chFunction +
                SHA256_ROUND_CONSTANTS[i] +
                messageSchedule[i]) >>>
                0;
            const capitalSigma0 = (((workingStateA >>> 2) | (workingStateA << 30)) ^
                ((workingStateA >>> 13) | (workingStateA << 19)) ^
                ((workingStateA >>> 22) | (workingStateA << 10))) >>>
                0;
            const majFunction = ((workingStateA & workingStateB) ^
                (workingStateA & workingStateC) ^
                (workingStateB & workingStateC)) >>>
                0;
            const temp2 = (capitalSigma0 + majFunction) >>> 0;
            workingStateH = workingStateG;
            workingStateG = workingStateF;
            workingStateF = workingStateE;
            workingStateE = (workingStateD + temp1) >>> 0;
            workingStateD = workingStateC;
            workingStateC = workingStateB;
            workingStateB = workingStateA;
            workingStateA = (temp1 + temp2) >>> 0;
        }
        // Update intermediate hash state:
        hashState0 = (hashState0 + workingStateA) >>> 0;
        hashState1 = (hashState1 + workingStateB) >>> 0;
        hashState2 = (hashState2 + workingStateC) >>> 0;
        hashState3 = (hashState3 + workingStateD) >>> 0;
        hashState4 = (hashState4 + workingStateE) >>> 0;
        hashState5 = (hashState5 + workingStateF) >>> 0;
        hashState6 = (hashState6 + workingStateG) >>> 0;
        hashState7 = (hashState7 + workingStateH) >>> 0;
    }
    // Produce the final 64-character hexadecimal hash:
    return [
        hashState0,
        hashState1,
        hashState2,
        hashState3,
        hashState4,
        hashState5,
        hashState6,
        hashState7,
    ]
        .map((x) => x.toString(16).padStart(8, '0'))
        .join('');
}
/**
 * Returns the DI providers needed to enable HTTP transfer cache.
 *
 * By default, when using server rendering, requests are performed twice: once on the server and
 * other one on the browser.
 *
 * When these providers are added, requests performed on the server are cached and reused during the
 * bootstrapping of the application in the browser thus avoiding duplicate requests and reducing
 * load time.
 *
 * @see [Caching data when using HttpClient](guide/ssr#configuring-the-caching-options)
 *
 */
function withHttpTransferCache(cacheOptions) {
    return [
        {
            provide: CACHE_OPTIONS,
            useFactory: () => {
                _performanceMarkFeature('NgHttpTransferCache');
                return { isCacheActive: true, ...cacheOptions };
            },
        },
        {
            provide: HTTP_ROOT_INTERCEPTOR_FNS,
            useValue: transferCacheInterceptorFn,
            multi: true,
        },
        {
            provide: APP_BOOTSTRAP_LISTENER,
            multi: true,
            useFactory: () => {
                const appRef = inject(ApplicationRef);
                const cacheState = inject(CACHE_OPTIONS);
                return () => {
                    appRef.whenStable().then(() => {
                        cacheState.isCacheActive = false;
                    });
                };
            },
        },
    ];
}
/**
 * This function will add a proxy to an HttpHeader to intercept calls to get/has
 * and log a warning if the header entry requested has been removed
 */
function appendMissingHeadersDetection(url, headers, headersToInclude) {
    const warningProduced = new Set();
    return new Proxy(headers, {
        get(target, prop) {
            const value = Reflect.get(target, prop);
            const methods = new Set(['get', 'has', 'getAll']);
            if (typeof value !== 'function' || !methods.has(prop)) {
                return value;
            }
            return (headerName) => {
                // We log when the key has been removed and a warning hasn't been produced for the header
                const key = (prop + ':' + headerName).toLowerCase(); // e.g. `get:cache-control`
                if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
                    warningProduced.add(key);
                    const truncatedUrl = _truncateMiddle(url);
                    console.warn(_formatRuntimeError(-2802 /* RuntimeErrorCode.HEADERS_ALTERED_BY_TRANSFER_CACHE */, `Angular detected that the \`${headerName}\` header is accessed, but the value of the header ` +
                        `was not transferred from the server to the client by the HttpTransferCache. ` +
                        `To include the value of the \`${headerName}\` header for the \`${truncatedUrl}\` request, ` +
                        `use the \`includeHeaders\` list. The \`includeHeaders\` can be defined either ` +
                        `on a request level by adding the \`transferCache\` parameter, or on an application ` +
                        `level by adding the \`httpCacheTransfer.includeHeaders\` argument to the ` +
                        `\`provideClientHydration()\` call. `));
                }
                // invoking the original method
                return value.apply(target, [headerName]);
            };
        },
    });
}
function mapRequestOriginUrl(url, originMap) {
    const origin = new URL(url, 'resolve://').origin;
    const mappedOrigin = originMap[origin];
    if (!mappedOrigin) {
        return url;
    }
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        verifyMappedOrigin(mappedOrigin);
    }
    return url.replace(origin, mappedOrigin);
}
function verifyMappedOrigin(url) {
    if (new URL(url, 'resolve://').pathname !== '/') {
        throw new _RuntimeError(2804 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_CONTAINS_PATH */, 'Angular detected a URL with a path segment in the value provided for the ' +
            `\`HTTP_TRANSFER_CACHE_ORIGIN_MAP\` token: ${url}. The map should only contain origins ` +
            'without any other segments.');
    }
}

export { HTTP_TRANSFER_CACHE_ORIGIN_MAP, HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams, HttpRequest, HttpResponse, httpResource, HTTP_ROOT_INTERCEPTOR_FNS as ɵHTTP_ROOT_INTERCEPTOR_FNS, withHttpTransferCache as ɵwithHttpTransferCache };
//# sourceMappingURL=http.mjs.map
