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
export function provideImgixLoader(path, options = {
    ensurePreconnect: true
}) {
    if (ngDevMode && !isValidPath(path)) {
        throwInvalidPathError(path);
    }
    path = normalizePath(path);
    const providers = [{
            provide: IMAGE_LOADER,
            useValue: (config) => {
                const url = new URL(`${path}/${normalizeSrc(config.src)}`);
                // This setting ensures the smallest allowable format is set.
                url.searchParams.set('auto', 'format');
                config.width && url.searchParams.set('w', config.width.toString());
                return url.href;
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
    throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `ImgixLoader has detected an invalid path: ` +
        `expecting a path like https://somepath.imgix.net/` +
        `but got: \`${path}\``);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1naXhfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltZ2l4X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQVcsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd0RSxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFakUsT0FBTyxFQUFDLFlBQVksRUFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsVUFBd0M7SUFDdkYsZ0JBQWdCLEVBQUUsSUFBSTtDQUN2QjtJQUNDLElBQUksU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ25DLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdCO0lBQ0QsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUzQixNQUFNLFNBQVMsR0FBZSxDQUFDO1lBQzdCLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLFFBQVEsRUFBRSxDQUFDLE1BQXlCLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzNELDZEQUE2RDtnQkFDN0QsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ25FLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztZQUNsQixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBRUgsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUMzRCxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2IsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDaEIsS0FBSyxFQUFFLElBQUk7U0FDWixDQUFDLENBQUM7S0FDSjtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWE7SUFDMUMsTUFBTSxJQUFJLFlBQVksNENBRWxCLDRDQUE0QztRQUN4QyxtREFBbUQ7UUFDbkQsY0FBYyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQcm92aWRlciwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtQUkVDT05ORUNUX0NIRUNLX0JMT0NLTElTVH0gZnJvbSAnLi4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtpc1ZhbGlkUGF0aCwgbm9ybWFsaXplUGF0aCwgbm9ybWFsaXplU3JjfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICcuL2ltYWdlX2xvYWRlcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYSBidWlsdC1pbiBJbWFnZUxvYWRlciBmb3IgSW1naXggYW5kIHR1cm5zIGl0XG4gKiBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggcGF0aCB0byB0aGUgZGVzaXJlZCBJbWdpeCBvcmlnaW4sXG4gKiBlLmcuIGh0dHBzOi8vc29tZXBhdGguaW1naXgubmV0IG9yIGh0dHBzOi8vaW1hZ2VzLm15c2l0ZS5jb21cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9iamVjdCB0aGF0IGFsbG93cyB0byBwcm92aWRlIGV4dHJhIGNvbmZpZ3VyYXRpb246XG4gKiAtIGBlbnN1cmVQcmVjb25uZWN0YDogYm9vbGVhbiBmbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmVcbiAqICAgICAgICAgICAgICAgICAgICAgICBzaG91bGQgdmVyaWZ5IHRoYXQgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIGA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+YFxuICogICAgICAgICAgICAgICAgICAgICAgIHByZXNlbnQgaW4gdGhlIGRvY3VtZW50J3MgYDxoZWFkPmAuXG4gKiBAcmV0dXJucyBTZXQgb2YgcHJvdmlkZXJzIHRvIGNvbmZpZ3VyZSB0aGUgSW1naXggbG9hZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUltZ2l4TG9hZGVyKHBhdGg6IHN0cmluZywgb3B0aW9uczoge2Vuc3VyZVByZWNvbm5lY3Q/OiBib29sZWFufSA9IHtcbiAgZW5zdXJlUHJlY29ubmVjdDogdHJ1ZVxufSk6IFByb3ZpZGVyW10ge1xuICBpZiAobmdEZXZNb2RlICYmICFpc1ZhbGlkUGF0aChwYXRoKSkge1xuICAgIHRocm93SW52YWxpZFBhdGhFcnJvcihwYXRoKTtcbiAgfVxuICBwYXRoID0gbm9ybWFsaXplUGF0aChwYXRoKTtcblxuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbe1xuICAgIHByb3ZpZGU6IElNQUdFX0xPQURFUixcbiAgICB1c2VWYWx1ZTogKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYCR7cGF0aH0vJHtub3JtYWxpemVTcmMoY29uZmlnLnNyYyl9YCk7XG4gICAgICAvLyBUaGlzIHNldHRpbmcgZW5zdXJlcyB0aGUgc21hbGxlc3QgYWxsb3dhYmxlIGZvcm1hdCBpcyBzZXQuXG4gICAgICB1cmwuc2VhcmNoUGFyYW1zLnNldCgnYXV0bycsICdmb3JtYXQnKTtcbiAgICAgIGNvbmZpZy53aWR0aCAmJiB1cmwuc2VhcmNoUGFyYW1zLnNldCgndycsIGNvbmZpZy53aWR0aC50b1N0cmluZygpKTtcbiAgICAgIHJldHVybiB1cmwuaHJlZjtcbiAgICB9XG4gIH1dO1xuXG4gIGlmIChuZ0Rldk1vZGUgJiYgQm9vbGVhbihvcHRpb25zLmVuc3VyZVByZWNvbm5lY3QpID09PSB0cnVlKSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe1xuICAgICAgcHJvdmlkZTogUFJFQ09OTkVDVF9DSEVDS19CTE9DS0xJU1QsXG4gICAgICB1c2VWYWx1ZTogW3BhdGhdLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcHJvdmlkZXJzO1xufVxuXG5mdW5jdGlvbiB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aDogdW5rbm93bik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGBJbWdpeExvYWRlciBoYXMgZGV0ZWN0ZWQgYW4gaW52YWxpZCBwYXRoOiBgICtcbiAgICAgICAgICBgZXhwZWN0aW5nIGEgcGF0aCBsaWtlIGh0dHBzOi8vc29tZXBhdGguaW1naXgubmV0L2AgK1xuICAgICAgICAgIGBidXQgZ290OiBcXGAke3BhdGh9XFxgYCk7XG59XG4iXX0=