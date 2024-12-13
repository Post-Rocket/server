"use strict";

// Helper function to validate a US phone number string.
// Example:
// isPhoneNumber("12345") will return false (i.e. not validated)
const RE = /^(\+[0-9]{1,4}(\s[\.\-]\s|[\.\-]|\s|)|)(\((\s|)|)([0-9]{10}|[0-9]{5}(\s\)|\)|)(\s[\.\-]\s|[\.\-]|\s)[0-9]{5}|[0-9]{3}(\s\)|\)|)(\s[\.\-]\s|[\.\-]|\s)[0-9]{3}(\s[\.\-]\s|[\.\-]|\s)[0-9]{4}|[0-9]{2}(\s\)|\)|)(\s[\.\-]\s|[\.\-]|\s)[0-9]{2}(\s[\.\-]\s|[\.\-]|\s)[0-9]{2}(\s[\.\-]\s|[\.\-]|\s)[0-9]{2}(\s[\.\-]\s|[\.\-]|\s)[0-9]{2})$/;
const normalizePhoneNumber = phoneNumber => `${(phoneNumber || "")}`.replace(/[^0-9\+\#]+/g, "");
const isPhoneNumber = phoneNumber => !!phoneNumber && RE.test(normalizePhoneNumber(phoneNumber));
isPhoneNumber.normalizePhoneNumber = normalizePhoneNumber;

// Exports.
Object.defineProperty(isPhoneNumber, "RE", {
  value: RE
});
module.exports = Object.freeze(Object.defineProperty(isPhoneNumber, "isPhoneNumber", {
  value: isPhoneNumber
}));