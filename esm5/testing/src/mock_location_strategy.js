import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { LocationStrategy } from '@angular/common';
import { EventEmitter, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * @publicApi
 */
var MockLocationStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(MockLocationStrategy, _super);
    function MockLocationStrategy() {
        var _this = _super.call(this) || this;
        _this.internalBaseHref = '/';
        _this.internalPath = '/';
        _this.internalTitle = '';
        _this.urlChanges = [];
        /** @internal */
        _this._subject = new EventEmitter();
        return _this;
    }
    MockLocationStrategy.prototype.simulatePopState = function (url) {
        this.internalPath = url;
        this._subject.emit(new _MockPopStateEvent(this.path()));
    };
    MockLocationStrategy.prototype.path = function (includeHash) {
        if (includeHash === void 0) { includeHash = false; }
        return this.internalPath;
    };
    MockLocationStrategy.prototype.prepareExternalUrl = function (internal) {
        if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
            return this.internalBaseHref + internal.substring(1);
        }
        return this.internalBaseHref + internal;
    };
    MockLocationStrategy.prototype.pushState = function (ctx, title, path, query) {
        this.internalTitle = title;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        var externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push(externalUrl);
    };
    MockLocationStrategy.prototype.replaceState = function (ctx, title, path, query) {
        this.internalTitle = title;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        var externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push('replace: ' + externalUrl);
    };
    MockLocationStrategy.prototype.onPopState = function (fn) { this._subject.subscribe({ next: fn }); };
    MockLocationStrategy.prototype.getBaseHref = function () { return this.internalBaseHref; };
    MockLocationStrategy.prototype.back = function () {
        if (this.urlChanges.length > 0) {
            this.urlChanges.pop();
            var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
            this.simulatePopState(nextUrl);
        }
    };
    MockLocationStrategy.prototype.forward = function () { throw 'not implemented'; };
    MockLocationStrategy.ngInjectableDef = i0.ΔdefineInjectable({ token: MockLocationStrategy, factory: function MockLocationStrategy_Factory(t) { return new (t || MockLocationStrategy)(); }, providedIn: null });
    return MockLocationStrategy;
}(LocationStrategy));
export { MockLocationStrategy };
/*@__PURE__*/ i0.ɵsetClassMetadata(MockLocationStrategy, [{
        type: Injectable
    }], function () { return []; }, null);
var _MockPopStateEvent = /** @class */ (function () {
    function _MockPopStateEvent(newUrl) {
        this.newUrl = newUrl;
        this.pop = true;
        this.type = 'popstate';
    }
    return _MockPopStateEvent;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFJdkQ7Ozs7O0dBS0c7QUFDSDtJQUMwQyxnREFBZ0I7SUFPeEQ7UUFBQSxZQUFnQixpQkFBTyxTQUFHO1FBTjFCLHNCQUFnQixHQUFXLEdBQUcsQ0FBQztRQUMvQixrQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixtQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQixnQkFBVSxHQUFhLEVBQUUsQ0FBQztRQUMxQixnQkFBZ0I7UUFDaEIsY0FBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDOztJQUN4QixDQUFDO0lBRTFCLCtDQUFnQixHQUFoQixVQUFpQixHQUFXO1FBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsbUNBQUksR0FBSixVQUFLLFdBQTRCO1FBQTVCLDRCQUFBLEVBQUEsbUJBQTRCO1FBQVksT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQUMsQ0FBQztJQUV4RSxpREFBa0IsR0FBbEIsVUFBbUIsUUFBZ0I7UUFDakMsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbkUsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0RDtRQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztJQUMxQyxDQUFDO0lBRUQsd0NBQVMsR0FBVCxVQUFVLEdBQVEsRUFBRSxLQUFhLEVBQUUsSUFBWSxFQUFFLEtBQWE7UUFDNUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFFM0IsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztRQUV4QixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDJDQUFZLEdBQVosVUFBYSxHQUFRLEVBQUUsS0FBYSxFQUFFLElBQVksRUFBRSxLQUFhO1FBQy9ELElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBRTNCLElBQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7UUFFeEIsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQseUNBQVUsR0FBVixVQUFXLEVBQXdCLElBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbkYsMENBQVcsR0FBWCxjQUF3QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFFdkQsbUNBQUksR0FBSjtRQUNFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDOUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztJQUVELHNDQUFPLEdBQVAsY0FBa0IsTUFBTSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7eUVBdkRqQyxvQkFBb0IsdUVBQXBCLG9CQUFvQjsrQkFwQmpDO0NBNEVDLEFBekRELENBQzBDLGdCQUFnQixHQXdEekQ7U0F4RFksb0JBQW9CO21DQUFwQixvQkFBb0I7Y0FEaEMsVUFBVTs7QUEyRFg7SUFHRSw0QkFBbUIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFGakMsUUFBRyxHQUFZLElBQUksQ0FBQztRQUNwQixTQUFJLEdBQVcsVUFBVSxDQUFDO0lBQ1UsQ0FBQztJQUN2Qyx5QkFBQztBQUFELENBQUMsQUFKRCxJQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuXG4vKipcbiAqIEEgbW9jayBpbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gdGhhdCBhbGxvd3MgdGVzdHMgdG8gZmlyZSBzaW11bGF0ZWRcbiAqIGxvY2F0aW9uIGV2ZW50cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBpbnRlcm5hbEJhc2VIcmVmOiBzdHJpbmcgPSAnLyc7XG4gIGludGVybmFsUGF0aDogc3RyaW5nID0gJy8nO1xuICBpbnRlcm5hbFRpdGxlOiBzdHJpbmcgPSAnJztcbiAgdXJsQ2hhbmdlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcigpOyB9XG5cbiAgc2ltdWxhdGVQb3BTdGF0ZSh1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJuYWxQYXRoID0gdXJsO1xuICAgIHRoaXMuX3N1YmplY3QuZW1pdChuZXcgX01vY2tQb3BTdGF0ZUV2ZW50KHRoaXMucGF0aCgpKSk7XG4gIH1cblxuICBwYXRoKGluY2x1ZGVIYXNoOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5pbnRlcm5hbFBhdGg7IH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKGludGVybmFsLnN0YXJ0c1dpdGgoJy8nKSAmJiB0aGlzLmludGVybmFsQmFzZUhyZWYuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZiArIGludGVybmFsLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZiArIGludGVybmFsO1xuICB9XG5cbiAgcHVzaFN0YXRlKGN0eDogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmludGVybmFsVGl0bGUgPSB0aXRsZTtcblxuICAgIGNvbnN0IHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG5cbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKGN0eDogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmludGVybmFsVGl0bGUgPSB0aXRsZTtcblxuICAgIGNvbnN0IHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG5cbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goJ3JlcGxhY2U6ICcgKyBleHRlcm5hbFVybCk7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9zdWJqZWN0LnN1YnNjcmliZSh7bmV4dDogZm59KTsgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWY7IH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnVybENoYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VzLnBvcCgpO1xuICAgICAgY29uc3QgbmV4dFVybCA9IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGggPiAwID8gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlcy5sZW5ndGggLSAxXSA6ICcnO1xuICAgICAgdGhpcy5zaW11bGF0ZVBvcFN0YXRlKG5leHRVcmwpO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG59XG5cbmNsYXNzIF9Nb2NrUG9wU3RhdGVFdmVudCB7XG4gIHBvcDogYm9vbGVhbiA9IHRydWU7XG4gIHR5cGU6IHN0cmluZyA9ICdwb3BzdGF0ZSc7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuZXdVcmw6IHN0cmluZykge31cbn1cbiJdfQ==