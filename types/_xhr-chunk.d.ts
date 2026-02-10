/**
 * @license Angular v21.1.3+sha-c6bbf40
 * (c) 2010-2026 Google LLC. https://angular.dev/
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
