/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, inject, Injectable, InjectionToken, Optional } from '@angular/core';
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
export class LocationStrategy {
    historyGo(relativePosition) {
        throw new Error(ngDevMode ? 'Not implemented' : '');
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: LocationStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: LocationStrategy, providedIn: 'root', useFactory: () => inject(PathLocationStrategy) }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: LocationStrategy, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => inject(PathLocationStrategy) }]
        }] });
/**
 * A predefined DI token for the base href
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
 * import {NgModule} from '@angular/core';
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
export const APP_BASE_HREF = new InjectionToken(ngDevMode ? 'appBaseHref' : '');
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you may provide a {@link APP_BASE_HREF}
 * or add a `<base href>` element to the document to override the default.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app/'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`. To ensure all relative URIs resolve correctly,
 * the `<base href>` and/or `APP_BASE_HREF` should end with a `/`.
 *
 * Similarly, if you add `<base href='/my/app/'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Note that when using `PathLocationStrategy`, neither the query nor
 * the fragment in the `<base href>` will be preserved, as outlined
 * by the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2).
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 * @publicApi
 */
export class PathLocationStrategy extends LocationStrategy {
    constructor(_platformLocation, href) {
        super();
        this._platformLocation = _platformLocation;
        this._removeListenerFns = [];
        this._baseHref =
            href ??
                this._platformLocation.getBaseHrefFromDOM() ??
                inject(DOCUMENT).location?.origin ??
                '';
    }
    /** @nodoc */
    ngOnDestroy() {
        while (this._removeListenerFns.length) {
            this._removeListenerFns.pop()();
        }
    }
    onPopState(fn) {
        this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
    }
    getBaseHref() {
        return this._baseHref;
    }
    prepareExternalUrl(internal) {
        return joinWithSlash(this._baseHref, internal);
    }
    path(includeHash = false) {
        const pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
        const hash = this._platformLocation.hash;
        return hash && includeHash ? `${pathname}${hash}` : pathname;
    }
    pushState(state, title, url, queryParams) {
        const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    }
    replaceState(state, title, url, queryParams) {
        const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
        this._platformLocation.replaceState(state, title, externalUrl);
    }
    forward() {
        this._platformLocation.forward();
    }
    back() {
        this._platformLocation.back();
    }
    getState() {
        return this._platformLocation.getState();
    }
    historyGo(relativePosition = 0) {
        this._platformLocation.historyGo?.(relativePosition);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: PathLocationStrategy, deps: [{ token: i1.PlatformLocation }, { token: APP_BASE_HREF, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: PathLocationStrategy, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: PathLocationStrategy, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.PlatformLocation }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [APP_BASE_HREF]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQWEsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTlGLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUF5QixnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdFLE9BQU8sRUFBQyxhQUFhLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxRQUFRLENBQUM7OztBQUUzRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUVILE1BQU0sT0FBZ0IsZ0JBQWdCO0lBUXBDLFNBQVMsQ0FBRSxnQkFBd0I7UUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO3lIQVZtQixnQkFBZ0I7NkhBQWhCLGdCQUFnQixjQURiLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7O3NHQUN6RCxnQkFBZ0I7a0JBRHJDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsRUFBQzs7QUFnQmhGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUFTLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUV4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b0Isa0RBTVQsYUFBYTs2SEFOeEIsb0JBQW9CLGNBRFIsTUFBTTs7c0dBQ2xCLG9CQUFvQjtrQkFEaEMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OzBCQU8zQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIGluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9uRGVzdHJveSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuLi9kb21fdG9rZW5zJztcblxuaW1wb3J0IHtMb2NhdGlvbkNoYW5nZUxpc3RlbmVyLCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7am9pbldpdGhTbGFzaCwgbm9ybWFsaXplUXVlcnlQYXJhbXN9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogRW5hYmxlcyB0aGUgYExvY2F0aW9uYCBzZXJ2aWNlIHRvIHJlYWQgcm91dGUgc3RhdGUgZnJvbSB0aGUgYnJvd3NlcidzIFVSTC5cbiAqIEFuZ3VsYXIgcHJvdmlkZXMgdHdvIHN0cmF0ZWdpZXM6XG4gKiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGFuZCBgUGF0aExvY2F0aW9uU3RyYXRlZ3lgLlxuICpcbiAqIEFwcGxpY2F0aW9ucyBzaG91bGQgdXNlIHRoZSBgUm91dGVyYCBvciBgTG9jYXRpb25gIHNlcnZpY2VzIHRvXG4gKiBpbnRlcmFjdCB3aXRoIGFwcGxpY2F0aW9uIHJvdXRlIHN0YXRlLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBwcm9kdWNlcyBVUkxzIGxpa2VcbiAqIDxjb2RlIGNsYXNzPVwibm8tYXV0by1saW5rXCI+aHR0cDovL2V4YW1wbGUuY29tIy9mb288L2NvZGU+LFxuICogYW5kIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgcHJvZHVjZXNcbiAqIDxjb2RlIGNsYXNzPVwibm8tYXV0by1saW5rXCI+aHR0cDovL2V4YW1wbGUuY29tL2ZvbzwvY29kZT4gYXMgYW4gZXF1aXZhbGVudCBVUkwuXG4gKlxuICogU2VlIHRoZXNlIHR3byBjbGFzc2VzIGZvciBtb3JlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290JywgdXNlRmFjdG9yeTogKCkgPT4gaW5qZWN0KFBhdGhMb2NhdGlvblN0cmF0ZWd5KX0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9jYXRpb25TdHJhdGVneSB7XG4gIGFic3RyYWN0IHBhdGgoaW5jbHVkZUhhc2g/OiBib29sZWFuKTogc3RyaW5nO1xuICBhYnN0cmFjdCBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0U3RhdGUoKTogdW5rbm93bjtcbiAgYWJzdHJhY3QgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgZm9yd2FyZCgpOiB2b2lkO1xuICBhYnN0cmFjdCBiYWNrKCk6IHZvaWQ7XG4gIGhpc3RvcnlHbz8ocmVsYXRpdmVQb3NpdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG5nRGV2TW9kZSA/ICdOb3QgaW1wbGVtZW50ZWQnIDogJycpO1xuICB9XG4gIGFic3RyYWN0IG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkO1xuICBhYnN0cmFjdCBnZXRCYXNlSHJlZigpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBwcmVkZWZpbmVkIERJIHRva2VuIGZvciB0aGUgYmFzZSBocmVmXG4gKiB0byBiZSB1c2VkIHdpdGggdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAuXG4gKiBUaGUgYmFzZSBocmVmIGlzIHRoZSBVUkwgcHJlZml4IHRoYXQgc2hvdWxkIGJlIHByZXNlcnZlZCB3aGVuIGdlbmVyYXRpbmdcbiAqIGFuZCByZWNvZ25pemluZyBVUkxzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byB1c2UgdGhpcyB0b2tlbiB0byBjb25maWd1cmUgdGhlIHJvb3QgYXBwIGluamVjdG9yXG4gKiB3aXRoIGEgYmFzZSBocmVmIHZhbHVlLCBzbyB0aGF0IHRoZSBESSBmcmFtZXdvcmsgY2FuIHN1cHBseSB0aGUgZGVwZW5kZW5jeSBhbnl3aGVyZSBpbiB0aGUgYXBwLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICogaW1wb3J0IHtBUFBfQkFTRV9IUkVGfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIHByb3ZpZGVyczogW3twcm92aWRlOiBBUFBfQkFTRV9IUkVGLCB1c2VWYWx1ZTogJy9teS9hcHAnfV1cbiAqIH0pXG4gKiBjbGFzcyBBcHBNb2R1bGUge31cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9CQVNFX0hSRUYgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPihuZ0Rldk1vZGUgPyAnYXBwQmFzZUhyZWYnIDogJycpO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gdXNlZCB0byBjb25maWd1cmUgdGhlIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB0b1xuICogcmVwcmVzZW50IGl0cyBzdGF0ZSBpbiB0aGVcbiAqIFtwYXRoXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Vbmlmb3JtX1Jlc291cmNlX0xvY2F0b3IjU3ludGF4KSBvZiB0aGVcbiAqIGJyb3dzZXIncyBVUkwuXG4gKlxuICogSWYgeW91J3JlIHVzaW5nIGBQYXRoTG9jYXRpb25TdHJhdGVneWAsIHlvdSBtYXkgcHJvdmlkZSBhIHtAbGluayBBUFBfQkFTRV9IUkVGfVxuICogb3IgYWRkIGEgYDxiYXNlIGhyZWY+YCBlbGVtZW50IHRvIHRoZSBkb2N1bWVudCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdC5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBwcm92aWRlIGFuIGBBUFBfQkFTRV9IUkVGYCBvZiBgJy9teS9hcHAvJ2AgYW5kIGNhbGxcbiAqIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbS9teS9hcHAvZm9vYC4gVG8gZW5zdXJlIGFsbCByZWxhdGl2ZSBVUklzIHJlc29sdmUgY29ycmVjdGx5LFxuICogdGhlIGA8YmFzZSBocmVmPmAgYW5kL29yIGBBUFBfQkFTRV9IUkVGYCBzaG91bGQgZW5kIHdpdGggYSBgL2AuXG4gKlxuICogU2ltaWxhcmx5LCBpZiB5b3UgYWRkIGA8YmFzZSBocmVmPScvbXkvYXBwLycvPmAgdG8gdGhlIGRvY3VtZW50IGFuZCBjYWxsXG4gKiBgbG9jYXRpb24uZ28oJy9mb28nKWAsIHRoZSBicm93c2VyJ3MgVVJMIHdpbGwgYmVjb21lXG4gKiBgZXhhbXBsZS5jb20vbXkvYXBwL2Zvb2AuXG4gKlxuICogTm90ZSB0aGF0IHdoZW4gdXNpbmcgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCwgbmVpdGhlciB0aGUgcXVlcnkgbm9yXG4gKiB0aGUgZnJhZ21lbnQgaW4gdGhlIGA8YmFzZSBocmVmPmAgd2lsbCBiZSBwcmVzZXJ2ZWQsIGFzIG91dGxpbmVkXG4gKiBieSB0aGUgW1JGQ10oaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi01LjIuMikuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbG9jYXRpb24vdHMvcGF0aF9sb2NhdGlvbl9jb21wb25lbnQudHMgcmVnaW9uPSdMb2NhdGlvbkNvbXBvbmVudCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBQYXRoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9iYXNlSHJlZjogc3RyaW5nO1xuICBwcml2YXRlIF9yZW1vdmVMaXN0ZW5lckZuczogKCgpID0+IHZvaWQpW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX0JBU0VfSFJFRikgaHJlZj86IHN0cmluZyxcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX2Jhc2VIcmVmID1cbiAgICAgIGhyZWYgPz9cbiAgICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZ2V0QmFzZUhyZWZGcm9tRE9NKCkgPz9cbiAgICAgIGluamVjdChET0NVTUVOVCkubG9jYXRpb24/Lm9yaWdpbiA/P1xuICAgICAgJyc7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHdoaWxlICh0aGlzLl9yZW1vdmVMaXN0ZW5lckZucy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVyRm5zLnBvcCgpISgpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lckZucy5wdXNoKFxuICAgICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlKGZuKSxcbiAgICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25IYXNoQ2hhbmdlKGZuKSxcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fYmFzZUhyZWY7XG4gIH1cblxuICBvdmVycmlkZSBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGpvaW5XaXRoU2xhc2godGhpcy5fYmFzZUhyZWYsIGludGVybmFsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHBhdGgoaW5jbHVkZUhhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aG5hbWUgPVxuICAgICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZSArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uc2VhcmNoKTtcbiAgICBjb25zdCBoYXNoID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5oYXNoO1xuICAgIHJldHVybiBoYXNoICYmIGluY2x1ZGVIYXNoID8gYCR7cGF0aG5hbWV9JHtoYXNofWAgOiBwYXRobmFtZTtcbiAgfVxuXG4gIG92ZXJyaWRlIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZykge1xuICAgIGNvbnN0IGV4dGVybmFsVXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZykge1xuICAgIGNvbnN0IGV4dGVybmFsVXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkKCk7XG4gIH1cblxuICBvdmVycmlkZSBiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uYmFjaygpO1xuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZ2V0U3RhdGUoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGhpc3RvcnlHbyhyZWxhdGl2ZVBvc2l0aW9uOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5oaXN0b3J5R28/LihyZWxhdGl2ZVBvc2l0aW9uKTtcbiAgfVxufVxuIl19