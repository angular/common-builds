/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { createNgModuleRef, Directive, Injector, Input, NgModuleFactory, NgModuleRef, Type, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Instantiates a {@link Component} type and inserts its Host View into the current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will be destroyed.
 *
 * @usageNotes
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngComponentOutletInjector`: Optional custom {@link Injector} that will be used as parent for
 * the Component. Defaults to the injector of the current view container.
 *
 * * `ngComponentOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if it exists.
 *
 * * `ngComponentOutletNgModule`: Optional NgModule class reference to allow loading another
 * module dynamically, then loading a component from that module.
 *
 * * `ngComponentOutletNgModuleFactory`: Deprecated config option that allows providing optional
 * NgModule factory to allow loading another module dynamically, then loading a component from that
 * module. Use `ngComponentOutletNgModule` instead.
 *
 * ### Syntax
 *
 * Simple
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * Customized injector/content
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression;">
 * </ng-container>
 * ```
 *
 * Customized NgModule reference
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   ngModule: ngModuleClass;">
 * </ng-container>
 * ```
 *
 * ### A simple example
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='SimpleExample'}
 *
 * A more complete example with additional options:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='CompleteExample'}
 *
 * @publicApi
 * @ngModule CommonModule
 */
export class NgComponentOutlet {
    constructor(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
    }
    ngOnChanges(changes) {
        const { _viewContainerRef: viewContainerRef, ngComponentOutletNgModule: ngModule, ngComponentOutletNgModuleFactory: ngModuleFactory, } = this;
        viewContainerRef.clear();
        this._componentRef = undefined;
        if (this.ngComponentOutlet) {
            const injector = this.ngComponentOutletInjector || viewContainerRef.parentInjector;
            if (changes['ngComponentOutletNgModule'] || changes['ngComponentOutletNgModuleFactory']) {
                if (this._moduleRef)
                    this._moduleRef.destroy();
                if (ngModule) {
                    this._moduleRef = createNgModuleRef(ngModule, getParentInjector(injector));
                }
                else if (ngModuleFactory) {
                    this._moduleRef = ngModuleFactory.create(getParentInjector(injector));
                }
                else {
                    this._moduleRef = undefined;
                }
            }
            this._componentRef = viewContainerRef.createComponent(this.ngComponentOutlet, {
                index: viewContainerRef.length,
                injector,
                ngModuleRef: this._moduleRef,
                projectableNodes: this.ngComponentOutletContent,
            });
        }
    }
    ngOnDestroy() {
        if (this._moduleRef)
            this._moduleRef.destroy();
    }
}
NgComponentOutlet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.1+27.sha-e46b379.with-local-changes", ngImport: i0, type: NgComponentOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
NgComponentOutlet.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.1+27.sha-e46b379.with-local-changes", type: NgComponentOutlet, selector: "[ngComponentOutlet]", inputs: { ngComponentOutlet: "ngComponentOutlet", ngComponentOutletInjector: "ngComponentOutletInjector", ngComponentOutletContent: "ngComponentOutletContent", ngComponentOutletNgModule: "ngComponentOutletNgModule", ngComponentOutletNgModuleFactory: "ngComponentOutletNgModuleFactory" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.1+27.sha-e46b379.with-local-changes", ngImport: i0, type: NgComponentOutlet, decorators: [{
            type: Directive,
            args: [{ selector: '[ngComponentOutlet]' }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }]; }, propDecorators: { ngComponentOutlet: [{
                type: Input
            }], ngComponentOutletInjector: [{
                type: Input
            }], ngComponentOutletContent: [{
                type: Input
            }], ngComponentOutletNgModule: [{
                type: Input
            }], ngComponentOutletNgModuleFactory: [{
                type: Input
            }] } });
// Helper function that returns an Injector instance of a parent NgModule.
function getParentInjector(injector) {
    const parentNgModule = injector.get(NgModuleRef);
    return parentNgModule.injector;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29tcG9uZW50X291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jb21wb25lbnRfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUF1QyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBR3JMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMERHO0FBRUgsTUFBTSxPQUFPLGlCQUFpQjtJQWU1QixZQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtJQUFHLENBQUM7SUFFM0QsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLE1BQU0sRUFDSixpQkFBaUIsRUFBRSxnQkFBZ0IsRUFDbkMseUJBQXlCLEVBQUUsUUFBUSxFQUNuQyxnQ0FBZ0MsRUFBRSxlQUFlLEdBQ2xELEdBQUcsSUFBSSxDQUFDO1FBQ1QsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7UUFFL0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixJQUFJLGdCQUFnQixDQUFDLGNBQWMsQ0FBQztZQUVuRixJQUFJLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO2dCQUN2RixJQUFJLElBQUksQ0FBQyxVQUFVO29CQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRS9DLElBQUksUUFBUSxFQUFFO29CQUNaLElBQUksQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQzVFO3FCQUFNLElBQUksZUFBZSxFQUFFO29CQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDdkU7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7aUJBQzdCO2FBQ0Y7WUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzVFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNO2dCQUM5QixRQUFRO2dCQUNSLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDNUIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QjthQUNoRCxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsVUFBVTtZQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakQsQ0FBQzs7eUhBcERVLGlCQUFpQjs2R0FBakIsaUJBQWlCO3NHQUFqQixpQkFBaUI7a0JBRDdCLFNBQVM7bUJBQUMsRUFBQyxRQUFRLEVBQUUscUJBQXFCLEVBQUM7dUdBRWpDLGlCQUFpQjtzQkFBekIsS0FBSztnQkFFRyx5QkFBeUI7c0JBQWpDLEtBQUs7Z0JBQ0csd0JBQXdCO3NCQUFoQyxLQUFLO2dCQUVHLHlCQUF5QjtzQkFBakMsS0FBSztnQkFJRyxnQ0FBZ0M7c0JBQXhDLEtBQUs7O0FBNkNSLDBFQUEwRTtBQUMxRSxTQUFTLGlCQUFpQixDQUFDLFFBQWtCO0lBQzNDLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakQsT0FBTyxjQUFjLENBQUMsUUFBUSxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRSZWYsIGNyZWF0ZU5nTW9kdWxlUmVmLCBEaXJlY3RpdmUsIEluamVjdG9yLCBJbnB1dCwgTmdNb2R1bGVGYWN0b3J5LCBOZ01vZHVsZVJlZiwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIFNpbXBsZUNoYW5nZXMsIFR5cGUsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbi8qKlxuICogSW5zdGFudGlhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gdHlwZSBhbmQgaW5zZXJ0cyBpdHMgSG9zdCBWaWV3IGludG8gdGhlIGN1cnJlbnQgVmlldy5cbiAqIGBOZ0NvbXBvbmVudE91dGxldGAgcHJvdmlkZXMgYSBkZWNsYXJhdGl2ZSBhcHByb2FjaCBmb3IgZHluYW1pYyBjb21wb25lbnQgY3JlYXRpb24uXG4gKlxuICogYE5nQ29tcG9uZW50T3V0bGV0YCByZXF1aXJlcyBhIGNvbXBvbmVudCB0eXBlLCBpZiBhIGZhbHN5IHZhbHVlIGlzIHNldCB0aGUgdmlldyB3aWxsIGNsZWFyIGFuZFxuICogYW55IGV4aXN0aW5nIGNvbXBvbmVudCB3aWxsIGJlIGRlc3Ryb3llZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBGaW5lIHR1bmUgY29udHJvbFxuICpcbiAqIFlvdSBjYW4gY29udHJvbCB0aGUgY29tcG9uZW50IGNyZWF0aW9uIHByb2Nlc3MgYnkgdXNpbmcgdGhlIGZvbGxvd2luZyBvcHRpb25hbCBhdHRyaWJ1dGVzOlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3JgOiBPcHRpb25hbCBjdXN0b20ge0BsaW5rIEluamVjdG9yfSB0aGF0IHdpbGwgYmUgdXNlZCBhcyBwYXJlbnQgZm9yXG4gKiB0aGUgQ29tcG9uZW50LiBEZWZhdWx0cyB0byB0aGUgaW5qZWN0b3Igb2YgdGhlIGN1cnJlbnQgdmlldyBjb250YWluZXIuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXRDb250ZW50YDogT3B0aW9uYWwgbGlzdCBvZiBwcm9qZWN0YWJsZSBub2RlcyB0byBpbnNlcnQgaW50byB0aGUgY29udGVudFxuICogc2VjdGlvbiBvZiB0aGUgY29tcG9uZW50LCBpZiBpdCBleGlzdHMuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZWA6IE9wdGlvbmFsIE5nTW9kdWxlIGNsYXNzIHJlZmVyZW5jZSB0byBhbGxvdyBsb2FkaW5nIGFub3RoZXJcbiAqIG1vZHVsZSBkeW5hbWljYWxseSwgdGhlbiBsb2FkaW5nIGEgY29tcG9uZW50IGZyb20gdGhhdCBtb2R1bGUuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3RvcnlgOiBEZXByZWNhdGVkIGNvbmZpZyBvcHRpb24gdGhhdCBhbGxvd3MgcHJvdmlkaW5nIG9wdGlvbmFsXG4gKiBOZ01vZHVsZSBmYWN0b3J5IHRvIGFsbG93IGxvYWRpbmcgYW5vdGhlciBtb2R1bGUgZHluYW1pY2FsbHksIHRoZW4gbG9hZGluZyBhIGNvbXBvbmVudCBmcm9tIHRoYXRcbiAqIG1vZHVsZS4gVXNlIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlYCBpbnN0ZWFkLlxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiBTaW1wbGVcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvblwiPjwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogQ3VzdG9taXplZCBpbmplY3Rvci9jb250ZW50XG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0b3I6IGluamVjdG9yRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50Tm9kZXNFeHByZXNzaW9uO1wiPlxuICogPC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBDdXN0b21pemVkIE5nTW9kdWxlIHJlZmVyZW5jZVxuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlOiBuZ01vZHVsZUNsYXNzO1wiPlxuICogPC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiAjIyMgQSBzaW1wbGUgZXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdDb21wb25lbnRPdXRsZXQvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nU2ltcGxlRXhhbXBsZSd9XG4gKlxuICogQSBtb3JlIGNvbXBsZXRlIGV4YW1wbGUgd2l0aCBhZGRpdGlvbmFsIG9wdGlvbnM6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0NvbXBvbmVudE91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdDb21wbGV0ZUV4YW1wbGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDb21wb25lbnRPdXRsZXRdJ30pXG5leHBvcnQgY2xhc3MgTmdDb21wb25lbnRPdXRsZXQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0ITogVHlwZTxhbnk+O1xuXG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3I/OiBJbmplY3RvcjtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXRDb250ZW50PzogYW55W11bXTtcblxuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlPzogVHlwZTxhbnk+O1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgVGhpcyBpbnB1dCBpcyBkZXByZWNhdGVkLCB1c2UgYG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVgIGluc3RlYWQuXG4gICAqL1xuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeT86IE5nTW9kdWxlRmFjdG9yeTxhbnk+O1xuXG4gIHByaXZhdGUgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT58dW5kZWZpbmVkO1xuICBwcml2YXRlIF9tb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT58dW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHtcbiAgICAgIF92aWV3Q29udGFpbmVyUmVmOiB2aWV3Q29udGFpbmVyUmVmLFxuICAgICAgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZTogbmdNb2R1bGUsXG4gICAgICBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeTogbmdNb2R1bGVGYWN0b3J5LFxuICAgIH0gPSB0aGlzO1xuICAgIHZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAodGhpcy5uZ0NvbXBvbmVudE91dGxldCkge1xuICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLm5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3IgfHwgdmlld0NvbnRhaW5lclJlZi5wYXJlbnRJbmplY3RvcjtcblxuICAgICAgaWYgKGNoYW5nZXNbJ25nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGUnXSB8fCBjaGFuZ2VzWyduZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeSddKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2R1bGVSZWYpIHRoaXMuX21vZHVsZVJlZi5kZXN0cm95KCk7XG5cbiAgICAgICAgaWYgKG5nTW9kdWxlKSB7XG4gICAgICAgICAgdGhpcy5fbW9kdWxlUmVmID0gY3JlYXRlTmdNb2R1bGVSZWYobmdNb2R1bGUsIGdldFBhcmVudEluamVjdG9yKGluamVjdG9yKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobmdNb2R1bGVGYWN0b3J5KSB7XG4gICAgICAgICAgdGhpcy5fbW9kdWxlUmVmID0gbmdNb2R1bGVGYWN0b3J5LmNyZWF0ZShnZXRQYXJlbnRJbmplY3RvcihpbmplY3RvcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCh0aGlzLm5nQ29tcG9uZW50T3V0bGV0LCB7XG4gICAgICAgIGluZGV4OiB2aWV3Q29udGFpbmVyUmVmLmxlbmd0aCxcbiAgICAgICAgaW5qZWN0b3IsXG4gICAgICAgIG5nTW9kdWxlUmVmOiB0aGlzLl9tb2R1bGVSZWYsXG4gICAgICAgIHByb2plY3RhYmxlTm9kZXM6IHRoaXMubmdDb21wb25lbnRPdXRsZXRDb250ZW50LFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX21vZHVsZVJlZikgdGhpcy5fbW9kdWxlUmVmLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIEluamVjdG9yIGluc3RhbmNlIG9mIGEgcGFyZW50IE5nTW9kdWxlLlxuZnVuY3Rpb24gZ2V0UGFyZW50SW5qZWN0b3IoaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3Ige1xuICBjb25zdCBwYXJlbnROZ01vZHVsZSA9IGluamVjdG9yLmdldChOZ01vZHVsZVJlZik7XG4gIHJldHVybiBwYXJlbnROZ01vZHVsZS5pbmplY3Rvcjtcbn1cbiJdfQ==