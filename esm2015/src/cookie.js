/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function parseCookieValue(cookieStr, name) {
    name = encodeURIComponent(name);
    for (const cookie of cookieStr.split(';')) {
        const eqIndex = cookie.indexOf('=');
        const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
        if (cookieName.trim() === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9jb29raWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsSUFBWTtJQUM5RCxJQUFJLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsR0FDM0IsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtZQUM5QixPQUFPLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3hDO0tBQ0Y7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29va2llVmFsdWUoY29va2llU3RyOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgbmFtZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKTtcbiAgZm9yIChjb25zdCBjb29raWUgb2YgY29va2llU3RyLnNwbGl0KCc7JykpIHtcbiAgICBjb25zdCBlcUluZGV4ID0gY29va2llLmluZGV4T2YoJz0nKTtcbiAgICBjb25zdCBbY29va2llTmFtZSwgY29va2llVmFsdWVdOiBzdHJpbmdbXSA9XG4gICAgICAgIGVxSW5kZXggPT0gLTEgPyBbY29va2llLCAnJ10gOiBbY29va2llLnNsaWNlKDAsIGVxSW5kZXgpLCBjb29raWUuc2xpY2UoZXFJbmRleCArIDEpXTtcbiAgICBpZiAoY29va2llTmFtZS50cmltKCkgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoY29va2llVmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==