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
    abstract remove(el: any): Node;
    abstract createElement(tagName: any, doc?: any): HTMLElement;
    abstract createHtmlDocument(): HTMLDocument;
    abstract getDefaultDocument(): Document;
    abstract isElementNode(node: any): boolean;
    abstract isShadowRoot(node: any): boolean;
    abstract onAndCancel(el: any, evt: any, listener: any): Function;
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
