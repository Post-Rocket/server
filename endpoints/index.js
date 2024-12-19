const Path = require("path");
const dir = Path.dirname(__filename);
module.exports = require("../io/requireFiles")(
  dir, 
  { blacklist: ["createEndpoint.js", "index.js"], relative: true }
);