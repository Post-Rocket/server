// To run: node <this-filename>
const createSequelizedDatabase = require("../../database/sequelizeUtilities/createSequelizedDatabase");
const defineDatabaseSchema = require("../../database/sequelizeUtilities/defineDatabaseSchema");
const create = require("../../database/sequelizeUtilities/create");
const { test: connection } = require("../secrets/dev.json");

createSequelizedDatabase({ connection, logging: true })
.then(async db => (
  defineDatabaseSchema(
    db,
    ...require("./models")
  ),
  await create(db, 'User', {
    firstname: "William",
    lastname: "Brendel",
    phoneNumber: "4155395322",
    email: "brendel.william@gmail.com",
    verifiedEmail: false
  }, {
    firstname: "John",
    lastname: "Yo",
    verifiedEmail: false
  }, {
    firstname: "Bill",
    lastname: "Murray",
    verifiedEmail: false
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
    userId: 1,
    productId: 1,
    addressId: 1,
    instructions: "Some random delivery",
  }),
  await db.close()
));