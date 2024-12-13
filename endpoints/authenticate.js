const createEndpoint = require("./createEndpoint");

const authenticate = createEndpoint("post", "/authenticate", () => {

});

// Export.
module.exports = Object.freeze(Object.defineProperty(authenticate, "authenticate", {
  value: authenticate
}));