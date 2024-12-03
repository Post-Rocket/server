const { Sequelize, Model } = require("sequelize");

// Reset model entries and primary key auto increment on the model.
const reset = async (sequelize, ...modelNames) => {
  // Normalize input, in case we pass the model directly instead of the db and the model name.
  sequelize instanceof Model && (
    modelNames.unshift(sequelize.name),
    sequelize = sequelize.sequelize
  );

  // Check the input database is sequelized.
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  modelNames = modelNames.flat(Infinity);
  modelNames.length || (modelNames = Object.keys(sequelize.models));
  return Promise.all(modelNames.map(modelName => sequelize.query(
    `delete from ${modelName}; 
    set FOREIGN_KEY_CHECKS = 0; 
    truncate ${modelName};
    set FOREIGN_KEY_CHECKS = 1;`
  )));
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(reset, "reset", {
  value: reset
}));