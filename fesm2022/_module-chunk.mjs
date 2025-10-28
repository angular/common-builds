/**
 * @license Angular v21.1.0-next.0+sha-5a93eeb
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { ɵRuntimeError as _RuntimeError, InjectionToken, inject, NgZone, DestroyRef, Injectable, ɵformatRuntimeError as _formatRuntimeError, ɵTracingService as _TracingService, runInInjectionContext, PendingTasks, ɵConsole as _Console, DOCUMENT, Inject, makeEnvironmentProviders, NgModule } from '@angular/core';
import { switchMap, finalize, concatMap, filter, map } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
import { XhrFactory, parseCookieValue } from './_xhr-chunk.mjs';

class HttpHeaders {
  headers;
  normalizedNames = new Map();
  lazyInit;
  lazyUpdate = null;
  constructor(headers) {
    if (!headers) {
      this.headers = new Map();
    } else if (typeof headers === 'string') {
      this.lazyInit = () => {
        this.headers = new Map();
        headers.split('\n').forEach(line => {
          const index = line.indexOf(':');
          if (index > 0) {
            const name = line.slice(0, index);
            const value = line.slice(index + 1).trim();
            this.addHeaderEntry(name, value);
          }
        });
      };
    } else if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      this.headers = new Map();
      headers.forEach((value, name) => {
        this.addHeaderEntry(name, value);
      });
    } else {
      this.lazyInit = () => {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          assertValidHeaders(headers);
        }
        this.headers = new Map();
        Object.entries(headers).forEach(([name, values]) => {
          this.setHeaderEntries(name, values);
        });
      };
    }
  }
  has(name) {
    this.init();
    return this.headers.has(name.toLowerCase());
  }
  get(name) {
    this.init();
    const values = this.headers.get(name.toLowerCase());
    return values && values.length > 0 ? values[0] : null;
  }
  keys() {
    this.init();
    return Array.from(this.normalizedNames.values());
  }
  getAll(name) {
    this.init();
    return this.headers.get(name.toLowerCase()) || null;
  }
  append(name, value) {
    return this.clone({
      name,
      value,
      op: 'a'
    });
  }
  set(name, value) {
    return this.clone({
      name,
      value,
      op: 's'
    });
  }
  delete(name, value) {
    return this.clone({
      name,
      value,
      op: 'd'
    });
  }
  maybeSetNormalizedName(name, lcName) {
    if (!this.normalizedNames.has(lcName)) {
      this.normalizedNames.set(lcName, name);
    }
  }
  init() {
    if (!!this.lazyInit) {
      if (this.lazyInit instanceof HttpHeaders) {
        this.copyFrom(this.lazyInit);
      } else {
        this.lazyInit();
      }
      this.lazyInit = null;
      if (!!this.lazyUpdate) {
        this.lazyUpdate.forEach(update => this.applyUpdate(update));
        this.lazyUpdate = null;
      }
    }
  }
  copyFrom(other) {
    other.init();
    Array.from(other.headers.keys()).forEach(key => {
      this.headers.set(key, other.headers.get(key));
      this.normalizedNames.set(key, other.normalizedNames.get(key));
    });
  }
  clone(update) {
    const clone = new HttpHeaders();
    clone.lazyInit = !!this.lazyInit && this.lazyInit instanceof HttpHeaders ? this.lazyInit : this;
    clone.lazyUpdate = (this.lazyUpdate || []).concat([update]);
    return clone;
  }
  applyUpdate(update) {
    const key = update.name.toLowerCase();
    switch (update.op) {
      case 'a':
      case 's':
        let value = update.value;
        if (typeof value === 'string') {
          value = [value];
        }
        if (value.length === 0) {
          return;
        }
        this.maybeSetNormalizedName(update.name, key);
        const base = (update.op === 'a' ? this.headers.get(key) : undefined) || [];
        base.push(...value);
        this.headers.set(key, base);
        break;
      case 'd':
        const toDelete = update.value;
        if (!toDelete) {
          this.headers.delete(key);
          this.normalizedNames.delete(key);
        } else {
          let existing = this.headers.get(key);
          if (!existing) {
            return;
          }
          existing = existing.filter(value => toDelete.indexOf(value) === -1);
          if (existing.length === 0) {
            this.headers.delete(key);
            this.normalizedNames.delete(key);
          } else {
            this.headers.set(key, existing);
          }
        }
        break;
    }
  }
  addHeaderEntry(name, value) {
    const key = name.toLowerCase();
    this.maybeSetNormalizedName(name, key);
    if (this.headers.has(key)) {
      this.headers.get(key).push(value);
    } else {
      this.headers.set(key, [value]);
    }
  }
  setHeaderEntries(name, values) {
    const headerValues = (Array.isArray(values) ? values : [values]).map(value => value.toString());
    const key = name.toLowerCase();
    this.headers.set(key, headerValues);
    this.maybeSetNormalizedName(name, key);
  }
  forEach(fn) {
    this.init();
    Array.from(this.normalizedNames.keys()).forEach(key => fn(this.normalizedNames.get(key), this.headers.get(key)));
  }
}
function assertValidHeaders(headers) {
  for (const [key, value] of Object.entries(headers)) {
    if (!(typeof value === 'string' || typeof value === 'number') && !Array.isArray(value)) {
      throw new Error(`Unexpected value of the \`${key}\` header provided. ` + `Expecting either a string, a number or an array, but got: \`${value}\`.`);
    }
  }
}

class HttpContextToken {
  defaultValue;
  constructor(defaultValue) {
    this.defaultValue = defaultValue;
  }
}
class HttpContext {
  map = new Map();
  set(token, value) {
    this.map.set(token, value);
    return this;
  }
  get(token) {
    if (!this.map.has(token)) {
      this.map.set(token, token.defaultValue());
    }
    return this.map.get(token);
  }
  delete(token) {
    this.map.delete(token);
    return this;
  }
  has(token) {
    return this.map.has(token);
  }
  keys() {
    return this.map.keys();
  }
}

class HttpUrlEncodingCodec {
  encodeKey(key) {
    return standardEncoding(key);
  }
  encodeValue(value) {
    return standardEncoding(value);
  }
  decodeKey(key) {
    return decodeURIComponent(key);
  }
  decodeValue(value) {
    return decodeURIComponent(value);
  }
}
function paramParser(rawParams, codec) {
  const map = new Map();
  if (rawParams.length > 0) {
    const params = rawParams.replace(/^\?/, '').split('&');
    params.forEach(param => {
      const eqIdx = param.indexOf('=');
      const [key, val] = eqIdx == -1 ? [codec.decodeKey(param), ''] : [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))];
      const list = map.get(key) || [];
      list.push(val);
      map.set(key, list);
    });
  }
  return map;
}
const STANDARD_ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const STANDARD_ENCODING_REPLACEMENTS = {
  '40': '@',
  '3A': ':',
  '24': '$',
  '2C': ',',
  '3B': ';',
  '3D': '=',
  '3F': '?',
  '2F': '/'
};
function standardEncoding(v) {
  return encodeURIComponent(v).replace(STANDARD_ENCODING_REGEX, (s, t) => STANDARD_ENCODING_REPLACEMENTS[t] ?? s);
}
function valueToString(value) {
  return `${value}`;
}
class HttpParams {
  map;
  encoder;
  updates = null;
  cloneFrom = null;
  constructor(options = {}) {
    this.encoder = options.encoder || new HttpUrlEncodingCodec();
    if (options.fromString) {
      if (options.fromObject) {
        throw new _RuntimeError(2805, ngDevMode && 'Cannot specify both fromString and fromObject.');
      }
      this.map = paramParser(options.fromString, this.encoder);
    } else if (!!options.fromObject) {
      this.map = new Map();
      Object.keys(options.fromObject).forEach(key => {
        const value = options.fromObject[key];
        const values = Array.isArray(value) ? value.map(valueToString) : [valueToString(value)];
        this.map.set(key, values);
      });
    } else {
      this.map = null;
    }
  }
  has(param) {
    this.init();
    return this.map.has(param);
  }
  get(param) {
    this.init();
    const res = this.map.get(param);
    return !!res ? res[0] : null;
  }
  getAll(param) {
    this.init();
    return this.map.get(param) || null;
  }
  keys() {
    this.init();
    return Array.from(this.map.keys());
  }
  append(param, value) {
    return this.clone({
      param,
      value,
      op: 'a'
    });
  }
  appendAll(params) {
    const updates = [];
    Object.keys(params).forEach(param => {
      const value = params[param];
      if (Array.isArray(value)) {
        value.forEach(_value => {
          updates.push({
            param,
            value: _value,
            op: 'a'
          });
        });
      } else {
        updates.push({
          param,
          value: value,
          op: 'a'
        });
      }
    });
    return this.clone(updates);
  }
  set(param, value) {
    return this.clone({
      param,
      value,
      op: 's'
    });
  }
  delete(param, value) {
    return this.clone({
      param,
      value,
      op: 'd'
    });
  }
  toString() {
    this.init();
    return this.keys().map(key => {
      const eKey = this.encoder.encodeKey(key);
      return this.map.get(key).map(value => eKey + '=' + this.encoder.encodeValue(value)).join('&');
    }).filter(param => param !== '').join('&');
  }
  clone(update) {
    const clone = new HttpParams({
      encoder: this.encoder
    });
    clone.cloneFrom = this.cloneFrom || this;
    clone.updates = (this.updates || []).concat(update);
    return clone;
  }
  init() {
    if (this.map === null) {
      this.map = new Map();
    }
    if (this.cloneFrom !== null) {
      this.cloneFrom.init();
      this.cloneFrom.keys().forEach(key => this.map.set(key, this.cloneFrom.map.get(key)));
      this.updates.forEach(update => {
        switch (update.op) {
          case 'a':
          case 's':
            const base = (update.op === 'a' ? this.map.get(update.param) : undefined) || [];
            base.push(valueToString(update.value));
            this.map.set(update.param, base);
            break;
          case 'd':
            if (update.value !== undefined) {
              let base = this.map.get(update.param) || [];
              const idx = base.indexOf(valueToString(update.value));
              if (idx !== -1) {
                base.splice(idx, 1);
              }
              if (base.length > 0) {
                this.map.set(update.param, base);
              } else {
                this.map.delete(update.param);
              }
            } else {
              this.map.delete(update.param);
              break;
            }
        }
      });
      this.cloneFrom = this.updates = null;
    }
  }
}

function mightHaveBody(method) {
  switch (method) {
    case 'DELETE':
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
    case 'JSONP':
      return false;
    default:
      return true;
  }
}
function isArrayBuffer(value) {
  return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
}
function isBlob(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}
function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}
function isUrlSearchParams(value) {
  return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
}
const CONTENT_TYPE_HEADER = 'Content-Type';
const ACCEPT_HEADER = 'Accept';
const TEXT_CONTENT_TYPE = 'text/plain';
const JSON_CONTENT_TYPE = 'application/json';
const ACCEPT_HEADER_VALUE = `${JSON_CONTENT_TYPE}, ${TEXT_CONTENT_TYPE}, */*`;
class HttpRequest {
  url;
  body = null;
  headers;
  context;
  reportProgress = false;
  withCredentials = false;
  credentials;
  keepalive = false;
  cache;
  priority;
  mode;
  redirect;
  referrer;
  integrity;
  referrerPolicy;
  responseType = 'json';
  method;
  params;
  urlWithParams;
  transferCache;
  timeout;
  constructor(method, url, third, fourth) {
    this.url = url;
    this.method = method.toUpperCase();
    let options;
    if (mightHaveBody(this.method) || !!fourth) {
      this.body = third !== undefined ? third : null;
      options = fourth;
    } else {
      options = third;
    }
    if (options) {
      this.reportProgress = !!options.reportProgress;
      this.withCredentials = !!options.withCredentials;
      this.keepalive = !!options.keepalive;
      if (!!options.responseType) {
        this.responseType = options.responseType;
      }
      if (options.headers) {
        this.headers = options.headers;
      }
      if (options.context) {
        this.context = options.context;
      }
      if (options.params) {
        this.params = options.params;
      }
      if (options.priority) {
        this.priority = options.priority;
      }
      if (options.cache) {
        this.cache = options.cache;
      }
      if (options.credentials) {
        this.credentials = options.credentials;
      }
      if (typeof options.timeout === 'number') {
        if (options.timeout < 1 || !Number.isInteger(options.timeout)) {
          throw new _RuntimeError(2822, ngDevMode ? '`timeout` must be a positive integer value' : '');
        }
        this.timeout = options.timeout;
      }
      if (options.mode) {
        this.mode = options.mode;
      }
      if (options.redirect) {
        this.redirect = options.redirect;
      }
      if (options.integrity) {
        this.integrity = options.integrity;
      }
      if (options.referrer) {
        this.referrer = options.referrer;
      }
      if (options.referrerPolicy) {
        this.referrerPolicy = options.referrerPolicy;
      }
      this.transferCache = options.transferCache;
    }
    this.headers ??= new HttpHeaders();
    this.context ??= new HttpContext();
    if (!this.params) {
      this.params = new HttpParams();
      this.urlWithParams = url;
    } else {
      const params = this.params.toString();
      if (params.length === 0) {
        this.urlWithParams = url;
      } else {
        const qIdx = url.indexOf('?');
        const sep = qIdx === -1 ? '?' : qIdx < url.length - 1 ? '&' : '';
        this.urlWithParams = url + sep + params;
      }
    }
  }
  serializeBody() {
    if (this.body === null) {
      return null;
    }
    if (typeof this.body === 'string' || isArrayBuffer(this.body) || isBlob(this.body) || isFormData(this.body) || isUrlSearchParams(this.body)) {
      return this.body;
    }
    if (this.body instanceof HttpParams) {
      return this.body.toString();
    }
    if (typeof this.body === 'object' || typeof this.body === 'boolean' || Array.isArray(this.body)) {
      return JSON.stringify(this.body);
    }
    return this.body.toString();
  }
  detectContentTypeHeader() {
    if (this.body === null) {
      return null;
    }
    if (isFormData(this.body)) {
      return null;
    }
    if (isBlob(this.body)) {
      return this.body.type || null;
    }
    if (isArrayBuffer(this.body)) {
      return null;
    }
    if (typeof this.body === 'string') {
      return TEXT_CONTENT_TYPE;
    }
    if (this.body instanceof HttpParams) {
      return 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    if (typeof this.body === 'object' || typeof this.body === 'number' || typeof this.body === 'boolean') {
      return JSON_CONTENT_TYPE;
    }
    return null;
  }
  clone(update = {}) {
    const method = update.method || this.method;
    const url = update.url || this.url;
    const responseType = update.responseType || this.responseType;
    const keepalive = update.keepalive ?? this.keepalive;
    const priority = update.priority || this.priority;
    const cache = update.cache || this.cache;
    const mode = update.mode || this.mode;
    const redirect = update.redirect || this.redirect;
    const credentials = update.credentials || this.credentials;
    const referrer = update.referrer || this.referrer;
    const integrity = update.integrity || this.integrity;
    const referrerPolicy = update.referrerPolicy || this.referrerPolicy;
    const transferCache = update.transferCache ?? this.transferCache;
    const timeout = update.timeout ?? this.timeout;
    const body = update.body !== undefined ? update.body : this.body;
    const withCredentials = update.withCredentials ?? this.withCredentials;
    const reportProgress = update.reportProgress ?? this.reportProgress;
    let headers = update.headers || this.headers;
    let params = update.params || this.params;
    const context = update.context ?? this.context;
    if (update.setHeaders !== undefined) {
      headers = Object.keys(update.setHeaders).reduce((headers, name) => headers.set(name, update.setHeaders[name]), headers);
    }
    if (update.setParams) {
      params = Object.keys(update.setParams).reduce((params, param) => params.set(param, update.setParams[param]), params);
    }
    return new HttpRequest(method, url, body, {
      params,
      headers,
      context,
      reportProgress,
      responseType,
      withCredentials,
      transferCache,
      keepalive,
      cache,
      priority,
      timeout,
      mode,
      redirect,
      credentials,
      referrer,
      integrity,
      referrerPolicy
    });
  }
}

var HttpEventType;
(function (HttpEventType) {
  HttpEventType[HttpEventType["Sent"] = 0] = "Sent";
  HttpEventType[HttpEventType["UploadProgress"] = 1] = "UploadProgress";
  HttpEventType[HttpEventType["ResponseHeader"] = 2] = "ResponseHeader";
  HttpEventType[HttpEventType["DownloadProgress"] = 3] = "DownloadProgress";
  HttpEventType[HttpEventType["Response"] = 4] = "Response";
  HttpEventType[HttpEventType["User"] = 5] = "User";
})(HttpEventType || (HttpEventType = {}));
class HttpResponseBase {
  headers;
  status;
  statusText;
  url;
  ok;
  type;
  redirected;
  responseType;
  constructor(init, defaultStatus = 200, defaultStatusText = 'OK') {
    this.headers = init.headers || new HttpHeaders();
    this.status = init.status !== undefined ? init.status : defaultStatus;
    this.statusText = init.statusText || defaultStatusText;
    this.url = init.url || null;
    this.redirected = init.redirected;
    this.responseType = init.responseType;
    this.ok = this.status >= 200 && this.status < 300;
  }
}
class HttpHeaderResponse extends HttpResponseBase {
  constructor(init = {}) {
    super(init);
  }
  type = HttpEventType.ResponseHeader;
  clone(update = {}) {
    return new HttpHeaderResponse({
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined
    });
  }
}
class HttpResponse extends HttpResponseBase {
  body;
  constructor(init = {}) {
    super(init);
    this.body = init.body !== undefined ? init.body : null;
  }
  type = HttpEventType.Response;
  clone(update = {}) {
    return new HttpResponse({
      body: update.body !== undefined ? update.body : this.body,
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
      redirected: update.redirected ?? this.redirected,
      responseType: update.responseType ?? this.responseType
    });
  }
}
class HttpErrorResponse extends HttpResponseBase {
  name = 'HttpErrorResponse';
  message;
  error;
  ok = false;
  constructor(init) {
    super(init, 0, 'Unknown Error');
    if (this.status >= 200 && this.status < 300) {
      this.message = `Http failure during parsing for ${init.url || '(unknown url)'}`;
    } else {
      this.message = `Http failure response for ${init.url || '(unknown url)'}: ${init.status} ${init.statusText}`;
    }
    this.error = init.error || null;
  }
}
const HTTP_STATUS_CODE_OK = 200;
const HTTP_STATUS_CODE_NO_CONTENT = 204;
var HttpStatusCode;
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

const XSSI_PREFIX$1 = /^\)\]\}',?\n/;
const FETCH_BACKEND = new InjectionToken(typeof ngDevMode === 'undefined' || ngDevMode ? 'FETCH_BACKEND' : '');
class FetchBackend {
  fetchImpl = inject(FetchFactory, {
    optional: true
  })?.fetch ?? ((...args) => globalThis.fetch(...args));
  ngZone = inject(NgZone);
  destroyRef = inject(DestroyRef);
  destroyed = false;
  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }
  handle(request) {
    return new Observable(observer => {
      const aborter = new AbortController();
      this.doRequest(request, aborter.signal, observer).then(noop, error => observer.error(new HttpErrorResponse({
        error
      })));
      let timeoutId;
      if (request.timeout) {
        timeoutId = this.ngZone.runOutsideAngular(() => setTimeout(() => {
          if (!aborter.signal.aborted) {
            aborter.abort(new DOMException('signal timed out', 'TimeoutError'));
          }
        }, request.timeout));
      }
      return () => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        aborter.abort();
      };
    });
  }
  async doRequest(request, signal, observer) {
    const init = this.createRequestInit(request);
    let response;
    try {
      const fetchPromise = this.ngZone.runOutsideAngular(() => this.fetchImpl(request.urlWithParams, {
        signal,
        ...init
      }));
      silenceSuperfluousUnhandledPromiseRejection(fetchPromise);
      observer.next({
        type: HttpEventType.Sent
      });
      response = await fetchPromise;
    } catch (error) {
      observer.error(new HttpErrorResponse({
        error,
        status: error.status ?? 0,
        statusText: error.statusText,
        url: request.urlWithParams,
        headers: error.headers
      }));
      return;
    }
    const headers = new HttpHeaders(response.headers);
    const statusText = response.statusText;
    const url = response.url || request.urlWithParams;
    let status = response.status;
    let body = null;
    if (request.reportProgress) {
      observer.next(new HttpHeaderResponse({
        headers,
        status,
        statusText,
        url
      }));
    }
    if (response.body) {
      const contentLength = response.headers.get('content-length');
      const chunks = [];
      const reader = response.body.getReader();
      let receivedLength = 0;
      let decoder;
      let partialText;
      const reqZone = typeof Zone !== 'undefined' && Zone.current;
      let canceled = false;
      await this.ngZone.runOutsideAngular(async () => {
        while (true) {
          if (this.destroyed) {
            await reader.cancel();
            canceled = true;
            break;
          }
          const {
            done,
            value
          } = await reader.read();
          if (done) {
            break;
          }
          chunks.push(value);
          receivedLength += value.length;
          if (request.reportProgress) {
            partialText = request.responseType === 'text' ? (partialText ?? '') + (decoder ??= new TextDecoder()).decode(value, {
              stream: true
            }) : undefined;
            const reportProgress = () => observer.next({
              type: HttpEventType.DownloadProgress,
              total: contentLength ? +contentLength : undefined,
              loaded: receivedLength,
              partialText
            });
            reqZone ? reqZone.run(reportProgress) : reportProgress();
          }
        }
      });
      if (canceled) {
        observer.complete();
        return;
      }
      const chunksAll = this.concatChunks(chunks, receivedLength);
      try {
        const contentType = response.headers.get(CONTENT_TYPE_HEADER) ?? '';
        body = this.parseBody(request, chunksAll, contentType, status);
      } catch (error) {
        observer.error(new HttpErrorResponse({
          error,
          headers: new HttpHeaders(response.headers),
          status: response.status,
          statusText: response.statusText,
          url: response.url || request.urlWithParams
        }));
        return;
      }
    }
    if (status === 0) {
      status = body ? HTTP_STATUS_CODE_OK : 0;
    }
    const ok = status >= 200 && status < 300;
    const redirected = response.redirected;
    const responseType = response.type;
    if (ok) {
      observer.next(new HttpResponse({
        body,
        headers,
        status,
        statusText,
        url,
        redirected,
        responseType
      }));
      observer.complete();
    } else {
      observer.error(new HttpErrorResponse({
        error: body,
        headers,
        status,
        statusText,
        url,
        redirected,
        responseType
      }));
    }
  }
  parseBody(request, binContent, contentType, status) {
    switch (request.responseType) {
      case 'json':
        const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX$1, '');
        if (text === '') {
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          if (status < 200 || status >= 300) {
            return text;
          }
          throw e;
        }
      case 'text':
        return new TextDecoder().decode(binContent);
      case 'blob':
        return new Blob([binContent], {
          type: contentType
        });
      case 'arraybuffer':
        return binContent.buffer;
    }
  }
  createRequestInit(req) {
    const headers = {};
    let credentials;
    credentials = req.credentials;
    if (req.withCredentials) {
      (typeof ngDevMode === 'undefined' || ngDevMode) && warningOptionsMessage(req);
      credentials = 'include';
    }
    req.headers.forEach((name, values) => headers[name] = values.join(','));
    if (!req.headers.has(ACCEPT_HEADER)) {
      headers[ACCEPT_HEADER] = ACCEPT_HEADER_VALUE;
    }
    if (!req.headers.has(CONTENT_TYPE_HEADER)) {
      const detectedType = req.detectContentTypeHeader();
      if (detectedType !== null) {
        headers[CONTENT_TYPE_HEADER] = detectedType;
      }
    }
    return {
      body: req.serializeBody(),
      method: req.method,
      headers,
      credentials,
      keepalive: req.keepalive,
      cache: req.cache,
      priority: req.priority,
      mode: req.mode,
      redirect: req.redirect,
      referrer: req.referrer,
      integrity: req.integrity,
      referrerPolicy: req.referrerPolicy
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
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: FetchBackend,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: FetchBackend
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: FetchBackend,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => []
});
class FetchFactory {}
function noop() {}
function warningOptionsMessage(req) {
  if (req.credentials && req.withCredentials) {
    console.warn(_formatRuntimeError(2819, `Angular detected that a \`HttpClient\` request has both \`withCredentials: true\` and \`credentials: '${req.credentials}'\` options. The \`withCredentials\` option is overriding the explicit \`credentials\` setting to 'include'. Consider removing \`withCredentials\` and using \`credentials: '${req.credentials}'\` directly for clarity.`));
  }
}
function silenceSuperfluousUnhandledPromiseRejection(promise) {
  promise.then(noop, noop);
}

const XSSI_PREFIX = /^\)\]\}',?\n/;
function validateXhrCompatibility(req) {
  const unsupportedOptions = [{
    property: 'keepalive',
    errorCode: 2813
  }, {
    property: 'cache',
    errorCode: 2814
  }, {
    property: 'priority',
    errorCode: 2815
  }, {
    property: 'mode',
    errorCode: 2816
  }, {
    property: 'redirect',
    errorCode: 2817
  }, {
    property: 'credentials',
    errorCode: 2818
  }, {
    property: 'integrity',
    errorCode: 2820
  }, {
    property: 'referrer',
    errorCode: 2821
  }, {
    property: 'referrerPolicy',
    errorCode: 2823
  }];
  for (const {
    property,
    errorCode
  } of unsupportedOptions) {
    if (req[property]) {
      console.warn(_formatRuntimeError(errorCode, `Angular detected that a \`HttpClient\` request with the \`${property}\` option was sent using XHR, which does not support it. To use the \`${property}\` option, enable Fetch API support by passing \`withFetch()\` as an argument to \`provideHttpClient()\`.`));
    }
  }
}
class HttpXhrBackend {
  xhrFactory;
  tracingService = inject(_TracingService, {
    optional: true
  });
  constructor(xhrFactory) {
    this.xhrFactory = xhrFactory;
  }
  maybePropagateTrace(fn) {
    return this.tracingService?.propagate ? this.tracingService.propagate(fn) : fn;
  }
  handle(req) {
    if (req.method === 'JSONP') {
      throw new _RuntimeError(-2800, (typeof ngDevMode === 'undefined' || ngDevMode) && `Cannot make a JSONP request without JSONP support. To fix the problem, either add the \`withJsonpSupport()\` call (if \`provideHttpClient()\` is used) or import the \`HttpClientJsonpModule\` in the root NgModule.`);
    }
    ngDevMode && validateXhrCompatibility(req);
    const xhrFactory = this.xhrFactory;
    const source = typeof ngServerMode !== 'undefined' && ngServerMode && xhrFactory.ɵloadImpl ? from(xhrFactory.ɵloadImpl()) : of(null);
    return source.pipe(switchMap(() => {
      return new Observable(observer => {
        const xhr = xhrFactory.build();
        xhr.open(req.method, req.urlWithParams);
        if (req.withCredentials) {
          xhr.withCredentials = true;
        }
        req.headers.forEach((name, values) => xhr.setRequestHeader(name, values.join(',')));
        if (!req.headers.has(ACCEPT_HEADER)) {
          xhr.setRequestHeader(ACCEPT_HEADER, ACCEPT_HEADER_VALUE);
        }
        if (!req.headers.has(CONTENT_TYPE_HEADER)) {
          const detectedType = req.detectContentTypeHeader();
          if (detectedType !== null) {
            xhr.setRequestHeader(CONTENT_TYPE_HEADER, detectedType);
          }
        }
        if (req.timeout) {
          xhr.timeout = req.timeout;
        }
        if (req.responseType) {
          const responseType = req.responseType.toLowerCase();
          xhr.responseType = responseType !== 'json' ? responseType : 'text';
        }
        const reqBody = req.serializeBody();
        let headerResponse = null;
        const partialFromXhr = () => {
          if (headerResponse !== null) {
            return headerResponse;
          }
          const statusText = xhr.statusText || 'OK';
          const headers = new HttpHeaders(xhr.getAllResponseHeaders());
          const url = xhr.responseURL || req.url;
          headerResponse = new HttpHeaderResponse({
            headers,
            status: xhr.status,
            statusText,
            url
          });
          return headerResponse;
        };
        const onLoad = this.maybePropagateTrace(() => {
          let {
            headers,
            status,
            statusText,
            url
          } = partialFromXhr();
          let body = null;
          if (status !== HTTP_STATUS_CODE_NO_CONTENT) {
            body = typeof xhr.response === 'undefined' ? xhr.responseText : xhr.response;
          }
          if (status === 0) {
            status = !!body ? HTTP_STATUS_CODE_OK : 0;
          }
          let ok = status >= 200 && status < 300;
          if (req.responseType === 'json' && typeof body === 'string') {
            const originalBody = body;
            body = body.replace(XSSI_PREFIX, '');
            try {
              body = body !== '' ? JSON.parse(body) : null;
            } catch (error) {
              body = originalBody;
              if (ok) {
                ok = false;
                body = {
                  error,
                  text: body
                };
              }
            }
          }
          if (ok) {
            observer.next(new HttpResponse({
              body,
              headers,
              status,
              statusText,
              url: url || undefined
            }));
            observer.complete();
          } else {
            observer.error(new HttpErrorResponse({
              error: body,
              headers,
              status,
              statusText,
              url: url || undefined
            }));
          }
        });
        const onError = this.maybePropagateTrace(error => {
          const {
            url
          } = partialFromXhr();
          const res = new HttpErrorResponse({
            error,
            status: xhr.status || 0,
            statusText: xhr.statusText || 'Unknown Error',
            url: url || undefined
          });
          observer.error(res);
        });
        let onTimeout = onError;
        if (req.timeout) {
          onTimeout = this.maybePropagateTrace(_ => {
            const {
              url
            } = partialFromXhr();
            const res = new HttpErrorResponse({
              error: new DOMException('Request timed out', 'TimeoutError'),
              status: xhr.status || 0,
              statusText: xhr.statusText || 'Request timeout',
              url: url || undefined
            });
            observer.error(res);
          });
        }
        let sentHeaders = false;
        const onDownProgress = this.maybePropagateTrace(event => {
          if (!sentHeaders) {
            observer.next(partialFromXhr());
            sentHeaders = true;
          }
          let progressEvent = {
            type: HttpEventType.DownloadProgress,
            loaded: event.loaded
          };
          if (event.lengthComputable) {
            progressEvent.total = event.total;
          }
          if (req.responseType === 'text' && !!xhr.responseText) {
            progressEvent.partialText = xhr.responseText;
          }
          observer.next(progressEvent);
        });
        const onUpProgress = this.maybePropagateTrace(event => {
          let progress = {
            type: HttpEventType.UploadProgress,
            loaded: event.loaded
          };
          if (event.lengthComputable) {
            progress.total = event.total;
          }
          observer.next(progress);
        });
        xhr.addEventListener('load', onLoad);
        xhr.addEventListener('error', onError);
        xhr.addEventListener('timeout', onTimeout);
        xhr.addEventListener('abort', onError);
        if (req.reportProgress) {
          xhr.addEventListener('progress', onDownProgress);
          if (reqBody !== null && xhr.upload) {
            xhr.upload.addEventListener('progress', onUpProgress);
          }
        }
        xhr.send(reqBody);
        observer.next({
          type: HttpEventType.Sent
        });
        return () => {
          xhr.removeEventListener('error', onError);
          xhr.removeEventListener('abort', onError);
          xhr.removeEventListener('load', onLoad);
          xhr.removeEventListener('timeout', onTimeout);
          if (req.reportProgress) {
            xhr.removeEventListener('progress', onDownProgress);
            if (reqBody !== null && xhr.upload) {
              xhr.upload.removeEventListener('progress', onUpProgress);
            }
          }
          if (xhr.readyState !== xhr.DONE) {
            xhr.abort();
          }
        };
      });
    }));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXhrBackend,
    deps: [{
      token: XhrFactory
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXhrBackend,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpXhrBackend,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => [{
    type: XhrFactory
  }]
});

function interceptorChainEndFn(req, finalHandlerFn) {
  return finalHandlerFn(req);
}
function adaptLegacyInterceptorToChain(chainTailFn, interceptor) {
  return (initialRequest, finalHandlerFn) => interceptor.intercept(initialRequest, {
    handle: downstreamRequest => chainTailFn(downstreamRequest, finalHandlerFn)
  });
}
function chainedInterceptorFn(chainTailFn, interceptorFn, injector) {
  return (initialRequest, finalHandlerFn) => runInInjectionContext(injector, () => interceptorFn(initialRequest, downstreamRequest => chainTailFn(downstreamRequest, finalHandlerFn)));
}
const HTTP_INTERCEPTORS = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'HTTP_INTERCEPTORS' : '');
const HTTP_INTERCEPTOR_FNS = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'HTTP_INTERCEPTOR_FNS' : '', {
  factory: () => []
});
const HTTP_ROOT_INTERCEPTOR_FNS = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'HTTP_ROOT_INTERCEPTOR_FNS' : '');
const REQUESTS_CONTRIBUTE_TO_STABILITY = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'REQUESTS_CONTRIBUTE_TO_STABILITY' : '', {
  providedIn: 'root',
  factory: () => true
});
function legacyInterceptorFnFactory() {
  let chain = null;
  return (req, handler) => {
    if (chain === null) {
      const interceptors = inject(HTTP_INTERCEPTORS, {
        optional: true
      }) ?? [];
      chain = interceptors.reduceRight(adaptLegacyInterceptorToChain, interceptorChainEndFn);
    }
    const pendingTasks = inject(PendingTasks);
    const contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);
    if (contributeToStability) {
      const removeTask = pendingTasks.add();
      return chain(req, handler).pipe(finalize(removeTask));
    } else {
      return chain(req, handler);
    }
  };
}

class HttpBackend {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpBackend,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpBackend,
    providedIn: 'root',
    useExisting: HttpXhrBackend
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpBackend,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useExisting: HttpXhrBackend
    }]
  }]
});
let fetchBackendWarningDisplayed = false;
class HttpInterceptorHandler {
  backend;
  injector;
  chain = null;
  pendingTasks = inject(PendingTasks);
  contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);
  constructor(backend, injector) {
    this.backend = backend;
    this.injector = injector;
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !fetchBackendWarningDisplayed) {
      const isTestingBackend = this.backend.isTestingBackend;
      if (typeof ngServerMode !== 'undefined' && ngServerMode && !(this.backend instanceof FetchBackend) && !isTestingBackend) {
        fetchBackendWarningDisplayed = true;
        injector.get(_Console).warn(_formatRuntimeError(2801, 'Angular detected that `HttpClient` is not configured ' + "to use `fetch` APIs. It's strongly recommended to " + 'enable `fetch` for applications that use Server-Side Rendering ' + 'for better performance and compatibility. ' + 'To enable `fetch`, add the `withFetch()` to the `provideHttpClient()` ' + 'call at the root of the application.'));
      }
    }
  }
  handle(initialRequest) {
    if (this.chain === null) {
      const dedupedInterceptorFns = Array.from(new Set([...this.injector.get(HTTP_INTERCEPTOR_FNS), ...this.injector.get(HTTP_ROOT_INTERCEPTOR_FNS, [])]));
      this.chain = dedupedInterceptorFns.reduceRight((nextSequencedFn, interceptorFn) => chainedInterceptorFn(nextSequencedFn, interceptorFn, this.injector), interceptorChainEndFn);
    }
    if (this.contributeToStability) {
      const removeTask = this.pendingTasks.add();
      return this.chain(initialRequest, downstreamRequest => this.backend.handle(downstreamRequest)).pipe(finalize(removeTask));
    } else {
      return this.chain(initialRequest, downstreamRequest => this.backend.handle(downstreamRequest));
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpInterceptorHandler,
    deps: [{
      token: HttpBackend
    }, {
      token: i0.EnvironmentInjector
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpInterceptorHandler,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpInterceptorHandler,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => [{
    type: HttpBackend
  }, {
    type: i0.EnvironmentInjector
  }]
});
class HttpHandler {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpHandler,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpHandler,
    providedIn: 'root',
    useExisting: HttpInterceptorHandler
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpHandler,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useExisting: HttpInterceptorHandler
    }]
  }]
});

function addBody(options, body) {
  return {
    body,
    headers: options.headers,
    context: options.context,
    observe: options.observe,
    params: options.params,
    reportProgress: options.reportProgress,
    responseType: options.responseType,
    withCredentials: options.withCredentials,
    credentials: options.credentials,
    transferCache: options.transferCache,
    timeout: options.timeout,
    keepalive: options.keepalive,
    priority: options.priority,
    cache: options.cache,
    mode: options.mode,
    redirect: options.redirect,
    integrity: options.integrity,
    referrer: options.referrer,
    referrerPolicy: options.referrerPolicy
  };
}
class HttpClient {
  handler;
  constructor(handler) {
    this.handler = handler;
  }
  request(first, url, options = {}) {
    let req;
    if (first instanceof HttpRequest) {
      req = first;
    } else {
      let headers = undefined;
      if (options.headers instanceof HttpHeaders) {
        headers = options.headers;
      } else {
        headers = new HttpHeaders(options.headers);
      }
      let params = undefined;
      if (!!options.params) {
        if (options.params instanceof HttpParams) {
          params = options.params;
        } else {
          params = new HttpParams({
            fromObject: options.params
          });
        }
      }
      req = new HttpRequest(first, url, options.body !== undefined ? options.body : null, {
        headers,
        context: options.context,
        params,
        reportProgress: options.reportProgress,
        responseType: options.responseType || 'json',
        withCredentials: options.withCredentials,
        transferCache: options.transferCache,
        keepalive: options.keepalive,
        priority: options.priority,
        cache: options.cache,
        mode: options.mode,
        redirect: options.redirect,
        credentials: options.credentials,
        referrer: options.referrer,
        referrerPolicy: options.referrerPolicy,
        integrity: options.integrity,
        timeout: options.timeout
      });
    }
    const events$ = of(req).pipe(concatMap(req => this.handler.handle(req)));
    if (first instanceof HttpRequest || options.observe === 'events') {
      return events$;
    }
    const res$ = events$.pipe(filter(event => event instanceof HttpResponse));
    switch (options.observe || 'body') {
      case 'body':
        switch (req.responseType) {
          case 'arraybuffer':
            return res$.pipe(map(res => {
              if (res.body !== null && !(res.body instanceof ArrayBuffer)) {
                throw new _RuntimeError(2806, ngDevMode && 'Response is not an ArrayBuffer.');
              }
              return res.body;
            }));
          case 'blob':
            return res$.pipe(map(res => {
              if (res.body !== null && !(res.body instanceof Blob)) {
                throw new _RuntimeError(2807, ngDevMode && 'Response is not a Blob.');
              }
              return res.body;
            }));
          case 'text':
            return res$.pipe(map(res => {
              if (res.body !== null && typeof res.body !== 'string') {
                throw new _RuntimeError(2808, ngDevMode && 'Response is not a string.');
              }
              return res.body;
            }));
          case 'json':
          default:
            return res$.pipe(map(res => res.body));
        }
      case 'response':
        return res$;
      default:
        throw new _RuntimeError(2809, ngDevMode && `Unreachable: unhandled observe type ${options.observe}}`);
    }
  }
  delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }
  get(url, options = {}) {
    return this.request('GET', url, options);
  }
  head(url, options = {}) {
    return this.request('HEAD', url, options);
  }
  jsonp(url, callbackParam) {
    return this.request('JSONP', url, {
      params: new HttpParams().append(callbackParam, 'JSONP_CALLBACK'),
      observe: 'body',
      responseType: 'json'
    });
  }
  options(url, options = {}) {
    return this.request('OPTIONS', url, options);
  }
  patch(url, body, options = {}) {
    return this.request('PATCH', url, addBody(options, body));
  }
  post(url, body, options = {}) {
    return this.request('POST', url, addBody(options, body));
  }
  put(url, body, options = {}) {
    return this.request('PUT', url, addBody(options, body));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClient,
    deps: [{
      token: HttpHandler
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClient,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpClient,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => [{
    type: HttpHandler
  }]
});

let nextRequestId = 0;
let foreignDocument;
const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
const JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';
const JSONP_ERR_HEADERS_NOT_SUPPORTED = 'JSONP requests do not support headers.';
class JsonpCallbackContext {}
function jsonpCallbackContext() {
  if (typeof window === 'object') {
    return window;
  }
  return {};
}
class JsonpClientBackend {
  callbackMap;
  document;
  resolvedPromise = Promise.resolve();
  constructor(callbackMap, document) {
    this.callbackMap = callbackMap;
    this.document = document;
  }
  nextCallback() {
    return `ng_jsonp_callback_${nextRequestId++}`;
  }
  handle(req) {
    if (req.method !== 'JSONP') {
      throw new _RuntimeError(2810, ngDevMode && JSONP_ERR_WRONG_METHOD);
    } else if (req.responseType !== 'json') {
      throw new _RuntimeError(2811, ngDevMode && JSONP_ERR_WRONG_RESPONSE_TYPE);
    }
    if (req.headers.keys().length > 0) {
      throw new _RuntimeError(2812, ngDevMode && JSONP_ERR_HEADERS_NOT_SUPPORTED);
    }
    return new Observable(observer => {
      const callback = this.nextCallback();
      const url = req.urlWithParams.replace(/=JSONP_CALLBACK(&|$)/, `=${callback}$1`);
      const node = this.document.createElement('script');
      node.src = url;
      let body = null;
      let finished = false;
      this.callbackMap[callback] = data => {
        delete this.callbackMap[callback];
        body = data;
        finished = true;
      };
      const cleanup = () => {
        node.removeEventListener('load', onLoad);
        node.removeEventListener('error', onError);
        node.remove();
        delete this.callbackMap[callback];
      };
      const onLoad = () => {
        this.resolvedPromise.then(() => {
          cleanup();
          if (!finished) {
            observer.error(new HttpErrorResponse({
              url,
              status: 0,
              statusText: 'JSONP Error',
              error: new Error(JSONP_ERR_NO_CALLBACK)
            }));
            return;
          }
          observer.next(new HttpResponse({
            body,
            status: HTTP_STATUS_CODE_OK,
            statusText: 'OK',
            url
          }));
          observer.complete();
        });
      };
      const onError = error => {
        cleanup();
        observer.error(new HttpErrorResponse({
          error,
          status: 0,
          statusText: 'JSONP Error',
          url
        }));
      };
      node.addEventListener('load', onLoad);
      node.addEventListener('error', onError);
      this.document.body.appendChild(node);
      observer.next({
        type: HttpEventType.Sent
      });
      return () => {
        if (!finished) {
          this.removeListeners(node);
        }
        cleanup();
      };
    });
  }
  removeListeners(script) {
    foreignDocument ??= this.document.implementation.createHTMLDocument();
    foreignDocument.adoptNode(script);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: JsonpClientBackend,
    deps: [{
      token: JsonpCallbackContext
    }, {
      token: DOCUMENT
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: JsonpClientBackend
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: JsonpClientBackend,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => [{
    type: JsonpCallbackContext
  }, {
    type: undefined,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }]
});
function jsonpInterceptorFn(req, next) {
  if (req.method === 'JSONP') {
    return inject(JsonpClientBackend).handle(req);
  }
  return next(req);
}
class JsonpInterceptor {
  injector;
  constructor(injector) {
    this.injector = injector;
  }
  intercept(initialRequest, next) {
    return runInInjectionContext(this.injector, () => jsonpInterceptorFn(initialRequest, downstreamRequest => next.handle(downstreamRequest)));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: JsonpInterceptor,
    deps: [{
      token: i0.EnvironmentInjector
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: JsonpInterceptor
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: JsonpInterceptor,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => [{
    type: i0.EnvironmentInjector
  }]
});

const XSRF_ENABLED = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_ENABLED' : '', {
  factory: () => true
});
const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_COOKIE_NAME = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_COOKIE_NAME' : '', {
  providedIn: 'root',
  factory: () => XSRF_DEFAULT_COOKIE_NAME
});
const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';
const XSRF_HEADER_NAME = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_HEADER_NAME' : '', {
  providedIn: 'root',
  factory: () => XSRF_DEFAULT_HEADER_NAME
});
class HttpXsrfCookieExtractor {
  doc;
  cookieName;
  lastCookieString = '';
  lastToken = null;
  parseCount = 0;
  constructor(doc, cookieName) {
    this.doc = doc;
    this.cookieName = cookieName;
  }
  getToken() {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      return null;
    }
    const cookieString = this.doc.cookie || '';
    if (cookieString !== this.lastCookieString) {
      this.parseCount++;
      this.lastToken = parseCookieValue(cookieString, this.cookieName);
      this.lastCookieString = cookieString;
    }
    return this.lastToken;
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXsrfCookieExtractor,
    deps: [{
      token: DOCUMENT
    }, {
      token: XSRF_COOKIE_NAME
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXsrfCookieExtractor,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpXsrfCookieExtractor,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => [{
    type: undefined,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }, {
    type: undefined,
    decorators: [{
      type: Inject,
      args: [XSRF_COOKIE_NAME]
    }]
  }]
});
class HttpXsrfTokenExtractor {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXsrfTokenExtractor,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXsrfTokenExtractor,
    providedIn: 'root',
    useExisting: HttpXsrfCookieExtractor
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpXsrfTokenExtractor,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useExisting: HttpXsrfCookieExtractor
    }]
  }]
});
function xsrfInterceptorFn(req, next) {
  const lcUrl = req.url.toLowerCase();
  if (!inject(XSRF_ENABLED) || req.method === 'GET' || req.method === 'HEAD' || lcUrl.startsWith('http://') || lcUrl.startsWith('https://')) {
    return next(req);
  }
  const token = inject(HttpXsrfTokenExtractor).getToken();
  const headerName = inject(XSRF_HEADER_NAME);
  if (token != null && !req.headers.has(headerName)) {
    req = req.clone({
      headers: req.headers.set(headerName, token)
    });
  }
  return next(req);
}
class HttpXsrfInterceptor {
  injector;
  constructor(injector) {
    this.injector = injector;
  }
  intercept(initialRequest, next) {
    return runInInjectionContext(this.injector, () => xsrfInterceptorFn(initialRequest, downstreamRequest => next.handle(downstreamRequest)));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXsrfInterceptor,
    deps: [{
      token: i0.EnvironmentInjector
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpXsrfInterceptor
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpXsrfInterceptor,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => [{
    type: i0.EnvironmentInjector
  }]
});

var HttpFeatureKind;
(function (HttpFeatureKind) {
  HttpFeatureKind[HttpFeatureKind["Interceptors"] = 0] = "Interceptors";
  HttpFeatureKind[HttpFeatureKind["LegacyInterceptors"] = 1] = "LegacyInterceptors";
  HttpFeatureKind[HttpFeatureKind["CustomXsrfConfiguration"] = 2] = "CustomXsrfConfiguration";
  HttpFeatureKind[HttpFeatureKind["NoXsrfProtection"] = 3] = "NoXsrfProtection";
  HttpFeatureKind[HttpFeatureKind["JsonpSupport"] = 4] = "JsonpSupport";
  HttpFeatureKind[HttpFeatureKind["RequestsMadeViaParent"] = 5] = "RequestsMadeViaParent";
  HttpFeatureKind[HttpFeatureKind["Fetch"] = 6] = "Fetch";
})(HttpFeatureKind || (HttpFeatureKind = {}));
function makeHttpFeature(kind, providers) {
  return {
    ɵkind: kind,
    ɵproviders: providers
  };
}
function provideHttpClient(...features) {
  if (ngDevMode) {
    const featureKinds = new Set(features.map(f => f.ɵkind));
    if (featureKinds.has(HttpFeatureKind.NoXsrfProtection) && featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)) {
      throw new Error(ngDevMode ? `Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() in the same call to provideHttpClient(), which is a contradiction.` : '');
    }
  }
  const providers = [HttpClient, HttpInterceptorHandler, {
    provide: HttpHandler,
    useExisting: HttpInterceptorHandler
  }, {
    provide: HttpBackend,
    useFactory: () => {
      return inject(FETCH_BACKEND, {
        optional: true
      }) ?? inject(HttpXhrBackend);
    }
  }, {
    provide: HTTP_INTERCEPTOR_FNS,
    useValue: xsrfInterceptorFn,
    multi: true
  }];
  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }
  return makeEnvironmentProviders(providers);
}
function withInterceptors(interceptorFns) {
  return makeHttpFeature(HttpFeatureKind.Interceptors, interceptorFns.map(interceptorFn => {
    return {
      provide: HTTP_INTERCEPTOR_FNS,
      useValue: interceptorFn,
      multi: true
    };
  }));
}
const LEGACY_INTERCEPTOR_FN = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'LEGACY_INTERCEPTOR_FN' : '');
function withInterceptorsFromDi() {
  return makeHttpFeature(HttpFeatureKind.LegacyInterceptors, [{
    provide: LEGACY_INTERCEPTOR_FN,
    useFactory: legacyInterceptorFnFactory
  }, {
    provide: HTTP_INTERCEPTOR_FNS,
    useExisting: LEGACY_INTERCEPTOR_FN,
    multi: true
  }]);
}
function withXsrfConfiguration({
  cookieName,
  headerName
}) {
  const providers = [];
  if (cookieName !== undefined) {
    providers.push({
      provide: XSRF_COOKIE_NAME,
      useValue: cookieName
    });
  }
  if (headerName !== undefined) {
    providers.push({
      provide: XSRF_HEADER_NAME,
      useValue: headerName
    });
  }
  return makeHttpFeature(HttpFeatureKind.CustomXsrfConfiguration, providers);
}
function withNoXsrfProtection() {
  return makeHttpFeature(HttpFeatureKind.NoXsrfProtection, [{
    provide: XSRF_ENABLED,
    useValue: false
  }]);
}
function withJsonpSupport() {
  return makeHttpFeature(HttpFeatureKind.JsonpSupport, [JsonpClientBackend, {
    provide: JsonpCallbackContext,
    useFactory: jsonpCallbackContext
  }, {
    provide: HTTP_INTERCEPTOR_FNS,
    useValue: jsonpInterceptorFn,
    multi: true
  }]);
}
function withRequestsMadeViaParent() {
  return makeHttpFeature(HttpFeatureKind.RequestsMadeViaParent, [{
    provide: HttpBackend,
    useFactory: () => {
      const handlerFromParent = inject(HttpHandler, {
        skipSelf: true,
        optional: true
      });
      if (ngDevMode && handlerFromParent === null) {
        throw new Error('withRequestsMadeViaParent() can only be used when the parent injector also configures HttpClient');
      }
      return handlerFromParent;
    }
  }]);
}
function withFetch() {
  return makeHttpFeature(HttpFeatureKind.Fetch, [FetchBackend, {
    provide: FETCH_BACKEND,
    useExisting: FetchBackend
  }, {
    provide: HttpBackend,
    useExisting: FetchBackend
  }]);
}

class HttpClientXsrfModule {
  static disable() {
    return {
      ngModule: HttpClientXsrfModule,
      providers: [withNoXsrfProtection().ɵproviders]
    };
  }
  static withOptions(options = {}) {
    return {
      ngModule: HttpClientXsrfModule,
      providers: withXsrfConfiguration(options).ɵproviders
    };
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientXsrfModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientXsrfModule
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientXsrfModule,
    providers: [HttpXsrfInterceptor, {
      provide: HTTP_INTERCEPTORS,
      useExisting: HttpXsrfInterceptor,
      multi: true
    }, {
      provide: HttpXsrfTokenExtractor,
      useClass: HttpXsrfCookieExtractor
    }, withXsrfConfiguration({
      cookieName: XSRF_DEFAULT_COOKIE_NAME,
      headerName: XSRF_DEFAULT_HEADER_NAME
    }).ɵproviders, {
      provide: XSRF_ENABLED,
      useValue: true
    }]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpClientXsrfModule,
  decorators: [{
    type: NgModule,
    args: [{
      providers: [HttpXsrfInterceptor, {
        provide: HTTP_INTERCEPTORS,
        useExisting: HttpXsrfInterceptor,
        multi: true
      }, {
        provide: HttpXsrfTokenExtractor,
        useClass: HttpXsrfCookieExtractor
      }, withXsrfConfiguration({
        cookieName: XSRF_DEFAULT_COOKIE_NAME,
        headerName: XSRF_DEFAULT_HEADER_NAME
      }).ɵproviders, {
        provide: XSRF_ENABLED,
        useValue: true
      }]
    }]
  }]
});
class HttpClientModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientModule
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientModule,
    providers: [provideHttpClient(withInterceptorsFromDi())]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpClientModule,
  decorators: [{
    type: NgModule,
    args: [{
      providers: [provideHttpClient(withInterceptorsFromDi())]
    }]
  }]
});
class HttpClientJsonpModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientJsonpModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientJsonpModule
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-5a93eeb",
    ngImport: i0,
    type: HttpClientJsonpModule,
    providers: [withJsonpSupport().ɵproviders]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-5a93eeb",
  ngImport: i0,
  type: HttpClientJsonpModule,
  decorators: [{
    type: NgModule,
    args: [{
      providers: [withJsonpSupport().ɵproviders]
    }]
  }]
});

export { FetchBackend, HTTP_INTERCEPTORS, HTTP_ROOT_INTERCEPTOR_FNS, HttpBackend, HttpClient, HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule, HttpContext, HttpContextToken, HttpErrorResponse, HttpEventType, HttpFeatureKind, HttpHandler, HttpHeaderResponse, HttpHeaders, HttpInterceptorHandler, HttpParams, HttpRequest, HttpResponse, HttpResponseBase, HttpStatusCode, HttpUrlEncodingCodec, HttpXhrBackend, HttpXsrfTokenExtractor, JsonpClientBackend, JsonpInterceptor, REQUESTS_CONTRIBUTE_TO_STABILITY, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi, withJsonpSupport, withNoXsrfProtection, withRequestsMadeViaParent, withXsrfConfiguration };
//# sourceMappingURL=_module-chunk.mjs.map
