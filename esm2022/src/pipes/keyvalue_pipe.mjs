/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { KeyValueDiffers, Pipe, } from '@angular/core';
import * as i0 from "@angular/core";
function makeKeyValuePair(key, value) {
    return { key: key, value: value };
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms Object or Map into an array of key value pairs.
 *
 * The output array will be ordered by keys.
 * By default the comparator will be by Unicode point value.
 * You can optionally pass a compareFn if your keys are complex types.
 *
 * @usageNotes
 * ### Examples
 *
 * This examples show how an Object or a Map can be iterated by ngFor with the use of this
 * keyvalue pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @publicApi
 */
export class KeyValuePipe {
    constructor(differs) {
        this.differs = differs;
        this.keyValues = [];
        this.compareFn = defaultComparator;
    }
    transform(input, compareFn = defaultComparator) {
        if (!input || (!(input instanceof Map) && typeof input !== 'object')) {
            return null;
        }
        // make a differ for whatever type we've been passed in
        this.differ ??= this.differs.find(input).create();
        const differChanges = this.differ.diff(input);
        const compareFnChanged = compareFn !== this.compareFn;
        if (differChanges) {
            this.keyValues = [];
            differChanges.forEachItem((r) => {
                this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
            });
        }
        if (differChanges || compareFnChanged) {
            this.keyValues.sort(compareFn);
            this.compareFn = compareFn;
        }
        return this.keyValues;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: KeyValuePipe, deps: [{ token: i0.KeyValueDiffers }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: KeyValuePipe, isStandalone: true, name: "keyvalue", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: KeyValuePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'keyvalue',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.KeyValueDiffers }] });
export function defaultComparator(keyValueA, keyValueB) {
    const a = keyValueA.key;
    const b = keyValueB.key;
    // if same exit with 0;
    if (a === b)
        return 0;
    // make sure that undefined are at the end of the sort.
    if (a === undefined)
        return 1;
    if (b === undefined)
        return -1;
    // make sure that nulls are at the end of the sort.
    if (a === null)
        return 1;
    if (b === null)
        return -1;
    if (typeof a == 'string' && typeof b == 'string') {
        return a < b ? -1 : 1;
    }
    if (typeof a == 'number' && typeof b == 'number') {
        return a - b;
    }
    if (typeof a == 'boolean' && typeof b == 'boolean') {
        return a < b ? -1 : 1;
    }
    // `a` and `b` are of different types. Compare their string values.
    const aString = String(a);
    const bString = String(b);
    return aString == bString ? 0 : aString < bString ? -1 : 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBSUwsZUFBZSxFQUNmLElBQUksR0FFTCxNQUFNLGVBQWUsQ0FBQzs7QUFFdkIsU0FBUyxnQkFBZ0IsQ0FBTyxHQUFNLEVBQUUsS0FBUTtJQUM5QyxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUM7QUFDbEMsQ0FBQztBQWFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBTUgsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFBNkIsT0FBd0I7UUFBeEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFHN0MsY0FBUyxHQUE4QixFQUFFLENBQUM7UUFDMUMsY0FBUyxHQUE2RCxpQkFBaUIsQ0FBQztJQUp4QyxDQUFDO0lBdUN6RCxTQUFTLENBQ1AsS0FBa0YsRUFDbEYsWUFBOEQsaUJBQWlCO1FBRS9FLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLEdBQUcsQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDckUsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsdURBQXVEO1FBQ3ZELElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFbEQsTUFBTSxhQUFhLEdBQWlDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQVksQ0FBQyxDQUFDO1FBQ25GLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFdEQsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBNkIsRUFBRSxFQUFFO2dCQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxZQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksYUFBYSxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDN0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO3lIQWpFVSxZQUFZO3VIQUFaLFlBQVk7O3NHQUFaLFlBQVk7a0JBTHhCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7QUFxRUQsTUFBTSxVQUFVLGlCQUFpQixDQUMvQixTQUF5QixFQUN6QixTQUF5QjtJQUV6QixNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDeEIsdUJBQXVCO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0Qix1REFBdUQ7SUFDdkQsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9CLG1EQUFtRDtJQUNuRCxJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFLENBQUM7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxFQUFFLENBQUM7UUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxtRUFBbUU7SUFDbkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEtleVZhbHVlQ2hhbmdlUmVjb3JkLFxuICBLZXlWYWx1ZUNoYW5nZXMsXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIFBpcGUsXG4gIFBpcGVUcmFuc2Zvcm0sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5mdW5jdGlvbiBtYWtlS2V5VmFsdWVQYWlyPEssIFY+KGtleTogSywgdmFsdWU6IFYpOiBLZXlWYWx1ZTxLLCBWPiB7XG4gIHJldHVybiB7a2V5OiBrZXksIHZhbHVlOiB2YWx1ZX07XG59XG5cbi8qKlxuICogQSBrZXkgdmFsdWUgcGFpci5cbiAqIFVzdWFsbHkgdXNlZCB0byByZXByZXNlbnQgdGhlIGtleSB2YWx1ZSBwYWlycyBmcm9tIGEgTWFwIG9yIE9iamVjdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5VmFsdWU8SywgVj4ge1xuICBrZXk6IEs7XG4gIHZhbHVlOiBWO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFRyYW5zZm9ybXMgT2JqZWN0IG9yIE1hcCBpbnRvIGFuIGFycmF5IG9mIGtleSB2YWx1ZSBwYWlycy5cbiAqXG4gKiBUaGUgb3V0cHV0IGFycmF5IHdpbGwgYmUgb3JkZXJlZCBieSBrZXlzLlxuICogQnkgZGVmYXVsdCB0aGUgY29tcGFyYXRvciB3aWxsIGJlIGJ5IFVuaWNvZGUgcG9pbnQgdmFsdWUuXG4gKiBZb3UgY2FuIG9wdGlvbmFsbHkgcGFzcyBhIGNvbXBhcmVGbiBpZiB5b3VyIGtleXMgYXJlIGNvbXBsZXggdHlwZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIFRoaXMgZXhhbXBsZXMgc2hvdyBob3cgYW4gT2JqZWN0IG9yIGEgTWFwIGNhbiBiZSBpdGVyYXRlZCBieSBuZ0ZvciB3aXRoIHRoZSB1c2Ugb2YgdGhpc1xuICoga2V5dmFsdWUgcGlwZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2tleXZhbHVlX3BpcGUudHMgcmVnaW9uPSdLZXlWYWx1ZVBpcGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe1xuICBuYW1lOiAna2V5dmFsdWUnLFxuICBwdXJlOiBmYWxzZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgS2V5VmFsdWVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzKSB7fVxuXG4gIHByaXZhdGUgZGlmZmVyITogS2V5VmFsdWVEaWZmZXI8YW55LCBhbnk+O1xuICBwcml2YXRlIGtleVZhbHVlczogQXJyYXk8S2V5VmFsdWU8YW55LCBhbnk+PiA9IFtdO1xuICBwcml2YXRlIGNvbXBhcmVGbjogKGE6IEtleVZhbHVlPGFueSwgYW55PiwgYjogS2V5VmFsdWU8YW55LCBhbnk+KSA9PiBudW1iZXIgPSBkZWZhdWx0Q29tcGFyYXRvcjtcblxuICAvKlxuICAgKiBOT1RFOiB3aGVuIHRoZSBgaW5wdXRgIHZhbHVlIGlzIGEgc2ltcGxlIFJlY29yZDxLLCBWPiBvYmplY3QsIHRoZSBrZXlzIGFyZSBleHRyYWN0ZWQgd2l0aFxuICAgKiBPYmplY3Qua2V5cygpLiBUaGlzIG1lYW5zIHRoYXQgZXZlbiBpZiB0aGUgYGlucHV0YCB0eXBlIGlzIFJlY29yZDxudW1iZXIsIFY+IHRoZSBrZXlzIGFyZVxuICAgKiBjb21wYXJlZC9yZXR1cm5lZCBhcyBgc3RyaW5nYHMuXG4gICAqL1xuICB0cmFuc2Zvcm08SywgVj4oXG4gICAgaW5wdXQ6IFJlYWRvbmx5TWFwPEssIFY+LFxuICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcixcbiAgKTogQXJyYXk8S2V5VmFsdWU8SywgVj4+O1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIG51bWJlciwgVj4oXG4gICAgaW5wdXQ6IFJlY29yZDxLLCBWPixcbiAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8c3RyaW5nLCBWPiwgYjogS2V5VmFsdWU8c3RyaW5nLCBWPikgPT4gbnVtYmVyLFxuICApOiBBcnJheTxLZXlWYWx1ZTxzdHJpbmcsIFY+PjtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBzdHJpbmcsIFY+KFxuICAgIGlucHV0OiBSZWNvcmQ8SywgVj4gfCBSZWFkb25seU1hcDxLLCBWPixcbiAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIsXG4gICk6IEFycmF5PEtleVZhbHVlPEssIFY+PjtcbiAgdHJhbnNmb3JtKFxuICAgIGlucHV0OiBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTx1bmtub3duLCB1bmtub3duPiwgYjogS2V5VmFsdWU8dW5rbm93biwgdW5rbm93bj4pID0+IG51bWJlcixcbiAgKTogbnVsbDtcbiAgdHJhbnNmb3JtPEssIFY+KFxuICAgIGlucHV0OiBSZWFkb25seU1hcDxLLCBWPiB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyLFxuICApOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj4gfCBudWxsO1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIG51bWJlciwgVj4oXG4gICAgaW5wdXQ6IFJlY29yZDxLLCBWPiB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPHN0cmluZywgVj4sIGI6IEtleVZhbHVlPHN0cmluZywgVj4pID0+IG51bWJlcixcbiAgKTogQXJyYXk8S2V5VmFsdWU8c3RyaW5nLCBWPj4gfCBudWxsO1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIHN0cmluZywgVj4oXG4gICAgaW5wdXQ6IFJlY29yZDxLLCBWPiB8IFJlYWRvbmx5TWFwPEssIFY+IHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIsXG4gICk6IEFycmF5PEtleVZhbHVlPEssIFY+PiB8IG51bGw7XG4gIHRyYW5zZm9ybTxLLCBWPihcbiAgICBpbnB1dDogdW5kZWZpbmVkIHwgbnVsbCB8IHtba2V5OiBzdHJpbmddOiBWOyBba2V5OiBudW1iZXJdOiBWfSB8IFJlYWRvbmx5TWFwPEssIFY+LFxuICAgIGNvbXBhcmVGbjogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyID0gZGVmYXVsdENvbXBhcmF0b3IsXG4gICk6IEFycmF5PEtleVZhbHVlPEssIFY+PiB8IG51bGwge1xuICAgIGlmICghaW5wdXQgfHwgKCEoaW5wdXQgaW5zdGFuY2VvZiBNYXApICYmIHR5cGVvZiBpbnB1dCAhPT0gJ29iamVjdCcpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBtYWtlIGEgZGlmZmVyIGZvciB3aGF0ZXZlciB0eXBlIHdlJ3ZlIGJlZW4gcGFzc2VkIGluXG4gICAgdGhpcy5kaWZmZXIgPz89IHRoaXMuZGlmZmVycy5maW5kKGlucHV0KS5jcmVhdGUoKTtcblxuICAgIGNvbnN0IGRpZmZlckNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxLLCBWPiB8IG51bGwgPSB0aGlzLmRpZmZlci5kaWZmKGlucHV0IGFzIGFueSk7XG4gICAgY29uc3QgY29tcGFyZUZuQ2hhbmdlZCA9IGNvbXBhcmVGbiAhPT0gdGhpcy5jb21wYXJlRm47XG5cbiAgICBpZiAoZGlmZmVyQ2hhbmdlcykge1xuICAgICAgdGhpcy5rZXlWYWx1ZXMgPSBbXTtcbiAgICAgIGRpZmZlckNoYW5nZXMuZm9yRWFjaEl0ZW0oKHI6IEtleVZhbHVlQ2hhbmdlUmVjb3JkPEssIFY+KSA9PiB7XG4gICAgICAgIHRoaXMua2V5VmFsdWVzLnB1c2gobWFrZUtleVZhbHVlUGFpcihyLmtleSwgci5jdXJyZW50VmFsdWUhKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGRpZmZlckNoYW5nZXMgfHwgY29tcGFyZUZuQ2hhbmdlZCkge1xuICAgICAgdGhpcy5rZXlWYWx1ZXMuc29ydChjb21wYXJlRm4pO1xuICAgICAgdGhpcy5jb21wYXJlRm4gPSBjb21wYXJlRm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmtleVZhbHVlcztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENvbXBhcmF0b3I8SywgVj4oXG4gIGtleVZhbHVlQTogS2V5VmFsdWU8SywgVj4sXG4gIGtleVZhbHVlQjogS2V5VmFsdWU8SywgVj4sXG4pOiBudW1iZXIge1xuICBjb25zdCBhID0ga2V5VmFsdWVBLmtleTtcbiAgY29uc3QgYiA9IGtleVZhbHVlQi5rZXk7XG4gIC8vIGlmIHNhbWUgZXhpdCB3aXRoIDA7XG4gIGlmIChhID09PSBiKSByZXR1cm4gMDtcbiAgLy8gbWFrZSBzdXJlIHRoYXQgdW5kZWZpbmVkIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBzb3J0LlxuICBpZiAoYSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMTtcbiAgaWYgKGIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIC0xO1xuICAvLyBtYWtlIHN1cmUgdGhhdCBudWxscyBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgc29ydC5cbiAgaWYgKGEgPT09IG51bGwpIHJldHVybiAxO1xuICBpZiAoYiA9PT0gbnVsbCkgcmV0dXJuIC0xO1xuICBpZiAodHlwZW9mIGEgPT0gJ3N0cmluZycgJiYgdHlwZW9mIGIgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IDE7XG4gIH1cbiAgaWYgKHR5cGVvZiBhID09ICdudW1iZXInICYmIHR5cGVvZiBiID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIGEgLSBiO1xuICB9XG4gIGlmICh0eXBlb2YgYSA9PSAnYm9vbGVhbicgJiYgdHlwZW9mIGIgPT0gJ2Jvb2xlYW4nKSB7XG4gICAgcmV0dXJuIGEgPCBiID8gLTEgOiAxO1xuICB9XG4gIC8vIGBhYCBhbmQgYGJgIGFyZSBvZiBkaWZmZXJlbnQgdHlwZXMuIENvbXBhcmUgdGhlaXIgc3RyaW5nIHZhbHVlcy5cbiAgY29uc3QgYVN0cmluZyA9IFN0cmluZyhhKTtcbiAgY29uc3QgYlN0cmluZyA9IFN0cmluZyhiKTtcbiAgcmV0dXJuIGFTdHJpbmcgPT0gYlN0cmluZyA/IDAgOiBhU3RyaW5nIDwgYlN0cmluZyA/IC0xIDogMTtcbn1cbiJdfQ==