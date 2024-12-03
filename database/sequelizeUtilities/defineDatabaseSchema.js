const { Sequelize } = require("sequelize");
const getDatabaseSchema = require("./getDatabaseSchema");

const defineDatabaseSchema = (sequelize, ...input) => {
  if (!(sequelize instanceof Sequelize)) 
    throw `Invalid database input, should be an instance of Sequelize`;

  const { models =[], associations = [] } = getDatabaseSchema(...input), map = new Map;

  // Define models.
  for (let i = 0, l = models.length, m, n; i !== l; ++i) {
    m = sequelize.define(n = (m = models[i]).name, m.fields, m.options);
    map.set(n, m);
  }

  // Define associations.
  for (let i = 0, l = associations.length, a, t, m; i !== l; ++i) {
    t = (a = associations[i]).type;
    m = a.models.map(name => map.get(name));
    if (t === "ONE_TO_ONE") {
      m[0].hasOne(m[1], a.options);
      m[1].belongsTo(m[0]);
    } else if (t === "ONE_TO_MANY") {
      m[0].hasMany(m[1], a.options);
      m[1].belongsTo(m[0]);
    } else {
      t = map.get(a.options.through);
      for (let j = 0, n = m.length; j !== n; ++j) {
        t.belongsTo(m[j]);
        // m[j].hasMany(t, a.options);
        for (let k = j + 1; k !== n; ++k) {
          m[j].belongsToMany(m[k], { through: t });
          m[k].belongsToMany(m[j], { through: t });
        }
      }
    }
  }

  return sequelize;
}


// Exports.
module.exports = Object.freeze(Object.defineProperty(defineDatabaseSchema, 'defineDatabaseSchema', {
  value: defineDatabaseSchema
}));