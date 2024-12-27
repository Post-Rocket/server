const createEndpoint = require("./createEndpoint");

const GET_CONTENT = `<!DOCTYPE html>
<html lang="en-us">
  <head>
  </head>
  <body>
    <h1>Health Check</h1>
    Success!
  </body>
</html>`,
POST_CONTENT = {
  msg: "Healtcheck succeeded"
};

const createHealthCheckEndpoints = route => {
 // Endpoint.
  return [
    createEndpoint("get", route || "/healthcheck", (req, res) => {
      res.send(GET_CONTENT);
    }, "healthcheck", "Healthcheck GET endpoint"),
    createEndpoint("post", route || "/healthcheck", (req, res) => {
      res.status(200).json(POST_CONTENT);
    }, "healthcheck", "Healthcheck POST endpoint")
  ];
}

// Export.
module.exports = Object.freeze(Object.defineProperty(createHealthCheckEndpoints, "createHealthCheckEndpoints", {
  value: createHealthCheckEndpoints
}));