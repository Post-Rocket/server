const { isStrongPassword, getStrongPasswordErrors } = require("./isStrongPassword");
const { isPhoneNumber, normalizePhoneNumber } = require("./isPhoneNumber");
module.exports = {
  isAccountId: require("./isAccountId"),
  ...require("./isCreditCard"),
  isCvv: require("./isCvv"),
  isEmail: require("./isEmail"),
  isPhoneNumber,
  normalizePhoneNumber,
  ...require("./isPostalCode"),
  isStrongPassword,
  getStrongPasswordErrors,
  isUrl: require("./isUrl"),
  ...require("./isUserProfileHandle"),
  isUuid: require("./isUuid"),
}