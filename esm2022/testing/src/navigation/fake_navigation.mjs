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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3Rlc3Rpbmcvc3JjL25hdmlnYXRpb24vZmFrZV9uYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILHdFQUF3RTtBQUN4RSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBRS9COzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQXdEekIsK0NBQStDO0lBQy9DLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELFlBQTZCLE1BQWMsRUFBRSxRQUF5QjtRQUF6QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBcEUzQzs7O1dBR0c7UUFDYyxlQUFVLEdBQWlDLEVBQUUsQ0FBQztRQUUvRDs7V0FFRztRQUNLLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUU5Qjs7V0FFRztRQUNLLGtCQUFhLEdBQXdDLFNBQVMsQ0FBQztRQUV2RTs7O1dBR0c7UUFDYyxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1FBRTlFOzs7V0FHRztRQUNLLGtCQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTFDOzs7V0FHRztRQUNLLDBCQUFxQixHQUFHLENBQUMsQ0FBQztRQUVsQzs7O1dBR0c7UUFDSywwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFF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O0lBQ3JDLENBQUM7SUFHRDtRQUZpQixvQkFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFHdkQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLE9BQU8sQ0FDeEIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztZQUNoQyxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztRQUNoQyxDQUFDLENBQ0osQ0FBQztRQUVGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQ3ZCLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7WUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLE1BQWEsRUFBRSxFQUFFO2dCQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUNKLENBQUM7UUFDRiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFByZXZlbnRzIGRlbGV0aW9uIG9mIGBFdmVudGAgZnJvbSBgZ2xvYmFsVGhpc2AgZHVyaW5nIG1vZHVsZSBsb2FkaW5nLlxuY29uc3QgRXZlbnQgPSBnbG9iYWxUaGlzLkV2ZW50O1xuXG4vKipcbiAqIEZha2UgaW1wbGVtZW50YXRpb24gb2YgdXNlciBhZ2VudCBoaXN0b3J5IGFuZCBuYXZpZ2F0aW9uIGJlaGF2aW9yLiBUaGlzIGlzIGFcbiAqIGhpZ2gtZmlkZWxpdHkgaW1wbGVtZW50YXRpb24gb2YgYnJvd3NlciBiZWhhdmlvciB0aGF0IGF0dGVtcHRzIHRvIGVtdWxhdGVcbiAqIHRoaW5ncyBsaWtlIHRyYXZlcnNhbCBkZWxheS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZha2VOYXZpZ2F0aW9uIGltcGxlbWVudHMgTmF2aWdhdGlvbiB7XG4gIC8qKlxuICAgKiBUaGUgZmFrZSBpbXBsZW1lbnRhdGlvbiBvZiBhbiBlbnRyaWVzIGFycmF5LiBPbmx5IHNhbWUtZG9jdW1lbnQgZW50cmllc1xuICAgKiBhbGxvd2VkLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBlbnRyaWVzQXJyOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeVtdID0gW107XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGFjdGl2ZSBlbnRyeSBpbmRleCBpbnRvIGBlbnRyaWVzQXJyYC5cbiAgICovXG4gIHByaXZhdGUgY3VycmVudEVudHJ5SW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBuYXZpZ2F0ZSBldmVudC5cbiAgICovXG4gIHByaXZhdGUgbmF2aWdhdGVFdmVudDogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEEgTWFwIG9mIHBlbmRpbmcgdHJhdmVyc2Fscywgc28gdGhhdCB0cmF2ZXJzYWxzIHRvIHRoZSBzYW1lIGVudHJ5IGNhbiBiZVxuICAgKiByZS11c2VkLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSB0cmF2ZXJzYWxRdWV1ZSA9IG5ldyBNYXA8c3RyaW5nLCBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQ+KCk7XG5cbiAgLyoqXG4gICAqIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHByZXZpb3VzIHRyYXZlcnNhbHMgaGF2ZSBmaW5pc2hlZC4gVXNlZCB0b1xuICAgKiBzaW11bGF0ZSB0aGUgY3Jvc3MtcHJvY2VzcyBjb21tdW5pY2F0aW9uIG5lY2Vzc2FyeSBmb3IgdHJhdmVyc2Fscy5cbiAgICovXG4gIHByaXZhdGUgbmV4dFRyYXZlcnNhbCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIC8qKlxuICAgKiBBIHByb3NwZWN0aXZlIGN1cnJlbnQgYWN0aXZlIGVudHJ5IGluZGV4LCB3aGljaCBpbmNsdWRlcyB1bnJlc29sdmVkXG4gICAqIHRyYXZlcnNhbHMuIFVzZWQgYnkgYGdvYCB0byBkZXRlcm1pbmUgd2hlcmUgbmF2aWdhdGlvbnMgYXJlIGludGVuZGVkIHRvIGdvLlxuICAgKi9cbiAgcHJpdmF0ZSBwcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBBIHRlc3Qtb25seSBvcHRpb24gdG8gbWFrZSB0cmF2ZXJzYWxzIHN5bmNocm9ub3VzLCByYXRoZXIgdGhhbiBlbXVsYXRlXG4gICAqIGNyb3NzLXByb2Nlc3MgY29tbXVuaWNhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgc3luY2hyb25vdXNUcmF2ZXJzYWxzID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdG8gYWxsb3cgYSBjYWxsIHRvIHNldEluaXRpYWxFbnRyeUZvclRlc3RpbmcuICovXG4gIHByaXZhdGUgY2FuU2V0SW5pdGlhbEVudHJ5ID0gdHJ1ZTtcblxuICAvKiogYEV2ZW50VGFyZ2V0YCB0byBkaXNwYXRjaCBldmVudHMuICovXG4gIHByaXZhdGUgZXZlbnRUYXJnZXQ6IEV2ZW50VGFyZ2V0ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgLyoqIFRoZSBuZXh0IHVuaXF1ZSBpZCBmb3IgY3JlYXRlZCBlbnRyaWVzLiBSZXBsYWNlIHJlY3JlYXRlcyB0aGlzIGlkLiAqL1xuICBwcml2YXRlIG5leHRJZCA9IDA7XG5cbiAgLyoqIFRoZSBuZXh0IHVuaXF1ZSBrZXkgZm9yIGNyZWF0ZWQgZW50cmllcy4gUmVwbGFjZSBpbmhlcml0cyB0aGlzIGlkLiAqL1xuICBwcml2YXRlIG5leHRLZXkgPSAwO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgZmFrZSBpcyBkaXNwb3NlZC4gKi9cbiAgcHJpdmF0ZSBkaXNwb3NlZCA9IGZhbHNlO1xuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmN1cnJlbnRFbnRyeWAuICovXG4gIGdldCBjdXJyZW50RW50cnkoKTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleF07XG4gIH1cblxuICBnZXQgY2FuR29CYWNrKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID4gMDtcbiAgfVxuXG4gIGdldCBjYW5Hb0ZvcndhcmQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEVudHJ5SW5kZXggPCB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIC0gMTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2luZG93OiBXaW5kb3csIHN0YXJ0VVJMOiBgaHR0cCR7c3RyaW5nfWApIHtcbiAgICAvLyBGaXJzdCBlbnRyeS5cbiAgICB0aGlzLnNldEluaXRpYWxFbnRyeUZvclRlc3Rpbmcoc3RhcnRVUkwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGluaXRpYWwgZW50cnkuXG4gICAqL1xuICBwcml2YXRlIHNldEluaXRpYWxFbnRyeUZvclRlc3RpbmcoXG4gICAgICB1cmw6IGBodHRwJHtzdHJpbmd9YCxcbiAgICAgIG9wdGlvbnM6IHtoaXN0b3J5U3RhdGU6IHVua25vd247IHN0YXRlPzogdW5rbm93bjt9ID0ge2hpc3RvcnlTdGF0ZTogbnVsbH0sXG4gICkge1xuICAgIGlmICghdGhpcy5jYW5TZXRJbml0aWFsRW50cnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnc2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZyBjYW4gb25seSBiZSBjYWxsZWQgYmVmb3JlIGFueSAnICtcbiAgICAgICAgICAgICAgJ25hdmlnYXRpb24gaGFzIG9jY3VycmVkJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRJbml0aWFsRW50cnkgPSB0aGlzLmVudHJpZXNBcnJbMF07XG4gICAgdGhpcy5lbnRyaWVzQXJyWzBdID0gbmV3IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KFxuICAgICAgICBuZXcgVVJMKHVybCkudG9TdHJpbmcoKSxcbiAgICAgICAge1xuICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICAgIGtleTogY3VycmVudEluaXRpYWxFbnRyeT8ua2V5ID8/IFN0cmluZyh0aGlzLm5leHRLZXkrKyksXG4gICAgICAgICAgaWQ6IGN1cnJlbnRJbml0aWFsRW50cnk/LmlkID8/IFN0cmluZyh0aGlzLm5leHRJZCsrKSxcbiAgICAgICAgICBzYW1lRG9jdW1lbnQ6IHRydWUsXG4gICAgICAgICAgaGlzdG9yeVN0YXRlOiBvcHRpb25zPy5oaXN0b3J5U3RhdGUsXG4gICAgICAgICAgc3RhdGU6IG9wdGlvbnMuc3RhdGUsXG4gICAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGluaXRpYWwgZW50cnkgaXMgc3RpbGwgZWxpZ2libGUgdG8gYmUgc2V0LiAqL1xuICBjYW5TZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNhblNldEluaXRpYWxFbnRyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgdG8gZW11bGF0ZSB0cmF2ZXJzYWxzIGFzIHN5bmNocm9ub3VzIHJhdGhlciB0aGFuXG4gICAqIGFzeW5jaHJvbm91cy5cbiAgICovXG4gIHNldFN5bmNocm9ub3VzVHJhdmVyc2Fsc0ZvclRlc3Rpbmcoc3luY2hyb25vdXNUcmF2ZXJzYWxzOiBib29sZWFuKSB7XG4gICAgdGhpcy5zeW5jaHJvbm91c1RyYXZlcnNhbHMgPSBzeW5jaHJvbm91c1RyYXZlcnNhbHM7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5lbnRyaWVzKClgLiAqL1xuICBlbnRyaWVzKCk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5W10ge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNBcnIuc2xpY2UoKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLm5hdmlnYXRlKClgLiAqL1xuICBuYXZpZ2F0ZShcbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgb3B0aW9ucz86IE5hdmlnYXRpb25OYXZpZ2F0ZU9wdGlvbnMsXG4gICAgICApOiBGYWtlTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZnJvbVVybCA9IG5ldyBVUkwodGhpcy5jdXJyZW50RW50cnkudXJsISk7XG4gICAgY29uc3QgdG9VcmwgPSBuZXcgVVJMKHVybCwgdGhpcy5jdXJyZW50RW50cnkudXJsISk7XG5cbiAgICBsZXQgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nO1xuICAgIGlmICghb3B0aW9ucz8uaGlzdG9yeSB8fCBvcHRpb25zLmhpc3RvcnkgPT09ICdhdXRvJykge1xuICAgICAgLy8gQXV0byBkZWZhdWx0cyB0byBwdXNoLCBidXQgaWYgdGhlIFVSTHMgYXJlIHRoZSBzYW1lLCBpcyBhIHJlcGxhY2UuXG4gICAgICBpZiAoZnJvbVVybC50b1N0cmluZygpID09PSB0b1VybC50b1N0cmluZygpKSB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlID0gJ3JlcGxhY2UnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGUgPSAncHVzaCc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hdmlnYXRpb25UeXBlID0gb3B0aW9ucy5oaXN0b3J5O1xuICAgIH1cblxuICAgIGNvbnN0IGhhc2hDaGFuZ2UgPSBpc0hhc2hDaGFuZ2UoZnJvbVVybCwgdG9VcmwpO1xuXG4gICAgY29uc3QgZGVzdGluYXRpb24gPSBuZXcgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbih7XG4gICAgICB1cmw6IHRvVXJsLnRvU3RyaW5nKCksXG4gICAgICBzdGF0ZTogb3B0aW9ucz8uc3RhdGUsXG4gICAgICBzYW1lRG9jdW1lbnQ6IGhhc2hDaGFuZ2UsXG4gICAgICBoaXN0b3J5U3RhdGU6IG51bGwsXG4gICAgfSk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuXG4gICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICBuYXZpZ2F0aW9uVHlwZSxcbiAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAvLyBBbHdheXMgZmFsc2UgZm9yIG5hdmlnYXRlKCkuXG4gICAgICB1c2VySW5pdGlhdGVkOiBmYWxzZSxcbiAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICBpbmZvOiBvcHRpb25zPy5pbmZvLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZDogcmVzdWx0LmNvbW1pdHRlZCxcbiAgICAgIGZpbmlzaGVkOiByZXN1bHQuZmluaXNoZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBoaXN0b3J5LnB1c2hTdGF0ZSgpYC4gKi9cbiAgcHVzaFN0YXRlKGRhdGE6IHVua25vd24sIHRpdGxlOiBzdHJpbmcsIHVybD86IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHVzaE9yUmVwbGFjZVN0YXRlKCdwdXNoJywgZGF0YSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgaGlzdG9yeS5yZXBsYWNlU3RhdGUoKWAuICovXG4gIHJlcGxhY2VTdGF0ZShkYXRhOiB1bmtub3duLCB0aXRsZTogc3RyaW5nLCB1cmw/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hPclJlcGxhY2VTdGF0ZSgncmVwbGFjZScsIGRhdGEsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgcHJpdmF0ZSBwdXNoT3JSZXBsYWNlU3RhdGUoXG4gICAgICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmcsXG4gICAgICBkYXRhOiB1bmtub3duLFxuICAgICAgX3RpdGxlOiBzdHJpbmcsXG4gICAgICB1cmw/OiBzdHJpbmcsXG4gICAgICApOiB2b2lkIHtcbiAgICBjb25zdCBmcm9tVXJsID0gbmV3IFVSTCh0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcbiAgICBjb25zdCB0b1VybCA9IHVybCA/IG5ldyBVUkwodXJsLCB0aGlzLmN1cnJlbnRFbnRyeS51cmwhKSA6IGZyb21Vcmw7XG5cbiAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIHRvVXJsKTtcblxuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgdXJsOiB0b1VybC50b1N0cmluZygpLFxuICAgICAgc2FtZURvY3VtZW50OiB0cnVlLFxuICAgICAgaGlzdG9yeVN0YXRlOiBkYXRhLFxuICAgIH0pO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQoKTtcblxuICAgIHRoaXMudXNlckFnZW50TmF2aWdhdGUoZGVzdGluYXRpb24sIHJlc3VsdCwge1xuICAgICAgbmF2aWdhdGlvblR5cGUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgY2FuSW50ZXJjZXB0OiB0cnVlLFxuICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciBwdXNoU3RhdGUoKSBvciByZXBsYWNlU3RhdGUoKS5cbiAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgaGFzaENoYW5nZSxcbiAgICAgIHNraXBQb3BTdGF0ZTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLnRyYXZlcnNlVG8oKWAuICovXG4gIHRyYXZlcnNlVG8oa2V5OiBzdHJpbmcsIG9wdGlvbnM/OiBOYXZpZ2F0aW9uT3B0aW9ucyk6IEZha2VOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBmcm9tVXJsID0gbmV3IFVSTCh0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZmluZEVudHJ5KGtleSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgY29uc3QgZG9tRXhjZXB0aW9uID0gbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICAnSW52YWxpZCBrZXknLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGVudHJ5ID09PSB0aGlzLmN1cnJlbnRFbnRyeSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkOiBQcm9taXNlLnJlc29sdmUodGhpcy5jdXJyZW50RW50cnkpLFxuICAgICAgICBmaW5pc2hlZDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuY3VycmVudEVudHJ5KSxcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICh0aGlzLnRyYXZlcnNhbFF1ZXVlLmhhcyhlbnRyeS5rZXkpKSB7XG4gICAgICBjb25zdCBleGlzdGluZ1Jlc3VsdCA9IHRoaXMudHJhdmVyc2FsUXVldWUuZ2V0KGVudHJ5LmtleSkhO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkOiBleGlzdGluZ1Jlc3VsdC5jb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkOiBleGlzdGluZ1Jlc3VsdC5maW5pc2hlZCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCBuZXcgVVJMKGVudHJ5LnVybCEsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpKTtcbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgIHVybDogZW50cnkudXJsISxcbiAgICAgIHN0YXRlOiBlbnRyeS5nZXRTdGF0ZSgpLFxuICAgICAgaGlzdG9yeVN0YXRlOiBlbnRyeS5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgaWQ6IGVudHJ5LmlkLFxuICAgICAgaW5kZXg6IGVudHJ5LmluZGV4LFxuICAgICAgc2FtZURvY3VtZW50OiBlbnRyeS5zYW1lRG9jdW1lbnQsXG4gICAgfSk7XG4gICAgdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSBlbnRyeS5pbmRleDtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG4gICAgdGhpcy50cmF2ZXJzYWxRdWV1ZS5zZXQoZW50cnkua2V5LCByZXN1bHQpO1xuICAgIHRoaXMucnVuVHJhdmVyc2FsKCgpID0+IHtcbiAgICAgIHRoaXMudHJhdmVyc2FsUXVldWUuZGVsZXRlKGVudHJ5LmtleSk7XG4gICAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGU6ICd0cmF2ZXJzZScsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciB0cmF2ZXJzZVRvKCkuXG4gICAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgICBoYXNoQ2hhbmdlLFxuICAgICAgICBpbmZvOiBvcHRpb25zPy5pbmZvLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZDogcmVzdWx0LmNvbW1pdHRlZCxcbiAgICAgIGZpbmlzaGVkOiByZXN1bHQuZmluaXNoZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmJhY2soKWAuICovXG4gIGJhY2sob3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGlmICh0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID09PSAwKSB7XG4gICAgICBjb25zdCBkb21FeGNlcHRpb24gPSBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgICdDYW5ub3QgZ28gYmFjaycsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb21taXR0ZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29uc3QgZmluaXNoZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29tbWl0dGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIGZpbmlzaGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc0Fyclt0aGlzLmN1cnJlbnRFbnRyeUluZGV4IC0gMV07XG4gICAgcmV0dXJuIHRoaXMudHJhdmVyc2VUbyhlbnRyeS5rZXksIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uZm9yd2FyZCgpYC4gKi9cbiAgZm9yd2FyZChvcHRpb25zPzogTmF2aWdhdGlvbk9wdGlvbnMpOiBGYWtlTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgaWYgKHRoaXMuY3VycmVudEVudHJ5SW5kZXggPT09IHRoaXMuZW50cmllc0Fyci5sZW5ndGggLSAxKSB7XG4gICAgICBjb25zdCBkb21FeGNlcHRpb24gPSBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgICdDYW5ub3QgZ28gZm9yd2FyZCcsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb21taXR0ZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29uc3QgZmluaXNoZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29tbWl0dGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIGZpbmlzaGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc0Fyclt0aGlzLmN1cnJlbnRFbnRyeUluZGV4ICsgMV07XG4gICAgcmV0dXJuIHRoaXMudHJhdmVyc2VUbyhlbnRyeS5rZXksIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVxdWl2YWxlbnQgdG8gYGhpc3RvcnkuZ28oKWAuXG4gICAqIE5vdGUgdGhhdCB0aGlzIG1ldGhvZCBkb2VzIG5vdCBhY3R1YWxseSB3b3JrIHByZWNpc2VseSB0byBob3cgQ2hyb21lXG4gICAqIGRvZXMsIGluc3RlYWQgY2hvb3NpbmcgYSBzaW1wbGVyIG1vZGVsIHdpdGggbGVzcyB1bmV4cGVjdGVkIGJlaGF2aW9yLlxuICAgKiBDaHJvbWUgaGFzIGEgZmV3IGVkZ2UgY2FzZSBvcHRpbWl6YXRpb25zLCBmb3IgaW5zdGFuY2Ugd2l0aCByZXBlYXRlZFxuICAgKiBgYmFjaygpOyBmb3J3YXJkKClgIGNoYWlucyBpdCBjb2xsYXBzZXMgY2VydGFpbiB0cmF2ZXJzYWxzLlxuICAgKi9cbiAgZ28oZGlyZWN0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXRJbmRleCA9IHRoaXMucHJvc3BlY3RpdmVFbnRyeUluZGV4ICsgZGlyZWN0aW9uO1xuICAgIGlmICh0YXJnZXRJbmRleCA+PSB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIHx8IHRhcmdldEluZGV4IDwgMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCA9IHRhcmdldEluZGV4O1xuICAgIHRoaXMucnVuVHJhdmVyc2FsKCgpID0+IHtcbiAgICAgIC8vIENoZWNrIGFnYWluIHRoYXQgZGVzdGluYXRpb24gaXMgaW4gdGhlIGVudHJpZXMgYXJyYXkuXG4gICAgICBpZiAodGFyZ2V0SW5kZXggPj0gdGhpcy5lbnRyaWVzQXJyLmxlbmd0aCB8fCB0YXJnZXRJbmRleCA8IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZnJvbVVybCA9IG5ldyBVUkwodGhpcy5jdXJyZW50RW50cnkudXJsISk7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc0Fyclt0YXJnZXRJbmRleF07XG4gICAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIG5ldyBVUkwoZW50cnkudXJsISwgdGhpcy5jdXJyZW50RW50cnkudXJsISkpO1xuICAgICAgY29uc3QgZGVzdGluYXRpb24gPSBuZXcgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbih7XG4gICAgICAgIHVybDogZW50cnkudXJsISxcbiAgICAgICAgc3RhdGU6IGVudHJ5LmdldFN0YXRlKCksXG4gICAgICAgIGhpc3RvcnlTdGF0ZTogZW50cnkuZ2V0SGlzdG9yeVN0YXRlKCksXG4gICAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgICBpZDogZW50cnkuaWQsXG4gICAgICAgIGluZGV4OiBlbnRyeS5pbmRleCxcbiAgICAgICAgc2FtZURvY3VtZW50OiBlbnRyeS5zYW1lRG9jdW1lbnQsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQoKTtcbiAgICAgIHRoaXMudXNlckFnZW50TmF2aWdhdGUoZGVzdGluYXRpb24sIHJlc3VsdCwge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZTogJ3RyYXZlcnNlJyxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgY2FuSW50ZXJjZXB0OiB0cnVlLFxuICAgICAgICAvLyBBbHdheXMgZmFsc2UgZm9yIGdvKCkuXG4gICAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgICBoYXNoQ2hhbmdlLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogUnVucyBhIHRyYXZlcnNhbCBzeW5jaHJvbm91c2x5IG9yIGFzeW5jaHJvbm91c2x5ICovXG4gIHByaXZhdGUgcnVuVHJhdmVyc2FsKHRyYXZlcnNhbDogKCkgPT4gdm9pZCkge1xuICAgIGlmICh0aGlzLnN5bmNocm9ub3VzVHJhdmVyc2Fscykge1xuICAgICAgdHJhdmVyc2FsKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRWFjaCB0cmF2ZXJzYWwgb2NjdXBpZXMgYSBzaW5nbGUgdGltZW91dCByZXNvbHV0aW9uLlxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBQcm9taXNlcyBhZGRlZCB0byBjb21taXQgYW5kIGZpbmlzaCBzaG91bGQgcmVzb2x2ZVxuICAgIC8vIGJlZm9yZSB0aGUgbmV4dCB0cmF2ZXJzYWwuXG4gICAgdGhpcy5uZXh0VHJhdmVyc2FsID0gdGhpcy5uZXh0VHJhdmVyc2FsLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB0cmF2ZXJzYWwoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmFkZEV2ZW50TGlzdGVuZXIoKWAuICovXG4gIGFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICB0eXBlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCxcbiAgICAgIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9uc3xib29sZWFuLFxuICApIHtcbiAgICB0aGlzLmV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24ucmVtb3ZlRXZlbnRMaXN0ZW5lcigpYC4gKi9cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIHR5cGU6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LFxuICAgICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zfGJvb2xlYW4sXG4gICkge1xuICAgIHRoaXMuZXZlbnRUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5kaXNwYXRjaEV2ZW50KClgICovXG4gIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZXZlbnRUYXJnZXQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gIH1cblxuICAvKiogQ2xlYW5zIHVwIHJlc291cmNlcy4gKi9cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBSZWNyZWF0ZSBldmVudFRhcmdldCB0byByZWxlYXNlIGN1cnJlbnQgbGlzdGVuZXJzLlxuICAgIC8vIGBkb2N1bWVudC5jcmVhdGVFbGVtZW50YCBiZWNhdXNlIE5vZGVKUyBgRXZlbnRUYXJnZXRgIGlzIGluY29tcGF0aWJsZSB3aXRoIERvbWlubydzIGBFdmVudGAuXG4gICAgdGhpcy5ldmVudFRhcmdldCA9IHRoaXMud2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZGlzcG9zZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciB0aGlzIGZha2UgaXMgZGlzcG9zZWQuICovXG4gIGlzRGlzcG9zZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcG9zZWQ7XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gZm9yIGFsbCBuYXZpZ2F0aW9ucyBhbmQgdHJhdmVyc2Fscy4gKi9cbiAgcHJpdmF0ZSB1c2VyQWdlbnROYXZpZ2F0ZShcbiAgICAgIGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uLFxuICAgICAgcmVzdWx0OiBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQsXG4gICAgICBvcHRpb25zOiBJbnRlcm5hbE5hdmlnYXRlT3B0aW9ucyxcbiAgKSB7XG4gICAgLy8gVGhlIGZpcnN0IG5hdmlnYXRpb24gc2hvdWxkIGRpc2FsbG93IGFueSBmdXR1cmUgY2FsbHMgdG8gc2V0IHRoZSBpbml0aWFsXG4gICAgLy8gZW50cnkuXG4gICAgdGhpcy5jYW5TZXRJbml0aWFsRW50cnkgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5uYXZpZ2F0ZUV2ZW50KSB7XG4gICAgICB0aGlzLm5hdmlnYXRlRXZlbnQuY2FuY2VsKFxuICAgICAgICAgIG5ldyBET01FeGNlcHRpb24oJ05hdmlnYXRpb24gd2FzIGFib3J0ZWQnLCAnQWJvcnRFcnJvcicpLFxuICAgICAgKTtcbiAgICAgIHRoaXMubmF2aWdhdGVFdmVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBuYXZpZ2F0ZUV2ZW50ID0gY3JlYXRlRmFrZU5hdmlnYXRlRXZlbnQoe1xuICAgICAgbmF2aWdhdGlvblR5cGU6IG9wdGlvbnMubmF2aWdhdGlvblR5cGUsXG4gICAgICBjYW5jZWxhYmxlOiBvcHRpb25zLmNhbmNlbGFibGUsXG4gICAgICBjYW5JbnRlcmNlcHQ6IG9wdGlvbnMuY2FuSW50ZXJjZXB0LFxuICAgICAgdXNlckluaXRpYXRlZDogb3B0aW9ucy51c2VySW5pdGlhdGVkLFxuICAgICAgaGFzaENoYW5nZTogb3B0aW9ucy5oYXNoQ2hhbmdlLFxuICAgICAgc2lnbmFsOiByZXN1bHQuc2lnbmFsLFxuICAgICAgZGVzdGluYXRpb24sXG4gICAgICBpbmZvOiBvcHRpb25zLmluZm8sXG4gICAgICBzYW1lRG9jdW1lbnQ6IGRlc3RpbmF0aW9uLnNhbWVEb2N1bWVudCxcbiAgICAgIHNraXBQb3BTdGF0ZTogb3B0aW9ucy5za2lwUG9wU3RhdGUsXG4gICAgICByZXN1bHQsXG4gICAgICB1c2VyQWdlbnRDb21taXQ6ICgpID0+IHtcbiAgICAgICAgdGhpcy51c2VyQWdlbnRDb21taXQoKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLm5hdmlnYXRlRXZlbnQgPSBuYXZpZ2F0ZUV2ZW50O1xuICAgIHRoaXMuZXZlbnRUYXJnZXQuZGlzcGF0Y2hFdmVudChuYXZpZ2F0ZUV2ZW50KTtcbiAgICBuYXZpZ2F0ZUV2ZW50LmRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50KCk7XG4gICAgaWYgKG5hdmlnYXRlRXZlbnQuY29tbWl0T3B0aW9uID09PSAnaW1tZWRpYXRlJykge1xuICAgICAgbmF2aWdhdGVFdmVudC5jb21taXQoLyogaW50ZXJuYWw9ICovIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiB0byBjb21taXQgYSBuYXZpZ2F0aW9uLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudENvbW1pdCgpIHtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmcm9tID0gdGhpcy5jdXJyZW50RW50cnk7XG4gICAgaWYgKCF0aGlzLm5hdmlnYXRlRXZlbnQuc2FtZURvY3VtZW50KSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignQ2Fubm90IG5hdmlnYXRlIHRvIGEgbm9uLXNhbWUtZG9jdW1lbnQgVVJMLicpO1xuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50LmNhbmNlbChlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgaWYgKHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSA9PT0gJ3B1c2gnIHx8XG4gICAgICAgIHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSA9PT0gJ3JlcGxhY2UnKSB7XG4gICAgICB0aGlzLnVzZXJBZ2VudFB1c2hPclJlcGxhY2UodGhpcy5uYXZpZ2F0ZUV2ZW50LmRlc3RpbmF0aW9uLCB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlOiB0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGUsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSA9PT0gJ3RyYXZlcnNlJykge1xuICAgICAgdGhpcy51c2VyQWdlbnRUcmF2ZXJzZSh0aGlzLm5hdmlnYXRlRXZlbnQuZGVzdGluYXRpb24pO1xuICAgIH1cbiAgICB0aGlzLm5hdmlnYXRlRXZlbnQudXNlckFnZW50TmF2aWdhdGVkKHRoaXMuY3VycmVudEVudHJ5KTtcbiAgICBjb25zdCBjdXJyZW50RW50cnlDaGFuZ2VFdmVudCA9IGNyZWF0ZUZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQoXG4gICAgICAgIHtmcm9tLCBuYXZpZ2F0aW9uVHlwZTogdGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlfSxcbiAgICApO1xuICAgIHRoaXMuZXZlbnRUYXJnZXQuZGlzcGF0Y2hFdmVudChjdXJyZW50RW50cnlDaGFuZ2VFdmVudCk7XG4gICAgaWYgKCF0aGlzLm5hdmlnYXRlRXZlbnQuc2tpcFBvcFN0YXRlKSB7XG4gICAgICBjb25zdCBwb3BTdGF0ZUV2ZW50ID0gY3JlYXRlUG9wU3RhdGVFdmVudCh7XG4gICAgICAgIHN0YXRlOiB0aGlzLm5hdmlnYXRlRXZlbnQuZGVzdGluYXRpb24uZ2V0SGlzdG9yeVN0YXRlKCksXG4gICAgICB9KTtcbiAgICAgIHRoaXMud2luZG93LmRpc3BhdGNoRXZlbnQocG9wU3RhdGVFdmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEltcGxlbWVudGF0aW9uIGZvciBhIHB1c2ggb3IgcmVwbGFjZSBuYXZpZ2F0aW9uLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudFB1c2hPclJlcGxhY2UoXG4gICAgICBkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbixcbiAgICAgIHtuYXZpZ2F0aW9uVHlwZX06IHtuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmd9LFxuICApIHtcbiAgICBpZiAobmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJykge1xuICAgICAgdGhpcy5jdXJyZW50RW50cnlJbmRleCsrO1xuICAgICAgdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSB0aGlzLmN1cnJlbnRFbnRyeUluZGV4O1xuICAgIH1cbiAgICBjb25zdCBpbmRleCA9IHRoaXMuY3VycmVudEVudHJ5SW5kZXg7XG4gICAgY29uc3Qga2V5ID0gbmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJyA/IFN0cmluZyh0aGlzLm5leHRLZXkrKykgOiB0aGlzLmN1cnJlbnRFbnRyeS5rZXk7XG4gICAgY29uc3QgZW50cnkgPSBuZXcgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkoZGVzdGluYXRpb24udXJsLCB7XG4gICAgICBpZDogU3RyaW5nKHRoaXMubmV4dElkKyspLFxuICAgICAga2V5LFxuICAgICAgaW5kZXgsXG4gICAgICBzYW1lRG9jdW1lbnQ6IHRydWUsXG4gICAgICBzdGF0ZTogZGVzdGluYXRpb24uZ2V0U3RhdGUoKSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogZGVzdGluYXRpb24uZ2V0SGlzdG9yeVN0YXRlKCksXG4gICAgfSk7XG4gICAgaWYgKG5hdmlnYXRpb25UeXBlID09PSAncHVzaCcpIHtcbiAgICAgIHRoaXMuZW50cmllc0Fyci5zcGxpY2UoaW5kZXgsIEluZmluaXR5LCBlbnRyeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW50cmllc0FycltpbmRleF0gPSBlbnRyeTtcbiAgICB9XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gZm9yIGEgdHJhdmVyc2UgbmF2aWdhdGlvbi4gKi9cbiAgcHJpdmF0ZSB1c2VyQWdlbnRUcmF2ZXJzZShkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbikge1xuICAgIHRoaXMuY3VycmVudEVudHJ5SW5kZXggPSBkZXN0aW5hdGlvbi5pbmRleDtcbiAgfVxuXG4gIC8qKiBVdGlsaXR5IG1ldGhvZCBmb3IgZmluZGluZyBlbnRyaWVzIHdpdGggdGhlIGdpdmVuIGBrZXlgLiAqL1xuICBwcml2YXRlIGZpbmRFbnRyeShrZXk6IHN0cmluZykge1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5lbnRyaWVzQXJyKSB7XG4gICAgICBpZiAoZW50cnkua2V5ID09PSBrZXkpIHJldHVybiBlbnRyeTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHNldCBvbm5hdmlnYXRlKF9oYW5kbGVyOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0ZUV2ZW50KSA9PiBhbnkpfG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBvbm5hdmlnYXRlKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRlRXZlbnQpID0+IGFueSl8bnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzZXQgb25jdXJyZW50ZW50cnljaGFuZ2UoX2hhbmRsZXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KSA9PiBhbnkpfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9uY3VycmVudGVudHJ5Y2hhbmdlKCk6XG4gICAgICAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQpID0+IGFueSl8bnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzZXQgb25uYXZpZ2F0ZXN1Y2Nlc3MoX2hhbmRsZXI6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpfG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBvbm5hdmlnYXRlc3VjY2VzcygpOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBFdmVudCkgPT4gYW55KXxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbm5hdmlnYXRlZXJyb3IoX2hhbmRsZXI6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEVycm9yRXZlbnQpID0+IGFueSl8bnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGVlcnJvcigpOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBFcnJvckV2ZW50KSA9PiBhbnkpfG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IHRyYW5zaXRpb24oKTogTmF2aWdhdGlvblRyYW5zaXRpb258bnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICB1cGRhdGVDdXJyZW50RW50cnkoX29wdGlvbnM6IE5hdmlnYXRpb25VcGRhdGVDdXJyZW50RW50cnlPcHRpb25zKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZWxvYWQoX29wdGlvbnM/OiBOYXZpZ2F0aW9uUmVsb2FkT3B0aW9ucyk6IE5hdmlnYXRpb25SZXN1bHQge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRmFrZSBlcXVpdmFsZW50IG9mIHRoZSBgTmF2aWdhdGlvblJlc3VsdGAgaW50ZXJmYWNlIHdpdGhcbiAqIGBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeWAuXG4gKi9cbmludGVyZmFjZSBGYWtlTmF2aWdhdGlvblJlc3VsdCBleHRlbmRzIE5hdmlnYXRpb25SZXN1bHQge1xuICByZWFkb25seSBjb21taXR0ZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xuICByZWFkb25seSBmaW5pc2hlZDogUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT47XG59XG5cbi8qKlxuICogRmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5YC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5IGltcGxlbWVudHMgTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSB7XG4gIHJlYWRvbmx5IHNhbWVEb2N1bWVudDtcblxuICByZWFkb25seSBpZDogc3RyaW5nO1xuICByZWFkb25seSBrZXk6IHN0cmluZztcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBzdGF0ZTogdW5rbm93bjtcbiAgcHJpdmF0ZSByZWFkb25seSBoaXN0b3J5U3RhdGU6IHVua25vd247XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICBvbmRpc3Bvc2U6ICgodGhpczogTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSwgZXY6IEV2ZW50KSA9PiBhbnkpfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgdXJsOiBzdHJpbmd8bnVsbCxcbiAgICAgIHtcbiAgICAgICAgaWQsXG4gICAgICAgIGtleSxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIHNhbWVEb2N1bWVudCxcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIGhpc3RvcnlTdGF0ZSxcbiAgICAgIH06IHtcbiAgICAgICAgaWQ6IHN0cmluZzsga2V5OiBzdHJpbmc7IGluZGV4OiBudW1iZXI7IHNhbWVEb2N1bWVudDogYm9vbGVhbjsgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuICAgICAgICBzdGF0ZT86IHVua25vd247XG4gICAgICB9LFxuICApIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuc2FtZURvY3VtZW50ID0gc2FtZURvY3VtZW50O1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLmhpc3RvcnlTdGF0ZSA9IGhpc3RvcnlTdGF0ZTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIC8vIEJ1ZGdldCBjb3B5LlxuICAgIHJldHVybiB0aGlzLnN0YXRlID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlKSkgOiB0aGlzLnN0YXRlO1xuICB9XG5cbiAgZ2V0SGlzdG9yeVN0YXRlKCk6IHVua25vd24ge1xuICAgIC8vIEJ1ZGdldCBjb3B5LlxuICAgIHJldHVybiB0aGlzLmhpc3RvcnlTdGF0ZSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5oaXN0b3J5U3RhdGUpKSA6IHRoaXMuaGlzdG9yeVN0YXRlO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIHR5cGU6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LFxuICAgICAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zfGJvb2xlYW4sXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIHR5cGU6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LFxuICAgICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zfGJvb2xlYW4sXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZGlzcGF0Y2hFdmVudChldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG4vKiogYE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zYCB3aXRoIGV4cGVyaW1lbnRhbCBjb21taXQgb3B0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBlcmltZW50YWxOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyBleHRlbmRzIE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zIHtcbiAgY29tbWl0PzogJ2ltbWVkaWF0ZSd8J2FmdGVyLXRyYW5zaXRpb24nO1xufVxuXG4vKiogYE5hdmlnYXRlRXZlbnRgIHdpdGggZXhwZXJpbWVudGFsIGNvbW1pdCBmdW5jdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwZXJpbWVudGFsTmF2aWdhdGVFdmVudCBleHRlbmRzIE5hdmlnYXRlRXZlbnQge1xuICBpbnRlcmNlcHQob3B0aW9ucz86IEV4cGVyaW1lbnRhbE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zKTogdm9pZDtcblxuICBjb21taXQoKTogdm9pZDtcbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRlRXZlbnRgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZha2VOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgRXhwZXJpbWVudGFsTmF2aWdhdGVFdmVudCB7XG4gIHJlYWRvbmx5IGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uO1xufVxuXG5pbnRlcmZhY2UgSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCBleHRlbmRzIEZha2VOYXZpZ2F0ZUV2ZW50IHtcbiAgcmVhZG9ubHkgc2FtZURvY3VtZW50OiBib29sZWFuO1xuICByZWFkb25seSBza2lwUG9wU3RhdGU/OiBib29sZWFuO1xuICByZWFkb25seSBjb21taXRPcHRpb246ICdhZnRlci10cmFuc2l0aW9uJ3wnaW1tZWRpYXRlJztcbiAgcmVhZG9ubHkgcmVzdWx0OiBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQ7XG5cbiAgY29tbWl0KGludGVybmFsPzogYm9vbGVhbik6IHZvaWQ7XG4gIGNhbmNlbChyZWFzb246IEVycm9yKTogdm9pZDtcbiAgZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQoKTogdm9pZDtcbiAgdXNlckFnZW50TmF2aWdhdGVkKGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSk6IHZvaWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0ZUV2ZW50YC4gVGhpcyBpcyBub3QgYSBjbGFzcyBiZWNhdXNlIEVTNVxuICogdHJhbnNwaWxlZCBKYXZhU2NyaXB0IGNhbm5vdCBleHRlbmQgbmF0aXZlIEV2ZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVGYWtlTmF2aWdhdGVFdmVudCh7XG4gIGNhbmNlbGFibGUsXG4gIGNhbkludGVyY2VwdCxcbiAgdXNlckluaXRpYXRlZCxcbiAgaGFzaENoYW5nZSxcbiAgbmF2aWdhdGlvblR5cGUsXG4gIHNpZ25hbCxcbiAgZGVzdGluYXRpb24sXG4gIGluZm8sXG4gIHNhbWVEb2N1bWVudCxcbiAgc2tpcFBvcFN0YXRlLFxuICByZXN1bHQsXG4gIHVzZXJBZ2VudENvbW1pdCxcbn06IHtcbiAgY2FuY2VsYWJsZTogYm9vbGVhbjsgY2FuSW50ZXJjZXB0OiBib29sZWFuOyB1c2VySW5pdGlhdGVkOiBib29sZWFuOyBoYXNoQ2hhbmdlOiBib29sZWFuO1xuICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG4gIHNpZ25hbDogQWJvcnRTaWduYWw7XG4gIGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uO1xuICBpbmZvOiB1bmtub3duO1xuICBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47XG4gIHNraXBQb3BTdGF0ZT86IGJvb2xlYW47IHJlc3VsdDogSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0OyB1c2VyQWdlbnRDb21taXQ6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCduYXZpZ2F0ZScsIHtidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZX0pIGFzIHtcbiAgICAtcmVhZG9ubHlbUCBpbiBrZXlvZiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50XTogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudFtQXTtcbiAgfTtcbiAgZXZlbnQuY2FuSW50ZXJjZXB0ID0gY2FuSW50ZXJjZXB0O1xuICBldmVudC51c2VySW5pdGlhdGVkID0gdXNlckluaXRpYXRlZDtcbiAgZXZlbnQuaGFzaENoYW5nZSA9IGhhc2hDaGFuZ2U7XG4gIGV2ZW50Lm5hdmlnYXRpb25UeXBlID0gbmF2aWdhdGlvblR5cGU7XG4gIGV2ZW50LnNpZ25hbCA9IHNpZ25hbDtcbiAgZXZlbnQuZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbjtcbiAgZXZlbnQuaW5mbyA9IGluZm87XG4gIGV2ZW50LmRvd25sb2FkUmVxdWVzdCA9IG51bGw7XG4gIGV2ZW50LmZvcm1EYXRhID0gbnVsbDtcblxuICBldmVudC5zYW1lRG9jdW1lbnQgPSBzYW1lRG9jdW1lbnQ7XG4gIGV2ZW50LnNraXBQb3BTdGF0ZSA9IHNraXBQb3BTdGF0ZTtcbiAgZXZlbnQuY29tbWl0T3B0aW9uID0gJ2ltbWVkaWF0ZSc7XG5cbiAgbGV0IGhhbmRsZXJGaW5pc2hlZDogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBpbnRlcmNlcHRDYWxsZWQgPSBmYWxzZTtcbiAgbGV0IGRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50ID0gZmFsc2U7XG4gIGxldCBjb21taXRDYWxsZWQgPSBmYWxzZTtcblxuICBldmVudC5pbnRlcmNlcHQgPSBmdW5jdGlvbihcbiAgICAgIHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsXG4gICAgICBvcHRpb25zPzogRXhwZXJpbWVudGFsTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMsXG4gICAgICApOiB2b2lkIHtcbiAgICBpbnRlcmNlcHRDYWxsZWQgPSB0cnVlO1xuICAgIGV2ZW50LnNhbWVEb2N1bWVudCA9IHRydWU7XG4gICAgY29uc3QgaGFuZGxlciA9IG9wdGlvbnM/LmhhbmRsZXI7XG4gICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXJGaW5pc2hlZCA9IGhhbmRsZXIoKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LmNvbW1pdCkge1xuICAgICAgZXZlbnQuY29tbWl0T3B0aW9uID0gb3B0aW9ucy5jb21taXQ7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5mb2N1c1Jlc2V0ICE9PSB1bmRlZmluZWQgfHwgb3B0aW9ucz8uc2Nyb2xsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICAgIH1cbiAgfTtcblxuICBldmVudC5zY3JvbGwgPSBmdW5jdGlvbih0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50KTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH07XG5cbiAgZXZlbnQuY29tbWl0ID0gZnVuY3Rpb24odGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCwgaW50ZXJuYWwgPSBmYWxzZSkge1xuICAgIGlmICghaW50ZXJuYWwgJiYgIWludGVyY2VwdENhbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ2NvbW1pdCcgb24gJ05hdmlnYXRlRXZlbnQnOiBpbnRlcmNlcHQoKSBtdXN0IGJlIGAgK1xuICAgICAgICAgICAgICBgY2FsbGVkIGJlZm9yZSBjb21taXQoKS5gLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIWRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgIGBGYWlsZWQgdG8gZXhlY3V0ZSAnY29tbWl0JyBvbiAnTmF2aWdhdGVFdmVudCc6IGNvbW1pdCgpIG1heSBub3QgYmUgYCArXG4gICAgICAgICAgICAgIGBjYWxsZWQgZHVyaW5nIGV2ZW50IGRpc3BhdGNoLmAsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChjb21taXRDYWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgYEZhaWxlZCB0byBleGVjdXRlICdjb21taXQnIG9uICdOYXZpZ2F0ZUV2ZW50JzogY29tbWl0KCkgYWxyZWFkeSBgICtcbiAgICAgICAgICAgICAgYGNhbGxlZC5gLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgIH1cbiAgICBjb21taXRDYWxsZWQgPSB0cnVlO1xuXG4gICAgdXNlckFnZW50Q29tbWl0KCk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgb25seS5cbiAgZXZlbnQuY2FuY2VsID0gZnVuY3Rpb24odGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCwgcmVhc29uOiBFcnJvcikge1xuICAgIHJlc3VsdC5jb21taXR0ZWRSZWplY3QocmVhc29uKTtcbiAgICByZXN1bHQuZmluaXNoZWRSZWplY3QocmVhc29uKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBvbmx5LlxuICBldmVudC5kaXNwYXRjaGVkTmF2aWdhdGVFdmVudCA9IGZ1bmN0aW9uKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQpIHtcbiAgICBkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCA9IHRydWU7XG4gICAgaWYgKGV2ZW50LmNvbW1pdE9wdGlvbiA9PT0gJ2FmdGVyLXRyYW5zaXRpb24nKSB7XG4gICAgICAvLyBJZiBoYW5kbGVyIGZpbmlzaGVzIGJlZm9yZSBjb21taXQsIGNhbGwgY29tbWl0LlxuICAgICAgaGFuZGxlckZpbmlzaGVkPy50aGVuKFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGlmICghY29tbWl0Q2FsbGVkKSB7XG4gICAgICAgICAgICAgIGV2ZW50LmNvbW1pdCgvKiBpbnRlcm5hbCAqLyB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICgpID0+IHt9LFxuICAgICAgKTtcbiAgICB9XG4gICAgUHJvbWlzZS5hbGwoW3Jlc3VsdC5jb21taXR0ZWQsIGhhbmRsZXJGaW5pc2hlZF0pXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKFtlbnRyeV0pID0+IHtcbiAgICAgICAgICAgICAgcmVzdWx0LmZpbmlzaGVkUmVzb2x2ZShlbnRyeSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICByZXN1bHQuZmluaXNoZWRSZWplY3QocmVhc29uKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgb25seS5cbiAgZXZlbnQudXNlckFnZW50TmF2aWdhdGVkID0gZnVuY3Rpb24oXG4gICAgICB0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LFxuICAgICAgZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5LFxuICApIHtcbiAgICByZXN1bHQuY29tbWl0dGVkUmVzb2x2ZShlbnRyeSk7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50IGFzIEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQ7XG59XG5cbi8qKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudGAuICovXG5leHBvcnQgaW50ZXJmYWNlIEZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQgZXh0ZW5kcyBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQge1xuICByZWFkb25seSBmcm9tOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VgLiBUaGlzIGRvZXMgbm90IHVzZVxuICogYSBjbGFzcyBiZWNhdXNlIEVTNSB0cmFuc3BpbGVkIEphdmFTY3JpcHQgY2Fubm90IGV4dGVuZCBuYXRpdmUgRXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQoe1xuICBmcm9tLFxuICBuYXZpZ2F0aW9uVHlwZSxcbn06IHtmcm9tOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeTsgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nO30pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2N1cnJlbnRlbnRyeWNoYW5nZScsIHtcbiAgICAgICAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSkgYXMge1xuICAgIC1yZWFkb25seVtQIGluIGtleW9mIE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudF06IE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudFtQXTtcbiAgfTtcbiAgZXZlbnQuZnJvbSA9IGZyb207XG4gIGV2ZW50Lm5hdmlnYXRpb25UeXBlID0gbmF2aWdhdGlvblR5cGU7XG4gIHJldHVybiBldmVudCBhcyBGYWtlTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGZha2UgZXF1aXZhbGVudCBvZiBgUG9wU3RhdGVFdmVudGAuIFRoaXMgZG9lcyBub3QgdXNlIGEgY2xhc3NcbiAqIGJlY2F1c2UgRVM1IHRyYW5zcGlsZWQgSmF2YVNjcmlwdCBjYW5ub3QgZXh0ZW5kIG5hdGl2ZSBFdmVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUG9wU3RhdGVFdmVudCh7c3RhdGV9OiB7c3RhdGU6IHVua25vd259KSB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCdwb3BzdGF0ZScsIHtcbiAgICAgICAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSkgYXMgey1yZWFkb25seVtQIGluIGtleW9mIFBvcFN0YXRlRXZlbnRdOiBQb3BTdGF0ZUV2ZW50W1BdfTtcbiAgZXZlbnQuc3RhdGUgPSBzdGF0ZTtcbiAgcmV0dXJuIGV2ZW50IGFzIFBvcFN0YXRlRXZlbnQ7XG59XG5cbi8qKlxuICogRmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uRGVzdGluYXRpb25gLlxuICovXG5leHBvcnQgY2xhc3MgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbiBpbXBsZW1lbnRzIE5hdmlnYXRpb25EZXN0aW5hdGlvbiB7XG4gIHJlYWRvbmx5IHVybDogc3RyaW5nO1xuICByZWFkb25seSBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGtleTogc3RyaW5nfG51bGw7XG4gIHJlYWRvbmx5IGlkOiBzdHJpbmd8bnVsbDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcblxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlPzogdW5rbm93bjtcbiAgcHJpdmF0ZSByZWFkb25seSBoaXN0b3J5U3RhdGU6IHVua25vd247XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHVybCxcbiAgICBzYW1lRG9jdW1lbnQsXG4gICAgaGlzdG9yeVN0YXRlLFxuICAgIHN0YXRlLFxuICAgIGtleSA9IG51bGwsXG4gICAgaWQgPSBudWxsLFxuICAgIGluZGV4ID0gLTEsXG4gIH06IHtcbiAgICB1cmw6IHN0cmluZzsgc2FtZURvY3VtZW50OiBib29sZWFuOyBoaXN0b3J5U3RhdGU6IHVua25vd247XG4gICAgc3RhdGU/OiB1bmtub3duO1xuICAgIGtleT86IHN0cmluZyB8IG51bGw7XG4gICAgaWQ/OiBzdHJpbmcgfCBudWxsO1xuICAgIGluZGV4PzogbnVtYmVyO1xuICB9KSB7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gICAgdGhpcy5zYW1lRG9jdW1lbnQgPSBzYW1lRG9jdW1lbnQ7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuaGlzdG9yeVN0YXRlID0gaGlzdG9yeVN0YXRlO1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbiAgfVxuXG4gIGdldEhpc3RvcnlTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5U3RhdGU7XG4gIH1cbn1cblxuLyoqIFV0aWxpdHkgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIFVybExpa2UgaGF2ZSB0aGUgc2FtZSBoYXNoLiAqL1xuZnVuY3Rpb24gaXNIYXNoQ2hhbmdlKGZyb206IFVSTCwgdG86IFVSTCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICAgdG8uaGFzaCAhPT0gZnJvbS5oYXNoICYmIHRvLmhvc3RuYW1lID09PSBmcm9tLmhvc3RuYW1lICYmIHRvLnBhdGhuYW1lID09PSBmcm9tLnBhdGhuYW1lICYmXG4gICAgICB0by5zZWFyY2ggPT09IGZyb20uc2VhcmNoKTtcbn1cblxuLyoqIEludGVybmFsIHV0aWxpdHkgY2xhc3MgZm9yIHJlcHJlc2VudGluZyB0aGUgcmVzdWx0IG9mIGEgbmF2aWdhdGlvbi4gICovXG5jbGFzcyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQge1xuICBjb21taXR0ZWRSZXNvbHZlITogKGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSkgPT4gdm9pZDtcbiAgY29tbWl0dGVkUmVqZWN0ITogKHJlYXNvbjogRXJyb3IpID0+IHZvaWQ7XG4gIGZpbmlzaGVkUmVzb2x2ZSE6IChlbnRyeTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkpID0+IHZvaWQ7XG4gIGZpbmlzaGVkUmVqZWN0ITogKHJlYXNvbjogRXJyb3IpID0+IHZvaWQ7XG4gIHJlYWRvbmx5IGNvbW1pdHRlZDogUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT47XG4gIHJlYWRvbmx5IGZpbmlzaGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PjtcbiAgZ2V0IHNpZ25hbCgpOiBBYm9ydFNpZ25hbCB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgfVxuICBwcml2YXRlIHJlYWRvbmx5IGFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbW1pdHRlZCA9IG5ldyBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PihcbiAgICAgICAgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29tbWl0dGVkUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgdGhpcy5jb21taXR0ZWRSZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0sXG4gICAgKTtcblxuICAgIHRoaXMuZmluaXNoZWQgPSBuZXcgUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT4oXG4gICAgICAgIGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICB0aGlzLmZpbmlzaGVkUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgdGhpcy5maW5pc2hlZFJlamVjdCA9IChyZWFzb246IEVycm9yKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgICAgICAgIHRoaXMuYWJvcnRDb250cm9sbGVyLmFib3J0KHJlYXNvbik7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICApO1xuICAgIC8vIEFsbCByZWplY3Rpb25zIGFyZSBoYW5kbGVkLlxuICAgIHRoaXMuY29tbWl0dGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICB0aGlzLmZpbmlzaGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgb3B0aW9ucyBmb3IgcGVyZm9ybWluZyBhIG5hdmlnYXRlLiAqL1xuaW50ZXJmYWNlIEludGVybmFsTmF2aWdhdGVPcHRpb25zIHtcbiAgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nO1xuICBjYW5jZWxhYmxlOiBib29sZWFuO1xuICBjYW5JbnRlcmNlcHQ6IGJvb2xlYW47XG4gIHVzZXJJbml0aWF0ZWQ6IGJvb2xlYW47XG4gIGhhc2hDaGFuZ2U6IGJvb2xlYW47XG4gIGluZm8/OiB1bmtub3duO1xuICBza2lwUG9wU3RhdGU/OiBib29sZWFuO1xufVxuIl19