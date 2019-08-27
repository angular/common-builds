/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, KeyValueDiffers, Pipe } from '@angular/core';
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
 * This examples show how an Object or a Map can be iterated by ngFor with the use of this keyvalue
 * pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @publicApi
 */
var KeyValuePipe = /** @class */ (function () {
    function KeyValuePipe(differs) {
        this.differs = differs;
        this.keyValues = [];
    }
    KeyValuePipe.prototype.transform = function (input, compareFn) {
        var _this = this;
        if (compareFn === void 0) { compareFn = defaultComparator; }
        if (!input || (!(input instanceof Map) && typeof input !== 'object')) {
            return null;
        }
        if (!this.differ) {
            // make a differ for whatever type we've been passed in
            this.differ = this.differs.find(input).create();
        }
        var differChanges = this.differ.diff(input);
        if (differChanges) {
            this.keyValues = [];
            differChanges.forEachItem(function (r) {
                _this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
            });
            this.keyValues.sort(compareFn);
        }
        return this.keyValues;
    };
    KeyValuePipe.ngInjectableDef = i0.ɵɵdefineInjectable({ token: KeyValuePipe, factory: function KeyValuePipe_Factory(t) { return new (t || KeyValuePipe)(i0.ɵɵinject(i0.KeyValueDiffers)); }, providedIn: null });
    KeyValuePipe.ngFactoryDef = function KeyValuePipe_Factory(t) { return new (t || KeyValuePipe)(i0.ɵɵdirectiveInject(i0.KeyValueDiffers)); };
    KeyValuePipe.ngPipeDef = i0.ɵɵdefinePipe({ name: "keyvalue", type: KeyValuePipe, pure: false });
    return KeyValuePipe;
}());
export { KeyValuePipe };
/*@__PURE__*/ i0.ɵsetClassMetadata(KeyValuePipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'keyvalue', pure: false }]
    }], function () { return [{ type: i0.KeyValueDiffers }]; }, null);
/*@__PURE__*/ i0.ɵsetClassMetadata(KeyValuePipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'keyvalue', pure: false }]
    }], function () { return [{ type: i0.KeyValueDiffers }]; }, null);
export function defaultComparator(keyValueA, keyValueB) {
    var a = keyValueA.key;
    var b = keyValueB.key;
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
    var aString = String(a);
    var bString = String(b);
    return aString == bString ? 0 : aString < bString ? -1 : 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUF5RCxlQUFlLEVBQUUsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQzs7QUFFdEksU0FBUyxnQkFBZ0IsQ0FBTyxHQUFNLEVBQUUsS0FBUTtJQUM5QyxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUM7QUFDbEMsQ0FBQztBQWFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0g7SUFHRSxzQkFBNkIsT0FBd0I7UUFBeEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFHN0MsY0FBUyxHQUE4QixFQUFFLENBQUM7SUFITSxDQUFDO0lBZ0J6RCxnQ0FBUyxHQUFULFVBQ0ksS0FBMEQsRUFDMUQsU0FBK0U7UUFGbkYsaUJBdUJDO1FBckJHLDBCQUFBLEVBQUEsNkJBQStFO1FBRWpGLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLEdBQUcsQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxFQUFFO1lBQ3BFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQix1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNqRDtRQUVELElBQU0sYUFBYSxHQUErQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFZLENBQUMsQ0FBQztRQUVqRixJQUFJLGFBQWEsRUFBRTtZQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixhQUFhLENBQUMsV0FBVyxDQUFDLFVBQUMsQ0FBNkI7Z0JBQ3RELEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQWMsQ0FBQyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNoQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO2tFQXhDVSxZQUFZLCtEQUFaLFlBQVk7b0ZBQVosWUFBWTt1RUFBWixZQUFZO3VCQS9DekI7Q0F3RkMsQUEzQ0QsSUEyQ0M7U0F6Q1ksWUFBWTttQ0FBWixZQUFZO2NBRnhCLFVBQVU7O2NBQ1YsSUFBSTtlQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDOzttQ0FDeEIsWUFBWTtjQUZ4QixVQUFVOztjQUNWLElBQUk7ZUFBQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQzs7QUE0Q3JDLE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsU0FBeUIsRUFBRSxTQUF5QjtJQUN0RCxJQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3hCLElBQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDeEIsdUJBQXVCO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0Qix1REFBdUQ7SUFDdkQsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9CLG1EQUFtRDtJQUNuRCxJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2QjtJQUNELElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRTtRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDZDtJQUNELElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLFNBQVMsRUFBRTtRQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkI7SUFDRCxtRUFBbUU7SUFDbkUsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIEtleVZhbHVlQ2hhbmdlUmVjb3JkLCBLZXlWYWx1ZUNoYW5nZXMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlcnMsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5mdW5jdGlvbiBtYWtlS2V5VmFsdWVQYWlyPEssIFY+KGtleTogSywgdmFsdWU6IFYpOiBLZXlWYWx1ZTxLLCBWPiB7XG4gIHJldHVybiB7a2V5OiBrZXksIHZhbHVlOiB2YWx1ZX07XG59XG5cbi8qKlxuICogQSBrZXkgdmFsdWUgcGFpci5cbiAqIFVzdWFsbHkgdXNlZCB0byByZXByZXNlbnQgdGhlIGtleSB2YWx1ZSBwYWlycyBmcm9tIGEgTWFwIG9yIE9iamVjdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5VmFsdWU8SywgVj4ge1xuICBrZXk6IEs7XG4gIHZhbHVlOiBWO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFRyYW5zZm9ybXMgT2JqZWN0IG9yIE1hcCBpbnRvIGFuIGFycmF5IG9mIGtleSB2YWx1ZSBwYWlycy5cbiAqXG4gKiBUaGUgb3V0cHV0IGFycmF5IHdpbGwgYmUgb3JkZXJlZCBieSBrZXlzLlxuICogQnkgZGVmYXVsdCB0aGUgY29tcGFyYXRvciB3aWxsIGJlIGJ5IFVuaWNvZGUgcG9pbnQgdmFsdWUuXG4gKiBZb3UgY2FuIG9wdGlvbmFsbHkgcGFzcyBhIGNvbXBhcmVGbiBpZiB5b3VyIGtleXMgYXJlIGNvbXBsZXggdHlwZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIFRoaXMgZXhhbXBsZXMgc2hvdyBob3cgYW4gT2JqZWN0IG9yIGEgTWFwIGNhbiBiZSBpdGVyYXRlZCBieSBuZ0ZvciB3aXRoIHRoZSB1c2Ugb2YgdGhpcyBrZXl2YWx1ZVxuICogcGlwZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2tleXZhbHVlX3BpcGUudHMgcmVnaW9uPSdLZXlWYWx1ZVBpcGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuQFBpcGUoe25hbWU6ICdrZXl2YWx1ZScsIHB1cmU6IGZhbHNlfSlcbmV4cG9ydCBjbGFzcyBLZXlWYWx1ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBkaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMpIHt9XG5cbiAgcHJpdmF0ZSBkaWZmZXIgITogS2V5VmFsdWVEaWZmZXI8YW55LCBhbnk+O1xuICBwcml2YXRlIGtleVZhbHVlczogQXJyYXk8S2V5VmFsdWU8YW55LCBhbnk+PiA9IFtdO1xuXG4gIHRyYW5zZm9ybTxLLCBWPihpbnB1dDogbnVsbCwgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyKTogbnVsbDtcbiAgdHJhbnNmb3JtPFY+KFxuICAgICAgaW5wdXQ6IHtba2V5OiBzdHJpbmddOiBWfXxNYXA8c3RyaW5nLCBWPixcbiAgICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxzdHJpbmcsIFY+LCBiOiBLZXlWYWx1ZTxzdHJpbmcsIFY+KSA9PiBudW1iZXIpOlxuICAgICAgQXJyYXk8S2V5VmFsdWU8c3RyaW5nLCBWPj47XG4gIHRyYW5zZm9ybTxWPihcbiAgICAgIGlucHV0OiB7W2tleTogbnVtYmVyXTogVn18TWFwPG51bWJlciwgVj4sXG4gICAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8bnVtYmVyLCBWPiwgYjogS2V5VmFsdWU8bnVtYmVyLCBWPikgPT4gbnVtYmVyKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPG51bWJlciwgVj4+O1xuICB0cmFuc2Zvcm08SywgVj4oaW5wdXQ6IE1hcDxLLCBWPiwgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyKTpcbiAgICAgIEFycmF5PEtleVZhbHVlPEssIFY+PjtcbiAgdHJhbnNmb3JtPEssIFY+KFxuICAgICAgaW5wdXQ6IG51bGx8e1trZXk6IHN0cmluZ106IFYsIFtrZXk6IG51bWJlcl06IFZ9fE1hcDxLLCBWPixcbiAgICAgIGNvbXBhcmVGbjogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyID0gZGVmYXVsdENvbXBhcmF0b3IpOlxuICAgICAgQXJyYXk8S2V5VmFsdWU8SywgVj4+fG51bGwge1xuICAgIGlmICghaW5wdXQgfHwgKCEoaW5wdXQgaW5zdGFuY2VvZiBNYXApICYmIHR5cGVvZiBpbnB1dCAhPT0gJ29iamVjdCcpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZGlmZmVyKSB7XG4gICAgICAvLyBtYWtlIGEgZGlmZmVyIGZvciB3aGF0ZXZlciB0eXBlIHdlJ3ZlIGJlZW4gcGFzc2VkIGluXG4gICAgICB0aGlzLmRpZmZlciA9IHRoaXMuZGlmZmVycy5maW5kKGlucHV0KS5jcmVhdGUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaWZmZXJDaGFuZ2VzOiBLZXlWYWx1ZUNoYW5nZXM8SywgVj58bnVsbCA9IHRoaXMuZGlmZmVyLmRpZmYoaW5wdXQgYXMgYW55KTtcblxuICAgIGlmIChkaWZmZXJDaGFuZ2VzKSB7XG4gICAgICB0aGlzLmtleVZhbHVlcyA9IFtdO1xuICAgICAgZGlmZmVyQ2hhbmdlcy5mb3JFYWNoSXRlbSgocjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ8SywgVj4pID0+IHtcbiAgICAgICAgdGhpcy5rZXlWYWx1ZXMucHVzaChtYWtlS2V5VmFsdWVQYWlyKHIua2V5LCByLmN1cnJlbnRWYWx1ZSAhKSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMua2V5VmFsdWVzLnNvcnQoY29tcGFyZUZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMua2V5VmFsdWVzO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0Q29tcGFyYXRvcjxLLCBWPihcbiAgICBrZXlWYWx1ZUE6IEtleVZhbHVlPEssIFY+LCBrZXlWYWx1ZUI6IEtleVZhbHVlPEssIFY+KTogbnVtYmVyIHtcbiAgY29uc3QgYSA9IGtleVZhbHVlQS5rZXk7XG4gIGNvbnN0IGIgPSBrZXlWYWx1ZUIua2V5O1xuICAvLyBpZiBzYW1lIGV4aXQgd2l0aCAwO1xuICBpZiAoYSA9PT0gYikgcmV0dXJuIDA7XG4gIC8vIG1ha2Ugc3VyZSB0aGF0IHVuZGVmaW5lZCBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgc29ydC5cbiAgaWYgKGEgPT09IHVuZGVmaW5lZCkgcmV0dXJuIDE7XG4gIGlmIChiID09PSB1bmRlZmluZWQpIHJldHVybiAtMTtcbiAgLy8gbWFrZSBzdXJlIHRoYXQgbnVsbHMgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNvcnQuXG4gIGlmIChhID09PSBudWxsKSByZXR1cm4gMTtcbiAgaWYgKGIgPT09IG51bGwpIHJldHVybiAtMTtcbiAgaWYgKHR5cGVvZiBhID09ICdzdHJpbmcnICYmIHR5cGVvZiBiID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGEgPCBiID8gLTEgOiAxO1xuICB9XG4gIGlmICh0eXBlb2YgYSA9PSAnbnVtYmVyJyAmJiB0eXBlb2YgYiA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBhIC0gYjtcbiAgfVxuICBpZiAodHlwZW9mIGEgPT0gJ2Jvb2xlYW4nICYmIHR5cGVvZiBiID09ICdib29sZWFuJykge1xuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfVxuICAvLyBgYWAgYW5kIGBiYCBhcmUgb2YgZGlmZmVyZW50IHR5cGVzLiBDb21wYXJlIHRoZWlyIHN0cmluZyB2YWx1ZXMuXG4gIGNvbnN0IGFTdHJpbmcgPSBTdHJpbmcoYSk7XG4gIGNvbnN0IGJTdHJpbmcgPSBTdHJpbmcoYik7XG4gIHJldHVybiBhU3RyaW5nID09IGJTdHJpbmcgPyAwIDogYVN0cmluZyA8IGJTdHJpbmcgPyAtMSA6IDE7XG59XG4iXX0=