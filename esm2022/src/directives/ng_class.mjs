/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, Renderer2, ɵstringify as stringify, } from '@angular/core';
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
            klass.split(WS_REGEXP).forEach((klass) => {
                if (enabled) {
                    this._renderer.addClass(this._ngEl.nativeElement, klass);
                }
                else {
                    this._renderer.removeClass(this._ngEl.nativeElement, klass);
                }
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgClass, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", type: NgClass, isStandalone: true, selector: "[ngClass]", inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgClass, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUNMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsS0FBSyxFQUdMLFNBQVMsRUFDVCxVQUFVLElBQUksU0FBUyxHQUN4QixNQUFNLGVBQWUsQ0FBQzs7QUFJdkIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBRXhCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztBQWtCakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUtILE1BQU0sT0FBTyxPQUFPO0lBTWxCLFlBQ1UsS0FBaUIsRUFDakIsU0FBb0I7UUFEcEIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUNqQixjQUFTLEdBQVQsU0FBUyxDQUFXO1FBUHRCLG1CQUFjLEdBQUcsV0FBVyxDQUFDO1FBRzdCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztJQUtqRCxDQUFDO0lBRUosSUFDSSxLQUFLLENBQUMsS0FBYTtRQUNyQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztJQUNwRixDQUFDO0lBRUQsSUFDSSxPQUFPLENBQUMsS0FBa0Y7UUFDNUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNwRixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCRztJ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LENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDcEYsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO1FBQ0QsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDckIsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxPQUFPLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0QsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQzt5SEF2SFUsT0FBTzs2R0FBUCxPQUFPOztzR0FBUCxPQUFPO2tCQUpuQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxXQUFXO29CQUNyQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7dUdBYUssS0FBSztzQkFEUixLQUFLO3VCQUFDLE9BQU87Z0JBTVYsT0FBTztzQkFEVixLQUFLO3VCQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgSW5wdXQsXG4gIEl0ZXJhYmxlRGlmZmVycyxcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBSZW5kZXJlcjIsXG4gIMm1c3RyaW5naWZ5IGFzIHN0cmluZ2lmeSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbnR5cGUgTmdDbGFzc1N1cHBvcnRlZFR5cGVzID0gc3RyaW5nW10gfCBTZXQ8c3RyaW5nPiB8IHtba2xhc3M6IHN0cmluZ106IGFueX0gfCBudWxsIHwgdW5kZWZpbmVkO1xuXG5jb25zdCBXU19SRUdFWFAgPSAvXFxzKy87XG5cbmNvbnN0IEVNUFRZX0FSUkFZOiBzdHJpbmdbXSA9IFtdO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgaW50ZXJuYWwgb2JqZWN0IHVzZWQgdG8gdHJhY2sgc3RhdGUgb2YgZWFjaCBDU1MgY2xhc3MuIFRoZXJlIGFyZSAzIGRpZmZlcmVudCAoYm9vbGVhbilcbiAqIGZsYWdzIHRoYXQsIGNvbWJpbmVkIHRvZ2V0aGVyLCBpbmRpY2F0ZSBzdGF0ZSBvZiBhIGdpdmVuIENTUyBjbGFzczpcbiAqIC0gZW5hYmxlZDogaW5kaWNhdGVzIGlmIGEgY2xhc3Mgc2hvdWxkIGJlIHByZXNlbnQgaW4gdGhlIERPTSAodHJ1ZSkgb3Igbm90IChmYWxzZSk7XG4gKiAtIGNoYW5nZWQ6IHRyYWNrcyBpZiBhIGNsYXNzIHdhcyB0b2dnbGVkIChhZGRlZCBvciByZW1vdmVkKSBkdXJpbmcgdGhlIGN1c3RvbSBkaXJ0eS1jaGVja2luZ1xuICogcHJvY2VzczsgY2hhbmdlZCBjbGFzc2VzIG11c3QgYmUgc3luY2hyb25pemVkIHdpdGggdGhlIERPTTtcbiAqIC0gdG91Y2hlZDogdHJhY2tzIGlmIGEgY2xhc3MgaXMgcHJlc2VudCBpbiB0aGUgY3VycmVudCBvYmplY3QgYm91bmQgdG8gdGhlIGNsYXNzIC8gbmdDbGFzcyBpbnB1dDtcbiAqIGNsYXNzZXMgdGhhdCBhcmUgbm90IHByZXNlbnQgYW55IG1vcmUgY2FuIGJlIHJlbW92ZWQgZnJvbSB0aGUgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmVzO1xuICovXG5pbnRlcmZhY2UgQ3NzQ2xhc3NTdGF0ZSB7XG4gIC8vIFBFUkY6IGNvdWxkIHVzZSBhIGJpdCBtYXNrIHRvIHJlcHJlc2VudCBzdGF0ZSBhcyBhbGwgZmllbGRzIGFyZSBib29sZWFuIGZsYWdzXG4gIGVuYWJsZWQ6IGJvb2xlYW47XG4gIGNoYW5nZWQ6IGJvb2xlYW47XG4gIHRvdWNoZWQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIidmaXJzdCBzZWNvbmQnXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwiWydmaXJzdCcsICdzZWNvbmQnXVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInsnZmlyc3QnOiB0cnVlLCAnc2Vjb25kJzogdHJ1ZSwgJ3RoaXJkJzogZmFsc2V9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwic3RyaW5nRXhwfGFycmF5RXhwfG9iakV4cFwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInsnY2xhc3MxIGNsYXNzMiBjbGFzczMnIDogdHJ1ZX1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFkZHMgYW5kIHJlbW92ZXMgQ1NTIGNsYXNzZXMgb24gYW4gSFRNTCBlbGVtZW50LlxuICpcbiAqIFRoZSBDU1MgY2xhc3NlcyBhcmUgdXBkYXRlZCBhcyBmb2xsb3dzLCBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdGhlIGV4cHJlc3Npb24gZXZhbHVhdGlvbjpcbiAqIC0gYHN0cmluZ2AgLSB0aGUgQ1NTIGNsYXNzZXMgbGlzdGVkIGluIHRoZSBzdHJpbmcgKHNwYWNlIGRlbGltaXRlZCkgYXJlIGFkZGVkLFxuICogLSBgQXJyYXlgIC0gdGhlIENTUyBjbGFzc2VzIGRlY2xhcmVkIGFzIEFycmF5IGVsZW1lbnRzIGFyZSBhZGRlZCxcbiAqIC0gYE9iamVjdGAgLSBrZXlzIGFyZSBDU1MgY2xhc3NlcyB0aGF0IGdldCBhZGRlZCB3aGVuIHRoZSBleHByZXNzaW9uIGdpdmVuIGluIHRoZSB2YWx1ZVxuICogICAgICAgICAgICAgIGV2YWx1YXRlcyB0byBhIHRydXRoeSB2YWx1ZSwgb3RoZXJ3aXNlIHRoZXkgYXJlIHJlbW92ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdDbGFzc10nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ0NsYXNzIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIHByaXZhdGUgaW5pdGlhbENsYXNzZXMgPSBFTVBUWV9BUlJBWTtcbiAgcHJpdmF0ZSByYXdDbGFzczogTmdDbGFzc1N1cHBvcnRlZFR5cGVzO1xuXG4gIHByaXZhdGUgc3RhdGVNYXAgPSBuZXcgTWFwPHN0cmluZywgQ3NzQ2xhc3NTdGF0ZT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICkge31cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmluaXRpYWxDbGFzc2VzID0gdmFsdWUgIT0gbnVsbCA/IHZhbHVlLnRyaW0oKS5zcGxpdChXU19SRUdFWFApIDogRU1QVFlfQVJSQVk7XG4gIH1cblxuICBASW5wdXQoJ25nQ2xhc3MnKVxuICBzZXQgbmdDbGFzcyh2YWx1ZTogc3RyaW5nIHwgc3RyaW5nW10gfCBTZXQ8c3RyaW5nPiB8IHtba2xhc3M6IHN0cmluZ106IGFueX0gfCBudWxsIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5yYXdDbGFzcyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS50cmltKCkuc3BsaXQoV1NfUkVHRVhQKSA6IHZhbHVlO1xuICB9XG5cbiAgLypcbiAgVGhlIE5nQ2xhc3MgZGlyZWN0aXZlIHVzZXMgdGhlIGN1c3RvbSBjaGFuZ2UgZGV0ZWN0aW9uIGFsZ29yaXRobSBmb3IgaXRzIGlucHV0cy4gVGhlIGN1c3RvbVxuICBhbGdvcml0aG0gaXMgbmVjZXNzYXJ5IHNpbmNlIGlucHV0cyBhcmUgcmVwcmVzZW50ZWQgYXMgY29tcGxleCBvYmplY3Qgb3IgYXJyYXlzIHRoYXQgbmVlZCB0byBiZVxuICBkZWVwbHktY29tcGFyZWQuXG5cbiAgVGhpcyBhbGdvcml0aG0gaXMgcGVyZi1zZW5zaXRpdmUgc2luY2UgTmdDbGFzcyBpcyB1c2VkIHZlcnkgZnJlcXVlbnRseSBhbmQgaXRzIHBvb3IgcGVyZm9ybWFuY2VcbiAgbWlnaHQgbmVnYXRpdmVseSBpbXBhY3QgcnVudGltZSBwZXJmb3JtYW5jZSBvZiB0aGUgZW50aXJlIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUuIFRoZSBkZXNpZ24gb2ZcbiAgdGhpcyBhbGdvcml0aG0gaXMgbWFraW5nIHN1cmUgdGhhdDpcbiAgLSB0aGVyZSBpcyBubyB1bm5lY2Vzc2FyeSBET00gbWFuaXB1bGF0aW9uIChDU1MgY2xhc3NlcyBhcmUgYWRkZWQgLyByZW1vdmVkIGZyb20gdGhlIERPTSBvbmx5IHdoZW5cbiAgbmVlZGVkKSwgZXZlbiBpZiByZWZlcmVuY2VzIHRvIGJvdW5kIG9iamVjdHMgY2hhbmdlO1xuICAtIHRoZXJlIGlzIG5vIG1lbW9yeSBhbGxvY2F0aW9uIGlmIG5vdGhpbmcgY2hhbmdlcyAoZXZlbiByZWxhdGl2ZWx5IG1vZGVzdCBtZW1vcnkgYWxsb2NhdGlvblxuICBkdXJpbmcgdGhlIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgY2FuIHJlc3VsdCBpbiBHQyBwYXVzZXMgZm9yIHNvbWUgb2YgdGhlIENEIGN5Y2xlcykuXG5cbiAgVGhlIGFsZ29yaXRobSB3b3JrcyBieSBpdGVyYXRpbmcgb3ZlciB0aGUgc2V0IG9mIGJvdW5kIGNsYXNzZXMsIHN0YXJpbmcgd2l0aCBbY2xhc3NdIGJpbmRpbmcgYW5kXG4gIHRoZW4gZ29pbmcgb3ZlciBbbmdDbGFzc10gYmluZGluZy4gRm9yIGVhY2ggQ1NTIGNsYXNzIG5hbWU6XG4gIC0gY2hlY2sgaWYgaXQgd2FzIHNlZW4gYmVmb3JlICh0aGlzIGluZm9ybWF0aW9uIGlzIHRyYWNrZWQgaW4gdGhlIHN0YXRlIG1hcCkgYW5kIGlmIGl0cyB2YWx1ZVxuICBjaGFuZ2VkO1xuICAtIG1hcmsgaXQgYXMgXCJ0b3VjaGVkXCIgLSBuYW1lcyB0aGF0IGFyZSBub3QgbWFya2VkIGFyZSBub3QgcHJlc2VudCBpbiB0aGUgbGF0ZXN0IHNldCBvZiBiaW5kaW5nXG4gIGFuZCB3ZSBjYW4gcmVtb3ZlIHN1Y2ggY2xhc3MgbmFtZSBmcm9tIHRoZSBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZXM7XG5cbiAgQWZ0ZXIgaXRlcmF0aW9uIG92ZXIgYWxsIHRoZSBDU1MgY2xhc3MgbmFtZXMgd2UndmUgZ290IGRhdGEgc3RydWN0dXJlIHdpdGggYWxsIHRoZSBpbmZvcm1hdGlvblxuICBuZWNlc3NhcnkgdG8gc3luY2hyb25pemUgY2hhbmdlcyB0byB0aGUgRE9NIC0gaXQgaXMgZW5vdWdoIHRvIGl0ZXJhdGUgb3ZlciB0aGUgc3RhdGUgbWFwLCBmbHVzaFxuICBjaGFuZ2VzIHRvIHRoZSBET00gYW5kIHJlc2V0IGludGVybmFsIGRhdGEgc3RydWN0dXJlcyBzbyB0aG9zZSBhcmUgcmVhZHkgZm9yIHRoZSBuZXh0IGNoYW5nZVxuICBkZXRlY3Rpb24gY3ljbGUuXG4gICAqL1xuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgLy8gY2xhc3NlcyBmcm9tIHRoZSBbY2xhc3NdIGJpbmRpbmdcbiAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIHRoaXMuaW5pdGlhbENsYXNzZXMpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKGtsYXNzLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBjbGFzc2VzIGZyb20gdGhlIFtuZ0NsYXNzXSBiaW5kaW5nXG4gICAgY29uc3QgcmF3Q2xhc3MgPSB0aGlzLnJhd0NsYXNzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0NsYXNzKSB8fCByYXdDbGFzcyBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiByYXdDbGFzcykge1xuICAgICAgICB0aGlzLl91cGRhdGVTdGF0ZShrbGFzcywgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChyYXdDbGFzcyAhPSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIE9iamVjdC5rZXlzKHJhd0NsYXNzKSkge1xuICAgICAgICB0aGlzLl91cGRhdGVTdGF0ZShrbGFzcywgQm9vbGVhbihyYXdDbGFzc1trbGFzc10pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseVN0YXRlRGlmZigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU3RhdGUoa2xhc3M6IHN0cmluZywgbmV4dEVuYWJsZWQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuc3RhdGVNYXAuZ2V0KGtsYXNzKTtcbiAgICBpZiAoc3RhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHN0YXRlLmVuYWJsZWQgIT09IG5leHRFbmFibGVkKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBzdGF0ZS5lbmFibGVkID0gbmV4dEVuYWJsZWQ7XG4gICAgICB9XG4gICAgICBzdGF0ZS50b3VjaGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGF0ZU1hcC5zZXQoa2xhc3MsIHtlbmFibGVkOiBuZXh0RW5hYmxlZCwgY2hhbmdlZDogdHJ1ZSwgdG91Y2hlZDogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U3RhdGVEaWZmKCkge1xuICAgIGZvciAoY29uc3Qgc3RhdGVFbnRyeSBvZiB0aGlzLnN0YXRlTWFwKSB7XG4gICAgICBjb25zdCBrbGFzcyA9IHN0YXRlRW50cnlbMF07XG4gICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlRW50cnlbMV07XG5cbiAgICAgIGlmIChzdGF0ZS5jaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBzdGF0ZS5lbmFibGVkKTtcbiAgICAgICAgc3RhdGUuY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmICghc3RhdGUudG91Y2hlZCkge1xuICAgICAgICAvLyBBIGNsYXNzIHRoYXQgd2FzIHByZXZpb3VzbHkgYWN0aXZlIGdvdCByZW1vdmVkIGZyb20gdGhlIG5ldyBjb2xsZWN0aW9uIG9mIGNsYXNzZXMgLVxuICAgICAgICAvLyByZW1vdmUgZnJvbSB0aGUgRE9NIGFzIHdlbGwuXG4gICAgICAgIGlmIChzdGF0ZS5lbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0YXRlTWFwLmRlbGV0ZShrbGFzcyk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRlLnRvdWNoZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90b2dnbGVDbGFzcyhrbGFzczogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgaWYgKHR5cGVvZiBrbGFzcyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBOZ0NsYXNzIGNhbiBvbmx5IHRvZ2dsZSBDU1MgY2xhc3NlcyBleHByZXNzZWQgYXMgc3RyaW5ncywgZ290ICR7c3RyaW5naWZ5KGtsYXNzKX1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICBrbGFzcyA9IGtsYXNzLnRyaW0oKTtcbiAgICBpZiAoa2xhc3MubGVuZ3RoID4gMCkge1xuICAgICAga2xhc3Muc3BsaXQoV1NfUkVHRVhQKS5mb3JFYWNoKChrbGFzcykgPT4ge1xuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==