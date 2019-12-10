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
        define("@angular/common/locales/am", ["require", "exports"], factory);
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
        'am',
        [['ጠ', 'ከ'], ['ጥዋት', 'ከሰዓት'], u],
        u,
        [
            ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
            ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
            ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
            ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ']
        ],
        u,
        [
            ['ጃ', 'ፌ', 'ማ', 'ኤ', 'ሜ', 'ጁ', 'ጁ', 'ኦ', 'ሴ', 'ኦ', 'ኖ', 'ዲ'],
            [
                'ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕሪ', 'ሜይ', 'ጁን', 'ጁላይ',
                'ኦገስ', 'ሴፕቴ', 'ኦክቶ', 'ኖቬም', 'ዲሴም'
            ],
            [
                'ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን',
                'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር',
                'ዲሴምበር'
            ]
        ],
        u,
        [['ዓ/ዓ', 'ዓ/ም'], u, ['ዓመተ ዓለም', 'ዓመተ ምሕረት']],
        0,
        [6, 0],
        ['dd/MM/y', 'd MMM y', 'd MMMM y', 'y MMMM d, EEEE'],
        ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
        ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'],
        'ብር',
        'የኢትዮጵያ ብር',
        {
            'AUD': ['AU$', '$'],
            'CNH': ['የቻይና ዩዋን'],
            'ETB': ['ብር'],
            'JPY': ['JP¥', '¥'],
            'THB': ['฿'],
            'TWD': ['NT$'],
            'USD': ['US$', '$']
        },
        'ltr',
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9hbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJO1FBQ0osQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDbkMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDaEQsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDakQsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7U0FDcEM7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzVEO2dCQUNFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBQzdDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO2FBQ2xDO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJO2dCQUMzQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTztnQkFDekMsT0FBTzthQUNSO1NBQ0Y7UUFDRCxDQUFDO1FBQ0QsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7UUFDcEQsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQztRQUN4RCxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO1FBQzlELENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDO1FBQzNDLElBQUk7UUFDSixXQUFXO1FBQ1g7WUFDRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDYixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNkLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7U0FDcEI7UUFDRCxLQUFLO1FBQ0wsTUFBTTtLQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcbiAgaWYgKGkgPT09IDAgfHwgbiA9PT0gMSkgcmV0dXJuIDE7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdhbScsXG4gIFtbJ+GMoCcsICfhiqgnXSwgWyfhjKXhi4vhibUnLCAn4Yqo4Yiw4YuT4Ym1J10sIHVdLFxuICB1LFxuICBbXG4gICAgWyfhiqUnLCAn4YiwJywgJ+GImycsICfhiKgnLCAn4YiQJywgJ+GLkycsICfhiYUnXSxcbiAgICBbJ+GKpeGIkeGLtScsICfhiLDhip4nLCAn4Yib4Yqt4YiwJywgJ+GIqOGJoeGLlScsICfhiJDhiJnhiLUnLCAn4YuT4Yit4YmlJywgJ+GJheGLs+GInCddLFxuICAgIFsn4Yql4YiR4Yu1JywgJ+GIsOGKnicsICfhiJvhiq3hiLDhip4nLCAn4Yio4Ymh4YuVJywgJ+GIkOGImeGItScsICfhi5PhiK3hiaUnLCAn4YmF4Yuz4YicJ10sXG4gICAgWyfhiqUnLCAn4YiwJywgJ+GImycsICfhiKgnLCAn4YiQJywgJ+GLkycsICfhiYUnXVxuICBdLFxuICB1LFxuICBbXG4gICAgWyfhjIMnLCAn4Y2MJywgJ+GImycsICfhiqQnLCAn4YicJywgJ+GMgScsICfhjIEnLCAn4YqmJywgJ+GItCcsICfhiqYnLCAn4YqWJywgJ+GLsiddLFxuICAgIFtcbiAgICAgICfhjIPhipXhi6knLCAn4Y2M4Yml4YipJywgJ+GIm+GIreGJvScsICfhiqThjZXhiKonLCAn4Yic4YutJywgJ+GMgeGKlScsICfhjIHhiIvhi60nLFxuICAgICAgJ+GKpuGMiOGItScsICfhiLThjZXhibQnLCAn4Yqm4Yqt4Ym2JywgJ+GKluGJrOGInScsICfhi7LhiLThiJ0nXG4gICAgXSxcbiAgICBbXG4gICAgICAn4YyD4YqV4Yup4YuI4YiqJywgJ+GNjOGJpeGIqeGLiOGIqicsICfhiJvhiK3hib0nLCAn4Yqk4Y2V4Yiq4YiNJywgJ+GInOGLrScsICfhjIHhipUnLFxuICAgICAgJ+GMgeGIi+GLrScsICfhiqbhjIjhiLXhibUnLCAn4Yi04Y2V4Ym04Yid4Ymg4YitJywgJ+GKpuGKreGJtuGJoOGIrScsICfhipbhiazhiJ3hiaDhiK0nLFxuICAgICAgJ+GLsuGItOGIneGJoOGIrSdcbiAgICBdXG4gIF0sXG4gIHUsXG4gIFtbJ+GLky/hi5MnLCAn4YuTL+GInSddLCB1LCBbJ+GLk+GImOGJsCDhi5PhiIjhiJ0nLCAn4YuT4YiY4YmwIOGIneGIleGIqOGJtSddXSxcbiAgMCxcbiAgWzYsIDBdLFxuICBbJ2RkL01NL3knLCAnZCBNTU0geScsICdkIE1NTU0geScsICd5IE1NTU0gZCwgRUVFRSddLFxuICBbJ2g6bW0gYScsICdoOm1tOnNzIGEnLCAnaDptbTpzcyBhIHonLCAnaDptbTpzcyBhIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLicsICcsJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICfCpCMsIyMwLjAwJywgJyNFMCddLFxuICAn4Yml4YitJyxcbiAgJ+GLqOGKouGJteGLruGMteGLqyDhiaXhiK0nLFxuICB7XG4gICAgJ0FVRCc6IFsnQVUkJywgJyQnXSxcbiAgICAnQ05IJzogWyfhi6jhibvhi63hipMg4Yup4YuL4YqVJ10sXG4gICAgJ0VUQic6IFsn4Yml4YitJ10sXG4gICAgJ0pQWSc6IFsnSlDCpScsICfCpSddLFxuICAgICdUSEInOiBbJ+C4vyddLFxuICAgICdUV0QnOiBbJ05UJCddLFxuICAgICdVU0QnOiBbJ1VTJCcsICckJ11cbiAgfSxcbiAgJ2x0cicsXG4gIHBsdXJhbFxuXTtcbiJdfQ==