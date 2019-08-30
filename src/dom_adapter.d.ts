/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare function getDOM(): DomAdapter;
export declare function setDOM(adapter: DomAdapter): void;
export declare function setRootDomAdapter(adapter: DomAdapter): void;
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export declare abstract class DomAdapter {
    abstract getProperty(el: Element, name: string): any;
    abstract dispatchEvent(el: any, evt: any): any;
    abstract log(error: any): any;
    abstract logGroup(error: any): any;
    abstract logGroupEnd(): any;
    abstract querySelectorAll(el: any, selector: string): any[];
    abstract remove(el: any): Node;
    abstract getAttribute(element: any, attribute: string): string | null;
    abstract setProperty(el: Element, name: string, value: any): any;
    abstract querySelector(el: any, selector: string): any;
    abstract nextSibling(el: any): Node | null;
    abstract parentElement(el: any): Node | null;
    abstract clearNodes(el: any): any;
    abstract appendChild(el: any, node: any): any;
    abstract removeChild(el: any, node: any): any;
    abstract insertBefore(parent: any, ref: any, node: any): any;
    abstract setText(el: any, value: string): any;
    abstract createComment(text: string): any;
    abstract createElement(tagName: any, doc?: any): HTMLElement;
    abstract createElementNS(ns: string, tagName: string, doc?: any): Element;
    abstract createTextNode(text: string, doc?: any): Text;
    abstract getElementsByTagName(element: any, name: string): HTMLElement[];
    abstract addClass(element: any, className: string): any;
    abstract removeClass(element: any, className: string): any;
    abstract getStyle(element: any, styleName: string): any;
    abstract setStyle(element: any, styleName: string, styleValue: string): any;
    abstract removeStyle(element: any, styleName: string): any;
    abstract setAttribute(element: any, name: string, value: string): any;
    abstract setAttributeNS(element: any, ns: string, name: string, value: string): any;
    abstract removeAttribute(element: any, attribute: string): any;
    abstract removeAttributeNS(element: any, ns: string, attribute: string): any;
    abstract createHtmlDocument(): HTMLDocument;
    abstract getDefaultDocument(): Document;
    abstract getTitle(doc: Document): string;
    abstract setTitle(doc: Document, newTitle: string): any;
    abstract elementMatches(n: any, selector: string): boolean;
    abstract isElementNode(node: any): boolean;
    abstract isShadowRoot(node: any): boolean;
    abstract getHost(el: any): any;
    abstract onAndCancel(el: any, evt: any, listener: any): Function;
    abstract getEventKey(event: any): string;
    abstract supportsDOMEvents(): boolean;
    abstract getGlobalEventTarget(doc: Document, target: string): any;
    abstract getHistory(): History;
    abstract getLocation(): any; /** This is the ambient Location definition, NOT Location from @angular/common.  */
    abstract getBaseHref(doc: Document): string | null;
    abstract resetBaseElement(): void;
    abstract getUserAgent(): string;
    abstract performanceNow(): number;
    abstract supportsCookies(): boolean;
    abstract getCookie(name: string): string | null;
}
