const upload = require("./upload");
const updateNodeModules = require("./updateNodeModules");

const OUTPUT_PATH = "server",
  PARAMS = "../secrets/dev.json",
  INPUT = [
    "./database",
    "./endpoints",
    "./io",
    "./secrets",
    "./app.js",
    "./package.json"
  ];

// Deploy.
(async () => {
  await upload(INPUT, PARAMS, OUTPUT_PATH);
  await updateNodeModules(PARAMS);
})();