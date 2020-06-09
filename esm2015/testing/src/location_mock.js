import { EventEmitter, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @publicApi
 */
let SpyLocation = /** @class */ (() => {
    class SpyLocation {
        constructor() {
            this.urlChanges = [];
            this._history = [new LocationState('', '', null)];
            this._historyIndex = 0;
            /** @internal */
            this._subject = new EventEmitter();
            /** @internal */
            this._baseHref = '';
            /** @internal */
            this._platformStrategy = null;
            /** @internal */
            this._platformLocation = null;
            /** @internal */
            this._urlChangeListeners = [];
        }
        setInitialPath(url) {
            this._history[this._historyIndex].path = url;
        }
        setBaseHref(url) {
            this._baseHref = url;
        }
        path() {
            return this._history[this._historyIndex].path;
        }
        getState() {
            return this._history[this._historyIndex].state;
        }
        isCurrentPathEqualTo(path, query = '') {
            const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
            const currPath = this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();
            return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
        }
        simulateUrlPop(pathname) {
            this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
        }
        simulateHashChange(pathname) {
            // Because we don't prevent the native event, the browser will independently update the path
            this.setInitialPath(pathname);
            this.urlChanges.push('hash: ' + pathname);
            this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'hashchange' });
        }
        prepareExternalUrl(url) {
            if (url.length > 0 && !url.startsWith('/')) {
                url = '/' + url;
            }
            return this._baseHref + url;
        }
        go(path, query = '', state = null) {
            path = this.prepareExternalUrl(path);
            if (this._historyIndex > 0) {
                this._history.splice(this._historyIndex + 1);
            }
            this._history.push(new LocationState(path, query, state));
            this._historyIndex = this._history.length - 1;
            const locationState = this._history[this._historyIndex - 1];
            if (locationState.path == path && locationState.query == query) {
                return;
            }
            const url = path + (query.length > 0 ? ('?' + query) : '');
            this.urlChanges.push(url);
            this._subject.emit({ 'url': url, 'pop': false });
        }
        replaceState(path, query = '', state = null) {
            path = this.prepareExternalUrl(path);
            const history = this._history[this._historyIndex];
            if (history.path == path && history.query == query) {
                return;
            }
            history.path = path;
            history.query = query;
            history.state = state;
            const url = path + (query.length > 0 ? ('?' + query) : '');
            this.urlChanges.push('replace: ' + url);
        }
        forward() {
            if (this._historyIndex < (this._history.length - 1)) {
                this._historyIndex++;
                this._subject.emit({ 'url': this.path(), 'state': this.getState(), 'pop': true });
            }
        }
        back() {
            if (this._historyIndex > 0) {
                this._historyIndex--;
                this._subject.emit({ 'url': this.path(), 'state': this.getState(), 'pop': true });
            }
        }
        onUrlChange(fn) {
            this._urlChangeListeners.push(fn);
            if (!this._urlChangeSubscription) {
                this._urlChangeSubscription = this.subscribe(v => {
                    this._notifyUrlChangeListeners(v.url, v.state);
                });
            }
        }
        /** @internal */
        _notifyUrlChangeListeners(url = '', state) {
            this._urlChangeListeners.forEach(fn => fn(url, state));
        }
        subscribe(onNext, onThrow, onReturn) {
            return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
        }
        normalize(url) {
            return null;
        }
    }
    SpyLocation.ɵfac = function SpyLocation_Factory(t) { return new (t || SpyLocation)(); };
    SpyLocation.ɵprov = i0.ɵɵdefineInjectable({ token: SpyLocation, factory: SpyLocation.ɵfac });
    return SpyLocation;
})();
export { SpyLocation };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(SpyLocation, [{
        type: Injectable
    }], null, null); })();
class LocationState {
    constructor(path, query, state) {
        this.path = path;
        this.query = query;
        this.state = state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9sb2NhdGlvbl9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUd2RDs7OztHQUlHO0FBQ0g7SUFBQSxNQUNhLFdBQVc7UUFEeEI7WUFFRSxlQUFVLEdBQWEsRUFBRSxDQUFDO1lBQ2xCLGFBQVEsR0FBb0IsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDOUQsa0JBQWEsR0FBVyxDQUFDLENBQUM7WUFDbEMsZ0JBQWdCO1lBQ2hCLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqRCxnQkFBZ0I7WUFDaEIsY0FBUyxHQUFXLEVBQUUsQ0FBQztZQUN2QixnQkFBZ0I7WUFDaEIsc0JBQWlCLEdBQXFCLElBQUssQ0FBQztZQUM1QyxnQkFBZ0I7WUFDaEIsc0JBQWlCLEdBQXFCLElBQUssQ0FBQztZQUM1QyxnQkFBZ0I7WUFDaEIsd0JBQW1CLEdBQThDLEVBQUUsQ0FBQztTQXNIckU7UUFsSEMsY0FBYyxDQUFDLEdBQVc7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUMvQyxDQUFDO1FBRUQsV0FBVyxDQUFDLEdBQVc7WUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUk7WUFDRixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNoRCxDQUFDO1FBRUQsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJ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QUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQVc7WUFDbkIsT0FBTyxJQUFLLENBQUM7UUFDZixDQUFDOzswRUFsSVUsV0FBVzt1REFBWCxXQUFXLFdBQVgsV0FBVztzQkFsQnhCO0tBcUpDO1NBbklZLFdBQVc7a0RBQVgsV0FBVztjQUR2QixVQUFVOztBQXNJWCxNQUFNLGFBQWE7SUFDakIsWUFBbUIsSUFBWSxFQUFTLEtBQWEsRUFBUyxLQUFVO1FBQXJELFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBSztJQUFHLENBQUM7Q0FDN0UiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvbiwgTG9jYXRpb25TdHJhdGVneSwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogQSBzcHkgZm9yIHtAbGluayBMb2NhdGlvbn0gdGhhdCBhbGxvd3MgdGVzdHMgdG8gZmlyZSBzaW11bGF0ZWQgbG9jYXRpb24gZXZlbnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNweUxvY2F0aW9uIGltcGxlbWVudHMgTG9jYXRpb24ge1xuICB1cmxDaGFuZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIF9oaXN0b3J5OiBMb2NhdGlvblN0YXRlW10gPSBbbmV3IExvY2F0aW9uU3RhdGUoJycsICcnLCBudWxsKV07XG4gIHByaXZhdGUgX2hpc3RvcnlJbmRleDogbnVtYmVyID0gMDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Jhc2VIcmVmOiBzdHJpbmcgPSAnJztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSA9IG51bGwhO1xuICAvKiogQGludGVybmFsICovXG4gIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uID0gbnVsbCE7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VybENoYW5nZUxpc3RlbmVyczogKCh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24pID0+IHZvaWQpW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXJsQ2hhbmdlU3Vic2NyaXB0aW9uPzogU3Vic2NyaXB0aW9uTGlrZTtcblxuICBzZXRJbml0aWFsUGF0aCh1cmw6IHN0cmluZykge1xuICAgIHRoaXMuX2hpc3RvcnlbdGhpcy5faGlzdG9yeUluZGV4XS5wYXRoID0gdXJsO1xuICB9XG5cbiAgc2V0QmFzZUhyZWYodXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9iYXNlSHJlZiA9IHVybDtcbiAgfVxuXG4gIHBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXhdLnBhdGg7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXhdLnN0YXRlO1xuICB9XG5cbiAgaXNDdXJyZW50UGF0aEVxdWFsVG8ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiBib29sZWFuIHtcbiAgICBjb25zdCBnaXZlblBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgPyBwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIDEpIDogcGF0aDtcbiAgICBjb25zdCBjdXJyUGF0aCA9XG4gICAgICAgIHRoaXMucGF0aCgpLmVuZHNXaXRoKCcvJykgPyB0aGlzLnBhdGgoKS5zdWJzdHJpbmcoMCwgdGhpcy5wYXRoKCkubGVuZ3RoIC0gMSkgOiB0aGlzLnBhdGgoKTtcblxuICAgIHJldHVybiBjdXJyUGF0aCA9PSBnaXZlblBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gIH1cblxuICBzaW11bGF0ZVVybFBvcChwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3ViamVjdC5lbWl0KHsndXJsJzogcGF0aG5hbWUsICdwb3AnOiB0cnVlLCAndHlwZSc6ICdwb3BzdGF0ZSd9KTtcbiAgfVxuXG4gIHNpbXVsYXRlSGFzaENoYW5nZShwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgLy8gQmVjYXVzZSB3ZSBkb24ndCBwcmV2ZW50IHRoZSBuYXRpdmUgZXZlbnQsIHRoZSBicm93c2VyIHdpbGwgaW5kZXBlbmRlbnRseSB1cGRhdGUgdGhlIHBhdGhcbiAgICB0aGlzLnNldEluaXRpYWxQYXRoKHBhdGhuYW1lKTtcbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCgnaGFzaDogJyArIHBhdGhuYW1lKTtcbiAgICB0aGlzLl9zdWJqZWN0LmVtaXQoeyd1cmwnOiBwYXRobmFtZSwgJ3BvcCc6IHRydWUsICd0eXBlJzogJ2hhc2hjaGFuZ2UnfSk7XG4gIH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwubGVuZ3RoID4gMCAmJiAhdXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgdXJsID0gJy8nICsgdXJsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYmFzZUhyZWYgKyB1cmw7XG4gIH1cblxuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpIHtcbiAgICBwYXRoID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCk7XG5cbiAgICBpZiAodGhpcy5faGlzdG9yeUluZGV4ID4gMCkge1xuICAgICAgdGhpcy5faGlzdG9yeS5zcGxpY2UodGhpcy5faGlzdG9yeUluZGV4ICsgMSk7XG4gICAgfVxuICAgIHRoaXMuX2hpc3RvcnkucHVzaChuZXcgTG9jYXRpb25TdGF0ZShwYXRoLCBxdWVyeSwgc3RhdGUpKTtcbiAgICB0aGlzLl9oaXN0b3J5SW5kZXggPSB0aGlzLl9oaXN0b3J5Lmxlbmd0aCAtIDE7XG5cbiAgICBjb25zdCBsb2NhdGlvblN0YXRlID0gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXggLSAxXTtcbiAgICBpZiAobG9jYXRpb25TdGF0ZS5wYXRoID09IHBhdGggJiYgbG9jYXRpb25TdGF0ZS5xdWVyeSA9PSBxdWVyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2godXJsKTtcbiAgICB0aGlzLl9zdWJqZWN0LmVtaXQoeyd1cmwnOiB1cmwsICdwb3AnOiBmYWxzZX0pO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCkge1xuICAgIHBhdGggPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoKTtcblxuICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLl9oaXN0b3J5W3RoaXMuX2hpc3RvcnlJbmRleF07XG4gICAgaWYgKGhpc3RvcnkucGF0aCA9PSBwYXRoICYmIGhpc3RvcnkucXVlcnkgPT0gcXVlcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBoaXN0b3J5LnBhdGggPSBwYXRoO1xuICAgIGhpc3RvcnkucXVlcnkgPSBxdWVyeTtcbiAgICBoaXN0b3J5LnN0YXRlID0gc3RhdGU7XG5cbiAgICBjb25zdCB1cmwgPSBwYXRoICsgKHF1ZXJ5Lmxlbmd0aCA+IDAgPyAoJz8nICsgcXVlcnkpIDogJycpO1xuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKCdyZXBsYWNlOiAnICsgdXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKSB7XG4gICAgaWYgKHRoaXMuX2hpc3RvcnlJbmRleCA8ICh0aGlzLl9oaXN0b3J5Lmxlbmd0aCAtIDEpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5SW5kZXgrKztcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7J3VybCc6IHRoaXMucGF0aCgpLCAnc3RhdGUnOiB0aGlzLmdldFN0YXRlKCksICdwb3AnOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgYmFjaygpIHtcbiAgICBpZiAodGhpcy5faGlzdG9yeUluZGV4ID4gMCkge1xuICAgICAgdGhpcy5faGlzdG9yeUluZGV4LS07XG4gICAgICB0aGlzLl9zdWJqZWN0LmVtaXQoeyd1cmwnOiB0aGlzLnBhdGgoKSwgJ3N0YXRlJzogdGhpcy5nZXRTdGF0ZSgpLCAncG9wJzogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuICBvblVybENoYW5nZShmbjogKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZCkge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5wdXNoKGZuKTtcblxuICAgIGlmICghdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZSh2ID0+IHtcbiAgICAgICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHYudXJsLCB2LnN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh1cmw6IHN0cmluZyA9ICcnLCBzdGF0ZTogdW5rbm93bikge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5mb3JFYWNoKGZuID0+IGZuKHVybCwgc3RhdGUpKTtcbiAgfVxuXG4gIHN1YnNjcmliZShcbiAgICAgIG9uTmV4dDogKHZhbHVlOiBhbnkpID0+IHZvaWQsIG9uVGhyb3c/OiAoKGVycm9yOiBhbnkpID0+IHZvaWQpfG51bGwsXG4gICAgICBvblJldHVybj86ICgoKSA9PiB2b2lkKXxudWxsKTogU3Vic2NyaXB0aW9uTGlrZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N1YmplY3Quc3Vic2NyaWJlKHtuZXh0OiBvbk5leHQsIGVycm9yOiBvblRocm93LCBjb21wbGV0ZTogb25SZXR1cm59KTtcbiAgfVxuXG4gIG5vcm1hbGl6ZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG51bGwhO1xuICB9XG59XG5cbmNsYXNzIExvY2F0aW9uU3RhdGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogc3RyaW5nLCBwdWJsaWMgcXVlcnk6IHN0cmluZywgcHVibGljIHN0YXRlOiBhbnkpIHt9XG59XG4iXX0=