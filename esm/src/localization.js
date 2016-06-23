/**
 * @experimental
 */
export class NgLocalization {
}
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 *
 * @internal
 */
export function getPluralCategory(value, cases, ngLocalization) {
    const nbCase = `=${value}`;
    return cases.indexOf(nbCase) > -1 ? nbCase : ngLocalization.getPluralCategory(value);
}
//# sourceMappingURL=localization.js.map