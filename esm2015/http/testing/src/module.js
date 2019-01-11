import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpTestingController } from './api';
import { HttpClientTestingBackend } from './backend';
import * as i0 from "@angular/core";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Configures `HttpClientTestingBackend` as the `HttpBackend` used by `HttpClient`.
 *
 * Inject `HttpTestingController` to expect and flush requests in your tests.
 *
 * \@publicApi
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
HttpClientTestingModule.ngInjectorDef = i0.defineInjector({ factory: function HttpClientTestingModule_Factory(t) { return new (t || HttpClientTestingModule)(); }, providers: [
        HttpClientTestingBackend,
        { provide: HttpBackend, useExisting: HttpClientTestingBackend },
        { provide: HttpTestingController, useExisting: HttpClientTestingBackend },
    ], imports: [[
            HttpClientModule,
        ]] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvdGVzdGluZy9zcmMvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM1QyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JuRCxNQUFNLE9BQU8sdUJBQXVCOzs7WUFWbkMsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxnQkFBZ0I7aUJBQ2pCO2dCQUNELFNBQVMsRUFBRTtvQkFDVCx3QkFBd0I7b0JBQ3hCLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUM7b0JBQzdELEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQztpQkFDeEU7YUFDRjs7aUVBQ1ksdUJBQXVCLDZDQVJoQyxnQkFBZ0I7b0lBUVAsdUJBQXVCLG1CQU52QjtRQUNULHdCQUF3QjtRQUN4QixFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO1FBQzdELEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQztLQUN4RSxZQVBRO1lBQ1AsZ0JBQWdCO1NBQ2pCO21DQU9VLHVCQUF1QjtjQVZuQyxRQUFRO2VBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLGdCQUFnQjtpQkFDakI7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULHdCQUF3QjtvQkFDeEIsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQztvQkFDN0QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDO2lCQUN4RTthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwQ2xpZW50TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtIdHRwVGVzdGluZ0NvbnRyb2xsZXJ9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7SHR0cENsaWVudFRlc3RpbmdCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQnO1xuXG5cbi8qKlxuICogQ29uZmlndXJlcyBgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kYCBhcyB0aGUgYEh0dHBCYWNrZW5kYCB1c2VkIGJ5IGBIdHRwQ2xpZW50YC5cbiAqXG4gKiBJbmplY3QgYEh0dHBUZXN0aW5nQ29udHJvbGxlcmAgdG8gZXhwZWN0IGFuZCBmbHVzaCByZXF1ZXN0cyBpbiB5b3VyIHRlc3RzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRNb2R1bGUsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZCxcbiAgICB7cHJvdmlkZTogSHR0cEJhY2tlbmQsIHVzZUV4aXN0aW5nOiBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9LFxuICAgIHtwcm92aWRlOiBIdHRwVGVzdGluZ0NvbnRyb2xsZXIsIHVzZUV4aXN0aW5nOiBIdHRwQ2xpZW50VGVzdGluZ0JhY2tlbmR9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50VGVzdGluZ01vZHVsZSB7XG59XG4iXX0=