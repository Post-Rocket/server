// To run: node <this-filename>
const getDatabaseSchema = require("../../database/sequelizeUtils/getDatabaseSchema");
const models = [
  require("./models/Address.json"),
  require("./models/User.json"),
  require("./models/Product.json"),
  require("./models/User_Adress.json"),
  require("./models/Delivery.json"),
];

console.log(getDatabaseSchema(models).toString());
