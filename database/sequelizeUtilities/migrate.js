const { Sequelize } = require("sequelize");
const { CONFIG, log } = require("./globals");

// Helper function to migrate, sync and close a sequelized database.
const migrate = async (sequelize, options) => {
  // Check the input database is sequelized.
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  // Normalize options.
  const { alter = true, force = false, drop, match } = {
    CONFIG,
    ...(sequelize.config || {}),
    ...(options || {})
  };

  // Synchronize the database.
  try {
    drop && await sequelize.drop();
  } catch (e) {
    return Promise.reject(e);
  }

  // Synchornize and closing connection.
  return sequelize.sync({ alter, force, match }).then(() => {
    (sequelize.config && sequelize.config.logging || log)('✅ Database migrated and synchronized');
  }).then(() => sequelize.close());
}


// Exports.
module.exports = Object.freeze(Object.defineProperty(migrate, 'migrate', {
  value: migrate
}));