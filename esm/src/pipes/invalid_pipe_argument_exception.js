import { stringify } from '../facade/lang';
import { BaseException } from '../facade/exceptions';
export class InvalidPipeArgumentException extends BaseException {
    constructor(type, value) {
        super(`Invalid argument '${value}' for pipe '${stringify(type)}'`);
    }
}
//# sourceMappingURL=invalid_pipe_argument_exception.js.map