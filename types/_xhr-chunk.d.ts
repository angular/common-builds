/**
 * @license Angular v21.1.2+sha-6f75b6e-with-local-changes
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
