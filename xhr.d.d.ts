/**
 * @license Angular v20.2.3+sha-3b42314
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
