const { DataTypes: _DataTypes } = require('sequelize');

// Keep object reference if possible.
const DataTypes = require('./utilities/extendObject')(_DataTypes);

const ABSTRACT = _DataTypes.ABSTRACT;

// Extend data types with short cuts.
DataTypes.INT = DataTypes.INTEGER;
DataTypes.STR = DataTypes.STRING;
DataTypes.BOOL = DataTypes.BOOLEAN;
DataTypes.TXT = DataTypes.TEXT;
DataTypes.ARR = DataTypes.ARRAY;
DataTypes.OBJECT = DataTypes.JSON;
DataTypes.OBJ = DataTypes.OBJECT;

// Helper functions to get a data type.
DataTypes.get = DataTypes.getDataType = normalizeType = input => {
  const type = typeof input;
  let output;
  ((type === 'object' || type === 'function') && (
    input && (
      ((input.prototype instanceof ABSTRACT || input instanceof ABSTRACT) && (output = input))
        || ((input === Date || input.prototype instanceof Date || input instanceof Date) && (output = DataTypes.DATE))
        || ((input === String || input.prototype instanceof String || input instanceof String) && (output = DataTypes.TEXT))
        || ((input === Number || input.prototype instanceof Number || input instanceof Number) && (output = DataTypes.NUMBER))
        || ((input === Boolean || input.prototype instanceof Boolean || input instanceof Boolean) && (output = DataTypes.BOOLEAN))
        || ((input === Array || input.prototype instanceof Array || input instanceof Array || Array.isArray(input)) && (output = DataTypes.ARRAY))
        || type === 'function'
        || (input.type !== undefined && (output = {...input, type: normalizeType(input.type)}))
      ) || (output = DataTypes.JSON))
  ) || (type === 'string' && (output = DataTypes[input.toUpperCase()] || DataTypes.TEXT))
    || (type === 'number' && (output = Math.floor(input) === input && DataTypes.INTEGER || DataTypes.FLOAT))
    || (type === 'boolean' && (output = DataTypes.BOOLEAN));
  return output;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(DataTypes, 'DataTypes', {
  value: DataTypes
}));