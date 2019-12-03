import { __extends } from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, ɵɵinject } from '@angular/core';
import { DOCUMENT } from '../dom_tokens';
import { PlatformLocation } from './platform_location';
import { joinWithSlash, normalizeQueryParams } from './util';
import * as i0 from "@angular/core";
import * as i1 from "./platform_location";
/**
 * Enables the `Location` service to read route state from the browser's URL.
 * Angular provides two strategies:
 * `HashLocationStrategy` and `PathLocationStrategy`.
 *
 * Applications should use the `Router` or `Location` services to
 * interact with application route state.
 *
 * For instance, `HashLocationStrategy` produces URLs like
 * <code class="no-auto-link">http://example.com#/foo</code>,
 * and `PathLocationStrategy` produces
 * <code class="no-auto-link">http://example.com/foo</code> as an equivalent URL.
 *
 * See these two classes for more.
 *
 * @publicApi
 */
var LocationStrategy = /** @class */ (function () {
    function LocationStrategy() {
    }
    LocationStrategy.ɵfac = function LocationStrategy_Factory(t) { return new (t || LocationStrategy)(); };
    LocationStrategy.ɵprov = i0.ɵɵdefineInjectable({ token: LocationStrategy, factory: function () { return provideLocationStrategy(); }, providedIn: 'root' });
    return LocationStrategy;
}());
export { LocationStrategy };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LocationStrategy, [{
        type: Injectable,
        args: [{ providedIn: 'root', useFactory: provideLocationStrategy }]
    }], null, null); })();
export function provideLocationStrategy(platformLocation) {
    // See #23917
    var location = ɵɵinject(DOCUMENT).location;
    return new PathLocationStrategy(ɵɵinject(PlatformLocation), location && location.origin || '');
}
/**
 * A predefined [DI token](guide/glossary#di-token) for the base href
 * to be used with the `PathLocationStrategy`.
 * The base href is the URL prefix that should be preserved when generating
 * and recognizing URLs.
 *
 * @usageNotes
 *
 * The following example shows how to use this token to configure the root app injector
 * with a base href value, so that the DI framework can supply the dependency anywhere in the app.
 *
 * ```typescript
 * import {Component, NgModule} from '@angular/core';
 * import {APP_BASE_HREF} from '@angular/common';
 *
 * @NgModule({
 *   providers: [{provide: APP_BASE_HREF, useValue: '/my/app'}]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
export var APP_BASE_HREF = new InjectionToken('appBaseHref');
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you must provide a {@link APP_BASE_HREF}
 * or add a base element to the document. This URL prefix that will be preserved
 * when generating and recognizing URLs.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Similarly, if you add `<base href='/my/app'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
var PathLocationStrategy = /** @class */ (function (_super) {
    __extends(PathLocationStrategy, _super);
    function PathLocationStrategy(_platformLocation, href) {
        var _this = _super.call(this) || this;
        _this._platformLocation = _platformLocation;
        if (href == null) {
            href = _this._platformLocation.getBaseHrefFromDOM();
        }
        if (href == null) {
            throw new Error("No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.");
        }
        _this._baseHref = href;
        return _this;
    }
    PathLocationStrategy.prototype.onPopState = function (fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    };
    PathLocationStrategy.prototype.getBaseHref = function () { return this._baseHref; };
    PathLocationStrategy.prototype.prepareExternalUrl = function (internal) { return joinWithSlash(this._baseHref, internal); };
    PathLocationStrategy.prototype.path = function (includeHash) {
        if (includeHash === void 0) { includeHash = false; }
        var pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
        var hash = this._platformLocation.hash;
        return hash && includeHash ? "" + pathname + hash : pathname;
    };
    PathLocationStrategy.prototype.pushState = function (state, title, url, queryParams) {
        var externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.replaceState = function (state, title, url, queryParams) {
        var externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.replaceState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.forward = function () { this._platformLocation.forward(); };
    PathLocationStrategy.prototype.back = function () { this._platformLocation.back(); };
    PathLocationStrategy.ɵfac = function PathLocationStrategy_Factory(t) { return new (t || PathLocationStrategy)(i0.ɵɵinject(i1.PlatformLocation), i0.ɵɵinject(APP_BASE_HREF, 8)); };
    PathLocationStrategy.ɵprov = i0.ɵɵdefineInjectable({ token: PathLocationStrategy, factory: PathLocationStrategy.ɵfac });
    return PathLocationStrategy;
}(LocationStrategy));
export { PathLocationStrategy };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PathLocationStrategy, [{
        type: Injectable
    }], function () { return [{ type: i1.PlatformLocation }, { type: undefined, decorators: [{
                type: Optional
            }, {
                type: Inject,
                args: [APP_BASE_HREF]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBeUIsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RSxPQUFPLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7QUFFM0Q7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSDtJQUFBO0tBVUM7b0ZBVHFCLGdCQUFnQjs0REFBaEIsZ0JBQWdCLGdDQURPLHVCQUF1QixtQkFBM0MsTUFBTTsyQkE5Qi9CO0NBd0NDLEFBVkQsSUFVQztTQVRxQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQURyQyxVQUFVO2VBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSx1QkFBdUIsRUFBQzs7QUFZckUsTUFBTSxVQUFVLHVCQUF1QixDQUFDLGdCQUFrQztJQUN4RSxhQUFhO0lBQ2IsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUM3QyxPQUFPLElBQUksb0JBQW9CLENBQzNCLFFBQVEsQ0FBQyxnQkFBdUIsQ0FBQyxFQUFFLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFHRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNILE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxJ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bmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9wdGlvbmFsLCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtMb2NhdGlvbkNoYW5nZUxpc3RlbmVyLCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7am9pbldpdGhTbGFzaCwgbm9ybWFsaXplUXVlcnlQYXJhbXN9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogRW5hYmxlcyB0aGUgYExvY2F0aW9uYCBzZXJ2aWNlIHRvIHJlYWQgcm91dGUgc3RhdGUgZnJvbSB0aGUgYnJvd3NlcidzIFVSTC5cbiAqIEFuZ3VsYXIgcHJvdmlkZXMgdHdvIHN0cmF0ZWdpZXM6XG4gKiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGFuZCBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgLlxuICpcbiAqIEFwcGxpY2F0aW9ucyBzaG91bGQgdXNlIHRoZSBgUm91dGVyYCBvciBgTG9jYXRpb25gIHNlcnZpY2VzIHRvXG4gKiBpbnRlcmFjdCB3aXRoIGFwcGxpY2F0aW9uIHJvdXRlIHN0YXRlLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBwcm9kdWNlcyBVUkxzIGxpa2VcbiAqIDxjb2RlIGNsYXNzPVwibm8tYXV0by1saW5rXCI+aHR0cDovL2V4YW1wbGUuY29tIy9mb288L2NvZGU+LFxuICogYW5kIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgcHJvZHVjZXNcbiAqIDxjb2RlIGNsYXNzPVwibm8tYXV0by1saW5rXCI+aHR0cDovL2V4YW1wbGUuY29tL2ZvbzwvY29kZT4gYXMgYW4gZXF1aXZhbGVudCBVUkwuXG4gKlxuICogU2VlIHRoZXNlIHR3byBjbGFzc2VzIGZvciBtb3JlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290JywgdXNlRmFjdG9yeTogcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3l9KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBhYnN0cmFjdCBwYXRoKGluY2x1ZGVIYXNoPzogYm9vbGVhbik6IHN0cmluZztcbiAgYWJzdHJhY3QgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGFic3RyYWN0IHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGZvcndhcmQoKTogdm9pZDtcbiAgYWJzdHJhY3QgYmFjaygpOiB2b2lkO1xuICBhYnN0cmFjdCBvblBvcFN0YXRlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogdm9pZDtcbiAgYWJzdHJhY3QgZ2V0QmFzZUhyZWYoKTogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxvY2F0aW9uU3RyYXRlZ3kocGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbikge1xuICAvLyBTZWUgIzIzOTE3XG4gIGNvbnN0IGxvY2F0aW9uID0gybXJtWluamVjdChET0NVTUVOVCkubG9jYXRpb247XG4gIHJldHVybiBuZXcgUGF0aExvY2F0aW9uU3RyYXRlZ3koXG4gICAgICDJtcm1aW5qZWN0KFBsYXRmb3JtTG9jYXRpb24gYXMgYW55KSwgbG9jYXRpb24gJiYgbG9jYXRpb24ub3JpZ2luIHx8ICcnKTtcbn1cblxuXG4vKipcbiAqIEEgcHJlZGVmaW5lZCBbREkgdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuKSBmb3IgdGhlIGJhc2UgaHJlZlxuICogdG8gYmUgdXNlZCB3aXRoIHRoZSBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgLlxuICogVGhlIGJhc2UgaHJlZiBpcyB0aGUgVVJMIHByZWZpeCB0aGF0IHNob3VsZCBiZSBwcmVzZXJ2ZWQgd2hlbiBnZW5lcmF0aW5nXG4gKiBhbmQgcmVjb2duaXppbmcgVVJMcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gdXNlIHRoaXMgdG9rZW4gdG8gY29uZmlndXJlIHRoZSByb290IGFwcCBpbmplY3RvclxuICogd2l0aCBhIGJhc2UgaHJlZiB2YWx1ZSwgc28gdGhhdCB0aGUgREkgZnJhbWV3b3JrIGNhbiBzdXBwbHkgdGhlIGRlcGVuZGVuY3kgYW55d2hlcmUgaW4gdGhlIGFwcC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0NvbXBvbmVudCwgTmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICogaW1wb3J0IHtBUFBfQkFTRV9IUkVGfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIHByb3ZpZGVyczogW3twcm92aWRlOiBBUFBfQkFTRV9IUkVGLCB1c2VWYWx1ZTogJy9teS9hcHAnfV1cbiAqIH0pXG4gKiBjbGFzcyBBcHBNb2R1bGUge31cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9CQVNFX0hSRUYgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignYXBwQmFzZUhyZWYnKTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IHVzZWQgdG8gY29uZmlndXJlIHRoZSB7QGxpbmsgTG9jYXRpb259IHNlcnZpY2UgdG9cbiAqIHJlcHJlc2VudCBpdHMgc3RhdGUgaW4gdGhlXG4gKiBbcGF0aF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVW5pZm9ybV9SZXNvdXJjZV9Mb2NhdG9yI1N5bnRheCkgb2YgdGhlXG4gKiBicm93c2VyJ3MgVVJMLlxuICpcbiAqIElmIHlvdSdyZSB1c2luZyBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgLCB5b3UgbXVzdCBwcm92aWRlIGEge0BsaW5rIEFQUF9CQVNFX0hSRUZ9XG4gKiBvciBhZGQgYSBiYXNlIGVsZW1lbnQgdG8gdGhlIGRvY3VtZW50LiBUaGlzIFVSTCBwcmVmaXggdGhhdCB3aWxsIGJlIHByZXNlcnZlZFxuICogd2hlbiBnZW5lcmF0aW5nIGFuZCByZWNvZ25pemluZyBVUkxzLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgaWYgeW91IHByb3ZpZGUgYW4gYEFQUF9CQVNFX0hSRUZgIG9mIGAnL215L2FwcCdgIGFuZCBjYWxsXG4gKiBgbG9jYXRpb24uZ28oJy9mb28nKWAsIHRoZSBicm93c2VyJ3MgVVJMIHdpbGwgYmVjb21lXG4gKiBgZXhhbXBsZS5jb20vbXkvYXBwL2Zvb2AuXG4gKlxuICogU2ltaWxhcmx5LCBpZiB5b3UgYWRkIGA8YmFzZSBocmVmPScvbXkvYXBwJy8+YCB0byB0aGUgZG9jdW1lbnQgYW5kIGNhbGxcbiAqIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbS9teS9hcHAvZm9vYC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9sb2NhdGlvbi90cy9wYXRoX2xvY2F0aW9uX2NvbXBvbmVudC50cyByZWdpb249J0xvY2F0aW9uQ29tcG9uZW50J31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYXRoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBwcml2YXRlIF9iYXNlSHJlZjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX0JBU0VfSFJFRikgaHJlZj86IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAoaHJlZiA9PSBudWxsKSB7XG4gICAgICBocmVmID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5nZXRCYXNlSHJlZkZyb21ET00oKTtcbiAgICB9XG5cbiAgICBpZiAoaHJlZiA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYE5vIGJhc2UgaHJlZiBzZXQuIFBsZWFzZSBwcm92aWRlIGEgdmFsdWUgZm9yIHRoZSBBUFBfQkFTRV9IUkVGIHRva2VuIG9yIGFkZCBhIGJhc2UgZWxlbWVudCB0byB0aGUgZG9jdW1lbnQuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fYmFzZUhyZWYgPSBocmVmO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25Qb3BTdGF0ZShmbik7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vbkhhc2hDaGFuZ2UoZm4pO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2Jhc2VIcmVmOyB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gam9pbldpdGhTbGFzaCh0aGlzLl9iYXNlSHJlZiwgaW50ZXJuYWwpOyB9XG5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRobmFtZSA9XG4gICAgICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWUgKyBub3JtYWxpemVRdWVyeVBhcmFtcyh0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCk7XG4gICAgY29uc3QgaGFzaCA9IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uaGFzaDtcbiAgICByZXR1cm4gaGFzaCAmJiBpbmNsdWRlSGFzaCA/IGAke3BhdGhuYW1lfSR7aGFzaH1gIDogcGF0aG5hbWU7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCBleHRlcm5hbFVybCk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICBjb25zdCBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCBleHRlcm5hbFVybCk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLmZvcndhcmQoKTsgfVxuXG4gIGJhY2soKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uYmFjaygpOyB9XG59XG4iXX0=