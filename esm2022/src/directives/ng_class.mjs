/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, Renderer2, ɵstringify as stringify } from '@angular/core';
import * as i0 from "@angular/core";
const WS_REGEXP = /\s+/;
const EMPTY_ARRAY = [];
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @publicApi
 */
export class NgClass {
    constructor(_ngEl, _renderer) {
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this.initialClasses = EMPTY_ARRAY;
        this.stateMap = new Map();
    }
    set klass(value) {
        this.initialClasses = value != null ? value.trim().split(WS_REGEXP) : EMPTY_ARRAY;
    }
    set ngClass(value) {
        this.rawClass = typeof value === 'string' ? value.trim().split(WS_REGEXP) : value;
    }
    /*
    The NgClass directive uses the custom change detection algorithm for its inputs. The custom
    algorithm is necessary since inputs are represented as complex object or arrays that need to be
    deeply-compared.
  
    This algorithm is perf-sensitive since NgClass is used very frequently and its poor performance
    might negatively impact runtime performance of the entire change detection cycle. The design of
    this algorithm is making sure that:
    - there is no unnecessary DOM manipulation (CSS classes are added / removed from the DOM only when
    needed), even if references to bound objects change;
    - there is no memory allocation if nothing changes (even relatively modest memory allocation
    during the change detection cycle can result in GC pauses for some of the CD cycles).
  
    The algorithm works by iterating over the set of bound classes, staring with [class] binding and
    then going over [ngClass] binding. For each CSS class name:
    - check if it was seen before (this information is tracked in the state map) and if its value
    changed;
    - mark it as "touched" - names that are not marked are not present in the latest set of binding
    and we can remove such class name from the internal data structures;
  
    After iteration over all the CSS class names we've got data structure with all the information
    necessary to synchronize changes to the DOM - it is enough to iterate over the state map, flush
    changes to the DOM and reset internal data structures so those are ready for the next change
    detection cycle.
     */
    ngDoCheck() {
        // classes from the [class] binding
        for (const klass of this.initialClasses) {
            this._updateState(klass, true);
        }
        // classes from the [ngClass] binding
        const rawClass = this.rawClass;
        if (Array.isArray(rawClass) || rawClass instanceof Set) {
            for (const klass of rawClass) {
                this._updateState(klass, true);
            }
        }
        else if (rawClass != null) {
            for (const klass of Object.keys(rawClass)) {
                this._updateState(klass, Boolean(rawClass[klass]));
            }
        }
        this._applyStateDiff();
    }
    _updateState(klass, nextEnabled) {
        const state = this.stateMap.get(klass);
        if (state !== undefined) {
            if (state.enabled !== nextEnabled) {
                state.changed = true;
                state.enabled = nextEnabled;
            }
            state.touched = true;
        }
        else {
            this.stateMap.set(klass, { enabled: nextEnabled, changed: true, touched: true });
        }
    }
    _applyStateDiff() {
        for (const stateEntry of this.stateMap) {
            const klass = stateEntry[0];
            const state = stateEntry[1];
            if (state.changed) {
                this._toggleClass(klass, state.enabled);
                state.changed = false;
            }
            else if (!state.touched) {
                // A class that was previously active got removed from the new collection of classes -
                // remove from the DOM as well.
                if (state.enabled) {
                    this._toggleClass(klass, false);
                }
                this.stateMap.delete(klass);
            }
            state.touched = false;
        }
    }
    _toggleClass(klass, enabled) {
        if (ngDevMode) {
            if (typeof klass !== 'string') {
                throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${stringify(klass)}`);
            }
        }
        klass = klass.trim();
        if (klass.length > 0) {
            klass.split(WS_REGEXP).forEach(klass => {
                if (enabled) {
                    this._renderer.addClass(this._ngEl.nativeElement, klass);
                }
                else {
                    this._renderer.removeClass(this._ngEl.nativeElement, klass);
                }
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.9+sha-23f19f8", ngImport: i0, type: NgClass, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.9+sha-23f19f8", type: NgClass, isStandalone: true, selector: "[ngClass]", inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.9+sha-23f19f8", ngImport: i0, type: NgClass, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngClass]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }], propDecorators: { klass: [{
                type: Input,
                args: ['class']
            }], ngClass: [{
                type: Input,
                args: ['ngClass']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsS0FBSyxFQUFvQyxTQUFTLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFJMUksTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBRXhCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztBQWtCakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUtILE1BQU0sT0FBTyxPQUFPO0lBTWxCLFlBQW9CLEtBQWlCLEVBQVUsU0FBb0I7UUFBL0MsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFMM0QsbUJBQWMsR0FBRyxXQUFXLENBQUM7UUFHN0IsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO0lBRWtCLENBQUM7SUFFdkUsSUFDSSxLQUFLLENBQUMsS0FBYTtRQUNyQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztJQUNwRixDQUFDO0lBRUQsSUFDSSxPQUFPLENBQUMsS0FBd0U7UUFDbEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNwRixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCRztJQUNILFNBQVM7UUFDUCxtQ0FBbUM7UUFDbkMsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2hDO1FBRUQscUNBQXFDO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsWUFBWSxHQUFHLEVBQUU7WUFDdEQsS0FBSyxNQUFNLEtBQUssSUFBSSxRQUFRLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7YUFBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7WUFDM0IsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRDtTQUNGO1FBRUQsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFTyxZQUFZLENBQUMsS0FBYSxFQUFFLFdBQW9CO1FBQ3RELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2QixJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO2dCQUNqQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDckIsS0FBSyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7YUFDN0I7WUFDRCxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztTQUN0QjthQUFNO1lBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1NBQ2hGO0lBQ0gsQ0FBQztJQUVPLGVBQWU7UUFDckIsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2FBQ3ZCO2lCQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUN6QixzRkFBc0Y7Z0JBQ3RGLCtCQUErQjtnQkFDL0IsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO29CQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDakM7Z0JBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0I7WUFFRCxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztTQUN2QjtJQUNILENBQUM7SUFFTyxZQUFZLENBQUMsS0FBYSxFQUFFLE9BQWdCO1FBQ2xELElBQUksU0FBUyxFQUFFO1lBQ2IsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQ1gsaUVBQWlFLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDMUY7U0FDRjtRQUNELEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckIsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQixLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDckMsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQzFEO3FCQUFNO29CQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUM3RDtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO3lIQW5IVSxPQUFPOzZHQUFQLE9BQU87O3NHQUFQLE9BQU87a0JBSm5CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjt1R0FVSyxLQUFLO3NCQURSLEtBQUs7dUJBQUMsT0FBTztnQkFNVixPQUFPO3NCQURWLEtBQUs7dUJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEVsZW1lbnRSZWYsIElucHV0LCBJdGVyYWJsZURpZmZlcnMsIEtleVZhbHVlRGlmZmVycywgUmVuZGVyZXIyLCDJtXN0cmluZ2lmeSBhcyBzdHJpbmdpZnl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG50eXBlIE5nQ2xhc3NTdXBwb3J0ZWRUeXBlcyA9IHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX18bnVsbHx1bmRlZmluZWQ7XG5cbmNvbnN0IFdTX1JFR0VYUCA9IC9cXHMrLztcblxuY29uc3QgRU1QVFlfQVJSQVk6IHN0cmluZ1tdID0gW107XG5cbi8qKlxuICogUmVwcmVzZW50cyBpbnRlcm5hbCBvYmplY3QgdXNlZCB0byB0cmFjayBzdGF0ZSBvZiBlYWNoIENTUyBjbGFzcy4gVGhlcmUgYXJlIDMgZGlmZmVyZW50IChib29sZWFuKVxuICogZmxhZ3MgdGhhdCwgY29tYmluZWQgdG9nZXRoZXIsIGluZGljYXRlIHN0YXRlIG9mIGEgZ2l2ZW4gQ1NTIGNsYXNzOlxuICogLSBlbmFibGVkOiBpbmRpY2F0ZXMgaWYgYSBjbGFzcyBzaG91bGQgYmUgcHJlc2VudCBpbiB0aGUgRE9NICh0cnVlKSBvciBub3QgKGZhbHNlKTtcbiAqIC0gY2hhbmdlZDogdHJhY2tzIGlmIGEgY2xhc3Mgd2FzIHRvZ2dsZWQgKGFkZGVkIG9yIHJlbW92ZWQpIGR1cmluZyB0aGUgY3VzdG9tIGRpcnR5LWNoZWNraW5nXG4gKiBwcm9jZXNzOyBjaGFuZ2VkIGNsYXNzZXMgbXVzdCBiZSBzeW5jaHJvbml6ZWQgd2l0aCB0aGUgRE9NO1xuICogLSB0b3VjaGVkOiB0cmFja3MgaWYgYSBjbGFzcyBpcyBwcmVzZW50IGluIHRoZSBjdXJyZW50IG9iamVjdCBib3VuZCB0byB0aGUgY2xhc3MgLyBuZ0NsYXNzIGlucHV0O1xuICogY2xhc3NlcyB0aGF0IGFyZSBub3QgcHJlc2VudCBhbnkgbW9yZSBjYW4gYmUgcmVtb3ZlZCBmcm9tIHRoZSBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZXM7XG4gKi9cbmludGVyZmFjZSBDc3NDbGFzc1N0YXRlIHtcbiAgLy8gUEVSRjogY291bGQgdXNlIGEgYml0IG1hc2sgdG8gcmVwcmVzZW50IHN0YXRlIGFzIGFsbCBmaWVsZHMgYXJlIGJvb2xlYW4gZmxhZ3NcbiAgZW5hYmxlZDogYm9vbGVhbjtcbiAgY2hhbmdlZDogYm9vbGVhbjtcbiAgdG91Y2hlZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwiJ2ZpcnN0IHNlY29uZCdcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJbJ2ZpcnN0JywgJ3NlY29uZCddXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydmaXJzdCc6IHRydWUsICdzZWNvbmQnOiB0cnVlLCAndGhpcmQnOiBmYWxzZX1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJzdHJpbmdFeHB8YXJyYXlFeHB8b2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydjbGFzczEgY2xhc3MyIGNsYXNzMycgOiB0cnVlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyBhbmQgcmVtb3ZlcyBDU1MgY2xhc3NlcyBvbiBhbiBIVE1MIGVsZW1lbnQuXG4gKlxuICogVGhlIENTUyBjbGFzc2VzIGFyZSB1cGRhdGVkIGFzIGZvbGxvd3MsIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0aW9uOlxuICogLSBgc3RyaW5nYCAtIHRoZSBDU1MgY2xhc3NlcyBsaXN0ZWQgaW4gdGhlIHN0cmluZyAoc3BhY2UgZGVsaW1pdGVkKSBhcmUgYWRkZWQsXG4gKiAtIGBBcnJheWAgLSB0aGUgQ1NTIGNsYXNzZXMgZGVjbGFyZWQgYXMgQXJyYXkgZWxlbWVudHMgYXJlIGFkZGVkLFxuICogLSBgT2JqZWN0YCAtIGtleXMgYXJlIENTUyBjbGFzc2VzIHRoYXQgZ2V0IGFkZGVkIHdoZW4gdGhlIGV4cHJlc3Npb24gZ2l2ZW4gaW4gdGhlIHZhbHVlXG4gKiAgICAgICAgICAgICAgZXZhbHVhdGVzIHRvIGEgdHJ1dGh5IHZhbHVlLCBvdGhlcndpc2UgdGhleSBhcmUgcmVtb3ZlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0NsYXNzXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3MgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBpbml0aWFsQ2xhc3NlcyA9IEVNUFRZX0FSUkFZO1xuICBwcml2YXRlIHJhd0NsYXNzOiBOZ0NsYXNzU3VwcG9ydGVkVHlwZXM7XG5cbiAgcHJpdmF0ZSBzdGF0ZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDc3NDbGFzc1N0YXRlPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgQElucHV0KCdjbGFzcycpXG4gIHNldCBrbGFzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5pbml0aWFsQ2xhc3NlcyA9IHZhbHVlICE9IG51bGwgPyB2YWx1ZS50cmltKCkuc3BsaXQoV1NfUkVHRVhQKSA6IEVNUFRZX0FSUkFZO1xuICB9XG5cbiAgQElucHV0KCduZ0NsYXNzJylcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9fG51bGx8dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5yYXdDbGFzcyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS50cmltKCkuc3BsaXQoV1NfUkVHRVhQKSA6IHZhbHVlO1xuICB9XG5cbiAgLypcbiAgVGhlIE5nQ2xhc3MgZGlyZWN0aXZlIHVzZXMgdGhlIGN1c3RvbSBjaGFuZ2UgZGV0ZWN0aW9uIGFsZ29yaXRobSBmb3IgaXRzIGlucHV0cy4gVGhlIGN1c3RvbVxuICBhbGdvcml0aG0gaXMgbmVjZXNzYXJ5IHNpbmNlIGlucHV0cyBhcmUgcmVwcmVzZW50ZWQgYXMgY29tcGxleCBvYmplY3Qgb3IgYXJyYXlzIHRoYXQgbmVlZCB0byBiZVxuICBkZWVwbHktY29tcGFyZWQuXG5cbiAgVGhpcyBhbGdvcml0aG0gaXMgcGVyZi1zZW5zaXRpdmUgc2luY2UgTmdDbGFzcyBpcyB1c2VkIHZlcnkgZnJlcXVlbnRseSBhbmQgaXRzIHBvb3IgcGVyZm9ybWFuY2VcbiAgbWlnaHQgbmVnYXRpdmVseSBpbXBhY3QgcnVudGltZSBwZXJmb3JtYW5jZSBvZiB0aGUgZW50aXJlIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUuIFRoZSBkZXNpZ24gb2ZcbiAgdGhpcyBhbGdvcml0aG0gaXMgbWFraW5nIHN1cmUgdGhhdDpcbiAgLSB0aGVyZSBpcyBubyB1bm5lY2Vzc2FyeSBET00gbWFuaXB1bGF0aW9uIChDU1MgY2xhc3NlcyBhcmUgYWRkZWQgLyByZW1vdmVkIGZyb20gdGhlIERPTSBvbmx5IHdoZW5cbiAgbmVlZGVkKSwgZXZlbiBpZiByZWZlcmVuY2VzIHRvIGJvdW5kIG9iamVjdHMgY2hhbmdlO1xuICAtIHRoZXJlIGlzIG5vIG1lbW9yeSBhbGxvY2F0aW9uIGlmIG5vdGhpbmcgY2hhbmdlcyAoZXZlbiByZWxhdGl2ZWx5IG1vZGVzdCBtZW1vcnkgYWxsb2NhdGlvblxuICBkdXJpbmcgdGhlIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgY2FuIHJlc3VsdCBpbiBHQyBwYXVzZXMgZm9yIHNvbWUgb2YgdGhlIENEIGN5Y2xlcykuXG5cbiAgVGhlIGFsZ29yaXRobSB3b3JrcyBieSBpdGVyYXRpbmcgb3ZlciB0aGUgc2V0IG9mIGJvdW5kIGNsYXNzZXMsIHN0YXJpbmcgd2l0aCBbY2xhc3NdIGJpbmRpbmcgYW5kXG4gIHRoZW4gZ29pbmcgb3ZlciBbbmdDbGFzc10gYmluZGluZy4gRm9yIGVhY2ggQ1NTIGNsYXNzIG5hbWU6XG4gIC0gY2hlY2sgaWYgaXQgd2FzIHNlZW4gYmVmb3JlICh0aGlzIGluZm9ybWF0aW9uIGlzIHRyYWNrZWQgaW4gdGhlIHN0YXRlIG1hcCkgYW5kIGlmIGl0cyB2YWx1ZVxuICBjaGFuZ2VkO1xuICAtIG1hcmsgaXQgYXMgXCJ0b3VjaGVkXCIgLSBuYW1lcyB0aGF0IGFyZSBub3QgbWFya2VkIGFyZSBub3QgcHJlc2VudCBpbiB0aGUgbGF0ZXN0IHNldCBvZiBiaW5kaW5nXG4gIGFuZCB3ZSBjYW4gcmVtb3ZlIHN1Y2ggY2xhc3MgbmFtZSBmcm9tIHRoZSBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZXM7XG5cbiAgQWZ0ZXIgaXRlcmF0aW9uIG92ZXIgYWxsIHRoZSBDU1MgY2xhc3MgbmFtZXMgd2UndmUgZ290IGRhdGEgc3RydWN0dXJlIHdpdGggYWxsIHRoZSBpbmZvcm1hdGlvblxuICBuZWNlc3NhcnkgdG8gc3luY2hyb25pemUgY2hhbmdlcyB0byB0aGUgRE9NIC0gaXQgaXMgZW5vdWdoIHRvIGl0ZXJhdGUgb3ZlciB0aGUgc3RhdGUgbWFwLCBmbHVzaFxuICBjaGFuZ2VzIHRvIHRoZSBET00gYW5kIHJlc2V0IGludGVybmFsIGRhdGEgc3RydWN0dXJlcyBzbyB0aG9zZSBhcmUgcmVhZHkgZm9yIHRoZSBuZXh0IGNoYW5nZVxuICBkZXRlY3Rpb24gY3ljbGUuXG4gICAqL1xuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgLy8gY2xhc3NlcyBmcm9tIHRoZSBbY2xhc3NdIGJpbmRpbmdcbiAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIHRoaXMuaW5pdGlhbENsYXNzZXMpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKGtsYXNzLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBjbGFzc2VzIGZyb20gdGhlIFtuZ0NsYXNzXSBiaW5kaW5nXG4gICAgY29uc3QgcmF3Q2xhc3MgPSB0aGlzLnJhd0NsYXNzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0NsYXNzKSB8fCByYXdDbGFzcyBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiByYXdDbGFzcykge1xuICAgICAgICB0aGlzLl91cGRhdGVTdGF0ZShrbGFzcywgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChyYXdDbGFzcyAhPSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIE9iamVjdC5rZXlzKHJhd0NsYXNzKSkge1xuICAgICAgICB0aGlzLl91cGRhdGVTdGF0ZShrbGFzcywgQm9vbGVhbihyYXdDbGFzc1trbGFzc10pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseVN0YXRlRGlmZigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU3RhdGUoa2xhc3M6IHN0cmluZywgbmV4dEVuYWJsZWQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuc3RhdGVNYXAuZ2V0KGtsYXNzKTtcbiAgICBpZiAoc3RhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHN0YXRlLmVuYWJsZWQgIT09IG5leHRFbmFibGVkKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBzdGF0ZS5lbmFibGVkID0gbmV4dEVuYWJsZWQ7XG4gICAgICB9XG4gICAgICBzdGF0ZS50b3VjaGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGF0ZU1hcC5zZXQoa2xhc3MsIHtlbmFibGVkOiBuZXh0RW5hYmxlZCwgY2hhbmdlZDogdHJ1ZSwgdG91Y2hlZDogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U3RhdGVEaWZmKCkge1xuICAgIGZvciAoY29uc3Qgc3RhdGVFbnRyeSBvZiB0aGlzLnN0YXRlTWFwKSB7XG4gICAgICBjb25zdCBrbGFzcyA9IHN0YXRlRW50cnlbMF07XG4gICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlRW50cnlbMV07XG5cbiAgICAgIGlmIChzdGF0ZS5jaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBzdGF0ZS5lbmFibGVkKTtcbiAgICAgICAgc3RhdGUuY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmICghc3RhdGUudG91Y2hlZCkge1xuICAgICAgICAvLyBBIGNsYXNzIHRoYXQgd2FzIHByZXZpb3VzbHkgYWN0aXZlIGdvdCByZW1vdmVkIGZyb20gdGhlIG5ldyBjb2xsZWN0aW9uIG9mIGNsYXNzZXMgLVxuICAgICAgICAvLyByZW1vdmUgZnJvbSB0aGUgRE9NIGFzIHdlbGwuXG4gICAgICAgIGlmIChzdGF0ZS5lbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0YXRlTWFwLmRlbGV0ZShrbGFzcyk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRlLnRvdWNoZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90b2dnbGVDbGFzcyhrbGFzczogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgaWYgKHR5cGVvZiBrbGFzcyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYE5nQ2xhc3MgY2FuIG9ubHkgdG9nZ2xlIENTUyBjbGFzc2VzIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBnb3QgJHtzdHJpbmdpZnkoa2xhc3MpfWApO1xuICAgICAgfVxuICAgIH1cbiAgICBrbGFzcyA9IGtsYXNzLnRyaW0oKTtcbiAgICBpZiAoa2xhc3MubGVuZ3RoID4gMCkge1xuICAgICAga2xhc3Muc3BsaXQoV1NfUkVHRVhQKS5mb3JFYWNoKGtsYXNzID0+IHtcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=