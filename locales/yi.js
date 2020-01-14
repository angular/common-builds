/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/yi", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0)
            return 1;
        return 5;
    }
    exports.default = [
        'yi',
        [['פֿאַרמיטאָג', 'נאָכמיטאָג'], u, u],
        u,
        [
            ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            [
                'זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק',
                'פֿרײַטיק', 'שבת'
            ],
            u, u
        ],
        u,
        [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            [
                'יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני',
                'יולי', 'אויגוסט', 'סעפּטעמבער', 'אקטאבער', 'נאוועמבער',
                'דעצעמבער'
            ],
            u
        ],
        [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            [
                'יאַנ', 'פֿעב', 'מערץ', 'אַפּר', 'מיי', 'יוני', 'יולי',
                'אויג', 'סעפּ', 'אקט', 'נאוו', 'דעצ'
            ],
            [
                'יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני',
                'יולי', 'אויגוסט', 'סעפּטעמבער', 'אקטאבער', 'נאוועמבער',
                'דעצעמבער'
            ]
        ],
        [['BCE', 'CE'], u, u],
        1,
        [6, 0],
        ['dd/MM/yy', 'dטן MMM y', 'dטן MMMM y', 'EEEE, dטן MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1} {0}', '{1}, {0}', '{1} {0}', u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
        u,
        u,
        u,
        { 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'] },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy95aS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNsRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqQyxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUk7UUFDSixDQUFDLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDbkM7Z0JBQ0UsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVc7Z0JBQ3RELFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0QsQ0FBQyxFQUFFLENBQUM7U0FDTDtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7WUFDL0Q7Z0JBQ0UsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNO2dCQUN6RCxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsV0FBVztnQkFDdkQsVUFBVTthQUNYO1lBQ0QsQ0FBQztTQUNGO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1lBQy9EO2dCQUNFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU07Z0JBQ3RELE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLO2FBQ3JDO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNO2dCQUN6RCxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsV0FBVztnQkFDdkQsVUFBVTthQUNYO1NBQ0Y7UUFDRCxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLENBQUM7UUFDM0QsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7UUFDcEQsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM5RCxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztRQUM1QyxDQUFDO1FBQ0QsQ0FBQztRQUNELENBQUM7UUFDRCxFQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUM7UUFDMUMsTUFBTTtLQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKSwgdiA9IG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLmxlbmd0aDtcbiAgaWYgKGkgPT09IDEgJiYgdiA9PT0gMCkgcmV0dXJuIDE7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICd5aScsXG4gIFtbJ9ek1r/XkNa316jXnteZ15jXkNa415InLCAn16DXkNa415vXnteZ15jXkNa415InXSwgdSwgdV0sXG4gIHUsXG4gIFtcbiAgICBbJ1MnLCAnTScsICdUJywgJ1cnLCAnVCcsICdGJywgJ1MnXSxcbiAgICBbXG4gICAgICAn15bXldeg15jXmdenJywgJ9ee15DWuNeg15jXmdenJywgJ9eT15nXoNeh15jXmdenJywgJ9ee15nXmNeV15XXkNeaJywgJ9eT15DXoNei16jXqdeY15nXpycsXG4gICAgICAn16TWv9eo17LWt9eY15nXpycsICfXqdeR16onXG4gICAgXSxcbiAgICB1LCB1XG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzEwJywgJzExJywgJzEyJ10sXG4gICAgW1xuICAgICAgJ9eZ15DWt9eg15XXkNa316gnLCAn16TWv9ei15HXqNeV15DWt9eoJywgJ9ee16LXqNelJywgJ9eQ1rfXpNa816jXmdecJywgJ9ee15nXmScsICfXmdeV16DXmScsXG4gICAgICAn15nXldec15knLCAn15DXldeZ15LXldeh15gnLCAn16HXotek1rzXmNei157Xkdei16gnLCAn15DXp9eY15DXkdei16gnLCAn16DXkNeV15XXotee15HXoteoJyxcbiAgICAgICfXk9ei16bXotee15HXoteoJ1xuICAgIF0sXG4gICAgdVxuICBdLFxuICBbXG4gICAgWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxuICAgIFtcbiAgICAgICfXmdeQ1rfXoCcsICfXpNa/16LXkScsICfXntei16jXpScsICfXkNa316TWvNeoJywgJ9ee15nXmScsICfXmdeV16DXmScsICfXmdeV15zXmScsXG4gICAgICAn15DXldeZ15InLCAn16HXotek1rwnLCAn15DXp9eYJywgJ9eg15DXldeVJywgJ9eT16LXpidcbiAgICBdLFxuICAgIFtcbiAgICAgICfXmdeQ1rfXoNeV15DWt9eoJywgJ9ek1r/XoteR16jXldeQ1rfXqCcsICfXntei16jXpScsICfXkNa316TWvNeo15nXnCcsICfXnteZ15knLCAn15nXldeg15knLFxuICAgICAgJ9eZ15XXnNeZJywgJ9eQ15XXmdeS15XXodeYJywgJ9eh16LXpNa815jXotee15HXoteoJywgJ9eQ16fXmNeQ15HXoteoJywgJ9eg15DXldeV16LXnteR16LXqCcsXG4gICAgICAn15PXotem16LXnteR16LXqCdcbiAgICBdXG4gIF0sXG4gIFtbJ0JDRScsICdDRSddLCB1LCB1XSxcbiAgMSxcbiAgWzYsIDBdLFxuICBbJ2RkL01NL3l5JywgJ2TXmNefIE1NTSB5JywgJ2TXmNefIE1NTU0geScsICdFRUVFLCBk15jXnyBNTU1NIHknXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgJ3sxfSwgezB9JywgJ3sxfSB7MH0nLCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJ8KkwqAjLCMjMC4wMCcsICcjRTAnXSxcbiAgdSxcbiAgdSxcbiAgdSxcbiAgeydKUFknOiBbJ0pQwqUnLCAnwqUnXSwgJ1VTRCc6IFsnVVMkJywgJyQnXX0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==