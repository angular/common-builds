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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-e227275", ngImport: i0, type: NgClass, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0-next.0+sha-e227275", type: NgClass, isStandalone: true, selector: "[ngClass]", inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0-next.0+sha-e227275", ngImport: i0, type: NgClass, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsS0FBSyxFQUFvQyxTQUFTLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFJMUksTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBRXhCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztBQWtCakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUtILE1BQU0sT0FBTyxPQUFPO0lBTWxCLFlBQW9CLEtBQWlCLEVBQVUsU0FBb0I7UUFBL0MsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFMM0QsbUJBQWMsR0FBRyxXQUFXLENBQUM7UUFHN0IsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO0lBRWtCLENBQUM7SUFFdkUsSUFDSSxLQUFLLENBQUMsS0FBYTtRQUNyQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztJQUNwRixDQUFDO0lBRUQsSUFDSSxPQUFPLENBQUMsS0FBd0U7UUFDbEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNwRixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCRztJ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LENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNGLENBQUM7UUFDSCxDQUFDO1FBQ0QsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDckIsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzNELENBQUM7cUJBQU0sQ0FBQztvQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDOUQsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7eUhBbkhVLE9BQU87NkdBQVAsT0FBTzs7c0dBQVAsT0FBTztrQkFKbkIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsV0FBVztvQkFDckIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO3VHQVVLLEtBQUs7c0JBRFIsS0FBSzt1QkFBQyxPQUFPO2dCQU1WLE9BQU87c0JBRFYsS0FBSzt1QkFBQyxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRWxlbWVudFJlZiwgSW5wdXQsIEl0ZXJhYmxlRGlmZmVycywgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjIsIMm1c3RyaW5naWZ5IGFzIHN0cmluZ2lmeX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbnR5cGUgTmdDbGFzc1N1cHBvcnRlZFR5cGVzID0gc3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fXxudWxsfHVuZGVmaW5lZDtcblxuY29uc3QgV1NfUkVHRVhQID0gL1xccysvO1xuXG5jb25zdCBFTVBUWV9BUlJBWTogc3RyaW5nW10gPSBbXTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGludGVybmFsIG9iamVjdCB1c2VkIHRvIHRyYWNrIHN0YXRlIG9mIGVhY2ggQ1NTIGNsYXNzLiBUaGVyZSBhcmUgMyBkaWZmZXJlbnQgKGJvb2xlYW4pXG4gKiBmbGFncyB0aGF0LCBjb21iaW5lZCB0b2dldGhlciwgaW5kaWNhdGUgc3RhdGUgb2YgYSBnaXZlbiBDU1MgY2xhc3M6XG4gKiAtIGVuYWJsZWQ6IGluZGljYXRlcyBpZiBhIGNsYXNzIHNob3VsZCBiZSBwcmVzZW50IGluIHRoZSBET00gKHRydWUpIG9yIG5vdCAoZmFsc2UpO1xuICogLSBjaGFuZ2VkOiB0cmFja3MgaWYgYSBjbGFzcyB3YXMgdG9nZ2xlZCAoYWRkZWQgb3IgcmVtb3ZlZCkgZHVyaW5nIHRoZSBjdXN0b20gZGlydHktY2hlY2tpbmdcbiAqIHByb2Nlc3M7IGNoYW5nZWQgY2xhc3NlcyBtdXN0IGJlIHN5bmNocm9uaXplZCB3aXRoIHRoZSBET007XG4gKiAtIHRvdWNoZWQ6IHRyYWNrcyBpZiBhIGNsYXNzIGlzIHByZXNlbnQgaW4gdGhlIGN1cnJlbnQgb2JqZWN0IGJvdW5kIHRvIHRoZSBjbGFzcyAvIG5nQ2xhc3MgaW5wdXQ7XG4gKiBjbGFzc2VzIHRoYXQgYXJlIG5vdCBwcmVzZW50IGFueSBtb3JlIGNhbiBiZSByZW1vdmVkIGZyb20gdGhlIGludGVybmFsIGRhdGEgc3RydWN0dXJlcztcbiAqL1xuaW50ZXJmYWNlIENzc0NsYXNzU3RhdGUge1xuICAvLyBQRVJGOiBjb3VsZCB1c2UgYSBiaXQgbWFzayB0byByZXByZXNlbnQgc3RhdGUgYXMgYWxsIGZpZWxkcyBhcmUgYm9vbGVhbiBmbGFnc1xuICBlbmFibGVkOiBib29sZWFuO1xuICBjaGFuZ2VkOiBib29sZWFuO1xuICB0b3VjaGVkOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nQ2xhc3NdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIGluaXRpYWxDbGFzc2VzID0gRU1QVFlfQVJSQVk7XG4gIHByaXZhdGUgcmF3Q2xhc3M6IE5nQ2xhc3NTdXBwb3J0ZWRUeXBlcztcblxuICBwcml2YXRlIHN0YXRlTWFwID0gbmV3IE1hcDxzdHJpbmcsIENzc0NsYXNzU3RhdGU+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMikge31cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmluaXRpYWxDbGFzc2VzID0gdmFsdWUgIT0gbnVsbCA/IHZhbHVlLnRyaW0oKS5zcGxpdChXU19SRUdFWFApIDogRU1QVFlfQVJSQVk7XG4gIH1cblxuICBASW5wdXQoJ25nQ2xhc3MnKVxuICBzZXQgbmdDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX18bnVsbHx1bmRlZmluZWQpIHtcbiAgICB0aGlzLnJhd0NsYXNzID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKS5zcGxpdChXU19SRUdFWFApIDogdmFsdWU7XG4gIH1cblxuICAvKlxuICBUaGUgTmdDbGFzcyBkaXJlY3RpdmUgdXNlcyB0aGUgY3VzdG9tIGNoYW5nZSBkZXRlY3Rpb24gYWxnb3JpdGhtIGZvciBpdHMgaW5wdXRzLiBUaGUgY3VzdG9tXG4gIGFsZ29yaXRobSBpcyBuZWNlc3Nhcnkgc2luY2UgaW5wdXRzIGFyZSByZXByZXNlbnRlZCBhcyBjb21wbGV4IG9iamVjdCBvciBhcnJheXMgdGhhdCBuZWVkIHRvIGJlXG4gIGRlZXBseS1jb21wYXJlZC5cblxuICBUaGlzIGFsZ29yaXRobSBpcyBwZXJmLXNlbnNpdGl2ZSBzaW5jZSBOZ0NsYXNzIGlzIHVzZWQgdmVyeSBmcmVxdWVudGx5IGFuZCBpdHMgcG9vciBwZXJmb3JtYW5jZVxuICBtaWdodCBuZWdhdGl2ZWx5IGltcGFjdCBydW50aW1lIHBlcmZvcm1hbmNlIG9mIHRoZSBlbnRpcmUgY2hhbmdlIGRldGVjdGlvbiBjeWNsZS4gVGhlIGRlc2lnbiBvZlxuICB0aGlzIGFsZ29yaXRobSBpcyBtYWtpbmcgc3VyZSB0aGF0OlxuICAtIHRoZXJlIGlzIG5vIHVubmVjZXNzYXJ5IERPTSBtYW5pcHVsYXRpb24gKENTUyBjbGFzc2VzIGFyZSBhZGRlZCAvIHJlbW92ZWQgZnJvbSB0aGUgRE9NIG9ubHkgd2hlblxuICBuZWVkZWQpLCBldmVuIGlmIHJlZmVyZW5jZXMgdG8gYm91bmQgb2JqZWN0cyBjaGFuZ2U7XG4gIC0gdGhlcmUgaXMgbm8gbWVtb3J5IGFsbG9jYXRpb24gaWYgbm90aGluZyBjaGFuZ2VzIChldmVuIHJlbGF0aXZlbHkgbW9kZXN0IG1lbW9yeSBhbGxvY2F0aW9uXG4gIGR1cmluZyB0aGUgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBjYW4gcmVzdWx0IGluIEdDIHBhdXNlcyBmb3Igc29tZSBvZiB0aGUgQ0QgY3ljbGVzKS5cblxuICBUaGUgYWxnb3JpdGhtIHdvcmtzIGJ5IGl0ZXJhdGluZyBvdmVyIHRoZSBzZXQgb2YgYm91bmQgY2xhc3Nlcywgc3RhcmluZyB3aXRoIFtjbGFzc10gYmluZGluZyBhbmRcbiAgdGhlbiBnb2luZyBvdmVyIFtuZ0NsYXNzXSBiaW5kaW5nLiBGb3IgZWFjaCBDU1MgY2xhc3MgbmFtZTpcbiAgLSBjaGVjayBpZiBpdCB3YXMgc2VlbiBiZWZvcmUgKHRoaXMgaW5mb3JtYXRpb24gaXMgdHJhY2tlZCBpbiB0aGUgc3RhdGUgbWFwKSBhbmQgaWYgaXRzIHZhbHVlXG4gIGNoYW5nZWQ7XG4gIC0gbWFyayBpdCBhcyBcInRvdWNoZWRcIiAtIG5hbWVzIHRoYXQgYXJlIG5vdCBtYXJrZWQgYXJlIG5vdCBwcmVzZW50IGluIHRoZSBsYXRlc3Qgc2V0IG9mIGJpbmRpbmdcbiAgYW5kIHdlIGNhbiByZW1vdmUgc3VjaCBjbGFzcyBuYW1lIGZyb20gdGhlIGludGVybmFsIGRhdGEgc3RydWN0dXJlcztcblxuICBBZnRlciBpdGVyYXRpb24gb3ZlciBhbGwgdGhlIENTUyBjbGFzcyBuYW1lcyB3ZSd2ZSBnb3QgZGF0YSBzdHJ1Y3R1cmUgd2l0aCBhbGwgdGhlIGluZm9ybWF0aW9uXG4gIG5lY2Vzc2FyeSB0byBzeW5jaHJvbml6ZSBjaGFuZ2VzIHRvIHRoZSBET00gLSBpdCBpcyBlbm91Z2ggdG8gaXRlcmF0ZSBvdmVyIHRoZSBzdGF0ZSBtYXAsIGZsdXNoXG4gIGNoYW5nZXMgdG8gdGhlIERPTSBhbmQgcmVzZXQgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmVzIHNvIHRob3NlIGFyZSByZWFkeSBmb3IgdGhlIG5leHQgY2hhbmdlXG4gIGRldGVjdGlvbiBjeWNsZS5cbiAgICovXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICAvLyBjbGFzc2VzIGZyb20gdGhlIFtjbGFzc10gYmluZGluZ1xuICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgdGhpcy5pbml0aWFsQ2xhc3Nlcykge1xuICAgICAgdGhpcy5fdXBkYXRlU3RhdGUoa2xhc3MsIHRydWUpO1xuICAgIH1cblxuICAgIC8vIGNsYXNzZXMgZnJvbSB0aGUgW25nQ2xhc3NdIGJpbmRpbmdcbiAgICBjb25zdCByYXdDbGFzcyA9IHRoaXMucmF3Q2xhc3M7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmF3Q2xhc3MpIHx8IHJhd0NsYXNzIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIHJhd0NsYXNzKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKGtsYXNzLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJhd0NsYXNzICE9IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgT2JqZWN0LmtleXMocmF3Q2xhc3MpKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKGtsYXNzLCBCb29sZWFuKHJhd0NsYXNzW2tsYXNzXSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2FwcGx5U3RhdGVEaWZmKCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVTdGF0ZShrbGFzczogc3RyaW5nLCBuZXh0RW5hYmxlZDogYm9vbGVhbikge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5zdGF0ZU1hcC5nZXQoa2xhc3MpO1xuICAgIGlmIChzdGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoc3RhdGUuZW5hYmxlZCAhPT0gbmV4dEVuYWJsZWQpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIHN0YXRlLmVuYWJsZWQgPSBuZXh0RW5hYmxlZDtcbiAgICAgIH1cbiAgICAgIHN0YXRlLnRvdWNoZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXRlTWFwLnNldChrbGFzcywge2VuYWJsZWQ6IG5leHRFbmFibGVkLCBjaGFuZ2VkOiB0cnVlLCB0b3VjaGVkOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTdGF0ZURpZmYoKSB7XG4gICAgZm9yIChjb25zdCBzdGF0ZUVudHJ5IG9mIHRoaXMuc3RhdGVNYXApIHtcbiAgICAgIGNvbnN0IGtsYXNzID0gc3RhdGVFbnRyeVswXTtcbiAgICAgIGNvbnN0IHN0YXRlID0gc3RhdGVFbnRyeVsxXTtcblxuICAgICAgaWYgKHN0YXRlLmNoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIHN0YXRlLmVuYWJsZWQpO1xuICAgICAgICBzdGF0ZS5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKCFzdGF0ZS50b3VjaGVkKSB7XG4gICAgICAgIC8vIEEgY2xhc3MgdGhhdCB3YXMgcHJldmlvdXNseSBhY3RpdmUgZ290IHJlbW92ZWQgZnJvbSB0aGUgbmV3IGNvbGxlY3Rpb24gb2YgY2xhc3NlcyAtXG4gICAgICAgIC8vIHJlbW92ZSBmcm9tIHRoZSBET00gYXMgd2VsbC5cbiAgICAgICAgaWYgKHN0YXRlLmVuYWJsZWQpIHtcbiAgICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGVNYXAuZGVsZXRlKGtsYXNzKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGUudG91Y2hlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RvZ2dsZUNsYXNzKGtsYXNzOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBpZiAodHlwZW9mIGtsYXNzICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgTmdDbGFzcyBjYW4gb25seSB0b2dnbGUgQ1NTIGNsYXNzZXMgZXhwcmVzc2VkIGFzIHN0cmluZ3MsIGdvdCAke3N0cmluZ2lmeShrbGFzcyl9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIGtsYXNzID0ga2xhc3MudHJpbSgpO1xuICAgIGlmIChrbGFzcy5sZW5ndGggPiAwKSB7XG4gICAgICBrbGFzcy5zcGxpdChXU19SRUdFWFApLmZvckVhY2goa2xhc3MgPT4ge1xuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==