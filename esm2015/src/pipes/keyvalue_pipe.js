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
}
KeyValuePipe.ɵfac = function KeyValuePipe_Factory(t) { return new (t || KeyValuePipe)(i0.ɵɵdirectiveInject(i0.KeyValueDiffers, 16)); };
KeyValuePipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "keyvalue", type: KeyValuePipe, pure: false });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(KeyValuePipe, [{
        type: Pipe,
        args: [{ name: 'keyvalue', pure: false }]
    }], function () { return [{ type: i0.KeyValueDiffers }]; }, null); })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQXdELGVBQWUsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDOztBQUUxSCxTQUFTLGdCQUFnQixDQUFPLEdBQU0sRUFBRSxLQUFRO0lBQzlDLE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUNsQyxDQUFDO0FBYUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFFSCxNQUFNLE9BQU8sWUFBWTtJQUN2QixZQUE2QixPQUF3QjtRQUF4QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUc3QyxjQUFTLEdBQThCLEVBQUUsQ0FBQztRQUMxQyxjQUFTLEdBQTZELGlCQUFpQixDQUFDO0lBSnhDLENBQUM7SUFpQ3pELFNBQVMsQ0FDTCxLQUE0RSxFQUM1RSxZQUE4RCxpQkFBaUI7UUFFakYsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFlBQVksR0FBRyxDQUFDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLEVBQUU7WUFDcEUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pEO1FBRUQsTUFBTSxhQUFhLEdBQStCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQVksQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFdEQsSUFBSSxhQUFhLEVBQUU7WUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQTZCLEVBQUUsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsWUFBYSxDQUFDLENBQUMsQ0FBQztZQUNoRSxDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsSUFBSSxhQUFhLElBQUksZ0JBQWdCLEVBQUU7WUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDNUI7UUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQzs7d0VBN0RVLFlBQVk7NkVBQVosWUFBWTt1RkFBWixZQUFZO2NBRHhCLElBQUk7ZUFBQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQzs7QUFpRXJDLE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsU0FBeUIsRUFBRSxTQUF5QjtJQUN0RCxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDeEIsdUJBQXVCO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0Qix1REFBdUQ7SUFDdkQsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9CLG1EQUFtRDtJQUNuRCxJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2QjtJQUNELElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRTtRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDZDtJQUNELElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLFNBQVMsRUFBRTtRQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkI7SUFDRCxtRUFBbUU7SUFDbkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7S2V5VmFsdWVDaGFuZ2VSZWNvcmQsIEtleVZhbHVlQ2hhbmdlcywgS2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVycywgUGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmZ1bmN0aW9uIG1ha2VLZXlWYWx1ZVBhaXI8SywgVj4oa2V5OiBLLCB2YWx1ZTogVik6IEtleVZhbHVlPEssIFY+IHtcbiAgcmV0dXJuIHtrZXk6IGtleSwgdmFsdWU6IHZhbHVlfTtcbn1cblxuLyoqXG4gKiBBIGtleSB2YWx1ZSBwYWlyLlxuICogVXN1YWxseSB1c2VkIHRvIHJlcHJlc2VudCB0aGUga2V5IHZhbHVlIHBhaXJzIGZyb20gYSBNYXAgb3IgT2JqZWN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBLZXlWYWx1ZTxLLCBWPiB7XG4gIGtleTogSztcbiAgdmFsdWU6IFY7XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVHJhbnNmb3JtcyBPYmplY3Qgb3IgTWFwIGludG8gYW4gYXJyYXkgb2Yga2V5IHZhbHVlIHBhaXJzLlxuICpcbiAqIFRoZSBvdXRwdXQgYXJyYXkgd2lsbCBiZSBvcmRlcmVkIGJ5IGtleXMuXG4gKiBCeSBkZWZhdWx0IHRoZSBjb21wYXJhdG9yIHdpbGwgYmUgYnkgVW5pY29kZSBwb2ludCB2YWx1ZS5cbiAqIFlvdSBjYW4gb3B0aW9uYWxseSBwYXNzIGEgY29tcGFyZUZuIGlmIHlvdXIga2V5cyBhcmUgY29tcGxleCB0eXBlcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogVGhpcyBleGFtcGxlcyBzaG93IGhvdyBhbiBPYmplY3Qgb3IgYSBNYXAgY2FuIGJlIGl0ZXJhdGVkIGJ5IG5nRm9yIHdpdGggdGhlIHVzZSBvZiB0aGlzXG4gKiBrZXl2YWx1ZSBwaXBlLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMva2V5dmFsdWVfcGlwZS50cyByZWdpb249J0tleVZhbHVlUGlwZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2tleXZhbHVlJywgcHVyZTogZmFsc2V9KVxuZXhwb3J0IGNsYXNzIEtleVZhbHVlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRpZmZlcnM6IEtleVZhbHVlRGlmZmVycykge31cblxuICBwcml2YXRlIGRpZmZlciE6IEtleVZhbHVlRGlmZmVyPGFueSwgYW55PjtcbiAgcHJpdmF0ZSBrZXlWYWx1ZXM6IEFycmF5PEtleVZhbHVlPGFueSwgYW55Pj4gPSBbXTtcbiAgcHJpdmF0ZSBjb21wYXJlRm46IChhOiBLZXlWYWx1ZTxhbnksIGFueT4sIGI6IEtleVZhbHVlPGFueSwgYW55PikgPT4gbnVtYmVyID0gZGVmYXVsdENvbXBhcmF0b3I7XG5cbiAgLypcbiAgICogTk9URTogd2hlbiB0aGUgYGlucHV0YCB2YWx1ZSBpcyBhIHNpbXBsZSBSZWNvcmQ8SywgVj4gb2JqZWN0LCB0aGUga2V5cyBhcmUgZXh0cmFjdGVkIHdpdGhcbiAgICogT2JqZWN0LmtleXMoKS4gVGhpcyBtZWFucyB0aGF0IGV2ZW4gaWYgdGhlIGBpbnB1dGAgdHlwZSBpcyBSZWNvcmQ8bnVtYmVyLCBWPiB0aGUga2V5cyBhcmVcbiAgICogY29tcGFyZWQvcmV0dXJuZWQgYXMgYHN0cmluZ2BzLlxuICAgKi9cbiAgdHJhbnNmb3JtPEssIFY+KFxuICAgICAgaW5wdXQ6IFJlYWRvbmx5TWFwPEssIFY+LFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyKTogQXJyYXk8S2V5VmFsdWU8SywgVj4+O1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIG51bWJlciwgVj4oXG4gICAgICBpbnB1dDogUmVjb3JkPEssIFY+LCBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8c3RyaW5nLCBWPiwgYjogS2V5VmFsdWU8c3RyaW5nLCBWPikgPT4gbnVtYmVyKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPHN0cmluZywgVj4+O1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIHN0cmluZywgVj4oXG4gICAgICBpbnB1dDogUmVjb3JkPEssIFY+fFJlYWRvbmx5TWFwPEssIFY+LFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyKTogQXJyYXk8S2V5VmFsdWU8SywgVj4+O1xuICB0cmFuc2Zvcm0oXG4gICAgICBpbnB1dDogbnVsbHx1bmRlZmluZWQsXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8dW5rbm93biwgdW5rbm93bj4sIGI6IEtleVZhbHVlPHVua25vd24sIHVua25vd24+KSA9PiBudW1iZXIpOiBudWxsO1xuICB0cmFuc2Zvcm08SywgVj4oXG4gICAgICBpbnB1dDogUmVhZG9ubHlNYXA8SywgVj58bnVsbHx1bmRlZmluZWQsXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIpOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj58bnVsbDtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBudW1iZXIsIFY+KFxuICAgICAgaW5wdXQ6IFJlY29yZDxLLCBWPnxudWxsfHVuZGVmaW5lZCxcbiAgICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxzdHJpbmcsIFY+LCBiOiBLZXlWYWx1ZTxzdHJpbmcsIFY+KSA9PiBudW1iZXIpOlxuICAgICAgQXJyYXk8S2V5VmFsdWU8c3RyaW5nLCBWPj58bnVsbDtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBzdHJpbmcsIFY+KFxuICAgICAgaW5wdXQ6IFJlY29yZDxLLCBWPnxSZWFkb25seU1hcDxLLCBWPnxudWxsfHVuZGVmaW5lZCxcbiAgICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcik6IEFycmF5PEtleVZhbHVlPEssIFY+PnxudWxsO1xuICB0cmFuc2Zvcm08SywgVj4oXG4gICAgICBpbnB1dDogdW5kZWZpbmVkfG51bGx8e1trZXk6IHN0cmluZ106IFYsIFtrZXk6IG51bWJlcl06IFZ9fFJlYWRvbmx5TWFwPEssIFY+LFxuICAgICAgY29tcGFyZUZuOiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIgPSBkZWZhdWx0Q29tcGFyYXRvcik6XG4gICAgICBBcnJheTxLZXlWYWx1ZTxLLCBWPj58bnVsbCB7XG4gICAgaWYgKCFpbnB1dCB8fCAoIShpbnB1dCBpbnN0YW5jZW9mIE1hcCkgJiYgdHlwZW9mIGlucHV0ICE9PSAnb2JqZWN0JykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5kaWZmZXIpIHtcbiAgICAgIC8vIG1ha2UgYSBkaWZmZXIgZm9yIHdoYXRldmVyIHR5cGUgd2UndmUgYmVlbiBwYXNzZWQgaW5cbiAgICAgIHRoaXMuZGlmZmVyID0gdGhpcy5kaWZmZXJzLmZpbmQoaW5wdXQpLmNyZWF0ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGRpZmZlckNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxLLCBWPnxudWxsID0gdGhpcy5kaWZmZXIuZGlmZihpbnB1dCBhcyBhbnkpO1xuICAgIGNvbnN0IGNvbXBhcmVGbkNoYW5nZWQgPSBjb21wYXJlRm4gIT09IHRoaXMuY29tcGFyZUZuO1xuXG4gICAgaWYgKGRpZmZlckNoYW5nZXMpIHtcbiAgICAgIHRoaXMua2V5VmFsdWVzID0gW107XG4gICAgICBkaWZmZXJDaGFuZ2VzLmZvckVhY2hJdGVtKChyOiBLZXlWYWx1ZUNoYW5nZVJlY29yZDxLLCBWPikgPT4ge1xuICAgICAgICB0aGlzLmtleVZhbHVlcy5wdXNoKG1ha2VLZXlWYWx1ZVBhaXIoci5rZXksIHIuY3VycmVudFZhbHVlISkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkaWZmZXJDaGFuZ2VzIHx8IGNvbXBhcmVGbkNoYW5nZWQpIHtcbiAgICAgIHRoaXMua2V5VmFsdWVzLnNvcnQoY29tcGFyZUZuKTtcbiAgICAgIHRoaXMuY29tcGFyZUZuID0gY29tcGFyZUZuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5rZXlWYWx1ZXM7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDb21wYXJhdG9yPEssIFY+KFxuICAgIGtleVZhbHVlQTogS2V5VmFsdWU8SywgVj4sIGtleVZhbHVlQjogS2V5VmFsdWU8SywgVj4pOiBudW1iZXIge1xuICBjb25zdCBhID0ga2V5VmFsdWVBLmtleTtcbiAgY29uc3QgYiA9IGtleVZhbHVlQi5rZXk7XG4gIC8vIGlmIHNhbWUgZXhpdCB3aXRoIDA7XG4gIGlmIChhID09PSBiKSByZXR1cm4gMDtcbiAgLy8gbWFrZSBzdXJlIHRoYXQgdW5kZWZpbmVkIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBzb3J0LlxuICBpZiAoYSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMTtcbiAgaWYgKGIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIC0xO1xuICAvLyBtYWtlIHN1cmUgdGhhdCBudWxscyBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgc29ydC5cbiAgaWYgKGEgPT09IG51bGwpIHJldHVybiAxO1xuICBpZiAoYiA9PT0gbnVsbCkgcmV0dXJuIC0xO1xuICBpZiAodHlwZW9mIGEgPT0gJ3N0cmluZycgJiYgdHlwZW9mIGIgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IDE7XG4gIH1cbiAgaWYgKHR5cGVvZiBhID09ICdudW1iZXInICYmIHR5cGVvZiBiID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIGEgLSBiO1xuICB9XG4gIGlmICh0eXBlb2YgYSA9PSAnYm9vbGVhbicgJiYgdHlwZW9mIGIgPT0gJ2Jvb2xlYW4nKSB7XG4gICAgcmV0dXJuIGEgPCBiID8gLTEgOiAxO1xuICB9XG4gIC8vIGBhYCBhbmQgYGJgIGFyZSBvZiBkaWZmZXJlbnQgdHlwZXMuIENvbXBhcmUgdGhlaXIgc3RyaW5nIHZhbHVlcy5cbiAgY29uc3QgYVN0cmluZyA9IFN0cmluZyhhKTtcbiAgY29uc3QgYlN0cmluZyA9IFN0cmluZyhiKTtcbiAgcmV0dXJuIGFTdHJpbmcgPT0gYlN0cmluZyA/IDAgOiBhU3RyaW5nIDwgYlN0cmluZyA/IC0xIDogMTtcbn1cbiJdfQ==