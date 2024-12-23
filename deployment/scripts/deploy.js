const clear = require("../clear");
const upload = require("../upload");
const updateNodeModules = require("../updateNodeModules");
const {
  OUTPUT_PATH,
  PARAMS,
  INPUT
} = require("../globals");

// Deploy.
(async () => {
  await clear();
  await upload(INPUT, PARAMS, OUTPUT_PATH);
  await updateNodeModules(PARAMS);
})();