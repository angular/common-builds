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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientXsrfModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientXsrfModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientXsrfModule, providers: [
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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientXsrfModule, decorators: [{
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
export class HttpClientModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientModule, providers: [provideHttpClient(withInterceptorsFromDi())] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientModule, decorators: [{
            type: NgModule,
            args: [{
                    /**
                     * Configures the [dependency injector](guide/glossary#injector) where it is imported
                     * with supporting services for HTTP communications.
                     */
                    providers: [provideHttpClient(withInterceptorsFromDi())],
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
export class HttpClientJsonpModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientJsonpModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientJsonpModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientJsonpModule, providers: [withJsonpSupport().ɵproviders] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.1+sha-d1d9f55", ngImport: i0, type: HttpClientJsonpModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [withJsonpSupport().ɵproviders],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQXNCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEQsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsZ0JBQWdCLEVBQ2hCLG9CQUFvQixFQUNwQixxQkFBcUIsR0FDdEIsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixtQkFBbUIsRUFDbkIsc0JBQXNCLEVBQ3RCLHdCQUF3QixFQUN4Qix3QkFBd0IsRUFDeEIsWUFBWSxHQUNiLE1BQU0sUUFBUSxDQUFDOztBQUVoQjs7Ozs7Ozs7Ozs7R0FXRztBQWFILE1BQU0sT0FBTyxvQkFBb0I7SUFDL0I7O09BRUc7SUFDSCxNQUFNLENBQUMsT0FBTztRQUNaLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsVUFBVSxDQUFDO1NBQy9DLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxXQUFXLENBQ2hCLFVBR0ksRUFBRTtRQUVOLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVO1NBQ3JELENBQUM7SUFDSixDQUFDO3lIQTdCVSxvQkFBb0I7MEhBQXBCLG9CQUFvQjswSEFBcEIsb0JBQW9CLGFBWHBCO1lBQ1QsbUJBQW1CO1lBQ25CLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1lBQzNFLEVBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBQztZQUNwRSxxQkFBcUIsQ0FBQztnQkFDcEIsVUFBVSxFQUFFLHdCQUF3QjtnQkFDcEMsVUFBVSxFQUFFLHdCQUF3QjthQUNyQyxDQUFDLENBQUMsVUFBVTtZQUNiLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1NBQ3hDOztzR0FFVSxvQkFBb0I7a0JBWmhDLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFO3dCQUNULG1CQUFtQjt3QkFDbkIsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7d0JBQzNFLEVBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBQzt3QkFDcEUscUJBQXFCLENBQUM7NEJBQ3BCLFVBQVUsRUFBRSx3QkFBd0I7NEJBQ3BDLFVBQVUsRUFBRSx3QkFBd0I7eUJBQ3JDLENBQUMsQ0FBQyxVQUFVO3dCQUNiLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO3FCQUN4QztpQkFDRjs7QUFpQ0Q7Ozs7Ozs7O0dBUUc7QUFRSCxNQUFNLE9BQU8sZ0JBQWdCO3lIQUFoQixnQkFBZ0I7MEhBQWhCLGdCQUFnQjswSEFBaEIsZ0JBQWdCLGFBRmhCLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDOztzR0FFN0MsZ0JBQWdCO2tCQVA1QixRQUFRO21CQUFDO29CQUNSOzs7dUJBR0c7b0JBQ0gsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO2lCQUN6RDs7QUFHRDs7Ozs7OztHQU9HO0FBSUgsTUFBTSxPQUFPLHFCQUFxQjt5SEFBckIscUJBQXFCOzBIQUFyQixxQkFBcUI7MEhBQXJCLHFCQUFxQixhQUZyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsVUFBVSxDQUFDOztzR0FFL0IscUJBQXFCO2tCQUhqQyxRQUFRO21CQUFDO29CQUNSLFNBQVMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUMsVUFBVSxDQUFDO2lCQUMzQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtIVFRQX0lOVEVSQ0VQVE9SU30gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge1xuICBwcm92aWRlSHR0cENsaWVudCxcbiAgd2l0aEludGVyY2VwdG9yc0Zyb21EaSxcbiAgd2l0aEpzb25wU3VwcG9ydCxcbiAgd2l0aE5vWHNyZlByb3RlY3Rpb24sXG4gIHdpdGhYc3JmQ29uZmlndXJhdGlvbixcbn0gZnJvbSAnLi9wcm92aWRlcic7XG5pbXBvcnQge1xuICBIdHRwWHNyZkNvb2tpZUV4dHJhY3RvcixcbiAgSHR0cFhzcmZJbnRlcmNlcHRvcixcbiAgSHR0cFhzcmZUb2tlbkV4dHJhY3RvcixcbiAgWFNSRl9ERUZBVUxUX0NPT0tJRV9OQU1FLFxuICBYU1JGX0RFRkFVTFRfSEVBREVSX05BTUUsXG4gIFhTUkZfRU5BQkxFRCxcbn0gZnJvbSAnLi94c3JmJztcblxuLyoqXG4gKiBDb25maWd1cmVzIFhTUkYgcHJvdGVjdGlvbiBzdXBwb3J0IGZvciBvdXRnb2luZyByZXF1ZXN0cy5cbiAqXG4gKiBGb3IgYSBzZXJ2ZXIgdGhhdCBzdXBwb3J0cyBhIGNvb2tpZS1iYXNlZCBYU1JGIHByb3RlY3Rpb24gc3lzdGVtLFxuICogdXNlIGRpcmVjdGx5IHRvIGNvbmZpZ3VyZSBYU1JGIHByb3RlY3Rpb24gd2l0aCB0aGUgY29ycmVjdFxuICogY29va2llIGFuZCBoZWFkZXIgbmFtZXMuXG4gKlxuICogSWYgbm8gbmFtZXMgYXJlIHN1cHBsaWVkLCB0aGUgZGVmYXVsdCBjb29raWUgbmFtZSBpcyBgWFNSRi1UT0tFTmBcbiAqIGFuZCB0aGUgZGVmYXVsdCBoZWFkZXIgbmFtZSBpcyBgWC1YU1JGLVRPS0VOYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBYc3JmSW50ZXJjZXB0b3IsXG4gICAge3Byb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLCB1c2VFeGlzdGluZzogSHR0cFhzcmZJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICAgIHdpdGhYc3JmQ29uZmlndXJhdGlvbih7XG4gICAgICBjb29raWVOYW1lOiBYU1JGX0RFRkFVTFRfQ09PS0lFX05BTUUsXG4gICAgICBoZWFkZXJOYW1lOiBYU1JGX0RFRkFVTFRfSEVBREVSX05BTUUsXG4gICAgfSkuybVwcm92aWRlcnMsXG4gICAge3Byb3ZpZGU6IFhTUkZfRU5BQkxFRCwgdXNlVmFsdWU6IHRydWV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50WHNyZk1vZHVsZSB7XG4gIC8qKlxuICAgKiBEaXNhYmxlIHRoZSBkZWZhdWx0IFhTUkYgcHJvdGVjdGlvbi5cbiAgICovXG4gIHN0YXRpYyBkaXNhYmxlKCk6IE1vZHVsZVdpdGhQcm92aWRlcnM8SHR0cENsaWVudFhzcmZNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEh0dHBDbGllbnRYc3JmTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbd2l0aE5vWHNyZlByb3RlY3Rpb24oKS7JtXByb3ZpZGVyc10sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgWFNSRiBwcm90ZWN0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBjYW4gc3BlY2lmeSBlaXRoZXIgb3IgYm90aFxuICAgKiBjb29raWUgbmFtZSBvciBoZWFkZXIgbmFtZS5cbiAgICogLSBDb29raWUgbmFtZSBkZWZhdWx0IGlzIGBYU1JGLVRPS0VOYC5cbiAgICogLSBIZWFkZXIgbmFtZSBkZWZhdWx0IGlzIGBYLVhTUkYtVE9LRU5gLlxuICAgKlxuICAgKi9cbiAgc3RhdGljIHdpdGhPcHRpb25zKFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGNvb2tpZU5hbWU/OiBzdHJpbmc7XG4gICAgICBoZWFkZXJOYW1lPzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKTogTW9kdWxlV2l0aFByb3ZpZGVyczxIdHRwQ2xpZW50WHNyZk1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSHR0cENsaWVudFhzcmZNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IHdpdGhYc3JmQ29uZmlndXJhdGlvbihvcHRpb25zKS7JtXByb3ZpZGVycyxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgW2RlcGVuZGVuY3kgaW5qZWN0b3JdKGd1aWRlL2dsb3NzYXJ5I2luamVjdG9yKSBmb3IgYEh0dHBDbGllbnRgXG4gKiB3aXRoIHN1cHBvcnRpbmcgc2VydmljZXMgZm9yIFhTUkYuIEF1dG9tYXRpY2FsbHkgaW1wb3J0ZWQgYnkgYEh0dHBDbGllbnRNb2R1bGVgLlxuICpcbiAqIFlvdSBjYW4gYWRkIGludGVyY2VwdG9ycyB0byB0aGUgY2hhaW4gYmVoaW5kIGBIdHRwQ2xpZW50YCBieSBiaW5kaW5nIHRoZW0gdG8gdGhlXG4gKiBtdWx0aXByb3ZpZGVyIGZvciBidWlsdC1pbiBbREkgdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuKSBgSFRUUF9JTlRFUkNFUFRPUlNgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIFtkZXBlbmRlbmN5IGluamVjdG9yXShndWlkZS9nbG9zc2FyeSNpbmplY3Rvcikgd2hlcmUgaXQgaXMgaW1wb3J0ZWRcbiAgICogd2l0aCBzdXBwb3J0aW5nIHNlcnZpY2VzIGZvciBIVFRQIGNvbW11bmljYXRpb25zLlxuICAgKi9cbiAgcHJvdmlkZXJzOiBbcHJvdmlkZUh0dHBDbGllbnQod2l0aEludGVyY2VwdG9yc0Zyb21EaSgpKV0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRNb2R1bGUge31cblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBbZGVwZW5kZW5jeSBpbmplY3Rvcl0oZ3VpZGUvZ2xvc3NhcnkjaW5qZWN0b3IpIGZvciBgSHR0cENsaWVudGBcbiAqIHdpdGggc3VwcG9ydGluZyBzZXJ2aWNlcyBmb3IgSlNPTlAuXG4gKiBXaXRob3V0IHRoaXMgbW9kdWxlLCBKc29ucCByZXF1ZXN0cyByZWFjaCB0aGUgYmFja2VuZFxuICogd2l0aCBtZXRob2QgSlNPTlAsIHdoZXJlIHRoZXkgYXJlIHJlamVjdGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbd2l0aEpzb25wU3VwcG9ydCgpLsm1cHJvdmlkZXJzXSxcbn0pXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudEpzb25wTW9kdWxlIHt9XG4iXX0=