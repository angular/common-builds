/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
export declare abstract class ViewportScroller {
    /** @nocollapse */
    static ɵprov: never;
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @param offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     */
    abstract setOffset(offset: [number, number] | (() => [number, number])): void;
    /**
     * Retrieves the current scroll position.
     * @returns A position in screen coordinates (a tuple with x and y values).
     */
    abstract getScrollPosition(): [number, number];
    /**
     * Scrolls to a specified position.
     * @param position A position in screen coordinates (a tuple with x and y values).
     */
    abstract scrollToPosition(position: [number, number]): void;
    /**
     * Scrolls to an anchor element.
     * @param anchor The ID of the anchor element.
     */
    abstract scrollToAnchor(anchor: string): void;
    /**
     * Disables automatic scroll restoration provided by the browser.
     * See also [window.history.scrollRestoration
     * info](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration).
     */
    abstract setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void;
}
/**
 * Manages the scroll position for a browser window.
 */
export declare class BrowserViewportScroller implements ViewportScroller {
    private document;
    private window;
    private offset;
    constructor(document: Document, window: Window);
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @param offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     */
    setOffset(offset: [number, number] | (() => [number, number])): void;
    /**
     * Retrieves the current scroll position.
     * @returns The position in screen coordinates.
     */
    getScrollPosition(): [number, number];
    /**
     * Sets the scroll position.
     * @param position The new position in screen coordinates.
     */
    scrollToPosition(position: [number, number]): void;
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
    scrollToAnchor(target: string): void;
    /**
     * Disables automatic scroll restoration provided by the browser.
     */
    setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void;
    /**
     * Scrolls to an element using the native offset and the specified offset set on this scroller.
     *
     * The offset can be used when we know that there is a floating header and scrolling naively to an
     * element (ex: `scrollIntoView`) leaves the element hidden behind the floating header.
     */
    private scrollToElement;
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
    private attemptFocus;
    /**
     * We only support scroll restoration when we can get a hold of window.
     * This means that we do not support this behavior when running in a web worker.
     *
     * Lifting this restriction right now would require more changes in the dom adapter.
     * Since webworkers aren't widely used, we will lift it once RouterScroller is
     * battle-tested.
     */
    private supportScrollRestoration;
    private supportsScrolling;
}
/**
 * Provides an empty implementation of the viewport scroller.
 */
export declare class NullViewportScroller implements ViewportScroller {
    /**
     * Empty implementation
     */
    setOffset(offset: [number, number] | (() => [number, number])): void;
    /**
     * Empty implementation
     */
    getScrollPosition(): [number, number];
    /**
     * Empty implementation
     */
    scrollToPosition(position: [number, number]): void;
    /**
     * Empty implementation
     */
    scrollToAnchor(anchor: string): void;
    /**
     * Empty implementation
     */
    setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void;
}
