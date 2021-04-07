import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHandler } from './backend';
import { HttpInterceptor } from './interceptor';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
import * as i0 from "@angular/core";
export declare const XSRF_COOKIE_NAME: InjectionToken<string>;
export declare const XSRF_HEADER_NAME: InjectionToken<string>;
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
export declare abstract class HttpXsrfTokenExtractor {
    /**
     * Get the XSRF token to use with an outgoing request.
     *
     * Will be called for every request, so the token may change between requests.
     */
    abstract getToken(): string | null;
}
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
export declare class HttpXsrfCookieExtractor implements HttpXsrfTokenExtractor {
    private doc;
    private platform;
    private cookieName;
    private lastCookieString;
    private lastToken;
    constructor(doc: any, platform: string, cookieName: string);
    getToken(): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<HttpXsrfCookieExtractor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HttpXsrfCookieExtractor>;
}
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
export declare class HttpXsrfInterceptor implements HttpInterceptor {
    private tokenService;
    private headerName;
    constructor(tokenService: HttpXsrfTokenExtractor, headerName: string);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HttpXsrfInterceptor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HttpXsrfInterceptor>;
}
