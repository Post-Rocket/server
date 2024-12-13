"use strict";

// Helper function to check the card is valid.
const re = /[- ]+/g;
const isValidCreditCard = str => {
  if (!str) return false;
  str = `${str}`.replace(re, "");
  let sum = 0, tmpNum, shouldDouble = false, i = str.length - 1;
  for (; i >= 0; --i, shouldDouble = !shouldDouble) {
    tmpNum = parseInt(str.charAt(i), 10);
    shouldDouble ? (
      (tmpNum *= 2) >= 10 && (
        sum += (tmpNum % 10) + 1
      ) || (
        sum += tmpNum
      )
    ) : sum += tmpNum;
  }
  return (sum % 10) === 0;
}

// Helper function to define a new credit card validator.
const define = (name, re) => {
  // testing function.
  const fn = creditCardNumber => re.test(`${creditCardNumber}`);

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

// Specialized cards.
const cards = {};
cards.isAmex = define("Amex", /^3[47][0-9]{13}$/);
cards.isDinersClub = define("DinersClub", /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/);
cards.isDiscover = define("Discover", /^6(?:011|5[0-9][0-9])[0-9]{12,15}$/);
cards.isJCB = define("JCB", /^(?:2131|1800|35\d{3})\d{11}$/);
cards.isMasterCard = define("MasterCard", /^5[1-5][0-9]{2}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/);
cards.isUnionPay = define("UnionPay", /^(6[27][0-9]{14}|^(81[0-9]{14,17}))$/);
cards.isVisa = define("Visa", /^(?:4[0-9]{12})(?:[0-9]{3,6})?$/);

const PROVIDERS = Object.freeze(Object.entries(cards).map(([k, v]) => v.NAME));
const PROVIDER_MAP = Object.freeze(new Map(Object.entries(cards).map(([k, v]) => [v.NAME.toLowerCase(), v])));

const getSupportedCreditCardProviders = () => PROVIDERS;

// Get the credit card type.
const getCreditCardProvider = creditCardNumber => {
  for (const k in cards) {
    const fn = cards[k];
    if (fn(creditCardNumber)) return fn.NAME;
  }
  return "";
}

const isCreditCard = (creditCardNumber, provider) => {
  if (!isValidCreditCard(creditCardNumber)) return false;

  const fn = PROVIDER_MAP.get(`${provider}`.toLowerCase());
  if (fn) return fn(creditCardNumber) && isValidCreditCard(creditCardNumber);

  for (const k in cards) {
    if (cards[k](creditCardNumber)) return true;
  }

  return false;
}

// Exports.
Object.defineProperty(isCreditCard, "PROVIDERS", {
  value: PROVIDERS
});
Object.defineProperty(isCreditCard, "PROVIDER_MAP", {
  value: PROVIDER_MAP
});
Object.assign(isCreditCard, {isValidCreditCard, getCreditCardProvider, getSupportedCreditCardProviders, ...cards});
module.exports = Object.freeze(Object.defineProperty(isCreditCard, "isCreditCard", {
  value: isCreditCard
}));