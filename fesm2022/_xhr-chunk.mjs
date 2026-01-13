/**
 * @license Angular v21.1.0-rc.0+sha-bf5db2b
 * (c) 2010-2026 Google LLC. https://angular.dev/
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
