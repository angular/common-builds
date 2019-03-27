/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A codec for encoding and decoding parameters in URLs.
 *
 * Used by `HttpParams`.
 *
 * \@publicApi
 *
 * @record
 */
export function HttpParameterCodec() { }
if (false) {
    /**
     * @param {?} key
     * @return {?}
     */
    HttpParameterCodec.prototype.encodeKey = function (key) { };
    /**
     * @param {?} value
     * @return {?}
     */
    HttpParameterCodec.prototype.encodeValue = function (value) { };
    /**
     * @param {?} key
     * @return {?}
     */
    HttpParameterCodec.prototype.decodeKey = function (key) { };
    /**
     * @param {?} value
     * @return {?}
     */
    HttpParameterCodec.prototype.decodeValue = function (value) { };
}
/**
 * A class that uses `encodeURIComponent` and `decodeURIComponent` to
 * serialize and parse URL parameter keys and values. If you pass URL query parameters
 * without encoding, the query parameters can get misinterpreted at the receiving end.
 * Use the `HttpParameterCodec` class to encode and decode the query-string values.
 *
 * \@publicApi
 */
export class HttpUrlEncodingCodec {
    /**
     * @param {?} key
     * @return {?}
     */
    encodeKey(key) { return standardEncoding(key); }
    /**
     * @param {?} value
     * @return {?}
     */
    encodeValue(value) { return standardEncoding(value); }
    /**
     * @param {?} key
     * @return {?}
     */
    decodeKey(key) { return decodeURIComponent(key); }
    /**
     * @param {?} value
     * @return {?}
     */
    decodeValue(value) { return decodeURIComponent(value); }
}
/**
 * @param {?} rawParams
 * @param {?} codec
 * @return {?}
 */
function paramParser(rawParams, codec) {
    /** @type {?} */
    const map = new Map();
    if (rawParams.length > 0) {
        /** @type {?} */
        const params = rawParams.split('&');
        params.forEach((param) => {
            /** @type {?} */
            const eqIdx = param.indexOf('=');
            const [key, val] = eqIdx == -1 ?
                [codec.decodeKey(param), ''] :
                [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))];
            /** @type {?} */
            const list = map.get(key) || [];
            list.push(val);
            map.set(key, list);
        });
    }
    return map;
}
/**
 * @param {?} v
 * @return {?}
 */
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
 * @record
 */
function Update() { }
if (false) {
    /** @type {?} */
    Update.prototype.param;
    /** @type {?|undefined} */
    Update.prototype.value;
    /** @type {?} */
    Update.prototype.op;
}
/**
 * Options used to construct an `HttpParams` instance.
 * @record
 */
export function HttpParamsOptions() { }
if (false) {
    /**
     * String representation of the HTTP params in URL-query-string format. Mutually exclusive with
     * `fromObject`.
     * @type {?|undefined}
     */
    HttpParamsOptions.prototype.fromString;
    /**
     * Object map of the HTTP params. Mutally exclusive with `fromString`.
     * @type {?|undefined}
     */
    HttpParamsOptions.prototype.fromObject;
    /**
     * Encoding codec used to parse and serialize the params.
     * @type {?|undefined}
     */
    HttpParamsOptions.prototype.encoder;
}
/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable - all mutation operations return a new instance.
 *
 * \@publicApi
 */
export class HttpParams {
    /**
     * @param {?=} options
     */
    constructor(options = (/** @type {?} */ ({}))) {
        this.updates = null;
        this.cloneFrom = null;
        this.encoder = options.encoder || new HttpUrlEncodingCodec();
        if (!!options.fromString) {
            if (!!options.fromObject) {
                throw new Error(`Cannot specify both fromString and fromObject.`);
            }
            this.map = paramParser(options.fromString, this.encoder);
        }
        else if (!!options.fromObject) {
            this.map = new Map();
            Object.keys(options.fromObject).forEach(key => {
                /** @type {?} */
                const value = ((/** @type {?} */ (options.fromObject)))[key];
                (/** @type {?} */ (this.map)).set(key, Array.isArray(value) ? value : [value]);
            });
        }
        else {
            this.map = null;
        }
    }
    /**
     * Check whether the body has one or more values for the given parameter name.
     * @param {?} param
     * @return {?}
     */
    has(param) {
        this.init();
        return (/** @type {?} */ (this.map)).has(param);
    }
    /**
     * Get the first value for the given parameter name, or `null` if it's not present.
     * @param {?} param
     * @return {?}
     */
    get(param) {
        this.init();
        /** @type {?} */
        const res = (/** @type {?} */ (this.map)).get(param);
        return !!res ? res[0] : null;
    }
    /**
     * Get all values for the given parameter name, or `null` if it's not present.
     * @param {?} param
     * @return {?}
     */
    getAll(param) {
        this.init();
        return (/** @type {?} */ (this.map)).get(param) || null;
    }
    /**
     * Get all the parameter names for this body.
     * @return {?}
     */
    keys() {
        this.init();
        return Array.from((/** @type {?} */ (this.map)).keys());
    }
    /**
     * Construct a new body with an appended value for the given parameter name.
     * @param {?} param
     * @param {?} value
     * @return {?}
     */
    append(param, value) { return this.clone({ param, value, op: 'a' }); }
    /**
     * Construct a new body with a new value for the given parameter name.
     * @param {?} param
     * @param {?} value
     * @return {?}
     */
    set(param, value) { return this.clone({ param, value, op: 's' }); }
    /**
     * Construct a new body with either the given value for the given parameter
     * removed, if a value is given, or all values for the given parameter removed
     * if not.
     * @param {?} param
     * @param {?=} value
     * @return {?}
     */
    delete(param, value) { return this.clone({ param, value, op: 'd' }); }
    /**
     * Serialize the body to an encoded string, where key-value pairs (separated by `=`) are
     * separated by `&`s.
     * @return {?}
     */
    toString() {
        this.init();
        return this.keys()
            .map(key => {
            /** @type {?} */
            const eKey = this.encoder.encodeKey(key);
            return (/** @type {?} */ ((/** @type {?} */ (this.map)).get(key))).map(value => eKey + '=' + this.encoder.encodeValue(value))
                .join('&');
        })
            .join('&');
    }
    /**
     * @private
     * @param {?} update
     * @return {?}
     */
    clone(update) {
        /** @type {?} */
        const clone = new HttpParams((/** @type {?} */ ({ encoder: this.encoder })));
        clone.cloneFrom = this.cloneFrom || this;
        clone.updates = (this.updates || []).concat([update]);
        return clone;
    }
    /**
     * @private
     * @return {?}
     */
    init() {
        if (this.map === null) {
            this.map = new Map();
        }
        if (this.cloneFrom !== null) {
            this.cloneFrom.init();
            this.cloneFrom.keys().forEach(key => (/** @type {?} */ (this.map)).set(key, (/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (this.cloneFrom)).map)).get(key)))));
            (/** @type {?} */ (this.updates)).forEach(update => {
                switch (update.op) {
                    case 'a':
                    case 's':
                        /** @type {?} */
                        const base = (update.op === 'a' ? (/** @type {?} */ (this.map)).get(update.param) : undefined) || [];
                        base.push((/** @type {?} */ (update.value)));
                        (/** @type {?} */ (this.map)).set(update.param, base);
                        break;
                    case 'd':
                        if (update.value !== undefined) {
                            /** @type {?} */
                            let base = (/** @type {?} */ (this.map)).get(update.param) || [];
                            /** @type {?} */
                            const idx = base.indexOf(update.value);
                            if (idx !== -1) {
                                base.splice(idx, 1);
                            }
                            if (base.length > 0) {
                                (/** @type {?} */ (this.map)).set(update.param, base);
                            }
                            else {
                                (/** @type {?} */ (this.map)).delete(update.param);
                            }
                        }
                        else {
                            (/** @type {?} */ (this.map)).delete(update.param);
                            break;
                        }
                }
            });
            this.cloneFrom = null;
        }
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    HttpParams.prototype.map;
    /**
     * @type {?}
     * @private
     */
    HttpParams.prototype.encoder;
    /**
     * @type {?}
     * @private
     */
    HttpParams.prototype.updates;
    /**
     * @type {?}
     * @private
     */
    HttpParams.prototype.cloneFrom;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWVBLHdDQU1DOzs7Ozs7SUFMQyw0REFBK0I7Ozs7O0lBQy9CLGdFQUFtQzs7Ozs7SUFFbkMsNERBQStCOzs7OztJQUMvQixnRUFBbUM7Ozs7Ozs7Ozs7QUFXckMsTUFBTSxPQUFPLG9CQUFvQjs7Ozs7SUFDL0IsU0FBUyxDQUFDLEdBQVcsSUFBWSxPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFaEUsV0FBVyxDQUFDLEtBQWEsSUFBWSxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFdEUsU0FBUyxDQUFDLEdBQVcsSUFBWSxPQUFPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFbEUsV0FBVyxDQUFDLEtBQWEsSUFBSSxPQUFPLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqRTs7Ozs7O0FBR0QsU0FBUyxXQUFXLENBQUMsU0FBaUIsRUFBRSxLQUF5Qjs7VUFDekQsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFvQjtJQUN2QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztjQUNsQixNQUFNLEdBQWEsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDN0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQWEsRUFBRSxFQUFFOztrQkFDekIsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2tCQUMxQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBYSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7a0JBQ2pGLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7Ozs7O0FBQ0QsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFTO0lBQ2pDLE9BQU8sa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQzs7OztBQUVELHFCQUlDOzs7SUFIQyx1QkFBYzs7SUFDZCx1QkFBZTs7SUFDZixvQkFBZ0I7Ozs7OztBQUlsQix1Q0FZQzs7Ozs7OztJQVBDLHVDQUFvQjs7Ozs7SUFHcEIsdUNBQWtEOzs7OztJQUdsRCxvQ0FBNkI7Ozs7Ozs7Ozs7QUFXL0IsTUFBTSxPQUFPLFVBQVU7Ozs7SUFNckIsWUFBWSxVQUE2QixtQkFBQSxFQUFFLEVBQXFCO1FBSHhELFlBQU8sR0FBa0IsSUFBSSxDQUFDO1FBQzlCLGNBQVMsR0FBb0IsSUFBSSxDQUFDO1FBR3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFDN0QsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtZQUN4QixJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7YUFDbkU7WUFDRCxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxRDthQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztZQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7O3NCQUN0QyxLQUFLLEdBQUcsQ0FBQyxtQkFBQSxPQUFPLENBQUMsVUFBVSxFQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQzlDLG1CQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQzs7Ozs7O0lBS0QsR0FBRyxDQUFDLEtBQWE7UUFDZixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixPQUFPLG1CQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQzs7Ozs7O0lBS0QsR0FBRyxDQUFDLEtBQWE7UUFDZixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O2NBQ04sR0FBRyxHQUFHLG1CQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQzs7Ozs7O0lBS0QsTUFBTSxDQUFDLEtBQWE7UUFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osT0FBTyxtQkFBQSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztJQUN2QyxDQUFDOzs7OztJQUtELElBQUk7UUFDRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQUEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQzs7Ozs7OztJQUtELE1BQU0sQ0FBQyxLQUFhLEVBQUUsS0FBYSxJQUFnQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7OztJQUtoRyxHQUFHLENBQUMsS0FBYSxFQUFFLEtBQWEsSUFBZ0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7OztJQU83RixNQUFNLENBQUUsS0FBYSxFQUFFLEtBQWMsSUFBZ0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQU1sRyxRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFO2FBQ2IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFOztrQkFDSCxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQ3hDLE9BQU8sbUJBQUEsbUJBQUEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2xGLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQzs7Ozs7O0lBRU8sS0FBSyxDQUFDLE1BQWM7O2NBQ3BCLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxtQkFBQSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQXFCLENBQUM7UUFDNUUsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQztRQUN6QyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7Ozs7SUFFTyxJQUFJO1FBQ1YsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksRUFBRTtZQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtZQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsbUJBQUEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsbUJBQUEsbUJBQUEsbUJBQUEsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RixtQkFBQSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM5QixRQUFRLE1BQU0sQ0FBQyxFQUFFLEVBQUU7b0JBQ2pCLEtBQUssR0FBRyxDQUFDO29CQUNULEtBQUssR0FBRzs7OEJBQ0EsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLG1CQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFO3dCQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFBLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO3dCQUMxQixtQkFBQSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ25DLE1BQU07b0JBQ1IsS0FBSyxHQUFHO3dCQUNOLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7O2dDQUMxQixJQUFJLEdBQUcsbUJBQUEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTs7a0NBQ3ZDLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7NEJBQ3RDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dDQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzZCQUNyQjs0QkFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dDQUNuQixtQkFBQSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7NkJBQ3BDO2lDQUFNO2dDQUNMLG1CQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUNqQzt5QkFDRjs2QkFBTTs0QkFDTCxtQkFBQSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDaEMsTUFBTTt5QkFDUDtpQkFDSjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDdkI7SUFDSCxDQUFDO0NBQ0Y7Ozs7OztJQW5JQyx5QkFBd0M7Ozs7O0lBQ3hDLDZCQUFvQzs7Ozs7SUFDcEMsNkJBQXNDOzs7OztJQUN0QywrQkFBMEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQSBjb2RlYyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIHBhcmFtZXRlcnMgaW4gVVJMcy5cbiAqXG4gKiBVc2VkIGJ5IGBIdHRwUGFyYW1zYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBQYXJhbWV0ZXJDb2RlYyB7XG4gIGVuY29kZUtleShrZXk6IHN0cmluZyk6IHN0cmluZztcbiAgZW5jb2RlVmFsdWUodmFsdWU6IHN0cmluZyk6IHN0cmluZztcblxuICBkZWNvZGVLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmc7XG4gIGRlY29kZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHVzZXMgYGVuY29kZVVSSUNvbXBvbmVudGAgYW5kIGBkZWNvZGVVUklDb21wb25lbnRgIHRvXG4gKiBzZXJpYWxpemUgYW5kIHBhcnNlIFVSTCBwYXJhbWV0ZXIga2V5cyBhbmQgdmFsdWVzLiBJZiB5b3UgcGFzcyBVUkwgcXVlcnkgcGFyYW1ldGVyc1xuICogd2l0aG91dCBlbmNvZGluZywgdGhlIHF1ZXJ5IHBhcmFtZXRlcnMgY2FuIGdldCBtaXNpbnRlcnByZXRlZCBhdCB0aGUgcmVjZWl2aW5nIGVuZC5cbiAqIFVzZSB0aGUgYEh0dHBQYXJhbWV0ZXJDb2RlY2AgY2xhc3MgdG8gZW5jb2RlIGFuZCBkZWNvZGUgdGhlIHF1ZXJ5LXN0cmluZyB2YWx1ZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cFVybEVuY29kaW5nQ29kZWMgaW1wbGVtZW50cyBIdHRwUGFyYW1ldGVyQ29kZWMge1xuICBlbmNvZGVLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gc3RhbmRhcmRFbmNvZGluZyhrZXkpOyB9XG5cbiAgZW5jb2RlVmFsdWUodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBzdGFuZGFyZEVuY29kaW5nKHZhbHVlKTsgfVxuXG4gIGRlY29kZUtleShrZXk6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoa2V5KTsgfVxuXG4gIGRlY29kZVZhbHVlKHZhbHVlOiBzdHJpbmcpIHsgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7IH1cbn1cblxuXG5mdW5jdGlvbiBwYXJhbVBhcnNlcihyYXdQYXJhbXM6IHN0cmluZywgY29kZWM6IEh0dHBQYXJhbWV0ZXJDb2RlYyk6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgaWYgKHJhd1BhcmFtcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgcGFyYW1zOiBzdHJpbmdbXSA9IHJhd1BhcmFtcy5zcGxpdCgnJicpO1xuICAgIHBhcmFtcy5mb3JFYWNoKChwYXJhbTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBlcUlkeCA9IHBhcmFtLmluZGV4T2YoJz0nKTtcbiAgICAgIGNvbnN0IFtrZXksIHZhbF06IHN0cmluZ1tdID0gZXFJZHggPT0gLTEgP1xuICAgICAgICAgIFtjb2RlYy5kZWNvZGVLZXkocGFyYW0pLCAnJ10gOlxuICAgICAgICAgIFtjb2RlYy5kZWNvZGVLZXkocGFyYW0uc2xpY2UoMCwgZXFJZHgpKSwgY29kZWMuZGVjb2RlVmFsdWUocGFyYW0uc2xpY2UoZXFJZHggKyAxKSldO1xuICAgICAgY29uc3QgbGlzdCA9IG1hcC5nZXQoa2V5KSB8fCBbXTtcbiAgICAgIGxpc3QucHVzaCh2YWwpO1xuICAgICAgbWFwLnNldChrZXksIGxpc3QpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiBzdGFuZGFyZEVuY29kaW5nKHY6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodilcbiAgICAgIC5yZXBsYWNlKC8lNDAvZ2ksICdAJylcbiAgICAgIC5yZXBsYWNlKC8lM0EvZ2ksICc6JylcbiAgICAgIC5yZXBsYWNlKC8lMjQvZ2ksICckJylcbiAgICAgIC5yZXBsYWNlKC8lMkMvZ2ksICcsJylcbiAgICAgIC5yZXBsYWNlKC8lM0IvZ2ksICc7JylcbiAgICAgIC5yZXBsYWNlKC8lMkIvZ2ksICcrJylcbiAgICAgIC5yZXBsYWNlKC8lM0QvZ2ksICc9JylcbiAgICAgIC5yZXBsYWNlKC8lM0YvZ2ksICc/JylcbiAgICAgIC5yZXBsYWNlKC8lMkYvZ2ksICcvJyk7XG59XG5cbmludGVyZmFjZSBVcGRhdGUge1xuICBwYXJhbTogc3RyaW5nO1xuICB2YWx1ZT86IHN0cmluZztcbiAgb3A6ICdhJ3wnZCd8J3MnO1xufVxuXG4vKiogT3B0aW9ucyB1c2VkIHRvIGNvbnN0cnVjdCBhbiBgSHR0cFBhcmFtc2AgaW5zdGFuY2UuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBQYXJhbXNPcHRpb25zIHtcbiAgLyoqXG4gICAqIFN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgSFRUUCBwYXJhbXMgaW4gVVJMLXF1ZXJ5LXN0cmluZyBmb3JtYXQuIE11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoXG4gICAqIGBmcm9tT2JqZWN0YC5cbiAgICovXG4gIGZyb21TdHJpbmc/OiBzdHJpbmc7XG5cbiAgLyoqIE9iamVjdCBtYXAgb2YgdGhlIEhUVFAgcGFyYW1zLiBNdXRhbGx5IGV4Y2x1c2l2ZSB3aXRoIGBmcm9tU3RyaW5nYC4gKi9cbiAgZnJvbU9iamVjdD86IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfTtcblxuICAvKiogRW5jb2RpbmcgY29kZWMgdXNlZCB0byBwYXJzZSBhbmQgc2VyaWFsaXplIHRoZSBwYXJhbXMuICovXG4gIGVuY29kZXI/OiBIdHRwUGFyYW1ldGVyQ29kZWM7XG59XG5cbi8qKlxuICogQW4gSFRUUCByZXF1ZXN0L3Jlc3BvbnNlIGJvZHkgdGhhdCByZXByZXNlbnRzIHNlcmlhbGl6ZWQgcGFyYW1ldGVycyxcbiAqIHBlciB0aGUgTUlNRSB0eXBlIGBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRgLlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgaW1tdXRhYmxlIC0gYWxsIG11dGF0aW9uIG9wZXJhdGlvbnMgcmV0dXJuIGEgbmV3IGluc3RhbmNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBQYXJhbXMge1xuICBwcml2YXRlIG1hcDogTWFwPHN0cmluZywgc3RyaW5nW10+fG51bGw7XG4gIHByaXZhdGUgZW5jb2RlcjogSHR0cFBhcmFtZXRlckNvZGVjO1xuICBwcml2YXRlIHVwZGF0ZXM6IFVwZGF0ZVtdfG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNsb25lRnJvbTogSHR0cFBhcmFtc3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBIdHRwUGFyYW1zT3B0aW9ucyA9IHt9IGFzIEh0dHBQYXJhbXNPcHRpb25zKSB7XG4gICAgdGhpcy5lbmNvZGVyID0gb3B0aW9ucy5lbmNvZGVyIHx8IG5ldyBIdHRwVXJsRW5jb2RpbmdDb2RlYygpO1xuICAgIGlmICghIW9wdGlvbnMuZnJvbVN0cmluZykge1xuICAgICAgaWYgKCEhb3B0aW9ucy5mcm9tT2JqZWN0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNwZWNpZnkgYm90aCBmcm9tU3RyaW5nIGFuZCBmcm9tT2JqZWN0LmApO1xuICAgICAgfVxuICAgICAgdGhpcy5tYXAgPSBwYXJhbVBhcnNlcihvcHRpb25zLmZyb21TdHJpbmcsIHRoaXMuZW5jb2Rlcik7XG4gICAgfSBlbHNlIGlmICghIW9wdGlvbnMuZnJvbU9iamVjdCkge1xuICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICBPYmplY3Qua2V5cyhvcHRpb25zLmZyb21PYmplY3QpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSAob3B0aW9ucy5mcm9tT2JqZWN0IGFzIGFueSlba2V5XTtcbiAgICAgICAgdGhpcy5tYXAgIS5zZXQoa2V5LCBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tYXAgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBib2R5IGhhcyBvbmUgb3IgbW9yZSB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZS5cbiAgICovXG4gIGhhcyhwYXJhbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMubWFwICEuaGFzKHBhcmFtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZpcnN0IHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWUsIG9yIGBudWxsYCBpZiBpdCdzIG5vdCBwcmVzZW50LlxuICAgKi9cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY29uc3QgcmVzID0gdGhpcy5tYXAgIS5nZXQocGFyYW0pO1xuICAgIHJldHVybiAhIXJlcyA/IHJlc1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZSwgb3IgYG51bGxgIGlmIGl0J3Mgbm90IHByZXNlbnQuXG4gICAqL1xuICBnZXRBbGwocGFyYW06IHN0cmluZyk6IHN0cmluZ1tdfG51bGwge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHJldHVybiB0aGlzLm1hcCAhLmdldChwYXJhbSkgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRoZSBwYXJhbWV0ZXIgbmFtZXMgZm9yIHRoaXMgYm9keS5cbiAgICovXG4gIGtleXMoKTogc3RyaW5nW10ge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubWFwICEua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgYm9keSB3aXRoIGFuIGFwcGVuZGVkIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWUuXG4gICAqL1xuICBhcHBlbmQocGFyYW06IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IEh0dHBQYXJhbXMgeyByZXR1cm4gdGhpcy5jbG9uZSh7cGFyYW0sIHZhbHVlLCBvcDogJ2EnfSk7IH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGJvZHkgd2l0aCBhIG5ldyB2YWx1ZSBmb3IgdGhlIGdpdmVuIHBhcmFtZXRlciBuYW1lLlxuICAgKi9cbiAgc2V0KHBhcmFtOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBIdHRwUGFyYW1zIHsgcmV0dXJuIHRoaXMuY2xvbmUoe3BhcmFtLCB2YWx1ZSwgb3A6ICdzJ30pOyB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBib2R5IHdpdGggZWl0aGVyIHRoZSBnaXZlbiB2YWx1ZSBmb3IgdGhlIGdpdmVuIHBhcmFtZXRlclxuICAgKiByZW1vdmVkLCBpZiBhIHZhbHVlIGlzIGdpdmVuLCBvciBhbGwgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIHJlbW92ZWRcbiAgICogaWYgbm90LlxuICAgKi9cbiAgZGVsZXRlIChwYXJhbTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZyk6IEh0dHBQYXJhbXMgeyByZXR1cm4gdGhpcy5jbG9uZSh7cGFyYW0sIHZhbHVlLCBvcDogJ2QnfSk7IH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBib2R5IHRvIGFuIGVuY29kZWQgc3RyaW5nLCB3aGVyZSBrZXktdmFsdWUgcGFpcnMgKHNlcGFyYXRlZCBieSBgPWApIGFyZVxuICAgKiBzZXBhcmF0ZWQgYnkgYCZgcy5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMua2V5cygpXG4gICAgICAgIC5tYXAoa2V5ID0+IHtcbiAgICAgICAgICBjb25zdCBlS2V5ID0gdGhpcy5lbmNvZGVyLmVuY29kZUtleShrZXkpO1xuICAgICAgICAgIHJldHVybiB0aGlzLm1hcCAhLmdldChrZXkpICEubWFwKHZhbHVlID0+IGVLZXkgKyAnPScgKyB0aGlzLmVuY29kZXIuZW5jb2RlVmFsdWUodmFsdWUpKVxuICAgICAgICAgICAgICAuam9pbignJicpO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJicpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9uZSh1cGRhdGU6IFVwZGF0ZSk6IEh0dHBQYXJhbXMge1xuICAgIGNvbnN0IGNsb25lID0gbmV3IEh0dHBQYXJhbXMoeyBlbmNvZGVyOiB0aGlzLmVuY29kZXIgfSBhcyBIdHRwUGFyYW1zT3B0aW9ucyk7XG4gICAgY2xvbmUuY2xvbmVGcm9tID0gdGhpcy5jbG9uZUZyb20gfHwgdGhpcztcbiAgICBjbG9uZS51cGRhdGVzID0gKHRoaXMudXBkYXRlcyB8fCBbXSkuY29uY2F0KFt1cGRhdGVdKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICBwcml2YXRlIGluaXQoKSB7XG4gICAgaWYgKHRoaXMubWFwID09PSBudWxsKSB7XG4gICAgICB0aGlzLm1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2xvbmVGcm9tICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNsb25lRnJvbS5pbml0KCk7XG4gICAgICB0aGlzLmNsb25lRnJvbS5rZXlzKCkuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXAgIS5zZXQoa2V5LCB0aGlzLmNsb25lRnJvbSAhLm1hcCAhLmdldChrZXkpICEpKTtcbiAgICAgIHRoaXMudXBkYXRlcyAhLmZvckVhY2godXBkYXRlID0+IHtcbiAgICAgICAgc3dpdGNoICh1cGRhdGUub3ApIHtcbiAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIGNvbnN0IGJhc2UgPSAodXBkYXRlLm9wID09PSAnYScgPyB0aGlzLm1hcCAhLmdldCh1cGRhdGUucGFyYW0pIDogdW5kZWZpbmVkKSB8fCBbXTtcbiAgICAgICAgICAgIGJhc2UucHVzaCh1cGRhdGUudmFsdWUgISk7XG4gICAgICAgICAgICB0aGlzLm1hcCAhLnNldCh1cGRhdGUucGFyYW0sIGJhc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICBpZiAodXBkYXRlLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbGV0IGJhc2UgPSB0aGlzLm1hcCAhLmdldCh1cGRhdGUucGFyYW0pIHx8IFtdO1xuICAgICAgICAgICAgICBjb25zdCBpZHggPSBiYXNlLmluZGV4T2YodXBkYXRlLnZhbHVlKTtcbiAgICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChiYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcCAhLnNldCh1cGRhdGUucGFyYW0sIGJhc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwICEuZGVsZXRlKHVwZGF0ZS5wYXJhbSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubWFwICEuZGVsZXRlKHVwZGF0ZS5wYXJhbSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2xvbmVGcm9tID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==