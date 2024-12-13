"use strict";

// Helper function to validate a cvv string.
const RE = /^[0-9]{3,4}$/;
const isCvv = cvv => (
  !!cvv && typeof cvv === "string" && RE.test(cvv)
);

// Exports.
Object.defineProperty(isCvv, "RE", {
  value: RE
});
module.exports = Object.freeze(Object.defineProperty(isCvv, "isCvv", {
  value: isCvv
}));