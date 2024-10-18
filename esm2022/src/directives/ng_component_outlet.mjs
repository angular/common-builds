/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { createNgModule, Directive, Injector, Input, NgModuleFactory, NgModuleRef, Type, ViewContainerRef, } from '@angular/core';
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
 * * `ngComponentOutletInputs`: Optional component inputs object, which will be bind to the
 * component.
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
 * With inputs
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   inputs: inputsExpression;">
 * </ng-container>
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
        this.ngComponentOutlet = null;
        /**
         * A helper data structure that allows us to track inputs that were part of the
         * ngComponentOutletInputs expression. Tracking inputs is necessary for proper removal of ones
         * that are no longer referenced.
         */
        this._inputsUsed = new Map();
    }
    _needToReCreateNgModuleInstance(changes) {
        // Note: square brackets property accessor is safe for Closure compiler optimizations (the
        // `changes` argument of the `ngOnChanges` lifecycle hook retains the names of the fields that
        // were changed).
        return (changes['ngComponentOutletNgModule'] !== undefined ||
            changes['ngComponentOutletNgModuleFactory'] !== undefined);
    }
    _needToReCreateComponentInstance(changes) {
        // Note: square brackets property accessor is safe for Closure compiler optimizations (the
        // `changes` argument of the `ngOnChanges` lifecycle hook retains the names of the fields that
        // were changed).
        return (changes['ngComponentOutlet'] !== undefined ||
            changes['ngComponentOutletContent'] !== undefined ||
            changes['ngComponentOutletInjector'] !== undefined ||
            this._needToReCreateNgModuleInstance(changes));
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (this._needToReCreateComponentInstance(changes)) {
            this._viewContainerRef.clear();
            this._inputsUsed.clear();
            this._componentRef = undefined;
            if (this.ngComponentOutlet) {
                const injector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;
                if (this._needToReCreateNgModuleInstance(changes)) {
                    this._moduleRef?.destroy();
                    if (this.ngComponentOutletNgModule) {
                        this._moduleRef = createNgModule(this.ngComponentOutletNgModule, getParentInjector(injector));
                    }
                    else if (this.ngComponentOutletNgModuleFactory) {
                        this._moduleRef = this.ngComponentOutletNgModuleFactory.create(getParentInjector(injector));
                    }
                    else {
                        this._moduleRef = undefined;
                    }
                }
                this._componentRef = this._viewContainerRef.createComponent(this.ngComponentOutlet, {
                    injector,
                    ngModuleRef: this._moduleRef,
                    projectableNodes: this.ngComponentOutletContent,
                });
            }
        }
    }
    /** @nodoc */
    ngDoCheck() {
        if (this._componentRef) {
            if (this.ngComponentOutletInputs) {
                for (const inputName of Object.keys(this.ngComponentOutletInputs)) {
                    this._inputsUsed.set(inputName, true);
                }
            }
            this._applyInputStateDiff(this._componentRef);
        }
    }
    /** @nodoc */
    ngOnDestroy() {
        this._moduleRef?.destroy();
    }
    _applyInputStateDiff(componentRef) {
        for (const [inputName, touched] of this._inputsUsed) {
            if (!touched) {
                // The input that was previously active no longer exists and needs to be set to undefined.
                componentRef.setInput(inputName, undefined);
                this._inputsUsed.delete(inputName);
            }
            else {
                // Since touched is true, it can be asserted that the inputs object is not empty.
                componentRef.setInput(inputName, this.ngComponentOutletInputs[inputName]);
                this._inputsUsed.set(inputName, false);
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8+sha-b0ab653", ngImport: i0, type: NgComponentOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8+sha-b0ab653", type: NgComponentOutlet, isStandalone: true, selector: "[ngComponentOutlet]", inputs: { ngComponentOutlet: "ngComponentOutlet", ngComponentOutletInputs: "ngComponentOutletInputs", ngComponentOutletInjector: "ngComponentOutletInjector", ngComponentOutletContent: "ngComponentOutletContent", ngComponentOutletNgModule: "ngComponentOutletNgModule", ngComponentOutletNgModuleFactory: "ngComponentOutletNgModuleFactory" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8+sha-b0ab653", ngImport: i0, type: NgComponentOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngComponentOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }], propDecorators: { ngComponentOutlet: [{
                type: Input
            }], ngComponentOutletInputs: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29tcG9uZW50X291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jb21wb25lbnRfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxjQUFjLEVBQ2QsU0FBUyxFQUVULFFBQVEsRUFDUixLQUFLLEVBQ0wsZUFBZSxFQUNmLFdBQVcsRUFJWCxJQUFJLEVBQ0osZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDOztBQUV2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvRUc7QUFLSCxNQUFNLE9BQU8saUJBQWlCO0lBdUI1QixZQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQXRCOUMsc0JBQWlCLEdBQXFCLElBQUksQ0FBQztRQWVwRDs7OztXQUlHO1FBQ0ssZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztJQUVTLENBQUM7SUFFbkQsK0JBQStCLENBQUMsT0FBc0I7UUFDNUQsMEZBQTBGO1FBQzFGLDhGQUE4RjtRQUM5RixpQkFBaUI7UUFDakIsT0FBTyxDQUNMLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLFNBQVM7WUFDbEQsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLEtBQUssU0FBUyxDQUMxRCxDQUFDO0lBQ0osQ0FBQztJQUVPLGdDQUFnQyxDQUFDLE9BQXNCO1FBQzdELDBGQUEwRjtRQUMxRiw4RkFBOEY7UUFDOUYsaUJBQWlCO1FBQ2pCLE9BQU8sQ0FDTCxPQUFPLENBQUMsbUJBQW1CLENBQUMsS0FBSyxTQUFTO1lBQzFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLFNBQVM7WUFDakQsT0FBTyxDQUFDLDJCQUEyQixDQUFDLEtBQUssU0FBUztZQUNsRCxJQUFJLENBQUMsK0JBQStCLENBQUMsT0FBTyxDQUFDLENBQzlDLENBQUM7SUFDSixDQUFDO0lBRUQsYUFBYTtJQUNiLFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1lBRS9CLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDO2dCQUV6RixJQUFJLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUNsRCxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUUzQixJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO3dCQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FDOUIsSUFBSSxDQUFDLHlCQUF5QixFQUM5QixpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FDNUIsQ0FBQztvQkFDSixDQUFDO3lCQUFNLElBQUksSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7d0JBQ2pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sQ0FDNUQsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQzVCLENBQUM7b0JBQ0osQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO29CQUM5QixDQUFDO2dCQUNILENBQUM7Z0JBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtvQkFDbEYsUUFBUTtvQkFDUixXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVU7b0JBQzVCLGdCQUFnQixFQUFFLElBQUksQ0FBQyx3QkFBd0I7aUJBQ2hELENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELGFBQWE7SUFDYixTQUFTO1FBQ1AsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkIsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDakMsS0FBSyxNQUFNLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUM7b0JBQ2xFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDO0lBRUQsYUFBYTtJQUNiLFdBQVc7UUFDVCxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTyxvQkFBb0IsQ0FBQyxZQUFtQztRQUM5RCxLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDYiwwRkFBMEY7Z0JBQzFGLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04saUZBQWlGO2dCQUNqRixZQUFZLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsdUJBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQzt5SEFqSFUsaUJBQWlCOzZHQUFqQixpQkFBaUI7O3NHQUFqQixpQkFBaUI7a0JBSjdCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO3FGQUVVLGlCQUFpQjtzQkFBekIsS0FBSztnQkFFRyx1QkFBdUI7c0JBQS9CLEtBQUs7Z0JBQ0cseUJBQXlCO3NCQUFqQyxLQUFLO2dCQUNHLHdCQUF3QjtzQkFBaEMsS0FBSztnQkFFRyx5QkFBeUI7c0JBQWpDLEtBQUs7Z0JBSUcsZ0NBQWdDO3NCQUF4QyxLQUFLOztBQXlHUiwwRUFBMEU7QUFDMUUsU0FBUyxpQkFBaUIsQ0FBQyxRQUFrQjtJQUMzQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRSZWYsXG4gIGNyZWF0ZU5nTW9kdWxlLFxuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgTmdNb2R1bGVGYWN0b3J5LFxuICBOZ01vZHVsZVJlZixcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFR5cGUsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEluc3RhbnRpYXRlcyBhIHtAbGluayBDb21wb25lbnR9IHR5cGUgYW5kIGluc2VydHMgaXRzIEhvc3QgVmlldyBpbnRvIHRoZSBjdXJyZW50IFZpZXcuXG4gKiBgTmdDb21wb25lbnRPdXRsZXRgIHByb3ZpZGVzIGEgZGVjbGFyYXRpdmUgYXBwcm9hY2ggZm9yIGR5bmFtaWMgY29tcG9uZW50IGNyZWF0aW9uLlxuICpcbiAqIGBOZ0NvbXBvbmVudE91dGxldGAgcmVxdWlyZXMgYSBjb21wb25lbnQgdHlwZSwgaWYgYSBmYWxzeSB2YWx1ZSBpcyBzZXQgdGhlIHZpZXcgd2lsbCBjbGVhciBhbmRcbiAqIGFueSBleGlzdGluZyBjb21wb25lbnQgd2lsbCBiZSBkZXN0cm95ZWQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRmluZSB0dW5lIGNvbnRyb2xcbiAqXG4gKiBZb3UgY2FuIGNvbnRyb2wgdGhlIGNvbXBvbmVudCBjcmVhdGlvbiBwcm9jZXNzIGJ5IHVzaW5nIHRoZSBmb2xsb3dpbmcgb3B0aW9uYWwgYXR0cmlidXRlczpcbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldElucHV0c2A6IE9wdGlvbmFsIGNvbXBvbmVudCBpbnB1dHMgb2JqZWN0LCB3aGljaCB3aWxsIGJlIGJpbmQgdG8gdGhlXG4gKiBjb21wb25lbnQuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXRJbmplY3RvcmA6IE9wdGlvbmFsIGN1c3RvbSB7QGxpbmsgSW5qZWN0b3J9IHRoYXQgd2lsbCBiZSB1c2VkIGFzIHBhcmVudCBmb3JcbiAqIHRoZSBDb21wb25lbnQuIERlZmF1bHRzIHRvIHRoZSBpbmplY3RvciBvZiB0aGUgY3VycmVudCB2aWV3IGNvbnRhaW5lci5cbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldENvbnRlbnRgOiBPcHRpb25hbCBsaXN0IG9mIHByb2plY3RhYmxlIG5vZGVzIHRvIGluc2VydCBpbnRvIHRoZSBjb250ZW50XG4gKiBzZWN0aW9uIG9mIHRoZSBjb21wb25lbnQsIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlYDogT3B0aW9uYWwgTmdNb2R1bGUgY2xhc3MgcmVmZXJlbmNlIHRvIGFsbG93IGxvYWRpbmcgYW5vdGhlclxuICogbW9kdWxlIGR5bmFtaWNhbGx5LCB0aGVuIGxvYWRpbmcgYSBjb21wb25lbnQgZnJvbSB0aGF0IG1vZHVsZS5cbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeWA6IERlcHJlY2F0ZWQgY29uZmlnIG9wdGlvbiB0aGF0IGFsbG93cyBwcm92aWRpbmcgb3B0aW9uYWxcbiAqIE5nTW9kdWxlIGZhY3RvcnkgdG8gYWxsb3cgbG9hZGluZyBhbm90aGVyIG1vZHVsZSBkeW5hbWljYWxseSwgdGhlbiBsb2FkaW5nIGEgY29tcG9uZW50IGZyb20gdGhhdFxuICogbW9kdWxlLiBVc2UgYG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVgIGluc3RlYWQuXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIFNpbXBsZVxuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uXCI+PC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBXaXRoIGlucHV0c1xuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogaW5wdXRzRXhwcmVzc2lvbjtcIj5cbiAqIDwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogQ3VzdG9taXplZCBpbmplY3Rvci9jb250ZW50XG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0b3I6IGluamVjdG9yRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50Tm9kZXNFeHByZXNzaW9uO1wiPlxuICogPC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBDdXN0b21pemVkIE5nTW9kdWxlIHJlZmVyZW5jZVxuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlOiBuZ01vZHVsZUNsYXNzO1wiPlxuICogPC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiAjIyMgQSBzaW1wbGUgZXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdDb21wb25lbnRPdXRsZXQvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nU2ltcGxlRXhhbXBsZSd9XG4gKlxuICogQSBtb3JlIGNvbXBsZXRlIGV4YW1wbGUgd2l0aCBhZGRpdGlvbmFsIG9wdGlvbnM6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0NvbXBvbmVudE91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdDb21wbGV0ZUV4YW1wbGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nQ29tcG9uZW50T3V0bGV0XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE5nQ29tcG9uZW50T3V0bGV0IGltcGxlbWVudHMgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldDogVHlwZTxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXRJbnB1dHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXRJbmplY3Rvcj86IEluamVjdG9yO1xuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldENvbnRlbnQ/OiBhbnlbXVtdO1xuXG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGU/OiBUeXBlPGFueT47XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBUaGlzIGlucHV0IGlzIGRlcHJlY2F0ZWQsIHVzZSBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZWAgaW5zdGVhZC5cbiAgICovXG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVGYWN0b3J5PzogTmdNb2R1bGVGYWN0b3J5PGFueT47XG5cbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PiB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfbW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBBIGhlbHBlciBkYXRhIHN0cnVjdHVyZSB0aGF0IGFsbG93cyB1cyB0byB0cmFjayBpbnB1dHMgdGhhdCB3ZXJlIHBhcnQgb2YgdGhlXG4gICAqIG5nQ29tcG9uZW50T3V0bGV0SW5wdXRzIGV4cHJlc3Npb24uIFRyYWNraW5nIGlucHV0cyBpcyBuZWNlc3NhcnkgZm9yIHByb3BlciByZW1vdmFsIG9mIG9uZXNcbiAgICogdGhhdCBhcmUgbm8gbG9uZ2VyIHJlZmVyZW5jZWQuXG4gICAqL1xuICBwcml2YXRlIF9pbnB1dHNVc2VkID0gbmV3IE1hcDxzdHJpbmcsIGJvb2xlYW4+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBwcml2YXRlIF9uZWVkVG9SZUNyZWF0ZU5nTW9kdWxlSW5zdGFuY2UoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IGJvb2xlYW4ge1xuICAgIC8vIE5vdGU6IHNxdWFyZSBicmFja2V0cyBwcm9wZXJ0eSBhY2Nlc3NvciBpcyBzYWZlIGZvciBDbG9zdXJlIGNvbXBpbGVyIG9wdGltaXphdGlvbnMgKHRoZVxuICAgIC8vIGBjaGFuZ2VzYCBhcmd1bWVudCBvZiB0aGUgYG5nT25DaGFuZ2VzYCBsaWZlY3ljbGUgaG9vayByZXRhaW5zIHRoZSBuYW1lcyBvZiB0aGUgZmllbGRzIHRoYXRcbiAgICAvLyB3ZXJlIGNoYW5nZWQpLlxuICAgIHJldHVybiAoXG4gICAgICBjaGFuZ2VzWyduZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlJ10gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgY2hhbmdlc1snbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3RvcnknXSAhPT0gdW5kZWZpbmVkXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX25lZWRUb1JlQ3JlYXRlQ29tcG9uZW50SW5zdGFuY2UoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IGJvb2xlYW4ge1xuICAgIC8vIE5vdGU6IHNxdWFyZSBicmFja2V0cyBwcm9wZXJ0eSBhY2Nlc3NvciBpcyBzYWZlIGZvciBDbG9zdXJlIGNvbXBpbGVyIG9wdGltaXphdGlvbnMgKHRoZVxuICAgIC8vIGBjaGFuZ2VzYCBhcmd1bWVudCBvZiB0aGUgYG5nT25DaGFuZ2VzYCBsaWZlY3ljbGUgaG9vayByZXRhaW5zIHRoZSBuYW1lcyBvZiB0aGUgZmllbGRzIHRoYXRcbiAgICAvLyB3ZXJlIGNoYW5nZWQpLlxuICAgIHJldHVybiAoXG4gICAgICBjaGFuZ2VzWyduZ0NvbXBvbmVudE91dGxldCddICE9PSB1bmRlZmluZWQgfHxcbiAgICAgIGNoYW5nZXNbJ25nQ29tcG9uZW50T3V0bGV0Q29udGVudCddICE9PSB1bmRlZmluZWQgfHxcbiAgICAgIGNoYW5nZXNbJ25nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3InXSAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICB0aGlzLl9uZWVkVG9SZUNyZWF0ZU5nTW9kdWxlSW5zdGFuY2UoY2hhbmdlcylcbiAgICApO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKHRoaXMuX25lZWRUb1JlQ3JlYXRlQ29tcG9uZW50SW5zdGFuY2UoY2hhbmdlcykpIHtcbiAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgICAgIHRoaXMuX2lucHV0c1VzZWQuY2xlYXIoKTtcbiAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHRoaXMubmdDb21wb25lbnRPdXRsZXQpIHtcbiAgICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLm5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3IgfHwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5wYXJlbnRJbmplY3RvcjtcblxuICAgICAgICBpZiAodGhpcy5fbmVlZFRvUmVDcmVhdGVOZ01vZHVsZUluc3RhbmNlKGNoYW5nZXMpKSB7XG4gICAgICAgICAgdGhpcy5fbW9kdWxlUmVmPy5kZXN0cm95KCk7XG5cbiAgICAgICAgICBpZiAodGhpcy5uZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2R1bGVSZWYgPSBjcmVhdGVOZ01vZHVsZShcbiAgICAgICAgICAgICAgdGhpcy5uZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlLFxuICAgICAgICAgICAgICBnZXRQYXJlbnRJbmplY3RvcihpbmplY3RvciksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5uZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeSkge1xuICAgICAgICAgICAgdGhpcy5fbW9kdWxlUmVmID0gdGhpcy5uZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeS5jcmVhdGUoXG4gICAgICAgICAgICAgIGdldFBhcmVudEluamVjdG9yKGluamVjdG9yKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCh0aGlzLm5nQ29tcG9uZW50T3V0bGV0LCB7XG4gICAgICAgICAgaW5qZWN0b3IsXG4gICAgICAgICAgbmdNb2R1bGVSZWY6IHRoaXMuX21vZHVsZVJlZixcbiAgICAgICAgICBwcm9qZWN0YWJsZU5vZGVzOiB0aGlzLm5nQ29tcG9uZW50T3V0bGV0Q29udGVudCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudFJlZikge1xuICAgICAgaWYgKHRoaXMubmdDb21wb25lbnRPdXRsZXRJbnB1dHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBpbnB1dE5hbWUgb2YgT2JqZWN0LmtleXModGhpcy5uZ0NvbXBvbmVudE91dGxldElucHV0cykpIHtcbiAgICAgICAgICB0aGlzLl9pbnB1dHNVc2VkLnNldChpbnB1dE5hbWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2FwcGx5SW5wdXRTdGF0ZURpZmYodGhpcy5fY29tcG9uZW50UmVmKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX21vZHVsZVJlZj8uZGVzdHJveSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlJbnB1dFN0YXRlRGlmZihjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjx1bmtub3duPikge1xuICAgIGZvciAoY29uc3QgW2lucHV0TmFtZSwgdG91Y2hlZF0gb2YgdGhpcy5faW5wdXRzVXNlZCkge1xuICAgICAgaWYgKCF0b3VjaGVkKSB7XG4gICAgICAgIC8vIFRoZSBpbnB1dCB0aGF0IHdhcyBwcmV2aW91c2x5IGFjdGl2ZSBubyBsb25nZXIgZXhpc3RzIGFuZCBuZWVkcyB0byBiZSBzZXQgdG8gdW5kZWZpbmVkLlxuICAgICAgICBjb21wb25lbnRSZWYuc2V0SW5wdXQoaW5wdXROYW1lLCB1bmRlZmluZWQpO1xuICAgICAgICB0aGlzLl9pbnB1dHNVc2VkLmRlbGV0ZShpbnB1dE5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2luY2UgdG91Y2hlZCBpcyB0cnVlLCBpdCBjYW4gYmUgYXNzZXJ0ZWQgdGhhdCB0aGUgaW5wdXRzIG9iamVjdCBpcyBub3QgZW1wdHkuXG4gICAgICAgIGNvbXBvbmVudFJlZi5zZXRJbnB1dChpbnB1dE5hbWUsIHRoaXMubmdDb21wb25lbnRPdXRsZXRJbnB1dHMhW2lucHV0TmFtZV0pO1xuICAgICAgICB0aGlzLl9pbnB1dHNVc2VkLnNldChpbnB1dE5hbWUsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBJbmplY3RvciBpbnN0YW5jZSBvZiBhIHBhcmVudCBOZ01vZHVsZS5cbmZ1bmN0aW9uIGdldFBhcmVudEluamVjdG9yKGluamVjdG9yOiBJbmplY3Rvcik6IEluamVjdG9yIHtcbiAgY29uc3QgcGFyZW50TmdNb2R1bGUgPSBpbmplY3Rvci5nZXQoTmdNb2R1bGVSZWYpO1xuICByZXR1cm4gcGFyZW50TmdNb2R1bGUuaW5qZWN0b3I7XG59XG4iXX0=