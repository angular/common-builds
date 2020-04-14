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
export class LocationUpgradeModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFRQSxPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN0SixPQUFPLEVBQUMsTUFBTSxFQUFFLGNBQWMsRUFBdUIsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFdEQsT0FBTyxFQUFDLGFBQWEsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3JFLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxRQUFRLEVBQUMsTUFBTSxVQUFVLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQVFyRCwyQ0FzQkM7Ozs7Ozs7SUFqQkMsd0NBQWtCOzs7OztJQUlsQiwyQ0FBb0I7Ozs7O0lBSXBCLHlDQUEyQjs7Ozs7SUFJM0IsK0NBQXdCOzs7OztJQUl4Qiw0Q0FBcUI7Ozs7Ozs7O0FBUXZCLE1BQU0sT0FBTyw4QkFBOEIsR0FDdkMsSUFBSSxjQUFjLENBQXdCLGdDQUFnQyxDQUFDOztNQUV6RSxzQkFBc0IsR0FBRyxJQUFJLGNBQWMsQ0FBUyx3QkFBd0IsQ0FBQzs7Ozs7Ozs7QUFVbkYsTUFBTSxPQUFPLHFCQUFxQjs7Ozs7SUFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUE4QjtRQUMxQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLHFCQUFxQjtZQUMvQixTQUFTLEVBQUU7Z0JBQ1QsUUFBUTtnQkFDUjtvQkFDRSxPQUFPLEVBQUUsYUFBYTtvQkFDdEIsVUFBVSxFQUFFLGdCQUFnQjtvQkFDNUIsSUFBSSxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUM7aUJBQzlFO2dCQUNELEVBQUMsT0FBTyxFQUFFLDhCQUE4QixFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDO2dCQUN6RSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFDO2dCQUN4RjtvQkFDRSxPQUFPLEVBQUUsc0JBQXNCO29CQUMvQixVQUFVLEVBQUUsa0JBQWtCO29CQUM5QixJQUFJLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztpQkFDcEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLGdCQUFnQjtvQkFDekIsVUFBVSxFQUFFLHVCQUF1QjtvQkFDbkMsSUFBSSxFQUFFO3dCQUNKLGdCQUFnQjt3QkFDaEIsc0JBQXNCO3dCQUN0Qiw4QkFBOEI7cUJBQy9CO2lCQUNGO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQzs7O1lBOUJGLFFBQVEsU0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFDOzs0RUFDdEIscUJBQXFCOzRJQUFyQixxQkFBcUIsa0JBRGQsQ0FBQyxZQUFZLENBQUM7d0ZBQ3JCLHFCQUFxQixjQURiLFlBQVk7a0RBQ3BCLHFCQUFxQjtjQURqQyxRQUFRO2VBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBQzs7Ozs7OztBQWlDbkMsTUFBTSxVQUFVLGtCQUFrQixDQUFDLE1BQTZCLEVBQUUsV0FBb0I7SUFDcEYsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7UUFDeEMsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQzNCO1NBQU0sSUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO1FBQzlCLE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsTUFBNkI7O1VBQ3JELEtBQUssR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxpQkFBaUI7SUFDNUQsT0FBTyxJQUFJLENBQUMsbUJBQUEsS0FBSyxFQUFPLENBQUMsRUFBRSxDQUFDO0FBQzlCLENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsdUJBQXVCLENBQ25DLGdCQUFrQyxFQUFFLFFBQWdCLEVBQUUsVUFBaUMsRUFBRTtJQUMzRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2hGLENBQUM7Ozs7Ozs7OztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FDNUIsU0FBd0IsRUFBRSxRQUFrQixFQUFFLGdCQUFrQyxFQUNoRixRQUFrQixFQUFFLGdCQUFrQzs7VUFDbEQsaUJBQWlCLEdBQ25CLElBQUkscUJBQXFCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUM7SUFFaEcsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FQUF9CQVNFX0hSRUYsIENvbW1vbk1vZHVsZSwgSGFzaExvY2F0aW9uU3RyYXRlZ3ksIExvY2F0aW9uLCBMb2NhdGlvblN0cmF0ZWd5LCBQYXRoTG9jYXRpb25TdHJhdGVneSwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG5pbXBvcnQgeyRsb2NhdGlvblNoaW0sICRsb2NhdGlvblNoaW1Qcm92aWRlcn0gZnJvbSAnLi9sb2NhdGlvbl9zaGltJztcbmltcG9ydCB7QW5ndWxhckpTVXJsQ29kZWMsIFVybENvZGVjfSBmcm9tICcuL3BhcmFtcyc7XG5cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIExvY2F0aW9uVXBncmFkZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb25VcGdyYWRlQ29uZmlnIHtcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgd2hldGhlciB0aGUgbG9jYXRpb24gdXBncmFkZSBtb2R1bGUgc2hvdWxkIHVzZSB0aGUgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YFxuICAgKiBvciB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YFxuICAgKi9cbiAgdXNlSGFzaD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBoYXNoIHByZWZpeCB1c2VkIGluIHRoZSBVUkwgd2hlbiB1c2luZyB0aGUgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YFxuICAgKi9cbiAgaGFzaFByZWZpeD86IHN0cmluZztcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIFVSTCBjb2RlYyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIFVSTHMuIERlZmF1bHQgaXMgdGhlIGBBbmd1bGFySlNDb2RlY2BcbiAgICovXG4gIHVybENvZGVjPzogdHlwZW9mIFVybENvZGVjO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgYmFzZSBocmVmIHdoZW4gdXNlZCBpbiBzZXJ2ZXItc2lkZSByZW5kZXJlZCBhcHBsaWNhdGlvbnNcbiAgICovXG4gIHNlcnZlckJhc2VIcmVmPzogc3RyaW5nO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgYmFzZSBocmVmIHdoZW4gdXNlZCBpbiBjbGllbnQtc2lkZSByZW5kZXJlZCBhcHBsaWNhdGlvbnNcbiAgICovXG4gIGFwcEJhc2VIcmVmPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgcHJvdmlkZXIgdG9rZW4gdXNlZCB0byBjb25maWd1cmUgdGhlIGxvY2F0aW9uIHVwZ3JhZGUgbW9kdWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IExPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPExvY2F0aW9uVXBncmFkZUNvbmZpZz4oJ0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTicpO1xuXG5jb25zdCBBUFBfQkFTRV9IUkVGX1JFU09MVkVEID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ0FQUF9CQVNFX0hSRUZfUkVTT0xWRUQnKTtcblxuLyoqXG4gKiBgTmdNb2R1bGVgIHVzZWQgZm9yIHByb3ZpZGluZyBhbmQgY29uZmlndXJpbmcgQW5ndWxhcidzIFVuaWZpZWQgTG9jYXRpb24gU2VydmljZSBmb3IgdXBncmFkaW5nLlxuICpcbiAqIEBzZWUgW1VzaW5nIHRoZSBVbmlmaWVkIEFuZ3VsYXIgTG9jYXRpb24gU2VydmljZV0oZ3VpZGUvdXBncmFkZSN1c2luZy10aGUtdW5pZmllZC1hbmd1bGFyLWxvY2F0aW9uLXNlcnZpY2UpXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe2ltcG9ydHM6IFtDb21tb25Nb2R1bGVdfSlcbmV4cG9ydCBjbGFzcyBMb2NhdGlvblVwZ3JhZGVNb2R1bGUge1xuICBzdGF0aWMgY29uZmlnKGNvbmZpZz86IExvY2F0aW9uVXBncmFkZUNvbmZpZyk6IE1vZHVsZVdpdGhQcm92aWRlcnM8TG9jYXRpb25VcGdyYWRlTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBMb2NhdGlvblVwZ3JhZGVNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgTG9jYXRpb24sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiAkbG9jYXRpb25TaGltLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGUkbG9jYXRpb24sXG4gICAgICAgICAgZGVwczogW1VwZ3JhZGVNb2R1bGUsIExvY2F0aW9uLCBQbGF0Zm9ybUxvY2F0aW9uLCBVcmxDb2RlYywgTG9jYXRpb25TdHJhdGVneV1cbiAgICAgICAgfSxcbiAgICAgICAge3Byb3ZpZGU6IExPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiwgdXNlVmFsdWU6IGNvbmZpZyA/IGNvbmZpZyA6IHt9fSxcbiAgICAgICAge3Byb3ZpZGU6IFVybENvZGVjLCB1c2VGYWN0b3J5OiBwcm92aWRlVXJsQ29kZWMsIGRlcHM6IFtMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT05dfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQsXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUFwcEJhc2VIcmVmLFxuICAgICAgICAgIGRlcHM6IFtMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sIFtuZXcgSW5qZWN0KEFQUF9CQVNFX0hSRUYpLCBuZXcgT3B0aW9uYWwoKV1dXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBMb2NhdGlvblN0cmF0ZWd5LFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGVMb2NhdGlvblN0cmF0ZWd5LFxuICAgICAgICAgIGRlcHM6IFtcbiAgICAgICAgICAgIFBsYXRmb3JtTG9jYXRpb24sXG4gICAgICAgICAgICBBUFBfQkFTRV9IUkVGX1JFU09MVkVELFxuICAgICAgICAgICAgTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OLFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFwcEJhc2VIcmVmKGNvbmZpZzogTG9jYXRpb25VcGdyYWRlQ29uZmlnLCBhcHBCYXNlSHJlZj86IHN0cmluZykge1xuICBpZiAoY29uZmlnICYmIGNvbmZpZy5hcHBCYXNlSHJlZiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGNvbmZpZy5hcHBCYXNlSHJlZjtcbiAgfSBlbHNlIGlmIChhcHBCYXNlSHJlZiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGFwcEJhc2VIcmVmO1xuICB9XG4gIHJldHVybiAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVVcmxDb2RlYyhjb25maWc6IExvY2F0aW9uVXBncmFkZUNvbmZpZykge1xuICBjb25zdCBjb2RlYyA9IGNvbmZpZyAmJiBjb25maWcudXJsQ29kZWMgfHwgQW5ndWxhckpTVXJsQ29kZWM7XG4gIHJldHVybiBuZXcgKGNvZGVjIGFzIGFueSkoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVMb2NhdGlvblN0cmF0ZWd5KFxuICAgIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sIGJhc2VIcmVmOiBzdHJpbmcsIG9wdGlvbnM6IExvY2F0aW9uVXBncmFkZUNvbmZpZyA9IHt9KSB7XG4gIHJldHVybiBvcHRpb25zLnVzZUhhc2ggPyBuZXcgSGFzaExvY2F0aW9uU3RyYXRlZ3kocGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYXRoTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlJGxvY2F0aW9uKFxuICAgIG5nVXBncmFkZTogVXBncmFkZU1vZHVsZSwgbG9jYXRpb246IExvY2F0aW9uLCBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgIHVybENvZGVjOiBVcmxDb2RlYywgbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge1xuICBjb25zdCAkbG9jYXRpb25Qcm92aWRlciA9XG4gICAgICBuZXcgJGxvY2F0aW9uU2hpbVByb3ZpZGVyKG5nVXBncmFkZSwgbG9jYXRpb24sIHBsYXRmb3JtTG9jYXRpb24sIHVybENvZGVjLCBsb2NhdGlvblN0cmF0ZWd5KTtcblxuICByZXR1cm4gJGxvY2F0aW9uUHJvdmlkZXIuJGdldCgpO1xufSJdfQ==