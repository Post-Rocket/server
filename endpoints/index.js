module.exports = require("../io/requireFiles")(
  __dirname, 
  { blacklist: ["createEndpoint.js", "index.js"] }
)