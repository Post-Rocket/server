const { Sequelize, Model } = require("sequelize");
const { fixWhere } = require("./misc/fix");

// Helper function to destroy a model row.
const destroy = async (sequelize, modelName, params) => {
  // Normalize input, in case we pass the model directly instead of the db and the model name.
  sequelize instanceof Model && (
    params || (typeof modelName === "object" && (params = modelName)),
    modelName = sequelize.name,
    sequelize = sequelize.sequelize
  );
  modelName instanceof Model && (modelName = modelName.name);

  // Check the input database is sequelized.
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  // Get params.
  typeof modelName === "object"
    && modelName
    && !params
    && (params = modelName)
    && (modelName = params.modelName || params.tableName || params.name || params.model || params.table);

  // Check if model exists.
  const model = sequelize.models[modelName];
  if (!model) {
    const e = Error(`Missing model ${modelName}`);
    typeof sequelize.config.logError === "function" && sequelize.config.logError(e);
    throw e;
  }

  // Fix were.
  const {
    where,
    ...other
  } = params || {};
  where && (params = {
    where: fixWhere(where),
    ...other
  });

  // Destroy row.
  return await model.destroy(params);
}

// Export.
module.exports = Object.freeze(Object.defineProperty(destroy, "destroy", {
  value: destroy
}));