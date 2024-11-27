// Helper function to kebab case a string.
const toKebabCase = (str, sep = '-', removeHeadSep, removeTrailSep) => {
  let output = '', tl = str.length;
  for (let i = 0, l = tl; i !== l; ++i) {
    const c = str.charCodeAt(i);
    ((c < 65 || c > 122 || (c > 90 && c < 97)) && (output += sep))
      || (c >= 65 && c <= 90 && (output += sep + String.fromCharCode(c + 32)))
      || (output += String.fromCharCode(c))
  }
  let i = 0, j = output.length, ol = j, l;
  for (l = Math.min(removeHeadSep || 0, tl); i !== l && output.charAt(i) === sep; ++i);
  for (l = tl - Math.min(removeTrailSep || 0, tl); j > l && output.charAt(--j) === sep;);
  return (i || j < ol) && output.slice(i, j + 1) || output;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(toKebabCase, 'toKebabCase', {
  value: toKebabCase
}));