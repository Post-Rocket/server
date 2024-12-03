const { Sequelize } = require("sequelize");

// Helper function to drop models and all cascading ones.
const drop = async (sequelize, ...args) => {
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  args = args.flat(Infinity);
  !args.length && args.push(true);
  args.length && !args[0] && args.pop();
  if (args.length === 1 && args[0] === true) {
    return await sequelize.drop();
  }
  const res = [];
  for (let i = 0, l = args.length; i !== l; ++i) {
    if (sequelize.models[args[i]]) res.push(await sequelize.models[args[i]].drop());
    else res.push(await sequelize.query(`DROP TABLE IF EXISTS ${args[i]} CASCADE`));
  }
  return res;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(drop, "drop", {
  value: drop
}));