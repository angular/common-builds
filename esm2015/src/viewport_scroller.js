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
export class ViewportScroller {
}
// De-sugared tree-shakable injection
// See #23917
/** @nocollapse */
ViewportScroller.ngInjectableDef = defineInjectable({ providedIn: 'root', factory: () => new BrowserViewportScroller(inject(DOCUMENT), window) });
/**
 * @whatItDoes Manages the scroll position.
 */
export class BrowserViewportScroller {
    constructor(document, window) {
        this.document = document;
        this.window = window;
        this.offset = () => [0, 0];
    }
    /**
     * @whatItDoes Configures the top offset used when scrolling to an anchor.
     *
     * * When given a number, the service will always use the number.
     * * When given a function, the service will invoke the function every time it restores scroll
     * position.
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
     * @whatItDoes Returns the current scroll position.
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
     * @whatItDoes Sets the scroll position.
     */
    scrollToPosition(position) {
        if (this.supportScrollRestoration()) {
            this.window.scrollTo(position[0], position[1]);
        }
    }
    /**
     * @whatItDoes Scrolls to the provided anchor.
     */
    scrollToAnchor(anchor) {
        if (this.supportScrollRestoration()) {
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
    }
    /**
     * @whatItDoes Disables automatic scroll restoration provided by the browser.
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
        catch (e) {
            return false;
        }
    }
}
/**
 * @whatItDoes Provides an empty implementation of the viewport scroller. This will
 * live in @angular/common as it will be used by both platform-server and platform-webworker.
 */
export class NullViewportScroller {
    /**
     * @whatItDoes empty implementation
     */
    setOffset(offset) { }
    /**
     * @whatItDoes empty implementation
     */
    getScrollPosition() { return [0, 0]; }
    /**
     * @whatItDoes empty implementation
     */
    scrollToPosition(position) { }
    /**
     * @whatItDoes empty implementation
     */
    scrollToAnchor(anchor) { }
    /**
     * @whatItDoes empty implementation
     */
    setHistoryScrollRestoration(scrollRestoration) { }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUV0Qzs7R0FFRztBQUNILE1BQU0sT0FBZ0IsZ0JBQWdCOztBQUNwQyxxQ0FBcUM7QUFDckMsYUFBYTtBQUNiLGtCQUFrQjtBQUNYLGdDQUFlLEdBQUcsZ0JBQWdCLENBQ3JDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBa0NsRzs7R0FFRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFHbEMsWUFBb0IsUUFBYSxFQUFVLE1BQVc7UUFBbEMsYUFBUSxHQUFSLFFBQVEsQ0FBSztRQUFVLFdBQU0sR0FBTixNQUFNLENBQUs7UUFGOUMsV0FBTSxHQUEyQixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVHLENBQUM7SUFFMUQ7Ozs7OztPQU1HO0lBQ0gsU0FBUyxDQUFDLE1BQWlEO1FBQ3pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUM1QjthQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxpQkFBaUI7UUFDZixJQUFJLElBQUks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QTJCLENBQUMsaUJBQWtDLElBQVMsQ0FBQztDQUN6RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtkZWZpbmVJbmplY3RhYmxlLCBpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuXG4vKipcbiAqIEB3aGF0SXREb2VzIE1hbmFnZXMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvLyBEZS1zdWdhcmVkIHRyZWUtc2hha2FibGUgaW5qZWN0aW9uXG4gIC8vIFNlZSAjMjM5MTdcbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyBuZ0luamVjdGFibGVEZWYgPSBkZWZpbmVJbmplY3RhYmxlKFxuICAgICAge3Byb3ZpZGVkSW46ICdyb290JywgZmFjdG9yeTogKCkgPT4gbmV3IEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyKGluamVjdChET0NVTUVOVCksIHdpbmRvdyl9KTtcblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgQ29uZmlndXJlcyB0aGUgdG9wIG9mZnNldCB1c2VkIHdoZW4gc2Nyb2xsaW5nIHRvIGFuIGFuY2hvci5cbiAgICpcbiAgICogV2hlbiBnaXZlbiBhIHR1cGxlIHdpdGggdHdvIG51bWJlciwgdGhlIHNlcnZpY2Ugd2lsbCBhbHdheXMgdXNlIHRoZSBudW1iZXJzLlxuICAgKiBXaGVuIGdpdmVuIGEgZnVuY3Rpb24sIHRoZSBzZXJ2aWNlIHdpbGwgaW52b2tlIHRoZSBmdW5jdGlvbiBldmVyeSB0aW1lIGl0IHJlc3RvcmVzIHNjcm9sbFxuICAgKiBwb3NpdGlvbi5cbiAgICovXG4gIGFic3RyYWN0IHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZDtcblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgUmV0dXJucyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqL1xuICBhYnN0cmFjdCBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdO1xuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBTZXRzIHRoZSBzY3JvbGwgcG9zaXRpb24uXG4gICAqL1xuICBhYnN0cmFjdCBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZDtcblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgU2Nyb2xscyB0byB0aGUgcHJvdmlkZWQgYW5jaG9yLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKiBTZWUgYWxzbyBbd2luZG93Lmhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb25cbiAgICogaW5mb10oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL3VwZGF0ZXMvMjAxNS8wOS9oaXN0b3J5LWFwaS1zY3JvbGwtcmVzdG9yYXRpb24pXG4gICAqL1xuICBhYnN0cmFjdCBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQ7XG59XG5cbi8qKlxuICogQHdoYXRJdERvZXMgTWFuYWdlcyB0aGUgc2Nyb2xsIHBvc2l0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQnJvd3NlclZpZXdwb3J0U2Nyb2xsZXIgaW1wbGVtZW50cyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgcHJpdmF0ZSBvZmZzZXQ6ICgpID0+IFtudW1iZXIsIG51bWJlcl0gPSAoKSA9PiBbMCwgMF07XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkb2N1bWVudDogYW55LCBwcml2YXRlIHdpbmRvdzogYW55KSB7fVxuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKlxuICAgKiAqIFdoZW4gZ2l2ZW4gYSBudW1iZXIsIHRoZSBzZXJ2aWNlIHdpbGwgYWx3YXlzIHVzZSB0aGUgbnVtYmVyLlxuICAgKiAqIFdoZW4gZ2l2ZW4gYSBmdW5jdGlvbiwgdGhlIHNlcnZpY2Ugd2lsbCBpbnZva2UgdGhlIGZ1bmN0aW9uIGV2ZXJ5IHRpbWUgaXQgcmVzdG9yZXMgc2Nyb2xsXG4gICAqIHBvc2l0aW9uLlxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvZmZzZXQpKSB7XG4gICAgICB0aGlzLm9mZnNldCA9ICgpID0+IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIFJldHVybnMgdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uLlxuICAgKi9cbiAgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydFNjcm9sbFJlc3RvcmF0aW9uKCkpIHtcbiAgICAgIHJldHVybiBbdGhpcy53aW5kb3cuc2Nyb2xsWCwgdGhpcy53aW5kb3cuc2Nyb2xsWV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIFNldHMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgU2Nyb2xscyB0byB0aGUgcHJvdmlkZWQgYW5jaG9yLlxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgY29uc3QgZWxTZWxlY3RlZEJ5SWQgPSB0aGlzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2FuY2hvcn1gKTtcbiAgICAgIGlmIChlbFNlbGVjdGVkQnlJZCkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvRWxlbWVudChlbFNlbGVjdGVkQnlJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVsU2VsZWN0ZWRCeU5hbWUgPSB0aGlzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtuYW1lPScke2FuY2hvcn0nXWApO1xuICAgICAgaWYgKGVsU2VsZWN0ZWRCeU5hbWUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxTZWxlY3RlZEJ5TmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgRGlzYWJsZXMgYXV0b21hdGljIHNjcm9sbCByZXN0b3JhdGlvbiBwcm92aWRlZCBieSB0aGUgYnJvd3Nlci5cbiAgICovXG4gIHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydFNjcm9sbFJlc3RvcmF0aW9uKCkpIHtcbiAgICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLndpbmRvdy5oaXN0b3J5O1xuICAgICAgaWYgKGhpc3RvcnkgJiYgaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbikge1xuICAgICAgICBoaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uID0gc2Nyb2xsUmVzdG9yYXRpb247XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY3JvbGxUb0VsZW1lbnQoZWw6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBsZWZ0ID0gcmVjdC5sZWZ0ICsgdGhpcy53aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgY29uc3QgdG9wID0gcmVjdC50b3AgKyB0aGlzLndpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldCgpO1xuICAgIHRoaXMud2luZG93LnNjcm9sbFRvKGxlZnQgLSBvZmZzZXRbMF0sIHRvcCAtIG9mZnNldFsxXSk7XG4gIH1cblxuICAvKipcbiAgICogV2Ugb25seSBzdXBwb3J0IHNjcm9sbCByZXN0b3JhdGlvbiB3aGVuIHdlIGNhbiBnZXQgYSBob2xkIG9mIHdpbmRvdy5cbiAgICogVGhpcyBtZWFucyB0aGF0IHdlIGRvIG5vdCBzdXBwb3J0IHRoaXMgYmVoYXZpb3Igd2hlbiBydW5uaW5nIGluIGEgd2ViIHdvcmtlci5cbiAgICpcbiAgICogTGlmdGluZyB0aGlzIHJlc3RyaWN0aW9uIHJpZ2h0IG5vdyB3b3VsZCByZXF1aXJlIG1vcmUgY2hhbmdlcyBpbiB0aGUgZG9tIGFkYXB0ZXIuXG4gICAqIFNpbmNlIHdlYndvcmtlcnMgYXJlbid0IHdpZGVseSB1c2VkLCB3ZSB3aWxsIGxpZnQgaXQgb25jZSBSb3V0ZXJTY3JvbGxlciBpc1xuICAgKiBiYXR0bGUtdGVzdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBzdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAhIXRoaXMud2luZG93ICYmICEhdGhpcy53aW5kb3cuc2Nyb2xsVG87XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5cbi8qKlxuICogQHdoYXRJdERvZXMgUHJvdmlkZXMgYW4gZW1wdHkgaW1wbGVtZW50YXRpb24gb2YgdGhlIHZpZXdwb3J0IHNjcm9sbGVyLiBUaGlzIHdpbGxcbiAqIGxpdmUgaW4gQGFuZ3VsYXIvY29tbW9uIGFzIGl0IHdpbGwgYmUgdXNlZCBieSBib3RoIHBsYXRmb3JtLXNlcnZlciBhbmQgcGxhdGZvcm0td2Vid29ya2VyLlxuICovXG5leHBvcnQgY2xhc3MgTnVsbFZpZXdwb3J0U2Nyb2xsZXIgaW1wbGVtZW50cyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIGVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge31cblxuICAvKipcbiAgICogQHdoYXRJdERvZXMgZW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0geyByZXR1cm4gWzAsIDBdOyB9XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIGVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBAd2hhdEl0RG9lcyBlbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEB3aGF0SXREb2VzIGVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQge31cbn0iXX0=