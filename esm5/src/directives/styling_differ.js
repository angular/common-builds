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
 */
var StylingDiffer = /** @class */ (function () {
    function StylingDiffer(_name, _options) {
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
     * @param value the new styling value provided from the ngClass/ngStyle binding
     */
    StylingDiffer.prototype.setValue = function (value) {
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
    };
    /**
     * Determines whether or not the value has changed.
     *
     * This function can be called right after `setValue()` is called, but it can also be
     * called incase the existing value (if it's a collection) changes internally. If the
     * value is indeed a collection it will do the necessary diffing work and produce a
     * new object value as assign that to `value`.
     *
     * @returns whether or not the value has changed in some way.
     */
    StylingDiffer.prototype.hasValueChanged = function () {
        var valueHasChanged = this._lastSetValueIdentityChange;
        if (!valueHasChanged && !(this._lastSetValueType & 14 /* Collection */))
            return false;
        var finalValue = null;
        var trimValues = (this._options & 1 /* TrimProperties */) ? true : false;
        var parseOutUnits = (this._options & 8 /* AllowUnits */) ? true : false;
        var allowSubKeys = (this._options & 2 /* AllowSubKeys */) ? true : false;
        switch (this._lastSetValueType) {
            // case 1: [input]="string"
            case 1 /* String */:
                var tokens = this._lastSetValue.split(/\s+/g);
                if (this._options & 16 /* ForceAsMap */) {
                    finalValue = {};
                    tokens.forEach(function (token, i) { return finalValue[token] = true; });
                }
                else {
                    finalValue = tokens.reduce(function (str, token, i) { return str + (i ? ' ' : '') + token; });
                }
                break;
            // case 2: [input]="{key:value}"
            case 2 /* Map */:
                var map = this._lastSetValue;
                var keys = Object.keys(map);
                if (!valueHasChanged) {
                    if (this.value) {
                        // we know that the classExp value exists and that it is
                        // a map (otherwise an identity change would have occurred)
                        valueHasChanged = mapHasChanged(keys, this.value, map);
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
                var values = Array.from(this._lastSetValue);
                if (!valueHasChanged) {
                    var keys_1 = Object.keys(this.value);
                    valueHasChanged = !arrayEqualsArray(keys_1, values);
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
            this.value = finalValue;
        }
        return valueHasChanged;
    };
    return StylingDiffer;
}());
export { StylingDiffer };
/**
 * builds and returns a map based on the values input value
 *
 * If the `keys` param is provided then the `values` param is treated as a
 * string map. Otherwise `values` is treated as a string array.
 */
function bulidMapFromValues(errorPrefix, trim, parseOutUnits, allowSubKeys, values, keys) {
    var map = {};
    if (keys) {
        // case 1: map
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            key = trim ? key.trim() : key;
            var value = values[key];
            if (value !== undefined) {
                setMapValues(map, key, value, parseOutUnits, allowSubKeys);
            }
        }
    }
    else {
        // case 2: array
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            assertValidValue(errorPrefix, value);
            value = trim ? value.trim() : value;
            setMapValues(map, value, true, false, allowSubKeys);
        }
    }
    return map;
}
function assertValidValue(errorPrefix, value) {
    if (typeof value !== 'string') {
        throw new Error(errorPrefix + " can only toggle CSS classes expressed as strings, got " + value);
    }
}
function setMapValues(map, key, value, parseOutUnits, allowSubKeys) {
    if (allowSubKeys && key.indexOf(' ') > 0) {
        var innerKeys = key.split(/\s+/g);
        for (var j = 0; j < innerKeys.length; j++) {
            setIndividualMapValue(map, innerKeys[j], value, parseOutUnits);
        }
    }
    else {
        setIndividualMapValue(map, key, value, parseOutUnits);
    }
}
function setIndividualMapValue(map, key, value, parseOutUnits) {
    if (parseOutUnits) {
        var values = normalizeStyleKeyAndValue(key, value);
        value = values.value;
        key = values.key;
    }
    map[key] = value;
}
function normalizeStyleKeyAndValue(key, value) {
    var index = key.indexOf('.');
    if (index > 0) {
        var unit = key.substr(index + 1); // ignore the . ([width.px]="'40'" => "40px")
        key = key.substring(0, index);
        if (value != null) { // we should not convert null values to string
            value += unit;
        }
    }
    return { key: key, value: value };
}
function mapHasChanged(keys, a, b) {
    var oldKeys = Object.keys(a);
    var newKeys = keys;
    // the keys are different which means the map changed
    if (!arrayEqualsArray(oldKeys, newKeys)) {
        return true;
    }
    for (var i = 0; i < newKeys.length; i++) {
        var key = newKeys[i];
        if (a[key] !== b[key]) {
            return true;
        }
    }
    return false;
}
function arrayEqualsArray(a, b) {
    if (a && b) {
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; i++) {
            if (b.indexOf(a[i]) === -1)
                return false;
        }
        return true;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvc3R5bGluZ19kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0g7SUFPRSx1QkFBb0IsS0FBYSxFQUFVLFFBQThCO1FBQXJELFVBQUssR0FBTCxLQUFLLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFzQjtRQU56RCxVQUFLLEdBQVcsSUFBSSxDQUFDO1FBRTdCLGtCQUFhLEdBQThDLElBQUksQ0FBQztRQUNoRSxzQkFBaUIsZ0JBQXlEO1FBQzFFLGdDQUEyQixHQUFHLEtBQUssQ0FBQztJQUVnQyxDQUFDO0lBRTdFOzs7Ozs7O09BT0c7SUFDSCxnQ0FBUSxHQUFSLFVBQVMsS0FBZ0Q7UUFDdkQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxpQkFBaUIsZ0JBQWdDLENBQUM7U0FDeEQ7YUFBTSxJQUFJLEtBQUssWUFBWSxHQUFHLEVBQUU7WUFDL0IsSUFBSSxDQUFDLGlCQUFpQixjQUE4QixDQUFDO1NBQ3REO2FBQU0sSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzdDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLDJCQUF3QyxDQUFDLEVBQUU7Z0JBQzVELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxnQ0FBZ0MsQ0FBQyxDQUFDO2FBQ2hFO1lBQ0QsSUFBSSxDQUFDLGlCQUFpQixpQkFBaUMsQ0FBQztTQUN6RDthQUFNO1lBQ0wsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFD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RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN2QyxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsQ0FBZSxFQUFFLENBQWU7SUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ1YsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDeEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztTQUMxQztRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogVXNlZCB0byBkaWZmIGFuZCBjb252ZXJ0IG5nU3R5bGUvbmdDbGFzcyBpbnN0cnVjdGlvbnMgaW50byBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzLlxuICpcbiAqIG5nU3R5bGUgYW5kIG5nQ2xhc3MgYm90aCBhY2NlcHQgdmFyaW91cyBmb3JtcyBvZiBpbnB1dCBhbmQgYmVoYXZlIGRpZmZlcmVudGx5IHRoYW4gdGhhdFxuICogb2YgaG93IFtzdHlsZV0gYW5kIFtjbGFzc10gYmVoYXZlIGluIEFuZ3VsYXIuXG4gKlxuICogVGhlIGRpZmZlcmVuY2VzIGFyZTpcbiAqICAtIG5nU3R5bGUgYW5kIG5nQ2xhc3MgYm90aCAqKndhdGNoKiogdGhlaXIgYmluZGluZyB2YWx1ZXMgZm9yIGNoYW5nZXMgZWFjaCB0aW1lIENEIHJ1bnNcbiAqICAgIHdoaWxlIFtzdHlsZV0gYW5kIFtjbGFzc10gYmluZGluZ3MgZG8gbm90ICh0aGV5IGNoZWNrIGZvciBpZGVudGl0eSBjaGFuZ2VzKVxuICogIC0gbmdTdHlsZSBhbGxvd3MgZm9yIHVuaXQtYmFzZWQga2V5cyAoZS5nLiBgeydtYXgtd2lkdGgucHgnOnZhbHVlfWApIGFuZCBbc3R5bGVdIGRvZXMgbm90XG4gKiAgLSBuZ0NsYXNzIHN1cHBvcnRzIGFycmF5cyBvZiBjbGFzcyB2YWx1ZXMgYW5kIFtjbGFzc10gb25seSBhY2NlcHRzIG1hcCBhbmQgc3RyaW5nIHZhbHVlc1xuICogIC0gbmdDbGFzcyBhbGxvd3MgZm9yIG11bHRpcGxlIGNsYXNzTmFtZSBrZXlzIChzcGFjZS1zZXBhcmF0ZWQpIHdpdGhpbiBhbiBhcnJheSBvciBtYXBcbiAqICAgICAoYXMgdGhlICoga2V5KSB3aGlsZSBbY2xhc3NdIG9ubHkgYWNjZXB0cyBhIHNpbXBsZSBrZXkvdmFsdWUgbWFwIG9iamVjdFxuICpcbiAqIEhhdmluZyBBbmd1bGFyIHVuZGVyc3RhbmQgYW5kIGFkYXB0IHRvIGFsbCB0aGUgZGlmZmVyZW50IGZvcm1zIG9mIGJlaGF2aW9yIGlzIGNvbXBsaWNhdGVkXG4gKiBhbmQgdW5uZWNlc3NhcnkuIEluc3RlYWQsIG5nQ2xhc3MgYW5kIG5nU3R5bGUgc2hvdWxkIGhhdmUgdGhlaXIgaW5wdXQgdmFsdWVzIGJlIGNvbnZlcnRlZFxuICogaW50byBzb21ldGhpbmcgdGhhdCB0aGUgY29yZS1sZXZlbCBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzIHVuZGVyc3RhbmQuXG4gKlxuICogVGhpcyBbU3R5bGluZ0RpZmZlcl0gY2xhc3MgaGFuZGxlcyB0aGlzIGNvbnZlcnNpb24gYnkgY3JlYXRpbmcgYSBuZXcgaW5wdXQgdmFsdWUgZWFjaCB0aW1lXG4gKiB0aGUgaW5uZXIgcmVwcmVzZW50YXRpb24gb2YgdGhlIGJpbmRpbmcgdmFsdWUgaGF2ZSBjaGFuZ2VkLlxuICpcbiAqICMjIFdoeSBkbyB3ZSBjYXJlIGFib3V0IG5nU3R5bGUvbmdDbGFzcz9cbiAqIFRoZSBzdHlsaW5nIGFsZ29yaXRobSBjb2RlIChkb2N1bWVudGVkIGluc2lkZSBvZiBgcmVuZGVyMy9pbnRlcmZhY2VzL3N0eWxpbmcudHNgKSBuZWVkcyB0b1xuICogcmVzcGVjdCBhbmQgdW5kZXJzdGFuZCB0aGUgc3R5bGluZyB2YWx1ZXMgZW1pdHRlZCB0aHJvdWdoIG5nU3R5bGUgYW5kIG5nQ2xhc3MgKHdoZW4gdGhleVxuICogYXJlIHByZXNlbnQgYW5kIHVzZWQgaW4gYSB0ZW1wbGF0ZSkuXG4gKlxuICogSW5zdGVhZCBvZiBoYXZpbmcgdGhlc2UgZGlyZWN0aXZlcyBtYW5hZ2Ugc3R5bGluZyBvbiB0aGVpciBvd24sIHRoZXkgc2hvdWxkIGJlIGluY2x1ZGVkXG4gKiBpbnRvIHRoZSBBbmd1bGFyIHN0eWxpbmcgYWxnb3JpdGhtIHRoYXQgZXhpc3RzIGZvciBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzLlxuICpcbiAqIEhlcmUncyB3aHk6XG4gKlxuICogLSBJZiBuZ1N0eWxlL25nQ2xhc3MgaXMgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIFtzdHlsZV0vW2NsYXNzXSBiaW5kaW5ncyB0aGVuIHRoZVxuICogICBzdHlsZXMgYW5kIGNsYXNzZXMgd291bGQgZmFsbCBvdXQgb2Ygc3luYyBhbmQgYmUgYXBwbGllZCBhbmQgdXBkYXRlZCBhdFxuICogICBpbmNvbnNpc3RlbnQgdGltZXNcbiAqIC0gQm90aCBuZ0NsYXNzL25nU3R5bGUgZG8gbm90IHJlc3BlY3QgW2NsYXNzLm5hbWVdIGFuZCBbc3R5bGUucHJvcF0gYmluZGluZ3NcbiAqICAgKHRoZXkgd2lsbCB3cml0ZSBvdmVyIHRoZW0gZ2l2ZW4gdGhlIHJpZ2h0IGNvbWJpbmF0aW9uIG9mIGV2ZW50cylcbiAqXG4gKiAgIGBgYFxuICogICA8IS0tIGlmIGB3MWAgaXMgdXBkYXRlZCB0aGVuIGl0IHdpbGwgYWx3YXlzIG92ZXJyaWRlIGB3MmBcbiAqICAgICAgICBpZiBgdzJgIGlzIHVwZGF0ZWQgdGhlbiBpdCB3aWxsIGFsd2F5cyBvdmVycmlkZSBgdzFgXG4gKiAgICAgICAgaWYgYm90aCBhcmUgdXBkYXRlZCBhdCB0aGUgc2FtZSB0aW1lIHRoZW4gYHcxYCB3aW5zIC0tPlxuICogICA8ZGl2IFtuZ1N0eWxlXT1cInt3aWR0aDp3MX1cIiBbc3R5bGUud2lkdGhdPVwidzJcIj4uLi48L2Rpdj5cbiAqXG4gKiAgIDwhLS0gaWYgYHcxYCBpcyB1cGRhdGVkIHRoZW4gaXQgd2lsbCBhbHdheXMgbG9zZSB0byBgdzJgXG4gKiAgICAgICAgaWYgYHcyYCBpcyB1cGRhdGVkIHRoZW4gaXQgd2lsbCBhbHdheXMgb3ZlcnJpZGUgYHcxYFxuICogICAgICAgIGlmIGJvdGggYXJlIHVwZGF0ZWQgYXQgdGhlIHNhbWUgdGltZSB0aGVuIGB3MmAgd2lucyAtLT5cbiAqICAgPGRpdiBbc3R5bGVdPVwie3dpZHRoOncxfVwiIFtzdHlsZS53aWR0aF09XCJ3MlwiPi4uLjwvZGl2PlxuICogICBgYGBcbiAqIC0gbmdDbGFzcy9uZ1N0eWxlIHdlcmUgd3JpdHRlbiBhcyBhIGRpcmVjdGl2ZXMgYW5kIG1hZGUgdXNlIG9mIG1hcHMsIGNsb3N1cmVzIGFuZCBvdGhlclxuICogICBleHBlbnNpdmUgZGF0YSBzdHJ1Y3R1cmVzIHdoaWNoIHdlcmUgZXZhbHVhdGVkIGVhY2ggdGltZSBDRCBydW5zXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHlsaW5nRGlmZmVyPFQ+IHtcbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlOiBUfG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgX2xhc3RTZXRWYWx1ZToge1trZXk6IHN0cmluZ106IGFueX18c3RyaW5nfHN0cmluZ1tdfG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U2V0VmFsdWVUeXBlOiBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcyA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLk51bGw7XG4gIHByaXZhdGUgX2xhc3RTZXRWYWx1ZUlkZW50aXR5Q2hhbmdlID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmFtZTogc3RyaW5nLCBwcml2YXRlIF9vcHRpb25zOiBTdHlsaW5nRGlmZmVyT3B0aW9ucykge31cblxuICAvKipcbiAgICogU2V0cyAodXBkYXRlcykgdGhlIHN0eWxpbmcgdmFsdWUgd2l0aGluIHRoZSBkaWZmZXIuXG4gICAqXG4gICAqIE9ubHkgd2hlbiBgaGFzVmFsdWVDaGFuZ2VkYCBpcyBjYWxsZWQgdGhlbiB0aGlzIG5ldyB2YWx1ZSB3aWxsIGJlIGV2YWx1dGVkXG4gICAqIGFuZCBjaGVja2VkIGFnYWluc3QgdGhlIHByZXZpb3VzIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIG5ldyBzdHlsaW5nIHZhbHVlIHByb3ZpZGVkIGZyb20gdGhlIG5nQ2xhc3MvbmdTdHlsZSBiaW5kaW5nXG4gICAqL1xuICBzZXRWYWx1ZSh2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX18c3RyaW5nW118c3RyaW5nfG51bGwpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2xhc3RTZXRWYWx1ZVR5cGUgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5BcnJheTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICB0aGlzLl9sYXN0U2V0VmFsdWVUeXBlID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU2V0O1xuICAgIH0gZWxzZSBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCEodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3RyaW5nVmFsdWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLl9uYW1lICsgJyBzdHJpbmcgdmFsdWVzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbGFzdFNldFZhbHVlVHlwZSA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlN0cmluZztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbGFzdFNldFZhbHVlVHlwZSA9IHZhbHVlID8gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuTWFwIDogU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuTnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9sYXN0U2V0VmFsdWVJZGVudGl0eUNoYW5nZSA9IHRydWU7XG4gICAgdGhpcy5fbGFzdFNldFZhbHVlID0gdmFsdWUgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRoZSB2YWx1ZSBoYXMgY2hhbmdlZC5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIHJpZ2h0IGFmdGVyIGBzZXRWYWx1ZSgpYCBpcyBjYWxsZWQsIGJ1dCBpdCBjYW4gYWxzbyBiZVxuICAgKiBjYWxsZWQgaW5jYXNlIHRoZSBleGlzdGluZyB2YWx1ZSAoaWYgaXQncyBhIGNvbGxlY3Rpb24pIGNoYW5nZXMgaW50ZXJuYWxseS4gSWYgdGhlXG4gICAqIHZhbHVlIGlzIGluZGVlZCBhIGNvbGxlY3Rpb24gaXQgd2lsbCBkbyB0aGUgbmVjZXNzYXJ5IGRpZmZpbmcgd29yayBhbmQgcHJvZHVjZSBhXG4gICAqIG5ldyBvYmplY3QgdmFsdWUgYXMgYXNzaWduIHRoYXQgdG8gYHZhbHVlYC5cbiAgICpcbiAgICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZhbHVlIGhhcyBjaGFuZ2VkIGluIHNvbWUgd2F5LlxuICAgKi9cbiAgaGFzVmFsdWVDaGFuZ2VkKCk6IGJvb2xlYW4ge1xuICAgIGxldCB2YWx1ZUhhc0NoYW5nZWQgPSB0aGlzLl9sYXN0U2V0VmFsdWVJZGVudGl0eUNoYW5nZTtcbiAgICBpZiAoIXZhbHVlSGFzQ2hhbmdlZCAmJiAhKHRoaXMuX2xhc3RTZXRWYWx1ZVR5cGUgJiBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5Db2xsZWN0aW9uKSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGxldCBmaW5hbFZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fXxzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgY29uc3QgdHJpbVZhbHVlcyA9ICh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuVHJpbVByb3BlcnRpZXMpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIGNvbnN0IHBhcnNlT3V0VW5pdHMgPSAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93VW5pdHMpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIGNvbnN0IGFsbG93U3ViS2V5cyA9ICh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dTdWJLZXlzKSA/IHRydWUgOiBmYWxzZTtcblxuICAgIHN3aXRjaCAodGhpcy5fbGFzdFNldFZhbHVlVHlwZSkge1xuICAgICAgLy8gY2FzZSAxOiBbaW5wdXRdPVwic3RyaW5nXCJcbiAgICAgIGNhc2UgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU3RyaW5nOlxuICAgICAgICBjb25zdCB0b2tlbnMgPSAodGhpcy5fbGFzdFNldFZhbHVlIGFzIHN0cmluZykuc3BsaXQoL1xccysvZyk7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuRm9yY2VBc01hcCkge1xuICAgICAgICAgIGZpbmFsVmFsdWUgPSB7fTtcbiAgICAgICAgICB0b2tlbnMuZm9yRWFjaCgodG9rZW4sIGkpID0+IChmaW5hbFZhbHVlIGFze1trZXk6IHN0cmluZ106IGFueX0pW3Rva2VuXSA9IHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpbmFsVmFsdWUgPSB0b2tlbnMucmVkdWNlKChzdHIsIHRva2VuLCBpKSA9PiBzdHIgKyAoaSA/ICcgJyA6ICcnKSArIHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgLy8gY2FzZSAyOiBbaW5wdXRdPVwie2tleTp2YWx1ZX1cIlxuICAgICAgY2FzZSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5NYXA6XG4gICAgICAgIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IGFueX0gPSB0aGlzLl9sYXN0U2V0VmFsdWUgYXN7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG1hcCk7XG4gICAgICAgIGlmICghdmFsdWVIYXNDaGFuZ2VkKSB7XG4gICAgICAgICAgaWYgKHRoaXMudmFsdWUpIHtcbiAgICAgICAgICAgIC8vIHdlIGtub3cgdGhhdCB0aGUgY2xhc3NFeHAgdmFsdWUgZXhpc3RzIGFuZCB0aGF0IGl0IGlzXG4gICAgICAgICAgICAvLyBhIG1hcCAob3RoZXJ3aXNlIGFuIGlkZW50aXR5IGNoYW5nZSB3b3VsZCBoYXZlIG9jY3VycmVkKVxuICAgICAgICAgICAgdmFsdWVIYXNDaGFuZ2VkID0gbWFwSGFzQ2hhbmdlZChrZXlzLCB0aGlzLnZhbHVlIGFze1trZXk6IHN0cmluZ106IGFueX0sIG1hcCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlSGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlSGFzQ2hhbmdlZCkge1xuICAgICAgICAgIGZpbmFsVmFsdWUgPVxuICAgICAgICAgICAgICBidWxpZE1hcEZyb21WYWx1ZXModGhpcy5fbmFtZSwgdHJpbVZhbHVlcywgcGFyc2VPdXRVbml0cywgYWxsb3dTdWJLZXlzLCBtYXAsIGtleXMpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBjYXNlIDNhOiBbaW5wdXRdPVwiW3N0cjEsIHN0cjIsIC4uLl1cIlxuICAgICAgLy8gY2FzZSAzYjogW2lucHV0XT1cIlNldFwiXG4gICAgICBjYXNlIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLkFycmF5OlxuICAgICAgY2FzZSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TZXQ6XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IEFycmF5LmZyb20odGhpcy5fbGFzdFNldFZhbHVlIGFzIHN0cmluZ1tdIHwgU2V0PHN0cmluZz4pO1xuICAgICAgICBpZiAoIXZhbHVlSGFzQ2hhbmdlZCkge1xuICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnZhbHVlICEpO1xuICAgICAgICAgIHZhbHVlSGFzQ2hhbmdlZCA9ICFhcnJheUVxdWFsc0FycmF5KGtleXMsIHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlSGFzQ2hhbmdlZCkge1xuICAgICAgICAgIGZpbmFsVmFsdWUgPVxuICAgICAgICAgICAgICBidWxpZE1hcEZyb21WYWx1ZXModGhpcy5fbmFtZSwgdHJpbVZhbHVlcywgcGFyc2VPdXRVbml0cywgYWxsb3dTdWJLZXlzLCB2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBjYXNlIDQ6IFtpbnB1dF09XCJudWxsfHVuZGVmaW5lZFwiXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBmaW5hbFZhbHVlID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlSGFzQ2hhbmdlZCkge1xuICAgICAgKHRoaXMgYXMgYW55KS52YWx1ZSA9IGZpbmFsVmFsdWUgITtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVIYXNDaGFuZ2VkO1xuICB9XG59XG5cbi8qKlxuICogVmFyaW91cyBvcHRpb25zIHRoYXQgYXJlIGNvbnN1bWVkIGJ5IHRoZSBbU3R5bGluZ0RpZmZlcl0gY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFN0eWxpbmdEaWZmZXJPcHRpb25zIHtcbiAgTm9uZSA9IDBiMDAwMDAsXG4gIFRyaW1Qcm9wZXJ0aWVzID0gMGIwMDAwMSxcbiAgQWxsb3dTdWJLZXlzID0gMGIwMDAxMCxcbiAgQWxsb3dTdHJpbmdWYWx1ZSA9IDBiMDAxMDAsXG4gIEFsbG93VW5pdHMgPSAwYjAxMDAwLFxuICBGb3JjZUFzTWFwID0gMGIxMDAwMCxcbn1cblxuLyoqXG4gKiBUaGUgZGlmZmVyZW50IHR5cGVzIG9mIGlucHV0cyB0aGF0IHRoZSBbU3R5bGluZ0RpZmZlcl0gY2FuIGRlYWwgd2l0aFxuICovXG5jb25zdCBlbnVtIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzIHtcbiAgTnVsbCA9IDBiMDAwMCxcbiAgU3RyaW5nID0gMGIwMDAxLFxuICBNYXAgPSAwYjAwMTAsXG4gIEFycmF5ID0gMGIwMTAwLFxuICBTZXQgPSAwYjEwMDAsXG4gIENvbGxlY3Rpb24gPSAwYjExMTAsXG59XG5cblxuLyoqXG4gKiBidWlsZHMgYW5kIHJldHVybnMgYSBtYXAgYmFzZWQgb24gdGhlIHZhbHVlcyBpbnB1dCB2YWx1ZVxuICpcbiAqIElmIHRoZSBga2V5c2AgcGFyYW0gaXMgcHJvdmlkZWQgdGhlbiB0aGUgYHZhbHVlc2AgcGFyYW0gaXMgdHJlYXRlZCBhcyBhXG4gKiBzdHJpbmcgbWFwLiBPdGhlcndpc2UgYHZhbHVlc2AgaXMgdHJlYXRlZCBhcyBhIHN0cmluZyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYnVsaWRNYXBGcm9tVmFsdWVzKFxuICAgIGVycm9yUHJlZml4OiBzdHJpbmcsIHRyaW06IGJvb2xlYW4sIHBhcnNlT3V0VW5pdHM6IGJvb2xlYW4sIGFsbG93U3ViS2V5czogYm9vbGVhbixcbiAgICB2YWx1ZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9IHwgc3RyaW5nW10sIGtleXM/OiBzdHJpbmdbXSkge1xuICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIGlmIChrZXlzKSB7XG4gICAgLy8gY2FzZSAxOiBtYXBcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xuICAgICAga2V5ID0gdHJpbSA/IGtleS50cmltKCkgOiBrZXk7XG4gICAgICBjb25zdCB2YWx1ZSA9ICh2YWx1ZXMgYXN7W2tleTogc3RyaW5nXTogYW55fSlba2V5XTtcblxuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2V0TWFwVmFsdWVzKG1hcCwga2V5LCB2YWx1ZSwgcGFyc2VPdXRVbml0cywgYWxsb3dTdWJLZXlzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gY2FzZSAyOiBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdmFsdWUgPSAodmFsdWVzIGFzIHN0cmluZ1tdKVtpXTtcbiAgICAgIGFzc2VydFZhbGlkVmFsdWUoZXJyb3JQcmVmaXgsIHZhbHVlKTtcbiAgICAgIHZhbHVlID0gdHJpbSA/IHZhbHVlLnRyaW0oKSA6IHZhbHVlO1xuICAgICAgc2V0TWFwVmFsdWVzKG1hcCwgdmFsdWUsIHRydWUsIGZhbHNlLCBhbGxvd1N1YktleXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXA7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkVmFsdWUoZXJyb3JQcmVmaXg6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYCR7ZXJyb3JQcmVmaXh9IGNhbiBvbmx5IHRvZ2dsZSBDU1MgY2xhc3NlcyBleHByZXNzZWQgYXMgc3RyaW5ncywgZ290ICR7dmFsdWV9YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0TWFwVmFsdWVzKFxuICAgIG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBwYXJzZU91dFVuaXRzOiBib29sZWFuLFxuICAgIGFsbG93U3ViS2V5czogYm9vbGVhbikge1xuICBpZiAoYWxsb3dTdWJLZXlzICYmIGtleS5pbmRleE9mKCcgJykgPiAwKSB7XG4gICAgY29uc3QgaW5uZXJLZXlzID0ga2V5LnNwbGl0KC9cXHMrL2cpO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgaW5uZXJLZXlzLmxlbmd0aDsgaisrKSB7XG4gICAgICBzZXRJbmRpdmlkdWFsTWFwVmFsdWUobWFwLCBpbm5lcktleXNbal0sIHZhbHVlLCBwYXJzZU91dFVuaXRzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc2V0SW5kaXZpZHVhbE1hcFZhbHVlKG1hcCwga2V5LCB2YWx1ZSwgcGFyc2VPdXRVbml0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0SW5kaXZpZHVhbE1hcFZhbHVlKFxuICAgIG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBwYXJzZU91dFVuaXRzOiBib29sZWFuKSB7XG4gIGlmIChwYXJzZU91dFVuaXRzKSB7XG4gICAgY29uc3QgdmFsdWVzID0gbm9ybWFsaXplU3R5bGVLZXlBbmRWYWx1ZShrZXksIHZhbHVlKTtcbiAgICB2YWx1ZSA9IHZhbHVlcy52YWx1ZTtcbiAgICBrZXkgPSB2YWx1ZXMua2V5O1xuICB9XG4gIG1hcFtrZXldID0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0eWxlS2V5QW5kVmFsdWUoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG4gIGNvbnN0IGluZGV4ID0ga2V5LmluZGV4T2YoJy4nKTtcbiAgaWYgKGluZGV4ID4gMCkge1xuICAgIGNvbnN0IHVuaXQgPSBrZXkuc3Vic3RyKGluZGV4ICsgMSk7ICAvLyBpZ25vcmUgdGhlIC4gKFt3aWR0aC5weF09XCInNDAnXCIgPT4gXCI0MHB4XCIpXG4gICAga2V5ID0ga2V5LnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHsgIC8vIHdlIHNob3VsZCBub3QgY29udmVydCBudWxsIHZhbHVlcyB0byBzdHJpbmdcbiAgICAgIHZhbHVlICs9IHVuaXQ7XG4gICAgfVxuICB9XG4gIHJldHVybiB7a2V5LCB2YWx1ZX07XG59XG5cbmZ1bmN0aW9uIG1hcEhhc0NoYW5nZWQoa2V5czogc3RyaW5nW10sIGE6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBiOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICBjb25zdCBvbGRLZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gIGNvbnN0IG5ld0tleXMgPSBrZXlzO1xuXG4gIC8vIHRoZSBrZXlzIGFyZSBkaWZmZXJlbnQgd2hpY2ggbWVhbnMgdGhlIG1hcCBjaGFuZ2VkXG4gIGlmICghYXJyYXlFcXVhbHNBcnJheShvbGRLZXlzLCBuZXdLZXlzKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qga2V5ID0gbmV3S2V5c1tpXTtcbiAgICBpZiAoYVtrZXldICE9PSBiW2tleV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gYXJyYXlFcXVhbHNBcnJheShhOiBhbnlbXSB8IG51bGwsIGI6IGFueVtdIHwgbnVsbCkge1xuICBpZiAoYSAmJiBiKSB7XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGIuaW5kZXhPZihhW2ldKSA9PT0gLTEpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl19