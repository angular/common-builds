/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { KeyValueDiffers, Pipe } from '@angular/core';
/**
 * @template K, V
 * @param {?} key
 * @param {?} value
 * @return {?}
 */
function makeKeyValuePair(key, value) {
    return { key: key, value: value };
}
/**
 * A key value pair.
 * Usually used to represent the key value pairs from a Map or Object.
 *
 * \@publicApi
 * @record
 * @template K, V
 */
export function KeyValue() { }
if (false) {
    /** @type {?} */
    KeyValue.prototype.key;
    /** @type {?} */
    KeyValue.prototype.value;
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Transforms Object or Map into an array of key value pairs.
 *
 * The output array will be ordered by keys.
 * By default the comparator will be by Unicode point value.
 * You can optionally pass a compareFn if your keys are complex types.
 *
 * \@usageNotes
 * ### Examples
 *
 * This examples show how an Object or a Map and be iterated by ngFor with the use of this keyvalue
 * pipe.
 *
 * {\@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * \@publicApi
 */
export class KeyValuePipe {
    /**
     * @param {?} differs
     */
    constructor(differs) {
        this.differs = differs;
    }
    /**
     * @template K, V
     * @param {?} input
     * @param {?=} compareFn
     * @return {?}
     */
    transform(input, compareFn = defaultComparator) {
        if (!input || (!(input instanceof Map) && typeof input !== 'object')) {
            return null;
        }
        if (!this.differ) {
            // make a differ for whatever type we've been passed in
            this.differ = this.differs.find(input).create();
        }
        /** @type {?} */
        const differChanges = this.differ.diff((/** @type {?} */ (input)));
        if (differChanges) {
            this.keyValues = [];
            differChanges.forEachItem((r) => {
                this.keyValues.push(makeKeyValuePair(r.key, (/** @type {?} */ (r.currentValue))));
            });
            this.keyValues.sort(compareFn);
        }
        return this.keyValues;
    }
}
KeyValuePipe.decorators = [
    { type: Pipe, args: [{ name: 'keyvalue', pure: false },] }
];
/** @nocollapse */
KeyValuePipe.ctorParameters = () => [
    { type: KeyValueDiffers }
];
if (false) {
    /** @type {?} */
    KeyValuePipe.prototype.differ;
    /** @type {?} */
    KeyValuePipe.prototype.keyValues;
    /** @type {?} */
    KeyValuePipe.prototype.differs;
}
/**
 * @template K, V
 * @param {?} keyValueA
 * @param {?} keyValueB
 * @return {?}
 */
export function defaultComparator(keyValueA, keyValueB) {
    /** @type {?} */
    const a = keyValueA.key;
    /** @type {?} */
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
    /** @type {?} */
    const aString = String(a);
    /** @type {?} */
    const bString = String(b);
    return aString == bString ? 0 : aString < bString ? -1 : 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBd0QsZUFBZSxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7QUFFMUgsU0FBUyxnQkFBZ0IsQ0FBTyxHQUFNLEVBQUUsS0FBUTtJQUM5QyxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUM7QUFDbEMsQ0FBQzs7Ozs7Ozs7O0FBUUQsOEJBR0M7OztJQUZDLHVCQUFPOztJQUNQLHlCQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JYLE1BQU0sT0FBTyxZQUFZOzs7O0lBQ3ZCLFlBQTZCLE9BQXdCO1FBQXhCLFlBQU8sR0FBUCxPQUFPLENBQWlCO0lBQUcsQ0FBQzs7Ozs7OztJQWtCekQsU0FBUyxDQUNMLEtBQTBELEVBQzFELFlBQThELGlCQUFpQjtRQUVqRixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssWUFBWSxHQUFHLENBQUMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsRUFBRTtZQUNwRSxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDakQ7O2NBRUssYUFBYSxHQUErQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBQSxLQUFLLEVBQU8sQ0FBQztRQUVoRixJQUFJLGFBQWEsRUFBRTtZQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBNkIsRUFBRSxFQUFFO2dCQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLG1CQUFBLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNoQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDOzs7WUEzQ0YsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDOzs7O1lBckMwQixlQUFlOzs7O0lBMEM1RSw4QkFBMkM7O0lBRTNDLGlDQUErQzs7SUFMbkMsK0JBQXlDOzs7Ozs7OztBQTRDdkQsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixTQUF5QixFQUFFLFNBQXlCOztVQUNoRCxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUc7O1VBQ2pCLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRztJQUN2Qix1QkFBdUI7SUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RCLHVEQUF1RDtJQUN2RCxJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDL0IsbURBQW1EO0lBQ25ELElBQUksQ0FBQyxLQUFLLElBQUk7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxQixJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUU7UUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3ZCO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNkO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxFQUFFO1FBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2Qjs7O1VBRUssT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7O1VBQ25CLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLE9BQU8sT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7S2V5VmFsdWVDaGFuZ2VSZWNvcmQsIEtleVZhbHVlQ2hhbmdlcywgS2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVycywgUGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmZ1bmN0aW9uIG1ha2VLZXlWYWx1ZVBhaXI8SywgVj4oa2V5OiBLLCB2YWx1ZTogVik6IEtleVZhbHVlPEssIFY+IHtcbiAgcmV0dXJuIHtrZXk6IGtleSwgdmFsdWU6IHZhbHVlfTtcbn1cblxuLyoqXG4gKiBBIGtleSB2YWx1ZSBwYWlyLlxuICogVXN1YWxseSB1c2VkIHRvIHJlcHJlc2VudCB0aGUga2V5IHZhbHVlIHBhaXJzIGZyb20gYSBNYXAgb3IgT2JqZWN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBLZXlWYWx1ZTxLLCBWPiB7XG4gIGtleTogSztcbiAgdmFsdWU6IFY7XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVHJhbnNmb3JtcyBPYmplY3Qgb3IgTWFwIGludG8gYW4gYXJyYXkgb2Yga2V5IHZhbHVlIHBhaXJzLlxuICpcbiAqIFRoZSBvdXRwdXQgYXJyYXkgd2lsbCBiZSBvcmRlcmVkIGJ5IGtleXMuXG4gKiBCeSBkZWZhdWx0IHRoZSBjb21wYXJhdG9yIHdpbGwgYmUgYnkgVW5pY29kZSBwb2ludCB2YWx1ZS5cbiAqIFlvdSBjYW4gb3B0aW9uYWxseSBwYXNzIGEgY29tcGFyZUZuIGlmIHlvdXIga2V5cyBhcmUgY29tcGxleCB0eXBlcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogVGhpcyBleGFtcGxlcyBzaG93IGhvdyBhbiBPYmplY3Qgb3IgYSBNYXAgYW5kIGJlIGl0ZXJhdGVkIGJ5IG5nRm9yIHdpdGggdGhlIHVzZSBvZiB0aGlzIGtleXZhbHVlXG4gKiBwaXBlLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMva2V5dmFsdWVfcGlwZS50cyByZWdpb249J0tleVZhbHVlUGlwZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2tleXZhbHVlJywgcHVyZTogZmFsc2V9KVxuZXhwb3J0IGNsYXNzIEtleVZhbHVlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRpZmZlcnM6IEtleVZhbHVlRGlmZmVycykge31cblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBkaWZmZXIgITogS2V5VmFsdWVEaWZmZXI8YW55LCBhbnk+O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBrZXlWYWx1ZXMgITogQXJyYXk8S2V5VmFsdWU8YW55LCBhbnk+PjtcblxuICB0cmFuc2Zvcm08SywgVj4oaW5wdXQ6IG51bGwsIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcik6IG51bGw7XG4gIHRyYW5zZm9ybTxWPihcbiAgICAgIGlucHV0OiB7W2tleTogc3RyaW5nXTogVn18TWFwPHN0cmluZywgVj4sXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8c3RyaW5nLCBWPiwgYjogS2V5VmFsdWU8c3RyaW5nLCBWPikgPT4gbnVtYmVyKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPHN0cmluZywgVj4+O1xuICB0cmFuc2Zvcm08Vj4oXG4gICAgICBpbnB1dDoge1trZXk6IG51bWJlcl06IFZ9fE1hcDxudW1iZXIsIFY+LFxuICAgICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPG51bWJlciwgVj4sIGI6IEtleVZhbHVlPG51bWJlciwgVj4pID0+IG51bWJlcik6XG4gICAgICBBcnJheTxLZXlWYWx1ZTxudW1iZXIsIFY+PjtcbiAgdHJhbnNmb3JtPEssIFY+KGlucHV0OiBNYXA8SywgVj4sIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcik6XG4gICAgICBBcnJheTxLZXlWYWx1ZTxLLCBWPj47XG4gIHRyYW5zZm9ybTxLLCBWPihcbiAgICAgIGlucHV0OiBudWxsfHtba2V5OiBzdHJpbmddOiBWLCBba2V5OiBudW1iZXJdOiBWfXxNYXA8SywgVj4sXG4gICAgICBjb21wYXJlRm46IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlciA9IGRlZmF1bHRDb21wYXJhdG9yKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPEssIFY+PnxudWxsIHtcbiAgICBpZiAoIWlucHV0IHx8ICghKGlucHV0IGluc3RhbmNlb2YgTWFwKSAmJiB0eXBlb2YgaW5wdXQgIT09ICdvYmplY3QnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmRpZmZlcikge1xuICAgICAgLy8gbWFrZSBhIGRpZmZlciBmb3Igd2hhdGV2ZXIgdHlwZSB3ZSd2ZSBiZWVuIHBhc3NlZCBpblxuICAgICAgdGhpcy5kaWZmZXIgPSB0aGlzLmRpZmZlcnMuZmluZChpbnB1dCkuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlmZmVyQ2hhbmdlczogS2V5VmFsdWVDaGFuZ2VzPEssIFY+fG51bGwgPSB0aGlzLmRpZmZlci5kaWZmKGlucHV0IGFzIGFueSk7XG5cbiAgICBpZiAoZGlmZmVyQ2hhbmdlcykge1xuICAgICAgdGhpcy5rZXlWYWx1ZXMgPSBbXTtcbiAgICAgIGRpZmZlckNoYW5nZXMuZm9yRWFjaEl0ZW0oKHI6IEtleVZhbHVlQ2hhbmdlUmVjb3JkPEssIFY+KSA9PiB7XG4gICAgICAgIHRoaXMua2V5VmFsdWVzLnB1c2gobWFrZUtleVZhbHVlUGFpcihyLmtleSwgci5jdXJyZW50VmFsdWUgISkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmtleVZhbHVlcy5zb3J0KGNvbXBhcmVGbik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmtleVZhbHVlcztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENvbXBhcmF0b3I8SywgVj4oXG4gICAga2V5VmFsdWVBOiBLZXlWYWx1ZTxLLCBWPiwga2V5VmFsdWVCOiBLZXlWYWx1ZTxLLCBWPik6IG51bWJlciB7XG4gIGNvbnN0IGEgPSBrZXlWYWx1ZUEua2V5O1xuICBjb25zdCBiID0ga2V5VmFsdWVCLmtleTtcbiAgLy8gaWYgc2FtZSBleGl0IHdpdGggMDtcbiAgaWYgKGEgPT09IGIpIHJldHVybiAwO1xuICAvLyBtYWtlIHN1cmUgdGhhdCB1bmRlZmluZWQgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNvcnQuXG4gIGlmIChhID09PSB1bmRlZmluZWQpIHJldHVybiAxO1xuICBpZiAoYiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gLTE7XG4gIC8vIG1ha2Ugc3VyZSB0aGF0IG51bGxzIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBzb3J0LlxuICBpZiAoYSA9PT0gbnVsbCkgcmV0dXJuIDE7XG4gIGlmIChiID09PSBudWxsKSByZXR1cm4gLTE7XG4gIGlmICh0eXBlb2YgYSA9PSAnc3RyaW5nJyAmJiB0eXBlb2YgYiA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfVxuICBpZiAodHlwZW9mIGEgPT0gJ251bWJlcicgJiYgdHlwZW9mIGIgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gYSAtIGI7XG4gIH1cbiAgaWYgKHR5cGVvZiBhID09ICdib29sZWFuJyAmJiB0eXBlb2YgYiA9PSAnYm9vbGVhbicpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IDE7XG4gIH1cbiAgLy8gYGFgIGFuZCBgYmAgYXJlIG9mIGRpZmZlcmVudCB0eXBlcy4gQ29tcGFyZSB0aGVpciBzdHJpbmcgdmFsdWVzLlxuICBjb25zdCBhU3RyaW5nID0gU3RyaW5nKGEpO1xuICBjb25zdCBiU3RyaW5nID0gU3RyaW5nKGIpO1xuICByZXR1cm4gYVN0cmluZyA9PSBiU3RyaW5nID8gMCA6IGFTdHJpbmcgPCBiU3RyaW5nID8gLTEgOiAxO1xufVxuIl19