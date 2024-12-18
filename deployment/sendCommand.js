const { Client } = require("ssh2");
const getParams = require("./getParams");

// Helper function to test a connection.
// like: testConnection("../secrets/dev.json");
const sendCommand = async (...args) => {
  args = args.flat(Infinity);
  let commands = [], params = {};
  for (let i = 0, l = args.length, a; i !== l; ++i) {
    typeof (a = args[i]) === "string" && commands.push(a)
    || (typeof a === "object" && Object.assign(params, a));
  }
  params = getParams(params);
  commands = commands.join("/n");

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
        console.log(data);
      });

      // Instal / update node.
      stream.end(commands);
    });
  }).connect(params);
}

// Export.
module.exports = Object.freeze(Object.defineProperty(sendCommand, "sendCommand", {
  value: sendCommand
}));