/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_BASE_HREF, CommonModule, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation, } from '@angular/common';
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
export const LOCATION_UPGRADE_CONFIGURATION = new InjectionToken(ngDevMode ? 'LOCATION_UPGRADE_CONFIGURATION' : '');
const APP_BASE_HREF_RESOLVED = new InjectionToken(ngDevMode ? 'APP_BASE_HREF_RESOLVED' : '');
/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](https://angular.io/guide/upgrade#using-the-unified-angular-location-service)
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
                    deps: [UpgradeModule, Location, PlatformLocation, UrlCodec, LocationStrategy],
                },
                { provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {} },
                { provide: UrlCodec, useFactory: provideUrlCodec, deps: [LOCATION_UPGRADE_CONFIGURATION] },
                {
                    provide: APP_BASE_HREF_RESOLVED,
                    useFactory: provideAppBaseHref,
                    deps: [LOCATION_UPGRADE_CONFIGURATION, [new Inject(APP_BASE_HREF), new Optional()]],
                },
                {
                    provide: LocationStrategy,
                    useFactory: provideLocationStrategy,
                    deps: [PlatformLocation, APP_BASE_HREF_RESOLVED, LOCATION_UPGRADE_CONFIGURATION],
                },
            ],
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: LocationUpgradeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: LocationUpgradeModule, imports: [CommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: LocationUpgradeModule, imports: [CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: LocationUpgradeModule, decorators: [{
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
    const codec = (config && config.urlCodec) || AngularJSUrlCodec;
    return new codec();
}
export function provideLocationStrategy(platformLocation, baseHref, options = {}) {
    return options.useHash
        ? new HashLocationStrategy(platformLocation, baseHref)
        : new PathLocationStrategy(platformLocation, baseHref);
}
export function provide$location(ngUpgrade, location, platformLocation, urlCodec, locationStrategy) {
    const $locationProvider = new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);
    return $locationProvider.$get();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fdXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXBncmFkZS9zcmMvbG9jYXRpb25fdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGFBQWEsRUFDYixZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsb0JBQW9CLEVBQ3BCLGdCQUFnQixHQUNqQixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUF1QixRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RCxPQUFPLEVBQUMsYUFBYSxFQUFFLHFCQUFxQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDckUsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFFBQVEsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7QUErQnJEOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSw4QkFBOEIsR0FBRyxJQUFJLGNBQWMsQ0FDOUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUNsRCxDQUFDO0FBRUYsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLGNBQWMsQ0FDL0MsU0FBUyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUMxQyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQThCO1FBQzFDLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFNBQVMsRUFBRTtnQkFDVCxRQUFRO2dCQUNSO29CQUNFLE9BQU8sRUFBRSxhQUFhO29CQUN0QixVQUFVLEVBQUUsZ0JBQWdCO29CQUM1QixJQUFJLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQztpQkFDOUU7Z0JBQ0QsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3pFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLDhCQUE4QixDQUFDLEVBQUM7Z0JBQ3hGO29CQUNFLE9BQU8sRUFBRSxzQkFBc0I7b0JBQy9CLFVBQVUsRUFBRSxrQkFBa0I7b0JBQzlCLElBQUksRUFBRSxDQUFDLDhCQUE4QixFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUNwRjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZ0JBQWdCO29CQUN6QixVQUFVLEVBQUUsdUJBQXVCO29CQUNuQyxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxzQkFBc0IsRUFBRSw4QkFBOEIsQ0FBQztpQkFDakY7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO3lIQXpCVSxxQkFBcUI7MEhBQXJCLHFCQUFxQixZQURiLFlBQVk7MEhBQ3BCLHFCQUFxQixZQURiLFlBQVk7O3NHQUNwQixxQkFBcUI7a0JBRGpDLFFBQVE7bUJBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBQzs7QUE2Qm5DLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxNQUE2QixFQUFFLFdBQW9CO0lBQ3BGLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFLENBQUM7UUFDekMsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7U0FBTSxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMvQixPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUE2QjtJQUMzRCxNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksaUJBQWlCLENBQUM7SUFDL0QsT0FBTyxJQUFLLEtBQWEsRUFBRSxDQUFDO0FBQzlCLENBQUM7QUFFRCxNQUFNLFVBQVUsdUJBQXVCLENBQ3JDLGdCQUFrQyxFQUNsQyxRQUFnQixFQUNoQixVQUFpQyxFQUFFO0lBRW5DLE9BQU8sT0FBTyxDQUFDLE9BQU87UUFDcEIsQ0FBQyxDQUFDLElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO1FBQ3RELENBQUMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQzlCLFNBQXdCLEVBQ3hCLFFBQWtCLEVBQ2xCLGdCQUFrQyxFQUNsQyxRQUFrQixFQUNsQixnQkFBa0M7SUFFbEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHFCQUFxQixDQUNqRCxTQUFTLEVBQ1QsUUFBUSxFQUNSLGdCQUFnQixFQUNoQixRQUFRLEVBQ1IsZ0JBQWdCLENBQ2pCLENBQUM7SUFFRixPQUFPLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQVBQX0JBU0VfSFJFRixcbiAgQ29tbW9uTW9kdWxlLFxuICBIYXNoTG9jYXRpb25TdHJhdGVneSxcbiAgTG9jYXRpb24sXG4gIExvY2F0aW9uU3RyYXRlZ3ksXG4gIFBhdGhMb2NhdGlvblN0cmF0ZWd5LFxuICBQbGF0Zm9ybUxvY2F0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG5cbmltcG9ydCB7JGxvY2F0aW9uU2hpbSwgJGxvY2F0aW9uU2hpbVByb3ZpZGVyfSBmcm9tICcuL2xvY2F0aW9uX3NoaW0nO1xuaW1wb3J0IHtBbmd1bGFySlNVcmxDb2RlYywgVXJsQ29kZWN9IGZyb20gJy4vcGFyYW1zJztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIExvY2F0aW9uVXBncmFkZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRpb25VcGdyYWRlQ29uZmlnIHtcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgd2hldGhlciB0aGUgbG9jYXRpb24gdXBncmFkZSBtb2R1bGUgc2hvdWxkIHVzZSB0aGUgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YFxuICAgKiBvciB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YFxuICAgKi9cbiAgdXNlSGFzaD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBoYXNoIHByZWZpeCB1c2VkIGluIHRoZSBVUkwgd2hlbiB1c2luZyB0aGUgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YFxuICAgKi9cbiAgaGFzaFByZWZpeD86IHN0cmluZztcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIFVSTCBjb2RlYyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIFVSTHMuIERlZmF1bHQgaXMgdGhlIGBBbmd1bGFySlNDb2RlY2BcbiAgICovXG4gIHVybENvZGVjPzogdHlwZW9mIFVybENvZGVjO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgYmFzZSBocmVmIHdoZW4gdXNlZCBpbiBzZXJ2ZXItc2lkZSByZW5kZXJlZCBhcHBsaWNhdGlvbnNcbiAgICovXG4gIHNlcnZlckJhc2VIcmVmPzogc3RyaW5nO1xuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgYmFzZSBocmVmIHdoZW4gdXNlZCBpbiBjbGllbnQtc2lkZSByZW5kZXJlZCBhcHBsaWNhdGlvbnNcbiAgICovXG4gIGFwcEJhc2VIcmVmPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgcHJvdmlkZXIgdG9rZW4gdXNlZCB0byBjb25maWd1cmUgdGhlIGxvY2F0aW9uIHVwZ3JhZGUgbW9kdWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IExPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxMb2NhdGlvblVwZ3JhZGVDb25maWc+KFxuICBuZ0Rldk1vZGUgPyAnTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OJyA6ICcnLFxuKTtcblxuY29uc3QgQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KFxuICBuZ0Rldk1vZGUgPyAnQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCcgOiAnJyxcbik7XG5cbi8qKlxuICogYE5nTW9kdWxlYCB1c2VkIGZvciBwcm92aWRpbmcgYW5kIGNvbmZpZ3VyaW5nIEFuZ3VsYXIncyBVbmlmaWVkIExvY2F0aW9uIFNlcnZpY2UgZm9yIHVwZ3JhZGluZy5cbiAqXG4gKiBAc2VlIFtVc2luZyB0aGUgVW5pZmllZCBBbmd1bGFyIExvY2F0aW9uIFNlcnZpY2VdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS91cGdyYWRlI3VzaW5nLXRoZS11bmlmaWVkLWFuZ3VsYXItbG9jYXRpb24tc2VydmljZSlcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7aW1wb3J0czogW0NvbW1vbk1vZHVsZV19KVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uVXBncmFkZU1vZHVsZSB7XG4gIHN0YXRpYyBjb25maWcoY29uZmlnPzogTG9jYXRpb25VcGdyYWRlQ29uZmlnKTogTW9kdWxlV2l0aFByb3ZpZGVyczxMb2NhdGlvblVwZ3JhZGVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IExvY2F0aW9uVXBncmFkZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBMb2NhdGlvbixcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6ICRsb2NhdGlvblNoaW0sXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZSRsb2NhdGlvbixcbiAgICAgICAgICBkZXBzOiBbVXBncmFkZU1vZHVsZSwgTG9jYXRpb24sIFBsYXRmb3JtTG9jYXRpb24sIFVybENvZGVjLCBMb2NhdGlvblN0cmF0ZWd5XSxcbiAgICAgICAgfSxcbiAgICAgICAge3Byb3ZpZGU6IExPQ0FUSU9OX1VQR1JBREVfQ09ORklHVVJBVElPTiwgdXNlVmFsdWU6IGNvbmZpZyA/IGNvbmZpZyA6IHt9fSxcbiAgICAgICAge3Byb3ZpZGU6IFVybENvZGVjLCB1c2VGYWN0b3J5OiBwcm92aWRlVXJsQ29kZWMsIGRlcHM6IFtMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT05dfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEFQUF9CQVNFX0hSRUZfUkVTT0xWRUQsXG4gICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUFwcEJhc2VIcmVmLFxuICAgICAgICAgIGRlcHM6IFtMT0NBVElPTl9VUEdSQURFX0NPTkZJR1VSQVRJT04sIFtuZXcgSW5qZWN0KEFQUF9CQVNFX0hSRUYpLCBuZXcgT3B0aW9uYWwoKV1dLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogTG9jYXRpb25TdHJhdGVneSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBwcm92aWRlTG9jYXRpb25TdHJhdGVneSxcbiAgICAgICAgICBkZXBzOiBbUGxhdGZvcm1Mb2NhdGlvbiwgQVBQX0JBU0VfSFJFRl9SRVNPTFZFRCwgTE9DQVRJT05fVVBHUkFERV9DT05GSUdVUkFUSU9OXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFwcEJhc2VIcmVmKGNvbmZpZzogTG9jYXRpb25VcGdyYWRlQ29uZmlnLCBhcHBCYXNlSHJlZj86IHN0cmluZykge1xuICBpZiAoY29uZmlnICYmIGNvbmZpZy5hcHBCYXNlSHJlZiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGNvbmZpZy5hcHBCYXNlSHJlZjtcbiAgfSBlbHNlIGlmIChhcHBCYXNlSHJlZiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGFwcEJhc2VIcmVmO1xuICB9XG4gIHJldHVybiAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVVcmxDb2RlYyhjb25maWc6IExvY2F0aW9uVXBncmFkZUNvbmZpZykge1xuICBjb25zdCBjb2RlYyA9IChjb25maWcgJiYgY29uZmlnLnVybENvZGVjKSB8fCBBbmd1bGFySlNVcmxDb2RlYztcbiAgcmV0dXJuIG5ldyAoY29kZWMgYXMgYW55KSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3koXG4gIHBsYXRmb3JtTG9jYXRpb246IFBsYXRmb3JtTG9jYXRpb24sXG4gIGJhc2VIcmVmOiBzdHJpbmcsXG4gIG9wdGlvbnM6IExvY2F0aW9uVXBncmFkZUNvbmZpZyA9IHt9LFxuKSB7XG4gIHJldHVybiBvcHRpb25zLnVzZUhhc2hcbiAgICA/IG5ldyBIYXNoTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZilcbiAgICA6IG5ldyBQYXRoTG9jYXRpb25TdHJhdGVneShwbGF0Zm9ybUxvY2F0aW9uLCBiYXNlSHJlZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlJGxvY2F0aW9uKFxuICBuZ1VwZ3JhZGU6IFVwZ3JhZGVNb2R1bGUsXG4gIGxvY2F0aW9uOiBMb2NhdGlvbixcbiAgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgdXJsQ29kZWM6IFVybENvZGVjLFxuICBsb2NhdGlvblN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5LFxuKSB7XG4gIGNvbnN0ICRsb2NhdGlvblByb3ZpZGVyID0gbmV3ICRsb2NhdGlvblNoaW1Qcm92aWRlcihcbiAgICBuZ1VwZ3JhZGUsXG4gICAgbG9jYXRpb24sXG4gICAgcGxhdGZvcm1Mb2NhdGlvbixcbiAgICB1cmxDb2RlYyxcbiAgICBsb2NhdGlvblN0cmF0ZWd5LFxuICApO1xuXG4gIHJldHVybiAkbG9jYXRpb25Qcm92aWRlci4kZ2V0KCk7XG59XG4iXX0=