import { __extends } from "tslib";
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
    __extends(MockLocationStrategy, _super);
    function MockLocationStrategy() {
        var _this = _super.call(this) || this;
        _this.internalBaseHref = '/';
        _this.internalPath = '/';
        _this.internalTitle = '';
        _this.urlChanges = [];
        /** @internal */
        _this._subject = new EventEmitter();
        _this.stateChanges = [];
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
        // Add state change to changes array
        this.stateChanges.push(ctx);
        this.internalTitle = title;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        var externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push(externalUrl);
    };
    MockLocationStrategy.prototype.replaceState = function (ctx, title, path, query) {
        // Reset the last index of stateChanges to the ctx (state) object
        this.stateChanges[(this.stateChanges.length || 1) - 1] = ctx;
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
            this.stateChanges.pop();
            var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
            this.simulatePopState(nextUrl);
        }
    };
    MockLocationStrategy.prototype.forward = function () { throw 'not implemented'; };
    MockLocationStrategy.prototype.getState = function () { return this.stateChanges[(this.stateChanges.length || 1) - 1]; };
    MockLocationStrategy.ɵfac = function MockLocationStrategy_Factory(t) { return new (t || MockLocationStrategy)(); };
    MockLocationStrategy.ɵprov = i0.ɵɵdefineInjectable({ token: MockLocationStrategy, factory: MockLocationStrategy.ɵfac });
    return MockLocationStrategy;
}(LocationStrategy));
export { MockLocationStrategy };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MockLocationStrategy, [{
        type: Injectable
    }], function () { return []; }, null); })();
var _MockPopStateEvent = /** @class */ (function () {
    function _MockPopStateEvent(newUrl) {
        this.newUrl = newUrl;
        this.pop = true;
        this.type = 'popstate';
    }
    return _MockPopStateEvent;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFJdkQ7Ozs7O0dBS0c7QUFDSDtJQUMwQyx3Q0FBZ0I7SUFReEQ7UUFBQSxZQUFnQixpQkFBTyxTQUFHO1FBUDFCLHNCQUFnQixHQUFXLEdBQUcsQ0FBQztRQUMvQixrQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixtQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQixnQkFBVSxHQUFhLEVBQUUsQ0FBQztRQUMxQixnQkFBZ0I7UUFDaEIsY0FBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3pDLGtCQUFZLEdBQVUsRUFBRSxDQUFDOztJQUNSLENBQUM7SUFFMUIsK0NBQWdCLEdBQWhCLFVBQWlCLEdBQVc7UUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxtQ0FBSSxHQUFKLFVBQUssV0FBNEI7UUFBNUIsNEJBQUEsRUFBQSxtQkFBNEI7UUFBWSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFBQyxDQUFDO0lBRXhFLGlEQUFrQixHQUFsQixVQUFtQixRQUFnQjtRQUNqQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFD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QUFDLENBQUMsQ0FBQzs0RkFqRTNFLG9CQUFvQjtnRUFBcEIsb0JBQW9CLFdBQXBCLG9CQUFvQjsrQkFwQmpDO0NBc0ZDLEFBbkVELENBQzBDLGdCQUFnQixHQWtFekQ7U0FsRVksb0JBQW9CO2tEQUFwQixvQkFBb0I7Y0FEaEMsVUFBVTs7QUFxRVg7SUFHRSw0QkFBbUIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFGakMsUUFBRyxHQUFZLElBQUksQ0FBQztRQUNwQixTQUFJLEdBQVcsVUFBVSxDQUFDO0lBQ1UsQ0FBQztJQUN2Qyx5QkFBQztBQUFELENBQUMsQUFKRCxJQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuXG4vKipcbiAqIEEgbW9jayBpbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gdGhhdCBhbGxvd3MgdGVzdHMgdG8gZmlyZSBzaW11bGF0ZWRcbiAqIGxvY2F0aW9uIGV2ZW50cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBpbnRlcm5hbEJhc2VIcmVmOiBzdHJpbmcgPSAnLyc7XG4gIGludGVybmFsUGF0aDogc3RyaW5nID0gJy8nO1xuICBpbnRlcm5hbFRpdGxlOiBzdHJpbmcgPSAnJztcbiAgdXJsQ2hhbmdlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIHByaXZhdGUgc3RhdGVDaGFuZ2VzOiBhbnlbXSA9IFtdO1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTsgfVxuXG4gIHNpbXVsYXRlUG9wU3RhdGUodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmludGVybmFsUGF0aCA9IHVybDtcbiAgICB0aGlzLl9zdWJqZWN0LmVtaXQobmV3IF9Nb2NrUG9wU3RhdGVFdmVudCh0aGlzLnBhdGgoKSkpO1xuICB9XG5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxQYXRoOyB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChpbnRlcm5hbC5zdGFydHNXaXRoKCcvJykgJiYgdGhpcy5pbnRlcm5hbEJhc2VIcmVmLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWYgKyBpbnRlcm5hbC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWYgKyBpbnRlcm5hbDtcbiAgfVxuXG4gIHB1c2hTdGF0ZShjdHg6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gQWRkIHN0YXRlIGNoYW5nZSB0byBjaGFuZ2VzIGFycmF5XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMucHVzaChjdHgpO1xuXG4gICAgdGhpcy5pbnRlcm5hbFRpdGxlID0gdGl0bGU7XG5cbiAgICBjb25zdCB1cmwgPSBwYXRoICsgKHF1ZXJ5Lmxlbmd0aCA+IDAgPyAoJz8nICsgcXVlcnkpIDogJycpO1xuICAgIHRoaXMuaW50ZXJuYWxQYXRoID0gdXJsO1xuXG4gICAgY29uc3QgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwpO1xuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShjdHg6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gUmVzZXQgdGhlIGxhc3QgaW5kZXggb2Ygc3RhdGVDaGFuZ2VzIHRvIHRoZSBjdHggKHN0YXRlKSBvYmplY3RcbiAgICB0aGlzLnN0YXRlQ2hhbmdlc1sodGhpcy5zdGF0ZUNoYW5nZXMubGVuZ3RoIHx8IDEpIC0gMV0gPSBjdHg7XG5cbiAgICB0aGlzLmludGVybmFsVGl0bGUgPSB0aXRsZTtcblxuICAgIGNvbnN0IHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG5cbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goJ3JlcGxhY2U6ICcgKyBleHRlcm5hbFVybCk7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9zdWJqZWN0LnN1YnNjcmliZSh7bmV4dDogZm59KTsgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWY7IH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnVybENoYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VzLnBvcCgpO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMucG9wKCk7XG4gICAgICBjb25zdCBuZXh0VXJsID0gdGhpcy51cmxDaGFuZ2VzLmxlbmd0aCA+IDAgPyB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VzLmxlbmd0aCAtIDFdIDogJyc7XG4gICAgICB0aGlzLnNpbXVsYXRlUG9wU3RhdGUobmV4dFVybCk7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHsgcmV0dXJuIHRoaXMuc3RhdGVDaGFuZ2VzWyh0aGlzLnN0YXRlQ2hhbmdlcy5sZW5ndGggfHwgMSkgLSAxXTsgfVxufVxuXG5jbGFzcyBfTW9ja1BvcFN0YXRlRXZlbnQge1xuICBwb3A6IGJvb2xlYW4gPSB0cnVlO1xuICB0eXBlOiBzdHJpbmcgPSAncG9wc3RhdGUnO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmV3VXJsOiBzdHJpbmcpIHt9XG59XG4iXX0=