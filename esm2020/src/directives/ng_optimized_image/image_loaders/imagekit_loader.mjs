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
export const provideImageKitLoader = createImageLoader(imagekitLoaderFactory, throwInvalidPathError);
export function imagekitLoaderFactory(path) {
    return (config) => {
        // Example of an ImageKit image URL:
        // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
        let params = `tr:q-auto`; // applies the "auto quality" transformation
        if (config.width) {
            params += `,w-${config.width?.toString()}`;
        }
        const url = `${path}/${params}/${normalizeSrc(config.src)}`;
        return url;
    };
}
function throwInvalidPathError(path) {
    throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `ImageKitLoader has detected an invalid path: ` +
        `expecting a path matching one of the following formats: https://ik.imagekit.io/mysite or https://subdomain.mysite.com - ` +
        `but got: \`${path}\``);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VraXRfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxJQUFJLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUc1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXJDLE9BQU8sRUFBQyxpQkFBaUIsRUFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRTs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQzlCLGlCQUFpQixDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFFcEUsTUFBTSxVQUFVLHFCQUFxQixDQUFDLElBQVk7SUFDaEQsT0FBTyxDQUFDLE1BQXlCLEVBQUUsRUFBRTtRQUNuQyxvQ0FBb0M7UUFDcEMsc0VBQXNFO1FBQ3RFLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFFLDRDQUE0QztRQUN2RSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDaEIsTUFBTSxJQUFJLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO1NBQzVDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksTUFBTSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1RCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWE7SUFDMUMsTUFBTSxJQUFJLFlBQVksNENBRWxCLCtDQUErQztRQUMzQywwSEFBMEg7UUFDMUgsY0FBYyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge25vcm1hbGl6ZVNyY30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7Y3JlYXRlSW1hZ2VMb2FkZXIsIEltYWdlTG9hZGVyQ29uZmlnfSBmcm9tICcuL2ltYWdlX2xvYWRlcic7XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYSBidWlsdC1pbiBJbWFnZUxvYWRlciBmb3IgSW1hZ2VLaXRcbiAqIGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggQmFzZSBVUkwgb2YgeW91ciBJbWFnZUtpdCBpbWFnZXNcbiAqIFRoaXMgVVJMIHNob3VsZCBtYXRjaCBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogaHR0cHM6Ly9pay5pbWFnZWtpdC5pby9teWFjY291bnRcbiAqIGh0dHBzOi8vc3ViZG9tYWluLm15c2l0ZS5jb21cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9iamVjdCB0aGF0IGFsbG93cyB0byBwcm92aWRlIGV4dHJhIGNvbmZpZ3VyYXRpb246XG4gKiAtIGBlbnN1cmVQcmVjb25uZWN0YDogYm9vbGVhbiBmbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmVcbiAqICAgICAgICAgICAgICAgICAgICAgICBzaG91bGQgdmVyaWZ5IHRoYXQgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIGA8bGluayByZWw9XCJwcmVjb25uZWN0XCI+YFxuICogICAgICAgICAgICAgICAgICAgICAgIHByZXNlbnQgaW4gdGhlIGRvY3VtZW50J3MgYDxoZWFkPmAuXG4gKiBAcmV0dXJucyBTZXQgb2YgcHJvdmlkZXJzIHRvIGNvbmZpZ3VyZSB0aGUgSW1hZ2VLaXQgbG9hZGVyLlxuICovXG5leHBvcnQgY29uc3QgcHJvdmlkZUltYWdlS2l0TG9hZGVyID1cbiAgICBjcmVhdGVJbWFnZUxvYWRlcihpbWFnZWtpdExvYWRlckZhY3RvcnksIHRocm93SW52YWxpZFBhdGhFcnJvcik7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbWFnZWtpdExvYWRlckZhY3RvcnkocGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICAgIC8vIEV4YW1wbGUgb2YgYW4gSW1hZ2VLaXQgaW1hZ2UgVVJMOlxuICAgIC8vIGh0dHBzOi8vaWsuaW1hZ2VraXQuaW8vZGVtby90cjp3LTMwMCxoLTMwMC9tZWRpdW1fY2FmZV9CMWlUZEQwQy5qcGdcbiAgICBsZXQgcGFyYW1zID0gYHRyOnEtYXV0b2A7ICAvLyBhcHBsaWVzIHRoZSBcImF1dG8gcXVhbGl0eVwiIHRyYW5zZm9ybWF0aW9uXG4gICAgaWYgKGNvbmZpZy53aWR0aCkge1xuICAgICAgcGFyYW1zICs9IGAsdy0ke2NvbmZpZy53aWR0aD8udG9TdHJpbmcoKX1gO1xuICAgIH1cbiAgICBjb25zdCB1cmwgPSBgJHtwYXRofS8ke3BhcmFtc30vJHtub3JtYWxpemVTcmMoY29uZmlnLnNyYyl9YDtcbiAgICByZXR1cm4gdXJsO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aDogdW5rbm93bik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGBJbWFnZUtpdExvYWRlciBoYXMgZGV0ZWN0ZWQgYW4gaW52YWxpZCBwYXRoOiBgICtcbiAgICAgICAgICBgZXhwZWN0aW5nIGEgcGF0aCBtYXRjaGluZyBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOiBodHRwczovL2lrLmltYWdla2l0LmlvL215c2l0ZSBvciBodHRwczovL3N1YmRvbWFpbi5teXNpdGUuY29tIC0gYCArXG4gICAgICAgICAgYGJ1dCBnb3Q6IFxcYCR7cGF0aH1cXGBgKTtcbn1cbiJdfQ==