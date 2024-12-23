const sendCommand = require("./sendCommand");

// Helper function to test a connection.
// like: testConnection("../secrets/dev.json");
const clear = async params => {
  return await sendCommand(params,
    `rm -v -R !("node_modules")`
  )
}

// Export.
module.exports = Object.freeze(Object.defineProperty(clear, "clear", {
  value: clear
}));