/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { isAbsoluteUrl, isValidPath } from '../url';
import { IMAGE_LOADER } from './image_loader';
/**
 * Name and URL tester for Netlify.
 */
export const netlifyLoaderInfo = {
    name: 'Netlify',
    testUrl: isNetlifyUrl,
};
const NETLIFY_LOADER_REGEX = /https?\:\/\/[^\/]+\.netlify\.app\/.+/;
/**
 * Tests whether a URL is from a Netlify site. This won't catch sites with a custom domain,
 * but it's a good start for sites in development. This is only used to warn users who haven't
 * configured an image loader.
 */
function isNetlifyUrl(url) {
    return NETLIFY_LOADER_REGEX.test(url);
}
/**
 * Function that generates an ImageLoader for Netlify and turns it into an Angular provider.
 *
 * @param path optional URL of the desired Netlify site. Defaults to the current site.
 * @returns Set of providers to configure the Netlify loader.
 *
 * @publicApi
 */
export function provideNetlifyLoader(path) {
    if (path && !isValidPath(path)) {
        throw new RuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, ngDevMode &&
            `Image loader has detected an invalid path (\`${path}\`). ` +
                `To fix this, supply either the full URL to the Netlify site, or leave it empty to use the current site.`);
    }
    if (path) {
        const url = new URL(path);
        path = url.origin;
    }
    const loaderFn = (config) => {
        return createNetlifyUrl(config, path);
    };
    const providers = [{ provide: IMAGE_LOADER, useValue: loaderFn }];
    return providers;
}
const validParams = new Map([
    ['height', 'h'],
    ['fit', 'fit'],
    ['quality', 'q'],
    ['q', 'q'],
    ['position', 'position'],
]);
function createNetlifyUrl(config, path) {
    // Note: `path` can be undefined, in which case we use a fake one to construct a `URL` instance.
    const url = new URL(path ?? 'https://a/');
    url.pathname = '/.netlify/images';
    if (!isAbsoluteUrl(config.src) && !config.src.startsWith('/')) {
        config.src = '/' + config.src;
    }
    url.searchParams.set('url', config.src);
    if (config.width) {
        url.searchParams.set('w', config.width.toString());
    }
    for (const [param, value] of Object.entries(config.loaderParams ?? {})) {
        if (validParams.has(param)) {
            url.searchParams.set(validParams.get(param), value.toString());
        }
        else {
            if (ngDevMode) {
                console.warn(formatRuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, `The Netlify image loader has detected an \`<img>\` tag with the unsupported attribute "\`${param}\`".`));
            }
        }
    }
    // The "a" hostname is used for relative URLs, so we can remove it from the final URL.
    return url.hostname === 'a' ? url.href.replace(url.origin, '') : url.href;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0bGlmeV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvbmV0bGlmeV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVsRCxPQUFPLEVBQUMsWUFBWSxFQUFxQyxNQUFNLGdCQUFnQixDQUFDO0FBRWhGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQW9CO0lBQ2hELElBQUksRUFBRSxTQUFTO0lBQ2YsT0FBTyxFQUFFLFlBQVk7Q0FDdEIsQ0FBQztBQUVGLE1BQU0sb0JBQW9CLEdBQUcsc0NBQXNDLENBQUM7QUFFcEU7Ozs7R0FJRztBQUNILFNBQVMsWUFBWSxDQUFDLEdBQVc7SUFDL0IsT0FBTyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsSUFBYTtJQUNoRCxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQy9CLE1BQU0sSUFBSSxZQUFZLHVEQUVwQixTQUFTO1lBQ1AsZ0RBQWdELElBQUksT0FBTztnQkFDekQseUdBQXlHLENBQzlHLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNULE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQXlCLEVBQUUsRUFBRTtRQUM3QyxPQUFPLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUM7SUFFRixNQUFNLFNBQVMsR0FBZSxDQUFDLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUM1RSxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQWlCO0lBQzFDLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztJQUNmLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztJQUNkLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQztJQUNoQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDVixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7Q0FDekIsQ0FBQyxDQUFDO0FBRUgsU0FBUyxnQkFBZ0IsQ0FBQyxNQUF5QixFQUFFLElBQWE7SUFDaEUsZ0dBQWdHO0lBQ2hHLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQztJQUMxQyxHQUFHLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDO0lBRWxDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM5RCxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXhDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELEtBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2RSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMzQixHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDZCxPQUFPLENBQUMsSUFBSSxDQUNWLGtCQUFrQix1REFFaEIsNEZBQTRGLEtBQUssTUFBTSxDQUN4RyxDQUNGLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxzRkFBc0Y7SUFDdEYsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztBQUM1RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIFByb3ZpZGVyLFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7aXNBYnNvbHV0ZVVybCwgaXNWYWxpZFBhdGh9IGZyb20gJy4uL3VybCc7XG5cbmltcG9ydCB7SU1BR0VfTE9BREVSLCBJbWFnZUxvYWRlckNvbmZpZywgSW1hZ2VMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcic7XG5cbi8qKlxuICogTmFtZSBhbmQgVVJMIHRlc3RlciBmb3IgTmV0bGlmeS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5ldGxpZnlMb2FkZXJJbmZvOiBJbWFnZUxvYWRlckluZm8gPSB7XG4gIG5hbWU6ICdOZXRsaWZ5JyxcbiAgdGVzdFVybDogaXNOZXRsaWZ5VXJsLFxufTtcblxuY29uc3QgTkVUTElGWV9MT0FERVJfUkVHRVggPSAvaHR0cHM/XFw6XFwvXFwvW15cXC9dK1xcLm5ldGxpZnlcXC5hcHBcXC8uKy87XG5cbi8qKlxuICogVGVzdHMgd2hldGhlciBhIFVSTCBpcyBmcm9tIGEgTmV0bGlmeSBzaXRlLiBUaGlzIHdvbid0IGNhdGNoIHNpdGVzIHdpdGggYSBjdXN0b20gZG9tYWluLFxuICogYnV0IGl0J3MgYSBnb29kIHN0YXJ0IGZvciBzaXRlcyBpbiBkZXZlbG9wbWVudC4gVGhpcyBpcyBvbmx5IHVzZWQgdG8gd2FybiB1c2VycyB3aG8gaGF2ZW4ndFxuICogY29uZmlndXJlZCBhbiBpbWFnZSBsb2FkZXIuXG4gKi9cbmZ1bmN0aW9uIGlzTmV0bGlmeVVybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gTkVUTElGWV9MT0FERVJfUkVHRVgudGVzdCh1cmwpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGFuIEltYWdlTG9hZGVyIGZvciBOZXRsaWZ5IGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggb3B0aW9uYWwgVVJMIG9mIHRoZSBkZXNpcmVkIE5ldGxpZnkgc2l0ZS4gRGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgc2l0ZS5cbiAqIEByZXR1cm5zIFNldCBvZiBwcm92aWRlcnMgdG8gY29uZmlndXJlIHRoZSBOZXRsaWZ5IGxvYWRlci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTmV0bGlmeUxvYWRlcihwYXRoPzogc3RyaW5nKSB7XG4gIGlmIChwYXRoICYmICFpc1ZhbGlkUGF0aChwYXRoKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfTE9BREVSX0FSR1VNRU5UUyxcbiAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICBgSW1hZ2UgbG9hZGVyIGhhcyBkZXRlY3RlZCBhbiBpbnZhbGlkIHBhdGggKFxcYCR7cGF0aH1cXGApLiBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBlaXRoZXIgdGhlIGZ1bGwgVVJMIHRvIHRoZSBOZXRsaWZ5IHNpdGUsIG9yIGxlYXZlIGl0IGVtcHR5IHRvIHVzZSB0aGUgY3VycmVudCBzaXRlLmAsXG4gICAgKTtcbiAgfVxuXG4gIGlmIChwYXRoKSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChwYXRoKTtcbiAgICBwYXRoID0gdXJsLm9yaWdpbjtcbiAgfVxuXG4gIGNvbnN0IGxvYWRlckZuID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAgICByZXR1cm4gY3JlYXRlTmV0bGlmeVVybChjb25maWcsIHBhdGgpO1xuICB9O1xuXG4gIGNvbnN0IHByb3ZpZGVyczogUHJvdmlkZXJbXSA9IFt7cHJvdmlkZTogSU1BR0VfTE9BREVSLCB1c2VWYWx1ZTogbG9hZGVyRm59XTtcbiAgcmV0dXJuIHByb3ZpZGVycztcbn1cblxuY29uc3QgdmFsaWRQYXJhbXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPihbXG4gIFsnaGVpZ2h0JywgJ2gnXSxcbiAgWydmaXQnLCAnZml0J10sXG4gIFsncXVhbGl0eScsICdxJ10sXG4gIFsncScsICdxJ10sXG4gIFsncG9zaXRpb24nLCAncG9zaXRpb24nXSxcbl0pO1xuXG5mdW5jdGlvbiBjcmVhdGVOZXRsaWZ5VXJsKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcsIHBhdGg/OiBzdHJpbmcpIHtcbiAgLy8gTm90ZTogYHBhdGhgIGNhbiBiZSB1bmRlZmluZWQsIGluIHdoaWNoIGNhc2Ugd2UgdXNlIGEgZmFrZSBvbmUgdG8gY29uc3RydWN0IGEgYFVSTGAgaW5zdGFuY2UuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwocGF0aCA/PyAnaHR0cHM6Ly9hLycpO1xuICB1cmwucGF0aG5hbWUgPSAnLy5uZXRsaWZ5L2ltYWdlcyc7XG5cbiAgaWYgKCFpc0Fic29sdXRlVXJsKGNvbmZpZy5zcmMpICYmICFjb25maWcuc3JjLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgIGNvbmZpZy5zcmMgPSAnLycgKyBjb25maWcuc3JjO1xuICB9XG5cbiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoJ3VybCcsIGNvbmZpZy5zcmMpO1xuXG4gIGlmIChjb25maWcud2lkdGgpIHtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLnNldCgndycsIGNvbmZpZy53aWR0aC50b1N0cmluZygpKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgW3BhcmFtLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZmlnLmxvYWRlclBhcmFtcyA/PyB7fSkpIHtcbiAgICBpZiAodmFsaWRQYXJhbXMuaGFzKHBhcmFtKSkge1xuICAgICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQodmFsaWRQYXJhbXMuZ2V0KHBhcmFtKSEsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfTE9BREVSX0FSR1VNRU5UUyxcbiAgICAgICAgICAgIGBUaGUgTmV0bGlmeSBpbWFnZSBsb2FkZXIgaGFzIGRldGVjdGVkIGFuIFxcYDxpbWc+XFxgIHRhZyB3aXRoIHRoZSB1bnN1cHBvcnRlZCBhdHRyaWJ1dGUgXCJcXGAke3BhcmFtfVxcYFwiLmAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gVGhlIFwiYVwiIGhvc3RuYW1lIGlzIHVzZWQgZm9yIHJlbGF0aXZlIFVSTHMsIHNvIHdlIGNhbiByZW1vdmUgaXQgZnJvbSB0aGUgZmluYWwgVVJMLlxuICByZXR1cm4gdXJsLmhvc3RuYW1lID09PSAnYScgPyB1cmwuaHJlZi5yZXBsYWNlKHVybC5vcmlnaW4sICcnKSA6IHVybC5ocmVmO1xufVxuIl19