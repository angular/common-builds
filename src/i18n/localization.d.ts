import * as i0 from "@angular/core";
/**
 * @publicApi
 */
export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any, locale?: string): string;
}
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export declare function getPluralCategory(value: number, cases: string[], ngLocalization: NgLocalization, locale?: string): string;
/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
export declare class NgLocaleLocalization extends NgLocalization {
    protected locale: string;
    constructor(locale: string);
    getPluralCategory(value: any, locale?: string): string;
    static ɵfac: i0.ɵɵFactoryDef<NgLocaleLocalization>;
    static ɵprov: i0.ɵɵInjectableDef<NgLocaleLocalization>;
}
