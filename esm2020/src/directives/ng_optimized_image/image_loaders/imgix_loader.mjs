/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵRuntimeError as RuntimeError } from '@angular/core';
import { IMAGE_LOADER } from './image_loader';
/**
 * Function that generates a built-in ImageLoader for Imgix and turns it
 * into an Angular provider.
 *
 * @param path path to the desired Imgix origin,
 * e.g. https://somepath.imgix.net or https://images.mysite.com
 * @returns Provider that provides an ImageLoader function
 */
export function provideImgixLoader(path) {
    ngDevMode && assertValidPath(path);
    path = normalizePath(path);
    return {
        provide: IMAGE_LOADER,
        useValue: (config) => {
            const url = new URL(`${path}/${normalizeSrc(config.src)}`);
            // This setting ensures the smallest allowable format is set.
            url.searchParams.set('auto', 'format');
            config.width && url.searchParams.set('w', config.width.toString());
            return url.href;
        }
    };
}
function assertValidPath(path) {
    const isString = typeof path === 'string';
    if (!isString || path.trim() === '') {
        throwInvalidPathError(path);
    }
    try {
        const url = new URL(path);
    }
    catch {
        throwInvalidPathError(path);
    }
}
function throwInvalidPathError(path) {
    throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `ImgixLoader has detected an invalid path: ` +
        `expecting a path like https://somepath.imgix.net/` +
        `but got: \`${path}\``);
}
function normalizePath(path) {
    return path[path.length - 1] === '/' ? path.slice(0, -1) : path;
}
function normalizeSrc(src) {
    return src[0] === '/' ? src.slice(1) : src;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1naXhfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltZ2l4X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQVcsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUl0RSxPQUFPLEVBQUMsWUFBWSxFQUFvQixNQUFNLGdCQUFnQixDQUFDO0FBRS9EOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsSUFBWTtJQUM3QyxTQUFTLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFM0IsT0FBTztRQUNMLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLFFBQVEsRUFBRSxDQUFDLE1BQXlCLEVBQUUsRUFBRTtZQUN0QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMzRCw2REFBNkQ7WUFDN0QsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNuRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsSUFBYTtJQUNwQyxNQUFNLFFBQVEsR0FBRyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUM7SUFFMUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ25DLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdCO0lBRUQsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzNCO0lBQUMsTUFBTTtRQUNOLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdCO0FBQ0gsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsSUFBYTtJQUMxQyxNQUFNLElBQUksWUFBWSw0Q0FFbEIsNENBQTRDO1FBQ3hDLG1EQUFtRDtRQUNuRCxjQUFjLElBQUksSUFBSSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVk7SUFDakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNsRSxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsR0FBVztJQUMvQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM3QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UHJvdmlkZXIsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vLi4vZXJyb3JzJztcblxuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICcuL2ltYWdlX2xvYWRlcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYSBidWlsdC1pbiBJbWFnZUxvYWRlciBmb3IgSW1naXggYW5kIHR1cm5zIGl0XG4gKiBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggcGF0aCB0byB0aGUgZGVzaXJlZCBJbWdpeCBvcmlnaW4sXG4gKiBlLmcuIGh0dHBzOi8vc29tZXBhdGguaW1naXgubmV0IG9yIGh0dHBzOi8vaW1hZ2VzLm15c2l0ZS5jb21cbiAqIEByZXR1cm5zIFByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgYW4gSW1hZ2VMb2FkZXIgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVJbWdpeExvYWRlcihwYXRoOiBzdHJpbmcpOiBQcm92aWRlciB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRWYWxpZFBhdGgocGF0aCk7XG4gIHBhdGggPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuXG4gIHJldHVybiB7XG4gICAgcHJvdmlkZTogSU1BR0VfTE9BREVSLFxuICAgIHVzZVZhbHVlOiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChgJHtwYXRofS8ke25vcm1hbGl6ZVNyYyhjb25maWcuc3JjKX1gKTtcbiAgICAgIC8vIFRoaXMgc2V0dGluZyBlbnN1cmVzIHRoZSBzbWFsbGVzdCBhbGxvd2FibGUgZm9ybWF0IGlzIHNldC5cbiAgICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdhdXRvJywgJ2Zvcm1hdCcpO1xuICAgICAgY29uZmlnLndpZHRoICYmIHVybC5zZWFyY2hQYXJhbXMuc2V0KCd3JywgY29uZmlnLndpZHRoLnRvU3RyaW5nKCkpO1xuICAgICAgcmV0dXJuIHVybC5ocmVmO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VmFsaWRQYXRoKHBhdGg6IHVua25vd24pIHtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZyc7XG5cbiAgaWYgKCFpc1N0cmluZyB8fCBwYXRoLnRyaW0oKSA9PT0gJycpIHtcbiAgICB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aCk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocGF0aCk7XG4gIH0gY2F0Y2gge1xuICAgIHRocm93SW52YWxpZFBhdGhFcnJvcihwYXRoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aDogdW5rbm93bik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGBJbWdpeExvYWRlciBoYXMgZGV0ZWN0ZWQgYW4gaW52YWxpZCBwYXRoOiBgICtcbiAgICAgICAgICBgZXhwZWN0aW5nIGEgcGF0aCBsaWtlIGh0dHBzOi8vc29tZXBhdGguaW1naXgubmV0L2AgK1xuICAgICAgICAgIGBidXQgZ290OiBcXGAke3BhdGh9XFxgYCk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGgocGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBwYXRoW3BhdGgubGVuZ3RoIC0gMV0gPT09ICcvJyA/IHBhdGguc2xpY2UoMCwgLTEpIDogcGF0aDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplU3JjKHNyYzogc3RyaW5nKSB7XG4gIHJldHVybiBzcmNbMF0gPT09ICcvJyA/IHNyYy5zbGljZSgxKSA6IHNyYztcbn1cbiJdfQ==