/**
 * @license Angular v20.2.0-next.2+sha-c66e9fe
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

function parseCookieValue(cookieStr, name) {
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

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
class XhrFactory {
}

export { XhrFactory, parseCookieValue };
//# sourceMappingURL=xhr.mjs.map
