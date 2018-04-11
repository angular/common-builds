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
    var i = Math.floor(Math.abs(n));
    if (i === 0 || n === 1)
        return 1;
    return 5;
}
exports.default = [
    'zu', [['a', 'p'], ['AM', 'PM'], u], [['AM', 'PM'], u, u],
    [
        ['S', 'M', 'B', 'T', 'S', 'H', 'M'], ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
        ['ISonto', 'UMsombuluko', 'ULwesibili', 'ULwesithathu', 'ULwesine', 'ULwesihlanu', 'UMgqibelo'],
        ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq']
    ],
    u,
    [
        ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        ['Jan', 'Feb', 'Mas', 'Eph', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
        [
            'Januwari', 'Februwari', 'Mashi', 'Ephreli', 'Meyi', 'Juni', 'Julayi', 'Agasti', 'Septhemba',
            'Okthoba', 'Novemba', 'Disemba'
        ]
    ],
    [
        ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        ['Jan', 'Feb', 'Mas', 'Eph', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
        [
            'Januwari', 'Februwari', 'Mashi', 'Ephreli', 'Meyi', 'Juni', 'Julayi', 'Agasti', 'Septhemba',
            'Okthoba', 'Novemba', 'Disemba'
        ]
    ],
    [['BC', 'AD'], u, u], 0, [6, 0], ['M/d/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, u, u],
    ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], 'R', 'i-South African Rand', {
        'BYN': [u, 'P.'],
        'DKK': [u, 'Kr'],
        'HRK': [u, 'Kn'],
        'ISK': [u, 'Kr'],
        'JPY': ['JP¥', '¥'],
        'NOK': [u, 'Kr'],
        'PLN': [u, 'Zł'],
        'SEK': [u, 'Kr'],
        'THB': ['฿'],
        'TWD': ['NT$'],
        'USD': ['US$', '$'],
        'ZAR': ['R']
    },
    plural
];
//# sourceMappingURL=zu.js.map