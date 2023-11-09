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
export class ViewportScroller {
    // De-sugared tree-shakable injection
    // See #23917
    /** @nocollapse */
    static { this.ɵprov = ɵɵdefineInjectable({
        token: ViewportScroller,
        providedIn: 'root',
        factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window)
    }); }
}
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
        if (this.supportsScrolling()) {
            this.window.history.scrollRestoration = scrollRestoration;
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
    supportsScrolling() {
        try {
            return !!this.window && !!this.window.scrollTo && 'pageXOffset' in this.window;
        }
        catch {
            return false;
        }
    }
}
function findAnchorFromDocument(document, target) {
    const documentResult = document.getElementById(target) || document.getElementsByName(target)[0];
    if (documentResult) {
        return documentResult;
    }
    // `getElementById` and `getElementsByName` won't pierce through the shadow DOM so we
    // have to traverse the DOM manually and do the lookup through the shadow roots.
    if (typeof document.createTreeWalker === 'function' && document.body &&
        typeof document.body.attachShadow === 'function') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0QsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUl0Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixnQkFBZ0I7SUFDcEMscUNBQXFDO0lBQ3JDLGFBQWE7SUFDYixrQkFBa0I7YUFDWCxVQUFLLEdBQTZCLGtCQUFrQixDQUFDO1FBQzFELEtBQUssRUFBRSxnQkFBZ0I7UUFDdkIsVUFBVSxFQUFFLE1BQU07UUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQztLQUN2RSxDQUFDLENBQUM7O0FBb0NMOztHQUVHO0FBQ0gsTUFBTSxPQUFPLHVCQUF1QjtJQUdsQyxZQUFvQixRQUFrQixFQUFVLE1BQWM7UUFBMUMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7UUFGdEQsV0FBTSxHQUEyQixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVXLENBQUM7SUFFbEU7Ozs7O09BS0c7SUFDSCxTQUFTLENBQUMsTUFBaUQ7UUFDekQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDN0IsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO0lB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Q0FDekUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtcm1ZGVmaW5lSW5qZWN0YWJsZSwgybXJtWluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4vZG9tX3Rva2Vucyc7XG5cblxuXG4vKipcbiAqIERlZmluZXMgYSBzY3JvbGwgcG9zaXRpb24gbWFuYWdlci4gSW1wbGVtZW50ZWQgYnkgYEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgLy8gRGUtc3VnYXJlZCB0cmVlLXNoYWthYmxlIGluamVjdGlvblxuICAvLyBTZWUgIzIzOTE3XG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IFZpZXdwb3J0U2Nyb2xsZXIsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBCcm93c2VyVmlld3BvcnRTY3JvbGxlcijJtcm1aW5qZWN0KERPQ1VNRU5UKSwgd2luZG93KVxuICB9KTtcblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgdG9wIG9mZnNldCB1c2VkIHdoZW4gc2Nyb2xsaW5nIHRvIGFuIGFuY2hvci5cbiAgICogQHBhcmFtIG9mZnNldCBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKVxuICAgKiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdG9wIG9mZnNldCBwb3NpdGlvbi5cbiAgICpcbiAgICovXG4gIGFic3RyYWN0IHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHJldHVybnMgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcykuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdO1xuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGEgc3BlY2lmaWVkIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gcG9zaXRpb24gQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcykuXG4gICAqL1xuICBhYnN0cmFjdCBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZDtcblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBhbmNob3IgZWxlbWVudC5cbiAgICogQHBhcmFtIGFuY2hvciBUaGUgSUQgb2YgdGhlIGFuY2hvciBlbGVtZW50LlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKiBTZWUgYWxzbyBbd2luZG93Lmhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb25cbiAgICogaW5mb10oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL3VwZGF0ZXMvMjAxNS8wOS9oaXN0b3J5LWFwaS1zY3JvbGwtcmVzdG9yYXRpb24pLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkO1xufVxuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHNjcm9sbCBwb3NpdGlvbiBmb3IgYSBicm93c2VyIHdpbmRvdy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIHByaXZhdGUgb2Zmc2V0OiAoKSA9PiBbbnVtYmVyLCBudW1iZXJdID0gKCkgPT4gWzAsIDBdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZG9jdW1lbnQ6IERvY3VtZW50LCBwcml2YXRlIHdpbmRvdzogV2luZG93KSB7fVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpXG4gICAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB0b3Agb2Zmc2V0IHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvZmZzZXQpKSB7XG4gICAgICB0aGlzLm9mZnNldCA9ICgpID0+IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0c1Njcm9sbGluZygpKSB7XG4gICAgICByZXR1cm4gW3RoaXMud2luZG93LnBhZ2VYT2Zmc2V0LCB0aGlzLndpbmRvdy5wYWdlWU9mZnNldF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIFRoZSBuZXcgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgIHRoaXMud2luZG93LnNjcm9sbFRvKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gZWxlbWVudCBhbmQgYXR0ZW1wdHMgdG8gZm9jdXMgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGUgZnVuY3Rpb24gbmFtZSBoZXJlIGlzIG1pc2xlYWRpbmcgaW4gdGhhdCB0aGUgdGFyZ2V0IHN0cmluZyBtYXkgYmUgYW4gSUQgZm9yIGFcbiAgICogbm9uLWFuY2hvciBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBJRCBvZiBhbiBlbGVtZW50IG9yIG5hbWUgb2YgdGhlIGFuY2hvci5cbiAgICpcbiAgICogQHNlZSBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnLyN0aGUtaW5kaWNhdGVkLXBhcnQtb2YtdGhlLWRvY3VtZW50XG4gICAqIEBzZWUgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jc2Nyb2xsLXRvLWZyYWdpZFxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IodGFyZ2V0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc3VwcG9ydHNTY3JvbGxpbmcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVsU2VsZWN0ZWQgPSBmaW5kQW5jaG9yRnJvbURvY3VtZW50KHRoaXMuZG9jdW1lbnQsIHRhcmdldCk7XG5cbiAgICBpZiAoZWxTZWxlY3RlZCkge1xuICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxTZWxlY3RlZCk7XG4gICAgICAvLyBBZnRlciBzY3JvbGxpbmcgdG8gdGhlIGVsZW1lbnQsIHRoZSBzcGVjIGRpY3RhdGVzIHRoYXQgd2UgZm9sbG93IHRoZSBmb2N1cyBzdGVwcyBmb3IgdGhlXG4gICAgICAvLyB0YXJnZXQuIFJhdGhlciB0aGFuIGZvbGxvd2luZyB0aGUgcm9idXN0IHN0ZXBzLCBzaW1wbHkgYXR0ZW1wdCBmb2N1cy5cbiAgICAgIC8vXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2dldC10aGUtZm9jdXNhYmxlLWFyZWFcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxPckZvcmVpZ25FbGVtZW50L2ZvY3VzXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2ZvY3VzYWJsZS1hcmVhXG4gICAgICBlbFNlbGVjdGVkLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzY3JvbGwgcmVzdG9yYXRpb24gcHJvdmlkZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAqL1xuICBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgIHRoaXMud2luZG93Lmhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSBzY3JvbGxSZXN0b3JhdGlvbjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBlbGVtZW50IHVzaW5nIHRoZSBuYXRpdmUgb2Zmc2V0IGFuZCB0aGUgc3BlY2lmaWVkIG9mZnNldCBzZXQgb24gdGhpcyBzY3JvbGxlci5cbiAgICpcbiAgICogVGhlIG9mZnNldCBjYW4gYmUgdXNlZCB3aGVuIHdlIGtub3cgdGhhdCB0aGVyZSBpcyBhIGZsb2F0aW5nIGhlYWRlciBhbmQgc2Nyb2xsaW5nIG5haXZlbHkgdG8gYW5cbiAgICogZWxlbWVudCAoZXg6IGBzY3JvbGxJbnRvVmlld2ApIGxlYXZlcyB0aGUgZWxlbWVudCBoaWRkZW4gYmVoaW5kIHRoZSBmbG9hdGluZyBoZWFkZXIuXG4gICAqL1xuICBwcml2YXRlIHNjcm9sbFRvRWxlbWVudChlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgbGVmdCA9IHJlY3QubGVmdCArIHRoaXMud2luZG93LnBhZ2VYT2Zmc2V0O1xuICAgIGNvbnN0IHRvcCA9IHJlY3QudG9wICsgdGhpcy53aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5vZmZzZXQoKTtcbiAgICB0aGlzLndpbmRvdy5zY3JvbGxUbyhsZWZ0IC0gb2Zmc2V0WzBdLCB0b3AgLSBvZmZzZXRbMV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzdXBwb3J0c1Njcm9sbGluZygpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICEhdGhpcy53aW5kb3cgJiYgISF0aGlzLndpbmRvdy5zY3JvbGxUbyAmJiAncGFnZVhPZmZzZXQnIGluIHRoaXMud2luZG93O1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kQW5jaG9yRnJvbURvY3VtZW50KGRvY3VtZW50OiBEb2N1bWVudCwgdGFyZ2V0OiBzdHJpbmcpOiBIVE1MRWxlbWVudHxudWxsIHtcbiAgY29uc3QgZG9jdW1lbnRSZXN1bHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKHRhcmdldClbMF07XG5cbiAgaWYgKGRvY3VtZW50UmVzdWx0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50UmVzdWx0O1xuICB9XG5cbiAgLy8gYGdldEVsZW1lbnRCeUlkYCBhbmQgYGdldEVsZW1lbnRzQnlOYW1lYCB3b24ndCBwaWVyY2UgdGhyb3VnaCB0aGUgc2hhZG93IERPTSBzbyB3ZVxuICAvLyBoYXZlIHRvIHRyYXZlcnNlIHRoZSBET00gbWFudWFsbHkgYW5kIGRvIHRoZSBsb29rdXAgdGhyb3VnaCB0aGUgc2hhZG93IHJvb3RzLlxuICBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuYm9keSAmJlxuICAgICAgdHlwZW9mIGRvY3VtZW50LmJvZHkuYXR0YWNoU2hhZG93ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgdHJlZVdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZG9jdW1lbnQuYm9keSwgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQpO1xuICAgIGxldCBjdXJyZW50Tm9kZSA9IHRyZWVXYWxrZXIuY3VycmVudE5vZGUgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gICAgd2hpbGUgKGN1cnJlbnROb2RlKSB7XG4gICAgICBjb25zdCBzaGFkb3dSb290ID0gY3VycmVudE5vZGUuc2hhZG93Um9vdDtcblxuICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgLy8gTm90ZSB0aGF0IGBTaGFkb3dSb290YCBkb2Vzbid0IHN1cHBvcnQgYGdldEVsZW1lbnRzQnlOYW1lYFxuICAgICAgICAvLyBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBgcXVlcnlTZWxlY3RvcmAuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9XG4gICAgICAgICAgICBzaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKHRhcmdldCkgfHwgc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKGBbbmFtZT1cIiR7dGFyZ2V0fVwiXWApO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjdXJyZW50Tm9kZSA9IHRyZWVXYWxrZXIubmV4dE5vZGUoKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gZW1wdHkgaW1wbGVtZW50YXRpb24gb2YgdGhlIHZpZXdwb3J0IHNjcm9sbGVyLlxuICovXG5leHBvcnQgY2xhc3MgTnVsbFZpZXdwb3J0U2Nyb2xsZXIgaW1wbGVtZW50cyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIHJldHVybiBbMCwgMF07XG4gIH1cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZCB7fVxufVxuIl19