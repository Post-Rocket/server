const { Op: _Op} = require("sequelize");

// Keep object reference if possible.
const Op = require("./utilities/extendObject")(_Op);

// Adding few short cuts.
Op["&"] = Op["&&"] = Op.and;
Op["|"] = Op["||"] = Op.or;
Op["!"] = Op["^"] = Op["~"] = Op["<>"] = Op.not;
Op["="] = Op["=="] = Op["==="]= Op["!!"] = Op.eq;
Op["!="] = Op["!=="] = Op.ne;
Op["<"] = Op.lessThan = Op.lt;
Op[">"] = Op.greaterThan = Op.gt;
Op["<="] = Op.lessOrEqualThan = Op.lte;
Op[">="] = Op.greaterOrEqualThan = Op.gte;

// Normalize access.
for (let key in Op) {
  const newK = key.toLowerCase().replace(/\-\_/g, "");
  Op[newK] || (Op[newK] = Op[key]);
}

// Helper function to normalize input operand.
const re1 = /[\!\^\~]|\<\>/g, re2 = /\!(\!\!)+/g, re3 = /(\!\!|\=)+/g;
const normalize = Op.normalize = op => (
  (op || "").toLowerCase().replace(re1, "!").replace(re2, "!").replace(re3, "=")
);

// Helper function to get and operand
Op.get = op => Op[op] || Op[normalize(op)];

// Exports.
module.exports = Object.freeze(Object.defineProperty(Op, "Op", {
  value: Op
}));