/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NumberFormatStyle, NumberSymbol, getLocaleNumberFormat, getLocaleNumberSymbol, getNumberOfCurrencyDigits } from './locale_data_api';
export const /** @type {?} */ NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const /** @type {?} */ MAX_DIGITS = 22;
const /** @type {?} */ DECIMAL_SEP = '.';
const /** @type {?} */ ZERO_CHAR = '0';
const /** @type {?} */ PATTERN_SEP = ';';
const /** @type {?} */ GROUP_SEP = ',';
const /** @type {?} */ DIGIT_CHAR = '#';
const /** @type {?} */ CURRENCY_CHAR = '¤';
const /** @type {?} */ PERCENT_CHAR = '%';
/**
 * Transforms a number to a locale string based on a style and a format
 * @param {?} value
 * @param {?} pattern
 * @param {?} locale
 * @param {?} groupSymbol
 * @param {?} decimalSymbol
 * @param {?=} digitsInfo
 * @param {?=} isPercent
 * @return {?}
 */
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent = false) {
    let /** @type {?} */ formattedText = '';
    let /** @type {?} */ isZero = false;
    if (!isFinite(value)) {
        formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
    }
    else {
        let /** @type {?} */ parsedNumber = parseNumber(value);
        if (isPercent) {
            parsedNumber = toPercent(parsedNumber);
        }
        let /** @type {?} */ minInt = pattern.minInt;
        let /** @type {?} */ minFraction = pattern.minFrac;
        let /** @type {?} */ maxFraction = pattern.maxFrac;
        if (digitsInfo) {
            const /** @type {?} */ parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
            if (parts === null) {
                throw new Error(`${digitsInfo} is not a valid digit info`);
            }
            const /** @type {?} */ minIntPart = parts[1];
            const /** @type {?} */ minFractionPart = parts[3];
            const /** @type {?} */ maxFractionPart = parts[5];
            if (minIntPart != null) {
                minInt = parseIntAutoRadix(minIntPart);
            }
            if (minFractionPart != null) {
                minFraction = parseIntAutoRadix(minFractionPart);
            }
            if (maxFractionPart != null) {
                maxFraction = parseIntAutoRadix(maxFractionPart);
            }
            else if (minFractionPart != null && minFraction > maxFraction) {
                maxFraction = minFraction;
            }
        }
        roundNumber(parsedNumber, minFraction, maxFraction);
        let /** @type {?} */ digits = parsedNumber.digits;
        let /** @type {?} */ integerLen = parsedNumber.integerLen;
        const /** @type {?} */ exponent = parsedNumber.exponent;
        let /** @type {?} */ decimals = [];
        isZero = digits.every(d => !d);
        // pad zeros for small numbers
        for (; integerLen < minInt; integerLen++) {
            digits.unshift(0);
        }
        // pad zeros for small numbers
        for (; integerLen < 0; integerLen++) {
            digits.unshift(0);
        }
        // extract decimals digits
        if (integerLen > 0) {
            decimals = digits.splice(integerLen, digits.length);
        }
        else {
            decimals = digits;
            digits = [0];
        }
        // format the integer digits with grouping separators
        const /** @type {?} */ groups = [];
        if (digits.length >= pattern.lgSize) {
            groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
        }
        while (digits.length > pattern.gSize) {
            groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
        }
        if (digits.length) {
            groups.unshift(digits.join(''));
        }
        formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));
        // append the decimal digits
        if (decimals.length) {
            formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join('');
        }
        if (exponent) {
            formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + '+' + exponent;
        }
    }
    if (value < 0 && !isZero) {
        formattedText = pattern.negPre + formattedText + pattern.negSuf;
    }
    else {
        formattedText = pattern.posPre + formattedText + pattern.posSuf;
    }
    return formattedText;
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a number as currency using locale rules.
 *
 * Use `currency` to format a number as currency.
 *
 * Where:
 * - `value` is a number.
 * - `locale` is a `string` defining the locale to use.
 * - `currency` is the string that represents the currency, it can be its symbol or its name.
 * - `currencyCode` is the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code, such
 *    as `USD` for the US dollar and `EUR` for the euro.
 * - `digitInfo` See {\@link DecimalPipe} for more details.
 *
 * \@stable
 * @param {?} value
 * @param {?} locale
 * @param {?} currency
 * @param {?=} currencyCode
 * @param {?=} digitsInfo
 * @return {?}
 */
export function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
    const /** @type {?} */ format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
    const /** @type {?} */ pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    pattern.minFrac = getNumberOfCurrencyDigits(/** @type {?} */ ((currencyCode)));
    pattern.maxFrac = pattern.minFrac;
    const /** @type {?} */ res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
    return res
        .replace(CURRENCY_CHAR, currency)
        .replace(CURRENCY_CHAR, '');
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * Where:
 * - `value` is a number.
 * - `locale` is a `string` defining the locale to use.
 * - `digitInfo` See {\@link DecimalPipe} for more details.
 *
 * \@stable
 * @param {?} value
 * @param {?} locale
 * @param {?=} digitsInfo
 * @return {?}
 */
export function formatPercent(value, locale, digitsInfo) {
    const /** @type {?} */ format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
    const /** @type {?} */ pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    const /** @type {?} */ res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
    return res.replace(new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the locale.
 *
 * Where:
 * - `value` is a number.
 * - `locale` is a `string` defining the locale to use.
 * - `digitInfo` See {\@link DecimalPipe} for more details.
 *
 * \@stable
 * @param {?} value
 * @param {?} locale
 * @param {?=} digitsInfo
 * @return {?}
 */
export function formatNumber(value, locale, digitsInfo) {
    const /** @type {?} */ format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
    const /** @type {?} */ pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
/**
 * @record
 */
function ParsedNumberFormat() { }
function ParsedNumberFormat_tsickle_Closure_declarations() {
    /** @type {?} */
    ParsedNumberFormat.prototype.minInt;
    /** @type {?} */
    ParsedNumberFormat.prototype.minFrac;
    /** @type {?} */
    ParsedNumberFormat.prototype.maxFrac;
    /** @type {?} */
    ParsedNumberFormat.prototype.posPre;
    /** @type {?} */
    ParsedNumberFormat.prototype.posSuf;
    /** @type {?} */
    ParsedNumberFormat.prototype.negPre;
    /** @type {?} */
    ParsedNumberFormat.prototype.negSuf;
    /** @type {?} */
    ParsedNumberFormat.prototype.gSize;
    /** @type {?} */
    ParsedNumberFormat.prototype.lgSize;
}
/**
 * @param {?} format
 * @param {?=} minusSign
 * @return {?}
 */
function parseNumberFormat(format, minusSign = '-') {
    const /** @type {?} */ p = {
        minInt: 1,
        minFrac: 0,
        maxFrac: 0,
        posPre: '',
        posSuf: '',
        negPre: '',
        negSuf: '',
        gSize: 0,
        lgSize: 0
    };
    const /** @type {?} */ patternParts = format.split(PATTERN_SEP);
    const /** @type {?} */ positive = patternParts[0];
    const /** @type {?} */ negative = patternParts[1];
    const /** @type {?} */ positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ?
        positive.split(DECIMAL_SEP) :
        [
            positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1),
            positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)
        ], /** @type {?} */
    integer = positiveParts[0], /** @type {?} */ fraction = positiveParts[1] || '';
    p.posPre = integer.substr(0, integer.indexOf(DIGIT_CHAR));
    for (let /** @type {?} */ i = 0; i < fraction.length; i++) {
        const /** @type {?} */ ch = fraction.charAt(i);
        if (ch === ZERO_CHAR) {
            p.minFrac = p.maxFrac = i + 1;
        }
        else if (ch === DIGIT_CHAR) {
            p.maxFrac = i + 1;
        }
        else {
            p.posSuf += ch;
        }
    }
    const /** @type {?} */ groups = integer.split(GROUP_SEP);
    p.gSize = groups[1] ? groups[1].length : 0;
    p.lgSize = (groups[2] || groups[1]) ? (groups[2] || groups[1]).length : 0;
    if (negative) {
        const /** @type {?} */ trunkLen = positive.length - p.posPre.length - p.posSuf.length, /** @type {?} */
        pos = negative.indexOf(DIGIT_CHAR);
        p.negPre = negative.substr(0, pos).replace(/'/g, '');
        p.negSuf = negative.substr(pos + trunkLen).replace(/'/g, '');
    }
    else {
        p.negPre = minusSign + p.posPre;
        p.negSuf = p.posSuf;
    }
    return p;
}
/**
 * @record
 */
function ParsedNumber() { }
function ParsedNumber_tsickle_Closure_declarations() {
    /** @type {?} */
    ParsedNumber.prototype.digits;
    /** @type {?} */
    ParsedNumber.prototype.exponent;
    /** @type {?} */
    ParsedNumber.prototype.integerLen;
}
/**
 * @param {?} parsedNumber
 * @return {?}
 */
function toPercent(parsedNumber) {
    // if the number is 0, don't do anything
    if (parsedNumber.digits[0] === 0) {
        return parsedNumber;
    }
    // Getting the current number of decimals
    const /** @type {?} */ fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
    if (parsedNumber.exponent) {
        parsedNumber.exponent += 2;
    }
    else {
        if (fractionLen === 0) {
            parsedNumber.digits.push(0, 0);
        }
        else if (fractionLen === 1) {
            parsedNumber.digits.push(0);
        }
        parsedNumber.integerLen += 2;
    }
    return parsedNumber;
}
/**
 * Parses a number.
 * Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/
 * @param {?} num
 * @return {?}
 */
function parseNumber(num) {
    let /** @type {?} */ numStr = Math.abs(num) + '';
    let /** @type {?} */ exponent = 0, /** @type {?} */ digits, /** @type {?} */ integerLen;
    let /** @type {?} */ i, /** @type {?} */ j, /** @type {?} */ zeros;
    // Decimal point?
    if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
        numStr = numStr.replace(DECIMAL_SEP, '');
    }
    // Exponential form?
    if ((i = numStr.search(/e/i)) > 0) {
        // Work out the exponent.
        if (integerLen < 0)
            integerLen = i;
        integerLen += +numStr.slice(i + 1);
        numStr = numStr.substring(0, i);
    }
    else if (integerLen < 0) {
        // There was no decimal point or exponent so it is an integer.
        integerLen = numStr.length;
    }
    // Count the number of leading zeros.
    for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) {
        /* empty */
    }
    if (i === (zeros = numStr.length)) {
        // The digits are all zero.
        digits = [0];
        integerLen = 1;
    }
    else {
        // Count the number of trailing zeros
        zeros--;
        while (numStr.charAt(zeros) === ZERO_CHAR)
            zeros--;
        // Trailing zeros are insignificant so ignore them
        integerLen -= i;
        digits = [];
        // Convert string to array of digits without leading/trailing zeros.
        for (j = 0; i <= zeros; i++, j++) {
            digits[j] = Number(numStr.charAt(i));
        }
    }
    // If the number overflows the maximum allowed digits then use an exponent.
    if (integerLen > MAX_DIGITS) {
        digits = digits.splice(0, MAX_DIGITS - 1);
        exponent = integerLen - 1;
        integerLen = 1;
    }
    return { digits, exponent, integerLen };
}
/**
 * Round the parsed number to the specified number of decimal places
 * This function changes the parsedNumber in-place
 * @param {?} parsedNumber
 * @param {?} minFrac
 * @param {?} maxFrac
 * @return {?}
 */
function roundNumber(parsedNumber, minFrac, maxFrac) {
    if (minFrac > maxFrac) {
        throw new Error(`The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
    }
    let /** @type {?} */ digits = parsedNumber.digits;
    let /** @type {?} */ fractionLen = digits.length - parsedNumber.integerLen;
    const /** @type {?} */ fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
    // The index of the digit to where rounding is to occur
    let /** @type {?} */ roundAt = fractionSize + parsedNumber.integerLen;
    let /** @type {?} */ digit = digits[roundAt];
    if (roundAt > 0) {
        // Drop fractional digits beyond `roundAt`
        digits.splice(Math.max(parsedNumber.integerLen, roundAt));
        // Set non-fractional digits beyond `roundAt` to 0
        for (let /** @type {?} */ j = roundAt; j < digits.length; j++) {
            digits[j] = 0;
        }
    }
    else {
        // We rounded to zero so reset the parsedNumber
        fractionLen = Math.max(0, fractionLen);
        parsedNumber.integerLen = 1;
        digits.length = Math.max(1, roundAt = fractionSize + 1);
        digits[0] = 0;
        for (let /** @type {?} */ i = 1; i < roundAt; i++)
            digits[i] = 0;
    }
    if (digit >= 5) {
        if (roundAt - 1 < 0) {
            for (let /** @type {?} */ k = 0; k > roundAt; k--) {
                digits.unshift(0);
                parsedNumber.integerLen++;
            }
            digits.unshift(1);
            parsedNumber.integerLen++;
        }
        else {
            digits[roundAt - 1]++;
        }
    }
    // Pad out with zeros to get the required fraction length
    for (; fractionLen < Math.max(0, fractionSize); fractionLen++)
        digits.push(0);
    let /** @type {?} */ dropTrailingZeros = fractionSize !== 0;
    // Minimal length = nb of decimals required + current nb of integers
    // Any number besides that is optional and can be removed if it's a trailing 0
    const /** @type {?} */ minLen = minFrac + parsedNumber.integerLen;
    // Do any carrying, e.g. a digit was rounded up to 10
    const /** @type {?} */ carry = digits.reduceRight(function (carry, d, i, digits) {
        d = d + carry;
        digits[i] = d < 10 ? d : d - 10; // d % 10
        if (dropTrailingZeros) {
            // Do not keep meaningless fractional trailing zeros (e.g. 15.52000 --> 15.52)
            if (digits[i] === 0 && i >= minLen) {
                digits.pop();
            }
            else {
                dropTrailingZeros = false;
            }
        }
        return d >= 10 ? 1 : 0; // Math.floor(d / 10);
    }, 0);
    if (carry) {
        digits.unshift(carry);
        parsedNumber.integerLen++;
    }
}
/**
 * @param {?} text
 * @return {?}
 */
export function parseIntAutoRadix(text) {
    const /** @type {?} */ result = parseInt(text);
    if (isNaN(result)) {
        throw new Error('Invalid integer literal when parsing ' + text);
    }
    return result;
}
//# sourceMappingURL=format_number.js.map