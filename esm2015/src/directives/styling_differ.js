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
 * Used to diff and convert ngStyle/ngClass instructions into [style] and [class] bindings.
 *
 * ngStyle and ngClass both accept various forms of input and behave differently than that
 * of how [style] and [class] behave in Angular.
 *
 * The differences are:
 *  - ngStyle and ngClass both **watch** their binding values for changes each time CD runs
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
 * This [StylingDiffer] class handles this conversion by creating a new input value each time
 * the inner representation of the binding value have changed.
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
 * - Both ngClass/ngStyle do not respect [class.name] and [style.prop] bindings
 *   (they will write over them given the right combination of events)
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
        this.value = null;
        this._lastSetValue = null;
        this._lastSetValueType = 0 /* Null */;
        this._lastSetValueIdentityChange = false;
    }
    /**
     * Sets (updates) the styling value within the differ.
     *
     * Only when `hasValueChanged` is called then this new value will be evaluted
     * and checked against the previous value.
     *
     * @param {?} value the new styling value provided from the ngClass/ngStyle binding
     * @return {?}
     */
    setValue(value) {
        if (Array.isArray(value)) {
            this._lastSetValueType = 4 /* Array */;
        }
        else if (value instanceof Set) {
            this._lastSetValueType = 8 /* Set */;
        }
        else if (value && typeof value === 'string') {
            if (!(this._options & 4 /* AllowStringValue */)) {
                throw new Error(this._name + ' string values are not allowed');
            }
            this._lastSetValueType = 1 /* String */;
        }
        else {
            this._lastSetValueType = value ? 2 /* Map */ : 0 /* Null */;
        }
        this._lastSetValueIdentityChange = true;
        this._lastSetValue = value || null;
    }
    /**
     * Determines whether or not the value has changed.
     *
     * This function can be called right after `setValue()` is called, but it can also be
     * called incase the existing value (if it's a collection) changes internally. If the
     * value is indeed a collection it will do the necessary diffing work and produce a
     * new object value as assign that to `value`.
     *
     * @return {?} whether or not the value has changed in some way.
     */
    hasValueChanged() {
        /** @type {?} */
        let valueHasChanged = this._lastSetValueIdentityChange;
        if (!valueHasChanged && !(this._lastSetValueType & 14 /* Collection */))
            return false;
        /** @type {?} */
        let finalValue = null;
        /** @type {?} */
        const trimValues = (this._options & 1 /* TrimProperties */) ? true : false;
        /** @type {?} */
        const parseOutUnits = (this._options & 8 /* AllowUnits */) ? true : false;
        /** @type {?} */
        const allowSubKeys = (this._options & 2 /* AllowSubKeys */) ? true : false;
        switch (this._lastSetValueType) {
            // case 1: [input]="string"
            case 1 /* String */:
                /** @type {?} */
                const tokens = ((/** @type {?} */ (this._lastSetValue))).split(/\s+/g);
                if (this._options & 16 /* ForceAsMap */) {
                    finalValue = {};
                    tokens.forEach((token, i) => ((/** @type {?} */ (finalValue)))[token] = true);
                }
                else {
                    finalValue = tokens.reduce((str, token, i) => str + (i ? ' ' : '') + token);
                }
                break;
            // case 2: [input]="{key:value}"
            case 2 /* Map */:
                /** @type {?} */
                const map = (/** @type {?} */ (this._lastSetValue));
                /** @type {?} */
                const keys = Object.keys(map);
                if (!valueHasChanged) {
                    if (this.value) {
                        // we know that the classExp value exists and that it is
                        // a map (otherwise an identity change would have occurred)
                        valueHasChanged = mapHasChanged(keys, (/** @type {?} */ (this.value)), map);
                    }
                    else {
                        valueHasChanged = true;
                    }
                }
                if (valueHasChanged) {
                    finalValue =
                        bulidMapFromValues(this._name, trimValues, parseOutUnits, allowSubKeys, map, keys);
                }
                break;
            // case 3a: [input]="[str1, str2, ...]"
            // case 3b: [input]="Set"
            case 4 /* Array */:
            case 8 /* Set */:
                /** @type {?} */
                const values = Array.from((/** @type {?} */ (this._lastSetValue)));
                if (!valueHasChanged) {
                    /** @type {?} */
                    const keys = Object.keys((/** @type {?} */ (this.value)));
                    valueHasChanged = !arrayEqualsArray(keys, values);
                }
                if (valueHasChanged) {
                    finalValue =
                        bulidMapFromValues(this._name, trimValues, parseOutUnits, allowSubKeys, values);
                }
                break;
            // case 4: [input]="null|undefined"
            default:
                finalValue = null;
                break;
        }
        if (valueHasChanged) {
            ((/** @type {?} */ (this))).value = (/** @type {?} */ (finalValue));
        }
        return valueHasChanged;
    }
}
if (false) {
    /** @type {?} */
    StylingDiffer.prototype.value;
    /**
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._lastSetValue;
    /**
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._lastSetValueType;
    /**
     * @type {?}
     * @private
     */
    StylingDiffer.prototype._lastSetValueIdentityChange;
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
    Map: 2,
    Array: 4,
    Set: 8,
    Collection: 14,
};
/**
 * builds and returns a map based on the values input value
 *
 * If the `keys` param is provided then the `values` param is treated as a
 * string map. Otherwise `values` is treated as a string array.
 * @param {?} errorPrefix
 * @param {?} trim
 * @param {?} parseOutUnits
 * @param {?} allowSubKeys
 * @param {?} values
 * @param {?=} keys
 * @return {?}
 */
function bulidMapFromValues(errorPrefix, trim, parseOutUnits, allowSubKeys, values, keys) {
    /** @type {?} */
    const map = {};
    if (keys) {
        // case 1: map
        for (let i = 0; i < keys.length; i++) {
            /** @type {?} */
            let key = keys[i];
            key = trim ? key.trim() : key;
            /** @type {?} */
            const value = ((/** @type {?} */ (values)))[key];
            setMapValues(map, key, value, parseOutUnits, allowSubKeys);
        }
    }
    else {
        // case 2: array
        for (let i = 0; i < values.length; i++) {
            /** @type {?} */
            let value = ((/** @type {?} */ (values)))[i];
            assertValidValue(errorPrefix, value);
            value = trim ? value.trim() : value;
            setMapValues(map, value, true, false, allowSubKeys);
        }
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
        throw new Error(`${errorPrefix} can only toggle CSS classes expressed as strings, got ${value}`);
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
    if (parseOutUnits) {
        /** @type {?} */
        const values = normalizeStyleKeyAndValue(key, value);
        value = values.value;
        key = values.key;
    }
    map[key] = value;
}
/**
 * @param {?} key
 * @param {?} value
 * @return {?}
 */
function normalizeStyleKeyAndValue(key, value) {
    /** @type {?} */
    const index = key.indexOf('.');
    if (index > 0) {
        /** @type {?} */
        const unit = key.substr(index + 1);
        key = key.substring(0, index);
        if (value != null) { // we should not convert null values to string
            value += unit;
        }
    }
    return { key, value };
}
/**
 * @param {?} keys
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function mapHasChanged(keys, a, b) {
    /** @type {?} */
    const oldKeys = Object.keys(a);
    /** @type {?} */
    const newKeys = keys;
    // the keys are different which means the map changed
    if (!arrayEqualsArray(oldKeys, newKeys)) {
        return true;
    }
    for (let i = 0; i < newKeys.length; i++) {
        /** @type {?} */
        const key = newKeys[i];
        if (a[key] !== b[key]) {
            return true;
        }
    }
    return false;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function arrayEqualsArray(a, b) {
    if (a && b) {
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            if (b.indexOf(a[i]) === -1)
                return false;
        }
        return true;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvc3R5bGluZ19kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkRBLE1BQU0sT0FBTyxhQUFhOzs7OztJQU94QixZQUFvQixLQUFhLEVBQVUsUUFBOEI7UUFBckQsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQXNCO1FBTnpELFVBQUssR0FBVyxJQUFJLENBQUM7UUFFN0Isa0JBQWEsR0FBOEMsSUFBSSxDQUFDO1FBQ2hFLHNCQUFpQixnQkFBeUQ7UUFDMUUsZ0NBQTJCLEdBQUcsS0FBSyxDQUFDO0lBRWdDLENBQUM7Ozs7Ozs7Ozs7SUFVN0UsUUFBUSxDQUFDLEtBQWdEO1FBQ3ZELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsaUJBQWlCLGdCQUFnQyxDQUFDO1NBQ3hEO2FBQU0sSUFBSSxLQUFLLFlBQVksR0FBRyxFQUFFO1lBQy9CLElBQUksQ0FBQyxpQkFBaUIsY0FBOEIsQ0FBQztTQUN0RDthQUFNLElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM3QyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSwyQkFBd0MsQ0FBQyxFQUFFO2dCQUM1RCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsZ0NBQWdDLENBQUMsQ0FBQzthQUNoRTtZQUNELElBQUksQ0FBQyxpQkFBaUIsaUJBQWlDLENBQUM7U0FDekQ7YUFBTTtZQUNMLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxhQUE2QixDQUFDLGFBQTZCLENBQUM7U0FDN0Y7UUFFRCxJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQztJQUNyQyxDQUFDOzs7Ozs7Ozs7OztJQVlELGVBQWU7O1lBQ1QsZUFBZSxHQUFHLElBQUksQ0FBQywyQkFBMkI7UUFDdEQsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixzQkFBcUMsQ0FBQztZQUNwRixPQUFPLEtBQUssQ0FBQzs7WUFFWCxVQUFVLEdBQXFDLElBQUk7O2NBQ2pELFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLHlCQUFzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSzs7Y0FDakYsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEscUJBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLOztjQUNoRixZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSx1QkFBb0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7UUFFdkYsUUFBUSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDOUIsMkJBQTJCO1lBQzNCOztzQkFDUSxNQUFNLEdBQUcsQ0FBQyxtQkFBQSxJQUFJLENBQUMsYUFBYSxFQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUMzRCxJQUFJLElBQUksQ0FBQyxRQUFRLHNCQUFrQyxFQUFFO29CQUNuRCxVQUFVLEdBQUcsRUFBRSxDQUFDO29CQUNoQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxtQkFBQSxVQUFVLEVBQXVCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztpQkFDakY7cUJBQU07b0JBQ0wsVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2lCQUM3RTtnQkFDRCxNQUFNO1lBRVIsZ0NBQWdDO1lBQ2hDOztzQkFDUSxHQUFHLEdBQXlCLG1CQUFBLElBQUksQ0FBQyxhQUFhLEVBQXVCOztzQkFDckUsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUM3QixJQUFJLENBQUMsZUFBZSxFQUFFO29CQUNwQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2Qsd0RBQXdEO3dCQUN4RCwyREFBMkQ7d0JBQzNELGVBQWUsR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLG1CQUFBLElBQUksQ0FBQyxLQUFLLEVBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQy9FO3lCQUFNO3dCQUNMLGVBQWUsR0FBRyxJQUFJLENBQUM7cUJBQ3hCO2lCQUNGO2dCQUVELElBQUksZUFBZSxFQUFFO29CQUNuQixVQUFVO3dCQUNOLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUN4RjtnQkFDRCxNQUFNO1lBRVIsdUNBQXVDO1lBQ3ZDLHlCQUF5QjtZQUN6QixtQkFBbUM7WUFDbkM7O3NCQUNRLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFBLElBQUksQ0FBQyxhQUFhLEVBQTBCLENBQUM7Z0JBQ3ZFLElBQUksQ0FBQyxlQUFlLEVBQUU7OzBCQUNkLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFBLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDdEMsZUFBZSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUNuRDtnQkFDRCxJQUFJLGVBQWUsRUFBRTtvQkFDbkIsVUFBVTt3QkFDTixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRjtnQkFDRCxNQUFNO1lBRVIsbUNBQW1DO1lBQ25DO2dCQUNFLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLE1BQU07U0FDVDtRQUVELElBQUksZUFBZSxFQUFFO1lBQ25CLENBQUMsbUJBQUEsSUFBSSxFQUFPLENBQUMsQ0FBQyxLQUFLLEdBQUcsbUJBQUEsVUFBVSxFQUFFLENBQUM7U0FDcEM7UUFFRCxPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDO0NBQ0Y7OztJQWpIQyw4QkFBcUM7Ozs7O0lBRXJDLHNDQUF3RTs7Ozs7SUFDeEUsMENBQWtGOzs7OztJQUNsRixvREFBNEM7Ozs7O0lBRWhDLDhCQUFxQjs7Ozs7SUFBRSxpQ0FBc0M7Ozs7SUFpSHpFLE9BQWM7SUFDZCxpQkFBd0I7SUFDeEIsZUFBc0I7SUFDdEIsbUJBQTBCO0lBQzFCLGFBQW9CO0lBQ3BCLGNBQW9COzs7OztJQU9wQixPQUFhO0lBQ2IsU0FBZTtJQUNmLE1BQVk7SUFDWixRQUFjO0lBQ2QsTUFBWTtJQUNaLGNBQW1COzs7Ozs7Ozs7Ozs7Ozs7QUFVckIsU0FBUyxrQkFBa0IsQ0FDdkIsV0FBbUIsRUFBRSxJQUFhLEVBQUUsYUFBc0IsRUFBRSxZQUFxQixFQUNqRixNQUF1QyxFQUFFLElBQWU7O1VBQ3BELEdBQUcsR0FBeUIsRUFBRTtJQUNwQyxJQUFJLElBQUksRUFBRTtRQUNSLGNBQWM7UUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7Z0JBQ2hDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDOztrQkFDeEIsS0FBSyxHQUFHLENBQUMsbUJBQUEsTUFBTSxFQUF1QixDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2xELFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDNUQ7S0FDRjtTQUFNO1FBQ0wsZ0JBQWdCO1FBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztnQkFDbEMsS0FBSyxHQUFHLENBQUMsbUJBQUEsTUFBTSxFQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3BDLFlBQVksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDckQ7S0FDRjtJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQzs7Ozs7O0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxXQUFtQixFQUFFLEtBQVU7SUFDdkQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FDWCxHQUFHLFdBQVcsMERBQTBELEtBQUssRUFBRSxDQUFDLENBQUM7S0FDdEY7QUFDSCxDQUFDOzs7Ozs7Ozs7QUFFRCxTQUFTLFlBQVksQ0FDakIsR0FBeUIsRUFBRSxHQUFXLEVBQUUsS0FBVSxFQUFFLGFBQXNCLEVBQzFFLFlBQXFCO0lBQ3ZCLElBQUksWUFBWSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFOztjQUNsQyxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekMscUJBQXFCLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7U0FDaEU7S0FDRjtTQUFNO1FBQ0wscUJBQXFCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7S0FDdkQ7QUFDSCxDQUFDOzs7Ozs7OztBQUVELFNBQVMscUJBQXFCLENBQzFCLEdBQXlCLEVBQUUsR0FBVyxFQUFFLEtBQVUsRUFBRSxhQUFzQjtJQUM1RSxJQUFJLGFBQWEsRUFBRTs7Y0FDWCxNQUFNLEdBQUcseUJBQXlCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztRQUNwRCxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNyQixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztLQUNsQjtJQUNELEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDbkIsQ0FBQzs7Ozs7O0FBRUQsU0FBUyx5QkFBeUIsQ0FBQyxHQUFXLEVBQUUsS0FBb0I7O1VBQzVELEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7O2NBQ1AsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNsQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUIsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLEVBQUcsOENBQThDO1lBQ2xFLEtBQUssSUFBSSxJQUFJLENBQUM7U0FDZjtLQUNGO0lBQ0QsT0FBTyxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUN0QixDQUFDOzs7Ozs7O0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBYyxFQUFFLENBQXVCLEVBQUUsQ0FBdUI7O1VBQy9FLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7VUFDeEIsT0FBTyxHQUFHLElBQUk7SUFFcEIscURBQXFEO0lBQ3JELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7UUFDdkMsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztjQUNqQyxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDYjtLQUNGO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDOzs7Ozs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLENBQWUsRUFBRSxDQUFlO0lBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNWLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsTUFBTTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7U0FDMUM7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFVzZWQgdG8gZGlmZiBhbmQgY29udmVydCBuZ1N0eWxlL25nQ2xhc3MgaW5zdHJ1Y3Rpb25zIGludG8gW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncy5cbiAqXG4gKiBuZ1N0eWxlIGFuZCBuZ0NsYXNzIGJvdGggYWNjZXB0IHZhcmlvdXMgZm9ybXMgb2YgaW5wdXQgYW5kIGJlaGF2ZSBkaWZmZXJlbnRseSB0aGFuIHRoYXRcbiAqIG9mIGhvdyBbc3R5bGVdIGFuZCBbY2xhc3NdIGJlaGF2ZSBpbiBBbmd1bGFyLlxuICpcbiAqIFRoZSBkaWZmZXJlbmNlcyBhcmU6XG4gKiAgLSBuZ1N0eWxlIGFuZCBuZ0NsYXNzIGJvdGggKip3YXRjaCoqIHRoZWlyIGJpbmRpbmcgdmFsdWVzIGZvciBjaGFuZ2VzIGVhY2ggdGltZSBDRCBydW5zXG4gKiAgICB3aGlsZSBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzIGRvIG5vdCAodGhleSBjaGVjayBmb3IgaWRlbnRpdHkgY2hhbmdlcylcbiAqICAtIG5nU3R5bGUgYWxsb3dzIGZvciB1bml0LWJhc2VkIGtleXMgKGUuZy4gYHsnbWF4LXdpZHRoLnB4Jzp2YWx1ZX1gKSBhbmQgW3N0eWxlXSBkb2VzIG5vdFxuICogIC0gbmdDbGFzcyBzdXBwb3J0cyBhcnJheXMgb2YgY2xhc3MgdmFsdWVzIGFuZCBbY2xhc3NdIG9ubHkgYWNjZXB0cyBtYXAgYW5kIHN0cmluZyB2YWx1ZXNcbiAqICAtIG5nQ2xhc3MgYWxsb3dzIGZvciBtdWx0aXBsZSBjbGFzc05hbWUga2V5cyAoc3BhY2Utc2VwYXJhdGVkKSB3aXRoaW4gYW4gYXJyYXkgb3IgbWFwXG4gKiAgICAgKGFzIHRoZSAqIGtleSkgd2hpbGUgW2NsYXNzXSBvbmx5IGFjY2VwdHMgYSBzaW1wbGUga2V5L3ZhbHVlIG1hcCBvYmplY3RcbiAqXG4gKiBIYXZpbmcgQW5ndWxhciB1bmRlcnN0YW5kIGFuZCBhZGFwdCB0byBhbGwgdGhlIGRpZmZlcmVudCBmb3JtcyBvZiBiZWhhdmlvciBpcyBjb21wbGljYXRlZFxuICogYW5kIHVubmVjZXNzYXJ5LiBJbnN0ZWFkLCBuZ0NsYXNzIGFuZCBuZ1N0eWxlIHNob3VsZCBoYXZlIHRoZWlyIGlucHV0IHZhbHVlcyBiZSBjb252ZXJ0ZWRcbiAqIGludG8gc29tZXRoaW5nIHRoYXQgdGhlIGNvcmUtbGV2ZWwgW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncyB1bmRlcnN0YW5kLlxuICpcbiAqIFRoaXMgW1N0eWxpbmdEaWZmZXJdIGNsYXNzIGhhbmRsZXMgdGhpcyBjb252ZXJzaW9uIGJ5IGNyZWF0aW5nIGEgbmV3IGlucHV0IHZhbHVlIGVhY2ggdGltZVxuICogdGhlIGlubmVyIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBiaW5kaW5nIHZhbHVlIGhhdmUgY2hhbmdlZC5cbiAqXG4gKiAjIyBXaHkgZG8gd2UgY2FyZSBhYm91dCBuZ1N0eWxlL25nQ2xhc3M/XG4gKiBUaGUgc3R5bGluZyBhbGdvcml0aG0gY29kZSAoZG9jdW1lbnRlZCBpbnNpZGUgb2YgYHJlbmRlcjMvaW50ZXJmYWNlcy9zdHlsaW5nLnRzYCkgbmVlZHMgdG9cbiAqIHJlc3BlY3QgYW5kIHVuZGVyc3RhbmQgdGhlIHN0eWxpbmcgdmFsdWVzIGVtaXR0ZWQgdGhyb3VnaCBuZ1N0eWxlIGFuZCBuZ0NsYXNzICh3aGVuIHRoZXlcbiAqIGFyZSBwcmVzZW50IGFuZCB1c2VkIGluIGEgdGVtcGxhdGUpLlxuICpcbiAqIEluc3RlYWQgb2YgaGF2aW5nIHRoZXNlIGRpcmVjdGl2ZXMgbWFuYWdlIHN0eWxpbmcgb24gdGhlaXIgb3duLCB0aGV5IHNob3VsZCBiZSBpbmNsdWRlZFxuICogaW50byB0aGUgQW5ndWxhciBzdHlsaW5nIGFsZ29yaXRobSB0aGF0IGV4aXN0cyBmb3IgW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncy5cbiAqXG4gKiBIZXJlJ3Mgd2h5OlxuICpcbiAqIC0gSWYgbmdTdHlsZS9uZ0NsYXNzIGlzIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBbc3R5bGVdL1tjbGFzc10gYmluZGluZ3MgdGhlbiB0aGVcbiAqICAgc3R5bGVzIGFuZCBjbGFzc2VzIHdvdWxkIGZhbGwgb3V0IG9mIHN5bmMgYW5kIGJlIGFwcGxpZWQgYW5kIHVwZGF0ZWQgYXRcbiAqICAgaW5jb25zaXN0ZW50IHRpbWVzXG4gKiAtIEJvdGggbmdDbGFzcy9uZ1N0eWxlIGRvIG5vdCByZXNwZWN0IFtjbGFzcy5uYW1lXSBhbmQgW3N0eWxlLnByb3BdIGJpbmRpbmdzXG4gKiAgICh0aGV5IHdpbGwgd3JpdGUgb3ZlciB0aGVtIGdpdmVuIHRoZSByaWdodCBjb21iaW5hdGlvbiBvZiBldmVudHMpXG4gKlxuICogICBgYGBcbiAqICAgPCEtLSBpZiBgdzFgIGlzIHVwZGF0ZWQgdGhlbiBpdCB3aWxsIGFsd2F5cyBvdmVycmlkZSBgdzJgXG4gKiAgICAgICAgaWYgYHcyYCBpcyB1cGRhdGVkIHRoZW4gaXQgd2lsbCBhbHdheXMgb3ZlcnJpZGUgYHcxYFxuICogICAgICAgIGlmIGJvdGggYXJlIHVwZGF0ZWQgYXQgdGhlIHNhbWUgdGltZSB0aGVuIGB3MWAgd2lucyAtLT5cbiAqICAgPGRpdiBbbmdTdHlsZV09XCJ7d2lkdGg6dzF9XCIgW3N0eWxlLndpZHRoXT1cIncyXCI+Li4uPC9kaXY+XG4gKlxuICogICA8IS0tIGlmIGB3MWAgaXMgdXBkYXRlZCB0aGVuIGl0IHdpbGwgYWx3YXlzIGxvc2UgdG8gYHcyYFxuICogICAgICAgIGlmIGB3MmAgaXMgdXBkYXRlZCB0aGVuIGl0IHdpbGwgYWx3YXlzIG92ZXJyaWRlIGB3MWBcbiAqICAgICAgICBpZiBib3RoIGFyZSB1cGRhdGVkIGF0IHRoZSBzYW1lIHRpbWUgdGhlbiBgdzJgIHdpbnMgLS0+XG4gKiAgIDxkaXYgW3N0eWxlXT1cInt3aWR0aDp3MX1cIiBbc3R5bGUud2lkdGhdPVwidzJcIj4uLi48L2Rpdj5cbiAqICAgYGBgXG4gKiAtIG5nQ2xhc3MvbmdTdHlsZSB3ZXJlIHdyaXR0ZW4gYXMgYSBkaXJlY3RpdmVzIGFuZCBtYWRlIHVzZSBvZiBtYXBzLCBjbG9zdXJlcyBhbmQgb3RoZXJcbiAqICAgZXhwZW5zaXZlIGRhdGEgc3RydWN0dXJlcyB3aGljaCB3ZXJlIGV2YWx1YXRlZCBlYWNoIHRpbWUgQ0QgcnVuc1xuICovXG5leHBvcnQgY2xhc3MgU3R5bGluZ0RpZmZlcjxUPiB7XG4gIHB1YmxpYyByZWFkb25seSB2YWx1ZTogVHxudWxsID0gbnVsbDtcblxuICBwcml2YXRlIF9sYXN0U2V0VmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9fHN0cmluZ3xzdHJpbmdbXXxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFNldFZhbHVlVHlwZTogU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5OdWxsO1xuICBwcml2YXRlIF9sYXN0U2V0VmFsdWVJZGVudGl0eUNoYW5nZSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX25hbWU6IHN0cmluZywgcHJpdmF0ZSBfb3B0aW9uczogU3R5bGluZ0RpZmZlck9wdGlvbnMpIHt9XG5cbiAgLyoqXG4gICAqIFNldHMgKHVwZGF0ZXMpIHRoZSBzdHlsaW5nIHZhbHVlIHdpdGhpbiB0aGUgZGlmZmVyLlxuICAgKlxuICAgKiBPbmx5IHdoZW4gYGhhc1ZhbHVlQ2hhbmdlZGAgaXMgY2FsbGVkIHRoZW4gdGhpcyBuZXcgdmFsdWUgd2lsbCBiZSBldmFsdXRlZFxuICAgKiBhbmQgY2hlY2tlZCBhZ2FpbnN0IHRoZSBwcmV2aW91cyB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIHRoZSBuZXcgc3R5bGluZyB2YWx1ZSBwcm92aWRlZCBmcm9tIHRoZSBuZ0NsYXNzL25nU3R5bGUgYmluZGluZ1xuICAgKi9cbiAgc2V0VmFsdWUodmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9fHN0cmluZ1tdfHN0cmluZ3xudWxsKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB0aGlzLl9sYXN0U2V0VmFsdWVUeXBlID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuQXJyYXk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgdGhpcy5fbGFzdFNldFZhbHVlVHlwZSA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlNldDtcbiAgICB9IGVsc2UgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghKHRoaXMuX29wdGlvbnMgJiBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1N0cmluZ1ZhbHVlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy5fbmFtZSArICcgc3RyaW5nIHZhbHVlcyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xhc3RTZXRWYWx1ZVR5cGUgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TdHJpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xhc3RTZXRWYWx1ZVR5cGUgPSB2YWx1ZSA/IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLk1hcCA6IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLk51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fbGFzdFNldFZhbHVlSWRlbnRpdHlDaGFuZ2UgPSB0cnVlO1xuICAgIHRoaXMuX2xhc3RTZXRWYWx1ZSA9IHZhbHVlIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCB0aGUgdmFsdWUgaGFzIGNoYW5nZWQuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCByaWdodCBhZnRlciBgc2V0VmFsdWUoKWAgaXMgY2FsbGVkLCBidXQgaXQgY2FuIGFsc28gYmVcbiAgICogY2FsbGVkIGluY2FzZSB0aGUgZXhpc3RpbmcgdmFsdWUgKGlmIGl0J3MgYSBjb2xsZWN0aW9uKSBjaGFuZ2VzIGludGVybmFsbHkuIElmIHRoZVxuICAgKiB2YWx1ZSBpcyBpbmRlZWQgYSBjb2xsZWN0aW9uIGl0IHdpbGwgZG8gdGhlIG5lY2Vzc2FyeSBkaWZmaW5nIHdvcmsgYW5kIHByb2R1Y2UgYVxuICAgKiBuZXcgb2JqZWN0IHZhbHVlIGFzIGFzc2lnbiB0aGF0IHRvIGB2YWx1ZWAuXG4gICAqXG4gICAqIEByZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2YWx1ZSBoYXMgY2hhbmdlZCBpbiBzb21lIHdheS5cbiAgICovXG4gIGhhc1ZhbHVlQ2hhbmdlZCgpOiBib29sZWFuIHtcbiAgICBsZXQgdmFsdWVIYXNDaGFuZ2VkID0gdGhpcy5fbGFzdFNldFZhbHVlSWRlbnRpdHlDaGFuZ2U7XG4gICAgaWYgKCF2YWx1ZUhhc0NoYW5nZWQgJiYgISh0aGlzLl9sYXN0U2V0VmFsdWVUeXBlICYgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuQ29sbGVjdGlvbikpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgZmluYWxWYWx1ZToge1trZXk6IHN0cmluZ106IGFueX18c3RyaW5nfG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHRyaW1WYWx1ZXMgPSAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLlRyaW1Qcm9wZXJ0aWVzKSA/IHRydWUgOiBmYWxzZTtcbiAgICBjb25zdCBwYXJzZU91dFVuaXRzID0gKHRoaXMuX29wdGlvbnMgJiBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1VuaXRzKSA/IHRydWUgOiBmYWxzZTtcbiAgICBjb25zdCBhbGxvd1N1YktleXMgPSAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3ViS2V5cykgPyB0cnVlIDogZmFsc2U7XG5cbiAgICBzd2l0Y2ggKHRoaXMuX2xhc3RTZXRWYWx1ZVR5cGUpIHtcbiAgICAgIC8vIGNhc2UgMTogW2lucHV0XT1cInN0cmluZ1wiXG4gICAgICBjYXNlIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlN0cmluZzpcbiAgICAgICAgY29uc3QgdG9rZW5zID0gKHRoaXMuX2xhc3RTZXRWYWx1ZSBhcyBzdHJpbmcpLnNwbGl0KC9cXHMrL2cpO1xuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkZvcmNlQXNNYXApIHtcbiAgICAgICAgICBmaW5hbFZhbHVlID0ge307XG4gICAgICAgICAgdG9rZW5zLmZvckVhY2goKHRva2VuLCBpKSA9PiAoZmluYWxWYWx1ZSBhc3tba2V5OiBzdHJpbmddOiBhbnl9KVt0b2tlbl0gPSB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaW5hbFZhbHVlID0gdG9rZW5zLnJlZHVjZSgoc3RyLCB0b2tlbiwgaSkgPT4gc3RyICsgKGkgPyAnICcgOiAnJykgKyB0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIGNhc2UgMjogW2lucHV0XT1cIntrZXk6dmFsdWV9XCJcbiAgICAgIGNhc2UgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuTWFwOlxuICAgICAgICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gdGhpcy5fbGFzdFNldFZhbHVlIGFze1trZXk6IHN0cmluZ106IGFueX07XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhtYXApO1xuICAgICAgICBpZiAoIXZhbHVlSGFzQ2hhbmdlZCkge1xuICAgICAgICAgIGlmICh0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgICAvLyB3ZSBrbm93IHRoYXQgdGhlIGNsYXNzRXhwIHZhbHVlIGV4aXN0cyBhbmQgdGhhdCBpdCBpc1xuICAgICAgICAgICAgLy8gYSBtYXAgKG90aGVyd2lzZSBhbiBpZGVudGl0eSBjaGFuZ2Ugd291bGQgaGF2ZSBvY2N1cnJlZClcbiAgICAgICAgICAgIHZhbHVlSGFzQ2hhbmdlZCA9IG1hcEhhc0NoYW5nZWQoa2V5cywgdGhpcy52YWx1ZSBhc3tba2V5OiBzdHJpbmddOiBhbnl9LCBtYXApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZUhhc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZUhhc0NoYW5nZWQpIHtcbiAgICAgICAgICBmaW5hbFZhbHVlID1cbiAgICAgICAgICAgICAgYnVsaWRNYXBGcm9tVmFsdWVzKHRoaXMuX25hbWUsIHRyaW1WYWx1ZXMsIHBhcnNlT3V0VW5pdHMsIGFsbG93U3ViS2V5cywgbWFwLCBrZXlzKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgLy8gY2FzZSAzYTogW2lucHV0XT1cIltzdHIxLCBzdHIyLCAuLi5dXCJcbiAgICAgIC8vIGNhc2UgM2I6IFtpbnB1dF09XCJTZXRcIlxuICAgICAgY2FzZSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5BcnJheTpcbiAgICAgIGNhc2UgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU2V0OlxuICAgICAgICBjb25zdCB2YWx1ZXMgPSBBcnJheS5mcm9tKHRoaXMuX2xhc3RTZXRWYWx1ZSBhcyBzdHJpbmdbXSB8IFNldDxzdHJpbmc+KTtcbiAgICAgICAgaWYgKCF2YWx1ZUhhc0NoYW5nZWQpIHtcbiAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy52YWx1ZSAhKTtcbiAgICAgICAgICB2YWx1ZUhhc0NoYW5nZWQgPSAhYXJyYXlFcXVhbHNBcnJheShrZXlzLCB2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZUhhc0NoYW5nZWQpIHtcbiAgICAgICAgICBmaW5hbFZhbHVlID1cbiAgICAgICAgICAgICAgYnVsaWRNYXBGcm9tVmFsdWVzKHRoaXMuX25hbWUsIHRyaW1WYWx1ZXMsIHBhcnNlT3V0VW5pdHMsIGFsbG93U3ViS2V5cywgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgLy8gY2FzZSA0OiBbaW5wdXRdPVwibnVsbHx1bmRlZmluZWRcIlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZmluYWxWYWx1ZSA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZUhhc0NoYW5nZWQpIHtcbiAgICAgICh0aGlzIGFzIGFueSkudmFsdWUgPSBmaW5hbFZhbHVlICE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlSGFzQ2hhbmdlZDtcbiAgfVxufVxuXG4vKipcbiAqIFZhcmlvdXMgb3B0aW9ucyB0aGF0IGFyZSBjb25zdW1lZCBieSB0aGUgW1N0eWxpbmdEaWZmZXJdIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBTdHlsaW5nRGlmZmVyT3B0aW9ucyB7XG4gIE5vbmUgPSAwYjAwMDAwLFxuICBUcmltUHJvcGVydGllcyA9IDBiMDAwMDEsXG4gIEFsbG93U3ViS2V5cyA9IDBiMDAwMTAsXG4gIEFsbG93U3RyaW5nVmFsdWUgPSAwYjAwMTAwLFxuICBBbGxvd1VuaXRzID0gMGIwMTAwMCxcbiAgRm9yY2VBc01hcCA9IDBiMTAwMDAsXG59XG5cbi8qKlxuICogVGhlIGRpZmZlcmVudCB0eXBlcyBvZiBpbnB1dHMgdGhhdCB0aGUgW1N0eWxpbmdEaWZmZXJdIGNhbiBkZWFsIHdpdGhcbiAqL1xuY29uc3QgZW51bSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcyB7XG4gIE51bGwgPSAwYjAwMDAsXG4gIFN0cmluZyA9IDBiMDAwMSxcbiAgTWFwID0gMGIwMDEwLFxuICBBcnJheSA9IDBiMDEwMCxcbiAgU2V0ID0gMGIxMDAwLFxuICBDb2xsZWN0aW9uID0gMGIxMTEwLFxufVxuXG5cbi8qKlxuICogYnVpbGRzIGFuZCByZXR1cm5zIGEgbWFwIGJhc2VkIG9uIHRoZSB2YWx1ZXMgaW5wdXQgdmFsdWVcbiAqXG4gKiBJZiB0aGUgYGtleXNgIHBhcmFtIGlzIHByb3ZpZGVkIHRoZW4gdGhlIGB2YWx1ZXNgIHBhcmFtIGlzIHRyZWF0ZWQgYXMgYVxuICogc3RyaW5nIG1hcC4gT3RoZXJ3aXNlIGB2YWx1ZXNgIGlzIHRyZWF0ZWQgYXMgYSBzdHJpbmcgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGJ1bGlkTWFwRnJvbVZhbHVlcyhcbiAgICBlcnJvclByZWZpeDogc3RyaW5nLCB0cmltOiBib29sZWFuLCBwYXJzZU91dFVuaXRzOiBib29sZWFuLCBhbGxvd1N1YktleXM6IGJvb2xlYW4sXG4gICAgdmFsdWVzOiB7W2tleTogc3RyaW5nXTogYW55fSB8IHN0cmluZ1tdLCBrZXlzPzogc3RyaW5nW10pIHtcbiAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBpZiAoa2V5cykge1xuICAgIC8vIGNhc2UgMTogbWFwXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQga2V5ID0ga2V5c1tpXTtcbiAgICAgIGtleSA9IHRyaW0gPyBrZXkudHJpbSgpIDoga2V5O1xuICAgICAgY29uc3QgdmFsdWUgPSAodmFsdWVzIGFze1trZXk6IHN0cmluZ106IGFueX0pW2tleV07XG4gICAgICBzZXRNYXBWYWx1ZXMobWFwLCBrZXksIHZhbHVlLCBwYXJzZU91dFVuaXRzLCBhbGxvd1N1YktleXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBjYXNlIDI6IGFycmF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCB2YWx1ZSA9ICh2YWx1ZXMgYXMgc3RyaW5nW10pW2ldO1xuICAgICAgYXNzZXJ0VmFsaWRWYWx1ZShlcnJvclByZWZpeCwgdmFsdWUpO1xuICAgICAgdmFsdWUgPSB0cmltID8gdmFsdWUudHJpbSgpIDogdmFsdWU7XG4gICAgICBzZXRNYXBWYWx1ZXMobWFwLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UsIGFsbG93U3ViS2V5cyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VmFsaWRWYWx1ZShlcnJvclByZWZpeDogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgJHtlcnJvclByZWZpeH0gY2FuIG9ubHkgdG9nZ2xlIENTUyBjbGFzc2VzIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBnb3QgJHt2YWx1ZX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRNYXBWYWx1ZXMoXG4gICAgbWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIHBhcnNlT3V0VW5pdHM6IGJvb2xlYW4sXG4gICAgYWxsb3dTdWJLZXlzOiBib29sZWFuKSB7XG4gIGlmIChhbGxvd1N1YktleXMgJiYga2V5LmluZGV4T2YoJyAnKSA+IDApIHtcbiAgICBjb25zdCBpbm5lcktleXMgPSBrZXkuc3BsaXQoL1xccysvZyk7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBpbm5lcktleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHNldEluZGl2aWR1YWxNYXBWYWx1ZShtYXAsIGlubmVyS2V5c1tqXSwgdmFsdWUsIHBhcnNlT3V0VW5pdHMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzZXRJbmRpdmlkdWFsTWFwVmFsdWUobWFwLCBrZXksIHZhbHVlLCBwYXJzZU91dFVuaXRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRJbmRpdmlkdWFsTWFwVmFsdWUoXG4gICAgbWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIHBhcnNlT3V0VW5pdHM6IGJvb2xlYW4pIHtcbiAgaWYgKHBhcnNlT3V0VW5pdHMpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBub3JtYWxpemVTdHlsZUtleUFuZFZhbHVlKGtleSwgdmFsdWUpO1xuICAgIHZhbHVlID0gdmFsdWVzLnZhbHVlO1xuICAgIGtleSA9IHZhbHVlcy5rZXk7XG4gIH1cbiAgbWFwW2tleV0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplU3R5bGVLZXlBbmRWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IG51bGwpIHtcbiAgY29uc3QgaW5kZXggPSBrZXkuaW5kZXhPZignLicpO1xuICBpZiAoaW5kZXggPiAwKSB7XG4gICAgY29uc3QgdW5pdCA9IGtleS5zdWJzdHIoaW5kZXggKyAxKTsgIC8vIGlnbm9yZSB0aGUgLiAoW3dpZHRoLnB4XT1cIic0MCdcIiA9PiBcIjQwcHhcIilcbiAgICBrZXkgPSBrZXkuc3Vic3RyaW5nKDAsIGluZGV4KTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbCkgeyAgLy8gd2Ugc2hvdWxkIG5vdCBjb252ZXJ0IG51bGwgdmFsdWVzIHRvIHN0cmluZ1xuICAgICAgdmFsdWUgKz0gdW5pdDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtrZXksIHZhbHVlfTtcbn1cblxuZnVuY3Rpb24gbWFwSGFzQ2hhbmdlZChrZXlzOiBzdHJpbmdbXSwgYToge1trZXk6IHN0cmluZ106IGFueX0sIGI6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gIGNvbnN0IG9sZEtleXMgPSBPYmplY3Qua2V5cyhhKTtcbiAgY29uc3QgbmV3S2V5cyA9IGtleXM7XG5cbiAgLy8gdGhlIGtleXMgYXJlIGRpZmZlcmVudCB3aGljaCBtZWFucyB0aGUgbWFwIGNoYW5nZWRcbiAgaWYgKCFhcnJheUVxdWFsc0FycmF5KG9sZEtleXMsIG5ld0tleXMpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld0tleXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBrZXkgPSBuZXdLZXlzW2ldO1xuICAgIGlmIChhW2tleV0gIT09IGJba2V5XSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBhcnJheUVxdWFsc0FycmF5KGE6IGFueVtdIHwgbnVsbCwgYjogYW55W10gfCBudWxsKSB7XG4gIGlmIChhICYmIGIpIHtcbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYi5pbmRleE9mKGFbaV0pID09PSAtMSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=