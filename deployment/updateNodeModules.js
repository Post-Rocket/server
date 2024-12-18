const { Client } = require("ssh2");
const getParams = require("./getParams");

// Helper function to test a connection.
// like: testConnection("../secrets/dev.json");
const updateNodeModules = async params => {
  params = getParams(params);

  // Connect.
  const client = new Client();
  return client.on("ready", () => {
    console.log("Client :: ready");

    // Configure shell.
    client.shell((err, stream) => {
      if (err) throw err;

      // Close connection when stream is closed.
      stream.on("close", () => {
        console.log("Stream :: close");
        client.end();
      }).on("data", (data) => {
        console.log("OUTPUT: " + data);
      });

      // Instal / update node.
      stream.end("npm install");
    });
  }).connect(params);
}

// Export.
module.exports = Object.freeze(Object.defineProperty(updateNodeModules, "updateNodeModules", {
  value: updateNodeModules
}));