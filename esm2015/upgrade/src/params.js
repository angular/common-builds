/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
 * \@publicApi
 *
 * @abstract
 */
export class UrlCodec {
}
if (false) {
    /**
     * @abstract
     * @param {?} path
     * @return {?}
     */
    UrlCodec.prototype.encodePath = function (path) { };
    /**
     * @abstract
     * @param {?} path
     * @return {?}
     */
    UrlCodec.prototype.decodePath = function (path) { };
    /**
     * @abstract
     * @param {?} search
     * @return {?}
     */
    UrlCodec.prototype.encodeSearch = function (search) { };
    /**
     * @abstract
     * @param {?} search
     * @return {?}
     */
    UrlCodec.prototype.decodeSearch = function (search) { };
    /**
     * @abstract
     * @param {?} hash
     * @return {?}
     */
    UrlCodec.prototype.encodeHash = function (hash) { };
    /**
     * @abstract
     * @param {?} hash
     * @return {?}
     */
    UrlCodec.prototype.decodeHash = function (hash) { };
    /**
     * @abstract
     * @param {?} href
     * @return {?}
     */
    UrlCodec.prototype.normalize = function (href) { };
    /**
     * @abstract
     * @param {?} path
     * @param {?} search
     * @param {?} hash
     * @param {?=} baseUrl
     * @return {?}
     */
    UrlCodec.prototype.normalize = function (path, search, hash, baseUrl) { };
    /**
     * @abstract
     * @param {?} valA
     * @param {?} valB
     * @return {?}
     */
    UrlCodec.prototype.areEqual = function (valA, valB) { };
    /**
     * @abstract
     * @param {?} url
     * @param {?=} base
     * @return {?}
     */
    UrlCodec.prototype.parse = function (url, base) { };
}
/**
 * A `AngularJSUrlCodec` that uses logic from AngularJS to serialize and parse URLs
 * and URL parameters
 *
 * \@publicApi
 */
export class AngularJSUrlCodec {
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L15
    /**
     * @param {?} path
     * @return {?}
     */
    encodePath(path) {
        /** @type {?} */
        const segments = path.split('/');
        /** @type {?} */
        let i = segments.length;
        while (i--) {
            // decode forward slashes to prevent them from being double encoded
            segments[i] = encodeUriSegment(segments[i].replace(/%2F/g, '/'));
        }
        path = segments.join('/');
        return _stripIndexHtml((path && path[0] !== '/' && '/' || '') + path);
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L42
    /**
     * @param {?} search
     * @return {?}
     */
    encodeSearch(search) {
        if (typeof search === 'string') {
            search = parseKeyValue(search);
        }
        search = toKeyValue(search);
        return search ? '?' + search : '';
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L44
    /**
     * @param {?} hash
     * @return {?}
     */
    encodeHash(hash) {
        hash = encodeUriSegment(hash);
        return hash ? '#' + hash : '';
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L27
    /**
     * @param {?} path
     * @param {?=} html5Mode
     * @return {?}
     */
    decodePath(path, html5Mode = true) {
        /** @type {?} */
        const segments = path.split('/');
        /** @type {?} */
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
    /**
     * @param {?} search
     * @return {?}
     */
    decodeSearch(search) { return parseKeyValue(search); }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L73
    /**
     * @param {?} hash
     * @return {?}
     */
    decodeHash(hash) {
        hash = decodeURIComponent(hash);
        return hash[0] === '#' ? hash.substring(1) : hash;
    }
    /**
     * @param {?} pathOrHref
     * @param {?=} search
     * @param {?=} hash
     * @param {?=} baseUrl
     * @return {?}
     */
    normalize(pathOrHref, search, hash, baseUrl) {
        if (arguments.length === 1) {
            /** @type {?} */
            const parsed = this.parse(pathOrHref, baseUrl);
            if (typeof parsed === 'string') {
                return parsed;
            }
            /** @type {?} */
            const serverUrl = `${parsed.protocol}://${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}`;
            return this.normalize(this.decodePath(parsed.pathname), this.decodeSearch(parsed.search), this.decodeHash(parsed.hash), serverUrl);
        }
        else {
            /** @type {?} */
            const encPath = this.encodePath(pathOrHref);
            /** @type {?} */
            const encSearch = search && this.encodeSearch(search) || '';
            /** @type {?} */
            const encHash = hash && this.encodeHash(hash) || '';
            /** @type {?} */
            let joinedPath = (baseUrl || '') + encPath;
            if (!joinedPath.length || joinedPath[0] !== '/') {
                joinedPath = '/' + joinedPath;
            }
            return joinedPath + encSearch + encHash;
        }
    }
    /**
     * @param {?} valA
     * @param {?} valB
     * @return {?}
     */
    areEqual(valA, valB) { return this.normalize(valA) === this.normalize(valB); }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/urlUtils.js#L60
    /**
     * @param {?} url
     * @param {?=} base
     * @return {?}
     */
    parse(url, base) {
        try {
            /** @type {?} */
            const parsed = new URL(url, base);
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
/**
 * @param {?} url
 * @return {?}
 */
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @param {?} value
 * @return {?}
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
 * @param {?} keyValue
 * @return {?}
 */
function parseKeyValue(keyValue) {
    /** @type {?} */
    const obj = {};
    (keyValue || '').split('&').forEach((/**
     * @param {?} keyValue
     * @return {?}
     */
    (keyValue) => {
        /** @type {?} */
        let splitPoint;
        /** @type {?} */
        let key;
        /** @type {?} */
        let val;
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
                    ((/** @type {?} */ (obj[key]))).push(val);
                }
                else {
                    obj[key] = [obj[key], val];
                }
            }
        }
    }));
    return obj;
}
/**
 * Serializes into key-value pairs. Logic taken from
 * https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1409
 * @param {?} obj
 * @return {?}
 */
function toKeyValue(obj) {
    /** @type {?} */
    const parts = [];
    for (const key in obj) {
        /** @type {?} */
        let value = obj[key];
        if (Array.isArray(value)) {
            value.forEach((/**
             * @param {?} arrayValue
             * @return {?}
             */
            (arrayValue) => {
                parts.push(encodeUriQuery(key, true) +
                    (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
            }));
        }
        else {
            parts.push(encodeUriQuery(key, true) +
                (value === true ? '' : '=' + encodeUriQuery((/** @type {?} */ (value)), true)));
        }
    }
    return parts.length ? parts.join('&') : '';
}
/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "\@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 *
 * Logic from https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1437
 * @param {?} val
 * @return {?}
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
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "\@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 *
 * Logic from https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1456
 * @param {?} val
 * @param {?=} pctEncodeSpaces
 * @return {?}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3VwZ3JhZGUvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxNQUFNLE9BQWdCLFFBQVE7Q0EwQjdCOzs7Ozs7O0lBekJDLG9EQUEwQzs7Ozs7O0lBQzFDLG9EQUEwQzs7Ozs7O0lBRTFDLHdEQUFxRTs7Ozs7O0lBQ3JFLHdEQUE4RDs7Ozs7O0lBRTlELG9EQUEwQzs7Ozs7O0lBQzFDLG9EQUEwQzs7Ozs7O0lBRTFDLG1EQUF5Qzs7Ozs7Ozs7O0lBQ3pDLDBFQUNXOzs7Ozs7O0lBRVgsd0RBQXVEOzs7Ozs7O0lBRXZELG9EQVNFOzs7Ozs7OztBQVNKLE1BQU0sT0FBTyxpQkFBaUI7Ozs7OztJQUU1QixVQUFVLENBQUMsSUFBWTs7Y0FDZixRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O1lBQzVCLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTTtRQUV2QixPQUFPLENBQUMsRUFBRSxFQUFFO1lBQ1YsbUVBQW1FO1lBQ25FLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsT0FBTyxlQUFlLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDeEUsQ0FBQzs7Ozs7O0lBR0QsWUFBWSxDQUFDLE1BQXFDO1FBQ2hELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQzlCLE1B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LE9BQU8sRUFBRSxHQUFHLENBQUM7U0FDckIsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUM7U0FDckIsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQSBjb2RlYyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIFVSTCBwYXJ0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVXJsQ29kZWMge1xuICBhYnN0cmFjdCBlbmNvZGVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZztcbiAgYWJzdHJhY3QgZGVjb2RlUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgZW5jb2RlU2VhcmNoKHNlYXJjaDogc3RyaW5nfHtbazogc3RyaW5nXTogdW5rbm93bn0pOiBzdHJpbmc7XG4gIGFic3RyYWN0IGRlY29kZVNlYXJjaChzZWFyY2g6IHN0cmluZyk6IHtbazogc3RyaW5nXTogdW5rbm93bn07XG5cbiAgYWJzdHJhY3QgZW5jb2RlSGFzaChoYXNoOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGRlY29kZUhhc2goaGFzaDogc3RyaW5nKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IG5vcm1hbGl6ZShocmVmOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGFic3RyYWN0IG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcsIHNlYXJjaDoge1trOiBzdHJpbmddOiB1bmtub3dufSwgaGFzaDogc3RyaW5nLCBiYXNlVXJsPzogc3RyaW5nKTpcbiAgICAgIHN0cmluZztcblxuICBhYnN0cmFjdCBhcmVFcXVhbCh2YWxBOiBzdHJpbmcsIHZhbEI6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgYWJzdHJhY3QgcGFyc2UodXJsOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiB7XG4gICAgaHJlZjogc3RyaW5nLFxuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIHNlYXJjaDogc3RyaW5nLFxuICAgIGhhc2g6IHN0cmluZyxcbiAgICBob3N0bmFtZTogc3RyaW5nLFxuICAgIHBvcnQ6IHN0cmluZyxcbiAgICBwYXRobmFtZTogc3RyaW5nXG4gIH07XG59XG5cbi8qKlxuICogQSBgQW5ndWxhckpTVXJsQ29kZWNgIHRoYXQgdXNlcyBsb2dpYyBmcm9tIEFuZ3VsYXJKUyB0byBzZXJpYWxpemUgYW5kIHBhcnNlIFVSTHNcbiAqIGFuZCBVUkwgcGFyYW1ldGVyc1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEFuZ3VsYXJKU1VybENvZGVjIGltcGxlbWVudHMgVXJsQ29kZWMge1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDE1XG4gIGVuY29kZVBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBzZWdtZW50cyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICBsZXQgaSA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIC8vIGRlY29kZSBmb3J3YXJkIHNsYXNoZXMgdG8gcHJldmVudCB0aGVtIGZyb20gYmVpbmcgZG91YmxlIGVuY29kZWRcbiAgICAgIHNlZ21lbnRzW2ldID0gZW5jb2RlVXJpU2VnbWVudChzZWdtZW50c1tpXS5yZXBsYWNlKC8lMkYvZywgJy8nKSk7XG4gICAgfVxuXG4gICAgcGF0aCA9IHNlZ21lbnRzLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gX3N0cmlwSW5kZXhIdG1sKChwYXRoICYmIHBhdGhbMF0gIT09ICcvJyAmJiAnLycgfHwgJycpICsgcGF0aCk7XG4gIH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDQyXG4gIGVuY29kZVNlYXJjaChzZWFyY2g6IHN0cmluZ3x7W2s6IHN0cmluZ106IHVua25vd259KTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHNlYXJjaCA9IHBhcnNlS2V5VmFsdWUoc2VhcmNoKTtcbiAgICB9XG5cbiAgICBzZWFyY2ggPSB0b0tleVZhbHVlKHNlYXJjaCk7XG4gICAgcmV0dXJuIHNlYXJjaCA/ICc/JyArIHNlYXJjaCA6ICcnO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0w0NFxuICBlbmNvZGVIYXNoKGhhc2g6IHN0cmluZykge1xuICAgIGhhc2ggPSBlbmNvZGVVcmlTZWdtZW50KGhhc2gpO1xuICAgIHJldHVybiBoYXNoID8gJyMnICsgaGFzaCA6ICcnO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0wyN1xuICBkZWNvZGVQYXRoKHBhdGg6IHN0cmluZywgaHRtbDVNb2RlID0gdHJ1ZSk6IHN0cmluZyB7XG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgbGV0IGkgPSBzZWdtZW50cy5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBzZWdtZW50c1tpXSA9IGRlY29kZVVSSUNvbXBvbmVudChzZWdtZW50c1tpXSk7XG4gICAgICBpZiAoaHRtbDVNb2RlKSB7XG4gICAgICAgIC8vIGVuY29kZSBmb3J3YXJkIHNsYXNoZXMgdG8gcHJldmVudCB0aGVtIGZyb20gYmVpbmcgbWlzdGFrZW4gZm9yIHBhdGggc2VwYXJhdG9yc1xuICAgICAgICBzZWdtZW50c1tpXSA9IHNlZ21lbnRzW2ldLnJlcGxhY2UoL1xcLy9nLCAnJTJGJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlZ21lbnRzLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMNzJcbiAgZGVjb2RlU2VhcmNoKHNlYXJjaDogc3RyaW5nKSB7IHJldHVybiBwYXJzZUtleVZhbHVlKHNlYXJjaCk7IH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDczXG4gIGRlY29kZUhhc2goaGFzaDogc3RyaW5nKSB7XG4gICAgaGFzaCA9IGRlY29kZVVSSUNvbXBvbmVudChoYXNoKTtcbiAgICByZXR1cm4gaGFzaFswXSA9PT0gJyMnID8gaGFzaC5zdWJzdHJpbmcoMSkgOiBoYXNoO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0wxNDlcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0w0MlxuICBub3JtYWxpemUoaHJlZjogc3RyaW5nKTogc3RyaW5nO1xuICBub3JtYWxpemUocGF0aDogc3RyaW5nLCBzZWFyY2g6IHtbazogc3RyaW5nXTogdW5rbm93bn0sIGhhc2g6IHN0cmluZywgYmFzZVVybD86IHN0cmluZyk6IHN0cmluZztcbiAgbm9ybWFsaXplKHBhdGhPckhyZWY6IHN0cmluZywgc2VhcmNoPzoge1trOiBzdHJpbmddOiB1bmtub3dufSwgaGFzaD86IHN0cmluZywgYmFzZVVybD86IHN0cmluZyk6XG4gICAgICBzdHJpbmcge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSB0aGlzLnBhcnNlKHBhdGhPckhyZWYsIGJhc2VVcmwpO1xuXG4gICAgICBpZiAodHlwZW9mIHBhcnNlZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2VydmVyVXJsID1cbiAgICAgICAgICBgJHtwYXJzZWQucHJvdG9jb2x9Oi8vJHtwYXJzZWQuaG9zdG5hbWV9JHtwYXJzZWQucG9ydCA/ICc6JyArIHBhcnNlZC5wb3J0IDogJyd9YDtcblxuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKFxuICAgICAgICAgIHRoaXMuZGVjb2RlUGF0aChwYXJzZWQucGF0aG5hbWUpLCB0aGlzLmRlY29kZVNlYXJjaChwYXJzZWQuc2VhcmNoKSxcbiAgICAgICAgICB0aGlzLmRlY29kZUhhc2gocGFyc2VkLmhhc2gpLCBzZXJ2ZXJVcmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbmNQYXRoID0gdGhpcy5lbmNvZGVQYXRoKHBhdGhPckhyZWYpO1xuICAgICAgY29uc3QgZW5jU2VhcmNoID0gc2VhcmNoICYmIHRoaXMuZW5jb2RlU2VhcmNoKHNlYXJjaCkgfHwgJyc7XG4gICAgICBjb25zdCBlbmNIYXNoID0gaGFzaCAmJiB0aGlzLmVuY29kZUhhc2goaGFzaCkgfHwgJyc7XG5cbiAgICAgIGxldCBqb2luZWRQYXRoID0gKGJhc2VVcmwgfHwgJycpICsgZW5jUGF0aDtcblxuICAgICAgaWYgKCFqb2luZWRQYXRoLmxlbmd0aCB8fCBqb2luZWRQYXRoWzBdICE9PSAnLycpIHtcbiAgICAgICAgam9pbmVkUGF0aCA9ICcvJyArIGpvaW5lZFBhdGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gam9pbmVkUGF0aCArIGVuY1NlYXJjaCArIGVuY0hhc2g7XG4gICAgfVxuICB9XG5cbiAgYXJlRXF1YWwodmFsQTogc3RyaW5nLCB2YWxCOiBzdHJpbmcpIHsgcmV0dXJuIHRoaXMubm9ybWFsaXplKHZhbEEpID09PSB0aGlzLm5vcm1hbGl6ZSh2YWxCKTsgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy91cmxVdGlscy5qcyNMNjBcbiAgcGFyc2UodXJsOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwsIGJhc2UpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogcGFyc2VkLmhyZWYsXG4gICAgICAgIHByb3RvY29sOiBwYXJzZWQucHJvdG9jb2wgPyBwYXJzZWQucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdDogcGFyc2VkLmhvc3QsXG4gICAgICAgIHNlYXJjaDogcGFyc2VkLnNlYXJjaCA/IHBhcnNlZC5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICBoYXNoOiBwYXJzZWQuaGFzaCA/IHBhcnNlZC5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgIGhvc3RuYW1lOiBwYXJzZWQuaG9zdG5hbWUsXG4gICAgICAgIHBvcnQ6IHBhcnNlZC5wb3J0LFxuICAgICAgICBwYXRobmFtZTogKHBhcnNlZC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgPyBwYXJzZWQucGF0aG5hbWUgOiAnLycgKyBwYXJzZWQucGF0aG5hbWVcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFVSTCAoJHt1cmx9KSB3aXRoIGJhc2UgKCR7YmFzZX0pYCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEluZGV4SHRtbCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwvaW5kZXguaHRtbCQvLCAnJyk7XG59XG5cbi8qKlxuICogVHJpZXMgdG8gZGVjb2RlIHRoZSBVUkkgY29tcG9uZW50IHdpdGhvdXQgdGhyb3dpbmcgYW4gZXhjZXB0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gc3RyIHZhbHVlIHBvdGVudGlhbCBVUkkgY29tcG9uZW50IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYHZhbHVlYCBjYW4gYmUgZGVjb2RlZFxuICogd2l0aCB0aGUgZGVjb2RlVVJJQ29tcG9uZW50IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiB0cnlEZWNvZGVVUklDb21wb25lbnQodmFsdWU6IHN0cmluZykge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWdub3JlIGFueSBpbnZhbGlkIHVyaSBjb21wb25lbnQuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5cbi8qKlxuICogUGFyc2VzIGFuIGVzY2FwZWQgdXJsIHF1ZXJ5IHN0cmluZyBpbnRvIGtleS12YWx1ZSBwYWlycy4gTG9naWMgdGFrZW4gZnJvbVxuICogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL0FuZ3VsYXIuanMjTDEzODJcbiAqIEByZXR1cm5zIHtPYmplY3QuPHN0cmluZyxib29sZWFufEFycmF5Pn1cbiAqL1xuZnVuY3Rpb24gcGFyc2VLZXlWYWx1ZShrZXlWYWx1ZTogc3RyaW5nKToge1trOiBzdHJpbmddOiB1bmtub3dufSB7XG4gIGNvbnN0IG9iajoge1trOiBzdHJpbmddOiB1bmtub3dufSA9IHt9O1xuICAoa2V5VmFsdWUgfHwgJycpLnNwbGl0KCcmJykuZm9yRWFjaCgoa2V5VmFsdWUpID0+IHtcbiAgICBsZXQgc3BsaXRQb2ludCwga2V5LCB2YWw7XG4gICAgaWYgKGtleVZhbHVlKSB7XG4gICAgICBrZXkgPSBrZXlWYWx1ZSA9IGtleVZhbHVlLnJlcGxhY2UoL1xcKy9nLCAnJTIwJyk7XG4gICAgICBzcGxpdFBvaW50ID0ga2V5VmFsdWUuaW5kZXhPZignPScpO1xuICAgICAgaWYgKHNwbGl0UG9pbnQgIT09IC0xKSB7XG4gICAgICAgIGtleSA9IGtleVZhbHVlLnN1YnN0cmluZygwLCBzcGxpdFBvaW50KTtcbiAgICAgICAgdmFsID0ga2V5VmFsdWUuc3Vic3RyaW5nKHNwbGl0UG9pbnQgKyAxKTtcbiAgICAgIH1cbiAgICAgIGtleSA9IHRyeURlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhbCA9IHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnID8gdHJ5RGVjb2RlVVJJQ29tcG9uZW50KHZhbCkgOiB0cnVlO1xuICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgb2JqW2tleV0gPSB2YWw7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmpba2V5XSkpIHtcbiAgICAgICAgICAob2JqW2tleV0gYXMgdW5rbm93bltdKS5wdXNoKHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2tleV0gPSBbb2JqW2tleV0sIHZhbF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgaW50byBrZXktdmFsdWUgcGFpcnMuIExvZ2ljIHRha2VuIGZyb21cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxNDA5XG4gKi9cbmZ1bmN0aW9uIHRvS2V5VmFsdWUob2JqOiB7W2s6IHN0cmluZ106IHVua25vd259KSB7XG4gIGNvbnN0IHBhcnRzOiB1bmtub3duW10gPSBbXTtcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgbGV0IHZhbHVlID0gb2JqW2tleV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YWx1ZS5mb3JFYWNoKChhcnJheVZhbHVlKSA9PiB7XG4gICAgICAgIHBhcnRzLnB1c2goXG4gICAgICAgICAgICBlbmNvZGVVcmlRdWVyeShrZXksIHRydWUpICtcbiAgICAgICAgICAgIChhcnJheVZhbHVlID09PSB0cnVlID8gJycgOiAnPScgKyBlbmNvZGVVcmlRdWVyeShhcnJheVZhbHVlLCB0cnVlKSkpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnB1c2goXG4gICAgICAgICAgZW5jb2RlVXJpUXVlcnkoa2V5LCB0cnVlKSArXG4gICAgICAgICAgKHZhbHVlID09PSB0cnVlID8gJycgOiAnPScgKyBlbmNvZGVVcmlRdWVyeSh2YWx1ZSBhcyBhbnksIHRydWUpKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJ0cy5sZW5ndGggPyBwYXJ0cy5qb2luKCcmJykgOiAnJztcbn1cblxuXG4vKipcbiAqIFdlIG5lZWQgb3VyIGN1c3RvbSBtZXRob2QgYmVjYXVzZSBlbmNvZGVVUklDb21wb25lbnQgaXMgdG9vIGFnZ3Jlc3NpdmUgYW5kIGRvZXNuJ3QgZm9sbG93XG4gKiBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmMzOTg2LnR4dCB3aXRoIHJlZ2FyZHMgdG8gdGhlIGNoYXJhY3RlciBzZXQgKHBjaGFyKSBhbGxvd2VkIGluIHBhdGhcbiAqIHNlZ21lbnRzOlxuICogICAgc2VnbWVudCAgICAgICA9ICpwY2hhclxuICogICAgcGNoYXIgICAgICAgICA9IHVucmVzZXJ2ZWQgLyBwY3QtZW5jb2RlZCAvIHN1Yi1kZWxpbXMgLyBcIjpcIiAvIFwiQFwiXG4gKiAgICBwY3QtZW5jb2RlZCAgID0gXCIlXCIgSEVYRElHIEhFWERJR1xuICogICAgdW5yZXNlcnZlZCAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIlxuICogICAgc3ViLWRlbGltcyAgICA9IFwiIVwiIC8gXCIkXCIgLyBcIiZcIiAvIFwiJ1wiIC8gXCIoXCIgLyBcIilcIlxuICogICAgICAgICAgICAgICAgICAgICAvIFwiKlwiIC8gXCIrXCIgLyBcIixcIiAvIFwiO1wiIC8gXCI9XCJcbiAqXG4gKiBMb2dpYyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxNDM3XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVyaVNlZ21lbnQodmFsOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGVuY29kZVVyaVF1ZXJ5KHZhbCwgdHJ1ZSlcbiAgICAgIC5yZXBsYWNlKC8lMjYvZ2ksICcmJylcbiAgICAgIC5yZXBsYWNlKC8lM0QvZ2ksICc9JylcbiAgICAgIC5yZXBsYWNlKC8lMkIvZ2ksICcrJyk7XG59XG5cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBpbnRlbmRlZCBmb3IgZW5jb2RpbmcgKmtleSogb3IgKnZhbHVlKiBwYXJ0cyBvZiBxdWVyeSBjb21wb25lbnQuIFdlIG5lZWQgYSBjdXN0b21cbiAqIG1ldGhvZCBiZWNhdXNlIGVuY29kZVVSSUNvbXBvbmVudCBpcyB0b28gYWdncmVzc2l2ZSBhbmQgZW5jb2RlcyBzdHVmZiB0aGF0IGRvZXNuJ3QgaGF2ZSB0byBiZVxuICogZW5jb2RlZCBwZXIgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NjpcbiAqICAgIHF1ZXJ5ICAgICAgICAgPSAqKCBwY2hhciAvIFwiL1wiIC8gXCI/XCIgKVxuICogICAgcGNoYXIgICAgICAgICA9IHVucmVzZXJ2ZWQgLyBwY3QtZW5jb2RlZCAvIHN1Yi1kZWxpbXMgLyBcIjpcIiAvIFwiQFwiXG4gKiAgICB1bnJlc2VydmVkICAgID0gQUxQSEEgLyBESUdJVCAvIFwiLVwiIC8gXCIuXCIgLyBcIl9cIiAvIFwiflwiXG4gKiAgICBwY3QtZW5jb2RlZCAgID0gXCIlXCIgSEVYRElHIEhFWERJR1xuICogICAgc3ViLWRlbGltcyAgICA9IFwiIVwiIC8gXCIkXCIgLyBcIiZcIiAvIFwiJ1wiIC8gXCIoXCIgLyBcIilcIlxuICogICAgICAgICAgICAgICAgICAgICAvIFwiKlwiIC8gXCIrXCIgLyBcIixcIiAvIFwiO1wiIC8gXCI9XCJcbiAqXG4gKiBMb2dpYyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxNDU2XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVyaVF1ZXJ5KHZhbDogc3RyaW5nLCBwY3RFbmNvZGVTcGFjZXM6IGJvb2xlYW4gPSBmYWxzZSkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbClcbiAgICAgIC5yZXBsYWNlKC8lNDAvZ2ksICdAJylcbiAgICAgIC5yZXBsYWNlKC8lM0EvZ2ksICc6JylcbiAgICAgIC5yZXBsYWNlKC8lMjQvZywgJyQnKVxuICAgICAgLnJlcGxhY2UoLyUyQy9naSwgJywnKVxuICAgICAgLnJlcGxhY2UoLyUzQi9naSwgJzsnKVxuICAgICAgLnJlcGxhY2UoLyUyMC9nLCAocGN0RW5jb2RlU3BhY2VzID8gJyUyMCcgOiAnKycpKTtcbn0iXX0=