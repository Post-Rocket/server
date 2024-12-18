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

  try {
    params = getParams(params);
  } catch {}

  for (let i = 0, l = commands.length; i !== l; ++i) {
    try {
      params = getParams(commands[i]);
      commands.splice(i, 1);
      break;
    } catch {}
  }
  if (!Object.keys(params).length) {
    throw "Missing parameters";
  }

  const log = params.logging === true && (params.log || console.log)
    || (typeof params.logging === "function" && params.logging)
    || (typeof params.log === "function" && params.logging === undefined && params.log)
    || (() => {})

  commands = (commands.join("\n") + "\n").replace(/exit/gi, "").replace(/\n+/g, "\n") + "exit\n";
  log("params", params);
  log("commands", commands);

  // Connect.
  const client = new Client();
  return client.on("ready", () => {
    log("Client :: ready");

    // Configure shell.
    client.shell((err, stream) => {
      if (err) throw err;

      // Close connection when stream is closed.
      stream.on("close", () => {
        log("Stream :: close");
        client.end();
      }).on("data", (data) => {
        log(`${data}`);
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