import { Pipe } from '@angular/core';
import { isBlank, isString, isArray, StringWrapper } from '../facade/lang';
import { ListWrapper } from '../facade/collection';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
export class SlicePipe {
    transform(value, start, end = null) {
        if (isBlank(value))
            return value;
        if (!this.supports(value)) {
            throw new InvalidPipeArgumentException(SlicePipe, value);
        }
        if (isString(value)) {
            return StringWrapper.slice(value, start, end);
        }
        return ListWrapper.slice(value, start, end);
    }
    supports(obj) { return isString(obj) || isArray(obj); }
}
SlicePipe.decorators = [
    { type: Pipe, args: [{ name: 'slice', pure: false },] },
];
//# sourceMappingURL=slice_pipe.js.map