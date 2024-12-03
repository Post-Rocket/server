const { Sequelize, Model } = require("sequelize");
const {
  fixAttributes,
  fixWhere,
  fixInclude
} = require("./misc/fix");

// Helper function to update a row in a sequelized database.
const update = async (sequelize, modelName, item, params) => {
  // Normalize input, in case we pass the model directly instead of the db and the model name.
  sequelize instanceof Model && (
    params || (typeof item === "object" && (params = item)),
    item || (typeof modelName !== undefined && (item = modelName)),
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
    && !item
    && (item = modelName)
    && (modelName = params.modelName || params.tableName || params.name || params.model || params.table);

  typeof item === "object"
    && item
    && params === undefined
    && (params = { attributes: item.attributes, where: item.where, include: item.include })
    && (delete item.attributes)
    && (delete item.where)
    && (delete item.include);

  // Check if model exists.
  const model = sequelize.models[modelName];
  if (!model) {
    const e = Error(`Missing model ${modelName}`);
    typeof sequelize.config.logError === "function" && sequelize.config.logError(e);
    throw e;
  }

  // Get params.
  let {
    where,
    attributes,
    include,
    create,
    ...other
  } = params || {};

  // In case the third argument is directly the id to update.
  typeof params === "object" || (where = { id: params });

  // In case the id was passed in the object itself and there"s no "where".
  item.id === undefined
    || item.id === null
    || !where
    || (
      where = { id: item.id },
      delete item.id
    );

  // Update params.
  params = other;
  attributes && (params.attributes = fixAttributes(attributes, model));
  where && (params.where = where = fixWhere(where));
  include && (params.include = fixInclude(include, model, sequelize));

  // In case we want to create the object at a specific id if it does not exists.
  if (create) {
    (item.id === undefined || item.id === null)
      && where
      && where.id !== undefined
      && (item.id = where.id);

    return await model.upsert(item, params);
  }
  return await model.update(item, params);
}

// Export.
module.exports = Object.freeze(Object.defineProperty(update, "update", {
  value: update
}));