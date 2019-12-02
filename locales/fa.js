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
        define("@angular/common/locales/fa", ["require", "exports"], factory);
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
        'fa', [['ق', 'ب'], ['ق.ظ.', 'ب.ظ.'], ['قبل\u200cازظهر', 'بعدازظهر']], u,
        [
            ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
            [
                'یکشنبه', 'دوشنبه', 'سه\u200cشنبه', 'چهارشنبه', 'پنجشنبه',
                'جمعه', 'شنبه'
            ],
            u, ['۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج', 'ش']
        ],
        u,
        [
            ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
            [
                'ژانویهٔ', 'فوریهٔ', 'مارس', 'آوریل', 'مهٔ', 'ژوئن',
                'ژوئیهٔ', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
            ],
            u
        ],
        [
            ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا', 'ن', 'د'],
            [
                'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه',
                'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
            ],
            u
        ],
        [['ق', 'م'], ['ق.م.', 'م.'], ['قبل از میلاد', 'میلادی']], 6, [5, 5],
        ['y/M/d', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
        ['H:mm', 'H:mm:ss', 'H:mm:ss (z)', 'H:mm:ss (zzzz)'],
        ['{1}،\u200f {0}', u, '{1}، ساعت {0}', u],
        ['.', ',', ';', '%', '\u200e+', '\u200e−', 'E', '×', '‰', '∞', 'ناعدد', ':'],
        ['#,##0.###', '#,##0%', '\u200e¤ #,##0.00', '#E0'], 'ریال', 'ریال ایران', {
            'AFN': ['؋'],
            'CAD': ['$CA', '$'],
            'CNY': ['¥CN', '¥'],
            'HKD': ['$HK', '$'],
            'IRR': ['ریال'],
            'MXN': ['$MX', '$'],
            'NZD': ['$NZ', '$'],
            'THB': ['฿'],
            'XCD': ['$EC', '$']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9mYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN2RTtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ25DO2dCQUNFLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxTQUFTO2dCQUN6RCxNQUFNLEVBQUUsTUFBTTthQUNmO1lBQ0QsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1NBQzVDO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU07Z0JBQ25ELFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUTthQUN4RDtZQUNELENBQUM7U0FDRjtRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPO2dCQUN6RCxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUTthQUM5QztZQUNELENBQUM7U0FDRjtRQUNELENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO1FBQ2pELENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUM7UUFDcEQsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDO1FBQzVFLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFO1lBQ3hFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1NBQ3BCO1FBQ0QsTUFBTTtLQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcbiAgaWYgKGkgPT09IDAgfHwgbiA9PT0gMSkgcmV0dXJuIDE7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdmYScsIFtbJ9mCJywgJ9ioJ10sIFsn2YIu2LguJywgJ9ioLti4LiddLCBbJ9mC2KjZhFxcdTIwMGPYp9iy2LjZh9ixJywgJ9io2LnYr9in2LLYuNmH2LEnXV0sIHUsXG4gIFtcbiAgICBbJ9uMJywgJ9ivJywgJ9izJywgJ9qGJywgJ9m+JywgJ9isJywgJ9i0J10sXG4gICAgW1xuICAgICAgJ9uM2qnYtNmG2KjZhycsICfYr9mI2LTZhtio2YcnLCAn2LPZh1xcdTIwMGPYtNmG2KjZhycsICfahtmH2KfYsdi02YbYqNmHJywgJ9m+2YbYrNi02YbYqNmHJyxcbiAgICAgICfYrNmF2LnZhycsICfYtNmG2KjZhydcbiAgICBdLFxuICAgIHUsIFsn27HYtCcsICfbsti0JywgJ9uz2LQnLCAn27TYtCcsICfbtdi0JywgJ9isJywgJ9i0J11cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn2pgnLCAn2YEnLCAn2YUnLCAn2KInLCAn2YUnLCAn2pgnLCAn2pgnLCAn2KcnLCAn2LMnLCAn2KcnLCAn2YYnLCAn2K8nXSxcbiAgICBbXG4gICAgICAn2pjYp9mG2YjbjNmH2ZQnLCAn2YHZiNix24zZh9mUJywgJ9mF2KfYsdizJywgJ9ii2YjYsduM2YQnLCAn2YXZh9mUJywgJ9qY2YjYptmGJyxcbiAgICAgICfamNmI2KbbjNmH2ZQnLCAn2KfZiNiqJywgJ9iz2b7Yqtin2YXYqNixJywgJ9in2qnYqtio2LEnLCAn2YbZiNin2YXYqNixJywgJ9iv2LPYp9mF2KjYsSdcbiAgICBdLFxuICAgIHVcbiAgXSxcbiAgW1xuICAgIFsn2pgnLCAn2YEnLCAn2YUnLCAn2KInLCAn2YUnLCAn2pgnLCAn2pgnLCAn2KcnLCAn2LMnLCAn2KcnLCAn2YYnLCAn2K8nXSxcbiAgICBbXG4gICAgICAn2pjYp9mG2YjbjNmHJywgJ9mB2YjYsduM2YcnLCAn2YXYp9ix2LMnLCAn2KLZiNix24zZhCcsICfZhdmHJywgJ9qY2YjYptmGJywgJ9qY2YjYptuM2YcnLFxuICAgICAgJ9in2YjYqicsICfYs9m+2KrYp9mF2KjYsScsICfYp9qp2KrYqNixJywgJ9mG2YjYp9mF2KjYsScsICfYr9iz2KfZhdio2LEnXG4gICAgXSxcbiAgICB1XG4gIF0sXG4gIFtbJ9mCJywgJ9mFJ10sIFsn2YIu2YUuJywgJ9mFLiddLCBbJ9mC2KjZhCDYp9iyINmF24zZhNin2K8nLCAn2YXbjNmE2KfYr9uMJ11dLCA2LCBbNSwgNV0sXG4gIFsneS9NL2QnLCAnZCBNTU0geScsICdkIE1NTU0geScsICdFRUVFIGQgTU1NTSB5J10sXG4gIFsnSDptbScsICdIOm1tOnNzJywgJ0g6bW06c3MgKHopJywgJ0g6bW06c3MgKHp6enopJ10sXG4gIFsnezF92IxcXHUyMDBmIHswfScsIHUsICd7MX3YjCDYs9in2LnYqiB7MH0nLCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJ1xcdTIwMGUrJywgJ1xcdTIwMGXiiJInLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ9mG2KfYudiv2K8nLCAnOiddLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMCUnLCAnXFx1MjAwZcKkwqAjLCMjMC4wMCcsICcjRTAnXSwgJ9ix24zYp9mEJywgJ9ix24zYp9mEINin24zYsdin2YYnLCB7XG4gICAgJ0FGTic6IFsn2IsnXSxcbiAgICAnQ0FEJzogWyckQ0EnLCAnJCddLFxuICAgICdDTlknOiBbJ8KlQ04nLCAnwqUnXSxcbiAgICAnSEtEJzogWyckSEsnLCAnJCddLFxuICAgICdJUlInOiBbJ9ix24zYp9mEJ10sXG4gICAgJ01YTic6IFsnJE1YJywgJyQnXSxcbiAgICAnTlpEJzogWyckTlonLCAnJCddLFxuICAgICdUSEInOiBbJ+C4vyddLFxuICAgICdYQ0QnOiBbJyRFQycsICckJ11cbiAgfSxcbiAgcGx1cmFsXG5dO1xuIl19