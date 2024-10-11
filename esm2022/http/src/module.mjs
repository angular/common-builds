/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientXsrfModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientXsrfModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientXsrfModule, providers: [
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientXsrfModule, decorators: [{
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientModule, providers: [provideHttpClient(withInterceptorsFromDi())] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientModule, decorators: [{
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientJsonpModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientJsonpModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientJsonpModule, providers: [withJsonpSupport().ɵproviders] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8+sha-d9bb74f", ngImport: i0, type: HttpClientJsonpModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [withJsonpSupport().ɵproviders],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQXNCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEQsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsZ0JBQWdCLEVBQ2hCLG9CQUFvQixFQUNwQixxQkFBcUIsR0FDdEIsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixtQkFBbUIsRUFDbkIsc0JBQXNCLEVBQ3RCLHdCQUF3QixFQUN4Qix3QkFBd0IsRUFDeEIsWUFBWSxHQUNiLE1BQU0sUUFBUSxDQUFDOztBQUVoQjs7Ozs7Ozs7Ozs7OztHQWFHO0FBYUgsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQjs7T0FFRztJQUNILE1BQU0sQ0FBQyxPQUFPO1FBQ1osT0FBTztZQUNMLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsU0FBUyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxVQUFVLENBQUM7U0FDL0MsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FDaEIsVUFHSSxFQUFFO1FBRU4sT0FBTztZQUNMLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsU0FBUyxFQUFFLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVU7U0FDckQsQ0FBQztJQUNKLENBQUM7eUhBN0JVLG9CQUFvQjswSEFBcEIsb0JBQW9COzBIQUFwQixvQkFBb0IsYUFYcEI7WUFDVCxtQkFBbUI7WUFDbkIsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7WUFDM0UsRUFBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFDO1lBQ3BFLHFCQUFxQixDQUFDO2dCQUNwQixVQUFVLEVBQUUsd0JBQXdCO2dCQUNwQyxVQUFVLEVBQUUsd0JBQXdCO2FBQ3JDLENBQUMsQ0FBQyxVQUFVO1lBQ2IsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7U0FDeEM7O3NHQUVVLG9CQUFvQjtrQkFaaEMsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUU7d0JBQ1QsbUJBQW1CO3dCQUNuQixFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQzt3QkFDM0UsRUFBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFDO3dCQUNwRSxxQkFBcUIsQ0FBQzs0QkFDcEIsVUFBVSxFQUFFLHdCQUF3Qjs0QkFDcEMsVUFBVSxFQUFFLHdCQUF3Qjt5QkFDckMsQ0FBQyxDQUFDLFVBQVU7d0JBQ2IsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7cUJBQ3hDO2lCQUNGOztBQWlDRDs7Ozs7Ozs7O0dBU0c7QUFRSCxNQUFNLE9BQU8sZ0JBQWdCO3lIQUFoQixnQkFBZ0I7MEhBQWhCLGdCQUFnQjswSEFBaEIsZ0JBQWdCLGFBRmhCLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDOztzR0FFN0MsZ0JBQWdCO2tCQVA1QixRQUFRO21CQUFDO29CQUNSOzs7dUJBR0c7b0JBQ0gsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO2lCQUN6RDs7QUFHRDs7Ozs7Ozs7R0FRRztBQUlILE1BQU0sT0FBTyxxQkFBcUI7eUhBQXJCLHFCQUFxQjswSEFBckIscUJBQXFCOzBIQUFyQixxQkFBcUIsYUFGckIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFVBQVUsQ0FBQzs7c0dBRS9CLHFCQUFxQjtrQkFIakMsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFVBQVUsQ0FBQztpQkFDM0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7TW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0hUVFBfSU5URVJDRVBUT1JTfSBmcm9tICcuL2ludGVyY2VwdG9yJztcbmltcG9ydCB7XG4gIHByb3ZpZGVIdHRwQ2xpZW50LFxuICB3aXRoSW50ZXJjZXB0b3JzRnJvbURpLFxuICB3aXRoSnNvbnBTdXBwb3J0LFxuICB3aXRoTm9Yc3JmUHJvdGVjdGlvbixcbiAgd2l0aFhzcmZDb25maWd1cmF0aW9uLFxufSBmcm9tICcuL3Byb3ZpZGVyJztcbmltcG9ydCB7XG4gIEh0dHBYc3JmQ29va2llRXh0cmFjdG9yLFxuICBIdHRwWHNyZkludGVyY2VwdG9yLFxuICBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLFxuICBYU1JGX0RFRkFVTFRfQ09PS0lFX05BTUUsXG4gIFhTUkZfREVGQVVMVF9IRUFERVJfTkFNRSxcbiAgWFNSRl9FTkFCTEVELFxufSBmcm9tICcuL3hzcmYnO1xuXG4vKipcbiAqIENvbmZpZ3VyZXMgWFNSRiBwcm90ZWN0aW9uIHN1cHBvcnQgZm9yIG91dGdvaW5nIHJlcXVlc3RzLlxuICpcbiAqIEZvciBhIHNlcnZlciB0aGF0IHN1cHBvcnRzIGEgY29va2llLWJhc2VkIFhTUkYgcHJvdGVjdGlvbiBzeXN0ZW0sXG4gKiB1c2UgZGlyZWN0bHkgdG8gY29uZmlndXJlIFhTUkYgcHJvdGVjdGlvbiB3aXRoIHRoZSBjb3JyZWN0XG4gKiBjb29raWUgYW5kIGhlYWRlciBuYW1lcy5cbiAqXG4gKiBJZiBubyBuYW1lcyBhcmUgc3VwcGxpZWQsIHRoZSBkZWZhdWx0IGNvb2tpZSBuYW1lIGlzIGBYU1JGLVRPS0VOYFxuICogYW5kIHRoZSBkZWZhdWx0IGhlYWRlciBuYW1lIGlzIGBYLVhTUkYtVE9LRU5gLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBkZXByZWNhdGVkIFVzZSB3aXRoWHNyZkNvbmZpZ3VyYXRpb24oe2Nvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJywgaGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTid9KSBhc1xuICogICAgIHByb3ZpZGVycyBpbnN0ZWFkIG9yIGB3aXRoTm9Yc3JmUHJvdGVjdGlvbmAgaWYgeW91IHdhbnQgdG8gZGlzYWJsZWQgWFNSRiBwcm90ZWN0aW9uLlxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBIdHRwWHNyZkludGVyY2VwdG9yLFxuICAgIHtwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUywgdXNlRXhpc3Rpbmc6IEh0dHBYc3JmSW50ZXJjZXB0b3IsIG11bHRpOiB0cnVlfSxcbiAgICB7cHJvdmlkZTogSHR0cFhzcmZUb2tlbkV4dHJhY3RvciwgdXNlQ2xhc3M6IEh0dHBYc3JmQ29va2llRXh0cmFjdG9yfSxcbiAgICB3aXRoWHNyZkNvbmZpZ3VyYXRpb24oe1xuICAgICAgY29va2llTmFtZTogWFNSRl9ERUZBVUxUX0NPT0tJRV9OQU1FLFxuICAgICAgaGVhZGVyTmFtZTogWFNSRl9ERUZBVUxUX0hFQURFUl9OQU1FLFxuICAgIH0pLsm1cHJvdmlkZXJzLFxuICAgIHtwcm92aWRlOiBYU1JGX0VOQUJMRUQsIHVzZVZhbHVlOiB0cnVlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudFhzcmZNb2R1bGUge1xuICAvKipcbiAgICogRGlzYWJsZSB0aGUgZGVmYXVsdCBYU1JGIHByb3RlY3Rpb24uXG4gICAqL1xuICBzdGF0aWMgZGlzYWJsZSgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEh0dHBDbGllbnRYc3JmTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBIdHRwQ2xpZW50WHNyZk1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW3dpdGhOb1hzcmZQcm90ZWN0aW9uKCkuybVwcm92aWRlcnNdLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIFhTUkYgcHJvdGVjdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgY2FuIHNwZWNpZnkgZWl0aGVyIG9yIGJvdGhcbiAgICogY29va2llIG5hbWUgb3IgaGVhZGVyIG5hbWUuXG4gICAqIC0gQ29va2llIG5hbWUgZGVmYXVsdCBpcyBgWFNSRi1UT0tFTmAuXG4gICAqIC0gSGVhZGVyIG5hbWUgZGVmYXVsdCBpcyBgWC1YU1JGLVRPS0VOYC5cbiAgICpcbiAgICovXG4gIHN0YXRpYyB3aXRoT3B0aW9ucyhcbiAgICBvcHRpb25zOiB7XG4gICAgICBjb29raWVOYW1lPzogc3RyaW5nO1xuICAgICAgaGVhZGVyTmFtZT86IHN0cmluZztcbiAgICB9ID0ge30sXG4gICk6IE1vZHVsZVdpdGhQcm92aWRlcnM8SHR0cENsaWVudFhzcmZNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiB3aXRoWHNyZkNvbmZpZ3VyYXRpb24ob3B0aW9ucykuybVwcm92aWRlcnMsXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIGRlcGVuZGVuY3kgaW5qZWN0b3IgZm9yIGBIdHRwQ2xpZW50YFxuICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBYU1JGLiBBdXRvbWF0aWNhbGx5IGltcG9ydGVkIGJ5IGBIdHRwQ2xpZW50TW9kdWxlYC5cbiAqXG4gKiBZb3UgY2FuIGFkZCBpbnRlcmNlcHRvcnMgdG8gdGhlIGNoYWluIGJlaGluZCBgSHR0cENsaWVudGAgYnkgYmluZGluZyB0aGVtIHRvIHRoZVxuICogbXVsdGlwcm92aWRlciBmb3IgYnVpbHQtaW4gREkgdG9rZW4gYEhUVFBfSU5URVJDRVBUT1JTYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGVwcmVjYXRlZCB1c2UgYHByb3ZpZGVIdHRwQ2xpZW50KHdpdGhJbnRlcmNlcHRvcnNGcm9tRGkoKSlgIGFzIHByb3ZpZGVycyBpbnN0ZWFkXG4gKi9cbkBOZ01vZHVsZSh7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBkZXBlbmRlbmN5IGluamVjdG9yIHdoZXJlIGl0IGlzIGltcG9ydGVkXG4gICAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgSFRUUCBjb21tdW5pY2F0aW9ucy5cbiAgICovXG4gIHByb3ZpZGVyczogW3Byb3ZpZGVIdHRwQ2xpZW50KHdpdGhJbnRlcmNlcHRvcnNGcm9tRGkoKSldLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50TW9kdWxlIHt9XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgZGVwZW5kZW5jeSBpbmplY3RvciBmb3IgYEh0dHBDbGllbnRgXG4gKiB3aXRoIHN1cHBvcnRpbmcgc2VydmljZXMgZm9yIEpTT05QLlxuICogV2l0aG91dCB0aGlzIG1vZHVsZSwgSnNvbnAgcmVxdWVzdHMgcmVhY2ggdGhlIGJhY2tlbmRcbiAqIHdpdGggbWV0aG9kIEpTT05QLCB3aGVyZSB0aGV5IGFyZSByZWplY3RlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGVwcmVjYXRlZCBgd2l0aEpzb25wU3VwcG9ydCgpYCBhcyBwcm92aWRlcnMgaW5zdGVhZFxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFt3aXRoSnNvbnBTdXBwb3J0KCkuybVwcm92aWRlcnNdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50SnNvbnBNb2R1bGUge31cbiJdfQ==