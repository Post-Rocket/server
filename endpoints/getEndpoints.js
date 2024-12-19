const Path = require("path");
const requireFiles = require("../io/requireFiles")
const dir = Path.dirname(__filename);

const getEndpoints = (...blacklist) => (requireFiles(
  dir, 
  { blacklist: ["createEndpoint.js", "getEndpoints.js", "createHelpEndpoint.js", "index.js", ...blacklist.flat(Infinity)], relative: true }
) || []).flat(Infinity).sort(
  (a, b) => (
    a.route < b.route && -1 ||
    (a.route > b.route && 1) ||
    (a.method < b.method && -1) ||
    1
  )
);

// Export.
module.exports = Object.freeze(Object.defineProperty(getEndpoints, "getEndpoints", {
  value: getEndpoints
}));