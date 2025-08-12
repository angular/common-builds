/**
 * @license Angular v20.2.0-rc.0+sha-31df4d2
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
declare abstract class XhrFactory {
    abstract build(): XMLHttpRequest;
}

export { XhrFactory };
