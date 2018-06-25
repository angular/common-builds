/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Pipe } from '@angular/core';
/**
 * @ngModule CommonModule
 * @description
 *
 * Converts a value into its JSON-format representation.  Useful for debugging.
 *
 * @usageNotes
 *
 * The following component uses a JSON pipe to convert an object
 * to JSON format, and displays the string in both formats for comparison.

 * {@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 *
 */
let JsonPipe = class JsonPipe {
    /**
     * @param value A value of any type to convert into a JSON-format string.
     */
    transform(value) { return JSON.stringify(value, null, 2); }
};
JsonPipe = tslib_1.__decorate([
    Pipe({ name: 'json', pure: false })
], JsonPipe);
export { JsonPipe };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRWxEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUgsSUFBYSxRQUFRLEdBQXJCO0lBQ0U7O09BRUc7SUFDSCxTQUFTLENBQUMsS0FBVSxJQUFZLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6RSxDQUFBO0FBTFksUUFBUTtJQURwQixJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztHQUNyQixRQUFRLENBS3BCO1NBTFksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDb252ZXJ0cyBhIHZhbHVlIGludG8gaXRzIEpTT04tZm9ybWF0IHJlcHJlc2VudGF0aW9uLiAgVXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGNvbXBvbmVudCB1c2VzIGEgSlNPTiBwaXBlIHRvIGNvbnZlcnQgYW4gb2JqZWN0XG4gKiB0byBKU09OIGZvcm1hdCwgYW5kIGRpc3BsYXlzIHRoZSBzdHJpbmcgaW4gYm90aCBmb3JtYXRzIGZvciBjb21wYXJpc29uLlxuXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2pzb25fcGlwZS50cyByZWdpb249J0pzb25QaXBlJ31cbiAqXG4gKlxuICovXG5AUGlwZSh7bmFtZTogJ2pzb24nLCBwdXJlOiBmYWxzZX0pXG5leHBvcnQgY2xhc3MgSnNvblBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBBIHZhbHVlIG9mIGFueSB0eXBlIHRvIGNvbnZlcnQgaW50byBhIEpTT04tZm9ybWF0IHN0cmluZy5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55KTogc3RyaW5nIHsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKTsgfVxufVxuIl19