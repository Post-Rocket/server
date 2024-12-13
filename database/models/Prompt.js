module.exports = {
  name: "Prompt",
  attributes: {
    content: {
      type: "text",
      validate: {
        isValid: value => value.length > 10
      },
      allowNull: false
    },
  }
}