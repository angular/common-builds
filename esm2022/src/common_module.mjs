/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { COMMON_DIRECTIVES } from './directives/index';
import { COMMON_PIPES } from './pipes/index';
import * as i0 from "@angular/core";
import * as i1 from "./directives/ng_class";
import * as i2 from "./directives/ng_component_outlet";
import * as i3 from "./directives/ng_for_of";
import * as i4 from "./directives/ng_if";
import * as i5 from "./directives/ng_template_outlet";
import * as i6 from "./directives/ng_style";
import * as i7 from "./directives/ng_switch";
import * as i8 from "./directives/ng_plural";
import * as i9 from "./pipes/async_pipe";
import * as i10 from "./pipes/case_conversion_pipes";
import * as i11 from "./pipes/json_pipe";
import * as i12 from "./pipes/slice_pipe";
import * as i13 from "./pipes/number_pipe";
import * as i14 from "./pipes/date_pipe";
import * as i15 from "./pipes/i18n_plural_pipe";
import * as i16 from "./pipes/i18n_select_pipe";
import * as i17 from "./pipes/keyvalue_pipe";
// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * Exports all the basic Angular directives and pipes,
 * such as `NgIf`, `NgForOf`, `DecimalPipe`, and so on.
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command.
 *
 * @publicApi
 */
export class CommonModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: CommonModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: CommonModule, imports: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe], exports: [i1.NgClass, i2.NgComponentOutlet, i3.NgForOf, i4.NgIf, i5.NgTemplateOutlet, i6.NgStyle, i7.NgSwitch, i7.NgSwitchCase, i7.NgSwitchDefault, i8.NgPlural, i8.NgPluralCase, i9.AsyncPipe, i10.UpperCasePipe, i10.LowerCasePipe, i11.JsonPipe, i12.SlicePipe, i13.DecimalPipe, i13.PercentPipe, i10.TitleCasePipe, i13.CurrencyPipe, i14.DatePipe, i15.I18nPluralPipe, i16.I18nSelectPipe, i17.KeyValuePipe] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: CommonModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: CommonModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [COMMON_DIRECTIVES, COMMON_PIPES],
                    exports: [COMMON_DIRECTIVES, COMMON_PIPES],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvY29tbW9uX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFM0Msc0RBQXNEO0FBQ3RELCtEQUErRDtBQUMvRDs7Ozs7OztHQU9HO0FBS0gsTUFBTSxPQUFPLFlBQVk7eUhBQVosWUFBWTswSEFBWixZQUFZOzBIQUFaLFlBQVk7O3NHQUFaLFlBQVk7a0JBSnhCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDO29CQUMxQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7aUJBQzNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0NPTU1PTl9ESVJFQ1RJVkVTfSBmcm9tICcuL2RpcmVjdGl2ZXMvaW5kZXgnO1xuaW1wb3J0IHtDT01NT05fUElQRVN9IGZyb20gJy4vcGlwZXMvaW5kZXgnO1xuXG4vLyBOb3RlOiBUaGlzIGRvZXMgbm90IGNvbnRhaW4gdGhlIGxvY2F0aW9uIHByb3ZpZGVycyxcbi8vIGFzIHRoZXkgbmVlZCBzb21lIHBsYXRmb3JtIHNwZWNpZmljIGltcGxlbWVudGF0aW9ucyB0byB3b3JrLlxuLyoqXG4gKiBFeHBvcnRzIGFsbCB0aGUgYmFzaWMgQW5ndWxhciBkaXJlY3RpdmVzIGFuZCBwaXBlcyxcbiAqIHN1Y2ggYXMgYE5nSWZgLCBgTmdGb3JPZmAsIGBEZWNpbWFsUGlwZWAsIGFuZCBzbyBvbi5cbiAqIFJlLWV4cG9ydGVkIGJ5IGBCcm93c2VyTW9kdWxlYCwgd2hpY2ggaXMgaW5jbHVkZWQgYXV0b21hdGljYWxseSBpbiB0aGUgcm9vdFxuICogYEFwcE1vZHVsZWAgd2hlbiB5b3UgY3JlYXRlIGEgbmV3IGFwcCB3aXRoIHRoZSBDTEkgYG5ld2AgY29tbWFuZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDT01NT05fRElSRUNUSVZFUywgQ09NTU9OX1BJUEVTXSxcbiAgZXhwb3J0czogW0NPTU1PTl9ESVJFQ1RJVkVTLCBDT01NT05fUElQRVNdLFxufSlcbmV4cG9ydCBjbGFzcyBDb21tb25Nb2R1bGUge31cbiJdfQ==