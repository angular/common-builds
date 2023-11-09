/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { HttpBackend, HttpHandler } from './backend';
import { HttpClient } from './client';
import { FetchBackend } from './fetch';
import { HTTP_INTERCEPTOR_FNS, HttpInterceptorHandler, legacyInterceptorFnFactory, PRIMARY_HTTP_BACKEND } from './interceptor';
import { jsonpCallbackContext, JsonpCallbackContext, JsonpClientBackend, jsonpInterceptorFn } from './jsonp';
import { HttpXhrBackend } from './xhr';
import { HttpXsrfCookieExtractor, HttpXsrfTokenExtractor, XSRF_COOKIE_NAME, XSRF_ENABLED, XSRF_HEADER_NAME, xsrfInterceptorFn } from './xsrf';
/**
 * Identifies a particular kind of `HttpFeature`.
 *
 * @publicApi
 */
export var HttpFeatureKind;
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
        ɵproviders: providers,
    };
}
/**
 * Configures Angular's `HttpClient` service to be available for injection.
 *
 * By default, `HttpClient` will be configured for injection with its default options for XSRF
 * protection of outgoing requests. Additional configuration options can be provided by passing
 * feature functions to `provideHttpClient`. For example, HTTP interceptors can be added using the
 * `withInterceptors(...)` feature.
 *
 * <div class="alert is-helpful">
 *
 * It's strongly recommended to enable
 * [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for applications that use
 * Server-Side Rendering for better performance and compatibility. To enable `fetch`, add
 * `withFetch()` feature to the `provideHttpClient()` call at the root of the application:
 *
 * ```
 * provideHttpClient(withFetch());
 * ```
 *
 * </div>
 *
 * @see {@link withInterceptors}
 * @see {@link withInterceptorsFromDi}
 * @see {@link withXsrfConfiguration}
 * @see {@link withNoXsrfProtection}
 * @see {@link withJsonpSupport}
 * @see {@link withRequestsMadeViaParent}
 * @see {@link withFetch}
 */
export function provideHttpClient(...features) {
    if (ngDevMode) {
        const featureKinds = new Set(features.map(f => f.ɵkind));
        if (featureKinds.has(HttpFeatureKind.NoXsrfProtection) &&
            featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)) {
            throw new Error(ngDevMode ?
                `Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() in the same call to provideHttpClient(), which is a contradiction.` :
                '');
        }
    }
    const providers = [
        HttpClient,
        HttpXhrBackend,
        HttpInterceptorHandler,
        { provide: HttpHandler, useExisting: HttpInterceptorHandler },
        { provide: HttpBackend, useExisting: HttpXhrBackend },
        {
            provide: HTTP_INTERCEPTOR_FNS,
            useValue: xsrfInterceptorFn,
            multi: true,
        },
        { provide: XSRF_ENABLED, useValue: true },
        { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
    ];
    for (const feature of features) {
        providers.push(...feature.ɵproviders);
    }
    return makeEnvironmentProviders(providers);
}
/**
 * Adds one or more functional-style HTTP interceptors to the configuration of the `HttpClient`
 * instance.
 *
 * @see {@link HttpInterceptorFn}
 * @see {@link provideHttpClient}
 * @publicApi
 */
export function withInterceptors(interceptorFns) {
    return makeHttpFeature(HttpFeatureKind.Interceptors, interceptorFns.map(interceptorFn => {
        return {
            provide: HTTP_INTERCEPTOR_FNS,
            useValue: interceptorFn,
            multi: true,
        };
    }));
}
const LEGACY_INTERCEPTOR_FN = new InjectionToken('LEGACY_INTERCEPTOR_FN');
/**
 * Includes class-based interceptors configured using a multi-provider in the current injector into
 * the configured `HttpClient` instance.
 *
 * Prefer `withInterceptors` and functional interceptors instead, as support for DI-provided
 * interceptors may be phased out in a later release.
 *
 * @see {@link HttpInterceptor}
 * @see {@link HTTP_INTERCEPTORS}
 * @see {@link provideHttpClient}
 */
export function withInterceptorsFromDi() {
    // Note: the legacy interceptor function is provided here via an intermediate token
    // (`LEGACY_INTERCEPTOR_FN`), using a pattern which guarantees that if these providers are
    // included multiple times, all of the multi-provider entries will have the same instance of the
    // interceptor function. That way, the `HttpINterceptorHandler` will dedup them and legacy
    // interceptors will not run multiple times.
    return makeHttpFeature(HttpFeatureKind.LegacyInterceptors, [
        {
            provide: LEGACY_INTERCEPTOR_FN,
            useFactory: legacyInterceptorFnFactory,
        },
        {
            provide: HTTP_INTERCEPTOR_FNS,
            useExisting: LEGACY_INTERCEPTOR_FN,
            multi: true,
        }
    ]);
}
/**
 * Customizes the XSRF protection for the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withNoXsrfProtection` feature.
 *
 * @see {@link provideHttpClient}
 */
export function withXsrfConfiguration({ cookieName, headerName }) {
    const providers = [];
    if (cookieName !== undefined) {
        providers.push({ provide: XSRF_COOKIE_NAME, useValue: cookieName });
    }
    if (headerName !== undefined) {
        providers.push({ provide: XSRF_HEADER_NAME, useValue: headerName });
    }
    return makeHttpFeature(HttpFeatureKind.CustomXsrfConfiguration, providers);
}
/**
 * Disables XSRF protection in the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withXsrfConfiguration` feature.
 *
 * @see {@link provideHttpClient}
 */
export function withNoXsrfProtection() {
    return makeHttpFeature(HttpFeatureKind.NoXsrfProtection, [
        {
            provide: XSRF_ENABLED,
            useValue: false,
        },
    ]);
}
/**
 * Add JSONP support to the configuration of the current `HttpClient` instance.
 *
 * @see {@link provideHttpClient}
 */
export function withJsonpSupport() {
    return makeHttpFeature(HttpFeatureKind.JsonpSupport, [
        JsonpClientBackend,
        { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
        { provide: HTTP_INTERCEPTOR_FNS, useValue: jsonpInterceptorFn, multi: true },
    ]);
}
/**
 * Configures the current `HttpClient` instance to make requests via the parent injector's
 * `HttpClient` instead of directly.
 *
 * By default, `provideHttpClient` configures `HttpClient` in its injector to be an independent
 * instance. For example, even if `HttpClient` is configured in the parent injector with
 * one or more interceptors, they will not intercept requests made via this instance.
 *
 * With this option enabled, once the request has passed through the current injector's
 * interceptors, it will be delegated to the parent injector's `HttpClient` chain instead of
 * dispatched directly, and interceptors in the parent configuration will be applied to the request.
 *
 * If there are several `HttpClient` instances in the injector hierarchy, it's possible for
 * `withRequestsMadeViaParent` to be used at multiple levels, which will cause the request to
 * "bubble up" until either reaching the root level or an `HttpClient` which was not configured with
 * this option.
 *
 * @see {@link provideHttpClient}
 * @developerPreview
 */
export function withRequestsMadeViaParent() {
    return makeHttpFeature(HttpFeatureKind.RequestsMadeViaParent, [
        {
            provide: HttpBackend,
            useFactory: () => {
                const handlerFromParent = inject(HttpHandler, { skipSelf: true, optional: true });
                if (ngDevMode && handlerFromParent === null) {
                    throw new Error('withRequestsMadeViaParent() can only be used when the parent injector also configures HttpClient');
                }
                return handlerFromParent;
            },
        },
    ]);
}
/**
 * Configures the current `HttpClient` instance to make requests using the fetch API.
 *
 * This `FetchBackend` requires the support of the Fetch API which is available on all evergreen
 * browsers and on NodeJS from v18 onward.
 *
 * Note: The Fetch API doesn't support progress report on uploads.
 *
 * @publicApi
 */
export function withFetch() {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && typeof fetch !== 'function') {
        // TODO: Create a runtime error
        // TODO: Use ENVIRONMENT_INITIALIZER to contextualize the error message (browser or server)
        throw new Error('The `withFetch` feature of HttpClient requires the `fetch` API to be available. ' +
            'If you run the code in a Node environment, make sure you use Node v18.10 or later.');
    }
    return makeHttpFeature(HttpFeatureKind.Fetch, [
        FetchBackend,
        { provide: HttpBackend, useExisting: FetchBackend },
        { provide: PRIMARY_HTTP_BACKEND, useExisting: FetchBackend },
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUF1QixNQUFNLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFXLE1BQU0sZUFBZSxDQUFDO0FBRS9HLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ25ELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNyQyxPQUFPLEVBQUMsb0JBQW9CLEVBQXFCLHNCQUFzQixFQUFFLDBCQUEwQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2hKLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUMzRyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ3JDLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUk7Ozs7R0FJRztBQUNILE1BQU0sQ0FBTixJQUFZLGVBUVg7QUFSRCxXQUFZLGVBQWU7SUFDekIscUVBQVksQ0FBQTtJQUNaLGlGQUFrQixDQUFBO0lBQ2xCLDJGQUF1QixDQUFBO0lBQ3ZCLDZFQUFnQixDQUFBO0lBQ2hCLHFFQUFZLENBQUE7SUFDWix1RkFBcUIsQ0FBQTtJQUNyQix1REFBSyxDQUFBO0FBQ1AsQ0FBQyxFQVJXLGVBQWUsS0FBZixlQUFlLFFBUTFCO0FBWUQsU0FBUyxlQUFlLENBQ3BCLElBQVcsRUFBRSxT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U0FBUyxJQUFJLGlCQUFpQixLQUFLLElBQUksRUFBRSxDQUFDO29CQUM1QyxNQUFNLElBQUksS0FBSyxDQUNYLGtHQUFrRyxDQUFDLENBQUM7Z0JBQzFHLENBQUM7Z0JBQ0QsT0FBTyxpQkFBaUIsQ0FBQztZQUMzQixDQUFDO1NBQ0Y7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDO0FBR0Q7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLFNBQVM7SUFDdkIsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNuRiwrQkFBK0I7UUFDL0IsMkZBQTJGO1FBQzNGLE1BQU0sSUFBSSxLQUFLLENBQ1gsa0ZBQWtGO1lBQ2xGLG9GQUFvRixDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUVELE9BQU8sZUFBZSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUU7UUFDNUMsWUFBWTtRQUNaLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFDO1FBQ2pELEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUM7S0FDM0QsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Vudmlyb25tZW50UHJvdmlkZXJzLCBpbmplY3QsIEluamVjdGlvblRva2VuLCBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnMsIFByb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBDbGllbnR9IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7RmV0Y2hCYWNrZW5kfSBmcm9tICcuL2ZldGNoJztcbmltcG9ydCB7SFRUUF9JTlRFUkNFUFRPUl9GTlMsIEh0dHBJbnRlcmNlcHRvckZuLCBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyLCBsZWdhY3lJbnRlcmNlcHRvckZuRmFjdG9yeSwgUFJJTUFSWV9IVFRQX0JBQ0tFTkR9IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtqc29ucENhbGxiYWNrQ29udGV4dCwgSnNvbnBDYWxsYmFja0NvbnRleHQsIEpzb25wQ2xpZW50QmFja2VuZCwganNvbnBJbnRlcmNlcHRvckZufSBmcm9tICcuL2pzb25wJztcbmltcG9ydCB7SHR0cFhockJhY2tlbmR9IGZyb20gJy4veGhyJztcbmltcG9ydCB7SHR0cFhzcmZDb29raWVFeHRyYWN0b3IsIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsIFhTUkZfQ09PS0lFX05BTUUsIFhTUkZfRU5BQkxFRCwgWFNSRl9IRUFERVJfTkFNRSwgeHNyZkludGVyY2VwdG9yRm59IGZyb20gJy4veHNyZic7XG5cbi8qKlxuICogSWRlbnRpZmllcyBhIHBhcnRpY3VsYXIga2luZCBvZiBgSHR0cEZlYXR1cmVgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gSHR0cEZlYXR1cmVLaW5kIHtcbiAgSW50ZXJjZXB0b3JzLFxuICBMZWdhY3lJbnRlcmNlcHRvcnMsXG4gIEN1c3RvbVhzcmZDb25maWd1cmF0aW9uLFxuICBOb1hzcmZQcm90ZWN0aW9uLFxuICBKc29ucFN1cHBvcnQsXG4gIFJlcXVlc3RzTWFkZVZpYVBhcmVudCxcbiAgRmV0Y2gsXG59XG5cbi8qKlxuICogQSBmZWF0dXJlIGZvciB1c2Ugd2hlbiBjb25maWd1cmluZyBgcHJvdmlkZUh0dHBDbGllbnRgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwRmVhdHVyZTxLaW5kVCBleHRlbmRzIEh0dHBGZWF0dXJlS2luZD4ge1xuICDJtWtpbmQ6IEtpbmRUO1xuICDJtXByb3ZpZGVyczogUHJvdmlkZXJbXTtcbn1cblxuZnVuY3Rpb24gbWFrZUh0dHBGZWF0dXJlPEtpbmRUIGV4dGVuZHMgSHR0cEZlYXR1cmVLaW5kPihcbiAgICBraW5kOiBLaW5kVCwgcHJvdmlkZXJzOiBQcm92aWRlcltdKTogSHR0cEZlYXR1cmU8S2luZFQ+IHtcbiAgcmV0dXJuIHtcbiAgICDJtWtpbmQ6IGtpbmQsXG4gICAgybVwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgfTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIEFuZ3VsYXIncyBgSHR0cENsaWVudGAgc2VydmljZSB0byBiZSBhdmFpbGFibGUgZm9yIGluamVjdGlvbi5cbiAqXG4gKiBCeSBkZWZhdWx0LCBgSHR0cENsaWVudGAgd2lsbCBiZSBjb25maWd1cmVkIGZvciBpbmplY3Rpb24gd2l0aCBpdHMgZGVmYXVsdCBvcHRpb25zIGZvciBYU1JGXG4gKiBwcm90ZWN0aW9uIG9mIG91dGdvaW5nIHJlcXVlc3RzLiBBZGRpdGlvbmFsIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBjYW4gYmUgcHJvdmlkZWQgYnkgcGFzc2luZ1xuICogZmVhdHVyZSBmdW5jdGlvbnMgdG8gYHByb3ZpZGVIdHRwQ2xpZW50YC4gRm9yIGV4YW1wbGUsIEhUVFAgaW50ZXJjZXB0b3JzIGNhbiBiZSBhZGRlZCB1c2luZyB0aGVcbiAqIGB3aXRoSW50ZXJjZXB0b3JzKC4uLilgIGZlYXR1cmUuXG4gKlxuICogPGRpdiBjbGFzcz1cImFsZXJ0IGlzLWhlbHBmdWxcIj5cbiAqXG4gKiBJdCdzIHN0cm9uZ2x5IHJlY29tbWVuZGVkIHRvIGVuYWJsZVxuICogW2BmZXRjaGBdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9GZXRjaF9BUEkpIGZvciBhcHBsaWNhdGlvbnMgdGhhdCB1c2VcbiAqIFNlcnZlci1TaWRlIFJlbmRlcmluZyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCBjb21wYXRpYmlsaXR5LiBUbyBlbmFibGUgYGZldGNoYCwgYWRkXG4gKiBgd2l0aEZldGNoKClgIGZlYXR1cmUgdG8gdGhlIGBwcm92aWRlSHR0cENsaWVudCgpYCBjYWxsIGF0IHRoZSByb290IG9mIHRoZSBhcHBsaWNhdGlvbjpcbiAqXG4gKiBgYGBcbiAqIHByb3ZpZGVIdHRwQ2xpZW50KHdpdGhGZXRjaCgpKTtcbiAqIGBgYFxuICpcbiAqIDwvZGl2PlxuICpcbiAqIEBzZWUge0BsaW5rIHdpdGhJbnRlcmNlcHRvcnN9XG4gKiBAc2VlIHtAbGluayB3aXRoSW50ZXJjZXB0b3JzRnJvbURpfVxuICogQHNlZSB7QGxpbmsgd2l0aFhzcmZDb25maWd1cmF0aW9ufVxuICogQHNlZSB7QGxpbmsgd2l0aE5vWHNyZlByb3RlY3Rpb259XG4gKiBAc2VlIHtAbGluayB3aXRoSnNvbnBTdXBwb3J0fVxuICogQHNlZSB7QGxpbmsgd2l0aFJlcXVlc3RzTWFkZVZpYVBhcmVudH1cbiAqIEBzZWUge0BsaW5rIHdpdGhGZXRjaH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVIdHRwQ2xpZW50KC4uLmZlYXR1cmVzOiBIdHRwRmVhdHVyZTxIdHRwRmVhdHVyZUtpbmQ+W10pOlxuICAgIEVudmlyb25tZW50UHJvdmlkZXJzIHtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGNvbnN0IGZlYXR1cmVLaW5kcyA9IG5ldyBTZXQoZmVhdHVyZXMubWFwKGYgPT4gZi7JtWtpbmQpKTtcbiAgICBpZiAoZmVhdHVyZUtpbmRzLmhhcyhIdHRwRmVhdHVyZUtpbmQuTm9Yc3JmUHJvdGVjdGlvbikgJiZcbiAgICAgICAgZmVhdHVyZUtpbmRzLmhhcyhIdHRwRmVhdHVyZUtpbmQuQ3VzdG9tWHNyZkNvbmZpZ3VyYXRpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgbmdEZXZNb2RlID9cbiAgICAgICAgICAgICAgYENvbmZpZ3VyYXRpb24gZXJyb3I6IGZvdW5kIGJvdGggd2l0aFhzcmZDb25maWd1cmF0aW9uKCkgYW5kIHdpdGhOb1hzcmZQcm90ZWN0aW9uKCkgaW4gdGhlIHNhbWUgY2FsbCB0byBwcm92aWRlSHR0cENsaWVudCgpLCB3aGljaCBpcyBhIGNvbnRyYWRpY3Rpb24uYCA6XG4gICAgICAgICAgICAgICcnKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbXG4gICAgSHR0cENsaWVudCxcbiAgICBIdHRwWGhyQmFja2VuZCxcbiAgICBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyLFxuICAgIHtwcm92aWRlOiBIdHRwSGFuZGxlciwgdXNlRXhpc3Rpbmc6IEh0dHBJbnRlcmNlcHRvckhhbmRsZXJ9LFxuICAgIHtwcm92aWRlOiBIdHRwQmFja2VuZCwgdXNlRXhpc3Rpbmc6IEh0dHBYaHJCYWNrZW5kfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SX0ZOUyxcbiAgICAgIHVzZVZhbHVlOiB4c3JmSW50ZXJjZXB0b3JGbixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gICAge3Byb3ZpZGU6IFhTUkZfRU5BQkxFRCwgdXNlVmFsdWU6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICBdO1xuXG4gIGZvciAoY29uc3QgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgIHByb3ZpZGVycy5wdXNoKC4uLmZlYXR1cmUuybVwcm92aWRlcnMpO1xuICB9XG5cbiAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEFkZHMgb25lIG9yIG1vcmUgZnVuY3Rpb25hbC1zdHlsZSBIVFRQIGludGVyY2VwdG9ycyB0byB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgYEh0dHBDbGllbnRgXG4gKiBpbnN0YW5jZS5cbiAqXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3JGbn1cbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVIdHRwQ2xpZW50fVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEludGVyY2VwdG9ycyhpbnRlcmNlcHRvckZuczogSHR0cEludGVyY2VwdG9yRm5bXSk6XG4gICAgSHR0cEZlYXR1cmU8SHR0cEZlYXR1cmVLaW5kLkludGVyY2VwdG9ycz4ge1xuICByZXR1cm4gbWFrZUh0dHBGZWF0dXJlKEh0dHBGZWF0dXJlS2luZC5JbnRlcmNlcHRvcnMsIGludGVyY2VwdG9yRm5zLm1hcChpbnRlcmNlcHRvckZuID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUl9GTlMsXG4gICAgICB1c2VWYWx1ZTogaW50ZXJjZXB0b3JGbixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH07XG4gIH0pKTtcbn1cblxuY29uc3QgTEVHQUNZX0lOVEVSQ0VQVE9SX0ZOID0gbmV3IEluamVjdGlvblRva2VuPEh0dHBJbnRlcmNlcHRvckZuPignTEVHQUNZX0lOVEVSQ0VQVE9SX0ZOJyk7XG5cbi8qKlxuICogSW5jbHVkZXMgY2xhc3MtYmFzZWQgaW50ZXJjZXB0b3JzIGNvbmZpZ3VyZWQgdXNpbmcgYSBtdWx0aS1wcm92aWRlciBpbiB0aGUgY3VycmVudCBpbmplY3RvciBpbnRvXG4gKiB0aGUgY29uZmlndXJlZCBgSHR0cENsaWVudGAgaW5zdGFuY2UuXG4gKlxuICogUHJlZmVyIGB3aXRoSW50ZXJjZXB0b3JzYCBhbmQgZnVuY3Rpb25hbCBpbnRlcmNlcHRvcnMgaW5zdGVhZCwgYXMgc3VwcG9ydCBmb3IgREktcHJvdmlkZWRcbiAqIGludGVyY2VwdG9ycyBtYXkgYmUgcGhhc2VkIG91dCBpbiBhIGxhdGVyIHJlbGVhc2UuXG4gKlxuICogQHNlZSB7QGxpbmsgSHR0cEludGVyY2VwdG9yfVxuICogQHNlZSB7QGxpbmsgSFRUUF9JTlRFUkNFUFRPUlN9XG4gKiBAc2VlIHtAbGluayBwcm92aWRlSHR0cENsaWVudH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJbnRlcmNlcHRvcnNGcm9tRGkoKTogSHR0cEZlYXR1cmU8SHR0cEZlYXR1cmVLaW5kLkxlZ2FjeUludGVyY2VwdG9ycz4ge1xuICAvLyBOb3RlOiB0aGUgbGVnYWN5IGludGVyY2VwdG9yIGZ1bmN0aW9uIGlzIHByb3ZpZGVkIGhlcmUgdmlhIGFuIGludGVybWVkaWF0ZSB0b2tlblxuICAvLyAoYExFR0FDWV9JTlRFUkNFUFRPUl9GTmApLCB1c2luZyBhIHBhdHRlcm4gd2hpY2ggZ3VhcmFudGVlcyB0aGF0IGlmIHRoZXNlIHByb3ZpZGVycyBhcmVcbiAgLy8gaW5jbHVkZWQgbXVsdGlwbGUgdGltZXMsIGFsbCBvZiB0aGUgbXVsdGktcHJvdmlkZXIgZW50cmllcyB3aWxsIGhhdmUgdGhlIHNhbWUgaW5zdGFuY2Ugb2YgdGhlXG4gIC8vIGludGVyY2VwdG9yIGZ1bmN0aW9uLiBUaGF0IHdheSwgdGhlIGBIdHRwSU50ZXJjZXB0b3JIYW5kbGVyYCB3aWxsIGRlZHVwIHRoZW0gYW5kIGxlZ2FjeVxuICAvLyBpbnRlcmNlcHRvcnMgd2lsbCBub3QgcnVuIG11bHRpcGxlIHRpbWVzLlxuICByZXR1cm4gbWFrZUh0dHBGZWF0dXJlKEh0dHBGZWF0dXJlS2luZC5MZWdhY3lJbnRlcmNlcHRvcnMsIFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBMRUdBQ1lfSU5URVJDRVBUT1JfRk4sXG4gICAgICB1c2VGYWN0b3J5OiBsZWdhY3lJbnRlcmNlcHRvckZuRmFjdG9yeSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JfRk5TLFxuICAgICAgdXNlRXhpc3Rpbmc6IExFR0FDWV9JTlRFUkNFUFRPUl9GTixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH1cbiAgXSk7XG59XG5cbi8qKlxuICogQ3VzdG9taXplcyB0aGUgWFNSRiBwcm90ZWN0aW9uIGZvciB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UuXG4gKlxuICogVGhpcyBmZWF0dXJlIGlzIGluY29tcGF0aWJsZSB3aXRoIHRoZSBgd2l0aE5vWHNyZlByb3RlY3Rpb25gIGZlYXR1cmUuXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZUh0dHBDbGllbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoWHNyZkNvbmZpZ3VyYXRpb24oXG4gICAge2Nvb2tpZU5hbWUsIGhlYWRlck5hbWV9OiB7Y29va2llTmFtZT86IHN0cmluZywgaGVhZGVyTmFtZT86IHN0cmluZ30pOlxuICAgIEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZC5DdXN0b21Yc3JmQ29uZmlndXJhdGlvbj4ge1xuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbXTtcbiAgaWYgKGNvb2tpZU5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogY29va2llTmFtZX0pO1xuICB9XG4gIGlmIChoZWFkZXJOYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6IGhlYWRlck5hbWV9KTtcbiAgfVxuXG4gIHJldHVybiBtYWtlSHR0cEZlYXR1cmUoSHR0cEZlYXR1cmVLaW5kLkN1c3RvbVhzcmZDb25maWd1cmF0aW9uLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIERpc2FibGVzIFhTUkYgcHJvdGVjdGlvbiBpbiB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UuXG4gKlxuICogVGhpcyBmZWF0dXJlIGlzIGluY29tcGF0aWJsZSB3aXRoIHRoZSBgd2l0aFhzcmZDb25maWd1cmF0aW9uYCBmZWF0dXJlLlxuICpcbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVIdHRwQ2xpZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aE5vWHNyZlByb3RlY3Rpb24oKTogSHR0cEZlYXR1cmU8SHR0cEZlYXR1cmVLaW5kLk5vWHNyZlByb3RlY3Rpb24+IHtcbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuTm9Yc3JmUHJvdGVjdGlvbiwgW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IFhTUkZfRU5BQkxFRCxcbiAgICAgIHVzZVZhbHVlOiBmYWxzZSxcbiAgICB9LFxuICBdKTtcbn1cblxuLyoqXG4gKiBBZGQgSlNPTlAgc3VwcG9ydCB0byB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UuXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZUh0dHBDbGllbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSnNvbnBTdXBwb3J0KCk6IEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZC5Kc29ucFN1cHBvcnQ+IHtcbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuSnNvbnBTdXBwb3J0LCBbXG4gICAgSnNvbnBDbGllbnRCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBKc29ucENhbGxiYWNrQ29udGV4dCwgdXNlRmFjdG9yeToganNvbnBDYWxsYmFja0NvbnRleHR9LFxuICAgIHtwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SX0ZOUywgdXNlVmFsdWU6IGpzb25wSW50ZXJjZXB0b3JGbiwgbXVsdGk6IHRydWV9LFxuICBdKTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBjdXJyZW50IGBIdHRwQ2xpZW50YCBpbnN0YW5jZSB0byBtYWtlIHJlcXVlc3RzIHZpYSB0aGUgcGFyZW50IGluamVjdG9yJ3NcbiAqIGBIdHRwQ2xpZW50YCBpbnN0ZWFkIG9mIGRpcmVjdGx5LlxuICpcbiAqIEJ5IGRlZmF1bHQsIGBwcm92aWRlSHR0cENsaWVudGAgY29uZmlndXJlcyBgSHR0cENsaWVudGAgaW4gaXRzIGluamVjdG9yIHRvIGJlIGFuIGluZGVwZW5kZW50XG4gKiBpbnN0YW5jZS4gRm9yIGV4YW1wbGUsIGV2ZW4gaWYgYEh0dHBDbGllbnRgIGlzIGNvbmZpZ3VyZWQgaW4gdGhlIHBhcmVudCBpbmplY3RvciB3aXRoXG4gKiBvbmUgb3IgbW9yZSBpbnRlcmNlcHRvcnMsIHRoZXkgd2lsbCBub3QgaW50ZXJjZXB0IHJlcXVlc3RzIG1hZGUgdmlhIHRoaXMgaW5zdGFuY2UuXG4gKlxuICogV2l0aCB0aGlzIG9wdGlvbiBlbmFibGVkLCBvbmNlIHRoZSByZXF1ZXN0IGhhcyBwYXNzZWQgdGhyb3VnaCB0aGUgY3VycmVudCBpbmplY3RvcidzXG4gKiBpbnRlcmNlcHRvcnMsIGl0IHdpbGwgYmUgZGVsZWdhdGVkIHRvIHRoZSBwYXJlbnQgaW5qZWN0b3IncyBgSHR0cENsaWVudGAgY2hhaW4gaW5zdGVhZCBvZlxuICogZGlzcGF0Y2hlZCBkaXJlY3RseSwgYW5kIGludGVyY2VwdG9ycyBpbiB0aGUgcGFyZW50IGNvbmZpZ3VyYXRpb24gd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSByZXF1ZXN0LlxuICpcbiAqIElmIHRoZXJlIGFyZSBzZXZlcmFsIGBIdHRwQ2xpZW50YCBpbnN0YW5jZXMgaW4gdGhlIGluamVjdG9yIGhpZXJhcmNoeSwgaXQncyBwb3NzaWJsZSBmb3JcbiAqIGB3aXRoUmVxdWVzdHNNYWRlVmlhUGFyZW50YCB0byBiZSB1c2VkIGF0IG11bHRpcGxlIGxldmVscywgd2hpY2ggd2lsbCBjYXVzZSB0aGUgcmVxdWVzdCB0b1xuICogXCJidWJibGUgdXBcIiB1bnRpbCBlaXRoZXIgcmVhY2hpbmcgdGhlIHJvb3QgbGV2ZWwgb3IgYW4gYEh0dHBDbGllbnRgIHdoaWNoIHdhcyBub3QgY29uZmlndXJlZCB3aXRoXG4gKiB0aGlzIG9wdGlvbi5cbiAqXG4gKiBAc2VlIHtAbGluayBwcm92aWRlSHR0cENsaWVudH1cbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoUmVxdWVzdHNNYWRlVmlhUGFyZW50KCk6IEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZC5SZXF1ZXN0c01hZGVWaWFQYXJlbnQ+IHtcbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuUmVxdWVzdHNNYWRlVmlhUGFyZW50LCBbXG4gICAge1xuICAgICAgcHJvdmlkZTogSHR0cEJhY2tlbmQsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJGcm9tUGFyZW50ID0gaW5qZWN0KEh0dHBIYW5kbGVyLCB7c2tpcFNlbGY6IHRydWUsIG9wdGlvbmFsOiB0cnVlfSk7XG4gICAgICAgIGlmIChuZ0Rldk1vZGUgJiYgaGFuZGxlckZyb21QYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICd3aXRoUmVxdWVzdHNNYWRlVmlhUGFyZW50KCkgY2FuIG9ubHkgYmUgdXNlZCB3aGVuIHRoZSBwYXJlbnQgaW5qZWN0b3IgYWxzbyBjb25maWd1cmVzIEh0dHBDbGllbnQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFuZGxlckZyb21QYXJlbnQ7XG4gICAgICB9LFxuICAgIH0sXG4gIF0pO1xufVxuXG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UgdG8gbWFrZSByZXF1ZXN0cyB1c2luZyB0aGUgZmV0Y2ggQVBJLlxuICpcbiAqIFRoaXMgYEZldGNoQmFja2VuZGAgcmVxdWlyZXMgdGhlIHN1cHBvcnQgb2YgdGhlIEZldGNoIEFQSSB3aGljaCBpcyBhdmFpbGFibGUgb24gYWxsIGV2ZXJncmVlblxuICogYnJvd3NlcnMgYW5kIG9uIE5vZGVKUyBmcm9tIHYxOCBvbndhcmQuXG4gKlxuICogTm90ZTogVGhlIEZldGNoIEFQSSBkb2Vzbid0IHN1cHBvcnQgcHJvZ3Jlc3MgcmVwb3J0IG9uIHVwbG9hZHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEZldGNoKCk6IEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZC5GZXRjaD4ge1xuICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgdHlwZW9mIGZldGNoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gVE9ETzogQ3JlYXRlIGEgcnVudGltZSBlcnJvclxuICAgIC8vIFRPRE86IFVzZSBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUiB0byBjb250ZXh0dWFsaXplIHRoZSBlcnJvciBtZXNzYWdlIChicm93c2VyIG9yIHNlcnZlcilcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdUaGUgYHdpdGhGZXRjaGAgZmVhdHVyZSBvZiBIdHRwQ2xpZW50IHJlcXVpcmVzIHRoZSBgZmV0Y2hgIEFQSSB0byBiZSBhdmFpbGFibGUuICcgK1xuICAgICAgICAnSWYgeW91IHJ1biB0aGUgY29kZSBpbiBhIE5vZGUgZW52aXJvbm1lbnQsIG1ha2Ugc3VyZSB5b3UgdXNlIE5vZGUgdjE4LjEwIG9yIGxhdGVyLicpO1xuICB9XG5cbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuRmV0Y2gsIFtcbiAgICBGZXRjaEJhY2tlbmQsXG4gICAge3Byb3ZpZGU6IEh0dHBCYWNrZW5kLCB1c2VFeGlzdGluZzogRmV0Y2hCYWNrZW5kfSxcbiAgICB7cHJvdmlkZTogUFJJTUFSWV9IVFRQX0JBQ0tFTkQsIHVzZUV4aXN0aW5nOiBGZXRjaEJhY2tlbmR9LFxuICBdKTtcbn1cbiJdfQ==