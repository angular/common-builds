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
import * as i0 from "@angular/core";
/**
 * Configures `HttpClientTestingBackend` as the `HttpBackend` used by `HttpClient`.
 *
 * Inject `HttpTestingController` to expect and flush requests in your tests.
 *
 * @publicApi
 */
var HttpClientTestingModule = /** @class */ (function () {
    function HttpClientTestingModule() {
    }
    HttpClientTestingModule.ngModuleDef = i0.ɵdefineNgModule({ type: HttpClientTestingModule, imports: [HttpClientModule] });
    HttpClientTestingModule.ngInjectorDef = i0.defineInjector({ factory: function HttpClientTestingModule_Factory(t) { return new (t || HttpClientTestingModule)(); }, providers: [
            HttpClientTestingBackend,
            { provide: HttpBackend, useExisting: HttpClientTestingBackend },
            { provide: HttpTestingController, useExisting: HttpClientTestingBackend },
        ], imports: [[
                HttpClientModule,
            ]] });
    return HttpClientTestingModule;
}());
export { HttpClientTestingModule };
/*@__PURE__*/ i0.ɵsetClassMetadata(HttpClientTestingModule, [{
        type: NgModule,
        args: [{
                imports: [
                    HttpClientModule,
                ],
                providers: [
                    HttpClientTestingBackend,
                    { provide: HttpBackend, useExisting: HttpClientTestingBackend },
                    { provide: HttpTestingController, useExisting: HttpClientTestingBackend },
                ],
            }]
    }], null, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvdGVzdGluZy9zcmMvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM1QyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxXQUFXLENBQUM7O0FBR25EOzs7Ozs7R0FNRztBQUNIO0lBQUE7S0FXQztxRUFEWSx1QkFBdUIsWUFSaEMsZ0JBQWdCO3dJQVFQLHVCQUF1QixtQkFOdkI7WUFDVCx3QkFBd0I7WUFDeEIsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQztZQUM3RCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUM7U0FDeEUsWUFQUTtnQkFDUCxnQkFBZ0I7YUFDakI7a0NBekJIO0NBaUNDLEFBWEQsSUFXQztTQURZLHVCQUF1QjttQ0FBdkIsdUJBQXVCO2NBVm5DLFFBQVE7ZUFBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsZ0JBQWdCO2lCQUNqQjtnQkFDRCxTQUFTLEVBQUU7b0JBQ1Qsd0JBQXdCO29CQUN4QixFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO29CQUM3RCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUM7aUJBQ3hFO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBDbGllbnRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0h0dHBUZXN0aW5nQ29udHJvbGxlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5cblxuLyoqXG4gKiBDb25maWd1cmVzIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIGFzIHRoZSBgSHR0cEJhY2tlbmRgIHVzZWQgYnkgYEh0dHBDbGllbnRgLlxuICpcbiAqIEluamVjdCBgSHR0cFRlc3RpbmdDb250cm9sbGVyYCB0byBleHBlY3QgYW5kIGZsdXNoIHJlcXVlc3RzIGluIHlvdXIgdGVzdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudE1vZHVsZSxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBIdHRwQmFja2VuZCwgdXNlRXhpc3Rpbmc6IEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZH0sXG4gICAge3Byb3ZpZGU6IEh0dHBUZXN0aW5nQ29udHJvbGxlciwgdXNlRXhpc3Rpbmc6IEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRUZXN0aW5nTW9kdWxlIHtcbn1cbiJdfQ==