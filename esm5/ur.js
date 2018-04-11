"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
    'ur', [['a', 'p'], ['AM', 'PM'], u], [['AM', 'PM'], u, u],
    [
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'], u, u
    ],
    u,
    [
        ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        [
            'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی',
            'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
        ],
        u
    ],
    u, [['قبل مسیح', 'عیسوی'], u, u], 0, [6, 0],
    ['d/M/yy', 'd MMM، y', 'd MMMM، y', 'EEEE، d MMMM، y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'], ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '\u200e+', '\u200e-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], 'Rs', 'پاکستانی روپیہ',
    { 'JPY': ['JP¥', '¥'], 'PKR': ['Rs'], 'THB': ['฿'], 'TWD': ['NT$'] }, plural
];
//# sourceMappingURL=ur.js.map