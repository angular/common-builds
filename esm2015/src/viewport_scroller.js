/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ErrorHandler, ɵɵdefineInjectable, ɵɵinject } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
let ViewportScroller = /** @class */ (() => {
    class ViewportScroller {
    }
    // De-sugared tree-shakable injection
    // See #23917
    /** @nocollapse */
    ViewportScroller.ɵprov = ɵɵdefineInjectable({
        token: ViewportScroller,
        providedIn: 'root',
        factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window, ɵɵinject(ErrorHandler))
    });
    return ViewportScroller;
})();
export { ViewportScroller };
/**
 * Manages the scroll position for a browser window.
 */
export class BrowserViewportScroller {
    constructor(document, window, errorHandler) {
        this.document = document;
        this.window = window;
        this.errorHandler = errorHandler;
        this.offset = () => [0, 0];
    }
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @param offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     */
    setOffset(offset) {
        if (Array.isArray(offset)) {
            this.offset = () => offset;
        }
        else {
            this.offset = offset;
        }
    }
    /**
     * Retrieves the current scroll position.
     * @returns The position in screen coordinates.
     */
    getScrollPosition() {
        if (this.supportScrollRestoration()) {
            return [this.window.scrollX, this.window.scrollY];
        }
        else {
            return [0, 0];
        }
    }
    /**
     * Sets the scroll position.
     * @param position The new position in screen coordinates.
     */
    scrollToPosition(position) {
        if (this.supportScrollRestoration()) {
            this.window.scrollTo(position[0], position[1]);
        }
    }
    /**
     * Scrolls to an anchor element.
     * @param anchor The ID of the anchor element.
     */
    scrollToAnchor(anchor) {
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
                const elSelectedById = this.document.querySelector(`#${anchor}`);
                if (elSelectedById) {
                    this.scrollToElement(elSelectedById);
                    return;
                }
                const elSelectedByName = this.document.querySelector(`[name='${anchor}']`);
                if (elSelectedByName) {
                    this.scrollToElement(elSelectedByName);
                    return;
                }
            }
            catch (e) {
                this.errorHandler.handleError(e);
            }
        }
    }
    /**
     * Disables automatic scroll restoration provided by the browser.
     */
    setHistoryScrollRestoration(scrollRestoration) {
        if (this.supportScrollRestoration()) {
            const history = this.window.history;
            if (history && history.scrollRestoration) {
                history.scrollRestoration = scrollRestoration;
            }
        }
    }
    scrollToElement(el) {
        const rect = el.getBoundingClientRect();
        const left = rect.left + this.window.pageXOffset;
        const top = rect.top + this.window.pageYOffset;
        const offset = this.offset();
        this.window.scrollTo(left - offset[0], top - offset[1]);
    }
    /**
     * We only support scroll restoration when we can get a hold of window.
     * This means that we do not support this behavior when running in a web worker.
     *
     * Lifting this restriction right now would require more changes in the dom adapter.
     * Since webworkers aren't widely used, we will lift it once RouterScroller is
     * battle-tested.
     */
    supportScrollRestoration() {
        try {
            return !!this.window && !!this.window.scrollTo;
        }
        catch (_a) {
            return false;
        }
    }
}
/**
 * Provides an empty implementation of the viewport scroller. This will
 * live in @angular/common as it will be used by both platform-server and platform-webworker.
 */
export class NullViewportScroller {
    /**
     * Empty implementation
     */
    setOffset(offset) { }
    /**
     * Empty implementation
     */
    getScrollPosition() {
        return [0, 0];
    }
    /**
     * Empty implementation
     */
    scrollToPosition(position) { }
    /**
     * Empty implementation
     */
    scrollToAnchor(anchor) { }
    /**
     * Empty implementation
     */
    setHistoryScrollRestoration(scrollRestoration) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFJdEM7Ozs7R0FJRztBQUNIO0lBQUEsTUFBc0IsZ0JBQWdCOztJQUNwQyxxQ0FBcUM7SUFDckMsYUFBYTtJQUNiLGtCQUFrQjtJQUNYLHNCQUFLLEdBQUcsa0JBQWtCLENBQUM7UUFDaEMsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixVQUFVLEVBQUUsTUFBTTtRQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUMvRixDQUFDLENBQUM7SUFrQ0wsdUJBQUM7S0FBQTtTQTFDcUIsZ0JBQWdCO0FBNEN0Qzs7R0FFRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFHbEMsWUFBb0IsUUFBYSxFQUFVLE1BQVcsRUFBVSxZQUEwQjtRQUF0RSxhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBSztRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBRmxGLFdBQU0sR0FBMkIsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFdUMsQ0FBQztJQUU5Rjs7Ozs7T0FLRztJQUNILFNBQVMsQ0FBQyxNQUFpRDtRQUN6RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLE1BQU0s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R0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNLLHdCQUF3QjtRQUM5QixJQUFJO1lBQ0YsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEQ7UUFBQyxXQUFNO1lBQ04sT0FBTyxLQUFLLENBQUM7U0FDZDtJQUNILENBQUM7Q0FDRjtBQUdEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxvQkFBb0I7SUFDL0I7O09BRUc7SUFDSCxTQUFTLENBQUMsTUFBaUQsSUFBUyxDQUFDO0lBRXJFOztPQUVHO0lBQ0gsaUJBQWlCO1FBQ2YsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxnQkFBZ0IsQ0FBQyxRQUEwQixJQUFTLENBQUM7SUFFckQ7O09BRUc7SUFDSCxjQUFjLENBQUMsTUFBYyxJQUFTLENBQUM7SUFFdkM7O09BRUc7SUFDSCwyQkFBMkIsQ0FBQyxpQkFBa0MsSUFBUyxDQUFDO0NBQ3pFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Vycm9ySGFuZGxlciwgybXJtWRlZmluZUluamVjdGFibGUsIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuXG5cblxuLyoqXG4gKiBEZWZpbmVzIGEgc2Nyb2xsIHBvc2l0aW9uIG1hbmFnZXIuIEltcGxlbWVudGVkIGJ5IGBCcm93c2VyVmlld3BvcnRTY3JvbGxlcmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlld3BvcnRTY3JvbGxlciB7XG4gIC8vIERlLXN1Z2FyZWQgdHJlZS1zaGFrYWJsZSBpbmplY3Rpb25cbiAgLy8gU2VlICMyMzkxN1xuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIMm1cHJvdiA9IMm1ybVkZWZpbmVJbmplY3RhYmxlKHtcbiAgICB0b2tlbjogVmlld3BvcnRTY3JvbGxlcixcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogKCkgPT4gbmV3IEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyKMm1ybVpbmplY3QoRE9DVU1FTlQpLCB3aW5kb3csIMm1ybVpbmplY3QoRXJyb3JIYW5kbGVyKSlcbiAgfSk7XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcylcbiAgICogb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRvcCBvZmZzZXQgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICBhYnN0cmFjdCBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXTtcblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhIHNwZWNpZmllZCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBhbmNob3IgVGhlIElEIG9mIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgICovXG4gIGFic3RyYWN0IHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZDtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNjcm9sbCByZXN0b3JhdGlvbiBwcm92aWRlZCBieSB0aGUgYnJvd3Nlci5cbiAgICogU2VlIGFsc28gW3dpbmRvdy5oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uXG4gICAqIGluZm9dKGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3dlYi91cGRhdGVzLzIwMTUvMDkvaGlzdG9yeS1hcGktc2Nyb2xsLXJlc3RvcmF0aW9uKS5cbiAgICovXG4gIGFic3RyYWN0IHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZDtcbn1cblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSBzY3JvbGwgcG9zaXRpb24gZm9yIGEgYnJvd3NlciB3aW5kb3cuXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICBwcml2YXRlIG9mZnNldDogKCkgPT4gW251bWJlciwgbnVtYmVyXSA9ICgpID0+IFswLCAwXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRvY3VtZW50OiBhbnksIHByaXZhdGUgd2luZG93OiBhbnksIHByaXZhdGUgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXIpIHt9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcylcbiAgICogb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRvcCBvZmZzZXQgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9mZnNldCkpIHtcbiAgICAgIHRoaXMub2Zmc2V0ID0gKCkgPT4gb2Zmc2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHJldHVybnMgVGhlIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIGlmICh0aGlzLnN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpKSB7XG4gICAgICByZXR1cm4gW3RoaXMud2luZG93LnNjcm9sbFgsIHRoaXMud2luZG93LnNjcm9sbFldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gWzAsIDBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBUaGUgbmV3IHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBhbmNob3IgZWxlbWVudC5cbiAgICogQHBhcmFtIGFuY2hvciBUaGUgSUQgb2YgdGhlIGFuY2hvciBlbGVtZW50LlxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgLy8gRXNjYXBlIGFueXRoaW5nIHBhc3NlZCB0byBgcXVlcnlTZWxlY3RvcmAgYXMgaXQgY2FuIHRocm93IGVycm9ycyBhbmQgc3RvcCB0aGUgYXBwbGljYXRpb25cbiAgICAgIC8vIGZyb20gd29ya2luZyBpZiBpbnZhbGlkIHZhbHVlcyBhcmUgcGFzc2VkLlxuICAgICAgaWYgKHRoaXMud2luZG93LkNTUyAmJiB0aGlzLndpbmRvdy5DU1MuZXNjYXBlKSB7XG4gICAgICAgIGFuY2hvciA9IHRoaXMud2luZG93LkNTUy5lc2NhcGUoYW5jaG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFuY2hvciA9IGFuY2hvci5yZXBsYWNlKC8oXFxcInxcXCdcXCB8OnxcXC58XFxbfFxcXXwsfD0pL2csICdcXFxcJDEnKTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVsU2VsZWN0ZWRCeUlkID0gdGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHthbmNob3J9YCk7XG4gICAgICAgIGlmIChlbFNlbGVjdGVkQnlJZCkge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsVG9FbGVtZW50KGVsU2VsZWN0ZWRCeUlkKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWxTZWxlY3RlZEJ5TmFtZSA9IHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW25hbWU9JyR7YW5jaG9yfSddYCk7XG4gICAgICAgIGlmIChlbFNlbGVjdGVkQnlOYW1lKSB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxTZWxlY3RlZEJ5TmFtZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMud2luZG93Lmhpc3Rvcnk7XG4gICAgICBpZiAoaGlzdG9yeSAmJiBoaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uKSB7XG4gICAgICAgIGhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSBzY3JvbGxSZXN0b3JhdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjcm9sbFRvRWxlbWVudChlbDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGxlZnQgPSByZWN0LmxlZnQgKyB0aGlzLndpbmRvdy5wYWdlWE9mZnNldDtcbiAgICBjb25zdCB0b3AgPSByZWN0LnRvcCArIHRoaXMud2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KCk7XG4gICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8obGVmdCAtIG9mZnNldFswXSwgdG9wIC0gb2Zmc2V0WzFdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBvbmx5IHN1cHBvcnQgc2Nyb2xsIHJlc3RvcmF0aW9uIHdoZW4gd2UgY2FuIGdldCBhIGhvbGQgb2Ygd2luZG93LlxuICAgKiBUaGlzIG1lYW5zIHRoYXQgd2UgZG8gbm90IHN1cHBvcnQgdGhpcyBiZWhhdmlvciB3aGVuIHJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyLlxuICAgKlxuICAgKiBMaWZ0aW5nIHRoaXMgcmVzdHJpY3Rpb24gcmlnaHQgbm93IHdvdWxkIHJlcXVpcmUgbW9yZSBjaGFuZ2VzIGluIHRoZSBkb20gYWRhcHRlci5cbiAgICogU2luY2Ugd2Vid29ya2VycyBhcmVuJ3Qgd2lkZWx5IHVzZWQsIHdlIHdpbGwgbGlmdCBpdCBvbmNlIFJvdXRlclNjcm9sbGVyIGlzXG4gICAqIGJhdHRsZS10ZXN0ZWQuXG4gICAqL1xuICBwcml2YXRlIHN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICEhdGhpcy53aW5kb3cgJiYgISF0aGlzLndpbmRvdy5zY3JvbGxUbztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGVtcHR5IGltcGxlbWVudGF0aW9uIG9mIHRoZSB2aWV3cG9ydCBzY3JvbGxlci4gVGhpcyB3aWxsXG4gKiBsaXZlIGluIEBhbmd1bGFyL2NvbW1vbiBhcyBpdCB3aWxsIGJlIHVzZWQgYnkgYm90aCBwbGF0Zm9ybS1zZXJ2ZXIgYW5kIHBsYXRmb3JtLXdlYndvcmtlci5cbiAqL1xuZXhwb3J0IGNsYXNzIE51bGxWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICByZXR1cm4gWzAsIDBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQge31cbn1cbiJdfQ==