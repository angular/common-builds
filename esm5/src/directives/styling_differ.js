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
 */
var StylingDiffer = /** @class */ (function () {
    function StylingDiffer(_name, _options) {
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
     * @param value the new styling input value provided from the ngClass/ngStyle binding
     */
    StylingDiffer.prototype.setInput = function (value) {
        if (value !== this._inputValue) {
            var type = void 0;
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
    };
    /**
     * Checks the input value for identity or deep changes and updates output value if necessary.
     *
     * This function can be called right after `setValue()` is called, but it can also be
     * called incase the existing value (if it's a collection) changes internally. If the
     * value is indeed a collection it will do the necessary diffing work and produce a
     * new object value as assign that to `value`.
     *
     * @returns whether or not the value has changed in some way.
     */
    StylingDiffer.prototype.updateValue = function () {
        var valueHasChanged = this._inputValueIdentityChangeSinceLastCheck;
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
    };
    /**
     * Examines the last set value to see if there was a change in content.
     *
     * @param inputValueIdentityChanged whether or not the last set value changed in identity or not
     * @returns `true` when the value has changed (either by identity or by shape if its a
     * collection)
     */
    StylingDiffer.prototype._processValueChange = function (inputValueIdentityChanged) {
        // if the inputValueIdentityChanged then we know that input has changed
        var inputChanged = inputValueIdentityChanged;
        var newOutputValue = null;
        var trimValues = (this._options & 1 /* TrimProperties */) ? true : false;
        var parseOutUnits = (this._options & 8 /* AllowUnits */) ? true : false;
        var allowSubKeys = (this._options & 2 /* AllowSubKeys */) ? true : false;
        switch (this._inputValueType) {
            // case 1: [input]="string"
            case 1 /* String */: {
                if (inputValueIdentityChanged) {
                    // process string input only if the identity has changed since the strings are immutable
                    var keys = this._inputValue.split(/\s+/g);
                    if (this._options & 16 /* ForceAsMap */) {
                        newOutputValue = {};
                        for (var i = 0; i < keys.length; i++) {
                            newOutputValue[keys[i]] = true;
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
                var inputMap = this._inputValue;
                var inputKeys = Object.keys(inputMap);
                if (!inputValueIdentityChanged) {
                    // if StringMap and the identity has not changed then output value must have already been
                    // initialized to a StringMap, so we can safely compare the input and output maps
                    inputChanged = mapsAreEqual(inputKeys, inputMap, this.value);
                }
                if (inputChanged) {
                    newOutputValue = bulidMapFromStringMap(trimValues, parseOutUnits, allowSubKeys, inputMap, inputKeys);
                }
                break;
            }
            // case 3a: [input]="[str1, str2, ...]"
            // case 3b: [input]="Set"
            case 4 /* Array */:
            case 8 /* Set */: {
                var inputKeys = Array.from(this._inputValue);
                if (!inputValueIdentityChanged) {
                    var outputKeys = Object.keys(this.value);
                    inputChanged = !keyArraysAreEqual(outputKeys, inputKeys);
                }
                if (inputChanged) {
                    newOutputValue =
                        bulidMapFromStringArray(this._name, trimValues, allowSubKeys, inputKeys);
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
            this.value = newOutputValue;
        }
        return inputChanged;
    };
    return StylingDiffer;
}());
export { StylingDiffer };
/**
 * @param trim whether the keys should be trimmed of leading or trailing whitespace
 * @param parseOutUnits whether units like "px" should be parsed out of the key name and appended to
 *   the value
 * @param allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param values values of the map
 * @param keys keys of the map
 * @return a normalized string map based on the input string map
 */
function bulidMapFromStringMap(trim, parseOutUnits, allowSubKeys, values, keys) {
    var map = {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = values[key];
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
 * @param trim whether the keys should be trimmed of leading or trailing whitespace
 * @param parseOutUnits whether units like "px" should be parsed out of the key name and appended to
 *   the value
 * @param allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param values values of the map
 * @param keys keys of the map
 * @return a normalized string map based on the input string array
 */
function bulidMapFromStringArray(errorPrefix, trim, allowSubKeys, keys) {
    var map = {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        ngDevMode && assertValidValue(errorPrefix, key);
        key = trim ? key.trim() : key;
        setMapValues(map, key, true, false, allowSubKeys);
    }
    return map;
}
function assertValidValue(errorPrefix, value) {
    if (typeof value !== 'string') {
        throw new Error(errorPrefix + " can only toggle CSS classes expressed as strings, got: " + value);
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
    if (parseOutUnits && typeof value === 'string') {
        // parse out the unit (e.g. ".px") from the key and append it to the value
        // e.g. for [width.px]="40" => ["width","40px"]
        var unitIndex = key.indexOf('.');
        if (unitIndex > 0) {
            var unit = key.substr(unitIndex + 1); // skip over the "." in "width.px"
            key = key.substring(0, unitIndex);
            value += unit;
        }
    }
    map[key] = value;
}
/**
 * Compares two maps and returns true if they are equal
 *
 * @param inputKeys value of `Object.keys(inputMap)` it's unclear if this actually performs better
 * @param inputMap map to compare
 * @param outputMap map to compare
 */
function mapsAreEqual(inputKeys, inputMap, outputMap) {
    var outputKeys = Object.keys(outputMap);
    if (inputKeys.length !== outputKeys.length) {
        return true;
    }
    for (var i = 0, n = inputKeys.length; i <= n; i++) {
        var key = inputKeys[i];
        if (key !== outputKeys[i] || inputMap[key] !== outputMap[key]) {
            return true;
        }
    }
    return false;
}
/**
 * Compares two Object.keys() arrays and returns true if they are equal.
 *
 * @param keyArray1 Object.keys() array to compare
 * @param keyArray1 Object.keys() array to compare
 */
function keyArraysAreEqual(keyArray1, keyArray2) {
    if (!Array.isArray(keyArray1) || !Array.isArray(keyArray2)) {
        return false;
    }
    if (keyArray1.length !== keyArray2.length) {
        return false;
    }
    for (var i = 0; i < keyArray1.length; i++) {
        if (keyArray1[i] !== keyArray2[i]) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvc3R5bGluZ19kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1ERztBQUNIO0lBdUJFLHVCQUFvQixLQUFhLEVBQVUsUUFBOEI7UUFBckQsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQXNCO1FBdEJ6RTs7O1dBR0c7UUFDYSxVQUFLLEdBQVcsSUFBSSxDQUFDO1FBRXJDOztXQUVHO1FBQ0ssZ0JBQVcsR0FBdUMsSUFBSSxDQUFDO1FBRS9EOztXQUVHO1FBQ0ssb0JBQWUsZ0JBQXlEO1FBRWhGOzs7V0FHRztRQUNLLDRDQUF1QyxHQUFHLEtBQUssQ0FBQztJQUVvQixDQUFDO0lBRTdFOzs7O09BSUc7SUFDSCxnQ0FBUSxHQUFSLFVBQVMsS0FBeUM7UUFDaEQsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM5QixJQUFJLElBQUksU0FBeUIsQ0FBQztZQUNsQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUcsbURBQW1EO2dCQUNoRSxJQUFJLGVBQStCLENBQUM7Z0JBQ3BDLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDZDtpQkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLElBQUksZ0JBQWdDLENBQUM7YUFDdEM7aUJBQU0sSUFBSSxLQUFLLFlBQVksR0FBRyxFQUFFO2dCQUMvQixJQUFJLGNBQThCLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxR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SUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDekMsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3pDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNqQyxPQUFPLEtBQUssQ0FBQztTQUNkO0tBQ0Y7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogVXNlZCB0byBkaWZmIGFuZCBjb252ZXJ0IG5nU3R5bGUvbmdDbGFzcyBpbnN0cnVjdGlvbnMgaW50byBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzLlxuICpcbiAqIG5nU3R5bGUgYW5kIG5nQ2xhc3MgYm90aCBhY2NlcHQgdmFyaW91cyBmb3JtcyBvZiBpbnB1dCBhbmQgYmVoYXZlIGRpZmZlcmVudGx5IHRoYW4gdGhhdFxuICogb2YgaG93IFtzdHlsZV0gYW5kIFtjbGFzc10gYmVoYXZlIGluIEFuZ3VsYXIuXG4gKlxuICogVGhlIGRpZmZlcmVuY2VzIGFyZTpcbiAqICAtIG5nU3R5bGUgYW5kIG5nQ2xhc3MgYm90aCAqKmRlZXAtd2F0Y2gqKiB0aGVpciBiaW5kaW5nIHZhbHVlcyBmb3IgY2hhbmdlcyBlYWNoIHRpbWUgQ0QgcnVuc1xuICogICAgd2hpbGUgW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncyBkbyBub3QgKHRoZXkgY2hlY2sgZm9yIGlkZW50aXR5IGNoYW5nZXMpXG4gKiAgLSBuZ1N0eWxlIGFsbG93cyBmb3IgdW5pdC1iYXNlZCBrZXlzIChlLmcuIGB7J21heC13aWR0aC5weCc6dmFsdWV9YCkgYW5kIFtzdHlsZV0gZG9lcyBub3RcbiAqICAtIG5nQ2xhc3Mgc3VwcG9ydHMgYXJyYXlzIG9mIGNsYXNzIHZhbHVlcyBhbmQgW2NsYXNzXSBvbmx5IGFjY2VwdHMgbWFwIGFuZCBzdHJpbmcgdmFsdWVzXG4gKiAgLSBuZ0NsYXNzIGFsbG93cyBmb3IgbXVsdGlwbGUgY2xhc3NOYW1lIGtleXMgKHNwYWNlLXNlcGFyYXRlZCkgd2l0aGluIGFuIGFycmF5IG9yIG1hcFxuICogICAgIChhcyB0aGUgKiBrZXkpIHdoaWxlIFtjbGFzc10gb25seSBhY2NlcHRzIGEgc2ltcGxlIGtleS92YWx1ZSBtYXAgb2JqZWN0XG4gKlxuICogSGF2aW5nIEFuZ3VsYXIgdW5kZXJzdGFuZCBhbmQgYWRhcHQgdG8gYWxsIHRoZSBkaWZmZXJlbnQgZm9ybXMgb2YgYmVoYXZpb3IgaXMgY29tcGxpY2F0ZWRcbiAqIGFuZCB1bm5lY2Vzc2FyeS4gSW5zdGVhZCwgbmdDbGFzcyBhbmQgbmdTdHlsZSBzaG91bGQgaGF2ZSB0aGVpciBpbnB1dCB2YWx1ZXMgYmUgY29udmVydGVkXG4gKiBpbnRvIHNvbWV0aGluZyB0aGF0IHRoZSBjb3JlLWxldmVsIFtzdHlsZV0gYW5kIFtjbGFzc10gYmluZGluZ3MgdW5kZXJzdGFuZC5cbiAqXG4gKiBUaGlzIFtTdHlsaW5nRGlmZmVyXSBjbGFzcyBoYW5kbGVzIHRoaXMgY29udmVyc2lvbiBieSBjcmVhdGluZyBhIG5ldyBvdXRwdXQgdmFsdWUgZWFjaCB0aW1lXG4gKiB0aGUgaW5wdXQgdmFsdWUgb2YgdGhlIGJpbmRpbmcgdmFsdWUgaGFzIGNoYW5nZWQgKGVpdGhlciB2aWEgaWRlbnRpdHkgY2hhbmdlIG9yIGRlZXAgY29sbGVjdGlvblxuICogY29udGVudCBjaGFuZ2UpLlxuICpcbiAqICMjIFdoeSBkbyB3ZSBjYXJlIGFib3V0IG5nU3R5bGUvbmdDbGFzcz9cbiAqIFRoZSBzdHlsaW5nIGFsZ29yaXRobSBjb2RlIChkb2N1bWVudGVkIGluc2lkZSBvZiBgcmVuZGVyMy9pbnRlcmZhY2VzL3N0eWxpbmcudHNgKSBuZWVkcyB0b1xuICogcmVzcGVjdCBhbmQgdW5kZXJzdGFuZCB0aGUgc3R5bGluZyB2YWx1ZXMgZW1pdHRlZCB0aHJvdWdoIG5nU3R5bGUgYW5kIG5nQ2xhc3MgKHdoZW4gdGhleVxuICogYXJlIHByZXNlbnQgYW5kIHVzZWQgaW4gYSB0ZW1wbGF0ZSkuXG4gKlxuICogSW5zdGVhZCBvZiBoYXZpbmcgdGhlc2UgZGlyZWN0aXZlcyBtYW5hZ2Ugc3R5bGluZyBvbiB0aGVpciBvd24sIHRoZXkgc2hvdWxkIGJlIGluY2x1ZGVkXG4gKiBpbnRvIHRoZSBBbmd1bGFyIHN0eWxpbmcgYWxnb3JpdGhtIHRoYXQgZXhpc3RzIGZvciBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzLlxuICpcbiAqIEhlcmUncyB3aHk6XG4gKlxuICogLSBJZiBuZ1N0eWxlL25nQ2xhc3MgaXMgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIFtzdHlsZV0vW2NsYXNzXSBiaW5kaW5ncyB0aGVuIHRoZVxuICogICBzdHlsZXMgYW5kIGNsYXNzZXMgd291bGQgZmFsbCBvdXQgb2Ygc3luYyBhbmQgYmUgYXBwbGllZCBhbmQgdXBkYXRlZCBhdFxuICogICBpbmNvbnNpc3RlbnQgdGltZXNcbiAqIC0gQm90aCBuZ0NsYXNzL25nU3R5bGUgc2hvdWxkIHJlc3BlY3QgW2NsYXNzLm5hbWVdIGFuZCBbc3R5bGUucHJvcF0gYmluZGluZ3MgKGFuZCBub3QgYXJiaXRyYXJpbHlcbiAqICAgb3ZlcndyaXRlIHRoZWlyIGNoYW5nZXMpXG4gKlxuICogICBgYGBcbiAqICAgPCEtLSBpZiBgdzFgIGlzIHVwZGF0ZWQgdGhlbiBpdCB3aWxsIGFsd2F5cyBvdmVycmlkZSBgdzJgXG4gKiAgICAgICAgaWYgYHcyYCBpcyB1cGRhdGVkIHRoZW4gaXQgd2lsbCBhbHdheXMgb3ZlcnJpZGUgYHcxYFxuICogICAgICAgIGlmIGJvdGggYXJlIHVwZGF0ZWQgYXQgdGhlIHNhbWUgdGltZSB0aGVuIGB3MWAgd2lucyAtLT5cbiAqICAgPGRpdiBbbmdTdHlsZV09XCJ7d2lkdGg6dzF9XCIgW3N0eWxlLndpZHRoXT1cIncyXCI+Li4uPC9kaXY+XG4gKlxuICogICA8IS0tIGlmIGB3MWAgaXMgdXBkYXRlZCB0aGVuIGl0IHdpbGwgYWx3YXlzIGxvc2UgdG8gYHcyYFxuICogICAgICAgIGlmIGB3MmAgaXMgdXBkYXRlZCB0aGVuIGl0IHdpbGwgYWx3YXlzIG92ZXJyaWRlIGB3MWBcbiAqICAgICAgICBpZiBib3RoIGFyZSB1cGRhdGVkIGF0IHRoZSBzYW1lIHRpbWUgdGhlbiBgdzJgIHdpbnMgLS0+XG4gKiAgIDxkaXYgW3N0eWxlXT1cInt3aWR0aDp3MX1cIiBbc3R5bGUud2lkdGhdPVwidzJcIj4uLi48L2Rpdj5cbiAqICAgYGBgXG4gKiAtIG5nQ2xhc3MvbmdTdHlsZSB3ZXJlIHdyaXR0ZW4gYXMgYSBkaXJlY3RpdmVzIGFuZCBtYWRlIHVzZSBvZiBtYXBzLCBjbG9zdXJlcyBhbmQgb3RoZXJcbiAqICAgZXhwZW5zaXZlIGRhdGEgc3RydWN0dXJlcyB3aGljaCB3ZXJlIGV2YWx1YXRlZCBlYWNoIHRpbWUgQ0QgcnVuc1xuICovXG5leHBvcnQgY2xhc3MgU3R5bGluZ0RpZmZlcjxUIGV4dGVuZHMoe1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bGx9IHwge1trZXk6IHN0cmluZ106IHRydWV9KT4ge1xuICAvKipcbiAgICogTm9ybWFsaXplZCBzdHJpbmcgbWFwIHJlcHJlc2VudGluZyB0aGUgbGFzdCB2YWx1ZSBzZXQgdmlhIGBzZXRWYWx1ZSgpYCBvciBudWxsIGlmIG5vIHZhbHVlIGhhc1xuICAgKiBiZWVuIHNldCBvciB0aGUgbGFzdCBzZXQgdmFsdWUgd2FzIG51bGxcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSB2YWx1ZTogVHxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogVGhlIGxhc3Qgc2V0IHZhbHVlIHRoYXQgd2FzIGFwcGxpZWQgdmlhIGBzZXRWYWx1ZSgpYFxuICAgKi9cbiAgcHJpdmF0ZSBfaW5wdXRWYWx1ZTogVHxzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSB0eXBlIG9mIHZhbHVlIHRoYXQgdGhlIGBfbGFzdFNldFZhbHVlYCB2YXJpYWJsZSBpc1xuICAgKi9cbiAgcHJpdmF0ZSBfaW5wdXRWYWx1ZVR5cGU6IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuTnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhlIGxhc3QgdmFsdWUgY2hhbmdlIG9jY3VycmVkIGJlY2F1c2UgdGhlIHZhcmlhYmxlIGl0c2VsZiBjaGFuZ2VkIHJlZmVyZW5jZVxuICAgKiAoaWRlbnRpdHkpXG4gICAqL1xuICBwcml2YXRlIF9pbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VTaW5jZUxhc3RDaGVjayA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX25hbWU6IHN0cmluZywgcHJpdmF0ZSBfb3B0aW9uczogU3R5bGluZ0RpZmZlck9wdGlvbnMpIHt9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGlucHV0IHZhbHVlIGZvciB0aGUgZGlmZmVyIGFuZCB1cGRhdGVzIHRoZSBvdXRwdXQgdmFsdWUgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIG5ldyBzdHlsaW5nIGlucHV0IHZhbHVlIHByb3ZpZGVkIGZyb20gdGhlIG5nQ2xhc3MvbmdTdHlsZSBiaW5kaW5nXG4gICAqL1xuICBzZXRJbnB1dCh2YWx1ZTogVHxzdHJpbmdbXXxzdHJpbmd8U2V0PHN0cmluZz58bnVsbCk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5faW5wdXRWYWx1ZSkge1xuICAgICAgbGV0IHR5cGU6IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzO1xuICAgICAgaWYgKCF2YWx1ZSkgeyAgLy8gbWF0Y2hlcyBlbXB0eSBzdHJpbmdzLCBudWxsLCBmYWxzZSBhbmQgdW5kZWZpbmVkXG4gICAgICAgIHR5cGUgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5OdWxsO1xuICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHR5cGUgPSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5BcnJheTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgdHlwZSA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlNldDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoISh0aGlzLl9vcHRpb25zICYgU3R5bGluZ0RpZmZlck9wdGlvbnMuQWxsb3dTdHJpbmdWYWx1ZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy5fbmFtZSArICcgc3RyaW5nIHZhbHVlcyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlID0gU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU3RyaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZSA9IFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzLlN0cmluZ01hcDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5faW5wdXRWYWx1ZSA9IHZhbHVlO1xuICAgICAgdGhpcy5faW5wdXRWYWx1ZVR5cGUgPSB0eXBlO1xuICAgICAgdGhpcy5faW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlU2luY2VMYXN0Q2hlY2sgPSB0cnVlO1xuICAgICAgdGhpcy5fcHJvY2Vzc1ZhbHVlQ2hhbmdlKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGlucHV0IHZhbHVlIGZvciBpZGVudGl0eSBvciBkZWVwIGNoYW5nZXMgYW5kIHVwZGF0ZXMgb3V0cHV0IHZhbHVlIGlmIG5lY2Vzc2FyeS5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIHJpZ2h0IGFmdGVyIGBzZXRWYWx1ZSgpYCBpcyBjYWxsZWQsIGJ1dCBpdCBjYW4gYWxzbyBiZVxuICAgKiBjYWxsZWQgaW5jYXNlIHRoZSBleGlzdGluZyB2YWx1ZSAoaWYgaXQncyBhIGNvbGxlY3Rpb24pIGNoYW5nZXMgaW50ZXJuYWxseS4gSWYgdGhlXG4gICAqIHZhbHVlIGlzIGluZGVlZCBhIGNvbGxlY3Rpb24gaXQgd2lsbCBkbyB0aGUgbmVjZXNzYXJ5IGRpZmZpbmcgd29yayBhbmQgcHJvZHVjZSBhXG4gICAqIG5ldyBvYmplY3QgdmFsdWUgYXMgYXNzaWduIHRoYXQgdG8gYHZhbHVlYC5cbiAgICpcbiAgICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZhbHVlIGhhcyBjaGFuZ2VkIGluIHNvbWUgd2F5LlxuICAgKi9cbiAgdXBkYXRlVmFsdWUoKTogYm9vbGVhbiB7XG4gICAgbGV0IHZhbHVlSGFzQ2hhbmdlZCA9IHRoaXMuX2lucHV0VmFsdWVJZGVudGl0eUNoYW5nZVNpbmNlTGFzdENoZWNrO1xuICAgIGlmICghdGhpcy5faW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlU2luY2VMYXN0Q2hlY2sgJiZcbiAgICAgICAgKHRoaXMuX2lucHV0VmFsdWVUeXBlICYgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuQ29sbGVjdGlvbikpIHtcbiAgICAgIHZhbHVlSGFzQ2hhbmdlZCA9IHRoaXMuX3Byb2Nlc3NWYWx1ZUNoYW5nZShmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRoaXMgaXMgc2V0IHRvIGZhbHNlIGluIHRoZSBldmVudCB0aGF0IHRoZSB2YWx1ZSBpcyBhIGNvbGxlY3Rpb24uXG4gICAgICAvLyBUaGlzIHdheSAoaWYgdGhlIGlkZW50aXR5IGhhc24ndCBjaGFuZ2VkKSwgdGhlbiB0aGUgYWxnb3JpdGhtIGNhblxuICAgICAgLy8gZGlmZiB0aGUgY29sbGVjdGlvbiB2YWx1ZSB0byBzZWUgaWYgdGhlIGNvbnRlbnRzIGhhdmUgbXV0YXRlZFxuICAgICAgLy8gKG90aGVyd2lzZSB0aGUgdmFsdWUgY2hhbmdlIHdhcyBwcm9jZXNzZWQgZHVyaW5nIHRoZSB0aW1lIHdoZW5cbiAgICAgIC8vIHRoZSB2YXJpYWJsZSBjaGFuZ2VkKS5cbiAgICAgIHRoaXMuX2lucHV0VmFsdWVJZGVudGl0eUNoYW5nZVNpbmNlTGFzdENoZWNrID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZUhhc0NoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogRXhhbWluZXMgdGhlIGxhc3Qgc2V0IHZhbHVlIHRvIHNlZSBpZiB0aGVyZSB3YXMgYSBjaGFuZ2UgaW4gY29udGVudC5cbiAgICpcbiAgICogQHBhcmFtIGlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQgd2hldGhlciBvciBub3QgdGhlIGxhc3Qgc2V0IHZhbHVlIGNoYW5nZWQgaW4gaWRlbnRpdHkgb3Igbm90XG4gICAqIEByZXR1cm5zIGB0cnVlYCB3aGVuIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZCAoZWl0aGVyIGJ5IGlkZW50aXR5IG9yIGJ5IHNoYXBlIGlmIGl0cyBhXG4gICAqIGNvbGxlY3Rpb24pXG4gICAqL1xuICBwcml2YXRlIF9wcm9jZXNzVmFsdWVDaGFuZ2UoaW5wdXRWYWx1ZUlkZW50aXR5Q2hhbmdlZDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIC8vIGlmIHRoZSBpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkIHRoZW4gd2Uga25vdyB0aGF0IGlucHV0IGhhcyBjaGFuZ2VkXG4gICAgbGV0IGlucHV0Q2hhbmdlZCA9IGlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQ7XG5cbiAgICBsZXQgbmV3T3V0cHV0VmFsdWU6IFR8c3RyaW5nfG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHRyaW1WYWx1ZXMgPSAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLlRyaW1Qcm9wZXJ0aWVzKSA/IHRydWUgOiBmYWxzZTtcbiAgICBjb25zdCBwYXJzZU91dFVuaXRzID0gKHRoaXMuX29wdGlvbnMgJiBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1VuaXRzKSA/IHRydWUgOiBmYWxzZTtcbiAgICBjb25zdCBhbGxvd1N1YktleXMgPSAodGhpcy5fb3B0aW9ucyAmIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3ViS2V5cykgPyB0cnVlIDogZmFsc2U7XG5cbiAgICBzd2l0Y2ggKHRoaXMuX2lucHV0VmFsdWVUeXBlKSB7XG4gICAgICAvLyBjYXNlIDE6IFtpbnB1dF09XCJzdHJpbmdcIlxuICAgICAgY2FzZSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5TdHJpbmc6IHtcbiAgICAgICAgaWYgKGlucHV0VmFsdWVJZGVudGl0eUNoYW5nZWQpIHtcbiAgICAgICAgICAvLyBwcm9jZXNzIHN0cmluZyBpbnB1dCBvbmx5IGlmIHRoZSBpZGVudGl0eSBoYXMgY2hhbmdlZCBzaW5jZSB0aGUgc3RyaW5ncyBhcmUgaW1tdXRhYmxlXG4gICAgICAgICAgY29uc3Qga2V5cyA9ICh0aGlzLl9pbnB1dFZhbHVlIGFzIHN0cmluZykuc3BsaXQoL1xccysvZyk7XG4gICAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMgJiBTdHlsaW5nRGlmZmVyT3B0aW9ucy5Gb3JjZUFzTWFwKSB7XG4gICAgICAgICAgICBuZXdPdXRwdXRWYWx1ZSA9IHt9IGFzIFQ7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgKG5ld091dHB1dFZhbHVlIGFzIGFueSlba2V5c1tpXV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdPdXRwdXRWYWx1ZSA9IGtleXMuam9pbignICcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8vIGNhc2UgMjogW2lucHV0XT1cIntrZXk6dmFsdWV9XCJcbiAgICAgIGNhc2UgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU3RyaW5nTWFwOiB7XG4gICAgICAgIGNvbnN0IGlucHV0TWFwID0gdGhpcy5faW5wdXRWYWx1ZSBhcyBUO1xuICAgICAgICBjb25zdCBpbnB1dEtleXMgPSBPYmplY3Qua2V5cyhpbnB1dE1hcCk7XG5cbiAgICAgICAgaWYgKCFpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkKSB7XG4gICAgICAgICAgLy8gaWYgU3RyaW5nTWFwIGFuZCB0aGUgaWRlbnRpdHkgaGFzIG5vdCBjaGFuZ2VkIHRoZW4gb3V0cHV0IHZhbHVlIG11c3QgaGF2ZSBhbHJlYWR5IGJlZW5cbiAgICAgICAgICAvLyBpbml0aWFsaXplZCB0byBhIFN0cmluZ01hcCwgc28gd2UgY2FuIHNhZmVseSBjb21wYXJlIHRoZSBpbnB1dCBhbmQgb3V0cHV0IG1hcHNcbiAgICAgICAgICBpbnB1dENoYW5nZWQgPSBtYXBzQXJlRXF1YWwoaW5wdXRLZXlzLCBpbnB1dE1hcCwgdGhpcy52YWx1ZSBhcyBUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbnB1dENoYW5nZWQpIHtcbiAgICAgICAgICBuZXdPdXRwdXRWYWx1ZSA9IGJ1bGlkTWFwRnJvbVN0cmluZ01hcChcbiAgICAgICAgICAgICAgdHJpbVZhbHVlcywgcGFyc2VPdXRVbml0cywgYWxsb3dTdWJLZXlzLCBpbnB1dE1hcCwgaW5wdXRLZXlzKSBhcyBUO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gY2FzZSAzYTogW2lucHV0XT1cIltzdHIxLCBzdHIyLCAuLi5dXCJcbiAgICAgIC8vIGNhc2UgM2I6IFtpbnB1dF09XCJTZXRcIlxuICAgICAgY2FzZSBTdHlsaW5nRGlmZmVyVmFsdWVUeXBlcy5BcnJheTpcbiAgICAgIGNhc2UgU3R5bGluZ0RpZmZlclZhbHVlVHlwZXMuU2V0OiB7XG4gICAgICAgIGNvbnN0IGlucHV0S2V5cyA9IEFycmF5LmZyb20odGhpcy5faW5wdXRWYWx1ZSBhcyBzdHJpbmdbXSB8IFNldDxzdHJpbmc+KTtcbiAgICAgICAgaWYgKCFpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkKSB7XG4gICAgICAgICAgY29uc3Qgb3V0cHV0S2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudmFsdWUgISk7XG4gICAgICAgICAgaW5wdXRDaGFuZ2VkID0gIWtleUFycmF5c0FyZUVxdWFsKG91dHB1dEtleXMsIGlucHV0S2V5cyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0Q2hhbmdlZCkge1xuICAgICAgICAgIG5ld091dHB1dFZhbHVlID1cbiAgICAgICAgICAgICAgYnVsaWRNYXBGcm9tU3RyaW5nQXJyYXkodGhpcy5fbmFtZSwgdHJpbVZhbHVlcywgYWxsb3dTdWJLZXlzLCBpbnB1dEtleXMpIGFzIFQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBjYXNlIDQ6IFtpbnB1dF09XCJudWxsfHVuZGVmaW5lZFwiXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpbnB1dENoYW5nZWQgPSBpbnB1dFZhbHVlSWRlbnRpdHlDaGFuZ2VkO1xuICAgICAgICBuZXdPdXRwdXRWYWx1ZSA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChpbnB1dENoYW5nZWQpIHtcbiAgICAgIC8vIHVwZGF0ZSB0aGUgcmVhZG9ubHkgYHZhbHVlYCBwcm9wZXJ0eSBieSBjYXN0aW5nIGl0IHRvIGBhbnlgIGZpcnN0XG4gICAgICAodGhpcyBhcyBhbnkpLnZhbHVlID0gbmV3T3V0cHV0VmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlucHV0Q2hhbmdlZDtcbiAgfVxufVxuXG4vKipcbiAqIFZhcmlvdXMgb3B0aW9ucyB0aGF0IGFyZSBjb25zdW1lZCBieSB0aGUgW1N0eWxpbmdEaWZmZXJdIGNsYXNzXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFN0eWxpbmdEaWZmZXJPcHRpb25zIHtcbiAgTm9uZSA9IDBiMDAwMDAsICAgICAgICAgICAgICAvL1xuICBUcmltUHJvcGVydGllcyA9IDBiMDAwMDEsICAgIC8vXG4gIEFsbG93U3ViS2V5cyA9IDBiMDAwMTAsICAgICAgLy9cbiAgQWxsb3dTdHJpbmdWYWx1ZSA9IDBiMDAxMDAsICAvL1xuICBBbGxvd1VuaXRzID0gMGIwMTAwMCwgICAgICAgIC8vXG4gIEZvcmNlQXNNYXAgPSAwYjEwMDAwLCAgICAgICAgLy9cbn1cblxuLyoqXG4gKiBUaGUgZGlmZmVyZW50IHR5cGVzIG9mIGlucHV0cyB0aGF0IHRoZSBbU3R5bGluZ0RpZmZlcl0gY2FuIGRlYWwgd2l0aFxuICovXG5jb25zdCBlbnVtIFN0eWxpbmdEaWZmZXJWYWx1ZVR5cGVzIHtcbiAgTnVsbCA9IDBiMDAwMCwgICAgICAgIC8vXG4gIFN0cmluZyA9IDBiMDAwMSwgICAgICAvL1xuICBTdHJpbmdNYXAgPSAwYjAwMTAsICAgLy9cbiAgQXJyYXkgPSAwYjAxMDAsICAgICAgIC8vXG4gIFNldCA9IDBiMTAwMCwgICAgICAgICAvL1xuICBDb2xsZWN0aW9uID0gMGIxMTEwLCAgLy9cbn1cblxuXG4vKipcbiAqIEBwYXJhbSB0cmltIHdoZXRoZXIgdGhlIGtleXMgc2hvdWxkIGJlIHRyaW1tZWQgb2YgbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gKiBAcGFyYW0gcGFyc2VPdXRVbml0cyB3aGV0aGVyIHVuaXRzIGxpa2UgXCJweFwiIHNob3VsZCBiZSBwYXJzZWQgb3V0IG9mIHRoZSBrZXkgbmFtZSBhbmQgYXBwZW5kZWQgdG9cbiAqICAgdGhlIHZhbHVlXG4gKiBAcGFyYW0gYWxsb3dTdWJLZXlzIHdoZXRoZXIga2V5IG5lZWRzIHRvIGJlIHN1YnNwbGl0IGJ5IHdoaXRlc3BhY2UgaW50byBtdWx0aXBsZSBrZXlzXG4gKiBAcGFyYW0gdmFsdWVzIHZhbHVlcyBvZiB0aGUgbWFwXG4gKiBAcGFyYW0ga2V5cyBrZXlzIG9mIHRoZSBtYXBcbiAqIEByZXR1cm4gYSBub3JtYWxpemVkIHN0cmluZyBtYXAgYmFzZWQgb24gdGhlIGlucHV0IHN0cmluZyBtYXBcbiAqL1xuZnVuY3Rpb24gYnVsaWRNYXBGcm9tU3RyaW5nTWFwKFxuICAgIHRyaW06IGJvb2xlYW4sIHBhcnNlT3V0VW5pdHM6IGJvb2xlYW4sIGFsbG93U3ViS2V5czogYm9vbGVhbixcbiAgICB2YWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudWxsIHwgdHJ1ZX0sXG4gICAga2V5czogc3RyaW5nW10pOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbCB8IHRydWV9IHtcbiAgY29uc3QgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbCB8IHRydWV9ID0ge307XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGtleSA9IGtleXNbaV07XG4gICAgbGV0IHZhbHVlID0gdmFsdWVzW2tleV07XG5cbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHZhbHVlID0gJycgKyB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIC8vIE1hcCB1c2VzIHVudHJpbW1lZCBrZXlzLCBzbyBkb24ndCB0cmltIHVudGlsIHBhc3NpbmcgdG8gYHNldE1hcFZhbHVlc2BcbiAgICAgIHNldE1hcFZhbHVlcyhtYXAsIHRyaW0gPyBrZXkudHJpbSgpIDoga2V5LCB2YWx1ZSwgcGFyc2VPdXRVbml0cywgYWxsb3dTdWJLZXlzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWFwO1xufVxuXG4vKipcbiAqIEBwYXJhbSB0cmltIHdoZXRoZXIgdGhlIGtleXMgc2hvdWxkIGJlIHRyaW1tZWQgb2YgbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gKiBAcGFyYW0gcGFyc2VPdXRVbml0cyB3aGV0aGVyIHVuaXRzIGxpa2UgXCJweFwiIHNob3VsZCBiZSBwYXJzZWQgb3V0IG9mIHRoZSBrZXkgbmFtZSBhbmQgYXBwZW5kZWQgdG9cbiAqICAgdGhlIHZhbHVlXG4gKiBAcGFyYW0gYWxsb3dTdWJLZXlzIHdoZXRoZXIga2V5IG5lZWRzIHRvIGJlIHN1YnNwbGl0IGJ5IHdoaXRlc3BhY2UgaW50byBtdWx0aXBsZSBrZXlzXG4gKiBAcGFyYW0gdmFsdWVzIHZhbHVlcyBvZiB0aGUgbWFwXG4gKiBAcGFyYW0ga2V5cyBrZXlzIG9mIHRoZSBtYXBcbiAqIEByZXR1cm4gYSBub3JtYWxpemVkIHN0cmluZyBtYXAgYmFzZWQgb24gdGhlIGlucHV0IHN0cmluZyBhcnJheVxuICovXG5mdW5jdGlvbiBidWxpZE1hcEZyb21TdHJpbmdBcnJheShcbiAgICBlcnJvclByZWZpeDogc3RyaW5nLCB0cmltOiBib29sZWFuLCBhbGxvd1N1YktleXM6IGJvb2xlYW4sXG4gICAga2V5czogc3RyaW5nW10pOiB7W2tleTogc3RyaW5nXTogdHJ1ZX0ge1xuICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiB0cnVlfSA9IHt9O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBrZXkgPSBrZXlzW2ldO1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRWYWxpZFZhbHVlKGVycm9yUHJlZml4LCBrZXkpO1xuICAgIGtleSA9IHRyaW0gPyBrZXkudHJpbSgpIDoga2V5O1xuICAgIHNldE1hcFZhbHVlcyhtYXAsIGtleSwgdHJ1ZSwgZmFsc2UsIGFsbG93U3ViS2V5cyk7XG4gIH1cblxuICByZXR1cm4gbWFwO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRWYWxpZFZhbHVlKGVycm9yUHJlZml4OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGAke2Vycm9yUHJlZml4fSBjYW4gb25seSB0b2dnbGUgQ1NTIGNsYXNzZXMgZXhwcmVzc2VkIGFzIHN0cmluZ3MsIGdvdDogJHt2YWx1ZX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRNYXBWYWx1ZXMoXG4gICAgbWFwOiB7W2tleTogc3RyaW5nXTogdW5rbm93bn0sIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IHRydWUsIHBhcnNlT3V0VW5pdHM6IGJvb2xlYW4sXG4gICAgYWxsb3dTdWJLZXlzOiBib29sZWFuKSB7XG4gIGlmIChhbGxvd1N1YktleXMgJiYga2V5LmluZGV4T2YoJyAnKSA+IDApIHtcbiAgICBjb25zdCBpbm5lcktleXMgPSBrZXkuc3BsaXQoL1xccysvZyk7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBpbm5lcktleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHNldEluZGl2aWR1YWxNYXBWYWx1ZShtYXAsIGlubmVyS2V5c1tqXSwgdmFsdWUsIHBhcnNlT3V0VW5pdHMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzZXRJbmRpdmlkdWFsTWFwVmFsdWUobWFwLCBrZXksIHZhbHVlLCBwYXJzZU91dFVuaXRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRJbmRpdmlkdWFsTWFwVmFsdWUoXG4gICAgbWFwOiB7W2tleTogc3RyaW5nXTogdW5rbm93bn0sIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgdHJ1ZSB8IG51bGwsXG4gICAgcGFyc2VPdXRVbml0czogYm9vbGVhbikge1xuICBpZiAocGFyc2VPdXRVbml0cyAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gcGFyc2Ugb3V0IHRoZSB1bml0IChlLmcuIFwiLnB4XCIpIGZyb20gdGhlIGtleSBhbmQgYXBwZW5kIGl0IHRvIHRoZSB2YWx1ZVxuICAgIC8vIGUuZy4gZm9yIFt3aWR0aC5weF09XCI0MFwiID0+IFtcIndpZHRoXCIsXCI0MHB4XCJdXG4gICAgY29uc3QgdW5pdEluZGV4ID0ga2V5LmluZGV4T2YoJy4nKTtcbiAgICBpZiAodW5pdEluZGV4ID4gMCkge1xuICAgICAgY29uc3QgdW5pdCA9IGtleS5zdWJzdHIodW5pdEluZGV4ICsgMSk7ICAvLyBza2lwIG92ZXIgdGhlIFwiLlwiIGluIFwid2lkdGgucHhcIlxuICAgICAga2V5ID0ga2V5LnN1YnN0cmluZygwLCB1bml0SW5kZXgpO1xuICAgICAgdmFsdWUgKz0gdW5pdDtcbiAgICB9XG4gIH1cbiAgbWFwW2tleV0gPSB2YWx1ZTtcbn1cblxuXG4vKipcbiAqIENvbXBhcmVzIHR3byBtYXBzIGFuZCByZXR1cm5zIHRydWUgaWYgdGhleSBhcmUgZXF1YWxcbiAqXG4gKiBAcGFyYW0gaW5wdXRLZXlzIHZhbHVlIG9mIGBPYmplY3Qua2V5cyhpbnB1dE1hcClgIGl0J3MgdW5jbGVhciBpZiB0aGlzIGFjdHVhbGx5IHBlcmZvcm1zIGJldHRlclxuICogQHBhcmFtIGlucHV0TWFwIG1hcCB0byBjb21wYXJlXG4gKiBAcGFyYW0gb3V0cHV0TWFwIG1hcCB0byBjb21wYXJlXG4gKi9cbmZ1bmN0aW9uIG1hcHNBcmVFcXVhbChcbiAgICBpbnB1dEtleXM6IHN0cmluZ1tdLCBpbnB1dE1hcDoge1trZXk6IHN0cmluZ106IHVua25vd259LFxuICAgIG91dHB1dE1hcDoge1trZXk6IHN0cmluZ106IHVua25vd259LCApOiBib29sZWFuIHtcbiAgY29uc3Qgb3V0cHV0S2V5cyA9IE9iamVjdC5rZXlzKG91dHB1dE1hcCk7XG5cbiAgaWYgKGlucHV0S2V5cy5sZW5ndGggIT09IG91dHB1dEtleXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMCwgbiA9IGlucHV0S2V5cy5sZW5ndGg7IGkgPD0gbjsgaSsrKSB7XG4gICAgbGV0IGtleSA9IGlucHV0S2V5c1tpXTtcbiAgICBpZiAoa2V5ICE9PSBvdXRwdXRLZXlzW2ldIHx8IGlucHV0TWFwW2tleV0gIT09IG91dHB1dE1hcFtrZXldKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuLyoqXG4gKiBDb21wYXJlcyB0d28gT2JqZWN0LmtleXMoKSBhcnJheXMgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbC5cbiAqXG4gKiBAcGFyYW0ga2V5QXJyYXkxIE9iamVjdC5rZXlzKCkgYXJyYXkgdG8gY29tcGFyZVxuICogQHBhcmFtIGtleUFycmF5MSBPYmplY3Qua2V5cygpIGFycmF5IHRvIGNvbXBhcmVcbiAqL1xuZnVuY3Rpb24ga2V5QXJyYXlzQXJlRXF1YWwoa2V5QXJyYXkxOiBzdHJpbmdbXSB8IG51bGwsIGtleUFycmF5Mjogc3RyaW5nW10gfCBudWxsKTogYm9vbGVhbiB7XG4gIGlmICghQXJyYXkuaXNBcnJheShrZXlBcnJheTEpIHx8ICFBcnJheS5pc0FycmF5KGtleUFycmF5MikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoa2V5QXJyYXkxLmxlbmd0aCAhPT0ga2V5QXJyYXkyLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwga2V5QXJyYXkxLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGtleUFycmF5MVtpXSAhPT0ga2V5QXJyYXkyW2ldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=