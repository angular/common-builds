/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Represents the header configuration options for an HTTP request.
 * Instances are immutable. Modifying methods return a cloned
 * instance with the change. The original object is never changed.
 *
 * @publicApi
 */
export class HttpHeaders {
    /**  Constructs a new HTTP header object with the given values.*/
    constructor(headers) {
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
            this.lazyInit = () => {
                this.headers = new Map();
                headers.split('\n').forEach(line => {
                    const index = line.indexOf(':');
                    if (index > 0) {
                        const name = line.slice(0, index);
                        const key = name.toLowerCase();
                        const value = line.slice(index + 1).trim();
                        this.maybeSetNormalizedName(name, key);
                        if (this.headers.has(key)) {
                            this.headers.get(key).push(value);
                        }
                        else {
                            this.headers.set(key, [value]);
                        }
                    }
                });
            };
        }
        else if (typeof Headers !== 'undefined' && headers instanceof Headers) {
            this.headers = new Map();
            headers.forEach((values, name) => {
                this.setHeaderEntries(name, values);
            });
        }
        else {
            this.lazyInit = () => {
                if (typeof ngDevMode === 'undefined' || ngDevMode) {
                    assertValidHeaders(headers);
                }
                this.headers = new Map();
                Object.entries(headers).forEach(([name, values]) => {
                    this.setHeaderEntries(name, values);
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
    has(name) {
        this.init();
        return this.headers.has(name.toLowerCase());
    }
    /**
     * Retrieves the first value of a given header.
     *
     * @param name The header name.
     *
     * @returns The value string if the header exists, null otherwise
     */
    get(name) {
        this.init();
        const values = this.headers.get(name.toLowerCase());
        return values && values.length > 0 ? values[0] : null;
    }
    /**
     * Retrieves the names of the headers.
     *
     * @returns A list of header names.
     */
    keys() {
        this.init();
        return Array.from(this.normalizedNames.values());
    }
    /**
     * Retrieves a list of values for a given header.
     *
     * @param name The header name from which to retrieve values.
     *
     * @returns A string of values if the header exists, null otherwise.
     */
    getAll(name) {
        this.init();
        return this.headers.get(name.toLowerCase()) || null;
    }
    /**
     * Appends a new value to the existing set of values for a header
     * and returns them in a clone of the original instance.
     *
     * @param name The header name for which to append the values.
     * @param value The value to append.
     *
     * @returns A clone of the HTTP headers object with the value appended to the given header.
     */
    append(name, value) {
        return this.clone({ name, value, op: 'a' });
    }
    /**
     * Sets or modifies a value for a given header in a clone of the original instance.
     * If the header already exists, its value is replaced with the given value
     * in the returned object.
     *
     * @param name The header name.
     * @param value The value or values to set or override for the given header.
     *
     * @returns A clone of the HTTP headers object with the newly set header value.
     */
    set(name, value) {
        return this.clone({ name, value, op: 's' });
    }
    /**
     * Deletes values for a given header in a clone of the original instance.
     *
     * @param name The header name.
     * @param value The value or values to delete for the given header.
     *
     * @returns A clone of the HTTP headers object with the given value deleted.
     */
    delete(name, value) {
        return this.clone({ name, value, op: 'd' });
    }
    maybeSetNormalizedName(name, lcName) {
        if (!this.normalizedNames.has(lcName)) {
            this.normalizedNames.set(lcName, name);
        }
    }
    init() {
        if (!!this.lazyInit) {
            if (this.lazyInit instanceof HttpHeaders) {
                this.copyFrom(this.lazyInit);
            }
            else {
                this.lazyInit();
            }
            this.lazyInit = null;
            if (!!this.lazyUpdate) {
                this.lazyUpdate.forEach(update => this.applyUpdate(update));
                this.lazyUpdate = null;
            }
        }
    }
    copyFrom(other) {
        other.init();
        Array.from(other.headers.keys()).forEach(key => {
            this.headers.set(key, other.headers.get(key));
            this.normalizedNames.set(key, other.normalizedNames.get(key));
        });
    }
    clone(update) {
        const clone = new HttpHeaders();
        clone.lazyInit =
            (!!this.lazyInit && this.lazyInit instanceof HttpHeaders) ? this.lazyInit : this;
        clone.lazyUpdate = (this.lazyUpdate || []).concat([update]);
        return clone;
    }
    applyUpdate(update) {
        const key = update.name.toLowerCase();
        switch (update.op) {
            case 'a':
            case 's':
                let value = update.value;
                if (typeof value === 'string') {
                    value = [value];
                }
                if (value.length === 0) {
                    return;
                }
                this.maybeSetNormalizedName(update.name, key);
                const base = (update.op === 'a' ? this.headers.get(key) : undefined) || [];
                base.push(...value);
                this.headers.set(key, base);
                break;
            case 'd':
                const toDelete = update.value;
                if (!toDelete) {
                    this.headers.delete(key);
                    this.normalizedNames.delete(key);
                }
                else {
                    let existing = this.headers.get(key);
                    if (!existing) {
                        return;
                    }
                    existing = existing.filter(value => toDelete.indexOf(value) === -1);
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
    }
    setHeaderEntries(name, values) {
        const headerValues = (Array.isArray(values) ? values : [values]).map((value) => value.toString());
        const key = name.toLowerCase();
        this.headers.set(key, headerValues);
        this.maybeSetNormalizedName(name, key);
    }
    /**
     * @internal
     */
    forEach(fn) {
        this.init();
        Array.from(this.normalizedNames.keys())
            .forEach(key => fn(this.normalizedNames.get(key), this.headers.get(key)));
    }
}
/**
 * Verifies that the headers object has the right shape: the values
 * must be either strings, numbers or arrays. Throws an error if an invalid
 * header value is present.
 */
function assertValidHeaders(headers) {
    for (const [key, value] of Object.entries(headers)) {
        if (!(typeof value === 'string' || typeof value === 'number') && !Array.isArray(value)) {
            throw new Error(`Unexpected value of the \`${key}\` header provided. ` +
                `Expecting either a string, a number or an array, but got: \`${value}\`.`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy9oZWFkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQVFIOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBd0J0QixpRUFBaUU7SUFFakUsWUFBWSxPQUFnRjtRQWxCNUY7OztXQUdHO1FBQ0ssb0JBQWUsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQU96RDs7V0FFRztRQUNLLGVBQVUsR0FBa0IsSUFBSSxDQUFDO1FBS3ZDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7UUFDN0MsQ0FBQzthQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7Z0JBQzNDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNqQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDZCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLHNC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RyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7Q0FDRjtBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGtCQUFrQixDQUFDLE9BQXdDO0lBRWxFLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDbkQsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3ZGLE1BQU0sSUFBSSxLQUFLLENBQ1gsNkJBQTZCLEdBQUcsc0JBQXNCO2dCQUN0RCwrREFBK0QsS0FBSyxLQUFLLENBQUMsQ0FBQztRQUNqRixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW50ZXJmYWNlIFVwZGF0ZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU/OiBzdHJpbmd8c3RyaW5nW107XG4gIG9wOiAnYSd8J3MnfCdkJztcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBoZWFkZXIgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciBhbiBIVFRQIHJlcXVlc3QuXG4gKiBJbnN0YW5jZXMgYXJlIGltbXV0YWJsZS4gTW9kaWZ5aW5nIG1ldGhvZHMgcmV0dXJuIGEgY2xvbmVkXG4gKiBpbnN0YW5jZSB3aXRoIHRoZSBjaGFuZ2UuIFRoZSBvcmlnaW5hbCBvYmplY3QgaXMgbmV2ZXIgY2hhbmdlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwSGVhZGVycyB7XG4gIC8qKlxuICAgKiBJbnRlcm5hbCBtYXAgb2YgbG93ZXJjYXNlIGhlYWRlciBuYW1lcyB0byB2YWx1ZXMuXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBoZWFkZXJzITogTWFwPHN0cmluZywgc3RyaW5nW10+O1xuXG5cbiAgLyoqXG4gICAqIEludGVybmFsIG1hcCBvZiBsb3dlcmNhc2VkIGhlYWRlciBuYW1lcyB0byB0aGUgbm9ybWFsaXplZFxuICAgKiBmb3JtIG9mIHRoZSBuYW1lICh0aGUgZm9ybSBzZWVuIGZpcnN0KS5cbiAgICovXG4gIHByaXZhdGUgbm9ybWFsaXplZE5hbWVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gIC8qKlxuICAgKiBDb21wbGV0ZSB0aGUgbGF6eSBpbml0aWFsaXphdGlvbiBvZiB0aGlzIG9iamVjdCAobmVlZGVkIGJlZm9yZSByZWFkaW5nKS5cbiAgICovXG4gIHByaXZhdGUgbGF6eUluaXQhOiBIdHRwSGVhZGVyc3xGdW5jdGlvbnxudWxsO1xuXG4gIC8qKlxuICAgKiBRdWV1ZWQgdXBkYXRlcyB0byBiZSBtYXRlcmlhbGl6ZWQgdGhlIG5leHQgaW5pdGlhbGl6YXRpb24uXG4gICAqL1xuICBwcml2YXRlIGxhenlVcGRhdGU6IFVwZGF0ZVtdfG51bGwgPSBudWxsO1xuXG4gIC8qKiAgQ29uc3RydWN0cyBhIG5ldyBIVFRQIGhlYWRlciBvYmplY3Qgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzLiovXG5cbiAgY29uc3RydWN0b3IoaGVhZGVycz86IHN0cmluZ3x7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IChzdHJpbmcgfCBudW1iZXIpW119fEhlYWRlcnMpIHtcbiAgICBpZiAoIWhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBoZWFkZXJzID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5sYXp5SW5pdCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICAgICAgICBoZWFkZXJzLnNwbGl0KCdcXG4nKS5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsaW5lLnNsaWNlKGluZGV4ICsgMSkudHJpbSgpO1xuICAgICAgICAgICAgdGhpcy5tYXliZVNldE5vcm1hbGl6ZWROYW1lKG5hbWUsIGtleSk7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFkZXJzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgIHRoaXMuaGVhZGVycy5nZXQoa2V5KSEucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KGtleSwgW3ZhbHVlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgSGVhZGVycyAhPT0gJ3VuZGVmaW5lZCcgJiYgaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaCgodmFsdWVzOiBzdHJpbmcsIG5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLnNldEhlYWRlckVudHJpZXMobmFtZSwgdmFsdWVzKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxhenlJbml0ID0gKCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgICAgYXNzZXJ0VmFsaWRIZWFkZXJzKGhlYWRlcnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoaGVhZGVycykuZm9yRWFjaCgoW25hbWUsIHZhbHVlc10pID0+IHtcbiAgICAgICAgICB0aGlzLnNldEhlYWRlckVudHJpZXMobmFtZSwgdmFsdWVzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgZm9yIGV4aXN0ZW5jZSBvZiBhIGdpdmVuIGhlYWRlci5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGhlYWRlciBuYW1lIHRvIGNoZWNrIGZvciBleGlzdGVuY2UuXG4gICAqXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGhlYWRlciBleGlzdHMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzLmhlYWRlcnMuaGFzKG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBmaXJzdCB2YWx1ZSBvZiBhIGdpdmVuIGhlYWRlci5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGhlYWRlciBuYW1lLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgdmFsdWUgc3RyaW5nIGlmIHRoZSBoZWFkZXIgZXhpc3RzLCBudWxsIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICB0aGlzLmluaXQoKTtcblxuICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuaGVhZGVycy5nZXQobmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICByZXR1cm4gdmFsdWVzICYmIHZhbHVlcy5sZW5ndGggPiAwID8gdmFsdWVzWzBdIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIG5hbWVzIG9mIHRoZSBoZWFkZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGxpc3Qgb2YgaGVhZGVyIG5hbWVzLlxuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7XG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLm5vcm1hbGl6ZWROYW1lcy52YWx1ZXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGEgbGlzdCBvZiB2YWx1ZXMgZm9yIGEgZ2l2ZW4gaGVhZGVyLlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgaGVhZGVyIG5hbWUgZnJvbSB3aGljaCB0byByZXRyaWV2ZSB2YWx1ZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nIG9mIHZhbHVlcyBpZiB0aGUgaGVhZGVyIGV4aXN0cywgbnVsbCBvdGhlcndpc2UuXG4gICAqL1xuICBnZXRBbGwobmFtZTogc3RyaW5nKTogc3RyaW5nW118bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcy5oZWFkZXJzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhIG5ldyB2YWx1ZSB0byB0aGUgZXhpc3Rpbmcgc2V0IG9mIHZhbHVlcyBmb3IgYSBoZWFkZXJcbiAgICogYW5kIHJldHVybnMgdGhlbSBpbiBhIGNsb25lIG9mIHRoZSBvcmlnaW5hbCBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIGhlYWRlciBuYW1lIGZvciB3aGljaCB0byBhcHBlbmQgdGhlIHZhbHVlcy5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBhcHBlbmQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgY2xvbmUgb2YgdGhlIEhUVFAgaGVhZGVycyBvYmplY3Qgd2l0aCB0aGUgdmFsdWUgYXBwZW5kZWQgdG8gdGhlIGdpdmVuIGhlYWRlci5cbiAgICovXG5cbiAgYXBwZW5kKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xzdHJpbmdbXSk6IEh0dHBIZWFkZXJzIHtcbiAgICByZXR1cm4gdGhpcy5jbG9uZSh7bmFtZSwgdmFsdWUsIG9wOiAnYSd9KTtcbiAgfVxuICAvKipcbiAgICogU2V0cyBvciBtb2RpZmllcyBhIHZhbHVlIGZvciBhIGdpdmVuIGhlYWRlciBpbiBhIGNsb25lIG9mIHRoZSBvcmlnaW5hbCBpbnN0YW5jZS5cbiAgICogSWYgdGhlIGhlYWRlciBhbHJlYWR5IGV4aXN0cywgaXRzIHZhbHVlIGlzIHJlcGxhY2VkIHdpdGggdGhlIGdpdmVuIHZhbHVlXG4gICAqIGluIHRoZSByZXR1cm5lZCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBoZWFkZXIgbmFtZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvciB2YWx1ZXMgdG8gc2V0IG9yIG92ZXJyaWRlIGZvciB0aGUgZ2l2ZW4gaGVhZGVyLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGNsb25lIG9mIHRoZSBIVFRQIGhlYWRlcnMgb2JqZWN0IHdpdGggdGhlIG5ld2x5IHNldCBoZWFkZXIgdmFsdWUuXG4gICAqL1xuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfHN0cmluZ1tdKTogSHR0cEhlYWRlcnMge1xuICAgIHJldHVybiB0aGlzLmNsb25lKHtuYW1lLCB2YWx1ZSwgb3A6ICdzJ30pO1xuICB9XG4gIC8qKlxuICAgKiBEZWxldGVzIHZhbHVlcyBmb3IgYSBnaXZlbiBoZWFkZXIgaW4gYSBjbG9uZSBvZiB0aGUgb3JpZ2luYWwgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBoZWFkZXIgbmFtZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvciB2YWx1ZXMgdG8gZGVsZXRlIGZvciB0aGUgZ2l2ZW4gaGVhZGVyLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGNsb25lIG9mIHRoZSBIVFRQIGhlYWRlcnMgb2JqZWN0IHdpdGggdGhlIGdpdmVuIHZhbHVlIGRlbGV0ZWQuXG4gICAqL1xuICBkZWxldGUobmFtZTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZ3xzdHJpbmdbXSk6IEh0dHBIZWFkZXJzIHtcbiAgICByZXR1cm4gdGhpcy5jbG9uZSh7bmFtZSwgdmFsdWUsIG9wOiAnZCd9KTtcbiAgfVxuXG4gIHByaXZhdGUgbWF5YmVTZXROb3JtYWxpemVkTmFtZShuYW1lOiBzdHJpbmcsIGxjTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm5vcm1hbGl6ZWROYW1lcy5oYXMobGNOYW1lKSkge1xuICAgICAgdGhpcy5ub3JtYWxpemVkTmFtZXMuc2V0KGxjTmFtZSwgbmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0KCk6IHZvaWQge1xuICAgIGlmICghIXRoaXMubGF6eUluaXQpIHtcbiAgICAgIGlmICh0aGlzLmxhenlJbml0IGluc3RhbmNlb2YgSHR0cEhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5jb3B5RnJvbSh0aGlzLmxhenlJbml0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGF6eUluaXQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubGF6eUluaXQgPSBudWxsO1xuICAgICAgaWYgKCEhdGhpcy5sYXp5VXBkYXRlKSB7XG4gICAgICAgIHRoaXMubGF6eVVwZGF0ZS5mb3JFYWNoKHVwZGF0ZSA9PiB0aGlzLmFwcGx5VXBkYXRlKHVwZGF0ZSkpO1xuICAgICAgICB0aGlzLmxhenlVcGRhdGUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29weUZyb20ob3RoZXI6IEh0dHBIZWFkZXJzKSB7XG4gICAgb3RoZXIuaW5pdCgpO1xuICAgIEFycmF5LmZyb20ob3RoZXIuaGVhZGVycy5rZXlzKCkpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHRoaXMuaGVhZGVycy5zZXQoa2V5LCBvdGhlci5oZWFkZXJzLmdldChrZXkpISk7XG4gICAgICB0aGlzLm5vcm1hbGl6ZWROYW1lcy5zZXQoa2V5LCBvdGhlci5ub3JtYWxpemVkTmFtZXMuZ2V0KGtleSkhKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY2xvbmUodXBkYXRlOiBVcGRhdGUpOiBIdHRwSGVhZGVycyB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBjbG9uZS5sYXp5SW5pdCA9XG4gICAgICAgICghIXRoaXMubGF6eUluaXQgJiYgdGhpcy5sYXp5SW5pdCBpbnN0YW5jZW9mIEh0dHBIZWFkZXJzKSA/IHRoaXMubGF6eUluaXQgOiB0aGlzO1xuICAgIGNsb25lLmxhenlVcGRhdGUgPSAodGhpcy5sYXp5VXBkYXRlIHx8IFtdKS5jb25jYXQoW3VwZGF0ZV0pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlVcGRhdGUodXBkYXRlOiBVcGRhdGUpOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSB1cGRhdGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHN3aXRjaCAodXBkYXRlLm9wKSB7XG4gICAgICBjYXNlICdhJzpcbiAgICAgIGNhc2UgJ3MnOlxuICAgICAgICBsZXQgdmFsdWUgPSB1cGRhdGUudmFsdWUhO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHZhbHVlID0gW3ZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWF5YmVTZXROb3JtYWxpemVkTmFtZSh1cGRhdGUubmFtZSwga2V5KTtcbiAgICAgICAgY29uc3QgYmFzZSA9ICh1cGRhdGUub3AgPT09ICdhJyA/IHRoaXMuaGVhZGVycy5nZXQoa2V5KSA6IHVuZGVmaW5lZCkgfHwgW107XG4gICAgICAgIGJhc2UucHVzaCguLi52YWx1ZSk7XG4gICAgICAgIHRoaXMuaGVhZGVycy5zZXQoa2V5LCBiYXNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkJzpcbiAgICAgICAgY29uc3QgdG9EZWxldGUgPSB1cGRhdGUudmFsdWUgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAoIXRvRGVsZXRlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIHRoaXMubm9ybWFsaXplZE5hbWVzLmRlbGV0ZShrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBleGlzdGluZyA9IHRoaXMuaGVhZGVycy5nZXQoa2V5KTtcbiAgICAgICAgICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGV4aXN0aW5nID0gZXhpc3RpbmcuZmlsdGVyKHZhbHVlID0+IHRvRGVsZXRlLmluZGV4T2YodmFsdWUpID09PSAtMSk7XG4gICAgICAgICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5oZWFkZXJzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgdGhpcy5ub3JtYWxpemVkTmFtZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoa2V5LCBleGlzdGluZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0SGVhZGVyRW50cmllcyhuYW1lOiBzdHJpbmcsIHZhbHVlczogYW55KSB7XG4gICAgY29uc3QgaGVhZGVyVmFsdWVzID1cbiAgICAgICAgKEFycmF5LmlzQXJyYXkodmFsdWVzKSA/IHZhbHVlcyA6IFt2YWx1ZXNdKS5tYXAoKHZhbHVlKSA9PiB2YWx1ZS50b1N0cmluZygpKTtcbiAgICBjb25zdCBrZXkgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5oZWFkZXJzLnNldChrZXksIGhlYWRlclZhbHVlcyk7XG4gICAgdGhpcy5tYXliZVNldE5vcm1hbGl6ZWROYW1lKG5hbWUsIGtleSk7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBmb3JFYWNoKGZuOiAobmFtZTogc3RyaW5nLCB2YWx1ZXM6IHN0cmluZ1tdKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgQXJyYXkuZnJvbSh0aGlzLm5vcm1hbGl6ZWROYW1lcy5rZXlzKCkpXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiBmbih0aGlzLm5vcm1hbGl6ZWROYW1lcy5nZXQoa2V5KSEsIHRoaXMuaGVhZGVycy5nZXQoa2V5KSEpKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGhlYWRlcnMgb2JqZWN0IGhhcyB0aGUgcmlnaHQgc2hhcGU6IHRoZSB2YWx1ZXNcbiAqIG11c3QgYmUgZWl0aGVyIHN0cmluZ3MsIG51bWJlcnMgb3IgYXJyYXlzLiBUaHJvd3MgYW4gZXJyb3IgaWYgYW4gaW52YWxpZFxuICogaGVhZGVyIHZhbHVlIGlzIHByZXNlbnQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZhbGlkSGVhZGVycyhoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPnxIZWFkZXJzKTpcbiAgICBhc3NlcnRzIGhlYWRlcnMgaXMgUmVjb3JkPHN0cmluZywgc3RyaW5nfHN0cmluZ1tdfG51bWJlcnxudW1iZXJbXT4ge1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhoZWFkZXJzKSkge1xuICAgIGlmICghKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgdmFsdWUgb2YgdGhlIFxcYCR7a2V5fVxcYCBoZWFkZXIgcHJvdmlkZWQuIGAgK1xuICAgICAgICAgIGBFeHBlY3RpbmcgZWl0aGVyIGEgc3RyaW5nLCBhIG51bWJlciBvciBhbiBhcnJheSwgYnV0IGdvdDogXFxgJHt2YWx1ZX1cXGAuYCk7XG4gICAgfVxuICB9XG59XG4iXX0=