/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PLACEHOLDER_QUALITY } from './constants';
import { createImageLoader } from './image_loader';
/**
 * Function that generates an ImageLoader for [Cloudflare Image
 * Resizing](https://developers.cloudflare.com/images/image-resizing/) and turns it into an Angular
 * provider. Note: Cloudflare has multiple image products - this provider is specifically for
 * Cloudflare Image Resizing; it will not work with Cloudflare Images or Cloudflare Polish.
 *
 * @param path Your domain name, e.g. https://mysite.com
 * @returns Provider that provides an ImageLoader function
 *
 * @publicApi
 */
export const provideCloudflareLoader = createImageLoader(createCloudflareUrl, ngDevMode ? ['https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>'] : undefined);
function createCloudflareUrl(path, config) {
    let params = `format=auto`;
    if (config.width) {
        params += `,width=${config.width}`;
    }
    // When requesting a placeholder image we ask for a low quality image to reduce the load time.
    if (config.isPlaceholder) {
        params += `,quality=${PLACEHOLDER_QUALITY}`;
    }
    // Cloudflare image URLs format:
    // https://developers.cloudflare.com/images/image-resizing/url-format/
    return `${path}/cdn-cgi/image/${params}/${config.src}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRmbGFyZV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvY2xvdWRmbGFyZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ2hELE9BQU8sRUFBQyxpQkFBaUIsRUFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRTs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsaUJBQWlCLENBQ3RELG1CQUFtQixFQUNuQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsdURBQXVELENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUNsRixDQUFDO0FBRUYsU0FBUyxtQkFBbUIsQ0FBQyxJQUFZLEVBQUUsTUFBeUI7SUFDbEUsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDO0lBQzNCLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLE1BQU0sSUFBSSxVQUFVLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsOEZBQThGO0lBQzlGLElBQUksTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sSUFBSSxZQUFZLG1CQUFtQixFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVELGdDQUFnQztJQUNoQyxzRUFBc0U7SUFDdEUsT0FBTyxHQUFHLElBQUksa0JBQWtCLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BMQUNFSE9MREVSX1FVQUxJVFl9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y3JlYXRlSW1hZ2VMb2FkZXIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICcuL2ltYWdlX2xvYWRlcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYW4gSW1hZ2VMb2FkZXIgZm9yIFtDbG91ZGZsYXJlIEltYWdlXG4gKiBSZXNpemluZ10oaHR0cHM6Ly9kZXZlbG9wZXJzLmNsb3VkZmxhcmUuY29tL2ltYWdlcy9pbWFnZS1yZXNpemluZy8pIGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXJcbiAqIHByb3ZpZGVyLiBOb3RlOiBDbG91ZGZsYXJlIGhhcyBtdWx0aXBsZSBpbWFnZSBwcm9kdWN0cyAtIHRoaXMgcHJvdmlkZXIgaXMgc3BlY2lmaWNhbGx5IGZvclxuICogQ2xvdWRmbGFyZSBJbWFnZSBSZXNpemluZzsgaXQgd2lsbCBub3Qgd29yayB3aXRoIENsb3VkZmxhcmUgSW1hZ2VzIG9yIENsb3VkZmxhcmUgUG9saXNoLlxuICpcbiAqIEBwYXJhbSBwYXRoIFlvdXIgZG9tYWluIG5hbWUsIGUuZy4gaHR0cHM6Ly9teXNpdGUuY29tXG4gKiBAcmV0dXJucyBQcm92aWRlciB0aGF0IHByb3ZpZGVzIGFuIEltYWdlTG9hZGVyIGZ1bmN0aW9uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgcHJvdmlkZUNsb3VkZmxhcmVMb2FkZXIgPSBjcmVhdGVJbWFnZUxvYWRlcihcbiAgY3JlYXRlQ2xvdWRmbGFyZVVybCxcbiAgbmdEZXZNb2RlID8gWydodHRwczovLzxaT05FPi9jZG4tY2dpL2ltYWdlLzxPUFRJT05TPi88U09VUkNFLUlNQUdFPiddIDogdW5kZWZpbmVkLFxuKTtcblxuZnVuY3Rpb24gY3JlYXRlQ2xvdWRmbGFyZVVybChwYXRoOiBzdHJpbmcsIGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpIHtcbiAgbGV0IHBhcmFtcyA9IGBmb3JtYXQ9YXV0b2A7XG4gIGlmIChjb25maWcud2lkdGgpIHtcbiAgICBwYXJhbXMgKz0gYCx3aWR0aD0ke2NvbmZpZy53aWR0aH1gO1xuICB9XG5cbiAgLy8gV2hlbiByZXF1ZXN0aW5nIGEgcGxhY2Vob2xkZXIgaW1hZ2Ugd2UgYXNrIGZvciBhIGxvdyBxdWFsaXR5IGltYWdlIHRvIHJlZHVjZSB0aGUgbG9hZCB0aW1lLlxuICBpZiAoY29uZmlnLmlzUGxhY2Vob2xkZXIpIHtcbiAgICBwYXJhbXMgKz0gYCxxdWFsaXR5PSR7UExBQ0VIT0xERVJfUVVBTElUWX1gO1xuICB9XG5cbiAgLy8gQ2xvdWRmbGFyZSBpbWFnZSBVUkxzIGZvcm1hdDpcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmNsb3VkZmxhcmUuY29tL2ltYWdlcy9pbWFnZS1yZXNpemluZy91cmwtZm9ybWF0L1xuICByZXR1cm4gYCR7cGF0aH0vY2RuLWNnaS9pbWFnZS8ke3BhcmFtc30vJHtjb25maWcuc3JjfWA7XG59XG4iXX0=