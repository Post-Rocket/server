// Helper function to create an endpoint.

const createEndpoint = (
  type,
  route,
  process,
  name
) => (
  type = type && typeof type === "object" && {...type} || {
    method: type,
    route,
    process,
    name
  },
  type.method = (type.type || type.method || "get").toLowerCase(),
  type.route || (type.route = type.path || type.name || "/"),
  type.route = type.route.trim(),
  type.route.startsWith("/") || (type.route = "/" + type.route),
  type.process || (type.process = () => console.log("hello world!")),
  type.name || (type.name = type.route),
  type.toString || Object.defineProperty(type, "toString", {
    value: () => {
      return JSON.stringify(type, null, 2);
    }
  }),
  Object.freeze(type)
);

// Export.
module.exports = Object.freeze(Object.defineProperty(createEndpoint, "createEndpoint", {
  value: createEndpoint
}));