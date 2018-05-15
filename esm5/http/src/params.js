/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
/**
 * A `HttpParameterCodec` that uses `encodeURIComponent` and `decodeURIComponent` to
 * serialize and parse URL parameter keys and values.
 *
 *
 */
var /**
 * A `HttpParameterCodec` that uses `encodeURIComponent` and `decodeURIComponent` to
 * serialize and parse URL parameter keys and values.
 *
 *
 */
HttpUrlEncodingCodec = /** @class */ (function () {
    function HttpUrlEncodingCodec() {
    }
    HttpUrlEncodingCodec.prototype.encodeKey = function (k) { return standardEncoding(k); };
    HttpUrlEncodingCodec.prototype.encodeValue = function (v) { return standardEncoding(v); };
    HttpUrlEncodingCodec.prototype.decodeKey = function (k) { return decodeURIComponent(k); };
    HttpUrlEncodingCodec.prototype.decodeValue = function (v) { return decodeURIComponent(v); };
    return HttpUrlEncodingCodec;
}());
/**
 * A `HttpParameterCodec` that uses `encodeURIComponent` and `decodeURIComponent` to
 * serialize and parse URL parameter keys and values.
 *
 *
 */
export { HttpUrlEncodingCodec };
function paramParser(rawParams, codec) {
    var map = new Map();
    if (rawParams.length > 0) {
        var params = rawParams.split('&');
        params.forEach(function (param) {
            var eqIdx = param.indexOf('=');
            var _a = tslib_1.__read(eqIdx == -1 ?
                [codec.decodeKey(param), ''] :
                [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))], 2), key = _a[0], val = _a[1];
            var list = map.get(key) || [];
            list.push(val);
            map.set(key, list);
        });
    }
    return map;
}
function standardEncoding(v) {
    return encodeURIComponent(v)
        .replace(/%40/gi, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/gi, '$')
        .replace(/%2C/gi, ',')
        .replace(/%3B/gi, ';')
        .replace(/%2B/gi, '+')
        .replace(/%3D/gi, '=')
        .replace(/%3F/gi, '?')
        .replace(/%2F/gi, '/');
}
/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable - all mutation operations return a new instance.
 *
 *
 */
var /**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable - all mutation operations return a new instance.
 *
 *
 */
HttpParams = /** @class */ (function () {
    function HttpParams(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.updates = null;
        this.cloneFrom = null;
        this.encoder = options.encoder || new HttpUrlEncodingCodec();
        if (!!options.fromString) {
            if (!!options.fromObject) {
                throw new Error("Cannot specify both fromString and fromObject.");
            }
            this.map = paramParser(options.fromString, this.encoder);
        }
        else if (!!options.fromObject) {
            this.map = new Map();
            Object.keys(options.fromObject).forEach(function (key) {
                var value = options.fromObject[key];
                _this.map.set(key, Array.isArray(value) ? value : [value]);
            });
        }
        else {
            this.map = null;
        }
    }
    /**
     * Check whether the body has one or more values for the given parameter name.
     */
    /**
       * Check whether the body has one or more values for the given parameter name.
       */
    HttpParams.prototype.has = /**
       * Check whether the body has one or more values for the given parameter name.
       */
    function (param) {
        this.init();
        return this.map.has(param);
    };
    /**
     * Get the first value for the given parameter name, or `null` if it's not present.
     */
    /**
       * Get the first value for the given parameter name, or `null` if it's not present.
       */
    HttpParams.prototype.get = /**
       * Get the first value for the given parameter name, or `null` if it's not present.
       */
    function (param) {
        this.init();
        var res = this.map.get(param);
        return !!res ? res[0] : null;
    };
    /**
     * Get all values for the given parameter name, or `null` if it's not present.
     */
    /**
       * Get all values for the given parameter name, or `null` if it's not present.
       */
    HttpParams.prototype.getAll = /**
       * Get all values for the given parameter name, or `null` if it's not present.
       */
    function (param) {
        this.init();
        return this.map.get(param) || null;
    };
    /**
     * Get all the parameter names for this body.
     */
    /**
       * Get all the parameter names for this body.
       */
    HttpParams.prototype.keys = /**
       * Get all the parameter names for this body.
       */
    function () {
        this.init();
        return Array.from(this.map.keys());
    };
    /**
     * Construct a new body with an appended value for the given parameter name.
     */
    /**
       * Construct a new body with an appended value for the given parameter name.
       */
    HttpParams.prototype.append = /**
       * Construct a new body with an appended value for the given parameter name.
       */
    function (param, value) { return this.clone({ param: param, value: value, op: 'a' }); };
    /**
     * Construct a new body with a new value for the given parameter name.
     */
    /**
       * Construct a new body with a new value for the given parameter name.
       */
    HttpParams.prototype.set = /**
       * Construct a new body with a new value for the given parameter name.
       */
    function (param, value) { return this.clone({ param: param, value: value, op: 's' }); };
    /**
     * Construct a new body with either the given value for the given parameter
     * removed, if a value is given, or all values for the given parameter removed
     * if not.
     */
    /**
       * Construct a new body with either the given value for the given parameter
       * removed, if a value is given, or all values for the given parameter removed
       * if not.
       */
    HttpParams.prototype.delete = /**
       * Construct a new body with either the given value for the given parameter
       * removed, if a value is given, or all values for the given parameter removed
       * if not.
       */
    function (param, value) { return this.clone({ param: param, value: value, op: 'd' }); };
    /**
     * Serialize the body to an encoded string, where key-value pairs (separated by `=`) are
     * separated by `&`s.
     */
    /**
       * Serialize the body to an encoded string, where key-value pairs (separated by `=`) are
       * separated by `&`s.
       */
    HttpParams.prototype.toString = /**
       * Serialize the body to an encoded string, where key-value pairs (separated by `=`) are
       * separated by `&`s.
       */
    function () {
        var _this = this;
        this.init();
        return this.keys()
            .map(function (key) {
            var eKey = _this.encoder.encodeKey(key);
            return _this.map.get(key).map(function (value) { return eKey + '=' + _this.encoder.encodeValue(value); })
                .join('&');
        })
            .join('&');
    };
    HttpParams.prototype.clone = function (update) {
        var clone = new HttpParams({ encoder: this.encoder });
        clone.cloneFrom = this.cloneFrom || this;
        clone.updates = (this.updates || []).concat([update]);
        return clone;
    };
    HttpParams.prototype.init = function () {
        var _this = this;
        if (this.map === null) {
            this.map = new Map();
        }
        if (this.cloneFrom !== null) {
            this.cloneFrom.init();
            this.cloneFrom.keys().forEach(function (key) { return _this.map.set(key, (_this.cloneFrom.map.get(key))); });
            this.updates.forEach(function (update) {
                switch (update.op) {
                    case 'a':
                    case 's':
                        var base = (update.op === 'a' ? _this.map.get(update.param) : undefined) || [];
                        base.push((update.value));
                        _this.map.set(update.param, base);
                        break;
                    case 'd':
                        if (update.value !== undefined) {
                            var base_1 = _this.map.get(update.param) || [];
                            var idx = base_1.indexOf(update.value);
                            if (idx !== -1) {
                                base_1.splice(idx, 1);
                            }
                            if (base_1.length > 0) {
                                _this.map.set(update.param, base_1);
                            }
                            else {
                                _this.map.delete(update.param);
                            }
                        }
                        else {
                            _this.map.delete(update.param);
                            break;
                        }
                }
            });
            this.cloneFrom = null;
        }
    };
    return HttpParams;
}());
/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable - all mutation operations return a new instance.
 *
 *
 */
export { HttpParams };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQTZCQTs7Ozs7O0FBQUE7OztJQUNFLHdDQUFTLEdBQVQsVUFBVSxDQUFTLElBQVksT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBRTVELDBDQUFXLEdBQVgsVUFBWSxDQUFTLElBQVksT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBRTlELHdDQUFTLEdBQVQsVUFBVSxDQUFTLElBQVksT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBRTlELDBDQUFXLEdBQVgsVUFBWSxDQUFTLElBQUksT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFOytCQXBDMUQ7SUFxQ0MsQ0FBQTs7Ozs7OztBQVJELGdDQVFDO0FBR0QscUJBQXFCLFNBQWlCLEVBQUUsS0FBeUI7SUFDL0QsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7SUFDeEMsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN4QixJQUFNLE1BQU0sR0FBYSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFhO1lBQzNCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakM7O3lHQUFPLFdBQUcsRUFBRSxXQUFHLENBRXlFO1lBQ3hGLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFD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LENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNoQyxNQUFNO3lCQUNQO2lCQUNKO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDdkI7S0FDRjtxQkFyT0g7SUFzT0MsQ0FBQTs7Ozs7Ozs7O0FBcElELHNCQW9JQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIGNvZGVjIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgcGFyYW1ldGVycyBpbiBVUkxzLlxuICpcbiAqIFVzZWQgYnkgYEh0dHBQYXJhbXNgLlxuICpcbiAqXG4gKiovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBQYXJhbWV0ZXJDb2RlYyB7XG4gIGVuY29kZUtleShrZXk6IHN0cmluZyk6IHN0cmluZztcbiAgZW5jb2RlVmFsdWUodmFsdWU6IHN0cmluZyk6IHN0cmluZztcblxuICBkZWNvZGVLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmc7XG4gIGRlY29kZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBgSHR0cFBhcmFtZXRlckNvZGVjYCB0aGF0IHVzZXMgYGVuY29kZVVSSUNvbXBvbmVudGAgYW5kIGBkZWNvZGVVUklDb21wb25lbnRgIHRvXG4gKiBzZXJpYWxpemUgYW5kIHBhcnNlIFVSTCBwYXJhbWV0ZXIga2V5cyBhbmQgdmFsdWVzLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwVXJsRW5jb2RpbmdDb2RlYyBpbXBsZW1lbnRzIEh0dHBQYXJhbWV0ZXJDb2RlYyB7XG4gIGVuY29kZUtleShrOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gc3RhbmRhcmRFbmNvZGluZyhrKTsgfVxuXG4gIGVuY29kZVZhbHVlKHY6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBzdGFuZGFyZEVuY29kaW5nKHYpOyB9XG5cbiAgZGVjb2RlS2V5KGs6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoayk7IH1cblxuICBkZWNvZGVWYWx1ZSh2OiBzdHJpbmcpIHsgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh2KTsgfVxufVxuXG5cbmZ1bmN0aW9uIHBhcmFtUGFyc2VyKHJhd1BhcmFtczogc3RyaW5nLCBjb2RlYzogSHR0cFBhcmFtZXRlckNvZGVjKTogTWFwPHN0cmluZywgc3RyaW5nW10+IHtcbiAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICBpZiAocmF3UGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBwYXJhbXM6IHN0cmluZ1tdID0gcmF3UGFyYW1zLnNwbGl0KCcmJyk7XG4gICAgcGFyYW1zLmZvckVhY2goKHBhcmFtOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IGVxSWR4ID0gcGFyYW0uaW5kZXhPZignPScpO1xuICAgICAgY29uc3QgW2tleSwgdmFsXTogc3RyaW5nW10gPSBlcUlkeCA9PSAtMSA/XG4gICAgICAgICAgW2NvZGVjLmRlY29kZUtleShwYXJhbSksICcnXSA6XG4gICAgICAgICAgW2NvZGVjLmRlY29kZUtleShwYXJhbS5zbGljZSgwLCBlcUlkeCkpLCBjb2RlYy5kZWNvZGVWYWx1ZShwYXJhbS5zbGljZShlcUlkeCArIDEpKV07XG4gICAgICBjb25zdCBsaXN0ID0gbWFwLmdldChrZXkpIHx8IFtdO1xuICAgICAgbGlzdC5wdXNoKHZhbCk7XG4gICAgICBtYXAuc2V0KGtleSwgbGlzdCk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cbmZ1bmN0aW9uIHN0YW5kYXJkRW5jb2Rpbmcodjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2KVxuICAgICAgLnJlcGxhY2UoLyU0MC9naSwgJ0AnKVxuICAgICAgLnJlcGxhY2UoLyUzQS9naSwgJzonKVxuICAgICAgLnJlcGxhY2UoLyUyNC9naSwgJyQnKVxuICAgICAgLnJlcGxhY2UoLyUyQy9naSwgJywnKVxuICAgICAgLnJlcGxhY2UoLyUzQi9naSwgJzsnKVxuICAgICAgLnJlcGxhY2UoLyUyQi9naSwgJysnKVxuICAgICAgLnJlcGxhY2UoLyUzRC9naSwgJz0nKVxuICAgICAgLnJlcGxhY2UoLyUzRi9naSwgJz8nKVxuICAgICAgLnJlcGxhY2UoLyUyRi9naSwgJy8nKTtcbn1cblxuaW50ZXJmYWNlIFVwZGF0ZSB7XG4gIHBhcmFtOiBzdHJpbmc7XG4gIHZhbHVlPzogc3RyaW5nO1xuICBvcDogJ2EnfCdkJ3wncyc7XG59XG5cbi8qKiBPcHRpb25zIHVzZWQgdG8gY29uc3RydWN0IGFuIGBIdHRwUGFyYW1zYCBpbnN0YW5jZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cFBhcmFtc09wdGlvbnMge1xuICAvKipcbiAgICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBIVFRQIHBhcmFtcyBpbiBVUkwtcXVlcnktc3RyaW5nIGZvcm1hdC4gTXV0dWFsbHkgZXhjbHVzaXZlIHdpdGhcbiAgICogYGZyb21PYmplY3RgLlxuICAgKi9cbiAgZnJvbVN0cmluZz86IHN0cmluZztcblxuICAvKiogT2JqZWN0IG1hcCBvZiB0aGUgSFRUUCBwYXJhbXMuIE11dGFsbHkgZXhjbHVzaXZlIHdpdGggYGZyb21TdHJpbmdgLiAqL1xuICBmcm9tT2JqZWN0Pzoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119O1xuXG4gIC8qKiBFbmNvZGluZyBjb2RlYyB1c2VkIHRvIHBhcnNlIGFuZCBzZXJpYWxpemUgdGhlIHBhcmFtcy4gKi9cbiAgZW5jb2Rlcj86IEh0dHBQYXJhbWV0ZXJDb2RlYztcbn1cblxuLyoqXG4gKiBBbiBIVFRQIHJlcXVlc3QvcmVzcG9uc2UgYm9keSB0aGF0IHJlcHJlc2VudHMgc2VyaWFsaXplZCBwYXJhbWV0ZXJzLFxuICogcGVyIHRoZSBNSU1FIHR5cGUgYGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZGAuXG4gKlxuICogVGhpcyBjbGFzcyBpcyBpbW11dGFibGUgLSBhbGwgbXV0YXRpb24gb3BlcmF0aW9ucyByZXR1cm4gYSBuZXcgaW5zdGFuY2UuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBQYXJhbXMge1xuICBwcml2YXRlIG1hcDogTWFwPHN0cmluZywgc3RyaW5nW10+fG51bGw7XG4gIHByaXZhdGUgZW5jb2RlcjogSHR0cFBhcmFtZXRlckNvZGVjO1xuICBwcml2YXRlIHVwZGF0ZXM6IFVwZGF0ZVtdfG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNsb25lRnJvbTogSHR0cFBhcmFtc3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBIdHRwUGFyYW1zT3B0aW9ucyA9IHt9IGFzIEh0dHBQYXJhbXNPcHRpb25zKSB7XG4gICAgdGhpcy5lbmNvZGVyID0gb3B0aW9ucy5lbmNvZGVyIHx8IG5ldyBIdHRwVXJsRW5jb2RpbmdDb2RlYygpO1xuICAgIGlmICghIW9wdGlvbnMuZnJvbVN0cmluZykge1xuICAgICAgaWYgKCEhb3B0aW9ucy5mcm9tT2JqZWN0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNwZWNpZnkgYm90aCBmcm9tU3RyaW5nIGFuZCBmcm9tT2JqZWN0LmApO1xuICAgICAgfVxuICAgICAgdGhpcy5tYXAgPSBwYXJhbVBhcnNlcihvcHRpb25zLmZyb21TdHJpbmcsIHRoaXMuZW5jb2Rlcik7XG4gICAgfSBlbHNlIGlmICghIW9wdGlvbnMuZnJvbU9iamVjdCkge1xuICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICBPYmplY3Qua2V5cyhvcHRpb25zLmZyb21PYmplY3QpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSAob3B0aW9ucy5mcm9tT2JqZWN0IGFzIGFueSlba2V5XTtcbiAgICAgICAgdGhpcy5tYXAgIS5zZXQoa2V5LCBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tYXAgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBib2R5IGhhcyBvbmUgb3IgbW9yZSB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZS5cbiAgICovXG4gIGhhcyhwYXJhbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMubWFwICEuaGFzKHBhcmFtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZpcnN0IHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWUsIG9yIGBudWxsYCBpZiBpdCdzIG5vdCBwcmVzZW50LlxuICAgKi9cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY29uc3QgcmVzID0gdGhpcy5tYXAgIS5nZXQocGFyYW0pO1xuICAgIHJldHVybiAhIXJlcyA/IHJlc1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZSwgb3IgYG51bGxgIGlmIGl0J3Mgbm90IHByZXNlbnQuXG4gICAqL1xuICBnZXRBbGwocGFyYW06IHN0cmluZyk6IHN0cmluZ1tdfG51bGwge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHJldHVybiB0aGlzLm1hcCAhLmdldChwYXJhbSkgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRoZSBwYXJhbWV0ZXIgbmFtZXMgZm9yIHRoaXMgYm9keS5cbiAgICovXG4gIGtleXMoKTogc3RyaW5nW10ge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubWFwICEua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgYm9keSB3aXRoIGFuIGFwcGVuZGVkIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWUuXG4gICAqL1xuICBhcHBlbmQocGFyYW06IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IEh0dHBQYXJhbXMgeyByZXR1cm4gdGhpcy5jbG9uZSh7cGFyYW0sIHZhbHVlLCBvcDogJ2EnfSk7IH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGJvZHkgd2l0aCBhIG5ldyB2YWx1ZSBmb3IgdGhlIGdpdmVuIHBhcmFtZXRlciBuYW1lLlxuICAgKi9cbiAgc2V0KHBhcmFtOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBIdHRwUGFyYW1zIHsgcmV0dXJuIHRoaXMuY2xvbmUoe3BhcmFtLCB2YWx1ZSwgb3A6ICdzJ30pOyB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBib2R5IHdpdGggZWl0aGVyIHRoZSBnaXZlbiB2YWx1ZSBmb3IgdGhlIGdpdmVuIHBhcmFtZXRlclxuICAgKiByZW1vdmVkLCBpZiBhIHZhbHVlIGlzIGdpdmVuLCBvciBhbGwgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIHJlbW92ZWRcbiAgICogaWYgbm90LlxuICAgKi9cbiAgZGVsZXRlIChwYXJhbTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZyk6IEh0dHBQYXJhbXMgeyByZXR1cm4gdGhpcy5jbG9uZSh7cGFyYW0sIHZhbHVlLCBvcDogJ2QnfSk7IH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBib2R5IHRvIGFuIGVuY29kZWQgc3RyaW5nLCB3aGVyZSBrZXktdmFsdWUgcGFpcnMgKHNlcGFyYXRlZCBieSBgPWApIGFyZVxuICAgKiBzZXBhcmF0ZWQgYnkgYCZgcy5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMua2V5cygpXG4gICAgICAgIC5tYXAoa2V5ID0+IHtcbiAgICAgICAgICBjb25zdCBlS2V5ID0gdGhpcy5lbmNvZGVyLmVuY29kZUtleShrZXkpO1xuICAgICAgICAgIHJldHVybiB0aGlzLm1hcCAhLmdldChrZXkpICEubWFwKHZhbHVlID0+IGVLZXkgKyAnPScgKyB0aGlzLmVuY29kZXIuZW5jb2RlVmFsdWUodmFsdWUpKVxuICAgICAgICAgICAgICAuam9pbignJicpO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJicpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9uZSh1cGRhdGU6IFVwZGF0ZSk6IEh0dHBQYXJhbXMge1xuICAgIGNvbnN0IGNsb25lID0gbmV3IEh0dHBQYXJhbXMoeyBlbmNvZGVyOiB0aGlzLmVuY29kZXIgfSBhcyBIdHRwUGFyYW1zT3B0aW9ucyk7XG4gICAgY2xvbmUuY2xvbmVGcm9tID0gdGhpcy5jbG9uZUZyb20gfHwgdGhpcztcbiAgICBjbG9uZS51cGRhdGVzID0gKHRoaXMudXBkYXRlcyB8fCBbXSkuY29uY2F0KFt1cGRhdGVdKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICBwcml2YXRlIGluaXQoKSB7XG4gICAgaWYgKHRoaXMubWFwID09PSBudWxsKSB7XG4gICAgICB0aGlzLm1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2xvbmVGcm9tICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNsb25lRnJvbS5pbml0KCk7XG4gICAgICB0aGlzLmNsb25lRnJvbS5rZXlzKCkuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXAgIS5zZXQoa2V5LCB0aGlzLmNsb25lRnJvbSAhLm1hcCAhLmdldChrZXkpICEpKTtcbiAgICAgIHRoaXMudXBkYXRlcyAhLmZvckVhY2godXBkYXRlID0+IHtcbiAgICAgICAgc3dpdGNoICh1cGRhdGUub3ApIHtcbiAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIGNvbnN0IGJhc2UgPSAodXBkYXRlLm9wID09PSAnYScgPyB0aGlzLm1hcCAhLmdldCh1cGRhdGUucGFyYW0pIDogdW5kZWZpbmVkKSB8fCBbXTtcbiAgICAgICAgICAgIGJhc2UucHVzaCh1cGRhdGUudmFsdWUgISk7XG4gICAgICAgICAgICB0aGlzLm1hcCAhLnNldCh1cGRhdGUucGFyYW0sIGJhc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICBpZiAodXBkYXRlLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbGV0IGJhc2UgPSB0aGlzLm1hcCAhLmdldCh1cGRhdGUucGFyYW0pIHx8IFtdO1xuICAgICAgICAgICAgICBjb25zdCBpZHggPSBiYXNlLmluZGV4T2YodXBkYXRlLnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChiYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcCAhLnNldCh1cGRhdGUucGFyYW0sIGJhc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwICEuZGVsZXRlKHVwZGF0ZS5wYXJhbSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubWFwICEuZGVsZXRlKHVwZGF0ZS5wYXJhbSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2xvbmVGcm9tID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==