const fs = require("fs");

// Helper function to get input parameters.
const getParams = params => {
  // Normalize input. Load connection file if necessary.
  typeof params === "string" && (params = require(params));
  const {
    server,
    instance = server,
    ec2 = instance,
    connection = ec2
  } = params || {};

  try {
    const c = typeof connection === "string" && require(connection),
    p = c.server || c.ec2 || c.instance || c || {};
    p && (params = p);
  } catch {}

  // Check if we have the necessary info for connection.
  if (!(params.host && params.username && (
    params.password ||
    params.privateKey ||
    params.passphrase
  ))) {
    throw Error(`Missing parameters ${JSON.stringify(params || {})}`);
  }
  
  // Grab passkey from a file if needed.
  try {
    const pk = typeof privateKey === "string" && fs.readFileSync(privateKey);
    pk && (params.privateKey = pk);
  } catch {}

  return params;
}

// Export.
module.exports = Object.freeze(Object.defineProperty(getParams, "getParams", {
  value: getParams
}));