const getFilenames = require("./getFilenames");

// Helper function to require files in a dir ectory.
const requireFiles = (dir, options = { reject: console.error }) => {
  // Normalize input.
  dir && typeof dir === "object" && (
    options = Object.assign({}, dir, options || {}),
    dir = dir.dir
  ) || options || (options = {});
  const reject = typeof options === "function" && options || options.reject;
  const {
    modifiedTime,
    blacklist,
    extensions
  } = options;
  
  // Require files.
	const filenames = getFilenames(
    dir,
    modifiedTime,
    blacklist,
    extensions
  ), output = [];
	for (const filename of filenames) {
    let out;
		try { out = require(filename); }
		catch (e) {
      try {
        out = require(Path.join(dir, filename));
      } catch (e) { 
        try {
          out = require(Path.join("./", filename));
        } catch (e) {
          reject && reject(Error(filename, e));
          continue;
        }
      }
      out && output.push(out);
    }
  }
  return output;
}

// Export.
module.exports = Object.freeze(Object.defineProperty(requireFiles, "requireFiles", {
  value: requireFiles
}));