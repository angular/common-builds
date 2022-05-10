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
    /** @nodoc */
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
    /** @nodoc */
    ngOnDestroy() {
        if (this._moduleRef)
            this._moduleRef.destroy();
    }
}
NgComponentOutlet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.16+sha-7dd6450", ngImport: i0, type: NgComponentOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
NgComponentOutlet.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-next.16+sha-7dd6450", type: NgComponentOutlet, selector: "[ngComponentOutlet]", inputs: { ngComponentOutlet: "ngComponentOutlet", ngComponentOutletInjector: "ngComponentOutletInjector", ngComponentOutletContent: "ngComponentOutletContent", ngComponentOutletNgModule: "ngComponentOutletNgModule", ngComponentOutletNgModuleFactory: "ngComponentOutletNgModuleFactory" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.16+sha-7dd6450", ngImport: i0, type: NgComponentOutlet, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29tcG9uZW50X291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jb21wb25lbnRfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUF1QyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBR3JMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMERHO0FBRUgsTUFBTSxPQUFPLGlCQUFpQjtJQWU1QixZQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtJQUFHLENBQUM7SUFFM0QsYUFBYTtJQUNiLFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxNQUFNLEVBQ0osaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQ25DLHlCQUF5QixFQUFFLFFBQVEsRUFDbkMsZ0NBQWdDLEVBQUUsZUFBZSxHQUNsRCxHQUFHLElBQUksQ0FBQztRQUNULGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1FBRS9CLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQzFCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUM7WUFFbkYsSUFBSSxPQUFPLENBQUMsMkJBQTJCLENBQUMsSUFBSSxPQUFPLENBQUMsa0NBQWtDLENBQUMsRUFBRTtnQkFDdkYsSUFBSSxJQUFJLENBQUMsVUFBVTtvQkFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUUvQyxJQUFJLFFBQVEsRUFBRTtvQkFDWixJQUFJLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUM1RTtxQkFBTSxJQUFJLGVBQWUsRUFBRTtvQkFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZFO3FCQUFNO29CQUNMLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO2lCQUM3QjthQUNGO1lBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUM1RSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTtnQkFDOUIsUUFBUTtnQkFDUixXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzVCLGdCQUFnQixFQUFFLElBQUksQ0FBQyx3QkFBd0I7YUFDaEQsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQsYUFBYTtJQUNiLFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxVQUFVO1lBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqRCxDQUFDOzt5SEF0RFUsaUJBQWlCOzZHQUFqQixpQkFBaUI7c0dBQWpCLGlCQUFpQjtrQkFEN0IsU0FBUzttQkFBQyxFQUFDLFFBQVEsRUFBRSxxQkFBcUIsRUFBQzt1R0FFakMsaUJBQWlCO3NCQUF6QixLQUFLO2dCQUVHLHlCQUF5QjtzQkFBakMsS0FBSztnQkFDRyx3QkFBd0I7c0JBQWhDLEtBQUs7Z0JBRUcseUJBQXlCO3NCQUFqQyxLQUFLO2dCQUlHLGdDQUFnQztzQkFBeEMsS0FBSzs7QUErQ1IsMEVBQTBFO0FBQzFFLFNBQVMsaUJBQWlCLENBQUMsUUFBa0I7SUFDM0MsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUM7QUFDakMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudFJlZiwgY3JlYXRlTmdNb2R1bGVSZWYsIERpcmVjdGl2ZSwgSW5qZWN0b3IsIElucHV0LCBOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgU2ltcGxlQ2hhbmdlcywgVHlwZSwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuLyoqXG4gKiBJbnN0YW50aWF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSB0eXBlIGFuZCBpbnNlcnRzIGl0cyBIb3N0IFZpZXcgaW50byB0aGUgY3VycmVudCBWaWV3LlxuICogYE5nQ29tcG9uZW50T3V0bGV0YCBwcm92aWRlcyBhIGRlY2xhcmF0aXZlIGFwcHJvYWNoIGZvciBkeW5hbWljIGNvbXBvbmVudCBjcmVhdGlvbi5cbiAqXG4gKiBgTmdDb21wb25lbnRPdXRsZXRgIHJlcXVpcmVzIGEgY29tcG9uZW50IHR5cGUsIGlmIGEgZmFsc3kgdmFsdWUgaXMgc2V0IHRoZSB2aWV3IHdpbGwgY2xlYXIgYW5kXG4gKiBhbnkgZXhpc3RpbmcgY29tcG9uZW50IHdpbGwgYmUgZGVzdHJveWVkLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEZpbmUgdHVuZSBjb250cm9sXG4gKlxuICogWW91IGNhbiBjb250cm9sIHRoZSBjb21wb25lbnQgY3JlYXRpb24gcHJvY2VzcyBieSB1c2luZyB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIGF0dHJpYnV0ZXM6XG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXRJbmplY3RvcmA6IE9wdGlvbmFsIGN1c3RvbSB7QGxpbmsgSW5qZWN0b3J9IHRoYXQgd2lsbCBiZSB1c2VkIGFzIHBhcmVudCBmb3JcbiAqIHRoZSBDb21wb25lbnQuIERlZmF1bHRzIHRvIHRoZSBpbmplY3RvciBvZiB0aGUgY3VycmVudCB2aWV3IGNvbnRhaW5lci5cbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldENvbnRlbnRgOiBPcHRpb25hbCBsaXN0IG9mIHByb2plY3RhYmxlIG5vZGVzIHRvIGluc2VydCBpbnRvIHRoZSBjb250ZW50XG4gKiBzZWN0aW9uIG9mIHRoZSBjb21wb25lbnQsIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlYDogT3B0aW9uYWwgTmdNb2R1bGUgY2xhc3MgcmVmZXJlbmNlIHRvIGFsbG93IGxvYWRpbmcgYW5vdGhlclxuICogbW9kdWxlIGR5bmFtaWNhbGx5LCB0aGVuIGxvYWRpbmcgYSBjb21wb25lbnQgZnJvbSB0aGF0IG1vZHVsZS5cbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeWA6IERlcHJlY2F0ZWQgY29uZmlnIG9wdGlvbiB0aGF0IGFsbG93cyBwcm92aWRpbmcgb3B0aW9uYWxcbiAqIE5nTW9kdWxlIGZhY3RvcnkgdG8gYWxsb3cgbG9hZGluZyBhbm90aGVyIG1vZHVsZSBkeW5hbWljYWxseSwgdGhlbiBsb2FkaW5nIGEgY29tcG9uZW50IGZyb20gdGhhdFxuICogbW9kdWxlLiBVc2UgYG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVgIGluc3RlYWQuXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIFNpbXBsZVxuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uXCI+PC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBDdXN0b21pemVkIGluamVjdG9yL2NvbnRlbnRcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RvcjogaW5qZWN0b3JFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnROb2Rlc0V4cHJlc3Npb247XCI+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIEN1c3RvbWl6ZWQgTmdNb2R1bGUgcmVmZXJlbmNlXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmdNb2R1bGU6IG5nTW9kdWxlQ2xhc3M7XCI+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqICMjIyBBIHNpbXBsZSBleGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0NvbXBvbmVudE91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdTaW1wbGVFeGFtcGxlJ31cbiAqXG4gKiBBIG1vcmUgY29tcGxldGUgZXhhbXBsZSB3aXRoIGFkZGl0aW9uYWwgb3B0aW9uczpcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nQ29tcG9uZW50T3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J0NvbXBsZXRlRXhhbXBsZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0NvbXBvbmVudE91dGxldF0nfSlcbmV4cG9ydCBjbGFzcyBOZ0NvbXBvbmVudE91dGxldCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXQhOiBUeXBlPGFueT47XG5cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXRJbmplY3Rvcj86IEluamVjdG9yO1xuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldENvbnRlbnQ/OiBhbnlbXVtdO1xuXG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGU/OiBUeXBlPGFueT47XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBUaGlzIGlucHV0IGlzIGRlcHJlY2F0ZWQsIHVzZSBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZWAgaW5zdGVhZC5cbiAgICovXG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVGYWN0b3J5PzogTmdNb2R1bGVGYWN0b3J5PGFueT47XG5cbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55Pnx1bmRlZmluZWQ7XG4gIHByaXZhdGUgX21vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55Pnx1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCB7XG4gICAgICBfdmlld0NvbnRhaW5lclJlZjogdmlld0NvbnRhaW5lclJlZixcbiAgICAgIG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGU6IG5nTW9kdWxlLFxuICAgICAgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3Rvcnk6IG5nTW9kdWxlRmFjdG9yeSxcbiAgICB9ID0gdGhpcztcbiAgICB2aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKHRoaXMubmdDb21wb25lbnRPdXRsZXQpIHtcbiAgICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5uZ0NvbXBvbmVudE91dGxldEluamVjdG9yIHx8IHZpZXdDb250YWluZXJSZWYucGFyZW50SW5qZWN0b3I7XG5cbiAgICAgIGlmIChjaGFuZ2VzWyduZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlJ10gfHwgY2hhbmdlc1snbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3RvcnknXSkge1xuICAgICAgICBpZiAodGhpcy5fbW9kdWxlUmVmKSB0aGlzLl9tb2R1bGVSZWYuZGVzdHJveSgpO1xuXG4gICAgICAgIGlmIChuZ01vZHVsZSkge1xuICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IGNyZWF0ZU5nTW9kdWxlUmVmKG5nTW9kdWxlLCBnZXRQYXJlbnRJbmplY3RvcihpbmplY3RvcikpO1xuICAgICAgICB9IGVsc2UgaWYgKG5nTW9kdWxlRmFjdG9yeSkge1xuICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IG5nTW9kdWxlRmFjdG9yeS5jcmVhdGUoZ2V0UGFyZW50SW5qZWN0b3IoaW5qZWN0b3IpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9tb2R1bGVSZWYgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gdmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQodGhpcy5uZ0NvbXBvbmVudE91dGxldCwge1xuICAgICAgICBpbmRleDogdmlld0NvbnRhaW5lclJlZi5sZW5ndGgsXG4gICAgICAgIGluamVjdG9yLFxuICAgICAgICBuZ01vZHVsZVJlZjogdGhpcy5fbW9kdWxlUmVmLFxuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzOiB0aGlzLm5nQ29tcG9uZW50T3V0bGV0Q29udGVudCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX21vZHVsZVJlZikgdGhpcy5fbW9kdWxlUmVmLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIEluamVjdG9yIGluc3RhbmNlIG9mIGEgcGFyZW50IE5nTW9kdWxlLlxuZnVuY3Rpb24gZ2V0UGFyZW50SW5qZWN0b3IoaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3Ige1xuICBjb25zdCBwYXJlbnROZ01vZHVsZSA9IGluamVjdG9yLmdldChOZ01vZHVsZVJlZik7XG4gIHJldHVybiBwYXJlbnROZ01vZHVsZS5pbmplY3Rvcjtcbn1cbiJdfQ==