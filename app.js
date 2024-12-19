const express = require("express");
const expressListEndpoints = require('express-list-endpoints');
const endpoints = require("./endpoints") || [];
const app = express();
const PORT = 80;

// Middleware to parse JSON bodies
app.use(express.json());

// Create endpoints.
for (let i = 0, l = endpoints.length; i !== l; ++i) {
  const {
    method,
    route,
    process,
    name
  } = endpoints[i];
  console.log(`🖥️ Initializing ${method.toUpperCase()} ${name}`);
  app[method](route, process);
}

// List all endpoints
// const list = expressListEndpoints(app);
// console.log(list);

// Launch server.
app.listen(PORT, () => {
  console.log(`✅ listen to ${PORT}`);
});

// Exports.
module.exports = app;