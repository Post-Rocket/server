const { fixWhere } = require("./misc/fix");

// Helper function to destroy a model row.
const destroy = async (sequelize, modelName, params) => {
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