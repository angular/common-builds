/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Provides encoding and decoding of URL parameter and query-string values.
 *
 * Serializes and parses URL parameter keys and values to encode and decode them.
 * If you pass URL query parameters without encoding,
 * the query parameters can be misinterpreted at the receiving end.
 *
 *
 * @publicApi
 */
export class HttpUrlEncodingCodec {
    /**
     * Encodes a key name for a URL parameter or query-string.
     * @param key The key name.
     * @returns The encoded key name.
     */
    encodeKey(key) {
        return standardEncoding(key);
    }
    /**
     * Encodes the value of a URL parameter or query-string.
     * @param value The value.
     * @returns The encoded value.
     */
    encodeValue(value) {
        return standardEncoding(value);
    }
    /**
     * Decodes an encoded URL parameter or query-string key.
     * @param key The encoded key name.
     * @returns The decoded key name.
     */
    decodeKey(key) {
        return decodeURIComponent(key);
    }
    /**
     * Decodes an encoded URL parameter or query-string value.
     * @param value The encoded value.
     * @returns The decoded value.
     */
    decodeValue(value) {
        return decodeURIComponent(value);
    }
}
function paramParser(rawParams, codec) {
    const map = new Map();
    if (rawParams.length > 0) {
        // The `window.location.search` can be used while creating an instance of the `HttpParams` class
        // (e.g. `new HttpParams({ fromString: window.location.search })`). The `window.location.search`
        // may start with the `?` char, so we strip it if it's present.
        const params = rawParams.replace(/^\?/, '').split('&');
        params.forEach((param) => {
            const eqIdx = param.indexOf('=');
            const [key, val] = eqIdx == -1 ?
                [codec.decodeKey(param), ''] :
                [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))];
            const list = map.get(key) || [];
            list.push(val);
            map.set(key, list);
        });
    }
    return map;
}
/**
 * Encode input string with standard encodeURIComponent and then un-encode specific characters.
 */
const STANDARD_ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const STANDARD_ENCODING_REPLACEMENTS = {
    '40': '@',
    '3A': ':',
    '24': '$',
    '2C': ',',
    '3B': ';',
    '3D': '=',
    '3F': '?',
    '2F': '/',
};
function standardEncoding(v) {
    return encodeURIComponent(v).replace(STANDARD_ENCODING_REGEX, (s, t) => STANDARD_ENCODING_REPLACEMENTS[t] ?? s);
}
function valueToString(value) {
    return `${value}`;
}
/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable; all mutation operations return a new instance.
 *
 * @publicApi
 */
export class HttpParams {
    constructor(options = {}) {
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
                const value = options.fromObject[key];
                this.map.set(key, Array.isArray(value) ? value : [value]);
            });
        }
        else {
            this.map = null;
        }
    }
    /**
     * Reports whether the body includes one or more values for a given parameter.
     * @param param The parameter name.
     * @returns True if the parameter has one or more values,
     * false if it has no value or is not present.
     */
    has(param) {
        this.init();
        return this.map.has(param);
    }
    /**
     * Retrieves the first value for a parameter.
     * @param param The parameter name.
     * @returns The first value of the given parameter,
     * or `null` if the parameter is not present.
     */
    get(param) {
        this.init();
        const res = this.map.get(param);
        return !!res ? res[0] : null;
    }
    /**
     * Retrieves all values for a  parameter.
     * @param param The parameter name.
     * @returns All values in a string array,
     * or `null` if the parameter not present.
     */
    getAll(param) {
        this.init();
        return this.map.get(param) || null;
    }
    /**
     * Retrieves all the parameters for this body.
     * @returns The parameter names in a string array.
     */
    keys() {
        this.init();
        return Array.from(this.map.keys());
    }
    /**
     * Appends a new value to existing values for a parameter.
     * @param param The parameter name.
     * @param value The new value to add.
     * @return A new body with the appended value.
     */
    append(param, value) {
        return this.clone({ param, value, op: 'a' });
    }
    /**
     * Constructs a new body with appended values for the given parameter name.
     * @param params parameters and values
     * @return A new body with the new value.
     */
    appendAll(params) {
        const updates = [];
        Object.keys(params).forEach(param => {
            const value = params[param];
            if (Array.isArray(value)) {
                value.forEach(_value => {
                    updates.push({ param, value: _value, op: 'a' });
                });
            }
            else {
                updates.push({ param, value: value, op: 'a' });
            }
        });
        return this.clone(updates);
    }
    /**
     * Replaces the value for a parameter.
     * @param param The parameter name.
     * @param value The new value.
     * @return A new body with the new value.
     */
    set(param, value) {
        return this.clone({ param, value, op: 's' });
    }
    /**
     * Removes a given value or all values from a parameter.
     * @param param The parameter name.
     * @param value The value to remove, if provided.
     * @return A new body with the given value removed, or with all values
     * removed if no value is specified.
     */
    delete(param, value) {
        return this.clone({ param, value, op: 'd' });
    }
    /**
     * Serializes the body to an encoded string, where key-value pairs (separated by `=`) are
     * separated by `&`s.
     */
    toString() {
        this.init();
        return this.keys()
            .map(key => {
            const eKey = this.encoder.encodeKey(key);
            // `a: ['1']` produces `'a=1'`
            // `b: []` produces `''`
            // `c: ['1', '2']` produces `'c=1&c=2'`
            return this.map.get(key).map(value => eKey + '=' + this.encoder.encodeValue(value))
                .join('&');
        })
            // filter out empty values because `b: []` produces `''`
            // which results in `a=1&&c=1&c=2` instead of `a=1&c=1&c=2` if we don't
            .filter(param => param !== '')
            .join('&');
    }
    clone(update) {
        const clone = new HttpParams({ encoder: this.encoder });
        clone.cloneFrom = this.cloneFrom || this;
        clone.updates = (this.updates || []).concat(update);
        return clone;
    }
    init() {
        if (this.map === null) {
            this.map = new Map();
        }
        if (this.cloneFrom !== null) {
            this.cloneFrom.init();
            this.cloneFrom.keys().forEach(key => this.map.set(key, this.cloneFrom.map.get(key)));
            this.updates.forEach(update => {
                switch (update.op) {
                    case 'a':
                    case 's':
                        const base = (update.op === 'a' ? this.map.get(update.param) : undefined) || [];
                        base.push(valueToString(update.value));
                        this.map.set(update.param, base);
                        break;
                    case 'd':
                        if (update.value !== undefined) {
                            let base = this.map.get(update.param) || [];
                            const idx = base.indexOf(valueToString(update.value));
                            if (idx !== -1) {
                                base.splice(idx, 1);
                            }
                            if (base.length > 0) {
                                this.map.set(update.param, base);
                            }
                            else {
                                this.map.delete(update.param);
                            }
                        }
                        else {
                            this.map.delete(update.param);
                            break;
                        }
                }
            });
            this.cloneFrom = this.updates = null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFpQkg7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQjs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLEdBQVc7UUFDbkIsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLE9BQU8sZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLENBQUMsR0FBVztRQUNuQixPQUFPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLEtBQWE7UUFDdkIsT0FBTyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFHRCxTQUFTLFdBQVcsQ0FBQyxTQUFpQixFQUFFLEtBQXlCO0lBQy9ELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBQ3hDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDeEIsZ0dBQWdHO1FBQ2hHLGdHQUFnRztRQUNoRywrREFBK0Q7UUFDL0QsTUFBTSxNQUFNLEdBQWEsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRTtZQUMvQixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQWEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSx1QkFBdUIsR0FBRyxpQkFBaUIsQ0FBQztBQUNsRCxNQUFNLDhCQUE4QixHQUEwQjtJQUM1RCxJQUFJLEVBQUUsR0FBRztJQUNULElBQUksRUFBRSxHQUFHO0lBQ1QsSUFBSSxFQUFFLEdBQUc7SUFDVCxJQUFJLEVBQUUsR0FBRztJQUNULElBQUksRUFBRSxHQUFHO0lBQ1QsSUFBSSxFQUFFLEdBQUc7SUFDVCxJQUFJLEVBQUUsR0FBRztJQUNULElBQUksRUFBRSxHQUFHO0NBQ1YsQ0FBQztBQUVGLFNBQVMsZ0JBQWdCLENBQUMsQ0FBUztJQUNqQyxPQUFPLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FDaEMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqRixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsS0FBNEI7SUFDakQsT0FBTyxHQUFHLEtBQUssRUFBRSxDQUFDO0FBQ3BCLENBQUM7QUEyQkQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxVQUFVO0lBTXJCLFlBQVksVUFBNkIsRUFBdUI7UUFIeEQsWUFBTyxHQUFrQixJQUFJLENBQUM7UUFDOUIsY0FBUyxHQUFvQixJQUFJLENBQUM7UUFHeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLElBQUksb0JBQW9CLEVBQUUsQ0FBQztRQUM3RCxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQzthQUNuRTtZQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFEO2FBQU0sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtZQUMvQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUMsTUFBTSxLQUFLLEdBQUksT0FBTyxDQUFDLFVBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztTQUNqQjtJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEdBQUcsQ0FBQyxLQUFhO1FBQ2YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxHQUFHLENBQUMsS0FBYTtRQUNmLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLEtBQWE7UUFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQUk7UUFDRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxLQUFhLEVBQUUsS0FBNEI7UUFDaEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxNQUFxRjtRQUU3RixNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDLENBQUMsQ0FBQzthQUNKO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQW9DLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7YUFDN0U7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxHQUFHLENBQUMsS0FBYSxFQUFFLEtBQTRCO1FBQzdDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILE1BQU0sQ0FBQyxLQUFhLEVBQUUsS0FBNkI7UUFDakQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRTthQUNiLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNULE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLDhCQUE4QjtZQUM5Qix3QkFBd0I7WUFDeEIsdUNBQXVDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDaEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQztZQUNGLHdEQUF3RDtZQUN4RCx1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQzthQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQztJQUVPLEtBQUssQ0FBQyxNQUF1QjtRQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFzQixDQUFDLENBQUM7UUFDM0UsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQztRQUN6QyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU8sSUFBSTtRQUNWLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLEVBQUU7WUFDckIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztTQUN4QztRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBVSxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyxPQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM3QixRQUFRLE1BQU0sQ0FBQyxFQUFFLEVBQUU7b0JBQ2pCLEtBQUssR0FBRyxDQUFDO29CQUNULEtBQUssR0FBRzt3QkFDTixNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDakYsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ2xDLE1BQU07b0JBQ1IsS0FBSyxHQUFHO3dCQUNOLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7NEJBQzlCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQzdDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUN0RCxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtnQ0FDZCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzs2QkFDckI7NEJBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQ0FDbkIsSUFBSSxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs2QkFDbkM7aUNBQU07Z0NBQ0wsSUFBSSxDQUFDLEdBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUNoQzt5QkFDRjs2QkFBTTs0QkFDTCxJQUFJLENBQUMsR0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQy9CLE1BQU07eUJBQ1A7aUJBQ0o7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDdEM7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIGNvZGVjIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgcGFyYW1ldGVycyBpbiBVUkxzLlxuICpcbiAqIFVzZWQgYnkgYEh0dHBQYXJhbXNgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cFBhcmFtZXRlckNvZGVjIHtcbiAgZW5jb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nO1xuICBlbmNvZGVWYWx1ZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nO1xuXG4gIGRlY29kZUtleShrZXk6IHN0cmluZyk6IHN0cmluZztcbiAgZGVjb2RlVmFsdWUodmFsdWU6IHN0cmluZyk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBlbmNvZGluZyBhbmQgZGVjb2Rpbmcgb2YgVVJMIHBhcmFtZXRlciBhbmQgcXVlcnktc3RyaW5nIHZhbHVlcy5cbiAqXG4gKiBTZXJpYWxpemVzIGFuZCBwYXJzZXMgVVJMIHBhcmFtZXRlciBrZXlzIGFuZCB2YWx1ZXMgdG8gZW5jb2RlIGFuZCBkZWNvZGUgdGhlbS5cbiAqIElmIHlvdSBwYXNzIFVSTCBxdWVyeSBwYXJhbWV0ZXJzIHdpdGhvdXQgZW5jb2RpbmcsXG4gKiB0aGUgcXVlcnkgcGFyYW1ldGVycyBjYW4gYmUgbWlzaW50ZXJwcmV0ZWQgYXQgdGhlIHJlY2VpdmluZyBlbmQuXG4gKlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBVcmxFbmNvZGluZ0NvZGVjIGltcGxlbWVudHMgSHR0cFBhcmFtZXRlckNvZGVjIHtcbiAgLyoqXG4gICAqIEVuY29kZXMgYSBrZXkgbmFtZSBmb3IgYSBVUkwgcGFyYW1ldGVyIG9yIHF1ZXJ5LXN0cmluZy5cbiAgICogQHBhcmFtIGtleSBUaGUga2V5IG5hbWUuXG4gICAqIEByZXR1cm5zIFRoZSBlbmNvZGVkIGtleSBuYW1lLlxuICAgKi9cbiAgZW5jb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3RhbmRhcmRFbmNvZGluZyhrZXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuY29kZXMgdGhlIHZhbHVlIG9mIGEgVVJMIHBhcmFtZXRlciBvciBxdWVyeS1zdHJpbmcuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUuXG4gICAqIEByZXR1cm5zIFRoZSBlbmNvZGVkIHZhbHVlLlxuICAgKi9cbiAgZW5jb2RlVmFsdWUodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN0YW5kYXJkRW5jb2RpbmcodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29kZXMgYW4gZW5jb2RlZCBVUkwgcGFyYW1ldGVyIG9yIHF1ZXJ5LXN0cmluZyBrZXkuXG4gICAqIEBwYXJhbSBrZXkgVGhlIGVuY29kZWQga2V5IG5hbWUuXG4gICAqIEByZXR1cm5zIFRoZSBkZWNvZGVkIGtleSBuYW1lLlxuICAgKi9cbiAgZGVjb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlcyBhbiBlbmNvZGVkIFVSTCBwYXJhbWV0ZXIgb3IgcXVlcnktc3RyaW5nIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIGVuY29kZWQgdmFsdWUuXG4gICAqIEByZXR1cm5zIFRoZSBkZWNvZGVkIHZhbHVlLlxuICAgKi9cbiAgZGVjb2RlVmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gcGFyYW1QYXJzZXIocmF3UGFyYW1zOiBzdHJpbmcsIGNvZGVjOiBIdHRwUGFyYW1ldGVyQ29kZWMpOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gIGlmIChyYXdQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgIC8vIFRoZSBgd2luZG93LmxvY2F0aW9uLnNlYXJjaGAgY2FuIGJlIHVzZWQgd2hpbGUgY3JlYXRpbmcgYW4gaW5zdGFuY2Ugb2YgdGhlIGBIdHRwUGFyYW1zYCBjbGFzc1xuICAgIC8vIChlLmcuIGBuZXcgSHR0cFBhcmFtcyh7IGZyb21TdHJpbmc6IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggfSlgKS4gVGhlIGB3aW5kb3cubG9jYXRpb24uc2VhcmNoYFxuICAgIC8vIG1heSBzdGFydCB3aXRoIHRoZSBgP2AgY2hhciwgc28gd2Ugc3RyaXAgaXQgaWYgaXQncyBwcmVzZW50LlxuICAgIGNvbnN0IHBhcmFtczogc3RyaW5nW10gPSByYXdQYXJhbXMucmVwbGFjZSgvXlxcPy8sICcnKS5zcGxpdCgnJicpO1xuICAgIHBhcmFtcy5mb3JFYWNoKChwYXJhbTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBlcUlkeCA9IHBhcmFtLmluZGV4T2YoJz0nKTtcbiAgICAgIGNvbnN0IFtrZXksIHZhbF06IHN0cmluZ1tdID0gZXFJZHggPT0gLTEgP1xuICAgICAgICAgIFtjb2RlYy5kZWNvZGVLZXkocGFyYW0pLCAnJ10gOlxuICAgICAgICAgIFtjb2RlYy5kZWNvZGVLZXkocGFyYW0uc2xpY2UoMCwgZXFJZHgpKSwgY29kZWMuZGVjb2RlVmFsdWUocGFyYW0uc2xpY2UoZXFJZHggKyAxKSldO1xuICAgICAgY29uc3QgbGlzdCA9IG1hcC5nZXQoa2V5KSB8fCBbXTtcbiAgICAgIGxpc3QucHVzaCh2YWwpO1xuICAgICAgbWFwLnNldChrZXksIGxpc3QpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBtYXA7XG59XG5cbi8qKlxuICogRW5jb2RlIGlucHV0IHN0cmluZyB3aXRoIHN0YW5kYXJkIGVuY29kZVVSSUNvbXBvbmVudCBhbmQgdGhlbiB1bi1lbmNvZGUgc3BlY2lmaWMgY2hhcmFjdGVycy5cbiAqL1xuY29uc3QgU1RBTkRBUkRfRU5DT0RJTkdfUkVHRVggPSAvJShcXGRbYS1mMC05XSkvZ2k7XG5jb25zdCBTVEFOREFSRF9FTkNPRElOR19SRVBMQUNFTUVOVFM6IHtbeDogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJzQwJzogJ0AnLFxuICAnM0EnOiAnOicsXG4gICcyNCc6ICckJyxcbiAgJzJDJzogJywnLFxuICAnM0InOiAnOycsXG4gICczRCc6ICc9JyxcbiAgJzNGJzogJz8nLFxuICAnMkYnOiAnLycsXG59O1xuXG5mdW5jdGlvbiBzdGFuZGFyZEVuY29kaW5nKHY6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodikucmVwbGFjZShcbiAgICAgIFNUQU5EQVJEX0VOQ09ESU5HX1JFR0VYLCAocywgdCkgPT4gU1RBTkRBUkRfRU5DT0RJTkdfUkVQTEFDRU1FTlRTW3RdID8/IHMpO1xufVxuXG5mdW5jdGlvbiB2YWx1ZVRvU3RyaW5nKHZhbHVlOiBzdHJpbmd8bnVtYmVyfGJvb2xlYW4pOiBzdHJpbmcge1xuICByZXR1cm4gYCR7dmFsdWV9YDtcbn1cblxuaW50ZXJmYWNlIFVwZGF0ZSB7XG4gIHBhcmFtOiBzdHJpbmc7XG4gIHZhbHVlPzogc3RyaW5nfG51bWJlcnxib29sZWFuO1xuICBvcDogJ2EnfCdkJ3wncyc7XG59XG5cbi8qKlxuICogT3B0aW9ucyB1c2VkIHRvIGNvbnN0cnVjdCBhbiBgSHR0cFBhcmFtc2AgaW5zdGFuY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBQYXJhbXNPcHRpb25zIHtcbiAgLyoqXG4gICAqIFN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgSFRUUCBwYXJhbWV0ZXJzIGluIFVSTC1xdWVyeS1zdHJpbmcgZm9ybWF0LlxuICAgKiBNdXR1YWxseSBleGNsdXNpdmUgd2l0aCBgZnJvbU9iamVjdGAuXG4gICAqL1xuICBmcm9tU3RyaW5nPzogc3RyaW5nO1xuXG4gIC8qKiBPYmplY3QgbWFwIG9mIHRoZSBIVFRQIHBhcmFtZXRlcnMuIE11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGBmcm9tU3RyaW5nYC4gKi9cbiAgZnJvbU9iamVjdD86IHtbcGFyYW06IHN0cmluZ106IHN0cmluZ3xudW1iZXJ8Ym9vbGVhbnxSZWFkb25seUFycmF5PHN0cmluZ3xudW1iZXJ8Ym9vbGVhbj59O1xuXG4gIC8qKiBFbmNvZGluZyBjb2RlYyB1c2VkIHRvIHBhcnNlIGFuZCBzZXJpYWxpemUgdGhlIHBhcmFtZXRlcnMuICovXG4gIGVuY29kZXI/OiBIdHRwUGFyYW1ldGVyQ29kZWM7XG59XG5cbi8qKlxuICogQW4gSFRUUCByZXF1ZXN0L3Jlc3BvbnNlIGJvZHkgdGhhdCByZXByZXNlbnRzIHNlcmlhbGl6ZWQgcGFyYW1ldGVycyxcbiAqIHBlciB0aGUgTUlNRSB0eXBlIGBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRgLlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgaW1tdXRhYmxlOyBhbGwgbXV0YXRpb24gb3BlcmF0aW9ucyByZXR1cm4gYSBuZXcgaW5zdGFuY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cFBhcmFtcyB7XG4gIHByaXZhdGUgbWFwOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT58bnVsbDtcbiAgcHJpdmF0ZSBlbmNvZGVyOiBIdHRwUGFyYW1ldGVyQ29kZWM7XG4gIHByaXZhdGUgdXBkYXRlczogVXBkYXRlW118bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY2xvbmVGcm9tOiBIdHRwUGFyYW1zfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEh0dHBQYXJhbXNPcHRpb25zID0ge30gYXMgSHR0cFBhcmFtc09wdGlvbnMpIHtcbiAgICB0aGlzLmVuY29kZXIgPSBvcHRpb25zLmVuY29kZXIgfHwgbmV3IEh0dHBVcmxFbmNvZGluZ0NvZGVjKCk7XG4gICAgaWYgKCEhb3B0aW9ucy5mcm9tU3RyaW5nKSB7XG4gICAgICBpZiAoISFvcHRpb25zLmZyb21PYmplY3QpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc3BlY2lmeSBib3RoIGZyb21TdHJpbmcgYW5kIGZyb21PYmplY3QuYCk7XG4gICAgICB9XG4gICAgICB0aGlzLm1hcCA9IHBhcmFtUGFyc2VyKG9wdGlvbnMuZnJvbVN0cmluZywgdGhpcy5lbmNvZGVyKTtcbiAgICB9IGVsc2UgaWYgKCEhb3B0aW9ucy5mcm9tT2JqZWN0KSB7XG4gICAgICB0aGlzLm1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMuZnJvbU9iamVjdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IChvcHRpb25zLmZyb21PYmplY3QgYXMgYW55KVtrZXldO1xuICAgICAgICB0aGlzLm1hcCEuc2V0KGtleSwgQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWFwID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyB3aGV0aGVyIHRoZSBib2R5IGluY2x1ZGVzIG9uZSBvciBtb3JlIHZhbHVlcyBmb3IgYSBnaXZlbiBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSBwYXJhbSBUaGUgcGFyYW1ldGVyIG5hbWUuXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIHBhcmFtZXRlciBoYXMgb25lIG9yIG1vcmUgdmFsdWVzLFxuICAgKiBmYWxzZSBpZiBpdCBoYXMgbm8gdmFsdWUgb3IgaXMgbm90IHByZXNlbnQuXG4gICAqL1xuICBoYXMocGFyYW06IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHJldHVybiB0aGlzLm1hcCEuaGFzKHBhcmFtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGZpcnN0IHZhbHVlIGZvciBhIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHBhcmFtIFRoZSBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHJldHVybnMgVGhlIGZpcnN0IHZhbHVlIG9mIHRoZSBnaXZlbiBwYXJhbWV0ZXIsXG4gICAqIG9yIGBudWxsYCBpZiB0aGUgcGFyYW1ldGVyIGlzIG5vdCBwcmVzZW50LlxuICAgKi9cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY29uc3QgcmVzID0gdGhpcy5tYXAhLmdldChwYXJhbSk7XG4gICAgcmV0dXJuICEhcmVzID8gcmVzWzBdIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYWxsIHZhbHVlcyBmb3IgYSAgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0gcGFyYW0gVGhlIHBhcmFtZXRlciBuYW1lLlxuICAgKiBAcmV0dXJucyBBbGwgdmFsdWVzIGluIGEgc3RyaW5nIGFycmF5LFxuICAgKiBvciBgbnVsbGAgaWYgdGhlIHBhcmFtZXRlciBub3QgcHJlc2VudC5cbiAgICovXG4gIGdldEFsbChwYXJhbTogc3RyaW5nKTogc3RyaW5nW118bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMubWFwIS5nZXQocGFyYW0pIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFsbCB0aGUgcGFyYW1ldGVycyBmb3IgdGhpcyBib2R5LlxuICAgKiBAcmV0dXJucyBUaGUgcGFyYW1ldGVyIG5hbWVzIGluIGEgc3RyaW5nIGFycmF5LlxuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5tYXAhLmtleXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhIG5ldyB2YWx1ZSB0byBleGlzdGluZyB2YWx1ZXMgZm9yIGEgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0gcGFyYW0gVGhlIHBhcmFtZXRlciBuYW1lLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZSB0byBhZGQuXG4gICAqIEByZXR1cm4gQSBuZXcgYm9keSB3aXRoIHRoZSBhcHBlbmRlZCB2YWx1ZS5cbiAgICovXG4gIGFwcGVuZChwYXJhbTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfG51bWJlcnxib29sZWFuKTogSHR0cFBhcmFtcyB7XG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoe3BhcmFtLCB2YWx1ZSwgb3A6ICdhJ30pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgYm9keSB3aXRoIGFwcGVuZGVkIHZhbHVlcyBmb3IgdGhlIGdpdmVuIHBhcmFtZXRlciBuYW1lLlxuICAgKiBAcGFyYW0gcGFyYW1zIHBhcmFtZXRlcnMgYW5kIHZhbHVlc1xuICAgKiBAcmV0dXJuIEEgbmV3IGJvZHkgd2l0aCB0aGUgbmV3IHZhbHVlLlxuICAgKi9cbiAgYXBwZW5kQWxsKHBhcmFtczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nfG51bWJlcnxib29sZWFufFJlYWRvbmx5QXJyYXk8c3RyaW5nfG51bWJlcnxib29sZWFuPn0pOlxuICAgICAgSHR0cFBhcmFtcyB7XG4gICAgY29uc3QgdXBkYXRlczogVXBkYXRlW10gPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2gocGFyYW0gPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBwYXJhbXNbcGFyYW1dO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlLmZvckVhY2goX3ZhbHVlID0+IHtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goe3BhcmFtLCB2YWx1ZTogX3ZhbHVlLCBvcDogJ2EnfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXBkYXRlcy5wdXNoKHtwYXJhbSwgdmFsdWU6IHZhbHVlIGFzIChzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuKSwgb3A6ICdhJ30pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmNsb25lKHVwZGF0ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSB2YWx1ZSBmb3IgYSBwYXJhbWV0ZXIuXG4gICAqIEBwYXJhbSBwYXJhbSBUaGUgcGFyYW1ldGVyIG5hbWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlLlxuICAgKiBAcmV0dXJuIEEgbmV3IGJvZHkgd2l0aCB0aGUgbmV3IHZhbHVlLlxuICAgKi9cbiAgc2V0KHBhcmFtOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd8bnVtYmVyfGJvb2xlYW4pOiBIdHRwUGFyYW1zIHtcbiAgICByZXR1cm4gdGhpcy5jbG9uZSh7cGFyYW0sIHZhbHVlLCBvcDogJ3MnfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGdpdmVuIHZhbHVlIG9yIGFsbCB2YWx1ZXMgZnJvbSBhIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHBhcmFtIFRoZSBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byByZW1vdmUsIGlmIHByb3ZpZGVkLlxuICAgKiBAcmV0dXJuIEEgbmV3IGJvZHkgd2l0aCB0aGUgZ2l2ZW4gdmFsdWUgcmVtb3ZlZCwgb3Igd2l0aCBhbGwgdmFsdWVzXG4gICAqIHJlbW92ZWQgaWYgbm8gdmFsdWUgaXMgc3BlY2lmaWVkLlxuICAgKi9cbiAgZGVsZXRlKHBhcmFtOiBzdHJpbmcsIHZhbHVlPzogc3RyaW5nfG51bWJlcnxib29sZWFuKTogSHR0cFBhcmFtcyB7XG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoe3BhcmFtLCB2YWx1ZSwgb3A6ICdkJ30pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZXMgdGhlIGJvZHkgdG8gYW4gZW5jb2RlZCBzdHJpbmcsIHdoZXJlIGtleS12YWx1ZSBwYWlycyAoc2VwYXJhdGVkIGJ5IGA9YCkgYXJlXG4gICAqIHNlcGFyYXRlZCBieSBgJmBzLlxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICByZXR1cm4gdGhpcy5rZXlzKClcbiAgICAgICAgLm1hcChrZXkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVLZXkgPSB0aGlzLmVuY29kZXIuZW5jb2RlS2V5KGtleSk7XG4gICAgICAgICAgLy8gYGE6IFsnMSddYCBwcm9kdWNlcyBgJ2E9MSdgXG4gICAgICAgICAgLy8gYGI6IFtdYCBwcm9kdWNlcyBgJydgXG4gICAgICAgICAgLy8gYGM6IFsnMScsICcyJ11gIHByb2R1Y2VzIGAnYz0xJmM9MidgXG4gICAgICAgICAgcmV0dXJuIHRoaXMubWFwIS5nZXQoa2V5KSEubWFwKHZhbHVlID0+IGVLZXkgKyAnPScgKyB0aGlzLmVuY29kZXIuZW5jb2RlVmFsdWUodmFsdWUpKVxuICAgICAgICAgICAgICAuam9pbignJicpO1xuICAgICAgICB9KVxuICAgICAgICAvLyBmaWx0ZXIgb3V0IGVtcHR5IHZhbHVlcyBiZWNhdXNlIGBiOiBbXWAgcHJvZHVjZXMgYCcnYFxuICAgICAgICAvLyB3aGljaCByZXN1bHRzIGluIGBhPTEmJmM9MSZjPTJgIGluc3RlYWQgb2YgYGE9MSZjPTEmYz0yYCBpZiB3ZSBkb24ndFxuICAgICAgICAuZmlsdGVyKHBhcmFtID0+IHBhcmFtICE9PSAnJylcbiAgICAgICAgLmpvaW4oJyYnKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xvbmUodXBkYXRlOiBVcGRhdGV8VXBkYXRlW10pOiBIdHRwUGFyYW1zIHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBIdHRwUGFyYW1zKHtlbmNvZGVyOiB0aGlzLmVuY29kZXJ9IGFzIEh0dHBQYXJhbXNPcHRpb25zKTtcbiAgICBjbG9uZS5jbG9uZUZyb20gPSB0aGlzLmNsb25lRnJvbSB8fCB0aGlzO1xuICAgIGNsb25lLnVwZGF0ZXMgPSAodGhpcy51cGRhdGVzIHx8IFtdKS5jb25jYXQodXBkYXRlKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICBwcml2YXRlIGluaXQoKSB7XG4gICAgaWYgKHRoaXMubWFwID09PSBudWxsKSB7XG4gICAgICB0aGlzLm1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2xvbmVGcm9tICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNsb25lRnJvbS5pbml0KCk7XG4gICAgICB0aGlzLmNsb25lRnJvbS5rZXlzKCkuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXAhLnNldChrZXksIHRoaXMuY2xvbmVGcm9tIS5tYXAhLmdldChrZXkpISkpO1xuICAgICAgdGhpcy51cGRhdGVzIS5mb3JFYWNoKHVwZGF0ZSA9PiB7XG4gICAgICAgIHN3aXRjaCAodXBkYXRlLm9wKSB7XG4gICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICBjb25zdCBiYXNlID0gKHVwZGF0ZS5vcCA9PT0gJ2EnID8gdGhpcy5tYXAhLmdldCh1cGRhdGUucGFyYW0pIDogdW5kZWZpbmVkKSB8fCBbXTtcbiAgICAgICAgICAgIGJhc2UucHVzaCh2YWx1ZVRvU3RyaW5nKHVwZGF0ZS52YWx1ZSEpKTtcbiAgICAgICAgICAgIHRoaXMubWFwIS5zZXQodXBkYXRlLnBhcmFtLCBiYXNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgaWYgKHVwZGF0ZS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGxldCBiYXNlID0gdGhpcy5tYXAhLmdldCh1cGRhdGUucGFyYW0pIHx8IFtdO1xuICAgICAgICAgICAgICBjb25zdCBpZHggPSBiYXNlLmluZGV4T2YodmFsdWVUb1N0cmluZyh1cGRhdGUudmFsdWUpKTtcbiAgICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChiYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcCEuc2V0KHVwZGF0ZS5wYXJhbSwgYmFzZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAhLmRlbGV0ZSh1cGRhdGUucGFyYW0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLm1hcCEuZGVsZXRlKHVwZGF0ZS5wYXJhbSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2xvbmVGcm9tID0gdGhpcy51cGRhdGVzID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==