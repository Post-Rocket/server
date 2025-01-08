const express = require("express");
const endpoints = require("./endpoints") || [];
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Create endpoints.
for (let i = 0, l = endpoints.length; i !== l; ++i) {
  const {
    method,
    route,
    process
  } = endpoints[i];
  if (!method) throw Error(`⛔️ Empty method for ${JSON.stringify(endpoints[i] || {})}`);
  console.log(`🖥️ Initializing ${method.toUpperCase()} ${route}`);
  app[method](route, process);
}

// Launch server.
server = app.listen(PORT, () => {
  console.log(`✅ listen to ${PORT}`);
});
server.keepAliveTimeout = 65000;
server.headersTimeout = 80000;

// Exports.
module.exports = app;