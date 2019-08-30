/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @type {?} */
let _DOM = (/** @type {?} */ (null));
/**
 * @return {?}
 */
export function getDOM() {
    return _DOM;
}
/**
 * @param {?} adapter
 * @return {?}
 */
export function setDOM(adapter) {
    _DOM = adapter;
}
/**
 * @param {?} adapter
 * @return {?}
 */
export function setRootDomAdapter(adapter) {
    if (!_DOM) {
        _DOM = adapter;
    }
}
/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * \@security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 * @abstract
 */
export class DomAdapter {
}
if (false) {
    /**
     * @abstract
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    DomAdapter.prototype.getProperty = function (el, name) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} evt
     * @return {?}
     */
    DomAdapter.prototype.dispatchEvent = function (el, evt) { };
    /**
     * @abstract
     * @param {?} error
     * @return {?}
     */
    DomAdapter.prototype.log = function (error) { };
    /**
     * @abstract
     * @param {?} error
     * @return {?}
     */
    DomAdapter.prototype.logGroup = function (error) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.logGroupEnd = function () { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} selector
     * @return {?}
     */
    DomAdapter.prototype.querySelectorAll = function (el, selector) { };
    /**
     * @abstract
     * @param {?} el
     * @return {?}
     */
    DomAdapter.prototype.remove = function (el) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} attribute
     * @return {?}
     */
    DomAdapter.prototype.getAttribute = function (element, attribute) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    DomAdapter.prototype.setProperty = function (el, name, value) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} selector
     * @return {?}
     */
    DomAdapter.prototype.querySelector = function (el, selector) { };
    /**
     * @abstract
     * @param {?} el
     * @return {?}
     */
    DomAdapter.prototype.nextSibling = function (el) { };
    /**
     * @abstract
     * @param {?} el
     * @return {?}
     */
    DomAdapter.prototype.parentElement = function (el) { };
    /**
     * @abstract
     * @param {?} el
     * @return {?}
     */
    DomAdapter.prototype.clearNodes = function (el) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} node
     * @return {?}
     */
    DomAdapter.prototype.appendChild = function (el, node) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} node
     * @return {?}
     */
    DomAdapter.prototype.removeChild = function (el, node) { };
    /**
     * @abstract
     * @param {?} parent
     * @param {?} ref
     * @param {?} node
     * @return {?}
     */
    DomAdapter.prototype.insertBefore = function (parent, ref, node) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} value
     * @return {?}
     */
    DomAdapter.prototype.setText = function (el, value) { };
    /**
     * @abstract
     * @param {?} text
     * @return {?}
     */
    DomAdapter.prototype.createComment = function (text) { };
    /**
     * @abstract
     * @param {?} tagName
     * @param {?=} doc
     * @return {?}
     */
    DomAdapter.prototype.createElement = function (tagName, doc) { };
    /**
     * @abstract
     * @param {?} ns
     * @param {?} tagName
     * @param {?=} doc
     * @return {?}
     */
    DomAdapter.prototype.createElementNS = function (ns, tagName, doc) { };
    /**
     * @abstract
     * @param {?} text
     * @param {?=} doc
     * @return {?}
     */
    DomAdapter.prototype.createTextNode = function (text, doc) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} name
     * @return {?}
     */
    DomAdapter.prototype.getElementsByTagName = function (element, name) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} className
     * @return {?}
     */
    DomAdapter.prototype.addClass = function (element, className) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} className
     * @return {?}
     */
    DomAdapter.prototype.removeClass = function (element, className) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    DomAdapter.prototype.getStyle = function (element, styleName) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} styleName
     * @param {?} styleValue
     * @return {?}
     */
    DomAdapter.prototype.setStyle = function (element, styleName, styleValue) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    DomAdapter.prototype.removeStyle = function (element, styleName) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    DomAdapter.prototype.setAttribute = function (element, name, value) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} ns
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    DomAdapter.prototype.setAttributeNS = function (element, ns, name, value) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} attribute
     * @return {?}
     */
    DomAdapter.prototype.removeAttribute = function (element, attribute) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} ns
     * @param {?} attribute
     * @return {?}
     */
    DomAdapter.prototype.removeAttributeNS = function (element, ns, attribute) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.createHtmlDocument = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getDefaultDocument = function () { };
    /**
     * @abstract
     * @param {?} doc
     * @return {?}
     */
    DomAdapter.prototype.getTitle = function (doc) { };
    /**
     * @abstract
     * @param {?} doc
     * @param {?} newTitle
     * @return {?}
     */
    DomAdapter.prototype.setTitle = function (doc, newTitle) { };
    /**
     * @abstract
     * @param {?} n
     * @param {?} selector
     * @return {?}
     */
    DomAdapter.prototype.elementMatches = function (n, selector) { };
    /**
     * @abstract
     * @param {?} node
     * @return {?}
     */
    DomAdapter.prototype.isElementNode = function (node) { };
    /**
     * @abstract
     * @param {?} node
     * @return {?}
     */
    DomAdapter.prototype.isShadowRoot = function (node) { };
    /**
     * @abstract
     * @param {?} el
     * @return {?}
     */
    DomAdapter.prototype.getHost = function (el) { };
    /**
     * @abstract
     * @param {?} el
     * @param {?} evt
     * @param {?} listener
     * @return {?}
     */
    DomAdapter.prototype.onAndCancel = function (el, evt, listener) { };
    /**
     * @abstract
     * @param {?} event
     * @return {?}
     */
    DomAdapter.prototype.getEventKey = function (event) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.supportsDOMEvents = function () { };
    /**
     * @abstract
     * @param {?} doc
     * @param {?} target
     * @return {?}
     */
    DomAdapter.prototype.getGlobalEventTarget = function (doc, target) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getHistory = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getLocation = function () { };
    /**
     * This is the ambient Location definition, NOT Location from \@angular/common.
     * @abstract
     * @param {?} doc
     * @return {?}
     */
    DomAdapter.prototype.getBaseHref = function (doc) { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.resetBaseElement = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.getUserAgent = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.performanceNow = function () { };
    /**
     * @abstract
     * @return {?}
     */
    DomAdapter.prototype.supportsCookies = function () { };
    /**
     * @abstract
     * @param {?} name
     * @return {?}
     */
    DomAdapter.prototype.getCookie = function (name) { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RvbV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVFJLElBQUksR0FBZSxtQkFBQSxJQUFJLEVBQUU7Ozs7QUFFN0IsTUFBTSxVQUFVLE1BQU07SUFDcEIsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxNQUFNLENBQUMsT0FBbUI7SUFDeEMsSUFBSSxHQUFHLE9BQU8sQ0FBQztBQUNqQixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxPQUFtQjtJQUNuRCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsSUFBSSxHQUFHLE9BQU8sQ0FBQztLQUNoQjtBQUNILENBQUM7Ozs7Ozs7OztBQVNELE1BQU0sT0FBZ0IsVUFBVTtDQThFL0I7Ozs7Ozs7O0lBNUVDLDJEQUFxRDs7Ozs7OztJQUNyRCw0REFBK0M7Ozs7OztJQUcvQyxnREFBOEI7Ozs7OztJQUM5QixxREFBbUM7Ozs7O0lBQ25DLG1EQUE0Qjs7Ozs7OztJQUc1QixvRUFBNEQ7Ozs7OztJQUM1RCxnREFBK0I7Ozs7Ozs7SUFDL0Isc0VBQW9FOzs7Ozs7OztJQUdwRSxrRUFBaUU7Ozs7Ozs7SUFDakUsaUVBQXVEOzs7Ozs7SUFDdkQscURBQXlDOzs7Ozs7SUFDekMsdURBQTJDOzs7Ozs7SUFDM0Msb0RBQWtDOzs7Ozs7O0lBQ2xDLDJEQUE4Qzs7Ozs7OztJQUM5QywyREFBOEM7Ozs7Ozs7O0lBQzlDLHFFQUE2RDs7Ozs7OztJQUM3RCx3REFBOEM7Ozs7OztJQUM5Qyx5REFBMEM7Ozs7Ozs7SUFDMUMsaUVBQTZEOzs7Ozs7OztJQUM3RCx1RUFBMEU7Ozs7Ozs7SUFDMUUsK0RBQXVEOzs7Ozs7O0lBQ3ZELHlFQUF5RTs7Ozs7OztJQUN6RSxrRUFBd0Q7Ozs7Ozs7SUFDeEQscUVBQTJEOzs7Ozs7O0lBQzNELGtFQUF3RDs7Ozs7Ozs7SUFDeEQsOEVBQTRFOzs7Ozs7O0lBQzVFLHFFQUEyRDs7Ozs7Ozs7SUFDM0Qsd0VBQXNFOzs7Ozs7Ozs7SUFDdEUsOEVBQW9GOzs7Ozs7O0lBQ3BGLHlFQUErRDs7Ozs7Ozs7SUFDL0QsK0VBQTZFOzs7OztJQUM3RSwwREFBNEM7Ozs7O0lBQzVDLDBEQUF3Qzs7Ozs7O0lBR3hDLG1EQUF5Qzs7Ozs7OztJQUN6Qyw2REFBd0Q7Ozs7Ozs7SUFHeEQsaUVBQTJEOzs7Ozs7SUFDM0QseURBQTJDOzs7Ozs7SUFHM0Msd0RBQTBDOzs7Ozs7SUFDMUMsaURBQStCOzs7Ozs7OztJQUcvQixvRUFBaUU7Ozs7OztJQUNqRSx3REFBeUM7Ozs7O0lBQ3pDLHlEQUFzQzs7Ozs7OztJQUd0Qyx1RUFBa0U7Ozs7O0lBR2xFLGtEQUErQjs7Ozs7SUFDL0IsbURBQ1E7Ozs7Ozs7SUFDUixzREFBaUQ7Ozs7O0lBQ2pELHdEQUFrQzs7Ozs7SUFHbEMsb0RBQWdDOzs7OztJQUdoQyxzREFBa0M7Ozs7O0lBR2xDLHVEQUFvQzs7Ozs7O0lBQ3BDLHFEQUE4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxubGV0IF9ET006IERvbUFkYXB0ZXIgPSBudWxsICE7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRET00oKTogRG9tQWRhcHRlciB7XG4gIHJldHVybiBfRE9NO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RE9NKGFkYXB0ZXI6IERvbUFkYXB0ZXIpIHtcbiAgX0RPTSA9IGFkYXB0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRSb290RG9tQWRhcHRlcihhZGFwdGVyOiBEb21BZGFwdGVyKSB7XG4gIGlmICghX0RPTSkge1xuICAgIF9ET00gPSBhZGFwdGVyO1xuICB9XG59XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG4vKipcbiAqIFByb3ZpZGVzIERPTSBvcGVyYXRpb25zIGluIGFuIGVudmlyb25tZW50LWFnbm9zdGljIHdheS5cbiAqXG4gKiBAc2VjdXJpdHkgVHJlYWQgY2FyZWZ1bGx5ISBJbnRlcmFjdGluZyB3aXRoIHRoZSBET00gZGlyZWN0bHkgaXMgZGFuZ2Vyb3VzIGFuZFxuICogY2FuIGludHJvZHVjZSBYU1Mgcmlza3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEb21BZGFwdGVyIHtcbiAgLy8gTmVlZHMgRG9taW5vLWZyaWVuZGx5IHRlc3QgdXRpbGl0eVxuICBhYnN0cmFjdCBnZXRQcm9wZXJ0eShlbDogRWxlbWVudCwgbmFtZTogc3RyaW5nKTogYW55O1xuICBhYnN0cmFjdCBkaXNwYXRjaEV2ZW50KGVsOiBhbnksIGV2dDogYW55KTogYW55O1xuXG4gIC8vIFVzZWQgYnkgcm91dGVyXG4gIGFic3RyYWN0IGxvZyhlcnJvcjogYW55KTogYW55O1xuICBhYnN0cmFjdCBsb2dHcm91cChlcnJvcjogYW55KTogYW55O1xuICBhYnN0cmFjdCBsb2dHcm91cEVuZCgpOiBhbnk7XG5cbiAgLy8gVXNlZCBieSBNZXRhXG4gIGFic3RyYWN0IHF1ZXJ5U2VsZWN0b3JBbGwoZWw6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGFueVtdO1xuICBhYnN0cmFjdCByZW1vdmUoZWw6IGFueSk6IE5vZGU7XG4gIGFic3RyYWN0IGdldEF0dHJpYnV0ZShlbGVtZW50OiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nfG51bGw7XG5cbiAgLy8gVXNlZCBieSBwbGF0Zm9ybS1zZXJ2ZXJcbiAgYWJzdHJhY3Qgc2V0UHJvcGVydHkoZWw6IEVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IGFueTtcbiAgYWJzdHJhY3QgcXVlcnlTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYW55O1xuICBhYnN0cmFjdCBuZXh0U2libGluZyhlbDogYW55KTogTm9kZXxudWxsO1xuICBhYnN0cmFjdCBwYXJlbnRFbGVtZW50KGVsOiBhbnkpOiBOb2RlfG51bGw7XG4gIGFic3RyYWN0IGNsZWFyTm9kZXMoZWw6IGFueSk6IGFueTtcbiAgYWJzdHJhY3QgYXBwZW5kQ2hpbGQoZWw6IGFueSwgbm9kZTogYW55KTogYW55O1xuICBhYnN0cmFjdCByZW1vdmVDaGlsZChlbDogYW55LCBub2RlOiBhbnkpOiBhbnk7XG4gIGFic3RyYWN0IGluc2VydEJlZm9yZShwYXJlbnQ6IGFueSwgcmVmOiBhbnksIG5vZGU6IGFueSk6IGFueTtcbiAgYWJzdHJhY3Qgc2V0VGV4dChlbDogYW55LCB2YWx1ZTogc3RyaW5nKTogYW55O1xuICBhYnN0cmFjdCBjcmVhdGVDb21tZW50KHRleHQ6IHN0cmluZyk6IGFueTtcbiAgYWJzdHJhY3QgY3JlYXRlRWxlbWVudCh0YWdOYW1lOiBhbnksIGRvYz86IGFueSk6IEhUTUxFbGVtZW50O1xuICBhYnN0cmFjdCBjcmVhdGVFbGVtZW50TlMobnM6IHN0cmluZywgdGFnTmFtZTogc3RyaW5nLCBkb2M/OiBhbnkpOiBFbGVtZW50O1xuICBhYnN0cmFjdCBjcmVhdGVUZXh0Tm9kZSh0ZXh0OiBzdHJpbmcsIGRvYz86IGFueSk6IFRleHQ7XG4gIGFic3RyYWN0IGdldEVsZW1lbnRzQnlUYWdOYW1lKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXTtcbiAgYWJzdHJhY3QgYWRkQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IGFueTtcbiAgYWJzdHJhY3QgcmVtb3ZlQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IGFueTtcbiAgYWJzdHJhY3QgZ2V0U3R5bGUoZWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZyk6IGFueTtcbiAgYWJzdHJhY3Qgc2V0U3R5bGUoZWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKTogYW55O1xuICBhYnN0cmFjdCByZW1vdmVTdHlsZShlbGVtZW50OiBhbnksIHN0eWxlTmFtZTogc3RyaW5nKTogYW55O1xuICBhYnN0cmFjdCBzZXRBdHRyaWJ1dGUoZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBhbnk7XG4gIGFic3RyYWN0IHNldEF0dHJpYnV0ZU5TKGVsZW1lbnQ6IGFueSwgbnM6IHN0cmluZywgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYW55O1xuICBhYnN0cmFjdCByZW1vdmVBdHRyaWJ1dGUoZWxlbWVudDogYW55LCBhdHRyaWJ1dGU6IHN0cmluZyk6IGFueTtcbiAgYWJzdHJhY3QgcmVtb3ZlQXR0cmlidXRlTlMoZWxlbWVudDogYW55LCBuczogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZyk6IGFueTtcbiAgYWJzdHJhY3QgY3JlYXRlSHRtbERvY3VtZW50KCk6IEhUTUxEb2N1bWVudDtcbiAgYWJzdHJhY3QgZ2V0RGVmYXVsdERvY3VtZW50KCk6IERvY3VtZW50O1xuXG4gIC8vIFVzZWQgYnkgVGl0bGVcbiAgYWJzdHJhY3QgZ2V0VGl0bGUoZG9jOiBEb2N1bWVudCk6IHN0cmluZztcbiAgYWJzdHJhY3Qgc2V0VGl0bGUoZG9jOiBEb2N1bWVudCwgbmV3VGl0bGU6IHN0cmluZyk6IGFueTtcblxuICAvLyBVc2VkIGJ5IEJ5LmNzc1xuICBhYnN0cmFjdCBlbGVtZW50TWF0Y2hlcyhuOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuO1xuICBhYnN0cmFjdCBpc0VsZW1lbnROb2RlKG5vZGU6IGFueSk6IGJvb2xlYW47XG5cbiAgLy8gVXNlZCBieSBUZXN0YWJpbGl0eVxuICBhYnN0cmFjdCBpc1NoYWRvd1Jvb3Qobm9kZTogYW55KTogYm9vbGVhbjtcbiAgYWJzdHJhY3QgZ2V0SG9zdChlbDogYW55KTogYW55O1xuXG4gIC8vIFVzZWQgYnkgS2V5RXZlbnRzUGx1Z2luXG4gIGFic3RyYWN0IG9uQW5kQ2FuY2VsKGVsOiBhbnksIGV2dDogYW55LCBsaXN0ZW5lcjogYW55KTogRnVuY3Rpb247XG4gIGFic3RyYWN0IGdldEV2ZW50S2V5KGV2ZW50OiBhbnkpOiBzdHJpbmc7XG4gIGFic3RyYWN0IHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW47XG5cbiAgLy8gVXNlZCBieSBQbGF0Zm9ybUxvY2F0aW9uIGFuZCBTZXJ2ZXJFdmVudE1hbmFnZXJQbHVnaW5cbiAgYWJzdHJhY3QgZ2V0R2xvYmFsRXZlbnRUYXJnZXQoZG9jOiBEb2N1bWVudCwgdGFyZ2V0OiBzdHJpbmcpOiBhbnk7XG5cbiAgLy8gVXNlZCBieSBQbGF0Zm9ybUxvY2F0aW9uXG4gIGFic3RyYWN0IGdldEhpc3RvcnkoKTogSGlzdG9yeTtcbiAgYWJzdHJhY3QgZ2V0TG9jYXRpb24oKTpcbiAgICAgIGFueTsgLyoqIFRoaXMgaXMgdGhlIGFtYmllbnQgTG9jYXRpb24gZGVmaW5pdGlvbiwgTk9UIExvY2F0aW9uIGZyb20gQGFuZ3VsYXIvY29tbW9uLiAgKi9cbiAgYWJzdHJhY3QgZ2V0QmFzZUhyZWYoZG9jOiBEb2N1bWVudCk6IHN0cmluZ3xudWxsO1xuICBhYnN0cmFjdCByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQ7XG5cbiAgLy8gVE9ETzogcmVtb3ZlIGRlcGVuZGVuY3kgaW4gRGVmYXVsdFZhbHVlQWNjZXNzb3JcbiAgYWJzdHJhY3QgZ2V0VXNlckFnZW50KCk6IHN0cmluZztcblxuICAvLyBVc2VkIGJ5IEFuZ3VsYXJQcm9maWxlclxuICBhYnN0cmFjdCBwZXJmb3JtYW5jZU5vdygpOiBudW1iZXI7XG5cbiAgLy8gVXNlZCBieSBDb29raWVYU1JGU3RyYXRlZ3lcbiAgYWJzdHJhY3Qgc3VwcG9ydHNDb29raWVzKCk6IGJvb2xlYW47XG4gIGFic3RyYWN0IGdldENvb2tpZShuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbn1cbiJdfQ==