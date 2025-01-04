const createEndpoint = require("./utilities/createEndpoint");
const { OK } = require("./utilities/httpCodes");

// Endpoint.
const authenticate = createEndpoint("post", "/authenticate", (req, res) => {
  let data = req.body; // Access the POST data from req.body

  try {
    data = JSON.parse(data);
  } catch (error) {
    res.status(OK.value).json({ message: 'Data received successfully' });
  }

  // Do something with the data (e.g., save to a database)
  console.log('Received data:', data);

  // Send a response
  res.status(OK.value).json({ message: 'Data received successfully' });
});

// Export.
module.exports = Object.freeze(Object.defineProperty(authenticate, "authenticate", {
  value: authenticate
}));