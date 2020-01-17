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
export declare class StylingDiffer<T extends ({
    [key: string]: string | null;
} | {
    [key: string]: true;
})> {
    private _name;
    private _options;
    /**
     * Normalized string map representing the last value set via `setValue()` or null if no value has
     * been set or the last set value was null
     */
    readonly value: T | null;
    /**
     * The last set value that was applied via `setValue()`
     */
    private _inputValue;
    /**
     * The type of value that the `_lastSetValue` variable is
     */
    private _inputValueType;
    /**
     * Whether or not the last value change occurred because the variable itself changed reference
     * (identity)
     */
    private _inputValueIdentityChangeSinceLastCheck;
    constructor(_name: string, _options: StylingDifferOptions);
    /**
     * Sets the input value for the differ and updates the output value if necessary.
     *
     * @param value the new styling input value provided from the ngClass/ngStyle binding
     */
    setInput(value: T | string[] | string | Set<string> | null): void;
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
    updateValue(): boolean;
    /**
     * Examines the last set value to see if there was a change in content.
     *
     * @param inputValueIdentityChanged whether or not the last set value changed in identity or not
     * @returns `true` when the value has changed (either by identity or by shape if its a
     * collection)
     */
    private _processValueChange;
}
/**
 * Various options that are consumed by the [StylingDiffer] class
 */
export declare const enum StylingDifferOptions {
    None = 0,
    TrimProperties = 1,
    AllowSubKeys = 2,
    AllowStringValue = 4,
    AllowUnits = 8,
    ForceAsMap = 16
}
