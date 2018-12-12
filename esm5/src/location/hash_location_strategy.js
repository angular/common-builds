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
    }], [{
        type: PlatformLocation
    }, {
        type: undefined,
        decorators: [{
                type: Optional
            }, {
                type: Inject,
                args: [APP_BASE_HREF]
            }]
    }], null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbW1vbi9zcmMvbG9jYXRpb24vaGFzaF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzNELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxFQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BFLE9BQU8sRUFBeUIsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQzs7QUFJN0U7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0g7SUFDMEMsZ0RBQWdCO0lBRXhELDhCQUNZLGlCQUFtQyxFQUNSLFNBQWtCO1FBRnpELFlBR0UsaUJBQU8sU0FJUjtRQU5XLHVCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFGdkMsZUFBUyxHQUFXLEVBQUUsQ0FBQztRQUs3QixJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDckIsS0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDNUI7O0lBQ0gsQ0FBQztJQUVELHlDQUFVLEdBQVYsVUFBVyxFQUEwQjtRQUNuQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELDBDQUFXLEdBQVgsY0FBd0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVoRCxtQ0FBSSxHQUFKLFVBQUssV0FBNEI7UUFBNUIsNEJBQUEsRUFBQSxtQkFBNEI7UUFDL0IsK0NBQStDO1FBQy9DLDZDQUE2QztRQUM3QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLElBQUksSUFBSSxJQUFJLElBQUk7WUFBRSxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBRTdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNwRCxDQUFDO0lBRUQsaURBQWtCLEdBQWxCLFVBQW1CLFFBQWdCO1FBQ2pDLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM3RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzVDLENBQUM7SUFFRCx3Q0FBUyxHQUFULFVBQVUsS0FBVSxFQUFFLEtBQWEsRUFBRSxJQUFZLEVBQUUsV0FBbUI7UUFDcEUsSUFBSSxHQUFHLEdBQ0gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ25CLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCwyQ0FBWSxHQUFaLFVBQWEsS0FBVSxFQUFFLEtBQWEsRUFBRSxJQUFZLEVBQUUsV0FBbUI7UUFDdkUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNyRixJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ25CLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxzQ0FBTyxHQUFQLGNBQWtCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQsbUNBQUksR0FBSixjQUFlLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0VBbkRwQyxvQkFBb0IsdUVBQXBCLG9CQUFvQixZQUdBLGdCQUFnQixhQUN2QixhQUFhOytCQXhDdkM7Q0F3RkMsQUFyREQsQ0FDMEMsZ0JBQWdCLEdBb0R6RDtTQXBEWSxvQkFBb0I7bUNBQXBCLG9CQUFvQjtjQURoQyxVQUFVOztjQUlzQixnQkFBZ0I7Ozs7c0JBQzFDLFFBQVE7O3NCQUFJLE1BQU07dUJBQUMsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuXG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuL2xvY2F0aW9uJztcbmltcG9ydCB7QVBQX0JBU0VfSFJFRiwgTG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge0xvY2F0aW9uQ2hhbmdlTGlzdGVuZXIsIFBsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuXG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IHVzZWQgdG8gY29uZmlndXJlIHRoZSB7QGxpbmsgTG9jYXRpb259IHNlcnZpY2UgdG9cbiAqIHJlcHJlc2VudCBpdHMgc3RhdGUgaW4gdGhlXG4gKiBbaGFzaCBmcmFnbWVudF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVW5pZm9ybV9SZXNvdXJjZV9Mb2NhdG9yI1N5bnRheClcbiAqIG9mIHRoZSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgaWYgeW91IGNhbGwgYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tIy9mb29gLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL2xvY2F0aW9uL3RzL2hhc2hfbG9jYXRpb25fY29tcG9uZW50LnRzIHJlZ2lvbj0nTG9jYXRpb25Db21wb25lbnQnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhhc2hMb2NhdGlvblN0cmF0ZWd5IGV4dGVuZHMgTG9jYXRpb25TdHJhdGVneSB7XG4gIHByaXZhdGUgX2Jhc2VIcmVmOiBzdHJpbmcgPSAnJztcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChBUFBfQkFTRV9IUkVGKSBfYmFzZUhyZWY/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChfYmFzZUhyZWYgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYmFzZUhyZWYgPSBfYmFzZUhyZWY7XG4gICAgfVxuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25Qb3BTdGF0ZShmbik7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vbkhhc2hDaGFuZ2UoZm4pO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2Jhc2VIcmVmOyB9XG5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICAvLyB0aGUgaGFzaCB2YWx1ZSBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCBhIGAjYFxuICAgIC8vIGFuZCBpZiBpdCBpcyBlbXB0eSB0aGVuIGl0IHdpbGwgc3RheSBlbXB0eVxuICAgIGxldCBwYXRoID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5oYXNoO1xuICAgIGlmIChwYXRoID09IG51bGwpIHBhdGggPSAnIyc7XG5cbiAgICByZXR1cm4gcGF0aC5sZW5ndGggPiAwID8gcGF0aC5zdWJzdHJpbmcoMSkgOiBwYXRoO1xuICB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IExvY2F0aW9uLmpvaW5XaXRoU2xhc2godGhpcy5fYmFzZUhyZWYsIGludGVybmFsKTtcbiAgICByZXR1cm4gdXJsLmxlbmd0aCA+IDAgPyAoJyMnICsgdXJsKSA6IHVybDtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICBsZXQgdXJsOiBzdHJpbmd8bnVsbCA9XG4gICAgICAgIHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGggKyBMb2NhdGlvbi5ub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeVBhcmFtcykpO1xuICAgIGlmICh1cmwubGVuZ3RoID09IDApIHtcbiAgICAgIHVybCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWU7XG4gICAgfVxuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICBsZXQgdXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCArIExvY2F0aW9uLm5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgaWYgKHVybC5sZW5ndGggPT0gMCkge1xuICAgICAgdXJsID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZTtcbiAgICB9XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmJhY2soKTsgfVxufVxuIl19