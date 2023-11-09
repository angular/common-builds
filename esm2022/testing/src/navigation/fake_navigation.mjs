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
    constructor(window, baseURI) {
        this.window = window;
        this.baseURI = baseURI;
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
        this.setInitialEntryForTesting('.');
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
        this.entriesArr[0] = new FakeNavigationHistoryEntry(options.absoluteUrl ? url : new URL(url, this.baseURI).toString(), {
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
        const fromUrl = new URL(this.currentEntry.url, this.baseURI);
        const toUrl = new URL(url, this.baseURI);
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
        const fromUrl = new URL(this.currentEntry.url, this.baseURI);
        const toUrl = url ? new URL(url, this.baseURI) : fromUrl;
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
        const fromUrl = new URL(this.currentEntry.url, this.baseURI);
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
        const hashChange = isHashChange(fromUrl, new URL(entry.url, this.baseURI));
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
            const fromUrl = new URL(this.currentEntry.url, this.baseURI);
            const entry = this.entriesArr[targetIndex];
            const hashChange = isHashChange(fromUrl, new URL(entry.url, this.baseURI));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3Rlc3Rpbmcvc3JjL25hdmlnYXRpb24vZmFrZV9uYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILHdFQUF3RTtBQUN4RSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBRS9COzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQXdEekIsK0NBQStDO0lBQy9DLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELFlBQTZCLE1BQWMsRUFBbUIsT0FBZTtRQUFoRCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQW1CLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFwRTdFOzs7V0FHRztRQUNjLGVBQVUsR0FBaUMsRUFBRSxDQUFDO1FBRS9EOztXQUVHO1FBQ0ssc0JBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBRTlCOztXQUVHO1FBQ0ssa0JBQWEsR0FBd0MsU0FBUyxDQUFDO1FBRXZFOzs7V0FHRztRQUNjLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFFOUU7OztXQUdHO1FBQ0ssa0JBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFMUM7OztXQUdHO1FBQ0ssMEJBQXFCLEdBQUcsQ0FBQyxDQUFDO1FBRWxDOzs7V0FHRztRQUNL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TUFBTSxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUNKLENBQUM7UUFDRiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFByZXZlbnRzIGRlbGV0aW9uIG9mIGBFdmVudGAgZnJvbSBgZ2xvYmFsVGhpc2AgZHVyaW5nIG1vZHVsZSBsb2FkaW5nLlxuY29uc3QgRXZlbnQgPSBnbG9iYWxUaGlzLkV2ZW50O1xuXG4vKipcbiAqIEZha2UgaW1wbGVtZW50YXRpb24gb2YgdXNlciBhZ2VudCBoaXN0b3J5IGFuZCBuYXZpZ2F0aW9uIGJlaGF2aW9yLiBUaGlzIGlzIGFcbiAqIGhpZ2gtZmlkZWxpdHkgaW1wbGVtZW50YXRpb24gb2YgYnJvd3NlciBiZWhhdmlvciB0aGF0IGF0dGVtcHRzIHRvIGVtdWxhdGVcbiAqIHRoaW5ncyBsaWtlIHRyYXZlcnNhbCBkZWxheS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZha2VOYXZpZ2F0aW9uIGltcGxlbWVudHMgTmF2aWdhdGlvbiB7XG4gIC8qKlxuICAgKiBUaGUgZmFrZSBpbXBsZW1lbnRhdGlvbiBvZiBhbiBlbnRyaWVzIGFycmF5LiBPbmx5IHNhbWUtZG9jdW1lbnQgZW50cmllc1xuICAgKiBhbGxvd2VkLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBlbnRyaWVzQXJyOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeVtdID0gW107XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGFjdGl2ZSBlbnRyeSBpbmRleCBpbnRvIGBlbnRyaWVzQXJyYC5cbiAgICovXG4gIHByaXZhdGUgY3VycmVudEVudHJ5SW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBuYXZpZ2F0ZSBldmVudC5cbiAgICovXG4gIHByaXZhdGUgbmF2aWdhdGVFdmVudDogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEEgTWFwIG9mIHBlbmRpbmcgdHJhdmVyc2Fscywgc28gdGhhdCB0cmF2ZXJzYWxzIHRvIHRoZSBzYW1lIGVudHJ5IGNhbiBiZVxuICAgKiByZS11c2VkLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSB0cmF2ZXJzYWxRdWV1ZSA9IG5ldyBNYXA8c3RyaW5nLCBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQ+KCk7XG5cbiAgLyoqXG4gICAqIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHByZXZpb3VzIHRyYXZlcnNhbHMgaGF2ZSBmaW5pc2hlZC4gVXNlZCB0b1xuICAgKiBzaW11bGF0ZSB0aGUgY3Jvc3MtcHJvY2VzcyBjb21tdW5pY2F0aW9uIG5lY2Vzc2FyeSBmb3IgdHJhdmVyc2Fscy5cbiAgICovXG4gIHByaXZhdGUgbmV4dFRyYXZlcnNhbCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIC8qKlxuICAgKiBBIHByb3NwZWN0aXZlIGN1cnJlbnQgYWN0aXZlIGVudHJ5IGluZGV4LCB3aGljaCBpbmNsdWRlcyB1bnJlc29sdmVkXG4gICAqIHRyYXZlcnNhbHMuIFVzZWQgYnkgYGdvYCB0byBkZXRlcm1pbmUgd2hlcmUgbmF2aWdhdGlvbnMgYXJlIGludGVuZGVkIHRvIGdvLlxuICAgKi9cbiAgcHJpdmF0ZSBwcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSAwO1xuXG4gIC8qKlxuICAgKiBBIHRlc3Qtb25seSBvcHRpb24gdG8gbWFrZSB0cmF2ZXJzYWxzIHN5bmNocm9ub3VzLCByYXRoZXIgdGhhbiBlbXVsYXRlXG4gICAqIGNyb3NzLXByb2Nlc3MgY29tbXVuaWNhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgc3luY2hyb25vdXNUcmF2ZXJzYWxzID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdG8gYWxsb3cgYSBjYWxsIHRvIHNldEluaXRpYWxFbnRyeUZvclRlc3RpbmcuICovXG4gIHByaXZhdGUgY2FuU2V0SW5pdGlhbEVudHJ5ID0gdHJ1ZTtcblxuICAvKiogYEV2ZW50VGFyZ2V0YCB0byBkaXNwYXRjaCBldmVudHMuICovXG4gIHByaXZhdGUgZXZlbnRUYXJnZXQ6IEV2ZW50VGFyZ2V0ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgLyoqIFRoZSBuZXh0IHVuaXF1ZSBpZCBmb3IgY3JlYXRlZCBlbnRyaWVzLiBSZXBsYWNlIHJlY3JlYXRlcyB0aGlzIGlkLiAqL1xuICBwcml2YXRlIG5leHRJZCA9IDA7XG5cbiAgLyoqIFRoZSBuZXh0IHVuaXF1ZSBrZXkgZm9yIGNyZWF0ZWQgZW50cmllcy4gUmVwbGFjZSBpbmhlcml0cyB0aGlzIGlkLiAqL1xuICBwcml2YXRlIG5leHRLZXkgPSAwO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgZmFrZSBpcyBkaXNwb3NlZC4gKi9cbiAgcHJpdmF0ZSBkaXNwb3NlZCA9IGZhbHNlO1xuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmN1cnJlbnRFbnRyeWAuICovXG4gIGdldCBjdXJyZW50RW50cnkoKTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleF07XG4gIH1cblxuICBnZXQgY2FuR29CYWNrKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID4gMDtcbiAgfVxuXG4gIGdldCBjYW5Hb0ZvcndhcmQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEVudHJ5SW5kZXggPCB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIC0gMTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2luZG93OiBXaW5kb3csIHByaXZhdGUgcmVhZG9ubHkgYmFzZVVSSTogc3RyaW5nKSB7XG4gICAgLy8gRmlyc3QgZW50cnkuXG4gICAgdGhpcy5zZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nKCcuJyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaW5pdGlhbCBlbnRyeS5cbiAgICovXG4gIHNldEluaXRpYWxFbnRyeUZvclRlc3RpbmcoXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuICAgICAgICAvLyBBbGxvd3Mgc2V0dGluZyB0aGUgVVJMIHdpdGhvdXQgcmVzb2x2aW5nIGl0IGFnYWluc3QgdGhlIGJhc2UuXG4gICAgICAgIGFic29sdXRlVXJsPzogYm9vbGVhbjtcbiAgICAgICAgc3RhdGU/OiB1bmtub3duO1xuICAgICAgfSA9IHtoaXN0b3J5U3RhdGU6IG51bGx9LFxuICApIHtcbiAgICBpZiAoIXRoaXMuY2FuU2V0SW5pdGlhbEVudHJ5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ3NldEluaXRpYWxFbnRyeUZvclRlc3RpbmcgY2FuIG9ubHkgYmUgY2FsbGVkIGJlZm9yZSBhbnkgJyArXG4gICAgICAgICAgICAgICduYXZpZ2F0aW9uIGhhcyBvY2N1cnJlZCcsXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50SW5pdGlhbEVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyWzBdO1xuICAgIHRoaXMuZW50cmllc0FyclswXSA9IG5ldyBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeShcbiAgICAgICAgb3B0aW9ucy5hYnNvbHV0ZVVybCA/IHVybCA6IG5ldyBVUkwodXJsLCB0aGlzLmJhc2VVUkkpLnRvU3RyaW5nKCksXG4gICAgICAgIHtcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICBrZXk6IGN1cnJlbnRJbml0aWFsRW50cnk/LmtleSA/PyBTdHJpbmcodGhpcy5uZXh0S2V5KyspLFxuICAgICAgICAgIGlkOiBjdXJyZW50SW5pdGlhbEVudHJ5Py5pZCA/PyBTdHJpbmcodGhpcy5uZXh0SWQrKyksXG4gICAgICAgICAgc2FtZURvY3VtZW50OiB0cnVlLFxuICAgICAgICAgIGhpc3RvcnlTdGF0ZTogb3B0aW9ucz8uaGlzdG9yeVN0YXRlLFxuICAgICAgICAgIHN0YXRlOiBvcHRpb25zLnN0YXRlLFxuICAgICAgICB9LFxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIHRoZSBpbml0aWFsIGVudHJ5IGlzIHN0aWxsIGVsaWdpYmxlIHRvIGJlIHNldC4gKi9cbiAgY2FuU2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYW5TZXRJbml0aWFsRW50cnk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRvIGVtdWxhdGUgdHJhdmVyc2FscyBhcyBzeW5jaHJvbm91cyByYXRoZXIgdGhhblxuICAgKiBhc3luY2hyb25vdXMuXG4gICAqL1xuICBzZXRTeW5jaHJvbm91c1RyYXZlcnNhbHNGb3JUZXN0aW5nKHN5bmNocm9ub3VzVHJhdmVyc2FsczogYm9vbGVhbikge1xuICAgIHRoaXMuc3luY2hyb25vdXNUcmF2ZXJzYWxzID0gc3luY2hyb25vdXNUcmF2ZXJzYWxzO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uZW50cmllcygpYC4gKi9cbiAgZW50cmllcygpOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeVtdIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzQXJyLnNsaWNlKCk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5uYXZpZ2F0ZSgpYC4gKi9cbiAgbmF2aWdhdGUoXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIG9wdGlvbnM/OiBOYXZpZ2F0aW9uTmF2aWdhdGVPcHRpb25zLFxuICAgICAgKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEsIHRoaXMuYmFzZVVSSSk7XG4gICAgY29uc3QgdG9VcmwgPSBuZXcgVVJMKHVybCwgdGhpcy5iYXNlVVJJKTtcblxuICAgIGxldCBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG4gICAgaWYgKCFvcHRpb25zPy5oaXN0b3J5IHx8IG9wdGlvbnMuaGlzdG9yeSA9PT0gJ2F1dG8nKSB7XG4gICAgICAvLyBBdXRvIGRlZmF1bHRzIHRvIHB1c2gsIGJ1dCBpZiB0aGUgVVJMcyBhcmUgdGhlIHNhbWUsIGlzIGEgcmVwbGFjZS5cbiAgICAgIGlmIChmcm9tVXJsLnRvU3RyaW5nKCkgPT09IHRvVXJsLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGUgPSAncmVwbGFjZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZSA9ICdwdXNoJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmF2aWdhdGlvblR5cGUgPSBvcHRpb25zLmhpc3Rvcnk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCB0b1VybCk7XG5cbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgIHVybDogdG9VcmwudG9TdHJpbmcoKSxcbiAgICAgIHN0YXRlOiBvcHRpb25zPy5zdGF0ZSxcbiAgICAgIHNhbWVEb2N1bWVudDogaGFzaENoYW5nZSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogbnVsbCxcbiAgICB9KTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG5cbiAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgIG5hdmlnYXRpb25UeXBlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgbmF2aWdhdGUoKS5cbiAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgaGFzaENoYW5nZSxcbiAgICAgIGluZm86IG9wdGlvbnM/LmluZm8sXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0dGVkOiByZXN1bHQuY29tbWl0dGVkLFxuICAgICAgZmluaXNoZWQ6IHJlc3VsdC5maW5pc2hlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYGhpc3RvcnkucHVzaFN0YXRlKClgLiAqL1xuICBwdXNoU3RhdGUoZGF0YTogdW5rbm93biwgdGl0bGU6IHN0cmluZywgdXJsPzogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoT3JSZXBsYWNlU3RhdGUoJ3B1c2gnLCBkYXRhLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgpYC4gKi9cbiAgcmVwbGFjZVN0YXRlKGRhdGE6IHVua25vd24sIHRpdGxlOiBzdHJpbmcsIHVybD86IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHVzaE9yUmVwbGFjZVN0YXRlKCdyZXBsYWNlJywgZGF0YSwgdGl0bGUsIHVybCk7XG4gIH1cblxuICBwcml2YXRlIHB1c2hPclJlcGxhY2VTdGF0ZShcbiAgICAgIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZyxcbiAgICAgIGRhdGE6IHVua25vd24sXG4gICAgICBfdGl0bGU6IHN0cmluZyxcbiAgICAgIHVybD86IHN0cmluZyxcbiAgICAgICk6IHZvaWQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEsIHRoaXMuYmFzZVVSSSk7XG4gICAgY29uc3QgdG9VcmwgPSB1cmwgPyBuZXcgVVJMKHVybCwgdGhpcy5iYXNlVVJJKSA6IGZyb21Vcmw7XG5cbiAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIHRvVXJsKTtcblxuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgdXJsOiB0b1VybC50b1N0cmluZygpLFxuICAgICAgc2FtZURvY3VtZW50OiB0cnVlLFxuICAgICAgaGlzdG9yeVN0YXRlOiBkYXRhLFxuICAgIH0pO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQoKTtcblxuICAgIHRoaXMudXNlckFnZW50TmF2aWdhdGUoZGVzdGluYXRpb24sIHJlc3VsdCwge1xuICAgICAgbmF2aWdhdGlvblR5cGUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgY2FuSW50ZXJjZXB0OiB0cnVlLFxuICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciBwdXNoU3RhdGUoKSBvciByZXBsYWNlU3RhdGUoKS5cbiAgICAgIHVzZXJJbml0aWF0ZWQ6IGZhbHNlLFxuICAgICAgaGFzaENoYW5nZSxcbiAgICAgIHNraXBQb3BTdGF0ZTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLnRyYXZlcnNlVG8oKWAuICovXG4gIHRyYXZlcnNlVG8oa2V5OiBzdHJpbmcsIG9wdGlvbnM/OiBOYXZpZ2F0aW9uT3B0aW9ucyk6IEZha2VOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBmcm9tVXJsID0gbmV3IFVSTCh0aGlzLmN1cnJlbnRFbnRyeS51cmwhLCB0aGlzLmJhc2VVUkkpO1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5maW5kRW50cnkoa2V5KTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICBjb25zdCBkb21FeGNlcHRpb24gPSBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgICdJbnZhbGlkIGtleScsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgICBjb25zdCBjb21taXR0ZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29uc3QgZmluaXNoZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29tbWl0dGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIGZpbmlzaGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAoZW50cnkgPT09IHRoaXMuY3VycmVudEVudHJ5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQ6IFByb21pc2UucmVzb2x2ZSh0aGlzLmN1cnJlbnRFbnRyeSksXG4gICAgICAgIGZpbmlzaGVkOiBQcm9taXNlLnJlc29sdmUodGhpcy5jdXJyZW50RW50cnkpLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMudHJhdmVyc2FsUXVldWUuaGFzKGVudHJ5LmtleSkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nUmVzdWx0ID0gdGhpcy50cmF2ZXJzYWxRdWV1ZS5nZXQoZW50cnkua2V5KSE7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQ6IGV4aXN0aW5nUmVzdWx0LmNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQ6IGV4aXN0aW5nUmVzdWx0LmZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIG5ldyBVUkwoZW50cnkudXJsISwgdGhpcy5iYXNlVVJJKSk7XG4gICAgY29uc3QgZGVzdGluYXRpb24gPSBuZXcgRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbih7XG4gICAgICB1cmw6IGVudHJ5LnVybCEsXG4gICAgICBzdGF0ZTogZW50cnkuZ2V0U3RhdGUoKSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogZW50cnkuZ2V0SGlzdG9yeVN0YXRlKCksXG4gICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgIGlkOiBlbnRyeS5pZCxcbiAgICAgIGluZGV4OiBlbnRyeS5pbmRleCxcbiAgICAgIHNhbWVEb2N1bWVudDogZW50cnkuc2FtZURvY3VtZW50LFxuICAgIH0pO1xuICAgIHRoaXMucHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gZW50cnkuaW5kZXg7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuICAgIHRoaXMudHJhdmVyc2FsUXVldWUuc2V0KGVudHJ5LmtleSwgcmVzdWx0KTtcbiAgICB0aGlzLnJ1blRyYXZlcnNhbCgoKSA9PiB7XG4gICAgICB0aGlzLnRyYXZlcnNhbFF1ZXVlLmRlbGV0ZShlbnRyeS5rZXkpO1xuICAgICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlOiAndHJhdmVyc2UnLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgdHJhdmVyc2VUbygpLlxuICAgICAgICB1c2VySW5pdGlhdGVkOiBmYWxzZSxcbiAgICAgICAgaGFzaENoYW5nZSxcbiAgICAgICAgaW5mbzogb3B0aW9ucz8uaW5mbyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWQ6IHJlc3VsdC5jb21taXR0ZWQsXG4gICAgICBmaW5pc2hlZDogcmVzdWx0LmZpbmlzaGVkLFxuICAgIH07XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5iYWNrKClgLiAqL1xuICBiYWNrKG9wdGlvbnM/OiBOYXZpZ2F0aW9uT3B0aW9ucyk6IEZha2VOYXZpZ2F0aW9uUmVzdWx0IHtcbiAgICBpZiAodGhpcy5jdXJyZW50RW50cnlJbmRleCA9PT0gMCkge1xuICAgICAgY29uc3QgZG9tRXhjZXB0aW9uID0gbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICAnQ2Fubm90IGdvIGJhY2snLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleCAtIDFdO1xuICAgIHJldHVybiB0aGlzLnRyYXZlcnNlVG8oZW50cnkua2V5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmZvcndhcmQoKWAuICovXG4gIGZvcndhcmQob3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGlmICh0aGlzLmN1cnJlbnRFbnRyeUluZGV4ID09PSB0aGlzLmVudHJpZXNBcnIubGVuZ3RoIC0gMSkge1xuICAgICAgY29uc3QgZG9tRXhjZXB0aW9uID0gbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICAnQ2Fubm90IGdvIGZvcndhcmQnLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleCArIDFdO1xuICAgIHJldHVybiB0aGlzLnRyYXZlcnNlVG8oZW50cnkua2V5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFcXVpdmFsZW50IHRvIGBoaXN0b3J5LmdvKClgLlxuICAgKiBOb3RlIHRoYXQgdGhpcyBtZXRob2QgZG9lcyBub3QgYWN0dWFsbHkgd29yayBwcmVjaXNlbHkgdG8gaG93IENocm9tZVxuICAgKiBkb2VzLCBpbnN0ZWFkIGNob29zaW5nIGEgc2ltcGxlciBtb2RlbCB3aXRoIGxlc3MgdW5leHBlY3RlZCBiZWhhdmlvci5cbiAgICogQ2hyb21lIGhhcyBhIGZldyBlZGdlIGNhc2Ugb3B0aW1pemF0aW9ucywgZm9yIGluc3RhbmNlIHdpdGggcmVwZWF0ZWRcbiAgICogYGJhY2soKTsgZm9yd2FyZCgpYCBjaGFpbnMgaXQgY29sbGFwc2VzIGNlcnRhaW4gdHJhdmVyc2Fscy5cbiAgICovXG4gIGdvKGRpcmVjdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0SW5kZXggPSB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCArIGRpcmVjdGlvbjtcbiAgICBpZiAodGFyZ2V0SW5kZXggPj0gdGhpcy5lbnRyaWVzQXJyLmxlbmd0aCB8fCB0YXJnZXRJbmRleCA8IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICB0aGlzLnJ1blRyYXZlcnNhbCgoKSA9PiB7XG4gICAgICAvLyBDaGVjayBhZ2FpbiB0aGF0IGRlc3RpbmF0aW9uIGlzIGluIHRoZSBlbnRyaWVzIGFycmF5LlxuICAgICAgaWYgKHRhcmdldEluZGV4ID49IHRoaXMuZW50cmllc0Fyci5sZW5ndGggfHwgdGFyZ2V0SW5kZXggPCAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEsIHRoaXMuYmFzZVVSSSk7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc0Fyclt0YXJnZXRJbmRleF07XG4gICAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIG5ldyBVUkwoZW50cnkudXJsISwgdGhpcy5iYXNlVVJJKSk7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgICAgdXJsOiBlbnRyeS51cmwhLFxuICAgICAgICBzdGF0ZTogZW50cnkuZ2V0U3RhdGUoKSxcbiAgICAgICAgaGlzdG9yeVN0YXRlOiBlbnRyeS5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgICAga2V5OiBlbnRyeS5rZXksXG4gICAgICAgIGlkOiBlbnRyeS5pZCxcbiAgICAgICAgaW5kZXg6IGVudHJ5LmluZGV4LFxuICAgICAgICBzYW1lRG9jdW1lbnQ6IGVudHJ5LnNhbWVEb2N1bWVudCxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCgpO1xuICAgICAgdGhpcy51c2VyQWdlbnROYXZpZ2F0ZShkZXN0aW5hdGlvbiwgcmVzdWx0LCB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlOiAndHJhdmVyc2UnLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBjYW5JbnRlcmNlcHQ6IHRydWUsXG4gICAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgZ28oKS5cbiAgICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSdW5zIGEgdHJhdmVyc2FsIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHkgKi9cbiAgcHJpdmF0ZSBydW5UcmF2ZXJzYWwodHJhdmVyc2FsOiAoKSA9PiB2b2lkKSB7XG4gICAgaWYgKHRoaXMuc3luY2hyb25vdXNUcmF2ZXJzYWxzKSB7XG4gICAgICB0cmF2ZXJzYWwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBFYWNoIHRyYXZlcnNhbCBvY2N1cGllcyBhIHNpbmdsZSB0aW1lb3V0IHJlc29sdXRpb24uXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IFByb21pc2VzIGFkZGVkIHRvIGNvbW1pdCBhbmQgZmluaXNoIHNob3VsZCByZXNvbHZlXG4gICAgLy8gYmVmb3JlIHRoZSBuZXh0IHRyYXZlcnNhbC5cbiAgICB0aGlzLm5leHRUcmF2ZXJzYWwgPSB0aGlzLm5leHRUcmF2ZXJzYWwudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHRyYXZlcnNhbCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uYWRkRXZlbnRMaXN0ZW5lcigpYC4gKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIHR5cGU6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LFxuICAgICAgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zfGJvb2xlYW4sXG4gICkge1xuICAgIHRoaXMuZXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5yZW1vdmVFdmVudExpc3RlbmVyKClgLiAqL1xuICByZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgICBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnN8Ym9vbGVhbixcbiAgKSB7XG4gICAgdGhpcy5ldmVudFRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmRpc3BhdGNoRXZlbnQoKWAgKi9cbiAgZGlzcGF0Y2hFdmVudChldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgcmVzb3VyY2VzLiAqL1xuICBkaXNwb3NlKCkge1xuICAgIC8vIFJlY3JlYXRlIGV2ZW50VGFyZ2V0IHRvIHJlbGVhc2UgY3VycmVudCBsaXN0ZW5lcnMuXG4gICAgLy8gYGRvY3VtZW50LmNyZWF0ZUVsZW1lbnRgIGJlY2F1c2UgTm9kZUpTIGBFdmVudFRhcmdldGAgaXMgaW5jb21wYXRpYmxlIHdpdGggRG9taW5vJ3MgYEV2ZW50YC5cbiAgICB0aGlzLmV2ZW50VGFyZ2V0ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kaXNwb3NlZCA9IHRydWU7XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIHRoaXMgZmFrZSBpcyBkaXNwb3NlZC4gKi9cbiAgaXNEaXNwb3NlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwb3NlZDtcbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiBmb3IgYWxsIG5hdmlnYXRpb25zIGFuZCB0cmF2ZXJzYWxzLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudE5hdmlnYXRlKFxuICAgICAgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24sXG4gICAgICByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdCxcbiAgICAgIG9wdGlvbnM6IEludGVybmFsTmF2aWdhdGVPcHRpb25zLFxuICApIHtcbiAgICAvLyBUaGUgZmlyc3QgbmF2aWdhdGlvbiBzaG91bGQgZGlzYWxsb3cgYW55IGZ1dHVyZSBjYWxscyB0byBzZXQgdGhlIGluaXRpYWxcbiAgICAvLyBlbnRyeS5cbiAgICB0aGlzLmNhblNldEluaXRpYWxFbnRyeSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLm5hdmlnYXRlRXZlbnQpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVFdmVudC5jYW5jZWwoXG4gICAgICAgICAgbmV3IERPTUV4Y2VwdGlvbignTmF2aWdhdGlvbiB3YXMgYWJvcnRlZCcsICdBYm9ydEVycm9yJyksXG4gICAgICApO1xuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IG5hdmlnYXRlRXZlbnQgPSBjcmVhdGVGYWtlTmF2aWdhdGVFdmVudCh7XG4gICAgICBuYXZpZ2F0aW9uVHlwZTogb3B0aW9ucy5uYXZpZ2F0aW9uVHlwZSxcbiAgICAgIGNhbmNlbGFibGU6IG9wdGlvbnMuY2FuY2VsYWJsZSxcbiAgICAgIGNhbkludGVyY2VwdDogb3B0aW9ucy5jYW5JbnRlcmNlcHQsXG4gICAgICB1c2VySW5pdGlhdGVkOiBvcHRpb25zLnVzZXJJbml0aWF0ZWQsXG4gICAgICBoYXNoQ2hhbmdlOiBvcHRpb25zLmhhc2hDaGFuZ2UsXG4gICAgICBzaWduYWw6IHJlc3VsdC5zaWduYWwsXG4gICAgICBkZXN0aW5hdGlvbixcbiAgICAgIGluZm86IG9wdGlvbnMuaW5mbyxcbiAgICAgIHNhbWVEb2N1bWVudDogZGVzdGluYXRpb24uc2FtZURvY3VtZW50LFxuICAgICAgc2tpcFBvcFN0YXRlOiBvcHRpb25zLnNraXBQb3BTdGF0ZSxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHVzZXJBZ2VudENvbW1pdDogKCkgPT4ge1xuICAgICAgICB0aGlzLnVzZXJBZ2VudENvbW1pdCgpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMubmF2aWdhdGVFdmVudCA9IG5hdmlnYXRlRXZlbnQ7XG4gICAgdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KG5hdmlnYXRlRXZlbnQpO1xuICAgIG5hdmlnYXRlRXZlbnQuZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQoKTtcbiAgICBpZiAobmF2aWdhdGVFdmVudC5jb21taXRPcHRpb24gPT09ICdpbW1lZGlhdGUnKSB7XG4gICAgICBuYXZpZ2F0ZUV2ZW50LmNvbW1pdCgvKiBpbnRlcm5hbD0gKi8gdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEltcGxlbWVudGF0aW9uIHRvIGNvbW1pdCBhIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50Q29tbWl0KCkge1xuICAgIGlmICghdGhpcy5uYXZpZ2F0ZUV2ZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZyb20gPSB0aGlzLmN1cnJlbnRFbnRyeTtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudC5zYW1lRG9jdW1lbnQpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdDYW5ub3QgbmF2aWdhdGUgdG8gYSBub24tc2FtZS1kb2N1bWVudCBVUkwuJyk7XG4gICAgICB0aGlzLm5hdmlnYXRlRXZlbnQuY2FuY2VsKGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBpZiAodGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAncHVzaCcgfHxcbiAgICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAncmVwbGFjZScpIHtcbiAgICAgIHRoaXMudXNlckFnZW50UHVzaE9yUmVwbGFjZSh0aGlzLm5hdmlnYXRlRXZlbnQuZGVzdGluYXRpb24sIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGU6IHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAndHJhdmVyc2UnKSB7XG4gICAgICB0aGlzLnVzZXJBZ2VudFRyYXZlcnNlKHRoaXMubmF2aWdhdGVFdmVudC5kZXN0aW5hdGlvbik7XG4gICAgfVxuICAgIHRoaXMubmF2aWdhdGVFdmVudC51c2VyQWdlbnROYXZpZ2F0ZWQodGhpcy5jdXJyZW50RW50cnkpO1xuICAgIGNvbnN0IGN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50ID0gY3JlYXRlRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudChcbiAgICAgICAge2Zyb20sIG5hdmlnYXRpb25UeXBlOiB0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGV9LFxuICAgICk7XG4gICAgdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KGN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KTtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudC5za2lwUG9wU3RhdGUpIHtcbiAgICAgIGNvbnN0IHBvcFN0YXRlRXZlbnQgPSBjcmVhdGVQb3BTdGF0ZUV2ZW50KHtcbiAgICAgICAgc3RhdGU6IHRoaXMubmF2aWdhdGVFdmVudC5kZXN0aW5hdGlvbi5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy53aW5kb3cuZGlzcGF0Y2hFdmVudChwb3BTdGF0ZUV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gZm9yIGEgcHVzaCBvciByZXBsYWNlIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50UHVzaE9yUmVwbGFjZShcbiAgICAgIGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uLFxuICAgICAge25hdmlnYXRpb25UeXBlfToge25hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZ30sXG4gICkge1xuICAgIGlmIChuYXZpZ2F0aW9uVHlwZSA9PT0gJ3B1c2gnKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFbnRyeUluZGV4Kys7XG4gICAgICB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCA9IHRoaXMuY3VycmVudEVudHJ5SW5kZXg7XG4gICAgfVxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jdXJyZW50RW50cnlJbmRleDtcbiAgICBjb25zdCBrZXkgPSBuYXZpZ2F0aW9uVHlwZSA9PT0gJ3B1c2gnID8gU3RyaW5nKHRoaXMubmV4dEtleSsrKSA6IHRoaXMuY3VycmVudEVudHJ5LmtleTtcbiAgICBjb25zdCBlbnRyeSA9IG5ldyBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeShkZXN0aW5hdGlvbi51cmwsIHtcbiAgICAgIGlkOiBTdHJpbmcodGhpcy5uZXh0SWQrKyksXG4gICAgICBrZXksXG4gICAgICBpbmRleCxcbiAgICAgIHNhbWVEb2N1bWVudDogdHJ1ZSxcbiAgICAgIHN0YXRlOiBkZXN0aW5hdGlvbi5nZXRTdGF0ZSgpLFxuICAgICAgaGlzdG9yeVN0YXRlOiBkZXN0aW5hdGlvbi5nZXRIaXN0b3J5U3RhdGUoKSxcbiAgICB9KTtcbiAgICBpZiAobmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJykge1xuICAgICAgdGhpcy5lbnRyaWVzQXJyLnNwbGljZShpbmRleCwgSW5maW5pdHksIGVudHJ5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbnRyaWVzQXJyW2luZGV4XSA9IGVudHJ5O1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiBmb3IgYSB0cmF2ZXJzZSBuYXZpZ2F0aW9uLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudFRyYXZlcnNlKGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKSB7XG4gICAgdGhpcy5jdXJyZW50RW50cnlJbmRleCA9IGRlc3RpbmF0aW9uLmluZGV4O1xuICB9XG5cbiAgLyoqIFV0aWxpdHkgbWV0aG9kIGZvciBmaW5kaW5nIGVudHJpZXMgd2l0aCB0aGUgZ2l2ZW4gYGtleWAuICovXG4gIHByaXZhdGUgZmluZEVudHJ5KGtleTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmVudHJpZXNBcnIpIHtcbiAgICAgIGlmIChlbnRyeS5rZXkgPT09IGtleSkgcmV0dXJuIGVudHJ5O1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgc2V0IG9ubmF2aWdhdGUoX2hhbmRsZXI6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRlRXZlbnQpID0+IGFueSl8bnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGUoKTogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGVFdmVudCkgPT4gYW55KXxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbmN1cnJlbnRlbnRyeWNoYW5nZShfaGFuZGxlcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQpID0+IGFueSl8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25jdXJyZW50ZW50cnljaGFuZ2UoKTpcbiAgICAgICgodGhpczogTmF2aWdhdGlvbiwgZXY6IE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCkgPT4gYW55KXxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbm5hdmlnYXRlc3VjY2VzcyhfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXZlbnQpID0+IGFueSl8bnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGVzdWNjZXNzKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpfG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc2V0IG9ubmF2aWdhdGVlcnJvcihfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXJyb3JFdmVudCkgPT4gYW55KXxudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25uYXZpZ2F0ZWVycm9yKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEVycm9yRXZlbnQpID0+IGFueSl8bnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgdHJhbnNpdGlvbigpOiBOYXZpZ2F0aW9uVHJhbnNpdGlvbnxudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHVwZGF0ZUN1cnJlbnRFbnRyeShfb3B0aW9uczogTmF2aWdhdGlvblVwZGF0ZUN1cnJlbnRFbnRyeU9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlbG9hZChfb3B0aW9ucz86IE5hdmlnYXRpb25SZWxvYWRPcHRpb25zKTogTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgdGhlIGBOYXZpZ2F0aW9uUmVzdWx0YCBpbnRlcmZhY2Ugd2l0aFxuICogYEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5YC5cbiAqL1xuaW50ZXJmYWNlIEZha2VOYXZpZ2F0aW9uUmVzdWx0IGV4dGVuZHMgTmF2aWdhdGlvblJlc3VsdCB7XG4gIHJlYWRvbmx5IGNvbW1pdHRlZDogUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT47XG4gIHJlYWRvbmx5IGZpbmlzaGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5Pjtcbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25IaXN0b3J5RW50cnlgLlxuICovXG5leHBvcnQgY2xhc3MgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkgaW1wbGVtZW50cyBOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5IHtcbiAgcmVhZG9ubHkgc2FtZURvY3VtZW50O1xuXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGtleTogc3RyaW5nO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlOiB1bmtub3duO1xuICBwcml2YXRlIHJlYWRvbmx5IGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gIG9uZGlzcG9zZTogKCh0aGlzOiBOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5LCBldjogRXZlbnQpID0+IGFueSl8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSB1cmw6IHN0cmluZ3xudWxsLFxuICAgICAge1xuICAgICAgICBpZCxcbiAgICAgICAga2V5LFxuICAgICAgICBpbmRleCxcbiAgICAgICAgc2FtZURvY3VtZW50LFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgaGlzdG9yeVN0YXRlLFxuICAgICAgfToge1xuICAgICAgICBpZDogc3RyaW5nOyBrZXk6IHN0cmluZzsgaW5kZXg6IG51bWJlcjsgc2FtZURvY3VtZW50OiBib29sZWFuOyBoaXN0b3J5U3RhdGU6IHVua25vd247XG4gICAgICAgIHN0YXRlPzogdW5rbm93bjtcbiAgICAgIH0sXG4gICkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5zYW1lRG9jdW1lbnQgPSBzYW1lRG9jdW1lbnQ7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuaGlzdG9yeVN0YXRlID0gaGlzdG9yeVN0YXRlO1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgLy8gQnVkZ2V0IGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUpKSA6IHRoaXMuc3RhdGU7XG4gIH1cblxuICBnZXRIaXN0b3J5U3RhdGUoKTogdW5rbm93biB7XG4gICAgLy8gQnVkZ2V0IGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeVN0YXRlID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlTdGF0ZSkpIDogdGhpcy5oaXN0b3J5U3RhdGU7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnN8Ym9vbGVhbixcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgICBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnN8Ym9vbGVhbixcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBkaXNwYXRjaEV2ZW50KGV2ZW50OiBFdmVudCk6IGJvb2xlYW4ge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbi8qKiBgTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnNgIHdpdGggZXhwZXJpbWVudGFsIGNvbW1pdCBvcHRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIEV4cGVyaW1lbnRhbE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zIGV4dGVuZHMgTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMge1xuICBjb21taXQ/OiAnaW1tZWRpYXRlJ3wnYWZ0ZXItdHJhbnNpdGlvbic7XG59XG5cbi8qKiBgTmF2aWdhdGVFdmVudGAgd2l0aCBleHBlcmltZW50YWwgY29tbWl0IGZ1bmN0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBlcmltZW50YWxOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgTmF2aWdhdGVFdmVudCB7XG4gIGludGVyY2VwdChvcHRpb25zPzogRXhwZXJpbWVudGFsTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMpOiB2b2lkO1xuXG4gIGNvbW1pdCgpOiB2b2lkO1xufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGVFdmVudGAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFrZU5hdmlnYXRlRXZlbnQgZXh0ZW5kcyBFeHBlcmltZW50YWxOYXZpZ2F0ZUV2ZW50IHtcbiAgcmVhZG9ubHkgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb247XG59XG5cbmludGVyZmFjZSBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgRmFrZU5hdmlnYXRlRXZlbnQge1xuICByZWFkb25seSBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IHNraXBQb3BTdGF0ZT86IGJvb2xlYW47XG4gIHJlYWRvbmx5IGNvbW1pdE9wdGlvbjogJ2FmdGVyLXRyYW5zaXRpb24nfCdpbW1lZGlhdGUnO1xuICByZWFkb25seSByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdDtcblxuICBjb21taXQoaW50ZXJuYWw/OiBib29sZWFuKTogdm9pZDtcbiAgY2FuY2VsKHJlYXNvbjogRXJyb3IpOiB2b2lkO1xuICBkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCgpOiB2b2lkO1xuICB1c2VyQWdlbnROYXZpZ2F0ZWQoZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KTogdm9pZDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRlRXZlbnRgLiBUaGlzIGlzIG5vdCBhIGNsYXNzIGJlY2F1c2UgRVM1XG4gKiB0cmFuc3BpbGVkIEphdmFTY3JpcHQgY2Fubm90IGV4dGVuZCBuYXRpdmUgRXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZha2VOYXZpZ2F0ZUV2ZW50KHtcbiAgY2FuY2VsYWJsZSxcbiAgY2FuSW50ZXJjZXB0LFxuICB1c2VySW5pdGlhdGVkLFxuICBoYXNoQ2hhbmdlLFxuICBuYXZpZ2F0aW9uVHlwZSxcbiAgc2lnbmFsLFxuICBkZXN0aW5hdGlvbixcbiAgaW5mbyxcbiAgc2FtZURvY3VtZW50LFxuICBza2lwUG9wU3RhdGUsXG4gIHJlc3VsdCxcbiAgdXNlckFnZW50Q29tbWl0LFxufToge1xuICBjYW5jZWxhYmxlOiBib29sZWFuOyBjYW5JbnRlcmNlcHQ6IGJvb2xlYW47IHVzZXJJbml0aWF0ZWQ6IGJvb2xlYW47IGhhc2hDaGFuZ2U6IGJvb2xlYW47XG4gIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbDtcbiAgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb247XG4gIGluZm86IHVua25vd247XG4gIHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgc2tpcFBvcFN0YXRlPzogYm9vbGVhbjsgcmVzdWx0OiBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQ7IHVzZXJBZ2VudENvbW1pdDogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ25hdmlnYXRlJywge2J1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlfSkgYXMge1xuICAgIC1yZWFkb25seVtQIGluIGtleW9mIEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnRdOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50W1BdO1xuICB9O1xuICBldmVudC5jYW5JbnRlcmNlcHQgPSBjYW5JbnRlcmNlcHQ7XG4gIGV2ZW50LnVzZXJJbml0aWF0ZWQgPSB1c2VySW5pdGlhdGVkO1xuICBldmVudC5oYXNoQ2hhbmdlID0gaGFzaENoYW5nZTtcbiAgZXZlbnQubmF2aWdhdGlvblR5cGUgPSBuYXZpZ2F0aW9uVHlwZTtcbiAgZXZlbnQuc2lnbmFsID0gc2lnbmFsO1xuICBldmVudC5kZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uO1xuICBldmVudC5pbmZvID0gaW5mbztcbiAgZXZlbnQuZG93bmxvYWRSZXF1ZXN0ID0gbnVsbDtcbiAgZXZlbnQuZm9ybURhdGEgPSBudWxsO1xuXG4gIGV2ZW50LnNhbWVEb2N1bWVudCA9IHNhbWVEb2N1bWVudDtcbiAgZXZlbnQuc2tpcFBvcFN0YXRlID0gc2tpcFBvcFN0YXRlO1xuICBldmVudC5jb21taXRPcHRpb24gPSAnaW1tZWRpYXRlJztcblxuICBsZXQgaGFuZGxlckZpbmlzaGVkOiBQcm9taXNlPHZvaWQ+fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgbGV0IGludGVyY2VwdENhbGxlZCA9IGZhbHNlO1xuICBsZXQgZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQgPSBmYWxzZTtcbiAgbGV0IGNvbW1pdENhbGxlZCA9IGZhbHNlO1xuXG4gIGV2ZW50LmludGVyY2VwdCA9IGZ1bmN0aW9uKFxuICAgICAgdGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCxcbiAgICAgIG9wdGlvbnM/OiBFeHBlcmltZW50YWxOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyxcbiAgICAgICk6IHZvaWQge1xuICAgIGludGVyY2VwdENhbGxlZCA9IHRydWU7XG4gICAgZXZlbnQuc2FtZURvY3VtZW50ID0gdHJ1ZTtcbiAgICBjb25zdCBoYW5kbGVyID0gb3B0aW9ucz8uaGFuZGxlcjtcbiAgICBpZiAoaGFuZGxlcikge1xuICAgICAgaGFuZGxlckZpbmlzaGVkID0gaGFuZGxlcigpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uY29tbWl0KSB7XG4gICAgICBldmVudC5jb21taXRPcHRpb24gPSBvcHRpb25zLmNvbW1pdDtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LmZvY3VzUmVzZXQgIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zPy5zY3JvbGwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gICAgfVxuICB9O1xuXG4gIGV2ZW50LnNjcm9sbCA9IGZ1bmN0aW9uKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfTtcblxuICBldmVudC5jb21taXQgPSBmdW5jdGlvbih0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LCBpbnRlcm5hbCA9IGZhbHNlKSB7XG4gICAgaWYgKCFpbnRlcm5hbCAmJiAhaW50ZXJjZXB0Q2FsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgIGBGYWlsZWQgdG8gZXhlY3V0ZSAnY29tbWl0JyBvbiAnTmF2aWdhdGVFdmVudCc6IGludGVyY2VwdCgpIG11c3QgYmUgYCArXG4gICAgICAgICAgICAgIGBjYWxsZWQgYmVmb3JlIGNvbW1pdCgpLmAsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgYEZhaWxlZCB0byBleGVjdXRlICdjb21taXQnIG9uICdOYXZpZ2F0ZUV2ZW50JzogY29tbWl0KCkgbWF5IG5vdCBiZSBgICtcbiAgICAgICAgICAgICAgYGNhbGxlZCBkdXJpbmcgZXZlbnQgZGlzcGF0Y2guYCxcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGNvbW1pdENhbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ2NvbW1pdCcgb24gJ05hdmlnYXRlRXZlbnQnOiBjb21taXQoKSBhbHJlYWR5IGAgK1xuICAgICAgICAgICAgICBgY2FsbGVkLmAsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbW1pdENhbGxlZCA9IHRydWU7XG5cbiAgICB1c2VyQWdlbnRDb21taXQoKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBvbmx5LlxuICBldmVudC5jYW5jZWwgPSBmdW5jdGlvbih0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LCByZWFzb246IEVycm9yKSB7XG4gICAgcmVzdWx0LmNvbW1pdHRlZFJlamVjdChyZWFzb24pO1xuICAgIHJlc3VsdC5maW5pc2hlZFJlamVjdChyZWFzb24pO1xuICB9O1xuXG4gIC8vIEludGVybmFsIG9ubHkuXG4gIGV2ZW50LmRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50ID0gZnVuY3Rpb24odGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCkge1xuICAgIGRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50ID0gdHJ1ZTtcbiAgICBpZiAoZXZlbnQuY29tbWl0T3B0aW9uID09PSAnYWZ0ZXItdHJhbnNpdGlvbicpIHtcbiAgICAgIC8vIElmIGhhbmRsZXIgZmluaXNoZXMgYmVmb3JlIGNvbW1pdCwgY2FsbCBjb21taXQuXG4gICAgICBoYW5kbGVyRmluaXNoZWQ/LnRoZW4oXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjb21taXRDYWxsZWQpIHtcbiAgICAgICAgICAgICAgZXZlbnQuY29tbWl0KC8qIGludGVybmFsICovIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgKCkgPT4ge30sXG4gICAgICApO1xuICAgIH1cbiAgICBQcm9taXNlLmFsbChbcmVzdWx0LmNvbW1pdHRlZCwgaGFuZGxlckZpbmlzaGVkXSlcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoW2VudHJ5XSkgPT4ge1xuICAgICAgICAgICAgICByZXN1bHQuZmluaXNoZWRSZXNvbHZlKGVudHJ5KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgIHJlc3VsdC5maW5pc2hlZFJlamVjdChyZWFzb24pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBvbmx5LlxuICBldmVudC51c2VyQWdlbnROYXZpZ2F0ZWQgPSBmdW5jdGlvbihcbiAgICAgIHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsXG4gICAgICBlbnRyeTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnksXG4gICkge1xuICAgIHJlc3VsdC5jb21taXR0ZWRSZXNvbHZlKGVudHJ5KTtcbiAgfTtcblxuICByZXR1cm4gZXZlbnQgYXMgSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudDtcbn1cblxuLyoqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50YC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCBleHRlbmRzIE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCB7XG4gIHJlYWRvbmx5IGZyb206IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZWAuIFRoaXMgZG9lcyBub3QgdXNlXG4gKiBhIGNsYXNzIGJlY2F1c2UgRVM1IHRyYW5zcGlsZWQgSmF2YVNjcmlwdCBjYW5ub3QgZXh0ZW5kIG5hdGl2ZSBFdmVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCh7XG4gIGZyb20sXG4gIG5hdmlnYXRpb25UeXBlLFxufToge2Zyb206IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5OyBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7fSkge1xuICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnY3VycmVudGVudHJ5Y2hhbmdlJywge1xuICAgICAgICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KSBhcyB7XG4gICAgLXJlYWRvbmx5W1AgaW4ga2V5b2YgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50XTogTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50W1BdO1xuICB9O1xuICBldmVudC5mcm9tID0gZnJvbTtcbiAgZXZlbnQubmF2aWdhdGlvblR5cGUgPSBuYXZpZ2F0aW9uVHlwZTtcbiAgcmV0dXJuIGV2ZW50IGFzIEZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFrZSBlcXVpdmFsZW50IG9mIGBQb3BTdGF0ZUV2ZW50YC4gVGhpcyBkb2VzIG5vdCB1c2UgYSBjbGFzc1xuICogYmVjYXVzZSBFUzUgdHJhbnNwaWxlZCBKYXZhU2NyaXB0IGNhbm5vdCBleHRlbmQgbmF0aXZlIEV2ZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVQb3BTdGF0ZUV2ZW50KHtzdGF0ZX06IHtzdGF0ZTogdW5rbm93bn0pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ3BvcHN0YXRlJywge1xuICAgICAgICAgICAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KSBhcyB7LXJlYWRvbmx5W1AgaW4ga2V5b2YgUG9wU3RhdGVFdmVudF06IFBvcFN0YXRlRXZlbnRbUF19O1xuICBldmVudC5zdGF0ZSA9IHN0YXRlO1xuICByZXR1cm4gZXZlbnQgYXMgUG9wU3RhdGVFdmVudDtcbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25EZXN0aW5hdGlvbmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uIGltcGxlbWVudHMgTmF2aWdhdGlvbkRlc3RpbmF0aW9uIHtcbiAgcmVhZG9ubHkgdXJsOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgcmVhZG9ubHkga2V5OiBzdHJpbmd8bnVsbDtcbiAgcmVhZG9ubHkgaWQ6IHN0cmluZ3xudWxsO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhdGU/OiB1bmtub3duO1xuICBwcml2YXRlIHJlYWRvbmx5IGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdXJsLFxuICAgIHNhbWVEb2N1bWVudCxcbiAgICBoaXN0b3J5U3RhdGUsXG4gICAgc3RhdGUsXG4gICAga2V5ID0gbnVsbCxcbiAgICBpZCA9IG51bGwsXG4gICAgaW5kZXggPSAtMSxcbiAgfToge1xuICAgIHVybDogc3RyaW5nOyBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47IGhpc3RvcnlTdGF0ZTogdW5rbm93bjtcbiAgICBzdGF0ZT86IHVua25vd247XG4gICAga2V5Pzogc3RyaW5nIHwgbnVsbDtcbiAgICBpZD86IHN0cmluZyB8IG51bGw7XG4gICAgaW5kZXg/OiBudW1iZXI7XG4gIH0pIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLnNhbWVEb2N1bWVudCA9IHNhbWVEb2N1bWVudDtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5oaXN0b3J5U3RhdGUgPSBoaXN0b3J5U3RhdGU7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICB9XG5cbiAgZ2V0SGlzdG9yeVN0YXRlKCk6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnlTdGF0ZTtcbiAgfVxufVxuXG4vKiogVXRpbGl0eSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gVXJsTGlrZSBoYXZlIHRoZSBzYW1lIGhhc2guICovXG5mdW5jdGlvbiBpc0hhc2hDaGFuZ2UoZnJvbTogVVJMLCB0bzogVVJMKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgICB0by5oYXNoICE9PSBmcm9tLmhhc2ggJiYgdG8uaG9zdG5hbWUgPT09IGZyb20uaG9zdG5hbWUgJiYgdG8ucGF0aG5hbWUgPT09IGZyb20ucGF0aG5hbWUgJiZcbiAgICAgIHRvLnNlYXJjaCA9PT0gZnJvbS5zZWFyY2gpO1xufVxuXG4vKiogSW50ZXJuYWwgdXRpbGl0eSBjbGFzcyBmb3IgcmVwcmVzZW50aW5nIHRoZSByZXN1bHQgb2YgYSBuYXZpZ2F0aW9uLiAgKi9cbmNsYXNzIEludGVybmFsTmF2aWdhdGlvblJlc3VsdCB7XG4gIGNvbW1pdHRlZFJlc29sdmUhOiAoZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KSA9PiB2b2lkO1xuICBjb21taXR0ZWRSZWplY3QhOiAocmVhc29uOiBFcnJvcikgPT4gdm9pZDtcbiAgZmluaXNoZWRSZXNvbHZlITogKGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSkgPT4gdm9pZDtcbiAgZmluaXNoZWRSZWplY3QhOiAocmVhc29uOiBFcnJvcikgPT4gdm9pZDtcbiAgcmVhZG9ubHkgY29tbWl0dGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PjtcbiAgcmVhZG9ubHkgZmluaXNoZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xuICBnZXQgc2lnbmFsKCk6IEFib3J0U2lnbmFsIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICB9XG4gIHByaXZhdGUgcmVhZG9ubHkgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29tbWl0dGVkID0gbmV3IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+KFxuICAgICAgICAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21taXR0ZWRSZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICB0aGlzLmNvbW1pdHRlZFJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSxcbiAgICApO1xuXG4gICAgdGhpcy5maW5pc2hlZCA9IG5ldyBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PihcbiAgICAgICAgYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHRoaXMuZmluaXNoZWRSZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICB0aGlzLmZpbmlzaGVkUmVqZWN0ID0gKHJlYXNvbjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgICAgICAgdGhpcy5hYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICk7XG4gICAgLy8gQWxsIHJlamVjdGlvbnMgYXJlIGhhbmRsZWQuXG4gICAgdGhpcy5jb21taXR0ZWQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHRoaXMuZmluaXNoZWQuY2F0Y2goKCkgPT4ge30pO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBvcHRpb25zIGZvciBwZXJmb3JtaW5nIGEgbmF2aWdhdGUuICovXG5pbnRlcmZhY2UgSW50ZXJuYWxOYXZpZ2F0ZU9wdGlvbnMge1xuICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmc7XG4gIGNhbmNlbGFibGU6IGJvb2xlYW47XG4gIGNhbkludGVyY2VwdDogYm9vbGVhbjtcbiAgdXNlckluaXRpYXRlZDogYm9vbGVhbjtcbiAgaGFzaENoYW5nZTogYm9vbGVhbjtcbiAgaW5mbz86IHVua25vd247XG4gIHNraXBQb3BTdGF0ZT86IGJvb2xlYW47XG59XG4iXX0=