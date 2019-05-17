/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Pipe } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
/**
 * @ngModule CommonModule
 * @description
 *
 * Creates a new `Array` or `String` containing a subset (slice) of the elements.
 *
 * @usageNotes
 *
 * All behavior is based on the expected behavior of the JavaScript API `Array.prototype.slice()`
 * and `String.prototype.slice()`.
 *
 * When operating on an `Array`, the returned `Array` is always a copy even when all
 * the elements are being returned.
 *
 * When operating on a blank value, the pipe returns the blank value.
 *
 * ### List Example
 *
 * This `ngFor` example:
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_list'}
 *
 * produces the following:
 *
 * ```html
 * <li>b</li>
 * <li>c</li>
 * ```
 *
 * ### String Examples
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_string'}
 *
 * @publicApi
 */
var SlicePipe = /** @class */ (function () {
    function SlicePipe() {
    }
    SlicePipe.prototype.transform = function (value, start, end) {
        if (value == null)
            return value;
        if (!this.supports(value)) {
            throw invalidPipeArgumentError(SlicePipe, value);
        }
        return value.slice(start, end);
    };
    SlicePipe.prototype.supports = function (obj) { return typeof obj === 'string' || Array.isArray(obj); };
    SlicePipe.ngInjectableDef = i0.ΔdefineInjectable({ token: SlicePipe, factory: function SlicePipe_Factory(t) { return new (t || SlicePipe)(); }, providedIn: null });
    SlicePipe.ngPipeDef = i0.ΔdefinePipe({ name: "slice", type: SlicePipe, factory: function SlicePipe_Factory(t) { return new (t || SlicePipe)(); }, pure: false });
    return SlicePipe;
}());
export { SlicePipe };
/*@__PURE__*/ i0.ɵsetClassMetadata(SlicePipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'slice', pure: false }]
    }], null, null);
/*@__PURE__*/ i0.ɵsetClassMetadata(SlicePipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'slice', pure: false }]
    }], null, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvc2xpY2VfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBRXZFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ0g7SUFBQTtLQWlDQztJQVhDLDZCQUFTLEdBQVQsVUFBVSxLQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVk7UUFDL0MsSUFBSSxLQUFLLElBQUksSUFBSTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRWhDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLE1BQU0sd0JBQXdCLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2xEO1FBRUQsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU8sNEJBQVEsR0FBaEIsVUFBaUIsR0FBUSxJQUFhLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzhEQTlCbEYsU0FBUyw0REFBVCxTQUFTO2dFQUFULFNBQVMsNERBQVQsU0FBUztvQkFoRHRCO0NBK0VDLEFBakNELElBaUNDO1NBL0JZLFNBQVM7bUNBQVQsU0FBUztjQUZyQixVQUFVOztjQUNWLElBQUk7ZUFBQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQzs7bUNBQ3JCLFNBQVM7Y0FGckIsVUFBVTs7Y0FDVixJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5YCBvciBgU3RyaW5nYCBjb250YWluaW5nIGEgc3Vic2V0IChzbGljZSkgb2YgdGhlIGVsZW1lbnRzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQWxsIGJlaGF2aW9yIGlzIGJhc2VkIG9uIHRoZSBleHBlY3RlZCBiZWhhdmlvciBvZiB0aGUgSmF2YVNjcmlwdCBBUEkgYEFycmF5LnByb3RvdHlwZS5zbGljZSgpYFxuICogYW5kIGBTdHJpbmcucHJvdG90eXBlLnNsaWNlKClgLlxuICpcbiAqIFdoZW4gb3BlcmF0aW5nIG9uIGFuIGBBcnJheWAsIHRoZSByZXR1cm5lZCBgQXJyYXlgIGlzIGFsd2F5cyBhIGNvcHkgZXZlbiB3aGVuIGFsbFxuICogdGhlIGVsZW1lbnRzIGFyZSBiZWluZyByZXR1cm5lZC5cbiAqXG4gKiBXaGVuIG9wZXJhdGluZyBvbiBhIGJsYW5rIHZhbHVlLCB0aGUgcGlwZSByZXR1cm5zIHRoZSBibGFuayB2YWx1ZS5cbiAqXG4gKiAjIyMgTGlzdCBFeGFtcGxlXG4gKlxuICogVGhpcyBgbmdGb3JgIGV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9zbGljZV9waXBlLnRzIHJlZ2lvbj0nU2xpY2VQaXBlX2xpc3QnfVxuICpcbiAqIHByb2R1Y2VzIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogYGBgaHRtbFxuICogPGxpPmI8L2xpPlxuICogPGxpPmM8L2xpPlxuICogYGBgXG4gKlxuICogIyMjIFN0cmluZyBFeGFtcGxlc1xuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvc2xpY2VfcGlwZS50cyByZWdpb249J1NsaWNlUGlwZV9zdHJpbmcnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuQFBpcGUoe25hbWU6ICdzbGljZScsIHB1cmU6IGZhbHNlfSlcbmV4cG9ydCBjbGFzcyBTbGljZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBhIGxpc3Qgb3IgYSBzdHJpbmcgdG8gYmUgc2xpY2VkLlxuICAgKiBAcGFyYW0gc3RhcnQgdGhlIHN0YXJ0aW5nIGluZGV4IG9mIHRoZSBzdWJzZXQgdG8gcmV0dXJuOlxuICAgKiAgIC0gKiphIHBvc2l0aXZlIGludGVnZXIqKjogcmV0dXJuIHRoZSBpdGVtIGF0IGBzdGFydGAgaW5kZXggYW5kIGFsbCBpdGVtcyBhZnRlclxuICAgKiAgICAgaW4gdGhlIGxpc3Qgb3Igc3RyaW5nIGV4cHJlc3Npb24uXG4gICAqICAgLSAqKmEgbmVnYXRpdmUgaW50ZWdlcioqOiByZXR1cm4gdGhlIGl0ZW0gYXQgYHN0YXJ0YCBpbmRleCBmcm9tIHRoZSBlbmQgYW5kIGFsbCBpdGVtcyBhZnRlclxuICAgKiAgICAgaW4gdGhlIGxpc3Qgb3Igc3RyaW5nIGV4cHJlc3Npb24uXG4gICAqICAgLSAqKmlmIHBvc2l0aXZlIGFuZCBncmVhdGVyIHRoYW4gdGhlIHNpemUgb2YgdGhlIGV4cHJlc3Npb24qKjogcmV0dXJuIGFuIGVtcHR5IGxpc3Qgb3JcbiAgICogc3RyaW5nLlxuICAgKiAgIC0gKippZiBuZWdhdGl2ZSBhbmQgZ3JlYXRlciB0aGFuIHRoZSBzaXplIG9mIHRoZSBleHByZXNzaW9uKio6IHJldHVybiBlbnRpcmUgbGlzdCBvciBzdHJpbmcuXG4gICAqIEBwYXJhbSBlbmQgdGhlIGVuZGluZyBpbmRleCBvZiB0aGUgc3Vic2V0IHRvIHJldHVybjpcbiAgICogICAtICoqb21pdHRlZCoqOiByZXR1cm4gYWxsIGl0ZW1zIHVudGlsIHRoZSBlbmQuXG4gICAqICAgLSAqKmlmIHBvc2l0aXZlKio6IHJldHVybiBhbGwgaXRlbXMgYmVmb3JlIGBlbmRgIGluZGV4IG9mIHRoZSBsaXN0IG9yIHN0cmluZy5cbiAgICogICAtICoqaWYgbmVnYXRpdmUqKjogcmV0dXJuIGFsbCBpdGVtcyBiZWZvcmUgYGVuZGAgaW5kZXggZnJvbSB0aGUgZW5kIG9mIHRoZSBsaXN0IG9yIHN0cmluZy5cbiAgICovXG4gIHRyYW5zZm9ybTxUPih2YWx1ZTogUmVhZG9ubHlBcnJheTxUPiwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKTogQXJyYXk8VD47XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nLCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBzdHJpbmc7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVsbCwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKTogbnVsbDtcbiAgdHJhbnNmb3JtKHZhbHVlOiB1bmRlZmluZWQsIHN0YXJ0OiBudW1iZXIsIGVuZD86IG51bWJlcik6IHVuZGVmaW5lZDtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIHN0YXJ0OiBudW1iZXIsIGVuZD86IG51bWJlcik6IGFueSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB2YWx1ZTtcblxuICAgIGlmICghdGhpcy5zdXBwb3J0cyh2YWx1ZSkpIHtcbiAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihTbGljZVBpcGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWUuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBwcml2YXRlIHN1cHBvcnRzKG9iajogYW55KTogYm9vbGVhbiB7IHJldHVybiB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KG9iaik7IH1cbn1cbiJdfQ==