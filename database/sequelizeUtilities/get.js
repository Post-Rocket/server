const { Sequelize, Model } = require("sequelize");
const {
  fixAttributes,
  fixWhere,
  fixOrder,
  fixInclude
} = require("./misc/fix");

// Helper function to get a row with certain attributes from a model in a sequelized database.
const get = async (sequelize, modelName, params) => {
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
  let {
    where,
    attribute,
    attributes = attribute,
    include,
    limit,
    plain = true,
    order,
    findOrCreate,
    create = findOrCreate,
    findAndCountAll,
    countAll = findAndCountAll,
    addPrimaryKeys,
    findAll,
    ...other
  } = params;

  // Check if model exists.
  const model = sequelize.models[modelName];
  if (!model) {
    const e = Error(`Missing model ${modelName}`);
    typeof sequelize.config.logError === "function" && sequelize.config.logError(e);
    throw e;
  }

  // Get data.
  let data = await model[
    create && "findOrCreate"
      || (countAll && "findAndCountAll")
      || ((findAll || limit > 1) && "findAll")
      || "findOne"
  ]({
    where: fixWhere(where),
    attributes: attributes = fixAttributes(attributes, model, addPrimaryKeys),
    include: fixInclude(include, model, sequelize, addPrimaryKeys),
    order: fixOrder(order),
    limit,
    plain,
    ...other
  });

  // In case data was called with create = true (i.e findOrCreate).
  if (create) {
    const created = data[1];
    data = data[0];
    let values, previousValues = data._previousDataValues;
    if (plain) {
      values = data;
      data.created = created;
    } else (values = data.dataValues).created = created;

    // Normalize undefined values with null if created, to be consistent
    // with a normal GET request.
    if (created) {
      for (let i = 0, l = (attributes || []).length; i !== l; ++i) {
        const attribute = attributes[i];
        previousValues.hasOwnProperty(attribute)
          && values[attribute] === undefined
          && (values[attribute] = null);
      }
    }
    return data;
  }

  return data;
}

// Export.
module.exports = Object.freeze(Object.defineProperty(get, "get", {
  value: get
}));