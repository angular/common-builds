/**
 * @license Angular v21.0.0-next.9+sha-81b8765
 * (c) 2010-2025 Google LLC. https://angular.dev/
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

class XhrFactory {}

export { XhrFactory, parseCookieValue };
//# sourceMappingURL=_xhr-chunk.mjs.map
