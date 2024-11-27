const normalizeModel = require('./utilities/normalizeModel');
const DataTypes = require('./DataTypes');

// Default model parameters, in case a parameter is missing or ommited.
const DEFAULT_MODEL_PARAMS = {}; // NOTE: potentially to be changed in the future.

// Class to hold the set off table models in a database.
class DatabaseTemplate {
  // Constructor.
  constructor(...databaseTemplates) {
    this.init (...databaseTemplates);
  }

  // Method to initialize a database template.
  init(...databaseTemplates) {
    return this.clean().concat(...databaseTemplates);
  }

  // Method to add models to the database template.
  concat(...databaseTemplates) {
    databaseTemplates = databaseTemplates.flat(Infinity);

    // Get new models.
    for (let i = 0, l = databaseTemplates.length; i !== l; ++i) {
      const models = databaseTemplates[i];

      // Already formatted object.
      if (models instanceof DatabaseTemplate || (
        models
        && (typeof models === 'object' || typeof models === 'function')
        && Array.isArray(models.tables)
        && Array.isArray(models.oneToOneAssociations)
        && Array.isArray(models.oneToManyAssociations)
        && Array.isArray(models.manyToManyAssociations)
      )) {
        this.tables.push(...models.tables);
        this.oneToOneAssociations.push(...models.oneToOneAssociations);
        this.oneToManyAssociations.push(...models.oneToManyAssociations);
        this.manyToManyAssociations.push(...models.manyToManyAssociations);
        continue;
      }

      // Add models.
      for (let tableName in models) this.add(tableName, models[tableName]);
    }
    return this;
  }

  // Method to add a model to the database template.
  add(tableName, model) {
    // Association table.
    if (Array.isArray(model)) {
      let [
        tableName1,
        tableName2,
        relationship,
        throughTableModel
      ] = model,
        r = typeof relationship === 'object' // throughTableModel was passed as a many to many relationship model
          && (throughTableModel = relationship || {})
          && 'manytomany'
          || (relationship || '').toLowerCase().replace('1', 'one').replace('2', 'to');

      ((r === 'hasone' || r === 'onetoone') && this.oneToOneAssociations.push([ // one to one
        tableName,
        tableName1,
        tableName2,
        throughTableModel || getForeignKey(tableName1)
      ])) || ((r === 'belongsto' || r === 'belongstoone') && this.oneToOneAssociations.push([ // one to one (reversed)
        tableName,
        tableName2,
        tableName1,
        throughTableModel || getForeignKey(tableName2)
      ])) || ((r === 'hasmany' || r === 'onetomany') && this.oneToManyAssociations.push([ // one to many
        tableName,
        tableName1,
        tableName2,
        throughTableModel || getForeignKey(tableName1)
      ])) || ((r === 'manytoone' || r === 'belongstomany') && this.oneToManyAssociations.push([ // one to many (reversed)
        tableName,
        tableName2,
        tableName1,
        throughTableModel || getForeignKey(tableName2)
      ])) || (this.tables.push(getThroughModel(
        tableName,
        tableName1,
        tableName2,
        throughTableModel
      )) && this.manyToManyAssociations.push([ // many to many
        tableName,
        tableName1,
        tableName2
      ]));
    } else this.tables.push([tableName, ...normalizeModel(model, DEFAULT_MODEL_PARAMS)]); // Regular table

    return this;
  }

  // Method to check typos or missing tables in associaion tables.
  checkAssociationTables() {
    const tableNames = new Set();
    for (let i = 0, t = this.tables, l = t.length; i !== l; ++i) tableNames.add(t[i][0]);

    // Check one to one association table.
    const check = container => {
      for (let i = 0, t = this[container], l = t.length; i !== l; ++i) {
        if (!tableNames.has(t[i][1]))
          throw `ERROR in checkAssociationTables | .${container}: ${t[i][1]} does not exists.`;
  
        if (!tableNames.has(t[i][2]))
          throw `ERROR in checkAssociationTables | .${container}: ${t[i][2]} does not exists.`;
      }
    }
    check('oneToOneAssociations');
    check('oneToManyAssociations');
    check('manyToManyAssociations');
    return this;
  }

  // Method to clean the database template.
  clean() {
    this.tables = [];
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
const getForeignKey = (tableName, suffix = 'Id') => (
  tableName.slice(0, 1).toLowerCase() + tableName.slice(1) + suffix
);

// Helper function to get the default many to many through table.
const getThroughModel = (tableName, tableName1, tableName2, throughTableModel, suffix = 'Id') => {
  const m = normalizeModel(throughTableModel || {}, DEFAULT_MODEL_PARAMS);
  m[0] = Object.assign({
    [getForeignKey(tableName1)]: {
      type: DataTypes.INTEGER,
      references: {
        model: tableName1,
        key: suffix
      }
    },
    [getForeignKey(tableName2)]: {
      type: DataTypes.INTEGER,
      references: {
        model: tableName2,
        key: suffix
      }
    }
  }, m[0]);
  return [tableName, ...m];
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(DatabaseTemplate, 'DatabaseTemplate', {
  value: DatabaseTemplate
}));