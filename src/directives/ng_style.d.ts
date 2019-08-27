/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck } from '@angular/core';
import { NgStyleImpl } from './ng_style_impl';
import * as i0 from "@angular/core";
export declare const ngStyleDirectiveDef__PRE_R3__: undefined;
export declare const ngStyleFactoryDef__PRE_R3__: undefined;
export declare const ngStyleDirectiveDef__POST_R3__: never;
export declare const ngStyleFactoryDef__POST_R3__: () => void;
export declare const ngStyleDirectiveDef: undefined;
export declare const ngStyleFactoryDef: undefined;
/**
 * Serves as the base non-VE container for NgStyle.
 *
 * While this is a base class that NgStyle extends from, the
 * class itself acts as a container for non-VE code to setup
 * a link to the `[style]` host binding (via the static
 * `ngDirectiveDef` property on the class).
 *
 * Note that the `ngDirectiveDef` property's code is switched
 * depending if VE is present or not (this allows for the
 * binding code to be set only for newer versions of Angular).
 *
 * @publicApi
 */
export declare class NgStyleBase {
    protected _delegate: NgStyleImpl;
    static ngDirectiveDef: any;
    static ngFactory: any;
    constructor(_delegate: NgStyleImpl);
    getValue(): {
        [key: string]: any;
    } | null;
}
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 *
 * Set the font of the containing element to the result of an expression.
 *
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 * ```
 *
 * Set the width of the containing element to a pixel value returned by an expression.
 *
 * ```
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 * ```
 *
 * Set a collection of style values using an expression that returns key-value pairs.
 *
 * ```
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * An attribute directive that updates styles for the containing HTML element.
 * Sets one or more style properties, specified as colon-separated key-value pairs.
 * The key is a style name, with an optional `.<unit>` suffix
 * (such as 'top.px', 'font-style.em').
 * The value is an expression to be evaluated.
 * The resulting non-null value, expressed in the given unit,
 * is assigned to the given style property.
 * If the result of evaluation is null, the corresponding style is removed.
 *
 * @publicApi
 */
export declare class NgStyle extends NgStyleBase implements DoCheck {
    constructor(delegate: NgStyleImpl);
    ngStyle: {
        [klass: string]: any;
    } | null;
    ngDoCheck(): void;
    static ngFactoryDef: i0.ɵɵFactoryDef<NgStyle>;
    static ngDirectiveDef: i0.ɵɵDirectiveDefWithMeta<NgStyle, "[ngStyle]", never, { 'ngStyle': "ngStyle" }, {}, never>;
}
