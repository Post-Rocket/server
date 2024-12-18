const createEndpoint = require("./createEndpoint");

// Endpoint.
const authenticate = createEndpoint("post", "/authenticate", () => {

});

// Export.
module.exports = Object.freeze(Object.defineProperty(authenticate, "authenticate", {
  value: authenticate
}));