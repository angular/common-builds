/**
 * @license Angular v19.2.7+sha-9d08525
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
