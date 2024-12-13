const express = require("express");
const endpoints = require("../endpoints") || [];
const app = express();
const PORT = 3000;

// Create endpoints.
for (let i = 0, l = enpoints.length; i !== l; ++i) {
  const {
    method,
    route,
    process,
    name
  } = endpoints[i];
  console.log(`🖥️ Initializing ${method.toUpperCase()} ${name}`);
  app[method](route, process);
}

// Launch server.
app.listen(PORT);
console.log(`✅ listen to ${PORT}`);