const serverless = require("serverless-http");
const app = require("./app");

// Exports.
module.exports.handler = serverless(app);