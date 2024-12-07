// To run: node <this-filename>
const getDatabaseSchema = require("../../database/sequelizeUtilities/getDatabaseSchema");
const models = [
  ...require("./models")
];

console.log(getDatabaseSchema(models).toString());
