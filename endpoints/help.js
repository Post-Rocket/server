const Path = require("path");
const createEndpoint = require("./createEndpoint");
const dir = Path.dirname(__filename);
const endpoints = (require("../io/requireFiles")(
  dir, 
  { blacklist: ["createEndpoint.js", "index.js", "help.js"], relative: true }
) || []).sort((a, b) => a.route < b.route && -1 || 1);

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
  const {name, method, route, description } = endpoints[i];
  html += `
    <hr/>
    <h2>${name}</h2>
    <ul style="line-height: 150%">
    <li>
        <b>Method:</b> ${method.toUpperCase()}
      </li>
      <li>
        <b>Route:</b> <a href="${route}" target="_blank" title="Route for ${name}">${route}</a>
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
const help = createEndpoint("get", "/help", (req, res) => {
  res.send(html);
}, null, description);

// Export.
module.exports = Object.freeze(Object.defineProperty(help, "help", {
  value: help
}));