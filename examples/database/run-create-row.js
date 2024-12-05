// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const defineDatabaseSchema = require("../../database/sequelizeUtilities/defineDatabaseSchema");
const create = require("../../database/sequelizeUtilities/create");
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
  await create(db, 'User', {
    firstname: "William",
    lastname: "Brendel",
    phoneNumber: "4155395322",
    email: "brendel.william@gmail.com",
    verifiedEmail: false
  }, {
    firstname: "John",
    lastname: "Yo"
  }, {
    firstname: "Bill",
    lastname: "Murray"
  }),
  await create(db, 'Address', {
    street: "1635 Trailhead dr.",
    city: "Reno",
    state: "NV",
  }),
  await create(db, 'Product', {
    name: "Some Shit",
    description: "Some random product",
    sku: "1234567890",
  }),
  await create(db, 'Delivery', {
    name: "Some Shit",
    description: "Some random product",
    sku: "1234567890",
  }),
  await db.close()
));