const createEndpoint = require("./utilities/createEndpoint");
const { statuses: { OK, BAD_REQUEST } } = require("./utilities/httpCodes");

// Endpoint.
const authenticate = createEndpoint("post", "/authenticate", (req, res) => {
  let data = req.body; // Access the POST data from req.body

  try {
    data = JSON.parse(data);
  } catch (error) {
    res.status(BAD_REQUEST).json({ error });
  }

  // Do something with the data (e.g., save to a database)
  console.log("Received data:", data);

  if (data.verify) {
    // Verify token.

    // Token verified.
    res.status(OK).json({
      message: "Data received successfully",
      verified: true
    });
  } else {
    // Send verification code.
    res.status(OK).json({ message: `Verification code sent` });
  }
});

// Export.
module.exports = Object.freeze(Object.defineProperty(authenticate, "authenticate", {
  value: authenticate
}));