/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵnormalizeQueryParams as normalizeQueryParams, } from '@angular/common';
import { EventEmitter, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @publicApi
 */
export class SpyLocation {
    constructor() {
        this.urlChanges = [];
        this._history = [new LocationState('', '', null)];
        this._historyIndex = 0;
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._basePath = '';
        /** @internal */
        this._locationStrategy = null;
        /** @internal */
        this._urlChangeListeners = [];
        /** @internal */
        this._urlChangeSubscription = null;
    }
    /** @nodoc */
    ngOnDestroy() {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeListeners = [];
    }
    setInitialPath(url) {
        this._history[this._historyIndex].path = url;
    }
    setBaseHref(url) {
        this._basePath = url;
    }
    path() {
        return this._history[this._historyIndex].path;
    }
    getState() {
        return this._history[this._historyIndex].state;
    }
    isCurrentPathEqualTo(path, query = '') {
        const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
        const currPath = this.path().endsWith('/')
            ? this.path().substring(0, this.path().length - 1)
            : this.path();
        return currPath == givenPath + (query.length > 0 ? '?' + query : '');
    }
    simulateUrlPop(pathname) {
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
    }
    simulateHashChange(pathname) {
        const path = this.prepareExternalUrl(pathname);
        this.pushHistory(path, '', null);
        this.urlChanges.push('hash: ' + pathname);
        // the browser will automatically fire popstate event before each `hashchange` event, so we need
        // to simulate it.
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'hashchange' });
    }
    prepareExternalUrl(url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._basePath + url;
    }
    go(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        this.pushHistory(path, query, state);
        const locationState = this._history[this._historyIndex - 1];
        if (locationState.path == path && locationState.query == query) {
            return;
        }
        const url = path + (query.length > 0 ? '?' + query : '');
        this.urlChanges.push(url);
        this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
    }
    replaceState(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        const history = this._history[this._historyIndex];
        history.state = state;
        if (history.path == path && history.query == query) {
            return;
        }
        history.path = path;
        history.query = query;
        const url = path + (query.length > 0 ? '?' + query : '');
        this.urlChanges.push('replace: ' + url);
        this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
    }
    forward() {
        if (this._historyIndex < this._history.length - 1) {
            this._historyIndex++;
            this._subject.emit({
                'url': this.path(),
                'state': this.getState(),
                'pop': true,
                'type': 'popstate',
            });
        }
    }
    back() {
        if (this._historyIndex > 0) {
            this._historyIndex--;
            this._subject.emit({
                'url': this.path(),
                'state': this.getState(),
                'pop': true,
                'type': 'popstate',
            });
        }
    }
    historyGo(relativePosition = 0) {
        const nextPageIndex = this._historyIndex + relativePosition;
        if (nextPageIndex >= 0 && nextPageIndex < this._history.length) {
            this._historyIndex = nextPageIndex;
            this._subject.emit({
                'url': this.path(),
                'state': this.getState(),
                'pop': true,
                'type': 'popstate',
            });
        }
    }
    onUrlChange(fn) {
        this._urlChangeListeners.push(fn);
        this._urlChangeSubscription ??= this.subscribe((v) => {
            this._notifyUrlChangeListeners(v.url, v.state);
        });
        return () => {
            const fnIndex = this._urlChangeListeners.indexOf(fn);
            this._urlChangeListeners.splice(fnIndex, 1);
            if (this._urlChangeListeners.length === 0) {
                this._urlChangeSubscription?.unsubscribe();
                this._urlChangeSubscription = null;
            }
        };
    }
    /** @internal */
    _notifyUrlChangeListeners(url = '', state) {
        this._urlChangeListeners.forEach((fn) => fn(url, state));
    }
    subscribe(onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    }
    normalize(url) {
        return null;
    }
    pushHistory(path, query, state) {
        if (this._historyIndex > 0) {
            this._history.splice(this._historyIndex + 1);
        }
        this._history.push(new LocationState(path, query, state));
        this._historyIndex = this._history.length - 1;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: SpyLocation, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: SpyLocation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: SpyLocation, decorators: [{
            type: Injectable
        }] });
class LocationState {
    constructor(path, query, state) {
        this.path = path;
        this.query = query;
        this.state = state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9sb2NhdGlvbl9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFHTCxxQkFBcUIsSUFBSSxvQkFBb0IsR0FDOUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFHdkQ7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxXQUFXO0lBRHhCO1FBRUUsZUFBVSxHQUFhLEVBQUUsQ0FBQztRQUNsQixhQUFRLEdBQW9CLENBQUMsSUFBSSxhQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlELGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQ2xDLGdCQUFnQjtRQUNoQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDakQsZ0JBQWdCO1FBQ2hCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsZ0JBQWdCO1FBQ2hCLHNCQUFpQixHQUFxQixJQUFLLENBQUM7UUFDNUMsZ0JBQWdCO1FBQ2hCLHdCQUFtQixHQUE4QyxFQUFFLENBQUM7UUFDcEUsZ0JBQWdCO1FBQ2hCLDJCQUFzQixHQUE0QixJQUFJLENBQUM7S0F3S3hEO0lBdEtDLGFBQWE7SUFDYixXQUFXO1FBQ1QsSUFBSSxDQUFDLHNCQUFzQixFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELGNBQWMsQ0FBQyxHQUFXO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7SUFDL0MsQ0FBQztJQUVELFdBQVcsQ0FB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LENBQUM7SUFFRCxTQUFTLENBQ1AsTUFBNEIsRUFDNUIsT0FBdUMsRUFDdkMsUUFBOEI7UUFFOUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVc7UUFDbkIsT0FBTyxJQUFLLENBQUM7SUFDZixDQUFDO0lBRU8sV0FBVyxDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsS0FBVTtRQUN6RCxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2hELENBQUM7eUhBcExVLFdBQVc7NkhBQVgsV0FBVzs7c0dBQVgsV0FBVztrQkFEdkIsVUFBVTs7QUF3TFgsTUFBTSxhQUFhO0lBQ2pCLFlBQ1MsSUFBWSxFQUNaLEtBQWEsRUFDYixLQUFVO1FBRlYsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixVQUFLLEdBQUwsS0FBSyxDQUFLO0lBQ2hCLENBQUM7Q0FDTCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBMb2NhdGlvbixcbiAgTG9jYXRpb25TdHJhdGVneSxcbiAgybVub3JtYWxpemVRdWVyeVBhcmFtcyBhcyBub3JtYWxpemVRdWVyeVBhcmFtcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9uTGlrZX0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogQSBzcHkgZm9yIHtAbGluayBMb2NhdGlvbn0gdGhhdCBhbGxvd3MgdGVzdHMgdG8gZmlyZSBzaW11bGF0ZWQgbG9jYXRpb24gZXZlbnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNweUxvY2F0aW9uIGltcGxlbWVudHMgTG9jYXRpb24ge1xuICB1cmxDaGFuZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIF9oaXN0b3J5OiBMb2NhdGlvblN0YXRlW10gPSBbbmV3IExvY2F0aW9uU3RhdGUoJycsICcnLCBudWxsKV07XG4gIHByaXZhdGUgX2hpc3RvcnlJbmRleDogbnVtYmVyID0gMDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Jhc2VQYXRoOiBzdHJpbmcgPSAnJztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSA9IG51bGwhO1xuICAvKiogQGludGVybmFsICovXG4gIF91cmxDaGFuZ2VMaXN0ZW5lcnM6ICgodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKVtdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VybENoYW5nZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgc2V0SW5pdGlhbFBhdGgodXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9oaXN0b3J5W3RoaXMuX2hpc3RvcnlJbmRleF0ucGF0aCA9IHVybDtcbiAgfVxuXG4gIHNldEJhc2VIcmVmKHVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5fYmFzZVBhdGggPSB1cmw7XG4gIH1cblxuICBwYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlbdGhpcy5faGlzdG9yeUluZGV4XS5wYXRoO1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlbdGhpcy5faGlzdG9yeUluZGV4XS5zdGF0ZTtcbiAgfVxuXG4gIGlzQ3VycmVudFBhdGhFcXVhbFRvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZ2l2ZW5QYXRoID0gcGF0aC5lbmRzV2l0aCgnLycpID8gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sZW5ndGggLSAxKSA6IHBhdGg7XG4gICAgY29uc3QgY3VyclBhdGggPSB0aGlzLnBhdGgoKS5lbmRzV2l0aCgnLycpXG4gICAgICA/IHRoaXMucGF0aCgpLnN1YnN0cmluZygwLCB0aGlzLnBhdGgoKS5sZW5ndGggLSAxKVxuICAgICAgOiB0aGlzLnBhdGgoKTtcblxuICAgIHJldHVybiBjdXJyUGF0aCA9PSBnaXZlblBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICc/JyArIHF1ZXJ5IDogJycpO1xuICB9XG5cbiAgc2ltdWxhdGVVcmxQb3AocGF0aG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7J3VybCc6IHBhdGhuYW1lLCAncG9wJzogdHJ1ZSwgJ3R5cGUnOiAncG9wc3RhdGUnfSk7XG4gIH1cblxuICBzaW11bGF0ZUhhc2hDaGFuZ2UocGF0aG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRobmFtZSk7XG4gICAgdGhpcy5wdXNoSGlzdG9yeShwYXRoLCAnJywgbnVsbCk7XG5cbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCgnaGFzaDogJyArIHBhdGhuYW1lKTtcbiAgICAvLyB0aGUgYnJvd3NlciB3aWxsIGF1dG9tYXRpY2FsbHkgZmlyZSBwb3BzdGF0ZSBldmVudCBiZWZvcmUgZWFjaCBgaGFzaGNoYW5nZWAgZXZlbnQsIHNvIHdlIG5lZWRcbiAgICAvLyB0byBzaW11bGF0ZSBpdC5cbiAgICB0aGlzLl9zdWJqZWN0LmVtaXQoeyd1cmwnOiBwYXRobmFtZSwgJ3BvcCc6IHRydWUsICd0eXBlJzogJ3BvcHN0YXRlJ30pO1xuICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7J3VybCc6IHBhdGhuYW1lLCAncG9wJzogdHJ1ZSwgJ3R5cGUnOiAnaGFzaGNoYW5nZSd9KTtcbiAgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHVybC5sZW5ndGggPiAwICYmICF1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9iYXNlUGF0aCArIHVybDtcbiAgfVxuXG4gIGdvKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCkge1xuICAgIHBhdGggPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoKTtcblxuICAgIHRoaXMucHVzaEhpc3RvcnkocGF0aCwgcXVlcnksIHN0YXRlKTtcblxuICAgIGNvbnN0IGxvY2F0aW9uU3RhdGUgPSB0aGlzLl9oaXN0b3J5W3RoaXMuX2hpc3RvcnlJbmRleCAtIDFdO1xuICAgIGlmIChsb2NhdGlvblN0YXRlLnBhdGggPT0gcGF0aCAmJiBsb2NhdGlvblN0YXRlLnF1ZXJ5ID09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gJz8nICsgcXVlcnkgOiAnJyk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2godXJsKTtcbiAgICB0aGlzLl9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnMocGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5KSwgc3RhdGUpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnLCBzdGF0ZTogYW55ID0gbnVsbCkge1xuICAgIHBhdGggPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoKTtcblxuICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLl9oaXN0b3J5W3RoaXMuX2hpc3RvcnlJbmRleF07XG5cbiAgICBoaXN0b3J5LnN0YXRlID0gc3RhdGU7XG5cbiAgICBpZiAoaGlzdG9yeS5wYXRoID09IHBhdGggJiYgaGlzdG9yeS5xdWVyeSA9PSBxdWVyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGhpc3RvcnkucGF0aCA9IHBhdGg7XG4gICAgaGlzdG9yeS5xdWVyeSA9IHF1ZXJ5O1xuXG4gICAgY29uc3QgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gJz8nICsgcXVlcnkgOiAnJyk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goJ3JlcGxhY2U6ICcgKyB1cmwpO1xuICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyhwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpLCBzdGF0ZSk7XG4gIH1cblxuICBmb3J3YXJkKCkge1xuICAgIGlmICh0aGlzLl9oaXN0b3J5SW5kZXggPCB0aGlzLl9oaXN0b3J5Lmxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMuX2hpc3RvcnlJbmRleCsrO1xuICAgICAgdGhpcy5fc3ViamVjdC5lbWl0KHtcbiAgICAgICAgJ3VybCc6IHRoaXMucGF0aCgpLFxuICAgICAgICAnc3RhdGUnOiB0aGlzLmdldFN0YXRlKCksXG4gICAgICAgICdwb3AnOiB0cnVlLFxuICAgICAgICAndHlwZSc6ICdwb3BzdGF0ZScsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBiYWNrKCkge1xuICAgIGlmICh0aGlzLl9oaXN0b3J5SW5kZXggPiAwKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5SW5kZXgtLTtcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7XG4gICAgICAgICd1cmwnOiB0aGlzLnBhdGgoKSxcbiAgICAgICAgJ3N0YXRlJzogdGhpcy5nZXRTdGF0ZSgpLFxuICAgICAgICAncG9wJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGUnOiAncG9wc3RhdGUnLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaGlzdG9yeUdvKHJlbGF0aXZlUG9zaXRpb246IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICBjb25zdCBuZXh0UGFnZUluZGV4ID0gdGhpcy5faGlzdG9yeUluZGV4ICsgcmVsYXRpdmVQb3NpdGlvbjtcbiAgICBpZiAobmV4dFBhZ2VJbmRleCA+PSAwICYmIG5leHRQYWdlSW5kZXggPCB0aGlzLl9oaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgdGhpcy5faGlzdG9yeUluZGV4ID0gbmV4dFBhZ2VJbmRleDtcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7XG4gICAgICAgICd1cmwnOiB0aGlzLnBhdGgoKSxcbiAgICAgICAgJ3N0YXRlJzogdGhpcy5nZXRTdGF0ZSgpLFxuICAgICAgICAncG9wJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGUnOiAncG9wc3RhdGUnLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgb25VcmxDaGFuZ2UoZm46ICh1cmw6IHN0cmluZywgc3RhdGU6IHVua25vd24pID0+IHZvaWQpOiBWb2lkRnVuY3Rpb24ge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5wdXNoKGZuKTtcblxuICAgIHRoaXMuX3VybENoYW5nZVN1YnNjcmlwdGlvbiA/Pz0gdGhpcy5zdWJzY3JpYmUoKHYpID0+IHtcbiAgICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh2LnVybCwgdi5zdGF0ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3QgZm5JbmRleCA9IHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5pbmRleE9mKGZuKTtcbiAgICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5zcGxpY2UoZm5JbmRleCwgMSk7XG5cbiAgICAgIGlmICh0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3VybENoYW5nZVN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHVybDogc3RyaW5nID0gJycsIHN0YXRlOiB1bmtub3duKSB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goKGZuKSA9PiBmbih1cmwsIHN0YXRlKSk7XG4gIH1cblxuICBzdWJzY3JpYmUoXG4gICAgb25OZXh0OiAodmFsdWU6IGFueSkgPT4gdm9pZCxcbiAgICBvblRocm93PzogKChlcnJvcjogYW55KSA9PiB2b2lkKSB8IG51bGwsXG4gICAgb25SZXR1cm4/OiAoKCkgPT4gdm9pZCkgfCBudWxsLFxuICApOiBTdWJzY3JpcHRpb25MaWtlIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5zdWJzY3JpYmUoe25leHQ6IG9uTmV4dCwgZXJyb3I6IG9uVGhyb3csIGNvbXBsZXRlOiBvblJldHVybn0pO1xuICB9XG5cbiAgbm9ybWFsaXplKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbCE7XG4gIH1cblxuICBwcml2YXRlIHB1c2hIaXN0b3J5KHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZywgc3RhdGU6IGFueSkge1xuICAgIGlmICh0aGlzLl9oaXN0b3J5SW5kZXggPiAwKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5LnNwbGljZSh0aGlzLl9oaXN0b3J5SW5kZXggKyAxKTtcbiAgICB9XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoKG5ldyBMb2NhdGlvblN0YXRlKHBhdGgsIHF1ZXJ5LCBzdGF0ZSkpO1xuICAgIHRoaXMuX2hpc3RvcnlJbmRleCA9IHRoaXMuX2hpc3RvcnkubGVuZ3RoIC0gMTtcbiAgfVxufVxuXG5jbGFzcyBMb2NhdGlvblN0YXRlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHBhdGg6IHN0cmluZyxcbiAgICBwdWJsaWMgcXVlcnk6IHN0cmluZyxcbiAgICBwdWJsaWMgc3RhdGU6IGFueSxcbiAgKSB7fVxufVxuIl19