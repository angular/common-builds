/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef } from '@angular/core';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.4+sha-12181b9", ngImport: i0, type: NgTemplateOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.1.0-next.4+sha-12181b9", type: NgTemplateOutlet, isStandalone: true, selector: "[ngTemplateOutlet]", inputs: { ngTemplateOutletContext: "ngTemplateOutletContext", ngTemplateOutlet: "ngTemplateOutlet", ngTemplateOutletInjector: "ngTemplateOutletInjector" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.4+sha-12181b9", ngImport: i0, type: NgTemplateOutlet, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUE2QixLQUFLLEVBQXVELGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUVqSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFLSCxNQUFNLE9BQU8sZ0JBQWdCO0lBbUIzQixZQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQWxCL0MsYUFBUSxHQUE0QixJQUFJLENBQUM7UUFFakQ7Ozs7O1dBS0c7UUFDYSw0QkFBdUIsR0FBVyxJQUFJLENBQUM7UUFFdkQ7O1dBRUc7UUFDYSxxQkFBZ0IsR0FBd0IsSUFBSSxDQUFDO1FBRTdELG9EQUFvRDtRQUNwQyw2QkFBd0IsR0FBa0IsSUFBSSxDQUFDO0lBRUwsQ0FBQztJQUUzRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUN0QyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUVoRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBRUQsdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLE9BQU87WUFDVCxDQUFDO1lBRUQsd0ZBQXdGO1lBQ3hGLDhFQUE4RTtZQUM5RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsUUFBUSxHQUFHLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQUU7Z0JBQ3RGLFFBQVEsRUFBRSxJQUFJLENBQUMsd0JBQXdCLElBQUksU0FBUzthQUNyRCxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxtQkFBbUIsQ0FBQyxPQUFzQjtRQUNoRCxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVEOzs7O09BSUc7SUFDSywwQkFBMEI7UUFDaEMsT0FBVSxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7WUFDdEIsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO29CQUNsQyxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDO2dCQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFDRCxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBQ2xDLE9BQU8sU0FBUyxDQUFDO2dCQUNuQixDQUFDO2dCQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25FLENBQUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO3lIQXpFVSxnQkFBZ0I7NkdBQWhCLGdCQUFnQjs7c0dBQWhCLGdCQUFnQjtrQkFKNUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixVQUFVLEVBQUUsSUFBSTtpQkFDakI7cUZBVWlCLHVCQUF1QjtzQkFBdEMsS0FBSztnQkFLVSxnQkFBZ0I7c0JBQS9CLEtBQUs7Z0JBR1Usd0JBQXdCO3NCQUF2QyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbWJlZGRlZFZpZXdSZWYsIEluamVjdG9yLCBJbnB1dCwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogSW5zZXJ0cyBhbiBlbWJlZGRlZCB2aWV3IGZyb20gYSBwcmVwYXJlZCBgVGVtcGxhdGVSZWZgLlxuICpcbiAqIFlvdSBjYW4gYXR0YWNoIGEgY29udGV4dCBvYmplY3QgdG8gdGhlIGBFbWJlZGRlZFZpZXdSZWZgIGJ5IHNldHRpbmcgYFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF1gLlxuICogYFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF1gIHNob3VsZCBiZSBhbiBvYmplY3QsIHRoZSBvYmplY3QncyBrZXlzIHdpbGwgYmUgYXZhaWxhYmxlIGZvciBiaW5kaW5nXG4gKiBieSB0aGUgbG9jYWwgdGVtcGxhdGUgYGxldGAgZGVjbGFyYXRpb25zLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJ0ZW1wbGF0ZVJlZkV4cDsgY29udGV4dDogY29udGV4dEV4cFwiPjwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogVXNpbmcgdGhlIGtleSBgJGltcGxpY2l0YCBpbiB0aGUgY29udGV4dCBvYmplY3Qgd2lsbCBzZXQgaXRzIHZhbHVlIGFzIGRlZmF1bHQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nVGVtcGxhdGVPdXRsZXQvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nTmdUZW1wbGF0ZU91dGxldCd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdUZW1wbGF0ZU91dGxldF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ1RlbXBsYXRlT3V0bGV0PEMgPSB1bmtub3duPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByaXZhdGUgX3ZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxDPnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQSBjb250ZXh0IG9iamVjdCB0byBhdHRhY2ggdG8gdGhlIHtAbGluayBFbWJlZGRlZFZpZXdSZWZ9LiBUaGlzIHNob3VsZCBiZSBhblxuICAgKiBvYmplY3QsIHRoZSBvYmplY3QncyBrZXlzIHdpbGwgYmUgYXZhaWxhYmxlIGZvciBiaW5kaW5nIGJ5IHRoZSBsb2NhbCB0ZW1wbGF0ZSBgbGV0YFxuICAgKiBkZWNsYXJhdGlvbnMuXG4gICAqIFVzaW5nIHRoZSBrZXkgYCRpbXBsaWNpdGAgaW4gdGhlIGNvbnRleHQgb2JqZWN0IHdpbGwgc2V0IGl0cyB2YWx1ZSBhcyBkZWZhdWx0LlxuICAgKi9cbiAgQElucHV0KCkgcHVibGljIG5nVGVtcGxhdGVPdXRsZXRDb250ZXh0OiBDfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBIHN0cmluZyBkZWZpbmluZyB0aGUgdGVtcGxhdGUgcmVmZXJlbmNlIGFuZCBvcHRpb25hbGx5IHRoZSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgQElucHV0KCkgcHVibGljIG5nVGVtcGxhdGVPdXRsZXQ6IFRlbXBsYXRlUmVmPEM+fG51bGwgPSBudWxsO1xuXG4gIC8qKiBJbmplY3RvciB0byBiZSB1c2VkIHdpdGhpbiB0aGUgZW1iZWRkZWQgdmlldy4gKi9cbiAgQElucHV0KCkgcHVibGljIG5nVGVtcGxhdGVPdXRsZXRJbmplY3RvcjogSW5qZWN0b3J8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKHRoaXMuX3Nob3VsZFJlY3JlYXRlVmlldyhjaGFuZ2VzKSkge1xuICAgICAgY29uc3Qgdmlld0NvbnRhaW5lclJlZiA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWY7XG5cbiAgICAgIGlmICh0aGlzLl92aWV3UmVmKSB7XG4gICAgICAgIHZpZXdDb250YWluZXJSZWYucmVtb3ZlKHZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLl92aWV3UmVmKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG91dGxldCwgY2xlYXIgdGhlIGRlc3Ryb3llZCB2aWV3IHJlZi5cbiAgICAgIGlmICghdGhpcy5uZ1RlbXBsYXRlT3V0bGV0KSB7XG4gICAgICAgIHRoaXMuX3ZpZXdSZWYgPSBudWxsO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIGNvbnRleHQgZm9yd2FyZCBgUHJveHlgIHRoYXQgd2lsbCBhbHdheXMgYmluZCB0byB0aGUgdXNlci1zcGVjaWZpZWQgY29udGV4dCxcbiAgICAgIC8vIHdpdGhvdXQgaGF2aW5nIHRvIGRlc3Ryb3kgYW5kIHJlLWNyZWF0ZSB2aWV3cyB3aGVuZXZlciB0aGUgY29udGV4dCBjaGFuZ2VzLlxuICAgICAgY29uc3Qgdmlld0NvbnRleHQgPSB0aGlzLl9jcmVhdGVDb250ZXh0Rm9yd2FyZFByb3h5KCk7XG4gICAgICB0aGlzLl92aWV3UmVmID0gdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5uZ1RlbXBsYXRlT3V0bGV0LCB2aWV3Q29udGV4dCwge1xuICAgICAgICBpbmplY3RvcjogdGhpcy5uZ1RlbXBsYXRlT3V0bGV0SW5qZWN0b3IgPz8gdW5kZWZpbmVkLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdlIG5lZWQgdG8gcmUtY3JlYXRlIGV4aXN0aW5nIGVtYmVkZGVkIHZpZXcgaWYgZWl0aGVyIGlzIHRydWU6XG4gICAqIC0gdGhlIG91dGxldCBjaGFuZ2VkLlxuICAgKiAtIHRoZSBpbmplY3RvciBjaGFuZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2hvdWxkUmVjcmVhdGVWaWV3KGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISFjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0J10gfHwgISFjaGFuZ2VzWyduZ1RlbXBsYXRlT3V0bGV0SW5qZWN0b3InXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgYSBnaXZlbiBvdXRsZXQgaW5zdGFuY2UsIHdlIGNyZWF0ZSBhIHByb3h5IG9iamVjdCB0aGF0IGRlbGVnYXRlc1xuICAgKiB0byB0aGUgdXNlci1zcGVjaWZpZWQgY29udGV4dC4gVGhpcyBhbGxvd3MgY2hhbmdpbmcsIG9yIHN3YXBwaW5nIG91dFxuICAgKiB0aGUgY29udGV4dCBvYmplY3QgY29tcGxldGVseSB3aXRob3V0IGhhdmluZyB0byBkZXN0cm95L3JlLWNyZWF0ZSB0aGUgdmlldy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZUNvbnRleHRGb3J3YXJkUHJveHkoKTogQyB7XG4gICAgcmV0dXJuIDxDPm5ldyBQcm94eSh7fSwge1xuICAgICAgc2V0OiAoX3RhcmdldCwgcHJvcCwgbmV3VmFsdWUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWZsZWN0LnNldCh0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0LCBwcm9wLCBuZXdWYWx1ZSk7XG4gICAgICB9LFxuICAgICAgZ2V0OiAoX3RhcmdldCwgcHJvcCwgcmVjZWl2ZXIpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm5nVGVtcGxhdGVPdXRsZXRDb250ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGhpcy5uZ1RlbXBsYXRlT3V0bGV0Q29udGV4dCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19