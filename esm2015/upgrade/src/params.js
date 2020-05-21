/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A codec for encoding and decoding URL parts.
 *
 * @publicApi
 **/
export class UrlCodec {
}
/**
 * A `UrlCodec` that uses logic from AngularJS to serialize and parse URLs
 * and URL parameters.
 *
 * @publicApi
 */
export class AngularJSUrlCodec {
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L15
    encodePath(path) {
        const segments = path.split('/');
        let i = segments.length;
        while (i--) {
            // decode forward slashes to prevent them from being double encoded
            segments[i] = encodeUriSegment(segments[i].replace(/%2F/g, '/'));
        }
        path = segments.join('/');
        return _stripIndexHtml((path && path[0] !== '/' && '/' || '') + path);
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L42
    encodeSearch(search) {
        if (typeof search === 'string') {
            search = parseKeyValue(search);
        }
        search = toKeyValue(search);
        return search ? '?' + search : '';
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L44
    encodeHash(hash) {
        hash = encodeUriSegment(hash);
        return hash ? '#' + hash : '';
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L27
    decodePath(path, html5Mode = true) {
        const segments = path.split('/');
        let i = segments.length;
        while (i--) {
            segments[i] = decodeURIComponent(segments[i]);
            if (html5Mode) {
                // encode forward slashes to prevent them from being mistaken for path separators
                segments[i] = segments[i].replace(/\//g, '%2F');
            }
        }
        return segments.join('/');
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L72
    decodeSearch(search) {
        return parseKeyValue(search);
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L73
    decodeHash(hash) {
        hash = decodeURIComponent(hash);
        return hash[0] === '#' ? hash.substring(1) : hash;
    }
    normalize(pathOrHref, search, hash, baseUrl) {
        if (arguments.length === 1) {
            const parsed = this.parse(pathOrHref, baseUrl);
            if (typeof parsed === 'string') {
                return parsed;
            }
            const serverUrl = `${parsed.protocol}://${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}`;
            return this.normalize(this.decodePath(parsed.pathname), this.decodeSearch(parsed.search), this.decodeHash(parsed.hash), serverUrl);
        }
        else {
            const encPath = this.encodePath(pathOrHref);
            const encSearch = search && this.encodeSearch(search) || '';
            const encHash = hash && this.encodeHash(hash) || '';
            let joinedPath = (baseUrl || '') + encPath;
            if (!joinedPath.length || joinedPath[0] !== '/') {
                joinedPath = '/' + joinedPath;
            }
            return joinedPath + encSearch + encHash;
        }
    }
    areEqual(valA, valB) {
        return this.normalize(valA) === this.normalize(valB);
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/urlUtils.js#L60
    parse(url, base) {
        try {
            // Safari 12 throws an error when the URL constructor is called with an undefined base.
            const parsed = !base ? new URL(url) : new URL(url, base);
            return {
                href: parsed.href,
                protocol: parsed.protocol ? parsed.protocol.replace(/:$/, '') : '',
                host: parsed.host,
                search: parsed.search ? parsed.search.replace(/^\?/, '') : '',
                hash: parsed.hash ? parsed.hash.replace(/^#/, '') : '',
                hostname: parsed.hostname,
                port: parsed.port,
                pathname: (parsed.pathname.charAt(0) === '/') ? parsed.pathname : '/' + parsed.pathname
            };
        }
        catch (e) {
            throw new Error(`Invalid URL (${url}) with base (${base})`);
        }
    }
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @param str value potential URI component to check.
 * @returns the decoded URI if it can be decoded or else `undefined`.
 */
function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    }
    catch (e) {
        // Ignore any invalid uri component.
        return undefined;
    }
}
/**
 * Parses an escaped url query string into key-value pairs. Logic taken from
 * https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1382
 */
function parseKeyValue(keyValue) {
    const obj = {};
    (keyValue || '').split('&').forEach((keyValue) => {
        let splitPoint, key, val;
        if (keyValue) {
            key = keyValue = keyValue.replace(/\+/g, '%20');
            splitPoint = keyValue.indexOf('=');
            if (splitPoint !== -1) {
                key = keyValue.substring(0, splitPoint);
                val = keyValue.substring(splitPoint + 1);
            }
            key = tryDecodeURIComponent(key);
            if (typeof key !== 'undefined') {
                val = typeof val !== 'undefined' ? tryDecodeURIComponent(val) : true;
                if (!obj.hasOwnProperty(key)) {
                    obj[key] = val;
                }
                else if (Array.isArray(obj[key])) {
                    obj[key].push(val);
                }
                else {
                    obj[key] = [obj[key], val];
                }
            }
        }
    });
    return obj;
}
/**
 * Serializes into key-value pairs. Logic taken from
 * https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1409
 */
function toKeyValue(obj) {
    const parts = [];
    for (const key in obj) {
        let value = obj[key];
        if (Array.isArray(value)) {
            value.forEach((arrayValue) => {
                parts.push(encodeUriQuery(key, true) +
                    (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
            });
        }
        else {
            parts.push(encodeUriQuery(key, true) +
                (value === true ? '' : '=' + encodeUriQuery(value, true)));
        }
    }
    return parts.length ? parts.join('&') : '';
}
/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 *
 * Logic from https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1437
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true)
        .replace(/%26/gi, '&')
        .replace(/%3D/gi, '=')
        .replace(/%2B/gi, '+');
}
/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query         = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 *
 * Logic from https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1456
 */
function encodeUriQuery(val, pctEncodeSpaces = false) {
    return encodeURIComponent(val)
        .replace(/%40/gi, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%3B/gi, ';')
        .replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3VwZ3JhZGUvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7OztJQUlJO0FBQ0osTUFBTSxPQUFnQixRQUFRO0NBcUY3QjtBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGlCQUFpQjtJQUM1Qiw0RUFBNEU7SUFDNUUsVUFBVSxDQUFDLElBQVk7UUFDckIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRXhCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7WUFDVixtRUFBbUU7WUFDbkUsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDbEU7UUFFRCxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixPQUFPLGVBQWUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLFlBQVksQ0FBQyxNQUFxQztRQUNoRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUM5QixNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxD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QUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEEgY29kZWMgZm9yIGVuY29kaW5nIGFuZCBkZWNvZGluZyBVUkwgcGFydHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICoqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFVybENvZGVjIHtcbiAgLyoqXG4gICAqIEVuY29kZXMgdGhlIHBhdGggZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3QgZW5jb2RlUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIHBhdGggZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3QgZGVjb2RlUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEVuY29kZXMgdGhlIHNlYXJjaCBzdHJpbmcgZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nIG9yIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBzdHJpbmcgb3Igb2JqZWN0XG4gICAqL1xuICBhYnN0cmFjdCBlbmNvZGVTZWFyY2goc2VhcmNoOiBzdHJpbmd8e1trOiBzdHJpbmddOiB1bmtub3dufSk6IHN0cmluZztcblxuICAvKipcbiAgICogRGVjb2RlcyB0aGUgc2VhcmNoIG9iamVjdHMgZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3QgZGVjb2RlU2VhcmNoKHNlYXJjaDogc3RyaW5nKToge1trOiBzdHJpbmddOiB1bmtub3dufTtcblxuICAvKipcbiAgICogRW5jb2RlcyB0aGUgaGFzaCBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIGhhc2ggc3RyaW5nXG4gICAqL1xuICBhYnN0cmFjdCBlbmNvZGVIYXNoKGhhc2g6IHN0cmluZyk6IHN0cmluZztcblxuICAvKipcbiAgICogRGVjb2RlcyB0aGUgaGFzaCBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIGhhc2ggc3RyaW5nXG4gICAqL1xuICBhYnN0cmFjdCBkZWNvZGVIYXNoKGhhc2g6IHN0cmluZyk6IHN0cmluZztcblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgVVJMIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgVVJMIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3Qgbm9ybWFsaXplKGhyZWY6IHN0cmluZyk6IHN0cmluZztcblxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBVUkwgZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nLCBzZWFyY2gsIGhhc2gsIGFuZCBiYXNlIFVSTCBwYXJhbWV0ZXJzXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBVUkwgcGF0aFxuICAgKiBAcGFyYW0gc2VhcmNoIFRoZSBzZWFyY2ggb2JqZWN0XG4gICAqIEBwYXJhbSBoYXNoIFRoZSBoYXMgc3RyaW5nXG4gICAqIEBwYXJhbSBiYXNlVXJsIFRoZSBiYXNlIFVSTCBmb3IgdGhlIFVSTFxuICAgKi9cbiAgYWJzdHJhY3Qgbm9ybWFsaXplKHBhdGg6IHN0cmluZywgc2VhcmNoOiB7W2s6IHN0cmluZ106IHVua25vd259LCBoYXNoOiBzdHJpbmcsIGJhc2VVcmw/OiBzdHJpbmcpOlxuICAgICAgc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgdHdvIHN0cmluZ3MgYXJlIGVxdWFsXG4gICAqIEBwYXJhbSB2YWxBIEZpcnN0IHN0cmluZyBmb3IgY29tcGFyaXNvblxuICAgKiBAcGFyYW0gdmFsQiBTZWNvbmQgc3RyaW5nIGZvciBjb21wYXJpc29uXG4gICAqL1xuICBhYnN0cmFjdCBhcmVFcXVhbCh2YWxBOiBzdHJpbmcsIHZhbEI6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgVVJMIHN0cmluZyBiYXNlZCBvbiB0aGUgYmFzZSBVUkxcbiAgICpcbiAgICogQHBhcmFtIHVybCBUaGUgZnVsbCBVUkwgc3RyaW5nXG4gICAqIEBwYXJhbSBiYXNlIFRoZSBiYXNlIGZvciB0aGUgVVJMXG4gICAqL1xuICBhYnN0cmFjdCBwYXJzZSh1cmw6IHN0cmluZywgYmFzZT86IHN0cmluZyk6IHtcbiAgICBocmVmOiBzdHJpbmcsXG4gICAgcHJvdG9jb2w6IHN0cmluZyxcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgc2VhcmNoOiBzdHJpbmcsXG4gICAgaGFzaDogc3RyaW5nLFxuICAgIGhvc3RuYW1lOiBzdHJpbmcsXG4gICAgcG9ydDogc3RyaW5nLFxuICAgIHBhdGhuYW1lOiBzdHJpbmdcbiAgfTtcbn1cblxuLyoqXG4gKiBBIGBVcmxDb2RlY2AgdGhhdCB1c2VzIGxvZ2ljIGZyb20gQW5ndWxhckpTIHRvIHNlcmlhbGl6ZSBhbmQgcGFyc2UgVVJMc1xuICogYW5kIFVSTCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJKU1VybENvZGVjIGltcGxlbWVudHMgVXJsQ29kZWMge1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDE1XG4gIGVuY29kZVBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBzZWdtZW50cyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICBsZXQgaSA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIC8vIGRlY29kZSBmb3J3YXJkIHNsYXNoZXMgdG8gcHJldmVudCB0aGVtIGZyb20gYmVpbmcgZG91YmxlIGVuY29kZWRcbiAgICAgIHNlZ21lbnRzW2ldID0gZW5jb2RlVXJpU2VnbWVudChzZWdtZW50c1tpXS5yZXBsYWNlKC8lMkYvZywgJy8nKSk7XG4gICAgfVxuXG4gICAgcGF0aCA9IHNlZ21lbnRzLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gX3N0cmlwSW5kZXhIdG1sKChwYXRoICYmIHBhdGhbMF0gIT09ICcvJyAmJiAnLycgfHwgJycpICsgcGF0aCk7XG4gIH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDQyXG4gIGVuY29kZVNlYXJjaChzZWFyY2g6IHN0cmluZ3x7W2s6IHN0cmluZ106IHVua25vd259KTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHNlYXJjaCA9IHBhcnNlS2V5VmFsdWUoc2VhcmNoKTtcbiAgICB9XG5cbiAgICBzZWFyY2ggPSB0b0tleVZhbHVlKHNlYXJjaCk7XG4gICAgcmV0dXJuIHNlYXJjaCA/ICc/JyArIHNlYXJjaCA6ICcnO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0w0NFxuICBlbmNvZGVIYXNoKGhhc2g6IHN0cmluZykge1xuICAgIGhhc2ggPSBlbmNvZGVVcmlTZWdtZW50KGhhc2gpO1xuICAgIHJldHVybiBoYXNoID8gJyMnICsgaGFzaCA6ICcnO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0wyN1xuICBkZWNvZGVQYXRoKHBhdGg6IHN0cmluZywgaHRtbDVNb2RlID0gdHJ1ZSk6IHN0cmluZyB7XG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgbGV0IGkgPSBzZWdtZW50cy5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBzZWdtZW50c1tpXSA9IGRlY29kZVVSSUNvbXBvbmVudChzZWdtZW50c1tpXSk7XG4gICAgICBpZiAoaHRtbDVNb2RlKSB7XG4gICAgICAgIC8vIGVuY29kZSBmb3J3YXJkIHNsYXNoZXMgdG8gcHJldmVudCB0aGVtIGZyb20gYmVpbmcgbWlzdGFrZW4gZm9yIHBhdGggc2VwYXJhdG9yc1xuICAgICAgICBzZWdtZW50c1tpXSA9IHNlZ21lbnRzW2ldLnJlcGxhY2UoL1xcLy9nLCAnJTJGJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlZ21lbnRzLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMNzJcbiAgZGVjb2RlU2VhcmNoKHNlYXJjaDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHBhcnNlS2V5VmFsdWUoc2VhcmNoKTtcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMNzNcbiAgZGVjb2RlSGFzaChoYXNoOiBzdHJpbmcpIHtcbiAgICBoYXNoID0gZGVjb2RlVVJJQ29tcG9uZW50KGhhc2gpO1xuICAgIHJldHVybiBoYXNoWzBdID09PSAnIycgPyBoYXNoLnN1YnN0cmluZygxKSA6IGhhc2g7XG4gIH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDE0OVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDQyXG4gIG5vcm1hbGl6ZShocmVmOiBzdHJpbmcpOiBzdHJpbmc7XG4gIG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcsIHNlYXJjaDoge1trOiBzdHJpbmddOiB1bmtub3dufSwgaGFzaDogc3RyaW5nLCBiYXNlVXJsPzogc3RyaW5nKTogc3RyaW5nO1xuICBub3JtYWxpemUocGF0aE9ySHJlZjogc3RyaW5nLCBzZWFyY2g/OiB7W2s6IHN0cmluZ106IHVua25vd259LCBoYXNoPzogc3RyaW5nLCBiYXNlVXJsPzogc3RyaW5nKTpcbiAgICAgIHN0cmluZyB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHRoaXMucGFyc2UocGF0aE9ySHJlZiwgYmFzZVVybCk7XG5cbiAgICAgIGlmICh0eXBlb2YgcGFyc2VkID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gcGFyc2VkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzZXJ2ZXJVcmwgPVxuICAgICAgICAgIGAke3BhcnNlZC5wcm90b2NvbH06Ly8ke3BhcnNlZC5ob3N0bmFtZX0ke3BhcnNlZC5wb3J0ID8gJzonICsgcGFyc2VkLnBvcnQgOiAnJ31gO1xuXG4gICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoXG4gICAgICAgICAgdGhpcy5kZWNvZGVQYXRoKHBhcnNlZC5wYXRobmFtZSksIHRoaXMuZGVjb2RlU2VhcmNoKHBhcnNlZC5zZWFyY2gpLFxuICAgICAgICAgIHRoaXMuZGVjb2RlSGFzaChwYXJzZWQuaGFzaCksIHNlcnZlclVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGVuY1BhdGggPSB0aGlzLmVuY29kZVBhdGgocGF0aE9ySHJlZik7XG4gICAgICBjb25zdCBlbmNTZWFyY2ggPSBzZWFyY2ggJiYgdGhpcy5lbmNvZGVTZWFyY2goc2VhcmNoKSB8fCAnJztcbiAgICAgIGNvbnN0IGVuY0hhc2ggPSBoYXNoICYmIHRoaXMuZW5jb2RlSGFzaChoYXNoKSB8fCAnJztcblxuICAgICAgbGV0IGpvaW5lZFBhdGggPSAoYmFzZVVybCB8fCAnJykgKyBlbmNQYXRoO1xuXG4gICAgICBpZiAoIWpvaW5lZFBhdGgubGVuZ3RoIHx8IGpvaW5lZFBhdGhbMF0gIT09ICcvJykge1xuICAgICAgICBqb2luZWRQYXRoID0gJy8nICsgam9pbmVkUGF0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBqb2luZWRQYXRoICsgZW5jU2VhcmNoICsgZW5jSGFzaDtcbiAgICB9XG4gIH1cblxuICBhcmVFcXVhbCh2YWxBOiBzdHJpbmcsIHZhbEI6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSh2YWxBKSA9PT0gdGhpcy5ub3JtYWxpemUodmFsQik7XG4gIH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvdXJsVXRpbHMuanMjTDYwXG4gIHBhcnNlKHVybDogc3RyaW5nLCBiYXNlPzogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFNhZmFyaSAxMiB0aHJvd3MgYW4gZXJyb3Igd2hlbiB0aGUgVVJMIGNvbnN0cnVjdG9yIGlzIGNhbGxlZCB3aXRoIGFuIHVuZGVmaW5lZCBiYXNlLlxuICAgICAgY29uc3QgcGFyc2VkID0gIWJhc2UgPyBuZXcgVVJMKHVybCkgOiBuZXcgVVJMKHVybCwgYmFzZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBocmVmOiBwYXJzZWQuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IHBhcnNlZC5wcm90b2NvbCA/IHBhcnNlZC5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICBob3N0OiBwYXJzZWQuaG9zdCxcbiAgICAgICAgc2VhcmNoOiBwYXJzZWQuc2VhcmNoID8gcGFyc2VkLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgIGhhc2g6IHBhcnNlZC5oYXNoID8gcGFyc2VkLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdG5hbWU6IHBhcnNlZC5ob3N0bmFtZSxcbiAgICAgICAgcG9ydDogcGFyc2VkLnBvcnQsXG4gICAgICAgIHBhdGhuYW1lOiAocGFyc2VkLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/IHBhcnNlZC5wYXRobmFtZSA6ICcvJyArIHBhcnNlZC5wYXRobmFtZVxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgVVJMICgke3VybH0pIHdpdGggYmFzZSAoJHtiYXNlfSlgKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX3N0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9pbmRleC5odG1sJC8sICcnKTtcbn1cblxuLyoqXG4gKiBUcmllcyB0byBkZWNvZGUgdGhlIFVSSSBjb21wb25lbnQgd2l0aG91dCB0aHJvd2luZyBhbiBleGNlcHRpb24uXG4gKlxuICogQHBhcmFtIHN0ciB2YWx1ZSBwb3RlbnRpYWwgVVJJIGNvbXBvbmVudCB0byBjaGVjay5cbiAqIEByZXR1cm5zIHRoZSBkZWNvZGVkIFVSSSBpZiBpdCBjYW4gYmUgZGVjb2RlZCBvciBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiB0cnlEZWNvZGVVUklDb21wb25lbnQodmFsdWU6IHN0cmluZyk6IHN0cmluZ3x1bmRlZmluZWQge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWdub3JlIGFueSBpbnZhbGlkIHVyaSBjb21wb25lbnQuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5cbi8qKlxuICogUGFyc2VzIGFuIGVzY2FwZWQgdXJsIHF1ZXJ5IHN0cmluZyBpbnRvIGtleS12YWx1ZSBwYWlycy4gTG9naWMgdGFrZW4gZnJvbVxuICogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL0FuZ3VsYXIuanMjTDEzODJcbiAqL1xuZnVuY3Rpb24gcGFyc2VLZXlWYWx1ZShrZXlWYWx1ZTogc3RyaW5nKToge1trOiBzdHJpbmddOiB1bmtub3dufSB7XG4gIGNvbnN0IG9iajoge1trOiBzdHJpbmddOiB1bmtub3dufSA9IHt9O1xuICAoa2V5VmFsdWUgfHwgJycpLnNwbGl0KCcmJykuZm9yRWFjaCgoa2V5VmFsdWUpID0+IHtcbiAgICBsZXQgc3BsaXRQb2ludCwga2V5LCB2YWw7XG4gICAgaWYgKGtleVZhbHVlKSB7XG4gICAgICBrZXkgPSBrZXlWYWx1ZSA9IGtleVZhbHVlLnJlcGxhY2UoL1xcKy9nLCAnJTIwJyk7XG4gICAgICBzcGxpdFBvaW50ID0ga2V5VmFsdWUuaW5kZXhPZignPScpO1xuICAgICAgaWYgKHNwbGl0UG9pbnQgIT09IC0xKSB7XG4gICAgICAgIGtleSA9IGtleVZhbHVlLnN1YnN0cmluZygwLCBzcGxpdFBvaW50KTtcbiAgICAgICAgdmFsID0ga2V5VmFsdWUuc3Vic3RyaW5nKHNwbGl0UG9pbnQgKyAxKTtcbiAgICAgIH1cbiAgICAgIGtleSA9IHRyeURlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhbCA9IHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnID8gdHJ5RGVjb2RlVVJJQ29tcG9uZW50KHZhbCkgOiB0cnVlO1xuICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgb2JqW2tleV0gPSB2YWw7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmpba2V5XSkpIHtcbiAgICAgICAgICAob2JqW2tleV0gYXMgdW5rbm93bltdKS5wdXNoKHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2tleV0gPSBbb2JqW2tleV0sIHZhbF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgaW50byBrZXktdmFsdWUgcGFpcnMuIExvZ2ljIHRha2VuIGZyb21cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxNDA5XG4gKi9cbmZ1bmN0aW9uIHRvS2V5VmFsdWUob2JqOiB7W2s6IHN0cmluZ106IHVua25vd259KSB7XG4gIGNvbnN0IHBhcnRzOiB1bmtub3duW10gPSBbXTtcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgbGV0IHZhbHVlID0gb2JqW2tleV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YWx1ZS5mb3JFYWNoKChhcnJheVZhbHVlKSA9PiB7XG4gICAgICAgIHBhcnRzLnB1c2goXG4gICAgICAgICAgICBlbmNvZGVVcmlRdWVyeShrZXksIHRydWUpICtcbiAgICAgICAgICAgIChhcnJheVZhbHVlID09PSB0cnVlID8gJycgOiAnPScgKyBlbmNvZGVVcmlRdWVyeShhcnJheVZhbHVlLCB0cnVlKSkpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnB1c2goXG4gICAgICAgICAgZW5jb2RlVXJpUXVlcnkoa2V5LCB0cnVlKSArXG4gICAgICAgICAgKHZhbHVlID09PSB0cnVlID8gJycgOiAnPScgKyBlbmNvZGVVcmlRdWVyeSh2YWx1ZSBhcyBhbnksIHRydWUpKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJ0cy5sZW5ndGggPyBwYXJ0cy5qb2luKCcmJykgOiAnJztcbn1cblxuXG4vKipcbiAqIFdlIG5lZWQgb3VyIGN1c3RvbSBtZXRob2QgYmVjYXVzZSBlbmNvZGVVUklDb21wb25lbnQgaXMgdG9vIGFnZ3Jlc3NpdmUgYW5kIGRvZXNuJ3QgZm9sbG93XG4gKiBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmMzOTg2LnR4dCB3aXRoIHJlZ2FyZHMgdG8gdGhlIGNoYXJhY3RlciBzZXQgKHBjaGFyKSBhbGxvd2VkIGluIHBhdGhcbiAqIHNlZ21lbnRzOlxuICogICAgc2VnbWVudCAgICAgICA9ICpwY2hhclxuICogICAgcGNoYXIgICAgICAgICA9IHVucmVzZXJ2ZWQgLyBwY3QtZW5jb2RlZCAvIHN1Yi1kZWxpbXMgLyBcIjpcIiAvIFwiQFwiXG4gKiAgICBwY3QtZW5jb2RlZCAgID0gXCIlXCIgSEVYRElHIEhFWERJR1xuICogICAgdW5yZXNlcnZlZCAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIlxuICogICAgc3ViLWRlbGltcyAgICA9IFwiIVwiIC8gXCIkXCIgLyBcIiZcIiAvIFwiJ1wiIC8gXCIoXCIgLyBcIilcIlxuICogICAgICAgICAgICAgICAgICAgICAvIFwiKlwiIC8gXCIrXCIgLyBcIixcIiAvIFwiO1wiIC8gXCI9XCJcbiAqXG4gKiBMb2dpYyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxNDM3XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVyaVNlZ21lbnQodmFsOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGVuY29kZVVyaVF1ZXJ5KHZhbCwgdHJ1ZSlcbiAgICAgIC5yZXBsYWNlKC8lMjYvZ2ksICcmJylcbiAgICAgIC5yZXBsYWNlKC8lM0QvZ2ksICc9JylcbiAgICAgIC5yZXBsYWNlKC8lMkIvZ2ksICcrJyk7XG59XG5cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBpbnRlbmRlZCBmb3IgZW5jb2RpbmcgKmtleSogb3IgKnZhbHVlKiBwYXJ0cyBvZiBxdWVyeSBjb21wb25lbnQuIFdlIG5lZWQgYSBjdXN0b21cbiAqIG1ldGhvZCBiZWNhdXNlIGVuY29kZVVSSUNvbXBvbmVudCBpcyB0b28gYWdncmVzc2l2ZSBhbmQgZW5jb2RlcyBzdHVmZiB0aGF0IGRvZXNuJ3QgaGF2ZSB0byBiZVxuICogZW5jb2RlZCBwZXIgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NjpcbiAqICAgIHF1ZXJ5ICAgICAgICAgPSAqKCBwY2hhciAvIFwiL1wiIC8gXCI/XCIgKVxuICogICAgcGNoYXIgICAgICAgICA9IHVucmVzZXJ2ZWQgLyBwY3QtZW5jb2RlZCAvIHN1Yi1kZWxpbXMgLyBcIjpcIiAvIFwiQFwiXG4gKiAgICB1bnJlc2VydmVkICAgID0gQUxQSEEgLyBESUdJVCAvIFwiLVwiIC8gXCIuXCIgLyBcIl9cIiAvIFwiflwiXG4gKiAgICBwY3QtZW5jb2RlZCAgID0gXCIlXCIgSEVYRElHIEhFWERJR1xuICogICAgc3ViLWRlbGltcyAgICA9IFwiIVwiIC8gXCIkXCIgLyBcIiZcIiAvIFwiJ1wiIC8gXCIoXCIgLyBcIilcIlxuICogICAgICAgICAgICAgICAgICAgICAvIFwiKlwiIC8gXCIrXCIgLyBcIixcIiAvIFwiO1wiIC8gXCI9XCJcbiAqXG4gKiBMb2dpYyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxNDU2XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVyaVF1ZXJ5KHZhbDogc3RyaW5nLCBwY3RFbmNvZGVTcGFjZXM6IGJvb2xlYW4gPSBmYWxzZSkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbClcbiAgICAgIC5yZXBsYWNlKC8lNDAvZ2ksICdAJylcbiAgICAgIC5yZXBsYWNlKC8lM0EvZ2ksICc6JylcbiAgICAgIC5yZXBsYWNlKC8lMjQvZywgJyQnKVxuICAgICAgLnJlcGxhY2UoLyUyQy9naSwgJywnKVxuICAgICAgLnJlcGxhY2UoLyUzQi9naSwgJzsnKVxuICAgICAgLnJlcGxhY2UoLyUyMC9nLCAocGN0RW5jb2RlU3BhY2VzID8gJyUyMCcgOiAnKycpKTtcbn1cbiJdfQ==