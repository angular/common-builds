/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3Rlc3Rpbmcvc3JjL25hdmlnYXRpb24vZmFrZV9uYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlIOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQXdEekIsK0NBQStDO0lBQy9DLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELFlBQTZCLE1BQWMsRUFBRSxRQUF5QjtRQUF6QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBcEUzQzs7O1dBR0c7UUFDYyxlQUFVLEdBQWlDLEVBQUUsQ0FBQztRQUUvRDs7V0FFRztRQUNLLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUU5Qjs7V0FFRztRQUNLLGtCQUFhLEdBQXdDLFNBQVMsQ0FBQztRQUV2RTs7O1dBR0c7UUFDYyxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1FBRTlFOzs7V0FHRztRQUNLLGtCQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTFDOzs7V0FHRztRQUNLLDBCQUFxQixHQUFHLENBQUMsQ0FBQztRQUVsQzs7O1dBR0c7UUFDSywwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFFdEMsNERBQTREO1FBQ3BELHVCQUFrQixHQUFHLElBQUksQ0FBQztRQUVsQyx3Q0FBd0M7UUFD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QUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOYXZpZ2F0ZUV2ZW50LCBOYXZpZ2F0aW9uLCBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQsIE5hdmlnYXRpb25EZXN0aW5hdGlvbiwgTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSwgTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMsIE5hdmlnYXRpb25OYXZpZ2F0ZU9wdGlvbnMsIE5hdmlnYXRpb25PcHRpb25zLCBOYXZpZ2F0aW9uUmVsb2FkT3B0aW9ucywgTmF2aWdhdGlvblJlc3VsdCwgTmF2aWdhdGlvblRyYW5zaXRpb24sIE5hdmlnYXRpb25UeXBlU3RyaW5nLCBOYXZpZ2F0aW9uVXBkYXRlQ3VycmVudEVudHJ5T3B0aW9uc30gZnJvbSAnLi9uYXZpZ2F0aW9uX3R5cGVzJztcblxuLyoqXG4gKiBGYWtlIGltcGxlbWVudGF0aW9uIG9mIHVzZXIgYWdlbnQgaGlzdG9yeSBhbmQgbmF2aWdhdGlvbiBiZWhhdmlvci4gVGhpcyBpcyBhXG4gKiBoaWdoLWZpZGVsaXR5IGltcGxlbWVudGF0aW9uIG9mIGJyb3dzZXIgYmVoYXZpb3IgdGhhdCBhdHRlbXB0cyB0byBlbXVsYXRlXG4gKiB0aGluZ3MgbGlrZSB0cmF2ZXJzYWwgZGVsYXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYWtlTmF2aWdhdGlvbiBpbXBsZW1lbnRzIE5hdmlnYXRpb24ge1xuICAvKipcbiAgICogVGhlIGZha2UgaW1wbGVtZW50YXRpb24gb2YgYW4gZW50cmllcyBhcnJheS4gT25seSBzYW1lLWRvY3VtZW50IGVudHJpZXNcbiAgICogYWxsb3dlZC5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZW50cmllc0FycjogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnlbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBhY3RpdmUgZW50cnkgaW5kZXggaW50byBgZW50cmllc0FycmAuXG4gICAqL1xuICBwcml2YXRlIGN1cnJlbnRFbnRyeUluZGV4ID0gMDtcblxuICAvKipcbiAgICogVGhlIGN1cnJlbnQgbmF2aWdhdGUgZXZlbnQuXG4gICAqL1xuICBwcml2YXRlIG5hdmlnYXRlRXZlbnQ6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnR8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBBIE1hcCBvZiBwZW5kaW5nIHRyYXZlcnNhbHMsIHNvIHRoYXQgdHJhdmVyc2FscyB0byB0aGUgc2FtZSBlbnRyeSBjYW4gYmVcbiAgICogcmUtdXNlZC5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgdHJhdmVyc2FsUXVldWUgPSBuZXcgTWFwPHN0cmluZywgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0PigpO1xuXG4gIC8qKlxuICAgKiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBwcmV2aW91cyB0cmF2ZXJzYWxzIGhhdmUgZmluaXNoZWQuIFVzZWQgdG9cbiAgICogc2ltdWxhdGUgdGhlIGNyb3NzLXByb2Nlc3MgY29tbXVuaWNhdGlvbiBuZWNlc3NhcnkgZm9yIHRyYXZlcnNhbHMuXG4gICAqL1xuICBwcml2YXRlIG5leHRUcmF2ZXJzYWwgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICAvKipcbiAgICogQSBwcm9zcGVjdGl2ZSBjdXJyZW50IGFjdGl2ZSBlbnRyeSBpbmRleCwgd2hpY2ggaW5jbHVkZXMgdW5yZXNvbHZlZFxuICAgKiB0cmF2ZXJzYWxzLiBVc2VkIGJ5IGBnb2AgdG8gZGV0ZXJtaW5lIHdoZXJlIG5hdmlnYXRpb25zIGFyZSBpbnRlbmRlZCB0byBnby5cbiAgICovXG4gIHByaXZhdGUgcHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gMDtcblxuICAvKipcbiAgICogQSB0ZXN0LW9ubHkgb3B0aW9uIHRvIG1ha2UgdHJhdmVyc2FscyBzeW5jaHJvbm91cywgcmF0aGVyIHRoYW4gZW11bGF0ZVxuICAgKiBjcm9zcy1wcm9jZXNzIGNvbW11bmljYXRpb24uXG4gICAqL1xuICBwcml2YXRlIHN5bmNocm9ub3VzVHJhdmVyc2FscyA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRvIGFsbG93IGEgY2FsbCB0byBzZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nLiAqL1xuICBwcml2YXRlIGNhblNldEluaXRpYWxFbnRyeSA9IHRydWU7XG5cbiAgLyoqIGBFdmVudFRhcmdldGAgdG8gZGlzcGF0Y2ggZXZlbnRzLiAqL1xuICBwcml2YXRlIGV2ZW50VGFyZ2V0OiBFdmVudFRhcmdldCA9IHRoaXMud2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gIC8qKiBUaGUgbmV4dCB1bmlxdWUgaWQgZm9yIGNyZWF0ZWQgZW50cmllcy4gUmVwbGFjZSByZWNyZWF0ZXMgdGhpcyBpZC4gKi9cbiAgcHJpdmF0ZSBuZXh0SWQgPSAwO1xuXG4gIC8qKiBUaGUgbmV4dCB1bmlxdWUga2V5IGZvciBjcmVhdGVkIGVudHJpZXMuIFJlcGxhY2UgaW5oZXJpdHMgdGhpcyBpZC4gKi9cbiAgcHJpdmF0ZSBuZXh0S2V5ID0gMDtcblxuICAvKiogV2hldGhlciB0aGlzIGZha2UgaXMgZGlzcG9zZWQuICovXG4gIHByaXZhdGUgZGlzcG9zZWQgPSBmYWxzZTtcblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5jdXJyZW50RW50cnlgLiAqL1xuICBnZXQgY3VycmVudEVudHJ5KCk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5IHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzQXJyW3RoaXMuY3VycmVudEVudHJ5SW5kZXhdO1xuICB9XG5cbiAgZ2V0IGNhbkdvQmFjaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RW50cnlJbmRleCA+IDA7XG4gIH1cblxuICBnZXQgY2FuR29Gb3J3YXJkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRFbnRyeUluZGV4IDwgdGhpcy5lbnRyaWVzQXJyLmxlbmd0aCAtIDE7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHdpbmRvdzogV2luZG93LCBzdGFydFVSTDogYGh0dHAke3N0cmluZ31gKSB7XG4gICAgLy8gRmlyc3QgZW50cnkuXG4gICAgdGhpcy5zZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nKHN0YXJ0VVJMKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbml0aWFsIGVudHJ5LlxuICAgKi9cbiAgcHJpdmF0ZSBzZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nKFxuICAgICAgdXJsOiBgaHR0cCR7c3RyaW5nfWAsXG4gICAgICBvcHRpb25zOiB7aGlzdG9yeVN0YXRlOiB1bmtub3duOyBzdGF0ZT86IHVua25vd247fSA9IHtoaXN0b3J5U3RhdGU6IG51bGx9LFxuICApIHtcbiAgICBpZiAoIXRoaXMuY2FuU2V0SW5pdGlhbEVudHJ5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ3NldEluaXRpYWxFbnRyeUZvclRlc3RpbmcgY2FuIG9ubHkgYmUgY2FsbGVkIGJlZm9yZSBhbnkgJyArXG4gICAgICAgICAgICAgICduYXZpZ2F0aW9uIGhhcyBvY2N1cnJlZCcsXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50SW5pdGlhbEVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyWzBdO1xuICAgIHRoaXMuZW50cmllc0FyclswXSA9IG5ldyBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeShcbiAgICAgICAgbmV3IFVSTCh1cmwpLnRvU3RyaW5nKCksXG4gICAgICAgIHtcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICBrZXk6IGN1cnJlbnRJbml0aWFsRW50cnk/LmtleSA/PyBTdHJpbmcodGhpcy5uZXh0S2V5KyspLFxuICAgICAgICAgIGlkOiBjdXJyZW50SW5pdGlhbEVudHJ5Py5pZCA/PyBTdHJpbmcodGhpcy5uZXh0SWQrKyksXG4gICAgICAgICAgc2FtZURvY3VtZW50OiB0cnVlLFxuICAgICAgICAgIGhpc3RvcnlTdGF0ZTogb3B0aW9ucz8uaGlzdG9yeVN0YXRlLFxuICAgICAgICAgIHN0YXRlOiBvcHRpb25zLnN0YXRlLFxuICAgICAgICB9LFxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIHRoZSBpbml0aWFsIGVudHJ5IGlzIHN0aWxsIGVsaWdpYmxlIHRvIGJlIHNldC4gKi9cbiAgY2FuU2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYW5TZXRJbml0aWFsRW50cnk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRvIGVtdWxhdGUgdHJhdmVyc2FscyBhcyBzeW5jaHJvbm91cyByYXRoZXIgdGhhblxuICAgKiBhc3luY2hyb25vdXMuXG4gICAqL1xuICBzZXRTeW5jaHJvbm91c1RyYXZlcnNhbHNGb3JUZXN0aW5nKHN5bmNocm9ub3VzVHJhdmVyc2FsczogYm9vbGVhbikge1xuICAgIHRoaXMuc3luY2hyb25vdXNUcmF2ZXJzYWxzID0gc3luY2hyb25vdXNUcmF2ZXJzYWxzO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uZW50cmllcygpYC4gKi9cbiAgZW50cmllcygpOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeVtdIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzQXJyLnNsaWNlKCk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5uYXZpZ2F0ZSgpYC4gKi9cbiAgbmF2aWdhdGUoXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIG9wdGlvbnM/OiBOYXZpZ2F0aW9uTmF2aWdhdGVPcHRpb25zLFxuICAgICAgKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgIGNvbnN0IHRvVXJsID0gbmV3IFVSTCh1cmwsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuXG4gICAgbGV0IG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbiAgICBpZiAoIW9wdGlvbnM/Lmhpc3RvcnkgfHwgb3B0aW9ucy5oaXN0b3J5ID09PSAnYXV0bycpIHtcbiAgICAgIC8vIEF1dG8gZGVmYXVsdHMgdG8gcHVzaCwgYnV0IGlmIHRoZSBVUkxzIGFyZSB0aGUgc2FtZSwgaXMgYSByZXBsYWNlLlxuICAgICAgaWYgKGZyb21VcmwudG9TdHJpbmcoKSA9PT0gdG9VcmwudG9TdHJpbmcoKSkge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZSA9ICdyZXBsYWNlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlID0gJ3B1c2gnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuYXZpZ2F0aW9uVHlwZSA9IG9wdGlvbnMuaGlzdG9yeTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIHRvVXJsKTtcblxuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgdXJsOiB0b1VybC50b1N0cmluZygpLFxuICAgICAgc3RhdGU6IG9wdGlvbnM/LnN0YXRlLFxuICAgICAgc2FtZURvY3VtZW50OiBoYXNoQ2hhbmdlLFxuICAgICAgaGlzdG9yeVN0YXRlOiBudWxsLFxuICAgIH0pO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQoKTtcblxuICAgIHRoaXMudXNlckFnZW50TmF2aWdhdGUoZGVzdGluYXRpb24sIHJlc3VsdCwge1xuICAgICAgbmF2aWdhdGlvblR5cGUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgY2FuSW50ZXJjZXB0OiB0cnVlLFxuICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciBuYXZpZ2F0ZSgpLlxuICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICBoYXNoQ2hhbmdlLFxuICAgICAgaW5mbzogb3B0aW9ucz8uaW5mbyxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWQ6IHJlc3VsdC5jb21taXR0ZWQsXG4gICAgICBmaW5pc2hlZDogcmVzdWx0LmZpbmlzaGVkLFxuICAgIH07XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgaGlzdG9yeS5wdXNoU3RhdGUoKWAuICovXG4gIHB1c2hTdGF0ZShkYXRhOiB1bmtub3duLCB0aXRsZTogc3RyaW5nLCB1cmw/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hPclJlcGxhY2VTdGF0ZSgncHVzaCcsIGRhdGEsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYGhpc3RvcnkucmVwbGFjZVN0YXRlKClgLiAqL1xuICByZXBsYWNlU3RhdGUoZGF0YTogdW5rbm93biwgdGl0bGU6IHN0cmluZywgdXJsPzogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoT3JSZXBsYWNlU3RhdGUoJ3JlcGxhY2UnLCBkYXRhLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaE9yUmVwbGFjZVN0YXRlKFxuICAgICAgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nLFxuICAgICAgZGF0YTogdW5rbm93bixcbiAgICAgIF90aXRsZTogc3RyaW5nLFxuICAgICAgdXJsPzogc3RyaW5nLFxuICAgICAgKTogdm9pZCB7XG4gICAgY29uc3QgZnJvbVVybCA9IG5ldyBVUkwodGhpcy5jdXJyZW50RW50cnkudXJsISk7XG4gICAgY29uc3QgdG9VcmwgPSB1cmwgPyBuZXcgVVJMKHVybCwgdGhpcy5jdXJyZW50RW50cnkudXJsISkgOiBmcm9tVXJsO1xuXG4gICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCB0b1VybCk7XG5cbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgIHVybDogdG9VcmwudG9TdHJpbmcoKSxcbiAgICAgIHNhbWVEb2N1bWVudDogdHJ1ZSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogZGF0YSxcbiAgICB9KTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG5cbiAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgIG5hdmlnYXRpb25UeXBlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgcHVzaFN0YXRlKCkgb3IgcmVwbGFjZVN0YXRlKCkuXG4gICAgICB1c2VySW5pdGlhdGVkOiBmYWxzZSxcbiAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICBza2lwUG9wU3RhdGU6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi50cmF2ZXJzZVRvKClgLiAqL1xuICB0cmF2ZXJzZVRvKGtleTogc3RyaW5nLCBvcHRpb25zPzogTmF2aWdhdGlvbk9wdGlvbnMpOiBGYWtlTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZnJvbVVybCA9IG5ldyBVUkwodGhpcy5jdXJyZW50RW50cnkudXJsISk7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmZpbmRFbnRyeShrZXkpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgIGNvbnN0IGRvbUV4Y2VwdGlvbiA9IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgJ0ludmFsaWQga2V5JyxcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNvbW1pdHRlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb25zdCBmaW5pc2hlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb21taXR0ZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgZmluaXNoZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkLFxuICAgICAgICBmaW5pc2hlZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChlbnRyeSA9PT0gdGhpcy5jdXJyZW50RW50cnkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuY3VycmVudEVudHJ5KSxcbiAgICAgICAgZmluaXNoZWQ6IFByb21pc2UucmVzb2x2ZSh0aGlzLmN1cnJlbnRFbnRyeSksXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAodGhpcy50cmF2ZXJzYWxRdWV1ZS5oYXMoZW50cnkua2V5KSkge1xuICAgICAgY29uc3QgZXhpc3RpbmdSZXN1bHQgPSB0aGlzLnRyYXZlcnNhbFF1ZXVlLmdldChlbnRyeS5rZXkpITtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZDogZXhpc3RpbmdSZXN1bHQuY29tbWl0dGVkLFxuICAgICAgICBmaW5pc2hlZDogZXhpc3RpbmdSZXN1bHQuZmluaXNoZWQsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGhhc2hDaGFuZ2UgPSBpc0hhc2hDaGFuZ2UoZnJvbVVybCwgbmV3IFVSTChlbnRyeS51cmwhLCB0aGlzLmN1cnJlbnRFbnRyeS51cmwhKSk7XG4gICAgY29uc3QgZGVzdGluYXRpb24gPSBuZXcgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbih7XG4gICAgICB1cmw6IGVudHJ5LnVybCEsXG4gICAgICBzdGF0ZTogZW50cnkuZ2V0U3RhdGUoKSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogZW50cnkuZ2V0SGlzdG9yeVN0YXRlKCksXG4gICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgIGlkOiBlbnRyeS5pZCxcbiAgICAgIGluZGV4OiBlbnRyeS5pbmRleCxcbiAgICAgIHNhbWVEb2N1bWVudDogZW50cnkuc2FtZURvY3VtZW50LFxuICAgIH0pO1xuICAgIHRoaXMucHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gZW50cnkuaW5kZXg7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuICAgIHRoaXMudHJhdmVyc2FsUXVldWUuc2V0KGVudHJ5LmtleSwgcmVzdWx0KTtcbiAgICB0aGlzLnJ1blRyYXZlcnNhbCgoKSA9PiB7XG4gICAgICB0aGlzLnRyYXZlcnNhbFF1ZXVlLmRlbGV0ZShlbnRyeS5rZXkpO1xuICAgICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlOiAndHJhdmVyc2UnLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgdHJhdmVyc2VUbygpLlxuICAgICAgICB1c2VySW5pdGlhdGVkOiBmYWxzZSxcbiAgICAgICAgaGFzaENoYW5nZSxcbiAgICAgICAgaW5mbzogb3B0aW9ucz8uaW5mbyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWQ6IHJlc3VsdC5jb21taXR0ZWQsXG4gICAgICBmaW5pc2hlZDogcmVzdWx0LmZpbmlzaGVkLFxuICAgIH07XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5iYWNrKClgLiAqL1xuICBiYWNrKG9wdGlvbnM/OiBOYXZpZ2F0aW9uT3B0aW9ucyk6IEZha2VOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICBpZiAodGhpcy5jdXJyZW50RW50cnlJbmRleCA9PT0gMCkge1xuICAgICAgY29uc3QgZG9tRXhjZXB0aW9uID0gbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICAnQ2Fubm90IGdvIGJhY2snLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleCAtIDFdO1xuICAgIHJldHVybiB0aGlzLnRyYXZlcnNlVG8oZW50cnkua2V5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmZvcndhcmQoKWAuICovXG4gIGZvcndhcmQob3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGlmICh0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID09PSB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIC0gMSkge1xuICAgICAgY29uc3QgZG9tRXhjZXB0aW9uID0gbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICAnQ2Fubm90IGdvIGZvcndhcmQnLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleCArIDFdO1xuICAgIHJldHVybiB0aGlzLnRyYXZlcnNlVG8oZW50cnkua2V5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFcXVpdmFsZW50IHRvIGBoaXN0b3J5LmdvKClgLlxuICAgKiBOb3RlIHRoYXQgdGhpcyBtZXRob2QgZG9lcyBub3QgYWN0dWFsbHkgd29yayBwcmVjaXNlbHkgdG8gaG93IENocm9tZVxuICAgKiBkb2VzLCBpbnN0ZWFkIGNob29zaW5nIGEgc2ltcGxlciBtb2RlbCB3aXRoIGxlc3MgdW5leHBlY3RlZCBiZWhhdmlvci5cbiAgICogQ2hyb21lIGhhcyBhIGZldyBlZGdlIGNhc2Ugb3B0aW1pemF0aW9ucywgZm9yIGluc3RhbmNlIHdpdGggcmVwZWF0ZWRcbiAgICogYGJhY2soKTsgZm9yd2FyZCgpYCBjaGFpbnMgaXQgY29sbGFwc2VzIGNlcnRhaW4gdHJhdmVyc2Fscy5cbiAgICovXG4gIGdvKGRpcmVjdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0SW5kZXggPSB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCArIGRpcmVjdGlvbjtcbiAgICBpZiAodGFyZ2V0SW5kZXggPj0gdGhpcy5lbnRyaWVzQXJyLmxlbmd0aCB8fCB0YXJnZXRJbmRleCA8IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICB0aGlzLnJ1blRyYXZlcnNhbCgoKSA9PiB7XG4gICAgICAvLyBDaGVjayBhZ2FpbiB0aGF0IGRlc3RpbmF0aW9uIGlzIGluIHRoZSBlbnRyaWVzIGFycmF5LlxuICAgICAgaWYgKHRhcmdldEluZGV4ID49IHRoaXMuZW50cmllc0Fyci5sZW5ndGggfHwgdGFyZ2V0SW5kZXggPCAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGFyZ2V0SW5kZXhdO1xuICAgICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCBuZXcgVVJMKGVudHJ5LnVybCEsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpKTtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgICB1cmw6IGVudHJ5LnVybCEsXG4gICAgICAgIHN0YXRlOiBlbnRyeS5nZXRTdGF0ZSgpLFxuICAgICAgICBoaXN0b3J5U3RhdGU6IGVudHJ5LmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgICAgaWQ6IGVudHJ5LmlkLFxuICAgICAgICBpbmRleDogZW50cnkuaW5kZXgsXG4gICAgICAgIHNhbWVEb2N1bWVudDogZW50cnkuc2FtZURvY3VtZW50LFxuICAgICAgfSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG4gICAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGU6ICd0cmF2ZXJzZScsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciBnbygpLlxuICAgICAgICB1c2VySW5pdGlhdGVkOiBmYWxzZSxcbiAgICAgICAgaGFzaENoYW5nZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJ1bnMgYSB0cmF2ZXJzYWwgc3luY2hyb25vdXNseSBvciBhc3luY2hyb25vdXNseSAqL1xuICBwcml2YXRlIHJ1blRyYXZlcnNhbCh0cmF2ZXJzYWw6ICgpID0+IHZvaWQpIHtcbiAgICBpZiAodGhpcy5zeW5jaHJvbm91c1RyYXZlcnNhbHMpIHtcbiAgICAgIHRyYXZlcnNhbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVhY2ggdHJhdmVyc2FsIG9jY3VwaWVzIGEgc2luZ2xlIHRpbWVvdXQgcmVzb2x1dGlvbi5cbiAgICAvLyBUaGlzIG1lYW5zIHRoYXQgUHJvbWlzZXMgYWRkZWQgdG8gY29tbWl0IGFuZCBmaW5pc2ggc2hvdWxkIHJlc29sdmVcbiAgICAvLyBiZWZvcmUgdGhlIG5leHQgdHJhdmVyc2FsLlxuICAgIHRoaXMubmV4dFRyYXZlcnNhbCA9IHRoaXMubmV4dFRyYXZlcnNhbC50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgdHJhdmVyc2FsKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5hZGRFdmVudExpc3RlbmVyKClgLiAqL1xuICBhZGRFdmVudExpc3RlbmVyKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnN8Ym9vbGVhbixcbiAgKSB7XG4gICAgdGhpcy5ldmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoKWAuICovXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICB0eXBlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCxcbiAgICAgIG9wdGlvbnM/OiBFdmVudExpc3RlbmVyT3B0aW9uc3xib29sZWFuLFxuICApIHtcbiAgICB0aGlzLmV2ZW50VGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uZGlzcGF0Y2hFdmVudCgpYCAqL1xuICBkaXNwYXRjaEV2ZW50KGV2ZW50OiBFdmVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmV2ZW50VGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICB9XG5cbiAgLyoqIENsZWFucyB1cCByZXNvdXJjZXMuICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgLy8gUmVjcmVhdGUgZXZlbnRUYXJnZXQgdG8gcmVsZWFzZSBjdXJyZW50IGxpc3RlbmVycy5cbiAgICAvLyBgZG9jdW1lbnQuY3JlYXRlRWxlbWVudGAgYmVjYXVzZSBOb2RlSlMgYEV2ZW50VGFyZ2V0YCBpcyBpbmNvbXBhdGlibGUgd2l0aCBEb21pbm8ncyBgRXZlbnRgLlxuICAgIHRoaXMuZXZlbnRUYXJnZXQgPSB0aGlzLndpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmRpc3Bvc2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBmYWtlIGlzIGRpc3Bvc2VkLiAqL1xuICBpc0Rpc3Bvc2VkKCkge1xuICAgIHJldHVybiB0aGlzLmRpc3Bvc2VkO1xuICB9XG5cbiAgLyoqIEltcGxlbWVudGF0aW9uIGZvciBhbGwgbmF2aWdhdGlvbnMgYW5kIHRyYXZlcnNhbHMuICovXG4gIHByaXZhdGUgdXNlckFnZW50TmF2aWdhdGUoXG4gICAgICBkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbixcbiAgICAgIHJlc3VsdDogSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0LFxuICAgICAgb3B0aW9uczogSW50ZXJuYWxOYXZpZ2F0ZU9wdGlvbnMsXG4gICkge1xuICAgIC8vIFRoZSBmaXJzdCBuYXZpZ2F0aW9uIHNob3VsZCBkaXNhbGxvdyBhbnkgZnV0dXJlIGNhbGxzIHRvIHNldCB0aGUgaW5pdGlhbFxuICAgIC8vIGVudHJ5LlxuICAgIHRoaXMuY2FuU2V0SW5pdGlhbEVudHJ5ID0gZmFsc2U7XG4gICAgaWYgKHRoaXMubmF2aWdhdGVFdmVudCkge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50LmNhbmNlbChcbiAgICAgICAgICBuZXcgRE9NRXhjZXB0aW9uKCdOYXZpZ2F0aW9uIHdhcyBhYm9ydGVkJywgJ0Fib3J0RXJyb3InKSxcbiAgICAgICk7XG4gICAgICB0aGlzLm5hdmlnYXRlRXZlbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmF2aWdhdGVFdmVudCA9IGNyZWF0ZUZha2VOYXZpZ2F0ZUV2ZW50KHtcbiAgICAgIG5hdmlnYXRpb25UeXBlOiBvcHRpb25zLm5hdmlnYXRpb25UeXBlLFxuICAgICAgY2FuY2VsYWJsZTogb3B0aW9ucy5jYW5jZWxhYmxlLFxuICAgICAgY2FuSW50ZXJjZXB0OiBvcHRpb25zLmNhbkludGVyY2VwdCxcbiAgICAgIHVzZXJJbml0aWF0ZWQ6IG9wdGlvbnMudXNlckluaXRpYXRlZCxcbiAgICAgIGhhc2hDaGFuZ2U6IG9wdGlvbnMuaGFzaENoYW5nZSxcbiAgICAgIHNpZ25hbDogcmVzdWx0LnNpZ25hbCxcbiAgICAgIGRlc3RpbmF0aW9uLFxuICAgICAgaW5mbzogb3B0aW9ucy5pbmZvLFxuICAgICAgc2FtZURvY3VtZW50OiBkZXN0aW5hdGlvbi5zYW1lRG9jdW1lbnQsXG4gICAgICBza2lwUG9wU3RhdGU6IG9wdGlvbnMuc2tpcFBvcFN0YXRlLFxuICAgICAgcmVzdWx0LFxuICAgICAgdXNlckFnZW50Q29tbWl0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMudXNlckFnZW50Q29tbWl0KCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5uYXZpZ2F0ZUV2ZW50ID0gbmF2aWdhdGVFdmVudDtcbiAgICB0aGlzLmV2ZW50VGFyZ2V0LmRpc3BhdGNoRXZlbnQobmF2aWdhdGVFdmVudCk7XG4gICAgbmF2aWdhdGVFdmVudC5kaXNwYXRjaGVkTmF2aWdhdGVFdmVudCgpO1xuICAgIGlmIChuYXZpZ2F0ZUV2ZW50LmNvbW1pdE9wdGlvbiA9PT0gJ2ltbWVkaWF0ZScpIHtcbiAgICAgIG5hdmlnYXRlRXZlbnQuY29tbWl0KC8qIGludGVybmFsPSAqLyB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gdG8gY29tbWl0IGEgbmF2aWdhdGlvbi4gKi9cbiAgcHJpdmF0ZSB1c2VyQWdlbnRDb21taXQoKSB7XG4gICAgaWYgKCF0aGlzLm5hdmlnYXRlRXZlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZnJvbSA9IHRoaXMuY3VycmVudEVudHJ5O1xuICAgIGlmICghdGhpcy5uYXZpZ2F0ZUV2ZW50LnNhbWVEb2N1bWVudCkge1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ0Nhbm5vdCBuYXZpZ2F0ZSB0byBhIG5vbi1zYW1lLWRvY3VtZW50IFVSTC4nKTtcbiAgICAgIHRoaXMubmF2aWdhdGVFdmVudC5jYW5jZWwoZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGlmICh0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJyB8fFxuICAgICAgICB0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGUgPT09ICdyZXBsYWNlJykge1xuICAgICAgdGhpcy51c2VyQWdlbnRQdXNoT3JSZXBsYWNlKHRoaXMubmF2aWdhdGVFdmVudC5kZXN0aW5hdGlvbiwge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZTogdGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGUgPT09ICd0cmF2ZXJzZScpIHtcbiAgICAgIHRoaXMudXNlckFnZW50VHJhdmVyc2UodGhpcy5uYXZpZ2F0ZUV2ZW50LmRlc3RpbmF0aW9uKTtcbiAgICB9XG4gICAgdGhpcy5uYXZpZ2F0ZUV2ZW50LnVzZXJBZ2VudE5hdmlnYXRlZCh0aGlzLmN1cnJlbnRFbnRyeSk7XG4gICAgY29uc3QgY3VycmVudEVudHJ5Q2hhbmdlRXZlbnQgPSBjcmVhdGVGYWtlTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KFxuICAgICAgICB7ZnJvbSwgbmF2aWdhdGlvblR5cGU6IHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZX0sXG4gICAgKTtcbiAgICB0aGlzLmV2ZW50VGFyZ2V0LmRpc3BhdGNoRXZlbnQoY3VycmVudEVudHJ5Q2hhbmdlRXZlbnQpO1xuICAgIGlmICghdGhpcy5uYXZpZ2F0ZUV2ZW50LnNraXBQb3BTdGF0ZSkge1xuICAgICAgY29uc3QgcG9wU3RhdGVFdmVudCA9IGNyZWF0ZVBvcFN0YXRlRXZlbnQoe1xuICAgICAgICBzdGF0ZTogdGhpcy5uYXZpZ2F0ZUV2ZW50LmRlc3RpbmF0aW9uLmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgICAgfSk7XG4gICAgICB0aGlzLndpbmRvdy5kaXNwYXRjaEV2ZW50KHBvcFN0YXRlRXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiBmb3IgYSBwdXNoIG9yIHJlcGxhY2UgbmF2aWdhdGlvbi4gKi9cbiAgcHJpdmF0ZSB1c2VyQWdlbnRQdXNoT3JSZXBsYWNlKFxuICAgICAgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24sXG4gICAgICB7bmF2aWdhdGlvblR5cGV9OiB7bmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nfSxcbiAgKSB7XG4gICAgaWYgKG5hdmlnYXRpb25UeXBlID09PSAncHVzaCcpIHtcbiAgICAgIHRoaXMuY3VycmVudEVudHJ5SW5kZXgrKztcbiAgICAgIHRoaXMucHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gdGhpcy5jdXJyZW50RW50cnlJbmRleDtcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmN1cnJlbnRFbnRyeUluZGV4O1xuICAgIGNvbnN0IGtleSA9IG5hdmlnYXRpb25UeXBlID09PSAncHVzaCcgPyBTdHJpbmcodGhpcy5uZXh0S2V5KyspIDogdGhpcy5jdXJyZW50RW50cnkua2V5O1xuICAgIGNvbnN0IGVudHJ5ID0gbmV3IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KGRlc3RpbmF0aW9uLnVybCwge1xuICAgICAgaWQ6IFN0cmluZyh0aGlzLm5leHRJZCsrKSxcbiAgICAgIGtleSxcbiAgICAgIGluZGV4LFxuICAgICAgc2FtZURvY3VtZW50OiB0cnVlLFxuICAgICAgc3RhdGU6IGRlc3RpbmF0aW9uLmdldFN0YXRlKCksXG4gICAgICBoaXN0b3J5U3RhdGU6IGRlc3RpbmF0aW9uLmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgIH0pO1xuICAgIGlmIChuYXZpZ2F0aW9uVHlwZSA9PT0gJ3B1c2gnKSB7XG4gICAgICB0aGlzLmVudHJpZXNBcnIuc3BsaWNlKGluZGV4LCBJbmZpbml0eSwgZW50cnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVudHJpZXNBcnJbaW5kZXhdID0gZW50cnk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEltcGxlbWVudGF0aW9uIGZvciBhIHRyYXZlcnNlIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50VHJhdmVyc2UoZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24pIHtcbiAgICB0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID0gZGVzdGluYXRpb24uaW5kZXg7XG4gIH1cblxuICAvKiogVXRpbGl0eSBtZXRob2QgZm9yIGZpbmRpbmcgZW50cmllcyB3aXRoIHRoZSBnaXZlbiBga2V5YC4gKi9cbiAgcHJpdmF0ZSBmaW5kRW50cnkoa2V5OiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMuZW50cmllc0Fycikge1xuICAgICAgaWYgKGVudHJ5LmtleSA9PT0ga2V5KSByZXR1cm4gZW50cnk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBzZXQgb25uYXZpZ2F0ZShfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGVFdmVudCkgPT4gYW55KXxudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25uYXZpZ2F0ZSgpOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0ZUV2ZW50KSA9PiBhbnkpfG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc2V0IG9uY3VycmVudGVudHJ5Y2hhbmdlKF9oYW5kbGVyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCkgPT4gYW55KXxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBvbmN1cnJlbnRlbnRyeWNoYW5nZSgpOlxuICAgICAgKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KSA9PiBhbnkpfG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc2V0IG9ubmF2aWdhdGVzdWNjZXNzKF9oYW5kbGVyOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBFdmVudCkgPT4gYW55KXxudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25uYXZpZ2F0ZXN1Y2Nlc3MoKTogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXZlbnQpID0+IGFueSl8bnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzZXQgb25uYXZpZ2F0ZWVycm9yKF9oYW5kbGVyOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBFcnJvckV2ZW50KSA9PiBhbnkpfG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBvbm5hdmlnYXRlZXJyb3IoKTogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXJyb3JFdmVudCkgPT4gYW55KXxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCB0cmFuc2l0aW9uKCk6IE5hdmlnYXRpb25UcmFuc2l0aW9ufG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgdXBkYXRlQ3VycmVudEVudHJ5KF9vcHRpb25zOiBOYXZpZ2F0aW9uVXBkYXRlQ3VycmVudEVudHJ5T3B0aW9ucyk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVsb2FkKF9vcHRpb25zPzogTmF2aWdhdGlvblJlbG9hZE9wdGlvbnMpOiBOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiB0aGUgYE5hdmlnYXRpb25SZXN1bHRgIGludGVyZmFjZSB3aXRoXG4gKiBgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnlgLlxuICovXG5pbnRlcmZhY2UgRmFrZU5hdmlnYXRpb25SZXN1bHQgZXh0ZW5kcyBOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgcmVhZG9ubHkgY29tbWl0dGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PjtcbiAgcmVhZG9ubHkgZmluaXNoZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGlvbkhpc3RvcnlFbnRyeWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSBpbXBsZW1lbnRzIE5hdmlnYXRpb25IaXN0b3J5RW50cnkge1xuICByZWFkb25seSBzYW1lRG9jdW1lbnQ7XG5cbiAgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgcmVhZG9ubHkga2V5OiBzdHJpbmc7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhdGU6IHVua25vd247XG4gIHByaXZhdGUgcmVhZG9ubHkgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgb25kaXNwb3NlOiAoKHRoaXM6IE5hdmlnYXRpb25IaXN0b3J5RW50cnksIGV2OiBFdmVudCkgPT4gYW55KXxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IHVybDogc3RyaW5nfG51bGwsXG4gICAgICB7XG4gICAgICAgIGlkLFxuICAgICAgICBrZXksXG4gICAgICAgIGluZGV4LFxuICAgICAgICBzYW1lRG9jdW1lbnQsXG4gICAgICAgIHN0YXRlLFxuICAgICAgICBoaXN0b3J5U3RhdGUsXG4gICAgICB9OiB7XG4gICAgICAgIGlkOiBzdHJpbmc7IGtleTogc3RyaW5nOyBpbmRleDogbnVtYmVyOyBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47IGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcbiAgICAgICAgc3RhdGU/OiB1bmtub3duO1xuICAgICAgfSxcbiAgKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICB0aGlzLnNhbWVEb2N1bWVudCA9IHNhbWVEb2N1bWVudDtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5oaXN0b3J5U3RhdGUgPSBoaXN0b3J5U3RhdGU7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICAvLyBCdWRnZXQgY29weS5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZSkpIDogdGhpcy5zdGF0ZTtcbiAgfVxuXG4gIGdldEhpc3RvcnlTdGF0ZSgpOiB1bmtub3duIHtcbiAgICAvLyBCdWRnZXQgY29weS5cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5U3RhdGUgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuaGlzdG9yeVN0YXRlKSkgOiB0aGlzLmhpc3RvcnlTdGF0ZTtcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICB0eXBlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCxcbiAgICAgIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9uc3xib29sZWFuLFxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICB0eXBlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCxcbiAgICAgIG9wdGlvbnM/OiBFdmVudExpc3RlbmVyT3B0aW9uc3xib29sZWFuLFxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuLyoqIGBOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9uc2Agd2l0aCBleHBlcmltZW50YWwgY29tbWl0IG9wdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwZXJpbWVudGFsTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMgZXh0ZW5kcyBOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyB7XG4gIGNvbW1pdD86ICdpbW1lZGlhdGUnfCdhZnRlci10cmFuc2l0aW9uJztcbn1cblxuLyoqIGBOYXZpZ2F0ZUV2ZW50YCB3aXRoIGV4cGVyaW1lbnRhbCBjb21taXQgZnVuY3Rpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIEV4cGVyaW1lbnRhbE5hdmlnYXRlRXZlbnQgZXh0ZW5kcyBOYXZpZ2F0ZUV2ZW50IHtcbiAgaW50ZXJjZXB0KG9wdGlvbnM/OiBFeHBlcmltZW50YWxOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyk6IHZvaWQ7XG5cbiAgY29tbWl0KCk6IHZvaWQ7XG59XG5cbi8qKlxuICogRmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0ZUV2ZW50YC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWtlTmF2aWdhdGVFdmVudCBleHRlbmRzIEV4cGVyaW1lbnRhbE5hdmlnYXRlRXZlbnQge1xuICByZWFkb25seSBkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbjtcbn1cblxuaW50ZXJmYWNlIEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQgZXh0ZW5kcyBGYWtlTmF2aWdhdGVFdmVudCB7XG4gIHJlYWRvbmx5IHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgcmVhZG9ubHkgc2tpcFBvcFN0YXRlPzogYm9vbGVhbjtcbiAgcmVhZG9ubHkgY29tbWl0T3B0aW9uOiAnYWZ0ZXItdHJhbnNpdGlvbid8J2ltbWVkaWF0ZSc7XG4gIHJlYWRvbmx5IHJlc3VsdDogSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0O1xuXG4gIGNvbW1pdChpbnRlcm5hbD86IGJvb2xlYW4pOiB2b2lkO1xuICBjYW5jZWwocmVhc29uOiBFcnJvcik6IHZvaWQ7XG4gIGRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50KCk6IHZvaWQ7XG4gIHVzZXJBZ2VudE5hdmlnYXRlZChlbnRyeTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkpOiB2b2lkO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGVFdmVudGAuIFRoaXMgaXMgbm90IGEgY2xhc3MgYmVjYXVzZSBFUzVcbiAqIHRyYW5zcGlsZWQgSmF2YVNjcmlwdCBjYW5ub3QgZXh0ZW5kIG5hdGl2ZSBFdmVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRmFrZU5hdmlnYXRlRXZlbnQoe1xuICBjYW5jZWxhYmxlLFxuICBjYW5JbnRlcmNlcHQsXG4gIHVzZXJJbml0aWF0ZWQsXG4gIGhhc2hDaGFuZ2UsXG4gIG5hdmlnYXRpb25UeXBlLFxuICBzaWduYWwsXG4gIGRlc3RpbmF0aW9uLFxuICBpbmZvLFxuICBzYW1lRG9jdW1lbnQsXG4gIHNraXBQb3BTdGF0ZSxcbiAgcmVzdWx0LFxuICB1c2VyQWdlbnRDb21taXQsXG59OiB7XG4gIGNhbmNlbGFibGU6IGJvb2xlYW47IGNhbkludGVyY2VwdDogYm9vbGVhbjsgdXNlckluaXRpYXRlZDogYm9vbGVhbjsgaGFzaENoYW5nZTogYm9vbGVhbjtcbiAgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nO1xuICBzaWduYWw6IEFib3J0U2lnbmFsO1xuICBkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbjtcbiAgaW5mbzogdW5rbm93bjtcbiAgc2FtZURvY3VtZW50OiBib29sZWFuO1xuICBza2lwUG9wU3RhdGU/OiBib29sZWFuOyByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdDsgdXNlckFnZW50Q29tbWl0OiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnbmF2aWdhdGUnLCB7YnViYmxlczogZmFsc2UsIGNhbmNlbGFibGV9KSBhcyB7XG4gICAgLXJlYWRvbmx5W1AgaW4ga2V5b2YgSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudF06IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnRbUF07XG4gIH07XG4gIGV2ZW50LmNhbkludGVyY2VwdCA9IGNhbkludGVyY2VwdDtcbiAgZXZlbnQudXNlckluaXRpYXRlZCA9IHVzZXJJbml0aWF0ZWQ7XG4gIGV2ZW50Lmhhc2hDaGFuZ2UgPSBoYXNoQ2hhbmdlO1xuICBldmVudC5uYXZpZ2F0aW9uVHlwZSA9IG5hdmlnYXRpb25UeXBlO1xuICBldmVudC5zaWduYWwgPSBzaWduYWw7XG4gIGV2ZW50LmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XG4gIGV2ZW50LmluZm8gPSBpbmZvO1xuICBldmVudC5kb3dubG9hZFJlcXVlc3QgPSBudWxsO1xuICBldmVudC5mb3JtRGF0YSA9IG51bGw7XG5cbiAgZXZlbnQuc2FtZURvY3VtZW50ID0gc2FtZURvY3VtZW50O1xuICBldmVudC5za2lwUG9wU3RhdGUgPSBza2lwUG9wU3RhdGU7XG4gIGV2ZW50LmNvbW1pdE9wdGlvbiA9ICdpbW1lZGlhdGUnO1xuXG4gIGxldCBoYW5kbGVyRmluaXNoZWQ6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgaW50ZXJjZXB0Q2FsbGVkID0gZmFsc2U7XG4gIGxldCBkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCA9IGZhbHNlO1xuICBsZXQgY29tbWl0Q2FsbGVkID0gZmFsc2U7XG5cbiAgZXZlbnQuaW50ZXJjZXB0ID0gZnVuY3Rpb24oXG4gICAgICB0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LFxuICAgICAgb3B0aW9ucz86IEV4cGVyaW1lbnRhbE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zLFxuICAgICAgKTogdm9pZCB7XG4gICAgaW50ZXJjZXB0Q2FsbGVkID0gdHJ1ZTtcbiAgICBldmVudC5zYW1lRG9jdW1lbnQgPSB0cnVlO1xuICAgIGNvbnN0IGhhbmRsZXIgPSBvcHRpb25zPy5oYW5kbGVyO1xuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyRmluaXNoZWQgPSBoYW5kbGVyKCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5jb21taXQpIHtcbiAgICAgIGV2ZW50LmNvbW1pdE9wdGlvbiA9IG9wdGlvbnMuY29tbWl0O1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uZm9jdXNSZXNldCAhPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnM/LnNjcm9sbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgZXZlbnQuc2Nyb2xsID0gZnVuY3Rpb24odGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9O1xuXG4gIGV2ZW50LmNvbW1pdCA9IGZ1bmN0aW9uKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsIGludGVybmFsID0gZmFsc2UpIHtcbiAgICBpZiAoIWludGVybmFsICYmICFpbnRlcmNlcHRDYWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgYEZhaWxlZCB0byBleGVjdXRlICdjb21taXQnIG9uICdOYXZpZ2F0ZUV2ZW50JzogaW50ZXJjZXB0KCkgbXVzdCBiZSBgICtcbiAgICAgICAgICAgICAgYGNhbGxlZCBiZWZvcmUgY29tbWl0KCkuYCxcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ2NvbW1pdCcgb24gJ05hdmlnYXRlRXZlbnQnOiBjb21taXQoKSBtYXkgbm90IGJlIGAgK1xuICAgICAgICAgICAgICBgY2FsbGVkIGR1cmluZyBldmVudCBkaXNwYXRjaC5gLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoY29tbWl0Q2FsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgIGBGYWlsZWQgdG8gZXhlY3V0ZSAnY29tbWl0JyBvbiAnTmF2aWdhdGVFdmVudCc6IGNvbW1pdCgpIGFscmVhZHkgYCArXG4gICAgICAgICAgICAgIGBjYWxsZWQuYCxcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29tbWl0Q2FsbGVkID0gdHJ1ZTtcblxuICAgIHVzZXJBZ2VudENvbW1pdCgpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIG9ubHkuXG4gIGV2ZW50LmNhbmNlbCA9IGZ1bmN0aW9uKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsIHJlYXNvbjogRXJyb3IpIHtcbiAgICByZXN1bHQuY29tbWl0dGVkUmVqZWN0KHJlYXNvbik7XG4gICAgcmVzdWx0LmZpbmlzaGVkUmVqZWN0KHJlYXNvbik7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgb25seS5cbiAgZXZlbnQuZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQgPSBmdW5jdGlvbih0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50KSB7XG4gICAgZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQgPSB0cnVlO1xuICAgIGlmIChldmVudC5jb21taXRPcHRpb24gPT09ICdhZnRlci10cmFuc2l0aW9uJykge1xuICAgICAgLy8gSWYgaGFuZGxlciBmaW5pc2hlcyBiZWZvcmUgY29tbWl0LCBjYWxsIGNvbW1pdC5cbiAgICAgIGhhbmRsZXJGaW5pc2hlZD8udGhlbihcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNvbW1pdENhbGxlZCkge1xuICAgICAgICAgICAgICBldmVudC5jb21taXQoLyogaW50ZXJuYWwgKi8gdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAoKSA9PiB7fSxcbiAgICAgICk7XG4gICAgfVxuICAgIFByb21pc2UuYWxsKFtyZXN1bHQuY29tbWl0dGVkLCBoYW5kbGVyRmluaXNoZWRdKVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAgIChbZW50cnldKSA9PiB7XG4gICAgICAgICAgICAgIHJlc3VsdC5maW5pc2hlZFJlc29sdmUoZW50cnkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIChyZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgcmVzdWx0LmZpbmlzaGVkUmVqZWN0KHJlYXNvbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICB9O1xuXG4gIC8vIEludGVybmFsIG9ubHkuXG4gIGV2ZW50LnVzZXJBZ2VudE5hdmlnYXRlZCA9IGZ1bmN0aW9uKFxuICAgICAgdGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCxcbiAgICAgIGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSxcbiAgKSB7XG4gICAgcmVzdWx0LmNvbW1pdHRlZFJlc29sdmUoZW50cnkpO1xuICB9O1xuXG4gIHJldHVybiBldmVudCBhcyBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50O1xufVxuXG4vKiogRmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnRgLiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWtlTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50IGV4dGVuZHMgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50IHtcbiAgcmVhZG9ubHkgZnJvbTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlYC4gVGhpcyBkb2VzIG5vdCB1c2VcbiAqIGEgY2xhc3MgYmVjYXVzZSBFUzUgdHJhbnNwaWxlZCBKYXZhU2NyaXB0IGNhbm5vdCBleHRlbmQgbmF0aXZlIEV2ZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVGYWtlTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KHtcbiAgZnJvbSxcbiAgbmF2aWdhdGlvblR5cGUsXG59OiB7ZnJvbTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk7IG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZzt9KSB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCdjdXJyZW50ZW50cnljaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pIGFzIHtcbiAgICAtcmVhZG9ubHlbUCBpbiBrZXlvZiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnRdOiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnRbUF07XG4gIH07XG4gIGV2ZW50LmZyb20gPSBmcm9tO1xuICBldmVudC5uYXZpZ2F0aW9uVHlwZSA9IG5hdmlnYXRpb25UeXBlO1xuICByZXR1cm4gZXZlbnQgYXMgRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmYWtlIGVxdWl2YWxlbnQgb2YgYFBvcFN0YXRlRXZlbnRgLiBUaGlzIGRvZXMgbm90IHVzZSBhIGNsYXNzXG4gKiBiZWNhdXNlIEVTNSB0cmFuc3BpbGVkIEphdmFTY3JpcHQgY2Fubm90IGV4dGVuZCBuYXRpdmUgRXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBvcFN0YXRlRXZlbnQoe3N0YXRlfToge3N0YXRlOiB1bmtub3dufSkge1xuICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgncG9wc3RhdGUnLCB7XG4gICAgICAgICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pIGFzIHstcmVhZG9ubHlbUCBpbiBrZXlvZiBQb3BTdGF0ZUV2ZW50XTogUG9wU3RhdGVFdmVudFtQXX07XG4gIGV2ZW50LnN0YXRlID0gc3RhdGU7XG4gIHJldHVybiBldmVudCBhcyBQb3BTdGF0ZUV2ZW50O1xufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGlvbkRlc3RpbmF0aW9uYC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24gaW1wbGVtZW50cyBOYXZpZ2F0aW9uRGVzdGluYXRpb24ge1xuICByZWFkb25seSB1cmw6IHN0cmluZztcbiAgcmVhZG9ubHkgc2FtZURvY3VtZW50OiBib29sZWFuO1xuICByZWFkb25seSBrZXk6IHN0cmluZ3xudWxsO1xuICByZWFkb25seSBpZDogc3RyaW5nfG51bGw7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBzdGF0ZT86IHVua25vd247XG4gIHByaXZhdGUgcmVhZG9ubHkgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICB1cmwsXG4gICAgc2FtZURvY3VtZW50LFxuICAgIGhpc3RvcnlTdGF0ZSxcbiAgICBzdGF0ZSxcbiAgICBrZXkgPSBudWxsLFxuICAgIGlkID0gbnVsbCxcbiAgICBpbmRleCA9IC0xLFxuICB9OiB7XG4gICAgdXJsOiBzdHJpbmc7IHNhbWVEb2N1bWVudDogYm9vbGVhbjsgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuICAgIHN0YXRlPzogdW5rbm93bjtcbiAgICBrZXk/OiBzdHJpbmcgfCBudWxsO1xuICAgIGlkPzogc3RyaW5nIHwgbnVsbDtcbiAgICBpbmRleD86IG51bWJlcjtcbiAgfSkge1xuICAgIHRoaXMudXJsID0gdXJsO1xuICAgIHRoaXMuc2FtZURvY3VtZW50ID0gc2FtZURvY3VtZW50O1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLmhpc3RvcnlTdGF0ZSA9IGhpc3RvcnlTdGF0ZTtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICBnZXRIaXN0b3J5U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeVN0YXRlO1xuICB9XG59XG5cbi8qKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGRldGVybWluZSB3aGV0aGVyIHR3byBVcmxMaWtlIGhhdmUgdGhlIHNhbWUgaGFzaC4gKi9cbmZ1bmN0aW9uIGlzSGFzaENoYW5nZShmcm9tOiBVUkwsIHRvOiBVUkwpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICAgIHRvLmhhc2ggIT09IGZyb20uaGFzaCAmJiB0by5ob3N0bmFtZSA9PT0gZnJvbS5ob3N0bmFtZSAmJiB0by5wYXRobmFtZSA9PT0gZnJvbS5wYXRobmFtZSAmJlxuICAgICAgdG8uc2VhcmNoID09PSBmcm9tLnNlYXJjaCk7XG59XG5cbi8qKiBJbnRlcm5hbCB1dGlsaXR5IGNsYXNzIGZvciByZXByZXNlbnRpbmcgdGhlIHJlc3VsdCBvZiBhIG5hdmlnYXRpb24uICAqL1xuY2xhc3MgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgY29tbWl0dGVkUmVzb2x2ZSE6IChlbnRyeTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkpID0+IHZvaWQ7XG4gIGNvbW1pdHRlZFJlamVjdCE6IChyZWFzb246IEVycm9yKSA9PiB2b2lkO1xuICBmaW5pc2hlZFJlc29sdmUhOiAoZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KSA9PiB2b2lkO1xuICBmaW5pc2hlZFJlamVjdCE6IChyZWFzb246IEVycm9yKSA9PiB2b2lkO1xuICByZWFkb25seSBjb21taXR0ZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xuICByZWFkb25seSBmaW5pc2hlZDogUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT47XG4gIGdldCBzaWduYWwoKTogQWJvcnRTaWduYWwge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gIH1cbiAgcHJpdmF0ZSByZWFkb25seSBhYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb21taXR0ZWQgPSBuZXcgUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT4oXG4gICAgICAgIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICB0aGlzLmNvbW1pdHRlZFJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgIHRoaXMuY29tbWl0dGVkUmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9LFxuICAgICk7XG5cbiAgICB0aGlzLmZpbmlzaGVkID0gbmV3IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+KFxuICAgICAgICBhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdGhpcy5maW5pc2hlZFJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgIHRoaXMuZmluaXNoZWRSZWplY3QgPSAocmVhc29uOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICAgICAgICB0aGlzLmFib3J0Q29udHJvbGxlci5hYm9ydChyZWFzb24pO1xuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgKTtcbiAgICAvLyBBbGwgcmVqZWN0aW9ucyBhcmUgaGFuZGxlZC5cbiAgICB0aGlzLmNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgdGhpcy5maW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIG9wdGlvbnMgZm9yIHBlcmZvcm1pbmcgYSBuYXZpZ2F0ZS4gKi9cbmludGVyZmFjZSBJbnRlcm5hbE5hdmlnYXRlT3B0aW9ucyB7XG4gIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbiAgY2FuY2VsYWJsZTogYm9vbGVhbjtcbiAgY2FuSW50ZXJjZXB0OiBib29sZWFuO1xuICB1c2VySW5pdGlhdGVkOiBib29sZWFuO1xuICBoYXNoQ2hhbmdlOiBib29sZWFuO1xuICBpbmZvPzogdW5rbm93bjtcbiAgc2tpcFBvcFN0YXRlPzogYm9vbGVhbjtcbn1cbiJdfQ==