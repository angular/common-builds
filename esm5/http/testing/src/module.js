import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
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
 *
 */
var HttpClientTestingModule = /** @class */ (function () {
    function HttpClientTestingModule() {
    }
    HttpClientTestingModule.ngModuleDef = i0.ɵdefineNgModule({ type: HttpClientTestingModule, bootstrap: [], declarations: [], imports: [i1.HttpClientModule], exports: [] });
    HttpClientTestingModule.ngInjectorDef = i0.defineInjector({ factory: function HttpClientTestingModule_Factory() { return new HttpClientTestingModule(); }, providers: [
            HttpClientTestingBackend,
            { provide: HttpBackend, useExisting: HttpClientTestingBackend },
            { provide: HttpTestingController, useExisting: HttpClientTestingBackend },
        ], imports: [i1.HttpClientModule] });
    return HttpClientTestingModule;
}());
export { HttpClientTestingModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvdGVzdGluZy9zcmMvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25FLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzVDLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUduRDs7Ozs7O0dBTUc7QUFDSDtJQUFBO0tBV0M7cUVBRFksdUJBQXVCO2lJQUF2Qix1QkFBdUIsa0JBTnZCO1lBQ1Qsd0JBQXdCO1lBQ3hCLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUM7WUFDN0QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO1NBQ3hFO2tDQTlCSDtDQWlDQyxBQVhELElBV0M7U0FEWSx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBDbGllbnRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0h0dHBUZXN0aW5nQ29udHJvbGxlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5cblxuLyoqXG4gKiBDb25maWd1cmVzIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIGFzIHRoZSBgSHR0cEJhY2tlbmRgIHVzZWQgYnkgYEh0dHBDbGllbnRgLlxuICpcbiAqIEluamVjdCBgSHR0cFRlc3RpbmdDb250cm9sbGVyYCB0byBleHBlY3QgYW5kIGZsdXNoIHJlcXVlc3RzIGluIHlvdXIgdGVzdHMuXG4gKlxuICpcbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRNb2R1bGUsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZCxcbiAgICB7cHJvdmlkZTogSHR0cEJhY2tlbmQsIHVzZUV4aXN0aW5nOiBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9LFxuICAgIHtwcm92aWRlOiBIdHRwVGVzdGluZ0NvbnRyb2xsZXIsIHVzZUV4aXN0aW5nOiBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50VGVzdGluZ01vZHVsZSB7XG59XG4iXX0=