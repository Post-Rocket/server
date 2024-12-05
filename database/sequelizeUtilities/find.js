const { Sequelize, Model } = require("sequelize");
const {
  fixAttributes,
  fixWhere,
  fixOrder,
  fixInclude
} = require("./misc/fix");

// Normalize input, in case for example, we pass the model directly
// instead of the db and the model name.
const normalizeInput = (sequelize, modelName, params) => {
  sequelize instanceof Model && (
    params || (typeof modelName === "object" && (params = modelName)),
    modelName = sequelize.name,
    sequelize = sequelize.sequelize
  );
  modelName instanceof Model && (modelName = modelName.name);

  typeof modelName === "object"
    && modelName
    && !params
    && (params = modelName)
    && (modelName = params.modelName || params.tableName || params.name || params.model || params.table);

  // Check the input database is sequelized.
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  // Check the params are not empty.
  if (!(params && typeof params === "object" && Object.keys(params).length))
    throw Error(`Invalid input params, should be a non-empty object`);

  return [
    sequelize,
    modelName,
    params
  ];
}

// Helper function to get a row with certain attributes from a model in a sequelized database.
const _find = async (sequelize, modelName, params) => {
  // Get params.
  let {
    where,
    attribute,
    attributes = attribute,
    include,
    limit,
    plain,
    order,
    findOrCreate,
    create = findOrCreate,
    findAndCountAll,
    countAll = findAndCountAll,
    addPrimaryKeys,
    findAll,
    dataValues,
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
  const query = {
    where: fixWhere(where),
    attributes: attributes = fixAttributes(attributes, model, addPrimaryKeys),
    include: fixInclude(include, model, sequelize, addPrimaryKeys),
    order: fixOrder(order),
    limit,
    plain,
    ...other
  }, fn = create && "findOrCreate"
    || (countAll && "findAndCountAll")
    || ((findAll || limit > 1) && "findAll")
    || "findOne";
  for (const k in query) {
    query[k] === undefined && (delete query[k]);
  }
  let data = await model[fn](query);

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
    return dataValues && data.dataValues || data;
  }

  return dataValues && data.dataValues || data;
}

const find = async (sequelize, modelName, params) => (
  await _find(...normalizeInput(sequelize, modelName, params))
);

find.all = find.findAll = async (sequelize, modelName, params) => {
  const [_sequelize, _modelName, _params] = normalizeInput(sequelize, modelName, params);
  _params.findAll = true;
  return await _find(_sequelize, _modelName, _params);
}

find.one = find.findOne = async (sequelize, modelName, params) => (
  await _find(...normalizeInput(sequelize, modelName, params))
);

find.orCreate = find.findOrCreate = async (sequelize, modelName, params) => {
  const [_sequelize, _modelName, _params] = normalizeInput(sequelize, modelName, params);
  _params.create = true;
  return await _find(_sequelize, _modelName, _params);
}

find.all.andCount
  = find.andCountAll
  = find.findAndCountAll
  = find.findAllOrCreate
  = async (sequelize, modelName, params) => {
  const [_sequelize, _modelName, _params] = normalizeInput(sequelize, modelName, params);
  _params.countAll = true;
  return await _find(_sequelize, _modelName, _params);
}

// Export.
module.exports = Object.freeze(Object.defineProperty(find, "find", {
  value: find
}));