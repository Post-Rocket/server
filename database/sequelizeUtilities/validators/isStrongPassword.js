"use strict";

// Define special characters and password format regular expression tests.
// Password validation must pass the following:
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
// - At least 1 special character
// - At least 8 characters

const SPECIAL = "#@$!?.%*&/\\:|^_-=+";
const SPECIAL_RE = new RegExp(`[${SPECIAL.replace(/([^A-Za-z0-9\s])/g, "\\$1")}]`);
const TESTS = [
  [/[A-Z]/, "1 uppercase letter"],
  [/[a-z]/, "1 lowercase letter"],
  [/[0-9]/, "1 number"],
  [SPECIAL_RE, `1 special character: ${SPECIAL}`],
  [/.{8,}/, "8 characters"]
];

// Helper function to get password format errors.
// Example:
// getStrongPasswordErrors("1234567890")
// will output:
// ["1 uppercase letter", "1 lowercase letter", "1 special character: #@$!?.%*&/\\:|^_-=+"]
const getStrongPasswordErrors = password => (
  password = (password === 0 || password) && `${password}`.replace(/s+/g, "") || "",
  TESTS.reduce((output, [re, error]) => {
    re.test(password) || output.push(error);
    return output;
  }, [])
);

// Validate pasword format.
// Example:
// isStrongPassword("1234567890") will return false (i.e. not validated)
const isStrongPassword = password => !getStrongPasswordErrors(password).length;

// Exports.
Object.defineProperty(isStrongPassword, "getStrongPasswordErrors", {
  value: getStrongPasswordErrors
});
Object.defineProperty(isStrongPassword, "SPECIAL", {
  value: SPECIAL
});
Object.defineProperty(isStrongPassword, "SPECIAL_RE", {
  value: SPECIAL_RE
});
Object.defineProperty(isStrongPassword, "TESTS", {
  value: TESTS
});
module.exports = Object.freeze(Object.defineProperty(isStrongPassword, "isStrongPassword", {
  value: isStrongPassword
}));