/**
 * @license Angular v21.0.0-next.9+sha-3fbaaa0
 * (c) 2010-2025 Google LLC. https://angular.dev/
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
