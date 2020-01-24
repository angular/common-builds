/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/directives/styling_differ.ts
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
 * Used to diff and convert ngStyle/ngClass instructions into [style] and [class] bindings.
 *
 * ngStyle and ngClass both accept various forms of input and behave differently than that
 * of how [style] and [class] behave in Angular.
 *
 * The differences are:
 *  - ngStyle and ngClass both **deep-watch** their binding values for changes each time CD runs
 *    while [style] and [class] bindings do not (they check for identity changes)
 *  - ngStyle allows for unit-based keys (e.g. `{'max-width.px':value}`) and [style] does not
 *  - ngClass supports arrays of class values and [class] only accepts map and string values
 *  - ngClass allows for multiple className keys (space-separated) within an array or map
 *     (as the * key) while [class] only accepts a simple key/value map object
 *
 * Having Angular understand and adapt to all the different forms of behavior is complicated
 * and unnecessary. Instead, ngClass and ngStyle should have their input values be converted
 * into something that the core-level [style] and [class] bindings understand.
 *
 * This [StylingDiffer] class handles this conversion by creating a new output value each time
 * the input value of the binding value has changed (either via identity change or deep collection
 * content change).
 *
 * ## Why do we care about ngStyle/ngClass?
 * The styling algorithm code (documented inside of `render3/interfaces/styling.ts`) needs to
 * respect and understand the styling values emitted through ngStyle and ngClass (when they
 * are present and used in a template).
 *
 * Instead of having these directives manage styling on their own, they should be included
 * into the Angular styling algorithm that exists for [style] and [class] bindings.
 *
 * Here's why:
 *
 * - If ngStyle/ngClass is used in combination with [style]/[class] bindings then the
 *   styles and classes would fall out of sync and be applied and updated at
 *   inconsistent times
 * - Both ngClass/ngStyle should respect [class.name] and [style.prop] bindings (and not arbitrarily
 *   overwrite their changes)
 *
 *   ```
 *   <!-- if `w1` is updated then it will always override `w2`
 *        if `w2` is updated then it will always override `w1`
 *        if both are updated at the same time then `w1` wins -->
 *   <div [ngStyle]="{width:w1}" [style.width]="w2">...</div>
 *
 *   <!-- if `w1` is updated then it will always lose to `w2`
 *        if `w2` is updated then it will always override `w1`
 *        if both are updated at the same time then `w2` wins -->
 *   <div [style]="{width:w1}" [style.width]="w2">...</div>
 *   ```
 * - ngClass/ngStyle were written as a directives and made use of maps, closures and other
 *   expensive data structures which were evaluated each time CD runs
 * @template T
 */
export class StylingDiffer {
    /**
     * @param {?} _name
     * @param {?} _options
     */
    constructor(_name, _options) {
        this._name = _name;
        this._options = _options;
        /**
         * Normalized string map representing the last value set via `setValue()` or null if no value has
         * been set or the last set value was null
         */
        this.value = null;
        /**
         * The last set value that was applied via `setValue()`
         */
        this._inputValue = null;
        /**
         * The type of value that the `_lastSetValue` variable is
         */
        this._inputValueType = 0 /* Null */;
        /**
         * Whether or not the last value change occurred because the variable itself changed reference
         * (identity)
         */
        this._inputValueIdentityChangeSinceLastCheck = false;
    }
    /**
     * Sets the input value for the differ and updates the output value if necessary.
     *
     * @param {?} value the new styling input value provided from the ngClass/ngStyle binding
     * @return {?}
     */
    setInput(value) {
        if (value !== this._inputValue) {
            /** @type {?} */
            let type;
            if (!value) { // matches empty strings, null, false and undefined
                type = 0 /* Null */;
                value = null;
            }
            else if (Array.isArray(value)) {
                type = 4 /* Array */;
            }
            else if (value instanceof Set) {
                type = 8 /* Set */;
            }
            else if (typeof value === 'string') {
                if (!(this._options & 4 /* AllowStringValue */)) {
                    throw new Error(this._name + ' string values are not allowed');
                }
                type = 1 /* String */;
            }
            else {
                type = 2 /* StringMap */;
            }
            this._inputValue = value;
            this._inputValueType = type;
            this._inputValueIdentityChangeSinceLastCheck = true;
            this._processValueChange(true);
        }
    }
    /**
     * Checks the input value for identity or deep changes and updates output value if necessary.
     *
     * This function can be called right after `setValue()` is called, but it can also be
     * called incase the existing value (if it's a collection) changes internally. If the
     * value is indeed a collection it will do the necessary diffing work and produce a
     * new object value as assign that to `value`.
     *
     * @return {?} whether or not the value has changed in some way.
     */
    updateValue() {
        /** @type {?} */
        let valueHasChanged = this._inputValueIdentityChangeSinceLastCheck;
        if (!this._inputValueIdentityChangeSinceLastCheck &&
            (this._inputValueType & 14 /* Collection */)) {
            valueHasChanged = this._processValueChange(false);
        }
        else {
            // this is set to false in the event that the value is a collection.
            // This way (if the identity hasn't changed), then the algorithm can
            // diff the collection value to see if the contents have mutated
            // (otherwise the value change was processed during the time when
            // the variable changed).
            this._inputValueIdentityChangeSinceLastCheck = false;
        }
        return valueHasChanged;
    }
    /**
     * Examines the last set value to see if there was a change in content.
     *
     * @private
     * @param {?} inputValueIdentityChanged whether or not the last set value changed in identity or not
     * @return {?} `true` when the value has changed (either by identity or by shape if its a
     * collection)
     */
    _processValueChange(inputValueIdentityChanged) {
        // if the inputValueIdentityChanged then we know that input has changed
        /** @type {?} */
        let inputChanged = inputValueIdentityChanged;
        /** @type {?} */
        let newOutputValue = null;
        /** @type {?} */
        const trimValues = (this._options & 1 /* TrimProperties */) ? true : false;
        /** @type {?} */
        const parseOutUnits = (this._options & 8 /* AllowUnits */) ? true : false;
        /** @type {?} */
        const allowSubKeys = (this._options & 2 /* AllowSubKeys */) ? true : false;
        switch (this._inputValueType) {
            // case 1: [input]="string"
            case 1 /* String */: {
                if (inputValueIdentityChanged) {
                    // process string input only if the identity has changed since the strings are immutable
                    /** @type {?} */
                    const keys = ((/** @type {?} */ (this._inputValue))).split(/\s+/g);
                    if (this._options & 16 /* ForceAsMap */) {
                        newOutputValue = (/** @type {?} */ ({}));
                        for (let i = 0; i < keys.length; i++) {
                            ((/** @type {?} */ (newOutputValue)))[keys[i]] = true;
                        }
                    }
                    else {
                        newOutputValue = keys.join(' ');
                    }
                }
                break;
            }
            // case 2: [input]="{key:value}"
            case 2 /* StringMap */: {
                /** @type {?} */
                const inputMap = (/** @type {?} */ (this._inputValue));
                /** @type {?} */
                const inputKeys = Object.keys(inputMap);
                if (!inputValueIdentityChanged) {
                    // if StringMap and the identity has not changed then output value must have already been
                    // initialized to a StringMap, so we can safely compare the input and output maps
                    inputChanged = mapsAreEqual(inputKeys, inputMap, (/** @type {?} */ (this.value)));
                }
                if (inputChanged) {
                    newOutputValue = (/** @type {?} */ (bulidMapFromStringMap(trimValues, parseOutUnits, allowSubKeys, inputMap, inputKeys)));
                }
                break;
            }
            // case 3a: [input]="[str1, str2, ...]"
            // case 3b: [input]="Set"
            case 4 /* Array */:
            case 8 /* Set */: {
                /** @type {?} */
                const inputKeys = Array.from((/** @type {?} */ (this._inputValue)));
                if (!inputValueIdentityChanged) {
                    /** @type {?} */
                    const outputKeys = Object.keys((/** @type {?} */ (this.value)));
                    inputChanged = !keyArraysAreEqual(outputKeys, inputKeys);
                }
                if (inputChanged) {
                    newOutputValue =
                        (/** @type {?} */ (bulidMapFromStringArray(this._name, trimValues, allowSubKeys, inputKeys)));
                }
                break;
            }
            // case 4: [input]="null|undefined"
            default:
                inputChanged = inputValueIdentityChanged;
                newOutputValue = null;
                break;
        }
        if (inputChanged) {
            // update the readonly `value` property by casting it to `any` first
            ((/** @type {?} */ (this))).value = newOutputValue;
        }
        return inputChanged;
    }
}
if (false) {
    /**
     * Normalized string map representing the last value set via `setValue()` or null if no value has
     * been set or the last set value was null
     * @type {?}
     */
    StylingDiffer.prototype.value;
    /**
     * The last set value that was applied via `setValue()`
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._inputValue;
    /**
     * The type of value that the `_lastSetValue` variable is
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._inputValueType;
    /**
     * Whether or not the last value change occurred because the variable itself changed reference
     * (identity)
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._inputValueIdentityChangeSinceLastCheck;
    /**
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._name;
    /**
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._options;
}
/** @enum {number} */
const StylingDifferOptions = {
    None: 0,
    TrimProperties: 1,
    AllowSubKeys: 2,
    AllowStringValue: 4,
    AllowUnits: 8,
    ForceAsMap: 16,
};
export { StylingDifferOptions };
/** @enum {number} */
const StylingDifferValueTypes = {
    Null: 0,
    String: 1,
    StringMap: 2,
    Array: 4,
    Set: 8,
    Collection: 14,
};
/**
 * @param {?} trim whether the keys should be trimmed of leading or trailing whitespace
 * @param {?} parseOutUnits whether units like "px" should be parsed out of the key name and appended to
 *   the value
 * @param {?} allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param {?} values values of the map
 * @param {?} keys keys of the map
 * @return {?} a normalized string map based on the input string map
 */
function bulidMapFromStringMap(trim, parseOutUnits, allowSubKeys, values, keys) {
    /** @type {?} */
    const map = {};
    for (let i = 0; i < keys.length; i++) {
        /** @type {?} */
        let key = keys[i];
        /** @type {?} */
        let value = values[key];
        if (value !== undefined) {
            if (typeof value !== 'boolean') {
                value = '' + value;
            }
            // Map uses untrimmed keys, so don't trim until passing to `setMapValues`
            setMapValues(map, trim ? key.trim() : key, value, parseOutUnits, allowSubKeys);
        }
    }
    return map;
}
/**
 * @param {?} errorPrefix
 * @param {?} trim whether the keys should be trimmed of leading or trailing whitespace
 * @param {?} allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param {?} keys keys of the map
 * @return {?} a normalized string map based on the input string array
 */
function bulidMapFromStringArray(errorPrefix, trim, allowSubKeys, keys) {
    /** @type {?} */
    const map = {};
    for (let i = 0; i < keys.length; i++) {
        /** @type {?} */
        let key = keys[i];
        ngDevMode && assertValidValue(errorPrefix, key);
        key = trim ? key.trim() : key;
        setMapValues(map, key, true, false, allowSubKeys);
    }
    return map;
}
/**
 * @param {?} errorPrefix
 * @param {?} value
 * @return {?}
 */
function assertValidValue(errorPrefix, value) {
    if (typeof value !== 'string') {
        throw new Error(`${errorPrefix} can only toggle CSS classes expressed as strings, got: ${value}`);
    }
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} value
 * @param {?} parseOutUnits
 * @param {?} allowSubKeys
 * @return {?}
 */
function setMapValues(map, key, value, parseOutUnits, allowSubKeys) {
    if (allowSubKeys && key.indexOf(' ') > 0) {
        /** @type {?} */
        const innerKeys = key.split(/\s+/g);
        for (let j = 0; j < innerKeys.length; j++) {
            setIndividualMapValue(map, innerKeys[j], value, parseOutUnits);
        }
    }
    else {
        setIndividualMapValue(map, key, value, parseOutUnits);
    }
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} value
 * @param {?} parseOutUnits
 * @return {?}
 */
function setIndividualMapValue(map, key, value, parseOutUnits) {
    if (parseOutUnits && typeof value === 'string') {
        // parse out the unit (e.g. ".px") from the key and append it to the value
        // e.g. for [width.px]="40" => ["width","40px"]
        /** @type {?} */
        const unitIndex = key.indexOf('.');
        if (unitIndex > 0) {
            /** @type {?} */
            const unit = key.substr(unitIndex + 1);
            key = key.substring(0, unitIndex);
            value += unit;
        }
    }
    map[key] = value;
}
/**
 * Compares two maps and returns true if they are equal
 *
 * @param {?} inputKeys value of `Object.keys(inputMap)` it's unclear if this actually performs better
 * @param {?} inputMap map to compare
 * @param {?} outputMap map to compare
 * @return {?}
 */
function mapsAreEqual(inputKeys, inputMap, outputMap) {
    /** @type {?} */
    const outputKeys = Object.keys(outputMap);
    if (inputKeys.length !== outputKeys.length) {
        return true;
    }
    for (let i = 0, n = inputKeys.length; i <= n; i++) {
        /** @type {?} */
        let key = inputKeys[i];
        if (key !== outputKeys[i] || inputMap[key] !== outputMap[key]) {
            return true;
        }
    }
    return false;
}
/**
 * Compares two Object.keys() arrays and returns true if they are equal.
 *
 * @param {?} keyArray1 Object.keys() array to compare
 * @param {?} keyArray2
 * @return {?}
 */
function keyArraysAreEqual(keyArray1, keyArray2) {
    if (!Array.isArray(keyArray1) || !Array.isArray(keyArray2)) {
        return false;
    }
    if (keyArray1.length !== keyArray2.length) {
        return false;
    }
    for (let i = 0; i < keyArray1.length; i++) {
        if (keyArray1[i] !== keyArray2[i]) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvc3R5bGluZ19kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0REEsTUFBTSxPQUFPLGFBQWE7Ozs7O0lBdUJ4QixZQUFvQixLQUFhLEVBQVUsUUFBOEI7UUFBckQsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQXNCOzs7OztRQWxCekQsVUFBSyxHQUFXLElBQUksQ0FBQzs7OztRQUs3QixnQkFBVyxHQUF1QyxJQUFJLENBQUM7Ozs7UUFLdkQsb0JBQWUsZ0JBQXlEOzs7OztRQU14RSw0Q0FBdUMsR0FBRyxLQUFLLENBQUM7SUFFb0IsQ0FBQzs7Ozs7OztJQU83RSxRQUFRLENBQUMsS0FBeUM7UUFDaEQsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRTs7Z0JBQzFCLElBQTZCO1lBQ2pDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRyxtREFBbUQ7Z0JBQ2hFLElBQUksZUFBK0IsQ0FBQztnQkFDcEMsS0FBSyxHQUFHLElBQUksQ0FBQzthQUNkO2lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxnQkFBZ0MsQ0FBQzthQUN0QztpQkFBTSxJQUFJLEtBQUssWUFBWSxHQUFHLEVBQUU7Z0JBQy9CLElBQUksY0FBOEIsQ0FBQzthQUNwQztpQkFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsMkJBQXdDLENBQUMsRUFBRTtvQkFDNUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMs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QUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDMUQsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQ3pDLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN6QyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDakMsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFVzZWQgdG8gZGlmZiBhbmQgY29udmVydCBuZ1N0eWxlL25nQ2xhc3MgaW5zdHJ1Y3Rpb25zIGludG8gW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncy5cbiAqXG4gKiBuZ1N0eWxlIGFuZCBuZ0NsYXNzIGJvdGggYWNjZXB0IHZhcmlvdXMgZm9ybXMgb2YgaW5wdXQgYW5kIGJlaGF2ZSBkaWZmZXJlbnRseSB0aGFuIHRoYXRcbiAqIG9mIGhvdyBbc3R5bGVdIGFuZCBbY2xhc3NdIGJlaGF2ZSBpbiBBbmd1bGFyLlxuICpcbiAqIFRoZSBkaWZmZXJlbmNlcyBhcmU6XG4gKiAgLSBuZ1N0eWxlIGFuZCBuZ0NsYXNzIGJvdGggKipkZWVwLXdhdGNoKiogdGhlaXIgYmluZGluZyB2YWx1ZXMgZm9yIGNoYW5nZXMgZWFjaCB0aW1lIENEIHJ1bnNcbiAqICAgIHdoaWxlIFtzdHlsZV0gYW5kIFtjbGFzc10gYmluZGluZ3MgZG8gbm90ICh0aGV5IGNoZWNrIGZvciBpZGVudGl0eSBjaGFuZ2VzKVxuICogIC0gbmdTdHlsZSBhbGxvd3MgZm9yIHVuaXQtYmFzZWQga2V5cyAoZS5nLiBgeydtYXgtd2lkdGgucHgnOnZhbHVlfWApIGFuZCBbc3R5bGVdIGRvZXMgbm90XG4gKiAgLSBuZ0NsYXNzIHN1cHBvcnRzIGFycmF5cyBvZiBjbGFzcyB2YWx1ZXMgYW5kIFtjbGFzc10gb25seSBhY2NlcHRzIG1hcCBhbmQgc3RyaW5nIHZhbHVlc1xuICogIC0gbmdDbGFzcyBhbGxvd3MgZm9yIG11bHRpcGxlIGNsYXNzTmFtZSBrZXlzIChzcGFjZS1zZXBhcmF0ZWQpIHdpdGhpbiBhbiBhcnJheSBvciBtYXBcbiAqICAgICAoYXMgdGhlICoga2V5KSB3aGlsZSBbY2xhc3NdIG9ubHkgYWNjZXB0cyBhIHNpbXBsZSBrZXkvdmFsdWUgbWFwIG9iamVjdFxuICpcbiAqIEhhdmluZyBBbmd1bGFyIHVuZGVyc3RhbmQgYW5kIGFkYXB0IHRvIGFsbCB0aGUgZGlmZmVyZW50IGZvcm1zIG9mIGJlaGF2aW9yIGlzIGNvbXBsaWNhdGVkXG4gKiBhbmQgdW5uZWNlc3NhcnkuIEluc3RlYWQsIG5nQ2xhc3MgYW5kIG5nU3R5bGUgc2hvdWxkIGhhdmUgdGhlaXIgaW5wdXQgdmFsdWVzIGJlIGNvbnZlcnRlZFxuICogaW50byBzb21ldGhpbmcgdGhhdCB0aGUgY29yZS1sZXZlbCBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzIHVuZGVyc3RhbmQuXG4gKlxuICogVGhpcyBbU3R5bGluZ0RpZmZlcl0gY2xhc3MgaGFuZGxlcyB0aGlzIGNvbnZlcnNpb24gYnkgY3JlYXRpbmcgYSBuZXcgb3V0cHV0IHZhbHVlIGVhY2ggdGltZVxuICogdGhlIGlucHV0IHZhbHVlIG9mIHRoZSBiaW5kaW5nIHZhbHVlIGhhcyBjaGFuZ2VkIChlaXRoZXIgdmlhIGlkZW50aXR5IGNoYW5nZSBvciBkZWVwIGNvbGxlY3Rpb25cbiAqIGNvbnRlbnQgY2hhbmdlKS5cbiAqXG4gKiAjIyBXaHkgZG8gd2UgY2FyZSBhYm91dCBuZ1N0eWxlL25nQ2xhc3M/XG4gKiBUaGUgc3R5bGluZyBhbGdvcml0aG0gY29kZSAoZG9jdW1lbnRlZCBpbnNpZGUgb2YgYHJlbmRlcjMvaW50ZXJmYWNlcy9zdHlsaW5nLnRzYCkgbmVlZHMgdG9cbiAqIHJlc3BlY3QgYW5kIHVuZGVyc3RhbmQgdGhlIHN0eWxpbmcgdmFsdWVzIGVtaXR0ZWQgdGhyb3VnaCBuZ1N0eWxlIGFuZCBuZ0NsYXNzICh3aGVuIHRoZXlcbiAqIGFyZSBwcmVzZW50IGFuZCB1c2VkIGluIGEgdGVtcGxhdGUpLlxuICpcbiAqIEluc3RlYWQgb2YgaGF2aW5nIHRoZXNlIGRpcmVjdGl2ZXMgbWFuYWdlIHN0eWxpbmcgb24gdGhlaXIgb3duLCB0aGV5IHNob3VsZCBiZSBpbmNsdWRlZFxuICogaW50byB0aGUgQW5ndWxhciBzdHlsaW5nIGFsZ29yaXRobSB0aGF0IGV4aXN0cyBmb3IgW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncy5cbiAqXG4gKiBIZXJlJ3Mgd2h5OlxuICpcbiAqIC0gSWYgbmdTdHlsZS9uZ0NsYXNzIGlzIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBbc3R5bGVdL1tjbGFzc10gYmluZGluZ3MgdGhlbiB0aGVcbiAqICAgc3R5bGVzIGFuZCBjbGFzc2VzIHdvdWxkIGZhbGwgb3V0IG9mIHN5bmMgYW5kIGJlIGFwcGxpZWQgYW5kIHVwZGF0ZWQgYXRcbiAqICAgaW5jb25zaXN0ZW50IHRpbWVzXG4gKiAtIEJvdGggbmdDbGFzcy9uZ1N0eWxlIHNob3VsZCByZXNwZWN0IFtjbGFzcy5uYW1lXSBhbmQgW3N0eWxlLnByb3BdIGJpbmRpbmdzIChhbmQgbm90IGFyYml0cmFyaWx5XG4gKiAgIG92ZXJ3cml0ZSB0aGVpciBjaGFuZ2VzKVxuICpcbiAqICAgYGBgXG4gKiAgIDwhLS0gaWYgYHcxYCBpcyB1cGRhdGVkIHRoZW4gaXQgd2lsbCBhbHdheXMgb3ZlcnJpZGUgYHcyYFxuICogICAgICAgIGlmIGB3MmAgaXMgdXBkYXRlZCB0aGVuIGl0IHdpbGwgYWx3YXlzIG92ZXJyaWRlIGB3MWBcbiAqICAgICAgICBpZiBib3RoIGFyZSB1cGRhdGVkIGF0IHRoZSBzYW1lIHRpbWUgdGhlbiBgdzFgIHdpbnMgLS0+XG4gKiAgIDxkaXYgW25nU3R5bGVdPVwie3dpZHRoOncxfVwiIFtzdHlsZS53aWR0aF09XCJ3MlwiPi4uLjwvZGl2PlxuICpcbiAqICAgPCEtLSBpZiBgdzFgIGlzIHVwZGF0ZWQgdGhlbiBpdCB3aWxsIGFsd2F5cyBsb3NlIHRvIGB3MmBcbiAqICAgICAgICBpZiBgdzJgIGlzIHVwZGF0ZWQgdGhlbiBpdCB3aWxsIGFsd2F5cyBvdmVycmlkZSBgdzFgXG4gKiAgICAgICAgaWYgYm90aCBhcmUgdXBkYXRlZCBhdCB0aGUgc2FtZSB0aW1lIHRoZW4gYHcyYCB3aW5zIC0tPlxuICogICA8ZGl2IFtzdHlsZV09XCJ7d2lkdGg6dzF9XCIgW3N0eWxlLndpZHRoXT1cIncyXCI+Li4uPC9kaXY+XG4gKiAgIGBgYFxuICogLSBuZ0NsYXNzL25nU3R5bGUgd2VyZSB3cml0dGVuIGFzIGEgZGlyZWN0aXZlcyBhbmQgbWFkZSB1c2Ugb2YgbWFwcywgY2xvc3VyZXMgYW5kIG90aGVyXG4gKiAgIGV4cGVuc2l2ZSBkYXRhIHN0cnVjdHVyZXMgd2hpY2ggd2VyZSBldmFsdWF0ZWQgZWFjaCB0aW1lIENEIHJ1bnNcbiAqL1xuZXhwb3J0IGNsYXNzIFN0eWxpbmdEaWZmZXI8VCBleHRlbmRzKHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudWxsfSB8IHtba2V5OiBzdHJpbmddOiB0cnVlfSk+IHtcbiAgLyoqXG4gICAqIE5vcm1hbGl6ZWQgc3RyaW5nIG1hcCByZXByZXNlbnRpbmcgdGhlIGxhc3QgdmFsdWUgc2V0IHZpYSBgc2V0VmFsdWUoKWAgb3IgbnVsbCBpZiBubyB2YWx1ZSBoYXNcbiAgICogYmVlbiBzZXQgb3IgdGhlIGxhc3Qgc2V0IHZhbHVlIHdhcyBudWxsXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgdmFsdWU6IFR8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IHNldCB2YWx1ZSB0aGF0IHdhcyBhcHBsaWVkIHZpYSBgc2V0VmFsdWUoKWBcbiAgICovXG4gIHByaXZhdGUgX2lucHV0VmFsdWU6IFR8c3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgdHlwZSBvZiB2YWx1ZSB0aGF0IHRoZSBgX2xhc3RTZXRWYWx1ZWAgdmFyaWFibGUgaXNcbiAgICovXG4gIHByaXZhdGUgX2lucHV0VmFsdWVUeXBlOiBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcyA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLk51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoZSBsYXN0IHZhbHVlIGNoYW5nZSBvY2N1cnJlZCBiZWNhdXNlIHRoZSB2YXJpYWJsZSBpdHNlbGYgY2hhbmdlZCByZWZlcmVuY2VcbiAgICogKGlkZW50aXR5KVxuICAgKi9cbiAgcHJpdmF0ZSBfaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlU2luY2VMYXN0Q2hlY2sgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uYW1lOiBzdHJpbmcsIHByaXZhdGUgX29wdGlvbnM6IFN0eWxpbmdEaWZmZXJPcHRpb25zKSB7fVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbnB1dCB2YWx1ZSBmb3IgdGhlIGRpZmZlciBhbmQgdXBkYXRlcyB0aGUgb3V0cHV0IHZhbHVlIGlmIG5lY2Vzc2FyeS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIHRoZSBuZXcgc3R5bGluZyBpbnB1dCB2YWx1ZSBwcm92aWRlZCBmcm9tIHRoZSBuZ0NsYXNzL25nU3R5bGUgYmluZGluZ1xuICAgKi9cbiAgc2V0SW5wdXQodmFsdWU6IFR8c3RyaW5nW118c3RyaW5nfFNldDxzdHJpbmc+fG51bGwpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX2lucHV0VmFsdWUpIHtcbiAgICAgIGxldCB0eXBlOiBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcztcbiAgICAgIGlmICghdmFsdWUpIHsgIC8vIG1hdGNoZXMgZW1wdHkgc3RyaW5ncywgbnVsbCwgZmFsc2UgYW5kIHVuZGVmaW5lZFxuICAgICAgICB0eXBlID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuTnVsbDtcbiAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB0eXBlID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuQXJyYXk7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgIHR5cGUgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TZXQ7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCEodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3RyaW5nVmFsdWUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMuX25hbWUgKyAnIHN0cmluZyB2YWx1ZXMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZSA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlN0cmluZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGUgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TdHJpbmdNYXA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2lucHV0VmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuX2lucHV0VmFsdWVUeXBlID0gdHlwZTtcbiAgICAgIHRoaXMuX2lucHV0VmFsdWVJZGVudGl0eUNoYW5nZVNpbmNlTGFzdENoZWNrID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3Byb2Nlc3NWYWx1ZUNoYW5nZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBpbnB1dCB2YWx1ZSBmb3IgaWRlbnRpdHkgb3IgZGVlcCBjaGFuZ2VzIGFuZCB1cGRhdGVzIG91dHB1dCB2YWx1ZSBpZiBuZWNlc3NhcnkuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCByaWdodCBhZnRlciBgc2V0VmFsdWUoKWAgaXMgY2FsbGVkLCBidXQgaXQgY2FuIGFsc28gYmVcbiAgICogY2FsbGVkIGluY2FzZSB0aGUgZXhpc3RpbmcgdmFsdWUgKGlmIGl0J3MgYSBjb2xsZWN0aW9uKSBjaGFuZ2VzIGludGVybmFsbHkuIElmIHRoZVxuICAgKiB2YWx1ZSBpcyBpbmRlZWQgYSBjb2xsZWN0aW9uIGl0IHdpbGwgZG8gdGhlIG5lY2Vzc2FyeSBkaWZmaW5nIHdvcmsgYW5kIHByb2R1Y2UgYVxuICAgKiBuZXcgb2JqZWN0IHZhbHVlIGFzIGFzc2lnbiB0aGF0IHRvIGB2YWx1ZWAuXG4gICAqXG4gICAqIEByZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2YWx1ZSBoYXMgY2hhbmdlZCBpbiBzb21lIHdheS5cbiAgICovXG4gIHVwZGF0ZVZhbHVlKCk6IGJvb2xlYW4ge1xuICAgIGxldCB2YWx1ZUhhc0NoYW5nZWQgPSB0aGlzLl9pbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VTaW5jZUxhc3RDaGVjaztcbiAgICBpZiAoIXRoaXMuX2lucHV0VmFsdWVJZGVudGl0eUNoYW5nZVNpbmNlTGFzdENoZWNrICYmXG4gICAgICAgICh0aGlzLl9pbnB1dFZhbHVlVHlwZSAmIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLkNvbGxlY3Rpb24pKSB7XG4gICAgICB2YWx1ZUhhc0NoYW5nZWQgPSB0aGlzLl9wcm9jZXNzVmFsdWVDaGFuZ2UoZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0aGlzIGlzIHNldCB0byBmYWxzZSBpbiB0aGUgZXZlbnQgdGhhdCB0aGUgdmFsdWUgaXMgYSBjb2xsZWN0aW9uLlxuICAgICAgLy8gVGhpcyB3YXkgKGlmIHRoZSBpZGVudGl0eSBoYXNuJ3QgY2hhbmdlZCksIHRoZW4gdGhlIGFsZ29yaXRobSBjYW5cbiAgICAgIC8vIGRpZmYgdGhlIGNvbGxlY3Rpb24gdmFsdWUgdG8gc2VlIGlmIHRoZSBjb250ZW50cyBoYXZlIG11dGF0ZWRcbiAgICAgIC8vIChvdGhlcndpc2UgdGhlIHZhbHVlIGNoYW5nZSB3YXMgcHJvY2Vzc2VkIGR1cmluZyB0aGUgdGltZSB3aGVuXG4gICAgICAvLyB0aGUgdmFyaWFibGUgY2hhbmdlZCkuXG4gICAgICB0aGlzLl9pbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VTaW5jZUxhc3RDaGVjayA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVIYXNDaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4YW1pbmVzIHRoZSBsYXN0IHNldCB2YWx1ZSB0byBzZWUgaWYgdGhlcmUgd2FzIGEgY2hhbmdlIGluIGNvbnRlbnQuXG4gICAqXG4gICAqIEBwYXJhbSBpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkIHdoZXRoZXIgb3Igbm90IHRoZSBsYXN0IHNldCB2YWx1ZSBjaGFuZ2VkIGluIGlkZW50aXR5IG9yIG5vdFxuICAgKiBAcmV0dXJucyBgdHJ1ZWAgd2hlbiB0aGUgdmFsdWUgaGFzIGNoYW5nZWQgKGVpdGhlciBieSBpZGVudGl0eSBvciBieSBzaGFwZSBpZiBpdHMgYVxuICAgKiBjb2xsZWN0aW9uKVxuICAgKi9cbiAgcHJpdmF0ZSBfcHJvY2Vzc1ZhbHVlQ2hhbmdlKGlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICAvLyBpZiB0aGUgaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZCB0aGVuIHdlIGtub3cgdGhhdCBpbnB1dCBoYXMgY2hhbmdlZFxuICAgIGxldCBpbnB1dENoYW5nZWQgPSBpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkO1xuXG4gICAgbGV0IG5ld091dHB1dFZhbHVlOiBUfHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBjb25zdCB0cmltVmFsdWVzID0gKHRoaXMuX29wdGlvbnMgJiBTdHlsaW5nRGlmZmVyT3B0aW9ucy5UcmltUHJvcGVydGllcykgPyB0cnVlIDogZmFsc2U7XG4gICAgY29uc3QgcGFyc2VPdXRVbml0cyA9ICh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dVbml0cykgPyB0cnVlIDogZmFsc2U7XG4gICAgY29uc3QgYWxsb3dTdWJLZXlzID0gKHRoaXMuX29wdGlvbnMgJiBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1N1YktleXMpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgc3dpdGNoICh0aGlzLl9pbnB1dFZhbHVlVHlwZSkge1xuICAgICAgLy8gY2FzZSAxOiBbaW5wdXRdPVwic3RyaW5nXCJcbiAgICAgIGNhc2UgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU3RyaW5nOiB7XG4gICAgICAgIGlmIChpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkKSB7XG4gICAgICAgICAgLy8gcHJvY2VzcyBzdHJpbmcgaW5wdXQgb25seSBpZiB0aGUgaWRlbnRpdHkgaGFzIGNoYW5nZWQgc2luY2UgdGhlIHN0cmluZ3MgYXJlIGltbXV0YWJsZVxuICAgICAgICAgIGNvbnN0IGtleXMgPSAodGhpcy5faW5wdXRWYWx1ZSBhcyBzdHJpbmcpLnNwbGl0KC9cXHMrL2cpO1xuICAgICAgICAgIGlmICh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuRm9yY2VBc01hcCkge1xuICAgICAgICAgICAgbmV3T3V0cHV0VmFsdWUgPSB7fSBhcyBUO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIChuZXdPdXRwdXRWYWx1ZSBhcyBhbnkpW2tleXNbaV1dID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3T3V0cHV0VmFsdWUgPSBrZXlzLmpvaW4oJyAnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBjYXNlIDI6IFtpbnB1dF09XCJ7a2V5OnZhbHVlfVwiXG4gICAgICBjYXNlIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlN0cmluZ01hcDoge1xuICAgICAgICBjb25zdCBpbnB1dE1hcCA9IHRoaXMuX2lucHV0VmFsdWUgYXMgVDtcbiAgICAgICAgY29uc3QgaW5wdXRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRNYXApO1xuXG4gICAgICAgIGlmICghaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZCkge1xuICAgICAgICAgIC8vIGlmIFN0cmluZ01hcCBhbmQgdGhlIGlkZW50aXR5IGhhcyBub3QgY2hhbmdlZCB0aGVuIG91dHB1dCB2YWx1ZSBtdXN0IGhhdmUgYWxyZWFkeSBiZWVuXG4gICAgICAgICAgLy8gaW5pdGlhbGl6ZWQgdG8gYSBTdHJpbmdNYXAsIHNvIHdlIGNhbiBzYWZlbHkgY29tcGFyZSB0aGUgaW5wdXQgYW5kIG91dHB1dCBtYXBzXG4gICAgICAgICAgaW5wdXRDaGFuZ2VkID0gbWFwc0FyZUVxdWFsKGlucHV0S2V5cywgaW5wdXRNYXAsIHRoaXMudmFsdWUgYXMgVCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5wdXRDaGFuZ2VkKSB7XG4gICAgICAgICAgbmV3T3V0cHV0VmFsdWUgPSBidWxpZE1hcEZyb21TdHJpbmdNYXAoXG4gICAgICAgICAgICAgIHRyaW1WYWx1ZXMsIHBhcnNlT3V0VW5pdHMsIGFsbG93U3ViS2V5cywgaW5wdXRNYXAsIGlucHV0S2V5cykgYXMgVDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8vIGNhc2UgM2E6IFtpbnB1dF09XCJbc3RyMSwgc3RyMiwgLi4uXVwiXG4gICAgICAvLyBjYXNlIDNiOiBbaW5wdXRdPVwiU2V0XCJcbiAgICAgIGNhc2UgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuQXJyYXk6XG4gICAgICBjYXNlIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlNldDoge1xuICAgICAgICBjb25zdCBpbnB1dEtleXMgPSBBcnJheS5mcm9tKHRoaXMuX2lucHV0VmFsdWUgYXMgc3RyaW5nW10gfCBTZXQ8c3RyaW5nPik7XG4gICAgICAgIGlmICghaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZCkge1xuICAgICAgICAgIGNvbnN0IG91dHB1dEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnZhbHVlICEpO1xuICAgICAgICAgIGlucHV0Q2hhbmdlZCA9ICFrZXlBcnJheXNBcmVFcXVhbChvdXRwdXRLZXlzLCBpbnB1dEtleXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dENoYW5nZWQpIHtcbiAgICAgICAgICBuZXdPdXRwdXRWYWx1ZSA9XG4gICAgICAgICAgICAgIGJ1bGlkTWFwRnJvbVN0cmluZ0FycmF5KHRoaXMuX25hbWUsIHRyaW1WYWx1ZXMsIGFsbG93U3ViS2V5cywgaW5wdXRLZXlzKSBhcyBUO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gY2FzZSA0OiBbaW5wdXRdPVwibnVsbHx1bmRlZmluZWRcIlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaW5wdXRDaGFuZ2VkID0gaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZDtcbiAgICAgICAgbmV3T3V0cHV0VmFsdWUgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoaW5wdXRDaGFuZ2VkKSB7XG4gICAgICAvLyB1cGRhdGUgdGhlIHJlYWRvbmx5IGB2YWx1ZWAgcHJvcGVydHkgYnkgY2FzdGluZyBpdCB0byBgYW55YCBmaXJzdFxuICAgICAgKHRoaXMgYXMgYW55KS52YWx1ZSA9IG5ld091dHB1dFZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBpbnB1dENoYW5nZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBWYXJpb3VzIG9wdGlvbnMgdGhhdCBhcmUgY29uc3VtZWQgYnkgdGhlIFtTdHlsaW5nRGlmZmVyXSBjbGFzc1xuICovXG5leHBvcnQgY29uc3QgZW51bSBTdHlsaW5nRGlmZmVyT3B0aW9ucyB7XG4gIE5vbmUgPSAwYjAwMDAwLCAgICAgICAgICAgICAgLy9cbiAgVHJpbVByb3BlcnRpZXMgPSAwYjAwMDAxLCAgICAvL1xuICBBbGxvd1N1YktleXMgPSAwYjAwMDEwLCAgICAgIC8vXG4gIEFsbG93U3RyaW5nVmFsdWUgPSAwYjAwMTAwLCAgLy9cbiAgQWxsb3dVbml0cyA9IDBiMDEwMDAsICAgICAgICAvL1xuICBGb3JjZUFzTWFwID0gMGIxMDAwMCwgICAgICAgIC8vXG59XG5cbi8qKlxuICogVGhlIGRpZmZlcmVudCB0eXBlcyBvZiBpbnB1dHMgdGhhdCB0aGUgW1N0eWxpbmdEaWZmZXJdIGNhbiBkZWFsIHdpdGhcbiAqL1xuY29uc3QgZW51bSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcyB7XG4gIE51bGwgPSAwYjAwMDAsICAgICAgICAvL1xuICBTdHJpbmcgPSAwYjAwMDEsICAgICAgLy9cbiAgU3RyaW5nTWFwID0gMGIwMDEwLCAgIC8vXG4gIEFycmF5ID0gMGIwMTAwLCAgICAgICAvL1xuICBTZXQgPSAwYjEwMDAsICAgICAgICAgLy9cbiAgQ29sbGVjdGlvbiA9IDBiMTExMCwgIC8vXG59XG5cblxuLyoqXG4gKiBAcGFyYW0gdHJpbSB3aGV0aGVyIHRoZSBrZXlzIHNob3VsZCBiZSB0cmltbWVkIG9mIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICogQHBhcmFtIHBhcnNlT3V0VW5pdHMgd2hldGhlciB1bml0cyBsaWtlIFwicHhcIiBzaG91bGQgYmUgcGFyc2VkIG91dCBvZiB0aGUga2V5IG5hbWUgYW5kIGFwcGVuZGVkIHRvXG4gKiAgIHRoZSB2YWx1ZVxuICogQHBhcmFtIGFsbG93U3ViS2V5cyB3aGV0aGVyIGtleSBuZWVkcyB0byBiZSBzdWJzcGxpdCBieSB3aGl0ZXNwYWNlIGludG8gbXVsdGlwbGUga2V5c1xuICogQHBhcmFtIHZhbHVlcyB2YWx1ZXMgb2YgdGhlIG1hcFxuICogQHBhcmFtIGtleXMga2V5cyBvZiB0aGUgbWFwXG4gKiBAcmV0dXJuIGEgbm9ybWFsaXplZCBzdHJpbmcgbWFwIGJhc2VkIG9uIHRoZSBpbnB1dCBzdHJpbmcgbWFwXG4gKi9cbmZ1bmN0aW9uIGJ1bGlkTWFwRnJvbVN0cmluZ01hcChcbiAgICB0cmltOiBib29sZWFuLCBwYXJzZU91dFVuaXRzOiBib29sZWFuLCBhbGxvd1N1YktleXM6IGJvb2xlYW4sXG4gICAgdmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbCB8IHRydWV9LFxuICAgIGtleXM6IHN0cmluZ1tdKToge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bGwgfCB0cnVlfSB7XG4gIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bGwgfCB0cnVlfSA9IHt9O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBrZXkgPSBrZXlzW2ldO1xuICAgIGxldCB2YWx1ZSA9IHZhbHVlc1trZXldO1xuXG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJykge1xuICAgICAgICB2YWx1ZSA9ICcnICsgdmFsdWU7XG4gICAgICB9XG4gICAgICAvLyBNYXAgdXNlcyB1bnRyaW1tZWQga2V5cywgc28gZG9uJ3QgdHJpbSB1bnRpbCBwYXNzaW5nIHRvIGBzZXRNYXBWYWx1ZXNgXG4gICAgICBzZXRNYXBWYWx1ZXMobWFwLCB0cmltID8ga2V5LnRyaW0oKSA6IGtleSwgdmFsdWUsIHBhcnNlT3V0VW5pdHMsIGFsbG93U3ViS2V5cyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxuLyoqXG4gKiBAcGFyYW0gdHJpbSB3aGV0aGVyIHRoZSBrZXlzIHNob3VsZCBiZSB0cmltbWVkIG9mIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICogQHBhcmFtIHBhcnNlT3V0VW5pdHMgd2hldGhlciB1bml0cyBsaWtlIFwicHhcIiBzaG91bGQgYmUgcGFyc2VkIG91dCBvZiB0aGUga2V5IG5hbWUgYW5kIGFwcGVuZGVkIHRvXG4gKiAgIHRoZSB2YWx1ZVxuICogQHBhcmFtIGFsbG93U3ViS2V5cyB3aGV0aGVyIGtleSBuZWVkcyB0byBiZSBzdWJzcGxpdCBieSB3aGl0ZXNwYWNlIGludG8gbXVsdGlwbGUga2V5c1xuICogQHBhcmFtIHZhbHVlcyB2YWx1ZXMgb2YgdGhlIG1hcFxuICogQHBhcmFtIGtleXMga2V5cyBvZiB0aGUgbWFwXG4gKiBAcmV0dXJuIGEgbm9ybWFsaXplZCBzdHJpbmcgbWFwIGJhc2VkIG9uIHRoZSBpbnB1dCBzdHJpbmcgYXJyYXlcbiAqL1xuZnVuY3Rpb24gYnVsaWRNYXBGcm9tU3RyaW5nQXJyYXkoXG4gICAgZXJyb3JQcmVmaXg6IHN0cmluZywgdHJpbTogYm9vbGVhbiwgYWxsb3dTdWJLZXlzOiBib29sZWFuLFxuICAgIGtleXM6IHN0cmluZ1tdKToge1trZXk6IHN0cmluZ106IHRydWV9IHtcbiAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogdHJ1ZX0gPSB7fTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQga2V5ID0ga2V5c1tpXTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0VmFsaWRWYWx1ZShlcnJvclByZWZpeCwga2V5KTtcbiAgICBrZXkgPSB0cmltID8ga2V5LnRyaW0oKSA6IGtleTtcbiAgICBzZXRNYXBWYWx1ZXMobWFwLCBrZXksIHRydWUsIGZhbHNlLCBhbGxvd1N1YktleXMpO1xuICB9XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VmFsaWRWYWx1ZShlcnJvclByZWZpeDogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgJHtlcnJvclByZWZpeH0gY2FuIG9ubHkgdG9nZ2xlIENTUyBjbGFzc2VzIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBnb3Q6ICR7dmFsdWV9YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0TWFwVmFsdWVzKFxuICAgIG1hcDoge1trZXk6IHN0cmluZ106IHVua25vd259LCBrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IG51bGwgfCB0cnVlLCBwYXJzZU91dFVuaXRzOiBib29sZWFuLFxuICAgIGFsbG93U3ViS2V5czogYm9vbGVhbikge1xuICBpZiAoYWxsb3dTdWJLZXlzICYmIGtleS5pbmRleE9mKCcgJykgPiAwKSB7XG4gICAgY29uc3QgaW5uZXJLZXlzID0ga2V5LnNwbGl0KC9cXHMrL2cpO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgaW5uZXJLZXlzLmxlbmd0aDsgaisrKSB7XG4gICAgICBzZXRJbmRpdmlkdWFsTWFwVmFsdWUobWFwLCBpbm5lcktleXNbal0sIHZhbHVlLCBwYXJzZU91dFVuaXRzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc2V0SW5kaXZpZHVhbE1hcFZhbHVlKG1hcCwga2V5LCB2YWx1ZSwgcGFyc2VPdXRVbml0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0SW5kaXZpZHVhbE1hcFZhbHVlKFxuICAgIG1hcDoge1trZXk6IHN0cmluZ106IHVua25vd259LCBrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IHRydWUgfCBudWxsLFxuICAgIHBhcnNlT3V0VW5pdHM6IGJvb2xlYW4pIHtcbiAgaWYgKHBhcnNlT3V0VW5pdHMgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIC8vIHBhcnNlIG91dCB0aGUgdW5pdCAoZS5nLiBcIi5weFwiKSBmcm9tIHRoZSBrZXkgYW5kIGFwcGVuZCBpdCB0byB0aGUgdmFsdWVcbiAgICAvLyBlLmcuIGZvciBbd2lkdGgucHhdPVwiNDBcIiA9PiBbXCJ3aWR0aFwiLFwiNDBweFwiXVxuICAgIGNvbnN0IHVuaXRJbmRleCA9IGtleS5pbmRleE9mKCcuJyk7XG4gICAgaWYgKHVuaXRJbmRleCA+IDApIHtcbiAgICAgIGNvbnN0IHVuaXQgPSBrZXkuc3Vic3RyKHVuaXRJbmRleCArIDEpOyAgLy8gc2tpcCBvdmVyIHRoZSBcIi5cIiBpbiBcIndpZHRoLnB4XCJcbiAgICAgIGtleSA9IGtleS5zdWJzdHJpbmcoMCwgdW5pdEluZGV4KTtcbiAgICAgIHZhbHVlICs9IHVuaXQ7XG4gICAgfVxuICB9XG4gIG1hcFtrZXldID0gdmFsdWU7XG59XG5cblxuLyoqXG4gKiBDb21wYXJlcyB0d28gbWFwcyBhbmQgcmV0dXJucyB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsXG4gKlxuICogQHBhcmFtIGlucHV0S2V5cyB2YWx1ZSBvZiBgT2JqZWN0LmtleXMoaW5wdXRNYXApYCBpdCdzIHVuY2xlYXIgaWYgdGhpcyBhY3R1YWxseSBwZXJmb3JtcyBiZXR0ZXJcbiAqIEBwYXJhbSBpbnB1dE1hcCBtYXAgdG8gY29tcGFyZVxuICogQHBhcmFtIG91dHB1dE1hcCBtYXAgdG8gY29tcGFyZVxuICovXG5mdW5jdGlvbiBtYXBzQXJlRXF1YWwoXG4gICAgaW5wdXRLZXlzOiBzdHJpbmdbXSwgaW5wdXRNYXA6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufSxcbiAgICBvdXRwdXRNYXA6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufSwgKTogYm9vbGVhbiB7XG4gIGNvbnN0IG91dHB1dEtleXMgPSBPYmplY3Qua2V5cyhvdXRwdXRNYXApO1xuXG4gIGlmIChpbnB1dEtleXMubGVuZ3RoICE9PSBvdXRwdXRLZXlzLmxlbmd0aCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDAsIG4gPSBpbnB1dEtleXMubGVuZ3RoOyBpIDw9IG47IGkrKykge1xuICAgIGxldCBrZXkgPSBpbnB1dEtleXNbaV07XG4gICAgaWYgKGtleSAhPT0gb3V0cHV0S2V5c1tpXSB8fCBpbnB1dE1hcFtrZXldICE9PSBvdXRwdXRNYXBba2V5XSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8qKlxuICogQ29tcGFyZXMgdHdvIE9iamVjdC5rZXlzKCkgYXJyYXlzIGFuZCByZXR1cm5zIHRydWUgaWYgdGhleSBhcmUgZXF1YWwuXG4gKlxuICogQHBhcmFtIGtleUFycmF5MSBPYmplY3Qua2V5cygpIGFycmF5IHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBrZXlBcnJheTEgT2JqZWN0LmtleXMoKSBhcnJheSB0byBjb21wYXJlXG4gKi9cbmZ1bmN0aW9uIGtleUFycmF5c0FyZUVxdWFsKGtleUFycmF5MTogc3RyaW5nW10gfCBudWxsLCBrZXlBcnJheTI6IHN0cmluZ1tdIHwgbnVsbCk6IGJvb2xlYW4ge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoa2V5QXJyYXkxKSB8fCAhQXJyYXkuaXNBcnJheShrZXlBcnJheTIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGtleUFycmF5MS5sZW5ndGggIT09IGtleUFycmF5Mi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUFycmF5MS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChrZXlBcnJheTFbaV0gIT09IGtleUFycmF5MltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19