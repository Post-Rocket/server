const createEndpoint = require("./createEndpoint");

// Endpoint.
const authenticate = createEndpoint("post", "/authenticate", (req, res) => {
  const data = req.body; // Access the POST data from req.body

  // Do something with the data (e.g., save to a database)
  console.log('Received data:', data);

  // Send a response
  res.status(200).json({ message: 'Data received successfully' });
});

// Export.
module.exports = Object.freeze(Object.defineProperty(authenticate, "authenticate", {
  value: authenticate
}));