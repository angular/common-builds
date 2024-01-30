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
            throw new Error('setInitialEntryForTesting can only be called before any ' + 'navigation has occurred');
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
        const currentEntryChangeEvent = createFakeNavigationCurrentEntryChangeEvent({
            from,
            navigationType: this.navigateEvent.navigationType,
        });
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
            throw new DOMException(`Failed to execute 'commit' on 'NavigateEvent': commit() already ` + `called.`, 'InvalidStateError');
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
        Promise.all([result.committed, handlerFinished]).then(([entry]) => {
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
    return (to.hash !== from.hash &&
        to.hostname === from.hostname &&
        to.pathname === from.pathname &&
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3Rlc3Rpbmcvc3JjL25hdmlnYXRpb24vZmFrZV9uYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILHdFQUF3RTtBQUN4RSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBRS9COzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQXdEekIsK0NBQStDO0lBQy9DLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELFlBQ21CLE1BQWMsRUFDL0IsUUFBeUI7UUFEUixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBckVqQzs7O1dBR0c7UUFDYyxlQUFVLEdBQWlDLEVBQUUsQ0FBQztRQUUvRDs7V0FFRztRQUNLLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUU5Qjs7V0FFRztRQUNLLGtCQUFhLEdBQTBDLFNBQVMsQ0FBQztRQUV6RTs7O1dBR0c7UUFDYyxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1FBRTlFOzs7V0FHRztRQUNLLGtCQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTFDOzs7V0FHRztRQUNLLDBCQUFxQixHQUFHLENBQUMsQ0FBQztRQUVsQzs7O1dBR0c7UUFDSywwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFF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SSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFByZXZlbnRzIGRlbGV0aW9uIG9mIGBFdmVudGAgZnJvbSBgZ2xvYmFsVGhpc2AgZHVyaW5nIG1vZHVsZSBsb2FkaW5nLlxuY29uc3QgRXZlbnQgPSBnbG9iYWxUaGlzLkV2ZW50O1xuXG4vKipcbiAqIEZha2UgaW1wbGVtZW50YXRpb24gb2YgdXNlciBhZ2VudCBoaXN0b3J5IGFuZCBuYXZpZ2F0aW9uIGJlaGF2aW9yLiBUaGlzIGlzIGFcbiAqIGhpZ2gtZmlkZWxpdHkgaW1wbGVtZW50YXRpb24gb2YgYnJvd3NlciBiZWhhdmlvciB0aGF0IGF0dGVtcHRzIHRvIGVtdWxhdGVcbiAqIHRoaW5ncyBsaWtlIHRyYXZlcnNhbCBkZWxheS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZha2VOYXZpZ2F0aW9uIGltcGxlbWVudHMgTmF2aWdhdGlvbiB7XG4gIC8qKlxuICAgKiBUaGUgZmFrZSBpbXBsZW1lbnRhdGlvbiBvZiBhbiBlbnRyaWVzIGFycmF5LiBPbmx5IHNhbWUtZG9jdW1lbnQgZW50cmllc1xuICAgKiBhbGxvd2VkLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBlbnRyaWVzQXJyOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeVtdID0gW107XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGFjdGl2ZSBlbnRyeSBpbmRleCBpbnRvIGBlbnRyaWVzQXJyYC5cbiAgICovXG4gIHByaXZhdGUgY3VycmVudEVudHJ5SW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBuYXZpZ2F0ZSBldmVudC5cbiAgICovXG4gIHByaXZhdGUgbmF2aWdhdGVFdmVudDogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQSBNYXAgb2YgcGVuZGluZyB0cmF2ZXJzYWxzLCBzbyB0aGF0IHRyYXZlcnNhbHMgdG8gdGhlIHNhbWUgZW50cnkgY2FuIGJlXG4gICAqIHJlLXVzZWQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHRyYXZlcnNhbFF1ZXVlID0gbmV3IE1hcDxzdHJpbmcsIEludGVybmFsTmF2aWdhdGlvblJlc3VsdD4oKTtcblxuICAvKipcbiAgICogQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgcHJldmlvdXMgdHJhdmVyc2FscyBoYXZlIGZpbmlzaGVkLiBVc2VkIHRvXG4gICAqIHNpbXVsYXRlIHRoZSBjcm9zcy1wcm9jZXNzIGNvbW11bmljYXRpb24gbmVjZXNzYXJ5IGZvciB0cmF2ZXJzYWxzLlxuICAgKi9cbiAgcHJpdmF0ZSBuZXh0VHJhdmVyc2FsID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgLyoqXG4gICAqIEEgcHJvc3BlY3RpdmUgY3VycmVudCBhY3RpdmUgZW50cnkgaW5kZXgsIHdoaWNoIGluY2x1ZGVzIHVucmVzb2x2ZWRcbiAgICogdHJhdmVyc2Fscy4gVXNlZCBieSBgZ29gIHRvIGRldGVybWluZSB3aGVyZSBuYXZpZ2F0aW9ucyBhcmUgaW50ZW5kZWQgdG8gZ28uXG4gICAqL1xuICBwcml2YXRlIHByb3NwZWN0aXZlRW50cnlJbmRleCA9IDA7XG5cbiAgLyoqXG4gICAqIEEgdGVzdC1vbmx5IG9wdGlvbiB0byBtYWtlIHRyYXZlcnNhbHMgc3luY2hyb25vdXMsIHJhdGhlciB0aGFuIGVtdWxhdGVcbiAgICogY3Jvc3MtcHJvY2VzcyBjb21tdW5pY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBzeW5jaHJvbm91c1RyYXZlcnNhbHMgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0byBhbGxvdyBhIGNhbGwgdG8gc2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZy4gKi9cbiAgcHJpdmF0ZSBjYW5TZXRJbml0aWFsRW50cnkgPSB0cnVlO1xuXG4gIC8qKiBgRXZlbnRUYXJnZXRgIHRvIGRpc3BhdGNoIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBldmVudFRhcmdldDogRXZlbnRUYXJnZXQgPSB0aGlzLndpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAvKiogVGhlIG5leHQgdW5pcXVlIGlkIGZvciBjcmVhdGVkIGVudHJpZXMuIFJlcGxhY2UgcmVjcmVhdGVzIHRoaXMgaWQuICovXG4gIHByaXZhdGUgbmV4dElkID0gMDtcblxuICAvKiogVGhlIG5leHQgdW5pcXVlIGtleSBmb3IgY3JlYXRlZCBlbnRyaWVzLiBSZXBsYWNlIGluaGVyaXRzIHRoaXMgaWQuICovXG4gIHByaXZhdGUgbmV4dEtleSA9IDA7XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBmYWtlIGlzIGRpc3Bvc2VkLiAqL1xuICBwcml2YXRlIGRpc3Bvc2VkID0gZmFsc2U7XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uY3VycmVudEVudHJ5YC4gKi9cbiAgZ2V0IGN1cnJlbnRFbnRyeSgpOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc0Fyclt0aGlzLmN1cnJlbnRFbnRyeUluZGV4XTtcbiAgfVxuXG4gIGdldCBjYW5Hb0JhY2soKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEVudHJ5SW5kZXggPiAwO1xuICB9XG5cbiAgZ2V0IGNhbkdvRm9yd2FyZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RW50cnlJbmRleCA8IHRoaXMuZW50cmllc0Fyci5sZW5ndGggLSAxO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSB3aW5kb3c6IFdpbmRvdyxcbiAgICBzdGFydFVSTDogYGh0dHAke3N0cmluZ31gLFxuICApIHtcbiAgICAvLyBGaXJzdCBlbnRyeS5cbiAgICB0aGlzLnNldEluaXRpYWxFbnRyeUZvclRlc3Rpbmcoc3RhcnRVUkwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGluaXRpYWwgZW50cnkuXG4gICAqL1xuICBwcml2YXRlIHNldEluaXRpYWxFbnRyeUZvclRlc3RpbmcoXG4gICAgdXJsOiBgaHR0cCR7c3RyaW5nfWAsXG4gICAgb3B0aW9uczoge2hpc3RvcnlTdGF0ZTogdW5rbm93bjsgc3RhdGU/OiB1bmtub3dufSA9IHtoaXN0b3J5U3RhdGU6IG51bGx9LFxuICApIHtcbiAgICBpZiAoIXRoaXMuY2FuU2V0SW5pdGlhbEVudHJ5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdzZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nIGNhbiBvbmx5IGJlIGNhbGxlZCBiZWZvcmUgYW55ICcgKyAnbmF2aWdhdGlvbiBoYXMgb2NjdXJyZWQnLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudEluaXRpYWxFbnRyeSA9IHRoaXMuZW50cmllc0FyclswXTtcbiAgICB0aGlzLmVudHJpZXNBcnJbMF0gPSBuZXcgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkobmV3IFVSTCh1cmwpLnRvU3RyaW5nKCksIHtcbiAgICAgIGluZGV4OiAwLFxuICAgICAga2V5OiBjdXJyZW50SW5pdGlhbEVudHJ5Py5rZXkgPz8gU3RyaW5nKHRoaXMubmV4dEtleSsrKSxcbiAgICAgIGlkOiBjdXJyZW50SW5pdGlhbEVudHJ5Py5pZCA/PyBTdHJpbmcodGhpcy5uZXh0SWQrKyksXG4gICAgICBzYW1lRG9jdW1lbnQ6IHRydWUsXG4gICAgICBoaXN0b3J5U3RhdGU6IG9wdGlvbnM/Lmhpc3RvcnlTdGF0ZSxcbiAgICAgIHN0YXRlOiBvcHRpb25zLnN0YXRlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciB0aGUgaW5pdGlhbCBlbnRyeSBpcyBzdGlsbCBlbGlnaWJsZSB0byBiZSBzZXQuICovXG4gIGNhblNldEluaXRpYWxFbnRyeUZvclRlc3RpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2FuU2V0SW5pdGlhbEVudHJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciB0byBlbXVsYXRlIHRyYXZlcnNhbHMgYXMgc3luY2hyb25vdXMgcmF0aGVyIHRoYW5cbiAgICogYXN5bmNocm9ub3VzLlxuICAgKi9cbiAgc2V0U3luY2hyb25vdXNUcmF2ZXJzYWxzRm9yVGVzdGluZyhzeW5jaHJvbm91c1RyYXZlcnNhbHM6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnN5bmNocm9ub3VzVHJhdmVyc2FscyA9IHN5bmNocm9ub3VzVHJhdmVyc2FscztcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmVudHJpZXMoKWAuICovXG4gIGVudHJpZXMoKTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc0Fyci5zbGljZSgpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24ubmF2aWdhdGUoKWAuICovXG4gIG5hdmlnYXRlKHVybDogc3RyaW5nLCBvcHRpb25zPzogTmF2aWdhdGlvbk5hdmlnYXRlT3B0aW9ucyk6IEZha2VOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBmcm9tVXJsID0gbmV3IFVSTCh0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcbiAgICBjb25zdCB0b1VybCA9IG5ldyBVUkwodXJsLCB0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcblxuICAgIGxldCBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG4gICAgaWYgKCFvcHRpb25zPy5oaXN0b3J5IHx8IG9wdGlvbnMuaGlzdG9yeSA9PT0gJ2F1dG8nKSB7XG4gICAgICAvLyBBdXRvIGRlZmF1bHRzIHRvIHB1c2gsIGJ1dCBpZiB0aGUgVVJMcyBhcmUgdGhlIHNhbWUsIGlzIGEgcmVwbGFjZS5cbiAgICAgIGlmIChmcm9tVXJsLnRvU3RyaW5nKCkgPT09IHRvVXJsLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGUgPSAncmVwbGFjZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZSA9ICdwdXNoJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmF2aWdhdGlvblR5cGUgPSBvcHRpb25zLmhpc3Rvcnk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCB0b1VybCk7XG5cbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgIHVybDogdG9VcmwudG9TdHJpbmcoKSxcbiAgICAgIHN0YXRlOiBvcHRpb25zPy5zdGF0ZSxcbiAgICAgIHNhbWVEb2N1bWVudDogaGFzaENoYW5nZSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogbnVsbCxcbiAgICB9KTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG5cbiAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgIG5hdmlnYXRpb25UeXBlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgbmF2aWdhdGUoKS5cbiAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgaGFzaENoYW5nZSxcbiAgICAgIGluZm86IG9wdGlvbnM/LmluZm8sXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0dGVkOiByZXN1bHQuY29tbWl0dGVkLFxuICAgICAgZmluaXNoZWQ6IHJlc3VsdC5maW5pc2hlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYGhpc3RvcnkucHVzaFN0YXRlKClgLiAqL1xuICBwdXNoU3RhdGUoZGF0YTogdW5rbm93biwgdGl0bGU6IHN0cmluZywgdXJsPzogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoT3JSZXBsYWNlU3RhdGUoJ3B1c2gnLCBkYXRhLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgpYC4gKi9cbiAgcmVwbGFjZVN0YXRlKGRhdGE6IHVua25vd24sIHRpdGxlOiBzdHJpbmcsIHVybD86IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHVzaE9yUmVwbGFjZVN0YXRlKCdyZXBsYWNlJywgZGF0YSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICBwcml2YXRlIHB1c2hPclJlcGxhY2VTdGF0ZShcbiAgICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmcsXG4gICAgZGF0YTogdW5rbm93bixcbiAgICBfdGl0bGU6IHN0cmluZyxcbiAgICB1cmw/OiBzdHJpbmcsXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgIGNvbnN0IHRvVXJsID0gdXJsID8gbmV3IFVSTCh1cmwsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpIDogZnJvbVVybDtcblxuICAgIGNvbnN0IGhhc2hDaGFuZ2UgPSBpc0hhc2hDaGFuZ2UoZnJvbVVybCwgdG9VcmwpO1xuXG4gICAgY29uc3QgZGVzdGluYXRpb24gPSBuZXcgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbih7XG4gICAgICB1cmw6IHRvVXJsLnRvU3RyaW5nKCksXG4gICAgICBzYW1lRG9jdW1lbnQ6IHRydWUsXG4gICAgICBoaXN0b3J5U3RhdGU6IGRhdGEsXG4gICAgfSk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuXG4gICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICBuYXZpZ2F0aW9uVHlwZSxcbiAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAvLyBBbHdheXMgZmFsc2UgZm9yIHB1c2hTdGF0ZSgpIG9yIHJlcGxhY2VTdGF0ZSgpLlxuICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICBoYXNoQ2hhbmdlLFxuICAgICAgc2tpcFBvcFN0YXRlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24udHJhdmVyc2VUbygpYC4gKi9cbiAgdHJhdmVyc2VUbyhrZXk6IHN0cmluZywgb3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5maW5kRW50cnkoa2V5KTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICBjb25zdCBkb21FeGNlcHRpb24gPSBuZXcgRE9NRXhjZXB0aW9uKCdJbnZhbGlkIGtleScsICdJbnZhbGlkU3RhdGVFcnJvcicpO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGVudHJ5ID09PSB0aGlzLmN1cnJlbnRFbnRyeSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkOiBQcm9taXNlLnJlc29sdmUodGhpcy5jdXJyZW50RW50cnkpLFxuICAgICAgICBmaW5pc2hlZDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuY3VycmVudEVudHJ5KSxcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICh0aGlzLnRyYXZlcnNhbFF1ZXVlLmhhcyhlbnRyeS5rZXkpKSB7XG4gICAgICBjb25zdCBleGlzdGluZ1Jlc3VsdCA9IHRoaXMudHJhdmVyc2FsUXVldWUuZ2V0KGVudHJ5LmtleSkhO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkOiBleGlzdGluZ1Jlc3VsdC5jb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkOiBleGlzdGluZ1Jlc3VsdC5maW5pc2hlZCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCBuZXcgVVJMKGVudHJ5LnVybCEsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpKTtcbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgIHVybDogZW50cnkudXJsISxcbiAgICAgIHN0YXRlOiBlbnRyeS5nZXRTdGF0ZSgpLFxuICAgICAgaGlzdG9yeVN0YXRlOiBlbnRyeS5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgIGtleTogZW50cnkua2V5LFxuICAgICAgaWQ6IGVudHJ5LmlkLFxuICAgICAgaW5kZXg6IGVudHJ5LmluZGV4LFxuICAgICAgc2FtZURvY3VtZW50OiBlbnRyeS5zYW1lRG9jdW1lbnQsXG4gICAgfSk7XG4gICAgdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSBlbnRyeS5pbmRleDtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG4gICAgdGhpcy50cmF2ZXJzYWxRdWV1ZS5zZXQoZW50cnkua2V5LCByZXN1bHQpO1xuICAgIHRoaXMucnVuVHJhdmVyc2FsKCgpID0+IHtcbiAgICAgIHRoaXMudHJhdmVyc2FsUXVldWUuZGVsZXRlKGVudHJ5LmtleSk7XG4gICAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGU6ICd0cmF2ZXJzZScsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciB0cmF2ZXJzZVRvKCkuXG4gICAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgICBoYXNoQ2hhbmdlLFxuICAgICAgICBpbmZvOiBvcHRpb25zPy5pbmZvLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZDogcmVzdWx0LmNvbW1pdHRlZCxcbiAgICAgIGZpbmlzaGVkOiByZXN1bHQuZmluaXNoZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmJhY2soKWAuICovXG4gIGJhY2sob3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGlmICh0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID09PSAwKSB7XG4gICAgICBjb25zdCBkb21FeGNlcHRpb24gPSBuZXcgRE9NRXhjZXB0aW9uKCdDYW5ub3QgZ28gYmFjaycsICdJbnZhbGlkU3RhdGVFcnJvcicpO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleCAtIDFdO1xuICAgIHJldHVybiB0aGlzLnRyYXZlcnNlVG8oZW50cnkua2V5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmZvcndhcmQoKWAuICovXG4gIGZvcndhcmQob3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGlmICh0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID09PSB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIC0gMSkge1xuICAgICAgY29uc3QgZG9tRXhjZXB0aW9uID0gbmV3IERPTUV4Y2VwdGlvbignQ2Fubm90IGdvIGZvcndhcmQnLCAnSW52YWxpZFN0YXRlRXJyb3InKTtcbiAgICAgIGNvbnN0IGNvbW1pdHRlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb25zdCBmaW5pc2hlZCA9IFByb21pc2UucmVqZWN0KGRvbUV4Y2VwdGlvbik7XG4gICAgICBjb21taXR0ZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgZmluaXNoZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWl0dGVkLFxuICAgICAgICBmaW5pc2hlZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyW3RoaXMuY3VycmVudEVudHJ5SW5kZXggKyAxXTtcbiAgICByZXR1cm4gdGhpcy50cmF2ZXJzZVRvKGVudHJ5LmtleSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogRXF1aXZhbGVudCB0byBgaGlzdG9yeS5nbygpYC5cbiAgICogTm90ZSB0aGF0IHRoaXMgbWV0aG9kIGRvZXMgbm90IGFjdHVhbGx5IHdvcmsgcHJlY2lzZWx5IHRvIGhvdyBDaHJvbWVcbiAgICogZG9lcywgaW5zdGVhZCBjaG9vc2luZyBhIHNpbXBsZXIgbW9kZWwgd2l0aCBsZXNzIHVuZXhwZWN0ZWQgYmVoYXZpb3IuXG4gICAqIENocm9tZSBoYXMgYSBmZXcgZWRnZSBjYXNlIG9wdGltaXphdGlvbnMsIGZvciBpbnN0YW5jZSB3aXRoIHJlcGVhdGVkXG4gICAqIGBiYWNrKCk7IGZvcndhcmQoKWAgY2hhaW5zIGl0IGNvbGxhcHNlcyBjZXJ0YWluIHRyYXZlcnNhbHMuXG4gICAqL1xuICBnbyhkaXJlY3Rpb246IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldEluZGV4ID0gdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggKyBkaXJlY3Rpb247XG4gICAgaWYgKHRhcmdldEluZGV4ID49IHRoaXMuZW50cmllc0Fyci5sZW5ndGggfHwgdGFyZ2V0SW5kZXggPCAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gdGFyZ2V0SW5kZXg7XG4gICAgdGhpcy5ydW5UcmF2ZXJzYWwoKCkgPT4ge1xuICAgICAgLy8gQ2hlY2sgYWdhaW4gdGhhdCBkZXN0aW5hdGlvbiBpcyBpbiB0aGUgZW50cmllcyBhcnJheS5cbiAgICAgIGlmICh0YXJnZXRJbmRleCA+PSB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIHx8IHRhcmdldEluZGV4IDwgMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBmcm9tVXJsID0gbmV3IFVSTCh0aGlzLmN1cnJlbnRFbnRyeS51cmwhKTtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyW3RhcmdldEluZGV4XTtcbiAgICAgIGNvbnN0IGhhc2hDaGFuZ2UgPSBpc0hhc2hDaGFuZ2UoZnJvbVVybCwgbmV3IFVSTChlbnRyeS51cmwhLCB0aGlzLmN1cnJlbnRFbnRyeS51cmwhKSk7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgICAgdXJsOiBlbnRyeS51cmwhLFxuICAgICAgICBzdGF0ZTogZW50cnkuZ2V0U3RhdGUoKSxcbiAgICAgICAgaGlzdG9yeVN0YXRlOiBlbnRyeS5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgICAga2V5OiBlbnRyeS5rZXksXG4gICAgICAgIGlkOiBlbnRyeS5pZCxcbiAgICAgICAgaW5kZXg6IGVudHJ5LmluZGV4LFxuICAgICAgICBzYW1lRG9jdW1lbnQ6IGVudHJ5LnNhbWVEb2N1bWVudCxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuICAgICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlOiAndHJhdmVyc2UnLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgZ28oKS5cbiAgICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSdW5zIGEgdHJhdmVyc2FsIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHkgKi9cbiAgcHJpdmF0ZSBydW5UcmF2ZXJzYWwodHJhdmVyc2FsOiAoKSA9PiB2b2lkKSB7XG4gICAgaWYgKHRoaXMuc3luY2hyb25vdXNUcmF2ZXJzYWxzKSB7XG4gICAgICB0cmF2ZXJzYWwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBFYWNoIHRyYXZlcnNhbCBvY2N1cGllcyBhIHNpbmdsZSB0aW1lb3V0IHJlc29sdXRpb24uXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IFByb21pc2VzIGFkZGVkIHRvIGNvbW1pdCBhbmQgZmluaXNoIHNob3VsZCByZXNvbHZlXG4gICAgLy8gYmVmb3JlIHRoZSBuZXh0IHRyYXZlcnNhbC5cbiAgICB0aGlzLm5leHRUcmF2ZXJzYWwgPSB0aGlzLm5leHRUcmF2ZXJzYWwudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHRyYXZlcnNhbCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uYWRkRXZlbnRMaXN0ZW5lcigpYC4gKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcihcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbixcbiAgKSB7XG4gICAgdGhpcy5ldmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoKWAuICovXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LFxuICAgIG9wdGlvbnM/OiBFdmVudExpc3RlbmVyT3B0aW9ucyB8IGJvb2xlYW4sXG4gICkge1xuICAgIHRoaXMuZXZlbnRUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5kaXNwYXRjaEV2ZW50KClgICovXG4gIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZXZlbnRUYXJnZXQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gIH1cblxuICAvKiogQ2xlYW5zIHVwIHJlc291cmNlcy4gKi9cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBSZWNyZWF0ZSBldmVudFRhcmdldCB0byByZWxlYXNlIGN1cnJlbnQgbGlzdGVuZXJzLlxuICAgIC8vIGBkb2N1bWVudC5jcmVhdGVFbGVtZW50YCBiZWNhdXNlIE5vZGVKUyBgRXZlbnRUYXJnZXRgIGlzIGluY29tcGF0aWJsZSB3aXRoIERvbWlubydzIGBFdmVudGAuXG4gICAgdGhpcy5ldmVudFRhcmdldCA9IHRoaXMud2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZGlzcG9zZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciB0aGlzIGZha2UgaXMgZGlzcG9zZWQuICovXG4gIGlzRGlzcG9zZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcG9zZWQ7XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gZm9yIGFsbCBuYXZpZ2F0aW9ucyBhbmQgdHJhdmVyc2Fscy4gKi9cbiAgcHJpdmF0ZSB1c2VyQWdlbnROYXZpZ2F0ZShcbiAgICBkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbixcbiAgICByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCxcbiAgICBvcHRpb25zOiBJbnRlcm5hbE5hdmlnYXRlT3B0aW9ucyxcbiAgKSB7XG4gICAgLy8gVGhlIGZpcnN0IG5hdmlnYXRpb24gc2hvdWxkIGRpc2FsbG93IGFueSBmdXR1cmUgY2FsbHMgdG8gc2V0IHRoZSBpbml0aWFsXG4gICAgLy8gZW50cnkuXG4gICAgdGhpcy5jYW5TZXRJbml0aWFsRW50cnkgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5uYXZpZ2F0ZUV2ZW50KSB7XG4gICAgICB0aGlzLm5hdmlnYXRlRXZlbnQuY2FuY2VsKG5ldyBET01FeGNlcHRpb24oJ05hdmlnYXRpb24gd2FzIGFib3J0ZWQnLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgIHRoaXMubmF2aWdhdGVFdmVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBuYXZpZ2F0ZUV2ZW50ID0gY3JlYXRlRmFrZU5hdmlnYXRlRXZlbnQoe1xuICAgICAgbmF2aWdhdGlvblR5cGU6IG9wdGlvbnMubmF2aWdhdGlvblR5cGUsXG4gICAgICBjYW5jZWxhYmxlOiBvcHRpb25zLmNhbmNlbGFibGUsXG4gICAgICBjYW5JbnRlcmNlcHQ6IG9wdGlvbnMuY2FuSW50ZXJjZXB0LFxuICAgICAgdXNlckluaXRpYXRlZDogb3B0aW9ucy51c2VySW5pdGlhdGVkLFxuICAgICAgaGFzaENoYW5nZTogb3B0aW9ucy5oYXNoQ2hhbmdlLFxuICAgICAgc2lnbmFsOiByZXN1bHQuc2lnbmFsLFxuICAgICAgZGVzdGluYXRpb24sXG4gICAgICBpbmZvOiBvcHRpb25zLmluZm8sXG4gICAgICBzYW1lRG9jdW1lbnQ6IGRlc3RpbmF0aW9uLnNhbWVEb2N1bWVudCxcbiAgICAgIHNraXBQb3BTdGF0ZTogb3B0aW9ucy5za2lwUG9wU3RhdGUsXG4gICAgICByZXN1bHQsXG4gICAgICB1c2VyQWdlbnRDb21taXQ6ICgpID0+IHtcbiAgICAgICAgdGhpcy51c2VyQWdlbnRDb21taXQoKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLm5hdmlnYXRlRXZlbnQgPSBuYXZpZ2F0ZUV2ZW50O1xuICAgIHRoaXMuZXZlbnRUYXJnZXQuZGlzcGF0Y2hFdmVudChuYXZpZ2F0ZUV2ZW50KTtcbiAgICBuYXZpZ2F0ZUV2ZW50LmRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50KCk7XG4gICAgaWYgKG5hdmlnYXRlRXZlbnQuY29tbWl0T3B0aW9uID09PSAnaW1tZWRpYXRlJykge1xuICAgICAgbmF2aWdhdGVFdmVudC5jb21taXQoLyogaW50ZXJuYWw9ICovIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiB0byBjb21taXQgYSBuYXZpZ2F0aW9uLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudENvbW1pdCgpIHtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmcm9tID0gdGhpcy5jdXJyZW50RW50cnk7XG4gICAgaWYgKCF0aGlzLm5hdmlnYXRlRXZlbnQuc2FtZURvY3VtZW50KSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignQ2Fubm90IG5hdmlnYXRlIHRvIGEgbm9uLXNhbWUtZG9jdW1lbnQgVVJMLicpO1xuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50LmNhbmNlbChlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAncHVzaCcgfHxcbiAgICAgIHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSA9PT0gJ3JlcGxhY2UnXG4gICAgKSB7XG4gICAgICB0aGlzLnVzZXJBZ2VudFB1c2hPclJlcGxhY2UodGhpcy5uYXZpZ2F0ZUV2ZW50LmRlc3RpbmF0aW9uLCB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlOiB0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGUsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSA9PT0gJ3RyYXZlcnNlJykge1xuICAgICAgdGhpcy51c2VyQWdlbnRUcmF2ZXJzZSh0aGlzLm5hdmlnYXRlRXZlbnQuZGVzdGluYXRpb24pO1xuICAgIH1cbiAgICB0aGlzLm5hdmlnYXRlRXZlbnQudXNlckFnZW50TmF2aWdhdGVkKHRoaXMuY3VycmVudEVudHJ5KTtcbiAgICBjb25zdCBjdXJyZW50RW50cnlDaGFuZ2VFdmVudCA9IGNyZWF0ZUZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQoe1xuICAgICAgZnJvbSxcbiAgICAgIG5hdmlnYXRpb25UeXBlOiB0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGUsXG4gICAgfSk7XG4gICAgdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KGN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KTtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudC5za2lwUG9wU3RhdGUpIHtcbiAgICAgIGNvbnN0IHBvcFN0YXRlRXZlbnQgPSBjcmVhdGVQb3BTdGF0ZUV2ZW50KHtcbiAgICAgICAgc3RhdGU6IHRoaXMubmF2aWdhdGVFdmVudC5kZXN0aW5hdGlvbi5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy53aW5kb3cuZGlzcGF0Y2hFdmVudChwb3BTdGF0ZUV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gZm9yIGEgcHVzaCBvciByZXBsYWNlIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50UHVzaE9yUmVwbGFjZShcbiAgICBkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbixcbiAgICB7bmF2aWdhdGlvblR5cGV9OiB7bmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nfSxcbiAgKSB7XG4gICAgaWYgKG5hdmlnYXRpb25UeXBlID09PSAncHVzaCcpIHtcbiAgICAgIHRoaXMuY3VycmVudEVudHJ5SW5kZXgrKztcbiAgICAgIHRoaXMucHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gdGhpcy5jdXJyZW50RW50cnlJbmRleDtcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmN1cnJlbnRFbnRyeUluZGV4O1xuICAgIGNvbnN0IGtleSA9IG5hdmlnYXRpb25UeXBlID09PSAncHVzaCcgPyBTdHJpbmcodGhpcy5uZXh0S2V5KyspIDogdGhpcy5jdXJyZW50RW50cnkua2V5O1xuICAgIGNvbnN0IGVudHJ5ID0gbmV3IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KGRlc3RpbmF0aW9uLnVybCwge1xuICAgICAgaWQ6IFN0cmluZyh0aGlzLm5leHRJZCsrKSxcbiAgICAgIGtleSxcbiAgICAgIGluZGV4LFxuICAgICAgc2FtZURvY3VtZW50OiB0cnVlLFxuICAgICAgc3RhdGU6IGRlc3RpbmF0aW9uLmdldFN0YXRlKCksXG4gICAgICBoaXN0b3J5U3RhdGU6IGRlc3RpbmF0aW9uLmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgIH0pO1xuICAgIGlmIChuYXZpZ2F0aW9uVHlwZSA9PT0gJ3B1c2gnKSB7XG4gICAgICB0aGlzLmVudHJpZXNBcnIuc3BsaWNlKGluZGV4LCBJbmZpbml0eSwgZW50cnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVudHJpZXNBcnJbaW5kZXhdID0gZW50cnk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEltcGxlbWVudGF0aW9uIGZvciBhIHRyYXZlcnNlIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50VHJhdmVyc2UoZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24pIHtcbiAgICB0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID0gZGVzdGluYXRpb24uaW5kZXg7XG4gIH1cblxuICAvKiogVXRpbGl0eSBtZXRob2QgZm9yIGZpbmRpbmcgZW50cmllcyB3aXRoIHRoZSBnaXZlbiBga2V5YC4gKi9cbiAgcHJpdmF0ZSBmaW5kRW50cnkoa2V5OiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMuZW50cmllc0Fycikge1xuICAgICAgaWYgKGVudHJ5LmtleSA9PT0ga2V5KSByZXR1cm4gZW50cnk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBzZXQgb25uYXZpZ2F0ZShfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGVFdmVudCkgPT4gYW55KSB8IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBvbm5hdmlnYXRlKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRlRXZlbnQpID0+IGFueSkgfCBudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbmN1cnJlbnRlbnRyeWNoYW5nZShcbiAgICBfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KSA9PiBhbnkpIHwgbnVsbCxcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25jdXJyZW50ZW50cnljaGFuZ2UoKTpcbiAgICB8ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCkgPT4gYW55KVxuICAgIHwgbnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzZXQgb25uYXZpZ2F0ZXN1Y2Nlc3MoX2hhbmRsZXI6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpIHwgbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGVzdWNjZXNzKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpIHwgbnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzZXQgb25uYXZpZ2F0ZWVycm9yKF9oYW5kbGVyOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBFcnJvckV2ZW50KSA9PiBhbnkpIHwgbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGVlcnJvcigpOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBFcnJvckV2ZW50KSA9PiBhbnkpIHwgbnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgdHJhbnNpdGlvbigpOiBOYXZpZ2F0aW9uVHJhbnNpdGlvbiB8IG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgdXBkYXRlQ3VycmVudEVudHJ5KF9vcHRpb25zOiBOYXZpZ2F0aW9uVXBkYXRlQ3VycmVudEVudHJ5T3B0aW9ucyk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVsb2FkKF9vcHRpb25zPzogTmF2aWdhdGlvblJlbG9hZE9wdGlvbnMpOiBOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiB0aGUgYE5hdmlnYXRpb25SZXN1bHRgIGludGVyZmFjZSB3aXRoXG4gKiBgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnlgLlxuICovXG5pbnRlcmZhY2UgRmFrZU5hdmlnYXRpb25SZXN1bHQgZXh0ZW5kcyBOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgcmVhZG9ubHkgY29tbWl0dGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PjtcbiAgcmVhZG9ubHkgZmluaXNoZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGlvbkhpc3RvcnlFbnRyeWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSBpbXBsZW1lbnRzIE5hdmlnYXRpb25IaXN0b3J5RW50cnkge1xuICByZWFkb25seSBzYW1lRG9jdW1lbnQ7XG5cbiAgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgcmVhZG9ubHkga2V5OiBzdHJpbmc7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhdGU6IHVua25vd247XG4gIHByaXZhdGUgcmVhZG9ubHkgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgb25kaXNwb3NlOiAoKHRoaXM6IE5hdmlnYXRpb25IaXN0b3J5RW50cnksIGV2OiBFdmVudCkgPT4gYW55KSB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHVybDogc3RyaW5nIHwgbnVsbCxcbiAgICB7XG4gICAgICBpZCxcbiAgICAgIGtleSxcbiAgICAgIGluZGV4LFxuICAgICAgc2FtZURvY3VtZW50LFxuICAgICAgc3RhdGUsXG4gICAgICBoaXN0b3J5U3RhdGUsXG4gICAgfToge1xuICAgICAgaWQ6IHN0cmluZztcbiAgICAgIGtleTogc3RyaW5nO1xuICAgICAgaW5kZXg6IG51bWJlcjtcbiAgICAgIHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgICAgIGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcbiAgICAgIHN0YXRlPzogdW5rbm93bjtcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuc2FtZURvY3VtZW50ID0gc2FtZURvY3VtZW50O1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLmhpc3RvcnlTdGF0ZSA9IGhpc3RvcnlTdGF0ZTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIC8vIEJ1ZGdldCBjb3B5LlxuICAgIHJldHVybiB0aGlzLnN0YXRlID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlKSkgOiB0aGlzLnN0YXRlO1xuICB9XG5cbiAgZ2V0SGlzdG9yeVN0YXRlKCk6IHVua25vd24ge1xuICAgIC8vIEJ1ZGdldCBjb3B5LlxuICAgIHJldHVybiB0aGlzLmhpc3RvcnlTdGF0ZSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5oaXN0b3J5U3RhdGUpKSA6IHRoaXMuaGlzdG9yeVN0YXRlO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbixcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZW1vdmVFdmVudExpc3RlbmVyKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCxcbiAgICBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuLFxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuLyoqIGBOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9uc2Agd2l0aCBleHBlcmltZW50YWwgY29tbWl0IG9wdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwZXJpbWVudGFsTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMgZXh0ZW5kcyBOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyB7XG4gIGNvbW1pdD86ICdpbW1lZGlhdGUnIHwgJ2FmdGVyLXRyYW5zaXRpb24nO1xufVxuXG4vKiogYE5hdmlnYXRlRXZlbnRgIHdpdGggZXhwZXJpbWVudGFsIGNvbW1pdCBmdW5jdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwZXJpbWVudGFsTmF2aWdhdGVFdmVudCBleHRlbmRzIE5hdmlnYXRlRXZlbnQge1xuICBpbnRlcmNlcHQob3B0aW9ucz86IEV4cGVyaW1lbnRhbE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zKTogdm9pZDtcblxuICBjb21taXQoKTogdm9pZDtcbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRlRXZlbnRgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZha2VOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgRXhwZXJpbWVudGFsTmF2aWdhdGVFdmVudCB7XG4gIHJlYWRvbmx5IGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uO1xufVxuXG5pbnRlcmZhY2UgSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCBleHRlbmRzIEZha2VOYXZpZ2F0ZUV2ZW50IHtcbiAgcmVhZG9ubHkgc2FtZURvY3VtZW50OiBib29sZWFuO1xuICByZWFkb25seSBza2lwUG9wU3RhdGU/OiBib29sZWFuO1xuICByZWFkb25seSBjb21taXRPcHRpb246ICdhZnRlci10cmFuc2l0aW9uJyB8ICdpbW1lZGlhdGUnO1xuICByZWFkb25seSByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdDtcblxuICBjb21taXQoaW50ZXJuYWw/OiBib29sZWFuKTogdm9pZDtcbiAgY2FuY2VsKHJlYXNvbjogRXJyb3IpOiB2b2lkO1xuICBkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCgpOiB2b2lkO1xuICB1c2VyQWdlbnROYXZpZ2F0ZWQoZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KTogdm9pZDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRlRXZlbnRgLiBUaGlzIGlzIG5vdCBhIGNsYXNzIGJlY2F1c2UgRVM1XG4gKiB0cmFuc3BpbGVkIEphdmFTY3JpcHQgY2Fubm90IGV4dGVuZCBuYXRpdmUgRXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZha2VOYXZpZ2F0ZUV2ZW50KHtcbiAgY2FuY2VsYWJsZSxcbiAgY2FuSW50ZXJjZXB0LFxuICB1c2VySW5pdGlhdGVkLFxuICBoYXNoQ2hhbmdlLFxuICBuYXZpZ2F0aW9uVHlwZSxcbiAgc2lnbmFsLFxuICBkZXN0aW5hdGlvbixcbiAgaW5mbyxcbiAgc2FtZURvY3VtZW50LFxuICBza2lwUG9wU3RhdGUsXG4gIHJlc3VsdCxcbiAgdXNlckFnZW50Q29tbWl0LFxufToge1xuICBjYW5jZWxhYmxlOiBib29sZWFuO1xuICBjYW5JbnRlcmNlcHQ6IGJvb2xlYW47XG4gIHVzZXJJbml0aWF0ZWQ6IGJvb2xlYW47XG4gIGhhc2hDaGFuZ2U6IGJvb2xlYW47XG4gIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbDtcbiAgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb247XG4gIGluZm86IHVua25vd247XG4gIHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgc2tpcFBvcFN0YXRlPzogYm9vbGVhbjtcbiAgcmVzdWx0OiBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQ7XG4gIHVzZXJBZ2VudENvbW1pdDogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ25hdmlnYXRlJywge2J1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlfSkgYXMge1xuICAgIC1yZWFkb25seSBbUCBpbiBrZXlvZiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50XTogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudFtQXTtcbiAgfTtcbiAgZXZlbnQuY2FuSW50ZXJjZXB0ID0gY2FuSW50ZXJjZXB0O1xuICBldmVudC51c2VySW5pdGlhdGVkID0gdXNlckluaXRpYXRlZDtcbiAgZXZlbnQuaGFzaENoYW5nZSA9IGhhc2hDaGFuZ2U7XG4gIGV2ZW50Lm5hdmlnYXRpb25UeXBlID0gbmF2aWdhdGlvblR5cGU7XG4gIGV2ZW50LnNpZ25hbCA9IHNpZ25hbDtcbiAgZXZlbnQuZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbjtcbiAgZXZlbnQuaW5mbyA9IGluZm87XG4gIGV2ZW50LmRvd25sb2FkUmVxdWVzdCA9IG51bGw7XG4gIGV2ZW50LmZvcm1EYXRhID0gbnVsbDtcblxuICBldmVudC5zYW1lRG9jdW1lbnQgPSBzYW1lRG9jdW1lbnQ7XG4gIGV2ZW50LnNraXBQb3BTdGF0ZSA9IHNraXBQb3BTdGF0ZTtcbiAgZXZlbnQuY29tbWl0T3B0aW9uID0gJ2ltbWVkaWF0ZSc7XG5cbiAgbGV0IGhhbmRsZXJGaW5pc2hlZDogUHJvbWlzZTx2b2lkPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgbGV0IGludGVyY2VwdENhbGxlZCA9IGZhbHNlO1xuICBsZXQgZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQgPSBmYWxzZTtcbiAgbGV0IGNvbW1pdENhbGxlZCA9IGZhbHNlO1xuXG4gIGV2ZW50LmludGVyY2VwdCA9IGZ1bmN0aW9uIChcbiAgICB0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LFxuICAgIG9wdGlvbnM/OiBFeHBlcmltZW50YWxOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyxcbiAgKTogdm9pZCB7XG4gICAgaW50ZXJjZXB0Q2FsbGVkID0gdHJ1ZTtcbiAgICBldmVudC5zYW1lRG9jdW1lbnQgPSB0cnVlO1xuICAgIGNvbnN0IGhhbmRsZXIgPSBvcHRpb25zPy5oYW5kbGVyO1xuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyRmluaXNoZWQgPSBoYW5kbGVyKCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5jb21taXQpIHtcbiAgICAgIGV2ZW50LmNvbW1pdE9wdGlvbiA9IG9wdGlvbnMuY29tbWl0O1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uZm9jdXNSZXNldCAhPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnM/LnNjcm9sbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgZXZlbnQuc2Nyb2xsID0gZnVuY3Rpb24gKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfTtcblxuICBldmVudC5jb21taXQgPSBmdW5jdGlvbiAodGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCwgaW50ZXJuYWwgPSBmYWxzZSkge1xuICAgIGlmICghaW50ZXJuYWwgJiYgIWludGVyY2VwdENhbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgYEZhaWxlZCB0byBleGVjdXRlICdjb21taXQnIG9uICdOYXZpZ2F0ZUV2ZW50JzogaW50ZXJjZXB0KCkgbXVzdCBiZSBgICtcbiAgICAgICAgICBgY2FsbGVkIGJlZm9yZSBjb21taXQoKS5gLFxuICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgYEZhaWxlZCB0byBleGVjdXRlICdjb21taXQnIG9uICdOYXZpZ2F0ZUV2ZW50JzogY29tbWl0KCkgbWF5IG5vdCBiZSBgICtcbiAgICAgICAgICBgY2FsbGVkIGR1cmluZyBldmVudCBkaXNwYXRjaC5gLFxuICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGNvbW1pdENhbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgYEZhaWxlZCB0byBleGVjdXRlICdjb21taXQnIG9uICdOYXZpZ2F0ZUV2ZW50JzogY29tbWl0KCkgYWxyZWFkeSBgICsgYGNhbGxlZC5gLFxuICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29tbWl0Q2FsbGVkID0gdHJ1ZTtcblxuICAgIHVzZXJBZ2VudENvbW1pdCgpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIG9ubHkuXG4gIGV2ZW50LmNhbmNlbCA9IGZ1bmN0aW9uICh0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LCByZWFzb246IEVycm9yKSB7XG4gICAgcmVzdWx0LmNvbW1pdHRlZFJlamVjdChyZWFzb24pO1xuICAgIHJlc3VsdC5maW5pc2hlZFJlamVjdChyZWFzb24pO1xuICB9O1xuXG4gIC8vIEludGVybmFsIG9ubHkuXG4gIGV2ZW50LmRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50ID0gZnVuY3Rpb24gKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQpIHtcbiAgICBkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCA9IHRydWU7XG4gICAgaWYgKGV2ZW50LmNvbW1pdE9wdGlvbiA9PT0gJ2FmdGVyLXRyYW5zaXRpb24nKSB7XG4gICAgICAvLyBJZiBoYW5kbGVyIGZpbmlzaGVzIGJlZm9yZSBjb21taXQsIGNhbGwgY29tbWl0LlxuICAgICAgaGFuZGxlckZpbmlzaGVkPy50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFjb21taXRDYWxsZWQpIHtcbiAgICAgICAgICAgIGV2ZW50LmNvbW1pdCgvKiBpbnRlcm5hbCAqLyB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHt9LFxuICAgICAgKTtcbiAgICB9XG4gICAgUHJvbWlzZS5hbGwoW3Jlc3VsdC5jb21taXR0ZWQsIGhhbmRsZXJGaW5pc2hlZF0pLnRoZW4oXG4gICAgICAoW2VudHJ5XSkgPT4ge1xuICAgICAgICByZXN1bHQuZmluaXNoZWRSZXNvbHZlKGVudHJ5KTtcbiAgICAgIH0sXG4gICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgIHJlc3VsdC5maW5pc2hlZFJlamVjdChyZWFzb24pO1xuICAgICAgfSxcbiAgICApO1xuICB9O1xuXG4gIC8vIEludGVybmFsIG9ubHkuXG4gIGV2ZW50LnVzZXJBZ2VudE5hdmlnYXRlZCA9IGZ1bmN0aW9uIChcbiAgICB0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LFxuICAgIGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSxcbiAgKSB7XG4gICAgcmVzdWx0LmNvbW1pdHRlZFJlc29sdmUoZW50cnkpO1xuICB9O1xuXG4gIHJldHVybiBldmVudCBhcyBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50O1xufVxuXG4vKiogRmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnRgLiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWtlTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50IGV4dGVuZHMgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50IHtcbiAgcmVhZG9ubHkgZnJvbTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlYC4gVGhpcyBkb2VzIG5vdCB1c2VcbiAqIGEgY2xhc3MgYmVjYXVzZSBFUzUgdHJhbnNwaWxlZCBKYXZhU2NyaXB0IGNhbm5vdCBleHRlbmQgbmF0aXZlIEV2ZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVGYWtlTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KHtcbiAgZnJvbSxcbiAgbmF2aWdhdGlvblR5cGUsXG59OiB7XG4gIGZyb206IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5O1xuICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG59KSB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCdjdXJyZW50ZW50cnljaGFuZ2UnLCB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gIH0pIGFzIHtcbiAgICAtcmVhZG9ubHkgW1AgaW4ga2V5b2YgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50XTogTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50W1BdO1xuICB9O1xuICBldmVudC5mcm9tID0gZnJvbTtcbiAgZXZlbnQubmF2aWdhdGlvblR5cGUgPSBuYXZpZ2F0aW9uVHlwZTtcbiAgcmV0dXJuIGV2ZW50IGFzIEZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBlcXVpdmFsZW50IG9mIGBQb3BTdGF0ZUV2ZW50YC4gVGhpcyBkb2VzIG5vdCB1c2UgYSBjbGFzc1xuICogYmVjYXVzZSBFUzUgdHJhbnNwaWxlZCBKYXZhU2NyaXB0IGNhbm5vdCBleHRlbmQgbmF0aXZlIEV2ZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVQb3BTdGF0ZUV2ZW50KHtzdGF0ZX06IHtzdGF0ZTogdW5rbm93bn0pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ3BvcHN0YXRlJywge1xuICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICB9KSBhcyB7LXJlYWRvbmx5IFtQIGluIGtleW9mIFBvcFN0YXRlRXZlbnRdOiBQb3BTdGF0ZUV2ZW50W1BdfTtcbiAgZXZlbnQuc3RhdGUgPSBzdGF0ZTtcbiAgcmV0dXJuIGV2ZW50IGFzIFBvcFN0YXRlRXZlbnQ7XG59XG5cbi8qKlxuICogRmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uRGVzdGluYXRpb25gLlxuICovXG5leHBvcnQgY2xhc3MgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbiBpbXBsZW1lbnRzIE5hdmlnYXRpb25EZXN0aW5hdGlvbiB7XG4gIHJlYWRvbmx5IHVybDogc3RyaW5nO1xuICByZWFkb25seSBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IGtleTogc3RyaW5nIHwgbnVsbDtcbiAgcmVhZG9ubHkgaWQ6IHN0cmluZyB8IG51bGw7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBzdGF0ZT86IHVua25vd247XG4gIHByaXZhdGUgcmVhZG9ubHkgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICB1cmwsXG4gICAgc2FtZURvY3VtZW50LFxuICAgIGhpc3RvcnlTdGF0ZSxcbiAgICBzdGF0ZSxcbiAgICBrZXkgPSBudWxsLFxuICAgIGlkID0gbnVsbCxcbiAgICBpbmRleCA9IC0xLFxuICB9OiB7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgc2FtZURvY3VtZW50OiBib29sZWFuO1xuICAgIGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcbiAgICBzdGF0ZT86IHVua25vd247XG4gICAga2V5Pzogc3RyaW5nIHwgbnVsbDtcbiAgICBpZD86IHN0cmluZyB8IG51bGw7XG4gICAgaW5kZXg/OiBudW1iZXI7XG4gIH0pIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLnNhbWVEb2N1bWVudCA9IHNhbWVEb2N1bWVudDtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5oaXN0b3J5U3RhdGUgPSBoaXN0b3J5U3RhdGU7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICB9XG5cbiAgZ2V0SGlzdG9yeVN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnlTdGF0ZTtcbiAgfVxufVxuXG4vKiogVXRpbGl0eSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gVXJsTGlrZSBoYXZlIHRoZSBzYW1lIGhhc2guICovXG5mdW5jdGlvbiBpc0hhc2hDaGFuZ2UoZnJvbTogVVJMLCB0bzogVVJMKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgdG8uaGFzaCAhPT0gZnJvbS5oYXNoICYmXG4gICAgdG8uaG9zdG5hbWUgPT09IGZyb20uaG9zdG5hbWUgJiZcbiAgICB0by5wYXRobmFtZSA9PT0gZnJvbS5wYXRobmFtZSAmJlxuICAgIHRvLnNlYXJjaCA9PT0gZnJvbS5zZWFyY2hcbiAgKTtcbn1cblxuLyoqIEludGVybmFsIHV0aWxpdHkgY2xhc3MgZm9yIHJlcHJlc2VudGluZyB0aGUgcmVzdWx0IG9mIGEgbmF2aWdhdGlvbi4gICovXG5jbGFzcyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQge1xuICBjb21taXR0ZWRSZXNvbHZlITogKGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSkgPT4gdm9pZDtcbiAgY29tbWl0dGVkUmVqZWN0ITogKHJlYXNvbjogRXJyb3IpID0+IHZvaWQ7XG4gIGZpbmlzaGVkUmVzb2x2ZSE6IChlbnRyeTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkpID0+IHZvaWQ7XG4gIGZpbmlzaGVkUmVqZWN0ITogKHJlYXNvbjogRXJyb3IpID0+IHZvaWQ7XG4gIHJlYWRvbmx5IGNvbW1pdHRlZDogUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT47XG4gIHJlYWRvbmx5IGZpbmlzaGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PjtcbiAgZ2V0IHNpZ25hbCgpOiBBYm9ydFNpZ25hbCB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgfVxuICBwcml2YXRlIHJlYWRvbmx5IGFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbW1pdHRlZCA9IG5ldyBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNvbW1pdHRlZFJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgdGhpcy5jb21taXR0ZWRSZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG5cbiAgICB0aGlzLmZpbmlzaGVkID0gbmV3IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuZmluaXNoZWRSZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMuZmluaXNoZWRSZWplY3QgPSAocmVhc29uOiBFcnJvcikgPT4ge1xuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgICAgdGhpcy5hYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgLy8gQWxsIHJlamVjdGlvbnMgYXJlIGhhbmRsZWQuXG4gICAgdGhpcy5jb21taXR0ZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHRoaXMuZmluaXNoZWQuY2F0Y2goKCkgPT4ge30pO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBvcHRpb25zIGZvciBwZXJmb3JtaW5nIGEgbmF2aWdhdGUuICovXG5pbnRlcmZhY2UgSW50ZXJuYWxOYXZpZ2F0ZU9wdGlvbnMge1xuICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG4gIGNhbmNlbGFibGU6IGJvb2xlYW47XG4gIGNhbkludGVyY2VwdDogYm9vbGVhbjtcbiAgdXNlckluaXRpYXRlZDogYm9vbGVhbjtcbiAgaGFzaENoYW5nZTogYm9vbGVhbjtcbiAgaW5mbz86IHVua25vd247XG4gIHNraXBQb3BTdGF0ZT86IGJvb2xlYW47XG59XG4iXX0=