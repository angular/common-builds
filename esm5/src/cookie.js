/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
export function parseCookieValue(cookieStr, name) {
    name = encodeURIComponent(name);
    try {
        for (var _a = tslib_1.__values(cookieStr.split(';')), _b = _a.next(); !_b.done; _b = _a.next()) {
            var cookie = _b.value;
            var eqIndex = cookie.indexOf('=');
            var _c = tslib_1.__read(eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)], 2), cookieName = _c[0], cookieValue = _c[1];
            if (cookieName.trim() === name) {
                return decodeURIComponent(cookieValue);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
    var e_1, _d;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9jb29raWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFRQSxNQUFNLDJCQUEyQixTQUFpQixFQUFFLElBQVk7SUFDOUQsSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDOztRQUNoQyxLQUFxQixJQUFBLEtBQUEsaUJBQUEsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQSxnQkFBQTtZQUFwQyxJQUFNLE1BQU0sV0FBQTtZQUNmLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsa0hBQU8sa0JBQVUsRUFBRSxtQkFBVyxDQUMyRDtZQUN6RixJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQzlCLE9BQU8sa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDeEM7U0FDRjs7Ozs7Ozs7O0lBQ0QsT0FBTyxJQUFJLENBQUM7O0NBQ2IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvb2tpZVZhbHVlKGNvb2tpZVN0cjogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIG5hbWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSk7XG4gIGZvciAoY29uc3QgY29va2llIG9mIGNvb2tpZVN0ci5zcGxpdCgnOycpKSB7XG4gICAgY29uc3QgZXFJbmRleCA9IGNvb2tpZS5pbmRleE9mKCc9Jyk7XG4gICAgY29uc3QgW2Nvb2tpZU5hbWUsIGNvb2tpZVZhbHVlXTogc3RyaW5nW10gPVxuICAgICAgICBlcUluZGV4ID09IC0xID8gW2Nvb2tpZSwgJyddIDogW2Nvb2tpZS5zbGljZSgwLCBlcUluZGV4KSwgY29va2llLnNsaWNlKGVxSW5kZXggKyAxKV07XG4gICAgaWYgKGNvb2tpZU5hbWUudHJpbSgpID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvb2tpZVZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=