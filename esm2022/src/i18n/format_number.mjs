/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getLocaleNumberFormat, getLocaleNumberSymbol, getNumberOfCurrencyDigits, NumberFormatStyle, NumberSymbol } from './locale_data_api';
export const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const MAX_DIGITS = 22;
const DECIMAL_SEP = '.';
const ZERO_CHAR = '0';
const PATTERN_SEP = ';';
const GROUP_SEP = ',';
const DIGIT_CHAR = '#';
const CURRENCY_CHAR = '¤';
const PERCENT_CHAR = '%';
/**
 * Transforms a number to a locale string based on a style and a format.
 */
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent = false) {
    let formattedText = '';
    let isZero = false;
    if (!isFinite(value)) {
        formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
    }
    else {
        let parsedNumber = parseNumber(value);
        if (isPercent) {
            parsedNumber = toPercent(parsedNumber);
        }
        let minInt = pattern.minInt;
        let minFraction = pattern.minFrac;
        let maxFraction = pattern.maxFrac;
        if (digitsInfo) {
            const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
            if (parts === null) {
                throw new Error(`${digitsInfo} is not a valid digit info`);
            }
            const minIntPart = parts[1];
            const minFractionPart = parts[3];
            const maxFractionPart = parts[5];
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
        let digits = parsedNumber.digits;
        let integerLen = parsedNumber.integerLen;
        const exponent = parsedNumber.exponent;
        let decimals = [];
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
        const groups = [];
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
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param currency A string containing the currency symbol or its name,
 * such as "$" or "Canadian Dollar". Used in output string, but does not affect the operation
 * of the function.
 * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
 * currency code, such as `USD` for the US dollar and `EUR` for the euro.
 * Used to determine the number of digits in the decimal part.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted currency value.
 *
 * @see {@link formatNumber}
 * @see {@link DecimalPipe}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    pattern.minFrac = getNumberOfCurrencyDigits(currencyCode);
    pattern.maxFrac = pattern.minFrac;
    const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
    return res
        .replace(CURRENCY_CHAR, currency)
        // if we have 2 time the currency character, the second one is ignored
        .replace(CURRENCY_CHAR, '')
        // If there is a spacing between currency character and the value and
        // the currency character is suppressed by passing an empty string, the
        // spacing character would remain as part of the string. Then we
        // should remove it.
        .trim();
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted percentage value.
 *
 * @see {@link formatNumber}
 * @see {@link DecimalPipe}
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 * @publicApi
 *
 */
export function formatPercent(value, locale, digitsInfo) {
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
    return res.replace(new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as text, with group sizing, separator, and other
 * parameters based on the locale.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitsInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted text string.
 * @see [Internationalization (i18n) Guide](/guide/i18n-overview)
 *
 * @publicApi
 */
export function formatNumber(value, locale, digitsInfo) {
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
function parseNumberFormat(format, minusSign = '-') {
    const p = {
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
    const patternParts = format.split(PATTERN_SEP);
    const positive = patternParts[0];
    const negative = patternParts[1];
    const positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ?
        positive.split(DECIMAL_SEP) :
        [
            positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1),
            positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)
        ], integer = positiveParts[0], fraction = positiveParts[1] || '';
    p.posPre = integer.substring(0, integer.indexOf(DIGIT_CHAR));
    for (let i = 0; i < fraction.length; i++) {
        const ch = fraction.charAt(i);
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
    const groups = integer.split(GROUP_SEP);
    p.gSize = groups[1] ? groups[1].length : 0;
    p.lgSize = (groups[2] || groups[1]) ? (groups[2] || groups[1]).length : 0;
    if (negative) {
        const trunkLen = positive.length - p.posPre.length - p.posSuf.length, pos = negative.indexOf(DIGIT_CHAR);
        p.negPre = negative.substring(0, pos).replace(/'/g, '');
        p.negSuf = negative.slice(pos + trunkLen).replace(/'/g, '');
    }
    else {
        p.negPre = minusSign + p.posPre;
        p.negSuf = p.posSuf;
    }
    return p;
}
// Transforms a parsed number into a percentage by multiplying it by 100
function toPercent(parsedNumber) {
    // if the number is 0, don't do anything
    if (parsedNumber.digits[0] === 0) {
        return parsedNumber;
    }
    // Getting the current number of decimals
    const fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
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
 */
function parseNumber(num) {
    let numStr = Math.abs(num) + '';
    let exponent = 0, digits, integerLen;
    let i, j, zeros;
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
    for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) { /* empty */
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
 */
function roundNumber(parsedNumber, minFrac, maxFrac) {
    if (minFrac > maxFrac) {
        throw new Error(`The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
    }
    let digits = parsedNumber.digits;
    let fractionLen = digits.length - parsedNumber.integerLen;
    const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
    // The index of the digit to where rounding is to occur
    let roundAt = fractionSize + parsedNumber.integerLen;
    let digit = digits[roundAt];
    if (roundAt > 0) {
        // Drop fractional digits beyond `roundAt`
        digits.splice(Math.max(parsedNumber.integerLen, roundAt));
        // Set non-fractional digits beyond `roundAt` to 0
        for (let j = roundAt; j < digits.length; j++) {
            digits[j] = 0;
        }
    }
    else {
        // We rounded to zero so reset the parsedNumber
        fractionLen = Math.max(0, fractionLen);
        parsedNumber.integerLen = 1;
        digits.length = Math.max(1, roundAt = fractionSize + 1);
        digits[0] = 0;
        for (let i = 1; i < roundAt; i++)
            digits[i] = 0;
    }
    if (digit >= 5) {
        if (roundAt - 1 < 0) {
            for (let k = 0; k > roundAt; k--) {
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
    let dropTrailingZeros = fractionSize !== 0;
    // Minimal length = nb of decimals required + current nb of integers
    // Any number besides that is optional and can be removed if it's a trailing 0
    const minLen = minFrac + parsedNumber.integerLen;
    // Do any carrying, e.g. a digit was rounded up to 10
    const carry = digits.reduceRight(function (carry, d, i, digits) {
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
export function parseIntAutoRadix(text) {
    const result = parseInt(text);
    if (isNaN(result)) {
        throw new Error('Invalid integer literal when parsing ' + text);
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X251bWJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvaTE4bi9mb3JtYXRfbnVtYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSx5QkFBeUIsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUUzSSxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyw2QkFBNkIsQ0FBQztBQUNsRSxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUN0QixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDeEIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUN2QixNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7QUFDMUIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBRXpCOztHQUVHO0FBQ0gsU0FBUywwQkFBMEIsQ0FDL0IsS0FBYSxFQUFFLE9BQTJCLEVBQUUsTUFBYyxFQUFFLFdBQXlCLEVBQ3JGLGFBQTJCLEVBQUUsVUFBbUIsRUFBRSxTQUFTLEdBQUcsS0FBSztJQUNyRSxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDdkIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBRW5CLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQixhQUFhLEdBQUcscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2RSxDQUFDO1NBQU0sQ0FBQztRQUNOLElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMs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SSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3RCLDhFQUE4RTtZQUM5RSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNuQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDZixDQUFDO2lCQUFNLENBQUM7Z0JBQ04saUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLHNCQUFzQjtJQUNqRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDTixJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDNUIsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsSUFBWTtJQUM1QyxNQUFNLE1BQU0sR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2V0TG9jYWxlTnVtYmVyRm9ybWF0LCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMsIE51bWJlckZvcm1hdFN0eWxlLCBOdW1iZXJTeW1ib2x9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuZXhwb3J0IGNvbnN0IE5VTUJFUl9GT1JNQVRfUkVHRVhQID0gL14oXFxkKyk/XFwuKChcXGQrKSgtKFxcZCspKT8pPyQvO1xuY29uc3QgTUFYX0RJR0lUUyA9IDIyO1xuY29uc3QgREVDSU1BTF9TRVAgPSAnLic7XG5jb25zdCBaRVJPX0NIQVIgPSAnMCc7XG5jb25zdCBQQVRURVJOX1NFUCA9ICc7JztcbmNvbnN0IEdST1VQX1NFUCA9ICcsJztcbmNvbnN0IERJR0lUX0NIQVIgPSAnIyc7XG5jb25zdCBDVVJSRU5DWV9DSEFSID0gJ8KkJztcbmNvbnN0IFBFUkNFTlRfQ0hBUiA9ICclJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgbnVtYmVyIHRvIGEgbG9jYWxlIHN0cmluZyBiYXNlZCBvbiBhIHN0eWxlIGFuZCBhIGZvcm1hdC5cbiAqL1xuZnVuY3Rpb24gZm9ybWF0TnVtYmVyVG9Mb2NhbGVTdHJpbmcoXG4gICAgdmFsdWU6IG51bWJlciwgcGF0dGVybjogUGFyc2VkTnVtYmVyRm9ybWF0LCBsb2NhbGU6IHN0cmluZywgZ3JvdXBTeW1ib2w6IE51bWJlclN5bWJvbCxcbiAgICBkZWNpbWFsU3ltYm9sOiBOdW1iZXJTeW1ib2wsIGRpZ2l0c0luZm8/OiBzdHJpbmcsIGlzUGVyY2VudCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgbGV0IGZvcm1hdHRlZFRleHQgPSAnJztcbiAgbGV0IGlzWmVybyA9IGZhbHNlO1xuXG4gIGlmICghaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgZm9ybWF0dGVkVGV4dCA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5JbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHBhcnNlZE51bWJlciA9IHBhcnNlTnVtYmVyKHZhbHVlKTtcblxuICAgIGlmIChpc1BlcmNlbnQpIHtcbiAgICAgIHBhcnNlZE51bWJlciA9IHRvUGVyY2VudChwYXJzZWROdW1iZXIpO1xuICAgIH1cblxuICAgIGxldCBtaW5JbnQgPSBwYXR0ZXJuLm1pbkludDtcbiAgICBsZXQgbWluRnJhY3Rpb24gPSBwYXR0ZXJuLm1pbkZyYWM7XG4gICAgbGV0IG1heEZyYWN0aW9uID0gcGF0dGVybi5tYXhGcmFjO1xuXG4gICAgaWYgKGRpZ2l0c0luZm8pIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gZGlnaXRzSW5mby5tYXRjaChOVU1CRVJfRk9STUFUX1JFR0VYUCk7XG4gICAgICBpZiAocGFydHMgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpZ2l0c0luZm99IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm9gKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1pbkludFBhcnQgPSBwYXJ0c1sxXTtcbiAgICAgIGNvbnN0IG1pbkZyYWN0aW9uUGFydCA9IHBhcnRzWzNdO1xuICAgICAgY29uc3QgbWF4RnJhY3Rpb25QYXJ0ID0gcGFydHNbNV07XG4gICAgICBpZiAobWluSW50UGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkludCA9IHBhcnNlSW50QXV0b1JhZGl4KG1pbkludFBhcnQpO1xuICAgICAgfVxuICAgICAgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgobWluRnJhY3Rpb25QYXJ0KTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhGcmFjdGlvblBhcnQgIT0gbnVsbCkge1xuICAgICAgICBtYXhGcmFjdGlvbiA9IHBhcnNlSW50QXV0b1JhZGl4KG1heEZyYWN0aW9uUGFydCk7XG4gICAgICB9IGVsc2UgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsICYmIG1pbkZyYWN0aW9uID4gbWF4RnJhY3Rpb24pIHtcbiAgICAgICAgbWF4RnJhY3Rpb24gPSBtaW5GcmFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByb3VuZE51bWJlcihwYXJzZWROdW1iZXIsIG1pbkZyYWN0aW9uLCBtYXhGcmFjdGlvbik7XG5cbiAgICBsZXQgZGlnaXRzID0gcGFyc2VkTnVtYmVyLmRpZ2l0cztcbiAgICBsZXQgaW50ZWdlckxlbiA9IHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICAgIGNvbnN0IGV4cG9uZW50ID0gcGFyc2VkTnVtYmVyLmV4cG9uZW50O1xuICAgIGxldCBkZWNpbWFscyA9IFtdO1xuICAgIGlzWmVybyA9IGRpZ2l0cy5ldmVyeShkID0+ICFkKTtcblxuICAgIC8vIHBhZCB6ZXJvcyBmb3Igc21hbGwgbnVtYmVyc1xuICAgIGZvciAoOyBpbnRlZ2VyTGVuIDwgbWluSW50OyBpbnRlZ2VyTGVuKyspIHtcbiAgICAgIGRpZ2l0cy51bnNoaWZ0KDApO1xuICAgIH1cblxuICAgIC8vIHBhZCB6ZXJvcyBmb3Igc21hbGwgbnVtYmVyc1xuICAgIGZvciAoOyBpbnRlZ2VyTGVuIDwgMDsgaW50ZWdlckxlbisrKSB7XG4gICAgICBkaWdpdHMudW5zaGlmdCgwKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IGRlY2ltYWxzIGRpZ2l0c1xuICAgIGlmIChpbnRlZ2VyTGVuID4gMCkge1xuICAgICAgZGVjaW1hbHMgPSBkaWdpdHMuc3BsaWNlKGludGVnZXJMZW4sIGRpZ2l0cy5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWNpbWFscyA9IGRpZ2l0cztcbiAgICAgIGRpZ2l0cyA9IFswXTtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXQgdGhlIGludGVnZXIgZGlnaXRzIHdpdGggZ3JvdXBpbmcgc2VwYXJhdG9yc1xuICAgIGNvbnN0IGdyb3VwcyA9IFtdO1xuICAgIGlmIChkaWdpdHMubGVuZ3RoID49IHBhdHRlcm4ubGdTaXplKSB7XG4gICAgICBncm91cHMudW5zaGlmdChkaWdpdHMuc3BsaWNlKC1wYXR0ZXJuLmxnU2l6ZSwgZGlnaXRzLmxlbmd0aCkuam9pbignJykpO1xuICAgIH1cblxuICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoID4gcGF0dGVybi5nU2l6ZSkge1xuICAgICAgZ3JvdXBzLnVuc2hpZnQoZGlnaXRzLnNwbGljZSgtcGF0dGVybi5nU2l6ZSwgZGlnaXRzLmxlbmd0aCkuam9pbignJykpO1xuICAgIH1cblxuICAgIGlmIChkaWdpdHMubGVuZ3RoKSB7XG4gICAgICBncm91cHMudW5zaGlmdChkaWdpdHMuam9pbignJykpO1xuICAgIH1cblxuICAgIGZvcm1hdHRlZFRleHQgPSBncm91cHMuam9pbihnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBncm91cFN5bWJvbCkpO1xuXG4gICAgLy8gYXBwZW5kIHRoZSBkZWNpbWFsIGRpZ2l0c1xuICAgIGlmIChkZWNpbWFscy5sZW5ndGgpIHtcbiAgICAgIGZvcm1hdHRlZFRleHQgKz0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgZGVjaW1hbFN5bWJvbCkgKyBkZWNpbWFscy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBpZiAoZXhwb25lbnQpIHtcbiAgICAgIGZvcm1hdHRlZFRleHQgKz0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLkV4cG9uZW50aWFsKSArICcrJyArIGV4cG9uZW50O1xuICAgIH1cbiAgfVxuXG4gIGlmICh2YWx1ZSA8IDAgJiYgIWlzWmVybykge1xuICAgIGZvcm1hdHRlZFRleHQgPSBwYXR0ZXJuLm5lZ1ByZSArIGZvcm1hdHRlZFRleHQgKyBwYXR0ZXJuLm5lZ1N1ZjtcbiAgfSBlbHNlIHtcbiAgICBmb3JtYXR0ZWRUZXh0ID0gcGF0dGVybi5wb3NQcmUgKyBmb3JtYXR0ZWRUZXh0ICsgcGF0dGVybi5wb3NTdWY7XG4gIH1cblxuICByZXR1cm4gZm9ybWF0dGVkVGV4dDtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGN1cnJlbmN5IHVzaW5nIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIG51bWJlciB0byBmb3JtYXQuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBjdXJyZW5jeSBBIHN0cmluZyBjb250YWluaW5nIHRoZSBjdXJyZW5jeSBzeW1ib2wgb3IgaXRzIG5hbWUsXG4gKiBzdWNoIGFzIFwiJFwiIG9yIFwiQ2FuYWRpYW4gRG9sbGFyXCIuIFVzZWQgaW4gb3V0cHV0IHN0cmluZywgYnV0IGRvZXMgbm90IGFmZmVjdCB0aGUgb3BlcmF0aW9uXG4gKiBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0gY3VycmVuY3lDb2RlIFRoZSBbSVNPIDQyMTddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT180MjE3KVxuICogY3VycmVuY3kgY29kZSwgc3VjaCBhcyBgVVNEYCBmb3IgdGhlIFVTIGRvbGxhciBhbmQgYEVVUmAgZm9yIHRoZSBldXJvLlxuICogVXNlZCB0byBkZXRlcm1pbmUgdGhlIG51bWJlciBvZiBkaWdpdHMgaW4gdGhlIGRlY2ltYWwgcGFydC5cbiAqIEBwYXJhbSBkaWdpdHNJbmZvIERlY2ltYWwgcmVwcmVzZW50YXRpb24gb3B0aW9ucywgc3BlY2lmaWVkIGJ5IGEgc3RyaW5nIGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICogYHttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c31gLiBTZWUgYERlY2ltYWxQaXBlYCBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgY3VycmVuY3kgdmFsdWUuXG4gKlxuICogQHNlZSB7QGxpbmsgZm9ybWF0TnVtYmVyfVxuICogQHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEN1cnJlbmN5KFxuICAgIHZhbHVlOiBudW1iZXIsIGxvY2FsZTogc3RyaW5nLCBjdXJyZW5jeTogc3RyaW5nLCBjdXJyZW5jeUNvZGU/OiBzdHJpbmcsXG4gICAgZGlnaXRzSW5mbz86IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGZvcm1hdCA9IGdldExvY2FsZU51bWJlckZvcm1hdChsb2NhbGUsIE51bWJlckZvcm1hdFN0eWxlLkN1cnJlbmN5KTtcbiAgY29uc3QgcGF0dGVybiA9IHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuXG4gIHBhdHRlcm4ubWluRnJhYyA9IGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMoY3VycmVuY3lDb2RlISk7XG4gIHBhdHRlcm4ubWF4RnJhYyA9IHBhdHRlcm4ubWluRnJhYztcblxuICBjb25zdCByZXMgPSBmb3JtYXROdW1iZXJUb0xvY2FsZVN0cmluZyhcbiAgICAgIHZhbHVlLCBwYXR0ZXJuLCBsb2NhbGUsIE51bWJlclN5bWJvbC5DdXJyZW5jeUdyb3VwLCBOdW1iZXJTeW1ib2wuQ3VycmVuY3lEZWNpbWFsLCBkaWdpdHNJbmZvKTtcbiAgcmV0dXJuIHJlc1xuICAgICAgLnJlcGxhY2UoQ1VSUkVOQ1lfQ0hBUiwgY3VycmVuY3kpXG4gICAgICAvLyBpZiB3ZSBoYXZlIDIgdGltZSB0aGUgY3VycmVuY3kgY2hhcmFjdGVyLCB0aGUgc2Vjb25kIG9uZSBpcyBpZ25vcmVkXG4gICAgICAucmVwbGFjZShDVVJSRU5DWV9DSEFSLCAnJylcbiAgICAgIC8vIElmIHRoZXJlIGlzIGEgc3BhY2luZyBiZXR3ZWVuIGN1cnJlbmN5IGNoYXJhY3RlciBhbmQgdGhlIHZhbHVlIGFuZFxuICAgICAgLy8gdGhlIGN1cnJlbmN5IGNoYXJhY3RlciBpcyBzdXBwcmVzc2VkIGJ5IHBhc3NpbmcgYW4gZW1wdHkgc3RyaW5nLCB0aGVcbiAgICAgIC8vIHNwYWNpbmcgY2hhcmFjdGVyIHdvdWxkIHJlbWFpbiBhcyBwYXJ0IG9mIHRoZSBzdHJpbmcuIFRoZW4gd2VcbiAgICAgIC8vIHNob3VsZCByZW1vdmUgaXQuXG4gICAgICAudHJpbSgpO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgYSBwZXJjZW50YWdlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSBudW1iZXIgdG8gZm9ybWF0LlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZGlnaXRzSW5mbyBEZWNpbWFsIHJlcHJlc2VudGF0aW9uIG9wdGlvbnMsIHNwZWNpZmllZCBieSBhIHN0cmluZyBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqIGB7bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9YC4gU2VlIGBEZWNpbWFsUGlwZWAgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIHBlcmNlbnRhZ2UgdmFsdWUuXG4gKlxuICogQHNlZSB7QGxpbmsgZm9ybWF0TnVtYmVyfVxuICogQHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICogQHB1YmxpY0FwaVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFBlcmNlbnQodmFsdWU6IG51bWJlciwgbG9jYWxlOiBzdHJpbmcsIGRpZ2l0c0luZm8/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBmb3JtYXQgPSBnZXRMb2NhbGVOdW1iZXJGb3JtYXQobG9jYWxlLCBOdW1iZXJGb3JtYXRTdHlsZS5QZXJjZW50KTtcbiAgY29uc3QgcGF0dGVybiA9IHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuICBjb25zdCByZXMgPSBmb3JtYXROdW1iZXJUb0xvY2FsZVN0cmluZyhcbiAgICAgIHZhbHVlLCBwYXR0ZXJuLCBsb2NhbGUsIE51bWJlclN5bWJvbC5Hcm91cCwgTnVtYmVyU3ltYm9sLkRlY2ltYWwsIGRpZ2l0c0luZm8sIHRydWUpO1xuICByZXR1cm4gcmVzLnJlcGxhY2UoXG4gICAgICBuZXcgUmVnRXhwKFBFUkNFTlRfQ0hBUiwgJ2cnKSwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLlBlcmNlbnRTaWduKSk7XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyB0ZXh0LCB3aXRoIGdyb3VwIHNpemluZywgc2VwYXJhdG9yLCBhbmQgb3RoZXJcbiAqIHBhcmFtZXRlcnMgYmFzZWQgb24gdGhlIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIG51bWJlciB0byBmb3JtYXQuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBkaWdpdHNJbmZvIERlY2ltYWwgcmVwcmVzZW50YXRpb24gb3B0aW9ucywgc3BlY2lmaWVkIGJ5IGEgc3RyaW5nIGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICogYHttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c31gLiBTZWUgYERlY2ltYWxQaXBlYCBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgdGV4dCBzdHJpbmcuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKC9ndWlkZS9pMThuLW92ZXJ2aWV3KVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdE51bWJlcih2YWx1ZTogbnVtYmVyLCBsb2NhbGU6IHN0cmluZywgZGlnaXRzSW5mbz86IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGZvcm1hdCA9IGdldExvY2FsZU51bWJlckZvcm1hdChsb2NhbGUsIE51bWJlckZvcm1hdFN0eWxlLkRlY2ltYWwpO1xuICBjb25zdCBwYXR0ZXJuID0gcGFyc2VOdW1iZXJGb3JtYXQoZm9ybWF0LCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSk7XG4gIHJldHVybiBmb3JtYXROdW1iZXJUb0xvY2FsZVN0cmluZyhcbiAgICAgIHZhbHVlLCBwYXR0ZXJuLCBsb2NhbGUsIE51bWJlclN5bWJvbC5Hcm91cCwgTnVtYmVyU3ltYm9sLkRlY2ltYWwsIGRpZ2l0c0luZm8pO1xufVxuXG5pbnRlcmZhY2UgUGFyc2VkTnVtYmVyRm9ybWF0IHtcbiAgbWluSW50OiBudW1iZXI7XG4gIC8vIHRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgcmVxdWlyZWQgaW4gdGhlIGZyYWN0aW9uIHBhcnQgb2YgdGhlIG51bWJlclxuICBtaW5GcmFjOiBudW1iZXI7XG4gIC8vIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgcmVxdWlyZWQgaW4gdGhlIGZyYWN0aW9uIHBhcnQgb2YgdGhlIG51bWJlclxuICBtYXhGcmFjOiBudW1iZXI7XG4gIC8vIHRoZSBwcmVmaXggZm9yIGEgcG9zaXRpdmUgbnVtYmVyXG4gIHBvc1ByZTogc3RyaW5nO1xuICAvLyB0aGUgc3VmZml4IGZvciBhIHBvc2l0aXZlIG51bWJlclxuICBwb3NTdWY6IHN0cmluZztcbiAgLy8gdGhlIHByZWZpeCBmb3IgYSBuZWdhdGl2ZSBudW1iZXIgKGUuZy4gYC1gIG9yIGAoYCkpXG4gIG5lZ1ByZTogc3RyaW5nO1xuICAvLyB0aGUgc3VmZml4IGZvciBhIG5lZ2F0aXZlIG51bWJlciAoZS5nLiBgKWApXG4gIG5lZ1N1Zjogc3RyaW5nO1xuICAvLyBudW1iZXIgb2YgZGlnaXRzIGluIGVhY2ggZ3JvdXAgb2Ygc2VwYXJhdGVkIGRpZ2l0c1xuICBnU2l6ZTogbnVtYmVyO1xuICAvLyBudW1iZXIgb2YgZGlnaXRzIGluIHRoZSBsYXN0IGdyb3VwIG9mIGRpZ2l0cyBiZWZvcmUgdGhlIGRlY2ltYWwgc2VwYXJhdG9yXG4gIGxnU2l6ZTogbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBwYXJzZU51bWJlckZvcm1hdChmb3JtYXQ6IHN0cmluZywgbWludXNTaWduID0gJy0nKTogUGFyc2VkTnVtYmVyRm9ybWF0IHtcbiAgY29uc3QgcCA9IHtcbiAgICBtaW5JbnQ6IDEsXG4gICAgbWluRnJhYzogMCxcbiAgICBtYXhGcmFjOiAwLFxuICAgIHBvc1ByZTogJycsXG4gICAgcG9zU3VmOiAnJyxcbiAgICBuZWdQcmU6ICcnLFxuICAgIG5lZ1N1ZjogJycsXG4gICAgZ1NpemU6IDAsXG4gICAgbGdTaXplOiAwXG4gIH07XG5cbiAgY29uc3QgcGF0dGVyblBhcnRzID0gZm9ybWF0LnNwbGl0KFBBVFRFUk5fU0VQKTtcbiAgY29uc3QgcG9zaXRpdmUgPSBwYXR0ZXJuUGFydHNbMF07XG4gIGNvbnN0IG5lZ2F0aXZlID0gcGF0dGVyblBhcnRzWzFdO1xuXG4gIGNvbnN0IHBvc2l0aXZlUGFydHMgPSBwb3NpdGl2ZS5pbmRleE9mKERFQ0lNQUxfU0VQKSAhPT0gLTEgP1xuICAgICAgcG9zaXRpdmUuc3BsaXQoREVDSU1BTF9TRVApIDpcbiAgICAgIFtcbiAgICAgICAgcG9zaXRpdmUuc3Vic3RyaW5nKDAsIHBvc2l0aXZlLmxhc3RJbmRleE9mKFpFUk9fQ0hBUikgKyAxKSxcbiAgICAgICAgcG9zaXRpdmUuc3Vic3RyaW5nKHBvc2l0aXZlLmxhc3RJbmRleE9mKFpFUk9fQ0hBUikgKyAxKVxuICAgICAgXSxcbiAgICAgICAgaW50ZWdlciA9IHBvc2l0aXZlUGFydHNbMF0sIGZyYWN0aW9uID0gcG9zaXRpdmVQYXJ0c1sxXSB8fCAnJztcblxuICBwLnBvc1ByZSA9IGludGVnZXIuc3Vic3RyaW5nKDAsIGludGVnZXIuaW5kZXhPZihESUdJVF9DSEFSKSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoID0gZnJhY3Rpb24uY2hhckF0KGkpO1xuICAgIGlmIChjaCA9PT0gWkVST19DSEFSKSB7XG4gICAgICBwLm1pbkZyYWMgPSBwLm1heEZyYWMgPSBpICsgMTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSBESUdJVF9DSEFSKSB7XG4gICAgICBwLm1heEZyYWMgPSBpICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcC5wb3NTdWYgKz0gY2g7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZ3JvdXBzID0gaW50ZWdlci5zcGxpdChHUk9VUF9TRVApO1xuICBwLmdTaXplID0gZ3JvdXBzWzFdID8gZ3JvdXBzWzFdLmxlbmd0aCA6IDA7XG4gIHAubGdTaXplID0gKGdyb3Vwc1syXSB8fCBncm91cHNbMV0pID8gKGdyb3Vwc1syXSB8fCBncm91cHNbMV0pLmxlbmd0aCA6IDA7XG5cbiAgaWYgKG5lZ2F0aXZlKSB7XG4gICAgY29uc3QgdHJ1bmtMZW4gPSBwb3NpdGl2ZS5sZW5ndGggLSBwLnBvc1ByZS5sZW5ndGggLSBwLnBvc1N1Zi5sZW5ndGgsXG4gICAgICAgICAgcG9zID0gbmVnYXRpdmUuaW5kZXhPZihESUdJVF9DSEFSKTtcblxuICAgIHAubmVnUHJlID0gbmVnYXRpdmUuc3Vic3RyaW5nKDAsIHBvcykucmVwbGFjZSgvJy9nLCAnJyk7XG4gICAgcC5uZWdTdWYgPSBuZWdhdGl2ZS5zbGljZShwb3MgKyB0cnVua0xlbikucmVwbGFjZSgvJy9nLCAnJyk7XG4gIH0gZWxzZSB7XG4gICAgcC5uZWdQcmUgPSBtaW51c1NpZ24gKyBwLnBvc1ByZTtcbiAgICBwLm5lZ1N1ZiA9IHAucG9zU3VmO1xuICB9XG5cbiAgcmV0dXJuIHA7XG59XG5cbmludGVyZmFjZSBQYXJzZWROdW1iZXIge1xuICAvLyBhbiBhcnJheSBvZiBkaWdpdHMgY29udGFpbmluZyBsZWFkaW5nIHplcm9zIGFzIG5lY2Vzc2FyeVxuICBkaWdpdHM6IG51bWJlcltdO1xuICAvLyB0aGUgZXhwb25lbnQgZm9yIG51bWJlcnMgdGhhdCB3b3VsZCBuZWVkIG1vcmUgdGhhbiBgTUFYX0RJR0lUU2AgZGlnaXRzIGluIGBkYFxuICBleHBvbmVudDogbnVtYmVyO1xuICAvLyB0aGUgbnVtYmVyIG9mIHRoZSBkaWdpdHMgaW4gYGRgIHRoYXQgYXJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBkZWNpbWFsIHBvaW50XG4gIGludGVnZXJMZW46IG51bWJlcjtcbn1cblxuLy8gVHJhbnNmb3JtcyBhIHBhcnNlZCBudW1iZXIgaW50byBhIHBlcmNlbnRhZ2UgYnkgbXVsdGlwbHlpbmcgaXQgYnkgMTAwXG5mdW5jdGlvbiB0b1BlcmNlbnQocGFyc2VkTnVtYmVyOiBQYXJzZWROdW1iZXIpOiBQYXJzZWROdW1iZXIge1xuICAvLyBpZiB0aGUgbnVtYmVyIGlzIDAsIGRvbid0IGRvIGFueXRoaW5nXG4gIGlmIChwYXJzZWROdW1iZXIuZGlnaXRzWzBdID09PSAwKSB7XG4gICAgcmV0dXJuIHBhcnNlZE51bWJlcjtcbiAgfVxuXG4gIC8vIEdldHRpbmcgdGhlIGN1cnJlbnQgbnVtYmVyIG9mIGRlY2ltYWxzXG4gIGNvbnN0IGZyYWN0aW9uTGVuID0gcGFyc2VkTnVtYmVyLmRpZ2l0cy5sZW5ndGggLSBwYXJzZWROdW1iZXIuaW50ZWdlckxlbjtcbiAgaWYgKHBhcnNlZE51bWJlci5leHBvbmVudCkge1xuICAgIHBhcnNlZE51bWJlci5leHBvbmVudCArPSAyO1xuICB9IGVsc2Uge1xuICAgIGlmIChmcmFjdGlvbkxlbiA9PT0gMCkge1xuICAgICAgcGFyc2VkTnVtYmVyLmRpZ2l0cy5wdXNoKDAsIDApO1xuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb25MZW4gPT09IDEpIHtcbiAgICAgIHBhcnNlZE51bWJlci5kaWdpdHMucHVzaCgwKTtcbiAgICB9XG4gICAgcGFyc2VkTnVtYmVyLmludGVnZXJMZW4gKz0gMjtcbiAgfVxuXG4gIHJldHVybiBwYXJzZWROdW1iZXI7XG59XG5cbi8qKlxuICogUGFyc2VzIGEgbnVtYmVyLlxuICogU2lnbmlmaWNhbnQgYml0cyBvZiB0aGlzIHBhcnNlIGFsZ29yaXRobSBjYW1lIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xuICovXG5mdW5jdGlvbiBwYXJzZU51bWJlcihudW06IG51bWJlcik6IFBhcnNlZE51bWJlciB7XG4gIGxldCBudW1TdHIgPSBNYXRoLmFicyhudW0pICsgJyc7XG4gIGxldCBleHBvbmVudCA9IDAsIGRpZ2l0cywgaW50ZWdlckxlbjtcbiAgbGV0IGksIGosIHplcm9zO1xuXG4gIC8vIERlY2ltYWwgcG9pbnQ/XG4gIGlmICgoaW50ZWdlckxlbiA9IG51bVN0ci5pbmRleE9mKERFQ0lNQUxfU0VQKSkgPiAtMSkge1xuICAgIG51bVN0ciA9IG51bVN0ci5yZXBsYWNlKERFQ0lNQUxfU0VQLCAnJyk7XG4gIH1cblxuICAvLyBFeHBvbmVudGlhbCBmb3JtP1xuICBpZiAoKGkgPSBudW1TdHIuc2VhcmNoKC9lL2kpKSA+IDApIHtcbiAgICAvLyBXb3JrIG91dCB0aGUgZXhwb25lbnQuXG4gICAgaWYgKGludGVnZXJMZW4gPCAwKSBpbnRlZ2VyTGVuID0gaTtcbiAgICBpbnRlZ2VyTGVuICs9ICtudW1TdHIuc2xpY2UoaSArIDEpO1xuICAgIG51bVN0ciA9IG51bVN0ci5zdWJzdHJpbmcoMCwgaSk7XG4gIH0gZWxzZSBpZiAoaW50ZWdlckxlbiA8IDApIHtcbiAgICAvLyBUaGVyZSB3YXMgbm8gZGVjaW1hbCBwb2ludCBvciBleHBvbmVudCBzbyBpdCBpcyBhbiBpbnRlZ2VyLlxuICAgIGludGVnZXJMZW4gPSBudW1TdHIubGVuZ3RoO1xuICB9XG5cbiAgLy8gQ291bnQgdGhlIG51bWJlciBvZiBsZWFkaW5nIHplcm9zLlxuICBmb3IgKGkgPSAwOyBudW1TdHIuY2hhckF0KGkpID09PSBaRVJPX0NIQVI7IGkrKykgeyAvKiBlbXB0eSAqL1xuICB9XG5cbiAgaWYgKGkgPT09ICh6ZXJvcyA9IG51bVN0ci5sZW5ndGgpKSB7XG4gICAgLy8gVGhlIGRpZ2l0cyBhcmUgYWxsIHplcm8uXG4gICAgZGlnaXRzID0gWzBdO1xuICAgIGludGVnZXJMZW4gPSAxO1xuICB9IGVsc2Uge1xuICAgIC8vIENvdW50IHRoZSBudW1iZXIgb2YgdHJhaWxpbmcgemVyb3NcbiAgICB6ZXJvcy0tO1xuICAgIHdoaWxlIChudW1TdHIuY2hhckF0KHplcm9zKSA9PT0gWkVST19DSEFSKSB6ZXJvcy0tO1xuXG4gICAgLy8gVHJhaWxpbmcgemVyb3MgYXJlIGluc2lnbmlmaWNhbnQgc28gaWdub3JlIHRoZW1cbiAgICBpbnRlZ2VyTGVuIC09IGk7XG4gICAgZGlnaXRzID0gW107XG4gICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cbiAgICBmb3IgKGogPSAwOyBpIDw9IHplcm9zOyBpKyssIGorKykge1xuICAgICAgZGlnaXRzW2pdID0gTnVtYmVyKG51bVN0ci5jaGFyQXQoaSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBudW1iZXIgb3ZlcmZsb3dzIHRoZSBtYXhpbXVtIGFsbG93ZWQgZGlnaXRzIHRoZW4gdXNlIGFuIGV4cG9uZW50LlxuICBpZiAoaW50ZWdlckxlbiA+IE1BWF9ESUdJVFMpIHtcbiAgICBkaWdpdHMgPSBkaWdpdHMuc3BsaWNlKDAsIE1BWF9ESUdJVFMgLSAxKTtcbiAgICBleHBvbmVudCA9IGludGVnZXJMZW4gLSAxO1xuICAgIGludGVnZXJMZW4gPSAxO1xuICB9XG5cbiAgcmV0dXJuIHtkaWdpdHMsIGV4cG9uZW50LCBpbnRlZ2VyTGVufTtcbn1cblxuLyoqXG4gKiBSb3VuZCB0aGUgcGFyc2VkIG51bWJlciB0byB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlc1xuICogVGhpcyBmdW5jdGlvbiBjaGFuZ2VzIHRoZSBwYXJzZWROdW1iZXIgaW4tcGxhY2VcbiAqL1xuZnVuY3Rpb24gcm91bmROdW1iZXIocGFyc2VkTnVtYmVyOiBQYXJzZWROdW1iZXIsIG1pbkZyYWM6IG51bWJlciwgbWF4RnJhYzogbnVtYmVyKSB7XG4gIGlmIChtaW5GcmFjID4gbWF4RnJhYykge1xuICAgIHRocm93IG5ldyBFcnJvcihgVGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBmcmFjdGlvbiAoJHtcbiAgICAgICAgbWluRnJhY30pIGlzIGhpZ2hlciB0aGFuIHRoZSBtYXhpbXVtICgke21heEZyYWN9KS5gKTtcbiAgfVxuXG4gIGxldCBkaWdpdHMgPSBwYXJzZWROdW1iZXIuZGlnaXRzO1xuICBsZXQgZnJhY3Rpb25MZW4gPSBkaWdpdHMubGVuZ3RoIC0gcGFyc2VkTnVtYmVyLmludGVnZXJMZW47XG4gIGNvbnN0IGZyYWN0aW9uU2l6ZSA9IE1hdGgubWluKE1hdGgubWF4KG1pbkZyYWMsIGZyYWN0aW9uTGVuKSwgbWF4RnJhYyk7XG5cbiAgLy8gVGhlIGluZGV4IG9mIHRoZSBkaWdpdCB0byB3aGVyZSByb3VuZGluZyBpcyB0byBvY2N1clxuICBsZXQgcm91bmRBdCA9IGZyYWN0aW9uU2l6ZSArIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICBsZXQgZGlnaXQgPSBkaWdpdHNbcm91bmRBdF07XG5cbiAgaWYgKHJvdW5kQXQgPiAwKSB7XG4gICAgLy8gRHJvcCBmcmFjdGlvbmFsIGRpZ2l0cyBiZXlvbmQgYHJvdW5kQXRgXG4gICAgZGlnaXRzLnNwbGljZShNYXRoLm1heChwYXJzZWROdW1iZXIuaW50ZWdlckxlbiwgcm91bmRBdCkpO1xuXG4gICAgLy8gU2V0IG5vbi1mcmFjdGlvbmFsIGRpZ2l0cyBiZXlvbmQgYHJvdW5kQXRgIHRvIDBcbiAgICBmb3IgKGxldCBqID0gcm91bmRBdDsgaiA8IGRpZ2l0cy5sZW5ndGg7IGorKykge1xuICAgICAgZGlnaXRzW2pdID0gMDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gV2Ugcm91bmRlZCB0byB6ZXJvIHNvIHJlc2V0IHRoZSBwYXJzZWROdW1iZXJcbiAgICBmcmFjdGlvbkxlbiA9IE1hdGgubWF4KDAsIGZyYWN0aW9uTGVuKTtcbiAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbiA9IDE7XG4gICAgZGlnaXRzLmxlbmd0aCA9IE1hdGgubWF4KDEsIHJvdW5kQXQgPSBmcmFjdGlvblNpemUgKyAxKTtcbiAgICBkaWdpdHNbMF0gPSAwO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcm91bmRBdDsgaSsrKSBkaWdpdHNbaV0gPSAwO1xuICB9XG5cbiAgaWYgKGRpZ2l0ID49IDUpIHtcbiAgICBpZiAocm91bmRBdCAtIDEgPCAwKSB7XG4gICAgICBmb3IgKGxldCBrID0gMDsgayA+IHJvdW5kQXQ7IGstLSkge1xuICAgICAgICBkaWdpdHMudW5zaGlmdCgwKTtcbiAgICAgICAgcGFyc2VkTnVtYmVyLmludGVnZXJMZW4rKztcbiAgICAgIH1cbiAgICAgIGRpZ2l0cy51bnNoaWZ0KDEpO1xuICAgICAgcGFyc2VkTnVtYmVyLmludGVnZXJMZW4rKztcbiAgICB9IGVsc2Uge1xuICAgICAgZGlnaXRzW3JvdW5kQXQgLSAxXSsrO1xuICAgIH1cbiAgfVxuXG4gIC8vIFBhZCBvdXQgd2l0aCB6ZXJvcyB0byBnZXQgdGhlIHJlcXVpcmVkIGZyYWN0aW9uIGxlbmd0aFxuICBmb3IgKDsgZnJhY3Rpb25MZW4gPCBNYXRoLm1heCgwLCBmcmFjdGlvblNpemUpOyBmcmFjdGlvbkxlbisrKSBkaWdpdHMucHVzaCgwKTtcblxuICBsZXQgZHJvcFRyYWlsaW5nWmVyb3MgPSBmcmFjdGlvblNpemUgIT09IDA7XG4gIC8vIE1pbmltYWwgbGVuZ3RoID0gbmIgb2YgZGVjaW1hbHMgcmVxdWlyZWQgKyBjdXJyZW50IG5iIG9mIGludGVnZXJzXG4gIC8vIEFueSBudW1iZXIgYmVzaWRlcyB0aGF0IGlzIG9wdGlvbmFsIGFuZCBjYW4gYmUgcmVtb3ZlZCBpZiBpdCdzIGEgdHJhaWxpbmcgMFxuICBjb25zdCBtaW5MZW4gPSBtaW5GcmFjICsgcGFyc2VkTnVtYmVyLmludGVnZXJMZW47XG4gIC8vIERvIGFueSBjYXJyeWluZywgZS5nLiBhIGRpZ2l0IHdhcyByb3VuZGVkIHVwIHRvIDEwXG4gIGNvbnN0IGNhcnJ5ID0gZGlnaXRzLnJlZHVjZVJpZ2h0KGZ1bmN0aW9uKGNhcnJ5LCBkLCBpLCBkaWdpdHMpIHtcbiAgICBkID0gZCArIGNhcnJ5O1xuICAgIGRpZ2l0c1tpXSA9IGQgPCAxMCA/IGQgOiBkIC0gMTA7ICAvLyBkICUgMTBcbiAgICBpZiAoZHJvcFRyYWlsaW5nWmVyb3MpIHtcbiAgICAgIC8vIERvIG5vdCBrZWVwIG1lYW5pbmdsZXNzIGZyYWN0aW9uYWwgdHJhaWxpbmcgemVyb3MgKGUuZy4gMTUuNTIwMDAgLS0+IDE1LjUyKVxuICAgICAgaWYgKGRpZ2l0c1tpXSA9PT0gMCAmJiBpID49IG1pbkxlbikge1xuICAgICAgICBkaWdpdHMucG9wKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcm9wVHJhaWxpbmdaZXJvcyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZCA+PSAxMCA/IDEgOiAwOyAgLy8gTWF0aC5mbG9vcihkIC8gMTApO1xuICB9LCAwKTtcbiAgaWYgKGNhcnJ5KSB7XG4gICAgZGlnaXRzLnVuc2hpZnQoY2FycnkpO1xuICAgIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuKys7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSW50QXV0b1JhZGl4KHRleHQ6IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IHJlc3VsdDogbnVtYmVyID0gcGFyc2VJbnQodGV4dCk7XG4gIGlmIChpc05hTihyZXN1bHQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGludGVnZXIgbGl0ZXJhbCB3aGVuIHBhcnNpbmcgJyArIHRleHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=