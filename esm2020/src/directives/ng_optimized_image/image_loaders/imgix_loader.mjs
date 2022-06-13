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
 * Function that generates a built-in ImageLoader for Imgix and turns it
 * into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.imgix.net or https://images.mysite.com
 * @param options An object that allows to provide extra configuration:
 * - `ensurePreconnect`: boolean flag indicating whether the NgOptimizedImage directive
 *                       should verify that there is a corresponding `<link rel="preconnect">`
 *                       present in the document's `<head>`.
 * @returns Set of providers to configure the Imgix loader.
 */
export const provideImgixLoader = createImageLoader(imgixLoaderFactory, ngDevMode ? ['https://somepath.imgix.net/'] : undefined);
function imgixLoaderFactory(path) {
    return (config) => {
        const url = new URL(`${path}/${normalizeSrc(config.src)}`);
        // This setting ensures the smallest allowable format is set.
        url.searchParams.set('auto', 'format');
        if (config.width) {
            url.searchParams.set('w', config.width.toString());
        }
        return url.href;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1naXhfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltZ2l4X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXJDLE9BQU8sRUFBQyxpQkFBaUIsRUFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRTs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUMzQixpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbkcsU0FBUyxrQkFBa0IsQ0FBQyxJQUFZO0lBQ3RDLE9BQU8sQ0FBQyxNQUF5QixFQUFFLEVBQUU7UUFDbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0QsNkRBQTZEO1FBQzdELEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDaEIsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUNwRDtRQUNELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztJQUNsQixDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplU3JjfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtjcmVhdGVJbWFnZUxvYWRlciwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJy4vaW1hZ2VfbG9hZGVyJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIGJ1aWx0LWluIEltYWdlTG9hZGVyIGZvciBJbWdpeCBhbmQgdHVybnMgaXRcbiAqIGludG8gYW4gQW5ndWxhciBwcm92aWRlci5cbiAqXG4gKiBAcGFyYW0gcGF0aCBwYXRoIHRvIHRoZSBkZXNpcmVkIEltZ2l4IG9yaWdpbixcbiAqIGUuZy4gaHR0cHM6Ly9zb21lcGF0aC5pbWdpeC5uZXQgb3IgaHR0cHM6Ly9pbWFnZXMubXlzaXRlLmNvbVxuICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgYWxsb3dzIHRvIHByb3ZpZGUgZXh0cmEgY29uZmlndXJhdGlvbjpcbiAqIC0gYGVuc3VyZVByZWNvbm5lY3RgOiBib29sZWFuIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZVxuICogICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCB2ZXJpZnkgdGhhdCB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gXG4gKiAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VudCBpbiB0aGUgZG9jdW1lbnQncyBgPGhlYWQ+YC5cbiAqIEByZXR1cm5zIFNldCBvZiBwcm92aWRlcnMgdG8gY29uZmlndXJlIHRoZSBJbWdpeCBsb2FkZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBwcm92aWRlSW1naXhMb2FkZXIgPVxuICAgIGNyZWF0ZUltYWdlTG9hZGVyKGltZ2l4TG9hZGVyRmFjdG9yeSwgbmdEZXZNb2RlID8gWydodHRwczovL3NvbWVwYXRoLmltZ2l4Lm5ldC8nXSA6IHVuZGVmaW5lZCk7XG5cbmZ1bmN0aW9uIGltZ2l4TG9hZGVyRmFjdG9yeShwYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChgJHtwYXRofS8ke25vcm1hbGl6ZVNyYyhjb25maWcuc3JjKX1gKTtcbiAgICAvLyBUaGlzIHNldHRpbmcgZW5zdXJlcyB0aGUgc21hbGxlc3QgYWxsb3dhYmxlIGZvcm1hdCBpcyBzZXQuXG4gICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoJ2F1dG8nLCAnZm9ybWF0Jyk7XG4gICAgaWYgKGNvbmZpZy53aWR0aCkge1xuICAgICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoJ3cnLCBjb25maWcud2lkdGgudG9TdHJpbmcoKSk7XG4gICAgfVxuICAgIHJldHVybiB1cmwuaHJlZjtcbiAgfTtcbn1cbiJdfQ==