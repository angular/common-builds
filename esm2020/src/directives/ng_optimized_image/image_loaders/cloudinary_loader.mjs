/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵRuntimeError as RuntimeError } from '@angular/core';
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
export const provideCloudinaryLoader = createImageLoader(cloudinaryLoaderFactory, throwInvalidPathError);
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
function throwInvalidPathError(path) {
    throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `CloudinaryLoader has detected an invalid path: ` +
        `expecting a path matching one of the following formats: https://res.cloudinary.com/mysite, https://mysite.cloudinary.com, or https://subdomain.mysite.com - ` +
        `but got: \`${path}\``);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRpbmFyeV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHNUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVyQyxPQUFPLEVBQUMsaUJBQWlCLEVBQW9CLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEU7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FDaEMsaUJBQWlCLENBQUMsdUJBQXVCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUV0RSxTQUFTLHVCQUF1QixDQUFDLElBQVk7SUFDM0MsT0FBTyxDQUFDLE1BQXlCLEVBQUUsRUFBRTtRQUNuQyxxQ0FBcUM7UUFDckMseUdBQXlHO1FBQ3pHLElBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxDQUFFLDBDQUEwQztRQUN6RSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDaEIsTUFBTSxJQUFJLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2hDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLGlCQUFpQixNQUFNLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3pFLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsSUFBYTtJQUMxQyxNQUFNLElBQUksWUFBWSw0Q0FFbEIsaURBQWlEO1FBQzdDLDhKQUE4SjtRQUM5SixjQUFjLElBQUksSUFBSSxDQUFDLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7bm9ybWFsaXplU3JjfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtjcmVhdGVJbWFnZUxvYWRlciwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJy4vaW1hZ2VfbG9hZGVyJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIGJ1aWx0LWluIEltYWdlTG9hZGVyIGZvciBDbG91ZGluYXJ5XG4gKiBhbmQgdHVybnMgaXQgaW50byBhbiBBbmd1bGFyIHByb3ZpZGVyLlxuICpcbiAqIEBwYXJhbSBwYXRoIEJhc2UgVVJMIG9mIHlvdXIgQ2xvdWRpbmFyeSBpbWFnZXNcbiAqIFRoaXMgVVJMIHNob3VsZCBtYXRjaCBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlXG4gKiBodHRwczovL215c2l0ZS5jbG91ZGluYXJ5LmNvbVxuICogaHR0cHM6Ly9zdWJkb21haW4ubXlzaXRlLmNvbVxuICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgYWxsb3dzIHRvIHByb3ZpZGUgZXh0cmEgY29uZmlndXJhdGlvbjpcbiAqIC0gYGVuc3VyZVByZWNvbm5lY3RgOiBib29sZWFuIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZVxuICogICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCB2ZXJpZnkgdGhhdCB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gXG4gKiAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VudCBpbiB0aGUgZG9jdW1lbnQncyBgPGhlYWQ+YC5cbiAqIEByZXR1cm5zIFNldCBvZiBwcm92aWRlcnMgdG8gY29uZmlndXJlIHRoZSBDbG91ZGluYXJ5IGxvYWRlci5cbiAqL1xuZXhwb3J0IGNvbnN0IHByb3ZpZGVDbG91ZGluYXJ5TG9hZGVyID1cbiAgICBjcmVhdGVJbWFnZUxvYWRlcihjbG91ZGluYXJ5TG9hZGVyRmFjdG9yeSwgdGhyb3dJbnZhbGlkUGF0aEVycm9yKTtcblxuZnVuY3Rpb24gY2xvdWRpbmFyeUxvYWRlckZhY3RvcnkocGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICAgIC8vIEV4YW1wbGUgb2YgYSBDbG91ZGluYXJ5IGltYWdlIFVSTDpcbiAgICAvLyBodHRwczovL3Jlcy5jbG91ZGluYXJ5LmNvbS9teXNpdGUvaW1hZ2UvdXBsb2FkL2Nfc2NhbGUsZl9hdXRvLHFfYXV0byx3XzYwMC9tYXJrZXRpbmcvdGlsZS10b3BpY3MtbS5wbmdcbiAgICBsZXQgcGFyYW1zID0gYGZfYXV0byxxX2F1dG9gOyAgLy8gc2V0cyBpbWFnZSBmb3JtYXQgYW5kIHF1YWxpdHkgdG8gXCJhdXRvXCJcbiAgICBpZiAoY29uZmlnLndpZHRoKSB7XG4gICAgICBwYXJhbXMgKz0gYCx3XyR7Y29uZmlnLndpZHRofWA7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IGAke3BhdGh9L2ltYWdlL3VwbG9hZC8ke3BhcmFtc30vJHtub3JtYWxpemVTcmMoY29uZmlnLnNyYyl9YDtcbiAgICByZXR1cm4gdXJsO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aDogdW5rbm93bik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGBDbG91ZGluYXJ5TG9hZGVyIGhhcyBkZXRlY3RlZCBhbiBpbnZhbGlkIHBhdGg6IGAgK1xuICAgICAgICAgIGBleHBlY3RpbmcgYSBwYXRoIG1hdGNoaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6IGh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL215c2l0ZSwgaHR0cHM6Ly9teXNpdGUuY2xvdWRpbmFyeS5jb20sIG9yIGh0dHBzOi8vc3ViZG9tYWluLm15c2l0ZS5jb20gLSBgICtcbiAgICAgICAgICBgYnV0IGdvdDogXFxgJHtwYXRofVxcYGApO1xufVxuIl19