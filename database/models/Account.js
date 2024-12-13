module.exports = {
  name: "Account",
  attributes: {
    // Names.
    firstName: "text",
    lastName: "text",
    middleName: "text",
    // Contact info.
    phoneNumber: {
      type: "text",
      validate: {
        isPhoneNumber: require("../sequelizeUtilities/validators/isPhoneNumber")
      }
    },
    email: {
      type: "text",
      validate: {
        isEmail: require("../sequelizeUtilities/validators/isEmail")
      }
    },
    verifiedEmail: {
      type: "bool",
      defaultValue: false,
      allowNull: false
    },
    // Billing info.
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
    state: "text",
    country: "varchar255",
    creditCardNumber: {
      type: "varchar100",
      validate: {
        isCreditCard: require("../sequelizeUtilities/validators/isCreditCard")
      }
    },
    cvv: {
      type: "varchar100",
      validate: {
        isCvv: require("../sequelizeUtilities/validators/isCvv")
      }
    }
  }
}