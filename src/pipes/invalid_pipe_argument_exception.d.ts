import { Type } from '../facade/lang';
import { BaseException } from '../facade/exceptions';
export declare class InvalidPipeArgumentException extends BaseException {
    constructor(type: Type, value: Object);
}
