/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
 *
 * @publicApi
 * @developerPreview
 */
export const provideCloudinaryLoader = createImageLoader(createCloudinaryURL, ngDevMode ?
    [
        'https://res.cloudinary.com/mysite', 'https://mysite.cloudinary.com',
        'https://subdomain.mysite.com'
    ] :
    undefined);
function createCloudinaryURL(path, config) {
    // Example of a Cloudinary image URL:
    // https://res.cloudinary.com/mysite/image/upload/c_scale,f_auto,q_auto,w_600/marketing/tile-topics-m.png
    let params = `f_auto,q_auto`; // sets image format and quality to "auto"
    if (config.width) {
        params += `,w_${config.width}`;
    }
    return `${path}/image/upload/${params}/${config.src}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRpbmFyeV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFvQixNQUFNLGdCQUFnQixDQUFDO0FBRXBFOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUNwRCxtQkFBbUIsRUFDbkIsU0FBUyxDQUFDLENBQUM7SUFDUDtRQUNFLG1DQUFtQyxFQUFFLCtCQUErQjtRQUNwRSw4QkFBOEI7S0FDL0IsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLENBQUM7QUFFbkIsU0FBUyxtQkFBbUIsQ0FBQyxJQUFZLEVBQUUsTUFBeUI7SUFDbEUscUNBQXFDO0lBQ3JDLHlHQUF5RztJQUN6RyxJQUFJLE1BQU0sR0FBRyxlQUFlLENBQUMsQ0FBRSwwQ0FBMEM7SUFDekUsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1FBQ2hCLE1BQU0sSUFBSSxNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNoQztJQUNELE9BQU8sR0FBRyxJQUFJLGlCQUFpQixNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjcmVhdGVJbWFnZUxvYWRlciwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJy4vaW1hZ2VfbG9hZGVyJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIGJ1aWx0LWluIEltYWdlTG9hZGVyIGZvciBDbG91ZGluYXJ5XG4gKiBhbmQgdHVybnMgaXQgaW50byBhbiBBbmd1bGFyIHByb3ZpZGVyLlxuICpcbiAqIEBwYXJhbSBwYXRoIEJhc2UgVVJMIG9mIHlvdXIgQ2xvdWRpbmFyeSBpbWFnZXNcbiAqIFRoaXMgVVJMIHNob3VsZCBtYXRjaCBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlXG4gKiBodHRwczovL215c2l0ZS5jbG91ZGluYXJ5LmNvbVxuICogaHR0cHM6Ly9zdWJkb21haW4ubXlzaXRlLmNvbVxuICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IHRoYXQgYWxsb3dzIHRvIHByb3ZpZGUgZXh0cmEgY29uZmlndXJhdGlvbjpcbiAqIC0gYGVuc3VyZVByZWNvbm5lY3RgOiBib29sZWFuIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZVxuICogICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCB2ZXJpZnkgdGhhdCB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgYDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIj5gXG4gKiAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VudCBpbiB0aGUgZG9jdW1lbnQncyBgPGhlYWQ+YC5cbiAqIEByZXR1cm5zIFNldCBvZiBwcm92aWRlcnMgdG8gY29uZmlndXJlIHRoZSBDbG91ZGluYXJ5IGxvYWRlci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5leHBvcnQgY29uc3QgcHJvdmlkZUNsb3VkaW5hcnlMb2FkZXIgPSBjcmVhdGVJbWFnZUxvYWRlcihcbiAgICBjcmVhdGVDbG91ZGluYXJ5VVJMLFxuICAgIG5nRGV2TW9kZSA/XG4gICAgICAgIFtcbiAgICAgICAgICAnaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlJywgJ2h0dHBzOi8vbXlzaXRlLmNsb3VkaW5hcnkuY29tJyxcbiAgICAgICAgICAnaHR0cHM6Ly9zdWJkb21haW4ubXlzaXRlLmNvbSdcbiAgICAgICAgXSA6XG4gICAgICAgIHVuZGVmaW5lZCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUNsb3VkaW5hcnlVUkwocGF0aDogc3RyaW5nLCBjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSB7XG4gIC8vIEV4YW1wbGUgb2YgYSBDbG91ZGluYXJ5IGltYWdlIFVSTDpcbiAgLy8gaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlL2ltYWdlL3VwbG9hZC9jX3NjYWxlLGZfYXV0byxxX2F1dG8sd182MDAvbWFya2V0aW5nL3RpbGUtdG9waWNzLW0ucG5nXG4gIGxldCBwYXJhbXMgPSBgZl9hdXRvLHFfYXV0b2A7ICAvLyBzZXRzIGltYWdlIGZvcm1hdCBhbmQgcXVhbGl0eSB0byBcImF1dG9cIlxuICBpZiAoY29uZmlnLndpZHRoKSB7XG4gICAgcGFyYW1zICs9IGAsd18ke2NvbmZpZy53aWR0aH1gO1xuICB9XG4gIHJldHVybiBgJHtwYXRofS9pbWFnZS91cGxvYWQvJHtwYXJhbXN9LyR7Y29uZmlnLnNyY31gO1xufVxuIl19