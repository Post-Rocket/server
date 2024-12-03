const { Sequelize, Model } = require("sequelize");

// Helper function to drop databases, models and all cascading ones.
const drop = async (sequelize, ...args) => {
  // Normalize input.
  sequelize instanceof Model && (
    args.unshift(sequelize.name),
    sequelize = sequelize.sequelize
  );

  // Check the input database is sequelized.
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  // Normalize args.
  args = args.flat(Infinity);
  !args.length && args.push(true);
  args.length && !args[0] && args.pop();

  // If entire drop.
  if (args.length === 1 && args[0] === true) {
    return await sequelize.drop();
  }

  // If dropping only certain models but not the entire table.
  for (let i = 0, l = args.length, arg; i !== l; ++i) {
    if ((arg = args[i]) instanceof Sequelize || arg instanceof Model) res.push(await arg.drop());
    else if (sequelize.models[arg]) res.push(await sequelize.models[arg].drop());
    else res.push(await sequelize.query(`DROP TABLE IF EXISTS ${arg} CASCADE`));
  }
  return res;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(drop, "drop", {
  value: drop
}));