/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare function stripPrefix(val: string, prefix: string): string;
export declare function deepEqual(a: any, b: any): boolean;
export declare function isAnchor(el: (Node & ParentNode) | Element | null): el is HTMLAnchorElement;
export declare function isPromise<T = any>(obj: any): obj is Promise<T>;
