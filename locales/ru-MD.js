/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// THIS CODE IS GENERATED - DO NOT MODIFY.
const u = undefined;
function plural(val) {
    const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;
    if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)))
        return 1;
    if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)))
        return 3;
    if (v === 0 && i % 10 === 0 || (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 5 && i % 10 <= 9)) || v === 0 && (i % 100 === Math.floor(i % 100) && (i % 100 >= 11 && i % 100 <= 14))))
        return 4;
    return 5;
}
export default ["ru-MD", [["AM", "PM"], u, u], u, [["В", "П", "В", "С", "Ч", "П", "С"], ["вс", "пн", "вт", "ср", "чт", "пт", "сб"], ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"], ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]], u, [["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"], ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."], ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]], [["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"], ["янв.", "февр.", "март", "апр.", "май", "июнь", "июль", "авг.", "сент.", "окт.", "нояб.", "дек."], ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]], [["до н.э.", "н.э."], ["до н. э.", "н. э."], ["до Рождества Христова", "от Рождества Христова"]], 1, [6, 0], ["dd.MM.y", "d MMM y 'г'.", "d MMMM y 'г'.", "EEEE, d MMMM y 'г'."], ["HH:mm", "HH:mm:ss", "HH:mm:ss z", "HH:mm:ss zzzz"], ["{1}, {0}", u, u, u], [",", " ", ";", "%", "+", "-", "E", "×", "‰", "∞", "не число", ":"], ["#,##0.###", "#,##0 %", "#,##0.00 ¤", "#E0"], "MDL", "L", "молдавский лей", { "BYN": [u, "р."], "GEL": [u, "ლ"], "MDL": ["L"], "PHP": [u, "₱"], "RON": [u, "L"], "RUB": ["₽"], "RUR": ["р."], "THB": ["฿"], "TMT": ["ТМТ"], "TWD": ["NT$"], "UAH": ["₴"], "XXX": ["XXXX"] }, "ltr", plural];
//# sourceMappingURL=ru-MD.js.map