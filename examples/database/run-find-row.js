// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const defineDatabaseSchema = require("../../database/sequelizeUtilities/defineDatabaseSchema");
const find = require("../../database/sequelizeUtilities/find");
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
  console.log("Result:", (await find.all(db, 'User', {
    where: {
      firstname: "William"
    },
  })).dataValues),
  await db.close()
));