const { Sequelize } = require('sequelize');
const { CONFIG, log } = require("./globals");
const deepFreeze = require("./deepFreeze");
const defineDatabaseSchema = require("./defineDatabaseSchema");
const drop = require("./drop");
const migrateDatabaseSchema = require("./migrateDatabaseSchema");
const Url = require("./Url");

// Helper function to create a sequelized database.
const createSequelizedDatabase = (connectionString, config, ...args) => {
  // Add default config params.
  typeof connectionString === 'object' && (
    config = {...CONFIG, ...(connectionString || {}), ...(config || {})},
    connectionString = config.connectionString || config.connection
  ) || (
    config = {...CONFIG, ...(config || {})},
    connectionString || (connectionString = config.connectionString || config.connection)
  );

  // Normalize connection string.
  connectionString || (connectionString = new Url(config));
  connectionString = (config.connection = new Url(connectionString)).string;
  delete config.connectionString;
  delete config.dialect;
  delete config.user;
  delete config.password;
  delete config.host;
  delete config.database;
  delete config.port;

  // Normalize config.
  config.logging === true && typeof config.logging !== 'function' && (config.logging = config.log || log);
  typeof config.logging === 'function' || (delete config.logging);
  delete config.log;
  let heartbeat = config.heartbeat || config.heartbeatFrequency || config.heartbeatPingFrequency;
  delete config.heartbeat;
  delete config.heartbeatFrequency;
  delete config.heartbeatPingFrequency;
  heartbeat === true && (heartbeat = CONFIG.heartbeatPingFrequency);
  const doAuthenticate = config.authenticate || config.checkAuthorized || onfig.doAuthenticate || config.authorize;
  delete config.authenticate;
  delete config.doAuthenticate;
  delete config.checkAuthorized;
  delete config.authorize;

  // Construct object.
  const output = new Sequelize(connectionString, config, ...args);

  // Freeze config.
  output.config && Object.assign(config, output.config);
  config = deepFreeze(config);

  // Authenticate if needed.
  doAuthenticate && output.authenticate();

  // Thats a heartbeat ping/pong gets sent every 2 minutes to keep the db connection alive.
  // The connection might die after 1 day if no heartbeat is sent.
  // Also specialize close function to drop the heartbeat once the connection is closed.
  if (heartbeat > 0) {
    const setIntervalId = setInterval(
      async () => await output.query("select 1", { type: "SELECT" }),
      heartbeat
    ), close = output.close;

    // Overload close.
    try {
      output.close = function(...args) {
        clearInterval(setIntervalId);
        return close.apply(output, args);
      }
    } catch {}
  }

  // Add config.
  try {
    Object.defineProperty(output, "config", {
      get() { return config; },
      enumerable: true
    });
  } catch {}

  // Add defineDatabaseSchema.
  try {
    Object.defineProperty(output, "defineDatabaseSchema", {
      value: function(...args) {
        return defineDatabaseSchema(output, ...args);
      },
      enumerable: true
    });
  } catch {}

  // Add migrate.
  try {
    Object.defineProperty(output, "migrate", {
      value: function(...args) {
        return migrate(output, ...args);
      },
      enumerable: true
    });
  } catch {}

  // Add migrateDatabaseSchema.
  try {
    Object.defineProperty(output, "migrateDatabaseSchema", {
      value: function(...args) {
        return migrateDatabaseSchema(output, ...args);
      },
      enumerable: true
    });
  } catch {}

  return output;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(createSequelizedDatabase, "createSequelizedDatabase", {
  value: createSequelizedDatabase
}));