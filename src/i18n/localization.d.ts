/**
 * @experimental
 */
export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any, locale?: string): string;
}
/**
 * Returns the plural case based on the locale
 *
 * @experimental
 */
export declare class NgLocaleLocalization extends NgLocalization {
    protected locale: string;
    constructor(locale: string);
    getPluralCategory(value: any, locale?: string): string;
}
