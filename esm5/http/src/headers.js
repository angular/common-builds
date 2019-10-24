/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read, __spread } from "tslib";
/**
 * Represents the header configuration options for an HTTP request.
 * Instances are immutable. Modifying methods return a cloned
 * instance with the change. The original object is never changed.
 *
 * @publicApi
 */
var HttpHeaders = /** @class */ (function () {
    /**  Constructs a new HTTP header object with the given values.*/
    function HttpHeaders(headers) {
        var _this = this;
        /**
         * Internal map of lowercased header names to the normalized
         * form of the name (the form seen first).
         */
        this.normalizedNames = new Map();
        /**
         * Queued updates to be materialized the next initialization.
         */
        this.lazyUpdate = null;
        if (!headers) {
            this.headers = new Map();
        }
        else if (typeof headers === 'string') {
            this.lazyInit = function () {
                _this.headers = new Map();
                headers.split('\n').forEach(function (line) {
                    var index = line.indexOf(':');
                    if (index > 0) {
                        var name_1 = line.slice(0, index);
                        var key = name_1.toLowerCase();
                        var value = line.slice(index + 1).trim();
                        _this.maybeSetNormalizedName(name_1, key);
                        if (_this.headers.has(key)) {
                            _this.headers.get(key).push(value);
                        }
                        else {
                            _this.headers.set(key, [value]);
                        }
                    }
                });
            };
        }
        else {
            this.lazyInit = function () {
                _this.headers = new Map();
                Object.keys(headers).forEach(function (name) {
                    var values = headers[name];
                    var key = name.toLowerCase();
                    if (typeof values === 'string') {
                        values = [values];
                    }
                    if (values.length > 0) {
                        _this.headers.set(key, values);
                        _this.maybeSetNormalizedName(name, key);
                    }
                });
            };
        }
    }
    /**
     * Checks for existence of a given header.
     *
     * @param name The header name to check for existence.
     *
     * @returns True if the header exists, false otherwise.
     */
    HttpHeaders.prototype.has = function (name) {
        this.init();
        return this.headers.has(name.toLowerCase());
    };
    /**
     * Retrieves the first value of a given header.
     *
     * @param name The header name.
     *
     * @returns The value string if the header exists, null otherwise
     */
    HttpHeaders.prototype.get = function (name) {
        this.init();
        var values = this.headers.get(name.toLowerCase());
        return values && values.length > 0 ? values[0] : null;
    };
    /**
     * Retrieves the names of the headers.
     *
     * @returns A list of header names.
     */
    HttpHeaders.prototype.keys = function () {
        this.init();
        return Array.from(this.normalizedNames.values());
    };
    /**
     * Retrieves a list of values for a given header.
     *
     * @param name The header name from which to retrieve values.
     *
     * @returns A string of values if the header exists, null otherwise.
     */
    HttpHeaders.prototype.getAll = function (name) {
        this.init();
        return this.headers.get(name.toLowerCase()) || null;
    };
    /**
     * Appends a new value to the existing set of values for a header
     * and returns them in a clone of the original instance.
     *
     * @param name The header name for which to append the value or values.
     * @param value The new value or array of values.
     *
     * @returns A clone of the HTTP headers object with the value appended to the given header.
     */
    HttpHeaders.prototype.append = function (name, value) {
        return this.clone({ name: name, value: value, op: 'a' });
    };
    /**
     * Sets or modifies a value for a given header in a clone of the original instance.
     * If the header already exists, its value is replaced with the given value
     * in the returned object.
     *
     * @param name The header name.
     * @param value The value or values to set or overide for the given header.
     *
     * @returns A clone of the HTTP headers object with the newly set header value.
     */
    HttpHeaders.prototype.set = function (name, value) {
        return this.clone({ name: name, value: value, op: 's' });
    };
    /**
     * Deletes values for a given header in a clone of the original instance.
     *
     * @param name The header name.
     * @param value The value or values to delete for the given header.
     *
     * @returns A clone of the HTTP headers object with the given value deleted.
     */
    HttpHeaders.prototype.delete = function (name, value) {
        return this.clone({ name: name, value: value, op: 'd' });
    };
    HttpHeaders.prototype.maybeSetNormalizedName = function (name, lcName) {
        if (!this.normalizedNames.has(lcName)) {
            this.normalizedNames.set(lcName, name);
        }
    };
    HttpHeaders.prototype.init = function () {
        var _this = this;
        if (!!this.lazyInit) {
            if (this.lazyInit instanceof HttpHeaders) {
                this.copyFrom(this.lazyInit);
            }
            else {
                this.lazyInit();
            }
            this.lazyInit = null;
            if (!!this.lazyUpdate) {
                this.lazyUpdate.forEach(function (update) { return _this.applyUpdate(update); });
                this.lazyUpdate = null;
            }
        }
    };
    HttpHeaders.prototype.copyFrom = function (other) {
        var _this = this;
        other.init();
        Array.from(other.headers.keys()).forEach(function (key) {
            _this.headers.set(key, other.headers.get(key));
            _this.normalizedNames.set(key, other.normalizedNames.get(key));
        });
    };
    HttpHeaders.prototype.clone = function (update) {
        var clone = new HttpHeaders();
        clone.lazyInit =
            (!!this.lazyInit && this.lazyInit instanceof HttpHeaders) ? this.lazyInit : this;
        clone.lazyUpdate = (this.lazyUpdate || []).concat([update]);
        return clone;
    };
    HttpHeaders.prototype.applyUpdate = function (update) {
        var key = update.name.toLowerCase();
        switch (update.op) {
            case 'a':
            case 's':
                var value = update.value;
                if (typeof value === 'string') {
                    value = [value];
                }
                if (value.length === 0) {
                    return;
                }
                this.maybeSetNormalizedName(update.name, key);
                var base = (update.op === 'a' ? this.headers.get(key) : undefined) || [];
                base.push.apply(base, __spread(value));
                this.headers.set(key, base);
                break;
            case 'd':
                var toDelete_1 = update.value;
                if (!toDelete_1) {
                    this.headers.delete(key);
                    this.normalizedNames.delete(key);
                }
                else {
                    var existing = this.headers.get(key);
                    if (!existing) {
                        return;
                    }
                    existing = existing.filter(function (value) { return toDelete_1.indexOf(value) === -1; });
                    if (existing.length === 0) {
                        this.headers.delete(key);
                        this.normalizedNames.delete(key);
                    }
                    else {
                        this.headers.set(key, existing);
                    }
                }
                break;
        }
    };
    /**
     * @internal
     */
    HttpHeaders.prototype.forEach = function (fn) {
        var _this = this;
        this.init();
        Array.from(this.normalizedNames.keys())
            .forEach(function (key) { return fn(_this.normalizedNames.get(key), _this.headers.get(key)); });
    };
    return HttpHeaders;
}());
export { HttpHeaders };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy9oZWFkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFRSDs7Ozs7O0dBTUc7QUFDSDtJQXdCRSxpRUFBaUU7SUFFakUscUJBQVksT0FBb0Q7UUFBaEUsaUJBcUNDO1FBdkREOzs7V0FHRztRQUNLLG9CQUFlLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFPekQ7O1dBRUc7UUFDSyxlQUFVLEdBQWtCLElBQUksQ0FBQztRQUt2QyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztTQUM1QzthQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQ3RDLElBQUksQ0FBQyxRQUFRLEdBQUc7Z0JBQ2QsS0FBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztnQkFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO29CQUM5QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7d0JBQ2IsSUFBTSxNQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ2xDLElBQU0sR0FBRyxHQUFHLE1BQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDL0IsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQzNDLEtBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFJLEVBQUUsR0FBRyxD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QUMsRUFBRTt3QkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3pCLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNsQzt5QkFBTTt3QkFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7cUJBQ2pDO2lCQUNGO2dCQUNELE1BQU07U0FDVDtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILDZCQUFPLEdBQVAsVUFBUSxFQUE0QztRQUFwRCxpQkFJQztRQUhDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNsQyxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxFQUFFLENBQUMsS0FBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFHLEVBQUUsS0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFHLENBQUMsRUFBNUQsQ0FBNEQsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMsQUE5T0QsSUE4T0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmludGVyZmFjZSBVcGRhdGUge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlPzogc3RyaW5nfHN0cmluZ1tdO1xuICBvcDogJ2EnfCdzJ3wnZCc7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgaGVhZGVyIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgYW4gSFRUUCByZXF1ZXN0LlxuICogSW5zdGFuY2VzIGFyZSBpbW11dGFibGUuIE1vZGlmeWluZyBtZXRob2RzIHJldHVybiBhIGNsb25lZFxuICogaW5zdGFuY2Ugd2l0aCB0aGUgY2hhbmdlLiBUaGUgb3JpZ2luYWwgb2JqZWN0IGlzIG5ldmVyIGNoYW5nZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cEhlYWRlcnMge1xuICAvKipcbiAgICogSW50ZXJuYWwgbWFwIG9mIGxvd2VyY2FzZSBoZWFkZXIgbmFtZXMgdG8gdmFsdWVzLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgaGVhZGVycyAhOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT47XG5cblxuICAvKipcbiAgICogSW50ZXJuYWwgbWFwIG9mIGxvd2VyY2FzZWQgaGVhZGVyIG5hbWVzIHRvIHRoZSBub3JtYWxpemVkXG4gICAqIGZvcm0gb2YgdGhlIG5hbWUgKHRoZSBmb3JtIHNlZW4gZmlyc3QpLlxuICAgKi9cbiAgcHJpdmF0ZSBub3JtYWxpemVkTmFtZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgLyoqXG4gICAqIENvbXBsZXRlIHRoZSBsYXp5IGluaXRpYWxpemF0aW9uIG9mIHRoaXMgb2JqZWN0IChuZWVkZWQgYmVmb3JlIHJlYWRpbmcpLlxuICAgKi9cbiAgcHJpdmF0ZSBsYXp5SW5pdCAhOiBIdHRwSGVhZGVycyB8IEZ1bmN0aW9uIHwgbnVsbDtcblxuICAvKipcbiAgICogUXVldWVkIHVwZGF0ZXMgdG8gYmUgbWF0ZXJpYWxpemVkIHRoZSBuZXh0IGluaXRpYWxpemF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBsYXp5VXBkYXRlOiBVcGRhdGVbXXxudWxsID0gbnVsbDtcblxuICAvKiogIENvbnN0cnVjdHMgYSBuZXcgSFRUUCBoZWFkZXIgb2JqZWN0IHdpdGggdGhlIGdpdmVuIHZhbHVlcy4qL1xuXG4gIGNvbnN0cnVjdG9yKGhlYWRlcnM/OiBzdHJpbmd8e1tuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pIHtcbiAgICBpZiAoIWhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBoZWFkZXJzID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5sYXp5SW5pdCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICAgICAgICBoZWFkZXJzLnNwbGl0KCdcXG4nKS5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsaW5lLnNsaWNlKGluZGV4ICsgMSkudHJpbSgpO1xuICAgICAgICAgICAgdGhpcy5tYXliZVNldE5vcm1hbGl6ZWROYW1lKG5hbWUsIGtleSk7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFkZXJzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgIHRoaXMuaGVhZGVycy5nZXQoa2V5KSAhLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5oZWFkZXJzLnNldChrZXksIFt2YWx1ZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxhenlJbml0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgICAgbGV0IHZhbHVlczogc3RyaW5nfHN0cmluZ1tdID0gaGVhZGVyc1tuYW1lXTtcbiAgICAgICAgICBjb25zdCBrZXkgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSBbdmFsdWVzXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KGtleSwgdmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMubWF5YmVTZXROb3JtYWxpemVkTmFtZShuYW1lLCBrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgZm9yIGV4aXN0ZW5jZSBvZiBhIGdpdmVuIGhlYWRlci5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGhlYWRlciBuYW1lIHRvIGNoZWNrIGZvciBleGlzdGVuY2UuXG4gICAqXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGhlYWRlciBleGlzdHMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzLmhlYWRlcnMuaGFzKG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBmaXJzdCB2YWx1ZSBvZiBhIGdpdmVuIGhlYWRlci5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGhlYWRlciBuYW1lLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgdmFsdWUgc3RyaW5nIGlmIHRoZSBoZWFkZXIgZXhpc3RzLCBudWxsIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICB0aGlzLmluaXQoKTtcblxuICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuaGVhZGVycy5nZXQobmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICByZXR1cm4gdmFsdWVzICYmIHZhbHVlcy5sZW5ndGggPiAwID8gdmFsdWVzWzBdIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIG5hbWVzIG9mIHRoZSBoZWFkZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGxpc3Qgb2YgaGVhZGVyIG5hbWVzLlxuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7XG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLm5vcm1hbGl6ZWROYW1lcy52YWx1ZXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGEgbGlzdCBvZiB2YWx1ZXMgZm9yIGEgZ2l2ZW4gaGVhZGVyLlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgaGVhZGVyIG5hbWUgZnJvbSB3aGljaCB0byByZXRyaWV2ZSB2YWx1ZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nIG9mIHZhbHVlcyBpZiB0aGUgaGVhZGVyIGV4aXN0cywgbnVsbCBvdGhlcndpc2UuXG4gICAqL1xuICBnZXRBbGwobmFtZTogc3RyaW5nKTogc3RyaW5nW118bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcy5oZWFkZXJzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhIG5ldyB2YWx1ZSB0byB0aGUgZXhpc3Rpbmcgc2V0IG9mIHZhbHVlcyBmb3IgYSBoZWFkZXJcbiAgICogYW5kIHJldHVybnMgdGhlbSBpbiBhIGNsb25lIG9mIHRoZSBvcmlnaW5hbCBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGhlYWRlciBuYW1lIGZvciB3aGljaCB0byBhcHBlbmQgdGhlIHZhbHVlIG9yIHZhbHVlcy5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgb3IgYXJyYXkgb2YgdmFsdWVzLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGNsb25lIG9mIHRoZSBIVFRQIGhlYWRlcnMgb2JqZWN0IHdpdGggdGhlIHZhbHVlIGFwcGVuZGVkIHRvIHRoZSBnaXZlbiBoZWFkZXIuXG4gICAqL1xuXG4gIGFwcGVuZChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd8c3RyaW5nW10pOiBIdHRwSGVhZGVycyB7XG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoe25hbWUsIHZhbHVlLCBvcDogJ2EnfSk7XG4gIH1cbiAgLyoqXG4gICAqIFNldHMgb3IgbW9kaWZpZXMgYSB2YWx1ZSBmb3IgYSBnaXZlbiBoZWFkZXIgaW4gYSBjbG9uZSBvZiB0aGUgb3JpZ2luYWwgaW5zdGFuY2UuXG4gICAqIElmIHRoZSBoZWFkZXIgYWxyZWFkeSBleGlzdHMsIGl0cyB2YWx1ZSBpcyByZXBsYWNlZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZVxuICAgKiBpbiB0aGUgcmV0dXJuZWQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgaGVhZGVyIG5hbWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgb3IgdmFsdWVzIHRvIHNldCBvciBvdmVyaWRlIGZvciB0aGUgZ2l2ZW4gaGVhZGVyLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGNsb25lIG9mIHRoZSBIVFRQIGhlYWRlcnMgb2JqZWN0IHdpdGggdGhlIG5ld2x5IHNldCBoZWFkZXIgdmFsdWUuXG4gICAqL1xuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfHN0cmluZ1tdKTogSHR0cEhlYWRlcnMge1xuICAgIHJldHVybiB0aGlzLmNsb25lKHtuYW1lLCB2YWx1ZSwgb3A6ICdzJ30pO1xuICB9XG4gIC8qKlxuICAgKiBEZWxldGVzIHZhbHVlcyBmb3IgYSBnaXZlbiBoZWFkZXIgaW4gYSBjbG9uZSBvZiB0aGUgb3JpZ2luYWwgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBoZWFkZXIgbmFtZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvciB2YWx1ZXMgdG8gZGVsZXRlIGZvciB0aGUgZ2l2ZW4gaGVhZGVyLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGNsb25lIG9mIHRoZSBIVFRQIGhlYWRlcnMgb2JqZWN0IHdpdGggdGhlIGdpdmVuIHZhbHVlIGRlbGV0ZWQuXG4gICAqL1xuICBkZWxldGUgKG5hbWU6IHN0cmluZywgdmFsdWU/OiBzdHJpbmd8c3RyaW5nW10pOiBIdHRwSGVhZGVycyB7XG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoe25hbWUsIHZhbHVlLCBvcDogJ2QnfSk7XG4gIH1cblxuICBwcml2YXRlIG1heWJlU2V0Tm9ybWFsaXplZE5hbWUobmFtZTogc3RyaW5nLCBsY05hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5ub3JtYWxpemVkTmFtZXMuaGFzKGxjTmFtZSkpIHtcbiAgICAgIHRoaXMubm9ybWFsaXplZE5hbWVzLnNldChsY05hbWUsIG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoISF0aGlzLmxhenlJbml0KSB7XG4gICAgICBpZiAodGhpcy5sYXp5SW5pdCBpbnN0YW5jZW9mIEh0dHBIZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuY29weUZyb20odGhpcy5sYXp5SW5pdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxhenlJbml0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmxhenlJbml0ID0gbnVsbDtcbiAgICAgIGlmICghIXRoaXMubGF6eVVwZGF0ZSkge1xuICAgICAgICB0aGlzLmxhenlVcGRhdGUuZm9yRWFjaCh1cGRhdGUgPT4gdGhpcy5hcHBseVVwZGF0ZSh1cGRhdGUpKTtcbiAgICAgICAgdGhpcy5sYXp5VXBkYXRlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvcHlGcm9tKG90aGVyOiBIdHRwSGVhZGVycykge1xuICAgIG90aGVyLmluaXQoKTtcbiAgICBBcnJheS5mcm9tKG90aGVyLmhlYWRlcnMua2V5cygpKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICB0aGlzLmhlYWRlcnMuc2V0KGtleSwgb3RoZXIuaGVhZGVycy5nZXQoa2V5KSAhKTtcbiAgICAgIHRoaXMubm9ybWFsaXplZE5hbWVzLnNldChrZXksIG90aGVyLm5vcm1hbGl6ZWROYW1lcy5nZXQoa2V5KSAhKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY2xvbmUodXBkYXRlOiBVcGRhdGUpOiBIdHRwSGVhZGVycyB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBjbG9uZS5sYXp5SW5pdCA9XG4gICAgICAgICghIXRoaXMubGF6eUluaXQgJiYgdGhpcy5sYXp5SW5pdCBpbnN0YW5jZW9mIEh0dHBIZWFkZXJzKSA/IHRoaXMubGF6eUluaXQgOiB0aGlzO1xuICAgIGNsb25lLmxhenlVcGRhdGUgPSAodGhpcy5sYXp5VXBkYXRlIHx8IFtdKS5jb25jYXQoW3VwZGF0ZV0pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlVcGRhdGUodXBkYXRlOiBVcGRhdGUpOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSB1cGRhdGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHN3aXRjaCAodXBkYXRlLm9wKSB7XG4gICAgICBjYXNlICdhJzpcbiAgICAgIGNhc2UgJ3MnOlxuICAgICAgICBsZXQgdmFsdWUgPSB1cGRhdGUudmFsdWUgITtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB2YWx1ZSA9IFt2YWx1ZV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1heWJlU2V0Tm9ybWFsaXplZE5hbWUodXBkYXRlLm5hbWUsIGtleSk7XG4gICAgICAgIGNvbnN0IGJhc2UgPSAodXBkYXRlLm9wID09PSAnYScgPyB0aGlzLmhlYWRlcnMuZ2V0KGtleSkgOiB1bmRlZmluZWQpIHx8IFtdO1xuICAgICAgICBiYXNlLnB1c2goLi4udmFsdWUpO1xuICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KGtleSwgYmFzZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZCc6XG4gICAgICAgIGNvbnN0IHRvRGVsZXRlID0gdXBkYXRlLnZhbHVlIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKCF0b0RlbGV0ZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5kZWxldGUoa2V5KTtcbiAgICAgICAgICB0aGlzLm5vcm1hbGl6ZWROYW1lcy5kZWxldGUoa2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgZXhpc3RpbmcgPSB0aGlzLmhlYWRlcnMuZ2V0KGtleSk7XG4gICAgICAgICAgaWYgKCFleGlzdGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBleGlzdGluZyA9IGV4aXN0aW5nLmZpbHRlcih2YWx1ZSA9PiB0b0RlbGV0ZS5pbmRleE9mKHZhbHVlKSA9PT0gLTEpO1xuICAgICAgICAgIGlmIChleGlzdGluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVycy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHRoaXMubm9ybWFsaXplZE5hbWVzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KGtleSwgZXhpc3RpbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBmb3JFYWNoKGZuOiAobmFtZTogc3RyaW5nLCB2YWx1ZXM6IHN0cmluZ1tdKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgQXJyYXkuZnJvbSh0aGlzLm5vcm1hbGl6ZWROYW1lcy5rZXlzKCkpXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiBmbih0aGlzLm5vcm1hbGl6ZWROYW1lcy5nZXQoa2V5KSAhLCB0aGlzLmhlYWRlcnMuZ2V0KGtleSkgISkpO1xuICB9XG59XG4iXX0=