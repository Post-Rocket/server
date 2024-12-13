module.exports = [
  // Models.
  require("./Account.js"),
  require("./Organization.js"),
  require("./Prompts.js"),
  require("./SocialHandle.js"),

  // Associations.
  require("./Account_Organization.js"),
  require("./Organization_SocialHandle.js"),
  require("./SocialHandle_Prompts.js"),
];