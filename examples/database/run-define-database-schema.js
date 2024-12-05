// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const defineDatabaseSchema = require("../../database/sequelizeUtilities/defineDatabaseSchema");
const { test: connection } = require("../secrets/dev.json");

createSequelizedDatabase({ connection, logging: true })
.then(async db => (
  defineDatabaseSchema(
    db,
    require("./models/Address.json"),
    require("./models/User.json"),
    require("./models/Product.json"),
    require("./models/User_Adress.json"),
    require("./models/Delivery.json")
  ),
  console.log(db.models),
  await db.close()
));
