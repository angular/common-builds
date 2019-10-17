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
     * @return {?}
     */
    DomAdapter.prototype.remove = function (el) { };
    /**
     * @abstract
     * @param {?} tagName
     * @param {?=} doc
     * @return {?}
     */
    DomAdapter.prototype.createElement = function (tagName, doc) { };
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
     * @param {?} evt
     * @param {?} listener
     * @return {?}
     */
    DomAdapter.prototype.onAndCancel = function (el, evt, listener) { };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RvbV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVFJLElBQUksR0FBZSxtQkFBQSxJQUFJLEVBQUU7Ozs7QUFFN0IsTUFBTSxVQUFVLE1BQU07SUFDcEIsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxNQUFNLENBQUMsT0FBbUI7SUFDeEMsSUFBSSxHQUFHLE9BQU8sQ0FBQztBQUNqQixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxPQUFtQjtJQUNuRCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsSUFBSSxHQUFHLE9BQU8sQ0FBQztLQUNoQjtBQUNILENBQUM7Ozs7Ozs7OztBQVNELE1BQU0sT0FBZ0IsVUFBVTtDQTZDL0I7Ozs7Ozs7O0lBM0NDLDJEQUFxRDs7Ozs7OztJQUNyRCw0REFBK0M7Ozs7OztJQUcvQyxnREFBOEI7Ozs7OztJQUM5QixxREFBbUM7Ozs7O0lBQ25DLG1EQUE0Qjs7Ozs7O0lBRzVCLGdEQUErQjs7Ozs7OztJQUMvQixpRUFBNkQ7Ozs7O0lBQzdELDBEQUE0Qzs7Ozs7SUFDNUMsMERBQXdDOzs7Ozs7SUFHeEMseURBQTJDOzs7Ozs7SUFHM0Msd0RBQTBDOzs7Ozs7OztJQUcxQyxvRUFBaUU7Ozs7O0lBQ2pFLHlEQUFzQzs7Ozs7OztJQUd0Qyx1RUFBa0U7Ozs7O0lBR2xFLGtEQUErQjs7Ozs7SUFDL0IsbURBQ1E7Ozs7Ozs7SUFDUixzREFBaUQ7Ozs7O0lBQ2pELHdEQUFrQzs7Ozs7SUFHbEMsb0RBQWdDOzs7OztJQUdoQyxzREFBa0M7Ozs7O0lBR2xDLHVEQUFvQzs7Ozs7O0lBQ3BDLHFEQUE4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxubGV0IF9ET006IERvbUFkYXB0ZXIgPSBudWxsICE7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRET00oKTogRG9tQWRhcHRlciB7XG4gIHJldHVybiBfRE9NO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RE9NKGFkYXB0ZXI6IERvbUFkYXB0ZXIpIHtcbiAgX0RPTSA9IGFkYXB0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRSb290RG9tQWRhcHRlcihhZGFwdGVyOiBEb21BZGFwdGVyKSB7XG4gIGlmICghX0RPTSkge1xuICAgIF9ET00gPSBhZGFwdGVyO1xuICB9XG59XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG4vKipcbiAqIFByb3ZpZGVzIERPTSBvcGVyYXRpb25zIGluIGFuIGVudmlyb25tZW50LWFnbm9zdGljIHdheS5cbiAqXG4gKiBAc2VjdXJpdHkgVHJlYWQgY2FyZWZ1bGx5ISBJbnRlcmFjdGluZyB3aXRoIHRoZSBET00gZGlyZWN0bHkgaXMgZGFuZ2Vyb3VzIGFuZFxuICogY2FuIGludHJvZHVjZSBYU1Mgcmlza3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEb21BZGFwdGVyIHtcbiAgLy8gTmVlZHMgRG9taW5vLWZyaWVuZGx5IHRlc3QgdXRpbGl0eVxuICBhYnN0cmFjdCBnZXRQcm9wZXJ0eShlbDogRWxlbWVudCwgbmFtZTogc3RyaW5nKTogYW55O1xuICBhYnN0cmFjdCBkaXNwYXRjaEV2ZW50KGVsOiBhbnksIGV2dDogYW55KTogYW55O1xuXG4gIC8vIFVzZWQgYnkgcm91dGVyXG4gIGFic3RyYWN0IGxvZyhlcnJvcjogYW55KTogYW55O1xuICBhYnN0cmFjdCBsb2dHcm91cChlcnJvcjogYW55KTogYW55O1xuICBhYnN0cmFjdCBsb2dHcm91cEVuZCgpOiBhbnk7XG5cbiAgLy8gVXNlZCBieSBNZXRhXG4gIGFic3RyYWN0IHJlbW92ZShlbDogYW55KTogTm9kZTtcbiAgYWJzdHJhY3QgY3JlYXRlRWxlbWVudCh0YWdOYW1lOiBhbnksIGRvYz86IGFueSk6IEhUTUxFbGVtZW50O1xuICBhYnN0cmFjdCBjcmVhdGVIdG1sRG9jdW1lbnQoKTogSFRNTERvY3VtZW50O1xuICBhYnN0cmFjdCBnZXREZWZhdWx0RG9jdW1lbnQoKTogRG9jdW1lbnQ7XG5cbiAgLy8gVXNlZCBieSBCeS5jc3NcbiAgYWJzdHJhY3QgaXNFbGVtZW50Tm9kZShub2RlOiBhbnkpOiBib29sZWFuO1xuXG4gIC8vIFVzZWQgYnkgVGVzdGFiaWxpdHlcbiAgYWJzdHJhY3QgaXNTaGFkb3dSb290KG5vZGU6IGFueSk6IGJvb2xlYW47XG5cbiAgLy8gVXNlZCBieSBLZXlFdmVudHNQbHVnaW5cbiAgYWJzdHJhY3Qgb25BbmRDYW5jZWwoZWw6IGFueSwgZXZ0OiBhbnksIGxpc3RlbmVyOiBhbnkpOiBGdW5jdGlvbjtcbiAgYWJzdHJhY3Qgc3VwcG9ydHNET01FdmVudHMoKTogYm9vbGVhbjtcblxuICAvLyBVc2VkIGJ5IFBsYXRmb3JtTG9jYXRpb24gYW5kIFNlcnZlckV2ZW50TWFuYWdlclBsdWdpblxuICBhYnN0cmFjdCBnZXRHbG9iYWxFdmVudFRhcmdldChkb2M6IERvY3VtZW50LCB0YXJnZXQ6IHN0cmluZyk6IGFueTtcblxuICAvLyBVc2VkIGJ5IFBsYXRmb3JtTG9jYXRpb25cbiAgYWJzdHJhY3QgZ2V0SGlzdG9yeSgpOiBIaXN0b3J5O1xuICBhYnN0cmFjdCBnZXRMb2NhdGlvbigpOlxuICAgICAgYW55OyAvKiogVGhpcyBpcyB0aGUgYW1iaWVudCBMb2NhdGlvbiBkZWZpbml0aW9uLCBOT1QgTG9jYXRpb24gZnJvbSBAYW5ndWxhci9jb21tb24uICAqL1xuICBhYnN0cmFjdCBnZXRCYXNlSHJlZihkb2M6IERvY3VtZW50KTogc3RyaW5nfG51bGw7XG4gIGFic3RyYWN0IHJlc2V0QmFzZUVsZW1lbnQoKTogdm9pZDtcblxuICAvLyBUT0RPOiByZW1vdmUgZGVwZW5kZW5jeSBpbiBEZWZhdWx0VmFsdWVBY2Nlc3NvclxuICBhYnN0cmFjdCBnZXRVc2VyQWdlbnQoKTogc3RyaW5nO1xuXG4gIC8vIFVzZWQgYnkgQW5ndWxhclByb2ZpbGVyXG4gIGFic3RyYWN0IHBlcmZvcm1hbmNlTm93KCk6IG51bWJlcjtcblxuICAvLyBVc2VkIGJ5IENvb2tpZVhTUkZTdHJhdGVneVxuICBhYnN0cmFjdCBzdXBwb3J0c0Nvb2tpZXMoKTogYm9vbGVhbjtcbiAgYWJzdHJhY3QgZ2V0Q29va2llKG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsO1xufVxuIl19