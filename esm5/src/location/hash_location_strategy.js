import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, Optional } from '@angular/core';
import { Location } from './location';
import { APP_BASE_HREF, LocationStrategy } from './location_strategy';
import { PlatformLocation } from './platform_location';
import * as i0 from "@angular/core";
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/hash_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
var HashLocationStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(HashLocationStrategy, _super);
    function HashLocationStrategy(_platformLocation, _baseHref) {
        var _this = _super.call(this) || this;
        _this._platformLocation = _platformLocation;
        _this._baseHref = '';
        if (_baseHref != null) {
            _this._baseHref = _baseHref;
        }
        return _this;
    }
    HashLocationStrategy.prototype.onPopState = function (fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    };
    HashLocationStrategy.prototype.getBaseHref = function () { return this._baseHref; };
    HashLocationStrategy.prototype.path = function (includeHash) {
        if (includeHash === void 0) { includeHash = false; }
        // the hash value is always prefixed with a `#`
        // and if it is empty then it will stay empty
        var path = this._platformLocation.hash;
        if (path == null)
            path = '#';
        return path.length > 0 ? path.substring(1) : path;
    };
    HashLocationStrategy.prototype.prepareExternalUrl = function (internal) {
        var url = Location.joinWithSlash(this._baseHref, internal);
        return url.length > 0 ? ('#' + url) : url;
    };
    HashLocationStrategy.prototype.pushState = function (state, title, path, queryParams) {
        var url = this.prepareExternalUrl(path + Location.normalizeQueryParams(queryParams));
        if (url.length == 0) {
            url = this._platformLocation.pathname;
        }
        this._platformLocation.pushState(state, title, url);
    };
    HashLocationStrategy.prototype.replaceState = function (state, title, path, queryParams) {
        var url = this.prepareExternalUrl(path + Location.normalizeQueryParams(queryParams));
        if (url.length == 0) {
            url = this._platformLocation.pathname;
        }
        this._platformLocation.replaceState(state, title, url);
    };
    HashLocationStrategy.prototype.forward = function () { this._platformLocation.forward(); };
    HashLocationStrategy.prototype.back = function () { this._platformLocation.back(); };
    HashLocationStrategy.ngInjectableDef = i0.defineInjectable({ token: HashLocationStrategy, factory: function HashLocationStrategy_Factory(t) { return new (t || HashLocationStrategy)(i0.inject(PlatformLocation), i0.inject(APP_BASE_HREF, 8)); }, providedIn: null });
    return HashLocationStrategy;
}(LocationStrategy));
export { HashLocationStrategy };
/*@__PURE__*/ i0.ɵsetClassMetadata(HashLocationStrategy, [{
        type: Injectable
    }], function () { return [{
        type: PlatformLocation
    }, {
        type: undefined,
        decorators: [{
                type: Optional
            }, {
                type: Inject,
                args: [APP_BASE_HREF]
            }]
    }]; }, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvbG9jYXRpb24vaGFzaF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzNELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxFQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BFLE9BQU8sRUFBeUIsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQzs7QUFJN0U7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0g7SUFDMEMsZ0RBQWdCO0lBRXhELDhCQUNZLGlCQUFtQyxFQUNSLFNBQWtCO1FBRnpELFlBR0UsaUJBQU8sU0FJUjtRQU5XLHVCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFGdkMsZUFBUyxHQUFXLEVBQUUsQ0FBQztRQUs3QixJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDckIsS0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDNUI7O0lBQ0gsQ0FBQztJQUVELHlDQUFVLEdBQVYsVUFBVyxFQUEwQjtRQUNuQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELDBDQUFXLEdBQVgsY0FBd0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVoRCxtQ0FBSSxHQUFKLFVBQUssV0FBNEI7UUFBNUIsNEJBQUEsRUFBQSxtQkFBNEI7UUFDL0IsK0NBQStDO1FBQy9DLDZDQUE2QztRQUM3QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLElBQUksSUFBSSxJQUFJLElBQUk7WUFBRSxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBRTdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNwRCxDQUFDO0lBRUQsaURBQWtCLEdBQWxCLFVBQW1CLFFBQWdCO1FBQ2pDLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM3RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzVDLENBQUM7SUFFRCx3Q0FBUyxHQUFULFVBQVUsS0FBVSxFQUFFLEtBQWEsRUFBRSxJQUFZLEVBQUUsV0FBbUI7UUFDcEUsSUFBSSxHQUFHLEdBQ0gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ25CLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCwyQ0FBWSxHQUFaLFVBQWEsS0FBVSxFQUFFLEtBQWEsRUFBRSxJQUFZLEVBQUUsV0FBbUI7UUFDdkUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNyRixJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ25CLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxzQ0FBTyxHQUFQLGNBQWtCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQsbUNBQUksR0FBSixjQUFlLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0VBbkRwQyxvQkFBb0IsdUVBQXBCLG9CQUFvQixZQXZCRCxnQkFBZ0IsYUEyQnRCLGFBQWE7K0JBeEN2QztDQXdGQyxBQXJERCxDQUMwQyxnQkFBZ0IsR0FvRHpEO1NBcERZLG9CQUFvQjttQ0FBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O2NBdEJxQixnQkFBZ0I7Ozs7c0JBMkJ6QyxRQUFROztzQkFBSSxNQUFNO3VCQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9sb2NhdGlvbic7XG5pbXBvcnQge0FQUF9CQVNFX0hSRUYsIExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtMb2NhdGlvbkNoYW5nZUxpc3RlbmVyLCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcblxuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHRvXG4gKiByZXByZXNlbnQgaXRzIHN0YXRlIGluIHRoZVxuICogW2hhc2ggZnJhZ21lbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaWZvcm1fUmVzb3VyY2VfTG9jYXRvciNTeW50YXgpXG4gKiBvZiB0aGUgYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBjYWxsIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbSMvZm9vYC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9sb2NhdGlvbi90cy9oYXNoX2xvY2F0aW9uX2NvbXBvbmVudC50cyByZWdpb249J0xvY2F0aW9uQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIYXNoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBwcml2YXRlIF9iYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX0JBU0VfSFJFRikgX2Jhc2VIcmVmPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoX2Jhc2VIcmVmICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2Jhc2VIcmVmID0gX2Jhc2VIcmVmO1xuICAgIH1cbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUoZm4pO1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25IYXNoQ2hhbmdlKGZuKTtcbiAgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9iYXNlSHJlZjsgfVxuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgLy8gdGhlIGhhc2ggdmFsdWUgaXMgYWx3YXlzIHByZWZpeGVkIHdpdGggYSBgI2BcbiAgICAvLyBhbmQgaWYgaXQgaXMgZW1wdHkgdGhlbiBpdCB3aWxsIHN0YXkgZW1wdHlcbiAgICBsZXQgcGF0aCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uaGFzaDtcbiAgICBpZiAocGF0aCA9PSBudWxsKSBwYXRoID0gJyMnO1xuXG4gICAgcmV0dXJuIHBhdGgubGVuZ3RoID4gMCA/IHBhdGguc3Vic3RyaW5nKDEpIDogcGF0aDtcbiAgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB1cmwgPSBMb2NhdGlvbi5qb2luV2l0aFNsYXNoKHRoaXMuX2Jhc2VIcmVmLCBpbnRlcm5hbCk7XG4gICAgcmV0dXJuIHVybC5sZW5ndGggPiAwID8gKCcjJyArIHVybCkgOiB1cmw7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgbGV0IHVybDogc3RyaW5nfG51bGwgPVxuICAgICAgICB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICBpZiAodXJsLmxlbmd0aCA9PSAwKSB7XG4gICAgICB1cmwgPSB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIH1cbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKSB7XG4gICAgbGV0IHVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIGlmICh1cmwubGVuZ3RoID09IDApIHtcbiAgICAgIHVybCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWU7XG4gICAgfVxuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZm9yd2FyZCgpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5iYWNrKCk7IH1cbn1cbiJdfQ==