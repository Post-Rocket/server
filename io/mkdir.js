const fs = require("fs");
const Path = require("path");
const { PLATFORM } = require("./globals");

// Helper function to create a folder and sub folders.
const _mkdir = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    if (!fs.existsSync(dir)) {
      const err = `"${dir}" does not exist and cannot be created!`;
      console.error(Error(err));
      throw err;
    }
  }
  return dir;
}

const PATH_SEP = (PLATFORM.startsWith("win") && "\\") || "/";
const SEP_REGEXP = new RegExp("\\" + PATH_SEP, "g");
const mkdir = (dir, normalizePath = true) => {
  normalizePath && (dir = Path.normalize(dir));
  const folders = dir.split(SEP_REGEXP).filter(f => f && f.charAt(0) !== ".");
  let folder = "";
  for (let i = 0; i !== folders.length; ++i) {
    (folder || dir.charAt(0) === PATH_SEP) && (folder += PATH_SEP);
    folder += folders[i];
    _mkdir(folder, false);
  }
  return dir;
}

// Helper function to create the folders along the Path.
mkdir.fromFilename = (filename, normalizePath = true) => {
  normalizePath && (filename = Path.normalize(filename));
  mkdir(Path.dirname(filename, false));
  return filename;
}

// Export.
module.exports = Object.freeze(Object.defineProperty(mkdir, "mkdir", {
  value: mkdir
}));