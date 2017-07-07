import { Observable } from 'rxjs/Observable';
import { HttpHandler } from './backend';
import { HttpHeaders } from './headers';
import { HttpRequest } from './request';
import { HttpEvent, HttpResponse } from './response';
/**
 * @experimental
 */
export declare type HttpObserve = 'body' | 'events' | 'response';
/**
 * The main API for making outgoing HTTP requests.
 *
 * @experimental
 */
export declare class HttpClient {
    private handler;
    constructor(handler: HttpHandler);
    request<R>(req: HttpRequest<any>): Observable<HttpEvent<R>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    request<R>(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<R>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    request<R>(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<R>>;
    request(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    request<R>(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<R>;
    request(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders;
        observe?: HttpObserve;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    }): Observable<any>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    delete<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    delete(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    delete<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    delete(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    delete<T>(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    get<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    get(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    get<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    get(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    get<T>(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    head<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    head(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    head<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    head(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    head<T>(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    jsonp(url: string): Observable<any>;
    jsonp<T>(url: string): Observable<T>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    options<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    options(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    options<T>(url: string, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    options(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    options<T>(url: string, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    patch<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    patch<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    patch(url: string, body: any | null, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    patch<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    post<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    post<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    post(url: string, body: any | null, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    post<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    put<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    put<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders;
        observe: 'response';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    put(url: string, body: any | null, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    put<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders;
        observe?: 'body';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
}
