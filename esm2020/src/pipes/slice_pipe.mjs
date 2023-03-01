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
class SlicePipe {
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
}
SlicePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-2fbaee3", ngImport: i0, type: SlicePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
SlicePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.0.0-next.1+sha-2fbaee3", ngImport: i0, type: SlicePipe, isStandalone: true, name: "slice", pure: false });
export { SlicePipe };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-2fbaee3", ngImport: i0, type: SlicePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'slice',
                    pure: false,
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvc2xpY2VfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUVsRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7QUFFdkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxNQUthLFNBQVM7SUFxQnBCLFNBQVMsQ0FBSSxLQUE2QyxFQUFFLEtBQWEsRUFBRSxHQUFZO1FBRXJGLElBQUksS0FBSyxJQUFJLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUUvQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN6QixNQUFNLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNsRDtRQUVELE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVPLFFBQVEsQ0FBQyxHQUFRO1FBQ3ZCLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQzs7aUhBbENVLFNBQVM7K0dBQVQsU0FBUztTQUFULFNBQVM7c0dBQVQsU0FBUztrQkFMckIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsT0FBTztvQkFDYixJQUFJLEVBQUUsS0FBSztvQkFDWCxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheWAgb3IgYFN0cmluZ2AgY29udGFpbmluZyBhIHN1YnNldCAoc2xpY2UpIG9mIHRoZSBlbGVtZW50cy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEFsbCBiZWhhdmlvciBpcyBiYXNlZCBvbiB0aGUgZXhwZWN0ZWQgYmVoYXZpb3Igb2YgdGhlIEphdmFTY3JpcHQgQVBJIGBBcnJheS5wcm90b3R5cGUuc2xpY2UoKWBcbiAqIGFuZCBgU3RyaW5nLnByb3RvdHlwZS5zbGljZSgpYC5cbiAqXG4gKiBXaGVuIG9wZXJhdGluZyBvbiBhbiBgQXJyYXlgLCB0aGUgcmV0dXJuZWQgYEFycmF5YCBpcyBhbHdheXMgYSBjb3B5IGV2ZW4gd2hlbiBhbGxcbiAqIHRoZSBlbGVtZW50cyBhcmUgYmVpbmcgcmV0dXJuZWQuXG4gKlxuICogV2hlbiBvcGVyYXRpbmcgb24gYSBibGFuayB2YWx1ZSwgdGhlIHBpcGUgcmV0dXJucyB0aGUgYmxhbmsgdmFsdWUuXG4gKlxuICogIyMjIExpc3QgRXhhbXBsZVxuICpcbiAqIFRoaXMgYG5nRm9yYCBleGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvc2xpY2VfcGlwZS50cyByZWdpb249J1NsaWNlUGlwZV9saXN0J31cbiAqXG4gKiBwcm9kdWNlcyB0aGUgZm9sbG93aW5nOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxsaT5iPC9saT5cbiAqIDxsaT5jPC9saT5cbiAqIGBgYFxuICpcbiAqICMjIyBTdHJpbmcgRXhhbXBsZXNcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL3NsaWNlX3BpcGUudHMgcmVnaW9uPSdTbGljZVBpcGVfc3RyaW5nJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ3NsaWNlJyxcbiAgcHVyZTogZmFsc2UsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIFNsaWNlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAvKipcbiAgICogQHBhcmFtIHZhbHVlIGEgbGlzdCBvciBhIHN0cmluZyB0byBiZSBzbGljZWQuXG4gICAqIEBwYXJhbSBzdGFydCB0aGUgc3RhcnRpbmcgaW5kZXggb2YgdGhlIHN1YnNldCB0byByZXR1cm46XG4gICAqICAgLSAqKmEgcG9zaXRpdmUgaW50ZWdlcioqOiByZXR1cm4gdGhlIGl0ZW0gYXQgYHN0YXJ0YCBpbmRleCBhbmQgYWxsIGl0ZW1zIGFmdGVyXG4gICAqICAgICBpbiB0aGUgbGlzdCBvciBzdHJpbmcgZXhwcmVzc2lvbi5cbiAgICogICAtICoqYSBuZWdhdGl2ZSBpbnRlZ2VyKio6IHJldHVybiB0aGUgaXRlbSBhdCBgc3RhcnRgIGluZGV4IGZyb20gdGhlIGVuZCBhbmQgYWxsIGl0ZW1zIGFmdGVyXG4gICAqICAgICBpbiB0aGUgbGlzdCBvciBzdHJpbmcgZXhwcmVzc2lvbi5cbiAgICogICAtICoqaWYgcG9zaXRpdmUgYW5kIGdyZWF0ZXIgdGhhbiB0aGUgc2l6ZSBvZiB0aGUgZXhwcmVzc2lvbioqOiByZXR1cm4gYW4gZW1wdHkgbGlzdCBvclxuICAgKiBzdHJpbmcuXG4gICAqICAgLSAqKmlmIG5lZ2F0aXZlIGFuZCBncmVhdGVyIHRoYW4gdGhlIHNpemUgb2YgdGhlIGV4cHJlc3Npb24qKjogcmV0dXJuIGVudGlyZSBsaXN0IG9yIHN0cmluZy5cbiAgICogQHBhcmFtIGVuZCB0aGUgZW5kaW5nIGluZGV4IG9mIHRoZSBzdWJzZXQgdG8gcmV0dXJuOlxuICAgKiAgIC0gKipvbWl0dGVkKio6IHJldHVybiBhbGwgaXRlbXMgdW50aWwgdGhlIGVuZC5cbiAgICogICAtICoqaWYgcG9zaXRpdmUqKjogcmV0dXJuIGFsbCBpdGVtcyBiZWZvcmUgYGVuZGAgaW5kZXggb2YgdGhlIGxpc3Qgb3Igc3RyaW5nLlxuICAgKiAgIC0gKippZiBuZWdhdGl2ZSoqOiByZXR1cm4gYWxsIGl0ZW1zIGJlZm9yZSBgZW5kYCBpbmRleCBmcm9tIHRoZSBlbmQgb2YgdGhlIGxpc3Qgb3Igc3RyaW5nLlxuICAgKi9cbiAgdHJhbnNmb3JtPFQ+KHZhbHVlOiBSZWFkb25seUFycmF5PFQ+LCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBBcnJheTxUPjtcbiAgdHJhbnNmb3JtKHZhbHVlOiBudWxsfHVuZGVmaW5lZCwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKTogbnVsbDtcbiAgdHJhbnNmb3JtPFQ+KHZhbHVlOiBSZWFkb25seUFycmF5PFQ+fG51bGx8dW5kZWZpbmVkLCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBBcnJheTxUPnxudWxsO1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKTogc3RyaW5nO1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZ3xudWxsfHVuZGVmaW5lZCwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKTogc3RyaW5nfG51bGw7XG4gIHRyYW5zZm9ybTxUPih2YWx1ZTogUmVhZG9ubHlBcnJheTxUPnxzdHJpbmd8bnVsbHx1bmRlZmluZWQsIHN0YXJ0OiBudW1iZXIsIGVuZD86IG51bWJlcik6XG4gICAgICBBcnJheTxUPnxzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKCF0aGlzLnN1cHBvcnRzKHZhbHVlKSkge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKFNsaWNlUGlwZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZS5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuXG4gIHByaXZhdGUgc3VwcG9ydHMob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheShvYmopO1xuICB9XG59XG4iXX0=