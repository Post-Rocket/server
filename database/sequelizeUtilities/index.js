const create = require("./create");

module.exports = {
  ...require("./globals"),
  create: require("./create"),
  createSequelizedDatabase: require("./createSequelizedDatabase"),
  defineDatabaseSchema: require("./defineDatabaseSchema"),
  destroy: require("./destroy"),
  drop: require("./drop"),
  get: require("./get"),
  getDatabaseSchema: require("./getDatabaseSchema"),
  migrate: require("./migrate"),
  migrateDatabaseSchema: require("./migrateDatabaseSchema"),
  update: require("./update"),
  Op: require("./Op")
}