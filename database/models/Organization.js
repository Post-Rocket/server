module.exports = {
  name: "Organization",
  attributes: {
    // Names.
    name: "text",
    // Address info.
    adress1: "text",
    adress2: "text",
    city: "text",
    state: "text",
    postalCode: {
      type: "text",
      validate: {
        isPostalCode: require("../sequelizeUtilities/validators/isPostalCode")
      }
    },
    type: {
      type: "text",
      validate: {
        is: /^(business|personal)$/i
      },
      allowNull: false,
      defaultValue: "personal"
    },
    state: "text",
    country: "varchar255",
    // For prompt.
    description: "text",
    website: {
      type: "text",
      validate: {
        isUrl: require("../sequelizeUtilities/validators/isUrl")
      }
    }
  }
}