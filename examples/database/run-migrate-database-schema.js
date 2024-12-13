// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const migrateDatabaseSchema = require("../../database/sequelizeUtilities/migrateDatabaseSchema");
const { test: connection } = require("../secrets/dev.json");

createSequelizedDatabase({ connection, logging: true }).then(db => (
  migrateDatabaseSchema(
    db,
    { drop: true }, // if true, drop the entire database before migration to clean the db
    ...require("./models")
  )
));
