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
class KeyValuePipe {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.1+sha-6b02242", ngImport: i0, type: KeyValuePipe, deps: [{ token: i0.KeyValueDiffers }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.1.0-next.1+sha-6b02242", ngImport: i0, type: KeyValuePipe, isStandalone: true, name: "keyvalue", pure: false }); }
}
export { KeyValuePipe };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.1+sha-6b02242", ngImport: i0, type: KeyValuePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'keyvalue',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.KeyValueDiffers }]; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQXdELGVBQWUsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDOztBQUUxSCxTQUFTLGdCQUFnQixDQUFPLEdBQU0sRUFBRSxLQUFRO0lBQzlDLE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUNsQyxDQUFDO0FBYUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUthLFlBQVk7SUFDdkIsWUFBNkIsT0FBd0I7UUFBeEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFHN0MsY0FBUyxHQUE4QixFQUFFLENBQUM7UUFDMUMsY0FBUyxHQUE2RCxpQkFBaUIsQ0FBQztJQUp4QyxDQUFDO0lBaUN6RCxTQUFTLENBQ0wsS0FBNEUsRUFDNUUsWUFBOEQsaUJBQWlCO1FBRWpGLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLEdBQUcsQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxFQUFFO1lBQ3BFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQix1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNqRDtRQUVELE1BQU0sYUFBYSxHQUErQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFZLENBQUMsQ0FBQztRQUNqRixNQUFNLGdCQUFnQixHQUFHLFNBQVMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRXRELElBQUksYUFBYSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUE2QixFQUFFLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQWEsQ0FBQyxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUNELElBQUksYUFBYSxJQUFJLGdCQUFnQixFQUFFO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7eUhBN0RVLFlBQVk7dUhBQVosWUFBWTs7U0FBWixZQUFZO3NHQUFaLFlBQVk7a0JBTHhCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7QUFpRUQsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixTQUF5QixFQUFFLFNBQXlCO0lBQ3RELE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDeEIsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztJQUN4Qix1QkFBdUI7SUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RCLHVEQUF1RDtJQUN2RCxJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDL0IsbURBQW1EO0lBQ25ELElBQUksQ0FBQyxLQUFLLElBQUk7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxQixJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUU7UUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3ZCO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNkO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxFQUFFO1FBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2QjtJQUNELG1FQUFtRTtJQUNuRSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE9BQU8sT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtLZXlWYWx1ZUNoYW5nZVJlY29yZCwgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZnVuY3Rpb24gbWFrZUtleVZhbHVlUGFpcjxLLCBWPihrZXk6IEssIHZhbHVlOiBWKTogS2V5VmFsdWU8SywgVj4ge1xuICByZXR1cm4ge2tleToga2V5LCB2YWx1ZTogdmFsdWV9O1xufVxuXG4vKipcbiAqIEEga2V5IHZhbHVlIHBhaXIuXG4gKiBVc3VhbGx5IHVzZWQgdG8gcmVwcmVzZW50IHRoZSBrZXkgdmFsdWUgcGFpcnMgZnJvbSBhIE1hcCBvciBPYmplY3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEtleVZhbHVlPEssIFY+IHtcbiAga2V5OiBLO1xuICB2YWx1ZTogVjtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBUcmFuc2Zvcm1zIE9iamVjdCBvciBNYXAgaW50byBhbiBhcnJheSBvZiBrZXkgdmFsdWUgcGFpcnMuXG4gKlxuICogVGhlIG91dHB1dCBhcnJheSB3aWxsIGJlIG9yZGVyZWQgYnkga2V5cy5cbiAqIEJ5IGRlZmF1bHQgdGhlIGNvbXBhcmF0b3Igd2lsbCBiZSBieSBVbmljb2RlIHBvaW50IHZhbHVlLlxuICogWW91IGNhbiBvcHRpb25hbGx5IHBhc3MgYSBjb21wYXJlRm4gaWYgeW91ciBrZXlzIGFyZSBjb21wbGV4IHR5cGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBUaGlzIGV4YW1wbGVzIHNob3cgaG93IGFuIE9iamVjdCBvciBhIE1hcCBjYW4gYmUgaXRlcmF0ZWQgYnkgbmdGb3Igd2l0aCB0aGUgdXNlIG9mIHRoaXNcbiAqIGtleXZhbHVlIHBpcGUuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9rZXl2YWx1ZV9waXBlLnRzIHJlZ2lvbj0nS2V5VmFsdWVQaXBlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ2tleXZhbHVlJyxcbiAgcHVyZTogZmFsc2UsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIEtleVZhbHVlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRpZmZlcnM6IEtleVZhbHVlRGlmZmVycykge31cblxuICBwcml2YXRlIGRpZmZlciE6IEtleVZhbHVlRGlmZmVyPGFueSwgYW55PjtcbiAgcHJpdmF0ZSBrZXlWYWx1ZXM6IEFycmF5PEtleVZhbHVlPGFueSwgYW55Pj4gPSBbXTtcbiAgcHJpdmF0ZSBjb21wYXJlRm46IChhOiBLZXlWYWx1ZTxhbnksIGFueT4sIGI6IEtleVZhbHVlPGFueSwgYW55PikgPT4gbnVtYmVyID0gZGVmYXVsdENvbXBhcmF0b3I7XG5cbiAgLypcbiAgICogTk9URTogd2hlbiB0aGUgYGlucHV0YCB2YWx1ZSBpcyBhIHNpbXBsZSBSZWNvcmQ8SywgVj4gb2JqZWN0LCB0aGUga2V5cyBhcmUgZXh0cmFjdGVkIHdpdGhcbiAgICogT2JqZWN0LmtleXMoKS4gVGhpcyBtZWFucyB0aGF0IGV2ZW4gaWYgdGhlIGBpbnB1dGAgdHlwZSBpcyBSZWNvcmQ8bnVtYmVyLCBWPiB0aGUga2V5cyBhcmVcbiAgICogY29tcGFyZWQvcmV0dXJuZWQgYXMgYHN0cmluZ2BzLlxuICAgKi9cbiAgdHJhbnNmb3JtPEssIFY+KFxuICAgICAgaW5wdXQ6IFJlYWRvbmx5TWFwPEssIFY+LFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyKTogQXJyYXk8S2V5VmFsdWU8SywgVj4+O1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIG51bWJlciwgVj4oXG4gICAgICBpbnB1dDogUmVjb3JkPEssIFY+LCBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8c3RyaW5nLCBWPiwgYjogS2V5VmFsdWU8c3RyaW5nLCBWPikgPT4gbnVtYmVyKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPHN0cmluZywgVj4+O1xuICB0cmFuc2Zvcm08SyBleHRlbmRzIHN0cmluZywgVj4oXG4gICAgICBpbnB1dDogUmVjb3JkPEssIFY+fFJlYWRvbmx5TWFwPEssIFY+LFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyKTogQXJyYXk8S2V5VmFsdWU8SywgVj4+O1xuICB0cmFuc2Zvcm0oXG4gICAgICBpbnB1dDogbnVsbHx1bmRlZmluZWQsXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8dW5rbm93biwgdW5rbm93bj4sIGI6IEtleVZhbHVlPHVua25vd24sIHVua25vd24+KSA9PiBudW1iZXIpOiBudWxsO1xuICB0cmFuc2Zvcm08SywgVj4oXG4gICAgICBpbnB1dDogUmVhZG9ubHlNYXA8SywgVj58bnVsbHx1bmRlZmluZWQsXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIpOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj58bnVsbDtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBudW1iZXIsIFY+KFxuICAgICAgaW5wdXQ6IFJlY29yZDxLLCBWPnxudWxsfHVuZGVmaW5lZCxcbiAgICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxzdHJpbmcsIFY+LCBiOiBLZXlWYWx1ZTxzdHJpbmcsIFY+KSA9PiBudW1iZXIpOlxuICAgICAgQXJyYXk8S2V5VmFsdWU8c3RyaW5nLCBWPj58bnVsbDtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBzdHJpbmcsIFY+KFxuICAgICAgaW5wdXQ6IFJlY29yZDxLLCBWPnxSZWFkb25seU1hcDxLLCBWPnxudWxsfHVuZGVmaW5lZCxcbiAgICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcik6IEFycmF5PEtleVZhbHVlPEssIFY+PnxudWxsO1xuICB0cmFuc2Zvcm08SywgVj4oXG4gICAgICBpbnB1dDogdW5kZWZpbmVkfG51bGx8e1trZXk6IHN0cmluZ106IFYsIFtrZXk6IG51bWJlcl06IFZ9fFJlYWRvbmx5TWFwPEssIFY+LFxuICAgICAgY29tcGFyZUZuOiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIgPSBkZWZhdWx0Q29tcGFyYXRvcik6XG4gICAgICBBcnJheTxLZXlWYWx1ZTxLLCBWPj58bnVsbCB7XG4gICAgaWYgKCFpbnB1dCB8fCAoIShpbnB1dCBpbnN0YW5jZW9mIE1hcCkgJiYgdHlwZW9mIGlucHV0ICE9PSAnb2JqZWN0JykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5kaWZmZXIpIHtcbiAgICAgIC8vIG1ha2UgYSBkaWZmZXIgZm9yIHdoYXRldmVyIHR5cGUgd2UndmUgYmVlbiBwYXNzZWQgaW5cbiAgICAgIHRoaXMuZGlmZmVyID0gdGhpcy5kaWZmZXJzLmZpbmQoaW5wdXQpLmNyZWF0ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGRpZmZlckNoYW5nZXM6IEtleVZhbHVlQ2hhbmdlczxLLCBWPnxudWxsID0gdGhpcy5kaWZmZXIuZGlmZihpbnB1dCBhcyBhbnkpO1xuICAgIGNvbnN0IGNvbXBhcmVGbkNoYW5nZWQgPSBjb21wYXJlRm4gIT09IHRoaXMuY29tcGFyZUZuO1xuXG4gICAgaWYgKGRpZmZlckNoYW5nZXMpIHtcbiAgICAgIHRoaXMua2V5VmFsdWVzID0gW107XG4gICAgICBkaWZmZXJDaGFuZ2VzLmZvckVhY2hJdGVtKChyOiBLZXlWYWx1ZUNoYW5nZVJlY29yZDxLLCBWPikgPT4ge1xuICAgICAgICB0aGlzLmtleVZhbHVlcy5wdXNoKG1ha2VLZXlWYWx1ZVBhaXIoci5rZXksIHIuY3VycmVudFZhbHVlISkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkaWZmZXJDaGFuZ2VzIHx8IGNvbXBhcmVGbkNoYW5nZWQpIHtcbiAgICAgIHRoaXMua2V5VmFsdWVzLnNvcnQoY29tcGFyZUZuKTtcbiAgICAgIHRoaXMuY29tcGFyZUZuID0gY29tcGFyZUZuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5rZXlWYWx1ZXM7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDb21wYXJhdG9yPEssIFY+KFxuICAgIGtleVZhbHVlQTogS2V5VmFsdWU8SywgVj4sIGtleVZhbHVlQjogS2V5VmFsdWU8SywgVj4pOiBudW1iZXIge1xuICBjb25zdCBhID0ga2V5VmFsdWVBLmtleTtcbiAgY29uc3QgYiA9IGtleVZhbHVlQi5rZXk7XG4gIC8vIGlmIHNhbWUgZXhpdCB3aXRoIDA7XG4gIGlmIChhID09PSBiKSByZXR1cm4gMDtcbiAgLy8gbWFrZSBzdXJlIHRoYXQgdW5kZWZpbmVkIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBzb3J0LlxuICBpZiAoYSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMTtcbiAgaWYgKGIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIC0xO1xuICAvLyBtYWtlIHN1cmUgdGhhdCBudWxscyBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgc29ydC5cbiAgaWYgKGEgPT09IG51bGwpIHJldHVybiAxO1xuICBpZiAoYiA9PT0gbnVsbCkgcmV0dXJuIC0xO1xuICBpZiAodHlwZW9mIGEgPT0gJ3N0cmluZycgJiYgdHlwZW9mIGIgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IDE7XG4gIH1cbiAgaWYgKHR5cGVvZiBhID09ICdudW1iZXInICYmIHR5cGVvZiBiID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIGEgLSBiO1xuICB9XG4gIGlmICh0eXBlb2YgYSA9PSAnYm9vbGVhbicgJiYgdHlwZW9mIGIgPT0gJ2Jvb2xlYW4nKSB7XG4gICAgcmV0dXJuIGEgPCBiID8gLTEgOiAxO1xuICB9XG4gIC8vIGBhYCBhbmQgYGJgIGFyZSBvZiBkaWZmZXJlbnQgdHlwZXMuIENvbXBhcmUgdGhlaXIgc3RyaW5nIHZhbHVlcy5cbiAgY29uc3QgYVN0cmluZyA9IFN0cmluZyhhKTtcbiAgY29uc3QgYlN0cmluZyA9IFN0cmluZyhiKTtcbiAgcmV0dXJuIGFTdHJpbmcgPT0gYlN0cmluZyA/IDAgOiBhU3RyaW5nIDwgYlN0cmluZyA/IC0xIDogMTtcbn1cbiJdfQ==