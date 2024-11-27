const toKebabCase = require('./toKebabCase');

// Helper function to decamelize a string.
const decamelize = (str, removeHeadSep = Infinity, removeTrailSep = Infinity) => (
  toKebabCase(str, '_', removeHeadSep, removeTrailSep)
);

// Exports.
module.exports = Object.freeze(Object.defineProperty(decamelize, 'decamelize', {
  value: decamelize
}));