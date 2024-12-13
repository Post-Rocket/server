"use strict";

// Helper function to define a new postal code validator.
const define = (name, re) => {
  // testing function.
  const fn = postalCode => re.test(`${postalCode}`);

  // Add the RegExp.
  Object.defineProperty(fn, "RE", {
    value: re
  });

  // Add the card name.
  Object.defineProperty(fn, "NAME", {
    value: name
  });
  return fn;
}

// Common patterns
const threeDigit = /^\d{3}$/;
const fourDigit = /^\d{4}$/;
const fiveDigit = /^\d{5}$/;
const sixDigit = /^\d{6}$/;

// Postal codes validators.
const codes = {};
export const isADPostalCode = codes.isADPostalCode = define("AD", /^AD\d{3}$/);
export const isATPostalCode = codes.isATPostalCode = define("AT", fourDigit);
export const isAUPostalCode = codes.isAUPostalCode = define("AU", fourDigit);
export const isAZPostalCode = codes.isAZPostalCode = define("AZ", /^AZ\d{4}$/);
export const isBAPostalCode = codes.isBAPostalCode = define("BA", /^([7-8]\d{4}$)/);
export const isBEPostalCode = codes.isBEPostalCode = define("BE", fourDigit);
export const isBGPostalCode = codes.isBGPostalCode = define("BG", fourDigit);
export const isBRPostalCode = codes.isBRPostalCode = define("BR", /^\d{5}-?\d{3}$/);
export const isBYPostalCode = codes.isBYPostalCode = define("BY", /^2[1-4]\d{4}$/);
export const isCAPostalCode = codes.isCAPostalCode = define("CA", /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s\-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i);
export const isCHPostalCode = codes.isCHPostalCode = define("CH", fourDigit);
export const isCNPostalCode = codes.isCNPostalCode = define("CN", /^(0[1-7]|1[012356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[1-5]|8[1345]|9[09])\d{4}$/);
export const isCOPostalCode = codes.isCOPostalCode = define("CO", /^(05|08|11|13|15|17|18|19|20|23|25|27|41|44|47|50|52|54|63|66|68|70|73|76|81|85|86|88|91|94|95|97|99)(\d{4})$/);
export const isCZPostalCode = codes.isCZPostalCode = define("CZ", /^\d{3}\s?\d{2}$/);
export const isDEPostalCode = codes.isDEPostalCode = define("DE", fiveDigit);
export const isDKPostalCode = codes.isDKPostalCode = define("DK", fourDigit);
export const isDOPostalCode = codes.isDOPostalCode = define("DO", fiveDigit);
export const isDZPostalCode = codes.isDZPostalCode = define("DZ", fiveDigit);
export const isEEPostalCode = codes.isEEPostalCode = define("EE", fiveDigit);
export const isESPostalCode = codes.isESPostalCode = define("ES", /^(5[0-2]{1}|[0-4]{1}\d{1})\d{3}$/);
export const isFIPostalCode = codes.isFIPostalCode = define("FI", fiveDigit);
export const isFRPostalCode = codes.isFRPostalCode = define("FR", /^\d{2}\s?\d{3}$/);
export const isGBPostalCode = codes.isGBPostalCode = define("GB", /^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i);
export const isGRPostalCode = codes.isGRPostalCode = define("GR", /^\d{3}\s?\d{2}$/);
export const isHRPostalCode = codes.isHRPostalCode = define("HR", /^([1-5]\d{4}$)/);
export const isHTPostalCode = codes.isHTPostalCode = define("HT", /^HT\d{4}$/);
export const isHUPostalCode = codes.isHUPostalCode = define("HU", fourDigit);
export const isIDPostalCode = codes.isIDPostalCode = define("ID", fiveDigit);
export const isIEPostalCode = codes.isIEPostalCode = define("IE", /^(?!.*(?:o))[A-Za-z]\d[\dw]\s\w{4}$/i);
export const isILPostalCode = codes.isILPostalCode = define("IL", /^(\d{5}|\d{7})$/);
export const isINPostalCode = codes.isINPostalCode = define("IN", /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/);
export const isIRPostalCode = codes.isIRPostalCode = define("IR", /^(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}$/);
export const isISPostalCode = codes.isISPostalCode = define("IS", threeDigit);
export const isITPostalCode = codes.isITPostalCode = define("IT", fiveDigit);
export const isJPPostalCode = codes.isJPPostalCode = define("JP", /^\d{3}\-\d{4}$/);
export const isKEPostalCode = codes.isKEPostalCode = define("KE", fiveDigit);
export const isKRPostalCode = codes.isKRPostalCode = define("KR", /^(\d{5}|\d{6})$/);
export const isLIPostalCode = codes.isLIPostalCode = define("LI", /^(948[5-9]|949[0-7])$/);
export const isLTPostalCode = codes.isLTPostalCode = define("LT", /^LT\-\d{5}$/);
export const isLUPostalCode = codes.isLUPostalCode = define("LU", fourDigit);
export const isLVPostalCode = codes.isLVPostalCode = define("LV", /^LV\-\d{4}$/);
export const isLKPostalCode = codes.isLKPostalCode = define("LK", fiveDigit);
export const isMGPostalCode = codes.isMGPostalCode = define("MG", threeDigit);
export const isMXPostalCode = codes.isMXPostalCode = define("MX", fiveDigit);
export const isMTPostalCode = codes.isMTPostalCode = define("MT", /^[A-Za-z]{3}\s{0,1}\d{4}$/);
export const isMYPostalCode = codes.isMYPostalCode = define("MY", fiveDigit);
export const isNLPostalCode = codes.isNLPostalCode = define("NL", /^[1-9]\d{3}\s?(?!sa|sd|ss)[a-z]{2}$/i);
export const isNOPostalCode = codes.isNOPostalCode = define("NO", fourDigit);
export const isNPPostalCode = codes.isNPPostalCode = define("NP", /^(10|21|22|32|33|34|44|45|56|57)\d{3}$|^(977)$/i);
export const isNZPostalCode = codes.isNZPostalCode = define("NZ", fourDigit);
export const isPLPostalCode = codes.isPLPostalCode = define("PL", /^\d{2}\-\d{3}$/);
export const isPRPostalCode = codes.isPRPostalCode = define("PR", /^00[679]\d{2}([ -]\d{4})?$/);
export const isPTPostalCode = codes.isPTPostalCode = define("PT", /^\d{4}\-\d{3}?$/);
export const isROPostalCode = codes.isROPostalCode = define("RO", sixDigit);
export const isRUPostalCode = codes.isRUPostalCode = define("RU", sixDigit);
export const isSAPostalCode = codes.isSAPostalCode = define("SA", fiveDigit);
export const isSEPostalCode = codes.isSEPostalCode = define("SE", /^[1-9]\d{2}\s?\d{2}$/);
export const isSGPostalCode = codes.isSGPostalCode = define("SG", sixDigit);
export const isSIPostalCode = codes.isSIPostalCode = define("SI", fourDigit);
export const isSKPostalCode = codes.isSKPostalCode = define("SK", /^\d{3}\s?\d{2}$/);
export const isTHPostalCode = codes.isTHPostalCode = define("TH", fiveDigit);
export const isTNPostalCode = codes.isTNPostalCode = define("TN", fourDigit);
export const isTWPostalCode = codes.isTWPostalCode = define("TW", /^\d{3}(\d{2})?$/);
export const isUAPostalCode = codes.isUAPostalCode = define("UA", fiveDigit);
export const isUSPostalCode = codes.isUSPostalCode = define("US", /^\d{5}(-\d{4})?$/);
export const isZAPostalCode = codes.isZAPostalCode = define("ZA", fourDigit);
export const isZMPostalCode = codes.isZMPostalCode = define("ZM", fiveDigit);

const LOCALES = Object.freeze(Object.entries(codes).map(([k, v]) => v.NAME));
const LOCALE_MAP = Object.freeze(new Map(Object.entries(codes).map(([k, v]) => [v.NAME, v])));

export const getSupportedPostalCodeLocales = () => LOCALES;

export const isPostalCode = (postalCode, locale) => {
  const fn = LOCALE_MAP.get(`${locale}`.slice(0, 2).toUpperCase());
  if (fn) return fn(postalCode);

  for (const k in codes) {
    if (codes[k](postalCode)) return true;
  }

  return false;
}

// Exports.
Object.defineProperty(isPostalCode, "LOCALES", {
  value: LOCALES
});

Object.defineProperty(isPostalCode, "LOCALE_MAP", {
  value: LOCALE_MAP
});

// Exports.
Object.assign(isPostalCode, { getSupportedPostalCodeLocales, ...codes });
export default Object.freeze(Object.defineProperty(isPostalCode, "isPostalCode", {
  value: isPostalCode
}));

// Node.js exports.
try {
  module.exports = isPostalCode;
} catch {}