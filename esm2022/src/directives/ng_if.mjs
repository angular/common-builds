/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, TemplateRef, ViewContainerRef, ɵstringify as stringify, } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * A structural directive that conditionally includes a template based on the value of
 * an expression coerced to Boolean.
 * When the expression evaluates to true, Angular renders the template
 * provided in a `then` clause, and when  false or null,
 * Angular renders the template provided in an optional `else` clause. The default
 * template for the `else` clause is blank.
 *
 * A [shorthand form](guide/structural-directives#asterisk) of the directive,
 * `*ngIf="condition"`, is generally used, provided
 * as an attribute of the anchor element for the inserted template.
 * Angular expands this into a more explicit version, in which the anchor element
 * is contained in an `<ng-template>` element.
 *
 * Simple form with shorthand syntax:
 *
 * ```
 * <div *ngIf="condition">Content to render when condition is true.</div>
 * ```
 *
 * Simple form with expanded syntax:
 *
 * ```
 * <ng-template [ngIf]="condition"><div>Content to render when condition is
 * true.</div></ng-template>
 * ```
 *
 * Form with an "else" block:
 *
 * ```
 * <div *ngIf="condition; else elseBlock">Content to render when condition is true.</div>
 * <ng-template #elseBlock>Content to render when condition is false.</ng-template>
 * ```
 *
 * Shorthand form with "then" and "else" blocks:
 *
 * ```
 * <div *ngIf="condition; then thenBlock else elseBlock"></div>
 * <ng-template #thenBlock>Content to render when condition is true.</ng-template>
 * <ng-template #elseBlock>Content to render when condition is false.</ng-template>
 * ```
 *
 * Form with storing the value locally:
 *
 * ```
 * <div *ngIf="condition as value; else elseBlock">{{value}}</div>
 * <ng-template #elseBlock>Content to render when value is null.</ng-template>
 * ```
 *
 * @usageNotes
 *
 * The `*ngIf` directive is most commonly used to conditionally show an inline template,
 * as seen in the following  example.
 * The default `else` template is blank.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfSimple'}
 *
 * ### Showing an alternative template using `else`
 *
 * To display a template when `expression` evaluates to false, use an `else` template
 * binding as shown in the following example.
 * The `else` binding points to an `<ng-template>`  element labeled `#elseBlock`.
 * The template can be defined anywhere in the component view, but is typically placed right after
 * `ngIf` for readability.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfElse'}
 *
 * ### Using an external `then` template
 *
 * In the previous example, the then-clause template is specified inline, as the content of the
 * tag that contains the `ngIf` directive. You can also specify a template that is defined
 * externally, by referencing a labeled `<ng-template>` element. When you do this, you can
 * change which template to use at runtime, as shown in the following example.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfThenElse'}
 *
 * ### Storing a conditional result in a variable
 *
 * You might want to show a set of properties from the same object. If you are waiting
 * for asynchronous data, the object can be undefined.
 * In this case, you can use `ngIf` and store the result of the condition in a local
 * variable as shown in the following example.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfAs'}
 *
 * This code uses only one `AsyncPipe`, so only one subscription is created.
 * The conditional statement stores the result of `userStream|async` in the local variable `user`.
 * You can then bind the local `user` repeatedly.
 *
 * The conditional displays the data only if `userStream` returns a value,
 * so you don't need to use the
 * safe-navigation-operator (`?.`)
 * to guard against null values when accessing properties.
 * You can display an alternative template while waiting for the data.
 *
 * ### Shorthand syntax
 *
 * The shorthand syntax `*ngIf` expands into two separate template specifications
 * for the "then" and "else" clauses. For example, consider the following shorthand statement,
 * that is meant to show a loading page while waiting for data to be loaded.
 *
 * ```
 * <div class="hero-list" *ngIf="heroes else loading">
 *  ...
 * </div>
 *
 * <ng-template #loading>
 *  <div>Loading...</div>
 * </ng-template>
 * ```
 *
 * You can see that the "else" clause references the `<ng-template>`
 * with the `#loading` label, and the template for the "then" clause
 * is provided as the content of the anchor element.
 *
 * However, when Angular expands the shorthand syntax, it creates
 * another `<ng-template>` tag, with `ngIf` and `ngIfElse` directives.
 * The anchor element containing the template for the "then" clause becomes
 * the content of this unlabeled `<ng-template>` tag.
 *
 * ```
 * <ng-template [ngIf]="heroes" [ngIfElse]="loading">
 *  <div class="hero-list">
 *   ...
 *  </div>
 * </ng-template>
 *
 * <ng-template #loading>
 *  <div>Loading...</div>
 * </ng-template>
 * ```
 *
 * The presence of the implicit template object has implications for the nesting of
 * structural directives. For more on this subject, see
 * [Structural Directives](guide/structural-directives#one-per-element).
 *
 * @ngModule CommonModule
 * @publicApi
 */
export class NgIf {
    constructor(_viewContainer, templateRef) {
        this._viewContainer = _viewContainer;
        this._context = new NgIfContext();
        this._thenTemplateRef = null;
        this._elseTemplateRef = null;
        this._thenViewRef = null;
        this._elseViewRef = null;
        this._thenTemplateRef = templateRef;
    }
    /**
     * The Boolean expression to evaluate as the condition for showing a template.
     */
    set ngIf(condition) {
        this._context.$implicit = this._context.ngIf = condition;
        this._updateView();
    }
    /**
     * A template to show if the condition expression evaluates to true.
     */
    set ngIfThen(templateRef) {
        assertTemplate('ngIfThen', templateRef);
        this._thenTemplateRef = templateRef;
        this._thenViewRef = null; // clear previous view if any.
        this._updateView();
    }
    /**
     * A template to show if the condition expression evaluates to false.
     */
    set ngIfElse(templateRef) {
        assertTemplate('ngIfElse', templateRef);
        this._elseTemplateRef = templateRef;
        this._elseViewRef = null; // clear previous view if any.
        this._updateView();
    }
    _updateView() {
        if (this._context.$implicit) {
            if (!this._thenViewRef) {
                this._viewContainer.clear();
                this._elseViewRef = null;
                if (this._thenTemplateRef) {
                    this._thenViewRef = this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
                }
            }
        }
        else {
            if (!this._elseViewRef) {
                this._viewContainer.clear();
                this._thenViewRef = null;
                if (this._elseTemplateRef) {
                    this._elseViewRef = this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
                }
            }
        }
    }
    /**
     * Asserts the correct type of the context for the template that `NgIf` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `NgIf` structural directive renders its template with a specific context type.
     */
    static ngTemplateContextGuard(dir, ctx) {
        return true;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.2+sha-924a276", ngImport: i0, type: NgIf, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.1.2+sha-924a276", type: NgIf, isStandalone: true, selector: "[ngIf]", inputs: { ngIf: "ngIf", ngIfThen: "ngIfThen", ngIfElse: "ngIfElse" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.2+sha-924a276", ngImport: i0, type: NgIf, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngIf]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }], propDecorators: { ngIf: [{
                type: Input
            }], ngIfThen: [{
                type: Input
            }], ngIfElse: [{
                type: Input
            }] } });
/**
 * @publicApi
 */
export class NgIfContext {
    constructor() {
        this.$implicit = null;
        this.ngIf = null;
    }
}
function assertTemplate(property, templateRef) {
    const isTemplateRefOrNull = !!(!templateRef || templateRef.createEmbeddedView);
    if (!isTemplateRefOrNull) {
        throw new Error(`${property} must be a TemplateRef, but received '${stringify(templateRef)}'.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfaWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFFVCxLQUFLLEVBQ0wsV0FBVyxFQUNYLGdCQUFnQixFQUNoQixVQUFVLElBQUksU0FBUyxHQUN4QixNQUFNLGVBQWUsQ0FBQzs7QUFFdkI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBJRztBQUtILE1BQU0sT0FBTyxJQUFJO0lBT2YsWUFDVSxjQUFnQyxFQUN4QyxXQUF3QztRQURoQyxtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7UUFQbEMsYUFBUSxHQUFtQixJQUFJLFdBQVcsRUFBSyxDQUFDO1FBQ2hELHFCQUFnQixHQUF1QyxJQUFJLENBQUM7UUFDNUQscUJBQWdCLEdBQXVDLElBQUksQ0FBQztRQUM1RCxpQkFBWSxHQUEyQyxJQUFJLENBQUM7UUFDNUQsaUJBQVksR0FBMkMsSUFBSSxDQUFDO1FBTWxFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7SUFDdEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFDSSxJQUFJLENBQUMsU0FBWTtRQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFDekQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQ0ksUUFBUSxDQUFDLFdBQStDO1FBQzFELGNBQWMsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLDhCQUE4QjtRQUN4RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFDSSxRQUFRLENBQUMsV0FBK0M7UUFDMUQsY0FBYyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUMsOEJBQThCO1FBQ3hELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRU8sV0FBVztRQUNqQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FDeEQsSUFBSSxDQUFDLGdCQUFnQixFQUNyQixJQUFJLENBQUMsUUFBUSxDQUNkLENBQUM7Z0JBQ0osQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQ3hELElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FDZCxDQUFDO2dCQUNKLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFlRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxzQkFBc0IsQ0FDM0IsR0FBWSxFQUNaLEdBQVE7UUFFUixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7eUhBL0ZVLElBQUk7NkdBQUosSUFBSTs7c0dBQUosSUFBSTtrQkFKaEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOytHQW1CSyxJQUFJO3NCQURQLEtBQUs7Z0JBVUYsUUFBUTtzQkFEWCxLQUFLO2dCQVlGLFFBQVE7c0JBRFgsS0FBSzs7QUE2RFI7O0dBRUc7QUFDSCxNQUFNLE9BQU8sV0FBVztJQUF4QjtRQUNTLGNBQVMsR0FBTSxJQUFLLENBQUM7UUFDckIsU0FBSSxHQUFNLElBQUssQ0FBQztJQUN6QixDQUFDO0NBQUE7QUFFRCxTQUFTLGNBQWMsQ0FBQyxRQUFnQixFQUFFLFdBQW9DO0lBQzVFLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDL0UsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLFFBQVEseUNBQXlDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEcsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIElucHV0LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgybVzdHJpbmdpZnkgYXMgc3RyaW5naWZ5LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBBIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHRoYXQgY29uZGl0aW9uYWxseSBpbmNsdWRlcyBhIHRlbXBsYXRlIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZlxuICogYW4gZXhwcmVzc2lvbiBjb2VyY2VkIHRvIEJvb2xlYW4uXG4gKiBXaGVuIHRoZSBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0cnVlLCBBbmd1bGFyIHJlbmRlcnMgdGhlIHRlbXBsYXRlXG4gKiBwcm92aWRlZCBpbiBhIGB0aGVuYCBjbGF1c2UsIGFuZCB3aGVuICBmYWxzZSBvciBudWxsLFxuICogQW5ndWxhciByZW5kZXJzIHRoZSB0ZW1wbGF0ZSBwcm92aWRlZCBpbiBhbiBvcHRpb25hbCBgZWxzZWAgY2xhdXNlLiBUaGUgZGVmYXVsdFxuICogdGVtcGxhdGUgZm9yIHRoZSBgZWxzZWAgY2xhdXNlIGlzIGJsYW5rLlxuICpcbiAqIEEgW3Nob3J0aGFuZCBmb3JtXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjYXN0ZXJpc2spIG9mIHRoZSBkaXJlY3RpdmUsXG4gKiBgKm5nSWY9XCJjb25kaXRpb25cImAsIGlzIGdlbmVyYWxseSB1c2VkLCBwcm92aWRlZFxuICogYXMgYW4gYXR0cmlidXRlIG9mIHRoZSBhbmNob3IgZWxlbWVudCBmb3IgdGhlIGluc2VydGVkIHRlbXBsYXRlLlxuICogQW5ndWxhciBleHBhbmRzIHRoaXMgaW50byBhIG1vcmUgZXhwbGljaXQgdmVyc2lvbiwgaW4gd2hpY2ggdGhlIGFuY2hvciBlbGVtZW50XG4gKiBpcyBjb250YWluZWQgaW4gYW4gYDxuZy10ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKlxuICogU2ltcGxlIGZvcm0gd2l0aCBzaG9ydGhhbmQgc3ludGF4OlxuICpcbiAqIGBgYFxuICogPGRpdiAqbmdJZj1cImNvbmRpdGlvblwiPkNvbnRlbnQgdG8gcmVuZGVyIHdoZW4gY29uZGl0aW9uIGlzIHRydWUuPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBTaW1wbGUgZm9ybSB3aXRoIGV4cGFuZGVkIHN5bnRheDpcbiAqXG4gKiBgYGBcbiAqIDxuZy10ZW1wbGF0ZSBbbmdJZl09XCJjb25kaXRpb25cIj48ZGl2PkNvbnRlbnQgdG8gcmVuZGVyIHdoZW4gY29uZGl0aW9uIGlzXG4gKiB0cnVlLjwvZGl2PjwvbmctdGVtcGxhdGU+XG4gKiBgYGBcbiAqXG4gKiBGb3JtIHdpdGggYW4gXCJlbHNlXCIgYmxvY2s6XG4gKlxuICogYGBgXG4gKiA8ZGl2ICpuZ0lmPVwiY29uZGl0aW9uOyBlbHNlIGVsc2VCbG9ja1wiPkNvbnRlbnQgdG8gcmVuZGVyIHdoZW4gY29uZGl0aW9uIGlzIHRydWUuPC9kaXY+XG4gKiA8bmctdGVtcGxhdGUgI2Vsc2VCbG9jaz5Db250ZW50IHRvIHJlbmRlciB3aGVuIGNvbmRpdGlvbiBpcyBmYWxzZS48L25nLXRlbXBsYXRlPlxuICogYGBgXG4gKlxuICogU2hvcnRoYW5kIGZvcm0gd2l0aCBcInRoZW5cIiBhbmQgXCJlbHNlXCIgYmxvY2tzOlxuICpcbiAqIGBgYFxuICogPGRpdiAqbmdJZj1cImNvbmRpdGlvbjsgdGhlbiB0aGVuQmxvY2sgZWxzZSBlbHNlQmxvY2tcIj48L2Rpdj5cbiAqIDxuZy10ZW1wbGF0ZSAjdGhlbkJsb2NrPkNvbnRlbnQgdG8gcmVuZGVyIHdoZW4gY29uZGl0aW9uIGlzIHRydWUuPC9uZy10ZW1wbGF0ZT5cbiAqIDxuZy10ZW1wbGF0ZSAjZWxzZUJsb2NrPkNvbnRlbnQgdG8gcmVuZGVyIHdoZW4gY29uZGl0aW9uIGlzIGZhbHNlLjwvbmctdGVtcGxhdGU+XG4gKiBgYGBcbiAqXG4gKiBGb3JtIHdpdGggc3RvcmluZyB0aGUgdmFsdWUgbG9jYWxseTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgKm5nSWY9XCJjb25kaXRpb24gYXMgdmFsdWU7IGVsc2UgZWxzZUJsb2NrXCI+e3t2YWx1ZX19PC9kaXY+XG4gKiA8bmctdGVtcGxhdGUgI2Vsc2VCbG9jaz5Db250ZW50IHRvIHJlbmRlciB3aGVuIHZhbHVlIGlzIG51bGwuPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGAqbmdJZmAgZGlyZWN0aXZlIGlzIG1vc3QgY29tbW9ubHkgdXNlZCB0byBjb25kaXRpb25hbGx5IHNob3cgYW4gaW5saW5lIHRlbXBsYXRlLFxuICogYXMgc2VlbiBpbiB0aGUgZm9sbG93aW5nICBleGFtcGxlLlxuICogVGhlIGRlZmF1bHQgYGVsc2VgIHRlbXBsYXRlIGlzIGJsYW5rLlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdJZi90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ0lmU2ltcGxlJ31cbiAqXG4gKiAjIyMgU2hvd2luZyBhbiBhbHRlcm5hdGl2ZSB0ZW1wbGF0ZSB1c2luZyBgZWxzZWBcbiAqXG4gKiBUbyBkaXNwbGF5IGEgdGVtcGxhdGUgd2hlbiBgZXhwcmVzc2lvbmAgZXZhbHVhdGVzIHRvIGZhbHNlLCB1c2UgYW4gYGVsc2VgIHRlbXBsYXRlXG4gKiBiaW5kaW5nIGFzIHNob3duIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZS5cbiAqIFRoZSBgZWxzZWAgYmluZGluZyBwb2ludHMgdG8gYW4gYDxuZy10ZW1wbGF0ZT5gICBlbGVtZW50IGxhYmVsZWQgYCNlbHNlQmxvY2tgLlxuICogVGhlIHRlbXBsYXRlIGNhbiBiZSBkZWZpbmVkIGFueXdoZXJlIGluIHRoZSBjb21wb25lbnQgdmlldywgYnV0IGlzIHR5cGljYWxseSBwbGFjZWQgcmlnaHQgYWZ0ZXJcbiAqIGBuZ0lmYCBmb3IgcmVhZGFiaWxpdHkuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0lmL3RzL21vZHVsZS50cyByZWdpb249J05nSWZFbHNlJ31cbiAqXG4gKiAjIyMgVXNpbmcgYW4gZXh0ZXJuYWwgYHRoZW5gIHRlbXBsYXRlXG4gKlxuICogSW4gdGhlIHByZXZpb3VzIGV4YW1wbGUsIHRoZSB0aGVuLWNsYXVzZSB0ZW1wbGF0ZSBpcyBzcGVjaWZpZWQgaW5saW5lLCBhcyB0aGUgY29udGVudCBvZiB0aGVcbiAqIHRhZyB0aGF0IGNvbnRhaW5zIHRoZSBgbmdJZmAgZGlyZWN0aXZlLiBZb3UgY2FuIGFsc28gc3BlY2lmeSBhIHRlbXBsYXRlIHRoYXQgaXMgZGVmaW5lZFxuICogZXh0ZXJuYWxseSwgYnkgcmVmZXJlbmNpbmcgYSBsYWJlbGVkIGA8bmctdGVtcGxhdGU+YCBlbGVtZW50LiBXaGVuIHlvdSBkbyB0aGlzLCB5b3UgY2FuXG4gKiBjaGFuZ2Ugd2hpY2ggdGVtcGxhdGUgdG8gdXNlIGF0IHJ1bnRpbWUsIGFzIHNob3duIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nSWYvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nTmdJZlRoZW5FbHNlJ31cbiAqXG4gKiAjIyMgU3RvcmluZyBhIGNvbmRpdGlvbmFsIHJlc3VsdCBpbiBhIHZhcmlhYmxlXG4gKlxuICogWW91IG1pZ2h0IHdhbnQgdG8gc2hvdyBhIHNldCBvZiBwcm9wZXJ0aWVzIGZyb20gdGhlIHNhbWUgb2JqZWN0LiBJZiB5b3UgYXJlIHdhaXRpbmdcbiAqIGZvciBhc3luY2hyb25vdXMgZGF0YSwgdGhlIG9iamVjdCBjYW4gYmUgdW5kZWZpbmVkLlxuICogSW4gdGhpcyBjYXNlLCB5b3UgY2FuIHVzZSBgbmdJZmAgYW5kIHN0b3JlIHRoZSByZXN1bHQgb2YgdGhlIGNvbmRpdGlvbiBpbiBhIGxvY2FsXG4gKiB2YXJpYWJsZSBhcyBzaG93biBpbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0lmL3RzL21vZHVsZS50cyByZWdpb249J05nSWZBcyd9XG4gKlxuICogVGhpcyBjb2RlIHVzZXMgb25seSBvbmUgYEFzeW5jUGlwZWAsIHNvIG9ubHkgb25lIHN1YnNjcmlwdGlvbiBpcyBjcmVhdGVkLlxuICogVGhlIGNvbmRpdGlvbmFsIHN0YXRlbWVudCBzdG9yZXMgdGhlIHJlc3VsdCBvZiBgdXNlclN0cmVhbXxhc3luY2AgaW4gdGhlIGxvY2FsIHZhcmlhYmxlIGB1c2VyYC5cbiAqIFlvdSBjYW4gdGhlbiBiaW5kIHRoZSBsb2NhbCBgdXNlcmAgcmVwZWF0ZWRseS5cbiAqXG4gKiBUaGUgY29uZGl0aW9uYWwgZGlzcGxheXMgdGhlIGRhdGEgb25seSBpZiBgdXNlclN0cmVhbWAgcmV0dXJucyBhIHZhbHVlLFxuICogc28geW91IGRvbid0IG5lZWQgdG8gdXNlIHRoZVxuICogc2FmZS1uYXZpZ2F0aW9uLW9wZXJhdG9yIChgPy5gKVxuICogdG8gZ3VhcmQgYWdhaW5zdCBudWxsIHZhbHVlcyB3aGVuIGFjY2Vzc2luZyBwcm9wZXJ0aWVzLlxuICogWW91IGNhbiBkaXNwbGF5IGFuIGFsdGVybmF0aXZlIHRlbXBsYXRlIHdoaWxlIHdhaXRpbmcgZm9yIHRoZSBkYXRhLlxuICpcbiAqICMjIyBTaG9ydGhhbmQgc3ludGF4XG4gKlxuICogVGhlIHNob3J0aGFuZCBzeW50YXggYCpuZ0lmYCBleHBhbmRzIGludG8gdHdvIHNlcGFyYXRlIHRlbXBsYXRlIHNwZWNpZmljYXRpb25zXG4gKiBmb3IgdGhlIFwidGhlblwiIGFuZCBcImVsc2VcIiBjbGF1c2VzLiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhlIGZvbGxvd2luZyBzaG9ydGhhbmQgc3RhdGVtZW50LFxuICogdGhhdCBpcyBtZWFudCB0byBzaG93IGEgbG9hZGluZyBwYWdlIHdoaWxlIHdhaXRpbmcgZm9yIGRhdGEgdG8gYmUgbG9hZGVkLlxuICpcbiAqIGBgYFxuICogPGRpdiBjbGFzcz1cImhlcm8tbGlzdFwiICpuZ0lmPVwiaGVyb2VzIGVsc2UgbG9hZGluZ1wiPlxuICogIC4uLlxuICogPC9kaXY+XG4gKlxuICogPG5nLXRlbXBsYXRlICNsb2FkaW5nPlxuICogIDxkaXY+TG9hZGluZy4uLjwvZGl2PlxuICogPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIFlvdSBjYW4gc2VlIHRoYXQgdGhlIFwiZWxzZVwiIGNsYXVzZSByZWZlcmVuY2VzIHRoZSBgPG5nLXRlbXBsYXRlPmBcbiAqIHdpdGggdGhlIGAjbG9hZGluZ2AgbGFiZWwsIGFuZCB0aGUgdGVtcGxhdGUgZm9yIHRoZSBcInRoZW5cIiBjbGF1c2VcbiAqIGlzIHByb3ZpZGVkIGFzIHRoZSBjb250ZW50IG9mIHRoZSBhbmNob3IgZWxlbWVudC5cbiAqXG4gKiBIb3dldmVyLCB3aGVuIEFuZ3VsYXIgZXhwYW5kcyB0aGUgc2hvcnRoYW5kIHN5bnRheCwgaXQgY3JlYXRlc1xuICogYW5vdGhlciBgPG5nLXRlbXBsYXRlPmAgdGFnLCB3aXRoIGBuZ0lmYCBhbmQgYG5nSWZFbHNlYCBkaXJlY3RpdmVzLlxuICogVGhlIGFuY2hvciBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHRlbXBsYXRlIGZvciB0aGUgXCJ0aGVuXCIgY2xhdXNlIGJlY29tZXNcbiAqIHRoZSBjb250ZW50IG9mIHRoaXMgdW5sYWJlbGVkIGA8bmctdGVtcGxhdGU+YCB0YWcuXG4gKlxuICogYGBgXG4gKiA8bmctdGVtcGxhdGUgW25nSWZdPVwiaGVyb2VzXCIgW25nSWZFbHNlXT1cImxvYWRpbmdcIj5cbiAqICA8ZGl2IGNsYXNzPVwiaGVyby1saXN0XCI+XG4gKiAgIC4uLlxuICogIDwvZGl2PlxuICogPC9uZy10ZW1wbGF0ZT5cbiAqXG4gKiA8bmctdGVtcGxhdGUgI2xvYWRpbmc+XG4gKiAgPGRpdj5Mb2FkaW5nLi4uPC9kaXY+XG4gKiA8L25nLXRlbXBsYXRlPlxuICogYGBgXG4gKlxuICogVGhlIHByZXNlbmNlIG9mIHRoZSBpbXBsaWNpdCB0ZW1wbGF0ZSBvYmplY3QgaGFzIGltcGxpY2F0aW9ucyBmb3IgdGhlIG5lc3Rpbmcgb2ZcbiAqIHN0cnVjdHVyYWwgZGlyZWN0aXZlcy4gRm9yIG1vcmUgb24gdGhpcyBzdWJqZWN0LCBzZWVcbiAqIFtTdHJ1Y3R1cmFsIERpcmVjdGl2ZXNdKGd1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyNvbmUtcGVyLWVsZW1lbnQpLlxuICpcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nSWZdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdJZjxUID0gdW5rbm93bj4ge1xuICBwcml2YXRlIF9jb250ZXh0OiBOZ0lmQ29udGV4dDxUPiA9IG5ldyBOZ0lmQ29udGV4dDxUPigpO1xuICBwcml2YXRlIF90aGVuVGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nSWZDb250ZXh0PFQ+PiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9lbHNlVGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nSWZDb250ZXh0PFQ+PiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF90aGVuVmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPE5nSWZDb250ZXh0PFQ+PiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9lbHNlVmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPE5nSWZDb250ZXh0PFQ+PiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsXG4gICAgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nSWZDb250ZXh0PFQ+PixcbiAgKSB7XG4gICAgdGhpcy5fdGhlblRlbXBsYXRlUmVmID0gdGVtcGxhdGVSZWY7XG4gIH1cblxuICAvKipcbiAgICogVGhlIEJvb2xlYW4gZXhwcmVzc2lvbiB0byBldmFsdWF0ZSBhcyB0aGUgY29uZGl0aW9uIGZvciBzaG93aW5nIGEgdGVtcGxhdGUuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbmdJZihjb25kaXRpb246IFQpIHtcbiAgICB0aGlzLl9jb250ZXh0LiRpbXBsaWNpdCA9IHRoaXMuX2NvbnRleHQubmdJZiA9IGNvbmRpdGlvbjtcbiAgICB0aGlzLl91cGRhdGVWaWV3KCk7XG4gIH1cblxuICAvKipcbiAgICogQSB0ZW1wbGF0ZSB0byBzaG93IGlmIHRoZSBjb25kaXRpb24gZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gdHJ1ZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0lmVGhlbih0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8TmdJZkNvbnRleHQ8VD4+IHwgbnVsbCkge1xuICAgIGFzc2VydFRlbXBsYXRlKCduZ0lmVGhlbicsIHRlbXBsYXRlUmVmKTtcbiAgICB0aGlzLl90aGVuVGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAgICB0aGlzLl90aGVuVmlld1JlZiA9IG51bGw7IC8vIGNsZWFyIHByZXZpb3VzIHZpZXcgaWYgYW55LlxuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHRlbXBsYXRlIHRvIHNob3cgaWYgdGhlIGNvbmRpdGlvbiBleHByZXNzaW9uIGV2YWx1YXRlcyB0byBmYWxzZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0lmRWxzZSh0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8TmdJZkNvbnRleHQ8VD4+IHwgbnVsbCkge1xuICAgIGFzc2VydFRlbXBsYXRlKCduZ0lmRWxzZScsIHRlbXBsYXRlUmVmKTtcbiAgICB0aGlzLl9lbHNlVGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAgICB0aGlzLl9lbHNlVmlld1JlZiA9IG51bGw7IC8vIGNsZWFyIHByZXZpb3VzIHZpZXcgaWYgYW55LlxuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZpZXcoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRleHQuJGltcGxpY2l0KSB7XG4gICAgICBpZiAoIXRoaXMuX3RoZW5WaWV3UmVmKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fZWxzZVZpZXdSZWYgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fdGhlblRlbXBsYXRlUmVmKSB7XG4gICAgICAgICAgdGhpcy5fdGhlblZpZXdSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgICAgIHRoaXMuX3RoZW5UZW1wbGF0ZVJlZixcbiAgICAgICAgICAgIHRoaXMuX2NvbnRleHQsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuX2Vsc2VWaWV3UmVmKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fdGhlblZpZXdSZWYgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fZWxzZVRlbXBsYXRlUmVmKSB7XG4gICAgICAgICAgdGhpcy5fZWxzZVZpZXdSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgICAgIHRoaXMuX2Vsc2VUZW1wbGF0ZVJlZixcbiAgICAgICAgICAgIHRoaXMuX2NvbnRleHQsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIHN0YXRpYyBuZ0lmVXNlSWZUeXBlR3VhcmQ6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGJvdW5kIHRvIHRoZSBgbmdJZmAgaW5wdXQgd2l0aGluIHRoZSB0ZW1wbGF0ZS5cbiAgICpcbiAgICogVGhlIHByZXNlbmNlIG9mIHRoaXMgc3RhdGljIGZpZWxkIGlzIGEgc2lnbmFsIHRvIHRoZSBJdnkgdGVtcGxhdGUgdHlwZSBjaGVjayBjb21waWxlciB0aGF0XG4gICAqIHdoZW4gdGhlIGBOZ0lmYCBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSByZW5kZXJzIGl0cyB0ZW1wbGF0ZSwgdGhlIHR5cGUgb2YgdGhlIGV4cHJlc3Npb24gYm91bmRcbiAgICogdG8gYG5nSWZgIHNob3VsZCBiZSBuYXJyb3dlZCBpbiBzb21lIHdheS4gRm9yIGBOZ0lmYCwgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBpdHNlbGYgaXMgdXNlZCB0b1xuICAgKiBuYXJyb3cgaXRzIHR5cGUsIHdoaWNoIGFsbG93cyB0aGUgc3RyaWN0TnVsbENoZWNrcyBmZWF0dXJlIG9mIFR5cGVTY3JpcHQgdG8gd29yayB3aXRoIGBOZ0lmYC5cbiAgICovXG4gIHN0YXRpYyBuZ1RlbXBsYXRlR3VhcmRfbmdJZjogJ2JpbmRpbmcnO1xuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoZSBjb3JyZWN0IHR5cGUgb2YgdGhlIGNvbnRleHQgZm9yIHRoZSB0ZW1wbGF0ZSB0aGF0IGBOZ0lmYCB3aWxsIHJlbmRlci5cbiAgICpcbiAgICogVGhlIHByZXNlbmNlIG9mIHRoaXMgbWV0aG9kIGlzIGEgc2lnbmFsIHRvIHRoZSBJdnkgdGVtcGxhdGUgdHlwZS1jaGVjayBjb21waWxlciB0aGF0IHRoZVxuICAgKiBgTmdJZmAgc3RydWN0dXJhbCBkaXJlY3RpdmUgcmVuZGVycyBpdHMgdGVtcGxhdGUgd2l0aCBhIHNwZWNpZmljIGNvbnRleHQgdHlwZS5cbiAgICovXG4gIHN0YXRpYyBuZ1RlbXBsYXRlQ29udGV4dEd1YXJkPFQ+KFxuICAgIGRpcjogTmdJZjxUPixcbiAgICBjdHg6IGFueSxcbiAgKTogY3R4IGlzIE5nSWZDb250ZXh0PEV4Y2x1ZGU8VCwgZmFsc2UgfCAwIHwgJycgfCBudWxsIHwgdW5kZWZpbmVkPj4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmdJZkNvbnRleHQ8VCA9IHVua25vd24+IHtcbiAgcHVibGljICRpbXBsaWNpdDogVCA9IG51bGwhO1xuICBwdWJsaWMgbmdJZjogVCA9IG51bGwhO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRUZW1wbGF0ZShwcm9wZXJ0eTogc3RyaW5nLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PiB8IG51bGwpOiB2b2lkIHtcbiAgY29uc3QgaXNUZW1wbGF0ZVJlZk9yTnVsbCA9ICEhKCF0ZW1wbGF0ZVJlZiB8fCB0ZW1wbGF0ZVJlZi5jcmVhdGVFbWJlZGRlZFZpZXcpO1xuICBpZiAoIWlzVGVtcGxhdGVSZWZPck51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cHJvcGVydHl9IG11c3QgYmUgYSBUZW1wbGF0ZVJlZiwgYnV0IHJlY2VpdmVkICcke3N0cmluZ2lmeSh0ZW1wbGF0ZVJlZil9Jy5gKTtcbiAgfVxufVxuIl19