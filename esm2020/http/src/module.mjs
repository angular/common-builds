/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from './interceptor';
import { provideHttpClient, withInterceptorsFromDi, withJsonpSupport, withNoXsrfProtection, withXsrfConfiguration } from './provider';
import { HttpXsrfCookieExtractor, HttpXsrfInterceptor, HttpXsrfTokenExtractor, XSRF_DEFAULT_COOKIE_NAME, XSRF_DEFAULT_HEADER_NAME, XSRF_ENABLED } from './xsrf';
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
 */
class HttpClientXsrfModule {
    /**
     * Disable the default XSRF protection.
     */
    static disable() {
        return {
            ngModule: HttpClientXsrfModule,
            providers: [
                withNoXsrfProtection().ɵproviders,
            ],
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
}
HttpClientXsrfModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientXsrfModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
HttpClientXsrfModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientXsrfModule });
HttpClientXsrfModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientXsrfModule, providers: [
        HttpXsrfInterceptor,
        { provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true },
        { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
        withXsrfConfiguration({
            cookieName: XSRF_DEFAULT_COOKIE_NAME,
            headerName: XSRF_DEFAULT_HEADER_NAME,
        }).ɵproviders,
        { provide: XSRF_ENABLED, useValue: true },
    ] });
export { HttpClientXsrfModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientXsrfModule, decorators: [{
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
 * Configures the [dependency injector](guide/glossary#injector) for `HttpClient`
 * with supporting services for XSRF. Automatically imported by `HttpClientModule`.
 *
 * You can add interceptors to the chain behind `HttpClient` by binding them to the
 * multiprovider for built-in [DI token](guide/glossary#di-token) `HTTP_INTERCEPTORS`.
 *
 * @publicApi
 */
class HttpClientModule {
}
HttpClientModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
HttpClientModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientModule });
HttpClientModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientModule, providers: [
        provideHttpClient(withInterceptorsFromDi()),
    ] });
export { HttpClientModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientModule, decorators: [{
            type: NgModule,
            args: [{
                    /**
                     * Configures the [dependency injector](guide/glossary#injector) where it is imported
                     * with supporting services for HTTP communications.
                     */
                    providers: [
                        provideHttpClient(withInterceptorsFromDi()),
                    ],
                }]
        }] });
/**
 * Configures the [dependency injector](guide/glossary#injector) for `HttpClient`
 * with supporting services for JSONP.
 * Without this module, Jsonp requests reach the backend
 * with method JSONP, where they are rejected.
 *
 * @publicApi
 */
class HttpClientJsonpModule {
}
HttpClientJsonpModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientJsonpModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
HttpClientJsonpModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientJsonpModule });
HttpClientJsonpModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientJsonpModule, providers: [
        withJsonpSupport().ɵproviders,
    ] });
export { HttpClientJsonpModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.3+sha-0851bd5", ngImport: i0, type: HttpClientJsonpModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        withJsonpSupport().ɵproviders,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQXNCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLHNCQUFzQixFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLHFCQUFxQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3BJLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxzQkFBc0IsRUFBRSx3QkFBd0IsRUFBRSx3QkFBd0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRTlKOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFZYSxvQkFBb0I7SUFDL0I7O09BRUc7SUFDSCxNQUFNLENBQUMsT0FBTztRQUNaLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRTtnQkFDVCxvQkFBb0IsRUFBRSxDQUFDLFVBQVU7YUFDbEM7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBR2YsRUFBRTtRQUNKLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVO1NBQ3JELENBQUM7SUFDSixDQUFDOzs0SEE3QlUsb0JBQW9COzZIQUFwQixvQkFBb0I7NkhBQXBCLG9CQUFvQixhQVhwQjtRQUNULG1CQUFtQjtRQUNuQixFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztRQUMzRSxFQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUM7UUFDcEUscUJBQXFCLENBQUM7WUFDcEIsVUFBVSxFQUFFLHdCQUF3QjtZQUNwQyxVQUFVLEVBQUUsd0JBQXdCO1NBQ3JDLENBQUMsQ0FBQyxVQUFVO1FBQ2IsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7S0FDeEM7U0FFVSxvQkFBb0I7c0dBQXBCLG9CQUFvQjtrQkFaaEMsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUU7d0JBQ1QsbUJBQW1CO3dCQUNuQixFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQzt3QkFDM0UsRUFBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFDO3dCQUNwRSxxQkFBcUIsQ0FBQzs0QkFDcEIsVUFBVSxFQUFFLHdCQUF3Qjs0QkFDcEMsVUFBVSxFQUFFLHdCQUF3Qjt5QkFDckMsQ0FBQyxDQUFDLFVBQVU7d0JBQ2IsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7cUJBQ3hDO2lCQUNGOztBQWlDRDs7Ozs7Ozs7R0FRRztBQUNILE1BU2EsZ0JBQWdCOzt3SEFBaEIsZ0JBQWdCO3lIQUFoQixnQkFBZ0I7eUhBQWhCLGdCQUFnQixhQUpoQjtRQUNULGlCQUFpQixDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDNUM7U0FFVSxnQkFBZ0I7c0dBQWhCLGdCQUFnQjtrQkFUNUIsUUFBUTttQkFBQztvQkFDUjs7O3VCQUdHO29CQUNILFNBQVMsRUFBRTt3QkFDVCxpQkFBaUIsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO3FCQUM1QztpQkFDRjs7QUFJRDs7Ozs7OztHQU9HO0FBQ0gsTUFLYSxxQkFBcUI7OzZIQUFyQixxQkFBcUI7OEhBQXJCLHFCQUFxQjs4SEFBckIscUJBQXFCLGFBSnJCO1FBQ1QsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVO0tBQzlCO1NBRVUscUJBQXFCO3NHQUFyQixxQkFBcUI7a0JBTGpDLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFO3dCQUNULGdCQUFnQixFQUFFLENBQUMsVUFBVTtxQkFDOUI7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SFRUUF9JTlRFUkNFUFRPUlN9IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtwcm92aWRlSHR0cENsaWVudCwgd2l0aEludGVyY2VwdG9yc0Zyb21EaSwgd2l0aEpzb25wU3VwcG9ydCwgd2l0aE5vWHNyZlByb3RlY3Rpb24sIHdpdGhYc3JmQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9wcm92aWRlcic7XG5pbXBvcnQge0h0dHBYc3JmQ29va2llRXh0cmFjdG9yLCBIdHRwWHNyZkludGVyY2VwdG9yLCBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCBYU1JGX0RFRkFVTFRfQ09PS0lFX05BTUUsIFhTUkZfREVGQVVMVF9IRUFERVJfTkFNRSwgWFNSRl9FTkFCTEVEfSBmcm9tICcuL3hzcmYnO1xuXG4vKipcbiAqIENvbmZpZ3VyZXMgWFNSRiBwcm90ZWN0aW9uIHN1cHBvcnQgZm9yIG91dGdvaW5nIHJlcXVlc3RzLlxuICpcbiAqIEZvciBhIHNlcnZlciB0aGF0IHN1cHBvcnRzIGEgY29va2llLWJhc2VkIFhTUkYgcHJvdGVjdGlvbiBzeXN0ZW0sXG4gKiB1c2UgZGlyZWN0bHkgdG8gY29uZmlndXJlIFhTUkYgcHJvdGVjdGlvbiB3aXRoIHRoZSBjb3JyZWN0XG4gKiBjb29raWUgYW5kIGhlYWRlciBuYW1lcy5cbiAqXG4gKiBJZiBubyBuYW1lcyBhcmUgc3VwcGxpZWQsIHRoZSBkZWZhdWx0IGNvb2tpZSBuYW1lIGlzIGBYU1JGLVRPS0VOYFxuICogYW5kIHRoZSBkZWZhdWx0IGhlYWRlciBuYW1lIGlzIGBYLVhTUkYtVE9LRU5gLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgSHR0cFhzcmZJbnRlcmNlcHRvcixcbiAgICB7cHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsIHVzZUV4aXN0aW5nOiBIdHRwWHNyZkludGVyY2VwdG9yLCBtdWx0aTogdHJ1ZX0sXG4gICAge3Byb3ZpZGU6IEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsIHVzZUNsYXNzOiBIdHRwWHNyZkNvb2tpZUV4dHJhY3Rvcn0sXG4gICAgd2l0aFhzcmZDb25maWd1cmF0aW9uKHtcbiAgICAgIGNvb2tpZU5hbWU6IFhTUkZfREVGQVVMVF9DT09LSUVfTkFNRSxcbiAgICAgIGhlYWRlck5hbWU6IFhTUkZfREVGQVVMVF9IRUFERVJfTkFNRSxcbiAgICB9KS7JtXByb3ZpZGVycyxcbiAgICB7cHJvdmlkZTogWFNSRl9FTkFCTEVELCB1c2VWYWx1ZTogdHJ1ZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRYc3JmTW9kdWxlIHtcbiAgLyoqXG4gICAqIERpc2FibGUgdGhlIGRlZmF1bHQgWFNSRiBwcm90ZWN0aW9uLlxuICAgKi9cbiAgc3RhdGljIGRpc2FibGUoKTogTW9kdWxlV2l0aFByb3ZpZGVyczxIdHRwQ2xpZW50WHNyZk1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgd2l0aE5vWHNyZlByb3RlY3Rpb24oKS7JtXByb3ZpZGVycyxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBjYW4gc3BlY2lmeSBlaXRoZXIgb3IgYm90aFxuICAgKiBjb29raWUgbmFtZSBvciBoZWFkZXIgbmFtZS5cbiAgICogLSBDb29raWUgbmFtZSBkZWZhdWx0IGlzIGBYU1JGLVRPS0VOYC5cbiAgICogLSBIZWFkZXIgbmFtZSBkZWZhdWx0IGlzIGBYLVhTUkYtVE9LRU5gLlxuICAgKlxuICAgKi9cbiAgc3RhdGljIHdpdGhPcHRpb25zKG9wdGlvbnM6IHtcbiAgICBjb29raWVOYW1lPzogc3RyaW5nLFxuICAgIGhlYWRlck5hbWU/OiBzdHJpbmcsXG4gIH0gPSB7fSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8SHR0cENsaWVudFhzcmZNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiB3aXRoWHNyZkNvbmZpZ3VyYXRpb24ob3B0aW9ucykuybVwcm92aWRlcnMsXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIFtkZXBlbmRlbmN5IGluamVjdG9yXShndWlkZS9nbG9zc2FyeSNpbmplY3RvcikgZm9yIGBIdHRwQ2xpZW50YFxuICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBYU1JGLiBBdXRvbWF0aWNhbGx5IGltcG9ydGVkIGJ5IGBIdHRwQ2xpZW50TW9kdWxlYC5cbiAqXG4gKiBZb3UgY2FuIGFkZCBpbnRlcmNlcHRvcnMgdG8gdGhlIGNoYWluIGJlaGluZCBgSHR0cENsaWVudGAgYnkgYmluZGluZyB0aGVtIHRvIHRoZVxuICogbXVsdGlwcm92aWRlciBmb3IgYnVpbHQtaW4gW0RJIHRva2VuXShndWlkZS9nbG9zc2FyeSNkaS10b2tlbikgYEhUVFBfSU5URVJDRVBUT1JTYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBbZGVwZW5kZW5jeSBpbmplY3Rvcl0oZ3VpZGUvZ2xvc3NhcnkjaW5qZWN0b3IpIHdoZXJlIGl0IGlzIGltcG9ydGVkXG4gICAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgSFRUUCBjb21tdW5pY2F0aW9ucy5cbiAgICovXG4gIHByb3ZpZGVyczogW1xuICAgIHByb3ZpZGVIdHRwQ2xpZW50KHdpdGhJbnRlcmNlcHRvcnNGcm9tRGkoKSksXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRNb2R1bGUge1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIFtkZXBlbmRlbmN5IGluamVjdG9yXShndWlkZS9nbG9zc2FyeSNpbmplY3RvcikgZm9yIGBIdHRwQ2xpZW50YFxuICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBKU09OUC5cbiAqIFdpdGhvdXQgdGhpcyBtb2R1bGUsIEpzb25wIHJlcXVlc3RzIHJlYWNoIHRoZSBiYWNrZW5kXG4gKiB3aXRoIG1ldGhvZCBKU09OUCwgd2hlcmUgdGhleSBhcmUgcmVqZWN0ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICB3aXRoSnNvbnBTdXBwb3J0KCkuybVwcm92aWRlcnMsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRKc29ucE1vZHVsZSB7XG59XG4iXX0=