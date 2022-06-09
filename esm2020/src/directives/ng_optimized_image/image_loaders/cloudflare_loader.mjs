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
 * Function that generates a built-in ImageLoader for Cloudflare Image Resizing
 * and turns it into an Angular provider. Note: Cloudflare has multiple image
 * products - this provider is specifically for Cloudflare Image Resizing;
 * it will not work with Cloudflare Images or Cloudflare Polish.
 *
 * @param path Your domain name
 * e.g. https://mysite.com
 * @returns Provider that provides an ImageLoader function
 */
export function provideCloudflareLoader(path, options = {
    ensurePreconnect: true
}) {
    if (ngDevMode && !isValidPath(path)) {
        throwInvalidPathError(path);
    }
    path = normalizePath(path);
    const providers = [{
            provide: IMAGE_LOADER,
            useValue: (config) => {
                let params = `format=auto`;
                if (config.width) {
                    params += `,width=${config.width.toString()}`;
                }
                const url = `${path}/cdn-cgi/image/${params}/${normalizeSrc(config.src)}`;
                return url;
            }
        }];
    if (ngDevMode && Boolean(options.ensurePreconnect) === true) {
        providers.push({ provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [path], multi: true });
    }
    return providers;
}
function throwInvalidPathError(path) {
    throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `CloudflareLoader has detected an invalid path: ` +
        `expecting a path like https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>` +
        `but got: \`${path}\``);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRmbGFyZV9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL2ltYWdlX2xvYWRlcnMvY2xvdWRmbGFyZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFXLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHdEUsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDdEUsT0FBTyxFQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRWpFLE9BQU8sRUFBQyxZQUFZLEVBQW9CLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0Q7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUFDLElBQVksRUFBRSxVQUF3QztJQUM1RixnQkFBZ0IsRUFBRSxJQUFJO0NBQ3ZCO0lBQ0MsSUFBSSxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbkMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTNCLE1BQU0sU0FBUyxHQUFlLENBQUM7WUFDN0IsT0FBTyxFQUFFLFlBQVk7WUFDckIsUUFBUSxFQUFFLENBQUMsTUFBeUIsRUFBRSxFQUFFO2dCQUN0QyxJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUM7Z0JBQzNCLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtvQkFDaEIsTUFBTSxJQUFJLFVBQVUsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2lCQUMvQztnQkFDRCxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksa0JBQWtCLE1BQU0sSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFFLE9BQU8sR0FBRyxDQUFDO1lBQ2IsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUVILElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDM0QsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztLQUN0RjtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWE7SUFDMUMsTUFBTSxJQUFJLFlBQVksNENBRWxCLGlEQUFpRDtRQUM3Qyw2RUFBNkU7UUFDN0UsY0FBYyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQcm92aWRlciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVH0gZnJvbSAnLi4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtpc1ZhbGlkUGF0aCwgbm9ybWFsaXplUGF0aCwgbm9ybWFsaXplU3JjfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICcuL2ltYWdlX2xvYWRlcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYSBidWlsdC1pbiBJbWFnZUxvYWRlciBmb3IgQ2xvdWRmbGFyZSBJbWFnZSBSZXNpemluZ1xuICogYW5kIHR1cm5zIGl0IGludG8gYW4gQW5ndWxhciBwcm92aWRlci4gTm90ZTogQ2xvdWRmbGFyZSBoYXMgbXVsdGlwbGUgaW1hZ2VcbiAqIHByb2R1Y3RzIC0gdGhpcyBwcm92aWRlciBpcyBzcGVjaWZpY2FsbHkgZm9yIENsb3VkZmxhcmUgSW1hZ2UgUmVzaXppbmc7XG4gKiBpdCB3aWxsIG5vdCB3b3JrIHdpdGggQ2xvdWRmbGFyZSBJbWFnZXMgb3IgQ2xvdWRmbGFyZSBQb2xpc2guXG4gKlxuICogQHBhcmFtIHBhdGggWW91ciBkb21haW4gbmFtZVxuICogZS5nLiBodHRwczovL215c2l0ZS5jb21cbiAqIEByZXR1cm5zIFByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgYW4gSW1hZ2VMb2FkZXIgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVDbG91ZGZsYXJlTG9hZGVyKHBhdGg6IHN0cmluZywgb3B0aW9uczoge2Vuc3VyZVByZWNvbm5lY3Q/OiBib29sZWFufSA9IHtcbiAgZW5zdXJlUHJlY29ubmVjdDogdHJ1ZVxufSkge1xuICBpZiAobmdEZXZNb2RlICYmICFpc1ZhbGlkUGF0aChwYXRoKSkge1xuICAgIHRocm93SW52YWxpZFBhdGhFcnJvcihwYXRoKTtcbiAgfVxuICBwYXRoID0gbm9ybWFsaXplUGF0aChwYXRoKTtcblxuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbe1xuICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAgICB1c2VWYWx1ZTogKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAgICAgIGxldCBwYXJhbXMgPSBgZm9ybWF0PWF1dG9gO1xuICAgICAgaWYgKGNvbmZpZy53aWR0aCkge1xuICAgICAgICBwYXJhbXMgKz0gYCx3aWR0aD0ke2NvbmZpZy53aWR0aC50b1N0cmluZygpfWA7XG4gICAgICB9XG4gICAgICBjb25zdCB1cmwgPSBgJHtwYXRofS9jZG4tY2dpL2ltYWdlLyR7cGFyYW1zfS8ke25vcm1hbGl6ZVNyYyhjb25maWcuc3JjKX1gO1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gIH1dO1xuXG4gIGlmIChuZ0Rldk1vZGUgJiYgQm9vbGVhbihvcHRpb25zLmVuc3VyZVByZWNvbm5lY3QpID09PSB0cnVlKSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULCB1c2VWYWx1ZTogW3BhdGhdLCBtdWx0aTogdHJ1ZX0pO1xuICB9XG5cbiAgcmV0dXJuIHByb3ZpZGVycztcbn1cblxuZnVuY3Rpb24gdGhyb3dJbnZhbGlkUGF0aEVycm9yKHBhdGg6IHVua25vd24pOiBuZXZlciB7XG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgQ2xvdWRmbGFyZUxvYWRlciBoYXMgZGV0ZWN0ZWQgYW4gaW52YWxpZCBwYXRoOiBgICtcbiAgICAgICAgICBgZXhwZWN0aW5nIGEgcGF0aCBsaWtlIGh0dHBzOi8vPFpPTkU+L2Nkbi1jZ2kvaW1hZ2UvPE9QVElPTlM+LzxTT1VSQ0UtSU1BR0U+YCArXG4gICAgICAgICAgYGJ1dCBnb3Q6IFxcYCR7cGF0aH1cXGBgKTtcbn1cbiJdfQ==