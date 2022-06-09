/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵRuntimeError as RuntimeError } from '@angular/core';
import { PRECONNECT_CHECK_BLOCKLIST } from '../preconnect_link_checker';
import { isValidPath, normalizePath, normalizeSrc } from '../util';
import { IMAGE_LOADER } from './image_loader';
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
export function provideCloudinaryLoader(path, options = {
    ensurePreconnect: true
}) {
    if (ngDevMode && !isValidPath(path)) {
        throwInvalidPathError(path);
    }
    path = normalizePath(path);
    const providers = [{
            provide: IMAGE_LOADER,
            useValue: (config) => {
                // Example of a Cloudinary image URL:
                // https://res.cloudinary.com/mysite/image/upload/c_scale,f_auto,q_auto,w_600/marketing/tile-topics-m.png
                let params = `f_auto,q_auto`; // sets image format and quality to "auto"
                if (config.width) {
                    params += `,w_${config.width}`;
                }
                const url = `${path}/image/upload/${params}/${normalizeSrc(config.src)}`;
                return url;
            }
        }];
    if (ngDevMode && Boolean(options.ensurePreconnect) === true) {
        providers.push({
            provide: PRECONNECT_CHECK_BLOCKLIST,
            useValue: [path],
            multi: true,
        });
    }
    return providers;
}
function throwInvalidPathError(path) {
    throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `CloudinaryLoader has detected an invalid path: ` +
        `expecting a path matching one of the following formats: https://res.cloudinary.com/mysite, https://mysite.cloudinary.com, or https://subdomain.mysite.com - ` +
        `but got: \`${path}\``);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRpbmFyeV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFXLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHdEUsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDdEUsT0FBTyxFQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRWpFLE9BQU8sRUFBQyxZQUFZLEVBQW9CLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0Q7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsSUFBWSxFQUFFLFVBQXdDO0lBQzVGLGdCQUFnQixFQUFFLElBQUk7Q0FDdkI7SUFDQyxJQUFJLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNuQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM3QjtJQUNELElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFM0IsTUFBTSxTQUFTLEdBQWUsQ0FBQztZQUM3QixPQUFPLEVBQUUsWUFBWTtZQUNyQixRQUFRLEVBQUUsQ0FBQyxNQUF5QixFQUFFLEVBQUU7Z0JBQ3RDLHFDQUFxQztnQkFDckMseUdBQXlHO2dCQUN6RyxJQUFJLE1BQU0sR0FBRyxlQUFlLENBQUMsQ0FBRSwwQ0FBMEM7Z0JBQ3pFLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtvQkFDaEIsTUFBTSxJQUFJLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUNoQztnQkFDRCxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksaUJBQWlCLE1BQU0sSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pFLE9BQU8sR0FBRyxDQUFDO1lBQ2IsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUVILElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDM0QsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNiLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO0tBQ0o7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxJQUFhO0lBQzFDLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixpREFBaUQ7UUFDN0MsOEpBQThKO1FBQzlKLGNBQWMsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UHJvdmlkZXIsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7UFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1R9IGZyb20gJy4uL3ByZWNvbm5lY3RfbGlua19jaGVja2VyJztcbmltcG9ydCB7aXNWYWxpZFBhdGgsIG5vcm1hbGl6ZVBhdGgsIG5vcm1hbGl6ZVNyY30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnLi9pbWFnZV9sb2FkZXInO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgYnVpbHQtaW4gSW1hZ2VMb2FkZXIgZm9yIENsb3VkaW5hcnlcbiAqIGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggQmFzZSBVUkwgb2YgeW91ciBDbG91ZGluYXJ5IGltYWdlc1xuICogVGhpcyBVUkwgc2hvdWxkIG1hdGNoIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gKiBodHRwczovL3Jlcy5jbG91ZGluYXJ5LmNvbS9teXNpdGVcbiAqIGh0dHBzOi8vbXlzaXRlLmNsb3VkaW5hcnkuY29tXG4gKiBodHRwczovL3N1YmRvbWFpbi5teXNpdGUuY29tXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBhbGxvd3MgdG8gcHJvdmlkZSBleHRyYSBjb25maWd1cmF0aW9uOlxuICogLSBgZW5zdXJlUHJlY29ubmVjdGA6IGJvb2xlYW4gZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkIHZlcmlmeSB0aGF0IHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyBgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPmBcbiAqICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW50IGluIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLlxuICogQHJldHVybnMgU2V0IG9mIHByb3ZpZGVycyB0byBjb25maWd1cmUgdGhlIENsb3VkaW5hcnkgbG9hZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUNsb3VkaW5hcnlMb2FkZXIocGF0aDogc3RyaW5nLCBvcHRpb25zOiB7ZW5zdXJlUHJlY29ubmVjdD86IGJvb2xlYW59ID0ge1xuICBlbnN1cmVQcmVjb25uZWN0OiB0cnVlXG59KTogUHJvdmlkZXJbXSB7XG4gIGlmIChuZ0Rldk1vZGUgJiYgIWlzVmFsaWRQYXRoKHBhdGgpKSB7XG4gICAgdGhyb3dJbnZhbGlkUGF0aEVycm9yKHBhdGgpO1xuICB9XG4gIHBhdGggPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuXG4gIGNvbnN0IHByb3ZpZGVyczogUHJvdmlkZXJbXSA9IFt7XG4gICAgcHJvdmlkZTogSU1BR0VfTE9BREVSLFxuICAgIHVzZVZhbHVlOiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICAgICAgLy8gRXhhbXBsZSBvZiBhIENsb3VkaW5hcnkgaW1hZ2UgVVJMOlxuICAgICAgLy8gaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlL2ltYWdlL3VwbG9hZC9jX3NjYWxlLGZfYXV0byxxX2F1dG8sd182MDAvbWFya2V0aW5nL3RpbGUtdG9waWNzLW0ucG5nXG4gICAgICBsZXQgcGFyYW1zID0gYGZfYXV0byxxX2F1dG9gOyAgLy8gc2V0cyBpbWFnZSBmb3JtYXQgYW5kIHF1YWxpdHkgdG8gXCJhdXRvXCJcbiAgICAgIGlmIChjb25maWcud2lkdGgpIHtcbiAgICAgICAgcGFyYW1zICs9IGAsd18ke2NvbmZpZy53aWR0aH1gO1xuICAgICAgfVxuICAgICAgY29uc3QgdXJsID0gYCR7cGF0aH0vaW1hZ2UvdXBsb2FkLyR7cGFyYW1zfS8ke25vcm1hbGl6ZVNyYyhjb25maWcuc3JjKX1gO1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gIH1dO1xuXG4gIGlmIChuZ0Rldk1vZGUgJiYgQm9vbGVhbihvcHRpb25zLmVuc3VyZVByZWNvbm5lY3QpID09PSB0cnVlKSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe1xuICAgICAgcHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsXG4gICAgICB1c2VWYWx1ZTogW3BhdGhdLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcHJvdmlkZXJzO1xufVxuXG5mdW5jdGlvbiB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aDogdW5rbm93bik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGBDbG91ZGluYXJ5TG9hZGVyIGhhcyBkZXRlY3RlZCBhbiBpbnZhbGlkIHBhdGg6IGAgK1xuICAgICAgICAgIGBleHBlY3RpbmcgYSBwYXRoIG1hdGNoaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6IGh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL215c2l0ZSwgaHR0cHM6Ly9teXNpdGUuY2xvdWRpbmFyeS5jb20sIG9yIGh0dHBzOi8vc3ViZG9tYWluLm15c2l0ZS5jb20gLSBgICtcbiAgICAgICAgICBgYnV0IGdvdDogXFxgJHtwYXRofVxcYGApO1xufVxuIl19