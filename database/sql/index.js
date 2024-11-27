module.exports = {
  ...require('./DatabaseTemplate'),
  ...require('./DataTypes'),
  ...require('./migrate'),
  ...require('./utilities/normalizeModel'),
  ...require('./Sql')
};