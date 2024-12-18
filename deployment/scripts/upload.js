const upload = require("../upload");
const {
  OUTPUT_PATH,
  PARAMS,
  INPUT
} = require("../globals");

// Upload project.
upload(INPUT, PARAMS, OUTPUT_PATH);