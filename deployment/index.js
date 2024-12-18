const deploy = require("./deploy");
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

deploy(INPUT, PARAMS, OUTPUT_PATH);