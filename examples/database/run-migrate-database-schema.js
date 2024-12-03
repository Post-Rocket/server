// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const migrateDatabaseSchema = require("../../database/sequelizeUtilities/migrateDatabaseSchema");
const { test: connection } = require("../secrets/dev.json");

const db = createSequelizedDatabase({ connection });
migrateDatabaseSchema(
  db,
  { drop: true }, // drop the entire database before migration
  require("./models/Address.json"),
  require("./models/User.json"),
  require("./models/Product.json"),
  require("./models/User_Adress.json"),
  require("./models/Delivery.json")
);
