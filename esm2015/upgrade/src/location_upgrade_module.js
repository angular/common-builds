/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/upgrade/src/location_upgrade_module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { APP_BASE_HREF, CommonModule, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { Inject, InjectionToken, NgModule, Optional } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { $locationShim, $locationShimProvider } from './location_shim';
import { AngularJSUrlCodec, UrlCodec } from './params';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Configuration options for LocationUpgrade.
 *
 * \@publicApi
 * @record
 */
export function LocationUpgradeConfig() { }
if (false) {
    /**
     * Configures whether the location upgrade module should use the `HashLocationStrategy`
     * or the `PathLocationStrategy`
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.useHash;
    /**
     * Configures the hash prefix used in the URL when using the `HashLocationStrategy`
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.hashPrefix;
    /**
     * Configures the URL codec for encoding and decoding URLs. Default is the `AngularJSCodec`
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.urlCodec;
    /**
     * Configures the base href when used in server-side rendered applications
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.serverBaseHref;
    /**
     * Configures the base href when used in client-side rendered applications
     * @type {?|undefined}
     */
    LocationUpgradeConfig.prototype.appBaseHref;
}
/**
 * A provider token used to configure the location upgrade module.
 *
 * \@publicApi
 * @type {?}
 */
export const LOCATION_UPGRADE_CONFIGURATION = new InjectionToken('LOCATION_UPGRADE_CONFIGURATION');
/** @type {?} */
const APP_BASE_HREF_RESOLVED = new InjectionToken('APP_BASE_HREF_RESOLVED');
/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](guide/upgrade#using-the-unified-angular-location-service)
 *
 * \@publicApi
 */
let LocationUpgradeModule = /** @class */ (() => {
    /**
     * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
     *
     * @see [Using the Unified Angular Location Service](guide/upgrade#using-the-unified-angular-location-service)
     *
     * \@publicApi
     */
    class LocationUpgradeModule {
        /**
         * @param {?=} config
         * @return {?}
         */
        static config(config) {
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
        }
    }
    LocationUpgradeModule.decorators = [
        { type: NgModule, args: [{ imports: [CommonModule] },] },
    ];
    /** @nocollapse */ LocationUpgradeModule.ɵmod = i0.ɵɵdefineNgModule({ type: LocationUpgradeModule });
    /** @nocollapse */ LocationUpgradeModule.ɵinj = i0.ɵɵdefineInjector({ factory: function LocationUpgradeModule_Factory(t) { return new (t || LocationUpgradeModule)(); }, imports: [[CommonModule]] });
    return LocationUpgradeModule;
})();
export { LocationUpgradeModule };
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(LocationUpgradeModule, { imports: [CommonModule] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LocationUpgradeModule, [{
        type: NgModule,
        args: [{ imports: [CommonModule] }]
    }], null, null); })();
/**
 * @param {?} config
 * @param {?=} appBaseHref
 * @return {?}
 */
export function provideAppBaseHref(config, appBaseHref) {
    if (config && config.appBaseHref != null) {
        return config.appBaseHref;
    }
    else if (appBaseHref != null) {
        return appBaseHref;
    }
    return '';
}
/**
 * @param {?} config
 * @return {?}
 */
export function provideUrlCodec(config) {
    /** @type {?} */
    const codec = config && config.urlCodec || AngularJSUrlCodec;
    return new ((/** @type {?} */ (codec)))();
}
/**
 * @param {?} platformLocation
 * @param {?} baseHref
 * @param {?=} options
 * @return {?}
 */
export function provideLocationStrategy(platformLocation, baseHref, options = {}) {
    return options.useHash ? new HashLocationStrategy(platformLocation, baseHref) :
        new PathLocationStrategy(platformLocation, baseHref);
}
/**
 * @param {?} ngUpgrade
 * @param {?} location
 * @param {?} platformLocation
 * @param {?} urlCodec
 * @param {?} locationStrategy
 * @return {?}
 */
export function provide$location(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
    /** @type {?} */
    const $locationProvider = new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);
    return $locationProvider.$get();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFRQSxPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN0SixPQUFPLEVBQUMsTUFBTSxFQUFFLGNBQWMsRUFBdUIsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFdEQsT0FBTyxFQUFDLGFBQWEsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3JFLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxRQUFRLEVBQUMsTUFBTSxVQUFVLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQVFyRCwyQ0FzQkM7Ozs7Ozs7SUFqQkMsd0NBQWtCOzs7OztJQUlsQiwyQ0FBb0I7Ozs7O0lBSXBCLHlDQUEyQjs7Ozs7SUFJM0IsK0NBQXdCOzs7OztJQUl4Qiw0Q0FBcUI7Ozs7Ozs7O0FBUXZCLE1BQU0sT0FBTyw4QkFBOEIsR0FDdkMsSUFBSSxjQUFjLENBQXdCLGdDQUFnQyxDQUFDOztNQUV6RSxzQkFBc0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyx3QkFBd0IsQ0FBQzs7Ozs7Ozs7QUFTbkY7Ozs7Ozs7O0lBQUEsTUFDYSxxQkFBcUI7Ozs7O1FBQ2hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBOEI7WUFDMUMsT0FBTztnQkFDTCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixTQUFTLEVBQUU7b0JBQ1QsUUFBUTtvQkFDUjt3QkFDRSxPQUFPLEVBQUUsYUFBYTt3QkFDdEIsVUFBVSxFQUFFLGdCQUFnQjt3QkFDNUIsSUFBSSxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUM7cUJBQzlFO29CQUNELEVBQUMsT0FBTyxFQUFFLDhCQUE4QixFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDO29CQUN6RSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFDO29CQUN4Rjt3QkFDRSxPQUFPLEVBQUUsc0JBQXNCO3dCQUMvQixVQUFVLEVBQUUsa0JBQWtCO3dCQUM5QixJQUFJLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztxQkFDcEY7b0JBQ0Q7d0JBQ0UsT0FBTyxFQUFFLGdCQUFnQjt3QkFDekIsVUFBVSxFQUFFLHVCQUF1Qjt3QkFDbkMsSUFBSSxFQUFFOzRCQUNKLGdCQUFnQjs0QkFDaEIsc0JBQXNCOzRCQUN0Qiw4QkFBOEI7eUJBQy9CO3FCQUNGO2lCQUNGO2FBQ0YsQ0FBQztRQUNKLENBQUM7OztnQkE5QkYsUUFBUSxTQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUM7O2dGQUN0QixxQkFBcUI7Z0pBQXJCLHFCQUFxQixrQkFEZCxDQUFDLFlBQVksQ0FBQztnQ0E5RGxDO0tBNkZDO1NBOUJZLHFCQUFxQjt3RkFBckIscUJBQXFCLGNBRGIsWUFBWTtrREFDcEIscUJBQXFCO2NBRGpDLFFBQVE7ZUFBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFDOzs7Ozs7O0FBaUNuQyxNQUFNLFVBQVUsa0JBQWtCLENBQUMsTUFBNkIsRUFBRSxXQUFvQjtJQUNwRixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLElBQUksRUFBRTtRQUN4QyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDM0I7U0FBTSxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7UUFDOUIsT0FBTyxXQUFXLENBQUM7S0FDcEI7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUE2Qjs7VUFDckQsS0FBSyxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLGlCQUFpQjtJQUM1RCxPQUFPLElBQUksQ0FBQyxtQkFBQSxLQUFLLEVBQU8sQ0FBQyxFQUFFLENBQUM7QUFDOUIsQ0FBQzs7Ozs7OztBQUVELE1BQU0sVUFBVSx1QkFBdUIsQ0FDbkMsZ0JBQWtDLEVBQUUsUUFBZ0IsRUFBRSxVQUFpQyxFQUFFO0lBQzNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDaEYsQ0FBQzs7Ozs7Ozs7O0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUM1QixTQUF3QixFQUFFLFFBQWtCLEVBQUUsZ0JBQWtDLEVBQ2hGLFFBQWtCLEVBQUUsZ0JBQWtDOztVQUNsRCxpQkFBaUIsR0FDbkIsSUFBSSxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQztJQUVoRyxPQUFPLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVBQX0JBU0VfSFJFRiwgQ29tbW9uTW9kdWxlLCBIYXNoTG9jYXRpb25TdHJhdGVneSwgTG9jYXRpb24sIExvY2F0aW9uU3RyYXRlZ3ksIFBhdGhMb2NhdGlvblN0cmF0ZWd5LCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG5cbmltcG9ydCB7JGxvY2F0aW9uU2hpbSwgJGxvY2F0aW9uU2hpbVByb3ZpZGVyfSBmcm9tICcuL2xvY2F0aW9uX3NoaW0nO1xuaW1wb3J0IHtBbmd1bGFySlNVcmxDb2RlYywgVXJsQ29kZWN9IGZyb20gJy4vcGFyYW1zJztcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgTG9jYXRpb25VcGdyYWRlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvblVwZ3JhZGVDb25maWcge1xuICAvKipcbiAgICogQ29uZmlndXJlcyB3aGV0aGVyIHRoZSBsb2NhdGlvbiB1cGdyYWRlIG1vZHVsZSBzaG91bGQgdXNlIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqIG9yIHRoZSBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqL1xuICB1c2VIYXNoPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGhhc2ggcHJlZml4IHVzZWQgaW4gdGhlIFVSTCB3aGVuIHVzaW5nIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqL1xuICBoYXNoUHJlZml4Pzogc3RyaW5nO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgVVJMIGNvZGVjIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgVVJMcy4gRGVmYXVsdCBpcyB0aGUgYEFuZ3VsYXJKU0NvZGVjYFxuICAgKi9cbiAgdXJsQ29kZWM/OiB0eXBlb2YgVXJsQ29kZWM7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBiYXNlIGhyZWYgd2hlbiB1c2VkIGluIHNlcnZlci1zaWRlIHJlbmRlcmVkIGFwcGxpY2F0aW9uc1xuICAgKi9cbiAgc2VydmVyQmFzZUhyZWY/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBiYXNlIGhyZWYgd2hlbiB1c2VkIGluIGNsaWVudC1zaWRlIHJlbmRlcmVkIGFwcGxpY2F0aW9uc1xuICAgKi9cbiAgYXBwQmFzZUhyZWY/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBwcm92aWRlciB0b2tlbiB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgbG9jYXRpb24gdXBncmFkZSBtb2R1bGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TG9jYXRpb25VcGdyYWRlQ29uZmlnPignTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OJyk7XG5cbmNvbnN0IEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCcpO1xuXG4vKipcbiAqIGBOZ01vZHVsZWAgdXNlZCBmb3IgcHJvdmlkaW5nIGFuZCBjb25maWd1cmluZyBBbmd1bGFyJ3MgVW5pZmllZCBMb2NhdGlvbiBTZXJ2aWNlIGZvciB1cGdyYWRpbmcuXG4gKlxuICogQHNlZSBbVXNpbmcgdGhlIFVuaWZpZWQgQW5ndWxhciBMb2NhdGlvbiBTZXJ2aWNlXShndWlkZS91cGdyYWRlI3VzaW5nLXRoZS11bmlmaWVkLWFuZ3VsYXItbG9jYXRpb24tc2VydmljZSlcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7aW1wb3J0czogW0NvbW1vbk1vZHVsZV19KVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uVXBncmFkZU1vZHVsZSB7XG4gIHN0YXRpYyBjb25maWcoY29uZmlnPzogTG9jYXRpb25VcGdyYWRlQ29uZmlnKTogTW9kdWxlV2l0aFByb3ZpZGVyczxMb2NhdGlvblVwZ3JhZGVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IExvY2F0aW9uVXBncmFkZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBMb2NhdGlvbixcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6ICRsb2NhdGlvblNoaW0sXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZSRsb2NhdGlvbixcbiAgICAgICAgICBkZXBzOiBbVXBncmFkZU1vZHVsZSwgTG9jYXRpb24sIFBsYXRmb3JtTG9jYXRpb24sIFVybENvZGVjLCBMb2NhdGlvblN0cmF0ZWd5XVxuICAgICAgICB9LFxuICAgICAgICB7cHJvdmlkZTogTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OLCB1c2VWYWx1ZTogY29uZmlnID8gY29uZmlnIDoge319LFxuICAgICAgICB7cHJvdmlkZTogVXJsQ29kZWMsIHVzZUZhY3Rvcnk6IHByb3ZpZGVVcmxDb2RlYywgZGVwczogW0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTl19LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBwcm92aWRlQXBwQmFzZUhyZWYsXG4gICAgICAgICAgZGVwczogW0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiwgW25ldyBJbmplY3QoQVBQX0JBU0VfSFJFRiksIG5ldyBPcHRpb25hbCgpXV1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IExvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgZGVwczogW1xuICAgICAgICAgICAgUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgICAgICAgIEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQsXG4gICAgICAgICAgICBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQXBwQmFzZUhyZWYoY29uZmlnOiBMb2NhdGlvblVwZ3JhZGVDb25maWcsIGFwcEJhc2VIcmVmPzogc3RyaW5nKSB7XG4gIGlmIChjb25maWcgJiYgY29uZmlnLmFwcEJhc2VIcmVmICE9IG51bGwpIHtcbiAgICByZXR1cm4gY29uZmlnLmFwcEJhc2VIcmVmO1xuICB9IGVsc2UgaWYgKGFwcEJhc2VIcmVmICE9IG51bGwpIHtcbiAgICByZXR1cm4gYXBwQmFzZUhyZWY7XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVVybENvZGVjKGNvbmZpZzogTG9jYXRpb25VcGdyYWRlQ29uZmlnKSB7XG4gIGNvbnN0IGNvZGVjID0gY29uZmlnICYmIGNvbmZpZy51cmxDb2RlYyB8fCBBbmd1bGFySlNVcmxDb2RlYztcbiAgcmV0dXJuIG5ldyAoY29kZWMgYXMgYW55KSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3koXG4gICAgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWY6IHN0cmluZywgb3B0aW9uczogTG9jYXRpb25VcGdyYWRlQ29uZmlnID0ge30pIHtcbiAgcmV0dXJuIG9wdGlvbnMudXNlSGFzaCA/IG5ldyBIYXNoTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBhdGhMb2NhdGlvblN0cmF0ZWd5KHBsYXRmb3JtTG9jYXRpb24sIGJhc2VIcmVmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGUkbG9jYXRpb24oXG4gICAgbmdVcGdyYWRlOiBVcGdyYWRlTW9kdWxlLCBsb2NhdGlvbjogTG9jYXRpb24sIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgdXJsQ29kZWM6IFVybENvZGVjLCBsb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gIGNvbnN0ICRsb2NhdGlvblByb3ZpZGVyID1cbiAgICAgIG5ldyAkbG9jYXRpb25TaGltUHJvdmlkZXIobmdVcGdyYWRlLCBsb2NhdGlvbiwgcGxhdGZvcm1Mb2NhdGlvbiwgdXJsQ29kZWMsIGxvY2F0aW9uU3RyYXRlZ3kpO1xuXG4gIHJldHVybiAkbG9jYXRpb25Qcm92aWRlci4kZ2V0KCk7XG59Il19