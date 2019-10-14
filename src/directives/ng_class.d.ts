/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck } from '@angular/core';
import { NgClassImpl } from './ng_class_impl';
import * as i0 from "@angular/core";
export declare const ngClassDirectiveDef__PRE_R3__: undefined;
export declare const ngClassDirectiveDef__POST_R3__: never;
export declare const ngClassDirectiveDef: undefined;
export declare const ngClassFactoryDef__PRE_R3__: undefined;
export declare const ngClassFactoryDef__POST_R3__: () => void;
export declare const ngClassFactoryDef: undefined;
/**
 * Serves as the base non-VE container for NgClass.
 *
 * While this is a base class that NgClass extends from, the
 * class itself acts as a container for non-VE code to setup
 * a link to the `[class]` host binding (via the static
 * `ɵdir` property on the class).
 *
 * Note that the `ɵdir` property's code is switched
 * depending if VE is present or not (this allows for the
 * binding code to be set only for newer versions of Angular).
 *
 * @publicApi
 */
export declare class NgClassBase {
    protected _delegate: NgClassImpl;
    static ɵdir: any;
    static ngFactoryDef: any;
    constructor(_delegate: NgClassImpl);
    getValue(): {
        [key: string]: any;
    } | null;
}
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @publicApi
 */
export declare class NgClass extends NgClassBase implements DoCheck {
    constructor(delegate: NgClassImpl);
    klass: string;
    ngClass: string | string[] | Set<string> | {
        [klass: string]: any;
    };
    ngDoCheck(): void;
    static ngFactoryDef: i0.ɵɵFactoryDef<NgClass>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<NgClass, "[ngClass]", never, { 'klass': "class", 'ngClass': "ngClass" }, {}, never>;
}
