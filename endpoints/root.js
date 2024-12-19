const createEndpoint = require("./createEndpoint");

// Endpoint.
const root = createEndpoint("get", "/", (req, res) => {
  res.send('Hello World!')
});

// Export.
module.exports = Object.freeze(Object.defineProperty(root, "root", {
  value: root
}));