// To run: node <this-filename>
const createSequelizedDatabase = require("../sequelizeUtilities/createSequelizedDatabase");
const migrateDatabaseSchema = require("../sequelizeUtilities/migrateDatabaseSchema");
const { database: connection } = require("../../secrets/dev.json");

createSequelizedDatabase({ connection, logging: true }).then(db => (
  migrateDatabaseSchema(
    db,
    { drop: false }, // if true, drop the entire database before migration to clean the db
    ...require("../models"),
  )
));
