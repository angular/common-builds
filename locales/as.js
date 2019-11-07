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
        define("@angular/common/locales/as", ["require", "exports"], factory);
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
        'as', [['পূৰ্বাহ্ন', 'অপৰাহ্ন'], u, u], u,
        [
            ['দ', 'স', 'ম', 'ব', 'ব', 'শ', 'শ'], ['দেও', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্ৰ', 'শনি'],
            ['দেওবাৰ', 'সোমবাৰ', 'মঙ্গলবাৰ', 'বুধবাৰ', 'বৃহস্পতিবাৰ', 'শুক্ৰবাৰ', 'শনিবাৰ'],
            ['দেও', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্ৰ', 'শনি']
        ],
        u,
        [
            ['জ', 'ফ', 'ম', 'এ', 'ম', 'জ', 'জ', 'আ', 'ছ', 'অ', 'ন', 'ড'],
            ['জানু', 'ফেব্ৰু', 'মাৰ্চ', 'এপ্ৰিল', 'মে’', 'জুন', 'জুলাই', 'আগ', 'ছেপ্তে', 'অক্টো', 'নৱে', 'ডিচে'],
            [
                'জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ', 'এপ্ৰিল', 'মে’', 'জুন', 'জুলাই', 'আগষ্ট', 'ছেপ্তেম্বৰ', 'অক্টোবৰ',
                'নৱেম্বৰ', 'ডিচেম্বৰ'
            ]
        ],
        u, [['খ্ৰীঃ পূঃ', 'খ্ৰীঃ'], u, ['খ্ৰীষ্টপূৰ্ব', 'খ্ৰীষ্টাব্দ']], 0, [0, 0],
        ['d-M-y', 'dd-MM-y', 'd MMMM, y', 'EEEE, d MMMM, y'],
        ['a h.mm', 'a h.mm.ss', 'a h.mm.ss z', 'a h.mm.ss zzzz'], ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##,##0.###', '#,##,##0%', '¤ #,##,##0.00', '#E0'], '₹', 'ভাৰতীয় ৰুপী',
        { 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9hcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN6QztZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUM7WUFDMUYsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFDL0UsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUM7U0FDdEQ7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzVELENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7WUFDcEc7Z0JBQ0UsVUFBVSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUztnQkFDcEcsU0FBUyxFQUFFLFVBQVU7YUFDdEI7U0FDRjtRQUNELENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQztRQUNwRCxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM5RCxDQUFDLGNBQWMsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxjQUFjO1FBQzFFLEVBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBQyxFQUFFLE1BQU07S0FDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuICBpZiAoaSA9PT0gMCB8fCBuID09PSAxKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2FzJywgW1sn4Kaq4KeC4Kew4KeN4Kas4Ka+4Ka54KeN4KaoJywgJ+CmheCmquCnsOCmvuCmueCnjeCmqCddLCB1LCB1XSwgdSxcbiAgW1xuICAgIFsn4KamJywgJ+CmuCcsICfgpq4nLCAn4KasJywgJ+CmrCcsICfgprYnLCAn4Ka2J10sIFsn4Kam4KeH4KaTJywgJ+CmuOCni+CmricsICfgpq7gppngp43gppfgprInLCAn4Kas4KeB4KanJywgJ+CmrOCng+CmuScsICfgprbgp4HgppXgp43gp7AnLCAn4Ka24Kao4Ka/J10sXG4gICAgWyfgpqbgp4fgppPgpqzgpr7gp7AnLCAn4Ka44KeL4Kau4Kas4Ka+4KewJywgJ+CmruCmmeCnjeCml+CmsuCmrOCmvuCnsCcsICfgpqzgp4Hgpqfgpqzgpr7gp7AnLCAn4Kas4KeD4Ka54Ka44KeN4Kaq4Kak4Ka/4Kas4Ka+4KewJywgJ+CmtuCngeCmleCnjeCnsOCmrOCmvuCnsCcsICfgprbgpqjgpr/gpqzgpr7gp7AnXSxcbiAgICBbJ+CmpuCnh+CmkycsICfgprjgp4vgpq4nLCAn4Kau4KaZ4KeN4KaX4KayJywgJ+CmrOCngeCmpycsICfgpqzgp4PgprknLCAn4Ka24KeB4KaV4KeN4KewJywgJ+CmtuCmqOCmvyddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ+CmnCcsICfgpqsnLCAn4KauJywgJ+CmjycsICfgpq4nLCAn4KacJywgJ+CmnCcsICfgpoYnLCAn4KabJywgJ+CmhScsICfgpqgnLCAn4KahJ10sXG4gICAgWyfgppzgpr7gpqjgp4EnLCAn4Kar4KeH4Kas4KeN4Kew4KeBJywgJ+CmruCmvuCnsOCnjeCmmicsICfgpo/gpqrgp43gp7Dgpr/gprInLCAn4Kau4KeH4oCZJywgJ+CmnOCngeCmqCcsICfgppzgp4HgprLgpr7gpocnLCAn4KaG4KaXJywgJ+Cmm+Cnh+CmquCnjeCmpOCnhycsICfgpoXgppXgp43gpp/gp4snLCAn4Kao4Kex4KeHJywgJ+CmoeCmv+CmmuCnhyddLFxuICAgIFtcbiAgICAgICfgppzgpr7gpqjgp4Hgp7Hgpr7gp7Dgp4AnLCAn4Kar4KeH4Kas4KeN4Kew4KeB4Kex4Ka+4Kew4KeAJywgJ+CmruCmvuCnsOCnjeCmmicsICfgpo/gpqrgp43gp7Dgpr/gprInLCAn4Kau4KeH4oCZJywgJ+CmnOCngeCmqCcsICfgppzgp4HgprLgpr7gpocnLCAn4KaG4KaX4Ka34KeN4KafJywgJ+Cmm+Cnh+CmquCnjeCmpOCnh+CmruCnjeCmrOCnsCcsICfgpoXgppXgp43gpp/gp4vgpqzgp7AnLFxuICAgICAgJ+CmqOCnseCnh+CmruCnjeCmrOCnsCcsICfgpqHgpr/gpprgp4fgpq7gp43gpqzgp7AnXG4gICAgXVxuICBdLFxuICB1LCBbWyfgppbgp43gp7Dgp4DgpoMg4Kaq4KeC4KaDJywgJ+CmluCnjeCnsOCngOCmgyddLCB1LCBbJ+CmluCnjeCnsOCngOCmt+CnjeCmn+CmquCnguCnsOCnjeCmrCcsICfgppbgp43gp7Dgp4Dgprfgp43gpp/gpr7gpqzgp43gpqYnXV0sIDAsIFswLCAwXSxcbiAgWydkLU0teScsICdkZC1NTS15JywgJ2QgTU1NTSwgeScsICdFRUVFLCBkIE1NTU0sIHknXSxcbiAgWydhIGgubW0nLCAnYSBoLm1tLnNzJywgJ2EgaC5tbS5zcyB6JywgJ2EgaC5tbS5zcyB6enp6J10sIFsnezF9IHswfScsIHUsIHUsIHVdLFxuICBbJy4nLCAnLCcsICc7JywgJyUnLCAnKycsICctJywgJ0UnLCAnw5cnLCAn4oCwJywgJ+KInicsICdOYU4nLCAnOiddLFxuICBbJyMsIyMsIyMwLiMjIycsICcjLCMjLCMjMCUnLCAnwqTCoCMsIyMsIyMwLjAwJywgJyNFMCddLCAn4oK5JywgJ+CmreCmvuCnsOCmpOCngOCmr+CmvCDgp7Dgp4Hgpqrgp4AnLFxuICB7J0pQWSc6IFsnSlDCpScsICfCpSddLCAnVVNEJzogWydVUyQnLCAnJCddfSwgcGx1cmFsXG5dO1xuIl19