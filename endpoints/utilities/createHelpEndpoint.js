const createEndpoint = require("./createEndpoint");
const getEndpoints = require("./getEndpoints");

const createHelpEndpoint = (route, ...blacklist) => {
  const endpoints = getEndpoints(...blacklist);

  // Create html.
  const description = "List of all endpoints";
  let html = `<!DOCTYPE html>
  <html lang="en-us">
    <head>
    </head>
    <body>
      <h1>Help</h1>
      ${description}
      <br/>
      <br/>
  `;

  for (let i = 0, l = endpoints.length; i !== l; ++i) {
    const {name, method = "GET", route, description } = endpoints[i];
    html += `
      <hr/>
      <h2>${name}</h2>
      <ul style="line-height: 150%">
      <li>
          <b>Method:</b> ${method.toUpperCase()}
        </li>
        <li>
          <b>Route:</b> ${method.toLowerCase() === "get" && `<a href="${route}" target="_blank" title="Route for ${name}">${route}</a>` || route}
        </li>
        <li>
          <b>Description:</b> ${description || "none"}
        </li>
      </ul>
      <br/>
      <br/>
  `
  }
  
  html += "  </body>\n</html>";

  // Endpoint.
  return createEndpoint("get", route || "/help", (req, res) => {
    res.send(html);
  }, "help", description);
}

// Export.
module.exports = Object.freeze(Object.defineProperty(createHelpEndpoint, "createHelpEndpoint", {
  value: createHelpEndpoint
}));