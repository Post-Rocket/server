const defineDatabaseSchema = require("./defineDatabaseSchema");
const migrate = require("./migrate");

// Helper function to migrate, sync and close database schema.
const migrateDatabaseSchema = async (sequelize, options, ...input) => {
  try {
    defineDatabaseSchema(sequelize, ...input);
  } catch (e) { Promise.reject(e); }

  // Synchornize and closing connection.
  return migrate(sequelize, options);
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(migrateDatabaseSchema, 'migrateDatabaseSchema', {
  value: migrateDatabaseSchema
}));