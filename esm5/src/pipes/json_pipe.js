/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
/**
 * @ngModule CommonModule
 * @description
 *
 * Converts value into string using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 *
 */
var JsonPipe = /** @class */ (function () {
    function JsonPipe() {
    }
    JsonPipe.prototype.transform = function (value) { return JSON.stringify(value, null, 2); };
    JsonPipe.decorators = [
        { type: Pipe, args: [{ name: 'json', pure: false },] }
    ];
    return JsonPipe;
}());
export { JsonPipe };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFFbEQ7Ozs7Ozs7Ozs7R0FVRztBQUNIO0lBQUE7SUFHQSxDQUFDO0lBREMsNEJBQVMsR0FBVCxVQUFVLEtBQVUsSUFBWSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQUZ6RSxJQUFJLFNBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7O0lBR2pDLGVBQUM7Q0FBQSxBQUhELElBR0M7U0FGWSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENvbnZlcnRzIHZhbHVlIGludG8gc3RyaW5nIHVzaW5nIGBKU09OLnN0cmluZ2lmeWAuIFVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2pzb25fcGlwZS50cyByZWdpb249J0pzb25QaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ2pzb24nLCBwdXJlOiBmYWxzZX0pXG5leHBvcnQgY2xhc3MgSnNvblBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnkpOiBzdHJpbmcgeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDIpOyB9XG59XG4iXX0=