const { Client } = require("node-scp");
const Path = require("path");
const getParams = require("./getParams");

const deploy = async (input, params, out) => {
  try {
    // If only one input for everything.
    if (!params) {
      try {
        typeof input === "string" && (
          params = require(input),
          input = params.dir || params.inputDir || params.in || params.input || params.files || params.filename || params.path || params.directory || params.folder,
          out = params.out || params.output || params.outputDir || params.outputFolder || params.outputPath || params.outputDirectory
        );
      } catch {}
      try {
        typeof input === "object" && input && !Array.isArray(input) && (
          params = input,
          input = params.dir || params.inputDir || params.files || params.filename || params.in || params.input || params.path || params.directory || params.folder,
          out = params.out || params.output || params.outputDir || params.outputFolder || params.outputPath || params.outputDirectory
        );
      } catch {}
    }

    // Normalize input. Load connection file if necessary.
    params = getParams(params);

    // Get input directory if not yet.
    params && !input && typeof params === "object" && (
      input = params.dir || params.inputDir || params.in || params.input || params.files || params.filename || params.path || params.directory || params.folder
    );
    delete params.dir;
    delete params.inputDir;
    delete params.in;
    delete params.input;
    delete params.files;
    delete params.filename;
    input === params.path && delete params.path;
    delete params.directory;
    delete params.folder;

    // Get output directory if not yet.
    params && !out && typeof params === "object" && (
      out = params.out || params.output || params.outputDir || params.outputFolder || params.outputPath || params.outputDirectory
    );
    delete params.out;
    delete params.output;
    delete params.outputDir;
    delete params.outputFolder;
    delete params.outputPath;
    delete params.outputDirectory;

    // Check if we have the necessary info for connection.
    if (!input) {
      throw Error(`Missing input directory or file(s)`);
    }

    Array.isArray(input) || (input = [input]);
    
    // Connect.
    const client = await Client(params);
    console.log("🖥️  Connected to server instance.");

    for (let i = 0, l = input.length, f, o; i !== l; ++i) {
      f = input[i];
      Array.isArray(f) && (
        f = f[0],
        o = f[1]
      );
      o || (o = Path.basename(f));
      out && (o = Path.join(out, f || ""));

      // Clean directory.
      const d = Path.dirname(o);
      try {
        await client.rmdir(d);
      } catch {};

      // Try to create directory.
      try {
        await client.mkdir(
          d
          // attributes?: InputAttributes
        );
      } catch {};

      // Upload data.
      console.log(`📁  Loading: ${f}`);
      if (fs.lstatSync(f).isDirectory()) {
        await client.uploadDir(
          f,
          o
          // options?: TransferOptions
        );
      } else {
        await client.uploadFile(
          f,
          o
          // options?: TransferOptions
        );
      }
      console.log(`✅  Loaded ${o}`);
    }

    // Close connection.
    client.close();
    console.log("✅  Connection closed");
  } catch (e) {
    console.error(e);
  }
}

// Export.
module.exports = Object.freeze(Object.defineProperty(deploy, "deploy", {
  value: deploy
}));