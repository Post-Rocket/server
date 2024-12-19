const endpoints = module.exports = require("./getEndpoints")();

let hasRoot = false;
for (let i = 0, l = endpoints.length; i !== l; ++i) {
  if (endpoints[i].route === "/") {
    hasRoot = true;
    break;
  }
}

hasRoot || endpoints.unshift(require("./createHelpEndpoint")("/", "/"));