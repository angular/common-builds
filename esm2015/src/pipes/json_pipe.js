/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/pipes/json_pipe.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Converts a value into its JSON-format representation.  Useful for debugging.
 *
 * \@usageNotes
 *
 * The following component uses a JSON pipe to convert an object
 * to JSON format, and displays the string in both formats for comparison.
 *
 * {\@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 * \@publicApi
 */
export class JsonPipe {
    /**
     * @param {?} value A value of any type to convert into a JSON-format string.
     * @return {?}
     */
    transform(value) {
        return JSON.stringify(value, null, 2);
    }
}
JsonPipe.decorators = [
    { type: Pipe, args: [{ name: 'json', pure: false },] },
];
/** @nocollapse */ JsonPipe.ɵfac = function JsonPipe_Factory(t) { return new (t || JsonPipe)(); };
/** @nocollapse */ JsonPipe.ɵpipe = i0.ɵɵdefinePipe({ name: "json", type: JsonPipe, pure: false });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(JsonPipe, [{
        type: Pipe,
        args: [{ name: 'json', pure: false }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFRQSxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JsRCxNQUFNLE9BQU8sUUFBUTs7Ozs7SUFJbkIsU0FBUyxDQUFDLEtBQVU7UUFDbEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEMsQ0FBQzs7O1lBUEYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDOzttRkFDcEIsUUFBUTswRUFBUixRQUFRO2tEQUFSLFFBQVE7Y0FEcEIsSUFBSTtlQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENvbnZlcnRzIGEgdmFsdWUgaW50byBpdHMgSlNPTi1mb3JtYXQgcmVwcmVzZW50YXRpb24uICBVc2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgY29tcG9uZW50IHVzZXMgYSBKU09OIHBpcGUgdG8gY29udmVydCBhbiBvYmplY3RcbiAqIHRvIEpTT04gZm9ybWF0LCBhbmQgZGlzcGxheXMgdGhlIHN0cmluZyBpbiBib3RoIGZvcm1hdHMgZm9yIGNvbXBhcmlzb24uXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9qc29uX3BpcGUudHMgcmVnaW9uPSdKc29uUGlwZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2pzb24nLCBwdXJlOiBmYWxzZX0pXG5leHBvcnQgY2xhc3MgSnNvblBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBBIHZhbHVlIG9mIGFueSB0eXBlIHRvIGNvbnZlcnQgaW50byBhIEpTT04tZm9ybWF0IHN0cmluZy5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDIpO1xuICB9XG59XG4iXX0=