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
export function provideImageKitLoader(path, options = {
    ensurePreconnect: true
}) {
    if (ngDevMode && !isValidPath(path)) {
        throwInvalidPathError(path);
    }
    path = normalizePath(path);
    const providers = [{
            provide: IMAGE_LOADER,
            useValue: (config) => {
                // Example of an ImageKit image URL:
                // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
                let params = `tr:q-auto`; // applies the "auto quality" transformation
                if (config.width) {
                    params += `,w-${config.width?.toString()}`;
                }
                const url = `${path}/${params}/${normalizeSrc(config.src)}`;
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
    throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `ImageKitLoader has detected an invalid path: ` +
        `expecting a path matching one of the following formats: https://ik.imagekit.io/mysite or https://subdomain.mysite.com - ` +
        `but got: \`${path}\``);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VraXRfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQVcsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd0RSxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFakUsT0FBTyxFQUFDLFlBQVksRUFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUFDLElBQVksRUFBRSxVQUF3QztJQUMxRixnQkFBZ0IsRUFBRSxJQUFJO0NBQ3ZCO0lBQ0MsSUFBSSxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbkMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTNCLE1BQU0sU0FBUyxHQUFlLENBQUM7WUFDN0IsT0FBTyxFQUFFLFlBQVk7WUFDckIsUUFBUSxFQUFFLENBQUMsTUFBeUIsRUFBRSxFQUFFO2dCQUN0QyxvQ0FBb0M7Z0JBQ3BDLHNFQUFzRTtnQkFDdEUsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLENBQUUsNENBQTRDO2dCQUN2RSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7b0JBQ2hCLE1BQU0sSUFBSSxNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztpQkFDNUM7Z0JBQ0QsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksTUFBTSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDNUQsT0FBTyxHQUFHLENBQUM7WUFDYixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBRUgsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUMzRCxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2IsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDaEIsS0FBSyxFQUFFLElBQUk7U0FDWixDQUFDLENBQUM7S0FDSjtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWE7SUFDMUMsTUFBTSxJQUFJLFlBQVksNENBRWxCLCtDQUErQztRQUMzQywwSEFBMEg7UUFDMUgsY0FBYyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQcm92aWRlciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVH0gZnJvbSAnLi4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtpc1ZhbGlkUGF0aCwgbm9ybWFsaXplUGF0aCwgbm9ybWFsaXplU3JjfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICcuL2ltYWdlX2xvYWRlcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYSBidWlsdC1pbiBJbWFnZUxvYWRlciBmb3IgSW1hZ2VLaXRcbiAqIGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggQmFzZSBVUkwgb2YgeW91ciBJbWFnZUtpdCBpbWFnZXNcbiAqIFRoaXMgVVJMIHNob3VsZCBtYXRjaCBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogaHR0cHM6Ly9pay5pbWFnZWtpdC5pby9teWFjY291bnRcbiAqIGh0dHBzOi8vc3ViZG9tYWluLm15c2l0ZS5jb21cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9iamVjdCB0aGF0IGFsbG93cyB0byBwcm92aWRlIGV4dHJhIGNvbmZpZ3VyYXRpb246XG4gKiAtIGBlbnN1cmVQcmVjb25uZWN0YDogYm9vbGVhbiBmbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmVcbiAqICAgICAgICAgICAgICAgICAgICAgICBzaG91bGQgdmVyaWZ5IHRoYXQgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIGA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+YFxuICogICAgICAgICAgICAgICAgICAgICAgIHByZXNlbnQgaW4gdGhlIGRvY3VtZW50J3MgYDxoZWFkPmAuXG4gKiBAcmV0dXJucyBTZXQgb2YgcHJvdmlkZXJzIHRvIGNvbmZpZ3VyZSB0aGUgSW1hZ2VLaXQgbG9hZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUltYWdlS2l0TG9hZGVyKHBhdGg6IHN0cmluZywgb3B0aW9uczoge2Vuc3VyZVByZWNvbm5lY3Q/OiBib29sZWFufSA9IHtcbiAgZW5zdXJlUHJlY29ubmVjdDogdHJ1ZVxufSk6IFByb3ZpZGVyW10ge1xuICBpZiAobmdEZXZNb2RlICYmICFpc1ZhbGlkUGF0aChwYXRoKSkge1xuICAgIHRocm93SW52YWxpZFBhdGhFcnJvcihwYXRoKTtcbiAgfVxuICBwYXRoID0gbm9ybWFsaXplUGF0aChwYXRoKTtcblxuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbe1xuICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAgICB1c2VWYWx1ZTogKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAgICAgIC8vIEV4YW1wbGUgb2YgYW4gSW1hZ2VLaXQgaW1hZ2UgVVJMOlxuICAgICAgLy8gaHR0cHM6Ly9pay5pbWFnZWtpdC5pby9kZW1vL3RyOnctMzAwLGgtMzAwL21lZGl1bV9jYWZlX0IxaVRkRDBDLmpwZ1xuICAgICAgbGV0IHBhcmFtcyA9IGB0cjpxLWF1dG9gOyAgLy8gYXBwbGllcyB0aGUgXCJhdXRvIHF1YWxpdHlcIiB0cmFuc2Zvcm1hdGlvblxuICAgICAgaWYgKGNvbmZpZy53aWR0aCkge1xuICAgICAgICBwYXJhbXMgKz0gYCx3LSR7Y29uZmlnLndpZHRoPy50b1N0cmluZygpfWA7XG4gICAgICB9XG4gICAgICBjb25zdCB1cmwgPSBgJHtwYXRofS8ke3BhcmFtc30vJHtub3JtYWxpemVTcmMoY29uZmlnLnNyYyl9YDtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICB9XTtcblxuICBpZiAobmdEZXZNb2RlICYmIEJvb2xlYW4ob3B0aW9ucy5lbnN1cmVQcmVjb25uZWN0KSA9PT0gdHJ1ZSkge1xuICAgIHByb3ZpZGVycy5wdXNoKHtcbiAgICAgIHByb3ZpZGU6IFBSRUNPTk5FQ1RfQ0hFQ0tfQkxPQ0tMSVNULFxuICAgICAgdXNlVmFsdWU6IFtwYXRoXSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHByb3ZpZGVycztcbn1cblxuZnVuY3Rpb24gdGhyb3dJbnZhbGlkUGF0aEVycm9yKHBhdGg6IHVua25vd24pOiBuZXZlciB7XG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgSW1hZ2VLaXRMb2FkZXIgaGFzIGRldGVjdGVkIGFuIGludmFsaWQgcGF0aDogYCArXG4gICAgICAgICAgYGV4cGVjdGluZyBhIHBhdGggbWF0Y2hpbmcgb25lIG9mIHRoZSBmb2xsb3dpbmcgZm9ybWF0czogaHR0cHM6Ly9pay5pbWFnZWtpdC5pby9teXNpdGUgb3IgaHR0cHM6Ly9zdWJkb21haW4ubXlzaXRlLmNvbSAtIGAgK1xuICAgICAgICAgIGBidXQgZ290OiBcXGAke3BhdGh9XFxgYCk7XG59XG4iXX0=