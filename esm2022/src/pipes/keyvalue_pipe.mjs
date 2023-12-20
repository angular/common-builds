/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { KeyValueDiffers, Pipe } from '@angular/core';
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
        if (!this.differ) {
            // make a differ for whatever type we've been passed in
            this.differ = this.differs.find(input).create();
        }
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.4+sha-cc74ebf", ngImport: i0, type: KeyValuePipe, deps: [{ token: i0.KeyValueDiffers }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.1.0-next.4+sha-cc74ebf", ngImport: i0, type: KeyValuePipe, isStandalone: true, name: "keyvalue", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.4+sha-cc74ebf", ngImport: i0, type: KeyValuePipe, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQXdELGVBQWUsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDOztBQUUxSCxTQUFTLGdCQUFnQixDQUFPLEdBQU0sRUFBRSxLQUFRO0lBQzlDLE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUNsQyxDQUFDO0FBYUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFNSCxNQUFNLE9BQU8sWUFBWTtJQUN2QixZQUE2QixPQUF3QjtRQUF4QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUc3QyxjQUFTLEdBQThCLEVBQUUsQ0FBQztRQUMxQyxjQUFTLEdBQTZELGlCQUFpQixDQUFDO0lBSnhDLENBQUM7SUFpQ3pELFNBQVMsQ0FDTCxLQUE0RSxFQUM1RSxZQUE4RCxpQkFBaUI7UUFFakYsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFlBQVksR0FBRyxDQUFDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNyRSxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pCLHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xELENBQUM7UUFFRCxNQUFNLGFBQWEsR0FBK0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBWSxDQUFDLENBQUM7UUFDakYsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUV0RCxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUE2QixFQUFFLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQWEsQ0FBQyxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxhQUFhLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUM3QixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7eUhBN0RVLFlBQVk7dUhBQVosWUFBWTs7c0dBQVosWUFBWTtrQkFMeEIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsVUFBVTtvQkFDaEIsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOztBQWlFRCxNQUFNLFVBQVUsaUJBQWlCLENBQzdCLFNBQXlCLEVBQUUsU0FBeUI7SUFDdEQsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztJQUN4QixNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3hCLHVCQUF1QjtJQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEIsdURBQXVEO0lBQ3ZELElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMvQixtREFBbUQ7SUFDbkQsSUFBSSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQyxLQUFLLElBQUk7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzFCLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFLENBQUM7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUNELElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsbUVBQW1FO0lBQ25FLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsT0FBTyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0tleVZhbHVlQ2hhbmdlUmVjb3JkLCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlcnMsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5mdW5jdGlvbiBtYWtlS2V5VmFsdWVQYWlyPEssIFY+KGtleTogSywgdmFsdWU6IFYpOiBLZXlWYWx1ZTxLLCBWPiB7XG4gIHJldHVybiB7a2V5OiBrZXksIHZhbHVlOiB2YWx1ZX07XG59XG5cbi8qKlxuICogQSBrZXkgdmFsdWUgcGFpci5cbiAqIFVzdWFsbHkgdXNlZCB0byByZXByZXNlbnQgdGhlIGtleSB2YWx1ZSBwYWlycyBmcm9tIGEgTWFwIG9yIE9iamVjdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5VmFsdWU8SywgVj4ge1xuICBrZXk6IEs7XG4gIHZhbHVlOiBWO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFRyYW5zZm9ybXMgT2JqZWN0IG9yIE1hcCBpbnRvIGFuIGFycmF5IG9mIGtleSB2YWx1ZSBwYWlycy5cbiAqXG4gKiBUaGUgb3V0cHV0IGFycmF5IHdpbGwgYmUgb3JkZXJlZCBieSBrZXlzLlxuICogQnkgZGVmYXVsdCB0aGUgY29tcGFyYXRvciB3aWxsIGJlIGJ5IFVuaWNvZGUgcG9pbnQgdmFsdWUuXG4gKiBZb3UgY2FuIG9wdGlvbmFsbHkgcGFzcyBhIGNvbXBhcmVGbiBpZiB5b3VyIGtleXMgYXJlIGNvbXBsZXggdHlwZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIFRoaXMgZXhhbXBsZXMgc2hvdyBob3cgYW4gT2JqZWN0IG9yIGEgTWFwIGNhbiBiZSBpdGVyYXRlZCBieSBuZ0ZvciB3aXRoIHRoZSB1c2Ugb2YgdGhpc1xuICoga2V5dmFsdWUgcGlwZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2tleXZhbHVlX3BpcGUudHMgcmVnaW9uPSdLZXlWYWx1ZVBpcGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe1xuICBuYW1lOiAna2V5dmFsdWUnLFxuICBwdXJlOiBmYWxzZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgS2V5VmFsdWVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzKSB7fVxuXG4gIHByaXZhdGUgZGlmZmVyITogS2V5VmFsdWVEaWZmZXI8YW55LCBhbnk+O1xuICBwcml2YXRlIGtleVZhbHVlczogQXJyYXk8S2V5VmFsdWU8YW55LCBhbnk+PiA9IFtdO1xuICBwcml2YXRlIGNvbXBhcmVGbjogKGE6IEtleVZhbHVlPGFueSwgYW55PiwgYjogS2V5VmFsdWU8YW55LCBhbnk+KSA9PiBudW1iZXIgPSBkZWZhdWx0Q29tcGFyYXRvcjtcblxuICAvKlxuICAgKiBOT1RFOiB3aGVuIHRoZSBgaW5wdXRgIHZhbHVlIGlzIGEgc2ltcGxlIFJlY29yZDxLLCBWPiBvYmplY3QsIHRoZSBrZXlzIGFyZSBleHRyYWN0ZWQgd2l0aFxuICAgKiBPYmplY3Qua2V5cygpLiBUaGlzIG1lYW5zIHRoYXQgZXZlbiBpZiB0aGUgYGlucHV0YCB0eXBlIGlzIFJlY29yZDxudW1iZXIsIFY+IHRoZSBrZXlzIGFyZVxuICAgKiBjb21wYXJlZC9yZXR1cm5lZCBhcyBgc3RyaW5nYHMuXG4gICAqL1xuICB0cmFuc2Zvcm08SywgVj4oXG4gICAgICBpbnB1dDogUmVhZG9ubHlNYXA8SywgVj4sXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIpOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj47XG4gIHRyYW5zZm9ybTxLIGV4dGVuZHMgbnVtYmVyLCBWPihcbiAgICAgIGlucHV0OiBSZWNvcmQ8SywgVj4sIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxzdHJpbmcsIFY+LCBiOiBLZXlWYWx1ZTxzdHJpbmcsIFY+KSA9PiBudW1iZXIpOlxuICAgICAgQXJyYXk8S2V5VmFsdWU8c3RyaW5nLCBWPj47XG4gIHRyYW5zZm9ybTxLIGV4dGVuZHMgc3RyaW5nLCBWPihcbiAgICAgIGlucHV0OiBSZWNvcmQ8SywgVj58UmVhZG9ubHlNYXA8SywgVj4sXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIpOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj47XG4gIHRyYW5zZm9ybShcbiAgICAgIGlucHV0OiBudWxsfHVuZGVmaW5lZCxcbiAgICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTx1bmtub3duLCB1bmtub3duPiwgYjogS2V5VmFsdWU8dW5rbm93biwgdW5rbm93bj4pID0+IG51bWJlcik6IG51bGw7XG4gIHRyYW5zZm9ybTxLLCBWPihcbiAgICAgIGlucHV0OiBSZWFkb25seU1hcDxLLCBWPnxudWxsfHVuZGVmaW5lZCxcbiAgICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcik6IEFycmF5PEtleVZhbHVlPEssIFY+PnxudWxsO1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIG51bWJlciwgVj4oXG4gICAgICBpbnB1dDogUmVjb3JkPEssIFY+fG51bGx8dW5kZWZpbmVkLFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPHN0cmluZywgVj4sIGI6IEtleVZhbHVlPHN0cmluZywgVj4pID0+IG51bWJlcik6XG4gICAgICBBcnJheTxLZXlWYWx1ZTxzdHJpbmcsIFY+PnxudWxsO1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIHN0cmluZywgVj4oXG4gICAgICBpbnB1dDogUmVjb3JkPEssIFY+fFJlYWRvbmx5TWFwPEssIFY+fG51bGx8dW5kZWZpbmVkLFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyKTogQXJyYXk8S2V5VmFsdWU8SywgVj4+fG51bGw7XG4gIHRyYW5zZm9ybTxLLCBWPihcbiAgICAgIGlucHV0OiB1bmRlZmluZWR8bnVsbHx7W2tleTogc3RyaW5nXTogViwgW2tleTogbnVtYmVyXTogVn18UmVhZG9ubHlNYXA8SywgVj4sXG4gICAgICBjb21wYXJlRm46IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlciA9IGRlZmF1bHRDb21wYXJhdG9yKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPEssIFY+PnxudWxsIHtcbiAgICBpZiAoIWlucHV0IHx8ICghKGlucHV0IGluc3RhbmNlb2YgTWFwKSAmJiB0eXBlb2YgaW5wdXQgIT09ICdvYmplY3QnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmRpZmZlcikge1xuICAgICAgLy8gbWFrZSBhIGRpZmZlciBmb3Igd2hhdGV2ZXIgdHlwZSB3ZSd2ZSBiZWVuIHBhc3NlZCBpblxuICAgICAgdGhpcy5kaWZmZXIgPSB0aGlzLmRpZmZlcnMuZmluZChpbnB1dCkuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlmZmVyQ2hhbmdlczogS2V5VmFsdWVDaGFuZ2VzPEssIFY+fG51bGwgPSB0aGlzLmRpZmZlci5kaWZmKGlucHV0IGFzIGFueSk7XG4gICAgY29uc3QgY29tcGFyZUZuQ2hhbmdlZCA9IGNvbXBhcmVGbiAhPT0gdGhpcy5jb21wYXJlRm47XG5cbiAgICBpZiAoZGlmZmVyQ2hhbmdlcykge1xuICAgICAgdGhpcy5rZXlWYWx1ZXMgPSBbXTtcbiAgICAgIGRpZmZlckNoYW5nZXMuZm9yRWFjaEl0ZW0oKHI6IEtleVZhbHVlQ2hhbmdlUmVjb3JkPEssIFY+KSA9PiB7XG4gICAgICAgIHRoaXMua2V5VmFsdWVzLnB1c2gobWFrZUtleVZhbHVlUGFpcihyLmtleSwgci5jdXJyZW50VmFsdWUhKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGRpZmZlckNoYW5nZXMgfHwgY29tcGFyZUZuQ2hhbmdlZCkge1xuICAgICAgdGhpcy5rZXlWYWx1ZXMuc29ydChjb21wYXJlRm4pO1xuICAgICAgdGhpcy5jb21wYXJlRm4gPSBjb21wYXJlRm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmtleVZhbHVlcztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENvbXBhcmF0b3I8SywgVj4oXG4gICAga2V5VmFsdWVBOiBLZXlWYWx1ZTxLLCBWPiwga2V5VmFsdWVCOiBLZXlWYWx1ZTxLLCBWPik6IG51bWJlciB7XG4gIGNvbnN0IGEgPSBrZXlWYWx1ZUEua2V5O1xuICBjb25zdCBiID0ga2V5VmFsdWVCLmtleTtcbiAgLy8gaWYgc2FtZSBleGl0IHdpdGggMDtcbiAgaWYgKGEgPT09IGIpIHJldHVybiAwO1xuICAvLyBtYWtlIHN1cmUgdGhhdCB1bmRlZmluZWQgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNvcnQuXG4gIGlmIChhID09PSB1bmRlZmluZWQpIHJldHVybiAxO1xuICBpZiAoYiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gLTE7XG4gIC8vIG1ha2Ugc3VyZSB0aGF0IG51bGxzIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBzb3J0LlxuICBpZiAoYSA9PT0gbnVsbCkgcmV0dXJuIDE7XG4gIGlmIChiID09PSBudWxsKSByZXR1cm4gLTE7XG4gIGlmICh0eXBlb2YgYSA9PSAnc3RyaW5nJyAmJiB0eXBlb2YgYiA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfVxuICBpZiAodHlwZW9mIGEgPT0gJ251bWJlcicgJiYgdHlwZW9mIGIgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gYSAtIGI7XG4gIH1cbiAgaWYgKHR5cGVvZiBhID09ICdib29sZWFuJyAmJiB0eXBlb2YgYiA9PSAnYm9vbGVhbicpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IDE7XG4gIH1cbiAgLy8gYGFgIGFuZCBgYmAgYXJlIG9mIGRpZmZlcmVudCB0eXBlcy4gQ29tcGFyZSB0aGVpciBzdHJpbmcgdmFsdWVzLlxuICBjb25zdCBhU3RyaW5nID0gU3RyaW5nKGEpO1xuICBjb25zdCBiU3RyaW5nID0gU3RyaW5nKGIpO1xuICByZXR1cm4gYVN0cmluZyA9PSBiU3RyaW5nID8gMCA6IGFTdHJpbmcgPCBiU3RyaW5nID8gLTEgOiAxO1xufVxuIl19