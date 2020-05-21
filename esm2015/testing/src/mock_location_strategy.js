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
let MockLocationStrategy = /** @class */ (() => {
    class MockLocationStrategy extends LocationStrategy {
        constructor() {
            super();
            this.internalBaseHref = '/';
            this.internalPath = '/';
            this.internalTitle = '';
            this.urlChanges = [];
            /** @internal */
            this._subject = new EventEmitter();
            this.stateChanges = [];
        }
        simulatePopState(url) {
            this.internalPath = url;
            this._subject.emit(new _MockPopStateEvent(this.path()));
        }
        path(includeHash = false) {
            return this.internalPath;
        }
        prepareExternalUrl(internal) {
            if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
                return this.internalBaseHref + internal.substring(1);
            }
            return this.internalBaseHref + internal;
        }
        pushState(ctx, title, path, query) {
            // Add state change to changes array
            this.stateChanges.push(ctx);
            this.internalTitle = title;
            const url = path + (query.length > 0 ? ('?' + query) : '');
            this.internalPath = url;
            const externalUrl = this.prepareExternalUrl(url);
            this.urlChanges.push(externalUrl);
        }
        replaceState(ctx, title, path, query) {
            // Reset the last index of stateChanges to the ctx (state) object
            this.stateChanges[(this.stateChanges.length || 1) - 1] = ctx;
            this.internalTitle = title;
            const url = path + (query.length > 0 ? ('?' + query) : '');
            this.internalPath = url;
            const externalUrl = this.prepareExternalUrl(url);
            this.urlChanges.push('replace: ' + externalUrl);
        }
        onPopState(fn) {
            this._subject.subscribe({ next: fn });
        }
        getBaseHref() {
            return this.internalBaseHref;
        }
        back() {
            if (this.urlChanges.length > 0) {
                this.urlChanges.pop();
                this.stateChanges.pop();
                const nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
                this.simulatePopState(nextUrl);
            }
        }
        forward() {
            throw 'not implemented';
        }
        getState() {
            return this.stateChanges[(this.stateChanges.length || 1) - 1];
        }
    }
    MockLocationStrategy.ɵfac = function MockLocationStrategy_Factory(t) { return new (t || MockLocationStrategy)(); };
    MockLocationStrategy.ɵprov = i0.ɵɵdefineInjectable({ token: MockLocationStrategy, factory: MockLocationStrategy.ɵfac });
    return MockLocationStrategy;
})();
export { MockLocationStrategy };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MockLocationStrategy, [{
        type: Injectable
    }], function () { return []; }, null); })();
class _MockPopStateEvent {
    constructor(newUrl) {
        this.newUrl = newUrl;
        this.pop = true;
        this.type = 'popstate';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUl2RDs7Ozs7R0FLRztBQUNIO0lBQUEsTUFDYSxvQkFBcUIsU0FBUSxnQkFBZ0I7UUFReEQ7WUFDRSxLQUFLLEVBQUUsQ0FBQztZQVJWLHFCQUFnQixHQUFXLEdBQUcsQ0FBQztZQUMvQixpQkFBWSxHQUFXLEdBQUcsQ0FBQztZQUMzQixrQkFBYSxHQUFXLEVBQUUsQ0FBQztZQUMzQixlQUFVLEdBQWEsRUFBRSxDQUFDO1lBQzFCLGdCQUFnQjtZQUNoQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7WUFDekMsaUJBQVksR0FBVSxFQUFFLENBQUM7UUFHakMsQ0FBQztRQUVELGdCQUFnQixDQUFDLEdBQVc7WUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxJQUFJLENBQUMsY0FBdUIsS0FBSztZQUMvQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDM0IsQ0FBQztRQUVELGtCQUFrQixDQUFDLFFBQWdCO1lBQ2pDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dC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QUFvQjtrREFBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O0FBaUZYLE1BQU0sa0JBQWtCO0lBR3RCLFlBQW1CLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRmpDLFFBQUcsR0FBWSxJQUFJLENBQUM7UUFDcEIsU0FBSSxHQUFXLFVBQVUsQ0FBQztJQUNVLENBQUM7Q0FDdEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuXG5cbi8qKlxuICogQSBtb2NrIGltcGxlbWVudGF0aW9uIG9mIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSB0aGF0IGFsbG93cyB0ZXN0cyB0byBmaXJlIHNpbXVsYXRlZFxuICogbG9jYXRpb24gZXZlbnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tMb2NhdGlvblN0cmF0ZWd5IGV4dGVuZHMgTG9jYXRpb25TdHJhdGVneSB7XG4gIGludGVybmFsQmFzZUhyZWY6IHN0cmluZyA9ICcvJztcbiAgaW50ZXJuYWxQYXRoOiBzdHJpbmcgPSAnLyc7XG4gIGludGVybmFsVGl0bGU6IHN0cmluZyA9ICcnO1xuICB1cmxDaGFuZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgcHJpdmF0ZSBzdGF0ZUNoYW5nZXM6IGFueVtdID0gW107XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBzaW11bGF0ZVBvcFN0YXRlKHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG4gICAgdGhpcy5fc3ViamVjdC5lbWl0KG5ldyBfTW9ja1BvcFN0YXRlRXZlbnQodGhpcy5wYXRoKCkpKTtcbiAgfVxuXG4gIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxQYXRoO1xuICB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChpbnRlcm5hbC5zdGFydHNXaXRoKCcvJykgJiYgdGhpcy5pbnRlcm5hbEJhc2VIcmVmLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWYgKyBpbnRlcm5hbC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWYgKyBpbnRlcm5hbDtcbiAgfVxuXG4gIHB1c2hTdGF0ZShjdHg6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gQWRkIHN0YXRlIGNoYW5nZSB0byBjaGFuZ2VzIGFycmF5XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMucHVzaChjdHgpO1xuXG4gICAgdGhpcy5pbnRlcm5hbFRpdGxlID0gdGl0bGU7XG5cbiAgICBjb25zdCB1cmwgPSBwYXRoICsgKHF1ZXJ5Lmxlbmd0aCA+IDAgPyAoJz8nICsgcXVlcnkpIDogJycpO1xuICAgIHRoaXMuaW50ZXJuYWxQYXRoID0gdXJsO1xuXG4gICAgY29uc3QgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwpO1xuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShjdHg6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gUmVzZXQgdGhlIGxhc3QgaW5kZXggb2Ygc3RhdGVDaGFuZ2VzIHRvIHRoZSBjdHggKHN0YXRlKSBvYmplY3RcbiAgICB0aGlzLnN0YXRlQ2hhbmdlc1sodGhpcy5zdGF0ZUNoYW5nZXMubGVuZ3RoIHx8IDEpIC0gMV0gPSBjdHg7XG5cbiAgICB0aGlzLmludGVybmFsVGl0bGUgPSB0aXRsZTtcblxuICAgIGNvbnN0IHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG5cbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goJ3JlcGxhY2U6ICcgKyBleHRlcm5hbFVybCk7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBmbn0pO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEJhc2VIcmVmO1xuICB9XG5cbiAgYmFjaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy51cmxDaGFuZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMudXJsQ2hhbmdlcy5wb3AoKTtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VzLnBvcCgpO1xuICAgICAgY29uc3QgbmV4dFVybCA9IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGggPiAwID8gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlcy5sZW5ndGggLSAxXSA6ICcnO1xuICAgICAgdGhpcy5zaW11bGF0ZVBvcFN0YXRlKG5leHRVcmwpO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZUNoYW5nZXNbKHRoaXMuc3RhdGVDaGFuZ2VzLmxlbmd0aCB8fCAxKSAtIDFdO1xuICB9XG59XG5cbmNsYXNzIF9Nb2NrUG9wU3RhdGVFdmVudCB7XG4gIHBvcDogYm9vbGVhbiA9IHRydWU7XG4gIHR5cGU6IHN0cmluZyA9ICdwb3BzdGF0ZSc7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuZXdVcmw6IHN0cmluZykge31cbn1cbiJdfQ==