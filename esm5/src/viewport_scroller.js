/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ErrorHandler, ΔdefineInjectable, Δinject } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
var ViewportScroller = /** @class */ (function () {
    function ViewportScroller() {
    }
    // De-sugared tree-shakable injection
    // See #23917
    /** @nocollapse */
    ViewportScroller.ngInjectableDef = ΔdefineInjectable({
        providedIn: 'root',
        factory: function () { return new BrowserViewportScroller(Δinject(DOCUMENT), window, Δinject(ErrorHandler)); }
    });
    return ViewportScroller;
}());
export { ViewportScroller };
/**
 * Manages the scroll position for a browser window.
 */
var BrowserViewportScroller = /** @class */ (function () {
    function BrowserViewportScroller(document, window, errorHandler) {
        this.document = document;
        this.window = window;
        this.errorHandler = errorHandler;
        this.offset = function () { return [0, 0]; };
    }
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @param offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     */
    BrowserViewportScroller.prototype.setOffset = function (offset) {
        if (Array.isArray(offset)) {
            this.offset = function () { return offset; };
        }
        else {
            this.offset = offset;
        }
    };
    /**
     * Retrieves the current scroll position.
     * @returns The position in screen coordinates.
     */
    BrowserViewportScroller.prototype.getScrollPosition = function () {
        if (this.supportScrollRestoration()) {
            return [this.window.scrollX, this.window.scrollY];
        }
        else {
            return [0, 0];
        }
    };
    /**
     * Sets the scroll position.
     * @param position The new position in screen coordinates.
     */
    BrowserViewportScroller.prototype.scrollToPosition = function (position) {
        if (this.supportScrollRestoration()) {
            this.window.scrollTo(position[0], position[1]);
        }
    };
    /**
     * Scrolls to an anchor element.
     * @param anchor The ID of the anchor element.
     */
    BrowserViewportScroller.prototype.scrollToAnchor = function (anchor) {
        if (this.supportScrollRestoration()) {
            // Escape anything passed to `querySelector` as it can throw errors and stop the application
            // from working if invalid values are passed.
            if (this.window.CSS && this.window.CSS.escape) {
                anchor = this.window.CSS.escape(anchor);
            }
            else {
                anchor = anchor.replace(/(\"|\'\ |:|\.|\[|\]|,|=)/g, '\\$1');
            }
            try {
                var elSelectedById = this.document.querySelector("#" + anchor);
                if (elSelectedById) {
                    this.scrollToElement(elSelectedById);
                    return;
                }
                var elSelectedByName = this.document.querySelector("[name='" + anchor + "']");
                if (elSelectedByName) {
                    this.scrollToElement(elSelectedByName);
                    return;
                }
            }
            catch (e) {
                this.errorHandler.handleError(e);
            }
        }
    };
    /**
     * Disables automatic scroll restoration provided by the browser.
     */
    BrowserViewportScroller.prototype.setHistoryScrollRestoration = function (scrollRestoration) {
        if (this.supportScrollRestoration()) {
            var history_1 = this.window.history;
            if (history_1 && history_1.scrollRestoration) {
                history_1.scrollRestoration = scrollRestoration;
            }
        }
    };
    BrowserViewportScroller.prototype.scrollToElement = function (el) {
        var rect = el.getBoundingClientRect();
        var left = rect.left + this.window.pageXOffset;
        var top = rect.top + this.window.pageYOffset;
        var offset = this.offset();
        this.window.scrollTo(left - offset[0], top - offset[1]);
    };
    /**
     * We only support scroll restoration when we can get a hold of window.
     * This means that we do not support this behavior when running in a web worker.
     *
     * Lifting this restriction right now would require more changes in the dom adapter.
     * Since webworkers aren't widely used, we will lift it once RouterScroller is
     * battle-tested.
     */
    BrowserViewportScroller.prototype.supportScrollRestoration = function () {
        try {
            return !!this.window && !!this.window.scrollTo;
        }
        catch (_a) {
            return false;
        }
    };
    return BrowserViewportScroller;
}());
export { BrowserViewportScroller };
/**
 * Provides an empty implementation of the viewport scroller. This will
 * live in @angular/common as it will be used by both platform-server and platform-webworker.
 */
var NullViewportScroller = /** @class */ (function () {
    function NullViewportScroller() {
    }
    /**
     * Empty implementation
     */
    NullViewportScroller.prototype.setOffset = function (offset) { };
    /**
     * Empty implementation
     */
    NullViewportScroller.prototype.getScrollPosition = function () { return [0, 0]; };
    /**
     * Empty implementation
     */
    NullViewportScroller.prototype.scrollToPosition = function (position) { };
    /**
     * Empty implementation
     */
    NullViewportScroller.prototype.scrollToAnchor = function (anchor) { };
    /**
     * Empty implementation
     */
    NullViewportScroller.prototype.setHistoryScrollRestoration = function (scrollRestoration) { };
    return NullViewportScroller;
}());
export { NullViewportScroller };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFJdEM7Ozs7R0FJRztBQUNIO0lBQUE7SUF5Q0EsQ0FBQztJQXhDQyxxQ0FBcUM7SUFDckMsYUFBYTtJQUNiLGtCQUFrQjtJQUNYLGdDQUFlLEdBQUcsaUJBQWlCLENBQUM7UUFDekMsVUFBVSxFQUFFLE1BQU07UUFDbEIsT0FBTyxFQUFFLGNBQU0sT0FBQSxJQUFJLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQTdFLENBQTZFO0tBQzdGLENBQUMsQ0FBQztJQWtDTCx1QkFBQztDQUFBLEFBekNELElBeUNDO1NBekNxQixnQkFBZ0I7QUEyQ3RDOztHQUVHO0FBQ0g7SUFHRSxpQ0FBb0IsUUFBYSxFQUFVLE1BQVcsRUFBVSxZQUEwQjtRQUF0RSxhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBSztRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBRmxGLFdBQU0sR0FBMkIsY0FBTSxPQUFBLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFOLENBQU0sQ0FBQztJQUV1QyxDQUFDO0lBRTlGOzs7OztPQUtHO0lBQ0gsMkNBQVMsR0FBVCxVQUFVLE1BQWlEO1FBQ3pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFH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TUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNLLDBEQUF3QixHQUFoQztRQUNFLElBQUk7WUFDRixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoRDtRQUFDLFdBQU07WUFDTixPQUFPLEtBQUssQ0FBQztTQUNkO0lBQ0gsQ0FBQztJQUNILDhCQUFDO0FBQUQsQ0FBQyxBQTFHRCxJQTBHQzs7QUFHRDs7O0dBR0c7QUFDSDtJQUFBO0lBeUJBLENBQUM7SUF4QkM7O09BRUc7SUFDSCx3Q0FBUyxHQUFULFVBQVUsTUFBaUQsSUFBUyxDQUFDO0lBRXJFOztPQUVHO0lBQ0gsZ0RBQWlCLEdBQWpCLGNBQXdDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhEOztPQUVHO0lBQ0gsK0NBQWdCLEdBQWhCLFVBQWlCLFFBQTBCLElBQVMsQ0FBQztJQUVyRDs7T0FFRztJQUNILDZDQUFjLEdBQWQsVUFBZSxNQUFjLElBQVMsQ0FBQztJQUV2Qzs7T0FFRztJQUNILDBEQUEyQixHQUEzQixVQUE0QixpQkFBa0MsSUFBUyxDQUFDO0lBQzFFLDJCQUFDO0FBQUQsQ0FBQyxBQXpCRCxJQXlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFcnJvckhhbmRsZXIsIM6UZGVmaW5lSW5qZWN0YWJsZSwgzpRpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuXG5cblxuLyoqXG4gKiBEZWZpbmVzIGEgc2Nyb2xsIHBvc2l0aW9uIG1hbmFnZXIuIEltcGxlbWVudGVkIGJ5IGBCcm93c2VyVmlld3BvcnRTY3JvbGxlcmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlld3BvcnRTY3JvbGxlciB7XG4gIC8vIERlLXN1Z2FyZWQgdHJlZS1zaGFrYWJsZSBpbmplY3Rpb25cbiAgLy8gU2VlICMyMzkxN1xuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIG5nSW5qZWN0YWJsZURlZiA9IM6UZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBCcm93c2VyVmlld3BvcnRTY3JvbGxlcijOlGluamVjdChET0NVTUVOVCksIHdpbmRvdywgzpRpbmplY3QoRXJyb3JIYW5kbGVyKSlcbiAgfSk7XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcylcbiAgICogb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRvcCBvZmZzZXQgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICBhYnN0cmFjdCBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXTtcblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhIHNwZWNpZmllZCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBhbmNob3IgVGhlIElEIG9mIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgICovXG4gIGFic3RyYWN0IHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZDtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNjcm9sbCByZXN0b3JhdGlvbiBwcm92aWRlZCBieSB0aGUgYnJvd3Nlci5cbiAgICogU2VlIGFsc28gW3dpbmRvdy5oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uXG4gICAqIGluZm9dKGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3dlYi91cGRhdGVzLzIwMTUvMDkvaGlzdG9yeS1hcGktc2Nyb2xsLXJlc3RvcmF0aW9uKS5cbiAgICovXG4gIGFic3RyYWN0IHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZDtcbn1cblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSBzY3JvbGwgcG9zaXRpb24gZm9yIGEgYnJvd3NlciB3aW5kb3cuXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICBwcml2YXRlIG9mZnNldDogKCkgPT4gW251bWJlciwgbnVtYmVyXSA9ICgpID0+IFswLCAwXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRvY3VtZW50OiBhbnksIHByaXZhdGUgd2luZG93OiBhbnksIHByaXZhdGUgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXIpIHt9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcylcbiAgICogb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRvcCBvZmZzZXQgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9mZnNldCkpIHtcbiAgICAgIHRoaXMub2Zmc2V0ID0gKCkgPT4gb2Zmc2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHJldHVybnMgVGhlIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIGlmICh0aGlzLnN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpKSB7XG4gICAgICByZXR1cm4gW3RoaXMud2luZG93LnNjcm9sbFgsIHRoaXMud2luZG93LnNjcm9sbFldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gWzAsIDBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBUaGUgbmV3IHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBhbmNob3IgZWxlbWVudC5cbiAgICogQHBhcmFtIGFuY2hvciBUaGUgSUQgb2YgdGhlIGFuY2hvciBlbGVtZW50LlxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgLy8gRXNjYXBlIGFueXRoaW5nIHBhc3NlZCB0byBgcXVlcnlTZWxlY3RvcmAgYXMgaXQgY2FuIHRocm93IGVycm9ycyBhbmQgc3RvcCB0aGUgYXBwbGljYXRpb25cbiAgICAgIC8vIGZyb20gd29ya2luZyBpZiBpbnZhbGlkIHZhbHVlcyBhcmUgcGFzc2VkLlxuICAgICAgaWYgKHRoaXMud2luZG93LkNTUyAmJiB0aGlzLndpbmRvdy5DU1MuZXNjYXBlKSB7XG4gICAgICAgIGFuY2hvciA9IHRoaXMud2luZG93LkNTUy5lc2NhcGUoYW5jaG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFuY2hvciA9IGFuY2hvci5yZXBsYWNlKC8oXFxcInxcXCdcXCB8OnxcXC58XFxbfFxcXXwsfD0pL2csICdcXFxcJDEnKTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVsU2VsZWN0ZWRCeUlkID0gdGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHthbmNob3J9YCk7XG4gICAgICAgIGlmIChlbFNlbGVjdGVkQnlJZCkge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsVG9FbGVtZW50KGVsU2VsZWN0ZWRCeUlkKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWxTZWxlY3RlZEJ5TmFtZSA9IHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW25hbWU9JyR7YW5jaG9yfSddYCk7XG4gICAgICAgIGlmIChlbFNlbGVjdGVkQnlOYW1lKSB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxTZWxlY3RlZEJ5TmFtZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMud2luZG93Lmhpc3Rvcnk7XG4gICAgICBpZiAoaGlzdG9yeSAmJiBoaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uKSB7XG4gICAgICAgIGhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSBzY3JvbGxSZXN0b3JhdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjcm9sbFRvRWxlbWVudChlbDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGxlZnQgPSByZWN0LmxlZnQgKyB0aGlzLndpbmRvdy5wYWdlWE9mZnNldDtcbiAgICBjb25zdCB0b3AgPSByZWN0LnRvcCArIHRoaXMud2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KCk7XG4gICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8obGVmdCAtIG9mZnNldFswXSwgdG9wIC0gb2Zmc2V0WzFdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBvbmx5IHN1cHBvcnQgc2Nyb2xsIHJlc3RvcmF0aW9uIHdoZW4gd2UgY2FuIGdldCBhIGhvbGQgb2Ygd2luZG93LlxuICAgKiBUaGlzIG1lYW5zIHRoYXQgd2UgZG8gbm90IHN1cHBvcnQgdGhpcyBiZWhhdmlvciB3aGVuIHJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyLlxuICAgKlxuICAgKiBMaWZ0aW5nIHRoaXMgcmVzdHJpY3Rpb24gcmlnaHQgbm93IHdvdWxkIHJlcXVpcmUgbW9yZSBjaGFuZ2VzIGluIHRoZSBkb20gYWRhcHRlci5cbiAgICogU2luY2Ugd2Vid29ya2VycyBhcmVuJ3Qgd2lkZWx5IHVzZWQsIHdlIHdpbGwgbGlmdCBpdCBvbmNlIFJvdXRlclNjcm9sbGVyIGlzXG4gICAqIGJhdHRsZS10ZXN0ZWQuXG4gICAqL1xuICBwcml2YXRlIHN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICEhdGhpcy53aW5kb3cgJiYgISF0aGlzLndpbmRvdy5zY3JvbGxUbztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGVtcHR5IGltcGxlbWVudGF0aW9uIG9mIHRoZSB2aWV3cG9ydCBzY3JvbGxlci4gVGhpcyB3aWxsXG4gKiBsaXZlIGluIEBhbmd1bGFyL2NvbW1vbiBhcyBpdCB3aWxsIGJlIHVzZWQgYnkgYm90aCBwbGF0Zm9ybS1zZXJ2ZXIgYW5kIHBsYXRmb3JtLXdlYndvcmtlci5cbiAqL1xuZXhwb3J0IGNsYXNzIE51bGxWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHsgcmV0dXJuIFswLCAwXTsgfVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHt9XG59XG4iXX0=