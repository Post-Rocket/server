const sendCommand = require("./sendCommand");

// Helper function to test a connection.
// like: testConnection("../secrets/dev.json");
const updateNodeModules = async params => {
  return await sendCommand(params,
    "cd server",
    "npm -i"
  )
}

// Export.
module.exports = Object.freeze(Object.defineProperty(updateNodeModules, "updateNodeModules", {
  value: updateNodeModules
}));