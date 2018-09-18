import * as i0 from "@angular/core";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
 *
 */
export class HttpClientTestingModule {
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
            },] },
];
HttpClientTestingModule.ngModuleDef = i0.ɵdefineNgModule({ type: HttpClientTestingModule, bootstrap: [], declarations: [], imports: [HttpClientModule], exports: [] });
HttpClientTestingModule.ngInjectorDef = i0.defineInjector({ factory: function HttpClientTestingModule_Factory() { return new HttpClientTestingModule(); }, providers: [
        HttpClientTestingBackend,
        { provide: HttpBackend, useExisting: HttpClientTestingBackend },
        { provide: HttpTestingController, useExisting: HttpClientTestingBackend },
    ], imports: [[
            HttpClientModule,
        ]] });

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvdGVzdGluZy9zcmMvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM1QyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxXQUFXLENBQUM7Ozs7Ozs7O0FBb0JuRCxNQUFNOzs7WUFWTCxRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLGdCQUFnQjtpQkFDakI7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULHdCQUF3QjtvQkFDeEIsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQztvQkFDN0QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO2lCQUN4RTthQUNGOztpRUFDWSx1QkFBdUIsNkNBUmhDLGdCQUFnQjs2SEFRUCx1QkFBdUIsa0JBTnZCO1FBQ1Qsd0JBQXdCO1FBQ3hCLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUM7UUFDN0QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO0tBQ3hFLFlBUFE7WUFDUCxnQkFBZ0I7U0FDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBDbGllbnRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0h0dHBUZXN0aW5nQ29udHJvbGxlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5cblxuLyoqXG4gKiBDb25maWd1cmVzIGBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmRgIGFzIHRoZSBgSHR0cEJhY2tlbmRgIHVzZWQgYnkgYEh0dHBDbGllbnRgLlxuICpcbiAqIEluamVjdCBgSHR0cFRlc3RpbmdDb250cm9sbGVyYCB0byBleHBlY3QgYW5kIGZsdXNoIHJlcXVlc3RzIGluIHlvdXIgdGVzdHMuXG4gKlxuICpcbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRNb2R1bGUsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZCxcbiAgICB7cHJvdmlkZTogSHR0cEJhY2tlbmQsIHVzZUV4aXN0aW5nOiBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9LFxuICAgIHtwcm92aWRlOiBIdHRwVGVzdGluZ0NvbnRyb2xsZXIsIHVzZUV4aXN0aW5nOiBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50VGVzdGluZ01vZHVsZSB7XG59XG4iXX0=