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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRpbmFyeV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFvQixNQUFNLGdCQUFnQixDQUFDO0FBRXBFOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsaUJBQWlCLENBQ3BELG1CQUFtQixFQUNuQixTQUFTLENBQUMsQ0FBQztJQUNQO1FBQ0UsbUNBQW1DLEVBQUUsK0JBQStCO1FBQ3BFLDhCQUE4QjtLQUMvQixDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsQ0FBQztBQUVuQixTQUFTLG1CQUFtQixDQUFDLElBQVksRUFBRSxNQUF5QjtJQUNsRSxxQ0FBcUM7SUFDckMseUdBQXlHO0lBQ3pHLElBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxDQUFFLDBDQUEwQztJQUN6RSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDaEIsTUFBTSxJQUFJLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2hDO0lBQ0QsT0FBTyxHQUFHLElBQUksaUJBQWlCLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NyZWF0ZUltYWdlTG9hZGVyLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnLi9pbWFnZV9sb2FkZXInO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgYnVpbHQtaW4gSW1hZ2VMb2FkZXIgZm9yIENsb3VkaW5hcnlcbiAqIGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggQmFzZSBVUkwgb2YgeW91ciBDbG91ZGluYXJ5IGltYWdlc1xuICogVGhpcyBVUkwgc2hvdWxkIG1hdGNoIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gKiBodHRwczovL3Jlcy5jbG91ZGluYXJ5LmNvbS9teXNpdGVcbiAqIGh0dHBzOi8vbXlzaXRlLmNsb3VkaW5hcnkuY29tXG4gKiBodHRwczovL3N1YmRvbWFpbi5teXNpdGUuY29tXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBhbGxvd3MgdG8gcHJvdmlkZSBleHRyYSBjb25maWd1cmF0aW9uOlxuICogLSBgZW5zdXJlUHJlY29ubmVjdGA6IGJvb2xlYW4gZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkIHZlcmlmeSB0aGF0IHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyBgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPmBcbiAqICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW50IGluIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLlxuICogQHJldHVybnMgU2V0IG9mIHByb3ZpZGVycyB0byBjb25maWd1cmUgdGhlIENsb3VkaW5hcnkgbG9hZGVyLlxuICovXG5leHBvcnQgY29uc3QgcHJvdmlkZUNsb3VkaW5hcnlMb2FkZXIgPSBjcmVhdGVJbWFnZUxvYWRlcihcbiAgICBjcmVhdGVDbG91ZGluYXJ5VVJMLFxuICAgIG5nRGV2TW9kZSA/XG4gICAgICAgIFtcbiAgICAgICAgICAnaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlJywgJ2h0dHBzOi8vbXlzaXRlLmNsb3VkaW5hcnkuY29tJyxcbiAgICAgICAgICAnaHR0cHM6Ly9zdWJkb21haW4ubXlzaXRlLmNvbSdcbiAgICAgICAgXSA6XG4gICAgICAgIHVuZGVmaW5lZCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUNsb3VkaW5hcnlVUkwocGF0aDogc3RyaW5nLCBjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSB7XG4gIC8vIEV4YW1wbGUgb2YgYSBDbG91ZGluYXJ5IGltYWdlIFVSTDpcbiAgLy8gaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbXlzaXRlL2ltYWdlL3VwbG9hZC9jX3NjYWxlLGZfYXV0byxxX2F1dG8sd182MDAvbWFya2V0aW5nL3RpbGUtdG9waWNzLW0ucG5nXG4gIGxldCBwYXJhbXMgPSBgZl9hdXRvLHFfYXV0b2A7ICAvLyBzZXRzIGltYWdlIGZvcm1hdCBhbmQgcXVhbGl0eSB0byBcImF1dG9cIlxuICBpZiAoY29uZmlnLndpZHRoKSB7XG4gICAgcGFyYW1zICs9IGAsd18ke2NvbmZpZy53aWR0aH1gO1xuICB9XG4gIHJldHVybiBgJHtwYXRofS9pbWFnZS91cGxvYWQvJHtwYXJhbXN9LyR7Y29uZmlnLnNyY31gO1xufVxuIl19