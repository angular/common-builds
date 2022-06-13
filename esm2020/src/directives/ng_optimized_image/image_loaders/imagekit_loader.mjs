/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { normalizeSrc } from '../util';
import { createImageLoader } from './image_loader';
/**
 * Function that generates a built-in ImageLoader for ImageKit
 * and turns it into an Angular provider.
 *
 * @param path Base URL of your ImageKit images
 * This URL should match one of the following formats:
 * https://ik.imagekit.io/myaccount
 * https://subdomain.mysite.com
 * @param options An object that allows to provide extra configuration:
 * - `ensurePreconnect`: boolean flag indicating whether the NgOptimizedImage directive
 *                       should verify that there is a corresponding `<link rel="preconnect">`
 *                       present in the document's `<head>`.
 * @returns Set of providers to configure the ImageKit loader.
 */
export const provideImageKitLoader = createImageLoader(imagekitLoaderFactory, ngDevMode ? ['https://ik.imagekit.io/mysite', 'https://subdomain.mysite.com'] : undefined);
export function imagekitLoaderFactory(path) {
    return (config) => {
        // Example of an ImageKit image URL:
        // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
        let params = `tr:q-auto`; // applies the "auto quality" transformation
        if (config.width) {
            params += `,w-${config.width}`;
        }
        const url = `${path}/${params}/${normalizeSrc(config.src)}`;
        return url;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VraXRfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXJDLE9BQU8sRUFBQyxpQkFBaUIsRUFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRTs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsaUJBQWlCLENBQ2xELHFCQUFxQixFQUNyQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsK0JBQStCLEVBQUUsOEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFL0YsTUFBTSxVQUFVLHFCQUFxQixDQUFDLElBQVk7SUFDaEQsT0FBTyxDQUFDLE1BQXlCLEVBQUUsRUFBRTtRQUNuQyxvQ0FBb0M7UUFDcEMsc0VBQXNFO1FBQ3RFLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFFLDRDQUE0QztRQUN2RSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDaEIsTUFBTSxJQUFJLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2hDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksTUFBTSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1RCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtub3JtYWxpemVTcmN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge2NyZWF0ZUltYWdlTG9hZGVyLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnLi9pbWFnZV9sb2FkZXInO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgYnVpbHQtaW4gSW1hZ2VMb2FkZXIgZm9yIEltYWdlS2l0XG4gKiBhbmQgdHVybnMgaXQgaW50byBhbiBBbmd1bGFyIHByb3ZpZGVyLlxuICpcbiAqIEBwYXJhbSBwYXRoIEJhc2UgVVJMIG9mIHlvdXIgSW1hZ2VLaXQgaW1hZ2VzXG4gKiBUaGlzIFVSTCBzaG91bGQgbWF0Y2ggb25lIG9mIHRoZSBmb2xsb3dpbmcgZm9ybWF0czpcbiAqIGh0dHBzOi8vaWsuaW1hZ2VraXQuaW8vbXlhY2NvdW50XG4gKiBodHRwczovL3N1YmRvbWFpbi5teXNpdGUuY29tXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBhbGxvd3MgdG8gcHJvdmlkZSBleHRyYSBjb25maWd1cmF0aW9uOlxuICogLSBgZW5zdXJlUHJlY29ubmVjdGA6IGJvb2xlYW4gZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkIHZlcmlmeSB0aGF0IHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyBgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPmBcbiAqICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW50IGluIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLlxuICogQHJldHVybnMgU2V0IG9mIHByb3ZpZGVycyB0byBjb25maWd1cmUgdGhlIEltYWdlS2l0IGxvYWRlci5cbiAqL1xuZXhwb3J0IGNvbnN0IHByb3ZpZGVJbWFnZUtpdExvYWRlciA9IGNyZWF0ZUltYWdlTG9hZGVyKFxuICAgIGltYWdla2l0TG9hZGVyRmFjdG9yeSxcbiAgICBuZ0Rldk1vZGUgPyBbJ2h0dHBzOi8vaWsuaW1hZ2VraXQuaW8vbXlzaXRlJywgJ2h0dHBzOi8vc3ViZG9tYWluLm15c2l0ZS5jb20nXSA6IHVuZGVmaW5lZCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbWFnZWtpdExvYWRlckZhY3RvcnkocGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICAgIC8vIEV4YW1wbGUgb2YgYW4gSW1hZ2VLaXQgaW1hZ2UgVVJMOlxuICAgIC8vIGh0dHBzOi8vaWsuaW1hZ2VraXQuaW8vZGVtby90cjp3LTMwMCxoLTMwMC9tZWRpdW1fY2FmZV9CMWlUZEQwQy5qcGdcbiAgICBsZXQgcGFyYW1zID0gYHRyOnEtYXV0b2A7ICAvLyBhcHBsaWVzIHRoZSBcImF1dG8gcXVhbGl0eVwiIHRyYW5zZm9ybWF0aW9uXG4gICAgaWYgKGNvbmZpZy53aWR0aCkge1xuICAgICAgcGFyYW1zICs9IGAsdy0ke2NvbmZpZy53aWR0aH1gO1xuICAgIH1cbiAgICBjb25zdCB1cmwgPSBgJHtwYXRofS8ke3BhcmFtc30vJHtub3JtYWxpemVTcmMoY29uZmlnLnNyYyl9YDtcbiAgICByZXR1cm4gdXJsO1xuICB9O1xufVxuIl19