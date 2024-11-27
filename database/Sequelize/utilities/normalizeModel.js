const DataTypes = require('../DataTypes');
const decamelize = require('./decamelize');

// Hlper function to normalize a table model.
const normalizeModel = (model, defaultParams) => {
  // Get model params.
  defaultParams || (defaultParams = {});
  let {
    timestamps = defaultParams.timestamps,
    updatedAt = defaultParams.updatedAt,
    createdAt = defaultParams.createdAt,
    index = defaultParams.index || defaultParams.indices || defaultParams.indexes,
    indices = index,
    indexes = indices,
    paranoid,
    deletedAt,
    ...sequelizeModel
  } = model || {};

  // Normalize model attribute types.
  for (const key in sequelizeModel) {
    (sequelizeModel[key] = DataTypes.get(sequelizeModel[key])) || (delete sequelizeModel[key]);
  }

  // Normalize indexes.
  let j = 0;
  Array.isArray(indexes) || (indexes !== undefined && (indexes = [indexes]));
  for (let i = 0, l = (indexes || []).length; i !== l; ++i) {
    const name = indexes[i];
    (typeof name === 'string' || (typeof name === 'number' && Math.floor(name) === name))
      && sequelizeModel[name]
      && (indexes[j] = {
        name,
        fields: [decamelize(name)]
      })
      && (sequelizeModel[name] === DataTypes.TEXT
        && (indexes[j++].type = 'FULLTEXT')
        || (indexes[j++].using = 'BTREE')
      )
    || (name && typeof name === 'object' && sequelizeModel[name.name || ''] && (indexes[j++] = name));
  }
  j && (indexes.length = j) || (indexes = undefined);

  // Get params.
  const params = {};
  timestamps !== undefined && (params.timestamps = timestamps);
  updatedAt !== undefined && (params.updatedAt = updatedAt);
  createdAt !== undefined && (params.createdAt = createdAt);
  paranoid !== undefined && (params.paranoid = paranoid);
  deletedAt !== undefined && (params.deletedAt = deletedAt);
  indexes !== undefined && (params.indexes = indexes);

  // Dissociate model keys from param keys.
  return [sequelizeModel, params];
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(normalizeModel, 'normalizeModel', {
  value: normalizeModel
}));