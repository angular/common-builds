/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { createNgModule, Directive, Injector, Input, NgModuleFactory, NgModuleRef, Type, ViewContainerRef } from '@angular/core';
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
        this.inputStateMap = new Map();
    }
    /** @nodoc */
    ngOnChanges(changes) {
        const { ngComponentOutlet: componentTypeChange, ngComponentOutletContent: contentChange, ngComponentOutletInjector: injectorChange, ngComponentOutletNgModule: ngModuleChange, ngComponentOutletNgModuleFactory: ngModuleFactoryChange, } = changes;
        const { _viewContainerRef: viewContainerRef, ngComponentOutlet: componentType, ngComponentOutletContent: content, ngComponentOutletNgModule: ngModule, ngComponentOutletNgModuleFactory: ngModuleFactory, } = this;
        if (componentTypeChange || contentChange || injectorChange || ngModuleChange ||
            ngModuleFactoryChange) {
            viewContainerRef.clear();
            this._componentRef = undefined;
            if (componentType) {
                const injector = this.ngComponentOutletInjector || viewContainerRef.parentInjector;
                if (ngModuleChange || ngModuleFactoryChange) {
                    this._moduleRef?.destroy();
                    if (ngModule) {
                        this._moduleRef = createNgModule(ngModule, getParentInjector(injector));
                    }
                    else if (ngModuleFactory) {
                        this._moduleRef = ngModuleFactory.create(getParentInjector(injector));
                    }
                    else {
                        this._moduleRef = undefined;
                    }
                }
                this._componentRef = viewContainerRef.createComponent(componentType, {
                    index: viewContainerRef.length,
                    injector,
                    ngModuleRef: this._moduleRef,
                    projectableNodes: content,
                });
            }
        }
    }
    /** @nodoc */
    ngDoCheck() {
        const { _componentRef: componentRef, ngComponentOutletInputs: inputs, } = this;
        if (componentRef) {
            if (inputs) {
                for (const inputName of Object.keys(inputs)) {
                    this._updateInputState(inputName);
                }
            }
            this._applyInputStateDiff(componentRef);
        }
    }
    /** @nodoc */
    ngOnDestroy() {
        this._moduleRef?.destroy();
    }
    _updateInputState(inputName) {
        const state = this.inputStateMap.get(inputName);
        if (state) {
            state.touched = true;
        }
        else {
            this.inputStateMap.set(inputName, { touched: true });
        }
    }
    _applyInputStateDiff(componentRef) {
        for (const [inputName, state] of this.inputStateMap) {
            if (!state.touched) {
                // The input that was previously active no longer exists and needs to be set to undefined.
                componentRef.setInput(inputName, undefined);
                this.inputStateMap.delete(inputName);
            }
            else {
                // Since touched is true, it can be asserted that the inputs object is not empty.
                componentRef.setInput(inputName, this.ngComponentOutletInputs[inputName]);
            }
            state.touched = false;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.3+sha-f386759", ngImport: i0, type: NgComponentOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.1.0-next.3+sha-f386759", type: NgComponentOutlet, isStandalone: true, selector: "[ngComponentOutlet]", inputs: { ngComponentOutlet: "ngComponentOutlet", ngComponentOutletInputs: "ngComponentOutletInputs", ngComponentOutletInjector: "ngComponentOutletInjector", ngComponentOutletContent: "ngComponentOutletContent", ngComponentOutletNgModule: "ngComponentOutletNgModule", ngComponentOutletNgModuleFactory: "ngComponentOutletNgModuleFactory" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.3+sha-f386759", ngImport: i0, type: NgComponentOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngComponentOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }]; }, propDecorators: { ngComponentOutlet: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29tcG9uZW50X291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jb21wb25lbnRfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxjQUFjLEVBQUUsU0FBUyxFQUFXLFFBQVEsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBdUMsSUFBSSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDOztBQWEzTDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvRUc7QUFLSCxNQUFNLE9BQU8saUJBQWlCO0lBa0I1QixZQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQWpCOUMsc0JBQWlCLEdBQW1CLElBQUksQ0FBQztRQWUxQyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO0lBRUwsQ0FBQztJQUUzRCxhQUFhO0lBQ2IsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLE1BQU0sRUFDSixpQkFBaUIsRUFBRSxtQkFBbUIsRUFDdEMsd0JBQXdCLEVBQUUsYUFBYSxFQUN2Qyx5QkFBeUIsRUFBRSxjQUFjLEVBQ3pDLHlCQUF5QixFQUFFLGNBQWMsRUFDekMsZ0NBQWdDLEVBQUUscUJBQXFCLEdBQ3hELEdBQUcsT0FBTyxDQUFDO1FBRVosTUFBTSxFQUNKLGlCQUFpQixFQUFFLGdCQUFnQixFQUNuQyxpQkFBaUIsRUFBRSxhQUFhLEVBQ2hDLHdCQUF3QixFQUFFLE9BQU8sRUFDakMseUJBQXlCLEVBQUUsUUFBUSxFQUNuQyxnQ0FBZ0MsRUFBRSxlQUFlLEdBQ2xELEdBQUcsSUFBSSxDQUFDO1FBRVQsSUFBSSxtQkFBbUIsSUFBSSxhQUFhLElBQUksY0FBYyxJ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QWlCO2tCQUo3QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjt1R0FFVSxpQkFBaUI7c0JBQXpCLEtBQUs7Z0JBRUcsdUJBQXVCO3NCQUEvQixLQUFLO2dCQUNHLHlCQUF5QjtzQkFBakMsS0FBSztnQkFDRyx3QkFBd0I7c0JBQWhDLEtBQUs7Z0JBRUcseUJBQXlCO3NCQUFqQyxLQUFLO2dCQUlHLGdDQUFnQztzQkFBeEMsS0FBSzs7QUF5R1IsMEVBQTBFO0FBQzFFLFNBQVMsaUJBQWlCLENBQUMsUUFBa0I7SUFDM0MsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUM7QUFDakMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudFJlZiwgY3JlYXRlTmdNb2R1bGUsIERpcmVjdGl2ZSwgRG9DaGVjaywgSW5qZWN0b3IsIElucHV0LCBOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgU2ltcGxlQ2hhbmdlcywgVHlwZSwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBpbnRlcm5hbCBvYmplY3QgdXNlZCB0byB0cmFjayBzdGF0ZSBvZiBlYWNoIGNvbXBvbmVudCBpbnB1dC5cbiAqL1xuaW50ZXJmYWNlIENvbXBvbmVudElucHV0U3RhdGUge1xuICAvKipcbiAgICogVHJhY2sgd2hldGhlciB0aGUgaW5wdXQgZXhpc3RzIGluIHRoZSBjdXJyZW50IG9iamVjdCBib3VuZCB0byB0aGUgY29tcG9uZW50IGlucHV0O1xuICAgKiBpbnB1dHMgdGhhdCBhcmUgbm90IHByZXNlbnQgYW55IG1vcmUgY2FuIGJlIHJlbW92ZWQgZnJvbSB0aGUgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmVzLlxuICAgKi9cbiAgdG91Y2hlZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBJbnN0YW50aWF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSB0eXBlIGFuZCBpbnNlcnRzIGl0cyBIb3N0IFZpZXcgaW50byB0aGUgY3VycmVudCBWaWV3LlxuICogYE5nQ29tcG9uZW50T3V0bGV0YCBwcm92aWRlcyBhIGRlY2xhcmF0aXZlIGFwcHJvYWNoIGZvciBkeW5hbWljIGNvbXBvbmVudCBjcmVhdGlvbi5cbiAqXG4gKiBgTmdDb21wb25lbnRPdXRsZXRgIHJlcXVpcmVzIGEgY29tcG9uZW50IHR5cGUsIGlmIGEgZmFsc3kgdmFsdWUgaXMgc2V0IHRoZSB2aWV3IHdpbGwgY2xlYXIgYW5kXG4gKiBhbnkgZXhpc3RpbmcgY29tcG9uZW50IHdpbGwgYmUgZGVzdHJveWVkLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEZpbmUgdHVuZSBjb250cm9sXG4gKlxuICogWW91IGNhbiBjb250cm9sIHRoZSBjb21wb25lbnQgY3JlYXRpb24gcHJvY2VzcyBieSB1c2luZyB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIGF0dHJpYnV0ZXM6XG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXRJbnB1dHNgOiBPcHRpb25hbCBjb21wb25lbnQgaW5wdXRzIG9iamVjdCwgd2hpY2ggd2lsbCBiZSBiaW5kIHRvIHRoZVxuICogY29tcG9uZW50LlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3JgOiBPcHRpb25hbCBjdXN0b20ge0BsaW5rIEluamVjdG9yfSB0aGF0IHdpbGwgYmUgdXNlZCBhcyBwYXJlbnQgZm9yXG4gKiB0aGUgQ29tcG9uZW50LiBEZWZhdWx0cyB0byB0aGUgaW5qZWN0b3Igb2YgdGhlIGN1cnJlbnQgdmlldyBjb250YWluZXIuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXRDb250ZW50YDogT3B0aW9uYWwgbGlzdCBvZiBwcm9qZWN0YWJsZSBub2RlcyB0byBpbnNlcnQgaW50byB0aGUgY29udGVudFxuICogc2VjdGlvbiBvZiB0aGUgY29tcG9uZW50LCBpZiBpdCBleGlzdHMuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZWA6IE9wdGlvbmFsIE5nTW9kdWxlIGNsYXNzIHJlZmVyZW5jZSB0byBhbGxvdyBsb2FkaW5nIGFub3RoZXJcbiAqIG1vZHVsZSBkeW5hbWljYWxseSwgdGhlbiBsb2FkaW5nIGEgY29tcG9uZW50IGZyb20gdGhhdCBtb2R1bGUuXG4gKlxuICogKiBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3RvcnlgOiBEZXByZWNhdGVkIGNvbmZpZyBvcHRpb24gdGhhdCBhbGxvd3MgcHJvdmlkaW5nIG9wdGlvbmFsXG4gKiBOZ01vZHVsZSBmYWN0b3J5IHRvIGFsbG93IGxvYWRpbmcgYW5vdGhlciBtb2R1bGUgZHluYW1pY2FsbHksIHRoZW4gbG9hZGluZyBhIGNvbXBvbmVudCBmcm9tIHRoYXRcbiAqIG1vZHVsZS4gVXNlIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlYCBpbnN0ZWFkLlxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiBTaW1wbGVcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvblwiPjwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogV2l0aCBpbnB1dHNcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IGlucHV0c0V4cHJlc3Npb247XCI+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIEN1c3RvbWl6ZWQgaW5qZWN0b3IvY29udGVudFxuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yOiBpbmplY3RvckV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudE5vZGVzRXhwcmVzc2lvbjtcIj5cbiAqIDwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogQ3VzdG9taXplZCBOZ01vZHVsZSByZWZlcmVuY2VcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZ01vZHVsZTogbmdNb2R1bGVDbGFzcztcIj5cbiAqIDwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogIyMjIEEgc2ltcGxlIGV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nQ29tcG9uZW50T3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J1NpbXBsZUV4YW1wbGUnfVxuICpcbiAqIEEgbW9yZSBjb21wbGV0ZSBleGFtcGxlIHdpdGggYWRkaXRpb25hbCBvcHRpb25zOlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdDb21wb25lbnRPdXRsZXQvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nQ29tcGxldGVFeGFtcGxlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0NvbXBvbmVudE91dGxldF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbXBvbmVudE91dGxldCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgRG9DaGVjaywgT25EZXN0cm95IHtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXQ6IFR5cGU8YW55PnxudWxsID0gbnVsbDtcblxuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldElucHV0cz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldEluamVjdG9yPzogSW5qZWN0b3I7XG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0Q29udGVudD86IGFueVtdW107XG5cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZT86IFR5cGU8YW55PjtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFRoaXMgaW5wdXQgaXMgZGVwcmVjYXRlZCwgdXNlIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlYCBpbnN0ZWFkLlxuICAgKi9cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3Rvcnk/OiBOZ01vZHVsZUZhY3Rvcnk8YW55PjtcblxuICBwcml2YXRlIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+fHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfbW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+fHVuZGVmaW5lZDtcblxuICBwcml2YXRlIGlucHV0U3RhdGVNYXAgPSBuZXcgTWFwPHN0cmluZywgQ29tcG9uZW50SW5wdXRTdGF0ZT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHtcbiAgICAgIG5nQ29tcG9uZW50T3V0bGV0OiBjb21wb25lbnRUeXBlQ2hhbmdlLFxuICAgICAgbmdDb21wb25lbnRPdXRsZXRDb250ZW50OiBjb250ZW50Q2hhbmdlLFxuICAgICAgbmdDb21wb25lbnRPdXRsZXRJbmplY3RvcjogaW5qZWN0b3JDaGFuZ2UsXG4gICAgICBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlOiBuZ01vZHVsZUNoYW5nZSxcbiAgICAgIG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVGYWN0b3J5OiBuZ01vZHVsZUZhY3RvcnlDaGFuZ2UsXG4gICAgfSA9IGNoYW5nZXM7XG5cbiAgICBjb25zdCB7XG4gICAgICBfdmlld0NvbnRhaW5lclJlZjogdmlld0NvbnRhaW5lclJlZixcbiAgICAgIG5nQ29tcG9uZW50T3V0bGV0OiBjb21wb25lbnRUeXBlLFxuICAgICAgbmdDb21wb25lbnRPdXRsZXRDb250ZW50OiBjb250ZW50LFxuICAgICAgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZTogbmdNb2R1bGUsXG4gICAgICBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeTogbmdNb2R1bGVGYWN0b3J5LFxuICAgIH0gPSB0aGlzO1xuXG4gICAgaWYgKGNvbXBvbmVudFR5cGVDaGFuZ2UgfHwgY29udGVudENoYW5nZSB8fCBpbmplY3RvckNoYW5nZSB8fCBuZ01vZHVsZUNoYW5nZSB8fFxuICAgICAgICBuZ01vZHVsZUZhY3RvcnlDaGFuZ2UpIHtcbiAgICAgIHZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKGNvbXBvbmVudFR5cGUpIHtcbiAgICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLm5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3IgfHwgdmlld0NvbnRhaW5lclJlZi5wYXJlbnRJbmplY3RvcjtcblxuICAgICAgICBpZiAobmdNb2R1bGVDaGFuZ2UgfHwgbmdNb2R1bGVGYWN0b3J5Q2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5fbW9kdWxlUmVmPy5kZXN0cm95KCk7XG5cbiAgICAgICAgICBpZiAobmdNb2R1bGUpIHtcbiAgICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IGNyZWF0ZU5nTW9kdWxlKG5nTW9kdWxlLCBnZXRQYXJlbnRJbmplY3RvcihpbmplY3RvcikpO1xuICAgICAgICAgIH0gZWxzZSBpZiAobmdNb2R1bGVGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aGlzLl9tb2R1bGVSZWYgPSBuZ01vZHVsZUZhY3RvcnkuY3JlYXRlKGdldFBhcmVudEluamVjdG9yKGluamVjdG9yKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChjb21wb25lbnRUeXBlLCB7XG4gICAgICAgICAgaW5kZXg6IHZpZXdDb250YWluZXJSZWYubGVuZ3RoLFxuICAgICAgICAgIGluamVjdG9yLFxuICAgICAgICAgIG5nTW9kdWxlUmVmOiB0aGlzLl9tb2R1bGVSZWYsXG4gICAgICAgICAgcHJvamVjdGFibGVOb2RlczogY29udGVudCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3Qge1xuICAgICAgX2NvbXBvbmVudFJlZjogY29tcG9uZW50UmVmLFxuICAgICAgbmdDb21wb25lbnRPdXRsZXRJbnB1dHM6IGlucHV0cyxcbiAgICB9ID0gdGhpcztcblxuICAgIGlmIChjb21wb25lbnRSZWYpIHtcbiAgICAgIGlmIChpbnB1dHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBpbnB1dE5hbWUgb2YgT2JqZWN0LmtleXMoaW5wdXRzKSkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUlucHV0U3RhdGUoaW5wdXROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9hcHBseUlucHV0U3RhdGVEaWZmKGNvbXBvbmVudFJlZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9tb2R1bGVSZWY/LmRlc3Ryb3koKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUlucHV0U3RhdGUoaW5wdXROYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuaW5wdXRTdGF0ZU1hcC5nZXQoaW5wdXROYW1lKTtcbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgIHN0YXRlLnRvdWNoZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlucHV0U3RhdGVNYXAuc2V0KGlucHV0TmFtZSwge3RvdWNoZWQ6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUlucHV0U3RhdGVEaWZmKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPHVua25vd24+KSB7XG4gICAgZm9yIChjb25zdCBbaW5wdXROYW1lLCBzdGF0ZV0gb2YgdGhpcy5pbnB1dFN0YXRlTWFwKSB7XG4gICAgICBpZiAoIXN0YXRlLnRvdWNoZWQpIHtcbiAgICAgICAgLy8gVGhlIGlucHV0IHRoYXQgd2FzIHByZXZpb3VzbHkgYWN0aXZlIG5vIGxvbmdlciBleGlzdHMgYW5kIG5lZWRzIHRvIGJlIHNldCB0byB1bmRlZmluZWQuXG4gICAgICAgIGNvbXBvbmVudFJlZi5zZXRJbnB1dChpbnB1dE5hbWUsIHVuZGVmaW5lZCk7XG4gICAgICAgIHRoaXMuaW5wdXRTdGF0ZU1hcC5kZWxldGUoaW5wdXROYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNpbmNlIHRvdWNoZWQgaXMgdHJ1ZSwgaXQgY2FuIGJlIGFzc2VydGVkIHRoYXQgdGhlIGlucHV0cyBvYmplY3QgaXMgbm90IGVtcHR5LlxuICAgICAgICBjb21wb25lbnRSZWYuc2V0SW5wdXQoaW5wdXROYW1lLCB0aGlzLm5nQ29tcG9uZW50T3V0bGV0SW5wdXRzIVtpbnB1dE5hbWVdKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGUudG91Y2hlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIEluamVjdG9yIGluc3RhbmNlIG9mIGEgcGFyZW50IE5nTW9kdWxlLlxuZnVuY3Rpb24gZ2V0UGFyZW50SW5qZWN0b3IoaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3Ige1xuICBjb25zdCBwYXJlbnROZ01vZHVsZSA9IGluamVjdG9yLmdldChOZ01vZHVsZVJlZik7XG4gIHJldHVybiBwYXJlbnROZ01vZHVsZS5pbmplY3Rvcjtcbn1cbiJdfQ==