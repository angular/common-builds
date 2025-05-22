/**
 * @license Angular v19.2.12+sha-a6d5479
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
