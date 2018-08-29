/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { EventEmitter, Injectable } from '@angular/core';
import { LocationStrategy } from './location_strategy';
/**
 * @description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on which {@link LocationStrategy} is used, `Location` will either persist
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use {@link Router#navigate} service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 */
var Location = /** @class */ (function () {
    function Location(platformStrategy) {
        var _this = this;
        /** @internal */
        this._subject = new EventEmitter();
        this._platformStrategy = platformStrategy;
        var browserBaseHref = this._platformStrategy.getBaseHref();
        this._baseHref = Location_1.stripTrailingSlash(_stripIndexHtml(browserBaseHref));
        this._platformStrategy.onPopState(function (ev) {
            _this._subject.emit({
                'url': _this.path(true),
                'pop': true,
                'state': ev.state,
                'type': ev.type,
            });
        });
    }
    Location_1 = Location;
    /**
     * Returns the normalized URL path.
     */
    // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
    // removed.
    Location.prototype.path = function (includeHash) {
        if (includeHash === void 0) { includeHash = false; }
        return this.normalize(this._platformStrategy.path(includeHash));
    };
    /**
     * Normalizes the given path and compares to the current normalized path.
     */
    Location.prototype.isCurrentPathEqualTo = function (path, query) {
        if (query === void 0) { query = ''; }
        return this.path() == this.normalize(path + Location_1.normalizeQueryParams(query));
    };
    /**
     * Given a string representing a URL, returns the normalized URL path without leading or
     * trailing slashes.
     */
    Location.prototype.normalize = function (url) {
        return Location_1.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
    };
    /**
     * Given a string representing a URL, returns the platform-specific external URL path.
     * If the given URL doesn't begin with a leading slash (`'/'`), this method adds one
     * before normalizing. This method will also add a hash if `HashLocationStrategy` is
     * used, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
     */
    Location.prototype.prepareExternalUrl = function (url) {
        if (url && url[0] !== '/') {
            url = '/' + url;
        }
        return this._platformStrategy.prepareExternalUrl(url);
    };
    // TODO: rename this method to pushState
    /**
     * Changes the browsers URL to the normalized version of the given URL, and pushes a
     * new item onto the platform's history.
     */
    Location.prototype.go = function (path, query, state) {
        if (query === void 0) { query = ''; }
        if (state === void 0) { state = null; }
        this._platformStrategy.pushState(state, '', path, query);
    };
    /**
     * Changes the browsers URL to the normalized version of the given URL, and replaces
     * the top item on the platform's history stack.
     */
    Location.prototype.replaceState = function (path, query, state) {
        if (query === void 0) { query = ''; }
        if (state === void 0) { state = null; }
        this._platformStrategy.replaceState(state, '', path, query);
    };
    /**
     * Navigates forward in the platform's history.
     */
    Location.prototype.forward = function () { this._platformStrategy.forward(); };
    /**
     * Navigates back in the platform's history.
     */
    Location.prototype.back = function () { this._platformStrategy.back(); };
    /**
     * Subscribe to the platform's `popState` events.
     */
    Location.prototype.subscribe = function (onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    };
    /**
     * Given a string of url parameters, prepend with '?' if needed, otherwise return parameters as
     * is.
     */
    Location.normalizeQueryParams = function (params) {
        return params && params[0] !== '?' ? '?' + params : params;
    };
    /**
     * Given 2 parts of a url, join them with a slash if needed.
     */
    Location.joinWithSlash = function (start, end) {
        if (start.length == 0) {
            return end;
        }
        if (end.length == 0) {
            return start;
        }
        var slashes = 0;
        if (start.endsWith('/')) {
            slashes++;
        }
        if (end.startsWith('/')) {
            slashes++;
        }
        if (slashes == 2) {
            return start + end.substring(1);
        }
        if (slashes == 1) {
            return start + end;
        }
        return start + '/' + end;
    };
    /**
     * If url has a trailing slash, remove it, otherwise return url as is. This
     * method looks for the first occurrence of either #, ?, or the end of the
     * line as `/` characters after any of these should not be replaced.
     */
    Location.stripTrailingSlash = function (url) {
        var match = url.match(/#|\?|$/);
        var pathEndIdx = match && match.index || url.length;
        var droppedSlashIdx = pathEndIdx - (url[pathEndIdx - 1] === '/' ? 1 : 0);
        return url.slice(0, droppedSlashIdx) + url.slice(pathEndIdx);
    };
    var Location_1;
    Location = Location_1 = tslib_1.__decorate([
        Injectable(),
        tslib_1.__metadata("design:paramtypes", [LocationStrategy])
    ], Location);
    return Location;
}());
export { Location };
function _stripBaseHref(baseHref, url) {
    return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd2RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQVVyRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUVIO0lBUUUsa0JBQVksZ0JBQWtDO1FBQTlDLGlCQVlDO1FBbkJELGdCQUFnQjtRQUNoQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFPL0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzFDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM3RCxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFVBQUMsRUFBRTtZQUNuQyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDakIsS0FBSyxFQUFFLEtBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN0QixLQUFLLEVBQUUsSUFBSTtnQkFDWCxPQUFPLEVBQUUsRUFBRSxDQUFDLEtBQUs7Z0JBQ2pCLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSTthQUNoQixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7aUJBcEJVLFFBQVE7SUFzQm5COztPQUVHO0lBQ0gsK0ZBQStGO0lBQy9GLFdBQVc7SUFDWCx1QkFBSSxHQUFKLFVBQUssV0FB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QUFRLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyRixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsR0FBVztJQUNsQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5cbi8qKiBAZXhwZXJpbWVudGFsICovXG5leHBvcnQgaW50ZXJmYWNlIFBvcFN0YXRlRXZlbnQge1xuICBwb3A/OiBib29sZWFuO1xuICBzdGF0ZT86IGFueTtcbiAgdHlwZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgc2VydmljZSB0aGF0IGFwcGxpY2F0aW9ucyBjYW4gdXNlIHRvIGludGVyYWN0IHdpdGggYSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIERlcGVuZGluZyBvbiB3aGljaCB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gaXMgdXNlZCwgYExvY2F0aW9uYCB3aWxsIGVpdGhlciBwZXJzaXN0XG4gKiB0byB0aGUgVVJMJ3MgcGF0aCBvciB0aGUgVVJMJ3MgaGFzaCBzZWdtZW50LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogSXQncyBiZXR0ZXIgdG8gdXNlIHtAbGluayBSb3V0ZXIjbmF2aWdhdGV9IHNlcnZpY2UgdG8gdHJpZ2dlciByb3V0ZSBjaGFuZ2VzLiBVc2VcbiAqIGBMb2NhdGlvbmAgb25seSBpZiB5b3UgbmVlZCB0byBpbnRlcmFjdCB3aXRoIG9yIGNyZWF0ZSBub3JtYWxpemVkIFVSTHMgb3V0c2lkZSBvZlxuICogcm91dGluZy5cbiAqXG4gKiBgTG9jYXRpb25gIGlzIHJlc3BvbnNpYmxlIGZvciBub3JtYWxpemluZyB0aGUgVVJMIGFnYWluc3QgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLlxuICogQSBub3JtYWxpemVkIFVSTCBpcyBhYnNvbHV0ZSBmcm9tIHRoZSBVUkwgaG9zdCwgaW5jbHVkZXMgdGhlIGFwcGxpY2F0aW9uJ3MgYmFzZSBocmVmLCBhbmQgaGFzIG5vXG4gKiB0cmFpbGluZyBzbGFzaDpcbiAqIC0gYC9teS9hcHAvdXNlci8xMjNgIGlzIG5vcm1hbGl6ZWRcbiAqIC0gYG15L2FwcC91c2VyLzEyM2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzL2AgKippcyBub3QqKiBub3JtYWxpemVkXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL2xvY2F0aW9uL3RzL3BhdGhfbG9jYXRpb25fY29tcG9uZW50LnRzIHJlZ2lvbj0nTG9jYXRpb25Db21wb25lbnQnfVxuICpcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Jhc2VIcmVmOiBzdHJpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3k7XG5cbiAgY29uc3RydWN0b3IocGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSkge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kgPSBwbGF0Zm9ybVN0cmF0ZWd5O1xuICAgIGNvbnN0IGJyb3dzZXJCYXNlSHJlZiA9IHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuZ2V0QmFzZUhyZWYoKTtcbiAgICB0aGlzLl9iYXNlSHJlZiA9IExvY2F0aW9uLnN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBJbmRleEh0bWwoYnJvd3NlckJhc2VIcmVmKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5vblBvcFN0YXRlKChldikgPT4ge1xuICAgICAgdGhpcy5fc3ViamVjdC5lbWl0KHtcbiAgICAgICAgJ3VybCc6IHRoaXMucGF0aCh0cnVlKSxcbiAgICAgICAgJ3BvcCc6IHRydWUsXG4gICAgICAgICdzdGF0ZSc6IGV2LnN0YXRlLFxuICAgICAgICAndHlwZSc6IGV2LnR5cGUsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBub3JtYWxpemVkIFVSTCBwYXRoLlxuICAgKi9cbiAgLy8gVE9ETzogdnNhdmtpbi4gUmVtb3ZlIHRoZSBib29sZWFuIGZsYWcgYW5kIGFsd2F5cyBpbmNsdWRlIGhhc2ggb25jZSB0aGUgZGVwcmVjYXRlZCByb3V0ZXIgaXNcbiAgLy8gcmVtb3ZlZC5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUodGhpcy5fcGxhdGZvcm1TdHJhdGVneS5wYXRoKGluY2x1ZGVIYXNoKSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgZ2l2ZW4gcGF0aCBhbmQgY29tcGFyZXMgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLlxuICAgKi9cbiAgaXNDdXJyZW50UGF0aEVxdWFsVG8ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoKCkgPT0gdGhpcy5ub3JtYWxpemUocGF0aCArIExvY2F0aW9uLm5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5KSk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgVVJMLCByZXR1cm5zIHRoZSBub3JtYWxpemVkIFVSTCBwYXRoIHdpdGhvdXQgbGVhZGluZyBvclxuICAgKiB0cmFpbGluZyBzbGFzaGVzLlxuICAgKi9cbiAgbm9ybWFsaXplKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTG9jYXRpb24uc3RyaXBUcmFpbGluZ1NsYXNoKF9zdHJpcEJhc2VIcmVmKHRoaXMuX2Jhc2VIcmVmLCBfc3RyaXBJbmRleEh0bWwodXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgc3RyaW5nIHJlcHJlc2VudGluZyBhIFVSTCwgcmV0dXJucyB0aGUgcGxhdGZvcm0tc3BlY2lmaWMgZXh0ZXJuYWwgVVJMIHBhdGguXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgZG9lc24ndCBiZWdpbiB3aXRoIGEgbGVhZGluZyBzbGFzaCAoYCcvJ2ApLCB0aGlzIG1ldGhvZCBhZGRzIG9uZVxuICAgKiBiZWZvcmUgbm9ybWFsaXppbmcuIFRoaXMgbWV0aG9kIHdpbGwgYWxzbyBhZGQgYSBoYXNoIGlmIGBIYXNoTG9jYXRpb25TdHJhdGVneWAgaXNcbiAgICogdXNlZCwgb3IgdGhlIGBBUFBfQkFTRV9IUkVGYCBpZiB0aGUgYFBhdGhMb2NhdGlvblN0cmF0ZWd5YCBpcyBpbiB1c2UuXG4gICAqL1xuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwgJiYgdXJsWzBdICE9PSAnLycpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gIH1cblxuICAvLyBUT0RPOiByZW5hbWUgdGhpcyBtZXRob2QgdG8gcHVzaFN0YXRlXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBicm93c2VycyBVUkwgdG8gdGhlIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gVVJMLCBhbmQgcHVzaGVzIGFcbiAgICogbmV3IGl0ZW0gb250byB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5wdXNoU3RhdGUoc3RhdGUsICcnLCBwYXRoLCBxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcnMgVVJMIHRvIHRoZSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIFVSTCwgYW5kIHJlcGxhY2VzXG4gICAqIHRoZSB0b3AgaXRlbSBvbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5IHN0YWNrLlxuICAgKi9cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kucmVwbGFjZVN0YXRlKHN0YXRlLCAnJywgcGF0aCwgcXVlcnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBmb3J3YXJkIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBmb3J3YXJkKCk6IHZvaWQgeyB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LmZvcndhcmQoKTsgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgYmFjayBpbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5LlxuICAgKi9cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5iYWNrKCk7IH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBwbGF0Zm9ybSdzIGBwb3BTdGF0ZWAgZXZlbnRzLlxuICAgKi9cbiAgc3Vic2NyaWJlKFxuICAgICAgb25OZXh0OiAodmFsdWU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQsIG9uVGhyb3c/OiAoKGV4Y2VwdGlvbjogYW55KSA9PiB2b2lkKXxudWxsLFxuICAgICAgb25SZXR1cm4/OiAoKCkgPT4gdm9pZCl8bnVsbCk6IFN1YnNjcmlwdGlvbkxpa2Uge1xuICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LnN1YnNjcmliZSh7bmV4dDogb25OZXh0LCBlcnJvcjogb25UaHJvdywgY29tcGxldGU6IG9uUmV0dXJufSk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBzdHJpbmcgb2YgdXJsIHBhcmFtZXRlcnMsIHByZXBlbmQgd2l0aCAnPycgaWYgbmVlZGVkLCBvdGhlcndpc2UgcmV0dXJuIHBhcmFtZXRlcnMgYXNcbiAgICogaXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHBhcmFtczogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGFyYW1zICYmIHBhcmFtc1swXSAhPT0gJz8nID8gJz8nICsgcGFyYW1zIDogcGFyYW1zO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIDIgcGFydHMgb2YgYSB1cmwsIGpvaW4gdGhlbSB3aXRoIGEgc2xhc2ggaWYgbmVlZGVkLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBqb2luV2l0aFNsYXNoKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoc3RhcnQubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuICAgIGlmIChlbmQubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBzdGFydDtcbiAgICB9XG4gICAgbGV0IHNsYXNoZXMgPSAwO1xuICAgIGlmIChzdGFydC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBzbGFzaGVzKys7XG4gICAgfVxuICAgIGlmIChlbmQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBzbGFzaGVzKys7XG4gICAgfVxuICAgIGlmIChzbGFzaGVzID09IDIpIHtcbiAgICAgIHJldHVybiBzdGFydCArIGVuZC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChzbGFzaGVzID09IDEpIHtcbiAgICAgIHJldHVybiBzdGFydCArIGVuZDtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXJ0ICsgJy8nICsgZW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHVybCBoYXMgYSB0cmFpbGluZyBzbGFzaCwgcmVtb3ZlIGl0LCBvdGhlcndpc2UgcmV0dXJuIHVybCBhcyBpcy4gVGhpc1xuICAgKiBtZXRob2QgbG9va3MgZm9yIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGVpdGhlciAjLCA/LCBvciB0aGUgZW5kIG9mIHRoZVxuICAgKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFmdGVyIGFueSBvZiB0aGVzZSBzaG91bGQgbm90IGJlIHJlcGxhY2VkLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzdHJpcFRyYWlsaW5nU2xhc2godXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hdGNoID0gdXJsLm1hdGNoKC8jfFxcP3wkLyk7XG4gICAgY29uc3QgcGF0aEVuZElkeCA9IG1hdGNoICYmIG1hdGNoLmluZGV4IHx8IHVybC5sZW5ndGg7XG4gICAgY29uc3QgZHJvcHBlZFNsYXNoSWR4ID0gcGF0aEVuZElkeCAtICh1cmxbcGF0aEVuZElkeCAtIDFdID09PSAnLycgPyAxIDogMCk7XG4gICAgcmV0dXJuIHVybC5zbGljZSgwLCBkcm9wcGVkU2xhc2hJZHgpICsgdXJsLnNsaWNlKHBhdGhFbmRJZHgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEJhc2VIcmVmKGJhc2VIcmVmOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJhc2VIcmVmICYmIHVybC5zdGFydHNXaXRoKGJhc2VIcmVmKSA/IHVybC5zdWJzdHJpbmcoYmFzZUhyZWYubGVuZ3RoKSA6IHVybDtcbn1cblxuZnVuY3Rpb24gX3N0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9pbmRleC5odG1sJC8sICcnKTtcbn1cbiJdfQ==