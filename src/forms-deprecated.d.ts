/**
 * @module
 * @description
 * This module is used for handling user input, by defining and building a {@link ControlGroup} that
 * consists of
 * {@link Control} objects, and mapping them onto the DOM. {@link Control} objects can then be used
 * to read information
 * from the form DOM elements.
 *
 * Forms providers are not included in default providers; you must import these providers
 * explicitly.
 */
export { AbstractControl, Control, ControlGroup, ControlArray } from './forms-deprecated/model';
export { AbstractControlDirective } from './forms-deprecated/directives/abstract_control_directive';
export { Form } from './forms-deprecated/directives/form_interface';
export { ControlContainer } from './forms-deprecated/directives/control_container';
export { NgControlName } from './forms-deprecated/directives/ng_control_name';
export { NgFormControl } from './forms-deprecated/directives/ng_form_control';
export { NgModel } from './forms-deprecated/directives/ng_model';
export { NgControl } from './forms-deprecated/directives/ng_control';
export { NgControlGroup } from './forms-deprecated/directives/ng_control_group';
export { NgFormModel } from './forms-deprecated/directives/ng_form_model';
export { NgForm } from './forms-deprecated/directives/ng_form';
export { ControlValueAccessor, NG_VALUE_ACCESSOR } from './forms-deprecated/directives/control_value_accessor';
export { DefaultValueAccessor } from './forms-deprecated/directives/default_value_accessor';
export { NgControlStatus } from './forms-deprecated/directives/ng_control_status';
export { CheckboxControlValueAccessor } from './forms-deprecated/directives/checkbox_value_accessor';
export { NgSelectOption, SelectControlValueAccessor } from './forms-deprecated/directives/select_control_value_accessor';
export { FORM_DIRECTIVES, RadioButtonState } from './forms-deprecated/directives';
export { NG_VALIDATORS, NG_ASYNC_VALIDATORS, Validators } from './forms-deprecated/validators';
export { RequiredValidator, MinLengthValidator, MaxLengthValidator, PatternValidator, Validator } from './forms-deprecated/directives/validators';
export { FormBuilder } from './forms-deprecated/form_builder';
import { Type } from '@angular/core';
/**
 * Shorthand set of providers used for building Angular forms.
 *
 * ### Example
 *
 * ```typescript
 * bootstrap(MyApp, [FORM_PROVIDERS]);
 * ```
 *
 * @experimental
 */
export declare const FORM_PROVIDERS: Type[];
