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
}
// De-sugared tree-shakable injection
// See #23917
/** @nocollapse */
ViewportScroller.ɵprov = ɵɵdefineInjectable({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window)
});
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
        var _a;
        if (!this.supportsScrolling()) {
            return;
        }
        // TODO(atscott): The correct behavior for `getElementsByName` would be to also verify that the
        // element is an anchor. However, this could be considered a breaking change and should be
        // done in a major version.
        const elSelected = (_a = this.document.getElementById(target)) !== null && _a !== void 0 ? _a : this.document.getElementsByName(target)[0];
        if (elSelected === undefined) {
            return;
        }
        this.scrollToElement(elSelected);
        // After scrolling to the element, the spec dictates that we follow the focus steps for the
        // target. Rather than following the robust steps, simply attempt focus.
        this.attemptFocus(elSelected);
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
     * Calls `focus` on the `focusTarget` and returns `true` if the element was focused successfully.
     *
     * If `false`, further steps may be necessary to determine a valid substitute to be focused
     * instead.
     *
     * @see https://html.spec.whatwg.org/#get-the-focusable-area
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus
     * @see https://html.spec.whatwg.org/#focusable-area
     */
    attemptFocus(focusTarget) {
        focusTarget.focus();
        return this.document.activeElement === focusTarget;
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
        catch (_a) {
            return false;
        }
    }
    supportsScrolling() {
        try {
            return !!this.window && !!this.window.scrollTo && 'pageXOffset' in this.window;
        }
        catch (_a) {
            return false;
        }
    }
}
function getScrollRestorationProperty(obj) {
    return Object.getOwnPropertyDescriptor(obj, 'scrollRestoration');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0QsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUl0Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixnQkFBZ0I7O0FBQ3BDLHFDQUFxQztBQUNyQyxhQUFhO0FBQ2Isa0JBQWtCO0FBQ1gsc0JBQUssR0FBNkIsa0JBQWtCLENBQUM7SUFDMUQsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDO0NBQ3ZFLENBQUMsQ0FBQztBQW9DTDs7R0FFRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUFHbEMsWUFBb0IsUUFBa0IsRUFBVSxNQUFjO1FBQTFDLGFBQVEsR0FBUixRQUFRLENBQVU7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRnRELFdBQU0sR0FBMkIsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFVyxDQUFDO0lBRWxFOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLE1BQWlEO1FBQ3pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUM1QjthQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsaUJBQWlCO1FBQ2YsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtZQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUMzRDthQUFNO1lBQ0wsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNmO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILGdCQUFnQixDQUFDLFFBQTBCO1FBQ3pDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxjQUFjLENBQUMsTUFBYzs7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQzdCLE9BQU87U0FDUjtRQUNELCtGQUErRjtRQUMvRiwwRkFBMEY7UUFDMUYsMkJBQTJCO1FBQzNCLE1BQU0sVUFBVSxTQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxtQ0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUM1QixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pDLDJGQUEyRjtRQUMzRix3RUFBd0U7UUFDeEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCwyQkFBMkIsQ0FBQyxpQkFBa0M7UUFDNUQsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBRTtZQUNuQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUNwQyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQzthQUMvQztTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssZUFBZSxDQUFDLEVBQWU7UUFDckMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQy9DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ssWUFBWSxDQUFDLFdBQXdCO1FBQzNDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxLQUFLLFdBQVcsQ0FBQztJQUNyRCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNLLHdCQUF3QjtRQUM5QixJQUFJO1lBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUM3QixPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0Qsd0ZBQXdGO1lBQ3hGLE1BQU0sMkJBQTJCLEdBQUcsNEJBQTRCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQ2pGLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzdFLDhGQUE4RjtZQUM5RixtQkFBbUI7WUFDbkIsT0FBTyxDQUFDLENBQUMsMkJBQTJCO2dCQUNoQyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLElBQUksMkJBQTJCLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDakY7UUFBQyxXQUFNO1lBQ04sT0FBTyxLQUFLLENBQUM7U0FDZDtJQUNILENBQUM7SUFFTyxpQkFBaUI7UUFDdkIsSUFBSTtZQUNGLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ2hGO1FBQUMsV0FBTTtZQUNOLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0NBQ0Y7QUFFRCxTQUFTLDRCQUE0QixDQUFDLEdBQVE7SUFDNUMsT0FBTyxNQUFNLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQjs7T0FFRztJQUNILFNBQVMsQ0FBQyxNQUFpRCxJQUFTLENBQUM7SUFFckU7O09BRUc7SUFDSCxpQkFBaUI7UUFDZixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQixDQUFDLFFBQTBCLElBQVMsQ0FBQztJQUVyRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxNQUFjLElBQVMsQ0FBQztJQUV2Qzs7T0FFRztJQUNILDJCQUEyQixDQUFDLGlCQUFrQyxJQUFTLENBQUM7Q0FDekUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtcm1ZGVmaW5lSW5qZWN0YWJsZSwgybXJtWluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4vZG9tX3Rva2Vucyc7XG5cblxuXG4vKipcbiAqIERlZmluZXMgYSBzY3JvbGwgcG9zaXRpb24gbWFuYWdlci4gSW1wbGVtZW50ZWQgYnkgYEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgLy8gRGUtc3VnYXJlZCB0cmVlLXNoYWthYmxlIGluamVjdGlvblxuICAvLyBTZWUgIzIzOTE3XG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgybVwcm92ID0gLyoqIEBwdXJlT3JCcmVha015Q29kZSAqLyDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IFZpZXdwb3J0U2Nyb2xsZXIsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBCcm93c2VyVmlld3BvcnRTY3JvbGxlcijJtcm1aW5qZWN0KERPQ1VNRU5UKSwgd2luZG93KVxuICB9KTtcblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgdG9wIG9mZnNldCB1c2VkIHdoZW4gc2Nyb2xsaW5nIHRvIGFuIGFuY2hvci5cbiAgICogQHBhcmFtIG9mZnNldCBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKVxuICAgKiBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdG9wIG9mZnNldCBwb3NpdGlvbi5cbiAgICpcbiAgICovXG4gIGFic3RyYWN0IHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHJldHVybnMgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcykuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdO1xuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGEgc3BlY2lmaWVkIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gcG9zaXRpb24gQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcykuXG4gICAqL1xuICBhYnN0cmFjdCBzY3JvbGxUb1Bvc2l0aW9uKHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogdm9pZDtcblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBhbmNob3IgZWxlbWVudC5cbiAgICogQHBhcmFtIGFuY2hvciBUaGUgSUQgb2YgdGhlIGFuY2hvciBlbGVtZW50LlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKiBTZWUgYWxzbyBbd2luZG93Lmhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb25cbiAgICogaW5mb10oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL3VwZGF0ZXMvMjAxNS8wOS9oaXN0b3J5LWFwaS1zY3JvbGwtcmVzdG9yYXRpb24pLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkO1xufVxuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHNjcm9sbCBwb3NpdGlvbiBmb3IgYSBicm93c2VyIHdpbmRvdy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyIGltcGxlbWVudHMgVmlld3BvcnRTY3JvbGxlciB7XG4gIHByaXZhdGUgb2Zmc2V0OiAoKSA9PiBbbnVtYmVyLCBudW1iZXJdID0gKCkgPT4gWzAsIDBdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZG9jdW1lbnQ6IERvY3VtZW50LCBwcml2YXRlIHdpbmRvdzogV2luZG93KSB7fVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpXG4gICAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB0b3Agb2Zmc2V0IHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvZmZzZXQpKSB7XG4gICAgICB0aGlzLm9mZnNldCA9ICgpID0+IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0c1Njcm9sbGluZygpKSB7XG4gICAgICByZXR1cm4gW3RoaXMud2luZG93LnBhZ2VYT2Zmc2V0LCB0aGlzLndpbmRvdy5wYWdlWU9mZnNldF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIFRoZSBuZXcgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgIHRoaXMud2luZG93LnNjcm9sbFRvKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gZWxlbWVudCBhbmQgYXR0ZW1wdHMgdG8gZm9jdXMgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGUgZnVuY3Rpb24gbmFtZSBoZXJlIGlzIG1pc2xlYWRpbmcgaW4gdGhhdCB0aGUgdGFyZ2V0IHN0cmluZyBtYXkgYmUgYW4gSUQgZm9yIGFcbiAgICogbm9uLWFuY2hvciBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBJRCBvZiBhbiBlbGVtZW50IG9yIG5hbWUgb2YgdGhlIGFuY2hvci5cbiAgICpcbiAgICogQHNlZSBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnLyN0aGUtaW5kaWNhdGVkLXBhcnQtb2YtdGhlLWRvY3VtZW50XG4gICAqIEBzZWUgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jc2Nyb2xsLXRvLWZyYWdpZFxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IodGFyZ2V0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc3VwcG9ydHNTY3JvbGxpbmcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPKGF0c2NvdHQpOiBUaGUgY29ycmVjdCBiZWhhdmlvciBmb3IgYGdldEVsZW1lbnRzQnlOYW1lYCB3b3VsZCBiZSB0byBhbHNvIHZlcmlmeSB0aGF0IHRoZVxuICAgIC8vIGVsZW1lbnQgaXMgYW4gYW5jaG9yLiBIb3dldmVyLCB0aGlzIGNvdWxkIGJlIGNvbnNpZGVyZWQgYSBicmVha2luZyBjaGFuZ2UgYW5kIHNob3VsZCBiZVxuICAgIC8vIGRvbmUgaW4gYSBtYWpvciB2ZXJzaW9uLlxuICAgIGNvbnN0IGVsU2VsZWN0ZWQ6IEhUTUxFbGVtZW50fHVuZGVmaW5lZCA9XG4gICAgICAgIHRoaXMuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0KSA/PyB0aGlzLmRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKHRhcmdldClbMF07XG4gICAgaWYgKGVsU2VsZWN0ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2Nyb2xsVG9FbGVtZW50KGVsU2VsZWN0ZWQpO1xuICAgIC8vIEFmdGVyIHNjcm9sbGluZyB0byB0aGUgZWxlbWVudCwgdGhlIHNwZWMgZGljdGF0ZXMgdGhhdCB3ZSBmb2xsb3cgdGhlIGZvY3VzIHN0ZXBzIGZvciB0aGVcbiAgICAvLyB0YXJnZXQuIFJhdGhlciB0aGFuIGZvbGxvd2luZyB0aGUgcm9idXN0IHN0ZXBzLCBzaW1wbHkgYXR0ZW1wdCBmb2N1cy5cbiAgICB0aGlzLmF0dGVtcHRGb2N1cyhlbFNlbGVjdGVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMud2luZG93Lmhpc3Rvcnk7XG4gICAgICBpZiAoaGlzdG9yeSAmJiBoaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uKSB7XG4gICAgICAgIGhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSBzY3JvbGxSZXN0b3JhdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBlbGVtZW50IHVzaW5nIHRoZSBuYXRpdmUgb2Zmc2V0IGFuZCB0aGUgc3BlY2lmaWVkIG9mZnNldCBzZXQgb24gdGhpcyBzY3JvbGxlci5cbiAgICpcbiAgICogVGhlIG9mZnNldCBjYW4gYmUgdXNlZCB3aGVuIHdlIGtub3cgdGhhdCB0aGVyZSBpcyBhIGZsb2F0aW5nIGhlYWRlciBhbmQgc2Nyb2xsaW5nIG5haXZlbHkgdG8gYW5cbiAgICogZWxlbWVudCAoZXg6IGBzY3JvbGxJbnRvVmlld2ApIGxlYXZlcyB0aGUgZWxlbWVudCBoaWRkZW4gYmVoaW5kIHRoZSBmbG9hdGluZyBoZWFkZXIuXG4gICAqL1xuICBwcml2YXRlIHNjcm9sbFRvRWxlbWVudChlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgbGVmdCA9IHJlY3QubGVmdCArIHRoaXMud2luZG93LnBhZ2VYT2Zmc2V0O1xuICAgIGNvbnN0IHRvcCA9IHJlY3QudG9wICsgdGhpcy53aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5vZmZzZXQoKTtcbiAgICB0aGlzLndpbmRvdy5zY3JvbGxUbyhsZWZ0IC0gb2Zmc2V0WzBdLCB0b3AgLSBvZmZzZXRbMV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGBmb2N1c2Agb24gdGhlIGBmb2N1c1RhcmdldGAgYW5kIHJldHVybnMgYHRydWVgIGlmIHRoZSBlbGVtZW50IHdhcyBmb2N1c2VkIHN1Y2Nlc3NmdWxseS5cbiAgICpcbiAgICogSWYgYGZhbHNlYCwgZnVydGhlciBzdGVwcyBtYXkgYmUgbmVjZXNzYXJ5IHRvIGRldGVybWluZSBhIHZhbGlkIHN1YnN0aXR1dGUgdG8gYmUgZm9jdXNlZFxuICAgKiBpbnN0ZWFkLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2dldC10aGUtZm9jdXNhYmxlLWFyZWFcbiAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSFRNTE9yRm9yZWlnbkVsZW1lbnQvZm9jdXNcbiAgICogQHNlZSBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnLyNmb2N1c2FibGUtYXJlYVxuICAgKi9cbiAgcHJpdmF0ZSBhdHRlbXB0Rm9jdXMoZm9jdXNUYXJnZXQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgZm9jdXNUYXJnZXQuZm9jdXMoKTtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBmb2N1c1RhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBvbmx5IHN1cHBvcnQgc2Nyb2xsIHJlc3RvcmF0aW9uIHdoZW4gd2UgY2FuIGdldCBhIGhvbGQgb2Ygd2luZG93LlxuICAgKiBUaGlzIG1lYW5zIHRoYXQgd2UgZG8gbm90IHN1cHBvcnQgdGhpcyBiZWhhdmlvciB3aGVuIHJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyLlxuICAgKlxuICAgKiBMaWZ0aW5nIHRoaXMgcmVzdHJpY3Rpb24gcmlnaHQgbm93IHdvdWxkIHJlcXVpcmUgbW9yZSBjaGFuZ2VzIGluIHRoZSBkb20gYWRhcHRlci5cbiAgICogU2luY2Ugd2Vid29ya2VycyBhcmVuJ3Qgd2lkZWx5IHVzZWQsIHdlIHdpbGwgbGlmdCBpdCBvbmNlIFJvdXRlclNjcm9sbGVyIGlzXG4gICAqIGJhdHRsZS10ZXN0ZWQuXG4gICAqL1xuICBwcml2YXRlIHN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCF0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gVGhlIGBzY3JvbGxSZXN0b3JhdGlvbmAgcHJvcGVydHkgY291bGQgYmUgb24gdGhlIGBoaXN0b3J5YCBpbnN0YW5jZSBvciBpdHMgcHJvdG90eXBlLlxuICAgICAgY29uc3Qgc2Nyb2xsUmVzdG9yYXRpb25EZXNjcmlwdG9yID0gZ2V0U2Nyb2xsUmVzdG9yYXRpb25Qcm9wZXJ0eSh0aGlzLndpbmRvdy5oaXN0b3J5KSB8fFxuICAgICAgICAgIGdldFNjcm9sbFJlc3RvcmF0aW9uUHJvcGVydHkoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMud2luZG93Lmhpc3RvcnkpKTtcbiAgICAgIC8vIFdlIGNhbiB3cml0ZSB0byB0aGUgYHNjcm9sbFJlc3RvcmF0aW9uYCBwcm9wZXJ0eSBpZiBpdCBpcyBhIHdyaXRhYmxlIGRhdGEgZmllbGQgb3IgaXQgaGFzIGFcbiAgICAgIC8vIHNldHRlciBmdW5jdGlvbi5cbiAgICAgIHJldHVybiAhIXNjcm9sbFJlc3RvcmF0aW9uRGVzY3JpcHRvciAmJlxuICAgICAgICAgICEhKHNjcm9sbFJlc3RvcmF0aW9uRGVzY3JpcHRvci53cml0YWJsZSB8fCBzY3JvbGxSZXN0b3JhdGlvbkRlc2NyaXB0b3Iuc2V0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN1cHBvcnRzU2Nyb2xsaW5nKCk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gISF0aGlzLndpbmRvdyAmJiAhIXRoaXMud2luZG93LnNjcm9sbFRvICYmICdwYWdlWE9mZnNldCcgaW4gdGhpcy53aW5kb3c7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbFJlc3RvcmF0aW9uUHJvcGVydHkob2JqOiBhbnkpOiBQcm9wZXJ0eURlc2NyaXB0b3J8dW5kZWZpbmVkIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCAnc2Nyb2xsUmVzdG9yYXRpb24nKTtcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBhbiBlbXB0eSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgdmlld3BvcnQgc2Nyb2xsZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBOdWxsVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgcmV0dXJuIFswLCAwXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHt9XG59XG4iXX0=