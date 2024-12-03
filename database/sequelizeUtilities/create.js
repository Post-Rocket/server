const { Sequelize, Model } = require("sequelize");
const {
  fixInclude,
  fixAssociationPropertyKeys
} = require("./misc/fix");

// Helper function to create a row or multiple rows.
const create = async (sequelize, ...args) => {
  // Normalize input, in case we pass the model directly instead of the db and the model name.
  sequelize instanceof Model && (
    args.unshift(sequelize.name),
    sequelize = sequelize.sequelize
  );

  // Check the input database is sequelized.
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  // Normalize input.
  args = args.flat(Infinity);
  const toCreate = {};
  let currentInclude = [], currentModel;

  // Get all the data to create.
  for (let i = 0, l = args.length; i !== l; ++i) {
    const arg = args[i];
    if (arg) {
      if (typeof arg === "string") { // if we specify the next model name to target.
        (currentModel = toCreate[arg]) || (currentModel = toCreate[arg] = []);
        currentInclude = [];
      } else if (arg instanceof Model) { // if we specify the next model name to target.
        (currentModel = toCreate[arg.name]) || (currentModel = toCreate[arg.name] = []);
        currentInclude = [];
      } else if (typeof arg === "object") {
        let {
          table,
          model = table,
          tableName = model,
          modelName = tableName,
          include,
          __include__ = include,
          association,
          ...other
        } = arg;
        modelName instanceof Model && (modelName = modelName.name);
        include && __include__ && include !== __include__ && (other.include = include);
        if (__include__) {
          !Array.isArray(__include__) && (__include__ = [__include__]);
          if (association) {
            for (let i = 0, l = __include__.length; i !== l; ++i) {
              const incl = __include__[i];
              typeof incl === "object" && (incl.association = association)
              || (__include__[i] = { include: incl, association });
            }
          }
        } else if (association) __include__ = [{ association }];

        if (modelName) { // new model targeted
          (currentModel = toCreate[modelName]) || (currentModel = toCreate[modelName] = []);
          (__include__ && Object.keys(arg).length === 2) // Just the model (and include) is mentioned
            && (currentInclude = __include__)
            && (!currentModel.length || (currentModel.__iterate__ = true))
            || (currentModel.push([other, __include__]) // model + object is mentioned
              && __include__ && (currentModel.__iterate__ = true)
            );
        } else { // new object or include, current model
          if (__include__ && Object.keys(arg).length === 1) { // new include
            currentInclude = __include__;
            currentModel.length && (currentModel.__iterate__ = true);
          } else { // new object
            const combinedInclude = currentInclude && __include__ && [...currentInclude, ...__include__]
             || (currentInclude && [...currentInclude])
             || __include__;
            currentModel
              && (!currentModel.length || !__include__ || (currentModel.__iterate__ = true))
              && currentModel.push([other, combinedInclude]);
          }
        }
      }
    }
  }
  
  // Create data for each model.
  for (const modelName in toCreate) {
    const data = toCreate[modelName], model = sequelize.models[modelName];
    // Check if model exists.
    if (!model) {
      const e = Error(`Missing model ${modelName}`);
      typeof sequelize.config.logError === "function" && sequelize.config.logError(e);
      throw e;
    }
    if (data.__iterate__) { // Iterative creation
      delete data.__iterate__;
      for (let i = 0, l = data.length; i !== l; ++i) {
        let [obj, include] = data[i];
        obj = fixAssociationPropertyKeys(obj, model, sequelize);
        include && include.length && await model.create(obj, { include: fixInclude(include, model, sequelize) })
          || await model.create(obj);
      }
    } else if (data.length) { // Bulk creation
      const include = data[0][1];
      for (let i = 0, l = data.length; i !== l; ++i) data[i] = fixAssociationPropertyKeys(data[i][0], model, sequelize);
      include && include.length && await model.bulkCreate(data, { include: fixInclude(include, model, sequelize) })
        || await model.bulkCreate(data);
    }
  }
}

// Export.
module.exports = Object.freeze(Object.defineProperty(create, "create", {
  value: create
}));