/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
export const LOCATION_UPGRADE_CONFIGURATION = new InjectionToken('LOCATION_UPGRADE_CONFIGURATION');
const APP_BASE_HREF_RESOLVED = new InjectionToken('APP_BASE_HREF_RESOLVED');
/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](guide/upgrade#using-the-unified-angular-location-service)
 *
 * @publicApi
 */
export class LocationUpgradeModule {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-rc.0+sha-6f6ad02", ngImport: i0, type: LocationUpgradeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.1.0-rc.0+sha-6f6ad02", ngImport: i0, type: LocationUpgradeModule, imports: [CommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.1.0-rc.0+sha-6f6ad02", ngImport: i0, type: LocationUpgradeModule, imports: [CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-rc.0+sha-6f6ad02", ngImport: i0, type: LocationUpgradeModule, decorators: [{
            type: NgModule,
            args: [{ imports: [CommonModule] }]
        }] });
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
    const codec = config && config.urlCodec || AngularJSUrlCodec;
    return new codec();
}
export function provideLocationStrategy(platformLocation, baseHref, options = {}) {
    return options.useHash ? new HashLocationStrategy(platformLocation, baseHref) :
        new PathLocationStrategy(platformLocation, baseHref);
}
export function provide$location(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
    const $locationProvider = new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);
    return $locationProvider.$get();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdEosT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQXVCLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRXRELE9BQU8sRUFBQyxhQUFhLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsUUFBUSxFQUFDLE1BQU0sVUFBVSxDQUFDOztBQWdDckQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixHQUN2QyxJQUFJLGNBQWMsQ0FBd0IsZ0NBQWdDLENBQUMsQ0FBQztBQUVoRixNQUFNLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFTLHdCQUF3QixDQUFDLENBQUM7QUFFcEY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQThCO1FBQzFDLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFNBQVMsRUFBRTtnQkFDVCxRQUFRO2dCQUNSO29CQUNFLE9BQU8sRUFBRSxhQUFhO29CQUN0QixVQUFVLEVBQUUsZ0JBQWdCO29CQUM1QixJQUFJLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQztpQkFDOUU7Z0JBQ0QsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3pFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLDhCQUE4QixDQUFDLEVBQUM7Z0JBQ3hGO29CQUNFLE9BQU8sRUFBRSxzQkFBc0I7b0JBQy9CLFVBQVUsRUFBRSxrQkFBa0I7b0JBQzlCLElBQUksRUFBRSxDQUFDLDhCQUE4QixFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZ0JBQWdCO29CQUN6QixVQUFVLEVBQUUsdUJBQXVCO29CQUNuQyxJQUFJLEVBQUU7d0JBQ0osZ0JBQWdCO3dCQUNoQixzQkFBc0I7d0JBQ3RCLDhCQUE4QjtxQkFDL0I7aUJBQ0Y7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO3lIQTdCVSxxQkFBcUI7MEhBQXJCLHFCQUFxQixZQURiLFlBQVk7MEhBQ3BCLHFCQUFxQixZQURiLFlBQVk7O3NHQUNwQixxQkFBcUI7a0JBRGpDLFFBQVE7bUJBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBQzs7QUFpQ25DLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxNQUE2QixFQUFFLFdBQW9CO0lBQ3BGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFLENBQUM7UUFDekMsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7U0FBTSxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMvQixPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUE2QjtJQUMzRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxpQkFBaUIsQ0FBQztJQUM3RCxPQUFPLElBQUssS0FBYSxFQUFFLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sVUFBVSx1QkFBdUIsQ0FDbkMsZ0JBQWtDLEVBQUUsUUFBZ0IsRUFBRSxVQUFpQyxFQUFFO0lBQzNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FDNUIsU0FBd0IsRUFBRSxRQUFrQixFQUFFLGdCQUFrQyxFQUNoRixRQUFrQixFQUFFLGdCQUFrQztJQUN4RCxNQUFNLGlCQUFpQixHQUNuQixJQUFJLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFFakcsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVBQX0JBU0VfSFJFRiwgQ29tbW9uTW9kdWxlLCBIYXNoTG9jYXRpb25TdHJhdGVneSwgTG9jYXRpb24sIExvY2F0aW9uU3RyYXRlZ3ksIFBhdGhMb2NhdGlvblN0cmF0ZWd5LCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG5cbmltcG9ydCB7JGxvY2F0aW9uU2hpbSwgJGxvY2F0aW9uU2hpbVByb3ZpZGVyfSBmcm9tICcuL2xvY2F0aW9uX3NoaW0nO1xuaW1wb3J0IHtBbmd1bGFySlNVcmxDb2RlYywgVXJsQ29kZWN9IGZyb20gJy4vcGFyYW1zJztcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgTG9jYXRpb25VcGdyYWRlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdGlvblVwZ3JhZGVDb25maWcge1xuICAvKipcbiAgICogQ29uZmlndXJlcyB3aGV0aGVyIHRoZSBsb2NhdGlvbiB1cGdyYWRlIG1vZHVsZSBzaG91bGQgdXNlIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqIG9yIHRoZSBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqL1xuICB1c2VIYXNoPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGhhc2ggcHJlZml4IHVzZWQgaW4gdGhlIFVSTCB3aGVuIHVzaW5nIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgXG4gICAqL1xuICBoYXNoUHJlZml4Pzogc3RyaW5nO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgVVJMIGNvZGVjIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgVVJMcy4gRGVmYXVsdCBpcyB0aGUgYEFuZ3VsYXJKU0NvZGVjYFxuICAgKi9cbiAgdXJsQ29kZWM/OiB0eXBlb2YgVXJsQ29kZWM7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBiYXNlIGhyZWYgd2hlbiB1c2VkIGluIHNlcnZlci1zaWRlIHJlbmRlcmVkIGFwcGxpY2F0aW9uc1xuICAgKi9cbiAgc2VydmVyQmFzZUhyZWY/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBiYXNlIGhyZWYgd2hlbiB1c2VkIGluIGNsaWVudC1zaWRlIHJlbmRlcmVkIGFwcGxpY2F0aW9uc1xuICAgKi9cbiAgYXBwQmFzZUhyZWY/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBwcm92aWRlciB0b2tlbiB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgbG9jYXRpb24gdXBncmFkZSBtb2R1bGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TG9jYXRpb25VcGdyYWRlQ29uZmlnPignTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OJyk7XG5cbmNvbnN0IEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCcpO1xuXG4vKipcbiAqIGBOZ01vZHVsZWAgdXNlZCBmb3IgcHJvdmlkaW5nIGFuZCBjb25maWd1cmluZyBBbmd1bGFyJ3MgVW5pZmllZCBMb2NhdGlvbiBTZXJ2aWNlIGZvciB1cGdyYWRpbmcuXG4gKlxuICogQHNlZSBbVXNpbmcgdGhlIFVuaWZpZWQgQW5ndWxhciBMb2NhdGlvbiBTZXJ2aWNlXShndWlkZS91cGdyYWRlI3VzaW5nLXRoZS11bmlmaWVkLWFuZ3VsYXItbG9jYXRpb24tc2VydmljZSlcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7aW1wb3J0czogW0NvbW1vbk1vZHVsZV19KVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uVXBncmFkZU1vZHVsZSB7XG4gIHN0YXRpYyBjb25maWcoY29uZmlnPzogTG9jYXRpb25VcGdyYWRlQ29uZmlnKTogTW9kdWxlV2l0aFByb3ZpZGVyczxMb2NhdGlvblVwZ3JhZGVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IExvY2F0aW9uVXBncmFkZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBMb2NhdGlvbixcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6ICRsb2NhdGlvblNoaW0sXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZSRsb2NhdGlvbixcbiAgICAgICAgICBkZXBzOiBbVXBncmFkZU1vZHVsZSwgTG9jYXRpb24sIFBsYXRmb3JtTG9jYXRpb24sIFVybENvZGVjLCBMb2NhdGlvblN0cmF0ZWd5XVxuICAgICAgICB9LFxuICAgICAgICB7cHJvdmlkZTogTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OLCB1c2VWYWx1ZTogY29uZmlnID8gY29uZmlnIDoge319LFxuICAgICAgICB7cHJvdmlkZTogVXJsQ29kZWMsIHVzZUZhY3Rvcnk6IHByb3ZpZGVVcmxDb2RlYywgZGVwczogW0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTl19LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBwcm92aWRlQXBwQmFzZUhyZWYsXG4gICAgICAgICAgZGVwczogW0xPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiwgW25ldyBJbmplY3QoQVBQX0JBU0VfSFJFRiksIG5ldyBPcHRpb25hbCgpXV1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IExvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgZGVwczogW1xuICAgICAgICAgICAgUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgICAgICAgIEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQsXG4gICAgICAgICAgICBMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQXBwQmFzZUhyZWYoY29uZmlnOiBMb2NhdGlvblVwZ3JhZGVDb25maWcsIGFwcEJhc2VIcmVmPzogc3RyaW5nKSB7XG4gIGlmIChjb25maWcgJiYgY29uZmlnLmFwcEJhc2VIcmVmICE9IG51bGwpIHtcbiAgICByZXR1cm4gY29uZmlnLmFwcEJhc2VIcmVmO1xuICB9IGVsc2UgaWYgKGFwcEJhc2VIcmVmICE9IG51bGwpIHtcbiAgICByZXR1cm4gYXBwQmFzZUhyZWY7XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVVybENvZGVjKGNvbmZpZzogTG9jYXRpb25VcGdyYWRlQ29uZmlnKSB7XG4gIGNvbnN0IGNvZGVjID0gY29uZmlnICYmIGNvbmZpZy51cmxDb2RlYyB8fCBBbmd1bGFySlNVcmxDb2RlYztcbiAgcmV0dXJuIG5ldyAoY29kZWMgYXMgYW55KSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3koXG4gICAgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbiwgYmFzZUhyZWY6IHN0cmluZywgb3B0aW9uczogTG9jYXRpb25VcGdyYWRlQ29uZmlnID0ge30pIHtcbiAgcmV0dXJuIG9wdGlvbnMudXNlSGFzaCA/IG5ldyBIYXNoTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBhdGhMb2NhdGlvblN0cmF0ZWd5KHBsYXRmb3JtTG9jYXRpb24sIGJhc2VIcmVmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGUkbG9jYXRpb24oXG4gICAgbmdVcGdyYWRlOiBVcGdyYWRlTW9kdWxlLCBsb2NhdGlvbjogTG9jYXRpb24sIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gICAgdXJsQ29kZWM6IFVybENvZGVjLCBsb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5KSB7XG4gIGNvbnN0ICRsb2NhdGlvblByb3ZpZGVyID1cbiAgICAgIG5ldyAkbG9jYXRpb25TaGltUHJvdmlkZXIobmdVcGdyYWRlLCBsb2NhdGlvbiwgcGxhdGZvcm1Mb2NhdGlvbiwgdXJsQ29kZWMsIGxvY2F0aW9uU3RyYXRlZ3kpO1xuXG4gIHJldHVybiAkbG9jYXRpb25Qcm92aWRlci4kZ2V0KCk7XG59XG4iXX0=