/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
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
 *
 *
 * @record
 */
export function HttpParameterCodec() { }
function HttpParameterCodec_tsickle_Closure_declarations() {
    /** @type {?} */
    HttpParameterCodec.prototype.encodeKey;
    /** @type {?} */
    HttpParameterCodec.prototype.encodeValue;
    /** @type {?} */
    HttpParameterCodec.prototype.decodeKey;
    /** @type {?} */
    HttpParameterCodec.prototype.decodeValue;
}
/**
 * A `HttpParameterCodec` that uses `encodeURIComponent` and `decodeURIComponent` to
 * serialize and parse URL parameter keys and values.
 *
 *
 */
export class HttpUrlEncodingCodec {
    /**
     * @param {?} k
     * @return {?}
     */
    encodeKey(k) { return standardEncoding(k); }
    /**
     * @param {?} v
     * @return {?}
     */
    encodeValue(v) { return standardEncoding(v); }
    /**
     * @param {?} k
     * @return {?}
     */
    decodeKey(k) { return decodeURIComponent(k); }
    /**
     * @param {?} v
     * @return {?}
     */
    decodeValue(v) { return decodeURIComponent(v); }
}
/**
 * @param {?} rawParams
 * @param {?} codec
 * @return {?}
 */
function paramParser(rawParams, codec) {
    const /** @type {?} */ map = new Map();
    if (rawParams.length > 0) {
        const /** @type {?} */ params = rawParams.split('&');
        params.forEach((param) => {
            const /** @type {?} */ eqIdx = param.indexOf('=');
            const [key, val] = eqIdx == -1 ?
                [codec.decodeKey(param), ''] :
                [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))];
            const /** @type {?} */ list = map.get(key) || [];
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
function Update_tsickle_Closure_declarations() {
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
function HttpParamsOptions_tsickle_Closure_declarations() {
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
 *
 */
export class HttpParams {
    /**
     * @param {?=} options
     */
    constructor(options = /** @type {?} */ ({})) {
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
                const /** @type {?} */ value = (/** @type {?} */ (options.fromObject))[key]; /** @type {?} */
                ((this.map)).set(key, Array.isArray(value) ? value : [value]);
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
        return /** @type {?} */ ((this.map)).has(param);
    }
    /**
     * Get the first value for the given parameter name, or `null` if it's not present.
     * @param {?} param
     * @return {?}
     */
    get(param) {
        this.init();
        const /** @type {?} */ res = /** @type {?} */ ((this.map)).get(param);
        return !!res ? res[0] : null;
    }
    /**
     * Get all values for the given parameter name, or `null` if it's not present.
     * @param {?} param
     * @return {?}
     */
    getAll(param) {
        this.init();
        return /** @type {?} */ ((this.map)).get(param) || null;
    }
    /**
     * Get all the parameter names for this body.
     * @return {?}
     */
    keys() {
        this.init();
        return Array.from(/** @type {?} */ ((this.map)).keys());
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
            const /** @type {?} */ eKey = this.encoder.encodeKey(key);
            return /** @type {?} */ ((/** @type {?} */ ((this.map)).get(key))).map(value => eKey + '=' + this.encoder.encodeValue(value)).join('&');
        })
            .join('&');
    }
    /**
     * @param {?} update
     * @return {?}
     */
    clone(update) {
        const /** @type {?} */ clone = new HttpParams(/** @type {?} */ ({ encoder: this.encoder }));
        clone.cloneFrom = this.cloneFrom || this;
        clone.updates = (this.updates || []).concat([update]);
        return clone;
    }
    /**
     * @return {?}
     */
    init() {
        if (this.map === null) {
            this.map = new Map();
        }
        if (this.cloneFrom !== null) {
            this.cloneFrom.init();
            this.cloneFrom.keys().forEach(key => /** @type {?} */ ((this.map)).set(key, /** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ ((this.cloneFrom)).map)).get(key))))); /** @type {?} */
            ((this.updates)).forEach(update => {
                switch (update.op) {
                    case 'a':
                    case 's':
                        const /** @type {?} */ base = (update.op === 'a' ? /** @type {?} */ ((this.map)).get(update.param) : undefined) || [];
                        base.push(/** @type {?} */ ((update.value))); /** @type {?} */
                        ((this.map)).set(update.param, base);
                        break;
                    case 'd':
                        if (update.value !== undefined) {
                            let /** @type {?} */ base = /** @type {?} */ ((this.map)).get(update.param) || [];
                            const /** @type {?} */ idx = base.indexOf(update.value);
                            if (idx !== -1) {
                                base.splice(idx, 1);
                            }
                            if (base.length > 0) {
                                /** @type {?} */ ((this.map)).set(update.param, base);
                            }
                            else {
                                /** @type {?} */ ((this.map)).delete(update.param);
                            }
                        }
                        else {
                            /** @type {?} */ ((this.map)).delete(update.param);
                            break;
                        }
                }
            });
            this.cloneFrom = null;
        }
    }
}
function HttpParams_tsickle_Closure_declarations() {
    /** @type {?} */
    HttpParams.prototype.map;
    /** @type {?} */
    HttpParams.prototype.encoder;
    /** @type {?} */
    HttpParams.prototype.updates;
    /** @type {?} */
    HttpParams.prototype.cloneFrom;
}
//# sourceMappingURL=params.js.map