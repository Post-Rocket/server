// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const defineDatabaseSchema = require("../../database/sequelizeUtilities/defineDatabaseSchema");
const find = require("../../database/sequelizeUtilities/find");
const { test: connection } = require("../secrets/dev.json");

createSequelizedDatabase({ connection, logging: true })
.then(async db => (
  defineDatabaseSchema(
    db,
    ...require("./models")
  ),
  console.log("\nResult:", (await find.all(db, 'User', {
    where: {
      firstname: "William"
    },
    raw: true
  }))),
  await db.close()
));