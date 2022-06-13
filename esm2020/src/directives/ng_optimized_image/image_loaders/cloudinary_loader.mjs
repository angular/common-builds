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
 * Function that generates a built-in ImageLoader for Cloudinary
 * and turns it into an Angular provider.
 *
 * @param path Base URL of your Cloudinary images
 * This URL should match one of the following formats:
 * https://res.cloudinary.com/mysite
 * https://mysite.cloudinary.com
 * https://subdomain.mysite.com
 * @param options An object that allows to provide extra configuration:
 * - `ensurePreconnect`: boolean flag indicating whether the NgOptimizedImage directive
 *                       should verify that there is a corresponding `<link rel="preconnect">`
 *                       present in the document's `<head>`.
 * @returns Set of providers to configure the Cloudinary loader.
 */
export const provideCloudinaryLoader = createImageLoader(cloudinaryLoaderFactory, ngDevMode ?
    [
        'https://res.cloudinary.com/mysite', 'https://mysite.cloudinary.com',
        'https://subdomain.mysite.com'
    ] :
    undefined);
function cloudinaryLoaderFactory(path) {
    return (config) => {
        // Example of a Cloudinary image URL:
        // https://res.cloudinary.com/mysite/image/upload/c_scale,f_auto,q_auto,w_600/marketing/tile-topics-m.png
        let params = `f_auto,q_auto`; // sets image format and quality to "auto"
        if (config.width) {
            params += `,w_${config.width}`;
        }
        const url = `${path}/image/upload/${params}/${normalizeSrc(config.src)}`;
        return url;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRpbmFyeV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVyQyxPQUFPLEVBQUMsaUJBQWlCLEVBQW9CLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEU7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FBRyxpQkFBaUIsQ0FDcEQsdUJBQXVCLEVBQ3ZCLFNBQVMsQ0FBQyxDQUFDO0lBQ1A7UUFDRSxtQ0FBbUMsRUFBRSwrQkFBK0I7UUFDcEUsOEJBQThCO0tBQy9CLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxDQUFDO0FBRW5CLFNBQVMsdUJBQXVCLENBQUMsSUFBWTtJQUMzQyxPQUFPLENBQUMsTUFBeUIsRUFBRSxFQUFFO1FBQ25DLHFDQUFxQztRQUNyQyx5R0FBeUc7UUFDekcsSUFBSSxNQUFNLEdBQUcsZUFBZSxDQUFDLENBQUUsMENBQTBDO1FBQ3pFLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNoQixNQUFNLElBQUksTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDaEM7UUFDRCxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksaUJBQWlCLE1BQU0sSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDekUsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplU3JjfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtjcmVhdGVJbWFnZUxvYWRlciwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJy4vaW1hZ2VfbG9hZGVyJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIGJ1aWx0LWluIEltYWdlTG9hZGVyIGZvciBDbG91ZGluYXJ5XG4gKiBhbmQgdHVybnMgaXQgaW50byBhbiBBbmd1bGFyIHByb3ZpZGVyLlxuICpcbiAqIEBwYXJhbSBwYXRoIEJhc2UgVVJMIG9mIHlvdXIgQ2xvdWRpbmFyeSBpbWFnZXNcbiAqIFRoaXMgVVJMIHNob3VsZCBtYXRjaCBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlXG4gKiBodHRwczovL215c2l0ZS5jbG91ZGluYXJ5LmNvbVxuICogaHR0cHM6Ly9zdWJkb21haW4ubXlzaXRlLmNvbVxuICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgYWxsb3dzIHRvIHByb3ZpZGUgZXh0cmEgY29uZmlndXJhdGlvbjpcbiAqIC0gYGVuc3VyZVByZWNvbm5lY3RgOiBib29sZWFuIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZVxuICogICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCB2ZXJpZnkgdGhhdCB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gXG4gKiAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VudCBpbiB0aGUgZG9jdW1lbnQncyBgPGhlYWQ+YC5cbiAqIEByZXR1cm5zIFNldCBvZiBwcm92aWRlcnMgdG8gY29uZmlndXJlIHRoZSBDbG91ZGluYXJ5IGxvYWRlci5cbiAqL1xuZXhwb3J0IGNvbnN0IHByb3ZpZGVDbG91ZGluYXJ5TG9hZGVyID0gY3JlYXRlSW1hZ2VMb2FkZXIoXG4gICAgY2xvdWRpbmFyeUxvYWRlckZhY3RvcnksXG4gICAgbmdEZXZNb2RlID9cbiAgICAgICAgW1xuICAgICAgICAgICdodHRwczovL3Jlcy5jbG91ZGluYXJ5LmNvbS9teXNpdGUnLCAnaHR0cHM6Ly9teXNpdGUuY2xvdWRpbmFyeS5jb20nLFxuICAgICAgICAgICdodHRwczovL3N1YmRvbWFpbi5teXNpdGUuY29tJ1xuICAgICAgICBdIDpcbiAgICAgICAgdW5kZWZpbmVkKTtcblxuZnVuY3Rpb24gY2xvdWRpbmFyeUxvYWRlckZhY3RvcnkocGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICAgIC8vIEV4YW1wbGUgb2YgYSBDbG91ZGluYXJ5IGltYWdlIFVSTDpcbiAgICAvLyBodHRwczovL3Jlcy5jbG91ZGluYXJ5LmNvbS9teXNpdGUvaW1hZ2UvdXBsb2FkL2Nfc2NhbGUsZl9hdXRvLHFfYXV0byx3XzYwMC9tYXJrZXRpbmcvdGlsZS10b3BpY3MtbS5wbmdcbiAgICBsZXQgcGFyYW1zID0gYGZfYXV0byxxX2F1dG9gOyAgLy8gc2V0cyBpbWFnZSBmb3JtYXQgYW5kIHF1YWxpdHkgdG8gXCJhdXRvXCJcbiAgICBpZiAoY29uZmlnLndpZHRoKSB7XG4gICAgICBwYXJhbXMgKz0gYCx3XyR7Y29uZmlnLndpZHRofWA7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IGAke3BhdGh9L2ltYWdlL3VwbG9hZC8ke3BhcmFtc30vJHtub3JtYWxpemVTcmMoY29uZmlnLnNyYyl9YDtcbiAgICByZXR1cm4gdXJsO1xuICB9O1xufVxuIl19