/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/testing/src/mock_location_strategy.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { LocationStrategy } from '@angular/common';
import { EventEmitter, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A mock implementation of {\@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * \@publicApi
 */
export class MockLocationStrategy extends LocationStrategy {
    constructor() {
        super();
        this.internalBaseHref = '/';
        this.internalPath = '/';
        this.internalTitle = '';
        this.urlChanges = [];
        /**
         * \@internal
         */
        this._subject = new EventEmitter();
        this.stateChanges = [];
    }
    /**
     * @param {?} url
     * @return {?}
     */
    simulatePopState(url) {
        this.internalPath = url;
        this._subject.emit(new _MockPopStateEvent(this.path()));
    }
    /**
     * @param {?=} includeHash
     * @return {?}
     */
    path(includeHash = false) {
        return this.internalPath;
    }
    /**
     * @param {?} internal
     * @return {?}
     */
    prepareExternalUrl(internal) {
        if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
            return this.internalBaseHref + internal.substring(1);
        }
        return this.internalBaseHref + internal;
    }
    /**
     * @param {?} ctx
     * @param {?} title
     * @param {?} path
     * @param {?} query
     * @return {?}
     */
    pushState(ctx, title, path, query) {
        // Add state change to changes array
        this.stateChanges.push(ctx);
        this.internalTitle = title;
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        /** @type {?} */
        const externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push(externalUrl);
    }
    /**
     * @param {?} ctx
     * @param {?} title
     * @param {?} path
     * @param {?} query
     * @return {?}
     */
    replaceState(ctx, title, path, query) {
        // Reset the last index of stateChanges to the ctx (state) object
        this.stateChanges[(this.stateChanges.length || 1) - 1] = ctx;
        this.internalTitle = title;
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        /** @type {?} */
        const externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push('replace: ' + externalUrl);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onPopState(fn) {
        this._subject.subscribe({ next: fn });
    }
    /**
     * @return {?}
     */
    getBaseHref() {
        return this.internalBaseHref;
    }
    /**
     * @return {?}
     */
    back() {
        if (this.urlChanges.length > 0) {
            this.urlChanges.pop();
            this.stateChanges.pop();
            /** @type {?} */
            const nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
            this.simulatePopState(nextUrl);
        }
    }
    /**
     * @return {?}
     */
    forward() {
        throw 'not implemented';
    }
    /**
     * @return {?}
     */
    getState() {
        return this.stateChanges[(this.stateChanges.length || 1) - 1];
    }
}
MockLocationStrategy.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MockLocationStrategy.ctorParameters = () => [];
/** @nocollapse */ MockLocationStrategy.ɵfac = function MockLocationStrategy_Factory(t) { return new (t || MockLocationStrategy)(); };
/** @nocollapse */ MockLocationStrategy.ɵprov = i0.ɵɵdefineInjectable({ token: MockLocationStrategy, factory: MockLocationStrategy.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MockLocationStrategy, [{
        type: Injectable
    }], function () { return []; }, null); })();
if (false) {
    /** @type {?} */
    MockLocationStrategy.prototype.internalBaseHref;
    /** @type {?} */
    MockLocationStrategy.prototype.internalPath;
    /** @type {?} */
    MockLocationStrategy.prototype.internalTitle;
    /** @type {?} */
    MockLocationStrategy.prototype.urlChanges;
    /**
     * \@internal
     * @type {?}
     */
    MockLocationStrategy.prototype._subject;
    /**
     * @type {?}
     * @private
     */
    MockLocationStrategy.prototype.stateChanges;
}
class _MockPopStateEvent {
    /**
     * @param {?} newUrl
     */
    constructor(newUrl) {
        this.newUrl = newUrl;
        this.pop = true;
        this.type = 'popstate';
    }
}
if (false) {
    /** @type {?} */
    _MockPopStateEvent.prototype.pop;
    /** @type {?} */
    _MockPopStateEvent.prototype.type;
    /** @type {?} */
    _MockPopStateEvent.prototype.newUrl;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBUUEsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLFlBQVksRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQVd2RCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsZ0JBQWdCO0lBUXhEO1FBQ0UsS0FBSyxFQUFFLENBQUM7UUFSVixxQkFBZ0IsR0FBVyxHQUFHLENBQUM7UUFDL0IsaUJBQVksR0FBVyxHQUFHLENBQUM7UUFDM0Isa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFDM0IsZUFBVSxHQUFhLEVBQUUsQ0FBQzs7OztRQUUxQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDekMsaUJBQVksR0FBVSxFQUFFLENBQUM7SUFHakMsQ0FBQzs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFXO1FBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDOzs7OztJQUVELElBQUksQ0FBQyxjQUF1QixLQUFLO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDOzs7OztJQUVELGtCQUFrQixDQUFDLFFBQWdCO1FBQ2pDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25FLE9BQU8s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QStCOztJQUMvQiw0Q0FBMkI7O0lBQzNCLDZDQUEyQjs7SUFDM0IsMENBQTBCOzs7OztJQUUxQix3Q0FBaUQ7Ozs7O0lBQ2pELDRDQUFpQzs7QUF5RW5DLE1BQU0sa0JBQWtCOzs7O0lBR3RCLFlBQW1CLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRmpDLFFBQUcsR0FBWSxJQUFJLENBQUM7UUFDcEIsU0FBSSxHQUFXLFVBQVUsQ0FBQztJQUNVLENBQUM7Q0FDdEM7OztJQUhDLGlDQUFvQjs7SUFDcEIsa0NBQTBCOztJQUNkLG9DQUFxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cblxuLyoqXG4gKiBBIG1vY2sgaW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IHRoYXQgYWxsb3dzIHRlc3RzIHRvIGZpcmUgc2ltdWxhdGVkXG4gKiBsb2NhdGlvbiBldmVudHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0xvY2F0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgaW50ZXJuYWxCYXNlSHJlZjogc3RyaW5nID0gJy8nO1xuICBpbnRlcm5hbFBhdGg6IHN0cmluZyA9ICcvJztcbiAgaW50ZXJuYWxUaXRsZTogc3RyaW5nID0gJyc7XG4gIHVybENoYW5nZXM6IHN0cmluZ1tdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBwcml2YXRlIHN0YXRlQ2hhbmdlczogYW55W10gPSBbXTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHNpbXVsYXRlUG9wU3RhdGUodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmludGVybmFsUGF0aCA9IHVybDtcbiAgICB0aGlzLl9zdWJqZWN0LmVtaXQobmV3IF9Nb2NrUG9wU3RhdGVFdmVudCh0aGlzLnBhdGgoKSkpO1xuICB9XG5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFBhdGg7XG4gIH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKGludGVybmFsLnN0YXJ0c1dpdGgoJy8nKSAmJiB0aGlzLmludGVybmFsQmFzZUhyZWYuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZiArIGludGVybmFsLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZiArIGludGVybmFsO1xuICB9XG5cbiAgcHVzaFN0YXRlKGN0eDogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBBZGQgc3RhdGUgY2hhbmdlIHRvIGNoYW5nZXMgYXJyYXlcbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5wdXNoKGN0eCk7XG5cbiAgICB0aGlzLmludGVybmFsVGl0bGUgPSB0aXRsZTtcblxuICAgIGNvbnN0IHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG5cbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKGN0eDogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBSZXNldCB0aGUgbGFzdCBpbmRleCBvZiBzdGF0ZUNoYW5nZXMgdG8gdGhlIGN0eCAoc3RhdGUpIG9iamVjdFxuICAgIHRoaXMuc3RhdGVDaGFuZ2VzWyh0aGlzLnN0YXRlQ2hhbmdlcy5sZW5ndGggfHwgMSkgLSAxXSA9IGN0eDtcblxuICAgIHRoaXMuaW50ZXJuYWxUaXRsZSA9IHRpdGxlO1xuXG4gICAgY29uc3QgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gKCc/JyArIHF1ZXJ5KSA6ICcnKTtcbiAgICB0aGlzLmludGVybmFsUGF0aCA9IHVybDtcblxuICAgIGNvbnN0IGV4dGVybmFsVXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsKTtcbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCgncmVwbGFjZTogJyArIGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fc3ViamVjdC5zdWJzY3JpYmUoe25leHQ6IGZufSk7XG4gIH1cblxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWY7XG4gIH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnVybENoYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VzLnBvcCgpO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMucG9wKCk7XG4gICAgICBjb25zdCBuZXh0VXJsID0gdGhpcy51cmxDaGFuZ2VzLmxlbmd0aCA+IDAgPyB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VzLmxlbmd0aCAtIDFdIDogJyc7XG4gICAgICB0aGlzLnNpbXVsYXRlUG9wU3RhdGUobmV4dFVybCk7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHtcbiAgICB0aHJvdyAnbm90IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlQ2hhbmdlc1sodGhpcy5zdGF0ZUNoYW5nZXMubGVuZ3RoIHx8IDEpIC0gMV07XG4gIH1cbn1cblxuY2xhc3MgX01vY2tQb3BTdGF0ZUV2ZW50IHtcbiAgcG9wOiBib29sZWFuID0gdHJ1ZTtcbiAgdHlwZTogc3RyaW5nID0gJ3BvcHN0YXRlJztcbiAgY29uc3RydWN0b3IocHVibGljIG5ld1VybDogc3RyaW5nKSB7fVxufVxuIl19