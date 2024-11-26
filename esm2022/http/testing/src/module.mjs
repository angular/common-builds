/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { provideHttpClientTesting } from './provider';
import * as i0 from "@angular/core";
/**
 * Configures `HttpClientTestingBackend` as the `HttpBackend` used by `HttpClient`.
 *
 * Inject `HttpTestingController` to expect and flush requests in your tests.
 *
 * @publicApi
 *
 * @deprecated Add `provideHttpClientTesting()` to your providers instead.
 */
export class HttpClientTestingModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13+sha-e1e419a", ngImport: i0, type: HttpClientTestingModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13+sha-e1e419a", ngImport: i0, type: HttpClientTestingModule, imports: [HttpClientModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13+sha-e1e419a", ngImport: i0, type: HttpClientTestingModule, providers: [provideHttpClientTesting()], imports: [HttpClientModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13+sha-e1e419a", ngImport: i0, type: HttpClientTestingModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [HttpClientModule],
                    providers: [provideHttpClientTesting()],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvdGVzdGluZy9zcmMvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sWUFBWSxDQUFDOztBQUVwRDs7Ozs7Ozs7R0FRRztBQUtILE1BQU0sT0FBTyx1QkFBdUI7eUhBQXZCLHVCQUF1QjswSEFBdkIsdUJBQXVCLFlBSHhCLGdCQUFnQjswSEFHZix1QkFBdUIsYUFGdkIsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLFlBRDdCLGdCQUFnQjs7c0dBR2YsdUJBQXVCO2tCQUpuQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO29CQUMzQixTQUFTLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2lCQUN4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwQ2xpZW50TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtwcm92aWRlSHR0cENsaWVudFRlc3Rpbmd9IGZyb20gJy4vcHJvdmlkZXInO1xuXG4vKipcbiAqIENvbmZpZ3VyZXMgYEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZGAgYXMgdGhlIGBIdHRwQmFja2VuZGAgdXNlZCBieSBgSHR0cENsaWVudGAuXG4gKlxuICogSW5qZWN0IGBIdHRwVGVzdGluZ0NvbnRyb2xsZXJgIHRvIGV4cGVjdCBhbmQgZmx1c2ggcmVxdWVzdHMgaW4geW91ciB0ZXN0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgQWRkIGBwcm92aWRlSHR0cENsaWVudFRlc3RpbmcoKWAgdG8geW91ciBwcm92aWRlcnMgaW5zdGVhZC5cbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0h0dHBDbGllbnRNb2R1bGVdLFxuICBwcm92aWRlcnM6IFtwcm92aWRlSHR0cENsaWVudFRlc3RpbmcoKV0sXG59KVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRUZXN0aW5nTW9kdWxlIHt9XG4iXX0=