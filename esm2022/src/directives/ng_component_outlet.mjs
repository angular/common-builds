/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgComponentOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0-next.0+sha-f271021", type: NgComponentOutlet, isStandalone: true, selector: "[ngComponentOutlet]", inputs: { ngComponentOutlet: "ngComponentOutlet", ngComponentOutletInputs: "ngComponentOutletInputs", ngComponentOutletInjector: "ngComponentOutletInjector", ngComponentOutletContent: "ngComponentOutletContent", ngComponentOutletNgModule: "ngComponentOutletNgModule", ngComponentOutletNgModuleFactory: "ngComponentOutletNgModuleFactory" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NgComponentOutlet, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29tcG9uZW50X291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jb21wb25lbnRfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxjQUFjLEVBQ2QsU0FBUyxFQUVULFFBQVEsRUFDUixLQUFLLEVBQ0wsZUFBZSxFQUNmLFdBQVcsRUFJWCxJQUFJLEVBQ0osZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDOztBQUV2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvRUc7QUFLSCxNQUFNLE9BQU8saUJBQWlCO0lBdUI1QixZQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQXRCOUMsc0JBQWlCLEdBQXFCLElBQUksQ0FBQztRQWVwRDs7OztXQUlHO1FBQ0ssZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztJQUVTLENBQUM7SUFFbkQsK0JBQStCLENBQUMsT0FBc0I7UUFDNUQsMEZBQTBGO1FBQzFGLDhGQUE4RjtRQUM5RixpQkFBaUI7UUFDakIsT0FBTyxDQUNMLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLFNBQVM7WUFDbEQsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLEtBQUssU0FBUyxDQUMxRCxDQUFDO0lBQ0osQ0FBQztJQUVPLGdDQUFnQyxDQUFDLE9BQXNCO1FBQzdELDBGQUEwRjtRQUMxRiw4RkFBOEY7UUFDOUYsaUJBQWlCO1FBQ2pCLE9BQU8sQ0FDTCxPQUFPLENBQUMsbUJBQW1CLENBQUMsS0FBSyxTQUFTO1lBQzFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLFNBQVM7WUFDakQsT0FBTyxDQUFDLDJCQUEyQixDQUFDLEtBQUssU0FB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SUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQzt5SEFqSFUsaUJBQWlCOzZHQUFqQixpQkFBaUI7O3NHQUFqQixpQkFBaUI7a0JBSjdCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO3FGQUVVLGlCQUFpQjtzQkFBekIsS0FBSztnQkFFRyx1QkFBdUI7c0JBQS9CLEtBQUs7Z0JBQ0cseUJBQXlCO3NCQUFqQyxLQUFLO2dCQUNHLHdCQUF3QjtzQkFBaEMsS0FBSztnQkFFRyx5QkFBeUI7c0JBQWpDLEtBQUs7Z0JBSUcsZ0NBQWdDO3NCQUF4QyxLQUFLOztBQXlHUiwwRUFBMEU7QUFDMUUsU0FBUyxpQkFBaUIsQ0FBQyxRQUFrQjtJQUMzQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgY3JlYXRlTmdNb2R1bGUsXG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgSW5qZWN0b3IsXG4gIElucHV0LFxuICBOZ01vZHVsZUZhY3RvcnksXG4gIE5nTW9kdWxlUmVmLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVHlwZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogSW5zdGFudGlhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gdHlwZSBhbmQgaW5zZXJ0cyBpdHMgSG9zdCBWaWV3IGludG8gdGhlIGN1cnJlbnQgVmlldy5cbiAqIGBOZ0NvbXBvbmVudE91dGxldGAgcHJvdmlkZXMgYSBkZWNsYXJhdGl2ZSBhcHByb2FjaCBmb3IgZHluYW1pYyBjb21wb25lbnQgY3JlYXRpb24uXG4gKlxuICogYE5nQ29tcG9uZW50T3V0bGV0YCByZXF1aXJlcyBhIGNvbXBvbmVudCB0eXBlLCBpZiBhIGZhbHN5IHZhbHVlIGlzIHNldCB0aGUgdmlldyB3aWxsIGNsZWFyIGFuZFxuICogYW55IGV4aXN0aW5nIGNvbXBvbmVudCB3aWxsIGJlIGRlc3Ryb3llZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBGaW5lIHR1bmUgY29udHJvbFxuICpcbiAqIFlvdSBjYW4gY29udHJvbCB0aGUgY29tcG9uZW50IGNyZWF0aW9uIHByb2Nlc3MgYnkgdXNpbmcgdGhlIGZvbGxvd2luZyBvcHRpb25hbCBhdHRyaWJ1dGVzOlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0SW5wdXRzYDogT3B0aW9uYWwgY29tcG9uZW50IGlucHV0cyBvYmplY3QsIHdoaWNoIHdpbGwgYmUgYmluZCB0byB0aGVcbiAqIGNvbXBvbmVudC5cbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldEluamVjdG9yYDogT3B0aW9uYWwgY3VzdG9tIHtAbGluayBJbmplY3Rvcn0gdGhhdCB3aWxsIGJlIHVzZWQgYXMgcGFyZW50IGZvclxuICogdGhlIENvbXBvbmVudC4gRGVmYXVsdHMgdG8gdGhlIGluamVjdG9yIG9mIHRoZSBjdXJyZW50IHZpZXcgY29udGFpbmVyLlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0Q29udGVudGA6IE9wdGlvbmFsIGxpc3Qgb2YgcHJvamVjdGFibGUgbm9kZXMgdG8gaW5zZXJ0IGludG8gdGhlIGNvbnRlbnRcbiAqIHNlY3Rpb24gb2YgdGhlIGNvbXBvbmVudCwgaWYgaXQgZXhpc3RzLlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVgOiBPcHRpb25hbCBOZ01vZHVsZSBjbGFzcyByZWZlcmVuY2UgdG8gYWxsb3cgbG9hZGluZyBhbm90aGVyXG4gKiBtb2R1bGUgZHluYW1pY2FsbHksIHRoZW4gbG9hZGluZyBhIGNvbXBvbmVudCBmcm9tIHRoYXQgbW9kdWxlLlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVGYWN0b3J5YDogRGVwcmVjYXRlZCBjb25maWcgb3B0aW9uIHRoYXQgYWxsb3dzIHByb3ZpZGluZyBvcHRpb25hbFxuICogTmdNb2R1bGUgZmFjdG9yeSB0byBhbGxvdyBsb2FkaW5nIGFub3RoZXIgbW9kdWxlIGR5bmFtaWNhbGx5LCB0aGVuIGxvYWRpbmcgYSBjb21wb25lbnQgZnJvbSB0aGF0XG4gKiBtb2R1bGUuIFVzZSBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZWAgaW5zdGVhZC5cbiAqXG4gKiAjIyMgU3ludGF4XG4gKlxuICogU2ltcGxlXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb25cIj48L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdpdGggaW5wdXRzXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiBpbnB1dHNFeHByZXNzaW9uO1wiPlxuICogPC9uZy1jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBDdXN0b21pemVkIGluamVjdG9yL2NvbnRlbnRcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RvcjogaW5qZWN0b3JFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnROb2Rlc0V4cHJlc3Npb247XCI+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIEN1c3RvbWl6ZWQgTmdNb2R1bGUgcmVmZXJlbmNlXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmdNb2R1bGU6IG5nTW9kdWxlQ2xhc3M7XCI+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqICMjIyBBIHNpbXBsZSBleGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9uZ0NvbXBvbmVudE91dGxldC90cy9tb2R1bGUudHMgcmVnaW9uPSdTaW1wbGVFeGFtcGxlJ31cbiAqXG4gKiBBIG1vcmUgY29tcGxldGUgZXhhbXBsZSB3aXRoIGFkZGl0aW9uYWwgb3B0aW9uczpcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nQ29tcG9uZW50T3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J0NvbXBsZXRlRXhhbXBsZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdDb21wb25lbnRPdXRsZXRdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdDb21wb25lbnRPdXRsZXQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0OiBUeXBlPGFueT4gfCBudWxsID0gbnVsbDtcblxuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldElucHV0cz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldEluamVjdG9yPzogSW5qZWN0b3I7XG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0Q29udGVudD86IGFueVtdW107XG5cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZT86IFR5cGU8YW55PjtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFRoaXMgaW5wdXQgaXMgZGVwcmVjYXRlZCwgdXNlIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlYCBpbnN0ZWFkLlxuICAgKi9cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3Rvcnk/OiBOZ01vZHVsZUZhY3Rvcnk8YW55PjtcblxuICBwcml2YXRlIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIF9tb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEEgaGVscGVyIGRhdGEgc3RydWN0dXJlIHRoYXQgYWxsb3dzIHVzIHRvIHRyYWNrIGlucHV0cyB0aGF0IHdlcmUgcGFydCBvZiB0aGVcbiAgICogbmdDb21wb25lbnRPdXRsZXRJbnB1dHMgZXhwcmVzc2lvbi4gVHJhY2tpbmcgaW5wdXRzIGlzIG5lY2Vzc2FyeSBmb3IgcHJvcGVyIHJlbW92YWwgb2Ygb25lc1xuICAgKiB0aGF0IGFyZSBubyBsb25nZXIgcmVmZXJlbmNlZC5cbiAgICovXG4gIHByaXZhdGUgX2lucHV0c1VzZWQgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIHByaXZhdGUgX25lZWRUb1JlQ3JlYXRlTmdNb2R1bGVJbnN0YW5jZShjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogYm9vbGVhbiB7XG4gICAgLy8gTm90ZTogc3F1YXJlIGJyYWNrZXRzIHByb3BlcnR5IGFjY2Vzc29yIGlzIHNhZmUgZm9yIENsb3N1cmUgY29tcGlsZXIgb3B0aW1pemF0aW9ucyAodGhlXG4gICAgLy8gYGNoYW5nZXNgIGFyZ3VtZW50IG9mIHRoZSBgbmdPbkNoYW5nZXNgIGxpZmVjeWNsZSBob29rIHJldGFpbnMgdGhlIG5hbWVzIG9mIHRoZSBmaWVsZHMgdGhhdFxuICAgIC8vIHdlcmUgY2hhbmdlZCkuXG4gICAgcmV0dXJuIChcbiAgICAgIGNoYW5nZXNbJ25nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGUnXSAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICBjaGFuZ2VzWyduZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeSddICE9PSB1bmRlZmluZWRcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfbmVlZFRvUmVDcmVhdGVDb21wb25lbnRJbnN0YW5jZShjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogYm9vbGVhbiB7XG4gICAgLy8gTm90ZTogc3F1YXJlIGJyYWNrZXRzIHByb3BlcnR5IGFjY2Vzc29yIGlzIHNhZmUgZm9yIENsb3N1cmUgY29tcGlsZXIgb3B0aW1pemF0aW9ucyAodGhlXG4gICAgLy8gYGNoYW5nZXNgIGFyZ3VtZW50IG9mIHRoZSBgbmdPbkNoYW5nZXNgIGxpZmVjeWNsZSBob29rIHJldGFpbnMgdGhlIG5hbWVzIG9mIHRoZSBmaWVsZHMgdGhhdFxuICAgIC8vIHdlcmUgY2hhbmdlZCkuXG4gICAgcmV0dXJuIChcbiAgICAgIGNoYW5nZXNbJ25nQ29tcG9uZW50T3V0bGV0J10gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgY2hhbmdlc1snbmdDb21wb25lbnRPdXRsZXRDb250ZW50J10gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgY2hhbmdlc1snbmdDb21wb25lbnRPdXRsZXRJbmplY3RvciddICE9PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMuX25lZWRUb1JlQ3JlYXRlTmdNb2R1bGVJbnN0YW5jZShjaGFuZ2VzKVxuICAgICk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAodGhpcy5fbmVlZFRvUmVDcmVhdGVDb21wb25lbnRJbnN0YW5jZShjaGFuZ2VzKSkge1xuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICAgICAgdGhpcy5faW5wdXRzVXNlZC5jbGVhcigpO1xuICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAodGhpcy5uZ0NvbXBvbmVudE91dGxldCkge1xuICAgICAgICBjb25zdCBpbmplY3RvciA9IHRoaXMubmdDb21wb25lbnRPdXRsZXRJbmplY3RvciB8fCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLnBhcmVudEluamVjdG9yO1xuXG4gICAgICAgIGlmICh0aGlzLl9uZWVkVG9SZUNyZWF0ZU5nTW9kdWxlSW5zdGFuY2UoY2hhbmdlcykpIHtcbiAgICAgICAgICB0aGlzLl9tb2R1bGVSZWY/LmRlc3Ryb3koKTtcblxuICAgICAgICAgIGlmICh0aGlzLm5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGUpIHtcbiAgICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IGNyZWF0ZU5nTW9kdWxlKFxuICAgICAgICAgICAgICB0aGlzLm5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGUsXG4gICAgICAgICAgICAgIGdldFBhcmVudEluamVjdG9yKGluamVjdG9yKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aGlzLl9tb2R1bGVSZWYgPSB0aGlzLm5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVGYWN0b3J5LmNyZWF0ZShcbiAgICAgICAgICAgICAgZ2V0UGFyZW50SW5qZWN0b3IoaW5qZWN0b3IpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbW9kdWxlUmVmID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KHRoaXMubmdDb21wb25lbnRPdXRsZXQsIHtcbiAgICAgICAgICBpbmplY3RvcixcbiAgICAgICAgICBuZ01vZHVsZVJlZjogdGhpcy5fbW9kdWxlUmVmLFxuICAgICAgICAgIHByb2plY3RhYmxlTm9kZXM6IHRoaXMubmdDb21wb25lbnRPdXRsZXRDb250ZW50LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50UmVmKSB7XG4gICAgICBpZiAodGhpcy5uZ0NvbXBvbmVudE91dGxldElucHV0cykge1xuICAgICAgICBmb3IgKGNvbnN0IGlucHV0TmFtZSBvZiBPYmplY3Qua2V5cyh0aGlzLm5nQ29tcG9uZW50T3V0bGV0SW5wdXRzKSkge1xuICAgICAgICAgIHRoaXMuX2lucHV0c1VzZWQuc2V0KGlucHV0TmFtZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fYXBwbHlJbnB1dFN0YXRlRGlmZih0aGlzLl9jb21wb25lbnRSZWYpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fbW9kdWxlUmVmPy5kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUlucHV0U3RhdGVEaWZmKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPHVua25vd24+KSB7XG4gICAgZm9yIChjb25zdCBbaW5wdXROYW1lLCB0b3VjaGVkXSBvZiB0aGlzLl9pbnB1dHNVc2VkKSB7XG4gICAgICBpZiAoIXRvdWNoZWQpIHtcbiAgICAgICAgLy8gVGhlIGlucHV0IHRoYXQgd2FzIHByZXZpb3VzbHkgYWN0aXZlIG5vIGxvbmdlciBleGlzdHMgYW5kIG5lZWRzIHRvIGJlIHNldCB0byB1bmRlZmluZWQuXG4gICAgICAgIGNvbXBvbmVudFJlZi5zZXRJbnB1dChpbnB1dE5hbWUsIHVuZGVmaW5lZCk7XG4gICAgICAgIHRoaXMuX2lucHV0c1VzZWQuZGVsZXRlKGlucHV0TmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTaW5jZSB0b3VjaGVkIGlzIHRydWUsIGl0IGNhbiBiZSBhc3NlcnRlZCB0aGF0IHRoZSBpbnB1dHMgb2JqZWN0IGlzIG5vdCBlbXB0eS5cbiAgICAgICAgY29tcG9uZW50UmVmLnNldElucHV0KGlucHV0TmFtZSwgdGhpcy5uZ0NvbXBvbmVudE91dGxldElucHV0cyFbaW5wdXROYW1lXSk7XG4gICAgICAgIHRoaXMuX2lucHV0c1VzZWQuc2V0KGlucHV0TmFtZSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIEluamVjdG9yIGluc3RhbmNlIG9mIGEgcGFyZW50IE5nTW9kdWxlLlxuZnVuY3Rpb24gZ2V0UGFyZW50SW5qZWN0b3IoaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3Ige1xuICBjb25zdCBwYXJlbnROZ01vZHVsZSA9IGluamVjdG9yLmdldChOZ01vZHVsZVJlZik7XG4gIHJldHVybiBwYXJlbnROZ01vZHVsZS5pbmplY3Rvcjtcbn1cbiJdfQ==