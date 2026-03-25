/**
 * @license Angular v22.0.0-next.4+sha-24e52d4
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
