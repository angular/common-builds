/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, IterableDiffers, KeyValueDiffers, Renderer2 } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Used as a token for an injected service within the NgClass directive.
 *
 * NgClass behaves differenly whether or not VE is being used or not. If
 * present then the legacy ngClass diffing algorithm will be used as an
 * injected service. Otherwise the new diffing algorithm (which delegates
 * to the `[class]` binding) will be used. This toggle behavior is done so
 * via the ivy_switch mechanism.
 */
export declare abstract class NgClassImpl {
    abstract setClass(value: string): void;
    abstract setNgClass(value: string | string[] | Set<string> | {
        [klass: string]: any;
    }): void;
    abstract applyChanges(): void;
    abstract getValue(): {
        [key: string]: any;
    } | null;
}
export declare class NgClassR2Impl implements NgClassImpl {
    private _iterableDiffers;
    private _keyValueDiffers;
    private _ngEl;
    private _renderer;
    private _iterableDiffer;
    private _keyValueDiffer;
    private _initialClasses;
    private _rawClass;
    constructor(_iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer2);
    getValue(): null;
    setClass(value: string): void;
    setNgClass(value: string): void;
    applyChanges(): void;
    private _applyKeyValueChanges;
    private _applyIterableChanges;
    /**
     * Applies a collection of CSS classes to the DOM element.
     *
     * For argument of type Set and Array CSS class names contained in those collections are always
     * added.
     * For argument of type Map CSS class name in the map's key is toggled based on the value (added
     * for truthy and removed for falsy).
     */
    private _applyClasses;
    /**
     * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
     * purposes.
     */
    private _removeClasses;
    private _toggleClass;
    static ɵfac: i0.ɵɵFactoryDef<NgClassR2Impl>;
    static ɵprov: i0.ɵɵInjectableDef<NgClassR2Impl>;
}
export declare class NgClassR3Impl implements NgClassImpl {
    private _value;
    private _ngClassDiffer;
    private _classStringDiffer;
    getValue(): {
        [key: string]: boolean;
    } | null;
    setClass(value: string): void;
    setNgClass(value: string | string[] | Set<string> | {
        [klass: string]: any;
    }): void;
    applyChanges(): void;
    static ɵfac: i0.ɵɵFactoryDef<NgClassR3Impl>;
    static ɵprov: i0.ɵɵInjectableDef<NgClassR3Impl>;
}
export declare const NgClassImplProvider__PRE_R3__: {
    provide: typeof NgClassImpl;
    useClass: typeof NgClassR2Impl;
};
export declare const NgClassImplProvider__POST_R3__: {
    provide: typeof NgClassImpl;
    useClass: typeof NgClassR3Impl;
};
export declare const NgClassImplProvider: {
    provide: typeof NgClassImpl;
    useClass: typeof NgClassR2Impl;
};
