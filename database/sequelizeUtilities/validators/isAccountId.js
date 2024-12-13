"use strict";

// Helper function to validate an account id string.
// Example:
// isAccounId("1234567890") will return false (i.e. not validated)
const RE = /^[A-Fa-f0-9]{24}$/;
const isAccounId = accountId => (
  !!accountId && typeof accountId === "string" && RE.test(accountId.replace(/s+/g, ""))
);

// Exports.
Object.defineProperty(isAccounId, "RE", {
  value: RE
});
module.exports = Object.freeze(Object.defineProperty(isAccounId, "isAccounId", {
  value: isAccounId
}));