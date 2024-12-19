// Endpoint.
const help = require("./createHelpEndpoint")("/help", "help.js");

// Export.
module.exports = Object.freeze(Object.defineProperty(help, "help", {
  value: help
}));