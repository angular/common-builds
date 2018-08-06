import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { KeyValueDiffers, Pipe } from '@angular/core';
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
 * ## Examples
 *
 * This examples show how an Object or a Map and be iterated by ngFor with the use of this keyvalue
 * pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 */
export class KeyValuePipe {
    constructor(differs) {
        this.differs = differs;
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
        if (differChanges) {
            this.keyValues = [];
            differChanges.forEachItem((r) => {
                this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
            });
            this.keyValues.sort(compareFn);
        }
        return this.keyValues;
    }
}
KeyValuePipe.ngPipeDef = i0.ɵdefinePipe({ name: "keyvalue", type: KeyValuePipe, factory: function KeyValuePipe_Factory() { return new KeyValuePipe(i0.ɵdirectiveInject(KeyValueDiffers)); }, pure: false });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUF3RCxlQUFlLEVBQUUsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUUxSCwwQkFBZ0MsR0FBTSxFQUFFLEtBQVE7SUFDOUMsT0FBTyxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDO0FBQ2xDLENBQUM7QUFXRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUVILE1BQU07SUFDSixZQUE2QixPQUF3QjtRQUF4QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtJQUFHLENBQUM7SUFrQnpELFNBQVMsQ0FDTCxLQUEwRCxFQUMxRCxZQUE4RCxpQkFBaUI7UUFFakYsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFlBQVksR0FBRyxDQUFDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLEVBQUU7WUFDcEUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pEO1FBRUQsTUFBTSxhQUFhLEdBQStCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQVksQ0FBQyxDQUFDO1FBRWpGLElBQUksYUFBYSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUE2QixFQUFFLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQWMsQ0FBQyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNoQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDOztrRUExQ1UsWUFBWSx3REFBWixZQUFZLHFCQUNlLGVBQWU7QUE0Q3ZELE1BQU0sNEJBQ0YsU0FBeUIsRUFBRSxTQUF5QjtJQUN0RCxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDeEIsdUJBQXVCO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0Qix1REFBdUQ7SUFDdkQsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9CLG1EQUFtRDtJQUNuRCxJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2QjtJQUNELElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRTtRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDZDtJQUNELElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLFNBQVMsRUFBRTtRQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkI7SUFDRCxtRUFBbUU7SUFDbkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0tleVZhbHVlQ2hhbmdlUmVjb3JkLCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlcnMsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5mdW5jdGlvbiBtYWtlS2V5VmFsdWVQYWlyPEssIFY+KGtleTogSywgdmFsdWU6IFYpOiBLZXlWYWx1ZTxLLCBWPiB7XG4gIHJldHVybiB7a2V5OiBrZXksIHZhbHVlOiB2YWx1ZX07XG59XG5cbi8qKlxuICogQSBrZXkgdmFsdWUgcGFpci5cbiAqIFVzdWFsbHkgdXNlZCB0byByZXByZXNlbnQgdGhlIGtleSB2YWx1ZSBwYWlycyBmcm9tIGEgTWFwIG9yIE9iamVjdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBLZXlWYWx1ZTxLLCBWPiB7XG4gIGtleTogSztcbiAgdmFsdWU6IFY7XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVHJhbnNmb3JtcyBPYmplY3Qgb3IgTWFwIGludG8gYW4gYXJyYXkgb2Yga2V5IHZhbHVlIHBhaXJzLlxuICpcbiAqIFRoZSBvdXRwdXQgYXJyYXkgd2lsbCBiZSBvcmRlcmVkIGJ5IGtleXMuXG4gKiBCeSBkZWZhdWx0IHRoZSBjb21wYXJhdG9yIHdpbGwgYmUgYnkgVW5pY29kZSBwb2ludCB2YWx1ZS5cbiAqIFlvdSBjYW4gb3B0aW9uYWxseSBwYXNzIGEgY29tcGFyZUZuIGlmIHlvdXIga2V5cyBhcmUgY29tcGxleCB0eXBlcy5cbiAqXG4gKiAjIyBFeGFtcGxlc1xuICpcbiAqIFRoaXMgZXhhbXBsZXMgc2hvdyBob3cgYW4gT2JqZWN0IG9yIGEgTWFwIGFuZCBiZSBpdGVyYXRlZCBieSBuZ0ZvciB3aXRoIHRoZSB1c2Ugb2YgdGhpcyBrZXl2YWx1ZVxuICogcGlwZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2tleXZhbHVlX3BpcGUudHMgcmVnaW9uPSdLZXlWYWx1ZVBpcGUnfVxuICovXG5AUGlwZSh7bmFtZTogJ2tleXZhbHVlJywgcHVyZTogZmFsc2V9KVxuZXhwb3J0IGNsYXNzIEtleVZhbHVlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRpZmZlcnM6IEtleVZhbHVlRGlmZmVycykge31cblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBkaWZmZXIgITogS2V5VmFsdWVEaWZmZXI8YW55LCBhbnk+O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBrZXlWYWx1ZXMgITogQXJyYXk8S2V5VmFsdWU8YW55LCBhbnk+PjtcblxuICB0cmFuc2Zvcm08SywgVj4oaW5wdXQ6IG51bGwsIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcik6IG51bGw7XG4gIHRyYW5zZm9ybTxWPihcbiAgICAgIGlucHV0OiB7W2tleTogc3RyaW5nXTogVn18TWFwPHN0cmluZywgVj4sXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8c3RyaW5nLCBWPiwgYjogS2V5VmFsdWU8c3RyaW5nLCBWPikgPT4gbnVtYmVyKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPHN0cmluZywgVj4+O1xuICB0cmFuc2Zvcm08Vj4oXG4gICAgICBpbnB1dDoge1trZXk6IG51bWJlcl06IFZ9fE1hcDxudW1iZXIsIFY+LFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPG51bWJlciwgVj4sIGI6IEtleVZhbHVlPG51bWJlciwgVj4pID0+IG51bWJlcik6XG4gICAgICBBcnJheTxLZXlWYWx1ZTxudW1iZXIsIFY+PjtcbiAgdHJhbnNmb3JtPEssIFY+KGlucHV0OiBNYXA8SywgVj4sIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcik6XG4gICAgICBBcnJheTxLZXlWYWx1ZTxLLCBWPj47XG4gIHRyYW5zZm9ybTxLLCBWPihcbiAgICAgIGlucHV0OiBudWxsfHtba2V5OiBzdHJpbmddOiBWLCBba2V5OiBudW1iZXJdOiBWfXxNYXA8SywgVj4sXG4gICAgICBjb21wYXJlRm46IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlciA9IGRlZmF1bHRDb21wYXJhdG9yKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPEssIFY+PnxudWxsIHtcbiAgICBpZiAoIWlucHV0IHx8ICghKGlucHV0IGluc3RhbmNlb2YgTWFwKSAmJiB0eXBlb2YgaW5wdXQgIT09ICdvYmplY3QnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmRpZmZlcikge1xuICAgICAgLy8gbWFrZSBhIGRpZmZlciBmb3Igd2hhdGV2ZXIgdHlwZSB3ZSd2ZSBiZWVuIHBhc3NlZCBpblxuICAgICAgdGhpcy5kaWZmZXIgPSB0aGlzLmRpZmZlcnMuZmluZChpbnB1dCkuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlmZmVyQ2hhbmdlczogS2V5VmFsdWVDaGFuZ2VzPEssIFY+fG51bGwgPSB0aGlzLmRpZmZlci5kaWZmKGlucHV0IGFzIGFueSk7XG5cbiAgICBpZiAoZGlmZmVyQ2hhbmdlcykge1xuICAgICAgdGhpcy5rZXlWYWx1ZXMgPSBbXTtcbiAgICAgIGRpZmZlckNoYW5nZXMuZm9yRWFjaEl0ZW0oKHI6IEtleVZhbHVlQ2hhbmdlUmVjb3JkPEssIFY+KSA9PiB7XG4gICAgICAgIHRoaXMua2V5VmFsdWVzLnB1c2gobWFrZUtleVZhbHVlUGFpcihyLmtleSwgci5jdXJyZW50VmFsdWUgISkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmtleVZhbHVlcy5zb3J0KGNvbXBhcmVGbik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmtleVZhbHVlcztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENvbXBhcmF0b3I8SywgVj4oXG4gICAga2V5VmFsdWVBOiBLZXlWYWx1ZTxLLCBWPiwga2V5VmFsdWVCOiBLZXlWYWx1ZTxLLCBWPik6IG51bWJlciB7XG4gIGNvbnN0IGEgPSBrZXlWYWx1ZUEua2V5O1xuICBjb25zdCBiID0ga2V5VmFsdWVCLmtleTtcbiAgLy8gaWYgc2FtZSBleGl0IHdpdGggMDtcbiAgaWYgKGEgPT09IGIpIHJldHVybiAwO1xuICAvLyBtYWtlIHN1cmUgdGhhdCB1bmRlZmluZWQgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNvcnQuXG4gIGlmIChhID09PSB1bmRlZmluZWQpIHJldHVybiAxO1xuICBpZiAoYiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gLTE7XG4gIC8vIG1ha2Ugc3VyZSB0aGF0IG51bGxzIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBzb3J0LlxuICBpZiAoYSA9PT0gbnVsbCkgcmV0dXJuIDE7XG4gIGlmIChiID09PSBudWxsKSByZXR1cm4gLTE7XG4gIGlmICh0eXBlb2YgYSA9PSAnc3RyaW5nJyAmJiB0eXBlb2YgYiA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfVxuICBpZiAodHlwZW9mIGEgPT0gJ251bWJlcicgJiYgdHlwZW9mIGIgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gYSAtIGI7XG4gIH1cbiAgaWYgKHR5cGVvZiBhID09ICdib29sZWFuJyAmJiB0eXBlb2YgYiA9PSAnYm9vbGVhbicpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IDE7XG4gIH1cbiAgLy8gYGFgIGFuZCBgYmAgYXJlIG9mIGRpZmZlcmVudCB0eXBlcy4gQ29tcGFyZSB0aGVpciBzdHJpbmcgdmFsdWVzLlxuICBjb25zdCBhU3RyaW5nID0gU3RyaW5nKGEpO1xuICBjb25zdCBiU3RyaW5nID0gU3RyaW5nKGIpO1xuICByZXR1cm4gYVN0cmluZyA9PSBiU3RyaW5nID8gMCA6IGFTdHJpbmcgPCBiU3RyaW5nID8gLTEgOiAxO1xufVxuIl19