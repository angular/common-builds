/**
 * @license Angular v20.0.0-next.4+sha-b927ce8
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

const PLATFORM_BROWSER_ID = 'browser';
const PLATFORM_SERVER_ID = 'server';
/**
 * Returns whether a platform id represents a browser platform.
 * @publicApi
 */
function isPlatformBrowser(platformId) {
    return platformId === PLATFORM_BROWSER_ID;
}
/**
 * Returns whether a platform id represents a server platform.
 * @publicApi
 */
function isPlatformServer(platformId) {
    return platformId === PLATFORM_SERVER_ID;
}

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
class XhrFactory {
}

export { PLATFORM_BROWSER_ID as P, XhrFactory as X, PLATFORM_SERVER_ID as a, isPlatformServer as b, isPlatformBrowser as i, parseCookieValue as p };
//# sourceMappingURL=xhr-BdgfMvBr.mjs.map
