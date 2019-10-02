/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, KeyValueDiffers, Renderer2 } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Used as a token for an injected service within the NgStyle directive.
 *
 * NgStyle behaves differenly whether or not VE is being used or not. If
 * present then the legacy ngClass diffing algorithm will be used as an
 * injected service. Otherwise the new diffing algorithm (which delegates
 * to the `[style]` binding) will be used. This toggle behavior is done so
 * via the ivy_switch mechanism.
 */
export declare abstract class NgStyleImpl {
    abstract getValue(): {
        [key: string]: any;
    } | null;
    abstract setNgStyle(value: {
        [key: string]: any;
    } | null): void;
    abstract applyChanges(): void;
}
export declare class NgStyleR2Impl implements NgStyleImpl {
    private _ngEl;
    private _differs;
    private _renderer;
    private _ngStyle;
    private _differ;
    constructor(_ngEl: ElementRef, _differs: KeyValueDiffers, _renderer: Renderer2);
    getValue(): null;
    /**
     * A map of style properties, specified as colon-separated
     * key-value pairs.
     * * The key is a style name, with an optional `.<unit>` suffix
     *    (such as 'top.px', 'font-style.em').
     * * The value is an expression to be evaluated.
     */
    setNgStyle(values: {
        [key: string]: string;
    }): void;
    /**
     * Applies the new styles if needed.
     */
    applyChanges(): void;
    private _applyChanges;
    private _setStyle;
    static ngFactoryDef: i0.ɵɵFactoryDef<NgStyleR2Impl>;
    static ngInjectableDef: i0.ɵɵInjectableDef<NgStyleR2Impl>;
}
export declare class NgStyleR3Impl implements NgStyleImpl {
    private _differ;
    private _value;
    getValue(): {
        [key: string]: any;
    } | null;
    setNgStyle(value: {
        [key: string]: any;
    } | null): void;
    applyChanges(): void;
    static ngFactoryDef: i0.ɵɵFactoryDef<NgStyleR3Impl>;
    static ngInjectableDef: i0.ɵɵInjectableDef<NgStyleR3Impl>;
}
export declare const NgStyleImplProvider__PRE_R3__: {
    provide: typeof NgStyleImpl;
    useClass: typeof NgStyleR2Impl;
};
export declare const NgStyleImplProvider__POST_R3__: {
    provide: typeof NgStyleImpl;
    useClass: typeof NgStyleR3Impl;
};
export declare const NgStyleImplProvider: {
    provide: typeof NgStyleImpl;
    useClass: typeof NgStyleR2Impl;
};
