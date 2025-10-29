/**
 * @license Angular v21.0.0-rc.0+sha-60cc3cb
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpResponse, HttpErrorResponse, HttpStatusCode, HttpEventType, HttpBackend, REQUESTS_CONTRIBUTE_TO_STABILITY, HttpClientModule } from './_module-chunk.mjs';
import 'rxjs/operators';
import './_xhr-chunk.mjs';

class HttpTestingController {}

class TestRequest {
  request;
  observer;
  get cancelled() {
    return this._cancelled;
  }
  _cancelled = false;
  constructor(request, observer) {
    this.request = request;
    this.observer = observer;
  }
  flush(body, opts = {}) {
    if (this.cancelled) {
      throw new Error(`Cannot flush a cancelled request.`);
    }
    const url = this.request.urlWithParams;
    const headers = opts.headers instanceof HttpHeaders ? opts.headers : new HttpHeaders(opts.headers);
    body = _maybeConvertBody(this.request.responseType, body);
    let statusText = opts.statusText;
    let status = opts.status !== undefined ? opts.status : HttpStatusCode.Ok;
    if (opts.status === undefined) {
      if (body === null) {
        status = HttpStatusCode.NoContent;
        statusText ||= 'No Content';
      } else {
        statusText ||= 'OK';
      }
    }
    if (statusText === undefined) {
      throw new Error('statusText is required when setting a custom status.');
    }
    if (status >= 200 && status < 300) {
      this.observer.next(new HttpResponse({
        body,
        headers,
        status,
        statusText,
        url
      }));
      this.observer.complete();
    } else {
      this.observer.error(new HttpErrorResponse({
        error: body,
        headers,
        status,
        statusText,
        url
      }));
    }
  }
  error(error, opts = {}) {
    if (this.cancelled) {
      throw new Error(`Cannot return an error for a cancelled request.`);
    }
    const headers = opts.headers instanceof HttpHeaders ? opts.headers : new HttpHeaders(opts.headers);
    this.observer.error(new HttpErrorResponse({
      error,
      headers,
      status: opts.status || 0,
      statusText: opts.statusText || '',
      url: this.request.urlWithParams
    }));
  }
  event(event) {
    if (this.cancelled) {
      throw new Error(`Cannot send events to a cancelled request.`);
    }
    this.observer.next(event);
  }
}
function _toArrayBufferBody(body) {
  if (typeof ArrayBuffer === 'undefined') {
    throw new Error('ArrayBuffer responses are not supported on this platform.');
  }
  if (body instanceof ArrayBuffer) {
    return body;
  }
  throw new Error('Automatic conversion to ArrayBuffer is not supported for response type.');
}
function _toBlob(body) {
  if (typeof Blob === 'undefined') {
    throw new Error('Blob responses are not supported on this platform.');
  }
  if (body instanceof Blob) {
    return body;
  }
  if (ArrayBuffer && body instanceof ArrayBuffer) {
    return new Blob([body]);
  }
  throw new Error('Automatic conversion to Blob is not supported for response type.');
}
function _toJsonBody(body, format = 'JSON') {
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    throw new Error(`Automatic conversion to ${format} is not supported for ArrayBuffers.`);
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    throw new Error(`Automatic conversion to ${format} is not supported for Blobs.`);
  }
  if (typeof body === 'string' || typeof body === 'number' || typeof body === 'object' || typeof body === 'boolean' || Array.isArray(body)) {
    return body;
  }
  throw new Error(`Automatic conversion to ${format} is not supported for response type.`);
}
function _toTextBody(body) {
  if (typeof body === 'string') {
    return body;
  }
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    throw new Error('Automatic conversion to text is not supported for ArrayBuffers.');
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    throw new Error('Automatic conversion to text is not supported for Blobs.');
  }
  return JSON.stringify(_toJsonBody(body, 'text'));
}
function _maybeConvertBody(responseType, body) {
  if (body === null) {
    return null;
  }
  switch (responseType) {
    case 'arraybuffer':
      return _toArrayBufferBody(body);
    case 'blob':
      return _toBlob(body);
    case 'json':
      return _toJsonBody(body);
    case 'text':
      return _toTextBody(body);
    default:
      throw new Error(`Unsupported responseType: ${responseType}`);
  }
}

class HttpClientTestingBackend {
  open = [];
  isTestingBackend = true;
  handle(req) {
    return new Observable(observer => {
      const testReq = new TestRequest(req, observer);
      this.open.push(testReq);
      observer.next({
        type: HttpEventType.Sent
      });
      return () => {
        testReq._cancelled = true;
      };
    });
  }
  _match(match) {
    if (typeof match === 'string') {
      return this.open.filter(testReq => testReq.request.urlWithParams === match);
    } else if (typeof match === 'function') {
      return this.open.filter(testReq => match(testReq.request));
    } else {
      return this.open.filter(testReq => (!match.method || testReq.request.method === match.method.toUpperCase()) && (!match.url || testReq.request.urlWithParams === match.url));
    }
  }
  match(match) {
    const results = this._match(match);
    results.forEach(result => {
      const index = this.open.indexOf(result);
      if (index !== -1) {
        this.open.splice(index, 1);
      }
    });
    return results;
  }
  expectOne(match, description) {
    description ||= this.descriptionFromMatcher(match);
    const matches = this.match(match);
    if (matches.length > 1) {
      throw new Error(`Expected one matching request for criteria "${description}", found ${matches.length} requests.`);
    }
    if (matches.length === 0) {
      let message = `Expected one matching request for criteria "${description}", found none.`;
      if (this.open.length > 0) {
        const requests = this.open.map(describeRequest).join(', ');
        message += ` Requests received are: ${requests}.`;
      }
      throw new Error(message);
    }
    return matches[0];
  }
  expectNone(match, description) {
    description ||= this.descriptionFromMatcher(match);
    const matches = this.match(match);
    if (matches.length > 0) {
      throw new Error(`Expected zero matching requests for criteria "${description}", found ${matches.length}.`);
    }
  }
  verify(opts = {}) {
    let open = this.open;
    if (opts.ignoreCancelled) {
      open = open.filter(testReq => !testReq.cancelled);
    }
    if (open.length > 0) {
      const requests = open.map(describeRequest).join(', ');
      throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
    }
  }
  descriptionFromMatcher(matcher) {
    if (typeof matcher === 'string') {
      return `Match URL: ${matcher}`;
    } else if (typeof matcher === 'object') {
      const method = matcher.method || '(any)';
      const url = matcher.url || '(any)';
      return `Match method: ${method}, URL: ${url}`;
    } else {
      return `Match by function: ${matcher.name}`;
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-60cc3cb",
    ngImport: i0,
    type: HttpClientTestingBackend,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-60cc3cb",
    ngImport: i0,
    type: HttpClientTestingBackend
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.0+sha-60cc3cb",
  ngImport: i0,
  type: HttpClientTestingBackend,
  decorators: [{
    type: Injectable
  }]
});
function describeRequest(testRequest) {
  const url = testRequest.request.urlWithParams;
  const method = testRequest.request.method;
  return `${method} ${url}`;
}

function provideHttpClientTesting() {
  return [HttpClientTestingBackend, {
    provide: HttpBackend,
    useExisting: HttpClientTestingBackend
  }, {
    provide: HttpTestingController,
    useExisting: HttpClientTestingBackend
  }, {
    provide: REQUESTS_CONTRIBUTE_TO_STABILITY,
    useValue: false
  }];
}

class HttpClientTestingModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-60cc3cb",
    ngImport: i0,
    type: HttpClientTestingModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.0.0-rc.0+sha-60cc3cb",
    ngImport: i0,
    type: HttpClientTestingModule,
    imports: [HttpClientModule]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-60cc3cb",
    ngImport: i0,
    type: HttpClientTestingModule,
    providers: [provideHttpClientTesting()],
    imports: [HttpClientModule]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.0+sha-60cc3cb",
  ngImport: i0,
  type: HttpClientTestingModule,
  decorators: [{
    type: NgModule,
    args: [{
      imports: [HttpClientModule],
      providers: [provideHttpClientTesting()]
    }]
  }]
});

export { HttpClientTestingModule, HttpTestingController, TestRequest, provideHttpClientTesting };
//# sourceMappingURL=http-testing.mjs.map
