/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from './interceptor';
import { provideHttpClient, withInterceptorsFromDi, withJsonpSupport, withNoXsrfProtection, withXsrfConfiguration, } from './provider';
import { HttpXsrfCookieExtractor, HttpXsrfInterceptor, HttpXsrfTokenExtractor, XSRF_DEFAULT_COOKIE_NAME, XSRF_DEFAULT_HEADER_NAME, XSRF_ENABLED, } from './xsrf';
import * as i0 from "@angular/core";
/**
 * Configures XSRF protection support for outgoing requests.
 *
 * For a server that supports a cookie-based XSRF protection system,
 * use directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no names are supplied, the default cookie name is `XSRF-TOKEN`
 * and the default header name is `X-XSRF-TOKEN`.
 *
 * @publicApi
 * @deprecated Use withXsrfConfiguration({cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN'}) as
 *     providers instead or `withNoXsrfProtection` if you want to disabled XSRF protection.
 */
export class HttpClientXsrfModule {
    /**
     * Disable the default XSRF protection.
     */
    static disable() {
        return {
            ngModule: HttpClientXsrfModule,
            providers: [withNoXsrfProtection().ɵproviders],
        };
    }
    /**
     * Configure XSRF protection.
     * @param options An object that can specify either or both
     * cookie name or header name.
     * - Cookie name default is `XSRF-TOKEN`.
     * - Header name default is `X-XSRF-TOKEN`.
     *
     */
    static withOptions(options = {}) {
        return {
            ngModule: HttpClientXsrfModule,
            providers: withXsrfConfiguration(options).ɵproviders,
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientXsrfModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientXsrfModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientXsrfModule, providers: [
            HttpXsrfInterceptor,
            { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
            { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
            withXsrfConfiguration({
                cookieName: XSRF_DEFAULT_COOKIE_NAME,
                headerName: XSRF_DEFAULT_HEADER_NAME,
            }).ɵproviders,
            { provide: XSRF_ENABLED, useValue: true },
        ] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientXsrfModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        HttpXsrfInterceptor,
                        { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
                        { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
                        withXsrfConfiguration({
                            cookieName: XSRF_DEFAULT_COOKIE_NAME,
                            headerName: XSRF_DEFAULT_HEADER_NAME,
                        }).ɵproviders,
                        { provide: XSRF_ENABLED, useValue: true },
                    ],
                }]
        }] });
/**
 * Configures the dependency injector for `HttpClient`
 * with supporting services for XSRF. Automatically imported by `HttpClientModule`.
 *
 * You can add interceptors to the chain behind `HttpClient` by binding them to the
 * multiprovider for built-in DI token `HTTP_INTERCEPTORS`.
 *
 * @publicApi
 * @deprecated use `provideHttpClient(withInterceptorsFromDi())` as providers instead
 */
export class HttpClientModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientModule, providers: [provideHttpClient(withInterceptorsFromDi())] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientModule, decorators: [{
            type: NgModule,
            args: [{
                    /**
                     * Configures the dependency injector where it is imported
                     * with supporting services for HTTP communications.
                     */
                    providers: [provideHttpClient(withInterceptorsFromDi())],
                }]
        }] });
/**
 * Configures the dependency injector for `HttpClient`
 * with supporting services for JSONP.
 * Without this module, Jsonp requests reach the backend
 * with method JSONP, where they are rejected.
 *
 * @publicApi
 * @deprecated `withJsonpSupport()` as providers instead
 */
export class HttpClientJsonpModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientJsonpModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientJsonpModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientJsonpModule, providers: [withJsonpSupport().ɵproviders] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: HttpClientJsonpModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [withJsonpSupport().ɵproviders],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQXNCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEQsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsZ0JBQWdCLEVBQ2hCLG9CQUFvQixFQUNwQixxQkFBcUIsR0FDdEIsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixtQkFBbUIsRUFDbkIsc0JBQXNCLEVBQ3RCLHdCQUF3QixFQUN4Qix3QkFBd0IsRUFDeEIsWUFBWSxHQUNiLE1BQU0sUUFBUSxDQUFDOztBQUVoQjs7Ozs7Ozs7Ozs7OztHQWFHO0FBYUgsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQjs7T0FFRztJQUNILE1BQU0sQ0FBQyxPQUFPO1FBQ1osT0FBTztZQUNMLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsU0FBUyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxVQUFVLENBQUM7U0FDL0MsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FDaEIsVUFHSSxFQUFFO1FBRU4sT0FBTztZQUNMLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsU0FBUyxFQUFFLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVU7U0FDckQsQ0FBQztJQUNKLENBQUM7eUhBN0JVLG9CQUFvQjswSEFBcEIsb0JBQW9COzBIQUFwQixvQkFBb0IsYUFYcEI7WUFDVCxtQkFBbUI7WUFDbkIsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7WUFDM0UsRUFBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFDO1lBQ3BFLHFCQUFxQixDQUFDO2dCQUNwQixVQUFVLEVBQUUsd0JBQXdCO2dCQUNwQyxVQUFVLEVBQUUsd0JBQXdCO2FBQ3JDLENBQUMsQ0FBQyxVQUFVO1lBQ2IsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7U0FDeEM7O3NHQUVVLG9CQUFvQjtrQkFaaEMsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUU7d0JBQ1QsbUJBQW1CO3dCQUNuQixFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQzt3QkFDM0UsRUFBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFDO3dCQUNwRSxxQkFBcUIsQ0FBQzs0QkFDcEIsVUFBVSxFQUFFLHdCQUF3Qjs0QkFDcEMsVUFBVSxFQUFFLHdCQUF3Qjt5QkFDckMsQ0FBQyxDQUFDLFVBQVU7d0JBQ2IsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7cUJBQ3hDO2lCQUNGOztBQWlDRDs7Ozs7Ozs7O0dBU0c7QUFRSCxNQUFNLE9BQU8sZ0JBQWdCO3lIQUFoQixnQkFBZ0I7MEhBQWhCLGdCQUFnQjswSEFBaEIsZ0JBQWdCLGFBRmhCLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDOztzR0FFN0MsZ0JBQWdCO2tCQVA1QixRQUFRO21CQUFDO29CQUNSOzs7dUJBR0c7b0JBQ0gsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO2lCQUN6RDs7QUFHRDs7Ozs7Ozs7R0FRRztBQUlILE1BQU0sT0FBTyxxQkFBcUI7eUhBQXJCLHFCQUFxQjswSEFBckIscUJBQXFCOzBIQUFyQixxQkFBcUIsYUFGckIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFVBQVUsQ0FBQzs7c0dBRS9CLHFCQUFxQjtrQkFIakMsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFVBQVUsQ0FBQztpQkFDM0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SFRUUF9JTlRFUkNFUFRPUlN9IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtcbiAgcHJvdmlkZUh0dHBDbGllbnQsXG4gIHdpdGhJbnRlcmNlcHRvcnNGcm9tRGksXG4gIHdpdGhKc29ucFN1cHBvcnQsXG4gIHdpdGhOb1hzcmZQcm90ZWN0aW9uLFxuICB3aXRoWHNyZkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4vcHJvdmlkZXInO1xuaW1wb3J0IHtcbiAgSHR0cFhzcmZDb29raWVFeHRyYWN0b3IsXG4gIEh0dHBYc3JmSW50ZXJjZXB0b3IsXG4gIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsXG4gIFhTUkZfREVGQVVMVF9DT09LSUVfTkFNRSxcbiAgWFNSRl9ERUZBVUxUX0hFQURFUl9OQU1FLFxuICBYU1JGX0VOQUJMRUQsXG59IGZyb20gJy4veHNyZic7XG5cbi8qKlxuICogQ29uZmlndXJlcyBYU1JGIHByb3RlY3Rpb24gc3VwcG9ydCBmb3Igb3V0Z29pbmcgcmVxdWVzdHMuXG4gKlxuICogRm9yIGEgc2VydmVyIHRoYXQgc3VwcG9ydHMgYSBjb29raWUtYmFzZWQgWFNSRiBwcm90ZWN0aW9uIHN5c3RlbSxcbiAqIHVzZSBkaXJlY3RseSB0byBjb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uIHdpdGggdGhlIGNvcnJlY3RcbiAqIGNvb2tpZSBhbmQgaGVhZGVyIG5hbWVzLlxuICpcbiAqIElmIG5vIG5hbWVzIGFyZSBzdXBwbGllZCwgdGhlIGRlZmF1bHQgY29va2llIG5hbWUgaXMgYFhTUkYtVE9LRU5gXG4gKiBhbmQgdGhlIGRlZmF1bHQgaGVhZGVyIG5hbWUgaXMgYFgtWFNSRi1UT0tFTmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQGRlcHJlY2F0ZWQgVXNlIHdpdGhYc3JmQ29uZmlndXJhdGlvbih7Y29va2llTmFtZTogJ1hTUkYtVE9LRU4nLCBoZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJ30pIGFzXG4gKiAgICAgcHJvdmlkZXJzIGluc3RlYWQgb3IgYHdpdGhOb1hzcmZQcm90ZWN0aW9uYCBpZiB5b3Ugd2FudCB0byBkaXNhYmxlZCBYU1JGIHByb3RlY3Rpb24uXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBYc3JmSW50ZXJjZXB0b3IsXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VFeGlzdGluZzogSHR0cFhzcmZJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICAgIHdpdGhYc3JmQ29uZmlndXJhdGlvbih7XG4gICAgICBjb29raWVOYW1lOiBYU1JGX0RFRkFVTFRfQ09PS0lFX05BTUUsXG4gICAgICBoZWFkZXJOYW1lOiBYU1JGX0RFRkFVTFRfSEVBREVSX05BTUUsXG4gICAgfSkuybVwcm92aWRlcnMsXG4gICAge3Byb3ZpZGU6IFhTUkZfRU5BQkxFRCwgdXNlVmFsdWU6IHRydWV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50WHNyZk1vZHVsZSB7XG4gIC8qKlxuICAgKiBEaXNhYmxlIHRoZSBkZWZhdWx0IFhTUkYgcHJvdGVjdGlvbi5cbiAgICovXG4gIHN0YXRpYyBkaXNhYmxlKCk6IE1vZHVsZVdpdGhQcm92aWRlcnM8SHR0cENsaWVudFhzcmZNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbd2l0aE5vWHNyZlByb3RlY3Rpb24oKS7JtXByb3ZpZGVyc10sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBjYW4gc3BlY2lmeSBlaXRoZXIgb3IgYm90aFxuICAgKiBjb29raWUgbmFtZSBvciBoZWFkZXIgbmFtZS5cbiAgICogLSBDb29raWUgbmFtZSBkZWZhdWx0IGlzIGBYU1JGLVRPS0VOYC5cbiAgICogLSBIZWFkZXIgbmFtZSBkZWZhdWx0IGlzIGBYLVhTUkYtVE9LRU5gLlxuICAgKlxuICAgKi9cbiAgc3RhdGljIHdpdGhPcHRpb25zKFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGNvb2tpZU5hbWU/OiBzdHJpbmc7XG4gICAgICBoZWFkZXJOYW1lPzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKTogTW9kdWxlV2l0aFByb3ZpZGVyczxIdHRwQ2xpZW50WHNyZk1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IHdpdGhYc3JmQ29uZmlndXJhdGlvbihvcHRpb25zKS7JtXByb3ZpZGVycyxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgZGVwZW5kZW5jeSBpbmplY3RvciBmb3IgYEh0dHBDbGllbnRgXG4gKiB3aXRoIHN1cHBvcnRpbmcgc2VydmljZXMgZm9yIFhTUkYuIEF1dG9tYXRpY2FsbHkgaW1wb3J0ZWQgYnkgYEh0dHBDbGllbnRNb2R1bGVgLlxuICpcbiAqIFlvdSBjYW4gYWRkIGludGVyY2VwdG9ycyB0byB0aGUgY2hhaW4gYmVoaW5kIGBIdHRwQ2xpZW50YCBieSBiaW5kaW5nIHRoZW0gdG8gdGhlXG4gKiBtdWx0aXByb3ZpZGVyIGZvciBidWlsdC1pbiBESSB0b2tlbiBgSFRUUF9JTlRFUkNFUFRPUlNgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBkZXByZWNhdGVkIHVzZSBgcHJvdmlkZUh0dHBDbGllbnQod2l0aEludGVyY2VwdG9yc0Zyb21EaSgpKWAgYXMgcHJvdmlkZXJzIGluc3RlYWRcbiAqL1xuQE5nTW9kdWxlKHtcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGRlcGVuZGVuY3kgaW5qZWN0b3Igd2hlcmUgaXQgaXMgaW1wb3J0ZWRcbiAgICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBIVFRQIGNvbW11bmljYXRpb25zLlxuICAgKi9cbiAgcHJvdmlkZXJzOiBbcHJvdmlkZUh0dHBDbGllbnQod2l0aEludGVyY2VwdG9yc0Zyb21EaSgpKV0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRNb2R1bGUge31cblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBkZXBlbmRlbmN5IGluamVjdG9yIGZvciBgSHR0cENsaWVudGBcbiAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgSlNPTlAuXG4gKiBXaXRob3V0IHRoaXMgbW9kdWxlLCBKc29ucCByZXF1ZXN0cyByZWFjaCB0aGUgYmFja2VuZFxuICogd2l0aCBtZXRob2QgSlNPTlAsIHdoZXJlIHRoZXkgYXJlIHJlamVjdGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBkZXByZWNhdGVkIGB3aXRoSnNvbnBTdXBwb3J0KClgIGFzIHByb3ZpZGVycyBpbnN0ZWFkXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW3dpdGhKc29ucFN1cHBvcnQoKS7JtXByb3ZpZGVyc10sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRKc29ucE1vZHVsZSB7fVxuIl19