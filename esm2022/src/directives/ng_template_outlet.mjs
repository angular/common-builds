/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef, } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Inserts an embedded view from a prepared `TemplateRef`.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * @usageNotes
 * ```
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * Using the key `$implicit` in the context object will set its value as default.
 *
 * ### Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * @publicApi
 */
export class NgTemplateOutlet {
    constructor(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
        this._viewRef = null;
        /**
         * A context object to attach to the {@link EmbeddedViewRef}. This should be an
         * object, the object's keys will be available for binding by the local template `let`
         * declarations.
         * Using the key `$implicit` in the context object will set its value as default.
         */
        this.ngTemplateOutletContext = null;
        /**
         * A string defining the template reference and optionally the context object for the template.
         */
        this.ngTemplateOutlet = null;
        /** Injector to be used within the embedded view. */
        this.ngTemplateOutletInjector = null;
    }
    ngOnChanges(changes) {
        if (this._shouldRecreateView(changes)) {
            const viewContainerRef = this._viewContainerRef;
            if (this._viewRef) {
                viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
            }
            // If there is no outlet, clear the destroyed view ref.
            if (!this.ngTemplateOutlet) {
                this._viewRef = null;
                return;
            }
            // Create a context forward `Proxy` that will always bind to the user-specified context,
            // without having to destroy and re-create views whenever the context changes.
            const viewContext = this._createContextForwardProxy();
            this._viewRef = viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, viewContext, {
                injector: this.ngTemplateOutletInjector ?? undefined,
            });
        }
    }
    /**
     * We need to re-create existing embedded view if either is true:
     * - the outlet changed.
     * - the injector changed.
     */
    _shouldRecreateView(changes) {
        return !!changes['ngTemplateOutlet'] || !!changes['ngTemplateOutletInjector'];
    }
    /**
     * For a given outlet instance, we create a proxy object that delegates
     * to the user-specified context. This allows changing, or swapping out
     * the context object completely without having to destroy/re-create the view.
     */
    _createContextForwardProxy() {
        return new Proxy({}, {
            set: (_target, prop, newValue) => {
                if (!this.ngTemplateOutletContext) {
                    return false;
                }
                return Reflect.set(this.ngTemplateOutletContext, prop, newValue);
            },
            get: (_target, prop, receiver) => {
                if (!this.ngTemplateOutletContext) {
                    return undefined;
                }
                return Reflect.get(this.ngTemplateOutletContext, prop, receiver);
            },
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgTemplateOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", type: NgTemplateOutlet, isStandalone: true, selector: "[ngTemplateOutlet]", inputs: { ngTemplateOutletContext: "ngTemplateOutletContext", ngTemplateOutlet: "ngTemplateOutlet", ngTemplateOutletInjector: "ngTemplateOutletInjector" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgTemplateOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngTemplateOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }], propDecorators: { ngTemplateOutletContext: [{
                type: Input
            }], ngTemplateOutlet: [{
                type: Input
            }], ngTemplateOutletInjector: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUdULEtBQUssRUFLTCxnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7O0FBRXZCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUtILE1BQU0sT0FBTyxnQkFBZ0I7SUFtQjNCLFlBQW9CLGlCQUFtQztRQUFuQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBbEIvQyxhQUFRLEdBQThCLElBQUksQ0FBQztRQUVuRDs7Ozs7V0FLRztRQUNhLDRCQUF1QixHQUFhLElBQUksQ0FBQztRQUV6RDs7V0FFRztRQUNhLHFCQUFnQixHQUEwQixJQUFJLENBQUM7UUFFL0Qsb0RBQW9EO1FBQ3BDLDZCQUF3QixHQUFvQixJQUFJLENBQUM7SUFFUCxDQUFDO0lBRTNELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBRWhELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFFRCx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDckIsT0FBTztZQUNULENBQUM7WUFFRCx3RkFBd0Y7WUFDeEYsOEVBQThFO1lBQzlFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFdBQVcsRUFBRTtnQkFDdEYsUUFBUSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxTQUFTO2FBQ3JELENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLG1CQUFtQixDQUFDLE9BQXNCO1FBQ2hELE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLDBCQUEwQjtRQUNoQyxPQUFVLElBQUksS0FBSyxDQUNqQixFQUFFLEVBQ0Y7WUFDRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBQ2xDLE9BQU8sS0FBSyxDQUFDO2dCQUNmLENBQUM7Z0JBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkUsQ0FBQztZQUNELEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztvQkFDbEMsT0FBTyxTQUFTLENBQUM7Z0JBQ25CLENBQUM7Z0JBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkUsQ0FBQztTQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7eUhBNUVVLGdCQUFnQjs2R0FBaEIsZ0JBQWdCOztzR0FBaEIsZ0JBQWdCO2tCQUo1QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjtxRkFVaUIsdUJBQXVCO3NCQUF0QyxLQUFLO2dCQUtVLGdCQUFnQjtzQkFBL0IsS0FBSztnQkFHVSx3QkFBd0I7c0JBQXZDLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2UsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogSW5zZXJ0cyBhbiBlbWJlZGRlZCB2aWV3IGZyb20gYSBwcmVwYXJlZCBgVGVtcGxhdGVSZWZgLlxuICpcbiAqIFlvdSBjYW4gYXR0YWNoIGEgY29udGV4dCBvYmplY3QgdG8gdGhlIGBFbWJlZGRlZFZpZXdSZWZgIGJ5IHNldHRpbmcgYFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF1gLlxuICogYFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF1gIHNob3VsZCBiZSBhbiBvYmplY3QsIHRoZSBvYmplY3QncyBrZXlzIHdpbGwgYmUgYXZhaWxhYmxlIGZvciBiaW5kaW5nXG4gKiBieSB0aGUgbG9jYWwgdGVtcGxhdGUgYGxldGAgZGVjbGFyYXRpb25zLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJ0ZW1wbGF0ZVJlZkV4cDsgY29udGV4dDogY29udGV4dEV4cFwiPjwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogVXNpbmcgdGhlIGtleSBgJGltcGxpY2l0YCBpbiB0aGUgY29udGV4dCBvYmplY3Qgd2lsbCBzZXQgaXRzIHZhbHVlIGFzIGRlZmF1bHQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nVGVtcGxhdGVPdXRsZXQvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nTmdUZW1wbGF0ZU91dGxldCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdUZW1wbGF0ZU91dGxldF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ1RlbXBsYXRlT3V0bGV0PEMgPSB1bmtub3duPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByaXZhdGUgX3ZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxDPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBIGNvbnRleHQgb2JqZWN0IHRvIGF0dGFjaCB0byB0aGUge0BsaW5rIEVtYmVkZGVkVmlld1JlZn0uIFRoaXMgc2hvdWxkIGJlIGFuXG4gICAqIG9iamVjdCwgdGhlIG9iamVjdCdzIGtleXMgd2lsbCBiZSBhdmFpbGFibGUgZm9yIGJpbmRpbmcgYnkgdGhlIGxvY2FsIHRlbXBsYXRlIGBsZXRgXG4gICAqIGRlY2xhcmF0aW9ucy5cbiAgICogVXNpbmcgdGhlIGtleSBgJGltcGxpY2l0YCBpbiB0aGUgY29udGV4dCBvYmplY3Qgd2lsbCBzZXQgaXRzIHZhbHVlIGFzIGRlZmF1bHQuXG4gICAqL1xuICBASW5wdXQoKSBwdWJsaWMgbmdUZW1wbGF0ZU91dGxldENvbnRleHQ6IEMgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQSBzdHJpbmcgZGVmaW5pbmcgdGhlIHRlbXBsYXRlIHJlZmVyZW5jZSBhbmQgb3B0aW9uYWxseSB0aGUgY29udGV4dCBvYmplY3QgZm9yIHRoZSB0ZW1wbGF0ZS5cbiAgICovXG4gIEBJbnB1dCgpIHB1YmxpYyBuZ1RlbXBsYXRlT3V0bGV0OiBUZW1wbGF0ZVJlZjxDPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBJbmplY3RvciB0byBiZSB1c2VkIHdpdGhpbiB0aGUgZW1iZWRkZWQgdmlldy4gKi9cbiAgQElucHV0KCkgcHVibGljIG5nVGVtcGxhdGVPdXRsZXRJbmplY3RvcjogSW5qZWN0b3IgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkUmVjcmVhdGVWaWV3KGNoYW5nZXMpKSB7XG4gICAgICBjb25zdCB2aWV3Q29udGFpbmVyUmVmID0gdGhpcy5fdmlld0NvbnRhaW5lclJlZjtcblxuICAgICAgaWYgKHRoaXMuX3ZpZXdSZWYpIHtcbiAgICAgICAgdmlld0NvbnRhaW5lclJlZi5yZW1vdmUodmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMuX3ZpZXdSZWYpKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gb3V0bGV0LCBjbGVhciB0aGUgZGVzdHJveWVkIHZpZXcgcmVmLlxuICAgICAgaWYgKCF0aGlzLm5nVGVtcGxhdGVPdXRsZXQpIHtcbiAgICAgICAgdGhpcy5fdmlld1JlZiA9IG51bGw7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIGEgY29udGV4dCBmb3J3YXJkIGBQcm94eWAgdGhhdCB3aWxsIGFsd2F5cyBiaW5kIHRvIHRoZSB1c2VyLXNwZWNpZmllZCBjb250ZXh0LFxuICAgICAgLy8gd2l0aG91dCBoYXZpbmcgdG8gZGVzdHJveSBhbmQgcmUtY3JlYXRlIHZpZXdzIHdoZW5ldmVyIHRoZSBjb250ZXh0IGNoYW5nZXMuXG4gICAgICBjb25zdCB2aWV3Q29udGV4dCA9IHRoaXMuX2NyZWF0ZUNvbnRleHRGb3J3YXJkUHJveHkoKTtcbiAgICAgIHRoaXMuX3ZpZXdSZWYgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLm5nVGVtcGxhdGVPdXRsZXQsIHZpZXdDb250ZXh0LCB7XG4gICAgICAgIGluamVjdG9yOiB0aGlzLm5nVGVtcGxhdGVPdXRsZXRJbmplY3RvciA/PyB1bmRlZmluZWQsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2UgbmVlZCB0byByZS1jcmVhdGUgZXhpc3RpbmcgZW1iZWRkZWQgdmlldyBpZiBlaXRoZXIgaXMgdHJ1ZTpcbiAgICogLSB0aGUgb3V0bGV0IGNoYW5nZWQuXG4gICAqIC0gdGhlIGluamVjdG9yIGNoYW5nZWQuXG4gICAqL1xuICBwcml2YXRlIF9zaG91bGRSZWNyZWF0ZVZpZXcoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIWNoYW5nZXNbJ25nVGVtcGxhdGVPdXRsZXQnXSB8fCAhIWNoYW5nZXNbJ25nVGVtcGxhdGVPdXRsZXRJbmplY3RvciddO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBhIGdpdmVuIG91dGxldCBpbnN0YW5jZSwgd2UgY3JlYXRlIGEgcHJveHkgb2JqZWN0IHRoYXQgZGVsZWdhdGVzXG4gICAqIHRvIHRoZSB1c2VyLXNwZWNpZmllZCBjb250ZXh0LiBUaGlzIGFsbG93cyBjaGFuZ2luZywgb3Igc3dhcHBpbmcgb3V0XG4gICAqIHRoZSBjb250ZXh0IG9iamVjdCBjb21wbGV0ZWx5IHdpdGhvdXQgaGF2aW5nIHRvIGRlc3Ryb3kvcmUtY3JlYXRlIHRoZSB2aWV3LlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlQ29udGV4dEZvcndhcmRQcm94eSgpOiBDIHtcbiAgICByZXR1cm4gPEM+bmV3IFByb3h5KFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIHNldDogKF90YXJnZXQsIHByb3AsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBSZWZsZWN0LnNldCh0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0LCBwcm9wLCBuZXdWYWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldDogKF90YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG4iXX0=