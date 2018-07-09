/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { defineInjectable, inject } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
/**
 * @whatItDoes Manages the scroll position.
 */
var ViewportScroller = /** @class */ (function () {
    function ViewportScroller() {
    }
    // De-sugared tree-shakable injection
    // See #23917
    /** @nocollapse */
    ViewportScroller.ngInjectableDef = defineInjectable({ providedIn: 'root', factory: function () { return new BrowserViewportScroller(inject(DOCUMENT), window); } });
    return ViewportScroller;
}());
export { ViewportScroller };
/**
 * @whatItDoes Manages the scroll position.
 */
var /**
 * @whatItDoes Manages the scroll position.
 */
BrowserViewportScroller = /** @class */ (function () {
    function BrowserViewportScroller(document, window) {
        this.document = document;
        this.window = window;
        this.offset = function () { return [0, 0]; };
    }
    /**
     * @whatItDoes Configures the top offset used when scrolling to an anchor.
     *
     * * When given a number, the service will always use the number.
     * * When given a function, the service will invoke the function every time it restores scroll
     * position.
     */
    /**
       * @whatItDoes Configures the top offset used when scrolling to an anchor.
       *
       * * When given a number, the service will always use the number.
       * * When given a function, the service will invoke the function every time it restores scroll
       * position.
       */
    BrowserViewportScroller.prototype.setOffset = /**
       * @whatItDoes Configures the top offset used when scrolling to an anchor.
       *
       * * When given a number, the service will always use the number.
       * * When given a function, the service will invoke the function every time it restores scroll
       * position.
       */
    function (offset) {
        if (Array.isArray(offset)) {
            this.offset = function () { return offset; };
        }
        else {
            this.offset = offset;
        }
    };
    /**
     * @whatItDoes Returns the current scroll position.
     */
    /**
       * @whatItDoes Returns the current scroll position.
       */
    BrowserViewportScroller.prototype.getScrollPosition = /**
       * @whatItDoes Returns the current scroll position.
       */
    function () {
        if (this.supportScrollRestoration()) {
            return [this.window.scrollX, this.window.scrollY];
        }
        else {
            return [0, 0];
        }
    };
    /**
     * @whatItDoes Sets the scroll position.
     */
    /**
       * @whatItDoes Sets the scroll position.
       */
    BrowserViewportScroller.prototype.scrollToPosition = /**
       * @whatItDoes Sets the scroll position.
       */
    function (position) {
        if (this.supportScrollRestoration()) {
            this.window.scrollTo(position[0], position[1]);
        }
    };
    /**
     * @whatItDoes Scrolls to the provided anchor.
     */
    /**
       * @whatItDoes Scrolls to the provided anchor.
       */
    BrowserViewportScroller.prototype.scrollToAnchor = /**
       * @whatItDoes Scrolls to the provided anchor.
       */
    function (anchor) {
        if (this.supportScrollRestoration()) {
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
    };
    /**
     * @whatItDoes Disables automatic scroll restoration provided by the browser.
     */
    /**
       * @whatItDoes Disables automatic scroll restoration provided by the browser.
       */
    BrowserViewportScroller.prototype.setHistoryScrollRestoration = /**
       * @whatItDoes Disables automatic scroll restoration provided by the browser.
       */
    function (scrollRestoration) {
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
    /**
       * We only support scroll restoration when we can get a hold of window.
       * This means that we do not support this behavior when running in a web worker.
       *
       * Lifting this restriction right now would require more changes in the dom adapter.
       * Since webworkers aren't widely used, we will lift it once RouterScroller is
       * battle-tested.
       */
    BrowserViewportScroller.prototype.supportScrollRestoration = /**
       * We only support scroll restoration when we can get a hold of window.
       * This means that we do not support this behavior when running in a web worker.
       *
       * Lifting this restriction right now would require more changes in the dom adapter.
       * Since webworkers aren't widely used, we will lift it once RouterScroller is
       * battle-tested.
       */
    function () {
        try {
            return !!this.window && !!this.window.scrollTo;
        }
        catch (e) {
            return false;
        }
    };
    return BrowserViewportScroller;
}());
/**
 * @whatItDoes Manages the scroll position.
 */
export { BrowserViewportScroller };
/**
 * @whatItDoes Provides an empty implementation of the viewport scroller. This will
 * live in @angular/common as it will be used by both platform-server and platform-webworker.
 */
var /**
 * @whatItDoes Provides an empty implementation of the viewport scroller. This will
 * live in @angular/common as it will be used by both platform-server and platform-webworker.
 */
NullViewportScroller = /** @class */ (function () {
    function NullViewportScroller() {
    }
    /**
     * @whatItDoes empty implementation
     */
    /**
       * @whatItDoes empty implementation
       */
    NullViewportScroller.prototype.setOffset = /**
       * @whatItDoes empty implementation
       */
    function (offset) { };
    /**
     * @whatItDoes empty implementation
     */
    /**
       * @whatItDoes empty implementation
       */
    NullViewportScroller.prototype.getScrollPosition = /**
       * @whatItDoes empty implementation
       */
    function () { return [0, 0]; };
    /**
     * @whatItDoes empty implementation
     */
    /**
       * @whatItDoes empty implementation
       */
    NullViewportScroller.prototype.scrollToPosition = /**
       * @whatItDoes empty implementation
       */
    function (position) { };
    /**
     * @whatItDoes empty implementation
     */
    /**
       * @whatItDoes empty implementation
       */
    NullViewportScroller.prototype.scrollToAnchor = /**
       * @whatItDoes empty implementation
       */
    function (anchor) { };
    /**
     * @whatItDoes empty implementation
     */
    /**
       * @whatItDoes empty implementation
       */
    NullViewportScroller.prototype.setHistoryScrollRestoration = /**
       * @whatItDoes empty implementation
       */
    function (scrollRestoration) { };
    return NullViewportScroller;
}());
/**
 * @whatItDoes Provides an empty implementation of the viewport scroller. This will
 * live in @angular/common as it will be used by both platform-server and platform-webworker.
 */
export { NullViewportScroller };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7Ozs7Ozs7dUNBU1gsZ0JBQWdCLENBQ3JDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsY0FBTSxPQUFBLElBQUksdUJBQXVCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFyRCxDQUFxRCxFQUFDLENBQUM7MkJBcEJqRzs7U0Flc0IsZ0JBQWdCOzs7O0FBMEN0Qzs7O0FBQUE7SUFHRSxpQ0FBb0IsUUFBYSxFQUFVLE1BQVc7UUFBbEMsYUFBUSxHQUFSLFFBQVEsQ0FBSztRQUFVLFdBQU0sR0FBTixNQUFNLENBQUs7c0JBRmIsY0FBTSxPQUFBLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFOLENBQU07S0FFSztJQUUxRDs7Ozs7O09BTUc7Ozs7Ozs7O0lBQ0gsMkNBQVM7Ozs7Ozs7SUFBVCxVQUFVLE1BQWlEO1FBQ3pELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBTSxPQUFBLE1BQU0sRUFBTixDQUFNLENBQUM7U0FDNUI7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1NBQ3RCO0tBQ0Y7SUFFRDs7T0FFRzs7OztJQUNILG1EQUFpQjs7O0lBQWpCO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHdC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QUE7OztJQUNFOztPQUVHOzs7O0lBQ0gsd0NBQVM7OztJQUFULFVBQVUsTUFBaUQsS0FBVTtJQUVyRTs7T0FFRzs7OztJQUNILGdEQUFpQjs7O0lBQWpCLGNBQXdDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBRXhEOztPQUVHOzs7O0lBQ0gsK0NBQWdCOzs7SUFBaEIsVUFBaUIsUUFBMEIsS0FBVTtJQUVyRDs7T0FFRzs7OztJQUNILDZDQUFjOzs7SUFBZCxVQUFlLE1BQWMsS0FBVTtJQUV2Qzs7T0FFRzs7OztJQUNILDBEQUEyQjs7O0lBQTNCLFVBQTRCLGlCQUFrQyxLQUFVOytCQXJMMUU7SUFzTEMsQ0FBQTs7Ozs7QUF6QkQsZ0NBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2RlZmluZUluamVjdGFibGUsIGluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4vZG9tX3Rva2Vucyc7XG5cbi8qKlxuICogQHdoYXRJdERvZXMgTWFuYWdlcyB0aGUgc2Nyb2xsIHBvc2l0aW9uLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlld3BvcnRTY3JvbGxlciB7XG4gIC8vIERlLXN1Z2FyZWQgdHJlZS1zaGFrYWJsZSBpbmplY3Rpb25cbiAgLy8gU2VlICMyMzkxN1xuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIG5nSW5qZWN0YWJsZURlZiA9IGRlZmluZUluamVjdGFibGUoXG4gICAgICB7cHJvdmlkZWRJbjogJ3Jvb3QnLCBmYWN0b3J5OiAoKSA9PiBuZXcgQnJvd3NlclZpZXdwb3J0U2Nyb2xsZXIoaW5qZWN0KERPQ1VNRU5UKSwgd2luZG93KX0pO1xuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKlxuICAgKiBXaGVuIGdpdmVuIGEgdHVwbGUgd2l0aCB0d28gbnVtYmVyLCB0aGUgc2VydmljZSB3aWxsIGFsd2F5cyB1c2UgdGhlIG51bWJlcnMuXG4gICAqIFdoZW4gZ2l2ZW4gYSBmdW5jdGlvbiwgdGhlIHNlcnZpY2Ugd2lsbCBpbnZva2UgdGhlIGZ1bmN0aW9uIGV2ZXJ5IHRpbWUgaXQgcmVzdG9yZXMgc2Nyb2xsXG4gICAqIHBvc2l0aW9uLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBSZXR1cm5zIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICovXG4gIGFic3RyYWN0IGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl07XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIFNldHMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICovXG4gIGFic3RyYWN0IHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBTY3JvbGxzIHRvIHRoZSBwcm92aWRlZCBhbmNob3IuXG4gICAqL1xuICBhYnN0cmFjdCBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIERpc2FibGVzIGF1dG9tYXRpYyBzY3JvbGwgcmVzdG9yYXRpb24gcHJvdmlkZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAqIFNlZSBhbHNvIFt3aW5kb3cuaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvblxuICAgKiBpbmZvXShodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS93ZWIvdXBkYXRlcy8yMDE1LzA5L2hpc3RvcnktYXBpLXNjcm9sbC1yZXN0b3JhdGlvbilcbiAgICovXG4gIGFic3RyYWN0IHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZDtcbn1cblxuLyoqXG4gKiBAd2hhdEl0RG9lcyBNYW5hZ2VzIHRoZSBzY3JvbGwgcG9zaXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICBwcml2YXRlIG9mZnNldDogKCkgPT4gW251bWJlciwgbnVtYmVyXSA9ICgpID0+IFswLCAwXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRvY3VtZW50OiBhbnksIHByaXZhdGUgd2luZG93OiBhbnkpIHt9XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqXG4gICAqICogV2hlbiBnaXZlbiBhIG51bWJlciwgdGhlIHNlcnZpY2Ugd2lsbCBhbHdheXMgdXNlIHRoZSBudW1iZXIuXG4gICAqICogV2hlbiBnaXZlbiBhIGZ1bmN0aW9uLCB0aGUgc2VydmljZSB3aWxsIGludm9rZSB0aGUgZnVuY3Rpb24gZXZlcnkgdGltZSBpdCByZXN0b3JlcyBzY3JvbGxcbiAgICogcG9zaXRpb24uXG4gICAqL1xuICBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9mZnNldCkpIHtcbiAgICAgIHRoaXMub2Zmc2V0ID0gKCkgPT4gb2Zmc2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgUmV0dXJucyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgcmV0dXJuIFt0aGlzLndpbmRvdy5zY3JvbGxYLCB0aGlzLndpbmRvdy5zY3JvbGxZXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgU2V0cyB0aGUgc2Nyb2xsIHBvc2l0aW9uLlxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpKSB7XG4gICAgICB0aGlzLndpbmRvdy5zY3JvbGxUbyhwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBTY3JvbGxzIHRvIHRoZSBwcm92aWRlZCBhbmNob3IuXG4gICAqL1xuICBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpKSB7XG4gICAgICBjb25zdCBlbFNlbGVjdGVkQnlJZCA9IHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7YW5jaG9yfWApO1xuICAgICAgaWYgKGVsU2VsZWN0ZWRCeUlkKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9FbGVtZW50KGVsU2VsZWN0ZWRCeUlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZWxTZWxlY3RlZEJ5TmFtZSA9IHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW25hbWU9JyR7YW5jaG9yfSddYCk7XG4gICAgICBpZiAoZWxTZWxlY3RlZEJ5TmFtZSkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvRWxlbWVudChlbFNlbGVjdGVkQnlOYW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMud2luZG93Lmhpc3Rvcnk7XG4gICAgICBpZiAoaGlzdG9yeSAmJiBoaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uKSB7XG4gICAgICAgIGhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSBzY3JvbGxSZXN0b3JhdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjcm9sbFRvRWxlbWVudChlbDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGxlZnQgPSByZWN0LmxlZnQgKyB0aGlzLndpbmRvdy5wYWdlWE9mZnNldDtcbiAgICBjb25zdCB0b3AgPSByZWN0LnRvcCArIHRoaXMud2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KCk7XG4gICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8obGVmdCAtIG9mZnNldFswXSwgdG9wIC0gb2Zmc2V0WzFdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBvbmx5IHN1cHBvcnQgc2Nyb2xsIHJlc3RvcmF0aW9uIHdoZW4gd2UgY2FuIGdldCBhIGhvbGQgb2Ygd2luZG93LlxuICAgKiBUaGlzIG1lYW5zIHRoYXQgd2UgZG8gbm90IHN1cHBvcnQgdGhpcyBiZWhhdmlvciB3aGVuIHJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyLlxuICAgKlxuICAgKiBMaWZ0aW5nIHRoaXMgcmVzdHJpY3Rpb24gcmlnaHQgbm93IHdvdWxkIHJlcXVpcmUgbW9yZSBjaGFuZ2VzIGluIHRoZSBkb20gYWRhcHRlci5cbiAgICogU2luY2Ugd2Vid29ya2VycyBhcmVuJ3Qgd2lkZWx5IHVzZWQsIHdlIHdpbGwgbGlmdCBpdCBvbmNlIFJvdXRlclNjcm9sbGVyIGlzXG4gICAqIGJhdHRsZS10ZXN0ZWQuXG4gICAqL1xuICBwcml2YXRlIHN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICEhdGhpcy53aW5kb3cgJiYgISF0aGlzLndpbmRvdy5zY3JvbGxUbztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cblxuLyoqXG4gKiBAd2hhdEl0RG9lcyBQcm92aWRlcyBhbiBlbXB0eSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgdmlld3BvcnQgc2Nyb2xsZXIuIFRoaXMgd2lsbFxuICogbGl2ZSBpbiBAYW5ndWxhci9jb21tb24gYXMgaXQgd2lsbCBiZSB1c2VkIGJ5IGJvdGggcGxhdGZvcm0tc2VydmVyIGFuZCBwbGF0Zm9ybS13ZWJ3b3JrZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBOdWxsVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvKipcbiAgICogQHdoYXRJdERvZXMgZW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBlbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXSB7IHJldHVybiBbMCwgMF07IH1cblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgZW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIGVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQge31cblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgZW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZCB7fVxufSJdfQ==