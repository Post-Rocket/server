// Helper function to camel case a string.
const toCamelCase = (str, sep = '') => {
  let output = '', flag = false;
  for (let i = 0, l = str.length; i !== l; ++i) {
    const c = str.charAt(i);
    ((c < 'A' || c > 'z' || (c > 'Z' && c < 'a')) && (flag = true))
    || (!flag && (output += c))
    || ((output += sep + c.toUpperCase()) && (flag = false))
  }
  return output;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(toCamelCase, 'toCamelCase', {
  value: toCamelCase
}));