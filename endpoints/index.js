const endpoints = module.exports = require("./getEndpoints")();

// Add root and help endpoints if needed.
let hasRoot = false, hasHelp = false;
for (let i = 0, l = endpoints.length; i !== l; ++i) {
  endpoints[i].route === "/" && (hasRoot = true);
  endpoints[i].route === "/help" && (hasHelp = true);
}

hasRoot || endpoints.unshift(require("./createHelpEndpoint")("/", "/"));
hasHelp || endpoints.push(require("./createHelpEndpoint")("/help", "/help"));

endpoints.push(...require("./createHealthCheckEndpoints")("/healthcheck"));