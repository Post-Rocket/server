module.exports = {
  ...require('./DatabaseSchema'),
  ...require('./DataTypes'),
  ...require('./migrate'),
  ...require('./utilities/normalizeModel'),
  ...require('./Sql')
};