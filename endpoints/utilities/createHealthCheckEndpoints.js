const createEndpoint = require("./createEndpoint");
const { statuses: { OK } } = require("./httpCodes");

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

// GET and POST dummy endpoints, to make sure the EC2 is still running.
const createHealthCheckEndpoints = route => {
 // Endpoint.
  return [
    createEndpoint("get", route || "/healthcheck", (req, res) => {
      res.status(OK).send(GET_CONTENT);
    }, "healthcheck", "Healthcheck GET endpoint"),
    createEndpoint("post", route || "/healthcheck", (req, res) => {
      res.status(OK).json(POST_CONTENT);
    }, "healthcheck", "Healthcheck POST endpoint")
  ];
}

// Export.
module.exports = Object.freeze(Object.defineProperty(createHealthCheckEndpoints, "createHealthCheckEndpoints", {
  value: createHealthCheckEndpoints
}));