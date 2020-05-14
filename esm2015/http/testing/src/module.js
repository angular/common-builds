/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/http/testing/src/module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpTestingController } from './api';
import { HttpClientTestingBackend } from './backend';
/**
 * Configures `HttpClientTestingBackend` as the `HttpBackend` used by `HttpClient`.
 *
 * Inject `HttpTestingController` to expect and flush requests in your tests.
 *
 * \@publicApi
 */
let HttpClientTestingModule = /** @class */ (() => {
    /**
     * Configures `HttpClientTestingBackend` as the `HttpBackend` used by `HttpClient`.
     *
     * Inject `HttpTestingController` to expect and flush requests in your tests.
     *
     * \@publicApi
     */
    class HttpClientTestingModule {
    }
    HttpClientTestingModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        HttpClientModule,
                    ],
                    providers: [
                        HttpClientTestingBackend,
                        { provide: HttpBackend, useExisting: HttpClientTestingBackend },
                        { provide: HttpTestingController, useExisting: HttpClientTestingBackend },
                    ],
                },] }
    ];
    return HttpClientTestingModule;
})();
export { HttpClientTestingModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvdGVzdGluZy9zcmMvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM1QyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxXQUFXLENBQUM7Ozs7Ozs7O0FBVW5EOzs7Ozs7OztJQUFBLE1BVWEsdUJBQXVCOzs7Z0JBVm5DLFFBQVEsU0FBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsZ0JBQWdCO3FCQUNqQjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1Qsd0JBQXdCO3dCQUN4QixFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO3dCQUM3RCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUM7cUJBQ3hFO2lCQUNGOztJQUVELDhCQUFDO0tBQUE7U0FEWSx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBDbGllbnRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0h0dHBUZXN0aW5nQ29udHJvbGxlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5cblxuLyoqXG4gKiBDb25maWd1cmVzIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIGFzIHRoZSBgSHR0cEJhY2tlbmRgIHVzZWQgYnkgYEh0dHBDbGllbnRgLlxuICpcbiAqIEluamVjdCBgSHR0cFRlc3RpbmdDb250cm9sbGVyYCB0byBleHBlY3QgYW5kIGZsdXNoIHJlcXVlc3RzIGluIHlvdXIgdGVzdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudE1vZHVsZSxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBIdHRwQmFja2VuZCwgdXNlRXhpc3Rpbmc6IEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZH0sXG4gICAge3Byb3ZpZGU6IEh0dHBUZXN0aW5nQ29udHJvbGxlciwgdXNlRXhpc3Rpbmc6IEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRUZXN0aW5nTW9kdWxlIHtcbn1cbiJdfQ==