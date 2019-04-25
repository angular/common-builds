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
 * Is used in DI to configure the location upgrade package.
 *
 * @publicApi
 */
export var LOCATION_UPGRADE_CONFIGURATION = new InjectionToken('LOCATION_UPGRADE_CONFIGURATION');
var APP_BASE_HREF_RESOLVED = new InjectionToken('APP_BASE_HREF_RESOLVED');
/**
 * Module used for configuring Angular's LocationUpgradeService.
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
    LocationUpgradeModule.ngModuleDef = i0.ɵɵdefineNgModule({ type: LocationUpgradeModule });
    LocationUpgradeModule.ngInjectorDef = i0.ɵɵdefineInjector({ factory: function LocationUpgradeModule_Factory(t) { return new (t || LocationUpgradeModule)(); }, imports: [[CommonModule]] });
    return LocationUpgradeModule;
}());
export { LocationUpgradeModule };
/*@__PURE__*/ i0.ɵɵsetNgModuleScope(LocationUpgradeModule, { imports: [CommonModule] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdEosT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQXVCLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRXRELE9BQU8sRUFBQyxhQUFhLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsUUFBUSxFQUFDLE1BQU0sVUFBVSxDQUFDOztBQWdCckQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxJQUFNLDhCQUE4QixHQUN2QyxJQUFJLGNBQWMsQ0FBd0IsZ0NBQWdDLENBQUMsQ0FBQztBQUVoRixJQUFNLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFTLHdCQUF3QixDQUFDLENBQUM7QUFFcEY7Ozs7R0FJRztBQUNIO0lBQUE7S0ErQkM7SUE3QlEsNEJBQU0sR0FBYixVQUFjLE1BQThCO1FBQzFDLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFNBQVMsRUFBRTtnQkFDVCxRQUFRO2dCQUNSO29CQUNFLE9BQU8sRUFBRSxhQUFhO29CQUN0QixVQUFVLEVBQUUsZ0JBQWdCO29CQUM1QixJQUFJLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQztpQkFDOUU7Z0JBQ0QsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3pFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLDhCQUE4QixDQUFDLEVBQUM7Z0JBQ3hGO29CQUNFLE9BQU8sRUFBRSxzQkFBc0I7b0JBQy9CLFVBQVUsRUFBRSxrQkFBa0I7b0JBQzlCLElBQUksRUFBRSxDQUFDLDhCQUE4QixFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZ0JBQWdCO29CQUN6QixVQUFVLEVBQUUsdUJBQXVCO29CQUNuQyxJQUFJLEVBQUU7d0JBQ0osZ0JBQWdCO3dCQUNoQixzQkFBc0I7d0JBQ3RCLDhCQUE4QjtxQkFDL0I7aUJBQ0Y7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO29FQTdCVSxxQkFBcUI7c0lBQXJCLHFCQUFxQixrQkFEZCxDQUFDLFlBQVksQ0FBQztnQ0E1Q2xDO0NBMkVDLEFBL0JELElBK0JDO1NBOUJZLHFCQUFxQjtvQ0FBckIscUJBQXFCLGNBRGIsWUFBWTttQ0FDcEIscUJBQXFCO2NBRGpDLFFBQVE7ZUFBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFDOztBQWlDbkMsTUFBTSxVQUFVLGtCQUFrQixDQUFDLE1BQTZCLEVBQUUsV0FBb0I7SUFDcEYsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7UUFDeEMsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQzNCO1NBQU0sSUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO1FBQzlCLE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUE2QjtJQUMzRCxJQUFNLEtBQUssR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxpQkFBaUIsQ0FBQztJQUM3RCxPQUFPLElBQUssS0FBYSxFQUFFLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sVUFBVSx1QkFBdUIsQ0FDbkMsZ0JBQWtDLEVBQUUsUUFBZ0IsRUFBRSxPQUFtQztJQUFuQyx3QkFBQSxFQUFBLFlBQW1DO0lBQzNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FDNUIsU0FBd0IsRUFBRSxRQUFrQixFQUFFLGdCQUFrQyxFQUNoRixRQUFrQixFQUFFLGdCQUFrQztJQUN4RCxJQUFNLGlCQUFpQixHQUNuQixJQUFJLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFFakcsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FQUF9CQVNFX0hSRUYsIENvbW1vbk1vZHVsZSwgSGFzaExvY2F0aW9uU3RyYXRlZ3ksIExvY2F0aW9uLCBMb2NhdGlvblN0cmF0ZWd5LCBQYXRoTG9jYXRpb25TdHJhdGVneSwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG5pbXBvcnQgeyRsb2NhdGlvblNoaW0sICRsb2NhdGlvblNoaW1Qcm92aWRlcn0gZnJvbSAnLi9sb2NhdGlvbl9zaGltJztcbmltcG9ydCB7QW5ndWxhckpTVXJsQ29kZWMsIFVybENvZGVjfSBmcm9tICcuL3BhcmFtcyc7XG5cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIExvY2F0aW9uVXBncmFkZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb25VcGdyYWRlQ29uZmlnIHtcbiAgdXNlSGFzaD86IGJvb2xlYW47XG4gIGhhc2hQcmVmaXg/OiBzdHJpbmc7XG4gIHVybENvZGVjPzogdHlwZW9mIFVybENvZGVjO1xuICBzZXJ2ZXJCYXNlSHJlZj86IHN0cmluZztcbiAgYXBwQmFzZUhyZWY/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogSXMgdXNlZCBpbiBESSB0byBjb25maWd1cmUgdGhlIGxvY2F0aW9uIHVwZ3JhZGUgcGFja2FnZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04gPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxMb2NhdGlvblVwZ3JhZGVDb25maWc+KCdMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04nKTtcblxuY29uc3QgQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdBUFBfQkFTRV9IUkVGX1JFU09MVkVEJyk7XG5cbi8qKlxuICogTW9kdWxlIHVzZWQgZm9yIGNvbmZpZ3VyaW5nIEFuZ3VsYXIncyBMb2NhdGlvblVwZ3JhZGVTZXJ2aWNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXX0pXG5leHBvcnQgY2xhc3MgTG9jYXRpb25VcGdyYWRlTW9kdWxlIHtcbiAgc3RhdGljIGNvbmZpZyhjb25maWc/OiBMb2NhdGlvblVwZ3JhZGVDb25maWcpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPExvY2F0aW9uVXBncmFkZU1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogTG9jYXRpb25VcGdyYWRlTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIExvY2F0aW9uLFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogJGxvY2F0aW9uU2hpbSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBwcm92aWRlJGxvY2F0aW9uLFxuICAgICAgICAgIGRlcHM6IFtVcGdyYWRlTW9kdWxlLCBMb2NhdGlvbiwgUGxhdGZvcm1Mb2NhdGlvbiwgVXJsQ29kZWMsIExvY2F0aW9uU3RyYXRlZ3ldXG4gICAgICAgIH0sXG4gICAgICAgIHtwcm92aWRlOiBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sIHVzZVZhbHVlOiBjb25maWcgPyBjb25maWcgOiB7fX0sXG4gICAgICAgIHtwcm92aWRlOiBVcmxDb2RlYywgdXNlRmFjdG9yeTogcHJvdmlkZVVybENvZGVjLCBkZXBzOiBbTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OXX0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBBUFBfQkFTRV9IUkVGX1JFU09MVkVELFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGVBcHBCYXNlSHJlZixcbiAgICAgICAgICBkZXBzOiBbTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OLCBbbmV3IEluamVjdChBUFBfQkFTRV9IUkVGKSwgbmV3IE9wdGlvbmFsKCldXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogTG9jYXRpb25TdHJhdGVneSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBwcm92aWRlTG9jYXRpb25TdHJhdGVneSxcbiAgICAgICAgICBkZXBzOiBbXG4gICAgICAgICAgICBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgICAgICAgQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCxcbiAgICAgICAgICAgIExPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTixcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVBcHBCYXNlSHJlZihjb25maWc6IExvY2F0aW9uVXBncmFkZUNvbmZpZywgYXBwQmFzZUhyZWY/OiBzdHJpbmcpIHtcbiAgaWYgKGNvbmZpZyAmJiBjb25maWcuYXBwQmFzZUhyZWYgIT0gbnVsbCkge1xuICAgIHJldHVybiBjb25maWcuYXBwQmFzZUhyZWY7XG4gIH0gZWxzZSBpZiAoYXBwQmFzZUhyZWYgIT0gbnVsbCkge1xuICAgIHJldHVybiBhcHBCYXNlSHJlZjtcbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlVXJsQ29kZWMoY29uZmlnOiBMb2NhdGlvblVwZ3JhZGVDb25maWcpIHtcbiAgY29uc3QgY29kZWMgPSBjb25maWcgJiYgY29uZmlnLnVybENvZGVjIHx8IEFuZ3VsYXJKU1VybENvZGVjO1xuICByZXR1cm4gbmV3IChjb2RlYyBhcyBhbnkpKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTG9jYXRpb25TdHJhdGVneShcbiAgICBwbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZjogc3RyaW5nLCBvcHRpb25zOiBMb2NhdGlvblVwZ3JhZGVDb25maWcgPSB7fSkge1xuICByZXR1cm4gb3B0aW9ucy51c2VIYXNoID8gbmV3IEhhc2hMb2NhdGlvblN0cmF0ZWd5KHBsYXRmb3JtTG9jYXRpb24sIGJhc2VIcmVmKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGF0aExvY2F0aW9uU3RyYXRlZ3kocGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZSRsb2NhdGlvbihcbiAgICBuZ1VwZ3JhZGU6IFVwZ3JhZGVNb2R1bGUsIGxvY2F0aW9uOiBMb2NhdGlvbiwgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICB1cmxDb2RlYzogVXJsQ29kZWMsIGxvY2F0aW9uU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kpIHtcbiAgY29uc3QgJGxvY2F0aW9uUHJvdmlkZXIgPVxuICAgICAgbmV3ICRsb2NhdGlvblNoaW1Qcm92aWRlcihuZ1VwZ3JhZGUsIGxvY2F0aW9uLCBwbGF0Zm9ybUxvY2F0aW9uLCB1cmxDb2RlYywgbG9jYXRpb25TdHJhdGVneSk7XG5cbiAgcmV0dXJuICRsb2NhdGlvblByb3ZpZGVyLiRnZXQoKTtcbn0iXX0=