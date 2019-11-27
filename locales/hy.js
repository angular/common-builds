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
        define("@angular/common/locales/hy", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === 0 || i === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'hy', [['ա', 'հ'], ['AM', 'PM'], u], [['AM', 'PM'], u, u],
        [
            ['Կ', 'Ե', 'Ե', 'Չ', 'Հ', 'Ո', 'Շ'],
            ['կիր', 'երկ', 'երք', 'չրք', 'հնգ', 'ուր', 'շբթ'],
            [
                'կիրակի', 'երկուշաբթի', 'երեքշաբթի', 'չորեքշաբթի',
                'հինգշաբթի', 'ուրբաթ', 'շաբաթ'
            ],
            ['կր', 'եկ', 'եք', 'չք', 'հգ', 'ու', 'շբ']
        ],
        u,
        [
            ['Հ', 'Փ', 'Մ', 'Ա', 'Մ', 'Հ', 'Հ', 'Օ', 'Ս', 'Հ', 'Ն', 'Դ'],
            [
                'հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ',
                'հոկ', 'նոյ', 'դեկ'
            ],
            [
                'հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի',
                'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի',
                'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'
            ]
        ],
        [
            ['Հ', 'Փ', 'Մ', 'Ա', 'Մ', 'Հ', 'Հ', 'Օ', 'Ս', 'Հ', 'Ն', 'Դ'],
            [
                'հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ',
                'հոկ', 'նոյ', 'դեկ'
            ],
            [
                'հունվար', 'փետրվար', 'մարտ', 'ապրիլ', 'մայիս', 'հունիս',
                'հուլիս', 'օգոստոս', 'սեպտեմբեր', 'հոկտեմբեր',
                'նոյեմբեր', 'դեկտեմբեր'
            ]
        ],
        [['մ.թ.ա.', 'մ.թ.'], u, ['Քրիստոսից առաջ', 'Քրիստոսից հետո']], 1,
        [6, 0], ['dd.MM.yy', 'dd MMM, y թ.', 'dd MMMM, y թ.', 'y թ. MMMM d, EEEE'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1}, {0}', u, u, u],
        [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'ՈչԹ', ':'],
        ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '֏', 'հայկական դրամ',
        { 'AMD': ['֏'], 'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'TWD': ['NT$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9oeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekQ7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNuQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztZQUNqRDtnQkFDRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxZQUFZO2dCQUNqRCxXQUFXLEVBQUUsUUFBUSxFQUFFLE9BQU87YUFDL0I7WUFDRCxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztTQUMzQztRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUQ7Z0JBQ0UsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO2dCQUM3RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7YUFDcEI7WUFDRDtnQkFDRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUTtnQkFDbkQsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWTtnQkFDOUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxZQUFZO2FBQ3hDO1NBQ0Y7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUQ7Z0JBQ0UsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO2dCQUM3RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7YUFDcEI7WUFDRDtnQkFDRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVE7Z0JBQ3hELFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFdBQVc7Z0JBQzdDLFVBQVUsRUFBRSxXQUFXO2FBQ3hCO1NBQ0Y7UUFDRCxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsbUJBQW1CLENBQUM7UUFDMUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO1FBQzlELENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLGVBQWU7UUFDbEUsRUFBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUMsRUFBRSxNQUFNO0tBQzFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcbiAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSkgcmV0dXJuIDE7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdoeScsIFtbJ9WhJywgJ9WwJ10sIFsnQU0nLCAnUE0nXSwgdV0sIFtbJ0FNJywgJ1BNJ10sIHUsIHVdLFxuICBbXG4gICAgWyfUvycsICfUtScsICfUtScsICfViScsICfVgCcsICfViCcsICfVhyddLFxuICAgIFsn1a/Vq9aAJywgJ9Wl1oDVrycsICfVpdaA1oQnLCAn1bnWgNaEJywgJ9Ww1bbVoycsICfVuNaC1oAnLCAn1bfVotWpJ10sXG4gICAgW1xuICAgICAgJ9Wv1avWgNWh1a/VqycsICfVpdaA1a/VuNaC1bfVodWi1anVqycsICfVpdaA1aXWhNW31aHVotWp1asnLCAn1bnVuNaA1aXWhNW31aHVotWp1asnLFxuICAgICAgJ9Ww1avVttWj1bfVodWi1anVqycsICfVuNaC1oDVotWh1aknLCAn1bfVodWi1aHVqSdcbiAgICBdLFxuICAgIFsn1a/WgCcsICfVpdWvJywgJ9Wl1oQnLCAn1bnWhCcsICfVsNWjJywgJ9W41oInLCAn1bfVoiddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ9WAJywgJ9WTJywgJ9WEJywgJ9SxJywgJ9WEJywgJ9WAJywgJ9WAJywgJ9WVJywgJ9WNJywgJ9WAJywgJ9WGJywgJ9S0J10sXG4gICAgW1xuICAgICAgJ9Ww1bbVvicsICfWg9W/1b4nLCAn1bTWgNW/JywgJ9Wh1brWgCcsICfVtNW11b0nLCAn1bDVttW9JywgJ9Ww1azVvScsICfWhdWj1b0nLCAn1b3VpdW6JyxcbiAgICAgICfVsNW41a8nLCAn1bbVuNW1JywgJ9Wk1aXVrydcbiAgICBdLFxuICAgIFtcbiAgICAgICfVsNW41oLVttW+1aHWgNWrJywgJ9aD1aXVv9aA1b7VodaA1asnLCAn1bTVodaA1b/VqycsICfVodW61oDVq9Ws1asnLCAn1bTVodW11avVvdWrJyxcbiAgICAgICfVsNW41oLVttWr1b3VqycsICfVsNW41oLVrNWr1b3VqycsICfWhdWj1bjVvdW/1bjVvdWrJywgJ9W91aXVutW/1aXVtNWi1aXWgNWrJyxcbiAgICAgICfVsNW41a/Vv9Wl1bTVotWl1oDVqycsICfVttW41bXVpdW01aLVpdaA1asnLCAn1aTVpdWv1b/VpdW01aLVpdaA1asnXG4gICAgXVxuICBdLFxuICBbXG4gICAgWyfVgCcsICfVkycsICfVhCcsICfUsScsICfVhCcsICfVgCcsICfVgCcsICfVlScsICfVjScsICfVgCcsICfVhicsICfUtCddLFxuICAgIFtcbiAgICAgICfVsNW21b4nLCAn1oPVv9W+JywgJ9W01oDVvycsICfVodW61oAnLCAn1bTVtdW9JywgJ9Ww1bbVvScsICfVsNWs1b0nLCAn1oXVo9W9JywgJ9W91aXVuicsXG4gICAgICAn1bDVuNWvJywgJ9W21bjVtScsICfVpNWl1a8nXG4gICAgXSxcbiAgICBbXG4gICAgICAn1bDVuNaC1bbVvtWh1oAnLCAn1oPVpdW/1oDVvtWh1oAnLCAn1bTVodaA1b8nLCAn1aHVutaA1avVrCcsICfVtNWh1bXVq9W9JywgJ9Ww1bjWgtW21avVvScsXG4gICAgICAn1bDVuNaC1azVq9W9JywgJ9aF1aPVuNW91b/VuNW9JywgJ9W91aXVutW/1aXVtNWi1aXWgCcsICfVsNW41a/Vv9Wl1bTVotWl1oAnLFxuICAgICAgJ9W21bjVtdWl1bTVotWl1oAnLCAn1aTVpdWv1b/VpdW01aLVpdaAJ1xuICAgIF1cbiAgXSxcbiAgW1sn1bQu1aku1aEuJywgJ9W0LtWpLiddLCB1LCBbJ9WU1oDVq9W91b/VuNW91avWgSDVodW81aHVuycsICfVlNaA1avVvdW/1bjVvdWr1oEg1bDVpdW/1bgnXV0sIDEsXG4gIFs2LCAwXSwgWydkZC5NTS55eScsICdkZCBNTU0sIHkg1akuJywgJ2RkIE1NTU0sIHkg1akuJywgJ3kg1akuIE1NTU0gZCwgRUVFRSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLCBbJ3sxfSwgezB9JywgdSwgdSwgdV0sXG4gIFsnLCcsICfCoCcsICc7JywgJyUnLCAnKycsICctJywgJ0UnLCAnw5cnLCAn4oCwJywgJ+KInicsICfViNW51LknLCAnOiddLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMCUnLCAnIywjIzAuMDDCoMKkJywgJyNFMCddLCAn1o8nLCAn1bDVodW11a/VodWv1aHVtiDVpNaA1aHVtCcsXG4gIHsnQU1EJzogWyfWjyddLCAnSlBZJzogWydKUMKlJywgJ8KlJ10sICdUSEInOiBbJ+C4vyddLCAnVFdEJzogWydOVCQnXX0sIHBsdXJhbFxuXTtcbiJdfQ==