import { EventEmitter, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A spy for {\@link Location} that allows tests to fire simulated location events.
 *
 * \@experimental
 */
export class SpyLocation {
    constructor() {
        this.urlChanges = [];
        this._history = [new LocationState('', '', null)];
        this._historyIndex = 0;
        /**
         * \@internal
         */
        this._subject = new EventEmitter();
        /**
         * \@internal
         */
        this._baseHref = '';
        /**
         * \@internal
         */
        this._platformStrategy = /** @type {?} */ ((null));
    }
    /**
     * @param {?} url
     * @return {?}
     */
    setInitialPath(url) { this._history[this._historyIndex].path = url; }
    /**
     * @param {?} url
     * @return {?}
     */
    setBaseHref(url) { this._baseHref = url; }
    /**
     * @return {?}
     */
    path() { return this._history[this._historyIndex].path; }
    /**
     * @return {?}
     */
    state() { return this._history[this._historyIndex].state; }
    /**
     * @param {?} path
     * @param {?=} query
     * @return {?}
     */
    isCurrentPathEqualTo(path, query = '') {
        /** @type {?} */
        const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
        /** @type {?} */
        const currPath = this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();
        return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
    }
    /**
     * @param {?} pathname
     * @return {?}
     */
    simulateUrlPop(pathname) {
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
    }
    /**
     * @param {?} pathname
     * @return {?}
     */
    simulateHashChange(pathname) {
        // Because we don't prevent the native event, the browser will independently update the path
        this.setInitialPath(pathname);
        this.urlChanges.push('hash: ' + pathname);
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'hashchange' });
    }
    /**
     * @param {?} url
     * @return {?}
     */
    prepareExternalUrl(url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    }
    /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    go(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        if (this._historyIndex > 0) {
            this._history.splice(this._historyIndex + 1);
        }
        this._history.push(new LocationState(path, query, state));
        this._historyIndex = this._history.length - 1;
        /** @type {?} */
        const locationState = this._history[this._historyIndex - 1];
        if (locationState.path == path && locationState.query == query) {
            return;
        }
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
        this._subject.emit({ 'url': url, 'pop': false });
    }
    /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    replaceState(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        /** @type {?} */
        const history = this._history[this._historyIndex];
        if (history.path == path && history.query == query) {
            return;
        }
        history.path = path;
        history.query = query;
        history.state = state;
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push('replace: ' + url);
    }
    /**
     * @return {?}
     */
    forward() {
        if (this._historyIndex < (this._history.length - 1)) {
            this._historyIndex++;
            this._subject.emit({ 'url': this.path(), 'state': this.state(), 'pop': true });
        }
    }
    /**
     * @return {?}
     */
    back() {
        if (this._historyIndex > 0) {
            this._historyIndex--;
            this._subject.emit({ 'url': this.path(), 'state': this.state(), 'pop': true });
        }
    }
    /**
     * @param {?} onNext
     * @param {?=} onThrow
     * @param {?=} onReturn
     * @return {?}
     */
    subscribe(onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    }
    /**
     * @param {?} url
     * @return {?}
     */
    normalize(url) { return /** @type {?} */ ((null)); }
}
SpyLocation.decorators = [
    { type: Injectable },
];
SpyLocation.ngInjectableDef = i0.defineInjectable({ token: SpyLocation, factory: function SpyLocation_Factory(t) { return new (t || SpyLocation)(); }, providedIn: null });
if (false) {
    /** @type {?} */
    SpyLocation.prototype.urlChanges;
    /** @type {?} */
    SpyLocation.prototype._history;
    /** @type {?} */
    SpyLocation.prototype._historyIndex;
    /**
     * \@internal
     * @type {?}
     */
    SpyLocation.prototype._subject;
    /**
     * \@internal
     * @type {?}
     */
    SpyLocation.prototype._baseHref;
    /**
     * \@internal
     * @type {?}
     */
    SpyLocation.prototype._platformStrategy;
}
class LocationState {
    /**
     * @param {?} path
     * @param {?} query
     * @param {?} state
     */
    constructor(path, query, state) {
        this.path = path;
        this.query = query;
        this.state = state;
    }
}
if (false) {
    /** @type {?} */
    LocationState.prototype.path;
    /** @type {?} */
    LocationState.prototype.query;
    /** @type {?} */
    LocationState.prototype.state;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9sb2NhdGlvbl9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVdkQsTUFBTSxPQUFPLFdBQVc7OzBCQUNDLEVBQUU7d0JBQ1csQ0FBQyxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDOzZCQUNyQyxDQUFDOzs7O3dCQUVILElBQUksWUFBWSxFQUFFOzs7O3lCQUU1QixFQUFFOzs7O29EQUVnQixJQUFJOzs7Ozs7SUFFMUMsY0FBYyxDQUFDLEdBQVcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7Ozs7O0lBRTdFLFdBQVcsQ0FBQyxHQUFXLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsRUFBRTs7OztJQUVsRCxJQUFJLEtBQWEsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTs7OztJQUV6RCxLQUFLLEtBQWEsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUM7Ozs7OztJQUV6RSxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsUUFBZ0IsRUFBRTs7UUFDbkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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WUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7U0FDOUU7S0FDRjs7Ozs7OztJQUVELFNBQVMsQ0FDTCxNQUE0QixFQUFFLE9BQXFDLEVBQ25FLFFBQTRCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDcEY7Ozs7O0lBRUQsU0FBUyxDQUFDLEdBQVcsSUFBWSwwQkFBTyxJQUFJLEdBQUcsRUFBRTs7O1lBckdsRCxVQUFVOzsyREFDRSxXQUFXLDhEQUFYLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVHeEIsTUFBTSxhQUFhOzs7Ozs7SUFDakIsWUFBbUIsSUFBWSxFQUFTLEtBQWEsRUFBUyxLQUFVO1FBQXJELFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBSztLQUFJO0NBQzdFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uLCBMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25MaWtlfSBmcm9tICdyeGpzJztcblxuXG4vKipcbiAqIEEgc3B5IGZvciB7QGxpbmsgTG9jYXRpb259IHRoYXQgYWxsb3dzIHRlc3RzIHRvIGZpcmUgc2ltdWxhdGVkIGxvY2F0aW9uIGV2ZW50cy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcHlMb2NhdGlvbiBpbXBsZW1lbnRzIExvY2F0aW9uIHtcbiAgdXJsQ2hhbmdlczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfaGlzdG9yeTogTG9jYXRpb25TdGF0ZVtdID0gW25ldyBMb2NhdGlvblN0YXRlKCcnLCAnJywgbnVsbCldO1xuICBwcml2YXRlIF9oaXN0b3J5SW5kZXg6IG51bWJlciA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9iYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kgPSBudWxsICE7XG5cbiAgc2V0SW5pdGlhbFBhdGgodXJsOiBzdHJpbmcpIHsgdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXhdLnBhdGggPSB1cmw7IH1cblxuICBzZXRCYXNlSHJlZih1cmw6IHN0cmluZykgeyB0aGlzLl9iYXNlSHJlZiA9IHVybDsgfVxuXG4gIHBhdGgoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2hpc3RvcnlbdGhpcy5faGlzdG9yeUluZGV4XS5wYXRoOyB9XG5cbiAgcHJpdmF0ZSBzdGF0ZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXhdLnN0YXRlOyB9XG5cbiAgaXNDdXJyZW50UGF0aEVxdWFsVG8ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiBib29sZWFuIHtcbiAgICBjb25zdCBnaXZlblBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgPyBwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIDEpIDogcGF0aDtcbiAgICBjb25zdCBjdXJyUGF0aCA9XG4gICAgICAgIHRoaXMucGF0aCgpLmVuZHNXaXRoKCcvJykgPyB0aGlzLnBhdGgoKS5zdWJzdHJpbmcoMCwgdGhpcy5wYXRoKCkubGVuZ3RoIC0gMSkgOiB0aGlzLnBhdGgoKTtcblxuICAgIHJldHVybiBjdXJyUGF0aCA9PSBnaXZlblBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gIH1cblxuICBzaW11bGF0ZVVybFBvcChwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3ViamVjdC5lbWl0KHsndXJsJzogcGF0aG5hbWUsICdwb3AnOiB0cnVlLCAndHlwZSc6ICdwb3BzdGF0ZSd9KTtcbiAgfVxuXG4gIHNpbXVsYXRlSGFzaENoYW5nZShwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgLy8gQmVjYXVzZSB3ZSBkb24ndCBwcmV2ZW50IHRoZSBuYXRpdmUgZXZlbnQsIHRoZSBicm93c2VyIHdpbGwgaW5kZXBlbmRlbnRseSB1cGRhdGUgdGhlIHBhdGhcbiAgICB0aGlzLnNldEluaXRpYWxQYXRoKHBhdGhuYW1lKTtcbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCgnaGFzaDogJyArIHBhdGhuYW1lKTtcbiAgICB0aGlzLl9zdWJqZWN0LmVtaXQoeyd1cmwnOiBwYXRobmFtZSwgJ3BvcCc6IHRydWUsICd0eXBlJzogJ2hhc2hjaGFuZ2UnfSk7XG4gIH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwubGVuZ3RoID4gMCAmJiAhdXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgdXJsID0gJy8nICsgdXJsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYmFzZUhyZWYgKyB1cmw7XG4gIH1cblxuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpIHtcbiAgICBwYXRoID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCk7XG5cbiAgICBpZiAodGhpcy5faGlzdG9yeUluZGV4ID4gMCkge1xuICAgICAgdGhpcy5faGlzdG9yeS5zcGxpY2UodGhpcy5faGlzdG9yeUluZGV4ICsgMSk7XG4gICAgfVxuICAgIHRoaXMuX2hpc3RvcnkucHVzaChuZXcgTG9jYXRpb25TdGF0ZShwYXRoLCBxdWVyeSwgc3RhdGUpKTtcbiAgICB0aGlzLl9oaXN0b3J5SW5kZXggPSB0aGlzLl9oaXN0b3J5Lmxlbmd0aCAtIDE7XG5cbiAgICBjb25zdCBsb2NhdGlvblN0YXRlID0gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXggLSAxXTtcbiAgICBpZiAobG9jYXRpb25TdGF0ZS5wYXRoID09IHBhdGggJiYgbG9jYXRpb25TdGF0ZS5xdWVyeSA9PSBxdWVyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2godXJsKTtcbiAgICB0aGlzLl9zdWJqZWN0LmVtaXQoeyd1cmwnOiB1cmwsICdwb3AnOiBmYWxzZX0pO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCkge1xuICAgIHBhdGggPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoKTtcblxuICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLl9oaXN0b3J5W3RoaXMuX2hpc3RvcnlJbmRleF07XG4gICAgaWYgKGhpc3RvcnkucGF0aCA9PSBwYXRoICYmIGhpc3RvcnkucXVlcnkgPT0gcXVlcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBoaXN0b3J5LnBhdGggPSBwYXRoO1xuICAgIGhpc3RvcnkucXVlcnkgPSBxdWVyeTtcbiAgICBoaXN0b3J5LnN0YXRlID0gc3RhdGU7XG5cbiAgICBjb25zdCB1cmwgPSBwYXRoICsgKHF1ZXJ5Lmxlbmd0aCA+IDAgPyAoJz8nICsgcXVlcnkpIDogJycpO1xuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKCdyZXBsYWNlOiAnICsgdXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKSB7XG4gICAgaWYgKHRoaXMuX2hpc3RvcnlJbmRleCA8ICh0aGlzLl9oaXN0b3J5Lmxlbmd0aCAtIDEpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5SW5kZXgrKztcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7J3VybCc6IHRoaXMucGF0aCgpLCAnc3RhdGUnOiB0aGlzLnN0YXRlKCksICdwb3AnOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgYmFjaygpIHtcbiAgICBpZiAodGhpcy5faGlzdG9yeUluZGV4ID4gMCkge1xuICAgICAgdGhpcy5faGlzdG9yeUluZGV4LS07XG4gICAgICB0aGlzLl9zdWJqZWN0LmVtaXQoeyd1cmwnOiB0aGlzLnBhdGgoKSwgJ3N0YXRlJzogdGhpcy5zdGF0ZSgpLCAncG9wJzogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuXG4gIHN1YnNjcmliZShcbiAgICAgIG9uTmV4dDogKHZhbHVlOiBhbnkpID0+IHZvaWQsIG9uVGhyb3c/OiAoKGVycm9yOiBhbnkpID0+IHZvaWQpfG51bGwsXG4gICAgICBvblJldHVybj86ICgoKSA9PiB2b2lkKXxudWxsKTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvblRocm93LCBjb21wbGV0ZTogb25SZXR1cm59KTtcbiAgfVxuXG4gIG5vcm1hbGl6ZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBudWxsICE7IH1cbn1cblxuY2xhc3MgTG9jYXRpb25TdGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXRoOiBzdHJpbmcsIHB1YmxpYyBxdWVyeTogc3RyaW5nLCBwdWJsaWMgc3RhdGU6IGFueSkge31cbn1cbiJdfQ==