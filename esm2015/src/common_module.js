/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { COMMON_DIRECTIVES } from './directives/index';
import { NgLocaleLocalization, NgLocalization } from './i18n/localization';
import { COMMON_PIPES } from './pipes/index';
// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * Exports all the basic Angular directives and pipes,
 * such as `NgIf`, `NgForOf`, `DecimalPipe`, and so on.
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command.
 *
 * * The `providers` options configure the NgModule's injector to provide
 * localization dependencies to members.
 * * The `exports` options make the declared directives and pipes available for import
 * by other NgModules.
 *
 * @publicApi
 */
let CommonModule = /** @class */ (() => {
    let CommonModule = class CommonModule {
    };
    CommonModule = __decorate([
        NgModule({
            declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
            exports: [COMMON_DIRECTIVES, COMMON_PIPES],
            providers: [
                { provide: NgLocalization, useClass: NgLocaleLocalization },
            ],
        })
    ], CommonModule);
    return CommonModule;
})();
export { CommonModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvY29tbW9uX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUczQyxzREFBc0Q7QUFDdEQsK0RBQStEO0FBQy9EOzs7Ozs7Ozs7Ozs7R0FZRztBQVFIO0lBQUEsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtLQUN4QixDQUFBO0lBRFksWUFBWTtRQVB4QixRQUFRLENBQUM7WUFDUixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7WUFDL0MsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO1lBQzFDLFNBQVMsRUFBRTtnQkFDVCxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFDO2FBQzFEO1NBQ0YsQ0FBQztPQUNXLFlBQVksQ0FDeEI7SUFBRCxtQkFBQztLQUFBO1NBRFksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q09NTU9OX0RJUkVDVElWRVN9IGZyb20gJy4vZGlyZWN0aXZlcy9pbmRleCc7XG5pbXBvcnQge05nTG9jYWxlTG9jYWxpemF0aW9uLCBOZ0xvY2FsaXphdGlvbn0gZnJvbSAnLi9pMThuL2xvY2FsaXphdGlvbic7XG5pbXBvcnQge0NPTU1PTl9QSVBFU30gZnJvbSAnLi9waXBlcy9pbmRleCc7XG5cblxuLy8gTm90ZTogVGhpcyBkb2VzIG5vdCBjb250YWluIHRoZSBsb2NhdGlvbiBwcm92aWRlcnMsXG4vLyBhcyB0aGV5IG5lZWQgc29tZSBwbGF0Zm9ybSBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbnMgdG8gd29yay5cbi8qKlxuICogRXhwb3J0cyBhbGwgdGhlIGJhc2ljIEFuZ3VsYXIgZGlyZWN0aXZlcyBhbmQgcGlwZXMsXG4gKiBzdWNoIGFzIGBOZ0lmYCwgYE5nRm9yT2ZgLCBgRGVjaW1hbFBpcGVgLCBhbmQgc28gb24uXG4gKiBSZS1leHBvcnRlZCBieSBgQnJvd3Nlck1vZHVsZWAsIHdoaWNoIGlzIGluY2x1ZGVkIGF1dG9tYXRpY2FsbHkgaW4gdGhlIHJvb3RcbiAqIGBBcHBNb2R1bGVgIHdoZW4geW91IGNyZWF0ZSBhIG5ldyBhcHAgd2l0aCB0aGUgQ0xJIGBuZXdgIGNvbW1hbmQuXG4gKlxuICogKiBUaGUgYHByb3ZpZGVyc2Agb3B0aW9ucyBjb25maWd1cmUgdGhlIE5nTW9kdWxlJ3MgaW5qZWN0b3IgdG8gcHJvdmlkZVxuICogbG9jYWxpemF0aW9uIGRlcGVuZGVuY2llcyB0byBtZW1iZXJzLlxuICogKiBUaGUgYGV4cG9ydHNgIG9wdGlvbnMgbWFrZSB0aGUgZGVjbGFyZWQgZGlyZWN0aXZlcyBhbmQgcGlwZXMgYXZhaWxhYmxlIGZvciBpbXBvcnRcbiAqIGJ5IG90aGVyIE5nTW9kdWxlcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW0NPTU1PTl9ESVJFQ1RJVkVTLCBDT01NT05fUElQRVNdLFxuICBleHBvcnRzOiBbQ09NTU9OX0RJUkVDVElWRVMsIENPTU1PTl9QSVBFU10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBOZ0xvY2FsaXphdGlvbiwgdXNlQ2xhc3M6IE5nTG9jYWxlTG9jYWxpemF0aW9ufSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ29tbW9uTW9kdWxlIHtcbn1cbiJdfQ==