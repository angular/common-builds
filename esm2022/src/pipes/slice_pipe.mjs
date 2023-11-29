/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
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
export class SlicePipe {
    transform(value, start, end) {
        if (value == null)
            return null;
        if (!this.supports(value)) {
            throw invalidPipeArgumentError(SlicePipe, value);
        }
        return value.slice(start, end);
    }
    supports(obj) {
        return typeof obj === 'string' || Array.isArray(obj);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.1+sha-5d15804", ngImport: i0, type: SlicePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.1.0-next.1+sha-5d15804", ngImport: i0, type: SlicePipe, isStandalone: true, name: "slice", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.1+sha-5d15804", ngImport: i0, type: SlicePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'slice',
                    pure: false,
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvc2xpY2VfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUVsRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7QUFFdkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFNSCxNQUFNLE9BQU8sU0FBUztJQXFCcEIsU0FBUyxDQUFJLEtBQTZDLEVBQUUsS0FBYSxFQUFFLEdBQVk7UUFFckYsSUFBSSxLQUFLLElBQUksSUFBSTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDMUIsTUFBTSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVPLFFBQVEsQ0FBQyxHQUFRO1FBQ3ZCLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQzt5SEFsQ1UsU0FBUzt1SEFBVCxTQUFTOztzR0FBVCxTQUFTO2tCQUxyQixJQUFJO21CQUFDO29CQUNKLElBQUksRUFBRSxPQUFPO29CQUNiLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5YCBvciBgU3RyaW5nYCBjb250YWluaW5nIGEgc3Vic2V0IChzbGljZSkgb2YgdGhlIGVsZW1lbnRzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQWxsIGJlaGF2aW9yIGlzIGJhc2VkIG9uIHRoZSBleHBlY3RlZCBiZWhhdmlvciBvZiB0aGUgSmF2YVNjcmlwdCBBUEkgYEFycmF5LnByb3RvdHlwZS5zbGljZSgpYFxuICogYW5kIGBTdHJpbmcucHJvdG90eXBlLnNsaWNlKClgLlxuICpcbiAqIFdoZW4gb3BlcmF0aW5nIG9uIGFuIGBBcnJheWAsIHRoZSByZXR1cm5lZCBgQXJyYXlgIGlzIGFsd2F5cyBhIGNvcHkgZXZlbiB3aGVuIGFsbFxuICogdGhlIGVsZW1lbnRzIGFyZSBiZWluZyByZXR1cm5lZC5cbiAqXG4gKiBXaGVuIG9wZXJhdGluZyBvbiBhIGJsYW5rIHZhbHVlLCB0aGUgcGlwZSByZXR1cm5zIHRoZSBibGFuayB2YWx1ZS5cbiAqXG4gKiAjIyMgTGlzdCBFeGFtcGxlXG4gKlxuICogVGhpcyBgbmdGb3JgIGV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9zbGljZV9waXBlLnRzIHJlZ2lvbj0nU2xpY2VQaXBlX2xpc3QnfVxuICpcbiAqIHByb2R1Y2VzIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogYGBgaHRtbFxuICogPGxpPmI8L2xpPlxuICogPGxpPmM8L2xpPlxuICogYGBgXG4gKlxuICogIyMjIFN0cmluZyBFeGFtcGxlc1xuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvc2xpY2VfcGlwZS50cyByZWdpb249J1NsaWNlUGlwZV9zdHJpbmcnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe1xuICBuYW1lOiAnc2xpY2UnLFxuICBwdXJlOiBmYWxzZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgU2xpY2VQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgYSBsaXN0IG9yIGEgc3RyaW5nIHRvIGJlIHNsaWNlZC5cbiAgICogQHBhcmFtIHN0YXJ0IHRoZSBzdGFydGluZyBpbmRleCBvZiB0aGUgc3Vic2V0IHRvIHJldHVybjpcbiAgICogICAtICoqYSBwb3NpdGl2ZSBpbnRlZ2VyKio6IHJldHVybiB0aGUgaXRlbSBhdCBgc3RhcnRgIGluZGV4IGFuZCBhbGwgaXRlbXMgYWZ0ZXJcbiAgICogICAgIGluIHRoZSBsaXN0IG9yIHN0cmluZyBleHByZXNzaW9uLlxuICAgKiAgIC0gKiphIG5lZ2F0aXZlIGludGVnZXIqKjogcmV0dXJuIHRoZSBpdGVtIGF0IGBzdGFydGAgaW5kZXggZnJvbSB0aGUgZW5kIGFuZCBhbGwgaXRlbXMgYWZ0ZXJcbiAgICogICAgIGluIHRoZSBsaXN0IG9yIHN0cmluZyBleHByZXNzaW9uLlxuICAgKiAgIC0gKippZiBwb3NpdGl2ZSBhbmQgZ3JlYXRlciB0aGFuIHRoZSBzaXplIG9mIHRoZSBleHByZXNzaW9uKio6IHJldHVybiBhbiBlbXB0eSBsaXN0IG9yXG4gICAqIHN0cmluZy5cbiAgICogICAtICoqaWYgbmVnYXRpdmUgYW5kIGdyZWF0ZXIgdGhhbiB0aGUgc2l6ZSBvZiB0aGUgZXhwcmVzc2lvbioqOiByZXR1cm4gZW50aXJlIGxpc3Qgb3Igc3RyaW5nLlxuICAgKiBAcGFyYW0gZW5kIHRoZSBlbmRpbmcgaW5kZXggb2YgdGhlIHN1YnNldCB0byByZXR1cm46XG4gICAqICAgLSAqKm9taXR0ZWQqKjogcmV0dXJuIGFsbCBpdGVtcyB1bnRpbCB0aGUgZW5kLlxuICAgKiAgIC0gKippZiBwb3NpdGl2ZSoqOiByZXR1cm4gYWxsIGl0ZW1zIGJlZm9yZSBgZW5kYCBpbmRleCBvZiB0aGUgbGlzdCBvciBzdHJpbmcuXG4gICAqICAgLSAqKmlmIG5lZ2F0aXZlKio6IHJldHVybiBhbGwgaXRlbXMgYmVmb3JlIGBlbmRgIGluZGV4IGZyb20gdGhlIGVuZCBvZiB0aGUgbGlzdCBvciBzdHJpbmcuXG4gICAqL1xuICB0cmFuc2Zvcm08VD4odmFsdWU6IFJlYWRvbmx5QXJyYXk8VD4sIHN0YXJ0OiBudW1iZXIsIGVuZD86IG51bWJlcik6IEFycmF5PFQ+O1xuICB0cmFuc2Zvcm0odmFsdWU6IG51bGx8dW5kZWZpbmVkLCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBudWxsO1xuICB0cmFuc2Zvcm08VD4odmFsdWU6IFJlYWRvbmx5QXJyYXk8VD58bnVsbHx1bmRlZmluZWQsIHN0YXJ0OiBudW1iZXIsIGVuZD86IG51bWJlcik6IEFycmF5PFQ+fG51bGw7XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nLCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBzdHJpbmc7XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nfG51bGx8dW5kZWZpbmVkLCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBzdHJpbmd8bnVsbDtcbiAgdHJhbnNmb3JtPFQ+KHZhbHVlOiBSZWFkb25seUFycmF5PFQ+fHN0cmluZ3xudWxsfHVuZGVmaW5lZCwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKTpcbiAgICAgIEFycmF5PFQ+fHN0cmluZ3xudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoIXRoaXMuc3VwcG9ydHModmFsdWUpKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoU2xpY2VQaXBlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdXBwb3J0cyhvYmo6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KG9iaik7XG4gIH1cbn1cbiJdfQ==