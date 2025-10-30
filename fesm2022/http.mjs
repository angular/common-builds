/**
 * @license Angular v21.0.0-rc.0+sha-ca0e77b
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import { HttpHeaders, HttpParams, HttpRequest, HttpEventType, HttpErrorResponse, HttpClient, HTTP_ROOT_INTERCEPTOR_FNS, HttpResponse } from './_module-chunk.mjs';
export { FetchBackend, HTTP_INTERCEPTORS, HttpBackend, HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule, HttpContext, HttpContextToken, HttpFeatureKind, HttpHandler, HttpHeaderResponse, HttpResponseBase, HttpStatusCode, HttpUrlEncodingCodec, HttpXhrBackend, HttpXsrfTokenExtractor, JsonpClientBackend, JsonpInterceptor, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi, withJsonpSupport, withNoXsrfProtection, withRequestsMadeViaParent, withXsrfConfiguration, HttpInterceptorHandler as ɵHttpInterceptingHandler, REQUESTS_CONTRIBUTE_TO_STABILITY as ɵREQUESTS_CONTRIBUTE_TO_STABILITY } from './_module-chunk.mjs';
import { assertInInjectionContext, inject, Injector, ɵResourceImpl as _ResourceImpl, linkedSignal, computed, signal, ɵencapsulateResourceError as _encapsulateResourceError, ɵRuntimeError as _RuntimeError, InjectionToken, ɵperformanceMarkFeature as _performanceMarkFeature, APP_BOOTSTRAP_LISTENER, ApplicationRef, TransferState, makeStateKey, ɵtruncateMiddle as _truncateMiddle, ɵformatRuntimeError as _formatRuntimeError } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import './_xhr-chunk.mjs';

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
  } else if (typeof unwrappedRequest === 'string') {
    unwrappedRequest = {
      url: unwrappedRequest
    };
  }
  const headers = unwrappedRequest.headers instanceof HttpHeaders ? unwrappedRequest.headers : new HttpHeaders(unwrappedRequest.headers);
  const params = unwrappedRequest.params instanceof HttpParams ? unwrappedRequest.params : new HttpParams({
    fromObject: unwrappedRequest.params
  });
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
    referrerPolicy: unwrappedRequest.referrerPolicy,
    integrity: unwrappedRequest.integrity,
    timeout: unwrappedRequest.timeout
  });
}
class HttpResourceImpl extends _ResourceImpl {
  client;
  _headers = linkedSignal(...(ngDevMode ? [{
    debugName: "_headers",
    source: this.extRequest,
    computation: () => undefined
  }] : [{
    source: this.extRequest,
    computation: () => undefined
  }]));
  _progress = linkedSignal(...(ngDevMode ? [{
    debugName: "_progress",
    source: this.extRequest,
    computation: () => undefined
  }] : [{
    source: this.extRequest,
    computation: () => undefined
  }]));
  _statusCode = linkedSignal(...(ngDevMode ? [{
    debugName: "_statusCode",
    source: this.extRequest,
    computation: () => undefined
  }] : [{
    source: this.extRequest,
    computation: () => undefined
  }]));
  headers = computed(() => this.status() === 'resolved' || this.status() === 'error' ? this._headers() : undefined, ...(ngDevMode ? [{
    debugName: "headers"
  }] : []));
  progress = this._progress.asReadonly();
  statusCode = this._statusCode.asReadonly();
  constructor(injector, request, defaultValue, parse, equal) {
    super(request, ({
      params: request,
      abortSignal
    }) => {
      let sub;
      const onAbort = () => sub.unsubscribe();
      abortSignal.addEventListener('abort', onAbort);
      const stream = signal({
        value: undefined
      }, ...(ngDevMode ? [{
        debugName: "stream"
      }] : []));
      let resolve;
      const promise = new Promise(r => resolve = r);
      const send = value => {
        stream.set(value);
        resolve?.(stream);
        resolve = undefined;
      };
      sub = this.client.request(request).subscribe({
        next: event => {
          switch (event.type) {
            case HttpEventType.Response:
              this._headers.set(event.headers);
              this._statusCode.set(event.status);
              try {
                send({
                  value: parse ? parse(event.body) : event.body
                });
              } catch (error) {
                send({
                  error: _encapsulateResourceError(error)
                });
              }
              break;
            case HttpEventType.DownloadProgress:
              this._progress.set(event);
              break;
          }
        },
        error: error => {
          if (error instanceof HttpErrorResponse) {
            this._headers.set(error.headers);
            this._statusCode.set(error.status);
          }
          send({
            error
          });
          abortSignal.removeEventListener('abort', onAbort);
        },
        complete: () => {
          if (resolve) {
            send({
              error: new _RuntimeError(991, ngDevMode && 'Resource completed before producing a value')
            });
          }
          abortSignal.removeEventListener('abort', onAbort);
        }
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

const HTTP_TRANSFER_CACHE_ORIGIN_MAP = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'HTTP_TRANSFER_CACHE_ORIGIN_MAP' : '');
const BODY = 'b';
const HEADERS = 'h';
const STATUS = 's';
const STATUS_TEXT = 'st';
const REQ_URL = 'u';
const RESPONSE_TYPE = 'rt';
const CACHE_OPTIONS = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '');
const ALLOWED_METHODS = ['GET', 'HEAD'];
function transferCacheInterceptorFn(req, next) {
  const {
    isCacheActive,
    ...globalOptions
  } = inject(CACHE_OPTIONS);
  const {
    transferCache: requestOptions,
    method: requestMethod
  } = req;
  if (!isCacheActive || requestOptions === false || requestMethod === 'POST' && !globalOptions.includePostRequests && !requestOptions || requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod) || !globalOptions.includeRequestsWithAuthHeaders && hasAuthHeaders(req) || globalOptions.filter?.(req) === false) {
    return next(req);
  }
  const transferState = inject(TransferState);
  const originMap = inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP, {
    optional: true
  });
  if (typeof ngServerMode !== 'undefined' && !ngServerMode && originMap) {
    throw new _RuntimeError(2803, ngDevMode && 'Angular detected that the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token is configured and ' + 'present in the client side code. Please ensure that this token is only provided in the ' + 'server code of the application.');
  }
  const requestUrl = typeof ngServerMode !== 'undefined' && ngServerMode && originMap ? mapRequestOriginUrl(req.url, originMap) : req.url;
  const storeKey = makeCacheKey(req, requestUrl);
  const response = transferState.get(storeKey, null);
  let headersToInclude = globalOptions.includeHeaders;
  if (typeof requestOptions === 'object' && requestOptions.includeHeaders) {
    headersToInclude = requestOptions.includeHeaders;
  }
  if (response) {
    const {
      [BODY]: undecodedBody,
      [RESPONSE_TYPE]: responseType,
      [HEADERS]: httpHeaders,
      [STATUS]: status,
      [STATUS_TEXT]: statusText,
      [REQ_URL]: url
    } = response;
    let body = undecodedBody;
    switch (responseType) {
      case 'arraybuffer':
        body = new TextEncoder().encode(undecodedBody).buffer;
        break;
      case 'blob':
        body = new Blob([undecodedBody]);
        break;
    }
    let headers = new HttpHeaders(httpHeaders);
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      headers = appendMissingHeadersDetection(req.url, headers, headersToInclude ?? []);
    }
    return of(new HttpResponse({
      body,
      headers,
      status,
      statusText,
      url
    }));
  }
  const event$ = next(req);
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return event$.pipe(tap(event => {
      if (event instanceof HttpResponse) {
        transferState.set(storeKey, {
          [BODY]: event.body,
          [HEADERS]: getFilteredHeaders(event.headers, headersToInclude),
          [STATUS]: event.status,
          [STATUS_TEXT]: event.statusText,
          [REQ_URL]: requestUrl,
          [RESPONSE_TYPE]: req.responseType
        });
      }
    }));
  }
  return event$;
}
function hasAuthHeaders(req) {
  return req.headers.has('authorization') || req.headers.has('proxy-authorization');
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
  return [...params.keys()].sort().map(k => `${k}=${params.getAll(k)}`).join('&');
}
function makeCacheKey(request, mappedRequestUrl) {
  const {
    params,
    method,
    responseType
  } = request;
  const encodedParams = sortAndConcatParams(params);
  let serializedBody = request.serializeBody();
  if (serializedBody instanceof URLSearchParams) {
    serializedBody = sortAndConcatParams(serializedBody);
  } else if (typeof serializedBody !== 'string') {
    serializedBody = '';
  }
  const key = [method, responseType, mappedRequestUrl, serializedBody, encodedParams].join('|');
  const hash = generateHash(key);
  return makeStateKey(hash);
}
function generateHash(value) {
  let hash = 0;
  for (const char of value) {
    hash = Math.imul(31, hash) + char.charCodeAt(0) << 0;
  }
  hash += 2147483647 + 1;
  return hash.toString();
}
function withHttpTransferCache(cacheOptions) {
  return [{
    provide: CACHE_OPTIONS,
    useFactory: () => {
      _performanceMarkFeature('NgHttpTransferCache');
      return {
        isCacheActive: true,
        ...cacheOptions
      };
    }
  }, {
    provide: HTTP_ROOT_INTERCEPTOR_FNS,
    useValue: transferCacheInterceptorFn,
    multi: true
  }, {
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
    }
  }];
}
function appendMissingHeadersDetection(url, headers, headersToInclude) {
  const warningProduced = new Set();
  return new Proxy(headers, {
    get(target, prop) {
      const value = Reflect.get(target, prop);
      const methods = new Set(['get', 'has', 'getAll']);
      if (typeof value !== 'function' || !methods.has(prop)) {
        return value;
      }
      return headerName => {
        const key = (prop + ':' + headerName).toLowerCase();
        if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
          warningProduced.add(key);
          const truncatedUrl = _truncateMiddle(url);
          console.warn(_formatRuntimeError(-2802, `Angular detected that the \`${headerName}\` header is accessed, but the value of the header ` + `was not transferred from the server to the client by the HttpTransferCache. ` + `To include the value of the \`${headerName}\` header for the \`${truncatedUrl}\` request, ` + `use the \`includeHeaders\` list. The \`includeHeaders\` can be defined either ` + `on a request level by adding the \`transferCache\` parameter, or on an application ` + `level by adding the \`httpCacheTransfer.includeHeaders\` argument to the ` + `\`provideClientHydration()\` call. `));
        }
        return value.apply(target, [headerName]);
      };
    }
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
    throw new _RuntimeError(2804, 'Angular detected a URL with a path segment in the value provided for the ' + `\`HTTP_TRANSFER_CACHE_ORIGIN_MAP\` token: ${url}. The map should only contain origins ` + 'without any other segments.');
  }
}

export { HTTP_TRANSFER_CACHE_ORIGIN_MAP, HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams, HttpRequest, HttpResponse, httpResource, HTTP_ROOT_INTERCEPTOR_FNS as ɵHTTP_ROOT_INTERCEPTOR_FNS, withHttpTransferCache as ɵwithHttpTransferCache };
//# sourceMappingURL=http.mjs.map
