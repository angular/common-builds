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
    var i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
    if (v === 0 && i % 10 === 1 || f % 10 === 1)
        return 1;
    return 5;
}
exports.default = [
    'mk', [['претпл.', 'попл.'], u, ['претпладне', 'попладне']], u,
    [
        ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
        ['нед.', 'пон.', 'вт.', 'сре.', 'чет.', 'пет.', 'саб.'],
        [
            'недела', 'понеделник', 'вторник', 'среда', 'четврток',
            'петок', 'сабота'
        ],
        ['нед.', 'пон.', 'вто.', 'сре.', 'чет.', 'пет.', 'саб.']
    ],
    [
        ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
        ['нед.', 'пон.', 'вто.', 'сре.', 'чет.', 'пет.', 'саб.'],
        [
            'недела', 'понеделник', 'вторник', 'среда', 'четврток',
            'петок', 'сабота'
        ],
        ['нед.', 'пон.', 'вто.', 'сре.', 'чет.', 'пет.', 'саб.']
    ],
    [
        ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        [
            'јан.', 'фев.', 'мар.', 'апр.', 'мај', 'јун.', 'јул.', 'авг.',
            'септ.', 'окт.', 'ноем.', 'дек.'
        ],
        [
            'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
            'јули', 'август', 'септември', 'октомври', 'ноември',
            'декември'
        ]
    ],
    u, [['пр.н.е.', 'н.е.'], u, ['пред нашата ера', 'од нашата ера']],
    1, [6, 0], ['dd.M.yy', 'dd.M.y', 'dd MMMM y', 'EEEE, dd MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, u, u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], 'ден', 'Македонски денар', {
        'AUD': [u, '$'],
        'CNY': [u, '¥'],
        'GBP': [u, '£'],
        'HKD': [u, '$'],
        'ILS': [u, '₪'],
        'INR': [u, '₹'],
        'JPY': [u, '¥'],
        'KRW': [u, '₩'],
        'MKD': ['ден'],
        'NZD': [u, '$'],
        'TWD': [u, 'NT$'],
        'USD': ['US$', '$'],
        'VND': [u, '₫']
    },
    plural
];
//# sourceMappingURL=mk.js.map