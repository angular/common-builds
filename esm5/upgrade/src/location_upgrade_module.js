/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_BASE_HREF, CommonModule, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { Inject, InjectionToken, NgModule, Optional } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { $locationShim, $locationShimProvider } from './location_shim';
import { AngularJSUrlCodec, UrlCodec } from './params';
import * as i0 from "@angular/core";
/**
 * A provider token used to configure the location upgrade module.
 *
 * @publicApi
 */
export var LOCATION_UPGRADE_CONFIGURATION = new InjectionToken('LOCATION_UPGRADE_CONFIGURATION');
var APP_BASE_HREF_RESOLVED = new InjectionToken('APP_BASE_HREF_RESOLVED');
/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](guide/upgrade#using-the-unified-angular-location-service)
 *
 * @publicApi
 */
var LocationUpgradeModule = /** @class */ (function () {
    function LocationUpgradeModule() {
    }
    LocationUpgradeModule.config = function (config) {
        return {
            ngModule: LocationUpgradeModule,
            providers: [
                Location,
                {
                    provide: $locationShim,
                    useFactory: provide$location,
                    deps: [UpgradeModule, Location, PlatformLocation, UrlCodec, LocationStrategy]
                },
                { provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {} },
                { provide: UrlCodec, useFactory: provideUrlCodec, deps: [LOCATION_UPGRADE_CONFIGURATION] },
                {
                    provide: APP_BASE_HREF_RESOLVED,
                    useFactory: provideAppBaseHref,
                    deps: [LOCATION_UPGRADE_CONFIGURATION, [new Inject(APP_BASE_HREF), new Optional()]]
                },
                {
                    provide: LocationStrategy,
                    useFactory: provideLocationStrategy,
                    deps: [
                        PlatformLocation,
                        APP_BASE_HREF_RESOLVED,
                        LOCATION_UPGRADE_CONFIGURATION,
                    ]
                },
            ],
        };
    };
    LocationUpgradeModule.ɵmod = i0.ɵɵdefineNgModule({ type: LocationUpgradeModule });
    LocationUpgradeModule.ɵinj = i0.ɵɵdefineInjector({ factory: function LocationUpgradeModule_Factory(t) { return new (t || LocationUpgradeModule)(); }, imports: [[CommonModule]] });
    return LocationUpgradeModule;
}());
export { LocationUpgradeModule };
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(LocationUpgradeModule, { imports: [CommonModule] }); })();
/*@__PURE__*/ i0.ɵsetClassMetadata(LocationUpgradeModule, [{
        type: NgModule,
        args: [{ imports: [CommonModule] }]
    }], null, null);
export function provideAppBaseHref(config, appBaseHref) {
    if (config && config.appBaseHref != null) {
        return config.appBaseHref;
    }
    else if (appBaseHref != null) {
        return appBaseHref;
    }
    return '';
}
export function provideUrlCodec(config) {
    var codec = config && config.urlCodec || AngularJSUrlCodec;
    return new codec();
}
export function provideLocationStrategy(platformLocation, baseHref, options) {
    if (options === void 0) { options = {}; }
    return options.useHash ? new HashLocationStrategy(platformLocation, baseHref) :
        new PathLocationStrategy(platformLocation, baseHref);
}
export function provide$location(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
    var $locationProvider = new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);
    return $locationProvider.$get();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdEosT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQXVCLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRXRELE9BQU8sRUFBQyxhQUFhLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsUUFBUSxFQUFDLE1BQU0sVUFBVSxDQUFDOztBQWdDckQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxJQUFNLDhCQUE4QixHQUN2QyxJQUFJLGNBQWMsQ0FBd0IsZ0NBQWdDLENBQUMsQ0FBQztBQUVoRixJQUFNLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFTLHdCQUF3QixDQUFDLENBQUM7QUFFcEY7Ozs7OztHQU1HO0FBQ0g7SUFBQTtLQStCQztJQTdCUSw0QkFBTSxHQUFiLFVBQWMsTUFBOEI7UUFDMUMsT0FBTztZQUNMLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsU0FBUyxFQUFFO2dCQUNULFFBQVE7Z0JBQ1I7b0JBQ0UsT0FBTyxFQUFFLGFBQWE7b0JBQ3RCLFVBQVUsRUFBRSxnQkFBZ0I7b0JBQzVCLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDO2lCQUM5RTtnQkFDRCxFQUFDLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQztnQkFDekUsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUMsOEJBQThCLENBQUMsRUFBQztnQkFDeEY7b0JBQ0UsT0FBTyxFQUFFLHNCQUFzQjtvQkFDL0IsVUFBVSxFQUFFLGtCQUFrQjtvQkFDOUIsSUFBSSxFQUFFLENBQUMsOEJBQThCLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7aUJBQ3BGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxnQkFBZ0I7b0JBQ3pCLFVBQVUsRUFBRSx1QkFBdUI7b0JBQ25DLElBQUksRUFBRTt3QkFDSixnQkFBZ0I7d0JBQ2hCLHNCQUFzQjt3QkFDdEIsOEJBQThCO3FCQUMvQjtpQkFDRjthQUNGO1NBQ0YsQ0FBQztJQUNKLENBQUM7NkRBN0JVLHFCQUFxQjs2SEFBckIscUJBQXFCLGtCQURkLENBQUMsWUFBWSxDQUFDO2dDQTlEbEM7Q0E2RkMsQUEvQkQsSUErQkM7U0E5QlkscUJBQXFCO3dGQUFyQixxQkFBcUIsY0FEYixZQUFZO21DQUNwQixxQkFBcUI7Y0FEakMsUUFBUTtlQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUM7O0FBaUNuQyxNQUFNLFVBQVUsa0JBQWtCLENBQUMsTUFBNkIsRUFBRSxXQUFvQjtJQUNwRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLElBQUksRUFBRTtRQUN4QyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDM0I7U0FBTSxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7UUFDOUIsT0FBTyxXQUFXLENBQUM7S0FDcEI7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUFDLE1BQTZCO0lBQzNELElBQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLGlCQUFpQixDQUFDO0lBQzdELE9BQU8sSUFBSyxLQUFhLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBRUQsTUFBTSxVQUFVLHVCQUF1QixDQUNuQyxnQkFBa0MsRUFBRSxRQUFnQixFQUFFLE9BQW1DO0lBQW5DLHdCQUFBLEVBQUEsWUFBbUM7SUFDM0YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRixDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUM1QixTQUF3QixFQUFFLFFBQWtCLEVBQUUsZ0JBQWtDLEVBQ2hGLFFBQWtCLEVBQUUsZ0JBQWtDO0lBQ3hELElBQU0saUJBQWlCLEdBQ25CLElBQUkscUJBQXFCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUVqRyxPQUFPLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVBQX0JBU0VfSFJFRiwgQ29tbW9uTW9kdWxlLCBIYXNoTG9jYXRpb25TdHJhdGVneSwgTG9jYXRpb24sIExvY2F0aW9uU3RyYXRlZ3ksIFBhdGhMb2NhdGlvblN0cmF0ZWd5LCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG5cbmltcG9ydCB7JGxvY2F0aW9uU2hpbSwgJGxvY2F0aW9uU2hpbVByb3ZpZGVyfSBmcm9tICcuL2xvY2F0aW9uX3NoaW0nO1xuaW1wb3J0IHtBbmd1bGFySlNVcmxDb2RlYywgVXJsQ29kZWN9IGZyb20gJy4vcGFyYW1zJztcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgTG9jYXRpb25VcGdyYWRlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvblVwZ3JhZGVDb25maWcge1xuICAvKipcbiAgICogQ29uZmlndXJlcyB3aGV0aGVyIHRoZSBsb2NhdGlvbiB1cGdyYWRlIG1vZHVsZSBzaG91bGQgdXNlIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqIG9yIHRoZSBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqL1xuICB1c2VIYXNoPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGhhc2ggcHJlZml4IHVzZWQgaW4gdGhlIFVSTCB3aGVuIHVzaW5nIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqL1xuICBoYXNoUHJlZml4Pzogc3RyaW5nO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgVVJMIGNvZGVjIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgVVJMcy4gRGVmYXVsdCBpcyB0aGUgYEFuZ3VsYXJKU0NvZGVjYFxuICAgKi9cbiAgdXJsQ29kZWM/OiB0eXBlb2YgVXJsQ29kZWM7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBiYXNlIGhyZWYgd2hlbiB1c2VkIGluIHNlcnZlci1zaWRlIHJlbmRlcmVkIGFwcGxpY2F0aW9uc1xuICAgKi9cbiAgc2VydmVyQmFzZUhyZWY/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBiYXNlIGhyZWYgd2hlbiB1c2VkIGluIGNsaWVudC1zaWRlIHJlbmRlcmVkIGFwcGxpY2F0aW9uc1xuICAgKi9cbiAgYXBwQmFzZUhyZWY/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBwcm92aWRlciB0b2tlbiB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgbG9jYXRpb24gdXBncmFkZSBtb2R1bGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TG9jYXRpb25VcGdyYWRlQ29uZmlnPignTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OJyk7XG5cbmNvbnN0IEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCcpO1xuXG4vKipcbiAqIGBOZ01vZHVsZWAgdXNlZCBmb3IgcHJvdmlkaW5nIGFuZCBjb25maWd1cmluZyBBbmd1bGFyJ3MgVW5pZmllZCBMb2NhdGlvbiBTZXJ2aWNlIGZvciB1cGdyYWRpbmcuXG4gKiBcbiAqIEBzZWUgW1VzaW5nIHRoZSBVbmlmaWVkIEFuZ3VsYXIgTG9jYXRpb24gU2VydmljZV0oZ3VpZGUvdXBncmFkZSN1c2luZy10aGUtdW5pZmllZC1hbmd1bGFyLWxvY2F0aW9uLXNlcnZpY2UpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe2ltcG9ydHM6IFtDb21tb25Nb2R1bGVdfSlcbmV4cG9ydCBjbGFzcyBMb2NhdGlvblVwZ3JhZGVNb2R1bGUge1xuICBzdGF0aWMgY29uZmlnKGNvbmZpZz86IExvY2F0aW9uVXBncmFkZUNvbmZpZyk6IE1vZHVsZVdpdGhQcm92aWRlcnM8TG9jYXRpb25VcGdyYWRlTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBMb2NhdGlvblVwZ3JhZGVNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgTG9jYXRpb24sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiAkbG9jYXRpb25TaGltLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGUkbG9jYXRpb24sXG4gICAgICAgICAgZGVwczogW1VwZ3JhZGVNb2R1bGUsIExvY2F0aW9uLCBQbGF0Zm9ybUxvY2F0aW9uLCBVcmxDb2RlYywgTG9jYXRpb25TdHJhdGVneV1cbiAgICAgICAgfSxcbiAgICAgICAge3Byb3ZpZGU6IExPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiwgdXNlVmFsdWU6IGNvbmZpZyA/IGNvbmZpZyA6IHt9fSxcbiAgICAgICAge3Byb3ZpZGU6IFVybENvZGVjLCB1c2VGYWN0b3J5OiBwcm92aWRlVXJsQ29kZWMsIGRlcHM6IFtMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT05dfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQsXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUFwcEJhc2VIcmVmLFxuICAgICAgICAgIGRlcHM6IFtMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sIFtuZXcgSW5qZWN0KEFQUF9CQVNFX0hSRUYpLCBuZXcgT3B0aW9uYWwoKV1dXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBMb2NhdGlvblN0cmF0ZWd5LFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGVMb2NhdGlvblN0cmF0ZWd5LFxuICAgICAgICAgIGRlcHM6IFtcbiAgICAgICAgICAgIFBsYXRmb3JtTG9jYXRpb24sXG4gICAgICAgICAgICBBUFBfQkFTRV9IUkVGX1JFU09MVkVELFxuICAgICAgICAgICAgTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OLFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFwcEJhc2VIcmVmKGNvbmZpZzogTG9jYXRpb25VcGdyYWRlQ29uZmlnLCBhcHBCYXNlSHJlZj86IHN0cmluZykge1xuICBpZiAoY29uZmlnICYmIGNvbmZpZy5hcHBCYXNlSHJlZiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGNvbmZpZy5hcHBCYXNlSHJlZjtcbiAgfSBlbHNlIGlmIChhcHBCYXNlSHJlZiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGFwcEJhc2VIcmVmO1xuICB9XG4gIHJldHVybiAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVVcmxDb2RlYyhjb25maWc6IExvY2F0aW9uVXBncmFkZUNvbmZpZykge1xuICBjb25zdCBjb2RlYyA9IGNvbmZpZyAmJiBjb25maWcudXJsQ29kZWMgfHwgQW5ndWxhckpTVXJsQ29kZWM7XG4gIHJldHVybiBuZXcgKGNvZGVjIGFzIGFueSkoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVMb2NhdGlvblN0cmF0ZWd5KFxuICAgIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sIGJhc2VIcmVmOiBzdHJpbmcsIG9wdGlvbnM6IExvY2F0aW9uVXBncmFkZUNvbmZpZyA9IHt9KSB7XG4gIHJldHVybiBvcHRpb25zLnVzZUhhc2ggPyBuZXcgSGFzaExvY2F0aW9uU3RyYXRlZ3kocGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYXRoTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlJGxvY2F0aW9uKFxuICAgIG5nVXBncmFkZTogVXBncmFkZU1vZHVsZSwgbG9jYXRpb246IExvY2F0aW9uLCBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgIHVybENvZGVjOiBVcmxDb2RlYywgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge1xuICBjb25zdCAkbG9jYXRpb25Qcm92aWRlciA9XG4gICAgICBuZXcgJGxvY2F0aW9uU2hpbVByb3ZpZGVyKG5nVXBncmFkZSwgbG9jYXRpb24sIHBsYXRmb3JtTG9jYXRpb24sIHVybENvZGVjLCBsb2NhdGlvblN0cmF0ZWd5KTtcblxuICByZXR1cm4gJGxvY2F0aW9uUHJvdmlkZXIuJGdldCgpO1xufSJdfQ==