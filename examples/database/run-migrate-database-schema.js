// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const { test: connection } = require("../secrets/dev.json");

const db = createSequelizedDatabase({ connection });
db.migrateDatabaseSchema(
  { drop: true },
  require("./models/Address.json"),
  require("./models/User.json"),
  require("./models/Product.json"),
  require("./models/User_Adress.json"),
  require("./models/Delivery.json")
);
