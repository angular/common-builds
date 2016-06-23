"use strict";
/**
 * @experimental
 */
var NgLocalization = (function () {
    function NgLocalization() {
    }
    return NgLocalization;
}());
exports.NgLocalization = NgLocalization;
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 *
 * @internal
 */
function getPluralCategory(value, cases, ngLocalization) {
    var nbCase = "=" + value;
    return cases.indexOf(nbCase) > -1 ? nbCase : ngLocalization.getPluralCategory(value);
}
exports.getPluralCategory = getPluralCategory;
//# sourceMappingURL=localization.js.map