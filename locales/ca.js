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
        define("@angular/common/locales/ca", ["require", "exports"], factory);
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
        'ca', [['a. m.', 'p. m.'], u, u], u,
        [
            ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'], ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
            ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'],
            ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.']
        ],
        u,
        [
            ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS'],
            [
                'de gen.', 'de febr.', 'de març', 'd’abr.', 'de maig', 'de juny', 'de jul.', 'd’ag.',
                'de set.', 'd’oct.', 'de nov.', 'de des.'
            ],
            [
                'de gener', 'de febrer', 'de març', 'd’abril', 'de maig', 'de juny', 'de juliol',
                'd’agost', 'de setembre', 'd’octubre', 'de novembre', 'de desembre'
            ]
        ],
        [
            ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS'],
            [
                'gen.', 'febr.', 'març', 'abr.', 'maig', 'juny', 'jul.', 'ag.', 'set.', 'oct.', 'nov.',
                'des.'
            ],
            [
                'gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre',
                'novembre', 'desembre'
            ]
        ],
        [['aC', 'dC'], u, ['abans de Crist', 'després de Crist']], 1, [6, 0],
        ['d/M/yy', 'd MMM y', 'd MMMM \'de\' y', 'EEEE, d MMMM \'de\' y'],
        ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
        ['{1} {0}', '{1}, {0}', '{1} \'a\' \'les\' {0}', u],
        [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '€', 'euro', {
            'AUD': ['AU$', '$'],
            'BRL': [u, 'R$'],
            'CAD': [u, '$'],
            'CNY': [u, '¥'],
            'ESP': ['₧'],
            'MXN': [u, '$'],
            'THB': ['฿'],
            'USD': [u, '$'],
            'VEF': [u, 'Bs F'],
            'XCD': [u, '$'],
            'XXX': []
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2EuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9jYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNsRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqQyxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25DO1lBQ0UsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztZQUM3RixDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQztZQUNqRixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztTQUNsRDtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7WUFDeEU7Z0JBQ0UsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU87Z0JBQ3BGLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVM7YUFDMUM7WUFDRDtnQkFDRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXO2dCQUNoRixTQUFTLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsYUFBYTthQUNwRTtTQUNGO1FBQ0Q7WUFDRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1lBQ3hFO2dCQUNFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNO2dCQUN0RixNQUFNO2FBQ1A7WUFDRDtnQkFDRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTO2dCQUM1RixVQUFVLEVBQUUsVUFBVTthQUN2QjtTQUNGO1FBQ0QsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsdUJBQXVCLENBQUM7UUFDakUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxjQUFjLENBQUM7UUFDaEQsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUNuRCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO1FBQzlELENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRTtZQUN6RCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7WUFDbEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxFQUFFO1NBQ1Y7UUFDRCxNQUFNO0tBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpLCB2ID0gbi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJykubGVuZ3RoO1xuICBpZiAoaSA9PT0gMSAmJiB2ID09PSAwKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2NhJywgW1snYS7CoG0uJywgJ3AuwqBtLiddLCB1LCB1XSwgdSxcbiAgW1xuICAgIFsnZGcnLCAnZGwnLCAnZHQnLCAnZGMnLCAnZGonLCAnZHYnLCAnZHMnXSwgWydkZy4nLCAnZGwuJywgJ2R0LicsICdkYy4nLCAnZGouJywgJ2R2LicsICdkcy4nXSxcbiAgICBbJ2RpdW1lbmdlJywgJ2RpbGx1bnMnLCAnZGltYXJ0cycsICdkaW1lY3JlcycsICdkaWpvdXMnLCAnZGl2ZW5kcmVzJywgJ2Rpc3NhYnRlJ10sXG4gICAgWydkZy4nLCAnZGwuJywgJ2R0LicsICdkYy4nLCAnZGouJywgJ2R2LicsICdkcy4nXVxuICBdLFxuICB1LFxuICBbXG4gICAgWydHTicsICdGQicsICdNw4cnLCAnQUInLCAnTUcnLCAnSk4nLCAnSkwnLCAnQUcnLCAnU1QnLCAnT0MnLCAnTlYnLCAnRFMnXSxcbiAgICBbXG4gICAgICAnZGUgZ2VuLicsICdkZSBmZWJyLicsICdkZSBtYXLDpycsICdk4oCZYWJyLicsICdkZSBtYWlnJywgJ2RlIGp1bnknLCAnZGUganVsLicsICdk4oCZYWcuJyxcbiAgICAgICdkZSBzZXQuJywgJ2TigJlvY3QuJywgJ2RlIG5vdi4nLCAnZGUgZGVzLidcbiAgICBdLFxuICAgIFtcbiAgICAgICdkZSBnZW5lcicsICdkZSBmZWJyZXInLCAnZGUgbWFyw6cnLCAnZOKAmWFicmlsJywgJ2RlIG1haWcnLCAnZGUganVueScsICdkZSBqdWxpb2wnLFxuICAgICAgJ2TigJlhZ29zdCcsICdkZSBzZXRlbWJyZScsICdk4oCZb2N0dWJyZScsICdkZSBub3ZlbWJyZScsICdkZSBkZXNlbWJyZSdcbiAgICBdXG4gIF0sXG4gIFtcbiAgICBbJ0dOJywgJ0ZCJywgJ03DhycsICdBQicsICdNRycsICdKTicsICdKTCcsICdBRycsICdTVCcsICdPQycsICdOVicsICdEUyddLFxuICAgIFtcbiAgICAgICdnZW4uJywgJ2ZlYnIuJywgJ21hcsOnJywgJ2Fici4nLCAnbWFpZycsICdqdW55JywgJ2p1bC4nLCAnYWcuJywgJ3NldC4nLCAnb2N0LicsICdub3YuJyxcbiAgICAgICdkZXMuJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ2dlbmVyJywgJ2ZlYnJlcicsICdtYXLDpycsICdhYnJpbCcsICdtYWlnJywgJ2p1bnknLCAnanVsaW9sJywgJ2Fnb3N0JywgJ3NldGVtYnJlJywgJ29jdHVicmUnLFxuICAgICAgJ25vdmVtYnJlJywgJ2Rlc2VtYnJlJ1xuICAgIF1cbiAgXSxcbiAgW1snYUMnLCAnZEMnXSwgdSwgWydhYmFucyBkZSBDcmlzdCcsICdkZXNwcsOpcyBkZSBDcmlzdCddXSwgMSwgWzYsIDBdLFxuICBbJ2QvTS95eScsICdkIE1NTSB5JywgJ2QgTU1NTSBcXCdkZVxcJyB5JywgJ0VFRUUsIGQgTU1NTSBcXCdkZVxcJyB5J10sXG4gIFsnSDptbScsICdIOm1tOnNzJywgJ0g6bW06c3MgeicsICdIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgJ3sxfSwgezB9JywgJ3sxfSBcXCdhXFwnIFxcJ2xlc1xcJyB7MH0nLCB1XSxcbiAgWycsJywgJy4nLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJyMsIyMwLjAwwqDCpCcsICcjRTAnXSwgJ+KCrCcsICdldXJvJywge1xuICAgICdBVUQnOiBbJ0FVJCcsICckJ10sXG4gICAgJ0JSTCc6IFt1LCAnUiQnXSxcbiAgICAnQ0FEJzogW3UsICckJ10sXG4gICAgJ0NOWSc6IFt1LCAnwqUnXSxcbiAgICAnRVNQJzogWyfigqcnXSxcbiAgICAnTVhOJzogW3UsICckJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1VTRCc6IFt1LCAnJCddLFxuICAgICdWRUYnOiBbdSwgJ0JzIEYnXSxcbiAgICAnWENEJzogW3UsICckJ10sXG4gICAgJ1hYWCc6IFtdXG4gIH0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==