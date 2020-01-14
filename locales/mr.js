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
        define("@angular/common/locales/mr", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === 0 || n === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'mr',
        [['स', 'सं'], ['म.पू.', 'म.उ.'], u],
        [['म.पू.', 'म.उ.'], u, u],
        [
            ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
            [
                'रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र',
                'शनि'
            ],
            [
                'रविवार', 'सोमवार', 'मंगळवार', 'बुधवार',
                'गुरुवार', 'शुक्रवार', 'शनिवार'
            ],
            ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श']
        ],
        u,
        [
            [
                'जा', 'फे', 'मा', 'ए', 'मे', 'जू', 'जु', 'ऑ', 'स', 'ऑ',
                'नो', 'डि'
            ],
            [
                'जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे',
                'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो',
                'नोव्हें', 'डिसें'
            ],
            [
                'जानेवारी', 'फेब्रुवारी', 'मार्च',
                'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट',
                'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर',
                'डिसेंबर'
            ]
        ],
        u,
        [
            ['इ. स. पू.', 'इ. स.'], u,
            ['ईसवीसनपूर्व', 'ईसवीसन']
        ],
        0,
        [0, 0],
        ['d/M/yy', 'd MMM, y', 'd MMMM, y', 'EEEE, d MMMM, y'],
        ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
        ['{1}, {0}', u, '{1} रोजी {0}', u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##,##0.###', '#,##0%', '¤#,##0.00', '[#E0]'],
        'INR',
        '₹',
        'भारतीय रुपया',
        { 'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'TWD': ['NT$'] },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9tci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJO1FBQ0osQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7WUFDeEM7Z0JBQ0UsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPO2dCQUM1QyxLQUFLO2FBQ047WUFDRDtnQkFDRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRO2dCQUN2QyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVE7YUFDaEM7WUFDRCxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztTQUN6QztRQUNELENBQUM7UUFDRDtZQUNFO2dCQUNFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7Z0JBQ3RELElBQUksRUFBRSxJQUFJO2FBQ1g7WUFDRDtnQkFDRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSTtnQkFDeEMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU87Z0JBQ3RDLFNBQVMsRUFBRSxPQUFPO2FBQ25CO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFLFlBQVksRUFBRSxPQUFPO2dCQUNqQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTztnQkFDdEMsVUFBVSxFQUFFLFNBQVMsRUFBRSxXQUFXO2dCQUNsQyxTQUFTO2FBQ1Y7U0FDRjtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDekIsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO1NBQzFCO1FBQ0QsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLENBQUM7UUFDdEQsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQztRQUN4RCxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO1FBQzlELENBQUMsY0FBYyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDO1FBQ2hELEtBQUs7UUFDTCxHQUFHO1FBQ0gsY0FBYztRQUNkLEVBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFDO1FBQ25ELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IG4gPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnbXInLFxuICBbWyfgpLgnLCAn4KS44KSCJ10sIFsn4KSuLuCkquClgi4nLCAn4KSuLuCkiS4nXSwgdV0sXG4gIFtbJ+Ckri7gpKrgpYIuJywgJ+Ckri7gpIkuJ10sIHUsIHVdLFxuICBbXG4gICAgWyfgpLAnLCAn4KS44KWLJywgJ+CkruCkgicsICfgpKzgpYEnLCAn4KSX4KWBJywgJ+CktuClgScsICfgpLYnXSxcbiAgICBbXG4gICAgICAn4KSw4KS14KS/JywgJ+CkuOCli+CkricsICfgpK7gpILgpJfgpLMnLCAn4KSs4KWB4KSnJywgJ+Ckl+ClgeCksOClgScsICfgpLbgpYHgpJXgpY3gpLAnLFxuICAgICAgJ+CktuCkqOCkvydcbiAgICBdLFxuICAgIFtcbiAgICAgICfgpLDgpLXgpL/gpLXgpL7gpLAnLCAn4KS44KWL4KSu4KS14KS+4KSwJywgJ+CkruCkguCkl+Cks+CkteCkvuCksCcsICfgpKzgpYHgpKfgpLXgpL7gpLAnLFxuICAgICAgJ+Ckl+ClgeCksOClgeCkteCkvuCksCcsICfgpLbgpYHgpJXgpY3gpLDgpLXgpL7gpLAnLCAn4KS24KSo4KS/4KS14KS+4KSwJ1xuICAgIF0sXG4gICAgWyfgpLAnLCAn4KS44KWLJywgJ+CkruCkgicsICfgpKzgpYEnLCAn4KSX4KWBJywgJ+CktuClgScsICfgpLYnXVxuICBdLFxuICB1LFxuICBbXG4gICAgW1xuICAgICAgJ+CknOCkvicsICfgpKvgpYcnLCAn4KSu4KS+JywgJ+CkjycsICfgpK7gpYcnLCAn4KSc4KWCJywgJ+CknOClgScsICfgpJEnLCAn4KS4JywgJ+CkkScsXG4gICAgICAn4KSo4KWLJywgJ+CkoeCkvydcbiAgICBdLFxuICAgIFtcbiAgICAgICfgpJzgpL7gpKjgpYcnLCAn4KSr4KWH4KSs4KWN4KSw4KWBJywgJ+CkruCkvuCksOCljeCkmicsICfgpI/gpKrgpY3gpLDgpL8nLCAn4KSu4KWHJyxcbiAgICAgICfgpJzgpYLgpKgnLCAn4KSc4KWB4KSy4KWIJywgJ+CkkeCklycsICfgpLjgpKrgpY3gpJ/gpYfgpIInLCAn4KSR4KSV4KWN4KSf4KWLJyxcbiAgICAgICfgpKjgpYvgpLXgpY3gpLngpYfgpIInLCAn4KSh4KS/4KS44KWH4KSCJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+CknOCkvuCkqOClh+CkteCkvuCksOClgCcsICfgpKvgpYfgpKzgpY3gpLDgpYHgpLXgpL7gpLDgpYAnLCAn4KSu4KS+4KSw4KWN4KSaJyxcbiAgICAgICfgpI/gpKrgpY3gpLDgpL/gpLInLCAn4KSu4KWHJywgJ+CknOClguCkqCcsICfgpJzgpYHgpLLgpYgnLCAn4KSR4KSX4KS44KWN4KSfJyxcbiAgICAgICfgpLjgpKrgpY3gpJ/gpYfgpILgpKzgpLAnLCAn4KSR4KSV4KWN4KSf4KWL4KSs4KSwJywgJ+CkqOCli+CkteCljeCkueClh+CkguCkrOCksCcsXG4gICAgICAn4KSh4KS/4KS44KWH4KSC4KSs4KSwJ1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn4KSHLiDgpLguIOCkquClgi4nLCAn4KSHLiDgpLguJ10sIHUsXG4gICAgWyfgpIjgpLjgpLXgpYDgpLjgpKjgpKrgpYLgpLDgpY3gpLUnLCAn4KSI4KS44KS14KWA4KS44KSoJ11cbiAgXSxcbiAgMCxcbiAgWzAsIDBdLFxuICBbJ2QvTS95eScsICdkIE1NTSwgeScsICdkIE1NTU0sIHknLCAnRUVFRSwgZCBNTU1NLCB5J10sXG4gIFsnaDptbSBhJywgJ2g6bW06c3MgYScsICdoOm1tOnNzIGEgeicsICdoOm1tOnNzIGEgenp6eiddLFxuICBbJ3sxfSwgezB9JywgdSwgJ3sxfSDgpLDgpYvgpJzgpYAgezB9JywgdV0sXG4gIFsnLicsICcsJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIywjIzAuIyMjJywgJyMsIyMwJScsICfCpCMsIyMwLjAwJywgJ1sjRTBdJ10sXG4gICdJTlInLFxuICAn4oK5JyxcbiAgJ+CkreCkvuCksOCkpOClgOCkryDgpLDgpYHgpKrgpK/gpL4nLFxuICB7J0pQWSc6IFsnSlDCpScsICfCpSddLCAnVEhCJzogWyfguL8nXSwgJ1RXRCc6IFsnTlQkJ119LFxuICBwbHVyYWxcbl07XG4iXX0=