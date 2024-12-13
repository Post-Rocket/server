module.exports = {
  name: "SocialHandle",
  attributes: {
    // Names.
    name: "text",
    url: {
      type: "text",
      validate: {
        isUserProfileHandle: require("../sequelizeUtilities/validators/isUserProfileHandle")
      }
    }
  }
}