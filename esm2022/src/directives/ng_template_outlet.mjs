/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.10+sha-127023f", ngImport: i0, type: NgTemplateOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.10+sha-127023f", type: NgTemplateOutlet, isStandalone: true, selector: "[ngTemplateOutlet]", inputs: { ngTemplateOutletContext: "ngTemplateOutletContext", ngTemplateOutlet: "ngTemplateOutlet", ngTemplateOutletInjector: "ngTemplateOutletInjector" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.10+sha-127023f", ngImport: i0, type: NgTemplateOutlet, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUdULEtBQUssRUFLTCxnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7O0FBRXZCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUtILE1BQU0sT0FBTyxnQkFBZ0I7SUFtQjNCLFlBQW9CLGlCQUFtQztRQUFuQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBbEIvQyxhQUFRLEdBQThCLElBQUksQ0FBQztRQUVuRDs7Ozs7V0FLRztRQUNhLDRCQUF1QixHQUFhLElBQUksQ0FBQztRQUV6RDs7V0FFRztRQUNhLHFCQUFnQixHQUEwQixJQUFJLENBQUM7UUFFL0Qsb0RBQW9EO1FBQ3BDLDZCQUF3QixHQUFvQixJQUFJLENBQUM7SUFFUCxDQUFDO0lBRTNELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBRWhELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFFRCx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDckIsT0FBTztZQUNULENBQUM7WUFFRCx3RkFBd0Y7WUFDeEYsOEVBQThFO1lBQzlFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFdBQVcsRUFBRTtnQkFDdEYsUUFBUSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxTQUFTO2FBQ3JELENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLG1CQUFtQixDQUFDLE9BQXNCO1FBQ2hELE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLDBCQUEwQjtRQUNoQyxPQUFVLElBQUksS0FBSyxDQUNqQixFQUFFLEVBQ0Y7WUFDRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBQ2xDLE9BQU8sS0FBSyxDQUFDO2dCQUNmLENBQUM7Z0JBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkUsQ0FBQztZQUNELEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztvQkFDbEMsT0FBTyxTQUFTLENBQUM7Z0JBQ25CLENBQUM7Z0JBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkUsQ0FBQztTQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7eUhBNUVVLGdCQUFnQjs2R0FBaEIsZ0JBQWdCOztzR0FBaEIsZ0JBQWdCO2tCQUo1QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjtxRkFVaUIsdUJBQXVCO3NCQUF0QyxLQUFLO2dCQUtVLGdCQUFnQjtzQkFBL0IsS0FBSztnQkFHVSx3QkFBd0I7c0JBQXZDLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBJbmplY3RvcixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEluc2VydHMgYW4gZW1iZWRkZWQgdmlldyBmcm9tIGEgcHJlcGFyZWQgYFRlbXBsYXRlUmVmYC5cbiAqXG4gKiBZb3UgY2FuIGF0dGFjaCBhIGNvbnRleHQgb2JqZWN0IHRvIHRoZSBgRW1iZWRkZWRWaWV3UmVmYCBieSBzZXR0aW5nIGBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdYC5cbiAqIGBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdYCBzaG91bGQgYmUgYW4gb2JqZWN0LCB0aGUgb2JqZWN0J3Mga2V5cyB3aWxsIGJlIGF2YWlsYWJsZSBmb3IgYmluZGluZ1xuICogYnkgdGhlIGxvY2FsIHRlbXBsYXRlIGBsZXRgIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwidGVtcGxhdGVSZWZFeHA7IGNvbnRleHQ6IGNvbnRleHRFeHBcIj48L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFVzaW5nIHRoZSBrZXkgYCRpbXBsaWNpdGAgaW4gdGhlIGNvbnRleHQgb2JqZWN0IHdpbGwgc2V0IGl0cyB2YWx1ZSBhcyBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ1RlbXBsYXRlT3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J05nVGVtcGxhdGVPdXRsZXQnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nVGVtcGxhdGVPdXRsZXRdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdUZW1wbGF0ZU91dGxldDxDID0gdW5rbm93bj4gaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBwcml2YXRlIF92aWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8Qz4gfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQSBjb250ZXh0IG9iamVjdCB0byBhdHRhY2ggdG8gdGhlIHtAbGluayBFbWJlZGRlZFZpZXdSZWZ9LiBUaGlzIHNob3VsZCBiZSBhblxuICAgKiBvYmplY3QsIHRoZSBvYmplY3QncyBrZXlzIHdpbGwgYmUgYXZhaWxhYmxlIGZvciBiaW5kaW5nIGJ5IHRoZSBsb2NhbCB0ZW1wbGF0ZSBgbGV0YFxuICAgKiBkZWNsYXJhdGlvbnMuXG4gICAqIFVzaW5nIHRoZSBrZXkgYCRpbXBsaWNpdGAgaW4gdGhlIGNvbnRleHQgb2JqZWN0IHdpbGwgc2V0IGl0cyB2YWx1ZSBhcyBkZWZhdWx0LlxuICAgKi9cbiAgQElucHV0KCkgcHVibGljIG5nVGVtcGxhdGVPdXRsZXRDb250ZXh0OiBDIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEEgc3RyaW5nIGRlZmluaW5nIHRoZSB0ZW1wbGF0ZSByZWZlcmVuY2UgYW5kIG9wdGlvbmFsbHkgdGhlIGNvbnRleHQgb2JqZWN0IGZvciB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBASW5wdXQoKSBwdWJsaWMgbmdUZW1wbGF0ZU91dGxldDogVGVtcGxhdGVSZWY8Qz4gfCBudWxsID0gbnVsbDtcblxuICAvKiogSW5qZWN0b3IgdG8gYmUgdXNlZCB3aXRoaW4gdGhlIGVtYmVkZGVkIHZpZXcuICovXG4gIEBJbnB1dCgpIHB1YmxpYyBuZ1RlbXBsYXRlT3V0bGV0SW5qZWN0b3I6IEluamVjdG9yIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKHRoaXMuX3Nob3VsZFJlY3JlYXRlVmlldyhjaGFuZ2VzKSkge1xuICAgICAgY29uc3Qgdmlld0NvbnRhaW5lclJlZiA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWY7XG5cbiAgICAgIGlmICh0aGlzLl92aWV3UmVmKSB7XG4gICAgICAgIHZpZXdDb250YWluZXJSZWYucmVtb3ZlKHZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLl92aWV3UmVmKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG91dGxldCwgY2xlYXIgdGhlIGRlc3Ryb3llZCB2aWV3IHJlZi5cbiAgICAgIGlmICghdGhpcy5uZ1RlbXBsYXRlT3V0bGV0KSB7XG4gICAgICAgIHRoaXMuX3ZpZXdSZWYgPSBudWxsO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIGNvbnRleHQgZm9yd2FyZCBgUHJveHlgIHRoYXQgd2lsbCBhbHdheXMgYmluZCB0byB0aGUgdXNlci1zcGVjaWZpZWQgY29udGV4dCxcbiAgICAgIC8vIHdpdGhvdXQgaGF2aW5nIHRvIGRlc3Ryb3kgYW5kIHJlLWNyZWF0ZSB2aWV3cyB3aGVuZXZlciB0aGUgY29udGV4dCBjaGFuZ2VzLlxuICAgICAgY29uc3Qgdmlld0NvbnRleHQgPSB0aGlzLl9jcmVhdGVDb250ZXh0Rm9yd2FyZFByb3h5KCk7XG4gICAgICB0aGlzLl92aWV3UmVmID0gdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5uZ1RlbXBsYXRlT3V0bGV0LCB2aWV3Q29udGV4dCwge1xuICAgICAgICBpbmplY3RvcjogdGhpcy5uZ1RlbXBsYXRlT3V0bGV0SW5qZWN0b3IgPz8gdW5kZWZpbmVkLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdlIG5lZWQgdG8gcmUtY3JlYXRlIGV4aXN0aW5nIGVtYmVkZGVkIHZpZXcgaWYgZWl0aGVyIGlzIHRydWU6XG4gICAqIC0gdGhlIG91dGxldCBjaGFuZ2VkLlxuICAgKiAtIHRoZSBpbmplY3RvciBjaGFuZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2hvdWxkUmVjcmVhdGVWaWV3KGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISFjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0J10gfHwgISFjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0SW5qZWN0b3InXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgYSBnaXZlbiBvdXRsZXQgaW5zdGFuY2UsIHdlIGNyZWF0ZSBhIHByb3h5IG9iamVjdCB0aGF0IGRlbGVnYXRlc1xuICAgKiB0byB0aGUgdXNlci1zcGVjaWZpZWQgY29udGV4dC4gVGhpcyBhbGxvd3MgY2hhbmdpbmcsIG9yIHN3YXBwaW5nIG91dFxuICAgKiB0aGUgY29udGV4dCBvYmplY3QgY29tcGxldGVseSB3aXRob3V0IGhhdmluZyB0byBkZXN0cm95L3JlLWNyZWF0ZSB0aGUgdmlldy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZUNvbnRleHRGb3J3YXJkUHJveHkoKTogQyB7XG4gICAgcmV0dXJuIDxDPm5ldyBQcm94eShcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBzZXQ6IChfdGFyZ2V0LCBwcm9wLCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCwgcHJvcCwgbmV3VmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBnZXQ6IChfdGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRoaXMubmdUZW1wbGF0ZU91dGxldENvbnRleHQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxufVxuIl19