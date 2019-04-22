/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
/**
 * A class that uses `encodeURIComponent` and `decodeURIComponent` to
 * serialize and parse URL parameter keys and values. If you pass URL query parameters
 * without encoding, the query parameters can get misinterpreted at the receiving end.
 * Use the `HttpParameterCodec` class to encode and decode the query-string values.
 *
 * @publicApi
 */
var HttpUrlEncodingCodec = /** @class */ (function () {
    function HttpUrlEncodingCodec() {
    }
    HttpUrlEncodingCodec.prototype.encodeKey = function (key) { return standardEncoding(key); };
    HttpUrlEncodingCodec.prototype.encodeValue = function (value) { return standardEncoding(value); };
    HttpUrlEncodingCodec.prototype.decodeKey = function (key) { return decodeURIComponent(key); };
    HttpUrlEncodingCodec.prototype.decodeValue = function (value) { return decodeURIComponent(value); };
    return HttpUrlEncodingCodec;
}());
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
 * @publicApi
 */
var HttpParams = /** @class */ (function () {
    function HttpParams(options) {
        var _this = this;
        if (options === void 0) { options = {}; }
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
    HttpParams.prototype.has = function (param) {
        this.init();
        return this.map.has(param);
    };
    /**
     * Get the first value for the given parameter name, or `null` if it's not present.
     */
    HttpParams.prototype.get = function (param) {
        this.init();
        var res = this.map.get(param);
        return !!res ? res[0] : null;
    };
    /**
     * Get all values for the given parameter name, or `null` if it's not present.
     */
    HttpParams.prototype.getAll = function (param) {
        this.init();
        return this.map.get(param) || null;
    };
    /**
     * Get all the parameter names for this body.
     */
    HttpParams.prototype.keys = function () {
        this.init();
        return Array.from(this.map.keys());
    };
    /**
     * Construct a new body with an appended value for the given parameter name.
     */
    HttpParams.prototype.append = function (param, value) { return this.clone({ param: param, value: value, op: 'a' }); };
    /**
     * Construct a new body with a new value for the given parameter name.
     */
    HttpParams.prototype.set = function (param, value) { return this.clone({ param: param, value: value, op: 's' }); };
    /**
     * Construct a new body with either the given value for the given parameter
     * removed, if a value is given, or all values for the given parameter removed
     * if not.
     */
    HttpParams.prototype.delete = function (param, value) { return this.clone({ param: param, value: value, op: 'd' }); };
    /**
     * Serialize the body to an encoded string, where key-value pairs (separated by `=`) are
     * separated by `&`s.
     */
    HttpParams.prototype.toString = function () {
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
            this.cloneFrom.keys().forEach(function (key) { return _this.map.set(key, _this.cloneFrom.map.get(key)); });
            this.updates.forEach(function (update) {
                switch (update.op) {
                    case 'a':
                    case 's':
                        var base = (update.op === 'a' ? _this.map.get(update.param) : undefined) || [];
                        base.push(update.value);
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
export { HttpParams };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBaUJIOzs7Ozs7O0dBT0c7QUFDSDtJQUFBO0lBUUEsQ0FBQztJQVBDLHdDQUFTLEdBQVQsVUFBVSxHQUFXLElBQVksT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFaEUsMENBQVcsR0FBWCxVQUFZLEtBQWEsSUFBWSxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RSx3Q0FBUyxHQUFULFVBQVUsR0FBVyxJQUFZLE9BQU8sa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWxFLDBDQUFXLEdBQVgsVUFBWSxLQUFhLElBQUksT0FBTyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsMkJBQUM7QUFBRCxDQUFDLEFBUkQsSUFRQzs7QUFHRCxTQUFTLFdBQVcsQ0FBQyxTQUFpQixFQUFFLEtBQXlCO0lBQy9ELElBQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBQ3hDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDeEIsSUFBTSxNQUFNLEdBQWEsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBYTtZQUMzQixJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUE7O3VHQUVpRixFQUZoRixXQUFHLEVBQUUsV0FFMkUsQ0FBQztZQUN4RixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJ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QUFJLENBQUMsR0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7NkJBQ2pDO3lCQUNGOzZCQUFNOzRCQUNMLEtBQUksQ0FBQyxHQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDaEMsTUFBTTt5QkFDUDtpQkFDSjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDdkI7SUFDSCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBcElELElBb0lDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEEgY29kZWMgZm9yIGVuY29kaW5nIGFuZCBkZWNvZGluZyBwYXJhbWV0ZXJzIGluIFVSTHMuXG4gKlxuICogVXNlZCBieSBgSHR0cFBhcmFtc2AuXG4gKlxuICogQHB1YmxpY0FwaVxuICoqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwUGFyYW1ldGVyQ29kZWMge1xuICBlbmNvZGVLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmc7XG4gIGVuY29kZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgZGVjb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nO1xuICBkZWNvZGVWYWx1ZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCB1c2VzIGBlbmNvZGVVUklDb21wb25lbnRgIGFuZCBgZGVjb2RlVVJJQ29tcG9uZW50YCB0b1xuICogc2VyaWFsaXplIGFuZCBwYXJzZSBVUkwgcGFyYW1ldGVyIGtleXMgYW5kIHZhbHVlcy4gSWYgeW91IHBhc3MgVVJMIHF1ZXJ5IHBhcmFtZXRlcnNcbiAqIHdpdGhvdXQgZW5jb2RpbmcsIHRoZSBxdWVyeSBwYXJhbWV0ZXJzIGNhbiBnZXQgbWlzaW50ZXJwcmV0ZWQgYXQgdGhlIHJlY2VpdmluZyBlbmQuXG4gKiBVc2UgdGhlIGBIdHRwUGFyYW1ldGVyQ29kZWNgIGNsYXNzIHRvIGVuY29kZSBhbmQgZGVjb2RlIHRoZSBxdWVyeS1zdHJpbmcgdmFsdWVzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBVcmxFbmNvZGluZ0NvZGVjIGltcGxlbWVudHMgSHR0cFBhcmFtZXRlckNvZGVjIHtcbiAgZW5jb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIHN0YW5kYXJkRW5jb2Rpbmcoa2V5KTsgfVxuXG4gIGVuY29kZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gc3RhbmRhcmRFbmNvZGluZyh2YWx1ZSk7IH1cblxuICBkZWNvZGVLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7IH1cblxuICBkZWNvZGVWYWx1ZSh2YWx1ZTogc3RyaW5nKSB7IHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpOyB9XG59XG5cblxuZnVuY3Rpb24gcGFyYW1QYXJzZXIocmF3UGFyYW1zOiBzdHJpbmcsIGNvZGVjOiBIdHRwUGFyYW1ldGVyQ29kZWMpOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gIGlmIChyYXdQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHBhcmFtczogc3RyaW5nW10gPSByYXdQYXJhbXMuc3BsaXQoJyYnKTtcbiAgICBwYXJhbXMuZm9yRWFjaCgocGFyYW06IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgZXFJZHggPSBwYXJhbS5pbmRleE9mKCc9Jyk7XG4gICAgICBjb25zdCBba2V5LCB2YWxdOiBzdHJpbmdbXSA9IGVxSWR4ID09IC0xID9cbiAgICAgICAgICBbY29kZWMuZGVjb2RlS2V5KHBhcmFtKSwgJyddIDpcbiAgICAgICAgICBbY29kZWMuZGVjb2RlS2V5KHBhcmFtLnNsaWNlKDAsIGVxSWR4KSksIGNvZGVjLmRlY29kZVZhbHVlKHBhcmFtLnNsaWNlKGVxSWR4ICsgMSkpXTtcbiAgICAgIGNvbnN0IGxpc3QgPSBtYXAuZ2V0KGtleSkgfHwgW107XG4gICAgICBsaXN0LnB1c2godmFsKTtcbiAgICAgIG1hcC5zZXQoa2V5LCBsaXN0KTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuZnVuY3Rpb24gc3RhbmRhcmRFbmNvZGluZyh2OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHYpXG4gICAgICAucmVwbGFjZSgvJTQwL2dpLCAnQCcpXG4gICAgICAucmVwbGFjZSgvJTNBL2dpLCAnOicpXG4gICAgICAucmVwbGFjZSgvJTI0L2dpLCAnJCcpXG4gICAgICAucmVwbGFjZSgvJTJDL2dpLCAnLCcpXG4gICAgICAucmVwbGFjZSgvJTNCL2dpLCAnOycpXG4gICAgICAucmVwbGFjZSgvJTJCL2dpLCAnKycpXG4gICAgICAucmVwbGFjZSgvJTNEL2dpLCAnPScpXG4gICAgICAucmVwbGFjZSgvJTNGL2dpLCAnPycpXG4gICAgICAucmVwbGFjZSgvJTJGL2dpLCAnLycpO1xufVxuXG5pbnRlcmZhY2UgVXBkYXRlIHtcbiAgcGFyYW06IHN0cmluZztcbiAgdmFsdWU/OiBzdHJpbmc7XG4gIG9wOiAnYSd8J2QnfCdzJztcbn1cblxuLyoqIE9wdGlvbnMgdXNlZCB0byBjb25zdHJ1Y3QgYW4gYEh0dHBQYXJhbXNgIGluc3RhbmNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwUGFyYW1zT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIEhUVFAgcGFyYW1zIGluIFVSTC1xdWVyeS1zdHJpbmcgZm9ybWF0LiBNdXR1YWxseSBleGNsdXNpdmUgd2l0aFxuICAgKiBgZnJvbU9iamVjdGAuXG4gICAqL1xuICBmcm9tU3RyaW5nPzogc3RyaW5nO1xuXG4gIC8qKiBPYmplY3QgbWFwIG9mIHRoZSBIVFRQIHBhcmFtcy4gTXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggYGZyb21TdHJpbmdgLiAqL1xuICBmcm9tT2JqZWN0Pzoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119O1xuXG4gIC8qKiBFbmNvZGluZyBjb2RlYyB1c2VkIHRvIHBhcnNlIGFuZCBzZXJpYWxpemUgdGhlIHBhcmFtcy4gKi9cbiAgZW5jb2Rlcj86IEh0dHBQYXJhbWV0ZXJDb2RlYztcbn1cblxuLyoqXG4gKiBBbiBIVFRQIHJlcXVlc3QvcmVzcG9uc2UgYm9keSB0aGF0IHJlcHJlc2VudHMgc2VyaWFsaXplZCBwYXJhbWV0ZXJzLFxuICogcGVyIHRoZSBNSU1FIHR5cGUgYGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZGAuXG4gKlxuICogVGhpcyBjbGFzcyBpcyBpbW11dGFibGUgLSBhbGwgbXV0YXRpb24gb3BlcmF0aW9ucyByZXR1cm4gYSBuZXcgaW5zdGFuY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cFBhcmFtcyB7XG4gIHByaXZhdGUgbWFwOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT58bnVsbDtcbiAgcHJpdmF0ZSBlbmNvZGVyOiBIdHRwUGFyYW1ldGVyQ29kZWM7XG4gIHByaXZhdGUgdXBkYXRlczogVXBkYXRlW118bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY2xvbmVGcm9tOiBIdHRwUGFyYW1zfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEh0dHBQYXJhbXNPcHRpb25zID0ge30gYXMgSHR0cFBhcmFtc09wdGlvbnMpIHtcbiAgICB0aGlzLmVuY29kZXIgPSBvcHRpb25zLmVuY29kZXIgfHwgbmV3IEh0dHBVcmxFbmNvZGluZ0NvZGVjKCk7XG4gICAgaWYgKCEhb3B0aW9ucy5mcm9tU3RyaW5nKSB7XG4gICAgICBpZiAoISFvcHRpb25zLmZyb21PYmplY3QpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc3BlY2lmeSBib3RoIGZyb21TdHJpbmcgYW5kIGZyb21PYmplY3QuYCk7XG4gICAgICB9XG4gICAgICB0aGlzLm1hcCA9IHBhcmFtUGFyc2VyKG9wdGlvbnMuZnJvbVN0cmluZywgdGhpcy5lbmNvZGVyKTtcbiAgICB9IGVsc2UgaWYgKCEhb3B0aW9ucy5mcm9tT2JqZWN0KSB7XG4gICAgICB0aGlzLm1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMuZnJvbU9iamVjdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IChvcHRpb25zLmZyb21PYmplY3QgYXMgYW55KVtrZXldO1xuICAgICAgICB0aGlzLm1hcCAhLnNldChrZXksIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1hcCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgaGFzIG9uZSBvciBtb3JlIHZhbHVlcyBmb3IgdGhlIGdpdmVuIHBhcmFtZXRlciBuYW1lLlxuICAgKi9cbiAgaGFzKHBhcmFtOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICByZXR1cm4gdGhpcy5tYXAgIS5oYXMocGFyYW0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZmlyc3QgdmFsdWUgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZSwgb3IgYG51bGxgIGlmIGl0J3Mgbm90IHByZXNlbnQuXG4gICAqL1xuICBnZXQocGFyYW06IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBjb25zdCByZXMgPSB0aGlzLm1hcCAhLmdldChwYXJhbSk7XG4gICAgcmV0dXJuICEhcmVzID8gcmVzWzBdIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHZhbHVlcyBmb3IgdGhlIGdpdmVuIHBhcmFtZXRlciBuYW1lLCBvciBgbnVsbGAgaWYgaXQncyBub3QgcHJlc2VudC5cbiAgICovXG4gIGdldEFsbChwYXJhbTogc3RyaW5nKTogc3RyaW5nW118bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMubWFwICEuZ2V0KHBhcmFtKSB8fCBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGhlIHBhcmFtZXRlciBuYW1lcyBmb3IgdGhpcyBib2R5LlxuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5tYXAgIS5rZXlzKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBib2R5IHdpdGggYW4gYXBwZW5kZWQgdmFsdWUgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZS5cbiAgICovXG4gIGFwcGVuZChwYXJhbTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogSHR0cFBhcmFtcyB7IHJldHVybiB0aGlzLmNsb25lKHtwYXJhbSwgdmFsdWUsIG9wOiAnYSd9KTsgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgYm9keSB3aXRoIGEgbmV3IHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWUuXG4gICAqL1xuICBzZXQocGFyYW06IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IEh0dHBQYXJhbXMgeyByZXR1cm4gdGhpcy5jbG9uZSh7cGFyYW0sIHZhbHVlLCBvcDogJ3MnfSk7IH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGJvZHkgd2l0aCBlaXRoZXIgdGhlIGdpdmVuIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyXG4gICAqIHJlbW92ZWQsIGlmIGEgdmFsdWUgaXMgZ2l2ZW4sIG9yIGFsbCB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgcmVtb3ZlZFxuICAgKiBpZiBub3QuXG4gICAqL1xuICBkZWxldGUgKHBhcmFtOiBzdHJpbmcsIHZhbHVlPzogc3RyaW5nKTogSHR0cFBhcmFtcyB7IHJldHVybiB0aGlzLmNsb25lKHtwYXJhbSwgdmFsdWUsIG9wOiAnZCd9KTsgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgdGhlIGJvZHkgdG8gYW4gZW5jb2RlZCBzdHJpbmcsIHdoZXJlIGtleS12YWx1ZSBwYWlycyAoc2VwYXJhdGVkIGJ5IGA9YCkgYXJlXG4gICAqIHNlcGFyYXRlZCBieSBgJmBzLlxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICByZXR1cm4gdGhpcy5rZXlzKClcbiAgICAgICAgLm1hcChrZXkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVLZXkgPSB0aGlzLmVuY29kZXIuZW5jb2RlS2V5KGtleSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubWFwICEuZ2V0KGtleSkgIS5tYXAodmFsdWUgPT4gZUtleSArICc9JyArIHRoaXMuZW5jb2Rlci5lbmNvZGVWYWx1ZSh2YWx1ZSkpXG4gICAgICAgICAgICAgIC5qb2luKCcmJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKCcmJyk7XG4gIH1cblxuICBwcml2YXRlIGNsb25lKHVwZGF0ZTogVXBkYXRlKTogSHR0cFBhcmFtcyB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgSHR0cFBhcmFtcyh7IGVuY29kZXI6IHRoaXMuZW5jb2RlciB9IGFzIEh0dHBQYXJhbXNPcHRpb25zKTtcbiAgICBjbG9uZS5jbG9uZUZyb20gPSB0aGlzLmNsb25lRnJvbSB8fCB0aGlzO1xuICAgIGNsb25lLnVwZGF0ZXMgPSAodGhpcy51cGRhdGVzIHx8IFtdKS5jb25jYXQoW3VwZGF0ZV0pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5tYXAgPT09IG51bGwpIHtcbiAgICAgIHRoaXMubWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jbG9uZUZyb20gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY2xvbmVGcm9tLmluaXQoKTtcbiAgICAgIHRoaXMuY2xvbmVGcm9tLmtleXMoKS5mb3JFYWNoKGtleSA9PiB0aGlzLm1hcCAhLnNldChrZXksIHRoaXMuY2xvbmVGcm9tICEubWFwICEuZ2V0KGtleSkgISkpO1xuICAgICAgdGhpcy51cGRhdGVzICEuZm9yRWFjaCh1cGRhdGUgPT4ge1xuICAgICAgICBzd2l0Y2ggKHVwZGF0ZS5vcCkge1xuICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgY29uc3QgYmFzZSA9ICh1cGRhdGUub3AgPT09ICdhJyA/IHRoaXMubWFwICEuZ2V0KHVwZGF0ZS5wYXJhbSkgOiB1bmRlZmluZWQpIHx8IFtdO1xuICAgICAgICAgICAgYmFzZS5wdXNoKHVwZGF0ZS52YWx1ZSAhKTtcbiAgICAgICAgICAgIHRoaXMubWFwICEuc2V0KHVwZGF0ZS5wYXJhbSwgYmFzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIGlmICh1cGRhdGUudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBsZXQgYmFzZSA9IHRoaXMubWFwICEuZ2V0KHVwZGF0ZS5wYXJhbSkgfHwgW107XG4gICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGJhc2UuaW5kZXhPZih1cGRhdGUudmFsdWUpO1xuICAgICAgICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGJhc2Uuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGJhc2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwICEuc2V0KHVwZGF0ZS5wYXJhbSwgYmFzZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAgIS5kZWxldGUodXBkYXRlLnBhcmFtKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5tYXAgIS5kZWxldGUodXBkYXRlLnBhcmFtKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5jbG9uZUZyb20gPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19