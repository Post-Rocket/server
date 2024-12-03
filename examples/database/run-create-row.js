// To run: node <this-filename>
const create = require("../../database/sequelizeUtilities/create");
const { test: connection } = require("../secrets/dev.json");

const db = createSequelizedDatabase({ connection });
create(db, 'User', {
  phoneNumber: "4155395322",
  email: "brendel.william@gmail.com",
  verifiedEmail: false,
  firstname: "William",
  lastname: "Brendel"
}).then(() => db.close());