const normalizeModel = require('./utilities/normalizeModel');
const DataTypes = require('./DataTypes');

// Default model parameters, in case a parameter is missing or ommited.
const DEFAULT_MODEL_PARAMS = Object.freeze({}); // NOTE: potentially to be changed in the future.

// Class to hold the set off table models in a database.
class DatabaseSchema {
  // Constructor.
  constructor(...databaseSchemas) {
    this.init (...databaseSchemas);
  }

  // Method to initialize a database template.
  init(...databaseSchemas) {
    return this.clean().concat(...databaseSchemas);
  }

  // Method to add models to the database template.
  concat(...databaseSchemas) {
    databaseSchemas = databaseSchemas.flat(Infinity);

    // Get new models.
    for (let i = 0, l = databaseSchemas.length; i !== l; ++i) {
      const models = databaseSchemas[i];

      // Already formatted object.
      if (models instanceof DatabaseSchema || (
        models
        && (typeof models === 'object' || typeof models === 'function')
        && Array.isArray(models.models)
        && Array.isArray(models.oneToOneAssociations)
        && Array.isArray(models.oneToManyAssociations)
        && Array.isArray(models.manyToManyAssociations)
      )) {
        this.models.push(...models.models);
        this.oneToOneAssociations.push(...models.oneToOneAssociations);
        this.oneToManyAssociations.push(...models.oneToManyAssociations);
        this.manyToManyAssociations.push(...models.manyToManyAssociations);
        continue;
      }

      // Add models.
      for (let modelName in models) this.add(modelName, models[modelName]);
    }
    return this;
  }

  // Method to add a model to the database template.
  add(modelName, model) {
    // Association table.
    if (Array.isArray(model)) {
      let [
        modelName1,
        modelName2,
        relationship,
        throughModel
      ] = model,
        r = typeof relationship === 'object' // throughModel was passed as a many to many relationship model
          && (throughModel = relationship || {})
          && 'manytomany'
          || (relationship || '').toLowerCase().replace('1', 'one').replace('2', 'to');

      ((r === 'hasone' || r === 'onetoone') && this.oneToOneAssociations.push([ // one to one
        modelName,
        modelName1,
        modelName2,
        throughModel || getForeignKey(modelName1)
      ])) || ((r === 'belongsto' || r === 'belongstoone') && this.oneToOneAssociations.push([ // one to one (reversed)
        modelName,
        modelName2,
        modelName1,
        throughModel || getForeignKey(modelName2)
      ])) || ((r === 'hasmany' || r === 'onetomany') && this.oneToManyAssociations.push([ // one to many
        modelName,
        modelName1,
        modelName2,
        throughModel || getForeignKey(modelName1)
      ])) || ((r === 'manytoone' || r === 'belongstomany') && this.oneToManyAssociations.push([ // one to many (reversed)
        modelName,
        modelName2,
        modelName1,
        throughModel || getForeignKey(modelName2)
      ])) || (this.models.push(getThroughModel(
        modelName,
        modelName1,
        modelName2,
        throughModel
      )) && this.manyToManyAssociations.push([ // many to many
        modelName,
        modelName1,
        modelName2
      ]));
    } else this.models.push([modelName, ...normalizeModel(model, DEFAULT_MODEL_PARAMS)]); // Regular table

    return this;
  }

  // Method to check typos or missing models in associaion models.
  checkAssociationModels() {
    const modelNames = new Set();
    for (let i = 0, t = this.models, l = t.length; i !== l; ++i) modelNames.add(t[i][0]);

    // Check one to one association table.
    const check = container => {
      for (let i = 0, t = this[container], l = t.length; i !== l; ++i) {
        if (!modelNames.has(t[i][1]))
          throw `ERROR in checkAssociationModels | .${container}: ${t[i][1]} does not exists.`;
  
        if (!modelNames.has(t[i][2]))
          throw `ERROR in checkAssociationModels | .${container}: ${t[i][2]} does not exists.`;
      }
    }
    check('oneToOneAssociations');
    check('oneToManyAssociations');
    check('manyToManyAssociations');
    return this;
  }

  // Method to clean the database template.
  clean() {
    this.models = [];
    this.oneToOneAssociations = [];
    this.oneToManyAssociations = [];
    this.manyToManyAssociations = [];
    return this;
  }
}

// To parse association table relationships.
// xTox -> [true, true]
// strictxTox -> [false, true]
// xTostrictx -> [false, true]
// strictxTostrictx -> [false, false]
// const re1 = /one|1/g,
//   re2 = /one|1|many/g,
// 	re3 = /one|to|1|2|many/g,
// 	re4 = /lazy|null/g;
// const allowNull = str => {
// 	const [a, b, c, d] = (str || '').split(re3);
// 	let [left, right = ''] = [a || b || (c && d) || '', c || d || (a && b) || ''];
// 	left = ((left = left.match(re4)) && left.length) || 0;
// 	right = ((right = right.match(re4)) && right.length) || 0;
// 	return (left && right && [true, true])
// 	|| (left && [true, false])
// 	|| (right && [false, true])
// 	|| [false, false];
// }

// Helper function to get a foreign key.
const getForeignKey = (modelName, suffix = 'Id') => (
  modelName.slice(0, 1).toLowerCase() + modelName.slice(1) + suffix
);

// Helper function to get the default many to many through table.
const getThroughModel = (modelName, modelName1, modelName2, throughModel, suffix = 'Id') => {
  const m = normalizeModel(throughModel || {}, DEFAULT_MODEL_PARAMS);
  m[0] = Object.assign({
    [getForeignKey(modelName1)]: {
      type: DataTypes.INTEGER,
      references: {
        model: modelName1,
        key: suffix
      }
    },
    [getForeignKey(modelName2)]: {
      type: DataTypes.INTEGER,
      references: {
        model: modelName2,
        key: suffix
      }
    }
  }, m[0]);
  return [modelName, ...m];
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(DatabaseSchema, 'DatabaseSchema', {
  value: DatabaseSchema
}));