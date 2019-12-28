/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/upgrade/src/params.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
     * Encodes the path from the provided string
     *
     * @abstract
     * @param {?} path The path string
     * @return {?}
     */
    UrlCodec.prototype.encodePath = function (path) { };
    /**
     * Decodes the path from the provided string
     *
     * @abstract
     * @param {?} path The path string
     * @return {?}
     */
    UrlCodec.prototype.decodePath = function (path) { };
    /**
     * Encodes the search string from the provided string or object
     *
     * @abstract
     * @param {?} search
     * @return {?}
     */
    UrlCodec.prototype.encodeSearch = function (search) { };
    /**
     * Decodes the search objects from the provided string
     *
     * @abstract
     * @param {?} search
     * @return {?}
     */
    UrlCodec.prototype.decodeSearch = function (search) { };
    /**
     * Encodes the hash from the provided string
     *
     * @abstract
     * @param {?} hash
     * @return {?}
     */
    UrlCodec.prototype.encodeHash = function (hash) { };
    /**
     * Decodes the hash from the provided string
     *
     * @abstract
     * @param {?} hash
     * @return {?}
     */
    UrlCodec.prototype.decodeHash = function (hash) { };
    /**
     * Normalizes the URL from the provided string
     *
     * @abstract
     * @param {?} href
     * @return {?}
     */
    UrlCodec.prototype.normalize = function (href) { };
    /**
     * Normalizes the URL from the provided string, search, hash, and base URL parameters
     *
     * @abstract
     * @param {?} path The URL path
     * @param {?} search The search object
     * @param {?} hash The has string
     * @param {?=} baseUrl The base URL for the URL
     * @return {?}
     */
    UrlCodec.prototype.normalize = function (path, search, hash, baseUrl) { };
    /**
     * Checks whether the two strings are equal
     * @abstract
     * @param {?} valA First string for comparison
     * @param {?} valB Second string for comparison
     * @return {?}
     */
    UrlCodec.prototype.areEqual = function (valA, valB) { };
    /**
     * Parses the URL string based on the base URL
     *
     * @abstract
     * @param {?} url The full URL string
     * @param {?=} base The base for the URL
     * @return {?}
     */
    UrlCodec.prototype.parse = function (url, base) { };
}
/**
 * A `UrlCodec` that uses logic from AngularJS to serialize and parse URLs
 * and URL parameters.
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
            // Safari 12 throws an error when the URL constructor is called with an undefined base.
            /** @type {?} */
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
 * @return {?} the decoded URI if it can be decoded or else `undefined`.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3VwZ3JhZGUvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsTUFBTSxPQUFnQixRQUFRO0NBcUY3Qjs7Ozs7Ozs7O0lBL0VDLG9EQUEwQzs7Ozs7Ozs7SUFPMUMsb0RBQTBDOzs7Ozs7OztJQU8xQyx3REFBcUU7Ozs7Ozs7O0lBT3JFLHdEQUE4RDs7Ozs7Ozs7SUFPOUQsb0RBQTBDOzs7Ozs7OztJQU8xQyxvREFBMEM7Ozs7Ozs7O0lBTzFDLG1EQUF5Qzs7Ozs7Ozs7Ozs7SUFXekMsMEVBQ1c7Ozs7Ozs7O0lBT1gsd0RBQXVEOzs7Ozs7Ozs7SUFRdkQsb0RBU0U7Ozs7Ozs7O0FBU0osTUFBTSxPQUFPLGlCQUFpQjs7Ozs7O0lBRTVCLFVBQVUsQ0FBQyxJQUFZOztjQUNmLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQzs7WUFDNUIsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNO1FBRXZCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7WUFDVixtRUFBbUU7WUFDbkUsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDbEU7UUFFRCxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixPQUFPLGVBQWUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN4RSxDQUFDOzs7Ozs7SUFHRCxZQUFZLENBQUMsTUFBcUM7UUFDaEQsSUFBSSxPQUFPLE1BQU0sS0FB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QUNyQixPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztTQUNyQixPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztTQUNwQixPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztTQUNyQixPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztTQUNyQixPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIGNvZGVjIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgVVJMIHBhcnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBVcmxDb2RlYyB7XG4gIC8qKlxuICAgKiBFbmNvZGVzIHRoZSBwYXRoIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBzdHJpbmdcbiAgICovXG4gIGFic3RyYWN0IGVuY29kZVBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBEZWNvZGVzIHRoZSBwYXRoIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBzdHJpbmdcbiAgICovXG4gIGFic3RyYWN0IGRlY29kZVBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBFbmNvZGVzIHRoZSBzZWFyY2ggc3RyaW5nIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZyBvciBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIHBhdGggc3RyaW5nIG9yIG9iamVjdFxuICAgKi9cbiAgYWJzdHJhY3QgZW5jb2RlU2VhcmNoKHNlYXJjaDogc3RyaW5nfHtbazogc3RyaW5nXTogdW5rbm93bn0pOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIHNlYXJjaCBvYmplY3RzIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBzdHJpbmdcbiAgICovXG4gIGFic3RyYWN0IGRlY29kZVNlYXJjaChzZWFyY2g6IHN0cmluZyk6IHtbazogc3RyaW5nXTogdW5rbm93bn07XG5cbiAgLyoqXG4gICAqIEVuY29kZXMgdGhlIGhhc2ggZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBoYXNoIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3QgZW5jb2RlSGFzaChoYXNoOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIGhhc2ggZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBoYXNoIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3QgZGVjb2RlSGFzaChoYXNoOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIFVSTCBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIFVSTCBzdHJpbmdcbiAgICovXG4gIGFic3RyYWN0IG5vcm1hbGl6ZShocmVmOiBzdHJpbmcpOiBzdHJpbmc7XG5cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgVVJMIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZywgc2VhcmNoLCBoYXNoLCBhbmQgYmFzZSBVUkwgcGFyYW1ldGVyc1xuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgVVJMIHBhdGhcbiAgICogQHBhcmFtIHNlYXJjaCBUaGUgc2VhcmNoIG9iamVjdFxuICAgKiBAcGFyYW0gaGFzaCBUaGUgaGFzIHN0cmluZ1xuICAgKiBAcGFyYW0gYmFzZVVybCBUaGUgYmFzZSBVUkwgZm9yIHRoZSBVUkxcbiAgICovXG4gIGFic3RyYWN0IG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcsIHNlYXJjaDoge1trOiBzdHJpbmddOiB1bmtub3dufSwgaGFzaDogc3RyaW5nLCBiYXNlVXJsPzogc3RyaW5nKTpcbiAgICAgIHN0cmluZztcblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHR3byBzdHJpbmdzIGFyZSBlcXVhbFxuICAgKiBAcGFyYW0gdmFsQSBGaXJzdCBzdHJpbmcgZm9yIGNvbXBhcmlzb25cbiAgICogQHBhcmFtIHZhbEIgU2Vjb25kIHN0cmluZyBmb3IgY29tcGFyaXNvblxuICAgKi9cbiAgYWJzdHJhY3QgYXJlRXF1YWwodmFsQTogc3RyaW5nLCB2YWxCOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIFVSTCBzdHJpbmcgYmFzZWQgb24gdGhlIGJhc2UgVVJMXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVGhlIGZ1bGwgVVJMIHN0cmluZ1xuICAgKiBAcGFyYW0gYmFzZSBUaGUgYmFzZSBmb3IgdGhlIFVSTFxuICAgKi9cbiAgYWJzdHJhY3QgcGFyc2UodXJsOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiB7XG4gICAgaHJlZjogc3RyaW5nLFxuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIHNlYXJjaDogc3RyaW5nLFxuICAgIGhhc2g6IHN0cmluZyxcbiAgICBob3N0bmFtZTogc3RyaW5nLFxuICAgIHBvcnQ6IHN0cmluZyxcbiAgICBwYXRobmFtZTogc3RyaW5nXG4gIH07XG59XG5cbi8qKlxuICogQSBgVXJsQ29kZWNgIHRoYXQgdXNlcyBsb2dpYyBmcm9tIEFuZ3VsYXJKUyB0byBzZXJpYWxpemUgYW5kIHBhcnNlIFVSTHNcbiAqIGFuZCBVUkwgcGFyYW1ldGVycy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmd1bGFySlNVcmxDb2RlYyBpbXBsZW1lbnRzIFVybENvZGVjIHtcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0wxNVxuICBlbmNvZGVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgbGV0IGkgPSBzZWdtZW50cy5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAvLyBkZWNvZGUgZm9yd2FyZCBzbGFzaGVzIHRvIHByZXZlbnQgdGhlbSBmcm9tIGJlaW5nIGRvdWJsZSBlbmNvZGVkXG4gICAgICBzZWdtZW50c1tpXSA9IGVuY29kZVVyaVNlZ21lbnQoc2VnbWVudHNbaV0ucmVwbGFjZSgvJTJGL2csICcvJykpO1xuICAgIH1cblxuICAgIHBhdGggPSBzZWdtZW50cy5qb2luKCcvJyk7XG4gICAgcmV0dXJuIF9zdHJpcEluZGV4SHRtbCgocGF0aCAmJiBwYXRoWzBdICE9PSAnLycgJiYgJy8nIHx8ICcnKSArIHBhdGgpO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0w0MlxuICBlbmNvZGVTZWFyY2goc2VhcmNoOiBzdHJpbmd8e1trOiBzdHJpbmddOiB1bmtub3dufSk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBzZWFyY2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICBzZWFyY2ggPSBwYXJzZUtleVZhbHVlKHNlYXJjaCk7XG4gICAgfVxuXG4gICAgc2VhcmNoID0gdG9LZXlWYWx1ZShzZWFyY2gpO1xuICAgIHJldHVybiBzZWFyY2ggPyAnPycgKyBzZWFyY2ggOiAnJztcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMNDRcbiAgZW5jb2RlSGFzaChoYXNoOiBzdHJpbmcpIHtcbiAgICBoYXNoID0gZW5jb2RlVXJpU2VnbWVudChoYXNoKTtcbiAgICByZXR1cm4gaGFzaCA/ICcjJyArIGhhc2ggOiAnJztcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMMjdcbiAgZGVjb2RlUGF0aChwYXRoOiBzdHJpbmcsIGh0bWw1TW9kZSA9IHRydWUpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgIGxldCBpID0gc2VnbWVudHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgc2VnbWVudHNbaV0gPSBkZWNvZGVVUklDb21wb25lbnQoc2VnbWVudHNbaV0pO1xuICAgICAgaWYgKGh0bWw1TW9kZSkge1xuICAgICAgICAvLyBlbmNvZGUgZm9yd2FyZCBzbGFzaGVzIHRvIHByZXZlbnQgdGhlbSBmcm9tIGJlaW5nIG1pc3Rha2VuIGZvciBwYXRoIHNlcGFyYXRvcnNcbiAgICAgICAgc2VnbWVudHNbaV0gPSBzZWdtZW50c1tpXS5yZXBsYWNlKC9cXC8vZywgJyUyRicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWdtZW50cy5qb2luKCcvJyk7XG4gIH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDcyXG4gIGRlY29kZVNlYXJjaChzZWFyY2g6IHN0cmluZykgeyByZXR1cm4gcGFyc2VLZXlWYWx1ZShzZWFyY2gpOyB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0w3M1xuICBkZWNvZGVIYXNoKGhhc2g6IHN0cmluZykge1xuICAgIGhhc2ggPSBkZWNvZGVVUklDb21wb25lbnQoaGFzaCk7XG4gICAgcmV0dXJuIGhhc2hbMF0gPT09ICcjJyA/IGhhc2guc3Vic3RyaW5nKDEpIDogaGFzaDtcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMMTQ5XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMNDJcbiAgbm9ybWFsaXplKGhyZWY6IHN0cmluZyk6IHN0cmluZztcbiAgbm9ybWFsaXplKHBhdGg6IHN0cmluZywgc2VhcmNoOiB7W2s6IHN0cmluZ106IHVua25vd259LCBoYXNoOiBzdHJpbmcsIGJhc2VVcmw/OiBzdHJpbmcpOiBzdHJpbmc7XG4gIG5vcm1hbGl6ZShwYXRoT3JIcmVmOiBzdHJpbmcsIHNlYXJjaD86IHtbazogc3RyaW5nXTogdW5rbm93bn0sIGhhc2g/OiBzdHJpbmcsIGJhc2VVcmw/OiBzdHJpbmcpOlxuICAgICAgc3RyaW5nIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgcGFyc2VkID0gdGhpcy5wYXJzZShwYXRoT3JIcmVmLCBiYXNlVXJsKTtcblxuICAgICAgaWYgKHR5cGVvZiBwYXJzZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNlcnZlclVybCA9XG4gICAgICAgICAgYCR7cGFyc2VkLnByb3RvY29sfTovLyR7cGFyc2VkLmhvc3RuYW1lfSR7cGFyc2VkLnBvcnQgPyAnOicgKyBwYXJzZWQucG9ydCA6ICcnfWA7XG5cbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZShcbiAgICAgICAgICB0aGlzLmRlY29kZVBhdGgocGFyc2VkLnBhdGhuYW1lKSwgdGhpcy5kZWNvZGVTZWFyY2gocGFyc2VkLnNlYXJjaCksXG4gICAgICAgICAgdGhpcy5kZWNvZGVIYXNoKHBhcnNlZC5oYXNoKSwgc2VydmVyVXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZW5jUGF0aCA9IHRoaXMuZW5jb2RlUGF0aChwYXRoT3JIcmVmKTtcbiAgICAgIGNvbnN0IGVuY1NlYXJjaCA9IHNlYXJjaCAmJiB0aGlzLmVuY29kZVNlYXJjaChzZWFyY2gpIHx8ICcnO1xuICAgICAgY29uc3QgZW5jSGFzaCA9IGhhc2ggJiYgdGhpcy5lbmNvZGVIYXNoKGhhc2gpIHx8ICcnO1xuXG4gICAgICBsZXQgam9pbmVkUGF0aCA9IChiYXNlVXJsIHx8ICcnKSArIGVuY1BhdGg7XG5cbiAgICAgIGlmICgham9pbmVkUGF0aC5sZW5ndGggfHwgam9pbmVkUGF0aFswXSAhPT0gJy8nKSB7XG4gICAgICAgIGpvaW5lZFBhdGggPSAnLycgKyBqb2luZWRQYXRoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGpvaW5lZFBhdGggKyBlbmNTZWFyY2ggKyBlbmNIYXNoO1xuICAgIH1cbiAgfVxuXG4gIGFyZUVxdWFsKHZhbEE6IHN0cmluZywgdmFsQjogc3RyaW5nKSB7IHJldHVybiB0aGlzLm5vcm1hbGl6ZSh2YWxBKSA9PT0gdGhpcy5ub3JtYWxpemUodmFsQik7IH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvdXJsVXRpbHMuanMjTDYwXG4gIHBhcnNlKHVybDogc3RyaW5nLCBiYXNlPzogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFNhZmFyaSAxMiB0aHJvd3MgYW4gZXJyb3Igd2hlbiB0aGUgVVJMIGNvbnN0cnVjdG9yIGlzIGNhbGxlZCB3aXRoIGFuIHVuZGVmaW5lZCBiYXNlLlxuICAgICAgY29uc3QgcGFyc2VkID0gIWJhc2UgPyBuZXcgVVJMKHVybCkgOiBuZXcgVVJMKHVybCwgYmFzZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBocmVmOiBwYXJzZWQuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IHBhcnNlZC5wcm90b2NvbCA/IHBhcnNlZC5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICBob3N0OiBwYXJzZWQuaG9zdCxcbiAgICAgICAgc2VhcmNoOiBwYXJzZWQuc2VhcmNoID8gcGFyc2VkLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgIGhhc2g6IHBhcnNlZC5oYXNoID8gcGFyc2VkLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdG5hbWU6IHBhcnNlZC5ob3N0bmFtZSxcbiAgICAgICAgcG9ydDogcGFyc2VkLnBvcnQsXG4gICAgICAgIHBhdGhuYW1lOiAocGFyc2VkLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/IHBhcnNlZC5wYXRobmFtZSA6ICcvJyArIHBhcnNlZC5wYXRobmFtZVxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgVVJMICgke3VybH0pIHdpdGggYmFzZSAoJHtiYXNlfSlgKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX3N0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9pbmRleC5odG1sJC8sICcnKTtcbn1cblxuLyoqXG4gKiBUcmllcyB0byBkZWNvZGUgdGhlIFVSSSBjb21wb25lbnQgd2l0aG91dCB0aHJvd2luZyBhbiBleGNlcHRpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBzdHIgdmFsdWUgcG90ZW50aWFsIFVSSSBjb21wb25lbnQgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB0aGUgZGVjb2RlZCBVUkkgaWYgaXQgY2FuIGJlIGRlY29kZWQgb3IgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gdHJ5RGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElnbm9yZSBhbnkgaW52YWxpZCB1cmkgY29tcG9uZW50LlxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuXG4vKipcbiAqIFBhcnNlcyBhbiBlc2NhcGVkIHVybCBxdWVyeSBzdHJpbmcgaW50byBrZXktdmFsdWUgcGFpcnMuIExvZ2ljIHRha2VuIGZyb21cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxMzgyXG4gKi9cbmZ1bmN0aW9uIHBhcnNlS2V5VmFsdWUoa2V5VmFsdWU6IHN0cmluZyk6IHtbazogc3RyaW5nXTogdW5rbm93bn0ge1xuICBjb25zdCBvYmo6IHtbazogc3RyaW5nXTogdW5rbm93bn0gPSB7fTtcbiAgKGtleVZhbHVlIHx8ICcnKS5zcGxpdCgnJicpLmZvckVhY2goKGtleVZhbHVlKSA9PiB7XG4gICAgbGV0IHNwbGl0UG9pbnQsIGtleSwgdmFsO1xuICAgIGlmIChrZXlWYWx1ZSkge1xuICAgICAga2V5ID0ga2V5VmFsdWUgPSBrZXlWYWx1ZS5yZXBsYWNlKC9cXCsvZywgJyUyMCcpO1xuICAgICAgc3BsaXRQb2ludCA9IGtleVZhbHVlLmluZGV4T2YoJz0nKTtcbiAgICAgIGlmIChzcGxpdFBvaW50ICE9PSAtMSkge1xuICAgICAgICBrZXkgPSBrZXlWYWx1ZS5zdWJzdHJpbmcoMCwgc3BsaXRQb2ludCk7XG4gICAgICAgIHZhbCA9IGtleVZhbHVlLnN1YnN0cmluZyhzcGxpdFBvaW50ICsgMSk7XG4gICAgICB9XG4gICAgICBrZXkgPSB0cnlEZWNvZGVVUklDb21wb25lbnQoa2V5KTtcbiAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YWwgPSB0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJyA/IHRyeURlY29kZVVSSUNvbXBvbmVudCh2YWwpIDogdHJ1ZTtcbiAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIG9ialtrZXldID0gdmFsO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqW2tleV0pKSB7XG4gICAgICAgICAgKG9ialtrZXldIGFzIHVua25vd25bXSkucHVzaCh2YWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ialtrZXldID0gW29ialtrZXldLCB2YWxdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGludG8ga2V5LXZhbHVlIHBhaXJzLiBMb2dpYyB0YWtlbiBmcm9tXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvQW5ndWxhci5qcyNMMTQwOVxuICovXG5mdW5jdGlvbiB0b0tleVZhbHVlKG9iajoge1trOiBzdHJpbmddOiB1bmtub3dufSkge1xuICBjb25zdCBwYXJ0czogdW5rbm93bltdID0gW107XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIGxldCB2YWx1ZSA9IG9ialtrZXldO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgdmFsdWUuZm9yRWFjaCgoYXJyYXlWYWx1ZSkgPT4ge1xuICAgICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICAgICAgZW5jb2RlVXJpUXVlcnkoa2V5LCB0cnVlKSArXG4gICAgICAgICAgICAoYXJyYXlWYWx1ZSA9PT0gdHJ1ZSA/ICcnIDogJz0nICsgZW5jb2RlVXJpUXVlcnkoYXJyYXlWYWx1ZSwgdHJ1ZSkpKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICAgIGVuY29kZVVyaVF1ZXJ5KGtleSwgdHJ1ZSkgK1xuICAgICAgICAgICh2YWx1ZSA9PT0gdHJ1ZSA/ICcnIDogJz0nICsgZW5jb2RlVXJpUXVlcnkodmFsdWUgYXMgYW55LCB0cnVlKSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFydHMubGVuZ3RoID8gcGFydHMuam9pbignJicpIDogJyc7XG59XG5cblxuLyoqXG4gKiBXZSBuZWVkIG91ciBjdXN0b20gbWV0aG9kIGJlY2F1c2UgZW5jb2RlVVJJQ29tcG9uZW50IGlzIHRvbyBhZ2dyZXNzaXZlIGFuZCBkb2Vzbid0IGZvbGxvd1xuICogaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQgd2l0aCByZWdhcmRzIHRvIHRoZSBjaGFyYWN0ZXIgc2V0IChwY2hhcikgYWxsb3dlZCBpbiBwYXRoXG4gKiBzZWdtZW50czpcbiAqICAgIHNlZ21lbnQgICAgICAgPSAqcGNoYXJcbiAqICAgIHBjaGFyICAgICAgICAgPSB1bnJlc2VydmVkIC8gcGN0LWVuY29kZWQgLyBzdWItZGVsaW1zIC8gXCI6XCIgLyBcIkBcIlxuICogICAgcGN0LWVuY29kZWQgICA9IFwiJVwiIEhFWERJRyBIRVhESUdcbiAqICAgIHVucmVzZXJ2ZWQgICAgPSBBTFBIQSAvIERJR0lUIC8gXCItXCIgLyBcIi5cIiAvIFwiX1wiIC8gXCJ+XCJcbiAqICAgIHN1Yi1kZWxpbXMgICAgPSBcIiFcIiAvIFwiJFwiIC8gXCImXCIgLyBcIidcIiAvIFwiKFwiIC8gXCIpXCJcbiAqICAgICAgICAgICAgICAgICAgICAgLyBcIipcIiAvIFwiK1wiIC8gXCIsXCIgLyBcIjtcIiAvIFwiPVwiXG4gKlxuICogTG9naWMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvQW5ndWxhci5qcyNMMTQzN1xuICovXG5mdW5jdGlvbiBlbmNvZGVVcmlTZWdtZW50KHZhbDogc3RyaW5nKSB7XG4gIHJldHVybiBlbmNvZGVVcmlRdWVyeSh2YWwsIHRydWUpXG4gICAgICAucmVwbGFjZSgvJTI2L2dpLCAnJicpXG4gICAgICAucmVwbGFjZSgvJTNEL2dpLCAnPScpXG4gICAgICAucmVwbGFjZSgvJTJCL2dpLCAnKycpO1xufVxuXG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgaW50ZW5kZWQgZm9yIGVuY29kaW5nICprZXkqIG9yICp2YWx1ZSogcGFydHMgb2YgcXVlcnkgY29tcG9uZW50LiBXZSBuZWVkIGEgY3VzdG9tXG4gKiBtZXRob2QgYmVjYXVzZSBlbmNvZGVVUklDb21wb25lbnQgaXMgdG9vIGFnZ3Jlc3NpdmUgYW5kIGVuY29kZXMgc3R1ZmYgdGhhdCBkb2Vzbid0IGhhdmUgdG8gYmVcbiAqIGVuY29kZWQgcGVyIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODY6XG4gKiAgICBxdWVyeSAgICAgICAgID0gKiggcGNoYXIgLyBcIi9cIiAvIFwiP1wiIClcbiAqICAgIHBjaGFyICAgICAgICAgPSB1bnJlc2VydmVkIC8gcGN0LWVuY29kZWQgLyBzdWItZGVsaW1zIC8gXCI6XCIgLyBcIkBcIlxuICogICAgdW5yZXNlcnZlZCAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIlxuICogICAgcGN0LWVuY29kZWQgICA9IFwiJVwiIEhFWERJRyBIRVhESUdcbiAqICAgIHN1Yi1kZWxpbXMgICAgPSBcIiFcIiAvIFwiJFwiIC8gXCImXCIgLyBcIidcIiAvIFwiKFwiIC8gXCIpXCJcbiAqICAgICAgICAgICAgICAgICAgICAgLyBcIipcIiAvIFwiK1wiIC8gXCIsXCIgLyBcIjtcIiAvIFwiPVwiXG4gKlxuICogTG9naWMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvQW5ndWxhci5qcyNMMTQ1NlxuICovXG5mdW5jdGlvbiBlbmNvZGVVcmlRdWVyeSh2YWw6IHN0cmluZywgcGN0RW5jb2RlU3BhY2VzOiBib29sZWFuID0gZmFsc2UpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpXG4gICAgICAucmVwbGFjZSgvJTQwL2dpLCAnQCcpXG4gICAgICAucmVwbGFjZSgvJTNBL2dpLCAnOicpXG4gICAgICAucmVwbGFjZSgvJTI0L2csICckJylcbiAgICAgIC5yZXBsYWNlKC8lMkMvZ2ksICcsJylcbiAgICAgIC5yZXBsYWNlKC8lM0IvZ2ksICc7JylcbiAgICAgIC5yZXBsYWNlKC8lMjAvZywgKHBjdEVuY29kZVNwYWNlcyA/ICclMjAnIDogJysnKSk7XG59XG4iXX0=