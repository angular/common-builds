/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { getLocalePluralCase, Plural } from './locale_data_api';
import * as i0 from "@angular/core";
/**
 * @publicApi
 */
export class NgLocalization {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgLocalization, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgLocalization, providedIn: 'root', useFactory: (locale) => new NgLocaleLocalization(locale), deps: [{ token: LOCALE_ID }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgLocalization, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                    useFactory: (locale) => new NgLocaleLocalization(locale),
                    deps: [LOCALE_ID],
                }]
        }] });
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
    let key = `=${value}`;
    if (cases.indexOf(key) > -1) {
        return key;
    }
    key = ngLocalization.getPluralCategory(value, locale);
    if (cases.indexOf(key) > -1) {
        return key;
    }
    if (cases.indexOf('other') > -1) {
        return 'other';
    }
    throw new Error(`No plural message found for value "${value}"`);
}
/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
export class NgLocaleLocalization extends NgLocalization {
    constructor(locale) {
        super();
        this.locale = locale;
    }
    getPluralCategory(value, locale) {
        const plural = getLocalePluralCase(locale || this.locale)(value);
        switch (plural) {
            case Plural.Zero:
                return 'zero';
            case Plural.One:
                return 'one';
            case Plural.Two:
                return 'two';
            case Plural.Few:
                return 'few';
            case Plural.Many:
                return 'many';
            default:
                return 'other';
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgLocaleLocalization, deps: [{ token: LOCALE_ID }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgLocaleLocalization }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgLocaleLocalization, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUU5RDs7R0FFRztBQU1ILE1BQU0sT0FBZ0IsY0FBYzt5SEFBZCxjQUFjOzZIQUFkLGNBQWMsY0FKdEIsTUFBTSxjQUNOLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxrQkFDekQsU0FBUzs7c0dBRUksY0FBYztrQkFMbkMsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtvQkFDbEIsVUFBVSxFQUFFLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztvQkFDaEUsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDO2lCQUNsQjs7QUFLRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUMvQixLQUFhLEVBQ2IsS0FBZSxFQUNmLGNBQThCLEVBQzlCLE1BQWU7SUFFZixJQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0lBRXRCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELEdBQUcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXRELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hDLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFFRDs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLG9CQUFxQixTQUFRLGNBQWM7SUFDdEQsWUFBeUMsTUFBYztRQUNyRCxLQUFLLEVBQUUsQ0FBQztRQUQrQixXQUFNLEdBQU4sTUFBTSxDQUFRO0lBRXZELENBQUM7SUFFUSxpQkFBaUIsQ0FBQyxLQUFVLEVBQUUsTUFBZTtRQUNwRCxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpFLFFBQVEsTUFBTSxFQUFFLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJO2dCQUNkLE9BQU8sTUFBTSxDQUFDO1lBQ2hCLEtBQUssTUFBTSxDQUFDLEdBQUc7Z0JBQ2IsT0FBTyxLQUFLLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNiLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsR0FBRztnQkFDYixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLElBQUk7Z0JBQ2QsT0FBTyxNQUFNLENBQUM7WUFDaEI7Z0JBQ0UsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztJQUNILENBQUM7eUhBdEJVLG9CQUFvQixrQkFDWCxTQUFTOzZIQURsQixvQkFBb0I7O3NHQUFwQixvQkFBb0I7a0JBRGhDLFVBQVU7OzBCQUVJLE1BQU07MkJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgTE9DQUxFX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtnZXRMb2NhbGVQbHVyYWxDYXNlLCBQbHVyYWx9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICB1c2VGYWN0b3J5OiAobG9jYWxlOiBzdHJpbmcpID0+IG5ldyBOZ0xvY2FsZUxvY2FsaXphdGlvbihsb2NhbGUpLFxuICBkZXBzOiBbTE9DQUxFX0lEXSxcbn0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdMb2NhbGl6YXRpb24ge1xuICBhYnN0cmFjdCBnZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZTogYW55LCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhdGVnb3J5IGZvciBhIGdpdmVuIHZhbHVlLlxuICogLSBcIj12YWx1ZVwiIHdoZW4gdGhlIGNhc2UgZXhpc3RzLFxuICogLSB0aGUgcGx1cmFsIGNhdGVnb3J5IG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1cmFsQ2F0ZWdvcnkoXG4gIHZhbHVlOiBudW1iZXIsXG4gIGNhc2VzOiBzdHJpbmdbXSxcbiAgbmdMb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uLFxuICBsb2NhbGU/OiBzdHJpbmcsXG4pOiBzdHJpbmcge1xuICBsZXQga2V5ID0gYD0ke3ZhbHVlfWA7XG5cbiAgaWYgKGNhc2VzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGtleSA9IG5nTG9jYWxpemF0aW9uLmdldFBsdXJhbENhdGVnb3J5KHZhbHVlLCBsb2NhbGUpO1xuXG4gIGlmIChjYXNlcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBpZiAoY2FzZXMuaW5kZXhPZignb3RoZXInKSA+IC0xKSB7XG4gICAgcmV0dXJuICdvdGhlcic7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYE5vIHBsdXJhbCBtZXNzYWdlIGZvdW5kIGZvciB2YWx1ZSBcIiR7dmFsdWV9XCJgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwbHVyYWwgY2FzZSBiYXNlZCBvbiB0aGUgbG9jYWxlXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdMb2NhbGVMb2NhbGl6YXRpb24gZXh0ZW5kcyBOZ0xvY2FsaXphdGlvbiB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcm90ZWN0ZWQgbG9jYWxlOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwbHVyYWwgPSBnZXRMb2NhbGVQbHVyYWxDYXNlKGxvY2FsZSB8fCB0aGlzLmxvY2FsZSkodmFsdWUpO1xuXG4gICAgc3dpdGNoIChwbHVyYWwpIHtcbiAgICAgIGNhc2UgUGx1cmFsLlplcm86XG4gICAgICAgIHJldHVybiAnemVybyc7XG4gICAgICBjYXNlIFBsdXJhbC5PbmU6XG4gICAgICAgIHJldHVybiAnb25lJztcbiAgICAgIGNhc2UgUGx1cmFsLlR3bzpcbiAgICAgICAgcmV0dXJuICd0d28nO1xuICAgICAgY2FzZSBQbHVyYWwuRmV3OlxuICAgICAgICByZXR1cm4gJ2Zldyc7XG4gICAgICBjYXNlIFBsdXJhbC5NYW55OlxuICAgICAgICByZXR1cm4gJ21hbnknO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdvdGhlcic7XG4gICAgfVxuICB9XG59XG4iXX0=