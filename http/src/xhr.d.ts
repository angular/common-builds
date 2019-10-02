import { Observable } from 'rxjs';
import { HttpBackend } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
import * as i0 from "@angular/core";
/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
export declare abstract class XhrFactory {
    abstract build(): XMLHttpRequest;
}
/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 *
 */
export declare class BrowserXhr implements XhrFactory {
    constructor();
    build(): any;
    static ngFactoryDef: i0.ɵɵFactoryDef<BrowserXhr>;
    static ngInjectableDef: i0.ɵɵInjectableDef<BrowserXhr>;
}
/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see `HttpHandler`
 * @see `JsonpClientBackend`
 *
 * @publicApi
 */
export declare class HttpXhrBackend implements HttpBackend {
    private xhrFactory;
    constructor(xhrFactory: XhrFactory);
    /**
     * Processes a request and returns a stream of response events.
     * @param req The request object.
     * @returns An observable of the response events.
     */
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
    static ngFactoryDef: i0.ɵɵFactoryDef<HttpXhrBackend>;
    static ngInjectableDef: i0.ɵɵInjectableDef<HttpXhrBackend>;
}
