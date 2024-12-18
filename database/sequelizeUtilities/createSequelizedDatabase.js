const { Sequelize } = require("sequelize");
const { CONFIG, log, logError } = require("./globals");
const deepFreeze = require("./misc/deepFreeze");
const defineDatabaseSchema = require("./defineDatabaseSchema");
const migrateDatabaseSchema = require("./migrateDatabaseSchema");
const Url = require("./Url");

// Helper function to create a sequelized database.
const createSequelizedDatabase = async (connectionString, config, ...args) => {
  // Add default config params.
  typeof connectionString === "object" && (
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
  delete config.username;
  delete config.password;
  delete config.host;
  delete config.database;
  delete config.port;
  delete config.path;

  // Normalize config.
  config.logging && typeof config.logging !== "function" && (config.logging = config.log || log);
  typeof config.logging === "function" || (config.logging = false);
  delete config.log;
  config.logError && typeof config.logError !== "function" && (config.logError = logError);
  let {
    heartbeatPingFrequency,
    heartbeatFrequency = heartbeatPingFrequency,
    heartbeat = heartbeatFrequency
  } = config;
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

  // Thats a heartbeat ping/pong gets sent every 2 minutes to keep the db connection alive.
  // The connection might die after 1 day if no heartbeat is sent.
  // Also specialize close function to drop the heartbeat once the connection is closed.
  let setIntervalId;
  if (heartbeat > 0) {
    // Overload close.
    const close = output.close;
    try {
      output.close = async function(...args) {
        clearInterval(setIntervalId);
        return await close.apply(output, args);
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

  // Authenticate if needed.
  try {
    doAuthenticate && (
      await output.authenticate(),
      (config.logging || log)("Database authenticated")
    )
  } catch (error) {
    (typeof config.logError === "function" && config.logError || logError)('Unable to connect to the database:', error);
  }

  // Start heartbeat.
  heartbeat > 0 && (
    setIntervalId = setInterval(
      async () => await output.query("select 1", { type: "SELECT" }),
      heartbeat
    )
  );

  return output;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(createSequelizedDatabase, "createSequelizedDatabase", {
  value: createSequelizedDatabase
}));