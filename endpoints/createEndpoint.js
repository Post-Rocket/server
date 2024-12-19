// Helper function to create an endpoint.
const createEndpoint = (
  type,
  route,
  process,
  name,
  description
) => (
  type = type && typeof type === "object" && {...type} || {
    method: type,
    route,
    process,
    name,
    description
  },
  type.method = (type.type || type.method || "get").toLowerCase(),
  type.route || (type.route = type.path || type.name || "/"),
  type.route = type.route.trim(),
  type.route.startsWith("/") || (type.route = "/" + type.route),
  type.name || (type.name = type.route),
  type.name === "/" && (type.name = "root") || (
    type.name.startsWith("/") && (type.name = type.name.slice(1))
  ),
  type.process || (
    type.process = (req, res) => res.send(`<!DOCTYPE html>
<html lang="en-us">
  <head>
  </head>
  <body>
    <h1>${type.name}</h1>
    ${type.description || ""}
    <br/>
    <ul style="line-height: 150%">
    <li>
        <b>Method:</b> ${type.method.toUpperCase()}
      </li>
      <li>
        <b>Route:</b> ${type.route}
      </li>
      <li>
        <b>Description:</b> ${type.description || "none"}
      </li>
    </ul>
  </body>
</html>`)
  ),
  type.toString || Object.defineProperty(type, "toString", {
    value: () => {
      return JSON.stringify(type, null, 2);
    }
  }),
  type
);

// Export.
module.exports = Object.freeze(Object.defineProperty(createEndpoint, "createEndpoint", {
  value: createEndpoint
}));