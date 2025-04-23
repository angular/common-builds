/**
 * @license Angular v20.0.0-next.7+sha-62de7d9
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
