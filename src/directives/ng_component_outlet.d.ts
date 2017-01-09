/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, ComponentRef, Injector, OnChanges, SimpleChanges, Type, ViewContainerRef } from '@angular/core';
/**
 * Instantiates a single {@link Component} type and inserts its Host View into current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will get destroyed.
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngOutletInjector`: Optional custom {@link Injector} that will be used as parent for the
 * Component.
 * Defaults to the injector of the current view container.
 *
 * * `ngOutletProviders`: Optional injectable objects ({@link Provider}) that are visible to the
 * component.
 *
 * * `ngOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if exists. ({@link NgContent}).
 *
 *
 * ### Syntax
 *
 * Simple
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * Customized
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression">
 * </ng-container>
 * ```
 *
 * # Example
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='SimpleExample'}
 *
 * A more complete example with additional options:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='CompleteExample'}
 *
 * @experimental
 */
export declare class NgComponentOutlet implements OnChanges {
    private _cmpFactoryResolver;
    private _viewContainerRef;
    ngComponentOutlet: Type<any>;
    ngComponentOutletInjector: Injector;
    ngComponentOutletContent: any[][];
    componentRef: ComponentRef<any>;
    constructor(_cmpFactoryResolver: ComponentFactoryResolver, _viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
}
