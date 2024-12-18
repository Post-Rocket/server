const { Client } = require("node-scp");
const getParams = require("./getParams");

// Helper function to test a connection.
const testConnection = async params => {
  params = getParams(params);

  // Connect.
  const client = await Client(params);
  console.log("✅  Success, connected to instance");

  // Close connection.
  client.close();
  console.log("✅  Connection closed");
}

// Test connection.
testConnection("../secrets/dev.json");