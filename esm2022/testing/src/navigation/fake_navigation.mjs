/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Prevents deletion of `Event` from `globalThis` during module loading.
const Event = globalThis.Event;
/**
 * Fake implementation of user agent history and navigation behavior. This is a
 * high-fidelity implementation of browser behavior that attempts to emulate
 * things like traversal delay.
 */
export class FakeNavigation {
    /** Equivalent to `navigation.currentEntry`. */
    get currentEntry() {
        return this.entriesArr[this.currentEntryIndex];
    }
    get canGoBack() {
        return this.currentEntryIndex > 0;
    }
    get canGoForward() {
        return this.currentEntryIndex < this.entriesArr.length - 1;
    }
    constructor(window, startURL) {
        this.window = window;
        /**
         * The fake implementation of an entries array. Only same-document entries
         * allowed.
         */
        this.entriesArr = [];
        /**
         * The current active entry index into `entriesArr`.
         */
        this.currentEntryIndex = 0;
        /**
         * The current navigate event.
         */
        this.navigateEvent = undefined;
        /**
         * A Map of pending traversals, so that traversals to the same entry can be
         * re-used.
         */
        this.traversalQueue = new Map();
        /**
         * A Promise that resolves when the previous traversals have finished. Used to
         * simulate the cross-process communication necessary for traversals.
         */
        this.nextTraversal = Promise.resolve();
        /**
         * A prospective current active entry index, which includes unresolved
         * traversals. Used by `go` to determine where navigations are intended to go.
         */
        this.prospectiveEntryIndex = 0;
        /**
         * A test-only option to make traversals synchronous, rather than emulate
         * cross-process communication.
         */
        this.synchronousTraversals = false;
        /** Whether to allow a call to setInitialEntryForTesting. */
        this.canSetInitialEntry = true;
        /** `EventTarget` to dispatch events. */
        this.eventTarget = this.window.document.createElement('div');
        /** The next unique id for created entries. Replace recreates this id. */
        this.nextId = 0;
        /** The next unique key for created entries. Replace inherits this id. */
        this.nextKey = 0;
        /** Whether this fake is disposed. */
        this.disposed = false;
        // First entry.
        this.setInitialEntryForTesting(startURL);
    }
    /**
     * Sets the initial entry.
     */
    setInitialEntryForTesting(url, options = { historyState: null }) {
        if (!this.canSetInitialEntry) {
            throw new Error('setInitialEntryForTesting can only be called before any ' +
                'navigation has occurred');
        }
        const currentInitialEntry = this.entriesArr[0];
        this.entriesArr[0] = new FakeNavigationHistoryEntry(new URL(url).toString(), {
            index: 0,
            key: currentInitialEntry?.key ?? String(this.nextKey++),
            id: currentInitialEntry?.id ?? String(this.nextId++),
            sameDocument: true,
            historyState: options?.historyState,
            state: options.state,
        });
    }
    /** Returns whether the initial entry is still eligible to be set. */
    canSetInitialEntryForTesting() {
        return this.canSetInitialEntry;
    }
    /**
     * Sets whether to emulate traversals as synchronous rather than
     * asynchronous.
     */
    setSynchronousTraversalsForTesting(synchronousTraversals) {
        this.synchronousTraversals = synchronousTraversals;
    }
    /** Equivalent to `navigation.entries()`. */
    entries() {
        return this.entriesArr.slice();
    }
    /** Equivalent to `navigation.navigate()`. */
    navigate(url, options) {
        const fromUrl = new URL(this.currentEntry.url);
        const toUrl = new URL(url, this.currentEntry.url);
        let navigationType;
        if (!options?.history || options.history === 'auto') {
            // Auto defaults to push, but if the URLs are the same, is a replace.
            if (fromUrl.toString() === toUrl.toString()) {
                navigationType = 'replace';
            }
            else {
                navigationType = 'push';
            }
        }
        else {
            navigationType = options.history;
        }
        const hashChange = isHashChange(fromUrl, toUrl);
        const destination = new FakeNavigationDestination({
            url: toUrl.toString(),
            state: options?.state,
            sameDocument: hashChange,
            historyState: null,
        });
        const result = new InternalNavigationResult();
        this.userAgentNavigate(destination, result, {
            navigationType,
            cancelable: true,
            canIntercept: true,
            // Always false for navigate().
            userInitiated: false,
            hashChange,
            info: options?.info,
        });
        return {
            committed: result.committed,
            finished: result.finished,
        };
    }
    /** Equivalent to `history.pushState()`. */
    pushState(data, title, url) {
        this.pushOrReplaceState('push', data, title, url);
    }
    /** Equivalent to `history.replaceState()`. */
    replaceState(data, title, url) {
        this.pushOrReplaceState('replace', data, title, url);
    }
    pushOrReplaceState(navigationType, data, _title, url) {
        const fromUrl = new URL(this.currentEntry.url);
        const toUrl = url ? new URL(url, this.currentEntry.url) : fromUrl;
        const hashChange = isHashChange(fromUrl, toUrl);
        const destination = new FakeNavigationDestination({
            url: toUrl.toString(),
            sameDocument: true,
            historyState: data,
        });
        const result = new InternalNavigationResult();
        this.userAgentNavigate(destination, result, {
            navigationType,
            cancelable: true,
            canIntercept: true,
            // Always false for pushState() or replaceState().
            userInitiated: false,
            hashChange,
            skipPopState: true,
        });
    }
    /** Equivalent to `navigation.traverseTo()`. */
    traverseTo(key, options) {
        const fromUrl = new URL(this.currentEntry.url);
        const entry = this.findEntry(key);
        if (!entry) {
            const domException = new DOMException('Invalid key', 'InvalidStateError');
            const committed = Promise.reject(domException);
            const finished = Promise.reject(domException);
            committed.catch(() => { });
            finished.catch(() => { });
            return {
                committed,
                finished,
            };
        }
        if (entry === this.currentEntry) {
            return {
                committed: Promise.resolve(this.currentEntry),
                finished: Promise.resolve(this.currentEntry),
            };
        }
        if (this.traversalQueue.has(entry.key)) {
            const existingResult = this.traversalQueue.get(entry.key);
            return {
                committed: existingResult.committed,
                finished: existingResult.finished,
            };
        }
        const hashChange = isHashChange(fromUrl, new URL(entry.url, this.currentEntry.url));
        const destination = new FakeNavigationDestination({
            url: entry.url,
            state: entry.getState(),
            historyState: entry.getHistoryState(),
            key: entry.key,
            id: entry.id,
            index: entry.index,
            sameDocument: entry.sameDocument,
        });
        this.prospectiveEntryIndex = entry.index;
        const result = new InternalNavigationResult();
        this.traversalQueue.set(entry.key, result);
        this.runTraversal(() => {
            this.traversalQueue.delete(entry.key);
            this.userAgentNavigate(destination, result, {
                navigationType: 'traverse',
                cancelable: true,
                canIntercept: true,
                // Always false for traverseTo().
                userInitiated: false,
                hashChange,
                info: options?.info,
            });
        });
        return {
            committed: result.committed,
            finished: result.finished,
        };
    }
    /** Equivalent to `navigation.back()`. */
    back(options) {
        if (this.currentEntryIndex === 0) {
            const domException = new DOMException('Cannot go back', 'InvalidStateError');
            const committed = Promise.reject(domException);
            const finished = Promise.reject(domException);
            committed.catch(() => { });
            finished.catch(() => { });
            return {
                committed,
                finished,
            };
        }
        const entry = this.entriesArr[this.currentEntryIndex - 1];
        return this.traverseTo(entry.key, options);
    }
    /** Equivalent to `navigation.forward()`. */
    forward(options) {
        if (this.currentEntryIndex === this.entriesArr.length - 1) {
            const domException = new DOMException('Cannot go forward', 'InvalidStateError');
            const committed = Promise.reject(domException);
            const finished = Promise.reject(domException);
            committed.catch(() => { });
            finished.catch(() => { });
            return {
                committed,
                finished,
            };
        }
        const entry = this.entriesArr[this.currentEntryIndex + 1];
        return this.traverseTo(entry.key, options);
    }
    /**
     * Equivalent to `history.go()`.
     * Note that this method does not actually work precisely to how Chrome
     * does, instead choosing a simpler model with less unexpected behavior.
     * Chrome has a few edge case optimizations, for instance with repeated
     * `back(); forward()` chains it collapses certain traversals.
     */
    go(direction) {
        const targetIndex = this.prospectiveEntryIndex + direction;
        if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
            return;
        }
        this.prospectiveEntryIndex = targetIndex;
        this.runTraversal(() => {
            // Check again that destination is in the entries array.
            if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
                return;
            }
            const fromUrl = new URL(this.currentEntry.url);
            const entry = this.entriesArr[targetIndex];
            const hashChange = isHashChange(fromUrl, new URL(entry.url, this.currentEntry.url));
            const destination = new FakeNavigationDestination({
                url: entry.url,
                state: entry.getState(),
                historyState: entry.getHistoryState(),
                key: entry.key,
                id: entry.id,
                index: entry.index,
                sameDocument: entry.sameDocument,
            });
            const result = new InternalNavigationResult();
            this.userAgentNavigate(destination, result, {
                navigationType: 'traverse',
                cancelable: true,
                canIntercept: true,
                // Always false for go().
                userInitiated: false,
                hashChange,
            });
        });
    }
    /** Runs a traversal synchronously or asynchronously */
    runTraversal(traversal) {
        if (this.synchronousTraversals) {
            traversal();
            return;
        }
        // Each traversal occupies a single timeout resolution.
        // This means that Promises added to commit and finish should resolve
        // before the next traversal.
        this.nextTraversal = this.nextTraversal.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                    traversal();
                });
            });
        });
    }
    /** Equivalent to `navigation.addEventListener()`. */
    addEventListener(type, callback, options) {
        this.eventTarget.addEventListener(type, callback, options);
    }
    /** Equivalent to `navigation.removeEventListener()`. */
    removeEventListener(type, callback, options) {
        this.eventTarget.removeEventListener(type, callback, options);
    }
    /** Equivalent to `navigation.dispatchEvent()` */
    dispatchEvent(event) {
        return this.eventTarget.dispatchEvent(event);
    }
    /** Cleans up resources. */
    dispose() {
        // Recreate eventTarget to release current listeners.
        // `document.createElement` because NodeJS `EventTarget` is incompatible with Domino's `Event`.
        this.eventTarget = this.window.document.createElement('div');
        this.disposed = true;
    }
    /** Returns whether this fake is disposed. */
    isDisposed() {
        return this.disposed;
    }
    /** Implementation for all navigations and traversals. */
    userAgentNavigate(destination, result, options) {
        // The first navigation should disallow any future calls to set the initial
        // entry.
        this.canSetInitialEntry = false;
        if (this.navigateEvent) {
            this.navigateEvent.cancel(new DOMException('Navigation was aborted', 'AbortError'));
            this.navigateEvent = undefined;
        }
        const navigateEvent = createFakeNavigateEvent({
            navigationType: options.navigationType,
            cancelable: options.cancelable,
            canIntercept: options.canIntercept,
            userInitiated: options.userInitiated,
            hashChange: options.hashChange,
            signal: result.signal,
            destination,
            info: options.info,
            sameDocument: destination.sameDocument,
            skipPopState: options.skipPopState,
            result,
            userAgentCommit: () => {
                this.userAgentCommit();
            },
        });
        this.navigateEvent = navigateEvent;
        this.eventTarget.dispatchEvent(navigateEvent);
        navigateEvent.dispatchedNavigateEvent();
        if (navigateEvent.commitOption === 'immediate') {
            navigateEvent.commit(/* internal= */ true);
        }
    }
    /** Implementation to commit a navigation. */
    userAgentCommit() {
        if (!this.navigateEvent) {
            return;
        }
        const from = this.currentEntry;
        if (!this.navigateEvent.sameDocument) {
            const error = new Error('Cannot navigate to a non-same-document URL.');
            this.navigateEvent.cancel(error);
            throw error;
        }
        if (this.navigateEvent.navigationType === 'push' ||
            this.navigateEvent.navigationType === 'replace') {
            this.userAgentPushOrReplace(this.navigateEvent.destination, {
                navigationType: this.navigateEvent.navigationType,
            });
        }
        else if (this.navigateEvent.navigationType === 'traverse') {
            this.userAgentTraverse(this.navigateEvent.destination);
        }
        this.navigateEvent.userAgentNavigated(this.currentEntry);
        const currentEntryChangeEvent = createFakeNavigationCurrentEntryChangeEvent({ from, navigationType: this.navigateEvent.navigationType });
        this.eventTarget.dispatchEvent(currentEntryChangeEvent);
        if (!this.navigateEvent.skipPopState) {
            const popStateEvent = createPopStateEvent({
                state: this.navigateEvent.destination.getHistoryState(),
            });
            this.window.dispatchEvent(popStateEvent);
        }
    }
    /** Implementation for a push or replace navigation. */
    userAgentPushOrReplace(destination, { navigationType }) {
        if (navigationType === 'push') {
            this.currentEntryIndex++;
            this.prospectiveEntryIndex = this.currentEntryIndex;
        }
        const index = this.currentEntryIndex;
        const key = navigationType === 'push' ? String(this.nextKey++) : this.currentEntry.key;
        const entry = new FakeNavigationHistoryEntry(destination.url, {
            id: String(this.nextId++),
            key,
            index,
            sameDocument: true,
            state: destination.getState(),
            historyState: destination.getHistoryState(),
        });
        if (navigationType === 'push') {
            this.entriesArr.splice(index, Infinity, entry);
        }
        else {
            this.entriesArr[index] = entry;
        }
    }
    /** Implementation for a traverse navigation. */
    userAgentTraverse(destination) {
        this.currentEntryIndex = destination.index;
    }
    /** Utility method for finding entries with the given `key`. */
    findEntry(key) {
        for (const entry of this.entriesArr) {
            if (entry.key === key)
                return entry;
        }
        return undefined;
    }
    set onnavigate(_handler) {
        throw new Error('unimplemented');
    }
    get onnavigate() {
        throw new Error('unimplemented');
    }
    set oncurrententrychange(_handler) {
        throw new Error('unimplemented');
    }
    get oncurrententrychange() {
        throw new Error('unimplemented');
    }
    set onnavigatesuccess(_handler) {
        throw new Error('unimplemented');
    }
    get onnavigatesuccess() {
        throw new Error('unimplemented');
    }
    set onnavigateerror(_handler) {
        throw new Error('unimplemented');
    }
    get onnavigateerror() {
        throw new Error('unimplemented');
    }
    get transition() {
        throw new Error('unimplemented');
    }
    updateCurrentEntry(_options) {
        throw new Error('unimplemented');
    }
    reload(_options) {
        throw new Error('unimplemented');
    }
}
/**
 * Fake equivalent of `NavigationHistoryEntry`.
 */
export class FakeNavigationHistoryEntry {
    constructor(url, { id, key, index, sameDocument, state, historyState, }) {
        this.url = url;
        // tslint:disable-next-line:no-any
        this.ondispose = null;
        this.id = id;
        this.key = key;
        this.index = index;
        this.sameDocument = sameDocument;
        this.state = state;
        this.historyState = historyState;
    }
    getState() {
        // Budget copy.
        return this.state ? JSON.parse(JSON.stringify(this.state)) : this.state;
    }
    getHistoryState() {
        // Budget copy.
        return this.historyState ? JSON.parse(JSON.stringify(this.historyState)) : this.historyState;
    }
    addEventListener(type, callback, options) {
        throw new Error('unimplemented');
    }
    removeEventListener(type, callback, options) {
        throw new Error('unimplemented');
    }
    dispatchEvent(event) {
        throw new Error('unimplemented');
    }
}
/**
 * Create a fake equivalent of `NavigateEvent`. This is not a class because ES5
 * transpiled JavaScript cannot extend native Event.
 */
function createFakeNavigateEvent({ cancelable, canIntercept, userInitiated, hashChange, navigationType, signal, destination, info, sameDocument, skipPopState, result, userAgentCommit, }) {
    const event = new Event('navigate', { bubbles: false, cancelable });
    event.canIntercept = canIntercept;
    event.userInitiated = userInitiated;
    event.hashChange = hashChange;
    event.navigationType = navigationType;
    event.signal = signal;
    event.destination = destination;
    event.info = info;
    event.downloadRequest = null;
    event.formData = null;
    event.sameDocument = sameDocument;
    event.skipPopState = skipPopState;
    event.commitOption = 'immediate';
    let handlerFinished = undefined;
    let interceptCalled = false;
    let dispatchedNavigateEvent = false;
    let commitCalled = false;
    event.intercept = function (options) {
        interceptCalled = true;
        event.sameDocument = true;
        const handler = options?.handler;
        if (handler) {
            handlerFinished = handler();
        }
        if (options?.commit) {
            event.commitOption = options.commit;
        }
        if (options?.focusReset !== undefined || options?.scroll !== undefined) {
            throw new Error('unimplemented');
        }
    };
    event.scroll = function () {
        throw new Error('unimplemented');
    };
    event.commit = function (internal = false) {
        if (!internal && !interceptCalled) {
            throw new DOMException(`Failed to execute 'commit' on 'NavigateEvent': intercept() must be ` +
                `called before commit().`, 'InvalidStateError');
        }
        if (!dispatchedNavigateEvent) {
            throw new DOMException(`Failed to execute 'commit' on 'NavigateEvent': commit() may not be ` +
                `called during event dispatch.`, 'InvalidStateError');
        }
        if (commitCalled) {
            throw new DOMException(`Failed to execute 'commit' on 'NavigateEvent': commit() already ` +
                `called.`, 'InvalidStateError');
        }
        commitCalled = true;
        userAgentCommit();
    };
    // Internal only.
    event.cancel = function (reason) {
        result.committedReject(reason);
        result.finishedReject(reason);
    };
    // Internal only.
    event.dispatchedNavigateEvent = function () {
        dispatchedNavigateEvent = true;
        if (event.commitOption === 'after-transition') {
            // If handler finishes before commit, call commit.
            handlerFinished?.then(() => {
                if (!commitCalled) {
                    event.commit(/* internal */ true);
                }
            }, () => { });
        }
        Promise.all([result.committed, handlerFinished])
            .then(([entry]) => {
            result.finishedResolve(entry);
        }, (reason) => {
            result.finishedReject(reason);
        });
    };
    // Internal only.
    event.userAgentNavigated = function (entry) {
        result.committedResolve(entry);
    };
    return event;
}
/**
 * Create a fake equivalent of `NavigationCurrentEntryChange`. This does not use
 * a class because ES5 transpiled JavaScript cannot extend native Event.
 */
function createFakeNavigationCurrentEntryChangeEvent({ from, navigationType, }) {
    const event = new Event('currententrychange', {
        bubbles: false,
        cancelable: false,
    });
    event.from = from;
    event.navigationType = navigationType;
    return event;
}
/**
 * Create a fake equivalent of `PopStateEvent`. This does not use a class
 * because ES5 transpiled JavaScript cannot extend native Event.
 */
function createPopStateEvent({ state }) {
    const event = new Event('popstate', {
        bubbles: false,
        cancelable: false,
    });
    event.state = state;
    return event;
}
/**
 * Fake equivalent of `NavigationDestination`.
 */
export class FakeNavigationDestination {
    constructor({ url, sameDocument, historyState, state, key = null, id = null, index = -1, }) {
        this.url = url;
        this.sameDocument = sameDocument;
        this.state = state;
        this.historyState = historyState;
        this.key = key;
        this.id = id;
        this.index = index;
    }
    getState() {
        return this.state;
    }
    getHistoryState() {
        return this.historyState;
    }
}
/** Utility function to determine whether two UrlLike have the same hash. */
function isHashChange(from, to) {
    return (to.hash !== from.hash && to.hostname === from.hostname && to.pathname === from.pathname &&
        to.search === from.search);
}
/** Internal utility class for representing the result of a navigation.  */
class InternalNavigationResult {
    get signal() {
        return this.abortController.signal;
    }
    constructor() {
        this.abortController = new AbortController();
        this.committed = new Promise((resolve, reject) => {
            this.committedResolve = resolve;
            this.committedReject = reject;
        });
        this.finished = new Promise(async (resolve, reject) => {
            this.finishedResolve = resolve;
            this.finishedReject = (reason) => {
                reject(reason);
                this.abortController.abort(reason);
            };
        });
        // All rejections are handled.
        this.committed.catch(() => { });
        this.finished.catch(() => { });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3Rlc3Rpbmcvc3JjL25hdmlnYXRpb24vZmFrZV9uYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILHdFQUF3RTtBQUN4RSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBRS9COzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQXdEekIsK0NBQStDO0lBQy9DLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELFlBQTZCLE1BQWMsRUFBRSxRQUF5QjtRQUF6QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBcEUzQzs7O1dBR0c7UUFDYyxlQUFVLEdBQWlDLEVBQUUsQ0FBQztRQUUvRDs7V0FFRztRQUNLLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUU5Qjs7V0FFRztRQUNLLGtCQUFhLEdBQXdDLFNBQVMsQ0FBQztRQUV2RTs7O1dBR0c7UUFDYyxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1FBRTlFOzs7V0FHRztRQUNLLGtCQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTFDOzs7V0FHRztRQUNLLDBCQUFxQixHQUFHLENBQUMsQ0FBQztRQUVsQzs7O1dBR0c7UUFDSywwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFF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QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gUHJldmVudHMgZGVsZXRpb24gb2YgYEV2ZW50YCBmcm9tIGBnbG9iYWxUaGlzYCBkdXJpbmcgbW9kdWxlIGxvYWRpbmcuXG5jb25zdCBFdmVudCA9IGdsb2JhbFRoaXMuRXZlbnQ7XG5cbi8qKlxuICogRmFrZSBpbXBsZW1lbnRhdGlvbiBvZiB1c2VyIGFnZW50IGhpc3RvcnkgYW5kIG5hdmlnYXRpb24gYmVoYXZpb3IuIFRoaXMgaXMgYVxuICogaGlnaC1maWRlbGl0eSBpbXBsZW1lbnRhdGlvbiBvZiBicm93c2VyIGJlaGF2aW9yIHRoYXQgYXR0ZW1wdHMgdG8gZW11bGF0ZVxuICogdGhpbmdzIGxpa2UgdHJhdmVyc2FsIGRlbGF5LlxuICovXG5leHBvcnQgY2xhc3MgRmFrZU5hdmlnYXRpb24gaW1wbGVtZW50cyBOYXZpZ2F0aW9uIHtcbiAgLyoqXG4gICAqIFRoZSBmYWtlIGltcGxlbWVudGF0aW9uIG9mIGFuIGVudHJpZXMgYXJyYXkuIE9ubHkgc2FtZS1kb2N1bWVudCBlbnRyaWVzXG4gICAqIGFsbG93ZWQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGVudHJpZXNBcnI6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5W10gPSBbXTtcblxuICAvKipcbiAgICogVGhlIGN1cnJlbnQgYWN0aXZlIGVudHJ5IGluZGV4IGludG8gYGVudHJpZXNBcnJgLlxuICAgKi9cbiAgcHJpdmF0ZSBjdXJyZW50RW50cnlJbmRleCA9IDA7XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IG5hdmlnYXRlIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBuYXZpZ2F0ZUV2ZW50OiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQSBNYXAgb2YgcGVuZGluZyB0cmF2ZXJzYWxzLCBzbyB0aGF0IHRyYXZlcnNhbHMgdG8gdGhlIHNhbWUgZW50cnkgY2FuIGJlXG4gICAqIHJlLXVzZWQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHRyYXZlcnNhbFF1ZXVlID0gbmV3IE1hcDxzdHJpbmcsIEludGVybmFsTmF2aWdhdGlvblJlc3VsdD4oKTtcblxuICAvKipcbiAgICogQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgcHJldmlvdXMgdHJhdmVyc2FscyBoYXZlIGZpbmlzaGVkLiBVc2VkIHRvXG4gICAqIHNpbXVsYXRlIHRoZSBjcm9zcy1wcm9jZXNzIGNvbW11bmljYXRpb24gbmVjZXNzYXJ5IGZvciB0cmF2ZXJzYWxzLlxuICAgKi9cbiAgcHJpdmF0ZSBuZXh0VHJhdmVyc2FsID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgLyoqXG4gICAqIEEgcHJvc3BlY3RpdmUgY3VycmVudCBhY3RpdmUgZW50cnkgaW5kZXgsIHdoaWNoIGluY2x1ZGVzIHVucmVzb2x2ZWRcbiAgICogdHJhdmVyc2Fscy4gVXNlZCBieSBgZ29gIHRvIGRldGVybWluZSB3aGVyZSBuYXZpZ2F0aW9ucyBhcmUgaW50ZW5kZWQgdG8gZ28uXG4gICAqL1xuICBwcml2YXRlIHByb3NwZWN0aXZlRW50cnlJbmRleCA9IDA7XG5cbiAgLyoqXG4gICAqIEEgdGVzdC1vbmx5IG9wdGlvbiB0byBtYWtlIHRyYXZlcnNhbHMgc3luY2hyb25vdXMsIHJhdGhlciB0aGFuIGVtdWxhdGVcbiAgICogY3Jvc3MtcHJvY2VzcyBjb21tdW5pY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBzeW5jaHJvbm91c1RyYXZlcnNhbHMgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0byBhbGxvdyBhIGNhbGwgdG8gc2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZy4gKi9cbiAgcHJpdmF0ZSBjYW5TZXRJbml0aWFsRW50cnkgPSB0cnVlO1xuXG4gIC8qKiBgRXZlbnRUYXJnZXRgIHRvIGRpc3BhdGNoIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBldmVudFRhcmdldDogRXZlbnRUYXJnZXQgPSB0aGlzLndpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAvKiogVGhlIG5leHQgdW5pcXVlIGlkIGZvciBjcmVhdGVkIGVudHJpZXMuIFJlcGxhY2UgcmVjcmVhdGVzIHRoaXMgaWQuICovXG4gIHByaXZhdGUgbmV4dElkID0gMDtcblxuICAvKiogVGhlIG5leHQgdW5pcXVlIGtleSBmb3IgY3JlYXRlZCBlbnRyaWVzLiBSZXBsYWNlIGluaGVyaXRzIHRoaXMgaWQuICovXG4gIHByaXZhdGUgbmV4dEtleSA9IDA7XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBmYWtlIGlzIGRpc3Bvc2VkLiAqL1xuICBwcml2YXRlIGRpc3Bvc2VkID0gZmFsc2U7XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uY3VycmVudEVudHJ5YC4gKi9cbiAgZ2V0IGN1cnJlbnRFbnRyeSgpOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc0Fyclt0aGlzLmN1cnJlbnRFbnRyeUluZGV4XTtcbiAgfVxuXG4gIGdldCBjYW5Hb0JhY2soKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEVudHJ5SW5kZXggPiAwO1xuICB9XG5cbiAgZ2V0IGNhbkdvRm9yd2FyZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RW50cnlJbmRleCA8IHRoaXMuZW50cmllc0Fyci5sZW5ndGggLSAxO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSB3aW5kb3c6IFdpbmRvdywgc3RhcnRVUkw6IGBodHRwJHtzdHJpbmd9YCkge1xuICAgIC8vIEZpcnN0IGVudHJ5LlxuICAgIHRoaXMuc2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZyhzdGFydFVSTCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaW5pdGlhbCBlbnRyeS5cbiAgICovXG4gIHByaXZhdGUgc2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZyhcbiAgICAgIHVybDogYGh0dHAke3N0cmluZ31gLFxuICAgICAgb3B0aW9uczoge2hpc3RvcnlTdGF0ZTogdW5rbm93bjsgc3RhdGU/OiB1bmtub3duO30gPSB7aGlzdG9yeVN0YXRlOiBudWxsfSxcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmNhblNldEluaXRpYWxFbnRyeSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdzZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nIGNhbiBvbmx5IGJlIGNhbGxlZCBiZWZvcmUgYW55ICcgK1xuICAgICAgICAgICAgICAnbmF2aWdhdGlvbiBoYXMgb2NjdXJyZWQnLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudEluaXRpYWxFbnRyeSA9IHRoaXMuZW50cmllc0FyclswXTtcbiAgICB0aGlzLmVudHJpZXNBcnJbMF0gPSBuZXcgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkoXG4gICAgICAgIG5ldyBVUkwodXJsKS50b1N0cmluZygpLFxuICAgICAgICB7XG4gICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAga2V5OiBjdXJyZW50SW5pdGlhbEVudHJ5Py5rZXkgPz8gU3RyaW5nKHRoaXMubmV4dEtleSsrKSxcbiAgICAgICAgICBpZDogY3VycmVudEluaXRpYWxFbnRyeT8uaWQgPz8gU3RyaW5nKHRoaXMubmV4dElkKyspLFxuICAgICAgICAgIHNhbWVEb2N1bWVudDogdHJ1ZSxcbiAgICAgICAgICBoaXN0b3J5U3RhdGU6IG9wdGlvbnM/Lmhpc3RvcnlTdGF0ZSxcbiAgICAgICAgICBzdGF0ZTogb3B0aW9ucy5zdGF0ZSxcbiAgICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciB0aGUgaW5pdGlhbCBlbnRyeSBpcyBzdGlsbCBlbGlnaWJsZSB0byBiZSBzZXQuICovXG4gIGNhblNldEluaXRpYWxFbnRyeUZvclRlc3RpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2FuU2V0SW5pdGlhbEVudHJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciB0byBlbXVsYXRlIHRyYXZlcnNhbHMgYXMgc3luY2hyb25vdXMgcmF0aGVyIHRoYW5cbiAgICogYXN5bmNocm9ub3VzLlxuICAgKi9cbiAgc2V0U3luY2hyb25vdXNUcmF2ZXJzYWxzRm9yVGVzdGluZyhzeW5jaHJvbm91c1RyYXZlcnNhbHM6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnN5bmNocm9ub3VzVHJhdmVyc2FscyA9IHN5bmNocm9ub3VzVHJhdmVyc2FscztcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmVudHJpZXMoKWAuICovXG4gIGVudHJpZXMoKTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc0Fyci5zbGljZSgpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24ubmF2aWdhdGUoKWAuICovXG4gIG5hdmlnYXRlKFxuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICBvcHRpb25zPzogTmF2aWdhdGlvbk5hdmlnYXRlT3B0aW9ucyxcbiAgICAgICk6IEZha2VOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBmcm9tVXJsID0gbmV3IFVSTCh0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcbiAgICBjb25zdCB0b1VybCA9IG5ldyBVUkwodXJsLCB0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcblxuICAgIGxldCBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG4gICAgaWYgKCFvcHRpb25zPy5oaXN0b3J5IHx8IG9wdGlvbnMuaGlzdG9yeSA9PT0gJ2F1dG8nKSB7XG4gICAgICAvLyBBdXRvIGRlZmF1bHRzIHRvIHB1c2gsIGJ1dCBpZiB0aGUgVVJMcyBhcmUgdGhlIHNhbWUsIGlzIGEgcmVwbGFjZS5cbiAgICAgIGlmIChmcm9tVXJsLnRvU3RyaW5nKCkgPT09IHRvVXJsLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGUgPSAncmVwbGFjZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZSA9ICdwdXNoJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmF2aWdhdGlvblR5cGUgPSBvcHRpb25zLmhpc3Rvcnk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCB0b1VybCk7XG5cbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgIHVybDogdG9VcmwudG9TdHJpbmcoKSxcbiAgICAgIHN0YXRlOiBvcHRpb25zPy5zdGF0ZSxcbiAgICAgIHNhbWVEb2N1bWVudDogaGFzaENoYW5nZSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogbnVsbCxcbiAgICB9KTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG5cbiAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgIG5hdmlnYXRpb25UeXBlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgbmF2aWdhdGUoKS5cbiAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgaGFzaENoYW5nZSxcbiAgICAgIGluZm86IG9wdGlvbnM/LmluZm8sXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0dGVkOiByZXN1bHQuY29tbWl0dGVkLFxuICAgICAgZmluaXNoZWQ6IHJlc3VsdC5maW5pc2hlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYGhpc3RvcnkucHVzaFN0YXRlKClgLiAqL1xuICBwdXNoU3RhdGUoZGF0YTogdW5rbm93biwgdGl0bGU6IHN0cmluZywgdXJsPzogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoT3JSZXBsYWNlU3RhdGUoJ3B1c2gnLCBkYXRhLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgpYC4gKi9cbiAgcmVwbGFjZVN0YXRlKGRhdGE6IHVua25vd24sIHRpdGxlOiBzdHJpbmcsIHVybD86IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHVzaE9yUmVwbGFjZVN0YXRlKCdyZXBsYWNlJywgZGF0YSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICBwcml2YXRlIHB1c2hPclJlcGxhY2VTdGF0ZShcbiAgICAgIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZyxcbiAgICAgIGRhdGE6IHVua25vd24sXG4gICAgICBfdGl0bGU6IHN0cmluZyxcbiAgICAgIHVybD86IHN0cmluZyxcbiAgICAgICk6IHZvaWQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgIGNvbnN0IHRvVXJsID0gdXJsID8gbmV3IFVSTCh1cmwsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpIDogZnJvbVVybDtcblxuICAgIGNvbnN0IGhhc2hDaGFuZ2UgPSBpc0hhc2hDaGFuZ2UoZnJvbVVybCwgdG9VcmwpO1xuXG4gICAgY29uc3QgZGVzdGluYXRpb24gPSBuZXcgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbih7XG4gICAgICB1cmw6IHRvVXJsLnRvU3RyaW5nKCksXG4gICAgICBzYW1lRG9jdW1lbnQ6IHRydWUsXG4gICAgICBoaXN0b3J5U3RhdGU6IGRhdGEsXG4gICAgfSk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuXG4gICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICBuYXZpZ2F0aW9uVHlwZSxcbiAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAvLyBBbHdheXMgZmFsc2UgZm9yIHB1c2hTdGF0ZSgpIG9yIHJlcGxhY2VTdGF0ZSgpLlxuICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICBoYXNoQ2hhbmdlLFxuICAgICAgc2tpcFBvcFN0YXRlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24udHJhdmVyc2VUbygpYC4gKi9cbiAgdHJhdmVyc2VUbyhrZXk6IHN0cmluZywgb3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5maW5kRW50cnkoa2V5KTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICBjb25zdCBkb21FeGNlcHRpb24gPSBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgICdJbnZhbGlkIGtleScsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb21taXR0ZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29uc3QgZmluaXNoZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29tbWl0dGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIGZpbmlzaGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAoZW50cnkgPT09IHRoaXMuY3VycmVudEVudHJ5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQ6IFByb21pc2UucmVzb2x2ZSh0aGlzLmN1cnJlbnRFbnRyeSksXG4gICAgICAgIGZpbmlzaGVkOiBQcm9taXNlLnJlc29sdmUodGhpcy5jdXJyZW50RW50cnkpLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMudHJhdmVyc2FsUXVldWUuaGFzKGVudHJ5LmtleSkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nUmVzdWx0ID0gdGhpcy50cmF2ZXJzYWxRdWV1ZS5nZXQoZW50cnkua2V5KSE7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQ6IGV4aXN0aW5nUmVzdWx0LmNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQ6IGV4aXN0aW5nUmVzdWx0LmZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIG5ldyBVUkwoZW50cnkudXJsISwgdGhpcy5jdXJyZW50RW50cnkudXJsISkpO1xuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgdXJsOiBlbnRyeS51cmwhLFxuICAgICAgc3RhdGU6IGVudHJ5LmdldFN0YXRlKCksXG4gICAgICBoaXN0b3J5U3RhdGU6IGVudHJ5LmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgICAga2V5OiBlbnRyeS5rZXksXG4gICAgICBpZDogZW50cnkuaWQsXG4gICAgICBpbmRleDogZW50cnkuaW5kZXgsXG4gICAgICBzYW1lRG9jdW1lbnQ6IGVudHJ5LnNhbWVEb2N1bWVudCxcbiAgICB9KTtcbiAgICB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCA9IGVudHJ5LmluZGV4O1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQoKTtcbiAgICB0aGlzLnRyYXZlcnNhbFF1ZXVlLnNldChlbnRyeS5rZXksIHJlc3VsdCk7XG4gICAgdGhpcy5ydW5UcmF2ZXJzYWwoKCkgPT4ge1xuICAgICAgdGhpcy50cmF2ZXJzYWxRdWV1ZS5kZWxldGUoZW50cnkua2V5KTtcbiAgICAgIHRoaXMudXNlckFnZW50TmF2aWdhdGUoZGVzdGluYXRpb24sIHJlc3VsdCwge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZTogJ3RyYXZlcnNlJyxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgY2FuSW50ZXJjZXB0OiB0cnVlLFxuICAgICAgICAvLyBBbHdheXMgZmFsc2UgZm9yIHRyYXZlcnNlVG8oKS5cbiAgICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICAgIGluZm86IG9wdGlvbnM/LmluZm8sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0dGVkOiByZXN1bHQuY29tbWl0dGVkLFxuICAgICAgZmluaXNoZWQ6IHJlc3VsdC5maW5pc2hlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uYmFjaygpYC4gKi9cbiAgYmFjayhvcHRpb25zPzogTmF2aWdhdGlvbk9wdGlvbnMpOiBGYWtlTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgaWYgKHRoaXMuY3VycmVudEVudHJ5SW5kZXggPT09IDApIHtcbiAgICAgIGNvbnN0IGRvbUV4Y2VwdGlvbiA9IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgJ0Nhbm5vdCBnbyBiYWNrJyxcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNvbW1pdHRlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb25zdCBmaW5pc2hlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb21taXR0ZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgZmluaXNoZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkLFxuICAgICAgICBmaW5pc2hlZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyW3RoaXMuY3VycmVudEVudHJ5SW5kZXggLSAxXTtcbiAgICByZXR1cm4gdGhpcy50cmF2ZXJzZVRvKGVudHJ5LmtleSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5mb3J3YXJkKClgLiAqL1xuICBmb3J3YXJkKG9wdGlvbnM/OiBOYXZpZ2F0aW9uT3B0aW9ucyk6IEZha2VOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICBpZiAodGhpcy5jdXJyZW50RW50cnlJbmRleCA9PT0gdGhpcy5lbnRyaWVzQXJyLmxlbmd0aCAtIDEpIHtcbiAgICAgIGNvbnN0IGRvbUV4Y2VwdGlvbiA9IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgJ0Nhbm5vdCBnbyBmb3J3YXJkJyxcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNvbW1pdHRlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb25zdCBmaW5pc2hlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb21taXR0ZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgZmluaXNoZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkLFxuICAgICAgICBmaW5pc2hlZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyW3RoaXMuY3VycmVudEVudHJ5SW5kZXggKyAxXTtcbiAgICByZXR1cm4gdGhpcy50cmF2ZXJzZVRvKGVudHJ5LmtleSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogRXF1aXZhbGVudCB0byBgaGlzdG9yeS5nbygpYC5cbiAgICogTm90ZSB0aGF0IHRoaXMgbWV0aG9kIGRvZXMgbm90IGFjdHVhbGx5IHdvcmsgcHJlY2lzZWx5IHRvIGhvdyBDaHJvbWVcbiAgICogZG9lcywgaW5zdGVhZCBjaG9vc2luZyBhIHNpbXBsZXIgbW9kZWwgd2l0aCBsZXNzIHVuZXhwZWN0ZWQgYmVoYXZpb3IuXG4gICAqIENocm9tZSBoYXMgYSBmZXcgZWRnZSBjYXNlIG9wdGltaXphdGlvbnMsIGZvciBpbnN0YW5jZSB3aXRoIHJlcGVhdGVkXG4gICAqIGBiYWNrKCk7IGZvcndhcmQoKWAgY2hhaW5zIGl0IGNvbGxhcHNlcyBjZXJ0YWluIHRyYXZlcnNhbHMuXG4gICAqL1xuICBnbyhkaXJlY3Rpb246IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldEluZGV4ID0gdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggKyBkaXJlY3Rpb247XG4gICAgaWYgKHRhcmdldEluZGV4ID49IHRoaXMuZW50cmllc0Fyci5sZW5ndGggfHwgdGFyZ2V0SW5kZXggPCAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gdGFyZ2V0SW5kZXg7XG4gICAgdGhpcy5ydW5UcmF2ZXJzYWwoKCkgPT4ge1xuICAgICAgLy8gQ2hlY2sgYWdhaW4gdGhhdCBkZXN0aW5hdGlvbiBpcyBpbiB0aGUgZW50cmllcyBhcnJheS5cbiAgICAgIGlmICh0YXJnZXRJbmRleCA+PSB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIHx8IHRhcmdldEluZGV4IDwgMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBmcm9tVXJsID0gbmV3IFVSTCh0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyW3RhcmdldEluZGV4XTtcbiAgICAgIGNvbnN0IGhhc2hDaGFuZ2UgPSBpc0hhc2hDaGFuZ2UoZnJvbVVybCwgbmV3IFVSTChlbnRyeS51cmwhLCB0aGlzLmN1cnJlbnRFbnRyeS51cmwhKSk7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgICAgdXJsOiBlbnRyeS51cmwhLFxuICAgICAgICBzdGF0ZTogZW50cnkuZ2V0U3RhdGUoKSxcbiAgICAgICAgaGlzdG9yeVN0YXRlOiBlbnRyeS5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgICAga2V5OiBlbnRyeS5rZXksXG4gICAgICAgIGlkOiBlbnRyeS5pZCxcbiAgICAgICAgaW5kZXg6IGVudHJ5LmluZGV4LFxuICAgICAgICBzYW1lRG9jdW1lbnQ6IGVudHJ5LnNhbWVEb2N1bWVudCxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuICAgICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlOiAndHJhdmVyc2UnLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgZ28oKS5cbiAgICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSdW5zIGEgdHJhdmVyc2FsIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHkgKi9cbiAgcHJpdmF0ZSBydW5UcmF2ZXJzYWwodHJhdmVyc2FsOiAoKSA9PiB2b2lkKSB7XG4gICAgaWYgKHRoaXMuc3luY2hyb25vdXNUcmF2ZXJzYWxzKSB7XG4gICAgICB0cmF2ZXJzYWwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBFYWNoIHRyYXZlcnNhbCBvY2N1cGllcyBhIHNpbmdsZSB0aW1lb3V0IHJlc29sdXRpb24uXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IFByb21pc2VzIGFkZGVkIHRvIGNvbW1pdCBhbmQgZmluaXNoIHNob3VsZCByZXNvbHZlXG4gICAgLy8gYmVmb3JlIHRoZSBuZXh0IHRyYXZlcnNhbC5cbiAgICB0aGlzLm5leHRUcmF2ZXJzYWwgPSB0aGlzLm5leHRUcmF2ZXJzYWwudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHRyYXZlcnNhbCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uYWRkRXZlbnRMaXN0ZW5lcigpYC4gKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIHR5cGU6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LFxuICAgICAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zfGJvb2xlYW4sXG4gICkge1xuICAgIHRoaXMuZXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5yZW1vdmVFdmVudExpc3RlbmVyKClgLiAqL1xuICByZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgICBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnN8Ym9vbGVhbixcbiAgKSB7XG4gICAgdGhpcy5ldmVudFRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmRpc3BhdGNoRXZlbnQoKWAgKi9cbiAgZGlzcGF0Y2hFdmVudChldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgcmVzb3VyY2VzLiAqL1xuICBkaXNwb3NlKCkge1xuICAgIC8vIFJlY3JlYXRlIGV2ZW50VGFyZ2V0IHRvIHJlbGVhc2UgY3VycmVudCBsaXN0ZW5lcnMuXG4gICAgLy8gYGRvY3VtZW50LmNyZWF0ZUVsZW1lbnRgIGJlY2F1c2UgTm9kZUpTIGBFdmVudFRhcmdldGAgaXMgaW5jb21wYXRpYmxlIHdpdGggRG9taW5vJ3MgYEV2ZW50YC5cbiAgICB0aGlzLmV2ZW50VGFyZ2V0ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kaXNwb3NlZCA9IHRydWU7XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIHRoaXMgZmFrZSBpcyBkaXNwb3NlZC4gKi9cbiAgaXNEaXNwb3NlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwb3NlZDtcbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiBmb3IgYWxsIG5hdmlnYXRpb25zIGFuZCB0cmF2ZXJzYWxzLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudE5hdmlnYXRlKFxuICAgICAgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24sXG4gICAgICByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCxcbiAgICAgIG9wdGlvbnM6IEludGVybmFsTmF2aWdhdGVPcHRpb25zLFxuICApIHtcbiAgICAvLyBUaGUgZmlyc3QgbmF2aWdhdGlvbiBzaG91bGQgZGlzYWxsb3cgYW55IGZ1dHVyZSBjYWxscyB0byBzZXQgdGhlIGluaXRpYWxcbiAgICAvLyBlbnRyeS5cbiAgICB0aGlzLmNhblNldEluaXRpYWxFbnRyeSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLm5hdmlnYXRlRXZlbnQpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVFdmVudC5jYW5jZWwoXG4gICAgICAgICAgbmV3IERPTUV4Y2VwdGlvbignTmF2aWdhdGlvbiB3YXMgYWJvcnRlZCcsICdBYm9ydEVycm9yJyksXG4gICAgICApO1xuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IG5hdmlnYXRlRXZlbnQgPSBjcmVhdGVGYWtlTmF2aWdhdGVFdmVudCh7XG4gICAgICBuYXZpZ2F0aW9uVHlwZTogb3B0aW9ucy5uYXZpZ2F0aW9uVHlwZSxcbiAgICAgIGNhbmNlbGFibGU6IG9wdGlvbnMuY2FuY2VsYWJsZSxcbiAgICAgIGNhbkludGVyY2VwdDogb3B0aW9ucy5jYW5JbnRlcmNlcHQsXG4gICAgICB1c2VySW5pdGlhdGVkOiBvcHRpb25zLnVzZXJJbml0aWF0ZWQsXG4gICAgICBoYXNoQ2hhbmdlOiBvcHRpb25zLmhhc2hDaGFuZ2UsXG4gICAgICBzaWduYWw6IHJlc3VsdC5zaWduYWwsXG4gICAgICBkZXN0aW5hdGlvbixcbiAgICAgIGluZm86IG9wdGlvbnMuaW5mbyxcbiAgICAgIHNhbWVEb2N1bWVudDogZGVzdGluYXRpb24uc2FtZURvY3VtZW50LFxuICAgICAgc2tpcFBvcFN0YXRlOiBvcHRpb25zLnNraXBQb3BTdGF0ZSxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHVzZXJBZ2VudENvbW1pdDogKCkgPT4ge1xuICAgICAgICB0aGlzLnVzZXJBZ2VudENvbW1pdCgpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMubmF2aWdhdGVFdmVudCA9IG5hdmlnYXRlRXZlbnQ7XG4gICAgdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KG5hdmlnYXRlRXZlbnQpO1xuICAgIG5hdmlnYXRlRXZlbnQuZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQoKTtcbiAgICBpZiAobmF2aWdhdGVFdmVudC5jb21taXRPcHRpb24gPT09ICdpbW1lZGlhdGUnKSB7XG4gICAgICBuYXZpZ2F0ZUV2ZW50LmNvbW1pdCgvKiBpbnRlcm5hbD0gKi8gdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEltcGxlbWVudGF0aW9uIHRvIGNvbW1pdCBhIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50Q29tbWl0KCkge1xuICAgIGlmICghdGhpcy5uYXZpZ2F0ZUV2ZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZyb20gPSB0aGlzLmN1cnJlbnRFbnRyeTtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudC5zYW1lRG9jdW1lbnQpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdDYW5ub3QgbmF2aWdhdGUgdG8gYSBub24tc2FtZS1kb2N1bWVudCBVUkwuJyk7XG4gICAgICB0aGlzLm5hdmlnYXRlRXZlbnQuY2FuY2VsKGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBpZiAodGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAncHVzaCcgfHxcbiAgICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAncmVwbGFjZScpIHtcbiAgICAgIHRoaXMudXNlckFnZW50UHVzaE9yUmVwbGFjZSh0aGlzLm5hdmlnYXRlRXZlbnQuZGVzdGluYXRpb24sIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGU6IHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAndHJhdmVyc2UnKSB7XG4gICAgICB0aGlzLnVzZXJBZ2VudFRyYXZlcnNlKHRoaXMubmF2aWdhdGVFdmVudC5kZXN0aW5hdGlvbik7XG4gICAgfVxuICAgIHRoaXMubmF2aWdhdGVFdmVudC51c2VyQWdlbnROYXZpZ2F0ZWQodGhpcy5jdXJyZW50RW50cnkpO1xuICAgIGNvbnN0IGN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50ID0gY3JlYXRlRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudChcbiAgICAgICAge2Zyb20sIG5hdmlnYXRpb25UeXBlOiB0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGV9LFxuICAgICk7XG4gICAgdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KGN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KTtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudC5za2lwUG9wU3RhdGUpIHtcbiAgICAgIGNvbnN0IHBvcFN0YXRlRXZlbnQgPSBjcmVhdGVQb3BTdGF0ZUV2ZW50KHtcbiAgICAgICAgc3RhdGU6IHRoaXMubmF2aWdhdGVFdmVudC5kZXN0aW5hdGlvbi5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy53aW5kb3cuZGlzcGF0Y2hFdmVudChwb3BTdGF0ZUV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gZm9yIGEgcHVzaCBvciByZXBsYWNlIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50UHVzaE9yUmVwbGFjZShcbiAgICAgIGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uLFxuICAgICAge25hdmlnYXRpb25UeXBlfToge25hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZ30sXG4gICkge1xuICAgIGlmIChuYXZpZ2F0aW9uVHlwZSA9PT0gJ3B1c2gnKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFbnRyeUluZGV4Kys7XG4gICAgICB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCA9IHRoaXMuY3VycmVudEVudHJ5SW5kZXg7XG4gICAgfVxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jdXJyZW50RW50cnlJbmRleDtcbiAgICBjb25zdCBrZXkgPSBuYXZpZ2F0aW9uVHlwZSA9PT0gJ3B1c2gnID8gU3RyaW5nKHRoaXMubmV4dEtleSsrKSA6IHRoaXMuY3VycmVudEVudHJ5LmtleTtcbiAgICBjb25zdCBlbnRyeSA9IG5ldyBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeShkZXN0aW5hdGlvbi51cmwsIHtcbiAgICAgIGlkOiBTdHJpbmcodGhpcy5uZXh0SWQrKyksXG4gICAgICBrZXksXG4gICAgICBpbmRleCxcbiAgICAgIHNhbWVEb2N1bWVudDogdHJ1ZSxcbiAgICAgIHN0YXRlOiBkZXN0aW5hdGlvbi5nZXRTdGF0ZSgpLFxuICAgICAgaGlzdG9yeVN0YXRlOiBkZXN0aW5hdGlvbi5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICB9KTtcbiAgICBpZiAobmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJykge1xuICAgICAgdGhpcy5lbnRyaWVzQXJyLnNwbGljZShpbmRleCwgSW5maW5pdHksIGVudHJ5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbnRyaWVzQXJyW2luZGV4XSA9IGVudHJ5O1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiBmb3IgYSB0cmF2ZXJzZSBuYXZpZ2F0aW9uLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudFRyYXZlcnNlKGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKSB7XG4gICAgdGhpcy5jdXJyZW50RW50cnlJbmRleCA9IGRlc3RpbmF0aW9uLmluZGV4O1xuICB9XG5cbiAgLyoqIFV0aWxpdHkgbWV0aG9kIGZvciBmaW5kaW5nIGVudHJpZXMgd2l0aCB0aGUgZ2l2ZW4gYGtleWAuICovXG4gIHByaXZhdGUgZmluZEVudHJ5KGtleTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmVudHJpZXNBcnIpIHtcbiAgICAgIGlmIChlbnRyeS5rZXkgPT09IGtleSkgcmV0dXJuIGVudHJ5O1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgc2V0IG9ubmF2aWdhdGUoX2hhbmRsZXI6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRlRXZlbnQpID0+IGFueSl8bnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGUoKTogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGVFdmVudCkgPT4gYW55KXxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbmN1cnJlbnRlbnRyeWNoYW5nZShfaGFuZGxlcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQpID0+IGFueSl8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25jdXJyZW50ZW50cnljaGFuZ2UoKTpcbiAgICAgICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCkgPT4gYW55KXxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbm5hdmlnYXRlc3VjY2VzcyhfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXZlbnQpID0+IGFueSl8bnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGVzdWNjZXNzKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpfG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc2V0IG9ubmF2aWdhdGVlcnJvcihfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXJyb3JFdmVudCkgPT4gYW55KXxudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25uYXZpZ2F0ZWVycm9yKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEVycm9yRXZlbnQpID0+IGFueSl8bnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgdHJhbnNpdGlvbigpOiBOYXZpZ2F0aW9uVHJhbnNpdGlvbnxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHVwZGF0ZUN1cnJlbnRFbnRyeShfb3B0aW9uczogTmF2aWdhdGlvblVwZGF0ZUN1cnJlbnRFbnRyeU9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlbG9hZChfb3B0aW9ucz86IE5hdmlnYXRpb25SZWxvYWRPcHRpb25zKTogTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgdGhlIGBOYXZpZ2F0aW9uUmVzdWx0YCBpbnRlcmZhY2Ugd2l0aFxuICogYEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5YC5cbiAqL1xuaW50ZXJmYWNlIEZha2VOYXZpZ2F0aW9uUmVzdWx0IGV4dGVuZHMgTmF2aWdhdGlvblJlc3VsdCB7XG4gIHJlYWRvbmx5IGNvbW1pdHRlZDogUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT47XG4gIHJlYWRvbmx5IGZpbmlzaGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5Pjtcbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25IaXN0b3J5RW50cnlgLlxuICovXG5leHBvcnQgY2xhc3MgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkgaW1wbGVtZW50cyBOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5IHtcbiAgcmVhZG9ubHkgc2FtZURvY3VtZW50O1xuXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGtleTogc3RyaW5nO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlOiB1bmtub3duO1xuICBwcml2YXRlIHJlYWRvbmx5IGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gIG9uZGlzcG9zZTogKCh0aGlzOiBOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5LCBldjogRXZlbnQpID0+IGFueSl8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSB1cmw6IHN0cmluZ3xudWxsLFxuICAgICAge1xuICAgICAgICBpZCxcbiAgICAgICAga2V5LFxuICAgICAgICBpbmRleCxcbiAgICAgICAgc2FtZURvY3VtZW50LFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgaGlzdG9yeVN0YXRlLFxuICAgICAgfToge1xuICAgICAgICBpZDogc3RyaW5nOyBrZXk6IHN0cmluZzsgaW5kZXg6IG51bWJlcjsgc2FtZURvY3VtZW50OiBib29sZWFuOyBoaXN0b3J5U3RhdGU6IHVua25vd247XG4gICAgICAgIHN0YXRlPzogdW5rbm93bjtcbiAgICAgIH0sXG4gICkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5zYW1lRG9jdW1lbnQgPSBzYW1lRG9jdW1lbnQ7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuaGlzdG9yeVN0YXRlID0gaGlzdG9yeVN0YXRlO1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgLy8gQnVkZ2V0IGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUpKSA6IHRoaXMuc3RhdGU7XG4gIH1cblxuICBnZXRIaXN0b3J5U3RhdGUoKTogdW5rbm93biB7XG4gICAgLy8gQnVkZ2V0IGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeVN0YXRlID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlTdGF0ZSkpIDogdGhpcy5oaXN0b3J5U3RhdGU7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnN8Ym9vbGVhbixcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgICBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnN8Ym9vbGVhbixcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBkaXNwYXRjaEV2ZW50KGV2ZW50OiBFdmVudCk6IGJvb2xlYW4ge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbi8qKiBgTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnNgIHdpdGggZXhwZXJpbWVudGFsIGNvbW1pdCBvcHRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIEV4cGVyaW1lbnRhbE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zIGV4dGVuZHMgTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMge1xuICBjb21taXQ/OiAnaW1tZWRpYXRlJ3wnYWZ0ZXItdHJhbnNpdGlvbic7XG59XG5cbi8qKiBgTmF2aWdhdGVFdmVudGAgd2l0aCBleHBlcmltZW50YWwgY29tbWl0IGZ1bmN0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBlcmltZW50YWxOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgTmF2aWdhdGVFdmVudCB7XG4gIGludGVyY2VwdChvcHRpb25zPzogRXhwZXJpbWVudGFsTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMpOiB2b2lkO1xuXG4gIGNvbW1pdCgpOiB2b2lkO1xufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGVFdmVudGAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFrZU5hdmlnYXRlRXZlbnQgZXh0ZW5kcyBFeHBlcmltZW50YWxOYXZpZ2F0ZUV2ZW50IHtcbiAgcmVhZG9ubHkgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb247XG59XG5cbmludGVyZmFjZSBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgRmFrZU5hdmlnYXRlRXZlbnQge1xuICByZWFkb25seSBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IHNraXBQb3BTdGF0ZT86IGJvb2xlYW47XG4gIHJlYWRvbmx5IGNvbW1pdE9wdGlvbjogJ2FmdGVyLXRyYW5zaXRpb24nfCdpbW1lZGlhdGUnO1xuICByZWFkb25seSByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdDtcblxuICBjb21taXQoaW50ZXJuYWw/OiBib29sZWFuKTogdm9pZDtcbiAgY2FuY2VsKHJlYXNvbjogRXJyb3IpOiB2b2lkO1xuICBkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCgpOiB2b2lkO1xuICB1c2VyQWdlbnROYXZpZ2F0ZWQoZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KTogdm9pZDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRlRXZlbnRgLiBUaGlzIGlzIG5vdCBhIGNsYXNzIGJlY2F1c2UgRVM1XG4gKiB0cmFuc3BpbGVkIEphdmFTY3JpcHQgY2Fubm90IGV4dGVuZCBuYXRpdmUgRXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZha2VOYXZpZ2F0ZUV2ZW50KHtcbiAgY2FuY2VsYWJsZSxcbiAgY2FuSW50ZXJjZXB0LFxuICB1c2VySW5pdGlhdGVkLFxuICBoYXNoQ2hhbmdlLFxuICBuYXZpZ2F0aW9uVHlwZSxcbiAgc2lnbmFsLFxuICBkZXN0aW5hdGlvbixcbiAgaW5mbyxcbiAgc2FtZURvY3VtZW50LFxuICBza2lwUG9wU3RhdGUsXG4gIHJlc3VsdCxcbiAgdXNlckFnZW50Q29tbWl0LFxufToge1xuICBjYW5jZWxhYmxlOiBib29sZWFuOyBjYW5JbnRlcmNlcHQ6IGJvb2xlYW47IHVzZXJJbml0aWF0ZWQ6IGJvb2xlYW47IGhhc2hDaGFuZ2U6IGJvb2xlYW47XG4gIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbDtcbiAgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb247XG4gIGluZm86IHVua25vd247XG4gIHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgc2tpcFBvcFN0YXRlPzogYm9vbGVhbjsgcmVzdWx0OiBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQ7IHVzZXJBZ2VudENvbW1pdDogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ25hdmlnYXRlJywge2J1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlfSkgYXMge1xuICAgIC1yZWFkb25seVtQIGluIGtleW9mIEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnRdOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50W1BdO1xuICB9O1xuICBldmVudC5jYW5JbnRlcmNlcHQgPSBjYW5JbnRlcmNlcHQ7XG4gIGV2ZW50LnVzZXJJbml0aWF0ZWQgPSB1c2VySW5pdGlhdGVkO1xuICBldmVudC5oYXNoQ2hhbmdlID0gaGFzaENoYW5nZTtcbiAgZXZlbnQubmF2aWdhdGlvblR5cGUgPSBuYXZpZ2F0aW9uVHlwZTtcbiAgZXZlbnQuc2lnbmFsID0gc2lnbmFsO1xuICBldmVudC5kZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uO1xuICBldmVudC5pbmZvID0gaW5mbztcbiAgZXZlbnQuZG93bmxvYWRSZXF1ZXN0ID0gbnVsbDtcbiAgZXZlbnQuZm9ybURhdGEgPSBudWxsO1xuXG4gIGV2ZW50LnNhbWVEb2N1bWVudCA9IHNhbWVEb2N1bWVudDtcbiAgZXZlbnQuc2tpcFBvcFN0YXRlID0gc2tpcFBvcFN0YXRlO1xuICBldmVudC5jb21taXRPcHRpb24gPSAnaW1tZWRpYXRlJztcblxuICBsZXQgaGFuZGxlckZpbmlzaGVkOiBQcm9taXNlPHZvaWQ+fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgbGV0IGludGVyY2VwdENhbGxlZCA9IGZhbHNlO1xuICBsZXQgZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQgPSBmYWxzZTtcbiAgbGV0IGNvbW1pdENhbGxlZCA9IGZhbHNlO1xuXG4gIGV2ZW50LmludGVyY2VwdCA9IGZ1bmN0aW9uKFxuICAgICAgdGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCxcbiAgICAgIG9wdGlvbnM/OiBFeHBlcmltZW50YWxOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyxcbiAgICAgICk6IHZvaWQge1xuICAgIGludGVyY2VwdENhbGxlZCA9IHRydWU7XG4gICAgZXZlbnQuc2FtZURvY3VtZW50ID0gdHJ1ZTtcbiAgICBjb25zdCBoYW5kbGVyID0gb3B0aW9ucz8uaGFuZGxlcjtcbiAgICBpZiAoaGFuZGxlcikge1xuICAgICAgaGFuZGxlckZpbmlzaGVkID0gaGFuZGxlcigpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uY29tbWl0KSB7XG4gICAgICBldmVudC5jb21taXRPcHRpb24gPSBvcHRpb25zLmNvbW1pdDtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LmZvY3VzUmVzZXQgIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zPy5zY3JvbGwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gICAgfVxuICB9O1xuXG4gIGV2ZW50LnNjcm9sbCA9IGZ1bmN0aW9uKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfTtcblxuICBldmVudC5jb21taXQgPSBmdW5jdGlvbih0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LCBpbnRlcm5hbCA9IGZhbHNlKSB7XG4gICAgaWYgKCFpbnRlcm5hbCAmJiAhaW50ZXJjZXB0Q2FsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgIGBGYWlsZWQgdG8gZXhlY3V0ZSAnY29tbWl0JyBvbiAnTmF2aWdhdGVFdmVudCc6IGludGVyY2VwdCgpIG11c3QgYmUgYCArXG4gICAgICAgICAgICAgIGBjYWxsZWQgYmVmb3JlIGNvbW1pdCgpLmAsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgYEZhaWxlZCB0byBleGVjdXRlICdjb21taXQnIG9uICdOYXZpZ2F0ZUV2ZW50JzogY29tbWl0KCkgbWF5IG5vdCBiZSBgICtcbiAgICAgICAgICAgICAgYGNhbGxlZCBkdXJpbmcgZXZlbnQgZGlzcGF0Y2guYCxcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGNvbW1pdENhbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ2NvbW1pdCcgb24gJ05hdmlnYXRlRXZlbnQnOiBjb21taXQoKSBhbHJlYWR5IGAgK1xuICAgICAgICAgICAgICBgY2FsbGVkLmAsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbW1pdENhbGxlZCA9IHRydWU7XG5cbiAgICB1c2VyQWdlbnRDb21taXQoKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBvbmx5LlxuICBldmVudC5jYW5jZWwgPSBmdW5jdGlvbih0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LCByZWFzb246IEVycm9yKSB7XG4gICAgcmVzdWx0LmNvbW1pdHRlZFJlamVjdChyZWFzb24pO1xuICAgIHJlc3VsdC5maW5pc2hlZFJlamVjdChyZWFzb24pO1xuICB9O1xuXG4gIC8vIEludGVybmFsIG9ubHkuXG4gIGV2ZW50LmRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50ID0gZnVuY3Rpb24odGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCkge1xuICAgIGRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50ID0gdHJ1ZTtcbiAgICBpZiAoZXZlbnQuY29tbWl0T3B0aW9uID09PSAnYWZ0ZXItdHJhbnNpdGlvbicpIHtcbiAgICAgIC8vIElmIGhhbmRsZXIgZmluaXNoZXMgYmVmb3JlIGNvbW1pdCwgY2FsbCBjb21taXQuXG4gICAgICBoYW5kbGVyRmluaXNoZWQ/LnRoZW4oXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjb21taXRDYWxsZWQpIHtcbiAgICAgICAgICAgICAgZXZlbnQuY29tbWl0KC8qIGludGVybmFsICovIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgKCkgPT4ge30sXG4gICAgICApO1xuICAgIH1cbiAgICBQcm9taXNlLmFsbChbcmVzdWx0LmNvbW1pdHRlZCwgaGFuZGxlckZpbmlzaGVkXSlcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoW2VudHJ5XSkgPT4ge1xuICAgICAgICAgICAgICByZXN1bHQuZmluaXNoZWRSZXNvbHZlKGVudHJ5KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgIHJlc3VsdC5maW5pc2hlZFJlamVjdChyZWFzb24pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBvbmx5LlxuICBldmVudC51c2VyQWdlbnROYXZpZ2F0ZWQgPSBmdW5jdGlvbihcbiAgICAgIHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsXG4gICAgICBlbnRyeTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnksXG4gICkge1xuICAgIHJlc3VsdC5jb21taXR0ZWRSZXNvbHZlKGVudHJ5KTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnQgYXMgSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudDtcbn1cblxuLyoqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50YC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCBleHRlbmRzIE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCB7XG4gIHJlYWRvbmx5IGZyb206IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZWAuIFRoaXMgZG9lcyBub3QgdXNlXG4gKiBhIGNsYXNzIGJlY2F1c2UgRVM1IHRyYW5zcGlsZWQgSmF2YVNjcmlwdCBjYW5ub3QgZXh0ZW5kIG5hdGl2ZSBFdmVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCh7XG4gIGZyb20sXG4gIG5hdmlnYXRpb25UeXBlLFxufToge2Zyb206IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5OyBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7fSkge1xuICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnY3VycmVudGVudHJ5Y2hhbmdlJywge1xuICAgICAgICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KSBhcyB7XG4gICAgLXJlYWRvbmx5W1AgaW4ga2V5b2YgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50XTogTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50W1BdO1xuICB9O1xuICBldmVudC5mcm9tID0gZnJvbTtcbiAgZXZlbnQubmF2aWdhdGlvblR5cGUgPSBuYXZpZ2F0aW9uVHlwZTtcbiAgcmV0dXJuIGV2ZW50IGFzIEZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBlcXVpdmFsZW50IG9mIGBQb3BTdGF0ZUV2ZW50YC4gVGhpcyBkb2VzIG5vdCB1c2UgYSBjbGFzc1xuICogYmVjYXVzZSBFUzUgdHJhbnNwaWxlZCBKYXZhU2NyaXB0IGNhbm5vdCBleHRlbmQgbmF0aXZlIEV2ZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVQb3BTdGF0ZUV2ZW50KHtzdGF0ZX06IHtzdGF0ZTogdW5rbm93bn0pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ3BvcHN0YXRlJywge1xuICAgICAgICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KSBhcyB7LXJlYWRvbmx5W1AgaW4ga2V5b2YgUG9wU3RhdGVFdmVudF06IFBvcFN0YXRlRXZlbnRbUF19O1xuICBldmVudC5zdGF0ZSA9IHN0YXRlO1xuICByZXR1cm4gZXZlbnQgYXMgUG9wU3RhdGVFdmVudDtcbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25EZXN0aW5hdGlvbmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uIGltcGxlbWVudHMgTmF2aWdhdGlvbkRlc3RpbmF0aW9uIHtcbiAgcmVhZG9ubHkgdXJsOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgcmVhZG9ubHkga2V5OiBzdHJpbmd8bnVsbDtcbiAgcmVhZG9ubHkgaWQ6IHN0cmluZ3xudWxsO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhdGU/OiB1bmtub3duO1xuICBwcml2YXRlIHJlYWRvbmx5IGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdXJsLFxuICAgIHNhbWVEb2N1bWVudCxcbiAgICBoaXN0b3J5U3RhdGUsXG4gICAgc3RhdGUsXG4gICAga2V5ID0gbnVsbCxcbiAgICBpZCA9IG51bGwsXG4gICAgaW5kZXggPSAtMSxcbiAgfToge1xuICAgIHVybDogc3RyaW5nOyBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47IGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcbiAgICBzdGF0ZT86IHVua25vd247XG4gICAga2V5Pzogc3RyaW5nIHwgbnVsbDtcbiAgICBpZD86IHN0cmluZyB8IG51bGw7XG4gICAgaW5kZXg/OiBudW1iZXI7XG4gIH0pIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLnNhbWVEb2N1bWVudCA9IHNhbWVEb2N1bWVudDtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5oaXN0b3J5U3RhdGUgPSBoaXN0b3J5U3RhdGU7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICB9XG5cbiAgZ2V0SGlzdG9yeVN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnlTdGF0ZTtcbiAgfVxufVxuXG4vKiogVXRpbGl0eSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gVXJsTGlrZSBoYXZlIHRoZSBzYW1lIGhhc2guICovXG5mdW5jdGlvbiBpc0hhc2hDaGFuZ2UoZnJvbTogVVJMLCB0bzogVVJMKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgICB0by5oYXNoICE9PSBmcm9tLmhhc2ggJiYgdG8uaG9zdG5hbWUgPT09IGZyb20uaG9zdG5hbWUgJiYgdG8ucGF0aG5hbWUgPT09IGZyb20ucGF0aG5hbWUgJiZcbiAgICAgIHRvLnNlYXJjaCA9PT0gZnJvbS5zZWFyY2gpO1xufVxuXG4vKiogSW50ZXJuYWwgdXRpbGl0eSBjbGFzcyBmb3IgcmVwcmVzZW50aW5nIHRoZSByZXN1bHQgb2YgYSBuYXZpZ2F0aW9uLiAgKi9cbmNsYXNzIEludGVybmFsTmF2aWdhdGlvblJlc3VsdCB7XG4gIGNvbW1pdHRlZFJlc29sdmUhOiAoZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KSA9PiB2b2lkO1xuICBjb21taXR0ZWRSZWplY3QhOiAocmVhc29uOiBFcnJvcikgPT4gdm9pZDtcbiAgZmluaXNoZWRSZXNvbHZlITogKGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSkgPT4gdm9pZDtcbiAgZmluaXNoZWRSZWplY3QhOiAocmVhc29uOiBFcnJvcikgPT4gdm9pZDtcbiAgcmVhZG9ubHkgY29tbWl0dGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PjtcbiAgcmVhZG9ubHkgZmluaXNoZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xuICBnZXQgc2lnbmFsKCk6IEFib3J0U2lnbmFsIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICB9XG4gIHByaXZhdGUgcmVhZG9ubHkgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29tbWl0dGVkID0gbmV3IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+KFxuICAgICAgICAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21taXR0ZWRSZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICB0aGlzLmNvbW1pdHRlZFJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSxcbiAgICApO1xuXG4gICAgdGhpcy5maW5pc2hlZCA9IG5ldyBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PihcbiAgICAgICAgYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHRoaXMuZmluaXNoZWRSZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICB0aGlzLmZpbmlzaGVkUmVqZWN0ID0gKHJlYXNvbjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgICAgICAgdGhpcy5hYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICk7XG4gICAgLy8gQWxsIHJlamVjdGlvbnMgYXJlIGhhbmRsZWQuXG4gICAgdGhpcy5jb21taXR0ZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHRoaXMuZmluaXNoZWQuY2F0Y2goKCkgPT4ge30pO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBvcHRpb25zIGZvciBwZXJmb3JtaW5nIGEgbmF2aWdhdGUuICovXG5pbnRlcmZhY2UgSW50ZXJuYWxOYXZpZ2F0ZU9wdGlvbnMge1xuICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG4gIGNhbmNlbGFibGU6IGJvb2xlYW47XG4gIGNhbkludGVyY2VwdDogYm9vbGVhbjtcbiAgdXNlckluaXRpYXRlZDogYm9vbGVhbjtcbiAgaGFzaENoYW5nZTogYm9vbGVhbjtcbiAgaW5mbz86IHVua25vd247XG4gIHNraXBQb3BTdGF0ZT86IGJvb2xlYW47XG59XG4iXX0=