// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const defineDatabaseSchema = require("../../database/sequelizeUtilities/defineDatabaseSchema");
const getDatabaseSchema = require("../../database/sequelizeUtilities/getDatabaseSchema");
const { test: connection } = require("../secrets/dev.json");

createSequelizedDatabase({ connection, logging: true })
.then(async db => (
  defineDatabaseSchema(
    db,
    ...require("./models")
  ),
  console.log(getDatabaseSchema(db).toString()),
  await db.close()
));
