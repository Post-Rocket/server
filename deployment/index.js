const upload = require("./upload");
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

upload(INPUT, PARAMS, OUTPUT_PATH);