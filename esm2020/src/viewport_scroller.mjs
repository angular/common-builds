/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵɵdefineInjectable, ɵɵinject } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
class ViewportScroller {
}
// De-sugared tree-shakable injection
// See #23917
/** @nocollapse */
ViewportScroller.ɵprov = ɵɵdefineInjectable({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window)
});
export { ViewportScroller };
/**
 * Manages the scroll position for a browser window.
 */
export class BrowserViewportScroller {
    constructor(document, window) {
        this.document = document;
        this.window = window;
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
        if (this.supportsScrolling()) {
            return [this.window.pageXOffset, this.window.pageYOffset];
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
        if (this.supportsScrolling()) {
            this.window.scrollTo(position[0], position[1]);
        }
    }
    /**
     * Scrolls to an element and attempts to focus the element.
     *
     * Note that the function name here is misleading in that the target string may be an ID for a
     * non-anchor element.
     *
     * @param target The ID of an element or name of the anchor.
     *
     * @see https://html.spec.whatwg.org/#the-indicated-part-of-the-document
     * @see https://html.spec.whatwg.org/#scroll-to-fragid
     */
    scrollToAnchor(target) {
        if (!this.supportsScrolling()) {
            return;
        }
        const elSelected = findAnchorFromDocument(this.document, target);
        if (elSelected) {
            this.scrollToElement(elSelected);
            // After scrolling to the element, the spec dictates that we follow the focus steps for the
            // target. Rather than following the robust steps, simply attempt focus.
            //
            // @see https://html.spec.whatwg.org/#get-the-focusable-area
            // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus
            // @see https://html.spec.whatwg.org/#focusable-area
            elSelected.focus();
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
    /**
     * Scrolls to an element using the native offset and the specified offset set on this scroller.
     *
     * The offset can be used when we know that there is a floating header and scrolling naively to an
     * element (ex: `scrollIntoView`) leaves the element hidden behind the floating header.
     */
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
            if (!this.supportsScrolling()) {
                return false;
            }
            // The `scrollRestoration` property could be on the `history` instance or its prototype.
            const scrollRestorationDescriptor = getScrollRestorationProperty(this.window.history) ||
                getScrollRestorationProperty(Object.getPrototypeOf(this.window.history));
            // We can write to the `scrollRestoration` property if it is a writable data field or it has a
            // setter function.
            return !!scrollRestorationDescriptor &&
                !!(scrollRestorationDescriptor.writable || scrollRestorationDescriptor.set);
        }
        catch {
            return false;
        }
    }
    supportsScrolling() {
        try {
            return !!this.window && !!this.window.scrollTo && 'pageXOffset' in this.window;
        }
        catch {
            return false;
        }
    }
}
function getScrollRestorationProperty(obj) {
    return Object.getOwnPropertyDescriptor(obj, 'scrollRestoration');
}
function findAnchorFromDocument(document, target) {
    const documentResult = document.getElementById(target) || document.getElementsByName(target)[0];
    if (documentResult) {
        return documentResult;
    }
    // `getElementById` and `getElementsByName` won't pierce through the shadow DOM so we
    // have to traverse the DOM manually and do the lookup through the shadow roots.
    if (typeof document.createTreeWalker === 'function' && document.body &&
        (document.body.createShadowRoot ||
            typeof document.body.attachShadow === 'function')) {
        const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let currentNode = treeWalker.currentNode;
        while (currentNode) {
            const shadowRoot = currentNode.shadowRoot;
            if (shadowRoot) {
                // Note that `ShadowRoot` doesn't support `getElementsByName`
                // so we have to fall back to `querySelector`.
                const result = shadowRoot.getElementById(target) || shadowRoot.querySelector(`[name="${target}"]`);
                if (result) {
                    return result;
                }
            }
            currentNode = treeWalker.nextNode();
        }
    }
    return null;
}
/**
 * Provides an empty implementation of the viewport scroller.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0QsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUl0Qzs7OztHQUlHO0FBQ0gsTUFBc0IsZ0JBQWdCOztBQUNwQyxxQ0FBcUM7QUFDckMsYUFBYTtBQUNiLGtCQUFrQjtBQUNYLHNCQUFLLEdBQTZCLGtCQUFrQixDQUFDO0lBQzFELEtBQUssRUFBRSxnQkFBZ0I7SUFDdkIsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQztDQUN2RSxDQUFDLENBQUM7U0FSaUIsZ0JBQWdCO0FBNEN0Qzs7R0FFRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFHbEMsWUFBb0IsUUFBa0IsRUFBVSxNQUFjO1FBQTFDLGFBQVEsR0FBUixRQUFRLENBQVU7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRnRELFdBQU0sR0FBMkIsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFVyxDQUFDO0lBRWxFOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLE1BQWlEO1FBQ3pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUM1QjthQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lB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QUM5QyxNQUFNLE1BQU0sR0FDUixVQUFVLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUN4RixJQUFJLE1BQU0sRUFBRTtvQkFDVixPQUFPLE1BQU0sQ0FBQztpQkFDZjthQUNGO1lBRUQsV0FBVyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQXdCLENBQUM7U0FDM0Q7S0FDRjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQjs7T0FFRztJQUNILFNBQVMsQ0FBQyxNQUFpRCxJQUFTLENBQUM7SUFFckU7O09BRUc7SUFDSCxpQkFBaUI7UUFDZixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQixDQUFDLFFBQTBCLElBQVMsQ0FBQztJQUVyRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxNQUFjLElBQVMsQ0FBQztJQUV2Qzs7T0FFRztJQUNILDJCQUEyQixDQUFDLGlCQUFrQyxJQUFTLENBQUM7Q0FDekUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtcm1ZGVmaW5lSW5qZWN0YWJsZSwgybXJtWluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4vZG9tX3Rva2Vucyc7XG5cblxuXG4vKipcbiAqIERlZmluZXMgYSBzY3JvbGwgcG9zaXRpb24gbWFuYWdlci4gSW1wbGVtZW50ZWQgYnkgYEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgLy8gRGUtc3VnYXJlZCB0cmVlLXNoYWthYmxlIGluamVjdGlvblxuICAvLyBTZWUgIzIzOTE3XG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IFZpZXdwb3J0U2Nyb2xsZXIsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBCcm93c2VyVmlld3BvcnRTY3JvbGxlcijJtcm1aW5qZWN0KERPQ1VNRU5UKSwgd2luZG93KVxuICB9KTtcblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgdG9wIG9mZnNldCB1c2VkIHdoZW4gc2Nyb2xsaW5nIHRvIGFuIGFuY2hvci5cbiAgICogQHBhcmFtIG9mZnNldCBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKVxuICAgKiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdG9wIG9mZnNldCBwb3NpdGlvbi5cbiAgICpcbiAgICovXG4gIGFic3RyYWN0IHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHJldHVybnMgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcykuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdO1xuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGEgc3BlY2lmaWVkIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gcG9zaXRpb24gQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcykuXG4gICAqL1xuICBhYnN0cmFjdCBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZDtcblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBhbmNob3IgZWxlbWVudC5cbiAgICogQHBhcmFtIGFuY2hvciBUaGUgSUQgb2YgdGhlIGFuY2hvciBlbGVtZW50LlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKiBTZWUgYWxzbyBbd2luZG93Lmhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb25cbiAgICogaW5mb10oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL3VwZGF0ZXMvMjAxNS8wOS9oaXN0b3J5LWFwaS1zY3JvbGwtcmVzdG9yYXRpb24pLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkO1xufVxuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHNjcm9sbCBwb3NpdGlvbiBmb3IgYSBicm93c2VyIHdpbmRvdy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIHByaXZhdGUgb2Zmc2V0OiAoKSA9PiBbbnVtYmVyLCBudW1iZXJdID0gKCkgPT4gWzAsIDBdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZG9jdW1lbnQ6IERvY3VtZW50LCBwcml2YXRlIHdpbmRvdzogV2luZG93KSB7fVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpXG4gICAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB0b3Agb2Zmc2V0IHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvZmZzZXQpKSB7XG4gICAgICB0aGlzLm9mZnNldCA9ICgpID0+IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0c1Njcm9sbGluZygpKSB7XG4gICAgICByZXR1cm4gW3RoaXMud2luZG93LnBhZ2VYT2Zmc2V0LCB0aGlzLndpbmRvdy5wYWdlWU9mZnNldF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIFRoZSBuZXcgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgIHRoaXMud2luZG93LnNjcm9sbFRvKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gZWxlbWVudCBhbmQgYXR0ZW1wdHMgdG8gZm9jdXMgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGUgZnVuY3Rpb24gbmFtZSBoZXJlIGlzIG1pc2xlYWRpbmcgaW4gdGhhdCB0aGUgdGFyZ2V0IHN0cmluZyBtYXkgYmUgYW4gSUQgZm9yIGFcbiAgICogbm9uLWFuY2hvciBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBJRCBvZiBhbiBlbGVtZW50IG9yIG5hbWUgb2YgdGhlIGFuY2hvci5cbiAgICpcbiAgICogQHNlZSBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnLyN0aGUtaW5kaWNhdGVkLXBhcnQtb2YtdGhlLWRvY3VtZW50XG4gICAqIEBzZWUgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jc2Nyb2xsLXRvLWZyYWdpZFxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IodGFyZ2V0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc3VwcG9ydHNTY3JvbGxpbmcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVsU2VsZWN0ZWQgPSBmaW5kQW5jaG9yRnJvbURvY3VtZW50KHRoaXMuZG9jdW1lbnQsIHRhcmdldCk7XG5cbiAgICBpZiAoZWxTZWxlY3RlZCkge1xuICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxTZWxlY3RlZCk7XG4gICAgICAvLyBBZnRlciBzY3JvbGxpbmcgdG8gdGhlIGVsZW1lbnQsIHRoZSBzcGVjIGRpY3RhdGVzIHRoYXQgd2UgZm9sbG93IHRoZSBmb2N1cyBzdGVwcyBmb3IgdGhlXG4gICAgICAvLyB0YXJnZXQuIFJhdGhlciB0aGFuIGZvbGxvd2luZyB0aGUgcm9idXN0IHN0ZXBzLCBzaW1wbHkgYXR0ZW1wdCBmb2N1cy5cbiAgICAgIC8vXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2dldC10aGUtZm9jdXNhYmxlLWFyZWFcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxPckZvcmVpZ25FbGVtZW50L2ZvY3VzXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2ZvY3VzYWJsZS1hcmVhXG4gICAgICBlbFNlbGVjdGVkLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzY3JvbGwgcmVzdG9yYXRpb24gcHJvdmlkZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAqL1xuICBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpKSB7XG4gICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy53aW5kb3cuaGlzdG9yeTtcbiAgICAgIGlmIChoaXN0b3J5ICYmIGhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24pIHtcbiAgICAgICAgaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbiA9IHNjcm9sbFJlc3RvcmF0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGFuIGVsZW1lbnQgdXNpbmcgdGhlIG5hdGl2ZSBvZmZzZXQgYW5kIHRoZSBzcGVjaWZpZWQgb2Zmc2V0IHNldCBvbiB0aGlzIHNjcm9sbGVyLlxuICAgKlxuICAgKiBUaGUgb2Zmc2V0IGNhbiBiZSB1c2VkIHdoZW4gd2Uga25vdyB0aGF0IHRoZXJlIGlzIGEgZmxvYXRpbmcgaGVhZGVyIGFuZCBzY3JvbGxpbmcgbmFpdmVseSB0byBhblxuICAgKiBlbGVtZW50IChleDogYHNjcm9sbEludG9WaWV3YCkgbGVhdmVzIHRoZSBlbGVtZW50IGhpZGRlbiBiZWhpbmQgdGhlIGZsb2F0aW5nIGhlYWRlci5cbiAgICovXG4gIHByaXZhdGUgc2Nyb2xsVG9FbGVtZW50KGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBsZWZ0ID0gcmVjdC5sZWZ0ICsgdGhpcy53aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgY29uc3QgdG9wID0gcmVjdC50b3AgKyB0aGlzLndpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldCgpO1xuICAgIHRoaXMud2luZG93LnNjcm9sbFRvKGxlZnQgLSBvZmZzZXRbMF0sIHRvcCAtIG9mZnNldFsxXSk7XG4gIH1cblxuICAvKipcbiAgICogV2Ugb25seSBzdXBwb3J0IHNjcm9sbCByZXN0b3JhdGlvbiB3aGVuIHdlIGNhbiBnZXQgYSBob2xkIG9mIHdpbmRvdy5cbiAgICogVGhpcyBtZWFucyB0aGF0IHdlIGRvIG5vdCBzdXBwb3J0IHRoaXMgYmVoYXZpb3Igd2hlbiBydW5uaW5nIGluIGEgd2ViIHdvcmtlci5cbiAgICpcbiAgICogTGlmdGluZyB0aGlzIHJlc3RyaWN0aW9uIHJpZ2h0IG5vdyB3b3VsZCByZXF1aXJlIG1vcmUgY2hhbmdlcyBpbiB0aGUgZG9tIGFkYXB0ZXIuXG4gICAqIFNpbmNlIHdlYndvcmtlcnMgYXJlbid0IHdpZGVseSB1c2VkLCB3ZSB3aWxsIGxpZnQgaXQgb25jZSBSb3V0ZXJTY3JvbGxlciBpc1xuICAgKiBiYXR0bGUtdGVzdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBzdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0c1Njcm9sbGluZygpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIFRoZSBgc2Nyb2xsUmVzdG9yYXRpb25gIHByb3BlcnR5IGNvdWxkIGJlIG9uIHRoZSBgaGlzdG9yeWAgaW5zdGFuY2Ugb3IgaXRzIHByb3RvdHlwZS5cbiAgICAgIGNvbnN0IHNjcm9sbFJlc3RvcmF0aW9uRGVzY3JpcHRvciA9IGdldFNjcm9sbFJlc3RvcmF0aW9uUHJvcGVydHkodGhpcy53aW5kb3cuaGlzdG9yeSkgfHxcbiAgICAgICAgICBnZXRTY3JvbGxSZXN0b3JhdGlvblByb3BlcnR5KE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzLndpbmRvdy5oaXN0b3J5KSk7XG4gICAgICAvLyBXZSBjYW4gd3JpdGUgdG8gdGhlIGBzY3JvbGxSZXN0b3JhdGlvbmAgcHJvcGVydHkgaWYgaXQgaXMgYSB3cml0YWJsZSBkYXRhIGZpZWxkIG9yIGl0IGhhcyBhXG4gICAgICAvLyBzZXR0ZXIgZnVuY3Rpb24uXG4gICAgICByZXR1cm4gISFzY3JvbGxSZXN0b3JhdGlvbkRlc2NyaXB0b3IgJiZcbiAgICAgICAgICAhIShzY3JvbGxSZXN0b3JhdGlvbkRlc2NyaXB0b3Iud3JpdGFibGUgfHwgc2Nyb2xsUmVzdG9yYXRpb25EZXNjcmlwdG9yLnNldCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdXBwb3J0c1Njcm9sbGluZygpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICEhdGhpcy53aW5kb3cgJiYgISF0aGlzLndpbmRvdy5zY3JvbGxUbyAmJiAncGFnZVhPZmZzZXQnIGluIHRoaXMud2luZG93O1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTY3JvbGxSZXN0b3JhdGlvblByb3BlcnR5KG9iajogYW55KTogUHJvcGVydHlEZXNjcmlwdG9yfHVuZGVmaW5lZCB7XG4gIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgJ3Njcm9sbFJlc3RvcmF0aW9uJyk7XG59XG5cbmZ1bmN0aW9uIGZpbmRBbmNob3JGcm9tRG9jdW1lbnQoZG9jdW1lbnQ6IERvY3VtZW50LCB0YXJnZXQ6IHN0cmluZyk6IEhUTUxFbGVtZW50fG51bGwge1xuICBjb25zdCBkb2N1bWVudFJlc3VsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldCkgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUodGFyZ2V0KVswXTtcblxuICBpZiAoZG9jdW1lbnRSZXN1bHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRSZXN1bHQ7XG4gIH1cblxuICAvLyBgZ2V0RWxlbWVudEJ5SWRgIGFuZCBgZ2V0RWxlbWVudHNCeU5hbWVgIHdvbid0IHBpZXJjZSB0aHJvdWdoIHRoZSBzaGFkb3cgRE9NIHNvIHdlXG4gIC8vIGhhdmUgdG8gdHJhdmVyc2UgdGhlIERPTSBtYW51YWxseSBhbmQgZG8gdGhlIGxvb2t1cCB0aHJvdWdoIHRoZSBzaGFkb3cgcm9vdHMuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlciA9PT0gJ2Z1bmN0aW9uJyAmJiBkb2N1bWVudC5ib2R5ICYmXG4gICAgICAoKGRvY3VtZW50LmJvZHkgYXMgYW55KS5jcmVhdGVTaGFkb3dSb290IHx8XG4gICAgICAgdHlwZW9mIGRvY3VtZW50LmJvZHkuYXR0YWNoU2hhZG93ID09PSAnZnVuY3Rpb24nKSkge1xuICAgIGNvbnN0IHRyZWVXYWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGRvY3VtZW50LmJvZHksIE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UKTtcbiAgICBsZXQgY3VycmVudE5vZGUgPSB0cmVlV2Fsa2VyLmN1cnJlbnROb2RlIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcblxuICAgIHdoaWxlIChjdXJyZW50Tm9kZSkge1xuICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IGN1cnJlbnROb2RlLnNoYWRvd1Jvb3Q7XG5cbiAgICAgIGlmIChzaGFkb3dSb290KSB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCBgU2hhZG93Um9vdGAgZG9lc24ndCBzdXBwb3J0IGBnZXRFbGVtZW50c0J5TmFtZWBcbiAgICAgICAgLy8gc28gd2UgaGF2ZSB0byBmYWxsIGJhY2sgdG8gYHF1ZXJ5U2VsZWN0b3JgLlxuICAgICAgICBjb25zdCByZXN1bHQgPVxuICAgICAgICAgICAgc2hhZG93Um9vdC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpIHx8IHNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihgW25hbWU9XCIke3RhcmdldH1cIl1gKTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY3VycmVudE5vZGUgPSB0cmVlV2Fsa2VyLm5leHROb2RlKCkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGVtcHR5IGltcGxlbWVudGF0aW9uIG9mIHRoZSB2aWV3cG9ydCBzY3JvbGxlci5cbiAqL1xuZXhwb3J0IGNsYXNzIE51bGxWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICByZXR1cm4gWzAsIDBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQge31cbn1cbiJdfQ==