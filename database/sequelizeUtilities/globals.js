const deepFreeze = require("./misc/deepFreeze");

// Default config.
const CONFIG = deepFreeze({
	connectionString: "",
	models: {},
	pool: {
		max: 10, // maximum number of 'opened' connections to be scaled to
		min: 1, // minimum number of 'opened' connections, can be 0
		acquire: 1000, // connect timeout in ms
		idle: 10000, // how long we keep open connections before scaling down, in ms
	},
	logging: false, // turn logging on | off, can be a logging function or true or false or null or undefined
	dialectOptions: {
		connectTimeout: 1000, // connection timeout in ms, similar to the pool.aquire option
		multipleStatements: true // for running raw queries with semicolons, to support mutiple statement per query
	},
	define: {
		freezeTableName: true, // turn off pluralization on model names and getters
		underscored: true, // model name from camel case to underscore notation
		charset: "utf8mb4", // character encoding
		collate: "utf8mb4_general_ci" // character encoding
	},
  heartbeatPingFrequency: 120000, // in ms - ping/pong sent to keep the MariaDB connection alive.
  authenticate: true
});

const log = (...args) => console.log("⛁ SQL:", ...args);
const logError = (...args) => console.error(...args);

module.exports = Object.freeze({
  CONFIG,
  log,
	logError
});